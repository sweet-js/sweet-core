export syntax # = function(ctx) {
  let arg = ctx.syntax().next().value;
  return syntaxQuote`syntaxQuote${arg}`;
}
