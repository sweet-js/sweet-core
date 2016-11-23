import test from 'ava';
import expect from 'expect.js';
import { List } from 'immutable';

import CharStream from '../src/char-stream';
import '../src/default-readtable';
import read from '../src/reader/token-reader';
import { TokenType as TT, TokenClass as TC, EmptyToken } from '../src/tokens';

function testParse(source, tst) {
  const results = read(source);

  if (results.isEmpty()) return;

  tst(results.first().token);
}

function testParseResults(source, tst) {
  tst(read(source).map(s => s.token));
}

test('should parse Unicode identifiers', t => {
  function testParseIdentifier(t, source, id) {
    testParse(source, result => {
      t.is(result.value, id);
      t.is(result.type, TT.IDENTIFIER);
      t.deepEqual(result.slice.startLocation, {
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

test('should parse keywords', t => {
  function testParseKeyword(t, source, id) {
    testParse(source, result => {
      t.is(result.value, id);
      t.is(result.type.klass, TC.Keyword);
      t.deepEqual(result.slice.startLocation, {
        filename: '',
        line: 1,
        column: 1,
        position: 0
      });
    });
  }

  testParseKeyword(t, 'await ', 'await');
  testParseKeyword(t, 'break ', 'break');
  testParseKeyword(t, 'case ', 'case');
  testParseKeyword(t, 'catch ', 'catch');
  testParseKeyword(t, 'class ', 'class');
});

test('should parse punctuators', t => {
  function testParsePunctuator(t, source, p) {
    testParse(source, result => {
      t.is(result.value, p);
      t.is(result.type.klass, TC.Punctuator);
      t.deepEqual(result.slice.startLocation, {
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
    testParse(source, result => {
      t.is(result, EmptyToken);
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
      expect(result.type).to.eql(TT.STRING);
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
      t.is(result.type, TT.TEMPLATE);
      const elt = result.items.first();
      t.is(elt.type, TT.TEMPLATE);
      t.is(elt.value, value);
      t.is(elt.tail, isTail);
      t.is(elt.interp, isInterp);
    });
  }

  testParseTemplateLiteral(t, '`foo`', 'foo', true, false);
  testParseTemplateLiteral(t, '`"foo"`', '"foo"', true, false);
  testParseTemplateLiteral(t, '`\\111`', 'I', true, false);
  testParseTemplateLiteral(t, '`foo${bar}`', 'foo', false, true);
  testParse('`foo${bar}baz`', result => {
    t.is(result.type, TT.TEMPLATE);
    const [x,y,z] = result.items;

    t.is(x.type, TT.TEMPLATE);
    t.is(x.value, 'foo');
    t.false(x.tail);
    t.true(x.interp);

    t.true(List.isList(y.token));
    t.is(y.token.get(1).token.type, TT.IDENTIFIER);
    t.is(y.token.get(1).token.value, 'bar');

    t.is(z.type, TT.TEMPLATE);
    t.is(z.value, 'baz');
    t.true(z.tail);
    t.false(z.interp);
  });
});

test('should parse delimiters', t => {
  function testParseDelimiter(t, source, value) {
    testParse(source, results => {
      t.true(List.isList(results));
      results.forEach((r, i) => t.true(source.includes(r.token.value)));
    });
  }

  testParseDelimiter(t, '{a}', 'a');

  testParse('{ x + z }', result => {
    t.true(List.isList(result));

    const [v,w,x,y,z] = result.map(s => s.token);

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

    const [v,w,x,y,z] = result.map(s => s.token);

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

    const [v,w,x,y,z] = result.map(s => s.token);

    t.is(v.type, TT.LBRACK);

    t.true(List.isList(w));

    const [a,b,c,d,e] = w.map(s => s.token);

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
});

test('should parse regexp literals', t => {
  function testParseRegExpLiteral(t, source, value) {
    testParse(source, result => {
      t.is(result.type, TT.REGEXP);
      t.is(result.value, value);
    });
  }

  testParseRegExpLiteral(t, '/foo/g ', '/foo/g');
  testParseRegExpLiteral(t, '/=foo/g ', '/=foo/g');

  testParseResults('if (x) /a/', ([x,y,z]) => {
    t.is(x.type, TT.IF);
    t.true(List.isList(y));

    t.is(z.type, TT.REGEXP);
    t.is(z.value, '/a/');
  });
});

test('should parse division expressions', t => {
  testParseResults('a/4/3', ([v,w,x,y,z]) => {
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
