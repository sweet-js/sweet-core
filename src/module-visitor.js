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
import Syntax from './syntax';

import type { Context } from './sweet-loader';

export function isBoundToCompiletime(name: Syntax, store: Map<*, *>) {
  let resolvedName = name.resolve(0);
  if (store.has(resolvedName)) {
    return store.get(resolvedName) instanceof CompiletimeTransform;
  }
  return false;
}

export function bindImports(
  impTerm: any,
  exModule: SweetModule,
  phase: any,
  context: Context,
  isEntrypoint: boolean,
) {
  let names = [];
  let phaseToBind = impTerm.forSyntax ? phase + 1 : phase;
  if (impTerm.defaultBinding != null && impTerm instanceof T.Import) {
    let name = impTerm.defaultBinding.name;
    let exportName = exModule.exportedNames.find(
      exName => exName.exportedName.val() === '_default',
    );
    if (exportName != null) {
      let newBinding = gensym('_default');
      let toForward = exportName.exportedName;

      if (
        !isEntrypoint ||
        isBoundToCompiletime(toForward, context.store) ||
        impTerm.forSyntax
      ) {
        context.bindings.addForward(name, toForward, newBinding, phaseToBind);
      }
      names.push(name);
    }
  }
  if (impTerm.namedImports) {
    impTerm.namedImports.forEach(specifier => {
      let name = specifier.binding.name;
      let exportName = exModule.exportedNames.find(exName => {
        if (exName.exportedName != null) {
          return exName.exportedName.val() === name.val();
        }
        return exName.name && exName.name.val() === name.val();
      });
      if (exportName != null) {
        let newBinding = gensym(name.val());
        let toForward = exportName.name
          ? exportName.name
          : exportName.exportedName;
        if (
          !isEntrypoint ||
          isBoundToCompiletime(toForward, context.store) ||
          impTerm.forSyntax
        ) {
          context.bindings.addForward(name, toForward, newBinding, phaseToBind);
        }
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

  visit(mod: SweetModule, phase: any, store: any, cwd: string) {
    mod.imports.forEach(imp => {
      if (imp.forSyntax) {
        let mod = this.context.loader.get(
          imp.moduleSpecifier.val(),
          phase + 1,
          cwd,
        );
        this.visit(mod, phase + 1, store, mod.path);
        this.invoke(mod, phase + 1, store, mod.path);
      } else {
        let mod = this.context.loader.get(
          imp.moduleSpecifier.val(),
          phase,
          cwd,
        );
        this.visit(mod, phase, store, mod.path);
      }
      bindImports(imp, mod, phase, this.context, false);
    });
    for (let term of mod.compiletimeItems()) {
      if (S.isSyntaxDeclarationStatement(term)) {
        this.registerSyntaxDeclaration((term: any).declaration, phase, store);
      }
    }
    return store;
  }

  invoke(mod: any, phase: any, store: any, cwd: string) {
    if (this.context.invokedRegistry.containsAt(mod.path, phase)) {
      return store;
    }
    mod.imports.forEach(imp => {
      if (!imp.forSyntax) {
        let mod = this.context.loader.get(
          imp.moduleSpecifier.val(),
          phase,
          cwd,
        );
        this.invoke(mod, phase, store, mod.path);
        bindImports(imp, mod, phase, this.context, false);
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
      // $FlowFixMe: flow doesn't know about reduce yet
    }).reduce(new SweetToShiftReducer(phase));

    let gen = codegen(parsed, new FormattedCodeGen());
    let result = this.context.transform(gen);

    this.context.loader.eval(result.code, store);
    this.context.invokedRegistry.add(mod.path, phase);
    return store;
  }

  registerSyntaxDeclaration(term: any, phase: any, store: any) {
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
        let compiletimeType = term.kind === 'operator' ? 'operator' : 'syntax';
        store.set(
          resolvedName,
          new CompiletimeTransform({
            type: compiletimeType,
            prec: decl.prec == null ? void 0 : decl.prec.val(),
            assoc: decl.assoc == null ? void 0 : decl.assoc.val(),
            f: val,
          }),
        );
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
