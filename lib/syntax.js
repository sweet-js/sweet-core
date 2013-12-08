(function (root$2447, factory$2448) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2448(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2448);
    }
}(this, function (exports$2449, _$2450, es6$2451, parser$2452) {
    // (CSyntax, Str) -> CContext
    function Rename$2453(id$2477, name$2478, ctx$2479, defctx$2480) {
        defctx$2480 = defctx$2480 || null;
        return {
            id: id$2477,
            name: name$2478,
            context: ctx$2479,
            def: defctx$2480
        };
    }
    // (Num) -> CContext
    function Mark$2454(mark$2481, ctx$2482) {
        return {
            mark: mark$2481,
            context: ctx$2482
        };
    }
    function Def$2455(defctx$2483, ctx$2484) {
        return {
            defctx: defctx$2483,
            context: ctx$2484
        };
    }
    function Var$2456(id$2485) {
        return { id: id$2485 };
    }
    function isRename$2457(r$2486) {
        return r$2486 && typeof r$2486.id !== 'undefined' && typeof r$2486.name !== 'undefined';
    }
    ;
    function isMark$2458(m$2487) {
        return m$2487 && typeof m$2487.mark !== 'undefined';
    }
    ;
    function isDef$2459(ctx$2488) {
        return ctx$2488 && typeof ctx$2488.defctx !== 'undefined';
    }
    function Syntax$2460(token$2489, oldstx$2490) {
        this.token = token$2489;
        this.context = oldstx$2490 && oldstx$2490.context ? oldstx$2490.context : null;
        this.deferredContext = oldstx$2490 && oldstx$2490.deferredContext ? oldstx$2490.deferredContext : null;
    }
    Syntax$2460.prototype = {
        mark: function (newMark$2491) {
            if (this.token.inner) {
                var next$2492 = syntaxFromToken$2461(this.token, this);
                next$2492.deferredContext = Mark$2454(newMark$2491, this.deferredContext);
                return next$2492;
            }
            return syntaxFromToken$2461(this.token, { context: Mark$2454(newMark$2491, this.context) });
        },
        rename: function (id$2493, name$2494, defctx$2495) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2496 = syntaxFromToken$2461(this.token, this);
                next$2496.deferredContext = Rename$2453(id$2493, name$2494, this.deferredContext, defctx$2495);
                return next$2496;
            }
            if (this.token.type === parser$2452.Token.Identifier || this.token.type === parser$2452.Token.Keyword || this.token.type === parser$2452.Token.Punctuator) {
                return syntaxFromToken$2461(this.token, { context: Rename$2453(id$2493, name$2494, this.context, defctx$2495) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2497) {
            if (this.token.inner) {
                var next$2498 = syntaxFromToken$2461(this.token, this);
                next$2498.deferredContext = Def$2455(defctx$2497, this.deferredContext);
                return next$2498;
            }
            return syntaxFromToken$2461(this.token, { context: Def$2455(defctx$2497, this.context) });
        },
        getDefCtx: function () {
            var ctx$2499 = this.context;
            while (ctx$2499 !== null) {
                if (isDef$2459(ctx$2499)) {
                    return ctx$2499.defctx;
                }
                ctx$2499 = ctx$2499.context;
            }
            return null;
        },
        expose: function () {
            parser$2452.assert(this.token.type === parser$2452.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2500(stxCtx$2501, ctx$2502) {
                if (ctx$2502 == null) {
                    return stxCtx$2501;
                } else if (isRename$2457(ctx$2502)) {
                    return Rename$2453(ctx$2502.id, ctx$2502.name, applyContext$2500(stxCtx$2501, ctx$2502.context), ctx$2502.def);
                } else if (isMark$2458(ctx$2502)) {
                    return Mark$2454(ctx$2502.mark, applyContext$2500(stxCtx$2501, ctx$2502.context));
                } else if (isDef$2459(ctx$2502)) {
                    return Def$2455(ctx$2502.defctx, applyContext$2500(stxCtx$2501, ctx$2502.context));
                } else {
                    parser$2452.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2450.map(this.token.inner, _$2450.bind(function (stx$2503) {
                if (stx$2503.token.inner) {
                    var next$2504 = syntaxFromToken$2461(stx$2503.token, stx$2503);
                    next$2504.deferredContext = applyContext$2500(stx$2503.deferredContext, this.deferredContext);
                    return next$2504;
                } else {
                    return syntaxFromToken$2461(stx$2503.token, { context: applyContext$2500(stx$2503.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2505 = this.token.type === parser$2452.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2505 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2461(token$2506, oldstx$2507) {
        return new Syntax$2460(token$2506, oldstx$2507);
    }
    function mkSyntax$2462(stx$2508, value$2509, type$2510, inner$2511) {
        if (stx$2508 && Array.isArray(stx$2508) && stx$2508.length === 1) {
            stx$2508 = stx$2508[0];
        } else if (stx$2508 && Array.isArray(stx$2508)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2508);
        }
        if (type$2510 === parser$2452.Token.Delimiter) {
            var startLineNumber$2512, startLineStart$2513, endLineNumber$2514, endLineStart$2515, startRange$2516, endRange$2517;
            if (!Array.isArray(inner$2511)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2508 && stx$2508.token.type === parser$2452.Token.Delimiter) {
                startLineNumber$2512 = stx$2508.token.startLineNumber;
                startLineStart$2513 = stx$2508.token.startLineStart;
                endLineNumber$2514 = stx$2508.token.endLineNumber;
                endLineStart$2515 = stx$2508.token.endLineStart;
                startRange$2516 = stx$2508.token.startRange;
                endRange$2517 = stx$2508.token.endRange;
            } else if (stx$2508 && stx$2508.token) {
                startLineNumber$2512 = stx$2508.token.lineNumber;
                startLineStart$2513 = stx$2508.token.lineStart;
                endLineNumber$2514 = stx$2508.token.lineNumber;
                endLineStart$2515 = stx$2508.token.lineStart;
                startRange$2516 = stx$2508.token.range;
                endRange$2517 = stx$2508.token.range;
            }
            return syntaxFromToken$2461({
                type: parser$2452.Token.Delimiter,
                value: value$2509,
                inner: inner$2511,
                startLineStart: startLineStart$2513,
                startLineNumber: startLineNumber$2512,
                endLineStart: endLineStart$2515,
                endLineNumber: endLineNumber$2514,
                startRange: startRange$2516,
                endRange: endRange$2517
            }, stx$2508);
        } else {
            var lineStart$2518, lineNumber$2519, range$2520;
            if (stx$2508 && stx$2508.token.type === parser$2452.Token.Delimiter) {
                lineStart$2518 = stx$2508.token.startLineStart;
                lineNumber$2519 = stx$2508.token.startLineNumber;
                range$2520 = stx$2508.token.startRange;
            } else if (stx$2508 && stx$2508.token) {
                lineStart$2518 = stx$2508.token.lineStart;
                lineNumber$2519 = stx$2508.token.lineNumber;
                range$2520 = stx$2508.token.range;
            }
            return syntaxFromToken$2461({
                type: type$2510,
                value: value$2509,
                lineStart: lineStart$2518,
                lineNumber: lineNumber$2519,
                range: range$2520
            }, stx$2508);
        }
    }
    function makeValue$2463(val$2521, stx$2522) {
        if (typeof val$2521 === 'boolean') {
            return mkSyntax$2462(stx$2522, val$2521 ? 'true' : 'false', parser$2452.Token.BooleanLiteral);
        } else if (typeof val$2521 === 'number') {
            if (val$2521 !== val$2521) {
                return makeDelim$2468('()', [
                    makeValue$2463(0, stx$2522),
                    makePunc$2467('/', stx$2522),
                    makeValue$2463(0, stx$2522)
                ], stx$2522);
            }
            if (val$2521 < 0) {
                return makeDelim$2468('()', [
                    makePunc$2467('-', stx$2522),
                    makeValue$2463(Math.abs(val$2521), stx$2522)
                ], stx$2522);
            } else {
                return mkSyntax$2462(stx$2522, val$2521, parser$2452.Token.NumericLiteral);
            }
        } else if (typeof val$2521 === 'string') {
            return mkSyntax$2462(stx$2522, val$2521, parser$2452.Token.StringLiteral);
        } else if (val$2521 === null) {
            return mkSyntax$2462(stx$2522, 'null', parser$2452.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2521);
        }
    }
    function makeRegex$2464(val$2523, flags$2524, stx$2525) {
        var newstx$2526 = mkSyntax$2462(stx$2525, new RegExp(val$2523, flags$2524), parser$2452.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2526.token.literal = val$2523;
        return newstx$2526;
    }
    function makeIdent$2465(val$2527, stx$2528) {
        return mkSyntax$2462(stx$2528, val$2527, parser$2452.Token.Identifier);
    }
    function makeKeyword$2466(val$2529, stx$2530) {
        return mkSyntax$2462(stx$2530, val$2529, parser$2452.Token.Keyword);
    }
    function makePunc$2467(val$2531, stx$2532) {
        return mkSyntax$2462(stx$2532, val$2531, parser$2452.Token.Punctuator);
    }
    function makeDelim$2468(val$2533, inner$2534, stx$2535) {
        return mkSyntax$2462(stx$2535, val$2533, parser$2452.Token.Delimiter, inner$2534);
    }
    function unwrapSyntax$2469(stx$2536) {
        if (Array.isArray(stx$2536) && stx$2536.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2536 = stx$2536[0];
        }
        if (stx$2536.token) {
            if (stx$2536.token.type === parser$2452.Token.Delimiter) {
                return stx$2536.token;
            } else {
                return stx$2536.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2536);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2470(stx$2537) {
        return _$2450.map(stx$2537, function (stx$2538) {
            if (stx$2538.token.inner) {
                stx$2538.token.inner = syntaxToTokens$2470(stx$2538.token.inner);
            }
            return stx$2538.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2471(tokens$2539) {
        if (!_$2450.isArray(tokens$2539)) {
            tokens$2539 = [tokens$2539];
        }
        return _$2450.map(tokens$2539, function (token$2540) {
            if (token$2540.inner) {
                token$2540.inner = tokensToSyntax$2471(token$2540.inner);
            }
            return syntaxFromToken$2461(token$2540);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2472(tojoin$2541, punc$2542) {
        if (tojoin$2541.length === 0) {
            return [];
        }
        if (punc$2542 === ' ') {
            return tojoin$2541;
        }
        return _$2450.reduce(_$2450.rest(tojoin$2541, 1), function (acc$2543, join$2544) {
            return acc$2543.concat(makePunc$2467(punc$2542, join$2544), join$2544);
        }, [_$2450.first(tojoin$2541)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2473(tojoin$2545, punc$2546) {
        if (tojoin$2545.length === 0) {
            return [];
        }
        if (punc$2546 === ' ') {
            return _$2450.flatten(tojoin$2545, true);
        }
        return _$2450.reduce(_$2450.rest(tojoin$2545, 1), function (acc$2547, join$2548) {
            return acc$2547.concat(makePunc$2467(punc$2546, _$2450.first(join$2548)), join$2548);
        }, _$2450.first(tojoin$2545));
    }
    function MacroSyntaxError$2474(name$2549, message$2550, stx$2551) {
        this.name = name$2549;
        this.message = message$2550;
        this.stx = stx$2551;
    }
    function throwSyntaxError$2475(name$2552, message$2553, stx$2554) {
        if (stx$2554 && Array.isArray(stx$2554)) {
            stx$2554 = stx$2554[0];
        }
        throw new MacroSyntaxError$2474(name$2552, message$2553, stx$2554);
    }
    function printSyntaxError$2476(code$2555, err$2556) {
        if (!err$2556.stx) {
            return '[' + err$2556.name + '] ' + err$2556.message;
        }
        var token$2557 = err$2556.stx.token;
        var lineNumber$2558 = token$2557.sm_startLineNumber || token$2557.sm_lineNumber || token$2557.startLineNumber || token$2557.lineNumber;
        var lineStart$2559 = token$2557.sm_startLineStart || token$2557.sm_lineStart || token$2557.startLineStart || token$2557.lineStart;
        var start$2560 = (token$2557.sm_startRange || token$2557.sm_range || token$2557.startRange || token$2557.range)[0];
        var offset$2561 = start$2560 - lineStart$2559;
        var line$2562 = '';
        var pre$2563 = lineNumber$2558 + ': ';
        var ch$2564;
        while (ch$2564 = code$2555.charAt(lineStart$2559++)) {
            if (ch$2564 == '\r' || ch$2564 == '\n') {
                break;
            }
            line$2562 += ch$2564;
        }
        return '[' + err$2556.name + '] ' + err$2556.message + '\n' + pre$2563 + line$2562 + '\n' + Array(offset$2561 + pre$2563.length).join(' ') + ' ^';
    }
    exports$2449.unwrapSyntax = unwrapSyntax$2469;
    exports$2449.makeDelim = makeDelim$2468;
    exports$2449.makePunc = makePunc$2467;
    exports$2449.makeKeyword = makeKeyword$2466;
    exports$2449.makeIdent = makeIdent$2465;
    exports$2449.makeRegex = makeRegex$2464;
    exports$2449.makeValue = makeValue$2463;
    exports$2449.Rename = Rename$2453;
    exports$2449.Mark = Mark$2454;
    exports$2449.Var = Var$2456;
    exports$2449.Def = Def$2455;
    exports$2449.isDef = isDef$2459;
    exports$2449.isMark = isMark$2458;
    exports$2449.isRename = isRename$2457;
    exports$2449.syntaxFromToken = syntaxFromToken$2461;
    exports$2449.tokensToSyntax = tokensToSyntax$2471;
    exports$2449.syntaxToTokens = syntaxToTokens$2470;
    exports$2449.joinSyntax = joinSyntax$2472;
    exports$2449.joinSyntaxArr = joinSyntaxArr$2473;
    exports$2449.MacroSyntaxError = MacroSyntaxError$2474;
    exports$2449.throwSyntaxError = throwSyntaxError$2475;
    exports$2449.printSyntaxError = printSyntaxError$2476;
}));
//# sourceMappingURL=syntax.js.map