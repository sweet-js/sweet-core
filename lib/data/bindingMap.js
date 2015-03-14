"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _744 = require("underscore"),
    assert745 = require("assert"),
    Immutable746 = require("immutable"),
    StringMap747 = require("./stringMap");

var BindingMap = (function () {
    function BindingMap() {
        _classCallCheck(this, BindingMap);

        this._map = new StringMap747();
    }

    _prototypeProperties(BindingMap, null, {
        add: {
            value: function add(stx, name, phase) {
                assert745(phase != null, "must pass in the phase");
                var key748 = stx.token.value;
                var old749 = this._map.get(key748);
                old749 = old749 ? old749 : [];
                old749.push({
                    scopeSet: stx.context,
                    binding: name,
                    phase: phase
                });
                this._map.set(key748, old749);
            },
            writable: true,
            configurable: true
        },
        get: {
            value: function get(key748) {
                return this._map.get(key748);
            },
            writable: true,
            configurable: true
        }
    });

    return BindingMap;
})();

module.exports = BindingMap;
//# sourceMappingURL=bindingMap.js.map