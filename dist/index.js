export syntax # = function(ctx) {
  let arg = ctx.next();
  return syntaxQuote`syntaxQuote${arg}`;
}
