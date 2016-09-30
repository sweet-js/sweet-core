import test from 'ava';
import expect from 'expect.js';

import CharStream from '../src/char-stream';
import defaultReadtable from '../src/default-readtable';
import { setCurrentReadtable } from '../src/readtable';

setCurrentReadtable(defaultReadtable);

function getEntryFor(stream) {
  const key = stream.peek();
  return defaultReadtable.getEntry(key);
}

function testParse(source, tst) {
  const stream = new CharStream(source);
  const entry = getEntryFor(stream);
  const result = entry.action(stream);

  tst(result, stream);
}

test('should parse Unicode identifiers', t => {
  function testParseIdentifier(t, source, id) {
    testParse(source, result => {
      t.is(result.value, id);
      t.is(result.type, 'Identifier');
      t.deepEqual(result.locationInfo, {
        filename: '',
        line: 0,
        column: 0,
        position: 0
      });
    });
  }

  testParseIdentifier(t, 'abcd ', 'abcd');
  testParseIdentifier(t, '日本語 ', '日本語');
  testParseIdentifier(t, '\u2163\u2161 ', '\u2163\u2161');
  testParseIdentifier(t, '\u{102A7} ', '\u{102A7}');
  testParseIdentifier(t, '\uD800\uDC00 ', '\uD800\uDC00');
  testParseIdentifier(t, '\u2163\u2161\u200A', '\u2163\u2161');
});

test('should parse punctuators', t => {
  function testParsePunctuator(t, source, p) {
    testParse(source, result => {
      t.is(result.value, p);
      t.is(result.type, 'Punctuator');
      t.deepEqual(result.locationInfo, {
        filename: '',
        line: 0,
        column: 0,
        position: 0
      });
    });
  }

  testParsePunctuator(t, '; ', ';');
  testParsePunctuator(t, '>>> ', '>>>');
});

test('should parse whitespace', t => {
  function testParseWhiteSpace(t, source) {
    testParse(source, result => t.is(result, undefined));
  }
  testParseWhiteSpace(t, ' ');
  testParseWhiteSpace(t, '\t');
  testParseWhiteSpace(t, '\uFEFF');
});

test('should parse line terminators', t => {
  function testParseLineTerminators(t, source) {
    testParse(source, (result, stream) => {
      const { line, column, position } = stream.locationInfo;
      t.is(result, undefined);
      t.is(line, 1);
      t.is(column, 0);
      t.is(position, 1);
    });
  }
  testParseLineTerminators(t, '\n');
  testParseLineTerminators(t, '\r\n');
  testParseLineTerminators(t, '\u2029');
});

test('should parse numeric literals', t => {
  function testParseNumericLiterals(t, source, value) {
    testParse(source, result => t.is(result.value, value));
  }
  testParseNumericLiterals(t, '0xFFFF ', 0xFFFF);
  testParseNumericLiterals(t, '0xFF ', 0xFF);
  testParseNumericLiterals(t, '0o0756 ', 0o0756);
  testParseNumericLiterals(t, '0o76 ', 0o76);
  testParseNumericLiterals(t, '0b1010 ', 0b1010);
  testParseNumericLiterals(t, '0b10 ', 0b10);
  testParseNumericLiterals(t, '042 ', 0o042);
  testParseNumericLiterals(t, '42 ', 42);
});

test('should parse string literals', t => {
  function testParseStringLiteral(t, source, value) {
    testParse(source, result => /*t.is(result.value, value)*/expect(result.value).to.eql(value));
  }
  testParseStringLiteral(t, '""', '');
  testParseStringLiteral(t, "'x'", 'x');
  testParseStringLiteral(t, '"x"', 'x');
  testParseStringLiteral(t, "'\\\\\\''", "\\'");
  testParseStringLiteral(t, '"\\\\\\\""', '\\\"');
  testParseStringLiteral(t, "'\\\r'", '\r');
  testParseStringLiteral(t, '"\\\r\n"', '\r\n');
  testParseStringLiteral(t, '"\\\n"', '\n');
  testParseStringLiteral(t, '"\\\u2028"', '\u2028');
  testParseStringLiteral(t, '"\\\u2029"', '\u2029');
  testParseStringLiteral(t, '"\u202a"', '\u202a');
  testParseStringLiteral(t, '"\\0"', '\0');
  testParseStringLiteral(t, '"\\0x"', '\0x');
  testParseStringLiteral(t, '"\\01"', '\x01');
  testParseStringLiteral(t, '"\\1"', '\x01');
  testParseStringLiteral(t, '"\\11"', '\t');
  testParseStringLiteral(t, '"\\111"', 'I');
  testParseStringLiteral(t, '"\\1111"', 'I1');
  testParseStringLiteral(t, '"\\2111"', '\x891');
  testParseStringLiteral(t, '"\\5111"', ')11');
  testParseStringLiteral(t, '"\\5a"', '\x05a');
  testParseStringLiteral(t, '"\\7a"', '\x07a');
  testParseStringLiteral(t, '"\a"', 'a');
  testParseStringLiteral(t, '"\\u{00F8}"', '\xF8');
  testParseStringLiteral(t, '"\\u{0}"', '\0');
  testParseStringLiteral(t, '"\\u{10FFFF}"', '\uDBFF\uDFFF');
  testParseStringLiteral(t, '"\\u{0000000000F8}"', '\xF8');
});
