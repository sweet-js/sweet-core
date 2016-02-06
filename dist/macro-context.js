"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mapSyntaxReducer = require("./map-syntax-reducer");

var _mapSyntaxReducer2 = _interopRequireDefault(_mapSyntaxReducer);

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _immutable = require("immutable");

var _enforester = require("./enforester");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
ctx :: {
  of: (Syntax) -> ctx
  next: (String) -> Syntax or Term
}
*/

var MacroContext = function () {
  function MacroContext(enf, name, context, useScope, introducedScope) {
    var _this = this;

    _classCallCheck(this, MacroContext);

    // todo: perhaps replace with a symbol to keep mostly private?
    this._enf = enf;
    this.name = name;
    this.context = context;
    if (useScope && introducedScope) {
      this.noScopes = false;
      this.useScope = useScope;
      this.introducedScope = introducedScope;
    } else {
      this.noScopes = true;
    }
    this[Symbol.iterator] = function () {
      return _this;
    };
  }

  _createClass(MacroContext, [{
    key: "next",
    value: function next() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'Syntax' : arguments[0];

      if (this._enf.rest.size === 0) {
        return {
          done: true,
          value: null
        };
      }
      var value = undefined;
      switch (type) {
        case 'AssignmentExpression':
        case 'expr':
          value = this._enf.enforestExpressionLoop();
          break;
        case 'Expression':
          value = this._enf.enforestExpression();
          break;
        case 'Syntax':
          value = this._enf.advance();
          if (!this.noScopes) {
            value = value.addScope(this.useScope).addScope(this.introducedScope, this.context.bindings, { flip: true });
          }
          break;
        default:
          throw new Error('Unknown term type: ' + type);
      }
      return {
        done: false,
        value: value
      };
    }
  }, {
    key: "of",
    value: function of(syn) {
      var enf = undefined;
      if (_immutable.List.isList(syn)) {
        enf = new _enforester.Enforester(syn, (0, _immutable.List)(), this.context);
      } else if (syn && typeof syn.isDelimiter === 'function' && syn.isDelimiter()) {
        enf = new _enforester.Enforester(syn.inner(), (0, _immutable.List)(), this.context);
      } else {
        throw new Error('Cannot create a subcontext for unknown syntax type: ' + stxl);
      }
      return new MacroContext(enf, this.name, this.context);
    }
  }]);

  return MacroContext;
}();

exports.default = MacroContext;
//# sourceMappingURL=macro-context.js.map
