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

const Just_788 = _ramdaFantasy.Maybe.Just;
const Nothing_789 = _ramdaFantasy.Maybe.Nothing;
function sizeDecending_790(a_793, b_794) {
  if (a_793.scopes.size > b_794.scopes.size) {
    return -1;
  } else if (b_794.scopes.size > a_793.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}
let Types_791 = { null: { match: token_795 => !Types_791.delimiter.match(token_795) && token_795.type === _tokenizer.TokenType.NULL, create: (value_796, stx_797) => new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_797) }, number: { match: token_798 => !Types_791.delimiter.match(token_798) && token_798.type.klass === _tokenizer.TokenClass.NumericLiteral, create: (value_799, stx_800) => new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_799 }, stx_800) }, string: { match: token_801 => !Types_791.delimiter.match(token_801) && token_801.type.klass === _tokenizer.TokenClass.StringLiteral, create: (value_802, stx_803) => new Syntax({ type: _tokenizer.TokenType.STRING, str: value_802 }, stx_803) }, punctuator: { match: token_804 => !Types_791.delimiter.match(token_804) && token_804.type.klass === _tokenizer.TokenClass.Punctuator, create: (value_805, stx_806) => new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_805 }, value: value_805 }, stx_806) }, keyword: { match: token_807 => !Types_791.delimiter.match(token_807) && token_807.type.klass === _tokenizer.TokenClass.Keyword, create: (value_808, stx_809) => new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_808 }, value: value_808 }, stx_809) }, identifier: { match: token_810 => !Types_791.delimiter.match(token_810) && token_810.type.klass === _tokenizer.TokenClass.Ident, create: (value_811, stx_812) => new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_811 }, stx_812) }, regularExpression: { match: token_813 => !Types_791.delimiter.match(token_813) && token_813.type.klass === _tokenizer.TokenClass.RegularExpression, create: (value_814, stx_815) => new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_814 }, stx_815) }, braces: { match: token_816 => Types_791.delimiter.match(token_816) && token_816.get(0).token.type === _tokenizer.TokenType.LBRACE, create: (inner_817, stx_818) => {
      let left_819 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });
      let right_820 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });
      return new Syntax(_immutable.List.of(left_819).concat(inner_817).push(right_820), stx_818);
    } }, brackets: { match: token_821 => Types_791.delimiter.match(token_821) && token_821.get(0).token.type === _tokenizer.TokenType.LBRACK, create: (inner_822, stx_823) => {
      let left_824 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });
      let right_825 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });
      return new Syntax(_immutable.List.of(left_824).concat(inner_822).push(right_825), stx_823);
    } }, parens: { match: token_826 => Types_791.delimiter.match(token_826) && token_826.get(0).token.type === _tokenizer.TokenType.LPAREN, create: (inner_827, stx_828) => {
      let left_829 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });
      let right_830 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });
      return new Syntax(_immutable.List.of(left_829).concat(inner_827).push(right_830), stx_828);
    } }, assign: { match: token_831 => {
      if (Types_791.punctuator.match(token_831)) {
        switch (token_831.value) {
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
    } }, boolean: { match: token_832 => !Types_791.delimiter.match(token_832) && token_832.type === _tokenizer.TokenType.TRUE || token_832.type === _tokenizer.TokenType.FALSE }, template: { match: token_833 => !Types_791.delimiter.match(token_833) && token_833.type === _tokenizer.TokenType.TEMPLATE }, delimiter: { match: token_834 => _immutable.List.isList(token_834) }, syntaxTemplate: { match: token_835 => Types_791.delimiter.match(token_835) && token_835.get(0).val() === "#`" }, eof: { match: token_836 => !Types_791.delimiter.match(token_836) && token_836.type === _tokenizer.TokenType.EOS } };
;
const ALL_PHASES_792 = {};
;
class Syntax {
  constructor(token_837) {
    let oldstx_838 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.token = token_837;
    this.bindings = oldstx_838.bindings != null ? oldstx_838.bindings : new _bindingMap2.default();
    this.scopesets = oldstx_838.scopesets != null ? oldstx_838.scopesets : { all: (0, _immutable.List)(), phase: (0, _immutable.Map)() };
    Object.freeze(this);
  }
  static of(token_839) {
    let stx_840 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Syntax(token_839, stx_840);
  }
  static from(type_841, value_842) {
    let stx_843 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!Types_791[type_841]) {
      throw new Error(type_841 + " is not a valid type");
    } else if (!Types_791[type_841].create) {
      throw new Error("Cannot create a syntax from type " + type_841);
    }
    return Types_791[type_841].create(value_842, stx_843);
  }
  static fromNull() {
    let stx_844 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return Syntax.from("null", null, stx_844);
  }
  static fromNumber(value_845) {
    let stx_846 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("number", value_845, stx_846);
  }
  static fromString(value_847) {
    let stx_848 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("string", value_847, stx_848);
  }
  static fromPunctuator(value_849) {
    let stx_850 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("punctuator", value_849, stx_850);
  }
  static fromKeyword(value_851) {
    let stx_852 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("keyword", value_851, stx_852);
  }
  static fromIdentifier(value_853) {
    let stx_854 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("identifier", value_853, stx_854);
  }
  static fromRegularExpression(value_855) {
    let stx_856 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("regularExpression", value_855, stx_856);
  }
  static fromBraces(inner_857) {
    let stx_858 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("braces", inner_857, stx_858);
  }
  static fromBrackets(inner_859) {
    let stx_860 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("brackets", inner_859, stx_860);
  }
  static fromParens(inner_861) {
    let stx_862 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("parens", inner_861, stx_862);
  }
  resolve(phase_863) {
    (0, _errors.assert)(phase_863 != null, "must provide a phase to resolve");
    let allScopes_864 = this.scopesets.all;
    let stxScopes_865 = this.scopesets.phase.has(phase_863) ? this.scopesets.phase.get(phase_863) : (0, _immutable.List)();
    stxScopes_865 = allScopes_864.concat(stxScopes_865);
    if (stxScopes_865.size === 0 || !(this.match("identifier") || this.match("keyword"))) {
      return this.token.value;
    }
    let scope_866 = stxScopes_865.last();
    let bindings_867 = this.bindings;
    if (scope_866) {
      let scopesetBindingList = bindings_867.get(this);
      if (scopesetBindingList) {
        let biggestBindingPair = scopesetBindingList.filter(_ref => {
          let scopes = _ref.scopes;
          let binding = _ref.binding;

          return scopes.isSubset(stxScopes_865);
        }).sort(sizeDecending_790);
        if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
          let debugBase = "{" + stxScopes_865.map(s_868 => s_868.toString()).join(", ") + "}";
          let debugAmbigousScopesets = biggestBindingPair.map(_ref2 => {
            let scopes = _ref2.scopes;

            return "{" + scopes.map(s_869 => s_869.toString()).join(", ") + "}";
          }).join(", ");
          throw new Error("Scopeset " + debugBase + " has ambiguous subsets " + debugAmbigousScopesets);
        } else if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve(phase_863);
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
      return this.token.items.map(el_870 => {
        if (el_870 instanceof Syntax && el_870.match("delimiter")) {
          return "${...}";
        }
        return el_870.slice.text;
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
  setLineNumber(line_871) {
    let newTok_872 = {};
    if (this.isDelimiter()) {
      newTok_872 = this.token.map(s_873 => s_873.setLineNumber(line_871));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok_872[key] = this.token[key];
      }
      (0, _errors.assert)(newTok_872.slice && newTok_872.slice.startLocation, "all tokens must have line info");
      newTok_872.slice.startLocation.line = line_871;
    }
    return new Syntax(newTok_872, this);
  }
  inner() {
    (0, _errors.assert)(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }
  addScope(scope_874, bindings_875, phase_876) {
    let options_877 = arguments.length <= 3 || arguments[3] === undefined ? { flip: false } : arguments[3];

    let token_878 = this.match("delimiter") ? this.token.map(s_882 => s_882.addScope(scope_874, bindings_875, phase_876, options_877)) : this.token;
    if (this.match("template")) {
      token_878 = { type: this.token.type, items: token_878.items.map(it_883 => {
          if (it_883 instanceof Syntax && it_883.match("delimiter")) {
            return it_883.addScope(scope_874, bindings_875, phase_876, options_877);
          }
          return it_883;
        }) };
    }
    let oldScopeset_879;
    if (phase_876 === ALL_PHASES_792) {
      oldScopeset_879 = this.scopesets.all;
    } else {
      oldScopeset_879 = this.scopesets.phase.has(phase_876) ? this.scopesets.phase.get(phase_876) : (0, _immutable.List)();
    }
    let newScopeset_880;
    if (options_877.flip) {
      let index = oldScopeset_879.indexOf(scope_874);
      if (index !== -1) {
        newScopeset_880 = oldScopeset_879.remove(index);
      } else {
        newScopeset_880 = oldScopeset_879.push(scope_874);
      }
    } else {
      newScopeset_880 = oldScopeset_879.push(scope_874);
    }
    let newstx_881 = { bindings: bindings_875, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    if (phase_876 === ALL_PHASES_792) {
      newstx_881.scopesets.all = newScopeset_880;
    } else {
      newstx_881.scopesets.phase = newstx_881.scopesets.phase.set(phase_876, newScopeset_880);
    }
    return new Syntax(token_878, newstx_881);
  }
  removeScope(scope_884, phase_885) {
    let token_886 = this.match("delimiter") ? this.token.map(s_892 => s_892.removeScope(scope_884, phase_885)) : this.token;
    let phaseScopeset_887 = this.scopesets.phase.has(phase_885) ? this.scopesets.phase.get(phase_885) : (0, _immutable.List)();
    let allScopeset_888 = this.scopesets.all;
    let newstx_889 = { bindings: this.bindings, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    let phaseIndex_890 = phaseScopeset_887.indexOf(scope_884);
    let allIndex_891 = allScopeset_888.indexOf(scope_884);
    if (phaseIndex_890 !== -1) {
      newstx_889.scopesets.phase = this.scopesets.phase.set(phase_885, phaseScopeset_887.remove(phaseIndex_890));
    } else if (allIndex_891 !== -1) {
      newstx_889.scopesets.all = allScopeset_888.remove(allIndex_891);
    }
    return new Syntax(token_886, newstx_889);
  }
  match(type_893, value_894) {
    if (!Types_791[type_893]) {
      throw new Error(type_893 + " is an invalid type");
    }
    return Types_791[type_893].match(this.token) && (value_894 == null || (value_894 instanceof RegExp ? value_894.test(this.val()) : this.val() == value_894));
  }
  isIdentifier(value_895) {
    return this.match("identifier", value_895);
  }
  isAssign(value_896) {
    return this.match("assign", value_896);
  }
  isBooleanLiteral(value_897) {
    return this.match("boolean", value_897);
  }
  isKeyword(value_898) {
    return this.match("keyword", value_898);
  }
  isNullLiteral(value_899) {
    return this.match("null", value_899);
  }
  isNumericLiteral(value_900) {
    return this.match("number", value_900);
  }
  isPunctuator(value_901) {
    return this.match("punctuator", value_901);
  }
  isStringLiteral(value_902) {
    return this.match("string", value_902);
  }
  isRegularExpression(value_903) {
    return this.match("regularExpression", value_903);
  }
  isTemplate(value_904) {
    return this.match("template", value_904);
  }
  isDelimiter(value_905) {
    return this.match("delimiter", value_905);
  }
  isParens(value_906) {
    return this.match("parens", value_906);
  }
  isBraces(value_907) {
    return this.match("braces", value_907);
  }
  isBrackets(value_908) {
    return this.match("brackets", value_908);
  }
  isSyntaxTemplate(value_909) {
    return this.match("syntaxTemplate", value_909);
  }
  isEOF(value_910) {
    return this.match("eof", value_910);
  }
  toString() {
    if (this.match("delimiter")) {
      return this.token.map(s_911 => s_911.toString()).join(" ");
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
exports.Types = Types_791;
exports.ALL_PHASES = ALL_PHASES_792;
//# sourceMappingURL=data:application/json;base64,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IjpbImltcG9ydCB7TGlzdCwgTWFwfSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcFwiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7VG9rZW5UeXBlLCBUb2tlbkNsYXNzfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IEp1c3RfNzg4ID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfNzg5ID0gTWF5YmUuTm90aGluZztcbmZ1bmN0aW9uIHNpemVEZWNlbmRpbmdfNzkwKGFfNzkzLCBiXzc5NCkge1xuICBpZiAoYV83OTMuc2NvcGVzLnNpemUgPiBiXzc5NC5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIGlmIChiXzc5NC5zY29wZXMuc2l6ZSA+IGFfNzkzLnNjb3Blcy5zaXplKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbmxldCBUeXBlc183OTEgPSB7bnVsbDoge21hdGNoOiB0b2tlbl83OTUgPT4gIVR5cGVzXzc5MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fNzk1KSAmJiB0b2tlbl83OTUudHlwZSA9PT0gVG9rZW5UeXBlLk5VTEwsIGNyZWF0ZTogKHZhbHVlXzc5Niwgc3R4Xzc5NykgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTEwsIHZhbHVlOiBudWxsfSwgc3R4Xzc5Nyl9LCBudW1iZXI6IHttYXRjaDogdG9rZW5fNzk4ID0+ICFUeXBlc183OTEuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzc5OCkgJiYgdG9rZW5fNzk4LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuTnVtZXJpY0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzc5OSwgc3R4XzgwMCkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTUJFUiwgdmFsdWU6IHZhbHVlXzc5OX0sIHN0eF84MDApfSwgc3RyaW5nOiB7bWF0Y2g6IHRva2VuXzgwMSA9PiAhVHlwZXNfNzkxLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MDEpICYmIHRva2VuXzgwMS50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlN0cmluZ0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzgwMiwgc3R4XzgwMykgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlNUUklORywgc3RyOiB2YWx1ZV84MDJ9LCBzdHhfODAzKX0sIHB1bmN0dWF0b3I6IHttYXRjaDogdG9rZW5fODA0ID0+ICFUeXBlc183OTEuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgwNCkgJiYgdG9rZW5fODA0LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgY3JlYXRlOiAodmFsdWVfODA1LCBzdHhfODA2KSA9PiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgbmFtZTogdmFsdWVfODA1fSwgdmFsdWU6IHZhbHVlXzgwNX0sIHN0eF84MDYpfSwga2V5d29yZDoge21hdGNoOiB0b2tlbl84MDcgPT4gIVR5cGVzXzc5MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODA3KSAmJiB0b2tlbl84MDcudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5LZXl3b3JkLCBjcmVhdGU6ICh2YWx1ZV84MDgsIHN0eF84MDkpID0+IG5ldyBTeW50YXgoe3R5cGU6IHtrbGFzczogVG9rZW5DbGFzcy5LZXl3b3JkLCBuYW1lOiB2YWx1ZV84MDh9LCB2YWx1ZTogdmFsdWVfODA4fSwgc3R4XzgwOSl9LCBpZGVudGlmaWVyOiB7bWF0Y2g6IHRva2VuXzgxMCA9PiAhVHlwZXNfNzkxLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MTApICYmIHRva2VuXzgxMC50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLklkZW50LCBjcmVhdGU6ICh2YWx1ZV84MTEsIHN0eF84MTIpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLCB2YWx1ZTogdmFsdWVfODExfSwgc3R4XzgxMil9LCByZWd1bGFyRXhwcmVzc2lvbjoge21hdGNoOiB0b2tlbl84MTMgPT4gIVR5cGVzXzc5MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODEzKSAmJiB0b2tlbl84MTMudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5SZWd1bGFyRXhwcmVzc2lvbiwgY3JlYXRlOiAodmFsdWVfODE0LCBzdHhfODE1KSA9PiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkVHRVhQLCB2YWx1ZTogdmFsdWVfODE0fSwgc3R4XzgxNSl9LCBicmFjZXM6IHttYXRjaDogdG9rZW5fODE2ID0+IFR5cGVzXzc5MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODE2KSAmJiB0b2tlbl84MTYuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0UsIGNyZWF0ZTogKGlubmVyXzgxNywgc3R4XzgxOCkgPT4ge1xuICBsZXQgbGVmdF84MTkgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNFLCB2YWx1ZTogXCJ7XCJ9KTtcbiAgbGV0IHJpZ2h0XzgyMCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0UsIHZhbHVlOiBcIn1cIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODE5KS5jb25jYXQoaW5uZXJfODE3KS5wdXNoKHJpZ2h0XzgyMCksIHN0eF84MTgpO1xufX0sIGJyYWNrZXRzOiB7bWF0Y2g6IHRva2VuXzgyMSA9PiBUeXBlc183OTEuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgyMSkgJiYgdG9rZW5fODIxLmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNLLCBjcmVhdGU6IChpbm5lcl84MjIsIHN0eF84MjMpID0+IHtcbiAgbGV0IGxlZnRfODI0ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDSywgdmFsdWU6IFwiW1wifSk7XG4gIGxldCByaWdodF84MjUgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkJSQUNLLCB2YWx1ZTogXCJdXCJ9KTtcbiAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0XzgyNCkuY29uY2F0KGlubmVyXzgyMikucHVzaChyaWdodF84MjUpLCBzdHhfODIzKTtcbn19LCBwYXJlbnM6IHttYXRjaDogdG9rZW5fODI2ID0+IFR5cGVzXzc5MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODI2KSAmJiB0b2tlbl84MjYuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MUEFSRU4sIGNyZWF0ZTogKGlubmVyXzgyNywgc3R4XzgyOCkgPT4ge1xuICBsZXQgbGVmdF84MjkgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTFBBUkVOLCB2YWx1ZTogXCIoXCJ9KTtcbiAgbGV0IHJpZ2h0XzgzMCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SUEFSRU4sIHZhbHVlOiBcIilcIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODI5KS5jb25jYXQoaW5uZXJfODI3KS5wdXNoKHJpZ2h0XzgzMCksIHN0eF84MjgpO1xufX0sIGFzc2lnbjoge21hdGNoOiB0b2tlbl84MzEgPT4ge1xuICBpZiAoVHlwZXNfNzkxLnB1bmN0dWF0b3IubWF0Y2godG9rZW5fODMxKSkge1xuICAgIHN3aXRjaCAodG9rZW5fODMxLnZhbHVlKSB7XG4gICAgICBjYXNlIFwiPVwiOlxuICAgICAgY2FzZSBcInw9XCI6XG4gICAgICBjYXNlIFwiXj1cIjpcbiAgICAgIGNhc2UgXCImPVwiOlxuICAgICAgY2FzZSBcIjw8PVwiOlxuICAgICAgY2FzZSBcIj4+PVwiOlxuICAgICAgY2FzZSBcIj4+Pj1cIjpcbiAgICAgIGNhc2UgXCIrPVwiOlxuICAgICAgY2FzZSBcIi09XCI6XG4gICAgICBjYXNlIFwiKj1cIjpcbiAgICAgIGNhc2UgXCIvPVwiOlxuICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59fSwgYm9vbGVhbjoge21hdGNoOiB0b2tlbl84MzIgPT4gIVR5cGVzXzc5MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODMyKSAmJiB0b2tlbl84MzIudHlwZSA9PT0gVG9rZW5UeXBlLlRSVUUgfHwgdG9rZW5fODMyLnR5cGUgPT09IFRva2VuVHlwZS5GQUxTRX0sIHRlbXBsYXRlOiB7bWF0Y2g6IHRva2VuXzgzMyA9PiAhVHlwZXNfNzkxLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MzMpICYmIHRva2VuXzgzMy50eXBlID09PSBUb2tlblR5cGUuVEVNUExBVEV9LCBkZWxpbWl0ZXI6IHttYXRjaDogdG9rZW5fODM0ID0+IExpc3QuaXNMaXN0KHRva2VuXzgzNCl9LCBzeW50YXhUZW1wbGF0ZToge21hdGNoOiB0b2tlbl84MzUgPT4gVHlwZXNfNzkxLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MzUpICYmIHRva2VuXzgzNS5nZXQoMCkudmFsKCkgPT09IFwiI2BcIn0sIGVvZjoge21hdGNoOiB0b2tlbl84MzYgPT4gIVR5cGVzXzc5MS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODM2KSAmJiB0b2tlbl84MzYudHlwZSA9PT0gVG9rZW5UeXBlLkVPU319O1xuO1xuY29uc3QgQUxMX1BIQVNFU183OTIgPSB7fTtcbjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bnRheCB7XG4gIGNvbnN0cnVjdG9yKHRva2VuXzgzNywgb2xkc3R4XzgzOCA9IHt9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuXzgzNztcbiAgICB0aGlzLmJpbmRpbmdzID0gb2xkc3R4XzgzOC5iaW5kaW5ncyAhPSBudWxsID8gb2xkc3R4XzgzOC5iaW5kaW5ncyA6IG5ldyBCaW5kaW5nTWFwO1xuICAgIHRoaXMuc2NvcGVzZXRzID0gb2xkc3R4XzgzOC5zY29wZXNldHMgIT0gbnVsbCA/IG9sZHN0eF84Mzguc2NvcGVzZXRzIDoge2FsbDogTGlzdCgpLCBwaGFzZTogTWFwKCl9O1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgc3RhdGljIG9mKHRva2VuXzgzOSwgc3R4Xzg0MCA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fODM5LCBzdHhfODQwKTtcbiAgfVxuICBzdGF0aWMgZnJvbSh0eXBlXzg0MSwgdmFsdWVfODQyLCBzdHhfODQzID0ge30pIHtcbiAgICBpZiAoIVR5cGVzXzc5MVt0eXBlXzg0MV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzg0MSArIFwiIGlzIG5vdCBhIHZhbGlkIHR5cGVcIik7XG4gICAgfSBlbHNlIGlmICghVHlwZXNfNzkxW3R5cGVfODQxXS5jcmVhdGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgYSBzeW50YXggZnJvbSB0eXBlIFwiICsgdHlwZV84NDEpO1xuICAgIH1cbiAgICByZXR1cm4gVHlwZXNfNzkxW3R5cGVfODQxXS5jcmVhdGUodmFsdWVfODQyLCBzdHhfODQzKTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bGwoc3R4Xzg0NCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwibnVsbFwiLCBudWxsLCBzdHhfODQ0KTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bWJlcih2YWx1ZV84NDUsIHN0eF84NDYgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcIm51bWJlclwiLCB2YWx1ZV84NDUsIHN0eF84NDYpO1xuICB9XG4gIHN0YXRpYyBmcm9tU3RyaW5nKHZhbHVlXzg0Nywgc3R4Xzg0OCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwic3RyaW5nXCIsIHZhbHVlXzg0Nywgc3R4Xzg0OCk7XG4gIH1cbiAgc3RhdGljIGZyb21QdW5jdHVhdG9yKHZhbHVlXzg0OSwgc3R4Xzg1MCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwicHVuY3R1YXRvclwiLCB2YWx1ZV84NDksIHN0eF84NTApO1xuICB9XG4gIHN0YXRpYyBmcm9tS2V5d29yZCh2YWx1ZV84NTEsIHN0eF84NTIgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImtleXdvcmRcIiwgdmFsdWVfODUxLCBzdHhfODUyKTtcbiAgfVxuICBzdGF0aWMgZnJvbUlkZW50aWZpZXIodmFsdWVfODUzLCBzdHhfODU0ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJpZGVudGlmaWVyXCIsIHZhbHVlXzg1Mywgc3R4Xzg1NCk7XG4gIH1cbiAgc3RhdGljIGZyb21SZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV84NTUsIHN0eF84NTYgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbHVlXzg1NSwgc3R4Xzg1Nik7XG4gIH1cbiAgc3RhdGljIGZyb21CcmFjZXMoaW5uZXJfODU3LCBzdHhfODU4ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJicmFjZXNcIiwgaW5uZXJfODU3LCBzdHhfODU4KTtcbiAgfVxuICBzdGF0aWMgZnJvbUJyYWNrZXRzKGlubmVyXzg1OSwgc3R4Xzg2MCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwiYnJhY2tldHNcIiwgaW5uZXJfODU5LCBzdHhfODYwKTtcbiAgfVxuICBzdGF0aWMgZnJvbVBhcmVucyhpbm5lcl84NjEsIHN0eF84NjIgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInBhcmVuc1wiLCBpbm5lcl84NjEsIHN0eF84NjIpO1xuICB9XG4gIHJlc29sdmUocGhhc2VfODYzKSB7XG4gICAgYXNzZXJ0KHBoYXNlXzg2MyAhPSBudWxsLCBcIm11c3QgcHJvdmlkZSBhIHBoYXNlIHRvIHJlc29sdmVcIik7XG4gICAgbGV0IGFsbFNjb3Blc184NjQgPSB0aGlzLnNjb3Blc2V0cy5hbGw7XG4gICAgbGV0IHN0eFNjb3Blc184NjUgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfODYzKSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV84NjMpIDogTGlzdCgpO1xuICAgIHN0eFNjb3Blc184NjUgPSBhbGxTY29wZXNfODY0LmNvbmNhdChzdHhTY29wZXNfODY1KTtcbiAgICBpZiAoc3R4U2NvcGVzXzg2NS5zaXplID09PSAwIHx8ICEodGhpcy5tYXRjaChcImlkZW50aWZpZXJcIikgfHwgdGhpcy5tYXRjaChcImtleXdvcmRcIikpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgICB9XG4gICAgbGV0IHNjb3BlXzg2NiA9IHN0eFNjb3Blc184NjUubGFzdCgpO1xuICAgIGxldCBiaW5kaW5nc184NjcgPSB0aGlzLmJpbmRpbmdzO1xuICAgIGlmIChzY29wZV84NjYpIHtcbiAgICAgIGxldCBzY29wZXNldEJpbmRpbmdMaXN0ID0gYmluZGluZ3NfODY3LmdldCh0aGlzKTtcbiAgICAgIGlmIChzY29wZXNldEJpbmRpbmdMaXN0KSB7XG4gICAgICAgIGxldCBiaWdnZXN0QmluZGluZ1BhaXIgPSBzY29wZXNldEJpbmRpbmdMaXN0LmZpbHRlcigoe3Njb3BlcywgYmluZGluZ30pID0+IHtcbiAgICAgICAgICByZXR1cm4gc2NvcGVzLmlzU3Vic2V0KHN0eFNjb3Blc184NjUpO1xuICAgICAgICB9KS5zb3J0KHNpemVEZWNlbmRpbmdfNzkwKTtcbiAgICAgICAgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplID49IDIgJiYgYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5zY29wZXMuc2l6ZSA9PT0gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgxKS5zY29wZXMuc2l6ZSkge1xuICAgICAgICAgIGxldCBkZWJ1Z0Jhc2UgPSBcIntcIiArIHN0eFNjb3Blc184NjUubWFwKHNfODY4ID0+IHNfODY4LnRvU3RyaW5nKCkpLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuICAgICAgICAgIGxldCBkZWJ1Z0FtYmlnb3VzU2NvcGVzZXRzID0gYmlnZ2VzdEJpbmRpbmdQYWlyLm1hcCgoe3Njb3Blc30pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBcIntcIiArIHNjb3Blcy5tYXAoc184NjkgPT4gc184NjkudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgfSkuam9pbihcIiwgXCIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjb3Blc2V0IFwiICsgZGVidWdCYXNlICsgXCIgaGFzIGFtYmlndW91cyBzdWJzZXRzIFwiICsgZGVidWdBbWJpZ291c1Njb3Blc2V0cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmlnZ2VzdEJpbmRpbmdQYWlyLnNpemUgIT09IDApIHtcbiAgICAgICAgICBsZXQgYmluZGluZ1N0ciA9IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYmluZGluZy50b1N0cmluZygpO1xuICAgICAgICAgIGlmIChNYXliZS5pc0p1c3QoYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcykpIHtcbiAgICAgICAgICAgIHJldHVybiBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzLmdldE9yRWxzZShudWxsKS5yZXNvbHZlKHBoYXNlXzg2Myk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiaW5kaW5nU3RyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIHZhbCgpIHtcbiAgICBhc3NlcnQoIXRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2Fubm90IGdldCB0aGUgdmFsIG9mIGEgZGVsaW1pdGVyXCIpO1xuICAgIGlmICh0aGlzLm1hdGNoKFwic3RyaW5nXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zdHI7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLml0ZW1zLm1hcChlbF84NzAgPT4ge1xuICAgICAgICBpZiAoZWxfODcwIGluc3RhbmNlb2YgU3ludGF4ICYmIGVsXzg3MC5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgICAgICAgIHJldHVybiBcIiR7Li4ufVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbF84NzAuc2xpY2UudGV4dDtcbiAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIGxpbmVOdW1iZXIoKSB7XG4gICAgaWYgKCF0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZS5zdGFydExvY2F0aW9uLmxpbmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLmdldCgwKS5saW5lTnVtYmVyKCk7XG4gICAgfVxuICB9XG4gIHNldExpbmVOdW1iZXIobGluZV84NzEpIHtcbiAgICBsZXQgbmV3VG9rXzg3MiA9IHt9O1xuICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIG5ld1Rva184NzIgPSB0aGlzLnRva2VuLm1hcChzXzg3MyA9PiBzXzg3My5zZXRMaW5lTnVtYmVyKGxpbmVfODcxKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLnRva2VuKSkge1xuICAgICAgICBuZXdUb2tfODcyW2tleV0gPSB0aGlzLnRva2VuW2tleV07XG4gICAgICB9XG4gICAgICBhc3NlcnQobmV3VG9rXzg3Mi5zbGljZSAmJiBuZXdUb2tfODcyLnNsaWNlLnN0YXJ0TG9jYXRpb24sIFwiYWxsIHRva2VucyBtdXN0IGhhdmUgbGluZSBpbmZvXCIpO1xuICAgICAgbmV3VG9rXzg3Mi5zbGljZS5zdGFydExvY2F0aW9uLmxpbmUgPSBsaW5lXzg3MTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTeW50YXgobmV3VG9rXzg3MiwgdGhpcyk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgYXNzZXJ0KHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2FuIG9ubHkgZ2V0IHRoZSBpbm5lciBvZiBhIGRlbGltaXRlclwiKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZSgxLCB0aGlzLnRva2VuLnNpemUgLSAxKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV84NzQsIGJpbmRpbmdzXzg3NSwgcGhhc2VfODc2LCBvcHRpb25zXzg3NyA9IHtmbGlwOiBmYWxzZX0pIHtcbiAgICBsZXQgdG9rZW5fODc4ID0gdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSA/IHRoaXMudG9rZW4ubWFwKHNfODgyID0+IHNfODgyLmFkZFNjb3BlKHNjb3BlXzg3NCwgYmluZGluZ3NfODc1LCBwaGFzZV84NzYsIG9wdGlvbnNfODc3KSkgOiB0aGlzLnRva2VuO1xuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHRva2VuXzg3OCA9IHt0eXBlOiB0aGlzLnRva2VuLnR5cGUsIGl0ZW1zOiB0b2tlbl84NzguaXRlbXMubWFwKGl0Xzg4MyA9PiB7XG4gICAgICAgIGlmIChpdF84ODMgaW5zdGFuY2VvZiBTeW50YXggJiYgaXRfODgzLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGl0Xzg4My5hZGRTY29wZShzY29wZV84NzQsIGJpbmRpbmdzXzg3NSwgcGhhc2VfODc2LCBvcHRpb25zXzg3Nyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0Xzg4MztcbiAgICAgIH0pfTtcbiAgICB9XG4gICAgbGV0IG9sZFNjb3Blc2V0Xzg3OTtcbiAgICBpZiAocGhhc2VfODc2ID09PSBBTExfUEhBU0VTXzc5Mikge1xuICAgICAgb2xkU2NvcGVzZXRfODc5ID0gdGhpcy5zY29wZXNldHMuYWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbGRTY29wZXNldF84NzkgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfODc2KSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV84NzYpIDogTGlzdCgpO1xuICAgIH1cbiAgICBsZXQgbmV3U2NvcGVzZXRfODgwO1xuICAgIGlmIChvcHRpb25zXzg3Ny5mbGlwKSB7XG4gICAgICBsZXQgaW5kZXggPSBvbGRTY29wZXNldF84NzkuaW5kZXhPZihzY29wZV84NzQpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBuZXdTY29wZXNldF84ODAgPSBvbGRTY29wZXNldF84NzkucmVtb3ZlKGluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Njb3Blc2V0Xzg4MCA9IG9sZFNjb3Blc2V0Xzg3OS5wdXNoKHNjb3BlXzg3NCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1Njb3Blc2V0Xzg4MCA9IG9sZFNjb3Blc2V0Xzg3OS5wdXNoKHNjb3BlXzg3NCk7XG4gICAgfVxuICAgIGxldCBuZXdzdHhfODgxID0ge2JpbmRpbmdzOiBiaW5kaW5nc184NzUsIHNjb3Blc2V0czoge2FsbDogdGhpcy5zY29wZXNldHMuYWxsLCBwaGFzZTogdGhpcy5zY29wZXNldHMucGhhc2V9fTtcbiAgICBpZiAocGhhc2VfODc2ID09PSBBTExfUEhBU0VTXzc5Mikge1xuICAgICAgbmV3c3R4Xzg4MS5zY29wZXNldHMuYWxsID0gbmV3U2NvcGVzZXRfODgwO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdzdHhfODgxLnNjb3Blc2V0cy5waGFzZSA9IG5ld3N0eF84ODEuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZV84NzYsIG5ld1Njb3Blc2V0Xzg4MCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzg3OCwgbmV3c3R4Xzg4MSk7XG4gIH1cbiAgcmVtb3ZlU2NvcGUoc2NvcGVfODg0LCBwaGFzZV84ODUpIHtcbiAgICBsZXQgdG9rZW5fODg2ID0gdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSA/IHRoaXMudG9rZW4ubWFwKHNfODkyID0+IHNfODkyLnJlbW92ZVNjb3BlKHNjb3BlXzg4NCwgcGhhc2VfODg1KSkgOiB0aGlzLnRva2VuO1xuICAgIGxldCBwaGFzZVNjb3Blc2V0Xzg4NyA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmhhcyhwaGFzZV84ODUpID8gdGhpcy5zY29wZXNldHMucGhhc2UuZ2V0KHBoYXNlXzg4NSkgOiBMaXN0KCk7XG4gICAgbGV0IGFsbFNjb3Blc2V0Xzg4OCA9IHRoaXMuc2NvcGVzZXRzLmFsbDtcbiAgICBsZXQgbmV3c3R4Xzg4OSA9IHtiaW5kaW5nczogdGhpcy5iaW5kaW5ncywgc2NvcGVzZXRzOiB7YWxsOiB0aGlzLnNjb3Blc2V0cy5hbGwsIHBoYXNlOiB0aGlzLnNjb3Blc2V0cy5waGFzZX19O1xuICAgIGxldCBwaGFzZUluZGV4Xzg5MCA9IHBoYXNlU2NvcGVzZXRfODg3LmluZGV4T2Yoc2NvcGVfODg0KTtcbiAgICBsZXQgYWxsSW5kZXhfODkxID0gYWxsU2NvcGVzZXRfODg4LmluZGV4T2Yoc2NvcGVfODg0KTtcbiAgICBpZiAocGhhc2VJbmRleF84OTAgIT09IC0xKSB7XG4gICAgICBuZXdzdHhfODg5LnNjb3Blc2V0cy5waGFzZSA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZV84ODUsIHBoYXNlU2NvcGVzZXRfODg3LnJlbW92ZShwaGFzZUluZGV4Xzg5MCkpO1xuICAgIH0gZWxzZSBpZiAoYWxsSW5kZXhfODkxICE9PSAtMSkge1xuICAgICAgbmV3c3R4Xzg4OS5zY29wZXNldHMuYWxsID0gYWxsU2NvcGVzZXRfODg4LnJlbW92ZShhbGxJbmRleF84OTEpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl84ODYsIG5ld3N0eF84ODkpO1xuICB9XG4gIG1hdGNoKHR5cGVfODkzLCB2YWx1ZV84OTQpIHtcbiAgICBpZiAoIVR5cGVzXzc5MVt0eXBlXzg5M10pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzg5MyArIFwiIGlzIGFuIGludmFsaWQgdHlwZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIFR5cGVzXzc5MVt0eXBlXzg5M10ubWF0Y2godGhpcy50b2tlbikgJiYgKHZhbHVlXzg5NCA9PSBudWxsIHx8ICh2YWx1ZV84OTQgaW5zdGFuY2VvZiBSZWdFeHAgPyB2YWx1ZV84OTQudGVzdCh0aGlzLnZhbCgpKSA6IHRoaXMudmFsKCkgPT0gdmFsdWVfODk0KSk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzg5NSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiLCB2YWx1ZV84OTUpO1xuICB9XG4gIGlzQXNzaWduKHZhbHVlXzg5Nikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlXzg5Nik7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh2YWx1ZV84OTcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWVfODk3KTtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfODk4KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJrZXl3b3JkXCIsIHZhbHVlXzg5OCk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZV84OTkpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bGxcIiwgdmFsdWVfODk5KTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHZhbHVlXzkwMCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlXzkwMCk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHZhbHVlXzkwMSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicHVuY3R1YXRvclwiLCB2YWx1ZV85MDEpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV85MDIpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN0cmluZ1wiLCB2YWx1ZV85MDIpO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odmFsdWVfOTAzKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV85MDMpO1xuICB9XG4gIGlzVGVtcGxhdGUodmFsdWVfOTA0KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiLCB2YWx1ZV85MDQpO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzkwNSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIsIHZhbHVlXzkwNSk7XG4gIH1cbiAgaXNQYXJlbnModmFsdWVfOTA2KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWVfOTA2KTtcbiAgfVxuICBpc0JyYWNlcyh2YWx1ZV85MDcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNlc1wiLCB2YWx1ZV85MDcpO1xuICB9XG4gIGlzQnJhY2tldHModmFsdWVfOTA4KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFja2V0c1wiLCB2YWx1ZV85MDgpO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUodmFsdWVfOTA5KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZV85MDkpO1xuICB9XG4gIGlzRU9GKHZhbHVlXzkxMCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZW9mXCIsIHZhbHVlXzkxMCk7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLm1hcChzXzkxMSA9PiBzXzkxMS50b1N0cmluZygpKS5qb2luKFwiIFwiKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJzdHJpbmdcIikpIHtcbiAgICAgIHJldHVybiBcIidcIiArIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcInRlbXBsYXRlXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbn1cbmV4cG9ydCB7VHlwZXNfNzkxIGFzIFR5cGVzfTtcbmV4cG9ydCB7QUxMX1BIQVNFU183OTIgYXMgQUxMX1BIQVNFU30iXX0=