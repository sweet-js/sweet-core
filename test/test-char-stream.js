import CharStream, { isEOS } from '../src/reader/char-stream';
import test from 'ava';

let stream;

test.beforeEach(() => {
  stream = new CharStream('abc');
});

test('CharStream\s members should not be directly accessible', t => {
  t.is(stream.source, undefined);
  t.is(stream.position, undefined);
});

test('peek should return the specified character', t => {
  t.is(stream.peek(), 'a');
  t.is(stream.peek(2), 'c');
});

test('peek should return eos if charsToSkip is > source length', t => {
  t.true(isEOS(stream.peek(3)));
});

test('readString should consume the next character when no arguments are passed', t => {
  t.is(stream.readString(), 'a');
  t.is(stream.peek(), 'b');
});

test('readString should return eos if it reaches the end of source', t => {
  stream.readString(3);
  t.true(isEOS(stream.readString()));
});

test('readString should return the specified number of characters', t => {
  t.is(stream.readString(2), 'ab');
  t.is(stream.readString(), 'c');
});

test('readString should read all remaining characters numChars is > source length', t => {
  t.is(stream.readString(4), 'abc');
});
