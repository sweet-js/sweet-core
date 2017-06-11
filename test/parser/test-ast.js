import test from 'ava';
import { getAst } from '../assertions';

test('does not include the lang directive in the AST', t => {
  t.snapshot(
    getAst(`
    'lang sweet.js';
  `)
  );
});

test('does include the use strict directive in the AST', t => {
  t.snapshot(
    getAst(`
    'use strict';
  `)
  );
});

test('includes export in AST', t => {
  t.snapshot(
    getAst(`
    export { b }
    `)
  );
});

test('includes export with renaming in AST', t => {
  t.snapshot(
    getAst(`
    export { b as c}
    `)
  );
});

test('includes export declaration in AST', t => {
  t.snapshot(
    getAst(`
    export var x = 1;
    `)
  );
});
