import { compileToCjs } from './_helpers';
import test from 'ava';

test(
  'exporting and importing a variable works',
  compileToCjs,
  {
    'mod.js': `
  'lang sweet.js';
  export var x = 'foo';
  `,

    'main.js': `
  'lang sweet.js';
  import { x } from './mod.js';
  console.log(x);
  `,
  },
  'foo',
);

test(
  'exporting and importing a name passing through macro expansion works',
  compileToCjs,
  {
    'mod.js': `
  'lang sweet.js';
  syntax m = ctx => {
    let first = ctx.next().value;
    let second = ctx.next().value;
    return #\`var \${first} = \${second}\`;
  }  
  export m x 'foo'
  `,

    'main.js': `
  'lang sweet.js';
  import { x } from './mod.js';
  console.log(x);
  `,
  },
  'foo',
);
