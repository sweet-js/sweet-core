// @flow

import { EmptyReadtable } from './readtable';
import readDelimiter from './read-delimiter';
import { LSYNTAX, RSYNTAX } from './utils';
import { List } from 'immutable';
import { getSlice } from './token-reader';
import Syntax from '../syntax';
import { EmptyToken } from '../tokens';
import { skipSingleLineComment } from './utils';

import type CharStream from './char-stream';

const dispatchReadtable = EmptyReadtable.extendReadtable({
  key: '`',
  action: function readSyntaxTemplate(stream: CharStream, prefix: List<Syntax>, exprAllowed: boolean, dispatchKey: string): List<Syntax> {
    // return read('syntaxTemplate').first().token;
    // TODO: Can we simply tack 'syntaxTemplate' on the front and process it as a
    //       syntax macro?
    let startLocation = Object.assign({}, this.locationInfo, stream.sourceInfo);
    const opening = new Syntax({
      type: LSYNTAX,
      value: `${dispatchKey}${stream.readString()}`,
      slice: getSlice(stream, startLocation)
    }, this.context);
    const result = readDelimiter.call(this, '`', stream, List(), true);

    startLocation = Object.assign({}, this.locationInfo, stream.sourceInfo);
    const closing = new Syntax({
      type: RSYNTAX,
      value: stream.readString(),
      slice: getSlice(stream, startLocation)
    }, this.context);
    return result.unshift(opening).push(closing);
  }
}, {
  action: function readDefault(stream: CharStream, prefix: List<Syntax>, exprAllowed: boolean, dispatchKey: string): typeof EmptyToken {
    // treating them as single line comments
    skipSingleLineComment.call(this, stream);
    return EmptyToken;
  }
});

export default function readDispatch(stream: CharStream, prefix: List<Syntax>, exprAllowed: boolean): List<Syntax> | typeof EmptyToken {
  const dispatchKey = stream.readString();
  const dispatchEntry = dispatchReadtable.getEntry(stream.peek());
  const result = dispatchEntry.action.call(this, stream, prefix, exprAllowed, dispatchKey);
  return result;
}
