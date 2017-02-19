// @flow
import Term, * as S from 'sweet-spec';
import type Syntax from './syntax';
import type { SymbolClass } from './symbol';
import type BindingMap from './binding-map';
import * as T from './tokens';

export default class extends Term.CloneReducer {
  scopes: Array<{ scope: SymbolClass, phase: number | {}, flip: boolean }>;
  bindings: BindingMap;

  constructor(scopes: Array<{ scope: SymbolClass, phase: number | {}, flip: boolean }>, bindings: BindingMap) {
    super();
    this.scopes = scopes;
    this.bindings = bindings;
  }

  applyScopes(s: Term) {
    return s;
    // return this.scopes.reduce((acc, sc) => {
    //   return acc.addScope(sc.scope, this.bindings, sc.phase, { flip: sc.flip });
    // }, s);
  }

  reduceBindingIdentifier(t: Term, s: { name: Syntax }) {
    return new S.BindingIdentifier({
      name: this.applyScopes(s.name)
    });
  }

  reduceIdentifierExpression(t: Term, s: { name: Syntax }) {
    return new S.IdentifierExpression({
      name: this.applyScopes(s.name)
    });
  }

  reduceRawSyntax(t: Term, s: Term) {
    if (T.isTemplate(s.value)) {
      s.value.token.items = s.value.token.items.map(t => {
        return t.reduce(this);
      });
    }
    return new S.RawSyntax({
      value: this.applyScopes(s.value)
    });
  }
}
