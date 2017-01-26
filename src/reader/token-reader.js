// @flow

import Reader, { setCurrentReadtable } from './reader';
import defaultReadtable from './default-readtable';
import { List } from 'immutable';
import CharStream, { isEOS } from './char-stream';
import { EmptyToken, getKind } from '../tokens';
import * as T from 'sweet-spec';

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
    // $FlowFixMe: decide on how to handle possible nullability
    return new ReadError({ message, index: streams.get(this).sourceInfo.position, line: this.locationInfo.line, column: this.locationInfo.column });
  }

  createILLEGAL(char) {
    return !isEOS(char)
      ? this.createError('Unexpected {0}', char)
    : this.createError('Unexpected end of input');
  }

  readToken(stream: CharStream, ...rest: Array<any>) {
    const startLocation = Object.assign({}, this.locationInfo, stream.sourceInfo);
    const result = super.read(stream, ...rest);


    if (startLocation.column === this.locationInfo.column && startLocation.line === this.locationInfo.line) {
      this.locationInfo.column += stream.sourceInfo.position - startLocation.position;
    }

    if (result === EmptyToken) return result;

    if (!List.isList(result)) result.slice = getSlice(stream, startLocation);

    return result;
  }

  readUntil(close: ?Function | ?string, stream: CharStream, prefix: List<any>, exprAllowed: boolean): List<any> {
    let result, results = prefix.map(wrapToken), done = false;
    do {
      if (isEOS(stream.peek())) break;
      done = typeof close === 'function' ? close() : stream.peek() === close;
      result = this.readToken(stream, prefix, exprAllowed);

      if (result !== EmptyToken) {
        prefix = prefix.push(unwrapToken(result));
        results = results.push(wrapToken(result));
      }
    } while(!done);
    return results;
  }

  incrementLine(): void {
    this.locationInfo.line += 1;
    this.locationInfo.column = 1;
  }
}

function unwrapToken(tok: List<T.SyntaxTerm>) {
  if (List.isList(tok)) {
    return List.of(tok.first().value, tok.last().value);
  }
  return tok;
}

function wrapToken(t) {
  if (List.isList(t)) {
    return new T.RawDelimiter({
      kind: getKind(t),
      inner: t
    });
  }
  return new T.RawSyntax({
    value: t
  });
}

export default function read(source: string | CharStream, context?: Context): List<any> {
  const stream = (typeof source === 'string') ? new CharStream(source) : source;
  if (isEOS(stream.peek())) return List();
  return new TokenReader(stream, context).readUntil(null, stream, List(), false);
}
