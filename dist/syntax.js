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
    key: "inner",
    value: function inner() {
      (0, _errors.assert)(this.isDelimiter(), "can only get the inner of a delimiter");
      return this.token.slice(1, this.token.size - 1);
    }
  }, {
    key: "addScope",
    value: function addScope(scope_685, bindings_686) {
      var options_687 = arguments.length <= 2 || arguments[2] === undefined ? { flip: false } : arguments[2];

      var token_688 = this.isDelimiter() ? this.token.map(function (s_690) {
        return s_690.addScope(scope_685, bindings_686, options_687);
      }) : this.token;
      if (this.isTemplate()) {
        token_688 = { type: this.token.type, items: token_688.items.map(function (it_691) {
            if (it_691 instanceof Syntax && it_691.isDelimiter()) {
              return it_691.addScope(scope_685, bindings_686, options_687);
            }
            return it_691;
          }) };
      }
      var newScopeset_689 = void 0;
      if (options_687.flip) {
        var index = this.context.scopeset.indexOf(scope_685);
        if (index !== -1) {
          newScopeset_689 = this.context.scopeset.remove(index);
        } else {
          newScopeset_689 = this.context.scopeset.push(scope_685);
        }
      } else {
        newScopeset_689 = this.context.scopeset.push(scope_685);
      }
      return new Syntax(token_688, { bindings: bindings_686, scopeset: newScopeset_689 });
    }
  }, {
    key: "removeScope",
    value: function removeScope(scope_692) {
      var token_693 = this.isDelimiter() ? this.token.map(function (s_696) {
        return s_696.removeScope(scope_692);
      }) : this.token;
      var newScopeset_694 = this.context.scopeset;
      var index_695 = this.context.scopeset.indexOf(scope_692);
      if (index_695 !== -1) {
        newScopeset_694 = this.context.scopeset.remove(index_695);
      }
      return new Syntax(token_693, { bindings: this.context.bindings, scopeset: newScopeset_694 });
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
        return this.token.map(function (s_697) {
          return s_697.toString();
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
//# sourceMappingURL=data:application/json;base64,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QUosQ0FBVyxFQUFDLE1BQU0scUJBQVUsTUFBakIsRUFBeUIsT0FBTyxHQUFoQyxFQUFYLENBQWhCO0FBQ0EsYUFBTyxJQUFJLE1BQUosQ0FBVyxnQkFBSyxFQUFMLENBQVEsUUFBUixFQUFrQixNQUFsQixDQUF5QixTQUF6QixFQUFvQyxJQUFwQyxDQUF5QyxTQUF6QyxDQUFYLEVBQWdFLFFBQVEsT0FBeEUsQ0FBUDtBQUNEOzs7Ozs7a0JBN0NrQixNIiwiZmlsZSI6InN5bnRheC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHthc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IEJpbmRpbmdNYXAgZnJvbSBcIi4vYmluZGluZy1tYXBcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IEp1c3RfNjQ1ID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfNjQ2ID0gTWF5YmUuTm90aGluZztcbmltcG9ydCB7VG9rZW5UeXBlLCBUb2tlbkNsYXNzfSBmcm9tIFwic2hpZnQtcGFyc2VyL2Rpc3QvdG9rZW5pemVyXCI7XG5mdW5jdGlvbiBzaXplRGVjZW5kaW5nXzY0NyhhXzY0OCwgYl82NDkpIHtcbiAgaWYgKGFfNjQ4LnNjb3Blcy5zaXplID4gYl82NDkuc2NvcGVzLnNpemUpIHtcbiAgICByZXR1cm4gLTE7XG4gIH0gZWxzZSBpZiAoYl82NDkuc2NvcGVzLnNpemUgPiBhXzY0OC5zY29wZXMuc2l6ZSkge1xuICAgIHJldHVybiAxO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAwO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTeW50YXgge1xuICBjb25zdHJ1Y3Rvcih0b2tlbl82NTAsIGNvbnRleHRfNjUxID0ge2JpbmRpbmdzOiBuZXcgQmluZGluZ01hcCwgc2NvcGVzZXQ6IExpc3QoKX0pIHtcbiAgICB0aGlzLnRva2VuID0gdG9rZW5fNjUwO1xuICAgIHRoaXMuY29udGV4dCA9IHtiaW5kaW5nczogY29udGV4dF82NTEuYmluZGluZ3MsIHNjb3Blc2V0OiBjb250ZXh0XzY1MS5zY29wZXNldH07XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzLmNvbnRleHQpO1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgc3RhdGljIG9mKHRva2VuXzY1Miwgc3R4XzY1MyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fNjUyLCBzdHhfNjUzLmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tTnVsbChzdHhfNjU0ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLk5VTEwsIHZhbHVlOiBudWxsfSwgc3R4XzY1NC5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbU51bWJlcih2YWx1ZV82NTUsIHN0eF82NTYgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTlVNQkVSLCB2YWx1ZTogdmFsdWVfNjU1fSwgc3R4XzY1Ni5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbVN0cmluZyh2YWx1ZV82NTcsIHN0eF82NTggPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuU1RSSU5HLCBzdHI6IHZhbHVlXzY1N30sIHN0eF82NTguY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21QdW5jdHVhdG9yKHZhbHVlXzY1OSwgc3R4XzY2MCA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoe3R5cGU6IHtrbGFzczogVG9rZW5DbGFzcy5QdW5jdHVhdG9yLCBuYW1lOiB2YWx1ZV82NTl9LCB2YWx1ZTogdmFsdWVfNjU5fSwgc3R4XzY2MC5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbUtleXdvcmQodmFsdWVfNjYxLCBzdHhfNjYyID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFN5bnRheCh7dHlwZToge2tsYXNzOiBUb2tlbkNsYXNzLktleXdvcmQsIG5hbWU6IHZhbHVlXzY2MX0sIHZhbHVlOiB2YWx1ZV82NjF9LCBzdHhfNjYyLmNvbnRleHQpO1xuICB9XG4gIHN0YXRpYyBmcm9tSWRlbnRpZmllcih2YWx1ZV82NjMsIHN0eF82NjQgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuSURFTlRJRklFUiwgdmFsdWU6IHZhbHVlXzY2M30sIHN0eF82NjQuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21SZWd1bGFyRXhwcmVzc2lvbih2YWx1ZV82NjUsIHN0eF82NjYgPSB7fSkge1xuICAgIHJldHVybiBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkVHRVhQLCB2YWx1ZTogdmFsdWVfNjY1fSwgc3R4XzY2Ni5jb250ZXh0KTtcbiAgfVxuICBzdGF0aWMgZnJvbUJyYWNlcyhpbm5lcl82NjcsIHN0eF82NjggPSB7fSkge1xuICAgIGxldCBsZWZ0XzY2OSA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5MQlJBQ0UsIHZhbHVlOiBcIntcIn0pO1xuICAgIGxldCByaWdodF82NzAgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkJSQUNFLCB2YWx1ZTogXCJ9XCJ9KTtcbiAgICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfNjY5KS5jb25jYXQoaW5uZXJfNjY3KS5wdXNoKHJpZ2h0XzY3MCksIHN0eF82NjguY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21CcmFja2V0cyhpbm5lcl82NzEsIHN0eF82NzIgPSB7fSkge1xuICAgIGxldCBsZWZ0XzY3MyA9IG5ldyBTeW50YXgoe3R5cGU6IFRva2VuVHlwZS5MQlJBQ0ssIHZhbHVlOiBcIltcIn0pO1xuICAgIGxldCByaWdodF82NzQgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuUkJSQUNLLCB2YWx1ZTogXCJdXCJ9KTtcbiAgICByZXR1cm4gbmV3IFN5bnRheChMaXN0Lm9mKGxlZnRfNjczKS5jb25jYXQoaW5uZXJfNjcxKS5wdXNoKHJpZ2h0XzY3NCksIHN0eF82NzIuY29udGV4dCk7XG4gIH1cbiAgc3RhdGljIGZyb21QYXJlbnMoaW5uZXJfNjc1LCBzdHhfNjc2ID0ge30pIHtcbiAgICBsZXQgbGVmdF82NzcgPSBuZXcgU3ludGF4KHt0eXBlOiBUb2tlblR5cGUuTFBBUkVOLCB2YWx1ZTogXCIoXCJ9KTtcbiAgICBsZXQgcmlnaHRfNjc4ID0gbmV3IFN5bnRheCh7dHlwZTogVG9rZW5UeXBlLlJQQVJFTiwgdmFsdWU6IFwiKVwifSk7XG4gICAgcmV0dXJuIG5ldyBTeW50YXgoTGlzdC5vZihsZWZ0XzY3NykuY29uY2F0KGlubmVyXzY3NSkucHVzaChyaWdodF82NzgpLCBzdHhfNjc2LmNvbnRleHQpO1xuICB9XG4gIHJlc29sdmUoKSB7XG4gICAgaWYgKHRoaXMuY29udGV4dC5zY29wZXNldC5zaXplID09PSAwIHx8ICEodGhpcy5pc0lkZW50aWZpZXIoKSB8fCB0aGlzLmlzS2V5d29yZCgpKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gICAgfVxuICAgIGxldCBzY29wZV82NzkgPSB0aGlzLmNvbnRleHQuc2NvcGVzZXQubGFzdCgpO1xuICAgIGxldCBzdHhTY29wZXNfNjgwID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0O1xuICAgIGxldCBiaW5kaW5nc182ODEgPSB0aGlzLmNvbnRleHQuYmluZGluZ3M7XG4gICAgaWYgKHNjb3BlXzY3OSkge1xuICAgICAgbGV0IHNjb3Blc2V0QmluZGluZ0xpc3QgPSBiaW5kaW5nc182ODEuZ2V0KHRoaXMpO1xuICAgICAgaWYgKHNjb3Blc2V0QmluZGluZ0xpc3QpIHtcbiAgICAgICAgbGV0IGJpZ2dlc3RCaW5kaW5nUGFpciA9IHNjb3Blc2V0QmluZGluZ0xpc3QuZmlsdGVyKCh7c2NvcGVzLCBiaW5kaW5nfSkgPT4ge1xuICAgICAgICAgIHJldHVybiBzY29wZXMuaXNTdWJzZXQoc3R4U2NvcGVzXzY4MCk7XG4gICAgICAgIH0pLnNvcnQoc2l6ZURlY2VuZGluZ182NDcpO1xuICAgICAgICBpZiAoYmlnZ2VzdEJpbmRpbmdQYWlyLnNpemUgPj0gMiAmJiBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLnNjb3Blcy5zaXplID09PSBiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDEpLnNjb3Blcy5zaXplKSB7XG4gICAgICAgICAgbGV0IGRlYnVnQmFzZSA9IFwie1wiICsgc3R4U2NvcGVzXzY4MC5tYXAoc182ODIgPT4gc182ODIudG9TdHJpbmcoKSkuam9pbihcIiwgXCIpICsgXCJ9XCI7XG4gICAgICAgICAgbGV0IGRlYnVnQW1iaWdvdXNTY29wZXNldHMgPSBiaWdnZXN0QmluZGluZ1BhaXIubWFwKCh7c2NvcGVzfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFwie1wiICsgc2NvcGVzLm1hcChzXzY4MyA9PiBzXzY4My50b1N0cmluZygpKS5qb2luKFwiLCBcIikgKyBcIn1cIjtcbiAgICAgICAgICB9KS5qb2luKFwiLCBcIik7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NvcGVzZXQgXCIgKyBkZWJ1Z0Jhc2UgKyBcIiBoYXMgYW1iaWd1b3VzIHN1YnNldHMgXCIgKyBkZWJ1Z0FtYmlnb3VzU2NvcGVzZXRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChiaWdnZXN0QmluZGluZ1BhaXIuc2l6ZSAhPT0gMCkge1xuICAgICAgICAgIGxldCBiaW5kaW5nU3RyID0gYmlnZ2VzdEJpbmRpbmdQYWlyLmdldCgwKS5iaW5kaW5nLnRvU3RyaW5nKCk7XG4gICAgICAgICAgaWYgKE1heWJlLmlzSnVzdChiaWdnZXN0QmluZGluZ1BhaXIuZ2V0KDApLmFsaWFzKSkge1xuICAgICAgICAgICAgcmV0dXJuIGJpZ2dlc3RCaW5kaW5nUGFpci5nZXQoMCkuYWxpYXMuZ2V0T3JFbHNlKG51bGwpLnJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGJpbmRpbmdTdHI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbiAgdmFsKCkge1xuICAgIGFzc2VydCghdGhpcy5pc0RlbGltaXRlcigpLCBcImNhbm5vdCBnZXQgdGhlIHZhbCBvZiBhIGRlbGltaXRlclwiKTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwoKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uc3RyO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2VuLml0ZW1zLm1hcChlbF82ODQgPT4ge1xuICAgICAgICBpZiAoZWxfNjg0IGluc3RhbmNlb2YgU3ludGF4ICYmIGVsXzY4NC5pc0RlbGltaXRlcigpKSB7XG4gICAgICAgICAgcmV0dXJuIFwiJHsuLi59XCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsXzY4NC5zbGljZS50ZXh0O1xuICAgICAgfSkuam9pbihcIlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbiAgbGluZU51bWJlcigpIHtcbiAgICBpZiAoIXRoaXMuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9rZW4uc2xpY2Uuc3RhcnRMb2NhdGlvbi5saW5lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5nZXQoMCkubGluZU51bWJlcigpO1xuICAgIH1cbiAgfVxuICBpbm5lcigpIHtcbiAgICBhc3NlcnQodGhpcy5pc0RlbGltaXRlcigpLCBcImNhbiBvbmx5IGdldCB0aGUgaW5uZXIgb2YgYSBkZWxpbWl0ZXJcIik7XG4gICAgcmV0dXJuIHRoaXMudG9rZW4uc2xpY2UoMSwgdGhpcy50b2tlbi5zaXplIC0gMSk7XG4gIH1cbiAgYWRkU2NvcGUoc2NvcGVfNjg1LCBiaW5kaW5nc182ODYsIG9wdGlvbnNfNjg3ID0ge2ZsaXA6IGZhbHNlfSkge1xuICAgIGxldCB0b2tlbl82ODggPSB0aGlzLmlzRGVsaW1pdGVyKCkgPyB0aGlzLnRva2VuLm1hcChzXzY5MCA9PiBzXzY5MC5hZGRTY29wZShzY29wZV82ODUsIGJpbmRpbmdzXzY4Niwgb3B0aW9uc182ODcpKSA6IHRoaXMudG9rZW47XG4gICAgaWYgKHRoaXMuaXNUZW1wbGF0ZSgpKSB7XG4gICAgICB0b2tlbl82ODggPSB7dHlwZTogdGhpcy50b2tlbi50eXBlLCBpdGVtczogdG9rZW5fNjg4Lml0ZW1zLm1hcChpdF82OTEgPT4ge1xuICAgICAgICBpZiAoaXRfNjkxIGluc3RhbmNlb2YgU3ludGF4ICYmIGl0XzY5MS5pc0RlbGltaXRlcigpKSB7XG4gICAgICAgICAgcmV0dXJuIGl0XzY5MS5hZGRTY29wZShzY29wZV82ODUsIGJpbmRpbmdzXzY4Niwgb3B0aW9uc182ODcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdF82OTE7XG4gICAgICB9KX07XG4gICAgfVxuICAgIGxldCBuZXdTY29wZXNldF82ODk7XG4gICAgaWYgKG9wdGlvbnNfNjg3LmZsaXApIHtcbiAgICAgIGxldCBpbmRleCA9IHRoaXMuY29udGV4dC5zY29wZXNldC5pbmRleE9mKHNjb3BlXzY4NSk7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIG5ld1Njb3Blc2V0XzY4OSA9IHRoaXMuY29udGV4dC5zY29wZXNldC5yZW1vdmUoaW5kZXgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3U2NvcGVzZXRfNjg5ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LnB1c2goc2NvcGVfNjg1KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbmV3U2NvcGVzZXRfNjg5ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LnB1c2goc2NvcGVfNjg1KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTeW50YXgodG9rZW5fNjg4LCB7YmluZGluZ3M6IGJpbmRpbmdzXzY4Niwgc2NvcGVzZXQ6IG5ld1Njb3Blc2V0XzY4OX0pO1xuICB9XG4gIHJlbW92ZVNjb3BlKHNjb3BlXzY5Mikge1xuICAgIGxldCB0b2tlbl82OTMgPSB0aGlzLmlzRGVsaW1pdGVyKCkgPyB0aGlzLnRva2VuLm1hcChzXzY5NiA9PiBzXzY5Ni5yZW1vdmVTY29wZShzY29wZV82OTIpKSA6IHRoaXMudG9rZW47XG4gICAgbGV0IG5ld1Njb3Blc2V0XzY5NCA9IHRoaXMuY29udGV4dC5zY29wZXNldDtcbiAgICBsZXQgaW5kZXhfNjk1ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LmluZGV4T2Yoc2NvcGVfNjkyKTtcbiAgICBpZiAoaW5kZXhfNjk1ICE9PSAtMSkge1xuICAgICAgbmV3U2NvcGVzZXRfNjk0ID0gdGhpcy5jb250ZXh0LnNjb3Blc2V0LnJlbW92ZShpbmRleF82OTUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN5bnRheCh0b2tlbl82OTMsIHtiaW5kaW5nczogdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBzY29wZXNldDogbmV3U2NvcGVzZXRfNjk0fSk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5JZGVudDtcbiAgfVxuICBpc0Fzc2lnbigpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5BU1NJR047XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5UUlVFIHx8IHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkZBTFNFO1xuICB9XG4gIGlzS2V5d29yZCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuS2V5d29yZDtcbiAgfVxuICBpc051bGxMaXRlcmFsKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLk5VTEw7XG4gIH1cbiAgaXNOdW1lcmljTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuTnVtZXJpY0xpdGVyYWw7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5QdW5jdHVhdG9yO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLnR5cGUua2xhc3MgPT09IFRva2VuQ2xhc3MuU3RyaW5nTGl0ZXJhbDtcbiAgfVxuICBpc1JlZ3VsYXJFeHByZXNzaW9uKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZS5rbGFzcyA9PT0gVG9rZW5DbGFzcy5SZWd1bGFyRXhwcmVzc2lvbjtcbiAgfVxuICBpc1RlbXBsYXRlKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLlRFTVBMQVRFO1xuICB9XG4gIGlzRGVsaW1pdGVyKCkge1xuICAgIHJldHVybiBMaXN0LmlzTGlzdCh0aGlzLnRva2VuKTtcbiAgfVxuICBpc1BhcmVucygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4uZ2V0KDApLnRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5MUEFSRU47XG4gIH1cbiAgaXNCcmFjZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNFO1xuICB9XG4gIGlzQnJhY2tldHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLmdldCgwKS50b2tlbi50eXBlID09PSBUb2tlblR5cGUuTEJSQUNLO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNEZWxpbWl0ZXIoKSAmJiB0aGlzLnRva2VuLmdldCgwKS52YWwoKSA9PT0gXCIjYFwiO1xuICB9XG4gIGlzRU9GKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0RlbGltaXRlcigpICYmIHRoaXMudG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkVPUztcbiAgfVxuICB0b1N0cmluZygpIHtcbiAgICBpZiAodGhpcy5pc0RlbGltaXRlcigpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbi5tYXAoc182OTcgPT4gc182OTcudG9TdHJpbmcoKSkuam9pbihcIiBcIik7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbCgpKSB7XG4gICAgICByZXR1cm4gXCInXCIgKyB0aGlzLnRva2VuLnN0cjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNUZW1wbGF0ZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9rZW4udmFsdWU7XG4gIH1cbn1cbiJdfQ==