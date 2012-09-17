sweet.js
========

Macros for JavaScript!

Early stage at the moment. Lots of bugs so be warned!

## Use

Clone sweet.js and then install its dependencies:

    $ npm install underscore optimist escodegen

To try it out make a file `test_macros.js`:

    macro id {
      case ($x:expr) => {
        $x
      }
    }

    console.log( id(2+2*4) );

And compile it with `sjs`:
  
    $ bin/sjs -o output.js test_macros.js
    $ node output.js
    10


## Hacking

Install dev dependencies:

    $ npm install expect.js mocha shelljs

And build with shelljs:

    $ shjs build