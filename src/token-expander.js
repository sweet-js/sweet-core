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
import { Maybe } from 'ramda-fantasy';
import { gensym } from './symbol';
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import { expect, assert } from "./errors";
import { evalCompiletimeValue } from './load-syntax';
import { Scope, freshScope } from "./scope";
import Syntax, { ALL_PHASES } from './syntax';

const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

const registerSyntax = (stx, context) => {
  let newBinding = gensym(stx.val());
  context.env.set(newBinding.toString(), new VarBindingTransform(stx));
  context.bindings.add(stx, {
    binding: newBinding,
    phase: context.phase,
    // skip dup because js allows variable redeclarations
    // (technically only for `var` but we can let later stages of the pipeline
    // handle incorrect redeclarations of `const` and `let`)
    skipDup: true
  });
};

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

let registerBindings = _.cond([
  [isBindingIdentifier, ({name}, context) => {
    registerSyntax(name, context);
  }],
  [isBindingPropertyIdentifier, ({binding}, context) => {
    registerBindings(binding, context);
  }],
  [isBindingPropertyProperty, ({binding}, context) => {
    registerBindings(binding, context);
  }],
  [isArrayBinding, ({elements, restElement}, context) => {
    if (restElement != null) {
      registerBindings(restElement, context);
    }
    elements.forEach(el => {
      if (el != null) {
        registerBindings(el, context);
      }
    });
  }],
  [isObjectBinding, ({properties}, context) => {
    // properties.forEach(prop => registerBindings(prop, context));
  }],
  [_.T, binding => assert(false, "not implemented yet for: " + binding.type)]
]);

let removeScope = _.cond([
  [isBindingIdentifier, ({name}, scope, phase) => new Term('BindingIdentifier', {
    name: name.removeScope(scope, phase)
  })],
  [isArrayBinding, ({elements, restElement}, scope, phase) => {
    return new Term('ArrayBinding', {
      elements: elements.map(el => el == null ? null : removeScope(el, scope, phase)),
      restElement: restElement == null ? null : removeScope(restElement, scope, phase)
    });
  }],
  [isBindingPropertyIdentifier, ({binding, init}, scope, phase) => new Term('BindingPropertyIdentifier', {
    binding: removeScope(binding, scope, phase),
    init
  })],
  [isBindingPropertyProperty, ({binding, name}, scope, phase) => new Term('BindingPropertyProperty', {
    binding: removeScope(binding, scope, phase), name
  })],
  [isObjectBinding, ({properties}, scope, phase) => new Term('ObjectBinding', {
    properties: properties.map(prop => removeScope(prop, scope, phase))
  })],
  [_.T, binding => assert(false, "not implemented yet for: " + binding.type)]
]);

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

function bindAllSyntaxExports(exModule, toSynth, context) {
  let phase = context.phase;
  exModule.exportEntries.forEach(ex => {
    if (isExportSyntax(ex)) {
      ex.declaration.declarators.forEach(decl => {
        let name = decl.binding.name;
        let newBinding = gensym(name.val());
        let storeName = exModule.moduleSpecifier + ":" + name.val() + ":" + phase;
        let synthStx = Syntax.fromIdentifier(name.val(), toSynth);
        let storeStx = Syntax.fromIdentifier(storeName, toSynth);
        context.bindings.addForward(synthStx, storeStx, newBinding, phase);
      });
    }
  });
}

export default class TokenExpander {
  constructor(context) {
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
      let term = enf.enforest();

      let field = "expand" + term.type;
      if (typeof this[field] === 'function') {
        result.push(this[field](term));
      } else {
        result.push(term);
      }
    }

    return List(result);
  }

  bindFunctionDeclaration(decl) {
    let name = removeScope(decl.name, this.context.useScope, this.context.phase);
    registerBindings(name, this.context);
    return decl.extend({ name });
  }

  bindVariableDeclaration (declaration) {
    let declarators = declaration.declarators.map(decl => {
      let newDecl = decl.extend({
        // first, remove the use scope from each binding
        binding: removeScope(decl.binding, this.context.useScope, this.context.phase)
      });
      // mutate the binding map
      // TODO: make this functional
      registerBindings(newDecl.binding, this.context);
      return newDecl;
    });
    return declaration.extend({ declarators });
  }

  expandVariableDeclarationStatement(term) {
    term = term.extend({
      declaration: this.bindVariableDeclaration(term.declaration)
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
        name: removeScope(term.name, this.context.useScope, this.context.phase)
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
    if (isVariableDeclaration(term.declaration)) {
      return term.extend({
        declaration: this.bindVariableDeclaration(term.declaration)
      });
    } else if (isFunctionDeclaration(term.declaration)) {
      return term.extend({
        declaration: this.bindFunctionDeclaration(term.declaration)
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
}
