// @flow

import { List } from 'immutable';
import { isEOS } from '../char-stream';
import { PunctuatorToken } from '../tokens';
import { EmptyToken } from '../tokens';

import type CharStream from '../char-stream';
import type Syntax from '../syntax';

export default function readDelimiter(delimiter: string, stream: CharStream, prefix: List<Syntax>, b: boolean) {
  let results = List();
  let result;
  while (stream.peek() !== delimiter) {
    result = this.readToken(stream, results, b);

    if (result !== EmptyToken) {
      results = results.push(result);
    }
  }
  return results;
}
