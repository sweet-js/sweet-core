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
        rename: function (id$157, name$158) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$159 = syntaxFromToken$125(this.token, this);
                next$159.deferredContext = Rename$117(id$157, name$158, this.deferredContext);
                return next$159;
            }
            if (this.token.type === parser$116.Token.Identifier || this.token.type === parser$116.Token.Keyword) {
                return syntaxFromToken$125(this.token, { context: Rename$117(id$157, name$158, this.context) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$160) {
            if (this.token.inner) {
                var next$161 = syntaxFromToken$125(this.token, this);
                next$161.deferredContext = Def$119(defctx$160, this.deferredContext);
                return next$161;
            }
            return syntaxFromToken$125(this.token, { context: Def$119(defctx$160, this.context) });
        },
        getDefCtx: function () {
            var ctx$162 = this.context;
            while (ctx$162 !== null) {
                if (isDef$123(ctx$162)) {
                    return ctx$162.defctx;
                }
                ctx$162 = ctx$162.context;
            }
            return null;
        },
        expose: function () {
            parser$116.assert(this.token.type === parser$116.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$163(stxCtx$164, ctx$165) {
                if (ctx$165 == null) {
                    return stxCtx$164;
                } else if (isRename$121(ctx$165)) {
                    return Rename$117(ctx$165.id, ctx$165.name, applyContext$163(stxCtx$164, ctx$165.context));
                } else if (isMark$122(ctx$165)) {
                    return Mark$118(ctx$165.mark, applyContext$163(stxCtx$164, ctx$165.context));
                } else if (isDef$123(ctx$165)) {
                    return Def$119(ctx$165.defctx, applyContext$163(stxCtx$164, ctx$165.context));
                } else {
                    parser$116.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$114.map(this.token.inner, _$114.bind(function (stx$166) {
                if (stx$166.token.inner) {
                    var next$167 = syntaxFromToken$125(stx$166.token, stx$166);
                    next$167.deferredContext = applyContext$163(stx$166.deferredContext, this.deferredContext);
                    return next$167;
                } else {
                    return syntaxFromToken$125(stx$166.token, { context: applyContext$163(stx$166.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$168 = this.token.type === parser$116.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$168 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$125(token$169, oldstx$170) {
        return new Syntax$124(token$169, oldstx$170);
    }
    function mkSyntax$126(stx$171, value$172, type$173, inner$174) {
        if (stx$171 && Array.isArray(stx$171) && stx$171.length === 1) {
            stx$171 = stx$171[0];
        } else if (stx$171 && Array.isArray(stx$171)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$171);
        }
        if (type$173 === parser$116.Token.Delimiter) {
            var startLineNumber$175, startLineStart$176, endLineNumber$177, endLineStart$178, startRange$179, endRange$180;
            if (!Array.isArray(inner$174)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$171 && stx$171.token.type === parser$116.Token.Delimiter) {
                startLineNumber$175 = stx$171.token.startLineNumber;
                startLineStart$176 = stx$171.token.startLineStart;
                endLineNumber$177 = stx$171.token.endLineNumber;
                endLineStart$178 = stx$171.token.endLineStart;
                startRange$179 = stx$171.token.startRange;
                endRange$180 = stx$171.token.endRange;
            } else if (stx$171 && stx$171.token) {
                startLineNumber$175 = stx$171.token.lineNumber;
                startLineStart$176 = stx$171.token.lineStart;
                endLineNumber$177 = stx$171.token.lineNumber;
                endLineStart$178 = stx$171.token.lineStart;
                startRange$179 = stx$171.token.range;
                endRange$180 = stx$171.token.range;
            } else {
                startLineNumber$175 = 0;
                startLineStart$176 = 0;
                endLineNumber$177 = 0;
                endLineStart$178 = 0;
                startRange$179 = [
                    0,
                    0
                ];
                endRange$180 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$125({
                type: parser$116.Token.Delimiter,
                value: value$172,
                inner: inner$174,
                startLineStart: startLineStart$176,
                startLineNumber: startLineNumber$175,
                endLineStart: endLineStart$178,
                endLineNumber: endLineNumber$177,
                startRange: startRange$179,
                endRange: endRange$180
            }, stx$171);
        } else {
            var lineStart$181, lineNumber$182, range$183;
            if (stx$171 && stx$171.token.type === parser$116.Token.Delimiter) {
                lineStart$181 = stx$171.token.startLineStart;
                lineNumber$182 = stx$171.token.startLineNumber;
                range$183 = stx$171.token.startRange;
            } else if (stx$171 && stx$171.token) {
                lineStart$181 = stx$171.token.lineStart;
                lineNumber$182 = stx$171.token.lineNumber;
                range$183 = stx$171.token.range;
            } else {
                lineStart$181 = 0;
                lineNumber$182 = 0;
                range$183 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$125({
                type: type$173,
                value: value$172,
                lineStart: lineStart$181,
                lineNumber: lineNumber$182,
                range: range$183
            }, stx$171);
        }
    }
    function makeValue$127(val$184, stx$185) {
        if (typeof val$184 === 'boolean') {
            return mkSyntax$126(stx$185, val$184 ? 'true' : 'false', parser$116.Token.BooleanLiteral);
        } else if (typeof val$184 === 'number') {
            if (val$184 !== val$184) {
                return makeDelim$132('()', [
                    makeValue$127(0, stx$185),
                    makePunc$131('/', stx$185),
                    makeValue$127(0, stx$185)
                ], stx$185);
            }
            if (val$184 < 0) {
                return makeDelim$132('()', [
                    makePunc$131('-', stx$185),
                    makeValue$127(Math.abs(val$184), stx$185)
                ], stx$185);
            } else {
                return mkSyntax$126(stx$185, val$184, parser$116.Token.NumericLiteral);
            }
        } else if (typeof val$184 === 'string') {
            return mkSyntax$126(stx$185, val$184, parser$116.Token.StringLiteral);
        } else if (val$184 === null) {
            return mkSyntax$126(stx$185, 'null', parser$116.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$184);
        }
    }
    function makeRegex$128(val$186, flags$187, stx$188) {
        var newstx$189 = mkSyntax$126(stx$188, new RegExp(val$186, flags$187), parser$116.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$189.token.literal = val$186;
        return newstx$189;
    }
    function makeIdent$129(val$190, stx$191) {
        return mkSyntax$126(stx$191, val$190, parser$116.Token.Identifier);
    }
    function makeKeyword$130(val$192, stx$193) {
        return mkSyntax$126(stx$193, val$192, parser$116.Token.Keyword);
    }
    function makePunc$131(val$194, stx$195) {
        return mkSyntax$126(stx$195, val$194, parser$116.Token.Punctuator);
    }
    function makeDelim$132(val$196, inner$197, stx$198) {
        return mkSyntax$126(stx$198, val$196, parser$116.Token.Delimiter, inner$197);
    }
    function unwrapSyntax$133(stx$199) {
        if (Array.isArray(stx$199) && stx$199.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$199 = stx$199[0];
        }
        if (stx$199.token) {
            if (stx$199.token.type === parser$116.Token.Delimiter) {
                return stx$199.token;
            } else {
                return stx$199.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$199);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$134(stx$200) {
        return _$114.map(stx$200, function (stx$201) {
            if (stx$201.token.inner) {
                stx$201.token.inner = syntaxToTokens$134(stx$201.token.inner);
            }
            return stx$201.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$135(tokens$202) {
        if (!_$114.isArray(tokens$202)) {
            tokens$202 = [tokens$202];
        }
        return _$114.map(tokens$202, function (token$203) {
            if (token$203.inner) {
                token$203.inner = tokensToSyntax$135(token$203.inner);
            }
            return syntaxFromToken$125(token$203);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$136(tojoin$204, punc$205) {
        if (tojoin$204.length === 0) {
            return [];
        }
        if (punc$205 === ' ') {
            return tojoin$204;
        }
        return _$114.reduce(_$114.rest(tojoin$204, 1), function (acc$206, join$207) {
            return acc$206.concat(makePunc$131(punc$205, join$207), join$207);
        }, [_$114.first(tojoin$204)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$137(tojoin$208, punc$209) {
        if (tojoin$208.length === 0) {
            return [];
        }
        if (punc$209 === ' ') {
            return _$114.flatten(tojoin$208, true);
        }
        return _$114.reduce(_$114.rest(tojoin$208, 1), function (acc$210, join$211) {
            return acc$210.concat(makePunc$131(punc$209, _$114.first(join$211)), join$211);
        }, _$114.first(tojoin$208));
    }
    function MacroSyntaxError$138(name$212, message$213, stx$214) {
        this.name = name$212;
        this.message = message$213;
        this.stx = stx$214;
    }
    function throwSyntaxError$139(name$215, message$216, stx$217) {
        if (stx$217 && Array.isArray(stx$217)) {
            stx$217 = stx$217[0];
        }
        throw new MacroSyntaxError$138(name$215, message$216, stx$217);
    }
    function printSyntaxError$140(code$218, err$219) {
        if (!err$219.stx) {
            return '[' + err$219.name + '] ' + err$219.message;
        }
        var token$220 = err$219.stx.token;
        var lineNumber$221 = token$220.startLineNumber || token$220.lineNumber;
        var lineStart$222 = token$220.startLineStart || token$220.lineStart;
        var start$223 = token$220.range[0];
        var offset$224 = start$223 - lineStart$222;
        var line$225 = '';
        var pre$226 = lineNumber$221 + ': ';
        var ch$227;
        while (ch$227 = code$218.charAt(lineStart$222++)) {
            if (ch$227 == '\r' || ch$227 == '\n') {
                break;
            }
            line$225 += ch$227;
        }
        return '[' + err$219.name + '] ' + err$219.message + '\n' + pre$226 + line$225 + '\n' + Array(offset$224 + pre$226.length).join(' ') + ' ^';
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