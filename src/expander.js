import { enforestExpr, Enforester } from "./enforester";
import { List } from "immutable";
import { assert } from "./errors";

import * as T from "./terms";
import Syntax from "./syntax";

import {
    CompiletimeTransform
} from "./transforms";

import { transform } from "babel";

// indirect eval so in the global scope
let geval = eval;

function wrapForCompiletime(ast, keys) {
    // todo: hygiene
    let params = keys.map(k => new Identifier(k));
    let body = new ReturnStatement(ast);
    let fn = new FunctionExpression(null, params, new BlockStatement([body]));
    return new Program([new ExpressionStatement(fn)]);
}

// (ExpressionTerm, Context) -> [function]
function loadForCompiletime(ast, context) {
    let sandbox = {
        getExpr: function(stxl) {
            return enforestExpr(stxl, context);
        },
        syntaxQuote: function(str) {
            return List(JSON.parse(str)).map(t => {
                let stx = new Syntax(t.stx.token, t.stx.scopeset);
                if (t.stx && t.stx.token && t.stx.token.inner) {
                    return new T.DelimiterTerm(stx);
                }
                return new T.SyntaxTerm(stx);
            });
        }
    };
    let keys = Object.keys(sandbox);
    let sandboxVals = keys.map(k => sandbox[k]);
    let result = transform.fromAst(wrapForCompiletime(ast, keys));
    return geval(result.code).apply(undefined, sandboxVals);
}


function expandTokens(stxl, context) {
    let result = List();
    if (stxl.size === 0) {
        return result;
    }
    let prev = List();
    let enf = new Enforester(stxl, prev, context);
    let lastTerm = null;
    while (!enf.done) {
        let term = enf.enforest();
        // check for coding mistakes
        assert(term !== null, "enforester returned a null term");
        assert(term !== lastTerm, "enforester is not done but produced same term");
        lastTerm = term;

        if (term instanceof T.VariableDeclarationTerm && term.kind === "syntax") {
            // todo: hygiene
            term.declarations.forEach(decl => {
                // finish the expansion early for the declaration
                decl.init = decl.init.expand(context);

                context.env.set(decl.id.resolve(),
                                new CompiletimeTransform(
                                    loadForCompiletime(decl.init.parse(),
                                                       context)));
            });

            // do not add to the result
            continue;
        }


        // don't need the EOF term in the final AST
        if (term instanceof T.EOFTerm) {
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
    // TODO: auto generate this from definition of terms
    expand(term) {
        if (term instanceof T.IdentifierExpressionTerm) {
            return this.expandIdentifierExpression(term);
        }
        if (term instanceof T.ExpressionStatementTerm) {
            return this.expandExpressionStatement(term);
        }
        if (term instanceof T.LiteralNumericExpressionTerm) {
            return this.expandLiteralNumericExpression(term);
        }
        if (term instanceof T.LiteralBooleanExpressionTerm) {
            return this.expandLiteralBooleanExpression(term);
        }
        if (term instanceof T.LiteralNullExpressionTerm) {
            return this.expandLiteralNullExpression(term);
        }
        if (term instanceof T.LiteralStringExpressionTerm) {
            return this.expandLiteralStringExpression(term);
        }
        if (term instanceof T.LiteralRegExpExpressionTerm) {
            return this.expandLiteralRegExpExpression(term);
        }
        if (term instanceof T.CallExpressionTerm) {
            return this.expandCallExpression(term);
        }
        if (term instanceof T.BinaryExpressionTerm) {
            return this.expandBinaryExpression(term);
        }
        if (term instanceof T.ParenthesizedExpressionTerm) {
            return this.expandParenthesiszedExpression(term);
        }
        if (term instanceof T.FunctionExpressionTerm) {
            return this.expandFunctionExpression(term);
        }
        if (term instanceof T.FunctionDeclarationTerm) {
            return this.expandFunctionDeclaration(term);
        }
        if (term instanceof T.VariableDeclarationTerm) {
            return this.expandVariableDeclaration(term);
        }
        if (term instanceof T.VariableDeclaratorTerm) {
            return this.expandVariableDeclarator(term);
        }
        assert(false, "expand not implemented yet for: " + term.type);
    }

    expandVariableDeclarator(term) {
        let init = term.init == null ? null : this.expand(term.init);
        return new T.VariableDeclaratorTerm(term.binding, init);
    }
    expandVariableDeclaration(term) {
        return new T.VariableDeclarationTerm(term.kind, term.declarators.map(d => {
            return this.expand(d);
        }).toArray());
    }
    expandParenthesiszedExpression(term) {
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
        return new T.BinaryExpressionTerm(left, term.operator, right);
    }
    expandCallExpression(term) {
        let callee = this.expand(term.callee);
        let args = expandExpressionList(term.arguments.getSyntax(), this.context);
        return new T.CallExpressionTerm(callee, args);
    }
    expandExpressionStatement(term) {
        let child = this.expand(term.expression);
        return new T.ExpressionStatementTerm(child);
    }
    expandFunctionDeclaration(term) {
        // TODO: hygiene
        let bodyTerm = new T.FunctionBodyTerm(List(), expand(term.body, this.context));
        return new T.FunctionDeclarationTerm(term.name,
                                             false,
                                             term.params,
                                             bodyTerm);
    }
    expandFunctionExpression(term) {
        // TODO: hygiene
        let bodyTerm = new T.FunctionBodyTerm(List(), expand(term.body, this.context));
        return new T.FunctionExpressionTerm(term.name,
                                            false,
                                            term.params,
                                            bodyTerm);
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
