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
        factory(exports,
                require('underscore'),
                require('./parser'),
                require('./syntax'),
                require('./scopedEval'),
                require("./patterns"),
                require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports',
                'underscore',
                'parser',
                'syntax',
                'scopedEval',
                'patterns', 
                'escodegen'], factory);
    }
}(this, function(exports, _, parser, syn, se, patternModule, gen) {
    'use strict';
    // escodegen still doesn't quite support AMD: https://github.com/Constellation/escodegen/issues/115
    var codegen = typeof escodegen !== "undefined" ? escodegen : gen;
    var assert = syn.assert;
    var throwSyntaxError = syn.throwSyntaxError;
    var throwSyntaxCaseError = syn.throwSyntaxCaseError;
    var SyntaxCaseError = syn.SyntaxCaseError;
    var unwrapSyntax = syn.unwrapSyntax;

    macro _get_vars {
	    case {_ $val { } } => { return #{} }
	    case {
            _
		    $val {
			    $proto($field (,) ...) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        $(var $field = $val.$field;) ...
		            _get_vars $val { $rest ... }
            }
	    }
	    case {
            _
		    $val {
			    $proto($field (,) ...) | ($guard:expr) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        $(var $field = $val.$field;) ...
		            _get_vars $val { $rest ... }
            }
	    }
    }

    macro _case {
	    case {_ $val else {} } => { return #{} }
	    
	    case {
            _
		    $val else {
			default => { $body ... }
		    }
	    } => {
            return #{
		        else {
			        $body ...
		        }
            }
	    }
	    
	    case {
            _
		    $val else {
			    $proto($field (,) ...) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        else if($val.hasPrototype($proto)) {
			        $body ...
		        }
		        _case $val else { $rest ... }
            }
	    }
	    
	    case {
            _
		    $val else {
			    $proto($field (,) ...) | ($guard:expr) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        else if($val.hasPrototype($proto) && $guard) {
			        $body ...
		        }
		        _case $val else { $rest ... }
            }
	    }
	    
	    case {
            _
		    $val {
			    $proto($field ...) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        if ($val.hasPrototype($proto)) {
			        $body ...
		        }
		        _case $val else { $rest ... }
            }
	    }
	    
	    case {
            _
		    $val {
			    $proto($field ...) | ($guard:expr) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        if($val.hasPrototype($proto) && $guard) {
			        $body ...
		        }
		        _case $val else { $rest ... }
            }
	    }
    }

    macro case {
	    case {
            _
		    $val {
			    $proto($field (,) ...) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        _get_vars $val { $proto($field ...) => { $body ... } $rest ... }
		        _case $val { $proto($field (,) ...) => { $body ... } $rest ... }
            }
	    }
	    
	    case {
            _
		    $val {
			    $proto($field (,) ...) | ($guard:expr)  => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        _get_vars $val { $proto($field ...) | ($guard) => { $body ... } $rest ... }
		        _case $val { $proto($field (,) ...) | ($guard) => { $body ... } $rest ... }
            }
	    }
    }

    
    // used to export "private" methods for unit testing
    exports._test = {};

    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        "create": {
            value: function() {
                var o = Object.create(this);
                if (typeof o.construct === "function") {
                    o.construct.apply(o, arguments);
                }
                return o;
            },
            enumerable: false,
            writable: true
        },
        "extend": {
            value: function(properties) {
                var result = Object.create(this);
                for (var prop in properties) {
                    if (properties.hasOwnProperty(prop)) {
                        result[prop] = properties[prop];
                    }
                }
                return result;
            },
            enumerable: false,
            writable: true
        },
        "hasPrototype": {
            value: function(proto) {
                function F() {}
                F.prototype = proto;
                return this instanceof F;
            },
            enumerable: false,
            writable: true
        }
    });

    function StringMap(o) {
        this.__data = o || {};
    }

    StringMap.prototype = {
        has: function(key) {
            return Object.prototype.hasOwnProperty.call(this.__data, key);
        },
        get: function(key) {
            return this.has(key) ? this.__data[key] : void 0;
        },
        set: function(key, value) {
            this.__data[key] = value;
        },
        extend: function() {
            var args = _.map(_.toArray(arguments), function(x) {
                return x.__data;
            });
            _.extend.apply(_, [this.__data].concat(args));
            return this;
        }
    }

    var scopedEval = se.scopedEval;

    var Rename = syn.Rename;
    var Mark = syn.Mark;
    var Def = syn.Def;

    var syntaxFromToken = syn.syntaxFromToken;
    var joinSyntax = syn.joinSyntax;

    var builtinMode = false;
    var expandCount = 0;
    var maxExpands;

    var push = Array.prototype.push;

    function remdup(mark, mlist) {
        if (mark === _.first(mlist)) {
            return _.rest(mlist, 1);
        }
        return [mark].concat(mlist);
    }

    // (CSyntax) -> [...Num]
    function marksof(ctx, stopName, originalName) {
        var mark, submarks;

        if (ctx instanceof Mark) {
            mark = ctx.mark;
            submarks = marksof(ctx.context, stopName, originalName);
            return remdup(mark, submarks);
        }
        if(ctx instanceof Def) {
            return marksof(ctx.context, stopName, originalName);
        }
        if (ctx instanceof Rename) {
            if(stopName === originalName + "$" + ctx.name) {
                return [];
            }
            return marksof(ctx.context, stopName, originalName);
        }
        return [];
    }

    function resolve(stx) {
        return resolveCtx(stx.token.value, stx.context, [], []);
    }


    function arraysEqual(a, b) {
        if(a.length !== b.length) {
            return false;
        }
        for(var i = 0; i < a.length; i++) {
            if(a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    function renames(defctx, oldctx, originalName) {
        var acc = oldctx;
        for (var i = 0; i < defctx.length; i++) {
            if (defctx[i].id.token.value === originalName) {
                acc = new Rename(defctx[i].id, defctx[i].name, acc, defctx);
            }
        }
        return acc;
    }

    function unionEl(arr, el) {
        if (arr.indexOf(el) === -1) {
            var res = arr.slice(0);
            res.push(el);
            return res;
        }
        return arr;
    }

    // (Syntax) -> String
    function resolveCtx(originalName, ctx, stop_spine, stop_branch) {
        while (true) {
            if (ctx instanceof Mark) {
                ctx = ctx.context;
                continue;
            }
            if (ctx instanceof Def) {
                if (stop_spine.indexOf(ctx.defctx) !== -1) {
                    ctx = ctx.context;
                    continue;
                } else {
                    stop_branch = unionEl(stop_branch, ctx.defctx);
                    ctx = renames(ctx.defctx, ctx.context, originalName);
                    continue;
                }
            }
            if (ctx instanceof Rename) {
                if (originalName === ctx.id.token.value) {
                    var idName  = resolveCtx(ctx.id.token.value,
                                             ctx.id.context,
                                             stop_branch,
                                             stop_branch);
                    var subName = resolveCtx(originalName,
                                             ctx.context,
                                             unionEl(stop_spine, ctx.def),
                                             stop_branch);
                    if (idName === subName) {
                        var idMarks  = marksof(ctx.id.context,
                                               originalName + "$" + ctx.name,
                                               originalName);
                        var subMarks = marksof(ctx.context,
                                               originalName + "$" + ctx.name,
                                               originalName);
                        if (arraysEqual(idMarks, subMarks)) {
                            return originalName + "$" + ctx.name;
                        }
                    }
                }
                ctx = ctx.context;
                continue;
            }
            return originalName;
        }
    }

    var nextFresh = 0;

    // fun () -> Num
    function fresh() { return nextFresh++; }




    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim(towrap, delimSyntax) {
        assert(delimSyntax.token.type === parser.Token.Delimiter,
                      "expecting a delimiter token");

        return syntaxFromToken({
            type: parser.Token.Delimiter,
            value: delimSyntax.token.value,
            inner: towrap,
            range: delimSyntax.token.range,
            startLineNumber: delimSyntax.token.startLineNumber,
            lineStart: delimSyntax.token.lineStart
        }, delimSyntax);
    }

    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers(argSyntax) {
        if (argSyntax.token.type === parser.Token.Delimiter) {
            return _.filter(argSyntax.token.inner, function(stx) { return stx.token.value !== ","});
        } else if (argSyntax.token.type === parser.Token.Identifier) {
            return [argSyntax];
        } else {
            assert(false, "expecting a delimiter or a single identifier for function parameters");
        }
    }



    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree = {

        // Go back to the syntax object representation. Uses the
        // ordered list of properties that each subclass sets to
        // determine the order in which multiple children are
        // destructed.
        // () -> [...Syntax]
        destruct: function() {
            return _.reduce(this.properties, _.bind(function(acc, prop) {
                if (this[prop] && this[prop].hasPrototype(TermTree)) {
                    push.apply(acc, this[prop].destruct());
                    return acc;
                } else if (this[prop] && this[prop].token && this[prop].token.inner) {
                    var clone = syntaxFromToken(_.clone(this[prop].token), this[prop]);
                    clone.token.inner = _.reduce(clone.token.inner, function(acc, t) {
                        if (t.hasPrototype(TermTree)) {
                            push.apply(acc, t.destruct());
                            return acc;
                        }
                        acc.push(t);
                        return acc;
                    }, []);
                    acc.push(clone);
                    return acc;
                } else if (Array.isArray(this[prop])) {
                    var destArr = _.reduce(this[prop], function(acc, t) {
                        if (t.hasPrototype(TermTree)) {
                            push.apply(acc, t.destruct());
                            return acc;
                        } 
                        acc.push(t);
                        return acc;
                    }, []);
                    push.apply(acc, destArr);
                    return acc;
                } else if (this[prop]) {
                    acc.push(this[prop]);
                    return acc;
                } else {
                    return acc;
                }
            }, this), []);
        },

        addDefCtx: function(def) {
            _.each(_.range(this.properties.length), _.bind(function(i) {
                var prop = this.properties[i];
                if (Array.isArray(this[prop])) {
                    this[prop] = _.map(this[prop], function (item) {
                        return item.addDefCtx(def);
                    });
                } else if (this[prop]) {
                    this[prop] = this[prop].addDefCtx(def);
                }
            }, this));
            return this;
        },
        rename: function(id, name) {
            _.each(_.range(this.properties.length), _.bind(function(i) {
                var prop = this.properties[i];
                if (Array.isArray(this[prop])) {
                    this[prop] = _.map(this[prop], function (item) {
                        return item.rename(id, name);
                    });
                } else if (this[prop]) {
                    this[prop] = this[prop].rename(id, name);
                }
            }, this));
            return this;
        }
    };

    var EOF = TermTree.extend({
        properties: ["eof"],

        construct: function(e) { this.eof = e; }
    });


    var Statement = TermTree.extend({ construct: function() {} });

    var Expr = Statement.extend({ construct: function() {} });
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

    var Block = PrimaryExpression.extend({
        properties: ["body"],
        construct: function(body) { this.body = body; }
    });

    var ArrayLiteral = PrimaryExpression.extend({
        properties: ["array"],

        construct: function(ar) { this.array = ar; }
    });

    var ParenExpression = PrimaryExpression.extend({
        properties: ["expr"],
        construct: function(expr) { this.expr = expr; }
    });

    var UnaryOp = Expr.extend({
        properties: ["op", "expr"],

        construct: function(op, expr) {
            this.op = op;
            this.expr = expr;
        }
    });

    var PostfixOp = Expr.extend({
        properties: ["expr", "op"],

        construct: function(expr, op) {
            this.expr = expr;
            this.op = op;
        }
    });

    var BinOp = Expr.extend({
        properties: ["left", "op", "right"],

        construct: function(op, left, right) {
            this.op = op;
            this.left = left;
            this.right = right;
        }
    });

    var ConditionalExpression = Expr.extend({
        properties: ["cond", "question", "tru", "colon", "fls"],
        construct: function(cond, question, tru, colon, fls) {
            this.cond = cond;
            this.question = question;
            this.tru = tru;
            this.colon = colon;
            this.fls = fls;
        }
    });

    var AssignmentExpression = Expr.extend({
        properties: ['left', 'op', 'right'],
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

        construct: function(d) { this.delim = d; }
    });

    var Id = PrimaryExpression.extend({
        properties: ["id"],

        construct: function(id) { this.id = id; }
    });

    var NamedFun = Expr.extend({
        properties: ["keyword", "star", "name", "params", "body"],

        construct: function(keyword, star, name, params, body) {
            this.keyword = keyword;
            this.star = star;
            this.name = name;
            this.params = params;
            this.body = body;
        }
    });

    var AnonFun = Expr.extend({
        properties: ["keyword", "star", "params", "body"],

        construct: function(keyword, star, params, body) {
            this.keyword = keyword;
            this.star = star;
            this.params = params;
            this.body = body;
        }
    });

    var ArrowFun = Expr.extend({
        properties: ["params", "arrow", "body"],

        construct: function(params, arrow, body) {
            this.params = params;
            this.arrow = arrow;
            this.body = body;
        },

    });

    var LetMacro = TermTree.extend({
        properties: ["name", "body"],

        construct: function(name, body) {
            this.name = name;
            this.body = body;
        }
    })

    var Macro = TermTree.extend({
        properties: ["name", "body"],

        construct: function(name, body) {
            this.name = name;
            this.body = body;
        }
    });

    var AnonMacro = TermTree.extend({
        properties: ["body"],

        construct: function(body) {
            this.body = body;
        }
    });

    var Const = Expr.extend({
        properties: ["newterm", "call"],
        construct: function(newterm, call){
            this.newterm = newterm;
            this.call = call;
        }
    });

    var Call = Expr.extend({
        properties: ["fun", "args", "delim", "commas"],

        destruct: function() {
            assert(this.fun.hasPrototype(TermTree),
                "expecting a term tree in destruct of call");
            var commas = this.commas.slice();
            var delim = syntaxFromToken(_.clone(this.delim.token), this.delim);
            delim.token.inner = _.reduce(this.args, function(acc, term) {
                assert(term && term.hasPrototype(TermTree),
                       "expecting term trees in destruct of Call");
                push.apply(acc, term.destruct());
                // add all commas except for the last one
                if (commas.length > 0) {
                    acc.push(commas.shift());
                }
                return acc;
            }, []);
            var res = this.fun.destruct();
            push.apply(res, Delimiter.create(delim).destruct());
            return res;
        },

        construct: function(funn, args, delim, commas) {
            assert(Array.isArray(args), "requires an array of arguments terms");
            this.fun = funn;
            this.args = args;
            this.delim = delim;
            // an ugly little hack to keep the same syntax objects
            // (with associated line numbers etc.) for all the commas
            // separating the arguments
            this.commas = commas;
        }
    });


    var ObjDotGet = Expr.extend({
        properties: ["left", "dot", "right"],

        construct: function (left, dot, right) {
            this.left = left;
            this.dot = dot;
            this.right = right;
        }
    });

    var ObjGet = Expr.extend({
        properties: ["left", "right"],

        construct: function(left, right) {
            this.left = left;
            this.right = right;
        }
    });

    var VariableDeclaration = TermTree.extend({
        properties: ["ident", "eqstx", "init", "comma"],

        construct: function(ident, eqstx, init, comma) {
            this.ident = ident;
            this.eqstx = eqstx;
            this.init = init;
            this.comma = comma;
        }
    });

    var VariableStatement = Statement.extend({
        properties: ["varkw", "decls"],

        destruct: function() {
            return this.varkw
                .destruct()
                .concat(_.reduce(this.decls, function(acc, decl) {
                    push.apply(acc, decl.destruct());
                    return acc;
                }, []));
        },

        construct: function(varkw, decls) {
            assert(Array.isArray(decls), "decls must be an array");
            this.varkw = varkw;
            this.decls = decls;
        }
    });

    var LetStatement = Statement.extend({
        properties: ["letkw", "decls"],

        destruct: function() {
            return this.letkw
                .destruct()
                .concat(_.reduce(this.decls, function(acc, decl) {
                    push.apply(acc, decl.destruct());
                    return acc;
                }, []));
        },

        construct: function(letkw, decls) {
            assert(Array.isArray(decls), "decls must be an array");
            this.letkw = letkw;
            this.decls = decls;
        }
    });

    var ConstStatement = Statement.extend({
        properties: ["constkw", "decls"],

        destruct: function() {
            return this.constkw
                .destruct()
                .concat(_.reduce(this.decls, function(acc, decl) {
                    push.apply(acc, decl.destruct());
                    return acc;
                }, []));
        },

        construct: function(constkw, decls) {
            assert(Array.isArray(decls), "decls must be an array");
            this.constkw = constkw;
            this.decls = decls;
        }
    });

    var CatchClause = Statement.extend({
        properties: ["catchkw", "params", "body"],

        construct: function(catchkw, params, body) {
            this.catchkw = catchkw;
            this.params = params;
            this.body = body;
        }
    });

    var Module = TermTree.extend({
        properties: ["body", "exports"],

        construct: function(body) {
            this.body = body;
            this.exports = [];
        }
    });

    var Empty = Statement.extend({
        properties: [],
        construct: function() {}
    });

    var Export = TermTree.extend({
        properties: ["name"],
        construct: function(name) {
            this.name = name;
        }
    });

    var ForStatement = Statement.extend({
        properties: ["forkw", "cond"],

        construct: function (forkw, cond) {
            this.forkw = forkw;
            this.cond = cond;
        }
    });

    var YieldExpression = Expr.extend({
        properties: ["yieldkw", "expr"],

        construct: function(yieldkw, expr) {
            this.yieldkw = yieldkw;
            this.expr = expr;
        }
    })

    var Template = Expr.extend({
        properties: ["template"],
        
        construct: function(template) {
            this.template = template;
        }
    })

    function stxIsUnaryOp(stx) {
        var staticOperators = ["+", "-", "~", "!",
                                "delete", "void", "typeof",
                                "++", "--"];
        return _.contains(staticOperators, unwrapSyntax(stx));
    }

    function stxIsBinOp(stx) {
        var staticOperators = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^",
                                "==", "!=", "===", "!==", 
                                "<", ">", "<=", ">=", "in", "instanceof",
                                "<<", ">>", ">>>"];
        return _.contains(staticOperators, unwrapSyntax(stx));
    }

    function stxIsAssignOp(stx) {
        var staticOperators = ["=", "+=", "-=", "*=", "/=", "%=",
                               "<<=", ">>=", ">>>=",
                               "|=", "^=", "&="];
        return _.contains(staticOperators, unwrapSyntax(stx));
    }

    function enforestVarStatement(stx, context, varStx) {
        var isLet = /^(?:let|const)$/.test(varStx.token.value);
        var decls = [];
        var rest = stx;
        var rhs;

        if (!rest.length) {
            throwSyntaxError("enforest", "Unexpected end of input", varStx);
        }

        while (rest.length) {
            if (rest[0].token.type === parser.Token.Identifier) {
                if (isLet) {
                    var freshName = fresh();
                    var renamedId = rest[0].rename(rest[0], freshName);
                    rest = rest.map(function(stx) {
                        return stx.rename(rest[0], freshName);
                    });
                    rest[0] = renamedId;
                }
                if (rest[1].token.type === parser.Token.Punctuator &&
                    rest[1].token.value === "=") {
                    rhs = get_expression(rest.slice(2), context);
                    if (rhs.result == null) {
                        throwSyntaxError("enforest", "Unexpected token", rhs.rest[0]);
                    }
                    if (rhs.rest[0].token.type === parser.Token.Punctuator &&
                        rhs.rest[0].token.value === ",") {
                        decls.push(VariableDeclaration.create(rest[0], rest[1], rhs.result, rhs.rest[0]));
                        rest = rhs.rest.slice(1);
                        continue;
                    } else {
                        decls.push(VariableDeclaration.create(rest[0], rest[1], rhs.result, null));
                        rest = rhs.rest;
                        break;
                    }
                } else if (rest[1].token.type === parser.Token.Punctuator &&
                           rest[1].token.value === ",") {
                    decls.push(VariableDeclaration.create(rest[0], null, null, rest[1]));
                    rest = rest.slice(2);
                } else {
                    decls.push(VariableDeclaration.create(rest[0], null, null, null));
                    rest = rest.slice(1);
                    break;
                }
            } else {
                throwSyntaxError("enforest", "Unexpected token", rest[0]);
            }
        }

        return {
            result: decls,
            rest: rest
        }
    }

    function enforestOperator(stx, context, leftTerm, prevStx, prevTerms) {
        var opPrevStx, opPrevTerms, opRes, isAssign = stxIsAssignOp(stx[0]);

        // Check if the operator is a macro first.
        if (nameInEnv(stx[0], stx.slice(1), context.env)) {
            var headStx = tagWithTerm(leftTerm, leftTerm.destruct().reverse());
            opPrevStx = headStx.concat(prevStx);
            opPrevTerms = [leftTerm].concat(prevTerms);
            opRes = enforest(stx, context, opPrevStx, opPrevTerms);

            if (opRes.prevTerms.length < opPrevTerms.length) {
                return opRes;
            } else if(opRes.result) {
                return { result: leftTerm,
                         rest: opRes.result.destruct().concat(opRes.rest) };
            }
        }

        var op = stx[0];
        var left = leftTerm;
        var rightStx = stx.slice(1);

        opPrevStx = [stx[0]].concat(leftTerm.destruct().reverse(), prevStx);
        opPrevTerms = [Punc.create(stx[0]), leftTerm].concat(prevTerms);
        opRes = enforest(rightStx, context, opPrevStx, opPrevTerms);

        if(opRes.result) {
            // Lookbehind was matched, so it may not even be a binop anymore.
            if (opRes.prevTerms.length < opPrevTerms.length) {
                return opRes;
            }

            var right = opRes.result;
            // only a binop if the right is a real expression
            // so 2+2++ will only match 2+2
            if (right.hasPrototype(Expr)) {
                var term = (isAssign ?
                            AssignmentExpression.create(op, left, right) :
                            BinOp.create(op, left, right)); 
                return { result: term, rest: opRes.rest };
            }
        }
        else {
            return opRes;
        }
    }

    function adjustLineContext(stx, original, current) {
        current = current || {
            lastLineNumber: original.token.lineNumber,
            lineNumber: original.token.lineNumber - 1
        };

        return _.map(stx, function(stx) {
            if (stx.token.type === parser.Token.Delimiter) {
                // handle tokens with missing line info
                stx.token.startLineNumber = typeof stx.token.startLineNumber == 'undefined'
                                                ? original.token.lineNumber
                                                : stx.token.startLineNumber
                stx.token.endLineNumber = typeof stx.token.endLineNumber == 'undefined'
                                                ? original.token.lineNumber
                                                : stx.token.endLineNumber
                stx.token.startLineStart = typeof stx.token.startLineStart == 'undefined'
                                                ? original.token.lineStart
                                                : stx.token.startLineStart
                stx.token.endLineStart = typeof stx.token.endLineStart == 'undefined'
                                                ? original.token.lineStart
                                                : stx.token.endLineStart
                stx.token.startRange = typeof stx.token.startRange == 'undefined'
                                                ? original.token.range
                                                : stx.token.startRange
                stx.token.endRange = typeof stx.token.endRange == 'undefined'
                                                ? original.token.range
                                                : stx.token.endRange

                stx.token.sm_startLineNumber = typeof stx.token.sm_startLineNumber == 'undefined'
                                                ? stx.token.startLineNumber
                                                : stx.token.sm_startLineNumber;
                stx.token.sm_endLineNumber = typeof stx.token.sm_endLineNumber == 'undefined'
                                                ? stx.token.endLineNumber
                                                : stx.token.sm_endLineNumber;
                stx.token.sm_startLineStart = typeof stx.token.sm_startLineStart == 'undefined'
                                                ?  stx.token.startLineStart
                                                : stx.token.sm_startLineStart;
                stx.token.sm_endLineStart = typeof stx.token.sm_endLineStart == 'undefined'
                                                ? stx.token.endLineStart
                                                : stx.token.sm_endLineStart;
                stx.token.sm_startRange = typeof stx.token.sm_startRange == 'undefined'
                                                ? stx.token.startRange
                                                : stx.token.sm_startRange;
                stx.token.sm_endRange = typeof stx.token.sm_endRange == 'undefined'
                                                ? stx.token.endRange
                                                : stx.token.sm_endRange;

                if (stx.token.startLineNumber === current.lastLineNumber &&
                    current.lastLineNumber !== current.lineNumber) {
                    stx.token.startLineNumber = current.lineNumber;
                } else if (stx.token.startLineNumber !== current.lastLineNumber) {
                    current.lineNumber++;
                    current.lastLineNumber = stx.token.startLineNumber; 
                    stx.token.startLineNumber = current.lineNumber;
                }

                if (stx.token.inner.length > 0) {
                    stx.token.inner = adjustLineContext(stx.token.inner, original, current);
                }
                return stx;
            }
            // handle tokens with missing line info
            stx.token.lineNumber = typeof stx.token.lineNumber == 'undefined'
                                    ? original.token.lineNumber
                                    : stx.token.lineNumber;
            stx.token.lineStart = typeof stx.token.lineStart == 'undefined'
                                    ? original.token.lineStart
                                    : stx.token.lineStart;
            stx.token.range = typeof stx.token.range == 'undefined'
                                    ? original.token.range
                                    : stx.token.range;

            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx.token.sm_lineNumber = typeof stx.token.sm_lineNumber == 'undefined' 
                                        ? stx.token.lineNumber
                                        : stx.token.sm_lineNumber;
            stx.token.sm_lineStart = typeof stx.token.sm_lineStart == 'undefined'
                                        ? stx.token.lineStart
                                        : stx.token.sm_lineStart;
            stx.token.sm_range = typeof stx.token.sm_range == 'undefined'
                                    ? _.clone(stx.token.range)
                                    : stx.token.sm_range;

            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx.token.lineNumber === current.lastLineNumber &&
                current.lastLineNumber !== current.lineNumber) {
                stx.token.lineNumber = current.lineNumber;
            } else if (stx.token.lineNumber !== current.lastLineNumber) {
                current.lineNumber++;
                current.lastLineNumber = stx.token.lineNumber; 
                stx.token.lineNumber = current.lineNumber;
            }

            return stx;
        });
    }

    function getName(head, rest) {
        var idx = 0;
        var curr = head;
        var next = rest[idx];
        var name = [head];
        while (true) {
            if (next &&
                (next.token.type === parser.Token.Punctuator ||
                 next.token.type === parser.Token.Identifier ||
                 next.token.type === parser.Token.Keyword) &&
                curr.token.range[1] === next.token.range[0]) {
                name.push(next);
                curr = next;
                next = rest[++idx];
            } else {
                return name;
            }
        }
    }

    function getMacroInEnv(head, rest, env) {
        var name = getName(head, rest);
        // simple case, don't need to create a new syntax object
        if (name.length === 1) {
            var resolvedName = resolve(name[0]);
            if (env.has(resolvedName)) {
                return env.get(resolvedName);
            }
            return null;
        } else {
            while (name.length > 0) {
                var nameStr = name.map(unwrapSyntax).join("");
                var nameStx = syn.makeIdent(nameStr, name[0]);
                var resolvedName = resolve(nameStx);
                var inEnv = env.has(resolvedName);
                if (inEnv) {
                    return env.get(resolvedName);
                }
                name.pop();
            }
            return null;
        }
    }

    function nameInEnv(head, rest, env) {
        if (head.token.type === parser.Token.Identifier ||
            head.token.type === parser.Token.Keyword ||
            head.token.type === parser.Token.Punctuator) {
            return getMacroInEnv(head, rest, env) !== null;
        }
        return false;
    }

    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest(toks, context, prevStx, prevTerms) {
        assert(toks.length > 0, "enforest assumes there are tokens to work with");

        prevStx = prevStx || [];
        prevTerms = prevTerms || [];

        function step(head, rest) {
            var innerTokens;
            assert(Array.isArray(rest), "result must at least be an empty array");
            if (head.hasPrototype(TermTree)) {

                // function call
                case head {

                    // Call
                    Expr(emp) | (rest[0] && 
                                 rest[0].token.type === parser.Token.Delimiter &&
                                 rest[0].token.value === "()") => {
                        var argRes, enforestedArgs = [], commas = [];
                        rest[0].expose();
                        innerTokens = rest[0].token.inner;
                        while (innerTokens.length > 0) {
                            argRes = enforest(innerTokens, context);
                            enforestedArgs.push(argRes.result);
                            innerTokens = argRes.rest;
                            if (innerTokens[0] && innerTokens[0].token.value === ",") {
                                // record the comma for later
                                commas.push(innerTokens[0]);
                                // but dump it for the next loop turn
                                innerTokens = innerTokens.slice(1);
                            } else {
                                // either there are no more tokens or
                                // they aren't a comma, either way we
                                // are done with the loop
                                break;
                            }
                        }
                        var argsAreExprs = _.all(enforestedArgs, function(argTerm) {
                            return argTerm.hasPrototype(Expr)
                        });

                        // only a call if we can completely enforest each argument and
                        // each argument is an expression
                        if (innerTokens.length === 0 && argsAreExprs) {
                            return step(Call.create(head,
                                                    enforestedArgs,
                                                    rest[0],
                                                    commas),
                                        rest.slice(1));
                        }
                    }

                    // Conditional ( x ? true : false)
                    Expr(emp) | (rest[0] && resolve(rest[0]) === "?") => {
                        var question = rest[0];
                        var condRes = enforest(rest.slice(1), context);
                        var truExpr = condRes.result;
                        var condRight = condRes.rest;
                        if(truExpr.hasPrototype(Expr) &&
                           condRight[0] && resolve(condRight[0]) === ":") {
                            var colon = condRight[0];
                            var flsRes = enforest(condRight.slice(1), context);
                            var flsExpr = flsRes.result;
                            if(flsExpr.hasPrototype(Expr)) {
                                return step(ConditionalExpression.create(head,
                                                                         question,
                                                                         truExpr,
                                                                         colon,
                                                                         flsExpr),
                                            flsRes.rest);
                            }
                        }
                    }

                    // Constructor
                    Keyword(keyword) | (resolve(keyword) === "new" && rest[0]) => {
                        var newCallRes = enforest(rest, context);
                        if(newCallRes.result.hasPrototype(Call)) {
                            return step(Const.create(head, newCallRes.result),
                                        newCallRes.rest);
                        }
                    }

                    // Arrow functions with expression bodies
                    Delimiter(delim) | (delim.token.value === "()" &&
                                         rest[0] &&
                                         rest[0].token.type === parser.Token.Punctuator &&
                                         resolve(rest[0]) === "=>") => {
                        var arrowRes = enforest(rest.slice(1), context);
                        if (arrowRes.result.hasPrototype(Expr)) {
                            return step(ArrowFun.create(delim, rest[0], arrowRes.result.destruct()), 
                                        arrowRes.rest);
                        } else {
                            throwSyntaxError("enforest", "Body of arrow function must be an expression", rest.slice(1));
                        }
                    }

                    // Arrow functions with expression bodies
                    Id(id) | (rest[0] &&
                                 rest[0].token.type === parser.Token.Punctuator &&
                                 resolve(rest[0]) === "=>") => {
                        var res = enforest(rest.slice(1), context);
                        if (res.result.hasPrototype(Expr)) {
                            return step(ArrowFun.create(id, rest[0], res.result.destruct()), 
                                        res.rest);
                        } else {
                            throwSyntaxError("enforest", "Body of arrow function must be an expression", rest.slice(1));
                        }
                    }

                    // ParenExpr
                    Delimiter(delim) | (delim.token.value === "()") => {
                        innerTokens = delim.token.inner;
                        // empty parens are acceptable but enforest
                        // doesn't accept empty arrays so short
                        // circuit here
                        if (innerTokens.length === 0) {
                            return step(ParenExpression.create(head), rest);
                        } else {
                            var innerTerm = get_expression(innerTokens, context);
                            if (innerTerm.result &&
                                innerTerm.result.hasPrototype(Expr)) {
                                return step(ParenExpression.create(head), rest);
                            }
                            // if the tokens inside the paren aren't an expression
                            // we just leave it as a delimiter
                        }
                    }

                    // BinOp
                    Expr(emp) | (rest[0] && rest[1] && stxIsBinOp(rest[0])) => {
                       var opRes = enforestOperator(rest, context, head, prevStx, prevTerms);
                       if(opRes && opRes.result) {
                           return step(opRes.result, opRes.rest, prevStx, prevTerms);
                       }
                    }

                    // AssignmentExpression
                    Expr(emp) | ((head.hasPrototype(Id) ||
                                  head.hasPrototype(ObjGet) ||
                                  head.hasPrototype(ObjDotGet) ||
                                  head.hasPrototype(ThisExpression)) &&
                                rest[0] && rest[1] && stxIsAssignOp(rest[0])) => {
                       var opRes = enforestOperator(rest, context, head, prevStx, prevTerms);
                       if(opRes && opRes.result) {
                           return step(opRes.result, opRes.rest, prevStx, prevTerms);
                       }
                    }

                    // UnaryOp (via punctuation)
                    Punc(punc) | (stxIsUnaryOp(punc)) => {
                        // Reference the term on the syntax object for lookbehind.
                        head.punc.term = head;

                        var unopPrevStx = [punc].concat(prevStx);
                        var unopPrevTerms = [head].concat(prevTerms);
                        var unopRes = enforest(rest, context, unopPrevStx, unopPrevTerms);

                        // Lookbehind was matched, so it may not even be a unop anymore
                        if (unopRes.prevTerms.length < unopPrevTerms.length) {
                            return unopRes;
                        }

                        if (unopRes.result.hasPrototype(Expr)) {
                            return step(UnaryOp.create(punc, unopRes.result),
                                        unopRes.rest);
                        }
                    }

                    // UnaryOp (via keyword)
                    Keyword(keyword) | (stxIsUnaryOp(keyword)) => {
                        // Reference the term on the syntax object for lookbehind.
                        head.keyword.term = head;

                        var unopKeyPrevStx = [keyword].concat(prevStx);
                        var unopKeyPrevTerms = [head].concat(prevTerms);
                        var unopKeyres = enforest(rest, context, unopKeyPrevStx, unopKeyPrevTerms);

                        // Lookbehind was matched, so it may not even be a unop anymore
                        if (unopKeyres.prevTerms.length < unopKeyPrevTerms.length) {
                            return unopKeyres;
                        }

                        if (unopKeyres.result.hasPrototype(Expr)) {
                            return step(UnaryOp.create(keyword, unopKeyres.result),
                                        unopKeyres.rest);
                        }
                    }

                    // Postfix
                    Expr(emp) | (rest[0] && (unwrapSyntax(rest[0]) === "++" || 
                                            unwrapSyntax(rest[0]) === "--")) => {
                        // Check if the operator is a macro first.
                        if (context.env.has(resolve(rest[0]))) {
                            var headStx = tagWithTerm(head, head.destruct().reverse());
                            var opPrevStx = headStx.concat(prevStx);
                            var opPrevTerms = [head].concat(prevTerms);
                            var opRes = enforest(rest, context, opPrevStx, opPrevTerms);
                            
                            if (opRes.prevTerms.length < opPrevTerms.length) {
                                return opRes;
                            } else {
                                return step(head,
                                            opRes.result.destruct().concat(opRes.rest));
                            }
                        }
                        return step(PostfixOp.create(head, rest[0]), rest.slice(1));
                    }

                    // ObjectGet (computed)
                    Expr(emp) | (rest[0] && rest[0].token.value === "[]") => {
                        return step(ObjGet.create(head, Delimiter.create(rest[0].expose())),
                                    rest.slice(1));
                    }

                    // ObjectGet
                    Expr(emp) | (rest[0] && unwrapSyntax(rest[0]) === "." &&
                                 !context.env.has(resolve(rest[0])) &&
                                 rest[1] &&
                                 rest[1].token.type === parser.Token.Identifier) => {
                        // Check if the identifier is a macro first.
                        if (context.env.has(resolve(rest[1]))) {
                            var headStx = tagWithTerm(head, head.destruct().reverse());
                            var dotTerm = Punc.create(rest[0]);
                            var dotTerms = [dotTerm].concat(head, prevTerms);
                            var dotStx = tagWithTerm(dotTerm, [rest[0]]).concat(headStx, prevStx);
                            var dotRes = enforest(rest.slice(1), context, dotStx, dotTerms);

                            if (dotRes.prevTerms.length < dotTerms.length) {
                                return dotRes;
                            } else {
                                return step(head,
                                            [rest[0]].concat(dotRes.result.destruct(), dotRes.rest));
                            }
                        }
                        return step(ObjDotGet.create(head, rest[0], rest[1]),
                                    rest.slice(2));
                    }

                    // ArrayLiteral
                    Delimiter(delim) | (delim.token.value === "[]") => {
                        return step(ArrayLiteral.create(head), rest);
                    }

                    // Block
                    Delimiter(delim) | (head.delim.token.value === "{}") => {
                        return step(Block.create(head), rest);
                    }

                    Id(id) | (unwrapSyntax(id) === "#quoteSyntax" && 
                                rest[0] && rest[0].token.value === "{}") => {

                        var tempId = fresh();
                        context.templateMap.set(tempId, rest[0].token.inner);
                        return step(syn.makeIdent("getTemplate", id), 
                                    [syn.makeDelim("()", [syn.makeValue(tempId, id)], id)].concat(rest.slice(1)));
                    }


                    
                    Keyword(keyword) | (resolve(keyword) === "let") => {
                        var nameTokens = [];
                        if (rest[0] && rest[0].token.type === parser.Token.Delimiter &&
                            rest[0].token.value === "()") {
                            nameTokens = rest[0].token.inner;
                        } else {
                            nameTokens.push(rest[0]);
                        }

                        // Let macro
                        if (rest[1] && rest[1].token.value === "=" &&
                            rest[2] && rest[2].token.value === "macro") {
                            var mac = enforest(rest.slice(2), context);
                            if (!mac.result.hasPrototype(AnonMacro)) {
                                throwSyntaxError("enforest", "expecting an anonymous macro definition in syntax let binding", rest.slice(2));
                            }
                            return step(LetMacro.create(nameTokens, mac.result.body), mac.rest);
                        // Let statement
                        } else {
                            var lsRes = enforestVarStatement(rest, context, keyword);
                            if (lsRes) {
                                return step(LetStatement.create(head, lsRes.result),
                                            lsRes.rest);
                            }
                        }

                                  
                    }
                    // VariableStatement
                    Keyword(keyword) | (resolve(keyword) === "var" && rest[0]) => {
                        var vsRes = enforestVarStatement(rest, context, keyword);
                        if (vsRes) {
                            return step(VariableStatement.create(head, vsRes.result),
                                        vsRes.rest);
                        }
                    }
                    // Const Statement
                    Keyword(keyword) | (resolve(keyword) === "const" && rest[0]) => {
                        var csRes = enforestVarStatement(rest, context, keyword);
                        if (csRes) {
                            return step(ConstStatement.create(head, csRes.result),
                                        csRes.rest);
                        }
                    }

                    Keyword(keyword) | (resolve(keyword) === "for" && 
                                        rest[0] && rest[0].token.value === "()") => {
                        return step(ForStatement.create(keyword, rest[0]), 
                                    rest.slice(1));
                    }

                    Keyword(keyword) | (resolve(keyword) === "yield") => {
                        var yieldExprRes = enforest(rest, context);

                        if (yieldExprRes.result.hasPrototype(Expr)) {
                            return step(YieldExpression.create(keyword, yieldExprRes.result),
                                        yieldExprRes.rest);
                        }
                    }
                }
            } else {
                assert(head && head.token, "assuming head is a syntax object");

                // macro invocation
                if ((head.token.type === parser.Token.Identifier ||
                     head.token.type === parser.Token.Keyword ||
                     head.token.type === parser.Token.Punctuator) && 
                    (expandCount < maxExpands) &&
                    nameInEnv(head, rest, context.env)) {

                    // pull the macro transformer out the environment
                    var macroObj = getMacroInEnv(head, rest, context.env);
                    var transformer = macroObj.fn;

                    // create a new mark to be used for the input to
                    // the macro
                    var newMark = fresh();
                    var transformerContext = makeExpanderContext(_.defaults({mark: newMark}, context));


                    if(!builtinMode && !macroObj.builtin) {
                        expandCount++;
                    }

                    // apply the transformer
                    var rt;
                    try {
                        rt = transformer([head].concat(rest.slice(macroObj.fullName.length - 1)), transformerContext, prevStx, prevTerms);
                    } catch (e) {
                        if (e instanceof SyntaxCaseError) {
                            // add a nicer error for syntax case
                            var argumentString = "`" + rest.slice(0, 5).map(function(stx) {
                                return stx.token.value;
                            }).join(" ") + "...`";
                            throwSyntaxError("macro", "Macro `" + head.token.value + 
                                                          "` could not be matched with " + 
                                                          argumentString,
                                                          head);
                        }
                        else {
                            // just rethrow it
                            throw e;
                        } 
                    }

                    if (rt.prevTerms) {
                        prevTerms = rt.prevTerms;
                    }
                    if (rt.prevStx) {
                        prevStx = rt.prevStx;
                    }

                    if(!Array.isArray(rt.result)) {
                        throwSyntaxError("enforest", "Macro must return a syntax array", head);
                    }

                    if(rt.result.length > 0) {
                        var adjustedResult = adjustLineContext(rt.result, head);
                        if (head.token.leadingComments) {
                            if (adjustedResult[0].token.leadingComments) {
                                adjustedResult[0].token.leadingComments = adjustedResult[0].token.leadingComments.concat(head.token.leadingComments);
                            } else {
                                adjustedResult[0].token.leadingComments = head.token.leadingComments;
                            }
                        }
                        return step(adjustedResult[0], adjustedResult.slice(1).concat(rt.rest));
                    } else {
                        return step(Empty.create(), rt.rest);
                    } 
                // anon macro definition
                } else if (head.token.type === parser.Token.Identifier &&
                           head.token.value === "macro" && 
                           rest[0] && rest[0].token.value === "{}") {

                    return step(AnonMacro.create(rest[0].expose().token.inner), 
                                rest.slice(1));
                // macro definition
                } else if (head.token.type === parser.Token.Identifier &&
                           head.token.value === "macro") {
                    var nameTokens = [];
                    if (rest[0] && rest[0].token.type === parser.Token.Delimiter &&
                        rest[0].token.value === "()") {
                        nameTokens = rest[0].expose().token.inner;
                    } else {
                        nameTokens.push(rest[0])
                    }
                    if (rest[1] && rest[1].token.type === parser.Token.Delimiter) {
                        return step(Macro.create(nameTokens, rest[1].expose().token.inner),
                                    rest.slice(2));
                    } else {
                        throwSyntaxError("enforest", "Macro declaration must include body", rest[1]);
                    }
                // module definition
                } else if (unwrapSyntax(head) === "module" && 
                            rest[0] && rest[0].token.value === "{}") {
                    return step(Module.create(rest[0]), rest.slice(1));
                // function definition
                } else if (head.token.type === parser.Token.Keyword &&
                    unwrapSyntax(head) === "function" &&
                    rest[0] && rest[0].token.type === parser.Token.Identifier &&
                    rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                    rest[1].token.value === "()" &&
                    rest[2] && rest[2].token.type === parser.Token.Delimiter &&
                    rest[2].token.value === "{}") {

                    rest[1].token.inner = rest[1].expose().token.inner;
                    rest[2].token.inner = rest[2].expose().token.inner;
                    return step(NamedFun.create(head, null, rest[0],
                                                rest[1],
                                                rest[2]),
                                rest.slice(3));
                // generator function definition
                } else if (head.token.type === parser.Token.Keyword &&
                    unwrapSyntax(head) === "function" &&
                    rest[0] && rest[0].token.type === parser.Token.Punctuator &&
                    rest[0].token.value === "*" &&
                    rest[1] && rest[1].token.type === parser.Token.Identifier &&
                    rest[2] && rest[2].token.type === parser.Token.Delimiter &&
                    rest[2].token.value === "()" &&
                    rest[3] && rest[3].token.type === parser.Token.Delimiter &&
                    rest[3].token.value === "{}") {

                    rest[2].token.inner = rest[2].expose().token.inner;
                    rest[3].token.inner = rest[3].expose().token.inner;
                    return step(NamedFun.create(head, rest[0], rest[1],
                                                rest[2],
                                                rest[3]),
                                rest.slice(4));
                // anonymous function definition
                } else if(head.token.type === parser.Token.Keyword &&
                    unwrapSyntax(head) === "function" &&
                    rest[0] && rest[0].token.type === parser.Token.Delimiter &&
                    rest[0].token.value === "()" &&
                    rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                    rest[1].token.value === "{}") {

                    rest[0].token.inner = rest[0].expose().token.inner;
                    rest[1].token.inner = rest[1].expose().token.inner;
                    return step(AnonFun.create(head,
                                                null,
                                                rest[0],
                                                rest[1]),
                                rest.slice(2));
                // anonymous generator function definition
                } else if(head.token.type === parser.Token.Keyword &&
                    unwrapSyntax(head) === "function" &&
                    rest[0] && rest[0].token.type === parser.Token.Punctuator &&
                    rest[0].token.value === "*" &&
                    rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                    rest[1].token.value === "()" &&
                    rest[2] && rest[2].token.type === parser.Token.Delimiter &&
                    rest[2].token.value === "{}") {

                    rest[1].token.inner = rest[1].expose().token.inner;
                    rest[2].token.inner = rest[2].expose().token.inner;
                    return step(AnonFun.create(head,
                                                rest[0],
                                                rest[1],
                                                rest[2]),
                                rest.slice(3));
                // arrow function
                } else if(((head.token.type === parser.Token.Delimiter && 
                            head.token.value === "()") ||
                            head.token.type === parser.Token.Identifier) &&
                            rest[0] && rest[0].token.type === parser.Token.Punctuator &&
                            resolve(rest[0]) === "=>" &&
                            rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                            rest[1].token.value === "{}") {
                    return step(ArrowFun.create(head, rest[0], rest[1]),
                                rest.slice(2));
                // catch statement
                } else if (head.token.type === parser.Token.Keyword &&
                           unwrapSyntax(head) === "catch" &&
                           rest[0] && rest[0].token.type === parser.Token.Delimiter &&
                           rest[0].token.value === "()" &&
                           rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                           rest[1].token.value === "{}") {
                    rest[0].token.inner = rest[0].expose().token.inner;
                    rest[1].token.inner = rest[1].expose().token.inner;
                    return step(CatchClause.create(head, rest[0], rest[1]),
                               rest.slice(2));
                // this expression
                } else if (head.token.type === parser.Token.Keyword &&
                    unwrapSyntax(head) === "this") {

                    return step(ThisExpression.create(head), rest);
                // literal
                } else if (head.token.type === parser.Token.NumericLiteral ||
                    head.token.type === parser.Token.StringLiteral ||
                    head.token.type === parser.Token.BooleanLiteral ||
                    head.token.type === parser.Token.RegularExpression ||
                    head.token.type === parser.Token.NullLiteral) {

                    return step(Lit.create(head), rest);
                // export
                } else if (head.token.type === parser.Token.Keyword && 
                            unwrapSyntax(head) === "export" && 
                            rest[0] && (rest[0].token.type === parser.Token.Identifier ||
                                        rest[0].token.type === parser.Token.Keyword ||
                                        rest[0].token.type === parser.Token.Punctuator)) {
                    return step(Export.create(rest[0]), rest.slice(1));
                // identifier
                } else if (head.token.type === parser.Token.Identifier) {
                    return step(Id.create(head), rest);
                // punctuator
                } else if (head.token.type === parser.Token.Punctuator) {
                    return step(Punc.create(head), rest);
                } else if (head.token.type === parser.Token.Keyword &&
                            unwrapSyntax(head) === "with") {
                    throwSyntaxError("enforest", "with is not supported in sweet.js", head); 
                // keyword
                } else if (head.token.type === parser.Token.Keyword) {
                    return step(Keyword.create(head), rest);
                // Delimiter
                } else if (head.token.type === parser.Token.Delimiter) {
                    return step(Delimiter.create(head.expose()), rest);
                } else if (head.token.type === parser.Token.Template) {
                    return step(Template.create(head), rest);
                // end of file
                } else if (head.token.type === parser.Token.EOF) {
                    assert(rest.length === 0, "nothing should be after an EOF");
                    return step(EOF.create(head), []);
                } else {
                    // todo: are we missing cases?
                    assert(false, "not implemented");
                }

            }

            // we're done stepping
            return {
                result: head,
                rest: rest,
                prevStx: prevStx,
                prevTerms: prevTerms
            };

        }

        return step(toks[0], toks.slice(1));
    }

    function get_expression(stx, context) {
        var res = enforest(stx, context);
        var next = res;
        var peek;
        var prevStx;

        if (!next.result.hasPrototype(Expr)) {
            return {
                result: null,
                rest: stx
            }
        }

        while (next.rest.length &&
                nameInEnv(next.rest[0], next.rest.slice(1), context.env)) {

            // Enforest the next term tree since it might be an infix macro that
            // consumes the initial expression.
            peek = enforest(next.rest, context, next.result.destruct(), [next.result]);

            // If it has prev terms it wasn't infix, but it we need to run it
            // through enforest together with the initial expression to see if
            // it extends it into a longer expression.
            if (peek.prevTerms.length === 1) {
                peek = enforest([next.result].concat(peek.result.destruct(), peek.rest), context);
            }

            // No new expression was created, so we've reached the end.
            if (peek.result === next.result) {
                return peek;
            }

            // A new expression was created, so loop back around and keep going.
            next = peek;
        }

        return next;
    }

    function tagWithTerm(term, stx) {
        _.forEach(stx, function(s) {
            s.term = term;
        });
        return stx;
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
            if (match.level === 0) {
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


    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef(mac, context) {
        var body = mac.body;

        // raw function primitive form
        if(!(body[0] && body[0].token.type === parser.Token.Keyword &&
             body[0].token.value === "function")) {
            throwSyntaxError("load macro", "Primitive macro form must contain a function for the macro body", body);
        }

        var stub = parser.read("()");
        stub[0].token.inner = body;
        var expanded = expand(stub, context);
        expanded = expanded[0].destruct().concat(expanded[1].eof);
        var flattend = flatten(expanded);
        var bodyCode = codegen.generate(parser.parse(flattend));

        var macroFn = scopedEval(bodyCode, {
            makeValue: syn.makeValue,
            makeRegex: syn.makeRegex,
            makeIdent: syn.makeIdent,
            makeKeyword: syn.makeKeyword,
            makePunc: syn.makePunc,
            makeDelim: syn.makeDelim,
            require: function(id) {
                if (context.requireModule) {
                    return context.requireModule(id, context.filename);
                }
                return require(id);
            },
            getExpr: function(stx) {
                var r;
                if (stx.length === 0) {
                    return {
                        success: false,
                        result: [],
                        rest: []
                    };
                }
                r = get_expression(stx, context);
                return {
                    success: r.result !== null,
                    result: r.result === null ? [] : r.result.destruct(),
                    rest: r.rest
                };
            },
            getIdent: function(stx) {
                if (stx[0] && stx[0].token.type === parser.Token.Identifier) {
                    return {
                        success: true,
                        result: [stx[0]],
                        rest: stx.slice(1)
                    };
                }
                return {
                    success: false,
                    result: [],
                    rest: stx
                };
            },
            getLit: function(stx) {
                if (stx[0] && patternModule.typeIsLiteral(stx[0].token.type)) {
                    return {
                        success: true,
                        result: [stx[0]],
                        rest: stx.slice(1)
                    };
                }
                return {
                    success: false,
                    result: [],
                    rest: stx
                };
            },
            unwrapSyntax: syn.unwrapSyntax,
            throwSyntaxError: throwSyntaxError,
            throwSyntaxCaseError: throwSyntaxCaseError,
            prettyPrint: syn.prettyPrint,
            parser: parser,
            __fresh: fresh,
            _: _,
            patternModule: patternModule,
            getPattern: function(id) {
                return context.patternMap.get(id);
            },
            getTemplate: function(id) {
                return syn.cloneSyntaxArray(context.templateMap.get(id));
            },
            applyMarkToPatternEnv: applyMarkToPatternEnv,
            mergeMatches: function(newMatch, oldMatch) {
                newMatch.patternEnv = _.extend({}, oldMatch.patternEnv, newMatch.patternEnv);
                return newMatch;
            }
        }); 

        return macroFn;
    }

    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree(stx, context) {
        assert(context, "expander context is required");

        var f, head, prevStx, prevTerms, macroDefinition;
        var rest = stx;

        while (rest.length > 0) {
            assert(rest[0].token, "expecting a syntax object");

            f = enforest(rest, context, prevStx, prevTerms);
            // head :: TermTree
            head = f.result;
            // rest :: [Syntax]
            rest = f.rest;

            if (head.hasPrototype(Macro) && expandCount < maxExpands) {
                // load the macro definition into the environment and continue expanding
                macroDefinition = loadMacroDef(head, context);
                var name = head.name.map(unwrapSyntax).join("");
                var nameStx = syn.makeIdent(name, head.name[0]);
                addToDefinitionCtx([nameStx], context.defscope, false);
                context.env.set(resolve(nameStx), {
                    fn: macroDefinition,
                    builtin: builtinMode,
                    fullName: head.name
                });

                continue;
            }

            if (head.hasPrototype(LetMacro) && expandCount < maxExpands) {
                // load the macro definition into the environment and continue expanding
                macroDefinition = loadMacroDef(head, context);
                var freshName = fresh();
                var name = head.name.map(unwrapSyntax).join("");
                var nameStx = syn.makeIdent(name, head.name[0]);
                var renamedName = nameStx.rename(nameStx, freshName);
                rest = _.map(rest, function(stx) {
                    return stx.rename(nameStx, freshName);
                });

                context.env.set(resolve(renamedName), {
                    fn: macroDefinition,
                    builtin: builtinMode,
                    fullName: head.name
                });

                continue;
            }



            // We build the newPrevTerms/Stx here (instead of at the beginning) so
            // that macro definitions don't get added to it.
            var destructed = tagWithTerm(head, f.result.destruct());
            prevTerms = [head].concat(f.prevTerms);
            prevStx = destructed.reverse().concat(f.prevStx);

            if (head.hasPrototype(NamedFun)) {
                addToDefinitionCtx([head.name], context.defscope, true);
            }

            if (head.hasPrototype(VariableStatement)) {
                addToDefinitionCtx(_.map(head.decls, function(decl) { return decl.ident; }),
                                   context.defscope,
                                   true)
            }

            if(head.hasPrototype(Block) && head.body.hasPrototype(Delimiter)) {
                head.body.delim.token.inner.forEach(function(term) {
                    if (term.hasPrototype(VariableStatement)) {
                        addToDefinitionCtx(_.map(term.decls, function(decl)  { return decl.ident; }),
                                           context.defscope,
                                           true);
                    }
                });

            } 

            if(head.hasPrototype(Delimiter)) {
                head.delim.token.inner.forEach(function(term)  {
                    if (term.hasPrototype(VariableStatement)) {
                        addToDefinitionCtx(_.map(term.decls, function(decl) { return decl.ident; }),
                                           context.defscope,
                                           true);
                                          
                    }
                });
            }

            if (head.hasPrototype(ForStatement)) {
                head.cond.expose();
                var forCond = head.cond.token.inner;
                if(forCond[0] && resolve(forCond[0]) === "let" &&
                   forCond[1] && forCond[1].token.type === parser.Token.Identifier) {
                    var letNew = fresh();
                    var letId = forCond[1];

                    forCond = forCond.map(function(stx) {
                        return stx.rename(letId, letNew);
                    });

                    // hack: we want to do the let renaming here, not
                    // in the expansion of `for (...)` so just remove the `let`
                    // keyword
                    head.cond.token.inner = expand([forCond[0]], context)
                                            .concat(expand(forCond.slice(1), context));

                    // nice and easy case: `for (...) { ... }`
                    if (rest[0] && rest[0].token.value === "{}") {
                        rest[0] = rest[0].rename(letId, letNew);
                    } else {
                        // need to deal with things like `for (...) if (...) log(...)`
                        var bodyEnf = enforest(rest, context);
                        var bodyDestructed = bodyEnf.result.destruct();
                        var renamedBodyTerm = bodyEnf.result.rename(letId, letNew);
                        tagWithTerm(renamedBodyTerm, bodyDestructed);
                        rest = bodyEnf.rest;
                        prevStx = bodyDestructed.reverse().concat(prevStx);
                        prevTerms = [renamedBodyTerm].concat(prevTerms);
                    }

                } else {
                    head.cond.token.inner = expand(head.cond.token.inner, context);
                }
            }
        }

        return {
            // prevTerms are stored in reverse for the purposes of infix
            // lookbehind matching, so we need to re-reverse them.
            terms: prevTerms ? prevTerms.reverse() : [],
            context: context,
        };
    }

    function addToDefinitionCtx(idents, defscope, skipRep) {
        assert(idents && idents.length > 0, "expecting some variable identifiers");
        skipRep = skipRep || false;
        _.each(idents, function(id) {
            var skip = false;
            if (skipRep) {
                var declRepeat = _.find(defscope, function(def) {
                    return def.id.token.value === id.token.value &&
                        arraysEqual(marksof(def.id.context), marksof(id.context));
                });
                skip = typeof declRepeat !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip) {
                var name = fresh();
                defscope.push({
                    id: id,
                    name: name
                });
                
            }
        });
    }


    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal (term, context) {
        assert(context && context.env, "environment map is required");

        if (term.hasPrototype(ArrayLiteral)) {
            term.array.delim.token.inner = expand(term.array.delim.expose().token.inner, context);
            return term;
        } else if (term.hasPrototype(Block)) {
            term.body.delim.token.inner = expand(term.body.delim.expose().token.inner, context);
            return term;
        } else if (term.hasPrototype(ParenExpression)) {
            term.expr.delim.token.inner = expand(term.expr.delim.expose().token.inner, context);
            return term;
        } else if (term.hasPrototype(Call)) {
            term.fun = expandTermTreeToFinal(term.fun, context);
            term.args = _.map(term.args, function(arg) {
                return expandTermTreeToFinal(arg, context);
            });
            return term;
        } else if (term.hasPrototype(Const)) {
            term.call = expandTermTreeToFinal(term.call, context);
            return term;
        } else if (term.hasPrototype(UnaryOp)) {
            term.expr = expandTermTreeToFinal(term.expr, context);
            return term;
        } else if (term.hasPrototype(BinOp) || term.hasPrototype(AssignmentExpression)) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right = expandTermTreeToFinal(term.right, context);
            return term;
        } else if (term.hasPrototype(ObjGet)) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right.delim.token.inner = expand(term.right.delim.expose().token.inner, context);
            return term;
        } else if (term.hasPrototype(ObjDotGet)) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right = expandTermTreeToFinal(term.right, context);
            return term;
        } else if (term.hasPrototype(VariableDeclaration)) {
            if (term.init) {
                term.init = expandTermTreeToFinal(term.init, context);
            }
            return term;
        } else if (term.hasPrototype(VariableStatement)) {
            term.decls = _.map(term.decls, function(decl) {
                return expandTermTreeToFinal(decl, context);
            });
            return term;
        } else if (term.hasPrototype(Delimiter)) {
            // expand inside the delimiter and then continue on
            term.delim.token.inner = expand(term.delim.expose().token.inner, context);
            return term;
        } else if (term.hasPrototype(NamedFun) ||
                   term.hasPrototype(AnonFun) ||
                   term.hasPrototype(CatchClause) ||
                   term.hasPrototype(ArrowFun) ||
                   term.hasPrototype(Module)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef = [];
            var bodyContext = makeExpanderContext(_.defaults({defscope: newDef}, context));

            var paramSingleIdent = term.params && term.params.token.type === parser.Token.Identifier;

            var params;
            if (term.params && term.params.token.type === parser.Token.Delimiter) {
                params = term.params.expose();
            } else if (paramSingleIdent) {
                params = term.params;
            } else {
                params = syn.makeDelim("()", [], null);
            }
            var bodies;
            if (Array.isArray(term.body)) {
                bodies = syn.makeDelim("{}", term.body, null);
            } else {
                bodies = term.body;
            }
            bodies = bodies.addDefCtx(newDef);

            var paramNames = _.map(getParamIdentifiers(params), function(param) {
                var freshName = fresh();
                return {
                    freshName: freshName,
                    originalParam: param,
                    renamedParam: param.rename(param, freshName)
                };
            });


            // rename the function body for each of the parameters
            var renamedBody = _.reduce(paramNames, function(accBody, p) {
                return accBody.rename(p.originalParam, p.freshName)
            }, bodies);
            renamedBody = renamedBody.expose();

            var expandedResult = expandToTermTree(renamedBody.token.inner, bodyContext);
            var bodyTerms = expandedResult.terms;

            var renamedParams = _.map(paramNames, function(p) { return p.renamedParam});
            var flatArgs;
            if (paramSingleIdent) {
                flatArgs = renamedParams[0];
            } else {
                flatArgs = syn.makeDelim("()", joinSyntax(renamedParams, ","),
                                             (term.params || null));
            }

            var expandedArgs = expand([flatArgs], bodyContext);
            assert(expandedArgs.length === 1, "should only get back one result");
            // stitch up the function with all the renamings
            if (term.params) {
                term.params = expandedArgs[0];
            }

            bodyTerms = _.map(bodyTerms, function(bodyTerm) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx = bodyTerm.addDefCtx(newDef);
                // finish expansion
                return expandTermTreeToFinal(termWithCtx,
                                             expandedResult.context);
            })
            
            if (term.hasPrototype(Module)) {
                bodyTerms = _.filter(bodyTerms, function(bodyTerm) {
                    if (bodyTerm.hasPrototype(Export)) {
                        term.exports.push(bodyTerm);
                        return false;
                    } else {
                        return true;
                    }
                });
            }

            renamedBody.token.inner = bodyTerms;
            if (Array.isArray(term.body)) {
                term.body = renamedBody.token.inner;
            } else {
                term.body = renamedBody;
            }

            // and continue expand the rest
            return term;
        }
        // the term is fine as is
        return term;
    }

    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand(stx, context) {
        assert(context, "must provide an expander context");
        
        var trees = expandToTermTree(stx, context);
        return _.map(trees.terms, function(term) {
            return expandTermTreeToFinal(term, trees.context);
        })
    }

    function makeExpanderContext(o) {
        o = o || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            filename: {value: o.filename,
                       writable: false, enumerable: true, configurable: false},
            requireModule: {value: o.requireModule,
                            writable: false, enumerable: true, configurable: false},
            env: {value: o.env || new StringMap(),
                  writable: false, enumerable: true, configurable: false},
            defscope: {value: o.defscope,
                       writable: false, enumerable: true, configurable: false},
            templateMap: {value: o.templateMap || new StringMap(),
                          writable: false, enumerable: true, configurable: false},
            patternMap: {value: o.patternMap || new StringMap(),
                         writable: false, enumerable: true, configurable: false},
            mark: {value: o.mark,
                          writable: false, enumerable: true, configurable: false}
        });
    }

    function makeTopLevelExpanderContext(options) {
        var requireModule = options ? options.requireModule : undefined;
        var filename = options ? options.filename : undefined;
        return makeExpanderContext({
            filename: filename,
            requireModule: requireModule
        });
    }

    // a hack to make the top level hygiene work out
    function expandTopLevel(stx, moduleContexts, options) {
        moduleContexts = moduleContexts || [];
        maxExpands = (_.isNumber(options) ? options : options && options._maxExpands) || Infinity;
        expandCount = 0;

        var context = makeTopLevelExpanderContext(options);
        var modBody = syn.makeDelim("{}", stx, null);
        modBody = _.reduce(moduleContexts, function(acc, mod) {
            context.env.extend(mod.env);
            return loadModuleExports(acc, context.env, mod.exports, mod.env);
        }, modBody);

        var res = expand([syn.makeIdent("module", null), modBody], context);
        res = res[0].destruct();
        return flatten(res[0].token.inner);
    }

    function expandModule(stx, moduleContexts, options) {
        moduleContexts = moduleContexts || [];
        maxExpands = Infinity;
        expandCount = 0;

        var context = makeTopLevelExpanderContext(options);
        var modBody = syn.makeDelim("{}", stx, null);
        modBody = _.reduce(moduleContexts, function(acc, mod) {
            context.env.extend(mod.env);
            return loadModuleExports(acc, context.env, mod.exports, mod.env);
        }, modBody);

        builtinMode = true;
        var moduleRes = expand([syn.makeIdent("module", null), modBody], context);
        builtinMode = false;

        context.exports = _.map(moduleRes[0].exports, function(term) {
            return {
                oldExport: term.name,
                newParam: syn.makeIdent(term.name.token.value, null)
            }
        });

        return context;
    }

    function loadModuleExports(stx, newEnv, exports, oldEnv) {
        return _.reduce(exports, function(acc, param) {
            var newName = fresh();
            newEnv.set(resolve(param.newParam.rename(param.newParam, newName)), 
                       oldEnv.get(resolve(param.oldExport)));
            return acc.rename(param.newParam, newName);
        }, stx);
    }

    // break delimiter tree structure down to flat array of syntax objects
    function flatten(stx) {
        return _.reduce(stx, function(acc, stx) {
            if (stx.token.type === parser.Token.Delimiter) {
                var exposed = stx.expose();
                var openParen = syntaxFromToken({
                    type: parser.Token.Punctuator,
                    value: stx.token.value[0],
                    range: stx.token.startRange,
                    sm_range: (typeof stx.token.sm_startRange == 'undefined'
                                ? stx.token.startRange
                                : stx.token.sm_startRange),
                    lineNumber: stx.token.startLineNumber,
                    sm_lineNumber: (typeof stx.token.sm_startLineNumber == 'undefined'
                                    ? stx.token.startLineNumber
                                    : stx.token.sm_startLineNumber),
                    lineStart: stx.token.startLineStart,
                    sm_lineStart: (typeof stx.token.sm_startLineStart == 'undefined'
                                   ? stx.token.startLineStart
                                   : stx.token.sm_startLineStart)
                }, exposed);
                var closeParen = syntaxFromToken({
                    type: parser.Token.Punctuator,
                    value: stx.token.value[1],
                    range: stx.token.endRange,
                    sm_range: (typeof stx.token.sm_endRange == 'undefined'
                                ? stx.token.endRange
                                : stx.token.sm_endRange),
                    lineNumber: stx.token.endLineNumber,
                    sm_lineNumber: (typeof stx.token.sm_endLineNumber == 'undefined'
                                    ? stx.token.endLineNumber
                                    : stx.token.sm_endLineNumber),
                    lineStart: stx.token.endLineStart,
                    sm_lineStart: (typeof stx.token.sm_endLineStart == 'undefined'
                                    ? stx.token.endLineStart
                                    : stx.token.sm_endLineStart)
                }, exposed);
                if (stx.token.leadingComments) {
                    openParen.token.leadingComments = stx.token.leadingComments;
                }
                if (stx.token.trailingComments) {
                    openParen.token.trailingComments = stx.token.trailingComments;
                }
                acc.push(openParen);
                push.apply(acc, flatten(exposed.token.inner));
                acc.push(closeParen);
                return acc;
            }
            stx.token.sm_lineNumber = stx.token.sm_lineNumber 
                                    ? stx.token.sm_lineNumber 
                                    : stx.token.lineNumber;
            stx.token.sm_lineStart = stx.token.sm_lineStart 
                                    ? stx.token.sm_lineStart 
                                    : stx.token.lineStart;
            stx.token.sm_range = stx.token.sm_range
                                    ? stx.token.sm_range
                                    : stx.token.range;
            acc.push(stx);                        
            return acc;
        }, []);
    }

    exports.StringMap = StringMap;
    exports.enforest = enforest;
    exports.expand = expandTopLevel;
    exports.expandModule = expandModule;

    exports.resolve = resolve;
    exports.get_expression = get_expression;
    exports.getName = getName;
    exports.getMacroInEnv = getMacroInEnv;
    exports.nameInEnv = nameInEnv;

    exports.makeExpanderContext = makeExpanderContext;

    exports.Expr = Expr;
    exports.VariableStatement = VariableStatement;

    exports.tokensToSyntax = syn.tokensToSyntax;
    exports.syntaxToTokens = syn.syntaxToTokens;
}));
