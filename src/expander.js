import { enforestExpr, Enforester } from "./enforester";
import { List } from "immutable";
import { assert } from "./errors";

import Scope from "./scope";
import Term from "./terms";
import Syntax, {makeString, makeIdentifier} from "./syntax";
import { serialize, deserialize } from "./serializer";

import {
    CompiletimeTransform
} from "./transforms";

import { transform } from "babel-core";
import reduce from "shift-reducer";
import ParseReducer from "./parse-reducer";
import codegen from "shift-codegen";

import * as convert from "shift-spidermonkey-converter";

// indirect eval so in the global scope
let geval = eval;

function wrapForCompiletime(ast, keys) {
    // todo: hygiene
    let params = keys.map(k => new Identifier(k));
    let body = new ReturnStatement(ast);
    let fn = new FunctionExpression(null, params, new BlockStatement([body]));
    return new Program([new ExpressionStatement(fn)]);
}

// (Expression, Context) -> [function]
function loadForCompiletime(expr, context) {
    let sandbox = {
        syntaxQuote: function(str) {
            return deserialize.read(str);
        }
    };

    let sandboxKeys = List(Object.keys(sandbox));
    let sandboxVals = sandboxKeys.map(k => sandbox[k]).toArray();

    let parsed = reduce.default(new ParseReducer(), new Term("Module", {
        directives: List(),
        items: List.of(new Term("ExpressionStatement", {
            expression: new Term("FunctionExpression", {
                isGenerator: false,
                name: null,
                params: new Term("FormalParameters", {
                    items: sandboxKeys.map(param => {
                        return new Term("BindingIdentifier", {
                            name: makeIdentifier(param)
                        });
                    }),
                    rest: null
                }),
                body: new Term("FunctionBody", {
                    directives: List(),
                    statements: List.of(new Term("ReturnStatement", {
                        expression: expr
                    }))
                })
            })
        }))
    }));

    // TODO: should just pass an AST to babel but the estree converter still
    // needs some work so until then just gen a string
    // let estree = convert.toSpiderMonkey(parsed);
    // let result = transform.fromAst(wrapForCompiletime(estree, sandboxKeys));

    // let result = babel.transform(wrapForCompiletime(estree, sandboxKeys));
    let gen = codegen.default(parsed);
    let result = transform(gen);
    return geval(result.code).apply(undefined, sandboxVals);
}


function expandTokens(stxl, context) {
    let result = List();
    if (stxl.size === 0) {
        return result;
    }
    let prev = List();
    let enf = new Enforester(stxl, prev, context);
    let te = new TermExpander(context);
    let lastTerm = null;
    while (!enf.done) {
        let term = enf.enforest();
        // check for coding mistakes
        assert(term !== null, "enforester returned a null term");
        assert(term !== lastTerm, "enforester is not done but produced same term");
        lastTerm = term;

        if (term.type === 'VariableDeclaration' && term.kind === "syntax") {
            // todo: hygiene
            term.declarators.forEach(decl => {
                // finish the expansion early for the declaration
                let init = te.expand(decl.init);
                let resolvedName = decl.binding.name.resolve();
                let initValue = loadForCompiletime(init, context);

                context.env.set(resolvedName, new CompiletimeTransform(initValue));
            });

            // do not add to the result
            continue;
        }


        // don't need the EOF term in the final AST
        if (term.type === "EOF") {
            break;
        }

        result = result.concat(term);
    }
    return result;
}

class TermExpander {
    constructor(context) {
        this.context = context;
    }
    expand(term) {
        let field = "expand" + term.type;
        if (typeof this[field] === 'function') {
            return this[field](term);
        }
        assert(false, "expand not implemented yet for: " + term.type);
    }

    expandReturnStatement(term) {
        return new Term("ReturnStatement", {
            expression: this.expand(term.expression)
        });
    }
    expandClassDeclaration(term) {
        return term;
    }
    expandThisExpression(term) {
        return term;
    }
    expandSyntaxQuote(term) {
        let id = new Term("IdentifierExpression", {
            name: term.name
        });

        let str = new Term("LiteralStringExpression", {
            value: makeString(serialize.write(term.stx))
        });

        return new Term("CallExpression", {
            callee: id,
            arguments: List.of(str)
        });
    }

    expandStaticMemberExpression(term) {
        return new Term("StaticMemberExpression", {
            object: this.expand(term.object),
            property: term.property
        });
    }

    expandArrayExpression(term) {
        return new Term("ArrayExpression", {
            elements: term.elements.map(t => t == null ? t : this.expand(t))
        });
    }

    expandStaticPropertyName(term) {
        return term;
    }
    expandDataProperty(term) {
        return new Term("DataProperty", {
            name: this.expand(term.name),
            expression: this.expand(term.expression)
        });
    }
    expandObjectExpression(term) {
        return new Term("ObjectExpression", {
            properties: term.properties.map(t => this.expand(t))
        });
    }
    expandVariableDeclarator(term) {
        let init = term.init == null ? null : this.expand(term.init);
        return new Term("VariableDeclarator", {
            binding: term.binding,
            init: init
        });
    }
    expandVariableDeclaration(term) {
        return new Term("VariableDeclaration", {
            kind: term.kind,
            declarators: term.declarators.map(d => this.expand(d))
        });
    }
    expandParenthesizedExpression(term) {
        let enf = new Enforester(term.inner, List(), this.context);
        let t = enf.enforest("expression");
        if (!enf.done || t == null) {
            throw enf.createError(enf.peek(), "unexpected syntax");
        }
        return this.expand(t);
    }
    expandBinaryExpression(term) {
        let left = this.expand(term.left);
        let right = this.expand(term.right);
        return new Term("BinaryExpression", {
            left: left,
            operator: term.operator,
            right: right
        });
    }
    expandCallExpression(term) {
        let callee = this.expand(term.callee);
        let args = expandExpressionList(term.arguments.inner(), this.context);
        return new Term("CallExpression", {
            callee: callee,
            arguments: args
        });
    }
    expandExpressionStatement(term) {
        let child = this.expand(term.expression);
        return new Term("ExpressionStatement", {
            expression: child
        });
    }
    expandFunctionDeclaration(term) {
        // TODO: hygiene
        let bodyTerm = new Term("FunctionBody", {
            directives: List(),
            statements: expand(term.body, this.context)
        });
        return new Term("FunctionDeclaration", {
            name: term.name,
            isGenerator: term.isGenerator,
            params: term.params,
            body: bodyTerm
        });
    }
    expandFunctionExpression(term) {
        // TODO: hygiene
        let scope = new Scope(this.context.bindings, "new");
        let markedBody = term.body.map(b => b.addScope(scope));

        let bodyTerm = new Term("FunctionBody", {
            directives: List(),
            statements: expand(markedBody, this.context)
        });
        return new Term("FunctionExpression", {
            name: term.name,
            isGenerator: term.isGenerator,
            params: term.params,
            body: bodyTerm
        });
    }
    expandAssignmentExpression(term) {
        return new Term("AssignmentExpression", {
            binding: term.binding,
            expression: this.expand(term.expression)
        });
    }
    expandLiteralBooleanExpression(term) { return term; }
    expandLiteralNumericExpression(term) { return term; }
    expandIdentifierExpression(term) { return term; }
    expandLiteralNullExpression(term) { return term; }
    expandLiteralStringExpression(term) { return term; }
    expandLiteralRegExpExpression(term) { return term; }
}

function expandExpressionList(stxl, context) {
    let result = List();
    let prev = List();
    if (stxl.size === 0) { return List(); }
    let enf = new Enforester(stxl, prev, context);
    let lastTerm = null;
    while (!enf.done) {
        let term = enf.enforest("expression");
        if (term == null) {
            throw enf.createError(null, "expecting an expression");
        }
        result = result.concat(term);

        if (!enf.isPunctuator(enf.peek(), ",") && enf.rest.size !== 0) {
            throw enf.createError(enf.peek(), "expecting a comma");
        }
        enf.advance();
    }
    let te = new TermExpander(context);
    return result.map(t => te.expand(t));
}

export default function expand(stxl, context) {
    let terms = expandTokens(stxl, context);
    let te = new TermExpander(context);
    return terms.map(t => te.expand(t));
}
