// @flow

import { scanUnicode } from './utils';

import { isEOS, getCurrentReadtable } from 'readtable';
import type { CharStream } from 'readtable';

import { IdentifierToken } from '../tokens';

import { isTerminating, isIdentifierPart, isIdentifierStart } from './utils';

let terminates;

const startsEscape = code => {
  if (code === 0x005c /* backslash */) return true;
  return 0xd800 <= code && code <= 0xdbff;
};

export default function readIdentifier(stream: CharStream) {
  terminates = isTerminating(getCurrentReadtable());
  let char = stream.peek();
  let code = char.charCodeAt(0);
  let check = isIdentifierStart;

  // If the first char is invalid
  if (!check(code) && !startsEscape(code)) {
    throw this.createError('Invalid or unexpected token');
  }

  let idx = 0;
  while (!terminates(char) && !isEOS(char)) {
    if (startsEscape(code)) {
      return new IdentifierToken({
        value: getEscapedIdentifier.call(this, stream),
      });
    }
    if (!check(code)) {
      return new IdentifierToken({
        value: stream.readString(idx),
      });
    }
    char = stream.peek(++idx);
    code = char.charCodeAt(0);
    check = isIdentifierPart;
  }
  return new IdentifierToken({
    value: stream.readString(idx),
  });
}

function getEscapedIdentifier(stream) {
  const sPeek = stream.peek.bind(stream);
  let id = '';
  let check = isIdentifierStart;
  let char = sPeek();
  let code = char.charCodeAt(0);
  while (!terminates(char) && !isEOS(char)) {
    let streamRead = false;
    if (char === '\\') {
      let nxt = sPeek(1);
      if (isEOS(nxt)) {
        throw this.createILLEGAL(char);
      }
      if (nxt !== 'u') {
        throw this.createILLEGAL(char);
      }
      code = scanUnicode(stream, 2);
      streamRead = true;
      if (code < 0) {
        throw this.createILLEGAL(char);
      }
    } else if (0xd800 <= code && code <= 0xdbff) {
      if (isEOS(char)) {
        throw this.createILLEGAL(char);
      }
      let lowSurrogateCode = sPeek(1).charCodeAt(0);
      if (0xdc00 > lowSurrogateCode || lowSurrogateCode > 0xdfff) {
        throw this.createILLEGAL(char);
      }
      stream.readString(2);
      code = decodeUtf16(code, lowSurrogateCode);
      streamRead = true;
    }
    if (!check(code)) {
      if (id.length < 1) {
        throw this.createILLEGAL(char);
      }
      return id;
    }

    if (!streamRead) stream.readString();

    id += String.fromCodePoint(code);
    char = sPeek();
    code = char.charCodeAt(0);
    check = isIdentifierPart;
  }
  return id;
}

function decodeUtf16(lead, trail) {
  return (lead - 0xd800) * 0x400 + (trail - 0xdc00) + 0x10000;
}
