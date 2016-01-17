import { List } from 'immutable';
import { enforestExpr, Enforester } from "./enforester";
import TermExpander from "./term-expander.js";
import BindingMap from "./binding-map.js";
import Env from "./env";
import resolve from 'resolve';
import Reader from "./shift-reader";
import * as _ from "ramda";
import Term, {
  isEOF, isBindingIdentifier, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport
} from "./terms";
import { Maybe } from 'ramda-fantasy';
import { gensym } from './symbol';
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import { expect, assert } from "./errors";
import loadSyntax from './load-syntax';

const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

let registerBindings = _.cond([
  [isBindingIdentifier, ({name}, context) => {
    let newBinding = gensym(name.val());
    context.env.set(newBinding.toString(), new VarBindingTransform(name));
    context.bindings.add(name, {
      binding: newBinding,
      phase: 0,
      // skip dup because js allows variable redeclarations
      // (technically only for `var` but we can let later stages of the pipeline
      // handle incorrect redeclarations of `const` and `let`)
      skipDup: true
    });
  }],
  [_.T, _ => assert(false, "not implemented yet")]
]);

let removeScope = _.cond([
  [isBindingIdentifier, ({name}, scope) => new Term('BindingIdentifier', {
    name: name.removeScope(scope)
  })],
  [_.T, _ => assert(false, "not implemented yet")]
]);

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
  let names = [];
  impTerm.namedImports.forEach(specifier => {
    let name = specifier.binding.name;
    let exportName = findNameInExports(name, exModule.exportEntries);
    if (exportName != null) {
      let newBinding = gensym(name.val());
      context.bindings.addForward(name, exportName, newBinding);
      if (context.store.has(exportName.resolve())) {
        names.push(name);
      }
    }
    // // TODO: better error
    // throw 'imported binding ' + name.val() + ' not found in exports of module' + exModule.moduleSpecifier;
  });
  return List(names);
}


export default class TokenExpander {
  constructor(context) {
    this.context = context;
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
          [isVariableDeclarationStatement, term => {
            // first, remove the use scope from each binding
            term.declaration.declarators = term.declaration.declarators.map(decl => {
              return new Term('VariableDeclarator', {
                binding: removeScope(decl.binding, this.context.useScope),
                init: decl.init
              });
            });
            // for syntax declarations we need to load the compiletime value
            // into the environment
            if (isSyntaxDeclaration(term.declaration)) {
              term.declaration.declarators.forEach(
                loadSyntax(_.__, this.context, this.context.env)
              );
              // do not add syntax declarations to the result
              return Nothing();
            } else {
              // add each binding to the environment
              term.declaration.declarators.forEach(decl =>
                registerBindings(decl.binding, this.context)
              );
            }
            return Just(term);
          }],
          [isFunctionWithName, term => {
            registerBindings(term.name, this.context);
            return Just(term);
          }],
          [isImport, term => {
            let mod = this.context.modules.load(term.moduleSpecifier, this.context);
            // mutates the store
            mod.visit(this.context);
            let boundNames = bindImports(term, mod, this.context);
            // NOTE: this is a hack for MVP modules
            if (boundNames.size === 0) {
              return Just(term);
            }
            return Nothing();
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
