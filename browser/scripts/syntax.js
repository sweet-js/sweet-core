(function (root$91, factory$92) {
    if (typeof exports === 'object') {
        factory$92(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$92);
    }
}(this, function (exports$93, _$94, es6$95, parser$96) {
    function Rename$97(id$116, name$117, ctx$118, defctx$119) {
        defctx$119 = defctx$119 || null;
        return {
            id: id$116,
            name: name$117,
            context: ctx$118,
            def: defctx$119
        };
    }
    function Mark$98(mark$120, ctx$121) {
        return {
            mark: mark$120,
            context: ctx$121
        };
    }
    function Def$99(defctx$122, ctx$123) {
        return {
            defctx: defctx$122,
            context: ctx$123
        };
    }
    function Var$100(id$124) {
        return { id: id$124 };
    }
    var isRename$101 = function (r$125) {
        return r$125 && typeof r$125.id !== 'undefined' && typeof r$125.name !== 'undefined';
    };
    var isMark$102 = function isMark$102(m$126) {
        return m$126 && typeof m$126.mark !== 'undefined';
    };
    function isDef$103(ctx$127) {
        return ctx$127 && typeof ctx$127.defctx !== 'undefined';
    }
    var templateMap$104 = new Map();
    function syntaxFromToken$105(token$128, oldctx$129) {
        var ctx$130 = typeof oldctx$129 !== 'undefined' ? oldctx$129 : null;
        return Object.create({
            mark: function mark$131(newMark$132) {
                if (this.token.inner) {
                    var next$133 = syntaxFromToken$105(this.token, this.context);
                    next$133.deferredContext = Mark$98(newMark$132, this.deferredContext);
                    return next$133;
                }
                return syntaxFromToken$105(this.token, Mark$98(newMark$132, this.context));
            },
            rename: function (id$134, name$135) {
                if (this.token.inner) {
                    var next$136 = syntaxFromToken$105(this.token, this.context);
                    next$136.deferredContext = Rename$97(id$134, name$135, this.deferredContext);
                    return next$136;
                }
                if (this.token.type === parser$96.Token.Identifier || this.token.type === parser$96.Token.Keyword) {
                    return syntaxFromToken$105(this.token, Rename$97(id$134, name$135, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$137) {
                if (this.token.inner) {
                    var next$138 = syntaxFromToken$105(this.token, this.context);
                    next$138.deferredContext = Def$99(defctx$137, this.deferredContext);
                    return next$138;
                }
                return syntaxFromToken$105(this.token, Def$99(defctx$137, this.context));
            },
            getDefCtx: function () {
                var ctx$139 = this.context;
                while (ctx$139 !== null) {
                    if (isDef$103(ctx$139)) {
                        return ctx$139.defctx;
                    }
                    ctx$139 = ctx$139.context;
                }
                return null;
            },
            expose: function () {
                parser$96.assert(this.token.type === parser$96.Token.Delimiter, 'Only delimiters can be exposed');
                function applyContext$140(stxCtx$141, ctx$142) {
                    if (ctx$142 == null) {
                        return stxCtx$141;
                    } else if (isRename$101(ctx$142)) {
                        return Rename$97(ctx$142.id, ctx$142.name, applyContext$140(stxCtx$141, ctx$142.context));
                    } else if (isMark$102(ctx$142)) {
                        return Mark$98(ctx$142.mark, applyContext$140(stxCtx$141, ctx$142.context));
                    } else if (isDef$103(ctx$142)) {
                        return Def$99(ctx$142.defctx, applyContext$140(stxCtx$141, ctx$142.context));
                    } else {
                        parser$96.assert(false, 'unknown context type');
                    }
                }
                this.token.inner = _$94.map(this.token.inner, _$94.bind(function (stx$143) {
                    if (stx$143.token.inner) {
                        var next$144 = syntaxFromToken$105(stx$143.token, stx$143.context);
                        next$144.deferredContext = applyContext$140(stx$143.deferredContext, this.deferredContext);
                        return next$144;
                    } else {
                        return syntaxFromToken$105(stx$143.token, applyContext$140(stx$143.context, this.deferredContext));
                    }
                }, this));
                this.deferredContext = null;
                return this;
            },
            toString: function () {
                var val$145 = this.token.type === parser$96.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$145 + ']';
            }
        }, {
            token: {
                value: token$128,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$130,
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
    function mkSyntax$106(value$146, type$147, stx$148) {
        var ctx$149, lineStart$150, lineNumber$151, range$152;
        if (stx$148 && Array.isArray(stx$148) && stx$148.length === 1) {
            stx$148 = stx$148[0];
        } else if (stx$148 && Array.isArray(stx$148)) {
            throw new Error('Expecting a syntax object, not: ' + stx$148);
        }
        if (stx$148 && stx$148.token) {
            ctx$149 = stx$148.context;
            lineStart$150 = stx$148.token.lineStart;
            lineNumber$151 = stx$148.token.lineNumber;
            range$152 = stx$148.token.range;
        } else if (stx$148 == null) {
            ctx$149 = null;
        } else {
            throw new Error('Expecting a syntax object, not: ' + stx$148);
        }
        return syntaxFromToken$105({
            type: type$147,
            value: value$146,
            lineStart: lineStart$150,
            lineNumber: lineNumber$151,
            range: range$152
        }, ctx$149);
    }
    function syntaxToTokens$107(stx$153) {
        return _$94.map(stx$153, function (stx$154) {
            if (stx$154.token.inner) {
                stx$154.token.inner = syntaxToTokens$107(stx$154.token.inner);
            }
            return stx$154.token;
        });
    }
    function tokensToSyntax$108(tokens$155) {
        if (!_$94.isArray(tokens$155)) {
            tokens$155 = [tokens$155];
        }
        return _$94.map(tokens$155, function (token$156) {
            if (token$156.inner) {
                token$156.inner = tokensToSyntax$108(token$156.inner);
            }
            return syntaxFromToken$105(token$156);
        });
    }
    function makeValue$109(val$157, stx$158) {
        if (typeof val$157 === 'boolean') {
            return mkSyntax$106(val$157 ? 'true' : 'false', parser$96.Token.BooleanLiteral, stx$158);
        } else if (typeof val$157 === 'number') {
            return mkSyntax$106(val$157, parser$96.Token.NumericLiteral, stx$158);
        } else if (typeof val$157 === 'string') {
            return mkSyntax$106(val$157, parser$96.Token.StringLiteral, stx$158);
        } else if (val$157 === null) {
            return mkSyntax$106('null', parser$96.Token.NullLiteral, stx$158);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$157);
        }
    }
    function makeRegex$110(val$159, flags$160, stx$161) {
        var ctx$162, lineStart$163, lineNumber$164, range$165;
        if (stx$161 && stx$161.token) {
            ctx$162 = stx$161.context;
            lineStart$163 = stx$161.token.lineStart;
            lineNumber$164 = stx$161.token.lineNumber;
            range$165 = stx$161.token.range;
        } else {
            ctx$162 = null;
        }
        return syntaxFromToken$105({
            type: parser$96.Token.RegexLiteral,
            literal: val$159,
            value: new RegExp(val$159, flags$160),
            lineStart: lineStart$163,
            lineNumber: lineNumber$164,
            range: range$165
        }, ctx$162);
    }
    function makeIdent$111(val$166, stx$167) {
        return mkSyntax$106(val$166, parser$96.Token.Identifier, stx$167);
    }
    function makeKeyword$112(val$168, stx$169) {
        return mkSyntax$106(val$168, parser$96.Token.Keyword, stx$169);
    }
    function makePunc$113(val$170, stx$171) {
        return mkSyntax$106(val$170, parser$96.Token.Punctuator, stx$171);
    }
    function makeDelim$114(val$172, inner$173, stx$174) {
        var ctx$175, startLineNumber$176, startLineStart$177, endLineNumber$178, endLineStart$179, startRange$180, endRange$181;
        if (stx$174 && stx$174.token.type === parser$96.Token.Delimiter) {
            ctx$175 = stx$174.context;
            startLineNumber$176 = stx$174.token.startLineNumber;
            startLineStart$177 = stx$174.token.startLineStart;
            endLineNumber$178 = stx$174.token.endLineNumber;
            endLineStart$179 = stx$174.token.endLineStart;
            startRange$180 = stx$174.token.startRange;
            endRange$181 = stx$174.token.endRange;
        } else if (stx$174 && stx$174.token) {
            ctx$175 = stx$174.context;
            startLineNumber$176 = stx$174.token.lineNumber;
            startLineStart$177 = stx$174.token.lineStart;
            endLineNumber$178 = stx$174.token.lineNumber;
            endLineStart$179 = stx$174.token.lineStart;
            startRange$180 = stx$174.token.range;
            endRange$181 = stx$174.token.range;
        } else {
            ctx$175 = null;
        }
        return syntaxFromToken$105({
            type: parser$96.Token.Delimiter,
            value: val$172,
            inner: inner$173,
            startLineStart: startLineStart$177,
            startLineNumber: startLineNumber$176,
            endLineStart: endLineStart$179,
            endLineNumber: endLineNumber$178,
            startRange: startRange$180,
            endRange: endRange$181
        }, ctx$175);
    }
    function unwrapSyntax$115(stx$182) {
        if (stx$182.token) {
            if (stx$182.token.type === parser$96.Token.Delimiter) {
                return stx$182.token;
            } else {
                return stx$182.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$182);
        }
    }
    exports$93.unwrapSyntax = unwrapSyntax$115;
    exports$93.makeDelim = makeDelim$114;
    exports$93.makePunc = makePunc$113;
    exports$93.makeKeyword = makeKeyword$112;
    exports$93.makeIdent = makeIdent$111;
    exports$93.makeRegex = makeRegex$110;
    exports$93.makeValue = makeValue$109;
    exports$93.Rename = Rename$97;
    exports$93.Mark = Mark$98;
    exports$93.Var = Var$100;
    exports$93.Def = Def$99;
    exports$93.isDef = isDef$103;
    exports$93.isMark = isMark$102;
    exports$93.isRename = isRename$101;
    exports$93.syntaxFromToken = syntaxFromToken$105;
    exports$93.mkSyntax = mkSyntax$106;
    exports$93.tokensToSyntax = tokensToSyntax$108;
    exports$93.syntaxToTokens = syntaxToTokens$107;
}));