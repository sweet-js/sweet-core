import test from 'ava';
import expect from 'expect.js';
import { List } from 'immutable';

import { getCurrentReadtable } from 'readtable';
import read from '../../src/reader/token-reader';
import {
  TokenType as TT,
  TokenClass as TC,
  EmptyToken,
} from '../../src/tokens';

function testParse(source, tst) {
  const prevTable = getCurrentReadtable();
  const [result] = read(source);
  expect(getCurrentReadtable() === prevTable).to.be.true;

  if (result == null) return;

  tst(result);
}

function testParseResults(source, tst) {
  const prevTable = getCurrentReadtable();
  const result = read(source);
  expect(getCurrentReadtable() === prevTable).to.be.true;
  tst(result);
}

test('should parse Unicode identifiers', t => {
  function testParseIdentifier(source, id) {
    testParse(source, result => {
      t.is(result.value, id);
      t.is(result.type, TT.IDENTIFIER);
      t.deepEqual(result.slice.startLocation, {
        filename: '',
        line: 1,
        column: 1,
        position: 0,
      });
    });
  }

  testParseIdentifier('abcd xyz', 'abcd');
  testParseIdentifier('awaits ', 'awaits');
  testParseIdentifier('日本語 ', '日本語');
  testParseIdentifier('\u2163\u2161 ', '\u2163\u2161');
  testParseIdentifier('\\u2163\\u2161 ', '\u2163\u2161');
  testParseIdentifier('\u{102A7} ', '\u{102A7}');
  testParseIdentifier('\\u{102A7} ', '\u{102A7}');
  testParseIdentifier('a\u{102A7}a ', 'a\u{102A7}a');
  testParseIdentifier('a\\u{102A7}a ', 'a\u{102A7}a');
  testParseIdentifier('\uD800\uDC00 ', '\uD800\uDC00');
  testParseIdentifier('\u2163\u2161\u200A', '\u2163\u2161');
  testParseIdentifier('a\u2163\u2161a\u200A', 'a\u2163\u2161a');
  testParseIdentifier('a\\u0061', 'aa');
  testParseIdentifier('a\\u0061a', 'aaa');
  testParseIdentifier('\\u0061a', 'aa');
});

test('should throw given invalid characters', t => {
  const error = t.throws(() => read('∇'));

  t.true(error.message.includes('Invalid or unexpected token'));
});

test('should parse keywords', t => {
  function testParseKeyword(source, id) {
    testParse(source, result => {
      t.is(result.value, id);
      t.is(result.type.klass, TC.Keyword);
      t.deepEqual(result.slice.startLocation, {
        filename: '',
        line: 1,
        column: 1,
        position: 0,
      });
    });
  }

  // testParseKeyword('await ', 'await'); TODO: uncomment when await is a keyword
  testParseKeyword('break ', 'break');
  testParseKeyword('case ', 'case');
  testParseKeyword('catch ', 'catch');
  testParseKeyword('class ', 'class');
});

test('should parse punctuators', t => {
  function testParsePunctuator(source, p) {
    testParse(source, result => {
      t.is(result.value, p);
      t.is(result.type.klass, TC.Punctuator);
      t.deepEqual(result.slice.startLocation, {
        filename: '',
        line: 1,
        column: 1,
        position: 0,
      });
    });
  }

  testParsePunctuator('+ ', '+');
  testParsePunctuator('+= ', '+=');
  testParsePunctuator('; ', ';');
  testParsePunctuator('>>> ', '>>>');
  testParsePunctuator('+42', '+');
});

test('should parse whitespace', t => {
  function testParseWhiteSpace(source) {
    testParse(source, result => t.is(result, EmptyToken));
  }
  testParseWhiteSpace(' ');
  testParseWhiteSpace('\t');
  testParseWhiteSpace('\uFEFF');
});

test('should parse line terminators', t => {
  function testParseLineTerminators(source) {
    testParse(source, result => {
      t.is(result, EmptyToken);
    });
  }

  testParseLineTerminators('\n');
  testParseLineTerminators('\r\n');
  testParseLineTerminators('\u2029');
});

test('should parse numeric literals', t => {
  function testParseNumericLiterals(source, value) {
    testParse(source, result => t.is(result.value, value));
  }
  testParseNumericLiterals('0', 0);
  testParseNumericLiterals('1', 1);
  testParseNumericLiterals('2', 2);
  testParseNumericLiterals('3', 3);
  testParseNumericLiterals('4', 4);
  testParseNumericLiterals('5', 5);
  testParseNumericLiterals('6', 6);
  testParseNumericLiterals('7', 7);
  testParseNumericLiterals('8', 8);
  testParseNumericLiterals('9', 9);
  testParseNumericLiterals('0xFFFF ', 0xffff);
  testParseNumericLiterals('0xFF ', 0xff);
  testParseNumericLiterals('0o0756 ', 0o0756);
  testParseNumericLiterals('0o76 ', 0o76);
  testParseNumericLiterals('0b1010 ', 0b1010);
  testParseNumericLiterals('0b10 ', 0b10);
  testParseNumericLiterals('042 ', 0o042);
  testParseNumericLiterals('42 ', 42);
  testParseNumericLiterals('2e308', 1 / 0);
  testParseNumericLiterals('1.5', 1.5);
});

test('should parse string literals', t => {
  function testParseStringLiteral(source, value) {
    testParse(source, result => {
      expect(result.type).to.eql(TT.STRING);
      expect(result.str).to.eql(value);
    });
  }

  testParseStringLiteral('""', '');
  testParseStringLiteral("'x'", 'x');
  testParseStringLiteral('"x"', 'x');
  testParseStringLiteral("'\\\\\\''", "\\'");
  testParseStringLiteral('"\\\\\\""', '\\"');
  testParseStringLiteral("'\\\r'", '');
  testParseStringLiteral('"\\\r\n"', '');
  testParseStringLiteral('"\\\n"', '');
  testParseStringLiteral('"\\\u2028"', '');
  testParseStringLiteral('"\\\u2029"', '');
  testParseStringLiteral('"\\u202a"', '\u202a');
  testParseStringLiteral('"\\0"', '\0');
  testParseStringLiteral('"\\0x"', '\0x');
  testParseStringLiteral('"\\01"', '\x01');
  testParseStringLiteral('"\\1"', '\x01');
  testParseStringLiteral('"\\11"', '\t');
  testParseStringLiteral('"\\111"', 'I');
  testParseStringLiteral('"\\1111"', 'I1');
  testParseStringLiteral('"\\2111"', '\x891');
  testParseStringLiteral('"\\5111"', ')11');
  testParseStringLiteral('"\\5a"', '\x05a');
  testParseStringLiteral('"\\7a"', '\x07a');
  testParseStringLiteral('"a"', 'a');
  testParseStringLiteral('"\\u{00F8}"', '\xF8');
  testParseStringLiteral('"\\u{0}"', '\0');
  testParseStringLiteral('"\\u{10FFFF}"', '\uDBFF\uDFFF');
  testParseStringLiteral('"\\u{0000000000F8}"', '\xF8');
});

test('should parse template literals', t => {
  function testParseTemplateLiteral(source, value, isTail, isInterp) {
    testParse(source, result => {
      t.is(result.type, TT.TEMPLATE);
      const elt = result.items.first();
      t.is(elt.type, TT.TEMPLATE);
      t.is(elt.value, value);
      t.is(elt.tail, isTail);
      t.is(elt.interp, isInterp);
    });
  }

  testParseTemplateLiteral('`foo`', 'foo', true, false);
  testParseTemplateLiteral('`"foo"`', '"foo"', true, false);
  // should test that this throws in strict mode and passes in sloppy
  // testParseTemplateLiteral('`\\111`', 'I', true, false);
  testParseTemplateLiteral('`foo${bar}`', 'foo', false, true);
  testParse('`foo${bar}baz`', result => {
    t.is(result.type, TT.TEMPLATE);
    const [x, y, z] = result.items;

    t.is(x.type, TT.TEMPLATE);
    t.is(x.value, 'foo');
    t.false(x.tail);
    t.true(x.interp);

    t.true(List.isList(y));
    t.is(y.get(1).type, TT.IDENTIFIER);
    t.is(y.get(1).value, 'bar');

    t.is(z.type, TT.TEMPLATE);
    t.is(z.value, 'baz');
    t.true(z.tail);
    t.false(z.interp);
  });
});

test('should parse delimiters', t => {
  function testParseDelimiter(source, value) {
    testParse(source, results => {
      t.true(List.isList(results));
      results.forEach((r, i) => t.true(source.includes(r.value)));
    });
  }

  testParseDelimiter('{a}', 'a');

  testParse('{ x + z }', result => {
    t.true(List.isList(result));

    const [v, w, x, y, z] = result;

    t.is(v.type, TT.LBRACE);

    t.is(w.type, TT.IDENTIFIER);
    t.is(w.value, 'x');

    t.is(x.type, TT.ADD);

    t.is(y.type, TT.IDENTIFIER);
    t.is(y.value, 'z');

    t.is(z.type, TT.RBRACE);
  });

  testParse('[ x , z ]', result => {
    t.true(List.isList(result));

    const [v, w, x, y, z] = result;

    t.is(v.type, TT.LBRACK);

    t.is(w.type, TT.IDENTIFIER);
    t.is(w.value, 'x');

    t.is(x.type, TT.COMMA);

    t.is(y.type, TT.IDENTIFIER);
    t.is(y.value, 'z');

    t.is(z.type, TT.RBRACK);
  });

  testParse('[{x : 3}, z]', result => {
    t.true(List.isList(result));

    const [v, w, x, y, z] = result;

    t.is(v.type, TT.LBRACK);

    t.true(List.isList(w));

    const [a, b, c, d, e] = w;

    t.is(a.type, TT.LBRACE);

    t.is(b.type, TT.IDENTIFIER);
    t.is(b.value, 'x');

    t.is(c.type, TT.COLON);

    t.is(d.type, TT.NUMBER);
    t.is(d.value, 3);

    t.is(e.type, TT.RBRACE);

    t.is(x.type, TT.COMMA);

    t.is(y.type, TT.IDENTIFIER);
    t.is(y.value, 'z');

    t.is(z.type, TT.RBRACK);
  });

  testParseResults(`foo('bar')`, ([foo, bar]) => {
    t.is(foo.type, TT.IDENTIFIER);
    t.is(foo.value, 'foo');

    const [x, y, z] = bar;

    t.is(x.type, TT.LPAREN);

    t.is(y.type, TT.STRING);
    t.is(y.str, 'bar');
    t.is(y.slice.text, "'bar'");

    t.is(z.type, TT.RPAREN);
  });
});

test('should parse regexp literals', t => {
  function testParseRegExpLiteral(source, value) {
    testParse(source, result => {
      t.is(result.type, TT.REGEXP);
      t.is(result.value, value);
    });
  }

  testParseRegExpLiteral('/foo/g ', '/foo/g');
  testParseRegExpLiteral('/=foo/g ', '/=foo/g');

  testParseResults('if (x) /a/', ([x, y, z]) => {
    t.is(x.type, TT.IF);
    t.true(List.isList(y));

    t.is(z.type, TT.REGEXP);
    t.is(z.value, '/a/');
  });
});

test('should parse division expressions', t => {
  testParseResults('a/4/3', ([v, w, x, y, z]) => {
    t.is(v.type, TT.IDENTIFIER);
    t.is(v.value, 'a');

    t.is(w.type, TT.DIV);

    t.is(x.type, TT.NUMBER);
    t.is(x.value, 4);

    t.is(y.type, TT.DIV);

    t.is(z.type, TT.NUMBER);
    t.is(z.value, 3);
  });
});

test('should parse syntax templates', t => {
  testParseResults('#`a 1 ${}`', ([result]) => {
    const [u, v, w, x, y, z] = result;
    t.is(u.type, TT.LSYNTAX);

    t.is(v.type, TT.IDENTIFIER);
    t.is(v.value, 'a');

    t.is(w.type, TT.NUMBER);
    t.is(w.value, 1);

    t.is(x.type, TT.IDENTIFIER);
    t.is(x.value, '$');

    t.true(List.isList(y));
    t.is(y.first().type, TT.LBRACE);
    t.is(y.get(1).type, TT.RBRACE);

    t.is(z.type, TT.RSYNTAX);
  });
});

test('should erase #lang pragmas', t => {
  const results = read(`#lang "sweet.js"`);
  t.true(List.isList(results));
  t.true(results.size === 1);
});

test('should return an identifier for a lone #', t => {
  const results = read(`const # = 3`);
  t.true(List.isList(results));
  t.is(results.get(1).type, TT.IDENTIFIER);
});

test('should parse comments', t => {
  function testParseComment(source) {
    const result = read(source);
    t.true(result.isEmpty());
  }

  testParseComment("// this is a single line comment\n // here's another");
  testParseComment('/* this is a block line comment */');
  testParseComment(
    `/*
  * this
  * is
  * a
  * multi
  * line
  * comment
  */`,
  );
});

test('should properly update location information', t => {
  function testLocationInfo(
    source,
    { idx, size, line: expectedLine, column: expectedColumn },
  ) {
    let result = read(source);
    let { line, column } = result.get(idx).slice.startLocation;
    t.is(result.size, size);
    t.is(line, expectedLine);
    t.is(column, expectedColumn);
  }
  testLocationInfo('1 2 3 []\na b c', { idx: 6, size: 7, line: 2, column: 5 });
  testLocationInfo('1 2 3 []\na b c', { idx: 2, size: 7, line: 1, column: 5 });
  testLocationInfo(' /*3456789*/a', { idx: 0, size: 1, line: 1, column: 13 });
  testLocationInfo(
    `a/*
  * this
  * is
  * a
  * multi
  * line
  * comment
  */b c`,
    { idx: 2, size: 3, line: 8, column: 7 },
  );
  testLocationInfo('"a\\\nb c\\\n d f g" a', {
    idx: 1,
    size: 2,
    line: 3,
    column: 9,
  });
});
