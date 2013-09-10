(function (root$92, factory$93) {
    if (typeof exports === 'object') {
        factory$93(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$93);
    }
}(this, function (exports$94, _$95, es6$96, parser$97, expander$98, syntax$99) {
    var get_expression$100 = expander$98.get_expression;
    var syntaxFromToken$101 = syntax$99.syntaxFromToken;
    var mkSyntax$102 = syntax$99.mkSyntax;
    function joinSyntax$103(tojoin$118, punc$119) {
        if (tojoin$118.length === 0) {
            return [];
        }
        if (punc$119 === ' ') {
            return tojoin$118;
        }
        return _$95.reduce(_$95.rest(tojoin$118, 1), function (acc$120, join$121) {
            return acc$120.concat(mkSyntax$102(punc$119, parser$97.Token.Punctuator, join$121), join$121);
        }, [_$95.first(tojoin$118)]);
    }
    function joinSyntaxArr$104(tojoin$122, punc$123) {
        if (tojoin$122.length === 0) {
            return [];
        }
        if (punc$123 === ' ') {
            return _$95.flatten(tojoin$122, true);
        }
        return _$95.reduce(_$95.rest(tojoin$122, 1), function (acc$124, join$125) {
            return acc$124.concat(mkSyntax$102(punc$123, parser$97.Token.Punctuator, _$95.first(join$125)), join$125);
        }, _$95.first(tojoin$122));
    }
    function freeVarsInPattern$105(pattern$126) {
        var fv$127 = [];
        _$95.each(pattern$126, function (pat$128) {
            if (isPatternVar$109(pat$128)) {
                fv$127.push(pat$128.token.value);
            } else if (pat$128.token.type === parser$97.Token.Delimiter) {
                fv$127 = fv$127.concat(freeVarsInPattern$105(pat$128.token.inner));
            }
        });
        return fv$127;
    }
    function typeIsLiteral$106(type$129) {
        return type$129 === parser$97.Token.NullLiteral || type$129 === parser$97.Token.NumericLiteral || type$129 === parser$97.Token.StringLiteral || type$129 === parser$97.Token.RegexLiteral || type$129 === parser$97.Token.BooleanLiteral;
    }
    function containsPatternVar$107(patterns$130) {
        return _$95.any(patterns$130, function (pat$131) {
            if (pat$131.token.type === parser$97.Token.Delimiter) {
                return containsPatternVar$107(pat$131.token.inner);
            }
            return isPatternVar$109(pat$131);
        });
    }
    function delimIsSeparator$108(delim$132) {
        return delim$132 && delim$132.token && delim$132.token.type === parser$97.Token.Delimiter && delim$132.token.value === '()' && delim$132.token.inner.length === 1 && delim$132.token.inner[0].token.type !== parser$97.Token.Delimiter && !containsPatternVar$107(delim$132.token.inner);
    }
    function isPatternVar$109(stx$133) {
        return stx$133.token.value[0] === '$' && stx$133.token.value !== '$';
    }
    function joinRepeatedMatch$110(tojoin$134, punc$135) {
        return _$95.reduce(_$95.rest(tojoin$134, 1), function (acc$136, join$137) {
            if (punc$135 === ' ') {
                return acc$136.concat(join$137.match);
            }
            return acc$136.concat(mkSyntax$102(punc$135, parser$97.Token.Punctuator, _$95.first(join$137.match)), join$137.match);
        }, _$95.first(tojoin$134).match);
    }
    function takeLineContext$111(from$138, to$139) {
        return _$95.map(to$139, function (stx$140) {
            return takeLine$112(from$138, stx$140);
        });
    }
    function takeLine$112(from$141, to$142) {
        if (to$142.token.type === parser$97.Token.Delimiter) {
            var next$143 = syntaxFromToken$101({
                    type: parser$97.Token.Delimiter,
                    value: to$142.token.value,
                    inner: to$142.token.inner,
                    startRange: from$141.range,
                    endRange: from$141.range,
                    startLineNumber: from$141.token.lineNumber,
                    startLineStart: from$141.token.lineStart,
                    endLineNumber: from$141.token.lineNumber,
                    endLineStart: from$141.token.lineStart
                }, to$142.context);
            next$143.deferredContext = to$142.deferredContext;
            return next$143;
        }
        return syntaxFromToken$101({
            value: to$142.token.value,
            type: to$142.token.type,
            lineNumber: from$141.token.lineNumber,
            lineStart: from$141.token.lineStart,
            range: from$141.token.range
        }, to$142.context);
    }
    function loadPattern$113(patterns$144) {
        return _$95.chain(patterns$144).reduce(function (acc$145, patStx$146, idx$147) {
            var last$148 = patterns$144[idx$147 - 1];
            var lastLast$149 = patterns$144[idx$147 - 2];
            var next$150 = patterns$144[idx$147 + 1];
            var nextNext$151 = patterns$144[idx$147 + 2];
            if (patStx$146.token.value === ':') {
                if (last$148 && isPatternVar$109(last$148) && !isPatternVar$109(next$150)) {
                    return acc$145;
                }
            }
            if (last$148 && last$148.token.value === ':') {
                if (lastLast$149 && isPatternVar$109(lastLast$149) && !isPatternVar$109(patStx$146)) {
                    return acc$145;
                }
            }
            if (patStx$146.token.value === '$' && next$150 && next$150.token.type === parser$97.Token.Delimiter) {
                return acc$145;
            }
            if (isPatternVar$109(patStx$146)) {
                if (next$150 && next$150.token.value === ':' && !isPatternVar$109(nextNext$151)) {
                    if (typeof nextNext$151 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$146.class = nextNext$151.token.value;
                } else {
                    patStx$146.class = 'token';
                }
            } else if (patStx$146.token.type === parser$97.Token.Delimiter) {
                if (last$148 && last$148.token.value === '$') {
                    patStx$146.class = 'pattern_group';
                }
                patStx$146.token.inner = loadPattern$113(patStx$146.token.inner);
            } else {
                patStx$146.class = 'pattern_literal';
            }
            return acc$145.concat(patStx$146);
        }, []).reduce(function (acc$152, patStx$153, idx$154, patterns$155) {
            var separator$156 = ' ';
            var repeat$157 = false;
            var next$158 = patterns$155[idx$154 + 1];
            var nextNext$159 = patterns$155[idx$154 + 2];
            if (next$158 && next$158.token.value === '...') {
                repeat$157 = true;
                separator$156 = ' ';
            } else if (delimIsSeparator$108(next$158) && nextNext$159 && nextNext$159.token.value === '...') {
                repeat$157 = true;
                parser$97.assert(next$158.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$156 = next$158.token.inner[0].token.value;
            }
            if (patStx$153.token.value === '...' || delimIsSeparator$108(patStx$153) && next$158 && next$158.token.value === '...') {
                return acc$152;
            }
            patStx$153.repeat = repeat$157;
            patStx$153.separator = separator$156;
            return acc$152.concat(patStx$153);
        }, []).value();
    }
    function matchPatternClass$114(patternClass$160, stx$161, env$162) {
        var result$163, rest$164;
        if (patternClass$160 === 'token' && stx$161[0] && stx$161[0].token.type !== parser$97.Token.EOF) {
            result$163 = [stx$161[0]];
            rest$164 = stx$161.slice(1);
        } else if (patternClass$160 === 'lit' && stx$161[0] && typeIsLiteral$106(stx$161[0].token.type)) {
            result$163 = [stx$161[0]];
            rest$164 = stx$161.slice(1);
        } else if (patternClass$160 === 'ident' && stx$161[0] && stx$161[0].token.type === parser$97.Token.Identifier) {
            result$163 = [stx$161[0]];
            rest$164 = stx$161.slice(1);
        } else if (stx$161.length > 0 && patternClass$160 === 'VariableStatement') {
            var match$165 = expander$98.enforest(stx$161, env$162);
            if (match$165.result && match$165.result.hasPrototype(expander$98.VariableStatement)) {
                result$163 = match$165.result.destruct(false);
                rest$164 = match$165.rest;
            } else {
                result$163 = null;
                rest$164 = stx$161;
            }
        } else if (stx$161.length > 0 && patternClass$160 === 'expr') {
            var match$165 = expander$98.get_expression(stx$161, env$162);
            if (match$165.result === null || !match$165.result.hasPrototype(expander$98.Expr)) {
                result$163 = null;
                rest$164 = stx$161;
            } else {
                result$163 = match$165.result.destruct(false);
                rest$164 = match$165.rest;
            }
        } else {
            result$163 = null;
            rest$164 = stx$161;
        }
        return {
            result: result$163,
            rest: rest$164
        };
    }
    function matchPatterns$115(patterns$166, stx$167, env$168, topLevel$169) {
        topLevel$169 = topLevel$169 || false;
        var result$170 = [];
        var patternEnv$171 = {};
        var match$172;
        var pattern$173;
        var rest$174 = stx$167;
        var success$175 = true;
        for (var i$176 = 0; i$176 < patterns$166.length; i$176++) {
            pattern$173 = patterns$166[i$176];
            do {
                match$172 = matchPattern$116(pattern$173, rest$174, env$168, patternEnv$171);
                if (!match$172.success && pattern$173.repeat) {
                    rest$174 = match$172.rest;
                    patternEnv$171 = match$172.patternEnv;
                    break;
                }
                if (!match$172.success) {
                    success$175 = false;
                    break;
                }
                rest$174 = match$172.rest;
                patternEnv$171 = match$172.patternEnv;
                if (pattern$173.repeat && success$175) {
                    if (rest$174[0] && rest$174[0].token.value === pattern$173.separator) {
                        rest$174 = rest$174.slice(1);
                    } else if (pattern$173.separator === ' ') {
                        continue;
                    } else if (pattern$173.separator !== ' ' && rest$174.length > 0 && i$176 === patterns$166.length - 1 && topLevel$169 === false) {
                        success$175 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$173.repeat && match$172.success && rest$174.length > 0);
        }
        return {
            success: success$175,
            rest: rest$174,
            patternEnv: patternEnv$171
        };
    }
    function matchPattern$116(pattern$177, stx$178, env$179, patternEnv$180) {
        var subMatch$181;
        var match$182, matchEnv$183;
        var rest$184;
        var success$185;
        if (typeof pattern$177.inner !== 'undefined') {
            if (pattern$177.class === 'pattern_group') {
                subMatch$181 = matchPatterns$115(pattern$177.inner, stx$178, env$179, false);
                rest$184 = subMatch$181.rest;
            } else if (stx$178[0] && stx$178[0].token.type === parser$97.Token.Delimiter && stx$178[0].token.value === pattern$177.value) {
                stx$178[0].expose();
                if (pattern$177.inner.length === 0 && stx$178[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$178,
                        patternEnv: patternEnv$180
                    };
                }
                subMatch$181 = matchPatterns$115(pattern$177.inner, stx$178[0].token.inner, env$179, false);
                rest$184 = stx$178.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$178,
                    patternEnv: patternEnv$180
                };
            }
            success$185 = subMatch$181.success;
            _$95.keys(subMatch$181.patternEnv).forEach(function (patternKey$186) {
                if (pattern$177.repeat) {
                    var nextLevel$187 = subMatch$181.patternEnv[patternKey$186].level + 1;
                    if (patternEnv$180[patternKey$186]) {
                        patternEnv$180[patternKey$186].level = nextLevel$187;
                        patternEnv$180[patternKey$186].match.push(subMatch$181.patternEnv[patternKey$186]);
                    } else {
                        patternEnv$180[patternKey$186] = {
                            level: nextLevel$187,
                            match: [subMatch$181.patternEnv[patternKey$186]]
                        };
                    }
                } else {
                    patternEnv$180[patternKey$186] = subMatch$181.patternEnv[patternKey$186];
                }
            });
        } else {
            if (pattern$177.class === 'pattern_literal') {
                if (stx$178[0] && pattern$177.value === '_') {
                    success$185 = true;
                    rest$184 = stx$178.slice(1);
                } else if (stx$178[0] && pattern$177.value === stx$178[0].token.value) {
                    success$185 = true;
                    rest$184 = stx$178.slice(1);
                } else {
                    success$185 = false;
                    rest$184 = stx$178;
                }
            } else {
                match$182 = matchPatternClass$114(pattern$177.class, stx$178, env$179);
                success$185 = match$182.result !== null;
                rest$184 = match$182.rest;
                matchEnv$183 = {
                    level: 0,
                    match: match$182.result
                };
                if (pattern$177.repeat) {
                    if (patternEnv$180[pattern$177.value]) {
                        patternEnv$180[pattern$177.value].match.push(matchEnv$183);
                    } else {
                        patternEnv$180[pattern$177.value] = {
                            level: 1,
                            match: [matchEnv$183]
                        };
                    }
                } else {
                    patternEnv$180[pattern$177.value] = matchEnv$183;
                }
            }
        }
        return {
            success: success$185,
            rest: rest$184,
            patternEnv: patternEnv$180
        };
    }
    function transcribe$117(macroBody$188, macroNameStx$189, env$190) {
        return _$95.chain(macroBody$188).reduce(function (acc$191, bodyStx$192, idx$193, original$194) {
            var last$195 = original$194[idx$193 - 1];
            var next$196 = original$194[idx$193 + 1];
            var nextNext$197 = original$194[idx$193 + 2];
            if (bodyStx$192.token.value === '...') {
                return acc$191;
            }
            if (delimIsSeparator$108(bodyStx$192) && next$196 && next$196.token.value === '...') {
                return acc$191;
            }
            if (bodyStx$192.token.value === '$' && next$196 && next$196.token.type === parser$97.Token.Delimiter && next$196.token.value === '()') {
                return acc$191;
            }
            if (bodyStx$192.token.value === '$' && next$196 && next$196.token.type === parser$97.Token.Delimiter && next$196.token.value === '[]') {
                next$196.literal = true;
                return acc$191;
            }
            if (bodyStx$192.token.type === parser$97.Token.Delimiter && bodyStx$192.token.value === '()' && last$195 && last$195.token.value === '$') {
                bodyStx$192.group = true;
            }
            if (bodyStx$192.literal === true) {
                parser$97.assert(bodyStx$192.token.type === parser$97.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$191.concat(bodyStx$192.token.inner);
            }
            if (next$196 && next$196.token.value === '...') {
                bodyStx$192.repeat = true;
                bodyStx$192.separator = ' ';
            } else if (delimIsSeparator$108(next$196) && nextNext$197 && nextNext$197.token.value === '...') {
                bodyStx$192.repeat = true;
                bodyStx$192.separator = next$196.token.inner[0].token.value;
            }
            return acc$191.concat(bodyStx$192);
        }, []).reduce(function (acc$198, bodyStx$199, idx$200) {
            if (bodyStx$199.repeat) {
                if (bodyStx$199.token.type === parser$97.Token.Delimiter) {
                    bodyStx$199.expose();
                    var fv$201 = _$95.filter(freeVarsInPattern$105(bodyStx$199.token.inner), function (pat$208) {
                            return env$190.hasOwnProperty(pat$208);
                        });
                    var restrictedEnv$202 = [];
                    var nonScalar$203 = _$95.find(fv$201, function (pat$209) {
                            return env$190[pat$209].level > 0;
                        });
                    parser$97.assert(typeof nonScalar$203 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$204 = env$190[nonScalar$203].match.length;
                    var sameLength$205 = _$95.all(fv$201, function (pat$210) {
                            return env$190[pat$210].level === 0 || env$190[pat$210].match.length === repeatLength$204;
                        });
                    parser$97.assert(sameLength$205, 'all non-scalars must have the same length');
                    restrictedEnv$202 = _$95.map(_$95.range(repeatLength$204), function (idx$211) {
                        var renv$212 = {};
                        _$95.each(fv$201, function (pat$213) {
                            if (env$190[pat$213].level === 0) {
                                renv$212[pat$213] = env$190[pat$213];
                            } else {
                                renv$212[pat$213] = env$190[pat$213].match[idx$211];
                            }
                        });
                        return renv$212;
                    });
                    var transcribed$206 = _$95.map(restrictedEnv$202, function (renv$214) {
                            if (bodyStx$199.group) {
                                return transcribe$117(bodyStx$199.token.inner, macroNameStx$189, renv$214);
                            } else {
                                var newBody$215 = syntaxFromToken$101(_$95.clone(bodyStx$199.token), bodyStx$199.context);
                                newBody$215.token.inner = transcribe$117(bodyStx$199.token.inner, macroNameStx$189, renv$214);
                                return newBody$215;
                            }
                        });
                    var joined$207;
                    if (bodyStx$199.group) {
                        joined$207 = joinSyntaxArr$104(transcribed$206, bodyStx$199.separator);
                    } else {
                        joined$207 = joinSyntax$103(transcribed$206, bodyStx$199.separator);
                    }
                    return acc$198.concat(joined$207);
                }
                if (!env$190[bodyStx$199.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$199.token.value + ' is not bound for the template');
                } else if (env$190[bodyStx$199.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$199.token.value + ' does not match in the template');
                }
                return acc$198.concat(joinRepeatedMatch$110(env$190[bodyStx$199.token.value].match, bodyStx$199.separator));
            } else {
                if (bodyStx$199.token.type === parser$97.Token.Delimiter) {
                    bodyStx$199.expose();
                    var newBody$216 = syntaxFromToken$101(_$95.clone(bodyStx$199.token), macroBody$188.context);
                    newBody$216.token.inner = transcribe$117(bodyStx$199.token.inner, macroNameStx$189, env$190);
                    return acc$198.concat(takeLineContext$111(macroNameStx$189, [newBody$216]));
                }
                if (isPatternVar$109(bodyStx$199) && Object.prototype.hasOwnProperty.bind(env$190)(bodyStx$199.token.value)) {
                    if (!env$190[bodyStx$199.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$199.token.value + ' is not bound for the template');
                    } else if (env$190[bodyStx$199.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$199.token.value + ' does not match in the template');
                    }
                    return acc$198.concat(takeLineContext$111(macroNameStx$189, env$190[bodyStx$199.token.value].match));
                }
                return acc$198.concat(takeLineContext$111(macroNameStx$189, [bodyStx$199]));
            }
        }, []).value();
    }
    exports$94.loadPattern = loadPattern$113;
    exports$94.matchPatterns = matchPatterns$115;
    exports$94.transcribe = transcribe$117;
    exports$94.matchPatternClass = matchPatternClass$114;
    exports$94.takeLineContext = takeLineContext$111;
    exports$94.takeLine = takeLine$112;
}));