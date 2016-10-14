// @flow
import test from 'ava';
import expect from 'expect.js';

import CharStream from '../src/char-stream';
import { setCurrentReadtable } from '../src/readtable';
import defaultReadtable from '../src/default-readtable';
import TokenReader from '../src/reader/token-reader';
import { EmptyToken } from '../src/tokens';

setCurrentReadtable(defaultReadtable);

let reader;

function testParse(source, tst) {
  reader = new TokenReader();
  const stream = new CharStream(source);
  const result = reader.read(stream);

  if (result == null) return;

  tst(result, stream);
}

test('should parse Unicode identifiers', t => {
  function testParseIdentifier(t, source, id) {
    testParse(source, result => {
      t.is(result.value, id);
      t.is(result.type, 'Identifier');
      t.deepEqual(result.locationInfo, {
        filename: '',
        line: 1,
        column: 1,
        position: 0
      });
    });
  }

  testParseIdentifier(t, 'abcd xyz', 'abcd');
  testParseIdentifier(t, '日本語 ', '日本語');
  testParseIdentifier(t, '\u2163\u2161 ', '\u2163\u2161');
  testParseIdentifier(t, '\\u2163\\u2161 ', '\u2163\u2161');
  testParseIdentifier(t, '\u{102A7} ', '\u{102A7}');
  testParseIdentifier(t, '\\u{102A7} ', '\u{102A7}');
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
        line: 1,
        column: 1,
        position: 0
      });
    });
  }

  testParsePunctuator(t, '+ ', '+');
  testParsePunctuator(t, '+= ', '+=');
  testParsePunctuator(t, '; ', ';');
  testParsePunctuator(t, '>>> ', '>>>');
});

test('should parse whitespace', t => {
  function testParseWhiteSpace(t, source) {
    testParse(source, result => t.is(result, EmptyToken));
  }
  testParseWhiteSpace(t, ' ');
  testParseWhiteSpace(t, '\t');
  testParseWhiteSpace(t, '\uFEFF');
});

test('should parse line terminators', t => {
  function testParseLineTerminators(t, source) {
    testParse(source, (result, stream) => {
      const { line, column } = reader.locationInfo;
      const { position } = stream.sourceInfo;
      t.is(result, EmptyToken);
      t.is(line, 2);
      t.is(column, 1);
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
    testParse(source, result => {
      expect(result.type).to.eql('StringLiteral');
      expect(result.value).to.eql(value);
    });
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
  testParseStringLiteral(t, '"\\u202a"', '\u202a');
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

test('should parse template literals', t => {
  function testParseTemplateLiteral(t, source, value, isTail, isInterp) {
    testParse(source, result => {
      t.is(result.type, 'TemplateLiteral')
      const elt = result.items.first();
      t.is(elt.type, 'TemplateElement')
      t.is(elt.value, value);
      t.is(elt.tail, isTail);
      t.is(elt.interp, isInterp)
    });
  }

  testParseTemplateLiteral(t, '`foo`', 'foo', true, false);
  testParseTemplateLiteral(t, '`"foo"`', '"foo"', true, false);
  testParseTemplateLiteral(t, '`\\111`', 'I', true, false);
  testParseTemplateLiteral(t, '`foo${bar}`', 'foo', false, true);
  testParse('`foo${bar}baz`', result => {
    t.is(result.type, 'TemplateLiteral');
    const [x,y,z] = result.items;

    t.is(x.type, 'TemplateElement');
    t.is(x.value, 'foo');
    t.false(x.tail);
    t.true(x.interp);

    t.is(y.type, 'Identifier');
    t.is(y.value, 'bar');

    t.is(z.type, 'TemplateElement');
    t.is(z.value, 'baz');
    t.true(z.tail);
    t.false(z.interp);
  });
});

test('should parse delimiters', t => {
  function testParseDelimiter(t, source, value) {
    testParse(source, result => {
      t.is(result.type, 'Delimiter');
      t.is(result.items.first().value, value);
    });
  }

  testParseDelimiter(t, '{a}', 'a');

  testParse('{ x + z }', result => {
    t.is(result.type, 'Delimiter');
    t.is(result.value, '{');

    const [x,y,z] = result.items;

    t.is(x.type, 'Identifier');
    t.is(x.value, 'x');

    t.is(y.type, 'Punctuator');
    t.is(y.value, '+');

    t.is(z.type, 'Identifier');
    t.is(z.value, 'z');
  });
});
