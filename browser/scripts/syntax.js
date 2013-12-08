(function (root$2429, factory$2430) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2430(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2430);
    }
}(this, function (exports$2431, _$2432, es6$2433, parser$2434) {
    // (CSyntax, Str) -> CContext
    function Rename$2435(id$2459, name$2460, ctx$2461, defctx$2462) {
        defctx$2462 = defctx$2462 || null;
        return {
            id: id$2459,
            name: name$2460,
            context: ctx$2461,
            def: defctx$2462
        };
    }
    // (Num) -> CContext
    function Mark$2436(mark$2463, ctx$2464) {
        return {
            mark: mark$2463,
            context: ctx$2464
        };
    }
    function Def$2437(defctx$2465, ctx$2466) {
        return {
            defctx: defctx$2465,
            context: ctx$2466
        };
    }
    function Var$2438(id$2467) {
        return { id: id$2467 };
    }
    function isRename$2439(r$2468) {
        return r$2468 && typeof r$2468.id !== 'undefined' && typeof r$2468.name !== 'undefined';
    }
    ;
    function isMark$2440(m$2469) {
        return m$2469 && typeof m$2469.mark !== 'undefined';
    }
    ;
    function isDef$2441(ctx$2470) {
        return ctx$2470 && typeof ctx$2470.defctx !== 'undefined';
    }
    function Syntax$2442(token$2471, oldstx$2472) {
        this.token = token$2471;
        this.context = oldstx$2472 && oldstx$2472.context ? oldstx$2472.context : null;
        this.deferredContext = oldstx$2472 && oldstx$2472.deferredContext ? oldstx$2472.deferredContext : null;
    }
    Syntax$2442.prototype = {
        mark: function (newMark$2473) {
            if (this.token.inner) {
                var next$2474 = syntaxFromToken$2443(this.token, this);
                next$2474.deferredContext = Mark$2436(newMark$2473, this.deferredContext);
                return next$2474;
            }
            return syntaxFromToken$2443(this.token, { context: Mark$2436(newMark$2473, this.context) });
        },
        rename: function (id$2475, name$2476, defctx$2477) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2478 = syntaxFromToken$2443(this.token, this);
                next$2478.deferredContext = Rename$2435(id$2475, name$2476, this.deferredContext, defctx$2477);
                return next$2478;
            }
            if (this.token.type === parser$2434.Token.Identifier || this.token.type === parser$2434.Token.Keyword || this.token.type === parser$2434.Token.Punctuator) {
                return syntaxFromToken$2443(this.token, { context: Rename$2435(id$2475, name$2476, this.context, defctx$2477) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2479) {
            if (this.token.inner) {
                var next$2480 = syntaxFromToken$2443(this.token, this);
                next$2480.deferredContext = Def$2437(defctx$2479, this.deferredContext);
                return next$2480;
            }
            return syntaxFromToken$2443(this.token, { context: Def$2437(defctx$2479, this.context) });
        },
        getDefCtx: function () {
            var ctx$2481 = this.context;
            while (ctx$2481 !== null) {
                if (isDef$2441(ctx$2481)) {
                    return ctx$2481.defctx;
                }
                ctx$2481 = ctx$2481.context;
            }
            return null;
        },
        expose: function () {
            parser$2434.assert(this.token.type === parser$2434.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2482(stxCtx$2483, ctx$2484) {
                if (ctx$2484 == null) {
                    return stxCtx$2483;
                } else if (isRename$2439(ctx$2484)) {
                    return Rename$2435(ctx$2484.id, ctx$2484.name, applyContext$2482(stxCtx$2483, ctx$2484.context), ctx$2484.def);
                } else if (isMark$2440(ctx$2484)) {
                    return Mark$2436(ctx$2484.mark, applyContext$2482(stxCtx$2483, ctx$2484.context));
                } else if (isDef$2441(ctx$2484)) {
                    return Def$2437(ctx$2484.defctx, applyContext$2482(stxCtx$2483, ctx$2484.context));
                } else {
                    parser$2434.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2432.map(this.token.inner, _$2432.bind(function (stx$2485) {
                if (stx$2485.token.inner) {
                    var next$2486 = syntaxFromToken$2443(stx$2485.token, stx$2485);
                    next$2486.deferredContext = applyContext$2482(stx$2485.deferredContext, this.deferredContext);
                    return next$2486;
                } else {
                    return syntaxFromToken$2443(stx$2485.token, { context: applyContext$2482(stx$2485.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2487 = this.token.type === parser$2434.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2487 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2443(token$2488, oldstx$2489) {
        return new Syntax$2442(token$2488, oldstx$2489);
    }
    function mkSyntax$2444(stx$2490, value$2491, type$2492, inner$2493) {
        if (stx$2490 && Array.isArray(stx$2490) && stx$2490.length === 1) {
            stx$2490 = stx$2490[0];
        } else if (stx$2490 && Array.isArray(stx$2490)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2490);
        }
        if (type$2492 === parser$2434.Token.Delimiter) {
            var startLineNumber$2494, startLineStart$2495, endLineNumber$2496, endLineStart$2497, startRange$2498, endRange$2499;
            if (!Array.isArray(inner$2493)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2490 && stx$2490.token.type === parser$2434.Token.Delimiter) {
                startLineNumber$2494 = stx$2490.token.startLineNumber;
                startLineStart$2495 = stx$2490.token.startLineStart;
                endLineNumber$2496 = stx$2490.token.endLineNumber;
                endLineStart$2497 = stx$2490.token.endLineStart;
                startRange$2498 = stx$2490.token.startRange;
                endRange$2499 = stx$2490.token.endRange;
            } else if (stx$2490 && stx$2490.token) {
                startLineNumber$2494 = stx$2490.token.lineNumber;
                startLineStart$2495 = stx$2490.token.lineStart;
                endLineNumber$2496 = stx$2490.token.lineNumber;
                endLineStart$2497 = stx$2490.token.lineStart;
                startRange$2498 = stx$2490.token.range;
                endRange$2499 = stx$2490.token.range;
            }
            return syntaxFromToken$2443({
                type: parser$2434.Token.Delimiter,
                value: value$2491,
                inner: inner$2493,
                startLineStart: startLineStart$2495,
                startLineNumber: startLineNumber$2494,
                endLineStart: endLineStart$2497,
                endLineNumber: endLineNumber$2496,
                startRange: startRange$2498,
                endRange: endRange$2499
            }, stx$2490);
        } else {
            var lineStart$2500, lineNumber$2501, range$2502;
            if (stx$2490 && stx$2490.token.type === parser$2434.Token.Delimiter) {
                lineStart$2500 = stx$2490.token.startLineStart;
                lineNumber$2501 = stx$2490.token.startLineNumber;
                range$2502 = stx$2490.token.startRange;
            } else if (stx$2490 && stx$2490.token) {
                lineStart$2500 = stx$2490.token.lineStart;
                lineNumber$2501 = stx$2490.token.lineNumber;
                range$2502 = stx$2490.token.range;
            }
            return syntaxFromToken$2443({
                type: type$2492,
                value: value$2491,
                lineStart: lineStart$2500,
                lineNumber: lineNumber$2501,
                range: range$2502
            }, stx$2490);
        }
    }
    function makeValue$2445(val$2503, stx$2504) {
        if (typeof val$2503 === 'boolean') {
            return mkSyntax$2444(stx$2504, val$2503 ? 'true' : 'false', parser$2434.Token.BooleanLiteral);
        } else if (typeof val$2503 === 'number') {
            if (val$2503 !== val$2503) {
                return makeDelim$2450('()', [
                    makeValue$2445(0, stx$2504),
                    makePunc$2449('/', stx$2504),
                    makeValue$2445(0, stx$2504)
                ], stx$2504);
            }
            if (val$2503 < 0) {
                return makeDelim$2450('()', [
                    makePunc$2449('-', stx$2504),
                    makeValue$2445(Math.abs(val$2503), stx$2504)
                ], stx$2504);
            } else {
                return mkSyntax$2444(stx$2504, val$2503, parser$2434.Token.NumericLiteral);
            }
        } else if (typeof val$2503 === 'string') {
            return mkSyntax$2444(stx$2504, val$2503, parser$2434.Token.StringLiteral);
        } else if (val$2503 === null) {
            return mkSyntax$2444(stx$2504, 'null', parser$2434.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2503);
        }
    }
    function makeRegex$2446(val$2505, flags$2506, stx$2507) {
        var newstx$2508 = mkSyntax$2444(stx$2507, new RegExp(val$2505, flags$2506), parser$2434.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2508.token.literal = val$2505;
        return newstx$2508;
    }
    function makeIdent$2447(val$2509, stx$2510) {
        return mkSyntax$2444(stx$2510, val$2509, parser$2434.Token.Identifier);
    }
    function makeKeyword$2448(val$2511, stx$2512) {
        return mkSyntax$2444(stx$2512, val$2511, parser$2434.Token.Keyword);
    }
    function makePunc$2449(val$2513, stx$2514) {
        return mkSyntax$2444(stx$2514, val$2513, parser$2434.Token.Punctuator);
    }
    function makeDelim$2450(val$2515, inner$2516, stx$2517) {
        return mkSyntax$2444(stx$2517, val$2515, parser$2434.Token.Delimiter, inner$2516);
    }
    function unwrapSyntax$2451(stx$2518) {
        if (Array.isArray(stx$2518) && stx$2518.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2518 = stx$2518[0];
        }
        if (stx$2518.token) {
            if (stx$2518.token.type === parser$2434.Token.Delimiter) {
                return stx$2518.token;
            } else {
                return stx$2518.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2518);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2452(stx$2519) {
        return _$2432.map(stx$2519, function (stx$2520) {
            if (stx$2520.token.inner) {
                stx$2520.token.inner = syntaxToTokens$2452(stx$2520.token.inner);
            }
            return stx$2520.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2453(tokens$2521) {
        if (!_$2432.isArray(tokens$2521)) {
            tokens$2521 = [tokens$2521];
        }
        return _$2432.map(tokens$2521, function (token$2522) {
            if (token$2522.inner) {
                token$2522.inner = tokensToSyntax$2453(token$2522.inner);
            }
            return syntaxFromToken$2443(token$2522);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2454(tojoin$2523, punc$2524) {
        if (tojoin$2523.length === 0) {
            return [];
        }
        if (punc$2524 === ' ') {
            return tojoin$2523;
        }
        return _$2432.reduce(_$2432.rest(tojoin$2523, 1), function (acc$2525, join$2526) {
            return acc$2525.concat(makePunc$2449(punc$2524, join$2526), join$2526);
        }, [_$2432.first(tojoin$2523)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2455(tojoin$2527, punc$2528) {
        if (tojoin$2527.length === 0) {
            return [];
        }
        if (punc$2528 === ' ') {
            return _$2432.flatten(tojoin$2527, true);
        }
        return _$2432.reduce(_$2432.rest(tojoin$2527, 1), function (acc$2529, join$2530) {
            return acc$2529.concat(makePunc$2449(punc$2528, _$2432.first(join$2530)), join$2530);
        }, _$2432.first(tojoin$2527));
    }
    function MacroSyntaxError$2456(name$2531, message$2532, stx$2533) {
        this.name = name$2531;
        this.message = message$2532;
        this.stx = stx$2533;
    }
    function throwSyntaxError$2457(name$2534, message$2535, stx$2536) {
        if (stx$2536 && Array.isArray(stx$2536)) {
            stx$2536 = stx$2536[0];
        }
        throw new MacroSyntaxError$2456(name$2534, message$2535, stx$2536);
    }
    function printSyntaxError$2458(code$2537, err$2538) {
        if (!err$2538.stx) {
            return '[' + err$2538.name + '] ' + err$2538.message;
        }
        var token$2539 = err$2538.stx.token;
        var lineNumber$2540 = token$2539.sm_startLineNumber || token$2539.sm_lineNumber || token$2539.startLineNumber || token$2539.lineNumber;
        var lineStart$2541 = token$2539.sm_startLineStart || token$2539.sm_lineStart || token$2539.startLineStart || token$2539.lineStart;
        var start$2542 = (token$2539.sm_startRange || token$2539.sm_range || token$2539.startRange || token$2539.range)[0];
        var offset$2543 = start$2542 - lineStart$2541;
        var line$2544 = '';
        var pre$2545 = lineNumber$2540 + ': ';
        var ch$2546;
        while (ch$2546 = code$2537.charAt(lineStart$2541++)) {
            if (ch$2546 == '\r' || ch$2546 == '\n') {
                break;
            }
            line$2544 += ch$2546;
        }
        return '[' + err$2538.name + '] ' + err$2538.message + '\n' + pre$2545 + line$2544 + '\n' + Array(offset$2543 + pre$2545.length).join(' ') + ' ^';
    }
    exports$2431.unwrapSyntax = unwrapSyntax$2451;
    exports$2431.makeDelim = makeDelim$2450;
    exports$2431.makePunc = makePunc$2449;
    exports$2431.makeKeyword = makeKeyword$2448;
    exports$2431.makeIdent = makeIdent$2447;
    exports$2431.makeRegex = makeRegex$2446;
    exports$2431.makeValue = makeValue$2445;
    exports$2431.Rename = Rename$2435;
    exports$2431.Mark = Mark$2436;
    exports$2431.Var = Var$2438;
    exports$2431.Def = Def$2437;
    exports$2431.isDef = isDef$2441;
    exports$2431.isMark = isMark$2440;
    exports$2431.isRename = isRename$2439;
    exports$2431.syntaxFromToken = syntaxFromToken$2443;
    exports$2431.tokensToSyntax = tokensToSyntax$2453;
    exports$2431.syntaxToTokens = syntaxToTokens$2452;
    exports$2431.joinSyntax = joinSyntax$2454;
    exports$2431.joinSyntaxArr = joinSyntaxArr$2455;
    exports$2431.MacroSyntaxError = MacroSyntaxError$2456;
    exports$2431.throwSyntaxError = throwSyntaxError$2457;
    exports$2431.printSyntaxError = printSyntaxError$2458;
}));
//# sourceMappingURL=syntax.js.map