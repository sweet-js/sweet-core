"use strict";

var _9315 = require("underscore"),
    parser9316 = require("./parser"),
    expander9317 = require("./expander"),
    syntax9318 = require("./syntax"),
    assert9319 = require("assert");
var get_expression9320 = expander9317.get_expression;
var syntaxFromToken9321 = syntax9318.syntaxFromToken;
var makePunc9322 = syntax9318.makePunc;
var makeIdent9323 = syntax9318.makeIdent;
var makeDelim9324 = syntax9318.makeDelim;
var joinSyntax9325 = syntax9318.joinSyntax;
var joinSyntaxArray9326 = syntax9318.joinSyntaxArray;
var cloneSyntax9327 = syntax9318.cloneSyntax;
var cloneSyntaxArray9328 = syntax9318.cloneSyntaxArray;
var throwSyntaxError9329 = syntax9318.throwSyntaxError;
var push9330 = Array.prototype.push;
function freeVarsInPattern9331(pattern9356) {
    var fv9357 = [];
    _9315.each(pattern9356, function (pat9358) {
        if (isPatternVar9335(pat9358)) {
            fv9357.push(pat9358.token.value);
        } else if (pat9358.token.type === parser9316.Token.Delimiter) {
            push9330.apply(fv9357, freeVarsInPattern9331(pat9358.token.inner));
        }
    });
    return fv9357;
}
function typeIsLiteral9332(type9359) {
    return type9359 === parser9316.Token.NullLiteral || type9359 === parser9316.Token.NumericLiteral || type9359 === parser9316.Token.StringLiteral || type9359 === parser9316.Token.RegexLiteral || type9359 === parser9316.Token.BooleanLiteral;
}
function containsPatternVar9333(patterns9360) {
    return _9315.any(patterns9360, function (pat9361) {
        if (pat9361.token.type === parser9316.Token.Delimiter) {
            return containsPatternVar9333(pat9361.token.inner);
        }
        return isPatternVar9335(pat9361);
    });
}
function delimIsSeparator9334(delim9362) {
    return delim9362 && delim9362.token && delim9362.token.type === parser9316.Token.Delimiter && delim9362.token.value === "()" && delim9362.token.inner.length === 1 && delim9362.token.inner[0].token.type !== parser9316.Token.Delimiter && !containsPatternVar9333(delim9362.token.inner);
}
function isPatternVar9335(stx9363) {
    return stx9363.token.value[0] === "$" && stx9363.token.value !== "$";
}
function joinRepeatedMatch9336(tojoin9364, punc9365) {
    return _9315.reduce(_9315.rest(tojoin9364, 1), function (acc9366, join9367) {
        if (punc9365 === " ") {
            return acc9366.concat(cloneSyntaxArray9328(join9367.match));
        }
        return acc9366.concat(cloneSyntax9327(punc9365), cloneSyntaxArray9328(join9367.match));
    }, cloneSyntaxArray9328(_9315.first(tojoin9364).match));
}
function takeLineContext9337(from9368, to9369) {
    return _9315.map(to9369, function (stx9370) {
        return takeLine9338(from9368, stx9370);
    });
}
function takeLine9338(from9371, to9372) {
    var next9373;
    if (to9372.token.type === parser9316.Token.Delimiter) {
        var sm_startLineNumber9374 = typeof to9372.token.sm_startLineNumber !== "undefined" ? to9372.token.sm_startLineNumber : to9372.token.startLineNumber;
        var sm_endLineNumber9375 = typeof to9372.token.sm_endLineNumber !== "undefined" ? to9372.token.sm_endLineNumber : to9372.token.endLineNumber;
        var sm_startLineStart9376 = typeof to9372.token.sm_startLineStart !== "undefined" ? to9372.token.sm_startLineStart : to9372.token.startLineStart;
        var sm_endLineStart9377 = typeof to9372.token.sm_endLineStart !== "undefined" ? to9372.token.sm_endLineStart : to9372.token.endLineStart;
        var sm_startRange9378 = typeof to9372.token.sm_startRange !== "undefined" ? to9372.token.sm_startRange : to9372.token.startRange;
        var sm_endRange9379 = typeof to9372.token.sm_endRange !== "undefined" ? to9372.token.sm_endRange : to9372.token.endRange;
        if (from9371.token.type === parser9316.Token.Delimiter) {
            next9373 = syntaxFromToken9321({
                type: parser9316.Token.Delimiter,
                value: to9372.token.value,
                inner: takeLineContext9337(from9371, to9372.token.inner),
                startRange: from9371.token.startRange,
                endRange: from9371.token.endRange,
                startLineNumber: from9371.token.startLineNumber,
                startLineStart: from9371.token.startLineStart,
                endLineNumber: from9371.token.endLineNumber,
                endLineStart: from9371.token.endLineStart,
                sm_startLineNumber: sm_startLineNumber9374,
                sm_endLineNumber: sm_endLineNumber9375,
                sm_startLineStart: sm_startLineStart9376,
                sm_endLineStart: sm_endLineStart9377,
                sm_startRange: sm_startRange9378,
                sm_endRange: sm_endRange9379
            }, to9372);
        } else {
            next9373 = syntaxFromToken9321({
                type: parser9316.Token.Delimiter,
                value: to9372.token.value,
                inner: takeLineContext9337(from9371, to9372.token.inner),
                startRange: from9371.token.range,
                endRange: from9371.token.range,
                startLineNumber: from9371.token.lineNumber,
                startLineStart: from9371.token.lineStart,
                endLineNumber: from9371.token.lineNumber,
                endLineStart: from9371.token.lineStart,
                sm_startLineNumber: sm_startLineNumber9374,
                sm_endLineNumber: sm_endLineNumber9375,
                sm_startLineStart: sm_startLineStart9376,
                sm_endLineStart: sm_endLineStart9377,
                sm_startRange: sm_startRange9378,
                sm_endRange: sm_endRange9379
            }, to9372);
        }
    } else {
        var sm_lineNumber9380 = typeof to9372.token.sm_lineNumber !== "undefined" ? to9372.token.sm_lineNumber : to9372.token.lineNumber;
        var sm_lineStart9381 = typeof to9372.token.sm_lineStart !== "undefined" ? to9372.token.sm_lineStart : to9372.token.lineStart;
        var sm_range9382 = typeof to9372.token.sm_range !== "undefined" ? to9372.token.sm_range : to9372.token.range;
        if (from9371.token.type === parser9316.Token.Delimiter) {
            next9373 = syntaxFromToken9321({
                value: to9372.token.value,
                type: to9372.token.type,
                lineNumber: from9371.token.startLineNumber,
                lineStart: from9371.token.startLineStart,
                range: from9371.token.startRange,
                sm_lineNumber: sm_lineNumber9380,
                sm_lineStart: sm_lineStart9381,
                sm_range: sm_range9382
            }, to9372);
        } else {
            next9373 = syntaxFromToken9321({
                value: to9372.token.value,
                type: to9372.token.type,
                lineNumber: from9371.token.lineNumber,
                lineStart: from9371.token.lineStart,
                range: from9371.token.range,
                sm_lineNumber: sm_lineNumber9380,
                sm_lineStart: sm_lineStart9381,
                sm_range: sm_range9382
            }, to9372);
        }
    }
    if (to9372.token.leadingComments) {
        next9373.token.leadingComments = to9372.token.leadingComments;
    }
    if (to9372.token.trailingComments) {
        next9373.token.trailingComments = to9372.token.trailingComments;
    }
    return next9373;
}
function reversePattern9339(patterns9383) {
    var len9384 = patterns9383.length;
    var pat9385;
    return _9315.reduceRight(patterns9383, function (acc9386, pat9387) {
        if (pat9387["class"] === "pattern_group" || pat9387["class"] === "named_group") {
            pat9387.inner = reversePattern9339(pat9387.inner);
        }
        if (pat9387.repeat) {
            pat9387.leading = !pat9387.leading;
        }
        acc9386.push(pat9387);
        return acc9386;
    }, []);
}
function loadLiteralGroup9340(patterns9388) {
    return patterns9388.map(function (patStx9389) {
        var pat9390 = patternToObject9341(patStx9389);
        if (pat9390.inner) {
            pat9390.inner = loadLiteralGroup9340(pat9390.inner);
        } else {
            pat9390["class"] = "pattern_literal";
        }
        return pat9390;
    });
}
function patternToObject9341(pat9391) {
    var obj9392 = {
        type: pat9391.token.type,
        value: pat9391.token.value
    };
    if (pat9391.token.inner) {
        obj9392.inner = pat9391.token.inner;
    }
    return obj9392;
}
function isPrimaryClass9342(name9393) {
    return ["expr", "lit", "ident", "token", "invoke", "invokeRec"].indexOf(name9393) > -1;
}
function loadPattern9343(patterns9394, reverse9395) {
    var patts9396 = [];
    for (var i9397 = 0; i9397 < patterns9394.length; i9397++) {
        var tok19398 = patterns9394[i9397];
        var tok29399 = patterns9394[i9397 + 1];
        var tok39400 = patterns9394[i9397 + 2];
        var tok49401 = patterns9394[i9397 + 3];
        var last9402 = patts9396[patts9396.length - 1];
        var patt9403;
        assert9319(tok19398, "Expecting syntax object");
        if ( // Repeaters
        tok19398.token.type === parser9316.Token.Delimiter && tok19398.token.value === "()" && tok29399 && tok29399.token.type === parser9316.Token.Punctuator && tok29399.token.value === "..." && last9402) {
            assert9319(tok19398.token.inner.length === 1, "currently assuming all separators are a single token");
            i9397 += 1;
            last9402.repeat = true;
            last9402.separator = tok19398.token.inner[0];
            continue;
        } else if (tok19398.token.type === parser9316.Token.Punctuator && tok19398.token.value === "..." && last9402) {
            last9402.repeat = true;
            last9402.separator = " ";
            continue;
        } else if (isPatternVar9335(tok19398)) {
            patt9403 = patternToObject9341(tok19398);
            if (tok29399 && tok29399.token.type === parser9316.Token.Punctuator && tok29399.token.value === ":" && tok39400 && (tok39400.token.type === parser9316.Token.Identifier || tok39400.token.type === parser9316.Token.Delimiter && (tok39400.token.value === "[]" || tok39400.token.value === "()"))) {
                i9397 += 2;
                if (tok39400.token.value === "[]") {
                    patt9403["class"] = "named_group";
                    patt9403.inner = loadLiteralGroup9340(tok39400.token.inner);
                } else if (tok39400.token.value === "()") {
                    patt9403["class"] = "named_group";
                    patt9403.inner = loadPattern9343(tok39400.token.inner);
                } else if (isPrimaryClass9342(tok39400.token.value)) {
                    patt9403["class"] = tok39400.token.value;
                    if (patt9403["class"] === "invokeRec" || patt9403["class"] === "invoke") {
                        i9397 += 1;
                        if (tok49401.token.value === "()" && tok49401.token.inner.length) {
                            patt9403.macroName = tok49401.token.inner;
                        } else {
                            throwSyntaxError9329(patt9403["class"], "Expected macro parameter", tok39400);
                        }
                    }
                } else {
                    patt9403["class"] = "invoke";
                    patt9403.macroName = [tok39400];
                }
            } else {
                patt9403["class"] = "token";
            }
        } else if (tok19398.token.type === parser9316.Token.Identifier && tok19398.token.value === "$" && tok29399.token.type === parser9316.Token.Delimiter) {
            i9397 += 1;
            patt9403 = patternToObject9341(tok29399);
            patt9403["class"] = "pattern_group";
            if (patt9403.value === "[]") {
                patt9403.inner = loadLiteralGroup9340(patt9403.inner);
            } else {
                patt9403.inner = loadPattern9343(tok29399.token.inner);
            }
        } else if (tok19398.token.type === parser9316.Token.Identifier && tok19398.token.value === "_") {
            patt9403 = patternToObject9341(tok19398);
            patt9403["class"] = "wildcard";
        } else {
            patt9403 = patternToObject9341(tok19398);
            patt9403["class"] = "pattern_literal";
            if (patt9403.inner) {
                patt9403.inner = loadPattern9343(tok19398.token.inner);
            }
        }
        if ( // Macro classes aren't allowed in lookbehind because we wouldn't
        // know where to insert the macro, and you can't use a L->R macro
        // to match R->L.
        reverse9395 && patt9403.macroName) {
            throwSyntaxError9329(patt9403["class"], "Not allowed in top-level lookbehind", patt9403.macroName[0]);
        }
        patts9396.push(patt9403);
    }
    return reverse9395 ? reversePattern9339(patts9396) : patts9396;
}
function cachedTermMatch9344(stx9404, term9405) {
    var res9406 = [];
    var i9407 = 0;
    while (stx9404[i9407] && stx9404[i9407].term === term9405) {
        res9406.unshift(stx9404[i9407]);
        i9407++;
    }
    return {
        result: term9405,
        destructed: res9406,
        rest: stx9404.slice(res9406.length)
    };
}
function expandWithMacro9345(macroName9408, stx9409, context9410, rec9411) {
    var name9412 = macroName9408.map(syntax9318.unwrapSyntax).join("");
    var ident9413 = syntax9318.makeIdent(name9412, macroName9408[0]);
    var macroObj9414 = expander9317.getSyntaxTransform(ident9413, context9410, context9410.phase);
    var newContext9415 = expander9317.makeExpanderContext(context9410);
    if (!macroObj9414) {
        throwSyntaxError9329("invoke", "Macro not in scope", macroName9408[0]);
    }
    var next9416 = macroName9408.slice(-1).concat(stx9409);
    var rest9417, result9418, rt9419, patternEnv9420;
    while (macroObj9414 && next9416) {
        try {
            rt9419 = macroObj9414.fn(next9416, newContext9415, [], []);
            result9418 = rt9419.result;
            rest9417 = rt9419.rest;
            patternEnv9420 = rt9419.patterns;
        } catch (e9421) {
            if (e9421 instanceof syntax9318.SyntaxCaseError) {
                result9418 = null;
                rest9417 = stx9409;
                break;
            } else {
                throw e9421;
            }
        }
        if (rec9411 && result9418.length >= 1) {
            var nextMacro9422 = expander9317.getSyntaxTransform(result9418, context9410, context9410.phase);
            if (nextMacro9422) {
                macroObj9414 = nextMacro9422;
                next9416 = result9418.concat(rest9417);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    return {
        result: result9418,
        rest: rest9417,
        patternEnv: patternEnv9420
    };
}
function matchPatternClass9346(patternObj9423, stx9424, context9425) {
    var result9426, rest9427, match9428, patternEnv9429;
    if ( // pattern has no parse class
    patternObj9423["class"] === "token" && stx9424[0] && stx9424[0].token.type !== parser9316.Token.EOF) {
        result9426 = [stx9424[0]];
        rest9427 = stx9424.slice(1);
    } else if (patternObj9423["class"] === "lit" && stx9424[0] && typeIsLiteral9332(stx9424[0].token.type)) {
        result9426 = [stx9424[0]];
        rest9427 = stx9424.slice(1);
    } else if (patternObj9423["class"] === "ident" && stx9424[0] && stx9424[0].token.type === parser9316.Token.Identifier) {
        result9426 = [stx9424[0]];
        rest9427 = stx9424.slice(1);
    } else if (stx9424.length > 0 && patternObj9423["class"] === "VariableStatement") {
        match9428 = stx9424[0].term ? cachedTermMatch9344(stx9424, stx9424[0].term) : expander9317.enforest(stx9424, expander9317.makeExpanderContext(context9425));
        if (match9428.result && match9428.result.isVariableStatementTerm) {
            result9426 = match9428.destructed || match9428.result.destruct(context9425);
            rest9427 = match9428.rest;
        } else {
            result9426 = null;
            rest9427 = stx9424;
        }
    } else if (stx9424.length > 0 && patternObj9423["class"] === "expr") {
        match9428 = expander9317.get_expression(stx9424, expander9317.makeExpanderContext(context9425));
        if (match9428.result === null || !match9428.result.isExprTerm) {
            result9426 = null;
            rest9427 = stx9424;
        } else {
            result9426 = match9428.destructed || match9428.result.destruct(context9425);
            result9426 = [syntax9318.makeDelim("()", result9426, result9426[0])];
            rest9427 = match9428.rest;
        }
    } else if (stx9424.length > 0 && (patternObj9423["class"] === "invoke" || patternObj9423["class"] === "invokeRec")) {
        match9428 = expandWithMacro9345(patternObj9423.macroName, stx9424, context9425, patternObj9423["class"] === "invokeRec");
        result9426 = match9428.result;
        rest9427 = match9428.result ? match9428.rest : stx9424;
        patternEnv9429 = match9428.patternEnv;
    } else {
        result9426 = null;
        rest9427 = stx9424;
    }
    return {
        result: result9426,
        rest: rest9427,
        patternEnv: patternEnv9429
    };
}
function matchPatterns9347(patterns9430, stx9431, context9432, topLevel9433) {
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
    topLevel9433 = topLevel9433 || false;
    // note that there are two environments floating around,
    // one is the mapping of identifiers to macro definitions (env)
    // and the other is the pattern environment (patternEnv) that maps
    // patterns in a macro case to syntax.
    var result9434 = [];
    var patternEnv9435 = {};
    var match9436;
    var pattern9437;
    var rest9438 = stx9431;
    var success9439 = true;
    var inLeading9440;
    patternLoop: for (var i9441 = 0; i9441 < patterns9430.length; i9441++) {
        if (success9439 === false) {
            break;
        }
        pattern9437 = patterns9430[i9441];
        inLeading9440 = false;
        do {
            if ( // handles cases where patterns trail a repeated pattern like `$x ... ;`
            pattern9437.repeat && i9441 + 1 < patterns9430.length) {
                var restMatch9443 = matchPatterns9347(patterns9430.slice(i9441 + 1), rest9438, context9432, topLevel9433);
                if (restMatch9443.success) {
                    // match the repeat pattern on the empty array to fill in its
                    // pattern variable in the environment
                    match9436 = matchPattern9348(pattern9437, [], context9432, patternEnv9435, topLevel9433);
                    patternEnv9435 = _9315.extend(restMatch9443.patternEnv, match9436.patternEnv);
                    rest9438 = restMatch9443.rest;
                    break patternLoop;
                }
            }
            if (pattern9437.repeat && pattern9437.leading && pattern9437.separator !== " ") {
                if (rest9438[0].token.value === pattern9437.separator.token.value) {
                    if (!inLeading9440) {
                        inLeading9440 = true;
                    }
                    rest9438 = rest9438.slice(1);
                } else {
                    if ( // If we are in a leading repeat, the separator is required.
                    inLeading9440) {
                        success9439 = false;
                        break;
                    }
                }
            }
            match9436 = matchPattern9348(pattern9437, rest9438, context9432, patternEnv9435, topLevel9433);
            if (!match9436.success && pattern9437.repeat) {
                // a repeat can match zero tokens and still be a
                // "success" so break out of the inner loop and
                // try the next pattern
                break;
            }
            if (!match9436.success) {
                success9439 = false;
                break;
            }
            rest9438 = match9436.rest;
            patternEnv9435 = match9436.patternEnv;
            if (success9439 && !(topLevel9433 || pattern9437.repeat)) {
                if ( // the very last pattern matched, inside a
                // delimiter, not a repeat, *and* there are more
                // unmatched bits of syntax
                i9441 == patterns9430.length - 1 && rest9438.length !== 0) {
                    success9439 = false;
                    break;
                }
            }
            if (pattern9437.repeat && !pattern9437.leading && success9439) {
                if ( // if (i < patterns.length - 1 && rest.length > 0) {
                //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                //     if (restMatch.success) {
                //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                //         rest = restMatch.rest;
                //         break patternLoop;
                //     }
                // }
                pattern9437.separator === " ") {
                    // no separator specified (using the empty string for this)
                    // so keep going
                    continue;
                } else if (rest9438[0] && rest9438[0].token.value === pattern9437.separator.token.value) {
                    // more tokens and the next token matches the separator
                    rest9438 = rest9438.slice(1);
                } else if (pattern9437.separator !== " " && rest9438.length > 0 && i9441 === patterns9430.length - 1 && topLevel9433 === false) {
                    // separator is specified, there is a next token, the
                    // next token doesn't match the separator, there are
                    // no more patterns, and this is a top level pattern
                    // so the match has failed
                    success9439 = false;
                    break;
                } else {
                    break;
                }
            }
        } while (pattern9437.repeat && success9439 && rest9438.length > 0);
    }
    if ( // If we are in a delimiter and we haven't matched all the syntax, it
    // was a failed match.
    !topLevel9433 && rest9438.length) {
        success9439 = false;
    }
    var result9434;
    if (success9439) {
        result9434 = rest9438.length ? stx9431.slice(0, -rest9438.length) : stx9431;
    } else {
        result9434 = [];
    }
    return {
        success: success9439,
        result: result9434,
        rest: rest9438,
        patternEnv: patternEnv9435
    };
}
function matchPattern9348(pattern9444, stx9445, context9446, patternEnv9447, topLevel9448) {
    var subMatch9449;
    var match9450, matchEnv9451;
    var rest9452;
    var success9453;
    if (typeof pattern9444.inner !== "undefined") {
        if (pattern9444["class"] === "pattern_group") {
            // pattern groups don't match the delimiters
            subMatch9449 = matchPatterns9347(pattern9444.inner, stx9445, context9446, true);
            rest9452 = subMatch9449.rest;
            success9453 = subMatch9449.success;
        } else if (pattern9444["class"] === "named_group") {
            subMatch9449 = matchPatterns9347(pattern9444.inner, stx9445, context9446, true);
            rest9452 = subMatch9449.rest;
            success9453 = subMatch9449.success;
            if (success9453) {
                var namedMatch9454 = {};
                namedMatch9454[pattern9444.value] = {
                    level: 0,
                    match: subMatch9449.result,
                    topLevel: topLevel9448
                };
                subMatch9449.patternEnv = loadPatternEnv9350(namedMatch9454, subMatch9449.patternEnv, topLevel9448, false, pattern9444.value);
            }
        } else if (stx9445[0] && stx9445[0].token.type === parser9316.Token.Delimiter && stx9445[0].token.value === pattern9444.value) {
            if (pattern9444.inner.length === 0 && stx9445[0].token.inner.length !== 0) {
                return {
                    success: false,
                    rest: stx9445,
                    patternEnv: patternEnv9447
                };
            }
            subMatch9449 = matchPatterns9347(pattern9444.inner, stx9445[0].token.inner, context9446, false);
            rest9452 = stx9445.slice(1);
            success9453 = subMatch9449.success;
        } else {
            subMatch9449 = matchPatterns9347(pattern9444.inner, [], context9446, false);
            success9453 = false;
        }
        if (success9453) {
            patternEnv9447 = loadPatternEnv9350(patternEnv9447, subMatch9449.patternEnv, topLevel9448, pattern9444.repeat);
        } else if (pattern9444.repeat) {
            patternEnv9447 = initPatternEnv9349(patternEnv9447, subMatch9449.patternEnv, topLevel9448);
        }
    } else {
        if (pattern9444["class"] === "wildcard") {
            success9453 = true;
            rest9452 = stx9445.slice(1);
        } else if (pattern9444["class"] === "pattern_literal") {
            if ( // match the literal but don't update the pattern environment
            stx9445[0] && pattern9444.value === stx9445[0].token.value) {
                success9453 = true;
                rest9452 = stx9445.slice(1);
            } else {
                success9453 = false;
                rest9452 = stx9445;
            }
        } else {
            match9450 = matchPatternClass9346(pattern9444, stx9445, context9446);
            success9453 = match9450.result !== null;
            rest9452 = match9450.rest;
            matchEnv9451 = {
                level: 0,
                match: match9450.result,
                topLevel: topLevel9448
            };
            if ( // push the match onto this value's slot in the environment
            pattern9444.repeat) {
                if (patternEnv9447[pattern9444.value] && success9453) {
                    patternEnv9447[pattern9444.value].match.push(matchEnv9451);
                } else if (patternEnv9447[pattern9444.value] === undefined) {
                    // initialize if necessary
                    patternEnv9447[pattern9444.value] = {
                        level: 1,
                        match: [matchEnv9451],
                        topLevel: topLevel9448
                    };
                }
            } else {
                patternEnv9447[pattern9444.value] = matchEnv9451;
            }
            patternEnv9447 = loadPatternEnv9350(patternEnv9447, match9450.patternEnv, topLevel9448, pattern9444.repeat, pattern9444.value);
        }
    }
    return {
        success: success9453,
        rest: rest9452,
        patternEnv: patternEnv9447
    };
}
function initPatternEnv9349(toEnv9455, fromEnv9456, topLevel9457) {
    _9315.forEach(fromEnv9456, function (patternVal9458, patternKey9459) {
        if (!toEnv9455[patternKey9459]) {
            toEnv9455[patternKey9459] = {
                level: patternVal9458.level + 1,
                match: [patternVal9458],
                topLevel: topLevel9457
            };
        }
    });
    return toEnv9455;
}
function loadPatternEnv9350(toEnv9460, fromEnv9461, topLevel9462, repeat9463, prefix9464) {
    prefix9464 = prefix9464 || "";
    _9315.forEach(fromEnv9461, function (patternVal9465, patternKey9466) {
        var patternName9467 = prefix9464 + patternKey9466;
        if (repeat9463) {
            var nextLevel9468 = patternVal9465.level + 1;
            if (toEnv9460[patternName9467]) {
                toEnv9460[patternName9467].level = nextLevel9468;
                toEnv9460[patternName9467].match.push(patternVal9465);
            } else {
                toEnv9460[patternName9467] = {
                    level: nextLevel9468,
                    match: [patternVal9465],
                    topLevel: topLevel9462
                };
            }
        } else {
            toEnv9460[patternName9467] = patternVal9465;
        }
    });
    return toEnv9460;
}
function matchLookbehind9351(patterns9469, stx9470, terms9471, context9472) {
    var success9473, patternEnv9474, prevStx9475, prevTerms9476;
    if ( // No lookbehind, noop.
    !patterns9469.length) {
        success9473 = true;
        patternEnv9474 = {};
        prevStx9475 = stx9470;
        prevTerms9476 = terms9471;
    } else {
        var match9477 = matchPatterns9347(patterns9469, stx9470, context9472, true);
        var last9478 = match9477.result[match9477.result.length - 1];
        success9473 = match9477.success;
        patternEnv9474 = match9477.patternEnv;
        if (success9473) {
            if (match9477.rest.length) {
                if (last9478 && last9478.term && last9478.term === match9477.rest[0].term) {
                    // The term tree was split, so its a failed match;
                    success9473 = false;
                } else {
                    prevStx9475 = match9477.rest;
                    for (var
                    // Find where to slice the prevTerms to match up with
                    // the state of prevStx.
                    i9479 = 0, len9480 = terms9471.length; i9479 < len9480; i9479++) {
                        if (terms9471[i9479] === prevStx9475[0].term) {
                            prevTerms9476 = terms9471.slice(i9479);
                            break;
                        }
                    }
                    assert9319(prevTerms9476, "No matching previous term found");
                }
            } else {
                prevTerms9476 = [];
                prevStx9475 = [];
            }
        }
    }
    // We need to reverse the matches for any top level repeaters because
    // they match in reverse, and thus put their results in backwards.
    _9315.forEach(patternEnv9474, function (val9481, key9482) {
        if (val9481.level && val9481.match && val9481.topLevel) {
            val9481.match.reverse();
        }
    });
    return {
        success: success9473,
        patternEnv: patternEnv9474,
        prevStx: prevStx9475,
        prevTerms: prevTerms9476
    };
}
function hasMatch9352(m9483) {
    if (m9483.level === 0) {
        return m9483.match.length > 0;
    }
    return !!m9483.match;
}
function transcribe9353(macroBody9484, macroNameStx9485, env9486) {
    return _9315.chain(macroBody9484).reduce(function (acc9487, bodyStx9488, idx9489, original9490) {
        var // first find the ellipses and mark the syntax objects
        // (note that this step does not eagerly go into delimiter bodies)
        last9491 = original9490[idx9489 - 1];
        var next9492 = original9490[idx9489 + 1];
        var nextNext9493 = original9490[idx9489 + 2];
        if ( // drop `...`
        bodyStx9488.token.value === "...") {
            return acc9487;
        }
        if ( // drop `(<separator)` when followed by an ellipse
        delimIsSeparator9334(bodyStx9488) && next9492 && next9492.token.value === "...") {
            return acc9487;
        }
        if ( // skip the $ in $(...)
        bodyStx9488.token.value === "$" && next9492 && next9492.token.type === parser9316.Token.Delimiter && next9492.token.value === "()") {
            return acc9487;
        }
        if ( // mark $[...] as a literal
        bodyStx9488.token.value === "$" && next9492 && next9492.token.type === parser9316.Token.Delimiter && next9492.token.value === "[]") {
            next9492.literal = true;
            return acc9487;
        }
        if (bodyStx9488.token.type === parser9316.Token.Delimiter && bodyStx9488.token.value === "()" && last9491 && last9491.token.value === "$") {
            bodyStx9488.group = true;
        }
        if ( // literal [] delimiters have their bodies just
        // directly passed along
        bodyStx9488.literal === true) {
            assert9319(bodyStx9488.token.type === parser9316.Token.Delimiter, "expecting a literal to be surrounded by []");
            return acc9487.concat(bodyStx9488.token.inner);
        }
        if (next9492 && next9492.token.value === "...") {
            bodyStx9488.repeat = true;
            bodyStx9488.separator = " ";
        } else if (delimIsSeparator9334(next9492) && nextNext9493 && nextNext9493.token.value === "...") {
            bodyStx9488.repeat = true;
            bodyStx9488.separator = next9492.token.inner[0];
        }
        acc9487.push(bodyStx9488);
        return acc9487;
    }, []).reduce(function (acc9494, bodyStx9495, idx9496) {
        if ( // then do the actual transcription
        bodyStx9495.repeat) {
            if (bodyStx9495.token.type === parser9316.Token.Delimiter) {
                var fv9497 = _9315.filter(freeVarsInPattern9331(bodyStx9495.token.inner), function (pat9504) {
                    // ignore "patterns"
                    // that aren't in the
                    // environment (treat
                    // them like literals)
                    return env9486.hasOwnProperty(pat9504);
                });
                var restrictedEnv9498 = [];
                var nonScalar9499 = _9315.find(fv9497, function (pat9505) {
                    return env9486[pat9505].level > 0;
                });
                assert9319(typeof nonScalar9499 !== "undefined", "must have a least one non-scalar in repeat");
                var repeatLength9500 = env9486[nonScalar9499].match.length;
                var sameLength9501 = _9315.all(fv9497, function (pat9506) {
                    return env9486[pat9506].level === 0 || env9486[pat9506].match.length === repeatLength9500;
                });
                assert9319(sameLength9501, "all non-scalars must have the same length");
                // create a list of envs restricted to the free vars
                _9315.each(_9315.range(repeatLength9500), function (idx9507) {
                    var renv9508 = {};
                    _9315.each(fv9497, function (pat9510) {
                        if (env9486[pat9510].level === 0) {
                            // copy scalars over
                            renv9508[pat9510] = env9486[pat9510];
                        } else {
                            // grab the match at this index
                            renv9508[pat9510] = env9486[pat9510].match[idx9507];
                        }
                    });
                    var allHaveMatch9509 = Object.keys(renv9508).every(function (pat9511) {
                        return hasMatch9352(renv9508[pat9511]);
                    });
                    if (allHaveMatch9509) {
                        restrictedEnv9498.push(renv9508);
                    }
                });
                var transcribed9502 = _9315.map(restrictedEnv9498, function (renv9512) {
                    if (bodyStx9495.group) {
                        return transcribe9353(bodyStx9495.token.inner, macroNameStx9485, renv9512);
                    } else {
                        var newBody9513 = syntaxFromToken9321(_9315.clone(bodyStx9495.token), bodyStx9495);
                        newBody9513.token.inner = transcribe9353(bodyStx9495.token.inner, macroNameStx9485, renv9512);
                        return newBody9513;
                    }
                });
                var joined9503;
                if (bodyStx9495.group) {
                    joined9503 = joinSyntaxArray9326(transcribed9502, bodyStx9495.separator);
                } else {
                    joined9503 = joinSyntax9325(transcribed9502, bodyStx9495.separator);
                }
                push9330.apply(acc9494, joined9503);
                return acc9494;
            }
            if (!env9486[bodyStx9495.token.value]) {
                throwSyntaxError9329("patterns", "The pattern variable is not bound for the template", bodyStx9495);
            } else if (env9486[bodyStx9495.token.value].level !== 1) {
                throwSyntaxError9329("patterns", "Ellipses level does not match in the template", bodyStx9495);
            }
            push9330.apply(acc9494, joinRepeatedMatch9336(env9486[bodyStx9495.token.value].match, bodyStx9495.separator));
            return acc9494;
        } else {
            if (bodyStx9495.token.type === parser9316.Token.Delimiter) {
                var newBody9514 = syntaxFromToken9321(_9315.clone(bodyStx9495.token), macroBody9484);
                newBody9514.token.inner = transcribe9353(bodyStx9495.token.inner, macroNameStx9485, env9486);
                acc9494.push(newBody9514);
                return acc9494;
            }
            if (isPatternVar9335(bodyStx9495) && Object.prototype.hasOwnProperty.bind(env9486)(bodyStx9495.token.value)) {
                if (!env9486[bodyStx9495.token.value]) {
                    throwSyntaxError9329("patterns", "The pattern variable is not bound for the template", bodyStx9495);
                } else if (env9486[bodyStx9495.token.value].level !== 0) {
                    throwSyntaxError9329("patterns", "Ellipses level does not match in the template", bodyStx9495);
                }
                push9330.apply(acc9494, takeLineContext9337(bodyStx9495, env9486[bodyStx9495.token.value].match));
                return acc9494;
            }
            acc9494.push(syntaxFromToken9321(_9315.clone(bodyStx9495.token), bodyStx9495));
            return acc9494;
        }
    }, []).value();
}
function cloneMatch9354(oldMatch9515) {
    var newMatch9516 = {
        success: oldMatch9515.success,
        rest: oldMatch9515.rest,
        patternEnv: {}
    };
    for (var pat9517 in oldMatch9515.patternEnv) {
        if (oldMatch9515.patternEnv.hasOwnProperty(pat9517)) {
            newMatch9516.patternEnv[pat9517] = oldMatch9515.patternEnv[pat9517];
        }
    }
    return newMatch9516;
}
function makeIdentityRule9355(pattern9518, isInfix9519, context9520) {
    var inf9521 = [];
    var pat9522 = [];
    var stx9523 = [];
    if (isInfix9519) {
        for (var i9524 = 0; i9524 < pattern9518.length; i9524++) {
            if (pattern9518[i9524].token.type === parser9316.Token.Punctuator && pattern9518[i9524].token.value === "|") {
                pat9522.push(makeIdent9323("$inf", context9520), makePunc9322(":", context9520), makeDelim9324("()", inf9521, context9520), pattern9518[0], makeIdent9323("$id", context9520), makePunc9322(":", context9520), makeDelim9324("()", pat9522.slice(i9524 + 1), context9520));
                stx9523.push(makeIdent9323("$inf", context9520), makeIdent9323("$id", context9520));
                break;
            }
            inf9521.push(pattern9518[i9524]);
        }
    } else {
        pat9522.push(makeIdent9323("$id", context9520), makePunc9322(":", context9520), makeDelim9324("()", pattern9518, context9520));
        stx9523.push(makeIdent9323("$id", context9520));
    }
    return {
        pattern: pat9522,
        body: stx9523
    };
}
exports.loadPattern = loadPattern9343;
exports.matchPatterns = matchPatterns9347;
exports.matchLookbehind = matchLookbehind9351;
exports.transcribe = transcribe9353;
exports.matchPatternClass = matchPatternClass9346;
exports.takeLineContext = takeLineContext9337;
exports.takeLine = takeLine9338;
exports.typeIsLiteral = typeIsLiteral9332;
exports.cloneMatch = cloneMatch9354;
exports.makeIdentityRule = makeIdentityRule9355;
/*global require: true, exports:true
*/
//# sourceMappingURL=patterns.js.map