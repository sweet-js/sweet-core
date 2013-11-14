(function (root$111, factory$112) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$112(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$112);
    }
}(this, function (exports$113, _$114, es6$115, parser$116, expander$117, syntax$118) {
    var get_expression$119 = expander$117.get_expression;
    var syntaxFromToken$120 = syntax$118.syntaxFromToken;
    var makePunc$121 = syntax$118.makePunc;
    var joinSyntax$122 = syntax$118.joinSyntax;
    var joinSyntaxArr$123 = syntax$118.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$124(pattern$137) {
        var fv$138 = [];
        _$114.each(pattern$137, function (pat$139) {
            if (isPatternVar$128(pat$139)) {
                fv$138.push(pat$139.token.value);
            } else if (pat$139.token.type === parser$116.Token.Delimiter) {
                fv$138 = fv$138.concat(freeVarsInPattern$124(pat$139.token.inner));
            }
        });
        return fv$138;
    }
    function typeIsLiteral$125(type$140) {
        return type$140 === parser$116.Token.NullLiteral || type$140 === parser$116.Token.NumericLiteral || type$140 === parser$116.Token.StringLiteral || type$140 === parser$116.Token.RegexLiteral || type$140 === parser$116.Token.BooleanLiteral;
    }
    function containsPatternVar$126(patterns$141) {
        return _$114.any(patterns$141, function (pat$142) {
            if (pat$142.token.type === parser$116.Token.Delimiter) {
                return containsPatternVar$126(pat$142.token.inner);
            }
            return isPatternVar$128(pat$142);
        });
    }
    function delimIsSeparator$127(delim$143) {
        return delim$143 && delim$143.token && delim$143.token.type === parser$116.Token.Delimiter && delim$143.token.value === '()' && delim$143.token.inner.length === 1 && delim$143.token.inner[0].token.type !== parser$116.Token.Delimiter && !containsPatternVar$126(delim$143.token.inner);
    }
    function isPatternVar$128(stx$144) {
        return stx$144.token.value[0] === '$' && stx$144.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$129(tojoin$145, punc$146) {
        return _$114.reduce(_$114.rest(tojoin$145, 1), function (acc$147, join$148) {
            if (punc$146 === ' ') {
                return acc$147.concat(join$148.match);
            }
            return acc$147.concat(makePunc$121(punc$146, _$114.first(join$148.match)), join$148.match);
        }, _$114.first(tojoin$145).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$130(from$149, to$150) {
        return _$114.map(to$150, function (stx$151) {
            return takeLine$131(from$149, stx$151);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$131(from$152, to$153) {
        if (to$153.token.type === parser$116.Token.Delimiter) {
            var next$154;
            if (from$152.token.type === parser$116.Token.Delimiter) {
                next$154 = syntaxFromToken$120({
                    type: parser$116.Token.Delimiter,
                    value: to$153.token.value,
                    inner: to$153.token.inner,
                    startRange: from$152.token.startRange,
                    endRange: from$152.token.endRange,
                    startLineNumber: from$152.token.startLineNumber,
                    startLineStart: from$152.token.startLineStart,
                    endLineNumber: from$152.token.endLineNumber,
                    endLineStart: from$152.token.endLineStart
                }, to$153);
            } else {
                next$154 = syntaxFromToken$120({
                    type: parser$116.Token.Delimiter,
                    value: to$153.token.value,
                    inner: to$153.token.inner,
                    startRange: from$152.token.range,
                    endRange: from$152.token.range,
                    startLineNumber: from$152.token.lineNumber,
                    startLineStart: from$152.token.lineStart,
                    endLineNumber: from$152.token.lineNumber,
                    endLineStart: from$152.token.lineStart
                }, to$153);
            }
        } else {
            if (from$152.token.type === parser$116.Token.Delimiter) {
                next$154 = syntaxFromToken$120({
                    value: to$153.token.value,
                    type: to$153.token.type,
                    lineNumber: from$152.token.startLineNumber,
                    lineStart: from$152.token.startLineStart,
                    range: from$152.token.startRange
                }, to$153);
            } else {
                next$154 = syntaxFromToken$120({
                    value: to$153.token.value,
                    type: to$153.token.type,
                    lineNumber: from$152.token.lineNumber,
                    lineStart: from$152.token.lineStart,
                    range: from$152.token.range
                }, to$153);
            }
        }
        if (to$153.token.leadingComments) {
            next$154.token.leadingComments = to$153.token.leadingComments;
        }
        if (to$153.token.trailingComments) {
            next$154.token.trailingComments = to$153.token.trailingComments;
        }
        return next$154;
    }
    function loadPattern$132(patterns$155) {
        return _$114.chain(patterns$155).reduce(function (acc$156, patStx$157, idx$158) {
            var last$159 = patterns$155[idx$158 - 1];
            var lastLast$160 = patterns$155[idx$158 - 2];
            var next$161 = patterns$155[idx$158 + 1];
            var nextNext$162 = patterns$155[idx$158 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$157.token.value === ':') {
                if (last$159 && isPatternVar$128(last$159) && !isPatternVar$128(next$161)) {
                    return acc$156;
                }
            }
            if (last$159 && last$159.token.value === ':') {
                if (lastLast$160 && isPatternVar$128(lastLast$160) && !isPatternVar$128(patStx$157)) {
                    return acc$156;
                }
            }
            // skip over $
            if (patStx$157.token.value === '$' && next$161 && next$161.token.type === parser$116.Token.Delimiter) {
                return acc$156;
            }
            if (isPatternVar$128(patStx$157)) {
                if (next$161 && next$161.token.value === ':' && !isPatternVar$128(nextNext$162)) {
                    if (typeof nextNext$162 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$157.class = nextNext$162.token.value;
                } else {
                    patStx$157.class = 'token';
                }
            } else if (patStx$157.token.type === parser$116.Token.Delimiter) {
                if (last$159 && last$159.token.value === '$') {
                    patStx$157.class = 'pattern_group';
                }
                patStx$157.token.inner = loadPattern$132(patStx$157.token.inner);
            } else {
                patStx$157.class = 'pattern_literal';
            }
            return acc$156.concat(patStx$157);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$163, patStx$164, idx$165, patterns$166) {
            var separator$167 = ' ';
            var repeat$168 = false;
            var next$169 = patterns$166[idx$165 + 1];
            var nextNext$170 = patterns$166[idx$165 + 2];
            if (next$169 && next$169.token.value === '...') {
                repeat$168 = true;
                separator$167 = ' ';
            } else if (delimIsSeparator$127(next$169) && nextNext$170 && nextNext$170.token.value === '...') {
                repeat$168 = true;
                parser$116.assert(next$169.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$167 = next$169.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$164.token.value === '...' || delimIsSeparator$127(patStx$164) && next$169 && next$169.token.value === '...') {
                return acc$163;
            }
            patStx$164.repeat = repeat$168;
            patStx$164.separator = separator$167;
            return acc$163.concat(patStx$164);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$133(patternClass$171, stx$172, env$173) {
        var result$174, rest$175;
        // pattern has no parse class
        if (patternClass$171 === 'token' && stx$172[0] && stx$172[0].token.type !== parser$116.Token.EOF) {
            result$174 = [stx$172[0]];
            rest$175 = stx$172.slice(1);
        } else if (patternClass$171 === 'lit' && stx$172[0] && typeIsLiteral$125(stx$172[0].token.type)) {
            result$174 = [stx$172[0]];
            rest$175 = stx$172.slice(1);
        } else if (patternClass$171 === 'ident' && stx$172[0] && stx$172[0].token.type === parser$116.Token.Identifier) {
            result$174 = [stx$172[0]];
            rest$175 = stx$172.slice(1);
        } else if (stx$172.length > 0 && patternClass$171 === 'VariableStatement') {
            var match$176 = expander$117.enforest(stx$172, expander$117.makeExpanderContext({ env: env$173 }));
            if (match$176.result && match$176.result.hasPrototype(expander$117.VariableStatement)) {
                result$174 = match$176.result.destruct(false);
                rest$175 = match$176.rest;
            } else {
                result$174 = null;
                rest$175 = stx$172;
            }
        } else if (stx$172.length > 0 && patternClass$171 === 'expr') {
            var match$176 = expander$117.get_expression(stx$172, expander$117.makeExpanderContext({ env: env$173 }));
            if (match$176.result === null || !match$176.result.hasPrototype(expander$117.Expr)) {
                result$174 = null;
                rest$175 = stx$172;
            } else {
                result$174 = match$176.result.destruct(false);
                rest$175 = match$176.rest;
            }
        } else {
            result$174 = null;
            rest$175 = stx$172;
        }
        return {
            result: result$174,
            rest: rest$175
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$134(patterns$177, stx$178, env$179, topLevel$180) {
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
        topLevel$180 = topLevel$180 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$181 = [];
        var patternEnv$182 = {};
        var match$183;
        var pattern$184;
        var rest$185 = stx$178;
        var success$186 = true;
        for (var i$187 = 0; i$187 < patterns$177.length; i$187++) {
            if (success$186 === false) {
                break;
            }
            pattern$184 = patterns$177[i$187];
            do {
                match$183 = matchPattern$135(pattern$184, rest$185, env$179, patternEnv$182);
                if (!match$183.success && pattern$184.repeat) {
                    // a repeat can match zero tokens and still be a
                    // "success" so break out of the inner loop and
                    // try the next pattern
                    break;
                }
                if (!match$183.success) {
                    success$186 = false;
                    break;
                }
                rest$185 = match$183.rest;
                patternEnv$182 = match$183.patternEnv;
                if (success$186 && !(topLevel$180 || pattern$184.repeat)) {
                    // the very last pattern matched, inside a
                    // delimiter, not a repeat, *and* there are more
                    // unmatched bits of syntax
                    if (i$187 == patterns$177.length - 1 && rest$185.length !== 0) {
                        success$186 = false;
                        break;
                    }
                }
                if (pattern$184.repeat && success$186) {
                    if (rest$185[0] && rest$185[0].token.value === pattern$184.separator) {
                        // more tokens and the next token matches the separator
                        rest$185 = rest$185.slice(1);
                    } else if (pattern$184.separator === ' ') {
                        // no separator specified (using the empty string for this)
                        // so keep going
                        continue;
                    } else if (pattern$184.separator !== ' ' && rest$185.length > 0 && i$187 === patterns$177.length - 1 && topLevel$180 === false) {
                        // separator is specified, there is a next token, the
                        // next token doesn't match the separator, there are
                        // no more patterns, and this is a top level pattern
                        // so the match has failed
                        success$186 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$184.repeat && success$186 && rest$185.length > 0);
        }
        return {
            success: success$186,
            rest: rest$185,
            patternEnv: patternEnv$182
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
    function matchPattern$135(pattern$188, stx$189, env$190, patternEnv$191) {
        var subMatch$192;
        var match$193, matchEnv$194;
        var rest$195;
        var success$196;
        if (typeof pattern$188.inner !== 'undefined') {
            if (pattern$188.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$192 = matchPatterns$134(pattern$188.inner, stx$189, env$190, true);
                rest$195 = subMatch$192.rest;
            } else if (stx$189[0] && stx$189[0].token.type === parser$116.Token.Delimiter && stx$189[0].token.value === pattern$188.value) {
                stx$189[0].expose();
                if (pattern$188.inner.length === 0 && stx$189[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$189,
                        patternEnv: patternEnv$191
                    };
                }
                subMatch$192 = matchPatterns$134(pattern$188.inner, stx$189[0].token.inner, env$190, false);
                rest$195 = stx$189.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$189,
                    patternEnv: patternEnv$191
                };
            }
            success$196 = subMatch$192.success;
            // merge the subpattern matches with the current pattern environment
            _$114.keys(subMatch$192.patternEnv).forEach(function (patternKey$197) {
                if (pattern$188.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$198 = subMatch$192.patternEnv[patternKey$197].level + 1;
                    if (patternEnv$191[patternKey$197]) {
                        patternEnv$191[patternKey$197].level = nextLevel$198;
                        patternEnv$191[patternKey$197].match.push(subMatch$192.patternEnv[patternKey$197]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$191[patternKey$197] = {
                            level: nextLevel$198,
                            match: [subMatch$192.patternEnv[patternKey$197]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$191[patternKey$197] = subMatch$192.patternEnv[patternKey$197];
                }
            });
        } else {
            if (pattern$188.class === 'pattern_literal') {
                // wildcard
                if (stx$189[0] && pattern$188.value === '_') {
                    success$196 = true;
                    rest$195 = stx$189.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$189[0] && pattern$188.value === stx$189[0].token.value) {
                    success$196 = true;
                    rest$195 = stx$189.slice(1);
                } else {
                    success$196 = false;
                    rest$195 = stx$189;
                }
            } else {
                match$193 = matchPatternClass$133(pattern$188.class, stx$189, env$190);
                success$196 = match$193.result !== null;
                rest$195 = match$193.rest;
                matchEnv$194 = {
                    level: 0,
                    match: match$193.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$188.repeat) {
                    if (patternEnv$191[pattern$188.value]) {
                        patternEnv$191[pattern$188.value].match.push(matchEnv$194);
                    } else {
                        // initialize if necessary
                        patternEnv$191[pattern$188.value] = {
                            level: 1,
                            match: [matchEnv$194]
                        };
                    }
                } else {
                    patternEnv$191[pattern$188.value] = matchEnv$194;
                }
            }
        }
        return {
            success: success$196,
            rest: rest$195,
            patternEnv: patternEnv$191
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$136(macroBody$199, macroNameStx$200, env$201) {
        return _$114.chain(macroBody$199).reduce(function (acc$202, bodyStx$203, idx$204, original$205) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$206 = original$205[idx$204 - 1];
            var next$207 = original$205[idx$204 + 1];
            var nextNext$208 = original$205[idx$204 + 2];
            // drop `...`
            if (bodyStx$203.token.value === '...') {
                return acc$202;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$127(bodyStx$203) && next$207 && next$207.token.value === '...') {
                return acc$202;
            }
            // skip the $ in $(...)
            if (bodyStx$203.token.value === '$' && next$207 && next$207.token.type === parser$116.Token.Delimiter && next$207.token.value === '()') {
                return acc$202;
            }
            // mark $[...] as a literal
            if (bodyStx$203.token.value === '$' && next$207 && next$207.token.type === parser$116.Token.Delimiter && next$207.token.value === '[]') {
                next$207.literal = true;
                return acc$202;
            }
            if (bodyStx$203.token.type === parser$116.Token.Delimiter && bodyStx$203.token.value === '()' && last$206 && last$206.token.value === '$') {
                bodyStx$203.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$203.literal === true) {
                parser$116.assert(bodyStx$203.token.type === parser$116.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$202.concat(bodyStx$203.token.inner);
            }
            if (next$207 && next$207.token.value === '...') {
                bodyStx$203.repeat = true;
                bodyStx$203.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$127(next$207) && nextNext$208 && nextNext$208.token.value === '...') {
                bodyStx$203.repeat = true;
                bodyStx$203.separator = next$207.token.inner[0].token.value;
            }
            return acc$202.concat(bodyStx$203);
        }, []).reduce(function (acc$209, bodyStx$210, idx$211) {
            // then do the actual transcription
            if (bodyStx$210.repeat) {
                if (bodyStx$210.token.type === parser$116.Token.Delimiter) {
                    bodyStx$210.expose();
                    var fv$212 = _$114.filter(freeVarsInPattern$124(bodyStx$210.token.inner), function (pat$219) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$201.hasOwnProperty(pat$219);
                        });
                    var restrictedEnv$213 = [];
                    var nonScalar$214 = _$114.find(fv$212, function (pat$220) {
                            return env$201[pat$220].level > 0;
                        });
                    parser$116.assert(typeof nonScalar$214 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$215 = env$201[nonScalar$214].match.length;
                    var sameLength$216 = _$114.all(fv$212, function (pat$221) {
                            return env$201[pat$221].level === 0 || env$201[pat$221].match.length === repeatLength$215;
                        });
                    parser$116.assert(sameLength$216, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$213 = _$114.map(_$114.range(repeatLength$215), function (idx$222) {
                        var renv$223 = {};
                        _$114.each(fv$212, function (pat$224) {
                            if (env$201[pat$224].level === 0) {
                                // copy scalars over
                                renv$223[pat$224] = env$201[pat$224];
                            } else {
                                // grab the match at this index
                                renv$223[pat$224] = env$201[pat$224].match[idx$222];
                            }
                        });
                        return renv$223;
                    });
                    var transcribed$217 = _$114.map(restrictedEnv$213, function (renv$225) {
                            if (bodyStx$210.group) {
                                return transcribe$136(bodyStx$210.token.inner, macroNameStx$200, renv$225);
                            } else {
                                var newBody$226 = syntaxFromToken$120(_$114.clone(bodyStx$210.token), bodyStx$210);
                                newBody$226.token.inner = transcribe$136(bodyStx$210.token.inner, macroNameStx$200, renv$225);
                                return newBody$226;
                            }
                        });
                    var joined$218;
                    if (bodyStx$210.group) {
                        joined$218 = joinSyntaxArr$123(transcribed$217, bodyStx$210.separator);
                    } else {
                        joined$218 = joinSyntax$122(transcribed$217, bodyStx$210.separator);
                    }
                    return acc$209.concat(joined$218);
                }
                if (!env$201[bodyStx$210.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$210.token.value + ' is not bound for the template');
                } else if (env$201[bodyStx$210.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$210.token.value + ' does not match in the template');
                }
                return acc$209.concat(joinRepeatedMatch$129(env$201[bodyStx$210.token.value].match, bodyStx$210.separator));
            } else {
                if (bodyStx$210.token.type === parser$116.Token.Delimiter) {
                    bodyStx$210.expose();
                    var newBody$227 = syntaxFromToken$120(_$114.clone(bodyStx$210.token), macroBody$199);
                    newBody$227.token.inner = transcribe$136(bodyStx$210.token.inner, macroNameStx$200, env$201);
                    return acc$209.concat(takeLineContext$130(macroNameStx$200, [newBody$227]));
                }
                if (isPatternVar$128(bodyStx$210) && Object.prototype.hasOwnProperty.bind(env$201)(bodyStx$210.token.value)) {
                    if (!env$201[bodyStx$210.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$210.token.value + ' is not bound for the template');
                    } else if (env$201[bodyStx$210.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$210.token.value + ' does not match in the template');
                    }
                    return acc$209.concat(takeLineContext$130(macroNameStx$200, env$201[bodyStx$210.token.value].match));
                }
                return acc$209.concat(takeLineContext$130(macroNameStx$200, [bodyStx$210]));
            }
        }, []).value();
    }
    exports$113.loadPattern = loadPattern$132;
    exports$113.matchPatterns = matchPatterns$134;
    exports$113.transcribe = transcribe$136;
    exports$113.matchPatternClass = matchPatternClass$133;
    exports$113.takeLineContext = takeLineContext$130;
    exports$113.takeLine = takeLine$131;
}));