(function (root$97, factory$98) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$98(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$98);
    }
}(this, function (exports$99, _$100, es6$101, parser$102) {
    // (CSyntax, Str) -> CContext
    function Rename$103(id$127, name$128, ctx$129, defctx$130) {
        defctx$130 = defctx$130 || null;
        return {
            id: id$127,
            name: name$128,
            context: ctx$129,
            def: defctx$130
        };
    }
    // (Num) -> CContext
    function Mark$104(mark$131, ctx$132) {
        return {
            mark: mark$131,
            context: ctx$132
        };
    }
    function Def$105(defctx$133, ctx$134) {
        return {
            defctx: defctx$133,
            context: ctx$134
        };
    }
    function Var$106(id$135) {
        return { id: id$135 };
    }
    function isRename$107(r$136) {
        return r$136 && typeof r$136.id !== 'undefined' && typeof r$136.name !== 'undefined';
    }
    ;
    function isMark$108(m$137) {
        return m$137 && typeof m$137.mark !== 'undefined';
    }
    ;
    function isDef$109(ctx$138) {
        return ctx$138 && typeof ctx$138.defctx !== 'undefined';
    }
    function Syntax$110(token$139, oldstx$140) {
        this.token = token$139;
        this.context = oldstx$140 && oldstx$140.context ? oldstx$140.context : null;
        this.deferredContext = oldstx$140 && oldstx$140.deferredContext ? oldstx$140.deferredContext : null;
    }
    Syntax$110.prototype = {
        mark: function (newMark$141) {
            if (this.token.inner) {
                var next$142 = syntaxFromToken$111(this.token, this);
                next$142.deferredContext = Mark$104(newMark$141, this.deferredContext);
                return next$142;
            }
            return syntaxFromToken$111(this.token, { context: Mark$104(newMark$141, this.context) });
        },
        rename: function (id$143, name$144) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$145 = syntaxFromToken$111(this.token, this);
                next$145.deferredContext = Rename$103(id$143, name$144, this.deferredContext);
                return next$145;
            }
            if (this.token.type === parser$102.Token.Identifier || this.token.type === parser$102.Token.Keyword) {
                return syntaxFromToken$111(this.token, { context: Rename$103(id$143, name$144, this.context) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$146) {
            if (this.token.inner) {
                var next$147 = syntaxFromToken$111(this.token, this);
                next$147.deferredContext = Def$105(defctx$146, this.deferredContext);
                return next$147;
            }
            return syntaxFromToken$111(this.token, { context: Def$105(defctx$146, this.context) });
        },
        getDefCtx: function () {
            var ctx$148 = this.context;
            while (ctx$148 !== null) {
                if (isDef$109(ctx$148)) {
                    return ctx$148.defctx;
                }
                ctx$148 = ctx$148.context;
            }
            return null;
        },
        expose: function () {
            parser$102.assert(this.token.type === parser$102.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$149(stxCtx$150, ctx$151) {
                if (ctx$151 == null) {
                    return stxCtx$150;
                } else if (isRename$107(ctx$151)) {
                    return Rename$103(ctx$151.id, ctx$151.name, applyContext$149(stxCtx$150, ctx$151.context));
                } else if (isMark$108(ctx$151)) {
                    return Mark$104(ctx$151.mark, applyContext$149(stxCtx$150, ctx$151.context));
                } else if (isDef$109(ctx$151)) {
                    return Def$105(ctx$151.defctx, applyContext$149(stxCtx$150, ctx$151.context));
                } else {
                    parser$102.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$100.map(this.token.inner, _$100.bind(function (stx$152) {
                if (stx$152.token.inner) {
                    var next$153 = syntaxFromToken$111(stx$152.token, stx$152);
                    next$153.deferredContext = applyContext$149(stx$152.deferredContext, this.deferredContext);
                    return next$153;
                } else {
                    return syntaxFromToken$111(stx$152.token, { context: applyContext$149(stx$152.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$154 = this.token.type === parser$102.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$154 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$111(token$155, oldstx$156) {
        return new Syntax$110(token$155, oldstx$156);
    }
    function mkSyntax$112(stx$157, value$158, type$159, inner$160) {
        if (stx$157 && Array.isArray(stx$157) && stx$157.length === 1) {
            stx$157 = stx$157[0];
        } else if (stx$157 && Array.isArray(stx$157)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$157);
        }
        if (type$159 === parser$102.Token.Delimiter) {
            var startLineNumber$161, startLineStart$162, endLineNumber$163, endLineStart$164, startRange$165, endRange$166;
            if (!Array.isArray(inner$160)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$157 && stx$157.token.type === parser$102.Token.Delimiter) {
                startLineNumber$161 = stx$157.token.startLineNumber;
                startLineStart$162 = stx$157.token.startLineStart;
                endLineNumber$163 = stx$157.token.endLineNumber;
                endLineStart$164 = stx$157.token.endLineStart;
                startRange$165 = stx$157.token.startRange;
                endRange$166 = stx$157.token.endRange;
            } else if (stx$157 && stx$157.token) {
                startLineNumber$161 = stx$157.token.lineNumber;
                startLineStart$162 = stx$157.token.lineStart;
                endLineNumber$163 = stx$157.token.lineNumber;
                endLineStart$164 = stx$157.token.lineStart;
                startRange$165 = stx$157.token.range;
                endRange$166 = stx$157.token.range;
            } else {
                startLineNumber$161 = 0;
                startLineStart$162 = 0;
                endLineNumber$163 = 0;
                endLineStart$164 = 0;
                startRange$165 = [
                    0,
                    0
                ];
                endRange$166 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$111({
                type: parser$102.Token.Delimiter,
                value: value$158,
                inner: inner$160,
                startLineStart: startLineStart$162,
                startLineNumber: startLineNumber$161,
                endLineStart: endLineStart$164,
                endLineNumber: endLineNumber$163,
                startRange: startRange$165,
                endRange: endRange$166
            }, stx$157);
        } else {
            var lineStart$167, lineNumber$168, range$169;
            if (stx$157 && stx$157.token.type === parser$102.Token.Delimiter) {
                lineStart$167 = stx$157.token.startLineStart;
                lineNumber$168 = stx$157.token.startLineNumber;
                range$169 = stx$157.token.startRange;
            } else if (stx$157 && stx$157.token) {
                lineStart$167 = stx$157.token.lineStart;
                lineNumber$168 = stx$157.token.lineNumber;
                range$169 = stx$157.token.range;
            } else {
                lineStart$167 = 0;
                lineNumber$168 = 0;
                range$169 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$111({
                type: type$159,
                value: value$158,
                lineStart: lineStart$167,
                lineNumber: lineNumber$168,
                range: range$169
            }, stx$157);
        }
    }
    function makeValue$113(val$170, stx$171) {
        if (typeof val$170 === 'boolean') {
            return mkSyntax$112(stx$171, val$170 ? 'true' : 'false', parser$102.Token.BooleanLiteral);
        } else if (typeof val$170 === 'number') {
            if (val$170 !== val$170) {
                return makeDelim$118('()', [
                    makeValue$113(0, stx$171),
                    makePunc$117('/', stx$171),
                    makeValue$113(0, stx$171)
                ], stx$171);
            }
            if (val$170 < 0) {
                return makeDelim$118('()', [
                    makePunc$117('-', stx$171),
                    makeValue$113(Math.abs(val$170), stx$171)
                ], stx$171);
            } else {
                return mkSyntax$112(stx$171, val$170, parser$102.Token.NumericLiteral);
            }
        } else if (typeof val$170 === 'string') {
            return mkSyntax$112(stx$171, val$170, parser$102.Token.StringLiteral);
        } else if (val$170 === null) {
            return mkSyntax$112(stx$171, 'null', parser$102.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$170);
        }
    }
    function makeRegex$114(val$172, flags$173, stx$174) {
        var newstx$175 = mkSyntax$112(stx$174, new RegExp(val$172, flags$173), parser$102.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$175.token.literal = val$172;
        return newstx$175;
    }
    function makeIdent$115(val$176, stx$177) {
        return mkSyntax$112(stx$177, val$176, parser$102.Token.Identifier);
    }
    function makeKeyword$116(val$178, stx$179) {
        return mkSyntax$112(stx$179, val$178, parser$102.Token.Keyword);
    }
    function makePunc$117(val$180, stx$181) {
        return mkSyntax$112(stx$181, val$180, parser$102.Token.Punctuator);
    }
    function makeDelim$118(val$182, inner$183, stx$184) {
        return mkSyntax$112(stx$184, val$182, parser$102.Token.Delimiter, inner$183);
    }
    function unwrapSyntax$119(stx$185) {
        if (Array.isArray(stx$185) && stx$185.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$185 = stx$185[0];
        }
        if (stx$185.token) {
            if (stx$185.token.type === parser$102.Token.Delimiter) {
                return stx$185.token;
            } else {
                return stx$185.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$185);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$120(stx$186) {
        return _$100.map(stx$186, function (stx$187) {
            if (stx$187.token.inner) {
                stx$187.token.inner = syntaxToTokens$120(stx$187.token.inner);
            }
            return stx$187.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$121(tokens$188) {
        if (!_$100.isArray(tokens$188)) {
            tokens$188 = [tokens$188];
        }
        return _$100.map(tokens$188, function (token$189) {
            if (token$189.inner) {
                token$189.inner = tokensToSyntax$121(token$189.inner);
            }
            return syntaxFromToken$111(token$189);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$122(tojoin$190, punc$191) {
        if (tojoin$190.length === 0) {
            return [];
        }
        if (punc$191 === ' ') {
            return tojoin$190;
        }
        return _$100.reduce(_$100.rest(tojoin$190, 1), function (acc$192, join$193) {
            return acc$192.concat(makePunc$117(punc$191, join$193), join$193);
        }, [_$100.first(tojoin$190)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$123(tojoin$194, punc$195) {
        if (tojoin$194.length === 0) {
            return [];
        }
        if (punc$195 === ' ') {
            return _$100.flatten(tojoin$194, true);
        }
        return _$100.reduce(_$100.rest(tojoin$194, 1), function (acc$196, join$197) {
            return acc$196.concat(makePunc$117(punc$195, _$100.first(join$197)), join$197);
        }, _$100.first(tojoin$194));
    }
    function MacroSyntaxError$124(name$198, message$199, stx$200) {
        this.name = name$198;
        this.message = message$199;
        this.stx = stx$200;
    }
    function throwSyntaxError$125(name$201, message$202, stx$203) {
        if (stx$203 && Array.isArray(stx$203)) {
            stx$203 = stx$203[0];
        }
        throw new MacroSyntaxError$124(name$201, message$202, stx$203);
    }
    function printSyntaxError$126(code$204, err$205) {
        if (!err$205.stx) {
            return '[' + err$205.name + '] ' + err$205.message;
        }
        var token$206 = err$205.stx.token;
        var lineNumber$207 = token$206.startLineNumber || token$206.lineNumber;
        var lineStart$208 = token$206.startLineStart || token$206.lineStart;
        var start$209 = token$206.range[0];
        var offset$210 = start$209 - lineStart$208;
        var line$211 = '';
        var pre$212 = lineNumber$207 + ': ';
        var ch$213;
        while (ch$213 = code$204.charAt(lineStart$208++)) {
            if (ch$213 == '\r' || ch$213 == '\n') {
                break;
            }
            line$211 += ch$213;
        }
        return '[' + err$205.name + '] ' + err$205.message + '\n' + pre$212 + line$211 + '\n' + Array(offset$210 + pre$212.length).join(' ') + ' ^';
    }
    exports$99.unwrapSyntax = unwrapSyntax$119;
    exports$99.makeDelim = makeDelim$118;
    exports$99.makePunc = makePunc$117;
    exports$99.makeKeyword = makeKeyword$116;
    exports$99.makeIdent = makeIdent$115;
    exports$99.makeRegex = makeRegex$114;
    exports$99.makeValue = makeValue$113;
    exports$99.Rename = Rename$103;
    exports$99.Mark = Mark$104;
    exports$99.Var = Var$106;
    exports$99.Def = Def$105;
    exports$99.isDef = isDef$109;
    exports$99.isMark = isMark$108;
    exports$99.isRename = isRename$107;
    exports$99.syntaxFromToken = syntaxFromToken$111;
    exports$99.tokensToSyntax = tokensToSyntax$121;
    exports$99.syntaxToTokens = syntaxToTokens$120;
    exports$99.joinSyntax = joinSyntax$122;
    exports$99.joinSyntaxArr = joinSyntaxArr$123;
    exports$99.MacroSyntaxError = MacroSyntaxError$124;
    exports$99.throwSyntaxError = throwSyntaxError$125;
    exports$99.printSyntaxError = printSyntaxError$126;
}));