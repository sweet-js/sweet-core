"use strict";

var _9327 = require("underscore"),
    parser9328 = require("./parser"),
    expander9329 = require("./expander"),
    syntax9330 = require("./syntax"),
    assert9331 = require("assert");
var get_expression9332 = expander9329.get_expression;
var syntaxFromToken9333 = syntax9330.syntaxFromToken;
var makePunc9334 = syntax9330.makePunc;
var makeIdent9335 = syntax9330.makeIdent;
var makeDelim9336 = syntax9330.makeDelim;
var joinSyntax9337 = syntax9330.joinSyntax;
var joinSyntaxArray9338 = syntax9330.joinSyntaxArray;
var cloneSyntax9339 = syntax9330.cloneSyntax;
var cloneSyntaxArray9340 = syntax9330.cloneSyntaxArray;
var throwSyntaxError9341 = syntax9330.throwSyntaxError;
var push9342 = Array.prototype.push;
function freeVarsInPattern9343(pattern9368) {
    var fv9369 = [];
    _9327.each(pattern9368, function (pat9370) {
        if (isPatternVar9347(pat9370)) {
            fv9369.push(pat9370.token.value);
        } else if (pat9370.token.type === parser9328.Token.Delimiter) {
            push9342.apply(fv9369, freeVarsInPattern9343(pat9370.token.inner));
        }
    });
    return fv9369;
}
function typeIsLiteral9344(type9371) {
    return type9371 === parser9328.Token.NullLiteral || type9371 === parser9328.Token.NumericLiteral || type9371 === parser9328.Token.StringLiteral || type9371 === parser9328.Token.RegexLiteral || type9371 === parser9328.Token.BooleanLiteral;
}
function containsPatternVar9345(patterns9372) {
    return _9327.any(patterns9372, function (pat9373) {
        if (pat9373.token.type === parser9328.Token.Delimiter) {
            return containsPatternVar9345(pat9373.token.inner);
        }
        return isPatternVar9347(pat9373);
    });
}
function delimIsSeparator9346(delim9374) {
    return delim9374 && delim9374.token && delim9374.token.type === parser9328.Token.Delimiter && delim9374.token.value === "()" && delim9374.token.inner.length === 1 && delim9374.token.inner[0].token.type !== parser9328.Token.Delimiter && !containsPatternVar9345(delim9374.token.inner);
}
function isPatternVar9347(stx9375) {
    return stx9375.token.value[0] === "$" && stx9375.token.value !== "$";
}
function joinRepeatedMatch9348(tojoin9376, punc9377) {
    return _9327.reduce(_9327.rest(tojoin9376, 1), function (acc9378, join9379) {
        if (punc9377 === " ") {
            return acc9378.concat(cloneSyntaxArray9340(join9379.match));
        }
        return acc9378.concat(cloneSyntax9339(punc9377), cloneSyntaxArray9340(join9379.match));
    }, cloneSyntaxArray9340(_9327.first(tojoin9376).match));
}
function takeLineContext9349(from9380, to9381) {
    return _9327.map(to9381, function (stx9382) {
        return takeLine9350(from9380, stx9382);
    });
}
function takeLine9350(from9383, to9384) {
    var next9385;
    if (to9384.token.type === parser9328.Token.Delimiter) {
        var sm_startLineNumber9386 = typeof to9384.token.sm_startLineNumber !== "undefined" ? to9384.token.sm_startLineNumber : to9384.token.startLineNumber;
        var sm_endLineNumber9387 = typeof to9384.token.sm_endLineNumber !== "undefined" ? to9384.token.sm_endLineNumber : to9384.token.endLineNumber;
        var sm_startLineStart9388 = typeof to9384.token.sm_startLineStart !== "undefined" ? to9384.token.sm_startLineStart : to9384.token.startLineStart;
        var sm_endLineStart9389 = typeof to9384.token.sm_endLineStart !== "undefined" ? to9384.token.sm_endLineStart : to9384.token.endLineStart;
        var sm_startRange9390 = typeof to9384.token.sm_startRange !== "undefined" ? to9384.token.sm_startRange : to9384.token.startRange;
        var sm_endRange9391 = typeof to9384.token.sm_endRange !== "undefined" ? to9384.token.sm_endRange : to9384.token.endRange;
        if (from9383.token.type === parser9328.Token.Delimiter) {
            next9385 = syntaxFromToken9333({
                type: parser9328.Token.Delimiter,
                value: to9384.token.value,
                inner: takeLineContext9349(from9383, to9384.token.inner),
                startRange: from9383.token.startRange,
                endRange: from9383.token.endRange,
                startLineNumber: from9383.token.startLineNumber,
                startLineStart: from9383.token.startLineStart,
                endLineNumber: from9383.token.endLineNumber,
                endLineStart: from9383.token.endLineStart,
                sm_startLineNumber: sm_startLineNumber9386,
                sm_endLineNumber: sm_endLineNumber9387,
                sm_startLineStart: sm_startLineStart9388,
                sm_endLineStart: sm_endLineStart9389,
                sm_startRange: sm_startRange9390,
                sm_endRange: sm_endRange9391
            }, to9384);
        } else {
            next9385 = syntaxFromToken9333({
                type: parser9328.Token.Delimiter,
                value: to9384.token.value,
                inner: takeLineContext9349(from9383, to9384.token.inner),
                startRange: from9383.token.range,
                endRange: from9383.token.range,
                startLineNumber: from9383.token.lineNumber,
                startLineStart: from9383.token.lineStart,
                endLineNumber: from9383.token.lineNumber,
                endLineStart: from9383.token.lineStart,
                sm_startLineNumber: sm_startLineNumber9386,
                sm_endLineNumber: sm_endLineNumber9387,
                sm_startLineStart: sm_startLineStart9388,
                sm_endLineStart: sm_endLineStart9389,
                sm_startRange: sm_startRange9390,
                sm_endRange: sm_endRange9391
            }, to9384);
        }
    } else {
        var sm_lineNumber9392 = typeof to9384.token.sm_lineNumber !== "undefined" ? to9384.token.sm_lineNumber : to9384.token.lineNumber;
        var sm_lineStart9393 = typeof to9384.token.sm_lineStart !== "undefined" ? to9384.token.sm_lineStart : to9384.token.lineStart;
        var sm_range9394 = typeof to9384.token.sm_range !== "undefined" ? to9384.token.sm_range : to9384.token.range;
        if (from9383.token.type === parser9328.Token.Delimiter) {
            next9385 = syntaxFromToken9333({
                value: to9384.token.value,
                type: to9384.token.type,
                lineNumber: from9383.token.startLineNumber,
                lineStart: from9383.token.startLineStart,
                range: from9383.token.startRange,
                sm_lineNumber: sm_lineNumber9392,
                sm_lineStart: sm_lineStart9393,
                sm_range: sm_range9394
            }, to9384);
        } else {
            next9385 = syntaxFromToken9333({
                value: to9384.token.value,
                type: to9384.token.type,
                lineNumber: from9383.token.lineNumber,
                lineStart: from9383.token.lineStart,
                range: from9383.token.range,
                sm_lineNumber: sm_lineNumber9392,
                sm_lineStart: sm_lineStart9393,
                sm_range: sm_range9394
            }, to9384);
        }
    }
    if (to9384.token.leadingComments) {
        next9385.token.leadingComments = to9384.token.leadingComments;
    }
    if (to9384.token.trailingComments) {
        next9385.token.trailingComments = to9384.token.trailingComments;
    }
    return next9385;
}
function reversePattern9351(patterns9395) {
    var len9396 = patterns9395.length;
    var pat9397;
    return _9327.reduceRight(patterns9395, function (acc9398, pat9399) {
        if (pat9399["class"] === "pattern_group" || pat9399["class"] === "named_group") {
            pat9399.inner = reversePattern9351(pat9399.inner);
        }
        if (pat9399.repeat) {
            pat9399.leading = !pat9399.leading;
        }
        acc9398.push(pat9399);
        return acc9398;
    }, []);
}
function loadLiteralGroup9352(patterns9400) {
    return patterns9400.map(function (patStx9401) {
        var pat9402 = patternToObject9353(patStx9401);
        if (pat9402.inner) {
            pat9402.inner = loadLiteralGroup9352(pat9402.inner);
        } else {
            pat9402["class"] = "pattern_literal";
        }
        return pat9402;
    });
}
function patternToObject9353(pat9403) {
    var obj9404 = {
        type: pat9403.token.type,
        value: pat9403.token.value
    };
    if (pat9403.token.inner) {
        obj9404.inner = pat9403.token.inner;
    }
    return obj9404;
}
function isPrimaryClass9354(name9405) {
    return ["expr", "lit", "ident", "token", "invoke", "invokeRec"].indexOf(name9405) > -1;
}
function loadPattern9355(patterns9406, reverse9407) {
    var patts9408 = [];
    for (var i9409 = 0; i9409 < patterns9406.length; i9409++) {
        var tok19410 = patterns9406[i9409];
        var tok29411 = patterns9406[i9409 + 1];
        var tok39412 = patterns9406[i9409 + 2];
        var tok49413 = patterns9406[i9409 + 3];
        var last9414 = patts9408[patts9408.length - 1];
        var patt9415;
        assert9331(tok19410, "Expecting syntax object");
        if ( // Repeaters
        tok19410.token.type === parser9328.Token.Delimiter && tok19410.token.value === "()" && tok29411 && tok29411.token.type === parser9328.Token.Punctuator && tok29411.token.value === "..." && last9414) {
            assert9331(tok19410.token.inner.length === 1, "currently assuming all separators are a single token");
            i9409 += 1;
            last9414.repeat = true;
            last9414.separator = tok19410.token.inner[0];
            continue;
        } else if (tok19410.token.type === parser9328.Token.Punctuator && tok19410.token.value === "..." && last9414) {
            last9414.repeat = true;
            last9414.separator = " ";
            continue;
        } else if (isPatternVar9347(tok19410)) {
            patt9415 = patternToObject9353(tok19410);
            if (tok29411 && tok29411.token.type === parser9328.Token.Punctuator && tok29411.token.value === ":" && tok39412 && (tok39412.token.type === parser9328.Token.Identifier || tok39412.token.type === parser9328.Token.Delimiter && (tok39412.token.value === "[]" || tok39412.token.value === "()"))) {
                i9409 += 2;
                if (tok39412.token.value === "[]") {
                    patt9415["class"] = "named_group";
                    patt9415.inner = loadLiteralGroup9352(tok39412.token.inner);
                } else if (tok39412.token.value === "()") {
                    patt9415["class"] = "named_group";
                    patt9415.inner = loadPattern9355(tok39412.token.inner);
                } else if (isPrimaryClass9354(tok39412.token.value)) {
                    patt9415["class"] = tok39412.token.value;
                    if (patt9415["class"] === "invokeRec" || patt9415["class"] === "invoke") {
                        i9409 += 1;
                        if (tok49413.token.value === "()" && tok49413.token.inner.length) {
                            patt9415.macroName = tok49413.token.inner;
                        } else {
                            throwSyntaxError9341(patt9415["class"], "Expected macro parameter", tok39412);
                        }
                    }
                } else {
                    patt9415["class"] = "invoke";
                    patt9415.macroName = [tok39412];
                }
            } else {
                patt9415["class"] = "token";
            }
        } else if (tok19410.token.type === parser9328.Token.Identifier && tok19410.token.value === "$" && tok29411.token.type === parser9328.Token.Delimiter) {
            i9409 += 1;
            patt9415 = patternToObject9353(tok29411);
            patt9415["class"] = "pattern_group";
            if (patt9415.value === "[]") {
                patt9415.inner = loadLiteralGroup9352(patt9415.inner);
            } else {
                patt9415.inner = loadPattern9355(tok29411.token.inner);
            }
        } else if (tok19410.token.type === parser9328.Token.Identifier && tok19410.token.value === "_") {
            patt9415 = patternToObject9353(tok19410);
            patt9415["class"] = "wildcard";
        } else {
            patt9415 = patternToObject9353(tok19410);
            patt9415["class"] = "pattern_literal";
            if (patt9415.inner) {
                patt9415.inner = loadPattern9355(tok19410.token.inner);
            }
        }
        if ( // Macro classes aren't allowed in lookbehind because we wouldn't
        // know where to insert the macro, and you can't use a L->R macro
        // to match R->L.
        reverse9407 && patt9415.macroName) {
            throwSyntaxError9341(patt9415["class"], "Not allowed in top-level lookbehind", patt9415.macroName[0]);
        }
        patts9408.push(patt9415);
    }
    return reverse9407 ? reversePattern9351(patts9408) : patts9408;
}
function cachedTermMatch9356(stx9416, term9417) {
    var res9418 = [];
    var i9419 = 0;
    while (stx9416[i9419] && stx9416[i9419].term === term9417) {
        res9418.unshift(stx9416[i9419]);
        i9419++;
    }
    return {
        result: term9417,
        destructed: res9418,
        rest: stx9416.slice(res9418.length)
    };
}
function expandWithMacro9357(macroName9420, stx9421, context9422, rec9423) {
    var name9424 = macroName9420.map(syntax9330.unwrapSyntax).join("");
    var ident9425 = syntax9330.makeIdent(name9424, macroName9420[0]);
    var macroObj9426 = expander9329.getSyntaxTransform(ident9425, context9422, context9422.phase);
    var newContext9427 = expander9329.makeExpanderContext(context9422);
    if (!macroObj9426) {
        throwSyntaxError9341("invoke", "Macro not in scope", macroName9420[0]);
    }
    var next9428 = macroName9420.slice(-1).concat(stx9421);
    var rest9429, result9430, rt9431, patternEnv9432;
    while (macroObj9426 && next9428) {
        try {
            rt9431 = macroObj9426.fn(next9428, newContext9427, [], []);
            result9430 = rt9431.result;
            rest9429 = rt9431.rest;
            patternEnv9432 = rt9431.patterns;
        } catch (e9433) {
            if (e9433 instanceof syntax9330.SyntaxCaseError) {
                result9430 = null;
                rest9429 = stx9421;
                break;
            } else {
                throw e9433;
            }
        }
        if (rec9423 && result9430.length >= 1) {
            var nextMacro9434 = expander9329.getSyntaxTransform(result9430, context9422, context9422.phase);
            if (nextMacro9434) {
                macroObj9426 = nextMacro9434;
                next9428 = result9430.concat(rest9429);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    return {
        result: result9430,
        rest: rest9429,
        patternEnv: patternEnv9432
    };
}
function matchPatternClass9358(patternObj9435, stx9436, context9437) {
    var result9438, rest9439, match9440, patternEnv9441;
    if ( // pattern has no parse class
    patternObj9435["class"] === "token" && stx9436[0] && stx9436[0].token.type !== parser9328.Token.EOF) {
        result9438 = [stx9436[0]];
        rest9439 = stx9436.slice(1);
    } else if (patternObj9435["class"] === "lit" && stx9436[0] && typeIsLiteral9344(stx9436[0].token.type)) {
        result9438 = [stx9436[0]];
        rest9439 = stx9436.slice(1);
    } else if (patternObj9435["class"] === "ident" && stx9436[0] && stx9436[0].token.type === parser9328.Token.Identifier) {
        result9438 = [stx9436[0]];
        rest9439 = stx9436.slice(1);
    } else if (stx9436.length > 0 && patternObj9435["class"] === "VariableStatement") {
        match9440 = stx9436[0].term ? cachedTermMatch9356(stx9436, stx9436[0].term) : expander9329.enforest(stx9436, expander9329.makeExpanderContext(context9437));
        if (match9440.result && match9440.result.isVariableStatementTerm) {
            result9438 = match9440.destructed || match9440.result.destruct(context9437);
            rest9439 = match9440.rest;
        } else {
            result9438 = null;
            rest9439 = stx9436;
        }
    } else if (stx9436.length > 0 && patternObj9435["class"] === "expr") {
        match9440 = expander9329.get_expression(stx9436, expander9329.makeExpanderContext(context9437));
        if (match9440.result === null || !match9440.result.isExprTerm) {
            result9438 = null;
            rest9439 = stx9436;
        } else {
            result9438 = match9440.destructed || match9440.result.destruct(context9437);
            result9438 = [syntax9330.makeDelim("()", result9438, result9438[0])];
            rest9439 = match9440.rest;
        }
    } else if (stx9436.length > 0 && (patternObj9435["class"] === "invoke" || patternObj9435["class"] === "invokeRec")) {
        match9440 = expandWithMacro9357(patternObj9435.macroName, stx9436, context9437, patternObj9435["class"] === "invokeRec");
        result9438 = match9440.result;
        rest9439 = match9440.result ? match9440.rest : stx9436;
        patternEnv9441 = match9440.patternEnv;
    } else {
        result9438 = null;
        rest9439 = stx9436;
    }
    return {
        result: result9438,
        rest: rest9439,
        patternEnv: patternEnv9441
    };
}
function matchPatterns9359(patterns9442, stx9443, context9444, topLevel9445) {
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
    topLevel9445 = topLevel9445 || false;
    // note that there are two environments floating around,
    // one is the mapping of identifiers to macro definitions (env)
    // and the other is the pattern environment (patternEnv) that maps
    // patterns in a macro case to syntax.
    var result9446 = [];
    var patternEnv9447 = {};
    var match9448;
    var pattern9449;
    var rest9450 = stx9443;
    var success9451 = true;
    var inLeading9452;
    patternLoop: for (var i9453 = 0; i9453 < patterns9442.length; i9453++) {
        if (success9451 === false) {
            break;
        }
        pattern9449 = patterns9442[i9453];
        inLeading9452 = false;
        do {
            if ( // handles cases where patterns trail a repeated pattern like `$x ... ;`
            pattern9449.repeat && i9453 + 1 < patterns9442.length) {
                var restMatch9455 = matchPatterns9359(patterns9442.slice(i9453 + 1), rest9450, context9444, topLevel9445);
                if (restMatch9455.success) {
                    // match the repeat pattern on the empty array to fill in its
                    // pattern variable in the environment
                    match9448 = matchPattern9360(pattern9449, [], context9444, patternEnv9447, topLevel9445);
                    patternEnv9447 = _9327.extend(restMatch9455.patternEnv, match9448.patternEnv);
                    rest9450 = restMatch9455.rest;
                    break patternLoop;
                }
            }
            if (pattern9449.repeat && pattern9449.leading && pattern9449.separator !== " ") {
                if (rest9450[0].token.value === pattern9449.separator.token.value) {
                    if (!inLeading9452) {
                        inLeading9452 = true;
                    }
                    rest9450 = rest9450.slice(1);
                } else {
                    if ( // If we are in a leading repeat, the separator is required.
                    inLeading9452) {
                        success9451 = false;
                        break;
                    }
                }
            }
            match9448 = matchPattern9360(pattern9449, rest9450, context9444, patternEnv9447, topLevel9445);
            if (!match9448.success && pattern9449.repeat) {
                // a repeat can match zero tokens and still be a
                // "success" so break out of the inner loop and
                // try the next pattern
                break;
            }
            if (!match9448.success) {
                success9451 = false;
                break;
            }
            rest9450 = match9448.rest;
            patternEnv9447 = match9448.patternEnv;
            if (success9451 && !(topLevel9445 || pattern9449.repeat)) {
                if ( // the very last pattern matched, inside a
                // delimiter, not a repeat, *and* there are more
                // unmatched bits of syntax
                i9453 == patterns9442.length - 1 && rest9450.length !== 0) {
                    success9451 = false;
                    break;
                }
            }
            if (pattern9449.repeat && !pattern9449.leading && success9451) {
                if ( // if (i < patterns.length - 1 && rest.length > 0) {
                //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                //     if (restMatch.success) {
                //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                //         rest = restMatch.rest;
                //         break patternLoop;
                //     }
                // }
                pattern9449.separator === " ") {
                    // no separator specified (using the empty string for this)
                    // so keep going
                    continue;
                } else if (rest9450[0] && rest9450[0].token.value === pattern9449.separator.token.value) {
                    // more tokens and the next token matches the separator
                    rest9450 = rest9450.slice(1);
                } else if (pattern9449.separator !== " " && rest9450.length > 0 && i9453 === patterns9442.length - 1 && topLevel9445 === false) {
                    // separator is specified, there is a next token, the
                    // next token doesn't match the separator, there are
                    // no more patterns, and this is a top level pattern
                    // so the match has failed
                    success9451 = false;
                    break;
                } else {
                    break;
                }
            }
        } while (pattern9449.repeat && success9451 && rest9450.length > 0);
    }
    if ( // If we are in a delimiter and we haven't matched all the syntax, it
    // was a failed match.
    !topLevel9445 && rest9450.length) {
        success9451 = false;
    }
    var result9446;
    if (success9451) {
        result9446 = rest9450.length ? stx9443.slice(0, -rest9450.length) : stx9443;
    } else {
        result9446 = [];
    }
    return {
        success: success9451,
        result: result9446,
        rest: rest9450,
        patternEnv: patternEnv9447
    };
}
function matchPattern9360(pattern9456, stx9457, context9458, patternEnv9459, topLevel9460) {
    var subMatch9461;
    var match9462, matchEnv9463;
    var rest9464;
    var success9465;
    if (typeof pattern9456.inner !== "undefined") {
        if (pattern9456["class"] === "pattern_group") {
            // pattern groups don't match the delimiters
            subMatch9461 = matchPatterns9359(pattern9456.inner, stx9457, context9458, true);
            rest9464 = subMatch9461.rest;
            success9465 = subMatch9461.success;
        } else if (pattern9456["class"] === "named_group") {
            subMatch9461 = matchPatterns9359(pattern9456.inner, stx9457, context9458, true);
            rest9464 = subMatch9461.rest;
            success9465 = subMatch9461.success;
            if (success9465) {
                var namedMatch9466 = {};
                namedMatch9466[pattern9456.value] = {
                    level: 0,
                    match: subMatch9461.result,
                    topLevel: topLevel9460
                };
                subMatch9461.patternEnv = loadPatternEnv9362(namedMatch9466, subMatch9461.patternEnv, topLevel9460, false, pattern9456.value);
            }
        } else if (stx9457[0] && stx9457[0].token.type === parser9328.Token.Delimiter && stx9457[0].token.value === pattern9456.value) {
            if (pattern9456.inner.length === 0 && stx9457[0].token.inner.length !== 0) {
                return {
                    success: false,
                    rest: stx9457,
                    patternEnv: patternEnv9459
                };
            }
            subMatch9461 = matchPatterns9359(pattern9456.inner, stx9457[0].token.inner, context9458, false);
            rest9464 = stx9457.slice(1);
            success9465 = subMatch9461.success;
        } else {
            subMatch9461 = matchPatterns9359(pattern9456.inner, [], context9458, false);
            success9465 = false;
        }
        if (success9465) {
            patternEnv9459 = loadPatternEnv9362(patternEnv9459, subMatch9461.patternEnv, topLevel9460, pattern9456.repeat);
        } else if (pattern9456.repeat) {
            patternEnv9459 = initPatternEnv9361(patternEnv9459, subMatch9461.patternEnv, topLevel9460);
        }
    } else {
        if (pattern9456["class"] === "wildcard") {
            success9465 = true;
            rest9464 = stx9457.slice(1);
        } else if (pattern9456["class"] === "pattern_literal") {
            if ( // match the literal but don't update the pattern environment
            stx9457[0] && pattern9456.value === stx9457[0].token.value) {
                success9465 = true;
                rest9464 = stx9457.slice(1);
            } else {
                success9465 = false;
                rest9464 = stx9457;
            }
        } else {
            match9462 = matchPatternClass9358(pattern9456, stx9457, context9458);
            success9465 = match9462.result !== null;
            rest9464 = match9462.rest;
            matchEnv9463 = {
                level: 0,
                match: match9462.result,
                topLevel: topLevel9460
            };
            if ( // push the match onto this value's slot in the environment
            pattern9456.repeat) {
                if (patternEnv9459[pattern9456.value] && success9465) {
                    patternEnv9459[pattern9456.value].match.push(matchEnv9463);
                } else if (patternEnv9459[pattern9456.value] === undefined) {
                    // initialize if necessary
                    patternEnv9459[pattern9456.value] = {
                        level: 1,
                        match: [matchEnv9463],
                        topLevel: topLevel9460
                    };
                }
            } else {
                patternEnv9459[pattern9456.value] = matchEnv9463;
            }
            patternEnv9459 = loadPatternEnv9362(patternEnv9459, match9462.patternEnv, topLevel9460, pattern9456.repeat, pattern9456.value);
        }
    }
    return {
        success: success9465,
        rest: rest9464,
        patternEnv: patternEnv9459
    };
}
function initPatternEnv9361(toEnv9467, fromEnv9468, topLevel9469) {
    _9327.forEach(fromEnv9468, function (patternVal9470, patternKey9471) {
        if (!toEnv9467[patternKey9471]) {
            toEnv9467[patternKey9471] = {
                level: patternVal9470.level + 1,
                match: [patternVal9470],
                topLevel: topLevel9469
            };
        }
    });
    return toEnv9467;
}
function loadPatternEnv9362(toEnv9472, fromEnv9473, topLevel9474, repeat9475, prefix9476) {
    prefix9476 = prefix9476 || "";
    _9327.forEach(fromEnv9473, function (patternVal9477, patternKey9478) {
        var patternName9479 = prefix9476 + patternKey9478;
        if (repeat9475) {
            var nextLevel9480 = patternVal9477.level + 1;
            if (toEnv9472[patternName9479]) {
                toEnv9472[patternName9479].level = nextLevel9480;
                toEnv9472[patternName9479].match.push(patternVal9477);
            } else {
                toEnv9472[patternName9479] = {
                    level: nextLevel9480,
                    match: [patternVal9477],
                    topLevel: topLevel9474
                };
            }
        } else {
            toEnv9472[patternName9479] = patternVal9477;
        }
    });
    return toEnv9472;
}
function matchLookbehind9363(patterns9481, stx9482, terms9483, context9484) {
    var success9485, patternEnv9486, prevStx9487, prevTerms9488;
    if ( // No lookbehind, noop.
    !patterns9481.length) {
        success9485 = true;
        patternEnv9486 = {};
        prevStx9487 = stx9482;
        prevTerms9488 = terms9483;
    } else {
        var match9489 = matchPatterns9359(patterns9481, stx9482, context9484, true);
        var last9490 = match9489.result[match9489.result.length - 1];
        success9485 = match9489.success;
        patternEnv9486 = match9489.patternEnv;
        if (success9485) {
            if (match9489.rest.length) {
                if (last9490 && last9490.term && last9490.term === match9489.rest[0].term) {
                    // The term tree was split, so its a failed match;
                    success9485 = false;
                } else {
                    prevStx9487 = match9489.rest;
                    for (var
                    // Find where to slice the prevTerms to match up with
                    // the state of prevStx.
                    i9491 = 0, len9492 = terms9483.length; i9491 < len9492; i9491++) {
                        if (terms9483[i9491] === prevStx9487[0].term) {
                            prevTerms9488 = terms9483.slice(i9491);
                            break;
                        }
                    }
                    assert9331(prevTerms9488, "No matching previous term found");
                }
            } else {
                prevTerms9488 = [];
                prevStx9487 = [];
            }
        }
    }
    // We need to reverse the matches for any top level repeaters because
    // they match in reverse, and thus put their results in backwards.
    _9327.forEach(patternEnv9486, function (val9493, key9494) {
        if (val9493.level && val9493.match && val9493.topLevel) {
            val9493.match.reverse();
        }
    });
    return {
        success: success9485,
        patternEnv: patternEnv9486,
        prevStx: prevStx9487,
        prevTerms: prevTerms9488
    };
}
function hasMatch9364(m9495) {
    if (m9495.level === 0) {
        return m9495.match.length > 0;
    }
    return !!m9495.match;
}
function transcribe9365(macroBody9496, macroNameStx9497, env9498) {
    return _9327.chain(macroBody9496).reduce(function (acc9499, bodyStx9500, idx9501, original9502) {
        var // first find the ellipses and mark the syntax objects
        // (note that this step does not eagerly go into delimiter bodies)
        last9503 = original9502[idx9501 - 1];
        var next9504 = original9502[idx9501 + 1];
        var nextNext9505 = original9502[idx9501 + 2];
        if ( // drop `...`
        bodyStx9500.token.value === "...") {
            return acc9499;
        }
        if ( // drop `(<separator)` when followed by an ellipse
        delimIsSeparator9346(bodyStx9500) && next9504 && next9504.token.value === "...") {
            return acc9499;
        }
        if ( // skip the $ in $(...)
        bodyStx9500.token.value === "$" && next9504 && next9504.token.type === parser9328.Token.Delimiter && next9504.token.value === "()") {
            return acc9499;
        }
        if ( // mark $[...] as a literal
        bodyStx9500.token.value === "$" && next9504 && next9504.token.type === parser9328.Token.Delimiter && next9504.token.value === "[]") {
            next9504.literal = true;
            return acc9499;
        }
        if (bodyStx9500.token.type === parser9328.Token.Delimiter && bodyStx9500.token.value === "()" && last9503 && last9503.token.value === "$") {
            bodyStx9500.group = true;
        }
        if ( // literal [] delimiters have their bodies just
        // directly passed along
        bodyStx9500.literal === true) {
            assert9331(bodyStx9500.token.type === parser9328.Token.Delimiter, "expecting a literal to be surrounded by []");
            return acc9499.concat(bodyStx9500.token.inner);
        }
        if (next9504 && next9504.token.value === "...") {
            bodyStx9500.repeat = true;
            bodyStx9500.separator = " ";
        } else if (delimIsSeparator9346(next9504) && nextNext9505 && nextNext9505.token.value === "...") {
            bodyStx9500.repeat = true;
            bodyStx9500.separator = next9504.token.inner[0];
        }
        acc9499.push(bodyStx9500);
        return acc9499;
    }, []).reduce(function (acc9506, bodyStx9507, idx9508) {
        if ( // then do the actual transcription
        bodyStx9507.repeat) {
            if (bodyStx9507.token.type === parser9328.Token.Delimiter) {
                var fv9509 = _9327.filter(freeVarsInPattern9343(bodyStx9507.token.inner), function (pat9516) {
                    // ignore "patterns"
                    // that aren't in the
                    // environment (treat
                    // them like literals)
                    return env9498.hasOwnProperty(pat9516);
                });
                var restrictedEnv9510 = [];
                var nonScalar9511 = _9327.find(fv9509, function (pat9517) {
                    return env9498[pat9517].level > 0;
                });
                assert9331(typeof nonScalar9511 !== "undefined", "must have a least one non-scalar in repeat");
                var repeatLength9512 = env9498[nonScalar9511].match.length;
                var sameLength9513 = _9327.all(fv9509, function (pat9518) {
                    return env9498[pat9518].level === 0 || env9498[pat9518].match.length === repeatLength9512;
                });
                assert9331(sameLength9513, "all non-scalars must have the same length");
                // create a list of envs restricted to the free vars
                _9327.each(_9327.range(repeatLength9512), function (idx9519) {
                    var renv9520 = {};
                    _9327.each(fv9509, function (pat9522) {
                        if (env9498[pat9522].level === 0) {
                            // copy scalars over
                            renv9520[pat9522] = env9498[pat9522];
                        } else {
                            // grab the match at this index
                            renv9520[pat9522] = env9498[pat9522].match[idx9519];
                        }
                    });
                    var allHaveMatch9521 = Object.keys(renv9520).every(function (pat9523) {
                        return hasMatch9364(renv9520[pat9523]);
                    });
                    if (allHaveMatch9521) {
                        restrictedEnv9510.push(renv9520);
                    }
                });
                var transcribed9514 = _9327.map(restrictedEnv9510, function (renv9524) {
                    if (bodyStx9507.group) {
                        return transcribe9365(bodyStx9507.token.inner, macroNameStx9497, renv9524);
                    } else {
                        var newBody9525 = syntaxFromToken9333(_9327.clone(bodyStx9507.token), bodyStx9507);
                        newBody9525.token.inner = transcribe9365(bodyStx9507.token.inner, macroNameStx9497, renv9524);
                        return newBody9525;
                    }
                });
                var joined9515;
                if (bodyStx9507.group) {
                    joined9515 = joinSyntaxArray9338(transcribed9514, bodyStx9507.separator);
                } else {
                    joined9515 = joinSyntax9337(transcribed9514, bodyStx9507.separator);
                }
                push9342.apply(acc9506, joined9515);
                return acc9506;
            }
            if (!env9498[bodyStx9507.token.value]) {
                throwSyntaxError9341("patterns", "The pattern variable is not bound for the template", bodyStx9507);
            } else if (env9498[bodyStx9507.token.value].level !== 1) {
                throwSyntaxError9341("patterns", "Ellipses level does not match in the template", bodyStx9507);
            }
            push9342.apply(acc9506, joinRepeatedMatch9348(env9498[bodyStx9507.token.value].match, bodyStx9507.separator));
            return acc9506;
        } else {
            if (bodyStx9507.token.type === parser9328.Token.Delimiter) {
                var newBody9526 = syntaxFromToken9333(_9327.clone(bodyStx9507.token), macroBody9496);
                newBody9526.token.inner = transcribe9365(bodyStx9507.token.inner, macroNameStx9497, env9498);
                acc9506.push(newBody9526);
                return acc9506;
            }
            if (isPatternVar9347(bodyStx9507) && Object.prototype.hasOwnProperty.bind(env9498)(bodyStx9507.token.value)) {
                if (!env9498[bodyStx9507.token.value]) {
                    throwSyntaxError9341("patterns", "The pattern variable is not bound for the template", bodyStx9507);
                } else if (env9498[bodyStx9507.token.value].level !== 0) {
                    throwSyntaxError9341("patterns", "Ellipses level does not match in the template", bodyStx9507);
                }
                push9342.apply(acc9506, takeLineContext9349(bodyStx9507, env9498[bodyStx9507.token.value].match));
                return acc9506;
            }
            acc9506.push(syntaxFromToken9333(_9327.clone(bodyStx9507.token), bodyStx9507));
            return acc9506;
        }
    }, []).value();
}
function cloneMatch9366(oldMatch9527) {
    var newMatch9528 = {
        success: oldMatch9527.success,
        rest: oldMatch9527.rest,
        patternEnv: {}
    };
    for (var pat9529 in oldMatch9527.patternEnv) {
        if (oldMatch9527.patternEnv.hasOwnProperty(pat9529)) {
            newMatch9528.patternEnv[pat9529] = oldMatch9527.patternEnv[pat9529];
        }
    }
    return newMatch9528;
}
function makeIdentityRule9367(pattern9530, isInfix9531, context9532) {
    var inf9533 = [];
    var pat9534 = [];
    var stx9535 = [];
    if (isInfix9531) {
        for (var i9536 = 0; i9536 < pattern9530.length; i9536++) {
            if (pattern9530[i9536].token.type === parser9328.Token.Punctuator && pattern9530[i9536].token.value === "|") {
                pat9534.push(makeIdent9335("$inf", context9532), makePunc9334(":", context9532), makeDelim9336("()", inf9533, context9532), pattern9530[0], makeIdent9335("$id", context9532), makePunc9334(":", context9532), makeDelim9336("()", pat9534.slice(i9536 + 1), context9532));
                stx9535.push(makeIdent9335("$inf", context9532), makeIdent9335("$id", context9532));
                break;
            }
            inf9533.push(pattern9530[i9536]);
        }
    } else {
        pat9534.push(makeIdent9335("$id", context9532), makePunc9334(":", context9532), makeDelim9336("()", pattern9530, context9532));
        stx9535.push(makeIdent9335("$id", context9532));
    }
    return {
        pattern: pat9534,
        body: stx9535
    };
}
exports.loadPattern = loadPattern9355;
exports.matchPatterns = matchPatterns9359;
exports.matchLookbehind = matchLookbehind9363;
exports.transcribe = transcribe9365;
exports.matchPatternClass = matchPatternClass9358;
exports.takeLineContext = takeLineContext9349;
exports.takeLine = takeLine9350;
exports.typeIsLiteral = typeIsLiteral9344;
exports.cloneMatch = cloneMatch9366;
exports.makeIdentityRule = makeIdentityRule9367;
/*global require: true, exports:true
*/
//# sourceMappingURL=patterns.js.map