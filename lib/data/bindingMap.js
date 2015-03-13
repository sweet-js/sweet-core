"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = require("underscore"),
    assert = require("assert"),
    Immutable = require("immutable"),
    StringMap = require("./stringMap");

var BindingMap = (function () {
    function BindingMap() {
        _classCallCheck(this, BindingMap);

        this._map = new StringMap();
    }

    _prototypeProperties(BindingMap, null, {
        add: {
            value: function add(stx, name, phase) {
                assert(phase != null, "must pass in the phase");
                var key = stx.token.value;
                var old = this._map.get(key);
                old = old ? old : [];
                old.push({
                    scopeSet: stx.context,
                    binding: name,
                    phase: phase
                });
                this._map.set(key, old);
            },
            writable: true,
            configurable: true
        },
        get: {
            value: function get(key) {
                return this._map.get(key);
            },
            writable: true,
            configurable: true
        }
    });

    return BindingMap;
})();

module.exports = BindingMap;
//# sourceMappingURL=bindingMap.js.map