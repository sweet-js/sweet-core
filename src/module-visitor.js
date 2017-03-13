// @flow
import { evalCompiletimeValue } from './load-syntax';
import * as _ from 'ramda';
import * as T from 'sweet-spec';
import * as S from './sweet-spec-utils';
import { gensym } from './symbol';
import { ModuleNamespaceTransform, CompiletimeTransform } from './transforms';
import { collectBindings } from './hygiene-utils';
import SweetModule from './sweet-module';
import { List } from 'immutable';
import SweetToShiftReducer from './sweet-to-shift-reducer';
import codegen, { FormattedCodeGen } from 'shift-codegen';

import type { Context } from './sweet-loader';

export function bindImports(
  impTerm: T.ImportDeclaration,
  exModule: SweetModule,
  phase: any,
  context: Context,
) {
  let names = [];
  let phaseToBind = impTerm.forSyntax ? phase + 1 : phase;
  if (impTerm.defaultBinding != null) {
    let exportName = exModule.exportedNames.find(
      exName => exName.exportedName.val() === '_default',
    );
    let name = impTerm.defaultBinding.name;
    if (exportName != null) {
      let newBinding = gensym('_default');
      let toForward = exportName.exportedName;
      context.bindings.addForward(name, toForward, newBinding, phaseToBind);
      names.push(name);
    }
  }
  if (impTerm.namedImports) {
    impTerm.namedImports.forEach(specifier => {
      let name = specifier.binding.name;
      let exportName = exModule.exportedNames.find(
        exName => exName.exportedName.val() === name.val(),
      );
      if (exportName != null) {
        let newBinding = gensym(name.val());
        let toForward = exportName.name
          ? exportName.name
          : exportName.exportedName;
        context.bindings.addForward(name, toForward, newBinding, phaseToBind);
        names.push(name);
      }
    });
  }
  if (impTerm.namespaceBinding) {
    let name = impTerm.namespaceBinding.name;
    let newBinding = gensym(name.val());
    context.store.set(
      newBinding.toString(),
      new ModuleNamespaceTransform(name, exModule),
    );
    context.bindings.add(name, {
      binding: newBinding,
      phase: phaseToBind,
      skipDup: false,
    });

    names.push(name);
  }
  return List(names);
}

export default class {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  visit(mod: SweetModule, phase: any, store: any) {
    mod.imports.forEach(imp => {
      if (imp.forSyntax) {
        let mod = this.context.loader.get(
          imp.moduleSpecifier.val(),
          phase + 1,
          '',
        );
        this.visit(mod, phase + 1, store);
        this.invoke(mod, phase + 1, store);
      } else {
        let mod = this.context.loader.get(imp.moduleSpecifier.val(), phase, '');
        this.visit(mod, phase, store);
      }
      bindImports(imp, mod, phase, this.context);
    });
    for (let term of mod.compiletimeItems()) {
      if (S.isSyntaxDeclarationStatement(term)) {
        this.registerSyntaxDeclaration(term.declaration, phase, store);
      }
    }
    return store;
  }

  invoke(mod: any, phase: any, store: any) {
    mod.imports.forEach(imp => {
      if (!imp.forSyntax) {
        let mod = this.context.loader.get(imp.moduleSpecifier.val(), phase, '');
        this.invoke(mod, phase, store);
        bindImports(imp, mod, phase, this.context);
      }
    });
    let items = mod.runtimeItems();
    for (let term of items) {
      if (S.isVariableDeclarationStatement(term)) {
        this.registerVariableDeclaration(term.declaration, phase, store);
      } else if (S.isFunctionDeclaration(term)) {
        this.registerFunctionOrClass(term, phase, store);
      }
    }
    let parsed = new T.Module({
      directives: List(),
      items,
    }).reduce(new SweetToShiftReducer(phase));

    let gen = codegen(parsed, new FormattedCodeGen());
    let result = this.context.transform(gen);

    this.context.loader.eval(result.code, store);
    return store;
  }

  registerSyntaxDeclaration(
    term: T.VariableDeclarationStatement,
    phase: any,
    store: any,
  ) {
    term.declarators.forEach(decl => {
      let val = evalCompiletimeValue(
        decl.init,
        _.merge(this.context, {
          phase: phase + 1,
          store,
        }),
      );

      collectBindings(decl.binding).forEach(stx => {
        if (phase !== 0) {
          // phase 0 bindings extend the binding map during compilation
          let newBinding = gensym(stx.val());
          this.context.bindings.add(stx, {
            binding: newBinding,
            phase: phase,
            skipDup: false,
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
        if (phase !== 0) {
          // phase 0 bindings extend the binding map during compilation
          let newBinding = gensym(stx.val());
          this.context.bindings.add(stx, {
            binding: newBinding,
            phase: phase,
            skipDup: term.kind === 'var',
          });
        }
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
          skipDup: false,
        });
      }
    });
  }
}
