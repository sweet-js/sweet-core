import { enforestExpr, Enforester } from "./enforester";
import { List } from "immutable";
import { assert } from "./errors";
import { identity, pipe, bind, is, isNil, complement, and, curry, __, cond, T, both, either, where, whereEq, equals } from "ramda";
import { Maybe } from 'ramda-fantasy';
import { readFileSync } from 'fs';
import Reader from "./shift-reader";
import resolve from 'resolve';
import Env from "./env";
import BindingMap from "./binding-map.js";
import TermExpander from "./term-expander.js";

import { gensym } from "./symbol";
import { Scope, freshScope } from "./scope";
import Term, {
  isEOF, isBindingIdentifier, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport
} from "./terms";
import Syntax, {makeString, makeIdentifier} from "./syntax";
import { serializer, makeDeserializer } from "./serializer";
import {
  VarBindingTransform,
  CompiletimeTransform
} from "./transforms";

import { transform } from "babel-core";
import ParseReducer from "./parse-reducer";
import codegen from "shift-codegen";

import * as convert from "shift-spidermonkey-converter";

import reducer, { MonoidalReducer } from "shift-reducer";

const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

// TODO: fix default import fail
let reduce = reducer.default;

// indirect eval so in the global scope
let geval = eval;

let loadedModules = new Map();

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
  [where({binding: isBindingIdentifier}), curry(({binding, init}, te, context, env) => {
    // finish the expansion early for the initialization
    let initValue = loadForCompiletime(te.expand(init), context);

    env.set(binding.name.resolve(), new CompiletimeTransform(initValue));
  })],
  [T, _ => assert(false, "not implemented yet")]
]);

function resolveModulePath(path, cwd) {
  return resolve.sync(path, { basedir: cwd });
}

// ... -> { body: [Term], importEntries: [Import], exportEntries: [Export] }
function loadModule(modulePath, context) {
  let path = resolveModulePath(modulePath, context.cwd);
  if (!loadedModules.has(path)) {
    let modStr = readFileSync(path, 'utf8');
    let reader = new Reader(modStr);
    let stxl = reader.read();
    let terms = expandTokens(stxl, {
      env: new Env(),
      store: new Env(),
      bindings: new BindingMap()
    });
    let importEntries = [];
    let exportEntries = [];
    terms.forEach(t => {
      cond([
        [isImport, t => importEntries.push(t)],
        [isExport, t => exportEntries.push(t)]
      ])(t);
    });
    loadedModules.set(path, {
      moduleSpecifier: path,
      body: terms,
      importEntries: List(importEntries),
      exportEntries: List(exportEntries)
    });
  }
  return loadedModules.get(path);
}

// (Module) -> Context
function visit(module, context) {
  module.exportEntries.forEach(ex => {
    if (isSyntaxDeclaration(ex.declaration.declaration)) {
      ex.declaration.declaration.declarators.forEach(loadSyntax(__, new TermExpander(context), context, context.store));
    }
  });
  return context;
}

function findNameInExports(name, exp) {
  let foundNames = exp.reduce((acc, e) => {
    if (e.declaration) {
      return acc.concat(e.declaration.declaration.declarators.reduce((acc, decl) => {
        if (decl.binding.name.val() === name.val()) {
          return acc.concat(decl.binding.name);
        }
        return acc;
      }, List()));
    }
    return acc;
  }, List());
  assert(foundNames.size <= 1, 'expecting no more than 1 matching name in exports');
  return foundNames.get(0);
}


function bindImports(impTerm, exModule, context) {
  impTerm.namedImports.forEach(specifier => {
    let name = specifier.binding.name;
    let exportName = findNameInExports(name, exModule.exportEntries);
    if (exportName != null) {
      let newBinding = gensym(name.val());
      context.bindings.addForward(name, exportName, newBinding);
    }
    // // TODO: better error
    // throw 'imported binding ' + name.val() + ' not found in exports of module' + exModule.moduleSpecifier;

  });
}

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
            term.declaration.declarators.forEach(loadSyntax(__, new TermExpander(context), context, context.env));
            // do not add syntax declarations to the result
            return Nothing();
          }
          return Just(term);
        }],
        [isFunctionWithName, (term) => {
          registerBindings(term.name, context);
          return Just(term);
        }],
        [isImport, impTerm => {
          let mod = loadModule(impTerm.moduleSpecifier, context);
          context = visit(mod, context);
          bindImports(impTerm, mod, context);
          return Just(impTerm);
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

// export default class TokenExpander {
//   constructor(stxl, context) {
//     this.stxl = stxl;
//     this.context = context;
//   }
//
//   expand() {
//     let scope = freshScope("top");
//     this.context.currentScope = scope;
//     let terms = this.expandTokens(this.stxl.map(s => s.addScope(scope, this.context.bindings)), this.context);
//     let te = new TermExpander(this.context);
//     return terms.map(t => te.expand(t));
//   }
//
//   expandTokens() {
//     let result = List();
//     if (this.stxl.size === 0) {
//       return result;
//     }
//     let prev = List();
//     let enf = new Enforester(this.stxl, prev, this.context);
//     while (!enf.done) {
//
//       let term = pipe(
//         bind(enf.enforest, enf),
//         cond([
//           [isVariableDeclarationStatement, (term) => {
//             // first, remove the use scope from each binding
//             term.declaration.declarators = term.declaration.declarators.map(decl => {
//               return new Term('VariableDeclarator', {
//                 binding: removeScope(decl.binding, this.context.useScope),
//                 init: decl.init
//               });
//             });
//             // second, add each binding to the environment
//             term.declaration.declarators.forEach(decl => registerBindings(decl.binding, this.context));
//             // then, for syntax declarations we need to load the compiletime value into the
//             // environment
//             if (isSyntaxDeclaration(term.declaration)) {
//               term.declaration.declarators.forEach(loadSyntax(__, new TermExpander(this.context), this.context, this.context.env));
//               // do not add syntax declarations to the result
//               return Nothing();
//             }
//             return Just(term);
//           }],
//           [isFunctionWithName, (term) => {
//             registerBindings(term.name, this.context);
//             return Just(term);
//           }],
//           [isImport, impTerm => {
//             let mod = loadModule(impTerm.moduleSpecifier, this.context);
//             this.context = visit(mod, this.context);
//             bindImports(impTerm, mod, this.context);
//             return Just(impTerm);
//           }],
//           [isEOF, Nothing],
//           [T, Just]
//         ]),
//         Maybe.maybe(List(), identity)
//       )();
//
//       result = result.concat(term);
//     }
//     return result;
//   }
// }

export default function expand(stxl, context) {
  let scope = freshScope("top");
  context.currentScope = scope;
  let terms = expandTokens(stxl.map(s => s.addScope(scope, context.bindings)), context);
  let te = new TermExpander(context);
  return terms.map(t => te.expand(t));
}
