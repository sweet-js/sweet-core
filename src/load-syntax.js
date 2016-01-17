import * as _ from 'ramda';
import TermExpander from './term-expander';
import { List } from 'immutable';
import ParseReducer from './parse-reducer.js';
import reducer, { MonoidalReducer } from "shift-reducer";
import { makeDeserializer } from './serializer';
import Syntax, {makeString, makeIdentifier} from "./syntax";
import codegen from 'shift-codegen';
import { transform } from "babel-core";
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import Term, {
  isEOF, isBindingIdentifier, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport
} from "./terms";

// indirect eval so in the global scope
let geval = eval;

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

  let parsed = reducer(new ParseReducer(), new Term("Module", {
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
  let gen = codegen(parsed);
  let result = transform(gen);
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
