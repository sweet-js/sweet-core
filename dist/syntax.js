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

var Just_545 = _ramdaFantasy.Maybe.Just;var Nothing_546 = _ramdaFantasy.Maybe.Nothing;function sizeDecending_547(a_548, b_549) {
  if (a_548.scopes.size > b_549.scopes.size) {
    return -1;
  } else if (b_549.scopes.size > a_548.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}
var Syntax = function () {
  function Syntax(token_550) {
    var context_551 = arguments.length <= 1 || arguments[1] === undefined ? { bindings: new _bindingMap2.default(), scopeset: (0, _immutable.List)() } : arguments[1];

    _classCallCheck(this, Syntax);

    this.token = token_550;this.context = { bindings: context_551.bindings, scopeset: context_551.scopeset };Object.freeze(this.context);Object.freeze(this);
  }

  _createClass(Syntax, [{
    key: "resolve",
    value: function resolve() {
      if (this.context.scopeset.size === 0 || !(this.isIdentifier() || this.isKeyword())) {
        return this.token.value;
      }var scope_579 = this.context.scopeset.last();var stxScopes_580 = this.context.scopeset;var bindings_581 = this.context.bindings;if (scope_579) {
        var scopesetBindingList = bindings_581.get(this);if (scopesetBindingList) {
          var biggestBindingPair = scopesetBindingList.filter(function (_ref) {
            var scopes = _ref.scopes;
            var binding = _ref.binding;
            return scopes.isSubset(stxScopes_580);
          }).sort(sizeDecending_547);if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
            var debugBase = "{" + stxScopes_580.map(function (s) {
              return s.toString();
            }).join(", ") + "}";var debugAmbigousScopesets = biggestBindingPair.map(function (_ref2) {
              var scopes = _ref2.scopes;
              return "{" + scopes.map(function (s) {
                return s.toString();
              }).join(", ") + "}";
            }).join(", ");throw new Error("Scopeset " + debugBase + " has ambiguous subsets " + debugAmbigousScopesets);
          } else if (biggestBindingPair.size !== 0) {
            var bindingStr = biggestBindingPair.get(0).binding.toString();if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
              return biggestBindingPair.get(0).alias.getOrElse(null).resolve();
            }return bindingStr;
          }
        }
      }return this.token.value;
    }
  }, {
    key: "val",
    value: function val() {
      (0, _errors.assert)(!this.isDelimiter(), "cannot get the val of a delimiter");if (this.isStringLiteral()) {
        return this.token.str;
      }if (this.isTemplate()) {
        return this.token.items.map(function (el) {
          if (el instanceof Syntax && el.isDelimiter()) {
            return "${...}";
          }return el.slice.text;
        }).join("");
      }return this.token.value;
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
      (0, _errors.assert)(this.isDelimiter(), "can only get the inner of a delimiter");return this.token.slice(1, this.token.size - 1);
    }
  }, {
    key: "addScope",
    value: function addScope(scope_582, bindings_583) {
      var options_584 = arguments.length <= 2 || arguments[2] === undefined ? { flip: false } : arguments[2];
      var token_585 = this.isDelimiter() ? this.token.map(function (s) {
        return s.addScope(scope_582, bindings_583, options_584);
      }) : this.token;if (this.isTemplate()) {
        token_585 = { type: this.token.type, items: token_585.items.map(function (it) {
            if (it instanceof Syntax && it.isDelimiter()) {
              return it.addScope(scope_582, bindings_583, options_584);
            }return it;
          }) };
      }var newScopeset_586 = void 0;if (options_584.flip) {
        var index = this.context.scopeset.indexOf(scope_582);if (index !== -1) {
          newScopeset_586 = this.context.scopeset.remove(index);
        } else {
          newScopeset_586 = this.context.scopeset.push(scope_582);
        }
      } else {
        newScopeset_586 = this.context.scopeset.push(scope_582);
      }return new Syntax(token_585, { bindings: bindings_583, scopeset: newScopeset_586 });
    }
  }, {
    key: "removeScope",
    value: function removeScope(scope_587) {
      var token_588 = this.isDelimiter() ? this.token.map(function (s) {
        return s.removeScope(scope_587);
      }) : this.token;var newScopeset_589 = this.context.scopeset;var index_590 = this.context.scopeset.indexOf(scope_587);if (index_590 !== -1) {
        newScopeset_589 = this.context.scopeset.remove(index_590);
      }return new Syntax(token_588, { bindings: this.context.bindings, scopeset: newScopeset_589 });
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
        return this.token.map(function (s) {
          return s.toString();
        }).join(" ");
      }if (this.isStringLiteral()) {
        return "'" + this.token.str;
      }if (this.isTemplate()) {
        return this.val();
      }return this.token.value;
    }
  }], [{
    key: "of",
    value: function of(token_552) {
      var stx_553 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return new Syntax(token_552, stx_553.context);
    }
  }, {
    key: "fromNull",
    value: function fromNull() {
      var stx_554 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      return new Syntax({ type: _tokenizer.TokenType.NULL, value: null }, stx_554.context);
    }
  }, {
    key: "fromNumber",
    value: function fromNumber(value_555) {
      var stx_556 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return new Syntax({ type: _tokenizer.TokenType.NUMBER, value: value_555 }, stx_556.context);
    }
  }, {
    key: "fromString",
    value: function fromString(value_557) {
      var stx_558 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return new Syntax({ type: _tokenizer.TokenType.STRING, str: value_557 }, stx_558.context);
    }
  }, {
    key: "fromPunctuator",
    value: function fromPunctuator(value_559) {
      var stx_560 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return new Syntax({ type: { klass: _tokenizer.TokenClass.Punctuator, name: value_559 }, value: value_559 }, stx_560.context);
    }
  }, {
    key: "fromKeyword",
    value: function fromKeyword(value_561) {
      var stx_562 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return new Syntax({ type: { klass: _tokenizer.TokenClass.Keyword, name: value_561 }, value: value_561 }, stx_562.context);
    }
  }, {
    key: "fromIdentifier",
    value: function fromIdentifier(value_563) {
      var stx_564 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return new Syntax({ type: _tokenizer.TokenType.IDENTIFIER, value: value_563 }, stx_564.context);
    }
  }, {
    key: "fromRegularExpression",
    value: function fromRegularExpression(value_565) {
      var stx_566 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return new Syntax({ type: _tokenizer.TokenType.REGEXP, value: value_565 }, stx_566.context);
    }
  }, {
    key: "fromBraces",
    value: function fromBraces(inner_567) {
      var stx_568 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var left_569 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });var right_570 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });return new Syntax(_immutable.List.of(left_569).concat(inner_567).push(right_570), stx_568.context);
    }
  }, {
    key: "fromBrackets",
    value: function fromBrackets(inner_571) {
      var stx_572 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var left_573 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });var right_574 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });return new Syntax(_immutable.List.of(left_573).concat(inner_571).push(right_574), stx_572.context);
    }
  }, {
    key: "fromParens",
    value: function fromParens(inner_575) {
      var stx_576 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var left_577 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });var right_578 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });return new Syntax(_immutable.List.of(left_577).concat(inner_575).push(right_578), stx_576.context);
    }
  }]);

  return Syntax;
}();

exports.default = Syntax;
//# sourceMappingURL=syntax.js.map
