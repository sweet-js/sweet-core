(function (root$2473, factory$2474) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2474(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2474);
    }
}(this, function (exports$2475, _$2476, es6$2477, parser$2478) {
    // (CSyntax, Str) -> CContext
    function Rename$2479(id$2503, name$2504, ctx$2505, defctx$2506) {
        defctx$2506 = defctx$2506 || null;
        return {
            id: id$2503,
            name: name$2504,
            context: ctx$2505,
            def: defctx$2506
        };
    }
    // (Num) -> CContext
    function Mark$2480(mark$2507, ctx$2508) {
        return {
            mark: mark$2507,
            context: ctx$2508
        };
    }
    function Def$2481(defctx$2509, ctx$2510) {
        return {
            defctx: defctx$2509,
            context: ctx$2510
        };
    }
    function Var$2482(id$2511) {
        return { id: id$2511 };
    }
    function isRename$2483(r$2512) {
        return r$2512 && typeof r$2512.id !== 'undefined' && typeof r$2512.name !== 'undefined';
    }
    ;
    function isMark$2484(m$2513) {
        return m$2513 && typeof m$2513.mark !== 'undefined';
    }
    ;
    function isDef$2485(ctx$2514) {
        return ctx$2514 && typeof ctx$2514.defctx !== 'undefined';
    }
    function Syntax$2486(token$2515, oldstx$2516) {
        this.token = token$2515;
        this.context = oldstx$2516 && oldstx$2516.context ? oldstx$2516.context : null;
        this.deferredContext = oldstx$2516 && oldstx$2516.deferredContext ? oldstx$2516.deferredContext : null;
    }
    Syntax$2486.prototype = {
        mark: function (newMark$2517) {
            if (this.token.inner) {
                var next$2518 = syntaxFromToken$2487(this.token, this);
                next$2518.deferredContext = Mark$2480(newMark$2517, this.deferredContext);
                return next$2518;
            }
            return syntaxFromToken$2487(this.token, { context: Mark$2480(newMark$2517, this.context) });
        },
        rename: function (id$2519, name$2520, defctx$2521) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2522 = syntaxFromToken$2487(this.token, this);
                next$2522.deferredContext = Rename$2479(id$2519, name$2520, this.deferredContext, defctx$2521);
                return next$2522;
            }
            if (this.token.type === parser$2478.Token.Identifier || this.token.type === parser$2478.Token.Keyword || this.token.type === parser$2478.Token.Punctuator) {
                return syntaxFromToken$2487(this.token, { context: Rename$2479(id$2519, name$2520, this.context, defctx$2521) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2523) {
            if (this.token.inner) {
                var next$2524 = syntaxFromToken$2487(this.token, this);
                next$2524.deferredContext = Def$2481(defctx$2523, this.deferredContext);
                return next$2524;
            }
            return syntaxFromToken$2487(this.token, { context: Def$2481(defctx$2523, this.context) });
        },
        getDefCtx: function () {
            var ctx$2525 = this.context;
            while (ctx$2525 !== null) {
                if (isDef$2485(ctx$2525)) {
                    return ctx$2525.defctx;
                }
                ctx$2525 = ctx$2525.context;
            }
            return null;
        },
        expose: function () {
            parser$2478.assert(this.token.type === parser$2478.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2526(stxCtx$2527, ctx$2528) {
                if (ctx$2528 == null) {
                    return stxCtx$2527;
                } else if (isRename$2483(ctx$2528)) {
                    return Rename$2479(ctx$2528.id, ctx$2528.name, applyContext$2526(stxCtx$2527, ctx$2528.context), ctx$2528.def);
                } else if (isMark$2484(ctx$2528)) {
                    return Mark$2480(ctx$2528.mark, applyContext$2526(stxCtx$2527, ctx$2528.context));
                } else if (isDef$2485(ctx$2528)) {
                    return Def$2481(ctx$2528.defctx, applyContext$2526(stxCtx$2527, ctx$2528.context));
                } else {
                    parser$2478.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2476.map(this.token.inner, _$2476.bind(function (stx$2529) {
                if (stx$2529.token.inner) {
                    var next$2530 = syntaxFromToken$2487(stx$2529.token, stx$2529);
                    next$2530.deferredContext = applyContext$2526(stx$2529.deferredContext, this.deferredContext);
                    return next$2530;
                } else {
                    return syntaxFromToken$2487(stx$2529.token, { context: applyContext$2526(stx$2529.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2531 = this.token.type === parser$2478.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2531 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2487(token$2532, oldstx$2533) {
        return new Syntax$2486(token$2532, oldstx$2533);
    }
    function mkSyntax$2488(stx$2534, value$2535, type$2536, inner$2537) {
        if (stx$2534 && Array.isArray(stx$2534) && stx$2534.length === 1) {
            stx$2534 = stx$2534[0];
        } else if (stx$2534 && Array.isArray(stx$2534)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2534);
        }
        if (type$2536 === parser$2478.Token.Delimiter) {
            var startLineNumber$2538, startLineStart$2539, endLineNumber$2540, endLineStart$2541, startRange$2542, endRange$2543;
            if (!Array.isArray(inner$2537)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2534 && stx$2534.token.type === parser$2478.Token.Delimiter) {
                startLineNumber$2538 = stx$2534.token.startLineNumber;
                startLineStart$2539 = stx$2534.token.startLineStart;
                endLineNumber$2540 = stx$2534.token.endLineNumber;
                endLineStart$2541 = stx$2534.token.endLineStart;
                startRange$2542 = stx$2534.token.startRange;
                endRange$2543 = stx$2534.token.endRange;
            } else if (stx$2534 && stx$2534.token) {
                startLineNumber$2538 = stx$2534.token.lineNumber;
                startLineStart$2539 = stx$2534.token.lineStart;
                endLineNumber$2540 = stx$2534.token.lineNumber;
                endLineStart$2541 = stx$2534.token.lineStart;
                startRange$2542 = stx$2534.token.range;
                endRange$2543 = stx$2534.token.range;
            }
            return syntaxFromToken$2487({
                type: parser$2478.Token.Delimiter,
                value: value$2535,
                inner: inner$2537,
                startLineStart: startLineStart$2539,
                startLineNumber: startLineNumber$2538,
                endLineStart: endLineStart$2541,
                endLineNumber: endLineNumber$2540,
                startRange: startRange$2542,
                endRange: endRange$2543
            }, stx$2534);
        } else {
            var lineStart$2544, lineNumber$2545, range$2546;
            if (stx$2534 && stx$2534.token.type === parser$2478.Token.Delimiter) {
                lineStart$2544 = stx$2534.token.startLineStart;
                lineNumber$2545 = stx$2534.token.startLineNumber;
                range$2546 = stx$2534.token.startRange;
            } else if (stx$2534 && stx$2534.token) {
                lineStart$2544 = stx$2534.token.lineStart;
                lineNumber$2545 = stx$2534.token.lineNumber;
                range$2546 = stx$2534.token.range;
            }
            return syntaxFromToken$2487({
                type: type$2536,
                value: value$2535,
                lineStart: lineStart$2544,
                lineNumber: lineNumber$2545,
                range: range$2546
            }, stx$2534);
        }
    }
    function makeValue$2489(val$2547, stx$2548) {
        if (typeof val$2547 === 'boolean') {
            return mkSyntax$2488(stx$2548, val$2547 ? 'true' : 'false', parser$2478.Token.BooleanLiteral);
        } else if (typeof val$2547 === 'number') {
            if (val$2547 !== val$2547) {
                return makeDelim$2494('()', [
                    makeValue$2489(0, stx$2548),
                    makePunc$2493('/', stx$2548),
                    makeValue$2489(0, stx$2548)
                ], stx$2548);
            }
            if (val$2547 < 0) {
                return makeDelim$2494('()', [
                    makePunc$2493('-', stx$2548),
                    makeValue$2489(Math.abs(val$2547), stx$2548)
                ], stx$2548);
            } else {
                return mkSyntax$2488(stx$2548, val$2547, parser$2478.Token.NumericLiteral);
            }
        } else if (typeof val$2547 === 'string') {
            return mkSyntax$2488(stx$2548, val$2547, parser$2478.Token.StringLiteral);
        } else if (val$2547 === null) {
            return mkSyntax$2488(stx$2548, 'null', parser$2478.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2547);
        }
    }
    function makeRegex$2490(val$2549, flags$2550, stx$2551) {
        var newstx$2552 = mkSyntax$2488(stx$2551, new RegExp(val$2549, flags$2550), parser$2478.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2552.token.literal = val$2549;
        return newstx$2552;
    }
    function makeIdent$2491(val$2553, stx$2554) {
        return mkSyntax$2488(stx$2554, val$2553, parser$2478.Token.Identifier);
    }
    function makeKeyword$2492(val$2555, stx$2556) {
        return mkSyntax$2488(stx$2556, val$2555, parser$2478.Token.Keyword);
    }
    function makePunc$2493(val$2557, stx$2558) {
        return mkSyntax$2488(stx$2558, val$2557, parser$2478.Token.Punctuator);
    }
    function makeDelim$2494(val$2559, inner$2560, stx$2561) {
        return mkSyntax$2488(stx$2561, val$2559, parser$2478.Token.Delimiter, inner$2560);
    }
    function unwrapSyntax$2495(stx$2562) {
        if (Array.isArray(stx$2562) && stx$2562.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2562 = stx$2562[0];
        }
        if (stx$2562.token) {
            if (stx$2562.token.type === parser$2478.Token.Delimiter) {
                return stx$2562.token;
            } else {
                return stx$2562.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2562);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2496(stx$2563) {
        return _$2476.map(stx$2563, function (stx$2564) {
            if (stx$2564.token.inner) {
                stx$2564.token.inner = syntaxToTokens$2496(stx$2564.token.inner);
            }
            return stx$2564.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2497(tokens$2565) {
        if (!_$2476.isArray(tokens$2565)) {
            tokens$2565 = [tokens$2565];
        }
        return _$2476.map(tokens$2565, function (token$2566) {
            if (token$2566.inner) {
                token$2566.inner = tokensToSyntax$2497(token$2566.inner);
            }
            return syntaxFromToken$2487(token$2566);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2498(tojoin$2567, punc$2568) {
        if (tojoin$2567.length === 0) {
            return [];
        }
        if (punc$2568 === ' ') {
            return tojoin$2567;
        }
        return _$2476.reduce(_$2476.rest(tojoin$2567, 1), function (acc$2569, join$2570) {
            return acc$2569.concat(makePunc$2493(punc$2568, join$2570), join$2570);
        }, [_$2476.first(tojoin$2567)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2499(tojoin$2571, punc$2572) {
        if (tojoin$2571.length === 0) {
            return [];
        }
        if (punc$2572 === ' ') {
            return _$2476.flatten(tojoin$2571, true);
        }
        return _$2476.reduce(_$2476.rest(tojoin$2571, 1), function (acc$2573, join$2574) {
            return acc$2573.concat(makePunc$2493(punc$2572, _$2476.first(join$2574)), join$2574);
        }, _$2476.first(tojoin$2571));
    }
    function MacroSyntaxError$2500(name$2575, message$2576, stx$2577) {
        this.name = name$2575;
        this.message = message$2576;
        this.stx = stx$2577;
    }
    function throwSyntaxError$2501(name$2578, message$2579, stx$2580) {
        if (stx$2580 && Array.isArray(stx$2580)) {
            stx$2580 = stx$2580[0];
        }
        throw new MacroSyntaxError$2500(name$2578, message$2579, stx$2580);
    }
    function printSyntaxError$2502(code$2581, err$2582) {
        if (!err$2582.stx) {
            return '[' + err$2582.name + '] ' + err$2582.message;
        }
        var token$2583 = err$2582.stx.token;
        var lineNumber$2584 = token$2583.sm_startLineNumber || token$2583.sm_lineNumber || token$2583.startLineNumber || token$2583.lineNumber;
        var lineStart$2585 = token$2583.sm_startLineStart || token$2583.sm_lineStart || token$2583.startLineStart || token$2583.lineStart;
        var start$2586 = (token$2583.sm_startRange || token$2583.sm_range || token$2583.startRange || token$2583.range)[0];
        var offset$2587 = start$2586 - lineStart$2585;
        var line$2588 = '';
        var pre$2589 = lineNumber$2584 + ': ';
        var ch$2590;
        while (ch$2590 = code$2581.charAt(lineStart$2585++)) {
            if (ch$2590 == '\r' || ch$2590 == '\n') {
                break;
            }
            line$2588 += ch$2590;
        }
        return '[' + err$2582.name + '] ' + err$2582.message + '\n' + pre$2589 + line$2588 + '\n' + Array(offset$2587 + pre$2589.length).join(' ') + ' ^';
    }
    exports$2475.unwrapSyntax = unwrapSyntax$2495;
    exports$2475.makeDelim = makeDelim$2494;
    exports$2475.makePunc = makePunc$2493;
    exports$2475.makeKeyword = makeKeyword$2492;
    exports$2475.makeIdent = makeIdent$2491;
    exports$2475.makeRegex = makeRegex$2490;
    exports$2475.makeValue = makeValue$2489;
    exports$2475.Rename = Rename$2479;
    exports$2475.Mark = Mark$2480;
    exports$2475.Var = Var$2482;
    exports$2475.Def = Def$2481;
    exports$2475.isDef = isDef$2485;
    exports$2475.isMark = isMark$2484;
    exports$2475.isRename = isRename$2483;
    exports$2475.syntaxFromToken = syntaxFromToken$2487;
    exports$2475.tokensToSyntax = tokensToSyntax$2497;
    exports$2475.syntaxToTokens = syntaxToTokens$2496;
    exports$2475.joinSyntax = joinSyntax$2498;
    exports$2475.joinSyntaxArr = joinSyntaxArr$2499;
    exports$2475.MacroSyntaxError = MacroSyntaxError$2500;
    exports$2475.throwSyntaxError = throwSyntaxError$2501;
    exports$2475.printSyntaxError = printSyntaxError$2502;
}));
//# sourceMappingURL=syntax.js.map