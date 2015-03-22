"use strict";

var _9284 = require("underscore"),
    parser9285 = require("./parser"),
    expander9286 = require("./expander"),
    syntax9287 = require("./syntax"),
    assert9288 = require("assert");
var get_expression9289 = expander9286.get_expression;
var syntaxFromToken9290 = syntax9287.syntaxFromToken;
var makePunc9291 = syntax9287.makePunc;
var makeIdent9292 = syntax9287.makeIdent;
var makeDelim9293 = syntax9287.makeDelim;
var joinSyntax9294 = syntax9287.joinSyntax;
var joinSyntaxArray9295 = syntax9287.joinSyntaxArray;
var cloneSyntax9296 = syntax9287.cloneSyntax;
var cloneSyntaxArray9297 = syntax9287.cloneSyntaxArray;
var throwSyntaxError9298 = syntax9287.throwSyntaxError;
var push9299 = Array.prototype.push;
function freeVarsInPattern9300(pattern9325) {
    var fv9326 = [];
    _9284.each(pattern9325, function (pat9327) {
        if (isPatternVar9304(pat9327)) {
            fv9326.push(pat9327.token.value);
        } else if (pat9327.token.type === parser9285.Token.Delimiter) {
            push9299.apply(fv9326, freeVarsInPattern9300(pat9327.token.inner));
        }
    });
    return fv9326;
}
function typeIsLiteral9301(type9328) {
    return type9328 === parser9285.Token.NullLiteral || type9328 === parser9285.Token.NumericLiteral || type9328 === parser9285.Token.StringLiteral || type9328 === parser9285.Token.RegexLiteral || type9328 === parser9285.Token.BooleanLiteral;
}
function containsPatternVar9302(patterns9329) {
    return _9284.any(patterns9329, function (pat9330) {
        if (pat9330.token.type === parser9285.Token.Delimiter) {
            return containsPatternVar9302(pat9330.token.inner);
        }
        return isPatternVar9304(pat9330);
    });
}
function delimIsSeparator9303(delim9331) {
    return delim9331 && delim9331.token && delim9331.token.type === parser9285.Token.Delimiter && delim9331.token.value === "()" && delim9331.token.inner.length === 1 && delim9331.token.inner[0].token.type !== parser9285.Token.Delimiter && !containsPatternVar9302(delim9331.token.inner);
}
function isPatternVar9304(stx9332) {
    return stx9332.token.value[0] === "$" && stx9332.token.value !== "$";
}
function joinRepeatedMatch9305(tojoin9333, punc9334) {
    return _9284.reduce(_9284.rest(tojoin9333, 1), function (acc9335, join9336) {
        if (punc9334 === " ") {
            return acc9335.concat(cloneSyntaxArray9297(join9336.match));
        }
        return acc9335.concat(cloneSyntax9296(punc9334), cloneSyntaxArray9297(join9336.match));
    }, cloneSyntaxArray9297(_9284.first(tojoin9333).match));
}
function takeLineContext9306(from9337, to9338) {
    return _9284.map(to9338, function (stx9339) {
        return takeLine9307(from9337, stx9339);
    });
}
function takeLine9307(from9340, to9341) {
    var next9342;
    if (to9341.token.type === parser9285.Token.Delimiter) {
        var sm_startLineNumber9343 = typeof to9341.token.sm_startLineNumber !== "undefined" ? to9341.token.sm_startLineNumber : to9341.token.startLineNumber;
        var sm_endLineNumber9344 = typeof to9341.token.sm_endLineNumber !== "undefined" ? to9341.token.sm_endLineNumber : to9341.token.endLineNumber;
        var sm_startLineStart9345 = typeof to9341.token.sm_startLineStart !== "undefined" ? to9341.token.sm_startLineStart : to9341.token.startLineStart;
        var sm_endLineStart9346 = typeof to9341.token.sm_endLineStart !== "undefined" ? to9341.token.sm_endLineStart : to9341.token.endLineStart;
        var sm_startRange9347 = typeof to9341.token.sm_startRange !== "undefined" ? to9341.token.sm_startRange : to9341.token.startRange;
        var sm_endRange9348 = typeof to9341.token.sm_endRange !== "undefined" ? to9341.token.sm_endRange : to9341.token.endRange;
        if (from9340.token.type === parser9285.Token.Delimiter) {
            next9342 = syntaxFromToken9290({
                type: parser9285.Token.Delimiter,
                value: to9341.token.value,
                inner: takeLineContext9306(from9340, to9341.token.inner),
                startRange: from9340.token.startRange,
                endRange: from9340.token.endRange,
                startLineNumber: from9340.token.startLineNumber,
                startLineStart: from9340.token.startLineStart,
                endLineNumber: from9340.token.endLineNumber,
                endLineStart: from9340.token.endLineStart,
                sm_startLineNumber: sm_startLineNumber9343,
                sm_endLineNumber: sm_endLineNumber9344,
                sm_startLineStart: sm_startLineStart9345,
                sm_endLineStart: sm_endLineStart9346,
                sm_startRange: sm_startRange9347,
                sm_endRange: sm_endRange9348
            }, to9341);
        } else {
            next9342 = syntaxFromToken9290({
                type: parser9285.Token.Delimiter,
                value: to9341.token.value,
                inner: takeLineContext9306(from9340, to9341.token.inner),
                startRange: from9340.token.range,
                endRange: from9340.token.range,
                startLineNumber: from9340.token.lineNumber,
                startLineStart: from9340.token.lineStart,
                endLineNumber: from9340.token.lineNumber,
                endLineStart: from9340.token.lineStart,
                sm_startLineNumber: sm_startLineNumber9343,
                sm_endLineNumber: sm_endLineNumber9344,
                sm_startLineStart: sm_startLineStart9345,
                sm_endLineStart: sm_endLineStart9346,
                sm_startRange: sm_startRange9347,
                sm_endRange: sm_endRange9348
            }, to9341);
        }
    } else {
        var sm_lineNumber9349 = typeof to9341.token.sm_lineNumber !== "undefined" ? to9341.token.sm_lineNumber : to9341.token.lineNumber;
        var sm_lineStart9350 = typeof to9341.token.sm_lineStart !== "undefined" ? to9341.token.sm_lineStart : to9341.token.lineStart;
        var sm_range9351 = typeof to9341.token.sm_range !== "undefined" ? to9341.token.sm_range : to9341.token.range;
        if (from9340.token.type === parser9285.Token.Delimiter) {
            next9342 = syntaxFromToken9290({
                value: to9341.token.value,
                type: to9341.token.type,
                lineNumber: from9340.token.startLineNumber,
                lineStart: from9340.token.startLineStart,
                range: from9340.token.startRange,
                sm_lineNumber: sm_lineNumber9349,
                sm_lineStart: sm_lineStart9350,
                sm_range: sm_range9351
            }, to9341);
        } else {
            next9342 = syntaxFromToken9290({
                value: to9341.token.value,
                type: to9341.token.type,
                lineNumber: from9340.token.lineNumber,
                lineStart: from9340.token.lineStart,
                range: from9340.token.range,
                sm_lineNumber: sm_lineNumber9349,
                sm_lineStart: sm_lineStart9350,
                sm_range: sm_range9351
            }, to9341);
        }
    }
    if (to9341.token.leadingComments) {
        next9342.token.leadingComments = to9341.token.leadingComments;
    }
    if (to9341.token.trailingComments) {
        next9342.token.trailingComments = to9341.token.trailingComments;
    }
    return next9342;
}
function reversePattern9308(patterns9352) {
    var len9353 = patterns9352.length;
    var pat9354;
    return _9284.reduceRight(patterns9352, function (acc9355, pat9356) {
        if (pat9356["class"] === "pattern_group" || pat9356["class"] === "named_group") {
            pat9356.inner = reversePattern9308(pat9356.inner);
        }
        if (pat9356.repeat) {
            pat9356.leading = !pat9356.leading;
        }
        acc9355.push(pat9356);
        return acc9355;
    }, []);
}
function loadLiteralGroup9309(patterns9357) {
    return patterns9357.map(function (patStx9358) {
        var pat9359 = patternToObject9310(patStx9358);
        if (pat9359.inner) {
            pat9359.inner = loadLiteralGroup9309(pat9359.inner);
        } else {
            pat9359["class"] = "pattern_literal";
        }
        return pat9359;
    });
}
function patternToObject9310(pat9360) {
    var obj9361 = {
        type: pat9360.token.type,
        value: pat9360.token.value
    };
    if (pat9360.token.inner) {
        obj9361.inner = pat9360.token.inner;
    }
    return obj9361;
}
function isPrimaryClass9311(name9362) {
    return ["expr", "lit", "ident", "token", "invoke", "invokeRec"].indexOf(name9362) > -1;
}
function loadPattern9312(patterns9363, reverse9364) {
    var patts9365 = [];
    for (var i9366 = 0; i9366 < patterns9363.length; i9366++) {
        var tok19367 = patterns9363[i9366];
        var tok29368 = patterns9363[i9366 + 1];
        var tok39369 = patterns9363[i9366 + 2];
        var tok49370 = patterns9363[i9366 + 3];
        var last9371 = patts9365[patts9365.length - 1];
        var patt9372;
        assert9288(tok19367, "Expecting syntax object");
        if ( // Repeaters
        tok19367.token.type === parser9285.Token.Delimiter && tok19367.token.value === "()" && tok29368 && tok29368.token.type === parser9285.Token.Punctuator && tok29368.token.value === "..." && last9371) {
            assert9288(tok19367.token.inner.length === 1, "currently assuming all separators are a single token");
            i9366 += 1;
            last9371.repeat = true;
            last9371.separator = tok19367.token.inner[0];
            continue;
        } else if (tok19367.token.type === parser9285.Token.Punctuator && tok19367.token.value === "..." && last9371) {
            last9371.repeat = true;
            last9371.separator = " ";
            continue;
        } else if (isPatternVar9304(tok19367)) {
            patt9372 = patternToObject9310(tok19367);
            if (tok29368 && tok29368.token.type === parser9285.Token.Punctuator && tok29368.token.value === ":" && tok39369 && (tok39369.token.type === parser9285.Token.Identifier || tok39369.token.type === parser9285.Token.Delimiter && (tok39369.token.value === "[]" || tok39369.token.value === "()"))) {
                i9366 += 2;
                if (tok39369.token.value === "[]") {
                    patt9372["class"] = "named_group";
                    patt9372.inner = loadLiteralGroup9309(tok39369.token.inner);
                } else if (tok39369.token.value === "()") {
                    patt9372["class"] = "named_group";
                    patt9372.inner = loadPattern9312(tok39369.token.inner);
                } else if (isPrimaryClass9311(tok39369.token.value)) {
                    patt9372["class"] = tok39369.token.value;
                    if (patt9372["class"] === "invokeRec" || patt9372["class"] === "invoke") {
                        i9366 += 1;
                        if (tok49370.token.value === "()" && tok49370.token.inner.length) {
                            patt9372.macroName = tok49370.token.inner;
                        } else {
                            throwSyntaxError9298(patt9372["class"], "Expected macro parameter", tok39369);
                        }
                    }
                } else {
                    patt9372["class"] = "invoke";
                    patt9372.macroName = [tok39369];
                }
            } else {
                patt9372["class"] = "token";
            }
        } else if (tok19367.token.type === parser9285.Token.Identifier && tok19367.token.value === "$" && tok29368.token.type === parser9285.Token.Delimiter) {
            i9366 += 1;
            patt9372 = patternToObject9310(tok29368);
            patt9372["class"] = "pattern_group";
            if (patt9372.value === "[]") {
                patt9372.inner = loadLiteralGroup9309(patt9372.inner);
            } else {
                patt9372.inner = loadPattern9312(tok29368.token.inner);
            }
        } else if (tok19367.token.type === parser9285.Token.Identifier && tok19367.token.value === "_") {
            patt9372 = patternToObject9310(tok19367);
            patt9372["class"] = "wildcard";
        } else {
            patt9372 = patternToObject9310(tok19367);
            patt9372["class"] = "pattern_literal";
            if (patt9372.inner) {
                patt9372.inner = loadPattern9312(tok19367.token.inner);
            }
        }
        if ( // Macro classes aren't allowed in lookbehind because we wouldn't
        // know where to insert the macro, and you can't use a L->R macro
        // to match R->L.
        reverse9364 && patt9372.macroName) {
            throwSyntaxError9298(patt9372["class"], "Not allowed in top-level lookbehind", patt9372.macroName[0]);
        }
        patts9365.push(patt9372);
    }
    return reverse9364 ? reversePattern9308(patts9365) : patts9365;
}
function cachedTermMatch9313(stx9373, term9374) {
    var res9375 = [];
    var i9376 = 0;
    while (stx9373[i9376] && stx9373[i9376].term === term9374) {
        res9375.unshift(stx9373[i9376]);
        i9376++;
    }
    return {
        result: term9374,
        destructed: res9375,
        rest: stx9373.slice(res9375.length)
    };
}
function expandWithMacro9314(macroName9377, stx9378, context9379, rec9380) {
    var name9381 = macroName9377.map(syntax9287.unwrapSyntax).join("");
    var ident9382 = syntax9287.makeIdent(name9381, macroName9377[0]);
    var macroObj9383 = expander9286.getSyntaxTransform(ident9382, context9379, context9379.phase);
    var newContext9384 = expander9286.makeExpanderContext(context9379);
    if (!macroObj9383) {
        throwSyntaxError9298("invoke", "Macro not in scope", macroName9377[0]);
    }
    var next9385 = macroName9377.slice(-1).concat(stx9378);
    var rest9386, result9387, rt9388, patternEnv9389;
    while (macroObj9383 && next9385) {
        try {
            rt9388 = macroObj9383.fn(next9385, newContext9384, [], []);
            result9387 = rt9388.result;
            rest9386 = rt9388.rest;
            patternEnv9389 = rt9388.patterns;
        } catch (e9390) {
            if (e9390 instanceof syntax9287.SyntaxCaseError) {
                result9387 = null;
                rest9386 = stx9378;
                break;
            } else {
                throw e9390;
            }
        }
        if (rec9380 && result9387.length >= 1) {
            var nextMacro9391 = expander9286.getSyntaxTransform(result9387, context9379, context9379.phase);
            if (nextMacro9391) {
                macroObj9383 = nextMacro9391;
                next9385 = result9387.concat(rest9386);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    return {
        result: result9387,
        rest: rest9386,
        patternEnv: patternEnv9389
    };
}
function matchPatternClass9315(patternObj9392, stx9393, context9394) {
    var result9395, rest9396, match9397, patternEnv9398;
    if ( // pattern has no parse class
    patternObj9392["class"] === "token" && stx9393[0] && stx9393[0].token.type !== parser9285.Token.EOF) {
        result9395 = [stx9393[0]];
        rest9396 = stx9393.slice(1);
    } else if (patternObj9392["class"] === "lit" && stx9393[0] && typeIsLiteral9301(stx9393[0].token.type)) {
        result9395 = [stx9393[0]];
        rest9396 = stx9393.slice(1);
    } else if (patternObj9392["class"] === "ident" && stx9393[0] && stx9393[0].token.type === parser9285.Token.Identifier) {
        result9395 = [stx9393[0]];
        rest9396 = stx9393.slice(1);
    } else if (stx9393.length > 0 && patternObj9392["class"] === "VariableStatement") {
        match9397 = stx9393[0].term ? cachedTermMatch9313(stx9393, stx9393[0].term) : expander9286.enforest(stx9393, expander9286.makeExpanderContext(context9394));
        if (match9397.result && match9397.result.isVariableStatementTerm) {
            result9395 = match9397.destructed || match9397.result.destruct(context9394);
            rest9396 = match9397.rest;
        } else {
            result9395 = null;
            rest9396 = stx9393;
        }
    } else if (stx9393.length > 0 && patternObj9392["class"] === "expr") {
        match9397 = expander9286.get_expression(stx9393, expander9286.makeExpanderContext(context9394));
        if (match9397.result === null || !match9397.result.isExprTerm) {
            result9395 = null;
            rest9396 = stx9393;
        } else {
            result9395 = match9397.destructed || match9397.result.destruct(context9394);
            result9395 = [syntax9287.makeDelim("()", result9395, result9395[0])];
            rest9396 = match9397.rest;
        }
    } else if (stx9393.length > 0 && (patternObj9392["class"] === "invoke" || patternObj9392["class"] === "invokeRec")) {
        match9397 = expandWithMacro9314(patternObj9392.macroName, stx9393, context9394, patternObj9392["class"] === "invokeRec");
        result9395 = match9397.result;
        rest9396 = match9397.result ? match9397.rest : stx9393;
        patternEnv9398 = match9397.patternEnv;
    } else {
        result9395 = null;
        rest9396 = stx9393;
    }
    return {
        result: result9395,
        rest: rest9396,
        patternEnv: patternEnv9398
    };
}
function matchPatterns9316(patterns9399, stx9400, context9401, topLevel9402) {
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
    topLevel9402 = topLevel9402 || false;
    // note that there are two environments floating around,
    // one is the mapping of identifiers to macro definitions (env)
    // and the other is the pattern environment (patternEnv) that maps
    // patterns in a macro case to syntax.
    var result9403 = [];
    var patternEnv9404 = {};
    var match9405;
    var pattern9406;
    var rest9407 = stx9400;
    var success9408 = true;
    var inLeading9409;
    patternLoop: for (var i9410 = 0; i9410 < patterns9399.length; i9410++) {
        if (success9408 === false) {
            break;
        }
        pattern9406 = patterns9399[i9410];
        inLeading9409 = false;
        do {
            if ( // handles cases where patterns trail a repeated pattern like `$x ... ;`
            pattern9406.repeat && i9410 + 1 < patterns9399.length) {
                var restMatch9412 = matchPatterns9316(patterns9399.slice(i9410 + 1), rest9407, context9401, topLevel9402);
                if (restMatch9412.success) {
                    // match the repeat pattern on the empty array to fill in its
                    // pattern variable in the environment
                    match9405 = matchPattern9317(pattern9406, [], context9401, patternEnv9404, topLevel9402);
                    patternEnv9404 = _9284.extend(restMatch9412.patternEnv, match9405.patternEnv);
                    rest9407 = restMatch9412.rest;
                    break patternLoop;
                }
            }
            if (pattern9406.repeat && pattern9406.leading && pattern9406.separator !== " ") {
                if (rest9407[0].token.value === pattern9406.separator.token.value) {
                    if (!inLeading9409) {
                        inLeading9409 = true;
                    }
                    rest9407 = rest9407.slice(1);
                } else {
                    if ( // If we are in a leading repeat, the separator is required.
                    inLeading9409) {
                        success9408 = false;
                        break;
                    }
                }
            }
            match9405 = matchPattern9317(pattern9406, rest9407, context9401, patternEnv9404, topLevel9402);
            if (!match9405.success && pattern9406.repeat) {
                // a repeat can match zero tokens and still be a
                // "success" so break out of the inner loop and
                // try the next pattern
                break;
            }
            if (!match9405.success) {
                success9408 = false;
                break;
            }
            rest9407 = match9405.rest;
            patternEnv9404 = match9405.patternEnv;
            if (success9408 && !(topLevel9402 || pattern9406.repeat)) {
                if ( // the very last pattern matched, inside a
                // delimiter, not a repeat, *and* there are more
                // unmatched bits of syntax
                i9410 == patterns9399.length - 1 && rest9407.length !== 0) {
                    success9408 = false;
                    break;
                }
            }
            if (pattern9406.repeat && !pattern9406.leading && success9408) {
                if ( // if (i < patterns.length - 1 && rest.length > 0) {
                //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                //     if (restMatch.success) {
                //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                //         rest = restMatch.rest;
                //         break patternLoop;
                //     }
                // }
                pattern9406.separator === " ") {
                    // no separator specified (using the empty string for this)
                    // so keep going
                    continue;
                } else if (rest9407[0] && rest9407[0].token.value === pattern9406.separator.token.value) {
                    // more tokens and the next token matches the separator
                    rest9407 = rest9407.slice(1);
                } else if (pattern9406.separator !== " " && rest9407.length > 0 && i9410 === patterns9399.length - 1 && topLevel9402 === false) {
                    // separator is specified, there is a next token, the
                    // next token doesn't match the separator, there are
                    // no more patterns, and this is a top level pattern
                    // so the match has failed
                    success9408 = false;
                    break;
                } else {
                    break;
                }
            }
        } while (pattern9406.repeat && success9408 && rest9407.length > 0);
    }
    if ( // If we are in a delimiter and we haven't matched all the syntax, it
    // was a failed match.
    !topLevel9402 && rest9407.length) {
        success9408 = false;
    }
    var result9403;
    if (success9408) {
        result9403 = rest9407.length ? stx9400.slice(0, -rest9407.length) : stx9400;
    } else {
        result9403 = [];
    }
    return {
        success: success9408,
        result: result9403,
        rest: rest9407,
        patternEnv: patternEnv9404
    };
}
function matchPattern9317(pattern9413, stx9414, context9415, patternEnv9416, topLevel9417) {
    var subMatch9418;
    var match9419, matchEnv9420;
    var rest9421;
    var success9422;
    if (typeof pattern9413.inner !== "undefined") {
        if (pattern9413["class"] === "pattern_group") {
            // pattern groups don't match the delimiters
            subMatch9418 = matchPatterns9316(pattern9413.inner, stx9414, context9415, true);
            rest9421 = subMatch9418.rest;
            success9422 = subMatch9418.success;
        } else if (pattern9413["class"] === "named_group") {
            subMatch9418 = matchPatterns9316(pattern9413.inner, stx9414, context9415, true);
            rest9421 = subMatch9418.rest;
            success9422 = subMatch9418.success;
            if (success9422) {
                var namedMatch9423 = {};
                namedMatch9423[pattern9413.value] = {
                    level: 0,
                    match: subMatch9418.result,
                    topLevel: topLevel9417
                };
                subMatch9418.patternEnv = loadPatternEnv9319(namedMatch9423, subMatch9418.patternEnv, topLevel9417, false, pattern9413.value);
            }
        } else if (stx9414[0] && stx9414[0].token.type === parser9285.Token.Delimiter && stx9414[0].token.value === pattern9413.value) {
            if (pattern9413.inner.length === 0 && stx9414[0].token.inner.length !== 0) {
                return {
                    success: false,
                    rest: stx9414,
                    patternEnv: patternEnv9416
                };
            }
            subMatch9418 = matchPatterns9316(pattern9413.inner, stx9414[0].token.inner, context9415, false);
            rest9421 = stx9414.slice(1);
            success9422 = subMatch9418.success;
        } else {
            subMatch9418 = matchPatterns9316(pattern9413.inner, [], context9415, false);
            success9422 = false;
        }
        if (success9422) {
            patternEnv9416 = loadPatternEnv9319(patternEnv9416, subMatch9418.patternEnv, topLevel9417, pattern9413.repeat);
        } else if (pattern9413.repeat) {
            patternEnv9416 = initPatternEnv9318(patternEnv9416, subMatch9418.patternEnv, topLevel9417);
        }
    } else {
        if (pattern9413["class"] === "wildcard") {
            success9422 = true;
            rest9421 = stx9414.slice(1);
        } else if (pattern9413["class"] === "pattern_literal") {
            if ( // match the literal but don't update the pattern environment
            stx9414[0] && pattern9413.value === stx9414[0].token.value) {
                success9422 = true;
                rest9421 = stx9414.slice(1);
            } else {
                success9422 = false;
                rest9421 = stx9414;
            }
        } else {
            match9419 = matchPatternClass9315(pattern9413, stx9414, context9415);
            success9422 = match9419.result !== null;
            rest9421 = match9419.rest;
            matchEnv9420 = {
                level: 0,
                match: match9419.result,
                topLevel: topLevel9417
            };
            if ( // push the match onto this value's slot in the environment
            pattern9413.repeat) {
                if (patternEnv9416[pattern9413.value] && success9422) {
                    patternEnv9416[pattern9413.value].match.push(matchEnv9420);
                } else if (patternEnv9416[pattern9413.value] === undefined) {
                    // initialize if necessary
                    patternEnv9416[pattern9413.value] = {
                        level: 1,
                        match: [matchEnv9420],
                        topLevel: topLevel9417
                    };
                }
            } else {
                patternEnv9416[pattern9413.value] = matchEnv9420;
            }
            patternEnv9416 = loadPatternEnv9319(patternEnv9416, match9419.patternEnv, topLevel9417, pattern9413.repeat, pattern9413.value);
        }
    }
    return {
        success: success9422,
        rest: rest9421,
        patternEnv: patternEnv9416
    };
}
function initPatternEnv9318(toEnv9424, fromEnv9425, topLevel9426) {
    _9284.forEach(fromEnv9425, function (patternVal9427, patternKey9428) {
        if (!toEnv9424[patternKey9428]) {
            toEnv9424[patternKey9428] = {
                level: patternVal9427.level + 1,
                match: [patternVal9427],
                topLevel: topLevel9426
            };
        }
    });
    return toEnv9424;
}
function loadPatternEnv9319(toEnv9429, fromEnv9430, topLevel9431, repeat9432, prefix9433) {
    prefix9433 = prefix9433 || "";
    _9284.forEach(fromEnv9430, function (patternVal9434, patternKey9435) {
        var patternName9436 = prefix9433 + patternKey9435;
        if (repeat9432) {
            var nextLevel9437 = patternVal9434.level + 1;
            if (toEnv9429[patternName9436]) {
                toEnv9429[patternName9436].level = nextLevel9437;
                toEnv9429[patternName9436].match.push(patternVal9434);
            } else {
                toEnv9429[patternName9436] = {
                    level: nextLevel9437,
                    match: [patternVal9434],
                    topLevel: topLevel9431
                };
            }
        } else {
            toEnv9429[patternName9436] = patternVal9434;
        }
    });
    return toEnv9429;
}
function matchLookbehind9320(patterns9438, stx9439, terms9440, context9441) {
    var success9442, patternEnv9443, prevStx9444, prevTerms9445;
    if ( // No lookbehind, noop.
    !patterns9438.length) {
        success9442 = true;
        patternEnv9443 = {};
        prevStx9444 = stx9439;
        prevTerms9445 = terms9440;
    } else {
        var match9446 = matchPatterns9316(patterns9438, stx9439, context9441, true);
        var last9447 = match9446.result[match9446.result.length - 1];
        success9442 = match9446.success;
        patternEnv9443 = match9446.patternEnv;
        if (success9442) {
            if (match9446.rest.length) {
                if (last9447 && last9447.term && last9447.term === match9446.rest[0].term) {
                    // The term tree was split, so its a failed match;
                    success9442 = false;
                } else {
                    prevStx9444 = match9446.rest;
                    for (var
                    // Find where to slice the prevTerms to match up with
                    // the state of prevStx.
                    i9448 = 0, len9449 = terms9440.length; i9448 < len9449; i9448++) {
                        if (terms9440[i9448] === prevStx9444[0].term) {
                            prevTerms9445 = terms9440.slice(i9448);
                            break;
                        }
                    }
                    assert9288(prevTerms9445, "No matching previous term found");
                }
            } else {
                prevTerms9445 = [];
                prevStx9444 = [];
            }
        }
    }
    // We need to reverse the matches for any top level repeaters because
    // they match in reverse, and thus put their results in backwards.
    _9284.forEach(patternEnv9443, function (val9450, key9451) {
        if (val9450.level && val9450.match && val9450.topLevel) {
            val9450.match.reverse();
        }
    });
    return {
        success: success9442,
        patternEnv: patternEnv9443,
        prevStx: prevStx9444,
        prevTerms: prevTerms9445
    };
}
function hasMatch9321(m9452) {
    if (m9452.level === 0) {
        return m9452.match.length > 0;
    }
    return !!m9452.match;
}
function transcribe9322(macroBody9453, macroNameStx9454, env9455) {
    return _9284.chain(macroBody9453).reduce(function (acc9456, bodyStx9457, idx9458, original9459) {
        var // first find the ellipses and mark the syntax objects
        // (note that this step does not eagerly go into delimiter bodies)
        last9460 = original9459[idx9458 - 1];
        var next9461 = original9459[idx9458 + 1];
        var nextNext9462 = original9459[idx9458 + 2];
        if ( // drop `...`
        bodyStx9457.token.value === "...") {
            return acc9456;
        }
        if ( // drop `(<separator)` when followed by an ellipse
        delimIsSeparator9303(bodyStx9457) && next9461 && next9461.token.value === "...") {
            return acc9456;
        }
        if ( // skip the $ in $(...)
        bodyStx9457.token.value === "$" && next9461 && next9461.token.type === parser9285.Token.Delimiter && next9461.token.value === "()") {
            return acc9456;
        }
        if ( // mark $[...] as a literal
        bodyStx9457.token.value === "$" && next9461 && next9461.token.type === parser9285.Token.Delimiter && next9461.token.value === "[]") {
            next9461.literal = true;
            return acc9456;
        }
        if (bodyStx9457.token.type === parser9285.Token.Delimiter && bodyStx9457.token.value === "()" && last9460 && last9460.token.value === "$") {
            bodyStx9457.group = true;
        }
        if ( // literal [] delimiters have their bodies just
        // directly passed along
        bodyStx9457.literal === true) {
            assert9288(bodyStx9457.token.type === parser9285.Token.Delimiter, "expecting a literal to be surrounded by []");
            return acc9456.concat(bodyStx9457.token.inner);
        }
        if (next9461 && next9461.token.value === "...") {
            bodyStx9457.repeat = true;
            bodyStx9457.separator = " ";
        } else if (delimIsSeparator9303(next9461) && nextNext9462 && nextNext9462.token.value === "...") {
            bodyStx9457.repeat = true;
            bodyStx9457.separator = next9461.token.inner[0];
        }
        acc9456.push(bodyStx9457);
        return acc9456;
    }, []).reduce(function (acc9463, bodyStx9464, idx9465) {
        if ( // then do the actual transcription
        bodyStx9464.repeat) {
            if (bodyStx9464.token.type === parser9285.Token.Delimiter) {
                var fv9466 = _9284.filter(freeVarsInPattern9300(bodyStx9464.token.inner), function (pat9473) {
                    // ignore "patterns"
                    // that aren't in the
                    // environment (treat
                    // them like literals)
                    return env9455.hasOwnProperty(pat9473);
                });
                var restrictedEnv9467 = [];
                var nonScalar9468 = _9284.find(fv9466, function (pat9474) {
                    return env9455[pat9474].level > 0;
                });
                assert9288(typeof nonScalar9468 !== "undefined", "must have a least one non-scalar in repeat");
                var repeatLength9469 = env9455[nonScalar9468].match.length;
                var sameLength9470 = _9284.all(fv9466, function (pat9475) {
                    return env9455[pat9475].level === 0 || env9455[pat9475].match.length === repeatLength9469;
                });
                assert9288(sameLength9470, "all non-scalars must have the same length");
                // create a list of envs restricted to the free vars
                _9284.each(_9284.range(repeatLength9469), function (idx9476) {
                    var renv9477 = {};
                    _9284.each(fv9466, function (pat9479) {
                        if (env9455[pat9479].level === 0) {
                            // copy scalars over
                            renv9477[pat9479] = env9455[pat9479];
                        } else {
                            // grab the match at this index
                            renv9477[pat9479] = env9455[pat9479].match[idx9476];
                        }
                    });
                    var allHaveMatch9478 = Object.keys(renv9477).every(function (pat9480) {
                        return hasMatch9321(renv9477[pat9480]);
                    });
                    if (allHaveMatch9478) {
                        restrictedEnv9467.push(renv9477);
                    }
                });
                var transcribed9471 = _9284.map(restrictedEnv9467, function (renv9481) {
                    if (bodyStx9464.group) {
                        return transcribe9322(bodyStx9464.token.inner, macroNameStx9454, renv9481);
                    } else {
                        var newBody9482 = syntaxFromToken9290(_9284.clone(bodyStx9464.token), bodyStx9464);
                        newBody9482.token.inner = transcribe9322(bodyStx9464.token.inner, macroNameStx9454, renv9481);
                        return newBody9482;
                    }
                });
                var joined9472;
                if (bodyStx9464.group) {
                    joined9472 = joinSyntaxArray9295(transcribed9471, bodyStx9464.separator);
                } else {
                    joined9472 = joinSyntax9294(transcribed9471, bodyStx9464.separator);
                }
                push9299.apply(acc9463, joined9472);
                return acc9463;
            }
            if (!env9455[bodyStx9464.token.value]) {
                throwSyntaxError9298("patterns", "The pattern variable is not bound for the template", bodyStx9464);
            } else if (env9455[bodyStx9464.token.value].level !== 1) {
                throwSyntaxError9298("patterns", "Ellipses level does not match in the template", bodyStx9464);
            }
            push9299.apply(acc9463, joinRepeatedMatch9305(env9455[bodyStx9464.token.value].match, bodyStx9464.separator));
            return acc9463;
        } else {
            if (bodyStx9464.token.type === parser9285.Token.Delimiter) {
                var newBody9483 = syntaxFromToken9290(_9284.clone(bodyStx9464.token), macroBody9453);
                newBody9483.token.inner = transcribe9322(bodyStx9464.token.inner, macroNameStx9454, env9455);
                acc9463.push(newBody9483);
                return acc9463;
            }
            if (isPatternVar9304(bodyStx9464) && Object.prototype.hasOwnProperty.bind(env9455)(bodyStx9464.token.value)) {
                if (!env9455[bodyStx9464.token.value]) {
                    throwSyntaxError9298("patterns", "The pattern variable is not bound for the template", bodyStx9464);
                } else if (env9455[bodyStx9464.token.value].level !== 0) {
                    throwSyntaxError9298("patterns", "Ellipses level does not match in the template", bodyStx9464);
                }
                push9299.apply(acc9463, takeLineContext9306(bodyStx9464, env9455[bodyStx9464.token.value].match));
                return acc9463;
            }
            acc9463.push(syntaxFromToken9290(_9284.clone(bodyStx9464.token), bodyStx9464));
            return acc9463;
        }
    }, []).value();
}
function cloneMatch9323(oldMatch9484) {
    var newMatch9485 = {
        success: oldMatch9484.success,
        rest: oldMatch9484.rest,
        patternEnv: {}
    };
    for (var pat9486 in oldMatch9484.patternEnv) {
        if (oldMatch9484.patternEnv.hasOwnProperty(pat9486)) {
            newMatch9485.patternEnv[pat9486] = oldMatch9484.patternEnv[pat9486];
        }
    }
    return newMatch9485;
}
function makeIdentityRule9324(pattern9487, isInfix9488, context9489) {
    var inf9490 = [];
    var pat9491 = [];
    var stx9492 = [];
    if (isInfix9488) {
        for (var i9493 = 0; i9493 < pattern9487.length; i9493++) {
            if (pattern9487[i9493].token.type === parser9285.Token.Punctuator && pattern9487[i9493].token.value === "|") {
                pat9491.push(makeIdent9292("$inf", context9489), makePunc9291(":", context9489), makeDelim9293("()", inf9490, context9489), pattern9487[0], makeIdent9292("$id", context9489), makePunc9291(":", context9489), makeDelim9293("()", pat9491.slice(i9493 + 1), context9489));
                stx9492.push(makeIdent9292("$inf", context9489), makeIdent9292("$id", context9489));
                break;
            }
            inf9490.push(pattern9487[i9493]);
        }
    } else {
        pat9491.push(makeIdent9292("$id", context9489), makePunc9291(":", context9489), makeDelim9293("()", pattern9487, context9489));
        stx9492.push(makeIdent9292("$id", context9489));
    }
    return {
        pattern: pat9491,
        body: stx9492
    };
}
exports.loadPattern = loadPattern9312;
exports.matchPatterns = matchPatterns9316;
exports.matchLookbehind = matchLookbehind9320;
exports.transcribe = transcribe9322;
exports.matchPatternClass = matchPatternClass9315;
exports.takeLineContext = takeLineContext9306;
exports.takeLine = takeLine9307;
exports.typeIsLiteral = typeIsLiteral9301;
exports.cloneMatch = cloneMatch9323;
exports.makeIdentityRule = makeIdentityRule9324;
/*global require: true, exports:true
*/
//# sourceMappingURL=patterns.js.map