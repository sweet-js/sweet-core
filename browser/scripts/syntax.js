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
                var markedToken$126 = _$87.clone(this.token);
                if (this.token.inner) {
                    var markedInner$129 = _$87.map(this.token.inner, function (stx$130) {
                            return stx$130.mark(newMark$125);
                        });
                    markedToken$126.inner = markedInner$129;
                }
                var newMarkObj$127 = Mark$91(newMark$125, this.context);
                var stmp$128 = syntaxFromToken$98(markedToken$126, newMarkObj$127);
                return stmp$128;
            },
            rename: function (id$131, name$132) {
                if (this.token.inner) {
                    var renamedInner$133 = _$87.map(this.token.inner, function (stx$134) {
                            return stx$134.rename(id$131, name$132);
                        });
                    this.token.inner = renamedInner$133;
                }
                return syntaxFromToken$98(this.token, Rename$90(id$131, name$132, this.context));
            },
            addDefCtx: function (defctx$135) {
                if (this.token.inner) {
                    var renamedInner$136 = _$87.map(this.token.inner, function (stx$137) {
                            return stx$137.addDefCtx(defctx$135);
                        });
                    this.token.inner = renamedInner$136;
                }
                return syntaxFromToken$98(this.token, Def$92(defctx$135, this.context));
            },
            getDefCtx: function () {
                var ctx$138 = this.context;
                while (ctx$138 !== null) {
                    if (isDef$96(ctx$138)) {
                        return ctx$138.defctx;
                    }
                    ctx$138 = ctx$138.context;
                }
                return null;
            },
            toString: function () {
                var val$139 = this.token.type === parser$89.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$139 + ']';
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
            templateMap: {
                value: templateMap$97,
                writable: false,
                enumerable: false,
                configurable: false
            }
        });
    }
    function mkSyntax$99(value$140, type$141, stx$142) {
        var ctx$143, lineStart$144, lineNumber$145, range$146;
        if (stx$142 && stx$142.token) {
            ctx$143 = stx$142.context;
            lineStart$144 = stx$142.token.lineStart;
            lineNumber$145 = stx$142.token.lineNumber;
            range$146 = stx$142.token.range;
        } else if (stx$142 == null) {
            ctx$143 = null;
        } else {
            throw new Error('Expecting a syntax object, not: ' + stx$142);
        }
        return syntaxFromToken$98({
            type: type$141,
            value: value$140,
            lineStart: lineStart$144,
            lineNumber: lineNumber$145,
            range: range$146
        }, ctx$143);
    }
    function syntaxToTokens$100(stx$147) {
        return _$87.map(stx$147, function (stx$148) {
            if (stx$148.token.inner) {
                stx$148.token.inner = syntaxToTokens$100(stx$148.token.inner);
            }
            return stx$148.token;
        });
    }
    function tokensToSyntax$101(tokens$149) {
        if (!_$87.isArray(tokens$149)) {
            tokens$149 = [tokens$149];
        }
        return _$87.map(tokens$149, function (token$150) {
            if (token$150.inner) {
                token$150.inner = tokensToSyntax$101(token$150.inner);
            }
            return syntaxFromToken$98(token$150);
        });
    }
    function makeValue$102(val$151, stx$152) {
        if (typeof val$151 === 'boolean') {
            return mkSyntax$99(val$151 ? 'true' : 'false', parser$89.Token.BooleanLiteral, stx$152);
        } else if (typeof val$151 === 'number') {
            return mkSyntax$99(val$151, parser$89.Token.NumericLiteral, stx$152);
        } else if (typeof val$151 === 'string') {
            return mkSyntax$99(val$151, parser$89.Token.StringLiteral, stx$152);
        } else if (val$151 === null) {
            return mkSyntax$99('null', parser$89.Token.NullLiteral, stx$152);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$151);
        }
    }
    function makeRegex$103(val$153, flags$154, stx$155) {
        var ctx$156, lineStart$157, lineNumber$158, range$159;
        if (stx$155 && stx$155.token) {
            ctx$156 = stx$155.context;
            lineStart$157 = stx$155.token.lineStart;
            lineNumber$158 = stx$155.token.lineNumber;
            range$159 = stx$155.token.range;
        } else {
            ctx$156 = null;
        }
        return syntaxFromToken$98({
            type: parser$89.Token.RegexLiteral,
            literal: val$153,
            value: new RegExp(val$153, flags$154),
            lineStart: lineStart$157,
            lineNumber: lineNumber$158,
            range: range$159
        }, ctx$156);
    }
    function makeIdent$104(val$160, stx$161) {
        return mkSyntax$99(val$160, parser$89.Token.Identifier, stx$161);
    }
    function makeKeyword$105(val$162, stx$163) {
        return mkSyntax$99(val$162, parser$89.Token.Keyword, stx$163);
    }
    function makePunc$106(val$164, stx$165) {
        return mkSyntax$99(val$164, parser$89.Token.Punctuator, stx$165);
    }
    function makeDelim$107(val$166, inner$167, stx$168) {
        var ctx$169, startLineNumber$170, startLineStart$171, endLineNumber$172, endLineStart$173, startRange$174, endRange$175;
        if (stx$168 && stx$168.token.type === parser$89.Token.Delimiter) {
            ctx$169 = stx$168.context;
            startLineNumber$170 = stx$168.token.startLineNumber;
            startLineStart$171 = stx$168.token.startLineStart;
            endLineNumber$172 = stx$168.token.endLineNumber;
            endLineStart$173 = stx$168.token.endLineStart;
            startRange$174 = stx$168.token.startRange;
            endRange$175 = stx$168.token.endRange;
        } else if (stx$168 && stx$168.token) {
            ctx$169 = stx$168.context;
            startLineNumber$170 = stx$168.token.lineNumber;
            startLineStart$171 = stx$168.token.lineStart;
            endLineNumber$172 = stx$168.token.lineNumber;
            endLineStart$173 = stx$168.token.lineStart;
            startRange$174 = stx$168.token.range;
            endRange$175 = stx$168.token.range;
        } else {
            ctx$169 = null;
        }
        return syntaxFromToken$98({
            type: parser$89.Token.Delimiter,
            value: val$166,
            inner: inner$167,
            startLineStart: startLineStart$171,
            startLineNumber: startLineNumber$170,
            endLineStart: endLineStart$173,
            endLineNumber: endLineNumber$172,
            startRange: startRange$174,
            endRange: endRange$175
        }, ctx$169);
    }
    function unwrapSyntax$108(stx$176) {
        if (stx$176.token) {
            if (stx$176.token.type === parser$89.Token.Delimiter) {
                return stx$176.token;
            } else {
                return stx$176.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$176);
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