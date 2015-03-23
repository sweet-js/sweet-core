"use strict";

var _9100 = require("underscore"),
    parser9101 = require("./parser"),
    expander9102 = require("./expander"),
    syntax9103 = require("./syntax"),
    assert9104 = require("assert");
var get_expression9105 = expander9102.get_expression;
var syntaxFromToken9106 = syntax9103.syntaxFromToken;
var makePunc9107 = syntax9103.makePunc;
var makeIdent9108 = syntax9103.makeIdent;
var makeDelim9109 = syntax9103.makeDelim;
var joinSyntax9110 = syntax9103.joinSyntax;
var joinSyntaxArray9111 = syntax9103.joinSyntaxArray;
var cloneSyntax9112 = syntax9103.cloneSyntax;
var cloneSyntaxArray9113 = syntax9103.cloneSyntaxArray;
var throwSyntaxError9114 = syntax9103.throwSyntaxError;
var push9115 = Array.prototype.push;
function freeVarsInPattern9116(pattern9141) {
    var fv9142 = [];
    _9100.each(pattern9141, function (pat9143) {
        if (isPatternVar9120(pat9143)) {
            fv9142.push(pat9143.token.value);
        } else if (pat9143.token.type === parser9101.Token.Delimiter) {
            push9115.apply(fv9142, freeVarsInPattern9116(pat9143.token.inner));
        }
    });
    return fv9142;
}
function typeIsLiteral9117(type9144) {
    return type9144 === parser9101.Token.NullLiteral || type9144 === parser9101.Token.NumericLiteral || type9144 === parser9101.Token.StringLiteral || type9144 === parser9101.Token.RegexLiteral || type9144 === parser9101.Token.BooleanLiteral;
}
function containsPatternVar9118(patterns9145) {
    return _9100.any(patterns9145, function (pat9146) {
        if (pat9146.token.type === parser9101.Token.Delimiter) {
            return containsPatternVar9118(pat9146.token.inner);
        }
        return isPatternVar9120(pat9146);
    });
}
function delimIsSeparator9119(delim9147) {
    return delim9147 && delim9147.token && delim9147.token.type === parser9101.Token.Delimiter && delim9147.token.value === "()" && delim9147.token.inner.length === 1 && delim9147.token.inner[0].token.type !== parser9101.Token.Delimiter && !containsPatternVar9118(delim9147.token.inner);
}
function isPatternVar9120(stx9148) {
    return stx9148.token.value[0] === "$" && stx9148.token.value !== "$";
}
function joinRepeatedMatch9121(tojoin9149, punc9150) {
    return _9100.reduce(_9100.rest(tojoin9149, 1), function (acc9151, join9152) {
        if (punc9150 === " ") {
            return acc9151.concat(cloneSyntaxArray9113(join9152.match));
        }
        return acc9151.concat(cloneSyntax9112(punc9150), cloneSyntaxArray9113(join9152.match));
    }, cloneSyntaxArray9113(_9100.first(tojoin9149).match));
}
function takeLineContext9122(from9153, to9154) {
    return _9100.map(to9154, function (stx9155) {
        return takeLine9123(from9153, stx9155);
    });
}
function takeLine9123(from9156, to9157) {
    var next9158;
    if (to9157.token.type === parser9101.Token.Delimiter) {
        var sm_startLineNumber9159 = typeof to9157.token.sm_startLineNumber !== "undefined" ? to9157.token.sm_startLineNumber : to9157.token.startLineNumber;
        var sm_endLineNumber9160 = typeof to9157.token.sm_endLineNumber !== "undefined" ? to9157.token.sm_endLineNumber : to9157.token.endLineNumber;
        var sm_startLineStart9161 = typeof to9157.token.sm_startLineStart !== "undefined" ? to9157.token.sm_startLineStart : to9157.token.startLineStart;
        var sm_endLineStart9162 = typeof to9157.token.sm_endLineStart !== "undefined" ? to9157.token.sm_endLineStart : to9157.token.endLineStart;
        var sm_startRange9163 = typeof to9157.token.sm_startRange !== "undefined" ? to9157.token.sm_startRange : to9157.token.startRange;
        var sm_endRange9164 = typeof to9157.token.sm_endRange !== "undefined" ? to9157.token.sm_endRange : to9157.token.endRange;
        if (from9156.token.type === parser9101.Token.Delimiter) {
            next9158 = syntaxFromToken9106({
                type: parser9101.Token.Delimiter,
                value: to9157.token.value,
                inner: takeLineContext9122(from9156, to9157.token.inner),
                startRange: from9156.token.startRange,
                endRange: from9156.token.endRange,
                startLineNumber: from9156.token.startLineNumber,
                startLineStart: from9156.token.startLineStart,
                endLineNumber: from9156.token.endLineNumber,
                endLineStart: from9156.token.endLineStart,
                sm_startLineNumber: sm_startLineNumber9159,
                sm_endLineNumber: sm_endLineNumber9160,
                sm_startLineStart: sm_startLineStart9161,
                sm_endLineStart: sm_endLineStart9162,
                sm_startRange: sm_startRange9163,
                sm_endRange: sm_endRange9164
            }, to9157);
        } else {
            next9158 = syntaxFromToken9106({
                type: parser9101.Token.Delimiter,
                value: to9157.token.value,
                inner: takeLineContext9122(from9156, to9157.token.inner),
                startRange: from9156.token.range,
                endRange: from9156.token.range,
                startLineNumber: from9156.token.lineNumber,
                startLineStart: from9156.token.lineStart,
                endLineNumber: from9156.token.lineNumber,
                endLineStart: from9156.token.lineStart,
                sm_startLineNumber: sm_startLineNumber9159,
                sm_endLineNumber: sm_endLineNumber9160,
                sm_startLineStart: sm_startLineStart9161,
                sm_endLineStart: sm_endLineStart9162,
                sm_startRange: sm_startRange9163,
                sm_endRange: sm_endRange9164
            }, to9157);
        }
    } else {
        var sm_lineNumber9165 = typeof to9157.token.sm_lineNumber !== "undefined" ? to9157.token.sm_lineNumber : to9157.token.lineNumber;
        var sm_lineStart9166 = typeof to9157.token.sm_lineStart !== "undefined" ? to9157.token.sm_lineStart : to9157.token.lineStart;
        var sm_range9167 = typeof to9157.token.sm_range !== "undefined" ? to9157.token.sm_range : to9157.token.range;
        if (from9156.token.type === parser9101.Token.Delimiter) {
            next9158 = syntaxFromToken9106({
                value: to9157.token.value,
                type: to9157.token.type,
                lineNumber: from9156.token.startLineNumber,
                lineStart: from9156.token.startLineStart,
                range: from9156.token.startRange,
                sm_lineNumber: sm_lineNumber9165,
                sm_lineStart: sm_lineStart9166,
                sm_range: sm_range9167
            }, to9157);
        } else {
            next9158 = syntaxFromToken9106({
                value: to9157.token.value,
                type: to9157.token.type,
                lineNumber: from9156.token.lineNumber,
                lineStart: from9156.token.lineStart,
                range: from9156.token.range,
                sm_lineNumber: sm_lineNumber9165,
                sm_lineStart: sm_lineStart9166,
                sm_range: sm_range9167
            }, to9157);
        }
    }
    if (to9157.token.leadingComments) {
        next9158.token.leadingComments = to9157.token.leadingComments;
    }
    if (to9157.token.trailingComments) {
        next9158.token.trailingComments = to9157.token.trailingComments;
    }
    return next9158;
}
function reversePattern9124(patterns9168) {
    var len9169 = patterns9168.length;
    var pat9170;
    return _9100.reduceRight(patterns9168, function (acc9171, pat9172) {
        if (pat9172["class"] === "pattern_group" || pat9172["class"] === "named_group") {
            pat9172.inner = reversePattern9124(pat9172.inner);
        }
        if (pat9172.repeat) {
            pat9172.leading = !pat9172.leading;
        }
        acc9171.push(pat9172);
        return acc9171;
    }, []);
}
function loadLiteralGroup9125(patterns9173) {
    return patterns9173.map(function (patStx9174) {
        var pat9175 = patternToObject9126(patStx9174);
        if (pat9175.inner) {
            pat9175.inner = loadLiteralGroup9125(pat9175.inner);
        } else {
            pat9175["class"] = "pattern_literal";
        }
        return pat9175;
    });
}
function patternToObject9126(pat9176) {
    var obj9177 = {
        type: pat9176.token.type,
        value: pat9176.token.value
    };
    if (pat9176.token.inner) {
        obj9177.inner = pat9176.token.inner;
    }
    return obj9177;
}
function isPrimaryClass9127(name9178) {
    return ["expr", "lit", "ident", "token", "invoke", "invokeRec"].indexOf(name9178) > -1;
}
function loadPattern9128(patterns9179, reverse9180) {
    var patts9181 = [];
    for (var i9182 = 0; i9182 < patterns9179.length; i9182++) {
        var tok19183 = patterns9179[i9182];
        var tok29184 = patterns9179[i9182 + 1];
        var tok39185 = patterns9179[i9182 + 2];
        var tok49186 = patterns9179[i9182 + 3];
        var last9187 = patts9181[patts9181.length - 1];
        var patt9188;
        assert9104(tok19183, "Expecting syntax object");
        if ( // Repeaters
        tok19183.token.type === parser9101.Token.Delimiter && tok19183.token.value === "()" && tok29184 && tok29184.token.type === parser9101.Token.Punctuator && tok29184.token.value === "..." && last9187) {
            assert9104(tok19183.token.inner.length === 1, "currently assuming all separators are a single token");
            i9182 += 1;
            last9187.repeat = true;
            last9187.separator = tok19183.token.inner[0];
            continue;
        } else if (tok19183.token.type === parser9101.Token.Punctuator && tok19183.token.value === "..." && last9187) {
            last9187.repeat = true;
            last9187.separator = " ";
            continue;
        } else if (isPatternVar9120(tok19183)) {
            patt9188 = patternToObject9126(tok19183);
            if (tok29184 && tok29184.token.type === parser9101.Token.Punctuator && tok29184.token.value === ":" && tok39185 && (tok39185.token.type === parser9101.Token.Identifier || tok39185.token.type === parser9101.Token.Delimiter && (tok39185.token.value === "[]" || tok39185.token.value === "()"))) {
                i9182 += 2;
                if (tok39185.token.value === "[]") {
                    patt9188["class"] = "named_group";
                    patt9188.inner = loadLiteralGroup9125(tok39185.token.inner);
                } else if (tok39185.token.value === "()") {
                    patt9188["class"] = "named_group";
                    patt9188.inner = loadPattern9128(tok39185.token.inner);
                } else if (isPrimaryClass9127(tok39185.token.value)) {
                    patt9188["class"] = tok39185.token.value;
                    if (patt9188["class"] === "invokeRec" || patt9188["class"] === "invoke") {
                        i9182 += 1;
                        if (tok49186.token.value === "()" && tok49186.token.inner.length) {
                            patt9188.macroName = tok49186.token.inner;
                        } else {
                            throwSyntaxError9114(patt9188["class"], "Expected macro parameter", tok39185);
                        }
                    }
                } else {
                    patt9188["class"] = "invoke";
                    patt9188.macroName = [tok39185];
                }
            } else {
                patt9188["class"] = "token";
            }
        } else if (tok19183.token.type === parser9101.Token.Identifier && tok19183.token.value === "$" && tok29184.token.type === parser9101.Token.Delimiter) {
            i9182 += 1;
            patt9188 = patternToObject9126(tok29184);
            patt9188["class"] = "pattern_group";
            if (patt9188.value === "[]") {
                patt9188.inner = loadLiteralGroup9125(patt9188.inner);
            } else {
                patt9188.inner = loadPattern9128(tok29184.token.inner);
            }
        } else if (tok19183.token.type === parser9101.Token.Identifier && tok19183.token.value === "_") {
            patt9188 = patternToObject9126(tok19183);
            patt9188["class"] = "wildcard";
        } else {
            patt9188 = patternToObject9126(tok19183);
            patt9188["class"] = "pattern_literal";
            if (patt9188.inner) {
                patt9188.inner = loadPattern9128(tok19183.token.inner);
            }
        }
        if ( // Macro classes aren't allowed in lookbehind because we wouldn't
        // know where to insert the macro, and you can't use a L->R macro
        // to match R->L.
        reverse9180 && patt9188.macroName) {
            throwSyntaxError9114(patt9188["class"], "Not allowed in top-level lookbehind", patt9188.macroName[0]);
        }
        patts9181.push(patt9188);
    }
    return reverse9180 ? reversePattern9124(patts9181) : patts9181;
}
function cachedTermMatch9129(stx9189, term9190) {
    var res9191 = [];
    var i9192 = 0;
    while (stx9189[i9192] && stx9189[i9192].term === term9190) {
        res9191.unshift(stx9189[i9192]);
        i9192++;
    }
    return {
        result: term9190,
        destructed: res9191,
        rest: stx9189.slice(res9191.length)
    };
}
function expandWithMacro9130(macroName9193, stx9194, context9195, rec9196) {
    var name9197 = macroName9193.map(syntax9103.unwrapSyntax).join("");
    var ident9198 = syntax9103.makeIdent(name9197, macroName9193[0]);
    var macroObj9199 = expander9102.getSyntaxTransform(ident9198, context9195, context9195.phase);
    var newContext9200 = expander9102.makeExpanderContext(context9195);
    if (!macroObj9199) {
        throwSyntaxError9114("invoke", "Macro not in scope", macroName9193[0]);
    }
    var next9201 = macroName9193.slice(-1).concat(stx9194);
    var rest9202, result9203, rt9204, patternEnv9205;
    while (macroObj9199 && next9201) {
        try {
            rt9204 = macroObj9199.fn(next9201, newContext9200, [], []);
            result9203 = rt9204.result;
            rest9202 = rt9204.rest;
            patternEnv9205 = rt9204.patterns;
        } catch (e9206) {
            if (e9206 instanceof syntax9103.SyntaxCaseError) {
                result9203 = null;
                rest9202 = stx9194;
                break;
            } else {
                throw e9206;
            }
        }
        if (rec9196 && result9203.length >= 1) {
            var nextMacro9207 = expander9102.getSyntaxTransform(result9203, context9195, context9195.phase);
            if (nextMacro9207) {
                macroObj9199 = nextMacro9207;
                next9201 = result9203.concat(rest9202);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    return {
        result: result9203,
        rest: rest9202,
        patternEnv: patternEnv9205
    };
}
function matchPatternClass9131(patternObj9208, stx9209, context9210) {
    var result9211, rest9212, match9213, patternEnv9214;
    if ( // pattern has no parse class
    patternObj9208["class"] === "token" && stx9209[0] && stx9209[0].token.type !== parser9101.Token.EOF) {
        result9211 = [stx9209[0]];
        rest9212 = stx9209.slice(1);
    } else if (patternObj9208["class"] === "lit" && stx9209[0] && typeIsLiteral9117(stx9209[0].token.type)) {
        result9211 = [stx9209[0]];
        rest9212 = stx9209.slice(1);
    } else if (patternObj9208["class"] === "ident" && stx9209[0] && stx9209[0].token.type === parser9101.Token.Identifier) {
        result9211 = [stx9209[0]];
        rest9212 = stx9209.slice(1);
    } else if (stx9209.length > 0 && patternObj9208["class"] === "VariableStatement") {
        match9213 = stx9209[0].term ? cachedTermMatch9129(stx9209, stx9209[0].term) : expander9102.enforest(stx9209, expander9102.makeExpanderContext(context9210));
        if (match9213.result && match9213.result.isVariableStatementTerm) {
            result9211 = match9213.destructed || match9213.result.destruct(context9210);
            rest9212 = match9213.rest;
        } else {
            result9211 = null;
            rest9212 = stx9209;
        }
    } else if (stx9209.length > 0 && patternObj9208["class"] === "expr") {
        match9213 = expander9102.get_expression(stx9209, expander9102.makeExpanderContext(context9210));
        if (match9213.result === null || !match9213.result.isExprTerm) {
            result9211 = null;
            rest9212 = stx9209;
        } else {
            result9211 = match9213.destructed || match9213.result.destruct(context9210);
            result9211 = [syntax9103.makeDelim("()", result9211, result9211[0])];
            rest9212 = match9213.rest;
        }
    } else if (stx9209.length > 0 && (patternObj9208["class"] === "invoke" || patternObj9208["class"] === "invokeRec")) {
        match9213 = expandWithMacro9130(patternObj9208.macroName, stx9209, context9210, patternObj9208["class"] === "invokeRec");
        result9211 = match9213.result;
        rest9212 = match9213.result ? match9213.rest : stx9209;
        patternEnv9214 = match9213.patternEnv;
    } else {
        result9211 = null;
        rest9212 = stx9209;
    }
    return {
        result: result9211,
        rest: rest9212,
        patternEnv: patternEnv9214
    };
}
function matchPatterns9132(patterns9215, stx9216, context9217, topLevel9218) {
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
    topLevel9218 = topLevel9218 || false;
    // note that there are two environments floating around,
    // one is the mapping of identifiers to macro definitions (env)
    // and the other is the pattern environment (patternEnv) that maps
    // patterns in a macro case to syntax.
    var result9219 = [];
    var patternEnv9220 = {};
    var match9221;
    var pattern9222;
    var rest9223 = stx9216;
    var success9224 = true;
    var inLeading9225;
    patternLoop: for (var i9226 = 0; i9226 < patterns9215.length; i9226++) {
        if (success9224 === false) {
            break;
        }
        pattern9222 = patterns9215[i9226];
        inLeading9225 = false;
        do {
            if ( // handles cases where patterns trail a repeated pattern like `$x ... ;`
            pattern9222.repeat && i9226 + 1 < patterns9215.length) {
                var restMatch9228 = matchPatterns9132(patterns9215.slice(i9226 + 1), rest9223, context9217, topLevel9218);
                if (restMatch9228.success) {
                    // match the repeat pattern on the empty array to fill in its
                    // pattern variable in the environment
                    match9221 = matchPattern9133(pattern9222, [], context9217, patternEnv9220, topLevel9218);
                    patternEnv9220 = _9100.extend(restMatch9228.patternEnv, match9221.patternEnv);
                    rest9223 = restMatch9228.rest;
                    break patternLoop;
                }
            }
            if (pattern9222.repeat && pattern9222.leading && pattern9222.separator !== " ") {
                if (rest9223[0].token.value === pattern9222.separator.token.value) {
                    if (!inLeading9225) {
                        inLeading9225 = true;
                    }
                    rest9223 = rest9223.slice(1);
                } else {
                    if ( // If we are in a leading repeat, the separator is required.
                    inLeading9225) {
                        success9224 = false;
                        break;
                    }
                }
            }
            match9221 = matchPattern9133(pattern9222, rest9223, context9217, patternEnv9220, topLevel9218);
            if (!match9221.success && pattern9222.repeat) {
                // a repeat can match zero tokens and still be a
                // "success" so break out of the inner loop and
                // try the next pattern
                break;
            }
            if (!match9221.success) {
                success9224 = false;
                break;
            }
            rest9223 = match9221.rest;
            patternEnv9220 = match9221.patternEnv;
            if (success9224 && !(topLevel9218 || pattern9222.repeat)) {
                if ( // the very last pattern matched, inside a
                // delimiter, not a repeat, *and* there are more
                // unmatched bits of syntax
                i9226 == patterns9215.length - 1 && rest9223.length !== 0) {
                    success9224 = false;
                    break;
                }
            }
            if (pattern9222.repeat && !pattern9222.leading && success9224) {
                if ( // if (i < patterns.length - 1 && rest.length > 0) {
                //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                //     if (restMatch.success) {
                //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                //         rest = restMatch.rest;
                //         break patternLoop;
                //     }
                // }
                pattern9222.separator === " ") {
                    // no separator specified (using the empty string for this)
                    // so keep going
                    continue;
                } else if (rest9223[0] && rest9223[0].token.value === pattern9222.separator.token.value) {
                    // more tokens and the next token matches the separator
                    rest9223 = rest9223.slice(1);
                } else if (pattern9222.separator !== " " && rest9223.length > 0 && i9226 === patterns9215.length - 1 && topLevel9218 === false) {
                    // separator is specified, there is a next token, the
                    // next token doesn't match the separator, there are
                    // no more patterns, and this is a top level pattern
                    // so the match has failed
                    success9224 = false;
                    break;
                } else {
                    break;
                }
            }
        } while (pattern9222.repeat && success9224 && rest9223.length > 0);
    }
    if ( // If we are in a delimiter and we haven't matched all the syntax, it
    // was a failed match.
    !topLevel9218 && rest9223.length) {
        success9224 = false;
    }
    var result9219;
    if (success9224) {
        result9219 = rest9223.length ? stx9216.slice(0, -rest9223.length) : stx9216;
    } else {
        result9219 = [];
    }
    return {
        success: success9224,
        result: result9219,
        rest: rest9223,
        patternEnv: patternEnv9220
    };
}
function matchPattern9133(pattern9229, stx9230, context9231, patternEnv9232, topLevel9233) {
    var subMatch9234;
    var match9235, matchEnv9236;
    var rest9237;
    var success9238;
    if (typeof pattern9229.inner !== "undefined") {
        if (pattern9229["class"] === "pattern_group") {
            // pattern groups don't match the delimiters
            subMatch9234 = matchPatterns9132(pattern9229.inner, stx9230, context9231, true);
            rest9237 = subMatch9234.rest;
            success9238 = subMatch9234.success;
        } else if (pattern9229["class"] === "named_group") {
            subMatch9234 = matchPatterns9132(pattern9229.inner, stx9230, context9231, true);
            rest9237 = subMatch9234.rest;
            success9238 = subMatch9234.success;
            if (success9238) {
                var namedMatch9239 = {};
                namedMatch9239[pattern9229.value] = {
                    level: 0,
                    match: subMatch9234.result,
                    topLevel: topLevel9233
                };
                subMatch9234.patternEnv = loadPatternEnv9135(namedMatch9239, subMatch9234.patternEnv, topLevel9233, false, pattern9229.value);
            }
        } else if (stx9230[0] && stx9230[0].token.type === parser9101.Token.Delimiter && stx9230[0].token.value === pattern9229.value) {
            if (pattern9229.inner.length === 0 && stx9230[0].token.inner.length !== 0) {
                return {
                    success: false,
                    rest: stx9230,
                    patternEnv: patternEnv9232
                };
            }
            subMatch9234 = matchPatterns9132(pattern9229.inner, stx9230[0].token.inner, context9231, false);
            rest9237 = stx9230.slice(1);
            success9238 = subMatch9234.success;
        } else {
            subMatch9234 = matchPatterns9132(pattern9229.inner, [], context9231, false);
            success9238 = false;
        }
        if (success9238) {
            patternEnv9232 = loadPatternEnv9135(patternEnv9232, subMatch9234.patternEnv, topLevel9233, pattern9229.repeat);
        } else if (pattern9229.repeat) {
            patternEnv9232 = initPatternEnv9134(patternEnv9232, subMatch9234.patternEnv, topLevel9233);
        }
    } else {
        if (pattern9229["class"] === "wildcard") {
            success9238 = true;
            rest9237 = stx9230.slice(1);
        } else if (pattern9229["class"] === "pattern_literal") {
            if ( // match the literal but don't update the pattern environment
            stx9230[0] && pattern9229.value === stx9230[0].token.value) {
                success9238 = true;
                rest9237 = stx9230.slice(1);
            } else {
                success9238 = false;
                rest9237 = stx9230;
            }
        } else {
            match9235 = matchPatternClass9131(pattern9229, stx9230, context9231);
            success9238 = match9235.result !== null;
            rest9237 = match9235.rest;
            matchEnv9236 = {
                level: 0,
                match: match9235.result,
                topLevel: topLevel9233
            };
            if ( // push the match onto this value's slot in the environment
            pattern9229.repeat) {
                if (patternEnv9232[pattern9229.value] && success9238) {
                    patternEnv9232[pattern9229.value].match.push(matchEnv9236);
                } else if (patternEnv9232[pattern9229.value] === undefined) {
                    // initialize if necessary
                    patternEnv9232[pattern9229.value] = {
                        level: 1,
                        match: [matchEnv9236],
                        topLevel: topLevel9233
                    };
                }
            } else {
                patternEnv9232[pattern9229.value] = matchEnv9236;
            }
            patternEnv9232 = loadPatternEnv9135(patternEnv9232, match9235.patternEnv, topLevel9233, pattern9229.repeat, pattern9229.value);
        }
    }
    return {
        success: success9238,
        rest: rest9237,
        patternEnv: patternEnv9232
    };
}
function initPatternEnv9134(toEnv9240, fromEnv9241, topLevel9242) {
    _9100.forEach(fromEnv9241, function (patternVal9243, patternKey9244) {
        if (!toEnv9240[patternKey9244]) {
            toEnv9240[patternKey9244] = {
                level: patternVal9243.level + 1,
                match: [patternVal9243],
                topLevel: topLevel9242
            };
        }
    });
    return toEnv9240;
}
function loadPatternEnv9135(toEnv9245, fromEnv9246, topLevel9247, repeat9248, prefix9249) {
    prefix9249 = prefix9249 || "";
    _9100.forEach(fromEnv9246, function (patternVal9250, patternKey9251) {
        var patternName9252 = prefix9249 + patternKey9251;
        if (repeat9248) {
            var nextLevel9253 = patternVal9250.level + 1;
            if (toEnv9245[patternName9252]) {
                toEnv9245[patternName9252].level = nextLevel9253;
                toEnv9245[patternName9252].match.push(patternVal9250);
            } else {
                toEnv9245[patternName9252] = {
                    level: nextLevel9253,
                    match: [patternVal9250],
                    topLevel: topLevel9247
                };
            }
        } else {
            toEnv9245[patternName9252] = patternVal9250;
        }
    });
    return toEnv9245;
}
function matchLookbehind9136(patterns9254, stx9255, terms9256, context9257) {
    var success9258, patternEnv9259, prevStx9260, prevTerms9261;
    if ( // No lookbehind, noop.
    !patterns9254.length) {
        success9258 = true;
        patternEnv9259 = {};
        prevStx9260 = stx9255;
        prevTerms9261 = terms9256;
    } else {
        var match9262 = matchPatterns9132(patterns9254, stx9255, context9257, true);
        var last9263 = match9262.result[match9262.result.length - 1];
        success9258 = match9262.success;
        patternEnv9259 = match9262.patternEnv;
        if (success9258) {
            if (match9262.rest.length) {
                if (last9263 && last9263.term && last9263.term === match9262.rest[0].term) {
                    // The term tree was split, so its a failed match;
                    success9258 = false;
                } else {
                    prevStx9260 = match9262.rest;
                    for (var
                    // Find where to slice the prevTerms to match up with
                    // the state of prevStx.
                    i9264 = 0, len9265 = terms9256.length; i9264 < len9265; i9264++) {
                        if (terms9256[i9264] === prevStx9260[0].term) {
                            prevTerms9261 = terms9256.slice(i9264);
                            break;
                        }
                    }
                    assert9104(prevTerms9261, "No matching previous term found");
                }
            } else {
                prevTerms9261 = [];
                prevStx9260 = [];
            }
        }
    }
    // We need to reverse the matches for any top level repeaters because
    // they match in reverse, and thus put their results in backwards.
    _9100.forEach(patternEnv9259, function (val9266, key9267) {
        if (val9266.level && val9266.match && val9266.topLevel) {
            val9266.match.reverse();
        }
    });
    return {
        success: success9258,
        patternEnv: patternEnv9259,
        prevStx: prevStx9260,
        prevTerms: prevTerms9261
    };
}
function hasMatch9137(m9268) {
    if (m9268.level === 0) {
        return m9268.match.length > 0;
    }
    return !!m9268.match;
}
function transcribe9138(macroBody9269, macroNameStx9270, env9271) {
    return _9100.chain(macroBody9269).reduce(function (acc9272, bodyStx9273, idx9274, original9275) {
        var // first find the ellipses and mark the syntax objects
        // (note that this step does not eagerly go into delimiter bodies)
        last9276 = original9275[idx9274 - 1];
        var next9277 = original9275[idx9274 + 1];
        var nextNext9278 = original9275[idx9274 + 2];
        if ( // drop `...`
        bodyStx9273.token.value === "...") {
            return acc9272;
        }
        if ( // drop `(<separator)` when followed by an ellipse
        delimIsSeparator9119(bodyStx9273) && next9277 && next9277.token.value === "...") {
            return acc9272;
        }
        if ( // skip the $ in $(...)
        bodyStx9273.token.value === "$" && next9277 && next9277.token.type === parser9101.Token.Delimiter && next9277.token.value === "()") {
            return acc9272;
        }
        if ( // mark $[...] as a literal
        bodyStx9273.token.value === "$" && next9277 && next9277.token.type === parser9101.Token.Delimiter && next9277.token.value === "[]") {
            next9277.literal = true;
            return acc9272;
        }
        if (bodyStx9273.token.type === parser9101.Token.Delimiter && bodyStx9273.token.value === "()" && last9276 && last9276.token.value === "$") {
            bodyStx9273.group = true;
        }
        if ( // literal [] delimiters have their bodies just
        // directly passed along
        bodyStx9273.literal === true) {
            assert9104(bodyStx9273.token.type === parser9101.Token.Delimiter, "expecting a literal to be surrounded by []");
            return acc9272.concat(bodyStx9273.token.inner);
        }
        if (next9277 && next9277.token.value === "...") {
            bodyStx9273.repeat = true;
            bodyStx9273.separator = " ";
        } else if (delimIsSeparator9119(next9277) && nextNext9278 && nextNext9278.token.value === "...") {
            bodyStx9273.repeat = true;
            bodyStx9273.separator = next9277.token.inner[0];
        }
        acc9272.push(bodyStx9273);
        return acc9272;
    }, []).reduce(function (acc9279, bodyStx9280, idx9281) {
        if ( // then do the actual transcription
        bodyStx9280.repeat) {
            if (bodyStx9280.token.type === parser9101.Token.Delimiter) {
                var fv9282 = _9100.filter(freeVarsInPattern9116(bodyStx9280.token.inner), function (pat9289) {
                    // ignore "patterns"
                    // that aren't in the
                    // environment (treat
                    // them like literals)
                    return env9271.hasOwnProperty(pat9289);
                });
                var restrictedEnv9283 = [];
                var nonScalar9284 = _9100.find(fv9282, function (pat9290) {
                    return env9271[pat9290].level > 0;
                });
                assert9104(typeof nonScalar9284 !== "undefined", "must have a least one non-scalar in repeat");
                var repeatLength9285 = env9271[nonScalar9284].match.length;
                var sameLength9286 = _9100.all(fv9282, function (pat9291) {
                    return env9271[pat9291].level === 0 || env9271[pat9291].match.length === repeatLength9285;
                });
                assert9104(sameLength9286, "all non-scalars must have the same length");
                // create a list of envs restricted to the free vars
                _9100.each(_9100.range(repeatLength9285), function (idx9292) {
                    var renv9293 = {};
                    _9100.each(fv9282, function (pat9295) {
                        if (env9271[pat9295].level === 0) {
                            // copy scalars over
                            renv9293[pat9295] = env9271[pat9295];
                        } else {
                            // grab the match at this index
                            renv9293[pat9295] = env9271[pat9295].match[idx9292];
                        }
                    });
                    var allHaveMatch9294 = Object.keys(renv9293).every(function (pat9296) {
                        return hasMatch9137(renv9293[pat9296]);
                    });
                    if (allHaveMatch9294) {
                        restrictedEnv9283.push(renv9293);
                    }
                });
                var transcribed9287 = _9100.map(restrictedEnv9283, function (renv9297) {
                    if (bodyStx9280.group) {
                        return transcribe9138(bodyStx9280.token.inner, macroNameStx9270, renv9297);
                    } else {
                        var newBody9298 = syntaxFromToken9106(_9100.clone(bodyStx9280.token), bodyStx9280);
                        newBody9298.token.inner = transcribe9138(bodyStx9280.token.inner, macroNameStx9270, renv9297);
                        return newBody9298;
                    }
                });
                var joined9288;
                if (bodyStx9280.group) {
                    joined9288 = joinSyntaxArray9111(transcribed9287, bodyStx9280.separator);
                } else {
                    joined9288 = joinSyntax9110(transcribed9287, bodyStx9280.separator);
                }
                push9115.apply(acc9279, joined9288);
                return acc9279;
            }
            if (!env9271[bodyStx9280.token.value]) {
                throwSyntaxError9114("patterns", "The pattern variable is not bound for the template", bodyStx9280);
            } else if (env9271[bodyStx9280.token.value].level !== 1) {
                throwSyntaxError9114("patterns", "Ellipses level does not match in the template", bodyStx9280);
            }
            push9115.apply(acc9279, joinRepeatedMatch9121(env9271[bodyStx9280.token.value].match, bodyStx9280.separator));
            return acc9279;
        } else {
            if (bodyStx9280.token.type === parser9101.Token.Delimiter) {
                var newBody9299 = syntaxFromToken9106(_9100.clone(bodyStx9280.token), macroBody9269);
                newBody9299.token.inner = transcribe9138(bodyStx9280.token.inner, macroNameStx9270, env9271);
                acc9279.push(newBody9299);
                return acc9279;
            }
            if (isPatternVar9120(bodyStx9280) && Object.prototype.hasOwnProperty.bind(env9271)(bodyStx9280.token.value)) {
                if (!env9271[bodyStx9280.token.value]) {
                    throwSyntaxError9114("patterns", "The pattern variable is not bound for the template", bodyStx9280);
                } else if (env9271[bodyStx9280.token.value].level !== 0) {
                    throwSyntaxError9114("patterns", "Ellipses level does not match in the template", bodyStx9280);
                }
                push9115.apply(acc9279, takeLineContext9122(bodyStx9280, env9271[bodyStx9280.token.value].match));
                return acc9279;
            }
            acc9279.push(syntaxFromToken9106(_9100.clone(bodyStx9280.token), bodyStx9280));
            return acc9279;
        }
    }, []).value();
}
function cloneMatch9139(oldMatch9300) {
    var newMatch9301 = {
        success: oldMatch9300.success,
        rest: oldMatch9300.rest,
        patternEnv: {}
    };
    for (var pat9302 in oldMatch9300.patternEnv) {
        if (oldMatch9300.patternEnv.hasOwnProperty(pat9302)) {
            newMatch9301.patternEnv[pat9302] = oldMatch9300.patternEnv[pat9302];
        }
    }
    return newMatch9301;
}
function makeIdentityRule9140(pattern9303, isInfix9304, context9305) {
    var inf9306 = [];
    var pat9307 = [];
    var stx9308 = [];
    if (isInfix9304) {
        for (var i9309 = 0; i9309 < pattern9303.length; i9309++) {
            if (pattern9303[i9309].token.type === parser9101.Token.Punctuator && pattern9303[i9309].token.value === "|") {
                pat9307.push(makeIdent9108("$inf", context9305), makePunc9107(":", context9305), makeDelim9109("()", inf9306, context9305), pattern9303[0], makeIdent9108("$id", context9305), makePunc9107(":", context9305), makeDelim9109("()", pat9307.slice(i9309 + 1), context9305));
                stx9308.push(makeIdent9108("$inf", context9305), makeIdent9108("$id", context9305));
                break;
            }
            inf9306.push(pattern9303[i9309]);
        }
    } else {
        pat9307.push(makeIdent9108("$id", context9305), makePunc9107(":", context9305), makeDelim9109("()", pattern9303, context9305));
        stx9308.push(makeIdent9108("$id", context9305));
    }
    return {
        pattern: pat9307,
        body: stx9308
    };
}
exports.loadPattern = loadPattern9128;
exports.matchPatterns = matchPatterns9132;
exports.matchLookbehind = matchLookbehind9136;
exports.transcribe = transcribe9138;
exports.matchPatternClass = matchPatternClass9131;
exports.takeLineContext = takeLineContext9122;
exports.takeLine = takeLine9123;
exports.typeIsLiteral = typeIsLiteral9117;
exports.cloneMatch = cloneMatch9139;
exports.makeIdentityRule = makeIdentityRule9140;
/*global require: true, exports:true
*/
//# sourceMappingURL=patterns.js.map