[![Build Status](https://travis-ci.org/sweet-js/sweet.js.svg)](https://travis-ci.org/sweet-js/sweet.js)

[![Join the chat at https://gitter.im/mozilla/sweet.js](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mozilla/sweet.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Hygienic Macros for JavaScript!

Macros allow *you* to build the language of your dreams. Sweeten JavaScript by defining new syntax for your code.

Currently, Sweet should be considered experimental and under heavy development ([re-development](https://medium.com/@disnet/announcing-sweet-js-1-0-e7f4f3e15594#.fo9kyqu48) more like). As such, the API will be undergoing a bit of churn until probably the end of the year. So, probably best not to try Sweet in production systems just yet. If you're interested in helping out though we'd love to have you!

# Getting started

Install the command line app with npm:

```sh
$ npm install -g @sweet-js/cli
```

Write your sweet code:

```js
syntax hi = function (ctx) {
  return #`console.log('hello, world!')`;
}
hi
```

And compile:

```sh
$ sjs my_sweet_code.js
console.log('hello, world!')
```

# Learning More

* Read the [tutorial](http://sweetjs.org/doc/1.0/tutorial.html).
* Read the [reference documentation](http://sweetjs.org/doc/1.0/reference.html).
* Play with the [editor](http://sweetjs.org/browser/editor.html).
* Discuss on [Google Groups](https://groups.google.com/forum/#!forum/sweetjs).
* Hang out on IRC: #sweet.js at irc.mozilla.org and on [Gitter](https://gitter.im/sweet-js/sweet.js).
