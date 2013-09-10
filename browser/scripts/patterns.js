(function (root$91, factory$92) {
    if (typeof exports === 'object') {
        factory$92(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$92);
    }
}(this, function (exports$93, _$94, es6$95, parser$96, expander$97, syntax$98) {
    var get_expression$99 = expander$97.get_expression;
    var syntaxFromToken$100 = syntax$98.syntaxFromToken;
    var mkSyntax$101 = syntax$98.mkSyntax;
    function joinSyntax$102(tojoin$117, punc$118) {
        if (tojoin$117.length === 0) {
            return [];
        }
        if (punc$118 === ' ') {
            return tojoin$117;
        }
        return _$94.reduce(_$94.rest(tojoin$117, 1), function (acc$119, join$120) {
            return acc$119.concat(mkSyntax$101(punc$118, parser$96.Token.Punctuator, join$120), join$120);
        }, [_$94.first(tojoin$117)]);
    }
    function joinSyntaxArr$103(tojoin$121, punc$122) {
        if (tojoin$121.length === 0) {
            return [];
        }
        if (punc$122 === ' ') {
            return _$94.flatten(tojoin$121, true);
        }
        return _$94.reduce(_$94.rest(tojoin$121, 1), function (acc$123, join$124) {
            return acc$123.concat(mkSyntax$101(punc$122, parser$96.Token.Punctuator, _$94.first(join$124)), join$124);
        }, _$94.first(tojoin$121));
    }
    function freeVarsInPattern$104(pattern$125) {
        var fv$126 = [];
        _$94.each(pattern$125, function (pat$127) {
            if (isPatternVar$108(pat$127)) {
                fv$126.push(pat$127.token.value);
            } else if (pat$127.token.type === parser$96.Token.Delimiter) {
                fv$126 = fv$126.concat(freeVarsInPattern$104(pat$127.token.inner));
            }
        });
        return fv$126;
    }
    function typeIsLiteral$105(type$128) {
        return type$128 === parser$96.Token.NullLiteral || type$128 === parser$96.Token.NumericLiteral || type$128 === parser$96.Token.StringLiteral || type$128 === parser$96.Token.RegexLiteral || type$128 === parser$96.Token.BooleanLiteral;
    }
    function containsPatternVar$106(patterns$129) {
        return _$94.any(patterns$129, function (pat$130) {
            if (pat$130.token.type === parser$96.Token.Delimiter) {
                return containsPatternVar$106(pat$130.token.inner);
            }
            return isPatternVar$108(pat$130);
        });
    }
    function delimIsSeparator$107(delim$131) {
        return delim$131 && delim$131.token && delim$131.token.type === parser$96.Token.Delimiter && delim$131.token.value === '()' && delim$131.token.inner.length === 1 && delim$131.token.inner[0].token.type !== parser$96.Token.Delimiter && !containsPatternVar$106(delim$131.token.inner);
    }
    function isPatternVar$108(stx$132) {
        return stx$132.token.value[0] === '$' && stx$132.token.value !== '$';
    }
    function joinRepeatedMatch$109(tojoin$133, punc$134) {
        return _$94.reduce(_$94.rest(tojoin$133, 1), function (acc$135, join$136) {
            if (punc$134 === ' ') {
                return acc$135.concat(join$136.match);
            }
            return acc$135.concat(mkSyntax$101(punc$134, parser$96.Token.Punctuator, _$94.first(join$136.match)), join$136.match);
        }, _$94.first(tojoin$133).match);
    }
    function takeLineContext$110(from$137, to$138) {
        return _$94.map(to$138, function (stx$139) {
            return takeLine$111(from$137, stx$139);
        });
    }
    function takeLine$111(from$140, to$141) {
        if (to$141.token.type === parser$96.Token.Delimiter) {
            var next$142 = syntaxFromToken$100({
                    type: parser$96.Token.Delimiter,
                    value: to$141.token.value,
                    inner: to$141.token.inner,
                    startRange: from$140.range,
                    endRange: from$140.range,
                    startLineNumber: from$140.token.lineNumber,
                    startLineStart: from$140.token.lineStart,
                    endLineNumber: from$140.token.lineNumber,
                    endLineStart: from$140.token.lineStart
                }, to$141.context);
            next$142.deferredContext = to$141.deferredContext;
            return next$142;
        }
        return syntaxFromToken$100({
            value: to$141.token.value,
            type: to$141.token.type,
            lineNumber: from$140.token.lineNumber,
            lineStart: from$140.token.lineStart,
            range: from$140.token.range
        }, to$141.context);
    }
    function loadPattern$112(patterns$143) {
        return _$94.chain(patterns$143).reduce(function (acc$144, patStx$145, idx$146) {
            var last$147 = patterns$143[idx$146 - 1];
            var lastLast$148 = patterns$143[idx$146 - 2];
            var next$149 = patterns$143[idx$146 + 1];
            var nextNext$150 = patterns$143[idx$146 + 2];
            if (patStx$145.token.value === ':') {
                if (last$147 && isPatternVar$108(last$147) && !isPatternVar$108(next$149)) {
                    return acc$144;
                }
            }
            if (last$147 && last$147.token.value === ':') {
                if (lastLast$148 && isPatternVar$108(lastLast$148) && !isPatternVar$108(patStx$145)) {
                    return acc$144;
                }
            }
            if (patStx$145.token.value === '$' && next$149 && next$149.token.type === parser$96.Token.Delimiter) {
                return acc$144;
            }
            if (isPatternVar$108(patStx$145)) {
                if (next$149 && next$149.token.value === ':' && !isPatternVar$108(nextNext$150)) {
                    if (typeof nextNext$150 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$145.class = nextNext$150.token.value;
                } else {
                    patStx$145.class = 'token';
                }
            } else if (patStx$145.token.type === parser$96.Token.Delimiter) {
                if (last$147 && last$147.token.value === '$') {
                    patStx$145.class = 'pattern_group';
                }
                patStx$145.token.inner = loadPattern$112(patStx$145.token.inner);
            } else {
                patStx$145.class = 'pattern_literal';
            }
            return acc$144.concat(patStx$145);
        }, []).reduce(function (acc$151, patStx$152, idx$153, patterns$154) {
            var separator$155 = ' ';
            var repeat$156 = false;
            var next$157 = patterns$154[idx$153 + 1];
            var nextNext$158 = patterns$154[idx$153 + 2];
            if (next$157 && next$157.token.value === '...') {
                repeat$156 = true;
                separator$155 = ' ';
            } else if (delimIsSeparator$107(next$157) && nextNext$158 && nextNext$158.token.value === '...') {
                repeat$156 = true;
                parser$96.assert(next$157.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$155 = next$157.token.inner[0].token.value;
            }
            if (patStx$152.token.value === '...' || delimIsSeparator$107(patStx$152) && next$157 && next$157.token.value === '...') {
                return acc$151;
            }
            patStx$152.repeat = repeat$156;
            patStx$152.separator = separator$155;
            return acc$151.concat(patStx$152);
        }, []).value();
    }
    function matchPatternClass$113(patternClass$159, stx$160, env$161) {
        var result$162, rest$163;
        if (patternClass$159 === 'token' && stx$160[0] && stx$160[0].token.type !== parser$96.Token.EOF) {
            result$162 = [stx$160[0]];
            rest$163 = stx$160.slice(1);
        } else if (patternClass$159 === 'lit' && stx$160[0] && typeIsLiteral$105(stx$160[0].token.type)) {
            result$162 = [stx$160[0]];
            rest$163 = stx$160.slice(1);
        } else if (patternClass$159 === 'ident' && stx$160[0] && stx$160[0].token.type === parser$96.Token.Identifier) {
            result$162 = [stx$160[0]];
            rest$163 = stx$160.slice(1);
        } else if (stx$160.length > 0 && patternClass$159 === 'VariableStatement') {
            var match$164 = expander$97.enforest(stx$160, env$161);
            if (match$164.result && match$164.result.hasPrototype(expander$97.VariableStatement)) {
                result$162 = match$164.result.destruct(false);
                rest$163 = match$164.rest;
            } else {
                result$162 = null;
                rest$163 = stx$160;
            }
        } else if (stx$160.length > 0 && patternClass$159 === 'expr') {
            var match$164 = expander$97.get_expression(stx$160, env$161);
            if (match$164.result === null || !match$164.result.hasPrototype(expander$97.Expr)) {
                result$162 = null;
                rest$163 = stx$160;
            } else {
                result$162 = match$164.result.destruct(false);
                rest$163 = match$164.rest;
            }
        } else {
            result$162 = null;
            rest$163 = stx$160;
        }
        return {
            result: result$162,
            rest: rest$163
        };
    }
    function matchPatterns$114(patterns$165, stx$166, env$167, topLevel$168) {
        topLevel$168 = topLevel$168 || false;
        var result$169 = [];
        var patternEnv$170 = {};
        var match$171;
        var pattern$172;
        var rest$173 = stx$166;
        var success$174 = true;
        for (var i$175 = 0; i$175 < patterns$165.length; i$175++) {
            pattern$172 = patterns$165[i$175];
            do {
                match$171 = matchPattern$115(pattern$172, rest$173, env$167, patternEnv$170);
                if (!match$171.success && pattern$172.repeat) {
                    rest$173 = match$171.rest;
                    patternEnv$170 = match$171.patternEnv;
                    break;
                }
                if (!match$171.success) {
                    success$174 = false;
                    break;
                }
                rest$173 = match$171.rest;
                patternEnv$170 = match$171.patternEnv;
                if (pattern$172.repeat && success$174) {
                    if (rest$173[0] && rest$173[0].token.value === pattern$172.separator) {
                        rest$173 = rest$173.slice(1);
                    } else if (pattern$172.separator === ' ') {
                        continue;
                    } else if (pattern$172.separator !== ' ' && rest$173.length > 0 && i$175 === patterns$165.length - 1 && topLevel$168 === false) {
                        success$174 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$172.repeat && match$171.success && rest$173.length > 0);
        }
        return {
            success: success$174,
            rest: rest$173,
            patternEnv: patternEnv$170
        };
    }
    function matchPattern$115(pattern$176, stx$177, env$178, patternEnv$179) {
        var subMatch$180;
        var match$181, matchEnv$182;
        var rest$183;
        var success$184;
        if (typeof pattern$176.inner !== 'undefined') {
            if (pattern$176.class === 'pattern_group') {
                subMatch$180 = matchPatterns$114(pattern$176.inner, stx$177, env$178, false);
                rest$183 = subMatch$180.rest;
            } else if (stx$177[0] && stx$177[0].token.type === parser$96.Token.Delimiter && stx$177[0].token.value === pattern$176.value) {
                stx$177[0].expose();
                if (pattern$176.inner.length === 0 && stx$177[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$177,
                        patternEnv: patternEnv$179
                    };
                }
                subMatch$180 = matchPatterns$114(pattern$176.inner, stx$177[0].token.inner, env$178, false);
                rest$183 = stx$177.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$177,
                    patternEnv: patternEnv$179
                };
            }
            success$184 = subMatch$180.success;
            _$94.keys(subMatch$180.patternEnv).forEach(function (patternKey$185) {
                if (pattern$176.repeat) {
                    var nextLevel$186 = subMatch$180.patternEnv[patternKey$185].level + 1;
                    if (patternEnv$179[patternKey$185]) {
                        patternEnv$179[patternKey$185].level = nextLevel$186;
                        patternEnv$179[patternKey$185].match.push(subMatch$180.patternEnv[patternKey$185]);
                    } else {
                        patternEnv$179[patternKey$185] = {
                            level: nextLevel$186,
                            match: [subMatch$180.patternEnv[patternKey$185]]
                        };
                    }
                } else {
                    patternEnv$179[patternKey$185] = subMatch$180.patternEnv[patternKey$185];
                }
            });
        } else {
            if (pattern$176.class === 'pattern_literal') {
                if (stx$177[0] && pattern$176.value === '_') {
                    success$184 = true;
                    rest$183 = stx$177.slice(1);
                } else if (stx$177[0] && pattern$176.value === stx$177[0].token.value) {
                    success$184 = true;
                    rest$183 = stx$177.slice(1);
                } else {
                    success$184 = false;
                    rest$183 = stx$177;
                }
            } else {
                match$181 = matchPatternClass$113(pattern$176.class, stx$177, env$178);
                success$184 = match$181.result !== null;
                rest$183 = match$181.rest;
                matchEnv$182 = {
                    level: 0,
                    match: match$181.result
                };
                if (pattern$176.repeat) {
                    if (patternEnv$179[pattern$176.value]) {
                        patternEnv$179[pattern$176.value].match.push(matchEnv$182);
                    } else {
                        patternEnv$179[pattern$176.value] = {
                            level: 1,
                            match: [matchEnv$182]
                        };
                    }
                } else {
                    patternEnv$179[pattern$176.value] = matchEnv$182;
                }
            }
        }
        return {
            success: success$184,
            rest: rest$183,
            patternEnv: patternEnv$179
        };
    }
    function transcribe$116(macroBody$187, macroNameStx$188, env$189) {
        return _$94.chain(macroBody$187).reduce(function (acc$190, bodyStx$191, idx$192, original$193) {
            var last$194 = original$193[idx$192 - 1];
            var next$195 = original$193[idx$192 + 1];
            var nextNext$196 = original$193[idx$192 + 2];
            if (bodyStx$191.token.value === '...') {
                return acc$190;
            }
            if (delimIsSeparator$107(bodyStx$191) && next$195 && next$195.token.value === '...') {
                return acc$190;
            }
            if (bodyStx$191.token.value === '$' && next$195 && next$195.token.type === parser$96.Token.Delimiter && next$195.token.value === '()') {
                return acc$190;
            }
            if (bodyStx$191.token.value === '$' && next$195 && next$195.token.type === parser$96.Token.Delimiter && next$195.token.value === '[]') {
                next$195.literal = true;
                return acc$190;
            }
            if (bodyStx$191.token.type === parser$96.Token.Delimiter && bodyStx$191.token.value === '()' && last$194 && last$194.token.value === '$') {
                bodyStx$191.group = true;
            }
            if (bodyStx$191.literal === true) {
                parser$96.assert(bodyStx$191.token.type === parser$96.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$190.concat(bodyStx$191.token.inner);
            }
            if (next$195 && next$195.token.value === '...') {
                bodyStx$191.repeat = true;
                bodyStx$191.separator = ' ';
            } else if (delimIsSeparator$107(next$195) && nextNext$196 && nextNext$196.token.value === '...') {
                bodyStx$191.repeat = true;
                bodyStx$191.separator = next$195.token.inner[0].token.value;
            }
            return acc$190.concat(bodyStx$191);
        }, []).reduce(function (acc$197, bodyStx$198, idx$199) {
            if (bodyStx$198.repeat) {
                if (bodyStx$198.token.type === parser$96.Token.Delimiter) {
                    bodyStx$198.expose();
                    var fv$200 = _$94.filter(freeVarsInPattern$104(bodyStx$198.token.inner), function (pat$207) {
                            return env$189.hasOwnProperty(pat$207);
                        });
                    var restrictedEnv$201 = [];
                    var nonScalar$202 = _$94.find(fv$200, function (pat$208) {
                            return env$189[pat$208].level > 0;
                        });
                    parser$96.assert(typeof nonScalar$202 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$203 = env$189[nonScalar$202].match.length;
                    var sameLength$204 = _$94.all(fv$200, function (pat$209) {
                            return env$189[pat$209].level === 0 || env$189[pat$209].match.length === repeatLength$203;
                        });
                    parser$96.assert(sameLength$204, 'all non-scalars must have the same length');
                    restrictedEnv$201 = _$94.map(_$94.range(repeatLength$203), function (idx$210) {
                        var renv$211 = {};
                        _$94.each(fv$200, function (pat$212) {
                            if (env$189[pat$212].level === 0) {
                                renv$211[pat$212] = env$189[pat$212];
                            } else {
                                renv$211[pat$212] = env$189[pat$212].match[idx$210];
                            }
                        });
                        return renv$211;
                    });
                    var transcribed$205 = _$94.map(restrictedEnv$201, function (renv$213) {
                            if (bodyStx$198.group) {
                                return transcribe$116(bodyStx$198.token.inner, macroNameStx$188, renv$213);
                            } else {
                                var newBody$214 = syntaxFromToken$100(_$94.clone(bodyStx$198.token), bodyStx$198.context);
                                newBody$214.token.inner = transcribe$116(bodyStx$198.token.inner, macroNameStx$188, renv$213);
                                return newBody$214;
                            }
                        });
                    var joined$206;
                    if (bodyStx$198.group) {
                        joined$206 = joinSyntaxArr$103(transcribed$205, bodyStx$198.separator);
                    } else {
                        joined$206 = joinSyntax$102(transcribed$205, bodyStx$198.separator);
                    }
                    return acc$197.concat(joined$206);
                }
                if (!env$189[bodyStx$198.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$198.token.value + ' is not bound for the template');
                } else if (env$189[bodyStx$198.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$198.token.value + ' does not match in the template');
                }
                return acc$197.concat(joinRepeatedMatch$109(env$189[bodyStx$198.token.value].match, bodyStx$198.separator));
            } else {
                if (bodyStx$198.token.type === parser$96.Token.Delimiter) {
                    bodyStx$198.expose();
                    var newBody$215 = syntaxFromToken$100(_$94.clone(bodyStx$198.token), macroBody$187.context);
                    newBody$215.token.inner = transcribe$116(bodyStx$198.token.inner, macroNameStx$188, env$189);
                    return acc$197.concat(takeLineContext$110(macroNameStx$188, [newBody$215]));
                }
                if (isPatternVar$108(bodyStx$198) && Object.prototype.hasOwnProperty.bind(env$189)(bodyStx$198.token.value)) {
                    if (!env$189[bodyStx$198.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$198.token.value + ' is not bound for the template');
                    } else if (env$189[bodyStx$198.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$198.token.value + ' does not match in the template');
                    }
                    return acc$197.concat(takeLineContext$110(macroNameStx$188, env$189[bodyStx$198.token.value].match));
                }
                return acc$197.concat(takeLineContext$110(macroNameStx$188, [bodyStx$198]));
            }
        }, []).value();
    }
    exports$93.loadPattern = loadPattern$112;
    exports$93.matchPatterns = matchPatterns$114;
    exports$93.transcribe = transcribe$116;
    exports$93.matchPatternClass = matchPatternClass$113;
    exports$93.takeLineContext = takeLineContext$110;
    exports$93.takeLine = takeLine$111;
}));