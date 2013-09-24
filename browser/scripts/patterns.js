(function (root$97, factory$98) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$98(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$98);
    }
}(this, function (exports$99, _$100, es6$101, parser$102, expander$103, syntax$104) {
    var get_expression$105 = expander$103.get_expression;
    var syntaxFromToken$106 = syntax$104.syntaxFromToken;
    var mkSyntax$107 = syntax$104.mkSyntax;
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$108(tojoin$123, punc$124) {
        if (tojoin$123.length === 0) {
            return [];
        }
        if (punc$124 === ' ') {
            return tojoin$123;
        }
        return _$100.reduce(_$100.rest(tojoin$123, 1), function (acc$125, join$126) {
            return acc$125.concat(mkSyntax$107(punc$124, parser$102.Token.Punctuator, join$126), join$126);
        }, [_$100.first(tojoin$123)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$109(tojoin$127, punc$128) {
        if (tojoin$127.length === 0) {
            return [];
        }
        if (punc$128 === ' ') {
            return _$100.flatten(tojoin$127, true);
        }
        return _$100.reduce(_$100.rest(tojoin$127, 1), function (acc$129, join$130) {
            return acc$129.concat(mkSyntax$107(punc$128, parser$102.Token.Punctuator, _$100.first(join$130)), join$130);
        }, _$100.first(tojoin$127));
    }
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$110(pattern$131) {
        var fv$132 = [];
        _$100.each(pattern$131, function (pat$133) {
            if (isPatternVar$114(pat$133)) {
                fv$132.push(pat$133.token.value);
            } else if (pat$133.token.type === parser$102.Token.Delimiter) {
                fv$132 = fv$132.concat(freeVarsInPattern$110(pat$133.token.inner));
            }
        });
        return fv$132;
    }
    function typeIsLiteral$111(type$134) {
        return type$134 === parser$102.Token.NullLiteral || type$134 === parser$102.Token.NumericLiteral || type$134 === parser$102.Token.StringLiteral || type$134 === parser$102.Token.RegexLiteral || type$134 === parser$102.Token.BooleanLiteral;
    }
    function containsPatternVar$112(patterns$135) {
        return _$100.any(patterns$135, function (pat$136) {
            if (pat$136.token.type === parser$102.Token.Delimiter) {
                return containsPatternVar$112(pat$136.token.inner);
            }
            return isPatternVar$114(pat$136);
        });
    }
    function delimIsSeparator$113(delim$137) {
        return delim$137 && delim$137.token && delim$137.token.type === parser$102.Token.Delimiter && delim$137.token.value === '()' && delim$137.token.inner.length === 1 && delim$137.token.inner[0].token.type !== parser$102.Token.Delimiter && !containsPatternVar$112(delim$137.token.inner);
    }
    function isPatternVar$114(stx$138) {
        return stx$138.token.value[0] === '$' && stx$138.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$115(tojoin$139, punc$140) {
        return _$100.reduce(_$100.rest(tojoin$139, 1), function (acc$141, join$142) {
            if (punc$140 === ' ') {
                return acc$141.concat(join$142.match);
            }
            return acc$141.concat(mkSyntax$107(punc$140, parser$102.Token.Punctuator, _$100.first(join$142.match)), join$142.match);
        }, _$100.first(tojoin$139).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$116(from$143, to$144) {
        return _$100.map(to$144, function (stx$145) {
            return takeLine$117(from$143, stx$145);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$117(from$146, to$147) {
        if (to$147.token.type === parser$102.Token.Delimiter) {
            if (from$146.token.type === parser$102.Token.Delimiter) {
                var next$148 = syntaxFromToken$106({
                        type: parser$102.Token.Delimiter,
                        value: to$147.token.value,
                        inner: to$147.token.inner,
                        startRange: from$146.token.startRange,
                        endRange: from$146.token.endRange,
                        startLineNumber: from$146.token.startLineNumber,
                        startLineStart: from$146.token.startLineStart,
                        endLineNumber: from$146.token.endLineNumber,
                        endLineStart: from$146.token.endLineStart
                    }, to$147.context);
            } else {
                var next$148 = syntaxFromToken$106({
                        type: parser$102.Token.Delimiter,
                        value: to$147.token.value,
                        inner: to$147.token.inner,
                        startRange: from$146.token.range,
                        endRange: from$146.token.range,
                        startLineNumber: from$146.token.lineNumber,
                        startLineStart: from$146.token.lineStart,
                        endLineNumber: from$146.token.lineNumber,
                        endLineStart: from$146.token.lineStart
                    }, to$147.context);
            }
            next$148.deferredContext = to$147.deferredContext;
            return next$148;
        }
        if (from$146.token.type === parser$102.Token.Delimiter) {
            return syntaxFromToken$106({
                value: to$147.token.value,
                type: to$147.token.type,
                lineNumber: from$146.token.startLineNumber,
                lineStart: from$146.token.startLineStart,
                range: from$146.token.startRange
            }, to$147.context);
        } else {
            return syntaxFromToken$106({
                value: to$147.token.value,
                type: to$147.token.type,
                lineNumber: from$146.token.lineNumber,
                lineStart: from$146.token.lineStart,
                range: from$146.token.range
            }, to$147.context);
        }
    }
    function loadPattern$118(patterns$149) {
        return _$100.chain(patterns$149).reduce(function (acc$150, patStx$151, idx$152) {
            var last$153 = patterns$149[idx$152 - 1];
            var lastLast$154 = patterns$149[idx$152 - 2];
            var next$155 = patterns$149[idx$152 + 1];
            var nextNext$156 = patterns$149[idx$152 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$151.token.value === ':') {
                if (last$153 && isPatternVar$114(last$153) && !isPatternVar$114(next$155)) {
                    return acc$150;
                }
            }
            if (last$153 && last$153.token.value === ':') {
                if (lastLast$154 && isPatternVar$114(lastLast$154) && !isPatternVar$114(patStx$151)) {
                    return acc$150;
                }
            }
            // skip over $
            if (patStx$151.token.value === '$' && next$155 && next$155.token.type === parser$102.Token.Delimiter) {
                return acc$150;
            }
            if (isPatternVar$114(patStx$151)) {
                if (next$155 && next$155.token.value === ':' && !isPatternVar$114(nextNext$156)) {
                    if (typeof nextNext$156 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$151.class = nextNext$156.token.value;
                } else {
                    patStx$151.class = 'token';
                }
            } else if (patStx$151.token.type === parser$102.Token.Delimiter) {
                if (last$153 && last$153.token.value === '$') {
                    patStx$151.class = 'pattern_group';
                }
                patStx$151.token.inner = loadPattern$118(patStx$151.token.inner);
            } else {
                patStx$151.class = 'pattern_literal';
            }
            return acc$150.concat(patStx$151);
        }, []).reduce(function (acc$157, patStx$158, idx$159, patterns$160) {
            var separator$161 = ' ';
            var repeat$162 = false;
            var next$163 = patterns$160[idx$159 + 1];
            var nextNext$164 = patterns$160[idx$159 + 2];
            if (next$163 && next$163.token.value === '...') {
                repeat$162 = true;
                separator$161 = ' ';
            } else if (delimIsSeparator$113(next$163) && nextNext$164 && nextNext$164.token.value === '...') {
                repeat$162 = true;
                parser$102.assert(next$163.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$161 = next$163.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$158.token.value === '...' || delimIsSeparator$113(patStx$158) && next$163 && next$163.token.value === '...') {
                return acc$157;
            }
            patStx$158.repeat = repeat$162;
            patStx$158.separator = separator$161;
            return acc$157.concat(patStx$158);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$119(patternClass$165, stx$166, env$167) {
        var result$168, rest$169;
        // pattern has no parse class
        if (patternClass$165 === 'token' && stx$166[0] && stx$166[0].token.type !== parser$102.Token.EOF) {
            result$168 = [stx$166[0]];
            rest$169 = stx$166.slice(1);
        } else if (patternClass$165 === 'lit' && stx$166[0] && typeIsLiteral$111(stx$166[0].token.type)) {
            result$168 = [stx$166[0]];
            rest$169 = stx$166.slice(1);
        } else if (patternClass$165 === 'ident' && stx$166[0] && stx$166[0].token.type === parser$102.Token.Identifier) {
            result$168 = [stx$166[0]];
            rest$169 = stx$166.slice(1);
        } else if (stx$166.length > 0 && patternClass$165 === 'VariableStatement') {
            var match$170 = expander$103.enforest(stx$166, env$167);
            if (match$170.result && match$170.result.hasPrototype(expander$103.VariableStatement)) {
                result$168 = match$170.result.destruct(false);
                rest$169 = match$170.rest;
            } else {
                result$168 = null;
                rest$169 = stx$166;
            }
        } else if (stx$166.length > 0 && patternClass$165 === 'expr') {
            var match$170 = expander$103.get_expression(stx$166, env$167);
            if (match$170.result === null || !match$170.result.hasPrototype(expander$103.Expr)) {
                result$168 = null;
                rest$169 = stx$166;
            } else {
                result$168 = match$170.result.destruct(false);
                rest$169 = match$170.rest;
            }
        } else {
            result$168 = null;
            rest$169 = stx$166;
        }
        return {
            result: result$168,
            rest: rest$169
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$120(patterns$171, stx$172, env$173, topLevel$174) {
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
        topLevel$174 = topLevel$174 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$175 = [];
        var patternEnv$176 = {};
        var match$177;
        var pattern$178;
        var rest$179 = stx$172;
        var success$180 = true;
        for (var i$181 = 0; i$181 < patterns$171.length; i$181++) {
            pattern$178 = patterns$171[i$181];
            do {
                match$177 = matchPattern$121(pattern$178, rest$179, env$173, patternEnv$176);
                if (!match$177.success && pattern$178.repeat) {
                    // a repeat can match zero tokens and still be a
                    // "success" so break out of the inner loop and
                    // try the next pattern
                    rest$179 = match$177.rest;
                    patternEnv$176 = match$177.patternEnv;
                    break;
                }
                if (!match$177.success) {
                    success$180 = false;
                    break;
                }
                rest$179 = match$177.rest;
                patternEnv$176 = match$177.patternEnv;
                if (pattern$178.repeat && success$180) {
                    if (rest$179[0] && rest$179[0].token.value === pattern$178.separator) {
                        // more tokens and the next token matches the separator
                        rest$179 = rest$179.slice(1);
                    } else if (pattern$178.separator === ' ') {
                        // no separator specified (using the empty string for this)
                        // so keep going
                        continue;
                    } else if (pattern$178.separator !== ' ' && rest$179.length > 0 && i$181 === patterns$171.length - 1 && topLevel$174 === false) {
                        // separator is specified, there is a next token, the
                        // next token doesn't match the separator, there are
                        // no more patterns, and this is a top level pattern
                        // so the match has failed
                        success$180 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$178.repeat && match$177.success && rest$179.length > 0);
        }
        return {
            success: success$180,
            rest: rest$179,
            patternEnv: patternEnv$176
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
    function matchPattern$121(pattern$182, stx$183, env$184, patternEnv$185) {
        var subMatch$186;
        var match$187, matchEnv$188;
        var rest$189;
        var success$190;
        if (typeof pattern$182.inner !== 'undefined') {
            if (pattern$182.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$186 = matchPatterns$120(pattern$182.inner, stx$183, env$184, false);
                rest$189 = subMatch$186.rest;
            } else if (stx$183[0] && stx$183[0].token.type === parser$102.Token.Delimiter && stx$183[0].token.value === pattern$182.value) {
                stx$183[0].expose();
                if (pattern$182.inner.length === 0 && stx$183[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$183,
                        patternEnv: patternEnv$185
                    };
                }
                subMatch$186 = matchPatterns$120(pattern$182.inner, stx$183[0].token.inner, env$184, false);
                rest$189 = stx$183.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$183,
                    patternEnv: patternEnv$185
                };
            }
            success$190 = subMatch$186.success;
            // merge the subpattern matches with the current pattern environment
            _$100.keys(subMatch$186.patternEnv).forEach(function (patternKey$191) {
                if (pattern$182.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$192 = subMatch$186.patternEnv[patternKey$191].level + 1;
                    if (patternEnv$185[patternKey$191]) {
                        patternEnv$185[patternKey$191].level = nextLevel$192;
                        patternEnv$185[patternKey$191].match.push(subMatch$186.patternEnv[patternKey$191]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$185[patternKey$191] = {
                            level: nextLevel$192,
                            match: [subMatch$186.patternEnv[patternKey$191]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$185[patternKey$191] = subMatch$186.patternEnv[patternKey$191];
                }
            });
        } else {
            if (pattern$182.class === 'pattern_literal') {
                // wildcard
                if (stx$183[0] && pattern$182.value === '_') {
                    success$190 = true;
                    rest$189 = stx$183.slice(1);
                } else if (stx$183[0] && pattern$182.value === stx$183[0].token.value) {
                    success$190 = true;
                    rest$189 = stx$183.slice(1);
                } else {
                    success$190 = false;
                    rest$189 = stx$183;
                }
            } else {
                match$187 = matchPatternClass$119(pattern$182.class, stx$183, env$184);
                success$190 = match$187.result !== null;
                rest$189 = match$187.rest;
                matchEnv$188 = {
                    level: 0,
                    match: match$187.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$182.repeat) {
                    if (patternEnv$185[pattern$182.value]) {
                        patternEnv$185[pattern$182.value].match.push(matchEnv$188);
                    } else {
                        // initialize if necessary
                        patternEnv$185[pattern$182.value] = {
                            level: 1,
                            match: [matchEnv$188]
                        };
                    }
                } else {
                    patternEnv$185[pattern$182.value] = matchEnv$188;
                }
            }
        }
        return {
            success: success$190,
            rest: rest$189,
            patternEnv: patternEnv$185
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$122(macroBody$193, macroNameStx$194, env$195) {
        return _$100.chain(macroBody$193).reduce(function (acc$196, bodyStx$197, idx$198, original$199) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$200 = original$199[idx$198 - 1];
            var next$201 = original$199[idx$198 + 1];
            var nextNext$202 = original$199[idx$198 + 2];
            // drop `...`
            if (bodyStx$197.token.value === '...') {
                return acc$196;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$113(bodyStx$197) && next$201 && next$201.token.value === '...') {
                return acc$196;
            }
            // skip the $ in $(...)
            if (bodyStx$197.token.value === '$' && next$201 && next$201.token.type === parser$102.Token.Delimiter && next$201.token.value === '()') {
                return acc$196;
            }
            // mark $[...] as a literal
            if (bodyStx$197.token.value === '$' && next$201 && next$201.token.type === parser$102.Token.Delimiter && next$201.token.value === '[]') {
                next$201.literal = true;
                return acc$196;
            }
            if (bodyStx$197.token.type === parser$102.Token.Delimiter && bodyStx$197.token.value === '()' && last$200 && last$200.token.value === '$') {
                bodyStx$197.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$197.literal === true) {
                parser$102.assert(bodyStx$197.token.type === parser$102.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$196.concat(bodyStx$197.token.inner);
            }
            if (next$201 && next$201.token.value === '...') {
                bodyStx$197.repeat = true;
                bodyStx$197.separator = ' ';
            } else if (delimIsSeparator$113(next$201) && nextNext$202 && nextNext$202.token.value === '...') {
                bodyStx$197.repeat = true;
                bodyStx$197.separator = next$201.token.inner[0].token.value;
            }
            return acc$196.concat(bodyStx$197);
        }, []).reduce(function (acc$203, bodyStx$204, idx$205) {
            // then do the actual transcription
            if (bodyStx$204.repeat) {
                if (bodyStx$204.token.type === parser$102.Token.Delimiter) {
                    bodyStx$204.expose();
                    var fv$206 = _$100.filter(freeVarsInPattern$110(bodyStx$204.token.inner), function (pat$213) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$195.hasOwnProperty(pat$213);
                        });
                    var restrictedEnv$207 = [];
                    var nonScalar$208 = _$100.find(fv$206, function (pat$214) {
                            return env$195[pat$214].level > 0;
                        });
                    parser$102.assert(typeof nonScalar$208 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$209 = env$195[nonScalar$208].match.length;
                    var sameLength$210 = _$100.all(fv$206, function (pat$215) {
                            return env$195[pat$215].level === 0 || env$195[pat$215].match.length === repeatLength$209;
                        });
                    parser$102.assert(sameLength$210, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$207 = _$100.map(_$100.range(repeatLength$209), function (idx$216) {
                        var renv$217 = {};
                        _$100.each(fv$206, function (pat$218) {
                            if (env$195[pat$218].level === 0) {
                                // copy scalars over
                                renv$217[pat$218] = env$195[pat$218];
                            } else {
                                // grab the match at this index
                                renv$217[pat$218] = env$195[pat$218].match[idx$216];
                            }
                        });
                        return renv$217;
                    });
                    var transcribed$211 = _$100.map(restrictedEnv$207, function (renv$219) {
                            if (bodyStx$204.group) {
                                return transcribe$122(bodyStx$204.token.inner, macroNameStx$194, renv$219);
                            } else {
                                var newBody$220 = syntaxFromToken$106(_$100.clone(bodyStx$204.token), bodyStx$204.context);
                                newBody$220.token.inner = transcribe$122(bodyStx$204.token.inner, macroNameStx$194, renv$219);
                                return newBody$220;
                            }
                        });
                    var joined$212;
                    if (bodyStx$204.group) {
                        joined$212 = joinSyntaxArr$109(transcribed$211, bodyStx$204.separator);
                    } else {
                        joined$212 = joinSyntax$108(transcribed$211, bodyStx$204.separator);
                    }
                    return acc$203.concat(joined$212);
                }
                if (!env$195[bodyStx$204.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$204.token.value + ' is not bound for the template');
                } else if (env$195[bodyStx$204.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$204.token.value + ' does not match in the template');
                }
                return acc$203.concat(joinRepeatedMatch$115(env$195[bodyStx$204.token.value].match, bodyStx$204.separator));
            } else {
                if (bodyStx$204.token.type === parser$102.Token.Delimiter) {
                    bodyStx$204.expose();
                    var newBody$221 = syntaxFromToken$106(_$100.clone(bodyStx$204.token), macroBody$193.context);
                    newBody$221.token.inner = transcribe$122(bodyStx$204.token.inner, macroNameStx$194, env$195);
                    return acc$203.concat(takeLineContext$116(macroNameStx$194, [newBody$221]));
                }
                if (isPatternVar$114(bodyStx$204) && Object.prototype.hasOwnProperty.bind(env$195)(bodyStx$204.token.value)) {
                    if (!env$195[bodyStx$204.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$204.token.value + ' is not bound for the template');
                    } else if (env$195[bodyStx$204.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$204.token.value + ' does not match in the template');
                    }
                    return acc$203.concat(takeLineContext$116(macroNameStx$194, env$195[bodyStx$204.token.value].match));
                }
                return acc$203.concat(takeLineContext$116(macroNameStx$194, [bodyStx$204]));
            }
        }, []).value();
    }
    exports$99.loadPattern = loadPattern$118;
    exports$99.matchPatterns = matchPatterns$120;
    exports$99.transcribe = transcribe$122;
    exports$99.matchPatternClass = matchPatternClass$119;
    exports$99.takeLineContext = takeLineContext$116;
    exports$99.takeLine = takeLine$117;
}));