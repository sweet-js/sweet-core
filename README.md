[![Build Status](https://travis-ci.org/mozilla/sweet.js.png)](https://travis-ci.org/mozilla/sweet.js)

# sweet.js

Hygienic Macros for JavaScript!

* Read the documentation at [sweetjs.org](http://sweetjs.org).
* Play with the [editor](http://sweetjs.org/browser/editor.html)
* Hang out on IRC #sweet.js at irc.mozilla.org.

## Getting started

Install sweet.js with npm:

    $ npm install -g sweet.js

And compile your sweet macro enhanced code:

    $ sjs --output compiled.js my_sweet_code.js

## Hacking

Install the dev dependencies:

    $ npm install

Build and run the tests:

    $ grunt

Sweet.js is self hosted so you hack on the files in `src/` using the version of sweet.js already built in `lib/`. When you are happy with your hacking, `grunt dist` will build a new version of sweet.js and put it into `lib/`.

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
    

## Credits

Built on top of [esprima](http://esprima.org/) and [escodegen](https://github.com/Constellation/escodegen). [Contributors](https://github.com/mozilla/sweet.js/graphs/contributors) are awesome!