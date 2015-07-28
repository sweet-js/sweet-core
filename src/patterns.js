(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'),
                require("./parser"), require("./expander"), require("./syntax"));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'underscore',
                'parser', 'expander', 'syntax'], factory);
    }
}(this, function(exports, _, parser, expander, syntax) {

    var get_expression = expander.get_expression;
    var syntaxFromToken = syntax.syntaxFromToken;
    var makePunc = syntax.makePunc;
    var makeIdent = syntax.makeIdent;
    var makeDelim = syntax.makeDelim;
    var joinSyntax = syntax.joinSyntax;
    var joinSyntaxArray = syntax.joinSyntaxArray;
    var cloneSyntax = syntax.cloneSyntax;
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


    function typeIsLiteral (type) {
        return type === parser.Token.NullLiteral ||
               type === parser.Token.NumericLiteral ||
               type === parser.Token.StringLiteral ||
               type === parser.Token.RegexLiteral ||
               type === parser.Token.BooleanLiteral;
    }

    function containsPatternVar(patterns) {
        return _.any(patterns, function(pat) {
            if (pat.token.type === parser.Token.Delimiter) {
                return containsPatternVar(pat.token.inner);
            }
            return isPatternVar(pat);
        });
    }

    function delimIsSeparator(delim) {
        return (delim && delim.token && delim.token.type === parser.Token.Delimiter &&
                delim.token.value === "()" &&
                delim.token.inner.length === 1 &&
                delim.token.inner[0].token.type !== parser.Token.Delimiter &&
                !containsPatternVar(delim.token.inner));
    }

    function isPatternVar(stx) {
        return stx.token.value[0] === "$" && stx.token.value !== "$";
    }


    // ([...{level: Num, match: [...CSyntax]}], Syntax) -> [...CSyntax]
    function joinRepeatedMatch(tojoin, punc) {
        return _.reduce(_.rest(tojoin, 1), function(acc, join) {
            if (punc === " ") {
                return acc.concat(cloneSyntaxArray(join.match));
            }
            return acc.concat(cloneSyntax(punc),
                              cloneSyntaxArray(join.match));
        }, cloneSyntaxArray(_.first(tojoin).match));
    }

    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext(from, to) {
        return _.map(to, function(stx) {
            return takeLine(from, stx);
        });
    }

    // (CSyntax, CSyntax) -> CSyntax
    function takeLine(from, to) {
        var next = to.clone();
        if (to.token.type === parser.Token.Delimiter) {
            var sm_startLineNumber = typeof to.token.sm_startLineNumber !== 'undefined'
                                        ? to.token.sm_startLineNumber : to.token.startLineNumber;
            var sm_endLineNumber = typeof to.token.sm_endLineNumber !== 'undefined'
                                        ? to.token.sm_endLineNumber : to.token.endLineNumber;
            var sm_startLineStart = typeof to.token.sm_startLineStart !== 'undefined'
                                        ? to.token.sm_startLineStart : to.token.startLineStart;
            var sm_endLineStart = typeof to.token.sm_endLineStart !== 'undefined'
                                        ? to.token.sm_endLineStart : to.token.endLineStart;
            var sm_startRange = typeof to.token.sm_startRange !== 'undefined'
                                        ? to.token.sm_startRange : to.token.startRange;
            var sm_endRange = typeof to.token.sm_endRange !== 'undefined'
                                        ? to.token.sm_endRange : to.token.endRange;

            next.token.sm_startLineNumber = sm_startLineNumber;
            next.token.sm_startLineStart = sm_startLineStart;
            next.token.sm_endLineNumber = sm_endLineNumber;
            next.token.sm_endLineStart = sm_endLineStart;
            next.token.sm_startRange = sm_startRange;
            next.token.sm_endRange = sm_endRange;

            if (from.token.type === parser.Token.Delimiter) {
                next.token.startRange = from.token.startRange;
                next.token.endRange = from.token.endRange;
                next.token.startLineNumber = from.token.startLineNumber;
                next.token.startLineStart = from.token.startLineStart;
                next.token.endLineNumber = from.token.endLineNumber;
                next.token.endLineStart = from.token.endLineStart;
            } else {
                next.token.startRange = from.token.range;
                next.token.endRange = from.token.range;
                next.token.startLineNumber = from.token.lineNumber;
                next.token.startLineStart = from.token.lineStart;
                next.token.endLineNumber = from.token.lineNumber;
                next.token.endLineStart = from.token.lineStart;
            }
        } else {
            var sm_lineNumber = typeof to.token.sm_lineNumber !== 'undefined'
                                        ? to.token.sm_lineNumber : to.token.lineNumber;
            var sm_lineStart = typeof to.token.sm_lineStart !== 'undefined'
                                        ? to.token.sm_lineStart : to.token.lineStart;
            var sm_range = typeof to.token.sm_range !== 'undefined'
                                        ? to.token.sm_range : to.token.range;
            next.token.sm_lineNumber = sm_lineNumber;
            next.token.sm_lineStart = sm_lineStart;
            next.token.sm_range = sm_range;

            if (from.token.type === parser.Token.Delimiter) {
                next.token.lineNumber = from.token.startLineNumber;
                next.token.lineStart = from.token.startLineStart;
                next.token.range = from.token.startRange;
            } else {
                next.token.lineNumber = from.token.lineNumber;
                next.token.lineStart = from.token.lineStart;
                next.token.range = from.token.range;
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
        return _.reduceRight(patterns, function(acc, pat) {
            if (pat.class === "pattern_group" || pat.class === "named_group") {
                pat.inner = reversePattern(pat.inner);
            }
            if (pat.repeat) {
                pat.leading = !pat.leading;
            }
            acc.push(pat);
            return acc;
        }, []);
    }

    function loadLiteralGroup(patterns) {
        return patterns.map(function(patStx) {
            var pat = patternToObject(patStx);
            if (pat.inner) {
                pat.inner = loadLiteralGroup(pat.inner);
            } else {
                pat.class = "pattern_literal";
            }
            return pat;
        });
    }

    function patternToObject(pat) {
        var obj = {
            type: pat.token.type,
            value: pat.token.value
        };
        if (pat.token.inner) {
            obj.inner = pat.token.inner;
        }
        return obj;
    }

    function isPrimaryClass(name) {
        return ['expr', 'lit', 'ident', 'token', 'invoke', 'invokeRec'].indexOf(name) > -1;
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

            assert(tok1, "Expecting syntax object");

            // Repeaters
            if (tok1.token.type === parser.Token.Delimiter &&
                tok1.token.value === "()" &&
                tok2 && tok2.token.type === parser.Token.Punctuator &&
                tok2.token.value === "..." && last) {

                assert(tok1.token.inner.length === 1,
                       "currently assuming all separators are a single token");

                i += 1;
                last.repeat = true;
                last.separator = tok1.token.inner[0];
                continue;

            } else if (tok1.token.type === parser.Token.Punctuator &&
                       tok1.token.value === "..." && last) {
                last.repeat = true;
                last.separator = " ";
                continue;

            } else if (isPatternVar(tok1)) {
                patt = patternToObject(tok1);

                if (tok2 && tok2.token.type === parser.Token.Punctuator &&
                    tok2.token.value === ":" &&
                    tok3 && (tok3.token.type === parser.Token.Identifier ||
                             tok3.token.type === parser.Token.Delimiter &&
                             (tok3.token.value === '[]' ||
                              tok3.token.value === '()'))) {

                    i += 2;
                    if (tok3.token.value === '[]') {
                        patt.class = "named_group";
                        patt.inner = loadLiteralGroup(tok3.expose().token.inner);
                    } else if (tok3.token.value === '()') {
                        patt.class = "named_group";
                        patt.inner = loadPattern(tok3.expose().token.inner);
                    } else if (isPrimaryClass(tok3.token.value)) {
                        patt.class = tok3.token.value;
                        if (patt.class === "invokeRec" || patt.class === "invoke") {
                            i += 1;
                            if (tok4.token.value === "()" && tok4.token.inner.length) {
                                patt.macroName = tok4.expose().token.inner;
                            } else {
                                throwSyntaxError(patt.class, "Expected macro parameter", tok3);
                            }
                        }
                    } else {
                        patt.class = "invoke";
                        patt.macroName = [tok3];
                    }
                } else {
                    patt.class = "token";
                }
            } else if (tok1.token.type === parser.Token.Identifier &&
                       tok1.token.value === "$" &&
                       tok2.token.type === parser.Token.Delimiter) {
                i += 1;
                patt = patternToObject(tok2);
                patt.class = "pattern_group";

                if (patt.value === "[]") {
                    patt.inner = loadLiteralGroup(patt.inner);
                } else {
                    patt.inner = loadPattern(tok2.expose().token.inner);
                }
            } else if (tok1.token.type === parser.Token.Identifier &&
                       tok1.token.value === "_") {
                patt = patternToObject(tok1);
                patt.class = "wildcard";
            } else {
                patt = patternToObject(tok1);
                patt.class = "pattern_literal";

                if (patt.inner) {
                    patt.inner = loadPattern(tok1.expose().token.inner);
                }
            }

            // Macro classes aren't allowed in lookbehind because we wouldn't
            // know where to insert the macro, and you can't use a L->R macro
            // to match R->L.
            if (reverse && patt.macroName) {
                throwSyntaxError(patt.class, "Not allowed in top-level lookbehind", patt.macroName[0]);
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

    function expandWithMacro(macroName, stx, context, rec) {
        var name = macroName.map(syntax.unwrapSyntax).join("");
        var ident = syntax.makeIdent(name, macroName[0]);
        var macroObj = context.env.get(expander.resolve(ident));
        var newContext = expander.makeExpanderContext(context);

        if (!macroObj) {
            throwSyntaxError("invoke", "Macro not in scope", macroName[0]);
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
                var nextMacro = expander.getMacroInEnv(resultHead, resultRest, context.env);

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
    function matchPatternClass (patternObj, stx, context) {
        var result, rest, match, patternEnv;
        // pattern has no parse class
        if (patternObj.class === "token" &&
            stx[0] && stx[0].token.type !== parser.Token.EOF) {
            result = [stx[0]];
            rest = stx.slice(1);
        } else if (patternObj.class === "lit" &&
                   stx[0] && typeIsLiteral(stx[0].token.type)) {
            result = [stx[0]];
            rest = stx.slice(1);
        } else if (patternObj.class === "ident" &&
                   stx[0] && stx[0].token.type === parser.Token.Identifier) {
            result = [stx[0]];
            rest = stx.slice(1);
        } else if (stx.length > 0 && patternObj.class === "VariableStatement") {
            match = stx[0].term
                ? cachedTermMatch(stx, stx[0].term)
                : expander.enforest(stx, expander.makeExpanderContext(context));
            if (match.result && match.result.isVariableStatement) {
                result = match.destructed || match.result.destruct(false);
                rest = match.rest;
            } else {
                result = null;
                rest = stx;
            }
        } else if (stx.length > 0 && patternObj.class === "expr") {
            match = expander.get_expression(stx, expander.makeExpanderContext(context));
            if (match.result === null || !match.result.isExpr) {
                result = null;
                rest = stx;
            } else {
                result = match.destructed || match.result.destruct(false);
                result = [syntax.makeDelim("()", result, result[0])];
                rest = match.rest;
            }
        } else if (patternObj.class === "invoke" ||
                   patternObj.class === "invokeRec") {
            match = expandWithMacro(patternObj.macroName, stx, context,
                                    patternObj.class === "invokeRec");
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
    function matchPatterns(patterns, stx, context, topLevel, patternEnv) {
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
        patternEnv = patternEnv || {};

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
                    var restMatch = matchPatterns(patterns.slice(i+1), rest, context, topLevel);
                    if (restMatch.success) {
                        // match the repeat pattern on the empty array to fill in its
                        // pattern variable in the environment
                        match = matchPattern(pattern, [], context, patternEnv, topLevel);
                        patternEnv = _.extend(restMatch.patternEnv, match.patternEnv);
                        rest = restMatch.rest;
                        break patternLoop;
                    }
                }
                if (pattern.repeat && pattern.leading && pattern.separator !== " ") {
                    if (rest[0].token.value === pattern.separator.token.value) {
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
                match = matchPattern(pattern, rest, context, patternEnv, topLevel);
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
                    if (i == (patterns.length - 1) && rest.length !== 0) {
                        success = false;
                        break;
                    }
                }

                if (pattern.repeat && !pattern.leading && success) {
                    if (pattern.separator === " ") {
                        // no separator specified (using the empty string for this)
                        // so keep going
                        continue;
                    } else if (rest[0] && rest[0].token.value === pattern.separator.token.value) {
                        // more tokens and the next token matches the separator
                        rest = rest.slice(1);
                    } else if ((pattern.separator !== " ") &&
                                (rest.length > 0) &&
                                (i === patterns.length - 1) &&
                                topLevel === false) {
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
            // Closing up a repeat, so clear all open vars in environment
            var newPatternEnv = {};
            loadPatternEnv(newPatternEnv, patternEnv, topLevel);
            patternEnv = newPatternEnv;
        }

        // If we are in a delimiter and we haven't matched all the syntax, it
        // was a failed match.
        if (!topLevel && rest.length) {
            success = false;
        }

        var result;
        if (success) {
            result = rest.length ? stx.slice(0, -rest.length): stx;
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

    function initPatternEnv(pattern) {
        var env = {};
        assert(Array.isArray(pattern.inner), "expecting an array of patterns");

        for (var i = 0; i < pattern.inner.length; i++) {
            env[pattern.inner[i].value] = {
                level: 0,
                match: [],
                topLevel: false
            };
        }
        return env;
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
    function matchPattern(pattern, stx, context, patternEnv, topLevel) {
        var subMatch;
        var match, matchEnv;
        var rest;
        var success;

        if (typeof pattern.inner !== 'undefined') {
            if (pattern.class === "pattern_group") {
                // pattern groups don't match the delimiters
                subMatch = matchPatterns(pattern.inner, stx, context, true);
                rest = subMatch.rest;
                success = subMatch.success;
            } else if (pattern.class === "named_group") {
                subMatch = matchPatterns(pattern.inner, stx, context, true);
                rest = subMatch.rest;
                success = subMatch.success;
                if (success) {
                    var namedMatch = {};
                    namedMatch[pattern.value] = {
                        level: 0,
                        match: subMatch.result,
                        topLevel: topLevel
                    };
                    var env = loadPatternEnv(namedMatch,
                                             subMatch.patternEnv,
                                             topLevel,
                                             false,
                                             pattern.value);
                    if (env) {
                        subMatch.patternEnv = env;
                    } else {
                        success = false;
                    }
                }
            } else if (stx[0] && stx[0].token.type === parser.Token.Delimiter &&
                       stx[0].token.value === pattern.value) {
                stx[0].expose();
                if (pattern.inner.length === 0 && stx[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx,
                        patternEnv: patternEnv
                    };
                }
                subMatch = matchPatterns(pattern.inner,
                                         stx[0].token.inner,
                                         context,
                                         false);
                rest = stx.slice(1);
                success = subMatch.success;
            } else {
                // token is not a delimiter
                success = false;
                rest = stx;
                // match failed but we need to initialize each sub pattern to an empty match
                subMatch = {
                    patternEnv: initPatternEnv(pattern)
                };
            }
            if (success) {
                success = !!loadPatternEnv(patternEnv,
                                           subMatch.patternEnv,
                                           topLevel,
                                           pattern.repeat);
            }
            if (!success && pattern.repeat) {
                patternEnv = copyPatternEnv(patternEnv,
                                            subMatch.patternEnv,
                                            topLevel);
            }
        } else {
            if (pattern.class === "wildcard") {
                success = true;
                rest = stx.slice(1);
            } else if (pattern.class === "pattern_literal") {
                // match the literal but don't update the pattern environment
                if (stx[0] && pattern.value === stx[0].token.value) {
                    success = true;
                    rest = stx.slice(1);
                } else {
                    success = false;
                    rest = stx;
                }
            } else if (patternEnv[pattern.value] &&
                       patternEnv[pattern.value].match &&
                       patternEnv[pattern.value].level === 0) {
                var prev = patternEnv[pattern.value].match;
                while (prev.length === 1 && pattern.class === "expr" &&
                    prev[0].token.type === parser.Token.Delimiter &&
                    prev[0].token.value === "()") {
                    prev = prev[0].token.inner;
                }
                match = matchPatterns(loadPattern(prev), stx, context, true);
                success = match.success;
                rest = match.rest;
            } else {
                match = matchPatternClass(pattern, stx, context);
                success = match.result !== null;
                rest = match.rest;
                matchEnv = {
                    level: 0,
                    match: match.result,
                    topLevel: topLevel
                };

                // push the match onto this value's slot in the environment
                if (pattern.repeat) {
                    if (patternEnv[pattern.value] &&
                        patternEnv[pattern.value].level !== 1) {
                        success = false;
                    } else if (patternEnv[pattern.value] &&
                        patternEnv[pattern.value].match && success) {
                        patternEnv[pattern.value].match.push(matchEnv);
                    } else if (patternEnv[pattern.value] === undefined ||
                               patternEnv[pattern.value].match === undefined){
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

                success = success && !!loadPatternEnv(patternEnv,
                                                      match.patternEnv,
                                                      topLevel,
                                                      pattern.repeat,
                                                      pattern.value);
            }
        }
        return {
            success: success,
            rest: rest,
            patternEnv: patternEnv
        };

    }

    function copyPatternEnv(toEnv, fromEnv, topLevel) {
        _.forEach(fromEnv, function(patternVal, patternKey) {
            if (!toEnv[patternKey] || !toEnv[patternKey].match) {
                toEnv[patternKey] = {
                    level: patternVal.level + 1,
                    match: [patternVal],
                    topLevel: topLevel
                };
            }
        });
        return toEnv;
    }

    // Returns true if the two patternEnv match objects are equivalent
    function isEquivPatternEnvToken(toToken, fromToken) {
        if (!toToken) return;
        if (fromToken.type !== toToken.type) return;
        if (fromToken.type === parser.Token.EOF) return true;
        if (fromToken.value !== toToken.value) return;
        if (fromToken.type !== parser.Token.Delimiter) return true;
        if (fromToken.inner.length !== toToken.inner.length) return;
        for (var i = 0; i < fromToken.inner.length; i++) {
            if (!isEquivPatternEnvToken(fromToken.inner[i].token,
                                             toToken.inner[i].token)) {
                return;
            }
        }
        return true;
    }

    // Returns true if the two patternEnv match objects are equivalent
    function isEquivPatternEnvMatch(toMatch, fromMatch) {
        if (fromMatch.token) return isEquivPatternEnvToken(toMatch.token, fromMatch.token);

        // can never match a token with a group
        if (fromMatch.level < toMatch.level) return;
        if (fromMatch.level > toMatch.level) {
            // match a group with a token if all members are compatible
            for (var i = 0; i < fromMatch.match.length; i++) {
                if (!isEquivPatternEnvMatch(toMatch, fromMatch.match[i])) {
                    return;
                }
            }
        } else {
            // match a group with a group by element-wise comparison
            // (special case for uninitialized match
            if (!toMatch.match) return true;
            // (special case for empty match resulting from zero repitition)
            if (fromMatch.match.length > 0 &&
                fromMatch.match.length !== toMatch.match.length) return;
            for (var i = 0; i < fromMatch.match.length; i++) {
                if (!isEquivPatternEnvMatch(toMatch.match[i], fromMatch.match[i])) {
                    return;
                }
            }
        }
        return true;
    }

    // Returns true if the pattern environments are compatible
    function isEquivPatternEnv(toEnv, fromEnv, repeat, prefix) {
        return _.all(fromEnv, function(patternVal, patternKey) {
            var patternName = prefix + patternKey;
            if (!_.has(toEnv, patternName)) return true;
            var fromVal = patternVal;
            if (repeat) {
                var nextLevel = patternVal.level + 1;
                // if repeat and also toEnv.repeat then you just
                // compare levels
                if(toEnv[patternName].repeat) {
                    return toEnv[patternName].level === nextLevel;
                }
                fromVal = {
                    level: nextLevel,
                    match: [patternVal]
                }
            }
            return isEquivPatternEnvMatch(toEnv[patternName], fromVal);
        });
    }

    // flattens the match by one level
    function decreaseLevel(match) {
        return match.length === 0 ? [] : match[0].match;
        // we know isEquivPatternEnv is true, so no need to check anything
        // (this comment has to be below the return due to bug #464)
    }

    // Returns a pattern environment or null if incompatible
    function loadPatternEnv(toEnv, fromEnv, topLevel, repeat, prefix) {
        prefix = prefix || '';
        toEnv = toEnv || {};
        if (!isEquivPatternEnv(toEnv, fromEnv, repeat, prefix)) return;
        _.forEach(fromEnv, function(patternVal, patternKey) {
            var patternName = prefix + patternKey;
            if (repeat) {
                var nextLevel = patternVal.level + 1;
                if (toEnv[patternName] && toEnv[patternName].match) {
                    if (toEnv[patternName].repeat) {
                        toEnv[patternName].match.push(patternVal);
                    }
                } else {
                    var match = [patternVal];
                    var repMatch = true;
                    if (toEnv[patternName]) {
                        while (match.length > 0 &&
                               nextLevel > toEnv[patternName].level) {
                            match = decreaseLevel(match);
                            nextLevel--;
                            repMatch = false;
                        }
                    }
                    toEnv[patternName] = {
                        level: nextLevel,
                        match: match,
                        topLevel: topLevel,
                        // if there was a prior uninitialized match with a
                        // lower level, then this is not just a repitition
                        repeat: repMatch
                    };
                }
            } else {
                delete patternVal.repeat;
                toEnv[patternName] = patternVal;
            }
        });
        return toEnv;
    }

    function matchLookbehind(patterns, stx, terms, context) {
        var success, patternEnv, prevStx, prevTerms;
        // No lookbehind, noop.
        if (!patterns.length) {
            success = true;
            patternEnv = {};
            prevStx = stx;
            prevTerms = terms;
        } else {
            var match = matchPatterns(patterns, stx, context, true);
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
                        assert(prevTerms, "No matching previous term found");
                    }
                } else {
                    prevTerms = [];
                    prevStx = [];
                }
            }
        }

        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _.forEach(patternEnv, function(val, key) {
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
        return !!m.match;
    }

    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe(macroBody, macroNameStx, env) {

        return _.chain(macroBody)
            .reduce(function(acc, bodyStx, idx, original) {
                    // first find the ellipses and mark the syntax objects
                    // (note that this step does not eagerly go into delimiter bodies)
                    var last = original[idx-1];
                    var next = original[idx+1];
                    var nextNext = original[idx+2];

                   // drop `...`
                    if (bodyStx.token.value === "...") {
                        return acc;
                    }
                    // drop `(<separator)` when followed by an ellipse
                    if (delimIsSeparator(bodyStx) &&
                        next && next.token.value === "...") {
                        return acc;
                    }

                    // skip the $ in $(...)
                    if (bodyStx.token.value === "$" &&
                        next && next.token.type === parser.Token.Delimiter &&
                        next.token.value === "()") {

                        return acc;
                    }

                    // mark $[...] as a literal
                    if (bodyStx.token.value === "$" &&
                        next && next.token.type === parser.Token.Delimiter &&
                        next.token.value === "[]") {

                        next.literal = true;
                        return acc;
                    }

                    if (bodyStx.token.type === parser.Token.Delimiter &&
                        bodyStx.token.value === "()" &&
                        last && last.token.value === "$") {

                        bodyStx.group = true;
                    }

                    // literal [] delimiters have their bodies just
                    // directly passed along
                    if (bodyStx.literal === true) {
                        assert(bodyStx.token.type === parser.Token.Delimiter,
                                        "expecting a literal to be surrounded by []");
                        return acc.concat(bodyStx.token.inner);
                    }

                    if (next && next.token.value === "...") {
                        bodyStx.repeat = true;
                        bodyStx.separator = " "; // default to space separated
                    } else if (delimIsSeparator(next) &&
                               nextNext && nextNext.token.value === "...") {
                        bodyStx.repeat = true;
                        bodyStx.separator = next.token.inner[0];
                    }

                    acc.push(bodyStx);
                    return acc;
                }, []).reduce(function(acc, bodyStx, idx) {
                // then do the actual transcription
                if (bodyStx.repeat) {
                    if (bodyStx.token.type === parser.Token.Delimiter) {
                        bodyStx.expose();

                        var fv = _.filter(freeVarsInPattern(bodyStx.token.inner),
                                          function(pat) {
                                              // ignore "patterns"
                                              // that aren't in the
                                              // environment (treat
                                              // them like literals)
                                              return env.hasOwnProperty(pat);
                                          });
                        var restrictedEnv = [];
                        var nonScalar = _.find(fv, function(pat) {
                            return env[pat].level > 0;
                        });

                        assert(typeof nonScalar !== 'undefined',
                                      "must have a least one non-scalar in repeat");

                        var repeatLength = env[nonScalar].match.length;
                        var sameLength = _.all(fv, function(pat) {
                            return (env[pat].level === 0) ||
                                (env[pat].match.length === repeatLength);
                        });
                        assert(sameLength,
                                      "all non-scalars must have the same length");

                        // create a list of envs restricted to the free vars
                        _.each(_.range(repeatLength), function(idx) {
                            var renv = {};
                            _.each(fv, function(pat) {
                                if (env[pat].level === 0) {
                                    // copy scalars over
                                    renv[pat] = env[pat];
                                } else {
                                    // grab the match at this index
                                    renv[pat] = env[pat].match[idx];
                                }
                            });
                            var allHaveMatch = Object.keys(renv).every(function(pat) {
                                return hasMatch(renv[pat]);
                            });
                            if (allHaveMatch) {
                                restrictedEnv.push(renv);
                            }
                        });

                        var transcribed = _.map(restrictedEnv, function(renv) {
                            if (bodyStx.group) {
                                return transcribe(bodyStx.token.inner,
                                                  macroNameStx,
                                                  renv);
                            } else {
                                var newBody = syntaxFromToken(_.clone(bodyStx.token),
                                                              bodyStx);
                                newBody.token.inner = transcribe(bodyStx.token.inner,
                                                                 macroNameStx,
                                                                 renv);
                                return newBody;
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
                        throwSyntaxError("patterns", "The pattern variable is not bound for the template", bodyStx);
                    } else if (env[bodyStx.token.value].level !== 1) {
                        throwSyntaxError("patterns", "Ellipses level does not match in the template", bodyStx);
                    }
                    push.apply(acc, joinRepeatedMatch(env[bodyStx.token.value].match,
                                                      bodyStx.separator));
                    return acc;
                } else {
                    if (bodyStx.token.type === parser.Token.Delimiter) {
                        bodyStx.expose();
                        var newBody = syntaxFromToken(_.clone(bodyStx.token),
                                                      macroBody);
                        newBody.token.inner = transcribe(bodyStx.token.inner,
                                                         macroNameStx, env);
                        acc.push(newBody);
                        return acc;
                    }
                    if (isPatternVar(bodyStx) &&
                        Object.prototype.hasOwnProperty.bind(env)(bodyStx.token.value)) {
                        if (!env[bodyStx.token.value]) {
                            throwSyntaxError("patterns", "The pattern variable is not bound for the template", bodyStx);
                        } else if (env[bodyStx.token.value].level !== 0) {
                            throwSyntaxError("patterns", "Ellipses level does not match in the template", bodyStx);
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

    function makeIdentityRule(pattern, isInfix, context) {
        var inf = [];
        var pat = [];
        var stx = [];

        if (isInfix) {
            for (var i = 0; i < pattern.length; i++) {
                if (pattern[i].token.type === parser.Token.Punctuator &&
                    pattern[i].token.value === '|') {
                    pat.push(makeIdent('$inf', context), makePunc(':', context),
                             makeDelim('()', inf, context), pattern[0],
                             makeIdent('$id', context), makePunc(':', context),
                             makeDelim('()', pat.slice(i + 1), context));
                    stx.push(makeIdent('$inf', context),
                             makeIdent('$id', context));
                    break;
                }
                inf.push(pattern[i]);
            }
        } else {
            pat.push(makeIdent('$id', context), makePunc(':', context),
                     makeDelim('()', pattern, context));
            stx.push(makeIdent('$id', context));
        }

        return {
            pattern: pat,
            body: stx
        };
    }

    exports.loadPattern = loadPattern;
    exports.matchPatterns = matchPatterns;
    exports.matchLookbehind = matchLookbehind;
    exports.transcribe = transcribe;
    exports.matchPatternClass = matchPatternClass;
    exports.takeLineContext = takeLineContext;
    exports.takeLine = takeLine;
    exports.typeIsLiteral = typeIsLiteral;
    exports.cloneMatch = cloneMatch;
    exports.makeIdentityRule = makeIdentityRule;
    exports.isEquivPatternEnvToken = isEquivPatternEnvToken;
}))
