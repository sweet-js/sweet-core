macro syntax {
    // syntax { $toks ... }
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
