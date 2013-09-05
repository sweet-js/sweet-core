(function (root$84, factory$85) {
    if (typeof exports === 'object') {
        factory$85(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$85);
    }
}(this, function (exports$86, _$87, es6$88, parser$89) {
    function Rename$90(id$109, name$110, ctx$111, defctx$112) {
        defctx$112 = defctx$112 || null;
        return {
            id: id$109,
            name: name$110,
            context: ctx$111,
            def: defctx$112
        };
    }
    function Mark$91(mark$113, ctx$114) {
        return {
            mark: mark$113,
            context: ctx$114
        };
    }
    function Def$92(defctx$115, ctx$116) {
        return {
            defctx: defctx$115,
            context: ctx$116
        };
    }
    function Var$93(id$117) {
        return {id: id$117};
    }
    var isRename$94 = function (r$118) {
        return r$118 && typeof r$118.id !== 'undefined' && typeof r$118.name !== 'undefined';
    };
    var isMark$95 = function isMark$95(m$119) {
        return m$119 && typeof m$119.mark !== 'undefined';
    };
    function isDef$96(ctx$120) {
        return ctx$120 && typeof ctx$120.defctx !== 'undefined';
    }
    var templateMap$97 = new Map();
    function syntaxFromToken$98(token$121, oldctx$122) {
        var ctx$123 = typeof oldctx$122 !== 'undefined' ? oldctx$122 : null;
        return Object.create({
            mark: function mark$124(newMark$125) {
                if (this.token.inner) {
                    var next$126 = syntaxFromToken$98(this.token, this.context);
                    next$126.deferredContext = Mark$91(newMark$125, this.deferredContext);
                    return next$126;
                }
                return syntaxFromToken$98(this.token, Mark$91(newMark$125, this.context));
            },
            rename: function (id$127, name$128) {
                if (this.token.inner) {
                    var next$129 = syntaxFromToken$98(this.token, this.context);
                    next$129.deferredContext = Rename$90(id$127, name$128, this.deferredContext);
                    return next$129;
                }
                if (this.token.type === parser$89.Token.Identifier || this.token.type === parser$89.Token.Keyword) {
                    return syntaxFromToken$98(this.token, Rename$90(id$127, name$128, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$130) {
                if (this.token.inner) {
                    var next$131 = syntaxFromToken$98(this.token, this.context);
                    next$131.deferredContext = Def$92(defctx$130, this.deferredContext);
                    return next$131;
                }
                return syntaxFromToken$98(this.token, Def$92(defctx$130, this.context));
            },
            getDefCtx: function () {
                var ctx$132 = this.context;
                while (ctx$132 !== null) {
                    if (isDef$96(ctx$132)) {
                        return ctx$132.defctx;
                    }
                    ctx$132 = ctx$132.context;
                }
                return null;
            },
            expose: function () {
                parser$89.assert(this.token.type === parser$89.Token.Delimiter, 'Only delimiters can be exposed');
                function applyContext$133(stxCtx$134, ctx$135) {
                    if (ctx$135 == null) {
                        return stxCtx$134;
                    } else if (isRename$94(ctx$135)) {
                        return Rename$90(ctx$135.id, ctx$135.name, applyContext$133(stxCtx$134, ctx$135.context));
                    } else if (isMark$95(ctx$135)) {
                        return Mark$91(ctx$135.mark, applyContext$133(stxCtx$134, ctx$135.context));
                    } else if (isDef$96(ctx$135)) {
                        return Def$92(ctx$135.defctx, applyContext$133(stxCtx$134, ctx$135.context));
                    } else {
                        parser$89.assert(false, 'unknown context type');
                    }
                }
                this.token.inner = _$87.map(this.token.inner, _$87.bind(function (stx$136) {
                    if (stx$136.token.inner) {
                        var next$137 = syntaxFromToken$98(stx$136.token, stx$136.context);
                        next$137.deferredContext = applyContext$133(stx$136.deferredContext, this.deferredContext);
                        return next$137;
                    } else {
                        return syntaxFromToken$98(stx$136.token, applyContext$133(stx$136.context, this.deferredContext));
                    }
                }, this));
                this.deferredContext = null;
                return this;
            },
            toString: function () {
                var val$138 = this.token.type === parser$89.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$138 + ']';
            }
        }, {
            token: {
                value: token$121,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$123,
                writable: true,
                enumerable: true,
                configurable: true
            },
            deferredContext: {
                value: null,
                writable: true,
                enumerable: true,
                configurable: true
            },
            templateMap: {
                value: templateMap$97,
                writable: false,
                enumerable: false,
                configurable: false
            }
        });
    }
    function mkSyntax$99(value$139, type$140, stx$141) {
        var ctx$142, lineStart$143, lineNumber$144, range$145;
        if (stx$141 && stx$141.token) {
            ctx$142 = stx$141.context;
            lineStart$143 = stx$141.token.lineStart;
            lineNumber$144 = stx$141.token.lineNumber;
            range$145 = stx$141.token.range;
        } else if (stx$141 == null) {
            ctx$142 = null;
        } else {
            throw new Error('Expecting a syntax object, not: ' + stx$141);
        }
        return syntaxFromToken$98({
            type: type$140,
            value: value$139,
            lineStart: lineStart$143,
            lineNumber: lineNumber$144,
            range: range$145
        }, ctx$142);
    }
    function syntaxToTokens$100(stx$146) {
        return _$87.map(stx$146, function (stx$147) {
            if (stx$147.token.inner) {
                stx$147.token.inner = syntaxToTokens$100(stx$147.token.inner);
            }
            return stx$147.token;
        });
    }
    function tokensToSyntax$101(tokens$148) {
        if (!_$87.isArray(tokens$148)) {
            tokens$148 = [tokens$148];
        }
        return _$87.map(tokens$148, function (token$149) {
            if (token$149.inner) {
                token$149.inner = tokensToSyntax$101(token$149.inner);
            }
            return syntaxFromToken$98(token$149);
        });
    }
    function makeValue$102(val$150, stx$151) {
        if (typeof val$150 === 'boolean') {
            return mkSyntax$99(val$150 ? 'true' : 'false', parser$89.Token.BooleanLiteral, stx$151);
        } else if (typeof val$150 === 'number') {
            return mkSyntax$99(val$150, parser$89.Token.NumericLiteral, stx$151);
        } else if (typeof val$150 === 'string') {
            return mkSyntax$99(val$150, parser$89.Token.StringLiteral, stx$151);
        } else if (val$150 === null) {
            return mkSyntax$99('null', parser$89.Token.NullLiteral, stx$151);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$150);
        }
    }
    function makeRegex$103(val$152, flags$153, stx$154) {
        var ctx$155, lineStart$156, lineNumber$157, range$158;
        if (stx$154 && stx$154.token) {
            ctx$155 = stx$154.context;
            lineStart$156 = stx$154.token.lineStart;
            lineNumber$157 = stx$154.token.lineNumber;
            range$158 = stx$154.token.range;
        } else {
            ctx$155 = null;
        }
        return syntaxFromToken$98({
            type: parser$89.Token.RegexLiteral,
            literal: val$152,
            value: new RegExp(val$152, flags$153),
            lineStart: lineStart$156,
            lineNumber: lineNumber$157,
            range: range$158
        }, ctx$155);
    }
    function makeIdent$104(val$159, stx$160) {
        return mkSyntax$99(val$159, parser$89.Token.Identifier, stx$160);
    }
    function makeKeyword$105(val$161, stx$162) {
        return mkSyntax$99(val$161, parser$89.Token.Keyword, stx$162);
    }
    function makePunc$106(val$163, stx$164) {
        return mkSyntax$99(val$163, parser$89.Token.Punctuator, stx$164);
    }
    function makeDelim$107(val$165, inner$166, stx$167) {
        var ctx$168, startLineNumber$169, startLineStart$170, endLineNumber$171, endLineStart$172, startRange$173, endRange$174;
        if (stx$167 && stx$167.token.type === parser$89.Token.Delimiter) {
            ctx$168 = stx$167.context;
            startLineNumber$169 = stx$167.token.startLineNumber;
            startLineStart$170 = stx$167.token.startLineStart;
            endLineNumber$171 = stx$167.token.endLineNumber;
            endLineStart$172 = stx$167.token.endLineStart;
            startRange$173 = stx$167.token.startRange;
            endRange$174 = stx$167.token.endRange;
        } else if (stx$167 && stx$167.token) {
            ctx$168 = stx$167.context;
            startLineNumber$169 = stx$167.token.lineNumber;
            startLineStart$170 = stx$167.token.lineStart;
            endLineNumber$171 = stx$167.token.lineNumber;
            endLineStart$172 = stx$167.token.lineStart;
            startRange$173 = stx$167.token.range;
            endRange$174 = stx$167.token.range;
        } else {
            ctx$168 = null;
        }
        return syntaxFromToken$98({
            type: parser$89.Token.Delimiter,
            value: val$165,
            inner: inner$166,
            startLineStart: startLineStart$170,
            startLineNumber: startLineNumber$169,
            endLineStart: endLineStart$172,
            endLineNumber: endLineNumber$171,
            startRange: startRange$173,
            endRange: endRange$174
        }, ctx$168);
    }
    function unwrapSyntax$108(stx$175) {
        if (stx$175.token) {
            if (stx$175.token.type === parser$89.Token.Delimiter) {
                return stx$175.token;
            } else {
                return stx$175.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$175);
        }
    }
    exports$86.unwrapSyntax = unwrapSyntax$108;
    exports$86.makeDelim = makeDelim$107;
    exports$86.makePunc = makePunc$106;
    exports$86.makeKeyword = makeKeyword$105;
    exports$86.makeIdent = makeIdent$104;
    exports$86.makeRegex = makeRegex$103;
    exports$86.makeValue = makeValue$102;
    exports$86.Rename = Rename$90;
    exports$86.Mark = Mark$91;
    exports$86.Var = Var$93;
    exports$86.Def = Def$92;
    exports$86.isDef = isDef$96;
    exports$86.isMark = isMark$95;
    exports$86.isRename = isRename$94;
    exports$86.syntaxFromToken = syntaxFromToken$98;
    exports$86.mkSyntax = mkSyntax$99;
    exports$86.tokensToSyntax = tokensToSyntax$101;
    exports$86.syntaxToTokens = syntaxToTokens$100;
}));