(function (root$82, factory$83) {
    if (typeof exports === 'object') {
        factory$83(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$83);
    }
}(this, function (exports$84, _$85, es6$86, parser$87, expander$88, syntax$89) {
    var get_expression$90 = expander$88.get_expression;
    var syntaxFromToken$91 = syntax$89.syntaxFromToken;
    var mkSyntax$92 = syntax$89.mkSyntax;
    function joinSyntax$93(tojoin$94, punc$95) {
        if (tojoin$94.length === 0) {
            return [];
        }
        if (punc$95 === ' ') {
            return tojoin$94;
        }
        return _$85.reduce(_$85.rest(tojoin$94, 1), function (acc$96, join$97) {
            return acc$96.concat(mkSyntax$92(punc$95, parser$87.Token.Punctuator, join$97), join$97);
        }, [_$85.first(tojoin$94)]);
    }
    function joinSyntaxArr$98(tojoin$99, punc$100) {
        if (tojoin$99.length === 0) {
            return [];
        }
        if (punc$100 === ' ') {
            return _$85.flatten(tojoin$99, true);
        }
        return _$85.reduce(_$85.rest(tojoin$99, 1), function (acc$101, join$102) {
            return acc$101.concat(mkSyntax$92(punc$100, parser$87.Token.Punctuator, _$85.first(join$102)), join$102);
        }, _$85.first(tojoin$99));
    }
    function freeVarsInPattern$103(pattern$104) {
        var fv$105 = [];
        _$85.each(pattern$104, function (pat$106) {
            if (isPatternVar$114(pat$106)) {
                fv$105.push(pat$106.token.value);
            } else if (pat$106.token.type === parser$87.Token.Delimiter) {
                fv$105 = fv$105.concat(freeVarsInPattern$103(pat$106.token.inner));
            }
        });
        return fv$105;
    }
    function typeIsLiteral$107(type$108) {
        return type$108 === parser$87.Token.NullLiteral || type$108 === parser$87.Token.NumericLiteral || type$108 === parser$87.Token.StringLiteral || type$108 === parser$87.Token.RegexLiteral || type$108 === parser$87.Token.BooleanLiteral;
    }
    function containsPatternVar$109(patterns$110) {
        return _$85.any(patterns$110, function (pat$111) {
            if (pat$111.token.type === parser$87.Token.Delimiter) {
                return containsPatternVar$109(pat$111.token.inner);
            }
            return isPatternVar$114(pat$111);
        });
    }
    function delimIsSeparator$112(delim$113) {
        return delim$113 && delim$113.token && delim$113.token.type === parser$87.Token.Delimiter && delim$113.token.value === '()' && delim$113.token.inner.length === 1 && delim$113.token.inner[0].token.type !== parser$87.Token.Delimiter && !containsPatternVar$109(delim$113.token.inner);
    }
    function isPatternVar$114(stx$115) {
        return stx$115.token.value[0] === '$' && stx$115.token.value !== '$';
    }
    function joinRepeatedMatch$116(tojoin$117, punc$118) {
        return _$85.reduce(_$85.rest(tojoin$117, 1), function (acc$119, join$120) {
            if (punc$118 === ' ') {
                return acc$119.concat(join$120.match);
            }
            return acc$119.concat(mkSyntax$92(punc$118, parser$87.Token.Punctuator, _$85.first(join$120.match)), join$120.match);
        }, _$85.first(tojoin$117).match);
    }
    function takeLineContext$121(from$122, to$123) {
        return _$85.map(to$123, function (stx$124) {
            if (stx$124.token.type === parser$87.Token.Delimiter) {
                return syntaxFromToken$91({
                    type: parser$87.Token.Delimiter,
                    value: stx$124.token.value,
                    inner: stx$124.token.inner,
                    startRange: from$122.range,
                    endRange: from$122.range,
                    startLineNumber: from$122.token.lineNumber,
                    startLineStart: from$122.token.lineStart,
                    endLineNumber: from$122.token.lineNumber,
                    endLineStart: from$122.token.lineStart
                }, stx$124.context);
            }
            return syntaxFromToken$91({
                value: stx$124.token.value,
                type: stx$124.token.type,
                lineNumber: from$122.token.lineNumber,
                lineStart: from$122.token.lineStart,
                range: from$122.token.range
            }, stx$124.context);
        });
    }
    function loadPattern$125(patterns$126) {
        return _$85.chain(patterns$126).reduce(function (acc$127, patStx$128, idx$129) {
            var last$130 = patterns$126[idx$129 - 1];
            var lastLast$131 = patterns$126[idx$129 - 2];
            var next$132 = patterns$126[idx$129 + 1];
            var nextNext$133 = patterns$126[idx$129 + 2];
            if (patStx$128.token.value === ':') {
                if (last$130 && isPatternVar$114(last$130) && !isPatternVar$114(next$132)) {
                    return acc$127;
                }
            }
            if (last$130 && last$130.token.value === ':') {
                if (lastLast$131 && isPatternVar$114(lastLast$131) && !isPatternVar$114(patStx$128)) {
                    return acc$127;
                }
            }
            if (patStx$128.token.value === '$' && next$132 && next$132.token.type === parser$87.Token.Delimiter) {
                return acc$127;
            }
            if (isPatternVar$114(patStx$128)) {
                if (next$132 && next$132.token.value === ':' && !isPatternVar$114(nextNext$133)) {
                    if (typeof nextNext$133 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$128.class = nextNext$133.token.value;
                } else {
                    patStx$128.class = 'token';
                }
            } else if (patStx$128.token.type === parser$87.Token.Delimiter) {
                if (last$130 && last$130.token.value === '$') {
                    patStx$128.class = 'pattern_group';
                }
                patStx$128.token.inner = loadPattern$125(patStx$128.token.inner);
            } else {
                patStx$128.class = 'pattern_literal';
            }
            return acc$127.concat(patStx$128);
        }, []).reduce(function (acc$134, patStx$135, idx$136, patterns$137) {
            var separator$138 = ' ';
            var repeat$139 = false;
            var next$140 = patterns$137[idx$136 + 1];
            var nextNext$141 = patterns$137[idx$136 + 2];
            if (next$140 && next$140.token.value === '...') {
                repeat$139 = true;
                separator$138 = ' ';
            } else if (delimIsSeparator$112(next$140) && nextNext$141 && nextNext$141.token.value === '...') {
                repeat$139 = true;
                parser$87.assert(next$140.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$138 = next$140.token.inner[0].token.value;
            }
            if (patStx$135.token.value === '...' || delimIsSeparator$112(patStx$135) && next$140 && next$140.token.value === '...') {
                return acc$134;
            }
            patStx$135.repeat = repeat$139;
            patStx$135.separator = separator$138;
            return acc$134.concat(patStx$135);
        }, []).value();
    }
    function matchPatternClass$142(patternClass$143, stx$144, env$145) {
        var result$146, rest$147;
        if (patternClass$143 === 'token' && stx$144[0] && stx$144[0].token.type !== parser$87.Token.EOF) {
            result$146 = [stx$144[0]];
            rest$147 = stx$144.slice(1);
        } else if (patternClass$143 === 'lit' && stx$144[0] && typeIsLiteral$107(stx$144[0].token.type)) {
            result$146 = [stx$144[0]];
            rest$147 = stx$144.slice(1);
        } else if (patternClass$143 === 'ident' && stx$144[0] && stx$144[0].token.type === parser$87.Token.Identifier) {
            result$146 = [stx$144[0]];
            rest$147 = stx$144.slice(1);
        } else if (stx$144.length > 0 && patternClass$143 === 'VariableStatement') {
            var match$148 = expander$88.enforest(stx$144, env$145);
            if (match$148.result && match$148.result.hasPrototype(expander$88.VariableStatement)) {
                result$146 = match$148.result.destruct(false);
                rest$147 = match$148.rest;
            } else {
                result$146 = null;
                rest$147 = stx$144;
            }
        } else if (stx$144.length > 0 && patternClass$143 === 'expr') {
            var match$148 = expander$88.get_expression(stx$144, env$145);
            if (match$148.result === null || !match$148.result.hasPrototype(expander$88.Expr)) {
                result$146 = null;
                rest$147 = stx$144;
            } else {
                result$146 = match$148.result.destruct(false);
                rest$147 = match$148.rest;
            }
        } else {
            result$146 = null;
            rest$147 = stx$144;
        }
        return {
            result: result$146,
            rest: rest$147
        };
    }
    function matchPatterns$149(patterns$150, stx$151, env$152, topLevel$153) {
        topLevel$153 = topLevel$153 || false;
        var result$154 = [];
        var patternEnv$155 = {};
        var match$156;
        var pattern$157;
        var rest$158 = stx$151;
        var success$159 = true;
        for (var i$160 = 0; i$160 < patterns$150.length; i$160++) {
            pattern$157 = patterns$150[i$160];
            do {
                match$156 = matchPattern$161(pattern$157, rest$158, env$152, patternEnv$155);
                if (!match$156.success && pattern$157.repeat) {
                    rest$158 = match$156.rest;
                    patternEnv$155 = match$156.patternEnv;
                    break;
                }
                if (!match$156.success) {
                    success$159 = false;
                    break;
                }
                rest$158 = match$156.rest;
                patternEnv$155 = match$156.patternEnv;
                if (pattern$157.repeat && success$159) {
                    if (rest$158[0] && rest$158[0].token.value === pattern$157.separator) {
                        rest$158 = rest$158.slice(1);
                    } else if (pattern$157.separator === ' ') {
                        continue;
                    } else if (pattern$157.separator !== ' ' && rest$158.length > 0 && i$160 === patterns$150.length - 1 && topLevel$153 === false) {
                        success$159 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$157.repeat && match$156.success && rest$158.length > 0);
        }
        return {
            success: success$159,
            rest: rest$158,
            patternEnv: patternEnv$155
        };
    }
    function matchPattern$161(pattern$162, stx$163, env$164, patternEnv$165) {
        var subMatch$166;
        var match$167, matchEnv$168;
        var rest$169;
        var success$170;
        if (typeof pattern$162.inner !== 'undefined') {
            if (pattern$162.class === 'pattern_group') {
                subMatch$166 = matchPatterns$149(pattern$162.inner, stx$163, env$164, false);
                rest$169 = subMatch$166.rest;
            } else if (stx$163[0] && stx$163[0].token.type === parser$87.Token.Delimiter && stx$163[0].token.value === pattern$162.value) {
                if (pattern$162.inner.length === 0 && stx$163[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$163,
                        patternEnv: patternEnv$165
                    };
                }
                subMatch$166 = matchPatterns$149(pattern$162.inner, stx$163[0].token.inner, env$164, false);
                rest$169 = stx$163.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$163,
                    patternEnv: patternEnv$165
                };
            }
            success$170 = subMatch$166.success;
            _$85.keys(subMatch$166.patternEnv).forEach(function (patternKey$171) {
                if (pattern$162.repeat) {
                    var nextLevel$172 = subMatch$166.patternEnv[patternKey$171].level + 1;
                    if (patternEnv$165[patternKey$171]) {
                        patternEnv$165[patternKey$171].level = nextLevel$172;
                        patternEnv$165[patternKey$171].match.push(subMatch$166.patternEnv[patternKey$171]);
                    } else {
                        patternEnv$165[patternKey$171] = {
                            level: nextLevel$172,
                            match: [subMatch$166.patternEnv[patternKey$171]]
                        };
                    }
                } else {
                    patternEnv$165[patternKey$171] = subMatch$166.patternEnv[patternKey$171];
                }
            });
        } else {
            if (pattern$162.class === 'pattern_literal') {
                if (stx$163[0] && pattern$162.value === '_') {
                    success$170 = true;
                    rest$169 = stx$163.slice(1);
                } else if (stx$163[0] && pattern$162.value === stx$163[0].token.value) {
                    success$170 = true;
                    rest$169 = stx$163.slice(1);
                } else {
                    success$170 = false;
                    rest$169 = stx$163;
                }
            } else {
                match$167 = matchPatternClass$142(pattern$162.class, stx$163, env$164);
                success$170 = match$167.result !== null;
                rest$169 = match$167.rest;
                matchEnv$168 = {
                    level: 0,
                    match: match$167.result
                };
                if (pattern$162.repeat) {
                    if (patternEnv$165[pattern$162.value]) {
                        patternEnv$165[pattern$162.value].match.push(matchEnv$168);
                    } else {
                        patternEnv$165[pattern$162.value] = {
                            level: 1,
                            match: [matchEnv$168]
                        };
                    }
                } else {
                    patternEnv$165[pattern$162.value] = matchEnv$168;
                }
            }
        }
        return {
            success: success$170,
            rest: rest$169,
            patternEnv: patternEnv$165
        };
    }
    function transcribe$173(macroBody$174, macroNameStx$175, env$176) {
        return _$85.chain(macroBody$174).reduce(function (acc$177, bodyStx$178, idx$179, original$180) {
            var last$181 = original$180[idx$179 - 1];
            var next$182 = original$180[idx$179 + 1];
            var nextNext$183 = original$180[idx$179 + 2];
            if (bodyStx$178.token.value === '...') {
                return acc$177;
            }
            if (delimIsSeparator$112(bodyStx$178) && next$182 && next$182.token.value === '...') {
                return acc$177;
            }
            if (bodyStx$178.token.value === '$' && next$182 && next$182.token.type === parser$87.Token.Delimiter && next$182.token.value === '()') {
                return acc$177;
            }
            if (bodyStx$178.token.value === '$' && next$182 && next$182.token.type === parser$87.Token.Delimiter && next$182.token.value === '[]') {
                next$182.literal = true;
                return acc$177;
            }
            if (bodyStx$178.token.type === parser$87.Token.Delimiter && bodyStx$178.token.value === '()' && last$181 && last$181.token.value === '$') {
                bodyStx$178.group = true;
            }
            if (bodyStx$178.literal === true) {
                parser$87.assert(bodyStx$178.token.type === parser$87.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$177.concat(bodyStx$178.token.inner);
            }
            if (next$182 && next$182.token.value === '...') {
                bodyStx$178.repeat = true;
                bodyStx$178.separator = ' ';
            } else if (delimIsSeparator$112(next$182) && nextNext$183 && nextNext$183.token.value === '...') {
                bodyStx$178.repeat = true;
                bodyStx$178.separator = next$182.token.inner[0].token.value;
            }
            return acc$177.concat(bodyStx$178);
        }, []).reduce(function (acc$184, bodyStx$185, idx$186) {
            if (bodyStx$185.repeat) {
                if (bodyStx$185.token.type === parser$87.Token.Delimiter) {
                    var fv$187 = _$85.filter(freeVarsInPattern$103(bodyStx$185.token.inner), function (pat$194) {
                            return env$176.hasOwnProperty(pat$194);
                        });
                    var restrictedEnv$188 = [];
                    var nonScalar$189 = _$85.find(fv$187, function (pat$195) {
                            return env$176[pat$195].level > 0;
                        });
                    parser$87.assert(typeof nonScalar$189 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$190 = env$176[nonScalar$189].match.length;
                    var sameLength$191 = _$85.all(fv$187, function (pat$196) {
                            return env$176[pat$196].level === 0 || env$176[pat$196].match.length === repeatLength$190;
                        });
                    parser$87.assert(sameLength$191, 'all non-scalars must have the same length');
                    restrictedEnv$188 = _$85.map(_$85.range(repeatLength$190), function (idx$197) {
                        var renv$198 = {};
                        _$85.each(fv$187, function (pat$199) {
                            if (env$176[pat$199].level === 0) {
                                renv$198[pat$199] = env$176[pat$199];
                            } else {
                                renv$198[pat$199] = env$176[pat$199].match[idx$197];
                            }
                        });
                        return renv$198;
                    });
                    var transcribed$192 = _$85.map(restrictedEnv$188, function (renv$200) {
                            if (bodyStx$185.group) {
                                return transcribe$173(bodyStx$185.token.inner, macroNameStx$175, renv$200);
                            } else {
                                var newBody$201 = syntaxFromToken$91(_$85.clone(bodyStx$185.token), bodyStx$185.context);
                                newBody$201.token.inner = transcribe$173(bodyStx$185.token.inner, macroNameStx$175, renv$200);
                                return newBody$201;
                            }
                        });
                    var joined$193;
                    if (bodyStx$185.group) {
                        joined$193 = joinSyntaxArr$98(transcribed$192, bodyStx$185.separator);
                    } else {
                        joined$193 = joinSyntax$93(transcribed$192, bodyStx$185.separator);
                    }
                    return acc$184.concat(joined$193);
                }
                if (!env$176[bodyStx$185.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$185.token.value + ' is not bound for the template');
                } else if (env$176[bodyStx$185.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$185.token.value + ' does not match in the template');
                }
                return acc$184.concat(joinRepeatedMatch$116(env$176[bodyStx$185.token.value].match, bodyStx$185.separator));
            } else {
                if (bodyStx$185.token.type === parser$87.Token.Delimiter) {
                    var newBody$202 = syntaxFromToken$91(_$85.clone(bodyStx$185.token), macroBody$174.context);
                    newBody$202.token.inner = transcribe$173(bodyStx$185.token.inner, macroNameStx$175, env$176);
                    return acc$184.concat(takeLineContext$121(macroNameStx$175, [newBody$202]));
                }
                if (Object.prototype.hasOwnProperty.bind(env$176)(bodyStx$185.token.value)) {
                    if (!env$176[bodyStx$185.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$185.token.value + ' is not bound for the template');
                    } else if (env$176[bodyStx$185.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$185.token.value + ' does not match in the template');
                    }
                    return acc$184.concat(takeLineContext$121(macroNameStx$175, env$176[bodyStx$185.token.value].match));
                }
                return acc$184.concat(takeLineContext$121(macroNameStx$175, [bodyStx$185]));
            }
        }, []).value();
    }
    exports$84.loadPattern = loadPattern$125;
    exports$84.matchPatterns = matchPatterns$149;
    exports$84.transcribe = transcribe$173;
    exports$84.matchPatternClass = matchPatternClass$142;
    exports$84.takeLineContext = takeLineContext$121;
}));