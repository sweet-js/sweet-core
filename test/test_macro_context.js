import test from 'ava';
import MacroContext, { SyntaxOrTermWrapper } from '../src/macro-context';
import Syntax from '../src/syntax';
import { makeEnforester } from './assertions';
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

test('a macro context should have a name', t => {
  let enf = makeEnforester('a');
  let ctx = new MacroContext(enf, Syntax.fromIdentifier('foo'), {});
  t.true(ctx.name().val() === 'foo');
});

test('a macro context should be resettable', t => {
  let enf = makeEnforester('a b c');
  let ctx = new MacroContext(enf, 'foo', enf.context);
  const val = v => v.val();

  let [a1, b1, c1] = [...ctx].map(val);
  t.true(ctx.next().done);

  ctx.reset();

  let nxt = ctx.next();
  t.false(nxt.done);

  let [a2, b2, c2] = [nxt.value, ...ctx].map(val);
  t.true(a1 === a2);
  t.true(b1 === b2);
  t.true(c1 === c2);
});

test('a macro context should be able to create a reset point', t => {
  let enf = makeEnforester('a b c');
  let ctx = new MacroContext(enf, Syntax.fromIdentifier('foo'), {});
  const val = v => v.val();

  let a1 = ctx.next(); // a

  const bMarker = ctx.mark();

  const b1 = ctx.next(); // b

  const cMarker = ctx.mark();

  const c1 = ctx.next(); // c

  t.true(ctx.next().done);

  ctx.reset(bMarker);

  const [b2, c2] = [...ctx].map(val);

  ctx.reset(cMarker);

  const c3 = ctx.next();

  ctx.reset();

  let [a2, b3, c4] = [...ctx].map(val);

  ctx.reset(cMarker);

  let c5 = ctx.next();

  t.true(a1.value.val() === a2);
  t.true(b1.value.val() === b2 && b2 === b3);
  t.true(c1.value.val() === c2 &&
         c2 === c3.value.val() &&
         c2 === c4 &&
         c4 === c5.value.val());
});

test('an enforester should be able to access a macro context\'s syntax list', t => {
  let enf = makeEnforester('a');
  let ctx = new MacroContext(enf, Syntax.fromIdentifier('foo'), {});
  t.true(ctx._rest(enf) instanceof List);
});
