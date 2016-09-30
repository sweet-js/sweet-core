// @flow
import type CharStream from '../char-stream';

import { scanUnicode, getHexValue } from './utils';
import { isEOS } from '../char-stream';

import { code  } from 'esutils';
const { isLineTerminator } = code;

export default function readStringLiteral(stream: CharStream): { type: string, value: string, octal: ?string} | void {
  let value = '', octal = null, idx: number = 0,
      quote = stream.readString(),
      char = stream.peek();

  while (!isEOS(char)) {
    if (char === quote) {
      stream.readString(idx);
      // "value" should really be "str"
      return { type: 'StringLiteral', value , octal  };
    } else if (char === "\\") {
      [value, idx, octal] = readStringEscape(value, stream, idx, octal);
    } else {
      ++idx;
      value += char;
    }
    char = stream.peek(idx);
  }
}

function readStringEscape(str: string, stream: CharStream, start: number, octal?) {
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
    stream.locationInfo = { line: stream.locationInfo.line + 1 };
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
