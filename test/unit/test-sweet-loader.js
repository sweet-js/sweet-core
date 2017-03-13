import test from 'ava';

import SweetLoader from '../../src/sweet-loader';
import { evalWithOutput } from '../assertions';

// SweetLoader unit tests

test('locate pulls out the phase from the path', t => {
  let l = new SweetLoader();

  let addr = l.locate({ name: '/foo/bar:0' });
  t.is(addr.path, '/foo/bar');
  t.is(addr.phase, 0);

  addr = l.locate({ name: '/foo/bar:0      ' });
  t.is(addr.path, '/foo/bar');
  t.is(addr.phase, 0);
});

test('locate throws an error if phase is missing', t => {
  let l = new SweetLoader();

  t.throws(() => l.locate({ name: '/foo/bar' }));
});

// High-level API

test(
  'nested syntax definitions',
  evalWithOutput,
  `
function f() {
  syntax n = ctx => #\`1\`;
  return n;
  if (true) {
    syntax o = ctx => #\`1\`;
    return o;
  }
}
syntax m = ctx => #\`1\`;
output = m;`,
  1,
);
