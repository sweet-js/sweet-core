(function (root$2501, factory$2502) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2502(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2502);
    }
}(this, function (exports$2503, _$2504, es6$2505, parser$2506) {
    function assert$2507(condition$2532, message$2533) {
        if (!condition$2532) {
            throw new Error('ASSERT: ' + message$2533);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$2508(id$2534, name$2535, ctx$2536, defctx$2537) {
        defctx$2537 = defctx$2537 || null;
        return {
            id: id$2534,
            name: name$2535,
            context: ctx$2536,
            def: defctx$2537
        };
    }
    // (Num) -> CContext
    function Mark$2509(mark$2538, ctx$2539) {
        return {
            mark: mark$2538,
            context: ctx$2539
        };
    }
    function Def$2510(defctx$2540, ctx$2541) {
        return {
            defctx: defctx$2540,
            context: ctx$2541
        };
    }
    function Var$2511(id$2542) {
        return { id: id$2542 };
    }
    function isRename$2512(r$2543) {
        return r$2543 && typeof r$2543.id !== 'undefined' && typeof r$2543.name !== 'undefined';
    }
    ;
    function isMark$2513(m$2544) {
        return m$2544 && typeof m$2544.mark !== 'undefined';
    }
    ;
    function isDef$2514(ctx$2545) {
        return ctx$2545 && typeof ctx$2545.defctx !== 'undefined';
    }
    function Syntax$2515(token$2546, oldstx$2547) {
        this.token = token$2546;
        this.context = oldstx$2547 && oldstx$2547.context ? oldstx$2547.context : null;
        this.deferredContext = oldstx$2547 && oldstx$2547.deferredContext ? oldstx$2547.deferredContext : null;
    }
    Syntax$2515.prototype = {
        mark: function (newMark$2548) {
            if (this.token.inner) {
                var next$2549 = syntaxFromToken$2516(this.token, this);
                next$2549.deferredContext = Mark$2509(newMark$2548, this.deferredContext);
                return next$2549;
            }
            return syntaxFromToken$2516(this.token, { context: Mark$2509(newMark$2548, this.context) });
        },
        rename: function (id$2550, name$2551, defctx$2552) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2553 = syntaxFromToken$2516(this.token, this);
                next$2553.deferredContext = Rename$2508(id$2550, name$2551, this.deferredContext, defctx$2552);
                return next$2553;
            }
            if (this.token.type === parser$2506.Token.Identifier || this.token.type === parser$2506.Token.Keyword || this.token.type === parser$2506.Token.Punctuator) {
                return syntaxFromToken$2516(this.token, { context: Rename$2508(id$2550, name$2551, this.context, defctx$2552) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2554) {
            if (this.token.inner) {
                var next$2555 = syntaxFromToken$2516(this.token, this);
                next$2555.deferredContext = Def$2510(defctx$2554, this.deferredContext);
                return next$2555;
            }
            return syntaxFromToken$2516(this.token, { context: Def$2510(defctx$2554, this.context) });
        },
        getDefCtx: function () {
            var ctx$2556 = this.context;
            while (ctx$2556 !== null) {
                if (isDef$2514(ctx$2556)) {
                    return ctx$2556.defctx;
                }
                ctx$2556 = ctx$2556.context;
            }
            return null;
        },
        expose: function () {
            assert$2507(this.token.type === parser$2506.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2557(stxCtx$2558, ctx$2559) {
                if (ctx$2559 == null) {
                    return stxCtx$2558;
                } else if (isRename$2512(ctx$2559)) {
                    return Rename$2508(ctx$2559.id, ctx$2559.name, applyContext$2557(stxCtx$2558, ctx$2559.context), ctx$2559.def);
                } else if (isMark$2513(ctx$2559)) {
                    return Mark$2509(ctx$2559.mark, applyContext$2557(stxCtx$2558, ctx$2559.context));
                } else if (isDef$2514(ctx$2559)) {
                    return Def$2510(ctx$2559.defctx, applyContext$2557(stxCtx$2558, ctx$2559.context));
                } else {
                    assert$2507(false, 'unknown context type');
                }
            }
            this.token.inner = _$2504.map(this.token.inner, _$2504.bind(function (stx$2560) {
                if (stx$2560.token.inner) {
                    var next$2561 = syntaxFromToken$2516(stx$2560.token, stx$2560);
                    next$2561.deferredContext = applyContext$2557(stx$2560.deferredContext, this.deferredContext);
                    return next$2561;
                } else {
                    return syntaxFromToken$2516(stx$2560.token, { context: applyContext$2557(stx$2560.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2562 = this.token.type === parser$2506.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2562 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2516(token$2563, oldstx$2564) {
        return new Syntax$2515(token$2563, oldstx$2564);
    }
    function mkSyntax$2517(stx$2565, value$2566, type$2567, inner$2568) {
        if (stx$2565 && Array.isArray(stx$2565) && stx$2565.length === 1) {
            stx$2565 = stx$2565[0];
        } else if (stx$2565 && Array.isArray(stx$2565)) {
            throw new Error();
            throwSyntaxError$2530('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        }
        if (type$2567 === parser$2506.Token.Delimiter) {
            var startLineNumber$2569, startLineStart$2570, endLineNumber$2571, endLineStart$2572, startRange$2573, endRange$2574;
            if (!Array.isArray(inner$2568)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
                throwSyntaxError$2530('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2565 && stx$2565.token.type === parser$2506.Token.Delimiter) {
                startLineNumber$2569 = stx$2565.token.startLineNumber;
                startLineStart$2570 = stx$2565.token.startLineStart;
                endLineNumber$2571 = stx$2565.token.endLineNumber;
                endLineStart$2572 = stx$2565.token.endLineStart;
                startRange$2573 = stx$2565.token.startRange;
                endRange$2574 = stx$2565.token.endRange;
            } else if (stx$2565 && stx$2565.token) {
                startLineNumber$2569 = stx$2565.token.lineNumber;
                startLineStart$2570 = stx$2565.token.lineStart;
                endLineNumber$2571 = stx$2565.token.lineNumber;
                endLineStart$2572 = stx$2565.token.lineStart;
                startRange$2573 = stx$2565.token.range;
                endRange$2574 = stx$2565.token.range;
            }
            return syntaxFromToken$2516({
                type: parser$2506.Token.Delimiter,
                value: value$2566,
                inner: inner$2568,
                startLineStart: startLineStart$2570,
                startLineNumber: startLineNumber$2569,
                endLineStart: endLineStart$2572,
                endLineNumber: endLineNumber$2571,
                startRange: startRange$2573,
                endRange: endRange$2574
            }, stx$2565);
        } else {
            var lineStart$2575, lineNumber$2576, range$2577;
            if (stx$2565 && stx$2565.token.type === parser$2506.Token.Delimiter) {
                lineStart$2575 = stx$2565.token.startLineStart;
                lineNumber$2576 = stx$2565.token.startLineNumber;
                range$2577 = stx$2565.token.startRange;
            } else if (stx$2565 && stx$2565.token) {
                lineStart$2575 = stx$2565.token.lineStart;
                lineNumber$2576 = stx$2565.token.lineNumber;
                range$2577 = stx$2565.token.range;
            }
            return syntaxFromToken$2516({
                type: type$2567,
                value: value$2566,
                lineStart: lineStart$2575,
                lineNumber: lineNumber$2576,
                range: range$2577
            }, stx$2565);
        }
    }
    function makeValue$2518(val$2578, stx$2579) {
        if (typeof val$2578 === 'boolean') {
            return mkSyntax$2517(stx$2579, val$2578 ? 'true' : 'false', parser$2506.Token.BooleanLiteral);
        } else if (typeof val$2578 === 'number') {
            if (val$2578 !== val$2578) {
                return makeDelim$2523('()', [
                    makeValue$2518(0, stx$2579),
                    makePunc$2522('/', stx$2579),
                    makeValue$2518(0, stx$2579)
                ], stx$2579);
            }
            if (val$2578 < 0) {
                return makeDelim$2523('()', [
                    makePunc$2522('-', stx$2579),
                    makeValue$2518(Math.abs(val$2578), stx$2579)
                ], stx$2579);
            } else {
                return mkSyntax$2517(stx$2579, val$2578, parser$2506.Token.NumericLiteral);
            }
        } else if (typeof val$2578 === 'string') {
            return mkSyntax$2517(stx$2579, val$2578, parser$2506.Token.StringLiteral);
        } else if (val$2578 === null) {
            return mkSyntax$2517(stx$2579, 'null', parser$2506.Token.NullLiteral);
        } else {
            throwSyntaxError$2530('makeValue', 'Cannot make value syntax object from: ' + val$2578);
        }
    }
    function makeRegex$2519(val$2580, flags$2581, stx$2582) {
        var newstx$2583 = mkSyntax$2517(stx$2582, new RegExp(val$2580, flags$2581), parser$2506.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2583.token.literal = val$2580;
        return newstx$2583;
    }
    function makeIdent$2520(val$2584, stx$2585) {
        return mkSyntax$2517(stx$2585, val$2584, parser$2506.Token.Identifier);
    }
    function makeKeyword$2521(val$2586, stx$2587) {
        return mkSyntax$2517(stx$2587, val$2586, parser$2506.Token.Keyword);
    }
    function makePunc$2522(val$2588, stx$2589) {
        return mkSyntax$2517(stx$2589, val$2588, parser$2506.Token.Punctuator);
    }
    function makeDelim$2523(val$2590, inner$2591, stx$2592) {
        return mkSyntax$2517(stx$2592, val$2590, parser$2506.Token.Delimiter, inner$2591);
    }
    function unwrapSyntax$2524(stx$2593) {
        if (Array.isArray(stx$2593) && stx$2593.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2593 = stx$2593[0];
        }
        if (stx$2593.token) {
            if (stx$2593.token.type === parser$2506.Token.Delimiter) {
                return stx$2593.token;
            } else {
                return stx$2593.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2593);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2525(stx$2594) {
        return _$2504.map(stx$2594, function (stx$2595) {
            if (stx$2595.token.inner) {
                stx$2595.token.inner = syntaxToTokens$2525(stx$2595.token.inner);
            }
            return stx$2595.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2526(tokens$2596) {
        if (!_$2504.isArray(tokens$2596)) {
            tokens$2596 = [tokens$2596];
        }
        return _$2504.map(tokens$2596, function (token$2597) {
            if (token$2597.inner) {
                token$2597.inner = tokensToSyntax$2526(token$2597.inner);
            }
            return syntaxFromToken$2516(token$2597);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2527(tojoin$2598, punc$2599) {
        if (tojoin$2598.length === 0) {
            return [];
        }
        if (punc$2599 === ' ') {
            return tojoin$2598;
        }
        return _$2504.reduce(_$2504.rest(tojoin$2598, 1), function (acc$2600, join$2601) {
            return acc$2600.concat(makePunc$2522(punc$2599, join$2601), join$2601);
        }, [_$2504.first(tojoin$2598)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2528(tojoin$2602, punc$2603) {
        if (tojoin$2602.length === 0) {
            return [];
        }
        if (punc$2603 === ' ') {
            return _$2504.flatten(tojoin$2602, true);
        }
        return _$2504.reduce(_$2504.rest(tojoin$2602, 1), function (acc$2604, join$2605) {
            return acc$2604.concat(makePunc$2522(punc$2603, _$2504.first(join$2605)), join$2605);
        }, _$2504.first(tojoin$2602));
    }
    function MacroSyntaxError$2529(name$2606, message$2607, stx$2608) {
        this.name = name$2606;
        this.message = message$2607;
        this.stx = stx$2608;
    }
    function throwSyntaxError$2530(name$2609, message$2610, stx$2611) {
        if (stx$2611 && Array.isArray(stx$2611)) {
            stx$2611 = stx$2611[0];
        }
        throw new MacroSyntaxError$2529(name$2609, message$2610, stx$2611);
    }
    function printSyntaxError$2531(code$2612, err$2613) {
        if (!err$2613.stx) {
            return '[' + err$2613.name + '] ' + err$2613.message;
        }
        var token$2614 = err$2613.stx.token;
        var lineNumber$2615 = token$2614.sm_startLineNumber || token$2614.sm_lineNumber || token$2614.startLineNumber || token$2614.lineNumber;
        var lineStart$2616 = token$2614.sm_startLineStart || token$2614.sm_lineStart || token$2614.startLineStart || token$2614.lineStart;
        var start$2617 = (token$2614.sm_startRange || token$2614.sm_range || token$2614.startRange || token$2614.range)[0];
        var offset$2618 = start$2617 - lineStart$2616;
        var line$2619 = '';
        var pre$2620 = lineNumber$2615 + ': ';
        var ch$2621;
        while (ch$2621 = code$2612.charAt(lineStart$2616++)) {
            if (ch$2621 == '\r' || ch$2621 == '\n') {
                break;
            }
            line$2619 += ch$2621;
        }
        return '[' + err$2613.name + '] ' + err$2613.message + '\n' + pre$2620 + line$2619 + '\n' + Array(offset$2618 + pre$2620.length).join(' ') + ' ^';
    }
    exports$2503.assert = assert$2507;
    exports$2503.unwrapSyntax = unwrapSyntax$2524;
    exports$2503.makeDelim = makeDelim$2523;
    exports$2503.makePunc = makePunc$2522;
    exports$2503.makeKeyword = makeKeyword$2521;
    exports$2503.makeIdent = makeIdent$2520;
    exports$2503.makeRegex = makeRegex$2519;
    exports$2503.makeValue = makeValue$2518;
    exports$2503.Rename = Rename$2508;
    exports$2503.Mark = Mark$2509;
    exports$2503.Var = Var$2511;
    exports$2503.Def = Def$2510;
    exports$2503.isDef = isDef$2514;
    exports$2503.isMark = isMark$2513;
    exports$2503.isRename = isRename$2512;
    exports$2503.syntaxFromToken = syntaxFromToken$2516;
    exports$2503.tokensToSyntax = tokensToSyntax$2526;
    exports$2503.syntaxToTokens = syntaxToTokens$2525;
    exports$2503.joinSyntax = joinSyntax$2527;
    exports$2503.joinSyntaxArr = joinSyntaxArr$2528;
    exports$2503.MacroSyntaxError = MacroSyntaxError$2529;
    exports$2503.throwSyntaxError = throwSyntaxError$2530;
    exports$2503.printSyntaxError = printSyntaxError$2531;
}));
//# sourceMappingURL=syntax.js.map