// @flow

import Reader from './reader';
import { List } from 'immutable';
import CharStream, { isEOS } from '../char-stream';
import { TokenType, EmptyToken } from '../tokens';
import Syntax from '../syntax';
import { getCurrentReadtable } from './reader';
import '../default-readtable';

import type { StartLocation, Slice } from '../tokens';

export type LocationInfo = {
  line: number,
  column: number
};

type Context = {
  bindings: any,
  scopesets: any
};

export function getSlice(stream: CharStream, startLocation: StartLocation): Slice {
  return {
    text: stream.getSlice(startLocation.position),
    start: startLocation.position,
    startLocation,
    end: stream.sourceInfo.position - 1 //TODO: don't know if this is right
  };
}

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

    result.slice = getSlice(stream, startLocation);

    // TODO: don't know about the below. it isn't working currently though
    if (!List.isList(result) && result.type !== TokenType.STRING && startLocation.line === this.locationInfo.line) {
      this.locationInfo.column += stream.sourceInfo.position - startLocation.position;
    }
    return new Syntax(result, this.context);
  }

  incrementLine(): void {
    this.locationInfo.line += 1;
    this.locationInfo.column = 1;
  }
}

export default function read(source: string | CharStream, context?: Context): List<Syntax> {
  const reader = new TokenReader(context);
  const stream = (typeof source === 'string') ? new CharStream(source) : source;
  const entry = getCurrentReadtable().getEntry('');

  return entry.action.call(reader, stream, List(), false);
}
