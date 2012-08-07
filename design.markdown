# Preliminary Design

## Reading

To do macros we need to `read`. To `read` we need to match delimiters
and build a token tree to know where a macro invocation ends. 

But JS complicates this because delimiters can appear inside 
of a regex literal and deciding if `/` is the start of a 
regex or the division operator depends on parsing context.

### Give lookbehind to the reader

So to handle the problem of `/` we can use "almost one" lookbehind to
disambiguate. Algorithm:

    skip over comments
    
    if tok is /
        if tok-1 is )
            look back to matching (
            if identifier before ( in "if" "while" "for" "with"
                tok is start of regex literal
            else
                tok is divide
        if tok-1 is }
            if end of function expression // described below
                tok is start of divide
            else
                tok is start of regex literal
            
        if tok-1 in punctuator // e.g. ";", "==", ">", "/", "+", etc.
            tok is start of regex literal
            
        if tok-1 in keywords // though some keywords will eventually result in a parse error
            tok is start of regex literal
            
        else
            tok is divide

Depending on context, `function name() {}` is either a function declaration or a
function expression. If it's a function expression then
a following `/` will be interpreted as a divide but if it's a
function declaration a following `/` will be interpreted as a regex.
For example,

    // a declaration so / is regex
    f(); function foo() {} /42/i
    vs
    // an expression so / is divide
    x = function foo() {} /42/i
    
Looking a token behind the `function` keyword (ignoring newlines) the
following imply it is a function declaration:

    ; } ) ] ident literal (including regex literal so need to be careful about /)
    debugger break continue else
    
And these imply it is an function expression.

    ( { [ , (assignment operators) (binary operators) (unary operators)
    in typeof instanceof new return case delete
    throw void
    
And these will result in a parse error:

    do break default finally for function if switch this
    try var while with
    
What should do we do with FutureReservedWords? Treat as identifiers?

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
    
    
This means that inside of a macro call we have to follow this context 
sensitivity for regex literals. So the following reasonable macro
isn't allowed:

    macro rcond {
        rcond (s:expr) { instance e:expr... } => // ...
    }
    
    rcond ("foo") { 
      instance /foo}bar/
    }

The "instance" makes the first `/` be interpreted as divide. So we could
just leave this as is and call it a limitation of macros. They need to
respect the same structure as JS. This might actually be ok. The above
could be done as:

    rcond ("foo") {
        instance "foo}bar"
    }
    
(note that if we used `case` instead of `instance` then 
the following `/`
would be interpreted as the start of a regex since `case` is a keyword,
but in general this is a non-obvious rule for macro writers to be aware of)

Not too bad of a change I think. We're already forcing delimiter
matching anyway. e.g. the following is bad because of the extra
unmatched paren:

    macro m {
        case m (e1: expr ( e2:expr) => // ...
    }

If we want to allow macros to shadow statements like `if` we have
another complication:

    macro if { 
        case if(c:expr) => ...
    }
    if (true) / foo
    // should be divide?!
    
So I think we are going to treat the reserved keywords (`if`, `while`,
etc.) as really reserved. Macros can't override their meaning.

Should we disallow FutureReservedWords too (`class`, `enum`, etc.)?


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

So I think we have to have hoisting happen after macro expansion. But what does this mean for hygiene?

    macro foo { ... }
    
    foo { bar = 4 }
    
    var bar = 5;

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

## Papers

Papers I've been looking through:

  * Macros that work
  * Macros that work together
  * A Theory of Typed Hygienic Macros
  * Macro-By-Example: Deriving Syntactic Transformations from their Specifications
  * Syntactic Abstraction in Scheme
  * SuperC: Parsing All of C by Taming the Preprocessor
  * Composable and Compilable Macros
  * Refining Syntactic Sugar: Tools for Supporting Macro Development
  * Fortifying Macros
  * Composable and Compilable Macros
  
What others might be helpful?


