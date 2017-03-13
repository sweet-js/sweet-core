// @flow
import type { CharStream } from 'readtable';

import { readStringEscape, isLineTerminator } from './utils';
import { isEOS } from 'readtable';
import { StringToken } from '../tokens';

export default function readStringLiteral(stream: CharStream): StringToken {
  let str = '',
    octal = null,
    idx: number = 0,
    quote = stream.readString(),
    char = stream.peek(),
    lineStart;

  while (!isEOS(char)) {
    if (char === quote) {
      stream.readString(++idx);
      if (lineStart != null) this.locationInfo.column += idx - lineStart;
      return new StringToken({ str, octal });
    } else if (char === '\\') {
      [str, idx, octal, lineStart] = readStringEscape.call(
        this,
        str,
        stream,
        idx,
        octal,
      );
    } else if (isLineTerminator(char.charCodeAt(0))) {
      throw this.createILLEGAL(char);
    } else {
      ++idx;
      str += char;
    }
    char = stream.peek(idx);
  }
  throw this.createILLEGAL(char);
}
