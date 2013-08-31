(function (root$82, factory$83) {
    if (typeof exports === 'object') {
        factory$83(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$83);
    }
}(this, function (exports$84, _$85, es6$86, parser$87) {
    function Rename$91(id$92, name$93, ctx$94, defctx$95) {
        defctx$95 = defctx$95 || null;
        return {
            id: id$92,
            name: name$93,
            context: ctx$94,
            def: defctx$95
        };
    }
    function Mark$96(mark$97, ctx$98) {
        return {
            mark: mark$97,
            context: ctx$98
        };
    }
    function Def$99(defctx$100, ctx$101) {
        return {
            defctx: defctx$100,
            context: ctx$101
        };
    }
    function Var$102(id$103) {
        return {id: id$103};
    }
    var isRename$88 = function (r$104) {
        return r$104 && typeof r$104.id !== 'undefined' && typeof r$104.name !== 'undefined';
    };
    var isMark$105 = function isMark$105(m$106) {
        return m$106 && typeof m$106.mark !== 'undefined';
    };
    function isDef$107(ctx$108) {
        return ctx$108 && typeof ctx$108.defctx !== 'undefined';
    }
    var templateMap$90 = new Map();
    function syntaxFromToken$109(token$110, oldctx$111) {
        var ctx$112 = typeof oldctx$111 !== 'undefined' ? oldctx$111 : null;
        return Object.create({
            mark: function mark$113(newMark$114) {
                var markedToken$115 = _$85.clone(this.token);
                if (this.token.inner) {
                    var markedInner$118 = _$85.map(this.token.inner, function (stx$119) {
                            return stx$119.mark(newMark$114);
                        });
                    markedToken$115.inner = markedInner$118;
                }
                var newMarkObj$116 = Mark$96(newMark$114, this.context);
                var stmp$117 = syntaxFromToken$109(markedToken$115, newMarkObj$116);
                return stmp$117;
            },
            rename: function (id$120, name$121) {
                if (this.token.inner) {
                    var renamedInner$122 = _$85.map(this.token.inner, function (stx$123) {
                            return stx$123.rename(id$120, name$121);
                        });
                    this.token.inner = renamedInner$122;
                }
                return syntaxFromToken$109(this.token, Rename$91(id$120, name$121, this.context));
            },
            addDefCtx: function (defctx$124) {
                if (this.token.inner) {
                    var renamedInner$125 = _$85.map(this.token.inner, function (stx$126) {
                            return stx$126.addDefCtx(defctx$124);
                        });
                    this.token.inner = renamedInner$125;
                }
                return syntaxFromToken$109(this.token, Def$99(defctx$124, this.context));
            },
            getDefCtx: function () {
                var ctx$127 = this.context;
                while (ctx$127 !== null) {
                    if (isDef$107(ctx$127)) {
                        return ctx$127.defctx;
                    }
                    ctx$127 = ctx$127.context;
                }
                return null;
            },
            toString: function () {
                var val$128 = this.token.type === parser$87.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$128 + ']';
            }
        }, {
            token: {
                value: token$110,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$112,
                writable: true,
                enumerable: true,
                configurable: true
            },
            templateMap: {
                value: templateMap$90,
                writable: false,
                enumerable: false,
                configurable: false
            }
        });
    }
    function mkSyntax$129(value$130, type$131, stx$132) {
        var ctx$133, lineStart$134, lineNumber$135, range$136;
        if (stx$132 && stx$132.token) {
            ctx$133 = stx$132.context;
            lineStart$134 = stx$132.token.lineStart;
            lineNumber$135 = stx$132.token.lineNumber;
            range$136 = stx$132.token.range;
        } else if (stx$132 == null) {
            ctx$133 = null;
        } else {
            throw new Error('Expecting a syntax object, not: ' + stx$132);
        }
        return syntaxFromToken$109({
            type: type$131,
            value: value$130,
            lineStart: lineStart$134,
            lineNumber: lineNumber$135,
            range: range$136
        }, ctx$133);
    }
    function syntaxToTokens$137(stx$138) {
        return _$85.map(stx$138, function (stx$139) {
            if (stx$139.token.inner) {
                stx$139.token.inner = syntaxToTokens$137(stx$139.token.inner);
            }
            return stx$139.token;
        });
    }
    function tokensToSyntax$140(tokens$141) {
        if (!_$85.isArray(tokens$141)) {
            tokens$141 = [tokens$141];
        }
        return _$85.map(tokens$141, function (token$142) {
            if (token$142.inner) {
                token$142.inner = tokensToSyntax$140(token$142.inner);
            }
            return syntaxFromToken$109(token$142);
        });
    }
    function makeValue$143(val$144, stx$145) {
        if (typeof val$144 === 'boolean') {
            return mkSyntax$129(val$144 ? 'true' : 'false', parser$87.Token.BooleanLiteral, stx$145);
        } else if (typeof val$144 === 'number') {
            return mkSyntax$129(val$144, parser$87.Token.NumericLiteral, stx$145);
        } else if (typeof val$144 === 'string') {
            return mkSyntax$129(val$144, parser$87.Token.StringLiteral, stx$145);
        } else if (val$144 === null) {
            return mkSyntax$129('null', parser$87.Token.NullLiteral, stx$145);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$144);
        }
    }
    function makeRegex$146(val$147, flags$148, stx$149) {
        var ctx$150, lineStart$151, lineNumber$152, range$153;
        if (stx$149 && stx$149.token) {
            ctx$150 = stx$149.context;
            lineStart$151 = stx$149.token.lineStart;
            lineNumber$152 = stx$149.token.lineNumber;
            range$153 = stx$149.token.range;
        } else {
            ctx$150 = null;
        }
        return syntaxFromToken$109({
            type: parser$87.Token.RegexLiteral,
            literal: val$147,
            value: new RegExp(val$147, flags$148),
            lineStart: lineStart$151,
            lineNumber: lineNumber$152,
            range: range$153
        }, ctx$150);
    }
    function makeIdent$154(val$155, stx$156) {
        return mkSyntax$129(val$155, parser$87.Token.Identifier, stx$156);
    }
    function makeKeyword$157(val$158, stx$159) {
        return mkSyntax$129(val$158, parser$87.Token.Keyword, stx$159);
    }
    function makePunc$160(val$161, stx$162) {
        return mkSyntax$129(val$161, parser$87.Token.Punctuator, stx$162);
    }
    function makeDelim$163(val$164, inner$165, stx$166) {
        var ctx$167, startLineNumber$168, startLineStart$169, endLineNumber$170, endLineStart$171, startRange$172, endRange$173;
        if (stx$166 && stx$166.token.type === parser$87.Token.Delimiter) {
            ctx$167 = stx$166.context;
            startLineNumber$168 = stx$166.token.startLineNumber;
            startLineStart$169 = stx$166.token.startLineStart;
            endLineNumber$170 = stx$166.token.endLineNumber;
            endLineStart$171 = stx$166.token.endLineStart;
            startRange$172 = stx$166.token.startRange;
            endRange$173 = stx$166.token.endRange;
        } else if (stx$166 && stx$166.token) {
            ctx$167 = stx$166.context;
            startLineNumber$168 = stx$166.token.lineNumber;
            startLineStart$169 = stx$166.token.lineStart;
            endLineNumber$170 = stx$166.token.lineNumber;
            endLineStart$171 = stx$166.token.lineStart;
            startRange$172 = stx$166.token.range;
            endRange$173 = stx$166.token.range;
        } else {
            ctx$167 = null;
        }
        return syntaxFromToken$109({
            type: parser$87.Token.Delimiter,
            value: val$164,
            inner: inner$165,
            startLineStart: startLineStart$169,
            startLineNumber: startLineNumber$168,
            endLineStart: endLineStart$171,
            endLineNumber: endLineNumber$170,
            startRange: startRange$172,
            endRange: endRange$173
        }, ctx$167);
    }
    function unwrapSyntax$174(stx$175) {
        if (stx$175.token) {
            if (stx$175.token.type === parser$87.Token.Delimiter) {
                return stx$175.token;
            } else {
                return stx$175.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$175);
        }
    }
    exports$84.unwrapSyntax = unwrapSyntax$174;
    exports$84.makeDelim = makeDelim$163;
    exports$84.makePunc = makePunc$160;
    exports$84.makeKeyword = makeKeyword$157;
    exports$84.makeIdent = makeIdent$154;
    exports$84.makeRegex = makeRegex$146;
    exports$84.makeValue = makeValue$143;
    exports$84.Rename = Rename$91;
    exports$84.Mark = Mark$96;
    exports$84.Var = Var$102;
    exports$84.Def = Def$99;
    exports$84.isDef = isDef$107;
    exports$84.isMark = isMark$105;
    exports$84.isRename = isRename$88;
    exports$84.syntaxFromToken = syntaxFromToken$109;
    exports$84.mkSyntax = mkSyntax$129;
    exports$84.tokensToSyntax = tokensToSyntax$140;
    exports$84.syntaxToTokens = syntaxToTokens$137;
}));