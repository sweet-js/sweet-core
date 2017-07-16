// @flow

import { isEOS } from 'readtable';
import { List } from 'immutable';

import type { Readtable, CharStream } from 'readtable';

import { code } from 'esutils';
import type { TokenTree } from '../tokens';
import {
  getLineNumber,
  isPunctuator,
  isKeyword,
  isBraces,
  isParens,
  isIdentifier,
} from '../tokens';

const {
  isLineTerminator,
  isWhiteSpace,
  isDecimalDigit,
  isIdentifierPartES6: isIdentifierPart,
  isIdentifierStartES6: isIdentifierStart,
} = code;

import * as R from 'ramda';
import { Maybe } from 'ramda-fantasy';
const Nothing = Maybe.Nothing;

// TODO: also, need to handle contextual yield
const literalKeywords = ['this', 'null', 'true', 'false'];

export {
  isLineTerminator,
  isWhiteSpace,
  isDecimalDigit,
  isIdentifierStart,
  isIdentifierPart,
};

export function getHexValue(rune: string) {
  if ('0' <= rune && rune <= '9') {
    return rune.charCodeAt(0) - 48;
  }
  if ('a' <= rune && rune <= 'f') {
    return rune.charCodeAt(0) - 87;
  }
  if ('A' <= rune && rune <= 'F') {
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
      if (chCode === 0xd /* "\r" */ && stream.peek(idx).charCodeAt(0) === 0xa) {
        /*"\n" */ ++idx;
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
      if (hexDigits > 0x10ffff) {
        throw this.createILLEGAL(char);
      }
      char = sPeek(++idx);
    }
    if (char !== '}') {
      throw this.createILLEGAL(char);
    }
    if (idx === start + 1) {
      throw this.createILLEGAL(stream.peek(idx + 1));
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

export function readStringEscape(
  str: string,
  stream: CharStream,
  start: number,
  octal: ?string,
) {
  let idx = start + 1,
    char = stream.peek(idx),
    lineStart;
  if (isEOS(char)) throw this.createILLEGAL(char);

  if (!isLineTerminator(char.charCodeAt(0))) {
    switch (char) {
      case 'b':
        str += '\b';
        ++idx;
        break;
      case 'f':
        str += '\f';
        ++idx;
        break;
      case 'n':
        str += '\n';
        ++idx;
        break;
      case 'r':
        str += '\r';
        ++idx;
        break;
      case 't':
        str += '\t';
        ++idx;
        break;
      case 'v':
        str += '\u000B';
        ++idx;
        break;
      case 'u':
      case 'x': {
        let unescaped;
        ++idx;
        let nxt = stream.peek(idx);
        if (isEOS(nxt)) {
          throw this.createILLEGAL(nxt);
        }
        unescaped =
          char === 'u'
            ? scanUnicode.call(this, stream, idx)
            : scanHexEscape2.call(this, stream, idx);
        if (unescaped === -1) throw this.createILLEGAL(char);
        idx = 0; // stream is read in scanUnicode and scanHexEscape2

        str += String.fromCodePoint(unescaped);
        break;
      }
      default: {
        if ('0' <= char && char <= '7') {
          [str, idx, octal] = scanOctal.call(
            this,
            str,
            stream,
            char,
            idx,
            octal,
          );
        } else if (char === '8' || char === '9') {
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
  let len = 1,
    idx = start;
  if ('0' <= char && char <= '3') {
    len = 0;
  }
  let code = 0;

  while (len < 3 && '0' <= char && char <= '7') {
    ++idx;
    if (len > 0 || char !== '0') {
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

  let r1 = getHexValue(char);
  if (r1 === -1) return r1;

  let r2 = getHexValue(stream.peek(idx + 1));
  if (r2 === -1) return r2;

  stream.readString(idx + 1);
  return (r1 << 4) | r2;
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

export const isTerminating = (table: Readtable) => (char: string): boolean =>
  table.getMapping(char).mode === 'terminating';

// check for terminating doesn't work if it's at the start
export function retrieveSequenceLength(
  table: Object,
  stream: CharStream,
  idx: number,
): number {
  const char = stream.peek(idx);
  if (!table[char]) {
    if (table.isValue) return idx;
    return -1;
  } else {
    return retrieveSequenceLength(table[char], stream, ++idx);
  }
}

const assignOps = [
  '=',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',
  '<<=',
  '>>=',
  '>>>=',
  '&=',
  '|=',
  '^=',
  ',',
];

const binaryOps = [
  '+',
  '-',
  '*',
  '/',
  '%',
  '<<',
  '>>',
  '>>>',
  '&',
  '|',
  '^',
  '&&',
  '||',
  '?',
  ':',
  '===',
  '==',
  '>=',
  '<=',
  '<',
  '>',
  '!=',
  '!==',
  'instanceof',
];

const unaryOps = [
  '++',
  '--',
  '~',
  '!',
  'delete',
  'void',
  'typeof',
  'yield',
  'throw',
  'new',
];

const allOps = assignOps.concat(binaryOps).concat(unaryOps);

function isNonLiteralKeyword(t: TokenTree) {
  return isKeyword(t) && t.value && !R.contains(t.value, literalKeywords);
}
const exprPrefixKeywords = [
  'instanceof',
  'typeof',
  'delete',
  'void',
  'yield',
  'throw',
  'new',
  'case',
];

function isExprReturn(l: number, p: List<TokenTree>) {
  // ... return {x: 42} /r /i
  // ... return\n{x: 42} /r /i
  return popRestMaybe(p)
    .map(
      ([retKwd, rest]) =>
        isKeyword(retKwd, 'return') && getLineNumber(retKwd) === l,
    )
    .getOrElse(false);
}

// List a -> Boolean
function isTopPunctuator(p: List<TokenTree>) {
  return popMaybe(p).map(punc => isPunctuator(punc)).getOrElse(false);
}

function isOperator(op: TokenTree) {
  if ((isPunctuator(op) || isKeyword(op)) && op.value != null) {
    const opVal = op.value; // the const is because flow doesn't know op.value isn't mutated
    return allOps.some(o => o === opVal);
  }
  return false;
}

function isTopOperator(p: List<TokenTree>) {
  return popMaybe(p)
    .map(op => {
      return isOperator(op);
    })
    .getOrElse(false);
}

function isExprPrefixKeyword(kwd: TokenTree) {
  return isKeyword(kwd, exprPrefixKeywords);
}

function isTopKeywordExprPrefix(p: List<TokenTree>) {
  return popMaybe(p)
    .map(kwd => {
      return isExprPrefixKeyword(kwd);
    })
    .getOrElse(false);
}

function isTopColon(p: List<TokenTree>) {
  return popMaybe(p)
    .map(colon => {
      if (isPunctuator(colon, ':')) {
        return true;
      }
      return false;
    })
    .getOrElse(false);
}

export function isExprPrefix(l: number, b: boolean, p: List<TokenTree>) {
  if (p.size === 0) {
    // ... ({x: 42} /r/i)
    return b;
  } else if (isTopColon(p)) {
    // ... ({x: {x: 42} /r/i })
    return b;
  } else if (isTopKeywordExprPrefix(p)) {
    // ... throw {x: 42} /r/i
    return true;
  } else if (isTopOperator(p)) {
    // ... 42 + {x: 42} /r/i
    return true;
  } else if (isTopPunctuator(p)) {
    // ... for ( ; {x: 42}/r/i)
    return b;
  } else if (isExprReturn(l, p)) {
    // ... return {x: 42} /r /i
    // ... return\n{x: 42} /r /i
    return true;
  }
  return false;
}

function popMaybe<T>(p: List<T>): Maybe<T> {
  if (p.size >= 1) {
    return Maybe.of(p.last());
  }
  return Nothing();
}

function isTopStandaloneKeyword(prefix: List<TokenTree>) {
  // P . t . t'  where t \not = "." and t' ∈ (Keyword \setminus  LiteralKeyword)
  return popRestMaybe(prefix)
    .map(([kwd, rest]) => {
      if (isNonLiteralKeyword(kwd)) {
        return Maybe.maybe(
          true,
          dot => !isPunctuator(dot, '.'),
          popMaybe(rest),
        );
      }
      return false;
    })
    .getOrElse(false);
}

function isTopParensWithKeyword(prefix: List<TokenTree>) {
  // P . t . t' . (T)  where t \not = "." and t' ∈ (Keyword \setminus LiteralKeyword)
  return popRestMaybe(prefix)
    .chain(
      ([paren, rest]) => (isParens(paren) ? popRestMaybe(rest) : Nothing()),
    )
    .map(([kwd, rest]) => {
      if (isNonLiteralKeyword(kwd)) {
        return Maybe.maybe(
          true,
          dot => !isPunctuator(dot, '.'),
          popMaybe(rest),
        );
      }
      return false;
    })
    .getOrElse(false);
}

function popRestMaybe(p: List<TokenTree>): Maybe<[TokenTree, List<TokenTree>]> {
  if (p.size > 0) {
    let last = p.last();
    let rest = p.pop();
    return Maybe.of([last, rest]);
  }
  return Nothing();
}

function isTopFunctionExpression(
  prefix: List<TokenTree>,
  exprAllowed: boolean,
) {
  // P . function^l . x? . () . {}     where isExprPrefix(P, b, l) = false
  return popRestMaybe(prefix)
    .chain(([curly, rest]) => {
      if (isBraces(curly)) {
        return popRestMaybe(rest);
      }
      return Nothing();
    })
    .chain(([paren, rest]) => {
      if (isParens(paren)) {
        return popRestMaybe(rest);
      }
      return Nothing();
    })
    .chain(([optIdent, rest]) => {
      if (isIdentifier(optIdent)) {
        return popRestMaybe(rest);
      }
      return Maybe.of([optIdent, rest]);
    })
    .chain(([fnKwd, rest]) => {
      if (isKeyword(fnKwd, 'function')) {
        let l = getLineNumber(fnKwd);
        if (l == null) {
          throw new Error('Un-expected null line number');
        }
        return Maybe.of(!isExprPrefix(l, exprAllowed, rest));
      }
      return Maybe.of(false);
    })
    .getOrElse(false);
}

function isTopObjectLiteral(prefix: List<TokenTree>, exprAllowed: boolean) {
  // P . {T}^l  where isExprPrefix(P, b, l) = false
  return popRestMaybe(prefix)
    .chain(([braces, rest]) => {
      if (isBraces(braces)) {
        let l = getLineNumber(braces);
        if (l == null) {
          throw new Error('Un-expected null line number');
        }
        return Maybe.of(!isExprPrefix(l, exprAllowed, rest));
      }
      return Maybe.of(false);
    })
    .getOrElse(false);
}

function isTopFunction(prefix: List<TokenTree>) {
  // P . function^l . x? . () . {}     where isExprPrefix(P, b, l) = false
  return popRestMaybe(prefix)
    .chain(([curly, rest]) => {
      if (isBraces(curly)) {
        return popRestMaybe(rest);
      }
      return Nothing();
    })
    .chain(([paren, rest]) => {
      if (isParens(paren)) {
        return popRestMaybe(rest);
      }
      return Nothing();
    })
    .chain(([optIdent, rest]) => {
      if (isIdentifier(optIdent)) {
        return popRestMaybe(rest);
      }
      return Maybe.of([optIdent, rest]);
    })
    .chain(([fnKwd, rest]) => {
      if (isKeyword(fnKwd, 'function')) {
        return Maybe.of(true);
      }
      return Maybe.of(false);
    })
    .getOrElse(false);
}

export function isRegexPrefix(exprAllowed: boolean, prefix: List<TokenTree>) {
  if (prefix.isEmpty()) {
    // ε
    return true;
  } else if (isTopPunctuator(prefix)) {
    // P . t   where t ∈ Punctuator
    return true;
  } else if (isTopStandaloneKeyword(prefix)) {
    // P . t . t'  where t \not = "." and t' ∈ (Keyword \setminus  LiteralKeyword)
    return true;
  } else if (isTopParensWithKeyword(prefix)) {
    // P . t . t' . (T)  where t \not = "." and t' ∈ (Keyword \setminus LiteralKeyword)
    return true;
  } else if (isTopFunction(prefix)) {
    // P . function^l . x? . () . {}     where isExprPrefix(P, b, l) = false
    return isTopFunctionExpression(prefix, exprAllowed);
  } else if (isTopObjectLiteral(prefix, exprAllowed)) {
    // P . {T}^l  where isExprPrefix(P, b, l) = false
    return true;
  }
  return false;
}
