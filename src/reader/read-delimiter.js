// @flow

import { List } from 'immutable';
import { isEOS } from '../char-stream';
import { DelimiterToken, EmptyToken } from '../tokens';

import type CharStream from '../char-stream';

export default function readDelimiter(closing: string, stream: CharStream) {
  let value = stream.readString();
  let char = stream.peek();
  let items = List();
  let result;
  while (!isEOS(char) && char !== closing) {
    result = this.read(stream);
    if (result !== EmptyToken) items = items.push(result);
    char = stream.peek();
  }
  stream.readString();
  return new DelimiterToken({
    value,
    items
  });
}
