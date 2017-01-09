// @flow

import type CharStream from './char-stream';

/*
 * 1. { key, mode: 'terminating', action } - creates a delimiter must return an Array/List
 * 2. { key, mode: 'non-terminating', action } - must return a Token or null/undefined. null/undefined simply consumes the read charstream.
 * 3. { key, mode: 'dispatch', action } - triggered by reading #. otherwise like 2
 * 4. { key: null | undefined, mode: 'non-terminating', action } - sets the default behavior for unmatched characters (identifiers/numbers)
 */

const DISPATCH_OFFSET = 0x110000;

type ReadtableKey = string | number | null;

type Action = (stream: CharStream, ...rest: Array<any>) => any;

type ReadtableMode = 'terminating' | 'non-terminating' | 'dispatch';

type ReadtableEntry = {
  key?: ?ReadtableKey,
  mode: ReadtableMode,
  action: Action
};

type ReadtableMapping = {
  mode: ReadtableMode,
  action: Action,
  dispatchAction: Action
};

export default class Readtable {
  _entries: Array<ReadtableEntry>;
  constructor(entries: Array<ReadtableEntry> = []) {
    this._entries = entries;
  }

  getMapping(key?: ReadtableKey): ReadtableMapping {
    if (!isValidKey(key)) throw Error('Invalid key type:', key);
    key = convertKey(key);
    const { action, mode } = this._entries[key] || this._entries[0];
    const dispatchEntry = this._entries[key + DISPATCH_OFFSET] || this._entries[DISPATCH_OFFSET] || {};
    return { action, mode, dispatchAction: dispatchEntry.action };
  }

  extend(...entries: Array<ReadtableEntry>): Readtable {
    const newTable = this._entries.slice();
    return new Readtable(entries.reduce(addEntry, newTable));
  }
}

function addEntry(table: Array<ReadtableEntry>, { key, mode, action }: ReadtableEntry): Array<ReadtableEntry> {
  if (!isValidEntry({key, mode, action})) throw Error('Invalid readtable entry:', {key, mode, action});

  // null/undefined key is the default and will be converted to 0
  // chars will be converted via codePointAt
  // numbers are...numbers
  // to accommodate default (null) 1 will be added to all and default will be at 0
  // if is a dispatch macro, we have to convert the key and bump it up by DISPATCH_OFFSET
  table[convertKey(key) + (mode === 'dispatch' ? DISPATCH_OFFSET : 0)] = { action, mode };

  return table;
}

export const EmptyReadtable = new Readtable();

function isValidKey(key) {
  return key == null ||
    (typeof key === 'number' && key < DISPATCH_OFFSET) ||
    (typeof key === 'string' && (key.length >= 0 && key.length <= 2));
}

function isValidMode(mode: string): boolean {
  return mode === 'terminating' || mode === 'non-terminating' || mode === 'dispatch';
}

function isValidAction(action) {
  return typeof action === 'function';
}

function isValidEntry(entry: ReadtableEntry) {
  return entry && isValidKey(entry.key) && isValidMode(entry.mode) && isValidAction(entry.action);
}

function convertKey(key?: ReadtableKey): number {
  return key == null ? 0 : (typeof key === 'number' ? key : key.codePointAt(0)) + 1;
}
