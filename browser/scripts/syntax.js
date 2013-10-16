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
    function Rename$103(id$126, name$127, ctx$128, defctx$129) {
        defctx$129 = defctx$129 || null;
        return {
            id: id$126,
            name: name$127,
            context: ctx$128,
            def: defctx$129
        };
    }
    // (Num) -> CContext
    function Mark$104(mark$130, ctx$131) {
        return {
            mark: mark$130,
            context: ctx$131
        };
    }
    function Def$105(defctx$132, ctx$133) {
        return {
            defctx: defctx$132,
            context: ctx$133
        };
    }
    function Var$106(id$134) {
        return { id: id$134 };
    }
    var isRename$107 = function (r$135) {
        return r$135 && typeof r$135.id !== 'undefined' && typeof r$135.name !== 'undefined';
    };
    var isMark$108 = function isMark$108(m$136) {
        return m$136 && typeof m$136.mark !== 'undefined';
    };
    function isDef$109(ctx$137) {
        return ctx$137 && typeof ctx$137.defctx !== 'undefined';
    }
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$110(token$138, oldstx$139) {
        return Object.create({
            mark: function mark$140(newMark$141) {
                if (this.token.inner) {
                    var next$142 = syntaxFromToken$110(this.token, this);
                    next$142.deferredContext = Mark$104(newMark$141, this.deferredContext);
                    return next$142;
                }
                return syntaxFromToken$110(this.token, { context: Mark$104(newMark$141, this.context) });
            },
            rename: function (id$143, name$144) {
                // deferr renaming of delimiters
                if (this.token.inner) {
                    var next$145 = syntaxFromToken$110(this.token, this);
                    next$145.deferredContext = Rename$103(id$143, name$144, this.deferredContext);
                    return next$145;
                }
                if (this.token.type === parser$102.Token.Identifier || this.token.type === parser$102.Token.Keyword) {
                    return syntaxFromToken$110(this.token, { context: Rename$103(id$143, name$144, this.context) });
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$146) {
                if (this.token.inner) {
                    var next$147 = syntaxFromToken$110(this.token, this);
                    next$147.deferredContext = Def$105(defctx$146, this.deferredContext);
                    return next$147;
                }
                return syntaxFromToken$110(this.token, { context: Def$105(defctx$146, this.context) });
            },
            getDefCtx: function () {
                var ctx$148 = this.context;
                while (ctx$148 !== null) {
                    if (isDef$109(ctx$148)) {
                        return ctx$148.defctx;
                    }
                    ctx$148 = ctx$148.context;
                }
                return null;
            },
            expose: function () {
                parser$102.assert(this.token.type === parser$102.Token.Delimiter, 'Only delimiters can be exposed');
                function applyContext$149(stxCtx$150, ctx$151) {
                    if (ctx$151 == null) {
                        return stxCtx$150;
                    } else if (isRename$107(ctx$151)) {
                        return Rename$103(ctx$151.id, ctx$151.name, applyContext$149(stxCtx$150, ctx$151.context));
                    } else if (isMark$108(ctx$151)) {
                        return Mark$104(ctx$151.mark, applyContext$149(stxCtx$150, ctx$151.context));
                    } else if (isDef$109(ctx$151)) {
                        return Def$105(ctx$151.defctx, applyContext$149(stxCtx$150, ctx$151.context));
                    } else {
                        parser$102.assert(false, 'unknown context type');
                    }
                }
                this.token.inner = _$100.map(this.token.inner, _$100.bind(function (stx$152) {
                    if (stx$152.token.inner) {
                        var next$153 = syntaxFromToken$110(stx$152.token, stx$152);
                        next$153.deferredContext = applyContext$149(stx$152.deferredContext, this.deferredContext);
                        return next$153;
                    } else {
                        return syntaxFromToken$110(stx$152.token, { context: applyContext$149(stx$152.context, this.deferredContext) });
                    }
                }, this));
                this.deferredContext = null;
                return this;
            },
            toString: function () {
                var val$154 = this.token.type === parser$102.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$154 + ']';
            }
        }, {
            token: {
                value: token$138,
                enumerable: true,
                configurable: true
            },
            context: {
                value: oldstx$139 && oldstx$139.context ? oldstx$139.context : null,
                writable: true,
                enumerable: true,
                configurable: true
            },
            deferredContext: {
                value: oldstx$139 && oldstx$139.deferredContext ? oldstx$139.deferredContext : null,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
    }
    function mkSyntax$111(stx$155, value$156, type$157, inner$158) {
        if (stx$155 && Array.isArray(stx$155) && stx$155.length === 1) {
            stx$155 = stx$155[0];
        } else if (stx$155 && Array.isArray(stx$155)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$155);
        }
        if (type$157 === parser$102.Token.Delimiter) {
            var startLineNumber$159, startLineStart$160, endLineNumber$161, endLineStart$162, startRange$163, endRange$164;
            if (!Array.isArray(inner$158)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$155 && stx$155.token.type === parser$102.Token.Delimiter) {
                startLineNumber$159 = stx$155.token.startLineNumber;
                startLineStart$160 = stx$155.token.startLineStart;
                endLineNumber$161 = stx$155.token.endLineNumber;
                endLineStart$162 = stx$155.token.endLineStart;
                startRange$163 = stx$155.token.startRange;
                endRange$164 = stx$155.token.endRange;
            } else if (stx$155 && stx$155.token) {
                startLineNumber$159 = stx$155.token.lineNumber;
                startLineStart$160 = stx$155.token.lineStart;
                endLineNumber$161 = stx$155.token.lineNumber;
                endLineStart$162 = stx$155.token.lineStart;
                startRange$163 = stx$155.token.range;
                endRange$164 = stx$155.token.range;
            } else {
                startLineNumber$159 = 0;
                startLineStart$160 = 0;
                endLineNumber$161 = 0;
                endLineStart$162 = 0;
                startRange$163 = [
                    0,
                    0
                ];
                endRange$164 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$110({
                type: parser$102.Token.Delimiter,
                value: value$156,
                inner: inner$158,
                startLineStart: startLineStart$160,
                startLineNumber: startLineNumber$159,
                endLineStart: endLineStart$162,
                endLineNumber: endLineNumber$161,
                startRange: startRange$163,
                endRange: endRange$164
            }, stx$155);
        } else {
            var lineStart$165, lineNumber$166, range$167;
            if (stx$155 && stx$155.token.type === parser$102.Token.Delimiter) {
                lineStart$165 = stx$155.token.startLineStart;
                lineNumber$166 = stx$155.token.startLineNumber;
                range$167 = stx$155.token.startRange;
            } else if (stx$155 && stx$155.token) {
                lineStart$165 = stx$155.token.lineStart;
                lineNumber$166 = stx$155.token.lineNumber;
                range$167 = stx$155.token.range;
            } else {
                lineStart$165 = 0;
                lineNumber$166 = 0;
                range$167 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$110({
                type: type$157,
                value: value$156,
                lineStart: lineStart$165,
                lineNumber: lineNumber$166,
                range: range$167
            }, stx$155);
        }
    }
    function makeValue$112(val$168, stx$169) {
        if (typeof val$168 === 'boolean') {
            return mkSyntax$111(stx$169, val$168 ? 'true' : 'false', parser$102.Token.BooleanLiteral);
        } else if (typeof val$168 === 'number') {
            if (val$168 !== val$168) {
                return makeDelim$117('()', [
                    makeValue$112(0, stx$169),
                    makePunc$116('/', stx$169),
                    makeValue$112(0, stx$169)
                ], stx$169);
            }
            if (val$168 < 0) {
                return makeDelim$117('()', [
                    makePunc$116('-', stx$169),
                    makeValue$112(Math.abs(val$168), stx$169)
                ], stx$169);
            } else {
                return mkSyntax$111(stx$169, val$168, parser$102.Token.NumericLiteral);
            }
        } else if (typeof val$168 === 'string') {
            return mkSyntax$111(stx$169, val$168, parser$102.Token.StringLiteral);
        } else if (val$168 === null) {
            return mkSyntax$111(stx$169, 'null', parser$102.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$168);
        }
    }
    function makeRegex$113(val$170, flags$171, stx$172) {
        var newstx$173 = mkSyntax$111(stx$172, new RegExp(val$170, flags$171), parser$102.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$173.token.literal = val$170;
        return newstx$173;
    }
    function makeIdent$114(val$174, stx$175) {
        return mkSyntax$111(stx$175, val$174, parser$102.Token.Identifier);
    }
    function makeKeyword$115(val$176, stx$177) {
        return mkSyntax$111(stx$177, val$176, parser$102.Token.Keyword);
    }
    function makePunc$116(val$178, stx$179) {
        return mkSyntax$111(stx$179, val$178, parser$102.Token.Punctuator);
    }
    function makeDelim$117(val$180, inner$181, stx$182) {
        return mkSyntax$111(stx$182, val$180, parser$102.Token.Delimiter, inner$181);
    }
    function unwrapSyntax$118(stx$183) {
        if (Array.isArray(stx$183) && stx$183.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$183 = stx$183[0];
        }
        if (stx$183.token) {
            if (stx$183.token.type === parser$102.Token.Delimiter) {
                return stx$183.token;
            } else {
                return stx$183.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$183);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$119(stx$184) {
        return _$100.map(stx$184, function (stx$185) {
            if (stx$185.token.inner) {
                stx$185.token.inner = syntaxToTokens$119(stx$185.token.inner);
            }
            return stx$185.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$120(tokens$186) {
        if (!_$100.isArray(tokens$186)) {
            tokens$186 = [tokens$186];
        }
        return _$100.map(tokens$186, function (token$187) {
            if (token$187.inner) {
                token$187.inner = tokensToSyntax$120(token$187.inner);
            }
            return syntaxFromToken$110(token$187);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$121(tojoin$188, punc$189) {
        if (tojoin$188.length === 0) {
            return [];
        }
        if (punc$189 === ' ') {
            return tojoin$188;
        }
        return _$100.reduce(_$100.rest(tojoin$188, 1), function (acc$190, join$191) {
            return acc$190.concat(makePunc$116(punc$189, join$191), join$191);
        }, [_$100.first(tojoin$188)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$122(tojoin$192, punc$193) {
        if (tojoin$192.length === 0) {
            return [];
        }
        if (punc$193 === ' ') {
            return _$100.flatten(tojoin$192, true);
        }
        return _$100.reduce(_$100.rest(tojoin$192, 1), function (acc$194, join$195) {
            return acc$194.concat(makePunc$116(punc$193, _$100.first(join$195)), join$195);
        }, _$100.first(tojoin$192));
    }
    function MacroSyntaxError$123(name$196, message$197, stx$198) {
        this.name = name$196;
        this.message = message$197;
        this.stx = stx$198;
    }
    function throwSyntaxError$124(name$199, message$200, stx$201) {
        if (stx$201 && Array.isArray(stx$201)) {
            stx$201 = stx$201[0];
        }
        throw new MacroSyntaxError$123(name$199, message$200, stx$201);
    }
    function printSyntaxError$125(code$202, err$203) {
        if (!err$203.stx) {
            return '[' + err$203.name + '] ' + err$203.message;
        }
        var token$204 = err$203.stx.token;
        var lineNumber$205 = token$204.startLineNumber || token$204.lineNumber;
        var lineStart$206 = token$204.startLineStart || token$204.lineStart;
        var start$207 = token$204.range[0];
        var offset$208 = start$207 - lineStart$206;
        var line$209 = '';
        var pre$210 = lineNumber$205 + ': ';
        var ch$211;
        while (ch$211 = code$202.charAt(lineStart$206++)) {
            if (ch$211 == '\r' || ch$211 == '\n') {
                break;
            }
            line$209 += ch$211;
        }
        return '[' + err$203.name + '] ' + err$203.message + '\n' + pre$210 + line$209 + '\n' + Array(offset$208 + pre$210.length).join(' ') + ' ^';
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
    exports$99.MacroSyntaxError = MacroSyntaxError$123;
    exports$99.throwSyntaxError = throwSyntaxError$124;
    exports$99.printSyntaxError = printSyntaxError$125;
}));