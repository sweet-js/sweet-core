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
                return syntaxFromToken$93({
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
    function loadPattern$104(patterns$132) {
        return _$87.chain(patterns$132).reduce(function (acc$133, patStx$134, idx$135) {
            var last$136 = patterns$132[idx$135 - 1];
            var lastLast$137 = patterns$132[idx$135 - 2];
            var next$138 = patterns$132[idx$135 + 1];
            var nextNext$139 = patterns$132[idx$135 + 2];
            if (patStx$134.token.value === ':') {
                if (last$136 && isPatternVar$101(last$136) && !isPatternVar$101(next$138)) {
                    return acc$133;
                }
            }
            if (last$136 && last$136.token.value === ':') {
                if (lastLast$137 && isPatternVar$101(lastLast$137) && !isPatternVar$101(patStx$134)) {
                    return acc$133;
                }
            }
            if (patStx$134.token.value === '$' && next$138 && next$138.token.type === parser$89.Token.Delimiter) {
                return acc$133;
            }
            if (isPatternVar$101(patStx$134)) {
                if (next$138 && next$138.token.value === ':' && !isPatternVar$101(nextNext$139)) {
                    if (typeof nextNext$139 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$134.class = nextNext$139.token.value;
                } else {
                    patStx$134.class = 'token';
                }
            } else if (patStx$134.token.type === parser$89.Token.Delimiter) {
                if (last$136 && last$136.token.value === '$') {
                    patStx$134.class = 'pattern_group';
                }
                patStx$134.token.inner = loadPattern$104(patStx$134.token.inner);
            } else {
                patStx$134.class = 'pattern_literal';
            }
            return acc$133.concat(patStx$134);
        }, []).reduce(function (acc$140, patStx$141, idx$142, patterns$143) {
            var separator$144 = ' ';
            var repeat$145 = false;
            var next$146 = patterns$143[idx$142 + 1];
            var nextNext$147 = patterns$143[idx$142 + 2];
            if (next$146 && next$146.token.value === '...') {
                repeat$145 = true;
                separator$144 = ' ';
            } else if (delimIsSeparator$100(next$146) && nextNext$147 && nextNext$147.token.value === '...') {
                repeat$145 = true;
                parser$89.assert(next$146.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$144 = next$146.token.inner[0].token.value;
            }
            if (patStx$141.token.value === '...' || delimIsSeparator$100(patStx$141) && next$146 && next$146.token.value === '...') {
                return acc$140;
            }
            patStx$141.repeat = repeat$145;
            patStx$141.separator = separator$144;
            return acc$140.concat(patStx$141);
        }, []).value();
    }
    function matchPatternClass$105(patternClass$148, stx$149, env$150) {
        var result$151, rest$152;
        if (patternClass$148 === 'token' && stx$149[0] && stx$149[0].token.type !== parser$89.Token.EOF) {
            result$151 = [stx$149[0]];
            rest$152 = stx$149.slice(1);
        } else if (patternClass$148 === 'lit' && stx$149[0] && typeIsLiteral$98(stx$149[0].token.type)) {
            result$151 = [stx$149[0]];
            rest$152 = stx$149.slice(1);
        } else if (patternClass$148 === 'ident' && stx$149[0] && stx$149[0].token.type === parser$89.Token.Identifier) {
            result$151 = [stx$149[0]];
            rest$152 = stx$149.slice(1);
        } else if (stx$149.length > 0 && patternClass$148 === 'VariableStatement') {
            var match$153 = expander$90.enforest(stx$149, env$150);
            if (match$153.result && match$153.result.hasPrototype(expander$90.VariableStatement)) {
                result$151 = match$153.result.destruct(false);
                rest$152 = match$153.rest;
            } else {
                result$151 = null;
                rest$152 = stx$149;
            }
        } else if (stx$149.length > 0 && patternClass$148 === 'expr') {
            var match$153 = expander$90.get_expression(stx$149, env$150);
            if (match$153.result === null || !match$153.result.hasPrototype(expander$90.Expr)) {
                result$151 = null;
                rest$152 = stx$149;
            } else {
                result$151 = match$153.result.destruct(false);
                rest$152 = match$153.rest;
            }
        } else {
            result$151 = null;
            rest$152 = stx$149;
        }
        return {
            result: result$151,
            rest: rest$152
        };
    }
    function matchPatterns$106(patterns$154, stx$155, env$156, topLevel$157) {
        topLevel$157 = topLevel$157 || false;
        var result$158 = [];
        var patternEnv$159 = {};
        var match$160;
        var pattern$161;
        var rest$162 = stx$155;
        var success$163 = true;
        for (var i$164 = 0; i$164 < patterns$154.length; i$164++) {
            pattern$161 = patterns$154[i$164];
            do {
                match$160 = matchPattern$107(pattern$161, rest$162, env$156, patternEnv$159);
                if (!match$160.success && pattern$161.repeat) {
                    rest$162 = match$160.rest;
                    patternEnv$159 = match$160.patternEnv;
                    break;
                }
                if (!match$160.success) {
                    success$163 = false;
                    break;
                }
                rest$162 = match$160.rest;
                patternEnv$159 = match$160.patternEnv;
                if (pattern$161.repeat && success$163) {
                    if (rest$162[0] && rest$162[0].token.value === pattern$161.separator) {
                        rest$162 = rest$162.slice(1);
                    } else if (pattern$161.separator === ' ') {
                        continue;
                    } else if (pattern$161.separator !== ' ' && rest$162.length > 0 && i$164 === patterns$154.length - 1 && topLevel$157 === false) {
                        success$163 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$161.repeat && match$160.success && rest$162.length > 0);
        }
        return {
            success: success$163,
            rest: rest$162,
            patternEnv: patternEnv$159
        };
    }
    function matchPattern$107(pattern$165, stx$166, env$167, patternEnv$168) {
        var subMatch$169;
        var match$170, matchEnv$171;
        var rest$172;
        var success$173;
        if (typeof pattern$165.inner !== 'undefined') {
            if (pattern$165.class === 'pattern_group') {
                subMatch$169 = matchPatterns$106(pattern$165.inner, stx$166, env$167, false);
                rest$172 = subMatch$169.rest;
            } else if (stx$166[0] && stx$166[0].token.type === parser$89.Token.Delimiter && stx$166[0].token.value === pattern$165.value) {
                stx$166[0].expose();
                if (pattern$165.inner.length === 0 && stx$166[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$166,
                        patternEnv: patternEnv$168
                    };
                }
                subMatch$169 = matchPatterns$106(pattern$165.inner, stx$166[0].token.inner, env$167, false);
                rest$172 = stx$166.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$166,
                    patternEnv: patternEnv$168
                };
            }
            success$173 = subMatch$169.success;
            _$87.keys(subMatch$169.patternEnv).forEach(function (patternKey$174) {
                if (pattern$165.repeat) {
                    var nextLevel$175 = subMatch$169.patternEnv[patternKey$174].level + 1;
                    if (patternEnv$168[patternKey$174]) {
                        patternEnv$168[patternKey$174].level = nextLevel$175;
                        patternEnv$168[patternKey$174].match.push(subMatch$169.patternEnv[patternKey$174]);
                    } else {
                        patternEnv$168[patternKey$174] = {
                            level: nextLevel$175,
                            match: [subMatch$169.patternEnv[patternKey$174]]
                        };
                    }
                } else {
                    patternEnv$168[patternKey$174] = subMatch$169.patternEnv[patternKey$174];
                }
            });
        } else {
            if (pattern$165.class === 'pattern_literal') {
                if (stx$166[0] && pattern$165.value === '_') {
                    success$173 = true;
                    rest$172 = stx$166.slice(1);
                } else if (stx$166[0] && pattern$165.value === stx$166[0].token.value) {
                    success$173 = true;
                    rest$172 = stx$166.slice(1);
                } else {
                    success$173 = false;
                    rest$172 = stx$166;
                }
            } else {
                match$170 = matchPatternClass$105(pattern$165.class, stx$166, env$167);
                success$173 = match$170.result !== null;
                rest$172 = match$170.rest;
                matchEnv$171 = {
                    level: 0,
                    match: match$170.result
                };
                if (pattern$165.repeat) {
                    if (patternEnv$168[pattern$165.value]) {
                        patternEnv$168[pattern$165.value].match.push(matchEnv$171);
                    } else {
                        patternEnv$168[pattern$165.value] = {
                            level: 1,
                            match: [matchEnv$171]
                        };
                    }
                } else {
                    patternEnv$168[pattern$165.value] = matchEnv$171;
                }
            }
        }
        return {
            success: success$173,
            rest: rest$172,
            patternEnv: patternEnv$168
        };
    }
    function transcribe$108(macroBody$176, macroNameStx$177, env$178) {
        return _$87.chain(macroBody$176).reduce(function (acc$179, bodyStx$180, idx$181, original$182) {
            var last$183 = original$182[idx$181 - 1];
            var next$184 = original$182[idx$181 + 1];
            var nextNext$185 = original$182[idx$181 + 2];
            if (bodyStx$180.token.value === '...') {
                return acc$179;
            }
            if (delimIsSeparator$100(bodyStx$180) && next$184 && next$184.token.value === '...') {
                return acc$179;
            }
            if (bodyStx$180.token.value === '$' && next$184 && next$184.token.type === parser$89.Token.Delimiter && next$184.token.value === '()') {
                return acc$179;
            }
            if (bodyStx$180.token.value === '$' && next$184 && next$184.token.type === parser$89.Token.Delimiter && next$184.token.value === '[]') {
                next$184.literal = true;
                return acc$179;
            }
            if (bodyStx$180.token.type === parser$89.Token.Delimiter && bodyStx$180.token.value === '()' && last$183 && last$183.token.value === '$') {
                bodyStx$180.group = true;
            }
            if (bodyStx$180.literal === true) {
                parser$89.assert(bodyStx$180.token.type === parser$89.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$179.concat(bodyStx$180.token.inner);
            }
            if (next$184 && next$184.token.value === '...') {
                bodyStx$180.repeat = true;
                bodyStx$180.separator = ' ';
            } else if (delimIsSeparator$100(next$184) && nextNext$185 && nextNext$185.token.value === '...') {
                bodyStx$180.repeat = true;
                bodyStx$180.separator = next$184.token.inner[0].token.value;
            }
            return acc$179.concat(bodyStx$180);
        }, []).reduce(function (acc$186, bodyStx$187, idx$188) {
            if (bodyStx$187.repeat) {
                if (bodyStx$187.token.type === parser$89.Token.Delimiter) {
                    bodyStx$187.expose();
                    var fv$189 = _$87.filter(freeVarsInPattern$97(bodyStx$187.token.inner), function (pat$196) {
                            return env$178.hasOwnProperty(pat$196);
                        });
                    var restrictedEnv$190 = [];
                    var nonScalar$191 = _$87.find(fv$189, function (pat$197) {
                            return env$178[pat$197].level > 0;
                        });
                    parser$89.assert(typeof nonScalar$191 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$192 = env$178[nonScalar$191].match.length;
                    var sameLength$193 = _$87.all(fv$189, function (pat$198) {
                            return env$178[pat$198].level === 0 || env$178[pat$198].match.length === repeatLength$192;
                        });
                    parser$89.assert(sameLength$193, 'all non-scalars must have the same length');
                    restrictedEnv$190 = _$87.map(_$87.range(repeatLength$192), function (idx$199) {
                        var renv$200 = {};
                        _$87.each(fv$189, function (pat$201) {
                            if (env$178[pat$201].level === 0) {
                                renv$200[pat$201] = env$178[pat$201];
                            } else {
                                renv$200[pat$201] = env$178[pat$201].match[idx$199];
                            }
                        });
                        return renv$200;
                    });
                    var transcribed$194 = _$87.map(restrictedEnv$190, function (renv$202) {
                            if (bodyStx$187.group) {
                                return transcribe$108(bodyStx$187.token.inner, macroNameStx$177, renv$202);
                            } else {
                                var newBody$203 = syntaxFromToken$93(_$87.clone(bodyStx$187.token), bodyStx$187.context);
                                newBody$203.token.inner = transcribe$108(bodyStx$187.token.inner, macroNameStx$177, renv$202);
                                return newBody$203;
                            }
                        });
                    var joined$195;
                    if (bodyStx$187.group) {
                        joined$195 = joinSyntaxArr$96(transcribed$194, bodyStx$187.separator);
                    } else {
                        joined$195 = joinSyntax$95(transcribed$194, bodyStx$187.separator);
                    }
                    return acc$186.concat(joined$195);
                }
                if (!env$178[bodyStx$187.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$187.token.value + ' is not bound for the template');
                } else if (env$178[bodyStx$187.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$187.token.value + ' does not match in the template');
                }
                return acc$186.concat(joinRepeatedMatch$102(env$178[bodyStx$187.token.value].match, bodyStx$187.separator));
            } else {
                if (bodyStx$187.token.type === parser$89.Token.Delimiter) {
                    bodyStx$187.expose();
                    var newBody$204 = syntaxFromToken$93(_$87.clone(bodyStx$187.token), macroBody$176.context);
                    newBody$204.token.inner = transcribe$108(bodyStx$187.token.inner, macroNameStx$177, env$178);
                    return acc$186.concat(takeLineContext$103(macroNameStx$177, [newBody$204]));
                }
                if (isPatternVar$101(bodyStx$187) && Object.prototype.hasOwnProperty.bind(env$178)(bodyStx$187.token.value)) {
                    if (!env$178[bodyStx$187.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$187.token.value + ' is not bound for the template');
                    } else if (env$178[bodyStx$187.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$187.token.value + ' does not match in the template');
                    }
                    return acc$186.concat(takeLineContext$103(macroNameStx$177, env$178[bodyStx$187.token.value].match));
                }
                return acc$186.concat(takeLineContext$103(macroNameStx$177, [bodyStx$187]));
            }
        }, []).value();
    }
    exports$86.loadPattern = loadPattern$104;
    exports$86.matchPatterns = matchPatterns$106;
    exports$86.transcribe = transcribe$108;
    exports$86.matchPatternClass = matchPatternClass$105;
    exports$86.takeLineContext = takeLineContext$103;
}));