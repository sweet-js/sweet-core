"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyntaxOrTermWrapper = undefined;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var Just_333 = _ramdaFantasy.Maybe.Just;
var Nothing_334 = _ramdaFantasy.Maybe.Nothing;
var symWrap_335 = Symbol("wrapper");
var isKind_336 = _.curry(function (kind_350, t_351, v_352) {
  if (t_351 instanceof _syntax2.default) {
    return t_351[kind_350]() && (v_352 == null || t_351.val() == v_352);
  }
});
var isKeyword_337 = isKind_336("isKeyword");
var isIdentifier_338 = isKind_336("isIdentifier");
var isNumericLiteral_339 = isKind_336("isNumericLiteral");
var isStringLiteral_340 = isKind_336("isStringLiteral");
var isNullLiteral_341 = isKind_336("isNullLiteral");
var isPunctuator_342 = isKind_336("isPunctuator");
var isRegularExpression_343 = isKind_336("isRegularExpression");
var isBraces_344 = isKind_336("isBraces");
var isBrackets_345 = isKind_336("isBrackets");
var isParens_346 = isKind_336("isParens");
var isDelimiter_347 = isKind_336("isDelimiter");
var getLineNumber_348 = function getLineNumber_348(t_353) {
  if (t_353 instanceof _syntax2.default) {
    return t_353.lineNumber();
  }
  throw new Error("Line numbers on terms not implemented yet");
};
var getVal_349 = function getVal_349(t_354) {
  if (isDelimiter_347(t_354, null)) {
    return null;
  }
  if (t_354 instanceof _syntax2.default) {
    return t_354.val();
  }
  return null;
};

var SyntaxOrTermWrapper = exports.SyntaxOrTermWrapper = (function () {
  function SyntaxOrTermWrapper(s_355) {
    var context_356 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, SyntaxOrTermWrapper);

    this[symWrap_335] = s_355;
    this.context = context_356;
  }

  _createClass(SyntaxOrTermWrapper, [{
    key: "isKeyword",
    value: function isKeyword(value_357) {
      return isKeyword_337(this[symWrap_335], value_357);
    }
  }, {
    key: "isIdentifier",
    value: function isIdentifier(value_358) {
      return isIdentifier_338(this[symWrap_335], value_358);
    }
  }, {
    key: "isNumericLiteral",
    value: function isNumericLiteral(value_359) {
      return isNumericLiteral_339(this[symWrap_335], value_359);
    }
  }, {
    key: "isStringLiteral",
    value: function isStringLiteral(value_360) {
      return isStringLiteral_340(this[symWrap_335], value_360);
    }
  }, {
    key: "isNullLiteral",
    value: function isNullLiteral(value_361) {
      return isNullLiteral_341(this[symWrap_335], value_361);
    }
  }, {
    key: "isPunctuator",
    value: function isPunctuator(value_362) {
      return isPunctuator_342(this[symWrap_335], value_362);
    }
  }, {
    key: "isRegularExpression",
    value: function isRegularExpression(value_363) {
      return isRegularExpression_343(this[symWrap_335], value_363);
    }
  }, {
    key: "isBraces",
    value: function isBraces(value_364) {
      return isBraces_344(this[symWrap_335], value_364);
    }
  }, {
    key: "isBrackets",
    value: function isBrackets(value_365) {
      return isBrackets_345(this[symWrap_335], value_365);
    }
  }, {
    key: "isParens",
    value: function isParens(value_366) {
      return isParens_346(this[symWrap_335], value_366);
    }
  }, {
    key: "isDelimiter",
    value: function isDelimiter(value_367) {
      return isDelimiter_347(this[symWrap_335], value_367);
    }
  }, {
    key: "lineNumber",
    value: function lineNumber() {
      return getLineNumber_348(this[symWrap_335]);
    }
  }, {
    key: "val",
    value: function val() {
      return getVal_349(this[symWrap_335]);
    }
  }, {
    key: "inner",
    value: function inner() {
      var stx_368 = this[symWrap_335];
      if (!isDelimiter_347(stx_368, null)) {
        throw new Error("Can only get inner syntax on a delimiter");
      }
      var enf_369 = new _enforester.Enforester(stx_368.inner(), (0, _immutable.List)(), this.context);
      return new MacroContext(enf_369, "inner", this.context);
    }
  }]);

  return SyntaxOrTermWrapper;
})();

function unwrap(x_370) {
  if (x_370 instanceof SyntaxOrTermWrapper) {
    return x_370[symWrap_335];
  }
  return x_370;
}

var MacroContext = (function () {
  function MacroContext(enf_371, name_372, context_373, useScope_374, introducedScope_375) {
    var _this = this;

    _classCallCheck(this, MacroContext);

    this._enf = enf_371;
    this.name = name_372;
    this.context = context_373;
    if (useScope_374 && introducedScope_375) {
      this.noScopes = false;
      this.useScope = useScope_374;
      this.introducedScope = introducedScope_375;
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
      var type_376 = arguments.length <= 0 || arguments[0] === undefined ? "Syntax" : arguments[0];

      if (this._enf.rest.size === 0) {
        return { done: true, value: null };
      }
      var value_377 = undefined;
      switch (type_376) {
        case "AssignmentExpression":
        case "expr":
          value_377 = this._enf.enforestExpressionLoop();
          break;
        case "Expression":
          value_377 = this._enf.enforestExpression();
          break;
        case "Syntax":
          value_377 = this._enf.advance();
          if (!this.noScopes) {
            value_377 = value_377.addScope(this.useScope).addScope(this.introducedScope, this.context.bindings, { flip: true });
          }
          break;
        default:
          throw new Error("Unknown term type: " + type_376);
      }
      return { done: false, value: new SyntaxOrTermWrapper(value_377, this.context) };
    }
  }, {
    key: "read",
    value: function read(type_378, value_379, errorHandler_380) {
      var isGrammarProd_381 = type_378 == "expr",
          next_382 = this.next(isGrammarProd_381 ? type_378 : void 0);
      if (typeof type_378 == "function") {
        errorHandler_380 = type_378;
        type_378 = void 0;
      } else if (typeof value_379 == "function") {
        errorHandler_380 = value_379;
        value_379 = void 0;
      }
      errorHandler_380 = errorHandler_380 || function (err_383) {
        throw err_383;
      };
      if (next_382.done) {
        var error = new ReferenceError("Expected " + (type_378 || "a syntax object") + ", reached end of context");
        errorHandler_380(error);
      } else if (type_378 && !isGrammarProd_381) {
        type_378 = type_378.charAt(0).toUpperCase() + type_378.slice(1);
        if (!next_382.value["is" + type_378]) {
          errorHandler_380(TypeError(type_378 + " is not a valid type"));
        } else if (!next_382.value["is" + type_378](value_379)) {
          var error = "Expected " + type_378;
          if (value_379) {
            error += ": " + value_379;
          }
          errorHandler_380(SyntaxError(error));
        }
      }
      return next_382.value;
    }
  }]);

  return MacroContext;
})();

exports.default = MacroContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hY3JvLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O1FBOEZnQixNQUFNLEdBQU4sTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUF6RlQsQ0FBQzs7Ozs7Ozs7OztBQUVkLElBQU0sUUFBUSxHQUFHLG9CQUFNLElBQUksQ0FBQztBQUM1QixJQUFNLFdBQVcsR0FBRyxvQkFBTSxPQUFPLENBQUM7QUFDbEMsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RDLElBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBSztBQUNyRCxNQUFJLEtBQUssNEJBQWtCLEVBQUU7QUFDM0IsV0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLENBQUEsQUFBQyxDQUFDO0dBQ3JFO0NBQ0YsQ0FBQyxDQUFDO0FBQ0gsSUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlDLElBQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BELElBQU0sb0JBQW9CLEdBQUcsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDNUQsSUFBTSxtQkFBbUIsR0FBRyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMxRCxJQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN0RCxJQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwRCxJQUFNLHVCQUF1QixHQUFHLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ2xFLElBQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM1QyxJQUFNLGNBQWMsR0FB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SSxLQUFLLEdBQUcsV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUNuQyxjQUFJLFNBQVMsRUFBRTtBQUNiLGlCQUFLLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQztXQUMzQjtBQUNELDBCQUFnQixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO09BQ0Y7QUFDRCxhQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUM7S0FDdkI7OztTQWxFa0IsWUFBWTs7O2tCQUFaLFlBQVkiLCJmaWxlIjoibWFjcm8tY29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBNYXBTeW50YXhSZWR1Y2VyIGZyb20gXCIuL21hcC1zeW50YXgtcmVkdWNlclwiO1xuaW1wb3J0IHJlZHVjZXIgZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHtFbmZvcmVzdGVyfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQge01heWJlfSBmcm9tIFwicmFtZGEtZmFudGFzeVwiO1xuY29uc3QgSnVzdF8zMzMgPSBNYXliZS5KdXN0O1xuY29uc3QgTm90aGluZ18zMzQgPSBNYXliZS5Ob3RoaW5nO1xuY29uc3Qgc3ltV3JhcF8zMzUgPSBTeW1ib2woXCJ3cmFwcGVyXCIpO1xuY29uc3QgaXNLaW5kXzMzNiA9IF8uY3VycnkoKGtpbmRfMzUwLCB0XzM1MSwgdl8zNTIpID0+IHtcbiAgaWYgKHRfMzUxIGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgcmV0dXJuIHRfMzUxW2tpbmRfMzUwXSgpICYmICh2XzM1MiA9PSBudWxsIHx8IHRfMzUxLnZhbCgpID09IHZfMzUyKTtcbiAgfVxufSk7XG5jb25zdCBpc0tleXdvcmRfMzM3ID0gaXNLaW5kXzMzNihcImlzS2V5d29yZFwiKTtcbmNvbnN0IGlzSWRlbnRpZmllcl8zMzggPSBpc0tpbmRfMzM2KFwiaXNJZGVudGlmaWVyXCIpO1xuY29uc3QgaXNOdW1lcmljTGl0ZXJhbF8zMzkgPSBpc0tpbmRfMzM2KFwiaXNOdW1lcmljTGl0ZXJhbFwiKTtcbmNvbnN0IGlzU3RyaW5nTGl0ZXJhbF8zNDAgPSBpc0tpbmRfMzM2KFwiaXNTdHJpbmdMaXRlcmFsXCIpO1xuY29uc3QgaXNOdWxsTGl0ZXJhbF8zNDEgPSBpc0tpbmRfMzM2KFwiaXNOdWxsTGl0ZXJhbFwiKTtcbmNvbnN0IGlzUHVuY3R1YXRvcl8zNDIgPSBpc0tpbmRfMzM2KFwiaXNQdW5jdHVhdG9yXCIpO1xuY29uc3QgaXNSZWd1bGFyRXhwcmVzc2lvbl8zNDMgPSBpc0tpbmRfMzM2KFwiaXNSZWd1bGFyRXhwcmVzc2lvblwiKTtcbmNvbnN0IGlzQnJhY2VzXzM0NCA9IGlzS2luZF8zMzYoXCJpc0JyYWNlc1wiKTtcbmNvbnN0IGlzQnJhY2tldHNfMzQ1ID0gaXNLaW5kXzMzNihcImlzQnJhY2tldHNcIik7XG5jb25zdCBpc1BhcmVuc18zNDYgPSBpc0tpbmRfMzM2KFwiaXNQYXJlbnNcIik7XG5jb25zdCBpc0RlbGltaXRlcl8zNDcgPSBpc0tpbmRfMzM2KFwiaXNEZWxpbWl0ZXJcIik7XG5jb25zdCBnZXRMaW5lTnVtYmVyXzM0OCA9IHRfMzUzID0+IHtcbiAgaWYgKHRfMzUzIGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgcmV0dXJuIHRfMzUzLmxpbmVOdW1iZXIoKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoXCJMaW5lIG51bWJlcnMgb24gdGVybXMgbm90IGltcGxlbWVudGVkIHlldFwiKTtcbn07XG5jb25zdCBnZXRWYWxfMzQ5ID0gdF8zNTQgPT4ge1xuICBpZiAoaXNEZWxpbWl0ZXJfMzQ3KHRfMzU0LCBudWxsKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh0XzM1NCBpbnN0YW5jZW9mIFN5bnRheCkge1xuICAgIHJldHVybiB0XzM1NC52YWwoKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5leHBvcnQgY2xhc3MgU3ludGF4T3JUZXJtV3JhcHBlciB7XG4gIGNvbnN0cnVjdG9yKHNfMzU1LCBjb250ZXh0XzM1NiA9IHt9KSB7XG4gICAgdGhpc1tzeW1XcmFwXzMzNV0gPSBzXzM1NTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzM1NjtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfMzU3KSB7XG4gICAgcmV0dXJuIGlzS2V5d29yZF8zMzcodGhpc1tzeW1XcmFwXzMzNV0sIHZhbHVlXzM1Nyk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzM1OCkge1xuICAgIHJldHVybiBpc0lkZW50aWZpZXJfMzM4KHRoaXNbc3ltV3JhcF8zMzVdLCB2YWx1ZV8zNTgpO1xuICB9XG4gIGlzTnVtZXJpY0xpdGVyYWwodmFsdWVfMzU5KSB7XG4gICAgcmV0dXJuIGlzTnVtZXJpY0xpdGVyYWxfMzM5KHRoaXNbc3ltV3JhcF8zMzVdLCB2YWx1ZV8zNTkpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV8zNjApIHtcbiAgICByZXR1cm4gaXNTdHJpbmdMaXRlcmFsXzM0MCh0aGlzW3N5bVdyYXBfMzM1XSwgdmFsdWVfMzYwKTtcbiAgfVxuICBpc051bGxMaXRlcmFsKHZhbHVlXzM2MSkge1xuICAgIHJldHVybiBpc051bGxMaXRlcmFsXzM0MSh0aGlzW3N5bVdyYXBfMzM1XSwgdmFsdWVfMzYxKTtcbiAgfVxuICBpc1B1bmN0dWF0b3IodmFsdWVfMzYyKSB7XG4gICAgcmV0dXJuIGlzUHVuY3R1YXRvcl8zNDIodGhpc1tzeW1XcmFwXzMzNV0sIHZhbHVlXzM2Mik7XG4gIH1cbiAgaXNSZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV8zNjMpIHtcbiAgICByZXR1cm4gaXNSZWd1bGFyRXhwcmVzc2lvbl8zNDModGhpc1tzeW1XcmFwXzMzNV0sIHZhbHVlXzM2Myk7XG4gIH1cbiAgaXNCcmFjZXModmFsdWVfMzY0KSB7XG4gICAgcmV0dXJuIGlzQnJhY2VzXzM0NCh0aGlzW3N5bVdyYXBfMzM1XSwgdmFsdWVfMzY0KTtcbiAgfVxuICBpc0JyYWNrZXRzKHZhbHVlXzM2NSkge1xuICAgIHJldHVybiBpc0JyYWNrZXRzXzM0NSh0aGlzW3N5bVdyYXBfMzM1XSwgdmFsdWVfMzY1KTtcbiAgfVxuICBpc1BhcmVucyh2YWx1ZV8zNjYpIHtcbiAgICByZXR1cm4gaXNQYXJlbnNfMzQ2KHRoaXNbc3ltV3JhcF8zMzVdLCB2YWx1ZV8zNjYpO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzM2Nykge1xuICAgIHJldHVybiBpc0RlbGltaXRlcl8zNDcodGhpc1tzeW1XcmFwXzMzNV0sIHZhbHVlXzM2Nyk7XG4gIH1cbiAgbGluZU51bWJlcigpIHtcbiAgICByZXR1cm4gZ2V0TGluZU51bWJlcl8zNDgodGhpc1tzeW1XcmFwXzMzNV0pO1xuICB9XG4gIHZhbCgpIHtcbiAgICByZXR1cm4gZ2V0VmFsXzM0OSh0aGlzW3N5bVdyYXBfMzM1XSk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgbGV0IHN0eF8zNjggPSB0aGlzW3N5bVdyYXBfMzM1XTtcbiAgICBpZiAoIWlzRGVsaW1pdGVyXzM0NyhzdHhfMzY4LCBudWxsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG9ubHkgZ2V0IGlubmVyIHN5bnRheCBvbiBhIGRlbGltaXRlclwiKTtcbiAgICB9XG4gICAgbGV0IGVuZl8zNjkgPSBuZXcgRW5mb3Jlc3RlcihzdHhfMzY4LmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICByZXR1cm4gbmV3IE1hY3JvQ29udGV4dChlbmZfMzY5LCBcImlubmVyXCIsIHRoaXMuY29udGV4dCk7XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXAoeF8zNzApIHtcbiAgaWYgKHhfMzcwIGluc3RhbmNlb2YgU3ludGF4T3JUZXJtV3JhcHBlcikge1xuICAgIHJldHVybiB4XzM3MFtzeW1XcmFwXzMzNV07XG4gIH1cbiAgcmV0dXJuIHhfMzcwO1xufVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFjcm9Db250ZXh0IHtcbiAgY29uc3RydWN0b3IoZW5mXzM3MSwgbmFtZV8zNzIsIGNvbnRleHRfMzczLCB1c2VTY29wZV8zNzQsIGludHJvZHVjZWRTY29wZV8zNzUpIHtcbiAgICB0aGlzLl9lbmYgPSBlbmZfMzcxO1xuICAgIHRoaXMubmFtZSA9IG5hbWVfMzcyO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzczO1xuICAgIGlmICh1c2VTY29wZV8zNzQgJiYgaW50cm9kdWNlZFNjb3BlXzM3NSkge1xuICAgICAgdGhpcy5ub1Njb3BlcyA9IGZhbHNlO1xuICAgICAgdGhpcy51c2VTY29wZSA9IHVzZVNjb3BlXzM3NDtcbiAgICAgIHRoaXMuaW50cm9kdWNlZFNjb3BlID0gaW50cm9kdWNlZFNjb3BlXzM3NTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ub1Njb3BlcyA9IHRydWU7XG4gICAgfVxuICAgIHRoaXNbU3ltYm9sLml0ZXJhdG9yXSA9ICgpID0+IHRoaXM7XG4gIH1cbiAgbmV4dCh0eXBlXzM3NiA9IFwiU3ludGF4XCIpIHtcbiAgICBpZiAodGhpcy5fZW5mLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtkb25lOiB0cnVlLCB2YWx1ZTogbnVsbH07XG4gICAgfVxuICAgIGxldCB2YWx1ZV8zNzc7XG4gICAgc3dpdGNoICh0eXBlXzM3Nikge1xuICAgICAgY2FzZSBcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiZXhwclwiOlxuICAgICAgICB2YWx1ZV8zNzcgPSB0aGlzLl9lbmYuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzM3NyA9IHRoaXMuX2VuZi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiU3ludGF4XCI6XG4gICAgICAgIHZhbHVlXzM3NyA9IHRoaXMuX2VuZi5hZHZhbmNlKCk7XG4gICAgICAgIGlmICghdGhpcy5ub1Njb3Blcykge1xuICAgICAgICAgIHZhbHVlXzM3NyA9IHZhbHVlXzM3Ny5hZGRTY29wZSh0aGlzLnVzZVNjb3BlKS5hZGRTY29wZSh0aGlzLmludHJvZHVjZWRTY29wZSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCB7ZmxpcDogdHJ1ZX0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0ZXJtIHR5cGU6IFwiICsgdHlwZV8zNzYpO1xuICAgIH1cbiAgICByZXR1cm4ge2RvbmU6IGZhbHNlLCB2YWx1ZTogbmV3IFN5bnRheE9yVGVybVdyYXBwZXIodmFsdWVfMzc3LCB0aGlzLmNvbnRleHQpfTtcbiAgfVxuICByZWFkKHR5cGVfMzc4LCB2YWx1ZV8zNzksIGVycm9ySGFuZGxlcl8zODApIHtcbiAgICBsZXQgaXNHcmFtbWFyUHJvZF8zODEgPSB0eXBlXzM3OCA9PSBcImV4cHJcIiwgbmV4dF8zODIgPSB0aGlzLm5leHQoaXNHcmFtbWFyUHJvZF8zODEgPyB0eXBlXzM3OCA6IHZvaWQgMCk7XG4gICAgaWYgKHR5cGVvZiB0eXBlXzM3OCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGVycm9ySGFuZGxlcl8zODAgPSB0eXBlXzM3ODtcbiAgICAgIHR5cGVfMzc4ID0gdm9pZCAwO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlXzM3OSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGVycm9ySGFuZGxlcl8zODAgPSB2YWx1ZV8zNzk7XG4gICAgICB2YWx1ZV8zNzkgPSB2b2lkIDA7XG4gICAgfVxuICAgIGVycm9ySGFuZGxlcl8zODAgPSBlcnJvckhhbmRsZXJfMzgwIHx8IChlcnJfMzgzID0+IHtcbiAgICAgIHRocm93IGVycl8zODM7XG4gICAgfSk7XG4gICAgaWYgKG5leHRfMzgyLmRvbmUpIHtcbiAgICAgIGxldCBlcnJvciA9IG5ldyBSZWZlcmVuY2VFcnJvcihgRXhwZWN0ZWQgJHt0eXBlXzM3OCB8fCBcImEgc3ludGF4IG9iamVjdFwifSwgcmVhY2hlZCBlbmQgb2YgY29udGV4dGApO1xuICAgICAgZXJyb3JIYW5kbGVyXzM4MChlcnJvcik7XG4gICAgfSBlbHNlIGlmICh0eXBlXzM3OCAmJiAhaXNHcmFtbWFyUHJvZF8zODEpIHtcbiAgICAgIHR5cGVfMzc4ID0gdHlwZV8zNzguY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eXBlXzM3OC5zbGljZSgxKTtcbiAgICAgIGlmICghbmV4dF8zODIudmFsdWVbXCJpc1wiICsgdHlwZV8zNzhdKSB7XG4gICAgICAgIGVycm9ySGFuZGxlcl8zODAoVHlwZUVycm9yKHR5cGVfMzc4ICsgXCIgaXMgbm90IGEgdmFsaWQgdHlwZVwiKSk7XG4gICAgICB9IGVsc2UgaWYgKCFuZXh0XzM4Mi52YWx1ZVtcImlzXCIgKyB0eXBlXzM3OF0odmFsdWVfMzc5KSkge1xuICAgICAgICBsZXQgZXJyb3IgPSBcIkV4cGVjdGVkIFwiICsgdHlwZV8zNzg7XG4gICAgICAgIGlmICh2YWx1ZV8zNzkpIHtcbiAgICAgICAgICBlcnJvciArPSBcIjogXCIgKyB2YWx1ZV8zNzk7XG4gICAgICAgIH1cbiAgICAgICAgZXJyb3JIYW5kbGVyXzM4MChTeW50YXhFcnJvcihlcnJvcikpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV4dF8zODIudmFsdWU7XG4gIH1cbn1cbiJdfQ==