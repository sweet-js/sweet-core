import Tokenizer from "shift-parser/dist/tokenizer";
import { TokenClass, TokenType } from "shift-parser/dist/tokenizer";
import { List } from "immutable";
import Syntax from "./syntax";
import * as R from 'ramda';

const isLeftBracket = R.whereEq({ type: TokenType.LBRACK });
const isLeftBrace = R.whereEq({ type: TokenType.LBRACE });
const isLeftParen = R.whereEq({ type: TokenType.LPAREN });
const isRightBracket = R.whereEq({ type: TokenType.RBRACK });
const isRightBrace = R.whereEq({ type: TokenType.RBRACE });
const isRightParen = R.whereEq({ type: TokenType.RPAREN });

const isLeftDelimiter = R.anyPass([isLeftBracket, isLeftBrace, isLeftParen]);
const isRightDelimiter = R.anyPass([isRightBracket, isRightBrace, isRightParen]);

const isMatchingDelimiters = R.cond([
  [isLeftBracket, (_, b) => isRightBracket(b)],
  [isLeftBrace, (_, b) => isRightBrace(b)],
  [isLeftParen, (_, b) => isRightParen(b)],
  [R.T, R.F]
]);

// TODO: also, need to handle contextual yield
const literalKeywords = ['this', 'null', 'true', 'false'];

// a -> Boolean
const isLiteralKeyword = x => R.any(R.equals(x), literalKeywords);

const isRegexPrefix = R.anyPass([
  // ε
  R.whereEq({ size: 0 }),
  // P . t   where t ∈ Punctuator
  p => p.last() && p.last().isPunctuator(),
  // P . t . t'  where t != "." and t' ∈ (Keyword \setminus  LiteralKeyword)
  p => {
    let last = p.last();
    if (last.isKeyword() && !(isLiteralKeyword(last.val())) && p.pop().size !== 0) {
      let last = p.pop().last();
      return last.isPunctuator() && last.val() !== '.';
    }
    return last.isKeyword() && !isLiteralKeyword(last.val());
  },
  // P . t . t' . (T)  where t \not = "." and t' ∈ (Keyword \setminus LiteralKeyword)
  p => {
    let last = p.last();
    if (last.isParenDelimiter() && p.pop().size !== 0) {
      let last = p.pop().last();
      if (last.isKeyword() && !(isLiteralKeyword(last.val())) && p.pop().pop().size !== 0) {
        let last = p.pop().pop().last();
        return !(last.isPunctuator() && last.val() === '.');
      }
      return last.isKeyword() && !isLiteralKeyword(last.val());
    }
    return false;
  },
  // P . {T}^l  where isExprPrefix(P, b, l) = false
  p => {
    let last = p.last();
    return last.isCurlyDelimiter();
  }
]);

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
        if (stack[0] && isLeftDelimiter(stack[0].token)) {
          throw this.createUnexpected(tok);
        }
        break;
      }

      if (isLeftDelimiter(tok)) {
        let inner = this.read([new Syntax(tok)]);
        let stx = new Syntax(inner);
        this.prefix = this.prefix.concat(stx);
        stack.push(stx);
      } else if (isRightDelimiter(tok)) {
        if (stack[0] && !isMatchingDelimiters(stack[0].token, tok)) {
          throw this.createUnexpected(tok);
        }
        let stx = new Syntax(tok);
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
