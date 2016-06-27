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

const Just_376 = _ramdaFantasy.Maybe.Just;
const Nothing_377 = _ramdaFantasy.Maybe.Nothing;
const symWrap_378 = Symbol("wrapper");
const privateData_379 = new WeakMap();
const getLineNumber_380 = t_384 => {
  if (t_384 instanceof _syntax2.default) {
    return t_384.lineNumber();
  }
  throw new Error("Line numbers on terms not implemented yet");
};
const getVal_381 = t_385 => {
  if (t_385.match("delimiter")) {
    return null;
  }
  if (t_385 instanceof _syntax2.default) {
    return t_385.val();
  }
  return null;
};
class SyntaxOrTermWrapper_382 {
  constructor(s_386) {
    let context_387 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this[symWrap_378] = s_386;
    this.context = context_387;
  }
  match(type_388, value_389) {
    let stx_390 = this[symWrap_378];
    if (stx_390 instanceof _syntax2.default) {
      return stx_390.match(type_388, value_389);
    }
  }
  isIdentifier(value_391) {
    return this.match("identifier", value_391);
  }
  isAssign(value_392) {
    return this.match("assign", value_392);
  }
  isBooleanLiteral(value_393) {
    return this.match("boolean", value_393);
  }
  isKeyword(value_394) {
    return this.match("keyword", value_394);
  }
  isNullLiteral(value_395) {
    return this.match("null", value_395);
  }
  isNumericLiteral(value_396) {
    return this.match("number", value_396);
  }
  isPunctuator(value_397) {
    return this.match("punctuator", value_397);
  }
  isStringLiteral(value_398) {
    return this.match("string", value_398);
  }
  isRegularExpression(value_399) {
    return this.match("regularExpression", value_399);
  }
  isTemplate(value_400) {
    return this.match("template", value_400);
  }
  isDelimiter(value_401) {
    return this.match("delimiter", value_401);
  }
  isParens(value_402) {
    return this.match("parens", value_402);
  }
  isBraces(value_403) {
    return this.match("braces", value_403);
  }
  isBrackets(value_404) {
    return this.match("brackets", value_404);
  }
  isSyntaxTemplate(value_405) {
    return this.match("syntaxTemplate", value_405);
  }
  isEOF(value_406) {
    return this.match("eof", value_406);
  }
  lineNumber() {
    return getLineNumber_380(this[symWrap_378]);
  }
  val() {
    return getVal_381(this[symWrap_378]);
  }
  inner() {
    let stx_407 = this[symWrap_378];
    if (!stx_407.match("delimiter")) {
      throw new Error("Can only get inner syntax on a delimiter");
    }
    let enf_408 = new _enforester.Enforester(stx_407.inner(), (0, _immutable.List)(), this.context);
    return new MacroContext(enf_408, "inner", this.context);
  }
}
function unwrap_383(x_409) {
  if (x_409 instanceof SyntaxOrTermWrapper_382) {
    return x_409[symWrap_378];
  }
  return x_409;
}
class MacroContext {
  constructor(enf_410, name_411, context_412, useScope_413, introducedScope_414) {
    const priv_415 = { backup: enf_410, name: name_411, context: context_412 };
    if (useScope_413 && introducedScope_414) {
      priv_415.noScopes = false;
      priv_415.useScope = useScope_413;
      priv_415.introducedScope = introducedScope_414;
    } else {
      priv_415.noScopes = true;
    }
    privateData_379.set(this, priv_415);
    this.reset();
    this[Symbol.iterator] = () => this;
  }
  name() {
    var _privateData_379$get = privateData_379.get(this);

    const name = _privateData_379$get.name;
    const context = _privateData_379$get.context;

    return new SyntaxOrTermWrapper_382(name, context);
  }
  expand(type_416) {
    var _privateData_379$get2 = privateData_379.get(this);

    const enf = _privateData_379$get2.enf;
    const context = _privateData_379$get2.context;

    if (enf.rest.size === 0) {
      return { done: true, value: null };
    }
    enf.expandMacro();
    let originalRest_417 = enf.rest;
    let value_418;
    switch (type_416) {
      case "AssignmentExpression":
      case "expr":
        value_418 = enf.enforestExpressionLoop();
        break;
      case "Expression":
        value_418 = enf.enforestExpression();
        break;
      case "Statement":
      case "stmt":
        value_418 = enf.enforestStatement();
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
        value_418 = enf.enforestStatement();
        (0, _errors.expect)(_.whereEq({ type: type_416 }, value_418), `Expecting a ${ type_416 }`, value_418, originalRest_417);
        break;
      case "YieldExpression":
        value_418 = enf.enforestYieldExpression();
        break;
      case "ClassExpression":
        value_418 = enf.enforestClass({ isExpr: true });
        break;
      case "ArrowExpression":
        value_418 = enf.enforestArrowExpression();
        break;
      case "NewExpression":
        value_418 = enf.enforestNewExpression();
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
        value_418 = enf.enforestPrimaryExpression();
        break;
      case "UnaryExpression":
      case "UpdateExpression":
      case "BinaryExpression":
      case "StaticMemberExpression":
      case "ComputedMemberExpression":
      case "AssignmentExpression":
      case "CompoundAssignmentExpression":
      case "ConditionalExpression":
        value_418 = enf.enforestExpressionLoop();
        (0, _errors.expect)(_.whereEq({ type: type_416 }, value_418), `Expecting a ${ type_416 }`, value_418, originalRest_417);
        break;
      default:
        throw new Error("Unknown term type: " + type_416);
    }
    return { done: false, value: new SyntaxOrTermWrapper_382(value_418, context) };
  }
  _rest(enf_419) {
    const priv_420 = privateData_379.get(this);
    if (priv_420.backup === enf_419) {
      return priv_420.enf.rest;
    }
    throw Error("Unauthorized access!");
  }
  reset() {
    const priv_421 = privateData_379.get(this);
    var _priv_421$backup = priv_421.backup;
    const rest = _priv_421$backup.rest;
    const prev = _priv_421$backup.prev;
    const context = _priv_421$backup.context;

    priv_421.enf = new _enforester.Enforester(rest, prev, context);
  }
  next() {
    var _privateData_379$get3 = privateData_379.get(this);

    const enf = _privateData_379$get3.enf;
    const noScopes = _privateData_379$get3.noScopes;
    const useScope = _privateData_379$get3.useScope;
    const introducedScope = _privateData_379$get3.introducedScope;
    const context = _privateData_379$get3.context;

    if (enf.rest.size === 0) {
      return { done: true, value: null };
    }
    let value_422 = enf.advance();
    if (!noScopes) {
      value_422 = value_422.addScope(useScope, context.bindings, _syntax.ALL_PHASES).addScope(introducedScope, context.bindings, _syntax.ALL_PHASES, { flip: true });
    }
    return { done: false, value: new SyntaxOrTermWrapper_382(value_422, context) };
  }
}
exports.default = MacroContext;
exports.SyntaxOrTermWrapper = SyntaxOrTermWrapper_382;
exports.unwrap = unwrap_383;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hY3JvLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOztJQUFhLEM7Ozs7OztBQUNiLE1BQU0sV0FBVyxvQkFBTSxJQUF2QjtBQUNBLE1BQU0sY0FBYyxvQkFBTSxPQUExQjtBQUNBLE1BQU0sY0FBYyxPQUFPLFNBQVAsQ0FBcEI7QUFDQSxNQUFNLGtCQUFrQixJQUFJLE9BQUosRUFBeEI7QUFDQSxNQUFNLG9CQUFvQixTQUFTO0FBQ2pDLE1BQUksaUNBQUosRUFBNkI7QUFDM0IsV0FBTyxNQUFNLFVBQU4sRUFBUDtBQUNEO0FBQ0QsUUFBTSxJQUFJLEtBQUosQ0FBVSwyQ0FBVixDQUFOO0FBQ0QsQ0FMRDtBQU1BLE1BQU0sYUFBYSxTQUFTO0FBQzFCLE1BQUksTUFBTSxLQUFOLENBQVksV0FBWixDQUFKLEVBQThCO0FBQzVCLFdBQU8sSUFBUDtBQUNEO0FBQ0QsTUFBSSxpQ0FBSixFQUE2QjtBQUMzQixXQUFPLE1BQU0sR0FBTixFQUFQO0FBQ0Q7QUFDRCxTQUFPLElBQVA7QUFDRCxDQVJEO0FBU0EsTUFBTSx1QkFBTixDQUE4QjtBQUM1QixjQUFZLEtBQVosRUFBcUM7QUFBQSxRQUFsQixXQUFrQix5REFBSixFQUFJOztBQUNuQyxTQUFLLFdBQUwsSUFBb0IsS0FBcEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxXQUFmO0FBQ0Q7QUFDRCxRQUFNLFFBQU4sRUFBZ0IsU0FBaEIsRUFBMkI7QUFDekIsUUFBSSxVQUFVLEtBQUssV0FBTCxDQUFkO0FBQ0EsUUFBSSxtQ0FBSixFQUErQjtBQUM3QixhQUFPLFFBQVEsS0FBUixDQUFjLFFBQWQsRUFBd0IsU0FBeEIsQ0FBUDtBQUNEO0FBQ0Y7QUFDRCxlQUFhLFNBQWIsRUFBd0I7QUFDdEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxZQUFYLEVBQXlCLFNBQXpCLENBQVA7QUFDRDtB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QzRDLE9BRDVDLHlCQUM0QyxPQUQ1Qzs7QUFFTCxRQUFJLElBQUksSUFBSixDQUFTLElBQVQsS0FBa0IsQ0FBdEIsRUFBeUI7QUFDdkIsYUFBTyxFQUFDLE1BQU0sSUFBUCxFQUFhLE9BQU8sSUFBcEIsRUFBUDtBQUNEO0FBQ0QsUUFBSSxZQUFZLElBQUksT0FBSixFQUFoQjtBQUNBLFFBQUksQ0FBQyxRQUFMLEVBQWU7QUFDYixrQkFBWSxVQUFVLFFBQVYsQ0FBbUIsUUFBbkIsRUFBNkIsUUFBUSxRQUFyQyxzQkFBMkQsUUFBM0QsQ0FBb0UsZUFBcEUsRUFBcUYsUUFBUSxRQUE3RixzQkFBbUgsRUFBQyxNQUFNLElBQVAsRUFBbkgsQ0FBWjtBQUNEO0FBQ0QsV0FBTyxFQUFDLE1BQU0sS0FBUCxFQUFjLE9BQU8sSUFBSSx1QkFBSixDQUE0QixTQUE1QixFQUF1QyxPQUF2QyxDQUFyQixFQUFQO0FBQ0Q7QUExSCtCO2tCQUFiLFk7UUE0SGMsbUIsR0FBM0IsdUI7UUFDYyxNLEdBQWQsVSIsImZpbGUiOiJtYWNyby1jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hcFN5bnRheFJlZHVjZXIgZnJvbSBcIi4vbWFwLXN5bnRheC1yZWR1Y2VyXCI7XG5pbXBvcnQgcmVkdWNlciBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuaW1wb3J0IHtleHBlY3R9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge0VuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IEp1c3RfMzc2ID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfMzc3ID0gTWF5YmUuTm90aGluZztcbmNvbnN0IHN5bVdyYXBfMzc4ID0gU3ltYm9sKFwid3JhcHBlclwiKTtcbmNvbnN0IHByaXZhdGVEYXRhXzM3OSA9IG5ldyBXZWFrTWFwO1xuY29uc3QgZ2V0TGluZU51bWJlcl8zODAgPSB0XzM4NCA9PiB7XG4gIGlmICh0XzM4NCBpbnN0YW5jZW9mIFN5bnRheCkge1xuICAgIHJldHVybiB0XzM4NC5saW5lTnVtYmVyKCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKFwiTGluZSBudW1iZXJzIG9uIHRlcm1zIG5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG59O1xuY29uc3QgZ2V0VmFsXzM4MSA9IHRfMzg1ID0+IHtcbiAgaWYgKHRfMzg1Lm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHRfMzg1IGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgcmV0dXJuIHRfMzg1LnZhbCgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcbmNsYXNzIFN5bnRheE9yVGVybVdyYXBwZXJfMzgyIHtcbiAgY29uc3RydWN0b3Ioc18zODYsIGNvbnRleHRfMzg3ID0ge30pIHtcbiAgICB0aGlzW3N5bVdyYXBfMzc4XSA9IHNfMzg2O1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzg3O1xuICB9XG4gIG1hdGNoKHR5cGVfMzg4LCB2YWx1ZV8zODkpIHtcbiAgICBsZXQgc3R4XzM5MCA9IHRoaXNbc3ltV3JhcF8zNzhdO1xuICAgIGlmIChzdHhfMzkwIGluc3RhbmNlb2YgU3ludGF4KSB7XG4gICAgICByZXR1cm4gc3R4XzM5MC5tYXRjaCh0eXBlXzM4OCwgdmFsdWVfMzg5KTtcbiAgICB9XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzM5MSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiLCB2YWx1ZV8zOTEpO1xuICB9XG4gIGlzQXNzaWduKHZhbHVlXzM5Mikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlXzM5Mik7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh2YWx1ZV8zOTMpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWVfMzkzKTtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfMzk0KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJrZXl3b3JkXCIsIHZhbHVlXzM5NCk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZV8zOTUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bGxcIiwgdmFsdWVfMzk1KTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHZhbHVlXzM5Nikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlXzM5Nik7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHZhbHVlXzM5Nykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicHVuY3R1YXRvclwiLCB2YWx1ZV8zOTcpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV8zOTgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN0cmluZ1wiLCB2YWx1ZV8zOTgpO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odmFsdWVfMzk5KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV8zOTkpO1xuICB9XG4gIGlzVGVtcGxhdGUodmFsdWVfNDAwKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiLCB2YWx1ZV80MDApO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzQwMSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIsIHZhbHVlXzQwMSk7XG4gIH1cbiAgaXNQYXJlbnModmFsdWVfNDAyKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWVfNDAyKTtcbiAgfVxuICBpc0JyYWNlcyh2YWx1ZV80MDMpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNlc1wiLCB2YWx1ZV80MDMpO1xuICB9XG4gIGlzQnJhY2tldHModmFsdWVfNDA0KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFja2V0c1wiLCB2YWx1ZV80MDQpO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUodmFsdWVfNDA1KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZV80MDUpO1xuICB9XG4gIGlzRU9GKHZhbHVlXzQwNikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZW9mXCIsIHZhbHVlXzQwNik7XG4gIH1cbiAgbGluZU51bWJlcigpIHtcbiAgICByZXR1cm4gZ2V0TGluZU51bWJlcl8zODAodGhpc1tzeW1XcmFwXzM3OF0pO1xuICB9XG4gIHZhbCgpIHtcbiAgICByZXR1cm4gZ2V0VmFsXzM4MSh0aGlzW3N5bVdyYXBfMzc4XSk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgbGV0IHN0eF80MDcgPSB0aGlzW3N5bVdyYXBfMzc4XTtcbiAgICBpZiAoIXN0eF80MDcubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBvbmx5IGdldCBpbm5lciBzeW50YXggb24gYSBkZWxpbWl0ZXJcIik7XG4gICAgfVxuICAgIGxldCBlbmZfNDA4ID0gbmV3IEVuZm9yZXN0ZXIoc3R4XzQwNy5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgcmV0dXJuIG5ldyBNYWNyb0NvbnRleHQoZW5mXzQwOCwgXCJpbm5lclwiLCB0aGlzLmNvbnRleHQpO1xuICB9XG59XG5mdW5jdGlvbiB1bndyYXBfMzgzKHhfNDA5KSB7XG4gIGlmICh4XzQwOSBpbnN0YW5jZW9mIFN5bnRheE9yVGVybVdyYXBwZXJfMzgyKSB7XG4gICAgcmV0dXJuIHhfNDA5W3N5bVdyYXBfMzc4XTtcbiAgfVxuICByZXR1cm4geF80MDk7XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWNyb0NvbnRleHQge1xuICBjb25zdHJ1Y3RvcihlbmZfNDEwLCBuYW1lXzQxMSwgY29udGV4dF80MTIsIHVzZVNjb3BlXzQxMywgaW50cm9kdWNlZFNjb3BlXzQxNCkge1xuICAgIGNvbnN0IHByaXZfNDE1ID0ge2JhY2t1cDogZW5mXzQxMCwgbmFtZTogbmFtZV80MTEsIGNvbnRleHQ6IGNvbnRleHRfNDEyfTtcbiAgICBpZiAodXNlU2NvcGVfNDEzICYmIGludHJvZHVjZWRTY29wZV80MTQpIHtcbiAgICAgIHByaXZfNDE1Lm5vU2NvcGVzID0gZmFsc2U7XG4gICAgICBwcml2XzQxNS51c2VTY29wZSA9IHVzZVNjb3BlXzQxMztcbiAgICAgIHByaXZfNDE1LmludHJvZHVjZWRTY29wZSA9IGludHJvZHVjZWRTY29wZV80MTQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByaXZfNDE1Lm5vU2NvcGVzID0gdHJ1ZTtcbiAgICB9XG4gICAgcHJpdmF0ZURhdGFfMzc5LnNldCh0aGlzLCBwcml2XzQxNSk7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXNbU3ltYm9sLml0ZXJhdG9yXSA9ICgpID0+IHRoaXM7XG4gIH1cbiAgbmFtZSgpIHtcbiAgICBjb25zdCB7bmFtZSwgY29udGV4dH0gPSBwcml2YXRlRGF0YV8zNzkuZ2V0KHRoaXMpO1xuICAgIHJldHVybiBuZXcgU3ludGF4T3JUZXJtV3JhcHBlcl8zODIobmFtZSwgY29udGV4dCk7XG4gIH1cbiAgZXhwYW5kKHR5cGVfNDE2KSB7XG4gICAgY29uc3Qge2VuZiwgY29udGV4dH0gPSBwcml2YXRlRGF0YV8zNzkuZ2V0KHRoaXMpO1xuICAgIGlmIChlbmYucmVzdC5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4ge2RvbmU6IHRydWUsIHZhbHVlOiBudWxsfTtcbiAgICB9XG4gICAgZW5mLmV4cGFuZE1hY3JvKCk7XG4gICAgbGV0IG9yaWdpbmFsUmVzdF80MTcgPSBlbmYucmVzdDtcbiAgICBsZXQgdmFsdWVfNDE4O1xuICAgIHN3aXRjaCAodHlwZV80MTYpIHtcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcImV4cHJcIjpcbiAgICAgICAgdmFsdWVfNDE4ID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV80MTggPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcInN0bXRcIjpcbiAgICAgICAgdmFsdWVfNDE4ID0gZW5mLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkJsb2NrU3RhdGVtZW50XCI6XG4gICAgICBjYXNlIFwiV2hpbGVTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJJZlN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIkZvclN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIlN3aXRjaFN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIkJyZWFrU3RhdGVtZW50XCI6XG4gICAgICBjYXNlIFwiQ29udGludWVTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJEZWJ1Z2dlclN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIldpdGhTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJUcnlTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJUaHJvd1N0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIkNsYXNzRGVjbGFyYXRpb25cIjpcbiAgICAgIGNhc2UgXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCI6XG4gICAgICBjYXNlIFwiTGFiZWxlZFN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJSZXR1cm5TdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJFeHByZXNzaW9uU3RhdGVtZW50XCI6XG4gICAgICAgIHZhbHVlXzQxOCA9IGVuZi5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgICAgICBleHBlY3QoXy53aGVyZUVxKHt0eXBlOiB0eXBlXzQxNn0sIHZhbHVlXzQxOCksIGBFeHBlY3RpbmcgYSAke3R5cGVfNDE2fWAsIHZhbHVlXzQxOCwgb3JpZ2luYWxSZXN0XzQxNyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIllpZWxkRXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV80MTggPSBlbmYuZW5mb3Jlc3RZaWVsZEV4cHJlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQ2xhc3NFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzQxOCA9IGVuZi5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IHRydWV9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzQxOCA9IGVuZi5lbmZvcmVzdEFycm93RXhwcmVzc2lvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJOZXdFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzQxOCA9IGVuZi5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiVGhpc0V4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJGdW5jdGlvbkV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxOdW1lcmljRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxJbmZpbml0eUV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIlRlbXBsYXRlRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxCb29sZWFuRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxOdWxsRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxSZWdFeHBFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiT2JqZWN0RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkFycmF5RXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV80MTggPSBlbmYuZW5mb3Jlc3RQcmltYXJ5RXhwcmVzc2lvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJVbmFyeUV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJVcGRhdGVFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiQmluYXJ5RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIjpcbiAgICAgICAgdmFsdWVfNDE4ID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgZXhwZWN0KF8ud2hlcmVFcSh7dHlwZTogdHlwZV80MTZ9LCB2YWx1ZV80MTgpLCBgRXhwZWN0aW5nIGEgJHt0eXBlXzQxNn1gLCB2YWx1ZV80MTgsIG9yaWdpbmFsUmVzdF80MTcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGVybSB0eXBlOiBcIiArIHR5cGVfNDE2KTtcbiAgICB9XG4gICAgcmV0dXJuIHtkb25lOiBmYWxzZSwgdmFsdWU6IG5ldyBTeW50YXhPclRlcm1XcmFwcGVyXzM4Mih2YWx1ZV80MTgsIGNvbnRleHQpfTtcbiAgfVxuICBfcmVzdChlbmZfNDE5KSB7XG4gICAgY29uc3QgcHJpdl80MjAgPSBwcml2YXRlRGF0YV8zNzkuZ2V0KHRoaXMpO1xuICAgIGlmIChwcml2XzQyMC5iYWNrdXAgPT09IGVuZl80MTkpIHtcbiAgICAgIHJldHVybiBwcml2XzQyMC5lbmYucmVzdDtcbiAgICB9XG4gICAgdGhyb3cgRXJyb3IoXCJVbmF1dGhvcml6ZWQgYWNjZXNzIVwiKTtcbiAgfVxuICByZXNldCgpIHtcbiAgICBjb25zdCBwcml2XzQyMSA9IHByaXZhdGVEYXRhXzM3OS5nZXQodGhpcyk7XG4gICAgY29uc3Qge3Jlc3QsIHByZXYsIGNvbnRleHR9ID0gcHJpdl80MjEuYmFja3VwO1xuICAgIHByaXZfNDIxLmVuZiA9IG5ldyBFbmZvcmVzdGVyKHJlc3QsIHByZXYsIGNvbnRleHQpO1xuICB9XG4gIG5leHQoKSB7XG4gICAgY29uc3Qge2VuZiwgbm9TY29wZXMsIHVzZVNjb3BlLCBpbnRyb2R1Y2VkU2NvcGUsIGNvbnRleHR9ID0gcHJpdmF0ZURhdGFfMzc5LmdldCh0aGlzKTtcbiAgICBpZiAoZW5mLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtkb25lOiB0cnVlLCB2YWx1ZTogbnVsbH07XG4gICAgfVxuICAgIGxldCB2YWx1ZV80MjIgPSBlbmYuYWR2YW5jZSgpO1xuICAgIGlmICghbm9TY29wZXMpIHtcbiAgICAgIHZhbHVlXzQyMiA9IHZhbHVlXzQyMi5hZGRTY29wZSh1c2VTY29wZSwgY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykuYWRkU2NvcGUoaW50cm9kdWNlZFNjb3BlLCBjb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTLCB7ZmxpcDogdHJ1ZX0pO1xuICAgIH1cbiAgICByZXR1cm4ge2RvbmU6IGZhbHNlLCB2YWx1ZTogbmV3IFN5bnRheE9yVGVybVdyYXBwZXJfMzgyKHZhbHVlXzQyMiwgY29udGV4dCl9O1xuICB9XG59XG5leHBvcnQge1N5bnRheE9yVGVybVdyYXBwZXJfMzgyIGFzIFN5bnRheE9yVGVybVdyYXBwZXJ9O1xuZXhwb3J0IHt1bndyYXBfMzgzIGFzIHVud3JhcH0iXX0=