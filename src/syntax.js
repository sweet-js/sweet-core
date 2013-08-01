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
        dummy_name: ?Num,
        context: Self
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
            context: { value: ctx, writable: true, enumerable: true, configurable: true}
        });
    }

    fun (Num or Str, Num, CSyntax) -> CSyntax
    function mkSyntax(value, type, stx) {
        return syntaxFromToken({
            type: type,
            value: value,
            lineStart: stx.token.lineStart,
            lineNumber: stx.token.lineNumber
        }, stx.context);
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
