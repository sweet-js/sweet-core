// @flow
import type { CharStream } from 'readtable';

import { isEOS } from 'readtable';
import { RegExpToken } from '../tokens';
import { isLineTerminator, isIdentifierPart } from './utils';

export default function readRegExp(stream: CharStream) {
  let value = stream.readString(),
    char = stream.peek(),
    idx = 0,
    classMarker = false,
    terminated = false;

  const UNTERMINATED_REGEXP_MSG = 'Invalid regular expression: missing /';

  while (!isEOS(char)) {
    if (char === '\\') {
      value += char;
      ++idx;
      char = stream.peek(idx);

      if (isLineTerminator(char.charCodeAt(0))) {
        throw this.createError(UNTERMINATED_REGEXP_MSG);
      }
      value += char;
      ++idx;
    } else if (isLineTerminator(char.charCodeAt(0))) {
      throw this.createError(UNTERMINATED_REGEXP_MSG);
    } else {
      if (classMarker) {
        if (char === ']') {
          classMarker = false;
        }
      } else {
        if (char === '/') {
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
    throw this.createError(UNTERMINATED_REGEXP_MSG);
  }

  while (!isEOS(char)) {
    if (char === '\\') {
      throw this.createError('Invalid regular expression flags');
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
    value,
  });
}
