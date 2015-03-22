"use strict";

var _9280 = require("underscore"),
    parser9281 = require("./parser"),
    expander9282 = require("./expander"),
    syntax9283 = require("./syntax"),
    assert9284 = require("assert");
var get_expression9285 = expander9282.get_expression;
var syntaxFromToken9286 = syntax9283.syntaxFromToken;
var makePunc9287 = syntax9283.makePunc;
var makeIdent9288 = syntax9283.makeIdent;
var makeDelim9289 = syntax9283.makeDelim;
var joinSyntax9290 = syntax9283.joinSyntax;
var joinSyntaxArray9291 = syntax9283.joinSyntaxArray;
var cloneSyntax9292 = syntax9283.cloneSyntax;
var cloneSyntaxArray9293 = syntax9283.cloneSyntaxArray;
var throwSyntaxError9294 = syntax9283.throwSyntaxError;
var push9295 = Array.prototype.push;
function freeVarsInPattern9296(pattern9321) {
    var fv9322 = [];
    _9280.each(pattern9321, function (pat9323) {
        if (isPatternVar9300(pat9323)) {
            fv9322.push(pat9323.token.value);
        } else if (pat9323.token.type === parser9281.Token.Delimiter) {
            push9295.apply(fv9322, freeVarsInPattern9296(pat9323.token.inner));
        }
    });
    return fv9322;
}
function typeIsLiteral9297(type9324) {
    return type9324 === parser9281.Token.NullLiteral || type9324 === parser9281.Token.NumericLiteral || type9324 === parser9281.Token.StringLiteral || type9324 === parser9281.Token.RegexLiteral || type9324 === parser9281.Token.BooleanLiteral;
}
function containsPatternVar9298(patterns9325) {
    return _9280.any(patterns9325, function (pat9326) {
        if (pat9326.token.type === parser9281.Token.Delimiter) {
            return containsPatternVar9298(pat9326.token.inner);
        }
        return isPatternVar9300(pat9326);
    });
}
function delimIsSeparator9299(delim9327) {
    return delim9327 && delim9327.token && delim9327.token.type === parser9281.Token.Delimiter && delim9327.token.value === "()" && delim9327.token.inner.length === 1 && delim9327.token.inner[0].token.type !== parser9281.Token.Delimiter && !containsPatternVar9298(delim9327.token.inner);
}
function isPatternVar9300(stx9328) {
    return stx9328.token.value[0] === "$" && stx9328.token.value !== "$";
}
function joinRepeatedMatch9301(tojoin9329, punc9330) {
    return _9280.reduce(_9280.rest(tojoin9329, 1), function (acc9331, join9332) {
        if (punc9330 === " ") {
            return acc9331.concat(cloneSyntaxArray9293(join9332.match));
        }
        return acc9331.concat(cloneSyntax9292(punc9330), cloneSyntaxArray9293(join9332.match));
    }, cloneSyntaxArray9293(_9280.first(tojoin9329).match));
}
function takeLineContext9302(from9333, to9334) {
    return _9280.map(to9334, function (stx9335) {
        return takeLine9303(from9333, stx9335);
    });
}
function takeLine9303(from9336, to9337) {
    var next9338;
    if (to9337.token.type === parser9281.Token.Delimiter) {
        var sm_startLineNumber9339 = typeof to9337.token.sm_startLineNumber !== "undefined" ? to9337.token.sm_startLineNumber : to9337.token.startLineNumber;
        var sm_endLineNumber9340 = typeof to9337.token.sm_endLineNumber !== "undefined" ? to9337.token.sm_endLineNumber : to9337.token.endLineNumber;
        var sm_startLineStart9341 = typeof to9337.token.sm_startLineStart !== "undefined" ? to9337.token.sm_startLineStart : to9337.token.startLineStart;
        var sm_endLineStart9342 = typeof to9337.token.sm_endLineStart !== "undefined" ? to9337.token.sm_endLineStart : to9337.token.endLineStart;
        var sm_startRange9343 = typeof to9337.token.sm_startRange !== "undefined" ? to9337.token.sm_startRange : to9337.token.startRange;
        var sm_endRange9344 = typeof to9337.token.sm_endRange !== "undefined" ? to9337.token.sm_endRange : to9337.token.endRange;
        if (from9336.token.type === parser9281.Token.Delimiter) {
            next9338 = syntaxFromToken9286({
                type: parser9281.Token.Delimiter,
                value: to9337.token.value,
                inner: takeLineContext9302(from9336, to9337.token.inner),
                startRange: from9336.token.startRange,
                endRange: from9336.token.endRange,
                startLineNumber: from9336.token.startLineNumber,
                startLineStart: from9336.token.startLineStart,
                endLineNumber: from9336.token.endLineNumber,
                endLineStart: from9336.token.endLineStart,
                sm_startLineNumber: sm_startLineNumber9339,
                sm_endLineNumber: sm_endLineNumber9340,
                sm_startLineStart: sm_startLineStart9341,
                sm_endLineStart: sm_endLineStart9342,
                sm_startRange: sm_startRange9343,
                sm_endRange: sm_endRange9344
            }, to9337);
        } else {
            next9338 = syntaxFromToken9286({
                type: parser9281.Token.Delimiter,
                value: to9337.token.value,
                inner: takeLineContext9302(from9336, to9337.token.inner),
                startRange: from9336.token.range,
                endRange: from9336.token.range,
                startLineNumber: from9336.token.lineNumber,
                startLineStart: from9336.token.lineStart,
                endLineNumber: from9336.token.lineNumber,
                endLineStart: from9336.token.lineStart,
                sm_startLineNumber: sm_startLineNumber9339,
                sm_endLineNumber: sm_endLineNumber9340,
                sm_startLineStart: sm_startLineStart9341,
                sm_endLineStart: sm_endLineStart9342,
                sm_startRange: sm_startRange9343,
                sm_endRange: sm_endRange9344
            }, to9337);
        }
    } else {
        var sm_lineNumber9345 = typeof to9337.token.sm_lineNumber !== "undefined" ? to9337.token.sm_lineNumber : to9337.token.lineNumber;
        var sm_lineStart9346 = typeof to9337.token.sm_lineStart !== "undefined" ? to9337.token.sm_lineStart : to9337.token.lineStart;
        var sm_range9347 = typeof to9337.token.sm_range !== "undefined" ? to9337.token.sm_range : to9337.token.range;
        if (from9336.token.type === parser9281.Token.Delimiter) {
            next9338 = syntaxFromToken9286({
                value: to9337.token.value,
                type: to9337.token.type,
                lineNumber: from9336.token.startLineNumber,
                lineStart: from9336.token.startLineStart,
                range: from9336.token.startRange,
                sm_lineNumber: sm_lineNumber9345,
                sm_lineStart: sm_lineStart9346,
                sm_range: sm_range9347
            }, to9337);
        } else {
            next9338 = syntaxFromToken9286({
                value: to9337.token.value,
                type: to9337.token.type,
                lineNumber: from9336.token.lineNumber,
                lineStart: from9336.token.lineStart,
                range: from9336.token.range,
                sm_lineNumber: sm_lineNumber9345,
                sm_lineStart: sm_lineStart9346,
                sm_range: sm_range9347
            }, to9337);
        }
    }
    if (to9337.token.leadingComments) {
        next9338.token.leadingComments = to9337.token.leadingComments;
    }
    if (to9337.token.trailingComments) {
        next9338.token.trailingComments = to9337.token.trailingComments;
    }
    return next9338;
}
function reversePattern9304(patterns9348) {
    var len9349 = patterns9348.length;
    var pat9350;
    return _9280.reduceRight(patterns9348, function (acc9351, pat9352) {
        if (pat9352["class"] === "pattern_group" || pat9352["class"] === "named_group") {
            pat9352.inner = reversePattern9304(pat9352.inner);
        }
        if (pat9352.repeat) {
            pat9352.leading = !pat9352.leading;
        }
        acc9351.push(pat9352);
        return acc9351;
    }, []);
}
function loadLiteralGroup9305(patterns9353) {
    return patterns9353.map(function (patStx9354) {
        var pat9355 = patternToObject9306(patStx9354);
        if (pat9355.inner) {
            pat9355.inner = loadLiteralGroup9305(pat9355.inner);
        } else {
            pat9355["class"] = "pattern_literal";
        }
        return pat9355;
    });
}
function patternToObject9306(pat9356) {
    var obj9357 = {
        type: pat9356.token.type,
        value: pat9356.token.value
    };
    if (pat9356.token.inner) {
        obj9357.inner = pat9356.token.inner;
    }
    return obj9357;
}
function isPrimaryClass9307(name9358) {
    return ["expr", "lit", "ident", "token", "invoke", "invokeRec"].indexOf(name9358) > -1;
}
function loadPattern9308(patterns9359, reverse9360) {
    var patts9361 = [];
    for (var i9362 = 0; i9362 < patterns9359.length; i9362++) {
        var tok19363 = patterns9359[i9362];
        var tok29364 = patterns9359[i9362 + 1];
        var tok39365 = patterns9359[i9362 + 2];
        var tok49366 = patterns9359[i9362 + 3];
        var last9367 = patts9361[patts9361.length - 1];
        var patt9368;
        assert9284(tok19363, "Expecting syntax object");
        if ( // Repeaters
        tok19363.token.type === parser9281.Token.Delimiter && tok19363.token.value === "()" && tok29364 && tok29364.token.type === parser9281.Token.Punctuator && tok29364.token.value === "..." && last9367) {
            assert9284(tok19363.token.inner.length === 1, "currently assuming all separators are a single token");
            i9362 += 1;
            last9367.repeat = true;
            last9367.separator = tok19363.token.inner[0];
            continue;
        } else if (tok19363.token.type === parser9281.Token.Punctuator && tok19363.token.value === "..." && last9367) {
            last9367.repeat = true;
            last9367.separator = " ";
            continue;
        } else if (isPatternVar9300(tok19363)) {
            patt9368 = patternToObject9306(tok19363);
            if (tok29364 && tok29364.token.type === parser9281.Token.Punctuator && tok29364.token.value === ":" && tok39365 && (tok39365.token.type === parser9281.Token.Identifier || tok39365.token.type === parser9281.Token.Delimiter && (tok39365.token.value === "[]" || tok39365.token.value === "()"))) {
                i9362 += 2;
                if (tok39365.token.value === "[]") {
                    patt9368["class"] = "named_group";
                    patt9368.inner = loadLiteralGroup9305(tok39365.token.inner);
                } else if (tok39365.token.value === "()") {
                    patt9368["class"] = "named_group";
                    patt9368.inner = loadPattern9308(tok39365.token.inner);
                } else if (isPrimaryClass9307(tok39365.token.value)) {
                    patt9368["class"] = tok39365.token.value;
                    if (patt9368["class"] === "invokeRec" || patt9368["class"] === "invoke") {
                        i9362 += 1;
                        if (tok49366.token.value === "()" && tok49366.token.inner.length) {
                            patt9368.macroName = tok49366.token.inner;
                        } else {
                            throwSyntaxError9294(patt9368["class"], "Expected macro parameter", tok39365);
                        }
                    }
                } else {
                    patt9368["class"] = "invoke";
                    patt9368.macroName = [tok39365];
                }
            } else {
                patt9368["class"] = "token";
            }
        } else if (tok19363.token.type === parser9281.Token.Identifier && tok19363.token.value === "$" && tok29364.token.type === parser9281.Token.Delimiter) {
            i9362 += 1;
            patt9368 = patternToObject9306(tok29364);
            patt9368["class"] = "pattern_group";
            if (patt9368.value === "[]") {
                patt9368.inner = loadLiteralGroup9305(patt9368.inner);
            } else {
                patt9368.inner = loadPattern9308(tok29364.token.inner);
            }
        } else if (tok19363.token.type === parser9281.Token.Identifier && tok19363.token.value === "_") {
            patt9368 = patternToObject9306(tok19363);
            patt9368["class"] = "wildcard";
        } else {
            patt9368 = patternToObject9306(tok19363);
            patt9368["class"] = "pattern_literal";
            if (patt9368.inner) {
                patt9368.inner = loadPattern9308(tok19363.token.inner);
            }
        }
        if ( // Macro classes aren't allowed in lookbehind because we wouldn't
        // know where to insert the macro, and you can't use a L->R macro
        // to match R->L.
        reverse9360 && patt9368.macroName) {
            throwSyntaxError9294(patt9368["class"], "Not allowed in top-level lookbehind", patt9368.macroName[0]);
        }
        patts9361.push(patt9368);
    }
    return reverse9360 ? reversePattern9304(patts9361) : patts9361;
}
function cachedTermMatch9309(stx9369, term9370) {
    var res9371 = [];
    var i9372 = 0;
    while (stx9369[i9372] && stx9369[i9372].term === term9370) {
        res9371.unshift(stx9369[i9372]);
        i9372++;
    }
    return {
        result: term9370,
        destructed: res9371,
        rest: stx9369.slice(res9371.length)
    };
}
function expandWithMacro9310(macroName9373, stx9374, context9375, rec9376) {
    var name9377 = macroName9373.map(syntax9283.unwrapSyntax).join("");
    var ident9378 = syntax9283.makeIdent(name9377, macroName9373[0]);
    var macroObj9379 = expander9282.getSyntaxTransform(ident9378, context9375, context9375.phase);
    var newContext9380 = expander9282.makeExpanderContext(context9375);
    if (!macroObj9379) {
        throwSyntaxError9294("invoke", "Macro not in scope", macroName9373[0]);
    }
    var next9381 = macroName9373.slice(-1).concat(stx9374);
    var rest9382, result9383, rt9384, patternEnv9385;
    while (macroObj9379 && next9381) {
        try {
            rt9384 = macroObj9379.fn(next9381, newContext9380, [], []);
            result9383 = rt9384.result;
            rest9382 = rt9384.rest;
            patternEnv9385 = rt9384.patterns;
        } catch (e9386) {
            if (e9386 instanceof syntax9283.SyntaxCaseError) {
                result9383 = null;
                rest9382 = stx9374;
                break;
            } else {
                throw e9386;
            }
        }
        if (rec9376 && result9383.length >= 1) {
            var nextMacro9387 = expander9282.getSyntaxTransform(result9383, context9375, context9375.phase);
            if (nextMacro9387) {
                macroObj9379 = nextMacro9387;
                next9381 = result9383.concat(rest9382);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    return {
        result: result9383,
        rest: rest9382,
        patternEnv: patternEnv9385
    };
}
function matchPatternClass9311(patternObj9388, stx9389, context9390) {
    var result9391, rest9392, match9393, patternEnv9394;
    if ( // pattern has no parse class
    patternObj9388["class"] === "token" && stx9389[0] && stx9389[0].token.type !== parser9281.Token.EOF) {
        result9391 = [stx9389[0]];
        rest9392 = stx9389.slice(1);
    } else if (patternObj9388["class"] === "lit" && stx9389[0] && typeIsLiteral9297(stx9389[0].token.type)) {
        result9391 = [stx9389[0]];
        rest9392 = stx9389.slice(1);
    } else if (patternObj9388["class"] === "ident" && stx9389[0] && stx9389[0].token.type === parser9281.Token.Identifier) {
        result9391 = [stx9389[0]];
        rest9392 = stx9389.slice(1);
    } else if (stx9389.length > 0 && patternObj9388["class"] === "VariableStatement") {
        match9393 = stx9389[0].term ? cachedTermMatch9309(stx9389, stx9389[0].term) : expander9282.enforest(stx9389, expander9282.makeExpanderContext(context9390));
        if (match9393.result && match9393.result.isVariableStatementTerm) {
            result9391 = match9393.destructed || match9393.result.destruct(context9390);
            rest9392 = match9393.rest;
        } else {
            result9391 = null;
            rest9392 = stx9389;
        }
    } else if (stx9389.length > 0 && patternObj9388["class"] === "expr") {
        match9393 = expander9282.get_expression(stx9389, expander9282.makeExpanderContext(context9390));
        if (match9393.result === null || !match9393.result.isExprTerm) {
            result9391 = null;
            rest9392 = stx9389;
        } else {
            result9391 = match9393.destructed || match9393.result.destruct(context9390);
            result9391 = [syntax9283.makeDelim("()", result9391, result9391[0])];
            rest9392 = match9393.rest;
        }
    } else if (stx9389.length > 0 && (patternObj9388["class"] === "invoke" || patternObj9388["class"] === "invokeRec")) {
        match9393 = expandWithMacro9310(patternObj9388.macroName, stx9389, context9390, patternObj9388["class"] === "invokeRec");
        result9391 = match9393.result;
        rest9392 = match9393.result ? match9393.rest : stx9389;
        patternEnv9394 = match9393.patternEnv;
    } else {
        result9391 = null;
        rest9392 = stx9389;
    }
    return {
        result: result9391,
        rest: rest9392,
        patternEnv: patternEnv9394
    };
}
function matchPatterns9312(patterns9395, stx9396, context9397, topLevel9398) {
    // topLevel lets us know if the patterns are on the top level or nested inside
    // a delimiter:
    //     case $topLevel (,) ... => { }
    //     case ($nested (,) ...) => { }
    // This matters for how we deal with trailing unmatched syntax when the pattern
    // has an ellipses:
    //     m 1,2,3 foo
    // should match 1,2,3 and leave foo alone but:
    //     m (1,2,3 foo)
    // should fail to match entirely.
    topLevel9398 = topLevel9398 || false;
    // note that there are two environments floating around,
    // one is the mapping of identifiers to macro definitions (env)
    // and the other is the pattern environment (patternEnv) that maps
    // patterns in a macro case to syntax.
    var result9399 = [];
    var patternEnv9400 = {};
    var match9401;
    var pattern9402;
    var rest9403 = stx9396;
    var success9404 = true;
    var inLeading9405;
    patternLoop: for (var i9406 = 0; i9406 < patterns9395.length; i9406++) {
        if (success9404 === false) {
            break;
        }
        pattern9402 = patterns9395[i9406];
        inLeading9405 = false;
        do {
            if ( // handles cases where patterns trail a repeated pattern like `$x ... ;`
            pattern9402.repeat && i9406 + 1 < patterns9395.length) {
                var restMatch9408 = matchPatterns9312(patterns9395.slice(i9406 + 1), rest9403, context9397, topLevel9398);
                if (restMatch9408.success) {
                    // match the repeat pattern on the empty array to fill in its
                    // pattern variable in the environment
                    match9401 = matchPattern9313(pattern9402, [], context9397, patternEnv9400, topLevel9398);
                    patternEnv9400 = _9280.extend(restMatch9408.patternEnv, match9401.patternEnv);
                    rest9403 = restMatch9408.rest;
                    break patternLoop;
                }
            }
            if (pattern9402.repeat && pattern9402.leading && pattern9402.separator !== " ") {
                if (rest9403[0].token.value === pattern9402.separator.token.value) {
                    if (!inLeading9405) {
                        inLeading9405 = true;
                    }
                    rest9403 = rest9403.slice(1);
                } else {
                    if ( // If we are in a leading repeat, the separator is required.
                    inLeading9405) {
                        success9404 = false;
                        break;
                    }
                }
            }
            match9401 = matchPattern9313(pattern9402, rest9403, context9397, patternEnv9400, topLevel9398);
            if (!match9401.success && pattern9402.repeat) {
                // a repeat can match zero tokens and still be a
                // "success" so break out of the inner loop and
                // try the next pattern
                break;
            }
            if (!match9401.success) {
                success9404 = false;
                break;
            }
            rest9403 = match9401.rest;
            patternEnv9400 = match9401.patternEnv;
            if (success9404 && !(topLevel9398 || pattern9402.repeat)) {
                if ( // the very last pattern matched, inside a
                // delimiter, not a repeat, *and* there are more
                // unmatched bits of syntax
                i9406 == patterns9395.length - 1 && rest9403.length !== 0) {
                    success9404 = false;
                    break;
                }
            }
            if (pattern9402.repeat && !pattern9402.leading && success9404) {
                if ( // if (i < patterns.length - 1 && rest.length > 0) {
                //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                //     if (restMatch.success) {
                //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                //         rest = restMatch.rest;
                //         break patternLoop;
                //     }
                // }
                pattern9402.separator === " ") {
                    // no separator specified (using the empty string for this)
                    // so keep going
                    continue;
                } else if (rest9403[0] && rest9403[0].token.value === pattern9402.separator.token.value) {
                    // more tokens and the next token matches the separator
                    rest9403 = rest9403.slice(1);
                } else if (pattern9402.separator !== " " && rest9403.length > 0 && i9406 === patterns9395.length - 1 && topLevel9398 === false) {
                    // separator is specified, there is a next token, the
                    // next token doesn't match the separator, there are
                    // no more patterns, and this is a top level pattern
                    // so the match has failed
                    success9404 = false;
                    break;
                } else {
                    break;
                }
            }
        } while (pattern9402.repeat && success9404 && rest9403.length > 0);
    }
    if ( // If we are in a delimiter and we haven't matched all the syntax, it
    // was a failed match.
    !topLevel9398 && rest9403.length) {
        success9404 = false;
    }
    var result9399;
    if (success9404) {
        result9399 = rest9403.length ? stx9396.slice(0, -rest9403.length) : stx9396;
    } else {
        result9399 = [];
    }
    return {
        success: success9404,
        result: result9399,
        rest: rest9403,
        patternEnv: patternEnv9400
    };
}
function matchPattern9313(pattern9409, stx9410, context9411, patternEnv9412, topLevel9413) {
    var subMatch9414;
    var match9415, matchEnv9416;
    var rest9417;
    var success9418;
    if (typeof pattern9409.inner !== "undefined") {
        if (pattern9409["class"] === "pattern_group") {
            // pattern groups don't match the delimiters
            subMatch9414 = matchPatterns9312(pattern9409.inner, stx9410, context9411, true);
            rest9417 = subMatch9414.rest;
            success9418 = subMatch9414.success;
        } else if (pattern9409["class"] === "named_group") {
            subMatch9414 = matchPatterns9312(pattern9409.inner, stx9410, context9411, true);
            rest9417 = subMatch9414.rest;
            success9418 = subMatch9414.success;
            if (success9418) {
                var namedMatch9419 = {};
                namedMatch9419[pattern9409.value] = {
                    level: 0,
                    match: subMatch9414.result,
                    topLevel: topLevel9413
                };
                subMatch9414.patternEnv = loadPatternEnv9315(namedMatch9419, subMatch9414.patternEnv, topLevel9413, false, pattern9409.value);
            }
        } else if (stx9410[0] && stx9410[0].token.type === parser9281.Token.Delimiter && stx9410[0].token.value === pattern9409.value) {
            if (pattern9409.inner.length === 0 && stx9410[0].token.inner.length !== 0) {
                return {
                    success: false,
                    rest: stx9410,
                    patternEnv: patternEnv9412
                };
            }
            subMatch9414 = matchPatterns9312(pattern9409.inner, stx9410[0].token.inner, context9411, false);
            rest9417 = stx9410.slice(1);
            success9418 = subMatch9414.success;
        } else {
            subMatch9414 = matchPatterns9312(pattern9409.inner, [], context9411, false);
            success9418 = false;
        }
        if (success9418) {
            patternEnv9412 = loadPatternEnv9315(patternEnv9412, subMatch9414.patternEnv, topLevel9413, pattern9409.repeat);
        } else if (pattern9409.repeat) {
            patternEnv9412 = initPatternEnv9314(patternEnv9412, subMatch9414.patternEnv, topLevel9413);
        }
    } else {
        if (pattern9409["class"] === "wildcard") {
            success9418 = true;
            rest9417 = stx9410.slice(1);
        } else if (pattern9409["class"] === "pattern_literal") {
            if ( // match the literal but don't update the pattern environment
            stx9410[0] && pattern9409.value === stx9410[0].token.value) {
                success9418 = true;
                rest9417 = stx9410.slice(1);
            } else {
                success9418 = false;
                rest9417 = stx9410;
            }
        } else {
            match9415 = matchPatternClass9311(pattern9409, stx9410, context9411);
            success9418 = match9415.result !== null;
            rest9417 = match9415.rest;
            matchEnv9416 = {
                level: 0,
                match: match9415.result,
                topLevel: topLevel9413
            };
            if ( // push the match onto this value's slot in the environment
            pattern9409.repeat) {
                if (patternEnv9412[pattern9409.value] && success9418) {
                    patternEnv9412[pattern9409.value].match.push(matchEnv9416);
                } else if (patternEnv9412[pattern9409.value] === undefined) {
                    // initialize if necessary
                    patternEnv9412[pattern9409.value] = {
                        level: 1,
                        match: [matchEnv9416],
                        topLevel: topLevel9413
                    };
                }
            } else {
                patternEnv9412[pattern9409.value] = matchEnv9416;
            }
            patternEnv9412 = loadPatternEnv9315(patternEnv9412, match9415.patternEnv, topLevel9413, pattern9409.repeat, pattern9409.value);
        }
    }
    return {
        success: success9418,
        rest: rest9417,
        patternEnv: patternEnv9412
    };
}
function initPatternEnv9314(toEnv9420, fromEnv9421, topLevel9422) {
    _9280.forEach(fromEnv9421, function (patternVal9423, patternKey9424) {
        if (!toEnv9420[patternKey9424]) {
            toEnv9420[patternKey9424] = {
                level: patternVal9423.level + 1,
                match: [patternVal9423],
                topLevel: topLevel9422
            };
        }
    });
    return toEnv9420;
}
function loadPatternEnv9315(toEnv9425, fromEnv9426, topLevel9427, repeat9428, prefix9429) {
    prefix9429 = prefix9429 || "";
    _9280.forEach(fromEnv9426, function (patternVal9430, patternKey9431) {
        var patternName9432 = prefix9429 + patternKey9431;
        if (repeat9428) {
            var nextLevel9433 = patternVal9430.level + 1;
            if (toEnv9425[patternName9432]) {
                toEnv9425[patternName9432].level = nextLevel9433;
                toEnv9425[patternName9432].match.push(patternVal9430);
            } else {
                toEnv9425[patternName9432] = {
                    level: nextLevel9433,
                    match: [patternVal9430],
                    topLevel: topLevel9427
                };
            }
        } else {
            toEnv9425[patternName9432] = patternVal9430;
        }
    });
    return toEnv9425;
}
function matchLookbehind9316(patterns9434, stx9435, terms9436, context9437) {
    var success9438, patternEnv9439, prevStx9440, prevTerms9441;
    if ( // No lookbehind, noop.
    !patterns9434.length) {
        success9438 = true;
        patternEnv9439 = {};
        prevStx9440 = stx9435;
        prevTerms9441 = terms9436;
    } else {
        var match9442 = matchPatterns9312(patterns9434, stx9435, context9437, true);
        var last9443 = match9442.result[match9442.result.length - 1];
        success9438 = match9442.success;
        patternEnv9439 = match9442.patternEnv;
        if (success9438) {
            if (match9442.rest.length) {
                if (last9443 && last9443.term && last9443.term === match9442.rest[0].term) {
                    // The term tree was split, so its a failed match;
                    success9438 = false;
                } else {
                    prevStx9440 = match9442.rest;
                    for (var
                    // Find where to slice the prevTerms to match up with
                    // the state of prevStx.
                    i9444 = 0, len9445 = terms9436.length; i9444 < len9445; i9444++) {
                        if (terms9436[i9444] === prevStx9440[0].term) {
                            prevTerms9441 = terms9436.slice(i9444);
                            break;
                        }
                    }
                    assert9284(prevTerms9441, "No matching previous term found");
                }
            } else {
                prevTerms9441 = [];
                prevStx9440 = [];
            }
        }
    }
    // We need to reverse the matches for any top level repeaters because
    // they match in reverse, and thus put their results in backwards.
    _9280.forEach(patternEnv9439, function (val9446, key9447) {
        if (val9446.level && val9446.match && val9446.topLevel) {
            val9446.match.reverse();
        }
    });
    return {
        success: success9438,
        patternEnv: patternEnv9439,
        prevStx: prevStx9440,
        prevTerms: prevTerms9441
    };
}
function hasMatch9317(m9448) {
    if (m9448.level === 0) {
        return m9448.match.length > 0;
    }
    return !!m9448.match;
}
function transcribe9318(macroBody9449, macroNameStx9450, env9451) {
    return _9280.chain(macroBody9449).reduce(function (acc9452, bodyStx9453, idx9454, original9455) {
        var // first find the ellipses and mark the syntax objects
        // (note that this step does not eagerly go into delimiter bodies)
        last9456 = original9455[idx9454 - 1];
        var next9457 = original9455[idx9454 + 1];
        var nextNext9458 = original9455[idx9454 + 2];
        if ( // drop `...`
        bodyStx9453.token.value === "...") {
            return acc9452;
        }
        if ( // drop `(<separator)` when followed by an ellipse
        delimIsSeparator9299(bodyStx9453) && next9457 && next9457.token.value === "...") {
            return acc9452;
        }
        if ( // skip the $ in $(...)
        bodyStx9453.token.value === "$" && next9457 && next9457.token.type === parser9281.Token.Delimiter && next9457.token.value === "()") {
            return acc9452;
        }
        if ( // mark $[...] as a literal
        bodyStx9453.token.value === "$" && next9457 && next9457.token.type === parser9281.Token.Delimiter && next9457.token.value === "[]") {
            next9457.literal = true;
            return acc9452;
        }
        if (bodyStx9453.token.type === parser9281.Token.Delimiter && bodyStx9453.token.value === "()" && last9456 && last9456.token.value === "$") {
            bodyStx9453.group = true;
        }
        if ( // literal [] delimiters have their bodies just
        // directly passed along
        bodyStx9453.literal === true) {
            assert9284(bodyStx9453.token.type === parser9281.Token.Delimiter, "expecting a literal to be surrounded by []");
            return acc9452.concat(bodyStx9453.token.inner);
        }
        if (next9457 && next9457.token.value === "...") {
            bodyStx9453.repeat = true;
            bodyStx9453.separator = " ";
        } else if (delimIsSeparator9299(next9457) && nextNext9458 && nextNext9458.token.value === "...") {
            bodyStx9453.repeat = true;
            bodyStx9453.separator = next9457.token.inner[0];
        }
        acc9452.push(bodyStx9453);
        return acc9452;
    }, []).reduce(function (acc9459, bodyStx9460, idx9461) {
        if ( // then do the actual transcription
        bodyStx9460.repeat) {
            if (bodyStx9460.token.type === parser9281.Token.Delimiter) {
                var fv9462 = _9280.filter(freeVarsInPattern9296(bodyStx9460.token.inner), function (pat9469) {
                    // ignore "patterns"
                    // that aren't in the
                    // environment (treat
                    // them like literals)
                    return env9451.hasOwnProperty(pat9469);
                });
                var restrictedEnv9463 = [];
                var nonScalar9464 = _9280.find(fv9462, function (pat9470) {
                    return env9451[pat9470].level > 0;
                });
                assert9284(typeof nonScalar9464 !== "undefined", "must have a least one non-scalar in repeat");
                var repeatLength9465 = env9451[nonScalar9464].match.length;
                var sameLength9466 = _9280.all(fv9462, function (pat9471) {
                    return env9451[pat9471].level === 0 || env9451[pat9471].match.length === repeatLength9465;
                });
                assert9284(sameLength9466, "all non-scalars must have the same length");
                // create a list of envs restricted to the free vars
                _9280.each(_9280.range(repeatLength9465), function (idx9472) {
                    var renv9473 = {};
                    _9280.each(fv9462, function (pat9475) {
                        if (env9451[pat9475].level === 0) {
                            // copy scalars over
                            renv9473[pat9475] = env9451[pat9475];
                        } else {
                            // grab the match at this index
                            renv9473[pat9475] = env9451[pat9475].match[idx9472];
                        }
                    });
                    var allHaveMatch9474 = Object.keys(renv9473).every(function (pat9476) {
                        return hasMatch9317(renv9473[pat9476]);
                    });
                    if (allHaveMatch9474) {
                        restrictedEnv9463.push(renv9473);
                    }
                });
                var transcribed9467 = _9280.map(restrictedEnv9463, function (renv9477) {
                    if (bodyStx9460.group) {
                        return transcribe9318(bodyStx9460.token.inner, macroNameStx9450, renv9477);
                    } else {
                        var newBody9478 = syntaxFromToken9286(_9280.clone(bodyStx9460.token), bodyStx9460);
                        newBody9478.token.inner = transcribe9318(bodyStx9460.token.inner, macroNameStx9450, renv9477);
                        return newBody9478;
                    }
                });
                var joined9468;
                if (bodyStx9460.group) {
                    joined9468 = joinSyntaxArray9291(transcribed9467, bodyStx9460.separator);
                } else {
                    joined9468 = joinSyntax9290(transcribed9467, bodyStx9460.separator);
                }
                push9295.apply(acc9459, joined9468);
                return acc9459;
            }
            if (!env9451[bodyStx9460.token.value]) {
                throwSyntaxError9294("patterns", "The pattern variable is not bound for the template", bodyStx9460);
            } else if (env9451[bodyStx9460.token.value].level !== 1) {
                throwSyntaxError9294("patterns", "Ellipses level does not match in the template", bodyStx9460);
            }
            push9295.apply(acc9459, joinRepeatedMatch9301(env9451[bodyStx9460.token.value].match, bodyStx9460.separator));
            return acc9459;
        } else {
            if (bodyStx9460.token.type === parser9281.Token.Delimiter) {
                var newBody9479 = syntaxFromToken9286(_9280.clone(bodyStx9460.token), macroBody9449);
                newBody9479.token.inner = transcribe9318(bodyStx9460.token.inner, macroNameStx9450, env9451);
                acc9459.push(newBody9479);
                return acc9459;
            }
            if (isPatternVar9300(bodyStx9460) && Object.prototype.hasOwnProperty.bind(env9451)(bodyStx9460.token.value)) {
                if (!env9451[bodyStx9460.token.value]) {
                    throwSyntaxError9294("patterns", "The pattern variable is not bound for the template", bodyStx9460);
                } else if (env9451[bodyStx9460.token.value].level !== 0) {
                    throwSyntaxError9294("patterns", "Ellipses level does not match in the template", bodyStx9460);
                }
                push9295.apply(acc9459, takeLineContext9302(bodyStx9460, env9451[bodyStx9460.token.value].match));
                return acc9459;
            }
            acc9459.push(syntaxFromToken9286(_9280.clone(bodyStx9460.token), bodyStx9460));
            return acc9459;
        }
    }, []).value();
}
function cloneMatch9319(oldMatch9480) {
    var newMatch9481 = {
        success: oldMatch9480.success,
        rest: oldMatch9480.rest,
        patternEnv: {}
    };
    for (var pat9482 in oldMatch9480.patternEnv) {
        if (oldMatch9480.patternEnv.hasOwnProperty(pat9482)) {
            newMatch9481.patternEnv[pat9482] = oldMatch9480.patternEnv[pat9482];
        }
    }
    return newMatch9481;
}
function makeIdentityRule9320(pattern9483, isInfix9484, context9485) {
    var inf9486 = [];
    var pat9487 = [];
    var stx9488 = [];
    if (isInfix9484) {
        for (var i9489 = 0; i9489 < pattern9483.length; i9489++) {
            if (pattern9483[i9489].token.type === parser9281.Token.Punctuator && pattern9483[i9489].token.value === "|") {
                pat9487.push(makeIdent9288("$inf", context9485), makePunc9287(":", context9485), makeDelim9289("()", inf9486, context9485), pattern9483[0], makeIdent9288("$id", context9485), makePunc9287(":", context9485), makeDelim9289("()", pat9487.slice(i9489 + 1), context9485));
                stx9488.push(makeIdent9288("$inf", context9485), makeIdent9288("$id", context9485));
                break;
            }
            inf9486.push(pattern9483[i9489]);
        }
    } else {
        pat9487.push(makeIdent9288("$id", context9485), makePunc9287(":", context9485), makeDelim9289("()", pattern9483, context9485));
        stx9488.push(makeIdent9288("$id", context9485));
    }
    return {
        pattern: pat9487,
        body: stx9488
    };
}
exports.loadPattern = loadPattern9308;
exports.matchPatterns = matchPatterns9312;
exports.matchLookbehind = matchLookbehind9316;
exports.transcribe = transcribe9318;
exports.matchPatternClass = matchPatternClass9311;
exports.takeLineContext = takeLineContext9302;
exports.takeLine = takeLine9303;
exports.typeIsLiteral = typeIsLiteral9297;
exports.cloneMatch = cloneMatch9319;
exports.makeIdentityRule = makeIdentityRule9320;
/*global require: true, exports:true
*/
//# sourceMappingURL=patterns.js.map