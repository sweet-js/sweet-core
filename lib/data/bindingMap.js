"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _791 = require("underscore"),
    assert792 = require("assert"),
    Immutable793 = require("immutable"),
    StringMap794 = require("./stringMap");

var BindingMap = (function () {
    function BindingMap() {
        _classCallCheck(this, BindingMap);

        this._map = new StringMap794();
    }

    _prototypeProperties(BindingMap, null, {
        add: {
            value: function add(stx, name, phase) {
                assert792(phase != null, "must pass in the phase");
                var key795 = stx.token.value;
                var old796 = this._map.get(key795);
                old796 = old796 ? old796 : [];
                old796.push({
                    scopeSet: stx.context,
                    binding: name,
                    phase: phase
                });
                this._map.set(key795, old796);
            },
            writable: true,
            configurable: true
        },
        addForward: {
            value: function addForward(stx, to, phase) {
                assert792(phase != null, "must pass in the phase");
                var key795 = stx.token.value;
                var old796 = this._map.get(key795);
                old796 = old796 ? old796 : [];
                old796.push({
                    scopeSet: stx.context,
                    binding: to,
                    phase: phase
                });
                this._map.set(key795, old796);
            },
            writable: true,
            configurable: true
        },
        get: {
            value: function get(key795) {
                return this._map.get(key795);
            },
            writable: true,
            configurable: true
        }
    });

    return BindingMap;
})();

module.exports = BindingMap;
//# sourceMappingURL=bindingMap.js.map