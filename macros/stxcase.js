#lang "js";



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

stxrec bindSyntax {
    function(stx) {
        var here = quoteSyntax{here};

        var res = [makeIdent("patternModule", here),
                   makePunc(".", here),
                   makeIdent("transcribe", here),
                   makeDelim("()", [
                       makeIdent("#quoteSyntax", here),
                       stx[2],
                       makePunc(",", here),
                       makeValue(null, here),
                       makePunc(",", here),
                       stx[1],
                       makePunc(".", here),
                       makeIdent("patternEnv", here)
                   ], here)];

        return {
            result: res,
            rest: stx.slice(3)
        }
    }
}

// stxrec stx {
//     rule { $name { $body ... } } => {
//         stxrec $name^{a,b} {
//             rule {} => { $name^{} }
//          }
//         stxrec $name^{a} { $body^{a,b} ... }
//     }
// }

stxrec stxnonrec {
    function (stx) {
        var name = stx[1];
        var body = stx[2];

        var nonRecScope = __freshScope(__bindings);

        var nonRecBody = body.mark(nonRecScope);
        var nonRecName = name.mark(nonRecScope);
        var surroundingName = name.delScope(__scope);

        // hacky unquote
        function traverse(stx, one, two, three, four) {
            return stx.map(function(s) {
                if (s.token.inner) {
                    s.token.inner = traverse(s.token.inner, one, two, three);
                    return s;
                }
                if (s.token.value === "$1") {
                    return one;
                }
                if (s.token.value === "$2") {
                    return two;
                }
                if (s.token.value === "$3") {
                    return three;
                }
                if (s.token.value === "$4") {
                    return four;
                }
                return s;
            });
        }

        var res = traverse(quoteSyntax {
            stxrec $1 {
                function(stx) {
                    return {
                        result: quoteSyntax{$2},
                        rest: stx.slice(1)
                    };
                }
            }
            stxrec $3 $4
        }, nonRecName, surroundingName, name, nonRecBody);
        return {
            result: res,
            rest: stx.slice(3)
        }
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


stxrec syntaxCase {
    function(stx, context) {
        var name_stx = stx[0];
        var here = quoteSyntax{here};

        if (!(stx[1] && stx[1].token && stx[1].token.inner) ||
            !(stx[2] && stx[2].token && stx[2].token.inner)) {
            throwSyntaxError("macro", "Macro `syntaxCase` could not be matched" , stx[1]);
        }

        var arg_stx = stx[1].token.inner;
        var cases_stx = stx[2].token.inner;

        var Token = parser.Token;
        var assert = parser.assert;
        var loadPattern = patternModule.loadPattern;
        var takeLine = patternModule.takeLine;
        var matchPatterns = matchPatterns;

        function makeFunc(params, body) {
            return [
                makeKeyword("function", here),
                makeDelim("()", params, here),
                makeDelim("{}", body, here)
            ];
        }

        function makeVarDef(id, expr) {
            return [
                makeKeyword("var", here),
                makeIdent(id, here),
                makePunc("=", here)
            ].concat(expr, makePunc(";", here));
        }

        function makeAssign(id, expr) {
          return [
            makeIdent(id, here),
            makePunc("=", here)
          ].concat(expr, makePunc(";", here));
        }

        function cloneSyntax(stx) {
            var clone = _.extend({}, stx, { token: _.clone(stx.token) });
            if (clone.token.inner) {
                clone.token.inner = clone.token.inner.map(cloneSyntax);
            }
            return clone;
        }

        if (cases_stx.length == 0) {
            throw new Error("Must have at least one case")
        }

        var cases = [];

        for (var i = 0; i < cases_stx.length; i += 4) {
            var caseKwd = cases_stx[i];
            var isInfix = cases_stx[i + 1].token.value === "infix";
            if (isInfix) {
                i += 1;
            }
            var casePattern = cases_stx[i + 1];
            var caseArrow = cases_stx[i + 2];
            var caseBody = cases_stx[i + 3];

            if (!(caseKwd && caseKwd.token && caseKwd.token.value === "case")) {
                throw new Error("expecting case keyword in syntax case");
            }
            if (!(casePattern && casePattern.token && casePattern.token.value === "{}")) {
                throw new Error("expecting a pattern surrounded by {} in syntax case");
            }
            if (!(caseArrow && caseArrow.token && caseArrow.token.value === "=>")) {
                throw new Error("expecting an arrow separating pattern from body in syntax case");
            }
            if (!(caseBody && caseBody.token && caseBody.token.value === "{}")) {
                throw new Error("expecting a body surrounded by {} in syntax case");
            }

            var bodyStx = localExpand(caseBody.token.inner, quoteSyntax{syntax});

            function traverse(stx, f) {
                return stx.reduce(function(acc, stx) {
                    if (stx.token.inner) {
                        stx.token.inner = traverse(stx.token.inner, f);
                        return acc.concat(stx);
                    }
                    return acc.concat(f(stx));
                }, []);
            }
            bodyStx = traverse(bodyStx, function(stx) {
                // should be free-identifiers
                if (stx.token.value === "syntax") {
                    return quoteSyntax {bindSyntax match};
                }
                return stx;
            });

            // If infix, loop through the pattern separating the lhs and rhs.
            if (isInfix) {
                var pattern = cloneSyntax(casePattern).token.inner;
                var lhs = [];
                var rhs = [];
                var separator = null;
                for (var j = 0; j < pattern.length; j++) {
                    if (separator) {
                        rhs.push(pattern[j]);
                    } else {
                        if (pattern[j].token.type === parser.Token.Punctuator &&
                            pattern[j].token.value === '|') {
                            separator = pattern[j];
                        } else {
                            lhs.push(pattern[j]);
                        }
                    }
                }
                if (!separator) {
                    throwSyntaxError("syntaxCase", "Infix macros require a `|` separator", casePattern);
                }
                cases.push({
                    lookbehind: loadPattern(lhs, true),
                    pattern: loadPattern(rhs),
                    body: bodyStx
                });
            } else {
                cases.push({
                    lookbehind: [],
                    pattern: loadPattern(cloneSyntax(casePattern).token.inner),
                    body: bodyStx
                });
            }
        }

        function patternsToObject(pats) {
            if (!pats.length) {
                return makeDelim("[]", [], here);
            }

            var freshId = __fresh();
            context.patternMap.set(freshId, pats);

            return [
                makeIdent("getPattern", here),
                makeDelim("()", [
                    makeValue(freshId, here)
                ], here)
            ];
        }

        function makeMatch(caseObj) {
            var lhs = makeAssign("lhs", patternsToObject(caseObj.lookbehind));
            var rhs = makeAssign("rhs", patternsToObject(caseObj.pattern));

            var lhsMatch = makeAssign("lhsMatch", [
                makeIdent("patternModule", here),
                makePunc(".", here),
                makeIdent("matchLookbehind", here),
                makeDelim("()", [
                    makeIdent("lhs", here),
                    makePunc(",", here),
                    makeIdent("prevStx", here),
                    makePunc(",", here),
                    makeIdent("prevTerms", here),
                    makePunc(",", here),
                    makeIdent("context", here)
                ], here)
            ]);

            var rhsMatch = makeAssign("rhsMatch", [
                makeIdent("patternModule", here),
                makePunc(".", here),
                makeIdent("matchPatterns", here),
                makeDelim("()", [
                    makeIdent("rhs", here),
                    makePunc(",", here),
                    makeIdent("arg", here),
                    makePunc(",", here),
                    makeIdent("context", here),
                    makePunc(",", here),
                    makeValue(true, here)
                ], here)
            ]);

            var mergeMatch = [
                makeKeyword("var", here)
            ]
            var mergeMatch = makeAssign("match", [
                makeIdent("mergeMatches", here),
                makeDelim("()", [
                    makeIdent("rhsMatch", here),
                    makePunc(",", here),
                ].concat(
                    makeIdent("mergeMatches", here),
                    makeDelim("()", [
                        makeIdent("lhsMatch", here),
                        makePunc(",", here),
                        makeIdent("parentMatch", here)
                    ], here)
                ), here)
            ]);

            return lhs.concat(lhsMatch, [
                makeKeyword("if", here),
                makeDelim("()", [
                    makeIdent("lhsMatch", here),
                    makePunc(".", here),
                    makeIdent("success", here)
                ], here),
                makeDelim("{}", rhs.concat(rhsMatch, [
                    makeKeyword("if", here),
                    makeDelim("()", [
                        makeIdent("rhsMatch", here),
                        makePunc(".", here),
                        makeIdent("success", here)
                    ], here),
                    makeDelim("{}", mergeMatch.concat(makeTranscribe(caseObj)), here)
                ]), here)
            ]);
        }

        function makeTranscribe(caseObj) {
            // applyMarkToPatternEnv (context.mark, match.patternEnv);
            var applyPreMark1 = [
                makeIdent("applyMarkToPatternEnv", here),
                makeDelim("()", [
                    makeIdent("context", here),
                    makePunc(".", here),
                    makeIdent("useScope", here),
                    makePunc(",", here),
                    makeIdent("match", here),
                    makePunc(".", here),
                    makeIdent("patternEnv", here)
                ], here),
                makePunc(";", here)
            ];
            // applyMarkToPatternEnv (context.useScope, match.patternEnv);
            var applyPreMark2 = [
                makeIdent("applyMarkToPatternEnv", here),
                makeDelim("()", [
                    makeIdent("context", here),
                    makePunc(".", here),
                    makeIdent("mark", here),
                    makePunc(",", here),
                    makeIdent("match", here),
                    makePunc(".", here),
                    makeIdent("patternEnv", here)
                ], here),
                makePunc(";", here)
            ];
            // var res = (function() { <caseObj.body> })();
            var runBody = makeVarDef("res", [
                makeDelim("()", makeFunc([], caseObj.body), here),
                makeDelim("()", [], here)
            ]);
            // if (!Array.isArray(res)) { throwSyntaxError("macro", "Macro must return a syntax array", stx); }
            var errHandling = [
                makeKeyword("if", here),
                makeDelim("()", [
                    makePunc("!", here),
                    makeIdent("Array", here),
                    makePunc(".", here),
                    makeIdent("isArray", here),
                    makeDelim("()", [
                        makeIdent("res", here)
                    ], here)
                ], here),
                makeDelim("{}", [
                    makeIdent("throwSyntaxError", here),
                    makeDelim("()", [
                        makeValue("macro", here),
                        makePunc(",", here),
                        makeValue("Macro must return a syntax array", here),
                        makePunc(",", here),
                        makeIdent("stx", here)
                    ], here)
                ], here)
            ];
            // res = res.map(function(stx) { return stx.mark(context.mark); })
            var applyPostMark = [
                makeIdent("res", here),
                makePunc("=", here),
                makeIdent("res", here),
                makePunc(".", here),
                makeIdent("map", here),
                makeDelim("()", makeFunc([makeIdent("stx", here)], [
                        makeKeyword("return", here),
                        makeIdent("stx", here),
                        makePunc(".", here),
                        makeIdent("mark", here),
                        makeDelim("()", [
                            makeIdent("context", here),
                            makePunc(".", here),
                            makeIdent("mark", here)
                        ], here)
                ]), here),
                makePunc(";", here)
            ];
            // return { result: res, rest: match.rest };
            var retResult = [
                makeKeyword("return", here),
                makeDelim("{}", [
                    makeIdent("result", here), makePunc(":", here),
                    makeIdent("res", here),
                    makePunc(",", here),
                    makeIdent("rest", here), makePunc(":", here),
                    makeIdent("match", here), makePunc(".", here), makeIdent("rest", here),
                    makePunc(",", here),
                    makeIdent("prevStx", here), makePunc(":", here),
                    makeIdent("lhsMatch", here), makePunc(".", here), makeIdent("prevStx", here),
                    makePunc(",", here),
                    makeIdent("prevTerms", here), makePunc(":", here),
                    makeIdent("lhsMatch", here), makePunc(".", here), makeIdent("prevTerms", here)
                ], here)
            ];
            return applyPreMark1.concat(applyPreMark2, runBody, errHandling, applyPostMark, retResult);
        }

        var arg_def = makeVarDef("arg", [makeIdent("stx", here)]);
        var name_def = makeVarDef("here", [
            makeIdent("arg", here),
            makeDelim("[]", [makeValue(0, here)], here)
        ]);
        var match_defs = [
            makeKeyword('var', here),
            makeIdent('lhs', here), makePunc(',', here),
            makeIdent('lhsMatch', here), makePunc(',', here),
            makeIdent('rhs', here), makePunc(',', here),
            makeIdent('rhsMatch', here), makePunc(',', here),
            makeIdent('match', here), makePunc(',', here),
            makeIdent('res', here), makePunc(';', here),
        ];

        var body = arg_def.concat(name_def, match_defs);

        for (var i = 0; i < cases.length; i++) {
            body = body.concat(makeMatch(cases[i]));
        }

        body = body.concat(quoteSyntax {
            throwSyntaxCaseError("Could not match any cases");
        });

        var res = makeFunc([
            makeIdent("stx", here),
            makePunc(",", here),
            makeIdent("context", here),
            makePunc(",", here),
            makeIdent("prevStx", here),
            makePunc(",", here),
            makeIdent("prevTerms", here),
            makePunc(",", here),
            makeIdent("parentMatch", here)
        ], body).concat([
            makeDelim("()", arg_stx.concat([
                makePunc(",", here),
                makeKeyword("typeof", here),
                makeIdent("match", here),
                makePunc("!==", here),
                makeValue("undefined", here),
                makePunc("?", here),
                makeIdent("match", here),
                makePunc(":", here),
                makeDelim("{}", [], here)
            ]), here)
        ]);

        return {
            result: res,
            rest: stx.slice(3)
        }
    }
}

stxrec stxrec {
    function(st) {
        var name_stx = st[0];
        var here = quoteSyntax{here};
        var mac_name_stx;
        var body_inner_stx;
        var body_stx;
        var takeLine = patternModule.takeLine;
        var makeIdentityRule = patternModule.makeIdentityRule;
        var rest;

        if (st[1] && st[1].token.type === parser.Token.Delimiter &&
            st[1].token.value === "{}") {
            mac_name_stx = null;
            body_stx = st[1];
            body_inner_stx = st[1].token.inner;
            rest = st.slice(2);
        } else {
            mac_name_stx = [];
            mac_name_stx.push(st[1]);
            body_stx = st[2];
            body_inner_stx = st[2].token.inner;
            rest = st.slice(3);
        }

        function makeFunc(params, body) {
            return [
                makeKeyword("function", here),
                makeDelim("()", params, here),
                makeDelim("{}", body, here)
            ];
        }

        function translateRule(pattern, def, isInfix) {
            var translatedPatt;
            // When infix, we need to loop through the body and make sure there
            // is a separator to distinguish the lhs and rhs.
            if (isInfix) {
                translatedPatt = [];
                for (var i = 0, len = pattern.length; i < len; i++) {
                    translatedPatt.push(pattern[i]);
                    if (pattern[i].token.type === parser.Token.Punctuator &&
                        pattern[i].token.value === '|') {
                        translatedPatt.push(makeIdent("_", here));
                        translatedPatt = translatedPatt.concat([makeIdent("$", here),
                                                                makeDelim("()", pattern.slice(i + 1), here)]);
                        break;
                    }
                }
            } else {
                translatedPatt = [makeIdent("_", here),
                                  // wrapping the patterns in a group to disambiguate
                                  // `_ (foo) ...`
                                  // since the `(foo)` would be interpreted as a separator
                                  makeIdent("$", here),
                                  makeDelim("()", pattern, here)];
            }

            var translatedDef = [
                makeKeyword("return", here),
                takeLine(here[0], makeIdent("syntax", here)),
                makeDelim("{}", def, here)
            ];

            return [makeIdent("case", here)].concat(
                isInfix ? makeIdent("infix", here) : [],
                makeDelim("{}", translatedPatt, here),
                makePunc("=>", here),
                makeDelim("{}", translatedDef, here)
            );
        }

        if (body_inner_stx[0] && body_inner_stx[0].token.value === "function") {

            if (mac_name_stx) {
                var res = [makeIdent("stxrec", null)].concat(mac_name_stx).concat(body_stx)
                return {
                    result: res,
                    rest: rest
                };
            } else {
                var res = [
                    makeIdent("stxrec", null),
                    body_stx
                ];
                return {
                    result: res,
                    rest: rest
                };
            }

        }

        var rules = [];
        if (body_inner_stx[0] && body_inner_stx[0].token.value === "rule") {
            for (var i = 0; i < body_inner_stx.length; i += 4) {
                var isInfix = body_inner_stx[i + 1].token.value === 'infix';
                if (isInfix) {
                    i += 1;
                }

                var rule_pattern = body_inner_stx[i + 1];
                var rule_arrow = body_inner_stx[i + 2];
                var rule_def = body_inner_stx[i + 3];

                if (rule_pattern && rule_arrow && rule_arrow.token.value === "=>" && rule_def) {
                    rules = rules.concat(translateRule(rule_pattern.token.inner,
                                                       rule_def.token.inner,
                                                       isInfix));
                } else if (rule_pattern) {
                    var idRule = makeIdentityRule(rule_pattern.token.inner, isInfix, rule_pattern);
                    rules = rules.concat(translateRule(idRule.pattern, idRule.body, isInfix));
                    i -= 2;
                } else {
                  throwSyntaxError("macro", "Macro `macro` could not be matched" , rule_arrow);
                }
            }
            rules = makeDelim("{}", rules, here);

        } else {
            rules = body_stx;
        }

        var stxSyntaxCase = takeLine(here[0], makeIdent("syntaxCase", here));
        var res = mac_name_stx
            ? [makeIdent("stxrec", null)].concat(mac_name_stx)
            : [makeIdent("stxrec", null)];
        res = res.concat(makeDelim("{}", makeFunc([makeIdent("st", here),
                                                   makePunc(",", here),
                                                   makeIdent("context", here),
                                                   makePunc(",", here),
                                                   makeIdent("prevStx", here),
                                                   makePunc(",", here),
                                                   makeIdent("prevTerms", here)],
                                                   [makeKeyword("return", here),
                                                    stxSyntaxCase,
                                                    makeDelim("()", [makeIdent("st", here),
                                                                     makePunc(",", here),
                                                                     makeIdent("context", here),
                                                                     makePunc(",", here),
                                                                     makeIdent("prevStx", here),
                                                                     makePunc(",", here),
                                                                     makeIdent("prevTerms", here)], here),
                                                    rules]),
                                    here));


        return {
            result: res,
            rest: rest
        }
    }
}

// stx let {
//     rule { $name = macro { $body ...} } => {
//         stx $name { $body ... }
//     }
//     rule { $else ... } => { let $else ...}
// }
//
// stx macro {
//     rule { $name { $body ...} } => {
//         stxrec $name { $body ... }
//     }
// }



stxrec withSyntax_done {
    case { _ $ctx ($vars ...) {$rest ...} } => {
        var ctx = #{ $ctx };
        var here = #{ here };
        var vars = #{ $vars ... };
        var rest = #{ $rest ... };

        var res = [];

        for (var i = 0; i < vars.length; i += 3) {
            var name = vars[i];
            var repeat = !!vars[i + 1].token.inner.length;
            var rhs = vars[i + 2];

            if (repeat) {
                res.push(
                    makeIdent('match', ctx),
                    makePunc('.', here),
                    makeIdent('patternEnv', here),
                    makeDelim('[]', [makeValue(name.token.value, here)], here),
                    makePunc('=', here),
                    makeDelim('{}', [
                        makeIdent('level', here), makePunc(':', here), makeValue(1, here), makePunc(',', here),
                        makeIdent('match', here), makePunc(':', here), makeDelim('()', #{
                            (function(exp) {
                                return exp.length
                                    ? exp.map(function(t) { return { level: 0, match: [t] } })
                                    : [{ level: 0, match: [] }];
                            })
                        }, here), makeDelim('()', [rhs], here)
                    ], here),
                    makePunc(';', here)
                );
            } else {
                res.push(
                    makeIdent('match', ctx),
                    makePunc('.', here),
                    makeIdent('patternEnv', here),
                    makeDelim('[]', [makeValue(name.token.value, here)], here),
                    makePunc('=', here),
                    makeDelim('{}', [
                        makeIdent('level', here), makePunc(':', here), makeValue(0, here), makePunc(',', here),
                        makeIdent('match', here), makePunc(':', here), rhs
                    ], here),
                    makePunc(';', here)
                );
            }
        }

        res = res.concat(rest);
        res = [
            makeDelim("()", [
                makeKeyword("function", here),
                makeDelim("()", [makeIdent("match", ctx)], here),
                makeDelim("{}", res, here)
            ], here),
            makeDelim("()", [
                makeIdent("patternModule", here),
                makePunc(".", here),
                makeIdent("cloneMatch", here),
                makeDelim("()", [makeIdent("match", ctx)], here)
            ], here)
        ];

        return res;
    }
}

stxrec withSyntax_bind {
    rule { $name:ident $[...] = $rhs:expr } => {
        $name (true) $rhs
    }
    rule { $name:ident = $rhs:expr } => {
        $name () $rhs
    }
}

stxnonrec withSyntax {
    case { $name ($binders:withSyntax_bind (,) ...) { $body ... } } => {
        return #{
            withSyntax_done $name ($binders ...) { $body ... }
        }
    }
    case { $name ($binders:withSyntax_bind (,) ...) $quote:[#] { $body ... } } => {
        return #{
            withSyntax_done $name ($binders ...) {
                return $quote { $body ... }
            }
        }
    }
}

stxrec letstx_bind {
    rule { $name:ident = $rhs:expr , $more:letstx_bind } => {
        $name () $rhs $more
    }
    rule { $name:ident = $rhs:expr ;... letstx $more:letstx_bind } => {
        $name () $rhs $more
    }
    rule { $name:ident = $rhs:expr ;... } => {
        $name () $rhs
    }
    rule { $name:ident $[...] = $rhs:expr , $more:letstx_bind } => {
        $name (true) $rhs $more
    }
    rule { $name:ident $[...] = $rhs:expr ;... letstx $more:letstx_bind } => {
        $name (true) $rhs $more
    }
    rule { $name:ident $[...] = $rhs:expr ;... } => {
        $name (true) $rhs
    }
}

stxnonrec letstx {
    case { $name $binders:letstx_bind $rest ... } => {
        return #{
            return withSyntax_done $name ($binders) { $rest ... }
        }
    }
}


stxrec macroclass {
    rule { $name:ident { $decls:macroclass_decl ... } } => {
        stxrec $name {
            function (stx, context, prevStx, prevTerms) {
                var name_stx = stx[0];
                var match;
                macroclass_create $name stx context match ($decls ...)
            }
        }
    }
}

stxrec macroclass_decl {
    rule { $kw:[name] = $name:lit ;... } => {
        ($kw $name)
    }
    rule { $kw:[pattern] { $mods:macroclass_modifier ... } ;... } => {
        ($kw $mods ...)
    }
    rule { rule { $rule ... } ;... } => {
        (pattern (rule ($rule ...)))
    }
}

stxrec macroclass_modifier {
    rule { $kw:[name] = $name:lit ;... } => {
        ($kw $name)
    }
    rule { $kw:[rule] { $rule ... } ;... } => {
        ($kw ($rule ...))
    }
    rule { $kw:[with] $($lhs:macroclass_with_lhs = $rhs:macroclass_with_rhs) (,) ... } => {
        $(($kw ($lhs) ($rhs))) ...
    }
    rule { ; ;... } => { }
}

stxrec macroclass_with_lhs {
    rule { $name:ident $[...] }
    rule { $name:ident }
}

stxrec macroclass_with_rhs {
    rule { #{ $stx ... } }
    rule { $code:expr }
}

stxrec macroclass_create {
    function(stx, context, prevStx, prevTerms) {
        var here = quoteSyntax { here };
        var macName = stx[0];
        var nameStx = stx[1];
        var stxName = stx[2];
        var ctxName = stx[3];
        var matchName = stx[4];
        var decls = stx[5].token.inner;
        var mclass = decls.reduce(function(m, decl) {
            var tag = unwrapSyntax(decl.token.inner[0]);
            if (tag === 'name') {
                if (m.name) {
                    throwSyntaxError('macroclass',
                                     'Duplicate name declaration',
                                     decl.token.inner[0])
                }
                m.name = unwrapSyntax(decl.token.inner[1]);
            } else if (tag === 'pattern') {
                var patternStx = decl.token.inner.slice(1);
                var pattern = patternStx.reduce(function(p, mod) {
                    var tag = unwrapSyntax(mod.token.inner[0]);
                    if (tag === 'name') {
                        if (p.name) {
                            throwSyntaxError('macroclass',
                                             'Duplicate name declaration',
                                             mod.token.inner[0])
                        }
                        p.name = unwrapSyntax(mod.token.inner[1]);
                    } else if (tag === 'rule') {
                        if (p.rule) {
                            throwSyntaxError('macroclass',
                                             'Duplicate rule declaration',
                                             mod.token.inner[0])
                        }
                        p.rule = mod.token.inner[1].token.inner;
                    } else if (tag === 'with') {
                        p.withs.push({
                            lhs: mod.token.inner[1].token.inner,
                            rhs: mod.token.inner[2].token.inner.map(function mapper(s) {
                                // We need to transplant syntax quotes so that it looks
                                // like they are within the macro body code and not
                                // the original code, otherwise it won't expand.
                                if (unwrapSyntax(s) === '#') {
                                    s.context = macName.context;
                                } else if (s.token.type === parser.Token.Delimiter) {
                                    s.token.inner = s.token.inner.map(mapper);
                                }
                                return s;
                            })
                        });
                    }
                    return p;
                }, { withs: [] });
                m.patterns.push(pattern);
            }
            return m;
        }, { patterns: [] });

        var body = mclass.patterns.reduce(function(stx, pattern) {
            var ruleStx = [makeIdent('_', here)].concat(pattern.rule);
            var ruleId = __fresh();
            var rule = patternModule.loadPattern(ruleStx);

            context.patternMap.set(ruleId, rule);

            var withBindings = pattern.withs.reduce(function(acc, w) {
                return acc.concat(w.lhs.concat(makePunc('=', here), w.rhs, makePunc(',', here)));
            }, []);

            var ret = [
                makeKeyword('return', here), makeDelim('{}', [
                    makeIdent('result', here), makePunc(':', here), makeDelim('[]', [], here),
                    makePunc(',', here),
                    makeIdent('rest', here), makePunc(':', here),
                    matchName, makePunc('.', here), makeIdent('rest', here),
                    makePunc(',', here),
                    makeIdent('patterns', here), makePunc(':', here),
                    matchName, makePunc('.', here), makeIdent('patternEnv', here),
                ], here)
            ];

            var inner = ret;
            if (withBindings.length) {
                inner = [
                    makeKeyword('return', macName), makeIdent('withSyntax', macName),
                    makeDelim('()', withBindings, here),
                    makeDelim('{}', ret, here)
                ];
            }

            var res = [
                matchName, makePunc('=', here),
                makeIdent('patternModule', here), makePunc('.', here),
                makeIdent('matchPatterns', here), makeDelim('()', [
                    makeIdent('getPattern', here), makeDelim('()', [
                        makeValue(ruleId, here)
                    ], here),
                    makePunc(',', here), stxName,
                    makePunc(',', here), ctxName,
                    makePunc(',', here), makeValue(true, here)
                ], here),
                makePunc(';', here),
                makeKeyword('if', here), makeDelim('()', [
                    matchName, makePunc('.', here), makeIdent('success', here)
                ], here), makeDelim('{}', inner, here)
            ];

            return stx.concat(res);

        }, []);

        var res = body.concat(
            makeIdent('throwSyntaxCaseError', here),
            makeDelim('()', [
                makeValue(mclass.name || unwrapSyntax(nameStx), here), makePunc(',', here),
                makeValue('No match', here)
            ], here)
        );

        return {
            result: res,
            rest: stx.slice(6)
        };
    }
}


// stxrec safemacro {
//     rule { $name:ident { rule $body ... } } => {
//         let $name = macro {
//             rule { : } => { $name : }
//             rule infix { . | } => { . $name }
//             rule $body ...
//         }
//     }
//     rule { $name:ident { case $body ... } } => {
//         let $name = macro {
//             case { _ : } => { return #{ $name : } }
//             case infix { . | _ } => { return #{ . $name } }
//             case $body ...
//         }
//     }
// }

stxrec op_assoc {
    rule { left }
    rule { right }
}

stxrec op_name {
    rule { ($name ...) }
    rule { $name } => { ($name) }
}

stxnonrec operator {
    rule {
        $name:op_name $prec:lit $assoc:op_assoc
        { $left:ident, $right:ident } => #{ $body ... }
    } => {
        binaryop $name $prec $assoc {
            stxrec _ {
                rule { ($left:expr) ($right:expr) } => { $body ... }
            }
        }
    }
    rule {
        $name:op_name $prec:lit { $op:ident } => #{ $body ... }
    } => {
        unaryop $name $prec {
            stxrec _ {
                rule { $op:expr } => { $body ... }
            }
        }
    }
}


export {
    quoteSyntax,
    syntax,
    #,
    syntaxCase,
    // macro,
    // let,
    stxnonrec,
    stxrec,
    withSyntax,
    letstx,
    macroclass,
    operator,
};
