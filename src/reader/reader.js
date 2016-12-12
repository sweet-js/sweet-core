// @flow

import type Readtable from './readtable';
import type CharStream from './char-stream';

import { isEOS } from './char-stream';

let currentReadtable;

export default class Reader {
  read(stream: CharStream, ...rest?: Array<any>): any {
    let char = stream.peek();
    if (!isEOS(char)) {
      const entry = currentReadtable.getEntry(char);
      const result = entry.action.call(this, stream, ...rest);
      return result;
    }
    throw Error('Unexpected end of input');
  }
}

export function setCurrentReadtable(readtable: Readtable): void {
  currentReadtable = readtable;
}

export function getCurrentReadtable(): Readtable {
  return currentReadtable;
}
