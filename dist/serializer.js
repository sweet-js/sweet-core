"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializer = exports.makeDeserializer = undefined;

var _transitJs = require("transit-js");

var _transitJs2 = _interopRequireDefault(_transitJs);

var _immutable = require("immutable");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _symbol = require("./symbol");

var _tokenizer = require("shift-parser/dist/tokenizer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var typeMap = [_tokenizer.TokenType.STRING, _tokenizer.TokenType.EOS, _tokenizer.TokenType.LPAREN, _tokenizer.TokenType.RPAREN, _tokenizer.TokenType.LBRACK, _tokenizer.TokenType.RBRACK, _tokenizer.TokenType.LBRACE, _tokenizer.TokenType.RBRACE, _tokenizer.TokenType.COLON, _tokenizer.TokenType.SEMICOLON, _tokenizer.TokenType.PERIOD, _tokenizer.TokenType.ELLIPSIS, _tokenizer.TokenType.ARROW, _tokenizer.TokenType.CONDITIONAL, _tokenizer.TokenType.INC, _tokenizer.TokenType.DEC, _tokenizer.TokenType.ASSIGN, _tokenizer.TokenType.ASSIGN_BIT_OR, _tokenizer.TokenType.ASSIGN_BIT_XOR, _tokenizer.TokenType.ASSIGN_BIT_AND, _tokenizer.TokenType.ASSIGN_SHL, _tokenizer.TokenType.ASSIGN_SHR, _tokenizer.TokenType.ASSIGN_SHR_UNSIGNED, _tokenizer.TokenType.ASSIGN_ADD, _tokenizer.TokenType.ASSIGN_SUB, _tokenizer.TokenType.ASSIGN_MUL, _tokenizer.TokenType.ASSIGN_DIV, _tokenizer.TokenType.ASSIGN_MOD, _tokenizer.TokenType.COMMA, _tokenizer.TokenType.OR, _tokenizer.TokenType.AND, _tokenizer.TokenType.BIT_OR, _tokenizer.TokenType.BIT_XOR, _tokenizer.TokenType.BIT_AND, _tokenizer.TokenType.SHL, _tokenizer.TokenType.SHR, _tokenizer.TokenType.SHR_UNSIGNED, _tokenizer.TokenType.ADD, _tokenizer.TokenType.SUB, _tokenizer.TokenType.MUL, _tokenizer.TokenType.DIV, _tokenizer.TokenType.MOD, _tokenizer.TokenType.EQ, _tokenizer.TokenType.NE, _tokenizer.TokenType.EQ_STRICT, _tokenizer.TokenType.NE_STRICT, _tokenizer.TokenType.LT, _tokenizer.TokenType.GT, _tokenizer.TokenType.LTE, _tokenizer.TokenType.GTE, _tokenizer.TokenType.INSTANCEOF, _tokenizer.TokenType.IN, _tokenizer.TokenType.NOT, _tokenizer.TokenType.BIT_NOT, _tokenizer.TokenType.AWAIT, _tokenizer.TokenType.DELETE, _tokenizer.TokenType.TYPEOF, _tokenizer.TokenType.VOID, _tokenizer.TokenType.BREAK, _tokenizer.TokenType.CASE, _tokenizer.TokenType.CATCH, _tokenizer.TokenType.CLASS, _tokenizer.TokenType.CONTINUE, _tokenizer.TokenType.DEBUGGER, _tokenizer.TokenType.DEFAULT, _tokenizer.TokenType.DO, _tokenizer.TokenType.ELSE, _tokenizer.TokenType.EXPORT, _tokenizer.TokenType.EXTENDS, _tokenizer.TokenType.FINALLY, _tokenizer.TokenType.FOR, _tokenizer.TokenType.FUNCTION, _tokenizer.TokenType.IF, _tokenizer.TokenType.IMPORT, _tokenizer.TokenType.LET, _tokenizer.TokenType.NEW, _tokenizer.TokenType.RETURN, _tokenizer.TokenType.SUPER, _tokenizer.TokenType.SWITCH, _tokenizer.TokenType.THIS, _tokenizer.TokenType.THROW, _tokenizer.TokenType.TRY, _tokenizer.TokenType.VAR, _tokenizer.TokenType.WHILE, _tokenizer.TokenType.WITH, _tokenizer.TokenType.NULL, _tokenizer.TokenType.TRUE, _tokenizer.TokenType.FALSE, _tokenizer.TokenType.YIELD, _tokenizer.TokenType.NUMBER, _tokenizer.TokenType.STRING, _tokenizer.TokenType.REGEXP, _tokenizer.TokenType.IDENTIFIER, _tokenizer.TokenType.CONST, _tokenizer.TokenType.TEMPLATE, _tokenizer.TokenType.ILLEGAL];

var ListHandler = _transitJs2.default.makeWriteHandler({
  tag: function tag() {
    return "array";
  },
  rep: function rep(v) {
    return v;
  }
});

var SyntaxHandler = _transitJs2.default.makeWriteHandler({
  tag: function tag() {
    return "stx";
  },
  rep: function rep(v) {
    if (_immutable.List.isList(v.token)) {
      return [v.token, v.context.scopeset];
    } else {
      var t = _transitJs2.default.objectToMap(v.token);
      t.set("type", typeMap.indexOf(v.token.type));
      return [t, v.context.scopeset];
    }
  }
});
var SymbolHandler = _transitJs2.default.makeWriteHandler({
  tag: function tag() {
    return "symb";
  },
  rep: function rep(v) {
    return [v.name];
  }
});

var writer = _transitJs2.default.writer("json", {
  handlers: _transitJs2.default.map([_immutable.List, ListHandler, _syntax2.default, SyntaxHandler, _symbol.SymbolClass, SymbolHandler])
});

function makeReader(bindings) {
  return _transitJs2.default.reader("json", {
    arrayBuilder: {
      init: function init(node) {
        return (0, _immutable.List)().asMutable();
      },
      add: function add(ret, val, node) {
        return ret.push(val);
      },
      finalize: function finalize(ret, node) {
        return ret.asImmutable();
      },
      fromArray: function fromArray(arr, node) {
        return (0, _immutable.List)(arr);
      }
    },
    handlers: {
      "stx": function stx(rep) {
        if (_immutable.List.isList(rep[0])) {
          var token = rep[0];
          return new _syntax2.default(token, { bindings: bindings, scopeset: rep[1] });
        } else {
          var token = _transitJs2.default.mapToObject(rep[0]);
          token.type = typeMap[rep[0].get("type")];
          token.slice = rep[0].has("slice") ? _transitJs2.default.mapToObject(rep[0].get("slice")) : undefined;
          return new _syntax2.default(token, { bindings: bindings, scopeset: rep[1] });
        }
      },
      "symb": function symb(rep) {
        return (0, _symbol.Symbol)(rep[0]);
      }
    }
  });
}

exports.makeDeserializer = makeReader;
exports.serializer = writer;
//# sourceMappingURL=serializer.js.map
