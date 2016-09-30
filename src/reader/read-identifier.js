import { isEOS } from '../char-stream';
import { scanUnicode } from './utils';

import { code } from 'esutils';

const { isIdentifierPartES6: isIdentifierPart,
        isIdentifierStartES6: isIdentifierStart } = code;


export default function readIdentifier(stream) {
  let char = stream.peek();
  let code = char.charCodeAt(0);
  let check = isIdentifierStart;
  let idx = 1;
  while(!isEOS(char)) {
    if (char === '\\' || 0xD800 <= code && code <= 0xDBFF) {
      return getEscapedIdentifier(stream);
    }
    if (!check(code)) {
      return stream.readString(idx);
    }
    char = stream.peek(++idx);
    code = char.charCodeAt(0);
    check = isIdentifierPart;
  }
  return stream.readString(idx);
}

function getEscapedIdentifier(stream) {
  const sPeek = stream.peek.bind(stream);
  let id = '';
  let check = isIdentifierStart;
  let char = sPeek();
  let code = char.charCodeAt(0);
  while (!isEOS(char)) {
    if (char === '\\') {
      let nxt = sPeek(1);
      if (isEOS(nxt)) {
        throw Error('Unexpected end of input');
      }
      if (nxt !== 'u') {
        throw Error('Unexpected token:', char);
      }
      code = scanUnicode(stream, 2);
      if (code < 0) {
        throw Error('Illegal Unicode value');
      }
    } else if (0xD800 <= code && code <= 0xDBFF) {
      if (isEOS(char)) {
        throw Error('Unexpected end of input');
      }
      let lowSurrogateCode = sPeek(1).charCodeAt(0);
      if (0xDC00 > lowSurrogateCode || lowSurrogateCode > 0xDFFF) {
        throw Error('Invalid UTF-16');
      }
      stream.readString(2)
      code = decodeUtf16(code, lowSurrogateCode);
    }
    if (!check(code)) {
      if (id.length < 1) {
        throw Error('Invalid identifier');
      }
      return id;
    }
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

