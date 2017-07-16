import { evalWithStore } from '../assertions';
import test from 'ava';
import { readFileSync } from 'fs';

test(
  'should load a simple syntax transformer',
  evalWithStore,
  {
    './m.js': `
'lang sweet.js';
export syntax m = function (ctx) {
  return #\`1\`;
}`,

    'main.js': `
import { m } from "./m.js";
output = m`,
  },
  1,
);

test(
  'should export a simple operator',
  evalWithStore,
  {
    './m.js': `
'lang sweet.js';
export operator sub left 2 = (left, right) => {
  return #\`\${left} - \${right}\`;
}`,

    'main.js': `
import { sub } from "./m.js";
output = 2 sub 2`,
  },
  0,
);

test(
  'should export a simple punctuator operator',
  evalWithStore,
  {
    './m.js': `
'lang sweet.js';
export operator - left 2 = (left, right) => {
  return #\`\${left} + \${right}\`;
}`,

    'main.js': `
import { - } from "./m.js";
output = 2 - 2`,
  },
  4,
);

test(
  'importing for syntax with a single number exported',
  evalWithStore,
  {
    './num.js': `
'lang sweet.js';
export var n = 1;`,

    'main.js': `
import { n } from './num.js' for syntax;

syntax m = function (ctx) {
  if (n === 1) {
    return #\`true\`;
  }
  return #\`false\`;
}
output = m;`,
  },
  true,
);

test(
  'import for syntax; export var; function',
  evalWithStore,
  {
    './id.js': `
    'lang sweet.js';
    export var id = function (x) {
      return x;
    }
  `,
    'main.js': `
    import { id } from './id.js' for syntax;

    syntax m = ctx => {
      return id(#\`1\`);
    }
    output = m;
  `,
  },
  1,
);

test(
  'import for syntax; export declaration; function',
  evalWithStore,
  {
    './id.js': `
    'lang sweet.js';
    export function id(x) {
      return x;
    }
  `,
    'main.js': `
    import { id } from './id.js' for syntax;

    syntax m = ctx => {
      return id(#\`1\`);
    }
    output = m;
  `,
  },
  1,
);

test(
  'importing a macro for syntax',
  evalWithStore,
  {
    './id.js': `
    'lang sweet.js';
    export syntax m = function (ctx) {
      return #\`1\`;
    }
  `,
    'main.js': `
    import { m } from './id.js' for syntax;

    syntax m = ctx => {
      let x = m;
      return #\`1\`;
    }
    output = m;
  `,
  },
  1,
);

test(
  'importing a macro for syntax only binds what is named',
  evalWithStore,
  {
    './id.js': `
    'lang sweet.js';
    syntax n = ctx => #\`2\`;

    export syntax m = function (ctx) {
      return #\`1\`;
    }

  `,
    'main.js': `
    import { m } from './id.js' for syntax;

    syntax test = ctx => {
      if (typeof n !== 'undefined' && n === 2) {
        throw new Error('un-exported and un-imported syntax should not be bound');
      }
      return #\`1\`;
    }
    output = test;
  `,
  },
  1,
);

test(
  'exporting names for syntax',
  evalWithStore,
  {
    './mod.js': `
'lang sweet.js';
function id(x) { return x; }
export { id }
`,
    'main.js': `
import { id } from './mod.js' for syntax;
syntax m = ctx => {
  return id(#\`1\`);
}
output = m
`,
  },
  1,
);

test(
  'exporting names with renaming for syntax',
  evalWithStore,
  {
    './mod.js': `
'lang sweet.js';
function id(x) { return x; }
export { id as di }
`,
    'main.js': `
import { di } from './mod.js' for syntax;
syntax m = ctx => {
  return di(#\`1\`);
}
output = m
`,
  },
  1,
);

test(
  'exporting default names for syntax',
  evalWithStore,
  {
    './mod.js': `
'lang sweet.js';
export default function id(x) { return x; }
`,
    'main.js': `
import id from './mod.js' for syntax;
syntax m = ctx => {
  return id(#\`1\`);
}
output = m
`,
  },
  1,
);

test(
  'importing a namespace for syntax',
  evalWithStore,
  {
    './mod.js': `
'lang sweet.js';
export function id(x) { return x; }`,
    'main.js': `
import * as M from './mod.js' for syntax;
syntax m = ctx => {
  return M.id(#\`1\`);
}
output = m`,
  },
  1,
);

test(
  'importing a function through multiple modules for syntax',
  evalWithStore,
  {
    './a.js': `
'lang sweet.js';
export function f(x) { return x; }
  `,
    './mod.js': `
'lang sweet.js';
import { f } from './a.js';
export function id(x) { return f(x); }`,
    'main.js': `
import * as M from './mod.js' for syntax;
syntax m = ctx => {
  return M.id(#\`1\`);
}
output = m`,
  },
  1,
);

let helperSrc = readFileSync('./helpers.js', 'utf8');

test(
  'using helpers works',
  evalWithStore,
  {
    './helpers.js': helperSrc,
    'main.js': `
    import { isKeyword } from './helpers.js' for syntax;
    syntax m = ctx => {
      let n = ctx.next().value;
      if (isKeyword(n)) {
        return #\`true\`;
      }
      return #\`false\`;
    }
    output = m if
  `,
  },
  true,
);

test(
  'using helpers in a chain works',
  evalWithStore,
  {
    './helpers.js': helperSrc,
    a: `
      'lang sweet.js';
      import { isKeyword } from './helpers.js' for syntax;
      export syntax m = ctx => {
        let n = ctx.next().value;
        if (isKeyword(n)) {
          return #\`true\`;
        }
        return #\`false\`;
      }
    `,
    'main.js': `
      'lang sweet.js';
      import { m } from 'a';
      output = m foo;
    `,
  },
  false,
);

test(
  'only invokes a module once per-phase',
  evalWithStore,
  {
    lib: `
    'lang sweet.js';
    export const x = 1;
    `,

    m: `
    'lang sweet.js';
    import { x } from 'lib' for syntax;
    export syntax m = ctx => #\`1\`;`,

    'main.js': `
    'lang sweet.js';
    import { x } from 'lib' for syntax;
    import { m } from 'm';
    output = true`,
  },
  true,
);

// test('importing a chain for syntax works', evalWithStore, {
//   'b': `#lang 'sweet.js';
//     export function b(x) { return x; }
//   `,
//   'a': `#lang 'sweet.js';
//     import { b } from 'b' for syntax;
//
//     export function a() {
//       return b(1);
//     }
//   `,
//   'main.js': `#lang 'sweet.js';
//     import { a } from 'a' for syntax;
//     syntax m = ctx => {
//       if (a() !== 1) {
//         throw new Error('un expected something or rather');
//       }
//       return #\`1\`;
//     }
//     output = m
//   `
//   }, 1);
