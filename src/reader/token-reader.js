// @flow

import Reader from './reader';
import { List } from 'immutable';
import CharStream, { isEOS } from '../char-stream';
import { EmptyToken, PunctuatorToken } from '../tokens';
import Syntax from '../syntax';
import { getCurrentReadtable } from './reader';

export type LocationInfo = {
  line: number,
  column: number
};

type Context = {
  bindings: any,
  scopesets: any
};

export class TokenReader extends Reader {
  locationInfo: LocationInfo;
  context: ?Context;
  constructor(context?: Context) {
    super();
    this.context = context;
    this.locationInfo = {
      line: 1,
      column: 1
    };
  }

  readToken(stream: CharStream, prefix: List<Syntax>, b: boolean): Syntax {
    const startLocation = Object.assign({}, this.locationInfo, stream.sourceInfo);
    const result = super.read(stream, prefix, b);
    if (result === EmptyToken) return result;

    result.slice = {
      text: stream.getSlice(startLocation.position),
      start: startLocation.position,
      startLocation,
      end: stream.sourceInfo.position
    };
    // don't know about the below. it isn't working currently though
    if (startLocation.line === this.locationInfo.line) {
      this.locationInfo.column += stream.sourceInfo.position - startLocation.position;
    }
    return new Syntax(result, this.context);
  }
}

export default function read(source: string): List<Syntax> {
  const reader = new TokenReader();
  const stream = new CharStream(source);
  const entry = getCurrentReadtable().getEntry('');

  return entry.action.call(reader, stream, List(), false);
}
