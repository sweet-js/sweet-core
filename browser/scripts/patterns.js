(function (root$186, factory$187) {
    if (typeof exports === 'object') {
        factory$187(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$187);
    }
}(this, function (exports$188, _$189, es6$190, parser$191, expander$192, syntax$193) {
    var get_expression$194 = expander$192.get_expression;
    var syntaxFromToken$195 = syntax$193.syntaxFromToken;
    var mkSyntax$196 = syntax$193.mkSyntax;
    function joinSyntax$197(tojoin$212, punc$213) {
        if (tojoin$212.length === 0) {
            return [];
        }
        if (punc$213 === ' ') {
            return tojoin$212;
        }
        return _$189.reduce(_$189.rest(tojoin$212, 1), function (acc$214, join$215) {
            return acc$214.concat(mkSyntax$196(punc$213, parser$191.Token.Punctuator, join$215), join$215);
        }, [_$189.first(tojoin$212)]);
    }
    function joinSyntaxArr$198(tojoin$216, punc$217) {
        if (tojoin$216.length === 0) {
            return [];
        }
        if (punc$217 === ' ') {
            return _$189.flatten(tojoin$216, true);
        }
        return _$189.reduce(_$189.rest(tojoin$216, 1), function (acc$218, join$219) {
            return acc$218.concat(mkSyntax$196(punc$217, parser$191.Token.Punctuator, _$189.first(join$219)), join$219);
        }, _$189.first(tojoin$216));
    }
    function freeVarsInPattern$199(pattern$220) {
        var fv$221 = [];
        _$189.each(pattern$220, function (pat$222) {
            if (isPatternVar$203(pat$222)) {
                fv$221.push(pat$222.token.value);
            } else if (pat$222.token.type === parser$191.Token.Delimiter) {
                fv$221 = fv$221.concat(freeVarsInPattern$199(pat$222.token.inner));
            }
        });
        return fv$221;
    }
    function typeIsLiteral$200(type$223) {
        return type$223 === parser$191.Token.NullLiteral || type$223 === parser$191.Token.NumericLiteral || type$223 === parser$191.Token.StringLiteral || type$223 === parser$191.Token.RegexLiteral || type$223 === parser$191.Token.BooleanLiteral;
    }
    function containsPatternVar$201(patterns$224) {
        return _$189.any(patterns$224, function (pat$225) {
            if (pat$225.token.type === parser$191.Token.Delimiter) {
                return containsPatternVar$201(pat$225.token.inner);
            }
            return isPatternVar$203(pat$225);
        });
    }
    function delimIsSeparator$202(delim$226) {
        return delim$226 && delim$226.token && delim$226.token.type === parser$191.Token.Delimiter && delim$226.token.value === '()' && delim$226.token.inner.length === 1 && delim$226.token.inner[0].token.type !== parser$191.Token.Delimiter && !containsPatternVar$201(delim$226.token.inner);
    }
    function isPatternVar$203(stx$227) {
        return stx$227.token.value[0] === '$' && stx$227.token.value !== '$';
    }
    function joinRepeatedMatch$204(tojoin$228, punc$229) {
        return _$189.reduce(_$189.rest(tojoin$228, 1), function (acc$230, join$231) {
            if (punc$229 === ' ') {
                return acc$230.concat(join$231.match);
            }
            return acc$230.concat(mkSyntax$196(punc$229, parser$191.Token.Punctuator, _$189.first(join$231.match)), join$231.match);
        }, _$189.first(tojoin$228).match);
    }
    function takeLineContext$205(from$232, to$233) {
        return _$189.map(to$233, function (stx$234) {
            return takeLine$206(from$232, stx$234);
        });
    }
    function takeLine$206(from$235, to$236) {
        if (to$236.token.type === parser$191.Token.Delimiter) {
            var next$237 = syntaxFromToken$195({
                    type: parser$191.Token.Delimiter,
                    value: to$236.token.value,
                    inner: to$236.token.inner,
                    startRange: from$235.token.range,
                    endRange: from$235.token.range,
                    startLineNumber: from$235.token.lineNumber,
                    startLineStart: from$235.token.lineStart,
                    endLineNumber: from$235.token.lineNumber,
                    endLineStart: from$235.token.lineStart
                }, to$236.context);
            next$237.deferredContext = to$236.deferredContext;
            return next$237;
        }
        return syntaxFromToken$195({
            value: to$236.token.value,
            type: to$236.token.type,
            lineNumber: from$235.token.lineNumber,
            lineStart: from$235.token.lineStart,
            range: from$235.token.range
        }, to$236.context);
    }
    function loadPattern$207(patterns$238) {
        return _$189.chain(patterns$238).reduce(function (acc$239, patStx$240, idx$241) {
            var last$242 = patterns$238[idx$241 - 1];
            var lastLast$243 = patterns$238[idx$241 - 2];
            var next$244 = patterns$238[idx$241 + 1];
            var nextNext$245 = patterns$238[idx$241 + 2];
            if (patStx$240.token.value === ':') {
                if (last$242 && isPatternVar$203(last$242) && !isPatternVar$203(next$244)) {
                    return acc$239;
                }
            }
            if (last$242 && last$242.token.value === ':') {
                if (lastLast$243 && isPatternVar$203(lastLast$243) && !isPatternVar$203(patStx$240)) {
                    return acc$239;
                }
            }
            if (patStx$240.token.value === '$' && next$244 && next$244.token.type === parser$191.Token.Delimiter) {
                return acc$239;
            }
            if (isPatternVar$203(patStx$240)) {
                if (next$244 && next$244.token.value === ':' && !isPatternVar$203(nextNext$245)) {
                    if (typeof nextNext$245 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$240.class = nextNext$245.token.value;
                } else {
                    patStx$240.class = 'token';
                }
            } else if (patStx$240.token.type === parser$191.Token.Delimiter) {
                if (last$242 && last$242.token.value === '$') {
                    patStx$240.class = 'pattern_group';
                }
                patStx$240.token.inner = loadPattern$207(patStx$240.token.inner);
            } else {
                patStx$240.class = 'pattern_literal';
            }
            return acc$239.concat(patStx$240);
        }, []).reduce(function (acc$246, patStx$247, idx$248, patterns$249) {
            var separator$250 = ' ';
            var repeat$251 = false;
            var next$252 = patterns$249[idx$248 + 1];
            var nextNext$253 = patterns$249[idx$248 + 2];
            if (next$252 && next$252.token.value === '...') {
                repeat$251 = true;
                separator$250 = ' ';
            } else if (delimIsSeparator$202(next$252) && nextNext$253 && nextNext$253.token.value === '...') {
                repeat$251 = true;
                parser$191.assert(next$252.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$250 = next$252.token.inner[0].token.value;
            }
            if (patStx$247.token.value === '...' || delimIsSeparator$202(patStx$247) && next$252 && next$252.token.value === '...') {
                return acc$246;
            }
            patStx$247.repeat = repeat$251;
            patStx$247.separator = separator$250;
            return acc$246.concat(patStx$247);
        }, []).value();
    }
    function matchPatternClass$208(patternClass$254, stx$255, env$256) {
        var result$257, rest$258;
        if (patternClass$254 === 'token' && stx$255[0] && stx$255[0].token.type !== parser$191.Token.EOF) {
            result$257 = [stx$255[0]];
            rest$258 = stx$255.slice(1);
        } else if (patternClass$254 === 'lit' && stx$255[0] && typeIsLiteral$200(stx$255[0].token.type)) {
            result$257 = [stx$255[0]];
            rest$258 = stx$255.slice(1);
        } else if (patternClass$254 === 'ident' && stx$255[0] && stx$255[0].token.type === parser$191.Token.Identifier) {
            result$257 = [stx$255[0]];
            rest$258 = stx$255.slice(1);
        } else if (stx$255.length > 0 && patternClass$254 === 'VariableStatement') {
            var match$259 = expander$192.enforest(stx$255, env$256);
            if (match$259.result && match$259.result.hasPrototype(expander$192.VariableStatement)) {
                result$257 = match$259.result.destruct(false);
                rest$258 = match$259.rest;
            } else {
                result$257 = null;
                rest$258 = stx$255;
            }
        } else if (stx$255.length > 0 && patternClass$254 === 'expr') {
            var match$259 = expander$192.get_expression(stx$255, env$256);
            if (match$259.result === null || !match$259.result.hasPrototype(expander$192.Expr)) {
                result$257 = null;
                rest$258 = stx$255;
            } else {
                result$257 = match$259.result.destruct(false);
                rest$258 = match$259.rest;
            }
        } else {
            result$257 = null;
            rest$258 = stx$255;
        }
        return {
            result: result$257,
            rest: rest$258
        };
    }
    function matchPatterns$209(patterns$260, stx$261, env$262, topLevel$263) {
        topLevel$263 = topLevel$263 || false;
        var result$264 = [];
        var patternEnv$265 = {};
        var match$266;
        var pattern$267;
        var rest$268 = stx$261;
        var success$269 = true;
        for (var i$270 = 0; i$270 < patterns$260.length; i$270++) {
            pattern$267 = patterns$260[i$270];
            do {
                match$266 = matchPattern$210(pattern$267, rest$268, env$262, patternEnv$265);
                if (!match$266.success && pattern$267.repeat) {
                    rest$268 = match$266.rest;
                    patternEnv$265 = match$266.patternEnv;
                    break;
                }
                if (!match$266.success) {
                    success$269 = false;
                    break;
                }
                rest$268 = match$266.rest;
                patternEnv$265 = match$266.patternEnv;
                if (pattern$267.repeat && success$269) {
                    if (rest$268[0] && rest$268[0].token.value === pattern$267.separator) {
                        rest$268 = rest$268.slice(1);
                    } else if (pattern$267.separator === ' ') {
                        continue;
                    } else if (pattern$267.separator !== ' ' && rest$268.length > 0 && i$270 === patterns$260.length - 1 && topLevel$263 === false) {
                        success$269 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$267.repeat && match$266.success && rest$268.length > 0);
        }
        return {
            success: success$269,
            rest: rest$268,
            patternEnv: patternEnv$265
        };
    }
    function matchPattern$210(pattern$271, stx$272, env$273, patternEnv$274) {
        var subMatch$275;
        var match$276, matchEnv$277;
        var rest$278;
        var success$279;
        if (typeof pattern$271.inner !== 'undefined') {
            if (pattern$271.class === 'pattern_group') {
                subMatch$275 = matchPatterns$209(pattern$271.inner, stx$272, env$273, false);
                rest$278 = subMatch$275.rest;
            } else if (stx$272[0] && stx$272[0].token.type === parser$191.Token.Delimiter && stx$272[0].token.value === pattern$271.value) {
                stx$272[0].expose();
                if (pattern$271.inner.length === 0 && stx$272[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$272,
                        patternEnv: patternEnv$274
                    };
                }
                subMatch$275 = matchPatterns$209(pattern$271.inner, stx$272[0].token.inner, env$273, false);
                rest$278 = stx$272.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$272,
                    patternEnv: patternEnv$274
                };
            }
            success$279 = subMatch$275.success;
            _$189.keys(subMatch$275.patternEnv).forEach(function (patternKey$280) {
                if (pattern$271.repeat) {
                    var nextLevel$281 = subMatch$275.patternEnv[patternKey$280].level + 1;
                    if (patternEnv$274[patternKey$280]) {
                        patternEnv$274[patternKey$280].level = nextLevel$281;
                        patternEnv$274[patternKey$280].match.push(subMatch$275.patternEnv[patternKey$280]);
                    } else {
                        patternEnv$274[patternKey$280] = {
                            level: nextLevel$281,
                            match: [subMatch$275.patternEnv[patternKey$280]]
                        };
                    }
                } else {
                    patternEnv$274[patternKey$280] = subMatch$275.patternEnv[patternKey$280];
                }
            });
        } else {
            if (pattern$271.class === 'pattern_literal') {
                if (stx$272[0] && pattern$271.value === '_') {
                    success$279 = true;
                    rest$278 = stx$272.slice(1);
                } else if (stx$272[0] && pattern$271.value === stx$272[0].token.value) {
                    success$279 = true;
                    rest$278 = stx$272.slice(1);
                } else {
                    success$279 = false;
                    rest$278 = stx$272;
                }
            } else {
                match$276 = matchPatternClass$208(pattern$271.class, stx$272, env$273);
                success$279 = match$276.result !== null;
                rest$278 = match$276.rest;
                matchEnv$277 = {
                    level: 0,
                    match: match$276.result
                };
                if (pattern$271.repeat) {
                    if (patternEnv$274[pattern$271.value]) {
                        patternEnv$274[pattern$271.value].match.push(matchEnv$277);
                    } else {
                        patternEnv$274[pattern$271.value] = {
                            level: 1,
                            match: [matchEnv$277]
                        };
                    }
                } else {
                    patternEnv$274[pattern$271.value] = matchEnv$277;
                }
            }
        }
        return {
            success: success$279,
            rest: rest$278,
            patternEnv: patternEnv$274
        };
    }
    function transcribe$211(macroBody$282, macroNameStx$283, env$284) {
        return _$189.chain(macroBody$282).reduce(function (acc$285, bodyStx$286, idx$287, original$288) {
            var last$289 = original$288[idx$287 - 1];
            var next$290 = original$288[idx$287 + 1];
            var nextNext$291 = original$288[idx$287 + 2];
            if (bodyStx$286.token.value === '...') {
                return acc$285;
            }
            if (delimIsSeparator$202(bodyStx$286) && next$290 && next$290.token.value === '...') {
                return acc$285;
            }
            if (bodyStx$286.token.value === '$' && next$290 && next$290.token.type === parser$191.Token.Delimiter && next$290.token.value === '()') {
                return acc$285;
            }
            if (bodyStx$286.token.value === '$' && next$290 && next$290.token.type === parser$191.Token.Delimiter && next$290.token.value === '[]') {
                next$290.literal = true;
                return acc$285;
            }
            if (bodyStx$286.token.type === parser$191.Token.Delimiter && bodyStx$286.token.value === '()' && last$289 && last$289.token.value === '$') {
                bodyStx$286.group = true;
            }
            if (bodyStx$286.literal === true) {
                parser$191.assert(bodyStx$286.token.type === parser$191.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$285.concat(bodyStx$286.token.inner);
            }
            if (next$290 && next$290.token.value === '...') {
                bodyStx$286.repeat = true;
                bodyStx$286.separator = ' ';
            } else if (delimIsSeparator$202(next$290) && nextNext$291 && nextNext$291.token.value === '...') {
                bodyStx$286.repeat = true;
                bodyStx$286.separator = next$290.token.inner[0].token.value;
            }
            return acc$285.concat(bodyStx$286);
        }, []).reduce(function (acc$292, bodyStx$293, idx$294) {
            if (bodyStx$293.repeat) {
                if (bodyStx$293.token.type === parser$191.Token.Delimiter) {
                    bodyStx$293.expose();
                    var fv$295 = _$189.filter(freeVarsInPattern$199(bodyStx$293.token.inner), function (pat$302) {
                            return env$284.hasOwnProperty(pat$302);
                        });
                    var restrictedEnv$296 = [];
                    var nonScalar$297 = _$189.find(fv$295, function (pat$303) {
                            return env$284[pat$303].level > 0;
                        });
                    parser$191.assert(typeof nonScalar$297 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$298 = env$284[nonScalar$297].match.length;
                    var sameLength$299 = _$189.all(fv$295, function (pat$304) {
                            return env$284[pat$304].level === 0 || env$284[pat$304].match.length === repeatLength$298;
                        });
                    parser$191.assert(sameLength$299, 'all non-scalars must have the same length');
                    restrictedEnv$296 = _$189.map(_$189.range(repeatLength$298), function (idx$305) {
                        var renv$306 = {};
                        _$189.each(fv$295, function (pat$307) {
                            if (env$284[pat$307].level === 0) {
                                renv$306[pat$307] = env$284[pat$307];
                            } else {
                                renv$306[pat$307] = env$284[pat$307].match[idx$305];
                            }
                        });
                        return renv$306;
                    });
                    var transcribed$300 = _$189.map(restrictedEnv$296, function (renv$308) {
                            if (bodyStx$293.group) {
                                return transcribe$211(bodyStx$293.token.inner, macroNameStx$283, renv$308);
                            } else {
                                var newBody$309 = syntaxFromToken$195(_$189.clone(bodyStx$293.token), bodyStx$293.context);
                                newBody$309.token.inner = transcribe$211(bodyStx$293.token.inner, macroNameStx$283, renv$308);
                                return newBody$309;
                            }
                        });
                    var joined$301;
                    if (bodyStx$293.group) {
                        joined$301 = joinSyntaxArr$198(transcribed$300, bodyStx$293.separator);
                    } else {
                        joined$301 = joinSyntax$197(transcribed$300, bodyStx$293.separator);
                    }
                    return acc$292.concat(joined$301);
                }
                if (!env$284[bodyStx$293.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$293.token.value + ' is not bound for the template');
                } else if (env$284[bodyStx$293.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$293.token.value + ' does not match in the template');
                }
                return acc$292.concat(joinRepeatedMatch$204(env$284[bodyStx$293.token.value].match, bodyStx$293.separator));
            } else {
                if (bodyStx$293.token.type === parser$191.Token.Delimiter) {
                    bodyStx$293.expose();
                    var newBody$310 = syntaxFromToken$195(_$189.clone(bodyStx$293.token), macroBody$282.context);
                    newBody$310.token.inner = transcribe$211(bodyStx$293.token.inner, macroNameStx$283, env$284);
                    return acc$292.concat(takeLineContext$205(macroNameStx$283, [newBody$310]));
                }
                if (isPatternVar$203(bodyStx$293) && Object.prototype.hasOwnProperty.bind(env$284)(bodyStx$293.token.value)) {
                    if (!env$284[bodyStx$293.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$293.token.value + ' is not bound for the template');
                    } else if (env$284[bodyStx$293.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$293.token.value + ' does not match in the template');
                    }
                    return acc$292.concat(takeLineContext$205(macroNameStx$283, env$284[bodyStx$293.token.value].match));
                }
                return acc$292.concat(takeLineContext$205(macroNameStx$283, [bodyStx$293]));
            }
        }, []).value();
    }
    exports$188.loadPattern = loadPattern$207;
    exports$188.matchPatterns = matchPatterns$209;
    exports$188.transcribe = transcribe$211;
    exports$188.matchPatternClass = matchPatternClass$208;
    exports$188.takeLineContext = takeLineContext$205;
    exports$188.takeLine = takeLine$206;
}));