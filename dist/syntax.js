"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var Just_641 = _ramdaFantasy.Maybe.Just;
var Nothing_642 = _ramdaFantasy.Maybe.Nothing;

function sizeDecending_643(a_644, b_645) {
  if (a_644.scopes.size > b_645.scopes.size) {
    return -1;
  } else if (b_645.scopes.size > a_644.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}

var Syntax = function () {
  function Syntax(token_646) {
    var context_647 = arguments.length <= 1 || arguments[1] === undefined ? { bindings: new _bindingMap2.default(), scopeset: (0, _immutable.List)() } : arguments[1];

    _classCallCheck(this, Syntax);

    this.token = token_646;
    this.context = { bindings: context_647.bindings, scopeset: context_647.scopeset };
    Object.freeze(this.context);
    Object.freeze(this);
  }

  _createClass(Syntax, [{
    key: "resolve",
    value: function resolve() {
      if (this.context.scopeset.size === 0 || !(this.isIdentifier() || this.isKeyword())) {
        return this.token.value;
      }
      var scope_675 = this.context.scopeset.last();
      var stxScopes_676 = this.context.scopeset;
      var bindings_677 = this.context.bindings;
      if (scope_675) {
        var scopesetBindingList = bindings_677.get(this);
        if (scopesetBindingList) {
          var biggestBindingPair = scopesetBindingList.filter(function (_ref) {
            var scopes = _ref.scopes;
            var binding = _ref.binding;

            return scopes.isSubset(stxScopes_676);
          }).sort(sizeDecending_643);
          if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
            var debugBase = "{" + stxScopes_676.map(function (s_678) {
              return s_678.toString();
            }).join(", ") + "}";
            var debugAmbigousScopesets = biggestBindingPair.map(function (_ref2) {
              var scopes = _ref2.scopes;

              return "{" + scopes.map(function (s_679) {
                return s_679.toString();
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
        return this.token.items.map(function (el_680) {
          if (el_680 instanceof Syntax && el_680.isDelimiter()) {
            return "${...}";
          }
          return el_680.slice.text;
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
    key: "inner",
    value: function inner() {
      (0, _errors.assert)(this.isDelimiter(), "can only get the inner of a delimiter");
      return this.token.slice(1, this.token.size - 1);
    }
  }, {
    key: "addScope",
    value: function addScope(scope_681, bindings_682) {
      var options_683 = arguments.length <= 2 || arguments[2] === undefined ? { flip: false } : arguments[2];

      var token_684 = this.isDelimiter() ? this.token.map(function (s_686) {
        return s_686.addScope(scope_681, bindings_682, options_683);
      }) : this.token;
      if (this.isTemplate()) {
        token_684 = { type: this.token.type, items: token_684.items.map(function (it_687) {
            if (it_687 instanceof Syntax && it_687.isDelimiter()) {
              return it_687.addScope(scope_681, bindings_682, options_683);
            }
            return it_687;
          }) };
      }
      var newScopeset_685 = void 0;
      if (options_683.flip) {
        var index = this.context.scopeset.indexOf(scope_681);
        if (index !== -1) {
          newScopeset_685 = this.context.scopeset.remove(index);
        } else {
          newScopeset_685 = this.context.scopeset.push(scope_681);
        }
      } else {
        newScopeset_685 = this.context.scopeset.push(scope_681);
      }
      return new Syntax(token_684, { bindings: bindings_682, scopeset: newScopeset_685 });
    }
  }, {
    key: "removeScope",
    value: function removeScope(scope_688) {
      var token_689 = this.isDelimiter() ? this.token.map(function (s_692) {
        return s_692.removeScope(scope_688);
      }) : this.token;
      var newScopeset_690 = this.context.scopeset;
      var index_691 = this.context.scopeset.indexOf(scope_688);
      if (index_691 !== -1) {
        newScopeset_690 = this.context.scopeset.remove(index_691);
      }
      return new Syntax(token_689, { bindings: this.context.bindings, scopeset: newScopeset_690 });
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
        return this.token.map(function (s_693) {
          return s_693.toString();
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
    value: function of(token_648) {
      var stx_649 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax(token_648, stx_649.context);
    }
  }, {
    key: "fromNull",
    value: function fromNull() {
      var stx_650 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_650.context);
    }
  }, {
    key: "fromNumber",
    value: function fromNumber(value_651) {
      var stx_652 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_651 }, stx_652.context);
    }
  }, {
    key: "fromString",
    value: function fromString(value_653) {
      var stx_654 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: _tokenizer.TokenType.STRING, str: value_653 }, stx_654.context);
    }
  }, {
    key: "fromPunctuator",
    value: function fromPunctuator(value_655) {
      var stx_656 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_655 }, value: value_655 }, stx_656.context);
    }
  }, {
    key: "fromKeyword",
    value: function fromKeyword(value_657) {
      var stx_658 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_657 }, value: value_657 }, stx_658.context);
    }
  }, {
    key: "fromIdentifier",
    value: function fromIdentifier(value_659) {
      var stx_660 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_659 }, stx_660.context);
    }
  }, {
    key: "fromRegularExpression",
    value: function fromRegularExpression(value_661) {
      var stx_662 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_661 }, stx_662.context);
    }
  }, {
    key: "fromBraces",
    value: function fromBraces(inner_663) {
      var stx_664 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left_665 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });
      var right_666 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });
      return new Syntax(_immutable.List.of(left_665).concat(inner_663).push(right_666), stx_664.context);
    }
  }, {
    key: "fromBrackets",
    value: function fromBrackets(inner_667) {
      var stx_668 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left_669 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });
      var right_670 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });
      return new Syntax(_immutable.List.of(left_669).concat(inner_667).push(right_670), stx_668.context);
    }
  }, {
    key: "fromParens",
    value: function fromParens(inner_671) {
      var stx_672 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left_673 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });
      var right_674 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });
      return new Syntax(_immutable.List.of(left_673).concat(inner_671).push(right_674), stx_672.context);
    }
  }]);

  return Syntax;
}();

exports.default = Syntax;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3N5bnRheC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0lBQWE7O0FBR2I7Ozs7Ozs7O0FBRkEsSUFBTSxXQUFXLG9CQUFNLElBQU47QUFDakIsSUFBTSxjQUFjLG9CQUFNLE9BQU47O0FBRXBCLFNBQVMsaUJBQVQsQ0FBMkIsS0FBM0IsRUFBa0MsS0FBbEMsRUFBeUM7QUFDdkMsTUFBSSxNQUFNLE1BQU4sQ0FBYSxJQUFiLEdBQW9CLE1BQU0sTUFBTixDQUFhLElBQWIsRUFBbUI7QUFDekMsV0FBTyxDQUFDLENBQUQsQ0FEa0M7R0FBM0MsTUFFTyxJQUFJLE1BQU0sTUFBTixDQUFhLElBQWIsR0FBb0IsTUFBTSxNQUFOLENBQWEsSUFBYixFQUFtQjtBQUNoRCxXQUFPLENBQVAsQ0FEZ0Q7R0FBM0MsTUFFQTtBQUNMLFdBQU8sQ0FBUCxDQURLO0dBRkE7Q0FIVDs7SUFTcUI7QUFDbkIsV0FEbUIsTUFDbkIsQ0FBWSxTQUFaLEVBQW1GO1FBQTVELG9FQUFjLEVBQUMsVUFBVSwwQkFBVixFQUEwQixVQUFVLHNCQUFWLGtCQUFtQjs7MEJBRGhFLFFBQ2dFOztBQUNqRixTQUFLLEtBQUwsR0FBYSxTQUFiLENBRGlGO0FBRWpGLFNBQUssT0FBTCxHQUFlLEVBQUMsVUFBVSxZQUFZLFFBQVosRUFBc0IsVUFBVSxZQUFZLFFBQVosRUFBMUQsQ0FGaUY7QUFHakYsV0FBTyxNQUFQLENBQWMsS0FBSyxPQUFMLENBQWQsQ0FIaUY7QUFJakYsV0FBTyxNQUFQLENBQWMsSUFBZCxFQUppRjtHQUFuRjs7ZUFEbUI7OzhCQThDVDtBQUNSLFVBQUksS0FBSyxPQUFMLENBQWEsUUFBYixDQUFzQixJQUF0QixLQUErQixDQUEvQixJQUFvQyxFQUFFLEtBQUssWUFBTCxNQUF1QixLQUFLLFNBQUwsRUFBdkIsQ0FBRixFQUE0QztBQUNsRixlQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FEMkU7T0FBcEY7QUFHQSxVQUFJLFlBQVksS0FBSyxPQUFMLENBQWEsUUFBYixDQUFzQixJQUF0QixFQUFaLENBSkk7QUFLUixVQUFJLGdCQUFnQixLQUFLLE9BQUwsQ0FBYSxRQUFiLENBTFo7QUFNUixVQUFJLGVBQWUsS0FBSyxPQUFMLENBQWEsUUFBYixDQU5YO0FBT1IsVUFBSSxTQUFKLEVBQWU7QUFDYixZQUFJLHNCQUFzQixhQUFhLEdBQWIsQ0FBaUIsSUFBakIsQ0FBdEIsQ0FEUztBQUViLFlBQUksbUJBQUosRUFBeUI7QUFDdkIsY0FBSSxxQkFBcUIsb0JBQW9CLE1BQXBCLENBQTJCLGdCQUF1QjtnQkFBckIscUJBQXFCO2dCQUFiLHVCQUFhOztBQUN6RSxtQkFBTyxPQUFPLFFBQVAsQ0FBZ0IsYUFBaEIsQ0FBUCxDQUR5RTtXQUF2QixDQUEzQixDQUV0QixJQUZzQixDQUVqQixpQkFGaUIsQ0FBckIsQ0FEbUI7QUFJdkIsY0FBSSxtQkFBbUIsSUFBbkIsSUFBMkIsQ0FBM0IsSUFBZ0MsbUJBQW1CLEdBQW5CLENBQXVCLENBQXZCLEVBQTBCLE1BQTFCLENBQWlDLElBQWpDLEtBQTBDLG1CQUFtQixHQUFuQixDQUF1QixDQUF2QixFQUEwQixNQUExQixDQUFpQyxJQUFqQyxFQUF1QztBQUNuSCxnQkFBSSxZQUFZLE1BQU0sY0FBYyxHQUFkLENBQWtCO3FCQUFTLE1BQU0sUUFBTjthQUFULENBQWxCLENBQTZDLElBQTdDLENBQWtELElBQWxELENBQU4sR0FBZ0UsR0FBaEUsQ0FEbUc7QUFFbkgsZ0JBQUkseUJBQXlCLG1CQUFtQixHQUFuQixDQUF1QixpQkFBYztrQkFBWixzQkFBWTs7QUFDaEUscUJBQU8sTUFBTSxPQUFPLEdBQVAsQ0FBVzt1QkFBUyxNQUFNLFFBQU47ZUFBVCxDQUFYLENBQXNDLElBQXRDLENBQTJDLElBQTNDLENBQU4sR0FBeUQsR0FBekQsQ0FEeUQ7YUFBZCxDQUF2QixDQUUxQixJQUYwQixDQUVyQixJQUZxQixDQUF6QixDQUYrRztBQUtuSCxrQkFBTSxJQUFJLEtBQUosQ0FBVSxjQUFjLFNBQWQsR0FBMEIseUJBQTFCLEdBQXNELHNCQUF0RCxDQUFoQixDQUxtSDtXQUFySCxNQU1PLElBQUksbUJBQW1CLElBQW5CLEtBQTRCLENBQTVCLEVBQStCO0FBQ3hDLGdCQUFJLGFBQWEsbUJBQW1CLEdBQW5CLENBQXVCLENBQXZCLEVBQTBCLE9BQTFCLENBQWtDLFFBQWxDLEVBQWIsQ0FEb0M7QUFFeEMsZ0JBQUksb0JBQU0sTUFBTixDQUFhLG1CQUFtQixHQUFuQixDQUF1QixDQUF2QixFQUEwQixLQUExQixDQUFqQixFQUFtRDtBQUNqRCxxQkFBTyxtQkFBbUIsR0FBbkIsQ0FBdUIsQ0FBdkIsRUFBMEIsS0FBMUIsQ0FBZ0MsU0FBaEMsQ0FBMEMsSUFBMUMsRUFBZ0QsT0FBaEQsRUFBUCxDQURpRDthQUFuRDtBQUdBLG1CQUFPLFVBQVAsQ0FMd0M7V0FBbkM7U0FWVDtPQUZGO0FBcUJBLGFBQU8sS0FBSyxLQUFMLENBQVcsS0FBWCxDQTVCQzs7OzswQkE4Qko7QUFDSiwwQkFBTyxDQUFDLEtBQUssV0FBTCxFQUFELEVBQXFCLG1DQUE1QixFQURJO0FBRUosVUFBSSxLQUFLLGVBQUwsRUFBSixFQUE0QjtBQUMxQixlQUFPLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FEbUI7T0FBNUI7QUFHQSxVQUFJLEtBQUssVUFBTCxFQUFKLEVBQXVCO0FBQ3JCLGVBQU8sS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixHQUFqQixDQUFxQixrQkFBVTtBQUNwQyxjQUFJLGtCQUFrQixNQUFsQixJQUE0QixPQUFPLFdBQVAsRUFBNUIsRUFBa0Q7QUFDcEQsbUJBQU8sUUFBUCxDQURvRDtXQUF0RDtBQUdBLGlCQUFPLE9BQU8sS0FBUCxDQUFhLElBQWIsQ0FKNkI7U0FBVixDQUFyQixDQUtKLElBTEksQ0FLQyxFQUxELENBQVAsQ0FEcUI7T0FBdkI7QUFRQSxhQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FiSDs7OztpQ0FlTztBQUNYLFVBQUksQ0FBQyxLQUFLLFdBQUwsRUFBRCxFQUFxQjtBQUN2QixlQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsYUFBakIsQ0FBK0IsSUFBL0IsQ0FEZ0I7T0FBekIsTUFFTztBQUNMLGVBQU8sS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLENBQWYsRUFBa0IsVUFBbEIsRUFBUCxDQURLO09BRlA7Ozs7NEJBTU07QUFDTiwwQkFBTyxLQUFLLFdBQUwsRUFBUCxFQUEyQix1Q0FBM0IsRUFETTtBQUVOLGFBQU8sS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixDQUFqQixFQUFvQixLQUFLLEtBQUwsQ0FBVyxJQUFYLEdBQWtCLENBQWxCLENBQTNCLENBRk07Ozs7NkJBSUMsV0FBVyxjQUEyQztVQUE3QixvRUFBYyxFQUFDLE1BQU0sS0FBTixrQkFBYzs7QUFDN0QsVUFBSSxZQUFZLEtBQUssV0FBTCxLQUFxQixLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWU7ZUFBUyxNQUFNLFFBQU4sQ0FBZSxTQUFmLEVBQTBCLFlBQTFCLEVBQXdDLFdBQXhDO09BQVQsQ0FBcEMsR0FBcUcsS0FBSyxLQUFMLENBRHhEO0FBRTdELFVBQUksS0FBSyxVQUFMLEVBQUosRUFBdUI7QUFDckIsb0JBQVksRUFBQyxNQUFNLEtBQUssS0FBTCxDQUFXLElBQVgsRUFBaUIsT0FBTyxVQUFVLEtBQVYsQ0FBZ0IsR0FBaEIsQ0FBb0Isa0JBQVU7QUFDdkUsZ0JBQUksa0JBQWtCLE1BQWxCLElBQTRCLE9BQU8sV0FBUCxFQUE1QixFQUFrRDtBQUNwRCxxQkFBTyxPQUFPLFFBQVAsQ0FBZ0IsU0FBaEIsRUFBMkIsWUFBM0IsRUFBeUMsV0FBekMsQ0FBUCxDQURvRDthQUF0RDtBQUdBLG1CQUFPLE1BQVAsQ0FKdUU7V0FBVixDQUEzQixFQUFwQyxDQURxQjtPQUF2QjtBQVFBLFVBQUksd0JBQUosQ0FWNkQ7QUFXN0QsVUFBSSxZQUFZLElBQVosRUFBa0I7QUFDcEIsWUFBSSxRQUFRLEtBQUssT0FBTCxDQUFhLFFBQWIsQ0FBc0IsT0FBdEIsQ0FBOEIsU0FBOUIsQ0FBUixDQURnQjtBQUVwQixZQUFJLFVBQVUsQ0FBQyxDQUFELEVBQUk7QUFDaEIsNEJBQWtCLEtBQUssT0FBTCxDQUFhLFFBQWIsQ0FBc0IsTUFBdEIsQ0FBNkIsS0FBN0IsQ0FBbEIsQ0FEZ0I7U0FBbEIsTUFFTztBQUNMLDRCQUFrQixLQUFLLE9BQUwsQ0FBYSxRQUFiLENBQXNCLElBQXRCLENBQTJCLFNBQTNCLENBQWxCLENBREs7U0FGUDtPQUZGLE1BT087QUFDTCwwQkFBa0IsS0FBSyxPQUFMLENBQWEsUUFBYixDQUFzQixJQUF0QixDQUEyQixTQUEzQixDQUFsQixDQURLO09BUFA7QUFVQSxhQUFPLElBQUksTUFBSixDQUFXLFNBQVgsRUFBc0IsRUFBQyxVQUFVLFlBQVYsRUFBd0IsVUFBVSxlQUFWLEVBQS9DLENBQVAsQ0FyQjZEOzs7O2dDQXVCbkQsV0FBVztBQUNyQixVQUFJLFlBQVksS0FBSyxXQUFMLEtBQXFCLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZTtlQUFTLE1BQU0sV0FBTixDQUFrQixTQUFsQjtPQUFULENBQXBDLEdBQTZFLEtBQUssS0FBTCxDQUR4RTtBQUVyQixVQUFJLGtCQUFrQixLQUFLLE9BQUwsQ0FBYSxRQUFiLENBRkQ7QUFHckIsVUFBSSxZQUFZLEtBQUssT0FBTCxDQUFhLFFBQWIsQ0FBc0IsT0FBdEIsQ0FBOEIsU0FBOUIsQ0FBWixDQUhpQjtBQUlyQixVQUFJLGNBQWMsQ0FBQyxDQUFELEVBQUk7QUFDcEIsMEJBQWtCLEtBQUssT0FBTCxDQUFhLFFBQWIsQ0FBc0IsTUFBdEIsQ0FBNkIsU0FBN0IsQ0FBbEIsQ0FEb0I7T0FBdEI7QUFHQSxhQUFPLElBQUksTUFBSixDQUFXLFNBQVgsRUFBc0IsRUFBQyxVQUFVLEtBQUssT0FBTCxDQUFhLFFBQWIsRUFBdUIsVUFBVSxlQUFWLEVBQXhELENBQVAsQ0FQcUI7Ozs7bUNBU1I7QUFDYixhQUFPLENBQUMsS0FBSyxXQUFMLEVBQUQsSUFBdUIsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixLQUEwQixzQkFBVyxLQUFYLENBRDNDOzs7OytCQUdKO0FBQ1QsYUFBTyxDQUFDLEtBQUssV0FBTCxFQUFELElBQXVCLEtBQUssS0FBTCxDQUFXLElBQVgsS0FBb0IscUJBQVUsTUFBVixDQUR6Qzs7Ozt1Q0FHUTtBQUNqQixhQUFPLENBQUMsS0FBSyxXQUFMLEVBQUQsSUFBdUIsS0FBSyxLQUFMLENBQVcsSUFBWCxLQUFvQixxQkFBVSxJQUFWLElBQWtCLEtBQUssS0FBTCxDQUFXLElBQVgsS0FBb0IscUJBQVUsS0FBVixDQUR2RTs7OztnQ0FHUDtBQUNWLGFBQU8sQ0FBQyxLQUFLLFdBQUwsRUFBRCxJQUF1QixLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLEtBQTBCLHNCQUFXLE9BQVgsQ0FEOUM7Ozs7b0NBR0k7QUFDZCxhQUFPLENBQUMsS0FBSyxXQUFMLEVBQUQsSUFBdUIsS0FBSyxLQUFMLENBQVcsSUFBWCxLQUFvQixxQkFBVSxJQUFWLENBRHBDOzs7O3VDQUdHO0FBQ2pCLGFBQU8sQ0FBQyxLQUFLLFdBQUwsRUFBRCxJQUF1QixLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLEtBQTBCLHNCQUFXLGNBQVgsQ0FEdkM7Ozs7bUNBR0o7QUFDYixhQUFPLENBQUMsS0FBSyxXQUFMLEVBQUQsSUFBdUIsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixLQUEwQixzQkFBVyxVQUFYLENBRDNDOzs7O3NDQUdHO0FBQ2hCLGFBQU8sQ0FBQyxLQUFLLFdBQUwsRUFBRCxJQUF1QixLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLEtBQTBCLHNCQUFXLGFBQVgsQ0FEeEM7Ozs7MENBR0k7QUFDcEIsYUFBTyxDQUFDLEtBQUssV0FBTCxFQUFELElBQXVCLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsS0FBMEIsc0JBQVcsaUJBQVgsQ0FEcEM7Ozs7aUNBR1Q7QUFDWCxhQUFPLENBQUMsS0FBSyxXQUFMLEVBQUQsSUFBdUIsS0FBSyxLQUFMLENBQVcsSUFBWCxLQUFvQixxQkFBVSxRQUFWLENBRHZDOzs7O2tDQUdDO0FBQ1osYUFBTyxnQkFBSyxNQUFMLENBQVksS0FBSyxLQUFMLENBQW5CLENBRFk7Ozs7K0JBR0g7QUFDVCxhQUFPLEtBQUssV0FBTCxNQUFzQixLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsQ0FBZixFQUFrQixLQUFsQixDQUF3QixJQUF4QixLQUFpQyxxQkFBVSxNQUFWLENBRHJEOzs7OytCQUdBO0FBQ1QsYUFBTyxLQUFLLFdBQUwsTUFBc0IsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLENBQWYsRUFBa0IsS0FBbEIsQ0FBd0IsSUFBeEIsS0FBaUMscUJBQVUsTUFBVixDQURyRDs7OztpQ0FHRTtBQUNYLGFBQU8sS0FBSyxXQUFMLE1BQXNCLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxDQUFmLEVBQWtCLEtBQWxCLENBQXdCLElBQXhCLEtBQWlDLHFCQUFVLE1BQVYsQ0FEbkQ7Ozs7dUNBR007QUFDakIsYUFBTyxLQUFLLFdBQUwsTUFBc0IsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLENBQWYsRUFBa0IsR0FBbEIsT0FBNEIsSUFBNUIsQ0FEWjs7Ozs0QkFHWDtBQUNOLGFBQU8sQ0FBQyxLQUFLLFdBQUwsRUFBRCxJQUF1QixLQUFLLEtBQUwsQ0FBVyxJQUFYLEtBQW9CLHFCQUFVLEdBQVYsQ0FENUM7Ozs7K0JBR0c7QUFDVCxVQUFJLEtBQUssV0FBTCxFQUFKLEVBQXdCO0FBQ3RCLGVBQU8sS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlO2lCQUFTLE1BQU0sUUFBTjtTQUFULENBQWYsQ0FBMEMsSUFBMUMsQ0FBK0MsR0FBL0MsQ0FBUCxDQURzQjtPQUF4QjtBQUdBLFVBQUksS0FBSyxlQUFMLEVBQUosRUFBNEI7QUFDMUIsZUFBTyxNQUFNLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FEYTtPQUE1QjtBQUdBLFVBQUksS0FBSyxVQUFMLEVBQUosRUFBdUI7QUFDckIsZUFBTyxLQUFLLEdBQUwsRUFBUCxDQURxQjtPQUF2QjtBQUdBLGFBQU8sS0FBSyxLQUFMLENBQVcsS0FBWCxDQVZFOzs7O3VCQS9LRCxXQUF5QjtVQUFkLGdFQUFVLGtCQUFJOztBQUNqQyxhQUFPLElBQUksTUFBSixDQUFXLFNBQVgsRUFBc0IsUUFBUSxPQUFSLENBQTdCLENBRGlDOzs7OytCQUdMO1VBQWQsZ0VBQVUsa0JBQUk7O0FBQzVCLGFBQU8sSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLElBQVYsRUFBZ0IsT0FBTyxJQUFQLEVBQWxDLEVBQWdELFFBQVEsT0FBUixDQUF2RCxDQUQ0Qjs7OzsrQkFHWixXQUF5QjtVQUFkLGdFQUFVLGtCQUFJOztBQUN6QyxhQUFPLElBQUksTUFBSixDQUFXLEVBQUMsTUFBTSxxQkFBVSxNQUFWLEVBQWtCLE9BQU8sU0FBUCxFQUFwQyxFQUF1RCxRQUFRLE9BQVIsQ0FBOUQsQ0FEeUM7Ozs7K0JBR3pCLFdBQXlCO1VBQWQsZ0VBQVUsa0JBQUk7O0FBQ3pDLGFBQU8sSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQVYsRUFBa0IsS0FBSyxTQUFMLEVBQXBDLEVBQXFELFFBQVEsT0FBUixDQUE1RCxDQUR5Qzs7OzttQ0FHckIsV0FBeUI7VUFBZCxnRUFBVSxrQkFBSTs7QUFDN0MsYUFBTyxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0sRUFBQyxPQUFPLHNCQUFXLFVBQVgsRUFBdUIsTUFBTSxTQUFOLEVBQXJDLEVBQXVELE9BQU8sU0FBUCxFQUFuRSxFQUFzRixRQUFRLE9BQVIsQ0FBN0YsQ0FENkM7Ozs7Z0NBRzVCLFdBQXlCO1VBQWQsZ0VBQVUsa0JBQUk7O0FBQzFDLGFBQU8sSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLEVBQUMsT0FBTyxzQkFBVyxPQUFYLEVBQW9CLE1BQU0sU0FBTixFQUFsQyxFQUFvRCxPQUFPLFNBQVAsRUFBaEUsRUFBbUYsUUFBUSxPQUFSLENBQTFGLENBRDBDOzs7O21DQUd0QixXQUF5QjtVQUFkLGdFQUFVLGtCQUFJOztBQUM3QyxhQUFPLElBQUksTUFBSixDQUFXLEVBQUMsTUFBTSxxQkFBVSxVQUFWLEVBQXNCLE9BQU8sU0FBUCxFQUF4QyxFQUEyRCxRQUFRLE9BQVIsQ0FBbEUsQ0FENkM7Ozs7MENBR2xCLFdBQXlCO1VBQWQsZ0VBQVUsa0JBQUk7O0FBQ3BELGFBQU8sSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQVYsRUFBa0IsT0FBTyxTQUFQLEVBQXBDLEVBQXVELFFBQVEsT0FBUixDQUE5RCxDQURvRDs7OzsrQkFHcEMsV0FBeUI7VUFBZCxnRUFBVSxrQkFBSTs7QUFDekMsVUFBSSxXQUFXLElBQUksTUFBSixDQUFXLEVBQUMsTUFBTSxxQkFBVSxNQUFWLEVBQWtCLE9BQU8sR0FBUCxFQUFwQyxDQUFYLENBRHFDO0FBRXpDLFVBQUksWUFBWSxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBVixFQUFrQixPQUFPLEdBQVAsRUFBcEMsQ0FBWixDQUZxQztBQUd6QyxhQUFPLElBQUksTUFBSixDQUFXLGdCQUFLLEVBQUwsQ0FBUSxRQUFSLEVBQWtCLE1BQWxCLENBQXlCLFNBQXpCLEVBQW9DLElBQXBDLENBQXlDLFNBQXpDLENBQVgsRUFBZ0UsUUFBUSxPQUFSLENBQXZFLENBSHlDOzs7O2lDQUt2QixXQUF5QjtVQUFkLGdFQUFVLGtCQUFJOztBQUMzQyxVQUFJLFdBQVcsSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQVYsRUFBa0IsT0FBTyxHQUFQLEVBQXBDLENBQVgsQ0FEdUM7QUFFM0MsVUFBSSxZQUFZLElBQUksTUFBSixDQUFXLEVBQUMsTUFBTSxxQkFBVSxNQUFWLEVBQWtCLE9BQU8sR0FBUCxFQUFwQyxDQUFaLENBRnVDO0FBRzNDLGFBQU8sSUFBSSxNQUFKLENBQVcsZ0JBQUssRUFBTCxDQUFRLFFBQVIsRUFBa0IsTUFBbEIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBcEMsQ0FBeUMsU0FBekMsQ0FBWCxFQUFnRSxRQUFRLE9BQVIsQ0FBdkUsQ0FIMkM7Ozs7K0JBSzNCLFdBQXlCO1VBQWQsZ0VBQVUsa0JBQUk7O0FBQ3pDLFVBQUksV0FBVyxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBVixFQUFrQixPQUFPLEdBQVAsRUFBcEMsQ0FBWCxDQURxQztBQUV6QyxVQUFJLFlBQVksSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQVYsRUFBa0IsT0FBTyxHQUFQLEVBQXBDLENBQVosQ0FGcUM7QUFHekMsYUFBTyxJQUFJLE1BQUosQ0FBVyxnQkFBSyxFQUFMLENBQVEsUUFBUixFQUFrQixNQUFsQixDQUF5QixTQUF6QixFQUFvQyxJQUFwQyxDQUF5QyxTQUF6QyxDQUFYLEVBQWdFLFFBQVEsT0FBUixDQUF2RSxDQUh5Qzs7OztTQXpDeEIiLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcFwiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuY29uc3QgSnVzdF82NDEgPSBNYXliZS5KdXN0O1xuY29uc3QgTm90aGluZ182NDIgPSBNYXliZS5Ob3RoaW5nO1xuaW1wb3J0IHtUb2tlblR5cGUsIFRva2VuQ2xhc3N9IGZyb20gXCJzaGlmdC1wYXJzZXIvZGlzdC90b2tlbml6ZXJcIjtcbmZ1bmN0aW9uIHNpemVEZWNlbmRpbmdfNjQzKGFfNjQ0LCBiXzY0NSkge1xuICBpZiAoYV82NDQuc2NvcGVzLnNpemUgPiBiXzY0NS5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIGlmIChiXzY0NS5zY29wZXMuc2l6ZSA+IGFfNjQ0LnNjb3Blcy5zaXplKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bnRheCB7XG4gIGNvbnN0cnVjdG9yKHRva2VuXzY0NiwgY29udGV4dF82NDcgPSB7YmluZGluZ3M6IG5ldyBCaW5kaW5nTWFwLCBzY29wZXNldDogTGlzdCgpfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbl82NDY7XG4gICAgdGhpcy5jb250ZXh0ID0ge2JpbmRpbmdzOiBjb250ZXh0XzY0Ny5iaW5kaW5ncywgc2NvcGVzZXQ6IGNvbnRleHRfNjQ3LnNjb3Blc2V0fTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMuY29udGV4dCk7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICBzdGF0aWMgb2YodG9rZW5fNjQ4LCBzdHhfNjQ5ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl82NDgsIHN0eF82NDkuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21OdWxsKHN0eF82NTAgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTlVMTCwgdmFsdWU6IG51bGx9LCBzdHhfNjUwLmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tTnVtYmVyKHZhbHVlXzY1MSwgc3R4XzY1MiA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5OVU1CRVIsIHZhbHVlOiB2YWx1ZV82NTF9LCBzdHhfNjUyLmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tU3RyaW5nKHZhbHVlXzY1Mywgc3R4XzY1NCA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5TVFJJTkcsIHN0cjogdmFsdWVfNjUzfSwgc3R4XzY1NC5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbVB1bmN0dWF0b3IodmFsdWVfNjU1LCBzdHhfNjU2ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZToge2tsYXNzOiBUb2tlbkNsYXNzLlB1bmN0dWF0b3IsIG5hbWU6IHZhbHVlXzY1NX0sIHZhbHVlOiB2YWx1ZV82NTV9LCBzdHhfNjU2LmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tS2V5d29yZCh2YWx1ZV82NTcsIHN0eF82NTggPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuS2V5d29yZCwgbmFtZTogdmFsdWVfNjU3fSwgdmFsdWU6IHZhbHVlXzY1N30sIHN0eF82NTguY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21JZGVudGlmaWVyKHZhbHVlXzY1OSwgc3R4XzY2MCA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLCB2YWx1ZTogdmFsdWVfNjU5fSwgc3R4XzY2MC5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbVJlZ3VsYXJFeHByZXNzaW9uKHZhbHVlXzY2MSwgc3R4XzY2MiA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SRUdFWFAsIHZhbHVlOiB2YWx1ZV82NjF9LCBzdHhfNjYyLmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tQnJhY2VzKGlubmVyXzY2Mywgc3R4XzY2NCA9IHt9KSB7XG4gICAgbGV0IGxlZnRfNjY1ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDRSwgdmFsdWU6IFwie1wifSk7XG4gICAgbGV0IHJpZ2h0XzY2NiA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0UsIHZhbHVlOiBcIn1cIn0pO1xuICAgIHJldHVybiBuZXcgU3ludGF4KExpc3Qub2YobGVmdF82NjUpLmNvbmNhdChpbm5lcl82NjMpLnB1c2gocmlnaHRfNjY2KSwgc3R4XzY2NC5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbUJyYWNrZXRzKGlubmVyXzY2Nywgc3R4XzY2OCA9IHt9KSB7XG4gICAgbGV0IGxlZnRfNjY5ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDSywgdmFsdWU6IFwiW1wifSk7XG4gICAgbGV0IHJpZ2h0XzY3MCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0ssIHZhbHVlOiBcIl1cIn0pO1xuICAgIHJldHVybiBuZXcgU3ludGF4KExpc3Qub2YobGVmdF82NjkpLmNvbmNhdChpbm5lcl82NjcpLnB1c2gocmlnaHRfNjcwKSwgc3R4XzY2OC5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbVBhcmVucyhpbm5lcl82NzEsIHN0eF82NzIgPSB7fSkge1xuICAgIGxldCBsZWZ0XzY3MyA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5MUEFSRU4sIHZhbHVlOiBcIihcIn0pO1xuICAgIGxldCByaWdodF82NzQgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUlBBUkVOLCB2YWx1ZTogXCIpXCJ9KTtcbiAgICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfNjczKS5jb25jYXQoaW5uZXJfNjcxKS5wdXNoKHJpZ2h0XzY3NCksIHN0eF82NzIuY29udGV4dCk7XG4gIH1cbiAgcmVzb2x2ZSgpIHtcbiAgICBpZiAodGhpcy5jb250ZXh0LnNjb3Blc2V0LnNpemUgPT09IDAgfHwgISh0aGlzLmlzSWRlbnRpZmllcigpIHx8IHRoaXMuaXNLZXl3b3JkKCkpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgICB9XG4gICAgbGV0IHNjb3BlXzY3NSA9IHRoaXMuY29udGV4dC5zY29wZXNldC5sYXN0KCk7XG4gICAgbGV0IHN0eFNjb3Blc182NzYgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQ7XG4gICAgbGV0IGJpbmRpbmdzXzY3NyA9IHRoaXMuY29udGV4dC5iaW5kaW5ncztcbiAgICBpZiAoc2NvcGVfNjc1KSB7XG4gICAgICBsZXQgc2NvcGVzZXRCaW5kaW5nTGlzdCA9IGJpbmRpbmdzXzY3Ny5nZXQodGhpcyk7XG4gICAgICBpZiAoc2NvcGVzZXRCaW5kaW5nTGlzdCkge1xuICAgICAgICBsZXQgYmlnZ2VzdEJpbmRpbmdQYWlyID0gc2NvcGVzZXRCaW5kaW5nTGlzdC5maWx0ZXIoKHtzY29wZXMsIGJpbmRpbmd9KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHNjb3Blcy5pc1N1YnNldChzdHhTY29wZXNfNjc2KTtcbiAgICAgICAgfSkuc29ydChzaXplRGVjZW5kaW5nXzY0Myk7XG4gICAgICAgIGlmIChiaWdnZXN0QmluZGluZ1BhaXIuc2l6ZSA+PSAyICYmIGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuc2NvcGVzLnNpemUgPT09IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMSkuc2NvcGVzLnNpemUpIHtcbiAgICAgICAgICBsZXQgZGVidWdCYXNlID0gXCJ7XCIgKyBzdHhTY29wZXNfNjc2Lm1hcChzXzY3OCA9PiBzXzY3OC50b1N0cmluZygpKS5qb2luKFwiLCBcIikgKyBcIn1cIjtcbiAgICAgICAgICBsZXQgZGVidWdBbWJpZ291c1Njb3Blc2V0cyA9IGJpZ2dlc3RCaW5kaW5nUGFpci5tYXAoKHtzY29wZXN9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXCJ7XCIgKyBzY29wZXMubWFwKHNfNjc5ID0+IHNfNjc5LnRvU3RyaW5nKCkpLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuICAgICAgICAgIH0pLmpvaW4oXCIsIFwiKTtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY29wZXNldCBcIiArIGRlYnVnQmFzZSArIFwiIGhhcyBhbWJpZ3VvdXMgc3Vic2V0cyBcIiArIGRlYnVnQW1iaWdvdXNTY29wZXNldHMpO1xuICAgICAgICB9IGVsc2UgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplICE9PSAwKSB7XG4gICAgICAgICAgbGV0IGJpbmRpbmdTdHIgPSBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmJpbmRpbmcudG9TdHJpbmcoKTtcbiAgICAgICAgICBpZiAoTWF5YmUuaXNKdXN0KGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYWxpYXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcy5nZXRPckVsc2UobnVsbCkucmVzb2x2ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYmluZGluZ1N0cjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxuICB2YWwoKSB7XG4gICAgYXNzZXJ0KCF0aGlzLmlzRGVsaW1pdGVyKCksIFwiY2Fubm90IGdldCB0aGUgdmFsIG9mIGEgZGVsaW1pdGVyXCIpO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zdHI7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGVtcGxhdGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uaXRlbXMubWFwKGVsXzY4MCA9PiB7XG4gICAgICAgIGlmIChlbF82ODAgaW5zdGFuY2VvZiBTeW50YXggJiYgZWxfNjgwLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgICAgICByZXR1cm4gXCIkey4uLn1cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxfNjgwLnNsaWNlLnRleHQ7XG4gICAgICB9KS5qb2luKFwiXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxuICBsaW5lTnVtYmVyKCkge1xuICAgIGlmICghdGhpcy5pc0RlbGltaXRlcigpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZS5zdGFydExvY2F0aW9uLmxpbmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLmdldCgwKS5saW5lTnVtYmVyKCk7XG4gICAgfVxuICB9XG4gIGlubmVyKCkge1xuICAgIGFzc2VydCh0aGlzLmlzRGVsaW1pdGVyKCksIFwiY2FuIG9ubHkgZ2V0IHRoZSBpbm5lciBvZiBhIGRlbGltaXRlclwiKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZSgxLCB0aGlzLnRva2VuLnNpemUgLSAxKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV82ODEsIGJpbmRpbmdzXzY4Miwgb3B0aW9uc182ODMgPSB7ZmxpcDogZmFsc2V9KSB7XG4gICAgbGV0IHRva2VuXzY4NCA9IHRoaXMuaXNEZWxpbWl0ZXIoKSA/IHRoaXMudG9rZW4ubWFwKHNfNjg2ID0+IHNfNjg2LmFkZFNjb3BlKHNjb3BlXzY4MSwgYmluZGluZ3NfNjgyLCBvcHRpb25zXzY4MykpIDogdGhpcy50b2tlbjtcbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKCkpIHtcbiAgICAgIHRva2VuXzY4NCA9IHt0eXBlOiB0aGlzLnRva2VuLnR5cGUsIGl0ZW1zOiB0b2tlbl82ODQuaXRlbXMubWFwKGl0XzY4NyA9PiB7XG4gICAgICAgIGlmIChpdF82ODcgaW5zdGFuY2VvZiBTeW50YXggJiYgaXRfNjg3LmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgICAgICByZXR1cm4gaXRfNjg3LmFkZFNjb3BlKHNjb3BlXzY4MSwgYmluZGluZ3NfNjgyLCBvcHRpb25zXzY4Myk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0XzY4NztcbiAgICAgIH0pfTtcbiAgICB9XG4gICAgbGV0IG5ld1Njb3Blc2V0XzY4NTtcbiAgICBpZiAob3B0aW9uc182ODMuZmxpcCkge1xuICAgICAgbGV0IGluZGV4ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LmluZGV4T2Yoc2NvcGVfNjgxKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbmV3U2NvcGVzZXRfNjg1ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LnJlbW92ZShpbmRleCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTY29wZXNldF82ODUgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucHVzaChzY29wZV82ODEpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdTY29wZXNldF82ODUgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucHVzaChzY29wZV82ODEpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl82ODQsIHtiaW5kaW5nczogYmluZGluZ3NfNjgyLCBzY29wZXNldDogbmV3U2NvcGVzZXRfNjg1fSk7XG4gIH1cbiAgcmVtb3ZlU2NvcGUoc2NvcGVfNjg4KSB7XG4gICAgbGV0IHRva2VuXzY4OSA9IHRoaXMuaXNEZWxpbWl0ZXIoKSA/IHRoaXMudG9rZW4ubWFwKHNfNjkyID0+IHNfNjkyLnJlbW92ZVNjb3BlKHNjb3BlXzY4OCkpIDogdGhpcy50b2tlbjtcbiAgICBsZXQgbmV3U2NvcGVzZXRfNjkwID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0O1xuICAgIGxldCBpbmRleF82OTEgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQuaW5kZXhPZihzY29wZV82ODgpO1xuICAgIGlmIChpbmRleF82OTEgIT09IC0xKSB7XG4gICAgICBuZXdTY29wZXNldF82OTAgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucmVtb3ZlKGluZGV4XzY5MSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzY4OSwge2JpbmRpbmdzOiB0aGlzLmNvbnRleHQuYmluZGluZ3MsIHNjb3Blc2V0OiBuZXdTY29wZXNldF82OTB9KTtcbiAgfVxuICBpc0lkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLklkZW50O1xuICB9XG4gIGlzQXNzaWduKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkFTU0lHTjtcbiAgfVxuICBpc0Jvb2xlYW5MaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLlRSVUUgfHwgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuRkFMU0U7XG4gIH1cbiAgaXNLZXl3b3JkKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5LZXl3b3JkO1xuICB9XG4gIGlzTnVsbExpdGVyYWwoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTlVMTDtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5OdW1lcmljTGl0ZXJhbDtcbiAgfVxuICBpc1B1bmN0dWF0b3IoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlB1bmN0dWF0b3I7XG4gIH1cbiAgaXNTdHJpbmdMaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5TdHJpbmdMaXRlcmFsO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24oKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlJlZ3VsYXJFeHByZXNzaW9uO1xuICB9XG4gIGlzVGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuVEVNUExBVEU7XG4gIH1cbiAgaXNEZWxpbWl0ZXIoKSB7XG4gICAgcmV0dXJuIExpc3QuaXNMaXN0KHRoaXMudG9rZW4pO1xuICB9XG4gIGlzUGFyZW5zKCkge1xuICAgIHJldHVybiB0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi5nZXQoMCkudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkxQQVJFTjtcbiAgfVxuICBpc0JyYWNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0U7XG4gIH1cbiAgaXNCcmFja2V0cygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0s7XG4gIH1cbiAgaXNTeW50YXhUZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnZhbCgpID09PSBcIiNgXCI7XG4gIH1cbiAgaXNFT0YoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuRU9TO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLm1hcChzXzY5MyA9PiBzXzY5My50b1N0cmluZygpKS5qb2luKFwiIFwiKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKCkpIHtcbiAgICAgIHJldHVybiBcIidcIiArIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxufVxuIl19