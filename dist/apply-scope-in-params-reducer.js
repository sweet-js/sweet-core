"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

var _symbol = require("./symbol");

var _transforms = require("./transforms");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ScopeApplyingReducer = function (_CloneReducer) {
  _inherits(ScopeApplyingReducer, _CloneReducer);

  function ScopeApplyingReducer(scope, context) {
    var phase = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    _classCallCheck(this, ScopeApplyingReducer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ScopeApplyingReducer).call(this));

    _this.context = context;
    _this.scope = scope;
    _this.phase = phase;
    return _this;
  }

  _createClass(ScopeApplyingReducer, [{
    key: "reduceBindingIdentifier",
    value: function reduceBindingIdentifier(node, state) {
      var name = node.name.addScope(this.scope, this.context.bindings);
      var newBinding = (0, _symbol.gensym)(name.val());

      this.context.env.set(newBinding.toString(), new _transforms.VarBindingTransform(name));
      this.context.bindings.add(name, {
        binding: newBinding,
        phase: this.phase,
        skipDup: true
      });

      return new _terms2.default("BindingIdentifier", {
        name: name
      });
    }
  }]);

  return ScopeApplyingReducer;
}(_shiftReducer.CloneReducer);

exports.default = ScopeApplyingReducer;
//# sourceMappingURL=apply-scope-in-params-reducer.js.map
