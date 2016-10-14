// @flow

import type Readtable from '../readtable';
import defaultReadtable from '../default-readtable';

import type CharStream from '../char-stream';
// export interface ReadableStream {
//   done: boolean,
//   sourceInfo: SourceInfo,
//   peek(n?: number): string,
//   readString(n?: number): string
// }

export default class Reader {
  _readtable: Readtable;
  // _state: any;
  constructor(readtable: Readtable = defaultReadtable) {
    this._readtable = readtable;
    // this._state = {};
  }
  
  // get state(): any {
  //   return this._state;
  // }
  
  // set state(newState: any): void {
  //   Object.assign(this._state, newState);
  // }

  read(stream: CharStream): any {
    const entry = this._readtable.getEntry(stream.peek());
    return entry.action.call(this, stream);
  }
}

