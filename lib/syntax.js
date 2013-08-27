(function (root$49, factory$50) {
    if (typeof exports === 'object') {
        factory$50(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$50);
    }
}(this, function (exports$51, _$52, es6$53, parser$54) {
    function Rename$58(id$59, name$60, ctx$61, defctx$62) {
        defctx$62 = defctx$62 || null;
        return {
            id: id$59,
            name: name$60,
            context: ctx$61,
            def: defctx$62
        };
    }
    function Mark$63(mark$64, ctx$65) {
        return {
            mark: mark$64,
            context: ctx$65
        };
    }
    function Def$66(defctx$67, ctx$68) {
        return {
            defctx: defctx$67,
            context: ctx$68
        };
    }
    function Var$69(id$70) {
        return {id: id$70};
    }
    var isRename$55 = function (r$71) {
        return r$71 && typeof r$71.id !== 'undefined' && typeof r$71.name !== 'undefined';
    };
    var isMark$72 = function isMark$72(m$73) {
        return m$73 && typeof m$73.mark !== 'undefined';
    };
    function isDef$74(ctx$75) {
        return ctx$75 && typeof ctx$75.defctx !== 'undefined';
    }
    var templateMap$57 = new Map();
    function syntaxFromToken$76(token$77, oldctx$78) {
        var ctx$79 = typeof oldctx$78 !== 'undefined' ? oldctx$78 : null;
        return Object.create({
            mark: function mark$80(newMark$81) {
                var markedToken$82 = _$52.clone(this.token);
                if (this.token.inner) {
                    var markedInner$85 = _$52.map(this.token.inner, function (stx$86) {
                            return stx$86.mark(newMark$81);
                        });
                    markedToken$82.inner = markedInner$85;
                }
                var newMarkObj$83 = Mark$63(newMark$81, this.context);
                var stmp$84 = syntaxFromToken$76(markedToken$82, newMarkObj$83);
                return stmp$84;
            },
            rename: function (id$87, name$88) {
                if (this.token.inner) {
                    var renamedInner$89 = _$52.map(this.token.inner, function (stx$90) {
                            return stx$90.rename(id$87, name$88);
                        });
                    this.token.inner = renamedInner$89;
                }
                if (this.token.value === id$87.token.value) {
                    return syntaxFromToken$76(this.token, Rename$58(id$87, name$88, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$91) {
                if (this.token.inner) {
                    var renamedInner$92 = _$52.map(this.token.inner, function (stx$93) {
                            return stx$93.addDefCtx(defctx$91);
                        });
                    this.token.inner = renamedInner$92;
                }
                return syntaxFromToken$76(this.token, Def$66(defctx$91, this.context));
            },
            getDefCtx: function () {
                var ctx$94 = this.context;
                while (ctx$94 !== null) {
                    if (isDef$74(ctx$94)) {
                        return ctx$94.defctx;
                    }
                    ctx$94 = ctx$94.context;
                }
                return null;
            },
            toString: function () {
                var val$95 = this.token.type === parser$54.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$95 + ']';
            }
        }, {
            token: {
                value: token$77,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$79,
                writable: true,
                enumerable: true,
                configurable: true
            },
            templateMap: {
                value: templateMap$57,
                writable: false,
                enumerable: false,
                configurable: false
            }
        });
    }
    function mkSyntax$96(value$97, type$98, stx$99) {
        var ctx$100, lineStart$101, lineNumber$102, range$103;
        if (stx$99 && stx$99.token) {
            ctx$100 = stx$99.context;
            lineStart$101 = stx$99.token.lineStart;
            lineNumber$102 = stx$99.token.lineNumber;
            range$103 = stx$99.token.range;
        } else {
            ctx$100 = null;
        }
        return syntaxFromToken$76({
            type: type$98,
            value: value$97,
            lineStart: lineStart$101,
            lineNumber: lineNumber$102,
            range: range$103
        }, ctx$100);
    }
    function syntaxToTokens$104(stx$105) {
        return _$52.map(stx$105, function (stx$106) {
            if (stx$106.token.inner) {
                stx$106.token.inner = syntaxToTokens$104(stx$106.token.inner);
            }
            return stx$106.token;
        });
    }
    function tokensToSyntax$107(tokens$108) {
        if (!_$52.isArray(tokens$108)) {
            tokens$108 = [tokens$108];
        }
        return _$52.map(tokens$108, function (token$109) {
            if (token$109.inner) {
                token$109.inner = tokensToSyntax$107(token$109.inner);
            }
            return syntaxFromToken$76(token$109);
        });
    }
    function makeValue$110(val$111, stx$112) {
        if (typeof val$111 === 'boolean') {
            return mkSyntax$96(val$111 ? 'true' : 'false', parser$54.Token.BooleanLiteral, stx$112);
        } else if (typeof val$111 === 'number') {
            return mkSyntax$96(val$111, parser$54.Token.NumericLiteral, stx$112);
        } else if (typeof val$111 === 'string') {
            return mkSyntax$96(val$111, parser$54.Token.StringLiteral, stx$112);
        } else if (val$111 === null) {
            return mkSyntax$96('null', parser$54.Token.NullLiteral, stx$112);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$111);
        }
    }
    function makeRegex$113(val$114, flags$115, stx$116) {
        var ctx$117, lineStart$118, lineNumber$119, range$120;
        if (stx$116 && stx$116.token) {
            ctx$117 = stx$116.context;
            lineStart$118 = stx$116.token.lineStart;
            lineNumber$119 = stx$116.token.lineNumber;
            range$120 = stx$116.token.range;
        } else {
            ctx$117 = null;
        }
        return syntaxFromToken$76({
            type: parser$54.Token.RegexLiteral,
            literal: val$114,
            value: new RegExp(val$114, flags$115),
            lineStart: lineStart$118,
            lineNumber: lineNumber$119,
            range: range$120
        }, ctx$117);
    }
    function makeIdent$121(val$122, stx$123) {
        return mkSyntax$96(val$122, parser$54.Token.Identifier, stx$123);
    }
    function makeKeyword$124(val$125, stx$126) {
        return mkSyntax$96(val$125, parser$54.Token.Keyword, stx$126);
    }
    function makePunc$127(val$128, stx$129) {
        return mkSyntax$96(val$128, parser$54.Token.Punctuator, stx$129);
    }
    function makeDelim$130(val$131, inner$132, stx$133) {
        var ctx$134, startLineNumber$135, startLineStart$136, endLineNumber$137, endLineStart$138, startRange$139, endRange$140;
        if (stx$133 && stx$133.token.type === parser$54.Token.Delimiter) {
            ctx$134 = stx$133.context;
            startLineNumber$135 = stx$133.token.startLineNumber;
            startLineStart$136 = stx$133.token.startLineStart;
            endLineNumber$137 = stx$133.token.endLineNumber;
            endLineStart$138 = stx$133.token.endLineStart;
            startRange$139 = stx$133.token.startRange;
            endRange$140 = stx$133.token.endRange;
        } else if (stx$133 && stx$133.token) {
            ctx$134 = stx$133.context;
            startLineNumber$135 = stx$133.token.lineNumber;
            startLineStart$136 = stx$133.token.lineStart;
            endLineNumber$137 = stx$133.token.lineNumber;
            endLineStart$138 = stx$133.token.lineStart;
            startRange$139 = stx$133.token.range;
            endRange$140 = stx$133.token.range;
        } else {
            ctx$134 = null;
        }
        return syntaxFromToken$76({
            type: parser$54.Token.Delimiter,
            value: val$131,
            inner: inner$132,
            startLineStart: startLineStart$136,
            startLineNumber: startLineNumber$135,
            endLineStart: endLineStart$138,
            endLineNumber: endLineNumber$137,
            startRange: startRange$139,
            endRange: endRange$140
        }, ctx$134);
    }
    function unwrapSyntax$141(stx$142) {
        if (stx$142.token) {
            if (stx$142.token.type === parser$54.Token.Delimiter) {
                return stx$142.token;
            } else {
                return stx$142.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$142);
        }
    }
    exports$51.unwrapSyntax = unwrapSyntax$141;
    exports$51.makeDelim = makeDelim$130;
    exports$51.makePunc = makePunc$127;
    exports$51.makeKeyword = makeKeyword$124;
    exports$51.makeIdent = makeIdent$121;
    exports$51.makeRegex = makeRegex$113;
    exports$51.makeValue = makeValue$110;
    exports$51.Rename = Rename$58;
    exports$51.Mark = Mark$63;
    exports$51.Var = Var$69;
    exports$51.Def = Def$66;
    exports$51.isDef = isDef$74;
    exports$51.isMark = isMark$72;
    exports$51.isRename = isRename$55;
    exports$51.syntaxFromToken = syntaxFromToken$76;
    exports$51.mkSyntax = mkSyntax$96;
    exports$51.tokensToSyntax = tokensToSyntax$107;
    exports$51.syntaxToTokens = syntaxToTokens$104;
}));