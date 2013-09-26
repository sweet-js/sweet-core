(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require("es6-collections"),  require("./parser"));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'underscore', 'es6-collections', 'parser'], factory);
    }
}(this, function(exports, _, es6, parser) {


    // (CSyntax, Str) -> CContext
    function Rename(id, name, ctx, defctx) {
        defctx = defctx || null;
        return {
            id: id,
            name: name,
            context: ctx,
            def: defctx
        };
    }
    
    // (Num) -> CContext
    function Mark(mark, ctx) {
        return {
            mark: mark,
            context: ctx
        };
    }

    function Def(defctx, ctx) {
        return {
            defctx: defctx,
            context: ctx
        };
    }
    
    function Var(id) {
        return {
            id: id
        };
    }

    
    var isRename = function(r) {
        return r && (typeof r.id !== 'undefined') && (typeof r.name !== 'undefined');
    };

    var isMark = function isMark(m) {
        return m && (typeof m.mark !== 'undefined');
    };

    function isDef(ctx) {
        return ctx && (typeof ctx.defctx !== 'undefined');
    }

    var templateMap = new Map();


    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken(token, oldstx) {
        return Object.create({
            // (Int) -> CSyntax
            // non mutating
            mark: function mark(newMark) {
                if (this.token.inner) {
                    var next = syntaxFromToken(this.token, this);
                    next.deferredContext = Mark(newMark, this.deferredContext);
                    return next;
                }
                return syntaxFromToken(this.token, {context: Mark(newMark, this.context)});
            },

            // (CSyntax or [...CSyntax], Str) -> CSyntax
            // non mutating
            rename: function(id, name) {

                // deferr renaming of delimiters
                if (this.token.inner) {
                    var next = syntaxFromToken(this.token, this);
                    next.deferredContext = Rename(id, name, this.deferredContext);
                    return next;
                }

                if (this.token.type === parser.Token.Identifier ||
                    this.token.type === parser.Token.Keyword) {
                    return syntaxFromToken(this.token, {context: Rename(id, name, this.context)});

                } else {
                    return this;
                }
            },

            addDefCtx: function(defctx) {
                if (this.token.inner) {
                    var next = syntaxFromToken(this.token, this);
                    next.deferredContext = Def(defctx, this.deferredContext);
                    return next;
                }

                return syntaxFromToken(this.token, {context: Def(defctx, this.context)});
            },

            getDefCtx: function() {
                var ctx = this.context;
                while(ctx !== null) {
                    if (isDef(ctx)) {
                        return ctx.defctx;
                    }
                    ctx = ctx.context;
                }
                return null;
            },

            expose: function() {
                parser.assert(this.token.type === parser.Token.Delimiter,
                              "Only delimiters can be exposed");

                function applyContext(stxCtx, ctx) {
                    if (ctx == null) {
                        return stxCtx;
                    } else if (isRename(ctx)) {
                        return Rename(ctx.id, ctx.name, applyContext(stxCtx, ctx.context))
                    } else if (isMark(ctx)) {
                        return Mark(ctx.mark, applyContext(stxCtx, ctx.context));
                    } else if (isDef(ctx)) {
                        return Def(ctx.defctx, applyContext(stxCtx, ctx.context));
                    } else {
                        parser.assert(false, "unknown context type");
                    }
                }

                this.token.inner = _.map(this.token.inner, _.bind(function(stx) {
                    if (stx.token.inner) {
                        var next = syntaxFromToken(stx.token, stx);
                        next.deferredContext = applyContext(stx.deferredContext, this.deferredContext);
                        return next;
                    } else {
                        return syntaxFromToken(stx.token,
                                               {context: applyContext(stx.context, this.deferredContext)});
                    }
                }, this));
                this.deferredContext = null;
                return this;
            },


            toString: function() {
                var val = this.token.type === parser.Token.EOF ? "EOF" : this.token.value;
                return "[Syntax: " + val + "]";
            }
        }, {
            token: { value: token, enumerable: true, configurable: true},
            context: { 
                // if given old syntax object steal its context otherwise create one fresh
                value: (oldstx && oldstx.context) ? oldstx.context : null,
                writable: true, enumerable: true, configurable: true
            },
            deferredContext: { 
                value: (oldstx && oldstx.deferredContext) ? oldstx.deferredContext : null, 
                writable: true, enumerable: true, configurable: true
            }
        });
    }

    function mkSyntax(value, type, stx) {
        var ctx, lineStart, lineNumber, range;
        if (stx && Array.isArray(stx) && stx.length === 1) {
            stx = stx[0];
        } else if (stx && Array.isArray(stx)) {
            throw new Error("Expecting a syntax object, not: " + stx);
        }

        if(stx && stx.token) {
            lineStart = stx.token.lineStart;
            lineNumber = stx.token.lineNumber;
            range = stx.token.range;
        } else if (stx == null) {
            lineStart = 0;
            lineNumber = 0;
            range = [0, 0];
        } else {
            throw new Error("Expecting a syntax object, not: " + stx);
        }
        return syntaxFromToken({
            type: type,
            value: value,
            lineStart: lineStart,
            lineNumber: lineNumber,
            range: range
        }, stx);
    }
    
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens(stx) {
        return _.map(stx, function(stx) {
            if (stx.token.inner) {
                stx.token.inner = syntaxToTokens(stx.token.inner);
            }
            return stx.token;
        });
    }

    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax(tokens) {
        if (!_.isArray(tokens)) {
            tokens = [tokens];
        }
        return _.map(tokens, function(token) {
            if (token.inner) {
                token.inner = tokensToSyntax(token.inner);
            }
            return syntaxFromToken(token);
        });
    }

    function makeValue(val, stx) {
        if(typeof val === 'boolean') {
            return mkSyntax(val ? "true" : "false", parser.Token.BooleanLiteral, stx);
        } else if (typeof val === 'number') {
            return mkSyntax(val, parser.Token.NumericLiteral, stx);
        } else if (typeof val === 'string') {
            return mkSyntax(val, parser.Token.StringLiteral, stx);
        } else if (val === null) {
            return mkSyntax('null', parser.Token.NullLiteral, stx);
        } else {
            throw new Error("Cannot make value syntax object from: " + val);
        }
    }

    function makeRegex(val, flags, stx) {
        var ctx, lineStart, lineNumber, range;
        if(stx && stx.token) {
            lineStart = stx.token.lineStart;
            lineNumber = stx.token.lineNumber;
            range = stx.token.range;
        } else {
            // the others can stay undefined
        }
        return syntaxFromToken({
            type: parser.Token.RegexLiteral,
            literal: val,
            value: new RegExp(val, flags),
            lineStart: lineStart,
            lineNumber: lineNumber,
            range: range
        }, stx);
    }

    function makeIdent(val, stx) {
        return mkSyntax(val, parser.Token.Identifier, stx);
    }

    function makeKeyword(val, stx) {
        return mkSyntax(val, parser.Token.Keyword, stx);
    }

    function makePunc(val, stx) {
        return mkSyntax(val, parser.Token.Punctuator, stx);
    }

    function makeDelim(val, inner, stx) {
        var ctx, startLineNumber, startLineStart, endLineNumber, endLineStart, startRange, endRange;

        if (stx && Array.isArray(stx) && stx.length === 1) {
            stx = stx[0];
        } else if (stx && Array.isArray(stx)) {
            throw new Error("Expecting a syntax object, not: " + stx);
        }

        if(stx && stx.token.type === parser.Token.Delimiter) {
            startLineNumber = stx.token.startLineNumber;
            startLineStart = stx.token.startLineStart
            endLineNumber = stx.token.endLineNumber;
            endLineStart = stx.token.endLineStart;
            startRange = stx.token.startRange;
            endRange = stx.token.endRange;
        } else if (stx && stx.token){
            startLineNumber = stx.token.lineNumber;
            startLineStart = stx.token.lineStart;
            endLineNumber = stx.token.lineNumber;
            endLineStart = stx.token.lineStart;
            startRange = stx.token.range;
            endRange = stx.token.range
        } else {
            startLineNumber = 0;
            startLineStart = 0;
            endLineNumber = 0;
            endLineStart = 0;
            startRange = [0, 0];
            endRange = [0, 0];
        }

        return syntaxFromToken({
            type: parser.Token.Delimiter,
            value: val,
            inner: inner,
            startLineStart: startLineStart,
            startLineNumber: startLineNumber,
            endLineStart: endLineStart,
            endLineNumber: endLineNumber,
            startRange: startRange,
            endRange: endRange
        }, stx);
    }

    function unwrapSyntax(stx) {
        if (stx.token) {
            if(stx.token.type === parser.Token.Delimiter) {
                return stx.token;
            } else {
                return stx.token.value;
            }
        } else {
            throw new Error ("Not a syntax object: " + stx);
        }
    }

    exports.unwrapSyntax = unwrapSyntax;
    exports.makeDelim = makeDelim;
    exports.makePunc = makePunc;
    exports.makeKeyword = makeKeyword;
    exports.makeIdent = makeIdent;
    exports.makeRegex = makeRegex;
    exports.makeValue = makeValue;

    exports.Rename = Rename;
    exports.Mark = Mark;
    exports.Var = Var;
    exports.Def = Def;
    exports.isDef = isDef;
    exports.isMark = isMark;
    exports.isRename = isRename;

    exports.syntaxFromToken = syntaxFromToken;
    exports.mkSyntax = mkSyntax;
    exports.tokensToSyntax = tokensToSyntax;
    exports.syntaxToTokens = syntaxToTokens;
}));
