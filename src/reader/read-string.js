// @flow
import type CharStream from '../char-stream';

import { isEOS } from '../char-stream';

import { readStringEscape } from './utils';


export default function readStringLiteral(stream: CharStream): { type: string, value: string, octal: ?string} {
  let value = '', octal = null, idx: number = 0,
      quote = stream.readString(),
      char = stream.peek();

  while (!isEOS(char)) {
    if (char === quote) {
      stream.readString(idx+1);
      // "value" should really be "str"
      return { type: 'StringLiteral', value , octal  };
    } else if (char === "\\") {
      [value, idx, octal] = readStringEscape.call(this, value, stream, idx, octal);
    } else {
      ++idx;
      value += char;
    }
    char = stream.peek(idx);
  }
  throw Error('Unexpected end of input');
}
