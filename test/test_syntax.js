import Syntax from "../src/syntax";
import expect from "expect.js";
import { Scope, freshScope } from "../src/scope";
import BindingMap from "../src/binding-map";

import Reader from "../src/shift-reader";
import { serializer, makeDeserializer } from "../src/serializer";

import { Symbol, gensym } from "../src/symbol";
import test from 'ava';


test('that have no bindings or scopes should resolve to their original name ', () => {
  let foo = Syntax.fromIdentifier('foo');
  expect(foo.resolve(0)).to.be('foo');
});

test('where one identifier has a scope and associated binding and the other does not will resolve to different names', () => {
    let bindings = new BindingMap();
    let scope1 = freshScope("1");

    let foo = Syntax.fromIdentifier('foo');
    let foo_1 = Syntax.fromIdentifier('foo');

    foo_1 = foo_1.addScope(scope1, bindings, 0);

    bindings.add(foo_1, { binding: gensym('foo'), phase: 0 });

    expect(foo.resolve(0)).to.not.be(foo_1.resolve(0));
  });

test('resolve to different bindings when both identifiers have a binding on a different scope', () => {
    let bindings = new BindingMap();
    let scope1 = freshScope("1");
    let scope2 = freshScope("2");

    let foo_1 = Syntax.fromIdentifier('foo');
    let foo_2 = Syntax.fromIdentifier('foo');

    foo_1 = foo_1.addScope(scope1, bindings, 0);
    foo_2 = foo_2.addScope(scope2, bindings, 0);

    bindings.add(foo_1, {binding: gensym('foo'), phase: 0});
    bindings.add(foo_2, { binding: gensym('foo'), phase: 0});

    expect(foo_1.resolve(0)).to.not.be(foo_2.resolve(0));
  });

test('should resolve when syntax object has a scopeset that is a superset of the binding', () => {
    let bindings = new BindingMap();
    let scope1 = freshScope("1");
    let scope2 = freshScope("2");
    let scope3 = freshScope("3");

    let foo_1 = Syntax.fromIdentifier('foo');
    let foo_123 = Syntax.fromIdentifier('foo');

    foo_1 = foo_1.addScope(scope1, bindings, 0);

    foo_123 = foo_123.addScope(scope1, bindings, 0)
      .addScope(scope2, bindings, 0)
      .addScope(scope3, bindings, 0);

    bindings.add(foo_1, {binding: gensym('foo'), phase: 0});

    expect(foo_1.resolve(0)).to.be(foo_123.resolve(0));
  });

test('should throw an error for ambiguous scops sets', () => {
  let bindings = new BindingMap();
  let scope1 = freshScope("1");
  let scope2 = freshScope("2");
  let scope3 = freshScope("3");

  let foo_13 = Syntax.fromIdentifier('foo');
  let foo_12 = Syntax.fromIdentifier('foo');
  let foo_123 = Syntax.fromIdentifier('foo');

  foo_13 = foo_13.addScope(scope1, bindings, 0)
    .addScope(scope3, bindings, 0);

  foo_12 = foo_12.addScope(scope1, bindings, 0)
    .addScope(scope2, bindings, 0);

  foo_123 = foo_123.addScope(scope1, bindings, 0)
    .addScope(scope2, bindings, 0)
    .addScope(scope3, bindings, 0);

  bindings.add(foo_13, {binding: gensym('foo'), phase: 0});
  bindings.add(foo_12, {binding: gensym('foo'), phase: 0});

  expect(() => foo_123.resolve(0)).to.throwError();
});

test('should make a number syntax object', () => {
  let s = Syntax.fromNumber(42);

  expect(s.val()).to.be(42);
});

test('should make an identifier syntax object', () => {
  let s = Syntax.fromIdentifier("foo");

  expect(s.val()).to.be("foo");
  expect(s.resolve(0)).to.be("foo");
});

test('should make an identifier syntax object with another identifier as the context', () => {
  let bindings = new BindingMap();
  let scope1 = freshScope("1");

  let foo = Syntax.fromIdentifier('foo').addScope(scope1, bindings, 0);
  bindings.add(foo, { binding: gensym('foo'), phase: 0});

  let foo_1 = Syntax.fromIdentifier('foo', foo);


  expect(foo.resolve(0)).to.be(foo_1.resolve(0));
});


let deserializer = makeDeserializer();
test('should work for a numeric literal', () => {
  let reader = new Reader("42");
  let json = serializer.write(reader.read());
  let stxl = deserializer.read(json);

  expect(stxl.get(0).isNumericLiteral()).to.be(true);
  expect(stxl.get(0).val()).to.be(42);
});

test('should work for a string literal', () => {
  let reader = new Reader("'foo'");
  let json = serializer.write(reader.read());
  let stxl = deserializer.read(json);

  expect(stxl.get(0).isStringLiteral()).to.be(true);
  expect(stxl.get(0).val()).to.be('foo');
});

test('should work for a paren delimiter', () => {
  let reader = new Reader("( 42 )");
  let json = serializer.write(reader.read());
  let stxl = deserializer.read(json);

  expect(stxl.get(0).isParens()).to.be(true);
  expect(stxl.get(0).inner().get(0).isNumericLiteral()).to.be(true);
  expect(stxl.get(0).inner().get(0).val()).to.be(42);
});

test('should work for an identifier', () => {
  let reader = new Reader("foo");
  let json = serializer.write(reader.read());
  let stxl = deserializer.read(json);

  expect(stxl.get(0).isIdentifier()).to.be(true);
  expect(stxl.get(0).val()).to.be('foo');
});

test('should work for a scope', () => {
  let bindings = new BindingMap();
  let scope = freshScope("1");

  let rtScope = deserializer.read(serializer.write(scope));
  expect(scope).to.be(rtScope);
});

test('should work for an identifier with a scope', () => {
  let bindings = new BindingMap();
  let scope1 = freshScope("1");
  let deserializer = makeDeserializer(bindings);

  let foo = Syntax.fromIdentifier('foo');
  foo = foo.addScope(scope1, bindings, 0);

  bindings.add(foo, {binding: gensym('foo'), phase: 0});

  let rtFoo = deserializer.read(serializer.write(foo));

  expect(rtFoo.resolve(0)).to.be(foo.resolve(0));
});
