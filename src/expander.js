/*
  Copyright (C) 2012 Tim Disney <tim@disnet.me>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require('./parser'), require("es6-collections"));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'underscore', 'parser', 'es6-collections'], factory);
    } else {
        // Browser globals
        factory((root.expander = {}), root._, root.parser);
    }
}(this, function (exports, underscore, parser, es6) {
    _ = underscore || _;
    // used to export "private" methods for unit testing
    exports._test = {};

    // some convenience monkey patching
    Object.prototype.create = function() {
        var obj = Object.create(this);
        if (typeof obj.construct === "function") {
            obj.construct.apply(obj, arguments);
        }
        return obj;
    };

    Object.prototype.extend = function(properties) {
        var result = Object.create(this);
        for(var prop in properties) {
            if(properties.hasOwnProperty(prop)) {
                result[prop] = properties[prop];
            }
        }
        return result;
    };

    Object.prototype.hasPrototype = function(proto) {
        function F() {}
        F.prototype = proto;
        return this instanceof F;
    };

    // todo: add more message information
    function throwError(msg) {
        throw new Error(msg);
    }


    // (Any, Num, CSyntax) -> CSyntax
    function mkSyntax(value, type, stx) {
        return syntaxFromToken({
            type: type,
            value: value,
            lineStart: stx.token.lineStart,
            lineNumber: stx.token.lineNumber
        }, stx.context);
    }

    // probably a more javascripty way than faking constructors but screw it
    // (Num) -> CContext
    function Mark(mark, ctx) {
        return {
            mark: mark,
            context: ctx
        };
    }


    function Var(id) {
        return {
            id: id
        };
    }

    var isMark = function isMark(m) {
        return m && (typeof m.mark !== 'undefined');
    };

    // (CSyntax, Str) -> CContext
    function Rename(id, name, ctx) {
        return {
            id: id,
            name: name,
            context: ctx
        };
    }

    var isRename = function(r) {
        return r && (typeof r.id !== 'undefined') && (typeof r.name !== 'undefined');
    };

    function DummyRename(name, ctx) {
        return {
            dummy_name: name,
            context: ctx
        };
    }

    var isDummyRename = function(r) {
        return r && (typeof r.dummy_name !== 'undefined');
    };


    var syntaxProto =  {
        // (?) -> CSyntax
        // non mutating
        mark: function mark(newMark) {
            // clone the token so we don't mutate the original inner property
            var markedToken = _.clone(this.token);
            if(this.token.inner) {
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
        rename: function(idents, name) {
            var renamedToken = _.clone(this.token);
            if(this.token.inner) {
                var renamedInner = _.map(this.token.inner, function(stx) {
                    return stx.rename(idents, name);
                });
                renamedToken.inner = renamedInner;
            }
            // wrap idents in a list if given a single
            var ids = _.isArray(idents) ? idents : [idents];

            var newRename = _.reduce(ids, function(ctx, id) {
                return Rename(id, name, ctx);
            }, this.context);
            return syntaxFromToken(renamedToken, newRename);
        },

        push_dummy_rename: function(name) {
            var renamedToken = _.clone(this.token);
            if(this.token.inner) {
                var renamedInner = _.map(this.token.inner, function(stx) {
                    return stx.push_dummy_rename(name);
                });
                renamedToken.inner = renamedInner;
            }

            return syntaxFromToken(renamedToken, DummyRename(name, this.context));
        },

        swap_dummy_rename: function(ident, name, dummyName) {
            var swappedToken = _.clone(this.token);
            if(this.token.inner) {
                var swappedInner = _.map(this.token.inner, function(stx) {
                    return stx.swap_dummy_rename(ident, name, dummyName);
                });
                swappedToken.inner = swappedInner;
            }

            return syntaxFromToken(swappedToken,
                                    renameDummyCtx(this.context, ident, name, dummyName));
        },
        toString: function() {
            return "[Syntax: " + this.token.value + "]";
        }
    };

    function renameDummyCtx(ctx, ident, name, dummyName) {
        if(ctx === null) {
            return null;
        }
        if(isDummyRename(ctx) && ctx.dummy_name === dummyName) {
            return Rename(ident, name, DummyRename(ctx.dummy_name, ctx.context));
        }
        if(isDummyRename(ctx) && ctx.dummy_name !== dummyName) {
            return DummyRename(ctx.dummy_name, renameDummyCtx(ctx.context, ident, name, dummyName));
        }
        if(isMark(ctx)) {
            return Mark(ctx.mark, renameDummyCtx(ctx.context, ident, name, dummyName));
        }
        if(isRename(ctx)) {
            return Rename(ctx.id, ctx.name, renameDummyCtx(ctx.context, ident, name, dummyName));
        }
        parser.assert(false, "expecting a fixed set of context types");
    }

    function findDummyParent(ctx, dummyName) {
        if(ctx === null || ctx.context === null) {
            return null;
        }

        if(isDummyRename(ctx.context) && ctx.context.dummy_name === dummyName) {
            return ctx;
        }
        return findDummyParent(ctx.context);
    }


    // (CToken, CContext?) -> CSyntax
    function syntaxFromToken(token, oldctx) {
        // if given old syntax object steal its context otherwise create one fresh
        var ctx = (typeof oldctx !== 'undefined') ? oldctx : null;

        return Object.create(syntaxProto, {
            token: { value: token, enumerable: true, configurable: true},
            context: { value: ctx, writable: true, enumerable: true, configurable: true}
        });
    }

    function remdup(mark, mlist) {
        if(mark === _.first(mlist)) {
            return _.rest(mlist, 1);
        }
        return [mark].concat(mlist);
    }

    // (CSyntax) -> [...Num]
    function marksof(stx) {
        var mark, submarks;
        if(isMark(stx.context)) {
            mark = stx.context.mark;
            submarks = marksof(syntaxFromToken(stx.token, stx.context.context));
            return remdup(mark, submarks);
        }
        if(isRename(stx.context) || isDummyRename(stx.context)) {
            return marksof(syntaxFromToken(stx.token, stx.context.context));
        }
        return [];
    }

    // (CSyntax) -> CToken
    function resolve(stx) {
        if(isMark(stx.context) || isDummyRename(stx.context)) {
            return resolve(syntaxFromToken(stx.token, stx.context.context));
        }
        if (isRename(stx.context)) {
            var idName = resolve(stx.context.id);
            var subName = resolve(syntaxFromToken(stx.token, stx.context.context));

            var idMarks = marksof(stx.context.id);
            var subMarks = marksof(syntaxFromToken(stx.token, stx.context.context));

            if((idName === subName) && (_.difference(idMarks, subMarks).length === 0)) {
                return stx.token.value + stx.context.name;
            }
            return resolve(syntaxFromToken(stx.token, stx.context.context));
        }
        return stx.token.value;
    }

    var nextFresh = 0;
    var fresh = function() {
        // todo: something more globally unique
        return nextFresh++;
    };



    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax(tokens) {
        if(!_.isArray(tokens)) {
            tokens = [tokens];
        }
        return _.map(tokens, function(token) {
            if(token.inner) {
                token.inner = tokensToSyntax(token.inner);
            }
            return syntaxFromToken(token);
        });
    }

    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens(syntax) {
        return _.map(syntax, function(stx) {
            if(stx.token.inner) {
                stx.token.inner = syntaxToTokens(stx.token.inner);
            }
            return stx.token;
        });
    }


    // CToken -> Bool
    function isPatternVar(token) {
        return token.type === parser.Token.Identifier &&
                token.value[0] === "$" &&   // starts with $
                token.value !== "$";        // but isn't $
    }


    var containsPatternVar = function(patterns) {
        return _.any(patterns, function(pat) {
            if(pat.token.type === parser.Token.Delimiter) {
                return containsPatternVar(pat.token.inner);
            }
            return isPatternVar(pat);
        });
    };

    // ([...CSyntax]) -> [...CPattern]
    function loadPattern(patterns) {

        return _.chain(patterns)
            // first pass to merge the pattern variables together
            .reduce(function(acc, patStx, idx) {
                var last = patterns[idx-1];
                var lastLast = patterns[idx-2];
                var next = patterns[idx+1];
                var nextNext = patterns[idx+2];

                // skip over the `:lit` part of `$x:lit`
                if (patStx.token.value === ":") {
                    if(last && isPatternVar(last.token)) {
                        return acc;
                    }
                }
                if(last && last.token.value === ":") {
                    if(lastLast && isPatternVar(lastLast.token)) {
                        return acc;
                    }
                }
                // skip over $
                if (patStx.token.value === "$" && next && next.token.type === parser.Token.Delimiter) {
                    return acc;
                }

                if(isPatternVar(patStx.token)) {
                    if(next && next.token.value === ":" ) {
                        parser.assert(typeof nextNext !== 'undefined', "expecting a pattern class");
                        patStx.class = nextNext.token.value;
                    } else {
                        patStx.class = "token";
                    }
                } else if (patStx.token.type === parser.Token.Delimiter) {
                    if (last && last.token.value === "$") {
                        patStx.class = "pattern_group";
                    }
                    patStx.token.inner = loadPattern(patStx.token.inner);
                } else {
                    patStx.class = "pattern_literal";
                }
                return acc.concat(patStx);
            // then second pass to mark repeat and separator
            }, []).reduce(function(acc, patStx, idx, patterns) {
                var separator = " ";
                var repeat = false;
                var next = patterns[idx+1];
                var nextNext = patterns[idx+2];

                if(next && next.token.value === "...") {
                    repeat = true;
                    separator = " ";
                } else if(delimIsSeparator(next) && nextNext && nextNext.token.value === "...") {
                    repeat = true;
                    parser.assert(next.token.inner.length === 1, "currently assuming all separators are a single token");
                    separator = next.token.inner[0].token.value;
                }

                // skip over ... and (,)
                if(patStx.token.value === "..."||
                        (delimIsSeparator(patStx) && next && next.token.value === "...")) {
                    return acc;
                }
                patStx.repeat = repeat;
                patStx.separator = separator;
                return acc.concat(patStx);
            }, []).value();
    }


    // take the line context (not lexical...um should clarify this a bit)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext(from, to) {
        // todo could be nicer about the line numbers...currently just
        // taking from the macro name but could also do offset
        return _.map(to, function(stx) {
            if(stx.token.type === parser.Token.Delimiter) {
                return syntaxFromToken({
                    type: parser.Token.Delimiter,
                    value: stx.token.value,
                    inner: stx.token.inner,
                    startRange: from.range,
                    endRange: from.range,
                    startLineNumber: from.token.lineNumber,
                    startLineStart: from.token.lineStart,
                    endLineNumber: from.token.lineNumber,
                    endLineStart: from.token.lineStart
                }, stx.context);
            }
            return syntaxFromToken({
                    value: stx.token.value,
                    type: stx.token.type,
                    lineNumber: from.token.lineNumber,
                    lineStart: from.token.lineStart,
                    range: from.token.range // this is a lie
                }, stx.context);
        });
    }

    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch(tojoin, punc) {

        return _.reduce(_.rest(tojoin, 1), function(acc, join) {
            if (punc === " ") {
                return acc.concat(join.match);
            }
            return acc.concat(mkSyntax(punc, parser.Token.Punctuator, _.first(join.match)), join.match);
        }, _.first(tojoin).match);
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax(tojoin, punc) {
        if(tojoin.length === 0) { return []; }
        if(punc === " ") { return tojoin; }

        return _.reduce(_.rest(tojoin, 1), function (acc, join) {
            return acc.concat(mkSyntax(punc, parser.Token.Punctuator, join), join);
        }, [_.first(tojoin)]);
    }

    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr(tojoin, punc) {
        if(tojoin.length === 0) { return []; }
        if(punc === " ") {
            return _.flatten(tojoin, true);
        }

        return _.reduce(_.rest(tojoin, 1), function (acc, join){
            return acc.concat(mkSyntax(punc, parser.Token.Punctuator, _.first(join)), join);
        }, _.first(tojoin));
    }

    // (CSyntax) -> Bool
    function delimIsSeparator(delim) {
        return (delim && delim.token.type === parser.Token.Delimiter &&
                delim.token.value === "()"&&
                delim.token.inner.length === 1 &&
                delim.token.inner[0].token.type !== parser.Token.Delimiter &&
                !containsPatternVar(delim.token.inner));
    }

    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern(pattern) {
        var fv = [];

        _.each(pattern, function (pat) {
            if(isPatternVar(pat.token)) {
                fv.push(pat.token.value);
            } else if (pat.token.type === parser.Token.Delimiter) {
                fv = fv.concat(freeVarsInPattern(pat.token.inner));
            }
        });

        return fv;
    }

    // ([...CSyntax]) -> Num
    function patternLength (patterns) {
        return _.reduce(patterns, function(acc, pat) {
            if(pat.token.type === parser.Token.Delimiter) {
                // the one is to include the delimiter itself in the count
                return acc + 1 + patternLength(pat.token.inner);
            }
            return acc + 1;
        }, 0);
    }

    // (Any, CSyntax) -> Bool
    function matchStx(value, stx) {
        return stx && stx.token && stx.token.value === value;
    }

    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim(towrap, delimSyntax) {
        parser.assert(delimSyntax.token.type === parser.Token.Delimiter, "expecting a delimiter token");

        return syntaxFromToken({
            type: parser.Token.Delimiter,
            value: delimSyntax.token.value,
            inner: towrap,
            range: delimSyntax.token.range,
            startLineNumber: delimSyntax.token.startLineNumber,
            lineStart: delimSyntax.token.lineStart
        }, delimSyntax.context);
    }

    // (CSyntax) -> [...CSyntax]
    function getArgList(argSyntax) {
        parser.assert(argSyntax.token.type === parser.Token.Delimiter,
            "expecting delimiter for function params");
        return _.filter(argSyntax.token.inner, function(stx) {
            return stx.token.value !== ",";
        });
    }

    function isFunctionStx(stx) {
        return stx && stx.token.type === parser.Token.Keyword &&
                    stx.token.value === "function";
    }
    function isVarStx(stx) {
        return stx && stx.token.type === parser.Token.Keyword &&
                    stx.token.value === "var";
    }

    function varNamesInAST(ast) {
        return _.map(ast, function(item) {
            return item.id.name;
        });
    }

    // finds all the identifiers being bound by var statements
    // in the array of syntax objects
    // ([...CSyntax]) -> [...CSyntax]
    function getVarIdentifiers(body) {
        return [];

        // todo: fix: needs to understand term trees
        return _.reduce(body.token.inner, function(acc, curr, idx) {
            var atFunctionDelimiter;

            if(!curr.token) {
                console.log(curr);
                parser.assert(false, "bad panda");
            }
            if (curr.token.type === parser.Token.Delimiter) {
                atFunctionDelimiter = (curr.token.value === "()" && (isFunctionStx(body[idx-1])
                                                                  || isFunctionStx(body[idx-2]))) ||
                                      (curr.token.value === "{}" && (isFunctionStx(body[idx-2])
                                                                  || isFunctionStx(body[idx-3])));
                // don't look for var idents inside nested functions
                if(!atFunctionDelimiter) {
                    return acc.concat(getVarIdentifiers(curr.token.inner));
                }
                return acc;
            }
            if (isVarStx(body[idx-1])) {
                var parseResult = parser.parse(flatten(body.slice(idx)),
                                            "VariableDeclarationList",
                                            {noresolve: true});
                return acc.concat(varNamesInAST(parseResult));
            }
            return acc;
        }, []);
    }

    function replaceVarIdent(stx, orig, renamed) {
        if(stx === orig) {
            return renamed;
        }
        if(stx.token.type === parser.Token.Delimiter) {
            var replacedToken = _.clone(stx.token);
            var replacedInner = _.map(replacedToken.inner, function(s) {
                return replaceVarIdent(s, orig, renamed);
            });
            replacedToken.inner = replacedInner;
            return syntaxFromToken(replacedToken, stx.context);
        }
        return stx;
    }

    // (CSyntax) -> CSyntax

    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree = {

        // Go back to the flat syntax representation. Uses the ordered list
        // of properties that each subclass sets to determine the order that multiple
        // children are destructed.
        // -> [...Syntax]
        destruct: function() {
            return _.reduce(this.properties, _.bind(function(acc, prop) {
                // var propVal = Array.isArray(this[prop]) ? this[prop] : [this[prop]];
                // _.reduce(propVal)
                if(this[prop].hasPrototype(TermTree)) {
                    return acc.concat(this[prop].destruct());
                } else {
                    return acc.concat(this[prop]);
                }
            }, this), []);
        }
    };

    var EOF = TermTree.extend({
        properties: ["eof"],

        construct: function(e) { this.eof = e; }
    });

    var Expr = TermTree.extend({ construct: function() {} });

    var PrimaryExpression = Expr.extend({ construct: function() {} });

    var ThisExpression = PrimaryExpression.extend({
        properties: ["this"],

        construct: function(that) { this.this = that; }
    });

    var Lit = PrimaryExpression.extend({
        properties: ["lit"],

        construct: function(l) { this.lit = l; }
    });

    exports._test.PropertyAssignment = PropertyAssignment;
    var PropertyAssignment = TermTree.extend({
        properties: ["propName", "assignment"],

        construct: function(propName, assignment) {
            this.propName = propName;
            this.assignment = assignment;
        }
    });

    var ObjectLiteral = PrimaryExpression.extend({
        properties: ["body"],
        construct: function(body) { this.body = body; }
    });

    var ArrayLiteral = PrimaryExpression.extend({
        properties: ["array"],

        construct: function(ar) { this.array = ar; }
    });

    // var ParenExpression = PrimaryExpression.extend({
    //     properties: ["expr"],
    //     construct: function(expr) { this.expr = expr; }
    // });

    var BinOp = Expr.extend({
        properties: ["left", "op", "right"],

        construct: function(op, left, right) {
            this.op = op;
            this.left = left;
            this.right = right;
        }
    });


    var Keyword = TermTree.extend({
        properties: ["keyword"],

        construct: function(k) { this.keyword = k; }
    });

    var Punc = TermTree.extend({
        properties: ["punc"],

        construct: function(p) { this.punc = p; }
    });

    var Delimiter = TermTree.extend({
        properties: ["delim"],

        // do a special kind of destruct that creates
        // the individual begin and end delimiters
        destruct: function() {
            parser.assert(this.delim, "expecting delim to be defined");
            var openParen = syntaxFromToken({
                type: parser.Token.Punctuator,
                value: this.delim.token.value[0],
                range: this.delim.token.startRange,
                lineNumber: this.delim.token.startLineNumber,
                lineStart: this.delim.token.startLineStart
            });
            var closeParen = syntaxFromToken({
                type: parser.Token.Punctuator,
                value: this.delim.token.value[1],
                range: this.delim.token.endRange,
                lineNumber: this.delim.token.endLineNumber,
                lineStart: this.delim.token.endLineStart
            });


            var innerStx = _.reduce(this.delim.token.inner, function(acc, term) {
                // parser.assert(term.inner != null, "not expecting a raw delimiter token");
                // problem, not dealing with a delimiter token
                if(term.hasPrototype(TermTree)){
                    return acc.concat(term.destruct());
                } else {
                    return acc.concat(term);
                }
            }, []);

            return [openParen]
                    .concat(innerStx)
                    .concat(closeParen);
        },

        construct: function(d) { this.delim = d; }
    });

    var Id = PrimaryExpression.extend({
        properties: ["id"],

        construct: function(id) { this.id = id; }
    });

    var NamedFun = TermTree.extend({
        properties: ["keyword", "name", "params", "body"],

        construct: function(keyword, name, params, body) {
            this.keyword = keyword;
            this.name = name;
            this.params = params;
            this.body = body;
        }
    });

    var AnonFun = TermTree.extend({
        properties: ["keyword", "params", "body"],

        construct: function(keyword, params, body) {
            this.keyword = keyword;
            this.params = params;
            this.body = body;
        }
    });

    var Macro = TermTree.extend({
        properties: ["name", "body"],

        construct: function(name, body) {
            this.name = name;
            this.body = body;
        }
    });

    var Call = Expr.extend({
        properties: ["fun", "args"],

        destruct: function() {
            parser.assert(this.fun.hasPrototype(TermTree), "expecting a term tree in destruct of call");
            return this.fun.destruct().concat(_.reduce(this.args, function(acc, term) {
                parser.assert(term && term.hasPrototype(TermTree), "expecting term trees in destruct of Call");
                return acc.concat(term.destruct());
            }, []));
        },

        construct: function(fun, args) {
            this.fun = fun;
            this.args = args;
        }
    });

    function stxIsBinOp (stx) {
        var staticOperators = ["+", "*", "/", "%", "||", "&&", "|", "&", "^",
                                "==", "!=", "===", "!==",
                                // "<", ">", "<=", ">=", "in", "instanceof",
                                "<<", ">>", ">>>"];
        return _.contains(staticOperators, stx.token.value);
    }

    exports._test.enforestPropertyAssignments = enforestPropertyAssignments;
    // ([...CSyntax]) -> null or [...PropertyAssignment]
    function enforestPropertyAssignments(stx) {
        // todo: implement
        return null;
    }

    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest(toks, env) {
        env = env || new Map();

        parser.assert(toks.length > 0, "enforest assumes there are tokens to work with");

        function step(head, rest) {
            var innerTokens;
            if(head.hasPrototype(TermTree)) {

                // // function call
                // if(this.rest[0] && this.rest[0].token.type === parser.Token.Delimiter
                //         && this.rest[0].token.value === "()") {

                //     var termArgs = _.map(this.rest[0].token.inner, function(p) {
                //         var pr = ReadTree.create([p])
                //         pr.enforest();
                //         parser.assert(pr.rest.length === 0, "expecting enforest of argument to have no remainder");
                //         return pr.head;
                //     });

                //     this.head = Call.create(this.head, termArgs);
                //     this.rest = this.rest.slice(2);
                //     this.enforest(env);
                // if(rest[0] && rest[1] && stxIsBinOp(rest[0])) {
                //     var op = rest[0];
                //     var left = head;
                //     var res = enforest(rest.slice(1), env);
                //     var right = res.result;

                //     return step(BinOp.create(op, left, right), res.rest);
                if(head.hasPrototype(Delimiter) && head.delim.token.value === "[]") {
                    return step(ArrayLiteral.create(head), rest);
                // } else if(head.hasPrototype(Delimiter) && head.delim.token.value === "()") {
                //     innerTokens = head.delim.token.inner;
                //     // empty parens are acceptable but enforest doesn't accept empty arrays
                //     // so short circuit here
                //     if(innerTokens.length === 0) {
                //         return step(ParenExpression.create(head), rest);
                //     } else {
                //         var innerTerm = get_expression(innerTokens, env);
                //         if(innerTerm.result && innerTerm.result.hasPrototype(Expr)) {
                //             return step(ParenExpression.create(head), rest);
                //         }
                //         // if the tokens inside the paren aren't an expression
                //         // we just leave it as a delimiter
                //     }
                } else if(head.hasPrototype(Delimiter) && head.delim.token.value === "{}") {
                    innerTokens = head.delim.token.inner;
                    // var innerTermArray = enforestPropertyAssignments(innerTokens);
                    // if(innerTermArray !== null) {
                    // }
                    return step(ObjectLiteral.create(head), rest);
                }
            } else {
                parser.assert(head && head.token, "assuming head is a syntax object");

                // macro definition
                if(head.token.type === parser.Token.Identifier &&
                        head.token.value === "macro" &&
                        rest[0] && rest[1] &&
                        rest[0].token.type === parser.Token.Identifier &&
                        rest[1].token.type === parser.Token.Delimiter &&
                        rest[1].token.value === "{}") {
                    return step(Macro.create(rest[0], rest[1].token.inner), rest.slice(2));
                // function definition
                } else if (head.token.type === parser.Token.Keyword &&
                            head.token.value === "function" &&
                            rest[0] && rest[1] && rest[2] &&
                            rest[0].token.type === parser.Token.Identifier &&
                            rest[1].token.type === parser.Token.Delimiter &&
                            rest[1].token.value === "()" &&
                            rest[2].token.type === parser.Token.Delimiter &&
                            rest[2].token.value === "{}") {
                    return step(NamedFun.create(head, rest[0],
                                                Delimiter.create(rest[1]),
                                                Delimiter.create(rest[2])),
                                rest.slice(3));
                // anonymous function definition
                } else if(head.token.type === parser.Token.Keyword &&
                            head.token.value === "function" &&
                            rest[0] && rest[1] &&
                            rest[0].token.type === parser.Token.Delimiter &&
                            rest[0].token.value === "()" &&
                            rest[1].token.type === parser.Token.Delimiter &&
                            rest[1].token.value === "{}") {
                    return step(AnonFun.create(head,
                                                Delimiter.create(rest[0]),
                                                Delimiter.create(rest[1])),
                                rest.slice(2));
                } else if(head.token.type === parser.Token.Keyword &&
                            head.token.value === "this") {

                    return step(ThisExpression.create(head), rest);
                // literal
                } else if (head.token.type === parser.Token.NumericLiteral ||
                            head.token.type === parser.Token.StringLiteral ||
                            head.token.type === parser.Token.BooleanLiteral ||
                            head.token.type === parser.Token.RegexLiteral ||
                            head.token.type === parser.Token.NullLiteral) {
                    return step(Lit.create(head), rest);
                // punctuator
                } else if (head.token.type === parser.Token.Identifier &&
                            env.has(head.token.value)) {
                    // pull the macro transformer out the environment
                    var transformer = env.get(head.token.value);
                    // apply the transformer
                    var rt = transformer(rest, head, env);

                    // todo: eventually macro calls will only return terms, until then we'll get along with arrays of syntax
                    // parser.assert(rt.result.hasPrototype(TermTree), "expecting a term as the result of the macro call");
                    return step(rt.result[0], rt.result.slice(1).concat(rt.rest));
                    // this.head = null;
                    // this.rest = rt.result.concat(rt.rest);
                    // this.enforest(env);
                // identifier
                } else if(head.token.type === parser.Token.Identifier) {
                    return step(Id.create(head), rest);
                } else if (head.token.type === parser.Token.Punctuator) {
                    return step(Punc.create(head), rest);
                // keyword
                } else if(head.token.type === parser.Token.Keyword) {
                    return step(Keyword.create(head), rest);
                // Delimiter
                } else if(head.token.type === parser.Token.Delimiter) {
                    return step(Delimiter.create(head), rest);
                // end of file
                } else if(head.token.type === parser.Token.EOF) {
                    parser.assert(rest.length === 0, "nothing should be after an EOF");
                    return step(EOF.create(head), []);
                }

            }

            // we're done stepping
            return {
                result: head,
                rest: rest
            };

        }

        return step(toks[0], toks.slice(1));
    }

    function get_expression(stx, env) {
        var res = enforest(stx, env);
        if(!res.result.hasPrototype(Expr)) {
            return {
                result: null,
                rest: stx
            };
        }
        return res;
    }

    exports._test.matchPatternClass = matchPatternClass;
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass (patternClass, stx, env) {
        var result, rest;
        // pattern has no parse class
        if(patternClass === "token") {
            if(stx[0] && stx[0].token.type !== parser.Token.EOF) {
                result = [stx[0]];
                rest = stx.slice(1);
            } else {
                result = null;
                rest = stx;
            }
        // pattern has a parse class
        } else {
            var match = get_expression(stx, env);
            if(match.result === null) {
                result = null;
                rest = stx;
            } else if(patternClass === "lit") {
                if(!match.result.hasPrototype(Lit)) {
                    result = null;
                    rest = stx;
                } else {
                    result = [match.result.lit];
                    rest = match.rest;
                }
            } else if(patternClass === "ident") {
                if(!match.result.hasPrototype(Id)) {
                    result = null;
                    rest = stx;
                } else {
                    result = [match.result.id];
                    rest = match.rest;
                }
            } else if(patternClass === "expr") {
                if(!match.result.hasPrototype(Expr)) {
                    result = null;
                    rest = stx;
                } else {
                    result = match.result.destruct();
                    rest = match.rest;
                }
            } else {
                throwError("not implemented yet");
            }
        }

        return {
            result: result,
            rest: rest
        };
    }

    /* the pattern environment will look something like:
    {
        "$x": {
            level: 2,
            match: [{
                level: 1,
                match: [{
                    level: 0,
                    match: [tok1, tok2, ...]
                }, {
                    level: 0,
                    match: [tok1, tok2, ...]
                }]
            }, {
                level: 1,
                match: [{
                    level: 0,
                    match: [tok1, tok2, ...]
                }]
            }]
        },
        "$y" : ...
    }
    */
    function matchPattern(pattern, stx, env, patternEnv) {
        var subMatch;
        var match, matchEnv;
        var rest;
        var success;

        // exit early if we don't have more syntax to match
        if(stx.length === 0) {
            return {
                success: false,
                rest: stx,
                patternEnv: patternEnv
            };
        }

        parser.assert(stx.length > 0, "should have had something to match here");

        if(pattern.token.type === parser.Token.Delimiter) {
            if(pattern.class === "pattern_group") {
                // pattern groups don't match the delimiters
                subMatch = matchPatterns(pattern.token.inner, stx, env, patternEnv);
                rest = subMatch.rest;
            } else if (stx[0].token.type === parser.Token.Delimiter &&
                        stx[0].token.value === pattern.token.value) {
                subMatch = matchPatterns(pattern.token.inner, stx[0].token.inner, env, patternEnv);
                rest = stx.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx,
                    patternEnv: patternEnv
                };
            }
            success = subMatch.success;

            // merge the subpattern matches with the current pattern environment
            _.keys(subMatch.patternEnv).forEach(function(patternKey) {
                if(pattern.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel = subMatch.patternEnv[patternKey].level + 1;

                    if(patternEnv[patternKey]) {
                        patternEnv[patternKey].level = nextLevel;
                        patternEnv[patternKey].match.push(subMatch.patternEnv[patternKey]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv[patternKey] = {
                            level: nextLevel,
                            match: [subMatch.patternEnv[patternKey]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv[patternKey] = subMatch.patternEnv[patternKey];
                }
            });

        } else {
            if(pattern.class === "pattern_literal") {
                // match the literal but don't update the pattern environment
                if(pattern.token.value === stx[0].token.value) {
                    success = true;
                    rest = stx.slice(1);
                } else {
                    success = false;
                    rest = stx;
                }
            } else {
                match = matchPatternClass(pattern.class, stx, env);

                success = match.result !== null;
                rest = match.rest;
                matchEnv = {
                    level: 0,
                    match: match.result
                };

                // only update the pattern environment if we got a result
                if(match.result !== null) {
                    // push the match onto this value's slot in the environment
                    if(pattern.repeat) {
                        if(patternEnv[pattern.token.value]) {
                            patternEnv[pattern.token.value].match.push(matchEnv);
                        } else {
                            // initialize if necessary
                            patternEnv[pattern.token.value] = {
                                level: 1,
                                match: [matchEnv]
                            };
                        }
                    } else {
                        patternEnv[pattern.token.value] = matchEnv;
                    }
                }
            }
        }
        return {
            success: success,
            rest: rest,
            patternEnv: patternEnv
        };

    }


    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns(patterns, stx, env) {
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result = [];
        var patternEnv = {};

        var match;
        var pattern;
        var rest = stx;
        var success = true;

        for(var i = 0; i < patterns.length; i++) {
            pattern = patterns[i];
            do {
                match = matchPattern(pattern, rest, env, patternEnv);
                if(!match.success) {
                    success = false;
                }
                rest = match.rest;
                patternEnv = match.patternEnv;

                if(pattern.repeat && success) {
                    if(rest[0] && rest[0].token.value === pattern.separator) {
                        rest = rest.slice(1);
                    } else if (pattern.separator === " ") {
                        continue;
                    } else {
                        break;
                    }
                }
            } while(pattern.repeat && match.success && rest.length > 0);
        }
        return {
            success: success,
            rest: rest,
            patternEnv: patternEnv
        };
    }

    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe(macroBody, macroNameStx, env) {

        return _.chain(macroBody)
            .reduce(function(acc, bodyStx, idx, original) {
                    // first find the ellipses and mark the syntax objects
                    // (note that this step does not eagerly go into delimiter bodies)
                    var last = original[idx-1];
                    var next = original[idx+1];
                    var nextNext = original[idx+2];

                   // drop `...`
                    if(bodyStx.token.value === "...") {
                        return acc;
                    }
                    // drop `(<separator)` when followed by an ellipse
                    if(delimIsSeparator(bodyStx) && next && next.token.value === "...") {
                        return acc;
                    }

                    // skip the $ in $(...)
                    if (bodyStx.token.value === "$" &&
                            next &&
                            next.token.type === parser.Token.Delimiter &&
                            next.token.value === "()") {
                        return acc;
                    }

                    // mark $[...] as a literal
                    if(bodyStx.token.value === "$" &&
                            next &&
                            next.token.type === parser.Token.Delimiter &&
                            next.token.value === "[]") {
                        next.literal = true;
                        return acc;
                    }

                    if (bodyStx.token.type === parser.Token.Delimiter &&
                            bodyStx.token.value === "()" &&
                            last &&
                            last.token.value === "$") {
                        bodyStx.group = true;
                    }

                    // literal [] delimiters have their bodies just directly passed along
                    if(bodyStx.literal === true) {
                        parser.assert(bodyStx.token.type === parser.Token.Delimiter, "expecting a literal to be surrounded by []");
                        return acc.concat(bodyStx.token.inner);
                    }

                    if(next && next.token.value === "...") {
                        bodyStx.repeat = true;
                        bodyStx.separator = " "; // default to space separated
                    } else if(delimIsSeparator(next) && nextNext && nextNext.token.value === "...") {
                        bodyStx.repeat = true;
                        bodyStx.separator = next.token.inner[0].token.value;
                    }

                    return acc.concat(bodyStx);
                }, []).reduce(function(acc, bodyStx, idx) {
                // then do the actual transcription
                if(bodyStx.repeat) {
                    if(bodyStx.token.type === parser.Token.Delimiter) {

                        var fv = _.filter(freeVarsInPattern(bodyStx.token.inner), function(pat) {
                            // ignore "patterns" that aren't in the environment
                            // (treat them like literals)
                            return env.hasOwnProperty(pat);
                        });
                        var restrictedEnv = [];
                        var nonScalar = _.find(fv, function(pat) {
                            return env[pat].level > 0;
                        });

                        parser.assert(typeof nonScalar !== 'undefined', "must have a least one non-scalar in repeat");

                        var repeatLength = env[nonScalar].match.length;
                        var sameLength = _.all(fv, function(pat) {
                            return (env[pat].level === 0) || (env[pat].match.length === repeatLength);
                        });
                        parser.assert(sameLength, "all non-scalars must have the same length");

                        // create a list of envs restricted to the free vars
                        restrictedEnv = _.map(_.range(repeatLength), function(idx) {
                            var renv = {};
                            _.each(fv, function(pat) {
                                if(env[pat].level === 0) {
                                    // copy scalars over
                                    renv[pat] = env[pat];
                                } else {
                                    // grab the match at this index
                                    renv[pat] = env[pat].match[idx];
                                }
                            });
                            return renv;
                        });

                        var transcribed = _.map(restrictedEnv, function(renv) {
                            if(bodyStx.group) {
                                return transcribe(bodyStx.token.inner, macroNameStx, renv);
                            } else {
                                var newBody = syntaxFromToken(_.clone(bodyStx.token), bodyStx.context);
                                newBody.token.inner = transcribe(bodyStx.token.inner, macroNameStx, renv);
                                return newBody;
                            }
                        });
                        var joined;
                        if(bodyStx.group) {
                            joined = joinSyntaxArr(transcribed, bodyStx.separator);
                        } else {
                            joined = joinSyntax(transcribed, bodyStx.separator);
                        }

                        return acc.concat(joined);
                    }
                    parser.assert(env[bodyStx.token.value].level === 1, "ellipses level does not match");
                    return acc.concat(joinRepeatedMatch(env[bodyStx.token.value].match, bodyStx.separator));
                } else {
                    if(bodyStx.token.type === parser.Token.Delimiter) {
                        var newBody = syntaxFromToken(_.clone(bodyStx.token), macroBody.context);
                        newBody.token.inner = transcribe(bodyStx.token.inner, macroNameStx, env);
                        return acc.concat(newBody);
                    }
                    if(Object.prototype.hasOwnProperty.bind(env)(bodyStx.token.value)) {
                        parser.assert(env[bodyStx.token.value].level === 0, "match ellipses level does not match: " + bodyStx.token.value);
                        return acc.concat(takeLineContext(macroNameStx,
                                                          env[bodyStx.token.value].match));
                    }
                    return acc.concat(takeLineContext(macroNameStx, [bodyStx]));
                }
            }, []).value();
    }

    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv (newMark, env) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs(match) {
            if(match.level === 0) {
                // replace the match property with the marked syntax
                match.match = _.map(match.match, function(stx) {
                    return stx.mark(newMark);
                });
            } else {
                _.each(match.match, function(match) {
                    dfs(match);
                });
            }
        }
        _.keys(env).forEach(function(key) {
            dfs(env[key]);
        });
    }

    // create a macro transformer - a function that given the syntax at the macro call
    // will do the syntax transformation
    function makeTransformer(cases, macroName) {
        // grab the patterns from each case and sort them by longest number of patterns
        var sortedCases = _.sortBy(cases, function(mcase) {
                            return patternLength(mcase.pattern);
                        }).reverse();

        return function transformer(stx, macroNameStx, env) {
            var match;
            var casePattern, caseBody;
            var newMark;
            var macroResult;
            // try each case
            for(var i = 0; i < sortedCases.length; i++) {
                casePattern = sortedCases[i].pattern;
                caseBody = sortedCases[i].body;

                match = matchPatterns(casePattern, stx, env);
                if(match.success) {
                    newMark = fresh();
                    applyMarkToPatternEnv(newMark, match.patternEnv);
                    macroResult = transcribe(caseBody, macroNameStx, match.patternEnv);
                    macroResult = _.map(macroResult, function(stx) { return stx.mark(newMark); });
                    return {
                        result: macroResult,
                        rest: match.rest
                    };
                }
            }
            throwError("Could not match any cases for macro: " + macroNameStx.token.value);
        };
    }

    function findCase(start, stx) {
        parser.assert(start >= 0 && start < stx.length, "start out of bounds");
        var idx = start;
        while(idx < stx.length) {
            // todo: handle literal escape
            if(stx[idx].token.value === "case") {
                return idx;
            }
            idx++;
        }
        return -1;
    }

    // looking for index of `=>` in syntax array
    function findCaseArrow(start, stx) {
        parser.assert(start >= 0 && start < stx.length, "start out of bounds");
        var idx = start;
        while(idx < stx.length) {
            // todo: handle literal escape
            if(stx[idx].token.value === "=" && stx[idx+1] && stx[idx+1].token.value === ">") {
                return idx;
            }
            idx++;
        }
        return -1;
    }

    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef(mac) {
        var body = mac.body;
        var caseOffset = 0;
        var arrowOffset = 0;
        var casePattern;
        var caseBody;
        var caseBodyIdx;
        var cases = [];

        // load each of the macro cases
        while(caseOffset < body.length && body[caseOffset].token.value === "case") {
            arrowOffset = findCaseArrow(caseOffset, body);
            if(arrowOffset > 0 && arrowOffset < body.length) {
                // arrowOffset is at `=` in `=> {body}` so add two to get to the body
                caseBodyIdx = arrowOffset + 2;
                if(caseBodyIdx >= body.length) {
                    throwError("case body missing in macro definition");
                }

                casePattern = body.slice(caseOffset+1, arrowOffset);
                caseBody = body[caseBodyIdx].token.inner;

                cases.push({
                    pattern: loadPattern(casePattern, mac.name),
                    body: caseBody
                });
            } else {
                throwError("case body missing in macro definition");
            }

            caseOffset = findCase(arrowOffset, body);
            if(caseOffset < 0) {
                break;
            }
        }
        return makeTransformer(cases);
    }

    // expand all the macros
    function expand(toks, env, ctx) {
        var env = env || new Map();
        var ctx = ctx || {};

        if(toks.length === 0) {
            return [];
        }
        parser.assert(toks[0].token, "expecting a syntax object");

        var f = enforest(toks, env);
        var head = f.result;
        var rest = f.rest;

        if(head.hasPrototype(Macro)) {
            // load the macro definition into the environment and continue expanding
            var def = loadMacroDef(head);
            env.set(head.name.token.value, def);
            return expand(rest, env);
        } else if(head.hasPrototype(ArrayLiteral)) {
            head.array.delim.token.inner = expand(head.array.delim.token.inner, env);
            return [head].concat(expand(rest, env));
        // } else if(head.hasPrototype(ParenExpression)) {
        //     head.expr.delim.token.inner = expand(head.expr.delim.token.inner, env);
        //     return [head.expr].concat(expand(rest, env));
        } else if(head.hasPrototype(ObjectLiteral)) {
            head.body.delim.token.inner = expand(head.body.delim.token.inner, env);
            return [head].concat(expand(rest, env));
        } else if(head.hasPrototype(Delimiter)) {
            // expand inside the delimiter and then continue on
            head.delim.token.inner = expand(head.delim.token.inner, env);
            return [head].concat(expand(rest, env));
        // } else if(head.hasPrototype(BinOp)) {
        //     // head.left = expand(head.left.destruct(), env);
        //     var expanded = head.right.destruct();
        //     console.log(expanded);
        //     head.right = expand(expanded, env);
        //     return [head].concat(expand(rest, env));
        } else if (head.hasPrototype(NamedFun) || head.hasPrototype(AnonFun)) {
            // function definitions need a bunch of hygiene logic

            // get the parameters
            var stxParams = getArgList(head.params.delim);
            // create fresh names for each of them
            var freshNames = _.map(stxParams, function(param) {
                return "$" + fresh();
            });
            // zip the params and fresh names together
            var freshnameArgPairs = _.zip(freshNames, stxParams);
            // rename each parameter with the fresh names
            var renamedArgs = _.map(freshnameArgPairs, function(argPair) {
                var freshName = argPair[0];
                var arg = argPair[1];
                return arg.rename(arg, freshName);
            });
            // update the context with the fresh names
            var newCtx = _.reduce(_.zip(freshNames, renamedArgs), function (accEnv, argPair) {
                var freshName = argPair[0];
                var renamedArg = argPair[1];
                var o = {};
                o[freshName] = Var(renamedArg);
                return _.extend(o, accEnv);
            }, ctx);

            var stxBody = head.body.delim;
            // rename the function body for each of the parameters
            var renamedBody = _.reduce(freshnameArgPairs, function (accBody, argPair) {
                var freshName = argPair[0];
                var arg = argPair[1];
                return accBody.rename(arg, freshName);
            }, stxBody);

            // push a dummy rename to the body
            var dummyName = fresh();
            renamedBody = renamedBody.push_dummy_rename(dummyName);

            // expand the renamed body with the updated context
            var flatBody = expand([renamedBody], env, newCtx);
            var flatArgs = wrapDelim(joinSyntax(renamedArgs, ","), head.params.delim);

            // find all the var identifiers (eg x in `var x = 42`)
            parser.assert(flatBody[0].body && flatBody[0].body.delim, "expecting a delimiter in the flatBody");
            var varIdents = getVarIdentifiers(flatBody[0].body.delim);
            varIdents = _.filter(varIdents, function(varId) {
                // only pick the var identifiers that are not
                // resolve equal to a parameter of this function
                return !(_.any(renamedArgs, function(param) {
                    return resolve(varId) === resolve(param);
                }));
            });

            // create fresh names for each of the var idents
            var freshVarNames = _.map(varIdents, function() {
                return "$" + fresh();
            });
            // and zip them together
            var freshnameVarIdents = _.zip(freshVarNames, varIdents);

            // rename the var idents in the body
            var varRenamedFlatBody = _.reduce(freshnameVarIdents, function(accBody, varPair) {
                var freshName = varPair[0];
                var ident = varPair[1].rename(varPair[1], freshName);
                // first find and replace the var declarations
                var replacedBody = replaceVarIdent(accBody, varPair[1], ident);
                // var replacedBody = accBody; // replaceVarIdent(accBody, varPair[1], ident);
                // then swap the dummy renames
                return replacedBody.swap_dummy_rename(varPair[1], freshName, dummyName);
            }, flatBody[0].body.delim);

            // todo: shouldn't really be expander here right?
            var expandedArgs = expand([flatArgs], env, ctx);
            parser.assert(expandedArgs.length === 1, "should only get back one result");
            // stitch up the head with all the renamings
            head.params = expandedArgs[0];
            head.body.delim = varRenamedFlatBody;
            // and continue expand the rest
            return [head].concat(expand(rest, env));
        } else {
            // the head is fine as is, just keep expanding
            return [head].concat(expand(rest, env));
        }
    }

    // take our semi-structured TermTree and flatten it back to just
    // syntax objects to be used by the esprima parser. eventually this will
    // be replaced with a method of moving directly from a TermTree to an AST but
    // until then we'll just defer to esprima.
    function flatten(terms) {
        return _.reduce(terms, function(acc, term) {
            return acc.concat(term.destruct());
        }, []);
    }

    exports.enforest = enforest;
    exports.expand = expand;

    exports.resolve = resolve;

    exports.flatten = flatten;

    exports.tokensToSyntax = tokensToSyntax;
    exports.syntaxToTokens = syntaxToTokens;
}));