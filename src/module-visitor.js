// @flow
import { evalCompiletimeValue, evalRuntimeValues } from './load-syntax';
import * as T from './terms';
import * as _ from 'ramda';
import * as S from 'sweet-spec';
import { gensym } from './symbol';
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import { collectBindings } from './hygiene-utils';

export default class {

  context: any;

  constructor(context) {
    this.context = context;
  }

  visit(mod, phase, store) {
    // TODO: recursively visit imports
    mod.items.forEach(term => {
      if (T.isSyntaxDeclarationStatement(term)) {
        this.registerSyntaxDeclaration(term.declaration, phase, store);
      } else if (term instanceof S.Export && term.declaration instanceof S.VariableDeclaration && term.declaration.kind === 'syntax') {
        this.registerSyntaxDeclaration(term.declaration, phase, store)
      }
    });
    return store;
  }

  invoke(mod, phase, store) {
    // TODO: recursively visit imports
    let body = mod.runtimeItems().map(term => {
      if (T.isVariableDeclarationStatement(term)) {
        this.registerVariableDeclaration(term.declaration, phase, store);
      } else if (T.isFunctionDeclaration(term)) {
        this.registerFunctionOrClass(term, phase, store);
      }
      return term;
    });
    evalRuntimeValues(body, _.merge(this.context, {
      store, phase
    }));
    return store;
  }

  registerSyntaxDeclaration(term, phase, store) {
    term.declarators.forEach(decl => {
      let val = evalCompiletimeValue(decl.init, _.merge(this.context, {
        phase: phase + 1, store
      }));

      collectBindings(decl.binding).forEach(stx => {
        if (phase !== 0) { // phase 0 bindings extend the binding map during compilation
          let newBinding = gensym(stx.val());
          this.context.bindings.add(stx, {
            binding: newBinding,
            phase: phase,
            skipDup: false
          });
        }
        let resolvedName = stx.resolve(phase);
        store.set(resolvedName, new CompiletimeTransform(val));
      });
    });
  }

  registerVariableDeclaration(term, phase, store) {
    term.declarators.forEach(decl => {
      collectBindings(decl.binding).forEach(stx => {
        if (phase !== 0) { // phase 0 bindings extend the binding map during compilation
          let newBinding = gensym(stx.val());
          this.context.bindings.add(stx, {
            binding: newBinding,
            phase: phase,
            skipDup: term.kind === 'var'
          });
        }
        let resolvedName = stx.resolve(phase);
        store.set(resolvedName, new VarBindingTransform(stx));
      });
    });
  }

  registerFunctionOrClass(term, phase, store) {
    collectBindings(term.name).forEach(stx => {
      if (phase !== 0) {
        let newBinding = gensym(stx.val());
        this.context.bindings.add(stx, {
          binding: newBinding,
          phase: phase,
          skipDup: false
        });
      }
      let resolvedName = stx.resolve(phase);
      store.set(resolvedName, new VarBindingTransform(stx));
    });
  }

}
