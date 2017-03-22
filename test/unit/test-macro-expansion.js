import test from 'ava';

import { evalWithOutput, evalThrows } from '../assertions';

test(
  'should handle basic expansion at a statement expression position',
  evalWithOutput,
  `
syntaxrec m = function(ctx) {
  return #\`200\`;
}
output = m`,
  200,
);

test(
  'should handle basic expansion with an arrow transformer',
  evalWithOutput,
  `
syntaxrec m = ctx => #\`200\`
output = m`,
  200,
);

test(
  'should handle basic expansion at an expression position',
  evalWithOutput,
  `
syntaxrec m = function (ctx) {
  return #\`200\`;
}
let v = m;
output = v;`,
  200,
);

test(
  'should handle expansion where an argument is eaten',
  evalWithOutput,
  `
syntaxrec m = function(ctx) {
  ctx.next();
  return #\`200\`
}
output = m 42`,
  200,
);

test(
  'should handle expansion that eats an expression',
  evalWithOutput,
  `
syntaxrec m = function(ctx) {
  let term = ctx.expand('expr')
  return #\`200\`
}
output = m 100 + 200`,
  200,
);

test(
  'should handle expansion that takes an argument',
  evalWithOutput,
  `
syntaxrec m = function(ctx) {
  var x = ctx.next().value;
  return #\`40 + \${x}\`;
}
output = m 2;`,
  42,
);

test(
  'should handle expansion that matches an expression argument',
  evalWithOutput,
  `
syntaxrec m = function(ctx) {
  let x = ctx.expand('expr').value;
  return #\`40 + \${x}\`;
}
output = m 2;`,
  42,
);

test(
  'should handle the macro returning an array',
  evalWithOutput,
  `
syntax m = function (ctx) {
  let x = ctx.next().value;
  return [x];
}
output = m 42;`,
  42,
);

test(
  'should handle the full macro context api',
  evalWithOutput,
  `
syntaxrec def = function(ctx) {
  let id = ctx.next().value;
  ctx.reset();
  id = ctx.next().value;

  const paramsMark = ctx.mark();
  let parens = ctx.next().value;
  ctx.reset(paramsMark);
  parens = ctx.next().value;
  let body = ctx.next().value;

  let parenCtx = ctx.contextify(parens);
  let paren_id = parenCtx.next().value;
  parenCtx.next() // =
  let paren_init = parenCtx.expand('expr').value;

  let bodyCtx = ctx.contextify(body);
  let b = [];
  for (let s of bodyCtx) {
    b.push(s);
  }

  return #\`function \${id} (\${paren_id}) {
    \${paren_id} = \${paren_id} || \${paren_init};
    \${b}
  }\`;
}

def foo (x = 10 + 100) { return x; }
output = foo();
`,
  110,
);

test(
  'should handle iterators inside a syntax template',
  evalWithOutput,
  `
syntax let = function (ctx) {
  let ident = ctx.next().value;
  ctx.next();
  let init = ctx.expand('expr').value;
  return #\`
    (function (\${ident}) {
      \${ctx}
    }(\${init}))
  \`
}
let x = 42;
output = x;
`,
  42,
);

test(
  'should allow macros to be defined with @',
  evalWithOutput,
  `
syntax @ = function (ctx) {
  return #\`42\`;
}
output = @
`,
  42,
);

test(
  'should allow macros to be defined with #',
  evalWithOutput,
  `
syntax # = function (ctx) {
  return #\`42\`;
}
output = #
`,
  42,
);

test(
  'should allow macros to be defined with *',
  evalWithOutput,
  `
syntax * = function (ctx) {
  return #\`42\`;
}
output = *
`,
  42,
);

test(
  'should allow the macro context to be reset',
  evalWithOutput,
  `
syntax m = ctx => {
  ctx.expand('expr'); // 42 + 66
  // oops, just wanted one token
  ctx.reset();
  let value = ctx.next().value; // 42
  ctx.next();
  ctx.next();
  return #\`\${value}\`;
}

output = m 42 + 66
`,
  42,
);

test(
  'should allow the macro context to create a reset point',
  evalWithOutput,
  `
syntax m = ctx => {
  ctx.next(); // 30
  ctx.next(); // +
  // lets play it safe
  const marker42 = ctx.mark();
  ctx.expand('expr'); // 42 + 66
  // oops, just wanted one token
  ctx.reset(marker42);
  let value = ctx.next().value; // 42
  ctx.next();
  ctx.next();
  return #\`\${value}\`;
}

output = m 30 + 42 + 66
`,
  42,
);

test(
  'should throw if marker is from a different macro context',
  evalThrows,
  `
syntax m = ctx => {
  const result = ctx.next().value; // 1
  const marker = ctx.mark();
  ctx.next() // ,
  const innerCtx = ctx.next().value.inner();
  innerCtx.reset(marker);
  return #\`\${result}\`;
}
output = m 1, [1];`,
);

test(
  'should allow the macro context to match on a identifier expression',
  evalWithOutput,
  `
syntax m = ctx => {
  let expr = ctx.expand('IdentifierExpression').value;
  return #\`\${expr}\`;
}
var foo = 1;
output = m foo
`,
  1,
);

test(
  evalWithOutput,
  `
syntax m = ctx => {
  let expr = ctx.expand('IdentifierExpression').value;
  return #\`1\`;
}
var foo = 1;
output = m foo + 1
`,
  2,
);

test(
  'should allow the macro context to match on a binary expression',
  evalWithOutput,
  `
syntax m = ctx => {
  let expr = ctx.expand('BinaryExpression').value;
  return #\`\${expr}\`;
}
output = m 1 + 1 - 1
`,
  1,
);

test(
  'should throw an error if the match fails for MacroContext::expand',
  evalThrows,
  `
syntax m = ctx => {
  let expr = ctx.expand('BinaryExpression').value;
  return #\`\${expr}\`;
}
output = m foo`,
);

test(
  'should construct syntax from existing syntax',
  evalWithOutput,
  `
syntax m = ctx => {
  let arg = ctx.next().value;
  let dummy = #\`here\`.get(0);
  return #\`\${dummy.fromString(arg.value.val())}\`
}
output = m foo
`,
  'foo',
);

test(
  'should construct a delimiter from existing syntax',
  evalWithOutput,
  `
syntax m = ctx => {
  let arg = ctx.next().value;
  let dummy = #\`here\`.get(0);
  return #\`(\${dummy.fromNumber(arg.value.val())})\`;
}
output = m 1`,
  1,
);

test(
  'should handle macros in blocks',
  evalWithOutput,
  `
{
  syntax m = ctx => #\`1\`;
  output = m
}
`,
  1,
);

test(
  'should construct syntax from arguments',
  evalWithOutput,
  `
syntax m = ctx => {
  let arg = ctx.next().value;
  let stx = arg.fromNumber(1);
  return #\`\${stx}\`;
}
output = m 1`,
  1,
);

test(
  'should construct delimiters',
  evalWithOutput,
  `
syntax m = ctx => {
  let dummy = #\`dummy\`.get(0);
  let expr = #\`5 * 5\`;
  return #\`1 + \${dummy.fromParens(expr)}\`;
}
output = m
`,
  26,
);

test(
  'should allow binding macros to import keyword',
  evalWithOutput,
  `
syntax import = ctx => {
  return #\`1\`;
}
output = import
`,
  1,
);

test(
  'should allow binding macros to export keyword',
  evalWithOutput,
  `
syntax export = ctx => {
  return #\`1\`;
}
output = export
`,
  1,
);

test(
  'should allow binding macros to super keyword',
  evalWithOutput,
  `
syntax super = ctx => {
  return #\`Number(1)\`;
}
output = new super instanceof Number
`,
  true,
);
