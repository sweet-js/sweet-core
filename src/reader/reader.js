// @flow

import type Readtable from '../readtable';
import defaultReadtable from '../default-readtable';
import { isEOS } from '../char-stream';

import type CharStream from '../char-stream';

export default class Reader {
  _readtable: Readtable;
  constructor(readtable: Readtable = defaultReadtable) {
    this._readtable = readtable;
  }

  read(stream: CharStream, ...rest?: Array<any>): any {
    let char = stream.peek();
    if (!isEOS(char)) {
      const entry = this._readtable.getEntry(char);
      const result = entry.action.call(this, stream, ...rest);
      return result;
    }
    throw Error('Unexpected end of input');
  }
}

