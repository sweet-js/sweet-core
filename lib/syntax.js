(function (root$92, factory$93) {
    if (typeof exports === 'object') {
        factory$93(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$93);
    }
}(this, function (exports$94, _$95, es6$96, parser$97) {
    function Rename$98(id$117, name$118, ctx$119, defctx$120) {
        defctx$120 = defctx$120 || null;
        return {
            id: id$117,
            name: name$118,
            context: ctx$119,
            def: defctx$120
        };
    }
    function Mark$99(mark$121, ctx$122) {
        return {
            mark: mark$121,
            context: ctx$122
        };
    }
    function Def$100(defctx$123, ctx$124) {
        return {
            defctx: defctx$123,
            context: ctx$124
        };
    }
    function Var$101(id$125) {
        return { id: id$125 };
    }
    var isRename$102 = function (r$126) {
        return r$126 && typeof r$126.id !== 'undefined' && typeof r$126.name !== 'undefined';
    };
    var isMark$103 = function isMark$103(m$127) {
        return m$127 && typeof m$127.mark !== 'undefined';
    };
    function isDef$104(ctx$128) {
        return ctx$128 && typeof ctx$128.defctx !== 'undefined';
    }
    var templateMap$105 = new Map();
    function syntaxFromToken$106(token$129, oldctx$130) {
        var ctx$131 = typeof oldctx$130 !== 'undefined' ? oldctx$130 : null;
        return Object.create({
            mark: function mark$132(newMark$133) {
                if (this.token.inner) {
                    var next$134 = syntaxFromToken$106(this.token, this.context);
                    next$134.deferredContext = Mark$99(newMark$133, this.deferredContext);
                    return next$134;
                }
                return syntaxFromToken$106(this.token, Mark$99(newMark$133, this.context));
            },
            rename: function (id$135, name$136) {
                if (this.token.inner) {
                    var next$137 = syntaxFromToken$106(this.token, this.context);
                    next$137.deferredContext = Rename$98(id$135, name$136, this.deferredContext);
                    return next$137;
                }
                if (this.token.type === parser$97.Token.Identifier || this.token.type === parser$97.Token.Keyword) {
                    return syntaxFromToken$106(this.token, Rename$98(id$135, name$136, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$138) {
                if (this.token.inner) {
                    var next$139 = syntaxFromToken$106(this.token, this.context);
                    next$139.deferredContext = Def$100(defctx$138, this.deferredContext);
                    return next$139;
                }
                return syntaxFromToken$106(this.token, Def$100(defctx$138, this.context));
            },
            getDefCtx: function () {
                var ctx$140 = this.context;
                while (ctx$140 !== null) {
                    if (isDef$104(ctx$140)) {
                        return ctx$140.defctx;
                    }
                    ctx$140 = ctx$140.context;
                }
                return null;
            },
            expose: function () {
                parser$97.assert(this.token.type === parser$97.Token.Delimiter, 'Only delimiters can be exposed');
                function applyContext$141(stxCtx$142, ctx$143) {
                    if (ctx$143 == null) {
                        return stxCtx$142;
                    } else if (isRename$102(ctx$143)) {
                        return Rename$98(ctx$143.id, ctx$143.name, applyContext$141(stxCtx$142, ctx$143.context));
                    } else if (isMark$103(ctx$143)) {
                        return Mark$99(ctx$143.mark, applyContext$141(stxCtx$142, ctx$143.context));
                    } else if (isDef$104(ctx$143)) {
                        return Def$100(ctx$143.defctx, applyContext$141(stxCtx$142, ctx$143.context));
                    } else {
                        parser$97.assert(false, 'unknown context type');
                    }
                }
                this.token.inner = _$95.map(this.token.inner, _$95.bind(function (stx$144) {
                    if (stx$144.token.inner) {
                        var next$145 = syntaxFromToken$106(stx$144.token, stx$144.context);
                        next$145.deferredContext = applyContext$141(stx$144.deferredContext, this.deferredContext);
                        return next$145;
                    } else {
                        return syntaxFromToken$106(stx$144.token, applyContext$141(stx$144.context, this.deferredContext));
                    }
                }, this));
                this.deferredContext = null;
                return this;
            },
            toString: function () {
                var val$146 = this.token.type === parser$97.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$146 + ']';
            }
        }, {
            token: {
                value: token$129,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$131,
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
    function mkSyntax$107(value$147, type$148, stx$149) {
        var ctx$150, lineStart$151, lineNumber$152, range$153;
        if (stx$149 && Array.isArray(stx$149) && stx$149.length === 1) {
            stx$149 = stx$149[0];
        } else if (stx$149 && Array.isArray(stx$149)) {
            throw new Error('Expecting a syntax object, not: ' + stx$149);
        }
        if (stx$149 && stx$149.token) {
            ctx$150 = stx$149.context;
            lineStart$151 = stx$149.token.lineStart;
            lineNumber$152 = stx$149.token.lineNumber;
            range$153 = stx$149.token.range;
        } else if (stx$149 == null) {
            ctx$150 = null;
        } else {
            throw new Error('Expecting a syntax object, not: ' + stx$149);
        }
        return syntaxFromToken$106({
            type: type$148,
            value: value$147,
            lineStart: lineStart$151,
            lineNumber: lineNumber$152,
            range: range$153
        }, ctx$150);
    }
    function syntaxToTokens$108(stx$154) {
        return _$95.map(stx$154, function (stx$155) {
            if (stx$155.token.inner) {
                stx$155.token.inner = syntaxToTokens$108(stx$155.token.inner);
            }
            return stx$155.token;
        });
    }
    function tokensToSyntax$109(tokens$156) {
        if (!_$95.isArray(tokens$156)) {
            tokens$156 = [tokens$156];
        }
        return _$95.map(tokens$156, function (token$157) {
            if (token$157.inner) {
                token$157.inner = tokensToSyntax$109(token$157.inner);
            }
            return syntaxFromToken$106(token$157);
        });
    }
    function makeValue$110(val$158, stx$159) {
        if (typeof val$158 === 'boolean') {
            return mkSyntax$107(val$158 ? 'true' : 'false', parser$97.Token.BooleanLiteral, stx$159);
        } else if (typeof val$158 === 'number') {
            return mkSyntax$107(val$158, parser$97.Token.NumericLiteral, stx$159);
        } else if (typeof val$158 === 'string') {
            return mkSyntax$107(val$158, parser$97.Token.StringLiteral, stx$159);
        } else if (val$158 === null) {
            return mkSyntax$107('null', parser$97.Token.NullLiteral, stx$159);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$158);
        }
    }
    function makeRegex$111(val$160, flags$161, stx$162) {
        var ctx$163, lineStart$164, lineNumber$165, range$166;
        if (stx$162 && stx$162.token) {
            ctx$163 = stx$162.context;
            lineStart$164 = stx$162.token.lineStart;
            lineNumber$165 = stx$162.token.lineNumber;
            range$166 = stx$162.token.range;
        } else {
            ctx$163 = null;
        }
        return syntaxFromToken$106({
            type: parser$97.Token.RegexLiteral,
            literal: val$160,
            value: new RegExp(val$160, flags$161),
            lineStart: lineStart$164,
            lineNumber: lineNumber$165,
            range: range$166
        }, ctx$163);
    }
    function makeIdent$112(val$167, stx$168) {
        return mkSyntax$107(val$167, parser$97.Token.Identifier, stx$168);
    }
    function makeKeyword$113(val$169, stx$170) {
        return mkSyntax$107(val$169, parser$97.Token.Keyword, stx$170);
    }
    function makePunc$114(val$171, stx$172) {
        return mkSyntax$107(val$171, parser$97.Token.Punctuator, stx$172);
    }
    function makeDelim$115(val$173, inner$174, stx$175) {
        var ctx$176, startLineNumber$177, startLineStart$178, endLineNumber$179, endLineStart$180, startRange$181, endRange$182;
        if (stx$175 && stx$175.token.type === parser$97.Token.Delimiter) {
            ctx$176 = stx$175.context;
            startLineNumber$177 = stx$175.token.startLineNumber;
            startLineStart$178 = stx$175.token.startLineStart;
            endLineNumber$179 = stx$175.token.endLineNumber;
            endLineStart$180 = stx$175.token.endLineStart;
            startRange$181 = stx$175.token.startRange;
            endRange$182 = stx$175.token.endRange;
        } else if (stx$175 && stx$175.token) {
            ctx$176 = stx$175.context;
            startLineNumber$177 = stx$175.token.lineNumber;
            startLineStart$178 = stx$175.token.lineStart;
            endLineNumber$179 = stx$175.token.lineNumber;
            endLineStart$180 = stx$175.token.lineStart;
            startRange$181 = stx$175.token.range;
            endRange$182 = stx$175.token.range;
        } else {
            ctx$176 = null;
        }
        return syntaxFromToken$106({
            type: parser$97.Token.Delimiter,
            value: val$173,
            inner: inner$174,
            startLineStart: startLineStart$178,
            startLineNumber: startLineNumber$177,
            endLineStart: endLineStart$180,
            endLineNumber: endLineNumber$179,
            startRange: startRange$181,
            endRange: endRange$182
        }, ctx$176);
    }
    function unwrapSyntax$116(stx$183) {
        if (stx$183.token) {
            if (stx$183.token.type === parser$97.Token.Delimiter) {
                return stx$183.token;
            } else {
                return stx$183.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$183);
        }
    }
    exports$94.unwrapSyntax = unwrapSyntax$116;
    exports$94.makeDelim = makeDelim$115;
    exports$94.makePunc = makePunc$114;
    exports$94.makeKeyword = makeKeyword$113;
    exports$94.makeIdent = makeIdent$112;
    exports$94.makeRegex = makeRegex$111;
    exports$94.makeValue = makeValue$110;
    exports$94.Rename = Rename$98;
    exports$94.Mark = Mark$99;
    exports$94.Var = Var$101;
    exports$94.Def = Def$100;
    exports$94.isDef = isDef$104;
    exports$94.isMark = isMark$103;
    exports$94.isRename = isRename$102;
    exports$94.syntaxFromToken = syntaxFromToken$106;
    exports$94.mkSyntax = mkSyntax$107;
    exports$94.tokensToSyntax = tokensToSyntax$109;
    exports$94.syntaxToTokens = syntaxToTokens$108;
}));