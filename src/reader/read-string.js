// @flow
import type CharStream from '../char-stream';
import type LocationInfo from './token-reader';

import { readStringEscape } from './utils';
import { isEOS } from '../char-stream';
import { StringToken } from '../tokens';

// TODO: put line/column info on the reader state (for newlines etc.)
export default function readStringLiteral(stream: CharStream): StringToken {
  let value = '', octal = null, idx: number = 0,
      quote = stream.readString(),
      char = stream.peek(),
      { line, column } = this.locationInfo,
      newline = false;

  while (!isEOS(char)) {
    if (char === quote) {
      stream.readString(idx+1);
      // "value" should really be "str"
      return new StringToken({ value });
    } else if (char === "\\") {
      let newIdx;
      [value, newIdx, octal, newline] = readStringEscape(value, stream, idx, octal);
      if (newline) {
        ++line;
        column = 0;
        newline = false;
      } else {
        column += newIdx - idx;
        idx = newIdx;
      }
    } else {
      ++idx;
      ++column;
      value += char;
    }
    char = stream.peek(idx);
  }
  throw Error('Unexpected end of input');
}
