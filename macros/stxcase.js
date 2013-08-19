macro syntaxCase {
    function(stx) {
        var name = stx[0];
        var arg = stx[1].inner[0];
        var cases = stx[2].inner;
        var res = [];

        return {
            result: res,
            rest: stx.slice(3)
        }
    }
}
// syntaxCase () {
//     case { _ $x + $y } => {
//         console.log("hi")
//         return #{
//             $y - $x
//         }
//     }
// }


// macro syntaxCase {
//     function(stx) {
//         var name = stx[0];
//         var arg = stx[1].inner[0];
//         var cases = stx[2].inner;
//         var res = [];

//         return {
//             result: res,
//             rest: stx.slice(3)
//         }
//     }
// }
// syntaxCase (#{42 + 24}) {
//     case { _ $x + $y } => {
//         console.log("hi")
//         return #{
//             $y - $x
//         }
//     }
// }


// // ->
// function(stx) {
//     // pattern match stx
//     console.log("hi")
//     // expand #{...} with pattern env 
//     return #{...}
// }


macro syntax {
    // syntax { $toks ... }
    function(stx) {
        var template = stx[0].token.inner;

        var tempId = fresh();
        macroName.templateMap.set(tempId, template)

        var res = [
            makeIdent("genTemplate", macroName),
            makeDelim("()", [
                makeValue(tempId, macroName)
            ], macroName),
            makePunc(";", macroName)
        ];

        return {
            result: res,
            rest: stx.slice(2)
        };
    }
}

macro # {
    function (stx) {
        return {
            result: [makeIdent("syntax", stx[0]),
                     stx[1]],
            rest: stx.slice(2)
        }
    }
}
