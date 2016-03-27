---
layout: default
---

# Sweeten Your JavaScript

Sweet brings the hygienic macros of languages like Scheme and Rust to JavaScript. Macros allow you to sweeten the syntax of JavaScript and craft the language you've always wanted.

Macros allow *you* to build the language of your dreams. Sweeten JavaScript by defining new syntax for your code.

# Getting started

Install sweet.js with npm:

```
$ npm install sweet.js
```

Write your sweet code:

```
syntax hi = function (ctx) {
  return #`console.log('hello, world!')`;
}
hi
```

And compile:

```
$ node_modules/.bin/sjs my_sweet_code.js
console.log('hello, world!')
```

# Learning More

* Read the [tutorial](doc/1.0/tutorial.html).
* Read the [reference documentation](doc/1.0/reference.html).
* Play with the [editor](browser/editor.html).
* Hang out on IRC: #sweet.js at irc.mozilla.org.
