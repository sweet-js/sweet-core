"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _symbol = require("./symbol");

var _transforms = require("./transforms");

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScopeApplyingReducer = function () {
  function ScopeApplyingReducer(scope_0, context_1) {
    var phase_2 = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    _classCallCheck(this, ScopeApplyingReducer);

    this.context = context_1;this.scope = scope_0;this.phase = phase_2;
  }

  _createClass(ScopeApplyingReducer, [{
    key: "transform",
    value: function transform(term_3) {
      var field_4 = "transform" + term_3.type;if (typeof this[field_4] === "function") {
        return this[field_4](term_3);
      }(0, _errors.assert)(false, "transform not implemented yet for: " + term_3.type);
    }
  }, {
    key: "transformFormalParameters",
    value: function transformFormalParameters(term_5) {
      var _this = this;

      var rest_6 = term_5.rest == null ? null : this.transform(term_5.rest);return new _terms2.default("FormalParameters", { items: term_5.items.map(function (it) {
          return _this.transform(it);
        }), rest: rest_6 });
    }
  }, {
    key: "transformBindingWithDefault",
    value: function transformBindingWithDefault(term_7) {
      return new _terms2.default("BindingWithDefault", { binding: this.transform(term_7.binding), init: term_7.init });
    }
  }, {
    key: "transformObjectBinding",
    value: function transformObjectBinding(term_8) {
      return term_8;
    }
  }, {
    key: "transformBindingPropertyIdentifier",
    value: function transformBindingPropertyIdentifier(term_9) {
      return new _terms2.default("BindingPropertyIdentifier", { binding: this.transform(term_9.binding), init: term_9.init });
    }
  }, {
    key: "transformBindingPropertyProperty",
    value: function transformBindingPropertyProperty(term_10) {
      return new _terms2.default("BindingPropertyProperty", { name: term_10.name, binding: this.transform(term_10.binding) });
    }
  }, {
    key: "transformArrayBinding",
    value: function transformArrayBinding(term_11) {
      var _this2 = this;

      return new _terms2.default("ArrayBinding", { elements: term_11.elements.map(function (el) {
          return _this2.transform(el);
        }), restElement: term_11.restElement == null ? null : this.transform(term_11.restElement) });
    }
  }, {
    key: "transformBindingIdentifier",
    value: function transformBindingIdentifier(term_12) {
      var name_13 = term_12.name.addScope(this.scope, this.context.bindings);var newBinding_14 = (0, _symbol.gensym)(name_13.val());this.context.env.set(newBinding_14.toString(), new _transforms.VarBindingTransform(name_13));this.context.bindings.add(name_13, { binding: newBinding_14, phase: this.phase, skipDup: true });return new _terms2.default("BindingIdentifier", { name: name_13 });
    }
  }]);

  return ScopeApplyingReducer;
}();

exports.default = ScopeApplyingReducer;
//# sourceMappingURL=apply-scope-in-params-reducer.js.map
