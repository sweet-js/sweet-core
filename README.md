sweet.js
========

Hygienic Macros for JavaScript!

Documentation at [sweetjs.org](http://sweetjs.org).

Overview and motivation in this [talk](https://air.mozilla.org/sweetjs/).

Early stage at the moment. Lots of bugs so be warned!

## Use

Clone sweet.js and then install its dependencies:

    $ npm install underscore optimist escodegen

To try it out make a file `test_macros.js`:

```js
// functions can now be spelled def!
macro def {
  case $name:ident $params $body => {
    function $name $params $body
  }
}
def add (a, b) {
  return a + b;
}

console.log( add(3, 7) );
```

And compile it with `sjs`:
  
    $ bin/sjs -o output.js test_macros.js
    $ node output.js
    10


## Hacking

Install dev dependencies:

    $ npm install expect.js
    $ npm install -g shelljs mocha

And build with shelljs:

    $ shjs build
