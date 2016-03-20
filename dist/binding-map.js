"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require("immutable");

var _errors = require("./errors");

var _ramdaFantasy = require("ramda-fantasy");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BindingMap = function () {
  function BindingMap() {
    _classCallCheck(this, BindingMap);

    this._map = new Map();
  }

  _createClass(BindingMap, [{
    key: "add",
    value: function add(stx_15, _ref) {
      var binding = _ref.binding;
      var phase = _ref.phase;
      var _ref$skipDup = _ref.skipDup;
      var skipDup = _ref$skipDup === undefined ? false : _ref$skipDup;
      var stxName_16 = stx_15.val();if (this._map.has(stxName_16)) {
        var scopesetBindingList = this._map.get(stxName_16);if (skipDup && scopesetBindingList.some(function (s) {
          return s.scopes.equals(stx_15.context.scopeset);
        })) {
          return;
        }this._map.set(stxName_16, scopesetBindingList.push({ scopes: stx_15.context.scopeset, binding: binding, alias: _ramdaFantasy.Maybe.Nothing() }));
      } else {
        this._map.set(stxName_16, _immutable.List.of({ scopes: stx_15.context.scopeset, binding: binding, alias: _ramdaFantasy.Maybe.Nothing() }));
      }
    }
  }, {
    key: "addForward",
    value: function addForward(stx_17, forwardStx_18, binding_19) {
      var phase_20 = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
      var stxName_21 = stx_17.token.value;if (this._map.has(stxName_21)) {
        var scopesetBindingList = this._map.get(stxName_21);this._map.set(stxName_21, scopesetBindingList.push({ scopes: stx_17.context.scopeset, binding: binding_19, alias: _ramdaFantasy.Maybe.of(forwardStx_18) }));
      } else {
        this._map.set(stxName_21, _immutable.List.of({ scopes: stx_17.context.scopeset, binding: binding_19, alias: _ramdaFantasy.Maybe.of(forwardStx_18) }));
      }
    }
  }, {
    key: "get",
    value: function get(stx_22) {
      return this._map.get(stx_22.token.value);
    }
  }]);

  return BindingMap;
}();

exports.default = BindingMap;
//# sourceMappingURL=binding-map.js.map
