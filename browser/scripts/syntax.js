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
    function Rename$103(id$123, name$124, ctx$125, defctx$126) {
        defctx$126 = defctx$126 || null;
        return {
            id: id$123,
            name: name$124,
            context: ctx$125,
            def: defctx$126
        };
    }
    // (Num) -> CContext
    function Mark$104(mark$127, ctx$128) {
        return {
            mark: mark$127,
            context: ctx$128
        };
    }
    function Def$105(defctx$129, ctx$130) {
        return {
            defctx: defctx$129,
            context: ctx$130
        };
    }
    function Var$106(id$131) {
        return { id: id$131 };
    }
    var isRename$107 = function (r$132) {
        return r$132 && typeof r$132.id !== 'undefined' && typeof r$132.name !== 'undefined';
    };
    var isMark$108 = function isMark$108(m$133) {
        return m$133 && typeof m$133.mark !== 'undefined';
    };
    function isDef$109(ctx$134) {
        return ctx$134 && typeof ctx$134.defctx !== 'undefined';
    }
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$110(token$135, oldstx$136) {
        return Object.create({
            mark: function mark$137(newMark$138) {
                if (this.token.inner) {
                    var next$139 = syntaxFromToken$110(this.token, this);
                    next$139.deferredContext = Mark$104(newMark$138, this.deferredContext);
                    return next$139;
                }
                return syntaxFromToken$110(this.token, { context: Mark$104(newMark$138, this.context) });
            },
            rename: function (id$140, name$141) {
                // deferr renaming of delimiters
                if (this.token.inner) {
                    var next$142 = syntaxFromToken$110(this.token, this);
                    next$142.deferredContext = Rename$103(id$140, name$141, this.deferredContext);
                    return next$142;
                }
                if (this.token.type === parser$102.Token.Identifier || this.token.type === parser$102.Token.Keyword) {
                    return syntaxFromToken$110(this.token, { context: Rename$103(id$140, name$141, this.context) });
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$143) {
                if (this.token.inner) {
                    var next$144 = syntaxFromToken$110(this.token, this);
                    next$144.deferredContext = Def$105(defctx$143, this.deferredContext);
                    return next$144;
                }
                return syntaxFromToken$110(this.token, { context: Def$105(defctx$143, this.context) });
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
                        var next$150 = syntaxFromToken$110(stx$149.token, stx$149);
                        next$150.deferredContext = applyContext$146(stx$149.deferredContext, this.deferredContext);
                        return next$150;
                    } else {
                        return syntaxFromToken$110(stx$149.token, { context: applyContext$146(stx$149.context, this.deferredContext) });
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
                value: token$135,
                enumerable: true,
                configurable: true
            },
            context: {
                value: oldstx$136 && oldstx$136.context ? oldstx$136.context : null,
                writable: true,
                enumerable: true,
                configurable: true
            },
            deferredContext: {
                value: oldstx$136 && oldstx$136.deferredContext ? oldstx$136.deferredContext : null,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
    }
    function mkSyntax$111(stx$152, value$153, type$154, inner$155) {
        if (stx$152 && Array.isArray(stx$152) && stx$152.length === 1) {
            stx$152 = stx$152[0];
        } else if (stx$152 && Array.isArray(stx$152)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$152);
        }
        if (type$154 === parser$102.Token.Delimiter) {
            var startLineNumber$156, startLineStart$157, endLineNumber$158, endLineStart$159, startRange$160, endRange$161;
            if (!Array.isArray(inner$155)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$152 && stx$152.token.type === parser$102.Token.Delimiter) {
                startLineNumber$156 = stx$152.token.startLineNumber;
                startLineStart$157 = stx$152.token.startLineStart;
                endLineNumber$158 = stx$152.token.endLineNumber;
                endLineStart$159 = stx$152.token.endLineStart;
                startRange$160 = stx$152.token.startRange;
                endRange$161 = stx$152.token.endRange;
            } else if (stx$152 && stx$152.token) {
                startLineNumber$156 = stx$152.token.lineNumber;
                startLineStart$157 = stx$152.token.lineStart;
                endLineNumber$158 = stx$152.token.lineNumber;
                endLineStart$159 = stx$152.token.lineStart;
                startRange$160 = stx$152.token.range;
                endRange$161 = stx$152.token.range;
            } else {
                startLineNumber$156 = 0;
                startLineStart$157 = 0;
                endLineNumber$158 = 0;
                endLineStart$159 = 0;
                startRange$160 = [
                    0,
                    0
                ];
                endRange$161 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$110({
                type: parser$102.Token.Delimiter,
                value: value$153,
                inner: inner$155,
                startLineStart: startLineStart$157,
                startLineNumber: startLineNumber$156,
                endLineStart: endLineStart$159,
                endLineNumber: endLineNumber$158,
                startRange: startRange$160,
                endRange: endRange$161
            }, stx$152);
        } else {
            var lineStart$162, lineNumber$163, range$164;
            if (stx$152 && stx$152.token.type === parser$102.Token.Delimiter) {
                lineStart$162 = stx$152.token.startLineStart;
                lineNumber$163 = stx$152.token.startLineNumber;
                range$164 = stx$152.token.startRange;
            } else if (stx$152 && stx$152.token) {
                lineStart$162 = stx$152.token.lineStart;
                lineNumber$163 = stx$152.token.lineNumber;
                range$164 = stx$152.token.range;
            } else {
                lineStart$162 = 0;
                lineNumber$163 = 0;
                range$164 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$110({
                type: type$154,
                value: value$153,
                lineStart: lineStart$162,
                lineNumber: lineNumber$163,
                range: range$164
            }, stx$152);
        }
    }
    function makeValue$112(val$165, stx$166) {
        if (typeof val$165 === 'boolean') {
            return mkSyntax$111(stx$166, val$165 ? 'true' : 'false', parser$102.Token.BooleanLiteral);
        } else if (typeof val$165 === 'number') {
            return mkSyntax$111(stx$166, val$165, parser$102.Token.NumericLiteral);
        } else if (typeof val$165 === 'string') {
            return mkSyntax$111(stx$166, val$165, parser$102.Token.StringLiteral);
        } else if (val$165 === null) {
            return mkSyntax$111(stx$166, 'null', parser$102.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$165);
        }
    }
    function makeRegex$113(val$167, flags$168, stx$169) {
        var newstx$170 = mkSyntax$111(stx$169, new RegExp(val$167, flags$168), parser$102.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$170.token.literal = val$167;
        return newstx$170;
    }
    function makeIdent$114(val$171, stx$172) {
        return mkSyntax$111(stx$172, val$171, parser$102.Token.Identifier);
    }
    function makeKeyword$115(val$173, stx$174) {
        return mkSyntax$111(stx$174, val$173, parser$102.Token.Keyword);
    }
    function makePunc$116(val$175, stx$176) {
        return mkSyntax$111(stx$176, val$175, parser$102.Token.Punctuator);
    }
    function makeDelim$117(val$177, inner$178, stx$179) {
        return mkSyntax$111(stx$179, val$177, parser$102.Token.Delimiter, inner$178);
    }
    function unwrapSyntax$118(stx$180) {
        if (stx$180.token) {
            if (stx$180.token.type === parser$102.Token.Delimiter) {
                return stx$180.token;
            } else {
                return stx$180.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$180);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$119(stx$181) {
        return _$100.map(stx$181, function (stx$182) {
            if (stx$182.token.inner) {
                stx$182.token.inner = syntaxToTokens$119(stx$182.token.inner);
            }
            return stx$182.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$120(tokens$183) {
        if (!_$100.isArray(tokens$183)) {
            tokens$183 = [tokens$183];
        }
        return _$100.map(tokens$183, function (token$184) {
            if (token$184.inner) {
                token$184.inner = tokensToSyntax$120(token$184.inner);
            }
            return syntaxFromToken$110(token$184);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$121(tojoin$185, punc$186) {
        if (tojoin$185.length === 0) {
            return [];
        }
        if (punc$186 === ' ') {
            return tojoin$185;
        }
        return _$100.reduce(_$100.rest(tojoin$185, 1), function (acc$187, join$188) {
            return acc$187.concat(makePunc$116(punc$186, join$188), join$188);
        }, [_$100.first(tojoin$185)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$122(tojoin$189, punc$190) {
        if (tojoin$189.length === 0) {
            return [];
        }
        if (punc$190 === ' ') {
            return _$100.flatten(tojoin$189, true);
        }
        return _$100.reduce(_$100.rest(tojoin$189, 1), function (acc$191, join$192) {
            return acc$191.concat(makePunc$116(punc$190, _$100.first(join$192)), join$192);
        }, _$100.first(tojoin$189));
    }
    exports$99.unwrapSyntax = unwrapSyntax$118;
    exports$99.makeDelim = makeDelim$117;
    exports$99.makePunc = makePunc$116;
    exports$99.makeKeyword = makeKeyword$115;
    exports$99.makeIdent = makeIdent$114;
    exports$99.makeRegex = makeRegex$113;
    exports$99.makeValue = makeValue$112;
    exports$99.Rename = Rename$103;
    exports$99.Mark = Mark$104;
    exports$99.Var = Var$106;
    exports$99.Def = Def$105;
    exports$99.isDef = isDef$109;
    exports$99.isMark = isMark$108;
    exports$99.isRename = isRename$107;
    exports$99.syntaxFromToken = syntaxFromToken$110;
    exports$99.tokensToSyntax = tokensToSyntax$120;
    exports$99.syntaxToTokens = syntaxToTokens$119;
    exports$99.joinSyntax = joinSyntax$121;
    exports$99.joinSyntaxArr = joinSyntaxArr$122;
}));