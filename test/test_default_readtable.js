import test from 'ava';

import CharStream from '../src/char-stream';
import defaultReadtable from '../src/default-readtable';
import { setCurrentReadtable } from '../src/readtable';

setCurrentReadtable(defaultReadtable);

function getEntryFor(stream) {
  const key = stream.peek();
  return defaultReadtable.getEntry(key);
}

function testParseIdentifier(t, source, id) {
  const stream = new CharStream(source);
  const result = getEntryFor(stream).action(stream);

  t.is(result.value, id);
  t.is(result.type, 'Identifier');
  t.deepEqual(result.locationInfo, {
    filename: '',
    line: 0,
    column: 0,
    position: 0
  });
}

test('should parse Unicode identifiers', t => {
  testParseIdentifier(t, 'abcd ', 'abcd');
  testParseIdentifier(t, '日本語 ', '日本語');
  testParseIdentifier(t, '\\u2163\\u2161 ', '\u2163\u2161');
  testParseIdentifier(t, '\\u{102A7} ', '\u{102A7}');
  testParseIdentifier(t, '\uD800\uDC00 ', '\uD800\uDC00');
  testParseIdentifier(t, '\u2163\u2161\u200A', '\u2163\u2161');
});

function testParsePunctuator(t, source, p) {
  const stream = new CharStream(source);
  const result = getEntryFor(stream).action(stream);

  t.is(result.value, p);
  t.is(result.type, 'Punctuator');
  t.deepEqual(result.locationInfo, {
    filename: '',
    line: 0,
    column: 0,
    position: 0
  });
}

test('should parse punctuators', t => {
  testParsePunctuator(t, '; ', ';');
  testParsePunctuator(t, '>>> ', '>>>');
});

function testParseWhiteSpace(t, source) {
  const stream = new CharStream(source);
  const result = getEntryFor(stream).action(stream);

  t.is(result, undefined);
}

test('should parse whitespace', t => {
  testParseWhiteSpace(t, ' ');
  testParseWhiteSpace(t, '\t');
  testParseWhiteSpace(t, '\uFEFF');
});

function testParseLineTerminators(t, source) {
  const stream = new CharStream(source);
  const result = getEntryFor(stream).action(stream);
  const { line, column, position } = stream.locationInfo;

  t.is(result, undefined);
  t.is(line, 1);
  t.is(column, 0);
  t.is(position, 1);
}

test('should parse line terminators', t => {
  testParseLineTerminators(t, '\n');
  testParseLineTerminators(t, '\r\n');
  testParseLineTerminators(t, '\u2029');
});
