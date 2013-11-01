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
    var makePunc$107 = syntax$104.makePunc;
    var joinSyntax$108 = syntax$104.joinSyntax;
    var joinSyntaxArr$109 = syntax$104.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$110(pattern$123) {
        var fv$124 = [];
        _$100.each(pattern$123, function (pat$125) {
            if (isPatternVar$114(pat$125)) {
                fv$124.push(pat$125.token.value);
            } else if (pat$125.token.type === parser$102.Token.Delimiter) {
                fv$124 = fv$124.concat(freeVarsInPattern$110(pat$125.token.inner));
            }
        });
        return fv$124;
    }
    function typeIsLiteral$111(type$126) {
        return type$126 === parser$102.Token.NullLiteral || type$126 === parser$102.Token.NumericLiteral || type$126 === parser$102.Token.StringLiteral || type$126 === parser$102.Token.RegexLiteral || type$126 === parser$102.Token.BooleanLiteral;
    }
    function containsPatternVar$112(patterns$127) {
        return _$100.any(patterns$127, function (pat$128) {
            if (pat$128.token.type === parser$102.Token.Delimiter) {
                return containsPatternVar$112(pat$128.token.inner);
            }
            return isPatternVar$114(pat$128);
        });
    }
    function delimIsSeparator$113(delim$129) {
        return delim$129 && delim$129.token && delim$129.token.type === parser$102.Token.Delimiter && delim$129.token.value === '()' && delim$129.token.inner.length === 1 && delim$129.token.inner[0].token.type !== parser$102.Token.Delimiter && !containsPatternVar$112(delim$129.token.inner);
    }
    function isPatternVar$114(stx$130) {
        return stx$130.token.value[0] === '$' && stx$130.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$115(tojoin$131, punc$132) {
        return _$100.reduce(_$100.rest(tojoin$131, 1), function (acc$133, join$134) {
            if (punc$132 === ' ') {
                return acc$133.concat(join$134.match);
            }
            return acc$133.concat(makePunc$107(punc$132, _$100.first(join$134.match)), join$134.match);
        }, _$100.first(tojoin$131).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$116(from$135, to$136) {
        return _$100.map(to$136, function (stx$137) {
            return takeLine$117(from$135, stx$137);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$117(from$138, to$139) {
        if (to$139.token.type === parser$102.Token.Delimiter) {
            var next$140;
            if (from$138.token.type === parser$102.Token.Delimiter) {
                next$140 = syntaxFromToken$106({
                    type: parser$102.Token.Delimiter,
                    value: to$139.token.value,
                    inner: to$139.token.inner,
                    startRange: from$138.token.startRange,
                    endRange: from$138.token.endRange,
                    startLineNumber: from$138.token.startLineNumber,
                    startLineStart: from$138.token.startLineStart,
                    endLineNumber: from$138.token.endLineNumber,
                    endLineStart: from$138.token.endLineStart
                }, to$139);
            } else {
                next$140 = syntaxFromToken$106({
                    type: parser$102.Token.Delimiter,
                    value: to$139.token.value,
                    inner: to$139.token.inner,
                    startRange: from$138.token.range,
                    endRange: from$138.token.range,
                    startLineNumber: from$138.token.lineNumber,
                    startLineStart: from$138.token.lineStart,
                    endLineNumber: from$138.token.lineNumber,
                    endLineStart: from$138.token.lineStart
                }, to$139);
            }
        } else {
            if (from$138.token.type === parser$102.Token.Delimiter) {
                next$140 = syntaxFromToken$106({
                    value: to$139.token.value,
                    type: to$139.token.type,
                    lineNumber: from$138.token.startLineNumber,
                    lineStart: from$138.token.startLineStart,
                    range: from$138.token.startRange
                }, to$139);
            } else {
                next$140 = syntaxFromToken$106({
                    value: to$139.token.value,
                    type: to$139.token.type,
                    lineNumber: from$138.token.lineNumber,
                    lineStart: from$138.token.lineStart,
                    range: from$138.token.range
                }, to$139);
            }
        }
        if (to$139.token.leadingComments) {
            next$140.token.leadingComments = to$139.token.leadingComments;
        }
        if (to$139.token.trailingComments) {
            next$140.token.trailingComments = to$139.token.trailingComments;
        }
        return next$140;
    }
    function loadPattern$118(patterns$141) {
        return _$100.chain(patterns$141).reduce(function (acc$142, patStx$143, idx$144) {
            var last$145 = patterns$141[idx$144 - 1];
            var lastLast$146 = patterns$141[idx$144 - 2];
            var next$147 = patterns$141[idx$144 + 1];
            var nextNext$148 = patterns$141[idx$144 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$143.token.value === ':') {
                if (last$145 && isPatternVar$114(last$145) && !isPatternVar$114(next$147)) {
                    return acc$142;
                }
            }
            if (last$145 && last$145.token.value === ':') {
                if (lastLast$146 && isPatternVar$114(lastLast$146) && !isPatternVar$114(patStx$143)) {
                    return acc$142;
                }
            }
            // skip over $
            if (patStx$143.token.value === '$' && next$147 && next$147.token.type === parser$102.Token.Delimiter) {
                return acc$142;
            }
            if (isPatternVar$114(patStx$143)) {
                if (next$147 && next$147.token.value === ':' && !isPatternVar$114(nextNext$148)) {
                    if (typeof nextNext$148 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$143.class = nextNext$148.token.value;
                } else {
                    patStx$143.class = 'token';
                }
            } else if (patStx$143.token.type === parser$102.Token.Delimiter) {
                if (last$145 && last$145.token.value === '$') {
                    patStx$143.class = 'pattern_group';
                }
                patStx$143.token.inner = loadPattern$118(patStx$143.token.inner);
            } else {
                patStx$143.class = 'pattern_literal';
            }
            return acc$142.concat(patStx$143);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$149, patStx$150, idx$151, patterns$152) {
            var separator$153 = ' ';
            var repeat$154 = false;
            var next$155 = patterns$152[idx$151 + 1];
            var nextNext$156 = patterns$152[idx$151 + 2];
            if (next$155 && next$155.token.value === '...') {
                repeat$154 = true;
                separator$153 = ' ';
            } else if (delimIsSeparator$113(next$155) && nextNext$156 && nextNext$156.token.value === '...') {
                repeat$154 = true;
                parser$102.assert(next$155.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$153 = next$155.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$150.token.value === '...' || delimIsSeparator$113(patStx$150) && next$155 && next$155.token.value === '...') {
                return acc$149;
            }
            patStx$150.repeat = repeat$154;
            patStx$150.separator = separator$153;
            return acc$149.concat(patStx$150);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$119(patternClass$157, stx$158, env$159) {
        var result$160, rest$161;
        // pattern has no parse class
        if (patternClass$157 === 'token' && stx$158[0] && stx$158[0].token.type !== parser$102.Token.EOF) {
            result$160 = [stx$158[0]];
            rest$161 = stx$158.slice(1);
        } else if (patternClass$157 === 'lit' && stx$158[0] && typeIsLiteral$111(stx$158[0].token.type)) {
            result$160 = [stx$158[0]];
            rest$161 = stx$158.slice(1);
        } else if (patternClass$157 === 'ident' && stx$158[0] && stx$158[0].token.type === parser$102.Token.Identifier) {
            result$160 = [stx$158[0]];
            rest$161 = stx$158.slice(1);
        } else if (stx$158.length > 0 && patternClass$157 === 'VariableStatement') {
            var match$162 = expander$103.enforest(stx$158, env$159);
            if (match$162.result && match$162.result.hasPrototype(expander$103.VariableStatement)) {
                result$160 = match$162.result.destruct(false);
                rest$161 = match$162.rest;
            } else {
                result$160 = null;
                rest$161 = stx$158;
            }
        } else if (stx$158.length > 0 && patternClass$157 === 'expr') {
            var match$162 = expander$103.get_expression(stx$158, env$159);
            if (match$162.result === null || !match$162.result.hasPrototype(expander$103.Expr)) {
                result$160 = null;
                rest$161 = stx$158;
            } else {
                result$160 = match$162.result.destruct(false);
                rest$161 = match$162.rest;
            }
        } else {
            result$160 = null;
            rest$161 = stx$158;
        }
        return {
            result: result$160,
            rest: rest$161
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$120(patterns$163, stx$164, env$165, topLevel$166) {
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
        topLevel$166 = topLevel$166 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$167 = [];
        var patternEnv$168 = {};
        var match$169;
        var pattern$170;
        var rest$171 = stx$164;
        var success$172 = true;
        for (var i$173 = 0; i$173 < patterns$163.length; i$173++) {
            if (success$172 === false) {
                break;
            }
            pattern$170 = patterns$163[i$173];
            do {
                match$169 = matchPattern$121(pattern$170, rest$171, env$165, patternEnv$168);
                if (!match$169.success && pattern$170.repeat) {
                    // a repeat can match zero tokens and still be a
                    // "success" so break out of the inner loop and
                    // try the next pattern
                    break;
                }
                if (!match$169.success) {
                    success$172 = false;
                    break;
                }
                rest$171 = match$169.rest;
                patternEnv$168 = match$169.patternEnv;
                if (success$172 && !(topLevel$166 || pattern$170.repeat)) {
                    // the very last pattern matched, inside a
                    // delimiter, not a repeat, *and* there are more
                    // unmatched bits of syntax
                    if (i$173 == patterns$163.length - 1 && rest$171.length !== 0) {
                        success$172 = false;
                        break;
                    }
                }
                if (pattern$170.repeat && success$172) {
                    if (rest$171[0] && rest$171[0].token.value === pattern$170.separator) {
                        // more tokens and the next token matches the separator
                        rest$171 = rest$171.slice(1);
                    } else if (pattern$170.separator === ' ') {
                        // no separator specified (using the empty string for this)
                        // so keep going
                        continue;
                    } else if (pattern$170.separator !== ' ' && rest$171.length > 0 && i$173 === patterns$163.length - 1 && topLevel$166 === false) {
                        // separator is specified, there is a next token, the
                        // next token doesn't match the separator, there are
                        // no more patterns, and this is a top level pattern
                        // so the match has failed
                        success$172 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$170.repeat && success$172 && rest$171.length > 0);
        }
        return {
            success: success$172,
            rest: rest$171,
            patternEnv: patternEnv$168
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
    function matchPattern$121(pattern$174, stx$175, env$176, patternEnv$177) {
        var subMatch$178;
        var match$179, matchEnv$180;
        var rest$181;
        var success$182;
        if (typeof pattern$174.inner !== 'undefined') {
            if (pattern$174.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$178 = matchPatterns$120(pattern$174.inner, stx$175, env$176, true);
                rest$181 = subMatch$178.rest;
            } else if (stx$175[0] && stx$175[0].token.type === parser$102.Token.Delimiter && stx$175[0].token.value === pattern$174.value) {
                stx$175[0].expose();
                if (pattern$174.inner.length === 0 && stx$175[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$175,
                        patternEnv: patternEnv$177
                    };
                }
                subMatch$178 = matchPatterns$120(pattern$174.inner, stx$175[0].token.inner, env$176, false);
                rest$181 = stx$175.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$175,
                    patternEnv: patternEnv$177
                };
            }
            success$182 = subMatch$178.success;
            // merge the subpattern matches with the current pattern environment
            _$100.keys(subMatch$178.patternEnv).forEach(function (patternKey$183) {
                if (pattern$174.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$184 = subMatch$178.patternEnv[patternKey$183].level + 1;
                    if (patternEnv$177[patternKey$183]) {
                        patternEnv$177[patternKey$183].level = nextLevel$184;
                        patternEnv$177[patternKey$183].match.push(subMatch$178.patternEnv[patternKey$183]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$177[patternKey$183] = {
                            level: nextLevel$184,
                            match: [subMatch$178.patternEnv[patternKey$183]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$177[patternKey$183] = subMatch$178.patternEnv[patternKey$183];
                }
            });
        } else {
            if (pattern$174.class === 'pattern_literal') {
                // wildcard
                if (stx$175[0] && pattern$174.value === '_') {
                    success$182 = true;
                    rest$181 = stx$175.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$175[0] && pattern$174.value === stx$175[0].token.value) {
                    success$182 = true;
                    rest$181 = stx$175.slice(1);
                } else {
                    success$182 = false;
                    rest$181 = stx$175;
                }
            } else {
                match$179 = matchPatternClass$119(pattern$174.class, stx$175, env$176);
                success$182 = match$179.result !== null;
                rest$181 = match$179.rest;
                matchEnv$180 = {
                    level: 0,
                    match: match$179.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$174.repeat) {
                    if (patternEnv$177[pattern$174.value]) {
                        patternEnv$177[pattern$174.value].match.push(matchEnv$180);
                    } else {
                        // initialize if necessary
                        patternEnv$177[pattern$174.value] = {
                            level: 1,
                            match: [matchEnv$180]
                        };
                    }
                } else {
                    patternEnv$177[pattern$174.value] = matchEnv$180;
                }
            }
        }
        return {
            success: success$182,
            rest: rest$181,
            patternEnv: patternEnv$177
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$122(macroBody$185, macroNameStx$186, env$187) {
        return _$100.chain(macroBody$185).reduce(function (acc$188, bodyStx$189, idx$190, original$191) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$192 = original$191[idx$190 - 1];
            var next$193 = original$191[idx$190 + 1];
            var nextNext$194 = original$191[idx$190 + 2];
            // drop `...`
            if (bodyStx$189.token.value === '...') {
                return acc$188;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$113(bodyStx$189) && next$193 && next$193.token.value === '...') {
                return acc$188;
            }
            // skip the $ in $(...)
            if (bodyStx$189.token.value === '$' && next$193 && next$193.token.type === parser$102.Token.Delimiter && next$193.token.value === '()') {
                return acc$188;
            }
            // mark $[...] as a literal
            if (bodyStx$189.token.value === '$' && next$193 && next$193.token.type === parser$102.Token.Delimiter && next$193.token.value === '[]') {
                next$193.literal = true;
                return acc$188;
            }
            if (bodyStx$189.token.type === parser$102.Token.Delimiter && bodyStx$189.token.value === '()' && last$192 && last$192.token.value === '$') {
                bodyStx$189.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$189.literal === true) {
                parser$102.assert(bodyStx$189.token.type === parser$102.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$188.concat(bodyStx$189.token.inner);
            }
            if (next$193 && next$193.token.value === '...') {
                bodyStx$189.repeat = true;
                bodyStx$189.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$113(next$193) && nextNext$194 && nextNext$194.token.value === '...') {
                bodyStx$189.repeat = true;
                bodyStx$189.separator = next$193.token.inner[0].token.value;
            }
            return acc$188.concat(bodyStx$189);
        }, []).reduce(function (acc$195, bodyStx$196, idx$197) {
            // then do the actual transcription
            if (bodyStx$196.repeat) {
                if (bodyStx$196.token.type === parser$102.Token.Delimiter) {
                    bodyStx$196.expose();
                    var fv$198 = _$100.filter(freeVarsInPattern$110(bodyStx$196.token.inner), function (pat$205) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$187.hasOwnProperty(pat$205);
                        });
                    var restrictedEnv$199 = [];
                    var nonScalar$200 = _$100.find(fv$198, function (pat$206) {
                            return env$187[pat$206].level > 0;
                        });
                    parser$102.assert(typeof nonScalar$200 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$201 = env$187[nonScalar$200].match.length;
                    var sameLength$202 = _$100.all(fv$198, function (pat$207) {
                            return env$187[pat$207].level === 0 || env$187[pat$207].match.length === repeatLength$201;
                        });
                    parser$102.assert(sameLength$202, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$199 = _$100.map(_$100.range(repeatLength$201), function (idx$208) {
                        var renv$209 = {};
                        _$100.each(fv$198, function (pat$210) {
                            if (env$187[pat$210].level === 0) {
                                // copy scalars over
                                renv$209[pat$210] = env$187[pat$210];
                            } else {
                                // grab the match at this index
                                renv$209[pat$210] = env$187[pat$210].match[idx$208];
                            }
                        });
                        return renv$209;
                    });
                    var transcribed$203 = _$100.map(restrictedEnv$199, function (renv$211) {
                            if (bodyStx$196.group) {
                                return transcribe$122(bodyStx$196.token.inner, macroNameStx$186, renv$211);
                            } else {
                                var newBody$212 = syntaxFromToken$106(_$100.clone(bodyStx$196.token), bodyStx$196);
                                newBody$212.token.inner = transcribe$122(bodyStx$196.token.inner, macroNameStx$186, renv$211);
                                return newBody$212;
                            }
                        });
                    var joined$204;
                    if (bodyStx$196.group) {
                        joined$204 = joinSyntaxArr$109(transcribed$203, bodyStx$196.separator);
                    } else {
                        joined$204 = joinSyntax$108(transcribed$203, bodyStx$196.separator);
                    }
                    return acc$195.concat(joined$204);
                }
                if (!env$187[bodyStx$196.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$196.token.value + ' is not bound for the template');
                } else if (env$187[bodyStx$196.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$196.token.value + ' does not match in the template');
                }
                return acc$195.concat(joinRepeatedMatch$115(env$187[bodyStx$196.token.value].match, bodyStx$196.separator));
            } else {
                if (bodyStx$196.token.type === parser$102.Token.Delimiter) {
                    bodyStx$196.expose();
                    var newBody$213 = syntaxFromToken$106(_$100.clone(bodyStx$196.token), macroBody$185);
                    newBody$213.token.inner = transcribe$122(bodyStx$196.token.inner, macroNameStx$186, env$187);
                    return acc$195.concat(takeLineContext$116(macroNameStx$186, [newBody$213]));
                }
                if (isPatternVar$114(bodyStx$196) && Object.prototype.hasOwnProperty.bind(env$187)(bodyStx$196.token.value)) {
                    if (!env$187[bodyStx$196.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$196.token.value + ' is not bound for the template');
                    } else if (env$187[bodyStx$196.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$196.token.value + ' does not match in the template');
                    }
                    return acc$195.concat(takeLineContext$116(macroNameStx$186, env$187[bodyStx$196.token.value].match));
                }
                return acc$195.concat(takeLineContext$116(macroNameStx$186, [bodyStx$196]));
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