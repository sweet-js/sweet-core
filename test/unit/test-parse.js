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

test(
  'NewExpression followed by identifier',
  testParseComparison,
  items,
  `
syntax m = ctx => #\`1\`
m
`,
  `1;`,
);

test(
  'Expand to nothing inside an array',
  testParseComparison,
  items,
  `
syntax m = ctx => ctx;
[[m], [m, 1], [1, m], [1, m, 2]];
`,
  '[[], [, 1], [1], [1,, 2]]',
);
