# Preliminary Design

## Reading

To do macros we need to `read`. To `read` we need to match delimiters
and build a token tree to know where a macro invocation ends. 

But JS complicates this because delimiters can appear inside 
of a regex literal and deciding if `/` is the start of a 
regex or the division operator depends on parsing context.

So how do we deal with this?

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

### 2. Give lookbehind to the reader

So to handle the problem of `/` I think we can use "almost one" lookbehind to
disambiguate. Algorithm:

    skip over comments
    
    if tok is /
        if tok-1 is )
            look back to matching (
            if identifier before ( in "if" "while" "with" "catch"
                tok is start of regex literal
            else
                tok is divide
                
        if tok-1 in punctuator 
            tok is start of regex literal
            
        if tok-1 in keywords (though some keywords will eventually result in a parse error)
            tok is start of regex literal
            
        else
            tok is divide

Some examples:

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
    
    
But this means that inside of a macro call we have to follow this context 
sensitivity for regex literals. So the following reasonable macro
isn't allowed:

    macro rcond {
        rcond (s:expr) { case e:expr... } => // ...
    }
    
    rcond ("foo") { 
      case /foo}bar/
    }

The "case" makes the first / to be interpreted as divide. So we could
just leave this as is and call it a limitation of macros. They need to
respect the same structure as JS. This might actually be ok. The above
could be done as:

    rcond ("foo") {
        case "foo}bar"
    }

Not too bad of a change I think. We're already forcing delimiter
matching anyway. e.g. the following is bad because of the extra
unmatched paren:

    macro m {
        case m (e1: expr ( e2:expr) => // ...
    }

Can't break the lexical structure (are there macro systems that allow this?).


If we want to allow macros to shadow statements like if we have
another complication:

    macro if { 
        case if(c:expr) => ...
    }
    if (true) / foo
    // should be divide?!
    // problem only because of implicit {}?
    
**how do we deal with implicit {} in `if`/`for`?**


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
