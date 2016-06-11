"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ALL_PHASES = exports.Types = undefined;

var _immutable = require("immutable");

var _errors = require("./errors");

var _bindingMap = require("./binding-map");

var _bindingMap2 = _interopRequireDefault(_bindingMap);

var _ramdaFantasy = require("ramda-fantasy");

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _tokenizer = require("shift-parser/dist/tokenizer");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Just_755 = _ramdaFantasy.Maybe.Just;
const Nothing_756 = _ramdaFantasy.Maybe.Nothing;

function sizeDecending_757(a_758, b_759) {
  if (a_758.scopes.size > b_759.scopes.size) {
    return -1;
  } else if (b_759.scopes.size > a_758.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}
let Types = exports.Types = { null: { match: token_760 => !Types.delimiter.match(token_760) && token_760.type === _tokenizer.TokenType.NULL, create: (value_761, stx_762) => new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_762) }, number: { match: token_763 => !Types.delimiter.match(token_763) && token_763.type.klass === _tokenizer.TokenClass.NumericLiteral, create: (value_764, stx_765) => new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_764 }, stx_765) }, string: { match: token_766 => !Types.delimiter.match(token_766) && token_766.type.klass === _tokenizer.TokenClass.StringLiteral, create: (value_767, stx_768) => new Syntax({ type: _tokenizer.TokenType.STRING, str: value_767 }, stx_768) }, punctuator: { match: token_769 => !Types.delimiter.match(token_769) && token_769.type.klass === _tokenizer.TokenClass.Punctuator, create: (value_770, stx_771) => new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_770 }, value: value_770 }, stx_771) }, keyword: { match: token_772 => !Types.delimiter.match(token_772) && token_772.type.klass === _tokenizer.TokenClass.Keyword, create: (value_773, stx_774) => new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_773 }, value: value_773 }, stx_774) }, identifier: { match: token_775 => !Types.delimiter.match(token_775) && token_775.type.klass === _tokenizer.TokenClass.Ident, create: (value_776, stx_777) => new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_776 }, stx_777) }, regularExpression: { match: token_778 => !Types.delimiter.match(token_778) && token_778.type.klass === _tokenizer.TokenClass.RegularExpression, create: (value_779, stx_780) => new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_779 }, stx_780) }, braces: { match: token_781 => Types.delimiter.match(token_781) && token_781.get(0).token.type === _tokenizer.TokenType.LBRACE, create: (inner_782, stx_783) => {
      let left_784 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });
      let right_785 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });
      return new Syntax(_immutable.List.of(left_784).concat(inner_782).push(right_785), stx_783);
    } }, brackets: { match: token_786 => Types.delimiter.match(token_786) && token_786.get(0).token.type === _tokenizer.TokenType.LBRACK, create: (inner_787, stx_788) => {
      let left_789 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });
      let right_790 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });
      return new Syntax(_immutable.List.of(left_789).concat(inner_787).push(right_790), stx_788);
    } }, parens: { match: token_791 => Types.delimiter.match(token_791) && token_791.get(0).token.type === _tokenizer.TokenType.LPAREN, create: (inner_792, stx_793) => {
      let left_794 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });
      let right_795 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });
      return new Syntax(_immutable.List.of(left_794).concat(inner_792).push(right_795), stx_793);
    } }, assign: { match: token_796 => {
      if (Types.punctuator.match(token_796)) {
        switch (token_796.value) {
          case "=":
          case "|=":
          case "^=":
          case "&=":
          case "<<=":
          case ">>=":
          case ">>>=":
          case "+=":
          case "-=":
          case "*=":
          case "/=":
          case "%=":
            return true;
          default:
            return false;
        }
      }
      return false;
    } }, boolean: { match: token_797 => !Types.delimiter.match(token_797) && token_797.type === _tokenizer.TokenType.TRUE || token_797.type === _tokenizer.TokenType.FALSE }, template: { match: token_798 => !Types.delimiter.match(token_798) && token_798.type === _tokenizer.TokenType.TEMPLATE }, delimiter: { match: token_799 => _immutable.List.isList(token_799) }, syntaxTemplate: { match: token_800 => Types.delimiter.match(token_800) && token_800.get(0).val() === "#`" }, eof: { match: token_801 => !Types.delimiter.match(token_801) && token_801.type === _tokenizer.TokenType.EOS } };
;
const ALL_PHASES = exports.ALL_PHASES = {};
;
class Syntax {
  constructor(token_802) {
    let oldstx_803 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.token = token_802;
    this.bindings = oldstx_803.bindings != null ? oldstx_803.bindings : new _bindingMap2.default();
    this.scopesets = oldstx_803.scopesets != null ? oldstx_803.scopesets : { all: (0, _immutable.List)(), phase: (0, _immutable.Map)() };
    Object.freeze(this);
  }
  static of(token_804) {
    let stx_805 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Syntax(token_804, stx_805);
  }
  static from(type_806, value_807) {
    let stx_808 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!Types[type_806]) {
      throw new Error(type_806 + " is not a valid type");
    } else if (!Types[type_806].create) {
      throw new Error("Cannot create a syntax from type " + type_806);
    }
    return Types[type_806].create(value_807, stx_808);
  }
  static fromNull() {
    let stx_809 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return Syntax.from("null", null, stx_809);
  }
  static fromNumber(value_810) {
    let stx_811 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("number", value_810, stx_811);
  }
  static fromString(value_812) {
    let stx_813 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("string", value_812, stx_813);
  }
  static fromPunctuator(value_814) {
    let stx_815 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("punctuator", value_814, stx_815);
  }
  static fromKeyword(value_816) {
    let stx_817 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("keyword", value_816, stx_817);
  }
  static fromIdentifier(value_818) {
    let stx_819 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("identifier", value_818, stx_819);
  }
  static fromRegularExpression(value_820) {
    let stx_821 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("regularExpression", value_820, stx_821);
  }
  static fromBraces(inner_822) {
    let stx_823 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("braces", inner_822, stx_823);
  }
  static fromBrackets(inner_824) {
    let stx_825 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("brackets", inner_824, stx_825);
  }
  static fromParens(inner_826) {
    let stx_827 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("parens", inner_826, stx_827);
  }
  resolve(phase_828) {
    (0, _errors.assert)(phase_828 != null, "must provide a phase to resolve");
    let allScopes_829 = this.scopesets.all;
    let stxScopes_830 = this.scopesets.phase.has(phase_828) ? this.scopesets.phase.get(phase_828) : (0, _immutable.List)();
    stxScopes_830 = allScopes_829.concat(stxScopes_830);
    if (stxScopes_830.size === 0 || !(this.match("identifier") || this.match("keyword"))) {
      return this.token.value;
    }
    let scope_831 = stxScopes_830.last();
    let bindings_832 = this.bindings;
    if (scope_831) {
      let scopesetBindingList = bindings_832.get(this);
      if (scopesetBindingList) {
        let biggestBindingPair = scopesetBindingList.filter(_ref => {
          let scopes = _ref.scopes;
          let binding = _ref.binding;

          return scopes.isSubset(stxScopes_830);
        }).sort(sizeDecending_757);
        if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
          let debugBase = "{" + stxScopes_830.map(s_833 => s_833.toString()).join(", ") + "}";
          let debugAmbigousScopesets = biggestBindingPair.map(_ref2 => {
            let scopes = _ref2.scopes;

            return "{" + scopes.map(s_834 => s_834.toString()).join(", ") + "}";
          }).join(", ");
          throw new Error("Scopeset " + debugBase + " has ambiguous subsets " + debugAmbigousScopesets);
        } else if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve(phase_828);
          }
          return bindingStr;
        }
      }
    }
    return this.token.value;
  }
  val() {
    (0, _errors.assert)(!this.match("delimiter"), "cannot get the val of a delimiter");
    if (this.match("string")) {
      return this.token.str;
    }
    if (this.match("template")) {
      return this.token.items.map(el_835 => {
        if (el_835 instanceof Syntax && el_835.match("delimiter")) {
          return "${...}";
        }
        return el_835.slice.text;
      }).join("");
    }
    return this.token.value;
  }
  lineNumber() {
    if (!this.match("delimiter")) {
      return this.token.slice.startLocation.line;
    } else {
      return this.token.get(0).lineNumber();
    }
  }
  setLineNumber(line_836) {
    let newTok_837 = {};
    if (this.isDelimiter()) {
      newTok_837 = this.token.map(s_838 => s_838.setLineNumber(line_836));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok_837[key] = this.token[key];
      }
      (0, _errors.assert)(newTok_837.slice && newTok_837.slice.startLocation, "all tokens must have line info");
      newTok_837.slice.startLocation.line = line_836;
    }
    return new Syntax(newTok_837, this);
  }
  inner() {
    (0, _errors.assert)(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }
  addScope(scope_839, bindings_840, phase_841) {
    let options_842 = arguments.length <= 3 || arguments[3] === undefined ? { flip: false } : arguments[3];

    let token_843 = this.match("delimiter") ? this.token.map(s_847 => s_847.addScope(scope_839, bindings_840, phase_841, options_842)) : this.token;
    if (this.match("template")) {
      token_843 = { type: this.token.type, items: token_843.items.map(it_848 => {
          if (it_848 instanceof Syntax && it_848.match("delimiter")) {
            return it_848.addScope(scope_839, bindings_840, phase_841, options_842);
          }
          return it_848;
        }) };
    }
    let oldScopeset_844;
    if (phase_841 === ALL_PHASES) {
      oldScopeset_844 = this.scopesets.all;
    } else {
      oldScopeset_844 = this.scopesets.phase.has(phase_841) ? this.scopesets.phase.get(phase_841) : (0, _immutable.List)();
    }
    let newScopeset_845;
    if (options_842.flip) {
      let index = oldScopeset_844.indexOf(scope_839);
      if (index !== -1) {
        newScopeset_845 = oldScopeset_844.remove(index);
      } else {
        newScopeset_845 = oldScopeset_844.push(scope_839);
      }
    } else {
      newScopeset_845 = oldScopeset_844.push(scope_839);
    }
    let newstx_846 = { bindings: bindings_840, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    if (phase_841 === ALL_PHASES) {
      newstx_846.scopesets.all = newScopeset_845;
    } else {
      newstx_846.scopesets.phase = newstx_846.scopesets.phase.set(phase_841, newScopeset_845);
    }
    return new Syntax(token_843, newstx_846);
  }
  removeScope(scope_849, phase_850) {
    let token_851 = this.match("delimiter") ? this.token.map(s_857 => s_857.removeScope(scope_849, phase_850)) : this.token;
    let phaseScopeset_852 = this.scopesets.phase.has(phase_850) ? this.scopesets.phase.get(phase_850) : (0, _immutable.List)();
    let allScopeset_853 = this.scopesets.all;
    let newstx_854 = { bindings: this.bindings, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    let phaseIndex_855 = phaseScopeset_852.indexOf(scope_849);
    let allIndex_856 = allScopeset_853.indexOf(scope_849);
    if (phaseIndex_855 !== -1) {
      newstx_854.scopesets.phase = this.scopesets.phase.set(phase_850, phaseScopeset_852.remove(phaseIndex_855));
    } else if (allIndex_856 !== -1) {
      newstx_854.scopesets.all = allScopeset_853.remove(allIndex_856);
    }
    return new Syntax(token_851, newstx_854);
  }
  match(type_858, value_859) {
    if (!Types[type_858]) {
      throw new Error(type_858 + " is an invalid type");
    }
    return Types[type_858].match(this.token) && (value_859 == null || (value_859 instanceof RegExp ? value_859.test(this.val()) : this.val() == value_859));
  }
  isIdentifier(value_860) {
    return this.match("identifier", value_860);
  }
  isAssign(value_861) {
    return this.match("assign", value_861);
  }
  isBooleanLiteral(value_862) {
    return this.match("boolean", value_862);
  }
  isKeyword(value_863) {
    return this.match("keyword", value_863);
  }
  isNullLiteral(value_864) {
    return this.match("null", value_864);
  }
  isNumericLiteral(value_865) {
    return this.match("number", value_865);
  }
  isPunctuator(value_866) {
    return this.match("punctuator", value_866);
  }
  isStringLiteral(value_867) {
    return this.match("string", value_867);
  }
  isRegularExpression(value_868) {
    return this.match("regularExpression", value_868);
  }
  isTemplate(value_869) {
    return this.match("template", value_869);
  }
  isDelimiter(value_870) {
    return this.match("delimiter", value_870);
  }
  isParens(value_871) {
    return this.match("parens", value_871);
  }
  isBraces(value_872) {
    return this.match("braces", value_872);
  }
  isBrackets(value_873) {
    return this.match("brackets", value_873);
  }
  isSyntaxTemplate(value_874) {
    return this.match("syntaxTemplate", value_874);
  }
  isEOF(value_875) {
    return this.match("eof", value_875);
  }
  toString() {
    if (this.match("delimiter")) {
      return this.token.map(s_876 => s_876.toString()).join(" ");
    }
    if (this.match("string")) {
      return "'" + this.token.str;
    }
    if (this.match("template")) {
      return this.val();
    }
    return this.token.value;
  }
}
exports.default = Syntax;