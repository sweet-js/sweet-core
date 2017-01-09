import test from 'ava';
import { List } from 'immutable';

import read from '../src/reader/token-reader';
import { getCurrentReadtable, setCurrentReadtable } from '../src/reader/reader';
import { keywordTable, IdentifierToken, EmptyToken } from '../src/tokens';

test('terminating macros should delimit identifiers and numbers', t => {
  const prevTable = getCurrentReadtable();
  const newTable = prevTable.extend({
    key: 'z',
    mode: 'terminating',
    action: function readZ(stream) {
      stream.readString();
      return EmptyToken;
    }
  },{
    key: '0',
    mode: 'terminating',
    action: function readZero(stream) {
      stream.readString();
      return EmptyToken;
    }
  });

  // reading with 'z' and '0' as 'non-terminating'
  let result = read('abczefgzhij');
  t.is(prevTable.getMapping('z').mode, 'non-terminating');
  t.is(result.toString(), 'List [ abczefgzhij ]');

  result = read('12304560789');
  t.is(prevTable.getMapping('0').mode, 'non-terminating');
  t.is(result.toString(), 'List [ 12304560789 ]');

  setCurrentReadtable(newTable);

  // reading with 'z' and '0' as 'terminating'
  result = read('abczefgzhij');
  t.is(result.toString(), 'List [ abc, efg, hij ]');

  result = read('12304560789');
  t.is(result.toString(), 'List [ 123, 456, 789 ]');

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
        value: 'Keyword'
      });
    }
  });

  function readDefault(stream, prefix, allowExpr) {
    const { token: parens } = read('()').first();
    let result = List.of(parens.first());

    setCurrentReadtable(prevTable);

    const stx = this.readToken(stream, List(), false);

    result = result.push(stx.fromString(stx.token.value).value);

    setCurrentReadtable(newTable);

    return result.push(parens.last());
  }

  const kwLetters = Array.from(new Set(Object.keys(keywordTable).map(w => w[0])));
  const keywordEntries = kwLetters.map(key => ({
    key,
    mode: 'non-terminating',
    action: readDefault
  }));

  const defaultTable = newTable.extend(...keywordEntries,{
    mode: 'non-terminating',
    action: readDefault
  });

  setCurrentReadtable(newTable);
  const result = read('#:for if #:else');
  setCurrentReadtable(prevTable);
  t.is(result.toString(), 'List [ Keyword, ( \'for ), if, Keyword, ( \'else ) ]');
});

test('should allow replacing the dispatch character', t => {
  const prevTable = getCurrentReadtable();
  const newTable = prevTable.extend({
    key: '@',
    mode: 'terminating',
    action: prevTable.getMapping('#').action
  },{
    key: '#',
    mode: 'terminating',
    action: prevTable.getMapping('@').action
  });

  const result = read('#``');
  const error = t.throws(()=>read('@``'));

  setCurrentReadtable(newTable);

  const result2 = read('@``');
  const error2 = t.throws(()=>read('#``'));

  t.is(error.message, error2.message);
  t.deepEqual(result, result2);

  setCurrentReadtable(prevTable);

});
