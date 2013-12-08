(function (root$2453, factory$2454) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2454(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2454);
    }
}(this, function (exports$2455, _$2456, es6$2457, parser$2458) {
    // (CSyntax, Str) -> CContext
    function Rename$2459(id$2483, name$2484, ctx$2485, defctx$2486) {
        defctx$2486 = defctx$2486 || null;
        return {
            id: id$2483,
            name: name$2484,
            context: ctx$2485,
            def: defctx$2486
        };
    }
    // (Num) -> CContext
    function Mark$2460(mark$2487, ctx$2488) {
        return {
            mark: mark$2487,
            context: ctx$2488
        };
    }
    function Def$2461(defctx$2489, ctx$2490) {
        return {
            defctx: defctx$2489,
            context: ctx$2490
        };
    }
    function Var$2462(id$2491) {
        return { id: id$2491 };
    }
    function isRename$2463(r$2492) {
        return r$2492 && typeof r$2492.id !== 'undefined' && typeof r$2492.name !== 'undefined';
    }
    ;
    function isMark$2464(m$2493) {
        return m$2493 && typeof m$2493.mark !== 'undefined';
    }
    ;
    function isDef$2465(ctx$2494) {
        return ctx$2494 && typeof ctx$2494.defctx !== 'undefined';
    }
    function Syntax$2466(token$2495, oldstx$2496) {
        this.token = token$2495;
        this.context = oldstx$2496 && oldstx$2496.context ? oldstx$2496.context : null;
        this.deferredContext = oldstx$2496 && oldstx$2496.deferredContext ? oldstx$2496.deferredContext : null;
    }
    Syntax$2466.prototype = {
        mark: function (newMark$2497) {
            if (this.token.inner) {
                var next$2498 = syntaxFromToken$2467(this.token, this);
                next$2498.deferredContext = Mark$2460(newMark$2497, this.deferredContext);
                return next$2498;
            }
            return syntaxFromToken$2467(this.token, { context: Mark$2460(newMark$2497, this.context) });
        },
        rename: function (id$2499, name$2500, defctx$2501) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2502 = syntaxFromToken$2467(this.token, this);
                next$2502.deferredContext = Rename$2459(id$2499, name$2500, this.deferredContext, defctx$2501);
                return next$2502;
            }
            if (this.token.type === parser$2458.Token.Identifier || this.token.type === parser$2458.Token.Keyword || this.token.type === parser$2458.Token.Punctuator) {
                return syntaxFromToken$2467(this.token, { context: Rename$2459(id$2499, name$2500, this.context, defctx$2501) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2503) {
            if (this.token.inner) {
                var next$2504 = syntaxFromToken$2467(this.token, this);
                next$2504.deferredContext = Def$2461(defctx$2503, this.deferredContext);
                return next$2504;
            }
            return syntaxFromToken$2467(this.token, { context: Def$2461(defctx$2503, this.context) });
        },
        getDefCtx: function () {
            var ctx$2505 = this.context;
            while (ctx$2505 !== null) {
                if (isDef$2465(ctx$2505)) {
                    return ctx$2505.defctx;
                }
                ctx$2505 = ctx$2505.context;
            }
            return null;
        },
        expose: function () {
            parser$2458.assert(this.token.type === parser$2458.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2506(stxCtx$2507, ctx$2508) {
                if (ctx$2508 == null) {
                    return stxCtx$2507;
                } else if (isRename$2463(ctx$2508)) {
                    return Rename$2459(ctx$2508.id, ctx$2508.name, applyContext$2506(stxCtx$2507, ctx$2508.context), ctx$2508.def);
                } else if (isMark$2464(ctx$2508)) {
                    return Mark$2460(ctx$2508.mark, applyContext$2506(stxCtx$2507, ctx$2508.context));
                } else if (isDef$2465(ctx$2508)) {
                    return Def$2461(ctx$2508.defctx, applyContext$2506(stxCtx$2507, ctx$2508.context));
                } else {
                    parser$2458.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2456.map(this.token.inner, _$2456.bind(function (stx$2509) {
                if (stx$2509.token.inner) {
                    var next$2510 = syntaxFromToken$2467(stx$2509.token, stx$2509);
                    next$2510.deferredContext = applyContext$2506(stx$2509.deferredContext, this.deferredContext);
                    return next$2510;
                } else {
                    return syntaxFromToken$2467(stx$2509.token, { context: applyContext$2506(stx$2509.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2511 = this.token.type === parser$2458.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2511 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2467(token$2512, oldstx$2513) {
        return new Syntax$2466(token$2512, oldstx$2513);
    }
    function mkSyntax$2468(stx$2514, value$2515, type$2516, inner$2517) {
        if (stx$2514 && Array.isArray(stx$2514) && stx$2514.length === 1) {
            stx$2514 = stx$2514[0];
        } else if (stx$2514 && Array.isArray(stx$2514)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2514);
        }
        if (type$2516 === parser$2458.Token.Delimiter) {
            var startLineNumber$2518, startLineStart$2519, endLineNumber$2520, endLineStart$2521, startRange$2522, endRange$2523;
            if (!Array.isArray(inner$2517)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2514 && stx$2514.token.type === parser$2458.Token.Delimiter) {
                startLineNumber$2518 = stx$2514.token.startLineNumber;
                startLineStart$2519 = stx$2514.token.startLineStart;
                endLineNumber$2520 = stx$2514.token.endLineNumber;
                endLineStart$2521 = stx$2514.token.endLineStart;
                startRange$2522 = stx$2514.token.startRange;
                endRange$2523 = stx$2514.token.endRange;
            } else if (stx$2514 && stx$2514.token) {
                startLineNumber$2518 = stx$2514.token.lineNumber;
                startLineStart$2519 = stx$2514.token.lineStart;
                endLineNumber$2520 = stx$2514.token.lineNumber;
                endLineStart$2521 = stx$2514.token.lineStart;
                startRange$2522 = stx$2514.token.range;
                endRange$2523 = stx$2514.token.range;
            }
            return syntaxFromToken$2467({
                type: parser$2458.Token.Delimiter,
                value: value$2515,
                inner: inner$2517,
                startLineStart: startLineStart$2519,
                startLineNumber: startLineNumber$2518,
                endLineStart: endLineStart$2521,
                endLineNumber: endLineNumber$2520,
                startRange: startRange$2522,
                endRange: endRange$2523
            }, stx$2514);
        } else {
            var lineStart$2524, lineNumber$2525, range$2526;
            if (stx$2514 && stx$2514.token.type === parser$2458.Token.Delimiter) {
                lineStart$2524 = stx$2514.token.startLineStart;
                lineNumber$2525 = stx$2514.token.startLineNumber;
                range$2526 = stx$2514.token.startRange;
            } else if (stx$2514 && stx$2514.token) {
                lineStart$2524 = stx$2514.token.lineStart;
                lineNumber$2525 = stx$2514.token.lineNumber;
                range$2526 = stx$2514.token.range;
            }
            return syntaxFromToken$2467({
                type: type$2516,
                value: value$2515,
                lineStart: lineStart$2524,
                lineNumber: lineNumber$2525,
                range: range$2526
            }, stx$2514);
        }
    }
    function makeValue$2469(val$2527, stx$2528) {
        if (typeof val$2527 === 'boolean') {
            return mkSyntax$2468(stx$2528, val$2527 ? 'true' : 'false', parser$2458.Token.BooleanLiteral);
        } else if (typeof val$2527 === 'number') {
            if (val$2527 !== val$2527) {
                return makeDelim$2474('()', [
                    makeValue$2469(0, stx$2528),
                    makePunc$2473('/', stx$2528),
                    makeValue$2469(0, stx$2528)
                ], stx$2528);
            }
            if (val$2527 < 0) {
                return makeDelim$2474('()', [
                    makePunc$2473('-', stx$2528),
                    makeValue$2469(Math.abs(val$2527), stx$2528)
                ], stx$2528);
            } else {
                return mkSyntax$2468(stx$2528, val$2527, parser$2458.Token.NumericLiteral);
            }
        } else if (typeof val$2527 === 'string') {
            return mkSyntax$2468(stx$2528, val$2527, parser$2458.Token.StringLiteral);
        } else if (val$2527 === null) {
            return mkSyntax$2468(stx$2528, 'null', parser$2458.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2527);
        }
    }
    function makeRegex$2470(val$2529, flags$2530, stx$2531) {
        var newstx$2532 = mkSyntax$2468(stx$2531, new RegExp(val$2529, flags$2530), parser$2458.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2532.token.literal = val$2529;
        return newstx$2532;
    }
    function makeIdent$2471(val$2533, stx$2534) {
        return mkSyntax$2468(stx$2534, val$2533, parser$2458.Token.Identifier);
    }
    function makeKeyword$2472(val$2535, stx$2536) {
        return mkSyntax$2468(stx$2536, val$2535, parser$2458.Token.Keyword);
    }
    function makePunc$2473(val$2537, stx$2538) {
        return mkSyntax$2468(stx$2538, val$2537, parser$2458.Token.Punctuator);
    }
    function makeDelim$2474(val$2539, inner$2540, stx$2541) {
        return mkSyntax$2468(stx$2541, val$2539, parser$2458.Token.Delimiter, inner$2540);
    }
    function unwrapSyntax$2475(stx$2542) {
        if (Array.isArray(stx$2542) && stx$2542.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2542 = stx$2542[0];
        }
        if (stx$2542.token) {
            if (stx$2542.token.type === parser$2458.Token.Delimiter) {
                return stx$2542.token;
            } else {
                return stx$2542.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2542);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2476(stx$2543) {
        return _$2456.map(stx$2543, function (stx$2544) {
            if (stx$2544.token.inner) {
                stx$2544.token.inner = syntaxToTokens$2476(stx$2544.token.inner);
            }
            return stx$2544.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2477(tokens$2545) {
        if (!_$2456.isArray(tokens$2545)) {
            tokens$2545 = [tokens$2545];
        }
        return _$2456.map(tokens$2545, function (token$2546) {
            if (token$2546.inner) {
                token$2546.inner = tokensToSyntax$2477(token$2546.inner);
            }
            return syntaxFromToken$2467(token$2546);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2478(tojoin$2547, punc$2548) {
        if (tojoin$2547.length === 0) {
            return [];
        }
        if (punc$2548 === ' ') {
            return tojoin$2547;
        }
        return _$2456.reduce(_$2456.rest(tojoin$2547, 1), function (acc$2549, join$2550) {
            return acc$2549.concat(makePunc$2473(punc$2548, join$2550), join$2550);
        }, [_$2456.first(tojoin$2547)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2479(tojoin$2551, punc$2552) {
        if (tojoin$2551.length === 0) {
            return [];
        }
        if (punc$2552 === ' ') {
            return _$2456.flatten(tojoin$2551, true);
        }
        return _$2456.reduce(_$2456.rest(tojoin$2551, 1), function (acc$2553, join$2554) {
            return acc$2553.concat(makePunc$2473(punc$2552, _$2456.first(join$2554)), join$2554);
        }, _$2456.first(tojoin$2551));
    }
    function MacroSyntaxError$2480(name$2555, message$2556, stx$2557) {
        this.name = name$2555;
        this.message = message$2556;
        this.stx = stx$2557;
    }
    function throwSyntaxError$2481(name$2558, message$2559, stx$2560) {
        if (stx$2560 && Array.isArray(stx$2560)) {
            stx$2560 = stx$2560[0];
        }
        throw new MacroSyntaxError$2480(name$2558, message$2559, stx$2560);
    }
    function printSyntaxError$2482(code$2561, err$2562) {
        if (!err$2562.stx) {
            return '[' + err$2562.name + '] ' + err$2562.message;
        }
        var token$2563 = err$2562.stx.token;
        var lineNumber$2564 = token$2563.sm_startLineNumber || token$2563.sm_lineNumber || token$2563.startLineNumber || token$2563.lineNumber;
        var lineStart$2565 = token$2563.sm_startLineStart || token$2563.sm_lineStart || token$2563.startLineStart || token$2563.lineStart;
        var start$2566 = (token$2563.sm_startRange || token$2563.sm_range || token$2563.startRange || token$2563.range)[0];
        var offset$2567 = start$2566 - lineStart$2565;
        var line$2568 = '';
        var pre$2569 = lineNumber$2564 + ': ';
        var ch$2570;
        while (ch$2570 = code$2561.charAt(lineStart$2565++)) {
            if (ch$2570 == '\r' || ch$2570 == '\n') {
                break;
            }
            line$2568 += ch$2570;
        }
        return '[' + err$2562.name + '] ' + err$2562.message + '\n' + pre$2569 + line$2568 + '\n' + Array(offset$2567 + pre$2569.length).join(' ') + ' ^';
    }
    exports$2455.unwrapSyntax = unwrapSyntax$2475;
    exports$2455.makeDelim = makeDelim$2474;
    exports$2455.makePunc = makePunc$2473;
    exports$2455.makeKeyword = makeKeyword$2472;
    exports$2455.makeIdent = makeIdent$2471;
    exports$2455.makeRegex = makeRegex$2470;
    exports$2455.makeValue = makeValue$2469;
    exports$2455.Rename = Rename$2459;
    exports$2455.Mark = Mark$2460;
    exports$2455.Var = Var$2462;
    exports$2455.Def = Def$2461;
    exports$2455.isDef = isDef$2465;
    exports$2455.isMark = isMark$2464;
    exports$2455.isRename = isRename$2463;
    exports$2455.syntaxFromToken = syntaxFromToken$2467;
    exports$2455.tokensToSyntax = tokensToSyntax$2477;
    exports$2455.syntaxToTokens = syntaxToTokens$2476;
    exports$2455.joinSyntax = joinSyntax$2478;
    exports$2455.joinSyntaxArr = joinSyntaxArr$2479;
    exports$2455.MacroSyntaxError = MacroSyntaxError$2480;
    exports$2455.throwSyntaxError = throwSyntaxError$2481;
    exports$2455.printSyntaxError = printSyntaxError$2482;
}));
//# sourceMappingURL=syntax.js.map