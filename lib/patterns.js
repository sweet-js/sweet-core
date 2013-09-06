(function (root$90, factory$91) {
    if (typeof exports === 'object') {
        factory$91(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$91);
    }
}(this, function (exports$92, _$93, es6$94, parser$95, expander$96, syntax$97) {
    var get_expression$98 = expander$96.get_expression;
    var syntaxFromToken$99 = syntax$97.syntaxFromToken;
    var mkSyntax$100 = syntax$97.mkSyntax;
    function joinSyntax$101(tojoin$115, punc$116) {
        if (tojoin$115.length === 0) {
            return [];
        }
        if (punc$116 === ' ') {
            return tojoin$115;
        }
        return _$93.reduce(_$93.rest(tojoin$115, 1), function (acc$117, join$118) {
            return acc$117.concat(mkSyntax$100(punc$116, parser$95.Token.Punctuator, join$118), join$118);
        }, [_$93.first(tojoin$115)]);
    }
    function joinSyntaxArr$102(tojoin$119, punc$120) {
        if (tojoin$119.length === 0) {
            return [];
        }
        if (punc$120 === ' ') {
            return _$93.flatten(tojoin$119, true);
        }
        return _$93.reduce(_$93.rest(tojoin$119, 1), function (acc$121, join$122) {
            return acc$121.concat(mkSyntax$100(punc$120, parser$95.Token.Punctuator, _$93.first(join$122)), join$122);
        }, _$93.first(tojoin$119));
    }
    function freeVarsInPattern$103(pattern$123) {
        var fv$124 = [];
        _$93.each(pattern$123, function (pat$125) {
            if (isPatternVar$107(pat$125)) {
                fv$124.push(pat$125.token.value);
            } else if (pat$125.token.type === parser$95.Token.Delimiter) {
                fv$124 = fv$124.concat(freeVarsInPattern$103(pat$125.token.inner));
            }
        });
        return fv$124;
    }
    function typeIsLiteral$104(type$126) {
        return type$126 === parser$95.Token.NullLiteral || type$126 === parser$95.Token.NumericLiteral || type$126 === parser$95.Token.StringLiteral || type$126 === parser$95.Token.RegexLiteral || type$126 === parser$95.Token.BooleanLiteral;
    }
    function containsPatternVar$105(patterns$127) {
        return _$93.any(patterns$127, function (pat$128) {
            if (pat$128.token.type === parser$95.Token.Delimiter) {
                return containsPatternVar$105(pat$128.token.inner);
            }
            return isPatternVar$107(pat$128);
        });
    }
    function delimIsSeparator$106(delim$129) {
        return delim$129 && delim$129.token && delim$129.token.type === parser$95.Token.Delimiter && delim$129.token.value === '()' && delim$129.token.inner.length === 1 && delim$129.token.inner[0].token.type !== parser$95.Token.Delimiter && !containsPatternVar$105(delim$129.token.inner);
    }
    function isPatternVar$107(stx$130) {
        return stx$130.token.value[0] === '$' && stx$130.token.value !== '$';
    }
    function joinRepeatedMatch$108(tojoin$131, punc$132) {
        return _$93.reduce(_$93.rest(tojoin$131, 1), function (acc$133, join$134) {
            if (punc$132 === ' ') {
                return acc$133.concat(join$134.match);
            }
            return acc$133.concat(mkSyntax$100(punc$132, parser$95.Token.Punctuator, _$93.first(join$134.match)), join$134.match);
        }, _$93.first(tojoin$131).match);
    }
    function takeLineContext$109(from$135, to$136) {
        return _$93.map(to$136, function (stx$137) {
            if (stx$137.token.type === parser$95.Token.Delimiter) {
                var next$138 = syntaxFromToken$99({
                        type: parser$95.Token.Delimiter,
                        value: stx$137.token.value,
                        inner: stx$137.token.inner,
                        startRange: from$135.range,
                        endRange: from$135.range,
                        startLineNumber: from$135.token.lineNumber,
                        startLineStart: from$135.token.lineStart,
                        endLineNumber: from$135.token.lineNumber,
                        endLineStart: from$135.token.lineStart
                    }, stx$137.context);
                next$138.deferredContext = stx$137.deferredContext;
                return next$138;
            }
            return syntaxFromToken$99({
                value: stx$137.token.value,
                type: stx$137.token.type,
                lineNumber: from$135.token.lineNumber,
                lineStart: from$135.token.lineStart,
                range: from$135.token.range
            }, stx$137.context);
        });
    }
    function loadPattern$110(patterns$139) {
        return _$93.chain(patterns$139).reduce(function (acc$140, patStx$141, idx$142) {
            var last$143 = patterns$139[idx$142 - 1];
            var lastLast$144 = patterns$139[idx$142 - 2];
            var next$145 = patterns$139[idx$142 + 1];
            var nextNext$146 = patterns$139[idx$142 + 2];
            if (patStx$141.token.value === ':') {
                if (last$143 && isPatternVar$107(last$143) && !isPatternVar$107(next$145)) {
                    return acc$140;
                }
            }
            if (last$143 && last$143.token.value === ':') {
                if (lastLast$144 && isPatternVar$107(lastLast$144) && !isPatternVar$107(patStx$141)) {
                    return acc$140;
                }
            }
            if (patStx$141.token.value === '$' && next$145 && next$145.token.type === parser$95.Token.Delimiter) {
                return acc$140;
            }
            if (isPatternVar$107(patStx$141)) {
                if (next$145 && next$145.token.value === ':' && !isPatternVar$107(nextNext$146)) {
                    if (typeof nextNext$146 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$141.class = nextNext$146.token.value;
                } else {
                    patStx$141.class = 'token';
                }
            } else if (patStx$141.token.type === parser$95.Token.Delimiter) {
                if (last$143 && last$143.token.value === '$') {
                    patStx$141.class = 'pattern_group';
                }
                patStx$141.token.inner = loadPattern$110(patStx$141.token.inner);
            } else {
                patStx$141.class = 'pattern_literal';
            }
            return acc$140.concat(patStx$141);
        }, []).reduce(function (acc$147, patStx$148, idx$149, patterns$150) {
            var separator$151 = ' ';
            var repeat$152 = false;
            var next$153 = patterns$150[idx$149 + 1];
            var nextNext$154 = patterns$150[idx$149 + 2];
            if (next$153 && next$153.token.value === '...') {
                repeat$152 = true;
                separator$151 = ' ';
            } else if (delimIsSeparator$106(next$153) && nextNext$154 && nextNext$154.token.value === '...') {
                repeat$152 = true;
                parser$95.assert(next$153.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$151 = next$153.token.inner[0].token.value;
            }
            if (patStx$148.token.value === '...' || delimIsSeparator$106(patStx$148) && next$153 && next$153.token.value === '...') {
                return acc$147;
            }
            patStx$148.repeat = repeat$152;
            patStx$148.separator = separator$151;
            return acc$147.concat(patStx$148);
        }, []).value();
    }
    function matchPatternClass$111(patternClass$155, stx$156, env$157) {
        var result$158, rest$159;
        if (patternClass$155 === 'token' && stx$156[0] && stx$156[0].token.type !== parser$95.Token.EOF) {
            result$158 = [stx$156[0]];
            rest$159 = stx$156.slice(1);
        } else if (patternClass$155 === 'lit' && stx$156[0] && typeIsLiteral$104(stx$156[0].token.type)) {
            result$158 = [stx$156[0]];
            rest$159 = stx$156.slice(1);
        } else if (patternClass$155 === 'ident' && stx$156[0] && stx$156[0].token.type === parser$95.Token.Identifier) {
            result$158 = [stx$156[0]];
            rest$159 = stx$156.slice(1);
        } else if (stx$156.length > 0 && patternClass$155 === 'VariableStatement') {
            var match$160 = expander$96.enforest(stx$156, env$157);
            if (match$160.result && match$160.result.hasPrototype(expander$96.VariableStatement)) {
                result$158 = match$160.result.destruct(false);
                rest$159 = match$160.rest;
            } else {
                result$158 = null;
                rest$159 = stx$156;
            }
        } else if (stx$156.length > 0 && patternClass$155 === 'expr') {
            var match$160 = expander$96.get_expression(stx$156, env$157);
            if (match$160.result === null || !match$160.result.hasPrototype(expander$96.Expr)) {
                result$158 = null;
                rest$159 = stx$156;
            } else {
                result$158 = match$160.result.destruct(false);
                rest$159 = match$160.rest;
            }
        } else {
            result$158 = null;
            rest$159 = stx$156;
        }
        return {
            result: result$158,
            rest: rest$159
        };
    }
    function matchPatterns$112(patterns$161, stx$162, env$163, topLevel$164) {
        topLevel$164 = topLevel$164 || false;
        var result$165 = [];
        var patternEnv$166 = {};
        var match$167;
        var pattern$168;
        var rest$169 = stx$162;
        var success$170 = true;
        for (var i$171 = 0; i$171 < patterns$161.length; i$171++) {
            pattern$168 = patterns$161[i$171];
            do {
                match$167 = matchPattern$113(pattern$168, rest$169, env$163, patternEnv$166);
                if (!match$167.success && pattern$168.repeat) {
                    rest$169 = match$167.rest;
                    patternEnv$166 = match$167.patternEnv;
                    break;
                }
                if (!match$167.success) {
                    success$170 = false;
                    break;
                }
                rest$169 = match$167.rest;
                patternEnv$166 = match$167.patternEnv;
                if (pattern$168.repeat && success$170) {
                    if (rest$169[0] && rest$169[0].token.value === pattern$168.separator) {
                        rest$169 = rest$169.slice(1);
                    } else if (pattern$168.separator === ' ') {
                        continue;
                    } else if (pattern$168.separator !== ' ' && rest$169.length > 0 && i$171 === patterns$161.length - 1 && topLevel$164 === false) {
                        success$170 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$168.repeat && match$167.success && rest$169.length > 0);
        }
        return {
            success: success$170,
            rest: rest$169,
            patternEnv: patternEnv$166
        };
    }
    function matchPattern$113(pattern$172, stx$173, env$174, patternEnv$175) {
        var subMatch$176;
        var match$177, matchEnv$178;
        var rest$179;
        var success$180;
        if (typeof pattern$172.inner !== 'undefined') {
            if (pattern$172.class === 'pattern_group') {
                subMatch$176 = matchPatterns$112(pattern$172.inner, stx$173, env$174, false);
                rest$179 = subMatch$176.rest;
            } else if (stx$173[0] && stx$173[0].token.type === parser$95.Token.Delimiter && stx$173[0].token.value === pattern$172.value) {
                stx$173[0].expose();
                if (pattern$172.inner.length === 0 && stx$173[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$173,
                        patternEnv: patternEnv$175
                    };
                }
                subMatch$176 = matchPatterns$112(pattern$172.inner, stx$173[0].token.inner, env$174, false);
                rest$179 = stx$173.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$173,
                    patternEnv: patternEnv$175
                };
            }
            success$180 = subMatch$176.success;
            _$93.keys(subMatch$176.patternEnv).forEach(function (patternKey$181) {
                if (pattern$172.repeat) {
                    var nextLevel$182 = subMatch$176.patternEnv[patternKey$181].level + 1;
                    if (patternEnv$175[patternKey$181]) {
                        patternEnv$175[patternKey$181].level = nextLevel$182;
                        patternEnv$175[patternKey$181].match.push(subMatch$176.patternEnv[patternKey$181]);
                    } else {
                        patternEnv$175[patternKey$181] = {
                            level: nextLevel$182,
                            match: [subMatch$176.patternEnv[patternKey$181]]
                        };
                    }
                } else {
                    patternEnv$175[patternKey$181] = subMatch$176.patternEnv[patternKey$181];
                }
            });
        } else {
            if (pattern$172.class === 'pattern_literal') {
                if (stx$173[0] && pattern$172.value === '_') {
                    success$180 = true;
                    rest$179 = stx$173.slice(1);
                } else if (stx$173[0] && pattern$172.value === stx$173[0].token.value) {
                    success$180 = true;
                    rest$179 = stx$173.slice(1);
                } else {
                    success$180 = false;
                    rest$179 = stx$173;
                }
            } else {
                match$177 = matchPatternClass$111(pattern$172.class, stx$173, env$174);
                success$180 = match$177.result !== null;
                rest$179 = match$177.rest;
                matchEnv$178 = {
                    level: 0,
                    match: match$177.result
                };
                if (pattern$172.repeat) {
                    if (patternEnv$175[pattern$172.value]) {
                        patternEnv$175[pattern$172.value].match.push(matchEnv$178);
                    } else {
                        patternEnv$175[pattern$172.value] = {
                            level: 1,
                            match: [matchEnv$178]
                        };
                    }
                } else {
                    patternEnv$175[pattern$172.value] = matchEnv$178;
                }
            }
        }
        return {
            success: success$180,
            rest: rest$179,
            patternEnv: patternEnv$175
        };
    }
    function transcribe$114(macroBody$183, macroNameStx$184, env$185) {
        return _$93.chain(macroBody$183).reduce(function (acc$186, bodyStx$187, idx$188, original$189) {
            var last$190 = original$189[idx$188 - 1];
            var next$191 = original$189[idx$188 + 1];
            var nextNext$192 = original$189[idx$188 + 2];
            if (bodyStx$187.token.value === '...') {
                return acc$186;
            }
            if (delimIsSeparator$106(bodyStx$187) && next$191 && next$191.token.value === '...') {
                return acc$186;
            }
            if (bodyStx$187.token.value === '$' && next$191 && next$191.token.type === parser$95.Token.Delimiter && next$191.token.value === '()') {
                return acc$186;
            }
            if (bodyStx$187.token.value === '$' && next$191 && next$191.token.type === parser$95.Token.Delimiter && next$191.token.value === '[]') {
                next$191.literal = true;
                return acc$186;
            }
            if (bodyStx$187.token.type === parser$95.Token.Delimiter && bodyStx$187.token.value === '()' && last$190 && last$190.token.value === '$') {
                bodyStx$187.group = true;
            }
            if (bodyStx$187.literal === true) {
                parser$95.assert(bodyStx$187.token.type === parser$95.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$186.concat(bodyStx$187.token.inner);
            }
            if (next$191 && next$191.token.value === '...') {
                bodyStx$187.repeat = true;
                bodyStx$187.separator = ' ';
            } else if (delimIsSeparator$106(next$191) && nextNext$192 && nextNext$192.token.value === '...') {
                bodyStx$187.repeat = true;
                bodyStx$187.separator = next$191.token.inner[0].token.value;
            }
            return acc$186.concat(bodyStx$187);
        }, []).reduce(function (acc$193, bodyStx$194, idx$195) {
            if (bodyStx$194.repeat) {
                if (bodyStx$194.token.type === parser$95.Token.Delimiter) {
                    bodyStx$194.expose();
                    var fv$196 = _$93.filter(freeVarsInPattern$103(bodyStx$194.token.inner), function (pat$203) {
                            return env$185.hasOwnProperty(pat$203);
                        });
                    var restrictedEnv$197 = [];
                    var nonScalar$198 = _$93.find(fv$196, function (pat$204) {
                            return env$185[pat$204].level > 0;
                        });
                    parser$95.assert(typeof nonScalar$198 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$199 = env$185[nonScalar$198].match.length;
                    var sameLength$200 = _$93.all(fv$196, function (pat$205) {
                            return env$185[pat$205].level === 0 || env$185[pat$205].match.length === repeatLength$199;
                        });
                    parser$95.assert(sameLength$200, 'all non-scalars must have the same length');
                    restrictedEnv$197 = _$93.map(_$93.range(repeatLength$199), function (idx$206) {
                        var renv$207 = {};
                        _$93.each(fv$196, function (pat$208) {
                            if (env$185[pat$208].level === 0) {
                                renv$207[pat$208] = env$185[pat$208];
                            } else {
                                renv$207[pat$208] = env$185[pat$208].match[idx$206];
                            }
                        });
                        return renv$207;
                    });
                    var transcribed$201 = _$93.map(restrictedEnv$197, function (renv$209) {
                            if (bodyStx$194.group) {
                                return transcribe$114(bodyStx$194.token.inner, macroNameStx$184, renv$209);
                            } else {
                                var newBody$210 = syntaxFromToken$99(_$93.clone(bodyStx$194.token), bodyStx$194.context);
                                newBody$210.token.inner = transcribe$114(bodyStx$194.token.inner, macroNameStx$184, renv$209);
                                return newBody$210;
                            }
                        });
                    var joined$202;
                    if (bodyStx$194.group) {
                        joined$202 = joinSyntaxArr$102(transcribed$201, bodyStx$194.separator);
                    } else {
                        joined$202 = joinSyntax$101(transcribed$201, bodyStx$194.separator);
                    }
                    return acc$193.concat(joined$202);
                }
                if (!env$185[bodyStx$194.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$194.token.value + ' is not bound for the template');
                } else if (env$185[bodyStx$194.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$194.token.value + ' does not match in the template');
                }
                return acc$193.concat(joinRepeatedMatch$108(env$185[bodyStx$194.token.value].match, bodyStx$194.separator));
            } else {
                if (bodyStx$194.token.type === parser$95.Token.Delimiter) {
                    bodyStx$194.expose();
                    var newBody$211 = syntaxFromToken$99(_$93.clone(bodyStx$194.token), macroBody$183.context);
                    newBody$211.token.inner = transcribe$114(bodyStx$194.token.inner, macroNameStx$184, env$185);
                    return acc$193.concat(takeLineContext$109(macroNameStx$184, [newBody$211]));
                }
                if (isPatternVar$107(bodyStx$194) && Object.prototype.hasOwnProperty.bind(env$185)(bodyStx$194.token.value)) {
                    if (!env$185[bodyStx$194.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$194.token.value + ' is not bound for the template');
                    } else if (env$185[bodyStx$194.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$194.token.value + ' does not match in the template');
                    }
                    return acc$193.concat(takeLineContext$109(macroNameStx$184, env$185[bodyStx$194.token.value].match));
                }
                return acc$193.concat(takeLineContext$109(macroNameStx$184, [bodyStx$194]));
            }
        }, []).value();
    }
    exports$92.loadPattern = loadPattern$110;
    exports$92.matchPatterns = matchPatterns$112;
    exports$92.transcribe = transcribe$114;
    exports$92.matchPatternClass = matchPatternClass$111;
    exports$92.takeLineContext = takeLineContext$109;
}));