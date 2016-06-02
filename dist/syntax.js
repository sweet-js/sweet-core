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

var Syntax = function () {
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
      var newScopeset_692 = void 0;
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
}();

exports.default = Syntax;
//# sourceMappingURL=data:application/json;base64,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QUFRLFFBQVIsRUFBa0IsTUFBbEIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBcEMsQ0FBeUMsU0FBekMsQ0FBWCxFQUFnRSxRQUFRLE9BQXhFLENBQVA7QUFDRDs7O2lDQUNtQixTLEVBQXlCO0FBQUEsVUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQzNDLFVBQUksV0FBVyxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxHQUFoQyxFQUFYLENBQWY7QUFDQSxVQUFJLFlBQVksSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQXlCLE9BQU8sR0FBaEMsRUFBWCxDQUFoQjtBQUNBLGFBQU8sSUFBSSxNQUFKLENBQVcsZ0JBQUssRUFBTCxDQUFRLFFBQVIsRUFBa0IsTUFBbEIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBcEMsQ0FBeUMsU0FBekMsQ0FBWCxFQUFnRSxRQUFRLE9BQXhFLENBQVA7QUFDRDs7OytCQUNpQixTLEVBQXlCO0FBQUEsVUFBZCxPQUFjLHlEQUFKLEVBQUk7O0FBQ3pDLFVBQUksV0FBVyxJQUFJLE1BQUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxHQUFoQyxFQUFYLENBQWY7QUFDQSxVQUFJLFlBQVksSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQWpCLEVBQXlCLE9BQU8sR0FBaEMsRUFBWCxDQUFoQjtBQUNBLGFBQU8sSUFBSSxNQUFKLENBQVcsZ0JBQUssRUFBTCxDQUFRLFFBQVIsRUFBa0IsTUFBbEIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBcEMsQ0FBeUMsU0FBekMsQ0FBWCxFQUFnRSxRQUFRLE9BQXhFLENBQVA7QUFDRDs7Ozs7O2tCQTdDa0IsTSIsImZpbGUiOiJzeW50YXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7YXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwXCI7XG5pbXBvcnQge01heWJlfSBmcm9tIFwicmFtZGEtZmFudGFzeVwiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5jb25zdCBKdXN0XzY0NSA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzY0NiA9IE1heWJlLk5vdGhpbmc7XG5pbXBvcnQge1Rva2VuVHlwZSwgVG9rZW5DbGFzc30gZnJvbSBcInNoaWZ0LXBhcnNlci9kaXN0L3Rva2VuaXplclwiO1xuZnVuY3Rpb24gc2l6ZURlY2VuZGluZ182NDcoYV82NDgsIGJfNjQ5KSB7XG4gIGlmIChhXzY0OC5zY29wZXMuc2l6ZSA+IGJfNjQ5LnNjb3Blcy5zaXplKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9IGVsc2UgaWYgKGJfNjQ5LnNjb3Blcy5zaXplID4gYV82NDguc2NvcGVzLnNpemUpIHtcbiAgICByZXR1cm4gMTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gMDtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3ludGF4IHtcbiAgY29uc3RydWN0b3IodG9rZW5fNjUwLCBjb250ZXh0XzY1MSA9IHtiaW5kaW5nczogbmV3IEJpbmRpbmdNYXAsIHNjb3Blc2V0OiBMaXN0KCl9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuXzY1MDtcbiAgICB0aGlzLmNvbnRleHQgPSB7YmluZGluZ3M6IGNvbnRleHRfNjUxLmJpbmRpbmdzLCBzY29wZXNldDogY29udGV4dF82NTEuc2NvcGVzZXR9O1xuICAgIE9iamVjdC5mcmVlemUodGhpcy5jb250ZXh0KTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG4gIHN0YXRpYyBvZih0b2tlbl82NTIsIHN0eF82NTMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzY1Miwgc3R4XzY1My5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bGwoc3R4XzY1NCA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5OVUxMLCB2YWx1ZTogbnVsbH0sIHN0eF82NTQuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21OdW1iZXIodmFsdWVfNjU1LCBzdHhfNjU2ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTUJFUiwgdmFsdWU6IHZhbHVlXzY1NX0sIHN0eF82NTYuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21TdHJpbmcodmFsdWVfNjU3LCBzdHhfNjU4ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlNUUklORywgc3RyOiB2YWx1ZV82NTd9LCBzdHhfNjU4LmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tUHVuY3R1YXRvcih2YWx1ZV82NTksIHN0eF82NjAgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuUHVuY3R1YXRvciwgbmFtZTogdmFsdWVfNjU5fSwgdmFsdWU6IHZhbHVlXzY1OX0sIHN0eF82NjAuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21LZXl3b3JkKHZhbHVlXzY2MSwgc3R4XzY2MiA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IHtrbGFzczogVG9rZW5DbGFzcy5LZXl3b3JkLCBuYW1lOiB2YWx1ZV82NjF9LCB2YWx1ZTogdmFsdWVfNjYxfSwgc3R4XzY2Mi5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbUlkZW50aWZpZXIodmFsdWVfNjYzLCBzdHhfNjY0ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLklERU5USUZJRVIsIHZhbHVlOiB2YWx1ZV82NjN9LCBzdHhfNjY0LmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tUmVndWxhckV4cHJlc3Npb24odmFsdWVfNjY1LCBzdHhfNjY2ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJFR0VYUCwgdmFsdWU6IHZhbHVlXzY2NX0sIHN0eF82NjYuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21CcmFjZXMoaW5uZXJfNjY3LCBzdHhfNjY4ID0ge30pIHtcbiAgICBsZXQgbGVmdF82NjkgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNFLCB2YWx1ZTogXCJ7XCJ9KTtcbiAgICBsZXQgcmlnaHRfNjcwID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJCUkFDRSwgdmFsdWU6IFwifVwifSk7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0XzY2OSkuY29uY2F0KGlubmVyXzY2NykucHVzaChyaWdodF82NzApLCBzdHhfNjY4LmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tQnJhY2tldHMoaW5uZXJfNjcxLCBzdHhfNjcyID0ge30pIHtcbiAgICBsZXQgbGVmdF82NzMgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTEJSQUNLLCB2YWx1ZTogXCJbXCJ9KTtcbiAgICBsZXQgcmlnaHRfNjc0ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJCUkFDSywgdmFsdWU6IFwiXVwifSk7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0XzY3MykuY29uY2F0KGlubmVyXzY3MSkucHVzaChyaWdodF82NzQpLCBzdHhfNjcyLmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tUGFyZW5zKGlubmVyXzY3NSwgc3R4XzY3NiA9IHt9KSB7XG4gICAgbGV0IGxlZnRfNjc3ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxQQVJFTiwgdmFsdWU6IFwiKFwifSk7XG4gICAgbGV0IHJpZ2h0XzY3OCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SUEFSRU4sIHZhbHVlOiBcIilcIn0pO1xuICAgIHJldHVybiBuZXcgU3ludGF4KExpc3Qub2YobGVmdF82NzcpLmNvbmNhdChpbm5lcl82NzUpLnB1c2gocmlnaHRfNjc4KSwgc3R4XzY3Ni5jb250ZXh0KTtcbiAgfVxuICByZXNvbHZlKCkge1xuICAgIGlmICh0aGlzLmNvbnRleHQuc2NvcGVzZXQuc2l6ZSA9PT0gMCB8fCAhKHRoaXMuaXNJZGVudGlmaWVyKCkgfHwgdGhpcy5pc0tleXdvcmQoKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICAgIH1cbiAgICBsZXQgc2NvcGVfNjc5ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0Lmxhc3QoKTtcbiAgICBsZXQgc3R4U2NvcGVzXzY4MCA9IHRoaXMuY29udGV4dC5zY29wZXNldDtcbiAgICBsZXQgYmluZGluZ3NfNjgxID0gdGhpcy5jb250ZXh0LmJpbmRpbmdzO1xuICAgIGlmIChzY29wZV82NzkpIHtcbiAgICAgIGxldCBzY29wZXNldEJpbmRpbmdMaXN0ID0gYmluZGluZ3NfNjgxLmdldCh0aGlzKTtcbiAgICAgIGlmIChzY29wZXNldEJpbmRpbmdMaXN0KSB7XG4gICAgICAgIGxldCBiaWdnZXN0QmluZGluZ1BhaXIgPSBzY29wZXNldEJpbmRpbmdMaXN0LmZpbHRlcigoe3Njb3BlcywgYmluZGluZ30pID0+IHtcbiAgICAgICAgICByZXR1cm4gc2NvcGVzLmlzU3Vic2V0KHN0eFNjb3Blc182ODApO1xuICAgICAgICB9KS5zb3J0KHNpemVEZWNlbmRpbmdfNjQ3KTtcbiAgICAgICAgaWYgKGJpZ2dlc3RCaW5kaW5nUGFpci5zaXplID49IDIgJiYgYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5zY29wZXMuc2l6ZSA9PT0gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgxKS5zY29wZXMuc2l6ZSkge1xuICAgICAgICAgIGxldCBkZWJ1Z0Jhc2UgPSBcIntcIiArIHN0eFNjb3Blc182ODAubWFwKHNfNjgyID0+IHNfNjgyLnRvU3RyaW5nKCkpLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuICAgICAgICAgIGxldCBkZWJ1Z0FtYmlnb3VzU2NvcGVzZXRzID0gYmlnZ2VzdEJpbmRpbmdQYWlyLm1hcCgoe3Njb3Blc30pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBcIntcIiArIHNjb3Blcy5tYXAoc182ODMgPT4gc182ODMudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgfSkuam9pbihcIiwgXCIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjb3Blc2V0IFwiICsgZGVidWdCYXNlICsgXCIgaGFzIGFtYmlndW91cyBzdWJzZXRzIFwiICsgZGVidWdBbWJpZ291c1Njb3Blc2V0cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmlnZ2VzdEJpbmRpbmdQYWlyLnNpemUgIT09IDApIHtcbiAgICAgICAgICBsZXQgYmluZGluZ1N0ciA9IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYmluZGluZy50b1N0cmluZygpO1xuICAgICAgICAgIGlmIChNYXliZS5pc0p1c3QoYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcykpIHtcbiAgICAgICAgICAgIHJldHVybiBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzLmdldE9yRWxzZShudWxsKS5yZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiaW5kaW5nU3RyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIHZhbCgpIHtcbiAgICBhc3NlcnQoIXRoaXMuaXNEZWxpbWl0ZXIoKSwgXCJjYW5ub3QgZ2V0IHRoZSB2YWwgb2YgYSBkZWxpbWl0ZXJcIik7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLnN0cjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUZW1wbGF0ZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5pdGVtcy5tYXAoZWxfNjg0ID0+IHtcbiAgICAgICAgaWYgKGVsXzY4NCBpbnN0YW5jZW9mIFN5bnRheCAmJiBlbF82ODQuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgICAgIHJldHVybiBcIiR7Li4ufVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbF82ODQuc2xpY2UudGV4dDtcbiAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIGxpbmVOdW1iZXIoKSB7XG4gICAgaWYgKCF0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLnNsaWNlLnN0YXJ0TG9jYXRpb24ubGluZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uZ2V0KDApLmxpbmVOdW1iZXIoKTtcbiAgICB9XG4gIH1cbiAgc2V0TGluZU51bWJlcihsaW5lXzY4NSkge1xuICAgIGxldCBuZXdUb2tfNjg2ID0ge307XG4gICAgaWYgKHRoaXMuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgbmV3VG9rXzY4NiA9IHRoaXMudG9rZW4ubWFwKHNfNjg3ID0+IHNfNjg3LnNldExpbmVOdW1iZXIobGluZV82ODUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKHRoaXMudG9rZW4pKSB7XG4gICAgICAgIG5ld1Rva182ODZba2V5XSA9IHRoaXMudG9rZW5ba2V5XTtcbiAgICAgIH1cbiAgICAgIGFzc2VydChuZXdUb2tfNjg2LnNsaWNlICYmIG5ld1Rva182ODYuc2xpY2Uuc3RhcnRMb2NhdGlvbiwgXCJhbGwgdG9rZW5zIG11c3QgaGF2ZSBsaW5lIGluZm9cIik7XG4gICAgICBuZXdUb2tfNjg2LnNsaWNlLnN0YXJ0TG9jYXRpb24ubGluZSA9IGxpbmVfNjg1O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheChuZXdUb2tfNjg2LCB0aGlzLmNvbnRleHQpO1xuICB9XG4gIGlubmVyKCkge1xuICAgIGFzc2VydCh0aGlzLmlzRGVsaW1pdGVyKCksIFwiY2FuIG9ubHkgZ2V0IHRoZSBpbm5lciBvZiBhIGRlbGltaXRlclwiKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbi5zbGljZSgxLCB0aGlzLnRva2VuLnNpemUgLSAxKTtcbiAgfVxuICBhZGRTY29wZShzY29wZV82ODgsIGJpbmRpbmdzXzY4OSwgb3B0aW9uc182OTAgPSB7ZmxpcDogZmFsc2V9KSB7XG4gICAgbGV0IHRva2VuXzY5MSA9IHRoaXMuaXNEZWxpbWl0ZXIoKSA/IHRoaXMudG9rZW4ubWFwKHNfNjkzID0+IHNfNjkzLmFkZFNjb3BlKHNjb3BlXzY4OCwgYmluZGluZ3NfNjg5LCBvcHRpb25zXzY5MCkpIDogdGhpcy50b2tlbjtcbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKCkpIHtcbiAgICAgIHRva2VuXzY5MSA9IHt0eXBlOiB0aGlzLnRva2VuLnR5cGUsIGl0ZW1zOiB0b2tlbl82OTEuaXRlbXMubWFwKGl0XzY5NCA9PiB7XG4gICAgICAgIGlmIChpdF82OTQgaW5zdGFuY2VvZiBTeW50YXggJiYgaXRfNjk0LmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgICAgICByZXR1cm4gaXRfNjk0LmFkZFNjb3BlKHNjb3BlXzY4OCwgYmluZGluZ3NfNjg5LCBvcHRpb25zXzY5MCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0XzY5NDtcbiAgICAgIH0pfTtcbiAgICB9XG4gICAgbGV0IG5ld1Njb3Blc2V0XzY5MjtcbiAgICBpZiAob3B0aW9uc182OTAuZmxpcCkge1xuICAgICAgbGV0IGluZGV4ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LmluZGV4T2Yoc2NvcGVfNjg4KTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbmV3U2NvcGVzZXRfNjkyID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LnJlbW92ZShpbmRleCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTY29wZXNldF82OTIgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucHVzaChzY29wZV82ODgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdTY29wZXNldF82OTIgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucHVzaChzY29wZV82ODgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl82OTEsIHtiaW5kaW5nczogYmluZGluZ3NfNjg5LCBzY29wZXNldDogbmV3U2NvcGVzZXRfNjkyfSk7XG4gIH1cbiAgcmVtb3ZlU2NvcGUoc2NvcGVfNjk1KSB7XG4gICAgbGV0IHRva2VuXzY5NiA9IHRoaXMuaXNEZWxpbWl0ZXIoKSA/IHRoaXMudG9rZW4ubWFwKHNfNjk5ID0+IHNfNjk5LnJlbW92ZVNjb3BlKHNjb3BlXzY5NSkpIDogdGhpcy50b2tlbjtcbiAgICBsZXQgbmV3U2NvcGVzZXRfNjk3ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0O1xuICAgIGxldCBpbmRleF82OTggPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQuaW5kZXhPZihzY29wZV82OTUpO1xuICAgIGlmIChpbmRleF82OTggIT09IC0xKSB7XG4gICAgICBuZXdTY29wZXNldF82OTcgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucmVtb3ZlKGluZGV4XzY5OCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3ludGF4KHRva2VuXzY5Niwge2JpbmRpbmdzOiB0aGlzLmNvbnRleHQuYmluZGluZ3MsIHNjb3Blc2V0OiBuZXdTY29wZXNldF82OTd9KTtcbiAgfVxuICBpc0lkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLklkZW50O1xuICB9XG4gIGlzQXNzaWduKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkFTU0lHTjtcbiAgfVxuICBpc0Jvb2xlYW5MaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLlRSVUUgfHwgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuRkFMU0U7XG4gIH1cbiAgaXNLZXl3b3JkKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5LZXl3b3JkO1xuICB9XG4gIGlzTnVsbExpdGVyYWwoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTlVMTDtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5OdW1lcmljTGl0ZXJhbDtcbiAgfVxuICBpc1B1bmN0dWF0b3IoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlB1bmN0dWF0b3I7XG4gIH1cbiAgaXNTdHJpbmdMaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5TdHJpbmdMaXRlcmFsO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24oKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlLmtsYXNzID09PSBUb2tlbkNsYXNzLlJlZ3VsYXJFeHByZXNzaW9uO1xuICB9XG4gIGlzVGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuVEVNUExBVEU7XG4gIH1cbiAgaXNEZWxpbWl0ZXIoKSB7XG4gICAgcmV0dXJuIExpc3QuaXNMaXN0KHRoaXMudG9rZW4pO1xuICB9XG4gIGlzUGFyZW5zKCkge1xuICAgIHJldHVybiB0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi5nZXQoMCkudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkxQQVJFTjtcbiAgfVxuICBpc0JyYWNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0U7XG4gIH1cbiAgaXNCcmFja2V0cygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MQlJBQ0s7XG4gIH1cbiAgaXNTeW50YXhUZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnZhbCgpID09PSBcIiNgXCI7XG4gIH1cbiAgaXNFT0YoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzRGVsaW1pdGVyKCkgJiYgdGhpcy50b2tlbi50eXBlID09PSBUb2tlblR5cGUuRU9TO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLm1hcChzXzcwMCA9PiBzXzcwMC50b1N0cmluZygpKS5qb2luKFwiIFwiKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKCkpIHtcbiAgICAgIHJldHVybiBcIidcIiArIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgfVxufVxuIl19