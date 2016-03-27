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

var SyntaxOrTermWrapper = exports.SyntaxOrTermWrapper = function () {
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
}();

function unwrap(x_370) {
  if (x_370 instanceof SyntaxOrTermWrapper) {
    return x_370[symWrap_335];
  }
  return x_370;
}

var MacroContext = function () {
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
      var value_377 = void 0;
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
  }]);

  return MacroContext;
}();

exports.default = MacroContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hY3JvLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O1FBOEZnQjs7QUE5RmhCOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztJQUFhOztBQUNiOzs7Ozs7OztBQUNBLElBQU0sV0FBVyxvQkFBTSxJQUFOO0FBQ2pCLElBQU0sY0FBYyxvQkFBTSxPQUFOO0FBQ3BCLElBQU0sY0FBYyxPQUFPLFNBQVAsQ0FBZDtBQUNOLElBQU0sYUFBYSxFQUFFLEtBQUYsQ0FBUSxVQUFDLFFBQUQsRUFBVyxLQUFYLEVBQWtCLEtBQWxCLEVBQTRCO0FBQ3JELE1BQUksaUNBQUosRUFBNkI7QUFDM0IsV0FBTyxNQUFNLFFBQU4sUUFBc0IsU0FBUyxJQUFULElBQWlCLE1BQU0sR0FBTixNQUFlLEtBQWYsQ0FBdkMsQ0FEb0I7R0FBN0I7Q0FEeUIsQ0FBckI7QUFLTixJQUFNLGdCQUFnQixXQUFXLFdBQVgsQ0FBaEI7QUFDTixJQUFNLG1CQUFtQixXQUFXLGNBQVgsQ0FBbkI7QUFDTixJQUFNLHVCQUF1QixXQUFXLGtCQUFYLENBQXZCO0FBQ04sSUFBTSxzQkFBc0IsV0FBVyxpQkFBWCxDQUF0QjtBQUNOLElBQU0sb0JBQW9CLFdBQVcsZUFBWCxDQUFwQjtBQUNOLElBQU0sbUJBQW1CLFdBQVcsY0FBWCxDQUFuQjtBQUNOLElBQU0sMEJBQTBCLFdBQVcscUJBQVgsQ0FBMUI7QUFDTixJQUFNLGVBQWUsV0FBVyxVQUFYLENBQWY7QUFDTixJQUFNLGlCQUFpQixXQUFXLFlBQVgsQ0FBakI7QUFDTixJQUFNLGVBQWUsV0FBVyxVQUFYLENBQWY7QUFDTixJQUFNLGtCQUFrQixXQUFXLGFBQVgsQ0FBbEI7QUFDTixJQUFNLG9CQUFvQixTQUFwQixpQkFBb0IsUUFBUztBQUNqQyxNQUFJLGlDQUFKLEVBQTZCO0FBQzNCLFdBQU8sTUFBTSxVQUFOLEVBQVAsQ0FEMkI7R0FBN0I7QUFHQSxRQUFNLElBQUksS0FBSixD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QU0sSUFBSSxLQUFKLENBQVUsd0JBQXdCLFFBQXhCLENBQWhCLENBREY7QUFkRixPQUx3QjtBQXNCeEIsYUFBTyxFQUFDLE1BQU0sS0FBTixFQUFhLE9BQU8sSUFBSSxtQkFBSixDQUF3QixTQUF4QixFQUFtQyxLQUFLLE9BQUwsQ0FBMUMsRUFBckIsQ0F0QndCOzs7O1NBZFAiLCJmaWxlIjoibWFjcm8tY29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBNYXBTeW50YXhSZWR1Y2VyIGZyb20gXCIuL21hcC1zeW50YXgtcmVkdWNlclwiO1xuaW1wb3J0IHJlZHVjZXIgZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHtFbmZvcmVzdGVyfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQge01heWJlfSBmcm9tIFwicmFtZGEtZmFudGFzeVwiO1xuY29uc3QgSnVzdF8zMzMgPSBNYXliZS5KdXN0O1xuY29uc3QgTm90aGluZ18zMzQgPSBNYXliZS5Ob3RoaW5nO1xuY29uc3Qgc3ltV3JhcF8zMzUgPSBTeW1ib2woXCJ3cmFwcGVyXCIpO1xuY29uc3QgaXNLaW5kXzMzNiA9IF8uY3VycnkoKGtpbmRfMzUwLCB0XzM1MSwgdl8zNTIpID0+IHtcbiAgaWYgKHRfMzUxIGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgcmV0dXJuIHRfMzUxW2tpbmRfMzUwXSgpICYmICh2XzM1MiA9PSBudWxsIHx8IHRfMzUxLnZhbCgpID09IHZfMzUyKTtcbiAgfVxufSk7XG5jb25zdCBpc0tleXdvcmRfMzM3ID0gaXNLaW5kXzMzNihcImlzS2V5d29yZFwiKTtcbmNvbnN0IGlzSWRlbnRpZmllcl8zMzggPSBpc0tpbmRfMzM2KFwiaXNJZGVudGlmaWVyXCIpO1xuY29uc3QgaXNOdW1lcmljTGl0ZXJhbF8zMzkgPSBpc0tpbmRfMzM2KFwiaXNOdW1lcmljTGl0ZXJhbFwiKTtcbmNvbnN0IGlzU3RyaW5nTGl0ZXJhbF8zNDAgPSBpc0tpbmRfMzM2KFwiaXNTdHJpbmdMaXRlcmFsXCIpO1xuY29uc3QgaXNOdWxsTGl0ZXJhbF8zNDEgPSBpc0tpbmRfMzM2KFwiaXNOdWxsTGl0ZXJhbFwiKTtcbmNvbnN0IGlzUHVuY3R1YXRvcl8zNDIgPSBpc0tpbmRfMzM2KFwiaXNQdW5jdHVhdG9yXCIpO1xuY29uc3QgaXNSZWd1bGFyRXhwcmVzc2lvbl8zNDMgPSBpc0tpbmRfMzM2KFwiaXNSZWd1bGFyRXhwcmVzc2lvblwiKTtcbmNvbnN0IGlzQnJhY2VzXzM0NCA9IGlzS2luZF8zMzYoXCJpc0JyYWNlc1wiKTtcbmNvbnN0IGlzQnJhY2tldHNfMzQ1ID0gaXNLaW5kXzMzNihcImlzQnJhY2tldHNcIik7XG5jb25zdCBpc1BhcmVuc18zNDYgPSBpc0tpbmRfMzM2KFwiaXNQYXJlbnNcIik7XG5jb25zdCBpc0RlbGltaXRlcl8zNDcgPSBpc0tpbmRfMzM2KFwiaXNEZWxpbWl0ZXJcIik7XG5jb25zdCBnZXRMaW5lTnVtYmVyXzM0OCA9IHRfMzUzID0+IHtcbiAgaWYgKHRfMzUzIGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgcmV0dXJuIHRfMzUzLmxpbmVOdW1iZXIoKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoXCJMaW5lIG51bWJlcnMgb24gdGVybXMgbm90IGltcGxlbWVudGVkIHlldFwiKTtcbn07XG5jb25zdCBnZXRWYWxfMzQ5ID0gdF8zNTQgPT4ge1xuICBpZiAoaXNEZWxpbWl0ZXJfMzQ3KHRfMzU0LCBudWxsKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh0XzM1NCBpbnN0YW5jZW9mIFN5bnRheCkge1xuICAgIHJldHVybiB0XzM1NC52YWwoKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5leHBvcnQgY2xhc3MgU3ludGF4T3JUZXJtV3JhcHBlciB7XG4gIGNvbnN0cnVjdG9yKHNfMzU1LCBjb250ZXh0XzM1NiA9IHt9KSB7XG4gICAgdGhpc1tzeW1XcmFwXzMzNV0gPSBzXzM1NTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzM1NjtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfMzU3KSB7XG4gICAgcmV0dXJuIGlzS2V5d29yZF8zMzcodGhpc1tzeW1XcmFwXzMzNV0sIHZhbHVlXzM1Nyk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzM1OCkge1xuICAgIHJldHVybiBpc0lkZW50aWZpZXJfMzM4KHRoaXNbc3ltV3JhcF8zMzVdLCB2YWx1ZV8zNTgpO1xuICB9XG4gIGlzTnVtZXJpY0xpdGVyYWwodmFsdWVfMzU5KSB7XG4gICAgcmV0dXJuIGlzTnVtZXJpY0xpdGVyYWxfMzM5KHRoaXNbc3ltV3JhcF8zMzVdLCB2YWx1ZV8zNTkpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV8zNjApIHtcbiAgICByZXR1cm4gaXNTdHJpbmdMaXRlcmFsXzM0MCh0aGlzW3N5bVdyYXBfMzM1XSwgdmFsdWVfMzYwKTtcbiAgfVxuICBpc051bGxMaXRlcmFsKHZhbHVlXzM2MSkge1xuICAgIHJldHVybiBpc051bGxMaXRlcmFsXzM0MSh0aGlzW3N5bVdyYXBfMzM1XSwgdmFsdWVfMzYxKTtcbiAgfVxuICBpc1B1bmN0dWF0b3IodmFsdWVfMzYyKSB7XG4gICAgcmV0dXJuIGlzUHVuY3R1YXRvcl8zNDIodGhpc1tzeW1XcmFwXzMzNV0sIHZhbHVlXzM2Mik7XG4gIH1cbiAgaXNSZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV8zNjMpIHtcbiAgICByZXR1cm4gaXNSZWd1bGFyRXhwcmVzc2lvbl8zNDModGhpc1tzeW1XcmFwXzMzNV0sIHZhbHVlXzM2Myk7XG4gIH1cbiAgaXNCcmFjZXModmFsdWVfMzY0KSB7XG4gICAgcmV0dXJuIGlzQnJhY2VzXzM0NCh0aGlzW3N5bVdyYXBfMzM1XSwgdmFsdWVfMzY0KTtcbiAgfVxuICBpc0JyYWNrZXRzKHZhbHVlXzM2NSkge1xuICAgIHJldHVybiBpc0JyYWNrZXRzXzM0NSh0aGlzW3N5bVdyYXBfMzM1XSwgdmFsdWVfMzY1KTtcbiAgfVxuICBpc1BhcmVucyh2YWx1ZV8zNjYpIHtcbiAgICByZXR1cm4gaXNQYXJlbnNfMzQ2KHRoaXNbc3ltV3JhcF8zMzVdLCB2YWx1ZV8zNjYpO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzM2Nykge1xuICAgIHJldHVybiBpc0RlbGltaXRlcl8zNDcodGhpc1tzeW1XcmFwXzMzNV0sIHZhbHVlXzM2Nyk7XG4gIH1cbiAgbGluZU51bWJlcigpIHtcbiAgICByZXR1cm4gZ2V0TGluZU51bWJlcl8zNDgodGhpc1tzeW1XcmFwXzMzNV0pO1xuICB9XG4gIHZhbCgpIHtcbiAgICByZXR1cm4gZ2V0VmFsXzM0OSh0aGlzW3N5bVdyYXBfMzM1XSk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgbGV0IHN0eF8zNjggPSB0aGlzW3N5bVdyYXBfMzM1XTtcbiAgICBpZiAoIWlzRGVsaW1pdGVyXzM0NyhzdHhfMzY4LCBudWxsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG9ubHkgZ2V0IGlubmVyIHN5bnRheCBvbiBhIGRlbGltaXRlclwiKTtcbiAgICB9XG4gICAgbGV0IGVuZl8zNjkgPSBuZXcgRW5mb3Jlc3RlcihzdHhfMzY4LmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICByZXR1cm4gbmV3IE1hY3JvQ29udGV4dChlbmZfMzY5LCBcImlubmVyXCIsIHRoaXMuY29udGV4dCk7XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXAoeF8zNzApIHtcbiAgaWYgKHhfMzcwIGluc3RhbmNlb2YgU3ludGF4T3JUZXJtV3JhcHBlcikge1xuICAgIHJldHVybiB4XzM3MFtzeW1XcmFwXzMzNV07XG4gIH1cbiAgcmV0dXJuIHhfMzcwO1xufVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFjcm9Db250ZXh0IHtcbiAgY29uc3RydWN0b3IoZW5mXzM3MSwgbmFtZV8zNzIsIGNvbnRleHRfMzczLCB1c2VTY29wZV8zNzQsIGludHJvZHVjZWRTY29wZV8zNzUpIHtcbiAgICB0aGlzLl9lbmYgPSBlbmZfMzcxO1xuICAgIHRoaXMubmFtZSA9IG5hbWVfMzcyO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzczO1xuICAgIGlmICh1c2VTY29wZV8zNzQgJiYgaW50cm9kdWNlZFNjb3BlXzM3NSkge1xuICAgICAgdGhpcy5ub1Njb3BlcyA9IGZhbHNlO1xuICAgICAgdGhpcy51c2VTY29wZSA9IHVzZVNjb3BlXzM3NDtcbiAgICAgIHRoaXMuaW50cm9kdWNlZFNjb3BlID0gaW50cm9kdWNlZFNjb3BlXzM3NTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ub1Njb3BlcyA9IHRydWU7XG4gICAgfVxuICAgIHRoaXNbU3ltYm9sLml0ZXJhdG9yXSA9ICgpID0+IHRoaXM7XG4gIH1cbiAgbmV4dCh0eXBlXzM3NiA9IFwiU3ludGF4XCIpIHtcbiAgICBpZiAodGhpcy5fZW5mLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtkb25lOiB0cnVlLCB2YWx1ZTogbnVsbH07XG4gICAgfVxuICAgIGxldCB2YWx1ZV8zNzc7XG4gICAgc3dpdGNoICh0eXBlXzM3Nikge1xuICAgICAgY2FzZSBcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiZXhwclwiOlxuICAgICAgICB2YWx1ZV8zNzcgPSB0aGlzLl9lbmYuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzM3NyA9IHRoaXMuX2VuZi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiU3ludGF4XCI6XG4gICAgICAgIHZhbHVlXzM3NyA9IHRoaXMuX2VuZi5hZHZhbmNlKCk7XG4gICAgICAgIGlmICghdGhpcy5ub1Njb3Blcykge1xuICAgICAgICAgIHZhbHVlXzM3NyA9IHZhbHVlXzM3Ny5hZGRTY29wZSh0aGlzLnVzZVNjb3BlKS5hZGRTY29wZSh0aGlzLmludHJvZHVjZWRTY29wZSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCB7ZmxpcDogdHJ1ZX0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0ZXJtIHR5cGU6IFwiICsgdHlwZV8zNzYpO1xuICAgIH1cbiAgICByZXR1cm4ge2RvbmU6IGZhbHNlLCB2YWx1ZTogbmV3IFN5bnRheE9yVGVybVdyYXBwZXIodmFsdWVfMzc3LCB0aGlzLmNvbnRleHQpfTtcbiAgfVxufVxuIl19