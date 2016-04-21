[![Build Status](https://travis-ci.org/mozilla/sweet.js.png)](https://travis-ci.org/mozilla/sweet.js)

[![Join the chat at https://gitter.im/mozilla/sweet.js](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mozilla/sweet.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Hygienic Macros for JavaScript!

Macros allow *you* to build the language of your dreams. Sweeten JavaScript by defining new syntax for your code.

Sweet just got a shiny new 1.0 release. Some context about the changes is provided in this [post](https://medium.com/@disnet/announcing-sweet-js-1-0-e7f4f3e15594#.fo9kyqu48)

# Getting started

Install sweet.js with npm:

```sh
$ npm install sweet.js
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
$ node_modules/.bin/sjs my_sweet_code.js
console.log('hello, world!')
```

# Learning More

* Read the [tutorial](http://sweetjs.org/doc/1.0/tutorial.html).
* Read the [reference documentation](http://sweetjs.org/doc/1.0/reference.html).
* Play with the [editor](http://sweetjs.org/browser/editor.html).
* Discuss on [Google Groups](https://groups.google.com/forum/#!forum/sweetjs).
* Hang out on IRC: #sweet.js at irc.mozilla.org.
