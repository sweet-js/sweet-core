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

const Just_825 = _ramdaFantasy.Maybe.Just;
const Nothing_826 = _ramdaFantasy.Maybe.Nothing;
function sizeDecending_827(a_830, b_831) {
  if (a_830.scopes.size > b_831.scopes.size) {
    return -1;
  } else if (b_831.scopes.size > a_830.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}
let Types_828 = { null: { match: token_832 => !Types_828.delimiter.match(token_832) && token_832.type === _tokenizer.TokenType.NULL, create: (value_833, stx_834) => new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_834) }, number: { match: token_835 => !Types_828.delimiter.match(token_835) && token_835.type.klass === _tokenizer.TokenClass.NumericLiteral, create: (value_836, stx_837) => new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_836 }, stx_837) }, string: { match: token_838 => !Types_828.delimiter.match(token_838) && token_838.type.klass === _tokenizer.TokenClass.StringLiteral, create: (value_839, stx_840) => new Syntax({ type: _tokenizer.TokenType.STRING, str: value_839 }, stx_840) }, punctuator: { match: token_841 => !Types_828.delimiter.match(token_841) && token_841.type.klass === _tokenizer.TokenClass.Punctuator, create: (value_842, stx_843) => new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_842 }, value: value_842 }, stx_843) }, keyword: { match: token_844 => !Types_828.delimiter.match(token_844) && token_844.type.klass === _tokenizer.TokenClass.Keyword, create: (value_845, stx_846) => new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_845 }, value: value_845 }, stx_846) }, identifier: { match: token_847 => !Types_828.delimiter.match(token_847) && token_847.type.klass === _tokenizer.TokenClass.Ident, create: (value_848, stx_849) => new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_848 }, stx_849) }, regularExpression: { match: token_850 => !Types_828.delimiter.match(token_850) && token_850.type.klass === _tokenizer.TokenClass.RegularExpression, create: (value_851, stx_852) => new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_851 }, stx_852) }, braces: { match: token_853 => Types_828.delimiter.match(token_853) && token_853.get(0).token.type === _tokenizer.TokenType.LBRACE, create: (inner_854, stx_855) => {
      let left_856 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });
      let right_857 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });
      return new Syntax(_immutable.List.of(left_856).concat(inner_854).push(right_857), stx_855);
    } }, brackets: { match: token_858 => Types_828.delimiter.match(token_858) && token_858.get(0).token.type === _tokenizer.TokenType.LBRACK, create: (inner_859, stx_860) => {
      let left_861 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });
      let right_862 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });
      return new Syntax(_immutable.List.of(left_861).concat(inner_859).push(right_862), stx_860);
    } }, parens: { match: token_863 => Types_828.delimiter.match(token_863) && token_863.get(0).token.type === _tokenizer.TokenType.LPAREN, create: (inner_864, stx_865) => {
      let left_866 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });
      let right_867 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });
      return new Syntax(_immutable.List.of(left_866).concat(inner_864).push(right_867), stx_865);
    } }, assign: { match: token_868 => {
      if (Types_828.punctuator.match(token_868)) {
        switch (token_868.value) {
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
    } }, boolean: { match: token_869 => !Types_828.delimiter.match(token_869) && token_869.type === _tokenizer.TokenType.TRUE || token_869.type === _tokenizer.TokenType.FALSE }, template: { match: token_870 => !Types_828.delimiter.match(token_870) && token_870.type === _tokenizer.TokenType.TEMPLATE }, delimiter: { match: token_871 => _immutable.List.isList(token_871) }, syntaxTemplate: { match: token_872 => Types_828.delimiter.match(token_872) && token_872.get(0).val() === "#`" }, eof: { match: token_873 => !Types_828.delimiter.match(token_873) && token_873.type === _tokenizer.TokenType.EOS } };
;
const ALL_PHASES_829 = {};
;
class Syntax {
  constructor(token_874) {
    let oldstx_875 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.token = token_874;
    this.bindings = oldstx_875.bindings != null ? oldstx_875.bindings : new _bindingMap2.default();
    this.scopesets = oldstx_875.scopesets != null ? oldstx_875.scopesets : { all: (0, _immutable.List)(), phase: (0, _immutable.Map)() };
    Object.freeze(this);
  }
  static of(token_876) {
    let stx_877 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Syntax(token_876, stx_877);
  }
  static from(type_878, value_879) {
    let stx_880 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!Types_828[type_878]) {
      throw new Error(type_878 + " is not a valid type");
    } else if (!Types_828[type_878].create) {
      throw new Error("Cannot create a syntax from type " + type_878);
    }
    return Types_828[type_878].create(value_879, stx_880);
  }
  from(type_881, value_882) {
    return Syntax.from(type_881, value_882, this);
  }
  fromNull() {
    return this.from("null", null);
  }
  fromNumber(value_883) {
    return this.from("number", value_883);
  }
  fromString(value_884) {
    return this.from("string", value_884);
  }
  fromPunctuator(value_885) {
    return this.from("punctuator", value_885);
  }
  fromKeyword(value_886) {
    return this.from("keyword");
  }
  fromIdentifier(value_887) {
    return this.from("identifier", value_887);
  }
  fromRegularExpression(value_888) {
    return this.from("regularExpression", value_888);
  }
  fromBraces(inner_889) {
    return this.from("braces", inner_889);
  }
  fromBrackets(inner_890) {
    return this.from("brackets", inner_890);
  }
  fromParens(inner_891) {
    return this.from("parens", inner_891);
  }
  static fromNull() {
    let stx_892 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return Syntax.from("null", null, stx_892);
  }
  static fromNumber(value_893) {
    let stx_894 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("number", value_893, stx_894);
  }
  static fromString(value_895) {
    let stx_896 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("string", value_895, stx_896);
  }
  static fromPunctuator(value_897) {
    let stx_898 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("punctuator", value_897, stx_898);
  }
  static fromKeyword(value_899) {
    let stx_900 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("keyword", value_899, stx_900);
  }
  static fromIdentifier(value_901) {
    let stx_902 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("identifier", value_901, stx_902);
  }
  static fromRegularExpression(value_903) {
    let stx_904 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("regularExpression", value_903, stx_904);
  }
  static fromBraces(inner_905) {
    let stx_906 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("braces", inner_905, stx_906);
  }
  static fromBrackets(inner_907) {
    let stx_908 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("brackets", inner_907, stx_908);
  }
  static fromParens(inner_909) {
    let stx_910 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("parens", inner_909, stx_910);
  }
  resolve(phase_911) {
    (0, _errors.assert)(phase_911 != null, "must provide a phase to resolve");
    let allScopes_912 = this.scopesets.all;
    let stxScopes_913 = this.scopesets.phase.has(phase_911) ? this.scopesets.phase.get(phase_911) : (0, _immutable.List)();
    stxScopes_913 = allScopes_912.concat(stxScopes_913);
    if (stxScopes_913.size === 0 || !(this.match("identifier") || this.match("keyword"))) {
      return this.token.value;
    }
    let scope_914 = stxScopes_913.last();
    let bindings_915 = this.bindings;
    if (scope_914) {
      let scopesetBindingList = bindings_915.get(this);
      if (scopesetBindingList) {
        let biggestBindingPair = scopesetBindingList.filter(_ref => {
          let scopes = _ref.scopes;
          let binding = _ref.binding;

          return scopes.isSubset(stxScopes_913);
        }).sort(sizeDecending_827);
        if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
          let debugBase = "{" + stxScopes_913.map(s_916 => s_916.toString()).join(", ") + "}";
          let debugAmbigousScopesets = biggestBindingPair.map(_ref2 => {
            let scopes = _ref2.scopes;

            return "{" + scopes.map(s_917 => s_917.toString()).join(", ") + "}";
          }).join(", ");
          throw new Error("Scopeset " + debugBase + " has ambiguous subsets " + debugAmbigousScopesets);
        } else if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve(phase_911);
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
      return this.token.items.map(el_918 => {
        if (typeof el_918.match === "function" && el_918.match("delimiter")) {
          return "${...}";
        }
        return el_918.slice.text;
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
  setLineNumber(line_919) {
    let newTok_920 = {};
    if (this.isDelimiter()) {
      newTok_920 = this.token.map(s_921 => s_921.setLineNumber(line_919));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok_920[key] = this.token[key];
      }
      (0, _errors.assert)(newTok_920.slice && newTok_920.slice.startLocation, "all tokens must have line info");
      newTok_920.slice.startLocation.line = line_919;
    }
    return new Syntax(newTok_920, this);
  }
  inner() {
    (0, _errors.assert)(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }
  addScope(scope_922, bindings_923, phase_924) {
    let options_925 = arguments.length <= 3 || arguments[3] === undefined ? { flip: false } : arguments[3];

    let token_926 = this.match("delimiter") ? this.token.map(s_930 => s_930.addScope(scope_922, bindings_923, phase_924, options_925)) : this.token;
    if (this.match("template")) {
      token_926 = _.merge(token_926, { items: token_926.items.map(it_931 => {
          if (it_931 instanceof Syntax && it_931.match("delimiter")) {
            return it_931.addScope(scope_922, bindings_923, phase_924, options_925);
          }
          return it_931;
        }) });
    }
    let oldScopeset_927;
    if (phase_924 === ALL_PHASES_829) {
      oldScopeset_927 = this.scopesets.all;
    } else {
      oldScopeset_927 = this.scopesets.phase.has(phase_924) ? this.scopesets.phase.get(phase_924) : (0, _immutable.List)();
    }
    let newScopeset_928;
    if (options_925.flip) {
      let index = oldScopeset_927.indexOf(scope_922);
      if (index !== -1) {
        newScopeset_928 = oldScopeset_927.remove(index);
      } else {
        newScopeset_928 = oldScopeset_927.push(scope_922);
      }
    } else {
      newScopeset_928 = oldScopeset_927.push(scope_922);
    }
    let newstx_929 = { bindings: bindings_923, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    if (phase_924 === ALL_PHASES_829) {
      newstx_929.scopesets.all = newScopeset_928;
    } else {
      newstx_929.scopesets.phase = newstx_929.scopesets.phase.set(phase_924, newScopeset_928);
    }
    return new Syntax(token_926, newstx_929);
  }
  removeScope(scope_932, phase_933) {
    let token_934 = this.match("delimiter") ? this.token.map(s_940 => s_940.removeScope(scope_932, phase_933)) : this.token;
    let phaseScopeset_935 = this.scopesets.phase.has(phase_933) ? this.scopesets.phase.get(phase_933) : (0, _immutable.List)();
    let allScopeset_936 = this.scopesets.all;
    let newstx_937 = { bindings: this.bindings, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    let phaseIndex_938 = phaseScopeset_935.indexOf(scope_932);
    let allIndex_939 = allScopeset_936.indexOf(scope_932);
    if (phaseIndex_938 !== -1) {
      newstx_937.scopesets.phase = this.scopesets.phase.set(phase_933, phaseScopeset_935.remove(phaseIndex_938));
    } else if (allIndex_939 !== -1) {
      newstx_937.scopesets.all = allScopeset_936.remove(allIndex_939);
    }
    return new Syntax(token_934, newstx_937);
  }
  match(type_941, value_942) {
    if (!Types_828[type_941]) {
      throw new Error(type_941 + " is an invalid type");
    }
    return Types_828[type_941].match(this.token) && (value_942 == null || (value_942 instanceof RegExp ? value_942.test(this.val()) : this.val() == value_942));
  }
  isIdentifier(value_943) {
    return this.match("identifier", value_943);
  }
  isAssign(value_944) {
    return this.match("assign", value_944);
  }
  isBooleanLiteral(value_945) {
    return this.match("boolean", value_945);
  }
  isKeyword(value_946) {
    return this.match("keyword", value_946);
  }
  isNullLiteral(value_947) {
    return this.match("null", value_947);
  }
  isNumericLiteral(value_948) {
    return this.match("number", value_948);
  }
  isPunctuator(value_949) {
    return this.match("punctuator", value_949);
  }
  isStringLiteral(value_950) {
    return this.match("string", value_950);
  }
  isRegularExpression(value_951) {
    return this.match("regularExpression", value_951);
  }
  isTemplate(value_952) {
    return this.match("template", value_952);
  }
  isDelimiter(value_953) {
    return this.match("delimiter", value_953);
  }
  isParens(value_954) {
    return this.match("parens", value_954);
  }
  isBraces(value_955) {
    return this.match("braces", value_955);
  }
  isBrackets(value_956) {
    return this.match("brackets", value_956);
  }
  isSyntaxTemplate(value_957) {
    return this.match("syntaxTemplate", value_957);
  }
  isEOF(value_958) {
    return this.match("eof", value_958);
  }
  toString() {
    if (this.match("delimiter")) {
      return this.token.map(s_959 => s_959.toString()).join(" ");
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
exports.Types = Types_828;
exports.ALL_PHASES = ALL_PHASES_829;
//# sourceMappingURL=data:application/json;base64,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TyxLQUFLLEtBQUwsQ0FBVyxXQUFYLEVBQXdCLFNBQXhCLENBQVA7QUFDRDtBQUNELFdBQVMsU0FBVCxFQUFvQjtBQUNsQixXQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFBcUIsU0FBckIsQ0FBUDtBQUNEO0FBQ0QsV0FBUyxTQUFULEVBQW9CO0FBQ2xCLFdBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxFQUFxQixTQUFyQixDQUFQO0FBQ0Q7QUFDRCxhQUFXLFNBQVgsRUFBc0I7QUFDcEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxVQUFYLEVBQXVCLFNBQXZCLENBQVA7QUFDRDtBQUNELG1CQUFpQixTQUFqQixFQUE0QjtBQUMxQixXQUFPLEtBQUssS0FBTCxDQUFXLGdCQUFYLEVBQTZCLFNBQTdCLENBQVA7QUFDRDtBQUNELFFBQU0sU0FBTixFQUFpQjtBQUNmLFdBQU8sS0FBSyxLQUFMLENBQVcsS0FBWCxFQUFrQixTQUFsQixDQUFQO0FBQ0Q7QUFDRCxhQUFXO0FBQ1QsUUFBSSxLQUFLLEtBQUwsQ0FBVyxXQUFYLENBQUosRUFBNkI7QUFDM0IsYUFBTyxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsU0FBUyxNQUFNLFFBQU4sRUFBeEIsRUFBMEMsSUFBMUMsQ0FBK0MsR0FBL0MsQ0FBUDtBQUNEO0FBQ0QsUUFBSSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQUosRUFBMEI7QUFDeEIsYUFBTyxNQUFNLEtBQUssS0FBTCxDQUFXLEdBQXhCO0FBQ0Q7QUFDRCxRQUFJLEtBQUssS0FBTCxDQUFXLFVBQVgsQ0FBSixFQUE0QjtBQUMxQixhQUFPLEtBQUssR0FBTCxFQUFQO0FBQ0Q7QUFDRCxXQUFPLEtBQUssS0FBTCxDQUFXLEtBQWxCO0FBQ0Q7QUEzUXlCO2tCQUFQLE07UUE2UUEsSyxHQUFiLFM7UUFDa0IsVSxHQUFsQixjIiwiZmlsZSI6InN5bnRheC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdCwgTWFwfSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcFwiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7VG9rZW5UeXBlLCBUb2tlbkNsYXNzfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IEp1c3RfODI1ID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfODI2ID0gTWF5YmUuTm90aGluZztcbmZ1bmN0aW9uIHNpemVEZWNlbmRpbmdfODI3KGFfODMwLCBiXzgzMSkge1xuICBpZiAoYV84MzAuc2NvcGVzLnNpemUgPiBiXzgzMS5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIGlmIChiXzgzMS5zY29wZXMuc2l6ZSA+IGFfODMwLnNjb3Blcy5zaXplKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbmxldCBUeXBlc184MjggPSB7bnVsbDoge21hdGNoOiB0b2tlbl84MzIgPT4gIVR5cGVzXzgyOC5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODMyKSAmJiB0b2tlbl84MzIudHlwZSA9PT0gVG9rZW5UeXBlLk5VTEwsIGNyZWF0ZTogKHZhbHVlXzgzMywgc3R4XzgzNCkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTEwsIHZhbHVlOiBudWxsfSwgc3R4XzgzNCl9LCBudW1iZXI6IHttYXRjaDogdG9rZW5fODM1ID0+ICFUeXBlc184MjguZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgzNSkgJiYgdG9rZW5fODM1LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuTnVtZXJpY0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzgzNiwgc3R4XzgzNykgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTUJFUiwgdmFsdWU6IHZhbHVlXzgzNn0sIHN0eF84MzcpfSwgc3RyaW5nOiB7bWF0Y2g6IHRva2VuXzgzOCA9PiAhVHlwZXNfODI4LmRlbGltaXRlci5tYXRjaCh0b2tlbl84MzgpICYmIHRva2VuXzgzOC50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlN0cmluZ0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzgzOSwgc3R4Xzg0MCkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlNUUklORywgc3RyOiB2YWx1ZV84Mzl9LCBzdHhfODQwKX0sIHB1bmN0dWF0b3I6IHttYXRjaDogdG9rZW5fODQxID0+ICFUeXBlc184MjguZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg0MSkgJiYgdG9rZW5fODQxLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgY3JlYXRlOiAodmFsdWVfODQyLCBzdHhfODQzKSA9PiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgbmFtZTogdmFsdWVfODQyfSwgdmFsdWU6IHZhbHVlXzg0Mn0sIHN0eF84NDMpfSwga2V5d29yZDoge21hdGNoOiB0b2tlbl84NDQgPT4gIVR5cGVzXzgyOC5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODQ0KSAmJiB0b2tlbl84NDQudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5LZXl3b3JkLCBjcmVhdGU6ICh2YWx1ZV84NDUsIHN0eF84NDYpID0+IG5ldyBTeW50YXgoe3R5cGU6IHtrbGFzczogVG9rZW5DbGFzcy5LZXl3b3JkLCBuYW1lOiB2YWx1ZV84NDV9LCB2YWx1ZTogdmFsdWVfODQ1fSwgc3R4Xzg0Nil9LCBpZGVudGlmaWVyOiB7bWF0Y2g6IHRva2VuXzg0NyA9PiAhVHlwZXNfODI4LmRlbGltaXRlci5tYXRjaCh0b2tlbl84NDcpICYmIHRva2VuXzg0Ny50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLklkZW50LCBjcmVhdGU6ICh2YWx1ZV84NDgsIHN0eF84NDkpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLCB2YWx1ZTogdmFsdWVfODQ4fSwgc3R4Xzg0OSl9LCByZWd1bGFyRXhwcmVzc2lvbjoge21hdGNoOiB0b2tlbl84NTAgPT4gIVR5cGVzXzgyOC5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODUwKSAmJiB0b2tlbl84NTAudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5SZWd1bGFyRXhwcmVzc2lvbiwgY3JlYXRlOiAodmFsdWVfODUxLCBzdHhfODUyKSA9PiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkVHRVhQLCB2YWx1ZTogdmFsdWVfODUxfSwgc3R4Xzg1Mil9LCBicmFjZXM6IHttYXRjaDogdG9rZW5fODUzID0+IFR5cGVzXzgyOC5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODUzKSAmJiB0b2tlbl84NTMuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0UsIGNyZWF0ZTogKGlubmVyXzg1NCwgc3R4Xzg1NSkgPT4ge1xuICBsZXQgbGVmdF84NTYgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNFLCB2YWx1ZTogXCJ7XCJ9KTtcbiAgbGV0IHJpZ2h0Xzg1NyA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0UsIHZhbHVlOiBcIn1cIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODU2KS5jb25jYXQoaW5uZXJfODU0KS5wdXNoKHJpZ2h0Xzg1NyksIHN0eF84NTUpO1xufX0sIGJyYWNrZXRzOiB7bWF0Y2g6IHRva2VuXzg1OCA9PiBUeXBlc184MjguZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg1OCkgJiYgdG9rZW5fODU4LmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNLLCBjcmVhdGU6IChpbm5lcl84NTksIHN0eF84NjApID0+IHtcbiAgbGV0IGxlZnRfODYxID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDSywgdmFsdWU6IFwiW1wifSk7XG4gIGxldCByaWdodF84NjIgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkJSQUNLLCB2YWx1ZTogXCJdXCJ9KTtcbiAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0Xzg2MSkuY29uY2F0KGlubmVyXzg1OSkucHVzaChyaWdodF84NjIpLCBzdHhfODYwKTtcbn19LCBwYXJlbnM6IHttYXRjaDogdG9rZW5fODYzID0+IFR5cGVzXzgyOC5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODYzKSAmJiB0b2tlbl84NjMuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MUEFSRU4sIGNyZWF0ZTogKGlubmVyXzg2NCwgc3R4Xzg2NSkgPT4ge1xuICBsZXQgbGVmdF84NjYgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTFBBUkVOLCB2YWx1ZTogXCIoXCJ9KTtcbiAgbGV0IHJpZ2h0Xzg2NyA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SUEFSRU4sIHZhbHVlOiBcIilcIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODY2KS5jb25jYXQoaW5uZXJfODY0KS5wdXNoKHJpZ2h0Xzg2NyksIHN0eF84NjUpO1xufX0sIGFzc2lnbjoge21hdGNoOiB0b2tlbl84NjggPT4ge1xuICBpZiAoVHlwZXNfODI4LnB1bmN0dWF0b3IubWF0Y2godG9rZW5fODY4KSkge1xuICAgIHN3aXRjaCAodG9rZW5fODY4LnZhbHVlKSB7XG4gICAgICBjYXNlIFwiPVwiOlxuICAgICAgY2FzZSBcInw9XCI6XG4gICAgICBjYXNlIFwiXj1cIjpcbiAgICAgIGNhc2UgXCImPVwiOlxuICAgICAgY2FzZSBcIjw8PVwiOlxuICAgICAgY2FzZSBcIj4+PVwiOlxuICAgICAgY2FzZSBcIj4+Pj1cIjpcbiAgICAgIGNhc2UgXCIrPVwiOlxuICAgICAgY2FzZSBcIi09XCI6XG4gICAgICBjYXNlIFwiKj1cIjpcbiAgICAgIGNhc2UgXCIvPVwiOlxuICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59fSwgYm9vbGVhbjoge21hdGNoOiB0b2tlbl84NjkgPT4gIVR5cGVzXzgyOC5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODY5KSAmJiB0b2tlbl84NjkudHlwZSA9PT0gVG9rZW5UeXBlLlRSVUUgfHwgdG9rZW5fODY5LnR5cGUgPT09IFRva2VuVHlwZS5GQUxTRX0sIHRlbXBsYXRlOiB7bWF0Y2g6IHRva2VuXzg3MCA9PiAhVHlwZXNfODI4LmRlbGltaXRlci5tYXRjaCh0b2tlbl84NzApICYmIHRva2VuXzg3MC50eXBlID09PSBUb2tlblR5cGUuVEVNUExBVEV9LCBkZWxpbWl0ZXI6IHttYXRjaDogdG9rZW5fODcxID0+IExpc3QuaXNMaXN0KHRva2VuXzg3MSl9LCBzeW50YXhUZW1wbGF0ZToge21hdGNoOiB0b2tlbl84NzIgPT4gVHlwZXNfODI4LmRlbGltaXRlci5tYXRjaCh0b2tlbl84NzIpICYmIHRva2VuXzg3Mi5nZXQoMCkudmFsKCkgPT09IFwiI2BcIn0sIGVvZjoge21hdGNoOiB0b2tlbl84NzMgPT4gIVR5cGVzXzgyOC5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODczKSAmJiB0b2tlbl84NzMudHlwZSA9PT0gVG9rZW5UeXBlLkVPU319O1xuO1xuY29uc3QgQUxMX1BIQVNFU184MjkgPSB7fTtcbjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bnRheCB7XG4gIGNvbnN0cnVjdG9yKHRva2VuXzg3NCwgb2xkc3R4Xzg3NSA9IHt9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuXzg3NDtcbiAgICB0aGlzLmJpbmRpbmdzID0gb2xkc3R4Xzg3NS5iaW5kaW5ncyAhPSBudWxsID8gb2xkc3R4Xzg3NS5iaW5kaW5ncyA6IG5ldyBCaW5kaW5nTWFwO1xuICAgIHRoaXMuc2NvcGVzZXRzID0gb2xkc3R4Xzg3NS5zY29wZXNldHMgIT0gbnVsbCA/IG9sZHN0eF84NzUuc2NvcGVzZXRzIDoge2FsbDogTGlzdCgpLCBwaGFzZTogTWFwKCl9O1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgc3RhdGljIG9mKHRva2VuXzg3Niwgc3R4Xzg3NyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fODc2LCBzdHhfODc3KTtcbiAgfVxuICBzdGF0aWMgZnJvbSh0eXBlXzg3OCwgdmFsdWVfODc5LCBzdHhfODgwID0ge30pIHtcbiAgICBpZiAoIVR5cGVzXzgyOFt0eXBlXzg3OF0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzg3OCArIFwiIGlzIG5vdCBhIHZhbGlkIHR5cGVcIik7XG4gICAgfSBlbHNlIGlmICghVHlwZXNfODI4W3R5cGVfODc4XS5jcmVhdGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgYSBzeW50YXggZnJvbSB0eXBlIFwiICsgdHlwZV84NzgpO1xuICAgIH1cbiAgICByZXR1cm4gVHlwZXNfODI4W3R5cGVfODc4XS5jcmVhdGUodmFsdWVfODc5LCBzdHhfODgwKTtcbiAgfVxuICBmcm9tKHR5cGVfODgxLCB2YWx1ZV84ODIpIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20odHlwZV84ODEsIHZhbHVlXzg4MiwgdGhpcyk7XG4gIH1cbiAgZnJvbU51bGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcIm51bGxcIiwgbnVsbCk7XG4gIH1cbiAgZnJvbU51bWJlcih2YWx1ZV84ODMpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwibnVtYmVyXCIsIHZhbHVlXzg4Myk7XG4gIH1cbiAgZnJvbVN0cmluZyh2YWx1ZV84ODQpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwic3RyaW5nXCIsIHZhbHVlXzg4NCk7XG4gIH1cbiAgZnJvbVB1bmN0dWF0b3IodmFsdWVfODg1KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInB1bmN0dWF0b3JcIiwgdmFsdWVfODg1KTtcbiAgfVxuICBmcm9tS2V5d29yZCh2YWx1ZV84ODYpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwia2V5d29yZFwiKTtcbiAgfVxuICBmcm9tSWRlbnRpZmllcih2YWx1ZV84ODcpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwiaWRlbnRpZmllclwiLCB2YWx1ZV84ODcpO1xuICB9XG4gIGZyb21SZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV84ODgpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwicmVndWxhckV4cHJlc3Npb25cIiwgdmFsdWVfODg4KTtcbiAgfVxuICBmcm9tQnJhY2VzKGlubmVyXzg4OSkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJicmFjZXNcIiwgaW5uZXJfODg5KTtcbiAgfVxuICBmcm9tQnJhY2tldHMoaW5uZXJfODkwKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcImJyYWNrZXRzXCIsIGlubmVyXzg5MCk7XG4gIH1cbiAgZnJvbVBhcmVucyhpbm5lcl84OTEpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwicGFyZW5zXCIsIGlubmVyXzg5MSk7XG4gIH1cbiAgc3RhdGljIGZyb21OdWxsKHN0eF84OTIgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcIm51bGxcIiwgbnVsbCwgc3R4Xzg5Mik7XG4gIH1cbiAgc3RhdGljIGZyb21OdW1iZXIodmFsdWVfODkzLCBzdHhfODk0ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJudW1iZXJcIiwgdmFsdWVfODkzLCBzdHhfODk0KTtcbiAgfVxuICBzdGF0aWMgZnJvbVN0cmluZyh2YWx1ZV84OTUsIHN0eF84OTYgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInN0cmluZ1wiLCB2YWx1ZV84OTUsIHN0eF84OTYpO1xuICB9XG4gIHN0YXRpYyBmcm9tUHVuY3R1YXRvcih2YWx1ZV84OTcsIHN0eF84OTggPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInB1bmN0dWF0b3JcIiwgdmFsdWVfODk3LCBzdHhfODk4KTtcbiAgfVxuICBzdGF0aWMgZnJvbUtleXdvcmQodmFsdWVfODk5LCBzdHhfOTAwID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJrZXl3b3JkXCIsIHZhbHVlXzg5OSwgc3R4XzkwMCk7XG4gIH1cbiAgc3RhdGljIGZyb21JZGVudGlmaWVyKHZhbHVlXzkwMSwgc3R4XzkwMiA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwiaWRlbnRpZmllclwiLCB2YWx1ZV85MDEsIHN0eF85MDIpO1xuICB9XG4gIHN0YXRpYyBmcm9tUmVndWxhckV4cHJlc3Npb24odmFsdWVfOTAzLCBzdHhfOTA0ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV85MDMsIHN0eF85MDQpO1xuICB9XG4gIHN0YXRpYyBmcm9tQnJhY2VzKGlubmVyXzkwNSwgc3R4XzkwNiA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwiYnJhY2VzXCIsIGlubmVyXzkwNSwgc3R4XzkwNik7XG4gIH1cbiAgc3RhdGljIGZyb21CcmFja2V0cyhpbm5lcl85MDcsIHN0eF85MDggPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImJyYWNrZXRzXCIsIGlubmVyXzkwNywgc3R4XzkwOCk7XG4gIH1cbiAgc3RhdGljIGZyb21QYXJlbnMoaW5uZXJfOTA5LCBzdHhfOTEwID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJwYXJlbnNcIiwgaW5uZXJfOTA5LCBzdHhfOTEwKTtcbiAgfVxuICByZXNvbHZlKHBoYXNlXzkxMSkge1xuICAgIGFzc2VydChwaGFzZV85MTEgIT0gbnVsbCwgXCJtdXN0IHByb3ZpZGUgYSBwaGFzZSB0byByZXNvbHZlXCIpO1xuICAgIGxldCBhbGxTY29wZXNfOTEyID0gdGhpcy5zY29wZXNldHMuYWxsO1xuICAgIGxldCBzdHhTY29wZXNfOTEzID0gdGhpcy5zY29wZXNldHMucGhhc2UuaGFzKHBoYXNlXzkxMSkgPyB0aGlzLnNjb3Blc2V0cy5waGFzZS5nZXQocGhhc2VfOTExKSA6IExpc3QoKTtcbiAgICBzdHhTY29wZXNfOTEzID0gYWxsU2NvcGVzXzkxMi5jb25jYXQoc3R4U2NvcGVzXzkxMyk7XG4gICAgaWYgKHN0eFNjb3Blc185MTMuc2l6ZSA9PT0gMCB8fCAhKHRoaXMubWF0Y2goXCJpZGVudGlmaWVyXCIpIHx8IHRoaXMubWF0Y2goXCJrZXl3b3JkXCIpKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gICAgfVxuICAgIGxldCBzY29wZV85MTQgPSBzdHhTY29wZXNfOTEzLmxhc3QoKTtcbiAgICBsZXQgYmluZGluZ3NfOTE1ID0gdGhpcy5iaW5kaW5ncztcbiAgICBpZiAoc2NvcGVfOTE0KSB7XG4gICAgICBsZXQgc2NvcGVzZXRCaW5kaW5nTGlzdCA9IGJpbmRpbmdzXzkxNS5nZXQodGhpcyk7XG4gICAgICBpZiAoc2NvcGVzZXRCaW5kaW5nTGlzdCkge1xuICAgICAgICBsZXQgYmlnZ2VzdEJpbmRpbmdQYWlyID0gc2NvcGVzZXRCaW5kaW5nTGlzdC5maWx0ZXIoKHtzY29wZXMsIGJpbmRpbmd9KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHNjb3Blcy5pc1N1YnNldChzdHhTY29wZXNfOTEzKTtcbiAgICAgICAgfSkuc29ydChzaXplRGVjZW5kaW5nXzgyNyk7XG4gICAgICAgIGlmIChiaWdnZXN0QmluZGluZ1BhaXIuc2l6ZSA+PSAyICYmIGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuc2NvcGVzLnNpemUgPT09IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMSkuc2NvcGVzLnNpemUpIHtcbiAgICAgICAgICBsZXQgZGVidWdCYXNlID0gXCJ7XCIgKyBzdHhTY29wZXNfOTEzLm1hcChzXzkxNiA9PiBzXzkxNi50b1N0cmluZygpKS5qb2luKFwiLCBcIikgKyBcIn1cIjtcbiAgICAgICAgICBsZXQgZGVidWdBbWJpZ291c1Njb3Blc2V0cyA9IGJpZ2dlc3RCaW5kaW5nUGFpci5tYXAoKHtzY29wZXN9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXCJ7XCIgKyBzY29wZXMubWFwKHNfOTE3ID0+IHNfOTE3LnRvU3RyaW5nKCkpLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuICAgICAgICAgIH0pLmpvaW4oXCIsIFwiKTtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY29wZXNldCBcIiArIGRlYnVnQmFzZSArIFwiIGhhcyBhbWJpZ3VvdXMgc3Vic2V0cyBcIiArIGRlYnVnQW1iaWdvdXNTY29wZXNldHMpO1xuICAgICAgICB9IGVsc2UgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplICE9PSAwKSB7XG4gICAgICAgICAgbGV0IGJpbmRpbmdTdHIgPSBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmJpbmRpbmcudG9TdHJpbmcoKTtcbiAgICAgICAgICBpZiAoTWF5YmUuaXNKdXN0KGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYWxpYXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcy5nZXRPckVsc2UobnVsbCkucmVzb2x2ZShwaGFzZV85MTEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYmluZGluZ1N0cjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxuICB2YWwoKSB7XG4gICAgYXNzZXJ0KCF0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpLCBcImNhbm5vdCBnZXQgdGhlIHZhbCBvZiBhIGRlbGltaXRlclwiKTtcbiAgICBpZiAodGhpcy5tYXRjaChcInN0cmluZ1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcInRlbXBsYXRlXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5pdGVtcy5tYXAoZWxfOTE4ID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbF85MTgubWF0Y2ggPT09IFwiZnVuY3Rpb25cIiAmJiBlbF85MTgubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgICAgICByZXR1cm4gXCIkey4uLn1cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxfOTE4LnNsaWNlLnRleHQ7XG4gICAgICB9KS5qb2luKFwiXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxuICBsaW5lTnVtYmVyKCkge1xuICAgIGlmICghdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uc2xpY2Uuc3RhcnRMb2NhdGlvbi5saW5lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5nZXQoMCkubGluZU51bWJlcigpO1xuICAgIH1cbiAgfVxuICBzZXRMaW5lTnVtYmVyKGxpbmVfOTE5KSB7XG4gICAgbGV0IG5ld1Rva185MjAgPSB7fTtcbiAgICBpZiAodGhpcy5pc0RlbGltaXRlcigpKSB7XG4gICAgICBuZXdUb2tfOTIwID0gdGhpcy50b2tlbi5tYXAoc185MjEgPT4gc185MjEuc2V0TGluZU51bWJlcihsaW5lXzkxOSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXModGhpcy50b2tlbikpIHtcbiAgICAgICAgbmV3VG9rXzkyMFtrZXldID0gdGhpcy50b2tlbltrZXldO1xuICAgICAgfVxuICAgICAgYXNzZXJ0KG5ld1Rva185MjAuc2xpY2UgJiYgbmV3VG9rXzkyMC5zbGljZS5zdGFydExvY2F0aW9uLCBcImFsbCB0b2tlbnMgbXVzdCBoYXZlIGxpbmUgaW5mb1wiKTtcbiAgICAgIG5ld1Rva185MjAuc2xpY2Uuc3RhcnRMb2NhdGlvbi5saW5lID0gbGluZV85MTk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KG5ld1Rva185MjAsIHRoaXMpO1xuICB9XG4gIGlubmVyKCkge1xuICAgIGFzc2VydCh0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpLCBcImNhbiBvbmx5IGdldCB0aGUgaW5uZXIgb2YgYSBkZWxpbWl0ZXJcIik7XG4gICAgcmV0dXJuIHRoaXMudG9rZW4uc2xpY2UoMSwgdGhpcy50b2tlbi5zaXplIC0gMSk7XG4gIH1cbiAgYWRkU2NvcGUoc2NvcGVfOTIyLCBiaW5kaW5nc185MjMsIHBoYXNlXzkyNCwgb3B0aW9uc185MjUgPSB7ZmxpcDogZmFsc2V9KSB7XG4gICAgbGV0IHRva2VuXzkyNiA9IHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikgPyB0aGlzLnRva2VuLm1hcChzXzkzMCA9PiBzXzkzMC5hZGRTY29wZShzY29wZV85MjIsIGJpbmRpbmdzXzkyMywgcGhhc2VfOTI0LCBvcHRpb25zXzkyNSkpIDogdGhpcy50b2tlbjtcbiAgICBpZiAodGhpcy5tYXRjaChcInRlbXBsYXRlXCIpKSB7XG4gICAgICB0b2tlbl85MjYgPSBfLm1lcmdlKHRva2VuXzkyNiwge2l0ZW1zOiB0b2tlbl85MjYuaXRlbXMubWFwKGl0XzkzMSA9PiB7XG4gICAgICAgIGlmIChpdF85MzEgaW5zdGFuY2VvZiBTeW50YXggJiYgaXRfOTMxLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGl0XzkzMS5hZGRTY29wZShzY29wZV85MjIsIGJpbmRpbmdzXzkyMywgcGhhc2VfOTI0LCBvcHRpb25zXzkyNSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0XzkzMTtcbiAgICAgIH0pfSk7XG4gICAgfVxuICAgIGxldCBvbGRTY29wZXNldF85Mjc7XG4gICAgaWYgKHBoYXNlXzkyNCA9PT0gQUxMX1BIQVNFU184MjkpIHtcbiAgICAgIG9sZFNjb3Blc2V0XzkyNyA9IHRoaXMuc2NvcGVzZXRzLmFsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkU2NvcGVzZXRfOTI3ID0gdGhpcy5zY29wZXNldHMucGhhc2UuaGFzKHBoYXNlXzkyNCkgPyB0aGlzLnNjb3Blc2V0cy5waGFzZS5nZXQocGhhc2VfOTI0KSA6IExpc3QoKTtcbiAgICB9XG4gICAgbGV0IG5ld1Njb3Blc2V0XzkyODtcbiAgICBpZiAob3B0aW9uc185MjUuZmxpcCkge1xuICAgICAgbGV0IGluZGV4ID0gb2xkU2NvcGVzZXRfOTI3LmluZGV4T2Yoc2NvcGVfOTIyKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbmV3U2NvcGVzZXRfOTI4ID0gb2xkU2NvcGVzZXRfOTI3LnJlbW92ZShpbmRleCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTY29wZXNldF85MjggPSBvbGRTY29wZXNldF85MjcucHVzaChzY29wZV85MjIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdTY29wZXNldF85MjggPSBvbGRTY29wZXNldF85MjcucHVzaChzY29wZV85MjIpO1xuICAgIH1cbiAgICBsZXQgbmV3c3R4XzkyOSA9IHtiaW5kaW5nczogYmluZGluZ3NfOTIzLCBzY29wZXNldHM6IHthbGw6IHRoaXMuc2NvcGVzZXRzLmFsbCwgcGhhc2U6IHRoaXMuc2NvcGVzZXRzLnBoYXNlfX07XG4gICAgaWYgKHBoYXNlXzkyNCA9PT0gQUxMX1BIQVNFU184MjkpIHtcbiAgICAgIG5ld3N0eF85Mjkuc2NvcGVzZXRzLmFsbCA9IG5ld1Njb3Blc2V0XzkyODtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3c3R4XzkyOS5zY29wZXNldHMucGhhc2UgPSBuZXdzdHhfOTI5LnNjb3Blc2V0cy5waGFzZS5zZXQocGhhc2VfOTI0LCBuZXdTY29wZXNldF85MjgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl85MjYsIG5ld3N0eF85MjkpO1xuICB9XG4gIHJlbW92ZVNjb3BlKHNjb3BlXzkzMiwgcGhhc2VfOTMzKSB7XG4gICAgbGV0IHRva2VuXzkzNCA9IHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikgPyB0aGlzLnRva2VuLm1hcChzXzk0MCA9PiBzXzk0MC5yZW1vdmVTY29wZShzY29wZV85MzIsIHBoYXNlXzkzMykpIDogdGhpcy50b2tlbjtcbiAgICBsZXQgcGhhc2VTY29wZXNldF85MzUgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfOTMzKSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV85MzMpIDogTGlzdCgpO1xuICAgIGxldCBhbGxTY29wZXNldF85MzYgPSB0aGlzLnNjb3Blc2V0cy5hbGw7XG4gICAgbGV0IG5ld3N0eF85MzcgPSB7YmluZGluZ3M6IHRoaXMuYmluZGluZ3MsIHNjb3Blc2V0czoge2FsbDogdGhpcy5zY29wZXNldHMuYWxsLCBwaGFzZTogdGhpcy5zY29wZXNldHMucGhhc2V9fTtcbiAgICBsZXQgcGhhc2VJbmRleF85MzggPSBwaGFzZVNjb3Blc2V0XzkzNS5pbmRleE9mKHNjb3BlXzkzMik7XG4gICAgbGV0IGFsbEluZGV4XzkzOSA9IGFsbFNjb3Blc2V0XzkzNi5pbmRleE9mKHNjb3BlXzkzMik7XG4gICAgaWYgKHBoYXNlSW5kZXhfOTM4ICE9PSAtMSkge1xuICAgICAgbmV3c3R4XzkzNy5zY29wZXNldHMucGhhc2UgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5zZXQocGhhc2VfOTMzLCBwaGFzZVNjb3Blc2V0XzkzNS5yZW1vdmUocGhhc2VJbmRleF85MzgpKTtcbiAgICB9IGVsc2UgaWYgKGFsbEluZGV4XzkzOSAhPT0gLTEpIHtcbiAgICAgIG5ld3N0eF85Mzcuc2NvcGVzZXRzLmFsbCA9IGFsbFNjb3Blc2V0XzkzNi5yZW1vdmUoYWxsSW5kZXhfOTM5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fOTM0LCBuZXdzdHhfOTM3KTtcbiAgfVxuICBtYXRjaCh0eXBlXzk0MSwgdmFsdWVfOTQyKSB7XG4gICAgaWYgKCFUeXBlc184MjhbdHlwZV85NDFdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IodHlwZV85NDEgKyBcIiBpcyBhbiBpbnZhbGlkIHR5cGVcIik7XG4gICAgfVxuICAgIHJldHVybiBUeXBlc184MjhbdHlwZV85NDFdLm1hdGNoKHRoaXMudG9rZW4pICYmICh2YWx1ZV85NDIgPT0gbnVsbCB8fCAodmFsdWVfOTQyIGluc3RhbmNlb2YgUmVnRXhwID8gdmFsdWVfOTQyLnRlc3QodGhpcy52YWwoKSkgOiB0aGlzLnZhbCgpID09IHZhbHVlXzk0MikpO1xuICB9XG4gIGlzSWRlbnRpZmllcih2YWx1ZV85NDMpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImlkZW50aWZpZXJcIiwgdmFsdWVfOTQzKTtcbiAgfVxuICBpc0Fzc2lnbih2YWx1ZV85NDQpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImFzc2lnblwiLCB2YWx1ZV85NDQpO1xuICB9XG4gIGlzQm9vbGVhbkxpdGVyYWwodmFsdWVfOTQ1KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJib29sZWFuXCIsIHZhbHVlXzk0NSk7XG4gIH1cbiAgaXNLZXl3b3JkKHZhbHVlXzk0Nikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwia2V5d29yZFwiLCB2YWx1ZV85NDYpO1xuICB9XG4gIGlzTnVsbExpdGVyYWwodmFsdWVfOTQ3KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJudWxsXCIsIHZhbHVlXzk0Nyk7XG4gIH1cbiAgaXNOdW1lcmljTGl0ZXJhbCh2YWx1ZV85NDgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bWJlclwiLCB2YWx1ZV85NDgpO1xuICB9XG4gIGlzUHVuY3R1YXRvcih2YWx1ZV85NDkpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInB1bmN0dWF0b3JcIiwgdmFsdWVfOTQ5KTtcbiAgfVxuICBpc1N0cmluZ0xpdGVyYWwodmFsdWVfOTUwKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzdHJpbmdcIiwgdmFsdWVfOTUwKTtcbiAgfVxuICBpc1JlZ3VsYXJFeHByZXNzaW9uKHZhbHVlXzk1MSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicmVndWxhckV4cHJlc3Npb25cIiwgdmFsdWVfOTUxKTtcbiAgfVxuICBpc1RlbXBsYXRlKHZhbHVlXzk1Mikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwidGVtcGxhdGVcIiwgdmFsdWVfOTUyKTtcbiAgfVxuICBpc0RlbGltaXRlcih2YWx1ZV85NTMpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImRlbGltaXRlclwiLCB2YWx1ZV85NTMpO1xuICB9XG4gIGlzUGFyZW5zKHZhbHVlXzk1NCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicGFyZW5zXCIsIHZhbHVlXzk1NCk7XG4gIH1cbiAgaXNCcmFjZXModmFsdWVfOTU1KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFjZXNcIiwgdmFsdWVfOTU1KTtcbiAgfVxuICBpc0JyYWNrZXRzKHZhbHVlXzk1Nikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYnJhY2tldHNcIiwgdmFsdWVfOTU2KTtcbiAgfVxuICBpc1N5bnRheFRlbXBsYXRlKHZhbHVlXzk1Nykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwic3ludGF4VGVtcGxhdGVcIiwgdmFsdWVfOTU3KTtcbiAgfVxuICBpc0VPRih2YWx1ZV85NTgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImVvZlwiLCB2YWx1ZV85NTgpO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIGlmICh0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5tYXAoc185NTkgPT4gc185NTkudG9TdHJpbmcoKSkuam9pbihcIiBcIik7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwic3RyaW5nXCIpKSB7XG4gICAgICByZXR1cm4gXCInXCIgKyB0aGlzLnRva2VuLnN0cjtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG59XG5leHBvcnQge1R5cGVzXzgyOCBhcyBUeXBlc307XG5leHBvcnQge0FMTF9QSEFTRVNfODI5IGFzIEFMTF9QSEFTRVN9Il19