import test from 'ava';
import { SyntaxOrTermWrapper } from '../src/macro-context';
import Syntax from '../src/syntax';
import { List } from 'immutable';
import { Maybe } from 'ramda-fantasy';
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

test('a wrapper should work with keywords', t => {
  let kwd = Syntax.fromKeyword('foo');
  let wrap = new SyntaxOrTermWrapper(kwd);
  t.true(wrap.isKeyword());
  t.true(wrap.isKeyword('foo'));
  t.false(wrap.isKeyword('bar'));
});

test('a wrapper should work with identifiers', t => {
  let ident = Syntax.fromIdentifier('foo');
  let wrap = new SyntaxOrTermWrapper(ident);
  t.true(wrap.isIdentifier());
  t.true(wrap.isIdentifier('foo'));
  t.false(wrap.isIdentifier('bar'));
});

test('a wrapper should work with numbers', t => {
  let val = Syntax.fromNumber(42);
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.isNumericLiteral());
  t.true(wrap.isNumericLiteral(42));
  t.false(wrap.isNumericLiteral(24));
});

test('a wrapper should work with strings', t => {
  let val = Syntax.fromString('foo');
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.isStringLiteral());
  t.true(wrap.isStringLiteral('foo'));
  t.false(wrap.isStringLiteral('bar'));
});


test('a wrapper should work with nulls', t => {
  let val = Syntax.fromNull();
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.isNullLiteral());
});

test('a wrapper should work with punctuators', t => {
  let val = Syntax.fromPunctuator(',');
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.isPunctuator());
  t.true(wrap.isPunctuator(','));
  t.false(wrap.isPunctuator('.'));
});

test('a wrapper should work with regular expressions', t => {
  let val = Syntax.fromRegularExpression('abc');
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.isRegularExpression());
  t.true(wrap.isRegularExpression('abc'));
  t.false(wrap.isRegularExpression('foo'));
});

test('a wrapper should work with braces', t => {
  let val = Syntax.fromBraces(List.of(Syntax.fromIdentifier('foo')));
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.isBraces());
  t.true(wrap.isDelimiter());
  t.true(null === wrap.val());
});

test('a wrapper should work with brackets', t => {
  let val = Syntax.fromBrackets(List.of(Syntax.fromIdentifier('foo')));
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.isBrackets());
  t.true(wrap.isDelimiter());
  t.true(null === wrap.val());
});

test('a wrapper should work with parens', t => {
  let val = Syntax.fromParens(List.of(Syntax.fromIdentifier('foo')));
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.isParens());
  t.true(wrap.isDelimiter());
  t.true(null === wrap.val());
});

test('a wrapper should work with an inner iterator', t => {
  let val = Syntax.fromParens(List.of(Syntax.fromIdentifier('foo'), Syntax.fromIdentifier('bar')));
  let wrap = new SyntaxOrTermWrapper(val);
  let ctx = wrap.inner();
  let foo = ctx.next();
  let bar = ctx.next();

  t.true(foo.value.isIdentifier('foo'));
  t.true(bar.value.isIdentifier('bar'));
  t.true(ctx.next().done);
});
