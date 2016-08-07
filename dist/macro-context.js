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

const Just_399 = _ramdaFantasy.Maybe.Just;
const Nothing_400 = _ramdaFantasy.Maybe.Nothing;
const symWrap_401 = Symbol("wrapper");
const privateData_402 = new WeakMap();
const getVal_403 = t_406 => {
  if (t_406.match("delimiter")) {
    return null;
  }
  if (typeof t_406.val === "function") {
    return t_406.val();
  }
  return null;
};
class SyntaxOrTermWrapper_404 {
  constructor(s_407) {
    let context_408 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this[symWrap_401] = s_407;
    this.context = context_408;
  }
  from(type_409, value_410) {
    let stx_411 = this[symWrap_401];
    if (typeof stx_411.from === "function") {
      return stx_411.from(type_409, value_410);
    }
  }
  fromNull() {
    return this.from("null", null);
  }
  fromNumber(value_412) {
    return this.from("number", value_412);
  }
  fromString(value_413) {
    return this.from("string", value_413);
  }
  fromPunctuator(value_414) {
    return this.from("punctuator", value_414);
  }
  fromKeyword(value_415) {
    return this.from("keyword");
  }
  fromIdentifier(value_416) {
    return this.from("identifier", value_416);
  }
  fromRegularExpression(value_417) {
    return this.from("regularExpression", value_417);
  }
  fromBraces(inner_418) {
    return this.from("braces", inner_418);
  }
  fromBrackets(inner_419) {
    return this.from("brackets", inner_419);
  }
  fromParens(inner_420) {
    return this.from("parens", inner_420);
  }
  match(type_421, value_422) {
    let stx_423 = this[symWrap_401];
    if (typeof stx_423.match === "function") {
      return stx_423.match(type_421, value_422);
    }
  }
  isIdentifier(value_424) {
    return this.match("identifier", value_424);
  }
  isAssign(value_425) {
    return this.match("assign", value_425);
  }
  isBooleanLiteral(value_426) {
    return this.match("boolean", value_426);
  }
  isKeyword(value_427) {
    return this.match("keyword", value_427);
  }
  isNullLiteral(value_428) {
    return this.match("null", value_428);
  }
  isNumericLiteral(value_429) {
    return this.match("number", value_429);
  }
  isPunctuator(value_430) {
    return this.match("punctuator", value_430);
  }
  isStringLiteral(value_431) {
    return this.match("string", value_431);
  }
  isRegularExpression(value_432) {
    return this.match("regularExpression", value_432);
  }
  isTemplate(value_433) {
    return this.match("template", value_433);
  }
  isDelimiter(value_434) {
    return this.match("delimiter", value_434);
  }
  isParens(value_435) {
    return this.match("parens", value_435);
  }
  isBraces(value_436) {
    return this.match("braces", value_436);
  }
  isBrackets(value_437) {
    return this.match("brackets", value_437);
  }
  isSyntaxTemplate(value_438) {
    return this.match("syntaxTemplate", value_438);
  }
  isEOF(value_439) {
    return this.match("eof", value_439);
  }
  lineNumber() {
    return this[symWrap_401].lineNumber();
  }
  val() {
    return getVal_403(this[symWrap_401]);
  }
  inner() {
    let stx_440 = this[symWrap_401];
    if (!stx_440.match("delimiter")) {
      throw new Error("Can only get inner syntax on a delimiter");
    }
    let enf_441 = new _enforester.Enforester(stx_440.inner(), (0, _immutable.List)(), this.context);
    return new MacroContext(enf_441, "inner", this.context);
  }
}
function unwrap_405(x_442) {
  if (x_442 instanceof SyntaxOrTermWrapper_404) {
    return x_442[symWrap_401];
  }
  return x_442;
}
class MacroContext {
  constructor(enf_443, name_444, context_445, useScope_446, introducedScope_447) {
    const priv_448 = { backup: enf_443, name: name_444, context: context_445 };
    if (useScope_446 && introducedScope_447) {
      priv_448.noScopes = false;
      priv_448.useScope = useScope_446;
      priv_448.introducedScope = introducedScope_447;
    } else {
      priv_448.noScopes = true;
    }
    privateData_402.set(this, priv_448);
    this.reset();
    this[Symbol.iterator] = () => this;
  }
  name() {
    var _privateData_402$get = privateData_402.get(this);

    const name = _privateData_402$get.name;
    const context = _privateData_402$get.context;

    return new SyntaxOrTermWrapper_404(name, context);
  }
  expand(type_449) {
    var _privateData_402$get2 = privateData_402.get(this);

    const enf = _privateData_402$get2.enf;
    const context = _privateData_402$get2.context;

    if (enf.rest.size === 0) {
      return { done: true, value: null };
    }
    enf.expandMacro();
    let originalRest_450 = enf.rest;
    let value_451;
    switch (type_449) {
      case "AssignmentExpression":
      case "expr":
        value_451 = enf.enforestExpressionLoop();
        break;
      case "Expression":
        value_451 = enf.enforestExpression();
        break;
      case "Statement":
      case "stmt":
        value_451 = enf.enforestStatement();
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
        value_451 = enf.enforestStatement();
        (0, _errors.expect)(_.whereEq({ type: type_449 }, value_451), `Expecting a ${ type_449 }`, value_451, originalRest_450);
        break;
      case "YieldExpression":
        value_451 = enf.enforestYieldExpression();
        break;
      case "ClassExpression":
        value_451 = enf.enforestClass({ isExpr: true });
        break;
      case "ArrowExpression":
        value_451 = enf.enforestArrowExpression();
        break;
      case "NewExpression":
        value_451 = enf.enforestNewExpression();
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
        value_451 = enf.enforestPrimaryExpression();
        break;
      case "UnaryExpression":
      case "UpdateExpression":
      case "BinaryExpression":
      case "StaticMemberExpression":
      case "ComputedMemberExpression":
      case "AssignmentExpression":
      case "CompoundAssignmentExpression":
      case "ConditionalExpression":
        value_451 = enf.enforestExpressionLoop();
        (0, _errors.expect)(_.whereEq({ type: type_449 }, value_451), `Expecting a ${ type_449 }`, value_451, originalRest_450);
        break;
      default:
        throw new Error("Unknown term type: " + type_449);
    }
    return { done: false, value: new SyntaxOrTermWrapper_404(value_451, context) };
  }
  _rest(enf_452) {
    const priv_453 = privateData_402.get(this);
    if (priv_453.backup === enf_452) {
      return priv_453.enf.rest;
    }
    throw Error("Unauthorized access!");
  }
  reset() {
    const priv_454 = privateData_402.get(this);
    var _priv_454$backup = priv_454.backup;
    const rest = _priv_454$backup.rest;
    const prev = _priv_454$backup.prev;
    const context = _priv_454$backup.context;

    priv_454.enf = new _enforester.Enforester(rest, prev, context);
  }
  next() {
    var _privateData_402$get3 = privateData_402.get(this);

    const enf = _privateData_402$get3.enf;
    const noScopes = _privateData_402$get3.noScopes;
    const useScope = _privateData_402$get3.useScope;
    const introducedScope = _privateData_402$get3.introducedScope;
    const context = _privateData_402$get3.context;

    if (enf.rest.size === 0) {
      return { done: true, value: null };
    }
    let value_455 = enf.advance();
    if (!noScopes) {
      value_455 = value_455.addScope(useScope, context.bindings, _syntax.ALL_PHASES).addScope(introducedScope, context.bindings, _syntax.ALL_PHASES, { flip: true });
    }
    return { done: false, value: new SyntaxOrTermWrapper_404(value_455, context) };
  }
}
exports.default = MacroContext;
exports.SyntaxOrTermWrapper = SyntaxOrTermWrapper_404;
exports.unwrap = unwrap_405;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L21hY3JvLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOztJQUFhLEM7Ozs7OztBQUNiLE1BQU0sV0FBVyxvQkFBTSxJQUF2QjtBQUNBLE1BQU0sY0FBYyxvQkFBTSxPQUExQjtBQUNBLE1BQU0sY0FBYyxPQUFPLFNBQVAsQ0FBcEI7QUFDQSxNQUFNLGtCQUFrQixJQUFJLE9BQUosRUFBeEI7QUFDQSxNQUFNLGFBQWEsU0FBUztBQUMxQixNQUFJLE1BQU0sS0FBTixDQUFZLFdBQVosQ0FBSixFQUE4QjtBQUM1QixXQUFPLElBQVA7QUFDRDtBQUNELE1BQUksT0FBTyxNQUFNLEdBQWIsS0FBcUIsVUFBekIsRUFBcUM7QUFDbkMsV0FBTyxNQUFNLEdBQU4sRUFBUDtBQUNEO0FBQ0QsU0FBTyxJQUFQO0FBQ0QsQ0FSRDtBQVNBLE1BQU0sdUJBQU4sQ0FBOEI7QUFDNUIsY0FBWSxLQUFaLEVBQXFDO0FBQUEsUUFBbEIsV0FBa0IseURBQUosRUFBSTs7QUFDbkMsU0FBSyxXQUFMLElBQW9CLEtBQXBCO0FBQ0EsU0FBSyxPQUFMLEdBQWUsV0FBZjtBQUNEO0FBQ0QsT0FBSyxRQUFMLEVBQWUsU0FBZixFQUEwQjtBQUN4QixRQUFJLFVBQVUsS0FBSyxXQUFMLENBQWQ7QUFDQSxRQUFJLE9BQU8sUUFBUSxJQUFmLEtBQXdCLFVBQTVCLEVBQXdDO0FBQ3RDLGFBQU8sUUFBUSxJQUFSLENBQWEsUUFBYixFQUF1QixTQUF2QixDQUFQO0FBQ0Q7QUFDRjtBQUNELGFBQVc7QUFDVCxXQUFPLEtBQUssSUFBTCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FBUDtBQUNEO0FBQ0QsYUFBVyxTQUFYLEVBQXNCO0FBQ3BCLFdBQU8sS0FBSyxJQUFMLENBQVUsUUFBVixFQUFvQixTQUFwQixDQUFQO0FBQ0Q7QUFDRCxhQUFXLFNBQVgsRUFBc0I7QUFDcEIsV0FBTyxLQUFLLElBQUwsQ0FBVSxRQUFWLEVBQW9CLFNBQXBCLENBQVA7QUFDRDtBQUNELGlCQUFlLFNBQWYsRUFBMEI7QUFDeEIsV0FBTyxLQUFLLElBQUwsQ0FBVSxZQUFWLEVBQXdCLFNBQXhCLENBQVA7QUFDRDtBQUNELGNBQVksU0FBWixFQUF1QjtBQUNyQixXQUFPLEtBQUssSUFBTCxDQUFVLFNBQVYsQ0FBUDtBQUNEO0FBQ0QsaUJBQWUsU0FBZixFQUEwQjtBQUN4QixXQUFPLEtBQUssSUFBTCxDQUFVLFlBQVYsRUFBd0IsU0FBeEIsQ0FBUDtBQUNEO0FBQ0Qsd0JBQXNCLFNBQXRCLEVBQWlDO0FBQy9CLFdBQU8sS0FBSyxJQUFMLENBQVUsbUJBQVYsRUFBK0IsU0FBL0IsQ0FBUDtBQUNEO0FBQ0QsYUFBVyxTQUFYLEVBQXNCO0FBQ3BCLFdBQU8sS0FBSyxJQUFMLENBQVUsUUFBVixFQUFvQixTQUFwQixDQUFQO0FBQ0Q7QUFDRCxlQUFhLFNBQWIsRUFBd0I7QUFDdEIsV0FBTyxLQUFLLElBQUwsQ0FBVSxVQUFWLEVBQXNCLFNBQXRCLENBQVA7QUFDRDtBQUNELGFBQVcsU0FBWCxFQUFzQjtBQUNwQixXQUFPLEtBQUssSUFBTCxDQUFVLFFBQVYsRUFBb0IsU0FBcEIsQ0FBUDtBQUNEO0FBQ0QsUUFBTSxRQUFOLEVBQWdCLFNBQWhCLEVBQTJCO0FBQ3pCLFFBQUksVUFBVSxLQUFLLFdBQUwsQ0FBZDtBQUNBLFFBQUksT0FBTyxRQUFRLEtBQWYsS0FBeUIsVUFBN0IsRUFBeUM7QUFDdkMsYUFBTyxRQUFRLEtBQVIsQ0FBYyxRQUFkLEVBQXdCLFNBQXhCLENBQVA7QUFDRDtBQUNGO0FBQ0QsZUFBYSxTQUFiLEVBQXdCO0FBQ3RCLFdBQU8sS0FBSyxLQUFMLENBQVcsWUFBWCxFQUF5QixTQUF6QixDQUFQO0FBQ0Q7QUFDRCxXQUFTLFNBQVQsRUFBb0I7QUFDbEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLFNBQXJCLENBQVA7QUFDRDtBQUNELG1CQUFpQixTQUFqQixFQUE0QjtBQUMxQixXQUFPLEtBQUssS0FBTCxDQUFXLFNBQVgsRUFBc0IsU0FBdEIsQ0FBUDtBQUNEO0FBQ0QsWUFBVSxTQUFWLEVBQXFCO0FBQ25CLFdBQU8sS0FBSyxLQUFMLENBQVcsU0FBWCxFQUFzQixTQUF0QixDQUFQO0FBQ0Q7QUFDRCxnQkFBYyxTQUFkLEVBQXlCO0FBQ3ZCLFdBQU8sS0FBSyxLQUFMLENBQVcsTUFBWCxFQUFtQixTQUFuQixDQUFQO0FBQ0Q7QUFDRCxtQkFBaUIsU0FBakIsRUFBNEI7QUFDMUIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLFNBQXJCLENBQVA7QUFDRDtBQUNELGVBQWEsU0FBYixFQUF3QjtBQUN0QixXQUFPLEtBQUssS0FBTCxDQUFXLFlBQVgsRUFBeUIsU0FBekIsQ0FBUDtBQUNEO0FBQ0Qsa0JBQWdCLFNBQWhCLEVBQTJCO0FBQ3pCLFdBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxFQUFxQixTQUFyQixDQUFQO0FBQ0Q7QUFDRCxzQkFBb0IsU0FBcEIsRUFBK0I7QUFDN0IsV0FBTyxLQUFLLEtBQUwsQ0FBVyxtQkFBWCxFQUFnQyxTQUFoQyxDQUFQO0FBQ0Q7QUFDRCxhQUFXLFNBQVgsRUFBc0I7QUFDcEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxVQUFYLEVBQXVCLFNBQXZCLENBQVA7QUFDRDtBQUNELGNBQVksU0FBWixFQUF1QjtBQUNyQixXQUFPLEtBQUssS0FBTCxDQUFXLFdBQVgsRUFBd0IsU0FBeEIsQ0FBUDtBQUNEO0FBQ0QsV0FBUyxTQUFULEVBQW9CO0FBQ2xCLFdBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxFQUFxQixTQUFyQixDQUFQO0FBQ0Q7QUFDRCxXQUFTLFNBQVQsRUFBb0I7QUFDbEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLFNBQXJCLENBQVA7QUFDRDtBQUNELGFBQVcsU0FBWCxFQUFzQjtBQUNwQixXQUFPLEtBQUssS0FBTCxDQUFXLFVBQVgsRUFBdUIsU0FBdkIsQ0FBUDtBQUNEO0FBQ0QsbUJBQWlCLFNBQWpCLEVBQTRCO0FBQzFCLFdBQU8sS0FBSyxLQUFMLENBQVcsZ0JBQVgsRUFBNkIsU0FBN0IsQ0FBUDtBQUNEO0FBQ0QsUUFBTSxTQUFOLEVBQWlCO0FBQ2YsV0FBTyxLQUFLLEtBQUwsQ0FBVyxLQUFYLEVBQWtCLFNBQWxCLENBQVA7QUFDRDtBQUNELGVBQWE7QUFDWCxXQUFPLEtBQUssV0FBTCxFQUFrQixVQUFsQixFQUFQO0FBQ0Q7QUFDRCxRQUFNO0FBQ0osV0FBTyxXQUFXLEtBQUssV0FBTCxDQUFYLENBQVA7QUFDRDtBQUNELFVBQVE7QUFDTixRQUFJLFVBQVUsS0FBSyxXQUFMLENBQWQ7QUFDQSxRQUFJLENBQUMsUUFBUSxLQUFSLENBQWMsV0FBZCxDQUFMLEVBQWlDO0FBQy9CLFlBQU0sSUFBSSxLQUFKLENBQVUsMENBQVYsQ0FBTjtBQUNEO0FBQ0QsUUFBSSxVQUFVLDJCQUFlLFFBQVEsS0FBUixFQUFmLEVBQWdDLHNCQUFoQyxFQUF3QyxLQUFLLE9BQTdDLENBQWQ7QUFDQSxXQUFPLElBQUksWUFBSixDQUFpQixPQUFqQixFQUEwQixPQUExQixFQUFtQyxLQUFLLE9BQXhDLENBQVA7QUFDRDtBQTVHMkI7QUE4RzlCLFNBQVMsVUFBVCxDQUFvQixLQUFwQixFQUEyQjtBQUN6QixNQUFJLGlCQUFpQix1QkFBckIsRUFBOEM7QUFDNUMsV0FBTyxNQUFNLFdBQU4sQ0FBUDtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0Q7QUFDYyxNQUFNLFlBQU4sQ0FBbUI7QUFDaEMsY0FBWSxPQUFaLEVBQXFCLFFBQXJCLEVBQStCLFdBQS9CLEVBQTRDLFlBQTVDLEVBQTBELG1CQUExRCxFQUErRTtBQUM3RSxVQUFNLFdBQVcsRUFBQyxRQUFRLE9BQVQsRUFBa0IsTUFBTSxRQUF4QixFQUFrQyxTQUFTLFdBQTNDLEVBQWpCO0FBQ0EsUUFBSSxnQkFBZ0IsbUJBQXBCLEVBQXlDO0FBQ3ZDLGVBQVMsUUFBVCxHQUFvQixLQUFwQjtBQUNBLGVBQVMsUUFBVCxHQUFvQixZQUFwQjtBQUNBLGVBQVMsZUFBVCxHQUEyQixtQkFBM0I7QUFDRCxLQUpELE1BSU87QUFDTCxlQUFTLFFBQVQsR0FBb0IsSUFBcEI7QUFDRDtBQUNELG9CQUFnQixHQUFoQixDQUFvQixJQUFwQixFQUEwQixRQUExQjtBQUNBLFNBQUssS0FBTDtBQUNBLFNBQUssT0FBTyxRQUFaLElBQXdCLE1BQU0sSUFBOUI7QUFDRDtBQUNELFNBQU87QUFBQSwrQkFDbUIsZ0JBQWdCLEdBQWhCLENBQW9CLElBQXBCLENBRG5COztBQUFBLFVBQ0UsSUFERix3QkFDRSxJQURGO0FBQUEsVUFDUSxPQURSLHdCQUNRLE9BRFI7O0FBRUwsV0FBTyxJQUFJLHVCQUFKLENBQTRCLElBQTVCLEVBQWtDLE9BQWxDLENBQVA7QUFDRDtBQUNELFNBQU8sUUFBUCxFQUFpQjtBQUFBLGdDQUNRLGdCQUFnQixHQUFoQixDQUFvQixJQUFwQixDQURSOztBQUFBLFVBQ1IsR0FEUSx5QkFDUixHQURRO0FBQUEsVUFDSCxPQURHLHlCQUNILE9BREc7O0FBRWYsUUFBSSxJQUFJLElBQUosQ0FBUyxJQUFULEtBQWtCLENBQXRCLEVBQXlCO0FBQ3ZCLGFBQU8sRUFBQyxNQUFNLElBQVAsRUFBYSxPQUFPLElBQXBCLEVBQVA7QUFDRDtBQUNELFFBQUksV0FBSjtBQUNBLFFBQUksbUJBQW1CLElBQUksSUFBM0I7QUFDQSxRQUFJLFNBQUo7QUFDQSxZQUFRLFFBQVI7QUFDRSxXQUFLLHNCQUFMO0FBQ0EsV0FBSyxNQUFMO0FBQ0Usb0JBQVksSUFBSSxzQkFBSixFQUFaO0FBQ0E7QUFDRixXQUFLLFlBQUw7QUFDRSxvQkFBWSxJQUFJLGtCQUFKLEVBQVo7QUFDQTtBQUNGLFdBQUssV0FBTDtBQUNBLFdBQUssTUFBTDtBQUNFLG9CQUFZLElBQUksaUJBQUosRUFBWjtBQUNBO0FBQ0YsV0FBSyxnQkFBTDtBQUNBLFdBQUssZ0JBQUw7QUFDQSxXQUFLLGFBQUw7QUFDQSxXQUFLLGNBQUw7QUFDQSxXQUFLLGlCQUFMO0FBQ0EsV0FBSyxnQkFBTDtBQUNBLFdBQUssbUJBQUw7QUFDQSxXQUFLLG1CQUFMO0FBQ0EsV0FBSyxlQUFMO0FBQ0EsV0FBSyxjQUFMO0FBQ0EsV0FBSyxnQkFBTDtBQUNBLFdBQUssa0JBQUw7QUFDQSxXQUFLLHFCQUFMO0FBQ0EsV0FBSyxrQkFBTDtBQUNBLFdBQUssOEJBQUw7QUFDQSxXQUFLLGlCQUFMO0FBQ0EsV0FBSyxxQkFBTDtBQUNFLG9CQUFZLElBQUksaUJBQUosRUFBWjtBQUNBLDRCQUFPLEVBQUUsT0FBRixDQUFVLEVBQUMsTUFBTSxRQUFQLEVBQVYsRUFBNEIsU0FBNUIsQ0FBUCxFQUFnRCxnQkFBYyxRQUFTLEdBQXZFLEVBQTBFLFNBQTFFLEVBQXFGLGdCQUFyRjtBQUNBO0FBQ0YsV0FBSyxpQkFBTDtBQUNFLG9CQUFZLElBQUksdUJBQUosRUFBWjtBQUNBO0FBQ0YsV0FBSyxpQkFBTDtBQUNFLG9CQUFZLElBQUksYUFBSixDQUFrQixFQUFDLFFBQVEsSUFBVCxFQUFsQixDQUFaO0FBQ0E7QUFDRixXQUFLLGlCQUFMO0FBQ0Usb0JBQVksSUFBSSx1QkFBSixFQUFaO0FBQ0E7QUFDRixXQUFLLGVBQUw7QUFDRSxvQkFBWSxJQUFJLHFCQUFKLEVBQVo7QUFDQTtBQUNGLFdBQUssZ0JBQUw7QUFDQSxXQUFLLG9CQUFMO0FBQ0EsV0FBSyxzQkFBTDtBQUNBLFdBQUssMEJBQUw7QUFDQSxXQUFLLDJCQUFMO0FBQ0EsV0FBSyx5QkFBTDtBQUNBLFdBQUssb0JBQUw7QUFDQSxXQUFLLDBCQUFMO0FBQ0EsV0FBSyx1QkFBTDtBQUNBLFdBQUsseUJBQUw7QUFDQSxXQUFLLGtCQUFMO0FBQ0EsV0FBSyxpQkFBTDtBQUNFLG9CQUFZLElBQUkseUJBQUosRUFBWjtBQUNBO0FBQ0YsV0FBSyxpQkFBTDtBQUNBLFdBQUssa0JBQUw7QUFDQSxXQUFLLGtCQUFMO0FBQ0EsV0FBSyx3QkFBTDtBQUNBLFdBQUssMEJBQUw7QUFDQSxXQUFLLHNCQUFMO0FBQ0EsV0FBSyw4QkFBTDtBQUNBLFdBQUssdUJBQUw7QUFDRSxvQkFBWSxJQUFJLHNCQUFKLEVBQVo7QUFDQSw0QkFBTyxFQUFFLE9BQUYsQ0FBVSxFQUFDLE1BQU0sUUFBUCxFQUFWLEVBQTRCLFNBQTVCLENBQVAsRUFBZ0QsZ0JBQWMsUUFBUyxHQUF2RSxFQUEwRSxTQUExRSxFQUFxRixnQkFBckY7QUFDQTtBQUNGO0FBQ0UsY0FBTSxJQUFJLEtBQUosQ0FBVSx3QkFBd0IsUUFBbEMsQ0FBTjtBQXRFSjtBQXdFQSxXQUFPLEVBQUMsTUFBTSxLQUFQLEVBQWMsT0FBTyxJQUFJLHVCQUFKLENBQTRCLFNBQTVCLEVBQXVDLE9BQXZDLENBQXJCLEVBQVA7QUFDRDtBQUNELFFBQU0sT0FBTixFQUFlO0FBQ2IsVUFBTSxXQUFXLGdCQUFnQixHQUFoQixDQUFvQixJQUFwQixDQUFqQjtBQUNBLFFBQUksU0FBUyxNQUFULEtBQW9CLE9BQXhCLEVBQWlDO0FBQy9CLGFBQU8sU0FBUyxHQUFULENBQWEsSUFBcEI7QUFDRDtBQUNELFVBQU0sTUFBTSxzQkFBTixDQUFOO0FBQ0Q7QUFDRCxVQUFRO0FBQ04sVUFBTSxXQUFXLGdCQUFnQixHQUFoQixDQUFvQixJQUFwQixDQUFqQjtBQURNLDJCQUV3QixTQUFTLE1BRmpDO0FBQUEsVUFFQyxJQUZELG9CQUVDLElBRkQ7QUFBQSxVQUVPLElBRlAsb0JBRU8sSUFGUDtBQUFBLFVBRWEsT0FGYixvQkFFYSxPQUZiOztBQUdOLGFBQVMsR0FBVCxHQUFlLDJCQUFlLElBQWYsRUFBcUIsSUFBckIsRUFBMkIsT0FBM0IsQ0FBZjtBQUNEO0FBQ0QsU0FBTztBQUFBLGdDQUN1RCxnQkFBZ0IsR0FBaEIsQ0FBb0IsSUFBcEIsQ0FEdkQ7O0FBQUEsVUFDRSxHQURGLHlCQUNFLEdBREY7QUFBQSxVQUNPLFFBRFAseUJBQ08sUUFEUDtBQUFBLFVBQ2lCLFFBRGpCLHlCQUNpQixRQURqQjtBQUFBLFVBQzJCLGVBRDNCLHlCQUMyQixlQUQzQjtBQUFBLFVBQzRDLE9BRDVDLHlCQUM0QyxPQUQ1Qzs7QUFFTCxRQUFJLElBQUksSUFBSixDQUFTLElBQVQsS0FBa0IsQ0FBdEIsRUFBeUI7QUFDdkIsYUFBTyxFQUFDLE1BQU0sSUFBUCxFQUFhLE9BQU8sSUFBcEIsRUFBUDtBQUNEO0FBQ0QsUUFBSSxZQUFZLElBQUksT0FBSixFQUFoQjtBQUNBLFFBQUksQ0FBQyxRQUFMLEVBQWU7QUFDYixrQkFBWSxVQUFVLFFBQVYsQ0FBbUIsUUFBbkIsRUFBNkIsUUFBUSxRQUFyQyxzQkFBMkQsUUFBM0QsQ0FBb0UsZUFBcEUsRUFBcUYsUUFBUSxRQUE3RixzQkFBbUgsRUFBQyxNQUFNLElBQVAsRUFBbkgsQ0FBWjtBQUNEO0FBQ0QsV0FBTyxFQUFDLE1BQU0sS0FBUCxFQUFjLE9BQU8sSUFBSSx1QkFBSixDQUE0QixTQUE1QixFQUF1QyxPQUF2QyxDQUFyQixFQUFQO0FBQ0Q7QUExSCtCO2tCQUFiLFk7UUE0SGMsbUIsR0FBM0IsdUI7UUFDYyxNLEdBQWQsVSIsImZpbGUiOiJtYWNyby1jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hcFN5bnRheFJlZHVjZXIgZnJvbSBcIi4vbWFwLXN5bnRheC1yZWR1Y2VyXCI7XG5pbXBvcnQgcmVkdWNlciBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuaW1wb3J0IHtleHBlY3R9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge0VuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCBTeW50YXgsIHtBTExfUEhBU0VTfSBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IEp1c3RfMzk5ID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfNDAwID0gTWF5YmUuTm90aGluZztcbmNvbnN0IHN5bVdyYXBfNDAxID0gU3ltYm9sKFwid3JhcHBlclwiKTtcbmNvbnN0IHByaXZhdGVEYXRhXzQwMiA9IG5ldyBXZWFrTWFwO1xuY29uc3QgZ2V0VmFsXzQwMyA9IHRfNDA2ID0+IHtcbiAgaWYgKHRfNDA2Lm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHR5cGVvZiB0XzQwNi52YWwgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiB0XzQwNi52YWwoKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5jbGFzcyBTeW50YXhPclRlcm1XcmFwcGVyXzQwNCB7XG4gIGNvbnN0cnVjdG9yKHNfNDA3LCBjb250ZXh0XzQwOCA9IHt9KSB7XG4gICAgdGhpc1tzeW1XcmFwXzQwMV0gPSBzXzQwNztcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzQwODtcbiAgfVxuICBmcm9tKHR5cGVfNDA5LCB2YWx1ZV80MTApIHtcbiAgICBsZXQgc3R4XzQxMSA9IHRoaXNbc3ltV3JhcF80MDFdO1xuICAgIGlmICh0eXBlb2Ygc3R4XzQxMS5mcm9tID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiBzdHhfNDExLmZyb20odHlwZV80MDksIHZhbHVlXzQxMCk7XG4gICAgfVxuICB9XG4gIGZyb21OdWxsKCkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJudWxsXCIsIG51bGwpO1xuICB9XG4gIGZyb21OdW1iZXIodmFsdWVfNDEyKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcIm51bWJlclwiLCB2YWx1ZV80MTIpO1xuICB9XG4gIGZyb21TdHJpbmcodmFsdWVfNDEzKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInN0cmluZ1wiLCB2YWx1ZV80MTMpO1xuICB9XG4gIGZyb21QdW5jdHVhdG9yKHZhbHVlXzQxNCkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJwdW5jdHVhdG9yXCIsIHZhbHVlXzQxNCk7XG4gIH1cbiAgZnJvbUtleXdvcmQodmFsdWVfNDE1KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcImtleXdvcmRcIik7XG4gIH1cbiAgZnJvbUlkZW50aWZpZXIodmFsdWVfNDE2KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcImlkZW50aWZpZXJcIiwgdmFsdWVfNDE2KTtcbiAgfVxuICBmcm9tUmVndWxhckV4cHJlc3Npb24odmFsdWVfNDE3KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbHVlXzQxNyk7XG4gIH1cbiAgZnJvbUJyYWNlcyhpbm5lcl80MTgpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwiYnJhY2VzXCIsIGlubmVyXzQxOCk7XG4gIH1cbiAgZnJvbUJyYWNrZXRzKGlubmVyXzQxOSkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJicmFja2V0c1wiLCBpbm5lcl80MTkpO1xuICB9XG4gIGZyb21QYXJlbnMoaW5uZXJfNDIwKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInBhcmVuc1wiLCBpbm5lcl80MjApO1xuICB9XG4gIG1hdGNoKHR5cGVfNDIxLCB2YWx1ZV80MjIpIHtcbiAgICBsZXQgc3R4XzQyMyA9IHRoaXNbc3ltV3JhcF80MDFdO1xuICAgIGlmICh0eXBlb2Ygc3R4XzQyMy5tYXRjaCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gc3R4XzQyMy5tYXRjaCh0eXBlXzQyMSwgdmFsdWVfNDIyKTtcbiAgICB9XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzQyNCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiLCB2YWx1ZV80MjQpO1xuICB9XG4gIGlzQXNzaWduKHZhbHVlXzQyNSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlXzQyNSk7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh2YWx1ZV80MjYpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWVfNDI2KTtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfNDI3KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJrZXl3b3JkXCIsIHZhbHVlXzQyNyk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZV80MjgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bGxcIiwgdmFsdWVfNDI4KTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHZhbHVlXzQyOSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlXzQyOSk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHZhbHVlXzQzMCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicHVuY3R1YXRvclwiLCB2YWx1ZV80MzApO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV80MzEpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN0cmluZ1wiLCB2YWx1ZV80MzEpO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odmFsdWVfNDMyKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV80MzIpO1xuICB9XG4gIGlzVGVtcGxhdGUodmFsdWVfNDMzKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiLCB2YWx1ZV80MzMpO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzQzNCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIsIHZhbHVlXzQzNCk7XG4gIH1cbiAgaXNQYXJlbnModmFsdWVfNDM1KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWVfNDM1KTtcbiAgfVxuICBpc0JyYWNlcyh2YWx1ZV80MzYpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNlc1wiLCB2YWx1ZV80MzYpO1xuICB9XG4gIGlzQnJhY2tldHModmFsdWVfNDM3KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFja2V0c1wiLCB2YWx1ZV80MzcpO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUodmFsdWVfNDM4KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZV80MzgpO1xuICB9XG4gIGlzRU9GKHZhbHVlXzQzOSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZW9mXCIsIHZhbHVlXzQzOSk7XG4gIH1cbiAgbGluZU51bWJlcigpIHtcbiAgICByZXR1cm4gdGhpc1tzeW1XcmFwXzQwMV0ubGluZU51bWJlcigpO1xuICB9XG4gIHZhbCgpIHtcbiAgICByZXR1cm4gZ2V0VmFsXzQwMyh0aGlzW3N5bVdyYXBfNDAxXSk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgbGV0IHN0eF80NDAgPSB0aGlzW3N5bVdyYXBfNDAxXTtcbiAgICBpZiAoIXN0eF80NDAubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBvbmx5IGdldCBpbm5lciBzeW50YXggb24gYSBkZWxpbWl0ZXJcIik7XG4gICAgfVxuICAgIGxldCBlbmZfNDQxID0gbmV3IEVuZm9yZXN0ZXIoc3R4XzQ0MC5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgcmV0dXJuIG5ldyBNYWNyb0NvbnRleHQoZW5mXzQ0MSwgXCJpbm5lclwiLCB0aGlzLmNvbnRleHQpO1xuICB9XG59XG5mdW5jdGlvbiB1bndyYXBfNDA1KHhfNDQyKSB7XG4gIGlmICh4XzQ0MiBpbnN0YW5jZW9mIFN5bnRheE9yVGVybVdyYXBwZXJfNDA0KSB7XG4gICAgcmV0dXJuIHhfNDQyW3N5bVdyYXBfNDAxXTtcbiAgfVxuICByZXR1cm4geF80NDI7XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWNyb0NvbnRleHQge1xuICBjb25zdHJ1Y3RvcihlbmZfNDQzLCBuYW1lXzQ0NCwgY29udGV4dF80NDUsIHVzZVNjb3BlXzQ0NiwgaW50cm9kdWNlZFNjb3BlXzQ0Nykge1xuICAgIGNvbnN0IHByaXZfNDQ4ID0ge2JhY2t1cDogZW5mXzQ0MywgbmFtZTogbmFtZV80NDQsIGNvbnRleHQ6IGNvbnRleHRfNDQ1fTtcbiAgICBpZiAodXNlU2NvcGVfNDQ2ICYmIGludHJvZHVjZWRTY29wZV80NDcpIHtcbiAgICAgIHByaXZfNDQ4Lm5vU2NvcGVzID0gZmFsc2U7XG4gICAgICBwcml2XzQ0OC51c2VTY29wZSA9IHVzZVNjb3BlXzQ0NjtcbiAgICAgIHByaXZfNDQ4LmludHJvZHVjZWRTY29wZSA9IGludHJvZHVjZWRTY29wZV80NDc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByaXZfNDQ4Lm5vU2NvcGVzID0gdHJ1ZTtcbiAgICB9XG4gICAgcHJpdmF0ZURhdGFfNDAyLnNldCh0aGlzLCBwcml2XzQ0OCk7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXNbU3ltYm9sLml0ZXJhdG9yXSA9ICgpID0+IHRoaXM7XG4gIH1cbiAgbmFtZSgpIHtcbiAgICBjb25zdCB7bmFtZSwgY29udGV4dH0gPSBwcml2YXRlRGF0YV80MDIuZ2V0KHRoaXMpO1xuICAgIHJldHVybiBuZXcgU3ludGF4T3JUZXJtV3JhcHBlcl80MDQobmFtZSwgY29udGV4dCk7XG4gIH1cbiAgZXhwYW5kKHR5cGVfNDQ5KSB7XG4gICAgY29uc3Qge2VuZiwgY29udGV4dH0gPSBwcml2YXRlRGF0YV80MDIuZ2V0KHRoaXMpO1xuICAgIGlmIChlbmYucmVzdC5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4ge2RvbmU6IHRydWUsIHZhbHVlOiBudWxsfTtcbiAgICB9XG4gICAgZW5mLmV4cGFuZE1hY3JvKCk7XG4gICAgbGV0IG9yaWdpbmFsUmVzdF80NTAgPSBlbmYucmVzdDtcbiAgICBsZXQgdmFsdWVfNDUxO1xuICAgIHN3aXRjaCAodHlwZV80NDkpIHtcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcImV4cHJcIjpcbiAgICAgICAgdmFsdWVfNDUxID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV80NTEgPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcInN0bXRcIjpcbiAgICAgICAgdmFsdWVfNDUxID0gZW5mLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkJsb2NrU3RhdGVtZW50XCI6XG4gICAgICBjYXNlIFwiV2hpbGVTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJJZlN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIkZvclN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIlN3aXRjaFN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIkJyZWFrU3RhdGVtZW50XCI6XG4gICAgICBjYXNlIFwiQ29udGludWVTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJEZWJ1Z2dlclN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIldpdGhTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJUcnlTdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJUaHJvd1N0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIkNsYXNzRGVjbGFyYXRpb25cIjpcbiAgICAgIGNhc2UgXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCI6XG4gICAgICBjYXNlIFwiTGFiZWxlZFN0YXRlbWVudFwiOlxuICAgICAgY2FzZSBcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJSZXR1cm5TdGF0ZW1lbnRcIjpcbiAgICAgIGNhc2UgXCJFeHByZXNzaW9uU3RhdGVtZW50XCI6XG4gICAgICAgIHZhbHVlXzQ1MSA9IGVuZi5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgICAgICBleHBlY3QoXy53aGVyZUVxKHt0eXBlOiB0eXBlXzQ0OX0sIHZhbHVlXzQ1MSksIGBFeHBlY3RpbmcgYSAke3R5cGVfNDQ5fWAsIHZhbHVlXzQ1MSwgb3JpZ2luYWxSZXN0XzQ1MCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIllpZWxkRXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV80NTEgPSBlbmYuZW5mb3Jlc3RZaWVsZEV4cHJlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQ2xhc3NFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzQ1MSA9IGVuZi5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IHRydWV9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzQ1MSA9IGVuZi5lbmZvcmVzdEFycm93RXhwcmVzc2lvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJOZXdFeHByZXNzaW9uXCI6XG4gICAgICAgIHZhbHVlXzQ1MSA9IGVuZi5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiVGhpc0V4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJGdW5jdGlvbkV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxOdW1lcmljRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxJbmZpbml0eUV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIlRlbXBsYXRlRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxCb29sZWFuRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxOdWxsRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkxpdGVyYWxSZWdFeHBFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiT2JqZWN0RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkFycmF5RXhwcmVzc2lvblwiOlxuICAgICAgICB2YWx1ZV80NTEgPSBlbmYuZW5mb3Jlc3RQcmltYXJ5RXhwcmVzc2lvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJVbmFyeUV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJVcGRhdGVFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiQmluYXJ5RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIjpcbiAgICAgICAgdmFsdWVfNDUxID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgZXhwZWN0KF8ud2hlcmVFcSh7dHlwZTogdHlwZV80NDl9LCB2YWx1ZV80NTEpLCBgRXhwZWN0aW5nIGEgJHt0eXBlXzQ0OX1gLCB2YWx1ZV80NTEsIG9yaWdpbmFsUmVzdF80NTApO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGVybSB0eXBlOiBcIiArIHR5cGVfNDQ5KTtcbiAgICB9XG4gICAgcmV0dXJuIHtkb25lOiBmYWxzZSwgdmFsdWU6IG5ldyBTeW50YXhPclRlcm1XcmFwcGVyXzQwNCh2YWx1ZV80NTEsIGNvbnRleHQpfTtcbiAgfVxuICBfcmVzdChlbmZfNDUyKSB7XG4gICAgY29uc3QgcHJpdl80NTMgPSBwcml2YXRlRGF0YV80MDIuZ2V0KHRoaXMpO1xuICAgIGlmIChwcml2XzQ1My5iYWNrdXAgPT09IGVuZl80NTIpIHtcbiAgICAgIHJldHVybiBwcml2XzQ1My5lbmYucmVzdDtcbiAgICB9XG4gICAgdGhyb3cgRXJyb3IoXCJVbmF1dGhvcml6ZWQgYWNjZXNzIVwiKTtcbiAgfVxuICByZXNldCgpIHtcbiAgICBjb25zdCBwcml2XzQ1NCA9IHByaXZhdGVEYXRhXzQwMi5nZXQodGhpcyk7XG4gICAgY29uc3Qge3Jlc3QsIHByZXYsIGNvbnRleHR9ID0gcHJpdl80NTQuYmFja3VwO1xuICAgIHByaXZfNDU0LmVuZiA9IG5ldyBFbmZvcmVzdGVyKHJlc3QsIHByZXYsIGNvbnRleHQpO1xuICB9XG4gIG5leHQoKSB7XG4gICAgY29uc3Qge2VuZiwgbm9TY29wZXMsIHVzZVNjb3BlLCBpbnRyb2R1Y2VkU2NvcGUsIGNvbnRleHR9ID0gcHJpdmF0ZURhdGFfNDAyLmdldCh0aGlzKTtcbiAgICBpZiAoZW5mLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtkb25lOiB0cnVlLCB2YWx1ZTogbnVsbH07XG4gICAgfVxuICAgIGxldCB2YWx1ZV80NTUgPSBlbmYuYWR2YW5jZSgpO1xuICAgIGlmICghbm9TY29wZXMpIHtcbiAgICAgIHZhbHVlXzQ1NSA9IHZhbHVlXzQ1NS5hZGRTY29wZSh1c2VTY29wZSwgY29udGV4dC5iaW5kaW5ncywgQUxMX1BIQVNFUykuYWRkU2NvcGUoaW50cm9kdWNlZFNjb3BlLCBjb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTLCB7ZmxpcDogdHJ1ZX0pO1xuICAgIH1cbiAgICByZXR1cm4ge2RvbmU6IGZhbHNlLCB2YWx1ZTogbmV3IFN5bnRheE9yVGVybVdyYXBwZXJfNDA0KHZhbHVlXzQ1NSwgY29udGV4dCl9O1xuICB9XG59XG5leHBvcnQge1N5bnRheE9yVGVybVdyYXBwZXJfNDA0IGFzIFN5bnRheE9yVGVybVdyYXBwZXJ9O1xuZXhwb3J0IHt1bndyYXBfNDA1IGFzIHVud3JhcH0iXX0=