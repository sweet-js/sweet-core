[![Build Status](https://travis-ci.org/mozilla/sweet.js.png)](https://travis-ci.org/mozilla/sweet.js)

# sweet.js

Hygienic Macros for JavaScript!

* Read a [tutorial](http://jlongster.com/Writing-Your-First-Sweet.js-Macro) on macros.
* Read the documentation at [sweetjs.org](http://sweetjs.org).
* Play with the [editor](http://sweetjs.org/browser/editor.html).
* Hang out on IRC #sweet.js at irc.mozilla.org.
* Try out other [macros](https://npmjs.org/browse/keyword/sweet-macros).

## Getting started

Install sweet.js with npm:

```sh
$ npm install -g sweet.js
```

And compile your sweet macro enhanced code:

```sh
$ sjs --output compiled.js my_sweet_code.js
```

## Sharing 

You can collect your macros into a single module file to share with your other code or on npm. Full details [here](https://github.com/mozilla/sweet.js/wiki/modules) but the basic idea is to define your macros in a file `macros.js` and use the `export` keyword:

```js
// macros.js
macro m { ... }
export m;
```

Then compile using the `--module` flag:

```sh
sjs --module /macros.js my_sweet_code.js
```

The `--module` also looks up along the `npm` path so you can install macro modules from `npm` (using [lambda-chop](https://github.com/natefaubion/lambda-chop) as an example):

```sh
npm install lambda-chop
sjs --module lambda-chop/macros my_sweet_code.js
```

If you want to share your macros on npm we recommend using the [sweet-macros](https://npmjs.org/browse/keyword/sweet-macros) keyword to make macros easy to find.

## Hacking

Install the dev dependencies:

```sh
$ npm install
```

Build and run the tests:

```sh
$ grunt
```

Sweet.js is self hosted so you hack on the files in `src/` using the version of sweet.js already built in `lib/`. When you are happy with your hacking, `grunt dist` will build a new version of sweet.js and put it into `lib/`.

Slightly confusing but the process goes like this:

```sh
<hack hack hack>
$ grunt
<tests fail!>
<hack hack hack>
$ grunt
<tests pass!>
$ grunt dist
$ git add lib/
$ git commit -m "sweet!"
```
    

## Credits

Built on top of [esprima](http://esprima.org/) and [escodegen](https://github.com/Constellation/escodegen). [Contributors](https://github.com/mozilla/sweet.js/graphs/contributors) are awesome!
