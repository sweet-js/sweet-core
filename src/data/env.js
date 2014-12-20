#lang "../../macros/stxcase.js";

"use strict";

var _ = require("underscore"),
    assert = require("assert"),
    unwrapSyntax = require("../syntax").unwrapSyntax,
    makeIdent = require("../syntax").makeIdent,
    resolve = require("../stx/resolve").resolve,
    StringMap = require("./stringMap");


function Env() {
    // stores compiletime values
    this._map = new StringMap();
    // for fast path checking
    this._names = new StringMap();
}


Env.prototype.set = function(stx, phase, value) {
    assert(phase != null, "must provide a phase");
    assert(value != null, "must provide a value");
    // store the unresolved name string into the fast path lookup map
    this._names.set(unwrapSyntax(stx), true);
    this._map.set(resolve(stx, phase), value);
};

function isToksAdjacent(a, b) {
    var arange = a.token.sm_range || a.token.range || a.token.endRange;
    var brange = b.token.sm_range || b.token.range || b.token.endRange;
    return arange && brange && arange[1] === brange[0];
}

function isValidName(stx) {
    return stx.isIdentifier() ||
        stx.isKeyword() ||
        stx.isPunctuator();
}

function getName(head, rest) {
    var idx = 0;
    var curr = head;
    var next = rest[idx];
    var name = [head];
    while (true) {
        if (next &&
            isValidName(next) && isToksAdjacent(curr, next)) {
            name.push(next);
            curr = next;
            next = rest[++idx];
        } else {
            return name;
        }
    }
}


function get(stx, phase) {
    // normalize to an array
    stx = Array.isArray(stx) ? stx : [stx];
    var head = stx[0], rest = stx.slice(1), resolvedName;
    assert(phase != null, "must provide phase");

    if (!isValidName(head)) {
        return null;
    }
    var name = getName(head, rest);
    // simple case, don't need to create a new syntax object
    if (name.length === 1) {
        if (this._names.get(unwrapSyntax(name[0]))) {
            resolvedName = resolve(name[0], phase);
            if (this._map.has(resolvedName)) {
                return this._map.get(resolvedName);
            }
        }
        return null;
    } else {
        while (name.length > 0) {
            var nameStr = name.map(unwrapSyntax).join("");
            if (this._names.get(nameStr)) {
                var nameStx = makeIdent(nameStr, name[0]);
                resolvedName = resolve(nameStx, phase);
                if (this._map.has(resolvedName)) {
                    return this._map.get(resolvedName);
                }
            }
            name.pop();
        }
        return null;
    }
}


Env.prototype.get = get;

Env.prototype.hasName = function(stx) {
    return this._names.has(unwrapSyntax(stx));
};

Env.prototype.has = function(stx, phase) {
    return this.get(stx, phase) !== null;
};

Env.prototype.keysStr = function() {
    return this._map.keys();
};

Env.prototype.getStr = function(key) {
    return this._map.get(key);
};

module.exports = Env;
