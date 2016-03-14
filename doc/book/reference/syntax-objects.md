# Syntax Objects

Syntax objects represent the syntax from the source program.

```js
class Syntax {

  val: () -> Maybe(String)
  lineNumber: () -> Number

  // throws if isDelimiter is false
  inner: () -> Iterator(Syntax)

  isIdentifier: () -> Boolean
  isBooleanLiteral: () -> Boolean
  isNullLiteral: () -> Boolean
  isNumericLiteral: () -> Boolean
  isStringLiteral: () -> Boolean
  isKeyword: () -> Boolean
  isPunctuator: () -> Boolean
  isRegularExpression: () -> Boolean
  isTemplate: () -> Boolean
  isDelimiter: () -> Boolean
  isParens: () -> Boolean
  isBrackets: () -> Boolean
  isBraces: () -> Boolean
  isSyntaxTemplate: () -> Boolean
```
