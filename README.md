[![Build Status](https://travis-ci.org/mozilla/sweet.js.png)](https://travis-ci.org/mozilla/sweet.js)

Hygienic Macros for JavaScript!

* Read a [tutorial](http://jlongster.com/Writing-Your-First-Sweet.js-Macro) on macros.
* Read the documentation at [sweetjs.org](http://sweetjs.org).
* Play with the [editor](http://sweetjs.org/browser/editor.html).
* Hang out on IRC #sweet.js at irc.mozilla.org.
* Try out other [macros](https://npmjs.org/browse/keyword/sweet-macros).

# Getting started

Install sweet.js with npm:

```sh
$ npm install sweet.js
```

Write your sweet code:

```js
// my_sweet_code.js
import { # } from 'sweet.js';

syntax inc = function (ctx) {
  let x = ctx.next().value;
  return #`${x} + 1`;
}
inc 100
```

And compile:

```sh
$ node_modules/.bin/sjs my_sweet_code.js
100 + 1;
```

# Tutorial

```js
syntax def = function(ctx) {
  let id = ctx.next().value;
  let parens = ctx.next().value;
  let body = ctx.next().value;

  let parenCtx = ctx.of(parens);
  let paren_id = parenCtx.next().value;
  parenCtx.next() // =
  let paren_init = parenCtx.next('expr').value;

  let bodyCtx = ctx.of(body);
  let b = [];
  // contexts are iterables!
  for (let s of bodyCtx) {
    b.push(s);
  }

  return #`function ${id} (${paren_id}) {
    ${paren_id} = ${paren_id} || ${paren_init};
    ${b}
  }`;

}


def foo (x = 10 + 100) { return x; };
foo();
```
