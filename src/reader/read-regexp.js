// @flow
import type CharStream from './char-stream';

import { isEOS } from './char-stream';
import { RegExpToken } from '../tokens';
import { isLineTerminator, isIdentifierPart } from './utils';

export default function readRegExp(stream: CharStream) {
  let value = stream.readString(), char = stream.peek(), idx = 0, classMarker = false, terminated = false;

  while (!isEOS(char)) {
    if (char === '\\') {
      value += char;
      ++idx;
      char = stream.peek(idx);

      if (isLineTerminator(char.charCodeAt(0))) {
        throw Error("Unterminated RegExp");
      }
      value += char;
      ++idx;
    } else if (isLineTerminator(char.charCodeAt(0))) {
      throw Error("Unterminated RegExp");
    } else {
      if (classMarker) {
        if (char === ']') {
          classMarker = false;
        }
      } else {
        if (char === "/") {
          terminated = true;
          value += char;
          ++idx;
          char = stream.peek(idx);
          break;
        } else if (char === '[') {
          classMarker = true;
        }
      }
      value += char;
      ++idx;
    }
    char = stream.peek(idx);
  }

  if (!terminated) {
    throw Error("Unterminated RegExp");
  }

  while (!isEOS(char)) {
    if (char === '\\') {
      throw Error("Invalid RegExp flags");
    }
    if (!isIdentifierPart(char.charCodeAt(0))) {
      break;
    }
    value += char;
    ++idx;
    char = stream.peek(idx);
  }

  stream.readString(idx);

  return new RegExpToken({
    value
  });
}
