"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

var _errors = require("./errors");

var _ramdaFantasy = require("ramda-fantasy");

var _syntax = require("./syntax");

class BindingMap {
  constructor() {
    this._map = new Map();
  }
  add(stx_20, _ref) {
    let binding = _ref.binding;
    let phase = _ref.phase;
    var _ref$skipDup = _ref.skipDup;
    let skipDup = _ref$skipDup === undefined ? false : _ref$skipDup;

    let stxName_21 = stx_20.val();
    let allScopeset_22 = stx_20.scopesets.all;
    let scopeset_23 = stx_20.scopesets.phase.has(phase) ? stx_20.scopesets.phase.get(phase) : (0, _immutable.List)();
    scopeset_23 = allScopeset_22.concat(scopeset_23);
    (0, _errors.assert)(phase != null, "must provide a phase for binding add");
    if (this._map.has(stxName_21)) {
      let scopesetBindingList = this._map.get(stxName_21);
      if (skipDup && scopesetBindingList.some(s_24 => s_24.scopes.equals(scopeset_23))) {
        return;
      }
      this._map.set(stxName_21, scopesetBindingList.push({ scopes: scopeset_23, binding: binding, alias: _ramdaFantasy.Maybe.Nothing() }));
    } else {
      this._map.set(stxName_21, _immutable.List.of({ scopes: scopeset_23, binding: binding, alias: _ramdaFantasy.Maybe.Nothing() }));
    }
  }
  addForward(stx_25, forwardStx_26, binding_27, phase_28) {
    let stxName_29 = stx_25.token.value;
    let allScopeset_30 = stx_25.scopesets.all;
    let scopeset_31 = stx_25.scopesets.phase.has(phase_28) ? stx_25.scopesets.phase.get(phase_28) : (0, _immutable.List)();
    scopeset_31 = allScopeset_30.concat(scopeset_31);
    (0, _errors.assert)(phase_28 != null, "must provide a phase for binding add");
    if (this._map.has(stxName_29)) {
      let scopesetBindingList = this._map.get(stxName_29);
      this._map.set(stxName_29, scopesetBindingList.push({ scopes: scopeset_31, binding: binding_27, alias: _ramdaFantasy.Maybe.of(forwardStx_26) }));
    } else {
      this._map.set(stxName_29, _immutable.List.of({ scopes: scopeset_31, binding: binding_27, alias: _ramdaFantasy.Maybe.of(forwardStx_26) }));
    }
  }
  get(stx_32) {
    return this._map.get(stx_32.token.value);
  }
}
exports.default = BindingMap;