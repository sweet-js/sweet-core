(function (root$90, factory$91) {
    if (typeof exports === 'object') {
        factory$91(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$91);
    }
}(this, function (exports$92, _$93, es6$94, parser$95) {
    function Rename$96(id$115, name$116, ctx$117, defctx$118) {
        defctx$118 = defctx$118 || null;
        return {
            id: id$115,
            name: name$116,
            context: ctx$117,
            def: defctx$118
        };
    }
    function Mark$97(mark$119, ctx$120) {
        return {
            mark: mark$119,
            context: ctx$120
        };
    }
    function Def$98(defctx$121, ctx$122) {
        return {
            defctx: defctx$121,
            context: ctx$122
        };
    }
    function Var$99(id$123) {
        return { id: id$123 };
    }
    var isRename$100 = function (r$124) {
        return r$124 && typeof r$124.id !== 'undefined' && typeof r$124.name !== 'undefined';
    };
    var isMark$101 = function isMark$101(m$125) {
        return m$125 && typeof m$125.mark !== 'undefined';
    };
    function isDef$102(ctx$126) {
        return ctx$126 && typeof ctx$126.defctx !== 'undefined';
    }
    var templateMap$103 = new Map();
    function syntaxFromToken$104(token$127, oldctx$128) {
        var ctx$129 = typeof oldctx$128 !== 'undefined' ? oldctx$128 : null;
        return Object.create({
            mark: function mark$130(newMark$131) {
                if (this.token.inner) {
                    var next$132 = syntaxFromToken$104(this.token, this.context);
                    next$132.deferredContext = Mark$97(newMark$131, this.deferredContext);
                    return next$132;
                }
                return syntaxFromToken$104(this.token, Mark$97(newMark$131, this.context));
            },
            rename: function (id$133, name$134) {
                if (this.token.inner) {
                    var next$135 = syntaxFromToken$104(this.token, this.context);
                    next$135.deferredContext = Rename$96(id$133, name$134, this.deferredContext);
                    return next$135;
                }
                if (this.token.type === parser$95.Token.Identifier || this.token.type === parser$95.Token.Keyword) {
                    return syntaxFromToken$104(this.token, Rename$96(id$133, name$134, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$136) {
                if (this.token.inner) {
                    var next$137 = syntaxFromToken$104(this.token, this.context);
                    next$137.deferredContext = Def$98(defctx$136, this.deferredContext);
                    return next$137;
                }
                return syntaxFromToken$104(this.token, Def$98(defctx$136, this.context));
            },
            getDefCtx: function () {
                var ctx$138 = this.context;
                while (ctx$138 !== null) {
                    if (isDef$102(ctx$138)) {
                        return ctx$138.defctx;
                    }
                    ctx$138 = ctx$138.context;
                }
                return null;
            },
            expose: function () {
                parser$95.assert(this.token.type === parser$95.Token.Delimiter, 'Only delimiters can be exposed');
                function applyContext$139(stxCtx$140, ctx$141) {
                    if (ctx$141 == null) {
                        return stxCtx$140;
                    } else if (isRename$100(ctx$141)) {
                        return Rename$96(ctx$141.id, ctx$141.name, applyContext$139(stxCtx$140, ctx$141.context));
                    } else if (isMark$101(ctx$141)) {
                        return Mark$97(ctx$141.mark, applyContext$139(stxCtx$140, ctx$141.context));
                    } else if (isDef$102(ctx$141)) {
                        return Def$98(ctx$141.defctx, applyContext$139(stxCtx$140, ctx$141.context));
                    } else {
                        parser$95.assert(false, 'unknown context type');
                    }
                }
                this.token.inner = _$93.map(this.token.inner, _$93.bind(function (stx$142) {
                    if (stx$142.token.inner) {
                        var next$143 = syntaxFromToken$104(stx$142.token, stx$142.context);
                        next$143.deferredContext = applyContext$139(stx$142.deferredContext, this.deferredContext);
                        return next$143;
                    } else {
                        return syntaxFromToken$104(stx$142.token, applyContext$139(stx$142.context, this.deferredContext));
                    }
                }, this));
                this.deferredContext = null;
                return this;
            },
            toString: function () {
                var val$144 = this.token.type === parser$95.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$144 + ']';
            }
        }, {
            token: {
                value: token$127,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$129,
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
    function mkSyntax$105(value$145, type$146, stx$147) {
        var ctx$148, lineStart$149, lineNumber$150, range$151;
        if (stx$147 && Array.isArray(stx$147) && stx$147.length === 1) {
            stx$147 = stx$147[0];
        } else if (stx$147 && Array.isArray(stx$147)) {
            throw new Error('Expecting a syntax object, not: ' + stx$147);
        }
        if (stx$147 && stx$147.token) {
            ctx$148 = stx$147.context;
            lineStart$149 = stx$147.token.lineStart;
            lineNumber$150 = stx$147.token.lineNumber;
            range$151 = stx$147.token.range;
        } else if (stx$147 == null) {
            ctx$148 = null;
        } else {
            throw new Error('Expecting a syntax object, not: ' + stx$147);
        }
        return syntaxFromToken$104({
            type: type$146,
            value: value$145,
            lineStart: lineStart$149,
            lineNumber: lineNumber$150,
            range: range$151
        }, ctx$148);
    }
    function syntaxToTokens$106(stx$152) {
        return _$93.map(stx$152, function (stx$153) {
            if (stx$153.token.inner) {
                stx$153.token.inner = syntaxToTokens$106(stx$153.token.inner);
            }
            return stx$153.token;
        });
    }
    function tokensToSyntax$107(tokens$154) {
        if (!_$93.isArray(tokens$154)) {
            tokens$154 = [tokens$154];
        }
        return _$93.map(tokens$154, function (token$155) {
            if (token$155.inner) {
                token$155.inner = tokensToSyntax$107(token$155.inner);
            }
            return syntaxFromToken$104(token$155);
        });
    }
    function makeValue$108(val$156, stx$157) {
        if (typeof val$156 === 'boolean') {
            return mkSyntax$105(val$156 ? 'true' : 'false', parser$95.Token.BooleanLiteral, stx$157);
        } else if (typeof val$156 === 'number') {
            return mkSyntax$105(val$156, parser$95.Token.NumericLiteral, stx$157);
        } else if (typeof val$156 === 'string') {
            return mkSyntax$105(val$156, parser$95.Token.StringLiteral, stx$157);
        } else if (val$156 === null) {
            return mkSyntax$105('null', parser$95.Token.NullLiteral, stx$157);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$156);
        }
    }
    function makeRegex$109(val$158, flags$159, stx$160) {
        var ctx$161, lineStart$162, lineNumber$163, range$164;
        if (stx$160 && stx$160.token) {
            ctx$161 = stx$160.context;
            lineStart$162 = stx$160.token.lineStart;
            lineNumber$163 = stx$160.token.lineNumber;
            range$164 = stx$160.token.range;
        } else {
            ctx$161 = null;
        }
        return syntaxFromToken$104({
            type: parser$95.Token.RegexLiteral,
            literal: val$158,
            value: new RegExp(val$158, flags$159),
            lineStart: lineStart$162,
            lineNumber: lineNumber$163,
            range: range$164
        }, ctx$161);
    }
    function makeIdent$110(val$165, stx$166) {
        return mkSyntax$105(val$165, parser$95.Token.Identifier, stx$166);
    }
    function makeKeyword$111(val$167, stx$168) {
        return mkSyntax$105(val$167, parser$95.Token.Keyword, stx$168);
    }
    function makePunc$112(val$169, stx$170) {
        return mkSyntax$105(val$169, parser$95.Token.Punctuator, stx$170);
    }
    function makeDelim$113(val$171, inner$172, stx$173) {
        var ctx$174, startLineNumber$175, startLineStart$176, endLineNumber$177, endLineStart$178, startRange$179, endRange$180;
        if (stx$173 && stx$173.token.type === parser$95.Token.Delimiter) {
            ctx$174 = stx$173.context;
            startLineNumber$175 = stx$173.token.startLineNumber;
            startLineStart$176 = stx$173.token.startLineStart;
            endLineNumber$177 = stx$173.token.endLineNumber;
            endLineStart$178 = stx$173.token.endLineStart;
            startRange$179 = stx$173.token.startRange;
            endRange$180 = stx$173.token.endRange;
        } else if (stx$173 && stx$173.token) {
            ctx$174 = stx$173.context;
            startLineNumber$175 = stx$173.token.lineNumber;
            startLineStart$176 = stx$173.token.lineStart;
            endLineNumber$177 = stx$173.token.lineNumber;
            endLineStart$178 = stx$173.token.lineStart;
            startRange$179 = stx$173.token.range;
            endRange$180 = stx$173.token.range;
        } else {
            ctx$174 = null;
        }
        return syntaxFromToken$104({
            type: parser$95.Token.Delimiter,
            value: val$171,
            inner: inner$172,
            startLineStart: startLineStart$176,
            startLineNumber: startLineNumber$175,
            endLineStart: endLineStart$178,
            endLineNumber: endLineNumber$177,
            startRange: startRange$179,
            endRange: endRange$180
        }, ctx$174);
    }
    function unwrapSyntax$114(stx$181) {
        if (stx$181.token) {
            if (stx$181.token.type === parser$95.Token.Delimiter) {
                return stx$181.token;
            } else {
                return stx$181.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$181);
        }
    }
    exports$92.unwrapSyntax = unwrapSyntax$114;
    exports$92.makeDelim = makeDelim$113;
    exports$92.makePunc = makePunc$112;
    exports$92.makeKeyword = makeKeyword$111;
    exports$92.makeIdent = makeIdent$110;
    exports$92.makeRegex = makeRegex$109;
    exports$92.makeValue = makeValue$108;
    exports$92.Rename = Rename$96;
    exports$92.Mark = Mark$97;
    exports$92.Var = Var$99;
    exports$92.Def = Def$98;
    exports$92.isDef = isDef$102;
    exports$92.isMark = isMark$101;
    exports$92.isRename = isRename$100;
    exports$92.syntaxFromToken = syntaxFromToken$104;
    exports$92.mkSyntax = mkSyntax$105;
    exports$92.tokensToSyntax = tokensToSyntax$107;
    exports$92.syntaxToTokens = syntaxToTokens$106;
}));