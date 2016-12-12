// @flow

import { List } from 'immutable';
import { EmptyToken } from '../tokens';

import type CharStream from './char-stream';
import type Syntax from '../syntax';

export default function readDelimiter(delimiter: string, stream: CharStream, prefix: List<Syntax>, exprAllowed: boolean) {
  let results = List();
  let result;
  while (stream.peek() !== delimiter) {
    result = this.readToken(stream, results, exprAllowed);

    if (result !== EmptyToken) {
      results = results.push(result);
    }
  }
  return results;
}
