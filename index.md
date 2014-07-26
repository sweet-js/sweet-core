---
layout: default
---

# Sweeten Your JavaScript

Sweet.js brings the hygienic macros of languages like Scheme and Rust to
JavaScript. Macros allow you to sweeten the syntax of JavaScript and
craft the language you've always wanted.


Do you want to use class syntax but don't want to wait for ES6? Add
them yourself with just a couple lines of code!

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

    // And now classes are in JavaScript!
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

To get a better sense of what macros can do, check out some
[example macros](https://github.com/mozilla/sweet.js/wiki/Example-macros)
or play around with macros in the online [editor](browser/editor.html).

# Getting sweet.js

Install the sweet.js compiler via npm:

    $ npm install -g sweet.js

Use the `sjs` binary to compile your sweet.js code:


    $ sjs -o output.js my_sweet_code.js

* Write macros in the online [editor](browser/editor.html)
* Report issues on
  [github](https://github.com/mozilla/sweet.js/issues).
* Ask for help at #sweet.js on irc.mozilla.org.
* Join the [mailing list](https://groups.google.com/forum/#!forum/sweetjs).
* Ping [@disnet](https://twitter.com/disnet) on Twitter.

# Getting Started 

You can think of macros as functions that work on syntax. Much like
a normal function you write a macro *definition* and then later
*invoke* the macro with a syntax argument to produce new syntax.
Running sweet.js code through the compiler will *expand* all macros
and produce pure JavaScript that can be run in any JS environment.

Sweet.js provides two ways to define a macro: the simpler
pattern-based *rule* macros and the more powerful procedural *case*
macros (if you are familiar with Scheme or Racket these correspond to
`syntax-rules` and `syntax-case`). 

## Pattern-Based Macros -- Macros Rule!

Rule macros work by matching a syntax *pattern* and generating new
syntax based on a *template*.

To define a macro sweet.js provides a new `macro` keyword that looks
something like this:

    macro <name> {
      rule { <pattern> } => { <template> }
    }

For example, here's a really simple identity macro that just expands
to its syntax argument:

    macro id {
      rule {
        // after the macro name, match:
        // (1) a open paren 
        // (2) a single token and bind it to `$x`
        // (3) a close paren
        ($x)
      } => {
        // just return the token that is bound to `$x`
        $x
      }
    }

We can then invoke `id` with:

    id (42)
    // --> expands to
    42

A pattern that begins with `$` matches any token and binds it to that
name in the template while everything else matches literally.

Note that a single token includes matched delimiters not just numbers
and identifiers. For example, an array with all of its elements counts
as one token:

    id ([1, 2, 3])
    // --> expands to
    [1, 2, 3]

### Hygiene -- Keeping it clean

To make things slightly more interesting, let's say we want to write a
macro that swaps the values stored in two variables.

    macro swap {
      rule { {$a <=> $b} } => {
        var tmp = $a;
        $a = $b;
        $b = tmp;
      }
    }

    var a = 10;
    var b = 20;

    swap {a <=> b}

After running this through sweet.js we get the expanded code:

    var a$1 = 10;
    var b$2 = 20;

    var tmp$3 = a$1;
    a$1 = b$2;
    b$2 = tmp$3;

As you can see, the variables names have been changed with a `$n`
postfix. This is hygiene at work. One of the critical features of
sweet.js is protecting macros from unintentionally binding or
capturing variables they weren't supposed to. This is called hygiene
and to enforce hygiene sweet.js must carefully rename all variables.

If sweet.js did not protect hygiene a naive expansion would do the
wrong thing:

    var tmp = 10;
    var b = 20;

    swap {tmp <=> b}

    // --> naive expansion
    var tmp = 10;
    var b = 20;
    
    var tmp = tmp;
    tmp = b;
    b = tmp;

But since sweet.js protects hygiene, all variable names are correctly
renamed:

    var tmp = 10;
    var b = 20;

    swap {tmp <=> b}

    // --> hygienic expansion
    var tmp$1 = 10;
    var b$2 = 20;
    
    var tmp$3 = tmp$1;
    tmp$3 = b$2;
    b$2 = tmp$1;

In the cases where you want to intentionally break hygiene you can use
the procedural case macros described in the next section.

### Patterns and Macros - A match made in heaven

A pattern name can be restricted to a particular parse class by using
`$name:class` in which case rather than matching a token
the pattern matches all the tokens matched by the class.

    macro m {
      rule { ($x:expr) } => {
        $x
      }
    }
    m (2 + 5 * 10)
    // --> expands to
    2 + 5 * 10

The parse classes currently supported are:
* `expr` -- matches an expression
* `ident` -- matches an identifier
* `lit` -- matches a literal

Repeated patterns can be matched with the `...` syntax.

    macro m {
      rule { ($x ...) } => {
        // ...
      }
    }
    m (1 2 3 4)

A repeated pattern with a separator between each item can be matched
by adding `(,)` between `...` and the pattern being repeated.

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

Macros can have multiple rules.

    macro m {
      rule { ($x:lit) } => { $x }
      rule { ($x:lit, $y:lit) } => { [$x, $y] }
    }

    m (1);
    m (1, 2);

Rules are matched in-order and the first one to match the pattern will
be used.

And macros can be recursively defined:

    macro m {
      rule { ($base) } => { [$base] }
      rule { ($head $tail ...) } => { [$head, m ($tail ...)] }
    }
    m (1 2 3 4 5)  // --> [1, [2, [3, [4, [5]]]]]


## Procedural Macros -- Just in Case

Sweet.js also provides a more powerful way to define macros: case
macros. Case macros allow you to manipulate syntax using the full
power of JavaScript. Case macros look like this:

    macro <name> {
      case { <pattern> } => { <body> }
    }

Case macros look similar to rule macros with a few important
differences. First, the patterns also match the macro name instead of
just the syntax that comes after it:

    macro m {
      case { $name $x } => { ... }
    }
    m 42  // `$name` will be bound to the `m` token
          // in the macro body

Most of the time you won't need to match the name and can use the
wildcard `_` pattern (which matches any token but doesn't bind it to a
name) to ignore it:

    macro m {
      case { _ $x } => { ... }
    }

The other difference from rule macros is that the body of a macro 
contains a mixture of templates and normal JavaScript that can create
and manipulate syntax. For example, here's the identity macro defined
with a case macro:

    macro id {
      case {_ $x } => {
        return #{ $x }
      }
    }

Templates are now created with the `#{...}` form (which is technically
shorthand for `syntax {...}`). The `#{...}` form creates an array of
*syntax objects* using any pattern bindings that are in scope (i.e.
were matched by the pattern).

*Syntax objects* are the representation of tokens that sweet.js uses
to keep track of lexical context (which is used to maintain hygiene).
They can be created with templates (`#{}`) but you can also create
individual syntax objects using the lexical context of an existing
syntax object:

    macro m {
      case {_ $x } => {
        var y = makeValue(42, #{$x});
        return [y]
      }
    }
    m foo
    // --> expands to
    42

Sweet.js provides the following functions to create syntax objects:

* `makeValue(val, stx)` -- `val` can be a `boolean`, `number`,
  `string`, or `null`/`undefined`
* `makeRegex(pattern, flags, stx)` -- `pattern` is the string
  representaiton of the regex pattern and `flags` is the string
  representation of the regex flags
* `makeIdent(val, stx)` -- `val` is a string representing an
  identifier
* `makePunc(val, stx)` -- `val` is a string representing a punctuation
  (e.g. `=`, `,`, `>`, etc.)
* `makeDelim(val, inner, stx)` -- `val` represents which
  delimiter to make and can be either `"()"`, `"[]"`, or `"{}"` and
  `inner` is an array of syntax objects for all of the tokens inside
  the delimiter.

(These functions broadly correspond to the Scheme/Racket function `datum->syntax`)

If you want strip a syntax object of its lexical context and get
directly at the token you can use `unwrapSyntax(stx)` (corresponding
to Scheme's `syntax-e`). 

When using these functions to create new syntax objects it is
convenient to refer to them in `#{}` templates. To do this sweet.js
provides the `letstx` macro that binds syntax objects to pattern
variables:

    macro m {
      case {_ $x } => {
        var y = makeValue(42, #{$x});
        letstx $y = [y], $z = [makeValue(2, #{$x})];
        return #{$x + $y - $z}
      }
    }
    m 1
    // --> expands to
    1 + 42 - 2


### Getting Dirty -- Breaking Hygiene

Sometimes you really do need to break the wonderful protections
provided by hygiene. Breaking hygiene is usually a bad idea but
sweet.js won't judge.

Breaking hygiene is done by stealing the lexical context from syntax
objects in the "right place". To clarify, consider `aif` the
[anaphoric](http://en.wikipedia.org/wiki/Anaphoric_macro) if macro
that binds its condition to the identifier `it` in the body.

    var it = "foo";
    long.obj.path = [1, 2, 3];
    aif (long.obj.path) {
	  console.log(it);
    }
    // logs: [1, 2, 3]

This is a violation of hygiene because normally `it` should be bound
to the surrounding environment (`"foo"` in the example above) but
`aif` wants to capture `it`. To do this we can create an `it` binding in
the macro that has the lexical context associated with the surrounding
environment. The lexical context we want is actually found on the
`aif` macro name itself. So we just need to create a
new `it` binding using the lexical context of `aif`:

    macro aif {
  	  case {
        // bind the macro name to `$aif_name`
        $aif_name 
        ($cond ...) {$body ...}
      } => {
        // make a new `it` identifier using the lexical context
        // from `$aif_name`
		var it = makeIdent("it", #{$aif_name});
		letstx $it = [it];
	  return #{ 
          // create an IIFE that binds `$cond` to `$it`
          (function ($it) {
      		  if ($cond ...) {
              // all `it` identifiers in `$body` will now
              // be bound to `$it` 
              $body ...
            }
          })($cond ...);
    	  }
  	  }
    }

## Let it be...less recursive

Sometimes you don't want a macro to recursively call
itself. For example, say you want to override `function` to add some
logging information before the rest of the function executes:

    macro function {
      case {_ $name ($params ...) { $body ...} } => {
        return #{
          function $name ($params ...) {
            console.log("Imma let you finish...");
            $body ...
          }
        }
      }
    }

If you tried to run this through the compiler it will loop forever
since the `function` identifier in the macro expansion is bound to the
`function` macro. To prevent this you can use the `let` macro binding
form:

    let function = macro {
      case {_ $name ($params ...) { $body ...} } => {
        return #{
          function $name ($params ...) {
            console.log("Imma let you finish...");
            $body ...
          }
        }
      }
    }

This binds `function` to the macro in the rest of the code but not in
the body of the `function` macro. 

## Macros with Lookbehind -- Watch Your Back

Sweet.js also lets you match on previous syntax using `infix` rules. Use a
vertical bar (`|`) to separate your left-hand-side from your right-hand-side.

    macro unless {
      rule infix { return $value:expr | $guard:expr } => {
        if (!($guard)) {
          return $value;
        }
      }
    }

    function foo(x) {
      return true unless x > 42;
      return false;
    }

You can use the `infix` keyword with procedural macros, too. The macro name is
just the first token on the right-hand-side.

    macro m {
      case infix { $lhs | $name $rhs } => { ... }
    }

Infix rules can be mixed and matched with normal rules:

    macro m {
      rule infix { $lhs | $rhs } => { ... }
      rule { $rhs } => { ... }
    }

You can even leave off the right-hand-side for a postfix macro:

    macro m {
      rule infix { $lhs | } => { ... }
    }

Sweet.js does its best to keep you from clobbering previous syntax.
  
    macro m {
      rule infix { ($args ...) | $call:expr } => {
        $call($args ...)
      }
    }

    (42) m foo; // This works
    bar(42) m foo; // This is a match error

The second example fails to match because you'd be splitting the good function
call on the left-hand-side in half. The result would have been nonsense, giving
you a nasty parse error.
