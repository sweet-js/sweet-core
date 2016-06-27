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

const Just_786 = _ramdaFantasy.Maybe.Just;
const Nothing_787 = _ramdaFantasy.Maybe.Nothing;
function sizeDecending_788(a_791, b_792) {
  if (a_791.scopes.size > b_792.scopes.size) {
    return -1;
  } else if (b_792.scopes.size > a_791.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}
let Types_789 = { null: { match: token_793 => !Types_789.delimiter.match(token_793) && token_793.type === _tokenizer.TokenType.NULL, create: (value_794, stx_795) => new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_795) }, number: { match: token_796 => !Types_789.delimiter.match(token_796) && token_796.type.klass === _tokenizer.TokenClass.NumericLiteral, create: (value_797, stx_798) => new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_797 }, stx_798) }, string: { match: token_799 => !Types_789.delimiter.match(token_799) && token_799.type.klass === _tokenizer.TokenClass.StringLiteral, create: (value_800, stx_801) => new Syntax({ type: _tokenizer.TokenType.STRING, str: value_800 }, stx_801) }, punctuator: { match: token_802 => !Types_789.delimiter.match(token_802) && token_802.type.klass === _tokenizer.TokenClass.Punctuator, create: (value_803, stx_804) => new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_803 }, value: value_803 }, stx_804) }, keyword: { match: token_805 => !Types_789.delimiter.match(token_805) && token_805.type.klass === _tokenizer.TokenClass.Keyword, create: (value_806, stx_807) => new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_806 }, value: value_806 }, stx_807) }, identifier: { match: token_808 => !Types_789.delimiter.match(token_808) && token_808.type.klass === _tokenizer.TokenClass.Ident, create: (value_809, stx_810) => new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_809 }, stx_810) }, regularExpression: { match: token_811 => !Types_789.delimiter.match(token_811) && token_811.type.klass === _tokenizer.TokenClass.RegularExpression, create: (value_812, stx_813) => new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_812 }, stx_813) }, braces: { match: token_814 => Types_789.delimiter.match(token_814) && token_814.get(0).token.type === _tokenizer.TokenType.LBRACE, create: (inner_815, stx_816) => {
      let left_817 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });
      let right_818 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });
      return new Syntax(_immutable.List.of(left_817).concat(inner_815).push(right_818), stx_816);
    } }, brackets: { match: token_819 => Types_789.delimiter.match(token_819) && token_819.get(0).token.type === _tokenizer.TokenType.LBRACK, create: (inner_820, stx_821) => {
      let left_822 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });
      let right_823 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });
      return new Syntax(_immutable.List.of(left_822).concat(inner_820).push(right_823), stx_821);
    } }, parens: { match: token_824 => Types_789.delimiter.match(token_824) && token_824.get(0).token.type === _tokenizer.TokenType.LPAREN, create: (inner_825, stx_826) => {
      let left_827 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });
      let right_828 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });
      return new Syntax(_immutable.List.of(left_827).concat(inner_825).push(right_828), stx_826);
    } }, assign: { match: token_829 => {
      if (Types_789.punctuator.match(token_829)) {
        switch (token_829.value) {
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
    } }, boolean: { match: token_830 => !Types_789.delimiter.match(token_830) && token_830.type === _tokenizer.TokenType.TRUE || token_830.type === _tokenizer.TokenType.FALSE }, template: { match: token_831 => !Types_789.delimiter.match(token_831) && token_831.type === _tokenizer.TokenType.TEMPLATE }, delimiter: { match: token_832 => _immutable.List.isList(token_832) }, syntaxTemplate: { match: token_833 => Types_789.delimiter.match(token_833) && token_833.get(0).val() === "#`" }, eof: { match: token_834 => !Types_789.delimiter.match(token_834) && token_834.type === _tokenizer.TokenType.EOS } };
;
const ALL_PHASES_790 = {};
;
class Syntax {
  constructor(token_835) {
    let oldstx_836 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.token = token_835;
    this.bindings = oldstx_836.bindings != null ? oldstx_836.bindings : new _bindingMap2.default();
    this.scopesets = oldstx_836.scopesets != null ? oldstx_836.scopesets : { all: (0, _immutable.List)(), phase: (0, _immutable.Map)() };
    Object.freeze(this);
  }
  static of(token_837) {
    let stx_838 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Syntax(token_837, stx_838);
  }
  static from(type_839, value_840) {
    let stx_841 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!Types_789[type_839]) {
      throw new Error(type_839 + " is not a valid type");
    } else if (!Types_789[type_839].create) {
      throw new Error("Cannot create a syntax from type " + type_839);
    }
    return Types_789[type_839].create(value_840, stx_841);
  }
  static fromNull() {
    let stx_842 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return Syntax.from("null", null, stx_842);
  }
  static fromNumber(value_843) {
    let stx_844 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("number", value_843, stx_844);
  }
  static fromString(value_845) {
    let stx_846 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("string", value_845, stx_846);
  }
  static fromPunctuator(value_847) {
    let stx_848 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("punctuator", value_847, stx_848);
  }
  static fromKeyword(value_849) {
    let stx_850 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("keyword", value_849, stx_850);
  }
  static fromIdentifier(value_851) {
    let stx_852 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("identifier", value_851, stx_852);
  }
  static fromRegularExpression(value_853) {
    let stx_854 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("regularExpression", value_853, stx_854);
  }
  static fromBraces(inner_855) {
    let stx_856 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("braces", inner_855, stx_856);
  }
  static fromBrackets(inner_857) {
    let stx_858 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("brackets", inner_857, stx_858);
  }
  static fromParens(inner_859) {
    let stx_860 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return Syntax.from("parens", inner_859, stx_860);
  }
  resolve(phase_861) {
    (0, _errors.assert)(phase_861 != null, "must provide a phase to resolve");
    let allScopes_862 = this.scopesets.all;
    let stxScopes_863 = this.scopesets.phase.has(phase_861) ? this.scopesets.phase.get(phase_861) : (0, _immutable.List)();
    stxScopes_863 = allScopes_862.concat(stxScopes_863);
    if (stxScopes_863.size === 0 || !(this.match("identifier") || this.match("keyword"))) {
      return this.token.value;
    }
    let scope_864 = stxScopes_863.last();
    let bindings_865 = this.bindings;
    if (scope_864) {
      let scopesetBindingList = bindings_865.get(this);
      if (scopesetBindingList) {
        let biggestBindingPair = scopesetBindingList.filter(_ref => {
          let scopes = _ref.scopes;
          let binding = _ref.binding;

          return scopes.isSubset(stxScopes_863);
        }).sort(sizeDecending_788);
        if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
          let debugBase = "{" + stxScopes_863.map(s_866 => s_866.toString()).join(", ") + "}";
          let debugAmbigousScopesets = biggestBindingPair.map(_ref2 => {
            let scopes = _ref2.scopes;

            return "{" + scopes.map(s_867 => s_867.toString()).join(", ") + "}";
          }).join(", ");
          throw new Error("Scopeset " + debugBase + " has ambiguous subsets " + debugAmbigousScopesets);
        } else if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve(phase_861);
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
      return this.token.items.map(el_868 => {
        if (el_868 instanceof Syntax && el_868.match("delimiter")) {
          return "${...}";
        }
        return el_868.slice.text;
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
  setLineNumber(line_869) {
    let newTok_870 = {};
    if (this.isDelimiter()) {
      newTok_870 = this.token.map(s_871 => s_871.setLineNumber(line_869));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok_870[key] = this.token[key];
      }
      (0, _errors.assert)(newTok_870.slice && newTok_870.slice.startLocation, "all tokens must have line info");
      newTok_870.slice.startLocation.line = line_869;
    }
    return new Syntax(newTok_870, this);
  }
  inner() {
    (0, _errors.assert)(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }
  addScope(scope_872, bindings_873, phase_874) {
    let options_875 = arguments.length <= 3 || arguments[3] === undefined ? { flip: false } : arguments[3];

    let token_876 = this.match("delimiter") ? this.token.map(s_880 => s_880.addScope(scope_872, bindings_873, phase_874, options_875)) : this.token;
    if (this.match("template")) {
      token_876 = { type: this.token.type, items: token_876.items.map(it_881 => {
          if (it_881 instanceof Syntax && it_881.match("delimiter")) {
            return it_881.addScope(scope_872, bindings_873, phase_874, options_875);
          }
          return it_881;
        }) };
    }
    let oldScopeset_877;
    if (phase_874 === ALL_PHASES_790) {
      oldScopeset_877 = this.scopesets.all;
    } else {
      oldScopeset_877 = this.scopesets.phase.has(phase_874) ? this.scopesets.phase.get(phase_874) : (0, _immutable.List)();
    }
    let newScopeset_878;
    if (options_875.flip) {
      let index = oldScopeset_877.indexOf(scope_872);
      if (index !== -1) {
        newScopeset_878 = oldScopeset_877.remove(index);
      } else {
        newScopeset_878 = oldScopeset_877.push(scope_872);
      }
    } else {
      newScopeset_878 = oldScopeset_877.push(scope_872);
    }
    let newstx_879 = { bindings: bindings_873, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    if (phase_874 === ALL_PHASES_790) {
      newstx_879.scopesets.all = newScopeset_878;
    } else {
      newstx_879.scopesets.phase = newstx_879.scopesets.phase.set(phase_874, newScopeset_878);
    }
    return new Syntax(token_876, newstx_879);
  }
  removeScope(scope_882, phase_883) {
    let token_884 = this.match("delimiter") ? this.token.map(s_890 => s_890.removeScope(scope_882, phase_883)) : this.token;
    let phaseScopeset_885 = this.scopesets.phase.has(phase_883) ? this.scopesets.phase.get(phase_883) : (0, _immutable.List)();
    let allScopeset_886 = this.scopesets.all;
    let newstx_887 = { bindings: this.bindings, scopesets: { all: this.scopesets.all, phase: this.scopesets.phase } };
    let phaseIndex_888 = phaseScopeset_885.indexOf(scope_882);
    let allIndex_889 = allScopeset_886.indexOf(scope_882);
    if (phaseIndex_888 !== -1) {
      newstx_887.scopesets.phase = this.scopesets.phase.set(phase_883, phaseScopeset_885.remove(phaseIndex_888));
    } else if (allIndex_889 !== -1) {
      newstx_887.scopesets.all = allScopeset_886.remove(allIndex_889);
    }
    return new Syntax(token_884, newstx_887);
  }
  match(type_891, value_892) {
    if (!Types_789[type_891]) {
      throw new Error(type_891 + " is an invalid type");
    }
    return Types_789[type_891].match(this.token) && (value_892 == null || (value_892 instanceof RegExp ? value_892.test(this.val()) : this.val() == value_892));
  }
  isIdentifier(value_893) {
    return this.match("identifier", value_893);
  }
  isAssign(value_894) {
    return this.match("assign", value_894);
  }
  isBooleanLiteral(value_895) {
    return this.match("boolean", value_895);
  }
  isKeyword(value_896) {
    return this.match("keyword", value_896);
  }
  isNullLiteral(value_897) {
    return this.match("null", value_897);
  }
  isNumericLiteral(value_898) {
    return this.match("number", value_898);
  }
  isPunctuator(value_899) {
    return this.match("punctuator", value_899);
  }
  isStringLiteral(value_900) {
    return this.match("string", value_900);
  }
  isRegularExpression(value_901) {
    return this.match("regularExpression", value_901);
  }
  isTemplate(value_902) {
    return this.match("template", value_902);
  }
  isDelimiter(value_903) {
    return this.match("delimiter", value_903);
  }
  isParens(value_904) {
    return this.match("parens", value_904);
  }
  isBraces(value_905) {
    return this.match("braces", value_905);
  }
  isBrackets(value_906) {
    return this.match("brackets", value_906);
  }
  isSyntaxTemplate(value_907) {
    return this.match("syntaxTemplate", value_907);
  }
  isEOF(value_908) {
    return this.match("eof", value_908);
  }
  toString() {
    if (this.match("delimiter")) {
      return this.token.map(s_909 => s_909.toString()).join(" ");
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
exports.Types = Types_789;
exports.ALL_PHASES = ALL_PHASES_790;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N5bnRheC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7SUFBYSxDOzs7Ozs7QUFDYixNQUFNLFdBQVcsb0JBQU0sSUFBdkI7QUFDQSxNQUFNLGNBQWMsb0JBQU0sT0FBMUI7QUFDQSxTQUFTLGlCQUFULENBQTJCLEtBQTNCLEVBQWtDLEtBQWxDLEVBQXlDO0FBQ3ZDLE1BQUksTUFBTSxNQUFOLENBQWEsSUFBYixHQUFvQixNQUFNLE1BQU4sQ0FBYSxJQUFyQyxFQUEyQztBQUN6QyxXQUFPLENBQUMsQ0FBUjtBQUNELEdBRkQsTUFFTyxJQUFJLE1BQU0sTUFBTixDQUFhLElBQWIsR0FBb0IsTUFBTSxNQUFOLENBQWEsSUFBckMsRUFBMkM7QUFDaEQsV0FBTyxDQUFQO0FBQ0QsR0FGTSxNQUVBO0FBQ0wsV0FBTyxDQUFQO0FBQ0Q7QUFDRjtBQUNELElBQUksWUFBWSxFQUFDLE1BQU0sRUFBQyxPQUFPLGFBQWEsQ0FBQyxVQUFVLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBMEIsU0FBMUIsQ0FBRCxJQUF5QyxVQUFVLElBQVYsS0FBbUIscUJBQVUsSUFBM0YsRUFBaUcsUUFBUSxDQUFDLFNBQUQsRUFBWSxPQUFaLEtBQXdCLElBQUksTUFBSixDQUFXLEVBQUMsTUFBTSxxQkFBVSxJQUFqQixFQUF1QixPQUFPLElBQTlCLEVBQVgsRUFBZ0QsT0FBaEQsQ0FBakksRUFBUCxFQUFtTSxRQUFRLEVBQUMsT0FBTyxhQUFhLENBQUMsVUFBVSxTQUFWLENBQW9CLEtBQXBCLENBQTBCLFNBQTFCLENBQUQsSUFBeUMsVUFBVSxJQUFWLENBQWUsS0FBZixLQUF5QixzQkFBVyxjQUFsRyxFQUFrSCxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosS0FBd0IsSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQXlCLE9BQU8sU0FBaEMsRUFBWCxFQUF1RCxPQUF2RCxDQUFsSixFQUEzTSxFQUErWixRQUFRLEVBQUMsT0FBTyxhQUFhLENBQUMsVUFBVSxTQUFWLENBQW9CLEtBQXBCLENBQTBCLFNBQTFCLENBQUQsSUFBeUMsVUFBVSxJQUFWLENBQWUsS0FBZixLQUF5QixzQkFBVyxhQUFsRyxFQUFpSCxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosS0FBd0IsSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQXlCLEtBQUssU0FBOUIsRUFBWCxFQUFxRCxPQUFyRCxDQUFqSixFQUF2YSxFQUF3bkIsWUFBWSxFQUFDLE9BQU8sYUFBYSxDQUFDLFVBQVUsU0FBVixDQUFvQixLQUFwQixDQUEwQixTQUExQixDQUFELElBQXlDLFVBQVUsSUFBVixDQUFlLEtBQWYsS0FBeUIsc0JBQVcsVUFBbEcsRUFBOEcsUUFBUSxDQUFDLFNBQUQsRUFBWSxPQUFaLEtBQXdCLElBQUksTUFBSixDQUFXLEVBQUMsTUFBTSxFQUFDLE9BQU8sc0JBQVcsVUFBbkIsRUFBK0IsTUFBTSxTQUFyQyxFQUFQLEVBQXdELE9BQU8sU0FBL0QsRUFBWCxFQUFzRixPQUF0RixDQUE5SSxFQUFwb0IsRUFBbTNCLFNBQVMsRUFBQyxPQUFPLGFBQWEsQ0FBQyxVQUFVLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBMEIsU0FBMUIsQ0FBRCxJQUF5QyxVQUFVLElBQVYsQ0FBZSxLQUFmLEtBQXlCLHNCQUFXLE9BQWxHLEVBQTJHLFFBQVEsQ0FBQyxTQUFELEVBQVksT0FBWixLQUF3QixJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0sRUFBQyxPQUFPLHNCQUFXLE9BQW5CLEVBQTRCLE1BQU0sU0FBbEMsRUFBUCxFQUFxRCxPQUFPLFNBQTVELEVBQVgsRUFBbUYsT0FBbkYsQ0FBM0ksRUFBNTNCLEVBQXFtQyxZQUFZLEVBQUMsT0FBTyxhQUFhLENBQUMsVUFBVSxTQUFWLENBQW9CLEtBQXBCLENBQTBCLFNBQTFCLENBQUQsSUFBeUMsVUFBVSxJQUFWLENBQWUsS0FBZixLQUF5QixzQkFBVyxLQUFsRyxFQUF5RyxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosS0FBd0IsSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLFVBQWpCLEVBQTZCLE9BQU8sU0FBcEMsRUFBWCxFQUEyRCxPQUEzRCxDQUF6SSxFQUFqbkMsRUFBZzBDLG1CQUFtQixFQUFDLE9BQU8sYUFBYSxDQUFDLFVBQVUsU0FBVixDQUFvQixLQUFwQixDQUEwQixTQUExQixDQUFELElBQXlDLFVBQVUsSUFBVixDQUFlLEtBQWYsS0FBeUIsc0JBQVcsaUJBQWxHLEVBQXFILFFBQVEsQ0FBQyxTQUFELEVBQVksT0FBWixLQUF3QixJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxTQUFoQyxFQUFYLEVBQXVELE9BQXZELENBQXJKLEVBQW4xQyxFQUEwaUQsUUFBUSxFQUFDLE9BQU8sYUFBYSxVQUFVLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBMEIsU0FBMUIsS0FBd0MsVUFBVSxHQUFWLENBQWMsQ0FBZCxFQUFpQixLQUFqQixDQUF1QixJQUF2QixLQUFnQyxxQkFBVSxNQUF2RyxFQUErRyxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosS0FBd0I7QUFDL3NELFVBQUksV0FBVyxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxHQUFoQyxFQUFYLENBQWY7QUFDQSxVQUFJLFlBQVksSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQXlCLE9BQU8sR0FBaEMsRUFBWCxDQUFoQjtBQUNBLGFBQU8sSUFBSSxNQUFKLENBQVcsZ0JBQUssRUFBTCxDQUFRLFFBQVIsRUFBa0IsTUFBbEIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBcEMsQ0FBeUMsU0FBekMsQ0FBWCxFQUFnRSxPQUFoRSxDQUFQO0FBQ0QsS0FKaWtELEVBQWxqRCxFQUlaLFVBQVUsRUFBQyxPQUFPLGFBQWEsVUFBVSxTQUFWLENBQW9CLEtBQXBCLENBQTBCLFNBQTFCLEtBQXdDLFVBQVUsR0FBVixDQUFjLENBQWQsRUFBaUIsS0FBakIsQ0FBdUIsSUFBdkIsS0FBZ0MscUJBQVUsTUFBdkcsRUFBK0csUUFBUSxDQUFDLFNBQUQsRUFBWSxPQUFaLEtBQXdCO0FBQzNKLFVBQUksV0FBVyxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxHQUFoQyxFQUFYLENBQWY7QUFDQSxVQUFJLFlBQVksSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQXlCLE9BQU8sR0FBaEMsRUFBWCxDQUFoQjtBQUNBLGFBQU8sSUFBSSxNQUFKLENBQVcsZ0JBQUssRUFBTCxDQUFRLFFBQVIsRUFBa0IsTUFBbEIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBcEMsQ0FBeUMsU0FBekMsQ0FBWCxFQUFnRSxPQUFoRSxDQUFQO0FBQ0QsS0FKYSxFQUpFLEVBUVosUUFBUSxFQUFDLE9BQU8sYUFBYSxVQUFVLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBMEIsU0FBMUIsS0FBd0MsVUFBVSxHQUFWLENBQWMsQ0FBZCxFQUFpQixLQUFqQixDQUF1QixJQUF2QixLQUFnQyxxQkFBVSxNQUF2RyxFQUErRyxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosS0FBd0I7QUFDekosVUFBSSxXQUFXLElBQUksTUFBSixDQUFXLEVBQUMsTUFBTSxxQkFBVSxNQUFqQixFQUF5QixPQUFPLEdBQWhDLEVBQVgsQ0FBZjtBQUNBLFVBQUksWUFBWSxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxHQUFoQyxFQUFYLENBQWhCO0FBQ0EsYUFBTyxJQUFJLE1BQUosQ0FBVyxnQkFBSyxFQUFMLENBQVEsUUFBUixFQUFrQixNQUFsQixDQUF5QixTQUF6QixFQUFvQyxJQUFwQyxDQUF5QyxTQUF6QyxDQUFYLEVBQWdFLE9BQWhFLENBQVA7QUFDRCxLQUpXLEVBUkksRUFZWixRQUFRLEVBQUMsT0FBTyxhQUFhO0FBQy9CLFVBQUksVUFBVSxVQUFWLENBQXFCLEtBQXJCLENBQTJCLFNBQTNCLENBQUosRUFBMkM7QUFDekMsZ0JBQVEsVUFBVSxLQUFsQjtBQUNFLGVBQUssR0FBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssS0FBTDtBQUNBLGVBQUssS0FBTDtBQUNBLGVBQUssTUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNBLGVBQUssSUFBTDtBQUNFLG1CQUFPLElBQVA7QUFDRjtBQUNFLG1CQUFPLEtBQVA7QUFmSjtBQWlCRDtBQUNELGFBQU8sS0FBUDtBQUNELEtBckJXLEVBWkksRUFpQ1osU0FBUyxFQUFDLE9BQU8sYUFBYSxDQUFDLFVBQVUsU0FBVixDQUFvQixLQUFwQixDQUEwQixTQUExQixDQUFELElBQXlDLFVBQVUsSUFBVixLQUFtQixxQkFBVSxJQUF0RSxJQUE4RSxVQUFVLElBQVYsS0FBbUIscUJBQVUsS0FBaEksRUFqQ0csRUFpQ3FJLFVBQVUsRUFBQyxPQUFPLGFBQWEsQ0FBQyxVQUFVLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBMEIsU0FBMUIsQ0FBRCxJQUF5QyxVQUFVLElBQVYsS0FBbUIscUJBQVUsUUFBM0YsRUFqQy9JLEVBaUNxUCxXQUFXLEVBQUMsT0FBTyxhQUFhLGdCQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXJCLEVBakNoUSxFQWlDOFMsZ0JBQWdCLEVBQUMsT0FBTyxhQUFhLFVBQVUsU0FBVixDQUFvQixLQUFwQixDQUEwQixTQUExQixLQUF3QyxVQUFVLEdBQVYsQ0FBYyxDQUFkLEVBQWlCLEdBQWpCLE9BQTJCLElBQXhGLEVBakM5VCxFQWlDNlosS0FBSyxFQUFDLE9BQU8sYUFBYSxDQUFDLFVBQVUsU0FBVixDQUFvQixLQUFwQixDQUEwQixTQUExQixDQUFELElBQXlDLFVBQVUsSUFBVixLQUFtQixxQkFBVSxHQUEzRixFQWpDbGEsRUFBaEI7QUFrQ0E7QUFDQSxNQUFNLGlCQUFpQixFQUF2QjtBQUNBO0FBQ2UsTUFBTSxNQUFOLENBQWE7QUFDMUIsY0FBWSxTQUFaLEVBQXdDO0FBQUEsUUFBakIsVUFBaUIseURBQUosRUFBSTs7QUFDdEMsU0FBSyxLQUFMLEdBQWEsU0FBYjtBQUNBLFNBQUssUUFBTCxHQUFnQixXQUFXLFFBQVgsSUFBdUIsSUFBdkIsR0FBOEIsV0FBVyxRQUF6QyxHQUFvRCwwQkFBcEU7QUFDQSxTQUFLLFNBQUwsR0FBaUIsV0FBVyxTQUFYLElBQXdCLElBQXhCLEdBQStCLFdBQVcsU0FBMUMsR0FBc0QsRUFBQyxLQUFLLHNCQUFOLEVBQWMsT0FBTyxxQkFBckIsRUFBdkU7QUFDQSxXQUFPLE1BQVAsQ0FBYyxJQUFkO0FBQ0Q7QUFDRCxTQUFPLEVBQVAsQ0FBVSxTQUFWLEVBQW1DO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQ2pDLFdBQU8sSUFBSSxNQUFKLENBQVcsU0FBWCxFQUFzQixPQUF0QixDQUFQO0FBQ0Q7QUFDRCxTQUFPLElBQVAsQ0FBWSxRQUFaLEVBQXNCLFNBQXRCLEVBQStDO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQzdDLFFBQUksQ0FBQyxVQUFVLFFBQVYsQ0FBTCxFQUEwQjtBQUN4QixZQUFNLElBQUksS0FBSixDQUFVLFdBQVcsc0JBQXJCLENBQU47QUFDRCxLQUZELE1BRU8sSUFBSSxDQUFDLFVBQVUsUUFBVixFQUFvQixNQUF6QixFQUFpQztBQUN0QyxZQUFNLElBQUksS0FBSixDQUFVLHNDQUFzQyxRQUFoRCxDQUFOO0FBQ0Q7QUFDRCxXQUFPLFVBQVUsUUFBVixFQUFvQixNQUFwQixDQUEyQixTQUEzQixFQUFzQyxPQUF0QyxDQUFQO0FBQ0Q7QUFDRCxTQUFPLFFBQVAsR0FBOEI7QUFBQSxRQUFkLE9BQWMseURBQUosRUFBSTs7QUFDNUIsV0FBTyxPQUFPLElBQVAsQ0FBWSxNQUFaLEVBQW9CLElBQXBCLEVBQTBCLE9BQTFCLENBQVA7QUFDRDtBQUNELFNBQU8sVUFBUCxDQUFrQixTQUFsQixFQUEyQztBQUFBLFFBQWQsT0FBYyx5REFBSixFQUFJOztBQUN6QyxXQUFPLE9BQU8sSUFBUCxDQUFZLFFBQVosRUFBc0IsU0FBdEIsRUFBaUMsT0FBakMsQ0FBUDtBQUNEO0FBQ0QsU0FBTyxVQUFQLENBQWtCLFNBQWxCLEVBQTJDO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQ3pDLFdBQU8sT0FBTyxJQUFQLENBQVksUUFBWixFQUFzQixTQUF0QixFQUFpQyxPQUFqQyxDQUFQO0FBQ0Q7QUFDRCxTQUFPLGNBQVAsQ0FBc0IsU0FBdEIsRUFBK0M7QUFBQSxRQUFkLE9BQWMseURBQUosRUFBSTs7QUFDN0MsV0FBTyxPQUFPLElBQVAsQ0FBWSxZQUFaLEVBQTBCLFNBQTFCLEVBQXFDLE9BQXJDLENBQVA7QUFDRDtBQUNELFNBQU8sV0FBUCxDQUFtQixTQUFuQixFQUE0QztBQUFBLFFBQWQsT0FBYyx5REFBSixFQUFJOztBQUMxQyxXQUFPLE9BQU8sSUFBUCxDQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsT0FBbEMsQ0FBUDtBQUNEO0FBQ0QsU0FBTyxjQUFQLENBQXNCLFNBQXRCLEVBQStDO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQzdDLFdBQU8sT0FBTyxJQUFQLENBQVksWUFBWixFQUEwQixTQUExQixFQUFxQyxPQUFyQyxDQUFQO0FBQ0Q7QUFDRCxTQUFPLHFCQUFQLENBQTZCLFNBQTdCLEVBQXNEO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQ3BELFdBQU8sT0FBTyxJQUFQLENBQVksbUJBQVosRUFBaUMsU0FBakMsRUFBNEMsT0FBNUMsQ0FBUDtBQUNEO0FBQ0QsU0FBTyxVQUFQLENBQWtCLFNBQWxCLEVBQTJDO0FBQUEsUUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQ3pDLFdBQU8sT0FBTyxJQUFQLENBQVksUUFBWixFQUFzQixTQUF0QixFQUFpQyxPQUFqQyxDQUFQO0FBQ0Q7QUFDRCxTQUFPLFlBQVAsQ0FBb0IsU0FBcEIsRUFBNkM7QUFBQSxRQUFkLE9BQWMseURBQUosRUFBSTs7QUFDM0MsV0FBTyxPQUFPLElBQVAsQ0FBWSxVQUFaLEVBQXdCLFNBQXhCLEVBQW1DLE9BQW5DLENBQVA7QUFDRDtBQUNELFNBQU8sVUFBUCxDQUFrQixTQUFsQixFQUEyQztBQUFBLFFBQWQsT0FBYyx5REFBSixFQUFJOztBQUN6QyxXQUFPLE9BQU8sSUFBUCxDQUFZLFFBQVosRUFBc0IsU0FBdEIsRUFBaUMsT0FBakMsQ0FBUDtBQUNEO0FBQ0QsVUFBUSxTQUFSLEVBQW1CO0FBQ2pCLHdCQUFPLGFBQWEsSUFBcEIsRUFBMEIsaUNBQTFCO0FBQ0EsUUFBSSxnQkFBZ0IsS0FBSyxTQUFMLENBQWUsR0FBbkM7QUFDQSxRQUFJLGdCQUFnQixLQUFLLFNBQUwsQ0FBZSxLQUFmLENBQXFCLEdBQXJCLENBQXlCLFNBQXpCLElBQXNDLEtBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsR0FBckIsQ0FBeUIsU0FBekIsQ0FBdEMsR0FBNEUsc0JBQWhHO0FBQ0Esb0JBQWdCLGNBQWMsTUFBZCxDQUFxQixhQUFyQixDQUFoQjtBQUNBLFFBQUksY0FBYyxJQUFkLEtBQXVCLENBQXZCLElBQTRCLEVBQUUsS0FBSyxLQUFMLENBQVcsWUFBWCxLQUE0QixLQUFLLEtBQUwsQ0FBVyxTQUFYLENBQTlCLENBQWhDLEVBQXNGO0FBQ3BGLGFBQU8sS0FBSyxLQUFMLENBQVcsS0FBbEI7QUFDRDtBQUNELFFBQUksWUFBWSxjQUFjLElBQWQsRUFBaEI7QUFDQSxRQUFJLGVBQWUsS0FBSyxRQUF4QjtBQUNBLFFBQUksU0FBSixFQUFlO0FBQ2IsVUFBSSxzQkFBc0IsYUFBYSxHQUFiLENBQWlCLElBQWpCLENBQTFCO0FBQ0EsVUFBSSxtQkFBSixFQUF5QjtBQUN2QixZQUFJLHFCQUFxQixvQkFBb0IsTUFBcEIsQ0FBMkIsUUFBdUI7QUFBQSxjQUFyQixNQUFxQixRQUFyQixNQUFxQjtBQUFBLGNBQWIsT0FBYSxRQUFiLE9BQWE7O0FBQ3pFLGlCQUFPLE9BQU8sUUFBUCxDQUFnQixhQUFoQixDQUFQO0FBQ0QsU0FGd0IsRUFFdEIsSUFGc0IsQ0FFakIsaUJBRmlCLENBQXpCO0FBR0EsWUFBSSxtQkFBbUIsSUFBbkIsSUFBMkIsQ0FBM0IsSUFBZ0MsbUJBQW1CLEdBQW5CLENBQXVCLENBQXZCLEVBQTBCLE1BQTFCLENBQWlDLElBQWpDLEtBQTBDLG1CQUFtQixHQUFuQixDQUF1QixDQUF2QixFQUEwQixNQUExQixDQUFpQyxJQUEvRyxFQUFxSDtBQUNuSCxjQUFJLFlBQVksTUFBTSxjQUFjLEdBQWQsQ0FBa0IsU0FBUyxNQUFNLFFBQU4sRUFBM0IsRUFBNkMsSUFBN0MsQ0FBa0QsSUFBbEQsQ0FBTixHQUFnRSxHQUFoRjtBQUNBLGNBQUkseUJBQXlCLG1CQUFtQixHQUFuQixDQUF1QixTQUFjO0FBQUEsZ0JBQVosTUFBWSxTQUFaLE1BQVk7O0FBQ2hFLG1CQUFPLE1BQU0sT0FBTyxHQUFQLENBQVcsU0FBUyxNQUFNLFFBQU4sRUFBcEIsRUFBc0MsSUFBdEMsQ0FBMkMsSUFBM0MsQ0FBTixHQUF5RCxHQUFoRTtBQUNELFdBRjRCLEVBRTFCLElBRjBCLENBRXJCLElBRnFCLENBQTdCO0FBR0EsZ0JBQU0sSUFBSSxLQUFKLENBQVUsY0FBYyxTQUFkLEdBQTBCLHlCQUExQixHQUFzRCxzQkFBaEUsQ0FBTjtBQUNELFNBTkQsTUFNTyxJQUFJLG1CQUFtQixJQUFuQixLQUE0QixDQUFoQyxFQUFtQztBQUN4QyxjQUFJLGFBQWEsbUJBQW1CLEdBQW5CLENBQXVCLENBQXZCLEVBQTBCLE9BQTFCLENBQWtDLFFBQWxDLEVBQWpCO0FBQ0EsY0FBSSxvQkFBTSxNQUFOLENBQWEsbUJBQW1CLEdBQW5CLENBQXVCLENBQXZCLEVBQTBCLEtBQXZDLENBQUosRUFBbUQ7QUFDakQsbUJBQU8sbUJBQW1CLEdBQW5CLENBQXVCLENBQXZCLEVBQTBCLEtBQTFCLENBQWdDLFNBQWhDLENBQTBDLElBQTFDLEVBQWdELE9BQWhELENBQXdELFNBQXhELENBQVA7QUFDRDtBQUNELGlCQUFPLFVBQVA7QUFDRDtBQUNGO0FBQ0Y7QUFDRCxXQUFPLEtBQUssS0FBTCxDQUFXLEtBQWxCO0FBQ0Q7QUFDRCxRQUFNO0FBQ0osd0JBQU8sQ0FBQyxLQUFLLEtBQUwsQ0FBVyxXQUFYLENBQVIsRUFBaUMsbUNBQWpDO0FBQ0EsUUFBSSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQUosRUFBMEI7QUFDeEIsYUFBTyxLQUFLLEtBQUwsQ0FBVyxHQUFsQjtBQUNEO0FBQ0QsUUFBSSxLQUFLLEtBQUwsQ0FBVyxVQUFYLENBQUosRUFBNEI7QUFDMUIsYUFBTyxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLEdBQWpCLENBQXFCLFVBQVU7QUFDcEMsWUFBSSxrQkFBa0IsTUFBbEIsSUFBNEIsT0FBTyxLQUFQLENBQWEsV0FBYixDQUFoQyxFQUEyRDtBQUN6RCxpQkFBTyxRQUFQO0FBQ0Q7QUFDRCxlQUFPLE9BQU8sS0FBUCxDQUFhLElBQXBCO0FBQ0QsT0FMTSxFQUtKLElBTEksQ0FLQyxFQUxELENBQVA7QUFNRDtBQUNELFdBQU8sS0FBSyxLQUFMLENBQVcsS0FBbEI7QUFDRDtBQUNELGVBQWE7QUFDWCxRQUFJLENBQUMsS0FBSyxLQUFMLENBQVcsV0FBWCxDQUFMLEVBQThCO0FBQzVCLGFBQU8sS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixhQUFqQixDQUErQixJQUF0QztBQUNELEtBRkQsTUFFTztBQUNMLGFBQU8sS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLENBQWYsRUFBa0IsVUFBbEIsRUFBUDtBQUNEO0FBQ0Y7QUFDRCxnQkFBYyxRQUFkLEVBQXdCO0FBQ3RCLFFBQUksYUFBYSxFQUFqQjtBQUNBLFFBQUksS0FBSyxXQUFMLEVBQUosRUFBd0I7QUFDdEIsbUJBQWEsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFNBQVMsTUFBTSxhQUFOLENBQW9CLFFBQXBCLENBQXhCLENBQWI7QUFDRCxLQUZELE1BRU87QUFDTCxXQUFLLElBQUksR0FBVCxJQUFnQixPQUFPLElBQVAsQ0FBWSxLQUFLLEtBQWpCLENBQWhCLEVBQXlDO0FBQ3ZDLG1CQUFXLEdBQVgsSUFBa0IsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFsQjtBQUNEO0FBQ0QsMEJBQU8sV0FBVyxLQUFYLElBQW9CLFdBQVcsS0FBWCxDQUFpQixhQUE1QyxFQUEyRCxnQ0FBM0Q7QUFDQSxpQkFBVyxLQUFYLENBQWlCLGFBQWpCLENBQStCLElBQS9CLEdBQXNDLFFBQXRDO0FBQ0Q7QUFDRCxXQUFPLElBQUksTUFBSixDQUFXLFVBQVgsRUFBdUIsSUFBdkIsQ0FBUDtBQUNEO0FBQ0QsVUFBUTtBQUNOLHdCQUFPLEtBQUssS0FBTCxDQUFXLFdBQVgsQ0FBUCxFQUFnQyx1Q0FBaEM7QUFDQSxXQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsQ0FBakIsRUFBb0IsS0FBSyxLQUFMLENBQVcsSUFBWCxHQUFrQixDQUF0QyxDQUFQO0FBQ0Q7QUFDRCxXQUFTLFNBQVQsRUFBb0IsWUFBcEIsRUFBa0MsU0FBbEMsRUFBMEU7QUFBQSxRQUE3QixXQUE2Qix5REFBZixFQUFDLE1BQU0sS0FBUCxFQUFlOztBQUN4RSxRQUFJLFlBQVksS0FBSyxLQUFMLENBQVcsV0FBWCxJQUEwQixLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsU0FBUyxNQUFNLFFBQU4sQ0FBZSxTQUFmLEVBQTBCLFlBQTFCLEVBQXdDLFNBQXhDLEVBQW1ELFdBQW5ELENBQXhCLENBQTFCLEdBQXFILEtBQUssS0FBMUk7QUFDQSxRQUFJLEtBQUssS0FBTCxDQUFXLFVBQVgsQ0FBSixFQUE0QjtBQUMxQixrQkFBWSxFQUFDLE1BQU0sS0FBSyxLQUFMLENBQVcsSUFBbEIsRUFBd0IsT0FBTyxVQUFVLEtBQVYsQ0FBZ0IsR0FBaEIsQ0FBb0IsVUFBVTtBQUN2RSxjQUFJLGtCQUFrQixNQUFsQixJQUE0QixPQUFPLEtBQVAsQ0FBYSxXQUFiLENBQWhDLEVBQTJEO0FBQ3pELG1CQUFPLE9BQU8sUUFBUCxDQUFnQixTQUFoQixFQUEyQixZQUEzQixFQUF5QyxTQUF6QyxFQUFvRCxXQUFwRCxDQUFQO0FBQ0Q7QUFDRCxpQkFBTyxNQUFQO0FBQ0QsU0FMMEMsQ0FBL0IsRUFBWjtBQU1EO0FBQ0QsUUFBSSxlQUFKO0FBQ0EsUUFBSSxjQUFjLGNBQWxCLEVBQWtDO0FBQ2hDLHdCQUFrQixLQUFLLFNBQUwsQ0FBZSxHQUFqQztBQUNELEtBRkQsTUFFTztBQUNMLHdCQUFrQixLQUFLLFNBQUwsQ0FBZSxLQUFmLENBQXFCLEdBQXJCLENBQXlCLFNBQXpCLElBQXNDLEtBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsR0FBckIsQ0FBeUIsU0FBekIsQ0FBdEMsR0FBNEUsc0JBQTlGO0FBQ0Q7QUFDRCxRQUFJLGVBQUo7QUFDQSxRQUFJLFlBQVksSUFBaEIsRUFBc0I7QUFDcEIsVUFBSSxRQUFRLGdCQUFnQixPQUFoQixDQUF3QixTQUF4QixDQUFaO0FBQ0EsVUFBSSxVQUFVLENBQUMsQ0FBZixFQUFrQjtBQUNoQiwwQkFBa0IsZ0JBQWdCLE1BQWhCLENBQXVCLEtBQXZCLENBQWxCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsMEJBQWtCLGdCQUFnQixJQUFoQixDQUFxQixTQUFyQixDQUFsQjtBQUNEO0FBQ0YsS0FQRCxNQU9PO0FBQ0wsd0JBQWtCLGdCQUFnQixJQUFoQixDQUFxQixTQUFyQixDQUFsQjtBQUNEO0FBQ0QsUUFBSSxhQUFhLEVBQUMsVUFBVSxZQUFYLEVBQXlCLFdBQVcsRUFBQyxLQUFLLEtBQUssU0FBTCxDQUFlLEdBQXJCLEVBQTBCLE9BQU8sS0FBSyxTQUFMLENBQWUsS0FBaEQsRUFBcEMsRUFBakI7QUFDQSxRQUFJLGNBQWMsY0FBbEIsRUFBa0M7QUFDaEMsaUJBQVcsU0FBWCxDQUFxQixHQUFyQixHQUEyQixlQUEzQjtBQUNELEtBRkQsTUFFTztBQUNMLGlCQUFXLFNBQVgsQ0FBcUIsS0FBckIsR0FBNkIsV0FBVyxTQUFYLENBQXFCLEtBQXJCLENBQTJCLEdBQTNCLENBQStCLFNBQS9CLEVBQTBDLGVBQTFDLENBQTdCO0FBQ0Q7QUFDRCxXQUFPLElBQUksTUFBSixDQUFXLFNBQVgsRUFBc0IsVUFBdEIsQ0FBUDtBQUNEO0FBQ0QsY0FBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDO0FBQ2hDLFFBQUksWUFBWSxLQUFLLEtBQUwsQ0FBVyxXQUFYLElBQTBCLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxTQUFTLE1BQU0sV0FBTixDQUFrQixTQUFsQixFQUE2QixTQUE3QixDQUF4QixDQUExQixHQUE2RixLQUFLLEtBQWxIO0FBQ0EsUUFBSSxvQkFBb0IsS0FBSyxTQUFMLENBQWUsS0FBZixDQUFxQixHQUFyQixDQUF5QixTQUF6QixJQUFzQyxLQUFLLFNBQUwsQ0FBZSxLQUFmLENBQXFCLEdBQXJCLENBQXlCLFNBQXpCLENBQXRDLEdBQTRFLHNCQUFwRztBQUNBLFFBQUksa0JBQWtCLEtBQUssU0FBTCxDQUFlLEdBQXJDO0FBQ0EsUUFBSSxhQUFhLEVBQUMsVUFBVSxLQUFLLFFBQWhCLEVBQTBCLFdBQVcsRUFBQyxLQUFLLEtBQUssU0FBTCxDQUFlLEdBQXJCLEVBQTBCLE9BQU8sS0FBSyxTQUFMLENBQWUsS0FBaEQsRUFBckMsRUFBakI7QUFDQSxRQUFJLGlCQUFpQixrQkFBa0IsT0FBbEIsQ0FBMEIsU0FBMUIsQ0FBckI7QUFDQSxRQUFJLGVBQWUsZ0JBQWdCLE9BQWhCLENBQXdCLFNBQXhCLENBQW5CO0FBQ0EsUUFBSSxtQkFBbUIsQ0FBQyxDQUF4QixFQUEyQjtBQUN6QixpQkFBVyxTQUFYLENBQXFCLEtBQXJCLEdBQTZCLEtBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsR0FBckIsQ0FBeUIsU0FBekIsRUFBb0Msa0JBQWtCLE1BQWxCLENBQXlCLGNBQXpCLENBQXBDLENBQTdCO0FBQ0QsS0FGRCxNQUVPLElBQUksaUJBQWlCLENBQUMsQ0FBdEIsRUFBeUI7QUFDOUIsaUJBQVcsU0FBWCxDQUFxQixHQUFyQixHQUEyQixnQkFBZ0IsTUFBaEIsQ0FBdUIsWUFBdkIsQ0FBM0I7QUFDRDtBQUNELFdBQU8sSUFBSSxNQUFKLENBQVcsU0FBWCxFQUFzQixVQUF0QixDQUFQO0FBQ0Q7QUFDRCxRQUFNLFFBQU4sRUFBZ0IsU0FBaEIsRUFBMkI7QUFDekIsUUFBSSxDQUFDLFVBQVUsUUFBVixDQUFMLEVBQTBCO0FBQ3hCLFlBQU0sSUFBSSxLQUFKLENBQVUsV0FBVyxxQkFBckIsQ0FBTjtBQUNEO0FBQ0QsV0FBTyxVQUFVLFFBQVYsRUFBb0IsS0FBcEIsQ0FBMEIsS0FBSyxLQUEvQixNQUEwQyxhQUFhLElBQWIsS0FBc0IscUJBQXFCLE1BQXJCLEdBQThCLFVBQVUsSUFBVixDQUFlLEtBQUssR0FBTCxFQUFmLENBQTlCLEdBQTJELEtBQUssR0FBTCxNQUFjLFNBQS9GLENBQTFDLENBQVA7QUFDRDtBQUNELGVBQWEsU0FBYixFQUF3QjtBQUN0QixXQUFPLEtBQUssS0FBTCxDQUFXLFlBQVgsRUFBeUIsU0FBekIsQ0FBUDtBQUNEO0FBQ0QsV0FBUyxTQUFULEVBQW9CO0FBQ2xCLFdBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxFQUFxQixTQUFyQixDQUFQO0FBQ0Q7QUFDRCxtQkFBaUIsU0FBakIsRUFBNEI7QUFDMUIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxTQUFYLEVBQXNCLFNBQXRCLENBQVA7QUFDRDtBQUNELFlBQVUsU0FBVixFQUFxQjtBQUNuQixXQUFPLEtBQUssS0FBTCxDQUFXLFNBQVgsRUFBc0IsU0FBdEIsQ0FBUDtBQUNEO0FBQ0QsZ0JBQWMsU0FBZCxFQUF5QjtBQUN2QixXQUFPLEtBQUssS0FBTCxDQUFXLE1BQVgsRUFBbUIsU0FBbkIsQ0FBUDtBQUNEO0FBQ0QsbUJBQWlCLFNBQWpCLEVBQTRCO0FBQzFCLFdBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxFQUFxQixTQUFyQixDQUFQO0FBQ0Q7QUFDRCxlQUFhLFNBQWIsRUFBd0I7QUFDdEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxZQUFYLEVBQXlCLFNBQXpCLENBQVA7QUFDRDtBQUNELGtCQUFnQixTQUFoQixFQUEyQjtBQUN6QixXQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFBcUIsU0FBckIsQ0FBUDtBQUNEO0FBQ0Qsc0JBQW9CLFNBQXBCLEVBQStCO0FBQzdCLFdBQU8sS0FBSyxLQUFMLENBQVcsbUJBQVgsRUFBZ0MsU0FBaEMsQ0FBUDtBQUNEO0FBQ0QsYUFBVyxTQUFYLEVBQXNCO0FBQ3BCLFdBQU8sS0FBSyxLQUFMLENBQVcsVUFBWCxFQUF1QixTQUF2QixDQUFQO0FBQ0Q7QUFDRCxjQUFZLFNBQVosRUFBdUI7QUFDckIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxXQUFYLEVBQXdCLFNBQXhCLENBQVA7QUFDRDtBQUNELFdBQVMsU0FBVCxFQUFvQjtBQUNsQixXQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFBcUIsU0FBckIsQ0FBUDtBQUNEO0FBQ0QsV0FBUyxTQUFULEVBQW9CO0FBQ2xCLFdBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxFQUFxQixTQUFyQixDQUFQO0FBQ0Q7QUFDRCxhQUFXLFNBQVgsRUFBc0I7QUFDcEIsV0FBTyxLQUFLLEtBQUwsQ0FBVyxVQUFYLEVBQXVCLFNBQXZCLENBQVA7QUFDRDtBQUNELG1CQUFpQixTQUFqQixFQUE0QjtBQUMxQixXQUFPLEtBQUssS0FBTCxDQUFXLGdCQUFYLEVBQTZCLFNBQTdCLENBQVA7QUFDRDtBQUNELFFBQU0sU0FBTixFQUFpQjtBQUNmLFdBQU8sS0FBSyxLQUFMLENBQVcsS0FBWCxFQUFrQixTQUFsQixDQUFQO0FBQ0Q7QUFDRCxhQUFXO0FBQ1QsUUFBSSxLQUFLLEtBQUwsQ0FBVyxXQUFYLENBQUosRUFBNkI7QUFDM0IsYUFBTyxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsU0FBUyxNQUFNLFFBQU4sRUFBeEIsRUFBMEMsSUFBMUMsQ0FBK0MsR0FBL0MsQ0FBUDtBQUNEO0FBQ0QsUUFBSSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQUosRUFBMEI7QUFDeEIsYUFBTyxNQUFNLEtBQUssS0FBTCxDQUFXLEdBQXhCO0FBQ0Q7QUFDRCxRQUFJLEtBQUssS0FBTCxDQUFXLFVBQVgsQ0FBSixFQUE0QjtBQUMxQixhQUFPLEtBQUssR0FBTCxFQUFQO0FBQ0Q7QUFDRCxXQUFPLEtBQUssS0FBTCxDQUFXLEtBQWxCO0FBQ0Q7QUExT3lCO2tCQUFQLE07UUE0T0EsSyxHQUFiLFM7UUFDa0IsVSxHQUFsQixjIiwiZmlsZSI6InN5bnRheC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdCwgTWFwfSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcFwiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7VG9rZW5UeXBlLCBUb2tlbkNsYXNzfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IEp1c3RfNzg2ID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfNzg3ID0gTWF5YmUuTm90aGluZztcbmZ1bmN0aW9uIHNpemVEZWNlbmRpbmdfNzg4KGFfNzkxLCBiXzc5Mikge1xuICBpZiAoYV83OTEuc2NvcGVzLnNpemUgPiBiXzc5Mi5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIGlmIChiXzc5Mi5zY29wZXMuc2l6ZSA+IGFfNzkxLnNjb3Blcy5zaXplKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbmxldCBUeXBlc183ODkgPSB7bnVsbDoge21hdGNoOiB0b2tlbl83OTMgPT4gIVR5cGVzXzc4OS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fNzkzKSAmJiB0b2tlbl83OTMudHlwZSA9PT0gVG9rZW5UeXBlLk5VTEwsIGNyZWF0ZTogKHZhbHVlXzc5NCwgc3R4Xzc5NSkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTEwsIHZhbHVlOiBudWxsfSwgc3R4Xzc5NSl9LCBudW1iZXI6IHttYXRjaDogdG9rZW5fNzk2ID0+ICFUeXBlc183ODkuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzc5NikgJiYgdG9rZW5fNzk2LnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuTnVtZXJpY0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzc5Nywgc3R4Xzc5OCkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTUJFUiwgdmFsdWU6IHZhbHVlXzc5N30sIHN0eF83OTgpfSwgc3RyaW5nOiB7bWF0Y2g6IHRva2VuXzc5OSA9PiAhVHlwZXNfNzg5LmRlbGltaXRlci5tYXRjaCh0b2tlbl83OTkpICYmIHRva2VuXzc5OS50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlN0cmluZ0xpdGVyYWwsIGNyZWF0ZTogKHZhbHVlXzgwMCwgc3R4XzgwMSkgPT4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlNUUklORywgc3RyOiB2YWx1ZV84MDB9LCBzdHhfODAxKX0sIHB1bmN0dWF0b3I6IHttYXRjaDogdG9rZW5fODAyID0+ICFUeXBlc183ODkuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgwMikgJiYgdG9rZW5fODAyLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgY3JlYXRlOiAodmFsdWVfODAzLCBzdHhfODA0KSA9PiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgbmFtZTogdmFsdWVfODAzfSwgdmFsdWU6IHZhbHVlXzgwM30sIHN0eF84MDQpfSwga2V5d29yZDoge21hdGNoOiB0b2tlbl84MDUgPT4gIVR5cGVzXzc4OS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODA1KSAmJiB0b2tlbl84MDUudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5LZXl3b3JkLCBjcmVhdGU6ICh2YWx1ZV84MDYsIHN0eF84MDcpID0+IG5ldyBTeW50YXgoe3R5cGU6IHtrbGFzczogVG9rZW5DbGFzcy5LZXl3b3JkLCBuYW1lOiB2YWx1ZV84MDZ9LCB2YWx1ZTogdmFsdWVfODA2fSwgc3R4XzgwNyl9LCBpZGVudGlmaWVyOiB7bWF0Y2g6IHRva2VuXzgwOCA9PiAhVHlwZXNfNzg5LmRlbGltaXRlci5tYXRjaCh0b2tlbl84MDgpICYmIHRva2VuXzgwOC50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLklkZW50LCBjcmVhdGU6ICh2YWx1ZV84MDksIHN0eF84MTApID0+IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLCB2YWx1ZTogdmFsdWVfODA5fSwgc3R4XzgxMCl9LCByZWd1bGFyRXhwcmVzc2lvbjoge21hdGNoOiB0b2tlbl84MTEgPT4gIVR5cGVzXzc4OS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODExKSAmJiB0b2tlbl84MTEudHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5SZWd1bGFyRXhwcmVzc2lvbiwgY3JlYXRlOiAodmFsdWVfODEyLCBzdHhfODEzKSA9PiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkVHRVhQLCB2YWx1ZTogdmFsdWVfODEyfSwgc3R4XzgxMyl9LCBicmFjZXM6IHttYXRjaDogdG9rZW5fODE0ID0+IFR5cGVzXzc4OS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODE0KSAmJiB0b2tlbl84MTQuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0UsIGNyZWF0ZTogKGlubmVyXzgxNSwgc3R4XzgxNikgPT4ge1xuICBsZXQgbGVmdF84MTcgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNFLCB2YWx1ZTogXCJ7XCJ9KTtcbiAgbGV0IHJpZ2h0XzgxOCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0UsIHZhbHVlOiBcIn1cIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODE3KS5jb25jYXQoaW5uZXJfODE1KS5wdXNoKHJpZ2h0XzgxOCksIHN0eF84MTYpO1xufX0sIGJyYWNrZXRzOiB7bWF0Y2g6IHRva2VuXzgxOSA9PiBUeXBlc183ODkuZGVsaW1pdGVyLm1hdGNoKHRva2VuXzgxOSkgJiYgdG9rZW5fODE5LmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNLLCBjcmVhdGU6IChpbm5lcl84MjAsIHN0eF84MjEpID0+IHtcbiAgbGV0IGxlZnRfODIyID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDSywgdmFsdWU6IFwiW1wifSk7XG4gIGxldCByaWdodF84MjMgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkJSQUNLLCB2YWx1ZTogXCJdXCJ9KTtcbiAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0XzgyMikuY29uY2F0KGlubmVyXzgyMCkucHVzaChyaWdodF84MjMpLCBzdHhfODIxKTtcbn19LCBwYXJlbnM6IHttYXRjaDogdG9rZW5fODI0ID0+IFR5cGVzXzc4OS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODI0KSAmJiB0b2tlbl84MjQuZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MUEFSRU4sIGNyZWF0ZTogKGlubmVyXzgyNSwgc3R4XzgyNikgPT4ge1xuICBsZXQgbGVmdF84MjcgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTFBBUkVOLCB2YWx1ZTogXCIoXCJ9KTtcbiAgbGV0IHJpZ2h0XzgyOCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SUEFSRU4sIHZhbHVlOiBcIilcIn0pO1xuICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfODI3KS5jb25jYXQoaW5uZXJfODI1KS5wdXNoKHJpZ2h0XzgyOCksIHN0eF84MjYpO1xufX0sIGFzc2lnbjoge21hdGNoOiB0b2tlbl84MjkgPT4ge1xuICBpZiAoVHlwZXNfNzg5LnB1bmN0dWF0b3IubWF0Y2godG9rZW5fODI5KSkge1xuICAgIHN3aXRjaCAodG9rZW5fODI5LnZhbHVlKSB7XG4gICAgICBjYXNlIFwiPVwiOlxuICAgICAgY2FzZSBcInw9XCI6XG4gICAgICBjYXNlIFwiXj1cIjpcbiAgICAgIGNhc2UgXCImPVwiOlxuICAgICAgY2FzZSBcIjw8PVwiOlxuICAgICAgY2FzZSBcIj4+PVwiOlxuICAgICAgY2FzZSBcIj4+Pj1cIjpcbiAgICAgIGNhc2UgXCIrPVwiOlxuICAgICAgY2FzZSBcIi09XCI6XG4gICAgICBjYXNlIFwiKj1cIjpcbiAgICAgIGNhc2UgXCIvPVwiOlxuICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59fSwgYm9vbGVhbjoge21hdGNoOiB0b2tlbl84MzAgPT4gIVR5cGVzXzc4OS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODMwKSAmJiB0b2tlbl84MzAudHlwZSA9PT0gVG9rZW5UeXBlLlRSVUUgfHwgdG9rZW5fODMwLnR5cGUgPT09IFRva2VuVHlwZS5GQUxTRX0sIHRlbXBsYXRlOiB7bWF0Y2g6IHRva2VuXzgzMSA9PiAhVHlwZXNfNzg5LmRlbGltaXRlci5tYXRjaCh0b2tlbl84MzEpICYmIHRva2VuXzgzMS50eXBlID09PSBUb2tlblR5cGUuVEVNUExBVEV9LCBkZWxpbWl0ZXI6IHttYXRjaDogdG9rZW5fODMyID0+IExpc3QuaXNMaXN0KHRva2VuXzgzMil9LCBzeW50YXhUZW1wbGF0ZToge21hdGNoOiB0b2tlbl84MzMgPT4gVHlwZXNfNzg5LmRlbGltaXRlci5tYXRjaCh0b2tlbl84MzMpICYmIHRva2VuXzgzMy5nZXQoMCkudmFsKCkgPT09IFwiI2BcIn0sIGVvZjoge21hdGNoOiB0b2tlbl84MzQgPT4gIVR5cGVzXzc4OS5kZWxpbWl0ZXIubWF0Y2godG9rZW5fODM0KSAmJiB0b2tlbl84MzQudHlwZSA9PT0gVG9rZW5UeXBlLkVPU319O1xuO1xuY29uc3QgQUxMX1BIQVNFU183OTAgPSB7fTtcbjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bnRheCB7XG4gIGNvbnN0cnVjdG9yKHRva2VuXzgzNSwgb2xkc3R4XzgzNiA9IHt9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuXzgzNTtcbiAgICB0aGlzLmJpbmRpbmdzID0gb2xkc3R4XzgzNi5iaW5kaW5ncyAhPSBudWxsID8gb2xkc3R4XzgzNi5iaW5kaW5ncyA6IG5ldyBCaW5kaW5nTWFwO1xuICAgIHRoaXMuc2NvcGVzZXRzID0gb2xkc3R4XzgzNi5zY29wZXNldHMgIT0gbnVsbCA/IG9sZHN0eF84MzYuc2NvcGVzZXRzIDoge2FsbDogTGlzdCgpLCBwaGFzZTogTWFwKCl9O1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgc3RhdGljIG9mKHRva2VuXzgzNywgc3R4XzgzOCA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fODM3LCBzdHhfODM4KTtcbiAgfVxuICBzdGF0aWMgZnJvbSh0eXBlXzgzOSwgdmFsdWVfODQwLCBzdHhfODQxID0ge30pIHtcbiAgICBpZiAoIVR5cGVzXzc4OVt0eXBlXzgzOV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzgzOSArIFwiIGlzIG5vdCBhIHZhbGlkIHR5cGVcIik7XG4gICAgfSBlbHNlIGlmICghVHlwZXNfNzg5W3R5cGVfODM5XS5jcmVhdGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgYSBzeW50YXggZnJvbSB0eXBlIFwiICsgdHlwZV84MzkpO1xuICAgIH1cbiAgICByZXR1cm4gVHlwZXNfNzg5W3R5cGVfODM5XS5jcmVhdGUodmFsdWVfODQwLCBzdHhfODQxKTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bGwoc3R4Xzg0MiA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwibnVsbFwiLCBudWxsLCBzdHhfODQyKTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bWJlcih2YWx1ZV84NDMsIHN0eF84NDQgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcIm51bWJlclwiLCB2YWx1ZV84NDMsIHN0eF84NDQpO1xuICB9XG4gIHN0YXRpYyBmcm9tU3RyaW5nKHZhbHVlXzg0NSwgc3R4Xzg0NiA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwic3RyaW5nXCIsIHZhbHVlXzg0NSwgc3R4Xzg0Nik7XG4gIH1cbiAgc3RhdGljIGZyb21QdW5jdHVhdG9yKHZhbHVlXzg0Nywgc3R4Xzg0OCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwicHVuY3R1YXRvclwiLCB2YWx1ZV84NDcsIHN0eF84NDgpO1xuICB9XG4gIHN0YXRpYyBmcm9tS2V5d29yZCh2YWx1ZV84NDksIHN0eF84NTAgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcImtleXdvcmRcIiwgdmFsdWVfODQ5LCBzdHhfODUwKTtcbiAgfVxuICBzdGF0aWMgZnJvbUlkZW50aWZpZXIodmFsdWVfODUxLCBzdHhfODUyID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJpZGVudGlmaWVyXCIsIHZhbHVlXzg1MSwgc3R4Xzg1Mik7XG4gIH1cbiAgc3RhdGljIGZyb21SZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV84NTMsIHN0eF84NTQgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInJlZ3VsYXJFeHByZXNzaW9uXCIsIHZhbHVlXzg1Mywgc3R4Xzg1NCk7XG4gIH1cbiAgc3RhdGljIGZyb21CcmFjZXMoaW5uZXJfODU1LCBzdHhfODU2ID0ge30pIHtcbiAgICByZXR1cm4gU3ludGF4LmZyb20oXCJicmFjZXNcIiwgaW5uZXJfODU1LCBzdHhfODU2KTtcbiAgfVxuICBzdGF0aWMgZnJvbUJyYWNrZXRzKGlubmVyXzg1Nywgc3R4Xzg1OCA9IHt9KSB7XG4gICAgcmV0dXJuIFN5bnRheC5mcm9tKFwiYnJhY2tldHNcIiwgaW5uZXJfODU3LCBzdHhfODU4KTtcbiAgfVxuICBzdGF0aWMgZnJvbVBhcmVucyhpbm5lcl84NTksIHN0eF84NjAgPSB7fSkge1xuICAgIHJldHVybiBTeW50YXguZnJvbShcInBhcmVuc1wiLCBpbm5lcl84NTksIHN0eF84NjApO1xuICB9XG4gIHJlc29sdmUocGhhc2VfODYxKSB7XG4gICAgYXNzZXJ0KHBoYXNlXzg2MSAhPSBudWxsLCBcIm11c3QgcHJvdmlkZSBhIHBoYXNlIHRvIHJlc29sdmVcIik7XG4gICAgbGV0IGFsbFNjb3Blc184NjIgPSB0aGlzLnNjb3Blc2V0cy5hbGw7XG4gICAgbGV0IHN0eFNjb3Blc184NjMgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfODYxKSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV84NjEpIDogTGlzdCgpO1xuICAgIHN0eFNjb3Blc184NjMgPSBhbGxTY29wZXNfODYyLmNvbmNhdChzdHhTY29wZXNfODYzKTtcbiAgICBpZiAoc3R4U2NvcGVzXzg2My5zaXplID09PSAwIHx8ICEodGhpcy5tYXRjaChcImlkZW50aWZpZXJcIikgfHwgdGhpcy5tYXRjaChcImtleXdvcmRcIikpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgICB9XG4gICAgbGV0IHNjb3BlXzg2NCA9IHN0eFNjb3Blc184NjMubGFzdCgpO1xuICAgIGxldCBiaW5kaW5nc184NjUgPSB0aGlzLmJpbmRpbmdzO1xuICAgIGlmIChzY29wZV84NjQpIHtcbiAgICAgIGxldCBzY29wZXNldEJpbmRpbmdMaXN0ID0gYmluZGluZ3NfODY1LmdldCh0aGlzKTtcbiAgICAgIGlmIChzY29wZXNldEJpbmRpbmdMaXN0KSB7XG4gICAgICAgIGxldCBiaWdnZXN0QmluZGluZ1BhaXIgPSBzY29wZXNldEJpbmRpbmdMaXN0LmZpbHRlcigoe3Njb3BlcywgYmluZGluZ30pID0+IHtcbiAgICAgICAgICByZXR1cm4gc2NvcGVzLmlzU3Vic2V0KHN0eFNjb3Blc184NjMpO1xuICAgICAgICB9KS5zb3J0KHNpemVEZWNlbmRpbmdfNzg4KTtcbiAgICAgICAgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplID49IDIgJiYgYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5zY29wZXMuc2l6ZSA9PT0gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgxKS5zY29wZXMuc2l6ZSkge1xuICAgICAgICAgIGxldCBkZWJ1Z0Jhc2UgPSBcIntcIiArIHN0eFNjb3Blc184NjMubWFwKHNfODY2ID0+IHNfODY2LnRvU3RyaW5nKCkpLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuICAgICAgICAgIGxldCBkZWJ1Z0FtYmlnb3VzU2NvcGVzZXRzID0gYmlnZ2VzdEJpbmRpbmdQYWlyLm1hcCgoe3Njb3Blc30pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBcIntcIiArIHNjb3Blcy5tYXAoc184NjcgPT4gc184NjcudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgfSkuam9pbihcIiwgXCIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjb3Blc2V0IFwiICsgZGVidWdCYXNlICsgXCIgaGFzIGFtYmlndW91cyBzdWJzZXRzIFwiICsgZGVidWdBbWJpZ291c1Njb3Blc2V0cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmlnZ2VzdEJpbmRpbmdQYWlyLnNpemUgIT09IDApIHtcbiAgICAgICAgICBsZXQgYmluZGluZ1N0ciA9IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYmluZGluZy50b1N0cmluZygpO1xuICAgICAgICAgIGlmIChNYXliZS5pc0p1c3QoYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcykpIHtcbiAgICAgICAgICAgIHJldHVybiBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzLmdldE9yRWxzZShudWxsKS5yZXNvbHZlKHBoYXNlXzg2MSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiaW5kaW5nU3RyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIHZhbCgpIHtcbiAgICBhc3NlcnQoIXRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2Fubm90IGdldCB0aGUgdmFsIG9mIGEgZGVsaW1pdGVyXCIpO1xuICAgIGlmICh0aGlzLm1hdGNoKFwic3RyaW5nXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zdHI7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLml0ZW1zLm1hcChlbF84NjggPT4ge1xuICAgICAgICBpZiAoZWxfODY4IGluc3RhbmNlb2YgU3ludGF4ICYmIGVsXzg2OC5tYXRjaChcImRlbGltaXRlclwiKSkge1xuICAgICAgICAgIHJldHVybiBcIiR7Li4ufVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbF84Njguc2xpY2UudGV4dDtcbiAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIGxpbmVOdW1iZXIoKSB7XG4gICAgaWYgKCF0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZS5zdGFydExvY2F0aW9uLmxpbmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLmdldCgwKS5saW5lTnVtYmVyKCk7XG4gICAgfVxuICB9XG4gIHNldExpbmVOdW1iZXIobGluZV84NjkpIHtcbiAgICBsZXQgbmV3VG9rXzg3MCA9IHt9O1xuICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIG5ld1Rva184NzAgPSB0aGlzLnRva2VuLm1hcChzXzg3MSA9PiBzXzg3MS5zZXRMaW5lTnVtYmVyKGxpbmVfODY5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLnRva2VuKSkge1xuICAgICAgICBuZXdUb2tfODcwW2tleV0gPSB0aGlzLnRva2VuW2tleV07XG4gICAgICB9XG4gICAgICBhc3NlcnQobmV3VG9rXzg3MC5zbGljZSAmJiBuZXdUb2tfODcwLnNsaWNlLnN0YXJ0TG9jYXRpb24sIFwiYWxsIHRva2VucyBtdXN0IGhhdmUgbGluZSBpbmZvXCIpO1xuICAgICAgbmV3VG9rXzg3MC5zbGljZS5zdGFydExvY2F0aW9uLmxpbmUgPSBsaW5lXzg2OTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTeW50YXgobmV3VG9rXzg3MCwgdGhpcyk7XG4gIH1cbiAgaW5uZXIoKSB7XG4gICAgYXNzZXJ0KHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIiksIFwiY2FuIG9ubHkgZ2V0IHRoZSBpbm5lciBvZiBhIGRlbGltaXRlclwiKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZSgxLCB0aGlzLnRva2VuLnNpemUgLSAxKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV84NzIsIGJpbmRpbmdzXzg3MywgcGhhc2VfODc0LCBvcHRpb25zXzg3NSA9IHtmbGlwOiBmYWxzZX0pIHtcbiAgICBsZXQgdG9rZW5fODc2ID0gdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSA/IHRoaXMudG9rZW4ubWFwKHNfODgwID0+IHNfODgwLmFkZFNjb3BlKHNjb3BlXzg3MiwgYmluZGluZ3NfODczLCBwaGFzZV84NzQsIG9wdGlvbnNfODc1KSkgOiB0aGlzLnRva2VuO1xuICAgIGlmICh0aGlzLm1hdGNoKFwidGVtcGxhdGVcIikpIHtcbiAgICAgIHRva2VuXzg3NiA9IHt0eXBlOiB0aGlzLnRva2VuLnR5cGUsIGl0ZW1zOiB0b2tlbl84NzYuaXRlbXMubWFwKGl0Xzg4MSA9PiB7XG4gICAgICAgIGlmIChpdF84ODEgaW5zdGFuY2VvZiBTeW50YXggJiYgaXRfODgxLm1hdGNoKFwiZGVsaW1pdGVyXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGl0Xzg4MS5hZGRTY29wZShzY29wZV84NzIsIGJpbmRpbmdzXzg3MywgcGhhc2VfODc0LCBvcHRpb25zXzg3NSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0Xzg4MTtcbiAgICAgIH0pfTtcbiAgICB9XG4gICAgbGV0IG9sZFNjb3Blc2V0Xzg3NztcbiAgICBpZiAocGhhc2VfODc0ID09PSBBTExfUEhBU0VTXzc5MCkge1xuICAgICAgb2xkU2NvcGVzZXRfODc3ID0gdGhpcy5zY29wZXNldHMuYWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbGRTY29wZXNldF84NzcgPSB0aGlzLnNjb3Blc2V0cy5waGFzZS5oYXMocGhhc2VfODc0KSA/IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmdldChwaGFzZV84NzQpIDogTGlzdCgpO1xuICAgIH1cbiAgICBsZXQgbmV3U2NvcGVzZXRfODc4O1xuICAgIGlmIChvcHRpb25zXzg3NS5mbGlwKSB7XG4gICAgICBsZXQgaW5kZXggPSBvbGRTY29wZXNldF84NzcuaW5kZXhPZihzY29wZV84NzIpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBuZXdTY29wZXNldF84NzggPSBvbGRTY29wZXNldF84NzcucmVtb3ZlKGluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Njb3Blc2V0Xzg3OCA9IG9sZFNjb3Blc2V0Xzg3Ny5wdXNoKHNjb3BlXzg3Mik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1Njb3Blc2V0Xzg3OCA9IG9sZFNjb3Blc2V0Xzg3Ny5wdXNoKHNjb3BlXzg3Mik7XG4gICAgfVxuICAgIGxldCBuZXdzdHhfODc5ID0ge2JpbmRpbmdzOiBiaW5kaW5nc184NzMsIHNjb3Blc2V0czoge2FsbDogdGhpcy5zY29wZXNldHMuYWxsLCBwaGFzZTogdGhpcy5zY29wZXNldHMucGhhc2V9fTtcbiAgICBpZiAocGhhc2VfODc0ID09PSBBTExfUEhBU0VTXzc5MCkge1xuICAgICAgbmV3c3R4Xzg3OS5zY29wZXNldHMuYWxsID0gbmV3U2NvcGVzZXRfODc4O1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdzdHhfODc5LnNjb3Blc2V0cy5waGFzZSA9IG5ld3N0eF84Nzkuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZV84NzQsIG5ld1Njb3Blc2V0Xzg3OCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzg3NiwgbmV3c3R4Xzg3OSk7XG4gIH1cbiAgcmVtb3ZlU2NvcGUoc2NvcGVfODgyLCBwaGFzZV84ODMpIHtcbiAgICBsZXQgdG9rZW5fODg0ID0gdGhpcy5tYXRjaChcImRlbGltaXRlclwiKSA/IHRoaXMudG9rZW4ubWFwKHNfODkwID0+IHNfODkwLnJlbW92ZVNjb3BlKHNjb3BlXzg4MiwgcGhhc2VfODgzKSkgOiB0aGlzLnRva2VuO1xuICAgIGxldCBwaGFzZVNjb3Blc2V0Xzg4NSA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLmhhcyhwaGFzZV84ODMpID8gdGhpcy5zY29wZXNldHMucGhhc2UuZ2V0KHBoYXNlXzg4MykgOiBMaXN0KCk7XG4gICAgbGV0IGFsbFNjb3Blc2V0Xzg4NiA9IHRoaXMuc2NvcGVzZXRzLmFsbDtcbiAgICBsZXQgbmV3c3R4Xzg4NyA9IHtiaW5kaW5nczogdGhpcy5iaW5kaW5ncywgc2NvcGVzZXRzOiB7YWxsOiB0aGlzLnNjb3Blc2V0cy5hbGwsIHBoYXNlOiB0aGlzLnNjb3Blc2V0cy5waGFzZX19O1xuICAgIGxldCBwaGFzZUluZGV4Xzg4OCA9IHBoYXNlU2NvcGVzZXRfODg1LmluZGV4T2Yoc2NvcGVfODgyKTtcbiAgICBsZXQgYWxsSW5kZXhfODg5ID0gYWxsU2NvcGVzZXRfODg2LmluZGV4T2Yoc2NvcGVfODgyKTtcbiAgICBpZiAocGhhc2VJbmRleF84ODggIT09IC0xKSB7XG4gICAgICBuZXdzdHhfODg3LnNjb3Blc2V0cy5waGFzZSA9IHRoaXMuc2NvcGVzZXRzLnBoYXNlLnNldChwaGFzZV84ODMsIHBoYXNlU2NvcGVzZXRfODg1LnJlbW92ZShwaGFzZUluZGV4Xzg4OCkpO1xuICAgIH0gZWxzZSBpZiAoYWxsSW5kZXhfODg5ICE9PSAtMSkge1xuICAgICAgbmV3c3R4Xzg4Ny5zY29wZXNldHMuYWxsID0gYWxsU2NvcGVzZXRfODg2LnJlbW92ZShhbGxJbmRleF84ODkpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl84ODQsIG5ld3N0eF84ODcpO1xuICB9XG4gIG1hdGNoKHR5cGVfODkxLCB2YWx1ZV84OTIpIHtcbiAgICBpZiAoIVR5cGVzXzc4OVt0eXBlXzg5MV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlXzg5MSArIFwiIGlzIGFuIGludmFsaWQgdHlwZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIFR5cGVzXzc4OVt0eXBlXzg5MV0ubWF0Y2godGhpcy50b2tlbikgJiYgKHZhbHVlXzg5MiA9PSBudWxsIHx8ICh2YWx1ZV84OTIgaW5zdGFuY2VvZiBSZWdFeHAgPyB2YWx1ZV84OTIudGVzdCh0aGlzLnZhbCgpKSA6IHRoaXMudmFsKCkgPT0gdmFsdWVfODkyKSk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHZhbHVlXzg5Mykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiaWRlbnRpZmllclwiLCB2YWx1ZV84OTMpO1xuICB9XG4gIGlzQXNzaWduKHZhbHVlXzg5NCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiYXNzaWduXCIsIHZhbHVlXzg5NCk7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh2YWx1ZV84OTUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJvb2xlYW5cIiwgdmFsdWVfODk1KTtcbiAgfVxuICBpc0tleXdvcmQodmFsdWVfODk2KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJrZXl3b3JkXCIsIHZhbHVlXzg5Nik7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh2YWx1ZV84OTcpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcIm51bGxcIiwgdmFsdWVfODk3KTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHZhbHVlXzg5OCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwibnVtYmVyXCIsIHZhbHVlXzg5OCk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHZhbHVlXzg5OSkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwicHVuY3R1YXRvclwiLCB2YWx1ZV84OTkpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh2YWx1ZV85MDApIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcInN0cmluZ1wiLCB2YWx1ZV85MDApO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odmFsdWVfOTAxKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWx1ZV85MDEpO1xuICB9XG4gIGlzVGVtcGxhdGUodmFsdWVfOTAyKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJ0ZW1wbGF0ZVwiLCB2YWx1ZV85MDIpO1xuICB9XG4gIGlzRGVsaW1pdGVyKHZhbHVlXzkwMykge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZGVsaW1pdGVyXCIsIHZhbHVlXzkwMyk7XG4gIH1cbiAgaXNQYXJlbnModmFsdWVfOTA0KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJwYXJlbnNcIiwgdmFsdWVfOTA0KTtcbiAgfVxuICBpc0JyYWNlcyh2YWx1ZV85MDUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaChcImJyYWNlc1wiLCB2YWx1ZV85MDUpO1xuICB9XG4gIGlzQnJhY2tldHModmFsdWVfOTA2KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJicmFja2V0c1wiLCB2YWx1ZV85MDYpO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUodmFsdWVfOTA3KSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2goXCJzeW50YXhUZW1wbGF0ZVwiLCB2YWx1ZV85MDcpO1xuICB9XG4gIGlzRU9GKHZhbHVlXzkwOCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoKFwiZW9mXCIsIHZhbHVlXzkwOCk7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMubWF0Y2goXCJkZWxpbWl0ZXJcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLm1hcChzXzkwOSA9PiBzXzkwOS50b1N0cmluZygpKS5qb2luKFwiIFwiKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJzdHJpbmdcIikpIHtcbiAgICAgIHJldHVybiBcIidcIiArIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcInRlbXBsYXRlXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbn1cbmV4cG9ydCB7VHlwZXNfNzg5IGFzIFR5cGVzfTtcbmV4cG9ydCB7QUxMX1BIQVNFU183OTAgYXMgQUxMX1BIQVNFU30iXX0=