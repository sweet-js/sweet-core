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
function getFirstSlice_827(stx_831) {
  if (!stx_831 || typeof stx_831.isDelimiter !== "function") return null;
  if (!stx_831.isDelimiter()) {
    return stx_831.token.slice;
  }
  return stx_831.token.get(0).token.slice;
}
function sizeDecending_828(a_832, b_833) {
  if (a_832.scopes.size > b_833.scopes.size) {
    return -1;
  } else if (b_833.scopes.size > a_832.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}
let Types_829 = { null: { match: token_834 => !Types_829.delimiter.match(token_834) && token_834.type === _tokenizer.TokenType.NULL, create: (value_835, stx_836) => new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_836) }, number: { match: token_837 => !Types_829.delimiter.match(token_837) && token_837.type.klass === _tokenizer.TokenClass.NumericLiteral, create: (value_838, stx_839) => new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_838 }, stx_839) }, string: { match: token_840 => !Types_829.delimiter.match(token_840) && token_840.type.klass === _tokenizer.TokenClass.StringLiteral, create: (value_841, stx_842) => new Syntax({ type: _tokenizer.TokenType.STRING, str: value_841 }, stx_842) }, punctuator: { match: token_843 => !Types_829.delimiter.match(token_843) && token_843.type.klass === _tokenizer.TokenClass.Punctuator, create: (value_844, stx_845) => new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_844 }, value: value_844 }, stx_845) }, keyword: { match: token_846 => !Types_829.delimiter.match(token_846) && token_846.type.klass === _tokenizer.TokenClass.Keyword, create: (value_847, stx_848) => new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_847 }, value: value_847 }, stx_848) }, identifier: { match: token_849 => !Types_829.delimiter.match(token_849) && token_849.type.klass === _tokenizer.TokenClass.Ident, create: (value_850, stx_851) => new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_850 }, stx_851) }, regularExpression: { match: token_852 => !Types_829.delimiter.match(token_852) && token_852.type.klass === _tokenizer.TokenClass.RegularExpression, create: (value_853, stx_854) => new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_853 }, stx_854) }, braces: { match: token_855 => Types_829.delimiter.match(token_855) && token_855.get(0).token.type === _tokenizer.TokenType.LBRACE, create: (inner_856, stx_857) => {
      let left_858 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{", slice: getFirstSlice_827(stx_857) });
      let right_859 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}", slice: getFirstSlice_827(stx_857) });
      return new Syntax(_immutable.List.of(left_858).concat(inner_856).push(right_859), stx_857);
    } }, brackets: { match: token_860 => Types_829.delimiter.match(token_860) && token_860.get(0).token.type === _tokenizer.TokenType.LBRACK, create: (inner_861, stx_862) => {
      let left_863 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[", slice: getFirstSlice_827(stx_862) });
      let right_864 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]", slice: getFirstSlice_827(stx_862) });
      return new Syntax(_immutable.List.of(left_863).concat(inner_861).push(right_864), stx_862);
    } }, parens: { match: token_865 => Types_829.delimiter.match(token_865) && token_865.get(0).token.type === _tokenizer.TokenType.LPAREN, create: (inner_866, stx_867) => {
      let left_868 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(", slice: getFirstSlice_827(stx_867) });
      let right_869 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")", slice: getFirstSlice_827(stx_867) });
      return new Syntax(_immutable.List.of(left_868).concat(inner_866).push(right_869), stx_867);
    } }, assign: { match: token_870 => {
      if (Types_829.punctuator.match(token_870)) {
        switch (token_870.value) {
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
    } }, boolean: { match: token_871 => !Types_829.delimiter.match(token_871) && token_871.type === _tokenizer.TokenType.TRUE || token_871.type === _tokenizer.TokenType.FALSE }, template: { match: token_872 => !Types_829.delimiter.match(token_872) && token_872.type === _tokenizer.TokenType.TEMPLATE }, delimiter: { match: token_873 => _immutable.List.isList(token_873) }, syntaxTemplate: { match: token_874 => Types_829.delimiter.match(token_874) && token_874.get(0).val() === "#`" }, eof: { match: token_875 => !Types_829.delimiter.match(token_875) && token_875.type === _tokenizer.TokenType.EOS } };
;
const ALL_PHASES_830 = {};
;
class Syntax {
  constructor(token_876) {
    let oldstx_877 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.token = token_876;
    this.bindings = oldstx_877.bindings != null ? oldstx_877.bindings : new _bindingMap2.default();
    this.scopesets = oldstx_877.scopesets != null ? oldstx_877.scopesets : { all: (0, _immutable.List)(), phase: (0, _immutable.Map)() };
    Object.freeze(this);
  }
  static of(token_878) {
    let stx_879 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Syntax(token_878, stx_879);
  }
  static from(type_880, value_881) {
    let stx_882 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!Types_829[type_880]) {
      throw new Error(type_880 + " is not a valid type");
    } else if (!Types_829[type_880].create) {
      throw new Error("Cannot create a syntax from type " + type_880);
    }
    let newstx_883 = Types_829[type_880].create(value_881, stx_882);
    let slice_884 = getFirstSlice_827(stx_882);
    if (slice_884 != null) {
      newstx_883.token.slice = slice_884;
    }
    return newstx_883;
  }
  from(type_885, value_886) {
    return Syntax.from(type_885, value_886, this);
  }
  fromNull() {
    return this.from("null", null);
  }
  fromNumber(value_887) {
    return this.from("number", value_887);
  }
  fromString(value_888) {
    return this.from("string", value_888);
  }
  fromPunctuator(value_889) {
    return this.from("punctuator", value_889);
  }
  fromKeyword(value_890) {
    return this.from("keyword");
  }
  fromIdentifier(value_891) {
    return this.from("identifier", value_891);
  }
  fromRegularExpression(value_892) {
    return this.from("regularExpression", value_892);
  }
  fromBraces(inner_893) {
    return this.from("braces", inner_893);
  }
  fromBrackets(inner_894) {
    return this.from("brackets", inner_894);
  }
  fromParens(inner_895) {
    return this.from("parens", inner_895);
  }
  static fromNull() {
    let stx_896 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return Syntax.from("null", null, stx_896);
  }
  static fromNumber(value_897) {
    let stx_898 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("number", value_897, stx_898);
  }
  static fromString(value_899) {
    let stx_900 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("string", value_899, stx_900);
  }
  static fromPunctuator(value_901) {
    let stx_902 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("punctuator", value_901, stx_902);
  }
  static fromKeyword(value_903) {
    let stx_904 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("keyword", value_903, stx_904);
  }
  static fromIdentifier(value_905) {
    let stx_906 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("identifier", value_905, stx_906);
  }
  static fromRegularExpression(value_907) {
    let stx_908 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("regularExpression", value_907, stx_908);
  }
  static fromBraces(inner_909) {
    let stx_910 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("braces", inner_909, stx_910);
  }
  static fromBrackets(inner_911) {
    let stx_912 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("brackets", inner_911, stx_912);
  }
  static fromParens(inner_913) {
    let stx_914 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("parens", inner_913, stx_914);
  }
  resolve(phase_915) {
    (0, _errors.assert)(phase_915 != null, "must provide a phase to resolve");
    let allScopes_916 = this.scopesets.all;
    let stxScopes_917 = this.scopesets.phase.has(phase_915) ? this.scopesets.phase.get(phase_915) : (0, _immutable.List)();
    stxScopes_917 = allScopes_916.concat(stxScopes_917);
    if (stxScopes_917.size === 0 || !(this.match("identifier") || this.match("keyword"))) {
      return this.token.value;
    }
    let scope_918 = stxScopes_917.last();
    let bindings_919 = this.bindings;
    if (scope_918) {
      let scopesetBindingList = bindings_919.get(this);
      if (scopesetBindingList) {
        let biggestBindingPair = scopesetBindingList.filter(_ref => {
          let scopes = _ref.scopes;
          let binding = _ref.binding;

          return scopes.isSubset(stxScopes_917);
        }).sort(sizeDecending_828);
        if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
          let debugBase = "{" + stxScopes_917.map(s_920 => s_920.toString()).join(", ") + "}";
          let debugAmbigousScopesets = biggestBindingPair.map(_ref2 => {
            let scopes = _ref2.scopes;

            return "{" + scopes.map(s_921 => s_921.toString()).join(", ") + "}";
          }).join(", ");
          throw new Error("Scopeset " + debugBase + " has ambiguous subsets " + debugAmbigousScopesets);
        } else if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve(phase_915);
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
      return this.token.items.map(el_922 => {
        if (typeof el_922.match === "function" && el_922.match("delimiter")) {
          return "${...}";
        }
        return el_922.slice.text;
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
  setLineNumber(line_923) {
    let newTok_924 = {};
    if (this.isDelimiter()) {
      newTok_924 = this.token.map(s_925 => s_925.setLineNumber(line_923));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok_924[key] = this.token[key];
      }
      (0, _errors.assert)(newTok_924.slice && newTok_924.slice.startLocation, "all tokens must have line info");
      newTok_924.slice.startLocation.line = line_923;
    }
    return new Syntax(newTok_924, this);
  }
  inner() {
    (0, _errors.assert)(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }
  addScope(scope_926, bindings_927, phase_928) {
    let options_929 = arguments.length <= 3 || arguments[3] === undefined ? { flip: false } : arguments[3];

    let token_930 = this.match("delimiter") ? this.token.map(s_934 => s_934.addScope(scope_926, bindings_927, phase_928, options_929)) : this.token;
    if (this.match("template")) {
      token_930 = _.merge(token_930, { items: token_930.items.map(it_935 => {
          if (it_935 instanceof Syntax && it_935.match("delimiter")) {
            return it_935.addScope(scope_926, bindings_927, phase_928, options_929);
          }
          return it_935;
        }) });
    }
    let oldScopeset_931;
    if (phase_928 === ALL_PHASES_830) {
      oldScopeset_931 = this.scopesets.all;
    } else {
      oldScopeset_931 = this.scopesets.phase.has(phase_928) ? this.scopesets.phase.get(phase_928) : (0, _immutable.List)();
    }
    let newScopeset_932;
    if (options_929.flip) {
      let index = oldScopeset_931.indexOf(scope_926);
      if (index !== -1) {
        newScopeset_932 = oldScopeset_931.remove(index);
      } else {
        newScopeset_932 = oldScopeset_931.push(scope_926);
      }
    } else {
      newScopeset_932 = oldScopeset_931.push(scope_926);
    }
    let newstx_933 = { bindings: bindings_927, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    if (phase_928 === ALL_PHASES_830) {
      newstx_933.scopesets.all = newScopeset_932;
    } else {
      newstx_933.scopesets.phase = newstx_933.scopesets.phase.set(phase_928, newScopeset_932);
    }
    return new Syntax(token_930, newstx_933);
  }
  removeScope(scope_936, phase_937) {
    let token_938 = this.match("delimiter") ? this.token.map(s_944 => s_944.removeScope(scope_936, phase_937)) : this.token;
    let phaseScopeset_939 = this.scopesets.phase.has(phase_937) ? this.scopesets.phase.get(phase_937) : (0, _immutable.List)();
    let allScopeset_940 = this.scopesets.all;
    let newstx_941 = { bindings: this.bindings, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    let phaseIndex_942 = phaseScopeset_939.indexOf(scope_936);
    let allIndex_943 = allScopeset_940.indexOf(scope_936);
    if (phaseIndex_942 !== -1) {
      newstx_941.scopesets.phase = this.scopesets.phase.set(phase_937, phaseScopeset_939.remove(phaseIndex_942));
    } else if (allIndex_943 !== -1) {
      newstx_941.scopesets.all = allScopeset_940.remove(allIndex_943);
    }
    return new Syntax(token_938, newstx_941);
  }
  match(type_945, value_946) {
    if (!Types_829[type_945]) {
      throw new Error(type_945 + " is an invalid type");
    }
    return Types_829[type_945].match(this.token) && (value_946 == null || (value_946 instanceof RegExp ? value_946.test(this.val()) : this.val() == value_946));
  }
  isIdentifier(value_947) {
    return this.match("identifier", value_947);
  }
  isAssign(value_948) {
    return this.match("assign", value_948);
  }
  isBooleanLiteral(value_949) {
    return this.match("boolean", value_949);
  }
  isKeyword(value_950) {
    return this.match("keyword", value_950);
  }
  isNullLiteral(value_951) {
    return this.match("null", value_951);
  }
  isNumericLiteral(value_952) {
    return this.match("number", value_952);
  }
  isPunctuator(value_953) {
    return this.match("punctuator", value_953);
  }
  isStringLiteral(value_954) {
    return this.match("string", value_954);
  }
  isRegularExpression(value_955) {
    return this.match("regularExpression", value_955);
  }
  isTemplate(value_956) {
    return this.match("template", value_956);
  }
  isDelimiter(value_957) {
    return this.match("delimiter", value_957);
  }
  isParens(value_958) {
    return this.match("parens", value_958);
  }
  isBraces(value_959) {
    return this.match("braces", value_959);
  }
  isBrackets(value_960) {
    return this.match("brackets", value_960);
  }
  isSyntaxTemplate(value_961) {
    return this.match("syntaxTemplate", value_961);
  }
  isEOF(value_962) {
    return this.match("eof", value_962);
  }
  toString() {
    if (this.match("delimiter")) {
      return this.token.map(s_963 => s_963.toString()).join(" ");
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
exports.Types = Types_829;
exports.ALL_PHASES = ALL_PHASES_830;
//# sourceMappingURL=data:application/json;base64,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QUFDRCxRQUFNLFNBQU4sRUFBaUI7QUFDZixXQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsRUFBa0IsU0FBbEIsQ0FBUDtBQUNEO0FBQ0QsYUFBVztBQUNULFFBQUksS0FBSyxLQUFMLENBQVcsV0FBWCxDQUFKLEVBQTZCO0FBQzNCLGFBQU8sS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFNBQVMsTUFBTSxRQUFOLEVBQXhCLEVBQTBDLElBQTFDLENBQStDLEdBQS9DLENBQVA7QUFDRDtBQUNELFFBQUksS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFKLEVBQTBCO0FBQ3hCLGFBQU8sTUFBTSxLQUFLLEtBQUwsQ0FBVyxHQUF4QjtBQUNEO0FBQ0QsUUFBSSxLQUFLLEtBQUwsQ0FBVyxVQUFYLENBQUosRUFBNEI7QUFDMUIsYUFBTyxLQUFLLEdBQUwsRUFBUDtBQUNEO0FBQ0QsV0FBTyxLQUFLLEtBQUwsQ0FBVyxLQUFsQjtBQUNEO0FBaFJ5QjtrQkFBUCxNO1FBa1JBLEssR0FBYixTO1FBQ2tCLFUsR0FBbEIsYyIsImZpbGUiOiJzeW50YXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3QsIE1hcH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHthc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IEJpbmRpbmdNYXAgZnJvbSBcIi4vYmluZGluZy1tYXBcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQge1Rva2VuVHlwZSwgVG9rZW5DbGFzc30gZnJvbSBcInNoaWZ0LXBhcnNlci9kaXN0L3Rva2VuaXplclwiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5jb25zdCBKdXN0XzgyNSA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzgyNiA9IE1heWJlLk5vdGhpbmc7XG5mdW5jdGlvbiBnZXRGaXJzdFNsaWNlXzgyNyhzdHhfODMxKSB7XG4gIGlmICghc3R4XzgzMSB8fCB0eXBlb2Ygc3R4XzgzMS5pc0RlbGltaXRlciAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gbnVsbDtcbiAgaWYgKCFzdHhfODMxLmlzRGVsaW1pdGVyKCkpIHtcbiAgICByZXR1cm4gc3R4XzgzMS50b2tlbi5zbGljZTtcbiAgfVxuICByZXR1cm4gc3R4XzgzMS50b2tlbi5nZXQoMCkudG9rZW4uc2xpY2U7XG59XG5mdW5jdGlvbiBzaXplRGVjZW5kaW5nXzgyOChhXzgzMiwgYl84MzMpIHtcbiAgaWYgKGFfODMyLnNjb3Blcy5zaXplID4gYl84MzMuc2NvcGVzLnNpemUpIHtcbiAgICByZXR1cm4gLTE7XG4gIH0gZWxzZSBpZiAoYl84MzMuc2NvcGVzLnNpemUgPiBhXzgzMi5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAxO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAwO1xuICB9XG59XG5sZXQgVHlwZXNfODI5ID0ge251bGw6IHttYXRjaDogdG9rZW5fODM0ID0+ICFUeXBlc184MjkuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgzNCkgJiYgdG9rZW5fODM0LnR5cGUgPT09IFRva2VuVHlwZS5OVUxMLCBjcmVhdGU6ICh2YWx1ZV84MzUsIHN0eF84MzYpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5OVUxMLCB2YWx1ZTogbnVsbH0sIHN0eF84MzYpfSwgbnVtYmVyOiB7bWF0Y2g6IHRva2VuXzgzNyA9PiAhVHlwZXNfODI5LmRlbGltaXRlci5tYXRjaCh0b2tlbl84MzcpICYmIHRva2VuXzgzNy50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLk51bWVyaWNMaXRlcmFsLCBjcmVhdGU6ICh2YWx1ZV84MzgsIHN0eF84MzkpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5OVU1CRVIsIHZhbHVlOiB2YWx1ZV84Mzh9LCBzdHhfODM5KX0sIHN0cmluZzoge21hdGNoOiB0b2tlbl84NDAgPT4gIVR5cGVzXzgyOS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODQwKSAmJiB0b2tlbl84NDAudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5TdHJpbmdMaXRlcmFsLCBjcmVhdGU6ICh2YWx1ZV84NDEsIHN0eF84NDIpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5TVFJJTkcsIHN0cjogdmFsdWVfODQxfSwgc3R4Xzg0Mil9LCBwdW5jdHVhdG9yOiB7bWF0Y2g6IHRva2VuXzg0MyA9PiAhVHlwZXNfODI5LmRlbGltaXRlci5tYXRjaCh0b2tlbl84NDMpICYmIHRva2VuXzg0My50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlB1bmN0dWF0b3IsIGNyZWF0ZTogKHZhbHVlXzg0NCwgc3R4Xzg0NSkgPT4gbmV3IFN5bnRheCh7dHlwZToge2tsYXNzOiBUb2tlbkNsYXNzLlB1bmN0dWF0b3IsIG5hbWU6IHZhbHVlXzg0NH0sIHZhbHVlOiB2YWx1ZV84NDR9LCBzdHhfODQ1KX0sIGtleXdvcmQ6IHttYXRjaDogdG9rZW5fODQ2ID0+ICFUeXBlc184MjkuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg0NikgJiYgdG9rZW5fODQ2LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuS2V5d29yZCwgY3JlYXRlOiAodmFsdWVfODQ3LCBzdHhfODQ4KSA9PiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuS2V5d29yZCwgbmFtZTogdmFsdWVfODQ3fSwgdmFsdWU6IHZhbHVlXzg0N30sIHN0eF84NDgpfSwgaWRlbnRpZmllcjoge21hdGNoOiB0b2tlbl84NDkgPT4gIVR5cGVzXzgyOS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODQ5KSAmJiB0b2tlbl84NDkudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5JZGVudCwgY3JlYXRlOiAodmFsdWVfODUwLCBzdHhfODUxKSA9PiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuSURFTlRJRklFUiwgdmFsdWU6IHZhbHVlXzg1MH0sIHN0eF84NTEpfSwgcmVndWxhckV4cHJlc3Npb246IHttYXRjaDogdG9rZW5fODUyID0+ICFUeXBlc184MjkuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg1MikgJiYgdG9rZW5fODUyLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuUmVndWxhckV4cHJlc3Npb24sIGNyZWF0ZTogKHZhbHVlXzg1Mywgc3R4Xzg1NCkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJFR0VYUCwgdmFsdWU6IHZhbHVlXzg1M30sIHN0eF84NTQpfSwgYnJhY2VzOiB7bWF0Y2g6IHRva2VuXzg1NSA9PiBUeXBlc184MjkuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg1NSkgJiYgdG9rZW5fODU1LmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNFLCBjcmVhdGU6IChpbm5lcl84NTYsIHN0eF84NTcpID0+IHtcbiAgbGV0IGxlZnRfODU4ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDRSwgdmFsdWU6IFwie1wiLCBzbGljZTogZ2V0Rmlyc3RTbGljZV84Mjcoc3R4Xzg1Nyl9KTtcbiAgbGV0IHJpZ2h0Xzg1OSA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0UsIHZhbHVlOiBcIn1cIiwgc2xpY2U6IGdldEZpcnN0U2xpY2VfODI3KHN0eF84NTcpfSk7XG4gIHJldHVybiBuZXcgU3ludGF4KExpc3Qub2YobGVmdF84NTgpLmNvbmNhdChpbm5lcl84NTYpLnB1c2gocmlnaHRfODU5KSwgc3R4Xzg1Nyk7XG59fSwgYnJhY2tldHM6IHttYXRjaDogdG9rZW5fODYwID0+IFR5cGVzXzgyOS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODYwKSAmJiB0b2tlbl84NjAuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0ssIGNyZWF0ZTogKGlubmVyXzg2MSwgc3R4Xzg2MikgPT4ge1xuICBsZXQgbGVmdF84NjMgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNLLCB2YWx1ZTogXCJbXCIsIHNsaWNlOiBnZXRGaXJzdFNsaWNlXzgyNyhzdHhfODYyKX0pO1xuICBsZXQgcmlnaHRfODY0ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJCUkFDSywgdmFsdWU6IFwiXVwiLCBzbGljZTogZ2V0Rmlyc3RTbGljZV84Mjcoc3R4Xzg2Mil9KTtcbiAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0Xzg2MykuY29uY2F0KGlubmVyXzg2MSkucHVzaChyaWdodF84NjQpLCBzdHhfODYyKTtcbn19LCBwYXJlbnM6IHttYXRjaDogdG9rZW5fODY1ID0+IFR5cGVzXzgyOS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODY1KSAmJiB0b2tlbl84NjUuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MUEFSRU4sIGNyZWF0ZTogKGlubmVyXzg2Niwgc3R4Xzg2NykgPT4ge1xuICBsZXQgbGVmdF84NjggPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTFBBUkVOLCB2YWx1ZTogXCIoXCIsIHNsaWNlOiBnZXRGaXJzdFNsaWNlXzgyNyhzdHhfODY3KX0pO1xuICBsZXQgcmlnaHRfODY5ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJQQVJFTiwgdmFsdWU6IFwiKVwiLCBzbGljZTogZ2V0Rmlyc3RTbGljZV84Mjcoc3R4Xzg2Nyl9KTtcbiAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0Xzg2OCkuY29uY2F0KGlubmVyXzg2NikucHVzaChyaWdodF84NjkpLCBzdHhfODY3KTtcbn19LCBhc3NpZ246IHttYXRjaDogdG9rZW5fODcwID0+IHtcbiAgaWYgKFR5cGVzXzgyOS5wdW5jdHVhdG9yLm1hdGNoKHRva2VuXzg3MCkpIHtcbiAgICBzd2l0Y2ggKHRva2VuXzg3MC52YWx1ZSkge1xuICAgICAgY2FzZSBcIj1cIjpcbiAgICAgIGNhc2UgXCJ8PVwiOlxuICAgICAgY2FzZSBcIl49XCI6XG4gICAgICBjYXNlIFwiJj1cIjpcbiAgICAgIGNhc2UgXCI8PD1cIjpcbiAgICAgIGNhc2UgXCI+Pj1cIjpcbiAgICAgIGNhc2UgXCI+Pj49XCI6XG4gICAgICBjYXNlIFwiKz1cIjpcbiAgICAgIGNhc2UgXCItPVwiOlxuICAgICAgY2FzZSBcIio9XCI6XG4gICAgICBjYXNlIFwiLz1cIjpcbiAgICAgIGNhc2UgXCIlPVwiOlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufX0sIGJvb2xlYW46IHttYXRjaDogdG9rZW5fODcxID0+ICFUeXBlc184MjkuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg3MSkgJiYgdG9rZW5fODcxLnR5cGUgPT09IFRva2VuVHlwZS5UUlVFIHx8IHRva2VuXzg3MS50eXBlID09PSBUb2tlblR5cGUuRkFMU0V9LCB0ZW1wbGF0ZToge21hdGNoOiB0b2tlbl84NzIgPT4gIVR5cGVzXzgyOS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODcyKSAmJiB0b2tlbl84NzIudHlwZSA9PT0gVG9rZW5UeXBlLlRFTVBMQVRFfSwgZGVsaW1pdGVyOiB7bWF0Y2g6IHRva2VuXzg3MyA9PiBMaXN0LmlzTGlzdCh0b2tlbl84NzMpfSwgc3ludGF4VGVtcGxhdGU6IHttYXRjaDogdG9rZW5fODc0ID0+IFR5cGVzXzgyOS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODc0KSAmJiB0b2tlbl84NzQuZ2V0KDApLnZhbCgpID09PSBcIiNgXCJ9LCBlb2Y6IHttYXRjaDogdG9rZW5fODc1ID0+ICFUeXBlc184MjkuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg3NSkgJiYgdG9rZW5fODc1LnR5cGUgPT09IFRva2VuVHlwZS5FT1N9fTtcbjtcbmNvbnN0IEFMTF9QSEFTRVNfODMwID0ge307XG47XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTeW50YXgge1xuICBjb25zdHJ1Y3Rvcih0b2tlbl84NzYsIG9sZHN0eF84NzcgPSB7fSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbl84NzY7XG4gICAgdGhpcy5iaW5kaW5ncyA9IG9sZHN0eF84NzcuYmluZGluZ3MgIT0gbnVsbCA/IG9sZHN0eF84NzcuYmluZGluZ3MgOiBuZXcgQmluZGluZ01hcDtcbiAgICB0aGlzLnNjb3Blc2V0cyA9IG9sZHN0eF84Nzcuc2NvcGVzZXRzICE9IG51bGwgPyBvbGRzdHhfODc3LnNjb3Blc2V0cyA6IHthbGw6IExpc3QoKSwgcGhhc2U6IE1hcCgpfTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG4gIHN0YXRpYyBvZih0b2tlbl84NzgsIHN0eF84NzkgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzg3OCwgc3R4Xzg3OSk7XG4gIH1cbiAgc3RhdGljIGZyb20odHlwZV84ODAsIHZhbHVlXzg4MSwgc3R4Xzg4MiA9IHt9KSB7XG4gICAgaWYgKCFUeXBlc184MjlbdHlwZV84ODBdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IodHlwZV84ODAgKyBcIiBpcyBub3QgYSB2YWxpZCB0eXBlXCIpO1xuICAgIH0gZWxzZSBpZiAoIVR5cGVzXzgyOVt0eXBlXzg4MF0uY3JlYXRlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY3JlYXRlIGEgc3ludGF4IGZyb20gdHlwZSBcIiArIHR5cGVfODgwKTtcbiAgICB9XG4gICAgbGV0IG5ld3N0eF84ODMgPSBUeXBlc184MjlbdHlwZV84ODBdLmNyZWF0ZSh2YWx1ZV84ODEsIHN0eF84ODIpO1xuICAgIGxldCBzbGljZV84ODQgPSBnZXRGaXJzdFNsaWNlXzgyNyhzdHhfODgyKTtcbiAgICBpZiAoc2xpY2VfODg0ICE9IG51bGwpIHtcbiAgICAgIG5ld3N0eF84ODMudG9rZW4uc2xpY2UgPSBzbGljZV84ODQ7XG4gICAgfVxuICAgIHJldHVybiBuZXdzdHhfODgzO1xuICB9XG4gIGZyb20odHlwZV84ODUsIHZhbHVlXzg4Nikge1xuICAgIHJldHVybiBTeW50YXguZnJvbSh0eXBlXzg4NSwgdmFsdWVfODg2LCB0aGlzKTtcbiAgfVxuICBmcm9tTnVsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwibnVsbFwiLCBudWxsKTtcbiAgfVxuICBmcm9tTnVtYmVyKHZhbHVlXzg4Nykge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJudW1iZXJcIiwgdmFsdWVfODg3KTtcbiAgfVxuICBmcm9tU3RyaW5nKHZhbHVlXzg4OCkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJzdHJpbmdcIiwgdmFsdWVfODg4KTtcbiAgfVxuICBmcm9tUHVuY3R1YXRvcih2YWx1ZV84ODkpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwicHVuY3R1YXRvclwiLCB2YWx1ZV84ODkpO1xuICB9XG4gIGZyb21LZXl3b3JkKHZhbHVlXzg5MCkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJrZXl3b3JkXCIpO1xuICB9XG4gIGZyb21JZGVudGlmaWVyKHZhbHVlXzg5MSkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJpZGVudGlmaWVyXCIsIHZhbHVlXzg5MSk7XG4gIH1cbiAgZnJvbVJlZ3VsYXJFeHByZXNzaW9uKHZhbHVlXzg5Mikge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV84OTIpO1xuICB9XG4gIGZyb21CcmFjZXMoaW5uZXJfODkzKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcImJyYWNlc1wiLCBpbm5lcl84OTMpO1xuICB9XG4gIGZyb21CcmFja2V0cyhpbm5lcl84OTQpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwiYnJhY2tldHNcIiwgaW5uZXJfODk0KTtcbiAgfVxuICBmcm9tUGFyZW5zKGlubmVyXzg5NSkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJwYXJlbnNcIiwgaW5uZXJfODk1KTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bGwoc3R4Xzg5NiA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwibnVsbFwiLCBudWxsLCBzdHhfODk2KTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bWJlcih2YWx1ZV84OTcsIHN0eF84OTggPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcIm51bWJlclwiLCB2YWx1ZV84OTcsIHN0eF84OTgpO1xuICB9XG4gIHN0YXRpYyBmcm9tU3RyaW5nKHZhbHVlXzg5OSwgc3R4XzkwMCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwic3RyaW5nXCIsIHZhbHVlXzg5OSwgc3R4XzkwMCk7XG4gIH1cbiAgc3RhdGljIGZyb21QdW5jdHVhdG9yKHZhbHVlXzkwMSwgc3R4XzkwMiA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwicHVuY3R1YXRvclwiLCB2YWx1ZV85MDEsIHN0eF85MDIpO1xuICB9XG4gIHN0YXRpYyBmcm9tS2V5d29yZCh2YWx1ZV85MDMsIHN0eF85MDQgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImtleXdvcmRcIiwgdmFsdWVfOTAzLCBzdHhfOTA0KTtcbiAgfVxuICBzdGF0aWMgZnJvbUlkZW50aWZpZXIodmFsdWVfOTA1LCBzdHhfOTA2ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJpZGVudGlmaWVyXCIsIHZhbHVlXzkwNSwgc3R4XzkwNik7XG4gIH1cbiAgc3RhdGljIGZyb21SZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV85MDcsIHN0eF85MDggPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbHVlXzkwNywgc3R4XzkwOCk7XG4gIH1cbiAgc3RhdGljIGZyb21CcmFjZXMoaW5uZXJfOTA5LCBzdHhfOTEwID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJicmFjZXNcIiwgaW5uZXJfOTA5LCBzdHhfOTEwKTtcbiAgfVxuICBzdGF0aWMgZnJvbUJyYWNrZXRzKGlubmVyXzkxMSwgc3R4XzkxMiA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwiYnJhY2tldHNcIiwgaW5uZXJfOTExLCBzdHhfOTEyKTtcbiAgfVxuICBzdGF0aWMgZnJvbVBhcmVucyhpbm5lcl85MTMsIHN0eF85MTQgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInBhcmVuc1wiLCBpbm5lcl85MTMsIHN0eF85MTQpO1xuICB9XG4gIHJlc29sdmUocGhhc2VfOTE1KSB7XG4gICAgYXNzZXJ0KHBoYXNlXzkxNSAhPSBudWxsLCBcIm11c3QgcHJvdmlkZSBhIHBoYXNlIHRvIHJlc29sdmVcIik7XG4gICAgbGV0IGFsbFNjb3Blc185MTYgPSB0aGlzLnNjb3Blc2V0cy5hbGw7XG4gICAgbGV0IHN0eFNjb3Blc185MTcgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfOTE1KSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV85MTUpIDogTGlzdCgpO1xuICAgIHN0eFNjb3Blc185MTcgPSBhbGxTY29wZXNfOTE2LmNvbmNhdChzdHhTY29wZXNfOTE3KTtcbiAgICBpZiAoc3R4U2NvcGVzXzkxNy5zaXplID09PSAwIHx8ICEodGhpcy5tYXRjaChcImlkZW50aWZpZXJcIikgfHwgdGhpcy5tYXRjaChcImtleXdvcmRcIikpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgICB9XG4gICAgbGV0IHNjb3BlXzkxOCA9IHN0eFNjb3Blc185MTcubGFzdCgpO1xuICAgIGxldCBiaW5kaW5nc185MTkgPSB0aGlzLmJpbmRpbmdzO1xuICAgIGlmIChzY29wZV85MTgpIHtcbiAgICAgIGxldCBzY29wZXNldEJpbmRpbmdMaXN0ID0gYmluZGluZ3NfOTE5LmdldCh0aGlzKTtcbiAgICAgIGlmIChzY29wZXNldEJpbmRpbmdMaXN0KSB7XG4gICAgICAgIGxldCBiaWdnZXN0QmluZGluZ1BhaXIgPSBzY29wZXNldEJpbmRpbmdMaXN0LmZpbHRlcigoe3Njb3BlcywgYmluZGluZ30pID0+IHtcbiAgICAgICAgICByZXR1cm4gc2NvcGVzLmlzU3Vic2V0KHN0eFNjb3Blc185MTcpO1xuICAgICAgICB9KS5zb3J0KHNpemVEZWNlbmRpbmdfODI4KTtcbiAgICAgICAgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplID49IDIgJiYgYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5zY29wZXMuc2l6ZSA9PT0gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgxKS5zY29wZXMuc2l6ZSkge1xuICAgICAgICAgIGxldCBkZWJ1Z0Jhc2UgPSBcIntcIiArIHN0eFNjb3Blc185MTcubWFwKHNfOTIwID0+IHNfOTIwLnRvU3RyaW5nKCkpLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuICAgICAgICAgIGxldCBkZWJ1Z0FtYmlnb3VzU2NvcGVzZXRzID0gYmlnZ2VzdEJpbmRpbmdQYWlyLm1hcCgoe3Njb3Blc30pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBcIntcIiArIHNjb3Blcy5tYXAoc185MjEgPT4gc185MjEudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgfSkuam9pbihcIiwgXCIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjb3Blc2V0IFwiICsgZGVidWdCYXNlICsgXCIgaGFzIGFtYmlndW91cyBzdWJzZXRzIFwiICsgZGVidWdBbWJpZ291c1Njb3Blc2V0cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmlnZ2VzdEJpbmRpbmdQYWlyLnNpemUgIT09IDApIHtcbiAgICAgICAgICBsZXQgYmluZGluZ1N0ciA9IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYmluZGluZy50b1N0cmluZygpO1xuICAgICAgICAgIGlmIChNYXliZS5pc0p1c3QoYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcykpIHtcbiAgICAgICAgICAgIHJldHVybiBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzLmdldE9yRWxzZShudWxsKS5yZXNvbHZlKHBoYXNlXzkxNSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiaW5kaW5nU3RyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIHZhbCgpIHtcbiAgICBhc3NlcnQoIXRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2Fubm90IGdldCB0aGUgdmFsIG9mIGEgZGVsaW1pdGVyXCIpO1xuICAgIGlmICh0aGlzLm1hdGNoKFwic3RyaW5nXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zdHI7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLml0ZW1zLm1hcChlbF85MjIgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGVsXzkyMi5tYXRjaCA9PT0gXCJmdW5jdGlvblwiICYmIGVsXzkyMi5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgICAgICAgIHJldHVybiBcIiR7Li4ufVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbF85MjIuc2xpY2UudGV4dDtcbiAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIGxpbmVOdW1iZXIoKSB7XG4gICAgaWYgKCF0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZS5zdGFydExvY2F0aW9uLmxpbmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLmdldCgwKS5saW5lTnVtYmVyKCk7XG4gICAgfVxuICB9XG4gIHNldExpbmVOdW1iZXIobGluZV85MjMpIHtcbiAgICBsZXQgbmV3VG9rXzkyNCA9IHt9O1xuICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIG5ld1Rva185MjQgPSB0aGlzLnRva2VuLm1hcChzXzkyNSA9PiBzXzkyNS5zZXRMaW5lTnVtYmVyKGxpbmVfOTIzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLnRva2VuKSkge1xuICAgICAgICBuZXdUb2tfOTI0W2tleV0gPSB0aGlzLnRva2VuW2tleV07XG4gICAgICB9XG4gICAgICBhc3NlcnQobmV3VG9rXzkyNC5zbGljZSAmJiBuZXdUb2tfOTI0LnNsaWNlLnN0YXJ0TG9jYXRpb24sIFwiYWxsIHRva2VucyBtdXN0IGhhdmUgbGluZSBpbmZvXCIpO1xuICAgICAgbmV3VG9rXzkyNC5zbGljZS5zdGFydExvY2F0aW9uLmxpbmUgPSBsaW5lXzkyMztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTeW50YXgobmV3VG9rXzkyNCwgdGhpcyk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgYXNzZXJ0KHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2FuIG9ubHkgZ2V0IHRoZSBpbm5lciBvZiBhIGRlbGltaXRlclwiKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZSgxLCB0aGlzLnRva2VuLnNpemUgLSAxKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV85MjYsIGJpbmRpbmdzXzkyNywgcGhhc2VfOTI4LCBvcHRpb25zXzkyOSA9IHtmbGlwOiBmYWxzZX0pIHtcbiAgICBsZXQgdG9rZW5fOTMwID0gdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSA/IHRoaXMudG9rZW4ubWFwKHNfOTM0ID0+IHNfOTM0LmFkZFNjb3BlKHNjb3BlXzkyNiwgYmluZGluZ3NfOTI3LCBwaGFzZV85MjgsIG9wdGlvbnNfOTI5KSkgOiB0aGlzLnRva2VuO1xuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHRva2VuXzkzMCA9IF8ubWVyZ2UodG9rZW5fOTMwLCB7aXRlbXM6IHRva2VuXzkzMC5pdGVtcy5tYXAoaXRfOTM1ID0+IHtcbiAgICAgICAgaWYgKGl0XzkzNSBpbnN0YW5jZW9mIFN5bnRheCAmJiBpdF85MzUubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgICAgICByZXR1cm4gaXRfOTM1LmFkZFNjb3BlKHNjb3BlXzkyNiwgYmluZGluZ3NfOTI3LCBwaGFzZV85MjgsIG9wdGlvbnNfOTI5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRfOTM1O1xuICAgICAgfSl9KTtcbiAgICB9XG4gICAgbGV0IG9sZFNjb3Blc2V0XzkzMTtcbiAgICBpZiAocGhhc2VfOTI4ID09PSBBTExfUEhBU0VTXzgzMCkge1xuICAgICAgb2xkU2NvcGVzZXRfOTMxID0gdGhpcy5zY29wZXNldHMuYWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbGRTY29wZXNldF85MzEgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfOTI4KSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV85MjgpIDogTGlzdCgpO1xuICAgIH1cbiAgICBsZXQgbmV3U2NvcGVzZXRfOTMyO1xuICAgIGlmIChvcHRpb25zXzkyOS5mbGlwKSB7XG4gICAgICBsZXQgaW5kZXggPSBvbGRTY29wZXNldF85MzEuaW5kZXhPZihzY29wZV85MjYpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBuZXdTY29wZXNldF85MzIgPSBvbGRTY29wZXNldF85MzEucmVtb3ZlKGluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Njb3Blc2V0XzkzMiA9IG9sZFNjb3Blc2V0XzkzMS5wdXNoKHNjb3BlXzkyNik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1Njb3Blc2V0XzkzMiA9IG9sZFNjb3Blc2V0XzkzMS5wdXNoKHNjb3BlXzkyNik7XG4gICAgfVxuICAgIGxldCBuZXdzdHhfOTMzID0ge2JpbmRpbmdzOiBiaW5kaW5nc185MjcsIHNjb3Blc2V0czoge2FsbDogdGhpcy5zY29wZXNldHMuYWxsLCBwaGFzZTogdGhpcy5zY29wZXNldHMucGhhc2V9fTtcbiAgICBpZiAocGhhc2VfOTI4ID09PSBBTExfUEhBU0VTXzgzMCkge1xuICAgICAgbmV3c3R4XzkzMy5zY29wZXNldHMuYWxsID0gbmV3U2NvcGVzZXRfOTMyO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdzdHhfOTMzLnNjb3Blc2V0cy5waGFzZSA9IG5ld3N0eF85MzMuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZV85MjgsIG5ld1Njb3Blc2V0XzkzMik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzkzMCwgbmV3c3R4XzkzMyk7XG4gIH1cbiAgcmVtb3ZlU2NvcGUoc2NvcGVfOTM2LCBwaGFzZV85MzcpIHtcbiAgICBsZXQgdG9rZW5fOTM4ID0gdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSA/IHRoaXMudG9rZW4ubWFwKHNfOTQ0ID0+IHNfOTQ0LnJlbW92ZVNjb3BlKHNjb3BlXzkzNiwgcGhhc2VfOTM3KSkgOiB0aGlzLnRva2VuO1xuICAgIGxldCBwaGFzZVNjb3Blc2V0XzkzOSA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmhhcyhwaGFzZV85MzcpID8gdGhpcy5zY29wZXNldHMucGhhc2UuZ2V0KHBoYXNlXzkzNykgOiBMaXN0KCk7XG4gICAgbGV0IGFsbFNjb3Blc2V0Xzk0MCA9IHRoaXMuc2NvcGVzZXRzLmFsbDtcbiAgICBsZXQgbmV3c3R4Xzk0MSA9IHtiaW5kaW5nczogdGhpcy5iaW5kaW5ncywgc2NvcGVzZXRzOiB7YWxsOiB0aGlzLnNjb3Blc2V0cy5hbGwsIHBoYXNlOiB0aGlzLnNjb3Blc2V0cy5waGFzZX19O1xuICAgIGxldCBwaGFzZUluZGV4Xzk0MiA9IHBoYXNlU2NvcGVzZXRfOTM5LmluZGV4T2Yoc2NvcGVfOTM2KTtcbiAgICBsZXQgYWxsSW5kZXhfOTQzID0gYWxsU2NvcGVzZXRfOTQwLmluZGV4T2Yoc2NvcGVfOTM2KTtcbiAgICBpZiAocGhhc2VJbmRleF85NDIgIT09IC0xKSB7XG4gICAgICBuZXdzdHhfOTQxLnNjb3Blc2V0cy5waGFzZSA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZV85MzcsIHBoYXNlU2NvcGVzZXRfOTM5LnJlbW92ZShwaGFzZUluZGV4Xzk0MikpO1xuICAgIH0gZWxzZSBpZiAoYWxsSW5kZXhfOTQzICE9PSAtMSkge1xuICAgICAgbmV3c3R4Xzk0MS5zY29wZXNldHMuYWxsID0gYWxsU2NvcGVzZXRfOTQwLnJlbW92ZShhbGxJbmRleF85NDMpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl85MzgsIG5ld3N0eF85NDEpO1xuICB9XG4gIG1hdGNoKHR5cGVfOTQ1LCB2YWx1ZV85NDYpIHtcbiAgICBpZiAoIVR5cGVzXzgyOVt0eXBlXzk0NV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzk0NSArIFwiIGlzIGFuIGludmFsaWQgdHlwZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIFR5cGVzXzgyOVt0eXBlXzk0NV0ubWF0Y2godGhpcy50b2tlbikgJiYgKHZhbHVlXzk0NiA9PSBudWxsIHx8ICh2YWx1ZV85NDYgaW5zdGFuY2VvZiBSZWdFeHAgPyB2YWx1ZV85NDYudGVzdCh0aGlzLnZhbCgpKSA6IHRoaXMudmFsKCkgPT0gdmFsdWVfOTQ2KSk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzk0Nykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiLCB2YWx1ZV85NDcpO1xuICB9XG4gIGlzQXNzaWduKHZhbHVlXzk0OCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlXzk0OCk7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh2YWx1ZV85NDkpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWVfOTQ5KTtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfOTUwKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJrZXl3b3JkXCIsIHZhbHVlXzk1MCk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZV85NTEpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bGxcIiwgdmFsdWVfOTUxKTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHZhbHVlXzk1Mikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlXzk1Mik7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHZhbHVlXzk1Mykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicHVuY3R1YXRvclwiLCB2YWx1ZV85NTMpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV85NTQpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN0cmluZ1wiLCB2YWx1ZV85NTQpO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odmFsdWVfOTU1KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV85NTUpO1xuICB9XG4gIGlzVGVtcGxhdGUodmFsdWVfOTU2KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiLCB2YWx1ZV85NTYpO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzk1Nykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIsIHZhbHVlXzk1Nyk7XG4gIH1cbiAgaXNQYXJlbnModmFsdWVfOTU4KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWVfOTU4KTtcbiAgfVxuICBpc0JyYWNlcyh2YWx1ZV85NTkpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNlc1wiLCB2YWx1ZV85NTkpO1xuICB9XG4gIGlzQnJhY2tldHModmFsdWVfOTYwKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFja2V0c1wiLCB2YWx1ZV85NjApO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUodmFsdWVfOTYxKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZV85NjEpO1xuICB9XG4gIGlzRU9GKHZhbHVlXzk2Mikge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZW9mXCIsIHZhbHVlXzk2Mik7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLm1hcChzXzk2MyA9PiBzXzk2My50b1N0cmluZygpKS5qb2luKFwiIFwiKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJzdHJpbmdcIikpIHtcbiAgICAgIHJldHVybiBcIidcIiArIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcInRlbXBsYXRlXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbn1cbmV4cG9ydCB7VHlwZXNfODI5IGFzIFR5cGVzfTtcbmV4cG9ydCB7QUxMX1BIQVNFU184MzAgYXMgQUxMX1BIQVNFU30iXX0=