let quoteSyntax = macro {
    function(stx) {
        var name_stx = stx[0];

        var res = [
            makeIdent("#quoteSyntax", null),
            stx[1].expose()
        ];

        return {
            result: res,
            rest: stx.slice(2)
        };
    }
}
export quoteSyntax

let syntax = macro {
    function(stx) {
        var name_stx = stx[0];
        var here = quoteSyntax{here};
        var takeLineContext = patternModule.takeLineContext;
        var takeLine = patternModule.takeLine;
        var mod = makeIdent("patternModule", here);

        var res = [mod,
                   makePunc(".", here),
                   makeIdent("transcribe", here),
                   makeDelim("()", [
                       makeIdent("#quoteSyntax", here),
                       stx[1].expose(),
                       makePunc(",", here),
                       // breaking hygiene to capture `name_stx`, `match`, and
                       // `patternEnv` inside the syntaxCase macro
                       makeIdent("name_stx", name_stx),
                       makePunc(",", here),
                       makeIdent("match", name_stx),
                       makePunc(".", here),
                       makeIdent("patternEnv", name_stx)
                   ], here)];
                   
        
        return {
            result: res,
            rest: stx.slice(2)
        };
    }
}
export syntax

macro # {
    function (stx) {
        return {
            // breaking hygiene to capture inside syntaxCase
            result: [makeIdent("syntax", stx[0]),
                     stx[1]],
            rest: stx.slice(2)
        }
    }
}
export #


let syntaxCase = macro {
    function(stx) {
        var name_stx = stx[0];
        var arg_stx = stx[1].expose().token.inner;
        var cases_stx = stx[2].expose().token.inner;
        var here = quoteSyntax{here};

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
                makeIdent(id, name_stx),
                makePunc("=", here)
            ].concat(expr, makePunc(";", here));
        }

        function makeAssign(id, expr) {
          return [
            makeIdent(id, name_stx),
            makePunc("=", here)
          ].concat(expr, makePunc(";", here));
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

            // If infix, loop through the pattern separating the lhs and rhs.
            if (isInfix) {
                var pattern = casePattern.token.inner;
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
                    body: caseBody.expose().token.inner
                });
            } else {
                cases.push({
                    lookbehind: [],
                    pattern: loadPattern(casePattern.token.inner),
                    body: caseBody.expose().token.inner
                });
            }
        }

        function patternToObject(pat) {
            var res = [
                makeIdent("value", here),
                makePunc(":", here),
                makeValue(pat.token.value, here)
            ];
            if (pat.token.type === Token.Delimiter) {
                res = res.concat([
                    makePunc(",", here),
                    makeIdent("inner", here),
                    makePunc(":", here),
                    patternsToObject(pat.token.inner)
                ]);
            }
            if (typeof pat.class !== 'undefined') {
                res = res.concat([
                    makePunc(",", here),
                    makeIdent("class", here),
                    makePunc(":", here),
                    makeValue(pat.class, here)
                ]);
            }
            if (typeof pat.repeat !== 'undefined') {
                res = res.concat([
                    makePunc(",", here),
                    makeIdent("repeat", here),
                    makePunc(":", here),
                    makeValue(pat.repeat, here)
                ]);
            }
            if (typeof pat.separator !== 'undefined') {
                res = res.concat([
                    makePunc(",", here),
                    makeIdent("separator", here),
                    makePunc(":", here),
                    makeValue(pat.separator, here)
                ]);
            }
            if (typeof pat.leading !== 'undefined') {
                res = res.concat([
                    makePunc(",", here),
                    makeIdent("leading", here),
                    makePunc(":", here),
                    makeValue(pat.leading, here)
                ]);
            }

            return makeDelim("{}", res, here);
        }

        function patternsToObject(pats) {
            var res = [];
            for (var i = 0; i < pats.length; i++) {
                if (i !== 0) {
                    res.push(makePunc(",", here));
                }
                res.push(patternToObject(pats[i]));
            }
            return makeDelim("[]", res, here);
        }

        function makeMatch(caseObj) {
            var lhs = makeAssign("lhs", [patternsToObject(caseObj.lookbehind)]);
            var rhs = makeAssign("rhs", [patternsToObject(caseObj.pattern)]);

            var lhsMatch = makeAssign("lhsMatch", [
                makeIdent("patternModule", here),
                makePunc(".", here),
                makeIdent("matchLookbehind", here),
                makeDelim("()", [
                    makeIdent("lhs", name_stx),
                    makePunc(",", here),
                    makeIdent("prevStx", name_stx),
                    makePunc(",", here),
                    makeIdent("prevTerms", name_stx),
                    makePunc(",", here),
                    makeIdent("context", name_stx), makePunc(".", here), makeIdent("env", name_stx)
                ], here)
            ]);

            var rhsMatch = makeAssign("rhsMatch", [
                makeIdent("patternModule", here),
                makePunc(".", here),
                makeIdent("matchPatterns", here),
                makeDelim("()", [
                    makeIdent("rhs", name_stx),
                    makePunc(",", here),
                    makeIdent("arg", name_stx),
                    makePunc(",", here),
                    makeIdent("context", name_stx), makePunc(".", here), makeIdent("env", name_stx),
                    makePunc(",", here),
                    makeValue(true, here)
                ], here)
            ]);

            var mergeMatch = makeAssign("match", [
                makeIdent("mergeMatches", here),
                makeDelim("()", [
                    makeIdent("rhsMatch", name_stx),
                    makePunc(",", here),
                ].concat(
                    makeIdent("mergeMatches", here),
                    makeDelim("()", [
                        makeIdent("lhsMatch", name_stx),
                        makePunc(",", here),
                        makeIdent("parentMatch", name_stx)
                    ], here)
                ), here)
            ]);

            return lhs.concat(lhsMatch, [
                makeKeyword("if", here),
                makeDelim("()", [
                    makeIdent("lhsMatch", name_stx),
                    makePunc(".", here),
                    makeIdent("success", here)
                ], here),
                makeDelim("{}", rhs.concat(rhsMatch, [
                    makeKeyword("if", here),
                    makeDelim("()", [
                        makeIdent("rhsMatch", name_stx),
                        makePunc(".", here),
                        makeIdent("success", here)
                    ], here),
                    makeDelim("{}", mergeMatch.concat(makeTranscribe(caseObj)), here)
                ]), here)
            ]);
        }

        function makeTranscribe(caseObj) {
            // applyMarkToPatternEnv (context.mark, match.patternEnv);
            var applyPreMark = [
                makeIdent("applyMarkToPatternEnv", here),
                makeDelim("()", [
                    makeIdent("context", name_stx),
                    makePunc(".", here),
                    makeIdent("mark", name_stx),
                    makePunc(",", here),
                    makeIdent("match", name_stx),
                    makePunc(".", here),
                    makeIdent("patternEnv", name_stx)
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
                        makeIdent("res", name_stx)
                    ], here)
                ], here),
                makeDelim("{}", [
                    makeIdent("throwSyntaxError", here),
                    makeDelim("()", [
                        makeValue("macro", here),
                        makePunc(",", here),
                        makeValue("Macro must return a syntax array", here),
                        makePunc(",", here),
                        makeIdent("stx", name_stx)
                    ], here)
                ], here)
            ];
            // res = res.map(function(stx) { return stx.mark(context.mark); })
            var applyPostMark = [
                makeIdent("res", name_stx),
                makePunc("=", here),
                makeIdent("res", name_stx),
                makePunc(".", here),
                makeIdent("map", here),
                makeDelim("()", makeFunc([makeIdent("stx", here)], [
                        makeKeyword("return", here),
                        makeIdent("stx", here),
                        makePunc(".", here),
                        makeIdent("mark", here),
                        makeDelim("()", [
                            makeIdent("context", name_stx),
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
                    makeIdent("res", name_stx),
                    makePunc(",", here),
                    makeIdent("rest", here), makePunc(":", here),
                    makeIdent("match", name_stx), makePunc(".", here), makeIdent("rest", here),
                    makePunc(",", here),
                    makeIdent("prevStx", here), makePunc(":", here),
                    makeIdent("lhsMatch", name_stx), makePunc(".", here), makeIdent("prevStx", here),
                    makePunc(",", here),
                    makeIdent("prevTerms", here), makePunc(":", here),
                    makeIdent("lhsMatch", name_stx), makePunc(".", here), makeIdent("prevTerms", here)
                ], here)
            ];
            return applyPreMark.concat(runBody, errHandling, applyPostMark, retResult);
        }

        var arg_def = makeVarDef("arg", [makeIdent("stx", name_stx)]);
        var name_def = makeVarDef("name_stx", [
            makeIdent("arg", name_stx),
            makeDelim("[]", [makeValue(0, here)], here)
        ]);
        var match_defs = [
            makeKeyword('var', here),
            makeIdent('lhs', name_stx), makePunc(',', here),
            makeIdent('lhsMatch', name_stx), makePunc(',', here),
            makeIdent('rhs', name_stx), makePunc(',', here),
            makeIdent('rhsMatch', name_stx), makePunc(',', here),
            makeIdent('match', name_stx), makePunc(',', here),
            makeIdent('res', name_stx), makePunc(';', here),
        ];

        var body = arg_def.concat(name_def, match_defs);

        for (var i = 0; i < cases.length; i++) {
            body = body.concat(makeMatch(cases[i]));
        }

        body = body.concat(quoteSyntax {
            function SyntaxCaseError(msg) {
                this.type = "SyntaxCaseError";
                this.msg = msg;
            }
            throw new SyntaxCaseError("Could not match any cases");
        });

        var res = makeFunc([
            makeIdent("stx", name_stx),
            makePunc(",", here),
            makeIdent("context", name_stx),
            makePunc(",", here),
            makeIdent("prevStx", name_stx),
            makePunc(",", here),
            makeIdent("prevTerms", name_stx),
            makePunc(",", here),
            makeIdent("parentMatch", name_stx)
        ], body).concat([
            makeDelim("()", arg_stx.concat([
                makePunc(",", here),
                makeKeyword("typeof", here),
                makeIdent("match", name_stx),
                makePunc("!==", here),
                makeValue("undefined", here),
                makePunc("?", here),
                makeIdent("match", name_stx),
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
export syntaxCase


let macro = macro {
    function(stx) {
        var name_stx = stx[0];
        var here = quoteSyntax{here};
        var mac_name_stx;
        var body_stx;
        var takeLine = patternModule.takeLine;
        
        if (stx[1].token.inner) {
            mac_name_stx = null;
            body_stx = stx[1].expose().token.inner;
        } else {
            mac_name_stx = stx[1];
            body_stx = stx[2].expose().token.inner;
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
                    }
                }
            } else {
                translatedPatt = [makeIdent("_", here)].concat(pattern);
            }

            var translatedDef = [
                makeKeyword("return", here),
                takeLine(here[0], makeIdent("syntax", name_stx)),
                makeDelim("{}", def, here)
            ];

            return [makeIdent("case", here)].concat(
                isInfix ? makeIdent("infix", here) : [],
                makeDelim("{}", translatedPatt, here),
                makePunc("=>", here),
                makeDelim("{}", translatedDef, here)
            );
        }

        if (body_stx[0] && body_stx[0].token.value === "function") {

            if (mac_name_stx) {
                var res = [
                    makeIdent("macro", here),
                    mac_name_stx,
                    stx[2]
                ];
                return {
                    result: res,
                    rest: stx.slice(3)
                };
            } else {
                var res = [
                    makeIdent("macro", here),
                    stx[2]
                ];
                return {
                    result: res,
                    rest: stx.slice(2)
                };
            }

        }

        var rules = [];
        if (body_stx[0] && body_stx[0].token.value === "rule") {
            var rule_body = mac_name_stx ? stx[2].token.inner : stx[1].token.inner;
            var rules = [];
            for (var i = 0; i < rule_body.length; i += 4) {
                var isInfix = rule_body[i + 1].token.value === 'infix';
                if (isInfix) {
                    i += 1;
                }
                var rule_pattern = rule_body[i + 1].token.inner;
                var rule_def = rule_body[i + 3].expose().token.inner;
                rules = rules.concat(translateRule(rule_pattern, rule_def, isInfix));
            }
            rules = makeDelim("{}", rules, here);

        } else {
            rules = mac_name_stx ? stx[2] : stx[1]; 
        }
        
        var stxSyntaxCase = takeLine(here[0], makeIdent("syntaxCase", name_stx));
        var rest = mac_name_stx ? stx.slice(3) : stx.slice(2);
        var res = mac_name_stx
            ? [makeIdent("macro", here), mac_name_stx]
            : [makeIdent("macro", here)];
        res = res.concat(makeDelim("{}", makeFunc([makeIdent("stx", name_stx),
                                                   makePunc(",", here),
                                                   makeIdent("context", name_stx),
                                                   makePunc(",", here),
                                                   makeIdent("prevStx", name_stx),
                                                   makePunc(",", here),
                                                   makeIdent("prevTerms", name_stx)],
                                                   [makeKeyword("return", here),
                                                    stxSyntaxCase,
                                                    makeDelim("()", [makeIdent("stx", name_stx),
                                                                     makePunc(",", here),
                                                                     makeIdent("context", name_stx),
                                                                     makePunc(",", here),
                                                                     makeIdent("prevStx", name_stx),
                                                                     makePunc(",", here),
                                                                     makeIdent("prevTerms", name_stx)], here),
                                                    rules]),
                                    here));


        return {
            result: res,
            rest: rest
        }
    }
}
export macro;

macro withSyntax_unzip {
    case { _ $name ($ps ...) ($es ...) ($p = $e:expr , $rest ...) $body } => {
        return #{
            withSyntax_unzip $name ($ps ... ($p)) ($es ... ($e)) ($rest ...) $body
        };
    }
    case { _ $name ($ps ...) ($es ...) ($p = $e:expr) $body } => {
        return #{
            withSyntax_unzip $name ($ps ... ($p)) ($es ... ($e)) () $body
        };
    }
    case { _ $name ($ps ...) ($es ...) ($p $punc = $e:expr , $rest ...) $body } => {
        var punc = #{$punc};
        if (punc[0].token.type !== parser.Token.Punctuator ||
            punc[0].token.value !== "...") {
            throwSyntaxError("withSyntax", "Unexpected token", punc);
        }
        return #{
            withSyntax_unzip $name ($ps ... ($p $punc)) ($es ... ($e)) ($rest ...) $body
        };
    }
    case { _ $name ($ps ...) ($es ...) ($p $punc = $e:expr) $body } => {
        var punc = #{$punc};
        if (punc[0].token.type !== parser.Token.Punctuator ||
            punc[0].token.value !== "...") {
            throwSyntaxError("withSyntax", "Unexpected token", punc);
        }
        return #{
            withSyntax_unzip $name ($ps ... ($p $punc)) ($es ... ($e)) () $body
        };
    }
    case { _ $name ($ps ...) ($es ...) () $body } => {
        var name = #{$name};
        var here = #{here};

        var args = #{[$(makeDelim("()", $es, null)) (,) ...],};
        // since withSyntax runs within a macro invocation
        // it needs to make it's own mark rather than reuse the calling
        // macro mark
        // (_.defaults({mark: fresh()}, context))
        var withContext = [
            makeDelim("()", [
                makeIdent("_", here),
                makePunc(".", here),
                makeIdent("defaults", here),
                makeDelim("()", [
                    makeDelim("{}", [
                        makeIdent("mark", here),
                        makePunc(":", here),
                        makeIdent("__fresh", here),
                        makeDelim("()", [], here)
                    ], here),
                    makePunc(",", here),
                    makeIdent("context", name)
                ], here)     
            ], here),
            makePunc(",", here),
            makeIdent("prevStx", name),
            makePunc(",", here),
            makeIdent("prevTerms", name)
        ];
        args = args.concat(withContext);

        var res = [makeIdent("syntaxCase", name)];
        res = res.concat(makeDelim("()", args, here));
        res = res.concat(#{
            { case { $ps ... } => $body }
        });

        return [makeDelim("()", res, here),
                makePunc(".", here),
                makeIdent("result", here)];
    }
}

let withSyntax = macro {
    case { $name ($vars ...) {$body ...} } => {
        return #{
            withSyntax_unzip $name () () ($vars ...) {$body ...}
        }
    }
}

export withSyntax;

let letstx = macro {
    case {$letname $($pat ... = $e:expr) (,) ...; $rest ...} => {
        // need to capture the lexical context
        return withSyntax($withSyntax_name = [makeIdent("withSyntax", #{$letname})]) {
            return #{
                return $withSyntax_name ($($pat ... = $e) (,) ...) {
                    $rest ...
                }
            }
        }
    }
}
export letstx;
