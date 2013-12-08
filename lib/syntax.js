(function (root$2441, factory$2442) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2442(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2442);
    }
}(this, function (exports$2443, _$2444, es6$2445, parser$2446) {
    // (CSyntax, Str) -> CContext
    function Rename$2447(id$2471, name$2472, ctx$2473, defctx$2474) {
        defctx$2474 = defctx$2474 || null;
        return {
            id: id$2471,
            name: name$2472,
            context: ctx$2473,
            def: defctx$2474
        };
    }
    // (Num) -> CContext
    function Mark$2448(mark$2475, ctx$2476) {
        return {
            mark: mark$2475,
            context: ctx$2476
        };
    }
    function Def$2449(defctx$2477, ctx$2478) {
        return {
            defctx: defctx$2477,
            context: ctx$2478
        };
    }
    function Var$2450(id$2479) {
        return { id: id$2479 };
    }
    function isRename$2451(r$2480) {
        return r$2480 && typeof r$2480.id !== 'undefined' && typeof r$2480.name !== 'undefined';
    }
    ;
    function isMark$2452(m$2481) {
        return m$2481 && typeof m$2481.mark !== 'undefined';
    }
    ;
    function isDef$2453(ctx$2482) {
        return ctx$2482 && typeof ctx$2482.defctx !== 'undefined';
    }
    function Syntax$2454(token$2483, oldstx$2484) {
        this.token = token$2483;
        this.context = oldstx$2484 && oldstx$2484.context ? oldstx$2484.context : null;
        this.deferredContext = oldstx$2484 && oldstx$2484.deferredContext ? oldstx$2484.deferredContext : null;
    }
    Syntax$2454.prototype = {
        mark: function (newMark$2485) {
            if (this.token.inner) {
                var next$2486 = syntaxFromToken$2455(this.token, this);
                next$2486.deferredContext = Mark$2448(newMark$2485, this.deferredContext);
                return next$2486;
            }
            return syntaxFromToken$2455(this.token, { context: Mark$2448(newMark$2485, this.context) });
        },
        rename: function (id$2487, name$2488, defctx$2489) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2490 = syntaxFromToken$2455(this.token, this);
                next$2490.deferredContext = Rename$2447(id$2487, name$2488, this.deferredContext, defctx$2489);
                return next$2490;
            }
            if (this.token.type === parser$2446.Token.Identifier || this.token.type === parser$2446.Token.Keyword || this.token.type === parser$2446.Token.Punctuator) {
                return syntaxFromToken$2455(this.token, { context: Rename$2447(id$2487, name$2488, this.context, defctx$2489) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2491) {
            if (this.token.inner) {
                var next$2492 = syntaxFromToken$2455(this.token, this);
                next$2492.deferredContext = Def$2449(defctx$2491, this.deferredContext);
                return next$2492;
            }
            return syntaxFromToken$2455(this.token, { context: Def$2449(defctx$2491, this.context) });
        },
        getDefCtx: function () {
            var ctx$2493 = this.context;
            while (ctx$2493 !== null) {
                if (isDef$2453(ctx$2493)) {
                    return ctx$2493.defctx;
                }
                ctx$2493 = ctx$2493.context;
            }
            return null;
        },
        expose: function () {
            parser$2446.assert(this.token.type === parser$2446.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2494(stxCtx$2495, ctx$2496) {
                if (ctx$2496 == null) {
                    return stxCtx$2495;
                } else if (isRename$2451(ctx$2496)) {
                    return Rename$2447(ctx$2496.id, ctx$2496.name, applyContext$2494(stxCtx$2495, ctx$2496.context), ctx$2496.def);
                } else if (isMark$2452(ctx$2496)) {
                    return Mark$2448(ctx$2496.mark, applyContext$2494(stxCtx$2495, ctx$2496.context));
                } else if (isDef$2453(ctx$2496)) {
                    return Def$2449(ctx$2496.defctx, applyContext$2494(stxCtx$2495, ctx$2496.context));
                } else {
                    parser$2446.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2444.map(this.token.inner, _$2444.bind(function (stx$2497) {
                if (stx$2497.token.inner) {
                    var next$2498 = syntaxFromToken$2455(stx$2497.token, stx$2497);
                    next$2498.deferredContext = applyContext$2494(stx$2497.deferredContext, this.deferredContext);
                    return next$2498;
                } else {
                    return syntaxFromToken$2455(stx$2497.token, { context: applyContext$2494(stx$2497.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2499 = this.token.type === parser$2446.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2499 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2455(token$2500, oldstx$2501) {
        return new Syntax$2454(token$2500, oldstx$2501);
    }
    function mkSyntax$2456(stx$2502, value$2503, type$2504, inner$2505) {
        if (stx$2502 && Array.isArray(stx$2502) && stx$2502.length === 1) {
            stx$2502 = stx$2502[0];
        } else if (stx$2502 && Array.isArray(stx$2502)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2502);
        }
        if (type$2504 === parser$2446.Token.Delimiter) {
            var startLineNumber$2506, startLineStart$2507, endLineNumber$2508, endLineStart$2509, startRange$2510, endRange$2511;
            if (!Array.isArray(inner$2505)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2502 && stx$2502.token.type === parser$2446.Token.Delimiter) {
                startLineNumber$2506 = stx$2502.token.startLineNumber;
                startLineStart$2507 = stx$2502.token.startLineStart;
                endLineNumber$2508 = stx$2502.token.endLineNumber;
                endLineStart$2509 = stx$2502.token.endLineStart;
                startRange$2510 = stx$2502.token.startRange;
                endRange$2511 = stx$2502.token.endRange;
            } else if (stx$2502 && stx$2502.token) {
                startLineNumber$2506 = stx$2502.token.lineNumber;
                startLineStart$2507 = stx$2502.token.lineStart;
                endLineNumber$2508 = stx$2502.token.lineNumber;
                endLineStart$2509 = stx$2502.token.lineStart;
                startRange$2510 = stx$2502.token.range;
                endRange$2511 = stx$2502.token.range;
            }
            return syntaxFromToken$2455({
                type: parser$2446.Token.Delimiter,
                value: value$2503,
                inner: inner$2505,
                startLineStart: startLineStart$2507,
                startLineNumber: startLineNumber$2506,
                endLineStart: endLineStart$2509,
                endLineNumber: endLineNumber$2508,
                startRange: startRange$2510,
                endRange: endRange$2511
            }, stx$2502);
        } else {
            var lineStart$2512, lineNumber$2513, range$2514;
            if (stx$2502 && stx$2502.token.type === parser$2446.Token.Delimiter) {
                lineStart$2512 = stx$2502.token.startLineStart;
                lineNumber$2513 = stx$2502.token.startLineNumber;
                range$2514 = stx$2502.token.startRange;
            } else if (stx$2502 && stx$2502.token) {
                lineStart$2512 = stx$2502.token.lineStart;
                lineNumber$2513 = stx$2502.token.lineNumber;
                range$2514 = stx$2502.token.range;
            }
            return syntaxFromToken$2455({
                type: type$2504,
                value: value$2503,
                lineStart: lineStart$2512,
                lineNumber: lineNumber$2513,
                range: range$2514
            }, stx$2502);
        }
    }
    function makeValue$2457(val$2515, stx$2516) {
        if (typeof val$2515 === 'boolean') {
            return mkSyntax$2456(stx$2516, val$2515 ? 'true' : 'false', parser$2446.Token.BooleanLiteral);
        } else if (typeof val$2515 === 'number') {
            if (val$2515 !== val$2515) {
                return makeDelim$2462('()', [
                    makeValue$2457(0, stx$2516),
                    makePunc$2461('/', stx$2516),
                    makeValue$2457(0, stx$2516)
                ], stx$2516);
            }
            if (val$2515 < 0) {
                return makeDelim$2462('()', [
                    makePunc$2461('-', stx$2516),
                    makeValue$2457(Math.abs(val$2515), stx$2516)
                ], stx$2516);
            } else {
                return mkSyntax$2456(stx$2516, val$2515, parser$2446.Token.NumericLiteral);
            }
        } else if (typeof val$2515 === 'string') {
            return mkSyntax$2456(stx$2516, val$2515, parser$2446.Token.StringLiteral);
        } else if (val$2515 === null) {
            return mkSyntax$2456(stx$2516, 'null', parser$2446.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2515);
        }
    }
    function makeRegex$2458(val$2517, flags$2518, stx$2519) {
        var newstx$2520 = mkSyntax$2456(stx$2519, new RegExp(val$2517, flags$2518), parser$2446.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2520.token.literal = val$2517;
        return newstx$2520;
    }
    function makeIdent$2459(val$2521, stx$2522) {
        return mkSyntax$2456(stx$2522, val$2521, parser$2446.Token.Identifier);
    }
    function makeKeyword$2460(val$2523, stx$2524) {
        return mkSyntax$2456(stx$2524, val$2523, parser$2446.Token.Keyword);
    }
    function makePunc$2461(val$2525, stx$2526) {
        return mkSyntax$2456(stx$2526, val$2525, parser$2446.Token.Punctuator);
    }
    function makeDelim$2462(val$2527, inner$2528, stx$2529) {
        return mkSyntax$2456(stx$2529, val$2527, parser$2446.Token.Delimiter, inner$2528);
    }
    function unwrapSyntax$2463(stx$2530) {
        if (Array.isArray(stx$2530) && stx$2530.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2530 = stx$2530[0];
        }
        if (stx$2530.token) {
            if (stx$2530.token.type === parser$2446.Token.Delimiter) {
                return stx$2530.token;
            } else {
                return stx$2530.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2530);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2464(stx$2531) {
        return _$2444.map(stx$2531, function (stx$2532) {
            if (stx$2532.token.inner) {
                stx$2532.token.inner = syntaxToTokens$2464(stx$2532.token.inner);
            }
            return stx$2532.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2465(tokens$2533) {
        if (!_$2444.isArray(tokens$2533)) {
            tokens$2533 = [tokens$2533];
        }
        return _$2444.map(tokens$2533, function (token$2534) {
            if (token$2534.inner) {
                token$2534.inner = tokensToSyntax$2465(token$2534.inner);
            }
            return syntaxFromToken$2455(token$2534);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2466(tojoin$2535, punc$2536) {
        if (tojoin$2535.length === 0) {
            return [];
        }
        if (punc$2536 === ' ') {
            return tojoin$2535;
        }
        return _$2444.reduce(_$2444.rest(tojoin$2535, 1), function (acc$2537, join$2538) {
            return acc$2537.concat(makePunc$2461(punc$2536, join$2538), join$2538);
        }, [_$2444.first(tojoin$2535)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2467(tojoin$2539, punc$2540) {
        if (tojoin$2539.length === 0) {
            return [];
        }
        if (punc$2540 === ' ') {
            return _$2444.flatten(tojoin$2539, true);
        }
        return _$2444.reduce(_$2444.rest(tojoin$2539, 1), function (acc$2541, join$2542) {
            return acc$2541.concat(makePunc$2461(punc$2540, _$2444.first(join$2542)), join$2542);
        }, _$2444.first(tojoin$2539));
    }
    function MacroSyntaxError$2468(name$2543, message$2544, stx$2545) {
        this.name = name$2543;
        this.message = message$2544;
        this.stx = stx$2545;
    }
    function throwSyntaxError$2469(name$2546, message$2547, stx$2548) {
        if (stx$2548 && Array.isArray(stx$2548)) {
            stx$2548 = stx$2548[0];
        }
        throw new MacroSyntaxError$2468(name$2546, message$2547, stx$2548);
    }
    function printSyntaxError$2470(code$2549, err$2550) {
        if (!err$2550.stx) {
            return '[' + err$2550.name + '] ' + err$2550.message;
        }
        var token$2551 = err$2550.stx.token;
        var lineNumber$2552 = token$2551.sm_startLineNumber || token$2551.sm_lineNumber || token$2551.startLineNumber || token$2551.lineNumber;
        var lineStart$2553 = token$2551.sm_startLineStart || token$2551.sm_lineStart || token$2551.startLineStart || token$2551.lineStart;
        var start$2554 = (token$2551.sm_startRange || token$2551.sm_range || token$2551.startRange || token$2551.range)[0];
        var offset$2555 = start$2554 - lineStart$2553;
        var line$2556 = '';
        var pre$2557 = lineNumber$2552 + ': ';
        var ch$2558;
        while (ch$2558 = code$2549.charAt(lineStart$2553++)) {
            if (ch$2558 == '\r' || ch$2558 == '\n') {
                break;
            }
            line$2556 += ch$2558;
        }
        return '[' + err$2550.name + '] ' + err$2550.message + '\n' + pre$2557 + line$2556 + '\n' + Array(offset$2555 + pre$2557.length).join(' ') + ' ^';
    }
    exports$2443.unwrapSyntax = unwrapSyntax$2463;
    exports$2443.makeDelim = makeDelim$2462;
    exports$2443.makePunc = makePunc$2461;
    exports$2443.makeKeyword = makeKeyword$2460;
    exports$2443.makeIdent = makeIdent$2459;
    exports$2443.makeRegex = makeRegex$2458;
    exports$2443.makeValue = makeValue$2457;
    exports$2443.Rename = Rename$2447;
    exports$2443.Mark = Mark$2448;
    exports$2443.Var = Var$2450;
    exports$2443.Def = Def$2449;
    exports$2443.isDef = isDef$2453;
    exports$2443.isMark = isMark$2452;
    exports$2443.isRename = isRename$2451;
    exports$2443.syntaxFromToken = syntaxFromToken$2455;
    exports$2443.tokensToSyntax = tokensToSyntax$2465;
    exports$2443.syntaxToTokens = syntaxToTokens$2464;
    exports$2443.joinSyntax = joinSyntax$2466;
    exports$2443.joinSyntaxArr = joinSyntaxArr$2467;
    exports$2443.MacroSyntaxError = MacroSyntaxError$2468;
    exports$2443.throwSyntaxError = throwSyntaxError$2469;
    exports$2443.printSyntaxError = printSyntaxError$2470;
}));
//# sourceMappingURL=syntax.js.map