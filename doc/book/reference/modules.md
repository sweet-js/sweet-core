# Modules

Macros can exported and imported into modules via ES2015 module syntax. This allows you to define your macros in one file:

```js
// id.js
export syntax id = function (ctx) {
  return #`${ctx.next().value}`;
}
```

And import them in another:

```js
// main.js
import { id } from './id.js';
id 42
```
