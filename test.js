syntax m = {
    match: function(stxl) {
        return {
            subst: [],
            rest: stxl.rest()
        };
    },
    transform: function(subst) {
        return syntaxQuote { 200 };
    }
}
let v = m
