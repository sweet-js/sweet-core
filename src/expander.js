#lang "../macros/stxcase.js";
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

/*global require: true, exports:true, console: true
*/

// import @ from "contracts.js"
'use strict';

var codegen = require('escodegen'),
    _ = require('underscore'),
    parser = require('./parser'),
    syn = require('./syntax'),
    se = require('./scopedEval'),
    patternModule = require("./patterns"),
    vm = require('vm'),
    Immutable = require('immutable'),
    assert = require("assert");

var throwSyntaxError = syn.throwSyntaxError;
var throwSyntaxCaseError = syn.throwSyntaxCaseError;
var SyntaxCaseError = syn.SyntaxCaseError;
var unwrapSyntax = syn.unwrapSyntax;

macro (->) {
    rule infix { $param:ident | { $body ... } } => {
        function ($param) { $body ...}
    }
    rule infix { $param:ident | $body:expr } => {
        function ($param) { return $body }
    }
    rule infix { ($param:ident (,) ...) | { $body ... } } => {
        function ($param (,) ...) { $body ... }
    }
    rule infix { ($param:ident (,) ...) | $body:expr } => {
        function ($param (,) ...) { return $body }
    }
}
operator (|>) 1 left { $l, $r } => #{ $r($l) }

// used to export "private" methods for unit testing
exports._test = {};

function StringMap(o) {
    this.__data = o || {};
}

StringMap.prototype = {
    keys: function() {
        return Object.keys(this.__data);
    },
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
var Imported = syn.Imported;

var syntaxFromToken = syn.syntaxFromToken;
var joinSyntax = syn.joinSyntax;

var builtinMode = false;
var expandCount = 0;
var maxExpands;
var availableModules;

var push = Array.prototype.push;

function remdup(mark, mlist) {
    if (mark === _.first(mlist)) {
        return _.rest(mlist, 1);
    }
    return [mark].concat(mlist);
}

// (CSyntax) -> [...Num]
function marksof(ctx, stopName, originalName) {
    while (ctx) {
        if (ctx.constructor === Mark) {
            return remdup(ctx.mark, marksof(ctx.context, stopName, originalName));
        }
        if(ctx.constructor === Def) {
            ctx = ctx.context;
            continue;
        }
        if (ctx.constructor === Rename) {
            if(stopName === originalName + "$" + ctx.name) {
                return [];
            }
            ctx = ctx.context;
            continue;
        }
        if (ctx.constructor === Imported) {
            ctx = ctx.context;
            continue;
        }
        assert(false, "Unknown context type");
    }
    return [];
}

function resolve(stx, phase) {
    assert(phase !== undefined, "must pass in phase");
    return resolveCtx(stx.token.value, stx.context, [], [], {}, phase);
}

// This call memoizes intermediate results in the recursive invocation.
// The scope of the memo cache is the resolve() call, so that multiple
// resolve() calls don't walk all over each other, and memory used for
// the memoization can be garbage collected.
//
// The memoization addresses issue #232.
//
// It looks like the memoization uses only the context and doesn't look
// at originalName, stop_spine and stop_branch arguments. This is valid
// because whenever in every recursive call operates on a "deeper" or
// else a newly created context.  Therefore the collection of
// [originalName, stop_spine, stop_branch] can all be associated with a
// unique context. This argument is easier to see in a recursive
// rewrite of the resolveCtx function than with the while loop
// optimization - https://gist.github.com/srikumarks/9847260 - where the
// recursive steps always operate on a different context.
//
// This might make it seem that the resolution results can be stored on
// the context object itself, but that would not work in general
// because multiple resolve() calls will walk over each other's cache
// results, which fails tests. So the memoization uses only a context's
// unique instance numbers as the memoization key and is local to each
// resolve() call.
//
// With this memoization, the time complexity of the resolveCtx call is
// no longer exponential for the cases in issue #232.

function resolveCtx(originalName, ctx, stop_spine, stop_branch, cache, phase) {
    if (!ctx) { return originalName; }
    var key = ctx.instNum;
    return cache[key] || (cache[key] = resolveCtxFull(originalName, ctx, stop_spine, stop_branch, cache, phase));
}

// (Syntax) -> String
function resolveCtxFull(originalName, ctx, stop_spine, stop_branch, cache, phase) {
    while (true) {
        if (!ctx) { return originalName; }

        if (ctx.constructor === Mark) {
            ctx = ctx.context;
            continue;
        }
        if (ctx.constructor === Def) {
            if (stop_spine.indexOf(ctx.defctx) !== -1) {
                ctx = ctx.context;
                continue;
            } else {
                stop_branch = unionEl(stop_branch, ctx.defctx);
                ctx = renames(ctx.defctx, ctx.context, originalName);
                continue;
            }
        }
        if (ctx.constructor === Rename) {
            if (originalName === ctx.id.token.value) {
                var idName  = resolveCtx(ctx.id.token.value,
                                         ctx.id.context,
                                         stop_branch,
                                         stop_branch,
                                         cache,
                                         0);
                var subName = resolveCtx(originalName,
                                         ctx.context,
                                         unionEl(stop_spine, ctx.def),
                                         stop_branch,
                                         cache,
                                         0);
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
        if (ctx.constructor === Imported) {
            if (phase === ctx.phase) {
                if (originalName === ctx.id.token.value) {
                    return originalName + "$" + ctx.name;
                }
            }
            ctx = ctx.context;
            continue;
        }
        assert(false, "Unknown context type");
    }
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

var nextFresh = 0;

// @ () -> Num
function fresh() { return nextFresh++; }




// wraps the array of syntax objects in the delimiters given by the second argument
// ([...CSyntax], CSyntax) -> [...CSyntax]
function wrapDelim(towrap, delimSyntax) {
    assert(delimSyntax.isDelimiterToken(),
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
    if (argSyntax.isDelimiter()) {
        return _.filter(argSyntax.token.inner, function(stx) { return stx.token.value !== ","});
    } else if (argSyntax.isIdentifier()) {
        return [argSyntax];
    } else {
        assert(false, "expecting a delimiter or a single identifier for function parameters");
    }
}


function inherit(parent, child, methods) {
    var P = function(){};
    P.prototype = parent.prototype;
    child.prototype = new P();
    child.prototype.constructor = child;
    _.extend(child.prototype, methods);
}

macro cloned {
    rule { $dest:ident <- $source:expr ;... } => {
        var src = $source;
        var keys = Object.keys(src);
        var $dest = {};
        for (var i = 0, len = keys.length, key; i < len; i++) {
            key = keys[i];
            $dest[key] = src[key];
        }
    }
}

macro to_str {
    case { _ ($toks (,) ...) } => {
        var toks = #{ $toks ... };
        // We aren't using unwrapSyntax because it breaks since its defined
        // within the outer scope! We need phases.
        var str = toks.map(function(x) { return x.token.value }).join('');
        return [makeValue(str, #{ here })];
    }
}

macro class_method {
    rule { $name:ident $args $body } => {
        to_str($name): function $args $body
    }
}

macro class_extend {
    rule { $name $parent $methods } => {
        inherit($parent, $name, $methods);
    }
}

macro class_ctr {
    rule { $name ($field ...) } => {
        function $name($field (,) ...) {
            $(this.$field = $field;) ...
        }
    }
}

macro class_create {
    rule { $name ($arg (,) ...) } => {
        $name.properties = [$(to_str($arg)) (,) ...];
        $name.create = function($arg (,) ...) {
            return new $name($arg (,) ...);
        }
    }
}

macro dataclass {
    rule {
        $name:ident ($field:ident (,) ...) extends $parent:ident {
            $methods:class_method ...
        } ;...
    } => {
        class_ctr $name ($field ...)
        class_create $name ($field (,) ...)
        class_extend $name $parent {
            to_str('is', $name): true,
            $methods (,) ...
        }
    }

    rule {
        $name:ident ($field:ident (,) ...) {
            $methods:class_method ...
        } ;...
    } => {
        class_ctr $name ($field ...)
        class_create $name ($field (,) ...)
        $name.prototype = {
            to_str('is', $name): true,
            $methods (,) ...
        };
    }

    rule { $name:ident ($field (,) ...) extends $parent:ident ;... } => {
        class_ctr $name ($field ...)
        class_create $name ($field (,) ...)
        class_extend $name $parent {
            to_str('is', $name): true
        }
    }

    rule { $name:ident ($field (,) ...) ;... } => {
        class_ctr $name ($field ...)
        class_create $name ($field (,) ...)
        $name.prototype = {
            to_str('is', $name): true
        };
    }
}

// @ let TemplateMap = {}
// @ let PatternMap = {}
// @ let TokenObject = {}
// @ let ContextObject = {}

// @ let SyntaxObject = {
//     token: TokenObject,
//     context: Null or ContextObject
// }
// @ let TermTreeObject = {}

// @ let ExpanderContext = {}
// {
//     filename: Str,
//     env: {},
//     defscope: {},
//     paramscope: {},
//     templateMap: {},
//     patternMap: {},
//     mark: Num
// }

// @ let ExportTerm = {
//     name: SyntaxObject
// }
// @ let ImportTerm = {
//     names: SyntaxObject,
//     from: SyntaxObject
// }
// @ let ModuleTerm = {
//     name: SyntaxObject,
//     lang: SyntaxObject,
//     body: [...SyntaxObject] or [...TermTreeObject],
//     imports: [...ImportTerm],
//     exports: [...ExportTerm]
// }

// A TermTree is the core data structure for the macro expansion process.
// It acts as a semi-structured representation of the syntax.
dataclass TermTree() {

    // Go back to the syntax object representation. Uses the
    // ordered list of properties that each subclass sets to
    // determine the order in which multiple children are
    // destructed.
    // ({stripCompileTerm: ?Boolean}) -> [...Syntax]
    destruct(context, options) {
        assert(context, "must pass in the context to destruct");
        options = options || {};
        var self = this;
        if (options.stripCompileTerm && this.isCompileTimeTerm)  {
            return [];
        }
        if (options.stripModuleTerm && this.isModuleTimeTerm)  {
            return [];
        }
        return _.reduce(this.constructor.properties, function(acc, prop) {
            if (self[prop] && self[prop].isTermTree) {
                push.apply(acc, self[prop].destruct(context, options));
                return acc;
            } else if (self[prop] && self[prop].token && self[prop].token.inner) {
                cloned newtok <- self[prop].token;
                var clone = syntaxFromToken(newtok, self[prop]);
                clone.token.inner = _.reduce(clone.token.inner, function(acc, t) {
                    if (t && t.isTermTree) {
                        push.apply(acc, t.destruct(context, options));
                        return acc;
                    }
                    acc.push(t);
                    return acc;
                }, []);
                acc.push(clone);
                return acc;
            } else if (Array.isArray(self[prop])) {
                var destArr = _.reduce(self[prop], function(acc, t) {
                    if (t && t.isTermTree) {
                        push.apply(acc, t.destruct(context, options));
                        return acc;
                    }
                    acc.push(t);
                    return acc;
                }, []);
                push.apply(acc, destArr);
                return acc;
            } else if (self[prop]) {
                acc.push(self[prop]);
                return acc;
            } else {
                return acc;
            }
        }, []);
    }

    addDefCtx(def) {
        var self = this;
        _.each(this.constructor.properties, function(prop) {
            if (Array.isArray(self[prop])) {
                self[prop] = _.map(self[prop], function (item) {
                    return item.addDefCtx(def);
                });
            } else if (self[prop]) {
                self[prop] = self[prop].addDefCtx(def);
            }
        });
        return this;
    }

    rename(id, name, phase) {
        var self = this;
        _.each(this.constructor.properties, function(prop) {
            if (Array.isArray(self[prop])) {
                self[prop] = _.map(self[prop], function (item) {
                    return item.rename(id, name, phase);
                });
            } else if (self[prop]) {
                self[prop] = self[prop].rename(id, name, phase);
            }
        });
        return this;
    }

    imported(id, name, phase) {
        var self = this;
        _.each(this.constructor.properties, function(prop) {
            if (Array.isArray(self[prop])) {
                self[prop] = _.map(self[prop], function (item) {
                    return item.imported(id, name, phase);
                });
            } else if (self[prop]) {
                self[prop] = self[prop].imported(id, name, phase);
            }
        });
        return this;
    }
}

dataclass EOFTerm                   (eof)                               extends TermTree;
dataclass KeywordTerm               (keyword)                           extends TermTree;
dataclass PuncTerm                  (punc)                              extends TermTree;
dataclass DelimiterTerm             (delim)                             extends TermTree;

dataclass ModuleTimeTerm            ()                                  extends TermTree;

dataclass ModuleTerm                (body)                              extends ModuleTimeTerm;
dataclass ImportTerm                (kw, clause, fromkw, from)          extends ModuleTimeTerm;
dataclass ImportForMacrosTerm       (kw, clause, fromkw, from,
                                     forkw, macroskw)                   extends ModuleTimeTerm;
dataclass NamedImportTerm           (names)                             extends ModuleTimeTerm;
dataclass BindingTerm               (importName)                        extends ModuleTimeTerm;
dataclass QualifiedBindingTerm      (importName, askw, localName)       extends ModuleTimeTerm;
dataclass ExportTerm                (kw, name)                          extends ModuleTimeTerm;

dataclass CompileTimeTerm           ()                                  extends TermTree;

dataclass LetMacroTerm              (name, body)                        extends CompileTimeTerm;
dataclass MacroTerm                 (name, body)                        extends CompileTimeTerm;
dataclass AnonMacroTerm             (body)                              extends CompileTimeTerm;
dataclass OperatorDefinitionTerm    (type, name, prec, assoc, body)     extends CompileTimeTerm;

dataclass VariableDeclarationTerm   (ident, eq, init, comma)            extends TermTree;

dataclass StatementTerm             ()                                  extends TermTree;

dataclass EmptyTerm                 ()                                  extends StatementTerm;
dataclass CatchClauseTerm           (keyword, params, body)             extends StatementTerm;
dataclass ForStatementTerm          (keyword, cond)                     extends StatementTerm;
dataclass ReturnStatementTerm       (keyword, expr)                     extends StatementTerm {
    destruct(context, options) {
        var expr = this.expr.destruct(context, options);
        // need to adjust the line numbers to make sure that the expr
        // starts on the same line as the return keyword. This might
        // not be the case if an operator or infix macro perturbed the
        // line numbers during expansion.
        expr = adjustLineContext(expr, this.keyword.keyword);
        return this.keyword.destruct(context, options).concat(expr);
    }
}

dataclass ExprTerm                  ()                                  extends StatementTerm;
dataclass UnaryOpTerm               (op, expr)                          extends ExprTerm;
dataclass PostfixOpTerm             (expr, op)                          extends ExprTerm;
dataclass BinOpTerm                 (left, op, right)                   extends ExprTerm;
dataclass AssignmentExpressionTerm  (left, op, right)                   extends ExprTerm;
dataclass ConditionalExpressionTerm (cond, question, tru, colon, fls)   extends ExprTerm;
dataclass NamedFunTerm              (keyword, star, name, params, body) extends ExprTerm;
dataclass AnonFunTerm               (keyword, star, params, body)       extends ExprTerm;
dataclass ArrowFunTerm              (params, arrow, body)               extends ExprTerm;
dataclass ObjDotGetTerm             (left, dot, right)                  extends ExprTerm;
dataclass ObjGetTerm                (left, right)                       extends ExprTerm;
dataclass TemplateTerm              (template)                          extends ExprTerm;
dataclass CallTerm                  (fun, args)                         extends ExprTerm;

dataclass QuoteSyntaxTerm           (stx)                               extends ExprTerm {
    destruct(context, options) {
        var tempId = fresh();
        context.templateMap.set(tempId, this.stx.token.inner);
        return [syn.makeIdent("getTemplate", this.stx),
                syn.makeDelim("()", [
                    syn.makeValue(tempId, this.stx)
                ], this.stx)];

    }
}


dataclass PrimaryExpressionTerm     ()                                  extends ExprTerm;
dataclass ThisExpressionTerm        (keyword)                           extends PrimaryExpressionTerm;
dataclass LitTerm                   (lit)                               extends PrimaryExpressionTerm;
dataclass BlockTerm                 (body)                              extends PrimaryExpressionTerm;
dataclass ArrayLiteralTerm          (array)                             extends PrimaryExpressionTerm;
dataclass IdTerm                    (id)                                extends PrimaryExpressionTerm;

dataclass PartialTerm               ()                                  extends TermTree;
dataclass PartialOperationTerm      (stx, left)                         extends PartialTerm;
dataclass PartialExpressionTerm     (stx, left, combine)                extends PartialTerm;

dataclass BindingStatementTerm(keyword, decls) extends StatementTerm {
    destruct(context, options) {
        return this.keyword
            .destruct(context, options)
            .concat(_.reduce(this.decls, function(acc, decl) {
                push.apply(acc, decl.destruct(context, options));
                return acc;
            }, []));
    }
}

dataclass VariableStatementTerm (keyword, decls) extends BindingStatementTerm;
dataclass LetStatementTerm      (keyword, decls) extends BindingStatementTerm;
dataclass ConstStatementTerm    (keyword, decls) extends BindingStatementTerm;

dataclass ParenExpressionTerm(args, delim, commas) extends PrimaryExpressionTerm {
    destruct(context, options) {
        var commas = this.commas.slice();
        cloned newtok <- this.delim.token;
        var delim = syntaxFromToken(newtok, this.delim);
        delim.token.inner = _.reduce(this.args, function(acc, term) {
            assert(term && term.isTermTree,
                   "expecting term trees in destruct of ParenExpression");
            push.apply(acc, term.destruct(context, options));
            // add all commas except for the last one
            if (commas.length > 0) {
                acc.push(commas.shift());
            }
            return acc;
        }, []);
        return DelimiterTerm.create(delim).destruct(context, options);
    }
}


function stxIsUnaryOp(stx) {
    var staticOperators = ["+", "-", "~", "!",
                            "delete", "void", "typeof", "yield", "new",
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

function getUnaryOpPrec(op) {
    var operatorPrecedence = {
        "new": 16,
        "++": 15,
        "--": 15,
        "!": 14,
        "~": 14,
        "+": 14,
        "-": 14,
        "typeof": 14,
        "void": 14,
        "delete": 14,
        "yield": 2
    }
    return operatorPrecedence[op];
}

function getBinaryOpPrec(op) {
    var operatorPrecedence = {
        "*": 13,
        "/": 13,
        "%": 13,
        "+": 12,
        "-": 12,
        ">>": 11,
        "<<": 11,
        ">>>": 11,
        "<": 10,
        "<=": 10,
        ">": 10,
        ">=": 10,
        "in": 10,
        "instanceof": 10,
        "==": 9,
        "!=": 9,
        "===": 9,
        "!==": 9,
        "&": 8,
        "^": 7,
        "|": 6,
        "&&": 5,
        "||":4
    }
    return operatorPrecedence[op];
}

function getBinaryOpAssoc(op) {
    var operatorAssoc = {
        "*": "left",
        "/": "left",
        "%": "left",
        "+": "left",
        "-": "left",
        ">>": "left",
        "<<": "left",
        ">>>": "left",
        "<": "left",
        "<=": "left",
        ">": "left",
        ">=": "left",
        "in": "left",
        "instanceof": "left",
        "==": "left",
        "!=": "left",
        "===": "left",
        "!==": "left",
        "&": "left",
        "^": "left",
        "|": "left",
        "&&": "left",
        "||": "left"
    }
    return operatorAssoc[op];
}

function stxIsAssignOp(stx) {
    var staticOperators = ["=", "+=", "-=", "*=", "/=", "%=",
                           "<<=", ">>=", ">>>=",
                           "|=", "^=", "&="];
    return _.contains(staticOperators, unwrapSyntax(stx));
}

function enforestImportClause(stx) {
    if (stx[0] && stx[0].isDelimiter()) {
        return {
            result: NamedImportTerm.create(stx[0]),
            rest: stx.slice(1)
        }
    }
    assert(false, "no delimiter");
}

function enforestImport(head, rest) {
    assert(unwrapSyntax(head) === "import", "only call for imports");

    var clause = enforestImportClause(rest);
    rest = clause.rest;

    if (rest[0] && unwrapSyntax(rest[0]) === "from" &&
        rest[1] && rest[1].isStringLiteral() &&
        rest[2] && unwrapSyntax(rest[2]) === "for" &&
        rest[3] && unwrapSyntax(rest[3]) === "macros") {
        var importRest;
        if (rest[4] && rest[4].isPunctuator() &&
            rest[4].token.value === ";") {
            importRest = rest.slice(5);
        } else {
            importRest = rest.slice(4);
        }

        return {
            result: ImportForMacrosTerm.create(head,
                                               clause.result,
                                               rest[0],
                                               rest[1],
                                               rest[2],
                                               rest[3]),
            rest: importRest
        };
    } else if (rest[0] && unwrapSyntax(rest[0]) === "from" &&
               rest[1] && rest[1].isStringLiteral()) {
        var importRest;
        if (rest[2] && rest[2].isPunctuator() &&
            rest[2].token.value === ";") {
            importRest = rest.slice(3);
        } else {
            importRest = rest.slice(2);
        }

        return {
            result: ImportTerm.create(head,
                                      clause.result,
                                      rest[0],
                                      rest[1]),
            rest: importRest
        };
    }


}

function enforestVarStatement(stx, context, varStx) {
    var decls = [];
    var rest = stx;
    var rhs;

    if (!rest.length) {
        throwSyntaxError("enforest", "Unexpected end of input", varStx);
    }

    if(expandCount >= maxExpands) {
        return null;
    }

    while (rest.length) {
        if (rest[0].isIdentifier()) {
            if (rest[1] && rest[1].isPunctuator() &&
                rest[1].token.value === "=") {
                rhs = get_expression(rest.slice(2), context);
                if (rhs.result == null) {
                    throwSyntaxError("enforest", "Unexpected token", rhs.rest[0]);
                }
                if (rhs.rest[0] && rhs.rest[0].isPunctuator() &&
                    rhs.rest[0].token.value === ",") {
                    decls.push(VariableDeclarationTerm.create(rest[0], rest[1], rhs.result, rhs.rest[0]));
                    rest = rhs.rest.slice(1);
                    continue;
                } else {
                    decls.push(VariableDeclarationTerm.create(rest[0], rest[1], rhs.result, null));
                    rest = rhs.rest;
                    break;
                }
            } else if (rest[1] && rest[1].isPunctuator() &&
                       rest[1].token.value === ",") {
                decls.push(VariableDeclarationTerm.create(rest[0], null, null, rest[1]));
                rest = rest.slice(2);
            } else {
                decls.push(VariableDeclarationTerm.create(rest[0], null, null, null));
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

function enforestAssignment(stx, context, left, prevStx, prevTerms) {
    var op = stx[0];
    var rightStx = stx.slice(1);

    var opTerm = PuncTerm.create(stx[0]);
    var opPrevStx = tagWithTerm(opTerm, [stx[0]])
                    .concat(tagWithTerm(left, left.destruct(context).reverse()),
                            prevStx);
    var opPrevTerms = [opTerm, left].concat(prevTerms);
    var opRes = enforest(rightStx, context, opPrevStx, opPrevTerms);

    if (opRes.result) {
        // Lookbehind was matched, so it may not even be a binop anymore.
        if (opRes.prevTerms.length < opPrevTerms.length) {
            return opRes;
        }

        var right = opRes.result;
        // only a binop if the right is a real expression
        // so 2+2++ will only match 2+2
        if (right.isExprTerm) {
            var term = AssignmentExpressionTerm.create(left, op, right);
            return {
                result: term,
                rest: opRes.rest,
                prevStx: prevStx,
                prevTerms: prevTerms
            };
        }
    } else {
        return opRes;
    }
}

function enforestParenExpression(parens, context) {
    var argRes, enforestedArgs = [], commas = [];
    var innerTokens = parens.token.inner;
    while (innerTokens.length > 0) {
        argRes = enforest(innerTokens, context);
        if (!argRes.result || !argRes.result.isExprTerm) {
            return null;
        }
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
    return innerTokens.length ? null : ParenExpressionTerm.create(enforestedArgs, parens, commas);
}

function adjustLineContext(stx, original, current) {
    // short circuit when the array is empty;
    if (stx.length === 0) {
        return stx;
    }

    current = current || {
        lastLineNumber: stx[0].token.lineNumber || stx[0].token.startLineNumber,
        lineNumber: original.token.lineNumber
    };

    return _.map(stx, function(stx) {
        if (stx.isDelimiter()) {
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

            if (stx.token.startLineNumber !== current.lineNumber) {
                if (stx.token.startLineNumber !== current.lastLineNumber) {
                    current.lineNumber++;
                    current.lastLineNumber = stx.token.startLineNumber;
                    stx.token.startLineNumber = current.lineNumber;
                } else {
                    current.lastLineNumber = stx.token.startLineNumber;
                    stx.token.startLineNumber = current.lineNumber;
                }

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
                                ? stx.token.range.slice()
                                : stx.token.sm_range;

        // move the line info to line up with the macro name
        // (line info starting from the macro name)
        if (stx.token.lineNumber !== current.lineNumber) {
            if (stx.token.lineNumber !== current.lastLineNumber) {
                current.lineNumber++;
                current.lastLineNumber = stx.token.lineNumber;
                stx.token.lineNumber = current.lineNumber;
            } else {
                current.lastLineNumber = stx.token.lineNumber;
                stx.token.lineNumber = current.lineNumber;
            }
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
            (next.isPunctuator() ||
             next.isIdentifier() ||
             next.isKeyword()) &&
            (toksAdjacent(curr, next))) {
            name.push(next);
            curr = next;
            next = rest[++idx];
        } else {
            return name;
        }
    }
}

function getValueInEnv(head, rest, context, phase) {
    if (!(head.isIdentifier() ||
          head.isKeyword() ||
          head.isPunctuator())) {
        return null;
    }
    var name = getName(head, rest);
    // simple case, don't need to create a new syntax object
    if (name.length === 1) {
        if (context.env.names.get(unwrapSyntax(name[0]))) {
            var resolvedName = resolve(name[0], phase);
            if (context.env.has(resolvedName)) {
                return context.env.get(resolvedName);
            }
        }
        return null;
    } else {
        while (name.length > 0) {
            var nameStr = name.map(unwrapSyntax).join("");
            if (context.env.names.get(nameStr)) {
                var nameStx = syn.makeIdent(nameStr, name[0]);
                var resolvedName = resolve(nameStx, phase);
                if (context.env.has(resolvedName)) {
                    return context.env.get(resolvedName);
                }
            }
            name.pop();
        }
        return null;
    }
}

function nameInEnv(head, rest, context, phase) {
    return getValueInEnv(head, rest, context, phase) !== null;
}

// This should only be used on things that can't be rebound except by
// macros (puncs, keywords).
function resolveFast(stx, env, phase) {
    var name = unwrapSyntax(stx);
    return env.names.get(name) ? resolve(stx, phase) : name;
}

function expandMacro(stx, context, opCtx, opType, macroObj) {
    // pull the macro transformer out the environment
    var head = stx[0];
    var rest = stx.slice(1);
    macroObj = macroObj || getValueInEnv(head, rest, context, context.phase);
    var stxArg = rest.slice(macroObj.fullName.length - 1);
    var transformer;
    if (opType != null) {
        assert(opType === "binary" || opType === "unary", "operator type should be either unary or binary: " + opType);
        transformer = macroObj[opType].fn;
    } else {
        transformer = macroObj.fn;
    }

    assert(typeof transformer === "function", "Macro transformer not bound for: "
           + head.token.value);


    // create a new mark to be used for the input to
    // the macro
    var newMark = fresh();
    var transformerContext = makeExpanderContext(_.defaults({mark: newMark}, context));

    // apply the transformer
    var rt;
    try {
        rt = transformer([head].concat(stxArg),
                         transformerContext,
                         opCtx.prevStx,
                         opCtx.prevTerms);
    } catch (e) {
        if (e instanceof SyntaxCaseError) {
            // add a nicer error for syntax case
            var nameStr = macroObj.fullName.map(function(stx) {
                return stx.token.value;
            }).join("");
            if (opType != null) {
                var argumentString = "`" + stxArg.slice(0, 5).map(function(stx) {
                    return stx.token.value;
                }).join(" ") + "...`";
                throwSyntaxError("operator", "Operator `" + nameStr +
                                              "` could not be matched with " +
                                              argumentString,
                                              head);
            } else {
                var argumentString = "`" + stxArg.slice(0, 5).map(function(stx) {
                    return stx.token.value;
                }).join(" ") + "...`";
                throwSyntaxError("macro", "Macro `" + nameStr +
                                              "` could not be matched with " +
                                              argumentString,
                                              head);
            }
        }
        else {
            // just rethrow it
            throw e;
        }
    }

    if (!builtinMode && !macroObj.builtin) {
        expandCount++;
    }


    if(!Array.isArray(rt.result)) {
        throwSyntaxError("enforest", "Macro must return a syntax array", stx[0]);
    }


    if(rt.result.length > 0) {
        var adjustedResult = adjustLineContext(rt.result, head);
        if (stx[0].token.leadingComments) {
            if (adjustedResult[0].token.leadingComments) {
                adjustedResult[0].token.leadingComments = adjustedResult[0].token.leadingComments.concat(head.token.leadingComments);
            } else {
                adjustedResult[0].token.leadingComments = head.token.leadingComments;
            }
        }
        rt.result = adjustedResult;
    }
    return rt;
}

function comparePrec(left, right, assoc) {
    if (assoc === "left") {
        return left <= right;
    }
    return left < right;
}


// @ (SyntaxObject, SyntaxObject) -> Bool
function toksAdjacent(a, b) {
    var arange = a.token.sm_range || a.token.range || a.token.endRange;
    var brange = b.token.sm_range || b.token.range || b.token.endRange;
    return arange && brange && arange[1] === brange[0];
}

// @ (SyntaxObject, SyntaxObject) -> Bool
function syntaxInnerValuesEq(synA, synB) {
    var a = synA.token.inner, b = synB.token.inner;
    return a.length === b.length &&
        _.zip(a, b) |> ziped -> _.all(ziped, pair -> {
            return unwrapSyntax(pair[0]) === unwrapSyntax(pair[1]);
        });

}

// enforest the tokens, returns an object with the `result` TermTree and
// the uninterpreted `rest` of the syntax
// @ ([...SyntaxObject], ExpanderContext) -> {
//     result: Null or TermTreeObject,
//     rest: [...SyntaxObject]
// }
function enforest(toks, context, prevStx, prevTerms) {
    assert(toks.length > 0, "enforest assumes there are tokens to work with");

    prevStx = prevStx || [];
    prevTerms = prevTerms || [];

    if(expandCount >= maxExpands) {
        return { result: null,
                 rest: toks };
    }

    function step(head, rest, opCtx) {
        var innerTokens;
        assert(Array.isArray(rest), "result must at least be an empty array");
        if (head.isTermTree) {

            var isCustomOp = false;
            var uopMacroObj;
            var uopSyntax;

            if (head.isPuncTerm || head.isKeywordTerm || head.isIdTerm) {
                if (head.isPuncTerm) {
                    uopSyntax = head.punc;
                } else if (head.isKeywordTerm) {
                    uopSyntax = head.keyword;
                } else if (head.isIdTerm) {
                    uopSyntax = head.id;
                }
                uopMacroObj = getValueInEnv(uopSyntax, rest, context, context.phase);
                isCustomOp = uopMacroObj && uopMacroObj.isOp;
            }

            // look up once (we want to check multiple properties on bopMacroObj
            // without repeatedly calling getValueInEnv)
            var bopMacroObj;
            if (rest[0] && rest[1]) {
                bopMacroObj = getValueInEnv(rest[0], rest.slice(1), context, context.phase);
            }

            // unary operator
            if ((isCustomOp && uopMacroObj.unary) || (uopSyntax && stxIsUnaryOp(uopSyntax))) {
                var uopPrec;
                if (isCustomOp && uopMacroObj.unary) {
                    uopPrec = uopMacroObj.unary.prec;
                } else {
                    uopPrec = getUnaryOpPrec(unwrapSyntax(uopSyntax));
                }

                var opRest = rest;
                var uopMacroName;
                if (uopMacroObj) {
                    uopMacroName = [uopSyntax].concat(rest.slice(0, uopMacroObj.fullName.length - 1));
                    opRest = rest.slice(uopMacroObj.fullName.length - 1);
                }

                var leftLeft = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartialTerm
                               ? opCtx.prevTerms[0]
                               : null;
                var unopTerm = PartialOperationTerm.create(head, leftLeft);
                var unopPrevStx = tagWithTerm(unopTerm, head.destruct(context).reverse()).concat(opCtx.prevStx);
                var unopPrevTerms = [unopTerm].concat(opCtx.prevTerms);
                var unopOpCtx = _.extend({}, opCtx, {
                    combine: function(t) {
                        if (t.isExprTerm) {
                            if (isCustomOp && uopMacroObj.unary) {
                                var rt = expandMacro(uopMacroName.concat(t.destruct(context)), context, opCtx, "unary");
                                var newt = get_expression(rt.result, context);
                                assert(newt.rest.length === 0, "should never have left over syntax");
                                return opCtx.combine(newt.result);
                            }
                            return opCtx.combine(UnaryOpTerm.create(uopSyntax, t));
                        } else {
                            // not actually an expression so don't create
                            // a UnaryOp term just return with the punctuator
                            return opCtx.combine(head);
                        }
                    },
                    prec: uopPrec,
                    prevStx: unopPrevStx,
                    prevTerms: unopPrevTerms,
                    op: unopTerm
                });
                return step(opRest[0], opRest.slice(1), unopOpCtx);
            // BinOp
            } else if (head.isExprTerm &&
                        (rest[0] && rest[1] &&
                         ((stxIsBinOp(rest[0]) && !bopMacroObj) ||
                          (bopMacroObj && bopMacroObj.isOp && bopMacroObj.binary)))) {
                var opRes;
                var op = rest[0];
                var left = head;
                var rightStx = rest.slice(1);

                var leftLeft = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartialTerm
                               ? opCtx.prevTerms[0]
                               : null;
                var leftTerm = PartialExpressionTerm.create(head.destruct(context), leftLeft, function() {
                    return step(head, [], opCtx);
                });
                var opTerm = PartialOperationTerm.create(op, leftTerm);
                var opPrevStx = tagWithTerm(opTerm, [rest[0]])
                                .concat(tagWithTerm(leftTerm, head.destruct(context)).reverse(),
                                        opCtx.prevStx);
                var opPrevTerms = [opTerm, leftTerm].concat(opCtx.prevTerms);
                var isCustomOp = bopMacroObj && bopMacroObj.isOp && bopMacroObj.binary;

                var bopPrec;
                var bopAssoc;
                if (isCustomOp && bopMacroObj.binary) {
                    bopPrec = bopMacroObj.binary.prec;
                    bopAssoc = bopMacroObj.binary.assoc;
                } else {
                    bopPrec = getBinaryOpPrec(unwrapSyntax(op));
                    bopAssoc = getBinaryOpAssoc(unwrapSyntax(op));
                }
                assert(bopPrec !== undefined, "expecting a precedence for operator: " + op);

                var newStack;
                if (comparePrec(bopPrec, opCtx.prec, bopAssoc)) {
                    var bopCtx = opCtx;
                    var combResult = opCtx.combine(head);

                    if (opCtx.stack.length > 0) {
                        return step(combResult.term, rest, opCtx.stack[0]);
                    }

                    left = combResult.term;
                    newStack = opCtx.stack;
                    opPrevStx = combResult.prevStx;
                    opPrevTerms = combResult.prevTerms;
                } else {
                    newStack = [opCtx].concat(opCtx.stack);
                }


                assert(opCtx.combine !== undefined,
                        "expecting a combine function");

                var opRightStx = rightStx;
                var bopMacroName;
                if (isCustomOp) {
                    bopMacroName = rest.slice(0, bopMacroObj.fullName.length);
                    opRightStx = rightStx.slice(bopMacroObj.fullName.length - 1);
                }
                var bopOpCtx = _.extend({}, opCtx, {
                    combine: function(right) {
                        if (right.isExprTerm) {
                            if (isCustomOp && bopMacroObj.binary) {
                                var leftStx = left.destruct(context);
                                var rightStx = right.destruct(context);
                                var rt = expandMacro(bopMacroName.concat(syn.makeDelim("()", leftStx, leftStx[0]),
                                                                         syn.makeDelim("()", rightStx, rightStx[0])),
                                                     context, opCtx, "binary");
                                var newt = get_expression(rt.result, context);
                                assert(newt.rest.length === 0, "should never have left over syntax");
                                return {
                                    term: newt.result,
                                    prevStx: opPrevStx,
                                    prevTerms: opPrevTerms
                                };
                            }
                            return {
                                term: BinOpTerm.create(left, op, right),
                                prevStx: opPrevStx,
                                prevTerms: opPrevTerms
                            };
                        } else {
                            return {
                                term: head,
                                prevStx: opPrevStx,
                                prevTerms: opPrevTerms
                            };
                        }
                    },
                    prec: bopPrec,
                    op: opTerm,
                    stack: newStack,
                    prevStx: opPrevStx,
                    prevTerms: opPrevTerms,
                });
                return step(opRightStx[0], opRightStx.slice(1), bopOpCtx);
            // Call
            } else if (head.isExprTerm && (rest[0] &&
                                       rest[0].isDelimiter() &&
                                       rest[0].token.value === "()")) {

                var parenRes = enforestParenExpression(rest[0], context);
                if (parenRes) {
                    return step(CallTerm.create(head, parenRes),
                                rest.slice(1),
                                opCtx);
                }
            // Conditional ( x ? true : false)
            } else if (head.isExprTerm &&
                       (rest[0] && resolveFast(rest[0], context.env, context.phase) === "?")) {
                var question = rest[0];
                var condRes = enforest(rest.slice(1), context);
                if (condRes.result) {
                    var truExpr = condRes.result;
                    var condRight = condRes.rest;
                    if (truExpr.isExprTerm &&
                        condRight[0] && resolveFast(condRight[0], context.env, context.phase) === ":") {
                        var colon = condRight[0];
                        var flsRes = enforest(condRight.slice(1), context);
                        var flsExpr = flsRes.result;
                        if (flsExpr.isExprTerm) {
                            // operators are combined before the ternary
                            if (opCtx.prec >= 4) { // ternary is like a operator with prec 4
                                var headResult = opCtx.combine(head);
                                var condTerm = ConditionalExpressionTerm.create(headResult.term,
                                                                            question,
                                                                            truExpr,
                                                                            colon,
                                                                            flsExpr);
                                if (opCtx.stack.length > 0) {
                                    return step(condTerm,
                                                flsRes.rest,
                                                opCtx.stack[0]);
                                } else {
                                    return {
                                        result: condTerm,
                                        rest: flsRes.rest,
                                        prevStx: headResult.prevStx,
                                        prevTerms: headResult.prevTerms
                                    };
                                }
                            } else {
                                var condTerm = ConditionalExpressionTerm.create(head,
                                                                            question,
                                                                            truExpr,
                                                                            colon,
                                                                            flsExpr);
                                return step(condTerm,
                                            flsRes.rest,
                                            opCtx);
                            }
                        }
                    }
                }
            // Arrow functions with expression bodies
            } else if (head.isDelimiterTerm &&
                       head.delim.token.value === "()" &&
                       rest[0] &&
                       rest[0].isPunctuator() &&
                       resolveFast(rest[0], context.env, context.phase) === "=>") {
                var arrowRes = enforest(rest.slice(1), context);
                if (arrowRes.result && arrowRes.result.isExprTerm) {
                    return step(ArrowFunTerm.create(head.delim,
                                                rest[0],
                                                arrowRes.result.destruct(context)),
                                arrowRes.rest,
                                opCtx);
                } else {
                    throwSyntaxError("enforest",
                        "Body of arrow function must be an expression",
                        rest.slice(1));
                }
            // Arrow functions with expression bodies
            } else if (head.isIdTerm &&
                       rest[0] &&
                       rest[0].isPunctuator() &&
                       resolveFast(rest[0], context.env, context.phase) === "=>") {
                var res = enforest(rest.slice(1), context);
                if (res.result && res.result.isExprTerm) {
                    return step(ArrowFunTerm.create(head.id,
                                                rest[0],
                                                res.result.destruct(context)),
                                res.rest,
                                opCtx);
                } else {
                    throwSyntaxError("enforest",
                                     "Body of arrow function must be an expression",
                                     rest.slice(1));
                }
            // ParenExpr
            } else if (head.isDelimiterTerm &&
                       head.delim.token.value === "()") {
                // empty parens are acceptable but enforest
                // doesn't accept empty arrays so short
                // circuit here
                if (head.delim.token.inner.length === 0) {
                    return step(ParenExpressionTerm.create([EmptyTerm.create()], head.delim, []),
                               rest,
                               opCtx);
                } else {
                    var parenRes = enforestParenExpression(head.delim, context);
                    if (parenRes) {
                        return step(parenRes, rest, opCtx);
                    }
                }
            // AssignmentExpression
            } else if (head.isExprTerm &&
                        ((head.isIdTerm ||
                          head.isObjGetTerm ||
                          head.isObjDotGetTerm ||
                          head.isThisExpressionTerm) &&
                        rest[0] && rest[1] && !bopMacroObj && stxIsAssignOp(rest[0]))) {
                var opRes = enforestAssignment(rest, context, head, prevStx, prevTerms);
                if(opRes && opRes.result) {
                    return step(opRes.result, opRes.rest, _.extend({}, opCtx, {
                        prevStx: opRes.prevStx,
                        prevTerms: opRes.prevTerms
                    }));
                }
            // Postfix
            } else if(head.isExprTerm &&
                        (rest[0] && (unwrapSyntax(rest[0]) === "++" ||
                                     unwrapSyntax(rest[0]) === "--"))) {
                // Check if the operator is a macro first.
                if (context.env.has(resolveFast(rest[0], context.env, context.phase))) {
                    var headStx = tagWithTerm(head, head.destruct(context).reverse());
                    var opPrevStx = headStx.concat(prevStx);
                    var opPrevTerms = [head].concat(prevTerms);
                    var opRes = enforest(rest, context, opPrevStx, opPrevTerms);

                    if (opRes.prevTerms.length < opPrevTerms.length) {
                        return opRes;
                    } else if(opRes.result) {
                        return step(head,
                                    opRes.result.destruct(context).concat(opRes.rest),
                                    opCtx);
                    }
                }
                return step(PostfixOpTerm.create(head, rest[0]),
                            rest.slice(1),
                            opCtx);
            // ObjectGet (computed)
            } else if(head.isExprTerm &&
                        (rest[0] && rest[0].token.value === "[]"))  {
                return step(ObjGetTerm.create(head, DelimiterTerm.create(rest[0])),
                            rest.slice(1),
                            opCtx);
            // ObjectGet
            } else if (head.isExprTerm &&
                        (rest[0] && unwrapSyntax(rest[0]) === "." &&
                         !context.env.has(resolveFast(rest[0], context.env, context.phase)) &&
                         rest[1] &&
                         (rest[1].isIdentifier() ||
                          rest[1].isKeyword()))) {
                // Check if the identifier is a macro first.
                if (context.env.has(resolveFast(rest[1], context.env, context.phase))) {
                    var headStx = tagWithTerm(head, head.destruct(context).reverse());
                    var dotTerm = PuncTerm.create(rest[0]);
                    var dotTerms = [dotTerm].concat(head, prevTerms);
                    var dotStx = tagWithTerm(dotTerm, [rest[0]]).concat(headStx, prevStx);
                    var dotRes = enforest(rest.slice(1), context, dotStx, dotTerms);

                    if (dotRes.prevTerms.length < dotTerms.length) {
                        return dotRes;
                    } else if(dotRes.result) {
                        return step(head,
                                    [rest[0]].concat(dotRes.result.destruct(context), dotRes.rest),
                                    opCtx);
                    }
                }
                return step(ObjDotGetTerm.create(head, rest[0], rest[1]),
                            rest.slice(2),
                            opCtx);
            // ArrayLiteral
            } else if (head.isDelimiterTerm &&
                        head.delim.token.value === "[]") {
                return step(ArrayLiteralTerm.create(head), rest, opCtx);
            // Block
            } else if (head.isDelimiterTerm &&
                        head.delim.token.value === "{}") {
                return step(BlockTerm.create(head), rest, opCtx);
            // quote syntax
            } else if (head.isIdTerm &&
                        unwrapSyntax(head.id) === "#quoteSyntax" &&
                        rest[0] && rest[0].token.value === "{}") {

                return step(QuoteSyntaxTerm.create(rest[0]), rest.slice(1), opCtx);
            // return statement
            } else if (head.isKeywordTerm && unwrapSyntax(head.keyword) === "return") {
                if (rest[0] && rest[0].token.lineNumber === head.keyword.token.lineNumber) {
                    var returnPrevStx = tagWithTerm(head,
                                                    head.destruct(context)).concat(opCtx.prevStx);
                    var returnPrevTerms = [head].concat(opCtx.prevTerms);
                    var returnExpr = enforest(rest, context, returnPrevStx, returnPrevTerms);
                    if (returnExpr.prevTerms.length < opCtx.prevTerms.length) {
                        return returnExpr;
                    }
                    if (returnExpr.result.isExprTerm) {
                        return step(ReturnStatementTerm.create(head, returnExpr.result),
                                    returnExpr.rest,
                                    opCtx);
                    }
                } else {
                    return step(ReturnStatementTerm.create(head, EmptyTerm.create()),
                               rest,
                               opCtx);
                }
            // let statements
            } else if (head.isKeywordTerm &&
                       unwrapSyntax(head.keyword) === "let") {
                var nameTokens = [];
                if (rest[0] && rest[0].isDelimiter() &&
                    rest[0].token.value === "()") {
                    nameTokens = rest[0].token.inner;
                } else {
                    nameTokens.push(rest[0]);
                }

                // Let macro
                if (rest[1] && rest[1].token.value === "=" &&
                    rest[2] && rest[2].token.value === "macro") {
                    var mac = enforest(rest.slice(2), context);
                    if(mac.result) {
                        if (!mac.result.isAnonMacroTerm) {
                            throwSyntaxError("enforest", "expecting an anonymous macro definition in syntax let binding", rest.slice(2));
                        }
                        return step(LetMacroTerm.create(nameTokens, mac.result.body),
                                    mac.rest,
                                    opCtx);
                    }
                // Let statement
                } else {
                    var lsRes = enforestVarStatement(rest, context, head.keyword);
                    if (lsRes && lsRes.result) {
                        return step(LetStatementTerm.create(head, lsRes.result),
                                    lsRes.rest,
                                    opCtx);
                    }
                }
            // VariableStatement
            } else if (head.isKeywordTerm &&
                       unwrapSyntax(head.keyword) === "var" && rest[0]) {
                var vsRes = enforestVarStatement(rest, context, head.keyword);
                if (vsRes && vsRes.result) {
                    return step(VariableStatementTerm.create(head, vsRes.result),
                                vsRes.rest,
                                opCtx);
                }
            // Const Statement
            } else if (head.isKeywordTerm &&
                       unwrapSyntax(head.keyword) === "const" && rest[0]) {
                var csRes = enforestVarStatement(rest, context, head.keyword);
                if (csRes && csRes.result) {
                    return step(ConstStatementTerm.create(head, csRes.result),
                                csRes.rest,
                                opCtx);
                }
            // for statement
            } else if (head.isKeywordTerm &&
                       unwrapSyntax(head.keyword) === "for" &&
                       rest[0] && rest[0].token.value === "()") {
                return step(ForStatementTerm.create(head.keyword, rest[0]),
                            rest.slice(1),
                            opCtx);
            }
        } else {
            assert(head && head.token, "assuming head is a syntax object");

            var macroObj = expandCount < maxExpands && getValueInEnv(head, rest, context, context.phase);

            // macro invocation
            if (macroObj && typeof macroObj.fn === "function" && !macroObj.isOp) {
                var rt = expandMacro([head].concat(rest), context, opCtx, null, macroObj);
                var newOpCtx = opCtx;

                if (rt.prevTerms && rt.prevTerms.length < opCtx.prevTerms.length) {
                    newOpCtx = rewindOpCtx(opCtx, rt);
                }

                if (rt.result.length > 0) {
                    return step(rt.result[0],
                                rt.result.slice(1).concat(rt.rest),
                                newOpCtx);
                } else {
                    return step(EmptyTerm.create(), rt.rest, newOpCtx);
                }
            // anon macro definition
            } else if (head.isIdentifier() &&
                       unwrapSyntax(head) === "macro" &&
                       resolve(head, context.phase) === "macro" &&
                       rest[0] && rest[0].token.value === "{}") {

                return step(AnonMacroTerm.create(rest[0].token.inner),
                            rest.slice(1),
                            opCtx);
            // macro definition
            } else if (head.isIdentifier() &&
                       unwrapSyntax(head) === "macro" &&
                       resolve(head, context.phase) === "macro") {
                var nameTokens = [];
                if (rest[0] && rest[0].isDelimiter() &&
                    rest[0].token.value === "()") {
                    nameTokens = rest[0].token.inner;
                } else {
                    nameTokens.push(rest[0])
                }
                if (rest[1] && rest[1].isDelimiter()) {
                    return step(MacroTerm.create(nameTokens, rest[1].token.inner),
                                rest.slice(2),
                                opCtx);
                } else {
                    throwSyntaxError("enforest", "Macro declaration must include body", rest[1]);
                }
            // operator definition
            // unaryop (neg) 1 { macro { rule { $op:expr } => { $op } } }
            } else if (head.isIdentifier() &&
                       head.token.value === "unaryop" &&
                       rest[0] && rest[0].isDelimiter() &&
                       rest[0].token.value === "()" &&
                       rest[1] && rest[1].isNumericLiteral() &&
                       rest[2] && rest[2].isDelimiter() &&
                       rest[2] && rest[2].token.value === "{}") {
                var trans = enforest(rest[2].token.inner, context);
                return step(OperatorDefinitionTerm.create(syn.makeValue("unary", head),
                                                      rest[0].token.inner,
                                                      rest[1],
                                                      null,
                                                      trans.result.body),
                            rest.slice(3),
                            opCtx);
            // operator definition
            // binaryop (neg) 1 left { macro { rule { $op:expr } => { $op } } }
            } else if (head.isIdentifier() &&
                       head.token.value === "binaryop" &&
                       rest[0] && rest[0].isDelimiter() &&
                       rest[0].token.value === "()" &&
                       rest[1] && rest[1].isNumericLiteral() &&
                       rest[2] && rest[2].isIdentifier() &&
                       rest[3] && rest[3].isDelimiter() &&
                       rest[3] && rest[3].token.value === "{}") {
                var trans = enforest(rest[3].token.inner, context);
                return step(OperatorDefinitionTerm.create(syn.makeValue("binary", head),
                                                      rest[0].token.inner,
                                                      rest[1],
                                                      rest[2],
                                                      trans.result.body),
                            rest.slice(4),
                            opCtx);
            // function definition
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "function" &&
                       rest[0] && rest[0].isIdentifier() &&
                       rest[1] && rest[1].isDelimiter() &&
                       rest[1].token.value === "()" &&
                       rest[2] && rest[2].isDelimiter() &&
                       rest[2].token.value === "{}") {

                rest[1].token.inner = rest[1].token.inner;
                rest[2].token.inner = rest[2].token.inner;
                return step(NamedFunTerm.create(head, null, rest[0],
                                            rest[1],
                                            rest[2]),
                            rest.slice(3),
                            opCtx);
            // generator function definition
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "function" &&
                       rest[0] && rest[0].isPunctuator() &&
                       rest[0].token.value === "*" &&
                       rest[1] && rest[1].isIdentifier() &&
                       rest[2] && rest[2].isDelimiter() &&
                       rest[2].token.value === "()" &&
                       rest[3] && rest[3].isDelimiter() &&
                       rest[3].token.value === "{}") {

                rest[2].token.inner = rest[2].token.inner;
                rest[3].token.inner = rest[3].token.inner;
                return step(NamedFunTerm.create(head, rest[0], rest[1],
                                            rest[2],
                                            rest[3]),
                            rest.slice(4),
                            opCtx);
            // anonymous function definition
            } else if(head.isKeyword() &&
                      unwrapSyntax(head) === "function" &&
                      rest[0] && rest[0].isDelimiter() &&
                      rest[0].token.value === "()" &&
                      rest[1] && rest[1].isDelimiter() &&
                      rest[1].token.value === "{}") {

                rest[0].token.inner = rest[0].token.inner;
                rest[1].token.inner = rest[1].token.inner;
                return step(AnonFunTerm.create(head,
                                            null,
                                            rest[0],
                                            rest[1]),
                            rest.slice(2),
                            opCtx);
            // anonymous generator function definition
            } else if(head.isKeyword() &&
                      unwrapSyntax(head) === "function" &&
                      rest[0] && rest[0].isPunctuator() &&
                      rest[0].token.value === "*" &&
                      rest[1] && rest[1].isDelimiter() &&
                      rest[1].token.value === "()" &&
                      rest[2] && rest[2].isDelimiter&&
                      rest[2].token.value === "{}") {

                rest[1].token.inner = rest[1].token.inner;
                rest[2].token.inner = rest[2].token.inner;
                return step(AnonFunTerm.create(head,
                                            rest[0],
                                            rest[1],
                                            rest[2]),
                            rest.slice(3),
                            opCtx);
            // arrow function
            } else if(((head.isDelimiter() &&
                        head.token.value === "()") ||
                       head.isIdentifier()) &&
                      rest[0] && rest[0].isPunctuator() &&
                      resolveFast(rest[0], context.env, context.phase) === "=>" &&
                      rest[1] && rest[1].isDelimiter() &&
                      rest[1].token.value === "{}") {
                return step(ArrowFunTerm.create(head, rest[0], rest[1]),
                            rest.slice(2),
                            opCtx);
            // catch statement
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "catch" &&
                       rest[0] && rest[0].isDelimiter() &&
                       rest[0].token.value === "()" &&
                       rest[1] && rest[1].isDelimiter() &&
                       rest[1].token.value === "{}") {
                rest[0].token.inner = rest[0].token.inner;
                rest[1].token.inner = rest[1].token.inner;
                return step(CatchClauseTerm.create(head, rest[0], rest[1]),
                            rest.slice(2),
                            opCtx);
            // this expression
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "this") {
                return step(ThisExpressionTerm.create(head), rest, opCtx);
            // literal
            } else if (head.isNumericLiteral() ||
                       head.isStringLiteral()||
                       head.isBooleanLiteral()||
                       head.isRegularExpression() ||
                       head.isNullLiteral()) {

                return step(LitTerm.create(head), rest, opCtx);
            } else if (head.isKeyword() && unwrapSyntax(head) === "import") {
                var imp = enforestImport(head, rest);
                return step(imp.result, imp.rest, opCtx);
            // export
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "export" &&
                       rest[0] && (rest[0].isIdentifier() ||
                                   rest[0].isKeyword() ||
                                   rest[0].isPunctuator() ||
                                   rest[0].isDelimiter())) {
                if (unwrapSyntax(rest[1]) !== ";" && toksAdjacent(rest[0], rest[1])) {
                    throwSyntaxError("enforest",
                                     "multi-token macro/operator names must be wrapped in () when exporting",
                                     rest[1]);
                }
                return step(ExportTerm.create(head, rest[0]), rest.slice(1), opCtx);
            // identifier
            } else if (head.isIdentifier()) {
                return step(IdTerm.create(head), rest, opCtx);
            // punctuator
            } else if (head.isPunctuator()) {
                return step(PuncTerm.create(head), rest, opCtx);
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "with") {
                throwSyntaxError("enforest", "with is not supported in sweet.js", head);
            // keyword
            } else if (head.isKeyword()) {
                return step(KeywordTerm.create(head), rest, opCtx);
            // Delimiter
            } else if (head.isDelimiter()) {
                return step(DelimiterTerm.create(head), rest, opCtx);
            } else if (head.isTemplate()) {
                return step(TemplateTerm.create(head), rest, opCtx);
            // end of file
            } else if (head.isEOF()) {
                assert(rest.length === 0, "nothing should be after an EOF");
                return step(EOFTerm.create(head), [], opCtx);
            } else {
                // todo: are we missing cases?
                assert(false, "not implemented");
            }

        }

        // Potentially an infix macro
        // This should only be invoked on runtime syntax terms
        if (!head.isMacroTerm && !head.isLetMacroTerm && !head.isAnonMacroTerm && !head.isOperatorDefinitionTerm &&
            rest.length && nameInEnv(rest[0], rest.slice(1), context, context.phase) &&
            getValueInEnv(rest[0], rest.slice(1), context, context.phase).isOp === false) {
            var infLeftTerm = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartialTerm
                              ? opCtx.prevTerms[0]
                              : null;
            var infTerm = PartialExpressionTerm.create(head.destruct(context), infLeftTerm, function() {
                return step(head, [], opCtx);
            });
            var infPrevStx = tagWithTerm(infTerm, head.destruct(context)).reverse().concat(opCtx.prevStx);
            var infPrevTerms = [infTerm].concat(opCtx.prevTerms);
            var infRes = expandMacro(rest, context, {
                prevStx: infPrevStx,
                prevTerms: infPrevTerms
            });
            if (infRes.prevTerms && infRes.prevTerms.length < infPrevTerms.length) {
                var infOpCtx = rewindOpCtx(opCtx, infRes);
                return step(infRes.result[0], infRes.result.slice(1).concat(infRes.rest), infOpCtx);
            } else {
                return step(head, infRes.result.concat(infRes.rest), opCtx);
            }
        }

        // done with current step so combine and continue on
        var combResult = opCtx.combine(head);
        if (opCtx.stack.length === 0) {
            return {
                result: combResult.term,
                rest: rest,
                prevStx: combResult.prevStx,
                prevTerms: combResult.prevTerms
            };
        } else {
            return step(combResult.term, rest, opCtx.stack[0]);
        }
    }

    return step(toks[0], toks.slice(1), {
        combine: function(t) {
            return {
                term: t,
                prevStx: prevStx,
                prevTerms: prevTerms
            };
        },
        prec: 0,
        stack: [],
        op: null,
        prevStx: prevStx,
        prevTerms: prevTerms
    });
}

function rewindOpCtx(opCtx, res) {
    // If we've consumed all pending operators, we can just start over.
    // It's important that we always thread the new prevStx and prevTerms
    // through, otherwise the old ones will still persist.
    if (!res.prevTerms.length ||
        !res.prevTerms[0].isPartialTerm) {
        return _.extend({}, opCtx, {
            combine: function(t) {
                return {
                    term: t,
                    prevStx: res.prevStx,
                    prevTerms: res.prevTerms
                };
            },
            prec: 0,
            op: null,
            stack: [],
            prevStx: res.prevStx,
            prevTerms: res.prevTerms
        });
    }

    // To rewind, we need to find the first (previous) pending operator. It
    // acts as a marker in the opCtx to let us know how far we need to go
    // back.
    var op = null;
    for (var i = 0; i < res.prevTerms.length; i++) {
        if (!res.prevTerms[i].isPartialTerm) {
            break;
        }
        if (res.prevTerms[i].isPartialOperationTerm) {
            op = res.prevTerms[i];
            break;
        }
    }

    // If the op matches the current opCtx, we don't need to rewind
    // anything, but we still need to persist the prevStx and prevTerms.
    if (opCtx.op === op) {
        return _.extend({}, opCtx, {
            prevStx: res.prevStx,
            prevTerms: res.prevTerms
        });
    }

    for (var i = 0; i < opCtx.stack.length; i++) {
        if (opCtx.stack[i].op === op) {
            return _.extend({}, opCtx.stack[i], {
                prevStx: res.prevStx,
                prevTerms: res.prevTerms
            });
        }
    }

    assert(false, "Rewind failed.");
}

function get_expression(stx, context) {
    if (stx[0].term) {
        for (var termLen = 1; termLen < stx.length; termLen++) {
            if (stx[termLen].term !== stx[0].term) {
                break;
            }
        }
        // Guard the termLen because we can have a multi-token term that
        // we don't want to split. TODO: is there something we can do to
        // get around this safely?
        if (stx[0].term.isPartialExpressionTerm &&
            termLen === stx[0].term.stx.length) {
            var expr = stx[0].term.combine().result;
            for (var i = 1, term = stx[0].term; i < stx.length; i++) {
                if (stx[i].term !== term) {
                    if (term && term.isPartialTerm) {
                        term = term.left;
                        i--;
                    } else {
                        break;
                    }
                }
            }
            return {
                result: expr,
                rest: stx.slice(i)
            };
        } else if (stx[0].term.isExprTerm) {
            return {
                result: stx[0].term,
                rest: stx.slice(termLen)
            };
        } else {
            return {
              result: null,
              rest: stx
            };
        }
    }

    var res = enforest(stx, context);
    if (!res.result || !res.result.isExprTerm) {
        return {
          result: null,
          rest: stx
        };
    }
    return res;
}

function tagWithTerm(term, stx) {
    return stx.map(function(s) {
        cloned newtok <- s.token;
        s = syntaxFromToken(newtok, s);
        s.term = term;
        return s;
    });
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
function loadMacroDef(body, context, phase) {

    var expanded = body[0].destruct(context, {stripCompileTerm: true});
    var stub = parser.read("()");
    stub[0].token.inner = expanded;
    var flattend = flatten(stub);
    var bodyCode = codegen.generate(parser.parse(flattend, {phase: phase}));
    var macroGlobal = {
        makeValue: syn.makeValue,
        makeRegex: syn.makeRegex,
        makeIdent: syn.makeIdent,
        makeKeyword: syn.makeKeyword,
        makePunc: syn.makePunc,
        makeDelim: syn.makeDelim,
        filename: context.filename,
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
                result: r.result === null ? [] : r.result.destruct(context),
                rest: r.rest
            };
        },
        getIdent: function(stx) {
            if (stx[0] && stx[0].isIdentifier()) {
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
            assert(context.templateMap.has(id), "missing template");
            return syn.cloneSyntaxArray(context.templateMap.get(id));
        },
        applyMarkToPatternEnv: applyMarkToPatternEnv,
        mergeMatches: function(newMatch, oldMatch) {
            newMatch.patternEnv = _.extend({}, oldMatch.patternEnv, newMatch.patternEnv);
            return newMatch;
        },
        console: console
    };
    context.env.keys().forEach(key -> {
        var val = context.env.get(key);
        // load the compile time values into the global object
        if (val && val.value) {
            macroGlobal[key] = val.value;
        }
    });
    var macroFn;
    if (vm) {
        macroFn = vm.runInNewContext("(function() { return " + bodyCode + " })()",
                                     macroGlobal);
    } else {
        macroFn = scopedEval(bodyCode, macroGlobal);
    }

    return macroFn;
}



// similar to `parse1` in the honu paper
// @ ([...SyntaxObject], ExpanderContext) -> {
//     terms: [...TermTreeObject],
//     context: ExpanderContext,
//     restStx: Undefined or [...SyntaxObject]
// }
function expandToTermTree(stx, context) {
    assert(context, "expander context is required");

    var f, head, prevStx, restStx, prevTerms, macroDefinition;
    var rest = stx;

    while (rest.length > 0) {
        assert(rest[0].token, "expecting a syntax object");

        f = enforest(rest, context, prevStx, prevTerms);
        // head :: TermTree
        head = f.result;
        // rest :: [Syntax]
        rest = f.rest;

        if (!head) {
            // no head means the expansions stopped prematurely (for stepping)
            restStx = rest;
            break;
        }

        var destructed = tagWithTerm(head, f.result.destruct(context));
        prevTerms = [head].concat(f.prevTerms);
        prevStx = destructed.reverse().concat(f.prevStx);

        if (head.isImportTerm) {
            // record the import in the module record for easier access
            context.moduleRecord.importEntries.push(head);
            // load up the (possibly cached) import module
            var importMod = loadImport(head, context);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context = visit(importMod.term, importMod.record, context.phase, context);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            rest = bindImportInMod(head, rest, importMod.term, importMod.record, context, context.phase);
        }

        if (head.isImportForMacrosTerm) {
            // record the import in the module record for easier access
            context.moduleRecord.importEntries.push(head);
            // load up the (possibly cached) import module
            var importMod = loadImport(head, context);
            // invoking an imported module loads the runtime values
            // into the environment for this phase
            context = invoke(importMod.term, importMod.record, context.phase + 1, context);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context = visit(importMod.term, importMod.record, context.phase + 1, context);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            rest = bindImportInMod(head, rest, importMod.term, importMod.record, context, context.phase + 1);
        }

        if (head.isMacroTerm && expandCount < maxExpands) {
            // raw function primitive form
            if(!(head.body[0] && head.body[0].isKeyword() &&
                 head.body[0].token.value === "function")) {
                throwSyntaxError("load macro",
                                 "Primitive macro form must contain a function for the macro body",
                                 head.body);
            }
            // expand the body
            head.body = expand(head.body,
                               makeExpanderContext(_.extend({},
                                                            context,
                                                            {phase: context.phase + 1})));
            //  and load the macro definition into the environment
            macroDefinition = loadMacroDef(head.body, context, context.phase + 1);
            var name = head.name.map(unwrapSyntax).join("");
            var nameStx = syn.makeIdent(name, head.name[0]);
            addToDefinitionCtx([nameStx], context.defscope, false, context.paramscope);
            context.env.names.set(name, true);
            context.env.set(resolve(nameStx, context.phase), {
                fn: macroDefinition,
                isOp: false,
                builtin: builtinMode,
                fullName: head.name
            });
        }

        if (head.isLetMacroTerm && expandCount < maxExpands) {
            // raw function primitive form
            if(!(head.body[0] && head.body[0].isKeyword() &&
                 head.body[0].token.value === "function")) {
                throwSyntaxError("load macro",
                                 "Primitive macro form must contain a function for the macro body",
                                 head.body);
            }
            // expand the body
            head.body = expand(head.body,
                               makeExpanderContext(_.extend({phase: context.phase + 1},
                                                            context)));
            //  and load the macro definition into the environment
            macroDefinition = loadMacroDef(head.body, context, context.phase + 1);
            var freshName = fresh();
            var name = head.name.map(unwrapSyntax).join("");
            var oldName = head.name;
            var nameStx = syn.makeIdent(name, head.name[0]);
            var renamedName = nameStx.rename(nameStx, freshName);
            // store a reference to the full name in the props object.
            // this allows us to communicate the original full name to
            // `visit` later on.
            renamedName.props.fullName = oldName;
            head.name = [renamedName];
            rest = _.map(rest, function(stx) {
                return stx.rename(nameStx, freshName);
            });

            context.env.names.set(name, true);
            context.env.set(resolve(renamedName, context.phase), {
                fn: macroDefinition,
                isOp: false,
                builtin: builtinMode,
                fullName: oldName
            });
        }

        if (head.isOperatorDefinitionTerm) {
            // raw function primitive form
            if(!(head.body[0] && head.body[0].isKeyword() &&
                 head.body[0].token.value === "function")) {
                throwSyntaxError("load macro",
                                 "Primitive macro form must contain a function for the macro body",
                                 head.body);
            }
            // expand the body
            head.body = expand(head.body,
                               makeExpanderContext(_.extend({phase: context.phase + 1},
                                                            context)));
            //  and load the macro definition into the environment
            var opDefinition = loadMacroDef(head.body, context, context.phase + 1);

            var name = head.name.map(unwrapSyntax).join("");
            var nameStx = syn.makeIdent(name, head.name[0]);
            addToDefinitionCtx([nameStx], context.defscope, false, context.paramscope);
            var resolvedName = resolve(nameStx, context.phase);
            var opObj = context.env.get(resolvedName);
            if (!opObj) {
                opObj = {
                    isOp: true,
                    builtin: builtinMode,
                    fullName: head.name
                }
            }
            assert(unwrapSyntax(head.type) === "binary" ||
                   unwrapSyntax(head.type) === "unary",
                   "operator must either be binary or unary");
            opObj[unwrapSyntax(head.type)] = {
                fn: opDefinition,
                prec: head.prec.token.value,
                assoc: head.assoc ? head.assoc.token.value : null
            };
            context.env.names.set(name, true);
            context.env.set(resolvedName, opObj);
        }

        if (head.isNamedFunTerm) {
            addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
        }

        if (head.isVariableStatementTerm ||
            head.isLetStatementTerm ||
            head.isConstStatementTerm) {
            addToDefinitionCtx(_.map(head.decls, function(decl) { return decl.ident; }),
                               context.defscope,
                               true,
                               context.paramscope);
        }

        if(head.isBlockTerm && head.body.isDelimiterTerm) {
            head.body.delim.token.inner.forEach(function(term) {
                if (term.isVariableStatementTerm) {
                    addToDefinitionCtx(_.map(term.decls, function(decl)  { return decl.ident; }),
                                       context.defscope,
                                       true,
                                       context.paramscope);
                }
            });

        }

        if(head.isDelimiterTerm) {
            head.delim.token.inner.forEach(function(term)  {
                if (term.isVariableStatementTerm) {
                    addToDefinitionCtx(_.map(term.decls, function(decl) { return decl.ident; }),
                                       context.defscope,
                                       true,
                                       context.paramscope);

                }
            });
        }

        if (head.isForStatementTerm) {
            var forCond = head.cond.token.inner;
            if(forCond[0] && resolve(forCond[0], context.phase) === "let" &&
               forCond[1] && forCond[1].isIdentifier()) {
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
                    var bodyDestructed = bodyEnf.result.destruct(context);
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
        restStx: restStx,
        context: context,
    };
}

function addToDefinitionCtx(idents, defscope, skipRep, paramscope) {
    assert(idents && idents.length > 0, "expecting some variable identifiers");
    // flag for skipping repeats since we reuse this function to place both
    // variables declarations (which need to skip redeclarations) and
    // macro definitions which don't
    skipRep = skipRep || false;
    _.chain(idents)
        .filter(function(id) {
            if (skipRep) {
                /*
                   When var declarations repeat in the same function scope:

                   var x = 24;
                   ...
                   var x = 42;

                   we just need to use the first renaming and leave the
                   definition context as is.
                */
                var varDeclRep = _.find(defscope, function(def) {
                    return def.id.token.value === id.token.value &&
                        arraysEqual(marksof(def.id.context), marksof(id.context));
                });
                /*
                    When var declaration repeat one of the function parameters:

                    function foo(x) {
                        var x;
                    }

                    we don't need to add the var to the definition context.
                */
                var paramDeclRep = _.find(paramscope, function(param) {
                    return param.token.value === id.token.value &&
                        arraysEqual(marksof(param.context), marksof(id.context));
                });
                return (typeof varDeclRep === 'undefined') &&
                       (typeof paramDeclRep === 'undefined');
            }
            return true;
        }).each(function(id) {
            var name = fresh();
            defscope.push({
                id: id,
                name: name
            });
        });
}


// similar to `parse2` in the honu paper except here we
// don't generate an AST yet
// @ (TermTreeObject, ExpanderContext) -> TermTreeObject
function expandTermTreeToFinal (term, context) {
    assert(context && context.env, "environment map is required");

    if (term.isArrayLiteralTerm) {
        term.array.delim.token.inner = expand(term.array.delim.token.inner, context);
        return term;
    } else if (term.isBlockTerm) {
        term.body.delim.token.inner = expand(term.body.delim.token.inner, context);
        return term;
    } else if (term.isParenExpressionTerm) {
        term.args = _.map(term.args, function(arg) {
            return expandTermTreeToFinal(arg, context);
        });
        return term;
    } else if (term.isCallTerm) {
        term.fun = expandTermTreeToFinal(term.fun, context);
        term.args = expandTermTreeToFinal(term.args, context);
        return term;
    } else if (term.isReturnStatementTerm) {
        term.expr = expandTermTreeToFinal(term.expr, context);
        return term;
    } else if (term.isUnaryOpTerm) {
        term.expr = expandTermTreeToFinal(term.expr, context);
        return term;
    } else if (term.isBinOpTerm || term.isAssignmentExpressionTerm) {
        term.left = expandTermTreeToFinal(term.left, context);
        term.right = expandTermTreeToFinal(term.right, context);
        return term;
    } else if (term.isObjGetTerm) {
        term.left = expandTermTreeToFinal(term.left, context);
        term.right.delim.token.inner = expand(term.right.delim.token.inner, context);
        return term;
    } else if (term.isObjDotGetTerm) {
        term.left = expandTermTreeToFinal(term.left, context);
        term.right = expandTermTreeToFinal(term.right, context);
        return term;
    } else if (term.isConditionalExpressionTerm) {
        term.cond = expandTermTreeToFinal(term.cond, context);
        term.tru = expandTermTreeToFinal(term.tru, context);
        term.fls = expandTermTreeToFinal(term.fls, context);
        return term;
    } else if (term.isVariableDeclarationTerm) {
        if (term.init) {
            term.init = expandTermTreeToFinal(term.init, context);
        }
        return term;
    } else if (term.isVariableStatementTerm) {
        term.decls = _.map(term.decls, function(decl) {
            return expandTermTreeToFinal(decl, context);
        });
        return term;
    } else if (term.isDelimiterTerm) {
        // expand inside the delimiter and then continue on
        term.delim.token.inner = expand(term.delim.token.inner, context);
        return term;
    } else if (term.isNamedFunTerm ||
               term.isAnonFunTerm ||
               term.isCatchClauseTerm ||
               term.isArrowFunTerm ||
               term.isModuleTerm) {
        // function definitions need a bunch of hygiene logic
        // push down a fresh definition context
        var newDef = [];

        var paramSingleIdent = term.params && term.params.isIdentifier();

        var params;
        if (term.params && term.params.isDelimiter()) {
            params = term.params;
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

        var bodyContext = makeExpanderContext(_.defaults({
            defscope: newDef,
            // paramscope is used to filter out var redeclarations
            paramscope: paramNames.map(function(p) {
                return p.renamedParam;
            })
        }, context));


        // rename the function body for each of the parameters
        var renamedBody = _.reduce(paramNames, function(accBody, p) {
            return accBody.rename(p.originalParam, p.freshName)
        }, bodies);
        renamedBody = renamedBody;

        var expandedResult = expandToTermTree(renamedBody.token.inner, bodyContext);
        var bodyTerms = expandedResult.terms;

        if(expandedResult.restStx) {
            // The expansion was halted prematurely. Just stop and
            // return what we have so far, along with the rest of the syntax
            renamedBody.token.inner = expandedResult.terms.concat(expandedResult.restStx);
            if(Array.isArray(term.body)) {
                term.body = renamedBody.token.inner;
            }
            else {
                term.body = renamedBody;
            }
            return term;
        }

        var renamedParams = _.map(paramNames, function(p) { return p.renamedParam});
        var flatArgs;
        if (paramSingleIdent) {
            flatArgs = renamedParams[0];
        } else {
            var puncCtx = (term.params || null);
            flatArgs = syn.makeDelim("()",
                                     joinSyntax(renamedParams, syn.makePunc(",", puncCtx)),
                                     puncCtx);
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
            if (bodyTerm.isBlockTerm) {
                // we need to expand blocks before adding the defctx since
                // blocks defer macro expansion.
                var blockFinal = expandTermTreeToFinal(bodyTerm,
                                                       expandedResult.context);
                return blockFinal.addDefCtx(newDef);
            } else {
                var termWithCtx = bodyTerm.addDefCtx(newDef);
                // finish expansion
                return expandTermTreeToFinal(termWithCtx,
                                             expandedResult.context);
            }
        })

        if (term.isModuleTerm) {
            bodyTerms.forEach(bodyTerm -> {
                if (bodyTerm.isExportTerm) {
                    if (bodyTerm.name.isDelimiter() &&
                        bodyTerm.name.token.value === "{}") {
                        bodyTerm.name.token.inner
                            |> filterModuleCommaSep
                            |> names -> names.forEach(name -> {
                                context.moduleRecord.exportEntries.push(name);
                            });
                    } else {
                        throwSyntaxError("expand", "not valid export type", bodyTerm.name);
                    }
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

// @ let TermTree = {}

// similar to `parse` in the honu paper
// @ ([...SyntaxObject], ExpanderContext) -> [...TermTreeObject]
function expand(stx, context) {
    assert(context, "must provide an expander context");

    var trees = expandToTermTree(stx, context);
    var terms = _.map(trees.terms, function(term) {
        return expandTermTreeToFinal(term, trees.context);
    });

    if(trees.restStx) {
        terms.push.apply(terms, trees.restStx);
    }

    return terms;
}

function makeExpanderContext(o) {
    o = o || {};

    var env = o.env || new StringMap();
    if (!env.names) {
        env.names = new StringMap();
    }

    return Object.create(Object.prototype, {
        filename: {value: o.filename,
                   writable: false, enumerable: true, configurable: false},
        compileSuffix: {value: o.compileSuffix || ".jsc",
                        writable: false, enumerable: true, configurable: false},
        env: {value: env,
              writable: false, enumerable: true, configurable: false},
        defscope: {value: o.defscope,
                   writable: false, enumerable: true, configurable: false},
        paramscope: {value: o.paramscope,
                     writable: false, enumerable: true, configurable: false},
        templateMap: {value: o.templateMap || new StringMap(),
                      writable: false, enumerable: true, configurable: false},
        patternMap: {value: o.patternMap || new StringMap(),
                     writable: false, enumerable: true, configurable: false},
        mark: {value: o.mark,
                      writable: false, enumerable: true, configurable: false},
        phase: {value: o.phase,
                      writable: false, enumerable: true, configurable: false},
        implicitImport: {value: o.implicitImport || new StringMap(),
                         writable: false, enumerable: true, configurable: false},
        moduleRecord: {value: o.moduleRecord || {},
                       writable: false, enumerable: true, configurable: false}
    });
}

function makeModuleExpanderContext(filename, templateMap, patternMap, phase, moduleRecord, compileSuffix) {
    return makeExpanderContext({
        filename: filename,
        templateMap: templateMap,
        patternMap: patternMap,
        phase: phase,
        moduleRecord: moduleRecord,
        compileSuffix: compileSuffix
    });
}

function makeTopLevelExpanderContext(options) {
    var filename = options && options.filename ? options.filename : "<anonymous module>";
    return makeExpanderContext({
        filename: filename,
    });
}

// a hack to make the top level hygiene work out
function expandTopLevel(stx, moduleContexts, options) {
    moduleContexts = moduleContexts || [];
    options = options || {};
    options.flatten = options.flatten != null ? options.flatten : true;

    maxExpands = options.maxExpands || Infinity;
    expandCount = 0;

    var context = makeTopLevelExpanderContext(options);
    var modBody = syn.makeDelim("{}", stx, null);
    modBody = _.reduce(moduleContexts, function(acc, mod) {
        context.env.extend(mod.env);
        context.env.names.extend(mod.env.names);
        return loadModuleExports(acc, context.env, mod.exports, mod.env);
    }, modBody);

    var res = expand([syn.makeIdent("module", null), modBody], context);
    res = res[0].destruct(context, {stripCompileTerm: true});
    res = res[0].token.inner;
    return options.flatten ? flatten(res) : res;
}


// @ (Str, Str) -> Str
function resolvePath(name, parent) {
    var path = require("path");
    var resolveSync = require("resolve/lib/sync");
    var root  = path.dirname(parent);
    var fs = require("fs");
    if (name[0] === ".") {
        name = path.resolve(root, name);
    }
    return resolveSync(name, {
        basedir: root,
        extensions: ['.js', '.sjs']
    });
}

// (Str) -> [...SyntaxObject]
function defaultImportStx(importPath, ctx) {
    var names = [
        "quoteSyntax",
        "syntax",
        "#",
        "syntaxCase",
        "macro",
        "withSyntax",
        "letstx",
        "macroclass",
        "operator"
    ];

    var importNames = names.map(name -> syn.makeIdent(name, ctx));
    var importForMacrosNames = names.map(name -> syn.makeIdent(name, ctx));
    // import { names ... } from "importPath" for macros
    var importForMacrosStmt = [syn.makeKeyword("import", ctx),
                               syn.makeDelim("{}", joinSyntax(importForMacrosNames,
                                                              syn.makePunc(",", ctx)),
                                             ctx),
                               syn.makeIdent("from", ctx),
                               syn.makeValue(importPath, ctx),
                               syn.makeKeyword("for", ctx),
                               syn.makeIdent("macros", ctx)];

    // import { names ... } from "importPath"
    var importStmt = [syn.makeKeyword("import", ctx),
                      syn.makeDelim("{}", joinSyntax(importNames,
                                                     syn.makePunc(",", ctx)),
                                    ctx),
                      syn.makeIdent("from", ctx),
                      syn.makeValue(importPath, ctx)];

    return importStmt.concat(importForMacrosStmt);
}

// @ (Str, [...SyntaxObject]) -> {
//    record: ModuleRecord,
//    term: ModuleTerm
// }
function createModule(name, body) {
    var language = "base";
    var modBody = body;

    if (body && body[0] && body[1] && body[2] &&
        unwrapSyntax(body[0]) === "#" &&
        unwrapSyntax(body[1]) === "lang" &&
        body[2].isStringLiteral()) {

        language = unwrapSyntax(body[2]);
        // consume optional semicolon
        modBody = body[3] && body[3].token.value === ";" &&
            body[3].isPunctuator() ? body.slice(4) : body.slice(3);
    }

    // insert the default import statements into the module body
    if (language !== "base" && language !== "js") {
        // "base" and "js" are currently special languages meaning don't
        // insert the default imports
        modBody = defaultImportStx(language, body[0]).concat(modBody);
    }

    return {
        record: {
            name: name,
            language: language,
            importEntries: [],
            exportEntries: []
        },
        term: ModuleTerm.create(modBody)
    };
}

// @ (Str) -> {
//     record: ModuleRecord,
//     term: ModuleTerm
// }
function loadModule(name) {
    // node specific code
    var fs = require("fs");
    return fs.readFileSync(name, 'utf8')
        |> parser.read |> body -> {
            return createModule(name, body)
        };

}

// For a given module, phase, and context load the runtime values
// into the context and return the modified context
// @ (ModuleTerm, ModuleRecord, Num, ExpanderContext) -> ExpanderContext
function invoke(modTerm, modRecord, phase, context) {
    if (modRecord.language === "base") {
        // base modules can just use the normal require pipeline
        var exported = require(modRecord.name);
        Object.keys(exported).forEach(exp -> {
            // create new bindings in the context
            var freshName = fresh();
            var expName = syn.makeIdent(exp, null);
            var renamed = expName.rename(expName, freshName)

            modRecord.exportEntries.push(renamed);
            context.env.set(resolve(renamed, phase), {
                value: exported[exp]
            });
            context.env.names.set(exp, true);
        })
    } else {
        // recursively invoke any imports in this module at this
        // phase and update the context
        modRecord.importEntries.forEach(imp -> {
            var importMod = loadImport(imp, context);
            if (imp.isImportTerm) {
                context = invoke(importMod.term, importMod.record, phase, context);
            }
        });

        // turn the module into text so we can eval it
        var code = modTerm.body
            |> terms -> terms.map(term -> term.destruct(context, {stripCompileTerm: true,
                                                                  stripModuleTerm: true}))
            |> _.flatten
            |> flatten
            |> parser.parse
            |> codegen.generate

        var global = {
            console: console
        };

        // eval but with a fresh heap
        vm.runInNewContext(code, global);

        // update the exports with the runtime values
        modRecord.exportEntries.forEach(exp -> {
            var expName = resolve(exp, phase);
            var expVal = global[expName];
            context.env.set(expName, {value: expVal});
            context.env.names.set(unwrapSyntax(exp), true);
        });
    }

    return context;
}


// For a given module, phase, and context, load the compiletime values into
// the context and return the modified context
// @ (ModuleTerm, ModuleRecord, Num, ExpanderContext) -> ExpanderContext
function visit(modTerm, modRecord, phase, context) {
    var defctx = [];
    // don't need to visit base modules since they do not support macros
    if (modRecord.language === "base") {
        return context;
    }
    // add a visiting definition context since we are binding
    // macros in the module scope
    modTerm.body = modTerm.body.map(term -> term.addDefCtx(defctx));
    // reset the exports
    modRecord.exportEntries = [];

    // for each of the imported modules, recursively visit and
    // invoke them at the appropriate phase and then bind the
    // imported names in this module
    modRecord.importEntries.forEach(imp -> {
        var importMod = loadImport(imp, context);

        if(imp.isImportTerm) {
            context = visit(importMod.term, importMod.record, phase, context);
        } else if (imp.isImportForMacrosTerm) {
            context = invoke(importMod.term, importMod.record, phase + 1, context);
            context = visit(importMod.term, importMod.record, phase + 1, context);
        } else {
            // todo: arbitrary phase
            assert(false, "not implemented yet");
        }

        modTerm.body = bindImportInMod(imp,
                                       modTerm.body,
                                       importMod.term,
                                       importMod.record,
                                       context,
                                       phase);
    });

    // go through the module and load any compiletime values in to the context
    modTerm.body.forEach(term -> {
        var name;
        var macroDefinition;
        if (term.isMacroTerm) {
            macroDefinition = loadMacroDef(term.body, context, phase + 1);
            name = unwrapSyntax(term.name[0]);

            context.env.names.set(name, true);
            context.env.set(resolve(term.name[0], phase), {
                fn: macroDefinition,
                isOp: false,
                builtin: builtinMode,
                fullName: term.name
            });
        }

        if (term.isLetMacroTerm) {
            macroDefinition = loadMacroDef(term.body, context, phase + 1);
            // compilation collapses multi-token let macro names into single identifier
            name = unwrapSyntax(term.name[0]);

            context.env.names.set(name, true);
            context.env.set(resolve(term.name[0], phase), {
                fn: macroDefinition,
                isOp: false,
                builtin: builtinMode,
                fullName: term.name[0].props.fullName
            });
        }

        if (term.isOperatorDefinitionTerm) {
            var opDefinition = loadMacroDef(term.body, context, phase + 1);
            name = term.name.map(unwrapSyntax).join("");
            var nameStx = syn.makeIdent(name, term.name[0]);
            addToDefinitionCtx([nameStx], defctx, false, []);
            var resolvedName = resolve(nameStx, phase);
            var opObj = context.env.get(resolvedName);
            if (!opObj) {
                opObj = {
                    isOp: true,
                    builtin: builtinMode,
                    fullName: term.name
                }
            }
            assert(unwrapSyntax(term.type) === "binary" ||
                   unwrapSyntax(term.type) === "unary",
                   "operator must either be binary or unary");
            opObj[unwrapSyntax(term.type)] = {
                fn: opDefinition,
                prec: term.prec.token.value,
                assoc: term.assoc ? term.assoc.token.value : null
            };
            context.env.names.set(name, true);
            context.env.set(resolvedName, opObj);
        }

        // add the exported names to the module record
        if (term.isExportTerm) {
            if (term.name.isDelimiter() &&
                term.name.token.value === "{}") {
                term.name.token.inner
                    |> filterModuleCommaSep
                    |> names -> names.forEach(name -> {
                        modRecord.exportEntries.push(name);
                    });
            } else {
                throwSyntaxError("visit", "not valid export", term.name);
            }
        }
    });

    return context;
}

// a version of map where the callback only runs on the non comma items in
// the comma separated list.
function mapCommaSep(l, f) {
    return l.map((stx, idx)-> {
        if (idx % 2 !== 0 && ((!stx.isPunctuator()) ||
                              stx.token.value !== ",")) {
            throwSyntaxError("import",
                             "expecting a comma separated list",
                             stx);
        } else if (idx % 2 !== 0) {
            return stx;
        } else {
            return f(stx);
        }
    });
}

function filterModuleCommaSep(stx) {
    return stx.filter((stx, idx) -> {
        if (idx % 2 !== 0 && ((!stx.isPunctuator()) ||
                              stx.token.value !== ",")) {
            throwSyntaxError("import",
                             "expecting a comma separated list",
                             stx);
        } else if (idx % 2 !== 0) {
            return false;
        } else {
            return true;
        }
    });
}


// @ (ImportTerm, ExpanderContext) -> {
//     term: ModuleTerm
//     record: ModuleRecord
// }
function loadImport(imp, context) {
    var modFullPath = resolvePath(unwrapSyntax(imp.from), context.filename);
    if(!availableModules.has(modFullPath)) {
        // load it
        var modToImport = loadModule(modFullPath)
            |> mod -> expandModule(mod.term,
                                   modFullPath,
                                   context.templateMap,
                                   context.patternMap,
                                   mod.record,
                                   context.compileSuffix);
        var modPair = {
            term: modToImport.mod,
            record: modToImport.context.moduleRecord
        };
        availableModules.set(modFullPath, modPair);
        return modPair;
    }
    return availableModules.get(modFullPath);
}


// @ (ImportTerm, [...SyntaxObject], ModuleTerm, ModuleRecord, ExpanderContext, Num) -> Void
function bindImportInMod(imp, stx, modTerm, modRecord, context, phase) {
    if (imp.clause.names.token.inner.length === 0) {
        throwSyntaxCaseError("compileModule",
                             "must include names to import",
                             imp.clause);
    }

    // first collect the import names and their associated bindings
    var renamedNames = imp.clause.names.token.inner
        |> filterModuleCommaSep
        |> names -> names.map(importName -> {
            var isBase = modRecord.language === "base";

            var inExports = _.find(modRecord.exportEntries, expTerm -> {
                if (importName.isDelimiter()) {
                    return expTerm.isDelimiter() &&
                        syntaxInnerValuesEq(importName, expTerm);
                }
                return expTerm.token.value === importName.token.value
            });
            if (!(inExports || isBase)) {
                throwSyntaxError("compile",
                                 "the imported name `" +
                                 unwrapSyntax(importName) +
                                 "` was not exported from the module",
                                 importName);
            }

            var exportName, trans, exportNameStr;
            if (!inExports) {
                // case when importing from a non ES6
                // module but not for macros so the module
                // was not invoked and thus nothing in the
                // context for this name
                if (importName.isDelimiter()) {
                    exportNameStr = importName.map(unwrapSyntax).join('');
                } else {
                    exportNameStr = unwrapSyntax(importName);
                }
                trans = null;
            } else if (inExports.isDelimiter()) {
                exportName = inExports.token.inner;
                exportNameStr = exportName.map(unwrapSyntax).join('');
                trans = getValueInEnv(exportName[0],
                                      exportName.slice(1),
                                      context,
                                      phase);
            } else {
                exportName = inExports;
                exportNameStr = unwrapSyntax(exportName);
                trans = getValueInEnv(exportName,
                                      [],
                                      context,
                                      phase);
            }

            var newParam = syn.makeIdent(exportNameStr, importName);
            var newName = fresh();
            return {
                original: newParam,
                renamed: newParam.imported(newParam, newName, phase),
                name: newName,
                trans: trans
            };
        });

    // set the new bindings in the context
    renamedNames.forEach(name -> {
        context.env.names.set(unwrapSyntax(name.renamed), true);
        context.env.set(resolve(name.renamed, phase),
                        name.trans);
        // setup a reverse map from each import name to
        // the import term but only for runtime values
        if (name.trans === null || (name.trans && name.trans.value)) {
            var resolvedName = resolve(name.renamed, phase);
            var origName = resolve(name.original, phase);
            context.implicitImport.set(resolvedName, imp);
        }

    });
    imp.clause.names = syn.makeDelim("{}",
                                     joinSyntax(renamedNames.map(name -> name.renamed),
                                                syn.makePunc(",", imp.clause.names)),
                                     imp.clause.names);

    return stx.map(stx -> renamedNames.reduce((acc, name) -> {
        return acc.imported(name.original, name.name, phase);
    }, stx));
}

// (ModuleTerm, Str, Map, Map, ModuleRecord) -> {
//     context: ExpanderContext,
//     mod: ModuleTerm
// }
function expandModule(mod, filename, templateMap, patternMap, moduleRecord, compileSuffix) {
    // create a new expander context for this module
    var context = makeModuleExpanderContext(filename,
                                            templateMap,
                                            patternMap,
                                            0,
                                            moduleRecord,
                                            compileSuffix);
    return {
        context: context,
        mod: expandTermTreeToFinal(mod, context)
    };
}

function filterCompileNames(stx, context) {
    assert(stx.isDelimiter(), "must be a delimter");

    var runtimeNames = stx.token.inner
        |> filterModuleCommaSep
        |> names -> {
            return names.filter(name -> {
                if (name.isDelimiter()) {
                    return !nameInEnv(name.token.inner[0],
                                      name.token.inner.slice(1),
                                      context,
                                      0);
                } else {
                    return !nameInEnv(name, [], context, 0);
                }
            });
        };
    var newInner = runtimeNames.reduce((acc, name, idx, orig) -> {
        acc.push(name);
        if (orig.length - 1 !== idx) { // don't add trailing comma
            acc.push(syn.makePunc(",", name));
        }
        return acc;
    }, []);
    return syn.makeDelim("{}", newInner, stx);
}

// Takes an expanded module term and flattens it.
// @ (ModuleTerm, SweetOptions, TemplateMap, PatternMap) -> [...SyntaxObject]
function flattenModule(modTerm, modRecord, context) {

    // filter the imports to just the imports and names that are
    // actually available at runtime
    var imports = modRecord.importEntries.reduce((acc, imp) -> {
        if (imp.isImportForMacrosTerm) {
            return acc;
        }
        if (imp.clause.names.isDelimiter()) {
            imp.clause.names = filterCompileNames(imp.clause.names, context);
            if (imp.clause.names.token.inner.length === 0) {
                return acc;
            }
            return acc.concat(imp);
        } else {
            assert(false, "not implemented yet");
        }
    }, []);

    // filter the exports to just the exports and names that are
    // actually available at runtime
    var output = modTerm.body.reduce((acc, term) -> {
        if (term.isExportTerm) {
            if (term.name.isDelimiter()) {
                term.name = filterCompileNames(term.name, context);
                if (term.name.token.inner.length === 0) {
                    return acc;
                }
            } else {
                assert(false, "not implemented yet");
            }
        }
        if (term.isImportTerm || term.isImportForMacrosTerm) {
            return acc;
        }
        return acc.concat(term.destruct(context, {stripCompileTerm: true}));
    }, []);


    output = output
        |> flatten
        |> output -> output.map(stx -> {
            var name = resolve(stx, 0);
            // collect the implicit imports (those imports that
            // must be included because a macro expanded to a reference
            // to an import from some other module)
            if (context.implicitImport.has(name)) {
                var implicit = context.implicitImport.get(name);
                // don't double add the import
                if (!_.find(imports, imp -> imp === implicit)) {
                    imports.push(implicit);
                }
            }
            return stx
        });

    // flatten everything
    var flatImports = imports.reduce((acc, imp) -> {
        var clonedImp = _.clone(imp);
        clonedImp.from = clonedImp.from.clone();
        clonedImp.from.token.value = clonedImp.from.token.value + context.compileSuffix;
        return acc.concat(flatten(clonedImp.destruct(context).concat(syn.makePunc(";", clonedImp.names))));
    }, []);

    return {
        imports: imports,
        body: flatImports.concat(output)
    };
}

function flattenImports(imports, mod, context) {
    return imports.reduce((acc, imp) -> {
        var modFullPath = resolvePath(unwrapSyntax(imp.from), context.filename);
        if (availableModules.has(modFullPath)) {
            var modPair = availableModules.get(modFullPath);
            var flattened = flattenModule(modPair.term, modPair.record, context);
            acc.push({
                path: modFullPath,
                code: flattened.body
            });
            acc = acc.concat(flattenImports(flattened.imports, mod, context))
            return acc;
        } else {
            assert(false, "module was unexpectedly not available for compilation" + modFullPath);
        }
    }, []);
}

// The entry point to expanding with modules. Starting from the
// token tree of a module, compile it and all its imports. Return
// an array of all the compiled modules.
// @ ([...SyntaxObject], {filename: Str}) -> [...{ path: Str, code: [...SyntaxObject]}]
function compileModule(stx, options) {
    var fs = require("fs");
    options = options || {};
    var filename = options && typeof options.filename !== 'undefined'
        ? fs.realpathSync(options.filename)
        : "(anonymous module)";
    maxExpands = Infinity;
    expandCount = 0;
    var mod = createModule(filename, stx);
    // the template and pattern maps are global for every module
    var templateMap = new StringMap();
    var patternMap = new StringMap();
    availableModules = new StringMap();

    var expanded = expandModule(mod.term, filename, templateMap, patternMap, mod.record, options.compileSuffix);
    var flattened = flattenModule(expanded.mod, expanded.context.moduleRecord, expanded.context);

    var compiledModules = flattenImports(flattened.imports, expanded.mod, expanded.context);
    return [{
        path: filename,
        code: flattened.body
    }].concat(compiledModules);
}


function loadModuleExports(stx, newEnv, exports, oldEnv) {
    return _.reduce(exports, function(acc, param) {
        var newName = fresh();
        var transformer = oldEnv.get(resolve(param.oldExport));
        if (transformer) {
            newEnv.set(resolve(param.newParam.rename(param.newParam, newName)),
                       transformer);
            return acc.rename(param.newParam, newName);
        } else {
            return acc;
        }
    }, stx);
}

// break delimiter tree structure down to flat array of syntax objects
// @ ([...SyntaxObject]) -> [...SyntaxObject]
function flatten(stx) {
    return _.reduce(stx, function(acc, stx) {
        if (stx.isDelimiter()) {
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
            }, stx);
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
            }, stx);
            if (stx.token.leadingComments) {
                openParen.token.leadingComments = stx.token.leadingComments;
            }
            if (stx.token.trailingComments) {
                openParen.token.trailingComments = stx.token.trailingComments;
            }
            acc.push(openParen);
            push.apply(acc, flatten(stx.token.inner));
            acc.push(closeParen);
            return acc;
        }
        stx.token.sm_lineNumber = typeof stx.token.sm_lineNumber != 'undefined'
                                ? stx.token.sm_lineNumber
                                : stx.token.lineNumber;
        stx.token.sm_lineStart = typeof stx.token.sm_lineStart != 'undefined'
                                ? stx.token.sm_lineStart
                                : stx.token.lineStart;
        stx.token.sm_range = typeof stx.token.sm_range != 'undefined'
                                ? stx.token.sm_range
                                : stx.token.range;
        acc.push(stx);
        return acc;
    }, []);
}

exports.StringMap = StringMap;
exports.enforest = enforest;
exports.expand = expandTopLevel;
exports.compileModule = compileModule;

exports.resolve = resolve;
exports.get_expression = get_expression;
exports.getName = getName;
exports.getValueInEnv = getValueInEnv;
exports.nameInEnv = nameInEnv;

exports.makeExpanderContext = makeExpanderContext;

exports.ExprTerm = ExprTerm;
exports.VariableStatementTerm = VariableStatementTerm;

exports.tokensToSyntax = syn.tokensToSyntax;
exports.syntaxToTokens = syn.syntaxToTokens;
