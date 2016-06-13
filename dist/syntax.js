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

const Just_778 = _ramdaFantasy.Maybe.Just;
const Nothing_779 = _ramdaFantasy.Maybe.Nothing;
function sizeDecending_780(a_783, b_784) {
  if (a_783.scopes.size > b_784.scopes.size) {
    return -1;
  } else if (b_784.scopes.size > a_783.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}
let Types_781 = { null: { match: token_785 => !Types_781.delimiter.match(token_785) && token_785.type === _tokenizer.TokenType.NULL, create: (value_786, stx_787) => new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_787) }, number: { match: token_788 => !Types_781.delimiter.match(token_788) && token_788.type.klass === _tokenizer.TokenClass.NumericLiteral, create: (value_789, stx_790) => new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_789 }, stx_790) }, string: { match: token_791 => !Types_781.delimiter.match(token_791) && token_791.type.klass === _tokenizer.TokenClass.StringLiteral, create: (value_792, stx_793) => new Syntax({ type: _tokenizer.TokenType.STRING, str: value_792 }, stx_793) }, punctuator: { match: token_794 => !Types_781.delimiter.match(token_794) && token_794.type.klass === _tokenizer.TokenClass.Punctuator, create: (value_795, stx_796) => new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_795 }, value: value_795 }, stx_796) }, keyword: { match: token_797 => !Types_781.delimiter.match(token_797) && token_797.type.klass === _tokenizer.TokenClass.Keyword, create: (value_798, stx_799) => new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_798 }, value: value_798 }, stx_799) }, identifier: { match: token_800 => !Types_781.delimiter.match(token_800) && token_800.type.klass === _tokenizer.TokenClass.Ident, create: (value_801, stx_802) => new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_801 }, stx_802) }, regularExpression: { match: token_803 => !Types_781.delimiter.match(token_803) && token_803.type.klass === _tokenizer.TokenClass.RegularExpression, create: (value_804, stx_805) => new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_804 }, stx_805) }, braces: { match: token_806 => Types_781.delimiter.match(token_806) && token_806.get(0).token.type === _tokenizer.TokenType.LBRACE, create: (inner_807, stx_808) => {
      let left_809 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });
      let right_810 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });
      return new Syntax(_immutable.List.of(left_809).concat(inner_807).push(right_810), stx_808);
    } }, brackets: { match: token_811 => Types_781.delimiter.match(token_811) && token_811.get(0).token.type === _tokenizer.TokenType.LBRACK, create: (inner_812, stx_813) => {
      let left_814 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });
      let right_815 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });
      return new Syntax(_immutable.List.of(left_814).concat(inner_812).push(right_815), stx_813);
    } }, parens: { match: token_816 => Types_781.delimiter.match(token_816) && token_816.get(0).token.type === _tokenizer.TokenType.LPAREN, create: (inner_817, stx_818) => {
      let left_819 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });
      let right_820 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });
      return new Syntax(_immutable.List.of(left_819).concat(inner_817).push(right_820), stx_818);
    } }, assign: { match: token_821 => {
      if (Types_781.punctuator.match(token_821)) {
        switch (token_821.value) {
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
    } }, boolean: { match: token_822 => !Types_781.delimiter.match(token_822) && token_822.type === _tokenizer.TokenType.TRUE || token_822.type === _tokenizer.TokenType.FALSE }, template: { match: token_823 => !Types_781.delimiter.match(token_823) && token_823.type === _tokenizer.TokenType.TEMPLATE }, delimiter: { match: token_824 => _immutable.List.isList(token_824) }, syntaxTemplate: { match: token_825 => Types_781.delimiter.match(token_825) && token_825.get(0).val() === "#`" }, eof: { match: token_826 => !Types_781.delimiter.match(token_826) && token_826.type === _tokenizer.TokenType.EOS } };
;
const ALL_PHASES_782 = {};
;
class Syntax {
  constructor(token_827) {
    let oldstx_828 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.token = token_827;
    this.bindings = oldstx_828.bindings != null ? oldstx_828.bindings : new _bindingMap2.default();
    this.scopesets = oldstx_828.scopesets != null ? oldstx_828.scopesets : { all: (0, _immutable.List)(), phase: (0, _immutable.Map)() };
    Object.freeze(this);
  }
  static of(token_829) {
    let stx_830 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Syntax(token_829, stx_830);
  }
  static from(type_831, value_832) {
    let stx_833 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!Types_781[type_831]) {
      throw new Error(type_831 + " is not a valid type");
    } else if (!Types_781[type_831].create) {
      throw new Error("Cannot create a syntax from type " + type_831);
    }
    return Types_781[type_831].create(value_832, stx_833);
  }
  static fromNull() {
    let stx_834 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return Syntax.from("null", null, stx_834);
  }
  static fromNumber(value_835) {
    let stx_836 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("number", value_835, stx_836);
  }
  static fromString(value_837) {
    let stx_838 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("string", value_837, stx_838);
  }
  static fromPunctuator(value_839) {
    let stx_840 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("punctuator", value_839, stx_840);
  }
  static fromKeyword(value_841) {
    let stx_842 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("keyword", value_841, stx_842);
  }
  static fromIdentifier(value_843) {
    let stx_844 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("identifier", value_843, stx_844);
  }
  static fromRegularExpression(value_845) {
    let stx_846 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("regularExpression", value_845, stx_846);
  }
  static fromBraces(inner_847) {
    let stx_848 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("braces", inner_847, stx_848);
  }
  static fromBrackets(inner_849) {
    let stx_850 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("brackets", inner_849, stx_850);
  }
  static fromParens(inner_851) {
    let stx_852 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("parens", inner_851, stx_852);
  }
  resolve(phase_853) {
    (0, _errors.assert)(phase_853 != null, "must provide a phase to resolve");
    let allScopes_854 = this.scopesets.all;
    let stxScopes_855 = this.scopesets.phase.has(phase_853) ? this.scopesets.phase.get(phase_853) : (0, _immutable.List)();
    stxScopes_855 = allScopes_854.concat(stxScopes_855);
    if (stxScopes_855.size === 0 || !(this.match("identifier") || this.match("keyword"))) {
      return this.token.value;
    }
    let scope_856 = stxScopes_855.last();
    let bindings_857 = this.bindings;
    if (scope_856) {
      let scopesetBindingList = bindings_857.get(this);
      if (scopesetBindingList) {
        let biggestBindingPair = scopesetBindingList.filter(_ref => {
          let scopes = _ref.scopes;
          let binding = _ref.binding;

          return scopes.isSubset(stxScopes_855);
        }).sort(sizeDecending_780);
        if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
          let debugBase = "{" + stxScopes_855.map(s_858 => s_858.toString()).join(", ") + "}";
          let debugAmbigousScopesets = biggestBindingPair.map(_ref2 => {
            let scopes = _ref2.scopes;

            return "{" + scopes.map(s_859 => s_859.toString()).join(", ") + "}";
          }).join(", ");
          throw new Error("Scopeset " + debugBase + " has ambiguous subsets " + debugAmbigousScopesets);
        } else if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve(phase_853);
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
      return this.token.items.map(el_860 => {
        if (el_860 instanceof Syntax && el_860.match("delimiter")) {
          return "${...}";
        }
        return el_860.slice.text;
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
  setLineNumber(line_861) {
    let newTok_862 = {};
    if (this.isDelimiter()) {
      newTok_862 = this.token.map(s_863 => s_863.setLineNumber(line_861));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok_862[key] = this.token[key];
      }
      (0, _errors.assert)(newTok_862.slice && newTok_862.slice.startLocation, "all tokens must have line info");
      newTok_862.slice.startLocation.line = line_861;
    }
    return new Syntax(newTok_862, this);
  }
  inner() {
    (0, _errors.assert)(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }
  addScope(scope_864, bindings_865, phase_866) {
    let options_867 = arguments.length <= 3 || arguments[3] === undefined ? { flip: false } : arguments[3];

    let token_868 = this.match("delimiter") ? this.token.map(s_872 => s_872.addScope(scope_864, bindings_865, phase_866, options_867)) : this.token;
    if (this.match("template")) {
      token_868 = { type: this.token.type, items: token_868.items.map(it_873 => {
          if (it_873 instanceof Syntax && it_873.match("delimiter")) {
            return it_873.addScope(scope_864, bindings_865, phase_866, options_867);
          }
          return it_873;
        }) };
    }
    let oldScopeset_869;
    if (phase_866 === ALL_PHASES_782) {
      oldScopeset_869 = this.scopesets.all;
    } else {
      oldScopeset_869 = this.scopesets.phase.has(phase_866) ? this.scopesets.phase.get(phase_866) : (0, _immutable.List)();
    }
    let newScopeset_870;
    if (options_867.flip) {
      let index = oldScopeset_869.indexOf(scope_864);
      if (index !== -1) {
        newScopeset_870 = oldScopeset_869.remove(index);
      } else {
        newScopeset_870 = oldScopeset_869.push(scope_864);
      }
    } else {
      newScopeset_870 = oldScopeset_869.push(scope_864);
    }
    let newstx_871 = { bindings: bindings_865, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    if (phase_866 === ALL_PHASES_782) {
      newstx_871.scopesets.all = newScopeset_870;
    } else {
      newstx_871.scopesets.phase = newstx_871.scopesets.phase.set(phase_866, newScopeset_870);
    }
    return new Syntax(token_868, newstx_871);
  }
  removeScope(scope_874, phase_875) {
    let token_876 = this.match("delimiter") ? this.token.map(s_882 => s_882.removeScope(scope_874, phase_875)) : this.token;
    let phaseScopeset_877 = this.scopesets.phase.has(phase_875) ? this.scopesets.phase.get(phase_875) : (0, _immutable.List)();
    let allScopeset_878 = this.scopesets.all;
    let newstx_879 = { bindings: this.bindings, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    let phaseIndex_880 = phaseScopeset_877.indexOf(scope_874);
    let allIndex_881 = allScopeset_878.indexOf(scope_874);
    if (phaseIndex_880 !== -1) {
      newstx_879.scopesets.phase = this.scopesets.phase.set(phase_875, phaseScopeset_877.remove(phaseIndex_880));
    } else if (allIndex_881 !== -1) {
      newstx_879.scopesets.all = allScopeset_878.remove(allIndex_881);
    }
    return new Syntax(token_876, newstx_879);
  }
  match(type_883, value_884) {
    if (!Types_781[type_883]) {
      throw new Error(type_883 + " is an invalid type");
    }
    return Types_781[type_883].match(this.token) && (value_884 == null || (value_884 instanceof RegExp ? value_884.test(this.val()) : this.val() == value_884));
  }
  isIdentifier(value_885) {
    return this.match("identifier", value_885);
  }
  isAssign(value_886) {
    return this.match("assign", value_886);
  }
  isBooleanLiteral(value_887) {
    return this.match("boolean", value_887);
  }
  isKeyword(value_888) {
    return this.match("keyword", value_888);
  }
  isNullLiteral(value_889) {
    return this.match("null", value_889);
  }
  isNumericLiteral(value_890) {
    return this.match("number", value_890);
  }
  isPunctuator(value_891) {
    return this.match("punctuator", value_891);
  }
  isStringLiteral(value_892) {
    return this.match("string", value_892);
  }
  isRegularExpression(value_893) {
    return this.match("regularExpression", value_893);
  }
  isTemplate(value_894) {
    return this.match("template", value_894);
  }
  isDelimiter(value_895) {
    return this.match("delimiter", value_895);
  }
  isParens(value_896) {
    return this.match("parens", value_896);
  }
  isBraces(value_897) {
    return this.match("braces", value_897);
  }
  isBrackets(value_898) {
    return this.match("brackets", value_898);
  }
  isSyntaxTemplate(value_899) {
    return this.match("syntaxTemplate", value_899);
  }
  isEOF(value_900) {
    return this.match("eof", value_900);
  }
  toString() {
    if (this.match("delimiter")) {
      return this.token.map(s_901 => s_901.toString()).join(" ");
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
exports.Types = Types_781;
exports.ALL_PHASES = ALL_PHASES_782;
//# sourceMappingURL=data:application/json;base64,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IjpbImltcG9ydCB7TGlzdCwgTWFwfSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcFwiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7VG9rZW5UeXBlLCBUb2tlbkNsYXNzfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IEp1c3RfNzc4ID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfNzc5ID0gTWF5YmUuTm90aGluZztcbmZ1bmN0aW9uIHNpemVEZWNlbmRpbmdfNzgwKGFfNzgzLCBiXzc4NCkge1xuICBpZiAoYV83ODMuc2NvcGVzLnNpemUgPiBiXzc4NC5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIGlmIChiXzc4NC5zY29wZXMuc2l6ZSA+IGFfNzgzLnNjb3Blcy5zaXplKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbmxldCBUeXBlc183ODEgPSB7bnVsbDoge21hdGNoOiB0b2tlbl83ODUgPT4gIVR5cGVzXzc4MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fNzg1KSAmJiB0b2tlbl83ODUudHlwZSA9PT0gVG9rZW5UeXBlLk5VTEwsIGNyZWF0ZTogKHZhbHVlXzc4Niwgc3R4Xzc4NykgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTEwsIHZhbHVlOiBudWxsfSwgc3R4Xzc4Nyl9LCBudW1iZXI6IHttYXRjaDogdG9rZW5fNzg4ID0+ICFUeXBlc183ODEuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzc4OCkgJiYgdG9rZW5fNzg4LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuTnVtZXJpY0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzc4OSwgc3R4Xzc5MCkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTUJFUiwgdmFsdWU6IHZhbHVlXzc4OX0sIHN0eF83OTApfSwgc3RyaW5nOiB7bWF0Y2g6IHRva2VuXzc5MSA9PiAhVHlwZXNfNzgxLmRlbGltaXRlci5tYXRjaCh0b2tlbl83OTEpICYmIHRva2VuXzc5MS50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlN0cmluZ0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzc5Miwgc3R4Xzc5MykgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlNUUklORywgc3RyOiB2YWx1ZV83OTJ9LCBzdHhfNzkzKX0sIHB1bmN0dWF0b3I6IHttYXRjaDogdG9rZW5fNzk0ID0+ICFUeXBlc183ODEuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzc5NCkgJiYgdG9rZW5fNzk0LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgY3JlYXRlOiAodmFsdWVfNzk1LCBzdHhfNzk2KSA9PiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgbmFtZTogdmFsdWVfNzk1fSwgdmFsdWU6IHZhbHVlXzc5NX0sIHN0eF83OTYpfSwga2V5d29yZDoge21hdGNoOiB0b2tlbl83OTcgPT4gIVR5cGVzXzc4MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fNzk3KSAmJiB0b2tlbl83OTcudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5LZXl3b3JkLCBjcmVhdGU6ICh2YWx1ZV83OTgsIHN0eF83OTkpID0+IG5ldyBTeW50YXgoe3R5cGU6IHtrbGFzczogVG9rZW5DbGFzcy5LZXl3b3JkLCBuYW1lOiB2YWx1ZV83OTh9LCB2YWx1ZTogdmFsdWVfNzk4fSwgc3R4Xzc5OSl9LCBpZGVudGlmaWVyOiB7bWF0Y2g6IHRva2VuXzgwMCA9PiAhVHlwZXNfNzgxLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MDApICYmIHRva2VuXzgwMC50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLklkZW50LCBjcmVhdGU6ICh2YWx1ZV84MDEsIHN0eF84MDIpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLCB2YWx1ZTogdmFsdWVfODAxfSwgc3R4XzgwMil9LCByZWd1bGFyRXhwcmVzc2lvbjoge21hdGNoOiB0b2tlbl84MDMgPT4gIVR5cGVzXzc4MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODAzKSAmJiB0b2tlbl84MDMudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5SZWd1bGFyRXhwcmVzc2lvbiwgY3JlYXRlOiAodmFsdWVfODA0LCBzdHhfODA1KSA9PiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkVHRVhQLCB2YWx1ZTogdmFsdWVfODA0fSwgc3R4XzgwNSl9LCBicmFjZXM6IHttYXRjaDogdG9rZW5fODA2ID0+IFR5cGVzXzc4MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODA2KSAmJiB0b2tlbl84MDYuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0UsIGNyZWF0ZTogKGlubmVyXzgwNywgc3R4XzgwOCkgPT4ge1xuICBsZXQgbGVmdF84MDkgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNFLCB2YWx1ZTogXCJ7XCJ9KTtcbiAgbGV0IHJpZ2h0XzgxMCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0UsIHZhbHVlOiBcIn1cIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODA5KS5jb25jYXQoaW5uZXJfODA3KS5wdXNoKHJpZ2h0XzgxMCksIHN0eF84MDgpO1xufX0sIGJyYWNrZXRzOiB7bWF0Y2g6IHRva2VuXzgxMSA9PiBUeXBlc183ODEuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgxMSkgJiYgdG9rZW5fODExLmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNLLCBjcmVhdGU6IChpbm5lcl84MTIsIHN0eF84MTMpID0+IHtcbiAgbGV0IGxlZnRfODE0ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDSywgdmFsdWU6IFwiW1wifSk7XG4gIGxldCByaWdodF84MTUgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkJSQUNLLCB2YWx1ZTogXCJdXCJ9KTtcbiAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0XzgxNCkuY29uY2F0KGlubmVyXzgxMikucHVzaChyaWdodF84MTUpLCBzdHhfODEzKTtcbn19LCBwYXJlbnM6IHttYXRjaDogdG9rZW5fODE2ID0+IFR5cGVzXzc4MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODE2KSAmJiB0b2tlbl84MTYuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MUEFSRU4sIGNyZWF0ZTogKGlubmVyXzgxNywgc3R4XzgxOCkgPT4ge1xuICBsZXQgbGVmdF84MTkgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTFBBUkVOLCB2YWx1ZTogXCIoXCJ9KTtcbiAgbGV0IHJpZ2h0XzgyMCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SUEFSRU4sIHZhbHVlOiBcIilcIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODE5KS5jb25jYXQoaW5uZXJfODE3KS5wdXNoKHJpZ2h0XzgyMCksIHN0eF84MTgpO1xufX0sIGFzc2lnbjoge21hdGNoOiB0b2tlbl84MjEgPT4ge1xuICBpZiAoVHlwZXNfNzgxLnB1bmN0dWF0b3IubWF0Y2godG9rZW5fODIxKSkge1xuICAgIHN3aXRjaCAodG9rZW5fODIxLnZhbHVlKSB7XG4gICAgICBjYXNlIFwiPVwiOlxuICAgICAgY2FzZSBcInw9XCI6XG4gICAgICBjYXNlIFwiXj1cIjpcbiAgICAgIGNhc2UgXCImPVwiOlxuICAgICAgY2FzZSBcIjw8PVwiOlxuICAgICAgY2FzZSBcIj4+PVwiOlxuICAgICAgY2FzZSBcIj4+Pj1cIjpcbiAgICAgIGNhc2UgXCIrPVwiOlxuICAgICAgY2FzZSBcIi09XCI6XG4gICAgICBjYXNlIFwiKj1cIjpcbiAgICAgIGNhc2UgXCIvPVwiOlxuICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59fSwgYm9vbGVhbjoge21hdGNoOiB0b2tlbl84MjIgPT4gIVR5cGVzXzc4MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODIyKSAmJiB0b2tlbl84MjIudHlwZSA9PT0gVG9rZW5UeXBlLlRSVUUgfHwgdG9rZW5fODIyLnR5cGUgPT09IFRva2VuVHlwZS5GQUxTRX0sIHRlbXBsYXRlOiB7bWF0Y2g6IHRva2VuXzgyMyA9PiAhVHlwZXNfNzgxLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MjMpICYmIHRva2VuXzgyMy50eXBlID09PSBUb2tlblR5cGUuVEVNUExBVEV9LCBkZWxpbWl0ZXI6IHttYXRjaDogdG9rZW5fODI0ID0+IExpc3QuaXNMaXN0KHRva2VuXzgyNCl9LCBzeW50YXhUZW1wbGF0ZToge21hdGNoOiB0b2tlbl84MjUgPT4gVHlwZXNfNzgxLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MjUpICYmIHRva2VuXzgyNS5nZXQoMCkudmFsKCkgPT09IFwiI2BcIn0sIGVvZjoge21hdGNoOiB0b2tlbl84MjYgPT4gIVR5cGVzXzc4MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODI2KSAmJiB0b2tlbl84MjYudHlwZSA9PT0gVG9rZW5UeXBlLkVPU319O1xuO1xuY29uc3QgQUxMX1BIQVNFU183ODIgPSB7fTtcbjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bnRheCB7XG4gIGNvbnN0cnVjdG9yKHRva2VuXzgyNywgb2xkc3R4XzgyOCA9IHt9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuXzgyNztcbiAgICB0aGlzLmJpbmRpbmdzID0gb2xkc3R4XzgyOC5iaW5kaW5ncyAhPSBudWxsID8gb2xkc3R4XzgyOC5iaW5kaW5ncyA6IG5ldyBCaW5kaW5nTWFwO1xuICAgIHRoaXMuc2NvcGVzZXRzID0gb2xkc3R4XzgyOC5zY29wZXNldHMgIT0gbnVsbCA/IG9sZHN0eF84Mjguc2NvcGVzZXRzIDoge2FsbDogTGlzdCgpLCBwaGFzZTogTWFwKCl9O1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgc3RhdGljIG9mKHRva2VuXzgyOSwgc3R4XzgzMCA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fODI5LCBzdHhfODMwKTtcbiAgfVxuICBzdGF0aWMgZnJvbSh0eXBlXzgzMSwgdmFsdWVfODMyLCBzdHhfODMzID0ge30pIHtcbiAgICBpZiAoIVR5cGVzXzc4MVt0eXBlXzgzMV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzgzMSArIFwiIGlzIG5vdCBhIHZhbGlkIHR5cGVcIik7XG4gICAgfSBlbHNlIGlmICghVHlwZXNfNzgxW3R5cGVfODMxXS5jcmVhdGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgYSBzeW50YXggZnJvbSB0eXBlIFwiICsgdHlwZV84MzEpO1xuICAgIH1cbiAgICByZXR1cm4gVHlwZXNfNzgxW3R5cGVfODMxXS5jcmVhdGUodmFsdWVfODMyLCBzdHhfODMzKTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bGwoc3R4XzgzNCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwibnVsbFwiLCBudWxsLCBzdHhfODM0KTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bWJlcih2YWx1ZV84MzUsIHN0eF84MzYgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcIm51bWJlclwiLCB2YWx1ZV84MzUsIHN0eF84MzYpO1xuICB9XG4gIHN0YXRpYyBmcm9tU3RyaW5nKHZhbHVlXzgzNywgc3R4XzgzOCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwic3RyaW5nXCIsIHZhbHVlXzgzNywgc3R4XzgzOCk7XG4gIH1cbiAgc3RhdGljIGZyb21QdW5jdHVhdG9yKHZhbHVlXzgzOSwgc3R4Xzg0MCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwicHVuY3R1YXRvclwiLCB2YWx1ZV84MzksIHN0eF84NDApO1xuICB9XG4gIHN0YXRpYyBmcm9tS2V5d29yZCh2YWx1ZV84NDEsIHN0eF84NDIgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImtleXdvcmRcIiwgdmFsdWVfODQxLCBzdHhfODQyKTtcbiAgfVxuICBzdGF0aWMgZnJvbUlkZW50aWZpZXIodmFsdWVfODQzLCBzdHhfODQ0ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJpZGVudGlmaWVyXCIsIHZhbHVlXzg0Mywgc3R4Xzg0NCk7XG4gIH1cbiAgc3RhdGljIGZyb21SZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV84NDUsIHN0eF84NDYgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbHVlXzg0NSwgc3R4Xzg0Nik7XG4gIH1cbiAgc3RhdGljIGZyb21CcmFjZXMoaW5uZXJfODQ3LCBzdHhfODQ4ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJicmFjZXNcIiwgaW5uZXJfODQ3LCBzdHhfODQ4KTtcbiAgfVxuICBzdGF0aWMgZnJvbUJyYWNrZXRzKGlubmVyXzg0OSwgc3R4Xzg1MCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwiYnJhY2tldHNcIiwgaW5uZXJfODQ5LCBzdHhfODUwKTtcbiAgfVxuICBzdGF0aWMgZnJvbVBhcmVucyhpbm5lcl84NTEsIHN0eF84NTIgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInBhcmVuc1wiLCBpbm5lcl84NTEsIHN0eF84NTIpO1xuICB9XG4gIHJlc29sdmUocGhhc2VfODUzKSB7XG4gICAgYXNzZXJ0KHBoYXNlXzg1MyAhPSBudWxsLCBcIm11c3QgcHJvdmlkZSBhIHBoYXNlIHRvIHJlc29sdmVcIik7XG4gICAgbGV0IGFsbFNjb3Blc184NTQgPSB0aGlzLnNjb3Blc2V0cy5hbGw7XG4gICAgbGV0IHN0eFNjb3Blc184NTUgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfODUzKSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV84NTMpIDogTGlzdCgpO1xuICAgIHN0eFNjb3Blc184NTUgPSBhbGxTY29wZXNfODU0LmNvbmNhdChzdHhTY29wZXNfODU1KTtcbiAgICBpZiAoc3R4U2NvcGVzXzg1NS5zaXplID09PSAwIHx8ICEodGhpcy5tYXRjaChcImlkZW50aWZpZXJcIikgfHwgdGhpcy5tYXRjaChcImtleXdvcmRcIikpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgICB9XG4gICAgbGV0IHNjb3BlXzg1NiA9IHN0eFNjb3Blc184NTUubGFzdCgpO1xuICAgIGxldCBiaW5kaW5nc184NTcgPSB0aGlzLmJpbmRpbmdzO1xuICAgIGlmIChzY29wZV84NTYpIHtcbiAgICAgIGxldCBzY29wZXNldEJpbmRpbmdMaXN0ID0gYmluZGluZ3NfODU3LmdldCh0aGlzKTtcbiAgICAgIGlmIChzY29wZXNldEJpbmRpbmdMaXN0KSB7XG4gICAgICAgIGxldCBiaWdnZXN0QmluZGluZ1BhaXIgPSBzY29wZXNldEJpbmRpbmdMaXN0LmZpbHRlcigoe3Njb3BlcywgYmluZGluZ30pID0+IHtcbiAgICAgICAgICByZXR1cm4gc2NvcGVzLmlzU3Vic2V0KHN0eFNjb3Blc184NTUpO1xuICAgICAgICB9KS5zb3J0KHNpemVEZWNlbmRpbmdfNzgwKTtcbiAgICAgICAgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplID49IDIgJiYgYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5zY29wZXMuc2l6ZSA9PT0gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgxKS5zY29wZXMuc2l6ZSkge1xuICAgICAgICAgIGxldCBkZWJ1Z0Jhc2UgPSBcIntcIiArIHN0eFNjb3Blc184NTUubWFwKHNfODU4ID0+IHNfODU4LnRvU3RyaW5nKCkpLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuICAgICAgICAgIGxldCBkZWJ1Z0FtYmlnb3VzU2NvcGVzZXRzID0gYmlnZ2VzdEJpbmRpbmdQYWlyLm1hcCgoe3Njb3Blc30pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBcIntcIiArIHNjb3Blcy5tYXAoc184NTkgPT4gc184NTkudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgfSkuam9pbihcIiwgXCIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjb3Blc2V0IFwiICsgZGVidWdCYXNlICsgXCIgaGFzIGFtYmlndW91cyBzdWJzZXRzIFwiICsgZGVidWdBbWJpZ291c1Njb3Blc2V0cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmlnZ2VzdEJpbmRpbmdQYWlyLnNpemUgIT09IDApIHtcbiAgICAgICAgICBsZXQgYmluZGluZ1N0ciA9IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYmluZGluZy50b1N0cmluZygpO1xuICAgICAgICAgIGlmIChNYXliZS5pc0p1c3QoYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcykpIHtcbiAgICAgICAgICAgIHJldHVybiBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzLmdldE9yRWxzZShudWxsKS5yZXNvbHZlKHBoYXNlXzg1Myk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiaW5kaW5nU3RyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIHZhbCgpIHtcbiAgICBhc3NlcnQoIXRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2Fubm90IGdldCB0aGUgdmFsIG9mIGEgZGVsaW1pdGVyXCIpO1xuICAgIGlmICh0aGlzLm1hdGNoKFwic3RyaW5nXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zdHI7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLml0ZW1zLm1hcChlbF84NjAgPT4ge1xuICAgICAgICBpZiAoZWxfODYwIGluc3RhbmNlb2YgU3ludGF4ICYmIGVsXzg2MC5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgICAgICAgIHJldHVybiBcIiR7Li4ufVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbF84NjAuc2xpY2UudGV4dDtcbiAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIGxpbmVOdW1iZXIoKSB7XG4gICAgaWYgKCF0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZS5zdGFydExvY2F0aW9uLmxpbmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLmdldCgwKS5saW5lTnVtYmVyKCk7XG4gICAgfVxuICB9XG4gIHNldExpbmVOdW1iZXIobGluZV84NjEpIHtcbiAgICBsZXQgbmV3VG9rXzg2MiA9IHt9O1xuICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIG5ld1Rva184NjIgPSB0aGlzLnRva2VuLm1hcChzXzg2MyA9PiBzXzg2My5zZXRMaW5lTnVtYmVyKGxpbmVfODYxKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLnRva2VuKSkge1xuICAgICAgICBuZXdUb2tfODYyW2tleV0gPSB0aGlzLnRva2VuW2tleV07XG4gICAgICB9XG4gICAgICBhc3NlcnQobmV3VG9rXzg2Mi5zbGljZSAmJiBuZXdUb2tfODYyLnNsaWNlLnN0YXJ0TG9jYXRpb24sIFwiYWxsIHRva2VucyBtdXN0IGhhdmUgbGluZSBpbmZvXCIpO1xuICAgICAgbmV3VG9rXzg2Mi5zbGljZS5zdGFydExvY2F0aW9uLmxpbmUgPSBsaW5lXzg2MTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTeW50YXgobmV3VG9rXzg2MiwgdGhpcyk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgYXNzZXJ0KHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2FuIG9ubHkgZ2V0IHRoZSBpbm5lciBvZiBhIGRlbGltaXRlclwiKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZSgxLCB0aGlzLnRva2VuLnNpemUgLSAxKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV84NjQsIGJpbmRpbmdzXzg2NSwgcGhhc2VfODY2LCBvcHRpb25zXzg2NyA9IHtmbGlwOiBmYWxzZX0pIHtcbiAgICBsZXQgdG9rZW5fODY4ID0gdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSA/IHRoaXMudG9rZW4ubWFwKHNfODcyID0+IHNfODcyLmFkZFNjb3BlKHNjb3BlXzg2NCwgYmluZGluZ3NfODY1LCBwaGFzZV84NjYsIG9wdGlvbnNfODY3KSkgOiB0aGlzLnRva2VuO1xuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHRva2VuXzg2OCA9IHt0eXBlOiB0aGlzLnRva2VuLnR5cGUsIGl0ZW1zOiB0b2tlbl84NjguaXRlbXMubWFwKGl0Xzg3MyA9PiB7XG4gICAgICAgIGlmIChpdF84NzMgaW5zdGFuY2VvZiBTeW50YXggJiYgaXRfODczLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGl0Xzg3My5hZGRTY29wZShzY29wZV84NjQsIGJpbmRpbmdzXzg2NSwgcGhhc2VfODY2LCBvcHRpb25zXzg2Nyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0Xzg3MztcbiAgICAgIH0pfTtcbiAgICB9XG4gICAgbGV0IG9sZFNjb3Blc2V0Xzg2OTtcbiAgICBpZiAocGhhc2VfODY2ID09PSBBTExfUEhBU0VTXzc4Mikge1xuICAgICAgb2xkU2NvcGVzZXRfODY5ID0gdGhpcy5zY29wZXNldHMuYWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbGRTY29wZXNldF84NjkgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfODY2KSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV84NjYpIDogTGlzdCgpO1xuICAgIH1cbiAgICBsZXQgbmV3U2NvcGVzZXRfODcwO1xuICAgIGlmIChvcHRpb25zXzg2Ny5mbGlwKSB7XG4gICAgICBsZXQgaW5kZXggPSBvbGRTY29wZXNldF84NjkuaW5kZXhPZihzY29wZV84NjQpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBuZXdTY29wZXNldF84NzAgPSBvbGRTY29wZXNldF84NjkucmVtb3ZlKGluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Njb3Blc2V0Xzg3MCA9IG9sZFNjb3Blc2V0Xzg2OS5wdXNoKHNjb3BlXzg2NCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1Njb3Blc2V0Xzg3MCA9IG9sZFNjb3Blc2V0Xzg2OS5wdXNoKHNjb3BlXzg2NCk7XG4gICAgfVxuICAgIGxldCBuZXdzdHhfODcxID0ge2JpbmRpbmdzOiBiaW5kaW5nc184NjUsIHNjb3Blc2V0czoge2FsbDogdGhpcy5zY29wZXNldHMuYWxsLCBwaGFzZTogdGhpcy5zY29wZXNldHMucGhhc2V9fTtcbiAgICBpZiAocGhhc2VfODY2ID09PSBBTExfUEhBU0VTXzc4Mikge1xuICAgICAgbmV3c3R4Xzg3MS5zY29wZXNldHMuYWxsID0gbmV3U2NvcGVzZXRfODcwO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdzdHhfODcxLnNjb3Blc2V0cy5waGFzZSA9IG5ld3N0eF84NzEuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZV84NjYsIG5ld1Njb3Blc2V0Xzg3MCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzg2OCwgbmV3c3R4Xzg3MSk7XG4gIH1cbiAgcmVtb3ZlU2NvcGUoc2NvcGVfODc0LCBwaGFzZV84NzUpIHtcbiAgICBsZXQgdG9rZW5fODc2ID0gdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSA/IHRoaXMudG9rZW4ubWFwKHNfODgyID0+IHNfODgyLnJlbW92ZVNjb3BlKHNjb3BlXzg3NCwgcGhhc2VfODc1KSkgOiB0aGlzLnRva2VuO1xuICAgIGxldCBwaGFzZVNjb3Blc2V0Xzg3NyA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmhhcyhwaGFzZV84NzUpID8gdGhpcy5zY29wZXNldHMucGhhc2UuZ2V0KHBoYXNlXzg3NSkgOiBMaXN0KCk7XG4gICAgbGV0IGFsbFNjb3Blc2V0Xzg3OCA9IHRoaXMuc2NvcGVzZXRzLmFsbDtcbiAgICBsZXQgbmV3c3R4Xzg3OSA9IHtiaW5kaW5nczogdGhpcy5iaW5kaW5ncywgc2NvcGVzZXRzOiB7YWxsOiB0aGlzLnNjb3Blc2V0cy5hbGwsIHBoYXNlOiB0aGlzLnNjb3Blc2V0cy5waGFzZX19O1xuICAgIGxldCBwaGFzZUluZGV4Xzg4MCA9IHBoYXNlU2NvcGVzZXRfODc3LmluZGV4T2Yoc2NvcGVfODc0KTtcbiAgICBsZXQgYWxsSW5kZXhfODgxID0gYWxsU2NvcGVzZXRfODc4LmluZGV4T2Yoc2NvcGVfODc0KTtcbiAgICBpZiAocGhhc2VJbmRleF84ODAgIT09IC0xKSB7XG4gICAgICBuZXdzdHhfODc5LnNjb3Blc2V0cy5waGFzZSA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZV84NzUsIHBoYXNlU2NvcGVzZXRfODc3LnJlbW92ZShwaGFzZUluZGV4Xzg4MCkpO1xuICAgIH0gZWxzZSBpZiAoYWxsSW5kZXhfODgxICE9PSAtMSkge1xuICAgICAgbmV3c3R4Xzg3OS5zY29wZXNldHMuYWxsID0gYWxsU2NvcGVzZXRfODc4LnJlbW92ZShhbGxJbmRleF84ODEpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl84NzYsIG5ld3N0eF84NzkpO1xuICB9XG4gIG1hdGNoKHR5cGVfODgzLCB2YWx1ZV84ODQpIHtcbiAgICBpZiAoIVR5cGVzXzc4MVt0eXBlXzg4M10pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzg4MyArIFwiIGlzIGFuIGludmFsaWQgdHlwZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIFR5cGVzXzc4MVt0eXBlXzg4M10ubWF0Y2godGhpcy50b2tlbikgJiYgKHZhbHVlXzg4NCA9PSBudWxsIHx8ICh2YWx1ZV84ODQgaW5zdGFuY2VvZiBSZWdFeHAgPyB2YWx1ZV84ODQudGVzdCh0aGlzLnZhbCgpKSA6IHRoaXMudmFsKCkgPT0gdmFsdWVfODg0KSk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzg4NSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiLCB2YWx1ZV84ODUpO1xuICB9XG4gIGlzQXNzaWduKHZhbHVlXzg4Nikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlXzg4Nik7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh2YWx1ZV84ODcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWVfODg3KTtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfODg4KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJrZXl3b3JkXCIsIHZhbHVlXzg4OCk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZV84ODkpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bGxcIiwgdmFsdWVfODg5KTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHZhbHVlXzg5MCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlXzg5MCk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHZhbHVlXzg5MSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicHVuY3R1YXRvclwiLCB2YWx1ZV84OTEpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV84OTIpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN0cmluZ1wiLCB2YWx1ZV84OTIpO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odmFsdWVfODkzKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV84OTMpO1xuICB9XG4gIGlzVGVtcGxhdGUodmFsdWVfODk0KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiLCB2YWx1ZV84OTQpO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzg5NSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIsIHZhbHVlXzg5NSk7XG4gIH1cbiAgaXNQYXJlbnModmFsdWVfODk2KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWVfODk2KTtcbiAgfVxuICBpc0JyYWNlcyh2YWx1ZV84OTcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNlc1wiLCB2YWx1ZV84OTcpO1xuICB9XG4gIGlzQnJhY2tldHModmFsdWVfODk4KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFja2V0c1wiLCB2YWx1ZV84OTgpO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUodmFsdWVfODk5KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZV84OTkpO1xuICB9XG4gIGlzRU9GKHZhbHVlXzkwMCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZW9mXCIsIHZhbHVlXzkwMCk7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLm1hcChzXzkwMSA9PiBzXzkwMS50b1N0cmluZygpKS5qb2luKFwiIFwiKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJzdHJpbmdcIikpIHtcbiAgICAgIHJldHVybiBcIidcIiArIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcInRlbXBsYXRlXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbn1cbmV4cG9ydCB7VHlwZXNfNzgxIGFzIFR5cGVzfTtcbmV4cG9ydCB7QUxMX1BIQVNFU183ODIgYXMgQUxMX1BIQVNFU30iXX0=