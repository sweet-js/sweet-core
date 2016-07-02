"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unwrap = exports.SyntaxOrTermWrapper = undefined;

var _mapSyntaxReducer = require("./map-syntax-reducer");

var _mapSyntaxReducer2 = _interopRequireDefault(_mapSyntaxReducer);

var _shiftReducer = require("shift-reducer");

var _shiftReducer2 = _interopRequireDefault(_shiftReducer);

var _errors = require("./errors");

var _immutable = require("immutable");

var _enforester = require("./enforester");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _ramdaFantasy = require("ramda-fantasy");

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Just_378 = _ramdaFantasy.Maybe.Just;
const Nothing_379 = _ramdaFantasy.Maybe.Nothing;
const symWrap_380 = Symbol("wrapper");
const privateData_381 = new WeakMap();
const getLineNumber_382 = t_386 => {
  if (t_386 instanceof _syntax2.default) {
    return t_386.lineNumber();
  }
  throw new Error("Line numbers on terms not implemented yet");
};
const getVal_383 = t_387 => {
  if (t_387.match("delimiter")) {
    return null;
  }
  if (t_387 instanceof _syntax2.default) {
    return t_387.val();
  }
  return null;
};
class SyntaxOrTermWrapper_384 {
  constructor(s_388) {
    let context_389 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this[symWrap_380] = s_388;
    this.context = context_389;
  }
  match(type_390, value_391) {
    let stx_392 = this[symWrap_380];
    if (stx_392 instanceof _syntax2.default) {
      return stx_392.match(type_390, value_391);
    }
  }
  isIdentifier(value_393) {
    return this.match("identifier", value_393);
  }
  isAssign(value_394) {
    return this.match("assign", value_394);
  }
  isBooleanLiteral(value_395) {
    return this.match("boolean", value_395);
  }
  isKeyword(value_396) {
    return this.match("keyword", value_396);
  }
  isNullLiteral(value_397) {
    return this.match("null", value_397);
  }
  isNumericLiteral(value_398) {
    return this.match("number", value_398);
  }
  isPunctuator(value_399) {
    return this.match("punctuator", value_399);
  }
  isStringLiteral(value_400) {
    return this.match("string", value_400);
  }
  isRegularExpression(value_401) {
    return this.match("regularExpression", value_401);
  }
  isTemplate(value_402) {
    return this.match("template", value_402);
  }
  isDelimiter(value_403) {
    return this.match("delimiter", value_403);
  }
  isParens(value_404) {
    return this.match("parens", value_404);
  }
  isBraces(value_405) {
    return this.match("braces", value_405);
  }
  isBrackets(value_406) {
    return this.match("brackets", value_406);
  }
  isSyntaxTemplate(value_407) {
    return this.match("syntaxTemplate", value_407);
  }
  isEOF(value_408) {
    return this.match("eof", value_408);
  }
  lineNumber() {
    return getLineNumber_382(this[symWrap_380]);
  }
  val() {
    return getVal_383(this[symWrap_380]);
  }
  inner() {
    let stx_409 = this[symWrap_380];
    if (!stx_409.match("delimiter")) {
      throw new Error("Can only get inner syntax on a delimiter");
    }
    let enf_410 = new _enforester.Enforester(stx_409.inner(), (0, _immutable.List)(), this.context);
    return new MacroContext(enf_410, "inner", this.context);
  }
}
function unwrap_385(x_411) {
  if (x_411 instanceof SyntaxOrTermWrapper_384) {
    return x_411[symWrap_380];
  }
  return x_411;
}
class MacroContext {
  constructor(enf_412, name_413, context_414, useScope_415, introducedScope_416) {
    const priv_417 = { backup: enf_412, name: name_413, context: context_414 };
    if (useScope_415 && introducedScope_416) {
      priv_417.noScopes = false;
      priv_417.useScope = useScope_415;
      priv_417.introducedScope = introducedScope_416;
    } else {
      priv_417.noScopes = true;
    }
    privateData_381.set(this, priv_417);
    this.reset();
    this[Symbol.iterator] = () => this;
  }
  name() {
    var _privateData_381$get = privateData_381.get(this);

    const name = _privateData_381$get.name;
    const context = _privateData_381$get.context;

    return new SyntaxOrTermWrapper_384(name, context);
  }
  expand(type_418) {
    var _privateData_381$get2 = privateData_381.get(this);

    const enf = _privateData_381$get2.enf;
    const context = _privateData_381$get2.context;

    if (enf.rest.size === 0) {
      return { done: true, value: null };
    }
    enf.expandMacro();
    let originalRest_419 = enf.rest;
    let value_420;
    switch (type_418) {
      case "AssignmentExpression":
      case "expr":
        value_420 = enf.enforestExpressionLoop();
        break;
      case "Expression":
        value_420 = enf.enforestExpression();
        break;
      case "Statement":
      case "stmt":
        value_420 = enf.enforestStatement();
        break;
      case "BlockStatement":
      case "WhileStatement":
      case "IfStatement":
      case "ForStatement":
      case "SwitchStatement":
      case "BreakStatement":
      case "ContinueStatement":
      case "DebuggerStatement":
      case "WithStatement":
      case "TryStatement":
      case "ThrowStatement":
      case "ClassDeclaration":
      case "FunctionDeclaration":
      case "LabeledStatement":
      case "VariableDeclarationStatement":
      case "ReturnStatement":
      case "ExpressionStatement":
        value_420 = enf.enforestStatement();
        (0, _errors.expect)(_.whereEq({ type: type_418 }, value_420), `Expecting a ${ type_418 }`, value_420, originalRest_419);
        break;
      case "YieldExpression":
        value_420 = enf.enforestYieldExpression();
        break;
      case "ClassExpression":
        value_420 = enf.enforestClass({ isExpr: true });
        break;
      case "ArrowExpression":
        value_420 = enf.enforestArrowExpression();
        break;
      case "NewExpression":
        value_420 = enf.enforestNewExpression();
        break;
      case "ThisExpression":
      case "FunctionExpression":
      case "IdentifierExpression":
      case "LiteralNumericExpression":
      case "LiteralInfinityExpression":
      case "LiteralStringExpression":
      case "TemplateExpression":
      case "LiteralBooleanExpression":
      case "LiteralNullExpression":
      case "LiteralRegExpExpression":
      case "ObjectExpression":
      case "ArrayExpression":
        value_420 = enf.enforestPrimaryExpression();
        break;
      case "UnaryExpression":
      case "UpdateExpression":
      case "BinaryExpression":
      case "StaticMemberExpression":
      case "ComputedMemberExpression":
      case "AssignmentExpression":
      case "CompoundAssignmentExpression":
      case "ConditionalExpression":
        value_420 = enf.enforestExpressionLoop();
        (0, _errors.expect)(_.whereEq({ type: type_418 }, value_420), `Expecting a ${ type_418 }`, value_420, originalRest_419);
        break;
      default:
        throw new Error("Unknown term type: " + type_418);
    }
    return { done: false, value: new SyntaxOrTermWrapper_384(value_420, context) };
  }
  _rest(enf_421) {
    const priv_422 = privateData_381.get(this);
    if (priv_422.backup === enf_421) {
      return priv_422.enf.rest;
    }
    throw Error("Unauthorized access!");
  }
  reset() {
    const priv_423 = privateData_381.get(this);
    var _priv_423$backup = priv_423.backup;
    const rest = _priv_423$backup.rest;
    const prev = _priv_423$backup.prev;
    const context = _priv_423$backup.context;

    priv_423.enf = new _enforester.Enforester(rest, prev, context);
  }
  next() {
    var _privateData_381$get3 = privateData_381.get(this);

    const enf = _privateData_381$get3.enf;
    const noScopes = _privateData_381$get3.noScopes;
    const useScope = _privateData_381$get3.useScope;
    const introducedScope = _privateData_381$get3.introducedScope;
    const context = _privateData_381$get3.context;

    if (enf.rest.size === 0) {
      return { done: true, value: null };
    }
    let value_424 = enf.advance();
    if (!noScopes) {
      value_424 = value_424.addScope(useScope, context.bindings, _syntax.ALL_PHASES).addScope(introducedScope, context.bindings, _syntax.ALL_PHASES, { flip: true });
    }
    return { done: false, value: new SyntaxOrTermWrapper_384(value_424, context) };
  }
}
exports.default = MacroContext;
exports.SyntaxOrTermWrapper = SyntaxOrTermWrapper_384;
exports.unwrap = unwrap_385;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hY3JvLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOztJQUFhLEM7Ozs7OztBQUNiLE1BQU0sV0FBVyxvQkFBTSxJQUF2QjtBQUNBLE1BQU0sY0FBYyxvQkFBTSxPQUExQjtBQUNBLE1BQU0sY0FBYyxPQUFPLFNBQVAsQ0FBcEI7QUFDQSxNQUFNLGtCQUFrQixJQUFJLE9BQUosRUFBeEI7QUFDQSxNQUFNLG9CQUFvQixTQUFTO0FBQ2pDLE1BQUksaUNBQUosRUFBNkI7QUFDM0IsV0FBTyxNQUFNLFVBQU4sRUFBUDtBQUNEO0FBQ0QsUUFBTSxJQUFJLEtBQUosQ0FBVSwyQ0FBVixDQUFOO0FBQ0QsQ0FMRDtBQU1BLE1BQU0sYUFBYSxTQUFTO0FBQzFCLE1BQUksTUFBTSxLQUFOLENBQVksV0FBWixDQUFKLEVBQThCO0FBQzVCLFdBQU8sSUFBUDtBQUNEO0FBQ0QsTUFBSSxpQ0FBSixFQUE2QjtBQUMzQixXQUFPLE1BQU0sR0FBTixFQUFQO0FBQ0Q7QUFDRCxTQUFPLElBQVA7QUFDRCxDQVJEO0FBU0EsTUFBTSx1QkFBTixDQUE4QjtBQUM1QixjQUFZLEtBQVosRUFBcUM7QUFBQSxRQUFsQixXQUFrQix5REFBSixFQUFJOztBQUNuQyxTQUFLLFdBQUwsSUFBb0IsS0FBcEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxXQUFmO0FBQ0Q7QUFDRCxRQUFNLFFBQU4sRUFBZ0IsU0FBaEIsRUFBMkI7QUFDekIsUUFBSSxVQUFVLEtBQUssV0FBTCxDQUFkO0FBQ0EsUUFBSSxtQ0FBSixFQUErQjtBQUM3QixhQUFPLFFBQVEsS0FBUixDQUFjLFFBQWQsRUFBd0IsU0FBeEIsQ0FBUDtBQUNEO0FBQ0Y7QUFDRCxlQUFhLFNBQWIsRUFBd0I7QUFDdEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxZQUFYLEVBQXlCLFNBQXpCLENBQVA7QUFDRDtB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QURqQjtBQUFBLFVBQzJCLGVBRDNCLHlCQUMyQixlQUQzQjtBQUFBLFVBQzRDLE9BRDVDLHlCQUM0QyxPQUQ1Qzs7QUFFTCxRQUFJLElBQUksSUFBSixDQUFTLElBQVQsS0FBa0IsQ0FBdEIsRUFBeUI7QUFDdkIsYUFBTyxFQUFDLE1BQU0sSUFBUCxFQUFhLE9BQU8sSUFBcEIsRUFBUDtBQUNEO0FBQ0QsUUFBSSxZQUFZLElBQUksT0FBSixFQUFoQjtBQUNBLFFBQUksQ0FBQyxRQUFMLEVBQWU7QUFDYixrQkFBWSxVQUFVLFFBQVYsQ0FBbUIsUUFBbkIsRUFBNkIsUUFBUSxRQUFyQyxzQkFBMkQsUUFBM0QsQ0FBb0UsZUFBcEUsRUFBcUYsUUFBUSxRQUE3RixzQkFBbUgsRUFBQyxNQUFNLElBQVAsRUFBbkgsQ0FBWjtBQUNEO0FBQ0QsV0FBTyxFQUFDLE1BQU0sS0FBUCxFQUFjLE9BQU8sSUFBSSx1QkFBSixDQUE0QixTQUE1QixFQUF1QyxPQUF2QyxDQUFyQixFQUFQO0FBQ0Q7QUExSCtCO2tCQUFiLFk7UUE0SGMsbUIsR0FBM0IsdUI7UUFDYyxNLEdBQWQsVSIsImZpbGUiOiJtYWNyby1jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hcFN5bnRheFJlZHVjZXIgZnJvbSBcIi4vbWFwLXN5bnRheC1yZWR1Y2VyXCI7XG5pbXBvcnQgcmVkdWNlciBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuaW1wb3J0IHtleHBlY3R9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge0VuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IEp1c3RfMzc4ID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfMzc5ID0gTWF5YmUuTm90aGluZztcbmNvbnN0IHN5bVdyYXBfMzgwID0gU3ltYm9sKFwid3JhcHBlclwiKTtcbmNvbnN0IHByaXZhdGVEYXRhXzM4MSA9IG5ldyBXZWFrTWFwO1xuY29uc3QgZ2V0TGluZU51bWJlcl8zODIgPSB0XzM4NiA9PiB7XG4gIGlmICh0XzM4NiBpbnN0YW5jZW9mIFN5bnRheCkge1xuICAgIHJldHVybiB0XzM4Ni5saW5lTnVtYmVyKCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKFwiTGluZSBudW1iZXJzIG9uIHRlcm1zIG5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG59O1xuY29uc3QgZ2V0VmFsXzM4MyA9IHRfMzg3ID0+IHtcbiAgaWYgKHRfMzg3Lm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHRfMzg3IGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgcmV0dXJuIHRfMzg3LnZhbCgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcbmNsYXNzIFN5bnRheE9yVGVybVdyYXBwZXJfMzg0IHtcbiAgY29uc3RydWN0b3Ioc18zODgsIGNvbnRleHRfMzg5ID0ge30pIHtcbiAgICB0aGlzW3N5bVdyYXBfMzgwXSA9IHNfMzg4O1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzg5O1xuICB9XG4gIG1hdGNoKHR5cGVfMzkwLCB2YWx1ZV8zOTEpIHtcbiAgICBsZXQgc3R4XzM5MiA9IHRoaXNbc3ltV3JhcF8zODBdO1xuICAgIGlmIChzdHhfMzkyIGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgICByZXR1cm4gc3R4XzM5Mi5tYXRjaCh0eXBlXzM5MCwgdmFsdWVfMzkxKTtcbiAgICB9XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzM5Mykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiLCB2YWx1ZV8zOTMpO1xuICB9XG4gIGlzQXNzaWduKHZhbHVlXzM5NCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlXzM5NCk7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh2YWx1ZV8zOTUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWVfMzk1KTtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfMzk2KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJrZXl3b3JkXCIsIHZhbHVlXzM5Nik7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZV8zOTcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bGxcIiwgdmFsdWVfMzk3KTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHZhbHVlXzM5OCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlXzM5OCk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHZhbHVlXzM5OSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicHVuY3R1YXRvclwiLCB2YWx1ZV8zOTkpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV80MDApIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN0cmluZ1wiLCB2YWx1ZV80MDApO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odmFsdWVfNDAxKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV80MDEpO1xuICB9XG4gIGlzVGVtcGxhdGUodmFsdWVfNDAyKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiLCB2YWx1ZV80MDIpO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzQwMykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIsIHZhbHVlXzQwMyk7XG4gIH1cbiAgaXNQYXJlbnModmFsdWVfNDA0KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWVfNDA0KTtcbiAgfVxuICBpc0JyYWNlcyh2YWx1ZV80MDUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNlc1wiLCB2YWx1ZV80MDUpO1xuICB9XG4gIGlzQnJhY2tldHModmFsdWVfNDA2KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFja2V0c1wiLCB2YWx1ZV80MDYpO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUodmFsdWVfNDA3KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZV80MDcpO1xuICB9XG4gIGlzRU9GKHZhbHVlXzQwOCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZW9mXCIsIHZhbHVlXzQwOCk7XG4gIH1cbiAgbGluZU51bWJlcigpIHtcbiAgICByZXR1cm4gZ2V0TGluZU51bWJlcl8zODIodGhpc1tzeW1XcmFwXzM4MF0pO1xuICB9XG4gIHZhbCgpIHtcbiAgICByZXR1cm4gZ2V0VmFsXzM4Myh0aGlzW3N5bVdyYXBfMzgwXSk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgbGV0IHN0eF80MDkgPSB0aGlzW3N5bVdyYXBfMzgwXTtcbiAgICBpZiAoIXN0eF80MDkubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBvbmx5IGdldCBpbm5lciBzeW50YXggb24gYSBkZWxpbWl0ZXJcIik7XG4gICAgfVxuICAgIGxldCBlbmZfNDEwID0gbmV3IEVuZm9yZXN0ZXIoc3R4XzQwOS5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgcmV0dXJuIG5ldyBNYWNyb0NvbnRleHQoZW5mXzQxMCwgXCJpbm5lclwiLCB0aGlzLmNvbnRleHQpO1xuICB9XG59XG5mdW5jdGlvbiB1bndyYXBfMzg1KHhfNDExKSB7XG4gIGlmICh4XzQxMSBpbnN0YW5jZW9mIFN5bnRheE9yVGVybVdyYXBwZXJfMzg0KSB7XG4gICAgcmV0dXJuIHhfNDExW3N5bVdyYXBfMzgwXTtcbiAgfVxuICByZXR1cm4geF80MTE7XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWNyb0NvbnRleHQge1xuICBjb25zdHJ1Y3RvcihlbmZfNDEyLCBuYW1lXzQxMywgY29udGV4dF80MTQsIHVzZVNjb3BlXzQxNSwgaW50cm9kdWNlZFNjb3BlXzQxNikge1xuICAgIGNvbnN0IHByaXZfNDE3ID0ge2JhY2t1cDogZW5mXzQxMiwgbmFtZTogbmFtZV80MTMsIGNvbnRleHQ6IGNvbnRleHRfNDE0fTtcbiAgICBpZiAodXNlU2NvcGVfNDE1ICYmIGludHJvZHVjZWRTY29wZV80MTYpIHtcbiAgICAgIHByaXZfNDE3Lm5vU2NvcGVzID0gZmFsc2U7XG4gICAgICBwcml2XzQxNy51c2VTY29wZSA9IHVzZVNjb3BlXzQxNTtcbiAgICAgIHByaXZfNDE3LmludHJvZHVjZWRTY29wZSA9IGludHJvZHVjZWRTY29wZV80MTY7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByaXZfNDE3Lm5vU2NvcGVzID0gdHJ1ZTtcbiAgICB9XG4gICAgcHJpdmF0ZURhdGFfMzgxLnNldCh0aGlzLCBwcml2XzQxNyk7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXNbU3ltYm9sLml0ZXJhdG9yXSA9ICgpID0+IHRoaXM7XG4gIH1cbiAgbmFtZSgpIHtcbiAgICBjb25zdCB7bmFtZSwgY29udGV4dH0gPSBwcml2YXRlRGF0YV8zODEuZ2V0KHRoaXMpO1xuICAgIHJldHVybiBuZXcgU3ludGF4T3JUZXJtV3JhcHBlcl8zODQobmFtZSwgY29udGV4dCk7XG4gIH1cbiAgZXhwYW5kKHR5cGVfNDE4KSB7XG4gICAgY29uc3Qge2VuZiwgY29udGV4dH0gPSBwcml2YXRlRGF0YV8zODEuZ2V0KHRoaXMpO1xuICAgIGlmIChlbmYucmVzdC5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4ge2RvbmU6IHRydWUsIHZhbHVlOiBudWxsfTtcbiAgICB9XG4gICAgZW5mLmV4cGFuZE1hY3JvKCk7XG4gICAgbGV0IG9yaWdpbmFsUmVzdF80MTkgPSBlbmYucmVzdDtcbiAgICBsZXQgdmFsdWVfNDIwO1xuICAgIHN3aXRjaCAodHlwZV80MTgpIHtcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcImV4cHJcIjpcbiAgICAgICAgdmFsdWVfNDIwID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV80MjAgPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcInN0bXRcIjpcbiAgICAgICAgdmFsdWVfNDIwID0gZW5mLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkJsb2NrU3RhdGVtZW50XCI6XG4gICAgICBjYXNlIFwiV2hpbGVTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJJZlN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIkZvclN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIlN3aXRjaFN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIkJyZWFrU3RhdGVtZW50XCI6XG4gICAgICBjYXNlIFwiQ29udGludWVTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJEZWJ1Z2dlclN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIldpdGhTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJUcnlTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJUaHJvd1N0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIkNsYXNzRGVjbGFyYXRpb25cIjpcbiAgICAgIGNhc2UgXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCI6XG4gICAgICBjYXNlIFwiTGFiZWxlZFN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJSZXR1cm5TdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJFeHByZXNzaW9uU3RhdGVtZW50XCI6XG4gICAgICAgIHZhbHVlXzQyMCA9IGVuZi5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgICAgICBleHBlY3QoXy53aGVyZUVxKHt0eXBlOiB0eXBlXzQxOH0sIHZhbHVlXzQyMCksIGBFeHBlY3RpbmcgYSAke3R5cGVfNDE4fWAsIHZhbHVlXzQyMCwgb3JpZ2luYWxSZXN0XzQxOSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIllpZWxkRXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV80MjAgPSBlbmYuZW5mb3Jlc3RZaWVsZEV4cHJlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQ2xhc3NFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzQyMCA9IGVuZi5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IHRydWV9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzQyMCA9IGVuZi5lbmZvcmVzdEFycm93RXhwcmVzc2lvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJOZXdFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzQyMCA9IGVuZi5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiVGhpc0V4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJGdW5jdGlvbkV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxOdW1lcmljRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxJbmZpbml0eUV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIlRlbXBsYXRlRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxCb29sZWFuRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxOdWxsRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxSZWdFeHBFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiT2JqZWN0RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkFycmF5RXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV80MjAgPSBlbmYuZW5mb3Jlc3RQcmltYXJ5RXhwcmVzc2lvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJVbmFyeUV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJVcGRhdGVFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiQmluYXJ5RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIjpcbiAgICAgICAgdmFsdWVfNDIwID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgZXhwZWN0KF8ud2hlcmVFcSh7dHlwZTogdHlwZV80MTh9LCB2YWx1ZV80MjApLCBgRXhwZWN0aW5nIGEgJHt0eXBlXzQxOH1gLCB2YWx1ZV80MjAsIG9yaWdpbmFsUmVzdF80MTkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGVybSB0eXBlOiBcIiArIHR5cGVfNDE4KTtcbiAgICB9XG4gICAgcmV0dXJuIHtkb25lOiBmYWxzZSwgdmFsdWU6IG5ldyBTeW50YXhPclRlcm1XcmFwcGVyXzM4NCh2YWx1ZV80MjAsIGNvbnRleHQpfTtcbiAgfVxuICBfcmVzdChlbmZfNDIxKSB7XG4gICAgY29uc3QgcHJpdl80MjIgPSBwcml2YXRlRGF0YV8zODEuZ2V0KHRoaXMpO1xuICAgIGlmIChwcml2XzQyMi5iYWNrdXAgPT09IGVuZl80MjEpIHtcbiAgICAgIHJldHVybiBwcml2XzQyMi5lbmYucmVzdDtcbiAgICB9XG4gICAgdGhyb3cgRXJyb3IoXCJVbmF1dGhvcml6ZWQgYWNjZXNzIVwiKTtcbiAgfVxuICByZXNldCgpIHtcbiAgICBjb25zdCBwcml2XzQyMyA9IHByaXZhdGVEYXRhXzM4MS5nZXQodGhpcyk7XG4gICAgY29uc3Qge3Jlc3QsIHByZXYsIGNvbnRleHR9ID0gcHJpdl80MjMuYmFja3VwO1xuICAgIHByaXZfNDIzLmVuZiA9IG5ldyBFbmZvcmVzdGVyKHJlc3QsIHByZXYsIGNvbnRleHQpO1xuICB9XG4gIG5leHQoKSB7XG4gICAgY29uc3Qge2VuZiwgbm9TY29wZXMsIHVzZVNjb3BlLCBpbnRyb2R1Y2VkU2NvcGUsIGNvbnRleHR9ID0gcHJpdmF0ZURhdGFfMzgxLmdldCh0aGlzKTtcbiAgICBpZiAoZW5mLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtkb25lOiB0cnVlLCB2YWx1ZTogbnVsbH07XG4gICAgfVxuICAgIGxldCB2YWx1ZV80MjQgPSBlbmYuYWR2YW5jZSgpO1xuICAgIGlmICghbm9TY29wZXMpIHtcbiAgICAgIHZhbHVlXzQyNCA9IHZhbHVlXzQyNC5hZGRTY29wZSh1c2VTY29wZSwgY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykuYWRkU2NvcGUoaW50cm9kdWNlZFNjb3BlLCBjb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTLCB7ZmxpcDogdHJ1ZX0pO1xuICAgIH1cbiAgICByZXR1cm4ge2RvbmU6IGZhbHNlLCB2YWx1ZTogbmV3IFN5bnRheE9yVGVybVdyYXBwZXJfMzg0KHZhbHVlXzQyNCwgY29udGV4dCl9O1xuICB9XG59XG5leHBvcnQge1N5bnRheE9yVGVybVdyYXBwZXJfMzg0IGFzIFN5bnRheE9yVGVybVdyYXBwZXJ9O1xuZXhwb3J0IHt1bndyYXBfMzg1IGFzIHVud3JhcH0iXX0=