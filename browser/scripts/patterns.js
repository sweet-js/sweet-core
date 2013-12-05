(function (root$2626, factory$2627) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2627(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$2627);
    }
}(this, function (exports$2628, _$2629, es6$2630, parser$2631, expander$2632, syntax$2633) {
    var get_expression$2634 = expander$2632.get_expression;
    var syntaxFromToken$2635 = syntax$2633.syntaxFromToken;
    var makePunc$2636 = syntax$2633.makePunc;
    var joinSyntax$2637 = syntax$2633.joinSyntax;
    var joinSyntaxArr$2638 = syntax$2633.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$2639(pattern$2652) {
        var fv$2653 = [];
        _$2629.each(pattern$2652, function (pat$2654) {
            if (isPatternVar$2643(pat$2654)) {
                fv$2653.push(pat$2654.token.value);
            } else if (pat$2654.token.type === parser$2631.Token.Delimiter) {
                fv$2653 = fv$2653.concat(freeVarsInPattern$2639(pat$2654.token.inner));
            }
        });
        return fv$2653;
    }
    function typeIsLiteral$2640(type$2655) {
        return type$2655 === parser$2631.Token.NullLiteral || type$2655 === parser$2631.Token.NumericLiteral || type$2655 === parser$2631.Token.StringLiteral || type$2655 === parser$2631.Token.RegexLiteral || type$2655 === parser$2631.Token.BooleanLiteral;
    }
    function containsPatternVar$2641(patterns$2656) {
        return _$2629.any(patterns$2656, function (pat$2657) {
            if (pat$2657.token.type === parser$2631.Token.Delimiter) {
                return containsPatternVar$2641(pat$2657.token.inner);
            }
            return isPatternVar$2643(pat$2657);
        });
    }
    function delimIsSeparator$2642(delim$2658) {
        return delim$2658 && delim$2658.token && delim$2658.token.type === parser$2631.Token.Delimiter && delim$2658.token.value === '()' && delim$2658.token.inner.length === 1 && delim$2658.token.inner[0].token.type !== parser$2631.Token.Delimiter && !containsPatternVar$2641(delim$2658.token.inner);
    }
    function isPatternVar$2643(stx$2659) {
        return stx$2659.token.value[0] === '$' && stx$2659.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$2644(tojoin$2660, punc$2661) {
        return _$2629.reduce(_$2629.rest(tojoin$2660, 1), function (acc$2662, join$2663) {
            if (punc$2661 === ' ') {
                return acc$2662.concat(join$2663.match);
            }
            return acc$2662.concat(makePunc$2636(punc$2661, _$2629.first(join$2663.match)), join$2663.match);
        }, _$2629.first(tojoin$2660).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$2645(from$2664, to$2665) {
        return _$2629.map(to$2665, function (stx$2666) {
            return takeLine$2646(from$2664, stx$2666);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$2646(from$2667, to$2668) {
        if (to$2668.token.type === parser$2631.Token.Delimiter) {
            var next$2669;
            if (from$2667.token.type === parser$2631.Token.Delimiter) {
                next$2669 = syntaxFromToken$2635({
                    type: parser$2631.Token.Delimiter,
                    value: to$2668.token.value,
                    inner: takeLineContext$2645(from$2667, to$2668.token.inner),
                    startRange: from$2667.token.startRange,
                    endRange: from$2667.token.endRange,
                    startLineNumber: from$2667.token.startLineNumber,
                    startLineStart: from$2667.token.startLineStart,
                    endLineNumber: from$2667.token.endLineNumber,
                    endLineStart: from$2667.token.endLineStart
                }, to$2668);
            } else {
                next$2669 = syntaxFromToken$2635({
                    type: parser$2631.Token.Delimiter,
                    value: to$2668.token.value,
                    inner: takeLineContext$2645(from$2667, to$2668.token.inner),
                    startRange: from$2667.token.range,
                    endRange: from$2667.token.range,
                    startLineNumber: from$2667.token.lineNumber,
                    startLineStart: from$2667.token.lineStart,
                    endLineNumber: from$2667.token.lineNumber,
                    endLineStart: from$2667.token.lineStart
                }, to$2668);
            }
        } else {
            if (from$2667.token.type === parser$2631.Token.Delimiter) {
                next$2669 = syntaxFromToken$2635({
                    value: to$2668.token.value,
                    type: to$2668.token.type,
                    lineNumber: from$2667.token.startLineNumber,
                    lineStart: from$2667.token.startLineStart,
                    range: from$2667.token.startRange
                }, to$2668);
            } else {
                next$2669 = syntaxFromToken$2635({
                    value: to$2668.token.value,
                    type: to$2668.token.type,
                    lineNumber: from$2667.token.lineNumber,
                    lineStart: from$2667.token.lineStart,
                    range: from$2667.token.range
                }, to$2668);
            }
        }
        if (to$2668.token.leadingComments) {
            next$2669.token.leadingComments = to$2668.token.leadingComments;
        }
        if (to$2668.token.trailingComments) {
            next$2669.token.trailingComments = to$2668.token.trailingComments;
        }
        return next$2669;
    }
    function loadPattern$2647(patterns$2670) {
        return _$2629.chain(patterns$2670).reduce(function (acc$2671, patStx$2672, idx$2673) {
            var last$2674 = patterns$2670[idx$2673 - 1];
            var lastLast$2675 = patterns$2670[idx$2673 - 2];
            var next$2676 = patterns$2670[idx$2673 + 1];
            var nextNext$2677 = patterns$2670[idx$2673 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$2672.token.value === ':') {
                if (last$2674 && isPatternVar$2643(last$2674) && !isPatternVar$2643(next$2676)) {
                    return acc$2671;
                }
            }
            if (last$2674 && last$2674.token.value === ':') {
                if (lastLast$2675 && isPatternVar$2643(lastLast$2675) && !isPatternVar$2643(patStx$2672)) {
                    return acc$2671;
                }
            }
            // skip over $
            if (patStx$2672.token.value === '$' && next$2676 && next$2676.token.type === parser$2631.Token.Delimiter) {
                return acc$2671;
            }
            if (isPatternVar$2643(patStx$2672)) {
                if (next$2676 && next$2676.token.value === ':' && !isPatternVar$2643(nextNext$2677)) {
                    if (typeof nextNext$2677 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$2672.class = nextNext$2677.token.value;
                } else {
                    patStx$2672.class = 'token';
                }
            } else if (patStx$2672.token.type === parser$2631.Token.Delimiter) {
                if (last$2674 && last$2674.token.value === '$') {
                    patStx$2672.class = 'pattern_group';
                }
                patStx$2672.token.inner = loadPattern$2647(patStx$2672.token.inner);
            } else {
                patStx$2672.class = 'pattern_literal';
            }
            return acc$2671.concat(patStx$2672);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2678, patStx$2679, idx$2680, patterns$2681) {
            var separator$2682 = ' ';
            var repeat$2683 = false;
            var next$2684 = patterns$2681[idx$2680 + 1];
            var nextNext$2685 = patterns$2681[idx$2680 + 2];
            if (next$2684 && next$2684.token.value === '...') {
                repeat$2683 = true;
                separator$2682 = ' ';
            } else if (delimIsSeparator$2642(next$2684) && nextNext$2685 && nextNext$2685.token.value === '...') {
                repeat$2683 = true;
                parser$2631.assert(next$2684.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$2682 = next$2684.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$2679.token.value === '...' || delimIsSeparator$2642(patStx$2679) && next$2684 && next$2684.token.value === '...') {
                return acc$2678;
            }
            patStx$2679.repeat = repeat$2683;
            patStx$2679.separator = separator$2682;
            return acc$2678.concat(patStx$2679);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$2648(patternClass$2686, stx$2687, env$2688) {
        var result$2689, rest$2690;
        // pattern has no parse class
        if (patternClass$2686 === 'token' && stx$2687[0] && stx$2687[0].token.type !== parser$2631.Token.EOF) {
            result$2689 = [stx$2687[0]];
            rest$2690 = stx$2687.slice(1);
        } else if (patternClass$2686 === 'lit' && stx$2687[0] && typeIsLiteral$2640(stx$2687[0].token.type)) {
            result$2689 = [stx$2687[0]];
            rest$2690 = stx$2687.slice(1);
        } else if (patternClass$2686 === 'ident' && stx$2687[0] && stx$2687[0].token.type === parser$2631.Token.Identifier) {
            result$2689 = [stx$2687[0]];
            rest$2690 = stx$2687.slice(1);
        } else if (stx$2687.length > 0 && patternClass$2686 === 'VariableStatement') {
            var match$2691 = expander$2632.enforest(stx$2687, expander$2632.makeExpanderContext({ env: env$2688 }));
            if (match$2691.result && match$2691.result.hasPrototype(expander$2632.VariableStatement)) {
                result$2689 = match$2691.result.destruct(false);
                rest$2690 = match$2691.rest;
            } else {
                result$2689 = null;
                rest$2690 = stx$2687;
            }
        } else if (stx$2687.length > 0 && patternClass$2686 === 'expr') {
            var match$2691 = expander$2632.get_expression(stx$2687, expander$2632.makeExpanderContext({ env: env$2688 }));
            if (match$2691.result === null || !match$2691.result.hasPrototype(expander$2632.Expr)) {
                result$2689 = null;
                rest$2690 = stx$2687;
            } else {
                result$2689 = match$2691.result.destruct(false);
                rest$2690 = match$2691.rest;
            }
        } else {
            result$2689 = null;
            rest$2690 = stx$2687;
        }
        return {
            result: result$2689,
            rest: rest$2690
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$2649(patterns$2692, stx$2693, env$2694, topLevel$2695) {
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
        topLevel$2695 = topLevel$2695 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2696 = [];
        var patternEnv$2697 = {};
        var match$2698;
        var pattern$2699;
        var rest$2700 = stx$2693;
        var success$2701 = true;
        patternLoop:
            for (var i$2702 = 0; i$2702 < patterns$2692.length; i$2702++) {
                if (success$2701 === false) {
                    break;
                }
                pattern$2699 = patterns$2692[i$2702];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2699.repeat && i$2702 + 1 < patterns$2692.length) {
                        var restMatch$2703 = matchPatterns$2649(patterns$2692.slice(i$2702 + 1), rest$2700, env$2694, topLevel$2695);
                        if (restMatch$2703.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2698 = matchPattern$2650(pattern$2699, [], env$2694, patternEnv$2697);
                            patternEnv$2697 = _$2629.extend(restMatch$2703.patternEnv, match$2698.patternEnv);
                            rest$2700 = restMatch$2703.rest;
                            break patternLoop;
                        }
                    }
                    match$2698 = matchPattern$2650(pattern$2699, rest$2700, env$2694, patternEnv$2697);
                    if (!match$2698.success && pattern$2699.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2698.success) {
                        success$2701 = false;
                        break;
                    }
                    rest$2700 = match$2698.rest;
                    patternEnv$2697 = match$2698.patternEnv;
                    if (success$2701 && !(topLevel$2695 || pattern$2699.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2702 == patterns$2692.length - 1 && rest$2700.length !== 0) {
                            success$2701 = false;
                            break;
                        }
                    }
                    if (pattern$2699.repeat && success$2701) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (rest$2700[0] && rest$2700[0].token.value === pattern$2699.separator) {
                            // more tokens and the next token matches the separator
                            rest$2700 = rest$2700.slice(1);
                        } else if (pattern$2699.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (pattern$2699.separator !== ' ' && rest$2700.length > 0 && i$2702 === patterns$2692.length - 1 && topLevel$2695 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2701 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2699.repeat && success$2701 && rest$2700.length > 0);
            }
        return {
            success: success$2701,
            rest: rest$2700,
            patternEnv: patternEnv$2697
        };
    }
    /* the pattern environment will look something like:
    {
        "$x": {
            level: 2,
            match: [{
                level: 1,
                match: [{
                    level: 0,
                    match: [tok1, tok2, ...]
                }, {
                    level: 0,
                    match: [tok1, tok2, ...]
                }]
            }, {
                level: 1,
                match: [{
                    level: 0,
                    match: [tok1, tok2, ...]
                }]
            }]
        },
        "$y" : ...
    }
    */
    function matchPattern$2650(pattern$2704, stx$2705, env$2706, patternEnv$2707) {
        var subMatch$2708;
        var match$2709, matchEnv$2710;
        var rest$2711;
        var success$2712;
        if (typeof pattern$2704.inner !== 'undefined') {
            if (pattern$2704.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2708 = matchPatterns$2649(pattern$2704.inner, stx$2705, env$2706, true);
                rest$2711 = subMatch$2708.rest;
            } else if (stx$2705[0] && stx$2705[0].token.type === parser$2631.Token.Delimiter && stx$2705[0].token.value === pattern$2704.value) {
                stx$2705[0].expose();
                if (pattern$2704.inner.length === 0 && stx$2705[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2705,
                        patternEnv: patternEnv$2707
                    };
                }
                subMatch$2708 = matchPatterns$2649(pattern$2704.inner, stx$2705[0].token.inner, env$2706, false);
                rest$2711 = stx$2705.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2705,
                    patternEnv: patternEnv$2707
                };
            }
            success$2712 = subMatch$2708.success;
            // merge the subpattern matches with the current pattern environment
            _$2629.keys(subMatch$2708.patternEnv).forEach(function (patternKey$2713) {
                if (pattern$2704.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2714 = subMatch$2708.patternEnv[patternKey$2713].level + 1;
                    if (patternEnv$2707[patternKey$2713]) {
                        patternEnv$2707[patternKey$2713].level = nextLevel$2714;
                        patternEnv$2707[patternKey$2713].match.push(subMatch$2708.patternEnv[patternKey$2713]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2707[patternKey$2713] = {
                            level: nextLevel$2714,
                            match: [subMatch$2708.patternEnv[patternKey$2713]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2707[patternKey$2713] = subMatch$2708.patternEnv[patternKey$2713];
                }
            });
        } else {
            if (pattern$2704.class === 'pattern_literal') {
                // wildcard
                if (stx$2705[0] && pattern$2704.value === '_') {
                    success$2712 = true;
                    rest$2711 = stx$2705.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2705[0] && pattern$2704.value === stx$2705[0].token.value) {
                    success$2712 = true;
                    rest$2711 = stx$2705.slice(1);
                } else {
                    success$2712 = false;
                    rest$2711 = stx$2705;
                }
            } else {
                match$2709 = matchPatternClass$2648(pattern$2704.class, stx$2705, env$2706);
                success$2712 = match$2709.result !== null;
                rest$2711 = match$2709.rest;
                matchEnv$2710 = {
                    level: 0,
                    match: match$2709.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2704.repeat) {
                    if (patternEnv$2707[pattern$2704.value]) {
                        patternEnv$2707[pattern$2704.value].match.push(matchEnv$2710);
                    } else {
                        // initialize if necessary
                        patternEnv$2707[pattern$2704.value] = {
                            level: 1,
                            match: [matchEnv$2710]
                        };
                    }
                } else {
                    patternEnv$2707[pattern$2704.value] = matchEnv$2710;
                }
            }
        }
        return {
            success: success$2712,
            rest: rest$2711,
            patternEnv: patternEnv$2707
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$2651(macroBody$2715, macroNameStx$2716, env$2717) {
        return _$2629.chain(macroBody$2715).reduce(function (acc$2718, bodyStx$2719, idx$2720, original$2721) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2722 = original$2721[idx$2720 - 1];
            var next$2723 = original$2721[idx$2720 + 1];
            var nextNext$2724 = original$2721[idx$2720 + 2];
            // drop `...`
            if (bodyStx$2719.token.value === '...') {
                return acc$2718;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$2642(bodyStx$2719) && next$2723 && next$2723.token.value === '...') {
                return acc$2718;
            }
            // skip the $ in $(...)
            if (bodyStx$2719.token.value === '$' && next$2723 && next$2723.token.type === parser$2631.Token.Delimiter && next$2723.token.value === '()') {
                return acc$2718;
            }
            // mark $[...] as a literal
            if (bodyStx$2719.token.value === '$' && next$2723 && next$2723.token.type === parser$2631.Token.Delimiter && next$2723.token.value === '[]') {
                next$2723.literal = true;
                return acc$2718;
            }
            if (bodyStx$2719.token.type === parser$2631.Token.Delimiter && bodyStx$2719.token.value === '()' && last$2722 && last$2722.token.value === '$') {
                bodyStx$2719.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2719.literal === true) {
                parser$2631.assert(bodyStx$2719.token.type === parser$2631.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2718.concat(bodyStx$2719.token.inner);
            }
            if (next$2723 && next$2723.token.value === '...') {
                bodyStx$2719.repeat = true;
                bodyStx$2719.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$2642(next$2723) && nextNext$2724 && nextNext$2724.token.value === '...') {
                bodyStx$2719.repeat = true;
                bodyStx$2719.separator = next$2723.token.inner[0].token.value;
            }
            return acc$2718.concat(bodyStx$2719);
        }, []).reduce(function (acc$2725, bodyStx$2726, idx$2727) {
            // then do the actual transcription
            if (bodyStx$2726.repeat) {
                if (bodyStx$2726.token.type === parser$2631.Token.Delimiter) {
                    bodyStx$2726.expose();
                    var fv$2728 = _$2629.filter(freeVarsInPattern$2639(bodyStx$2726.token.inner), function (pat$2735) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2717.hasOwnProperty(pat$2735);
                        });
                    var restrictedEnv$2729 = [];
                    var nonScalar$2730 = _$2629.find(fv$2728, function (pat$2736) {
                            return env$2717[pat$2736].level > 0;
                        });
                    parser$2631.assert(typeof nonScalar$2730 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2731 = env$2717[nonScalar$2730].match.length;
                    var sameLength$2732 = _$2629.all(fv$2728, function (pat$2737) {
                            return env$2717[pat$2737].level === 0 || env$2717[pat$2737].match.length === repeatLength$2731;
                        });
                    parser$2631.assert(sameLength$2732, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$2729 = _$2629.map(_$2629.range(repeatLength$2731), function (idx$2738) {
                        var renv$2739 = {};
                        _$2629.each(fv$2728, function (pat$2740) {
                            if (env$2717[pat$2740].level === 0) {
                                // copy scalars over
                                renv$2739[pat$2740] = env$2717[pat$2740];
                            } else {
                                // grab the match at this index
                                renv$2739[pat$2740] = env$2717[pat$2740].match[idx$2738];
                            }
                        });
                        return renv$2739;
                    });
                    var transcribed$2733 = _$2629.map(restrictedEnv$2729, function (renv$2741) {
                            if (bodyStx$2726.group) {
                                return transcribe$2651(bodyStx$2726.token.inner, macroNameStx$2716, renv$2741);
                            } else {
                                var newBody$2742 = syntaxFromToken$2635(_$2629.clone(bodyStx$2726.token), bodyStx$2726);
                                newBody$2742.token.inner = transcribe$2651(bodyStx$2726.token.inner, macroNameStx$2716, renv$2741);
                                return newBody$2742;
                            }
                        });
                    var joined$2734;
                    if (bodyStx$2726.group) {
                        joined$2734 = joinSyntaxArr$2638(transcribed$2733, bodyStx$2726.separator);
                    } else {
                        joined$2734 = joinSyntax$2637(transcribed$2733, bodyStx$2726.separator);
                    }
                    return acc$2725.concat(joined$2734);
                }
                if (!env$2717[bodyStx$2726.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$2726.token.value + ' is not bound for the template');
                } else if (env$2717[bodyStx$2726.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$2726.token.value + ' does not match in the template');
                }
                return acc$2725.concat(joinRepeatedMatch$2644(env$2717[bodyStx$2726.token.value].match, bodyStx$2726.separator));
            } else {
                if (bodyStx$2726.token.type === parser$2631.Token.Delimiter) {
                    bodyStx$2726.expose();
                    var newBody$2743 = syntaxFromToken$2635(_$2629.clone(bodyStx$2726.token), macroBody$2715);
                    newBody$2743.token.inner = transcribe$2651(bodyStx$2726.token.inner, macroNameStx$2716, env$2717);
                    return acc$2725.concat([newBody$2743]);
                }
                if (isPatternVar$2643(bodyStx$2726) && Object.prototype.hasOwnProperty.bind(env$2717)(bodyStx$2726.token.value)) {
                    if (!env$2717[bodyStx$2726.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$2726.token.value + ' is not bound for the template');
                    } else if (env$2717[bodyStx$2726.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$2726.token.value + ' does not match in the template');
                    }
                    return acc$2725.concat(env$2717[bodyStx$2726.token.value].match);
                }
                return acc$2725.concat([bodyStx$2726]);
            }
        }, []).value();
    }
    exports$2628.loadPattern = loadPattern$2647;
    exports$2628.matchPatterns = matchPatterns$2649;
    exports$2628.transcribe = transcribe$2651;
    exports$2628.matchPatternClass = matchPatternClass$2648;
    exports$2628.takeLineContext = takeLineContext$2645;
    exports$2628.takeLine = takeLine$2646;
}));