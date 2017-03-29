import read from '../../src/reader/token-reader';
import test from 'ava';
import * as H from '../../helpers';
import { wrapInTerms } from '../../src/macro-context.js';

function wrappingRead(src) {
  let [r] = wrapInTerms(read(src));
  return r;
}

test('should help with an identifier', t => {
  let r = wrappingRead('foo');
  t.true(H.isIdentifier(r));
  t.is(H.unwrap(r).value, 'foo');

  let x = H.fromIdentifier(r, 'foo');
  t.true(H.isIdentifier(x));
  t.is(H.unwrap(x).value, 'foo');
});

test('should help with a keyword', t => {
  let r = wrappingRead('if');
  t.true(H.isKeyword(r));
  t.is(H.unwrap(r).value, 'if');

  let x = H.fromKeyword(r, 'if');
  t.true(H.isKeyword(x));
  t.is(H.unwrap(x).value, 'if');
});

test('should help with a punctuator', t => {
  let r = wrappingRead(';');
  t.true(H.isPunctuator(r));
  t.is(H.unwrap(r).value, ';');

  let x = H.fromPunctuator(r, ';');
  t.true(H.isPunctuator(x));
  t.is(H.unwrap(x).value, ';');
});

test('should help with a numeric', t => {
  let r = wrappingRead('42');
  t.true(H.isNumericLiteral(r));
  t.is(H.unwrap(r).value, 42);

  let x = H.fromNumericLiteral(r, 42);
  t.true(H.isNumericLiteral(x));
  t.is(H.unwrap(x).value, 42);
});

test('should help with a string literal', t => {
  let r = wrappingRead('"foo"');
  t.true(H.isStringLiteral(r));
  t.is(H.unwrap(r).value, 'foo');

  let x = H.fromStringLiteral(r, 'foo');
  t.true(H.isStringLiteral(x));
  t.is(H.unwrap(x).value, 'foo');
});

test('should help with a template', t => {
  let r = wrappingRead('`foo`');
  let [el] = H.unwrap(r).value;
  t.true(H.isTemplate(r));
  t.true(H.isTemplateElement(el));
  t.is(H.unwrap(el).value, 'foo');
});

test('should help with a syntax template', t => {
  let r = wrappingRead('#`foo`');
  t.true(H.isSyntaxTemplate(r));
});

test('should help with a paren', t => {
  let r = wrappingRead('(foo)');
  t.true(H.isParens(r));

  let here = wrappingRead('here');
  let x = H.fromParens(here, [wrappingRead('foo')]);
  t.true(H.isParens(x));
});

test('should help with a bracket', t => {
  let r = wrappingRead('[foo]');
  t.true(H.isBrackets(r));

  let here = wrappingRead('here');
  let x = H.fromBrackets(here, [wrappingRead('foo')]);
  t.true(H.isBrackets(x));
});

test('should help with a brace', t => {
  let r = wrappingRead('{foo}');
  t.true(H.isBraces(r));

  let here = wrappingRead('here');
  let x = H.fromBraces(here, [wrappingRead('foo')]);
  t.true(H.isBraces(x));
});
