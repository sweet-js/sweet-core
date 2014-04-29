% Sweet.js Documentation
%

# Introduction

Install the sweet.js compiler via npm:

```language-bash
npm install -g sweet.js
```

This installs the `sjs` binary which is used to compile sweet.js code:

```language-bash
sjs --output out.js my_sweet_code.js
```

# Rule Macros

You can think of macros as functions that work on syntax. Much like
a normal function you write a macro *definition* and then later
*invoke* the macro with a syntax argument to produce new syntax.
Running sweet.js code through the compiler will *expand* all macros
and produce pure JavaScript that can be run in any JS environment.

Sweet.js provides two ways to define a macro: the simpler
pattern-based *rule* macros and the more powerful procedural *case*
macros (if you are familiar with Scheme or Racket these correspond to
`syntax-rules` and `syntax-case`). 

Rule macros work by matching a syntax *pattern* and generating new
syntax based on a *template*.

To define a macro sweet.js provides a new `macro` keyword that looks
something like this:

```js
macro <name> {
  rule { <pattern> } => { <template> }
}
```

For example, here's a really simple identity macro that just expands
to its syntax argument:

```js
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
```

We can then invoke `id` with:

```js
id (42)
// expands to:
// 42
```

A pattern that begins with `$` matches any token and binds it to that
name in the template while everything else matches literally.

Note that a single token includes matched delimiters not just numbers
and identifiers. For example, an array with all of its elements counts
as one token:

```js
id ([1, 2, 3])
// expands to:
// [1, 2, 3]
```

Macros can have multiple rules.

```js
macro m {
  rule { ($x) } => { $x }
  rule { ($x, $y) } => { [$x, $y] }
}

m (1);
m (1, 2);
```

Rules are matched in-order and the first one to match the pattern will
be used.

And macros can be recursively defined:

```js
macro m {
  rule { ($base) } => { [$base] }
  rule { ($head $tail ...) } => { [$head, m ($tail ...)] }
}
m (1 2 3 4 5)  // --> [1, [2, [3, [4, [5]]]]]
```

## Patterns

### Repetition

Repeated tokens can be matched with ellipses `...`.

```js
macro m {
  rule { ($x ...) } => {
    // ...
  }
}
m (1 2 3 4)
```

A repeated pattern with a separator between each item can be matched
by adding `(,)` between `...` and the pattern being repeated.

```js
macro m {
  rule { ($x (,) ...) } => {
    [$x (,) ...]
  }
}
m (1, 2, 3, 4)
```

Repeated groups of patterns can be matched using `$()`.

```js
macro m {
  rule { ( $($id = $val) (,) ...) } => {
    $(var $id = $val;) ...
  }
}
m (x = 10, y = 2)
```

### Pattern Classes

A pattern name can be restricted to a particular parse class by using
`$name:class` in which case rather than matching a token
the pattern matches all the tokens matched by the class.

```js
macro m {
  rule { ($x:expr) } => {
    $x
  }
}
m (2 + 5 * 10)
// --> expands to
2 + 5 * 10
```

The parse classes are:

- `:ident` -- matches an identifier (eg. `foo`)
- `:lit` -- matches a literal (eg. `100` or `"a string"`)
- `:expr` -- matches an expression (eg. `foo("a string") + 100`)


### Literal patterns

The syntax `$[]` will match what is inside the brackets literally. 
For example, if you need to match `...` in a pattern (rather than have `...` mean repetition) you can escape it with `$[...]`.

# Hygiene

To make things slightly more interesting, let's say we want to write a
macro that swaps the values stored in two variables.

```js
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
```

After running this through sweet.js we get the expanded code:

```js
var a$1 = 10;
var b$2 = 20;

var tmp$3 = a$1;
a$1 = b$2;
b$2 = tmp$3;
```

As you can see, the variables names have been changed with a `$n`
postfix. This is hygiene at work. One of the critical features of
sweet.js is protecting macros from unintentionally binding or
capturing variables they weren't supposed to. This is called hygiene
and to enforce hygiene sweet.js must carefully rename all variables.

If sweet.js did not protect hygiene a naive expansion would do the
wrong thing:

```js
var tmp = 10;
var b = 20;

swap {tmp <=> b}

// --> naive expansion
var tmp = 10;
var b = 20;

var tmp = tmp;
tmp = b;
b = tmp;
```

But since sweet.js protects hygiene, all variable names are correctly
renamed:

```js
var tmp = 10;
var b = 20;

swap {tmp <=> b}

// --> hygienic expansion
var tmp$1 = 10;
var b$2 = 20;

var tmp$3 = tmp$1;
tmp$3 = b$2;
b$2 = tmp$1;
```

In the cases where you want to intentionally break hygiene you can use
the procedural case macros described in the next section.

# Case Macros

Sweet.js also provides a more powerful way to define macros: case
macros. Case macros allow you to manipulate syntax using the full
power of JavaScript. Case macros look like this:

```js
macro <name> {
  case { <pattern> } => { <body> }
}
```

Case macros look similar to rule macros with a few important
differences. First, the patterns also match the macro name instead of
just the syntax that comes after it:

```js
macro m {
  case { $name $x } => { ... }
}
m 42  // `$name` will be bound to the `m` token
      // in the macro body
```

Most of the time you won't need to match the name and can use the
wildcard `_` pattern (which matches any token but doesn't bind it to a
name) to ignore it:

```js
macro m {
  case { _ $x } => { ... }
}
```

The other difference from rule macros is that the body of a macro 
contains a mixture of templates and normal JavaScript that can create
and manipulate syntax. For example, here's the identity macro defined
with a case macro:

```js
macro id {
  case {_ $x } => {
    return #{ $x }
  }
}
```

Templates are now created with the `#{...}` form (which is technically
shorthand for `syntax {...}`). The `#{...}` form creates an array of
*syntax objects* using any pattern bindings that are in scope (i.e.
were matched by the pattern).

*Syntax objects* are the representation of tokens that sweet.js uses
to keep track of lexical context (which is used to maintain hygiene).
They can be created with templates (`#{}`) but you can also create
individual syntax objects using the lexical context of an existing
syntax object:

```js
macro m {
  case {_ $x } => {
    var y = makeValue(42, #{$x});
    return [y]
  }
}
m foo
// --> expands to
42
```

Sweet.js provides the following functions to create syntax objects:

* `makeValue(val, stx)` -- `val` can be a `boolean`, `number`,
  `string`, or `null`/`undefined`
* `makeRegex(pattern, flags, stx)` -- `pattern` is the string
  representation of the regex pattern and `flags` is the string
  representation of the regex flags
* `makeIdent(val, stx)` -- `val` is a string representing an
  identifier
* `makePunc(val, stx)` -- `val` is a string representing a punctuation
  (e.g. `=`, `,`, `>`, etc.)
* `makeDelim(val, inner, stx)` -- `val` represents which
  delimiter to make and can be either `"()"`, `"[]"`, or `"{}"` and
  `inner` is an array of syntax objects for all of the tokens inside
  the delimiter.

If you want strip a syntax object of its lexical context and get
directly at the token you can use `unwrapSyntax(stx)`. 

When using these functions to create new syntax objects it is
convenient to refer to them in `#{}` templates. To do this sweet.js
provides the `letstx` macro that binds syntax objects to pattern
variables:

```js
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
```


# Let macros

Sometimes you don't want a macro to recursively call
itself. For example, say you want to override `function` to add some
logging information before the rest of the function executes:

```js
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
```

If you tried to run this through the compiler it will loop forever
since the `function` identifier in the macro expansion is bound to the
`function` macro. To prevent this you can use the `let` macro binding
form:

```js
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
```


This binds `function` to the macro in the rest of the code but not in
the body of the `function` macro. 

# Infix Macros

Sweet.js also lets you match on previous syntax using `infix` rules. Use a
vertical bar (`|`) to separate your left-hand-side from your right-hand-side.

```js
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
```

You can use the `infix` keyword with procedural macros, too. The macro name is
just the first token on the right-hand-side.

```js
macro m {
  case infix { $lhs | $name $rhs } => { ... }
}
```

Infix rules can be mixed and matched with normal rules:

```js
macro m {
  rule infix { $lhs | $rhs } => { ... }
  rule { $rhs } => { ... }
}
```

You can even leave off the right-hand-side for a postfix macro:

```js
macro m {
  rule infix { $lhs | } => { ... }
}
```

Sweet.js does its best to keep you from clobbering previous syntax.
  
```js
macro m {
  rule infix { ($args ...) | $call:expr } => {
    $call($args ...)
  }
}

(42) m foo; // This works
bar(42) m foo; // This is a match error
```

The second example fails to match because you'd be splitting the good function
call on the left-hand-side in half. The result would have been nonsense, giving
you a nasty parse error.

# Custom Operators

```js
macro (=>) {
    rule infix { ($params ...) | { $body ... } } => {
        function ($params ...) { $body ... }
    }
}
operator (>>=) 12 left { $l, $r } => #{$l.then($r) }

get('story.json')  >>= (response) => {
  return JSON.parse(response);
} >>= (response) => {
  console.log("Yey JSON!", response);
} >>= JSON.parse
```

## Operator Precedence

Unary Operators:

| Operator   | Precedence |
| ---------- | ---------- |
|`new`       | 16         
|`++`        | 15        
|`--`        | 15       
|`!`         | 14        
|`~`         | 14        
|`+`         | 14        
|`-`         | 14        
|`typeof`    | 14        
|`void`      | 14        
|`delete`    | 14        
|`yield`     | 2         

Binary Operators:

| Operator   | Precedence | Associativity |
| ---------- | ---------- | ------------- |
| `*`| 13| left 
| `/`| 13|  left 
| `%`| 13| left
| `+`| 12| left
| `-`| 12| left
| `>>`| 11| left
| `<<`| 11| left
| `>>>`| 11| left
| `<`| 10| left
| `<=`| 10| left
| `>`| 10| left
| `>=`| 10| left
| `in`| 10| left
| `instanceof`| 10| left
| `==`| 9| left
| `!=`| 9| left
| `===`| 9| left
| `!==`| 9| left
| `&`| 8| left
| `^`| 7| left
| <code>&#124;</code>| 6| left
| `&&`| 5| left
| <code>&#124;&#124;</code>|4| left


# Modules

## Using modules

At the moment sweet.js supports a primitive form of module support with the `--module` flag.

For example, if you have a file `macros.js` that defines the `m` macro:

```javascript
// macros.js

macro m { /* ... */ }
export m;
```

and `my_sweet_code.js` uses `m`:

```js
// my_sweet_code.js

m 42
```

You would compile this with:

    $ sjs --module ./macros.js  my_sweet_code.js 

Note that modules must use the `export` keyword. This allows modules to define "private" macros that are not visible to the main code.

The `--module` flag uses the node path to look up the module file so you can publish and use macro modules on npm. Checkout [lambda-chop](https://github.com/natefaubion/lambda-chop) for an example of this.

The biggest limitation with the current approach is that you can't arbitrarily interleave importing compile-time values (macros) and run-time values (functions). This will eventually be handled with support for "proper" modules (issue #43).

## Node loader

If you'd like to skip using the `sjs` binary to compile your sweet.js code, you can use the node loader. This allows you to `require` sweet.js files that have the `.sjs` extension:

```js
var sjs = require('sweet.js'),
    example = require('./example.sjs');

example.one;
```

Where ./example.sjs contains:

```js
//  example.sjs
macro id {
    rule { ($x) } => {
        $x
    }
}

exports.one = id (1);
```

Note that `require('sweet.js')` must come before any requires of `.sjs` code. Also note that this does not import any macros, it just uses sweet.js to compile files that contain macros before requiring them. 

# FAQ

## How do I break hygiene?

Sometimes you really do need to break the wonderful protections
provided by hygiene. Breaking hygiene is usually a bad idea but
sweet.js won't judge.

Breaking hygiene is done by stealing the lexical context from syntax
objects in the "right place". To clarify, consider `aif` the
[anaphoric](http://en.wikipedia.org/wiki/Anaphoric_macro) if macro
that binds its condition to the identifier `it` in the body.

```js
var it = "foo";
long.obj.path = [1, 2, 3];
aif (long.obj.path) {
  console.log(it);
}
// logs: [1, 2, 3]
```

This is a violation of hygiene because normally `it` should be bound
to the surrounding environment (`"foo"` in the example above) but
`aif` wants to capture `it`. To do this we can create an `it` binding in
the macro that has the lexical context associated with the surrounding
environment. The lexical context we want is actually found on the
`aif` macro name itself. So we just need to create a
new `it` binding using the lexical context of `aif`:

```js
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
```

## How do I output comments?

Comments in a rule macro or inside a `#{...}` template should "just work". If you want to create comment strings programmatically you can use a token's `leadingComments` property.

```js
macro m {
    case {_ () } => {
        var x = makeValue(42, #{here});
        x.token.leadingComments = [{
            type: "Line",
            value: "hello, world"
        }];
        return withSyntax ($x = [x]) #{
            $x
        }
    }
}
m()
```
will expand to
```js
//hello, world
42;
```

