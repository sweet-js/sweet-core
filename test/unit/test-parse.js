import test from 'ava';

import { items, testParseComparison } from '../assertions';

test(
  'CallExpression followed by identifier',
  testParseComparison,
  items,
  `
x
foo.bar(1,2)
x`,
  `
x;
foo.bar(1,2);
x;`,
);

test(
  'NewExpression followed by identifier',
  testParseComparison,
  items,
  `
x
new Foo(1,2)
x`,
  `
x;
new Foo(1,2);
x;`,
);
