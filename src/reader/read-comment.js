// @flow
import type CharStream from '../char-stream';

import { isEOS } from '../char-stream';
import { isLineTerminator, isWhiteSpace } from './utils';
import { EmptyToken } from '../tokens';

export default function readComment(stream: CharStream): typeof EmptyToken {
  let idx = 0, char = stream.peek();

  while (!isEOS(char)) {
    let chCode = char.charCodeAt(0);
    if (isWhiteSpace(chCode)) {
      ++idx;
    } else if (isLineTerminator(chCode)) {
      ++idx;
      if (chCode === 13 /* "\r" */ && stream.peek().charAt(0) === "\n") {
        ++idx;
      }
      incrementLine(this);
    } else if (chCode === 47 /* "/" */) {
      const nxt = stream.peek(1);
      if (isEOS(nxt)) {
        break;
      }
      chCode = nxt.charCodeAt(0);
      if (chCode === 47 /* "/" */) {
        idx = skipSingleLineComment.call(this, stream, idx);
      } else if (chCode === 42 /* "*" */) {
        idx = skipMultiLineComment.call(this, stream, idx);
      } else {
        break;
      }
    } else {
      break;
    }
    char = stream.peek(idx);
  }
  stream.readString(idx);

  return EmptyToken;
}

function incrementLine(reader) {
  reader.locationInfo.line += 1;
  reader.locationInfo.column = 1;
}

function skipSingleLineComment(stream: CharStream, idx: number): number {
  idx += 2;
  let char = stream.peek(idx);
  while (!isEOS(char)) {
    let chCode = char.charCodeAt(0);
    if (isLineTerminator(chCode)) {
      ++idx;
      if (chCode === 0xD /* "\r" */ && stream.peek(idx).charCodeAt(0) === 0xA /*"\n" */) {
        ++idx;
      }
      incrementLine(this);
      break;
    }
    ++idx;
    char = stream.peek(idx);
  }
  return idx;
}

function skipMultiLineComment(stream: CharStream, idx: number): number {
  idx += 2;
  let char = stream.peek(idx);
  while (!isEOS(char)) {
    let chCode = char.charCodeAt(0);
    if (chCode < 0x80) {
      switch (chCode) {
      case 42:  // "*"
        // Block comment ends with "*/".
        if (stream.peek(idx + 1).charAt(0) === "/") {
          return idx + 2;
        }
        ++idx;
        break;
      case 10:  // "\n"
        ++idx;
        incrementLine(this);
        break;
      case 13: // "\r":
        if (stream.peek(idx + 1).charAt(0) === "\n") {
          ++idx;
        }
        ++idx;
        incrementLine(this);
        break;
      default:
        ++idx;
      }
    } else if (chCode === 0x2028 || chCode === 0x2029) {
      ++idx;
      incrementLine(this);
    } else {
      ++idx;
    }
    char = stream.peek(idx);
  }
  throw Error('Unexpected end of source');
}

