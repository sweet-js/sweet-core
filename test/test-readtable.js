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

test('getMapping retrieves a mapping from a readtable', t => {
  const theMapping = table.getMapping('@');

  t.is(theMapping.action, entry.action);
});

test('should be able to get a mapping after a readtable has been extended', t => {
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

  const theMapping = newTable.getMapping('@');
  t.is(theMapping.action, entry.action);

  const theOtherMapping = newTable.getMapping('#');
  t.is(theOtherMapping.action, newEntry.action);
});
