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
