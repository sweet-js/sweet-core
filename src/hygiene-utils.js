import { List } from 'immutable';

import ASTDispatcher from './ast-dispatcher';

export class CollectBindingSyntax extends ASTDispatcher {
  constructor() {
    super('collect', true);
    this.names = List();
  }

  // registerSyntax(stx) {
  //   let newBinding = gensym(stx.val());
  //   this.context.bindings.add(stx, {
  //     binding: newBinding,
  //     phase: this.context.phase,
  //     // skip dup because js allows variable redeclarations
  //     // (technically only for `var` but we can let later stages of the pipeline
  //     // handle incorrect redeclarations of `const` and `let`)
  //     skipDup: true
  //   });
  //   return stx;
  // }

  collect(term) {
    return this.dispatch(term);
  }

  collectBindingIdentifier(term) {
    return this.names.concat(term.name);
  }

  collectBindingPropertyIdentifier(term) {
    return this.collect(term.binding);
  }

  collectBindingPropertyProperty(term) {
    return this.collect(term.binding);
  }

  collectArrayBinding(term) {
    let rest = null;
    if (term.rest != null) {
      rest = this.collect(term.rest);
    }
    return this.names
      .concat(rest)
      .concat(
        term.elements.filter(el => el != null).flatMap(el => this.collect(el)),
      );
  }

  collectObjectBinding() {
    // return term.properties.flatMap(prop => this.collect(prop));
    return List();
  }

  // registerVariableDeclaration(term) {
  //   let declarators = term.declarators.map(decl => {
  //     return decl.extend({
  //       binding: this.register(decl.binding)
  //     });
  //   });
  //   return term.extend({ declarators });
  // }
  //
  // registerFunctionDeclaration(term) {
  //   return term.extend({
  //     name: this.register(term.name)
  //   });
  // }
  //
  // registerExport(term) {
  //   return term.extend({
  //     declaration: this.register(term.declaration)
  //   });
  // }
}

export function collectBindings(term) {
  return new CollectBindingSyntax().collect(term);
}
