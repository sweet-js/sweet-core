macro quoteSyntax {
    function(stx) {
        var name_stx = stx[0];

        var res = [
            makeIdent("#quoteSyntax", name_stx),
            stx[1]
        ];

        return {
            result: res,
            rest: stx.slice(2)
        };
    }
}

macro syntax {
    function(stx) {
        var name_stx = stx[0];

        var res = [makeIdent("patternModule", name_stx),
                   makePunc(".", name_stx),
                   makeIdent("transcribe", name_stx),
                   makeDelim("()", [
                       makeIdent("#quoteSyntax", name_stx),
                       stx[1],
                       makePunc(",", name_stx),
                       makeIdent("name_stx", name_stx),
                       makePunc(",", name_stx),
                       makeIdent("match", name_stx),
                       makePunc(".", name_stx),
                       makeIdent("patternEnv")
                   ], name_stx)];
                   
        
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


macro syntaxCase {
    function(stx) {
        var name_stx = stx[0];
        var arg_stx = stx[1].token.inner;
        var cases_stx = stx[2].token.inner;

        // "import"
        var Token = parser.Token;
        var assert = parser.assert;
        var loadPattern = patternModule.loadPattern;
        var matchPatterns = matchPatterns;


        function makeFunc(params, body) {
            return [
                makeKeyword("function", name_stx),
                makeDelim("()", params, name_stx),
                makeDelim("{}", body, name_stx)
            ];
        }
        function makeVarDef(id, expr) {
            return [
                makeKeyword("var", name_stx),
                makeIdent(id, name_stx),
                makePunc("=", name_stx)
            ].concat(expr).concat(makePunc(";", name_stx));
        }

        if (cases_stx.length == 0) {
            throw new Error("Must have at least one case")
        }
        var cases = [];
        for (var i = 0; i < cases_stx.length; i += 5) {
            // looking for:
            // case { ... } => { ... }
            var caseKwd = cases_stx[i];
            var casePattern = cases_stx[i + 1];
            var caseArrow1 = cases_stx[i + 2]; // =
            var caseArrow2 = cases_stx[i + 3]; // >
            var caseBody = cases_stx[i + 4];

            if (!(caseKwd && caseKwd.token && caseKwd.token.value === "case")) {
                throw new Error("expecting case keyword in syntax case");
            }
            if (!(casePattern && casePattern.token && casePattern.token.value === "{}")) {
                throw new Error("expecting a pattern surrounded by {} in syntax case");
            }
            if (!(caseArrow1 && caseArrow1.token && caseArrow1.token.value === "=")) {
                throw new Error("expecting an arrow separating pattern from body in syntax case");
            }
            if (!(caseArrow2 && caseArrow2.token && caseArrow2.token.value === ">")) {
                throw new Error("expecting an arrow separating pattern from body in syntax case");
            }
            if (!(caseBody && caseBody.token && caseBody.token.value === "{}")) {
                throw new Error("expecting a body surrounded by {} in syntax case");
            }
            
            cases.push({
                pattern: loadPattern(casePattern.token.inner),
                body: caseBody.token.inner
            });
        }

        function patternToObject(pat) {
            var res = [
                makeIdent("value", name_stx),
                makePunc(":", name_stx),
                makeValue(pat.token.value, name_stx)
            ];
            if (pat.token.type === Token.Delimiter) {
                res = res.concat([
                    makePunc(",", name_stx),
                    makeIdent("inner", name_stx),
                    makePunc(":", name_stx),
                    patternsToObject(pat.token.inner)
                ]);
            }
            if (typeof pat.class !== 'undefined') {
                res = res.concat([
                    makePunc(",", name_stx),
                    makeIdent("class", name_stx),
                    makePunc(":", name_stx),
                    makeValue(pat.class)
                ]);
            }
            if (typeof pat.repeat !== 'undefined') {
                res = res.concat([
                    makePunc(",", name_stx),
                    makeIdent("repeat", name_stx),
                    makePunc(":", name_stx),
                    makeValue(pat.repeat, name_stx)
                ]);
            }
            if (typeof pat.separator !== 'undefined') {
                res = res.concat([
                    makePunc(",", name_stx),
                    makeIdent("separator", name_stx),
                    makePunc(":", name_stx),
                    makeValue(pat.separator, name_stx)
                ]);
            }

            return makeDelim("{}", res, name_stx);
        }

        function patternsToObject(pats) {
            var res = [];
            for (var i = 0; i < pats.length; i++) {
                if (i !== 0) {
                    res.push(makePunc(",", name_stx));
                }
                res.push(patternToObject(pats[i]));
            }
            return makeDelim("[]", res, name_stx);
        }

        function makeMatch(i) {
            var pat = makeVarDef("pat", [patternsToObject(cases[i].pattern)]);
            var match = makeVarDef("match", [makeIdent("patternModule", name_stx),
                                             makePunc(".", name_stx),
                                             makeIdent("matchPatterns", name_stx),
                                             makeDelim("()", [
                                                 makeIdent("pat", name_stx),
                                                 makePunc(",", name_stx),
                                                 makeIdent("arg", name_stx),
                                                 makePunc(",", name_stx),
                                                 makeIdent("env", name_stx),
                                                 makePunc(",", name_stx),
                                                 makeValue(true, name_stx)
                                             ], name_stx)]);
            return pat.concat(match);
        }

        function makeTranscribe(i) {
            return [
                makeKeyword("if", name_stx),
                makeDelim("()", [
                    makeIdent("match", name_stx),
                    makePunc(".", name_stx),
                    makeIdent("success", name_stx)
                ], name_stx),
                makeDelim("{}", makeVarDef("newMark", [
                    makeIdent("fresh", name_stx),
                    makeDelim("()", [], name_stx)
                ]).concat([
                    makeIdent("applyMarkToPatternEnv", name_stx),
                    makeDelim("()", [
                        makeIdent("newMark", name_stx),
                        makePunc(",", name_stx),
                        makeIdent("match", name_stx),
                        makePunc(".", name_stx),
                        makeIdent("patternEnv", name_stx)
                    ], name_stx),
                    makePunc(";", name_stx)
                ]).concat(makeVarDef("res", [
                    makeDelim("()", makeFunc([], cases[i].body), name_stx),
                    makeDelim("()", [], name_stx)
                ])).concat([
                    makeIdent("res", name_stx),
                    makePunc("=", name_stx),
                    makeIdent("_", name_stx),
                    makePunc(".", name_stx),
                    makeIdent("map", name_stx),
                    makeDelim("()", [
                        makeIdent("res", name_stx),
                        makePunc(",", name_stx)
                    ].concat(makeFunc([makeIdent("stx", name_stx)], [
                        makeKeyword("return", name_stx),
                        makeIdent("stx", name_stx),
                        makePunc(".", name_stx),
                        makeIdent("mark", name_stx),
                        makeDelim("()", [makeIdent("newMark", name_stx)])
                    ])), name_stx),
                    makePunc(";", name_stx)
                ]).concat([
                    makeKeyword("return", name_stx),
                    makeDelim("{}", [
                        makeIdent("result", name_stx),
                        makePunc(":", name_stx),
                        makeIdent("res", name_stx),

                        makePunc(",", name_stx),

                        makeIdent("rest", name_stx),
                        makePunc(":", name_stx),
                        makeIdent("match", name_stx),
                        makePunc(".", name_stx),
                        makeIdent("rest", name_stx)
                    ], name_stx)
                ]))];
            
        }

        // setup a reference to the syntax argument
        var arg_def = makeVarDef("arg", [makeIdent("stx", name_stx)]);
        var name_def = makeVarDef("name_stx", [makeIdent("arg", name_stx),
                                               makeDelim("[]", [makeValue(0, name_stx)], name_stx)]);


        var body = arg_def.concat(name_def);

        for(var i = 0; i < cases.length; i++) {
            body = body.concat(makeMatch(i)).concat(makeTranscribe(i));
        }
        body = body.concat([
            makeKeyword("throw", name_stx),
            makeKeyword("new", name_stx),
            makeIdent("Error", name_stx),
            makeDelim("()", [
                makeValue("Could not match any cases for macro: "),
                makePunc("+", name_stx),
                makeIdent("name_stx", name_stx),
                makePunc(".", name_stx),
                makeIdent("token", name_stx),
                makePunc(".", name_stx),
                makeIdent("value", name_stx)
            ], name_stx)
        ]);

        var res = [
            makeDelim("()", makeFunc([makeIdent("stx", name_stx),
                                      makeIdent("env", name_stx)], body),
                      name_stx),
            makeDelim("()", arg_stx, name_stx)
        ];

        return {
            result: res,
            rest: stx.slice(3)
        }
    }
}

macro macro {
    function(stx) {
        var name_stx = stx[0];
        var mac_name_stx = stx[1];
        var body_stx = stx[2].token.inner;

        function makeFunc(params, body) {
            return [
                makeKeyword("function", name_stx),
                makeDelim("()", params, name_stx),
                makeDelim("{}", body, name_stx)
            ];
        }

        // handle primitive macro form
        if (body_stx[0] && body_stx[0].token.value === "function") {

            var res = [
                makeIdent("macro", null),
                mac_name_stx,
                stx[2]
            ];

            return {
                result: res,
                rest: stx.slice(3)
            };
        }

        var res = [makeIdent("macro", null),
                   mac_name_stx,
                   makeDelim("{}", makeFunc([makeIdent("stx", name_stx),
                                             makeIdent("env", name_stx)],
                                            [makeIdent("return", name_stx),
                                             makeIdent("syntaxCase", name_stx),
                                             makeDelim("()", [makeIdent("stx", name_stx),
                                                              makePunc(",", name_stx),
                                                              makeIdent("env", name_stx)], name_stx),
                                             stx[2]]),
                             name_stx)];
                   

        return {
            result: res,
            rest: stx.slice(3)
        }
    }
}


/*
syntaxCase (makeValue(42, null)) {
  case {_ $x } => {
    return #{$x}
  }
}

*/

