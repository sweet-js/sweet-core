sweet.js
========

Hygienic Macros for JavaScript!

* Documentation at [sweetjs.org](http://sweetjs.org). 
* Overview and motivation in this [talk](https://air.mozilla.org/sweetjs/).
* Example macros on the [wiki](https://github.com/mozilla/sweet.js/wiki/Example-macros). 
* [Mailing list](https://groups.google.com/forum/#!forum/sweetjs) for discussion
* IRC channel #sweet.js on irc.mozilla.org

## Use

### Using Node

Install with npm:

    $ npm install -g sweet.js

To try it out make a file `test_macros.sjs`:

```js
// functions can now be spelled def!
macro def {
  rule { $name $params $body } => {
    function $name $params $body
  }
}
def add (a, b) {
  return a + b;
}

console.log( add(3, 7) );
```

And compile it with `sjs`:

    $ sjs -o output.js test_macros.sjs
    $ node output.js
    10

Alternately you can require an sjs file from node. For example, in `main.js` add:

    var sjs = require('sweet.js'),
        example = require('./example');
    
    example.one;

Where ./example.sjs contains:

    macro A {
        case ($a + $b) => {
	        $a
	    }
    }

    exports.one = A(1 + 2);

And just run `main.js` in node.

### Using AMD in the browser

An AMD loader is provided at [require-sweet](https://github.com/iammerrick/require-sweet).

    define(['sweeten!a/javascript/dep-with-macros'], function(dep) {
      // dep is compiled to JS at this point.
    });

## Hacking

Install the dev dependencies:

    $ npm install

Build and run the tests:

    $ node build
    
Sweet.js is self hosted so the files in `src/` are compiled with the files in `lib/` and then copied into `build/lib/`. Then the tests in `test/` are compiled with `build/lib/`. Once you are happy with your changes run `node build build_sweetjs` to compile sweet.js into `lib/` which can then be checked into git.

Slightly confusing but the process goes like this:

    <hack hack hack>
    $ node build
    <tests fail!>
    <hack hack hack>
    $ node build
    <tests pass!>
    $ node build build_sweetjs
    $ git add lib/
    $ git commit -m "sweet!"
    
