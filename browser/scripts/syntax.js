(function (root$2452, factory$2453) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2453(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2453);
    }
}(this, function (exports$2454, _$2455, es6$2456, parser$2457) {
    // (CSyntax, Str) -> CContext
    function Rename$2458(id$2482, name$2483, ctx$2484, defctx$2485) {
        defctx$2485 = defctx$2485 || null;
        return {
            id: id$2482,
            name: name$2483,
            context: ctx$2484,
            def: defctx$2485
        };
    }
    // (Num) -> CContext
    function Mark$2459(mark$2486, ctx$2487) {
        return {
            mark: mark$2486,
            context: ctx$2487
        };
    }
    function Def$2460(defctx$2488, ctx$2489) {
        return {
            defctx: defctx$2488,
            context: ctx$2489
        };
    }
    function Var$2461(id$2490) {
        return { id: id$2490 };
    }
    function isRename$2462(r$2491) {
        return r$2491 && typeof r$2491.id !== 'undefined' && typeof r$2491.name !== 'undefined';
    }
    ;
    function isMark$2463(m$2492) {
        return m$2492 && typeof m$2492.mark !== 'undefined';
    }
    ;
    function isDef$2464(ctx$2493) {
        return ctx$2493 && typeof ctx$2493.defctx !== 'undefined';
    }
    function Syntax$2465(token$2494, oldstx$2495) {
        this.token = token$2494;
        this.context = oldstx$2495 && oldstx$2495.context ? oldstx$2495.context : null;
        this.deferredContext = oldstx$2495 && oldstx$2495.deferredContext ? oldstx$2495.deferredContext : null;
    }
    Syntax$2465.prototype = {
        mark: function (newMark$2496) {
            if (this.token.inner) {
                var next$2497 = syntaxFromToken$2466(this.token, this);
                next$2497.deferredContext = Mark$2459(newMark$2496, this.deferredContext);
                return next$2497;
            }
            return syntaxFromToken$2466(this.token, { context: Mark$2459(newMark$2496, this.context) });
        },
        rename: function (id$2498, name$2499, defctx$2500) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2501 = syntaxFromToken$2466(this.token, this);
                next$2501.deferredContext = Rename$2458(id$2498, name$2499, this.deferredContext, defctx$2500);
                return next$2501;
            }
            if (this.token.type === parser$2457.Token.Identifier || this.token.type === parser$2457.Token.Keyword || this.token.type === parser$2457.Token.Punctuator) {
                return syntaxFromToken$2466(this.token, { context: Rename$2458(id$2498, name$2499, this.context, defctx$2500) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2502) {
            if (this.token.inner) {
                var next$2503 = syntaxFromToken$2466(this.token, this);
                next$2503.deferredContext = Def$2460(defctx$2502, this.deferredContext);
                return next$2503;
            }
            return syntaxFromToken$2466(this.token, { context: Def$2460(defctx$2502, this.context) });
        },
        getDefCtx: function () {
            var ctx$2504 = this.context;
            while (ctx$2504 !== null) {
                if (isDef$2464(ctx$2504)) {
                    return ctx$2504.defctx;
                }
                ctx$2504 = ctx$2504.context;
            }
            return null;
        },
        expose: function () {
            parser$2457.assert(this.token.type === parser$2457.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2505(stxCtx$2506, ctx$2507) {
                if (ctx$2507 == null) {
                    return stxCtx$2506;
                } else if (isRename$2462(ctx$2507)) {
                    return Rename$2458(ctx$2507.id, ctx$2507.name, applyContext$2505(stxCtx$2506, ctx$2507.context), ctx$2507.def);
                } else if (isMark$2463(ctx$2507)) {
                    return Mark$2459(ctx$2507.mark, applyContext$2505(stxCtx$2506, ctx$2507.context));
                } else if (isDef$2464(ctx$2507)) {
                    return Def$2460(ctx$2507.defctx, applyContext$2505(stxCtx$2506, ctx$2507.context));
                } else {
                    parser$2457.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2455.map(this.token.inner, _$2455.bind(function (stx$2508) {
                if (stx$2508.token.inner) {
                    var next$2509 = syntaxFromToken$2466(stx$2508.token, stx$2508);
                    next$2509.deferredContext = applyContext$2505(stx$2508.deferredContext, this.deferredContext);
                    return next$2509;
                } else {
                    return syntaxFromToken$2466(stx$2508.token, { context: applyContext$2505(stx$2508.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2510 = this.token.type === parser$2457.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2510 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2466(token$2511, oldstx$2512) {
        return new Syntax$2465(token$2511, oldstx$2512);
    }
    function mkSyntax$2467(stx$2513, value$2514, type$2515, inner$2516) {
        if (stx$2513 && Array.isArray(stx$2513) && stx$2513.length === 1) {
            stx$2513 = stx$2513[0];
        } else if (stx$2513 && Array.isArray(stx$2513)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2513);
        }
        if (type$2515 === parser$2457.Token.Delimiter) {
            var startLineNumber$2517, startLineStart$2518, endLineNumber$2519, endLineStart$2520, startRange$2521, endRange$2522;
            if (!Array.isArray(inner$2516)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2513 && stx$2513.token.type === parser$2457.Token.Delimiter) {
                startLineNumber$2517 = stx$2513.token.startLineNumber;
                startLineStart$2518 = stx$2513.token.startLineStart;
                endLineNumber$2519 = stx$2513.token.endLineNumber;
                endLineStart$2520 = stx$2513.token.endLineStart;
                startRange$2521 = stx$2513.token.startRange;
                endRange$2522 = stx$2513.token.endRange;
            } else if (stx$2513 && stx$2513.token) {
                startLineNumber$2517 = stx$2513.token.lineNumber;
                startLineStart$2518 = stx$2513.token.lineStart;
                endLineNumber$2519 = stx$2513.token.lineNumber;
                endLineStart$2520 = stx$2513.token.lineStart;
                startRange$2521 = stx$2513.token.range;
                endRange$2522 = stx$2513.token.range;
            }
            return syntaxFromToken$2466({
                type: parser$2457.Token.Delimiter,
                value: value$2514,
                inner: inner$2516,
                startLineStart: startLineStart$2518,
                startLineNumber: startLineNumber$2517,
                endLineStart: endLineStart$2520,
                endLineNumber: endLineNumber$2519,
                startRange: startRange$2521,
                endRange: endRange$2522
            }, stx$2513);
        } else {
            var lineStart$2523, lineNumber$2524, range$2525;
            if (stx$2513 && stx$2513.token.type === parser$2457.Token.Delimiter) {
                lineStart$2523 = stx$2513.token.startLineStart;
                lineNumber$2524 = stx$2513.token.startLineNumber;
                range$2525 = stx$2513.token.startRange;
            } else if (stx$2513 && stx$2513.token) {
                lineStart$2523 = stx$2513.token.lineStart;
                lineNumber$2524 = stx$2513.token.lineNumber;
                range$2525 = stx$2513.token.range;
            }
            return syntaxFromToken$2466({
                type: type$2515,
                value: value$2514,
                lineStart: lineStart$2523,
                lineNumber: lineNumber$2524,
                range: range$2525
            }, stx$2513);
        }
    }
    function makeValue$2468(val$2526, stx$2527) {
        if (typeof val$2526 === 'boolean') {
            return mkSyntax$2467(stx$2527, val$2526 ? 'true' : 'false', parser$2457.Token.BooleanLiteral);
        } else if (typeof val$2526 === 'number') {
            if (val$2526 !== val$2526) {
                return makeDelim$2473('()', [
                    makeValue$2468(0, stx$2527),
                    makePunc$2472('/', stx$2527),
                    makeValue$2468(0, stx$2527)
                ], stx$2527);
            }
            if (val$2526 < 0) {
                return makeDelim$2473('()', [
                    makePunc$2472('-', stx$2527),
                    makeValue$2468(Math.abs(val$2526), stx$2527)
                ], stx$2527);
            } else {
                return mkSyntax$2467(stx$2527, val$2526, parser$2457.Token.NumericLiteral);
            }
        } else if (typeof val$2526 === 'string') {
            return mkSyntax$2467(stx$2527, val$2526, parser$2457.Token.StringLiteral);
        } else if (val$2526 === null) {
            return mkSyntax$2467(stx$2527, 'null', parser$2457.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2526);
        }
    }
    function makeRegex$2469(val$2528, flags$2529, stx$2530) {
        var newstx$2531 = mkSyntax$2467(stx$2530, new RegExp(val$2528, flags$2529), parser$2457.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2531.token.literal = val$2528;
        return newstx$2531;
    }
    function makeIdent$2470(val$2532, stx$2533) {
        return mkSyntax$2467(stx$2533, val$2532, parser$2457.Token.Identifier);
    }
    function makeKeyword$2471(val$2534, stx$2535) {
        return mkSyntax$2467(stx$2535, val$2534, parser$2457.Token.Keyword);
    }
    function makePunc$2472(val$2536, stx$2537) {
        return mkSyntax$2467(stx$2537, val$2536, parser$2457.Token.Punctuator);
    }
    function makeDelim$2473(val$2538, inner$2539, stx$2540) {
        return mkSyntax$2467(stx$2540, val$2538, parser$2457.Token.Delimiter, inner$2539);
    }
    function unwrapSyntax$2474(stx$2541) {
        if (Array.isArray(stx$2541) && stx$2541.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2541 = stx$2541[0];
        }
        if (stx$2541.token) {
            if (stx$2541.token.type === parser$2457.Token.Delimiter) {
                return stx$2541.token;
            } else {
                return stx$2541.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2541);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2475(stx$2542) {
        return _$2455.map(stx$2542, function (stx$2543) {
            if (stx$2543.token.inner) {
                stx$2543.token.inner = syntaxToTokens$2475(stx$2543.token.inner);
            }
            return stx$2543.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2476(tokens$2544) {
        if (!_$2455.isArray(tokens$2544)) {
            tokens$2544 = [tokens$2544];
        }
        return _$2455.map(tokens$2544, function (token$2545) {
            if (token$2545.inner) {
                token$2545.inner = tokensToSyntax$2476(token$2545.inner);
            }
            return syntaxFromToken$2466(token$2545);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2477(tojoin$2546, punc$2547) {
        if (tojoin$2546.length === 0) {
            return [];
        }
        if (punc$2547 === ' ') {
            return tojoin$2546;
        }
        return _$2455.reduce(_$2455.rest(tojoin$2546, 1), function (acc$2548, join$2549) {
            return acc$2548.concat(makePunc$2472(punc$2547, join$2549), join$2549);
        }, [_$2455.first(tojoin$2546)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2478(tojoin$2550, punc$2551) {
        if (tojoin$2550.length === 0) {
            return [];
        }
        if (punc$2551 === ' ') {
            return _$2455.flatten(tojoin$2550, true);
        }
        return _$2455.reduce(_$2455.rest(tojoin$2550, 1), function (acc$2552, join$2553) {
            return acc$2552.concat(makePunc$2472(punc$2551, _$2455.first(join$2553)), join$2553);
        }, _$2455.first(tojoin$2550));
    }
    function MacroSyntaxError$2479(name$2554, message$2555, stx$2556) {
        this.name = name$2554;
        this.message = message$2555;
        this.stx = stx$2556;
    }
    function throwSyntaxError$2480(name$2557, message$2558, stx$2559) {
        if (stx$2559 && Array.isArray(stx$2559)) {
            stx$2559 = stx$2559[0];
        }
        throw new MacroSyntaxError$2479(name$2557, message$2558, stx$2559);
    }
    function printSyntaxError$2481(code$2560, err$2561) {
        if (!err$2561.stx) {
            return '[' + err$2561.name + '] ' + err$2561.message;
        }
        var token$2562 = err$2561.stx.token;
        var lineNumber$2563 = token$2562.sm_startLineNumber || token$2562.sm_lineNumber || token$2562.startLineNumber || token$2562.lineNumber;
        var lineStart$2564 = token$2562.sm_startLineStart || token$2562.sm_lineStart || token$2562.startLineStart || token$2562.lineStart;
        var start$2565 = (token$2562.sm_startRange || token$2562.sm_range || token$2562.startRange || token$2562.range)[0];
        var offset$2566 = start$2565 - lineStart$2564;
        var line$2567 = '';
        var pre$2568 = lineNumber$2563 + ': ';
        var ch$2569;
        while (ch$2569 = code$2560.charAt(lineStart$2564++)) {
            if (ch$2569 == '\r' || ch$2569 == '\n') {
                break;
            }
            line$2567 += ch$2569;
        }
        return '[' + err$2561.name + '] ' + err$2561.message + '\n' + pre$2568 + line$2567 + '\n' + Array(offset$2566 + pre$2568.length).join(' ') + ' ^';
    }
    exports$2454.unwrapSyntax = unwrapSyntax$2474;
    exports$2454.makeDelim = makeDelim$2473;
    exports$2454.makePunc = makePunc$2472;
    exports$2454.makeKeyword = makeKeyword$2471;
    exports$2454.makeIdent = makeIdent$2470;
    exports$2454.makeRegex = makeRegex$2469;
    exports$2454.makeValue = makeValue$2468;
    exports$2454.Rename = Rename$2458;
    exports$2454.Mark = Mark$2459;
    exports$2454.Var = Var$2461;
    exports$2454.Def = Def$2460;
    exports$2454.isDef = isDef$2464;
    exports$2454.isMark = isMark$2463;
    exports$2454.isRename = isRename$2462;
    exports$2454.syntaxFromToken = syntaxFromToken$2466;
    exports$2454.tokensToSyntax = tokensToSyntax$2476;
    exports$2454.syntaxToTokens = syntaxToTokens$2475;
    exports$2454.joinSyntax = joinSyntax$2477;
    exports$2454.joinSyntaxArr = joinSyntaxArr$2478;
    exports$2454.MacroSyntaxError = MacroSyntaxError$2479;
    exports$2454.throwSyntaxError = throwSyntaxError$2480;
    exports$2454.printSyntaxError = printSyntaxError$2481;
}));
//# sourceMappingURL=syntax.js.map