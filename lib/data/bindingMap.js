"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _793 = require("underscore"),
    assert794 = require("assert"),
    Immutable795 = require("immutable"),
    StringMap796 = require("./stringMap");

var BindingMap = (function () {
    function BindingMap() {
        _classCallCheck(this, BindingMap);

        this._map = new StringMap796();
    }

    _prototypeProperties(BindingMap, null, {
        add: {
            value: function add(stx, name, phase) {
                assert794(phase != null, "must pass in the phase");
                var key797 = stx.token.value;
                var old798 = this._map.get(key797);
                old798 = old798 ? old798 : [];
                old798.push({
                    scopeSet: stx.context,
                    binding: name,
                    phase: phase
                });
                this._map.set(key797, old798);
            },
            writable: true,
            configurable: true
        },
        addForward: {
            value: function addForward(stx, to, phase) {
                assert794(phase != null, "must pass in the phase");
                var key797 = stx.token.value;
                var old798 = this._map.get(key797);
                old798 = old798 ? old798 : [];
                old798.push({
                    scopeSet: stx.context,
                    binding: to,
                    phase: phase
                });
                this._map.set(key797, old798);
            },
            writable: true,
            configurable: true
        },
        get: {
            value: function get(key797) {
                return this._map.get(key797);
            },
            writable: true,
            configurable: true
        }
    });

    return BindingMap;
})();

module.exports = BindingMap;
//# sourceMappingURL=bindingMap.js.map