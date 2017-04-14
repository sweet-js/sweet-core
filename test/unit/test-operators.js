import { evalWithOutput } from '../assertions';
import test from 'ava';

test(
  'should handle basic prefix custom operators',
  evalWithOutput,
  `
operator neg prefix 1 = (right) => {
  return #\`-\${right}\`;
}
output = neg 1`,
  -1,
);

test(
  'should handle basic postfix custom operators',
  evalWithOutput,
  `
operator neg postfix 1 = (left) => {
  return #\`-\${left}\`;
}
output = 1 neg`,
  -1,
);

test(
  'should not recursively define the unary operator',
  evalWithOutput,
  `
operator - prefix 1 = (right) => {
  return #\`-\${right}\`;
}
output = - 1`,
  -1,
);

test(
  'should handle basic binary custom operators',
  evalWithOutput,
  `
operator add left 1 = (left, right) => {
  return #\`\${left} + \${right}\`;
}
output = 1 add 1`,
  2,
);

test(
  'should handle basic binary custom operator precedence following existing operators',
  evalWithOutput,
  `
operator add left 1 = (left, right) => {
  return #\`\${left} + \${right}\`;
}
operator mul left 2 = (left, right) => {
  return #\`\${left} * \${right}\`;
}
output = 1 add 2 mul 3`,
  7,
);

test(
  'should handle basic binary custom operator precedence subverting existing operators',
  evalWithOutput,
  `
operator add left 2 = (left, right) => {
  return #\`\${left} + \${right}\`;
}
operator mul left 1 = (left, right) => {
  return #\`\${left} * \${right}\`;
}
output = 1 add 2 mul 3`,
  9,
);

test(
  'should handle a contrived slightly complex example of binary custom operators',
  evalWithOutput,
  `
operator >>= left 3 = (left, right) => {
  return #\`\${left}.chain(\${right})\`;
}
class IdMonad {
  constructor(value) {
    this.value = value;
  }
  chain(f) {
    return f(this.value);
  }
}

function Id(value) {
  return new IdMonad(value);
}

let result = Id(1) >>= v => Id(v + 1)
                   >>= v => Id(v * 10);
output = result.value;
  `,
  20,
);

test(
  'should not recursively define the binary operator',
  evalWithOutput,
  `
operator + left 2 = (left, right) => {
  return #\`\${left} + \${right}\`;
}
output = 1 + 2`,
  3,
);

test(
  'should handle converting a postfix to a binary',
  evalWithOutput,
  `
operator ++ left 1 = (left, right) => #\`\${left} + \${right}\`
output = 1 ++ 2;`,
  3,
);

test(
  'should handle converting a prefix to a binary',
  evalWithOutput,
  `
operator ~ left 1 = (left, right) => #\`\${left} + \${right}\`
output = 1 ~ 2;`,
  3,
);
