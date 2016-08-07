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

const Just_819 = _ramdaFantasy.Maybe.Just;
const Nothing_820 = _ramdaFantasy.Maybe.Nothing;
function sizeDecending_821(a_824, b_825) {
  if (a_824.scopes.size > b_825.scopes.size) {
    return -1;
  } else if (b_825.scopes.size > a_824.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}
let Types_822 = { null: { match: token_826 => !Types_822.delimiter.match(token_826) && token_826.type === _tokenizer.TokenType.NULL, create: (value_827, stx_828) => new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_828) }, number: { match: token_829 => !Types_822.delimiter.match(token_829) && token_829.type.klass === _tokenizer.TokenClass.NumericLiteral, create: (value_830, stx_831) => new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_830 }, stx_831) }, string: { match: token_832 => !Types_822.delimiter.match(token_832) && token_832.type.klass === _tokenizer.TokenClass.StringLiteral, create: (value_833, stx_834) => new Syntax({ type: _tokenizer.TokenType.STRING, str: value_833 }, stx_834) }, punctuator: { match: token_835 => !Types_822.delimiter.match(token_835) && token_835.type.klass === _tokenizer.TokenClass.Punctuator, create: (value_836, stx_837) => new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_836 }, value: value_836 }, stx_837) }, keyword: { match: token_838 => !Types_822.delimiter.match(token_838) && token_838.type.klass === _tokenizer.TokenClass.Keyword, create: (value_839, stx_840) => new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_839 }, value: value_839 }, stx_840) }, identifier: { match: token_841 => !Types_822.delimiter.match(token_841) && token_841.type.klass === _tokenizer.TokenClass.Ident, create: (value_842, stx_843) => new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_842 }, stx_843) }, regularExpression: { match: token_844 => !Types_822.delimiter.match(token_844) && token_844.type.klass === _tokenizer.TokenClass.RegularExpression, create: (value_845, stx_846) => new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_845 }, stx_846) }, braces: { match: token_847 => Types_822.delimiter.match(token_847) && token_847.get(0).token.type === _tokenizer.TokenType.LBRACE, create: (inner_848, stx_849) => {
      let left_850 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });
      let right_851 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });
      return new Syntax(_immutable.List.of(left_850).concat(inner_848).push(right_851), stx_849);
    } }, brackets: { match: token_852 => Types_822.delimiter.match(token_852) && token_852.get(0).token.type === _tokenizer.TokenType.LBRACK, create: (inner_853, stx_854) => {
      let left_855 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });
      let right_856 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });
      return new Syntax(_immutable.List.of(left_855).concat(inner_853).push(right_856), stx_854);
    } }, parens: { match: token_857 => Types_822.delimiter.match(token_857) && token_857.get(0).token.type === _tokenizer.TokenType.LPAREN, create: (inner_858, stx_859) => {
      let left_860 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });
      let right_861 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });
      return new Syntax(_immutable.List.of(left_860).concat(inner_858).push(right_861), stx_859);
    } }, assign: { match: token_862 => {
      if (Types_822.punctuator.match(token_862)) {
        switch (token_862.value) {
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
    } }, boolean: { match: token_863 => !Types_822.delimiter.match(token_863) && token_863.type === _tokenizer.TokenType.TRUE || token_863.type === _tokenizer.TokenType.FALSE }, template: { match: token_864 => !Types_822.delimiter.match(token_864) && token_864.type === _tokenizer.TokenType.TEMPLATE }, delimiter: { match: token_865 => _immutable.List.isList(token_865) }, syntaxTemplate: { match: token_866 => Types_822.delimiter.match(token_866) && token_866.get(0).val() === "#`" }, eof: { match: token_867 => !Types_822.delimiter.match(token_867) && token_867.type === _tokenizer.TokenType.EOS } };
;
const ALL_PHASES_823 = {};
;
class Syntax {
  constructor(token_868) {
    let oldstx_869 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.token = token_868;
    this.bindings = oldstx_869.bindings != null ? oldstx_869.bindings : new _bindingMap2.default();
    this.scopesets = oldstx_869.scopesets != null ? oldstx_869.scopesets : { all: (0, _immutable.List)(), phase: (0, _immutable.Map)() };
    Object.freeze(this);
  }
  static of(token_870) {
    let stx_871 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Syntax(token_870, stx_871);
  }
  static from(type_872, value_873) {
    let stx_874 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!Types_822[type_872]) {
      throw new Error(type_872 + " is not a valid type");
    } else if (!Types_822[type_872].create) {
      throw new Error("Cannot create a syntax from type " + type_872);
    }
    return Types_822[type_872].create(value_873, stx_874);
  }
  from(type_875, value_876) {
    return Syntax.from(type_875, value_876, this);
  }
  fromNull() {
    return this.from("null", null);
  }
  fromNumber(value_877) {
    return this.from("number", value_877);
  }
  fromString(value_878) {
    return this.from("string", value_878);
  }
  fromPunctuator(value_879) {
    return this.from("punctuator", value_879);
  }
  fromKeyword(value_880) {
    return this.from("keyword");
  }
  fromIdentifier(value_881) {
    return this.from("identifier", value_881);
  }
  fromRegularExpression(value_882) {
    return this.from("regularExpression", value_882);
  }
  fromBraces(inner_883) {
    return this.from("braces", inner_883);
  }
  fromBrackets(inner_884) {
    return this.from("brackets", inner_884);
  }
  fromParens(inner_885) {
    return this.from("parens", inner_885);
  }
  static fromNull() {
    let stx_886 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return Syntax.from("null", null, stx_886);
  }
  static fromNumber(value_887) {
    let stx_888 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("number", value_887, stx_888);
  }
  static fromString(value_889) {
    let stx_890 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("string", value_889, stx_890);
  }
  static fromPunctuator(value_891) {
    let stx_892 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("punctuator", value_891, stx_892);
  }
  static fromKeyword(value_893) {
    let stx_894 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("keyword", value_893, stx_894);
  }
  static fromIdentifier(value_895) {
    let stx_896 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("identifier", value_895, stx_896);
  }
  static fromRegularExpression(value_897) {
    let stx_898 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("regularExpression", value_897, stx_898);
  }
  static fromBraces(inner_899) {
    let stx_900 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("braces", inner_899, stx_900);
  }
  static fromBrackets(inner_901) {
    let stx_902 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("brackets", inner_901, stx_902);
  }
  static fromParens(inner_903) {
    let stx_904 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("parens", inner_903, stx_904);
  }
  resolve(phase_905) {
    (0, _errors.assert)(phase_905 != null, "must provide a phase to resolve");
    let allScopes_906 = this.scopesets.all;
    let stxScopes_907 = this.scopesets.phase.has(phase_905) ? this.scopesets.phase.get(phase_905) : (0, _immutable.List)();
    stxScopes_907 = allScopes_906.concat(stxScopes_907);
    if (stxScopes_907.size === 0 || !(this.match("identifier") || this.match("keyword"))) {
      return this.token.value;
    }
    let scope_908 = stxScopes_907.last();
    let bindings_909 = this.bindings;
    if (scope_908) {
      let scopesetBindingList = bindings_909.get(this);
      if (scopesetBindingList) {
        let biggestBindingPair = scopesetBindingList.filter(_ref => {
          let scopes = _ref.scopes;
          let binding = _ref.binding;

          return scopes.isSubset(stxScopes_907);
        }).sort(sizeDecending_821);
        if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
          let debugBase = "{" + stxScopes_907.map(s_910 => s_910.toString()).join(", ") + "}";
          let debugAmbigousScopesets = biggestBindingPair.map(_ref2 => {
            let scopes = _ref2.scopes;

            return "{" + scopes.map(s_911 => s_911.toString()).join(", ") + "}";
          }).join(", ");
          throw new Error("Scopeset " + debugBase + " has ambiguous subsets " + debugAmbigousScopesets);
        } else if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve(phase_905);
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
      return this.token.items.map(el_912 => {
        if (typeof el_912.match === "function" && el_912.match("delimiter")) {
          return "${...}";
        }
        return el_912.slice.text;
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
  setLineNumber(line_913) {
    let newTok_914 = {};
    if (this.isDelimiter()) {
      newTok_914 = this.token.map(s_915 => s_915.setLineNumber(line_913));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok_914[key] = this.token[key];
      }
      (0, _errors.assert)(newTok_914.slice && newTok_914.slice.startLocation, "all tokens must have line info");
      newTok_914.slice.startLocation.line = line_913;
    }
    return new Syntax(newTok_914, this);
  }
  inner() {
    (0, _errors.assert)(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }
  addScope(scope_916, bindings_917, phase_918) {
    let options_919 = arguments.length <= 3 || arguments[3] === undefined ? { flip: false } : arguments[3];

    let token_920 = this.match("delimiter") ? this.token.map(s_924 => s_924.addScope(scope_916, bindings_917, phase_918, options_919)) : this.token;
    if (this.match("template")) {
      token_920 = _.merge(token_920, { items: token_920.items.map(it_925 => {
          if (it_925 instanceof Syntax && it_925.match("delimiter")) {
            return it_925.addScope(scope_916, bindings_917, phase_918, options_919);
          }
          return it_925;
        }) });
    }
    let oldScopeset_921;
    if (phase_918 === ALL_PHASES_823) {
      oldScopeset_921 = this.scopesets.all;
    } else {
      oldScopeset_921 = this.scopesets.phase.has(phase_918) ? this.scopesets.phase.get(phase_918) : (0, _immutable.List)();
    }
    let newScopeset_922;
    if (options_919.flip) {
      let index = oldScopeset_921.indexOf(scope_916);
      if (index !== -1) {
        newScopeset_922 = oldScopeset_921.remove(index);
      } else {
        newScopeset_922 = oldScopeset_921.push(scope_916);
      }
    } else {
      newScopeset_922 = oldScopeset_921.push(scope_916);
    }
    let newstx_923 = { bindings: bindings_917, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    if (phase_918 === ALL_PHASES_823) {
      newstx_923.scopesets.all = newScopeset_922;
    } else {
      newstx_923.scopesets.phase = newstx_923.scopesets.phase.set(phase_918, newScopeset_922);
    }
    return new Syntax(token_920, newstx_923);
  }
  removeScope(scope_926, phase_927) {
    let token_928 = this.match("delimiter") ? this.token.map(s_934 => s_934.removeScope(scope_926, phase_927)) : this.token;
    let phaseScopeset_929 = this.scopesets.phase.has(phase_927) ? this.scopesets.phase.get(phase_927) : (0, _immutable.List)();
    let allScopeset_930 = this.scopesets.all;
    let newstx_931 = { bindings: this.bindings, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    let phaseIndex_932 = phaseScopeset_929.indexOf(scope_926);
    let allIndex_933 = allScopeset_930.indexOf(scope_926);
    if (phaseIndex_932 !== -1) {
      newstx_931.scopesets.phase = this.scopesets.phase.set(phase_927, phaseScopeset_929.remove(phaseIndex_932));
    } else if (allIndex_933 !== -1) {
      newstx_931.scopesets.all = allScopeset_930.remove(allIndex_933);
    }
    return new Syntax(token_928, newstx_931);
  }
  match(type_935, value_936) {
    if (!Types_822[type_935]) {
      throw new Error(type_935 + " is an invalid type");
    }
    return Types_822[type_935].match(this.token) && (value_936 == null || (value_936 instanceof RegExp ? value_936.test(this.val()) : this.val() == value_936));
  }
  isIdentifier(value_937) {
    return this.match("identifier", value_937);
  }
  isAssign(value_938) {
    return this.match("assign", value_938);
  }
  isBooleanLiteral(value_939) {
    return this.match("boolean", value_939);
  }
  isKeyword(value_940) {
    return this.match("keyword", value_940);
  }
  isNullLiteral(value_941) {
    return this.match("null", value_941);
  }
  isNumericLiteral(value_942) {
    return this.match("number", value_942);
  }
  isPunctuator(value_943) {
    return this.match("punctuator", value_943);
  }
  isStringLiteral(value_944) {
    return this.match("string", value_944);
  }
  isRegularExpression(value_945) {
    return this.match("regularExpression", value_945);
  }
  isTemplate(value_946) {
    return this.match("template", value_946);
  }
  isDelimiter(value_947) {
    return this.match("delimiter", value_947);
  }
  isParens(value_948) {
    return this.match("parens", value_948);
  }
  isBraces(value_949) {
    return this.match("braces", value_949);
  }
  isBrackets(value_950) {
    return this.match("brackets", value_950);
  }
  isSyntaxTemplate(value_951) {
    return this.match("syntaxTemplate", value_951);
  }
  isEOF(value_952) {
    return this.match("eof", value_952);
  }
  toString() {
    if (this.match("delimiter")) {
      return this.token.map(s_953 => s_953.toString()).join(" ");
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
exports.Types = Types_822;
exports.ALL_PHASES = ALL_PHASES_823;
//# sourceMappingURL=data:application/json;base64,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TyxLQUFLLEtBQUwsQ0FBVyxXQUFYLEVBQXdCLFNBQXhCLENBQVA7QUFDRDtBQUNELFdBQVMsU0FBVCxFQUFvQjtBQUNsQixXQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFBcUIsU0FBckIsQ0FBUDtBQUNEO0FBQ0QsV0FBUyxTQUFULEVBQW9CO0FBQ2xCLFdBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxFQUFxQixTQUFyQixDQUFQO0FBQ0Q7QUFDRCxhQUFXLFNBQVgsRUFBc0I7QUFDcEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxVQUFYLEVBQXVCLFNBQXZCLENBQVA7QUFDRDtBQUNELG1CQUFpQixTQUFqQixFQUE0QjtBQUMxQixXQUFPLEtBQUssS0FBTCxDQUFXLGdCQUFYLEVBQTZCLFNBQTdCLENBQVA7QUFDRDtBQUNELFFBQU0sU0FBTixFQUFpQjtBQUNmLFdBQU8sS0FBSyxLQUFMLENBQVcsS0FBWCxFQUFrQixTQUFsQixDQUFQO0FBQ0Q7QUFDRCxhQUFXO0FBQ1QsUUFBSSxLQUFLLEtBQUwsQ0FBVyxXQUFYLENBQUosRUFBNkI7QUFDM0IsYUFBTyxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsU0FBUyxNQUFNLFFBQU4sRUFBeEIsRUFBMEMsSUFBMUMsQ0FBK0MsR0FBL0MsQ0FBUDtBQUNEO0FBQ0QsUUFBSSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQUosRUFBMEI7QUFDeEIsYUFBTyxNQUFNLEtBQUssS0FBTCxDQUFXLEdBQXhCO0FBQ0Q7QUFDRCxRQUFJLEtBQUssS0FBTCxDQUFXLFVBQVgsQ0FBSixFQUE0QjtBQUMxQixhQUFPLEtBQUssR0FBTCxFQUFQO0FBQ0Q7QUFDRCxXQUFPLEtBQUssS0FBTCxDQUFXLEtBQWxCO0FBQ0Q7QUEzUXlCO2tCQUFQLE07UUE2UUEsSyxHQUFiLFM7UUFDa0IsVSxHQUFsQixjIiwiZmlsZSI6InN5bnRheC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdCwgTWFwfSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcFwiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7VG9rZW5UeXBlLCBUb2tlbkNsYXNzfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IEp1c3RfODE5ID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfODIwID0gTWF5YmUuTm90aGluZztcbmZ1bmN0aW9uIHNpemVEZWNlbmRpbmdfODIxKGFfODI0LCBiXzgyNSkge1xuICBpZiAoYV84MjQuc2NvcGVzLnNpemUgPiBiXzgyNS5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIGlmIChiXzgyNS5zY29wZXMuc2l6ZSA+IGFfODI0LnNjb3Blcy5zaXplKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbmxldCBUeXBlc184MjIgPSB7bnVsbDoge21hdGNoOiB0b2tlbl84MjYgPT4gIVR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODI2KSAmJiB0b2tlbl84MjYudHlwZSA9PT0gVG9rZW5UeXBlLk5VTEwsIGNyZWF0ZTogKHZhbHVlXzgyNywgc3R4XzgyOCkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTEwsIHZhbHVlOiBudWxsfSwgc3R4XzgyOCl9LCBudW1iZXI6IHttYXRjaDogdG9rZW5fODI5ID0+ICFUeXBlc184MjIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgyOSkgJiYgdG9rZW5fODI5LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuTnVtZXJpY0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzgzMCwgc3R4XzgzMSkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTUJFUiwgdmFsdWU6IHZhbHVlXzgzMH0sIHN0eF84MzEpfSwgc3RyaW5nOiB7bWF0Y2g6IHRva2VuXzgzMiA9PiAhVHlwZXNfODIyLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MzIpICYmIHRva2VuXzgzMi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlN0cmluZ0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzgzMywgc3R4XzgzNCkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlNUUklORywgc3RyOiB2YWx1ZV84MzN9LCBzdHhfODM0KX0sIHB1bmN0dWF0b3I6IHttYXRjaDogdG9rZW5fODM1ID0+ICFUeXBlc184MjIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgzNSkgJiYgdG9rZW5fODM1LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgY3JlYXRlOiAodmFsdWVfODM2LCBzdHhfODM3KSA9PiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgbmFtZTogdmFsdWVfODM2fSwgdmFsdWU6IHZhbHVlXzgzNn0sIHN0eF84MzcpfSwga2V5d29yZDoge21hdGNoOiB0b2tlbl84MzggPT4gIVR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODM4KSAmJiB0b2tlbl84MzgudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5LZXl3b3JkLCBjcmVhdGU6ICh2YWx1ZV84MzksIHN0eF84NDApID0+IG5ldyBTeW50YXgoe3R5cGU6IHtrbGFzczogVG9rZW5DbGFzcy5LZXl3b3JkLCBuYW1lOiB2YWx1ZV84Mzl9LCB2YWx1ZTogdmFsdWVfODM5fSwgc3R4Xzg0MCl9LCBpZGVudGlmaWVyOiB7bWF0Y2g6IHRva2VuXzg0MSA9PiAhVHlwZXNfODIyLmRlbGltaXRlci5tYXRjaCh0b2tlbl84NDEpICYmIHRva2VuXzg0MS50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLklkZW50LCBjcmVhdGU6ICh2YWx1ZV84NDIsIHN0eF84NDMpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLCB2YWx1ZTogdmFsdWVfODQyfSwgc3R4Xzg0Myl9LCByZWd1bGFyRXhwcmVzc2lvbjoge21hdGNoOiB0b2tlbl84NDQgPT4gIVR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODQ0KSAmJiB0b2tlbl84NDQudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5SZWd1bGFyRXhwcmVzc2lvbiwgY3JlYXRlOiAodmFsdWVfODQ1LCBzdHhfODQ2KSA9PiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkVHRVhQLCB2YWx1ZTogdmFsdWVfODQ1fSwgc3R4Xzg0Nil9LCBicmFjZXM6IHttYXRjaDogdG9rZW5fODQ3ID0+IFR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODQ3KSAmJiB0b2tlbl84NDcuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0UsIGNyZWF0ZTogKGlubmVyXzg0OCwgc3R4Xzg0OSkgPT4ge1xuICBsZXQgbGVmdF84NTAgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNFLCB2YWx1ZTogXCJ7XCJ9KTtcbiAgbGV0IHJpZ2h0Xzg1MSA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0UsIHZhbHVlOiBcIn1cIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODUwKS5jb25jYXQoaW5uZXJfODQ4KS5wdXNoKHJpZ2h0Xzg1MSksIHN0eF84NDkpO1xufX0sIGJyYWNrZXRzOiB7bWF0Y2g6IHRva2VuXzg1MiA9PiBUeXBlc184MjIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg1MikgJiYgdG9rZW5fODUyLmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNLLCBjcmVhdGU6IChpbm5lcl84NTMsIHN0eF84NTQpID0+IHtcbiAgbGV0IGxlZnRfODU1ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDSywgdmFsdWU6IFwiW1wifSk7XG4gIGxldCByaWdodF84NTYgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkJSQUNLLCB2YWx1ZTogXCJdXCJ9KTtcbiAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0Xzg1NSkuY29uY2F0KGlubmVyXzg1MykucHVzaChyaWdodF84NTYpLCBzdHhfODU0KTtcbn19LCBwYXJlbnM6IHttYXRjaDogdG9rZW5fODU3ID0+IFR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODU3KSAmJiB0b2tlbl84NTcuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MUEFSRU4sIGNyZWF0ZTogKGlubmVyXzg1OCwgc3R4Xzg1OSkgPT4ge1xuICBsZXQgbGVmdF84NjAgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTFBBUkVOLCB2YWx1ZTogXCIoXCJ9KTtcbiAgbGV0IHJpZ2h0Xzg2MSA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SUEFSRU4sIHZhbHVlOiBcIilcIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODYwKS5jb25jYXQoaW5uZXJfODU4KS5wdXNoKHJpZ2h0Xzg2MSksIHN0eF84NTkpO1xufX0sIGFzc2lnbjoge21hdGNoOiB0b2tlbl84NjIgPT4ge1xuICBpZiAoVHlwZXNfODIyLnB1bmN0dWF0b3IubWF0Y2godG9rZW5fODYyKSkge1xuICAgIHN3aXRjaCAodG9rZW5fODYyLnZhbHVlKSB7XG4gICAgICBjYXNlIFwiPVwiOlxuICAgICAgY2FzZSBcInw9XCI6XG4gICAgICBjYXNlIFwiXj1cIjpcbiAgICAgIGNhc2UgXCImPVwiOlxuICAgICAgY2FzZSBcIjw8PVwiOlxuICAgICAgY2FzZSBcIj4+PVwiOlxuICAgICAgY2FzZSBcIj4+Pj1cIjpcbiAgICAgIGNhc2UgXCIrPVwiOlxuICAgICAgY2FzZSBcIi09XCI6XG4gICAgICBjYXNlIFwiKj1cIjpcbiAgICAgIGNhc2UgXCIvPVwiOlxuICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59fSwgYm9vbGVhbjoge21hdGNoOiB0b2tlbl84NjMgPT4gIVR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODYzKSAmJiB0b2tlbl84NjMudHlwZSA9PT0gVG9rZW5UeXBlLlRSVUUgfHwgdG9rZW5fODYzLnR5cGUgPT09IFRva2VuVHlwZS5GQUxTRX0sIHRlbXBsYXRlOiB7bWF0Y2g6IHRva2VuXzg2NCA9PiAhVHlwZXNfODIyLmRlbGltaXRlci5tYXRjaCh0b2tlbl84NjQpICYmIHRva2VuXzg2NC50eXBlID09PSBUb2tlblR5cGUuVEVNUExBVEV9LCBkZWxpbWl0ZXI6IHttYXRjaDogdG9rZW5fODY1ID0+IExpc3QuaXNMaXN0KHRva2VuXzg2NSl9LCBzeW50YXhUZW1wbGF0ZToge21hdGNoOiB0b2tlbl84NjYgPT4gVHlwZXNfODIyLmRlbGltaXRlci5tYXRjaCh0b2tlbl84NjYpICYmIHRva2VuXzg2Ni5nZXQoMCkudmFsKCkgPT09IFwiI2BcIn0sIGVvZjoge21hdGNoOiB0b2tlbl84NjcgPT4gIVR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODY3KSAmJiB0b2tlbl84NjcudHlwZSA9PT0gVG9rZW5UeXBlLkVPU319O1xuO1xuY29uc3QgQUxMX1BIQVNFU184MjMgPSB7fTtcbjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bnRheCB7XG4gIGNvbnN0cnVjdG9yKHRva2VuXzg2OCwgb2xkc3R4Xzg2OSA9IHt9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuXzg2ODtcbiAgICB0aGlzLmJpbmRpbmdzID0gb2xkc3R4Xzg2OS5iaW5kaW5ncyAhPSBudWxsID8gb2xkc3R4Xzg2OS5iaW5kaW5ncyA6IG5ldyBCaW5kaW5nTWFwO1xuICAgIHRoaXMuc2NvcGVzZXRzID0gb2xkc3R4Xzg2OS5zY29wZXNldHMgIT0gbnVsbCA/IG9sZHN0eF84Njkuc2NvcGVzZXRzIDoge2FsbDogTGlzdCgpLCBwaGFzZTogTWFwKCl9O1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgc3RhdGljIG9mKHRva2VuXzg3MCwgc3R4Xzg3MSA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fODcwLCBzdHhfODcxKTtcbiAgfVxuICBzdGF0aWMgZnJvbSh0eXBlXzg3MiwgdmFsdWVfODczLCBzdHhfODc0ID0ge30pIHtcbiAgICBpZiAoIVR5cGVzXzgyMlt0eXBlXzg3Ml0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzg3MiArIFwiIGlzIG5vdCBhIHZhbGlkIHR5cGVcIik7XG4gICAgfSBlbHNlIGlmICghVHlwZXNfODIyW3R5cGVfODcyXS5jcmVhdGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgYSBzeW50YXggZnJvbSB0eXBlIFwiICsgdHlwZV84NzIpO1xuICAgIH1cbiAgICByZXR1cm4gVHlwZXNfODIyW3R5cGVfODcyXS5jcmVhdGUodmFsdWVfODczLCBzdHhfODc0KTtcbiAgfVxuICBmcm9tKHR5cGVfODc1LCB2YWx1ZV84NzYpIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20odHlwZV84NzUsIHZhbHVlXzg3NiwgdGhpcyk7XG4gIH1cbiAgZnJvbU51bGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcIm51bGxcIiwgbnVsbCk7XG4gIH1cbiAgZnJvbU51bWJlcih2YWx1ZV84NzcpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwibnVtYmVyXCIsIHZhbHVlXzg3Nyk7XG4gIH1cbiAgZnJvbVN0cmluZyh2YWx1ZV84NzgpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwic3RyaW5nXCIsIHZhbHVlXzg3OCk7XG4gIH1cbiAgZnJvbVB1bmN0dWF0b3IodmFsdWVfODc5KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInB1bmN0dWF0b3JcIiwgdmFsdWVfODc5KTtcbiAgfVxuICBmcm9tS2V5d29yZCh2YWx1ZV84ODApIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwia2V5d29yZFwiKTtcbiAgfVxuICBmcm9tSWRlbnRpZmllcih2YWx1ZV84ODEpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwiaWRlbnRpZmllclwiLCB2YWx1ZV84ODEpO1xuICB9XG4gIGZyb21SZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV84ODIpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwicmVndWxhckV4cHJlc3Npb25cIiwgdmFsdWVfODgyKTtcbiAgfVxuICBmcm9tQnJhY2VzKGlubmVyXzg4Mykge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJicmFjZXNcIiwgaW5uZXJfODgzKTtcbiAgfVxuICBmcm9tQnJhY2tldHMoaW5uZXJfODg0KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcImJyYWNrZXRzXCIsIGlubmVyXzg4NCk7XG4gIH1cbiAgZnJvbVBhcmVucyhpbm5lcl84ODUpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwicGFyZW5zXCIsIGlubmVyXzg4NSk7XG4gIH1cbiAgc3RhdGljIGZyb21OdWxsKHN0eF84ODYgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcIm51bGxcIiwgbnVsbCwgc3R4Xzg4Nik7XG4gIH1cbiAgc3RhdGljIGZyb21OdW1iZXIodmFsdWVfODg3LCBzdHhfODg4ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJudW1iZXJcIiwgdmFsdWVfODg3LCBzdHhfODg4KTtcbiAgfVxuICBzdGF0aWMgZnJvbVN0cmluZyh2YWx1ZV84ODksIHN0eF84OTAgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInN0cmluZ1wiLCB2YWx1ZV84ODksIHN0eF84OTApO1xuICB9XG4gIHN0YXRpYyBmcm9tUHVuY3R1YXRvcih2YWx1ZV84OTEsIHN0eF84OTIgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInB1bmN0dWF0b3JcIiwgdmFsdWVfODkxLCBzdHhfODkyKTtcbiAgfVxuICBzdGF0aWMgZnJvbUtleXdvcmQodmFsdWVfODkzLCBzdHhfODk0ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJrZXl3b3JkXCIsIHZhbHVlXzg5Mywgc3R4Xzg5NCk7XG4gIH1cbiAgc3RhdGljIGZyb21JZGVudGlmaWVyKHZhbHVlXzg5NSwgc3R4Xzg5NiA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwiaWRlbnRpZmllclwiLCB2YWx1ZV84OTUsIHN0eF84OTYpO1xuICB9XG4gIHN0YXRpYyBmcm9tUmVndWxhckV4cHJlc3Npb24odmFsdWVfODk3LCBzdHhfODk4ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV84OTcsIHN0eF84OTgpO1xuICB9XG4gIHN0YXRpYyBmcm9tQnJhY2VzKGlubmVyXzg5OSwgc3R4XzkwMCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwiYnJhY2VzXCIsIGlubmVyXzg5OSwgc3R4XzkwMCk7XG4gIH1cbiAgc3RhdGljIGZyb21CcmFja2V0cyhpbm5lcl85MDEsIHN0eF85MDIgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImJyYWNrZXRzXCIsIGlubmVyXzkwMSwgc3R4XzkwMik7XG4gIH1cbiAgc3RhdGljIGZyb21QYXJlbnMoaW5uZXJfOTAzLCBzdHhfOTA0ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJwYXJlbnNcIiwgaW5uZXJfOTAzLCBzdHhfOTA0KTtcbiAgfVxuICByZXNvbHZlKHBoYXNlXzkwNSkge1xuICAgIGFzc2VydChwaGFzZV85MDUgIT0gbnVsbCwgXCJtdXN0IHByb3ZpZGUgYSBwaGFzZSB0byByZXNvbHZlXCIpO1xuICAgIGxldCBhbGxTY29wZXNfOTA2ID0gdGhpcy5zY29wZXNldHMuYWxsO1xuICAgIGxldCBzdHhTY29wZXNfOTA3ID0gdGhpcy5zY29wZXNldHMucGhhc2UuaGFzKHBoYXNlXzkwNSkgPyB0aGlzLnNjb3Blc2V0cy5waGFzZS5nZXQocGhhc2VfOTA1KSA6IExpc3QoKTtcbiAgICBzdHhTY29wZXNfOTA3ID0gYWxsU2NvcGVzXzkwNi5jb25jYXQoc3R4U2NvcGVzXzkwNyk7XG4gICAgaWYgKHN0eFNjb3Blc185MDcuc2l6ZSA9PT0gMCB8fCAhKHRoaXMubWF0Y2goXCJpZGVudGlmaWVyXCIpIHx8IHRoaXMubWF0Y2goXCJrZXl3b3JkXCIpKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gICAgfVxuICAgIGxldCBzY29wZV85MDggPSBzdHhTY29wZXNfOTA3Lmxhc3QoKTtcbiAgICBsZXQgYmluZGluZ3NfOTA5ID0gdGhpcy5iaW5kaW5ncztcbiAgICBpZiAoc2NvcGVfOTA4KSB7XG4gICAgICBsZXQgc2NvcGVzZXRCaW5kaW5nTGlzdCA9IGJpbmRpbmdzXzkwOS5nZXQodGhpcyk7XG4gICAgICBpZiAoc2NvcGVzZXRCaW5kaW5nTGlzdCkge1xuICAgICAgICBsZXQgYmlnZ2VzdEJpbmRpbmdQYWlyID0gc2NvcGVzZXRCaW5kaW5nTGlzdC5maWx0ZXIoKHtzY29wZXMsIGJpbmRpbmd9KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHNjb3Blcy5pc1N1YnNldChzdHhTY29wZXNfOTA3KTtcbiAgICAgICAgfSkuc29ydChzaXplRGVjZW5kaW5nXzgyMSk7XG4gICAgICAgIGlmIChiaWdnZXN0QmluZGluZ1BhaXIuc2l6ZSA+PSAyICYmIGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuc2NvcGVzLnNpemUgPT09IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMSkuc2NvcGVzLnNpemUpIHtcbiAgICAgICAgICBsZXQgZGVidWdCYXNlID0gXCJ7XCIgKyBzdHhTY29wZXNfOTA3Lm1hcChzXzkxMCA9PiBzXzkxMC50b1N0cmluZygpKS5qb2luKFwiLCBcIikgKyBcIn1cIjtcbiAgICAgICAgICBsZXQgZGVidWdBbWJpZ291c1Njb3Blc2V0cyA9IGJpZ2dlc3RCaW5kaW5nUGFpci5tYXAoKHtzY29wZXN9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXCJ7XCIgKyBzY29wZXMubWFwKHNfOTExID0+IHNfOTExLnRvU3RyaW5nKCkpLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuICAgICAgICAgIH0pLmpvaW4oXCIsIFwiKTtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY29wZXNldCBcIiArIGRlYnVnQmFzZSArIFwiIGhhcyBhbWJpZ3VvdXMgc3Vic2V0cyBcIiArIGRlYnVnQW1iaWdvdXNTY29wZXNldHMpO1xuICAgICAgICB9IGVsc2UgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplICE9PSAwKSB7XG4gICAgICAgICAgbGV0IGJpbmRpbmdTdHIgPSBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmJpbmRpbmcudG9TdHJpbmcoKTtcbiAgICAgICAgICBpZiAoTWF5YmUuaXNKdXN0KGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYWxpYXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcy5nZXRPckVsc2UobnVsbCkucmVzb2x2ZShwaGFzZV85MDUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYmluZGluZ1N0cjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxuICB2YWwoKSB7XG4gICAgYXNzZXJ0KCF0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpLCBcImNhbm5vdCBnZXQgdGhlIHZhbCBvZiBhIGRlbGltaXRlclwiKTtcbiAgICBpZiAodGhpcy5tYXRjaChcInN0cmluZ1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcInRlbXBsYXRlXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5pdGVtcy5tYXAoZWxfOTEyID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbF85MTIubWF0Y2ggPT09IFwiZnVuY3Rpb25cIiAmJiBlbF85MTIubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgICAgICByZXR1cm4gXCIkey4uLn1cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxfOTEyLnNsaWNlLnRleHQ7XG4gICAgICB9KS5qb2luKFwiXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxuICBsaW5lTnVtYmVyKCkge1xuICAgIGlmICghdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uc2xpY2Uuc3RhcnRMb2NhdGlvbi5saW5lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5nZXQoMCkubGluZU51bWJlcigpO1xuICAgIH1cbiAgfVxuICBzZXRMaW5lTnVtYmVyKGxpbmVfOTEzKSB7XG4gICAgbGV0IG5ld1Rva185MTQgPSB7fTtcbiAgICBpZiAodGhpcy5pc0RlbGltaXRlcigpKSB7XG4gICAgICBuZXdUb2tfOTE0ID0gdGhpcy50b2tlbi5tYXAoc185MTUgPT4gc185MTUuc2V0TGluZU51bWJlcihsaW5lXzkxMykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXModGhpcy50b2tlbikpIHtcbiAgICAgICAgbmV3VG9rXzkxNFtrZXldID0gdGhpcy50b2tlbltrZXldO1xuICAgICAgfVxuICAgICAgYXNzZXJ0KG5ld1Rva185MTQuc2xpY2UgJiYgbmV3VG9rXzkxNC5zbGljZS5zdGFydExvY2F0aW9uLCBcImFsbCB0b2tlbnMgbXVzdCBoYXZlIGxpbmUgaW5mb1wiKTtcbiAgICAgIG5ld1Rva185MTQuc2xpY2Uuc3RhcnRMb2NhdGlvbi5saW5lID0gbGluZV85MTM7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KG5ld1Rva185MTQsIHRoaXMpO1xuICB9XG4gIGlubmVyKCkge1xuICAgIGFzc2VydCh0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpLCBcImNhbiBvbmx5IGdldCB0aGUgaW5uZXIgb2YgYSBkZWxpbWl0ZXJcIik7XG4gICAgcmV0dXJuIHRoaXMudG9rZW4uc2xpY2UoMSwgdGhpcy50b2tlbi5zaXplIC0gMSk7XG4gIH1cbiAgYWRkU2NvcGUoc2NvcGVfOTE2LCBiaW5kaW5nc185MTcsIHBoYXNlXzkxOCwgb3B0aW9uc185MTkgPSB7ZmxpcDogZmFsc2V9KSB7XG4gICAgbGV0IHRva2VuXzkyMCA9IHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikgPyB0aGlzLnRva2VuLm1hcChzXzkyNCA9PiBzXzkyNC5hZGRTY29wZShzY29wZV85MTYsIGJpbmRpbmdzXzkxNywgcGhhc2VfOTE4LCBvcHRpb25zXzkxOSkpIDogdGhpcy50b2tlbjtcbiAgICBpZiAodGhpcy5tYXRjaChcInRlbXBsYXRlXCIpKSB7XG4gICAgICB0b2tlbl85MjAgPSBfLm1lcmdlKHRva2VuXzkyMCwge2l0ZW1zOiB0b2tlbl85MjAuaXRlbXMubWFwKGl0XzkyNSA9PiB7XG4gICAgICAgIGlmIChpdF85MjUgaW5zdGFuY2VvZiBTeW50YXggJiYgaXRfOTI1Lm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGl0XzkyNS5hZGRTY29wZShzY29wZV85MTYsIGJpbmRpbmdzXzkxNywgcGhhc2VfOTE4LCBvcHRpb25zXzkxOSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0XzkyNTtcbiAgICAgIH0pfSk7XG4gICAgfVxuICAgIGxldCBvbGRTY29wZXNldF85MjE7XG4gICAgaWYgKHBoYXNlXzkxOCA9PT0gQUxMX1BIQVNFU184MjMpIHtcbiAgICAgIG9sZFNjb3Blc2V0XzkyMSA9IHRoaXMuc2NvcGVzZXRzLmFsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkU2NvcGVzZXRfOTIxID0gdGhpcy5zY29wZXNldHMucGhhc2UuaGFzKHBoYXNlXzkxOCkgPyB0aGlzLnNjb3Blc2V0cy5waGFzZS5nZXQocGhhc2VfOTE4KSA6IExpc3QoKTtcbiAgICB9XG4gICAgbGV0IG5ld1Njb3Blc2V0XzkyMjtcbiAgICBpZiAob3B0aW9uc185MTkuZmxpcCkge1xuICAgICAgbGV0IGluZGV4ID0gb2xkU2NvcGVzZXRfOTIxLmluZGV4T2Yoc2NvcGVfOTE2KTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbmV3U2NvcGVzZXRfOTIyID0gb2xkU2NvcGVzZXRfOTIxLnJlbW92ZShpbmRleCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTY29wZXNldF85MjIgPSBvbGRTY29wZXNldF85MjEucHVzaChzY29wZV85MTYpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdTY29wZXNldF85MjIgPSBvbGRTY29wZXNldF85MjEucHVzaChzY29wZV85MTYpO1xuICAgIH1cbiAgICBsZXQgbmV3c3R4XzkyMyA9IHtiaW5kaW5nczogYmluZGluZ3NfOTE3LCBzY29wZXNldHM6IHthbGw6IHRoaXMuc2NvcGVzZXRzLmFsbCwgcGhhc2U6IHRoaXMuc2NvcGVzZXRzLnBoYXNlfX07XG4gICAgaWYgKHBoYXNlXzkxOCA9PT0gQUxMX1BIQVNFU184MjMpIHtcbiAgICAgIG5ld3N0eF85MjMuc2NvcGVzZXRzLmFsbCA9IG5ld1Njb3Blc2V0XzkyMjtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3c3R4XzkyMy5zY29wZXNldHMucGhhc2UgPSBuZXdzdHhfOTIzLnNjb3Blc2V0cy5waGFzZS5zZXQocGhhc2VfOTE4LCBuZXdTY29wZXNldF85MjIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl85MjAsIG5ld3N0eF85MjMpO1xuICB9XG4gIHJlbW92ZVNjb3BlKHNjb3BlXzkyNiwgcGhhc2VfOTI3KSB7XG4gICAgbGV0IHRva2VuXzkyOCA9IHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikgPyB0aGlzLnRva2VuLm1hcChzXzkzNCA9PiBzXzkzNC5yZW1vdmVTY29wZShzY29wZV85MjYsIHBoYXNlXzkyNykpIDogdGhpcy50b2tlbjtcbiAgICBsZXQgcGhhc2VTY29wZXNldF85MjkgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfOTI3KSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV85MjcpIDogTGlzdCgpO1xuICAgIGxldCBhbGxTY29wZXNldF85MzAgPSB0aGlzLnNjb3Blc2V0cy5hbGw7XG4gICAgbGV0IG5ld3N0eF85MzEgPSB7YmluZGluZ3M6IHRoaXMuYmluZGluZ3MsIHNjb3Blc2V0czoge2FsbDogdGhpcy5zY29wZXNldHMuYWxsLCBwaGFzZTogdGhpcy5zY29wZXNldHMucGhhc2V9fTtcbiAgICBsZXQgcGhhc2VJbmRleF85MzIgPSBwaGFzZVNjb3Blc2V0XzkyOS5pbmRleE9mKHNjb3BlXzkyNik7XG4gICAgbGV0IGFsbEluZGV4XzkzMyA9IGFsbFNjb3Blc2V0XzkzMC5pbmRleE9mKHNjb3BlXzkyNik7XG4gICAgaWYgKHBoYXNlSW5kZXhfOTMyICE9PSAtMSkge1xuICAgICAgbmV3c3R4XzkzMS5zY29wZXNldHMucGhhc2UgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5zZXQocGhhc2VfOTI3LCBwaGFzZVNjb3Blc2V0XzkyOS5yZW1vdmUocGhhc2VJbmRleF85MzIpKTtcbiAgICB9IGVsc2UgaWYgKGFsbEluZGV4XzkzMyAhPT0gLTEpIHtcbiAgICAgIG5ld3N0eF85MzEuc2NvcGVzZXRzLmFsbCA9IGFsbFNjb3Blc2V0XzkzMC5yZW1vdmUoYWxsSW5kZXhfOTMzKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fOTI4LCBuZXdzdHhfOTMxKTtcbiAgfVxuICBtYXRjaCh0eXBlXzkzNSwgdmFsdWVfOTM2KSB7XG4gICAgaWYgKCFUeXBlc184MjJbdHlwZV85MzVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IodHlwZV85MzUgKyBcIiBpcyBhbiBpbnZhbGlkIHR5cGVcIik7XG4gICAgfVxuICAgIHJldHVybiBUeXBlc184MjJbdHlwZV85MzVdLm1hdGNoKHRoaXMudG9rZW4pICYmICh2YWx1ZV85MzYgPT0gbnVsbCB8fCAodmFsdWVfOTM2IGluc3RhbmNlb2YgUmVnRXhwID8gdmFsdWVfOTM2LnRlc3QodGhpcy52YWwoKSkgOiB0aGlzLnZhbCgpID09IHZhbHVlXzkzNikpO1xuICB9XG4gIGlzSWRlbnRpZmllcih2YWx1ZV85MzcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImlkZW50aWZpZXJcIiwgdmFsdWVfOTM3KTtcbiAgfVxuICBpc0Fzc2lnbih2YWx1ZV85MzgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImFzc2lnblwiLCB2YWx1ZV85MzgpO1xuICB9XG4gIGlzQm9vbGVhbkxpdGVyYWwodmFsdWVfOTM5KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJib29sZWFuXCIsIHZhbHVlXzkzOSk7XG4gIH1cbiAgaXNLZXl3b3JkKHZhbHVlXzk0MCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwia2V5d29yZFwiLCB2YWx1ZV85NDApO1xuICB9XG4gIGlzTnVsbExpdGVyYWwodmFsdWVfOTQxKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJudWxsXCIsIHZhbHVlXzk0MSk7XG4gIH1cbiAgaXNOdW1lcmljTGl0ZXJhbCh2YWx1ZV85NDIpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bWJlclwiLCB2YWx1ZV85NDIpO1xuICB9XG4gIGlzUHVuY3R1YXRvcih2YWx1ZV85NDMpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInB1bmN0dWF0b3JcIiwgdmFsdWVfOTQzKTtcbiAgfVxuICBpc1N0cmluZ0xpdGVyYWwodmFsdWVfOTQ0KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzdHJpbmdcIiwgdmFsdWVfOTQ0KTtcbiAgfVxuICBpc1JlZ3VsYXJFeHByZXNzaW9uKHZhbHVlXzk0NSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicmVndWxhckV4cHJlc3Npb25cIiwgdmFsdWVfOTQ1KTtcbiAgfVxuICBpc1RlbXBsYXRlKHZhbHVlXzk0Nikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwidGVtcGxhdGVcIiwgdmFsdWVfOTQ2KTtcbiAgfVxuICBpc0RlbGltaXRlcih2YWx1ZV85NDcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImRlbGltaXRlclwiLCB2YWx1ZV85NDcpO1xuICB9XG4gIGlzUGFyZW5zKHZhbHVlXzk0OCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicGFyZW5zXCIsIHZhbHVlXzk0OCk7XG4gIH1cbiAgaXNCcmFjZXModmFsdWVfOTQ5KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFjZXNcIiwgdmFsdWVfOTQ5KTtcbiAgfVxuICBpc0JyYWNrZXRzKHZhbHVlXzk1MCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYnJhY2tldHNcIiwgdmFsdWVfOTUwKTtcbiAgfVxuICBpc1N5bnRheFRlbXBsYXRlKHZhbHVlXzk1MSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwic3ludGF4VGVtcGxhdGVcIiwgdmFsdWVfOTUxKTtcbiAgfVxuICBpc0VPRih2YWx1ZV85NTIpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImVvZlwiLCB2YWx1ZV85NTIpO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIGlmICh0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5tYXAoc185NTMgPT4gc185NTMudG9TdHJpbmcoKSkuam9pbihcIiBcIik7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwic3RyaW5nXCIpKSB7XG4gICAgICByZXR1cm4gXCInXCIgKyB0aGlzLnRva2VuLnN0cjtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG59XG5leHBvcnQge1R5cGVzXzgyMiBhcyBUeXBlc307XG5leHBvcnQge0FMTF9QSEFTRVNfODIzIGFzIEFMTF9QSEFTRVN9Il19