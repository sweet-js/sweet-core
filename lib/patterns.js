(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander',
            'syntax'
        ], factory);
    }
}(this, function (exports$2, _, parser, expander, syntax) {
    var get_expression = expander.get_expression;
    var syntaxFromToken = syntax.syntaxFromToken;
    var makePunc = syntax.makePunc;
    var joinSyntax = syntax.joinSyntax;
    var joinSyntaxArray = syntax.joinSyntaxArray;
    var cloneSyntaxArray = syntax.cloneSyntaxArray;
    var assert = syntax.assert;
    var throwSyntaxError = syntax.throwSyntaxError;
    var push = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern(pattern) {
        var fv = [];
        _.each(pattern, function (pat) {
            if (isPatternVar(pat)) {
                fv.push(pat.token.value);
            } else if (pat.token.type === parser.Token.Delimiter) {
                push.apply(fv, freeVarsInPattern(pat.token.inner));
            }
        });
        return fv;
    }
    function typeIsLiteral(type) {
        return type === parser.Token.NullLiteral || type === parser.Token.NumericLiteral || type === parser.Token.StringLiteral || type === parser.Token.RegexLiteral || type === parser.Token.BooleanLiteral;
    }
    function containsPatternVar(patterns) {
        return _.any(patterns, function (pat) {
            if (pat.token.type === parser.Token.Delimiter) {
                return containsPatternVar(pat.token.inner);
            }
            return isPatternVar(pat);
        });
    }
    function delimIsSeparator(delim) {
        return delim && delim.token && delim.token.type === parser.Token.Delimiter && delim.token.value === '()' && delim.token.inner.length === 1 && delim.token.inner[0].token.type !== parser.Token.Delimiter && !containsPatternVar(delim.token.inner);
    }
    function isPatternVar(stx) {
        return stx.token.value[0] === '$' && stx.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch(tojoin, punc) {
        return _.reduce(_.rest(tojoin, 1), function (acc, join) {
            if (punc === ' ') {
                return acc.concat(cloneSyntaxArray(join.match));
            }
            return acc.concat(makePunc(punc, _.first(join.match)), cloneSyntaxArray(join.match));
        }, cloneSyntaxArray(_.first(tojoin).match));
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext(from, to) {
        return _.map(to, function (stx) {
            return takeLine(from, stx);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine(from, to) {
        var next;
        if (to.token.type === parser.Token.Delimiter) {
            var sm_startLineNumber = typeof to.token.sm_startLineNumber !== 'undefined' ? to.token.sm_startLineNumber : to.token.startLineNumber;
            var sm_endLineNumber = typeof to.token.sm_endLineNumber !== 'undefined' ? to.token.sm_endLineNumber : to.token.endLineNumber;
            var sm_startLineStart = typeof to.token.sm_startLineStart !== 'undefined' ? to.token.sm_startLineStart : to.token.startLineStart;
            var sm_endLineStart = typeof to.token.sm_endLineStart !== 'undefined' ? to.token.sm_endLineStart : to.token.endLineStart;
            var sm_startRange = typeof to.token.sm_startRange !== 'undefined' ? to.token.sm_startRange : to.token.startRange;
            var sm_endRange = typeof to.token.sm_endRange !== 'undefined' ? to.token.sm_endRange : to.token.endRange;
            if (from.token.type === parser.Token.Delimiter) {
                next = syntaxFromToken({
                    type: parser.Token.Delimiter,
                    value: to.token.value,
                    inner: takeLineContext(from, to.token.inner),
                    startRange: from.token.startRange,
                    endRange: from.token.endRange,
                    startLineNumber: from.token.startLineNumber,
                    startLineStart: from.token.startLineStart,
                    endLineNumber: from.token.endLineNumber,
                    endLineStart: from.token.endLineStart,
                    sm_startLineNumber: sm_startLineNumber,
                    sm_endLineNumber: sm_endLineNumber,
                    sm_startLineStart: sm_startLineStart,
                    sm_endLineStart: sm_endLineStart,
                    sm_startRange: sm_startRange,
                    sm_endRange: sm_endRange
                }, to);
            } else {
                next = syntaxFromToken({
                    type: parser.Token.Delimiter,
                    value: to.token.value,
                    inner: takeLineContext(from, to.token.inner),
                    startRange: from.token.range,
                    endRange: from.token.range,
                    startLineNumber: from.token.lineNumber,
                    startLineStart: from.token.lineStart,
                    endLineNumber: from.token.lineNumber,
                    endLineStart: from.token.lineStart,
                    sm_startLineNumber: sm_startLineNumber,
                    sm_endLineNumber: sm_endLineNumber,
                    sm_startLineStart: sm_startLineStart,
                    sm_endLineStart: sm_endLineStart,
                    sm_startRange: sm_startRange,
                    sm_endRange: sm_endRange
                }, to);
            }
        } else {
            var sm_lineNumber = typeof to.token.sm_lineNumber !== 'undefined' ? to.token.sm_lineNumber : to.token.lineNumber;
            var sm_lineStart = typeof to.token.sm_lineStart !== 'undefined' ? to.token.sm_lineStart : to.token.lineStart;
            var sm_range = typeof to.token.sm_range !== 'undefined' ? to.token.sm_range : to.token.range;
            if (from.token.type === parser.Token.Delimiter) {
                next = syntaxFromToken({
                    value: to.token.value,
                    type: to.token.type,
                    lineNumber: from.token.startLineNumber,
                    lineStart: from.token.startLineStart,
                    range: from.token.startRange,
                    sm_lineNumber: sm_lineNumber,
                    sm_lineStart: sm_lineStart,
                    sm_range: sm_range
                }, to);
            } else {
                next = syntaxFromToken({
                    value: to.token.value,
                    type: to.token.type,
                    lineNumber: from.token.lineNumber,
                    lineStart: from.token.lineStart,
                    range: from.token.range,
                    sm_lineNumber: sm_lineNumber,
                    sm_lineStart: sm_lineStart,
                    sm_range: sm_range
                }, to);
            }
        }
        if (to.token.leadingComments) {
            next.token.leadingComments = to.token.leadingComments;
        }
        if (to.token.trailingComments) {
            next.token.trailingComments = to.token.trailingComments;
        }
        return next;
    }
    function reversePattern(patterns) {
        var len = patterns.length;
        var pat;
        return _.reduceRight(patterns, function (acc, pat$2) {
            if (pat$2.class === 'pattern_group') {
                pat$2.token.inner = reversePattern(pat$2.token.inner);
            }
            if (pat$2.repeat) {
                pat$2.leading = !pat$2.leading;
            }
            acc.push(pat$2);
            return acc;
        }, []);
    }
    function loadLiteralGroup(patterns) {
        _.forEach(patterns, function (patStx) {
            if (patStx.token.type === parser.Token.Delimiter) {
                patStx.token.inner = loadLiteralGroup(patStx.token.inner);
            } else {
                patStx.class = 'pattern_literal';
            }
        });
        return patterns;
    }
    function isPrimaryClass(name) {
        return [
            'expr',
            'lit',
            'ident',
            'token',
            'invoke',
            'invokeRec'
        ].indexOf(name) > -1;
    }
    function loadPattern(patterns, reverse) {
        var patts = [];
        for (var i = 0; i < patterns.length; i++) {
            var tok1 = patterns[i];
            var tok2 = patterns[i + 1];
            var tok3 = patterns[i + 2];
            var tok4 = patterns[i + 3];
            var last = patts[patts.length - 1];
            var patt;
            assert(tok1, 'Expecting syntax object');
            // Repeaters
            if (tok1.token.type === parser.Token.Delimiter && tok1.token.value === '()' && tok2 && tok2.token.type === parser.Token.Punctuator && tok2.token.value === '...' && last) {
                assert(tok1.token.inner.length === 1, 'currently assuming all separators are a single token');
                i += 1;
                last.repeat = true;
                last.separator = tok1.token.inner[0].token.value;
                continue;
            } else if (tok1.token.type === parser.Token.Punctuator && tok1.token.value === '...' && last) {
                last.repeat = true;
                last.separator = ' ';
                continue;
            } else if (isPatternVar(tok1)) {
                patt = tok1;
                if (tok2 && tok2.token.type === parser.Token.Punctuator && tok2.token.value === ':' && tok3 && tok3.token.type === parser.Token.Identifier) {
                    i += 2;
                    if (isPrimaryClass(tok3.token.value)) {
                        patt.class = tok3.token.value;
                        if (patt.class === 'invokeRec' || patt.class === 'invoke') {
                            i += 1;
                            if (tok4.token.value === '()' && tok4.token.inner.length) {
                                patt.macroName = tok4.expose().token.inner;
                            } else {
                                throwSyntaxError(patt.class, 'Expected macro parameter', tok3);
                            }
                        }
                    } else {
                        patt.class = 'invoke';
                        patt.macroName = [tok3];
                    }
                } else {
                    patt.class = 'token';
                }
            } else if (tok1.token.type === parser.Token.Identifier && tok1.token.value === '$' && tok2.token.type === parser.Token.Delimiter) {
                i += 1;
                patt = tok2;
                patt.class = 'pattern_group';
                if (patt.token.value === '[]') {
                    patt.token.inner = loadLiteralGroup(patt.token.inner);
                } else {
                    patt.token.inner = loadPattern(patt.expose().token.inner);
                }
            } else if (tok1.token.type === parser.Token.Identifier && tok1.token.value === '_') {
                patt = tok1;
                patt.class = 'wildcard';
            } else {
                patt = tok1;
                patt.class = 'pattern_literal';
                if (patt.token.inner) {
                    patt.token.inner = loadPattern(patt.expose().token.inner);
                }
            }
            // Macro classes aren't allowed in lookbehind because we wouldn't
            // know where to insert the macro, and you can't use a L->R macro
            // to match R->L.
            if (reverse && patt.macroName) {
                throwSyntaxError(patt.class, 'Not allowed in top-level lookbehind', patt.macroName[0]);
            }
            patts.push(patt);
        }
        return reverse ? reversePattern(patts) : patts;
    }
    function cachedTermMatch(stx, term) {
        var res = [];
        var i = 0;
        while (stx[i] && stx[i].term === term) {
            res.unshift(stx[i]);
            i++;
        }
        return {
            result: term,
            destructed: res,
            rest: stx.slice(res.length)
        };
    }
    function expandWithMacro(macroName, stx, env, rec) {
        var name = macroName.map(syntax.unwrapSyntax).join('');
        var ident = syntax.makeIdent(name, macroName[0]);
        var macroObj = env.get(expander.resolve(ident));
        var newContext = expander.makeExpanderContext({ env: env });
        if (!macroObj) {
            throwSyntaxError('invoke', 'Macro not in scope', macroName[0]);
        }
        var next = macroName.slice(-1).concat(stx);
        var rest, result, rt, patternEnv;
        while (macroObj && next) {
            try {
                rt = macroObj.fn(next, newContext, [], []);
                result = rt.result;
                rest = rt.rest;
                patternEnv = rt.patterns;
            } catch (e) {
                if (e instanceof syntax.SyntaxCaseError) {
                    result = null;
                    rest = stx;
                    break;
                } else {
                    throw e;
                }
            }
            if (rec && result.length >= 1) {
                var resultHead = result[0];
                var resultRest = result.slice(1);
                var nextName = expander.getName(resultHead, resultRest);
                var nextMacro = expander.getMacroInEnv(resultHead, resultRest, env);
                if (nextName && nextMacro) {
                    macroObj = nextMacro;
                    next = result.concat(rest);
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        return {
            result: result,
            rest: rest,
            patternEnv: patternEnv
        };
    }
    // (Pattern, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass(patternObj, stx, env) {
        var result, rest, match, patternEnv;
        // pattern has no parse class
        if (patternObj.class === 'token' && stx[0] && stx[0].token.type !== parser.Token.EOF) {
            result = [stx[0]];
            rest = stx.slice(1);
        } else if (patternObj.class === 'lit' && stx[0] && typeIsLiteral(stx[0].token.type)) {
            result = [stx[0]];
            rest = stx.slice(1);
        } else if (patternObj.class === 'ident' && stx[0] && stx[0].token.type === parser.Token.Identifier) {
            result = [stx[0]];
            rest = stx.slice(1);
        } else if (stx.length > 0 && patternObj.class === 'VariableStatement') {
            match = stx[0].term ? cachedTermMatch(stx, stx[0].term) : expander.enforest(stx, expander.makeExpanderContext({ env: env }));
            if (match.result && match.result.isVariableStatement) {
                result = match.destructed || match.result.destruct(false);
                rest = match.rest;
            } else {
                result = null;
                rest = stx;
            }
        } else if (stx.length > 0 && patternObj.class === 'expr') {
            match = expander.get_expression(stx, expander.makeExpanderContext({ env: env }));
            if (match.result === null || !match.result.isExpr) {
                result = null;
                rest = stx;
            } else {
                result = match.destructed || match.result.destruct(false);
                result = [syntax.makeDelim('()', result, result[0])];
                rest = match.rest;
            }
        } else if (stx.length > 0 && (patternObj.class === 'invoke' || patternObj.class === 'invokeRec')) {
            match = expandWithMacro(patternObj.macroName, stx, env, patternObj.class === 'invokeRec');
            result = match.result;
            rest = match.result ? match.rest : stx;
            patternEnv = match.patternEnv;
        } else {
            result = null;
            rest = stx;
        }
        return {
            result: result,
            rest: rest,
            patternEnv: patternEnv
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns(patterns, stx, env, topLevel) {
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
        topLevel = topLevel || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result = [];
        var patternEnv = {};
        var match;
        var pattern;
        var rest = stx;
        var success = true;
        var inLeading;
        patternLoop:
            for (var i = 0; i < patterns.length; i++) {
                if (success === false) {
                    break;
                }
                pattern = patterns[i];
                inLeading = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern.repeat && i + 1 < patterns.length) {
                        var restMatch = matchPatterns(patterns.slice(i + 1), rest, env, topLevel);
                        if (restMatch.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment
                            match = matchPattern(pattern, [], env, patternEnv, topLevel);
                            patternEnv = _.extend(restMatch.patternEnv, match.patternEnv);
                            rest = restMatch.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern.repeat && pattern.leading && pattern.separator !== ' ') {
                        if (rest[0].token.value === pattern.separator) {
                            if (!inLeading) {
                                inLeading = true;
                            }
                            rest = rest.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading) {
                                success = false;
                                break;
                            }
                        }
                    }
                    match = matchPattern(pattern, rest, env, patternEnv, topLevel);
                    if (!match.success && pattern.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match.success) {
                        success = false;
                        break;
                    }
                    rest = match.rest;
                    patternEnv = match.patternEnv;
                    if (success && !(topLevel || pattern.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i == patterns.length - 1 && rest.length !== 0) {
                            success = false;
                            break;
                        }
                    }
                    if (pattern.repeat && !pattern.leading && success) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest[0] && rest[0].token.value === pattern.separator) {
                            // more tokens and the next token matches the separator
                            rest = rest.slice(1);
                        } else if (pattern.separator !== ' ' && rest.length > 0 && i === patterns.length - 1 && topLevel === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern.repeat && success && rest.length > 0);
            }
        // If we are in a delimiter and we haven't matched all the syntax, it
        // was a failed match.
        if (!topLevel && rest.length) {
            success = false;
        }
        var result;
        if (success) {
            result = rest.length ? stx.slice(0, -rest.length) : stx;
        } else {
            result = [];
        }
        return {
            success: success,
            result: result,
            rest: rest,
            patternEnv: patternEnv
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
    function matchPattern(pattern, stx, env, patternEnv, topLevel) {
        var subMatch;
        var match, matchEnv;
        var rest;
        var success;
        if (typeof pattern.inner !== 'undefined') {
            if (pattern.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch = matchPatterns(pattern.inner, stx, env, true);
                rest = subMatch.rest;
            } else if (stx[0] && stx[0].token.type === parser.Token.Delimiter && stx[0].token.value === pattern.value) {
                stx[0].expose();
                if (pattern.inner.length === 0 && stx[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx,
                        patternEnv: patternEnv
                    };
                }
                subMatch = matchPatterns(pattern.inner, stx[0].token.inner, env, false);
                rest = stx.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx,
                    patternEnv: patternEnv
                };
            }
            success = subMatch.success;
            patternEnv = loadPatternEnv(patternEnv, subMatch.patternEnv, topLevel, pattern.repeat);
        } else {
            if (pattern.class === 'wildcard') {
                success = true;
                rest = stx.slice(1);
            } else if (pattern.class === 'pattern_literal') {
                // match the literal but don't update the pattern environment
                if (stx[0] && pattern.value === stx[0].token.value) {
                    success = true;
                    rest = stx.slice(1);
                } else {
                    success = false;
                    rest = stx;
                }
            } else {
                match = matchPatternClass(pattern, stx, env);
                success = match.result !== null;
                rest = match.rest;
                matchEnv = {
                    level: 0,
                    match: match.result,
                    topLevel: topLevel
                };
                // push the match onto this value's slot in the environment
                if (pattern.repeat) {
                    if (patternEnv[pattern.value] && success) {
                        patternEnv[pattern.value].match.push(matchEnv);
                    } else if (patternEnv[pattern.value] === undefined) {
                        // initialize if necessary
                        patternEnv[pattern.value] = {
                            level: 1,
                            match: [matchEnv],
                            topLevel: topLevel
                        };
                    }
                } else {
                    patternEnv[pattern.value] = matchEnv;
                }
                patternEnv = loadPatternEnv(patternEnv, match.patternEnv, topLevel, pattern.repeat, pattern.value);
            }
        }
        return {
            success: success,
            rest: rest,
            patternEnv: patternEnv
        };
    }
    function loadPatternEnv(toEnv, fromEnv, topLevel, repeat, prefix) {
        prefix = prefix || '';
        _.forEach(fromEnv, function (patternVal, patternKey) {
            var patternName = prefix + patternKey;
            if (repeat) {
                var nextLevel = patternVal.level + 1;
                if (toEnv[patternName]) {
                    toEnv[patternName].level = nextLevel;
                    toEnv[patternName].match.push(patternVal);
                } else {
                    toEnv[patternName] = {
                        level: nextLevel,
                        match: [patternVal],
                        topLevel: topLevel
                    };
                }
            } else {
                toEnv[patternName] = patternVal;
            }
        });
        return toEnv;
    }
    function matchLookbehind(patterns, stx, terms, env) {
        var success, patternEnv, prevStx, prevTerms;
        // No lookbehind, noop.
        if (!patterns.length) {
            success = true;
            patternEnv = {};
            prevStx = stx;
            prevTerms = terms;
        } else {
            var match = matchPatterns(patterns, stx, env, true);
            var last = match.result[match.result.length - 1];
            success = match.success;
            patternEnv = match.patternEnv;
            if (success) {
                if (match.rest.length) {
                    if (last && last.term && last.term === match.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success = false;
                    } else {
                        prevStx = match.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i = 0, len = terms.length; i < len; i++) {
                            if (terms[i] === prevStx[0].term) {
                                prevTerms = terms.slice(i);
                                break;
                            }
                        }
                        assert(prevTerms, 'No matching previous term found');
                    }
                } else {
                    prevTerms = [];
                    prevStx = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _.forEach(patternEnv, function (val, key) {
            if (val.level && val.match && val.topLevel) {
                val.match.reverse();
            }
        });
        return {
            success: success,
            patternEnv: patternEnv,
            prevStx: prevStx,
            prevTerms: prevTerms
        };
    }
    function hasMatch(m) {
        if (m.level === 0) {
            return m.match.length > 0;
        }
        return m.match.every(function (m$2) {
            return hasMatch(m$2);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe(macroBody, macroNameStx, env) {
        return _.chain(macroBody).reduce(function (acc, bodyStx, idx, original) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last = original[idx - 1];
            var next = original[idx + 1];
            var nextNext = original[idx + 2];
            // drop `...`
            if (bodyStx.token.value === '...') {
                return acc;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator(bodyStx) && next && next.token.value === '...') {
                return acc;
            }
            // skip the $ in $(...)
            if (bodyStx.token.value === '$' && next && next.token.type === parser.Token.Delimiter && next.token.value === '()') {
                return acc;
            }
            // mark $[...] as a literal
            if (bodyStx.token.value === '$' && next && next.token.type === parser.Token.Delimiter && next.token.value === '[]') {
                next.literal = true;
                return acc;
            }
            if (bodyStx.token.type === parser.Token.Delimiter && bodyStx.token.value === '()' && last && last.token.value === '$') {
                bodyStx.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx.literal === true) {
                assert(bodyStx.token.type === parser.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc.concat(bodyStx.token.inner);
            }
            if (next && next.token.value === '...') {
                bodyStx.repeat = true;
                bodyStx.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator(next) && nextNext && nextNext.token.value === '...') {
                bodyStx.repeat = true;
                bodyStx.separator = next.token.inner[0].token.value;
            }
            acc.push(bodyStx);
            return acc;
        }, []).reduce(function (acc, bodyStx, idx) {
            // then do the actual transcription
            if (bodyStx.repeat) {
                if (bodyStx.token.type === parser.Token.Delimiter) {
                    bodyStx.expose();
                    var fv = _.filter(freeVarsInPattern(bodyStx.token.inner), function (pat) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env.hasOwnProperty(pat);
                        });
                    var restrictedEnv = [];
                    var nonScalar = _.find(fv, function (pat) {
                            return env[pat].level > 0;
                        });
                    assert(typeof nonScalar !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength = env[nonScalar].match.length;
                    var sameLength = _.all(fv, function (pat) {
                            return env[pat].level === 0 || env[pat].match.length === repeatLength;
                        });
                    assert(sameLength, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _.each(_.range(repeatLength), function (idx$2) {
                        var renv = {};
                        _.each(fv, function (pat) {
                            if (env[pat].level === 0) {
                                // copy scalars over
                                renv[pat] = env[pat];
                            } else {
                                // grab the match at this index
                                renv[pat] = env[pat].match[idx$2];
                            }
                        });
                        var allHaveMatch = Object.keys(renv).every(function (pat) {
                                return hasMatch(renv[pat]);
                            });
                        if (allHaveMatch) {
                            restrictedEnv.push(renv);
                        }
                    });
                    var transcribed = _.map(restrictedEnv, function (renv) {
                            if (bodyStx.group) {
                                return transcribe(bodyStx.token.inner, macroNameStx, renv);
                            } else {
                                var newBody$2 = syntaxFromToken(_.clone(bodyStx.token), bodyStx);
                                newBody$2.token.inner = transcribe(bodyStx.token.inner, macroNameStx, renv);
                                return newBody$2;
                            }
                        });
                    var joined;
                    if (bodyStx.group) {
                        joined = joinSyntaxArray(transcribed, bodyStx.separator);
                    } else {
                        joined = joinSyntax(transcribed, bodyStx.separator);
                    }
                    push.apply(acc, joined);
                    return acc;
                }
                if (!env[bodyStx.token.value]) {
                    throwSyntaxError('patterns', 'The pattern variable is not bound for the template', bodyStx);
                } else if (env[bodyStx.token.value].level !== 1) {
                    throwSyntaxError('patterns', 'Ellipses level does not match in the template', bodyStx);
                }
                push.apply(acc, joinRepeatedMatch(env[bodyStx.token.value].match, bodyStx.separator));
                return acc;
            } else {
                if (bodyStx.token.type === parser.Token.Delimiter) {
                    bodyStx.expose();
                    var newBody = syntaxFromToken(_.clone(bodyStx.token), macroBody);
                    newBody.token.inner = transcribe(bodyStx.token.inner, macroNameStx, env);
                    acc.push(newBody);
                    return acc;
                }
                if (isPatternVar(bodyStx) && Object.prototype.hasOwnProperty.bind(env)(bodyStx.token.value)) {
                    if (!env[bodyStx.token.value]) {
                        throwSyntaxError('patterns', 'The pattern variable is not bound for the template', bodyStx);
                    } else if (env[bodyStx.token.value].level !== 0) {
                        throwSyntaxError('patterns', 'Ellipses level does not match in the template', bodyStx);
                    }
                    push.apply(acc, takeLineContext(bodyStx, env[bodyStx.token.value].match));
                    return acc;
                }
                acc.push(syntaxFromToken(_.clone(bodyStx.token), bodyStx));
                return acc;
            }
        }, []).value();
    }
    function cloneMatch(oldMatch) {
        var newMatch = {
                success: oldMatch.success,
                rest: oldMatch.rest,
                patternEnv: {}
            };
        for (var pat in oldMatch.patternEnv) {
            if (oldMatch.patternEnv.hasOwnProperty(pat)) {
                newMatch.patternEnv[pat] = oldMatch.patternEnv[pat];
            }
        }
        return newMatch;
    }
    function makeIdentityRule(pattern, isInfix) {
        var _s = 1;
        function traverse(s, infix) {
            var pat = [];
            var stx = [];
            for (var i = 0; i < s.length; i++) {
                var tok1 = s[i];
                var tok2 = s[i + 1];
                var tok3 = s[i + 2];
                var tok4 = s[i + 3];
                // Pattern vars, ignore classes
                if (isPatternVar(tok1)) {
                    pat.push(tok1);
                    stx.push(tok1);
                    if (tok2 && tok2.token.type === parser.Token.Punctuator && tok2.token.value === ':' && tok3 && tok3.token.type === parser.Token.Identifier) {
                        pat.push(tok2, tok3);
                        i += 2;
                        if (tok3.token.value === 'invoke' || tok3.token.value === 'invokeRec' && tok4) {
                            pat.push(tok4);
                            i += 1;
                        }
                    }
                } else if (tok1.token.type === parser.Token.Identifier && tok1.token.value === '_') {
                    var uident = syntax.makeIdent('$__wildcard' + _s++, tok1);
                    pat.push(uident);
                    stx.push(uident);
                } else if (tok1.token.type === parser.Token.Identifier && tok1.token.value === '$' && tok2 && tok2.token.type === parser.Token.Delimiter && tok2.token.value === '[]') {
                    pat.push(tok1, tok2);
                    stx.push(tok1, tok2);
                    i += 1;
                } else if (tok1.token.type === parser.Token.Delimiter) {
                    var sub = traverse(tok1.token.inner, false);
                    var clone = syntaxFromToken(_.clone(tok1.token), tok1);
                    tok1.token.inner = sub.pattern;
                    clone.token.inner = sub.body;
                    pat.push(tok1);
                    stx.push(clone);
                } else if (infix && tok1.token.type === parser.Token.Punctuator && tok1.token.value === '|') {
                    infix = false;
                    pat.push(tok1);
                } else {
                    pat.push(tok1);
                    stx.push(tok1);
                }
            }
            return {
                pattern: pat,
                body: stx
            };
        }
        return traverse(pattern, isInfix);
    }
    exports$2.loadPattern = loadPattern;
    exports$2.matchPatterns = matchPatterns;
    exports$2.matchLookbehind = matchLookbehind;
    exports$2.transcribe = transcribe;
    exports$2.matchPatternClass = matchPatternClass;
    exports$2.takeLineContext = takeLineContext;
    exports$2.takeLine = takeLine;
    exports$2.typeIsLiteral = typeIsLiteral;
    exports$2.cloneMatch = cloneMatch;
    exports$2.makeIdentityRule = makeIdentityRule;
}));
//# sourceMappingURL=patterns.js.map