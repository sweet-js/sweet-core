sweet.js
========

Hygienic Macros for JavaScript!

* Documentation at [sweetjs.org](http://sweetjs.org).
* Online [editor](http://sweetjs.org/browser/editor.html)
* Overview and motivation in this [talk](https://air.mozilla.org/sweetjs/).
* Example macros on the [wiki](https://github.com/mozilla/sweet.js/wiki/Example-macros). 
* [Mailing list](https://groups.google.com/forum/#!forum/sweetjs) for discussion
* IRC channel #sweet.js on irc.mozilla.org

## Use

### Using Node

Install with npm:

    $ npm install -g sweet.js

To try it out make a file `test_macros.js`:

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

    $ sjs -o output.js test_macros.js
    $ node output.js
    10

If you want to collect your macro definitions into a separate file you can use the `-m` flag:

    $ sjs -m macros.js -o output.js main.js 

Where the macros defined in `macros.js` that you want to be available in `main.js` are exported with the keyword `export`:

```javascript
// macros.js

macro m { /* ... */ }
export m;
```

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

    $ grunt
    
Sweet.js is self hosted so the files in `src/` are compiled with the files in `lib/` and then copied into `build/lib/`. Then the tests in `test/` are compiled with `build/lib/`. Once you are happy with your changes run `grunt dist` to compile sweet.js into `lib/` which can then be checked into git.

Slightly confusing but the process goes like this:

    <hack hack hack>
    $ grunt
    <tests fail!>
    <hack hack hack>
    $ grunt
    <tests pass!>
    $ grunt dist
    $ git add lib/
    $ git commit -m "sweet!"
    
