(function (root$49, factory$50) {
    if (typeof exports === 'object') {
        factory$50(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$50);
    }
}(this, function (exports$51, _$52, es6$53, parser$54, expander$55, syntax$56) {
    var get_expression$57 = expander$55.get_expression;
    var syntaxFromToken$58 = syntax$56.syntaxFromToken;
    var mkSyntax$59 = syntax$56.mkSyntax;
    function joinSyntax$60(tojoin$61, punc$62) {
        if (tojoin$61.length === 0) {
            return [];
        }
        if (punc$62 === ' ') {
            return tojoin$61;
        }
        return _$52.reduce(_$52.rest(tojoin$61, 1), function (acc$63, join$64) {
            return acc$63.concat(mkSyntax$59(punc$62, parser$54.Token.Punctuator, join$64), join$64);
        }, [_$52.first(tojoin$61)]);
    }
    function joinSyntaxArr$65(tojoin$66, punc$67) {
        if (tojoin$66.length === 0) {
            return [];
        }
        if (punc$67 === ' ') {
            return _$52.flatten(tojoin$66, true);
        }
        return _$52.reduce(_$52.rest(tojoin$66, 1), function (acc$68, join$69) {
            return acc$68.concat(mkSyntax$59(punc$67, parser$54.Token.Punctuator, _$52.first(join$69)), join$69);
        }, _$52.first(tojoin$66));
    }
    function freeVarsInPattern$70(pattern$71) {
        var fv$72 = [];
        _$52.each(pattern$71, function (pat$73) {
            if (isPatternVar$81(pat$73)) {
                fv$72.push(pat$73.token.value);
            } else if (pat$73.token.type === parser$54.Token.Delimiter) {
                fv$72 = fv$72.concat(freeVarsInPattern$70(pat$73.token.inner));
            }
        });
        return fv$72;
    }
    function typeIsLiteral$74(type$75) {
        return type$75 === parser$54.Token.NullLiteral || type$75 === parser$54.Token.NumericLiteral || type$75 === parser$54.Token.StringLiteral || type$75 === parser$54.Token.RegexLiteral || type$75 === parser$54.Token.BooleanLiteral;
    }
    function containsPatternVar$76(patterns$77) {
        return _$52.any(patterns$77, function (pat$78) {
            if (pat$78.token.type === parser$54.Token.Delimiter) {
                return containsPatternVar$76(pat$78.token.inner);
            }
            return isPatternVar$81(pat$78);
        });
    }
    function delimIsSeparator$79(delim$80) {
        return delim$80 && delim$80.token && delim$80.token.type === parser$54.Token.Delimiter && delim$80.token.value === '()' && delim$80.token.inner.length === 1 && delim$80.token.inner[0].token.type !== parser$54.Token.Delimiter && !containsPatternVar$76(delim$80.token.inner);
    }
    function isPatternVar$81(stx$82) {
        return stx$82.token.value[0] === '$' && stx$82.token.value !== '$';
    }
    function joinRepeatedMatch$83(tojoin$84, punc$85) {
        return _$52.reduce(_$52.rest(tojoin$84, 1), function (acc$86, join$87) {
            if (punc$85 === ' ') {
                return acc$86.concat(join$87.match);
            }
            return acc$86.concat(mkSyntax$59(punc$85, parser$54.Token.Punctuator, _$52.first(join$87.match)), join$87.match);
        }, _$52.first(tojoin$84).match);
    }
    function takeLineContext$88(from$89, to$90) {
        return _$52.map(to$90, function (stx$91) {
            if (stx$91.token.type === parser$54.Token.Delimiter) {
                return syntaxFromToken$58({
                    type: parser$54.Token.Delimiter,
                    value: stx$91.token.value,
                    inner: stx$91.token.inner,
                    startRange: from$89.range,
                    endRange: from$89.range,
                    startLineNumber: from$89.token.lineNumber,
                    startLineStart: from$89.token.lineStart,
                    endLineNumber: from$89.token.lineNumber,
                    endLineStart: from$89.token.lineStart
                }, stx$91.context);
            }
            return syntaxFromToken$58({
                value: stx$91.token.value,
                type: stx$91.token.type,
                lineNumber: from$89.token.lineNumber,
                lineStart: from$89.token.lineStart,
                range: from$89.token.range
            }, stx$91.context);
        });
    }
    function loadPattern$92(patterns$93) {
        return _$52.chain(patterns$93).reduce(function (acc$94, patStx$95, idx$96) {
            var last$97 = patterns$93[idx$96 - 1];
            var lastLast$98 = patterns$93[idx$96 - 2];
            var next$99 = patterns$93[idx$96 + 1];
            var nextNext$100 = patterns$93[idx$96 + 2];
            if (patStx$95.token.value === ':') {
                if (last$97 && isPatternVar$81(last$97) && !isPatternVar$81(next$99)) {
                    return acc$94;
                }
            }
            if (last$97 && last$97.token.value === ':') {
                if (lastLast$98 && isPatternVar$81(lastLast$98) && !isPatternVar$81(patStx$95)) {
                    return acc$94;
                }
            }
            if (patStx$95.token.value === '$' && next$99 && next$99.token.type === parser$54.Token.Delimiter) {
                return acc$94;
            }
            if (isPatternVar$81(patStx$95)) {
                if (next$99 && next$99.token.value === ':' && !isPatternVar$81(nextNext$100)) {
                    if (typeof nextNext$100 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$95.class = nextNext$100.token.value;
                } else {
                    patStx$95.class = 'token';
                }
            } else if (patStx$95.token.type === parser$54.Token.Delimiter) {
                if (last$97 && last$97.token.value === '$') {
                    patStx$95.class = 'pattern_group';
                }
                patStx$95.token.inner = loadPattern$92(patStx$95.token.inner);
            } else {
                patStx$95.class = 'pattern_literal';
            }
            return acc$94.concat(patStx$95);
        }, []).reduce(function (acc$101, patStx$102, idx$103, patterns$104) {
            var separator$105 = ' ';
            var repeat$106 = false;
            var next$107 = patterns$104[idx$103 + 1];
            var nextNext$108 = patterns$104[idx$103 + 2];
            if (next$107 && next$107.token.value === '...') {
                repeat$106 = true;
                separator$105 = ' ';
            } else if (delimIsSeparator$79(next$107) && nextNext$108 && nextNext$108.token.value === '...') {
                repeat$106 = true;
                parser$54.assert(next$107.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$105 = next$107.token.inner[0].token.value;
            }
            if (patStx$102.token.value === '...' || delimIsSeparator$79(patStx$102) && next$107 && next$107.token.value === '...') {
                return acc$101;
            }
            patStx$102.repeat = repeat$106;
            patStx$102.separator = separator$105;
            return acc$101.concat(patStx$102);
        }, []).value();
    }
    function matchPatternClass$109(patternClass$110, stx$111, env$112) {
        var result$113, rest$114;
        if (patternClass$110 === 'token' && stx$111[0] && stx$111[0].token.type !== parser$54.Token.EOF) {
            result$113 = [stx$111[0]];
            rest$114 = stx$111.slice(1);
        } else if (patternClass$110 === 'lit' && stx$111[0] && typeIsLiteral$74(stx$111[0].token.type)) {
            result$113 = [stx$111[0]];
            rest$114 = stx$111.slice(1);
        } else if (patternClass$110 === 'ident' && stx$111[0] && stx$111[0].token.type === parser$54.Token.Identifier) {
            result$113 = [stx$111[0]];
            rest$114 = stx$111.slice(1);
        } else if (stx$111.length > 0 && patternClass$110 === 'VariableStatement') {
            var match$115 = expander$55.enforest(stx$111, env$112);
            if (match$115.result && match$115.result.hasPrototype(expander$55.VariableStatement)) {
                result$113 = match$115.result.destruct(false);
                rest$114 = match$115.rest;
            } else {
                result$113 = null;
                rest$114 = stx$111;
            }
        } else if (stx$111.length > 0 && patternClass$110 === 'expr') {
            var match$115 = expander$55.get_expression(stx$111, env$112);
            if (match$115.result === null || !match$115.result.hasPrototype(expander$55.Expr)) {
                result$113 = null;
                rest$114 = stx$111;
            } else {
                result$113 = match$115.result.destruct(false);
                rest$114 = match$115.rest;
            }
        } else {
            result$113 = null;
            rest$114 = stx$111;
        }
        return {
            result: result$113,
            rest: rest$114
        };
    }
    function matchPatterns$116(patterns$117, stx$118, env$119, topLevel$120) {
        topLevel$120 = topLevel$120 || false;
        var result$121 = [];
        var patternEnv$122 = {};
        var match$123;
        var pattern$124;
        var rest$125 = stx$118;
        var success$126 = true;
        for (var i$127 = 0; i$127 < patterns$117.length; i$127++) {
            pattern$124 = patterns$117[i$127];
            do {
                match$123 = matchPattern$128(pattern$124, rest$125, env$119, patternEnv$122);
                if (!match$123.success && pattern$124.repeat) {
                    rest$125 = match$123.rest;
                    patternEnv$122 = match$123.patternEnv;
                    break;
                }
                if (!match$123.success) {
                    success$126 = false;
                    break;
                }
                rest$125 = match$123.rest;
                patternEnv$122 = match$123.patternEnv;
                if (pattern$124.repeat && success$126) {
                    if (rest$125[0] && rest$125[0].token.value === pattern$124.separator) {
                        rest$125 = rest$125.slice(1);
                    } else if (pattern$124.separator === ' ') {
                        continue;
                    } else if (pattern$124.separator !== ' ' && rest$125.length > 0 && i$127 === patterns$117.length - 1 && topLevel$120 === false) {
                        success$126 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$124.repeat && match$123.success && rest$125.length > 0);
        }
        return {
            success: success$126,
            rest: rest$125,
            patternEnv: patternEnv$122
        };
    }
    function matchPattern$128(pattern$129, stx$130, env$131, patternEnv$132) {
        var subMatch$133;
        var match$134, matchEnv$135;
        var rest$136;
        var success$137;
        if (typeof pattern$129.inner !== 'undefined') {
            if (pattern$129.class === 'pattern_group') {
                subMatch$133 = matchPatterns$116(pattern$129.inner, stx$130, env$131, false);
                rest$136 = subMatch$133.rest;
            } else if (stx$130[0] && stx$130[0].token.type === parser$54.Token.Delimiter && stx$130[0].token.value === pattern$129.value) {
                if (pattern$129.inner.length === 0 && stx$130[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$130,
                        patternEnv: patternEnv$132
                    };
                }
                subMatch$133 = matchPatterns$116(pattern$129.inner, stx$130[0].token.inner, env$131, false);
                rest$136 = stx$130.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$130,
                    patternEnv: patternEnv$132
                };
            }
            success$137 = subMatch$133.success;
            _$52.keys(subMatch$133.patternEnv).forEach(function (patternKey$138) {
                if (pattern$129.repeat) {
                    var nextLevel$139 = subMatch$133.patternEnv[patternKey$138].level + 1;
                    if (patternEnv$132[patternKey$138]) {
                        patternEnv$132[patternKey$138].level = nextLevel$139;
                        patternEnv$132[patternKey$138].match.push(subMatch$133.patternEnv[patternKey$138]);
                    } else {
                        patternEnv$132[patternKey$138] = {
                            level: nextLevel$139,
                            match: [subMatch$133.patternEnv[patternKey$138]]
                        };
                    }
                } else {
                    patternEnv$132[patternKey$138] = subMatch$133.patternEnv[patternKey$138];
                }
            });
        } else {
            if (pattern$129.class === 'pattern_literal') {
                if (stx$130[0] && pattern$129.value === '_') {
                    success$137 = true;
                    rest$136 = stx$130.slice(1);
                } else if (stx$130[0] && pattern$129.value === stx$130[0].token.value) {
                    success$137 = true;
                    rest$136 = stx$130.slice(1);
                } else {
                    success$137 = false;
                    rest$136 = stx$130;
                }
            } else {
                match$134 = matchPatternClass$109(pattern$129.class, stx$130, env$131);
                success$137 = match$134.result !== null;
                rest$136 = match$134.rest;
                matchEnv$135 = {
                    level: 0,
                    match: match$134.result
                };
                if (pattern$129.repeat) {
                    if (patternEnv$132[pattern$129.value]) {
                        patternEnv$132[pattern$129.value].match.push(matchEnv$135);
                    } else {
                        patternEnv$132[pattern$129.value] = {
                            level: 1,
                            match: [matchEnv$135]
                        };
                    }
                } else {
                    patternEnv$132[pattern$129.value] = matchEnv$135;
                }
            }
        }
        return {
            success: success$137,
            rest: rest$136,
            patternEnv: patternEnv$132
        };
    }
    function transcribe$140(macroBody$141, macroNameStx$142, env$143) {
        return _$52.chain(macroBody$141).reduce(function (acc$144, bodyStx$145, idx$146, original$147) {
            var last$148 = original$147[idx$146 - 1];
            var next$149 = original$147[idx$146 + 1];
            var nextNext$150 = original$147[idx$146 + 2];
            if (bodyStx$145.token.value === '...') {
                return acc$144;
            }
            if (delimIsSeparator$79(bodyStx$145) && next$149 && next$149.token.value === '...') {
                return acc$144;
            }
            if (bodyStx$145.token.value === '$' && next$149 && next$149.token.type === parser$54.Token.Delimiter && next$149.token.value === '()') {
                return acc$144;
            }
            if (bodyStx$145.token.value === '$' && next$149 && next$149.token.type === parser$54.Token.Delimiter && next$149.token.value === '[]') {
                next$149.literal = true;
                return acc$144;
            }
            if (bodyStx$145.token.type === parser$54.Token.Delimiter && bodyStx$145.token.value === '()' && last$148 && last$148.token.value === '$') {
                bodyStx$145.group = true;
            }
            if (bodyStx$145.literal === true) {
                parser$54.assert(bodyStx$145.token.type === parser$54.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$144.concat(bodyStx$145.token.inner);
            }
            if (next$149 && next$149.token.value === '...') {
                bodyStx$145.repeat = true;
                bodyStx$145.separator = ' ';
            } else if (delimIsSeparator$79(next$149) && nextNext$150 && nextNext$150.token.value === '...') {
                bodyStx$145.repeat = true;
                bodyStx$145.separator = next$149.token.inner[0].token.value;
            }
            return acc$144.concat(bodyStx$145);
        }, []).reduce(function (acc$151, bodyStx$152, idx$153) {
            if (bodyStx$152.repeat) {
                if (bodyStx$152.token.type === parser$54.Token.Delimiter) {
                    var fv$154 = _$52.filter(freeVarsInPattern$70(bodyStx$152.token.inner), function (pat$161) {
                            return env$143.hasOwnProperty(pat$161);
                        });
                    var restrictedEnv$155 = [];
                    var nonScalar$156 = _$52.find(fv$154, function (pat$162) {
                            return env$143[pat$162].level > 0;
                        });
                    parser$54.assert(typeof nonScalar$156 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$157 = env$143[nonScalar$156].match.length;
                    var sameLength$158 = _$52.all(fv$154, function (pat$163) {
                            return env$143[pat$163].level === 0 || env$143[pat$163].match.length === repeatLength$157;
                        });
                    parser$54.assert(sameLength$158, 'all non-scalars must have the same length');
                    restrictedEnv$155 = _$52.map(_$52.range(repeatLength$157), function (idx$164) {
                        var renv$165 = {};
                        _$52.each(fv$154, function (pat$166) {
                            if (env$143[pat$166].level === 0) {
                                renv$165[pat$166] = env$143[pat$166];
                            } else {
                                renv$165[pat$166] = env$143[pat$166].match[idx$164];
                            }
                        });
                        return renv$165;
                    });
                    var transcribed$159 = _$52.map(restrictedEnv$155, function (renv$167) {
                            if (bodyStx$152.group) {
                                return transcribe$140(bodyStx$152.token.inner, macroNameStx$142, renv$167);
                            } else {
                                var newBody$168 = syntaxFromToken$58(_$52.clone(bodyStx$152.token), bodyStx$152.context);
                                newBody$168.token.inner = transcribe$140(bodyStx$152.token.inner, macroNameStx$142, renv$167);
                                return newBody$168;
                            }
                        });
                    var joined$160;
                    if (bodyStx$152.group) {
                        joined$160 = joinSyntaxArr$65(transcribed$159, bodyStx$152.separator);
                    } else {
                        joined$160 = joinSyntax$60(transcribed$159, bodyStx$152.separator);
                    }
                    return acc$151.concat(joined$160);
                }
                if (!env$143[bodyStx$152.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$152.token.value + ' is not bound for the template');
                } else if (env$143[bodyStx$152.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$152.token.value + ' does not match in the template');
                }
                return acc$151.concat(joinRepeatedMatch$83(env$143[bodyStx$152.token.value].match, bodyStx$152.separator));
            } else {
                if (bodyStx$152.token.type === parser$54.Token.Delimiter) {
                    var newBody$169 = syntaxFromToken$58(_$52.clone(bodyStx$152.token), macroBody$141.context);
                    newBody$169.token.inner = transcribe$140(bodyStx$152.token.inner, macroNameStx$142, env$143);
                    return acc$151.concat(takeLineContext$88(macroNameStx$142, [newBody$169]));
                }
                if (Object.prototype.hasOwnProperty.bind(env$143)(bodyStx$152.token.value)) {
                    if (!env$143[bodyStx$152.token.value]) {
                        throwError('The pattern variable ' + bodyStx$152.token.value + ' is not bound for the template');
                    } else if (env$143[bodyStx$152.token.value].level !== 0) {
                        throwError('Ellipses level for ' + bodyStx$152.token.value + ' does not match in the template');
                    }
                    return acc$151.concat(takeLineContext$88(macroNameStx$142, env$143[bodyStx$152.token.value].match));
                }
                return acc$151.concat(takeLineContext$88(macroNameStx$142, [bodyStx$152]));
            }
        }, []).value();
    }
    exports$51.loadPattern = loadPattern$92;
    exports$51.matchPatterns = matchPatterns$116;
    exports$51.transcribe = transcribe$140;
    exports$51.matchPatternClass = matchPatternClass$109;
}));