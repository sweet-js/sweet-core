import Tokenizer from "shift-parser/dist/tokenizer";
import { TokenClass, TokenType } from "shift-parser/dist/tokenizer";
import { List } from "immutable";
import Syntax from "./syntax";
import * as R from 'ramda';

let isRegexPrefix = R.anyPass([
  R.whereEq({ size: 0 }),
  p => p.last() && p.last().isPunctuator(),
  p => {
    let last = p.last();
    if (last.isKeyword() && p.pop().size !== 0) {
      let last = p.pop().last();
      return last.isPunctuator() && last.val() !== '.';
    }
    return last.isKeyword();
  }
]);

// TODO: port regex disambiguation from old reader
export default class Reader extends Tokenizer.default {
  constructor(source) {
    super(source);
    this.delimStack = new Map();
    this.prefix = List();
  }

  // (?[Syntax]) -> List<Syntax>
  read(stack = []) {
    while (true) {
      let tok = this.advance();

      if (tok.type === TokenType.EOS) {
        break;
      }

      if (tok.type === TokenType.LPAREN ||
          tok.type === TokenType.LBRACK ||
          tok.type === TokenType.LBRACE) {
        let inner = this.read([new Syntax(tok)]);
        let stx = new Syntax(inner);
        this.prefix = this.prefix.concat(stx);
        stack.push(stx);
      } else if (tok.type === TokenType.RPAREN ||
                 tok.type === TokenType.RBRACK ||
                 tok.type === TokenType.RBRACE) {
        let stx = new Syntax(tok);
        this.prefix = this.prefix.concat(stx);
        stack.push(stx);
        break;
      } else {
        let stx = new Syntax(tok);
        this.prefix = this.prefix.concat(stx);
        stack.push(stx);
      }
    }
    return List(stack);
  }

  advance() {
    let lookahead = super.advance();
    if (lookahead.type === TokenType.DIV && isRegexPrefix(this.prefix)) {
      return super.scanRegExp("/");
    }
    return lookahead;
  }
}
