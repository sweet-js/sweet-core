(function (root$186, factory$187) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$187(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$187);
    }
}(this, function (exports$188, _$189, es6$190, parser$191) {
    function Rename$192(id$211, name$212, ctx$213, defctx$214) {
        defctx$214 = defctx$214 || null;
        return {
            id: id$211,
            name: name$212,
            context: ctx$213,
            def: defctx$214
        };
    }
    // (Num) -> CContext
    function Mark$193(mark$215, ctx$216) {
        return {
            mark: mark$215,
            context: ctx$216
        };
    }
    function Def$194(defctx$217, ctx$218) {
        return {
            defctx: defctx$217,
            context: ctx$218
        };
    }
    function Var$195(id$219) {
        return { id: id$219 };
    }
    var isRename$196 = function (r$220) {
        return r$220 && typeof r$220.id !== 'undefined' && typeof r$220.name !== 'undefined';
    };
    var isMark$197 = function isMark$197(m$221) {
        return m$221 && typeof m$221.mark !== 'undefined';
    };
    function isDef$198(ctx$222) {
        return ctx$222 && typeof ctx$222.defctx !== 'undefined';
    }
    var templateMap$199 = new Map();
    // (CToken, CContext?) -> CSyntax
    function syntaxFromToken$200(token$223, oldctx$224) {
        // if given old syntax object steal its context otherwise create one fresh
        var ctx$225 = typeof oldctx$224 !== 'undefined' ? oldctx$224 : null;
        return Object.create({
            mark: function mark$226(newMark$227) {
                if (this.token.inner) {
                    var next$228 = syntaxFromToken$200(this.token, this.context);
                    next$228.deferredContext = Mark$193(newMark$227, this.deferredContext);
                    return next$228;
                }
                return syntaxFromToken$200(this.token, Mark$193(newMark$227, this.context));
            },
            rename: function (id$229, name$230) {
                // deferr renaming of delimiters
                if (this.token.inner) {
                    var next$231 = syntaxFromToken$200(this.token, this.context);
                    next$231.deferredContext = Rename$192(id$229, name$230, this.deferredContext);
                    return next$231;
                }
                if (this.token.type === parser$191.Token.Identifier || this.token.type === parser$191.Token.Keyword) {
                    return syntaxFromToken$200(this.token, Rename$192(id$229, name$230, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$232) {
                if (this.token.inner) {
                    var next$233 = syntaxFromToken$200(this.token, this.context);
                    next$233.deferredContext = Def$194(defctx$232, this.deferredContext);
                    return next$233;
                }
                return syntaxFromToken$200(this.token, Def$194(defctx$232, this.context));
            },
            getDefCtx: function () {
                var ctx$234 = this.context;
                while (ctx$234 !== null) {
                    if (isDef$198(ctx$234)) {
                        return ctx$234.defctx;
                    }
                    ctx$234 = ctx$234.context;
                }
                return null;
            },
            expose: function () {
                parser$191.assert(this.token.type === parser$191.Token.Delimiter, 'Only delimiters can be exposed');
                function applyContext$235(stxCtx$236, ctx$237) {
                    if (ctx$237 == null) {
                        return stxCtx$236;
                    } else if (isRename$196(ctx$237)) {
                        return Rename$192(ctx$237.id, ctx$237.name, applyContext$235(stxCtx$236, ctx$237.context));
                    } else if (isMark$197(ctx$237)) {
                        return Mark$193(ctx$237.mark, applyContext$235(stxCtx$236, ctx$237.context));
                    } else if (isDef$198(ctx$237)) {
                        return Def$194(ctx$237.defctx, applyContext$235(stxCtx$236, ctx$237.context));
                    } else {
                        parser$191.assert(false, 'unknown context type');
                    }
                }
                this.token.inner = _$189.map(this.token.inner, _$189.bind(function (stx$238) {
                    if (stx$238.token.inner) {
                        var next$239 = syntaxFromToken$200(stx$238.token, stx$238.context);
                        next$239.deferredContext = applyContext$235(stx$238.deferredContext, this.deferredContext);
                        return next$239;
                    } else {
                        return syntaxFromToken$200(stx$238.token, applyContext$235(stx$238.context, this.deferredContext));
                    }
                }, this));
                this.deferredContext = null;
                return this;
            },
            toString: function () {
                var val$240 = this.token.type === parser$191.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$240 + ']';
            }
        }, {
            token: {
                value: token$223,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$225,
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
    function mkSyntax$201(value$241, type$242, stx$243) {
        var ctx$244, lineStart$245, lineNumber$246, range$247;
        if (stx$243 && Array.isArray(stx$243) && stx$243.length === 1) {
            stx$243 = stx$243[0];
        } else if (stx$243 && Array.isArray(stx$243)) {
            throw new Error('Expecting a syntax object, not: ' + stx$243);
        }
        if (stx$243 && stx$243.token) {
            ctx$244 = stx$243.context;
            lineStart$245 = stx$243.token.lineStart;
            lineNumber$246 = stx$243.token.lineNumber;
            range$247 = stx$243.token.range;
        } else if (stx$243 == null) {
            ctx$244 = null;
        } else {
            throw new Error('Expecting a syntax object, not: ' + stx$243);
        }
        return syntaxFromToken$200({
            type: type$242,
            value: value$241,
            lineStart: lineStart$245,
            lineNumber: lineNumber$246,
            range: range$247
        }, ctx$244);
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$202(stx$248) {
        return _$189.map(stx$248, function (stx$249) {
            if (stx$249.token.inner) {
                stx$249.token.inner = syntaxToTokens$202(stx$249.token.inner);
            }
            return stx$249.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$203(tokens$250) {
        if (!_$189.isArray(tokens$250)) {
            tokens$250 = [tokens$250];
        }
        return _$189.map(tokens$250, function (token$251) {
            if (token$251.inner) {
                token$251.inner = tokensToSyntax$203(token$251.inner);
            }
            return syntaxFromToken$200(token$251);
        });
    }
    function makeValue$204(val$252, stx$253) {
        if (typeof val$252 === 'boolean') {
            return mkSyntax$201(val$252 ? 'true' : 'false', parser$191.Token.BooleanLiteral, stx$253);
        } else if (typeof val$252 === 'number') {
            return mkSyntax$201(val$252, parser$191.Token.NumericLiteral, stx$253);
        } else if (typeof val$252 === 'string') {
            return mkSyntax$201(val$252, parser$191.Token.StringLiteral, stx$253);
        } else if (val$252 === null) {
            return mkSyntax$201('null', parser$191.Token.NullLiteral, stx$253);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$252);
        }
    }
    function makeRegex$205(val$254, flags$255, stx$256) {
        var ctx$257, lineStart$258, lineNumber$259, range$260;
        if (stx$256 && stx$256.token) {
            ctx$257 = stx$256.context;
            lineStart$258 = stx$256.token.lineStart;
            lineNumber$259 = stx$256.token.lineNumber;
            range$260 = stx$256.token.range;
        } else {
            ctx$257 = null;
        }
        return syntaxFromToken$200({
            type: parser$191.Token.RegexLiteral,
            literal: val$254,
            value: new RegExp(val$254, flags$255),
            lineStart: lineStart$258,
            lineNumber: lineNumber$259,
            range: range$260
        }, ctx$257);
    }
    function makeIdent$206(val$261, stx$262) {
        return mkSyntax$201(val$261, parser$191.Token.Identifier, stx$262);
    }
    function makeKeyword$207(val$263, stx$264) {
        return mkSyntax$201(val$263, parser$191.Token.Keyword, stx$264);
    }
    function makePunc$208(val$265, stx$266) {
        return mkSyntax$201(val$265, parser$191.Token.Punctuator, stx$266);
    }
    function makeDelim$209(val$267, inner$268, stx$269) {
        var ctx$270, startLineNumber$271, startLineStart$272, endLineNumber$273, endLineStart$274, startRange$275, endRange$276;
        if (stx$269 && stx$269.token.type === parser$191.Token.Delimiter) {
            ctx$270 = stx$269.context;
            startLineNumber$271 = stx$269.token.startLineNumber;
            startLineStart$272 = stx$269.token.startLineStart;
            endLineNumber$273 = stx$269.token.endLineNumber;
            endLineStart$274 = stx$269.token.endLineStart;
            startRange$275 = stx$269.token.startRange;
            endRange$276 = stx$269.token.endRange;
        } else if (stx$269 && stx$269.token) {
            ctx$270 = stx$269.context;
            startLineNumber$271 = stx$269.token.lineNumber;
            startLineStart$272 = stx$269.token.lineStart;
            endLineNumber$273 = stx$269.token.lineNumber;
            endLineStart$274 = stx$269.token.lineStart;
            startRange$275 = stx$269.token.range;
            endRange$276 = stx$269.token.range;
        } else {
            ctx$270 = null;
        }
        return syntaxFromToken$200({
            type: parser$191.Token.Delimiter,
            value: val$267,
            inner: inner$268,
            startLineStart: startLineStart$272,
            startLineNumber: startLineNumber$271,
            endLineStart: endLineStart$274,
            endLineNumber: endLineNumber$273,
            startRange: startRange$275,
            endRange: endRange$276
        }, ctx$270);
    }
    function unwrapSyntax$210(stx$277) {
        if (stx$277.token) {
            if (stx$277.token.type === parser$191.Token.Delimiter) {
                return stx$277.token;
            } else {
                return stx$277.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$277);
        }
    }
    exports$188.unwrapSyntax = unwrapSyntax$210;
    exports$188.makeDelim = makeDelim$209;
    exports$188.makePunc = makePunc$208;
    exports$188.makeKeyword = makeKeyword$207;
    exports$188.makeIdent = makeIdent$206;
    exports$188.makeRegex = makeRegex$205;
    exports$188.makeValue = makeValue$204;
    exports$188.Rename = Rename$192;
    exports$188.Mark = Mark$193;
    exports$188.Var = Var$195;
    exports$188.Def = Def$194;
    exports$188.isDef = isDef$198;
    exports$188.isMark = isMark$197;
    exports$188.isRename = isRename$196;
    exports$188.syntaxFromToken = syntaxFromToken$200;
    exports$188.mkSyntax = mkSyntax$201;
    exports$188.tokensToSyntax = tokensToSyntax$203;
    exports$188.syntaxToTokens = syntaxToTokens$202;
}));