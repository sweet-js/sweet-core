// @flow
import Term, * as S from 'sweet-spec';
import type Syntax from './syntax';
import type { SymbolClass } from './symbol';
import type BindingMap from './binding-map';

// $FlowFixMe: flow doesn't know about the CloneReducer yet
export default class extends Term.CloneReducer {
  scopes: Array<{ scope: SymbolClass, phase: number | {}, flip: boolean }>;
  bindings: BindingMap;

  constructor(
    scopes: Array<{ scope: SymbolClass, phase: number | {}, flip: boolean }>,
    bindings: BindingMap,
  ) {
    super();
    this.scopes = scopes;
    this.bindings = bindings;
  }

  applyScopes(s: Syntax) {
    return this.scopes.reduce((acc, sc) => {
      return acc.addScope(sc.scope, this.bindings, sc.phase, {
        flip: sc.flip,
      });
    }, s);
  }

  reduceBindingIdentifier(t: Term, s: { name: Syntax }) {
    return new S.BindingIdentifier({
      name: this.applyScopes(s.name),
    });
  }

  reduceIdentifierExpression(t: Term, s: { name: Syntax }) {
    return new S.IdentifierExpression({
      name: this.applyScopes(s.name),
    });
  }

  reduceRawSyntax(t: Term, s: { value: Syntax }) {
    // TODO: fix this once reading tokens is reasonable
    if (s.value.isTemplate() && s.value.items) {
      s.value.token.items = s.value.token.items.map(t => {
        if (t instanceof Term) {
          return t.reduce(this);
        }
        return t;
      });
    }
    return new S.RawSyntax({
      value: this.applyScopes(s.value),
    });
  }
}
