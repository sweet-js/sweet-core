// @flow

import { scanUnicode } from './utils';

import { isEOS } from './char-stream';
import type CharStream from './char-stream';

import { code } from 'esutils';

import { IdentifierToken } from '../tokens';

import { isIdentifierPart, isIdentifierStart } from './utils';


export default function readIdentifier(stream: CharStream) {
  let char = stream.peek();
  let code;
  let check = isIdentifierStart;
  let idx = 0;
  while(!isEOS(char)) {
    code = char.charCodeAt(0);
    if (char === '\\' || 0xD800 <= code && code <= 0xDBFF) {
      return new IdentifierToken({
        value: getEscapedIdentifier.call(this, stream)
      });
    }
    if (!check(code)) {
      return new IdentifierToken({
        value: stream.readString(idx)
      });
    }
    char = stream.peek(++idx);
    check = isIdentifierPart;
  }
  return new IdentifierToken({
    value: stream.readString(idx)
  });
}

function getEscapedIdentifier(stream) {
  const sPeek = stream.peek.bind(stream);
  let id = '';
  let check = isIdentifierStart;
  let char = sPeek();
  let code = char.charCodeAt(0);
  while (!isEOS(char)) {
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
    } else if (0xD800 <= code && code <= 0xDBFF) {
      if (isEOS(char)) {
        throw this.createILLEGAL(char);
      }
      let lowSurrogateCode = sPeek(1).charCodeAt(0);
      if (0xDC00 > lowSurrogateCode || lowSurrogateCode > 0xDFFF) {
        throw this.createILLEGAL(char);
      }
      stream.readString(2);
      code = decodeUtf16(code, lowSurrogateCode);
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
  return (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
}

