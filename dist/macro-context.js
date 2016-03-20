"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyntaxOrTermWrapper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.unwrap = unwrap;

var _mapSyntaxReducer = require("./map-syntax-reducer");

var _mapSyntaxReducer2 = _interopRequireDefault(_mapSyntaxReducer);

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _immutable = require("immutable");

var _enforester = require("./enforester");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _ramdaFantasy = require("ramda-fantasy");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Just_312 = _ramdaFantasy.Maybe.Just;var Nothing_313 = _ramdaFantasy.Maybe.Nothing;var symWrap_314 = Symbol("wrapper");var isKind_315 = _.curry(function (kind, t, v) {
  if (t instanceof _syntax2.default) {
    return t[kind]() && (v == null || t.val() == v);
  }
});var isKeyword_316 = isKind_315("isKeyword");var isIdentifier_317 = isKind_315("isIdentifier");var isNumericLiteral_318 = isKind_315("isNumericLiteral");var isStringLiteral_319 = isKind_315("isStringLiteral");var isNullLiteral_320 = isKind_315("isNullLiteral");var isPunctuator_321 = isKind_315("isPunctuator");var isRegularExpression_322 = isKind_315("isRegularExpression");var isBraces_323 = isKind_315("isBraces");var isBrackets_324 = isKind_315("isBrackets");var isParens_325 = isKind_315("isParens");var isDelimiter_326 = isKind_315("isDelimiter");var getLineNumber_327 = function getLineNumber_327(t) {
  if (t instanceof _syntax2.default) {
    return t.lineNumber();
  }throw new Error("Line numbers on terms not implemented yet");
};var getVal_328 = function getVal_328(t) {
  if (isDelimiter_326(t)) {
    return Nothing_313();
  }if (t instanceof _syntax2.default) {
    return Just_312(t.val());
  }return Nothing_313();
};
var SyntaxOrTermWrapper = exports.SyntaxOrTermWrapper = function () {
  function SyntaxOrTermWrapper(s_329) {
    var context_330 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, SyntaxOrTermWrapper);

    this[symWrap_314] = s_329;this.context = context_330;
  }

  _createClass(SyntaxOrTermWrapper, [{
    key: "isKeyword",
    value: function isKeyword(value_331) {
      return isKeyword_316(this[symWrap_314], value_331);
    }
  }, {
    key: "isIdentifier",
    value: function isIdentifier(value_332) {
      return isIdentifier_317(this[symWrap_314], value_332);
    }
  }, {
    key: "isNumericLiteral",
    value: function isNumericLiteral(value_333) {
      return isNumericLiteral_318(this[symWrap_314], value_333);
    }
  }, {
    key: "isStringLiteral",
    value: function isStringLiteral(value_334) {
      return isStringLiteral_319(this[symWrap_314], value_334);
    }
  }, {
    key: "isNullLiteral",
    value: function isNullLiteral(value_335) {
      return isNullLiteral_320(this[symWrap_314], value_335);
    }
  }, {
    key: "isPunctuator",
    value: function isPunctuator(value_336) {
      return isPunctuator_321(this[symWrap_314], value_336);
    }
  }, {
    key: "isRegularExpression",
    value: function isRegularExpression(value_337) {
      return isRegularExpression_322(this[symWrap_314], value_337);
    }
  }, {
    key: "isBraces",
    value: function isBraces(value_338) {
      return isBraces_323(this[symWrap_314], value_338);
    }
  }, {
    key: "isBrackets",
    value: function isBrackets(value_339) {
      return isBrackets_324(this[symWrap_314], value_339);
    }
  }, {
    key: "isParens",
    value: function isParens(value_340) {
      return isParens_325(this[symWrap_314], value_340);
    }
  }, {
    key: "isDelimiter",
    value: function isDelimiter(value_341) {
      return isDelimiter_326(this[symWrap_314], value_341);
    }
  }, {
    key: "lineNumber",
    value: function lineNumber() {
      return getLineNumber_327(this[symWrap_314]);
    }
  }, {
    key: "val",
    value: function val() {
      return getVal_328(this[symWrap_314]);
    }
  }, {
    key: "inner",
    value: function inner() {
      var stx_342 = this[symWrap_314];if (!isDelimiter_326(stx_342)) {
        throw new Error("Can only get inner syntax on a delimiter");
      }var enf_343 = new _enforester.Enforester(stx_342.inner(), (0, _immutable.List)(), this.context);return new MacroContext(enf_343, "inner", this.context);
    }
  }]);

  return SyntaxOrTermWrapper;
}();

function unwrap(x_344) {
  if (x_344 instanceof SyntaxOrTermWrapper) {
    return x_344[symWrap_314];
  }return x_344;
}
var MacroContext = function () {
  function MacroContext(enf_345, name_346, context_347, useScope_348, introducedScope_349) {
    var _this = this;

    _classCallCheck(this, MacroContext);

    this._enf = enf_345;this.name = name_346;this.context = context_347;if (useScope_348 && introducedScope_349) {
      this.noScopes = false;this.useScope = useScope_348;this.introducedScope = introducedScope_349;
    } else {
      this.noScopes = true;
    }this[Symbol.iterator] = function () {
      return _this;
    };
  }

  _createClass(MacroContext, [{
    key: "next",
    value: function next() {
      var type_350 = arguments.length <= 0 || arguments[0] === undefined ? "Syntax" : arguments[0];
      if (this._enf.rest.size === 0) {
        return { done: true, value: null };
      }var value_351 = void 0;switch (type_350) {case "AssignmentExpression":case "expr":
          value_351 = this._enf.enforestExpressionLoop();break;case "Expression":
          value_351 = this._enf.enforestExpression();break;case "Syntax":
          value_351 = this._enf.advance();if (!this.noScopes) {
            value_351 = value_351.addScope(this.useScope).addScope(this.introducedScope, this.context.bindings, { flip: true });
          }break;default:
          throw new Error("Unknown term type: " + type_350);}return { done: false, value: new SyntaxOrTermWrapper(value_351, this.context) };
    }
  }]);

  return MacroContext;
}();

exports.default = MacroContext;
//# sourceMappingURL=macro-context.js.map
