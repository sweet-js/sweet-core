import test from 'ava';
import { List } from 'immutable';

import read from '../../src/reader/token-reader';
import { getCurrentReadtable, setCurrentReadtable } from 'readtable';
import {
  keywordTable,
  IdentifierToken,
  EmptyToken,
  isKeyword,
  isIdentifier,
} from '../../src/tokens';

test('terminating macros should delimit identifiers and numbers', t => {
  const prevTable = getCurrentReadtable();
  const newTable = prevTable.extend(
    {
      key: 'z',
      mode: 'terminating',
      action: function readZ(stream) {
        stream.readString();
        return EmptyToken;
      },
    },
    {
      key: '0',
      mode: 'terminating',
      action: function readZero(stream) {
        stream.readString();
        return EmptyToken;
      },
    },
  );

  // reading with 'z' and '0' as 'non-terminating'
  let [result] = read('abczefgzhij\u{102A7}ba ');
  t.is(prevTable.getMapping('z').mode, 'non-terminating');
  t.is(result.value, 'abczefgzhij𐊧ba');

  [result] = read('12304560789');
  t.is(prevTable.getMapping('0').mode, 'non-terminating');
  t.is(result.value, 12304560789);

  setCurrentReadtable(newTable);

  // reading with 'z' and '0' as 'terminating'
  let [x, y, z] = read('abczefgzhij\u{102A7}ba ').map(s => s.value);
  t.is(x, 'abc');
  t.is(y, 'efg');
  t.is(z, 'hij𐊧ba');
  [x, y, z] = read('12304560789').map(s => s.value);
  t.is(x, 123);
  t.is(y, 456);
  t.is(z, 789);
  setCurrentReadtable(prevTable);
});
test('should create a dispatch macro', t => {
  const prevTable = getCurrentReadtable();
  const newTable = prevTable.extend({
    key: ':',
    mode: 'dispatch',
    action: function readColon(stream, prefix, allowExpr) {
      stream.readString();
      setCurrentReadtable(defaultTable);
      return new IdentifierToken({
        value: 'Keyword',
      });
    },
  });
  function readDefault(stream, prefix, allowExpr) {
    const [[openParen, closeParen]] = read('()');
    setCurrentReadtable(prevTable);
    const stx = this.readToken(stream, List(), false);
    let result = List.of(openParen).push(stx);
    setCurrentReadtable(newTable);
    return result.push(closeParen);
  }
  const kwLetters = Array.from(
    new Set(Object.keys(keywordTable).map(w => w[0])),
  );
  const keywordEntries = kwLetters.map(key => ({
    key,
    mode: 'non-terminating',
    action: readDefault,
  }));
  const defaultTable = newTable.extend(...keywordEntries, {
    mode: 'non-terminating',
    action: readDefault,
  });
  setCurrentReadtable(newTable);
  // eslint-disable-next-line no-unused-vars
  const [one, [open, kw, close], iff, els, [open2, elkw]] = read(
    '#:for if #:else',
  );
  t.true(isIdentifier(one, 'Keyword'));
  t.true(isKeyword(kw, 'for'));
  t.true(isKeyword(iff, 'if'));
  t.true(isIdentifier(els, 'Keyword'));
  t.true(isKeyword(elkw, 'else'));
  setCurrentReadtable(prevTable);
});
test('should allow replacing the dispatch character', t => {
  const prevTable = getCurrentReadtable();
  const newTable = prevTable.extend(
    {
      key: '@',
      mode: 'terminating',
      action: prevTable.getMapping('#').action,
    },
    {
      key: '#',
      mode: 'terminating',
      action: prevTable.getMapping('@').action,
    },
  );
  const result = read('#``');
  const error = t.throws(() => read('@``'));
  setCurrentReadtable(newTable);
  const result2 = read('@``');
  const error2 = t.throws(() => read('#``'));
  t.is(error.message, error2.message);
  t.deepEqual(result, result2);
  setCurrentReadtable(prevTable);
});
