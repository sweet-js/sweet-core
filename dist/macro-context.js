"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unwrap = exports.SyntaxOrTermWrapper = undefined;

var _mapSyntaxReducer = require("./map-syntax-reducer");

var _mapSyntaxReducer2 = _interopRequireDefault(_mapSyntaxReducer);

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _immutable = require("immutable");

var _enforester = require("./enforester");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _ramdaFantasy = require("ramda-fantasy");

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Just_375 = _ramdaFantasy.Maybe.Just;
const Nothing_376 = _ramdaFantasy.Maybe.Nothing;
const symWrap_377 = Symbol("wrapper");
const symName_378 = Symbol("name");
const getLineNumber_379 = t_383 => {
  if (t_383 instanceof _syntax2.default) {
    return t_383.lineNumber();
  }
  throw new Error("Line numbers on terms not implemented yet");
};
const getVal_380 = t_384 => {
  if (t_384.match("delimiter")) {
    return null;
  }
  if (t_384 instanceof _syntax2.default) {
    return t_384.val();
  }
  return null;
};
class SyntaxOrTermWrapper_381 {
  constructor(s_385) {
    let context_386 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this[symWrap_377] = s_385;
    this.context = context_386;
  }
  match(type_387, value_388) {
    let stx_389 = this[symWrap_377];
    if (stx_389 instanceof _syntax2.default) {
      return stx_389.match(type_387, value_388);
    }
  }
  isIdentifier(value_390) {
    return this.match("identifier", value_390);
  }
  isAssign(value_391) {
    return this.match("assign", value_391);
  }
  isBooleanLiteral(value_392) {
    return this.match("boolean", value_392);
  }
  isKeyword(value_393) {
    return this.match("keyword", value_393);
  }
  isNullLiteral(value_394) {
    return this.match("null", value_394);
  }
  isNumericLiteral(value_395) {
    return this.match("number", value_395);
  }
  isPunctuator(value_396) {
    return this.match("punctuator", value_396);
  }
  isStringLiteral(value_397) {
    return this.match("string", value_397);
  }
  isRegularExpression(value_398) {
    return this.match("regularExpression", value_398);
  }
  isTemplate(value_399) {
    return this.match("template", value_399);
  }
  isDelimiter(value_400) {
    return this.match("delimiter", value_400);
  }
  isParens(value_401) {
    return this.match("parens", value_401);
  }
  isBraces(value_402) {
    return this.match("braces", value_402);
  }
  isBrackets(value_403) {
    return this.match("brackets", value_403);
  }
  isSyntaxTemplate(value_404) {
    return this.match("syntaxTemplate", value_404);
  }
  isEOF(value_405) {
    return this.match("eof", value_405);
  }
  lineNumber() {
    return getLineNumber_379(this[symWrap_377]);
  }
  val() {
    return getVal_380(this[symWrap_377]);
  }
  inner() {
    let stx_406 = this[symWrap_377];
    if (!stx_406.match("delimiter")) {
      throw new Error("Can only get inner syntax on a delimiter");
    }
    let enf_407 = new _enforester.Enforester(stx_406.inner(), (0, _immutable.List)(), this.context);
    return new MacroContext(enf_407, "inner", this.context);
  }
}
function unwrap_382(x_408) {
  if (x_408 instanceof SyntaxOrTermWrapper_381) {
    return x_408[symWrap_377];
  }
  return x_408;
}
class MacroContext {
  constructor(enf_409, name_410, context_411, useScope_412, introducedScope_413) {
    this._enf = enf_409;
    this[symName_378] = name_410;
    this.context = context_411;
    if (useScope_412 && introducedScope_413) {
      this.noScopes = false;
      this.useScope = useScope_412;
      this.introducedScope = introducedScope_413;
    } else {
      this.noScopes = true;
    }
    this[Symbol.iterator] = () => this;
  }
  name() {
    return new SyntaxOrTermWrapper_381(this[symName_378], this.context);
  }
  next() {
    let type_414 = arguments.length <= 0 || arguments[0] === undefined ? "Syntax" : arguments[0];

    if (this._enf.rest.size === 0) {
      return { done: true, value: null };
    }
    let value_415;
    switch (type_414) {
      case "AssignmentExpression":
      case "expr":
        value_415 = this._enf.enforestExpressionLoop();
        break;
      case "Expression":
        value_415 = this._enf.enforestExpression();
        break;
      case "Syntax":
        value_415 = this._enf.advance();
        if (!this.noScopes) {
          value_415 = value_415.addScope(this.useScope, this.context.bindings, _syntax.ALL_PHASES).addScope(this.introducedScope, this.context.bindings, _syntax.ALL_PHASES, { flip: true });
        }
        break;
      default:
        throw new Error("Unknown term type: " + type_414);
    }
    return { done: false, value: new SyntaxOrTermWrapper_381(value_415, this.context) };
  }
}
exports.default = MacroContext;
exports.SyntaxOrTermWrapper = SyntaxOrTermWrapper_381;
exports.unwrap = unwrap_382;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hY3JvLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOztJQUFhLEM7Ozs7OztBQUNiLE1BQU0sV0FBVyxvQkFBTSxJQUF2QjtBQUNBLE1BQU0sY0FBYyxvQkFBTSxPQUExQjtBQUNBLE1BQU0sY0FBYyxPQUFPLFNBQVAsQ0FBcEI7QUFDQSxNQUFNLGNBQWMsT0FBTyxNQUFQLENBQXBCO0FBQ0EsTUFBTSxvQkFBb0IsU0FBUztBQUNqQyxNQUFJLGlDQUFKLEVBQTZCO0FBQzNCLFdBQU8sTUFBTSxVQUFOLEVBQVA7QUFDRDtBQUNELFFBQU0sSUFBSSxLQUFKLENBQVUsMkNBQVYsQ0FBTjtBQUNELENBTEQ7QUFNQSxNQUFNLGFBQWEsU0FBUztBQUMxQixNQUFJLE1BQU0sS0FBTixDQUFZLFdBQVosQ0FBSixFQUE4QjtBQUM1QixXQUFPLElBQVA7QUFDRDtBQUNELE1BQUksaUNBQUosRUFBNkI7QUFDM0IsV0FBTyxNQUFNLEdBQU4sRUFBUDtBQUNEO0FBQ0QsU0FBTyxJQUFQO0FBQ0QsQ0FSRDtBQVNBLE1BQU0sdUJBQU4sQ0FBOEI7QUFDNUIsY0FBWSxLQUFaLEVBQXFDO0FBQUEsUUFBbEIsV0FBa0IseURBQUosRUFBSTs7QUFDbkMsU0FBSyxXQUFMLElBQW9CLEtBQXBCO0FBQ0EsU0FBSyxPQUFMLEdBQWUsV0FBZjtBQUNEO0FBQ0QsUUFBTSxRQUFOLEVBQWdCLFNBQWhCLEVBQTJCO0FBQ3pCLFFBQUksVUFBVSxLQUFLLFdBQUwsQ0FBZDtBQUNBLFFBQUksbUNBQUosRUFBK0I7QUFDN0IsYUFBTyxRQUFRLEtBQVIsQ0FBYyxRQUFkLEVBQXdCLFNBQXhCLENBQVA7QUFDRDtBQUNGO0FBQ0QsZUFBYSxTQUFiLEVBQXdCO0FBQ3RCLFdBQU8sS0FBSyxLQUFMLENBQVcsWUFBWCxFQUF5QixTQUF6QixDQUFQO0FBQ0Q7QUFDRCxXQUFT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S0FBUCxFQUFjLE9BQU8sSUFBSSx1QkFBSixDQUE0QixTQUE1QixFQUF1QyxLQUFLLE9BQTVDLENBQXJCLEVBQVA7QUFDRDtBQXhDK0I7a0JBQWIsWTtRQTBDYyxtQixHQUEzQix1QjtRQUNjLE0sR0FBZCxVIiwiZmlsZSI6Im1hY3JvLWNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTWFwU3ludGF4UmVkdWNlciBmcm9tIFwiLi9tYXAtc3ludGF4LXJlZHVjZXJcIjtcbmltcG9ydCByZWR1Y2VyIGZyb20gXCJzaGlmdC1yZWR1Y2VyXCI7XG5pbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7RW5mb3Jlc3Rlcn0gZnJvbSBcIi4vZW5mb3Jlc3RlclwiO1xuaW1wb3J0IFN5bnRheCwge0FMTF9QSEFTRVN9IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuY29uc3QgSnVzdF8zNzUgPSBNYXliZS5KdXN0O1xuY29uc3QgTm90aGluZ18zNzYgPSBNYXliZS5Ob3RoaW5nO1xuY29uc3Qgc3ltV3JhcF8zNzcgPSBTeW1ib2woXCJ3cmFwcGVyXCIpO1xuY29uc3Qgc3ltTmFtZV8zNzggPSBTeW1ib2woXCJuYW1lXCIpO1xuY29uc3QgZ2V0TGluZU51bWJlcl8zNzkgPSB0XzM4MyA9PiB7XG4gIGlmICh0XzM4MyBpbnN0YW5jZW9mIFN5bnRheCkge1xuICAgIHJldHVybiB0XzM4My5saW5lTnVtYmVyKCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKFwiTGluZSBudW1iZXJzIG9uIHRlcm1zIG5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG59O1xuY29uc3QgZ2V0VmFsXzM4MCA9IHRfMzg0ID0+IHtcbiAgaWYgKHRfMzg0Lm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHRfMzg0IGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgcmV0dXJuIHRfMzg0LnZhbCgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcbmNsYXNzIFN5bnRheE9yVGVybVdyYXBwZXJfMzgxIHtcbiAgY29uc3RydWN0b3Ioc18zODUsIGNvbnRleHRfMzg2ID0ge30pIHtcbiAgICB0aGlzW3N5bVdyYXBfMzc3XSA9IHNfMzg1O1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzg2O1xuICB9XG4gIG1hdGNoKHR5cGVfMzg3LCB2YWx1ZV8zODgpIHtcbiAgICBsZXQgc3R4XzM4OSA9IHRoaXNbc3ltV3JhcF8zNzddO1xuICAgIGlmIChzdHhfMzg5IGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgICByZXR1cm4gc3R4XzM4OS5tYXRjaCh0eXBlXzM4NywgdmFsdWVfMzg4KTtcbiAgICB9XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzM5MCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiLCB2YWx1ZV8zOTApO1xuICB9XG4gIGlzQXNzaWduKHZhbHVlXzM5MSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlXzM5MSk7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh2YWx1ZV8zOTIpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWVfMzkyKTtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfMzkzKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJrZXl3b3JkXCIsIHZhbHVlXzM5Myk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZV8zOTQpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bGxcIiwgdmFsdWVfMzk0KTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHZhbHVlXzM5NSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlXzM5NSk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHZhbHVlXzM5Nikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicHVuY3R1YXRvclwiLCB2YWx1ZV8zOTYpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV8zOTcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN0cmluZ1wiLCB2YWx1ZV8zOTcpO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odmFsdWVfMzk4KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV8zOTgpO1xuICB9XG4gIGlzVGVtcGxhdGUodmFsdWVfMzk5KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiLCB2YWx1ZV8zOTkpO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzQwMCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIsIHZhbHVlXzQwMCk7XG4gIH1cbiAgaXNQYXJlbnModmFsdWVfNDAxKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWVfNDAxKTtcbiAgfVxuICBpc0JyYWNlcyh2YWx1ZV80MDIpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNlc1wiLCB2YWx1ZV80MDIpO1xuICB9XG4gIGlzQnJhY2tldHModmFsdWVfNDAzKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFja2V0c1wiLCB2YWx1ZV80MDMpO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUodmFsdWVfNDA0KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZV80MDQpO1xuICB9XG4gIGlzRU9GKHZhbHVlXzQwNSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZW9mXCIsIHZhbHVlXzQwNSk7XG4gIH1cbiAgbGluZU51bWJlcigpIHtcbiAgICByZXR1cm4gZ2V0TGluZU51bWJlcl8zNzkodGhpc1tzeW1XcmFwXzM3N10pO1xuICB9XG4gIHZhbCgpIHtcbiAgICByZXR1cm4gZ2V0VmFsXzM4MCh0aGlzW3N5bVdyYXBfMzc3XSk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgbGV0IHN0eF80MDYgPSB0aGlzW3N5bVdyYXBfMzc3XTtcbiAgICBpZiAoIXN0eF80MDYubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBvbmx5IGdldCBpbm5lciBzeW50YXggb24gYSBkZWxpbWl0ZXJcIik7XG4gICAgfVxuICAgIGxldCBlbmZfNDA3ID0gbmV3IEVuZm9yZXN0ZXIoc3R4XzQwNi5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgcmV0dXJuIG5ldyBNYWNyb0NvbnRleHQoZW5mXzQwNywgXCJpbm5lclwiLCB0aGlzLmNvbnRleHQpO1xuICB9XG59XG5mdW5jdGlvbiB1bndyYXBfMzgyKHhfNDA4KSB7XG4gIGlmICh4XzQwOCBpbnN0YW5jZW9mIFN5bnRheE9yVGVybVdyYXBwZXJfMzgxKSB7XG4gICAgcmV0dXJuIHhfNDA4W3N5bVdyYXBfMzc3XTtcbiAgfVxuICByZXR1cm4geF80MDg7XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWNyb0NvbnRleHQge1xuICBjb25zdHJ1Y3RvcihlbmZfNDA5LCBuYW1lXzQxMCwgY29udGV4dF80MTEsIHVzZVNjb3BlXzQxMiwgaW50cm9kdWNlZFNjb3BlXzQxMykge1xuICAgIHRoaXMuX2VuZiA9IGVuZl80MDk7XG4gICAgdGhpc1tzeW1OYW1lXzM3OF0gPSBuYW1lXzQxMDtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzQxMTtcbiAgICBpZiAodXNlU2NvcGVfNDEyICYmIGludHJvZHVjZWRTY29wZV80MTMpIHtcbiAgICAgIHRoaXMubm9TY29wZXMgPSBmYWxzZTtcbiAgICAgIHRoaXMudXNlU2NvcGUgPSB1c2VTY29wZV80MTI7XG4gICAgICB0aGlzLmludHJvZHVjZWRTY29wZSA9IGludHJvZHVjZWRTY29wZV80MTM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubm9TY29wZXMgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzW1N5bWJvbC5pdGVyYXRvcl0gPSAoKSA9PiB0aGlzO1xuICB9XG4gIG5hbWUoKSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXhPclRlcm1XcmFwcGVyXzM4MSh0aGlzW3N5bU5hbWVfMzc4XSwgdGhpcy5jb250ZXh0KTtcbiAgfVxuICBuZXh0KHR5cGVfNDE0ID0gXCJTeW50YXhcIikge1xuICAgIGlmICh0aGlzLl9lbmYucmVzdC5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4ge2RvbmU6IHRydWUsIHZhbHVlOiBudWxsfTtcbiAgICB9XG4gICAgbGV0IHZhbHVlXzQxNTtcbiAgICBzd2l0Y2ggKHR5cGVfNDE0KSB7XG4gICAgICBjYXNlIFwiQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJleHByXCI6XG4gICAgICAgIHZhbHVlXzQxNSA9IHRoaXMuX2VuZi5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkV4cHJlc3Npb25cIjpcbiAgICAgICAgdmFsdWVfNDE1ID0gdGhpcy5fZW5mLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJTeW50YXhcIjpcbiAgICAgICAgdmFsdWVfNDE1ID0gdGhpcy5fZW5mLmFkdmFuY2UoKTtcbiAgICAgICAgaWYgKCF0aGlzLm5vU2NvcGVzKSB7XG4gICAgICAgICAgdmFsdWVfNDE1ID0gdmFsdWVfNDE1LmFkZFNjb3BlKHRoaXMudXNlU2NvcGUsIHRoaXMuY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykuYWRkU2NvcGUodGhpcy5pbnRyb2R1Y2VkU2NvcGUsIHRoaXMuY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUywge2ZsaXA6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGVybSB0eXBlOiBcIiArIHR5cGVfNDE0KTtcbiAgICB9XG4gICAgcmV0dXJuIHtkb25lOiBmYWxzZSwgdmFsdWU6IG5ldyBTeW50YXhPclRlcm1XcmFwcGVyXzM4MSh2YWx1ZV80MTUsIHRoaXMuY29udGV4dCl9O1xuICB9XG59XG5leHBvcnQge1N5bnRheE9yVGVybVdyYXBwZXJfMzgxIGFzIFN5bnRheE9yVGVybVdyYXBwZXJ9O1xuZXhwb3J0IHt1bndyYXBfMzgyIGFzIHVud3JhcH0iXX0=