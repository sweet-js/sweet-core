"use strict";

var _9311 = require("underscore"),
    parser9312 = require("./parser"),
    expander9313 = require("./expander"),
    syntax9314 = require("./syntax"),
    assert9315 = require("assert");
var get_expression9316 = expander9313.get_expression;
var syntaxFromToken9317 = syntax9314.syntaxFromToken;
var makePunc9318 = syntax9314.makePunc;
var makeIdent9319 = syntax9314.makeIdent;
var makeDelim9320 = syntax9314.makeDelim;
var joinSyntax9321 = syntax9314.joinSyntax;
var joinSyntaxArray9322 = syntax9314.joinSyntaxArray;
var cloneSyntax9323 = syntax9314.cloneSyntax;
var cloneSyntaxArray9324 = syntax9314.cloneSyntaxArray;
var throwSyntaxError9325 = syntax9314.throwSyntaxError;
var push9326 = Array.prototype.push;
function freeVarsInPattern9327(pattern9352) {
    var fv9353 = [];
    _9311.each(pattern9352, function (pat9354) {
        if (isPatternVar9331(pat9354)) {
            fv9353.push(pat9354.token.value);
        } else if (pat9354.token.type === parser9312.Token.Delimiter) {
            push9326.apply(fv9353, freeVarsInPattern9327(pat9354.token.inner));
        }
    });
    return fv9353;
}
function typeIsLiteral9328(type9355) {
    return type9355 === parser9312.Token.NullLiteral || type9355 === parser9312.Token.NumericLiteral || type9355 === parser9312.Token.StringLiteral || type9355 === parser9312.Token.RegexLiteral || type9355 === parser9312.Token.BooleanLiteral;
}
function containsPatternVar9329(patterns9356) {
    return _9311.any(patterns9356, function (pat9357) {
        if (pat9357.token.type === parser9312.Token.Delimiter) {
            return containsPatternVar9329(pat9357.token.inner);
        }
        return isPatternVar9331(pat9357);
    });
}
function delimIsSeparator9330(delim9358) {
    return delim9358 && delim9358.token && delim9358.token.type === parser9312.Token.Delimiter && delim9358.token.value === "()" && delim9358.token.inner.length === 1 && delim9358.token.inner[0].token.type !== parser9312.Token.Delimiter && !containsPatternVar9329(delim9358.token.inner);
}
function isPatternVar9331(stx9359) {
    return stx9359.token.value[0] === "$" && stx9359.token.value !== "$";
}
function joinRepeatedMatch9332(tojoin9360, punc9361) {
    return _9311.reduce(_9311.rest(tojoin9360, 1), function (acc9362, join9363) {
        if (punc9361 === " ") {
            return acc9362.concat(cloneSyntaxArray9324(join9363.match));
        }
        return acc9362.concat(cloneSyntax9323(punc9361), cloneSyntaxArray9324(join9363.match));
    }, cloneSyntaxArray9324(_9311.first(tojoin9360).match));
}
function takeLineContext9333(from9364, to9365) {
    return _9311.map(to9365, function (stx9366) {
        return takeLine9334(from9364, stx9366);
    });
}
function takeLine9334(from9367, to9368) {
    var next9369;
    if (to9368.token.type === parser9312.Token.Delimiter) {
        var sm_startLineNumber9370 = typeof to9368.token.sm_startLineNumber !== "undefined" ? to9368.token.sm_startLineNumber : to9368.token.startLineNumber;
        var sm_endLineNumber9371 = typeof to9368.token.sm_endLineNumber !== "undefined" ? to9368.token.sm_endLineNumber : to9368.token.endLineNumber;
        var sm_startLineStart9372 = typeof to9368.token.sm_startLineStart !== "undefined" ? to9368.token.sm_startLineStart : to9368.token.startLineStart;
        var sm_endLineStart9373 = typeof to9368.token.sm_endLineStart !== "undefined" ? to9368.token.sm_endLineStart : to9368.token.endLineStart;
        var sm_startRange9374 = typeof to9368.token.sm_startRange !== "undefined" ? to9368.token.sm_startRange : to9368.token.startRange;
        var sm_endRange9375 = typeof to9368.token.sm_endRange !== "undefined" ? to9368.token.sm_endRange : to9368.token.endRange;
        if (from9367.token.type === parser9312.Token.Delimiter) {
            next9369 = syntaxFromToken9317({
                type: parser9312.Token.Delimiter,
                value: to9368.token.value,
                inner: takeLineContext9333(from9367, to9368.token.inner),
                startRange: from9367.token.startRange,
                endRange: from9367.token.endRange,
                startLineNumber: from9367.token.startLineNumber,
                startLineStart: from9367.token.startLineStart,
                endLineNumber: from9367.token.endLineNumber,
                endLineStart: from9367.token.endLineStart,
                sm_startLineNumber: sm_startLineNumber9370,
                sm_endLineNumber: sm_endLineNumber9371,
                sm_startLineStart: sm_startLineStart9372,
                sm_endLineStart: sm_endLineStart9373,
                sm_startRange: sm_startRange9374,
                sm_endRange: sm_endRange9375
            }, to9368);
        } else {
            next9369 = syntaxFromToken9317({
                type: parser9312.Token.Delimiter,
                value: to9368.token.value,
                inner: takeLineContext9333(from9367, to9368.token.inner),
                startRange: from9367.token.range,
                endRange: from9367.token.range,
                startLineNumber: from9367.token.lineNumber,
                startLineStart: from9367.token.lineStart,
                endLineNumber: from9367.token.lineNumber,
                endLineStart: from9367.token.lineStart,
                sm_startLineNumber: sm_startLineNumber9370,
                sm_endLineNumber: sm_endLineNumber9371,
                sm_startLineStart: sm_startLineStart9372,
                sm_endLineStart: sm_endLineStart9373,
                sm_startRange: sm_startRange9374,
                sm_endRange: sm_endRange9375
            }, to9368);
        }
    } else {
        var sm_lineNumber9376 = typeof to9368.token.sm_lineNumber !== "undefined" ? to9368.token.sm_lineNumber : to9368.token.lineNumber;
        var sm_lineStart9377 = typeof to9368.token.sm_lineStart !== "undefined" ? to9368.token.sm_lineStart : to9368.token.lineStart;
        var sm_range9378 = typeof to9368.token.sm_range !== "undefined" ? to9368.token.sm_range : to9368.token.range;
        if (from9367.token.type === parser9312.Token.Delimiter) {
            next9369 = syntaxFromToken9317({
                value: to9368.token.value,
                type: to9368.token.type,
                lineNumber: from9367.token.startLineNumber,
                lineStart: from9367.token.startLineStart,
                range: from9367.token.startRange,
                sm_lineNumber: sm_lineNumber9376,
                sm_lineStart: sm_lineStart9377,
                sm_range: sm_range9378
            }, to9368);
        } else {
            next9369 = syntaxFromToken9317({
                value: to9368.token.value,
                type: to9368.token.type,
                lineNumber: from9367.token.lineNumber,
                lineStart: from9367.token.lineStart,
                range: from9367.token.range,
                sm_lineNumber: sm_lineNumber9376,
                sm_lineStart: sm_lineStart9377,
                sm_range: sm_range9378
            }, to9368);
        }
    }
    if (to9368.token.leadingComments) {
        next9369.token.leadingComments = to9368.token.leadingComments;
    }
    if (to9368.token.trailingComments) {
        next9369.token.trailingComments = to9368.token.trailingComments;
    }
    return next9369;
}
function reversePattern9335(patterns9379) {
    var len9380 = patterns9379.length;
    var pat9381;
    return _9311.reduceRight(patterns9379, function (acc9382, pat9383) {
        if (pat9383["class"] === "pattern_group" || pat9383["class"] === "named_group") {
            pat9383.inner = reversePattern9335(pat9383.inner);
        }
        if (pat9383.repeat) {
            pat9383.leading = !pat9383.leading;
        }
        acc9382.push(pat9383);
        return acc9382;
    }, []);
}
function loadLiteralGroup9336(patterns9384) {
    return patterns9384.map(function (patStx9385) {
        var pat9386 = patternToObject9337(patStx9385);
        if (pat9386.inner) {
            pat9386.inner = loadLiteralGroup9336(pat9386.inner);
        } else {
            pat9386["class"] = "pattern_literal";
        }
        return pat9386;
    });
}
function patternToObject9337(pat9387) {
    var obj9388 = {
        type: pat9387.token.type,
        value: pat9387.token.value
    };
    if (pat9387.token.inner) {
        obj9388.inner = pat9387.token.inner;
    }
    return obj9388;
}
function isPrimaryClass9338(name9389) {
    return ["expr", "lit", "ident", "token", "invoke", "invokeRec"].indexOf(name9389) > -1;
}
function loadPattern9339(patterns9390, reverse9391) {
    var patts9392 = [];
    for (var i9393 = 0; i9393 < patterns9390.length; i9393++) {
        var tok19394 = patterns9390[i9393];
        var tok29395 = patterns9390[i9393 + 1];
        var tok39396 = patterns9390[i9393 + 2];
        var tok49397 = patterns9390[i9393 + 3];
        var last9398 = patts9392[patts9392.length - 1];
        var patt9399;
        assert9315(tok19394, "Expecting syntax object");
        if ( // Repeaters
        tok19394.token.type === parser9312.Token.Delimiter && tok19394.token.value === "()" && tok29395 && tok29395.token.type === parser9312.Token.Punctuator && tok29395.token.value === "..." && last9398) {
            assert9315(tok19394.token.inner.length === 1, "currently assuming all separators are a single token");
            i9393 += 1;
            last9398.repeat = true;
            last9398.separator = tok19394.token.inner[0];
            continue;
        } else if (tok19394.token.type === parser9312.Token.Punctuator && tok19394.token.value === "..." && last9398) {
            last9398.repeat = true;
            last9398.separator = " ";
            continue;
        } else if (isPatternVar9331(tok19394)) {
            patt9399 = patternToObject9337(tok19394);
            if (tok29395 && tok29395.token.type === parser9312.Token.Punctuator && tok29395.token.value === ":" && tok39396 && (tok39396.token.type === parser9312.Token.Identifier || tok39396.token.type === parser9312.Token.Delimiter && (tok39396.token.value === "[]" || tok39396.token.value === "()"))) {
                i9393 += 2;
                if (tok39396.token.value === "[]") {
                    patt9399["class"] = "named_group";
                    patt9399.inner = loadLiteralGroup9336(tok39396.token.inner);
                } else if (tok39396.token.value === "()") {
                    patt9399["class"] = "named_group";
                    patt9399.inner = loadPattern9339(tok39396.token.inner);
                } else if (isPrimaryClass9338(tok39396.token.value)) {
                    patt9399["class"] = tok39396.token.value;
                    if (patt9399["class"] === "invokeRec" || patt9399["class"] === "invoke") {
                        i9393 += 1;
                        if (tok49397.token.value === "()" && tok49397.token.inner.length) {
                            patt9399.macroName = tok49397.token.inner;
                        } else {
                            throwSyntaxError9325(patt9399["class"], "Expected macro parameter", tok39396);
                        }
                    }
                } else {
                    patt9399["class"] = "invoke";
                    patt9399.macroName = [tok39396];
                }
            } else {
                patt9399["class"] = "token";
            }
        } else if (tok19394.token.type === parser9312.Token.Identifier && tok19394.token.value === "$" && tok29395.token.type === parser9312.Token.Delimiter) {
            i9393 += 1;
            patt9399 = patternToObject9337(tok29395);
            patt9399["class"] = "pattern_group";
            if (patt9399.value === "[]") {
                patt9399.inner = loadLiteralGroup9336(patt9399.inner);
            } else {
                patt9399.inner = loadPattern9339(tok29395.token.inner);
            }
        } else if (tok19394.token.type === parser9312.Token.Identifier && tok19394.token.value === "_") {
            patt9399 = patternToObject9337(tok19394);
            patt9399["class"] = "wildcard";
        } else {
            patt9399 = patternToObject9337(tok19394);
            patt9399["class"] = "pattern_literal";
            if (patt9399.inner) {
                patt9399.inner = loadPattern9339(tok19394.token.inner);
            }
        }
        if ( // Macro classes aren't allowed in lookbehind because we wouldn't
        // know where to insert the macro, and you can't use a L->R macro
        // to match R->L.
        reverse9391 && patt9399.macroName) {
            throwSyntaxError9325(patt9399["class"], "Not allowed in top-level lookbehind", patt9399.macroName[0]);
        }
        patts9392.push(patt9399);
    }
    return reverse9391 ? reversePattern9335(patts9392) : patts9392;
}
function cachedTermMatch9340(stx9400, term9401) {
    var res9402 = [];
    var i9403 = 0;
    while (stx9400[i9403] && stx9400[i9403].term === term9401) {
        res9402.unshift(stx9400[i9403]);
        i9403++;
    }
    return {
        result: term9401,
        destructed: res9402,
        rest: stx9400.slice(res9402.length)
    };
}
function expandWithMacro9341(macroName9404, stx9405, context9406, rec9407) {
    var name9408 = macroName9404.map(syntax9314.unwrapSyntax).join("");
    var ident9409 = syntax9314.makeIdent(name9408, macroName9404[0]);
    var macroObj9410 = expander9313.getSyntaxTransform(ident9409, context9406, context9406.phase);
    var newContext9411 = expander9313.makeExpanderContext(context9406);
    if (!macroObj9410) {
        throwSyntaxError9325("invoke", "Macro not in scope", macroName9404[0]);
    }
    var next9412 = macroName9404.slice(-1).concat(stx9405);
    var rest9413, result9414, rt9415, patternEnv9416;
    while (macroObj9410 && next9412) {
        try {
            rt9415 = macroObj9410.fn(next9412, newContext9411, [], []);
            result9414 = rt9415.result;
            rest9413 = rt9415.rest;
            patternEnv9416 = rt9415.patterns;
        } catch (e9417) {
            if (e9417 instanceof syntax9314.SyntaxCaseError) {
                result9414 = null;
                rest9413 = stx9405;
                break;
            } else {
                throw e9417;
            }
        }
        if (rec9407 && result9414.length >= 1) {
            var nextMacro9418 = expander9313.getSyntaxTransform(result9414, context9406, context9406.phase);
            if (nextMacro9418) {
                macroObj9410 = nextMacro9418;
                next9412 = result9414.concat(rest9413);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    return {
        result: result9414,
        rest: rest9413,
        patternEnv: patternEnv9416
    };
}
function matchPatternClass9342(patternObj9419, stx9420, context9421) {
    var result9422, rest9423, match9424, patternEnv9425;
    if ( // pattern has no parse class
    patternObj9419["class"] === "token" && stx9420[0] && stx9420[0].token.type !== parser9312.Token.EOF) {
        result9422 = [stx9420[0]];
        rest9423 = stx9420.slice(1);
    } else if (patternObj9419["class"] === "lit" && stx9420[0] && typeIsLiteral9328(stx9420[0].token.type)) {
        result9422 = [stx9420[0]];
        rest9423 = stx9420.slice(1);
    } else if (patternObj9419["class"] === "ident" && stx9420[0] && stx9420[0].token.type === parser9312.Token.Identifier) {
        result9422 = [stx9420[0]];
        rest9423 = stx9420.slice(1);
    } else if (stx9420.length > 0 && patternObj9419["class"] === "VariableStatement") {
        match9424 = stx9420[0].term ? cachedTermMatch9340(stx9420, stx9420[0].term) : expander9313.enforest(stx9420, expander9313.makeExpanderContext(context9421));
        if (match9424.result && match9424.result.isVariableStatementTerm) {
            result9422 = match9424.destructed || match9424.result.destruct(context9421);
            rest9423 = match9424.rest;
        } else {
            result9422 = null;
            rest9423 = stx9420;
        }
    } else if (stx9420.length > 0 && patternObj9419["class"] === "expr") {
        match9424 = expander9313.get_expression(stx9420, expander9313.makeExpanderContext(context9421));
        if (match9424.result === null || !match9424.result.isExprTerm) {
            result9422 = null;
            rest9423 = stx9420;
        } else {
            result9422 = match9424.destructed || match9424.result.destruct(context9421);
            result9422 = [syntax9314.makeDelim("()", result9422, result9422[0])];
            rest9423 = match9424.rest;
        }
    } else if (stx9420.length > 0 && (patternObj9419["class"] === "invoke" || patternObj9419["class"] === "invokeRec")) {
        match9424 = expandWithMacro9341(patternObj9419.macroName, stx9420, context9421, patternObj9419["class"] === "invokeRec");
        result9422 = match9424.result;
        rest9423 = match9424.result ? match9424.rest : stx9420;
        patternEnv9425 = match9424.patternEnv;
    } else {
        result9422 = null;
        rest9423 = stx9420;
    }
    return {
        result: result9422,
        rest: rest9423,
        patternEnv: patternEnv9425
    };
}
function matchPatterns9343(patterns9426, stx9427, context9428, topLevel9429) {
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
    topLevel9429 = topLevel9429 || false;
    // note that there are two environments floating around,
    // one is the mapping of identifiers to macro definitions (env)
    // and the other is the pattern environment (patternEnv) that maps
    // patterns in a macro case to syntax.
    var result9430 = [];
    var patternEnv9431 = {};
    var match9432;
    var pattern9433;
    var rest9434 = stx9427;
    var success9435 = true;
    var inLeading9436;
    patternLoop: for (var i9437 = 0; i9437 < patterns9426.length; i9437++) {
        if (success9435 === false) {
            break;
        }
        pattern9433 = patterns9426[i9437];
        inLeading9436 = false;
        do {
            if ( // handles cases where patterns trail a repeated pattern like `$x ... ;`
            pattern9433.repeat && i9437 + 1 < patterns9426.length) {
                var restMatch9439 = matchPatterns9343(patterns9426.slice(i9437 + 1), rest9434, context9428, topLevel9429);
                if (restMatch9439.success) {
                    // match the repeat pattern on the empty array to fill in its
                    // pattern variable in the environment
                    match9432 = matchPattern9344(pattern9433, [], context9428, patternEnv9431, topLevel9429);
                    patternEnv9431 = _9311.extend(restMatch9439.patternEnv, match9432.patternEnv);
                    rest9434 = restMatch9439.rest;
                    break patternLoop;
                }
            }
            if (pattern9433.repeat && pattern9433.leading && pattern9433.separator !== " ") {
                if (rest9434[0].token.value === pattern9433.separator.token.value) {
                    if (!inLeading9436) {
                        inLeading9436 = true;
                    }
                    rest9434 = rest9434.slice(1);
                } else {
                    if ( // If we are in a leading repeat, the separator is required.
                    inLeading9436) {
                        success9435 = false;
                        break;
                    }
                }
            }
            match9432 = matchPattern9344(pattern9433, rest9434, context9428, patternEnv9431, topLevel9429);
            if (!match9432.success && pattern9433.repeat) {
                // a repeat can match zero tokens and still be a
                // "success" so break out of the inner loop and
                // try the next pattern
                break;
            }
            if (!match9432.success) {
                success9435 = false;
                break;
            }
            rest9434 = match9432.rest;
            patternEnv9431 = match9432.patternEnv;
            if (success9435 && !(topLevel9429 || pattern9433.repeat)) {
                if ( // the very last pattern matched, inside a
                // delimiter, not a repeat, *and* there are more
                // unmatched bits of syntax
                i9437 == patterns9426.length - 1 && rest9434.length !== 0) {
                    success9435 = false;
                    break;
                }
            }
            if (pattern9433.repeat && !pattern9433.leading && success9435) {
                if ( // if (i < patterns.length - 1 && rest.length > 0) {
                //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                //     if (restMatch.success) {
                //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                //         rest = restMatch.rest;
                //         break patternLoop;
                //     }
                // }
                pattern9433.separator === " ") {
                    // no separator specified (using the empty string for this)
                    // so keep going
                    continue;
                } else if (rest9434[0] && rest9434[0].token.value === pattern9433.separator.token.value) {
                    // more tokens and the next token matches the separator
                    rest9434 = rest9434.slice(1);
                } else if (pattern9433.separator !== " " && rest9434.length > 0 && i9437 === patterns9426.length - 1 && topLevel9429 === false) {
                    // separator is specified, there is a next token, the
                    // next token doesn't match the separator, there are
                    // no more patterns, and this is a top level pattern
                    // so the match has failed
                    success9435 = false;
                    break;
                } else {
                    break;
                }
            }
        } while (pattern9433.repeat && success9435 && rest9434.length > 0);
    }
    if ( // If we are in a delimiter and we haven't matched all the syntax, it
    // was a failed match.
    !topLevel9429 && rest9434.length) {
        success9435 = false;
    }
    var result9430;
    if (success9435) {
        result9430 = rest9434.length ? stx9427.slice(0, -rest9434.length) : stx9427;
    } else {
        result9430 = [];
    }
    return {
        success: success9435,
        result: result9430,
        rest: rest9434,
        patternEnv: patternEnv9431
    };
}
function matchPattern9344(pattern9440, stx9441, context9442, patternEnv9443, topLevel9444) {
    var subMatch9445;
    var match9446, matchEnv9447;
    var rest9448;
    var success9449;
    if (typeof pattern9440.inner !== "undefined") {
        if (pattern9440["class"] === "pattern_group") {
            // pattern groups don't match the delimiters
            subMatch9445 = matchPatterns9343(pattern9440.inner, stx9441, context9442, true);
            rest9448 = subMatch9445.rest;
            success9449 = subMatch9445.success;
        } else if (pattern9440["class"] === "named_group") {
            subMatch9445 = matchPatterns9343(pattern9440.inner, stx9441, context9442, true);
            rest9448 = subMatch9445.rest;
            success9449 = subMatch9445.success;
            if (success9449) {
                var namedMatch9450 = {};
                namedMatch9450[pattern9440.value] = {
                    level: 0,
                    match: subMatch9445.result,
                    topLevel: topLevel9444
                };
                subMatch9445.patternEnv = loadPatternEnv9346(namedMatch9450, subMatch9445.patternEnv, topLevel9444, false, pattern9440.value);
            }
        } else if (stx9441[0] && stx9441[0].token.type === parser9312.Token.Delimiter && stx9441[0].token.value === pattern9440.value) {
            if (pattern9440.inner.length === 0 && stx9441[0].token.inner.length !== 0) {
                return {
                    success: false,
                    rest: stx9441,
                    patternEnv: patternEnv9443
                };
            }
            subMatch9445 = matchPatterns9343(pattern9440.inner, stx9441[0].token.inner, context9442, false);
            rest9448 = stx9441.slice(1);
            success9449 = subMatch9445.success;
        } else {
            subMatch9445 = matchPatterns9343(pattern9440.inner, [], context9442, false);
            success9449 = false;
        }
        if (success9449) {
            patternEnv9443 = loadPatternEnv9346(patternEnv9443, subMatch9445.patternEnv, topLevel9444, pattern9440.repeat);
        } else if (pattern9440.repeat) {
            patternEnv9443 = initPatternEnv9345(patternEnv9443, subMatch9445.patternEnv, topLevel9444);
        }
    } else {
        if (pattern9440["class"] === "wildcard") {
            success9449 = true;
            rest9448 = stx9441.slice(1);
        } else if (pattern9440["class"] === "pattern_literal") {
            if ( // match the literal but don't update the pattern environment
            stx9441[0] && pattern9440.value === stx9441[0].token.value) {
                success9449 = true;
                rest9448 = stx9441.slice(1);
            } else {
                success9449 = false;
                rest9448 = stx9441;
            }
        } else {
            match9446 = matchPatternClass9342(pattern9440, stx9441, context9442);
            success9449 = match9446.result !== null;
            rest9448 = match9446.rest;
            matchEnv9447 = {
                level: 0,
                match: match9446.result,
                topLevel: topLevel9444
            };
            if ( // push the match onto this value's slot in the environment
            pattern9440.repeat) {
                if (patternEnv9443[pattern9440.value] && success9449) {
                    patternEnv9443[pattern9440.value].match.push(matchEnv9447);
                } else if (patternEnv9443[pattern9440.value] === undefined) {
                    // initialize if necessary
                    patternEnv9443[pattern9440.value] = {
                        level: 1,
                        match: [matchEnv9447],
                        topLevel: topLevel9444
                    };
                }
            } else {
                patternEnv9443[pattern9440.value] = matchEnv9447;
            }
            patternEnv9443 = loadPatternEnv9346(patternEnv9443, match9446.patternEnv, topLevel9444, pattern9440.repeat, pattern9440.value);
        }
    }
    return {
        success: success9449,
        rest: rest9448,
        patternEnv: patternEnv9443
    };
}
function initPatternEnv9345(toEnv9451, fromEnv9452, topLevel9453) {
    _9311.forEach(fromEnv9452, function (patternVal9454, patternKey9455) {
        if (!toEnv9451[patternKey9455]) {
            toEnv9451[patternKey9455] = {
                level: patternVal9454.level + 1,
                match: [patternVal9454],
                topLevel: topLevel9453
            };
        }
    });
    return toEnv9451;
}
function loadPatternEnv9346(toEnv9456, fromEnv9457, topLevel9458, repeat9459, prefix9460) {
    prefix9460 = prefix9460 || "";
    _9311.forEach(fromEnv9457, function (patternVal9461, patternKey9462) {
        var patternName9463 = prefix9460 + patternKey9462;
        if (repeat9459) {
            var nextLevel9464 = patternVal9461.level + 1;
            if (toEnv9456[patternName9463]) {
                toEnv9456[patternName9463].level = nextLevel9464;
                toEnv9456[patternName9463].match.push(patternVal9461);
            } else {
                toEnv9456[patternName9463] = {
                    level: nextLevel9464,
                    match: [patternVal9461],
                    topLevel: topLevel9458
                };
            }
        } else {
            toEnv9456[patternName9463] = patternVal9461;
        }
    });
    return toEnv9456;
}
function matchLookbehind9347(patterns9465, stx9466, terms9467, context9468) {
    var success9469, patternEnv9470, prevStx9471, prevTerms9472;
    if ( // No lookbehind, noop.
    !patterns9465.length) {
        success9469 = true;
        patternEnv9470 = {};
        prevStx9471 = stx9466;
        prevTerms9472 = terms9467;
    } else {
        var match9473 = matchPatterns9343(patterns9465, stx9466, context9468, true);
        var last9474 = match9473.result[match9473.result.length - 1];
        success9469 = match9473.success;
        patternEnv9470 = match9473.patternEnv;
        if (success9469) {
            if (match9473.rest.length) {
                if (last9474 && last9474.term && last9474.term === match9473.rest[0].term) {
                    // The term tree was split, so its a failed match;
                    success9469 = false;
                } else {
                    prevStx9471 = match9473.rest;
                    for (var
                    // Find where to slice the prevTerms to match up with
                    // the state of prevStx.
                    i9475 = 0, len9476 = terms9467.length; i9475 < len9476; i9475++) {
                        if (terms9467[i9475] === prevStx9471[0].term) {
                            prevTerms9472 = terms9467.slice(i9475);
                            break;
                        }
                    }
                    assert9315(prevTerms9472, "No matching previous term found");
                }
            } else {
                prevTerms9472 = [];
                prevStx9471 = [];
            }
        }
    }
    // We need to reverse the matches for any top level repeaters because
    // they match in reverse, and thus put their results in backwards.
    _9311.forEach(patternEnv9470, function (val9477, key9478) {
        if (val9477.level && val9477.match && val9477.topLevel) {
            val9477.match.reverse();
        }
    });
    return {
        success: success9469,
        patternEnv: patternEnv9470,
        prevStx: prevStx9471,
        prevTerms: prevTerms9472
    };
}
function hasMatch9348(m9479) {
    if (m9479.level === 0) {
        return m9479.match.length > 0;
    }
    return !!m9479.match;
}
function transcribe9349(macroBody9480, macroNameStx9481, env9482) {
    return _9311.chain(macroBody9480).reduce(function (acc9483, bodyStx9484, idx9485, original9486) {
        var // first find the ellipses and mark the syntax objects
        // (note that this step does not eagerly go into delimiter bodies)
        last9487 = original9486[idx9485 - 1];
        var next9488 = original9486[idx9485 + 1];
        var nextNext9489 = original9486[idx9485 + 2];
        if ( // drop `...`
        bodyStx9484.token.value === "...") {
            return acc9483;
        }
        if ( // drop `(<separator)` when followed by an ellipse
        delimIsSeparator9330(bodyStx9484) && next9488 && next9488.token.value === "...") {
            return acc9483;
        }
        if ( // skip the $ in $(...)
        bodyStx9484.token.value === "$" && next9488 && next9488.token.type === parser9312.Token.Delimiter && next9488.token.value === "()") {
            return acc9483;
        }
        if ( // mark $[...] as a literal
        bodyStx9484.token.value === "$" && next9488 && next9488.token.type === parser9312.Token.Delimiter && next9488.token.value === "[]") {
            next9488.literal = true;
            return acc9483;
        }
        if (bodyStx9484.token.type === parser9312.Token.Delimiter && bodyStx9484.token.value === "()" && last9487 && last9487.token.value === "$") {
            bodyStx9484.group = true;
        }
        if ( // literal [] delimiters have their bodies just
        // directly passed along
        bodyStx9484.literal === true) {
            assert9315(bodyStx9484.token.type === parser9312.Token.Delimiter, "expecting a literal to be surrounded by []");
            return acc9483.concat(bodyStx9484.token.inner);
        }
        if (next9488 && next9488.token.value === "...") {
            bodyStx9484.repeat = true;
            bodyStx9484.separator = " ";
        } else if (delimIsSeparator9330(next9488) && nextNext9489 && nextNext9489.token.value === "...") {
            bodyStx9484.repeat = true;
            bodyStx9484.separator = next9488.token.inner[0];
        }
        acc9483.push(bodyStx9484);
        return acc9483;
    }, []).reduce(function (acc9490, bodyStx9491, idx9492) {
        if ( // then do the actual transcription
        bodyStx9491.repeat) {
            if (bodyStx9491.token.type === parser9312.Token.Delimiter) {
                var fv9493 = _9311.filter(freeVarsInPattern9327(bodyStx9491.token.inner), function (pat9500) {
                    // ignore "patterns"
                    // that aren't in the
                    // environment (treat
                    // them like literals)
                    return env9482.hasOwnProperty(pat9500);
                });
                var restrictedEnv9494 = [];
                var nonScalar9495 = _9311.find(fv9493, function (pat9501) {
                    return env9482[pat9501].level > 0;
                });
                assert9315(typeof nonScalar9495 !== "undefined", "must have a least one non-scalar in repeat");
                var repeatLength9496 = env9482[nonScalar9495].match.length;
                var sameLength9497 = _9311.all(fv9493, function (pat9502) {
                    return env9482[pat9502].level === 0 || env9482[pat9502].match.length === repeatLength9496;
                });
                assert9315(sameLength9497, "all non-scalars must have the same length");
                // create a list of envs restricted to the free vars
                _9311.each(_9311.range(repeatLength9496), function (idx9503) {
                    var renv9504 = {};
                    _9311.each(fv9493, function (pat9506) {
                        if (env9482[pat9506].level === 0) {
                            // copy scalars over
                            renv9504[pat9506] = env9482[pat9506];
                        } else {
                            // grab the match at this index
                            renv9504[pat9506] = env9482[pat9506].match[idx9503];
                        }
                    });
                    var allHaveMatch9505 = Object.keys(renv9504).every(function (pat9507) {
                        return hasMatch9348(renv9504[pat9507]);
                    });
                    if (allHaveMatch9505) {
                        restrictedEnv9494.push(renv9504);
                    }
                });
                var transcribed9498 = _9311.map(restrictedEnv9494, function (renv9508) {
                    if (bodyStx9491.group) {
                        return transcribe9349(bodyStx9491.token.inner, macroNameStx9481, renv9508);
                    } else {
                        var newBody9509 = syntaxFromToken9317(_9311.clone(bodyStx9491.token), bodyStx9491);
                        newBody9509.token.inner = transcribe9349(bodyStx9491.token.inner, macroNameStx9481, renv9508);
                        return newBody9509;
                    }
                });
                var joined9499;
                if (bodyStx9491.group) {
                    joined9499 = joinSyntaxArray9322(transcribed9498, bodyStx9491.separator);
                } else {
                    joined9499 = joinSyntax9321(transcribed9498, bodyStx9491.separator);
                }
                push9326.apply(acc9490, joined9499);
                return acc9490;
            }
            if (!env9482[bodyStx9491.token.value]) {
                throwSyntaxError9325("patterns", "The pattern variable is not bound for the template", bodyStx9491);
            } else if (env9482[bodyStx9491.token.value].level !== 1) {
                throwSyntaxError9325("patterns", "Ellipses level does not match in the template", bodyStx9491);
            }
            push9326.apply(acc9490, joinRepeatedMatch9332(env9482[bodyStx9491.token.value].match, bodyStx9491.separator));
            return acc9490;
        } else {
            if (bodyStx9491.token.type === parser9312.Token.Delimiter) {
                var newBody9510 = syntaxFromToken9317(_9311.clone(bodyStx9491.token), macroBody9480);
                newBody9510.token.inner = transcribe9349(bodyStx9491.token.inner, macroNameStx9481, env9482);
                acc9490.push(newBody9510);
                return acc9490;
            }
            if (isPatternVar9331(bodyStx9491) && Object.prototype.hasOwnProperty.bind(env9482)(bodyStx9491.token.value)) {
                if (!env9482[bodyStx9491.token.value]) {
                    throwSyntaxError9325("patterns", "The pattern variable is not bound for the template", bodyStx9491);
                } else if (env9482[bodyStx9491.token.value].level !== 0) {
                    throwSyntaxError9325("patterns", "Ellipses level does not match in the template", bodyStx9491);
                }
                push9326.apply(acc9490, takeLineContext9333(bodyStx9491, env9482[bodyStx9491.token.value].match));
                return acc9490;
            }
            acc9490.push(syntaxFromToken9317(_9311.clone(bodyStx9491.token), bodyStx9491));
            return acc9490;
        }
    }, []).value();
}
function cloneMatch9350(oldMatch9511) {
    var newMatch9512 = {
        success: oldMatch9511.success,
        rest: oldMatch9511.rest,
        patternEnv: {}
    };
    for (var pat9513 in oldMatch9511.patternEnv) {
        if (oldMatch9511.patternEnv.hasOwnProperty(pat9513)) {
            newMatch9512.patternEnv[pat9513] = oldMatch9511.patternEnv[pat9513];
        }
    }
    return newMatch9512;
}
function makeIdentityRule9351(pattern9514, isInfix9515, context9516) {
    var inf9517 = [];
    var pat9518 = [];
    var stx9519 = [];
    if (isInfix9515) {
        for (var i9520 = 0; i9520 < pattern9514.length; i9520++) {
            if (pattern9514[i9520].token.type === parser9312.Token.Punctuator && pattern9514[i9520].token.value === "|") {
                pat9518.push(makeIdent9319("$inf", context9516), makePunc9318(":", context9516), makeDelim9320("()", inf9517, context9516), pattern9514[0], makeIdent9319("$id", context9516), makePunc9318(":", context9516), makeDelim9320("()", pat9518.slice(i9520 + 1), context9516));
                stx9519.push(makeIdent9319("$inf", context9516), makeIdent9319("$id", context9516));
                break;
            }
            inf9517.push(pattern9514[i9520]);
        }
    } else {
        pat9518.push(makeIdent9319("$id", context9516), makePunc9318(":", context9516), makeDelim9320("()", pattern9514, context9516));
        stx9519.push(makeIdent9319("$id", context9516));
    }
    return {
        pattern: pat9518,
        body: stx9519
    };
}
exports.loadPattern = loadPattern9339;
exports.matchPatterns = matchPatterns9343;
exports.matchLookbehind = matchLookbehind9347;
exports.transcribe = transcribe9349;
exports.matchPatternClass = matchPatternClass9342;
exports.takeLineContext = takeLineContext9333;
exports.takeLine = takeLine9334;
exports.typeIsLiteral = typeIsLiteral9328;
exports.cloneMatch = cloneMatch9350;
exports.makeIdentityRule = makeIdentityRule9351;
/*global require: true, exports:true
*/
//# sourceMappingURL=patterns.js.map