[![Build Status](https://travis-ci.org/mozilla/sweet.js.png)](https://travis-ci.org/mozilla/sweet.js)

Hygienic Macros for JavaScript!

Macros allow *you* to build the language of your dreams. Sweeten JavaScript by defining new syntax for your code.

# Getting started

Install sweet.js with npm:

```sh
$ npm install sweet.js
```

Write your sweet code:

```js
// my_sweet_code.js

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

# Learning More

* Read the [documentation](http://sweetjs.org/doc/book).
* Play with the [editor](http://sweetjs.org/browser/editor.html).
* Hang out on IRC #sweet.js at irc.mozilla.org.
* Try out other [macros](https://npmjs.org/browse/keyword/sweet-macros).
