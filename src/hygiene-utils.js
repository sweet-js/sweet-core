import { gensym } from './symbol';
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import * as _ from "ramda";
import { expect, assert } from "./errors";
import Term, {
  isEOF, isBindingIdentifier, isBindingPropertyProperty, isBindingPropertyIdentifier, isObjectBinding, isArrayBinding, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isSyntaxrecDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport, isPragma, isExportSyntax
} from "./terms";

import ASTDispatcher from './ast-dispatcher';

export class RegisterBindings extends ASTDispatcher {
  constructor(context) {
    super('register', true);
    this.context = context;
  }

  registerSyntax(stx) {
    let newBinding = gensym(stx.val());
    this.context.env.set(newBinding.toString(), new VarBindingTransform(stx));
    this.context.bindings.add(stx, {
      binding: newBinding,
      phase: this.context.phase,
      // skip dup because js allows variable redeclarations
      // (technically only for `var` but we can let later stages of the pipeline
      // handle incorrect redeclarations of `const` and `let`)
      skipDup: true
    });
    return stx;
  }

  register(term) {
    return this.dispatch(term);
  }

  registerBindingIdentifier(term) {
    return term.extend({
      name: this.registerSyntax(term.name)
    });
  }

  registerBindingPropertyIdentifier(term) {
    return term.extend({
      binding: this.register(term.binding)
    });
  }

  registerBindingPropertyProperty (term) {
    return term.extend({
      binding: this.register(term.binding)
    });
  }

  registerArrayBinding (term) {
    let restElement = null;
    if (term.restElement != null) {
      restElement = his.register(term.restElement);
    }
    return term.extend({
      restElement,
      elements: term.elements.map(el => {
        if (el == null) {
          return null;
        }
        return this.register(el);
      })
    });
  }

  registerObjectBinding (term) {
    // properties.forEach(prop => registerBindings(prop, context));
    return term;
  }

  registerFunctionDeclaration(term) {
    let name = term.name.removeScope(this.context.useScope, this.context.phase);
    return term.extend({
      name: this.register(name)
    });
  }

  registerVariableDeclaration(term) {
    let declarators = term.declarators.map(decl => {
      // first, remove the use scope from each binding
      let binding = decl.binding.removeScope(this.context.useScope, this.context.phase);
      return decl.extend({
        binding: this.register(binding)
      });
    });
    return term.extend({ declarators });
  }
  registerExport(term) {
    return term.extend({
      declaration: this.register(term.declaration)
    });
  }
}

export function registerBindings(term, context) {
  return new RegisterBindings(context).register(term);
}
