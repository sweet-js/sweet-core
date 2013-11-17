(function (root$111, factory$112) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$112(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$112);
    }
}(this, function (exports$113, _$114, es6$115, parser$116) {
    // (CSyntax, Str) -> CContext
    function Rename$117(id$141, name$142, ctx$143, defctx$144) {
        defctx$144 = defctx$144 || null;
        return {
            id: id$141,
            name: name$142,
            context: ctx$143,
            def: defctx$144
        };
    }
    // (Num) -> CContext
    function Mark$118(mark$145, ctx$146) {
        return {
            mark: mark$145,
            context: ctx$146
        };
    }
    function Def$119(defctx$147, ctx$148) {
        return {
            defctx: defctx$147,
            context: ctx$148
        };
    }
    function Var$120(id$149) {
        return { id: id$149 };
    }
    function isRename$121(r$150) {
        return r$150 && typeof r$150.id !== 'undefined' && typeof r$150.name !== 'undefined';
    }
    ;
    function isMark$122(m$151) {
        return m$151 && typeof m$151.mark !== 'undefined';
    }
    ;
    function isDef$123(ctx$152) {
        return ctx$152 && typeof ctx$152.defctx !== 'undefined';
    }
    function Syntax$124(token$153, oldstx$154) {
        this.token = token$153;
        this.context = oldstx$154 && oldstx$154.context ? oldstx$154.context : null;
        this.deferredContext = oldstx$154 && oldstx$154.deferredContext ? oldstx$154.deferredContext : null;
    }
    Syntax$124.prototype = {
        mark: function (newMark$155) {
            if (this.token.inner) {
                var next$156 = syntaxFromToken$125(this.token, this);
                next$156.deferredContext = Mark$118(newMark$155, this.deferredContext);
                return next$156;
            }
            return syntaxFromToken$125(this.token, { context: Mark$118(newMark$155, this.context) });
        },
        rename: function (id$157, name$158, defctx$159) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$160 = syntaxFromToken$125(this.token, this);
                next$160.deferredContext = Rename$117(id$157, name$158, this.deferredContext, defctx$159);
                return next$160;
            }
            if (this.token.type === parser$116.Token.Identifier || this.token.type === parser$116.Token.Keyword) {
                return syntaxFromToken$125(this.token, { context: Rename$117(id$157, name$158, this.context, defctx$159) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$161) {
            if (this.token.inner) {
                var next$162 = syntaxFromToken$125(this.token, this);
                next$162.deferredContext = Def$119(defctx$161, this.deferredContext);
                return next$162;
            }
            return syntaxFromToken$125(this.token, { context: Def$119(defctx$161, this.context) });
        },
        getDefCtx: function () {
            var ctx$163 = this.context;
            while (ctx$163 !== null) {
                if (isDef$123(ctx$163)) {
                    return ctx$163.defctx;
                }
                ctx$163 = ctx$163.context;
            }
            return null;
        },
        expose: function () {
            parser$116.assert(this.token.type === parser$116.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$164(stxCtx$165, ctx$166) {
                if (ctx$166 == null) {
                    return stxCtx$165;
                } else if (isRename$121(ctx$166)) {
                    return Rename$117(ctx$166.id, ctx$166.name, applyContext$164(stxCtx$165, ctx$166.context), ctx$166.def);
                } else if (isMark$122(ctx$166)) {
                    return Mark$118(ctx$166.mark, applyContext$164(stxCtx$165, ctx$166.context));
                } else if (isDef$123(ctx$166)) {
                    return Def$119(ctx$166.defctx, applyContext$164(stxCtx$165, ctx$166.context));
                } else {
                    parser$116.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$114.map(this.token.inner, _$114.bind(function (stx$167) {
                if (stx$167.token.inner) {
                    var next$168 = syntaxFromToken$125(stx$167.token, stx$167);
                    next$168.deferredContext = applyContext$164(stx$167.deferredContext, this.deferredContext);
                    return next$168;
                } else {
                    return syntaxFromToken$125(stx$167.token, { context: applyContext$164(stx$167.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$169 = this.token.type === parser$116.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$169 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$125(token$170, oldstx$171) {
        return new Syntax$124(token$170, oldstx$171);
    }
    function mkSyntax$126(stx$172, value$173, type$174, inner$175) {
        if (stx$172 && Array.isArray(stx$172) && stx$172.length === 1) {
            stx$172 = stx$172[0];
        } else if (stx$172 && Array.isArray(stx$172)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$172);
        }
        if (type$174 === parser$116.Token.Delimiter) {
            var startLineNumber$176, startLineStart$177, endLineNumber$178, endLineStart$179, startRange$180, endRange$181;
            if (!Array.isArray(inner$175)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$172 && stx$172.token.type === parser$116.Token.Delimiter) {
                startLineNumber$176 = stx$172.token.startLineNumber;
                startLineStart$177 = stx$172.token.startLineStart;
                endLineNumber$178 = stx$172.token.endLineNumber;
                endLineStart$179 = stx$172.token.endLineStart;
                startRange$180 = stx$172.token.startRange;
                endRange$181 = stx$172.token.endRange;
            } else if (stx$172 && stx$172.token) {
                startLineNumber$176 = stx$172.token.lineNumber;
                startLineStart$177 = stx$172.token.lineStart;
                endLineNumber$178 = stx$172.token.lineNumber;
                endLineStart$179 = stx$172.token.lineStart;
                startRange$180 = stx$172.token.range;
                endRange$181 = stx$172.token.range;
            } else {
                startLineNumber$176 = 0;
                startLineStart$177 = 0;
                endLineNumber$178 = 0;
                endLineStart$179 = 0;
                startRange$180 = [
                    0,
                    0
                ];
                endRange$181 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$125({
                type: parser$116.Token.Delimiter,
                value: value$173,
                inner: inner$175,
                startLineStart: startLineStart$177,
                startLineNumber: startLineNumber$176,
                endLineStart: endLineStart$179,
                endLineNumber: endLineNumber$178,
                startRange: startRange$180,
                endRange: endRange$181
            }, stx$172);
        } else {
            var lineStart$182, lineNumber$183, range$184;
            if (stx$172 && stx$172.token.type === parser$116.Token.Delimiter) {
                lineStart$182 = stx$172.token.startLineStart;
                lineNumber$183 = stx$172.token.startLineNumber;
                range$184 = stx$172.token.startRange;
            } else if (stx$172 && stx$172.token) {
                lineStart$182 = stx$172.token.lineStart;
                lineNumber$183 = stx$172.token.lineNumber;
                range$184 = stx$172.token.range;
            } else {
                lineStart$182 = 0;
                lineNumber$183 = 0;
                range$184 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$125({
                type: type$174,
                value: value$173,
                lineStart: lineStart$182,
                lineNumber: lineNumber$183,
                range: range$184
            }, stx$172);
        }
    }
    function makeValue$127(val$185, stx$186) {
        if (typeof val$185 === 'boolean') {
            return mkSyntax$126(stx$186, val$185 ? 'true' : 'false', parser$116.Token.BooleanLiteral);
        } else if (typeof val$185 === 'number') {
            if (val$185 !== val$185) {
                return makeDelim$132('()', [
                    makeValue$127(0, stx$186),
                    makePunc$131('/', stx$186),
                    makeValue$127(0, stx$186)
                ], stx$186);
            }
            if (val$185 < 0) {
                return makeDelim$132('()', [
                    makePunc$131('-', stx$186),
                    makeValue$127(Math.abs(val$185), stx$186)
                ], stx$186);
            } else {
                return mkSyntax$126(stx$186, val$185, parser$116.Token.NumericLiteral);
            }
        } else if (typeof val$185 === 'string') {
            return mkSyntax$126(stx$186, val$185, parser$116.Token.StringLiteral);
        } else if (val$185 === null) {
            return mkSyntax$126(stx$186, 'null', parser$116.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$185);
        }
    }
    function makeRegex$128(val$187, flags$188, stx$189) {
        var newstx$190 = mkSyntax$126(stx$189, new RegExp(val$187, flags$188), parser$116.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$190.token.literal = val$187;
        return newstx$190;
    }
    function makeIdent$129(val$191, stx$192) {
        return mkSyntax$126(stx$192, val$191, parser$116.Token.Identifier);
    }
    function makeKeyword$130(val$193, stx$194) {
        return mkSyntax$126(stx$194, val$193, parser$116.Token.Keyword);
    }
    function makePunc$131(val$195, stx$196) {
        return mkSyntax$126(stx$196, val$195, parser$116.Token.Punctuator);
    }
    function makeDelim$132(val$197, inner$198, stx$199) {
        return mkSyntax$126(stx$199, val$197, parser$116.Token.Delimiter, inner$198);
    }
    function unwrapSyntax$133(stx$200) {
        if (Array.isArray(stx$200) && stx$200.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$200 = stx$200[0];
        }
        if (stx$200.token) {
            if (stx$200.token.type === parser$116.Token.Delimiter) {
                return stx$200.token;
            } else {
                return stx$200.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$200);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$134(stx$201) {
        return _$114.map(stx$201, function (stx$202) {
            if (stx$202.token.inner) {
                stx$202.token.inner = syntaxToTokens$134(stx$202.token.inner);
            }
            return stx$202.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$135(tokens$203) {
        if (!_$114.isArray(tokens$203)) {
            tokens$203 = [tokens$203];
        }
        return _$114.map(tokens$203, function (token$204) {
            if (token$204.inner) {
                token$204.inner = tokensToSyntax$135(token$204.inner);
            }
            return syntaxFromToken$125(token$204);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$136(tojoin$205, punc$206) {
        if (tojoin$205.length === 0) {
            return [];
        }
        if (punc$206 === ' ') {
            return tojoin$205;
        }
        return _$114.reduce(_$114.rest(tojoin$205, 1), function (acc$207, join$208) {
            return acc$207.concat(makePunc$131(punc$206, join$208), join$208);
        }, [_$114.first(tojoin$205)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$137(tojoin$209, punc$210) {
        if (tojoin$209.length === 0) {
            return [];
        }
        if (punc$210 === ' ') {
            return _$114.flatten(tojoin$209, true);
        }
        return _$114.reduce(_$114.rest(tojoin$209, 1), function (acc$211, join$212) {
            return acc$211.concat(makePunc$131(punc$210, _$114.first(join$212)), join$212);
        }, _$114.first(tojoin$209));
    }
    function MacroSyntaxError$138(name$213, message$214, stx$215) {
        this.name = name$213;
        this.message = message$214;
        this.stx = stx$215;
    }
    function throwSyntaxError$139(name$216, message$217, stx$218) {
        if (stx$218 && Array.isArray(stx$218)) {
            stx$218 = stx$218[0];
        }
        throw new MacroSyntaxError$138(name$216, message$217, stx$218);
    }
    function printSyntaxError$140(code$219, err$220) {
        if (!err$220.stx) {
            return '[' + err$220.name + '] ' + err$220.message;
        }
        var token$221 = err$220.stx.token;
        var lineNumber$222 = token$221.startLineNumber || token$221.lineNumber;
        var lineStart$223 = token$221.startLineStart || token$221.lineStart;
        var start$224 = token$221.range[0];
        var offset$225 = start$224 - lineStart$223;
        var line$226 = '';
        var pre$227 = lineNumber$222 + ': ';
        var ch$228;
        while (ch$228 = code$219.charAt(lineStart$223++)) {
            if (ch$228 == '\r' || ch$228 == '\n') {
                break;
            }
            line$226 += ch$228;
        }
        return '[' + err$220.name + '] ' + err$220.message + '\n' + pre$227 + line$226 + '\n' + Array(offset$225 + pre$227.length).join(' ') + ' ^';
    }
    exports$113.unwrapSyntax = unwrapSyntax$133;
    exports$113.makeDelim = makeDelim$132;
    exports$113.makePunc = makePunc$131;
    exports$113.makeKeyword = makeKeyword$130;
    exports$113.makeIdent = makeIdent$129;
    exports$113.makeRegex = makeRegex$128;
    exports$113.makeValue = makeValue$127;
    exports$113.Rename = Rename$117;
    exports$113.Mark = Mark$118;
    exports$113.Var = Var$120;
    exports$113.Def = Def$119;
    exports$113.isDef = isDef$123;
    exports$113.isMark = isMark$122;
    exports$113.isRename = isRename$121;
    exports$113.syntaxFromToken = syntaxFromToken$125;
    exports$113.tokensToSyntax = tokensToSyntax$135;
    exports$113.syntaxToTokens = syntaxToTokens$134;
    exports$113.joinSyntax = joinSyntax$136;
    exports$113.joinSyntaxArr = joinSyntaxArr$137;
    exports$113.MacroSyntaxError = MacroSyntaxError$138;
    exports$113.throwSyntaxError = throwSyntaxError$139;
    exports$113.printSyntaxError = printSyntaxError$140;
}));