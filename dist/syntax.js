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
      token_920 = { type: this.token.type, items: token_920.items.map(it_925 => {
          if (it_925 instanceof Syntax && it_925.match("delimiter")) {
            return it_925.addScope(scope_916, bindings_917, phase_918, options_919);
          }
          return it_925;
        }) };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N5bnRheC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7SUFBYSxDOzs7Ozs7QUFDYixNQUFNLFdBQVcsb0JBQU0sSUFBdkI7QUFDQSxNQUFNLGNBQWMsb0JBQU0sT0FBMUI7QUFDQSxTQUFTLGlCQUFULENBQTJCLEtBQTNCLEVBQWtDLEtBQWxDLEVBQXlDO0FBQ3ZDLE1BQUksTUFBTSxNQUFOLENBQWEsSUFBYixHQUFvQixNQUFNLE1BQU4sQ0FBYSxJQUFyQyxFQUEyQztBQUN6QyxXQUFPLENBQUMsQ0FBUjtBQUNELEdBRkQsTUFFTyxJQUFJLE1BQU0sTUFBTixDQUFhLElBQWIsR0FBb0IsTUFBTSxNQUFOLENBQWEsSUFBckMsRUFBMkM7QUFDaEQsV0FBTyxDQUFQO0FBQ0QsR0FGTSxNQUVBO0FBQ0wsV0FBTyxDQUFQO0FBQ0Q7QUFDRjtBQUNELElBQUksWUFBWSxFQUFDLE1BQU0sRUFBQyxPQUFPLGFBQWEsQ0FBQyxVQUFVLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBMEIsU0FBMUIsQ0FBRCxJQUF5QyxVQUFVLElBQVYsS0FBbUIscUJBQVUsSUFBM0YsRUFBaUcsUUFBUSxDQUFDLFNBQUQsRUFBWSxPQUFaLEtBQXdCLElBQUksTUFBSixDQUFXLEVBQUMsTUFBTSxxQkFBVSxJQUFqQixFQUF1QixPQUFPLElBQTlCLEVBQVgsRUFBZ0QsT0FBaEQsQ0FBakksRUFBUCxFQUFtTSxRQUFRLEVBQUMsT0FBTyxhQUFhLENBQUMsVUFBVSxTQUFWLENBQW9CLEtBQXBCLENBQTBCLFNBQTFCLENBQUQsSUFBeUMsVUFBVSxJQUFWLENBQWUsS0FBZixLQUF5QixzQkFBVyxjQUFsRyxFQUFrSCxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosS0FBd0IsSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQXlCLE9BQU8sU0FBaEMsRUFBWCxFQUF1RCxPQUF2RCxDQUFsSixFQUEzTSxFQUErWixRQUFRLEVBQUMsT0FBTyxhQUFhLENBQUMsVUFBVSxTQUFWLENBQW9CLEtBQXBCLENBQTBCLFNBQTFCLENBQUQsSUFBeUMsVUFBVSxJQUFWLENBQWUsS0FBZixLQUF5QixzQkFBVyxhQUFsRyxFQUFpSCxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosS0FBd0IsSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQXlCLEtBQUssU0FBOUIsRUFBWCxFQUFxRCxPQUFyRCxDQUFqSixFQUF2YSxFQUF3bkIsWUFBWSxFQUFDLE9BQU8sYUFBYSxDQUFDLFVBQVUsU0FBVixDQUFvQixLQUFwQixDQUEwQixTQUExQixDQUFELElBQXlDLFVBQVUsSUFBVixDQUFlLEtBQWYsS0FBeUIsc0JBQVcsVUFBbEcsRUFBOEcsUUFBUSxDQUFDLFNBQUQsRUFBWSxPQUFaLEtBQXdCLElBQUksTUFBSixDQUFXLEVBQUMsTUFBTSxFQUFDLE9BQU8sc0JBQVcsVUFBbkIsRUFBK0IsTUFBTSxTQUFyQyxFQUFQLEVBQXdELE9BQU8sU0FBL0QsRUFBWCxFQUFzRixPQUF0RixDQUE5SSxFQUFwb0IsRUFBbTNCLFNBQVMsRUFBQyxPQUFPLGFBQWEsQ0FBQyxVQUFVLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBMEIsU0FBMUIsQ0FBRCxJQUF5QyxVQUFVLElBQVYsQ0FBZSxLQUFmLEtBQXlCLHNCQUFXLE9BQWxHLEVBQTJHLFFBQVEsQ0FBQyxTQUFELEVBQVksT0FBWixLQUF3QixJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0sRUFBQyxPQUFPLHNCQUFXLE9BQW5CLEVBQTRCLE1BQU0sU0FBbEMsRUFBUCxFQUFxRCxPQUFPLFNBQTVELEVBQVgsRUFBbUYsT0FBbkYsQ0FBM0ksRUFBNTNCLEVBQXFtQyxZQUFZLEVBQUMsT0FBTyxhQUFhLENBQUMsVUFBVSxTQUFWLENBQW9CLEtBQXBCLENBQTBCLFNBQTFCLENBQUQsSUFBeUMsVUFBVSxJQUFWLENBQWUsS0FBZixLQUF5QixzQkFBVyxLQUFsRyxFQUF5RyxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosS0FBd0IsSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLFVBQWpCLEVBQTZCLE9BQU8sU0FBcEMsRUFBWCxFQUEyRCxPQUEzRCxDQUF6SSxFQUFqbkMsRUFBZzBDLG1CQUFtQixFQUFDLE9BQU8sYUFBYSxDQUFDLFVBQVUsU0FBVixDQUFvQixLQUFwQixDQUEwQixTQUExQixDQUFELElBQXlDLFVBQVUsSUFBVixDQUFlLEtBQWYsS0FBeUIsc0JBQVcsaUJBQWxHLEVBQXFILFFBQVEsQ0FBQyxTQUFELEVBQVksT0FBWixLQUF3QixJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxTQUFoQyxFQUFYLEVBQXVELE9BQXZELENBQXJKLEVBQW4xQyxFQUEwaUQsUUFBUSxFQUFDLE9BQU8sYUFBYSxVQUFVLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBMEIsU0FBMUIsS0FBd0MsVUFBVSxHQUFWLENBQWMsQ0FBZCxFQUFpQixLQUFqQixDQUF1QixJQUF2QixLQUFnQyxxQkFBVSxNQUF2RyxFQUErRyxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosS0FBd0I7QUFDL3NELFVBQUksV0FBVyxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxHQUFoQyxFQUFYLENBQWY7QUFDQSxVQUFJLFlBQVksSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQXlCLE9BQU8sR0FBaEMsRUFBWCxDQUFoQjtBQUNBLGFBQU8sSUFBSSxNQUFKLENBQVcsZ0JBQUssRUFBTCxDQUFRLFFBQVIsRUFBa0IsTUFBbEIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBcEMsQ0FBeUMsU0FBekMsQ0FBWCxFQUFnRSxPQUFoRSxDQUFQO0FBQ0QsS0FKaWtELEVBQWxqRCxFQUlaLFVBQVUsRUFBQyxPQUFPLGFBQWEsVUFBVSxTQUFWLENBQW9CLEtBQXBCLENBQTBCLFNBQTFCLEtBQXdDLFVBQVUsR0FBVixDQUFjLENBQWQsRUFBaUIsS0FBakIsQ0FBdUIsSUFBdkIsS0FBZ0MscUJBQVUsTUFBdkcsRUFBK0csUUFBUSxDQUFDLFNBQUQsRUFBWSxPQUFaLEtBQXdCO0FBQzNKLFVBQUksV0FBVyxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxHQUFoQyxFQUFYLENBQWY7QUFDQSxVQUFJLFlBQVksSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQXlCLE9BQU8sR0FBaEMsRUFBWCxDQUFoQjtBQUNBLGFBQU8sSUFBSSxNQUFKLENBQVcsZ0JBQUssRUFBTCxDQUFRLFFBQVIsRUFBa0IsTUFBbEIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBcEMsQ0FBeUMsU0FBekMsQ0FBWCxFQUFnRSxPQUFoRSxDQUFQO0FBQ0QsS0FKYSxFQUpFLEVBUVosUUFBUSxFQUFDLE9BQU8sYUFBYSxVQUFVLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBMEIsU0FBMUIsS0FBd0MsVUFBVSxHQUFWLENBQWMsQ0FBZCxFQUFpQixLQUFqQixDQUF1QixJQUF2QixLQUFnQyxxQkFBVSxNQUF2RyxFQUErRyxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosS0FBd0I7QUFDekosVUFBSSxXQUFXLElBQUksTUFBSixDQUFXLEVBQUMsTUFBTSxxQkFBVSxNQUFqQixFQUF5QixPQUFPLEdBQWhDLEVBQVgsQ0FBZjtBQUNBLFVBQUksWUFBWSxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxHQUFoQyxFQUFYLENBQWhCO0FBQ0EsYUFBTyxJQUFJLE1BQUosQ0FBVyxnQkFBSyxFQUFMLENBQVEsUUFBUixFQUFrQixNQUFsQixDQUF5QixTQUF6QixFQUFvQyxJQUFwQyxDQUF5QyxTQUF6QyxDQUFYLEVBQWdFLE9BQWhFLENBQVA7QUFDRCxLQUpXLEVBUkksRUFZWixRQUFRLEVBQUMsT0FBTyxhQUFhO0FBQy9CLFVBQUksVUFBVSxVQUFWLENBQXFCLEtBQXJCLENBQTJCLFNBQTNCLENBQUosRUFBMkM7QUFDekMsZ0JBQVEsVUFBVSxLQUFsQjtBQUNFLGVBQUssR0FBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssS0FBTDtBQUNBLGVBQUssS0FBTDtBQUNBLGVBQUssTUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNFLG1CQUFPLElBQVA7QUFDRjtBQUNFLG1CQUFPLEtBQVA7QUFmSjtBQWlCRDtBQUNELGFBQU8sS0FBUDtBQUNELEtBckJXLEVBWkksRUFpQ1osU0FBUyxFQUFDLE9BQU8sYUFBYSxDQUFDLFVBQVUsU0FBVixDQUFvQixLQUFwQixDQUEwQixTQUExQixDQUFELElBQXlDLFVBQVUsSUFBVixLQUFtQixxQkFBVSxJQUF0RSxJQUE4RSxVQUFVLElBQVYsS0FBbUIscUJBQVUsS0FBaEksRUFqQ0csRUFpQ3FJLFVBQVUsRUFBQyxPQUFPLGFBQWEsQ0FBQyxVQUFVLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBMEIsU0FBMUIsQ0FBRCxJQUF5QyxVQUFVLElBQVYsS0FBbUIscUJBQVUsUUFBM0YsRUFqQy9JLEVBaUNxUCxXQUFXLEVBQUMsT0FBTyxhQUFhLGdCQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXJCLEVBakNoUSxFQWlDOFMsZ0JBQWdCLEVBQUMsT0FBTyxhQUFhLFVBQVUsU0FBVixDQUFvQixLQUFwQixDQUEwQixTQUExQixLQUF3QyxVQUFVLEdBQVYsQ0FBYyxDQUFkLEVBQWlCLEdBQWpCLE9BQTJCLElBQXhGLEVBakM5VCxFQWlDNlosS0FBSyxFQUFDLE9BQU8sYUFBYSxDQUFDLFVBQVUsU0FBVixDQUFvQixLQUFwQixDQUEwQixTQUExQixDQUFELElBQXlDLFVBQVUsSUFBVixLQUFtQixxQkFBVSxHQUEzRixFQWpDbGEsRUFBaEI7QUFrQ0E7QUFDQSxNQUFNLGlCQUFpQixFQUF2QjtBQUNBO0FBQ2UsTUFBTSxNQUFOLENBQWE7QUFDMUIsY0FBWSxTQUFaLEVBQXdDO0FBQUEsUUFBakIsVUFBaUIseURBQUosRUFBSTs7QUFDdEMsU0FBSyxLQUFMLEdBQWEsU0FBYjtBQUNBLFNBQUssUUFBTCxHQUFnQixXQUFXLFFBQVgsSUFBdUIsSUFBdkIsR0FBOEIsV0FBVyxRQUF6QyxHQUFvRCwwQkFBcEU7QUFDQSxTQUFLLFNBQUwsR0FBaUIsV0FBVyxTQUFYLElBQXdCLElBQXhCLEdBQStCLFdBQVcsU0FBMUMsR0FBc0QsRUFBQyxLQUFLLHNCQUFOLEVBQWMsT0FBTyxxQkFBckIsRUFBdkU7QUFDQSxXQUFPLE1BQVAsQ0FBYyxJQUFkO0FBQ0Q7QUFDRCxTQUFPLEVBQVAsQ0FBVSxTQUFWLEVBQW1DO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQ2pDLFdBQU8sSUFBSSxNQUFKLENBQVcsU0FBWCxFQUFzQixPQUF0QixDQUFQO0FBQ0Q7QUFDRCxTQUFPLElBQVAsQ0FBWSxRQUFaLEVBQXNCLFNBQXRCLEVBQStDO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQzdDLFFBQUksQ0FBQyxVQUFVLFFBQVYsQ0FBTCxFQUEwQjtBQUN4QixZQUFNLElBQUksS0FBSixDQUFVLFdBQVcsc0JBQXJCLENBQU47QUFDRCxLQUZELE1BRU8sSUFBSSxDQUFDLFVBQVUsUUFBVixFQUFvQixNQUF6QixFQUFpQztBQUN0QyxZQUFNLElBQUksS0FBSixDQUFVLHNDQUFzQyxRQUFoRCxDQUFOO0FBQ0Q7QUFDRCxXQUFPLFVBQVUsUUFBVixFQUFvQixNQUFwQixDQUEyQixTQUEzQixFQUFzQyxPQUF0QyxDQUFQO0FBQ0Q7QUFDRCxPQUFLLFFBQUwsRUFBZSxTQUFmLEVBQTBCO0FBQ3hCLFdBQU8sT0FBTyxJQUFQLENBQVksUUFBWixFQUFzQixTQUF0QixFQUFpQyxJQUFqQyxDQUFQO0FBQ0Q7QUFDRCxhQUFXO0FBQ1QsV0FBTyxLQUFLLElBQUwsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBQVA7QUFDRDtBQUNELGFBQVcsU0FBWCxFQUFzQjtBQUNwQixXQUFPLEtBQUssSUFBTCxDQUFVLFFBQVYsRUFBb0IsU0FBcEIsQ0FBUDtBQUNEO0FBQ0QsYUFBVyxTQUFYLEVBQXNCO0FBQ3BCLFdBQU8sS0FBSyxJQUFMLENBQVUsUUFBVixFQUFvQixTQUFwQixDQUFQO0FBQ0Q7QUFDRCxpQkFBZSxTQUFmLEVBQTBCO0FBQ3hCLFdBQU8sS0FBSyxJQUFMLENBQVUsWUFBVixFQUF3QixTQUF4QixDQUFQO0FBQ0Q7QUFDRCxjQUFZLFNBQVosRUFBdUI7QUFDckIsV0FBTyxLQUFLLElBQUwsQ0FBVSxTQUFWLENBQVA7QUFDRDtBQUNELGlCQUFlLFNBQWYsRUFBMEI7QUFDeEIsV0FBTyxLQUFLLElBQUwsQ0FBVSxZQUFWLEVBQXdCLFNBQXhCLENBQVA7QUFDRDtBQUNELHdCQUFzQixTQUF0QixFQUFpQztBQUMvQixXQUFPLEtBQUssSUFBTCxDQUFVLG1CQUFWLEVBQStCLFNBQS9CLENBQVA7QUFDRDtBQUNELGFBQVcsU0FBWCxFQUFzQjtBQUNwQixXQUFPLEtBQUssSUFBTCxDQUFVLFFBQVYsRUFBb0IsU0FBcEIsQ0FBUDtBQUNEO0FBQ0QsZUFBYSxTQUFiLEVBQXdCO0FBQ3RCLFdBQU8sS0FBSyxJQUFMLENBQVUsVUFBVixFQUFzQixTQUF0QixDQUFQO0FBQ0Q7QUFDRCxhQUFXLFNBQVgsRUFBc0I7QUFDcEIsV0FBTyxLQUFLLElBQUwsQ0FBVSxRQUFWLEVBQW9CLFNBQXBCLENBQVA7QUFDRDtBQUNELFNBQU8sUUFBUCxHQUE4QjtBQUFBLFFBQWQsT0FBYyx5REFBSixFQUFJOztBQUM1QixXQUFPLE9BQU8sSUFBUCxDQUFZLE1BQVosRUFBb0IsSUFBcEIsRUFBMEIsT0FBMUIsQ0FBUDtBQUNEO0FBQ0QsU0FBTyxVQUFQLENBQWtCLFNBQWxCLEVBQTJDO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQ3pDLFdBQU8sT0FBTyxJQUFQLENBQVksUUFBWixFQUFzQixTQUF0QixFQUFpQyxPQUFqQyxDQUFQO0FBQ0Q7QUFDRCxTQUFPLFVBQVAsQ0FBa0IsU0FBbEIsRUFBMkM7QUFBQSxRQUFkLE9BQWMseURBQUosRUFBSTs7QUFDekMsV0FBTyxPQUFPLElBQVAsQ0FBWSxRQUFaLEVBQXNCLFNBQXRCLEVBQWlDLE9BQWpDLENBQVA7QUFDRDtBQUNELFNBQU8sY0FBUCxDQUFzQixTQUF0QixFQUErQztBQUFBLFFBQWQsT0FBYyx5REFBSixFQUFJOztBQUM3QyxXQUFPLE9BQU8sSUFBUCxDQUFZLFlBQVosRUFBMEIsU0FBMUIsRUFBcUMsT0FBckMsQ0FBUDtBQUNEO0FBQ0QsU0FBTyxXQUFQLENBQW1CLFNBQW5CLEVBQTRDO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQzFDLFdBQU8sT0FBTyxJQUFQLENBQVksU0FBWixFQUF1QixTQUF2QixFQUFrQyxPQUFsQyxDQUFQO0FBQ0Q7QUFDRCxTQUFPLGNBQVAsQ0FBc0IsU0FBdEIsRUFBK0M7QUFBQSxRQUFkLE9BQWMseURBQUosRUFBSTs7QUFDN0MsV0FBTyxPQUFPLElBQVAsQ0FBWSxZQUFaLEVBQTBCLFNBQTFCLEVBQXFDLE9BQXJDLENBQVA7QUFDRDtBQUNELFNBQU8scUJBQVAsQ0FBNkIsU0FBN0IsRUFBc0Q7QUFBQSxRQUFkLE9BQWMseURBQUosRUFBSTs7QUFDcEQsV0FBTyxPQUFPLElBQVAsQ0FBWSxtQkFBWixFQUFpQyxTQUFqQyxFQUE0QyxPQUE1QyxDQUFQO0FBQ0Q7QUFDRCxTQUFPLFVBQVAsQ0FBa0IsU0FBbEIsRUFBMkM7QUFBQSxRQUFkLE9BQWMseURBQUosRUFBSTs7QUFDekMsV0FBTyxPQUFPLElBQVAsQ0FBWSxRQUFaLEVBQXNCLFNBQXRCLEVBQWlDLE9BQWpDLENBQVA7QUFDRDtBQUNELFNBQU8sWUFBUCxDQUFvQixTQUFwQixFQUE2QztBQUFBLFFBQWQsT0FBYyx5REFBSixFQUFJOztBQUMzQyxXQUFPLE9BQU8sSUFBUCxDQUFZLFVBQVosRUFBd0IsU0FBeEIsRUFBbUMsT0FBbkMsQ0FBUDtBQUNEO0FBQ0QsU0FBTyxVQUFQLENBQWtCLFNBQWxCLEVBQTJDO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQ3pDLFdBQU8sT0FBTyxJQUFQLENBQVksUUFBWixFQUFzQixTQUF0QixFQUFpQyxPQUFqQyxDQUFQO0FBQ0Q7QUFDRCxVQUFRLFNBQVIsRUFBbUI7QUFDakIsd0JBQU8sYUFBYSxJQUFwQixFQUEwQixpQ0FBMUI7QUFDQSxRQUFJLGdCQUFnQixLQUFLLFNBQUwsQ0FBZSxHQUFuQztBQUNBLFFBQUksZ0JBQWdCLEtBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsR0FBckIsQ0FBeUIsU0FBekIsSUFBc0MsS0FBSyxTQUFMLENBQWUsS0FBZixDQUFxQixHQUFyQixDQUF5QixTQUF6QixDQUF0QyxHQUE0RSxzQkFBaEc7QUFDQSxvQkFBZ0IsY0FBYyxNQUFkLENBQXFCLGFBQXJCLENBQWhCO0FBQ0EsUUFBSSxjQUFjLElBQWQsS0FBdUIsQ0FBdkIsSUFBNEIsRUFBRSxLQUFLLEtBQUwsQ0FBVyxZQUFYLEtBQTRCLEtBQUssS0FBTCxDQUFXLFNBQVgsQ0FBOUIsQ0FBaEMsRUFBc0Y7QUFDcEYsYUFBTyxLQUFLLEtBQUwsQ0FBVyxLQUFsQjtBQUNEO0FBQ0QsUUFBSSxZQUFZLGNBQWMsSUFBZCxFQUFoQjtBQUNBLFFBQUksZUFBZSxLQUFLLFFBQXhCO0FBQ0EsUUFBSSxTQUFKLEVBQWU7QUFDYixVQUFJLHNCQUFzQixhQUFhLEdBQWIsQ0FBaUIsSUFBakIsQ0FBMUI7QUFDQSxVQUFJLG1CQUFKLEVBQXlCO0FBQ3ZCLFlBQUkscUJBQXFCLG9CQUFvQixNQUFwQixDQUEyQixRQUF1QjtBQUFBLGNBQXJCLE1BQXFCLFFBQXJCLE1BQXFCO0FBQUEsY0FBYixPQUFhLFFBQWIsT0FBYTs7QUFDekUsaUJBQU8sT0FBTyxRQUFQLENBQWdCLGFBQWhCLENBQVA7QUFDRCxTQUZ3QixFQUV0QixJQUZzQixDQUVqQixpQkFGaUIsQ0FBekI7QUFHQSxZQUFJLG1CQUFtQixJQUFuQixJQUEyQixDQUEzQixJQUFnQyxtQkFBbUIsR0FBbkIsQ0FBdUIsQ0FBdkIsRUFBMEIsTUFBMUIsQ0FBaUMsSUFBakMsS0FBMEMsbUJBQW1CLEdBQW5CLENBQXVCLENBQXZCLEVBQTBCLE1BQTFCLENBQWlDLElBQS9HLEVBQXFIO0FBQ25ILGNBQUksWUFBWSxNQUFNLGNBQWMsR0FBZCxDQUFrQixTQUFTLE1BQU0sUUFBTixFQUEzQixFQUE2QyxJQUE3QyxDQUFrRCxJQUFsRCxDQUFOLEdBQWdFLEdBQWhGO0FBQ0EsY0FBSSx5QkFBeUIsbUJBQW1CLEdBQW5CLENBQXVCLFNBQWM7QUFBQSxnQkFBWixNQUFZLFNBQVosTUFBWTs7QUFDaEUsbUJBQU8sTUFBTSxPQUFPLEdBQVAsQ0FBVyxTQUFTLE1BQU0sUUFBTixFQUFwQixFQUFzQyxJQUF0QyxDQUEyQyxJQUEzQyxDQUFOLEdBQXlELEdBQWhFO0FBQ0QsV0FGNEIsRUFFMUIsSUFGMEIsQ0FFckIsSUFGcUIsQ0FBN0I7QUFHQSxnQkFBTSxJQUFJLEtBQUosQ0FBVSxjQUFjLFNBQWQsR0FBMEIseUJBQTFCLEdBQXNELHNCQUFoRSxDQUFOO0FBQ0QsU0FORCxNQU1PLElBQUksbUJBQW1CLElBQW5CLEtBQTRCLENBQWhDLEVBQW1DO0FBQ3hDLGNBQUksYUFBYSxtQkFBbUIsR0FBbkIsQ0FBdUIsQ0FBdkIsRUFBMEIsT0FBMUIsQ0FBa0MsUUFBbEMsRUFBakI7QUFDQSxjQUFJLG9CQUFNLE1BQU4sQ0FBYSxtQkFBbUIsR0FBbkIsQ0FBdUIsQ0FBdkIsRUFBMEIsS0FBdkMsQ0FBSixFQUFtRDtBQUNqRCxtQkFBTyxtQkFBbUIsR0FBbkIsQ0FBdUIsQ0FBdkIsRUFBMEIsS0FBMUIsQ0FBZ0MsU0FBaEMsQ0FBMEMsSUFBMUMsRUFBZ0QsT0FBaEQsQ0FBd0QsU0FBeEQsQ0FBUDtBQUNEO0FBQ0QsaUJBQU8sVUFBUDtBQUNEO0FBQ0Y7QUFDRjtBQUNELFdBQU8sS0FBSyxLQUFMLENBQVcsS0FBbEI7QUFDRDtBQUNELFFBQU07QUFDSix3QkFBTyxDQUFDLEtBQUssS0FBTCxDQUFXLFdBQVgsQ0FBUixFQUFpQyxtQ0FBakM7QUFDQSxRQUFJLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBSixFQUEwQjtBQUN4QixhQUFPLEtBQUssS0FBTCxDQUFXLEdBQWxCO0FBQ0Q7QUFDRCxRQUFJLEtBQUssS0FBTCxDQUFXLFVBQVgsQ0FBSixFQUE0QjtBQUMxQixhQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsR0FBakIsQ0FBcUIsVUFBVTtBQUNwQyxZQUFJLE9BQU8sT0FBTyxLQUFkLEtBQXdCLFVBQXhCLElBQXNDLE9BQU8sS0FBUCxDQUFhLFdBQWIsQ0FBMUMsRUFBcUU7QUFDbkUsaUJBQU8sUUFBUDtBQUNEO0FBQ0QsZUFBTyxPQUFPLEtBQVAsQ0FBYSxJQUFwQjtBQUNELE9BTE0sRUFLSixJQUxJLENBS0MsRUFMRCxDQUFQO0FBTUQ7QUFDRCxXQUFPLEtBQUssS0FBTCxDQUFXLEtBQWxCO0FBQ0Q7QUFDRCxlQUFhO0FBQ1gsUUFBSSxDQUFDLEtBQUssS0FBTCxDQUFXLFdBQVgsQ0FBTCxFQUE4QjtBQUM1QixhQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsYUFBakIsQ0FBK0IsSUFBdEM7QUFDRCxLQUZELE1BRU87QUFDTCxhQUFPLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxDQUFmLEVBQWtCLFVBQWxCLEVBQVA7QUFDRDtBQUNGO0FBQ0QsZ0JBQWMsUUFBZCxFQUF3QjtBQUN0QixRQUFJLGFBQWEsRUFBakI7QUFDQSxRQUFJLEtBQUssV0FBTCxFQUFKLEVBQXdCO0FBQ3RCLG1CQUFhLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxTQUFTLE1BQU0sYUFBTixDQUFvQixRQUFwQixDQUF4QixDQUFiO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsV0FBSyxJQUFJLEdBQVQsSUFBZ0IsT0FBTyxJQUFQLENBQVksS0FBSyxLQUFqQixDQUFoQixFQUF5QztBQUN2QyxtQkFBVyxHQUFYLElBQWtCLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBbEI7QUFDRDtBQUNELDBCQUFPLFdBQVcsS0FBWCxJQUFvQixXQUFXLEtBQVgsQ0FBaUIsYUFBNUMsRUFBMkQsZ0NBQTNEO0FBQ0EsaUJBQVcsS0FBWCxDQUFpQixhQUFqQixDQUErQixJQUEvQixHQUFzQyxRQUF0QztBQUNEO0FBQ0QsV0FBTyxJQUFJLE1BQUosQ0FBVyxVQUFYLEVBQXVCLElBQXZCLENBQVA7QUFDRDtBQUNELFVBQVE7QUFDTix3QkFBTyxLQUFLLEtBQUwsQ0FBVyxXQUFYLENBQVAsRUFBZ0MsdUNBQWhDO0FBQ0EsV0FBTyxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLENBQWpCLEVBQW9CLEtBQUssS0FBTCxDQUFXLElBQVgsR0FBa0IsQ0FBdEMsQ0FBUDtBQUNEO0FBQ0QsV0FBUyxTQUFULEVBQW9CLFlBQXBCLEVBQWtDLFNBQWxDLEVBQTBFO0FBQUEsUUFBN0IsV0FBNkIseURBQWYsRUFBQyxNQUFNLEtBQVAsRUFBZTs7QUFDeEUsUUFBSSxZQUFZLEtBQUssS0FBTCxDQUFXLFdBQVgsSUFBMEIsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFNBQVMsTUFBTSxRQUFOLENBQWUsU0FBZixFQUEwQixZQUExQixFQUF3QyxTQUF4QyxFQUFtRCxXQUFuRCxDQUF4QixDQUExQixHQUFxSCxLQUFLLEtBQTFJO0FBQ0EsUUFBSSxLQUFLLEtBQUwsQ0FBVyxVQUFYLENBQUosRUFBNEI7QUFDMUIsa0JBQVksRUFBQyxNQUFNLEtBQUssS0FBTCxDQUFXLElBQWxCLEVBQXdCLE9BQU8sVUFBVSxLQUFWLENBQWdCLEdBQWhCLENBQW9CLFVBQVU7QUFDdkUsY0FBSSxrQkFBa0IsTUFBbEIsSUFBNEIsT0FBTyxLQUFQLENBQWEsV0FBYixDQUFoQyxFQUEyRDtBQUN6RCxtQkFBTyxPQUFPLFFBQVAsQ0FBZ0IsU0FBaEIsRUFBMkIsWUFBM0IsRUFBeUMsU0FBekMsRUFBb0QsV0FBcEQsQ0FBUDtBQUNEO0FBQ0QsaUJBQU8sTUFBUDtBQUNELFNBTDBDLENBQS9CLEVBQVo7QUFNRDtBQUNELFFBQUksZUFBSjtBQUNBLFFBQUksY0FBYyxjQUFsQixFQUFrQztBQUNoQyx3QkFBa0IsS0FBSyxTQUFMLENBQWUsR0FBakM7QUFDRCxLQUZELE1BRU87QUFDTCx3QkFBa0IsS0FBSyxTQUFMLENBQWUsS0FBZixDQUFxQixHQUFyQixDQUF5QixTQUF6QixJQUFzQyxLQUFLLFNBQUwsQ0FBZSxLQUFmLENBQXFCLEdBQXJCLENBQXlCLFNBQXpCLENBQXRDLEdBQTRFLHNCQUE5RjtBQUNEO0FBQ0QsUUFBSSxlQUFKO0FBQ0EsUUFBSSxZQUFZLElBQWhCLEVBQXNCO0FBQ3BCLFVBQUksUUFBUSxnQkFBZ0IsT0FBaEIsQ0FBd0IsU0FBeEIsQ0FBWjtBQUNBLFVBQUksVUFBVSxDQUFDLENBQWYsRUFBa0I7QUFDaEIsMEJBQWtCLGdCQUFnQixNQUFoQixDQUF1QixLQUF2QixDQUFsQjtBQUNELE9BRkQsTUFFTztBQUNMLDBCQUFrQixnQkFBZ0IsSUFBaEIsQ0FBcUIsU0FBckIsQ0FBbEI7QUFDRDtBQUNGLEtBUEQsTUFPTztBQUNMLHdCQUFrQixnQkFBZ0IsSUFBaEIsQ0FBcUIsU0FBckIsQ0FBbEI7QUFDRDtBQUNELFFBQUksYUFBYSxFQUFDLFVBQVUsWUFBWCxFQUF5QixXQUFXLEVBQUMsS0FBSyxLQUFLLFNBQUwsQ0FBZSxHQUFyQixFQUEwQixPQUFPLEtBQUssU0FBTCxDQUFlLEtBQWhELEVBQXBDLEVBQWpCO0FBQ0EsUUFBSSxjQUFjLGNBQWxCLEVBQWtDO0FBQ2hDLGlCQUFXLFNBQVgsQ0FBcUIsR0FBckIsR0FBMkIsZUFBM0I7QUFDRCxLQUZELE1BRU87QUFDTCxpQkFBVyxTQUFYLENBQXFCLEtBQXJCLEdBQTZCLFdBQVcsU0FBWCxDQUFxQixLQUFyQixDQUEyQixHQUEzQixDQUErQixTQUEvQixFQUEwQyxlQUExQyxDQUE3QjtBQUNEO0FBQ0QsV0FBTyxJQUFJLE1BQUosQ0FBVyxTQUFYLEVBQXNCLFVBQXRCLENBQVA7QUFDRDtBQUNELGNBQVksU0FBWixFQUF1QixTQUF2QixFQUFrQztBQUNoQyxRQUFJLFlBQVksS0FBSyxLQUFMLENBQVcsV0FBWCxJQUEwQixLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsU0FBUyxNQUFNLFdBQU4sQ0FBa0IsU0FBbEIsRUFBNkIsU0FBN0IsQ0FBeEIsQ0FBMUIsR0FBNkYsS0FBSyxLQUFsSDtBQUNBLFFBQUksb0JBQW9CLEtBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsR0FBckIsQ0FBeUIsU0FBekIsSUFBc0MsS0FBSyxTQUFMLENBQWUsS0FBZixDQUFxQixHQUFyQixDQUF5QixTQUF6QixDQUF0QyxHQUE0RSxzQkFBcEc7QUFDQSxRQUFJLGtCQUFrQixLQUFLLFNBQUwsQ0FBZSxHQUFyQztBQUNBLFFBQUksYUFBYSxFQUFDLFVBQVUsS0FBSyxRQUFoQixFQUEwQixXQUFXLEVBQUMsS0FBSyxLQUFLLFNBQUwsQ0FBZSxHQUFyQixFQUEwQixPQUFPLEtBQUssU0FBTCxDQUFlLEtBQWhELEVBQXJDLEVBQWpCO0FBQ0EsUUFBSSxpQkFBaUIsa0JBQWtCLE9BQWxCLENBQTBCLFNBQTFCLENBQXJCO0FBQ0EsUUFBSSxlQUFlLGdCQUFnQixPQUFoQixDQUF3QixTQUF4QixDQUFuQjtBQUNBLFFBQUksbUJBQW1CLENBQUMsQ0FBeEIsRUFBMkI7QUFDekIsaUJBQVcsU0FBWCxDQUFxQixLQUFyQixHQUE2QixLQUFLLFNBQUwsQ0FBZSxLQUFmLENBQXFCLEdBQXJCLENBQXlCLFNBQXpCLEVBQW9DLGtCQUFrQixNQUFsQixDQUF5QixjQUF6QixDQUFwQyxDQUE3QjtBQUNELEtBRkQsTUFFTyxJQUFJLGlCQUFpQixDQUFDLENBQXRCLEVBQXlCO0FBQzlCLGlCQUFXLFNBQVgsQ0FBcUIsR0FBckIsR0FBMkIsZ0JBQWdCLE1BQWhCLENBQXVCLFlBQXZCLENBQTNCO0FBQ0Q7QUFDRCxXQUFPLElBQUksTUFBSixDQUFXLFNBQVgsRUFBc0IsVUFBdEIsQ0FBUDtBQUNEO0FBQ0QsUUFBTSxRQUFOLEVBQWdCLFNBQWhCLEVBQTJCO0FBQ3pCLFFBQUksQ0FBQyxVQUFVLFFBQVYsQ0FBTCxFQUEwQjtBQUN4QixZQUFNLElBQUksS0FBSixDQUFVLFdBQVcscUJBQXJCLENBQU47QUFDRDtBQUNELFdBQU8sVUFBVSxRQUFWLEVBQW9CLEtBQXBCLENBQTBCLEtBQUssS0FBL0IsTUFBMEMsYUFBYSxJQUFiLEtBQXNCLHFCQUFxQixNQUFyQixHQUE4QixVQUFVLElBQVYsQ0FBZSxLQUFLLEdBQUwsRUFBZixDQUE5QixHQUEyRCxLQUFLLEdBQUwsTUFBYyxTQUEvRixDQUExQyxDQUFQO0FBQ0Q7QUFDRCxlQUFhLFNBQWIsRUFBd0I7QUFDdEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxZQUFYLEVBQXlCLFNBQXpCLENBQVA7QUFDRDtBQUNELFdBQVMsU0FBVCxFQUFvQjtBQUNsQixXQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFBcUIsU0FBckIsQ0FBUDtBQUNEO0FBQ0QsbUJBQWlCLFNBQWpCLEVBQTRCO0FBQzFCLFdBQU8sS0FBSyxLQUFMLENBQVcsU0FBWCxFQUFzQixTQUF0QixDQUFQO0FBQ0Q7QUFDRCxZQUFVLFNBQVYsRUFBcUI7QUFDbkIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxTQUFYLEVBQXNCLFNBQXRCLENBQVA7QUFDRDtBQUNELGdCQUFjLFNBQWQsRUFBeUI7QUFDdkIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxNQUFYLEVBQW1CLFNBQW5CLENBQVA7QUFDRDtBQUNELG1CQUFpQixTQUFqQixFQUE0QjtBQUMxQixXQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFBcUIsU0FBckIsQ0FBUDtBQUNEO0FBQ0QsZUFBYSxTQUFiLEVBQXdCO0FBQ3RCLFdBQU8sS0FBSyxLQUFMLENBQVcsWUFBWCxFQUF5QixTQUF6QixDQUFQO0FBQ0Q7QUFDRCxrQkFBZ0IsU0FBaEIsRUFBMkI7QUFDekIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLFNBQXJCLENBQVA7QUFDRDtBQUNELHNCQUFvQixTQUFwQixFQUErQjtBQUM3QixXQUFPLEtBQUssS0FBTCxDQUFXLG1CQUFYLEVBQWdDLFNBQWhDLENBQVA7QUFDRDtBQUNELGFBQVcsU0FBWCxFQUFzQjtBQUNwQixXQUFPLEtBQUssS0FBTCxDQUFXLFVBQVgsRUFBdUIsU0FBdkIsQ0FBUDtBQUNEO0FBQ0QsY0FBWSxTQUFaLEVBQXVCO0FBQ3JCLFdBQU8sS0FBSyxLQUFMLENBQVcsV0FBWCxFQUF3QixTQUF4QixDQUFQO0FBQ0Q7QUFDRCxXQUFTLFNBQVQsRUFBb0I7QUFDbEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLFNBQXJCLENBQVA7QUFDRDtBQUNELFdBQVMsU0FBVCxFQUFvQjtBQUNsQixXQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFBcUIsU0FBckIsQ0FBUDtBQUNEO0FBQ0QsYUFBVyxTQUFYLEVBQXNCO0FBQ3BCLFdBQU8sS0FBSyxLQUFMLENBQVcsVUFBWCxFQUF1QixTQUF2QixDQUFQO0FBQ0Q7QUFDRCxtQkFBaUIsU0FBakIsRUFBNEI7QUFDMUIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxnQkFBWCxFQUE2QixTQUE3QixDQUFQO0FBQ0Q7QUFDRCxRQUFNLFNBQU4sRUFBaUI7QUFDZixXQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsRUFBa0IsU0FBbEIsQ0FBUDtBQUNEO0FBQ0QsYUFBVztBQUNULFFBQUksS0FBSyxLQUFMLENBQVcsV0FBWCxDQUFKLEVBQTZCO0FBQzNCLGFBQU8sS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFNBQVMsTUFBTSxRQUFOLEVBQXhCLEVBQTBDLElBQTFDLENBQStDLEdBQS9DLENBQVA7QUFDRDtBQUNELFFBQUksS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFKLEVBQTBCO0FBQ3hCLGFBQU8sTUFBTSxLQUFLLEtBQUwsQ0FBVyxHQUF4QjtBQUNEO0FBQ0QsUUFBSSxLQUFLLEtBQUwsQ0FBVyxVQUFYLENBQUosRUFBNEI7QUFDMUIsYUFBTyxLQUFLLEdBQUwsRUFBUDtBQUNEO0FBQ0QsV0FBTyxLQUFLLEtBQUwsQ0FBVyxLQUFsQjtBQUNEO0FBM1F5QjtrQkFBUCxNO1FBNlFBLEssR0FBYixTO1FBQ2tCLFUsR0FBbEIsYyIsImZpbGUiOiJzeW50YXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3QsIE1hcH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHthc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IEJpbmRpbmdNYXAgZnJvbSBcIi4vYmluZGluZy1tYXBcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQge1Rva2VuVHlwZSwgVG9rZW5DbGFzc30gZnJvbSBcInNoaWZ0LXBhcnNlci9kaXN0L3Rva2VuaXplclwiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5jb25zdCBKdXN0XzgxOSA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzgyMCA9IE1heWJlLk5vdGhpbmc7XG5mdW5jdGlvbiBzaXplRGVjZW5kaW5nXzgyMShhXzgyNCwgYl84MjUpIHtcbiAgaWYgKGFfODI0LnNjb3Blcy5zaXplID4gYl84MjUuc2NvcGVzLnNpemUpIHtcbiAgICByZXR1cm4gLTE7XG4gIH0gZWxzZSBpZiAoYl84MjUuc2NvcGVzLnNpemUgPiBhXzgyNC5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAxO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAwO1xuICB9XG59XG5sZXQgVHlwZXNfODIyID0ge251bGw6IHttYXRjaDogdG9rZW5fODI2ID0+ICFUeXBlc184MjIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgyNikgJiYgdG9rZW5fODI2LnR5cGUgPT09IFRva2VuVHlwZS5OVUxMLCBjcmVhdGU6ICh2YWx1ZV84MjcsIHN0eF84MjgpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5OVUxMLCB2YWx1ZTogbnVsbH0sIHN0eF84MjgpfSwgbnVtYmVyOiB7bWF0Y2g6IHRva2VuXzgyOSA9PiAhVHlwZXNfODIyLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MjkpICYmIHRva2VuXzgyOS50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLk51bWVyaWNMaXRlcmFsLCBjcmVhdGU6ICh2YWx1ZV84MzAsIHN0eF84MzEpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5OVU1CRVIsIHZhbHVlOiB2YWx1ZV84MzB9LCBzdHhfODMxKX0sIHN0cmluZzoge21hdGNoOiB0b2tlbl84MzIgPT4gIVR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODMyKSAmJiB0b2tlbl84MzIudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5TdHJpbmdMaXRlcmFsLCBjcmVhdGU6ICh2YWx1ZV84MzMsIHN0eF84MzQpID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5TVFJJTkcsIHN0cjogdmFsdWVfODMzfSwgc3R4XzgzNCl9LCBwdW5jdHVhdG9yOiB7bWF0Y2g6IHRva2VuXzgzNSA9PiAhVHlwZXNfODIyLmRlbGltaXRlci5tYXRjaCh0b2tlbl84MzUpICYmIHRva2VuXzgzNS50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlB1bmN0dWF0b3IsIGNyZWF0ZTogKHZhbHVlXzgzNiwgc3R4XzgzNykgPT4gbmV3IFN5bnRheCh7dHlwZToge2tsYXNzOiBUb2tlbkNsYXNzLlB1bmN0dWF0b3IsIG5hbWU6IHZhbHVlXzgzNn0sIHZhbHVlOiB2YWx1ZV84MzZ9LCBzdHhfODM3KX0sIGtleXdvcmQ6IHttYXRjaDogdG9rZW5fODM4ID0+ICFUeXBlc184MjIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgzOCkgJiYgdG9rZW5fODM4LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuS2V5d29yZCwgY3JlYXRlOiAodmFsdWVfODM5LCBzdHhfODQwKSA9PiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuS2V5d29yZCwgbmFtZTogdmFsdWVfODM5fSwgdmFsdWU6IHZhbHVlXzgzOX0sIHN0eF84NDApfSwgaWRlbnRpZmllcjoge21hdGNoOiB0b2tlbl84NDEgPT4gIVR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODQxKSAmJiB0b2tlbl84NDEudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5JZGVudCwgY3JlYXRlOiAodmFsdWVfODQyLCBzdHhfODQzKSA9PiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuSURFTlRJRklFUiwgdmFsdWU6IHZhbHVlXzg0Mn0sIHN0eF84NDMpfSwgcmVndWxhckV4cHJlc3Npb246IHttYXRjaDogdG9rZW5fODQ0ID0+ICFUeXBlc184MjIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg0NCkgJiYgdG9rZW5fODQ0LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuUmVndWxhckV4cHJlc3Npb24sIGNyZWF0ZTogKHZhbHVlXzg0NSwgc3R4Xzg0NikgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJFR0VYUCwgdmFsdWU6IHZhbHVlXzg0NX0sIHN0eF84NDYpfSwgYnJhY2VzOiB7bWF0Y2g6IHRva2VuXzg0NyA9PiBUeXBlc184MjIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg0NykgJiYgdG9rZW5fODQ3LmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNFLCBjcmVhdGU6IChpbm5lcl84NDgsIHN0eF84NDkpID0+IHtcbiAgbGV0IGxlZnRfODUwID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDRSwgdmFsdWU6IFwie1wifSk7XG4gIGxldCByaWdodF84NTEgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkJSQUNFLCB2YWx1ZTogXCJ9XCJ9KTtcbiAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0Xzg1MCkuY29uY2F0KGlubmVyXzg0OCkucHVzaChyaWdodF84NTEpLCBzdHhfODQ5KTtcbn19LCBicmFja2V0czoge21hdGNoOiB0b2tlbl84NTIgPT4gVHlwZXNfODIyLmRlbGltaXRlci5tYXRjaCh0b2tlbl84NTIpICYmIHRva2VuXzg1Mi5nZXQoMCkudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkxCUkFDSywgY3JlYXRlOiAoaW5uZXJfODUzLCBzdHhfODU0KSA9PiB7XG4gIGxldCBsZWZ0Xzg1NSA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5MQlJBQ0ssIHZhbHVlOiBcIltcIn0pO1xuICBsZXQgcmlnaHRfODU2ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJCUkFDSywgdmFsdWU6IFwiXVwifSk7XG4gIHJldHVybiBuZXcgU3ludGF4KExpc3Qub2YobGVmdF84NTUpLmNvbmNhdChpbm5lcl84NTMpLnB1c2gocmlnaHRfODU2KSwgc3R4Xzg1NCk7XG59fSwgcGFyZW5zOiB7bWF0Y2g6IHRva2VuXzg1NyA9PiBUeXBlc184MjIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg1NykgJiYgdG9rZW5fODU3LmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTFBBUkVOLCBjcmVhdGU6IChpbm5lcl84NTgsIHN0eF84NTkpID0+IHtcbiAgbGV0IGxlZnRfODYwID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxQQVJFTiwgdmFsdWU6IFwiKFwifSk7XG4gIGxldCByaWdodF84NjEgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUlBBUkVOLCB2YWx1ZTogXCIpXCJ9KTtcbiAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0Xzg2MCkuY29uY2F0KGlubmVyXzg1OCkucHVzaChyaWdodF84NjEpLCBzdHhfODU5KTtcbn19LCBhc3NpZ246IHttYXRjaDogdG9rZW5fODYyID0+IHtcbiAgaWYgKFR5cGVzXzgyMi5wdW5jdHVhdG9yLm1hdGNoKHRva2VuXzg2MikpIHtcbiAgICBzd2l0Y2ggKHRva2VuXzg2Mi52YWx1ZSkge1xuICAgICAgY2FzZSBcIj1cIjpcbiAgICAgIGNhc2UgXCJ8PVwiOlxuICAgICAgY2FzZSBcIl49XCI6XG4gICAgICBjYXNlIFwiJj1cIjpcbiAgICAgIGNhc2UgXCI8PD1cIjpcbiAgICAgIGNhc2UgXCI+Pj1cIjpcbiAgICAgIGNhc2UgXCI+Pj49XCI6XG4gICAgICBjYXNlIFwiKz1cIjpcbiAgICAgIGNhc2UgXCItPVwiOlxuICAgICAgY2FzZSBcIio9XCI6XG4gICAgICBjYXNlIFwiLz1cIjpcbiAgICAgIGNhc2UgXCIlPVwiOlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufX0sIGJvb2xlYW46IHttYXRjaDogdG9rZW5fODYzID0+ICFUeXBlc184MjIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg2MykgJiYgdG9rZW5fODYzLnR5cGUgPT09IFRva2VuVHlwZS5UUlVFIHx8IHRva2VuXzg2My50eXBlID09PSBUb2tlblR5cGUuRkFMU0V9LCB0ZW1wbGF0ZToge21hdGNoOiB0b2tlbl84NjQgPT4gIVR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODY0KSAmJiB0b2tlbl84NjQudHlwZSA9PT0gVG9rZW5UeXBlLlRFTVBMQVRFfSwgZGVsaW1pdGVyOiB7bWF0Y2g6IHRva2VuXzg2NSA9PiBMaXN0LmlzTGlzdCh0b2tlbl84NjUpfSwgc3ludGF4VGVtcGxhdGU6IHttYXRjaDogdG9rZW5fODY2ID0+IFR5cGVzXzgyMi5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODY2KSAmJiB0b2tlbl84NjYuZ2V0KDApLnZhbCgpID09PSBcIiNgXCJ9LCBlb2Y6IHttYXRjaDogdG9rZW5fODY3ID0+ICFUeXBlc184MjIuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzg2NykgJiYgdG9rZW5fODY3LnR5cGUgPT09IFRva2VuVHlwZS5FT1N9fTtcbjtcbmNvbnN0IEFMTF9QSEFTRVNfODIzID0ge307XG47XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTeW50YXgge1xuICBjb25zdHJ1Y3Rvcih0b2tlbl84NjgsIG9sZHN0eF84NjkgPSB7fSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbl84Njg7XG4gICAgdGhpcy5iaW5kaW5ncyA9IG9sZHN0eF84NjkuYmluZGluZ3MgIT0gbnVsbCA/IG9sZHN0eF84NjkuYmluZGluZ3MgOiBuZXcgQmluZGluZ01hcDtcbiAgICB0aGlzLnNjb3Blc2V0cyA9IG9sZHN0eF84Njkuc2NvcGVzZXRzICE9IG51bGwgPyBvbGRzdHhfODY5LnNjb3Blc2V0cyA6IHthbGw6IExpc3QoKSwgcGhhc2U6IE1hcCgpfTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG4gIHN0YXRpYyBvZih0b2tlbl84NzAsIHN0eF84NzEgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzg3MCwgc3R4Xzg3MSk7XG4gIH1cbiAgc3RhdGljIGZyb20odHlwZV84NzIsIHZhbHVlXzg3Mywgc3R4Xzg3NCA9IHt9KSB7XG4gICAgaWYgKCFUeXBlc184MjJbdHlwZV84NzJdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IodHlwZV84NzIgKyBcIiBpcyBub3QgYSB2YWxpZCB0eXBlXCIpO1xuICAgIH0gZWxzZSBpZiAoIVR5cGVzXzgyMlt0eXBlXzg3Ml0uY3JlYXRlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY3JlYXRlIGEgc3ludGF4IGZyb20gdHlwZSBcIiArIHR5cGVfODcyKTtcbiAgICB9XG4gICAgcmV0dXJuIFR5cGVzXzgyMlt0eXBlXzg3Ml0uY3JlYXRlKHZhbHVlXzg3Mywgc3R4Xzg3NCk7XG4gIH1cbiAgZnJvbSh0eXBlXzg3NSwgdmFsdWVfODc2KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKHR5cGVfODc1LCB2YWx1ZV84NzYsIHRoaXMpO1xuICB9XG4gIGZyb21OdWxsKCkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJudWxsXCIsIG51bGwpO1xuICB9XG4gIGZyb21OdW1iZXIodmFsdWVfODc3KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcIm51bWJlclwiLCB2YWx1ZV84NzcpO1xuICB9XG4gIGZyb21TdHJpbmcodmFsdWVfODc4KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInN0cmluZ1wiLCB2YWx1ZV84NzgpO1xuICB9XG4gIGZyb21QdW5jdHVhdG9yKHZhbHVlXzg3OSkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJwdW5jdHVhdG9yXCIsIHZhbHVlXzg3OSk7XG4gIH1cbiAgZnJvbUtleXdvcmQodmFsdWVfODgwKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcImtleXdvcmRcIik7XG4gIH1cbiAgZnJvbUlkZW50aWZpZXIodmFsdWVfODgxKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcImlkZW50aWZpZXJcIiwgdmFsdWVfODgxKTtcbiAgfVxuICBmcm9tUmVndWxhckV4cHJlc3Npb24odmFsdWVfODgyKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbHVlXzg4Mik7XG4gIH1cbiAgZnJvbUJyYWNlcyhpbm5lcl84ODMpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tKFwiYnJhY2VzXCIsIGlubmVyXzg4Myk7XG4gIH1cbiAgZnJvbUJyYWNrZXRzKGlubmVyXzg4NCkge1xuICAgIHJldHVybiB0aGlzLmZyb20oXCJicmFja2V0c1wiLCBpbm5lcl84ODQpO1xuICB9XG4gIGZyb21QYXJlbnMoaW5uZXJfODg1KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShcInBhcmVuc1wiLCBpbm5lcl84ODUpO1xuICB9XG4gIHN0YXRpYyBmcm9tTnVsbChzdHhfODg2ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJudWxsXCIsIG51bGwsIHN0eF84ODYpO1xuICB9XG4gIHN0YXRpYyBmcm9tTnVtYmVyKHZhbHVlXzg4Nywgc3R4Xzg4OCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwibnVtYmVyXCIsIHZhbHVlXzg4Nywgc3R4Xzg4OCk7XG4gIH1cbiAgc3RhdGljIGZyb21TdHJpbmcodmFsdWVfODg5LCBzdHhfODkwID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJzdHJpbmdcIiwgdmFsdWVfODg5LCBzdHhfODkwKTtcbiAgfVxuICBzdGF0aWMgZnJvbVB1bmN0dWF0b3IodmFsdWVfODkxLCBzdHhfODkyID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJwdW5jdHVhdG9yXCIsIHZhbHVlXzg5MSwgc3R4Xzg5Mik7XG4gIH1cbiAgc3RhdGljIGZyb21LZXl3b3JkKHZhbHVlXzg5Mywgc3R4Xzg5NCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwia2V5d29yZFwiLCB2YWx1ZV84OTMsIHN0eF84OTQpO1xuICB9XG4gIHN0YXRpYyBmcm9tSWRlbnRpZmllcih2YWx1ZV84OTUsIHN0eF84OTYgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImlkZW50aWZpZXJcIiwgdmFsdWVfODk1LCBzdHhfODk2KTtcbiAgfVxuICBzdGF0aWMgZnJvbVJlZ3VsYXJFeHByZXNzaW9uKHZhbHVlXzg5Nywgc3R4Xzg5OCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwicmVndWxhckV4cHJlc3Npb25cIiwgdmFsdWVfODk3LCBzdHhfODk4KTtcbiAgfVxuICBzdGF0aWMgZnJvbUJyYWNlcyhpbm5lcl84OTksIHN0eF85MDAgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImJyYWNlc1wiLCBpbm5lcl84OTksIHN0eF85MDApO1xuICB9XG4gIHN0YXRpYyBmcm9tQnJhY2tldHMoaW5uZXJfOTAxLCBzdHhfOTAyID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJicmFja2V0c1wiLCBpbm5lcl85MDEsIHN0eF85MDIpO1xuICB9XG4gIHN0YXRpYyBmcm9tUGFyZW5zKGlubmVyXzkwMywgc3R4XzkwNCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwicGFyZW5zXCIsIGlubmVyXzkwMywgc3R4XzkwNCk7XG4gIH1cbiAgcmVzb2x2ZShwaGFzZV85MDUpIHtcbiAgICBhc3NlcnQocGhhc2VfOTA1ICE9IG51bGwsIFwibXVzdCBwcm92aWRlIGEgcGhhc2UgdG8gcmVzb2x2ZVwiKTtcbiAgICBsZXQgYWxsU2NvcGVzXzkwNiA9IHRoaXMuc2NvcGVzZXRzLmFsbDtcbiAgICBsZXQgc3R4U2NvcGVzXzkwNyA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmhhcyhwaGFzZV85MDUpID8gdGhpcy5zY29wZXNldHMucGhhc2UuZ2V0KHBoYXNlXzkwNSkgOiBMaXN0KCk7XG4gICAgc3R4U2NvcGVzXzkwNyA9IGFsbFNjb3Blc185MDYuY29uY2F0KHN0eFNjb3Blc185MDcpO1xuICAgIGlmIChzdHhTY29wZXNfOTA3LnNpemUgPT09IDAgfHwgISh0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiKSB8fCB0aGlzLm1hdGNoKFwia2V5d29yZFwiKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICAgIH1cbiAgICBsZXQgc2NvcGVfOTA4ID0gc3R4U2NvcGVzXzkwNy5sYXN0KCk7XG4gICAgbGV0IGJpbmRpbmdzXzkwOSA9IHRoaXMuYmluZGluZ3M7XG4gICAgaWYgKHNjb3BlXzkwOCkge1xuICAgICAgbGV0IHNjb3Blc2V0QmluZGluZ0xpc3QgPSBiaW5kaW5nc185MDkuZ2V0KHRoaXMpO1xuICAgICAgaWYgKHNjb3Blc2V0QmluZGluZ0xpc3QpIHtcbiAgICAgICAgbGV0IGJpZ2dlc3RCaW5kaW5nUGFpciA9IHNjb3Blc2V0QmluZGluZ0xpc3QuZmlsdGVyKCh7c2NvcGVzLCBiaW5kaW5nfSkgPT4ge1xuICAgICAgICAgIHJldHVybiBzY29wZXMuaXNTdWJzZXQoc3R4U2NvcGVzXzkwNyk7XG4gICAgICAgIH0pLnNvcnQoc2l6ZURlY2VuZGluZ184MjEpO1xuICAgICAgICBpZiAoYmlnZ2VzdEJpbmRpbmdQYWlyLnNpemUgPj0gMiAmJiBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLnNjb3Blcy5zaXplID09PSBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDEpLnNjb3Blcy5zaXplKSB7XG4gICAgICAgICAgbGV0IGRlYnVnQmFzZSA9IFwie1wiICsgc3R4U2NvcGVzXzkwNy5tYXAoc185MTAgPT4gc185MTAudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgbGV0IGRlYnVnQW1iaWdvdXNTY29wZXNldHMgPSBiaWdnZXN0QmluZGluZ1BhaXIubWFwKCh7c2NvcGVzfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFwie1wiICsgc2NvcGVzLm1hcChzXzkxMSA9PiBzXzkxMS50b1N0cmluZygpKS5qb2luKFwiLCBcIikgKyBcIn1cIjtcbiAgICAgICAgICB9KS5qb2luKFwiLCBcIik7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NvcGVzZXQgXCIgKyBkZWJ1Z0Jhc2UgKyBcIiBoYXMgYW1iaWd1b3VzIHN1YnNldHMgXCIgKyBkZWJ1Z0FtYmlnb3VzU2NvcGVzZXRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChiaWdnZXN0QmluZGluZ1BhaXIuc2l6ZSAhPT0gMCkge1xuICAgICAgICAgIGxldCBiaW5kaW5nU3RyID0gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5iaW5kaW5nLnRvU3RyaW5nKCk7XG4gICAgICAgICAgaWYgKE1heWJlLmlzSnVzdChiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzKSkge1xuICAgICAgICAgICAgcmV0dXJuIGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYWxpYXMuZ2V0T3JFbHNlKG51bGwpLnJlc29sdmUocGhhc2VfOTA1KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGJpbmRpbmdTdHI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbiAgdmFsKCkge1xuICAgIGFzc2VydCghdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSwgXCJjYW5ub3QgZ2V0IHRoZSB2YWwgb2YgYSBkZWxpbWl0ZXJcIik7XG4gICAgaWYgKHRoaXMubWF0Y2goXCJzdHJpbmdcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLnN0cjtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uaXRlbXMubWFwKGVsXzkxMiA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxfOTEyLm1hdGNoID09PSBcImZ1bmN0aW9uXCIgJiYgZWxfOTEyLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFwiJHsuLi59XCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsXzkxMi5zbGljZS50ZXh0O1xuICAgICAgfSkuam9pbihcIlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbiAgbGluZU51bWJlcigpIHtcbiAgICBpZiAoIXRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLnNsaWNlLnN0YXJ0TG9jYXRpb24ubGluZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uZ2V0KDApLmxpbmVOdW1iZXIoKTtcbiAgICB9XG4gIH1cbiAgc2V0TGluZU51bWJlcihsaW5lXzkxMykge1xuICAgIGxldCBuZXdUb2tfOTE0ID0ge307XG4gICAgaWYgKHRoaXMuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgbmV3VG9rXzkxNCA9IHRoaXMudG9rZW4ubWFwKHNfOTE1ID0+IHNfOTE1LnNldExpbmVOdW1iZXIobGluZV85MTMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHRoaXMudG9rZW4pKSB7XG4gICAgICAgIG5ld1Rva185MTRba2V5XSA9IHRoaXMudG9rZW5ba2V5XTtcbiAgICAgIH1cbiAgICAgIGFzc2VydChuZXdUb2tfOTE0LnNsaWNlICYmIG5ld1Rva185MTQuc2xpY2Uuc3RhcnRMb2NhdGlvbiwgXCJhbGwgdG9rZW5zIG11c3QgaGF2ZSBsaW5lIGluZm9cIik7XG4gICAgICBuZXdUb2tfOTE0LnNsaWNlLnN0YXJ0TG9jYXRpb24ubGluZSA9IGxpbmVfOTEzO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheChuZXdUb2tfOTE0LCB0aGlzKTtcbiAgfVxuICBpbm5lcigpIHtcbiAgICBhc3NlcnQodGhpcy5tYXRjaChcImRlbGltaXRlclwiKSwgXCJjYW4gb25seSBnZXQgdGhlIGlubmVyIG9mIGEgZGVsaW1pdGVyXCIpO1xuICAgIHJldHVybiB0aGlzLnRva2VuLnNsaWNlKDEsIHRoaXMudG9rZW4uc2l6ZSAtIDEpO1xuICB9XG4gIGFkZFNjb3BlKHNjb3BlXzkxNiwgYmluZGluZ3NfOTE3LCBwaGFzZV85MTgsIG9wdGlvbnNfOTE5ID0ge2ZsaXA6IGZhbHNlfSkge1xuICAgIGxldCB0b2tlbl85MjAgPSB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpID8gdGhpcy50b2tlbi5tYXAoc185MjQgPT4gc185MjQuYWRkU2NvcGUoc2NvcGVfOTE2LCBiaW5kaW5nc185MTcsIHBoYXNlXzkxOCwgb3B0aW9uc185MTkpKSA6IHRoaXMudG9rZW47XG4gICAgaWYgKHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiKSkge1xuICAgICAgdG9rZW5fOTIwID0ge3R5cGU6IHRoaXMudG9rZW4udHlwZSwgaXRlbXM6IHRva2VuXzkyMC5pdGVtcy5tYXAoaXRfOTI1ID0+IHtcbiAgICAgICAgaWYgKGl0XzkyNSBpbnN0YW5jZW9mIFN5bnRheCAmJiBpdF85MjUubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgICAgICByZXR1cm4gaXRfOTI1LmFkZFNjb3BlKHNjb3BlXzkxNiwgYmluZGluZ3NfOTE3LCBwaGFzZV85MTgsIG9wdGlvbnNfOTE5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRfOTI1O1xuICAgICAgfSl9O1xuICAgIH1cbiAgICBsZXQgb2xkU2NvcGVzZXRfOTIxO1xuICAgIGlmIChwaGFzZV85MTggPT09IEFMTF9QSEFTRVNfODIzKSB7XG4gICAgICBvbGRTY29wZXNldF85MjEgPSB0aGlzLnNjb3Blc2V0cy5hbGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZFNjb3Blc2V0XzkyMSA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmhhcyhwaGFzZV85MTgpID8gdGhpcy5zY29wZXNldHMucGhhc2UuZ2V0KHBoYXNlXzkxOCkgOiBMaXN0KCk7XG4gICAgfVxuICAgIGxldCBuZXdTY29wZXNldF85MjI7XG4gICAgaWYgKG9wdGlvbnNfOTE5LmZsaXApIHtcbiAgICAgIGxldCBpbmRleCA9IG9sZFNjb3Blc2V0XzkyMS5pbmRleE9mKHNjb3BlXzkxNik7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIG5ld1Njb3Blc2V0XzkyMiA9IG9sZFNjb3Blc2V0XzkyMS5yZW1vdmUoaW5kZXgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3U2NvcGVzZXRfOTIyID0gb2xkU2NvcGVzZXRfOTIxLnB1c2goc2NvcGVfOTE2KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbmV3U2NvcGVzZXRfOTIyID0gb2xkU2NvcGVzZXRfOTIxLnB1c2goc2NvcGVfOTE2KTtcbiAgICB9XG4gICAgbGV0IG5ld3N0eF85MjMgPSB7YmluZGluZ3M6IGJpbmRpbmdzXzkxNywgc2NvcGVzZXRzOiB7YWxsOiB0aGlzLnNjb3Blc2V0cy5hbGwsIHBoYXNlOiB0aGlzLnNjb3Blc2V0cy5waGFzZX19O1xuICAgIGlmIChwaGFzZV85MTggPT09IEFMTF9QSEFTRVNfODIzKSB7XG4gICAgICBuZXdzdHhfOTIzLnNjb3Blc2V0cy5hbGwgPSBuZXdTY29wZXNldF85MjI7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld3N0eF85MjMuc2NvcGVzZXRzLnBoYXNlID0gbmV3c3R4XzkyMy5zY29wZXNldHMucGhhc2Uuc2V0KHBoYXNlXzkxOCwgbmV3U2NvcGVzZXRfOTIyKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fOTIwLCBuZXdzdHhfOTIzKTtcbiAgfVxuICByZW1vdmVTY29wZShzY29wZV85MjYsIHBoYXNlXzkyNykge1xuICAgIGxldCB0b2tlbl85MjggPSB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpID8gdGhpcy50b2tlbi5tYXAoc185MzQgPT4gc185MzQucmVtb3ZlU2NvcGUoc2NvcGVfOTI2LCBwaGFzZV85MjcpKSA6IHRoaXMudG9rZW47XG4gICAgbGV0IHBoYXNlU2NvcGVzZXRfOTI5ID0gdGhpcy5zY29wZXNldHMucGhhc2UuaGFzKHBoYXNlXzkyNykgPyB0aGlzLnNjb3Blc2V0cy5waGFzZS5nZXQocGhhc2VfOTI3KSA6IExpc3QoKTtcbiAgICBsZXQgYWxsU2NvcGVzZXRfOTMwID0gdGhpcy5zY29wZXNldHMuYWxsO1xuICAgIGxldCBuZXdzdHhfOTMxID0ge2JpbmRpbmdzOiB0aGlzLmJpbmRpbmdzLCBzY29wZXNldHM6IHthbGw6IHRoaXMuc2NvcGVzZXRzLmFsbCwgcGhhc2U6IHRoaXMuc2NvcGVzZXRzLnBoYXNlfX07XG4gICAgbGV0IHBoYXNlSW5kZXhfOTMyID0gcGhhc2VTY29wZXNldF85MjkuaW5kZXhPZihzY29wZV85MjYpO1xuICAgIGxldCBhbGxJbmRleF85MzMgPSBhbGxTY29wZXNldF85MzAuaW5kZXhPZihzY29wZV85MjYpO1xuICAgIGlmIChwaGFzZUluZGV4XzkzMiAhPT0gLTEpIHtcbiAgICAgIG5ld3N0eF85MzEuc2NvcGVzZXRzLnBoYXNlID0gdGhpcy5zY29wZXNldHMucGhhc2Uuc2V0KHBoYXNlXzkyNywgcGhhc2VTY29wZXNldF85MjkucmVtb3ZlKHBoYXNlSW5kZXhfOTMyKSk7XG4gICAgfSBlbHNlIGlmIChhbGxJbmRleF85MzMgIT09IC0xKSB7XG4gICAgICBuZXdzdHhfOTMxLnNjb3Blc2V0cy5hbGwgPSBhbGxTY29wZXNldF85MzAucmVtb3ZlKGFsbEluZGV4XzkzMyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzkyOCwgbmV3c3R4XzkzMSk7XG4gIH1cbiAgbWF0Y2godHlwZV85MzUsIHZhbHVlXzkzNikge1xuICAgIGlmICghVHlwZXNfODIyW3R5cGVfOTM1XSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHR5cGVfOTM1ICsgXCIgaXMgYW4gaW52YWxpZCB0eXBlXCIpO1xuICAgIH1cbiAgICByZXR1cm4gVHlwZXNfODIyW3R5cGVfOTM1XS5tYXRjaCh0aGlzLnRva2VuKSAmJiAodmFsdWVfOTM2ID09IG51bGwgfHwgKHZhbHVlXzkzNiBpbnN0YW5jZW9mIFJlZ0V4cCA/IHZhbHVlXzkzNi50ZXN0KHRoaXMudmFsKCkpIDogdGhpcy52YWwoKSA9PSB2YWx1ZV85MzYpKTtcbiAgfVxuICBpc0lkZW50aWZpZXIodmFsdWVfOTM3KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJpZGVudGlmaWVyXCIsIHZhbHVlXzkzNyk7XG4gIH1cbiAgaXNBc3NpZ24odmFsdWVfOTM4KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJhc3NpZ25cIiwgdmFsdWVfOTM4KTtcbiAgfVxuICBpc0Jvb2xlYW5MaXRlcmFsKHZhbHVlXzkzOSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYm9vbGVhblwiLCB2YWx1ZV85MzkpO1xuICB9XG4gIGlzS2V5d29yZCh2YWx1ZV85NDApIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImtleXdvcmRcIiwgdmFsdWVfOTQwKTtcbiAgfVxuICBpc051bGxMaXRlcmFsKHZhbHVlXzk0MSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVsbFwiLCB2YWx1ZV85NDEpO1xuICB9XG4gIGlzTnVtZXJpY0xpdGVyYWwodmFsdWVfOTQyKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJudW1iZXJcIiwgdmFsdWVfOTQyKTtcbiAgfVxuICBpc1B1bmN0dWF0b3IodmFsdWVfOTQzKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwdW5jdHVhdG9yXCIsIHZhbHVlXzk0Myk7XG4gIH1cbiAgaXNTdHJpbmdMaXRlcmFsKHZhbHVlXzk0NCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwic3RyaW5nXCIsIHZhbHVlXzk0NCk7XG4gIH1cbiAgaXNSZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV85NDUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbHVlXzk0NSk7XG4gIH1cbiAgaXNUZW1wbGF0ZSh2YWx1ZV85NDYpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInRlbXBsYXRlXCIsIHZhbHVlXzk0Nik7XG4gIH1cbiAgaXNEZWxpbWl0ZXIodmFsdWVfOTQ3KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiwgdmFsdWVfOTQ3KTtcbiAgfVxuICBpc1BhcmVucyh2YWx1ZV85NDgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInBhcmVuc1wiLCB2YWx1ZV85NDgpO1xuICB9XG4gIGlzQnJhY2VzKHZhbHVlXzk0OSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYnJhY2VzXCIsIHZhbHVlXzk0OSk7XG4gIH1cbiAgaXNCcmFja2V0cyh2YWx1ZV85NTApIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNrZXRzXCIsIHZhbHVlXzk1MCk7XG4gIH1cbiAgaXNTeW50YXhUZW1wbGF0ZSh2YWx1ZV85NTEpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN5bnRheFRlbXBsYXRlXCIsIHZhbHVlXzk1MSk7XG4gIH1cbiAgaXNFT0YodmFsdWVfOTUyKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJlb2ZcIiwgdmFsdWVfOTUyKTtcbiAgfVxuICB0b1N0cmluZygpIHtcbiAgICBpZiAodGhpcy5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4ubWFwKHNfOTUzID0+IHNfOTUzLnRvU3RyaW5nKCkpLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcInN0cmluZ1wiKSkge1xuICAgICAgcmV0dXJuIFwiJ1wiICsgdGhpcy50b2tlbi5zdHI7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxufVxuZXhwb3J0IHtUeXBlc184MjIgYXMgVHlwZXN9O1xuZXhwb3J0IHtBTExfUEhBU0VTXzgyMyBhcyBBTExfUEhBU0VTfSJdfQ==