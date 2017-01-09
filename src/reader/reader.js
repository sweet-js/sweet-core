// @flow

import type Readtable from './readtable';
import type CharStream from './char-stream';

import { isEOS } from './char-stream';
import { EmptyReadtable } from './readtable';

const defaultDispatchKey = '#';
let dispatching = false;

let currentReadtable = EmptyReadtable.extend({
  key: defaultDispatchKey,
  mode: 'non-terminating',
  action: function readDispatchChar(stream, ...rest) {
    stream.readString();
    dispatching = true;
    return this.read(stream, ...rest, defaultDispatchKey);
  }
});

export default class Reader {
  read(stream: CharStream, ...rest?: Array<any>): any {
    let key = stream.peek();
    if (!isEOS(key)) {
      const entry = currentReadtable.getMapping(key);
      const action = dispatching ? (dispatching = false, entry.dispatchAction) : entry.action;

      return action.call(this, stream, ...rest);
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
