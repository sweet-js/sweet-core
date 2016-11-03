// @flow

import Reader from './reader';
import { List } from 'immutable';
import CharStream, { isEOS } from '../char-stream';
import { EmptyToken } from '../tokens';

import type Readtable from '../readtable';
import type { TokenTree } from '../tokens';

export type LocationInfo = {
  line: number,
  column: number
};

export class TokenReader extends Reader {
  locationInfo: LocationInfo;
  inObject: boolean;
  _prefix: List<TokenTree>;
  constructor(readtable?: Readtable) {
    super(readtable);
    this.locationInfo = {
      line: 1,
      column: 1
    };
    this._prefix = List();
  }

  get prefix(): List<TokenTree> {
    return this._prefix;
  }

  readToken(stream: CharStream): TokenTree {
    let startLocation = Object.assign({}, this.locationInfo, stream.sourceInfo);
    let result = super.read(stream);
    if (result !== EmptyToken) {
      result.locationInfo = startLocation;
      this._prefix = (result instanceof List) ? this._prefix.concat(result) : this._prefix.push(result);
      const currentLocation = this.locationInfo;
      if (startLocation.line === this.locationInfo.line) {
        this.locationInfo.column += stream.sourceInfo.position - startLocation.position;
      }
    }
    return result;
  }
}

export default function read(source: string): List<TokenTree> {
  const reader = new TokenReader();
  const stream = new CharStream(source);
  let results = List();
  let result;

  while (!isEOS(stream.peek())) {
    result = reader.readToken(stream);
    if (result === EmptyToken) continue;
    if (result instanceof List) {
      results = results.concat(result);
    } else {
      results = results.push(result);
    }
  }
  return results;
}
