"use strict";

var _9345 = require("underscore"),
    parser9346 = require("./parser"),
    expander9347 = require("./expander"),
    syntax9348 = require("./syntax"),
    assert9349 = require("assert");
var get_expression9350 = expander9347.get_expression;
var syntaxFromToken9351 = syntax9348.syntaxFromToken;
var makePunc9352 = syntax9348.makePunc;
var makeIdent9353 = syntax9348.makeIdent;
var makeDelim9354 = syntax9348.makeDelim;
var joinSyntax9355 = syntax9348.joinSyntax;
var joinSyntaxArray9356 = syntax9348.joinSyntaxArray;
var cloneSyntax9357 = syntax9348.cloneSyntax;
var cloneSyntaxArray9358 = syntax9348.cloneSyntaxArray;
var throwSyntaxError9359 = syntax9348.throwSyntaxError;
var push9360 = Array.prototype.push;
function freeVarsInPattern9361(pattern9386) {
    var fv9387 = [];
    _9345.each(pattern9386, function (pat9388) {
        if (isPatternVar9365(pat9388)) {
            fv9387.push(pat9388.token.value);
        } else if (pat9388.token.type === parser9346.Token.Delimiter) {
            push9360.apply(fv9387, freeVarsInPattern9361(pat9388.token.inner));
        }
    });
    return fv9387;
}
function typeIsLiteral9362(type9389) {
    return type9389 === parser9346.Token.NullLiteral || type9389 === parser9346.Token.NumericLiteral || type9389 === parser9346.Token.StringLiteral || type9389 === parser9346.Token.RegexLiteral || type9389 === parser9346.Token.BooleanLiteral;
}
function containsPatternVar9363(patterns9390) {
    return _9345.any(patterns9390, function (pat9391) {
        if (pat9391.token.type === parser9346.Token.Delimiter) {
            return containsPatternVar9363(pat9391.token.inner);
        }
        return isPatternVar9365(pat9391);
    });
}
function delimIsSeparator9364(delim9392) {
    return delim9392 && delim9392.token && delim9392.token.type === parser9346.Token.Delimiter && delim9392.token.value === "()" && delim9392.token.inner.length === 1 && delim9392.token.inner[0].token.type !== parser9346.Token.Delimiter && !containsPatternVar9363(delim9392.token.inner);
}
function isPatternVar9365(stx9393) {
    return stx9393.token.value[0] === "$" && stx9393.token.value !== "$";
}
function joinRepeatedMatch9366(tojoin9394, punc9395) {
    return _9345.reduce(_9345.rest(tojoin9394, 1), function (acc9396, join9397) {
        if (punc9395 === " ") {
            return acc9396.concat(cloneSyntaxArray9358(join9397.match));
        }
        return acc9396.concat(cloneSyntax9357(punc9395), cloneSyntaxArray9358(join9397.match));
    }, cloneSyntaxArray9358(_9345.first(tojoin9394).match));
}
function takeLineContext9367(from9398, to9399) {
    return _9345.map(to9399, function (stx9400) {
        return takeLine9368(from9398, stx9400);
    });
}
function takeLine9368(from9401, to9402) {
    var next9403;
    if (to9402.token.type === parser9346.Token.Delimiter) {
        var sm_startLineNumber9404 = typeof to9402.token.sm_startLineNumber !== "undefined" ? to9402.token.sm_startLineNumber : to9402.token.startLineNumber;
        var sm_endLineNumber9405 = typeof to9402.token.sm_endLineNumber !== "undefined" ? to9402.token.sm_endLineNumber : to9402.token.endLineNumber;
        var sm_startLineStart9406 = typeof to9402.token.sm_startLineStart !== "undefined" ? to9402.token.sm_startLineStart : to9402.token.startLineStart;
        var sm_endLineStart9407 = typeof to9402.token.sm_endLineStart !== "undefined" ? to9402.token.sm_endLineStart : to9402.token.endLineStart;
        var sm_startRange9408 = typeof to9402.token.sm_startRange !== "undefined" ? to9402.token.sm_startRange : to9402.token.startRange;
        var sm_endRange9409 = typeof to9402.token.sm_endRange !== "undefined" ? to9402.token.sm_endRange : to9402.token.endRange;
        if (from9401.token.type === parser9346.Token.Delimiter) {
            next9403 = syntaxFromToken9351({
                type: parser9346.Token.Delimiter,
                value: to9402.token.value,
                inner: takeLineContext9367(from9401, to9402.token.inner),
                startRange: from9401.token.startRange,
                endRange: from9401.token.endRange,
                startLineNumber: from9401.token.startLineNumber,
                startLineStart: from9401.token.startLineStart,
                endLineNumber: from9401.token.endLineNumber,
                endLineStart: from9401.token.endLineStart,
                sm_startLineNumber: sm_startLineNumber9404,
                sm_endLineNumber: sm_endLineNumber9405,
                sm_startLineStart: sm_startLineStart9406,
                sm_endLineStart: sm_endLineStart9407,
                sm_startRange: sm_startRange9408,
                sm_endRange: sm_endRange9409
            }, to9402);
        } else {
            next9403 = syntaxFromToken9351({
                type: parser9346.Token.Delimiter,
                value: to9402.token.value,
                inner: takeLineContext9367(from9401, to9402.token.inner),
                startRange: from9401.token.range,
                endRange: from9401.token.range,
                startLineNumber: from9401.token.lineNumber,
                startLineStart: from9401.token.lineStart,
                endLineNumber: from9401.token.lineNumber,
                endLineStart: from9401.token.lineStart,
                sm_startLineNumber: sm_startLineNumber9404,
                sm_endLineNumber: sm_endLineNumber9405,
                sm_startLineStart: sm_startLineStart9406,
                sm_endLineStart: sm_endLineStart9407,
                sm_startRange: sm_startRange9408,
                sm_endRange: sm_endRange9409
            }, to9402);
        }
    } else {
        var sm_lineNumber9410 = typeof to9402.token.sm_lineNumber !== "undefined" ? to9402.token.sm_lineNumber : to9402.token.lineNumber;
        var sm_lineStart9411 = typeof to9402.token.sm_lineStart !== "undefined" ? to9402.token.sm_lineStart : to9402.token.lineStart;
        var sm_range9412 = typeof to9402.token.sm_range !== "undefined" ? to9402.token.sm_range : to9402.token.range;
        if (from9401.token.type === parser9346.Token.Delimiter) {
            next9403 = syntaxFromToken9351({
                value: to9402.token.value,
                type: to9402.token.type,
                lineNumber: from9401.token.startLineNumber,
                lineStart: from9401.token.startLineStart,
                range: from9401.token.startRange,
                sm_lineNumber: sm_lineNumber9410,
                sm_lineStart: sm_lineStart9411,
                sm_range: sm_range9412
            }, to9402);
        } else {
            next9403 = syntaxFromToken9351({
                value: to9402.token.value,
                type: to9402.token.type,
                lineNumber: from9401.token.lineNumber,
                lineStart: from9401.token.lineStart,
                range: from9401.token.range,
                sm_lineNumber: sm_lineNumber9410,
                sm_lineStart: sm_lineStart9411,
                sm_range: sm_range9412
            }, to9402);
        }
    }
    if (to9402.token.leadingComments) {
        next9403.token.leadingComments = to9402.token.leadingComments;
    }
    if (to9402.token.trailingComments) {
        next9403.token.trailingComments = to9402.token.trailingComments;
    }
    return next9403;
}
function reversePattern9369(patterns9413) {
    var len9414 = patterns9413.length;
    var pat9415;
    return _9345.reduceRight(patterns9413, function (acc9416, pat9417) {
        if (pat9417["class"] === "pattern_group" || pat9417["class"] === "named_group") {
            pat9417.inner = reversePattern9369(pat9417.inner);
        }
        if (pat9417.repeat) {
            pat9417.leading = !pat9417.leading;
        }
        acc9416.push(pat9417);
        return acc9416;
    }, []);
}
function loadLiteralGroup9370(patterns9418) {
    return patterns9418.map(function (patStx9419) {
        var pat9420 = patternToObject9371(patStx9419);
        if (pat9420.inner) {
            pat9420.inner = loadLiteralGroup9370(pat9420.inner);
        } else {
            pat9420["class"] = "pattern_literal";
        }
        return pat9420;
    });
}
function patternToObject9371(pat9421) {
    var obj9422 = {
        type: pat9421.token.type,
        value: pat9421.token.value
    };
    if (pat9421.token.inner) {
        obj9422.inner = pat9421.token.inner;
    }
    return obj9422;
}
function isPrimaryClass9372(name9423) {
    return ["expr", "lit", "ident", "token", "invoke", "invokeRec"].indexOf(name9423) > -1;
}
function loadPattern9373(patterns9424, reverse9425) {
    var patts9426 = [];
    for (var i9427 = 0; i9427 < patterns9424.length; i9427++) {
        var tok19428 = patterns9424[i9427];
        var tok29429 = patterns9424[i9427 + 1];
        var tok39430 = patterns9424[i9427 + 2];
        var tok49431 = patterns9424[i9427 + 3];
        var last9432 = patts9426[patts9426.length - 1];
        var patt9433;
        assert9349(tok19428, "Expecting syntax object");
        if ( // Repeaters
        tok19428.token.type === parser9346.Token.Delimiter && tok19428.token.value === "()" && tok29429 && tok29429.token.type === parser9346.Token.Punctuator && tok29429.token.value === "..." && last9432) {
            assert9349(tok19428.token.inner.length === 1, "currently assuming all separators are a single token");
            i9427 += 1;
            last9432.repeat = true;
            last9432.separator = tok19428.token.inner[0];
            continue;
        } else if (tok19428.token.type === parser9346.Token.Punctuator && tok19428.token.value === "..." && last9432) {
            last9432.repeat = true;
            last9432.separator = " ";
            continue;
        } else if (isPatternVar9365(tok19428)) {
            patt9433 = patternToObject9371(tok19428);
            if (tok29429 && tok29429.token.type === parser9346.Token.Punctuator && tok29429.token.value === ":" && tok39430 && (tok39430.token.type === parser9346.Token.Identifier || tok39430.token.type === parser9346.Token.Delimiter && (tok39430.token.value === "[]" || tok39430.token.value === "()"))) {
                i9427 += 2;
                if (tok39430.token.value === "[]") {
                    patt9433["class"] = "named_group";
                    patt9433.inner = loadLiteralGroup9370(tok39430.token.inner);
                } else if (tok39430.token.value === "()") {
                    patt9433["class"] = "named_group";
                    patt9433.inner = loadPattern9373(tok39430.token.inner);
                } else if (isPrimaryClass9372(tok39430.token.value)) {
                    patt9433["class"] = tok39430.token.value;
                    if (patt9433["class"] === "invokeRec" || patt9433["class"] === "invoke") {
                        i9427 += 1;
                        if (tok49431.token.value === "()" && tok49431.token.inner.length) {
                            patt9433.macroName = tok49431.token.inner;
                        } else {
                            throwSyntaxError9359(patt9433["class"], "Expected macro parameter", tok39430);
                        }
                    }
                } else {
                    patt9433["class"] = "invoke";
                    patt9433.macroName = [tok39430];
                }
            } else {
                patt9433["class"] = "token";
            }
        } else if (tok19428.token.type === parser9346.Token.Identifier && tok19428.token.value === "$" && tok29429.token.type === parser9346.Token.Delimiter) {
            i9427 += 1;
            patt9433 = patternToObject9371(tok29429);
            patt9433["class"] = "pattern_group";
            if (patt9433.value === "[]") {
                patt9433.inner = loadLiteralGroup9370(patt9433.inner);
            } else {
                patt9433.inner = loadPattern9373(tok29429.token.inner);
            }
        } else if (tok19428.token.type === parser9346.Token.Identifier && tok19428.token.value === "_") {
            patt9433 = patternToObject9371(tok19428);
            patt9433["class"] = "wildcard";
        } else {
            patt9433 = patternToObject9371(tok19428);
            patt9433["class"] = "pattern_literal";
            if (patt9433.inner) {
                patt9433.inner = loadPattern9373(tok19428.token.inner);
            }
        }
        if ( // Macro classes aren't allowed in lookbehind because we wouldn't
        // know where to insert the macro, and you can't use a L->R macro
        // to match R->L.
        reverse9425 && patt9433.macroName) {
            throwSyntaxError9359(patt9433["class"], "Not allowed in top-level lookbehind", patt9433.macroName[0]);
        }
        patts9426.push(patt9433);
    }
    return reverse9425 ? reversePattern9369(patts9426) : patts9426;
}
function cachedTermMatch9374(stx9434, term9435) {
    var res9436 = [];
    var i9437 = 0;
    while (stx9434[i9437] && stx9434[i9437].term === term9435) {
        res9436.unshift(stx9434[i9437]);
        i9437++;
    }
    return {
        result: term9435,
        destructed: res9436,
        rest: stx9434.slice(res9436.length)
    };
}
function expandWithMacro9375(macroName9438, stx9439, context9440, rec9441) {
    var name9442 = macroName9438.map(syntax9348.unwrapSyntax).join("");
    var ident9443 = syntax9348.makeIdent(name9442, macroName9438[0]);
    var macroObj9444 = expander9347.getSyntaxTransform(ident9443, context9440, context9440.phase);
    var newContext9445 = expander9347.makeExpanderContext(context9440);
    if (!macroObj9444) {
        throwSyntaxError9359("invoke", "Macro not in scope", macroName9438[0]);
    }
    var next9446 = macroName9438.slice(-1).concat(stx9439);
    var rest9447, result9448, rt9449, patternEnv9450;
    while (macroObj9444 && next9446) {
        try {
            rt9449 = macroObj9444.fn(next9446, newContext9445, [], []);
            result9448 = rt9449.result;
            rest9447 = rt9449.rest;
            patternEnv9450 = rt9449.patterns;
        } catch (e9451) {
            if (e9451 instanceof syntax9348.SyntaxCaseError) {
                result9448 = null;
                rest9447 = stx9439;
                break;
            } else {
                throw e9451;
            }
        }
        if (rec9441 && result9448.length >= 1) {
            var nextMacro9452 = expander9347.getSyntaxTransform(result9448, context9440, context9440.phase);
            if (nextMacro9452) {
                macroObj9444 = nextMacro9452;
                next9446 = result9448.concat(rest9447);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    return {
        result: result9448,
        rest: rest9447,
        patternEnv: patternEnv9450
    };
}
function matchPatternClass9376(patternObj9453, stx9454, context9455) {
    var result9456, rest9457, match9458, patternEnv9459;
    if ( // pattern has no parse class
    patternObj9453["class"] === "token" && stx9454[0] && stx9454[0].token.type !== parser9346.Token.EOF) {
        result9456 = [stx9454[0]];
        rest9457 = stx9454.slice(1);
    } else if (patternObj9453["class"] === "lit" && stx9454[0] && typeIsLiteral9362(stx9454[0].token.type)) {
        result9456 = [stx9454[0]];
        rest9457 = stx9454.slice(1);
    } else if (patternObj9453["class"] === "ident" && stx9454[0] && stx9454[0].token.type === parser9346.Token.Identifier) {
        result9456 = [stx9454[0]];
        rest9457 = stx9454.slice(1);
    } else if (stx9454.length > 0 && patternObj9453["class"] === "VariableStatement") {
        match9458 = stx9454[0].term ? cachedTermMatch9374(stx9454, stx9454[0].term) : expander9347.enforest(stx9454, expander9347.makeExpanderContext(context9455));
        if (match9458.result && match9458.result.isVariableStatementTerm) {
            result9456 = match9458.destructed || match9458.result.destruct(context9455);
            rest9457 = match9458.rest;
        } else {
            result9456 = null;
            rest9457 = stx9454;
        }
    } else if (stx9454.length > 0 && patternObj9453["class"] === "expr") {
        match9458 = expander9347.get_expression(stx9454, expander9347.makeExpanderContext(context9455));
        if (match9458.result === null || !match9458.result.isExprTerm) {
            result9456 = null;
            rest9457 = stx9454;
        } else {
            result9456 = match9458.destructed || match9458.result.destruct(context9455);
            result9456 = [syntax9348.makeDelim("()", result9456, result9456[0])];
            rest9457 = match9458.rest;
        }
    } else if (stx9454.length > 0 && (patternObj9453["class"] === "invoke" || patternObj9453["class"] === "invokeRec")) {
        match9458 = expandWithMacro9375(patternObj9453.macroName, stx9454, context9455, patternObj9453["class"] === "invokeRec");
        result9456 = match9458.result;
        rest9457 = match9458.result ? match9458.rest : stx9454;
        patternEnv9459 = match9458.patternEnv;
    } else {
        result9456 = null;
        rest9457 = stx9454;
    }
    return {
        result: result9456,
        rest: rest9457,
        patternEnv: patternEnv9459
    };
}
function matchPatterns9377(patterns9460, stx9461, context9462, topLevel9463) {
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
    topLevel9463 = topLevel9463 || false;
    // note that there are two environments floating around,
    // one is the mapping of identifiers to macro definitions (env)
    // and the other is the pattern environment (patternEnv) that maps
    // patterns in a macro case to syntax.
    var result9464 = [];
    var patternEnv9465 = {};
    var match9466;
    var pattern9467;
    var rest9468 = stx9461;
    var success9469 = true;
    var inLeading9470;
    patternLoop: for (var i9471 = 0; i9471 < patterns9460.length; i9471++) {
        if (success9469 === false) {
            break;
        }
        pattern9467 = patterns9460[i9471];
        inLeading9470 = false;
        do {
            if ( // handles cases where patterns trail a repeated pattern like `$x ... ;`
            pattern9467.repeat && i9471 + 1 < patterns9460.length) {
                var restMatch9473 = matchPatterns9377(patterns9460.slice(i9471 + 1), rest9468, context9462, topLevel9463);
                if (restMatch9473.success) {
                    // match the repeat pattern on the empty array to fill in its
                    // pattern variable in the environment
                    match9466 = matchPattern9378(pattern9467, [], context9462, patternEnv9465, topLevel9463);
                    patternEnv9465 = _9345.extend(restMatch9473.patternEnv, match9466.patternEnv);
                    rest9468 = restMatch9473.rest;
                    break patternLoop;
                }
            }
            if (pattern9467.repeat && pattern9467.leading && pattern9467.separator !== " ") {
                if (rest9468[0].token.value === pattern9467.separator.token.value) {
                    if (!inLeading9470) {
                        inLeading9470 = true;
                    }
                    rest9468 = rest9468.slice(1);
                } else {
                    if ( // If we are in a leading repeat, the separator is required.
                    inLeading9470) {
                        success9469 = false;
                        break;
                    }
                }
            }
            match9466 = matchPattern9378(pattern9467, rest9468, context9462, patternEnv9465, topLevel9463);
            if (!match9466.success && pattern9467.repeat) {
                // a repeat can match zero tokens and still be a
                // "success" so break out of the inner loop and
                // try the next pattern
                break;
            }
            if (!match9466.success) {
                success9469 = false;
                break;
            }
            rest9468 = match9466.rest;
            patternEnv9465 = match9466.patternEnv;
            if (success9469 && !(topLevel9463 || pattern9467.repeat)) {
                if ( // the very last pattern matched, inside a
                // delimiter, not a repeat, *and* there are more
                // unmatched bits of syntax
                i9471 == patterns9460.length - 1 && rest9468.length !== 0) {
                    success9469 = false;
                    break;
                }
            }
            if (pattern9467.repeat && !pattern9467.leading && success9469) {
                if ( // if (i < patterns.length - 1 && rest.length > 0) {
                //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                //     if (restMatch.success) {
                //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                //         rest = restMatch.rest;
                //         break patternLoop;
                //     }
                // }
                pattern9467.separator === " ") {
                    // no separator specified (using the empty string for this)
                    // so keep going
                    continue;
                } else if (rest9468[0] && rest9468[0].token.value === pattern9467.separator.token.value) {
                    // more tokens and the next token matches the separator
                    rest9468 = rest9468.slice(1);
                } else if (pattern9467.separator !== " " && rest9468.length > 0 && i9471 === patterns9460.length - 1 && topLevel9463 === false) {
                    // separator is specified, there is a next token, the
                    // next token doesn't match the separator, there are
                    // no more patterns, and this is a top level pattern
                    // so the match has failed
                    success9469 = false;
                    break;
                } else {
                    break;
                }
            }
        } while (pattern9467.repeat && success9469 && rest9468.length > 0);
    }
    if ( // If we are in a delimiter and we haven't matched all the syntax, it
    // was a failed match.
    !topLevel9463 && rest9468.length) {
        success9469 = false;
    }
    var result9464;
    if (success9469) {
        result9464 = rest9468.length ? stx9461.slice(0, -rest9468.length) : stx9461;
    } else {
        result9464 = [];
    }
    return {
        success: success9469,
        result: result9464,
        rest: rest9468,
        patternEnv: patternEnv9465
    };
}
function matchPattern9378(pattern9474, stx9475, context9476, patternEnv9477, topLevel9478) {
    var subMatch9479;
    var match9480, matchEnv9481;
    var rest9482;
    var success9483;
    if (typeof pattern9474.inner !== "undefined") {
        if (pattern9474["class"] === "pattern_group") {
            // pattern groups don't match the delimiters
            subMatch9479 = matchPatterns9377(pattern9474.inner, stx9475, context9476, true);
            rest9482 = subMatch9479.rest;
            success9483 = subMatch9479.success;
        } else if (pattern9474["class"] === "named_group") {
            subMatch9479 = matchPatterns9377(pattern9474.inner, stx9475, context9476, true);
            rest9482 = subMatch9479.rest;
            success9483 = subMatch9479.success;
            if (success9483) {
                var namedMatch9484 = {};
                namedMatch9484[pattern9474.value] = {
                    level: 0,
                    match: subMatch9479.result,
                    topLevel: topLevel9478
                };
                subMatch9479.patternEnv = loadPatternEnv9380(namedMatch9484, subMatch9479.patternEnv, topLevel9478, false, pattern9474.value);
            }
        } else if (stx9475[0] && stx9475[0].token.type === parser9346.Token.Delimiter && stx9475[0].token.value === pattern9474.value) {
            if (pattern9474.inner.length === 0 && stx9475[0].token.inner.length !== 0) {
                return {
                    success: false,
                    rest: stx9475,
                    patternEnv: patternEnv9477
                };
            }
            subMatch9479 = matchPatterns9377(pattern9474.inner, stx9475[0].token.inner, context9476, false);
            rest9482 = stx9475.slice(1);
            success9483 = subMatch9479.success;
        } else {
            subMatch9479 = matchPatterns9377(pattern9474.inner, [], context9476, false);
            success9483 = false;
        }
        if (success9483) {
            patternEnv9477 = loadPatternEnv9380(patternEnv9477, subMatch9479.patternEnv, topLevel9478, pattern9474.repeat);
        } else if (pattern9474.repeat) {
            patternEnv9477 = initPatternEnv9379(patternEnv9477, subMatch9479.patternEnv, topLevel9478);
        }
    } else {
        if (pattern9474["class"] === "wildcard") {
            success9483 = true;
            rest9482 = stx9475.slice(1);
        } else if (pattern9474["class"] === "pattern_literal") {
            if ( // match the literal but don't update the pattern environment
            stx9475[0] && pattern9474.value === stx9475[0].token.value) {
                success9483 = true;
                rest9482 = stx9475.slice(1);
            } else {
                success9483 = false;
                rest9482 = stx9475;
            }
        } else {
            match9480 = matchPatternClass9376(pattern9474, stx9475, context9476);
            success9483 = match9480.result !== null;
            rest9482 = match9480.rest;
            matchEnv9481 = {
                level: 0,
                match: match9480.result,
                topLevel: topLevel9478
            };
            if ( // push the match onto this value's slot in the environment
            pattern9474.repeat) {
                if (patternEnv9477[pattern9474.value] && success9483) {
                    patternEnv9477[pattern9474.value].match.push(matchEnv9481);
                } else if (patternEnv9477[pattern9474.value] === undefined) {
                    // initialize if necessary
                    patternEnv9477[pattern9474.value] = {
                        level: 1,
                        match: [matchEnv9481],
                        topLevel: topLevel9478
                    };
                }
            } else {
                patternEnv9477[pattern9474.value] = matchEnv9481;
            }
            patternEnv9477 = loadPatternEnv9380(patternEnv9477, match9480.patternEnv, topLevel9478, pattern9474.repeat, pattern9474.value);
        }
    }
    return {
        success: success9483,
        rest: rest9482,
        patternEnv: patternEnv9477
    };
}
function initPatternEnv9379(toEnv9485, fromEnv9486, topLevel9487) {
    _9345.forEach(fromEnv9486, function (patternVal9488, patternKey9489) {
        if (!toEnv9485[patternKey9489]) {
            toEnv9485[patternKey9489] = {
                level: patternVal9488.level + 1,
                match: [patternVal9488],
                topLevel: topLevel9487
            };
        }
    });
    return toEnv9485;
}
function loadPatternEnv9380(toEnv9490, fromEnv9491, topLevel9492, repeat9493, prefix9494) {
    prefix9494 = prefix9494 || "";
    _9345.forEach(fromEnv9491, function (patternVal9495, patternKey9496) {
        var patternName9497 = prefix9494 + patternKey9496;
        if (repeat9493) {
            var nextLevel9498 = patternVal9495.level + 1;
            if (toEnv9490[patternName9497]) {
                toEnv9490[patternName9497].level = nextLevel9498;
                toEnv9490[patternName9497].match.push(patternVal9495);
            } else {
                toEnv9490[patternName9497] = {
                    level: nextLevel9498,
                    match: [patternVal9495],
                    topLevel: topLevel9492
                };
            }
        } else {
            toEnv9490[patternName9497] = patternVal9495;
        }
    });
    return toEnv9490;
}
function matchLookbehind9381(patterns9499, stx9500, terms9501, context9502) {
    var success9503, patternEnv9504, prevStx9505, prevTerms9506;
    if ( // No lookbehind, noop.
    !patterns9499.length) {
        success9503 = true;
        patternEnv9504 = {};
        prevStx9505 = stx9500;
        prevTerms9506 = terms9501;
    } else {
        var match9507 = matchPatterns9377(patterns9499, stx9500, context9502, true);
        var last9508 = match9507.result[match9507.result.length - 1];
        success9503 = match9507.success;
        patternEnv9504 = match9507.patternEnv;
        if (success9503) {
            if (match9507.rest.length) {
                if (last9508 && last9508.term && last9508.term === match9507.rest[0].term) {
                    // The term tree was split, so its a failed match;
                    success9503 = false;
                } else {
                    prevStx9505 = match9507.rest;
                    for (var
                    // Find where to slice the prevTerms to match up with
                    // the state of prevStx.
                    i9509 = 0, len9510 = terms9501.length; i9509 < len9510; i9509++) {
                        if (terms9501[i9509] === prevStx9505[0].term) {
                            prevTerms9506 = terms9501.slice(i9509);
                            break;
                        }
                    }
                    assert9349(prevTerms9506, "No matching previous term found");
                }
            } else {
                prevTerms9506 = [];
                prevStx9505 = [];
            }
        }
    }
    // We need to reverse the matches for any top level repeaters because
    // they match in reverse, and thus put their results in backwards.
    _9345.forEach(patternEnv9504, function (val9511, key9512) {
        if (val9511.level && val9511.match && val9511.topLevel) {
            val9511.match.reverse();
        }
    });
    return {
        success: success9503,
        patternEnv: patternEnv9504,
        prevStx: prevStx9505,
        prevTerms: prevTerms9506
    };
}
function hasMatch9382(m9513) {
    if (m9513.level === 0) {
        return m9513.match.length > 0;
    }
    return !!m9513.match;
}
function transcribe9383(macroBody9514, macroNameStx9515, env9516) {
    return _9345.chain(macroBody9514).reduce(function (acc9517, bodyStx9518, idx9519, original9520) {
        var // first find the ellipses and mark the syntax objects
        // (note that this step does not eagerly go into delimiter bodies)
        last9521 = original9520[idx9519 - 1];
        var next9522 = original9520[idx9519 + 1];
        var nextNext9523 = original9520[idx9519 + 2];
        if ( // drop `...`
        bodyStx9518.token.value === "...") {
            return acc9517;
        }
        if ( // drop `(<separator)` when followed by an ellipse
        delimIsSeparator9364(bodyStx9518) && next9522 && next9522.token.value === "...") {
            return acc9517;
        }
        if ( // skip the $ in $(...)
        bodyStx9518.token.value === "$" && next9522 && next9522.token.type === parser9346.Token.Delimiter && next9522.token.value === "()") {
            return acc9517;
        }
        if ( // mark $[...] as a literal
        bodyStx9518.token.value === "$" && next9522 && next9522.token.type === parser9346.Token.Delimiter && next9522.token.value === "[]") {
            next9522.literal = true;
            return acc9517;
        }
        if (bodyStx9518.token.type === parser9346.Token.Delimiter && bodyStx9518.token.value === "()" && last9521 && last9521.token.value === "$") {
            bodyStx9518.group = true;
        }
        if ( // literal [] delimiters have their bodies just
        // directly passed along
        bodyStx9518.literal === true) {
            assert9349(bodyStx9518.token.type === parser9346.Token.Delimiter, "expecting a literal to be surrounded by []");
            return acc9517.concat(bodyStx9518.token.inner);
        }
        if (next9522 && next9522.token.value === "...") {
            bodyStx9518.repeat = true;
            bodyStx9518.separator = " ";
        } else if (delimIsSeparator9364(next9522) && nextNext9523 && nextNext9523.token.value === "...") {
            bodyStx9518.repeat = true;
            bodyStx9518.separator = next9522.token.inner[0];
        }
        acc9517.push(bodyStx9518);
        return acc9517;
    }, []).reduce(function (acc9524, bodyStx9525, idx9526) {
        if ( // then do the actual transcription
        bodyStx9525.repeat) {
            if (bodyStx9525.token.type === parser9346.Token.Delimiter) {
                var fv9527 = _9345.filter(freeVarsInPattern9361(bodyStx9525.token.inner), function (pat9534) {
                    // ignore "patterns"
                    // that aren't in the
                    // environment (treat
                    // them like literals)
                    return env9516.hasOwnProperty(pat9534);
                });
                var restrictedEnv9528 = [];
                var nonScalar9529 = _9345.find(fv9527, function (pat9535) {
                    return env9516[pat9535].level > 0;
                });
                assert9349(typeof nonScalar9529 !== "undefined", "must have a least one non-scalar in repeat");
                var repeatLength9530 = env9516[nonScalar9529].match.length;
                var sameLength9531 = _9345.all(fv9527, function (pat9536) {
                    return env9516[pat9536].level === 0 || env9516[pat9536].match.length === repeatLength9530;
                });
                assert9349(sameLength9531, "all non-scalars must have the same length");
                // create a list of envs restricted to the free vars
                _9345.each(_9345.range(repeatLength9530), function (idx9537) {
                    var renv9538 = {};
                    _9345.each(fv9527, function (pat9540) {
                        if (env9516[pat9540].level === 0) {
                            // copy scalars over
                            renv9538[pat9540] = env9516[pat9540];
                        } else {
                            // grab the match at this index
                            renv9538[pat9540] = env9516[pat9540].match[idx9537];
                        }
                    });
                    var allHaveMatch9539 = Object.keys(renv9538).every(function (pat9541) {
                        return hasMatch9382(renv9538[pat9541]);
                    });
                    if (allHaveMatch9539) {
                        restrictedEnv9528.push(renv9538);
                    }
                });
                var transcribed9532 = _9345.map(restrictedEnv9528, function (renv9542) {
                    if (bodyStx9525.group) {
                        return transcribe9383(bodyStx9525.token.inner, macroNameStx9515, renv9542);
                    } else {
                        var newBody9543 = syntaxFromToken9351(_9345.clone(bodyStx9525.token), bodyStx9525);
                        newBody9543.token.inner = transcribe9383(bodyStx9525.token.inner, macroNameStx9515, renv9542);
                        return newBody9543;
                    }
                });
                var joined9533;
                if (bodyStx9525.group) {
                    joined9533 = joinSyntaxArray9356(transcribed9532, bodyStx9525.separator);
                } else {
                    joined9533 = joinSyntax9355(transcribed9532, bodyStx9525.separator);
                }
                push9360.apply(acc9524, joined9533);
                return acc9524;
            }
            if (!env9516[bodyStx9525.token.value]) {
                throwSyntaxError9359("patterns", "The pattern variable is not bound for the template", bodyStx9525);
            } else if (env9516[bodyStx9525.token.value].level !== 1) {
                throwSyntaxError9359("patterns", "Ellipses level does not match in the template", bodyStx9525);
            }
            push9360.apply(acc9524, joinRepeatedMatch9366(env9516[bodyStx9525.token.value].match, bodyStx9525.separator));
            return acc9524;
        } else {
            if (bodyStx9525.token.type === parser9346.Token.Delimiter) {
                var newBody9544 = syntaxFromToken9351(_9345.clone(bodyStx9525.token), macroBody9514);
                newBody9544.token.inner = transcribe9383(bodyStx9525.token.inner, macroNameStx9515, env9516);
                acc9524.push(newBody9544);
                return acc9524;
            }
            if (isPatternVar9365(bodyStx9525) && Object.prototype.hasOwnProperty.bind(env9516)(bodyStx9525.token.value)) {
                if (!env9516[bodyStx9525.token.value]) {
                    throwSyntaxError9359("patterns", "The pattern variable is not bound for the template", bodyStx9525);
                } else if (env9516[bodyStx9525.token.value].level !== 0) {
                    throwSyntaxError9359("patterns", "Ellipses level does not match in the template", bodyStx9525);
                }
                push9360.apply(acc9524, takeLineContext9367(bodyStx9525, env9516[bodyStx9525.token.value].match));
                return acc9524;
            }
            acc9524.push(syntaxFromToken9351(_9345.clone(bodyStx9525.token), bodyStx9525));
            return acc9524;
        }
    }, []).value();
}
function cloneMatch9384(oldMatch9545) {
    var newMatch9546 = {
        success: oldMatch9545.success,
        rest: oldMatch9545.rest,
        patternEnv: {}
    };
    for (var pat9547 in oldMatch9545.patternEnv) {
        if (oldMatch9545.patternEnv.hasOwnProperty(pat9547)) {
            newMatch9546.patternEnv[pat9547] = oldMatch9545.patternEnv[pat9547];
        }
    }
    return newMatch9546;
}
function makeIdentityRule9385(pattern9548, isInfix9549, context9550) {
    var inf9551 = [];
    var pat9552 = [];
    var stx9553 = [];
    if (isInfix9549) {
        for (var i9554 = 0; i9554 < pattern9548.length; i9554++) {
            if (pattern9548[i9554].token.type === parser9346.Token.Punctuator && pattern9548[i9554].token.value === "|") {
                pat9552.push(makeIdent9353("$inf", context9550), makePunc9352(":", context9550), makeDelim9354("()", inf9551, context9550), pattern9548[0], makeIdent9353("$id", context9550), makePunc9352(":", context9550), makeDelim9354("()", pat9552.slice(i9554 + 1), context9550));
                stx9553.push(makeIdent9353("$inf", context9550), makeIdent9353("$id", context9550));
                break;
            }
            inf9551.push(pattern9548[i9554]);
        }
    } else {
        pat9552.push(makeIdent9353("$id", context9550), makePunc9352(":", context9550), makeDelim9354("()", pattern9548, context9550));
        stx9553.push(makeIdent9353("$id", context9550));
    }
    return {
        pattern: pat9552,
        body: stx9553
    };
}
exports.loadPattern = loadPattern9373;
exports.matchPatterns = matchPatterns9377;
exports.matchLookbehind = matchLookbehind9381;
exports.transcribe = transcribe9383;
exports.matchPatternClass = matchPatternClass9376;
exports.takeLineContext = takeLineContext9367;
exports.takeLine = takeLine9368;
exports.typeIsLiteral = typeIsLiteral9362;
exports.cloneMatch = cloneMatch9384;
exports.makeIdentityRule = makeIdentityRule9385;
/*global require: true, exports:true
*/
//# sourceMappingURL=patterns.js.map