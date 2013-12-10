(function (root$2457, factory$2458) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2458(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2458);
    }
}(this, function (exports$2459, _$2460, es6$2461, parser$2462) {
    // (CSyntax, Str) -> CContext
    function Rename$2463(id$2487, name$2488, ctx$2489, defctx$2490) {
        defctx$2490 = defctx$2490 || null;
        return {
            id: id$2487,
            name: name$2488,
            context: ctx$2489,
            def: defctx$2490
        };
    }
    // (Num) -> CContext
    function Mark$2464(mark$2491, ctx$2492) {
        return {
            mark: mark$2491,
            context: ctx$2492
        };
    }
    function Def$2465(defctx$2493, ctx$2494) {
        return {
            defctx: defctx$2493,
            context: ctx$2494
        };
    }
    function Var$2466(id$2495) {
        return { id: id$2495 };
    }
    function isRename$2467(r$2496) {
        return r$2496 && typeof r$2496.id !== 'undefined' && typeof r$2496.name !== 'undefined';
    }
    ;
    function isMark$2468(m$2497) {
        return m$2497 && typeof m$2497.mark !== 'undefined';
    }
    ;
    function isDef$2469(ctx$2498) {
        return ctx$2498 && typeof ctx$2498.defctx !== 'undefined';
    }
    function Syntax$2470(token$2499, oldstx$2500) {
        this.token = token$2499;
        this.context = oldstx$2500 && oldstx$2500.context ? oldstx$2500.context : null;
        this.deferredContext = oldstx$2500 && oldstx$2500.deferredContext ? oldstx$2500.deferredContext : null;
    }
    Syntax$2470.prototype = {
        mark: function (newMark$2501) {
            if (this.token.inner) {
                var next$2502 = syntaxFromToken$2471(this.token, this);
                next$2502.deferredContext = Mark$2464(newMark$2501, this.deferredContext);
                return next$2502;
            }
            return syntaxFromToken$2471(this.token, { context: Mark$2464(newMark$2501, this.context) });
        },
        rename: function (id$2503, name$2504, defctx$2505) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2506 = syntaxFromToken$2471(this.token, this);
                next$2506.deferredContext = Rename$2463(id$2503, name$2504, this.deferredContext, defctx$2505);
                return next$2506;
            }
            if (this.token.type === parser$2462.Token.Identifier || this.token.type === parser$2462.Token.Keyword || this.token.type === parser$2462.Token.Punctuator) {
                return syntaxFromToken$2471(this.token, { context: Rename$2463(id$2503, name$2504, this.context, defctx$2505) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2507) {
            if (this.token.inner) {
                var next$2508 = syntaxFromToken$2471(this.token, this);
                next$2508.deferredContext = Def$2465(defctx$2507, this.deferredContext);
                return next$2508;
            }
            return syntaxFromToken$2471(this.token, { context: Def$2465(defctx$2507, this.context) });
        },
        getDefCtx: function () {
            var ctx$2509 = this.context;
            while (ctx$2509 !== null) {
                if (isDef$2469(ctx$2509)) {
                    return ctx$2509.defctx;
                }
                ctx$2509 = ctx$2509.context;
            }
            return null;
        },
        expose: function () {
            parser$2462.assert(this.token.type === parser$2462.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2510(stxCtx$2511, ctx$2512) {
                if (ctx$2512 == null) {
                    return stxCtx$2511;
                } else if (isRename$2467(ctx$2512)) {
                    return Rename$2463(ctx$2512.id, ctx$2512.name, applyContext$2510(stxCtx$2511, ctx$2512.context), ctx$2512.def);
                } else if (isMark$2468(ctx$2512)) {
                    return Mark$2464(ctx$2512.mark, applyContext$2510(stxCtx$2511, ctx$2512.context));
                } else if (isDef$2469(ctx$2512)) {
                    return Def$2465(ctx$2512.defctx, applyContext$2510(stxCtx$2511, ctx$2512.context));
                } else {
                    parser$2462.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2460.map(this.token.inner, _$2460.bind(function (stx$2513) {
                if (stx$2513.token.inner) {
                    var next$2514 = syntaxFromToken$2471(stx$2513.token, stx$2513);
                    next$2514.deferredContext = applyContext$2510(stx$2513.deferredContext, this.deferredContext);
                    return next$2514;
                } else {
                    return syntaxFromToken$2471(stx$2513.token, { context: applyContext$2510(stx$2513.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2515 = this.token.type === parser$2462.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2515 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2471(token$2516, oldstx$2517) {
        return new Syntax$2470(token$2516, oldstx$2517);
    }
    function mkSyntax$2472(stx$2518, value$2519, type$2520, inner$2521) {
        if (stx$2518 && Array.isArray(stx$2518) && stx$2518.length === 1) {
            stx$2518 = stx$2518[0];
        } else if (stx$2518 && Array.isArray(stx$2518)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2518);
        }
        if (type$2520 === parser$2462.Token.Delimiter) {
            var startLineNumber$2522, startLineStart$2523, endLineNumber$2524, endLineStart$2525, startRange$2526, endRange$2527;
            if (!Array.isArray(inner$2521)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2518 && stx$2518.token.type === parser$2462.Token.Delimiter) {
                startLineNumber$2522 = stx$2518.token.startLineNumber;
                startLineStart$2523 = stx$2518.token.startLineStart;
                endLineNumber$2524 = stx$2518.token.endLineNumber;
                endLineStart$2525 = stx$2518.token.endLineStart;
                startRange$2526 = stx$2518.token.startRange;
                endRange$2527 = stx$2518.token.endRange;
            } else if (stx$2518 && stx$2518.token) {
                startLineNumber$2522 = stx$2518.token.lineNumber;
                startLineStart$2523 = stx$2518.token.lineStart;
                endLineNumber$2524 = stx$2518.token.lineNumber;
                endLineStart$2525 = stx$2518.token.lineStart;
                startRange$2526 = stx$2518.token.range;
                endRange$2527 = stx$2518.token.range;
            }
            return syntaxFromToken$2471({
                type: parser$2462.Token.Delimiter,
                value: value$2519,
                inner: inner$2521,
                startLineStart: startLineStart$2523,
                startLineNumber: startLineNumber$2522,
                endLineStart: endLineStart$2525,
                endLineNumber: endLineNumber$2524,
                startRange: startRange$2526,
                endRange: endRange$2527
            }, stx$2518);
        } else {
            var lineStart$2528, lineNumber$2529, range$2530;
            if (stx$2518 && stx$2518.token.type === parser$2462.Token.Delimiter) {
                lineStart$2528 = stx$2518.token.startLineStart;
                lineNumber$2529 = stx$2518.token.startLineNumber;
                range$2530 = stx$2518.token.startRange;
            } else if (stx$2518 && stx$2518.token) {
                lineStart$2528 = stx$2518.token.lineStart;
                lineNumber$2529 = stx$2518.token.lineNumber;
                range$2530 = stx$2518.token.range;
            }
            return syntaxFromToken$2471({
                type: type$2520,
                value: value$2519,
                lineStart: lineStart$2528,
                lineNumber: lineNumber$2529,
                range: range$2530
            }, stx$2518);
        }
    }
    function makeValue$2473(val$2531, stx$2532) {
        if (typeof val$2531 === 'boolean') {
            return mkSyntax$2472(stx$2532, val$2531 ? 'true' : 'false', parser$2462.Token.BooleanLiteral);
        } else if (typeof val$2531 === 'number') {
            if (val$2531 !== val$2531) {
                return makeDelim$2478('()', [
                    makeValue$2473(0, stx$2532),
                    makePunc$2477('/', stx$2532),
                    makeValue$2473(0, stx$2532)
                ], stx$2532);
            }
            if (val$2531 < 0) {
                return makeDelim$2478('()', [
                    makePunc$2477('-', stx$2532),
                    makeValue$2473(Math.abs(val$2531), stx$2532)
                ], stx$2532);
            } else {
                return mkSyntax$2472(stx$2532, val$2531, parser$2462.Token.NumericLiteral);
            }
        } else if (typeof val$2531 === 'string') {
            return mkSyntax$2472(stx$2532, val$2531, parser$2462.Token.StringLiteral);
        } else if (val$2531 === null) {
            return mkSyntax$2472(stx$2532, 'null', parser$2462.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2531);
        }
    }
    function makeRegex$2474(val$2533, flags$2534, stx$2535) {
        var newstx$2536 = mkSyntax$2472(stx$2535, new RegExp(val$2533, flags$2534), parser$2462.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2536.token.literal = val$2533;
        return newstx$2536;
    }
    function makeIdent$2475(val$2537, stx$2538) {
        return mkSyntax$2472(stx$2538, val$2537, parser$2462.Token.Identifier);
    }
    function makeKeyword$2476(val$2539, stx$2540) {
        return mkSyntax$2472(stx$2540, val$2539, parser$2462.Token.Keyword);
    }
    function makePunc$2477(val$2541, stx$2542) {
        return mkSyntax$2472(stx$2542, val$2541, parser$2462.Token.Punctuator);
    }
    function makeDelim$2478(val$2543, inner$2544, stx$2545) {
        return mkSyntax$2472(stx$2545, val$2543, parser$2462.Token.Delimiter, inner$2544);
    }
    function unwrapSyntax$2479(stx$2546) {
        if (Array.isArray(stx$2546) && stx$2546.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2546 = stx$2546[0];
        }
        if (stx$2546.token) {
            if (stx$2546.token.type === parser$2462.Token.Delimiter) {
                return stx$2546.token;
            } else {
                return stx$2546.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2546);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2480(stx$2547) {
        return _$2460.map(stx$2547, function (stx$2548) {
            if (stx$2548.token.inner) {
                stx$2548.token.inner = syntaxToTokens$2480(stx$2548.token.inner);
            }
            return stx$2548.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2481(tokens$2549) {
        if (!_$2460.isArray(tokens$2549)) {
            tokens$2549 = [tokens$2549];
        }
        return _$2460.map(tokens$2549, function (token$2550) {
            if (token$2550.inner) {
                token$2550.inner = tokensToSyntax$2481(token$2550.inner);
            }
            return syntaxFromToken$2471(token$2550);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2482(tojoin$2551, punc$2552) {
        if (tojoin$2551.length === 0) {
            return [];
        }
        if (punc$2552 === ' ') {
            return tojoin$2551;
        }
        return _$2460.reduce(_$2460.rest(tojoin$2551, 1), function (acc$2553, join$2554) {
            return acc$2553.concat(makePunc$2477(punc$2552, join$2554), join$2554);
        }, [_$2460.first(tojoin$2551)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2483(tojoin$2555, punc$2556) {
        if (tojoin$2555.length === 0) {
            return [];
        }
        if (punc$2556 === ' ') {
            return _$2460.flatten(tojoin$2555, true);
        }
        return _$2460.reduce(_$2460.rest(tojoin$2555, 1), function (acc$2557, join$2558) {
            return acc$2557.concat(makePunc$2477(punc$2556, _$2460.first(join$2558)), join$2558);
        }, _$2460.first(tojoin$2555));
    }
    function MacroSyntaxError$2484(name$2559, message$2560, stx$2561) {
        this.name = name$2559;
        this.message = message$2560;
        this.stx = stx$2561;
    }
    function throwSyntaxError$2485(name$2562, message$2563, stx$2564) {
        if (stx$2564 && Array.isArray(stx$2564)) {
            stx$2564 = stx$2564[0];
        }
        throw new MacroSyntaxError$2484(name$2562, message$2563, stx$2564);
    }
    function printSyntaxError$2486(code$2565, err$2566) {
        if (!err$2566.stx) {
            return '[' + err$2566.name + '] ' + err$2566.message;
        }
        var token$2567 = err$2566.stx.token;
        var lineNumber$2568 = token$2567.sm_startLineNumber || token$2567.sm_lineNumber || token$2567.startLineNumber || token$2567.lineNumber;
        var lineStart$2569 = token$2567.sm_startLineStart || token$2567.sm_lineStart || token$2567.startLineStart || token$2567.lineStart;
        var start$2570 = (token$2567.sm_startRange || token$2567.sm_range || token$2567.startRange || token$2567.range)[0];
        var offset$2571 = start$2570 - lineStart$2569;
        var line$2572 = '';
        var pre$2573 = lineNumber$2568 + ': ';
        var ch$2574;
        while (ch$2574 = code$2565.charAt(lineStart$2569++)) {
            if (ch$2574 == '\r' || ch$2574 == '\n') {
                break;
            }
            line$2572 += ch$2574;
        }
        return '[' + err$2566.name + '] ' + err$2566.message + '\n' + pre$2573 + line$2572 + '\n' + Array(offset$2571 + pre$2573.length).join(' ') + ' ^';
    }
    exports$2459.unwrapSyntax = unwrapSyntax$2479;
    exports$2459.makeDelim = makeDelim$2478;
    exports$2459.makePunc = makePunc$2477;
    exports$2459.makeKeyword = makeKeyword$2476;
    exports$2459.makeIdent = makeIdent$2475;
    exports$2459.makeRegex = makeRegex$2474;
    exports$2459.makeValue = makeValue$2473;
    exports$2459.Rename = Rename$2463;
    exports$2459.Mark = Mark$2464;
    exports$2459.Var = Var$2466;
    exports$2459.Def = Def$2465;
    exports$2459.isDef = isDef$2469;
    exports$2459.isMark = isMark$2468;
    exports$2459.isRename = isRename$2467;
    exports$2459.syntaxFromToken = syntaxFromToken$2471;
    exports$2459.tokensToSyntax = tokensToSyntax$2481;
    exports$2459.syntaxToTokens = syntaxToTokens$2480;
    exports$2459.joinSyntax = joinSyntax$2482;
    exports$2459.joinSyntaxArr = joinSyntaxArr$2483;
    exports$2459.MacroSyntaxError = MacroSyntaxError$2484;
    exports$2459.throwSyntaxError = throwSyntaxError$2485;
    exports$2459.printSyntaxError = printSyntaxError$2486;
}));
//# sourceMappingURL=syntax.js.map