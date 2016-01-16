import { List } from 'immutable';
import { enforestExpr, Enforester } from "./enforester";
import TermExpander from "./term-expander.js";
import BindingMap from "./binding-map.js";
import Env from "./env";
import resolve from 'resolve';
import Reader from "./shift-reader";
import { readFileSync } from 'fs';
import * as _ from "ramda";
import Term, {
  isEOF, isBindingIdentifier, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport
} from "./terms";
import { Maybe } from 'ramda-fantasy';
import reducer, { MonoidalReducer } from "shift-reducer";
import { gensym } from './symbol';
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import { makeDeserializer } from './serializer';
import ParseReducer from './parse-reducer.js';
import Syntax, {makeString, makeIdentifier} from "./syntax";
import codegen from 'shift-codegen';
import { transform } from "babel-core";
import { expect, assert } from "./errors";


const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

// indirect eval so in the global scope
let geval = eval;

let registerBindings = _.cond([
  [isBindingIdentifier, ({name}, context) => {
    let newBinding = gensym(name.val());
    context.env.set(newBinding.toString(), new VarBindingTransform(name));
    context.bindings.add(name, newBinding);
  }],
  [_.T, _ => assert(false, "not implemented yet")]
]);

let removeScope = _.cond([
  [isBindingIdentifier, ({name}, scope) => new Term('BindingIdentifier', {
      name: name.removeScope(scope)
  })],
  [_.T, _ => assert(false, "not implemented yet")]
]);

let loadSyntax = _.cond([
  [_.where({binding: isBindingIdentifier}), _.curry(({binding, init}, te, context, env) => {
    // finish the expansion early for the initialization
    let initValue = loadForCompiletime(te.expand(init), context);

    env.set(binding.name.resolve(), new CompiletimeTransform(initValue));
  })],
  [_.T, _ => assert(false, "not implemented yet")]
]);

class ModuleLoader {
  constructor(context) {
    this.context = context;
    this.loadedModules = new Map();
  }

  // ... -> { body: [Term], importEntries: [Import], exportEntries: [Export] }
  load(modulePath) {
    let path = this.context.moduleResolver(modulePath, this.context.cwd);
    if (!this.loadedModules.has(path)) {
      let modStr = this.context.moduleLoader(path);
      let reader = new Reader(modStr);
      let stxl = reader.read();
      let tokenExpander = new TokenExpander(_.merge(this.context, {
        env: new Env(),
        store: new Env(),
        bindings: new BindingMap()
      }));
      let terms = tokenExpander.expand(stxl);
      let importEntries = [];
      let exportEntries = [];
      terms.forEach(t => {
        _.cond([
          [isImport, t => importEntries.push(t)],
          [isExport, t => exportEntries.push(t)]
        ])(t);
      });
      this.loadedModules.set(path, {
        moduleSpecifier: path,
        body: terms,
        importEntries: List(importEntries),
        exportEntries: List(exportEntries)
      });
    }
    return this.loadedModules.get(path);
  }
}


// (Module) -> Context
function visit(module, context) {
  module.exportEntries.forEach(ex => {
    if (isSyntaxDeclaration(ex.declaration.declaration)) {
      ex.declaration.declaration.declarators.forEach(loadSyntax(_.__, new TermExpander(context), context, context.store));
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
  let gen = codegen.default(parsed);
  let result = transform(gen);
  return geval(result.code).apply(undefined, sandboxVals);
}


export default class TokenExpander {
  constructor(context) {
    this.context = context;
    this.loader = new ModuleLoader(this.context);
  }

  expand(stxl) {
    let result = List();
    if (stxl.size === 0) {
      return result;
    }
    let prev = List();
    let enf = new Enforester(stxl, prev, this.context);
    while (!enf.done) {

      let term = _.pipe(
        _.bind(enf.enforest, enf),
        _.cond([
          [isVariableDeclarationStatement, (term) => {
            // first, remove the use scope from each binding
            term.declaration.declarators = term.declaration.declarators.map(decl => {
              return new Term('VariableDeclarator', {
                binding: removeScope(decl.binding, this.context.useScope),
                init: decl.init
              });
            });
            // second, add each binding to the environment
            term.declaration.declarators.forEach(decl => registerBindings(decl.binding, this.context));
            // then, for syntax declarations we need to load the compiletime value into the
            // environment
            if (isSyntaxDeclaration(term.declaration)) {
              term.declaration.declarators.forEach(loadSyntax(_.__, new TermExpander(this.context), this.context, this.context.env));
              // do not add syntax declarations to the result
              return Nothing();
            }
            return Just(term);
          }],
          [isFunctionWithName, (term) => {
            registerBindings(term.name, this.context);
            return Just(term);
          }],
          [isImport, impTerm => {
            let mod = this.loader.load(impTerm.moduleSpecifier);
            this.context = visit(mod, this.context);
            bindImports(impTerm, mod, this.context);
            return Just(impTerm);
          }],
          [isEOF, Nothing],
          [_.T, Just]
        ]),
        Maybe.maybe(List(), _.identity)
      )();

      result = result.concat(term);
    }
    return result;
  }
}
