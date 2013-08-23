(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require("es6-collections"), require('contracts-js'), require("./parser"), require("./expander"));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'underscore', 'es6-collections', 'contracts-js', 'parser', 'expander'], factory);
    }
}(this, function(exports, _, es6, contracts, parser, expander) {

    var get_expression = expander.get_expression;

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

    function loadPattern(patterns) {

        return _.chain(patterns)
        // first pass to merge the pattern variables together
            .reduce(function(acc, patStx, idx) {
                var last = patterns[idx-1];
                var lastLast = patterns[idx-2];
                var next = patterns[idx+1];
                var nextNext = patterns[idx+2];

                // skip over the `:lit` part of `$x:lit`
                if (patStx.token.value === ":") {
                    if(last && isPatternVar(last) && !isPatternVar(next)) {
                        return acc;
                    }
                }
                if (last && last.token.value === ":") {
                    if (lastLast && isPatternVar(lastLast) && !isPatternVar(patStx)) {
                        return acc;
                    }
                }
                // skip over $
                if (patStx.token.value === "$" &&
                    next && next.token.type === parser.Token.Delimiter) {
                    return acc;
                }

                if (isPatternVar(patStx)) {
                    if (next && next.token.value === ":" && !isPatternVar(nextNext)) {
                        if (typeof nextNext === 'undefined') {
                            throw new Error("expecting a pattern class following a `:`");
                        }
                        patStx.class = nextNext.token.value;
                    } else {
                        patStx.class = "token";
                    }
                } else if (patStx.token.type === parser.Token.Delimiter) {
                    if (last && last.token.value === "$") {
                        patStx.class = "pattern_group";
                    }
                    patStx.token.inner = loadPattern(patStx.token.inner);
                } else {
                    patStx.class = "pattern_literal";
                }
                return acc.concat(patStx);
                // then second pass to mark repeat and separator
            }, []).reduce(function(acc, patStx, idx, patterns) {
                var separator = " ";
                var repeat = false;
                var next = patterns[idx+1];
                var nextNext = patterns[idx+2];

                if (next && next.token.value === "...") {
                    repeat = true;
                    separator = " ";
                } else if (delimIsSeparator(next) &&
                           nextNext && nextNext.token.value === "...") {
                    repeat = true;
                    parser.assert(next.token.inner.length === 1,
                           "currently assuming all separators are a single token");
                    separator = next.token.inner[0].token.value;
                }

                // skip over ... and (,)
                if (patStx.token.value === "..."||
                    (delimIsSeparator(patStx) && next && next.token.value === "...")) {
                    return acc;
                }
                patStx.repeat = repeat;
                patStx.separator = separator;
                return acc.concat(patStx);
            }, []).value();
    }


    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass (patternClass, stx, env) {
        var result, rest;
        // pattern has no parse class
        if (patternClass === "token" &&
            stx[0] && stx[0].token.type !== parser.Token.EOF) {
            result = [stx[0]];
            rest = stx.slice(1);
        } else if (patternClass === "lit" &&
                   stx[0] && typeIsLiteral(stx[0].token.type)) {
            result = [stx[0]];
            rest = stx.slice(1);
        } else if (patternClass === "ident" &&
                   stx[0] && stx[0].token.type === parser.Token.Identifier) {
            result = [stx[0]];
            rest = stx.slice(1);
        } else if (stx.length > 0 && patternClass === "VariableStatement") {
            var match = enforest(stx, env);
            if (match.result && match.result.hasPrototype(VariableStatement)) {
                result = match.result.destruct(false);
                rest = match.rest;
            } else {
                result = null;
                rest = stx;
            }
        } else if (stx.length > 0 && patternClass === "expr") {
            var match = get_expression(stx, env);
            if (match.result === null || (!match.result.hasPrototype(Expr))) {
                result = null;
                rest = stx;
            } else {
                result = match.result.destruct(false);
                rest = match.rest;
            }
        } else {
            result = null;
            rest = stx;
        }

        return {
            result: result,
            rest: rest
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

        for (var i = 0; i < patterns.length; i++) {
            pattern = patterns[i];
            do {
                match = matchPattern(pattern, rest, env, patternEnv);
                if ((!match.success) && pattern.repeat) {
                    // a repeat can match zero tokens and still be a
                    // "success" so break out of the inner loop and
                    // try the next pattern
                    rest = match.rest;
                    patternEnv = match.patternEnv;
                    break;
                }
                if (!match.success) {
                    success = false;
                    break;
                }
                rest = match.rest;
                patternEnv = match.patternEnv;

                if (pattern.repeat && success) {
                    if (rest[0] && rest[0].token.value === pattern.separator) {
                        // more tokens and the next token matches the separator
                        rest = rest.slice(1);
                    } else if (pattern.separator === " ") {
                        // no separator specified (using the empty string for this)
                        // so keep going
                        continue;
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
            } while (pattern.repeat && match.success && rest.length > 0);
        }
        return {
            success: success,
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
    function matchPattern(pattern, stx, env, patternEnv) {
        var subMatch;
        var match, matchEnv;
        var rest;
        var success;

        if (typeof pattern.inner !== 'undefined') {
            if (pattern.class === "pattern_group") {
                // pattern groups don't match the delimiters
                subMatch = matchPatterns(pattern.inner, stx, env, false);
                rest = subMatch.rest;
            } else if (stx[0] && stx[0].token.type === parser.Token.Delimiter &&
                       stx[0].token.value === pattern.value) {
                subMatch = matchPatterns(pattern.inner,
                                         stx[0].token.inner,
                                         env,
                                         false);
                rest = stx.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx,
                    patternEnv: patternEnv
                };
            }
            success = subMatch.success;

            // merge the subpattern matches with the current pattern environment
            _.keys(subMatch.patternEnv).forEach(function(patternKey) {
                if (pattern.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel = subMatch.patternEnv[patternKey].level + 1;

                    if (patternEnv[patternKey]) {
                        patternEnv[patternKey].level = nextLevel;
                        patternEnv[patternKey].match.push(subMatch.patternEnv[patternKey]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv[patternKey] = {
                            level: nextLevel,
                            match: [subMatch.patternEnv[patternKey]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv[patternKey] = subMatch.patternEnv[patternKey];
                }
            });

        } else {
            if (pattern.class === "pattern_literal") {
                // wildcard
                if(stx[0] && pattern.value === "_") {
                    success = true;
                    rest = stx.slice(1);
                // match the literal but don't update the pattern environment
                } else if (stx[0] && pattern.value === stx[0].token.value) {
                    success = true;
                    rest = stx.slice(1);
                } else {
                    success = false;
                    rest = stx;
                }
            } else {
                match = matchPatternClass(pattern.class, stx, env);

                success = match.result !== null;
                rest = match.rest;
                matchEnv = {
                    level: 0,
                    match: match.result
                };

                // push the match onto this value's slot in the environment
                if (pattern.repeat) {
                    if (patternEnv[pattern.value]) {
                        patternEnv[pattern.value].match.push(matchEnv);
                    } else {
                        // initialize if necessary
                        patternEnv[pattern.value] = {
                            level: 1,
                            match: [matchEnv]
                        };
                    }
                } else {
                    patternEnv[pattern.value] = matchEnv;
                }
            }
        }
        return {
            success: success,
            rest: rest,
            patternEnv: patternEnv
        };

    }

    exports.loadPattern = loadPattern;
    exports.matchPatterns = matchPatterns;

}))
