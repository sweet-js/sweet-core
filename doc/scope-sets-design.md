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
