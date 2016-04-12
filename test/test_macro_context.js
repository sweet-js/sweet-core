import test from 'ava';
import { SyntaxOrTermWrapper } from '../src/macro-context';
import Syntax from '../src/syntax';
import { List } from 'immutable';
import { Maybe } from 'ramda-fantasy';
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

test('a wrapper should work with keywords', t => {
  let kwd = Syntax.from("keyword", 'foo');
  let wrap = new SyntaxOrTermWrapper(kwd);
  t.true(wrap.match("keyword") );
  t.true(wrap.match("keyword",  'foo'));
  t.false(wrap.match("keyword",  'bar'));
});

test('a wrapper should work with identifiers', t => {
  let ident = Syntax.from("identifier", 'foo');
  let wrap = new SyntaxOrTermWrapper(ident);
  t.true(wrap.match("identifier") );
  t.true(wrap.match("identifier",  'foo'));
  t.false(wrap.match("identifier",  'bar'));
});

test('a wrapper should work with numbers', t => {
  let val = Syntax.from("number", 42);
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.match("number") );
  t.true(wrap.match("number",  42));
  t.false(wrap.match("number",  24));
});

test('a wrapper should work with strings', t => {
  let val = Syntax.from("string", 'foo');
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.match("string") );
  t.true(wrap.match("string",  'foo'));
  t.false(wrap.match("string",  'bar'));
});


test('a wrapper should work with nulls', t => {
  let val = Syntax.from("null", );
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.match("null") );
});

test('a wrapper should work with punctuators', t => {
  let val = Syntax.from("punctuator", ',');
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.match("punctuator") );
  t.true(wrap.match("punctuator",  ','));
  t.false(wrap.match("punctuator",  '.'));
});

test('a wrapper should work with regular expressions', t => {
  let val = Syntax.from("regularExpression", 'abc');
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.match("regularExpression") );
  t.true(wrap.match("regularExpression",  'abc'));
  t.false(wrap.match("regularExpression",  'foo'));
});

test('a wrapper should work with braces', t => {
  let val = Syntax.from("braces", List.of(Syntax.from("identifier", 'foo')));
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.match("braces") );
  t.true(wrap.match("delimiter") );
  t.true(null === wrap.val());
});

test('a wrapper should work with brackets', t => {
  let val = Syntax.from("brackets", List.of(Syntax.from("identifier", 'foo')));
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.match("brackets") );
  t.true(wrap.match("delimiter") );
  t.true(null === wrap.val());
});

test('a wrapper should work with parens', t => {
  let val = Syntax.from("parens", List.of(Syntax.from("identifier", 'foo')));
  let wrap = new SyntaxOrTermWrapper(val);
  t.true(wrap.match("parens") );
  t.true(wrap.match("delimiter") );
  t.true(null === wrap.val());
});

test('a wrapper should work with an inner iterator', t => {
  let val = Syntax.from("parens", List.of(Syntax.from("identifier", 'foo'), Syntax.from("identifier", 'bar')));
  let wrap = new SyntaxOrTermWrapper(val);
  let ctx = wrap.inner();
  let foo = ctx.next();
  let bar = ctx.next();

  t.true(foo.value.match("identifier",  'foo'));
  t.true(bar.value.match("identifier",  'bar'));
  t.true(ctx.next().done);
});
