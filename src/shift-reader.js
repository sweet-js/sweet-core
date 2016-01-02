import Tokenizer from "shift-parser/dist/tokenizer";
import { TokenClass, TokenType } from "shift-parser/dist/tokenizer";
import { List } from "immutable";
import Syntax from "./syntax";
import * as R from 'ramda';
import { Maybe } from 'ramda-fantasy';
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

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

// (List a) => a -> Maybe a
let last = (p) => p.last() ? Just(p.last()) : Nothing();

// (Syntax a) => a -> Boolean
let isFunKwd = t => t.isKeyword() && t.val() === 'function';


// TODO: better name
let stuffTrue = R.curry((p, b) => b ? Just(p) : Nothing());

// (List a) => a -> Maybe a
let isCurly = p => last(p).map(s => s.isCurlyDelimiter()).chain(stuffTrue(p));
let isParen = p => last(p).map(s => s.isParenDelimiter()).chain(stuffTrue(p));
let isFunction = p => last(p).map(isFunKwd).chain(stuffTrue(p));
let isIdent = p => last(p).map(s => s.isIdentifier()).chain(stuffTrue(p));
let isNonLiteralKeyword = p =>
  last(p)
    .map(s => s.isKeyword() && !isLiteralKeyword(s.val()))
    .chain(stuffTrue(p));

let opt = R.curry((a, b, p) => {
  let result = R.pipeK(a, b)(Maybe.of(p));
  return Maybe.isJust(result) ? result : Maybe.of(p);
});

let isNotDot = R.ifElse(
  R.whereEq({size: 0}),
  Just,
  p => last(p).map(s => !(s.isPunctuator() && s.val() === '.')).chain(stuffTrue(p))
);

// (List a) => a -> Maybe a
let pop = R.compose(Just, p => p.pop());

let isExprPunctuator = s => s.isPunctuator();

let isNotExprPrefix = l => R.ifElse(
  R.whereEq({size: 0}),
  Just,
  p => last(p).map(R.complement(isExprPunctuator)).chain(stuffTrue(p))
);

const isRegexPrefix = R.anyPass([
  // ε
  R.whereEq({ size: 0 }),
  // P . t   where t ∈ Punctuator
  p => p.last() && p.last().isPunctuator(),
  // P . t . t'  where t != "." and t' ∈ (Keyword \setminus  LiteralKeyword)
  p => {
    let isKeywordStatement = R.pipeK(
      isNonLiteralKeyword,
      pop,
      isNotDot
    )(Maybe.of(p));
    return isKeywordStatement.isJust();
  },
  // P . t . t' . (T)  where t \not = "." and t' ∈ (Keyword \setminus LiteralKeyword)
  p => {
    let isKeywordParenStatement = R.pipeK(
      isParen,
      pop,
      isNonLiteralKeyword,
      pop,
      isNotDot
    )(Maybe.of(p));
    return isKeywordParenStatement.isJust();
  },
  // P . function^l . x? . () . {}     where isExprPrefix(P, b, l) = false
  p => {
    let isFunctionDeclaration = R.pipeK(
      isCurly,
      pop,
      isParen,
      pop,
      opt(isIdent, pop),
      isFunction,
      p => {
        return last(p)
          .map(s => s.lineNumber())
          .chain(l => {
            return isNotExprPrefix(l)(p.pop());
          });
      }
    )(Maybe.of(p));

    return isFunctionDeclaration.isJust();
  },
  // P . {T}^l  where isExprPrefix(P, b, l) = false
  //p => {
  //  let last = p.last();
  //  return last.isCurlyDelimiter();
  //}
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
