#lang "../../macros/stxcase.js";

"use strict";

var _ = require("underscore"),
    assert = require("assert"),
    Immutable = require("immutable"),
    StringMap = require("./stringMap");

class BindingMap {
    constructor() {
        this._map = new StringMap();
    }

    add(stx, name, phase) {
        assert(phase != null, "must pass in the phase");
        let key = stx.token.value;
        let old = this._map.get(key);
        old = old ? old : [];
        old.push({
            scopeSet: stx.context,
            binding: name,
            phase: phase
        });
        this._map.set(key, old);
    }
    get(key) {
        return this._map.get(key);
    }
}


module.exports = BindingMap;
