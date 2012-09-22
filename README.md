sweet.js
========

Hygienic Macros for JavaScript! 

Overview and motivation in this [talk](https://air.mozilla.org/sweetjs/).

Early stage at the moment. Lots of bugs so be warned!

## Use

Clone sweet.js and then install its dependencies:

    $ npm install underscore optimist escodegen

To try it out make a file `test_macros.js`:

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

And compile it with `sjs`:
  
    $ bin/sjs -o output.js test_macros.js
    $ node output.js
    10

Docs to come. At the moment the best documentation for what works is the [pattern](https://github.com/mozilla/sweet.js/blob/master/test/test_macro_patterns.js) and [hygiene](https://github.com/mozilla/sweet.js/blob/master/test/test_macro_hygiene.js) tests.


## Hacking

Install dev dependencies:

    $ npm install expect.js
    $ npm install -g shelljs mocha

And build with shelljs:

    $ shjs build
