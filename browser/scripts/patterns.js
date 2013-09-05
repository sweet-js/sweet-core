(function (root$84, factory$85) {
    if (typeof exports === 'object') {
        factory$85(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$85);
    }
}(this, function (exports$86, _$87, es6$88, parser$89, expander$90, syntax$91) {
    var get_expression$92 = expander$90.get_expression;
    var syntaxFromToken$93 = syntax$91.syntaxFromToken;
    var mkSyntax$94 = syntax$91.mkSyntax;
    function joinSyntax$95(tojoin$109, punc$110) {
        if (tojoin$109.length === 0) {
            return [];
        }
        if (punc$110 === ' ') {
            return tojoin$109;
        }
        return _$87.reduce(_$87.rest(tojoin$109, 1), function (acc$111, join$112) {
            return acc$111.concat(mkSyntax$94(punc$110, parser$89.Token.Punctuator, join$112), join$112);
        }, [_$87.first(tojoin$109)]);
    }
    function joinSyntaxArr$96(tojoin$113, punc$114) {
        if (tojoin$113.length === 0) {
            return [];
        }
        if (punc$114 === ' ') {
            return _$87.flatten(tojoin$113, true);
        }
        return _$87.reduce(_$87.rest(tojoin$113, 1), function (acc$115, join$116) {
            return acc$115.concat(mkSyntax$94(punc$114, parser$89.Token.Punctuator, _$87.first(join$116)), join$116);
        }, _$87.first(tojoin$113));
    }
    function freeVarsInPattern$97(pattern$117) {
        var fv$118 = [];
        _$87.each(pattern$117, function (pat$119) {
            if (isPatternVar$101(pat$119)) {
                fv$118.push(pat$119.token.value);
            } else if (pat$119.token.type === parser$89.Token.Delimiter) {
                fv$118 = fv$118.concat(freeVarsInPattern$97(pat$119.token.inner));
            }
        });
        return fv$118;
    }
    function typeIsLiteral$98(type$120) {
        return type$120 === parser$89.Token.NullLiteral || type$120 === parser$89.Token.NumericLiteral || type$120 === parser$89.Token.StringLiteral || type$120 === parser$89.Token.RegexLiteral || type$120 === parser$89.Token.BooleanLiteral;
    }
    function containsPatternVar$99(patterns$121) {
        return _$87.any(patterns$121, function (pat$122) {
            if (pat$122.token.type === parser$89.Token.Delimiter) {
                return containsPatternVar$99(pat$122.token.inner);
            }
            return isPatternVar$101(pat$122);
        });
    }
    function delimIsSeparator$100(delim$123) {
        return delim$123 && delim$123.token && delim$123.token.type === parser$89.Token.Delimiter && delim$123.token.value === '()' && delim$123.token.inner.length === 1 && delim$123.token.inner[0].token.type !== parser$89.Token.Delimiter && !containsPatternVar$99(delim$123.token.inner);
    }
    function isPatternVar$101(stx$124) {
        return stx$124.token.value[0] === '$' && stx$124.token.value !== '$';
    }
    function joinRepeatedMatch$102(tojoin$125, punc$126) {
        return _$87.reduce(_$87.rest(tojoin$125, 1), function (acc$127, join$128) {
            if (punc$126 === ' ') {
                return acc$127.concat(join$128.match);
            }
            return acc$127.concat(mkSyntax$94(punc$126, parser$89.Token.Punctuator, _$87.first(join$128.match)), join$128.match);
        }, _$87.first(tojoin$125).match);
    }
    function takeLineContext$103(from$129, to$130) {
        return _$87.map(to$130, function (stx$131) {
            if (stx$131.token.type === parser$89.Token.Delimiter) {
                var next$132 = syntaxFromToken$93({
                        type: parser$89.Token.Delimiter,
                        value: stx$131.token.value,
                        inner: stx$131.token.inner,
                        startRange: from$129.range,
                        endRange: from$129.range,
                        startLineNumber: from$129.token.lineNumber,
                        startLineStart: from$129.token.lineStart,
                        endLineNumber: from$129.token.lineNumber,
                        endLineStart: from$129.token.lineStart
                    }, stx$131.context);
                next$132.deferredContext = stx$131.deferredContext;
                return next$132;
            }
            return syntaxFromToken$93({
                value: stx$131.token.value,
                type: stx$131.token.type,
                lineNumber: from$129.token.lineNumber,
                lineStart: from$129.token.lineStart,
                range: from$129.token.range
            }, stx$131.context);
        });
    }
    function loadPattern$104(patterns$133) {
        return _$87.chain(patterns$133).reduce(function (acc$134, patStx$135, idx$136) {
            var last$137 = patterns$133[idx$136 - 1];
            var lastLast$138 = patterns$133[idx$136 - 2];
            var next$139 = patterns$133[idx$136 + 1];
            var nextNext$140 = patterns$133[idx$136 + 2];
            if (patStx$135.token.value === ':') {
                if (last$137 && isPatternVar$101(last$137) && !isPatternVar$101(next$139)) {
                    return acc$134;
                }
            }
            if (last$137 && last$137.token.value === ':') {
                if (lastLast$138 && isPatternVar$101(lastLast$138) && !isPatternVar$101(patStx$135)) {
                    return acc$134;
                }
            }
            if (patStx$135.token.value === '$' && next$139 && next$139.token.type === parser$89.Token.Delimiter) {
                return acc$134;
            }
            if (isPatternVar$101(patStx$135)) {
                if (next$139 && next$139.token.value === ':' && !isPatternVar$101(nextNext$140)) {
                    if (typeof nextNext$140 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$135.class = nextNext$140.token.value;
                } else {
                    patStx$135.class = 'token';
                }
            } else if (patStx$135.token.type === parser$89.Token.Delimiter) {
                if (last$137 && last$137.token.value === '$') {
                    patStx$135.class = 'pattern_group';
                }
                patStx$135.token.inner = loadPattern$104(patStx$135.token.inner);
            } else {
                patStx$135.class = 'pattern_literal';
            }
            return acc$134.concat(patStx$135);
        }, []).reduce(function (acc$141, patStx$142, idx$143, patterns$144) {
            var separator$145 = ' ';
            var repeat$146 = false;
            var next$147 = patterns$144[idx$143 + 1];
            var nextNext$148 = patterns$144[idx$143 + 2];
            if (next$147 && next$147.token.value === '...') {
                repeat$146 = true;
                separator$145 = ' ';
            } else if (delimIsSeparator$100(next$147) && nextNext$148 && nextNext$148.token.value === '...') {
                repeat$146 = true;
                parser$89.assert(next$147.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$145 = next$147.token.inner[0].token.value;
            }
            if (patStx$142.token.value === '...' || delimIsSeparator$100(patStx$142) && next$147 && next$147.token.value === '...') {
                return acc$141;
            }
            patStx$142.repeat = repeat$146;
            patStx$142.separator = separator$145;
            return acc$141.concat(patStx$142);
        }, []).value();
    }
    function matchPatternClass$105(patternClass$149, stx$150, env$151) {
        var result$152, rest$153;
        if (patternClass$149 === 'token' && stx$150[0] && stx$150[0].token.type !== parser$89.Token.EOF) {
            result$152 = [stx$150[0]];
            rest$153 = stx$150.slice(1);
        } else if (patternClass$149 === 'lit' && stx$150[0] && typeIsLiteral$98(stx$150[0].token.type)) {
            result$152 = [stx$150[0]];
            rest$153 = stx$150.slice(1);
        } else if (patternClass$149 === 'ident' && stx$150[0] && stx$150[0].token.type === parser$89.Token.Identifier) {
            result$152 = [stx$150[0]];
            rest$153 = stx$150.slice(1);
        } else if (stx$150.length > 0 && patternClass$149 === 'VariableStatement') {
            var match$154 = expander$90.enforest(stx$150, env$151);
            if (match$154.result && match$154.result.hasPrototype(expander$90.VariableStatement)) {
                result$152 = match$154.result.destruct(false);
                rest$153 = match$154.rest;
            } else {
                result$152 = null;
                rest$153 = stx$150;
            }
        } else if (stx$150.length > 0 && patternClass$149 === 'expr') {
            var match$154 = expander$90.get_expression(stx$150, env$151);
            if (match$154.result === null || !match$154.result.hasPrototype(expander$90.Expr)) {
                result$152 = null;
                rest$153 = stx$150;
            } else {
                result$152 = match$154.result.destruct(false);
                rest$153 = match$154.rest;
            }
        } else {
            result$152 = null;
            rest$153 = stx$150;
        }
        return {
            result: result$152,
            rest: rest$153
        };
    }
    function matchPatterns$106(patterns$155, stx$156, env$157, topLevel$158) {
        topLevel$158 = topLevel$158 || false;
        var result$159 = [];
        var patternEnv$160 = {};
        var match$161;
        var pattern$162;
        var rest$163 = stx$156;
        var success$164 = true;
        for (var i$165 = 0; i$165 < patterns$155.length; i$165++) {
            pattern$162 = patterns$155[i$165];
            do {
                match$161 = matchPattern$107(pattern$162, rest$163, env$157, patternEnv$160);
                if (!match$161.success && pattern$162.repeat) {
                    rest$163 = match$161.rest;
                    patternEnv$160 = match$161.patternEnv;
                    break;
                }
                if (!match$161.success) {
                    success$164 = false;
                    break;
                }
                rest$163 = match$161.rest;
                patternEnv$160 = match$161.patternEnv;
                if (pattern$162.repeat && success$164) {
                    if (rest$163[0] && rest$163[0].token.value === pattern$162.separator) {
                        rest$163 = rest$163.slice(1);
                    } else if (pattern$162.separator === ' ') {
                        continue;
                    } else if (pattern$162.separator !== ' ' && rest$163.length > 0 && i$165 === patterns$155.length - 1 && topLevel$158 === false) {
                        success$164 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$162.repeat && match$161.success && rest$163.length > 0);
        }
        return {
            success: success$164,
            rest: rest$163,
            patternEnv: patternEnv$160
        };
    }
    function matchPattern$107(pattern$166, stx$167, env$168, patternEnv$169) {
        var subMatch$170;
        var match$171, matchEnv$172;
        var rest$173;
        var success$174;
        if (typeof pattern$166.inner !== 'undefined') {
            if (pattern$166.class === 'pattern_group') {
                subMatch$170 = matchPatterns$106(pattern$166.inner, stx$167, env$168, false);
                rest$173 = subMatch$170.rest;
            } else if (stx$167[0] && stx$167[0].token.type === parser$89.Token.Delimiter && stx$167[0].token.value === pattern$166.value) {
                stx$167[0].expose();
                if (pattern$166.inner.length === 0 && stx$167[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$167,
                        patternEnv: patternEnv$169
                    };
                }
                subMatch$170 = matchPatterns$106(pattern$166.inner, stx$167[0].token.inner, env$168, false);
                rest$173 = stx$167.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$167,
                    patternEnv: patternEnv$169
                };
            }
            success$174 = subMatch$170.success;
            _$87.keys(subMatch$170.patternEnv).forEach(function (patternKey$175) {
                if (pattern$166.repeat) {
                    var nextLevel$176 = subMatch$170.patternEnv[patternKey$175].level + 1;
                    if (patternEnv$169[patternKey$175]) {
                        patternEnv$169[patternKey$175].level = nextLevel$176;
                        patternEnv$169[patternKey$175].match.push(subMatch$170.patternEnv[patternKey$175]);
                    } else {
                        patternEnv$169[patternKey$175] = {
                            level: nextLevel$176,
                            match: [subMatch$170.patternEnv[patternKey$175]]
                        };
                    }
                } else {
                    patternEnv$169[patternKey$175] = subMatch$170.patternEnv[patternKey$175];
                }
            });
        } else {
            if (pattern$166.class === 'pattern_literal') {
                if (stx$167[0] && pattern$166.value === '_') {
                    success$174 = true;
                    rest$173 = stx$167.slice(1);
                } else if (stx$167[0] && pattern$166.value === stx$167[0].token.value) {
                    success$174 = true;
                    rest$173 = stx$167.slice(1);
                } else {
                    success$174 = false;
                    rest$173 = stx$167;
                }
            } else {
                match$171 = matchPatternClass$105(pattern$166.class, stx$167, env$168);
                success$174 = match$171.result !== null;
                rest$173 = match$171.rest;
                matchEnv$172 = {
                    level: 0,
                    match: match$171.result
                };
                if (pattern$166.repeat) {
                    if (patternEnv$169[pattern$166.value]) {
                        patternEnv$169[pattern$166.value].match.push(matchEnv$172);
                    } else {
                        patternEnv$169[pattern$166.value] = {
                            level: 1,
                            match: [matchEnv$172]
                        };
                    }
                } else {
                    patternEnv$169[pattern$166.value] = matchEnv$172;
                }
            }
        }
        return {
            success: success$174,
            rest: rest$173,
            patternEnv: patternEnv$169
        };
    }
    function transcribe$108(macroBody$177, macroNameStx$178, env$179) {
        return _$87.chain(macroBody$177).reduce(function (acc$180, bodyStx$181, idx$182, original$183) {
            var last$184 = original$183[idx$182 - 1];
            var next$185 = original$183[idx$182 + 1];
            var nextNext$186 = original$183[idx$182 + 2];
            if (bodyStx$181.token.value === '...') {
                return acc$180;
            }
            if (delimIsSeparator$100(bodyStx$181) && next$185 && next$185.token.value === '...') {
                return acc$180;
            }
            if (bodyStx$181.token.value === '$' && next$185 && next$185.token.type === parser$89.Token.Delimiter && next$185.token.value === '()') {
                return acc$180;
            }
            if (bodyStx$181.token.value === '$' && next$185 && next$185.token.type === parser$89.Token.Delimiter && next$185.token.value === '[]') {
                next$185.literal = true;
                return acc$180;
            }
            if (bodyStx$181.token.type === parser$89.Token.Delimiter && bodyStx$181.token.value === '()' && last$184 && last$184.token.value === '$') {
                bodyStx$181.group = true;
            }
            if (bodyStx$181.literal === true) {
                parser$89.assert(bodyStx$181.token.type === parser$89.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$180.concat(bodyStx$181.token.inner);
            }
            if (next$185 && next$185.token.value === '...') {
                bodyStx$181.repeat = true;
                bodyStx$181.separator = ' ';
            } else if (delimIsSeparator$100(next$185) && nextNext$186 && nextNext$186.token.value === '...') {
                bodyStx$181.repeat = true;
                bodyStx$181.separator = next$185.token.inner[0].token.value;
            }
            return acc$180.concat(bodyStx$181);
        }, []).reduce(function (acc$187, bodyStx$188, idx$189) {
            if (bodyStx$188.repeat) {
                if (bodyStx$188.token.type === parser$89.Token.Delimiter) {
                    bodyStx$188.expose();
                    var fv$190 = _$87.filter(freeVarsInPattern$97(bodyStx$188.token.inner), function (pat$197) {
                            return env$179.hasOwnProperty(pat$197);
                        });
                    var restrictedEnv$191 = [];
                    var nonScalar$192 = _$87.find(fv$190, function (pat$198) {
                            return env$179[pat$198].level > 0;
                        });
                    parser$89.assert(typeof nonScalar$192 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$193 = env$179[nonScalar$192].match.length;
                    var sameLength$194 = _$87.all(fv$190, function (pat$199) {
                            return env$179[pat$199].level === 0 || env$179[pat$199].match.length === repeatLength$193;
                        });
                    parser$89.assert(sameLength$194, 'all non-scalars must have the same length');
                    restrictedEnv$191 = _$87.map(_$87.range(repeatLength$193), function (idx$200) {
                        var renv$201 = {};
                        _$87.each(fv$190, function (pat$202) {
                            if (env$179[pat$202].level === 0) {
                                renv$201[pat$202] = env$179[pat$202];
                            } else {
                                renv$201[pat$202] = env$179[pat$202].match[idx$200];
                            }
                        });
                        return renv$201;
                    });
                    var transcribed$195 = _$87.map(restrictedEnv$191, function (renv$203) {
                            if (bodyStx$188.group) {
                                return transcribe$108(bodyStx$188.token.inner, macroNameStx$178, renv$203);
                            } else {
                                var newBody$204 = syntaxFromToken$93(_$87.clone(bodyStx$188.token), bodyStx$188.context);
                                newBody$204.token.inner = transcribe$108(bodyStx$188.token.inner, macroNameStx$178, renv$203);
                                return newBody$204;
                            }
                        });
                    var joined$196;
                    if (bodyStx$188.group) {
                        joined$196 = joinSyntaxArr$96(transcribed$195, bodyStx$188.separator);
                    } else {
                        joined$196 = joinSyntax$95(transcribed$195, bodyStx$188.separator);
                    }
                    return acc$187.concat(joined$196);
                }
                if (!env$179[bodyStx$188.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$188.token.value + ' is not bound for the template');
                } else if (env$179[bodyStx$188.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$188.token.value + ' does not match in the template');
                }
                return acc$187.concat(joinRepeatedMatch$102(env$179[bodyStx$188.token.value].match, bodyStx$188.separator));
            } else {
                if (bodyStx$188.token.type === parser$89.Token.Delimiter) {
                    bodyStx$188.expose();
                    var newBody$205 = syntaxFromToken$93(_$87.clone(bodyStx$188.token), macroBody$177.context);
                    newBody$205.token.inner = transcribe$108(bodyStx$188.token.inner, macroNameStx$178, env$179);
                    return acc$187.concat(takeLineContext$103(macroNameStx$178, [newBody$205]));
                }
                if (isPatternVar$101(bodyStx$188) && Object.prototype.hasOwnProperty.bind(env$179)(bodyStx$188.token.value)) {
                    if (!env$179[bodyStx$188.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$188.token.value + ' is not bound for the template');
                    } else if (env$179[bodyStx$188.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$188.token.value + ' does not match in the template');
                    }
                    return acc$187.concat(takeLineContext$103(macroNameStx$178, env$179[bodyStx$188.token.value].match));
                }
                return acc$187.concat(takeLineContext$103(macroNameStx$178, [bodyStx$188]));
            }
        }, []).value();
    }
    exports$86.loadPattern = loadPattern$104;
    exports$86.matchPatterns = matchPatterns$106;
    exports$86.transcribe = transcribe$108;
    exports$86.matchPatternClass = matchPatternClass$105;
    exports$86.takeLineContext = takeLineContext$103;
}));