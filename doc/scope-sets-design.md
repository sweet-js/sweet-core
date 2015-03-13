# Scope Sets for Hygiene

Idea from [Matthew Flatt](http://www.cs.utah.edu/~mflatt/scope-sets/)'s Racket design.

Replace renames/marks/definition contexts on syntax objects with scopes.

Quoting from Flatt:

> When macro expansion encounters a binding form, it:
>
>  - creates a new scope;
>  - adds the scope to every identifier in binding position, as well as to the region where the bindings apply; and
>  - extends a global table that maps a 〈symbol, scope set〉 pair to a representation of a binding.

For us this means that a scope is:

```js
class Scope {
    constructor(bindings) {
        // for easier debugging so we can easily identify one scope from another
        this.name = fresh();  
        // the global binding table
        this.bindings = bindings;
    }
    addBinding(stx, name) {
        this.bindings.push({
            scopeSet: stx.context,
            original: stx.token.value,
            binding: name
        })
    }
}
```

The syntax object has a new method to add scopes:

```js
function Syntax(...) {
    ...
    // initialize the context to the empty set
    this.context = Immutable.Set();
}
Syntax.prototype.addScope = function(scope) {
    if (this.token.inner) {
        this.token.inner = this.token.inner.map(stx) => {
            return stx.addScope(scope);
        });
    }
    return syntaxFromToken(this.token, this.context.add(scope))
}
```

Inside of expand when we get need to bind a function term:

```js
// simplified, fn with one param
case term.isFunctionTerm => {
    let param = term.param; // Syntax
    let body = term.body // Syntax (the curly delimiter)
    let scope = new Scope();
    let paramNew = param.addScope(scope);
    let bodyNew = body.addScope(scope);
    scope.addBinding(paramNew, fresh())
}
```


## current status


Got what seems to be most things working. Can't compile because something is going wrong in stxcase.js. Might be because of the hygiene hackery that's going on in there. Potential next steps:

- figure out what is wrong with stxcase
- extensive testing
- rewrite stxcase to avoid hygiene hackery (want to do as some point anyway)


## how definition contexts really work

- macro invocations add two scopes to the argument syntax (internal and use-site)
- the internal scope is also added to the result of macro application (double scopes cancel out so only syntax introduced from the macro definition has the internal scope now)
- when an internal definition is discovered it removes the use-site scope from its binding identifier



## the problem with nonrec definitions

Here's the basic problem. In JavaScript I want a macro definition form that is non-recursive: I want a non-recursive `define-syntax`:

```js
var m;
function foo() {
    // non recursive definition
    stx m = macro {
        rule {} => { m }
    }
    m // expands to m from the var declaration

    // recursive definition
    stxrec n = macro {
        rule {} => { n }
    }
    n // infinite loop
}
```

Technically the current sweet.js syntax for a recursive macro definition form is `macro name { ... }` and the non-recursive form is `let name = macro { ... }`. Here I'm using the syntax I want to move to but with both the current and new definition syntax there can't be any additional indentation like Racket's `let-syntax`/`letrec-syntax` forms.


The problem is that with the current approach you outlined I don't see an easy way to distinguish the scope of the macro body from the surrounding scope for a non-recursive definition:

```js
var m^{a}; // a is top-level scope
function foo() {
    // b is the function scope
    stx m^{a,b} = macro {
        rule {} => { m^{a,b} }
    }
    m^{a,b}
    // --> expands to
    m^{a,b,c} // c is the expansion scope
    // still bound to the macro so infinite loop
}
```

We have to apply the b scope to the macro body since that is used for other definitions and we can't create a fresh scope that is applied everywhere except the macro body since we're already in the middle of the scope.


One thing I thought about was applying an "anti-scope" to the macro body that maps a name and scope to be ignored. So in my example the `m` in the body would be something like `m^{a,b,!b@m }` where `!b@m` reads "cancel scope b but only for the name m".


## brainstorm from mflatt

Brainstorming for an alternative (so this might not be a good idea)...
maybe

     stx m^{a,b} = macro {
         [content]^{a,b}
     }

in a scope `b` could expand to something like

     stxrec m^{a,b,c} = macro { m^{a} }
     stxrec m^{a,b} = macro {
         [content]^{a,b,c}
     }

That is, `stx` introduces a scope `c` specific to the macro body, adds
a definition of `m` with that new scope, but equates the new `m` to an
`m` with the enclosing form's scope removed.

That would stick with simple sets of scopes, but it requires a way to
forward one macro to another. It turns out that Racket's macro system
has a forwarding mechanism that's wired in fairly deeply --- even below
`free-identifier=?`.
