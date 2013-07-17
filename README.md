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
