import { EmptyReadtable } from '../src/reader/readtable';

import test from 'ava';

const entry = {
  key: '@',
  mode: 'terminating',
  action() {
    return {
      type: 'Punctuator',
      value: 'AT'
    };
  }
};

const table = EmptyReadtable.extend(entry);

test('getEntry retrieves an entry from a readtable', t => {
  const theEntry = table.getEntry('@');

  t.is(theEntry.action, entry.action);
});
test('should be able to get an entry after a readtable has been extended', t => {
  const newEntry = {
    key: '#',
    mode: 'terminating',
    action() {
      return {
        type: 'Punctuator',
        value: 'HASH'
      };
    }
  };
  const newTable = table.extend(newEntry);

  const theEntry = newTable.getEntry('@');
  t.is(theEntry.action, entry.action);

  const theOtherEntry = newTable.getEntry('#');
  t.is(theOtherEntry.action, newEntry.action);
});
