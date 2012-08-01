# Preliminary Design

Having trouble keeping all the moving pieces in my head so it's time
to write it down. And haven't even gotten to the hard parts yet :)

## Reading

To do macros we need to `read`. To `read` we need to match delimiters
and build a token tree to know where a macro invocation ends. 

But JS complicates this because delimiters can appear inside 
of a regex literal and deciding if `/` is the start of a 
regex or the division operator depends on parsing context.

So how do we deal with this?

### 0. Solution!

So to handle the problem of `/` we can have almost-one lookbehind to
disambiguate. Really not too hard as a matter of fact. Basic idea is
to see if the token before `/` is in 
(`=`, `(`, `)`, `{`, `}`, `,`, `]`, `[`). So

    // `=` comes first so regex
    x = /foo/
    
    // `x` so divide
    x = x / foo /
    
    // `(` so regex
    x = (/foo/)
    
    x = 10 {/foo/}
    
    do { /foo/ }
    
    // `)` so actually have to look back all the way to `if` to see regex
    if (true) /foo/
    
    // `=` before the `()` so divide
    x = (a) / foo
    
    // needs to be divide since call
    bar (true) /foo/
    
    // but!
    if (true) /foo/
    if (true) { /foo/ }
    // both are regex
    
    //however!
    macro if { 
        case if(c:expr) => ...
    }
    if (true) / foo
    // should be divide?!
    // problem only because of implicit {}?
    
**how do we deal with implicit {} in `if`/`for`?**

### 1. Escape the delimiters

We could just force all code to escape delimiters in regular
expression literals so `var r = /as}df/` now must be written as `var r
= /as\}df/`. This is of course not backwards compatible, though we
could have an "upgrade your old code" script that you run to add the
appropriate escaping.

Annoying rule to force programmers to remember though. Problem for
copy and pasting code snippets too.

Easiest solution. Perhaps just chose this for the first pass and
revisit later? But does this lock down the design too much if we want
to actually solve it in the future?

### 2. Add parsing smarts to the reader

Can we carry enough state in the reader to disambiguate divide from
regexp? But how would this work inside macros?

    macro cond { ... }
    
    for (x in l) {
        z = /as}df/;
    }
    // normal javascript, can figure out it's a regex with 
    // enough state in the reader
    
    cond {
        x > 3 => z = /as}df/
        x < 3 => z = /df}as/
    }
    // are these regexes?
    
    // or a regex cond macro that matches regexes
    var r = rcond ("foo") {
        case /as}df/ => "asdf"
        case /foo/ => "foo"
    }
    // js rules for regex vs div would interpret `case /as}df/...`  as divide

In order to correctly `read` inside the macro invocation we need to
know enough about the structure to decide if a delimiter is inside a
regex or not. But how can we know that?

What about requiring escaping delimiters in regexes in just macro
calls? No can't do this since it breaks if we want to transparently define macros for the
standard forms (e.g. `if`) since we can't expect the programmers to
know when they're using a macro (and thus when to escape in a regex).

### 3. Quantum reading

Can we just `read` all possible delimiter matches? Keep the token tree
in a superposition and delay deciding what is correct until macro
expansion time?

    if (x == 4) { /as}df/ }
    ---->
    [if, (x==4), {/as}df/}]
    // and, starts reading tokens but reaches error state
    [if, (x==4), {/as}, df/, error unmatched delim]

What does it mean to be "correct"? Could we have multiple correct
read trees?

    foo {
        x = /as{df/
        y = /df}as/
    }

Perhaps macro definitions always provide enough context to figure out
which brace to match?

### 4. Mixed

Can we always detect macro invocations before reading is finished? If
so, then can we use the parser to drive the reading of non-macro forms
and the macro pattern to drive the reading of the macro? All the
phases are a little mixed here so does it cause any problems?
This requires that macros are defined before use.

    macro cond {
        case cond { case condition:expr => val:expr ... } => // ...
    }
    // once we've read to here we know that cond {...} forms are a macro
    
    for (x in l) {
        z = /as}df/
    }
    // parsing state will disambiguate the regex and `}`
    
    cond {
        case /as}df/.test("foo") => 42
    }
    // using the knowledge that cond is `case expr => expr` use 
    // parsing state to disambiguate `}`. Can this work?
    
    // what about...
    macro foo { 
        case foo { p:program } => ...
    }
    // should still work since disambiguates via the normal JS parser rules
    
Could also push the burden of disambiguation to the macro writers...

    // regex cond
    macro rcond {
        case rcond (s:expr) { case r:rexex => v:expr } => // ...
    }

Not sure if/when this would be necessary...

## Scope

Macro definitions should be scoped appropriately.
What should we do about hoisting? For example,

    macro foo { ... }
    
    function bar() {
        foo(...)
        
        if (x) {
            var foo = function () { ... }
            foo(...)
        } else {
            var foo = function () { ... }
        }
    }

Because of hoisting, the variable `foo` will shadow the macro definition of
`foo` in this code. But this is complex and annoying. Can we just say
that hoisting always happens after macro expansion? So the first
`foo(...)` is a macro invocation and the second `foo(...)` is a
function call? Does this cause any problems?

## Hygiene

Should be [fun](http://www.quotationspage.com/quote/26964.html)...

## Modules

Details about importing macros from another module...

## Example Code

Some example macro code. In various stages of wrong and impossible.

Syntax-rules flavored macros:

    macro swap {
        case swap (x:var, y:var) => {
            tmp = x;
            x = y;
            y = tmp;
        }
    }
    var a = 2, b = 4;
    swap(a, b)
    
    
    macro unless {
        case unless (condition:expr) { body:expr } => {
            if(!condition) { body } else {}
        }
    }
    
Recursive and refers to previously defined macro:

    macro rotate {
        case rotate (a:var) => ;
        case rotate (a:var, b:var, c:var ...) => {
            swap(a, b);
            rotate(b, c ...);
        }
    }
    var a = 2, b = 4, c = 6, d = 8;
    rotate(a, b, c, d)



    
Syntax-case flavored macros:

    macro swap {
        case swap (x:var, y:var) => {
            #'tmp = x;
            #'x = y;
            #'y = tmp;
        }
    }
    
    macro thunk {
        case thunk (e: expr) =>
            #'function() { return e; }
    }
    
    thunk(2+2)
    
    macro let {
        case let (x:var = v:expr) { body:expr } => {
            #'(function(x) { body })(v)
        }
    }
    
    macro or {
        case or () => #'false;
        case or (e:expr) => #'e;
        case or (e1:expr, e2:expr, e3:expr...) => {
            #'let (t = e1) { t ? t : or(e2, e3) }
        }
    }
    
    macro cond {
        case cond { default: def:expr } => {
            #'def
        }
        case cond { case condition:expr => val:expr, ... default => def:expr } => {
            #'condition ? val : cond { ... default => def }
        }
    }
    
    var type = cond {
        case (x === null) => "null",
        case Array.isArray(x) => "array",
        case (typeof x === "object") => "object",
        default => typeof x
    };
    
    
## Misc

  * sub-form expansion? MTWT says parse and expand must be separate to do sub-form expansion.
  
  * Type like annotations, where did they come from?
  * Entangling of parser and expander, paper says causes problems for racket style macros but do they really?
  * Regex inside of macros, do we handle this for free? 



## Papers

Papers I've been looking through:

  * Macros that work
  * Macros that work together
  * A Theory of Typed Hygienic Macros
  * Macro-By-Example: Deriving Syntactic Transformations from their Specifications
  * Syntactic Abstraction in Scheme
  * SuperC: Parsing All of C by Taming the Preprocessor
  * Composable and Compilable Macros
  
What others might be helpful?
