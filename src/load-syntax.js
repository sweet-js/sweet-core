import * as _ from 'ramda';
import TermExpander from './term-expander';
import { List } from 'immutable';
import ParseReducer from './parse-reducer.js';
import reducer, { MonoidalReducer } from "shift-reducer";
import { makeDeserializer } from './serializer';
import Syntax from "./syntax";
import codegen, { FormattedCodeGen } from 'shift-codegen';
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import Term, {
  isEOF, isBindingIdentifier, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport
} from "./terms";
import Reader from './shift-reader';

import { unwrap } from './macro-context';

import { replaceTemplate } from './template-processor';

// indirect eval so in the global scope
let geval = eval;

export function sanitizeReplacementValues(values) {
  if (Array.isArray(values)) {
    return sanitizeReplacementValues(List(values));
  } else if (List.isList(values)) {
    return values.map(sanitizeReplacementValues);
  } else if (values == null) {
    throw new Error("replacement values for syntax template must not be null or undefined");
  } else if (typeof values.next === 'function') {
    return sanitizeReplacementValues(List(values));
  }
  return unwrap(values);
}

// (Expression, Context) -> [function]
function loadForCompiletime(expr, context) {
  let deserializer = makeDeserializer(context.bindings);
  let sandbox = {
    syntaxQuote: function (strings, ...values) {
      let ctx = deserializer.read(_.last(values));
      let reader = new Reader(strings, ctx.context, _.take(values.length - 1, values));
      return reader.read();
    },
    syntaxTemplate: function(str, ...values) {
      return replaceTemplate(deserializer.read(str), sanitizeReplacementValues(values));
    }
  };

  let sandboxKeys = List(Object.keys(sandbox));
  let sandboxVals = sandboxKeys.map(k => sandbox[k]).toArray();

  let parsed = reducer(new ParseReducer(), new Term("Module", {
    directives: List(),
    items: List.of(new Term("ExpressionStatement", {
      expression: new Term("FunctionExpression", {
        isGenerator: false,
        name: null,
        params: new Term("FormalParameters", {
          items: sandboxKeys.map(param => {
            return new Term("BindingIdentifier", {
              name: Syntax.fromIdentifier(param)
            });
          }),
          rest: null
        }),
        body: new Term("FunctionBody", {
          directives: List.of(new Term('Directive', {
            rawValue: 'use strict'
          })),
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
  let gen = codegen(parsed, new FormattedCodeGen);
  let result = context.transform(gen);
  return geval(result.code).apply(undefined, sandboxVals);
}

// function wrapForCompiletime(ast, keys) {
//   // todo: hygiene
//   let params = keys.map(k => new Identifier(k));
//   let body = new ReturnStatement(ast);
//   let fn = new FunctionExpression(null, params, new BlockStatement([body]));
//   return new Program([new ExpressionStatement(fn)]);
// }

const loadSyntax = _.cond([
  [_.where({binding: isBindingIdentifier}), _.curry(({binding, init}, context, env) => {
    // finish the expansion early for the initialization
    let termExpander = new TermExpander(context);
    let initValue = loadForCompiletime(termExpander.expand(init), context);

    env.set(binding.name.resolve(), new CompiletimeTransform(initValue));
  })],
  [_.T, _ => assert(false, "not implemented yet")]
]);

export default loadSyntax;
