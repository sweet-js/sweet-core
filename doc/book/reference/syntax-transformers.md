# Syntax Transformers (aka Macros)

```
transformer : (TransformerContext) -> List<Syntax>
```

A syntax transformer is a function bound to a compile-time name. A syntax transformer is invoked with a *transformer context* that provides access to the syntax at the call-site and returns a list of syntax.

```js
syntax inc = function (ctx) {
  let x = ctx.next().value;
  return #`${x} + 1`;
}
inc 100
```

## Transformer Context

A transformer context is an iterable[^1] object that provides access to syntax at the call-site of a syntax transformer.

```js
class TransformerContext {
  next: () -> {
    done: boolean,
    value: Syntax
  }
  next: (String) -> {
    done: boolean,
    value: Term
  }

  of: (Syntax) -> TransformerContext
}
```

Each call to `next` returns the syntax object following the transformer call. If `next` is called with a string, the specified grammar production is matched and a corresponding [`Term`](terms.md) is returned instead of a syntax object.

The `of` method constructs a new `TransformerContext` using the provided syntax object as the context. This used to handle matching syntax inside delimiter syntax objects:

```js
syntax m = function (ctx) {
  let paren = ctx.next().value;
  let parenCtx = ctx.of(paren);
  let items = [];

  for (let i of parenCtx) {
    items.push(k)
  }
  return #`[${items}]`;
}
m (1, 2, 3)
```

Note in the above example that since a `TransformerContext` is an iterable, the `for-of` loop works as expected.

## Syntax Templates

Syntax templates construct a list of syntax objects from a literal representation using backtick (``#`foo bar baz` ``). They are similar to ES2015 templates but with the special sweet.js specific `#` template tag.

Syntax templates support interpolations just like normal templates via `${...}`:

```js
syntax m = function (ctx) {
  return #`${ctx.next().value} + 24`;
}
m 42
```

The expressions inside an interpolation must evaluate to a syntax object, a term, an array, or a list.

[^1]: A Transformer Context is both iterator and iterable.
