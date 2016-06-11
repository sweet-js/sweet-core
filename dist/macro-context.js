"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyntaxOrTermWrapper = undefined;
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

const Just_367 = _ramdaFantasy.Maybe.Just;
const Nothing_368 = _ramdaFantasy.Maybe.Nothing;
const symWrap_369 = Symbol("wrapper");
const symName_370 = Symbol("name");
const getLineNumber_371 = t_373 => {
  if (t_373 instanceof _syntax2.default) {
    return t_373.lineNumber();
  }
  throw new Error("Line numbers on terms not implemented yet");
};
const getVal_372 = t_374 => {
  if (t_374.match("delimiter")) {
    return null;
  }
  if (t_374 instanceof _syntax2.default) {
    return t_374.val();
  }
  return null;
};
class SyntaxOrTermWrapper {
  constructor(s_375) {
    let context_376 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this[symWrap_369] = s_375;
    this.context = context_376;
  }
  match(type_377, value_378) {
    let stx_379 = this[symWrap_369];
    if (stx_379 instanceof _syntax2.default) {
      return stx_379.match(type_377, value_378);
    }
  }
  isIdentifier(value_380) {
    return this.match("identifier", value_380);
  }
  isAssign(value_381) {
    return this.match("assign", value_381);
  }
  isBooleanLiteral(value_382) {
    return this.match("boolean", value_382);
  }
  isKeyword(value_383) {
    return this.match("keyword", value_383);
  }
  isNullLiteral(value_384) {
    return this.match("null", value_384);
  }
  isNumericLiteral(value_385) {
    return this.match("number", value_385);
  }
  isPunctuator(value_386) {
    return this.match("punctuator", value_386);
  }
  isStringLiteral(value_387) {
    return this.match("string", value_387);
  }
  isRegularExpression(value_388) {
    return this.match("regularExpression", value_388);
  }
  isTemplate(value_389) {
    return this.match("template", value_389);
  }
  isDelimiter(value_390) {
    return this.match("delimiter", value_390);
  }
  isParens(value_391) {
    return this.match("parens", value_391);
  }
  isBraces(value_392) {
    return this.match("braces", value_392);
  }
  isBrackets(value_393) {
    return this.match("brackets", value_393);
  }
  isSyntaxTemplate(value_394) {
    return this.match("syntaxTemplate", value_394);
  }
  isEOF(value_395) {
    return this.match("eof", value_395);
  }
  lineNumber() {
    return getLineNumber_371(this[symWrap_369]);
  }
  val() {
    return getVal_372(this[symWrap_369]);
  }
  inner() {
    let stx_396 = this[symWrap_369];
    if (!stx_396.match("delimiter")) {
      throw new Error("Can only get inner syntax on a delimiter");
    }
    let enf_397 = new _enforester.Enforester(stx_396.inner(), (0, _immutable.List)(), this.context);
    return new MacroContext(enf_397, "inner", this.context);
  }
}
exports.SyntaxOrTermWrapper = SyntaxOrTermWrapper;
function unwrap(x_398) {
  if (x_398 instanceof SyntaxOrTermWrapper) {
    return x_398[symWrap_369];
  }
  return x_398;
}
class MacroContext {
  constructor(enf_399, name_400, context_401, useScope_402, introducedScope_403) {
    this._enf = enf_399;
    this[symName_370] = name_400;
    this.context = context_401;
    if (useScope_402 && introducedScope_403) {
      this.noScopes = false;
      this.useScope = useScope_402;
      this.introducedScope = introducedScope_403;
    } else {
      this.noScopes = true;
    }
    this[Symbol.iterator] = () => this;
  }
  name() {
    return new SyntaxOrTermWrapper(this[symName_370], this.context);
  }
  next() {
    let type_404 = arguments.length <= 0 || arguments[0] === undefined ? "Syntax" : arguments[0];

    if (this._enf.rest.size === 0) {
      return { done: true, value: null };
    }
    let value_405;
    switch (type_404) {
      case "AssignmentExpression":
      case "expr":
        value_405 = this._enf.enforestExpressionLoop();
        break;
      case "Expression":
        value_405 = this._enf.enforestExpression();
        break;
      case "Syntax":
        value_405 = this._enf.advance();
        if (!this.noScopes) {
          value_405 = value_405.addScope(this.useScope, this.context.bindings, _syntax.ALL_PHASES).addScope(this.introducedScope, this.context.bindings, _syntax.ALL_PHASES, { flip: true });
        }
        break;
      default:
        throw new Error("Unknown term type: " + type_404);
    }
    return { done: false, value: new SyntaxOrTermWrapper(value_405, this.context) };
  }
}
exports.default = MacroContext;