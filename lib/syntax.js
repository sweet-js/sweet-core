(function (root$2444, factory$2445) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2445(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2445);
    }
}(this, function (exports$2446, _$2447, es6$2448, parser$2449) {
    // (CSyntax, Str) -> CContext
    function Rename$2450(id$2474, name$2475, ctx$2476, defctx$2477) {
        defctx$2477 = defctx$2477 || null;
        return {
            id: id$2474,
            name: name$2475,
            context: ctx$2476,
            def: defctx$2477
        };
    }
    // (Num) -> CContext
    function Mark$2451(mark$2478, ctx$2479) {
        return {
            mark: mark$2478,
            context: ctx$2479
        };
    }
    function Def$2452(defctx$2480, ctx$2481) {
        return {
            defctx: defctx$2480,
            context: ctx$2481
        };
    }
    function Var$2453(id$2482) {
        return { id: id$2482 };
    }
    function isRename$2454(r$2483) {
        return r$2483 && typeof r$2483.id !== 'undefined' && typeof r$2483.name !== 'undefined';
    }
    ;
    function isMark$2455(m$2484) {
        return m$2484 && typeof m$2484.mark !== 'undefined';
    }
    ;
    function isDef$2456(ctx$2485) {
        return ctx$2485 && typeof ctx$2485.defctx !== 'undefined';
    }
    function Syntax$2457(token$2486, oldstx$2487) {
        this.token = token$2486;
        this.context = oldstx$2487 && oldstx$2487.context ? oldstx$2487.context : null;
        this.deferredContext = oldstx$2487 && oldstx$2487.deferredContext ? oldstx$2487.deferredContext : null;
    }
    Syntax$2457.prototype = {
        mark: function (newMark$2488) {
            if (this.token.inner) {
                var next$2489 = syntaxFromToken$2458(this.token, this);
                next$2489.deferredContext = Mark$2451(newMark$2488, this.deferredContext);
                return next$2489;
            }
            return syntaxFromToken$2458(this.token, { context: Mark$2451(newMark$2488, this.context) });
        },
        rename: function (id$2490, name$2491, defctx$2492) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2493 = syntaxFromToken$2458(this.token, this);
                next$2493.deferredContext = Rename$2450(id$2490, name$2491, this.deferredContext, defctx$2492);
                return next$2493;
            }
            if (this.token.type === parser$2449.Token.Identifier || this.token.type === parser$2449.Token.Keyword || this.token.type === parser$2449.Token.Punctuator) {
                return syntaxFromToken$2458(this.token, { context: Rename$2450(id$2490, name$2491, this.context, defctx$2492) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2494) {
            if (this.token.inner) {
                var next$2495 = syntaxFromToken$2458(this.token, this);
                next$2495.deferredContext = Def$2452(defctx$2494, this.deferredContext);
                return next$2495;
            }
            return syntaxFromToken$2458(this.token, { context: Def$2452(defctx$2494, this.context) });
        },
        getDefCtx: function () {
            var ctx$2496 = this.context;
            while (ctx$2496 !== null) {
                if (isDef$2456(ctx$2496)) {
                    return ctx$2496.defctx;
                }
                ctx$2496 = ctx$2496.context;
            }
            return null;
        },
        expose: function () {
            parser$2449.assert(this.token.type === parser$2449.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2497(stxCtx$2498, ctx$2499) {
                if (ctx$2499 == null) {
                    return stxCtx$2498;
                } else if (isRename$2454(ctx$2499)) {
                    return Rename$2450(ctx$2499.id, ctx$2499.name, applyContext$2497(stxCtx$2498, ctx$2499.context), ctx$2499.def);
                } else if (isMark$2455(ctx$2499)) {
                    return Mark$2451(ctx$2499.mark, applyContext$2497(stxCtx$2498, ctx$2499.context));
                } else if (isDef$2456(ctx$2499)) {
                    return Def$2452(ctx$2499.defctx, applyContext$2497(stxCtx$2498, ctx$2499.context));
                } else {
                    parser$2449.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2447.map(this.token.inner, _$2447.bind(function (stx$2500) {
                if (stx$2500.token.inner) {
                    var next$2501 = syntaxFromToken$2458(stx$2500.token, stx$2500);
                    next$2501.deferredContext = applyContext$2497(stx$2500.deferredContext, this.deferredContext);
                    return next$2501;
                } else {
                    return syntaxFromToken$2458(stx$2500.token, { context: applyContext$2497(stx$2500.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2502 = this.token.type === parser$2449.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2502 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2458(token$2503, oldstx$2504) {
        return new Syntax$2457(token$2503, oldstx$2504);
    }
    function mkSyntax$2459(stx$2505, value$2506, type$2507, inner$2508) {
        if (stx$2505 && Array.isArray(stx$2505) && stx$2505.length === 1) {
            stx$2505 = stx$2505[0];
        } else if (stx$2505 && Array.isArray(stx$2505)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2505);
        }
        if (type$2507 === parser$2449.Token.Delimiter) {
            var startLineNumber$2509, startLineStart$2510, endLineNumber$2511, endLineStart$2512, startRange$2513, endRange$2514;
            if (!Array.isArray(inner$2508)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2505 && stx$2505.token.type === parser$2449.Token.Delimiter) {
                startLineNumber$2509 = stx$2505.token.startLineNumber;
                startLineStart$2510 = stx$2505.token.startLineStart;
                endLineNumber$2511 = stx$2505.token.endLineNumber;
                endLineStart$2512 = stx$2505.token.endLineStart;
                startRange$2513 = stx$2505.token.startRange;
                endRange$2514 = stx$2505.token.endRange;
            } else if (stx$2505 && stx$2505.token) {
                startLineNumber$2509 = stx$2505.token.lineNumber;
                startLineStart$2510 = stx$2505.token.lineStart;
                endLineNumber$2511 = stx$2505.token.lineNumber;
                endLineStart$2512 = stx$2505.token.lineStart;
                startRange$2513 = stx$2505.token.range;
                endRange$2514 = stx$2505.token.range;
            }
            return syntaxFromToken$2458({
                type: parser$2449.Token.Delimiter,
                value: value$2506,
                inner: inner$2508,
                startLineStart: startLineStart$2510,
                startLineNumber: startLineNumber$2509,
                endLineStart: endLineStart$2512,
                endLineNumber: endLineNumber$2511,
                startRange: startRange$2513,
                endRange: endRange$2514
            }, stx$2505);
        } else {
            var lineStart$2515, lineNumber$2516, range$2517;
            if (stx$2505 && stx$2505.token.type === parser$2449.Token.Delimiter) {
                lineStart$2515 = stx$2505.token.startLineStart;
                lineNumber$2516 = stx$2505.token.startLineNumber;
                range$2517 = stx$2505.token.startRange;
            } else if (stx$2505 && stx$2505.token) {
                lineStart$2515 = stx$2505.token.lineStart;
                lineNumber$2516 = stx$2505.token.lineNumber;
                range$2517 = stx$2505.token.range;
            }
            return syntaxFromToken$2458({
                type: type$2507,
                value: value$2506,
                lineStart: lineStart$2515,
                lineNumber: lineNumber$2516,
                range: range$2517
            }, stx$2505);
        }
    }
    function makeValue$2460(val$2518, stx$2519) {
        if (typeof val$2518 === 'boolean') {
            return mkSyntax$2459(stx$2519, val$2518 ? 'true' : 'false', parser$2449.Token.BooleanLiteral);
        } else if (typeof val$2518 === 'number') {
            if (val$2518 !== val$2518) {
                return makeDelim$2465('()', [
                    makeValue$2460(0, stx$2519),
                    makePunc$2464('/', stx$2519),
                    makeValue$2460(0, stx$2519)
                ], stx$2519);
            }
            if (val$2518 < 0) {
                return makeDelim$2465('()', [
                    makePunc$2464('-', stx$2519),
                    makeValue$2460(Math.abs(val$2518), stx$2519)
                ], stx$2519);
            } else {
                return mkSyntax$2459(stx$2519, val$2518, parser$2449.Token.NumericLiteral);
            }
        } else if (typeof val$2518 === 'string') {
            return mkSyntax$2459(stx$2519, val$2518, parser$2449.Token.StringLiteral);
        } else if (val$2518 === null) {
            return mkSyntax$2459(stx$2519, 'null', parser$2449.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2518);
        }
    }
    function makeRegex$2461(val$2520, flags$2521, stx$2522) {
        var newstx$2523 = mkSyntax$2459(stx$2522, new RegExp(val$2520, flags$2521), parser$2449.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2523.token.literal = val$2520;
        return newstx$2523;
    }
    function makeIdent$2462(val$2524, stx$2525) {
        return mkSyntax$2459(stx$2525, val$2524, parser$2449.Token.Identifier);
    }
    function makeKeyword$2463(val$2526, stx$2527) {
        return mkSyntax$2459(stx$2527, val$2526, parser$2449.Token.Keyword);
    }
    function makePunc$2464(val$2528, stx$2529) {
        return mkSyntax$2459(stx$2529, val$2528, parser$2449.Token.Punctuator);
    }
    function makeDelim$2465(val$2530, inner$2531, stx$2532) {
        return mkSyntax$2459(stx$2532, val$2530, parser$2449.Token.Delimiter, inner$2531);
    }
    function unwrapSyntax$2466(stx$2533) {
        if (Array.isArray(stx$2533) && stx$2533.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2533 = stx$2533[0];
        }
        if (stx$2533.token) {
            if (stx$2533.token.type === parser$2449.Token.Delimiter) {
                return stx$2533.token;
            } else {
                return stx$2533.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2533);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2467(stx$2534) {
        return _$2447.map(stx$2534, function (stx$2535) {
            if (stx$2535.token.inner) {
                stx$2535.token.inner = syntaxToTokens$2467(stx$2535.token.inner);
            }
            return stx$2535.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2468(tokens$2536) {
        if (!_$2447.isArray(tokens$2536)) {
            tokens$2536 = [tokens$2536];
        }
        return _$2447.map(tokens$2536, function (token$2537) {
            if (token$2537.inner) {
                token$2537.inner = tokensToSyntax$2468(token$2537.inner);
            }
            return syntaxFromToken$2458(token$2537);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2469(tojoin$2538, punc$2539) {
        if (tojoin$2538.length === 0) {
            return [];
        }
        if (punc$2539 === ' ') {
            return tojoin$2538;
        }
        return _$2447.reduce(_$2447.rest(tojoin$2538, 1), function (acc$2540, join$2541) {
            return acc$2540.concat(makePunc$2464(punc$2539, join$2541), join$2541);
        }, [_$2447.first(tojoin$2538)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2470(tojoin$2542, punc$2543) {
        if (tojoin$2542.length === 0) {
            return [];
        }
        if (punc$2543 === ' ') {
            return _$2447.flatten(tojoin$2542, true);
        }
        return _$2447.reduce(_$2447.rest(tojoin$2542, 1), function (acc$2544, join$2545) {
            return acc$2544.concat(makePunc$2464(punc$2543, _$2447.first(join$2545)), join$2545);
        }, _$2447.first(tojoin$2542));
    }
    function MacroSyntaxError$2471(name$2546, message$2547, stx$2548) {
        this.name = name$2546;
        this.message = message$2547;
        this.stx = stx$2548;
    }
    function throwSyntaxError$2472(name$2549, message$2550, stx$2551) {
        if (stx$2551 && Array.isArray(stx$2551)) {
            stx$2551 = stx$2551[0];
        }
        throw new MacroSyntaxError$2471(name$2549, message$2550, stx$2551);
    }
    function printSyntaxError$2473(code$2552, err$2553) {
        if (!err$2553.stx) {
            return '[' + err$2553.name + '] ' + err$2553.message;
        }
        var token$2554 = err$2553.stx.token;
        var lineNumber$2555 = token$2554.sm_startLineNumber || token$2554.sm_lineNumber || token$2554.startLineNumber || token$2554.lineNumber;
        var lineStart$2556 = token$2554.sm_startLineStart || token$2554.sm_lineStart || token$2554.startLineStart || token$2554.lineStart;
        var start$2557 = (token$2554.sm_startRange || token$2554.sm_range || token$2554.startRange || token$2554.range)[0];
        var offset$2558 = start$2557 - lineStart$2556;
        var line$2559 = '';
        var pre$2560 = lineNumber$2555 + ': ';
        var ch$2561;
        while (ch$2561 = code$2552.charAt(lineStart$2556++)) {
            if (ch$2561 == '\r' || ch$2561 == '\n') {
                break;
            }
            line$2559 += ch$2561;
        }
        return '[' + err$2553.name + '] ' + err$2553.message + '\n' + pre$2560 + line$2559 + '\n' + Array(offset$2558 + pre$2560.length).join(' ') + ' ^';
    }
    exports$2446.unwrapSyntax = unwrapSyntax$2466;
    exports$2446.makeDelim = makeDelim$2465;
    exports$2446.makePunc = makePunc$2464;
    exports$2446.makeKeyword = makeKeyword$2463;
    exports$2446.makeIdent = makeIdent$2462;
    exports$2446.makeRegex = makeRegex$2461;
    exports$2446.makeValue = makeValue$2460;
    exports$2446.Rename = Rename$2450;
    exports$2446.Mark = Mark$2451;
    exports$2446.Var = Var$2453;
    exports$2446.Def = Def$2452;
    exports$2446.isDef = isDef$2456;
    exports$2446.isMark = isMark$2455;
    exports$2446.isRename = isRename$2454;
    exports$2446.syntaxFromToken = syntaxFromToken$2458;
    exports$2446.tokensToSyntax = tokensToSyntax$2468;
    exports$2446.syntaxToTokens = syntaxToTokens$2467;
    exports$2446.joinSyntax = joinSyntax$2469;
    exports$2446.joinSyntaxArr = joinSyntaxArr$2470;
    exports$2446.MacroSyntaxError = MacroSyntaxError$2471;
    exports$2446.throwSyntaxError = throwSyntaxError$2472;
    exports$2446.printSyntaxError = printSyntaxError$2473;
}));
//# sourceMappingURL=syntax.js.map