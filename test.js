syntax m = function(ctx) {
    ctx.nextExpression();
    return syntaxQuote { 200 }
}
m 100 + 200
