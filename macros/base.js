#lang "js";


forPhase 1 {
    stxrec quoteSyntax {
        function(stx) {

            if (!(stx[1] && stx[1].token && stx[1].token.inner)) {
                throwSyntaxError("macro", "Macro `quoteSyntax` could not be matched" , stx[1]);
            }

            return {
                result: [makeIdent("#quoteSyntax", null), stx[1]],
                rest: stx.slice(2)
            };
        }
    }
}
stxrec quoteSyntax {
    function(stx) {

        if (!(stx[1] && stx[1].token && stx[1].token.inner)) {
            throwSyntaxError("macro", "Macro `quoteSyntax` could not be matched" , stx[1]);
        }

        return {
            result: [makeIdent("#quoteSyntax", null), stx[1]],
            rest: stx.slice(2)
        };
    }
}

stxrec syntax {
    function(stx) {
        var here = quoteSyntax{here};

        return {
            result: [makeIdent("quoteSyntax", here), stx[1]],
            rest: stx.slice(2)
        };
    }
}


stxrec # {
    function (stx) {
        return {
            result: [makeIdent("syntax", quoteSyntax{here}), stx[1]],
            rest: stx.slice(2)
        }
    }
}

export { quoteSyntax, syntax, # }
