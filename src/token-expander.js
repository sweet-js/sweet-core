import { List } from 'immutable';
import { enforestExpr, Enforester } from "./enforester";
import TermExpander from "./term-expander.js";
import BindingMap from "./binding-map.js";
import Env from "./env";
import Reader from "./shift-reader";
import * as _ from "ramda";
import Term, {
  isEOF, isBindingIdentifier, isBindingPropertyProperty, isBindingPropertyIdentifier, isObjectBinding, isArrayBinding, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isSyntaxrecDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport, isPragma, isExportSyntax
} from "./terms";
import { gensym } from './symbol';
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import { expect, assert } from "./errors";
import { evalCompiletimeValue } from './load-syntax';
import { Scope, freshScope } from "./scope";
import Syntax, { ALL_PHASES } from './syntax';
import ASTDispatcher from './ast-dispatcher';
import { registerBindings } from './hygiene-utils';

function bindImports(impTerm, exModule, context) {
  let names = [];
  let phase = impTerm.forSyntax ? context.phase + 1 : context.phase;
  impTerm.namedImports.forEach(specifier => {
    let name = specifier.binding.name;
    let exportName = findNameInExports(name, exModule.exportEntries);
    if (exportName != null) {
      let newBinding = gensym(name.val());
      context.store.set(newBinding.toString(), new VarBindingTransform(name));
      context.bindings.addForward(name, exportName, newBinding, phase);
      names.push(name);
    }
  });
  return List(names);
}


function findNameInExports(name, exp) {
  let foundNames = exp.reduce((acc, e) => {
    if (e.declaration) {
      return acc.concat(e.declaration.declarators.reduce((acc, decl) => {
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

function removeNames(impTerm, names) {
  let namedImports = impTerm.namedImports.filter(specifier => !names.contains(specifier.binding.name));
  return impTerm.extend({ namedImports });
}

// function bindAllSyntaxExports(exModule, toSynth, context) {
//   let phase = context.phase;
//   exModule.exportEntries.forEach(ex => {
//     if (isExportSyntax(ex)) {
//       ex.declaration.declarators.forEach(decl => {
//         let name = decl.binding.name;
//         let newBinding = gensym(name.val());
//         let storeName = exModule.moduleSpecifier + ":" + name.val() + ":" + phase;
//         let synthStx = Syntax.fromIdentifier(name.val(), toSynth);
//         let storeStx = Syntax.fromIdentifier(storeName, toSynth);
//         context.bindings.addForward(synthStx, storeStx, newBinding, phase);
//       });
//     }
//   });
// }

export default class TokenExpander extends ASTDispatcher {
  constructor(context) {
    super('expand', false);
    this.context = context;
  }

  expand(stxl) {
    let result = [];
    if (stxl.size === 0) {
      return List(result);
    }
    let prev = List();
    let enf = new Enforester(stxl, prev, this.context);

    while(!enf.done) {
      result.push(this.dispatch(enf.enforest()));
    }

    return List(result);
  }

  expandVariableDeclarationStatement(term) {
    term = term.extend({
      declaration: registerBindings(term.declaration, this.context)
    });

    // syntax id^{a, b} = <init>^{a, b}
    // ->
    // syntaxrec id^{a,b,c} = function() { return <<id^{a}>> }
    // syntaxrec id^{a,b} = <init>^{a,b,c}
    if (isSyntaxDeclaration(term.declaration)) {
      let scope = freshScope('nonrec');
      term.declaration.declarators.forEach(decl => {
        let name = decl.binding.name;
        let nameAdded = name.addScope(scope, this.context.bindings, ALL_PHASES);
        let nameRemoved = name.removeScope(this.context.currentScope[this.context.currentScope.length - 1], this.context.phase);
        let newBinding = gensym(name.val());
        this.context.bindings.addForward(nameAdded, nameRemoved, newBinding, this.context.phase);
        decl.init = decl.init.addScope(scope, this.context.bindings, ALL_PHASES);
      });
    }

    // for syntax declarations we need to load the compiletime value
    // into the environment
    if (isSyntaxDeclaration(term.declaration) ||
    isSyntaxrecDeclaration(term.declaration)) {
      term.declaration.declarators.forEach(decl => {
        // each compiletime value needs to be expanded with a fresh
        // environment and in the next higher phase
        let syntaxExpander = new TermExpander(_.merge(this.context, {
          phase: this.context.phase + 1,
          env: new Env(),
          store: this.context.store
        }));
        let init = syntaxExpander.expand(decl.init);
        let val = evalCompiletimeValue(init.gen(), _.merge(this.context, {
          phase: this.context.phase + 1
        }));

        this.context.env.set(decl.binding.name.resolve(this.context.phase),
        new CompiletimeTransform(val));
      });
    }
    return term;
  }

  expandFunctionDeclaration(term) {
    if (isFunctionWithName(term)) {
      term = term.extend({
        name: term.name.removeScope(this.context.useScope, this.context.phase)
      });
      registerBindings(term.name, this.context);
    }
    return term;
  }

  expandImport(term) {
    let path = term.moduleSpecifier.val();
    let mod = this.context.modules.loadAndCompile(path);
    if (term.forSyntax) {
      this.context.store = this.context.modules.visit(mod, this.context.phase + 1, this.context.store);
      this.context.store = this.context.modules.invoke(mod, this.context.phase + 1, this.context.store);
    } else {
      this.context.store = this.context.modules.visit(mod, this.context.phase, this.context.store);
    }
    let boundNames = bindImports(term, mod, this.context);
    return removeNames(term, boundNames);
  }

  expandExport(term) {
    return registerBindings(term, this.context);
  }

  // [isPragma, term => {
  //   let pathStx = term.items.get(0);
  //   if (pathStx.val() === 'base') {
  //     return term;
  //   }
  //   let mod = this.context.modules.loadAndCompile(pathStx.val());
  //   store = this.context.modules.visit(mod, phase, store);
  //   bindAllSyntaxExports(mod, pathStx, this.context);
  //   return term;
  // }],


}
