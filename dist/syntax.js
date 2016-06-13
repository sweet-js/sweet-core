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

var _tokenizer = require("shift-parser/dist/tokenizer");

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Just_779 = _ramdaFantasy.Maybe.Just;
const Nothing_780 = _ramdaFantasy.Maybe.Nothing;
function sizeDecending_781(a_784, b_785) {
  if (a_784.scopes.size > b_785.scopes.size) {
    return -1;
  } else if (b_785.scopes.size > a_784.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}
let Types_782 = { null: { match: token_786 => !Types_782.delimiter.match(token_786) && token_786.type === _tokenizer.TokenType.NULL, create: (value_787, stx_788) => new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_788) }, number: { match: token_789 => !Types_782.delimiter.match(token_789) && token_789.type.klass === _tokenizer.TokenClass.NumericLiteral, create: (value_790, stx_791) => new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_790 }, stx_791) }, string: { match: token_792 => !Types_782.delimiter.match(token_792) && token_792.type.klass === _tokenizer.TokenClass.StringLiteral, create: (value_793, stx_794) => new Syntax({ type: _tokenizer.TokenType.STRING, str: value_793 }, stx_794) }, punctuator: { match: token_795 => !Types_782.delimiter.match(token_795) && token_795.type.klass === _tokenizer.TokenClass.Punctuator, create: (value_796, stx_797) => new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_796 }, value: value_796 }, stx_797) }, keyword: { match: token_798 => !Types_782.delimiter.match(token_798) && token_798.type.klass === _tokenizer.TokenClass.Keyword, create: (value_799, stx_800) => new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_799 }, value: value_799 }, stx_800) }, identifier: { match: token_801 => !Types_782.delimiter.match(token_801) && token_801.type.klass === _tokenizer.TokenClass.Ident, create: (value_802, stx_803) => new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_802 }, stx_803) }, regularExpression: { match: token_804 => !Types_782.delimiter.match(token_804) && token_804.type.klass === _tokenizer.TokenClass.RegularExpression, create: (value_805, stx_806) => new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_805 }, stx_806) }, braces: { match: token_807 => Types_782.delimiter.match(token_807) && token_807.get(0).token.type === _tokenizer.TokenType.LBRACE, create: (inner_808, stx_809) => {
      let left_810 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });
      let right_811 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });
      return new Syntax(_immutable.List.of(left_810).concat(inner_808).push(right_811), stx_809);
    } }, brackets: { match: token_812 => Types_782.delimiter.match(token_812) && token_812.get(0).token.type === _tokenizer.TokenType.LBRACK, create: (inner_813, stx_814) => {
      let left_815 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });
      let right_816 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });
      return new Syntax(_immutable.List.of(left_815).concat(inner_813).push(right_816), stx_814);
    } }, parens: { match: token_817 => Types_782.delimiter.match(token_817) && token_817.get(0).token.type === _tokenizer.TokenType.LPAREN, create: (inner_818, stx_819) => {
      let left_820 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });
      let right_821 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });
      return new Syntax(_immutable.List.of(left_820).concat(inner_818).push(right_821), stx_819);
    } }, assign: { match: token_822 => {
      if (Types_782.punctuator.match(token_822)) {
        switch (token_822.value) {
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
    } }, boolean: { match: token_823 => !Types_782.delimiter.match(token_823) && token_823.type === _tokenizer.TokenType.TRUE || token_823.type === _tokenizer.TokenType.FALSE }, template: { match: token_824 => !Types_782.delimiter.match(token_824) && token_824.type === _tokenizer.TokenType.TEMPLATE }, delimiter: { match: token_825 => _immutable.List.isList(token_825) }, syntaxTemplate: { match: token_826 => Types_782.delimiter.match(token_826) && token_826.get(0).val() === "#`" }, eof: { match: token_827 => !Types_782.delimiter.match(token_827) && token_827.type === _tokenizer.TokenType.EOS } };
;
const ALL_PHASES_783 = {};
;
class Syntax {
  constructor(token_828) {
    let oldstx_829 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.token = token_828;
    this.bindings = oldstx_829.bindings != null ? oldstx_829.bindings : new _bindingMap2.default();
    this.scopesets = oldstx_829.scopesets != null ? oldstx_829.scopesets : { all: (0, _immutable.List)(), phase: (0, _immutable.Map)() };
    Object.freeze(this);
  }
  static of(token_830) {
    let stx_831 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Syntax(token_830, stx_831);
  }
  static from(type_832, value_833) {
    let stx_834 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!Types_782[type_832]) {
      throw new Error(type_832 + " is not a valid type");
    } else if (!Types_782[type_832].create) {
      throw new Error("Cannot create a syntax from type " + type_832);
    }
    return Types_782[type_832].create(value_833, stx_834);
  }
  static fromNull() {
    let stx_835 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return Syntax.from("null", null, stx_835);
  }
  static fromNumber(value_836) {
    let stx_837 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("number", value_836, stx_837);
  }
  static fromString(value_838) {
    let stx_839 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("string", value_838, stx_839);
  }
  static fromPunctuator(value_840) {
    let stx_841 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("punctuator", value_840, stx_841);
  }
  static fromKeyword(value_842) {
    let stx_843 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("keyword", value_842, stx_843);
  }
  static fromIdentifier(value_844) {
    let stx_845 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("identifier", value_844, stx_845);
  }
  static fromRegularExpression(value_846) {
    let stx_847 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("regularExpression", value_846, stx_847);
  }
  static fromBraces(inner_848) {
    let stx_849 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("braces", inner_848, stx_849);
  }
  static fromBrackets(inner_850) {
    let stx_851 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("brackets", inner_850, stx_851);
  }
  static fromParens(inner_852) {
    let stx_853 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("parens", inner_852, stx_853);
  }
  resolve(phase_854) {
    (0, _errors.assert)(phase_854 != null, "must provide a phase to resolve");
    let allScopes_855 = this.scopesets.all;
    let stxScopes_856 = this.scopesets.phase.has(phase_854) ? this.scopesets.phase.get(phase_854) : (0, _immutable.List)();
    stxScopes_856 = allScopes_855.concat(stxScopes_856);
    if (stxScopes_856.size === 0 || !(this.match("identifier") || this.match("keyword"))) {
      return this.token.value;
    }
    let scope_857 = stxScopes_856.last();
    let bindings_858 = this.bindings;
    if (scope_857) {
      let scopesetBindingList = bindings_858.get(this);
      if (scopesetBindingList) {
        let biggestBindingPair = scopesetBindingList.filter(_ref => {
          let scopes = _ref.scopes;
          let binding = _ref.binding;

          return scopes.isSubset(stxScopes_856);
        }).sort(sizeDecending_781);
        if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
          let debugBase = "{" + stxScopes_856.map(s_859 => s_859.toString()).join(", ") + "}";
          let debugAmbigousScopesets = biggestBindingPair.map(_ref2 => {
            let scopes = _ref2.scopes;

            return "{" + scopes.map(s_860 => s_860.toString()).join(", ") + "}";
          }).join(", ");
          throw new Error("Scopeset " + debugBase + " has ambiguous subsets " + debugAmbigousScopesets);
        } else if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve(phase_854);
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
      return this.token.items.map(el_861 => {
        if (el_861 instanceof Syntax && el_861.match("delimiter")) {
          return "${...}";
        }
        return el_861.slice.text;
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
  setLineNumber(line_862) {
    let newTok_863 = {};
    if (this.isDelimiter()) {
      newTok_863 = this.token.map(s_864 => s_864.setLineNumber(line_862));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok_863[key] = this.token[key];
      }
      (0, _errors.assert)(newTok_863.slice && newTok_863.slice.startLocation, "all tokens must have line info");
      newTok_863.slice.startLocation.line = line_862;
    }
    return new Syntax(newTok_863, this);
  }
  inner() {
    (0, _errors.assert)(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }
  addScope(scope_865, bindings_866, phase_867) {
    let options_868 = arguments.length <= 3 || arguments[3] === undefined ? { flip: false } : arguments[3];

    let token_869 = this.match("delimiter") ? this.token.map(s_873 => s_873.addScope(scope_865, bindings_866, phase_867, options_868)) : this.token;
    if (this.match("template")) {
      token_869 = { type: this.token.type, items: token_869.items.map(it_874 => {
          if (it_874 instanceof Syntax && it_874.match("delimiter")) {
            return it_874.addScope(scope_865, bindings_866, phase_867, options_868);
          }
          return it_874;
        }) };
    }
    let oldScopeset_870;
    if (phase_867 === ALL_PHASES_783) {
      oldScopeset_870 = this.scopesets.all;
    } else {
      oldScopeset_870 = this.scopesets.phase.has(phase_867) ? this.scopesets.phase.get(phase_867) : (0, _immutable.List)();
    }
    let newScopeset_871;
    if (options_868.flip) {
      let index = oldScopeset_870.indexOf(scope_865);
      if (index !== -1) {
        newScopeset_871 = oldScopeset_870.remove(index);
      } else {
        newScopeset_871 = oldScopeset_870.push(scope_865);
      }
    } else {
      newScopeset_871 = oldScopeset_870.push(scope_865);
    }
    let newstx_872 = { bindings: bindings_866, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    if (phase_867 === ALL_PHASES_783) {
      newstx_872.scopesets.all = newScopeset_871;
    } else {
      newstx_872.scopesets.phase = newstx_872.scopesets.phase.set(phase_867, newScopeset_871);
    }
    return new Syntax(token_869, newstx_872);
  }
  removeScope(scope_875, phase_876) {
    let token_877 = this.match("delimiter") ? this.token.map(s_883 => s_883.removeScope(scope_875, phase_876)) : this.token;
    let phaseScopeset_878 = this.scopesets.phase.has(phase_876) ? this.scopesets.phase.get(phase_876) : (0, _immutable.List)();
    let allScopeset_879 = this.scopesets.all;
    let newstx_880 = { bindings: this.bindings, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    let phaseIndex_881 = phaseScopeset_878.indexOf(scope_875);
    let allIndex_882 = allScopeset_879.indexOf(scope_875);
    if (phaseIndex_881 !== -1) {
      newstx_880.scopesets.phase = this.scopesets.phase.set(phase_876, phaseScopeset_878.remove(phaseIndex_881));
    } else if (allIndex_882 !== -1) {
      newstx_880.scopesets.all = allScopeset_879.remove(allIndex_882);
    }
    return new Syntax(token_877, newstx_880);
  }
  match(type_884, value_885) {
    if (!Types_782[type_884]) {
      throw new Error(type_884 + " is an invalid type");
    }
    return Types_782[type_884].match(this.token) && (value_885 == null || (value_885 instanceof RegExp ? value_885.test(this.val()) : this.val() == value_885));
  }
  isIdentifier(value_886) {
    return this.match("identifier", value_886);
  }
  isAssign(value_887) {
    return this.match("assign", value_887);
  }
  isBooleanLiteral(value_888) {
    return this.match("boolean", value_888);
  }
  isKeyword(value_889) {
    return this.match("keyword", value_889);
  }
  isNullLiteral(value_890) {
    return this.match("null", value_890);
  }
  isNumericLiteral(value_891) {
    return this.match("number", value_891);
  }
  isPunctuator(value_892) {
    return this.match("punctuator", value_892);
  }
  isStringLiteral(value_893) {
    return this.match("string", value_893);
  }
  isRegularExpression(value_894) {
    return this.match("regularExpression", value_894);
  }
  isTemplate(value_895) {
    return this.match("template", value_895);
  }
  isDelimiter(value_896) {
    return this.match("delimiter", value_896);
  }
  isParens(value_897) {
    return this.match("parens", value_897);
  }
  isBraces(value_898) {
    return this.match("braces", value_898);
  }
  isBrackets(value_899) {
    return this.match("brackets", value_899);
  }
  isSyntaxTemplate(value_900) {
    return this.match("syntaxTemplate", value_900);
  }
  isEOF(value_901) {
    return this.match("eof", value_901);
  }
  toString() {
    if (this.match("delimiter")) {
      return this.token.map(s_902 => s_902.toString()).join(" ");
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
exports.Types = Types_782;
exports.ALL_PHASES = ALL_PHASES_783;
//# sourceMappingURL=data:application/json;base64,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IjpbImltcG9ydCB7TGlzdCwgTWFwfSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcFwiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7VG9rZW5UeXBlLCBUb2tlbkNsYXNzfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IEp1c3RfNzc5ID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfNzgwID0gTWF5YmUuTm90aGluZztcbmZ1bmN0aW9uIHNpemVEZWNlbmRpbmdfNzgxKGFfNzg0LCBiXzc4NSkge1xuICBpZiAoYV83ODQuc2NvcGVzLnNpemUgPiBiXzc4NS5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIGlmIChiXzc4NS5zY29wZXMuc2l6ZSA+IGFfNzg0LnNjb3Blcy5zaXplKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbmxldCBUeXBlc183ODIgPSB7bnVsbDoge21hdGNoOiB0b2tlbl83ODYgPT4gIVR5cGVzXzc4Mi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fNzg2KSAmJiB0b2tlbl83ODYudHlwZSA9PT0gVG9rZW5UeXBlLk5VTEwsIGNyZWF0ZTogKHZhbHVlXzc4Nywgc3R4Xzc4OCkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTEwsIHZhbHVlOiBudWxsfSwgc3R4Xzc4OCl9LCBudW1iZXI6IHttYXRjaDogdG9rZW5fNzg5ID0+ICFUeXBlc183ODIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzc4OSkgJiYgdG9rZW5fNzg5LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuTnVtZXJpY0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzc5MCwgc3R4Xzc5MSkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTUJFUiwgdmFsdWU6IHZhbHVlXzc5MH0sIHN0eF83OTEpfSwgc3RyaW5nOiB7bWF0Y2g6IHRva2VuXzc5MiA9PiAhVHlwZXNfNzgyLmRlbGltaXRlci5tYXRjaCh0b2tlbl83OTIpICYmIHRva2VuXzc5Mi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlN0cmluZ0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzc5Mywgc3R4Xzc5NCkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlNUUklORywgc3RyOiB2YWx1ZV83OTN9LCBzdHhfNzk0KX0sIHB1bmN0dWF0b3I6IHttYXRjaDogdG9rZW5fNzk1ID0+ICFUeXBlc183ODIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzc5NSkgJiYgdG9rZW5fNzk1LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgY3JlYXRlOiAodmFsdWVfNzk2LCBzdHhfNzk3KSA9PiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgbmFtZTogdmFsdWVfNzk2fSwgdmFsdWU6IHZhbHVlXzc5Nn0sIHN0eF83OTcpfSwga2V5d29yZDoge21hdGNoOiB0b2tlbl83OTggPT4gIVR5cGVzXzc4Mi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fNzk4KSAmJiB0b2tlbl83OTgudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5LZXl3b3JkLCBjcmVhdGU6ICh2YWx1ZV83OTksIHN0eF84MDApID0+IG5ldyBTeW50YXgoe3R5cGU6IHtrbGFzczogVG9rZW5DbGFzcy5LZXl3b3JkLCBuYW1lOiB2YWx1ZV83OTl9LCB2YWx1ZTogdmFsdWVfNzk5fSwgc3R4XzgwMCl9LCBpZGVudGlmaWVyOiB7bWF0Y2g6IHRva2VuXzgwMSA9PiAhVHlwZXNfNzgyLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MDEpICYmIHRva2VuXzgwMS50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLklkZW50LCBjcmVhdGU6ICh2YWx1ZV84MDIsIHN0eF84MDMpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLCB2YWx1ZTogdmFsdWVfODAyfSwgc3R4XzgwMyl9LCByZWd1bGFyRXhwcmVzc2lvbjoge21hdGNoOiB0b2tlbl84MDQgPT4gIVR5cGVzXzc4Mi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODA0KSAmJiB0b2tlbl84MDQudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5SZWd1bGFyRXhwcmVzc2lvbiwgY3JlYXRlOiAodmFsdWVfODA1LCBzdHhfODA2KSA9PiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkVHRVhQLCB2YWx1ZTogdmFsdWVfODA1fSwgc3R4XzgwNil9LCBicmFjZXM6IHttYXRjaDogdG9rZW5fODA3ID0+IFR5cGVzXzc4Mi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODA3KSAmJiB0b2tlbl84MDcuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0UsIGNyZWF0ZTogKGlubmVyXzgwOCwgc3R4XzgwOSkgPT4ge1xuICBsZXQgbGVmdF84MTAgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNFLCB2YWx1ZTogXCJ7XCJ9KTtcbiAgbGV0IHJpZ2h0XzgxMSA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0UsIHZhbHVlOiBcIn1cIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODEwKS5jb25jYXQoaW5uZXJfODA4KS5wdXNoKHJpZ2h0XzgxMSksIHN0eF84MDkpO1xufX0sIGJyYWNrZXRzOiB7bWF0Y2g6IHRva2VuXzgxMiA9PiBUeXBlc183ODIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgxMikgJiYgdG9rZW5fODEyLmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNLLCBjcmVhdGU6IChpbm5lcl84MTMsIHN0eF84MTQpID0+IHtcbiAgbGV0IGxlZnRfODE1ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDSywgdmFsdWU6IFwiW1wifSk7XG4gIGxldCByaWdodF84MTYgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkJSQUNLLCB2YWx1ZTogXCJdXCJ9KTtcbiAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0XzgxNSkuY29uY2F0KGlubmVyXzgxMykucHVzaChyaWdodF84MTYpLCBzdHhfODE0KTtcbn19LCBwYXJlbnM6IHttYXRjaDogdG9rZW5fODE3ID0+IFR5cGVzXzc4Mi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODE3KSAmJiB0b2tlbl84MTcuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MUEFSRU4sIGNyZWF0ZTogKGlubmVyXzgxOCwgc3R4XzgxOSkgPT4ge1xuICBsZXQgbGVmdF84MjAgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTFBBUkVOLCB2YWx1ZTogXCIoXCJ9KTtcbiAgbGV0IHJpZ2h0XzgyMSA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SUEFSRU4sIHZhbHVlOiBcIilcIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODIwKS5jb25jYXQoaW5uZXJfODE4KS5wdXNoKHJpZ2h0XzgyMSksIHN0eF84MTkpO1xufX0sIGFzc2lnbjoge21hdGNoOiB0b2tlbl84MjIgPT4ge1xuICBpZiAoVHlwZXNfNzgyLnB1bmN0dWF0b3IubWF0Y2godG9rZW5fODIyKSkge1xuICAgIHN3aXRjaCAodG9rZW5fODIyLnZhbHVlKSB7XG4gICAgICBjYXNlIFwiPVwiOlxuICAgICAgY2FzZSBcInw9XCI6XG4gICAgICBjYXNlIFwiXj1cIjpcbiAgICAgIGNhc2UgXCImPVwiOlxuICAgICAgY2FzZSBcIjw8PVwiOlxuICAgICAgY2FzZSBcIj4+PVwiOlxuICAgICAgY2FzZSBcIj4+Pj1cIjpcbiAgICAgIGNhc2UgXCIrPVwiOlxuICAgICAgY2FzZSBcIi09XCI6XG4gICAgICBjYXNlIFwiKj1cIjpcbiAgICAgIGNhc2UgXCIvPVwiOlxuICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59fSwgYm9vbGVhbjoge21hdGNoOiB0b2tlbl84MjMgPT4gIVR5cGVzXzc4Mi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODIzKSAmJiB0b2tlbl84MjMudHlwZSA9PT0gVG9rZW5UeXBlLlRSVUUgfHwgdG9rZW5fODIzLnR5cGUgPT09IFRva2VuVHlwZS5GQUxTRX0sIHRlbXBsYXRlOiB7bWF0Y2g6IHRva2VuXzgyNCA9PiAhVHlwZXNfNzgyLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MjQpICYmIHRva2VuXzgyNC50eXBlID09PSBUb2tlblR5cGUuVEVNUExBVEV9LCBkZWxpbWl0ZXI6IHttYXRjaDogdG9rZW5fODI1ID0+IExpc3QuaXNMaXN0KHRva2VuXzgyNSl9LCBzeW50YXhUZW1wbGF0ZToge21hdGNoOiB0b2tlbl84MjYgPT4gVHlwZXNfNzgyLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MjYpICYmIHRva2VuXzgyNi5nZXQoMCkudmFsKCkgPT09IFwiI2BcIn0sIGVvZjoge21hdGNoOiB0b2tlbl84MjcgPT4gIVR5cGVzXzc4Mi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODI3KSAmJiB0b2tlbl84MjcudHlwZSA9PT0gVG9rZW5UeXBlLkVPU319O1xuO1xuY29uc3QgQUxMX1BIQVNFU183ODMgPSB7fTtcbjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bnRheCB7XG4gIGNvbnN0cnVjdG9yKHRva2VuXzgyOCwgb2xkc3R4XzgyOSA9IHt9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuXzgyODtcbiAgICB0aGlzLmJpbmRpbmdzID0gb2xkc3R4XzgyOS5iaW5kaW5ncyAhPSBudWxsID8gb2xkc3R4XzgyOS5iaW5kaW5ncyA6IG5ldyBCaW5kaW5nTWFwO1xuICAgIHRoaXMuc2NvcGVzZXRzID0gb2xkc3R4XzgyOS5zY29wZXNldHMgIT0gbnVsbCA/IG9sZHN0eF84Mjkuc2NvcGVzZXRzIDoge2FsbDogTGlzdCgpLCBwaGFzZTogTWFwKCl9O1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgc3RhdGljIG9mKHRva2VuXzgzMCwgc3R4XzgzMSA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fODMwLCBzdHhfODMxKTtcbiAgfVxuICBzdGF0aWMgZnJvbSh0eXBlXzgzMiwgdmFsdWVfODMzLCBzdHhfODM0ID0ge30pIHtcbiAgICBpZiAoIVR5cGVzXzc4Mlt0eXBlXzgzMl0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzgzMiArIFwiIGlzIG5vdCBhIHZhbGlkIHR5cGVcIik7XG4gICAgfSBlbHNlIGlmICghVHlwZXNfNzgyW3R5cGVfODMyXS5jcmVhdGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgYSBzeW50YXggZnJvbSB0eXBlIFwiICsgdHlwZV84MzIpO1xuICAgIH1cbiAgICByZXR1cm4gVHlwZXNfNzgyW3R5cGVfODMyXS5jcmVhdGUodmFsdWVfODMzLCBzdHhfODM0KTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bGwoc3R4XzgzNSA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwibnVsbFwiLCBudWxsLCBzdHhfODM1KTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bWJlcih2YWx1ZV84MzYsIHN0eF84MzcgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcIm51bWJlclwiLCB2YWx1ZV84MzYsIHN0eF84MzcpO1xuICB9XG4gIHN0YXRpYyBmcm9tU3RyaW5nKHZhbHVlXzgzOCwgc3R4XzgzOSA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwic3RyaW5nXCIsIHZhbHVlXzgzOCwgc3R4XzgzOSk7XG4gIH1cbiAgc3RhdGljIGZyb21QdW5jdHVhdG9yKHZhbHVlXzg0MCwgc3R4Xzg0MSA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwicHVuY3R1YXRvclwiLCB2YWx1ZV84NDAsIHN0eF84NDEpO1xuICB9XG4gIHN0YXRpYyBmcm9tS2V5d29yZCh2YWx1ZV84NDIsIHN0eF84NDMgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImtleXdvcmRcIiwgdmFsdWVfODQyLCBzdHhfODQzKTtcbiAgfVxuICBzdGF0aWMgZnJvbUlkZW50aWZpZXIodmFsdWVfODQ0LCBzdHhfODQ1ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJpZGVudGlmaWVyXCIsIHZhbHVlXzg0NCwgc3R4Xzg0NSk7XG4gIH1cbiAgc3RhdGljIGZyb21SZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV84NDYsIHN0eF84NDcgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbHVlXzg0Niwgc3R4Xzg0Nyk7XG4gIH1cbiAgc3RhdGljIGZyb21CcmFjZXMoaW5uZXJfODQ4LCBzdHhfODQ5ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJicmFjZXNcIiwgaW5uZXJfODQ4LCBzdHhfODQ5KTtcbiAgfVxuICBzdGF0aWMgZnJvbUJyYWNrZXRzKGlubmVyXzg1MCwgc3R4Xzg1MSA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwiYnJhY2tldHNcIiwgaW5uZXJfODUwLCBzdHhfODUxKTtcbiAgfVxuICBzdGF0aWMgZnJvbVBhcmVucyhpbm5lcl84NTIsIHN0eF84NTMgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInBhcmVuc1wiLCBpbm5lcl84NTIsIHN0eF84NTMpO1xuICB9XG4gIHJlc29sdmUocGhhc2VfODU0KSB7XG4gICAgYXNzZXJ0KHBoYXNlXzg1NCAhPSBudWxsLCBcIm11c3QgcHJvdmlkZSBhIHBoYXNlIHRvIHJlc29sdmVcIik7XG4gICAgbGV0IGFsbFNjb3Blc184NTUgPSB0aGlzLnNjb3Blc2V0cy5hbGw7XG4gICAgbGV0IHN0eFNjb3Blc184NTYgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfODU0KSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV84NTQpIDogTGlzdCgpO1xuICAgIHN0eFNjb3Blc184NTYgPSBhbGxTY29wZXNfODU1LmNvbmNhdChzdHhTY29wZXNfODU2KTtcbiAgICBpZiAoc3R4U2NvcGVzXzg1Ni5zaXplID09PSAwIHx8ICEodGhpcy5tYXRjaChcImlkZW50aWZpZXJcIikgfHwgdGhpcy5tYXRjaChcImtleXdvcmRcIikpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgICB9XG4gICAgbGV0IHNjb3BlXzg1NyA9IHN0eFNjb3Blc184NTYubGFzdCgpO1xuICAgIGxldCBiaW5kaW5nc184NTggPSB0aGlzLmJpbmRpbmdzO1xuICAgIGlmIChzY29wZV84NTcpIHtcbiAgICAgIGxldCBzY29wZXNldEJpbmRpbmdMaXN0ID0gYmluZGluZ3NfODU4LmdldCh0aGlzKTtcbiAgICAgIGlmIChzY29wZXNldEJpbmRpbmdMaXN0KSB7XG4gICAgICAgIGxldCBiaWdnZXN0QmluZGluZ1BhaXIgPSBzY29wZXNldEJpbmRpbmdMaXN0LmZpbHRlcigoe3Njb3BlcywgYmluZGluZ30pID0+IHtcbiAgICAgICAgICByZXR1cm4gc2NvcGVzLmlzU3Vic2V0KHN0eFNjb3Blc184NTYpO1xuICAgICAgICB9KS5zb3J0KHNpemVEZWNlbmRpbmdfNzgxKTtcbiAgICAgICAgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplID49IDIgJiYgYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5zY29wZXMuc2l6ZSA9PT0gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgxKS5zY29wZXMuc2l6ZSkge1xuICAgICAgICAgIGxldCBkZWJ1Z0Jhc2UgPSBcIntcIiArIHN0eFNjb3Blc184NTYubWFwKHNfODU5ID0+IHNfODU5LnRvU3RyaW5nKCkpLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuICAgICAgICAgIGxldCBkZWJ1Z0FtYmlnb3VzU2NvcGVzZXRzID0gYmlnZ2VzdEJpbmRpbmdQYWlyLm1hcCgoe3Njb3Blc30pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBcIntcIiArIHNjb3Blcy5tYXAoc184NjAgPT4gc184NjAudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgfSkuam9pbihcIiwgXCIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjb3Blc2V0IFwiICsgZGVidWdCYXNlICsgXCIgaGFzIGFtYmlndW91cyBzdWJzZXRzIFwiICsgZGVidWdBbWJpZ291c1Njb3Blc2V0cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmlnZ2VzdEJpbmRpbmdQYWlyLnNpemUgIT09IDApIHtcbiAgICAgICAgICBsZXQgYmluZGluZ1N0ciA9IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYmluZGluZy50b1N0cmluZygpO1xuICAgICAgICAgIGlmIChNYXliZS5pc0p1c3QoYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcykpIHtcbiAgICAgICAgICAgIHJldHVybiBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzLmdldE9yRWxzZShudWxsKS5yZXNvbHZlKHBoYXNlXzg1NCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiaW5kaW5nU3RyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIHZhbCgpIHtcbiAgICBhc3NlcnQoIXRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2Fubm90IGdldCB0aGUgdmFsIG9mIGEgZGVsaW1pdGVyXCIpO1xuICAgIGlmICh0aGlzLm1hdGNoKFwic3RyaW5nXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zdHI7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLml0ZW1zLm1hcChlbF84NjEgPT4ge1xuICAgICAgICBpZiAoZWxfODYxIGluc3RhbmNlb2YgU3ludGF4ICYmIGVsXzg2MS5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgICAgICAgIHJldHVybiBcIiR7Li4ufVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbF84NjEuc2xpY2UudGV4dDtcbiAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIGxpbmVOdW1iZXIoKSB7XG4gICAgaWYgKCF0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZS5zdGFydExvY2F0aW9uLmxpbmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLmdldCgwKS5saW5lTnVtYmVyKCk7XG4gICAgfVxuICB9XG4gIHNldExpbmVOdW1iZXIobGluZV84NjIpIHtcbiAgICBsZXQgbmV3VG9rXzg2MyA9IHt9O1xuICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIG5ld1Rva184NjMgPSB0aGlzLnRva2VuLm1hcChzXzg2NCA9PiBzXzg2NC5zZXRMaW5lTnVtYmVyKGxpbmVfODYyKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLnRva2VuKSkge1xuICAgICAgICBuZXdUb2tfODYzW2tleV0gPSB0aGlzLnRva2VuW2tleV07XG4gICAgICB9XG4gICAgICBhc3NlcnQobmV3VG9rXzg2My5zbGljZSAmJiBuZXdUb2tfODYzLnNsaWNlLnN0YXJ0TG9jYXRpb24sIFwiYWxsIHRva2VucyBtdXN0IGhhdmUgbGluZSBpbmZvXCIpO1xuICAgICAgbmV3VG9rXzg2My5zbGljZS5zdGFydExvY2F0aW9uLmxpbmUgPSBsaW5lXzg2MjtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTeW50YXgobmV3VG9rXzg2MywgdGhpcyk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgYXNzZXJ0KHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2FuIG9ubHkgZ2V0IHRoZSBpbm5lciBvZiBhIGRlbGltaXRlclwiKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZSgxLCB0aGlzLnRva2VuLnNpemUgLSAxKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV84NjUsIGJpbmRpbmdzXzg2NiwgcGhhc2VfODY3LCBvcHRpb25zXzg2OCA9IHtmbGlwOiBmYWxzZX0pIHtcbiAgICBsZXQgdG9rZW5fODY5ID0gdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSA/IHRoaXMudG9rZW4ubWFwKHNfODczID0+IHNfODczLmFkZFNjb3BlKHNjb3BlXzg2NSwgYmluZGluZ3NfODY2LCBwaGFzZV84NjcsIG9wdGlvbnNfODY4KSkgOiB0aGlzLnRva2VuO1xuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHRva2VuXzg2OSA9IHt0eXBlOiB0aGlzLnRva2VuLnR5cGUsIGl0ZW1zOiB0b2tlbl84NjkuaXRlbXMubWFwKGl0Xzg3NCA9PiB7XG4gICAgICAgIGlmIChpdF84NzQgaW5zdGFuY2VvZiBTeW50YXggJiYgaXRfODc0Lm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGl0Xzg3NC5hZGRTY29wZShzY29wZV84NjUsIGJpbmRpbmdzXzg2NiwgcGhhc2VfODY3LCBvcHRpb25zXzg2OCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0Xzg3NDtcbiAgICAgIH0pfTtcbiAgICB9XG4gICAgbGV0IG9sZFNjb3Blc2V0Xzg3MDtcbiAgICBpZiAocGhhc2VfODY3ID09PSBBTExfUEhBU0VTXzc4Mykge1xuICAgICAgb2xkU2NvcGVzZXRfODcwID0gdGhpcy5zY29wZXNldHMuYWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbGRTY29wZXNldF84NzAgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfODY3KSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV84NjcpIDogTGlzdCgpO1xuICAgIH1cbiAgICBsZXQgbmV3U2NvcGVzZXRfODcxO1xuICAgIGlmIChvcHRpb25zXzg2OC5mbGlwKSB7XG4gICAgICBsZXQgaW5kZXggPSBvbGRTY29wZXNldF84NzAuaW5kZXhPZihzY29wZV84NjUpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBuZXdTY29wZXNldF84NzEgPSBvbGRTY29wZXNldF84NzAucmVtb3ZlKGluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Njb3Blc2V0Xzg3MSA9IG9sZFNjb3Blc2V0Xzg3MC5wdXNoKHNjb3BlXzg2NSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1Njb3Blc2V0Xzg3MSA9IG9sZFNjb3Blc2V0Xzg3MC5wdXNoKHNjb3BlXzg2NSk7XG4gICAgfVxuICAgIGxldCBuZXdzdHhfODcyID0ge2JpbmRpbmdzOiBiaW5kaW5nc184NjYsIHNjb3Blc2V0czoge2FsbDogdGhpcy5zY29wZXNldHMuYWxsLCBwaGFzZTogdGhpcy5zY29wZXNldHMucGhhc2V9fTtcbiAgICBpZiAocGhhc2VfODY3ID09PSBBTExfUEhBU0VTXzc4Mykge1xuICAgICAgbmV3c3R4Xzg3Mi5zY29wZXNldHMuYWxsID0gbmV3U2NvcGVzZXRfODcxO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdzdHhfODcyLnNjb3Blc2V0cy5waGFzZSA9IG5ld3N0eF84NzIuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZV84NjcsIG5ld1Njb3Blc2V0Xzg3MSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzg2OSwgbmV3c3R4Xzg3Mik7XG4gIH1cbiAgcmVtb3ZlU2NvcGUoc2NvcGVfODc1LCBwaGFzZV84NzYpIHtcbiAgICBsZXQgdG9rZW5fODc3ID0gdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSA/IHRoaXMudG9rZW4ubWFwKHNfODgzID0+IHNfODgzLnJlbW92ZVNjb3BlKHNjb3BlXzg3NSwgcGhhc2VfODc2KSkgOiB0aGlzLnRva2VuO1xuICAgIGxldCBwaGFzZVNjb3Blc2V0Xzg3OCA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmhhcyhwaGFzZV84NzYpID8gdGhpcy5zY29wZXNldHMucGhhc2UuZ2V0KHBoYXNlXzg3NikgOiBMaXN0KCk7XG4gICAgbGV0IGFsbFNjb3Blc2V0Xzg3OSA9IHRoaXMuc2NvcGVzZXRzLmFsbDtcbiAgICBsZXQgbmV3c3R4Xzg4MCA9IHtiaW5kaW5nczogdGhpcy5iaW5kaW5ncywgc2NvcGVzZXRzOiB7YWxsOiB0aGlzLnNjb3Blc2V0cy5hbGwsIHBoYXNlOiB0aGlzLnNjb3Blc2V0cy5waGFzZX19O1xuICAgIGxldCBwaGFzZUluZGV4Xzg4MSA9IHBoYXNlU2NvcGVzZXRfODc4LmluZGV4T2Yoc2NvcGVfODc1KTtcbiAgICBsZXQgYWxsSW5kZXhfODgyID0gYWxsU2NvcGVzZXRfODc5LmluZGV4T2Yoc2NvcGVfODc1KTtcbiAgICBpZiAocGhhc2VJbmRleF84ODEgIT09IC0xKSB7XG4gICAgICBuZXdzdHhfODgwLnNjb3Blc2V0cy5waGFzZSA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZV84NzYsIHBoYXNlU2NvcGVzZXRfODc4LnJlbW92ZShwaGFzZUluZGV4Xzg4MSkpO1xuICAgIH0gZWxzZSBpZiAoYWxsSW5kZXhfODgyICE9PSAtMSkge1xuICAgICAgbmV3c3R4Xzg4MC5zY29wZXNldHMuYWxsID0gYWxsU2NvcGVzZXRfODc5LnJlbW92ZShhbGxJbmRleF84ODIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl84NzcsIG5ld3N0eF84ODApO1xuICB9XG4gIG1hdGNoKHR5cGVfODg0LCB2YWx1ZV84ODUpIHtcbiAgICBpZiAoIVR5cGVzXzc4Mlt0eXBlXzg4NF0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzg4NCArIFwiIGlzIGFuIGludmFsaWQgdHlwZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIFR5cGVzXzc4Mlt0eXBlXzg4NF0ubWF0Y2godGhpcy50b2tlbikgJiYgKHZhbHVlXzg4NSA9PSBudWxsIHx8ICh2YWx1ZV84ODUgaW5zdGFuY2VvZiBSZWdFeHAgPyB2YWx1ZV84ODUudGVzdCh0aGlzLnZhbCgpKSA6IHRoaXMudmFsKCkgPT0gdmFsdWVfODg1KSk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzg4Nikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiLCB2YWx1ZV84ODYpO1xuICB9XG4gIGlzQXNzaWduKHZhbHVlXzg4Nykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlXzg4Nyk7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh2YWx1ZV84ODgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWVfODg4KTtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfODg5KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJrZXl3b3JkXCIsIHZhbHVlXzg4OSk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZV84OTApIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bGxcIiwgdmFsdWVfODkwKTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHZhbHVlXzg5MSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlXzg5MSk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHZhbHVlXzg5Mikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicHVuY3R1YXRvclwiLCB2YWx1ZV84OTIpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV84OTMpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN0cmluZ1wiLCB2YWx1ZV84OTMpO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odmFsdWVfODk0KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV84OTQpO1xuICB9XG4gIGlzVGVtcGxhdGUodmFsdWVfODk1KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiLCB2YWx1ZV84OTUpO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzg5Nikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIsIHZhbHVlXzg5Nik7XG4gIH1cbiAgaXNQYXJlbnModmFsdWVfODk3KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWVfODk3KTtcbiAgfVxuICBpc0JyYWNlcyh2YWx1ZV84OTgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNlc1wiLCB2YWx1ZV84OTgpO1xuICB9XG4gIGlzQnJhY2tldHModmFsdWVfODk5KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFja2V0c1wiLCB2YWx1ZV84OTkpO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUodmFsdWVfOTAwKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZV85MDApO1xuICB9XG4gIGlzRU9GKHZhbHVlXzkwMSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZW9mXCIsIHZhbHVlXzkwMSk7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLm1hcChzXzkwMiA9PiBzXzkwMi50b1N0cmluZygpKS5qb2luKFwiIFwiKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJzdHJpbmdcIikpIHtcbiAgICAgIHJldHVybiBcIidcIiArIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcInRlbXBsYXRlXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbn1cbmV4cG9ydCB7VHlwZXNfNzgyIGFzIFR5cGVzfTtcbmV4cG9ydCB7QUxMX1BIQVNFU183ODMgYXMgQUxMX1BIQVNFU30iXX0=