// @flow
import { List } from 'immutable';
import { assert } from './errors';
import { Maybe } from 'ramda-fantasy';
import type { SymbolClass } from './symbol';
import Syntax from './syntax';

type Scopeset = any;

type ScopesetBinding = {
  scopes: Scopeset,
  binding: SymbolClass,
  alias: Maybe<Syntax>,
};

export default class BindingMap {
  _map: Map<string, List<ScopesetBinding>>;

  constructor() {
    this._map = new Map();
  }

  // given a syntax object and a binding,
  // add the binding to the map associating the binding with the syntax object's
  // scope set
  add(
    stx: Syntax,
    {
      binding,
      phase,
      skipDup = false,
    }: { binding: SymbolClass, phase: number | {}, skipDup: boolean },
  ) {
    let stxName = stx.val();
    let allScopeset = stx.scopesets.all;
    let scopeset = stx.scopesets.phase.has(phase)
      ? stx.scopesets.phase.get(phase)
      : List();
    scopeset = allScopeset.concat(scopeset);
    assert(phase != null, 'must provide a phase for binding add');

    let scopesetBindingList = this._map.get(stxName);
    if (scopesetBindingList) {
      if (skipDup && scopesetBindingList.some(s => s.scopes.equals(scopeset))) {
        return;
      }
      this._map.set(
        stxName,
        scopesetBindingList.push({
          scopes: scopeset,
          binding: binding,
          alias: Maybe.Nothing(),
        }),
      );
    } else {
      this._map.set(
        stxName,
        List.of({
          scopes: scopeset,
          binding: binding,
          alias: Maybe.Nothing(),
        }),
      );
    }
  }

  addForward(
    stx: Syntax,
    forwardStx: Syntax,
    binding: SymbolClass,
    phase: number | {},
  ) {
    let stxName = stx.token.value;
    let allScopeset = stx.scopesets.all;
    let scopeset = stx.scopesets.phase.has(phase)
      ? stx.scopesets.phase.get(phase)
      : List();
    scopeset = allScopeset.concat(scopeset);
    assert(phase != null, 'must provide a phase for binding add');

    let scopesetBindingList = this._map.get(stxName);
    if (scopesetBindingList) {
      this._map.set(
        stxName,
        scopesetBindingList.push({
          scopes: scopeset,
          binding: binding,
          alias: Maybe.of(forwardStx),
        }),
      );
    } else {
      this._map.set(
        stxName,
        List.of({
          scopes: scopeset,
          binding: binding,
          alias: Maybe.of(forwardStx),
        }),
      );
    }
  }

  get(stx: Syntax) {
    return this._map.get(stx.token.value);
  }
}
