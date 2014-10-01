(function (root$3196, factory$3197) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$3197(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander',
            'syntax'
        ], factory$3197);
    }
}(this, function (exports$3198, _$3199, parser$3200, expander$3201, syntax$3202) {
    var get_expression$3203 = expander$3201.get_expression;
    var syntaxFromToken$3204 = syntax$3202.syntaxFromToken;
    var makePunc$3205 = syntax$3202.makePunc;
    var makeIdent$3206 = syntax$3202.makeIdent;
    var makeDelim$3207 = syntax$3202.makeDelim;
    var joinSyntax$3208 = syntax$3202.joinSyntax;
    var joinSyntaxArray$3209 = syntax$3202.joinSyntaxArray;
    var cloneSyntax$3210 = syntax$3202.cloneSyntax;
    var cloneSyntaxArray$3211 = syntax$3202.cloneSyntaxArray;
    var assert$3212 = syntax$3202.assert;
    var throwSyntaxError$3213 = syntax$3202.throwSyntaxError;
    var push$3214 = Array.prototype.push;
    function freeVarsInPattern$3215(pattern$3240) {
        var fv$3241 = [];
        _$3199.each(pattern$3240, function (pat$3242) {
            if (isPatternVar$3219(pat$3242)) {
                fv$3241.push(pat$3242.token.value);
            } else if (pat$3242.token.type === parser$3200.Token.Delimiter) {
                push$3214.apply(fv$3241, freeVarsInPattern$3215(pat$3242.token.inner));
            }
        });
        return fv$3241;
    }
    function typeIsLiteral$3216(type$3243) {
        return type$3243 === parser$3200.Token.NullLiteral || type$3243 === parser$3200.Token.NumericLiteral || type$3243 === parser$3200.Token.StringLiteral || type$3243 === parser$3200.Token.RegexLiteral || type$3243 === parser$3200.Token.BooleanLiteral;
    }
    function containsPatternVar$3217(patterns$3244) {
        return _$3199.any(patterns$3244, function (pat$3245) {
            if (pat$3245.token.type === parser$3200.Token.Delimiter) {
                return containsPatternVar$3217(pat$3245.token.inner);
            }
            return isPatternVar$3219(pat$3245);
        });
    }
    function delimIsSeparator$3218(delim$3246) {
        return delim$3246 && delim$3246.token && delim$3246.token.type === parser$3200.Token.Delimiter && delim$3246.token.value === '()' && delim$3246.token.inner.length === 1 && delim$3246.token.inner[0].token.type !== parser$3200.Token.Delimiter && !containsPatternVar$3217(delim$3246.token.inner);
    }
    function isPatternVar$3219(stx$3247) {
        return stx$3247.token.value[0] === '$' && stx$3247.token.value !== '$';
    }
    function joinRepeatedMatch$3220(tojoin$3248, punc$3249) {
        return _$3199.reduce(_$3199.rest(tojoin$3248, 1), function (acc$3250, join$3251) {
            if (punc$3249 === ' ') {
                return acc$3250.concat(cloneSyntaxArray$3211(join$3251.match));
            }
            return acc$3250.concat(cloneSyntax$3210(punc$3249), cloneSyntaxArray$3211(join$3251.match));
        }, cloneSyntaxArray$3211(_$3199.first(tojoin$3248).match));
    }
    function takeLineContext$3221(from$3252, to$3253) {
        return _$3199.map(to$3253, function (stx$3254) {
            return takeLine$3222(from$3252, stx$3254);
        });
    }
    function takeLine$3222(from$3255, to$3256) {
        var next$3257;
        if (to$3256.token.type === parser$3200.Token.Delimiter) {
            var sm_startLineNumber$3258 = typeof to$3256.token.sm_startLineNumber !== 'undefined' ? to$3256.token.sm_startLineNumber : to$3256.token.startLineNumber;
            var sm_endLineNumber$3259 = typeof to$3256.token.sm_endLineNumber !== 'undefined' ? to$3256.token.sm_endLineNumber : to$3256.token.endLineNumber;
            var sm_startLineStart$3260 = typeof to$3256.token.sm_startLineStart !== 'undefined' ? to$3256.token.sm_startLineStart : to$3256.token.startLineStart;
            var sm_endLineStart$3261 = typeof to$3256.token.sm_endLineStart !== 'undefined' ? to$3256.token.sm_endLineStart : to$3256.token.endLineStart;
            var sm_startRange$3262 = typeof to$3256.token.sm_startRange !== 'undefined' ? to$3256.token.sm_startRange : to$3256.token.startRange;
            var sm_endRange$3263 = typeof to$3256.token.sm_endRange !== 'undefined' ? to$3256.token.sm_endRange : to$3256.token.endRange;
            if (from$3255.token.type === parser$3200.Token.Delimiter) {
                next$3257 = syntaxFromToken$3204({
                    type: parser$3200.Token.Delimiter,
                    value: to$3256.token.value,
                    inner: takeLineContext$3221(from$3255, to$3256.token.inner),
                    startRange: from$3255.token.startRange,
                    endRange: from$3255.token.endRange,
                    startLineNumber: from$3255.token.startLineNumber,
                    startLineStart: from$3255.token.startLineStart,
                    endLineNumber: from$3255.token.endLineNumber,
                    endLineStart: from$3255.token.endLineStart,
                    sm_startLineNumber: sm_startLineNumber$3258,
                    sm_endLineNumber: sm_endLineNumber$3259,
                    sm_startLineStart: sm_startLineStart$3260,
                    sm_endLineStart: sm_endLineStart$3261,
                    sm_startRange: sm_startRange$3262,
                    sm_endRange: sm_endRange$3263
                }, to$3256);
            } else {
                next$3257 = syntaxFromToken$3204({
                    type: parser$3200.Token.Delimiter,
                    value: to$3256.token.value,
                    inner: takeLineContext$3221(from$3255, to$3256.token.inner),
                    startRange: from$3255.token.range,
                    endRange: from$3255.token.range,
                    startLineNumber: from$3255.token.lineNumber,
                    startLineStart: from$3255.token.lineStart,
                    endLineNumber: from$3255.token.lineNumber,
                    endLineStart: from$3255.token.lineStart,
                    sm_startLineNumber: sm_startLineNumber$3258,
                    sm_endLineNumber: sm_endLineNumber$3259,
                    sm_startLineStart: sm_startLineStart$3260,
                    sm_endLineStart: sm_endLineStart$3261,
                    sm_startRange: sm_startRange$3262,
                    sm_endRange: sm_endRange$3263
                }, to$3256);
            }
        } else {
            var sm_lineNumber$3264 = typeof to$3256.token.sm_lineNumber !== 'undefined' ? to$3256.token.sm_lineNumber : to$3256.token.lineNumber;
            var sm_lineStart$3265 = typeof to$3256.token.sm_lineStart !== 'undefined' ? to$3256.token.sm_lineStart : to$3256.token.lineStart;
            var sm_range$3266 = typeof to$3256.token.sm_range !== 'undefined' ? to$3256.token.sm_range : to$3256.token.range;
            if (from$3255.token.type === parser$3200.Token.Delimiter) {
                next$3257 = syntaxFromToken$3204({
                    value: to$3256.token.value,
                    type: to$3256.token.type,
                    lineNumber: from$3255.token.startLineNumber,
                    lineStart: from$3255.token.startLineStart,
                    range: from$3255.token.startRange,
                    sm_lineNumber: sm_lineNumber$3264,
                    sm_lineStart: sm_lineStart$3265,
                    sm_range: sm_range$3266
                }, to$3256);
            } else {
                next$3257 = syntaxFromToken$3204({
                    value: to$3256.token.value,
                    type: to$3256.token.type,
                    lineNumber: from$3255.token.lineNumber,
                    lineStart: from$3255.token.lineStart,
                    range: from$3255.token.range,
                    sm_lineNumber: sm_lineNumber$3264,
                    sm_lineStart: sm_lineStart$3265,
                    sm_range: sm_range$3266
                }, to$3256);
            }
        }
        if (to$3256.token.leadingComments) {
            next$3257.token.leadingComments = to$3256.token.leadingComments;
        }
        if (to$3256.token.trailingComments) {
            next$3257.token.trailingComments = to$3256.token.trailingComments;
        }
        return next$3257;
    }
    function reversePattern$3223(patterns$3267) {
        var len$3268 = patterns$3267.length;
        var pat$3269;
        return _$3199.reduceRight(patterns$3267, function (acc$3270, pat$3271) {
            if (pat$3271.class === 'pattern_group' || pat$3271.class === 'named_group') {
                pat$3271.inner = reversePattern$3223(pat$3271.inner);
            }
            if (pat$3271.repeat) {
                pat$3271.leading = !pat$3271.leading;
            }
            acc$3270.push(pat$3271);
            return acc$3270;
        }, []);
    }
    function loadLiteralGroup$3224(patterns$3272) {
        return patterns$3272.map(function (patStx$3273) {
            var pat$3274 = patternToObject$3225(patStx$3273);
            if (pat$3274.inner) {
                pat$3274.inner = loadLiteralGroup$3224(pat$3274.inner);
            } else {
                pat$3274.class = 'pattern_literal';
            }
            return pat$3274;
        });
    }
    function patternToObject$3225(pat$3275) {
        var obj$3276 = {
            type: pat$3275.token.type,
            value: pat$3275.token.value
        };
        if (pat$3275.token.inner) {
            obj$3276.inner = pat$3275.token.inner;
        }
        return obj$3276;
    }
    function isPrimaryClass$3226(name$3277) {
        return [
            'expr',
            'lit',
            'ident',
            'token',
            'invoke',
            'invokeRec'
        ].indexOf(name$3277) > -1;
    }
    function loadPattern$3227(patterns$3278, reverse$3279) {
        var patts$3280 = [];
        for (var i$3281 = 0; i$3281 < patterns$3278.length; i$3281++) {
            var tok1$3282 = patterns$3278[i$3281];
            var tok2$3283 = patterns$3278[i$3281 + 1];
            var tok3$3284 = patterns$3278[i$3281 + 2];
            var tok4$3285 = patterns$3278[i$3281 + 3];
            var last$3286 = patts$3280[patts$3280.length - 1];
            var patt$3287;
            assert$3212(tok1$3282, 'Expecting syntax object');
            if (// Repeaters
                tok1$3282.token.type === parser$3200.Token.Delimiter && tok1$3282.token.value === '()' && tok2$3283 && tok2$3283.token.type === parser$3200.Token.Punctuator && tok2$3283.token.value === '...' && last$3286) {
                assert$3212(tok1$3282.token.inner.length === 1, 'currently assuming all separators are a single token');
                i$3281 += 1;
                last$3286.repeat = true;
                last$3286.separator = tok1$3282.token.inner[0];
                continue;
            } else if (tok1$3282.token.type === parser$3200.Token.Punctuator && tok1$3282.token.value === '...' && last$3286) {
                last$3286.repeat = true;
                last$3286.separator = ' ';
                continue;
            } else if (isPatternVar$3219(tok1$3282)) {
                patt$3287 = patternToObject$3225(tok1$3282);
                if (tok2$3283 && tok2$3283.token.type === parser$3200.Token.Punctuator && tok2$3283.token.value === ':' && tok3$3284 && (tok3$3284.token.type === parser$3200.Token.Identifier || tok3$3284.token.type === parser$3200.Token.Delimiter && (tok3$3284.token.value === '[]' || tok3$3284.token.value === '()'))) {
                    i$3281 += 2;
                    if (tok3$3284.token.value === '[]') {
                        patt$3287.class = 'named_group';
                        patt$3287.inner = loadLiteralGroup$3224(tok3$3284.token.inner);
                    } else if (tok3$3284.token.value === '()') {
                        patt$3287.class = 'named_group';
                        patt$3287.inner = loadPattern$3227(tok3$3284.token.inner);
                    } else if (isPrimaryClass$3226(tok3$3284.token.value)) {
                        patt$3287.class = tok3$3284.token.value;
                        if (patt$3287.class === 'invokeRec' || patt$3287.class === 'invoke') {
                            i$3281 += 1;
                            if (tok4$3285.token.value === '()' && tok4$3285.token.inner.length) {
                                patt$3287.macroName = tok4$3285.token.inner;
                            } else {
                                throwSyntaxError$3213(patt$3287.class, 'Expected macro parameter', tok3$3284);
                            }
                        }
                    } else {
                        patt$3287.class = 'invoke';
                        patt$3287.macroName = [tok3$3284];
                    }
                } else {
                    patt$3287.class = 'token';
                }
            } else if (tok1$3282.token.type === parser$3200.Token.Identifier && tok1$3282.token.value === '$' && tok2$3283.token.type === parser$3200.Token.Delimiter) {
                i$3281 += 1;
                patt$3287 = patternToObject$3225(tok2$3283);
                patt$3287.class = 'pattern_group';
                if (patt$3287.value === '[]') {
                    patt$3287.inner = loadLiteralGroup$3224(patt$3287.inner);
                } else {
                    patt$3287.inner = loadPattern$3227(tok2$3283.token.inner);
                }
            } else if (tok1$3282.token.type === parser$3200.Token.Identifier && tok1$3282.token.value === '_') {
                patt$3287 = patternToObject$3225(tok1$3282);
                patt$3287.class = 'wildcard';
            } else {
                patt$3287 = patternToObject$3225(tok1$3282);
                patt$3287.class = 'pattern_literal';
                if (patt$3287.inner) {
                    patt$3287.inner = loadPattern$3227(tok1$3282.token.inner);
                }
            }
            if (// Macro classes aren't allowed in lookbehind because we wouldn't
                // know where to insert the macro, and you can't use a L->R macro
                // to match R->L.
                reverse$3279 && patt$3287.macroName) {
                throwSyntaxError$3213(patt$3287.class, 'Not allowed in top-level lookbehind', patt$3287.macroName[0]);
            }
            patts$3280.push(patt$3287);
        }
        return reverse$3279 ? reversePattern$3223(patts$3280) : patts$3280;
    }
    function cachedTermMatch$3228(stx$3288, term$3289) {
        var res$3290 = [];
        var i$3291 = 0;
        while (stx$3288[i$3291] && stx$3288[i$3291].term === term$3289) {
            res$3290.unshift(stx$3288[i$3291]);
            i$3291++;
        }
        return {
            result: term$3289,
            destructed: res$3290,
            rest: stx$3288.slice(res$3290.length)
        };
    }
    function expandWithMacro$3229(macroName$3292, stx$3293, context$3294, rec$3295) {
        var name$3296 = macroName$3292.map(syntax$3202.unwrapSyntax).join('');
        var ident$3297 = syntax$3202.makeIdent(name$3296, macroName$3292[0]);
        var macroObj$3298 = context$3294.env.get(expander$3201.resolve(ident$3297, context$3294.phase));
        var newContext$3299 = expander$3201.makeExpanderContext(context$3294);
        if (!macroObj$3298) {
            throwSyntaxError$3213('invoke', 'Macro not in scope', macroName$3292[0]);
        }
        var next$3300 = macroName$3292.slice(-1).concat(stx$3293);
        var rest$3301, result$3302, rt$3303, patternEnv$3304;
        while (macroObj$3298 && next$3300) {
            try {
                rt$3303 = macroObj$3298.fn(next$3300, newContext$3299, [], []);
                result$3302 = rt$3303.result;
                rest$3301 = rt$3303.rest;
                patternEnv$3304 = rt$3303.patterns;
            } catch (e$3305) {
                if (e$3305 instanceof syntax$3202.SyntaxCaseError) {
                    result$3302 = null;
                    rest$3301 = stx$3293;
                    break;
                } else {
                    throw e$3305;
                }
            }
            if (rec$3295 && result$3302.length >= 1) {
                var resultHead$3306 = result$3302[0];
                var resultRest$3307 = result$3302.slice(1);
                var nextName$3308 = expander$3201.getName(resultHead$3306, resultRest$3307);
                var nextMacro$3309 = expander$3201.getValueInEnv(resultHead$3306, resultRest$3307, context$3294, context$3294.phase);
                if (nextName$3308 && nextMacro$3309) {
                    macroObj$3298 = nextMacro$3309;
                    next$3300 = result$3302.concat(rest$3301);
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        return {
            result: result$3302,
            rest: rest$3301,
            patternEnv: patternEnv$3304
        };
    }
    function matchPatternClass$3230(patternObj$3310, stx$3311, context$3312) {
        var result$3313, rest$3314, match$3315, patternEnv$3316;
        if (// pattern has no parse class
            patternObj$3310.class === 'token' && stx$3311[0] && stx$3311[0].token.type !== parser$3200.Token.EOF) {
            result$3313 = [stx$3311[0]];
            rest$3314 = stx$3311.slice(1);
        } else if (patternObj$3310.class === 'lit' && stx$3311[0] && typeIsLiteral$3216(stx$3311[0].token.type)) {
            result$3313 = [stx$3311[0]];
            rest$3314 = stx$3311.slice(1);
        } else if (patternObj$3310.class === 'ident' && stx$3311[0] && stx$3311[0].token.type === parser$3200.Token.Identifier) {
            result$3313 = [stx$3311[0]];
            rest$3314 = stx$3311.slice(1);
        } else if (stx$3311.length > 0 && patternObj$3310.class === 'VariableStatement') {
            match$3315 = stx$3311[0].term ? cachedTermMatch$3228(stx$3311, stx$3311[0].term) : expander$3201.enforest(stx$3311, expander$3201.makeExpanderContext(context$3312));
            if (match$3315.result && match$3315.result.isVariableStatement) {
                result$3313 = match$3315.destructed || match$3315.result.destruct(context$3312);
                rest$3314 = match$3315.rest;
            } else {
                result$3313 = null;
                rest$3314 = stx$3311;
            }
        } else if (stx$3311.length > 0 && patternObj$3310.class === 'expr') {
            match$3315 = expander$3201.get_expression(stx$3311, expander$3201.makeExpanderContext(context$3312));
            if (match$3315.result === null || !match$3315.result.isExpr) {
                result$3313 = null;
                rest$3314 = stx$3311;
            } else {
                result$3313 = match$3315.destructed || match$3315.result.destruct(context$3312);
                result$3313 = [syntax$3202.makeDelim('()', result$3313, result$3313[0])];
                rest$3314 = match$3315.rest;
            }
        } else if (stx$3311.length > 0 && (patternObj$3310.class === 'invoke' || patternObj$3310.class === 'invokeRec')) {
            match$3315 = expandWithMacro$3229(patternObj$3310.macroName, stx$3311, context$3312, patternObj$3310.class === 'invokeRec');
            result$3313 = match$3315.result;
            rest$3314 = match$3315.result ? match$3315.rest : stx$3311;
            patternEnv$3316 = match$3315.patternEnv;
        } else {
            result$3313 = null;
            rest$3314 = stx$3311;
        }
        return {
            result: result$3313,
            rest: rest$3314,
            patternEnv: patternEnv$3316
        };
    }
    function matchPatterns$3231(patterns$3317, stx$3318, context$3319, topLevel$3320) {
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
        topLevel$3320 = topLevel$3320 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$3321 = [];
        var patternEnv$3322 = {};
        var match$3323;
        var pattern$3324;
        var rest$3325 = stx$3318;
        var success$3326 = true;
        var inLeading$3327;
        patternLoop:
            for (var i$3328 = 0; i$3328 < patterns$3317.length; i$3328++) {
                if (success$3326 === false) {
                    break;
                }
                pattern$3324 = patterns$3317[i$3328];
                inLeading$3327 = false;
                do {
                    if (// handles cases where patterns trail a repeated pattern like `$x ... ;`
                        pattern$3324.repeat && i$3328 + 1 < patterns$3317.length) {
                        var restMatch$3329 = matchPatterns$3231(patterns$3317.slice(i$3328 + 1), rest$3325, context$3319, topLevel$3320);
                        if (restMatch$3329.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment
                            match$3323 = matchPattern$3232(pattern$3324, [], context$3319, patternEnv$3322, topLevel$3320);
                            patternEnv$3322 = _$3199.extend(restMatch$3329.patternEnv, match$3323.patternEnv);
                            rest$3325 = restMatch$3329.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$3324.repeat && pattern$3324.leading && pattern$3324.separator !== ' ') {
                        if (rest$3325[0].token.value === pattern$3324.separator.token.value) {
                            if (!inLeading$3327) {
                                inLeading$3327 = true;
                            }
                            rest$3325 = rest$3325.slice(1);
                        } else {
                            if (// If we are in a leading repeat, the separator is required.
                                inLeading$3327) {
                                success$3326 = false;
                                break;
                            }
                        }
                    }
                    match$3323 = matchPattern$3232(pattern$3324, rest$3325, context$3319, patternEnv$3322, topLevel$3320);
                    if (!match$3323.success && pattern$3324.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$3323.success) {
                        success$3326 = false;
                        break;
                    }
                    rest$3325 = match$3323.rest;
                    patternEnv$3322 = match$3323.patternEnv;
                    if (success$3326 && !(topLevel$3320 || pattern$3324.repeat)) {
                        if (// the very last pattern matched, inside a
                            // delimiter, not a repeat, *and* there are more
                            // unmatched bits of syntax
                            i$3328 == patterns$3317.length - 1 && rest$3325.length !== 0) {
                            success$3326 = false;
                            break;
                        }
                    }
                    if (pattern$3324.repeat && !pattern$3324.leading && success$3326) {
                        if (// if (i < patterns.length - 1 && rest.length > 0) {
                            //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                            //     if (restMatch.success) {
                            //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                            //         rest = restMatch.rest;
                            //         break patternLoop;
                            //     }
                            // }
                            pattern$3324.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$3325[0] && rest$3325[0].token.value === pattern$3324.separator.token.value) {
                            // more tokens and the next token matches the separator
                            rest$3325 = rest$3325.slice(1);
                        } else if (pattern$3324.separator !== ' ' && rest$3325.length > 0 && i$3328 === patterns$3317.length - 1 && topLevel$3320 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$3326 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$3324.repeat && success$3326 && rest$3325.length > 0);
            }
        if (// If we are in a delimiter and we haven't matched all the syntax, it
            // was a failed match.
            !topLevel$3320 && rest$3325.length) {
            success$3326 = false;
        }
        var result$3321;
        if (success$3326) {
            result$3321 = rest$3325.length ? stx$3318.slice(0, -rest$3325.length) : stx$3318;
        } else {
            result$3321 = [];
        }
        return {
            success: success$3326,
            result: result$3321,
            rest: rest$3325,
            patternEnv: patternEnv$3322
        };
    }
    function matchPattern$3232(pattern$3330, stx$3331, context$3332, patternEnv$3333, topLevel$3334) {
        var subMatch$3335;
        var match$3336, matchEnv$3337;
        var rest$3338;
        var success$3339;
        if (typeof pattern$3330.inner !== 'undefined') {
            if (pattern$3330.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$3335 = matchPatterns$3231(pattern$3330.inner, stx$3331, context$3332, true);
                rest$3338 = subMatch$3335.rest;
                success$3339 = subMatch$3335.success;
            } else if (pattern$3330.class === 'named_group') {
                subMatch$3335 = matchPatterns$3231(pattern$3330.inner, stx$3331, context$3332, true);
                rest$3338 = subMatch$3335.rest;
                success$3339 = subMatch$3335.success;
                if (success$3339) {
                    var namedMatch$3340 = {};
                    namedMatch$3340[pattern$3330.value] = {
                        level: 0,
                        match: subMatch$3335.result,
                        topLevel: topLevel$3334
                    };
                    subMatch$3335.patternEnv = loadPatternEnv$3234(namedMatch$3340, subMatch$3335.patternEnv, topLevel$3334, false, pattern$3330.value);
                }
            } else if (stx$3331[0] && stx$3331[0].token.type === parser$3200.Token.Delimiter && stx$3331[0].token.value === pattern$3330.value) {
                if (pattern$3330.inner.length === 0 && stx$3331[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$3331,
                        patternEnv: patternEnv$3333
                    };
                }
                subMatch$3335 = matchPatterns$3231(pattern$3330.inner, stx$3331[0].token.inner, context$3332, false);
                rest$3338 = stx$3331.slice(1);
                success$3339 = subMatch$3335.success;
            } else {
                subMatch$3335 = matchPatterns$3231(pattern$3330.inner, [], context$3332, false);
                success$3339 = false;
            }
            if (success$3339) {
                patternEnv$3333 = loadPatternEnv$3234(patternEnv$3333, subMatch$3335.patternEnv, topLevel$3334, pattern$3330.repeat);
            } else if (pattern$3330.repeat) {
                patternEnv$3333 = initPatternEnv$3233(patternEnv$3333, subMatch$3335.patternEnv, topLevel$3334);
            }
        } else {
            if (pattern$3330.class === 'wildcard') {
                success$3339 = true;
                rest$3338 = stx$3331.slice(1);
            } else if (pattern$3330.class === 'pattern_literal') {
                if (// match the literal but don't update the pattern environment
                    stx$3331[0] && pattern$3330.value === stx$3331[0].token.value) {
                    success$3339 = true;
                    rest$3338 = stx$3331.slice(1);
                } else {
                    success$3339 = false;
                    rest$3338 = stx$3331;
                }
            } else {
                match$3336 = matchPatternClass$3230(pattern$3330, stx$3331, context$3332);
                success$3339 = match$3336.result !== null;
                rest$3338 = match$3336.rest;
                matchEnv$3337 = {
                    level: 0,
                    match: match$3336.result,
                    topLevel: topLevel$3334
                };
                if (// push the match onto this value's slot in the environment
                    pattern$3330.repeat) {
                    if (patternEnv$3333[pattern$3330.value] && success$3339) {
                        patternEnv$3333[pattern$3330.value].match.push(matchEnv$3337);
                    } else if (patternEnv$3333[pattern$3330.value] === undefined) {
                        // initialize if necessary
                        patternEnv$3333[pattern$3330.value] = {
                            level: 1,
                            match: [matchEnv$3337],
                            topLevel: topLevel$3334
                        };
                    }
                } else {
                    patternEnv$3333[pattern$3330.value] = matchEnv$3337;
                }
                patternEnv$3333 = loadPatternEnv$3234(patternEnv$3333, match$3336.patternEnv, topLevel$3334, pattern$3330.repeat, pattern$3330.value);
            }
        }
        return {
            success: success$3339,
            rest: rest$3338,
            patternEnv: patternEnv$3333
        };
    }
    function initPatternEnv$3233(toEnv$3341, fromEnv$3342, topLevel$3343) {
        _$3199.forEach(fromEnv$3342, function (patternVal$3344, patternKey$3345) {
            if (!toEnv$3341[patternKey$3345]) {
                toEnv$3341[patternKey$3345] = {
                    level: patternVal$3344.level + 1,
                    match: [patternVal$3344],
                    topLevel: topLevel$3343
                };
            }
        });
        return toEnv$3341;
    }
    function loadPatternEnv$3234(toEnv$3346, fromEnv$3347, topLevel$3348, repeat$3349, prefix$3350) {
        prefix$3350 = prefix$3350 || '';
        _$3199.forEach(fromEnv$3347, function (patternVal$3351, patternKey$3352) {
            var patternName$3353 = prefix$3350 + patternKey$3352;
            if (repeat$3349) {
                var nextLevel$3354 = patternVal$3351.level + 1;
                if (toEnv$3346[patternName$3353]) {
                    toEnv$3346[patternName$3353].level = nextLevel$3354;
                    toEnv$3346[patternName$3353].match.push(patternVal$3351);
                } else {
                    toEnv$3346[patternName$3353] = {
                        level: nextLevel$3354,
                        match: [patternVal$3351],
                        topLevel: topLevel$3348
                    };
                }
            } else {
                toEnv$3346[patternName$3353] = patternVal$3351;
            }
        });
        return toEnv$3346;
    }
    function matchLookbehind$3235(patterns$3355, stx$3356, terms$3357, context$3358) {
        var success$3359, patternEnv$3360, prevStx$3361, prevTerms$3362;
        if (// No lookbehind, noop.
            !patterns$3355.length) {
            success$3359 = true;
            patternEnv$3360 = {};
            prevStx$3361 = stx$3356;
            prevTerms$3362 = terms$3357;
        } else {
            var match$3363 = matchPatterns$3231(patterns$3355, stx$3356, context$3358, true);
            var last$3364 = match$3363.result[match$3363.result.length - 1];
            success$3359 = match$3363.success;
            patternEnv$3360 = match$3363.patternEnv;
            if (success$3359) {
                if (match$3363.rest.length) {
                    if (last$3364 && last$3364.term && last$3364.term === match$3363.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$3359 = false;
                    } else {
                        prevStx$3361 = match$3363.rest;
                        for (var
                                // Find where to slice the prevTerms to match up with
                                // the state of prevStx.
                                i$3365 = 0, len$3366 = terms$3357.length; i$3365 < len$3366; i$3365++) {
                            if (terms$3357[i$3365] === prevStx$3361[0].term) {
                                prevTerms$3362 = terms$3357.slice(i$3365);
                                break;
                            }
                        }
                        assert$3212(prevTerms$3362, 'No matching previous term found');
                    }
                } else {
                    prevTerms$3362 = [];
                    prevStx$3361 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$3199.forEach(patternEnv$3360, function (val$3367, key$3368) {
            if (val$3367.level && val$3367.match && val$3367.topLevel) {
                val$3367.match.reverse();
            }
        });
        return {
            success: success$3359,
            patternEnv: patternEnv$3360,
            prevStx: prevStx$3361,
            prevTerms: prevTerms$3362
        };
    }
    function hasMatch$3236(m$3369) {
        if (m$3369.level === 0) {
            return m$3369.match.length > 0;
        }
        return !!m$3369.match;
    }
    function transcribe$3237(macroBody$3370, macroNameStx$3371, env$3372) {
        return _$3199.chain(macroBody$3370).reduce(function (acc$3373, bodyStx$3374, idx$3375, original$3376) {
            var // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            last$3377 = original$3376[idx$3375 - 1];
            var next$3378 = original$3376[idx$3375 + 1];
            var nextNext$3379 = original$3376[idx$3375 + 2];
            if (// drop `...`
                bodyStx$3374.token.value === '...') {
                return acc$3373;
            }
            if (// drop `(<separator)` when followed by an ellipse
                delimIsSeparator$3218(bodyStx$3374) && next$3378 && next$3378.token.value === '...') {
                return acc$3373;
            }
            if (// skip the $ in $(...)
                bodyStx$3374.token.value === '$' && next$3378 && next$3378.token.type === parser$3200.Token.Delimiter && next$3378.token.value === '()') {
                return acc$3373;
            }
            if (// mark $[...] as a literal
                bodyStx$3374.token.value === '$' && next$3378 && next$3378.token.type === parser$3200.Token.Delimiter && next$3378.token.value === '[]') {
                next$3378.literal = true;
                return acc$3373;
            }
            if (bodyStx$3374.token.type === parser$3200.Token.Delimiter && bodyStx$3374.token.value === '()' && last$3377 && last$3377.token.value === '$') {
                bodyStx$3374.group = true;
            }
            if (// literal [] delimiters have their bodies just
                // directly passed along
                bodyStx$3374.literal === true) {
                assert$3212(bodyStx$3374.token.type === parser$3200.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$3373.concat(bodyStx$3374.token.inner);
            }
            if (next$3378 && next$3378.token.value === '...') {
                bodyStx$3374.repeat = true;
                bodyStx$3374.separator = ' ';
            } else if (delimIsSeparator$3218(next$3378) && nextNext$3379 && nextNext$3379.token.value === '...') {
                bodyStx$3374.repeat = true;
                bodyStx$3374.separator = next$3378.token.inner[0];
            }
            acc$3373.push(bodyStx$3374);
            return acc$3373;
        }, []).reduce(function (acc$3380, bodyStx$3381, idx$3382) {
            if (// then do the actual transcription
                bodyStx$3381.repeat) {
                if (bodyStx$3381.token.type === parser$3200.Token.Delimiter) {
                    var fv$3383 = _$3199.filter(freeVarsInPattern$3215(bodyStx$3381.token.inner), function (pat$3390) {
                        // ignore "patterns"
                        // that aren't in the
                        // environment (treat
                        // them like literals)
                        return env$3372.hasOwnProperty(pat$3390);
                    });
                    var restrictedEnv$3384 = [];
                    var nonScalar$3385 = _$3199.find(fv$3383, function (pat$3391) {
                        return env$3372[pat$3391].level > 0;
                    });
                    assert$3212(typeof nonScalar$3385 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$3386 = env$3372[nonScalar$3385].match.length;
                    var sameLength$3387 = _$3199.all(fv$3383, function (pat$3392) {
                        return env$3372[pat$3392].level === 0 || env$3372[pat$3392].match.length === repeatLength$3386;
                    });
                    assert$3212(sameLength$3387, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$3199.each(_$3199.range(repeatLength$3386), function (idx$3393) {
                        var renv$3394 = {};
                        _$3199.each(fv$3383, function (pat$3396) {
                            if (env$3372[pat$3396].level === 0) {
                                // copy scalars over
                                renv$3394[pat$3396] = env$3372[pat$3396];
                            } else {
                                // grab the match at this index
                                renv$3394[pat$3396] = env$3372[pat$3396].match[idx$3393];
                            }
                        });
                        var allHaveMatch$3395 = Object.keys(renv$3394).every(function (pat$3397) {
                            return hasMatch$3236(renv$3394[pat$3397]);
                        });
                        if (allHaveMatch$3395) {
                            restrictedEnv$3384.push(renv$3394);
                        }
                    });
                    var transcribed$3388 = _$3199.map(restrictedEnv$3384, function (renv$3398) {
                        if (bodyStx$3381.group) {
                            return transcribe$3237(bodyStx$3381.token.inner, macroNameStx$3371, renv$3398);
                        } else {
                            var newBody$3399 = syntaxFromToken$3204(_$3199.clone(bodyStx$3381.token), bodyStx$3381);
                            newBody$3399.token.inner = transcribe$3237(bodyStx$3381.token.inner, macroNameStx$3371, renv$3398);
                            return newBody$3399;
                        }
                    });
                    var joined$3389;
                    if (bodyStx$3381.group) {
                        joined$3389 = joinSyntaxArray$3209(transcribed$3388, bodyStx$3381.separator);
                    } else {
                        joined$3389 = joinSyntax$3208(transcribed$3388, bodyStx$3381.separator);
                    }
                    push$3214.apply(acc$3380, joined$3389);
                    return acc$3380;
                }
                if (!env$3372[bodyStx$3381.token.value]) {
                    throwSyntaxError$3213('patterns', 'The pattern variable is not bound for the template', bodyStx$3381);
                } else if (env$3372[bodyStx$3381.token.value].level !== 1) {
                    throwSyntaxError$3213('patterns', 'Ellipses level does not match in the template', bodyStx$3381);
                }
                push$3214.apply(acc$3380, joinRepeatedMatch$3220(env$3372[bodyStx$3381.token.value].match, bodyStx$3381.separator));
                return acc$3380;
            } else {
                if (bodyStx$3381.token.type === parser$3200.Token.Delimiter) {
                    var newBody$3400 = syntaxFromToken$3204(_$3199.clone(bodyStx$3381.token), macroBody$3370);
                    newBody$3400.token.inner = transcribe$3237(bodyStx$3381.token.inner, macroNameStx$3371, env$3372);
                    acc$3380.push(newBody$3400);
                    return acc$3380;
                }
                if (isPatternVar$3219(bodyStx$3381) && Object.prototype.hasOwnProperty.bind(env$3372)(bodyStx$3381.token.value)) {
                    if (!env$3372[bodyStx$3381.token.value]) {
                        throwSyntaxError$3213('patterns', 'The pattern variable is not bound for the template', bodyStx$3381);
                    } else if (env$3372[bodyStx$3381.token.value].level !== 0) {
                        throwSyntaxError$3213('patterns', 'Ellipses level does not match in the template', bodyStx$3381);
                    }
                    push$3214.apply(acc$3380, takeLineContext$3221(bodyStx$3381, env$3372[bodyStx$3381.token.value].match));
                    return acc$3380;
                }
                acc$3380.push(syntaxFromToken$3204(_$3199.clone(bodyStx$3381.token), bodyStx$3381));
                return acc$3380;
            }
        }, []).value();
    }
    function cloneMatch$3238(oldMatch$3401) {
        var newMatch$3402 = {
            success: oldMatch$3401.success,
            rest: oldMatch$3401.rest,
            patternEnv: {}
        };
        for (var pat$3403 in oldMatch$3401.patternEnv) {
            if (oldMatch$3401.patternEnv.hasOwnProperty(pat$3403)) {
                newMatch$3402.patternEnv[pat$3403] = oldMatch$3401.patternEnv[pat$3403];
            }
        }
        return newMatch$3402;
    }
    function makeIdentityRule$3239(pattern$3404, isInfix$3405, context$3406) {
        var inf$3407 = [];
        var pat$3408 = [];
        var stx$3409 = [];
        if (isInfix$3405) {
            for (var i$3410 = 0; i$3410 < pattern$3404.length; i$3410++) {
                if (pattern$3404[i$3410].token.type === parser$3200.Token.Punctuator && pattern$3404[i$3410].token.value === '|') {
                    pat$3408.push(makeIdent$3206('$inf', context$3406), makePunc$3205(':', context$3406), makeDelim$3207('()', inf$3407, context$3406), pattern$3404[0], makeIdent$3206('$id', context$3406), makePunc$3205(':', context$3406), makeDelim$3207('()', pat$3408.slice(i$3410 + 1), context$3406));
                    stx$3409.push(makeIdent$3206('$inf', context$3406), makeIdent$3206('$id', context$3406));
                    break;
                }
                inf$3407.push(pattern$3404[i$3410]);
            }
        } else {
            pat$3408.push(makeIdent$3206('$id', context$3406), makePunc$3205(':', context$3406), makeDelim$3207('()', pattern$3404, context$3406));
            stx$3409.push(makeIdent$3206('$id', context$3406));
        }
        return {
            pattern: pat$3408,
            body: stx$3409
        };
    }
    exports$3198.loadPattern = loadPattern$3227;
    exports$3198.matchPatterns = matchPatterns$3231;
    exports$3198.matchLookbehind = matchLookbehind$3235;
    exports$3198.transcribe = transcribe$3237;
    exports$3198.matchPatternClass = matchPatternClass$3230;
    exports$3198.takeLineContext = takeLineContext$3221;
    exports$3198.takeLine = takeLine$3222;
    exports$3198.typeIsLiteral = typeIsLiteral$3216;
    exports$3198.cloneMatch = cloneMatch$3238;
    exports$3198.makeIdentityRule = makeIdentityRule$3239;
}));