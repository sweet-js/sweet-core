syntax # = function(ctx) {
  let arg = ctx.next();
  return syntaxQuote`syntaxQuote${arg}`;
}

syntax m = function(ctx) {
  let x = ctx.nextExpression();
  return #`40 + ${x}`;
}
m 2;
