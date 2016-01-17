import { List } from "immutable";
import { expect, assert } from "./errors";
import { Maybe } from 'ramda-fantasy';

export default class BindingMap {
  constructor() {
    this._map = new Map();
  }

  // given a syntax object and a binding,
  // add the binding to the map associating the binding with the syntax object's
  // scope set
  add(stx, { binding, phase, skipDup = false }) {
    let stxName = stx.val();

    if (this._map.has(stxName)) {
      let scopesetBindingList = this._map.get(stxName);
      if (skipDup && scopesetBindingList.some(s => s.scopes.equals(stx.context.scopeset))) {
        return;
      }
      this._map.set(stxName, scopesetBindingList.push({
        scopes: stx.context.scopeset,
        binding: binding,
        alias: Maybe.Nothing()
      }));
    } else {
      this._map.set(stxName, List.of({
        scopes: stx.context.scopeset,
        binding: binding,
        alias: Maybe.Nothing()
      }));
    }
  }

  addForward(stx, forwardStx, binding, phase = 0) {
    let stxName = stx.token.value;

    if (this._map.has(stxName)) {
      let scopesetBindingList = this._map.get(stxName);
      this._map.set(stxName, scopesetBindingList.push({
        scopes: stx.context.scopeset,
        binding: binding,
        alias: Maybe.of(forwardStx)
      }));
    } else {
      this._map.set(stxName, List.of({
        scopes: stx.context.scopeset,
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
