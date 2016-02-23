"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require("immutable");

var _symbol = require("./symbol");

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

var Just = _ramdaFantasy.Maybe.Just;
var Nothing = _ramdaFantasy.Maybe.Nothing;

function sizeDecending(a, b) {
  if (a.scopes.size > b.scopes.size) {
    return -1;
  } else if (b.scopes.size > a.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}

var Syntax = function () {
  // (Token or List<Syntax>, List<Scope>) -> Syntax

  function Syntax(token) {
    var context = arguments.length <= 1 || arguments[1] === undefined ? { bindings: new _bindingMap2.default(), scopeset: (0, _immutable.List)() } : arguments[1];

    _classCallCheck(this, Syntax);

    this.token = token;
    this.context = {
      bindings: context.bindings,
      scopeset: context.scopeset
    };
    Object.freeze(this.context);
    Object.freeze(this);
  }

  _createClass(Syntax, [{
    key: "resolve",


    // () -> string
    value: function resolve() {
      if (this.context.scopeset.size === 0 || !(this.isIdentifier() || this.isKeyword())) {
        return this.token.value;
      }
      var scope = this.context.scopeset.last();
      var stxScopes = this.context.scopeset;
      var bindings = this.context.bindings;
      if (scope) {
        // List<{ scopes: List<Scope>, binding: Symbol }>
        var scopesetBindingList = bindings.get(this);

        if (scopesetBindingList) {
          // { scopes: List<Scope>, binding: Symbol }
          var biggestBindingPair = scopesetBindingList.filter(function (_ref) {
            var scopes = _ref.scopes;
            var binding = _ref.binding;

            return scopes.isSubset(stxScopes);
          }).sort(sizeDecending);

          if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
            var debugBase = '{' + stxScopes.map(function (s) {
              return s.toString();
            }).join(', ') + '}';
            var debugAmbigousScopesets = biggestBindingPair.map(function (_ref2) {
              var scopes = _ref2.scopes;

              return '{' + scopes.map(function (s) {
                return s.toString();
              }).join(', ') + '}';
            }).join(', ');
            throw new Error('Scopeset ' + debugBase + ' has ambiguous subsets ' + debugAmbigousScopesets);
          } else if (biggestBindingPair.size !== 0) {
            var bindingStr = biggestBindingPair.get(0).binding.toString();
            if (_ramdaFantasy.Maybe.isJust(biggestBindingPair.get(0).alias)) {
              // null never happens because we just checked if it is a Just
              return biggestBindingPair.get(0).alias.getOrElse(null).resolve();
            }
            return bindingStr;
            // if (Maybe.isJust(biggestBindingPair.get(0).alias)) {
            //   return biggestBindingPair.get(0).alias.just().resolve();
            // }
            // return ;
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
        return this.token.items.map(function (el) {
          if (el instanceof Syntax && el.isDelimiter()) {
            return '${...}';
          }
          return el.slice.text;
        }).join('');
      }
      return this.token.value;
    }
  }, {
    key: "lineNumber",
    value: function lineNumber() {
      if (!this.isDelimiter()) {
        return this.token.slice.startLocation.line;
      } else {
        // TODO: this is the start of the delimiter...correct?
        return this.token.get(0).lineNumber();
      }
    }

    // () -> List<Syntax>

  }, {
    key: "inner",
    value: function inner() {
      (0, _errors.assert)(this.isDelimiter(), "can only get the inner of a delimiter");
      return this.token.slice(1, this.token.size - 1);
    }
  }, {
    key: "addScope",
    value: function addScope(scope, bindings) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? { flip: false } : arguments[2];

      var token = this.isDelimiter() ? this.token.map(function (s) {
        return s.addScope(scope, bindings, options);
      }) : this.token;
      if (this.isTemplate()) {
        token = {
          type: this.token.type,
          items: token.items.map(function (it) {
            if (it instanceof Syntax && it.isDelimiter()) {
              return it.addScope(scope, bindings, options);
            }
            return it;
          })
        };
      }
      var newScopeset = undefined;
      // TODO: clean this logic up
      if (options.flip) {
        var index = this.context.scopeset.indexOf(scope);
        if (index !== -1) {
          newScopeset = this.context.scopeset.remove(index);
        } else {
          newScopeset = this.context.scopeset.push(scope);
        }
      } else {
        newScopeset = this.context.scopeset.push(scope);
      }
      return new Syntax(token, { bindings: bindings, scopeset: newScopeset });
    }
  }, {
    key: "removeScope",
    value: function removeScope(scope) {
      var token = this.isDelimiter() ? this.token.map(function (s) {
        return s.removeScope(scope);
      }) : this.token;
      var newScopeset = this.context.scopeset;
      var index = this.context.scopeset.indexOf(scope);
      if (index !== -1) {
        newScopeset = this.context.scopeset.remove(index);
      }
      return new Syntax(token, { bindings: this.context.bindings, scopeset: newScopeset });
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
      return this.isDelimiter() && this.token.get(0).val() === '#`';
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
    value: function of(token) {
      var stx = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax(token, stx.context);
    }
  }, {
    key: "fromNumber",
    value: function fromNumber(value) {
      var stx = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({
        type: _tokenizer.TokenType.NUMBER,
        value: value
      }, stx.context);
    }
  }, {
    key: "fromString",
    value: function fromString(value) {
      var stx = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({
        type: _tokenizer.TokenType.STRING,
        str: value
      }, stx.context);
    }
  }, {
    key: "fromIdentifier",
    value: function fromIdentifier(value) {
      var stx = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Syntax({
        type: _tokenizer.TokenType.IDENTIFIER,
        value: value
      }, stx.context);
    }
  }, {
    key: "fromBraces",
    value: function fromBraces(inner) {
      var stx = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left = new Syntax({
        type: _tokenizer.TokenType.LBRACE,
        value: "{"
      });
      var right = new Syntax({
        type: _tokenizer.TokenType.RBRACE,
        value: "}"
      });
      return new Syntax(_immutable.List.of(left).concat(inner).push(right), stx.context);
    }
  }, {
    key: "fromBrackets",
    value: function fromBrackets(inner) {
      var stx = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left = new Syntax({
        type: _tokenizer.TokenType.LBRACK,
        value: "["
      });
      var right = new Syntax({
        type: _tokenizer.TokenType.RBRACK,
        value: "]"
      });
      return new Syntax(_immutable.List.of(left).concat(inner).push(right), stx.context);
    }
  }, {
    key: "fromParens",
    value: function fromParens(inner) {
      var stx = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left = new Syntax({
        type: _tokenizer.TokenType.LPAREN,
        value: "("
      });
      var right = new Syntax({
        type: _tokenizer.TokenType.RPAREN,
        value: ")"
      });
      return new Syntax(_immutable.List.of(left).concat(inner).push(right), stx.context);
    }
  }]);

  return Syntax;
}();

exports.default = Syntax;
//# sourceMappingURL=syntax.js.map
