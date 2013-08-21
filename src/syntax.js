(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require("es6-collections"), require('contracts-js'), require("./parser"));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'underscore', 'es6-collections', 'contracts-js', 'parser'], factory);
    }
}(this, function(exports, _, es6, contracts, parser) {

    setupContracts(contracts);

    mkContract (CToken, {
        type: ?Num
        value: ?(Num or Str)
    });

    mkContract (CContext, {
        name: ?Num,
        dummy_name: ?Num
    });

    mkContract (CSyntax, {
        token: CToken,
        context: Null or CContext
    });


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


    // (CToken, CContext?) -> CSyntax
    function syntaxFromToken(token, oldctx) {
        // if given old syntax object steal its context otherwise create one fresh
        var ctx = (typeof oldctx !== 'undefined') ? oldctx : null;

        return Object.create({
            // (?) -> CSyntax
            // non mutating
            mark: function mark(newMark) {
                // clone the token so we don't mutate the original inner property
                var markedToken = _.clone(this.token);
                if (this.token.inner) {
                    var markedInner = _.map(this.token.inner, function(stx) {
                        return stx.mark(newMark);
                    });
                    markedToken.inner = markedInner;
                }
                var newMarkObj = Mark(newMark, this.context);
                var stmp = syntaxFromToken(markedToken, newMarkObj);
                return stmp;
            },

            // (CSyntax or [...CSyntax], Str) -> CSyntax
            // non mutating
            rename: function(id, name) {
                // rename inside of delimiters
                if (this.token.inner) {
                    var renamedInner = _.map(this.token.inner, function(stx) {
                        return stx.rename(id, name);
                    });
                    this.token.inner = renamedInner;
                }

                // Only need to put in a rename if the token and the source ident both
                // have the same base name. Speculative optimization, the extra renames
                // might be useful for later extensions.
                if(this.token.value === id.token.value) {
                    return syntaxFromToken(this.token, Rename(id, name, this.context));
                } else {
                    return this;
                }
            },

            addDefCtx: function(defctx) {
                if (this.token.inner) {
                    var renamedInner = _.map(this.token.inner, function(stx) {
                        return stx.addDefCtx(defctx);
                    });
                    this.token.inner = renamedInner;
                }

                return syntaxFromToken(this.token, Def(defctx, this.context));
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

            toString: function() {
                var val = this.token.type === parser.Token.EOF ? "EOF" : this.token.value;
                return "[Syntax: " + val + "]";
            }
        }, {
            token: { value: token, enumerable: true, configurable: true},
            context: { value: ctx, writable: true, enumerable: true, configurable: true},
            // single global map to a template inside `syntax` referenced by all syntax objects
            templateMap: {
                value: templateMap,
                writable: false,
                enumerable: false,
                configurable: false
            }
        });
    }

    fun (Num or Str, Num, CSyntax) -> CSyntax
    function mkSyntax(value, type, stx) {
        var ctx, lineStart, lineNumber, range;
        if(stx && stx.token) {
            ctx = stx.context;
            lineStart = stx.token.lineStart;
            lineNumber = stx.token.lineNumber;
            range = stx.token.range;
        } else {
            ctx = null;
            // the others can stay undefined
        }
        return syntaxFromToken({
            type: type,
            value: value,
            lineStart: lineStart,
            lineNumber: lineNumber,
            range: range
        }, ctx);
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
            ctx = stx.context;
            lineStart = stx.token.lineStart;
            lineNumber = stx.token.lineNumber;
            range = stx.token.range;
        } else {
            ctx = null;
            // the others can stay undefined
        }
        return syntaxFromToken({
            type: parser.Token.RegexLiteral,
            literal: val,
            value: new RegExp(val, flags),
            lineStart: lineStart,
            lineNumber: lineNumber,
            range: range
        }, ctx);
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
        if(stx && stx.token.type === parser.Token.Delimiter) {
            ctx = stx.context;
            startLineNumber = stx.token.startLineNumber;
            startLineStart = stx.token.startLineStart
            endLineNumber = stx.token.endLineNumber;
            endLineStart = stx.token.endLineStart;
            startRange = stx.token.startRange;
            endRange = stx.token.endRange;
        } else if (stx && stx.token){
            ctx = stx.context;
            startLineNumber = stx.token.lineNumber;
            startLineStart = stx.token.lineStart;
            endLineNumber = stx.token.lineNumber;
            endLineStart = stx.token.lineStart;
            startRange = stx.token.range;
            endRange = stx.token.range
        } else {
            ctx = null;
            // the others can stay undefined
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
        }, ctx);
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
}));
