// @flow

import { isEOS } from './char-stream';

import type CharStream from './char-stream';

import { code  } from 'esutils';
const { isLineTerminator,
        isWhiteSpace,
        isDecimalDigit,
        isIdentifierPartES6: isIdentifierPart,
        isIdentifierStartES6: isIdentifierStart } = code;

import { TokenClass, TokenType } from '../tokens';
import * as R from 'ramda';
import { Maybe } from 'ramda-fantasy';
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

export const LSYNTAX = { name: 'left-syntax' };
export const RSYNTAX = { name: 'right-syntax' };

// TODO: also, need to handle contextual yield
const literalKeywords = ['this', 'null', 'true', 'false'];

export { isLineTerminator, isWhiteSpace, isDecimalDigit, isIdentifierStart, isIdentifierPart };

export function getHexValue(rune: string) {
  if ("0" <= rune && rune <= "9") {
    return rune.charCodeAt(0) - 48;
  }
  if ("a" <= rune && rune <= "f") {
    return rune.charCodeAt(0) - 87;
  }
  if ("A" <= rune && rune <= "F") {
    return rune.charCodeAt(0) - 55;
  }
  return -1;
}

export function skipSingleLineComment(stream: CharStream): void {
  let idx = 0;
  let char = stream.peek(idx);
  while (!isEOS(char)) {
    let chCode = char.charCodeAt(0);
    if (isLineTerminator(chCode)) {
      ++idx;
      if (chCode === 0xD /* "\r" */ && stream.peek(idx).charCodeAt(0) === 0xA /*"\n" */) {
        ++idx;
      }
      this.incrementLine();
      break;
    }
    ++idx;
    char = stream.peek(idx);
  }
  stream.readString(idx);
}

export function scanUnicode(stream: CharStream, start: number) {
  const sPeek = stream.peek.bind(stream);
  let idx = start;
  let hexDigits = 0;
  if (sPeek(idx) === '{') {
    //\u{HexDigits}
    ++idx;
    let char = sPeek(idx);
    while (!isEOS(char)) {
      let hex = getHexValue(char);
      if (hex === -1) break;
      hexDigits = (hexDigits << 4) | hex;
      if (hexDigits > 0x10FFFF) {
        throw this.createILLEGAL(char);
      }
      char = sPeek(++idx);
    }
    if (char !== '}') {
      throw this.createILLEGAL(char);
    }
    if (idx === start + 1) {
      throw this.createILLEGAL(stream.peek(idx+1));
    }
    ++idx;
  } else {
    //\uHex4Digits
    if (isEOS(sPeek(idx + 3))) return -1;
    let r;
    for (; idx < start + 4; ++idx) {
      r = getHexValue(sPeek(idx));
      if (r === -1) return -1;
      hexDigits = (hexDigits << 4) | r;
    }
  }
  stream.readString(idx);

  return hexDigits;
}

export function readStringEscape(str: string, stream: CharStream, start: number, octal: ?string) {
  let idx = start + 1,
      char = stream.peek(idx),
      lineStart;
  if (isEOS(char)) throw this.createILLEGAL(char);

  if (!isLineTerminator(char.charCodeAt(0))) {
    switch (char) {
      case 'b': str += '\b'; ++idx; break;
      case 'f': str += '\f'; ++idx; break;
      case 'n': str += '\n'; ++idx; break;
      case 'r': str += '\r'; ++idx; break;
      case 't': str += '\t'; ++idx; break;
      case 'v': str += "\u000B"; ++idx; break;
      case 'u':
      case 'x': {
        let unescaped;
        ++idx;
        let nxt = stream.peek(idx);
        if (isEOS(nxt)) {
          throw this.createILLEGAL(nxt);
        }
        unescaped = char === 'u' ? scanUnicode.call(this, stream, idx) : scanHexEscape2.call(this, stream);
        if (unescaped === -1) throw this.createILLEGAL(char);
        idx = 0; // stream is read in scanUnicode and scanHexEscape2

        str += String.fromCodePoint(unescaped);
        break;
      }
      default: {
        if ('0' <= char && char <= '7') {
          [str, idx, octal] = scanOctal.call(this, str, stream, char, idx, octal);
        } else if(char === '8' || char === '9') {
          throw this.createILLEGAL(char);
        } else {
          str += char;
          ++idx;
        }
      }
    }
  } else {
    if (char === '\r' && stream.peek(idx + 1) === '\n') {
      ++idx;
    }
    ++idx;
    this.incrementLine();
    lineStart = idx;
  }
  return [str, idx, octal, lineStart];
}

function scanOctal(str, stream, char, start, octal) {
  let len = 1, idx = start;
  if ('0' <= char && char <= '3') {
    len = 0;
  }
  let code = 0;

  while (len < 3 && '0' <= char && char <= '7') {
    ++idx;
    if (len > 0 || char !== '0') {
      let octalCount = idx - start;
      if (octal == null) octal = '';
      octal += char;
    }
    code *= 8;
    code += +char; //coersion
    ++len;
    char = stream.peek(idx);
    if (isEOS(char)) {
      throw this.createILLEGAL(char);
    }
  }
  str += String.fromCharCode(code);
  return [str, idx, octal];
}

function scanHexEscape2(stream, idx) {
  let char = stream.peek(idx);

  if (isEOS(char)) return -1;

  let r1 = getHexValue(stream.peek());
  if (r1 === -1) return r1;

  let r2 = getHexValue(stream.peek(1));
  if (r2 === -1) return r2;

  stream.readString(2);
  return r1 << 4 | r2;
}

export function insertSequence(coll: Object, seq: string) {
  const char = seq[0];
  if (!coll[char]) {
    coll[char] = {};
  }
  if (seq.length === 1) {
    coll[char].isValue = true;
    return coll;
  } else {
    coll[char] = insertSequence(coll[char], seq.slice(1));
    return coll;
  }
}

export function retrieveSequenceLength(table: Object, stream: CharStream, idx: number) {
  const char = stream.peek(idx);
  if (!table[char]) {
    if (table.isValue) return idx;
    return -1;
  } else {
    return retrieveSequenceLength(table[char], stream, ++idx);
  }
}

// Token -> Boolean
const isLeftBracket  = R.whereEq({ type: TokenType.LBRACK });
const isLeftBrace    = R.whereEq({ type: TokenType.LBRACE });
const isLeftParen    = R.whereEq({ type: TokenType.LPAREN });
const isRightBracket = R.whereEq({ type: TokenType.RBRACK });
const isRightBrace   = R.whereEq({ type: TokenType.RBRACE });
const isRightParen   = R.whereEq({ type: TokenType.RPAREN });

// const isEOS = R.whereEq({ type: TokenType.EOS });

// const isHash = R.whereEq({ type: TokenType.IDENTIFIER, value: '#'});
const isLeftSyntax = R.whereEq({ type: LSYNTAX });
const isRightSyntax = R.whereEq({ type: RSYNTAX });

const isLeftDelimiter = R.anyPass([isLeftBracket,
                                   isLeftBrace,
                                   isLeftParen,
                                   isLeftSyntax]);

const isRightDelimiter = R.anyPass([isRightBracket,
                                    isRightBrace,
                                    isRightParen,
                                    isRightSyntax]);

const isMatchingDelimiters = R.cond([
  [isLeftBracket, (_, b) => isRightBracket(b)],
  [isLeftBrace, (_, b) => isRightBrace(b)],
  [isLeftParen, (_, b) => isRightParen(b)],
  [isLeftSyntax, (_, b) => isRightSyntax(b)],
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
const isPunctuator = s => s.match("punctuator");
const isKeyword = s => s.match("keyword");
const isParens = s => s.match("parens");
const isBraces = s => s.match("braces");
const isIdentifier = s => s.match("identifier");

// Any -> Syntax -> Boolean
const isVal = R.curry((v, s) => s.val() === v);

// Syntax -> Boolean
const isDot = R.allPass([isPunctuator, isVal('.')]);
const isColon = R.allPass([isPunctuator, isVal(':')]);
const isFunctionKeyword = R.allPass([isKeyword, isVal('function')]);
const isOperator = s => (s.match("punctuator") || s.match("keyword")) &&
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

// TODO: better name (areTrue & areFalse)?
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
    return s.match("keyword") && s.val() === 'return' && s.lineNumber() === l;
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
export let isExprPrefix = R.curry((l, b) => R.cond([
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
let curly = p => safeLast(p).map(isBraces).chain(stuffTrue(p));
let paren = p => safeLast(p).map(isParens).chain(stuffTrue(p));
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
  p => safeLast(p).map(s => !(s.match("punctuator") && s.val() === '.')).chain(stuffTrue(p))
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
export const isRegexPrefix = (exprAllowed: boolean) => R.anyPass([
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
            return pop(p).map(isExprPrefix(fnLine, exprAllowed));
          })
          .chain(stuffFalse(p));
      }
    ),
    Maybe.isJust
  ),
  // P . {T}^l  where isExprPrefix(P, b, l) = false
  p => {
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
          return pop(p).map(isExprPrefix(curlyLine, exprAllowed));
        })
        .chain(stuffFalse(p));
      }),
      Maybe.isJust
    )(p);
  }


]);

function lastEl(l) {
  return l[l.length - 1];
}

