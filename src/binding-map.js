import { List } from "immutable";
import { expect, assert } from "./errors";
import { Maybe } from 'ramda-fantasy';
import { ALL_PHASES } from './syntax';

export default class BindingMap {
  constructor() {
    this._map = new Map();
  }

  // given a syntax object and a binding,
  // add the binding to the map associating the binding with the syntax object's
  // scope set
  add(stx, { binding, phase, skipDup = false }) {
    let stxName = stx.val();
    let allScopeset = stx.scopesets.all;
    let scopeset = stx.scopesets.phase.has(phase) ? stx.scopesets.phase.get(phase) : List();
    scopeset = allScopeset.concat(scopeset);
    assert(phase != null, "must provide a phase for binding add");

    if (this._map.has(stxName)) {
      let scopesetBindingList = this._map.get(stxName);
      if (skipDup && scopesetBindingList.some(s => s.scopes.equals(scopeset))) {
        return;
      }
      this._map.set(stxName, scopesetBindingList.push({
        scopes: scopeset,
        binding: binding,
        alias: Maybe.Nothing()
      }));
    } else {
      this._map.set(stxName, List.of({
        scopes: scopeset,
        binding: binding,
        alias: Maybe.Nothing()
      }));
    }
  }

  addForward(stx, forwardStx, binding, phase) {
    let stxName = stx.token.value;
    let allScopeset = stx.scopesets.all;
    let scopeset = stx.scopesets.phase.has(phase) ? stx.scopesets.phase.get(phase) : List();
    scopeset = allScopeset.concat(scopeset);
    assert(phase != null, "must provide a phase for binding add");

    if (this._map.has(stxName)) {
      let scopesetBindingList = this._map.get(stxName);
      this._map.set(stxName, scopesetBindingList.push({
        scopes: scopeset,
        binding: binding,
        alias: Maybe.of(forwardStx)
      }));
    } else {
      this._map.set(stxName, List.of({
        scopes: scopeset,
        binding: binding,
        alias: Maybe.of(forwardStx)
      }));
    }

  }

  // Syntax -> ?List<{ scopes: ScopeSet, binding: Binding }>
  get(stx) {
    return this._map.get(stx.token.value);
  }

}
