// @flow

import Reader, { getCurrentReadtable, setCurrentReadtable } from './reader';
import defaultReadtable from './default-readtable';
import { List } from 'immutable';
import CharStream, { isEOS } from './char-stream';
import { TokenType, EmptyToken } from '../tokens';
import Syntax from '../syntax';

import type { StartLocation, Slice } from '../tokens';

setCurrentReadtable(defaultReadtable);

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
    end: stream.sourceInfo.position
  };
}

const streams = new WeakMap();

class ReadError extends Error {
  index: number;
  line: number;
  column: number;
  message: string;
  constructor({ index, line, column, message }: { index: number, line: number, column: number, message: string }) {
    super(message);
    this.index = index;
    this.line = line;
    this.column = column;
    this.message = `[${line}:${column}] ${message}`;
  }
}

class TokenReader extends Reader {
  locationInfo: LocationInfo;
  context: ?Context;
  constructor(stream: CharStream, context?: Context) {
    super();
    this.context = context;
    streams.set(this, stream);
    this.locationInfo = {
      line: 1,
      column: 1
    };
  }

  createError(msg: string): ReadError {
    let message = msg.replace(/\{(\d+)\}/g, (_, n) => JSON.stringify(arguments[+n + 1]));
    return new ReadError({ message,
                           index: streams.get(this).sourceInfo.position,
                           line: this.locationInfo.line,
                           column: this.locationInfo.column });
  }

  createILLEGAL(char) {
    return !isEOS(char)
      ? this.createError("Unexpected {0}", char)
    : this.createError("Unexpected end of input");
  }

  readToken(stream: CharStream, prefix: List<Syntax>, exprAllowed: boolean): Syntax {
    const startLocation = Object.assign({}, this.locationInfo, stream.sourceInfo);
    const result = super.read(stream, prefix, exprAllowed);

    if (startLocation.column === this.locationInfo.column && startLocation.line === this.locationInfo.line) {
      this.locationInfo.column += stream.sourceInfo.position - startLocation.position;
    }

    if (result === EmptyToken) return result;

    if (!List.isList(result)) result.slice = getSlice(stream, startLocation);

    return new Syntax(result, this.context);
  }

  incrementLine(): void {
    this.locationInfo.line += 1;
    this.locationInfo.column = 1;
  }
}

export default function read(source: string | CharStream, context?: Context): List<Syntax> {
  const stream = (typeof source === 'string') ? new CharStream(source) : source;
  const reader = new TokenReader(stream, context);
  const entry = getCurrentReadtable().getEntry('');

  return entry.action.call(reader, stream, List(), false);
}
