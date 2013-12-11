(function (root$2519, factory$2520) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2520(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2520);
    }
}(this, function (exports$2521, _$2522, es6$2523, parser$2524) {
    function assert$2525(condition$2550, message$2551) {
        if (!condition$2550) {
            throw new Error('ASSERT: ' + message$2551);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$2526(id$2552, name$2553, ctx$2554, defctx$2555) {
        defctx$2555 = defctx$2555 || null;
        return {
            id: id$2552,
            name: name$2553,
            context: ctx$2554,
            def: defctx$2555
        };
    }
    // (Num) -> CContext
    function Mark$2527(mark$2556, ctx$2557) {
        return {
            mark: mark$2556,
            context: ctx$2557
        };
    }
    function Def$2528(defctx$2558, ctx$2559) {
        return {
            defctx: defctx$2558,
            context: ctx$2559
        };
    }
    function Var$2529(id$2560) {
        return { id: id$2560 };
    }
    function isRename$2530(r$2561) {
        return r$2561 && typeof r$2561.id !== 'undefined' && typeof r$2561.name !== 'undefined';
    }
    ;
    function isMark$2531(m$2562) {
        return m$2562 && typeof m$2562.mark !== 'undefined';
    }
    ;
    function isDef$2532(ctx$2563) {
        return ctx$2563 && typeof ctx$2563.defctx !== 'undefined';
    }
    function Syntax$2533(token$2564, oldstx$2565) {
        this.token = token$2564;
        this.context = oldstx$2565 && oldstx$2565.context ? oldstx$2565.context : null;
        this.deferredContext = oldstx$2565 && oldstx$2565.deferredContext ? oldstx$2565.deferredContext : null;
    }
    Syntax$2533.prototype = {
        mark: function (newMark$2566) {
            if (this.token.inner) {
                var next$2567 = syntaxFromToken$2534(this.token, this);
                next$2567.deferredContext = Mark$2527(newMark$2566, this.deferredContext);
                return next$2567;
            }
            return syntaxFromToken$2534(this.token, { context: Mark$2527(newMark$2566, this.context) });
        },
        rename: function (id$2568, name$2569, defctx$2570) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2571 = syntaxFromToken$2534(this.token, this);
                next$2571.deferredContext = Rename$2526(id$2568, name$2569, this.deferredContext, defctx$2570);
                return next$2571;
            }
            if (this.token.type === parser$2524.Token.Identifier || this.token.type === parser$2524.Token.Keyword || this.token.type === parser$2524.Token.Punctuator) {
                return syntaxFromToken$2534(this.token, { context: Rename$2526(id$2568, name$2569, this.context, defctx$2570) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2572) {
            if (this.token.inner) {
                var next$2573 = syntaxFromToken$2534(this.token, this);
                next$2573.deferredContext = Def$2528(defctx$2572, this.deferredContext);
                return next$2573;
            }
            return syntaxFromToken$2534(this.token, { context: Def$2528(defctx$2572, this.context) });
        },
        getDefCtx: function () {
            var ctx$2574 = this.context;
            while (ctx$2574 !== null) {
                if (isDef$2532(ctx$2574)) {
                    return ctx$2574.defctx;
                }
                ctx$2574 = ctx$2574.context;
            }
            return null;
        },
        expose: function () {
            assert$2525(this.token.type === parser$2524.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2575(stxCtx$2576, ctx$2577) {
                if (ctx$2577 == null) {
                    return stxCtx$2576;
                } else if (isRename$2530(ctx$2577)) {
                    return Rename$2526(ctx$2577.id, ctx$2577.name, applyContext$2575(stxCtx$2576, ctx$2577.context), ctx$2577.def);
                } else if (isMark$2531(ctx$2577)) {
                    return Mark$2527(ctx$2577.mark, applyContext$2575(stxCtx$2576, ctx$2577.context));
                } else if (isDef$2532(ctx$2577)) {
                    return Def$2528(ctx$2577.defctx, applyContext$2575(stxCtx$2576, ctx$2577.context));
                } else {
                    assert$2525(false, 'unknown context type');
                }
            }
            this.token.inner = _$2522.map(this.token.inner, _$2522.bind(function (stx$2578) {
                if (stx$2578.token.inner) {
                    var next$2579 = syntaxFromToken$2534(stx$2578.token, stx$2578);
                    next$2579.deferredContext = applyContext$2575(stx$2578.deferredContext, this.deferredContext);
                    return next$2579;
                } else {
                    return syntaxFromToken$2534(stx$2578.token, { context: applyContext$2575(stx$2578.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2580 = this.token.type === parser$2524.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2580 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2534(token$2581, oldstx$2582) {
        return new Syntax$2533(token$2581, oldstx$2582);
    }
    function mkSyntax$2535(stx$2583, value$2584, type$2585, inner$2586) {
        if (stx$2583 && Array.isArray(stx$2583) && stx$2583.length === 1) {
            stx$2583 = stx$2583[0];
        } else if (stx$2583 && Array.isArray(stx$2583)) {
            throw new Error();
            throwSyntaxError$2548('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        }
        if (type$2585 === parser$2524.Token.Delimiter) {
            var startLineNumber$2587, startLineStart$2588, endLineNumber$2589, endLineStart$2590, startRange$2591, endRange$2592;
            if (!Array.isArray(inner$2586)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
                throwSyntaxError$2548('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2583 && stx$2583.token.type === parser$2524.Token.Delimiter) {
                startLineNumber$2587 = stx$2583.token.startLineNumber;
                startLineStart$2588 = stx$2583.token.startLineStart;
                endLineNumber$2589 = stx$2583.token.endLineNumber;
                endLineStart$2590 = stx$2583.token.endLineStart;
                startRange$2591 = stx$2583.token.startRange;
                endRange$2592 = stx$2583.token.endRange;
            } else if (stx$2583 && stx$2583.token) {
                startLineNumber$2587 = stx$2583.token.lineNumber;
                startLineStart$2588 = stx$2583.token.lineStart;
                endLineNumber$2589 = stx$2583.token.lineNumber;
                endLineStart$2590 = stx$2583.token.lineStart;
                startRange$2591 = stx$2583.token.range;
                endRange$2592 = stx$2583.token.range;
            }
            return syntaxFromToken$2534({
                type: parser$2524.Token.Delimiter,
                value: value$2584,
                inner: inner$2586,
                startLineStart: startLineStart$2588,
                startLineNumber: startLineNumber$2587,
                endLineStart: endLineStart$2590,
                endLineNumber: endLineNumber$2589,
                startRange: startRange$2591,
                endRange: endRange$2592
            }, stx$2583);
        } else {
            var lineStart$2593, lineNumber$2594, range$2595;
            if (stx$2583 && stx$2583.token.type === parser$2524.Token.Delimiter) {
                lineStart$2593 = stx$2583.token.startLineStart;
                lineNumber$2594 = stx$2583.token.startLineNumber;
                range$2595 = stx$2583.token.startRange;
            } else if (stx$2583 && stx$2583.token) {
                lineStart$2593 = stx$2583.token.lineStart;
                lineNumber$2594 = stx$2583.token.lineNumber;
                range$2595 = stx$2583.token.range;
            }
            return syntaxFromToken$2534({
                type: type$2585,
                value: value$2584,
                lineStart: lineStart$2593,
                lineNumber: lineNumber$2594,
                range: range$2595
            }, stx$2583);
        }
    }
    function makeValue$2536(val$2596, stx$2597) {
        if (typeof val$2596 === 'boolean') {
            return mkSyntax$2535(stx$2597, val$2596 ? 'true' : 'false', parser$2524.Token.BooleanLiteral);
        } else if (typeof val$2596 === 'number') {
            if (val$2596 !== val$2596) {
                return makeDelim$2541('()', [
                    makeValue$2536(0, stx$2597),
                    makePunc$2540('/', stx$2597),
                    makeValue$2536(0, stx$2597)
                ], stx$2597);
            }
            if (val$2596 < 0) {
                return makeDelim$2541('()', [
                    makePunc$2540('-', stx$2597),
                    makeValue$2536(Math.abs(val$2596), stx$2597)
                ], stx$2597);
            } else {
                return mkSyntax$2535(stx$2597, val$2596, parser$2524.Token.NumericLiteral);
            }
        } else if (typeof val$2596 === 'string') {
            return mkSyntax$2535(stx$2597, val$2596, parser$2524.Token.StringLiteral);
        } else if (val$2596 === null) {
            return mkSyntax$2535(stx$2597, 'null', parser$2524.Token.NullLiteral);
        } else {
            throwSyntaxError$2548('makeValue', 'Cannot make value syntax object from: ' + val$2596);
        }
    }
    function makeRegex$2537(val$2598, flags$2599, stx$2600) {
        var newstx$2601 = mkSyntax$2535(stx$2600, new RegExp(val$2598, flags$2599), parser$2524.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2601.token.literal = val$2598;
        return newstx$2601;
    }
    function makeIdent$2538(val$2602, stx$2603) {
        return mkSyntax$2535(stx$2603, val$2602, parser$2524.Token.Identifier);
    }
    function makeKeyword$2539(val$2604, stx$2605) {
        return mkSyntax$2535(stx$2605, val$2604, parser$2524.Token.Keyword);
    }
    function makePunc$2540(val$2606, stx$2607) {
        return mkSyntax$2535(stx$2607, val$2606, parser$2524.Token.Punctuator);
    }
    function makeDelim$2541(val$2608, inner$2609, stx$2610) {
        return mkSyntax$2535(stx$2610, val$2608, parser$2524.Token.Delimiter, inner$2609);
    }
    function unwrapSyntax$2542(stx$2611) {
        if (Array.isArray(stx$2611) && stx$2611.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2611 = stx$2611[0];
        }
        if (stx$2611.token) {
            if (stx$2611.token.type === parser$2524.Token.Delimiter) {
                return stx$2611.token;
            } else {
                return stx$2611.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2611);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2543(stx$2612) {
        return _$2522.map(stx$2612, function (stx$2613) {
            if (stx$2613.token.inner) {
                stx$2613.token.inner = syntaxToTokens$2543(stx$2613.token.inner);
            }
            return stx$2613.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2544(tokens$2614) {
        if (!_$2522.isArray(tokens$2614)) {
            tokens$2614 = [tokens$2614];
        }
        return _$2522.map(tokens$2614, function (token$2615) {
            if (token$2615.inner) {
                token$2615.inner = tokensToSyntax$2544(token$2615.inner);
            }
            return syntaxFromToken$2534(token$2615);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2545(tojoin$2616, punc$2617) {
        if (tojoin$2616.length === 0) {
            return [];
        }
        if (punc$2617 === ' ') {
            return tojoin$2616;
        }
        return _$2522.reduce(_$2522.rest(tojoin$2616, 1), function (acc$2618, join$2619) {
            return acc$2618.concat(makePunc$2540(punc$2617, join$2619), join$2619);
        }, [_$2522.first(tojoin$2616)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2546(tojoin$2620, punc$2621) {
        if (tojoin$2620.length === 0) {
            return [];
        }
        if (punc$2621 === ' ') {
            return _$2522.flatten(tojoin$2620, true);
        }
        return _$2522.reduce(_$2522.rest(tojoin$2620, 1), function (acc$2622, join$2623) {
            return acc$2622.concat(makePunc$2540(punc$2621, _$2522.first(join$2623)), join$2623);
        }, _$2522.first(tojoin$2620));
    }
    function MacroSyntaxError$2547(name$2624, message$2625, stx$2626) {
        this.name = name$2624;
        this.message = message$2625;
        this.stx = stx$2626;
    }
    function throwSyntaxError$2548(name$2627, message$2628, stx$2629) {
        if (stx$2629 && Array.isArray(stx$2629)) {
            stx$2629 = stx$2629[0];
        }
        throw new MacroSyntaxError$2547(name$2627, message$2628, stx$2629);
    }
    function printSyntaxError$2549(code$2630, err$2631) {
        if (!err$2631.stx) {
            return '[' + err$2631.name + '] ' + err$2631.message;
        }
        var token$2632 = err$2631.stx.token;
        var lineNumber$2633 = token$2632.sm_startLineNumber || token$2632.sm_lineNumber || token$2632.startLineNumber || token$2632.lineNumber;
        var lineStart$2634 = token$2632.sm_startLineStart || token$2632.sm_lineStart || token$2632.startLineStart || token$2632.lineStart;
        var start$2635 = (token$2632.sm_startRange || token$2632.sm_range || token$2632.startRange || token$2632.range)[0];
        var offset$2636 = start$2635 - lineStart$2634;
        var line$2637 = '';
        var pre$2638 = lineNumber$2633 + ': ';
        var ch$2639;
        while (ch$2639 = code$2630.charAt(lineStart$2634++)) {
            if (ch$2639 == '\r' || ch$2639 == '\n') {
                break;
            }
            line$2637 += ch$2639;
        }
        return '[' + err$2631.name + '] ' + err$2631.message + '\n' + pre$2638 + line$2637 + '\n' + Array(offset$2636 + pre$2638.length).join(' ') + ' ^';
    }
    exports$2521.assert = assert$2525;
    exports$2521.unwrapSyntax = unwrapSyntax$2542;
    exports$2521.makeDelim = makeDelim$2541;
    exports$2521.makePunc = makePunc$2540;
    exports$2521.makeKeyword = makeKeyword$2539;
    exports$2521.makeIdent = makeIdent$2538;
    exports$2521.makeRegex = makeRegex$2537;
    exports$2521.makeValue = makeValue$2536;
    exports$2521.Rename = Rename$2526;
    exports$2521.Mark = Mark$2527;
    exports$2521.Var = Var$2529;
    exports$2521.Def = Def$2528;
    exports$2521.isDef = isDef$2532;
    exports$2521.isMark = isMark$2531;
    exports$2521.isRename = isRename$2530;
    exports$2521.syntaxFromToken = syntaxFromToken$2534;
    exports$2521.tokensToSyntax = tokensToSyntax$2544;
    exports$2521.syntaxToTokens = syntaxToTokens$2543;
    exports$2521.joinSyntax = joinSyntax$2545;
    exports$2521.joinSyntaxArr = joinSyntaxArr$2546;
    exports$2521.MacroSyntaxError = MacroSyntaxError$2547;
    exports$2521.throwSyntaxError = throwSyntaxError$2548;
    exports$2521.printSyntaxError = printSyntaxError$2549;
}));
//# sourceMappingURL=syntax.js.map