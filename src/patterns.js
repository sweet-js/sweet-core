(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require("es6-collections"),
                require("./parser"), require("./expander"), require("./syntax"));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'underscore', 'es6-collections',
                'parser', 'expander', 'syntax'], factory);
    }
}(this, function(exports, _, es6, parser, expander, syntax) {

    var get_expression = expander.get_expression;
    var syntaxFromToken = syntax.syntaxFromToken;
    var mkSyntax = syntax.mkSyntax;

    
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax(tojoin, punc) {
        if (tojoin.length === 0) { return []; }
        if (punc === " ") { return tojoin; }

        return _.reduce(_.rest(tojoin, 1), function (acc, join) {
            return acc.concat(mkSyntax(punc, parser.Token.Punctuator, join), join);
        }, [_.first(tojoin)]);
    }

    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr(tojoin, punc) {
        if (tojoin.length === 0) { return []; }
        if (punc === " ") {
            return _.flatten(tojoin, true);
        }

        return _.reduce(_.rest(tojoin, 1), function (acc, join){
            return acc.concat(mkSyntax(punc,
                                       parser.Token.Punctuator,
                                       _.first(join)),
                              join);
        }, _.first(tojoin));
    }

    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern(pattern) {
        var fv = [];

        _.each(pattern, function (pat) {
            if (isPatternVar(pat)) {
                fv.push(pat.token.value);
            } else if (pat.token.type === parser.Token.Delimiter) {
                fv = fv.concat(freeVarsInPattern(pat.token.inner));
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


    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch(tojoin, punc) {
        return _.reduce(_.rest(tojoin, 1), function(acc, join) {
            if (punc === " ") {
                return acc.concat(join.match);
            }
            return acc.concat(mkSyntax(punc,
                                       parser.Token.Punctuator,
                                       _.first(join.match)),
                              join.match);
        }, _.first(tojoin).match);
    }
    
    // take the line context (not lexical...um should clarify this a bit)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext(from, to) {
        // todo could be nicer about the line numbers...currently just
        // taking from the macro name but could also do offset
        return _.map(to, function(stx) {
            if (stx.token.type === parser.Token.Delimiter) {
                var next = syntaxFromToken({
                    type: parser.Token.Delimiter,
                    value: stx.token.value,
                    inner: stx.token.inner,
                    startRange: from.range,
                    endRange: from.range,
                    startLineNumber: from.token.lineNumber,
                    startLineStart: from.token.lineStart,
                    endLineNumber: from.token.lineNumber,
                    endLineStart: from.token.lineStart
                }, stx.context);
                next.deferredContext = stx.deferredContext;
                return next;
            }
            return syntaxFromToken({
                    value: stx.token.value,
                    type: stx.token.type,
                    lineNumber: from.token.lineNumber,
                    lineStart: from.token.lineStart,
                    range: from.token.range
                }, stx.context);
        });
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
            var match = expander.enforest(stx, env);
            if (match.result && match.result.hasPrototype(expander.VariableStatement)) {
                result = match.result.destruct(false);
                rest = match.rest;
            } else {
                result = null;
                rest = stx;
            }
        } else if (stx.length > 0 && patternClass === "expr") {
            var match = expander.get_expression(stx, env);
            if (match.result === null || (!match.result.hasPrototype(expander.Expr))) {
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
                stx[0].expose();
                if (pattern.inner.length === 0 && stx[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx,
                        patternEnv: patternEnv
                    }
                }
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
                        parser.assert(bodyStx.token.type === parser.Token.Delimiter,
                                        "expecting a literal to be surrounded by []");
                        return acc.concat(bodyStx.token.inner);
                    }

                    if (next && next.token.value === "...") {
                        bodyStx.repeat = true;
                        bodyStx.separator = " "; // default to space separated
                    } else if (delimIsSeparator(next) &&
                               nextNext && nextNext.token.value === "...") {
                        bodyStx.repeat = true;
                        bodyStx.separator = next.token.inner[0].token.value;
                    }

                    return acc.concat(bodyStx);
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

                        parser.assert(typeof nonScalar !== 'undefined',
                                      "must have a least one non-scalar in repeat");

                        var repeatLength = env[nonScalar].match.length;
                        var sameLength = _.all(fv, function(pat) {
                            return (env[pat].level === 0) ||
                                (env[pat].match.length === repeatLength);
                        });
                        parser.assert(sameLength,
                                      "all non-scalars must have the same length");

                        // create a list of envs restricted to the free vars
                        restrictedEnv = _.map(_.range(repeatLength), function(idx) {
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
                            return renv;
                        });

                        var transcribed = _.map(restrictedEnv, function(renv) {
                            if (bodyStx.group) {
                                return transcribe(bodyStx.token.inner,
                                                  macroNameStx,
                                                  renv);
                            } else {
                                var newBody = syntaxFromToken(_.clone(bodyStx.token),
                                                              bodyStx.context);
                                newBody.token.inner = transcribe(bodyStx.token.inner,
                                                                 macroNameStx,
                                                                 renv);
                                return newBody;
                            }
                        });
                        var joined;
                        if (bodyStx.group) {
                            joined = joinSyntaxArr(transcribed, bodyStx.separator);
                        } else {
                            joined = joinSyntax(transcribed, bodyStx.separator);
                        }

                        return acc.concat(joined);
                    }

                    if (!env[bodyStx.token.value]) {
                        throw new Error("The pattern variable " + bodyStx.token.value +
                                        " is not bound for the template");
                    } else if (env[bodyStx.token.value].level !== 1) {
                        throw new Error("Ellipses level for " + bodyStx.token.value +
                                        " does not match in the template");
                    } 

                    return acc.concat(joinRepeatedMatch(env[bodyStx.token.value].match,
                                                        bodyStx.separator));
                } else {
                    if (bodyStx.token.type === parser.Token.Delimiter) {
                        bodyStx.expose();
                        var newBody = syntaxFromToken(_.clone(bodyStx.token),
                                                      macroBody.context);
                        newBody.token.inner = transcribe(bodyStx.token.inner,
                                                         macroNameStx, env);
                        return acc.concat(takeLineContext(macroNameStx, [newBody]));
                    }
                    if (isPatternVar(bodyStx) &&
                        Object.prototype.hasOwnProperty.bind(env)(bodyStx.token.value)) {
                        if (!env[bodyStx.token.value]) {
                            throw new Error("The pattern variable " + bodyStx.token.value +
                                       " is not bound for the template");
                        } else if (env[bodyStx.token.value].level !== 0) {
                            throw new Error("Ellipses level for " + bodyStx.token.value +
                                       " does not match in the template");
                        } 
                        return acc.concat(takeLineContext(macroNameStx,
                                                          env[bodyStx.token.value].match));
                    }
                    return acc.concat(takeLineContext(macroNameStx, [bodyStx]));
                }
            }, []).value();
    }

    exports.loadPattern = loadPattern;
    exports.matchPatterns = matchPatterns;
    exports.transcribe = transcribe;
    exports.matchPatternClass = matchPatternClass;
    exports.takeLineContext = takeLineContext;
}))
