/* @flow */
import Tokenizer from "shift-parser/dist/tokenizer";
import { TokenClass, TokenType } from "shift-parser/dist/tokenizer";
import { List } from "immutable";
import Syntax from "./syntax";
import * as R from 'ramda';
import { Maybe } from 'ramda-fantasy';
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

// TODO: also, need to handle contextual yield
const literalKeywords = ['this', 'null', 'true', 'false'];

// Token -> Boolean
const isLeftBracket  = R.whereEq({ type: TokenType.LBRACK });
const isLeftBrace    = R.whereEq({ type: TokenType.LBRACE });
const isLeftParen    = R.whereEq({ type: TokenType.LPAREN });
const isRightBracket = R.whereEq({ type: TokenType.RBRACK });
const isRightBrace   = R.whereEq({ type: TokenType.RBRACE });
const isRightParen   = R.whereEq({ type: TokenType.RPAREN });


const isLeftDelimiter = R.anyPass([isLeftBracket, isLeftBrace, isLeftParen]);
const isRightDelimiter = R.anyPass([isRightBracket, isRightBrace, isRightParen]);

const isMatchingDelimiters = R.cond([
  [isLeftBracket, (_, b) => isRightBracket(b)],
  [isLeftBrace, (_, b) => isRightBrace(b)],
  [isLeftParen, (_, b) => isRightParen(b)],
  [R.T, R.F]
]);

const assignOps =  ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=",
                  "&=", "|=", "^=", ","];

const binaryOps = ["+", "-", "*", "/", "%","<<", ">>", ">>>", "&", "|", "^",
                 "&&", "||", "?", ":",
                 "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];

const unaryOps = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];

// List -> Boolean
const isEmpty = R.whereEq({size: 0});

// Syntax -> Boolean
const isPunctuator = s => s.isPunctuator();
const isKeyword = s => s.isKeyword();
const isDelimiter = s => s.isDelimiter();
const isParenDelimiter = s => s.isParenDelimiter();
const isCurlyDelimiter = s => s.isCurlyDelimiter();
const isSquareDelimiter = s => s.isSquareDelimiter();
const isIdentifier = s => s.isIdentifier();

// Syntax -> any
const val = s => s.val();
// Any -> Syntax -> Boolean
const isVal = R.curry((v, s) => s.val() === v);

// Syntax -> Boolean
const isDot = R.allPass([isPunctuator, isVal('.')]);
const isColon = R.allPass([isPunctuator, isVal(':')]);
const isFunctionKeyword = R.allPass([isKeyword, isVal('function')]);
const isOperator = s => (s.isPunctuator() || s.isKeyword()) &&
                          R.any(R.equals(s.val()),
                                assignOps.concat(binaryOps).concat(unaryOps));
const isNonLiteralKeyword = R.allPass([isKeyword,
                                       s => R.none(R.equals(s.val()), literalKeywords)]);
const isKeywordExprPrefix = R.allPass([isKeyword,
  s => R.any(R.equals(s.val()), ['instanceof', 'typeof', 'delete', 'void',
                                  'yield', 'throw', 'new', 'case'])]);
// List a -> a?
let last = p => p.last();
// List a -> Maybe a
let safeLast = R.pipe(R.cond([
  [isEmpty, R.always(Nothing())],
  [R.T, R.compose(Maybe.of, last)]
]));

// TODO: better name
// List -> Boolean -> Maybe List
let stuffTrue = R.curry((p, b) => b ? Just(p) : Nothing());
let stuffFalse = R.curry((p, b) => !b ? Just(p) : Nothing());

// List a -> Boolean
let isTopColon = R.pipe(
  safeLast,
  R.map(isColon),
  Maybe.maybe(false, R.identity)
);
// List a -> Boolean
let isTopPunctuator = R.pipe(
  safeLast,
  R.map(isPunctuator),
  Maybe.maybe(false, R.identity)
);

// Number -> List -> Boolean
let isExprReturn = R.curry((l, p) => {
  let retKwd = safeLast(p);
  let maybeDot = pop(p).chain(safeLast);

  if (maybeDot.map(isDot).getOrElse(false)) {
    return true;
  }
  return retKwd.map(s => {
    return s.isKeyword() && s.val() === 'return' && s.lineNumber() === l;
  }).getOrElse(false);
});

const isTopOperator = R.pipe(
  safeLast,
  R.map(isOperator),
  Maybe.maybe(false, R.identity)
);

const isTopKeywordExprPrefix = R.pipe(
  safeLast,
  R.map(isKeywordExprPrefix),
  Maybe.maybe(false, R.identity)
);

// Number -> Boolean -> List -> Boolean
let isExprPrefix = R.curry((l, b) => R.cond([
  // ... ({x: 42} /r/i)
  [isEmpty, R.always(b)],
  // ... ({x: {x: 42} /r/i })
  [isTopColon, R.always(b)],
  // ... throw {x: 42} /r/i
  [isTopKeywordExprPrefix, R.T],
  // ... 42 + {x: 42} /r/i
  [isTopOperator, R.T],
  // ... for ( ; {x: 42}/r/i)
  [isTopPunctuator, R.always(b)],
  // ... return {x: 42} /r /i
  // ... return\n{x: 42} /r /i
  [isExprReturn(l), R.T],
  [R.T, R.F],
]));

// List a -> Maybe List a
let curly = p => safeLast(p).map(isCurlyDelimiter).chain(stuffTrue(p));
let paren = p => safeLast(p).map(isParenDelimiter).chain(stuffTrue(p));
let func = p => safeLast(p).map(isFunctionKeyword).chain(stuffTrue(p));
let ident = p => safeLast(p).map(isIdentifier).chain(stuffTrue(p));
let nonLiteralKeyword = p => safeLast(p).map(isNonLiteralKeyword).chain(stuffTrue(p));

let opt = R.curry((a, b, p) => {
  let result = R.pipeK(a, b)(Maybe.of(p));
  return Maybe.isJust(result) ? result : Maybe.of(p);
});

let notDot = R.ifElse(
  R.whereEq({size: 0}),
  Just,
  p => safeLast(p).map(s => !(s.isPunctuator() && s.val() === '.')).chain(stuffTrue(p))
);

// List a -> Maybe List a
let pop = R.compose(Just, p => p.pop());

// Maybe List a -> Maybe List a
const functionPrefix = R.pipeK(
    curly,
    pop,
    paren,
    pop,
    opt(ident, pop),
    func);

// Boolean -> List a -> Boolean
const isRegexPrefix = b => R.anyPass([
  // ε
  isEmpty,
  // P . t   where t ∈ Punctuator
  isTopPunctuator,
  // P . t . t'  where t \not = "." and t' ∈ (Keyword \setminus  LiteralKeyword)
  R.pipe(
    Maybe.of,
    R.pipeK(
      nonLiteralKeyword,
      pop,
      notDot
    ),
    Maybe.isJust
  ),
  // P . t . t' . (T)  where t \not = "." and t' ∈ (Keyword \setminus LiteralKeyword)
  R.pipe(
    Maybe.of,
    R.pipeK(
      paren,
      pop,
      nonLiteralKeyword,
      pop,
      notDot
    ),
    Maybe.isJust
  ),
  // P . function^l . x? . () . {}     where isExprPrefix(P, b, l) = false
  R.pipe(
    Maybe.of,
    functionPrefix,
    R.chain(p => {
        return safeLast(p)
          .map(s => s.lineNumber())
          .chain(fnLine => {
            return pop(p).map(isExprPrefix(fnLine, b));
          })
          .chain(stuffFalse(p));
      }
    ),
    Maybe.isJust
  ),
  // P . {T}^l  where isExprPrefix(P, b, l) = false
  p => {
    let isCurly = Maybe.isJust(safeLast(p).map(isCurlyDelimiter));
    let alreadyCheckedFunction = R.pipe(
      Maybe.of,
      functionPrefix,
      Maybe.isJust
    )(p);
    if (alreadyCheckedFunction) {
      return false;
    }
    return R.pipe(
      Maybe.of,
      R.chain(curly),
      R.chain(p => {
        return safeLast(p)
        .map(s => s.lineNumber())
        .chain(curlyLine => {
          return pop(p).map(isExprPrefix(curlyLine, b));
        })
        .chain(stuffFalse(p));
      }),
      Maybe.isJust
    )(p);
  }


]);

export default class Reader extends Tokenizer.default {
  constructor(source/*: string */) {
    super(source);
    this.delimStack = new Map();
  }

  read(stack/*: Array<any> */ = [], b = false)/*: List */ {
    let prefix = List();
    while (true) {
      let tok = this.advance(prefix, b);

      if (tok.type === TokenType.EOS) {
        if (stack[0] && isLeftDelimiter(stack[0].token)) {
          throw this.createUnexpected(tok);
        }
        break;
      }

      if (isLeftDelimiter(tok)) {
        let line = tok.slice.startLocation.line;
        let innerB = isLeftBrace(tok) ? isExprPrefix(line, b)(prefix) : true;
        let inner = this.read([new Syntax(tok)], innerB);
        let stx = new Syntax(inner);
        prefix = prefix.concat(stx);
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
        prefix = prefix.concat(stx);
        stack.push(stx);
      }
    }
    return List(stack);
  }

  advance(prefix, b)/*: any */ {
    let lookahead = super.advance();
    if (lookahead.type === TokenType.DIV && isRegexPrefix(b)(prefix)) {
      return super.scanRegExp("/");
    }
    return lookahead;
  }
}
