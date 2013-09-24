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
    function Rename$103(id$122, name$123, ctx$124, defctx$125) {
        defctx$125 = defctx$125 || null;
        return {
            id: id$122,
            name: name$123,
            context: ctx$124,
            def: defctx$125
        };
    }
    // (Num) -> CContext
    function Mark$104(mark$126, ctx$127) {
        return {
            mark: mark$126,
            context: ctx$127
        };
    }
    function Def$105(defctx$128, ctx$129) {
        return {
            defctx: defctx$128,
            context: ctx$129
        };
    }
    function Var$106(id$130) {
        return { id: id$130 };
    }
    var isRename$107 = function (r$131) {
        return r$131 && typeof r$131.id !== 'undefined' && typeof r$131.name !== 'undefined';
    };
    var isMark$108 = function isMark$108(m$132) {
        return m$132 && typeof m$132.mark !== 'undefined';
    };
    function isDef$109(ctx$133) {
        return ctx$133 && typeof ctx$133.defctx !== 'undefined';
    }
    var templateMap$110 = new Map();
    // (CToken, CContext?) -> CSyntax
    function syntaxFromToken$111(token$134, oldctx$135) {
        // if given old syntax object steal its context otherwise create one fresh
        var ctx$136 = typeof oldctx$135 !== 'undefined' ? oldctx$135 : null;
        return Object.create({
            mark: function mark$137(newMark$138) {
                if (this.token.inner) {
                    var next$139 = syntaxFromToken$111(this.token, this.context);
                    next$139.deferredContext = Mark$104(newMark$138, this.deferredContext);
                    return next$139;
                }
                return syntaxFromToken$111(this.token, Mark$104(newMark$138, this.context));
            },
            rename: function (id$140, name$141) {
                // deferr renaming of delimiters
                if (this.token.inner) {
                    var next$142 = syntaxFromToken$111(this.token, this.context);
                    next$142.deferredContext = Rename$103(id$140, name$141, this.deferredContext);
                    return next$142;
                }
                if (this.token.type === parser$102.Token.Identifier || this.token.type === parser$102.Token.Keyword) {
                    return syntaxFromToken$111(this.token, Rename$103(id$140, name$141, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$143) {
                if (this.token.inner) {
                    var next$144 = syntaxFromToken$111(this.token, this.context);
                    next$144.deferredContext = Def$105(defctx$143, this.deferredContext);
                    return next$144;
                }
                return syntaxFromToken$111(this.token, Def$105(defctx$143, this.context));
            },
            getDefCtx: function () {
                var ctx$145 = this.context;
                while (ctx$145 !== null) {
                    if (isDef$109(ctx$145)) {
                        return ctx$145.defctx;
                    }
                    ctx$145 = ctx$145.context;
                }
                return null;
            },
            expose: function () {
                parser$102.assert(this.token.type === parser$102.Token.Delimiter, 'Only delimiters can be exposed');
                function applyContext$146(stxCtx$147, ctx$148) {
                    if (ctx$148 == null) {
                        return stxCtx$147;
                    } else if (isRename$107(ctx$148)) {
                        return Rename$103(ctx$148.id, ctx$148.name, applyContext$146(stxCtx$147, ctx$148.context));
                    } else if (isMark$108(ctx$148)) {
                        return Mark$104(ctx$148.mark, applyContext$146(stxCtx$147, ctx$148.context));
                    } else if (isDef$109(ctx$148)) {
                        return Def$105(ctx$148.defctx, applyContext$146(stxCtx$147, ctx$148.context));
                    } else {
                        parser$102.assert(false, 'unknown context type');
                    }
                }
                this.token.inner = _$100.map(this.token.inner, _$100.bind(function (stx$149) {
                    if (stx$149.token.inner) {
                        var next$150 = syntaxFromToken$111(stx$149.token, stx$149.context);
                        next$150.deferredContext = applyContext$146(stx$149.deferredContext, this.deferredContext);
                        return next$150;
                    } else {
                        return syntaxFromToken$111(stx$149.token, applyContext$146(stx$149.context, this.deferredContext));
                    }
                }, this));
                this.deferredContext = null;
                return this;
            },
            toString: function () {
                var val$151 = this.token.type === parser$102.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$151 + ']';
            }
        }, {
            token: {
                value: token$134,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$136,
                writable: true,
                enumerable: true,
                configurable: true
            },
            deferredContext: {
                value: null,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
    }
    function mkSyntax$112(value$152, type$153, stx$154) {
        var ctx$155, lineStart$156, lineNumber$157, range$158;
        if (stx$154 && Array.isArray(stx$154) && stx$154.length === 1) {
            stx$154 = stx$154[0];
        } else if (stx$154 && Array.isArray(stx$154)) {
            throw new Error('Expecting a syntax object, not: ' + stx$154);
        }
        if (stx$154 && stx$154.token) {
            ctx$155 = stx$154.context;
            lineStart$156 = stx$154.token.lineStart;
            lineNumber$157 = stx$154.token.lineNumber;
            range$158 = stx$154.token.range;
        } else if (stx$154 == null) {
            ctx$155 = null;
            lineStart$156 = 0;
            lineNumber$157 = 0;
            range$158 = [
                0,
                0
            ];
        } else {
            throw new Error('Expecting a syntax object, not: ' + stx$154);
        }
        return syntaxFromToken$111({
            type: type$153,
            value: value$152,
            lineStart: lineStart$156,
            lineNumber: lineNumber$157,
            range: range$158
        }, ctx$155);
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$113(stx$159) {
        return _$100.map(stx$159, function (stx$160) {
            if (stx$160.token.inner) {
                stx$160.token.inner = syntaxToTokens$113(stx$160.token.inner);
            }
            return stx$160.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$114(tokens$161) {
        if (!_$100.isArray(tokens$161)) {
            tokens$161 = [tokens$161];
        }
        return _$100.map(tokens$161, function (token$162) {
            if (token$162.inner) {
                token$162.inner = tokensToSyntax$114(token$162.inner);
            }
            return syntaxFromToken$111(token$162);
        });
    }
    function makeValue$115(val$163, stx$164) {
        if (typeof val$163 === 'boolean') {
            return mkSyntax$112(val$163 ? 'true' : 'false', parser$102.Token.BooleanLiteral, stx$164);
        } else if (typeof val$163 === 'number') {
            return mkSyntax$112(val$163, parser$102.Token.NumericLiteral, stx$164);
        } else if (typeof val$163 === 'string') {
            return mkSyntax$112(val$163, parser$102.Token.StringLiteral, stx$164);
        } else if (val$163 === null) {
            return mkSyntax$112('null', parser$102.Token.NullLiteral, stx$164);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$163);
        }
    }
    function makeRegex$116(val$165, flags$166, stx$167) {
        var ctx$168, lineStart$169, lineNumber$170, range$171;
        if (stx$167 && stx$167.token) {
            ctx$168 = stx$167.context;
            lineStart$169 = stx$167.token.lineStart;
            lineNumber$170 = stx$167.token.lineNumber;
            range$171 = stx$167.token.range;
        } else {
            ctx$168 = null;
        }
        return syntaxFromToken$111({
            type: parser$102.Token.RegexLiteral,
            literal: val$165,
            value: new RegExp(val$165, flags$166),
            lineStart: lineStart$169,
            lineNumber: lineNumber$170,
            range: range$171
        }, ctx$168);
    }
    function makeIdent$117(val$172, stx$173) {
        return mkSyntax$112(val$172, parser$102.Token.Identifier, stx$173);
    }
    function makeKeyword$118(val$174, stx$175) {
        return mkSyntax$112(val$174, parser$102.Token.Keyword, stx$175);
    }
    function makePunc$119(val$176, stx$177) {
        return mkSyntax$112(val$176, parser$102.Token.Punctuator, stx$177);
    }
    function makeDelim$120(val$178, inner$179, stx$180) {
        var ctx$181, startLineNumber$182, startLineStart$183, endLineNumber$184, endLineStart$185, startRange$186, endRange$187;
        if (stx$180 && Array.isArray(stx$180) && stx$180.length === 1) {
            stx$180 = stx$180[0];
        } else if (stx$180 && Array.isArray(stx$180)) {
            throw new Error('Expecting a syntax object, not: ' + stx$180);
        }
        if (stx$180 && stx$180.token.type === parser$102.Token.Delimiter) {
            ctx$181 = stx$180.context;
            startLineNumber$182 = stx$180.token.startLineNumber;
            startLineStart$183 = stx$180.token.startLineStart;
            endLineNumber$184 = stx$180.token.endLineNumber;
            endLineStart$185 = stx$180.token.endLineStart;
            startRange$186 = stx$180.token.startRange;
            endRange$187 = stx$180.token.endRange;
        } else if (stx$180 && stx$180.token) {
            ctx$181 = stx$180.context;
            startLineNumber$182 = stx$180.token.lineNumber;
            startLineStart$183 = stx$180.token.lineStart;
            endLineNumber$184 = stx$180.token.lineNumber;
            endLineStart$185 = stx$180.token.lineStart;
            startRange$186 = stx$180.token.range;
            endRange$187 = stx$180.token.range;
        } else {
            ctx$181 = null;
            startLineNumber$182 = 0;
            startLineStart$183 = 0;
            endLineNumber$184 = 0;
            endLineStart$185 = 0;
            startRange$186 = [
                0,
                0
            ];
            endRange$187 = [
                0,
                0
            ];
        }
        return syntaxFromToken$111({
            type: parser$102.Token.Delimiter,
            value: val$178,
            inner: inner$179,
            startLineStart: startLineStart$183,
            startLineNumber: startLineNumber$182,
            endLineStart: endLineStart$185,
            endLineNumber: endLineNumber$184,
            startRange: startRange$186,
            endRange: endRange$187
        }, ctx$181);
    }
    function unwrapSyntax$121(stx$188) {
        if (stx$188.token) {
            if (stx$188.token.type === parser$102.Token.Delimiter) {
                return stx$188.token;
            } else {
                return stx$188.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$188);
        }
    }
    exports$99.unwrapSyntax = unwrapSyntax$121;
    exports$99.makeDelim = makeDelim$120;
    exports$99.makePunc = makePunc$119;
    exports$99.makeKeyword = makeKeyword$118;
    exports$99.makeIdent = makeIdent$117;
    exports$99.makeRegex = makeRegex$116;
    exports$99.makeValue = makeValue$115;
    exports$99.Rename = Rename$103;
    exports$99.Mark = Mark$104;
    exports$99.Var = Var$106;
    exports$99.Def = Def$105;
    exports$99.isDef = isDef$109;
    exports$99.isMark = isMark$108;
    exports$99.isRename = isRename$107;
    exports$99.syntaxFromToken = syntaxFromToken$111;
    exports$99.mkSyntax = mkSyntax$112;
    exports$99.tokensToSyntax = tokensToSyntax$114;
    exports$99.syntaxToTokens = syntaxToTokens$113;
}));