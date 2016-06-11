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

let typeMap_564 = [_tokenizer.TokenType.STRING, _tokenizer.TokenType.EOS, _tokenizer.TokenType.LPAREN, _tokenizer.TokenType.RPAREN, _tokenizer.TokenType.LBRACK, _tokenizer.TokenType.RBRACK, _tokenizer.TokenType.LBRACE, _tokenizer.TokenType.RBRACE, _tokenizer.TokenType.COLON, _tokenizer.TokenType.SEMICOLON, _tokenizer.TokenType.PERIOD, _tokenizer.TokenType.ELLIPSIS, _tokenizer.TokenType.ARROW, _tokenizer.TokenType.CONDITIONAL, _tokenizer.TokenType.INC, _tokenizer.TokenType.DEC, _tokenizer.TokenType.ASSIGN, _tokenizer.TokenType.ASSIGN_BIT_OR, _tokenizer.TokenType.ASSIGN_BIT_XOR, _tokenizer.TokenType.ASSIGN_BIT_AND, _tokenizer.TokenType.ASSIGN_SHL, _tokenizer.TokenType.ASSIGN_SHR, _tokenizer.TokenType.ASSIGN_SHR_UNSIGNED, _tokenizer.TokenType.ASSIGN_ADD, _tokenizer.TokenType.ASSIGN_SUB, _tokenizer.TokenType.ASSIGN_MUL, _tokenizer.TokenType.ASSIGN_DIV, _tokenizer.TokenType.ASSIGN_MOD, _tokenizer.TokenType.COMMA, _tokenizer.TokenType.OR, _tokenizer.TokenType.AND, _tokenizer.TokenType.BIT_OR, _tokenizer.TokenType.BIT_XOR, _tokenizer.TokenType.BIT_AND, _tokenizer.TokenType.SHL, _tokenizer.TokenType.SHR, _tokenizer.TokenType.SHR_UNSIGNED, _tokenizer.TokenType.ADD, _tokenizer.TokenType.SUB, _tokenizer.TokenType.MUL, _tokenizer.TokenType.DIV, _tokenizer.TokenType.MOD, _tokenizer.TokenType.EQ, _tokenizer.TokenType.NE, _tokenizer.TokenType.EQ_STRICT, _tokenizer.TokenType.NE_STRICT, _tokenizer.TokenType.LT, _tokenizer.TokenType.GT, _tokenizer.TokenType.LTE, _tokenizer.TokenType.GTE, _tokenizer.TokenType.INSTANCEOF, _tokenizer.TokenType.IN, _tokenizer.TokenType.NOT, _tokenizer.TokenType.BIT_NOT, _tokenizer.TokenType.AWAIT, _tokenizer.TokenType.DELETE, _tokenizer.TokenType.TYPEOF, _tokenizer.TokenType.VOID, _tokenizer.TokenType.BREAK, _tokenizer.TokenType.CASE, _tokenizer.TokenType.CATCH, _tokenizer.TokenType.CLASS, _tokenizer.TokenType.CONTINUE, _tokenizer.TokenType.DEBUGGER, _tokenizer.TokenType.DEFAULT, _tokenizer.TokenType.DO, _tokenizer.TokenType.ELSE, _tokenizer.TokenType.EXPORT, _tokenizer.TokenType.EXTENDS, _tokenizer.TokenType.FINALLY, _tokenizer.TokenType.FOR, _tokenizer.TokenType.FUNCTION, _tokenizer.TokenType.IF, _tokenizer.TokenType.IMPORT, _tokenizer.TokenType.LET, _tokenizer.TokenType.NEW, _tokenizer.TokenType.RETURN, _tokenizer.TokenType.SUPER, _tokenizer.TokenType.SWITCH, _tokenizer.TokenType.THIS, _tokenizer.TokenType.THROW, _tokenizer.TokenType.TRY, _tokenizer.TokenType.VAR, _tokenizer.TokenType.WHILE, _tokenizer.TokenType.WITH, _tokenizer.TokenType.NULL, _tokenizer.TokenType.TRUE, _tokenizer.TokenType.FALSE, _tokenizer.TokenType.YIELD, _tokenizer.TokenType.NUMBER, _tokenizer.TokenType.STRING, _tokenizer.TokenType.REGEXP, _tokenizer.TokenType.IDENTIFIER, _tokenizer.TokenType.CONST, _tokenizer.TokenType.TEMPLATE, _tokenizer.TokenType.ILLEGAL];
let ListHandler_565 = _transitJs2.default.makeWriteHandler({ tag: () => "array", rep: v_571 => v_571 });
let MapHandler_566 = _transitJs2.default.makeWriteHandler({ tag: function tag(v_572) {
    return "map";
  }, rep: function rep(v_573) {
    return v_573;
  }, stringRep: function stringRep(v_574) {
    return null;
  } });
let SyntaxHandler_567 = _transitJs2.default.makeWriteHandler({ tag: () => "stx", rep: v_575 => {
    if (_immutable.List.isList(v_575.token)) {
      return [v_575.token, v_575.scopesets];
    } else {
      let t = _transitJs2.default.objectToMap(v_575.token);
      t.set("type", typeMap_564.indexOf(v_575.token.type));
      return [t, v_575.scopesets];
    }
  } });
let SymbolHandler_568 = _transitJs2.default.makeWriteHandler({ tag: () => "symb", rep: v_576 => [v_576.name] });
let writer_569 = _transitJs2.default.writer("json", { handlers: _transitJs2.default.map([_immutable.List, ListHandler_565, _immutable.Map, MapHandler_566, _syntax2.default, SyntaxHandler_567, _symbol.SymbolClass, SymbolHandler_568]) });
function makeReader_570(bindings_577) {
  return _transitJs2.default.reader("json", { arrayBuilder: { init: node_578 => (0, _immutable.List)().asMutable(), add: (ret_579, val_580, node_581) => ret_579.push(val_580), finalize: (ret_582, node_583) => ret_582.asImmutable(), fromArray: (arr_584, node_585) => (0, _immutable.List)(arr_584) }, mapBuilder: { init: function init(node_586) {
        return (0, _immutable.Map)().asMutable();
      }, add: function add(ret_587, key_588, val_589, node_590) {
        return ret_587.set(key_588, val_589);
      }, finalize: function finalize(ret_591, node_592) {
        return ret_591.asImmutable();
      } }, handlers: { stx: rep_593 => {
        let scopesets_594 = _transitJs2.default.mapToObject(rep_593[1]);
        if (_immutable.List.isList(rep_593[0])) {
          let token = rep_593[0];
          return new _syntax2.default(token, { bindings: bindings_577, scopesets: scopesets_594 });
        } else {
          let token = _transitJs2.default.mapToObject(rep_593[0]);
          token.type = typeMap_564[rep_593[0].get("type")];
          token.slice = rep_593[0].has("slice") ? _transitJs2.default.mapToObject(rep_593[0].get("slice")) : undefined;
          if (token.slice) {
            token.slice.startLocation = _transitJs2.default.mapToObject(token.slice.startLocation);
          }
          return new _syntax2.default(token, { bindings: bindings_577, scopesets: scopesets_594 });
        }
      }, symb: rep_595 => {
        return (0, _symbol.Symbol)(rep_595[0]);
      } } });
}
exports.makeDeserializer = makeReader_570;
exports.serializer = writer_569;