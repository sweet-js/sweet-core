// @flow

import type CharStream from './char-stream';

/*
 * Note: these are possible features for future enhancements. 
 * extendReadtable features:
 * 1. { key, mode: TerminatingMacro, action } - creates a delimiter must return an Array/List
 * 2. { key, mode: NonTerminatingMacro, action } - must return a Token or null/undefined. null/undefined simply consumes the read charstream.
 * 3. { key, mode: DispatchMacro, action } - triggered by reading #. otherwise like 2
 * 4. { key, delegateKey, delegateReadtable } - delegates to likeChar entry in readtable. Can be implemented
 *    by getEntry(delegateReadtable, delegateKey), adding key and passing to extendReadtable
 * 5. { key: null, mode: NonTerminatingMacro, action } - sets the default behavior for unmatched characters (identifiers/numbers)
 */

export default class Readtable {
  _entries: Array<ReadtableEntry>;
  constructor(entries: Array<ReadtableEntry> = []) {
    this._entries = entries;
  }

  getEntry(key?: ReadtableKey): ReadtableEntry {
    if (!isValidKey(key)) throw Error('Invalid key type:', key);
    return this._entries[convertKey(key)] || this._entries[0];
  }

  extendReadtable(...entries: Array<ReadtableEntry>): Readtable {
    const newTable = this._entries.slice();
    return new Readtable(entries.reduce(addEntry, newTable));
  }
}

function addEntry(table: Array<ReadtableEntry>, { key, action }: ReadtableEntry): Array<ReadtableEntry> {
  if (!isValidKey(key)) throw Error('Invalid key type:', key);
  if (!isValidEntry({key, action})) throw Error('Invalid readtable entry:', {key, action});

  // null/undefined key is the default and will be converted to 0
  // chars will be converted via codePointAt
  // numbers are...numbers
  // to accommodate default (null) 1 will be added to all and default will be at 0
  table[convertKey(key)] = { action };

  // if is a dispatch macro, we have to convert the key and bump it up by 0x110000
  // Note: The above depends on a primitive implementation of dispatch macros.
  //       I'm considering another implementation which will just use the current capabilities.
  return table;
}

export const EmptyReadtable = new Readtable();

// Note: This was an experiment. IF the mode flags are included here, they can just be string constants.
// Symbol.for creates cross-realm Symbols
// export const TerminatingMacro = Symbol.for('readtable.terminating-macro-mode');
// export const NonTerminatingMacro = Symbol.for('readtable.non-terminating-macro-mode');
// export const DispatchMacro = Symbol.for('readtable.dispatch-macro-mode');

function isValidKey(key) {
  return key == null ||
    (typeof key === 'number' && key <= 0x10FFFF) ||
    (typeof key === 'string' && (key.length >= 0 && key.length <= 2));
}

// function isValidMode(mode: Symbol): boolean {
//   return mode === TerminatingMacro || mode === NonTerminatingMacro || mode === DispatchMacro;
// }

function isValidAction(action) {
  return typeof action === "function";
}

type ReadtableKey = string | number | null;

type Action = (stream: CharStream, ...rest: Array<any>) => any;

export type ReadtableEntry = {
  key?: ?ReadtableKey,
  action: Action
};

function isValidEntry(entry) {
  return entry && isValidKey(entry.key) && /*isValidMode(entry.mode) &&*/ isValidAction(entry.action);
}

function convertKey(key?: ReadtableKey): number {
  return key == null ? 0 : (typeof key === 'number' ? key : key.codePointAt(0)) + 1;
}
