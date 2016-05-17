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
  isVariableDeclarationStatement, isImport, isExport, isExportFrom, isPragma, isExportSyntax,
  isClassDeclaration
} from "./terms";
import { gensym } from './symbol';
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import { expect, assert } from "./errors";
import { evalCompiletimeValue } from './load-syntax';
import { Scope, freshScope } from "./scope";
import Syntax, { ALL_PHASES } from './syntax';
import ASTDispatcher from './ast-dispatcher';
import { collectBindings } from './hygiene-utils';

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
    if (isExportFrom(e)) {
      return acc.concat(e.namedExports.reduce((acc, specifier) => {
        if (specifier.exportedName.val() === name.val()) {
          return acc.concat(specifier.exportedName);
        }
        return acc;
      }, List()));
    } else if (isExport(e)) {
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
    return term.extend({
      declaration: this.registerVariableDeclaration(term.declaration)
    });
  }

  expandFunctionDeclaration(term) {
    let registeredTerm = this.registerFunctionOrClass(term);
    let stx = registeredTerm.name.name;
    this.context.env.set(stx.resolve(this.context.phase),
                         new VarBindingTransform(stx));
    return registeredTerm;
  }

  // TODO: think about function expressions

  expandImport(term) {
    let path = term.moduleSpecifier.val();
    let mod;
    if (term.forSyntax) {
      mod = this.context.modules.getAtPhase(path, this.context.phase + 1);
      this.context.store = this.context.modules.visit(mod, this.context.phase + 1, this.context.store);
      this.context.store = this.context.modules.invoke(mod, this.context.phase + 1, this.context.store);
    } else {
      mod = this.context.modules.getAtPhase(path, this.context.phase);
      this.context.store = this.context.modules.visit(mod, this.context.phase, this.context.store);
    }
    let boundNames = bindImports(term, mod, this.context);
    return removeNames(term, boundNames);
  }

  expandExport(term) {
    if (isFunctionDeclaration(term.declaration) || isClassDeclaration(term.declaration)) {
      return term.extend({
        declaration: this.registerFunctionOrClass(term.declaration)
      });
    } else if (isVariableDeclaration(term.declaration)) {
      return term.extend({
        declaration: this.registerVariableDeclaration(term.declaration)
      });
    }
    return term;
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


  registerFunctionOrClass(term) {
    let name = term.name.removeScope(this.context.useScope, this.context.phase);
    collectBindings(term.name).forEach(stx => {
      let newBinding = gensym(stx.val());
      this.context.bindings.add(stx, {
        binding: newBinding,
        phase: this.context.phase,
        skipDup: false
      });
      // the meaning of a function declaration name is a runtime var binding
      this.context.env.set(newBinding.toString(), new VarBindingTransform(stx));
    });
    return term.extend({ name });
  }

  registerVariableDeclaration(term) {
    if (isSyntaxDeclaration(term) || isSyntaxrecDeclaration(term)) {
      return this.registerSyntaxDeclaration(term);
    }
    return term.extend({
      declarators: term.declarators.map(decl => {
        let binding = decl.binding.removeScope(this.context.useScope, this.context.phase);
        collectBindings(binding).forEach(stx => {
          let newBinding = gensym(stx.val());
          this.context.bindings.add(stx, {
            binding: newBinding,
            phase: this.context.phase,
            skipDup: term.kind === 'var'
          });
          // the meaning of a var/let/const declaration is a var binding
          this.context.env.set(newBinding.toString(), new VarBindingTransform(stx));
        });
        return decl.extend({ binding });
      })
    });
  }

  registerSyntaxDeclaration(term) {
    // syntax id^{a, b} = <init>^{a, b}
    // ->
    // syntaxrec id^{a,b,c} = function() { return <<id^{a}>> }
    // syntaxrec id^{a,b} = <init>^{a,b,c}
    if (isSyntaxDeclaration(term)) {
      let scope = freshScope('nonrec');
      term = term.extend({
        declarators: term.declarators.map(decl => {
          let name = decl.binding.name;
          let nameAdded = name.addScope(scope, this.context.bindings, ALL_PHASES);
          let nameRemoved = name.removeScope(this.context.currentScope[this.context.currentScope.length - 1], this.context.phase);
          let newBinding = gensym(name.val());
          this.context.bindings.addForward(nameAdded, nameRemoved, newBinding, this.context.phase);
          return decl.extend({
            init: decl.init.addScope(scope, this.context.bindings, ALL_PHASES)
          });
        })
      });
    }

    // for syntax declarations we need to load the compiletime value
    // into the environment
    return term.extend({
      declarators: term.declarators.map(decl => {
        let binding = decl.binding.removeScope(this.context.useScope, this.context.phase);
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
        collectBindings(binding).forEach(stx => {
          let newBinding = gensym(stx.val());
          this.context.bindings.add(stx, {
            binding: newBinding,
            phase: this.context.phase,
            skipDup: false
          });
          let resolvedName = stx.resolve(this.context.phase);
          this.context.env.set(resolvedName, new CompiletimeTransform(val));
        });
        return decl.extend({ binding, init });
      })
    });
  }
}
