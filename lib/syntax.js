(function (root$2449, factory$2450) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2450(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2450);
    }
}(this, function (exports$2451, _$2452, es6$2453, parser$2454) {
    // (CSyntax, Str) -> CContext
    function Rename$2455(id$2479, name$2480, ctx$2481, defctx$2482) {
        defctx$2482 = defctx$2482 || null;
        return {
            id: id$2479,
            name: name$2480,
            context: ctx$2481,
            def: defctx$2482
        };
    }
    // (Num) -> CContext
    function Mark$2456(mark$2483, ctx$2484) {
        return {
            mark: mark$2483,
            context: ctx$2484
        };
    }
    function Def$2457(defctx$2485, ctx$2486) {
        return {
            defctx: defctx$2485,
            context: ctx$2486
        };
    }
    function Var$2458(id$2487) {
        return { id: id$2487 };
    }
    function isRename$2459(r$2488) {
        return r$2488 && typeof r$2488.id !== 'undefined' && typeof r$2488.name !== 'undefined';
    }
    ;
    function isMark$2460(m$2489) {
        return m$2489 && typeof m$2489.mark !== 'undefined';
    }
    ;
    function isDef$2461(ctx$2490) {
        return ctx$2490 && typeof ctx$2490.defctx !== 'undefined';
    }
    function Syntax$2462(token$2491, oldstx$2492) {
        this.token = token$2491;
        this.context = oldstx$2492 && oldstx$2492.context ? oldstx$2492.context : null;
        this.deferredContext = oldstx$2492 && oldstx$2492.deferredContext ? oldstx$2492.deferredContext : null;
    }
    Syntax$2462.prototype = {
        mark: function (newMark$2493) {
            if (this.token.inner) {
                var next$2494 = syntaxFromToken$2463(this.token, this);
                next$2494.deferredContext = Mark$2456(newMark$2493, this.deferredContext);
                return next$2494;
            }
            return syntaxFromToken$2463(this.token, { context: Mark$2456(newMark$2493, this.context) });
        },
        rename: function (id$2495, name$2496, defctx$2497) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2498 = syntaxFromToken$2463(this.token, this);
                next$2498.deferredContext = Rename$2455(id$2495, name$2496, this.deferredContext, defctx$2497);
                return next$2498;
            }
            if (this.token.type === parser$2454.Token.Identifier || this.token.type === parser$2454.Token.Keyword || this.token.type === parser$2454.Token.Punctuator) {
                return syntaxFromToken$2463(this.token, { context: Rename$2455(id$2495, name$2496, this.context, defctx$2497) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2499) {
            if (this.token.inner) {
                var next$2500 = syntaxFromToken$2463(this.token, this);
                next$2500.deferredContext = Def$2457(defctx$2499, this.deferredContext);
                return next$2500;
            }
            return syntaxFromToken$2463(this.token, { context: Def$2457(defctx$2499, this.context) });
        },
        getDefCtx: function () {
            var ctx$2501 = this.context;
            while (ctx$2501 !== null) {
                if (isDef$2461(ctx$2501)) {
                    return ctx$2501.defctx;
                }
                ctx$2501 = ctx$2501.context;
            }
            return null;
        },
        expose: function () {
            parser$2454.assert(this.token.type === parser$2454.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2502(stxCtx$2503, ctx$2504) {
                if (ctx$2504 == null) {
                    return stxCtx$2503;
                } else if (isRename$2459(ctx$2504)) {
                    return Rename$2455(ctx$2504.id, ctx$2504.name, applyContext$2502(stxCtx$2503, ctx$2504.context), ctx$2504.def);
                } else if (isMark$2460(ctx$2504)) {
                    return Mark$2456(ctx$2504.mark, applyContext$2502(stxCtx$2503, ctx$2504.context));
                } else if (isDef$2461(ctx$2504)) {
                    return Def$2457(ctx$2504.defctx, applyContext$2502(stxCtx$2503, ctx$2504.context));
                } else {
                    parser$2454.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2452.map(this.token.inner, _$2452.bind(function (stx$2505) {
                if (stx$2505.token.inner) {
                    var next$2506 = syntaxFromToken$2463(stx$2505.token, stx$2505);
                    next$2506.deferredContext = applyContext$2502(stx$2505.deferredContext, this.deferredContext);
                    return next$2506;
                } else {
                    return syntaxFromToken$2463(stx$2505.token, { context: applyContext$2502(stx$2505.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2507 = this.token.type === parser$2454.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2507 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2463(token$2508, oldstx$2509) {
        return new Syntax$2462(token$2508, oldstx$2509);
    }
    function mkSyntax$2464(stx$2510, value$2511, type$2512, inner$2513) {
        if (stx$2510 && Array.isArray(stx$2510) && stx$2510.length === 1) {
            stx$2510 = stx$2510[0];
        } else if (stx$2510 && Array.isArray(stx$2510)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2510);
        }
        if (type$2512 === parser$2454.Token.Delimiter) {
            var startLineNumber$2514, startLineStart$2515, endLineNumber$2516, endLineStart$2517, startRange$2518, endRange$2519;
            if (!Array.isArray(inner$2513)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2510 && stx$2510.token.type === parser$2454.Token.Delimiter) {
                startLineNumber$2514 = stx$2510.token.startLineNumber;
                startLineStart$2515 = stx$2510.token.startLineStart;
                endLineNumber$2516 = stx$2510.token.endLineNumber;
                endLineStart$2517 = stx$2510.token.endLineStart;
                startRange$2518 = stx$2510.token.startRange;
                endRange$2519 = stx$2510.token.endRange;
            } else if (stx$2510 && stx$2510.token) {
                startLineNumber$2514 = stx$2510.token.lineNumber;
                startLineStart$2515 = stx$2510.token.lineStart;
                endLineNumber$2516 = stx$2510.token.lineNumber;
                endLineStart$2517 = stx$2510.token.lineStart;
                startRange$2518 = stx$2510.token.range;
                endRange$2519 = stx$2510.token.range;
            }
            return syntaxFromToken$2463({
                type: parser$2454.Token.Delimiter,
                value: value$2511,
                inner: inner$2513,
                startLineStart: startLineStart$2515,
                startLineNumber: startLineNumber$2514,
                endLineStart: endLineStart$2517,
                endLineNumber: endLineNumber$2516,
                startRange: startRange$2518,
                endRange: endRange$2519
            }, stx$2510);
        } else {
            var lineStart$2520, lineNumber$2521, range$2522;
            if (stx$2510 && stx$2510.token.type === parser$2454.Token.Delimiter) {
                lineStart$2520 = stx$2510.token.startLineStart;
                lineNumber$2521 = stx$2510.token.startLineNumber;
                range$2522 = stx$2510.token.startRange;
            } else if (stx$2510 && stx$2510.token) {
                lineStart$2520 = stx$2510.token.lineStart;
                lineNumber$2521 = stx$2510.token.lineNumber;
                range$2522 = stx$2510.token.range;
            }
            return syntaxFromToken$2463({
                type: type$2512,
                value: value$2511,
                lineStart: lineStart$2520,
                lineNumber: lineNumber$2521,
                range: range$2522
            }, stx$2510);
        }
    }
    function makeValue$2465(val$2523, stx$2524) {
        if (typeof val$2523 === 'boolean') {
            return mkSyntax$2464(stx$2524, val$2523 ? 'true' : 'false', parser$2454.Token.BooleanLiteral);
        } else if (typeof val$2523 === 'number') {
            if (val$2523 !== val$2523) {
                return makeDelim$2470('()', [
                    makeValue$2465(0, stx$2524),
                    makePunc$2469('/', stx$2524),
                    makeValue$2465(0, stx$2524)
                ], stx$2524);
            }
            if (val$2523 < 0) {
                return makeDelim$2470('()', [
                    makePunc$2469('-', stx$2524),
                    makeValue$2465(Math.abs(val$2523), stx$2524)
                ], stx$2524);
            } else {
                return mkSyntax$2464(stx$2524, val$2523, parser$2454.Token.NumericLiteral);
            }
        } else if (typeof val$2523 === 'string') {
            return mkSyntax$2464(stx$2524, val$2523, parser$2454.Token.StringLiteral);
        } else if (val$2523 === null) {
            return mkSyntax$2464(stx$2524, 'null', parser$2454.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2523);
        }
    }
    function makeRegex$2466(val$2525, flags$2526, stx$2527) {
        var newstx$2528 = mkSyntax$2464(stx$2527, new RegExp(val$2525, flags$2526), parser$2454.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2528.token.literal = val$2525;
        return newstx$2528;
    }
    function makeIdent$2467(val$2529, stx$2530) {
        return mkSyntax$2464(stx$2530, val$2529, parser$2454.Token.Identifier);
    }
    function makeKeyword$2468(val$2531, stx$2532) {
        return mkSyntax$2464(stx$2532, val$2531, parser$2454.Token.Keyword);
    }
    function makePunc$2469(val$2533, stx$2534) {
        return mkSyntax$2464(stx$2534, val$2533, parser$2454.Token.Punctuator);
    }
    function makeDelim$2470(val$2535, inner$2536, stx$2537) {
        return mkSyntax$2464(stx$2537, val$2535, parser$2454.Token.Delimiter, inner$2536);
    }
    function unwrapSyntax$2471(stx$2538) {
        if (Array.isArray(stx$2538) && stx$2538.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2538 = stx$2538[0];
        }
        if (stx$2538.token) {
            if (stx$2538.token.type === parser$2454.Token.Delimiter) {
                return stx$2538.token;
            } else {
                return stx$2538.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2538);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2472(stx$2539) {
        return _$2452.map(stx$2539, function (stx$2540) {
            if (stx$2540.token.inner) {
                stx$2540.token.inner = syntaxToTokens$2472(stx$2540.token.inner);
            }
            return stx$2540.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2473(tokens$2541) {
        if (!_$2452.isArray(tokens$2541)) {
            tokens$2541 = [tokens$2541];
        }
        return _$2452.map(tokens$2541, function (token$2542) {
            if (token$2542.inner) {
                token$2542.inner = tokensToSyntax$2473(token$2542.inner);
            }
            return syntaxFromToken$2463(token$2542);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2474(tojoin$2543, punc$2544) {
        if (tojoin$2543.length === 0) {
            return [];
        }
        if (punc$2544 === ' ') {
            return tojoin$2543;
        }
        return _$2452.reduce(_$2452.rest(tojoin$2543, 1), function (acc$2545, join$2546) {
            return acc$2545.concat(makePunc$2469(punc$2544, join$2546), join$2546);
        }, [_$2452.first(tojoin$2543)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2475(tojoin$2547, punc$2548) {
        if (tojoin$2547.length === 0) {
            return [];
        }
        if (punc$2548 === ' ') {
            return _$2452.flatten(tojoin$2547, true);
        }
        return _$2452.reduce(_$2452.rest(tojoin$2547, 1), function (acc$2549, join$2550) {
            return acc$2549.concat(makePunc$2469(punc$2548, _$2452.first(join$2550)), join$2550);
        }, _$2452.first(tojoin$2547));
    }
    function MacroSyntaxError$2476(name$2551, message$2552, stx$2553) {
        this.name = name$2551;
        this.message = message$2552;
        this.stx = stx$2553;
    }
    function throwSyntaxError$2477(name$2554, message$2555, stx$2556) {
        if (stx$2556 && Array.isArray(stx$2556)) {
            stx$2556 = stx$2556[0];
        }
        throw new MacroSyntaxError$2476(name$2554, message$2555, stx$2556);
    }
    function printSyntaxError$2478(code$2557, err$2558) {
        if (!err$2558.stx) {
            return '[' + err$2558.name + '] ' + err$2558.message;
        }
        var token$2559 = err$2558.stx.token;
        var lineNumber$2560 = token$2559.sm_startLineNumber || token$2559.sm_lineNumber || token$2559.startLineNumber || token$2559.lineNumber;
        var lineStart$2561 = token$2559.sm_startLineStart || token$2559.sm_lineStart || token$2559.startLineStart || token$2559.lineStart;
        var start$2562 = (token$2559.sm_startRange || token$2559.sm_range || token$2559.startRange || token$2559.range)[0];
        var offset$2563 = start$2562 - lineStart$2561;
        var line$2564 = '';
        var pre$2565 = lineNumber$2560 + ': ';
        var ch$2566;
        while (ch$2566 = code$2557.charAt(lineStart$2561++)) {
            if (ch$2566 == '\r' || ch$2566 == '\n') {
                break;
            }
            line$2564 += ch$2566;
        }
        return '[' + err$2558.name + '] ' + err$2558.message + '\n' + pre$2565 + line$2564 + '\n' + Array(offset$2563 + pre$2565.length).join(' ') + ' ^';
    }
    exports$2451.unwrapSyntax = unwrapSyntax$2471;
    exports$2451.makeDelim = makeDelim$2470;
    exports$2451.makePunc = makePunc$2469;
    exports$2451.makeKeyword = makeKeyword$2468;
    exports$2451.makeIdent = makeIdent$2467;
    exports$2451.makeRegex = makeRegex$2466;
    exports$2451.makeValue = makeValue$2465;
    exports$2451.Rename = Rename$2455;
    exports$2451.Mark = Mark$2456;
    exports$2451.Var = Var$2458;
    exports$2451.Def = Def$2457;
    exports$2451.isDef = isDef$2461;
    exports$2451.isMark = isMark$2460;
    exports$2451.isRename = isRename$2459;
    exports$2451.syntaxFromToken = syntaxFromToken$2463;
    exports$2451.tokensToSyntax = tokensToSyntax$2473;
    exports$2451.syntaxToTokens = syntaxToTokens$2472;
    exports$2451.joinSyntax = joinSyntax$2474;
    exports$2451.joinSyntaxArr = joinSyntaxArr$2475;
    exports$2451.MacroSyntaxError = MacroSyntaxError$2476;
    exports$2451.throwSyntaxError = throwSyntaxError$2477;
    exports$2451.printSyntaxError = printSyntaxError$2478;
}));
//# sourceMappingURL=syntax.js.map