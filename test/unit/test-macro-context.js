import test from 'ava';
import MacroContext from '../../src/macro-context';
import Syntax from '../../src/syntax';
import { makeEnforester } from '../assertions';
import { List } from 'immutable';

test('a macro context should have a name', t => {
  let enf = makeEnforester('a');
  let ctx = new MacroContext(enf, Syntax.fromIdentifier('foo'), {});
  t.true(ctx.name().value.val() === 'foo');
});

test('a macro context should be resettable', t => {
  let enf = makeEnforester('a b c');
  let ctx = new MacroContext(enf, 'foo', enf.context);

  let [a1, b1, c1] = [...ctx];
  t.true(ctx.next().done);

  ctx.reset();

  let nxt = ctx.next();
  t.false(nxt.done);

  let [a2, b2, c2] = [nxt.value, ...ctx];
  t.true(a1 === a2);
  t.true(b1 === b2);
  t.true(c1 === c2);
});

test('a macro context should be able to create a reset point', t => {
  let enf = makeEnforester('a b c');
  let ctx = new MacroContext(enf, Syntax.fromIdentifier('foo'), {});

  let a1 = ctx.next(); // a

  const bMarker = ctx.mark();

  const b1 = ctx.next(); // b

  const cMarker = ctx.mark();

  const c1 = ctx.next(); // c

  t.true(ctx.next().done);

  ctx.reset(bMarker);

  const [b2, c2] = [...ctx];

  ctx.reset(cMarker);

  const c3 = ctx.next();

  ctx.reset();

  let [a2, b3, c4] = [...ctx];

  ctx.reset(cMarker);

  let c5 = ctx.next();

  t.true(a1.value === a2);
  t.true(b1.value === b2 && b2 === b3);
  t.true(c1.value === c2 && c2 === c3.value && c2 === c4 && c4 === c5.value);
});

test("an enforester should be able to access a macro context's syntax list", t => {
  let enf = makeEnforester('a');
  let ctx = new MacroContext(enf, Syntax.fromIdentifier('foo'), {});
  t.true(ctx._rest(enf) instanceof List);
});
