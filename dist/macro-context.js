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

var Just_312 = _ramdaFantasy.Maybe.Just;
var Nothing_313 = _ramdaFantasy.Maybe.Nothing;
var symWrap_314 = Symbol("wrapper");
var isKind_315 = _.curry(function (kind, t, v) {
  if (t instanceof _syntax2.default) {
    return t[kind]() && (v == null || t.val() == v);
  }
});
var isKeyword_316 = isKind_315("isKeyword");
var isIdentifier_317 = isKind_315("isIdentifier");
var isNumericLiteral_318 = isKind_315("isNumericLiteral");
var isStringLiteral_319 = isKind_315("isStringLiteral");
var isNullLiteral_320 = isKind_315("isNullLiteral");
var isPunctuator_321 = isKind_315("isPunctuator");
var isRegularExpression_322 = isKind_315("isRegularExpression");
var isBraces_323 = isKind_315("isBraces");
var isBrackets_324 = isKind_315("isBrackets");
var isParens_325 = isKind_315("isParens");
var isDelimiter_326 = isKind_315("isDelimiter");
var getLineNumber_327 = function getLineNumber_327(t) {
  if (t instanceof _syntax2.default) {
    return t.lineNumber();
  }
  throw new Error("Line numbers on terms not implemented yet");
};
var getVal_328 = function getVal_328(t) {
  if (isDelimiter_326(t, null)) {
    return null;
  }
  if (t instanceof _syntax2.default) {
    return t.val();
  }
  return null;
};

var SyntaxOrTermWrapper = exports.SyntaxOrTermWrapper = function () {
  function SyntaxOrTermWrapper(s_329) {
    var context_330 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, SyntaxOrTermWrapper);

    this[symWrap_314] = s_329;
    this.context = context_330;
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
      var stx_342 = this[symWrap_314];
      if (!isDelimiter_326(stx_342, null)) {
        throw new Error("Can only get inner syntax on a delimiter");
      }
      var enf_343 = new _enforester.Enforester(stx_342.inner(), (0, _immutable.List)(), this.context);
      return new MacroContext(enf_343, "inner", this.context);
    }
  }]);

  return SyntaxOrTermWrapper;
}();

function unwrap(x_344) {
  if (x_344 instanceof SyntaxOrTermWrapper) {
    return x_344[symWrap_314];
  }
  return x_344;
}

var MacroContext = function () {
  function MacroContext(enf_345, name_346, context_347, useScope_348, introducedScope_349) {
    var _this = this;

    _classCallCheck(this, MacroContext);

    this._enf = enf_345;
    this.name = name_346;
    this.context = context_347;
    if (useScope_348 && introducedScope_349) {
      this.noScopes = false;
      this.useScope = useScope_348;
      this.introducedScope = introducedScope_349;
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
      var type_350 = arguments.length <= 0 || arguments[0] === undefined ? "Syntax" : arguments[0];

      if (this._enf.rest.size === 0) {
        return { done: true, value: null };
      }
      var value_351 = void 0;
      switch (type_350) {
        case "AssignmentExpression":
        case "expr":
          value_351 = this._enf.enforestExpressionLoop();
          break;
        case "Expression":
          value_351 = this._enf.enforestExpression();
          break;
        case "Syntax":
          value_351 = this._enf.advance();
          if (!this.noScopes) {
            value_351 = value_351.addScope(this.useScope).addScope(this.introducedScope, this.context.bindings, { flip: true });
          }
          break;
        default:
          throw new Error("Unknown term type: " + type_350);
      }
      return { done: false, value: new SyntaxOrTermWrapper(value_351, this.context) };
    }
  }]);

  return MacroContext;
}();

exports.default = MacroContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hY3JvLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O1FBOEZnQjs7QUE5RmhCOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztJQUFhOztBQUNiOzs7Ozs7OztBQUNBLElBQU0sV0FBVyxvQkFBTSxJQUFOO0FBQ2pCLElBQU0sY0FBYyxvQkFBTSxPQUFOO0FBQ3BCLElBQU0sY0FBYyxPQUFPLFNBQVAsQ0FBZDtBQUNOLElBQU0sYUFBYSxFQUFFLEtBQUYsQ0FBUSxVQUFDLElBQUQsRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFnQjtBQUN6QyxNQUFJLDZCQUFKLEVBQXlCO0FBQ3ZCLFdBQU8sRUFBRSxJQUFGLFFBQWMsS0FBSyxJQUFMLElBQWEsRUFBRSxHQUFGLE1BQVcsQ0FBWCxDQUEzQixDQURnQjtHQUF6QjtDQUR5QixDQUFyQjtBQUtOLElBQU0sZ0JBQWdCLFdBQVcsV0FBWCxDQUFoQjtBQUNOLElBQU0sbUJBQW1CLFdBQVcsY0FBWCxDQUFuQjtBQUNOLElBQU0sdUJBQXVCLFdBQVcsa0JBQVgsQ0FBdkI7QUFDTixJQUFNLHNCQUFzQixXQUFXLGlCQUFYLENBQXRCO0FBQ04sSUFBTSxvQkFBb0IsV0FBVyxlQUFYLENBQXBCO0FBQ04sSUFBTSxtQkFBbUIsV0FBVyxjQUFYLENBQW5CO0FBQ04sSUFBTSwwQkFBMEIsV0FBVyxxQkFBWCxDQUExQjtBQUNOLElBQU0sZUFBZSxXQUFXLFVBQVgsQ0FBZjtBQUNOLElBQU0saUJBQWlCLFdBQVcsWUFBWCxDQUFqQjtBQUNOLElBQU0sZUFBZSxXQUFXLFVBQVgsQ0FBZjtBQUNOLElBQU0sa0JBQWtCLFdBQVcsYUFBWCxDQUFsQjtBQUNOLElBQU0sb0JBQW9CLFNBQXBCLGlCQUFvQixJQUFLO0FBQzdCLE1BQUksNkJBQUosRUFBeUI7QUFDdkIsV0FBTyxFQUFFLFVBQUYsRUFBUCxDQUR1QjtHQUF6QjtBQUdBLFFBQU0sSUFBSSxLQUFKLENBQVUs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QUFJLEtBQUosQ0FBVSx3QkFBd0IsUUFBeEIsQ0FBaEIsQ0FERjtBQWRGLE9BTHdCO0FBc0J4QixhQUFPLEVBQUMsTUFBTSxLQUFOLEVBQWEsT0FBTyxJQUFJLG1CQUFKLENBQXdCLFNBQXhCLEVBQW1DLEtBQUssT0FBTCxDQUExQyxFQUFyQixDQXRCd0I7Ozs7U0FkUCIsImZpbGUiOiJtYWNyby1jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hcFN5bnRheFJlZHVjZXIgZnJvbSBcIi4vbWFwLXN5bnRheC1yZWR1Y2VyXCI7XG5pbXBvcnQgcmVkdWNlciBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge0VuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5jb25zdCBKdXN0XzMxMiA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzMxMyA9IE1heWJlLk5vdGhpbmc7XG5jb25zdCBzeW1XcmFwXzMxNCA9IFN5bWJvbChcIndyYXBwZXJcIik7XG5jb25zdCBpc0tpbmRfMzE1ID0gXy5jdXJyeSgoa2luZCwgdCwgdikgPT4ge1xuICBpZiAodCBpbnN0YW5jZW9mIFN5bnRheCkge1xuICAgIHJldHVybiB0W2tpbmRdKCkgJiYgKHYgPT0gbnVsbCB8fCB0LnZhbCgpID09IHYpO1xuICB9XG59KTtcbmNvbnN0IGlzS2V5d29yZF8zMTYgPSBpc0tpbmRfMzE1KFwiaXNLZXl3b3JkXCIpO1xuY29uc3QgaXNJZGVudGlmaWVyXzMxNyA9IGlzS2luZF8zMTUoXCJpc0lkZW50aWZpZXJcIik7XG5jb25zdCBpc051bWVyaWNMaXRlcmFsXzMxOCA9IGlzS2luZF8zMTUoXCJpc051bWVyaWNMaXRlcmFsXCIpO1xuY29uc3QgaXNTdHJpbmdMaXRlcmFsXzMxOSA9IGlzS2luZF8zMTUoXCJpc1N0cmluZ0xpdGVyYWxcIik7XG5jb25zdCBpc051bGxMaXRlcmFsXzMyMCA9IGlzS2luZF8zMTUoXCJpc051bGxMaXRlcmFsXCIpO1xuY29uc3QgaXNQdW5jdHVhdG9yXzMyMSA9IGlzS2luZF8zMTUoXCJpc1B1bmN0dWF0b3JcIik7XG5jb25zdCBpc1JlZ3VsYXJFeHByZXNzaW9uXzMyMiA9IGlzS2luZF8zMTUoXCJpc1JlZ3VsYXJFeHByZXNzaW9uXCIpO1xuY29uc3QgaXNCcmFjZXNfMzIzID0gaXNLaW5kXzMxNShcImlzQnJhY2VzXCIpO1xuY29uc3QgaXNCcmFja2V0c18zMjQgPSBpc0tpbmRfMzE1KFwiaXNCcmFja2V0c1wiKTtcbmNvbnN0IGlzUGFyZW5zXzMyNSA9IGlzS2luZF8zMTUoXCJpc1BhcmVuc1wiKTtcbmNvbnN0IGlzRGVsaW1pdGVyXzMyNiA9IGlzS2luZF8zMTUoXCJpc0RlbGltaXRlclwiKTtcbmNvbnN0IGdldExpbmVOdW1iZXJfMzI3ID0gdCA9PiB7XG4gIGlmICh0IGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgcmV0dXJuIHQubGluZU51bWJlcigpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcIkxpbmUgbnVtYmVycyBvbiB0ZXJtcyBub3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xufTtcbmNvbnN0IGdldFZhbF8zMjggPSB0ID0+IHtcbiAgaWYgKGlzRGVsaW1pdGVyXzMyNih0LCBudWxsKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh0IGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgcmV0dXJuIHQudmFsKCk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuZXhwb3J0IGNsYXNzIFN5bnRheE9yVGVybVdyYXBwZXIge1xuICBjb25zdHJ1Y3RvcihzXzMyOSwgY29udGV4dF8zMzAgPSB7fSkge1xuICAgIHRoaXNbc3ltV3JhcF8zMTRdID0gc18zMjk7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF8zMzA7XG4gIH1cbiAgaXNLZXl3b3JkKHZhbHVlXzMzMSkge1xuICAgIHJldHVybiBpc0tleXdvcmRfMzE2KHRoaXNbc3ltV3JhcF8zMTRdLCB2YWx1ZV8zMzEpO1xuICB9XG4gIGlzSWRlbnRpZmllcih2YWx1ZV8zMzIpIHtcbiAgICByZXR1cm4gaXNJZGVudGlmaWVyXzMxNyh0aGlzW3N5bVdyYXBfMzE0XSwgdmFsdWVfMzMyKTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHZhbHVlXzMzMykge1xuICAgIHJldHVybiBpc051bWVyaWNMaXRlcmFsXzMxOCh0aGlzW3N5bVdyYXBfMzE0XSwgdmFsdWVfMzMzKTtcbiAgfVxuICBpc1N0cmluZ0xpdGVyYWwodmFsdWVfMzM0KSB7XG4gICAgcmV0dXJuIGlzU3RyaW5nTGl0ZXJhbF8zMTkodGhpc1tzeW1XcmFwXzMxNF0sIHZhbHVlXzMzNCk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZV8zMzUpIHtcbiAgICByZXR1cm4gaXNOdWxsTGl0ZXJhbF8zMjAodGhpc1tzeW1XcmFwXzMxNF0sIHZhbHVlXzMzNSk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHZhbHVlXzMzNikge1xuICAgIHJldHVybiBpc1B1bmN0dWF0b3JfMzIxKHRoaXNbc3ltV3JhcF8zMTRdLCB2YWx1ZV8zMzYpO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odmFsdWVfMzM3KSB7XG4gICAgcmV0dXJuIGlzUmVndWxhckV4cHJlc3Npb25fMzIyKHRoaXNbc3ltV3JhcF8zMTRdLCB2YWx1ZV8zMzcpO1xuICB9XG4gIGlzQnJhY2VzKHZhbHVlXzMzOCkge1xuICAgIHJldHVybiBpc0JyYWNlc18zMjModGhpc1tzeW1XcmFwXzMxNF0sIHZhbHVlXzMzOCk7XG4gIH1cbiAgaXNCcmFja2V0cyh2YWx1ZV8zMzkpIHtcbiAgICByZXR1cm4gaXNCcmFja2V0c18zMjQodGhpc1tzeW1XcmFwXzMxNF0sIHZhbHVlXzMzOSk7XG4gIH1cbiAgaXNQYXJlbnModmFsdWVfMzQwKSB7XG4gICAgcmV0dXJuIGlzUGFyZW5zXzMyNSh0aGlzW3N5bVdyYXBfMzE0XSwgdmFsdWVfMzQwKTtcbiAgfVxuICBpc0RlbGltaXRlcih2YWx1ZV8zNDEpIHtcbiAgICByZXR1cm4gaXNEZWxpbWl0ZXJfMzI2KHRoaXNbc3ltV3JhcF8zMTRdLCB2YWx1ZV8zNDEpO1xuICB9XG4gIGxpbmVOdW1iZXIoKSB7XG4gICAgcmV0dXJuIGdldExpbmVOdW1iZXJfMzI3KHRoaXNbc3ltV3JhcF8zMTRdKTtcbiAgfVxuICB2YWwoKSB7XG4gICAgcmV0dXJuIGdldFZhbF8zMjgodGhpc1tzeW1XcmFwXzMxNF0pO1xuICB9XG4gIGlubmVyKCkge1xuICAgIGxldCBzdHhfMzQyID0gdGhpc1tzeW1XcmFwXzMxNF07XG4gICAgaWYgKCFpc0RlbGltaXRlcl8zMjYoc3R4XzM0MiwgbnVsbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBvbmx5IGdldCBpbm5lciBzeW50YXggb24gYSBkZWxpbWl0ZXJcIik7XG4gICAgfVxuICAgIGxldCBlbmZfMzQzID0gbmV3IEVuZm9yZXN0ZXIoc3R4XzM0Mi5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgcmV0dXJuIG5ldyBNYWNyb0NvbnRleHQoZW5mXzM0MywgXCJpbm5lclwiLCB0aGlzLmNvbnRleHQpO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gdW53cmFwKHhfMzQ0KSB7XG4gIGlmICh4XzM0NCBpbnN0YW5jZW9mIFN5bnRheE9yVGVybVdyYXBwZXIpIHtcbiAgICByZXR1cm4geF8zNDRbc3ltV3JhcF8zMTRdO1xuICB9XG4gIHJldHVybiB4XzM0NDtcbn1cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hY3JvQ29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKGVuZl8zNDUsIG5hbWVfMzQ2LCBjb250ZXh0XzM0NywgdXNlU2NvcGVfMzQ4LCBpbnRyb2R1Y2VkU2NvcGVfMzQ5KSB7XG4gICAgdGhpcy5fZW5mID0gZW5mXzM0NTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lXzM0NjtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzM0NztcbiAgICBpZiAodXNlU2NvcGVfMzQ4ICYmIGludHJvZHVjZWRTY29wZV8zNDkpIHtcbiAgICAgIHRoaXMubm9TY29wZXMgPSBmYWxzZTtcbiAgICAgIHRoaXMudXNlU2NvcGUgPSB1c2VTY29wZV8zNDg7XG4gICAgICB0aGlzLmludHJvZHVjZWRTY29wZSA9IGludHJvZHVjZWRTY29wZV8zNDk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubm9TY29wZXMgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzW1N5bWJvbC5pdGVyYXRvcl0gPSAoKSA9PiB0aGlzO1xuICB9XG4gIG5leHQodHlwZV8zNTAgPSBcIlN5bnRheFwiKSB7XG4gICAgaWYgKHRoaXMuX2VuZi5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB7ZG9uZTogdHJ1ZSwgdmFsdWU6IG51bGx9O1xuICAgIH1cbiAgICBsZXQgdmFsdWVfMzUxO1xuICAgIHN3aXRjaCAodHlwZV8zNTApIHtcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcImV4cHJcIjpcbiAgICAgICAgdmFsdWVfMzUxID0gdGhpcy5fZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV8zNTEgPSB0aGlzLl9lbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlN5bnRheFwiOlxuICAgICAgICB2YWx1ZV8zNTEgPSB0aGlzLl9lbmYuYWR2YW5jZSgpO1xuICAgICAgICBpZiAoIXRoaXMubm9TY29wZXMpIHtcbiAgICAgICAgICB2YWx1ZV8zNTEgPSB2YWx1ZV8zNTEuYWRkU2NvcGUodGhpcy51c2VTY29wZSkuYWRkU2NvcGUodGhpcy5pbnRyb2R1Y2VkU2NvcGUsIHRoaXMuY29udGV4dC5iaW5kaW5ncywge2ZsaXA6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGVybSB0eXBlOiBcIiArIHR5cGVfMzUwKTtcbiAgICB9XG4gICAgcmV0dXJuIHtkb25lOiBmYWxzZSwgdmFsdWU6IG5ldyBTeW50YXhPclRlcm1XcmFwcGVyKHZhbHVlXzM1MSwgdGhpcy5jb250ZXh0KX07XG4gIH1cbn1cbiJdfQ==