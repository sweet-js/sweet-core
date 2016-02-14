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

  // given a syntax object and a binding,
  // add the binding to the map associating the binding with the syntax object's
  // scope set


  _createClass(BindingMap, [{
    key: "add",
    value: function add(stx, _ref) {
      var binding = _ref.binding;
      var phase = _ref.phase;
      var _ref$skipDup = _ref.skipDup;
      var skipDup = _ref$skipDup === undefined ? false : _ref$skipDup;

      var stxName = stx.val();

      if (this._map.has(stxName)) {
        var scopesetBindingList = this._map.get(stxName);
        if (skipDup && scopesetBindingList.some(function (s) {
          return s.scopes.equals(stx.context.scopeset);
        })) {
          return;
        }
        this._map.set(stxName, scopesetBindingList.push({
          scopes: stx.context.scopeset,
          binding: binding,
          alias: _ramdaFantasy.Maybe.Nothing()
        }));
      } else {
        this._map.set(stxName, _immutable.List.of({
          scopes: stx.context.scopeset,
          binding: binding,
          alias: _ramdaFantasy.Maybe.Nothing()
        }));
      }
    }
  }, {
    key: "addForward",
    value: function addForward(stx, forwardStx, binding) {
      var phase = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

      var stxName = stx.token.value;

      if (this._map.has(stxName)) {
        var scopesetBindingList = this._map.get(stxName);
        this._map.set(stxName, scopesetBindingList.push({
          scopes: stx.context.scopeset,
          binding: binding,
          alias: _ramdaFantasy.Maybe.of(forwardStx)
        }));
      } else {
        this._map.set(stxName, _immutable.List.of({
          scopes: stx.context.scopeset,
          binding: binding,
          alias: _ramdaFantasy.Maybe.of(forwardStx)
        }));
      }
    }

    // Syntax -> ?List<{ scopes: ScopeSet, binding: Binding }>

  }, {
    key: "get",
    value: function get(stx) {
      return this._map.get(stx.token.value);
    }
  }]);

  return BindingMap;
}();

exports.default = BindingMap;
//# sourceMappingURL=binding-map.js.map
