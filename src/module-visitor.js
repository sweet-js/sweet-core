// @flow
import { evalCompiletimeValue, evalRuntimeValues } from './load-syntax';
import * as T from './terms';
import * as _ from 'ramda';
import * as S from 'sweet-spec';
import { gensym } from './symbol';
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import { collectBindings } from './hygiene-utils';

import type { Context } from './sweet-loader';

export default class {

  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  visit(mod: any, phase: any, store: any) {
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

  invoke(mod: any, phase: any, store: any) {
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

  registerSyntaxDeclaration(term: any, phase: any, store: any) {
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

  registerVariableDeclaration(term: any, phase: any, store: any) {
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

  registerFunctionOrClass(term: any, phase: any, store: any) {
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
