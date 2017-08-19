import test from 'ava';
import { getAst } from '../assertions';

test('does not include the lang directive in the AST', t => {
  t.snapshot(
    getAst(`
    'lang sweet.js';
  `),
  );
});

test('does include the use strict directive in the AST', t => {
  t.snapshot(
    getAst(`
    'use strict';
  `),
  );
});

test('includes export in AST', t => {
  t.snapshot(
    getAst(`
    export { b }
    `),
  );
});

test('includes export with renaming in AST', t => {
  t.snapshot(
    getAst(`
    export { b as c}
    `),
  );
});

test('includes export declaration in AST', t => {
  t.snapshot(
    getAst(`
    export var x = 1;
    `),
  );
});

test('includes support for async function declarations', t => {
  t.snapshot(
    getAst(`
    async function f() {}
    `),
  );
});

test('includes support for async function expressions', t => {
  t.snapshot(
    getAst(`
    let f = async function f() {}
    `),
  );
});

test('includes support for exporting async functions', t => {
  t.snapshot(
    getAst(`
    export async function f() {}
    `),
  );
});

test('includes support for exporting default async functions', t => {
  t.snapshot(
    getAst(`
    export default async function f() {}
    `),
  );
});

test('includes no-line-terminator requirement for async functions', t => {
  t.snapshot(
    getAst(`
    async 
    function f() {}
    `),
  );
});

test('includes no-line-terminator requirement for async function expressions', t => {
  t.snapshot(
    getAst(`
    let f = async 
    function f() {}
    `),
  );
});

test('includes support for async arrow functions', t => {
  t.snapshot(
    getAst(`
    let f = async () => {}
    `),
  );
});

test('includes support for async method definitions', t => {
  t.snapshot(
    getAst(`
    class C {
      async f() {}
    }
    `),
  );
});

test('handles properties named async', t => {
  t.snapshot(
    getAst(`
    let o = {
      async: true
    }
    `),
  );
});

test('includes support for await', t => {
  t.snapshot(
    getAst(`
    async function f () {
      await g();
    }
    `),
  );
});
