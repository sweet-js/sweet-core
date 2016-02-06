# Getting Started

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

And then compile your code with the `sjs` command line tool:

```sh
$ node_modules/.bin/sjs my_sweet_code.js
100 + 1;
```
