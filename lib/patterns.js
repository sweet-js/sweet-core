(function (root$93, factory$94) {
    if (typeof exports === 'object') {
        factory$94(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$94);
    }
}(this, function (exports$95, _$96, es6$97, parser$98, expander$99, syntax$100) {
    var get_expression$101 = expander$99.get_expression;
    var syntaxFromToken$102 = syntax$100.syntaxFromToken;
    var mkSyntax$103 = syntax$100.mkSyntax;
    function joinSyntax$104(tojoin$119, punc$120) {
        if (tojoin$119.length === 0) {
            return [];
        }
        if (punc$120 === ' ') {
            return tojoin$119;
        }
        return _$96.reduce(_$96.rest(tojoin$119, 1), function (acc$121, join$122) {
            return acc$121.concat(mkSyntax$103(punc$120, parser$98.Token.Punctuator, join$122), join$122);
        }, [_$96.first(tojoin$119)]);
    }
    function joinSyntaxArr$105(tojoin$123, punc$124) {
        if (tojoin$123.length === 0) {
            return [];
        }
        if (punc$124 === ' ') {
            return _$96.flatten(tojoin$123, true);
        }
        return _$96.reduce(_$96.rest(tojoin$123, 1), function (acc$125, join$126) {
            return acc$125.concat(mkSyntax$103(punc$124, parser$98.Token.Punctuator, _$96.first(join$126)), join$126);
        }, _$96.first(tojoin$123));
    }
    function freeVarsInPattern$106(pattern$127) {
        var fv$128 = [];
        _$96.each(pattern$127, function (pat$129) {
            if (isPatternVar$110(pat$129)) {
                fv$128.push(pat$129.token.value);
            } else if (pat$129.token.type === parser$98.Token.Delimiter) {
                fv$128 = fv$128.concat(freeVarsInPattern$106(pat$129.token.inner));
            }
        });
        return fv$128;
    }
    function typeIsLiteral$107(type$130) {
        return type$130 === parser$98.Token.NullLiteral || type$130 === parser$98.Token.NumericLiteral || type$130 === parser$98.Token.StringLiteral || type$130 === parser$98.Token.RegexLiteral || type$130 === parser$98.Token.BooleanLiteral;
    }
    function containsPatternVar$108(patterns$131) {
        return _$96.any(patterns$131, function (pat$132) {
            if (pat$132.token.type === parser$98.Token.Delimiter) {
                return containsPatternVar$108(pat$132.token.inner);
            }
            return isPatternVar$110(pat$132);
        });
    }
    function delimIsSeparator$109(delim$133) {
        return delim$133 && delim$133.token && delim$133.token.type === parser$98.Token.Delimiter && delim$133.token.value === '()' && delim$133.token.inner.length === 1 && delim$133.token.inner[0].token.type !== parser$98.Token.Delimiter && !containsPatternVar$108(delim$133.token.inner);
    }
    function isPatternVar$110(stx$134) {
        return stx$134.token.value[0] === '$' && stx$134.token.value !== '$';
    }
    function joinRepeatedMatch$111(tojoin$135, punc$136) {
        return _$96.reduce(_$96.rest(tojoin$135, 1), function (acc$137, join$138) {
            if (punc$136 === ' ') {
                return acc$137.concat(join$138.match);
            }
            return acc$137.concat(mkSyntax$103(punc$136, parser$98.Token.Punctuator, _$96.first(join$138.match)), join$138.match);
        }, _$96.first(tojoin$135).match);
    }
    function takeLineContext$112(from$139, to$140) {
        return _$96.map(to$140, function (stx$141) {
            return takeLine$113(from$139, stx$141);
        });
    }
    function takeLine$113(from$142, to$143) {
        if (to$143.token.type === parser$98.Token.Delimiter) {
            var next$144 = syntaxFromToken$102({
                    type: parser$98.Token.Delimiter,
                    value: to$143.token.value,
                    inner: to$143.token.inner,
                    startRange: from$142.token.range,
                    endRange: from$142.token.range,
                    startLineNumber: from$142.token.lineNumber,
                    startLineStart: from$142.token.lineStart,
                    endLineNumber: from$142.token.lineNumber,
                    endLineStart: from$142.token.lineStart
                }, to$143.context);
            next$144.deferredContext = to$143.deferredContext;
            return next$144;
        }
        return syntaxFromToken$102({
            value: to$143.token.value,
            type: to$143.token.type,
            lineNumber: from$142.token.lineNumber,
            lineStart: from$142.token.lineStart,
            range: from$142.token.range
        }, to$143.context);
    }
    function loadPattern$114(patterns$145) {
        return _$96.chain(patterns$145).reduce(function (acc$146, patStx$147, idx$148) {
            var last$149 = patterns$145[idx$148 - 1];
            var lastLast$150 = patterns$145[idx$148 - 2];
            var next$151 = patterns$145[idx$148 + 1];
            var nextNext$152 = patterns$145[idx$148 + 2];
            if (patStx$147.token.value === ':') {
                if (last$149 && isPatternVar$110(last$149) && !isPatternVar$110(next$151)) {
                    return acc$146;
                }
            }
            if (last$149 && last$149.token.value === ':') {
                if (lastLast$150 && isPatternVar$110(lastLast$150) && !isPatternVar$110(patStx$147)) {
                    return acc$146;
                }
            }
            if (patStx$147.token.value === '$' && next$151 && next$151.token.type === parser$98.Token.Delimiter) {
                return acc$146;
            }
            if (isPatternVar$110(patStx$147)) {
                if (next$151 && next$151.token.value === ':' && !isPatternVar$110(nextNext$152)) {
                    if (typeof nextNext$152 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$147.class = nextNext$152.token.value;
                } else {
                    patStx$147.class = 'token';
                }
            } else if (patStx$147.token.type === parser$98.Token.Delimiter) {
                if (last$149 && last$149.token.value === '$') {
                    patStx$147.class = 'pattern_group';
                }
                patStx$147.token.inner = loadPattern$114(patStx$147.token.inner);
            } else {
                patStx$147.class = 'pattern_literal';
            }
            return acc$146.concat(patStx$147);
        }, []).reduce(function (acc$153, patStx$154, idx$155, patterns$156) {
            var separator$157 = ' ';
            var repeat$158 = false;
            var next$159 = patterns$156[idx$155 + 1];
            var nextNext$160 = patterns$156[idx$155 + 2];
            if (next$159 && next$159.token.value === '...') {
                repeat$158 = true;
                separator$157 = ' ';
            } else if (delimIsSeparator$109(next$159) && nextNext$160 && nextNext$160.token.value === '...') {
                repeat$158 = true;
                parser$98.assert(next$159.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$157 = next$159.token.inner[0].token.value;
            }
            if (patStx$154.token.value === '...' || delimIsSeparator$109(patStx$154) && next$159 && next$159.token.value === '...') {
                return acc$153;
            }
            patStx$154.repeat = repeat$158;
            patStx$154.separator = separator$157;
            return acc$153.concat(patStx$154);
        }, []).value();
    }
    function matchPatternClass$115(patternClass$161, stx$162, env$163) {
        var result$164, rest$165;
        if (patternClass$161 === 'token' && stx$162[0] && stx$162[0].token.type !== parser$98.Token.EOF) {
            result$164 = [stx$162[0]];
            rest$165 = stx$162.slice(1);
        } else if (patternClass$161 === 'lit' && stx$162[0] && typeIsLiteral$107(stx$162[0].token.type)) {
            result$164 = [stx$162[0]];
            rest$165 = stx$162.slice(1);
        } else if (patternClass$161 === 'ident' && stx$162[0] && stx$162[0].token.type === parser$98.Token.Identifier) {
            result$164 = [stx$162[0]];
            rest$165 = stx$162.slice(1);
        } else if (stx$162.length > 0 && patternClass$161 === 'VariableStatement') {
            var match$166 = expander$99.enforest(stx$162, env$163);
            if (match$166.result && match$166.result.hasPrototype(expander$99.VariableStatement)) {
                result$164 = match$166.result.destruct(false);
                rest$165 = match$166.rest;
            } else {
                result$164 = null;
                rest$165 = stx$162;
            }
        } else if (stx$162.length > 0 && patternClass$161 === 'expr') {
            var match$166 = expander$99.get_expression(stx$162, env$163);
            if (match$166.result === null || !match$166.result.hasPrototype(expander$99.Expr)) {
                result$164 = null;
                rest$165 = stx$162;
            } else {
                result$164 = match$166.result.destruct(false);
                rest$165 = match$166.rest;
            }
        } else {
            result$164 = null;
            rest$165 = stx$162;
        }
        return {
            result: result$164,
            rest: rest$165
        };
    }
    function matchPatterns$116(patterns$167, stx$168, env$169, topLevel$170) {
        topLevel$170 = topLevel$170 || false;
        var result$171 = [];
        var patternEnv$172 = {};
        var match$173;
        var pattern$174;
        var rest$175 = stx$168;
        var success$176 = true;
        for (var i$177 = 0; i$177 < patterns$167.length; i$177++) {
            pattern$174 = patterns$167[i$177];
            do {
                match$173 = matchPattern$117(pattern$174, rest$175, env$169, patternEnv$172);
                if (!match$173.success && pattern$174.repeat) {
                    rest$175 = match$173.rest;
                    patternEnv$172 = match$173.patternEnv;
                    break;
                }
                if (!match$173.success) {
                    success$176 = false;
                    break;
                }
                rest$175 = match$173.rest;
                patternEnv$172 = match$173.patternEnv;
                if (pattern$174.repeat && success$176) {
                    if (rest$175[0] && rest$175[0].token.value === pattern$174.separator) {
                        rest$175 = rest$175.slice(1);
                    } else if (pattern$174.separator === ' ') {
                        continue;
                    } else if (pattern$174.separator !== ' ' && rest$175.length > 0 && i$177 === patterns$167.length - 1 && topLevel$170 === false) {
                        success$176 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$174.repeat && match$173.success && rest$175.length > 0);
        }
        return {
            success: success$176,
            rest: rest$175,
            patternEnv: patternEnv$172
        };
    }
    function matchPattern$117(pattern$178, stx$179, env$180, patternEnv$181) {
        var subMatch$182;
        var match$183, matchEnv$184;
        var rest$185;
        var success$186;
        if (typeof pattern$178.inner !== 'undefined') {
            if (pattern$178.class === 'pattern_group') {
                subMatch$182 = matchPatterns$116(pattern$178.inner, stx$179, env$180, false);
                rest$185 = subMatch$182.rest;
            } else if (stx$179[0] && stx$179[0].token.type === parser$98.Token.Delimiter && stx$179[0].token.value === pattern$178.value) {
                stx$179[0].expose();
                if (pattern$178.inner.length === 0 && stx$179[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$179,
                        patternEnv: patternEnv$181
                    };
                }
                subMatch$182 = matchPatterns$116(pattern$178.inner, stx$179[0].token.inner, env$180, false);
                rest$185 = stx$179.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$179,
                    patternEnv: patternEnv$181
                };
            }
            success$186 = subMatch$182.success;
            _$96.keys(subMatch$182.patternEnv).forEach(function (patternKey$187) {
                if (pattern$178.repeat) {
                    var nextLevel$188 = subMatch$182.patternEnv[patternKey$187].level + 1;
                    if (patternEnv$181[patternKey$187]) {
                        patternEnv$181[patternKey$187].level = nextLevel$188;
                        patternEnv$181[patternKey$187].match.push(subMatch$182.patternEnv[patternKey$187]);
                    } else {
                        patternEnv$181[patternKey$187] = {
                            level: nextLevel$188,
                            match: [subMatch$182.patternEnv[patternKey$187]]
                        };
                    }
                } else {
                    patternEnv$181[patternKey$187] = subMatch$182.patternEnv[patternKey$187];
                }
            });
        } else {
            if (pattern$178.class === 'pattern_literal') {
                if (stx$179[0] && pattern$178.value === '_') {
                    success$186 = true;
                    rest$185 = stx$179.slice(1);
                } else if (stx$179[0] && pattern$178.value === stx$179[0].token.value) {
                    success$186 = true;
                    rest$185 = stx$179.slice(1);
                } else {
                    success$186 = false;
                    rest$185 = stx$179;
                }
            } else {
                match$183 = matchPatternClass$115(pattern$178.class, stx$179, env$180);
                success$186 = match$183.result !== null;
                rest$185 = match$183.rest;
                matchEnv$184 = {
                    level: 0,
                    match: match$183.result
                };
                if (pattern$178.repeat) {
                    if (patternEnv$181[pattern$178.value]) {
                        patternEnv$181[pattern$178.value].match.push(matchEnv$184);
                    } else {
                        patternEnv$181[pattern$178.value] = {
                            level: 1,
                            match: [matchEnv$184]
                        };
                    }
                } else {
                    patternEnv$181[pattern$178.value] = matchEnv$184;
                }
            }
        }
        return {
            success: success$186,
            rest: rest$185,
            patternEnv: patternEnv$181
        };
    }
    function transcribe$118(macroBody$189, macroNameStx$190, env$191) {
        return _$96.chain(macroBody$189).reduce(function (acc$192, bodyStx$193, idx$194, original$195) {
            var last$196 = original$195[idx$194 - 1];
            var next$197 = original$195[idx$194 + 1];
            var nextNext$198 = original$195[idx$194 + 2];
            if (bodyStx$193.token.value === '...') {
                return acc$192;
            }
            if (delimIsSeparator$109(bodyStx$193) && next$197 && next$197.token.value === '...') {
                return acc$192;
            }
            if (bodyStx$193.token.value === '$' && next$197 && next$197.token.type === parser$98.Token.Delimiter && next$197.token.value === '()') {
                return acc$192;
            }
            if (bodyStx$193.token.value === '$' && next$197 && next$197.token.type === parser$98.Token.Delimiter && next$197.token.value === '[]') {
                next$197.literal = true;
                return acc$192;
            }
            if (bodyStx$193.token.type === parser$98.Token.Delimiter && bodyStx$193.token.value === '()' && last$196 && last$196.token.value === '$') {
                bodyStx$193.group = true;
            }
            if (bodyStx$193.literal === true) {
                parser$98.assert(bodyStx$193.token.type === parser$98.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$192.concat(bodyStx$193.token.inner);
            }
            if (next$197 && next$197.token.value === '...') {
                bodyStx$193.repeat = true;
                bodyStx$193.separator = ' ';
            } else if (delimIsSeparator$109(next$197) && nextNext$198 && nextNext$198.token.value === '...') {
                bodyStx$193.repeat = true;
                bodyStx$193.separator = next$197.token.inner[0].token.value;
            }
            return acc$192.concat(bodyStx$193);
        }, []).reduce(function (acc$199, bodyStx$200, idx$201) {
            if (bodyStx$200.repeat) {
                if (bodyStx$200.token.type === parser$98.Token.Delimiter) {
                    bodyStx$200.expose();
                    var fv$202 = _$96.filter(freeVarsInPattern$106(bodyStx$200.token.inner), function (pat$209) {
                            return env$191.hasOwnProperty(pat$209);
                        });
                    var restrictedEnv$203 = [];
                    var nonScalar$204 = _$96.find(fv$202, function (pat$210) {
                            return env$191[pat$210].level > 0;
                        });
                    parser$98.assert(typeof nonScalar$204 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$205 = env$191[nonScalar$204].match.length;
                    var sameLength$206 = _$96.all(fv$202, function (pat$211) {
                            return env$191[pat$211].level === 0 || env$191[pat$211].match.length === repeatLength$205;
                        });
                    parser$98.assert(sameLength$206, 'all non-scalars must have the same length');
                    restrictedEnv$203 = _$96.map(_$96.range(repeatLength$205), function (idx$212) {
                        var renv$213 = {};
                        _$96.each(fv$202, function (pat$214) {
                            if (env$191[pat$214].level === 0) {
                                renv$213[pat$214] = env$191[pat$214];
                            } else {
                                renv$213[pat$214] = env$191[pat$214].match[idx$212];
                            }
                        });
                        return renv$213;
                    });
                    var transcribed$207 = _$96.map(restrictedEnv$203, function (renv$215) {
                            if (bodyStx$200.group) {
                                return transcribe$118(bodyStx$200.token.inner, macroNameStx$190, renv$215);
                            } else {
                                var newBody$216 = syntaxFromToken$102(_$96.clone(bodyStx$200.token), bodyStx$200.context);
                                newBody$216.token.inner = transcribe$118(bodyStx$200.token.inner, macroNameStx$190, renv$215);
                                return newBody$216;
                            }
                        });
                    var joined$208;
                    if (bodyStx$200.group) {
                        joined$208 = joinSyntaxArr$105(transcribed$207, bodyStx$200.separator);
                    } else {
                        joined$208 = joinSyntax$104(transcribed$207, bodyStx$200.separator);
                    }
                    return acc$199.concat(joined$208);
                }
                if (!env$191[bodyStx$200.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$200.token.value + ' is not bound for the template');
                } else if (env$191[bodyStx$200.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$200.token.value + ' does not match in the template');
                }
                return acc$199.concat(joinRepeatedMatch$111(env$191[bodyStx$200.token.value].match, bodyStx$200.separator));
            } else {
                if (bodyStx$200.token.type === parser$98.Token.Delimiter) {
                    bodyStx$200.expose();
                    var newBody$217 = syntaxFromToken$102(_$96.clone(bodyStx$200.token), macroBody$189.context);
                    newBody$217.token.inner = transcribe$118(bodyStx$200.token.inner, macroNameStx$190, env$191);
                    return acc$199.concat(takeLineContext$112(macroNameStx$190, [newBody$217]));
                }
                if (isPatternVar$110(bodyStx$200) && Object.prototype.hasOwnProperty.bind(env$191)(bodyStx$200.token.value)) {
                    if (!env$191[bodyStx$200.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$200.token.value + ' is not bound for the template');
                    } else if (env$191[bodyStx$200.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$200.token.value + ' does not match in the template');
                    }
                    return acc$199.concat(takeLineContext$112(macroNameStx$190, env$191[bodyStx$200.token.value].match));
                }
                return acc$199.concat(takeLineContext$112(macroNameStx$190, [bodyStx$200]));
            }
        }, []).value();
    }
    exports$95.loadPattern = loadPattern$114;
    exports$95.matchPatterns = matchPatterns$116;
    exports$95.transcribe = transcribe$118;
    exports$95.matchPatternClass = matchPatternClass$115;
    exports$95.takeLineContext = takeLineContext$112;
    exports$95.takeLine = takeLine$113;
}));