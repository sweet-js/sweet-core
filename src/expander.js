/*
  Copyright (C) 2012 Tim Disney <tim@disnet.me>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require('./parser'), require("es6-collections"));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'underscore', 'parser', 'es6-collections'], factory);
    } else {
        // Browser globals
        factory((root.expander = {}), root._, root.parser);
    }
}(this, function (exports, underscore, parser, es6) {
    _ = underscore || _;

    // some convenience monkey patching
    Object.prototype.create = function() {
        var obj = Object.create(this);
        if (typeof obj.construct === "function") {
            obj.construct.apply(obj, arguments);
        }
        return obj;
    }

    Object.prototype.extend = function(properties) {
        var result = Object.create(this);
        for(var prop in properties) {
            if(properties.hasOwnProperty(prop)) {
                result[prop] = properties[prop];
            }
        }
        return result;
    }

    Object.prototype.hasPrototype = function(proto) {
        function F() {}
        F.prototype = proto;
        return this instanceof F;
    }

    // todo: add more message information
    function throwError(msg) {
        throw new Error(msg);
    }

    // var CToken = object({
    //     type: Num,
    //     value: opt(Any),
    //     // inner: opt(arr([___(CToken)])), // or CSyntax...
    //     lineNumber: opt(Num),
    //     lineStart: opt(Num)
    //     // range is sometimes here but we don't care about it since
    //     // it is going to be wrong...vestigial property
    // });

    // var CMark = object({
    //     mark: Str,
    //     context: Any // CMark or CRename
    // });

    // var CRename = object({
    //     id: CSyntax, // but only idents
    //     name: Str,
    //     context: Any // CMark or CRename
    // });


    // var CContext = or(Null, object({
    //     mark: opt(Num),
    //     // id: opt(CSyntax),
    //     name: opt(Str),
    //     context: or(Null, Self)
    // }));

    // var CSyntax = object({
    //     token: CToken,
    //     context: CContext
    // });

    // var CVar = object({
    //     id: CSyntax
    // });

    // token: { value: token, enumerable: true, configurable: true},
    // context: { value: ctx, writable: false, enumerable: true, configurable: true},
    // consed: {value: true, enumerable: true, writable: true, configurable: true}


    // var CPattern = object({
    //     value: Str,
    //     class: Str
    //     // inner: [...CPattern]
    // })

    // var CMacro = fun(arr([___(CSyntax)]), arr([___(CSyntax)]));

    // (Any, Num, CSyntax) -> CSyntax
    function mkSyntax(value, type, stx) {
        return syntaxFromToken({
            type: type,
            value: value,
            lineStart: stx.token.lineStart,
            lineNumber: stx.token.lineNumber
        }, stx.context);
    }

    // probably a more javascripty way than faking constructors but screw it
    // (Num) -> CContext
    function Mark(mark, ctx) {
        return {
            mark: mark,
            context: ctx
        };
    }


    function Var(id) {
        return {
            id: id
        };
    }

    var isMark = function isMark(m) {
        return m && (typeof m.mark !== 'undefined');
    };

    // (CSyntax, Str) -> CContext
    function Rename(id, name, ctx) {
        return {
            id: id,
            name: name,
            context: ctx
        };
    }

    var isRename = function(r) {
        return r && (typeof r.id !== 'undefined') && (typeof r.name !== 'undefined');
    };

    function DummyRename(name, ctx) {
        return {
            dummy_name: name,
            context: ctx
        };
    }

    var isDummyRename = function(r) {
        return r && (typeof r.dummy_name !== 'undefined');
    };


    var syntaxProto =  {
        // (?) -> CSyntax
        // non mutating
        mark: function mark(mark) {
            // clone the token so we don't mutate the original inner property
            var markedToken = _.clone(this.token);
            if(this.token.inner) {
                var markedInner = _.map(this.token.inner, function(stx) {
                    return stx.mark(mark);
                });
                markedToken.inner = markedInner;
            }
            var newMark = Mark(mark, this.context);
            var stmp = syntaxFromToken(markedToken, newMark);
            return stmp;
        },

        // (CSyntax or [...CSyntax], Str) -> CSyntax
        // non mutating
        rename: function(idents, name) {
            var renamedToken = _.clone(this.token);
            if(this.token.inner) {
                var renamedInner = _.map(this.token.inner, function(stx) {
                    return stx.rename(idents, name);
                });
                renamedToken.inner = renamedInner;
            }
            // wrap idents in a list if given a single
            var ids = _.isArray(idents) ? idents : [idents];

            var newRename = _.reduce(ids, function(ctx, id) {
                return Rename(id, name, ctx);
            }, this.context);
            return syntaxFromToken(renamedToken, newRename);
        },

        push_dummy_rename: function(name) {
            var renamedToken = _.clone(this.token);
            if(this.token.inner) {
                var renamedInner = _.map(this.token.inner, function(stx) {
                    return stx.push_dummy_rename(name);
                });
                renamedToken.inner = renamedInner;
            }

            return syntaxFromToken(renamedToken, DummyRename(name, this.context));
        },

        swap_dummy_rename: function(ident, name, dummyName) {
            var swappedToken = _.clone(this.token);
            if(this.token.inner) {
                var swappedInner = _.map(this.token.inner, function(stx) {
                    return stx.swap_dummy_rename(ident, name, dummyName);
                });
                swappedToken.inner = swappedInner;
            }

            return syntaxFromToken(swappedToken,
                                    renameDummyCtx(this.context, ident, name, dummyName));
        }
    };

    function renameDummyCtx(ctx, ident, name, dummyName) {
        if(ctx === null) {
            return null;
        }
        if(isDummyRename(ctx) && ctx.dummy_name === dummyName) {
            return Rename(ident, name, DummyRename(ctx.dummy_name, ctx.context));
        }
        if(isDummyRename(ctx) && ctx.dummy_name !== dummyName) {
            return DummyRename(ctx.dummy_name, renameDummyCtx(ctx.context, ident, name, dummyName));
        }
        if(isMark(ctx)) {
            return Mark(ctx.mark, renameDummyCtx(ctx.context, ident, name, dummyName));
        }
        if(isRename(ctx)) {
            return Rename(ctx.id, ctx.name, renameDummyCtx(ctx.context, ident, name, dummyName));
        }
        parser.assert(false, "expecting a fixed set of context types");
    }

    function findDummyParent(ctx, dummyName) {
        if(ctx === null || ctx.context === null) {
            return null
        }

        if(isDummyRename(ctx.context) && ctx.context.dummy_name === dummyName) {
            return ctx;
        }
        return findDummyParent(ctx.context);
    }


    // (CToken, CContext?) -> CSyntax
    function syntaxFromToken(token, oldctx) {
        // if given old syntax object steal its context otherwise create one fresh
        var ctx = (typeof oldctx !== 'undefined') ? oldctx : null;

        return Object.create(syntaxProto, {
            token: { value: token, enumerable: true, configurable: true},
            context: { value: ctx, writable: true, enumerable: true, configurable: true}
        });
    }

    function remdup(mark, mlist) {
        if(mark === _.first(mlist)) {
            return _.rest(mlist, 1);
        }
        return [mark].concat(mlist);
    }

    // (CSyntax) -> [...Num]
    function marksof(stx) {
        var mark, submarks;
        if(isMark(stx.context)) {
            mark = stx.context.mark;
            submarks = marksof(syntaxFromToken(stx.token, stx.context.context));
            return remdup(mark, submarks);
        }
        if(isRename(stx.context) || isDummyRename(stx.context)) {
            return marksof(syntaxFromToken(stx.token, stx.context.context));
        }
        return [];
    }

    // (CSyntax) -> CToken
    function resolve(stx) {
        if(isMark(stx.context) || isDummyRename(stx.context)) {
            return resolve(syntaxFromToken(stx.token, stx.context.context));
        }
        if (isRename(stx.context)) {
            var idName = resolve(stx.context.id);
            var subName = resolve(syntaxFromToken(stx.token, stx.context.context));

            var idMarks = marksof(stx.context.id);
            var subMarks = marksof(syntaxFromToken(stx.token, stx.context.context));

            if((idName === subName) && (_.difference(idMarks, subMarks).length === 0)) {
                return stx.token.value + stx.context.name;
            }
            return resolve(syntaxFromToken(stx.token, stx.context.context));
        }
        return stx.token.value;
    }

    var nextFresh = 0;
    var fresh = function() {
        // todo: something more globally unique
        return nextFresh++;
    };



    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax(tokens) {
        if(!_.isArray(tokens)) {
            tokens = [tokens];
        }
        return _.map(tokens, function(token) {
            if(token.inner) {
                token.inner = tokensToSyntax(token.inner);
            }
            return syntaxFromToken(token);
        });
    }

    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens(syntax) {
        return _.map(syntax, function(stx) {
            if(stx.token.inner) {
                stx.token.inner = syntaxToTokens(stx.token.inner);
            }
            return stx.token;
        });
    }


    // CToken -> Bool
    function isPatternVar(token) {
        return token.type === parser.Token.Identifier
            && token.value[0] === "$"   // starts with $
            && token.value !== "$";     // but isn't $
    }


    var containsPatternVar = function(patterns) {
        return _.any(patterns, function(pat) {
            if(pat.token.type === parser.Token.Delimiter) {
                return containsPatternVar(pat.token.inner);
            }
            return isPatternVar(pat);
        });
    }

    // ([...CSyntax]) -> [...CPattern]
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
                    if(last && isPatternVar(last.token)) {
                        return acc;
                    }
                }
                if(last && last.token.value === ":") {
                    if(lastLast && isPatternVar(lastLast.token)) {
                        return acc;
                    }
                }
                // skip over $
                if (patStx.token.value === "$" && next && next.token.type === parser.Token.Delimiter) {
                    return acc;
                }

                if(isPatternVar(patStx.token)) {
                    if(next && next.token.value === ":" ) {
                        parser.assert(typeof nextNext !== 'undefined', "expecting a pattern class");
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

                if(next && next.token.value === "...") {
                    repeat = true;
                    separator = " ";
                } else if(delimIsSeparator(next) && nextNext && nextNext.token.value === "...") {
                    repeat = true;
                    parser.assert(next.token.inner.length === 1, "currently assuming all separators are a single token");
                    separator = next.token.inner[0].token.value;
                }

                // skip over ... and (,)
                if(patStx.token.value === "..."
                        || (delimIsSeparator(patStx) && next && next.token.value === "...")) {
                    return acc;
                }
                patStx.repeat = repeat;
                patStx.separator = separator;
                return acc.concat(patStx);
            }, []).value();
    }


    // ({<key>: [...[...CSyntax]]}, {<key>: [...[...CSyntax]]}) -> {<key>: [...[...CSyntax]]}
    // mutating orig
    function mergeMatches(orig, next) {
        _.each(_.keys(next), function(nextKey) {
            if(_.isArray(orig[nextKey])) {
                orig[nextKey] = orig[nextKey].concat(next[nextKey]);
            } else {
                orig[nextKey] = next[nextKey];
            }
        });
        return orig;
    }

    // assume callStx has EOF at the very end
    function matchPattern(callStx, pattern) {
        var callIdx = 0;
        var consumed = 0;
        var matchedSyntax;

        parser.assert(callStx.length !== 0, "expecting a non empty array");
        // attempt to parse
        if(pattern.class === "token") {
            if(callStx[0].token.type !== parser.Token.EOF) {
                consumed = 1;
                matchedSyntax = callStx.slice(0, 1);
            }
        } else {
            try {
                var parseResult = parser.parse(callStx,
                                                pattern.class,
                                                {tokens:true});

                consumed = parseResult.tokens.length;
                matchedSyntax = callStx.slice(0, consumed);
            } catch (e) {
                consumed = 0;
            }
        }

        return {
            consumed: consumed,
            match: {
                level: 0,
                match: matchedSyntax
            }
        };
    }

    // the environment will look something like:
    /*
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
    function buildPatternEnv(callStx, patterns) {
        var env = {};
        var callIdx = 0;
        var callStx = [].concat(callStx, tokensToSyntax({type: parser.Token.EOF}));

        var matchFailed = false;

        patterns.forEach(function(pattern) {
            var patternMatch;
            var repeat = pattern.repeat;

            if(matchFailed) {
                // just do an early return through the remaining patterns
                return;
            }

            // what happens if we have extra unmatched tokens in callStx?

            do {
                var consumed = 0;
                if(pattern.token.type === parser.Token.Delimiter) {
                    // dont forget pattern_group vs normal delims

                    if(pattern.class === "pattern_group") {
                        // pattern groups don't match their delimiters
                        var subEnv = buildPatternEnv(_.rest(callStx, callIdx), pattern.token.inner);
                        consumed = subEnv.consumed;
                        callIdx += consumed;
                    } else {
                        // better error handling
                        parser.assert(callStx[callIdx].token.type === parser.Token.Delimiter, "expecting delimiter");
                        // parser.assert(false, "sub delimiters in a macro pattern not supported right now, to be fixed with: https://github.com/mozilla/sweet.js/issues/28");
                        var subEnv = buildPatternEnv(callStx[callIdx].token.inner, pattern.token.inner);
                        consumed = subEnv.consumed;
                        if(consumed !== callStx[callIdx].token.inner.length && repeat === false) {
                            matchFailed = true;
                            callIdx = 0;
                            break;
                        }
                        // consumed is the number of tokens inside the delimiter but we just need to
                        // move forward one token on this level
                        callIdx += (consumed > 0) ? 1 : 0;
                    }

                    // merge the subpattern matches with the current environment
                    _.keys(subEnv.env).forEach(function(patternKey) {
                        if(pattern.repeat) {
                            // if this is a repeat pattern we need to bump the level
                            var nextLevel = subEnv.env[patternKey].level + 1;

                            if(env[patternKey]) {
                                env[patternKey].level = nextLevel;
                                env[patternKey].match.push(subEnv.env[patternKey]);
                            } else {
                                // initialize if we haven't done so already
                                env[patternKey] = {
                                    level: nextLevel,
                                    match: [subEnv.env[patternKey]]
                                };
                            }
                        } else {
                            // otherwise accept the environment as-is
                            env[patternKey] = subEnv.env[patternKey];
                        }
                    });

                } else {
                    if(pattern.class === "pattern_literal") {
                        if(pattern.token.value !== callStx[callIdx].token.value) {
                            consumed = 0;
                        } else {
                            // consume the literal
                            consumed = 1;
                            callIdx += consumed;
                        }
                    } else {
                        // match pattern
                        patternMatch = matchPattern(_.rest(callStx, callIdx), pattern);

                        // note how many tokens we consumed
                        consumed = patternMatch.consumed;
                        callIdx += consumed;

                        // push the match onto this value's slot in the environment
                        if(pattern.repeat) {
                            if(env[pattern.token.value]) {
                                env[pattern.token.value].match.push(patternMatch.match);
                            } else {
                                // initialize if necessary
                                env[pattern.token.value] = {
                                    level: 1,
                                    match: [patternMatch.match]
                                };
                            }
                        } else {
                            env[pattern.token.value] = patternMatch.match;
                        }
                    }
                }

                // if we matched no tokens note that the match failed
                // so we don't check the remaining patterns and break out
                // of the repeat loop
                if(consumed === 0) {
                    matchFailed = true;
                    callIdx = 0;
                    break;
                }

                if(pattern.repeat && pattern.separator === " ") {
                    // stop repeating if we're at the end of the syntax
                    if((callIdx >= callStx.length) || (callStx[callIdx].token.type === parser.Token.EOF)) {
                        repeat = false;
                    }
                } else if(pattern.repeat && callStx[callIdx].token.value !== pattern.separator) {
                    // stop repeating if the next token isn't the repeat separator
                    repeat = false;
                } else if(consumed <= 0) {
                    // stop repeating if the pattern did not match
                    repeat = false;
                } else if(pattern.repeat) {
                    // consume the separator
                    // todo: this is assuming all separators are single tokens, might want to revise at some point
                    callIdx++;
                }
            } while (repeat);
        });

        return {
            consumed: callIdx,
            env: env
        };
    }


    // take the line context (not lexical...um should clarify this a bit)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext(from, to) {
        // todo could be nicer about the line numbers...currently just
        // taking from the macro name but could also do offset
        return _.map(to, function(stx) {
            if(stx.token.type === parser.Token.Delimiter) {
                return syntaxFromToken({
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
            }
            return syntaxFromToken({
                    value: stx.token.value,
                    type: stx.token.type,
                    lineNumber: from.token.lineNumber,
                    lineStart: from.token.lineStart,
                    range: from.token.range // this is a lie
                }, stx.context);
        });
    }

    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch(tojoin, punc) {

        return _.reduce(_.rest(tojoin, 1), function(acc, join) {
            if (punc === " ") {
                return acc.concat(join.match);
            }
            return acc.concat(mkSyntax(punc, parser.Token.Punctuator, _.first(join.match)), join.match);
        }, _.first(tojoin).match);
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax(tojoin, punc) {
        if(tojoin.length === 0) { return []; }
        if(punc === " ") { return tojoin; }

        return _.reduce(_.rest(tojoin, 1), function (acc, join) {
            return acc.concat(mkSyntax(punc, parser.Token.Punctuator, join), join);
        }, [_.first(tojoin)]);
    }

    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr(tojoin, punc) {
        if(tojoin.length === 0) { return []; }
        if(punc === " ") {
            return _.flatten(tojoin, true);
        }

        return _.reduce(_.rest(tojoin, 1), function (acc, join){
            return acc.concat(mkSyntax(punc, parser.Token.Punctuator, _.first(join)), join);
        }, _.first(tojoin))
    }

    // (CSyntax) -> Bool
    function delimIsSeparator(delim) {
        return (delim && delim.token.type === parser.Token.Delimiter
                && delim.token.value === "()"
                && delim.token.inner.length === 1
                && delim.token.inner[0].token.type !== parser.Token.Delimiter
                && !containsPatternVar(delim.token.inner));
    }

    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern(pattern) {
        var fv = [];

        _.each(pattern, function (pat) {
            if(isPatternVar(pat.token)) {
                fv.push(pat.token.value);
            } else if (pat.token.type === parser.Token.Delimiter) {
                fv = fv.concat(freeVarsInPattern(pat.token.inner));
            }
        });

        return fv;
    }

    function attemptToMatchMacroCall(callSyntax, patterns) {
        var numberMatched = patterns.length;
        // early exit, this pattern can never match
        if(callSyntax.length < patterns.length) {
            return {
                matches: {},
                numberMatched: 0
            }
        }

        // just match against what we can
        if(callSyntax.length > patterns.length) {
            callSyntax = callSyntax.slice(0, patterns.length);
        }


        var matches = _.chain(_.zip(callSyntax, patterns))
                        .map(function(ziped) {
                            var call = ziped[0],
                                pat = ziped[1];

                            if (pat.token.type === parser.Token.Delimiter) {
                                if(!(call.token.type === parser.Token.Delimiter
                                    && call.token.value === pat.token.value)) {
                                    numberMatched = 0;
                                    return {};
                                }
                                call = call.token.inner;
                                pat = pat.token.inner;
                            } else {
                                call = [call];
                                pat = [pat];
                            }
                            var patternEnv = buildPatternEnv(call, pat)

                            // only failed if there was a pattern
                            if(pat.length !== 0 && (patternEnv.consumed !== call.length || patternEnv.consumed === 0 && call.length === 0)) {
                                numberMatched = 0;
                            }

                            return patternEnv.env;
                        }).reduce(function(acc, matchObj) {
                            return _.extend(acc, matchObj);
                        }, {}).value();

        return {
            matches: matches,
            numberMatched: numberMatched
        };
    }

    // ([...CSyntax]) -> Num
    function patternLength (patterns) {
        return _.reduce(patterns, function(acc, pat) {
            if(pat.token.type === parser.Token.Delimiter) {
                // the one is to include the delimiter itself in the count
                return acc + 1 + patternLength(pat.token.inner);
            }
            return acc + 1;
        }, 0)
    }

    // ([...{pattern: [...CSyntax], body: CSyntax}], CSyntax) -> CMacro
    function mkMacroTransformer(macroCases) {
        // grab the patterns from each case and sort them by longest number of patterns
        var sortedCases = _.sortBy(macroCases, function(mcase) {
                                    return patternLength(mcase.pattern);
                                }).reverse();

        return function(callSyntax, macroNameStx) {

            var potentialMatches;
            var matches;
            var bodySyntax;
            var consumed = 0;

            for (var i = 0; i < sortedCases.length; i++) {
                potentialMatches = attemptToMatchMacroCall(callSyntax, sortedCases[i].pattern);

                if(potentialMatches.numberMatched > 0) {
                    bodySyntax = sortedCases[i].body.token.inner;
                    matches = potentialMatches.matches;
                    consumed = potentialMatches.numberMatched;
                    break;
                }
            }

            // todo: something better than an assert
            parser.assert(potentialMatches.numberMatched > 0, "no macro cases matched");


            // ([...CSyntax]) -> [...CSyntax]
            var transcribe = function(bodyPattern, env) {

                return _.chain(bodyPattern)
                    // todo: eagerly process this macro body
                    .reduce(function(acc, bodyStx, idx, original) {
                        // first find the ellipses and mark the syntax objects
                        // (note that this step does not eagerly go into delimiter bodies)
                        var last = original[idx-1];
                        var next = original[idx+1];
                        var nextNext = original[idx+2];

                        // drop `...`
                        if(bodyStx.token.value === "...") {
                            return acc;
                        }
                        // drop `(<separator)` when followed by an ellipse
                        if(delimIsSeparator(bodyStx) && next && next.token.value === "...") {
                            return acc;
                        }

                        // skip the $ in $(...)
                        if (bodyStx.token.value === "$" && next && next.token.type === parser.Token.Delimiter) {
                            return acc;
                        }

                        if (bodyStx.token.type === parser.Token.Delimiter && last && last.token.value === "$") {
                            bodyStx.group = true;
                        }

                        if(next && next.token.value === "...") {
                            bodyStx.repeat = true;
                            bodyStx.separator = " "; // default to space separated
                        } else if(delimIsSeparator(next) && nextNext && nextNext.token.value === "...") {
                            bodyStx.repeat = true;
                            bodyStx.separator = next.token.inner[0].token.value;
                        }

                        return acc.concat(bodyStx);
                    }, []).reduce(function(acc, bodyStx, idx) {
                        // then do the actual transcription
                        if(bodyStx.repeat) {
                            if(bodyStx.token.type === parser.Token.Delimiter) {

                                var fv = freeVarsInPattern(bodyStx.token.inner);
                                var restrictedEnv = [];
                                var nonScalar = _.find(fv, function(pat) {
                                    return env[pat].level > 0;
                                });

                                parser.assert(typeof nonScalar !== 'undefined', "must have a least one non-scalar in repeat");

                                var repeatLength = env[nonScalar].match.length;
                                var sameLength = _.all(fv, function(pat) {
                                    return (env[pat].level === 0)
                                            || (env[pat].match.length === repeatLength);
                                });
                                parser.assert(sameLength, "all non-scalars must have the same length");

                                // create a list of envs restricted to the free vars
                                restrictedEnv = _.map(_.range(repeatLength), function(idx) {
                                    var renv = {};
                                    _.each(fv, function(pat) {
                                        if(env[pat].level === 0) {
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
                                    if(bodyStx.group) {
                                        return transcribe(bodyStx.token.inner, renv);
                                    } else {
                                        var newBody = syntaxFromToken(_.clone(bodyStx.token), bodyStx.context);
                                        newBody.token.inner = transcribe(bodyStx.token.inner, renv);
                                        return newBody;
                                    }
                                });
                                var joined;
                                if(bodyStx.group) {
                                    joined = joinSyntaxArr(transcribed, bodyStx.separator);
                                } else {
                                    joined = joinSyntax(transcribed, bodyStx.separator)
                                }

                                return acc.concat(joined);
                            }
                            parser.assert(env[bodyStx.token.value].level === 1, "ellipses level does not match");
                            return acc.concat(joinRepeatedMatch(env[bodyStx.token.value].match, bodyStx.separator));
                        } else {
                            if(bodyStx.token.type === parser.Token.Delimiter) {
                                var newBody = syntaxFromToken(_.clone(bodyStx.token), bodySyntax.context);
                                newBody.token.inner = transcribe(bodyStx.token.inner, env);
                                return acc.concat(newBody);
                            }
                            if(env[bodyStx.token.value]) {
                                parser.assert(env[bodyStx.token.value].level === 0, "match ellipses level does not match");
                                return acc.concat(takeLineContext(macroNameStx,
                                                                  env[bodyStx.token.value].match));
                            }
                            return acc.concat(takeLineContext(macroNameStx, [bodyStx]));
                        }
                    }, []).value();
            };

            return {
                consumed: consumed,
                body: transcribe(bodySyntax, matches)
            };
        };
    }

    // (Any, CSyntax) -> Bool
    function matchStx(value, stx) {
        return stx && stx.token && stx.token.value === value;
    }

    // ([...CSyntax], CSyntax) -> { transformer: CMacro, toConsume: Num }
    function loadMacro(macroBody) {
        var macroCases = [];
        var lastCaseIdx = 0;
        var mostDelimToMatch = 1;

        _.each(macroBody, function(stx, idx) {
            // todo not too elegant yet
            // todo better error handling
            if (stx.token.value === "case") {
                lastCaseIdx = idx;
            } else if (stx.token.value === ">" && macroBody[idx-1].token.value === "=") {
                // grab all of the delimiters between "case" and "=>"
                var patterns = macroBody.slice(lastCaseIdx+1, idx-1);

                var patterns = loadPattern(patterns);


                mostDelimToMatch = (patterns.length > mostDelimToMatch) ? patterns.length : mostDelimToMatch;
                macroCases.push({
                    pattern: patterns,
                    body: macroBody[idx+1]
                });
            }
        });

        return {
            transformer: mkMacroTransformer(macroCases),
            toConsume: mostDelimToMatch
        };
    }

    // ([...CSyntax]) -> [...CSyntax]
    function flatten(stxArr) {
        return _.reduce(stxArr, function(acc, stx) {
            if(typeof stx.token === "undefined") {
                console.log(stx)
            }
            if (stx.token.type === parser.Token.Delimiter) {
                return acc.concat(syntaxFromToken({
                    type: parser.Token.Punctuator,
                    value: stx.token.value[0],
                    range: stx.token.startRange,
                    lineNumber: stx.token.startLineNumber,
                    lineStart: stx.token.startLineStart
                }, stx.context)).concat(flatten(stx.token.inner)).concat(syntaxFromToken({
                    type: parser.Token.Punctuator,
                    value: stx.token.value[1],
                    range: stx.token.endRange,
                    lineNumber: stx.token.endLineNumber,
                    lineStart: stx.token.endLineStart
                }, stx.context));
            }
            return acc.concat(stx);
        }, []);
    }

    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim(towrap, delimSyntax) {
        parser.assert(delimSyntax.token.type === parser.Token.Delimiter, "expecting a delimiter token");

        return syntaxFromToken({
            type: parser.Token.Delimiter,
            value: delimSyntax.token.value,
            inner: towrap,
            range: delimSyntax.token.range,
            startLineNumber: delimSyntax.token.startLineNumber,
            lineStart: delimSyntax.token.lineStart
        }, delimSyntax.context);
    }

    // (CSyntax) -> [...CSyntax]
    function getArgList(argSyntax) {
        parser.assert(argSyntax.token.type === parser.Token.Delimiter,
            "expecting delimiter for function params");
        return _.filter(argSyntax.token.inner, function(stx) {
            return stx.token.value !== ",";
        })
    }

    function isFunctionStx(stx) {
        return stx && stx.token.type === parser.Token.Keyword
                   && stx.token.value === "function";
    }
    function isVarStx(stx) {
        return stx && stx.token.type === parser.Token.Keyword
                   && stx.token.value === "var";
    }

    function varNamesInAST(ast) {
        return _.map(ast, function(item) {
            return item.id.name;
        });
    }

    // finds all the identifiers being bound by var statements
    // in the array of syntax objects
    // ([...CSyntax]) -> [...CSyntax]
    function getVarIdentifiers(body) {
        return _.reduce(body, function(acc, curr, idx) {
            var atFunctionDelimiter;

            if (curr.token.type === parser.Token.Delimiter) {
                atFunctionDelimiter = (curr.token.value === "()" && (isFunctionStx(body[idx-1])
                                                                  || isFunctionStx(body[idx-2]))) ||
                                      (curr.token.value === "{}" && (isFunctionStx(body[idx-2])
                                                                  || isFunctionStx(body[idx-3])))
                // don't look for var idents inside nested functions
                if(!atFunctionDelimiter) {
                    return acc.concat(getVarIdentifiers(curr.token.inner));
                }
                return acc;
            }
            if (isVarStx(body[idx-1])) {
                var parseResult = parser.parse(flatten(body.slice(idx)),
                                            "VariableDeclarationList",
                                            {noresolve: true});
                return acc.concat(varNamesInAST(parseResult));
            }
            return acc;
        }, []);
    }

    function replaceVarIdent(stx, orig, renamed) {
        if(stx === orig) {
            return renamed;
        }
        if(stx.token.type === parser.Token.Delimiter) {
            var replacedToken = _.clone(stx.token);
            var replacedInner = _.map(replacedToken.inner, function(s) {
                return replaceVarIdent(s, orig, renamed);
            });
            replacedToken.inner = replacedInner;
            return syntaxFromToken(replacedToken, stx.context);
        }
        return stx;
    }

    // (CSyntax) -> CSyntax
    function expand(stx, macros, env) {
        var index = 0;
        var expanded = [];


        macros = macros || {};
        env = env || {};

        if(typeof stx === "undefined") {
            return [];
        }

        // var doneLoadingMacroDefs;
        // if(stx[0]
        //     && stx[0].token.type === parser.Token.Identifier
        //     && stx[0].token.value === "macro") {
        //     doneLoadingMacroDefs = false;
        // } else {
        //     doneLoadingMacroDefs = true;
        // }

        while(index < stx.length) {
            var currStx = stx[index++];
            var token = currStx.token;

            if ((token.type === parser.Token.Identifier)
                && (token.value === "macro")) {
                var macroNameStx = stx[index++];
                var macroName = macroNameStx.token.value;
                var macroBody = stx[index++].token;

                // if(doneLoadingMacroDefs) {
                //     parser.assert(false, "all macros must be defined at the top of the scope");
                // }

                parser.assert(macroBody.value === "{}", "expecting a macro body");

                macros[macroName] = loadMacro(macroBody.inner);
            } else if (token.type === parser.Token.Identifier && macros.hasOwnProperty(token.value)) {
                // todo resolve/mark macro names
                var macroDef = macros[token.value];
                var consumeRange;
                var consumeIdx = index;
                if(stx.length <= index + macroDef.toConsume) {
                    // make sure we don't index off the array
                    consumeRange = _.range(stx.length - index);
                } else {
                    consumeRange = _.range(macroDef.toConsume);
                }
                var callArgs = _.map(consumeRange, function() {
                    parser.assert(!(stx[index].token.type === parser.Token.Punctuator && stx[index].token.value === ","),
                        "commas are not allowed in macro call");
                    return stx[consumeIdx++];
                });

                var newMark = fresh();

                var markedArgs = _.map(callArgs, function(arg) { return arg.mark(newMark); });
                var macResult = macros[token.value].transformer(markedArgs, currStx);
                var newBody = macResult.body;
                var markedResult = _.map(newBody, function(arg) { return arg.mark(newMark); });
                index += macResult.consumed;

                expanded = expanded.concat(expand(markedResult, macros, env));

            // function (args) { body }
            } else if ((token.type === parser.Token.Keyword) && (token.value === "function")) {
                doneLoadingMacroDefs = true;

                var argsDelim = stx[index++];
                var functionName;
                // function name(...) {...}
                if(argsDelim.token.type === parser.Token.Identifier) {
                    functionName = argsDelim;
                    argsDelim = stx[index++];
                }
                var bodyDelim = stx[index++];

                parser.assert(argsDelim.token.type === parser.Token.Delimiter, "expecting delimiter for function params");
                parser.assert(bodyDelim.token.type === parser.Token.Delimiter, "expecting delimiter for function body");

                var args = getArgList(argsDelim);

                var freshNames = _.map(args, function(arg) {
                    // todo better fresh names (timestamped or something)
                    return "$" + fresh();
                });

                var freshnameArgPairs = _.zip(freshNames, args);

                var renamedArgs = _.map(freshnameArgPairs, function(argPair) {
                    var freshName = argPair[0];
                    var arg = argPair[1];
                    return arg.rename(arg, freshName);
                });

                var newEnv = _.reduce(_.zip(freshNames, renamedArgs), function (accEnv, argPair) {
                    var freshName = argPair[0]
                    var renamedArg = argPair[1];
                    var o = {};
                    o[freshName] = Var(renamedArg);
                    return _.extend(o, accEnv);
                }, env);


                // var body = bodyDelim.token.inner;
                var renamedBody = _.reduce(freshnameArgPairs, function (accBody, argPair) {
                    var freshName = argPair[0];
                    var arg = argPair[1];
                    return accBody.rename(arg, freshName);
                }, bodyDelim);

                // push a dummy rename to the body
                var dummyName = fresh();

                renamedBody = renamedBody.push_dummy_rename(dummyName);

                var flatBody = expand([renamedBody], macros, newEnv);
                var flatArgs = wrapDelim(joinSyntax(renamedArgs, ","), argsDelim);

                var varIdents = getVarIdentifiers(flatBody);
                varIdents = _.filter(varIdents, function(varId) {
                    // only pick the var identifiers that are not
                    // resolve equal to a parameter of this function
                    return !(_.any(renamedArgs, function(param) {
                        return resolve(varId) === resolve(param);
                    }));
                });

                var freshVarNames = _.map(varIdents, function() {
                    return "$" + fresh();
                });
                var freshnameVarIdents = _.zip(freshVarNames, varIdents);

                // var varRenamedFlatBody = flatBody;
                var varRenamedFlatBody = _.reduce(freshnameVarIdents, function(accBody, varPair) {
                        var freshName = varPair[0];
                        var ident = varPair[1].rename(varPair[1], freshName);
                        // first find and replace the var declarations
                        var replacedBody = replaceVarIdent(accBody, varPair[1], ident);
                        // var replacedBody = accBody; // replaceVarIdent(accBody, varPair[1], ident);
                        // then swap the dummy renames
                        return replacedBody.swap_dummy_rename(varPair[1], freshName, dummyName);
                }, flatBody[0]);

                expanded = expanded.concat(currStx);
                if(functionName) {
                    expanded = expanded.concat(functionName);
                }
                expanded = expanded.concat(flatArgs);
                expanded = expanded.concat(varRenamedFlatBody);
            } else if (token.type === parser.Token.Identifier) {
                doneLoadingMacroDefs = true;
                var resolvedIdent = resolve(currStx);

                var ident;
                if(env.hasOwnProperty(resolvedIdent)) {
                    ident = env[resolvedIdent].id;
                } else {
                    // todo is this right?
                    // ident = mkSyntax(resolvedIdent, Token.Identifier, currStx);
                    ident = currStx
                }
                expanded = expanded.concat(ident);
            } else if (token.type === parser.Token.Delimiter) {
                doneLoadingMacroDefs = true;
                currStx.token.inner = expand(token.inner, macros, env);
                expanded = expanded.concat(currStx);
            } else {
                doneLoadingMacroDefs = true;
                expanded = expanded.concat(tokensToSyntax(token));
            }
        }

        return expanded;
    }

    var TermTree = {
        // -> [...Syntax]
        destruct: function() {
            return _.reduce(this.properties, _.bind(function(acc, prop) {
                if(this[prop].hasPrototype(TermTree)) {
                    return acc.concat(this[prop].destruct());
                } else {
                    return acc.concat(this[prop]);
                }
            }, this), []);
        }
    };

    var EOF = TermTree.extend({
        properties: ["eof"],

        construct: function(e) { this.eof = e; }
    });

    var Expr = TermTree.extend({ construct: function() {} });

    var Lit = Expr.extend({
        properties: ["lit"],

        construct: function(l) { this.lit = l; }
    });

    var Keyword = TermTree.extend({
        properties: ["keyword"],

        construct: function(k) { this.keyword = k; }
    });

    var Punc = TermTree.extend({
        properties: ["punc"],

        construct: function(p) { this.punc = p; }
    });

    var Delimiter = TermTree.extend({
        properties: ["delim"],

        destruct: function() {
            var openParen = syntaxFromToken({
                type: parser.Token.Punctuator,
                value: this.delim.token.value[0],
                range: this.delim.token.startRange,
                lineNumber: this.delim.token.startLineNumber,
                lineStart: this.delim.token.startLineStart
            });
            var closeParen = syntaxFromToken({
                type: parser.Token.Punctuator,
                value: this.delim.token.value[1],
                range: this.delim.token.endRange,
                lineNumber: this.delim.token.endLineNumber,
                lineStart: this.delim.token.endLineStart
            });


            var innerStx = _.reduce(this.delim.token.inner, function(acc, term) {
                parser.assert(term && term.hasPrototype(TermTree), "expecting term trees in destruct of Delimiter");
                return acc.concat(term.destruct());
            }, []);

            return [openParen]
                    .concat(innerStx)
                    .concat(closeParen);
        },

        construct: function(d) { this.delim = d; }
    });

    var Id = Expr.extend({
        properties: ["id"],

        construct: function(id) { this.id = id; }
    });

    var Fun = TermTree.extend({
        properties: ["name", "params", "body"],

        construct: function(name, params, body) {
            this.name = name;
            this.params = params;
            this.body = body;
        }
    });

    var Macro = TermTree.extend({
        properties: ["name", "body"],

        construct: function(name, body) {
            this.name = name;
            this.body = body;
        }
    });

    var Call = Expr.extend({
        properties: ["fun", "args"],

        destruct: function() {
            parser.assert(this.fun.hasPrototype(TermTree), "expecting a term tree in destruct of call");
            return this.fun.destruct().concat(_.reduce(this.args, function(acc, term) {
                parser.assert(term && term.hasPrototype(TermTree), "expecting term trees in destruct of Call");
                return acc.concat(term.destruct());
            }, []));
        },

        construct: function(fun, args) {
            this.fun = fun;
            this.args = args;
        }
    });

    var ReadTree = {
        head: null,
        rest: null,

        construct: function(toks) {
            parser.assert(Array.isArray(toks), "expecting an array of tokens");
            this.rest = toks;
        },

        enforest: function(env) {
            if(this.head === null) {
                this._loadHeadTerm();
                parser.assert(this.head !== null, "expected head term to have been loaded");
                this.enforest(env);
            } else {
                parser.assert(this.head.hasPrototype(TermTree), "expecting the head to be a term");

                // // function call
                // if(this.rest[0] && this.rest[0].token.type === parser.Token.Delimiter
                //         && this.rest[0].token.value === "()") {

                //     var termArgs = _.map(this.rest[0].token.inner, function(p) {
                //         var pr = ReadTree.create([p])
                //         pr.enforest();
                //         parser.assert(pr.rest.length === 0, "expecting enforest of argument to have no remainder");
                //         return pr.head;
                //     });

                //     this.head = Call.create(this.head, termArgs);
                //     this.rest = this.rest.slice(2);
                //     this.enforest(env);
                // macro call
                if (this.head.hasPrototype(Id) && env.has(this.head.id.token.value)) {
                    var transformer = env.get(this.head.id.token.value);
                    var rt = transformer(this.rest, this.head.id, env);

                    // todo: eventually macro calls will only return terms, until then we'll get along with arrays of syntax
                    // parser.assert(rt.result.hasPrototype(TermTree), "expecting a term as the result of the macro call");
                    this.head = null;
                    this.rest = rt.result.concat(rt.rest);
                    this.enforest(env);
                }
            }
        },

        // when there is no term in `head` create it from the tokens in `rest`
        _loadHeadTerm: function() {
            parser.assert(this.head === null, "expecting head to be null");

            var r = this.rest;

            // macro definition
            if(r[0] && r[1] && r[2]
                    && r[0].token.type === parser.Token.Identifier
                    && r[0].token.value === "macro"
                    && r[1].token.type === parser.Token.Identifier
                    && r[2].token.type === parser.Token.Delimiter
                    && r[2].token.value === "{}") {
                this.head = Macro.create(r[1], r[2].token.inner);
                this.rest = this.rest.slice(3);
            // function definition
            } else if (r[0] && r[1] && r[2] && r[3]
                    && r[0].token.type === parser.Token.Keyword
                    && r[0].token.value === "function"
                    && r[1].token.type === parser.Token.Identifier
                    && r[2].token.type === parser.Token.Delimiter
                    && r[2].token.value === "()"
                    && r[3].token.type === parser.Token.Delimiter
                    && r[3].token.value === "{}") {
                this.head = Fun.create(r[1], r[2].token.inner, r[3].token.inner);
                this.rest = this.rest.slice(4);
            // literal
            } else if (r[0]
                    && (r[0].token.type === parser.Token.NumericLiteral
                    || r[0].token.type === parser.Token.StringLiteral
                    || r[0].token.type === parser.Token.BoolLiteral
                    || r[0].token.type === parser.Token.RegexLiteral
                    || r[0].token.type === parser.Token.NullLiteral)) {
                this.head = Lit.create(r[0]);
                this.rest = this.rest.slice(1);
            // punctuator
            } else if (r[0] && r[0].token.type === parser.Token.Punctuator) {
                this.head = Punc.create(r[0]);
                this.rest = this.rest.slice(1);
            // identifier
            } else if(r[0] && r[0].token.type === parser.Token.Identifier) {
                this.head = Id.create(r[0]);
                this.rest = this.rest.slice(1);
            } else if(r[0] && r[0].token.type === parser.Token.Keyword) {
                this.head = Keyword.create(r[0]);
                this.rest = this.rest.slice(1);
            } else if(r[0] && r[0].token.type === parser.Token.Delimiter) {
                this.head = Delimiter.create(r[0]);
                this.rest = this.rest.slice(1);
            // end of file
            } else if(r[0] && r[0].token.type === parser.Token.EOF) {
                this.head = EOF.create(r[0]);
                this.rest = [];
            // oops
            } else {
                parser.assert(false, "unexpected token in enforest");
            }
        }
    }

    function enforest(toks, env) {
        var env = env || new Map();
        var r = ReadTree.create(toks);
        r.enforest(env);

        return {
            result: r.head,
            rest: r.rest
        };
    }

    function get_expression(stx, env) {
        var res = enforest(stx, env);
        if(!res.result.hasPrototype(Expr)) {
            return {
                result: null,
                rest: stx
            };
        }
        return res;
    }

    function makeTransformer(cases, macroName) {

        function matchPatternClass (patternClass, stx, env) {
            var result, rest;
            // pattern has no parse class
            if(patternClass === "token") {
                if(stx[0].token.type !== parser.Token.EOF) {
                    result = stx[0];
                    rest = stx.slice(1);
                } else {
                    result = null;
                    rest = stx;
                }
            // pattern has a parse class
            } else {
                match = get_expression(stx, env);
                if(match.result === null) {
                    result = null;
                    rest = stx;
                } else if(patternClass === "lit" && match.result.hasPrototype(Lit)) {
                    result = match.result.lit;
                    rest = match.rest;
                } else if(patternClass === "id" && match.result.hasPrototype(Id)) {
                    result = match.result.id;
                    rest = match.rest;
                } else if(patternClass === "expr") {
                    parser.assert(false, "the :expr pattern is not implemented yet");
                } else {
                    result = null;
                    rest = stx;
                }
            }


            return {
                result: result,
                rest: rest
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

            // todo: make sure the assumptions that stx contains something holds

            if(pattern.token.type === parser.Token.Delimiter) {
                if(pattern.class === "pattern_group") {
                    // pattern groups don't match the delimiters
                    subMatch = matchPatterns(pattern.token.inner, stx, env, patternEnv);
                } else if (stx[0].token.type === parser.Token.Delimiter
                            && stx[0].token.value === pattern.token.value) {
                    subMatch = matchPatterns(pattern.token.inner, stx[0].token.inner, env, patternEnv);
                } else {
                    throwError("expecting to match a delimiter");
                }
                success = subMatch.success;
                rest = stx.slice(1);
                parser.assert(subMatch.rest.length === 0, "expecting no remaining tokens");


                // merge the subpattern matches with the current pattern environment
                _.keys(subMatch.patternEnv).forEach(function(patternKey) {
                    if(pattern.repeat) {
                        // if this is a repeat pattern we need to bump the level
                        var nextLevel = subMatch.patternEnv[patternKey].level + 1;

                        if(patternEnv[patternKey]) {
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
                if(pattern.class === "pattern_literal") {
                    // match the literal but don't update the pattern environment
                    if(pattern.token.value === stx[0].token.value) {
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
                        match: [match.result]
                    };

                    // only update the pattern environment if we got a result
                    if(match.result !== null) {
                        // push the match onto this value's slot in the environment
                        if(pattern.repeat) {
                            if(patternEnv[pattern.token.value]) {
                                patternEnv[pattern.token.value].match.push(matchEnv);
                            } else {
                                // initialize if necessary
                                patternEnv[pattern.token.value] = {
                                    level: 1,
                                    match: [matchEnv]
                                };
                            }
                        } else {
                            patternEnv[pattern.token.value] = matchEnv;
                        }
                    }
                }
            }
            return {
                success: success,
                rest: rest,
                patternEnv: patternEnv
            };

        }


        // attempt to match pats against stx
        // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
        function matchPatterns(patterns, stx, env, patternEnv) {
            // note that there are two environments floating around,
            // one is the mapping of identifiers to macro definitions
            // and the other is the pattern environment that maps
            // patterns in a macro case to syntax.
            var result = [];
            var patternEnv = patternEnv || {};

            var match;
            var pattern;
            var rest = stx;
            var success = true;

            for(var i = 0; i < patterns.length; i++) {
                pattern = patterns[i];
                do {
                    match = matchPattern(pattern, rest, env, patternEnv);
                    if(!match.success) {
                        success = false;
                    }
                    rest = match.rest;
                    patternEnv = match.patternEnv;


                    if(pattern.repeat && success) {
                        if((rest[0] && rest[0].token.value === pattern.separator)
                            || (pattern.separator === " ")) {
                            rest = rest.slice(1);
                        } else {
                            break;
                        }
                    }
                } while(pattern.repeat && match.success);


            // if(pattern.repeat && pattern.separator === " ") {
            //     // stop repeating if we're at the end of the syntax
            //     if((callIdx >= callStx.length)
            //         || (callStx[callIdx].token.type === parser.Token.EOF)) {
            //         repeat = false;
            //     }
            // } else if(pattern.repeat && stx[callIdx].token.value !== pattern.separator) {
            //     // stop repeating if the next token isn't the repeat separator
            //     repeat = false;
            // } else if(consumed <= 0) {
            //     // stop repeating if the pattern did not match
            //     repeat = false;
            // } else if(pattern.repeat) {
            //     // consume the separator
            //     // todo: this is assuming all separators are single tokens,
            //     // might want to revise at some point
            //     callIdx++;
            // }

            }
            return {
                success: success,
                rest: rest,
                patternEnv: patternEnv
            };
        }

        // ([...CSyntax]) -> [...CSyntax]
        function transcribe(bodyPattern, macroNameStx, env) {

            return _.chain(bodyPattern)
                .reduce(function(acc, bodyStx, idx, original) {
                    // first find the ellipses and mark the syntax objects
                    // (note that this step does not eagerly go into delimiter bodies)
                    var last = original[idx-1];
                    var next = original[idx+1];
                    var nextNext = original[idx+2];

                    // drop `...`
                    if(bodyStx.token.value === "...") {
                        return acc;
                    }
                    // drop `(<separator)` when followed by an ellipse
                    if(delimIsSeparator(bodyStx) && next && next.token.value === "...") {
                        return acc;
                    }

                    // skip the $ in $(...)
                    if (bodyStx.token.value === "$" && next && next.token.type === parser.Token.Delimiter) {
                        return acc;
                    }

                    if (bodyStx.token.type === parser.Token.Delimiter && last && last.token.value === "$") {
                        bodyStx.group = true;
                    }

                    if(next && next.token.value === "...") {
                        bodyStx.repeat = true;
                        bodyStx.separator = " "; // default to space separated
                    } else if(delimIsSeparator(next) && nextNext && nextNext.token.value === "...") {
                        bodyStx.repeat = true;
                        bodyStx.separator = next.token.inner[0].token.value;
                    }

                    return acc.concat(bodyStx);
                }, []).reduce(function(acc, bodyStx, idx) {
                    // then do the actual transcription
                    if(bodyStx.repeat) {
                        if(bodyStx.token.type === parser.Token.Delimiter) {

                            var fv = freeVarsInPattern(bodyStx.token.inner);
                            var restrictedEnv = [];
                            var nonScalar = _.find(fv, function(pat) {
                                return env[pat].level > 0;
                            });

                            parser.assert(typeof nonScalar !== 'undefined', "must have a least one non-scalar in repeat");

                            var repeatLength = env[nonScalar].match.length;
                            var sameLength = _.all(fv, function(pat) {
                                return (env[pat].level === 0)
                                        || (env[pat].match.length === repeatLength);
                            });
                            parser.assert(sameLength, "all non-scalars must have the same length");

                            // create a list of envs restricted to the free vars
                            restrictedEnv = _.map(_.range(repeatLength), function(idx) {
                                var renv = {};
                                _.each(fv, function(pat) {
                                    if(env[pat].level === 0) {
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
                                if(bodyStx.group) {
                                    return transcribe(bodyStx.token.inner, renv);
                                } else {
                                    var newBody = syntaxFromToken(_.clone(bodyStx.token), bodyStx.context);
                                    newBody.token.inner = transcribe(bodyStx.token.inner, renv);
                                    return newBody;
                                }
                            });
                            var joined;
                            if(bodyStx.group) {
                                joined = joinSyntaxArr(transcribed, bodyStx.separator);
                            } else {
                                joined = joinSyntax(transcribed, bodyStx.separator)
                            }

                            return acc.concat(joined);
                        }
                        parser.assert(env[bodyStx.token.value].level === 1, "ellipses level does not match");
                        return acc.concat(joinRepeatedMatch(env[bodyStx.token.value].match, bodyStx.separator));
                    } else {
                        if(bodyStx.token.type === parser.Token.Delimiter) {
                            var newBody = syntaxFromToken(_.clone(bodyStx.token), bodyPattern.context);
                            newBody.token.inner = transcribe(bodyStx.token.inner, macroNameStx, env);
                            return acc.concat(newBody);
                        }
                        if(env[bodyStx.token.value]) {
                            parser.assert(env[bodyStx.token.value].level === 0, "match ellipses level does not match");
                            return acc.concat(takeLineContext(macroNameStx,
                                                              env[bodyStx.token.value].match));
                        }
                        return acc.concat(takeLineContext(macroNameStx, [bodyStx]));
                    }
                }, []).value();
        }

        return function transformer(stx, macroNameStx, env) {
            var match;
            var casePattern, caseBody;
            // try each case
            for(var i = 0; i < cases.length; i++) {
                casePattern = cases[i].pattern;
                caseBody = cases[i].body;

                match = matchPatterns(casePattern, stx, env)
                // transcribe on the first successful match
                if(match.success) {
                    return {
                        result: transcribe(caseBody, macroNameStx, match.patternEnv),
                        rest: match.rest
                    };
                }
            }
            throwError("Could not match any cases for macro: " + macroNameStx.token.value);
        };
    }

    function findCase(start, stx) {
        parser.assert(start >= 0 && start < stx.length, "start out of bounds");
        var idx = start;
        while(idx < stx.length) {
            // todo: handle literal escape
            if(stx[idx].token.value === "case") {
                return idx;
            }
            idx++;
        }
        return -1;
    }

    // looking for index of `=>` in syntax array
    function findCaseArrow(start, stx) {
        parser.assert(start >= 0 && start < stx.length, "start out of bounds");
        var idx = start;
        while(idx < stx.length) {
            // todo: handle literal escape
            if(stx[idx].token.value === "=" && stx[idx+1] && stx[idx+1].token.value === ">") {
                return idx;
            }
            idx++;
        }
        return -1;
    }

    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef(mac) {
        var body = mac.body;
        var caseOffset = 0;
        var arrowOffset = 0;
        var casePattern;
        var caseBody;
        var caseBodyIdx;
        var cases = [];

        // load each of the macro cases
        while(caseOffset < body.length && body[caseOffset].token.value === "case") {
            arrowOffset = findCaseArrow(caseOffset, body);
            if(arrowOffset > 0 && arrowOffset < body.length) {
                // arrowOffset is at `=` in `=> {body}` so add two to get to the body
                caseBodyIdx = arrowOffset + 2;
                if(caseBodyIdx >= body.length) {
                    throwError("case body missing in macro definition");
                }

                casePattern = body.slice(caseOffset+1, arrowOffset);
                caseBody = body[caseBodyIdx].token.inner;

                cases.push({
                    pattern: loadPattern(casePattern, mac.name),
                    body: caseBody
                });
            } else {
                throwError("case body missing in macro definition");
            }

            caseOffset = findCase(arrowOffset, body);
            if(caseOffset < 0) {
                break;
            }
        }
        return makeTransformer(cases);
    }

    function expandf(toks, env) {
        var env = env || new Map();

        if(toks.length === 0) {
            return [];
        }
        var f = enforest(toks, env);
        var head = f.result;
        var rest = f.rest;

        if(head.hasPrototype(Macro)) {
            var def = loadMacroDef(head);
            env.set(head.name.token.value, def);
            return expandf(rest, env);
        } else if(head.hasPrototype(Delimiter)) {
            head.delim.token.inner = expandf(head.delim.token.inner, env)
            return [head].concat(expandf(rest, env));
        // } else if(head.hasPrototype(Call)) {
        //     return [head.fun]
        //             .concat(expandf(head.args, env))
        //             .concat(expandf(rest, env));
        } else {
            return [head].concat(expandf(rest, env));
        }
    }

    function flattenf (terms) {
        return _.reduce(terms, function(acc, term) {
            return acc.concat(term.destruct());
        }, []);
    }

    exports.enforest = enforest;

    // exports.expand = expand;
    exports.expand = expandf;
    exports.expandf = expandf;

    exports.resolve = resolve;

    // exports.flatten = flatten;
    exports.flatten = flattenf;
    exports.flattenf = flattenf;

    exports.tokensToSyntax = tokensToSyntax;
    exports.syntaxToTokens = syntaxToTokens;
}));