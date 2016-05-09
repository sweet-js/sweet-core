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

var Just_335 = _ramdaFantasy.Maybe.Just;
var Nothing_336 = _ramdaFantasy.Maybe.Nothing;
var symWrap_337 = Symbol("wrapper");
var symName_338 = Symbol("name");
var isKind_339 = _.curry(function (kind_353, t_354, v_355) {
  if (t_354 instanceof _syntax2.default) {
    return t_354[kind_353]() && (v_355 == null || t_354.val() == v_355);
  }
});
var isKeyword_340 = isKind_339("isKeyword");
var isIdentifier_341 = isKind_339("isIdentifier");
var isNumericLiteral_342 = isKind_339("isNumericLiteral");
var isStringLiteral_343 = isKind_339("isStringLiteral");
var isNullLiteral_344 = isKind_339("isNullLiteral");
var isPunctuator_345 = isKind_339("isPunctuator");
var isRegularExpression_346 = isKind_339("isRegularExpression");
var isBraces_347 = isKind_339("isBraces");
var isBrackets_348 = isKind_339("isBrackets");
var isParens_349 = isKind_339("isParens");
var isDelimiter_350 = isKind_339("isDelimiter");
var getLineNumber_351 = function getLineNumber_351(t_356) {
  if (t_356 instanceof _syntax2.default) {
    return t_356.lineNumber();
  }
  throw new Error("Line numbers on terms not implemented yet");
};
var getVal_352 = function getVal_352(t_357) {
  if (isDelimiter_350(t_357, null)) {
    return null;
  }
  if (t_357 instanceof _syntax2.default) {
    return t_357.val();
  }
  return null;
};

var SyntaxOrTermWrapper = exports.SyntaxOrTermWrapper = (function () {
  function SyntaxOrTermWrapper(s_358) {
    var context_359 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, SyntaxOrTermWrapper);

    this[symWrap_337] = s_358;
    this.context = context_359;
  }

  _createClass(SyntaxOrTermWrapper, [{
    key: "isKeyword",
    value: function isKeyword(value_360) {
      return isKeyword_340(this[symWrap_337], value_360);
    }
  }, {
    key: "isIdentifier",
    value: function isIdentifier(value_361) {
      return isIdentifier_341(this[symWrap_337], value_361);
    }
  }, {
    key: "isNumericLiteral",
    value: function isNumericLiteral(value_362) {
      return isNumericLiteral_342(this[symWrap_337], value_362);
    }
  }, {
    key: "isStringLiteral",
    value: function isStringLiteral(value_363) {
      return isStringLiteral_343(this[symWrap_337], value_363);
    }
  }, {
    key: "isNullLiteral",
    value: function isNullLiteral(value_364) {
      return isNullLiteral_344(this[symWrap_337], value_364);
    }
  }, {
    key: "isPunctuator",
    value: function isPunctuator(value_365) {
      return isPunctuator_345(this[symWrap_337], value_365);
    }
  }, {
    key: "isRegularExpression",
    value: function isRegularExpression(value_366) {
      return isRegularExpression_346(this[symWrap_337], value_366);
    }
  }, {
    key: "isBraces",
    value: function isBraces(value_367) {
      return isBraces_347(this[symWrap_337], value_367);
    }
  }, {
    key: "isBrackets",
    value: function isBrackets(value_368) {
      return isBrackets_348(this[symWrap_337], value_368);
    }
  }, {
    key: "isParens",
    value: function isParens(value_369) {
      return isParens_349(this[symWrap_337], value_369);
    }
  }, {
    key: "isDelimiter",
    value: function isDelimiter(value_370) {
      return isDelimiter_350(this[symWrap_337], value_370);
    }
  }, {
    key: "lineNumber",
    value: function lineNumber() {
      return getLineNumber_351(this[symWrap_337]);
    }
  }, {
    key: "val",
    value: function val() {
      return getVal_352(this[symWrap_337]);
    }
  }, {
    key: "inner",
    value: function inner() {
      var stx_371 = this[symWrap_337];
      if (!isDelimiter_350(stx_371, null)) {
        throw new Error("Can only get inner syntax on a delimiter");
      }
      var enf_372 = new _enforester.Enforester(stx_371.inner(), (0, _immutable.List)(), this.context);
      return new MacroContext(enf_372, "inner", this.context);
    }
  }]);

  return SyntaxOrTermWrapper;
})();

function unwrap(x_373) {
  if (x_373 instanceof SyntaxOrTermWrapper) {
    return x_373[symWrap_337];
  }
  return x_373;
}

var MacroContext = (function () {
  function MacroContext(enf_374, name_375, context_376, useScope_377, introducedScope_378) {
    var _this = this;

    _classCallCheck(this, MacroContext);

    this._enf = enf_374;
    this[symName_338] = name_375;
    this.context = context_376;
    if (useScope_377 && introducedScope_378) {
      this.noScopes = false;
      this.useScope = useScope_377;
      this.introducedScope = introducedScope_378;
    } else {
      this.noScopes = true;
    }
    this[Symbol.iterator] = function () {
      return _this;
    };
  }

  _createClass(MacroContext, [{
    key: "name",
    value: function name() {
      return new SyntaxOrTermWrapper(this[symName_338], this.context);
    }
  }, {
    key: "next",
    value: function next() {
      var type_379 = arguments.length <= 0 || arguments[0] === undefined ? "Syntax" : arguments[0];

      if (this._enf.rest.size === 0) {
        return { done: true, value: null };
      }
      var value_380 = undefined;
      switch (type_379) {
        case "AssignmentExpression":
        case "expr":
          value_380 = this._enf.enforestExpressionLoop();
          break;
        case "Expression":
          value_380 = this._enf.enforestExpression();
          break;
        case "Syntax":
          value_380 = this._enf.advance();
          if (!this.noScopes) {
            value_380 = value_380.addScope(this.useScope).addScope(this.introducedScope, this.context.bindings, { flip: true });
          }
          break;
        default:
          throw new Error("Unknown term type: " + type_379);
      }
      return { done: false, value: new SyntaxOrTermWrapper(value_380, this.context) };
    }
  }]);

  return MacroContext;
})();

exports.default = MacroContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hY3JvLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O1FBK0ZnQixNQUFNLEdBQU4sTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUExRlQsQ0FBQzs7Ozs7Ozs7OztBQUVkLElBQU0sUUFBUSxHQUFHLG9CQUFNLElBQUksQ0FBQztBQUM1QixJQUFNLFdBQVcsR0FBRyxvQkFBTSxPQUFPLENBQUM7QUFDbEMsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RDLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxJQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUs7QUFDckQsTUFBSSxLQUFLLDRCQUFrQixFQUFFO0FBQzNCLFdBQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQUssS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxDQUFBLEFBQUMsQ0FBQztHQUNyRTtDQUNGLENBQUMsQ0FBQztBQUNILElBQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM5QyxJQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwRCxJQUFNLG9CQUFvQixHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQzVELElBQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDMUQsSUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdEQsSUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEQsSUFBTSx1QkFBdUIsR0FBRyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNsRSxJQUFNLFlBQVksR0FB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QSxPQUNyRDtBQUNELGFBQU8sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQztLQUMvRTs7O1NBeENrQixZQUFZOzs7a0JBQVosWUFBWSIsImZpbGUiOiJtYWNyby1jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hcFN5bnRheFJlZHVjZXIgZnJvbSBcIi4vbWFwLXN5bnRheC1yZWR1Y2VyXCI7XG5pbXBvcnQgcmVkdWNlciBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge0VuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5jb25zdCBKdXN0XzMzNSA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzMzNiA9IE1heWJlLk5vdGhpbmc7XG5jb25zdCBzeW1XcmFwXzMzNyA9IFN5bWJvbChcIndyYXBwZXJcIik7XG5jb25zdCBzeW1OYW1lXzMzOCA9IFN5bWJvbChcIm5hbWVcIik7XG5jb25zdCBpc0tpbmRfMzM5ID0gXy5jdXJyeSgoa2luZF8zNTMsIHRfMzU0LCB2XzM1NSkgPT4ge1xuICBpZiAodF8zNTQgaW5zdGFuY2VvZiBTeW50YXgpIHtcbiAgICByZXR1cm4gdF8zNTRba2luZF8zNTNdKCkgJiYgKHZfMzU1ID09IG51bGwgfHwgdF8zNTQudmFsKCkgPT0gdl8zNTUpO1xuICB9XG59KTtcbmNvbnN0IGlzS2V5d29yZF8zNDAgPSBpc0tpbmRfMzM5KFwiaXNLZXl3b3JkXCIpO1xuY29uc3QgaXNJZGVudGlmaWVyXzM0MSA9IGlzS2luZF8zMzkoXCJpc0lkZW50aWZpZXJcIik7XG5jb25zdCBpc051bWVyaWNMaXRlcmFsXzM0MiA9IGlzS2luZF8zMzkoXCJpc051bWVyaWNMaXRlcmFsXCIpO1xuY29uc3QgaXNTdHJpbmdMaXRlcmFsXzM0MyA9IGlzS2luZF8zMzkoXCJpc1N0cmluZ0xpdGVyYWxcIik7XG5jb25zdCBpc051bGxMaXRlcmFsXzM0NCA9IGlzS2luZF8zMzkoXCJpc051bGxMaXRlcmFsXCIpO1xuY29uc3QgaXNQdW5jdHVhdG9yXzM0NSA9IGlzS2luZF8zMzkoXCJpc1B1bmN0dWF0b3JcIik7XG5jb25zdCBpc1JlZ3VsYXJFeHByZXNzaW9uXzM0NiA9IGlzS2luZF8zMzkoXCJpc1JlZ3VsYXJFeHByZXNzaW9uXCIpO1xuY29uc3QgaXNCcmFjZXNfMzQ3ID0gaXNLaW5kXzMzOShcImlzQnJhY2VzXCIpO1xuY29uc3QgaXNCcmFja2V0c18zNDggPSBpc0tpbmRfMzM5KFwiaXNCcmFja2V0c1wiKTtcbmNvbnN0IGlzUGFyZW5zXzM0OSA9IGlzS2luZF8zMzkoXCJpc1BhcmVuc1wiKTtcbmNvbnN0IGlzRGVsaW1pdGVyXzM1MCA9IGlzS2luZF8zMzkoXCJpc0RlbGltaXRlclwiKTtcbmNvbnN0IGdldExpbmVOdW1iZXJfMzUxID0gdF8zNTYgPT4ge1xuICBpZiAodF8zNTYgaW5zdGFuY2VvZiBTeW50YXgpIHtcbiAgICByZXR1cm4gdF8zNTYubGluZU51bWJlcigpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcIkxpbmUgbnVtYmVycyBvbiB0ZXJtcyBub3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xufTtcbmNvbnN0IGdldFZhbF8zNTIgPSB0XzM1NyA9PiB7XG4gIGlmIChpc0RlbGltaXRlcl8zNTAodF8zNTcsIG51bGwpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHRfMzU3IGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgcmV0dXJuIHRfMzU3LnZhbCgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcbmV4cG9ydCBjbGFzcyBTeW50YXhPclRlcm1XcmFwcGVyIHtcbiAgY29uc3RydWN0b3Ioc18zNTgsIGNvbnRleHRfMzU5ID0ge30pIHtcbiAgICB0aGlzW3N5bVdyYXBfMzM3XSA9IHNfMzU4O1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzU5O1xuICB9XG4gIGlzS2V5d29yZCh2YWx1ZV8zNjApIHtcbiAgICByZXR1cm4gaXNLZXl3b3JkXzM0MCh0aGlzW3N5bVdyYXBfMzM3XSwgdmFsdWVfMzYwKTtcbiAgfVxuICBpc0lkZW50aWZpZXIodmFsdWVfMzYxKSB7XG4gICAgcmV0dXJuIGlzSWRlbnRpZmllcl8zNDEodGhpc1tzeW1XcmFwXzMzN10sIHZhbHVlXzM2MSk7XG4gIH1cbiAgaXNOdW1lcmljTGl0ZXJhbCh2YWx1ZV8zNjIpIHtcbiAgICByZXR1cm4gaXNOdW1lcmljTGl0ZXJhbF8zNDIodGhpc1tzeW1XcmFwXzMzN10sIHZhbHVlXzM2Mik7XG4gIH1cbiAgaXNTdHJpbmdMaXRlcmFsKHZhbHVlXzM2Mykge1xuICAgIHJldHVybiBpc1N0cmluZ0xpdGVyYWxfMzQzKHRoaXNbc3ltV3JhcF8zMzddLCB2YWx1ZV8zNjMpO1xuICB9XG4gIGlzTnVsbExpdGVyYWwodmFsdWVfMzY0KSB7XG4gICAgcmV0dXJuIGlzTnVsbExpdGVyYWxfMzQ0KHRoaXNbc3ltV3JhcF8zMzddLCB2YWx1ZV8zNjQpO1xuICB9XG4gIGlzUHVuY3R1YXRvcih2YWx1ZV8zNjUpIHtcbiAgICByZXR1cm4gaXNQdW5jdHVhdG9yXzM0NSh0aGlzW3N5bVdyYXBfMzM3XSwgdmFsdWVfMzY1KTtcbiAgfVxuICBpc1JlZ3VsYXJFeHByZXNzaW9uKHZhbHVlXzM2Nikge1xuICAgIHJldHVybiBpc1JlZ3VsYXJFeHByZXNzaW9uXzM0Nih0aGlzW3N5bVdyYXBfMzM3XSwgdmFsdWVfMzY2KTtcbiAgfVxuICBpc0JyYWNlcyh2YWx1ZV8zNjcpIHtcbiAgICByZXR1cm4gaXNCcmFjZXNfMzQ3KHRoaXNbc3ltV3JhcF8zMzddLCB2YWx1ZV8zNjcpO1xuICB9XG4gIGlzQnJhY2tldHModmFsdWVfMzY4KSB7XG4gICAgcmV0dXJuIGlzQnJhY2tldHNfMzQ4KHRoaXNbc3ltV3JhcF8zMzddLCB2YWx1ZV8zNjgpO1xuICB9XG4gIGlzUGFyZW5zKHZhbHVlXzM2OSkge1xuICAgIHJldHVybiBpc1BhcmVuc18zNDkodGhpc1tzeW1XcmFwXzMzN10sIHZhbHVlXzM2OSk7XG4gIH1cbiAgaXNEZWxpbWl0ZXIodmFsdWVfMzcwKSB7XG4gICAgcmV0dXJuIGlzRGVsaW1pdGVyXzM1MCh0aGlzW3N5bVdyYXBfMzM3XSwgdmFsdWVfMzcwKTtcbiAgfVxuICBsaW5lTnVtYmVyKCkge1xuICAgIHJldHVybiBnZXRMaW5lTnVtYmVyXzM1MSh0aGlzW3N5bVdyYXBfMzM3XSk7XG4gIH1cbiAgdmFsKCkge1xuICAgIHJldHVybiBnZXRWYWxfMzUyKHRoaXNbc3ltV3JhcF8zMzddKTtcbiAgfVxuICBpbm5lcigpIHtcbiAgICBsZXQgc3R4XzM3MSA9IHRoaXNbc3ltV3JhcF8zMzddO1xuICAgIGlmICghaXNEZWxpbWl0ZXJfMzUwKHN0eF8zNzEsIG51bGwpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gb25seSBnZXQgaW5uZXIgc3ludGF4IG9uIGEgZGVsaW1pdGVyXCIpO1xuICAgIH1cbiAgICBsZXQgZW5mXzM3MiA9IG5ldyBFbmZvcmVzdGVyKHN0eF8zNzEuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHJldHVybiBuZXcgTWFjcm9Db250ZXh0KGVuZl8zNzIsIFwiaW5uZXJcIiwgdGhpcy5jb250ZXh0KTtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcCh4XzM3Mykge1xuICBpZiAoeF8zNzMgaW5zdGFuY2VvZiBTeW50YXhPclRlcm1XcmFwcGVyKSB7XG4gICAgcmV0dXJuIHhfMzczW3N5bVdyYXBfMzM3XTtcbiAgfVxuICByZXR1cm4geF8zNzM7XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWNyb0NvbnRleHQge1xuICBjb25zdHJ1Y3RvcihlbmZfMzc0LCBuYW1lXzM3NSwgY29udGV4dF8zNzYsIHVzZVNjb3BlXzM3NywgaW50cm9kdWNlZFNjb3BlXzM3OCkge1xuICAgIHRoaXMuX2VuZiA9IGVuZl8zNzQ7XG4gICAgdGhpc1tzeW1OYW1lXzMzOF0gPSBuYW1lXzM3NTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzM3NjtcbiAgICBpZiAodXNlU2NvcGVfMzc3ICYmIGludHJvZHVjZWRTY29wZV8zNzgpIHtcbiAgICAgIHRoaXMubm9TY29wZXMgPSBmYWxzZTtcbiAgICAgIHRoaXMudXNlU2NvcGUgPSB1c2VTY29wZV8zNzc7XG4gICAgICB0aGlzLmludHJvZHVjZWRTY29wZSA9IGludHJvZHVjZWRTY29wZV8zNzg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubm9TY29wZXMgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzW1N5bWJvbC5pdGVyYXRvcl0gPSAoKSA9PiB0aGlzO1xuICB9XG4gIG5hbWUoKSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXhPclRlcm1XcmFwcGVyKHRoaXNbc3ltTmFtZV8zMzhdLCB0aGlzLmNvbnRleHQpO1xuICB9XG4gIG5leHQodHlwZV8zNzkgPSBcIlN5bnRheFwiKSB7XG4gICAgaWYgKHRoaXMuX2VuZi5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB7ZG9uZTogdHJ1ZSwgdmFsdWU6IG51bGx9O1xuICAgIH1cbiAgICBsZXQgdmFsdWVfMzgwO1xuICAgIHN3aXRjaCAodHlwZV8zNzkpIHtcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcImV4cHJcIjpcbiAgICAgICAgdmFsdWVfMzgwID0gdGhpcy5fZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV8zODAgPSB0aGlzLl9lbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlN5bnRheFwiOlxuICAgICAgICB2YWx1ZV8zODAgPSB0aGlzLl9lbmYuYWR2YW5jZSgpO1xuICAgICAgICBpZiAoIXRoaXMubm9TY29wZXMpIHtcbiAgICAgICAgICB2YWx1ZV8zODAgPSB2YWx1ZV8zODAuYWRkU2NvcGUodGhpcy51c2VTY29wZSkuYWRkU2NvcGUodGhpcy5pbnRyb2R1Y2VkU2NvcGUsIHRoaXMuY29udGV4dC5iaW5kaW5ncywge2ZsaXA6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGVybSB0eXBlOiBcIiArIHR5cGVfMzc5KTtcbiAgICB9XG4gICAgcmV0dXJuIHtkb25lOiBmYWxzZSwgdmFsdWU6IG5ldyBTeW50YXhPclRlcm1XcmFwcGVyKHZhbHVlXzM4MCwgdGhpcy5jb250ZXh0KX07XG4gIH1cbn1cbiJdfQ==