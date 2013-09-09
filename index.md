---
layout: default
---

Sweet.js brings the hygienic macros of languages like Scheme and Rust to
JavaScript. Macros allow you to sweeten the syntax of JavaScript and
craft the language you've always wanted.

Do you want to use class syntax but don't want to wait for ES6? Add
them yourself with just a few lines of code!

    // Define the class macro here...
    macro class {
      rule {
        $className {
            constructor $cparams $cbody

            $($mname $mparams $mbody) ...
        }
      } => {
        function $className $cparams $cbody

        $($className.prototype.$mname
          = function $mname $mparams $mbody; ) ...
      }
    }

    // An now classes are a part of JavaScript!
    class Person {
      constructor(name) {
        this.name = name;
      }

      say(msg) {
        console.log(this.name + " says: " + msg);
      }
    }
    var bob = new Person("Bob");
    bob.say("Macros are sweet!");

How about a better switch?

    macro _arms {
      rule { (default => $value:expr) } => {
        else {
          return $value;
        }
      }

      rule { (case $cond:expr => $value:expr) } => {
        if($cond) {
          return $value;
        }
      }

      rule { 
        ($(case $cond:expr => $value:expr) $rest ...)
      } => {
        _arms (case $cond => $value)
        _arms ($rest ...)
      }
    }

    macro cond {
      rule { { $arms ... } } => {
        (function() {
          _arms($arms ...)
        })();
      }
    }

    var x = [];
    var type = cond {
      case (x === null) => "null"
      case Array.isArray(x) => "array"
      case (typeof x === "object") => "object"
      default => typeof x
    }

To get a better sense of what macros can do, check out some
[example macros](https://github.com/mozilla/sweet.js/wiki/Example-macros)
or play around with macros in the [editor](browser/editor.html).

## Getting sweet.js

Install the sweet.js compiler via npm:

    $ npm install -g sweet.js

Use the `sjs` binary to compile your sweet.js code:


    $ sjs -o output.js my_sweet_code.js

* Report issues on
  [github](https://github.com/mozilla/sweet.js/issues).
* Discuss sweet.js on the
  [mailing list](https://groups.google.com/forum/#!forum/sweetjs) or
  the IRC channel #sweet.js on irc.mozilla.org.
* Ping [@disnet](https://twitter.com/disnet) on Twitter.


## Macro Rules

You can think of macros as functions that take little bits of syntax
and convert it to new bits of syntax at compile-time. To define macros
sweet.js provides a new `macro` keyword to JavaScript. It looks
something like this:

    macro <name> {
      rule { <patterns> } => { <body> }
      ...
    }

Macros work by matching a syntax pattern and producing a resulting
syntax body. 

    macro id {
      rule { ($x) } => { $x }
    }

This can be read as "define a macro named `id` that matches a single
token surrounded by parenthesis and when invoked returns just the
matched token".

    macro id {
      rule { ($x) } => { $x }
    }

    var x = id ("foo")
    x === "foo"   // true

A pattern name that begin with `$` in the left hand side of the macro
definition matches any token and binds it to that name in macro body
while everything else matches literally.

    macro m {
      rule { ($x becomes $y) } => {
        $x = $y;
      }
    }
    m (a becomes b)

A pattern name can be restricted to a particular parse class by using
`$name:class` in which case rather than matching only a single token
the pattern matches all the tokens matched by the parse class.

    macro m {
      rule { ($x:expr) } => {
        // ...
      }
    }
    m (2 + 5 * 10)

For instance:

    macro m {
      rule { ($x:expr) } => {
        $x
      }
    }
    m (2 + 5 * 10)

The commonly used parse classes that have short names are `expr` (matches an expression), `ident` (matches an identifier), and `lit` (matches a literal).

Repeated patterns can be matched with the `...` syntax.

    macro m {
      rule { ($x ...) } => {
        // ...
      }
    }
    m (1 2 3 4)

A repeated pattern with a separator between each item can be matched by adding `(,)` between `...` and the pattern being repeated.

    macro m {
      rule { ($x (,) ...) } => {
        [$x (,) ...]
      }
    }
    m (1, 2, 3, 4)

Repeated groups of patterns can be matched using `$()`.

    macro m {
      rule { ( $($id:ident = $val:expr) (,) ...) } => {
        $(var $id = $val;) ...
      }
    }
    m (x = 10, y = 2+10)

Macros can match on multiple cases.

    macro m {
      rule { ($x:lit) } => { $x }
      rule { ($x:lit, $y:lit) } => { [$x, $y] }
    }

    m (1);
    m (1, 2);


And macros can call themselves.

    macro m {
      rule { ($base) } => { [$base] }
      rule { ($head $tail ...) } => { [$head, m ($tail ...)] }
    }
    m (1 2 3 4 5)  // --> [1, [2, [3, [4, [5]]]]]


## Macro Cases

Sweet.js also provides a more powerful way to define macros: case
macros. Case macros allow you to write actual JavaScript code in a
macro definition. Case macros look like this:

    macro id {
      case {_ $x } => { return #{$x} }
    }

