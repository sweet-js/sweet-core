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

var Just_545 = _ramdaFantasy.Maybe.Just;
var Nothing_546 = _ramdaFantasy.Maybe.Nothing;

function sizeDecending_547(a_548, b_549) {
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

    this.token = token_550;
    this.context = { bindings: context_551.bindings, scopeset: context_551.scopeset };
    Object.freeze(this.context);
    Object.freeze(this);
  }

  _createClass(Syntax, [{
    key: "resolve",
    value: function resolve() {
      if (this.context.scopeset.size === 0 || !(this.isIdentifier() || this.isKeyword())) {
        return this.token.value;
      }
      var scope_579 = this.context.scopeset.last();
      var stxScopes_580 = this.context.scopeset;
      var bindings_581 = this.context.bindings;
      if (scope_579) {
        var scopesetBindingList = bindings_581.get(this);
        if (scopesetBindingList) {
          var biggestBindingPair = scopesetBindingList.filter(function (_ref) {
            var scopes = _ref.scopes;
            var binding = _ref.binding;

            return scopes.isSubset(stxScopes_580);
          }).sort(sizeDecending_547);
          if (biggestBindingPair.size >= 2 && biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
            var debugBase = "{" + stxScopes_580.map(function (s) {
              return s.toString();
            }).join(", ") + "}";
            var debugAmbigousScopesets = biggestBindingPair.map(function (_ref2) {
              var scopes = _ref2.scopes;

              return "{" + scopes.map(function (s) {
                return s.toString();
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
        return this.token.items.map(function (el) {
          if (el instanceof Syntax && el.isDelimiter()) {
            return "${...}";
          }
          return el.slice.text;
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
    value: function addScope(scope_582, bindings_583) {
      var options_584 = arguments.length <= 2 || arguments[2] === undefined ? { flip: false } : arguments[2];

      var token_585 = this.isDelimiter() ? this.token.map(function (s) {
        return s.addScope(scope_582, bindings_583, options_584);
      }) : this.token;
      if (this.isTemplate()) {
        token_585 = { type: this.token.type, items: token_585.items.map(function (it) {
            if (it instanceof Syntax && it.isDelimiter()) {
              return it.addScope(scope_582, bindings_583, options_584);
            }
            return it;
          }) };
      }
      var newScopeset_586 = void 0;
      if (options_584.flip) {
        var index = this.context.scopeset.indexOf(scope_582);
        if (index !== -1) {
          newScopeset_586 = this.context.scopeset.remove(index);
        } else {
          newScopeset_586 = this.context.scopeset.push(scope_582);
        }
      } else {
        newScopeset_586 = this.context.scopeset.push(scope_582);
      }
      return new Syntax(token_585, { bindings: bindings_583, scopeset: newScopeset_586 });
    }
  }, {
    key: "removeScope",
    value: function removeScope(scope_587) {
      var token_588 = this.isDelimiter() ? this.token.map(function (s) {
        return s.removeScope(scope_587);
      }) : this.token;
      var newScopeset_589 = this.context.scopeset;
      var index_590 = this.context.scopeset.indexOf(scope_587);
      if (index_590 !== -1) {
        newScopeset_589 = this.context.scopeset.remove(index_590);
      }
      return new Syntax(token_588, { bindings: this.context.bindings, scopeset: newScopeset_589 });
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

      var left_569 = new Syntax({ type: _tokenizer.TokenType.LBRACE, value: "{" });
      var right_570 = new Syntax({ type: _tokenizer.TokenType.RBRACE, value: "}" });
      return new Syntax(_immutable.List.of(left_569).concat(inner_567).push(right_570), stx_568.context);
    }
  }, {
    key: "fromBrackets",
    value: function fromBrackets(inner_571) {
      var stx_572 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left_573 = new Syntax({ type: _tokenizer.TokenType.LBRACK, value: "[" });
      var right_574 = new Syntax({ type: _tokenizer.TokenType.RBRACK, value: "]" });
      return new Syntax(_immutable.List.of(left_573).concat(inner_571).push(right_574), stx_572.context);
    }
  }, {
    key: "fromParens",
    value: function fromParens(inner_575) {
      var stx_576 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var left_577 = new Syntax({ type: _tokenizer.TokenType.LPAREN, value: "(" });
      var right_578 = new Syntax({ type: _tokenizer.TokenType.RPAREN, value: ")" });
      return new Syntax(_immutable.List.of(left_577).concat(inner_575).push(right_578), stx_576.context);
    }
  }]);

  return Syntax;
}();

exports.default = Syntax;
//# sourceMappingURL=data:application/json;base64,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QixPQUFPLEdBQVAsRUFBcEMsQ0FBWCxDQURxQztBQUV6QyxVQUFJLFlBQVksSUFBSSxNQUFKLENBQVcsRUFBQyxNQUFNLHFCQUFVLE1BQVYsRUFBa0IsT0FBTyxHQUFQLEVBQXBDLENBQVosQ0FGcUM7QUFHekMsYUFBTyxJQUFJLE1BQUosQ0FBVyxnQkFBSyxFQUFMLENBQVEsUUFBUixFQUFrQixNQUFsQixDQUF5QixTQUF6QixFQUFvQyxJQUFwQyxDQUF5QyxTQUF6QyxDQUFYLEVBQWdFLFFBQVEsT0FBUixDQUF2RSxDQUh5Qzs7OztTQXpDeEIiLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2Fzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcFwiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuY29uc3QgSnVzdF81NDUgPSBNYXliZS5KdXN0O1xuY29uc3QgTm90aGluZ181NDYgPSBNYXliZS5Ob3RoaW5nO1xuaW1wb3J0IHtUb2tlblR5cGUsIFRva2VuQ2xhc3N9IGZyb20gXCJzaGlmdC1wYXJzZXIvZGlzdC90b2tlbml6ZXJcIjtcbmZ1bmN0aW9uIHNpemVEZWNlbmRpbmdfNTQ3KGFfNTQ4LCBiXzU0OSkge1xuICBpZiAoYV81NDguc2NvcGVzLnNpemUgPiBiXzU0OS5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIGlmIChiXzU0OS5zY29wZXMuc2l6ZSA+IGFfNTQ4LnNjb3Blcy5zaXplKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bnRheCB7XG4gIGNvbnN0cnVjdG9yKHRva2VuXzU1MCwgY29udGV4dF81NTEgPSB7YmluZGluZ3M6IG5ldyBCaW5kaW5nTWFwLCBzY29wZXNldDogTGlzdCgpfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbl81NTA7XG4gICAgdGhpcy5jb250ZXh0ID0ge2JpbmRpbmdzOiBjb250ZXh0XzU1MS5iaW5kaW5ncywgc2NvcGVzZXQ6IGNvbnRleHRfNTUxLnNjb3Blc2V0fTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMuY29udGV4dCk7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICBzdGF0aWMgb2YodG9rZW5fNTUyLCBzdHhfNTUzID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl81NTIsIHN0eF81NTMuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21OdWxsKHN0eF81NTQgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTlVMTCwgdmFsdWU6IG51bGx9LCBzdHhfNTU0LmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tTnVtYmVyKHZhbHVlXzU1NSwgc3R4XzU1NiA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5OVU1CRVIsIHZhbHVlOiB2YWx1ZV81NTV9LCBzdHhfNTU2LmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tU3RyaW5nKHZhbHVlXzU1Nywgc3R4XzU1OCA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5TVFJJTkcsIHN0cjogdmFsdWVfNTU3fSwgc3R4XzU1OC5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbVB1bmN0dWF0b3IodmFsdWVfNTU5LCBzdHhfNTYwID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZToge2tsYXNzOiBUb2tlbkNsYXNzLlB1bmN0dWF0b3IsIG5hbWU6IHZhbHVlXzU1OX0sIHZhbHVlOiB2YWx1ZV81NTl9LCBzdHhfNTYwLmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tS2V5d29yZCh2YWx1ZV81NjEsIHN0eF81NjIgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHt0eXBlOiB7a2xhc3M6IFRva2VuQ2xhc3MuS2V5d29yZCwgbmFtZTogdmFsdWVfNTYxfSwgdmFsdWU6IHZhbHVlXzU2MX0sIHN0eF81NjIuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21JZGVudGlmaWVyKHZhbHVlXzU2Mywgc3R4XzU2NCA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5JREVOVElGSUVSLCB2YWx1ZTogdmFsdWVfNTYzfSwgc3R4XzU2NC5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbVJlZ3VsYXJFeHByZXNzaW9uKHZhbHVlXzU2NSwgc3R4XzU2NiA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SRUdFWFAsIHZhbHVlOiB2YWx1ZV81NjV9LCBzdHhfNTY2LmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tQnJhY2VzKGlubmVyXzU2Nywgc3R4XzU2OCA9IHt9KSB7XG4gICAgbGV0IGxlZnRfNTY5ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDRSwgdmFsdWU6IFwie1wifSk7XG4gICAgbGV0IHJpZ2h0XzU3MCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0UsIHZhbHVlOiBcIn1cIn0pO1xuICAgIHJldHVybiBuZXcgU3ludGF4KExpc3Qub2YobGVmdF81NjkpLmNvbmNhdChpbm5lcl81NjcpLnB1c2gocmlnaHRfNTcwKSwgc3R4XzU2OC5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbUJyYWNrZXRzKGlubmVyXzU3MSwgc3R4XzU3MiA9IHt9KSB7XG4gICAgbGV0IGxlZnRfNTczID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLkxCUkFDSywgdmFsdWU6IFwiW1wifSk7XG4gICAgbGV0IHJpZ2h0XzU3NCA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5SQlJBQ0ssIHZhbHVlOiBcIl1cIn0pO1xuICAgIHJldHVybiBuZXcgU3ludGF4KExpc3Qub2YobGVmdF81NzMpLmNvbmNhdChpbm5lcl81NzEpLnB1c2gocmlnaHRfNTc0KSwgc3R4XzU3Mi5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbVBhcmVucyhpbm5lcl81NzUsIHN0eF81NzYgPSB7fSkge1xuICAgIGxldCBsZWZ0XzU3NyA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5MUEFSRU4sIHZhbHVlOiBcIihcIn0pO1xuICAgIGxldCByaWdodF81NzggPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUlBBUkVOLCB2YWx1ZTogXCIpXCJ9KTtcbiAgICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfNTc3KS5jb25jYXQoaW5uZXJfNTc1KS5wdXNoKHJpZ2h0XzU3OCksIHN0eF81NzYuY29udGV4dCk7XG4gIH1cbiAgcmVzb2x2ZSgpIHtcbiAgICBpZiAodGhpcy5jb250ZXh0LnNjb3Blc2V0LnNpemUgPT09IDAgfHwgISh0aGlzLmlzSWRlbnRpZmllcigpIHx8IHRoaXMuaXNLZXl3b3JkKCkpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi52YWx1ZTtcbiAgICB9XG4gICAgbGV0IHNjb3BlXzU3OSA9IHRoaXMuY29udGV4dC5zY29wZXNldC5sYXN0KCk7XG4gICAgbGV0IHN0eFNjb3Blc181ODAgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQ7XG4gICAgbGV0IGJpbmRpbmdzXzU4MSA9IHRoaXMuY29udGV4dC5iaW5kaW5ncztcbiAgICBpZiAoc2NvcGVfNTc5KSB7XG4gICAgICBsZXQgc2NvcGVzZXRCaW5kaW5nTGlzdCA9IGJpbmRpbmdzXzU4MS5nZXQodGhpcyk7XG4gICAgICBpZiAoc2NvcGVzZXRCaW5kaW5nTGlzdCkge1xuICAgICAgICBsZXQgYmlnZ2VzdEJpbmRpbmdQYWlyID0gc2NvcGVzZXRCaW5kaW5nTGlzdC5maWx0ZXIoKHtzY29wZXMsIGJpbmRpbmd9KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHNjb3Blcy5pc1N1YnNldChzdHhTY29wZXNfNTgwKTtcbiAgICAgICAgfSkuc29ydChzaXplRGVjZW5kaW5nXzU0Nyk7XG4gICAgICAgIGlmIChiaWdnZXN0QmluZGluZ1BhaXIuc2l6ZSA+PSAyICYmIGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuc2NvcGVzLnNpemUgPT09IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMSkuc2NvcGVzLnNpemUpIHtcbiAgICAgICAgICBsZXQgZGVidWdCYXNlID0gXCJ7XCIgKyBzdHhTY29wZXNfNTgwLm1hcChzID0+IHMudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgbGV0IGRlYnVnQW1iaWdvdXNTY29wZXNldHMgPSBiaWdnZXN0QmluZGluZ1BhaXIubWFwKCh7c2NvcGVzfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFwie1wiICsgc2NvcGVzLm1hcChzID0+IHMudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgfSkuam9pbihcIiwgXCIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjb3Blc2V0IFwiICsgZGVidWdCYXNlICsgXCIgaGFzIGFtYmlndW91cyBzdWJzZXRzIFwiICsgZGVidWdBbWJpZ291c1Njb3Blc2V0cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmlnZ2VzdEJpbmRpbmdQYWlyLnNpemUgIT09IDApIHtcbiAgICAgICAgICBsZXQgYmluZGluZ1N0ciA9IGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYmluZGluZy50b1N0cmluZygpO1xuICAgICAgICAgIGlmIChNYXliZS5pc0p1c3QoYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5hbGlhcykpIHtcbiAgICAgICAgICAgIHJldHVybiBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzLmdldE9yRWxzZShudWxsKS5yZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiaW5kaW5nU3RyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG4gIHZhbCgpIHtcbiAgICBhc3NlcnQoIXRoaXMuaXNEZWxpbWl0ZXIoKSwgXCJjYW5ub3QgZ2V0IHRoZSB2YWwgb2YgYSBkZWxpbWl0ZXJcIik7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLnN0cjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUZW1wbGF0ZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5pdGVtcy5tYXAoZWwgPT4ge1xuICAgICAgICBpZiAoZWwgaW5zdGFuY2VvZiBTeW50YXggJiYgZWwuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgICAgIHJldHVybiBcIiR7Li4ufVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbC5zbGljZS50ZXh0O1xuICAgICAgfSkuam9pbihcIlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbiAgbGluZU51bWJlcigpIHtcbiAgICBpZiAoIXRoaXMuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uc2xpY2Uuc3RhcnRMb2NhdGlvbi5saW5lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5nZXQoMCkubGluZU51bWJlcigpO1xuICAgIH1cbiAgfVxuICBpbm5lcigpIHtcbiAgICBhc3NlcnQodGhpcy5pc0RlbGltaXRlcigpLCBcImNhbiBvbmx5IGdldCB0aGUgaW5uZXIgb2YgYSBkZWxpbWl0ZXJcIik7XG4gICAgcmV0dXJuIHRoaXMudG9rZW4uc2xpY2UoMSwgdGhpcy50b2tlbi5zaXplIC0gMSk7XG4gIH1cbiAgYWRkU2NvcGUoc2NvcGVfNTgyLCBiaW5kaW5nc181ODMsIG9wdGlvbnNfNTg0ID0ge2ZsaXA6IGZhbHNlfSkge1xuICAgIGxldCB0b2tlbl81ODUgPSB0aGlzLmlzRGVsaW1pdGVyKCkgPyB0aGlzLnRva2VuLm1hcChzID0+IHMuYWRkU2NvcGUoc2NvcGVfNTgyLCBiaW5kaW5nc181ODMsIG9wdGlvbnNfNTg0KSkgOiB0aGlzLnRva2VuO1xuICAgIGlmICh0aGlzLmlzVGVtcGxhdGUoKSkge1xuICAgICAgdG9rZW5fNTg1ID0ge3R5cGU6IHRoaXMudG9rZW4udHlwZSwgaXRlbXM6IHRva2VuXzU4NS5pdGVtcy5tYXAoaXQgPT4ge1xuICAgICAgICBpZiAoaXQgaW5zdGFuY2VvZiBTeW50YXggJiYgaXQuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgICAgIHJldHVybiBpdC5hZGRTY29wZShzY29wZV81ODIsIGJpbmRpbmdzXzU4Mywgb3B0aW9uc181ODQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdDtcbiAgICAgIH0pfTtcbiAgICB9XG4gICAgbGV0IG5ld1Njb3Blc2V0XzU4NjtcbiAgICBpZiAob3B0aW9uc181ODQuZmxpcCkge1xuICAgICAgbGV0IGluZGV4ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LmluZGV4T2Yoc2NvcGVfNTgyKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbmV3U2NvcGVzZXRfNTg2ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LnJlbW92ZShpbmRleCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTY29wZXNldF81ODYgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucHVzaChzY29wZV81ODIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdTY29wZXNldF81ODYgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQucHVzaChzY29wZV81ODIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl81ODUsIHtiaW5kaW5nczogYmluZGluZ3NfNTgzLCBzY29wZXNldDogbmV3U2NvcGVzZXRfNTg2fSk7XG4gIH1cbiAgcmVtb3ZlU2NvcGUoc2NvcGVfNTg3KSB7XG4gICAgbGV0IHRva2VuXzU4OCA9IHRoaXMuaXNEZWxpbWl0ZXIoKSA/IHRoaXMudG9rZW4ubWFwKHMgPT4gcy5yZW1vdmVTY29wZShzY29wZV81ODcpKSA6IHRoaXMudG9rZW47XG4gICAgbGV0IG5ld1Njb3Blc2V0XzU4OSA9IHRoaXMuY29udGV4dC5zY29wZXNldDtcbiAgICBsZXQgaW5kZXhfNTkwID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LmluZGV4T2Yoc2NvcGVfNTg3KTtcbiAgICBpZiAoaW5kZXhfNTkwICE9PSAtMSkge1xuICAgICAgbmV3U2NvcGVzZXRfNTg5ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LnJlbW92ZShpbmRleF81OTApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl81ODgsIHtiaW5kaW5nczogdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBzY29wZXNldDogbmV3U2NvcGVzZXRfNTg5fSk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5JZGVudDtcbiAgfVxuICBpc0Fzc2lnbigpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5BU1NJR047XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5UUlVFIHx8IHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkZBTFNFO1xuICB9XG4gIGlzS2V5d29yZCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuS2V5d29yZDtcbiAgfVxuICBpc051bGxMaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLk5VTEw7XG4gIH1cbiAgaXNOdW1lcmljTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuTnVtZXJpY0xpdGVyYWw7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5QdW5jdHVhdG9yO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuU3RyaW5nTGl0ZXJhbDtcbiAgfVxuICBpc1JlZ3VsYXJFeHByZXNzaW9uKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5SZWd1bGFyRXhwcmVzc2lvbjtcbiAgfVxuICBpc1RlbXBsYXRlKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLlRFTVBMQVRFO1xuICB9XG4gIGlzRGVsaW1pdGVyKCkge1xuICAgIHJldHVybiBMaXN0LmlzTGlzdCh0aGlzLnRva2VuKTtcbiAgfVxuICBpc1BhcmVucygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MUEFSRU47XG4gIH1cbiAgaXNCcmFjZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNFO1xuICB9XG4gIGlzQnJhY2tldHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNLO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLmdldCgwKS52YWwoKSA9PT0gXCIjYFwiO1xuICB9XG4gIGlzRU9GKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkVPUztcbiAgfVxuICB0b1N0cmluZygpIHtcbiAgICBpZiAodGhpcy5pc0RlbGltaXRlcigpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5tYXAocyA9PiBzLnRvU3RyaW5nKCkpLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwoKSkge1xuICAgICAgcmV0dXJuIFwiJ1wiICsgdGhpcy50b2tlbi5zdHI7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzVGVtcGxhdGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRva2VuLnZhbHVlO1xuICB9XG59XG4iXX0=