"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _771 = require("underscore"),
    assert772 = require("assert"),
    Immutable773 = require("immutable"),
    StringMap774 = require("./stringMap");

var BindingMap = (function () {
    function BindingMap() {
        _classCallCheck(this, BindingMap);

        this._map = new StringMap774();
    }

    _prototypeProperties(BindingMap, null, {
        add: {
            value: function add(stx, name, phase) {
                assert772(phase != null, "must pass in the phase");
                var key775 = stx.token.value;
                var old776 = this._map.get(key775);
                old776 = old776 ? old776 : [];
                old776.push({
                    scopeSet: stx.context,
                    binding: name,
                    phase: phase
                });
                this._map.set(key775, old776);
            },
            writable: true,
            configurable: true
        },
        addForward: {
            value: function addForward(stx, to, phase) {
                assert772(phase != null, "must pass in the phase");
                var key775 = stx.token.value;
                var old776 = this._map.get(key775);
                old776 = old776 ? old776 : [];
                old776.push({
                    scopeSet: stx.context,
                    binding: to,
                    phase: phase
                });
                this._map.set(key775, old776);
            },
            writable: true,
            configurable: true
        },
        get: {
            value: function get(key775) {
                return this._map.get(key775);
            },
            writable: true,
            configurable: true
        }
    });

    return BindingMap;
})();

module.exports = BindingMap;
//# sourceMappingURL=bindingMap.js.map