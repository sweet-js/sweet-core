# Syntax Objects

Syntax objects represent the syntax from the source program.

```js
class Syntax {
  // make a syntax object from the given shift token
  static of: (Token, Syntax?) -> Syntax

  // make a syntax object from the given value
  static fromNumber: (Number, Syntax?) -> Syntax
  static fromString: (String, Syntax?) -> Syntax
  static fromIdentifier: (String, Syntax?) -> Syntax
  static fromBraces: (List<Syntax>, Syntax?) -> Syntax
  static fromParens: (List<Syntax>, Syntax?) -> Syntax
  static fromBrackets: (List<Syntax>, Syntax?) -> Syntax

  val: () -> String
  resolve: () -> String
  lineNumber: () -> Number

  // throws if not a delimiter syntax object
  inner: () -> List<Syntax>

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

  toString: () -> String
```
