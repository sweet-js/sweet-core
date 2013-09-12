(function (root$93, factory$94) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$94(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$94);
    }
}(this, function (exports$95, _$96, es6$97, parser$98) {
    // (CSyntax, Str) -> CContext
    function Rename$99(id$118, name$119, ctx$120, defctx$121) {
        defctx$121 = defctx$121 || null;
        return {
            id: id$118,
            name: name$119,
            context: ctx$120,
            def: defctx$121
        };
    }
    // (Num) -> CContext
    function Mark$100(mark$122, ctx$123) {
        return {
            mark: mark$122,
            context: ctx$123
        };
    }
    function Def$101(defctx$124, ctx$125) {
        return {
            defctx: defctx$124,
            context: ctx$125
        };
    }
    function Var$102(id$126) {
        return { id: id$126 };
    }
    var isRename$103 = function (r$127) {
        return r$127 && typeof r$127.id !== 'undefined' && typeof r$127.name !== 'undefined';
    };
    var isMark$104 = function isMark$104(m$128) {
        return m$128 && typeof m$128.mark !== 'undefined';
    };
    function isDef$105(ctx$129) {
        return ctx$129 && typeof ctx$129.defctx !== 'undefined';
    }
    var templateMap$106 = new Map();
    // (CToken, CContext?) -> CSyntax
    function syntaxFromToken$107(token$130, oldctx$131) {
        // if given old syntax object steal its context otherwise create one fresh
        var ctx$132 = typeof oldctx$131 !== 'undefined' ? oldctx$131 : null;
        return Object.create({
            mark: function mark$133(newMark$134) {
                if (this.token.inner) {
                    var next$135 = syntaxFromToken$107(this.token, this.context);
                    next$135.deferredContext = Mark$100(newMark$134, this.deferredContext);
                    return next$135;
                }
                return syntaxFromToken$107(this.token, Mark$100(newMark$134, this.context));
            },
            rename: function (id$136, name$137) {
                // deferr renaming of delimiters
                if (this.token.inner) {
                    var next$138 = syntaxFromToken$107(this.token, this.context);
                    next$138.deferredContext = Rename$99(id$136, name$137, this.deferredContext);
                    return next$138;
                }
                if (this.token.type === parser$98.Token.Identifier || this.token.type === parser$98.Token.Keyword) {
                    return syntaxFromToken$107(this.token, Rename$99(id$136, name$137, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$139) {
                if (this.token.inner) {
                    var next$140 = syntaxFromToken$107(this.token, this.context);
                    next$140.deferredContext = Def$101(defctx$139, this.deferredContext);
                    return next$140;
                }
                return syntaxFromToken$107(this.token, Def$101(defctx$139, this.context));
            },
            getDefCtx: function () {
                var ctx$141 = this.context;
                while (ctx$141 !== null) {
                    if (isDef$105(ctx$141)) {
                        return ctx$141.defctx;
                    }
                    ctx$141 = ctx$141.context;
                }
                return null;
            },
            expose: function () {
                parser$98.assert(this.token.type === parser$98.Token.Delimiter, 'Only delimiters can be exposed');
                function applyContext$142(stxCtx$143, ctx$144) {
                    if (ctx$144 == null) {
                        return stxCtx$143;
                    } else if (isRename$103(ctx$144)) {
                        return Rename$99(ctx$144.id, ctx$144.name, applyContext$142(stxCtx$143, ctx$144.context));
                    } else if (isMark$104(ctx$144)) {
                        return Mark$100(ctx$144.mark, applyContext$142(stxCtx$143, ctx$144.context));
                    } else if (isDef$105(ctx$144)) {
                        return Def$101(ctx$144.defctx, applyContext$142(stxCtx$143, ctx$144.context));
                    } else {
                        parser$98.assert(false, 'unknown context type');
                    }
                }
                this.token.inner = _$96.map(this.token.inner, _$96.bind(function (stx$145) {
                    if (stx$145.token.inner) {
                        var next$146 = syntaxFromToken$107(stx$145.token, stx$145.context);
                        next$146.deferredContext = applyContext$142(stx$145.deferredContext, this.deferredContext);
                        return next$146;
                    } else {
                        return syntaxFromToken$107(stx$145.token, applyContext$142(stx$145.context, this.deferredContext));
                    }
                }, this));
                this.deferredContext = null;
                return this;
            },
            toString: function () {
                var val$147 = this.token.type === parser$98.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$147 + ']';
            }
        }, {
            token: {
                value: token$130,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$132,
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
    function mkSyntax$108(value$148, type$149, stx$150) {
        var ctx$151, lineStart$152, lineNumber$153, range$154;
        if (stx$150 && Array.isArray(stx$150) && stx$150.length === 1) {
            stx$150 = stx$150[0];
        } else if (stx$150 && Array.isArray(stx$150)) {
            throw new Error('Expecting a syntax object, not: ' + stx$150);
        }
        if (stx$150 && stx$150.token) {
            ctx$151 = stx$150.context;
            lineStart$152 = stx$150.token.lineStart;
            lineNumber$153 = stx$150.token.lineNumber;
            range$154 = stx$150.token.range;
        } else if (stx$150 == null) {
            ctx$151 = null;
        } else {
            throw new Error('Expecting a syntax object, not: ' + stx$150);
        }
        return syntaxFromToken$107({
            type: type$149,
            value: value$148,
            lineStart: lineStart$152,
            lineNumber: lineNumber$153,
            range: range$154
        }, ctx$151);
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$109(stx$155) {
        return _$96.map(stx$155, function (stx$156) {
            if (stx$156.token.inner) {
                stx$156.token.inner = syntaxToTokens$109(stx$156.token.inner);
            }
            return stx$156.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$110(tokens$157) {
        if (!_$96.isArray(tokens$157)) {
            tokens$157 = [tokens$157];
        }
        return _$96.map(tokens$157, function (token$158) {
            if (token$158.inner) {
                token$158.inner = tokensToSyntax$110(token$158.inner);
            }
            return syntaxFromToken$107(token$158);
        });
    }
    function makeValue$111(val$159, stx$160) {
        if (typeof val$159 === 'boolean') {
            return mkSyntax$108(val$159 ? 'true' : 'false', parser$98.Token.BooleanLiteral, stx$160);
        } else if (typeof val$159 === 'number') {
            return mkSyntax$108(val$159, parser$98.Token.NumericLiteral, stx$160);
        } else if (typeof val$159 === 'string') {
            return mkSyntax$108(val$159, parser$98.Token.StringLiteral, stx$160);
        } else if (val$159 === null) {
            return mkSyntax$108('null', parser$98.Token.NullLiteral, stx$160);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$159);
        }
    }
    function makeRegex$112(val$161, flags$162, stx$163) {
        var ctx$164, lineStart$165, lineNumber$166, range$167;
        if (stx$163 && stx$163.token) {
            ctx$164 = stx$163.context;
            lineStart$165 = stx$163.token.lineStart;
            lineNumber$166 = stx$163.token.lineNumber;
            range$167 = stx$163.token.range;
        } else {
            ctx$164 = null;
        }
        return syntaxFromToken$107({
            type: parser$98.Token.RegexLiteral,
            literal: val$161,
            value: new RegExp(val$161, flags$162),
            lineStart: lineStart$165,
            lineNumber: lineNumber$166,
            range: range$167
        }, ctx$164);
    }
    function makeIdent$113(val$168, stx$169) {
        return mkSyntax$108(val$168, parser$98.Token.Identifier, stx$169);
    }
    function makeKeyword$114(val$170, stx$171) {
        return mkSyntax$108(val$170, parser$98.Token.Keyword, stx$171);
    }
    function makePunc$115(val$172, stx$173) {
        return mkSyntax$108(val$172, parser$98.Token.Punctuator, stx$173);
    }
    function makeDelim$116(val$174, inner$175, stx$176) {
        var ctx$177, startLineNumber$178, startLineStart$179, endLineNumber$180, endLineStart$181, startRange$182, endRange$183;
        if (stx$176 && stx$176.token.type === parser$98.Token.Delimiter) {
            ctx$177 = stx$176.context;
            startLineNumber$178 = stx$176.token.startLineNumber;
            startLineStart$179 = stx$176.token.startLineStart;
            endLineNumber$180 = stx$176.token.endLineNumber;
            endLineStart$181 = stx$176.token.endLineStart;
            startRange$182 = stx$176.token.startRange;
            endRange$183 = stx$176.token.endRange;
        } else if (stx$176 && stx$176.token) {
            ctx$177 = stx$176.context;
            startLineNumber$178 = stx$176.token.lineNumber;
            startLineStart$179 = stx$176.token.lineStart;
            endLineNumber$180 = stx$176.token.lineNumber;
            endLineStart$181 = stx$176.token.lineStart;
            startRange$182 = stx$176.token.range;
            endRange$183 = stx$176.token.range;
        } else {
            ctx$177 = null;
        }
        return syntaxFromToken$107({
            type: parser$98.Token.Delimiter,
            value: val$174,
            inner: inner$175,
            startLineStart: startLineStart$179,
            startLineNumber: startLineNumber$178,
            endLineStart: endLineStart$181,
            endLineNumber: endLineNumber$180,
            startRange: startRange$182,
            endRange: endRange$183
        }, ctx$177);
    }
    function unwrapSyntax$117(stx$184) {
        if (stx$184.token) {
            if (stx$184.token.type === parser$98.Token.Delimiter) {
                return stx$184.token;
            } else {
                return stx$184.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$184);
        }
    }
    exports$95.unwrapSyntax = unwrapSyntax$117;
    exports$95.makeDelim = makeDelim$116;
    exports$95.makePunc = makePunc$115;
    exports$95.makeKeyword = makeKeyword$114;
    exports$95.makeIdent = makeIdent$113;
    exports$95.makeRegex = makeRegex$112;
    exports$95.makeValue = makeValue$111;
    exports$95.Rename = Rename$99;
    exports$95.Mark = Mark$100;
    exports$95.Var = Var$102;
    exports$95.Def = Def$101;
    exports$95.isDef = isDef$105;
    exports$95.isMark = isMark$104;
    exports$95.isRename = isRename$103;
    exports$95.syntaxFromToken = syntaxFromToken$107;
    exports$95.mkSyntax = mkSyntax$108;
    exports$95.tokensToSyntax = tokensToSyntax$110;
    exports$95.syntaxToTokens = syntaxToTokens$109;
}));