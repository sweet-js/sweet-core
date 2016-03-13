import expect from "expect.js";
import test from 'ava';

import { Symbol, gensym } from "../src/symbol";

test('with the same names should be ===', () => {
  let s1 = Symbol('foo');
  let s2 = Symbol('foo');

  expect(s1).to.be(s2);
});

test('with two different names should not be ===', () => {
  let s1 = Symbol('foo');
  let s2 = Symbol('bar');

  expect(s1).to.not.be(s2);
});

test('two gensyms should not be ===', () => {
  let s1 = gensym();
  let s2 = gensym();

  expect(s1).to.not.be(s2);
});

test('two symbols recreated from the names of two gensyms should not be ===', () => {
  let s1 = gensym();
  let s2 = gensym();

  expect(Symbol(s1.name)).to.not.be(Symbol(s2.name));
});

test( 'a symbol recreated from the name of a gensym should not be === with the original gensym', () => {
    let s1 = gensym();

    expect(Symbol(s1.name)).to.not.be(s1);
});
