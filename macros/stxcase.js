// syntax { $toks ... }
macro syntax {
    function(stx, macroName) {
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
    case { { $template ... } } => {
        return syntax {
            syntax { $template ... }
        }
    }
}
/*
  syntax { var x = 42 }
  -->
  [makeKeyword('x', syntax)]

 */


// macro macro_case {
//     function(stx) {
//         var macroName = stx[0];
//         var macroBody = stx[1].token.inner;

//         var cases = [];

//         var casePattern, caseBody;

//         var i = 0;

//         // syntax {
//         //     macro <macroName> {
//         //         function(stx) {
//         //             var [env, body] = patternMatch(stx, <patterns>);
//         //             var newBody = bindPatternsInTemplates(body, env)
                    
//         //         }
//         //     }
//         // }

//         var res = [
//             makeIdent("macro", macroName),
//             macroName,
//             makeDelim("{}", [
//                 makeKeyword("function", macroName),
//                 makeDelim("()", [makeIdent("stx", macroName)], macroName),
//                 makeDelim("{}", [
//                     makeKeyword("return", macroName),
//                     makeDelim("{}", [
//                         makeIdent("result", macroName),
//                         makePunc(":", macroName),
//                         makeDelim("[]", [
//                             makeIdent("makeValue", macroName),
//                             makeDelim("()", [makeValue(42, macroName),
//                                              makePunc(",", macroName),
//                                              makeValue(null, macroName)], macroName)
//                         ], macroName),
//                         makePunc(",", macroName),

//                         makeIdent("rest", macroName),
//                         makePunc(":", macroName),
//                         makeIdent("stx", macroName),
//                         makePunc(".", macroName),
//                         makeIdent("slice", macroName),
//                         makeDelim("()", [makeValue(1, macroName)], macroName)
//                     ], macroName)
//                 ], macroName)
//             ], macroName)
//         ]

//         return {
//             result: res,
//             rest: stx.slice(2)
//         };
//     }
// }
