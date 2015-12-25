import { List } from "immutable";
import { expect, assert } from "./errors";

export default class BindingMap {
  constructor() {
    this._map = new Map();
  }

  // given a syntax object and a binding,
  // add the binding to the map associating the binding with the syntax object's
  // scope set
  add(stx, binding, phase) {
    let stxName = stx.token.value;

    if (this._map.has(stxName)) {
      let scopesetBindingList = this._map.get(stxName);
      this._map.set(stxName, scopesetBindingList.push({
        scopes: stx.scopeset,
        binding: binding
      }));
    } else {
      this._map.set(stxName, List.of({
        scopes: stx.scopeset,
        binding: binding
      }));
    }
  }

  // Syntax -> ?List<{ scopes: ScopeSet, binding: Binding }>
  get(stx) {
    return this._map.get(stx.token.value);
  }

}
