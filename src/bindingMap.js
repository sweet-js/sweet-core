import { List } from "immutable";
import { expect, assert } from "./errors";

export default class BindingMap {
    constructor() {
        this._map = new Map();
    }

    add(stx, binding, phase) {
        assert(stx.isIdentifier(), "expecting an identifier");
        let stxName = stx.token.value;

        if (this._map.has(stxName)) {
            let scopesetBindingList = this._map.get(stxName);
            this._map.set(stxName, scopesetBindingList.push(List.of(stx.scopeset, binding)));
        } else {
            this._map.set(stxName, List.of(List(stx.scopeset, binding)));
        }
    }

    get(stx) {
        assert(stx.isIdentifier(), "expecting an identifier");
        return this._map.get(stx.token.value);
    }

}
