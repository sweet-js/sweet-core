import { enforestExpr, Enforester } from "./enforester";
import { List } from "immutable";
import { assert } from "./errors";
import ApplyScopeInParamsReducer from "./apply-scope-in-params-reducer";
import { identity, pipe, bind, is, isNil, complement, and, curry, __, cond, T, both, either, where, whereEq, equals } from "ramda";
import { Maybe } from 'ramda-fantasy';

import { gensym } from "./symbol";
import { Scope, freshScope } from "./scope";
import Term, {
  isEOF, isBindingIdentifier, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement
} from "./terms";
import Syntax, {makeString, makeIdentifier} from "./syntax";
import { serializer, makeDeserializer } from "./serializer";

import {
  VarBindingTransform ,
  CompiletimeTransform
} from "./transforms";

import { transform } from "babel-core";
import ParseReducer from "./parse-reducer";
import codegen from "shift-codegen";

import * as convert from "shift-spidermonkey-converter";

import reducer from "shift-reducer";

const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

// TODO: fix default import fail
let reduce = reducer.default;

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
  let deserializer = makeDeserializer(context.bindings);
  let sandbox = {
    syntaxQuote: function (str) {
      return deserializer.read(str);
    }
  };

  let sandboxKeys = List(Object.keys(sandbox));
  let sandboxVals = sandboxKeys.map(k => sandbox[k]).toArray();

  let parsed = reduce(new ParseReducer(), new Term("Module", {
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

let registerBindings = cond([
  [isBindingIdentifier, ({name}, context) => {
    let newBinding = gensym(name.val());
    context.env.set(newBinding.toString(), new VarBindingTransform(name));
    context.bindings.add(name, newBinding);
  }],
  [T, _ => assert(false, "not implemented yet")]
]);

let removeScope = cond([
  [isBindingIdentifier, ({name}, scope) => new Term('BindingIdentifier', {
      name: name.removeScope(scope)
  })],
  [T, _ => assert(false, "not implemented yet")]
]);

let loadSyntax = cond([
  [where({binding: isBindingIdentifier}), curry(({binding, init}, te, context) => {
    // finish the expansion early for the initialization
    let initValue = loadForCompiletime(te.expand(init), context);

    context.env.set(binding.name.resolve(), new CompiletimeTransform(initValue));
  })],
  [T, _ => assert(false, "not implemented yet")]
]);


function expandTokens(stxl, context) {
  let result = List();
  if (stxl.size === 0) {
    return result;
  }
  let prev = List();
  let enf = new Enforester(stxl, prev, context);
  while (!enf.done) {

    let term = pipe(
      bind(enf.enforest, enf),
      cond([
        [isVariableDeclarationStatement, (term) => {
          // first, remove the use scope from each binding
          term.declaration.declarators = term.declaration.declarators.map(decl => {
            return new Term('VariableDeclarator', {
              binding: removeScope(decl.binding, context.useScope),
              init: decl.init
            });
          });
          // second, add each binding to the environment
          term.declaration.declarators.forEach(decl => registerBindings(decl.binding, context));
          // then, for syntax declarations we need to load the compiletime value into the
          // environment
          if (isSyntaxDeclaration(term.declaration)) {
            term.declaration.declarators.forEach(loadSyntax(__, new TermExpander(context), context));
            // do not add syntax declarations to the result
            return Nothing();
          }
          return Just(term);
        }],
        [isFunctionWithName, (term) => {
          registerBindings(term.name, context);
          return Just(term);
        }],
        [isEOF, Nothing],
        [T, Just]
      ]),
      Maybe.maybe(List(), identity)
    )();

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

  expandVariableDeclarationStatement(term) {
    return new Term('VariableDeclarationStatement', {
      declaration: this.expand(term.declaration)
    });
  }
  expandReturnStatement(term) {
    if (term.expression == null) {
      return term;
    }
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
      value: makeString(serializer.write(term.stx))
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

  expandImport(term) {
    return term;
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

  doFunctionExpansion(term, type) {
    let scope = freshScope("fun");
    let markedBody = term.body.map(b => b.addScope(scope, this.context.bindings));
    let red = new ApplyScopeInParamsReducer(scope, this.context);
    let params = reduce(red, term.params);

    let bodyTerm = new Term("FunctionBody", {
      directives: List(),
      statements: expand(markedBody, this.context)
    });

    return new Term(type, {
      name: term.name,
      isGenerator: term.isGenerator,
      params: params,
      body: bodyTerm
    });
  }

  expandFunctionDeclaration(term) {
    return this.doFunctionExpansion(term, "FunctionDeclaration");
  }

  expandFunctionExpression(term) {
    return this.doFunctionExpansion(term, "FunctionExpression");
  }

  expandAssignmentExpression(term) {
    return new Term("AssignmentExpression", {
      binding: term.binding,
      expression: this.expand(term.expression)
    });
  }

  expandEmptyStatement(term) {
    return term;
  }

  expandLiteralBooleanExpression(term) {
    return term;
  }

  expandLiteralNumericExpression(term) {
    return term;
  }

  expandIdentifierExpression(term) {
    let trans = this.context.env.get(term.name.resolve());
    if (trans) {
      return new Term("IdentifierExpression", {
        name: trans.id
      });
    }
    return term;
  }

  expandLiteralNullExpression(term) {
    return term;
  }

  expandLiteralStringExpression(term) {
    return term;
  }

  expandLiteralRegExpExpression(term) {
    return term;
  }
}

function expandExpressionList(stxl, context) {
  let result = List();
  let prev = List();
  if (stxl.size === 0) {
    return List();
  }
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
  let scope = freshScope("top");
  context.currentScope = scope;
  let terms = expandTokens(stxl.map(s => s.addScope(scope, context.bindings)), context);
  let te = new TermExpander(context);
  return terms.map(t => te.expand(t));
}
