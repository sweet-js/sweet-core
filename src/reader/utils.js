import { isEOS } from '../char-stream';

import type CharStream from '../char-stream';

import { code  } from 'esutils';
const { isLineTerminator } = code;

export function getHexValue(rune) {
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

export function scanUnicode(stream, start) {
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
        throw Error('Value outside of Unicode range:', hexDigits.toString(16));
      }
      char = sPeek(++idx);
    }
    if (char !== '}') {
      throw Error('Expected "}", found', char);
    }
    if (idx === start + 1) {
      throw Error('Unexpected "}"');
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

export function readStringEscape(str: string, stream: CharStream, start: number, octal?) {
  let idx = start + 1,
      char = stream.peek(idx);

  if (!isLineTerminator(char)) {
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
          throw Error('Invalid string literal');
        }
        unescaped = char === 'u' ? scanUnicode(stream, idx) : scanHexEscape2(stream);
        if (unescaped === -1) throw Error('Illegal string escape');
        idx = 0; // stream is read in scanUnicode and scanHexEscape2

        str += String.fromCodePoint(unescaped);
        break;
      }
      default: {
        if ('0' <= char && char <= '7') {
          [str, octal, idx] = scanOctal(str, stream, char, idx, octal);
        } else if(char === '8' || char === '9') {
          throw Error("Illegal octal escape");
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
    this.positionInfo = { line: this.positionInfo.line + 1 };
  }
  return [str, idx, octal];
}

function scanOctal(str, stream, char, start, octal) {
  let len = 1, idx = start;
  if ('0' <= char && char <= '3') {
    len = 0;
  }
  let code = 0;
  while (len < 3 && '0' <= char && char <= '7') {
    if (len > 0 || char !== '0') {
      octal = str; 
    }
    code *= 8;
    code += +char; //coersion
    ++len;
    // str += char;
    char = stream.peek(++idx);
    if (isEOS(char)) {
      throw Error()
    }
  }
  str += String.fromCharCode(code);
  return [str, octal, idx];
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
