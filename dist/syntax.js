"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Just_645 = _ramdaFantasy.Maybe.Just;
var Nothing_646 = _ramdaFantasy.Maybe.Nothing;

function sizeDecending_647(a_648, b_649) {
  if (a_648.scopes.size > b_649.scopes.size) {
    return -1;
  } else if (b_649.scopes.size > a_648.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}

var Syntax = (function () {
  function Syntax(token_650) {
    var context_651 = arguments.length <= 1 || arguments[1] === undefined ? { bindings: new _bindingMap2.default(), scopeset: (0, _immutable.List)() } : arguments[1];

    _classCallCheck(this, Syntax);

    this.token = token_650;
    this.context = { bindings: context_651.bindings, scopeset: context_651.scopeset };
    Object.freeze(this.context);
    Object.freeze(this);
  }

  _createClass(Syntax, [{
    key: "resolve",
    value: function resolve() {
      if (this.context.scopeset.size === 0 || !(this.isIdentifier() || this.isKeyword())) {
        return this.token.value;
      }
      var scope_679 = this.context.scopeset.last();
      var stxScopes_680 = this.context.scopeset;
      var bindings_681 = this.context.bindings;
      if (scope_679) {
        var scopesetBindingList = bindings_681.get(this);
        if (scopesetBindingList) {
          var biggestBindingPair = scopesetBindingList.filter(function (_ref) {
            var scopes = _ref.scopes;
            var binding = _ref.binding;

            return scopes.isSubset(stxScopes_680);
          }).sort(sizeDecending_647);
          if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
            var debugBase = "{" + stxScopes_680.map(function (s_682) {
              return s_682.toString();
            }).join(", ") + "}";
            var debugAmbigousScopesets = biggestBindingPair.map(function (_ref2) {
              var scopes = _ref2.scopes;

              return "{" + scopes.map(function (s_683) {
                return s_683.toString();
              }).join(", ") + "}";
            }).join(", ");
            throw new Error("Scopeset " + debugBase + " has ambiguous subsets " + debugAmbigousScopesets);
          } else if (biggestBindingPair.size !== 0) {
            var bindingStr = biggestBindingPair.get(0).binding.toString();
            if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
              return biggestBindingPair.get(0).alias.getOrElse(null).resolve();
            }
            return bindingStr;
          }
        }
      }
      return this.token.value;
    }
  }, {
    key: "val",
    value: function val() {
      (0, _errors.assert)(!this.isDelimiter(), "cannot get the val of a delimiter");
      if (this.isStringLiteral()) {
        return this.token.str;
      }
      if (this.isTemplate()) {
        return this.token.items.map(function (el_684) {
          if (el_684 instanceof Syntax && el_684.isDelimiter()) {
            return "${...}";
          }
          return el_684.slice.text;
        }).join("");
      }
      return this.token.value;
    }
  }, {
    key: "lineNumber",
    value: function lineNumber() {
      if (!this.isDelimiter()) {
        return this.token.slice.startLocation.line;
      } else {
        return this.token.get(0).lineNumber();
      }
    }
  }, {
    key: "setLineNumber",
    value: function setLineNumber(line_685) {
      var newTok_686 = {};
      if (this.isDelimiter()) {
        newTok_686 = this.token.map(function (s_687) {
          return s_687.setLineNumber(line_685);
        });
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(this.token)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            newTok_686[key] = this.token[key];
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        (0, _errors.assert)(newTok_686.slice && newTok_686.slice.startLocation, "all tokens must have line info");
        newTok_686.slice.startLocation.line = line_685;
      }
      return new Syntax(newTok_686, this.context);
    }
  }, {
    key: "inner",
    value: function inner() {
      (0, _errors.assert)(this.isDelimiter(), "can only get the inner of a delimiter");
      return this.token.slice(1, this.token.size - 1);
    }
  }, {
    key: "addScope",
    value: function addScope(scope_688, bindings_689) {
      var options_690 = arguments.length <= 2 || arguments[2] === undefined ? { flip: false } : arguments[2];

      var token_691 = this.isDelimiter() ? this.token.map(function (s_693) {
        return s_693.addScope(scope_688, bindings_689, options_690);
      }) : this.token;
      if (this.isTemplate()) {
        token_691 = { type: this.token.type, items: token_691.items.map(function (it_694) {
            if (it_694 instanceof Syntax && it_694.isDelimiter()) {
              return it_694.addScope(scope_688, bindings_689, options_690);
            }
            return it_694;
          }) };
      }
      var newScopeset_692 = undefined;
      if (options_690.flip) {
        var index = this.context.scopeset.indexOf(scope_688);
        if (index !== -1) {
          newScopeset_692 = this.context.scopeset.remove(index);
        } else {
          newScopeset_692 = this.context.scopeset.push(scope_688);
        }
      } else {
        newScopeset_692 = this.context.scopeset.push(scope_688);
      }
      return new Syntax(token_691, { bindings: bindings_689, scopeset: newScopeset_692 });
    }
  }, {
    key: "removeScope",
    value: function removeScope(scope_695) {
      var token_696 = this.isDelimiter() ? this.token.map(function (s_699) {
        return s_699.removeScope(scope_695);
      }) : this.token;
      var newScopeset_697 = this.context.scopeset;
      var index_698 = this.context.scopeset.indexOf(scope_695);
      if (index_698 !== -1) {
        newScopeset_697 = this.context.scopeset.remove(index_698);
      }
      return new Syntax(token_696, { bindings: this.context.bindings, scopeset: newScopeset_697 });
    }
  }, {
    key: "isIdentifier",
    value: function isIdentifier() {
      return !this.isDelimiter() && this.token.type.klass === _tokenizer.TokenClass.Ident;
    }
  }, {
    key: "isAssign",
    value: function isAssign() {
      return !this.isDelimiter() && this.token.type === _tokenizer.TokenType.ASSIGN;
    }
  }, {
    key: "isBooleanLiteral",
    value: function isBooleanLiteral() {
      return !this.isDelimiter() && this.token.type === _tokenizer.TokenType.TRUE || this.token.type === _tokenizer.TokenType.FALSE;
    }
  }, {
    key: "isKeyword",
    value: function isKeyword() {
      return !this.isDelimiter() && this.token.type.klass === _tokenizer.TokenClass.Keyword;
    }
  }, {
    key: "isNullLiteral",
    value: function isNullLiteral() {
      return !this.isDelimiter() && this.token.type === _tokenizer.TokenType.NULL;
    }
  }, {
    key: "isNumericLiteral",
    value: function isNumericLiteral() {
      return !this.isDelimiter() && this.token.type.klass === _tokenizer.TokenClass.NumericLiteral;
    }
  }, {
    key: "isPunctuator",
    value: function isPunctuator() {
      return !this.isDelimiter() && this.token.type.klass === _tokenizer.TokenClass.Punctuator;
    }
  }, {
    key: "isStringLiteral",
    value: function isStringLiteral() {
      return !this.isDelimiter() && this.token.type.klass === _tokenizer.TokenClass.StringLiteral;
    }
  }, {
    key: "isRegularExpression",
    value: function isRegularExpression() {
      return !this.isDelimiter() && this.token.type.klass === _tokenizer.TokenClass.RegularExpression;
    }
  }, {
    key: "isTemplate",
    value: function isTemplate() {
      return !this.isDelimiter() && this.token.type === _tokenizer.TokenType.TEMPLATE;
    }
  }, {
    key: "isDelimiter",
    value: function isDelimiter() {
      return _immutable.List.isList(this.token);
    }
  }, {
    key: "isParens",
    value: function isParens() {
      return this.isDelimiter() && this.token.get(0).token.type === _tokenizer.TokenType.LPAREN;
    }
  }, {
    key: "isBraces",
    value: function isBraces() {
      return this.isDelimiter() && this.token.get(0).token.type === _tokenizer.TokenType.LBRACE;
    }
  }, {
    key: "isBrackets",
    value: function isBrackets() {
      return this.isDelimiter() && this.token.get(0).token.type === _tokenizer.TokenType.LBRACK;
    }
  }, {
    key: "isSyntaxTemplate",
    value: function isSyntaxTemplate() {
      return this.isDelimiter() && this.token.get(0).val() === "#`";
    }
  }, {
    key: "isEOF",
    value: function isEOF() {
      return !this.isDelimiter() && this.token.type === _tokenizer.TokenType.EOS;
    }
  }, {
    key: "toString",
    value: function toString() {
      if (this.isDelimiter()) {
        return this.token.map(function (s_700) {
          return s_700.toString();
        }).join(" ");
      }
      if (this.isStringLiteral()) {
        return "'" + this.token.str;
      }
      if (this.isTemplate()) {
        return this.val();
      }
      return this.token.value;
    }
  }], [{
    key: "of",
    value: function of(token_652) {
      var stx_653 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax(token_652, stx_653.context);
    }
  }, {
    key: "fromNull",
    value: function fromNull() {
      var stx_654 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_654.context);
    }
  }, {
    key: "fromNumber",
    value: function fromNumber(value_655) {
      var stx_656 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_655 }, stx_656.context);
    }
  }, {
    key: "fromString",
    value: function fromString(value_657) {
      var stx_658 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: _tokenizer.TokenType.STRING, str: value_657 }, stx_658.context);
    }
  }, {
    key: "fromPunctuator",
    value: function fromPunctuator(value_659) {
      var stx_660 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_659 }, value: value_659 }, stx_660.context);
    }
  }, {
    key: "fromKeyword",
    value: function fromKeyword(value_661) {
      var stx_662 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_661 }, value: value_661 }, stx_662.context);
    }
  }, {
    key: "fromIdentifier",
    value: function fromIdentifier(value_663) {
      var stx_664 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_663 }, stx_664.context);
    }
  }, {
    key: "fromRegularExpression",
    value: function fromRegularExpression(value_665) {
      var stx_666 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_665 }, stx_666.context);
    }
  }, {
    key: "fromBraces",
    value: function fromBraces(inner_667) {
      var stx_668 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left_669 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });
      var right_670 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });
      return new Syntax(_immutable.List.of(left_669).concat(inner_667).push(right_670), stx_668.context);
    }
  }, {
    key: "fromBrackets",
    value: function fromBrackets(inner_671) {
      var stx_672 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left_673 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });
      var right_674 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });
      return new Syntax(_immutable.List.of(left_673).concat(inner_671).push(right_674), stx_672.context);
    }
  }, {
    key: "fromParens",
    value: function fromParens(inner_675) {
      var stx_676 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left_677 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });
      var right_678 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });
      return new Syntax(_immutable.List.of(left_677).concat(inner_675).push(right_678), stx_676.context);
    }
  }]);

  return Syntax;
})();

exports.default = Syntax;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N5bnRheC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUlhLENBQUM7Ozs7Ozs7Ozs7QUFDZCxJQUFNLFFBQVEsR0FBRyxvQkFBTSxJQUFJLENBQUM7QUFDNUIsSUFBTSxXQUFXLEdBQUcsb0JBQU0sT0FBTyxDQUFDOztBQUVsQyxTQUFTLGlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDdkMsTUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtBQUN6QyxXQUFPLENBQUMsQ0FBQyxDQUFDO0dBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ2hELFdBQU8sQ0FBQyxDQUFDO0dBQ1YsTUFBTTtBQUNMLFdBQU8sQ0FBQyxDQUFDO0dBQ1Y7Q0FDRjs7SUFDb0IsTUFBTTtBQUN6QixXQURtQixNQUFNLENBQ2IsU0FBUyxFQUE4RDtRQUE1RCxXQUFXLHlEQUFHLEVBQUMsUUFBUSxFQUFFLDBCQUFjLEVBQUUsUUFBUSxFQUFFLHNCQUFNLEVBQUM7OzBCQUQ5RCxNQUFNOztBQUV2QixRQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztBQUN2QixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUMsQ0FBQztBQUNoRixVQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1QixVQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3JCOztlQU5rQixNQUFNOzs4QkE4Q2Y7QUFDUixVQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBLEFBQUMsRUFBRTtBQUNsRixlQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO09BQ3pCO0FBQ0QsVUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0MsVUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDMUMsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDekMsVUFBSSxTQUFTLEVBQUU7QUFDYixZQUFJLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsWUFBSSxtQkFBbUIsRUFBRTtBQUN2QixjQUFJLGtCQUFrQixHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxnQkFBdUI7Z0JBQXJCLE1BQU0sUUFBTixNQUFNO2dCQUFFLE9BQU8sUUFBUCxPQUFPOztBQUNuRSxtQkFBTyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1dBQ3ZDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMzQixjQUFJLGtCQUFrQixDQUFDLElBQUksSUFBSSxDQUFDLElBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDbkgsZ0JBQUksU0FBUyxHQUFHLEdBQUcsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztxQkFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO2FBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDcEYsZ0JBQUksc0JBQXNCLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGlCQUFjO2tCQUFaLE1BQU0sU0FBTixNQUFNOztBQUMxRCxxQkFBTyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7dUJBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtlQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO2FBQ3JFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZCxrQkFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLEdBQUcsU0FBUyxHQUFHLHlCQUF5QixHQUFHLHNCQUFzQixDQUFDLENBQUM7V0FDL0YsTUFBTSxJQUFJLGtCQUFrQixDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7QUFDeEMsZ0JBQUksVUFBVSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDOUQsZ0JBQUksb0JBQU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNqRCxxQkFBTyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNsRTtBQUNELG1CQUFPLFVBQVUsQ0FBQztXQUNuQjtTQUNGO09BQ0Y7QUFDRCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ3pCOzs7MEJBQ0s7QUFDSiwwQkFBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO0FBQ2pFLFVBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO0FBQzFCLGVBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7T0FDdkI7QUFDRCxVQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUNyQixlQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUNwQyxjQUFJLE1BQU0sWUFBWSxNQUFNLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO0FBQ3BELG1CQUFPLFFBQVEsQ0FBQztXQUNqQjtBQUNELGlCQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1NBQzFCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDYjtBQUNELGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDekI7OztpQ0FDWTtBQUNYLFVBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7QUFDdkIsZUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO09BQzVDLE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO09BQ3ZDO0tBQ0Y7OztrQ0FDYSxRQUFRLEVBQUU7QUFDdEIsVUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFVBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO0FBQ3RCLGtCQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2lCQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1NBQUEsQ0FBQyxDQUFDO09BQ3JFLE1BQU07Ozs7OztBQUNMLCtCQUFnQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsOEhBQUU7Z0JBQWhDLEdBQUc7O0FBQ1Ysc0JBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1dBQ25DOzs7Ozs7Ozs7Ozs7Ozs7O0FBQ0QsNEJBQU8sVUFBVSxDQUFDLEtBQUssSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQzdGLGtCQUFVLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO09BQ2hEO0FBQ0QsYUFBTyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzdDOzs7NEJBQ087QUFDTiwwQkFBTyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztBQUNwRSxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNqRDs7OzZCQUNRLFNBQVMsRUFBRSxZQUFZLEVBQStCO1VBQTdCLFdBQVcseURBQUcsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDOztBQUMzRCxVQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2VBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQztPQUFBLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ2hJLFVBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ3JCLGlCQUFTLEdBQUcsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ3ZFLGdCQUFJLE1BQU0sWUFBWSxNQUFNLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO0FBQ3BELHFCQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQzthQUM5RDtBQUNELG1CQUFPLE1BQU0sQ0FBQztXQUNmLENBQUMsRUFBQyxDQUFDO09BQ0w7QUFDRCxVQUFJLGVBQWUsWUFBQSxDQUFDO0FBQ3BCLFVBQUksV0FBVyxDQUFDLElBQUksRUFBRTtBQUNwQixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckQsWUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDaEIseUJBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdkQsTUFBTTtBQUNMLHlCQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3pEO09BQ0YsTUFBTTtBQUNMLHVCQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ3pEO0FBQ0QsYUFBTyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUMsQ0FBQyxDQUFDO0tBQ25GOzs7Z0NBQ1csU0FBUyxFQUFFO0FBQ3JCLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7ZUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztPQUFBLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3hHLFVBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzVDLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN6RCxVQUFJLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNwQix1QkFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUMzRDtBQUNELGFBQU8sSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUMsQ0FBQyxDQUFDO0tBQzVGOzs7bUNBQ2M7QUFDYixhQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxzQkFBVyxLQUFLLENBQUM7S0FDMUU7OzsrQkFDVTtBQUNULGFBQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUsscUJBQVUsTUFBTSxDQUFDO0tBQ3BFOzs7dUNBQ2tCO0FBQ2pCLGFBQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUsscUJBQVUsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLHFCQUFVLEtBQUssQ0FBQztLQUN6Rzs7O2dDQUNXO0FBQ1YsYUFBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssc0JBQVcsT0FBTyxDQUFDO0tBQzVFOzs7b0NBQ2U7QUFDZCxhQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLHFCQUFVLElBQUksQ0FBQztLQUNsRTs7O3VDQUNrQjtBQUNqQixhQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxzQkFBVyxjQUFjLENBQUM7S0FDbkY7OzttQ0FDYztBQUNiLGFBQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLHNCQUFXLFVBQVUsQ0FBQztLQUMvRTs7O3NDQUNpQjtBQUNoQixhQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxzQkFBVyxhQUFhLENBQUM7S0FDbEY7OzswQ0FDcUI7QUFDcEIsYUFBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssc0JBQVcsaUJBQWlCLENBQUM7S0FDdEY7OztpQ0FDWTtBQUNYLGFBQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUsscUJBQVUsUUFBUSxDQUFDO0tBQ3RFOzs7a0NBQ2E7QUFDWixhQUFPLGdCQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEM7OzsrQkFDVTtBQUNULGFBQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUsscUJBQVUsTUFBTSxDQUFDO0tBQ2hGOzs7K0JBQ1U7QUFDVCxhQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLHFCQUFVLE1BQU0sQ0FBQztLQUNoRjs7O2lDQUNZO0FBQ1gsYUFBTyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxxQkFBVSxNQUFNLENBQUM7S0FDaEY7Ozt1Q0FDa0I7QUFDakIsYUFBTyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxDQUFDO0tBQy9EOzs7NEJBQ087QUFDTixhQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLHFCQUFVLEdBQUcsQ0FBQztLQUNqRTs7OytCQUNVO0FBQ1QsVUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7QUFDdEIsZUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7aUJBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtTQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDNUQ7QUFDRCxVQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRTtBQUMxQixlQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztPQUM3QjtBQUNELFVBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ3JCLGVBQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO09BQ25CO0FBQ0QsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUN6Qjs7O3VCQXZNUyxTQUFTLEVBQWdCO1VBQWQsT0FBTyx5REFBRyxFQUFFOztBQUMvQixhQUFPLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0M7OzsrQkFDNkI7VUFBZCxPQUFPLHlEQUFHLEVBQUU7O0FBQzFCLGFBQU8sSUFBSSxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUscUJBQVUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDekU7OzsrQkFDaUIsU0FBUyxFQUFnQjtVQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDdkMsYUFBTyxJQUFJLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxxQkFBVSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNoRjs7OytCQUNpQixTQUFTLEVBQWdCO1VBQWQsT0FBTyx5REFBRyxFQUFFOztBQUN2QyxhQUFPLElBQUksTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLHFCQUFVLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzlFOzs7bUNBQ3FCLFNBQVMsRUFBZ0I7VUFBZCxPQUFPLHlEQUFHLEVBQUU7O0FBQzNDLGFBQU8sSUFBSSxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsc0JBQVcsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQy9HOzs7Z0NBQ2tCLFNBQVMsRUFBZ0I7VUFBZCxPQUFPLHlEQUFHLEVBQUU7O0FBQ3hDLGFBQU8sSUFBSSxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsc0JBQVcsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzVHOzs7bUNBQ3FCLFNBQVMsRUFBZ0I7VUFBZCxPQUFPLHlEQUFHLEVBQUU7O0FBQzNDLGFBQU8sSUFBSSxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUscUJBQVUsVUFBVSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDcEY7OzswQ0FDNEIsU0FBUyxFQUFnQjtVQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDbEQsYUFBTyxJQUFJLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxxQkFBVSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNoRjs7OytCQUNpQixTQUFTLEVBQWdCO1VBQWQsT0FBTyx5REFBRyxFQUFFOztBQUN2QyxVQUFJLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxxQkFBVSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7QUFDaEUsVUFBSSxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUscUJBQVUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO0FBQ2pFLGFBQU8sSUFBSSxNQUFNLENBQUMsZ0JBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3pGOzs7aUNBQ21CLFNBQVMsRUFBZ0I7VUFBZCxPQUFPLHlEQUFHLEVBQUU7O0FBQ3pDLFVBQUksUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLHFCQUFVLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUNoRSxVQUFJLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxxQkFBVSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7QUFDakUsYUFBTyxJQUFJLE1BQU0sQ0FBQyxnQkFBSyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDekY7OzsrQkFDaUIsU0FBUyxFQUFnQjtVQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDdkMsVUFBSSxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUscUJBQVUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO0FBQ2hFLFVBQUksU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLHFCQUFVLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUNqRSxhQUFPLElBQUksTUFBTSxDQUFDLGdCQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN6Rjs7O1NBN0NrQixNQUFNOzs7a0JBQU4sTUFBTSIsImZpbGUiOiJzeW50YXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwXCI7XG5pbXBvcnQge01heWJlfSBmcm9tIFwicmFtZGEtZmFudGFzeVwiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5jb25zdCBKdXN0XzY0NSA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzY0NiA9IE1heWJlLk5vdGhpbmc7XG5pbXBvcnQge1Rva2VuVHlwZSwgVG9rZW5DbGFzc30gZnJvbSBcInNoaWZ0LXBhcnNlci9kaXN0L3Rva2VuaXplclwiO1xuZnVuY3Rpb24gc2l6ZURlY2VuZGluZ182NDcoYV82NDgsIGJfNjQ5KSB7XG4gIGlmIChhXzY0OC5zY29wZXMuc2l6ZSA+IGJfNjQ5LnNjb3Blcy5zaXplKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9IGVsc2UgaWYgKGJfNjQ5LnNjb3Blcy5zaXplID4gYV82NDguc2NvcGVzLnNpemUpIHtcbiAgICByZXR1cm4gMTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gMDtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3ludGF4IHtcbiAgY29uc3RydWN0b3IodG9rZW5fNjUwLCBjb250ZXh0XzY1MSA9IHtiaW5kaW5nczogbmV3IEJpbmRpbmdNYXAsIHNjb3Blc2V0OiBMaXN0KCl9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuXzY1MDtcbiAgICB0aGlzLmNvbnRleHQgPSB7YmluZGluZ3M6IGNvbnRleHRfNjUxLmJpbmRpbmdzLCBzY29wZXNldDogY29udGV4dF82NTEuc2NvcGVzZXR9O1xuICAgIE9iamVjdC5mcmVlemUodGhpcy5jb250ZXh0KTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG4gIHN0YXRpYyBvZih0b2tlbl82NTIsIHN0eF82NTMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzY1Miwgc3R4XzY1My5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bGwoc3R4XzY1NCA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5OVUxMLCB2YWx1ZTogbnVsbH0sIHN0eF82NTQuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21OdW1iZXIodmFsdWVfNjU1LCBzdHhfNjU2ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTUJFUiwgdmFsdWU6IHZhbHVlXzY1NX0sIHN0eF82NTYuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21TdHJpbmcodmFsdWVfNjU3LCBzdHhfNjU4ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlNUUklORywgc3RyOiB2YWx1ZV82NTd9LCBzdHhfNjU4LmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tUHVuY3R1YXRvcih2YWx1ZV82NTksIHN0eF82NjAgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgbmFtZTogdmFsdWVfNjU5fSwgdmFsdWU6IHZhbHVlXzY1OX0sIHN0eF82NjAuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21LZXl3b3JkKHZhbHVlXzY2MSwgc3R4XzY2MiA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IHtrbGFzczogVG9rZW5DbGFzcy5LZXl3b3JkLCBuYW1lOiB2YWx1ZV82NjF9LCB2YWx1ZTogdmFsdWVfNjYxfSwgc3R4XzY2Mi5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbUlkZW50aWZpZXIodmFsdWVfNjYzLCBzdHhfNjY0ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLklERU5USUZJRVIsIHZhbHVlOiB2YWx1ZV82NjN9LCBzdHhfNjY0LmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tUmVndWxhckV4cHJlc3Npb24odmFsdWVfNjY1LCBzdHhfNjY2ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJFR0VYUCwgdmFsdWU6IHZhbHVlXzY2NX0sIHN0eF82NjYuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21CcmFjZXMoaW5uZXJfNjY3LCBzdHhfNjY4ID0ge30pIHtcbiAgICBsZXQgbGVmdF82NjkgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNFLCB2YWx1ZTogXCJ7XCJ9KTtcbiAgICBsZXQgcmlnaHRfNjcwID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJCUkFDRSwgdmFsdWU6IFwifVwifSk7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0XzY2OSkuY29uY2F0KGlubmVyXzY2NykucHVzaChyaWdodF82NzApLCBzdHhfNjY4LmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tQnJhY2tldHMoaW5uZXJfNjcxLCBzdHhfNjcyID0ge30pIHtcbiAgICBsZXQgbGVmdF82NzMgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNLLCB2YWx1ZTogXCJbXCJ9KTtcbiAgICBsZXQgcmlnaHRfNjc0ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJCUkFDSywgdmFsdWU6IFwiXVwifSk7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0XzY3MykuY29uY2F0KGlubmVyXzY3MSkucHVzaChyaWdodF82NzQpLCBzdHhfNjcyLmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tUGFyZW5zKGlubmVyXzY3NSwgc3R4XzY3NiA9IHt9KSB7XG4gICAgbGV0IGxlZnRfNjc3ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxQQVJFTiwgdmFsdWU6IFwiKFwifSk7XG4gICAgbGV0IHJpZ2h0XzY3OCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SUEFSRU4sIHZhbHVlOiBcIilcIn0pO1xuICAgIHJldHVybiBuZXcgU3ludGF4KExpc3Qub2YobGVmdF82NzcpLmNvbmNhdChpbm5lcl82NzUpLnB1c2gocmlnaHRfNjc4KSwgc3R4XzY3Ni5jb250ZXh0KTtcbiAgfVxuICByZXNvbHZlKCkge1xuICAgIGlmICh0aGlzLmNvbnRleHQuc2NvcGVzZXQuc2l6ZSA9PT0gMCB8fCAhKHRoaXMuaXNJZGVudGlmaWVyKCkgfHwgdGhpcy5pc0tleXdvcmQoKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICAgIH1cbiAgICBsZXQgc2NvcGVfNjc5ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0Lmxhc3QoKTtcbiAgICBsZXQgc3R4U2NvcGVzXzY4MCA9IHRoaXMuY29udGV4dC5zY29wZXNldDtcbiAgICBsZXQgYmluZGluZ3NfNjgxID0gdGhpcy5jb250ZXh0LmJpbmRpbmdzO1xuICAgIGlmIChzY29wZV82NzkpIHtcbiAgICAgIGxldCBzY29wZXNldEJpbmRpbmdMaXN0ID0gYmluZGluZ3NfNjgxLmdldCh0aGlzKTtcbiAgICAgIGlmIChzY29wZXNldEJpbmRpbmdMaXN0KSB7XG4gICAgICAgIGxldCBiaWdnZXN0QmluZGluZ1BhaXIgPSBzY29wZXNldEJpbmRpbmdMaXN0LmZpbHRlcigoe3Njb3BlcywgYmluZGluZ30pID0+IHtcbiAgICAgICAgICByZXR1cm4gc2NvcGVzLmlzU3Vic2V0KHN0eFNjb3Blc182ODApO1xuICAgICAgICB9KS5zb3J0KHNpemVEZWNlbmRpbmdfNjQ3KTtcbiAgICAgICAgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplID49IDIgJiYgYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5zY29wZXMuc2l6ZSA9PT0gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgxKS5zY29wZXMuc2l6ZSkge1xuICAgICAgICAgIGxldCBkZWJ1Z0Jhc2UgPSBcIntcIiArIHN0eFNjb3Blc182ODAubWFwKHNfNjgyID0+IHNfNjgyLnRvU3RyaW5nKCkpLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuICAgICAgICAgIGxldCBkZWJ1Z0FtYmlnb3VzU2NvcGVzZXRzID0gYmlnZ2VzdEJpbmRpbmdQYWlyLm1hcCgoe3Njb3Blc30pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBcIntcIiArIHNjb3Blcy5tYXAoc182ODMgPT4gc182ODMudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgfSkuam9pbihcIiwgXCIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjb3Blc2V0IFwiICsgZGVidWdCYXNlICsgXCIgaGFzIGFtYmlndW91cyBzdWJzZXRzIFwiICsgZGVidWdBbWJpZ291c1Njb3Blc2V0cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmlnZ2VzdEJpbmRpbmdQYWlyLnNpemUgIT09IDApIHtcbiAgICAgICAgICBsZXQgYmluZGluZ1N0ciA9IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYmluZGluZy50b1N0cmluZygpO1xuICAgICAgICAgIGlmIChNYXliZS5pc0p1c3QoYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcykpIHtcbiAgICAgICAgICAgIHJldHVybiBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzLmdldE9yRWxzZShudWxsKS5yZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiaW5kaW5nU3RyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIHZhbCgpIHtcbiAgICBhc3NlcnQoIXRoaXMuaXNEZWxpbWl0ZXIoKSwgXCJjYW5ub3QgZ2V0IHRoZSB2YWwgb2YgYSBkZWxpbWl0ZXJcIik7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLnN0cjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUZW1wbGF0ZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5pdGVtcy5tYXAoZWxfNjg0ID0+IHtcbiAgICAgICAgaWYgKGVsXzY4NCBpbnN0YW5jZW9mIFN5bnRheCAmJiBlbF82ODQuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgICAgIHJldHVybiBcIiR7Li4ufVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbF82ODQuc2xpY2UudGV4dDtcbiAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIGxpbmVOdW1iZXIoKSB7XG4gICAgaWYgKCF0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLnNsaWNlLnN0YXJ0TG9jYXRpb24ubGluZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uZ2V0KDApLmxpbmVOdW1iZXIoKTtcbiAgICB9XG4gIH1cbiAgc2V0TGluZU51bWJlcihsaW5lXzY4NSkge1xuICAgIGxldCBuZXdUb2tfNjg2ID0ge307XG4gICAgaWYgKHRoaXMuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgbmV3VG9rXzY4NiA9IHRoaXMudG9rZW4ubWFwKHNfNjg3ID0+IHNfNjg3LnNldExpbmVOdW1iZXIobGluZV82ODUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHRoaXMudG9rZW4pKSB7XG4gICAgICAgIG5ld1Rva182ODZba2V5XSA9IHRoaXMudG9rZW5ba2V5XTtcbiAgICAgIH1cbiAgICAgIGFzc2VydChuZXdUb2tfNjg2LnNsaWNlICYmIG5ld1Rva182ODYuc2xpY2Uuc3RhcnRMb2NhdGlvbiwgXCJhbGwgdG9rZW5zIG11c3QgaGF2ZSBsaW5lIGluZm9cIik7XG4gICAgICBuZXdUb2tfNjg2LnNsaWNlLnN0YXJ0TG9jYXRpb24ubGluZSA9IGxpbmVfNjg1O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheChuZXdUb2tfNjg2LCB0aGlzLmNvbnRleHQpO1xuICB9XG4gIGlubmVyKCkge1xuICAgIGFzc2VydCh0aGlzLmlzRGVsaW1pdGVyKCksIFwiY2FuIG9ubHkgZ2V0IHRoZSBpbm5lciBvZiBhIGRlbGltaXRlclwiKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZSgxLCB0aGlzLnRva2VuLnNpemUgLSAxKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV82ODgsIGJpbmRpbmdzXzY4OSwgb3B0aW9uc182OTAgPSB7ZmxpcDogZmFsc2V9KSB7XG4gICAgbGV0IHRva2VuXzY5MSA9IHRoaXMuaXNEZWxpbWl0ZXIoKSA/IHRoaXMudG9rZW4ubWFwKHNfNjkzID0+IHNfNjkzLmFkZFNjb3BlKHNjb3BlXzY4OCwgYmluZGluZ3NfNjg5LCBvcHRpb25zXzY5MCkpIDogdGhpcy50b2tlbjtcbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKCkpIHtcbiAgICAgIHRva2VuXzY5MSA9IHt0eXBlOiB0aGlzLnRva2VuLnR5cGUsIGl0ZW1zOiB0b2tlbl82OTEuaXRlbXMubWFwKGl0XzY5NCA9PiB7XG4gICAgICAgIGlmIChpdF82OTQgaW5zdGFuY2VvZiBTeW50YXggJiYgaXRfNjk0LmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgICAgICByZXR1cm4gaXRfNjk0LmFkZFNjb3BlKHNjb3BlXzY4OCwgYmluZGluZ3NfNjg5LCBvcHRpb25zXzY5MCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0XzY5NDtcbiAgICAgIH0pfTtcbiAgICB9XG4gICAgbGV0IG5ld1Njb3Blc2V0XzY5MjtcbiAgICBpZiAob3B0aW9uc182OTAuZmxpcCkge1xuICAgICAgbGV0IGluZGV4ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LmluZGV4T2Yoc2NvcGVfNjg4KTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbmV3U2NvcGVzZXRfNjkyID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LnJlbW92ZShpbmRleCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTY29wZXNldF82OTIgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucHVzaChzY29wZV82ODgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdTY29wZXNldF82OTIgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucHVzaChzY29wZV82ODgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl82OTEsIHtiaW5kaW5nczogYmluZGluZ3NfNjg5LCBzY29wZXNldDogbmV3U2NvcGVzZXRfNjkyfSk7XG4gIH1cbiAgcmVtb3ZlU2NvcGUoc2NvcGVfNjk1KSB7XG4gICAgbGV0IHRva2VuXzY5NiA9IHRoaXMuaXNEZWxpbWl0ZXIoKSA/IHRoaXMudG9rZW4ubWFwKHNfNjk5ID0+IHNfNjk5LnJlbW92ZVNjb3BlKHNjb3BlXzY5NSkpIDogdGhpcy50b2tlbjtcbiAgICBsZXQgbmV3U2NvcGVzZXRfNjk3ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0O1xuICAgIGxldCBpbmRleF82OTggPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQuaW5kZXhPZihzY29wZV82OTUpO1xuICAgIGlmIChpbmRleF82OTggIT09IC0xKSB7XG4gICAgICBuZXdTY29wZXNldF82OTcgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucmVtb3ZlKGluZGV4XzY5OCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzY5Niwge2JpbmRpbmdzOiB0aGlzLmNvbnRleHQuYmluZGluZ3MsIHNjb3Blc2V0OiBuZXdTY29wZXNldF82OTd9KTtcbiAgfVxuICBpc0lkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLklkZW50O1xuICB9XG4gIGlzQXNzaWduKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkFTU0lHTjtcbiAgfVxuICBpc0Jvb2xlYW5MaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLlRSVUUgfHwgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuRkFMU0U7XG4gIH1cbiAgaXNLZXl3b3JkKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5LZXl3b3JkO1xuICB9XG4gIGlzTnVsbExpdGVyYWwoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTlVMTDtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5OdW1lcmljTGl0ZXJhbDtcbiAgfVxuICBpc1B1bmN0dWF0b3IoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlB1bmN0dWF0b3I7XG4gIH1cbiAgaXNTdHJpbmdMaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5TdHJpbmdMaXRlcmFsO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24oKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlJlZ3VsYXJFeHByZXNzaW9uO1xuICB9XG4gIGlzVGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuVEVNUExBVEU7XG4gIH1cbiAgaXNEZWxpbWl0ZXIoKSB7XG4gICAgcmV0dXJuIExpc3QuaXNMaXN0KHRoaXMudG9rZW4pO1xuICB9XG4gIGlzUGFyZW5zKCkge1xuICAgIHJldHVybiB0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi5nZXQoMCkudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkxQQVJFTjtcbiAgfVxuICBpc0JyYWNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0U7XG4gIH1cbiAgaXNCcmFja2V0cygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0s7XG4gIH1cbiAgaXNTeW50YXhUZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnZhbCgpID09PSBcIiNgXCI7XG4gIH1cbiAgaXNFT0YoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuRU9TO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLm1hcChzXzcwMCA9PiBzXzcwMC50b1N0cmluZygpKS5qb2luKFwiIFwiKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKCkpIHtcbiAgICAgIHJldHVybiBcIidcIiArIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxufVxuIl19