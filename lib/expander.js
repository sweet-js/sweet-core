(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require('./parser'), require('./syntax'), require('./scopedEval'), require('./patterns'), require('escodegen'), require('vm'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'scopedEval',
            'patterns',
            'escodegen'
        ], factory);
    }
}(this, function (exports$2, _, parser, syn, se, patternModule, gen, vm) {
    'use strict';
    var // escodegen still doesn't quite support AMD: https://github.com/Constellation/escodegen/issues/115
    codegen = typeof escodegen !== 'undefined' ? escodegen : gen;
    var assert = syn.assert;
    var throwSyntaxError = syn.throwSyntaxError;
    var throwSyntaxCaseError = syn.throwSyntaxCaseError;
    var SyntaxCaseError = syn.SyntaxCaseError;
    var unwrapSyntax = syn.unwrapSyntax;
    // used to export "private" methods for unit testing
    exports$2._test = {};
    function StringMap(o) {
        this.__data = o || {};
    }
    StringMap.prototype = {
        keys: function () {
            return Object.keys(this.__data);
        },
        has: function (key) {
            return Object.prototype.hasOwnProperty.call(this.__data, key);
        },
        get: function (key) {
            return this.has(key) ? this.__data[key] : void 0;
        },
        set: function (key, value) {
            this.__data[key] = value;
        },
        extend: function () {
            var args = _.map(_.toArray(arguments), function (x) {
                return x.__data;
            });
            _.extend.apply(_, [this.__data].concat(args));
            return this;
        }
    };
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
    function marksof(ctx, stopName, originalName) {
        while (ctx) {
            if (ctx.constructor === Mark) {
                return remdup(ctx.mark, marksof(ctx.context, stopName, originalName));
            }
            if (ctx.constructor === Def) {
                ctx = ctx.context;
                continue;
            }
            if (ctx.constructor === Rename) {
                if (stopName === originalName + '$' + ctx.name) {
                    return [];
                }
                ctx = ctx.context;
                continue;
            }
            if (ctx.constructor === Imported) {
                ctx = ctx.context;
                continue;
            }
            assert(false, 'Unknown context type');
        }
        return [];
    }
    function resolve(stx, phase) {
        assert(phase !== undefined, 'must pass in phase');
        return resolveCtx(stx.token.value, stx.context, [], [], {}, phase);
    }
    function resolveCtx(originalName, ctx, stop_spine, stop_branch, cache, phase) {
        if (!ctx) {
            return originalName;
        }
        var key = ctx.instNum;
        return cache[key] || (cache[key] = resolveCtxFull(originalName, ctx, stop_spine, stop_branch, cache, phase));
    }
    function resolveCtxFull(originalName, ctx, stop_spine, stop_branch, cache, phase) {
        while (true) {
            if (!ctx) {
                return originalName;
            }
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
                    var idName = resolveCtx(ctx.id.token.value, ctx.id.context, stop_branch, stop_branch, cache, 0);
                    var subName = resolveCtx(originalName, ctx.context, unionEl(stop_spine, ctx.def), stop_branch, cache, 0);
                    if (idName === subName) {
                        var idMarks = marksof(ctx.id.context, originalName + '$' + ctx.name, originalName);
                        var subMarks = marksof(ctx.context, originalName + '$' + ctx.name, originalName);
                        if (arraysEqual(idMarks, subMarks)) {
                            return originalName + '$' + ctx.name;
                        }
                    }
                }
                ctx = ctx.context;
                continue;
            }
            if (ctx.constructor === Imported) {
                if (phase === ctx.phase) {
                    if (originalName === ctx.id.token.value) {
                        return originalName + '$' + ctx.name;
                    }
                }
                ctx = ctx.context;
                continue;
            }
            assert(false, 'Unknown context type');
        }
    }
    function arraysEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
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
    function fresh() {
        return nextFresh++;
    }
    function wrapDelim(towrap, delimSyntax) {
        assert(delimSyntax.token.type === parser.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser.Token.Delimiter,
            value: delimSyntax.token.value,
            inner: towrap,
            range: delimSyntax.token.range,
            startLineNumber: delimSyntax.token.startLineNumber,
            lineStart: delimSyntax.token.lineStart
        }, delimSyntax);
    }
    function getParamIdentifiers(argSyntax) {
        if (argSyntax.token.type === parser.Token.Delimiter) {
            return _.filter(argSyntax.token.inner, function (stx) {
                return stx.token.value !== ',';
            });
        } else if (argSyntax.token.type === parser.Token.Identifier) {
            return [argSyntax];
        } else {
            assert(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    function inherit(parent, child, methods) {
        var P = function () {
        };
        P.prototype = parent.prototype;
        child.prototype = new P();
        child.prototype.constructor = child;
        _.extend(child.prototype, methods);
    }
    function TermTree() {
    }
    TermTree.properties = [];
    TermTree.create = function () {
        return new TermTree();
    };
    TermTree.prototype = {
        'isTermTree': true,
        'destruct': function (context, options) {
            assert(context, 'must pass in the context to destruct');
            options = options || {};
            var self = this;
            if (options.stripCompileTerm && this.isCompileTimeTerm) {
                return [];
            }
            if (options.stripModuleTerm && this.isModuleTerm) {
                return [];
            }
            return _.reduce(this.constructor.properties, function (acc, prop) {
                if (self[prop] && self[prop].isTermTree) {
                    push.apply(acc, self[prop].destruct(context, options));
                    return acc;
                } else if (self[prop] && self[prop].token && self[prop].token.inner) {
                    var src = self[prop].token;
                    var keys = Object.keys(src);
                    var newtok = {};
                    for (var i = 0, len = keys.length, key; i < len; i++) {
                        key = keys[i];
                        newtok[key] = src[key];
                    }
                    var clone = syntaxFromToken(newtok, self[prop]);
                    clone.token.inner = _.reduce(clone.token.inner, function (acc$2, t) {
                        if (t && t.isTermTree) {
                            push.apply(acc$2, t.destruct(context, options));
                            return acc$2;
                        }
                        acc$2.push(t);
                        return acc$2;
                    }, []);
                    acc.push(clone);
                    return acc;
                } else if (Array.isArray(self[prop])) {
                    var destArr = _.reduce(self[prop], function (acc$2, t) {
                        if (t && t.isTermTree) {
                            push.apply(acc$2, t.destruct(context, options));
                            return acc$2;
                        }
                        acc$2.push(t);
                        return acc$2;
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
        },
        'addDefCtx': function (def) {
            var self = this;
            _.each(this.constructor.properties, function (prop) {
                if (Array.isArray(self[prop])) {
                    self[prop] = _.map(self[prop], function (item) {
                        return item.addDefCtx(def);
                    });
                } else if (self[prop]) {
                    self[prop] = self[prop].addDefCtx(def);
                }
            });
            return this;
        },
        'rename': function (id, name, phase) {
            var self = this;
            _.each(this.constructor.properties, function (prop) {
                if (Array.isArray(self[prop])) {
                    self[prop] = _.map(self[prop], function (item) {
                        return item.rename(id, name, phase);
                    });
                } else if (self[prop]) {
                    self[prop] = self[prop].rename(id, name, phase);
                }
            });
            return this;
        },
        'imported': function (id, name, phase) {
            var self = this;
            _.each(this.constructor.properties, function (prop) {
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
    };
    function EOF(eof) {
        this.eof = eof;
    }
    EOF.properties = ['eof'];
    EOF.create = function (eof) {
        return new EOF(eof);
    };
    inherit(TermTree, EOF, { 'isEOF': true });
    function Keyword(keyword) {
        this.keyword = keyword;
    }
    Keyword.properties = ['keyword'];
    Keyword.create = function (keyword) {
        return new Keyword(keyword);
    };
    inherit(TermTree, Keyword, { 'isKeyword': true });
    function Punc(punc) {
        this.punc = punc;
    }
    Punc.properties = ['punc'];
    Punc.create = function (punc) {
        return new Punc(punc);
    };
    inherit(TermTree, Punc, { 'isPunc': true });
    function Delimiter(delim) {
        this.delim = delim;
    }
    Delimiter.properties = ['delim'];
    Delimiter.create = function (delim) {
        return new Delimiter(delim);
    };
    inherit(TermTree, Delimiter, { 'isDelimiter': true });
    function ModuleTerm() {
    }
    ModuleTerm.properties = [];
    ModuleTerm.create = function () {
        return new ModuleTerm();
    };
    inherit(TermTree, ModuleTerm, { 'isModuleTerm': true });
    function Module(name, lang, body, imports, exports$3) {
        this.name = name;
        this.lang = lang;
        this.body = body;
        this.imports = imports;
        this.exports = exports$3;
    }
    Module.properties = [
        'name',
        'lang',
        'body',
        'imports',
        'exports'
    ];
    Module.create = function (name, lang, body, imports, exports$3) {
        return new Module(name, lang, body, imports, exports$3);
    };
    inherit(ModuleTerm, Module, { 'isModule': true });
    function Import(kw, names, fromkw, from) {
        this.kw = kw;
        this.names = names;
        this.fromkw = fromkw;
        this.from = from;
    }
    Import.properties = [
        'kw',
        'names',
        'fromkw',
        'from'
    ];
    Import.create = function (kw, names, fromkw, from) {
        return new Import(kw, names, fromkw, from);
    };
    inherit(ModuleTerm, Import, { 'isImport': true });
    function ImportForMacros(names, from) {
        this.names = names;
        this.from = from;
    }
    ImportForMacros.properties = [
        'names',
        'from'
    ];
    ImportForMacros.create = function (names, from) {
        return new ImportForMacros(names, from);
    };
    inherit(ModuleTerm, ImportForMacros, { 'isImportForMacros': true });
    function Export(kw, name) {
        this.kw = kw;
        this.name = name;
    }
    Export.properties = [
        'kw',
        'name'
    ];
    Export.create = function (kw, name) {
        return new Export(kw, name);
    };
    inherit(ModuleTerm, Export, { 'isExport': true });
    function CompileTimeTerm() {
    }
    CompileTimeTerm.properties = [];
    CompileTimeTerm.create = function () {
        return new CompileTimeTerm();
    };
    inherit(TermTree, CompileTimeTerm, { 'isCompileTimeTerm': true });
    function LetMacro(name, body) {
        this.name = name;
        this.body = body;
    }
    LetMacro.properties = [
        'name',
        'body'
    ];
    LetMacro.create = function (name, body) {
        return new LetMacro(name, body);
    };
    inherit(CompileTimeTerm, LetMacro, { 'isLetMacro': true });
    function Macro(name, body) {
        this.name = name;
        this.body = body;
    }
    Macro.properties = [
        'name',
        'body'
    ];
    Macro.create = function (name, body) {
        return new Macro(name, body);
    };
    inherit(CompileTimeTerm, Macro, { 'isMacro': true });
    function AnonMacro(body) {
        this.body = body;
    }
    AnonMacro.properties = ['body'];
    AnonMacro.create = function (body) {
        return new AnonMacro(body);
    };
    inherit(CompileTimeTerm, AnonMacro, { 'isAnonMacro': true });
    function OperatorDefinition(type, name, prec, assoc, body) {
        this.type = type;
        this.name = name;
        this.prec = prec;
        this.assoc = assoc;
        this.body = body;
    }
    OperatorDefinition.properties = [
        'type',
        'name',
        'prec',
        'assoc',
        'body'
    ];
    OperatorDefinition.create = function (type, name, prec, assoc, body) {
        return new OperatorDefinition(type, name, prec, assoc, body);
    };
    inherit(CompileTimeTerm, OperatorDefinition, { 'isOperatorDefinition': true });
    function VariableDeclaration(ident, eq, init, comma) {
        this.ident = ident;
        this.eq = eq;
        this.init = init;
        this.comma = comma;
    }
    VariableDeclaration.properties = [
        'ident',
        'eq',
        'init',
        'comma'
    ];
    VariableDeclaration.create = function (ident, eq, init, comma) {
        return new VariableDeclaration(ident, eq, init, comma);
    };
    inherit(TermTree, VariableDeclaration, { 'isVariableDeclaration': true });
    function Statement() {
    }
    Statement.properties = [];
    Statement.create = function () {
        return new Statement();
    };
    inherit(TermTree, Statement, { 'isStatement': true });
    function Empty() {
    }
    Empty.properties = [];
    Empty.create = function () {
        return new Empty();
    };
    inherit(Statement, Empty, { 'isEmpty': true });
    function CatchClause(keyword, params, body) {
        this.keyword = keyword;
        this.params = params;
        this.body = body;
    }
    CatchClause.properties = [
        'keyword',
        'params',
        'body'
    ];
    CatchClause.create = function (keyword, params, body) {
        return new CatchClause(keyword, params, body);
    };
    inherit(Statement, CatchClause, { 'isCatchClause': true });
    function ForStatement(keyword, cond) {
        this.keyword = keyword;
        this.cond = cond;
    }
    ForStatement.properties = [
        'keyword',
        'cond'
    ];
    ForStatement.create = function (keyword, cond) {
        return new ForStatement(keyword, cond);
    };
    inherit(Statement, ForStatement, { 'isForStatement': true });
    function ReturnStatement(keyword, expr) {
        this.keyword = keyword;
        this.expr = expr;
    }
    ReturnStatement.properties = [
        'keyword',
        'expr'
    ];
    ReturnStatement.create = function (keyword, expr) {
        return new ReturnStatement(keyword, expr);
    };
    inherit(Statement, ReturnStatement, {
        'isReturnStatement': true,
        'destruct': function (context, options) {
            var expr = this.expr.destruct(context, options);
            // need to adjust the line numbers to make sure that the expr
            // starts on the same line as the return keyword. This might
            // not be the case if an operator or infix macro perturbed the
            // line numbers during expansion.
            expr = adjustLineContext(expr, this.keyword.keyword);
            return this.keyword.destruct(context, options).concat(expr);
        }
    });
    function Expr() {
    }
    Expr.properties = [];
    Expr.create = function () {
        return new Expr();
    };
    inherit(Statement, Expr, { 'isExpr': true });
    function UnaryOp(op, expr) {
        this.op = op;
        this.expr = expr;
    }
    UnaryOp.properties = [
        'op',
        'expr'
    ];
    UnaryOp.create = function (op, expr) {
        return new UnaryOp(op, expr);
    };
    inherit(Expr, UnaryOp, { 'isUnaryOp': true });
    function PostfixOp(expr, op) {
        this.expr = expr;
        this.op = op;
    }
    PostfixOp.properties = [
        'expr',
        'op'
    ];
    PostfixOp.create = function (expr, op) {
        return new PostfixOp(expr, op);
    };
    inherit(Expr, PostfixOp, { 'isPostfixOp': true });
    function BinOp(left, op, right) {
        this.left = left;
        this.op = op;
        this.right = right;
    }
    BinOp.properties = [
        'left',
        'op',
        'right'
    ];
    BinOp.create = function (left, op, right) {
        return new BinOp(left, op, right);
    };
    inherit(Expr, BinOp, { 'isBinOp': true });
    function AssignmentExpression(left, op, right) {
        this.left = left;
        this.op = op;
        this.right = right;
    }
    AssignmentExpression.properties = [
        'left',
        'op',
        'right'
    ];
    AssignmentExpression.create = function (left, op, right) {
        return new AssignmentExpression(left, op, right);
    };
    inherit(Expr, AssignmentExpression, { 'isAssignmentExpression': true });
    function ConditionalExpression(cond, question, tru, colon, fls) {
        this.cond = cond;
        this.question = question;
        this.tru = tru;
        this.colon = colon;
        this.fls = fls;
    }
    ConditionalExpression.properties = [
        'cond',
        'question',
        'tru',
        'colon',
        'fls'
    ];
    ConditionalExpression.create = function (cond, question, tru, colon, fls) {
        return new ConditionalExpression(cond, question, tru, colon, fls);
    };
    inherit(Expr, ConditionalExpression, { 'isConditionalExpression': true });
    function NamedFun(keyword, star, name, params, body) {
        this.keyword = keyword;
        this.star = star;
        this.name = name;
        this.params = params;
        this.body = body;
    }
    NamedFun.properties = [
        'keyword',
        'star',
        'name',
        'params',
        'body'
    ];
    NamedFun.create = function (keyword, star, name, params, body) {
        return new NamedFun(keyword, star, name, params, body);
    };
    inherit(Expr, NamedFun, { 'isNamedFun': true });
    function AnonFun(keyword, star, params, body) {
        this.keyword = keyword;
        this.star = star;
        this.params = params;
        this.body = body;
    }
    AnonFun.properties = [
        'keyword',
        'star',
        'params',
        'body'
    ];
    AnonFun.create = function (keyword, star, params, body) {
        return new AnonFun(keyword, star, params, body);
    };
    inherit(Expr, AnonFun, { 'isAnonFun': true });
    function ArrowFun(params, arrow, body) {
        this.params = params;
        this.arrow = arrow;
        this.body = body;
    }
    ArrowFun.properties = [
        'params',
        'arrow',
        'body'
    ];
    ArrowFun.create = function (params, arrow, body) {
        return new ArrowFun(params, arrow, body);
    };
    inherit(Expr, ArrowFun, { 'isArrowFun': true });
    function ObjDotGet(left, dot, right) {
        this.left = left;
        this.dot = dot;
        this.right = right;
    }
    ObjDotGet.properties = [
        'left',
        'dot',
        'right'
    ];
    ObjDotGet.create = function (left, dot, right) {
        return new ObjDotGet(left, dot, right);
    };
    inherit(Expr, ObjDotGet, { 'isObjDotGet': true });
    function ObjGet(left, right) {
        this.left = left;
        this.right = right;
    }
    ObjGet.properties = [
        'left',
        'right'
    ];
    ObjGet.create = function (left, right) {
        return new ObjGet(left, right);
    };
    inherit(Expr, ObjGet, { 'isObjGet': true });
    function Template(template) {
        this.template = template;
    }
    Template.properties = ['template'];
    Template.create = function (template) {
        return new Template(template);
    };
    inherit(Expr, Template, { 'isTemplate': true });
    function Call(fun, args) {
        this.fun = fun;
        this.args = args;
    }
    Call.properties = [
        'fun',
        'args'
    ];
    Call.create = function (fun, args) {
        return new Call(fun, args);
    };
    inherit(Expr, Call, { 'isCall': true });
    function QuoteSyntax(stx) {
        this.stx = stx;
    }
    QuoteSyntax.properties = ['stx'];
    QuoteSyntax.create = function (stx) {
        return new QuoteSyntax(stx);
    };
    inherit(Expr, QuoteSyntax, {
        'isQuoteSyntax': true,
        'destruct': function (context, options) {
            var tempId = fresh();
            context.templateMap.set(tempId, this.stx.token.inner);
            return [
                syn.makeIdent('getTemplate', this.stx),
                syn.makeDelim('()', [syn.makeValue(tempId, this.stx)], this.stx)
            ];
        }
    });
    function PrimaryExpression() {
    }
    PrimaryExpression.properties = [];
    PrimaryExpression.create = function () {
        return new PrimaryExpression();
    };
    inherit(Expr, PrimaryExpression, { 'isPrimaryExpression': true });
    function ThisExpression(keyword) {
        this.keyword = keyword;
    }
    ThisExpression.properties = ['keyword'];
    ThisExpression.create = function (keyword) {
        return new ThisExpression(keyword);
    };
    inherit(PrimaryExpression, ThisExpression, { 'isThisExpression': true });
    function Lit(lit) {
        this.lit = lit;
    }
    Lit.properties = ['lit'];
    Lit.create = function (lit) {
        return new Lit(lit);
    };
    inherit(PrimaryExpression, Lit, { 'isLit': true });
    function Block(body) {
        this.body = body;
    }
    Block.properties = ['body'];
    Block.create = function (body) {
        return new Block(body);
    };
    inherit(PrimaryExpression, Block, { 'isBlock': true });
    function ArrayLiteral(array) {
        this.array = array;
    }
    ArrayLiteral.properties = ['array'];
    ArrayLiteral.create = function (array) {
        return new ArrayLiteral(array);
    };
    inherit(PrimaryExpression, ArrayLiteral, { 'isArrayLiteral': true });
    function Id(id) {
        this.id = id;
    }
    Id.properties = ['id'];
    Id.create = function (id) {
        return new Id(id);
    };
    inherit(PrimaryExpression, Id, { 'isId': true });
    function Partial() {
    }
    Partial.properties = [];
    Partial.create = function () {
        return new Partial();
    };
    inherit(TermTree, Partial, { 'isPartial': true });
    function PartialOperation(stx, left) {
        this.stx = stx;
        this.left = left;
    }
    PartialOperation.properties = [
        'stx',
        'left'
    ];
    PartialOperation.create = function (stx, left) {
        return new PartialOperation(stx, left);
    };
    inherit(Partial, PartialOperation, { 'isPartialOperation': true });
    function PartialExpression(stx, left, combine) {
        this.stx = stx;
        this.left = left;
        this.combine = combine;
    }
    PartialExpression.properties = [
        'stx',
        'left',
        'combine'
    ];
    PartialExpression.create = function (stx, left, combine) {
        return new PartialExpression(stx, left, combine);
    };
    inherit(Partial, PartialExpression, { 'isPartialExpression': true });
    function BindingStatement(keyword, decls) {
        this.keyword = keyword;
        this.decls = decls;
    }
    BindingStatement.properties = [
        'keyword',
        'decls'
    ];
    BindingStatement.create = function (keyword, decls) {
        return new BindingStatement(keyword, decls);
    };
    inherit(Statement, BindingStatement, {
        'isBindingStatement': true,
        'destruct': function (context, options) {
            return this.keyword.destruct(context, options).concat(_.reduce(this.decls, function (acc, decl) {
                push.apply(acc, decl.destruct(context, options));
                return acc;
            }, []));
        }
    });
    function VariableStatement(keyword, decls) {
        this.keyword = keyword;
        this.decls = decls;
    }
    VariableStatement.properties = [
        'keyword',
        'decls'
    ];
    VariableStatement.create = function (keyword, decls) {
        return new VariableStatement(keyword, decls);
    };
    inherit(BindingStatement, VariableStatement, { 'isVariableStatement': true });
    function LetStatement(keyword, decls) {
        this.keyword = keyword;
        this.decls = decls;
    }
    LetStatement.properties = [
        'keyword',
        'decls'
    ];
    LetStatement.create = function (keyword, decls) {
        return new LetStatement(keyword, decls);
    };
    inherit(BindingStatement, LetStatement, { 'isLetStatement': true });
    function ConstStatement(keyword, decls) {
        this.keyword = keyword;
        this.decls = decls;
    }
    ConstStatement.properties = [
        'keyword',
        'decls'
    ];
    ConstStatement.create = function (keyword, decls) {
        return new ConstStatement(keyword, decls);
    };
    inherit(BindingStatement, ConstStatement, { 'isConstStatement': true });
    function ParenExpression(args, delim, commas) {
        this.args = args;
        this.delim = delim;
        this.commas = commas;
    }
    ParenExpression.properties = [
        'args',
        'delim',
        'commas'
    ];
    ParenExpression.create = function (args, delim, commas) {
        return new ParenExpression(args, delim, commas);
    };
    inherit(PrimaryExpression, ParenExpression, {
        'isParenExpression': true,
        'destruct': function (context, options) {
            var commas = this.commas.slice();
            var src = this.delim.token;
            var keys = Object.keys(src);
            var newtok = {};
            for (var i = 0, len = keys.length, key; i < len; i++) {
                key = keys[i];
                newtok[key] = src[key];
            }
            var delim = syntaxFromToken(newtok, this.delim);
            delim.token.inner = _.reduce(this.args, function (acc, term) {
                assert(term && term.isTermTree, 'expecting term trees in destruct of ParenExpression');
                push.apply(acc, term.destruct(context, options));
                if (// add all commas except for the last one
                    commas.length > 0) {
                    acc.push(commas.shift());
                }
                return acc;
            }, []);
            return Delimiter.create(delim).destruct(context, options);
        }
    });
    function stxIsUnaryOp(stx) {
        var staticOperators = [
            '+',
            '-',
            '~',
            '!',
            'delete',
            'void',
            'typeof',
            'yield',
            'new',
            '++',
            '--'
        ];
        return _.contains(staticOperators, unwrapSyntax(stx));
    }
    function stxIsBinOp(stx) {
        var staticOperators = [
            '+',
            '-',
            '*',
            '/',
            '%',
            '||',
            '&&',
            '|',
            '&',
            '^',
            '==',
            '!=',
            '===',
            '!==',
            '<',
            '>',
            '<=',
            '>=',
            'in',
            'instanceof',
            '<<',
            '>>',
            '>>>'
        ];
        return _.contains(staticOperators, unwrapSyntax(stx));
    }
    function getUnaryOpPrec(op) {
        var operatorPrecedence = {
            'new': 16,
            '++': 15,
            '--': 15,
            '!': 14,
            '~': 14,
            '+': 14,
            '-': 14,
            'typeof': 14,
            'void': 14,
            'delete': 14,
            'yield': 2
        };
        return operatorPrecedence[op];
    }
    function getBinaryOpPrec(op) {
        var operatorPrecedence = {
            '*': 13,
            '/': 13,
            '%': 13,
            '+': 12,
            '-': 12,
            '>>': 11,
            '<<': 11,
            '>>>': 11,
            '<': 10,
            '<=': 10,
            '>': 10,
            '>=': 10,
            'in': 10,
            'instanceof': 10,
            '==': 9,
            '!=': 9,
            '===': 9,
            '!==': 9,
            '&': 8,
            '^': 7,
            '|': 6,
            '&&': 5,
            '||': 4
        };
        return operatorPrecedence[op];
    }
    function getBinaryOpAssoc(op) {
        var operatorAssoc = {
            '*': 'left',
            '/': 'left',
            '%': 'left',
            '+': 'left',
            '-': 'left',
            '>>': 'left',
            '<<': 'left',
            '>>>': 'left',
            '<': 'left',
            '<=': 'left',
            '>': 'left',
            '>=': 'left',
            'in': 'left',
            'instanceof': 'left',
            '==': 'left',
            '!=': 'left',
            '===': 'left',
            '!==': 'left',
            '&': 'left',
            '^': 'left',
            '|': 'left',
            '&&': 'left',
            '||': 'left'
        };
        return operatorAssoc[op];
    }
    function stxIsAssignOp(stx) {
        var staticOperators = [
            '=',
            '+=',
            '-=',
            '*=',
            '/=',
            '%=',
            '<<=',
            '>>=',
            '>>>=',
            '|=',
            '^=',
            '&='
        ];
        return _.contains(staticOperators, unwrapSyntax(stx));
    }
    function enforestVarStatement(stx, context, varStx) {
        var decls = [];
        var rest = stx;
        var rhs;
        if (!rest.length) {
            throwSyntaxError('enforest', 'Unexpected end of input', varStx);
        }
        if (expandCount >= maxExpands) {
            return null;
        }
        while (rest.length) {
            if (rest[0].token.type === parser.Token.Identifier) {
                if (rest[1] && rest[1].token.type === parser.Token.Punctuator && rest[1].token.value === '=') {
                    rhs = get_expression(rest.slice(2), context);
                    if (rhs.result == null) {
                        throwSyntaxError('enforest', 'Unexpected token', rhs.rest[0]);
                    }
                    if (rhs.rest[0] && rhs.rest[0].token.type === parser.Token.Punctuator && rhs.rest[0].token.value === ',') {
                        decls.push(VariableDeclaration.create(rest[0], rest[1], rhs.result, rhs.rest[0]));
                        rest = rhs.rest.slice(1);
                        continue;
                    } else {
                        decls.push(VariableDeclaration.create(rest[0], rest[1], rhs.result, null));
                        rest = rhs.rest;
                        break;
                    }
                } else if (rest[1] && rest[1].token.type === parser.Token.Punctuator && rest[1].token.value === ',') {
                    decls.push(VariableDeclaration.create(rest[0], null, null, rest[1]));
                    rest = rest.slice(2);
                } else {
                    decls.push(VariableDeclaration.create(rest[0], null, null, null));
                    rest = rest.slice(1);
                    break;
                }
            } else {
                throwSyntaxError('enforest', 'Unexpected token', rest[0]);
            }
        }
        return {
            result: decls,
            rest: rest
        };
    }
    function enforestAssignment(stx, context, left, prevStx, prevTerms) {
        var op = stx[0];
        var rightStx = stx.slice(1);
        var opTerm = Punc.create(stx[0]);
        var opPrevStx = tagWithTerm(opTerm, [stx[0]]).concat(tagWithTerm(left, left.destruct(context).reverse()), prevStx);
        var opPrevTerms = [
            opTerm,
            left
        ].concat(prevTerms);
        var opRes = enforest(rightStx, context, opPrevStx, opPrevTerms);
        if (opRes.result) {
            if (// Lookbehind was matched, so it may not even be a binop anymore.
                opRes.prevTerms.length < opPrevTerms.length) {
                return opRes;
            }
            var right = opRes.result;
            if (// only a binop if the right is a real expression
                // so 2+2++ will only match 2+2
                right.isExpr) {
                var term = AssignmentExpression.create(left, op, right);
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
            if (!argRes.result || !argRes.result.isExpr) {
                return null;
            }
            enforestedArgs.push(argRes.result);
            innerTokens = argRes.rest;
            if (innerTokens[0] && innerTokens[0].token.value === ',') {
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
        return innerTokens.length ? null : ParenExpression.create(enforestedArgs, parens, commas);
    }
    function adjustLineContext(stx, original, current) {
        if (// short circuit when the array is empty;
            stx.length === 0) {
            return stx;
        }
        current = current || {
            lastLineNumber: stx[0].token.lineNumber || stx[0].token.startLineNumber,
            lineNumber: original.token.lineNumber
        };
        return _.map(stx, function (stx$2) {
            if (stx$2.token.type === parser.Token.Delimiter) {
                // handle tokens with missing line info
                stx$2.token.startLineNumber = typeof stx$2.token.startLineNumber == 'undefined' ? original.token.lineNumber : stx$2.token.startLineNumber;
                stx$2.token.endLineNumber = typeof stx$2.token.endLineNumber == 'undefined' ? original.token.lineNumber : stx$2.token.endLineNumber;
                stx$2.token.startLineStart = typeof stx$2.token.startLineStart == 'undefined' ? original.token.lineStart : stx$2.token.startLineStart;
                stx$2.token.endLineStart = typeof stx$2.token.endLineStart == 'undefined' ? original.token.lineStart : stx$2.token.endLineStart;
                stx$2.token.startRange = typeof stx$2.token.startRange == 'undefined' ? original.token.range : stx$2.token.startRange;
                stx$2.token.endRange = typeof stx$2.token.endRange == 'undefined' ? original.token.range : stx$2.token.endRange;
                stx$2.token.sm_startLineNumber = typeof stx$2.token.sm_startLineNumber == 'undefined' ? stx$2.token.startLineNumber : stx$2.token.sm_startLineNumber;
                stx$2.token.sm_endLineNumber = typeof stx$2.token.sm_endLineNumber == 'undefined' ? stx$2.token.endLineNumber : stx$2.token.sm_endLineNumber;
                stx$2.token.sm_startLineStart = typeof stx$2.token.sm_startLineStart == 'undefined' ? stx$2.token.startLineStart : stx$2.token.sm_startLineStart;
                stx$2.token.sm_endLineStart = typeof stx$2.token.sm_endLineStart == 'undefined' ? stx$2.token.endLineStart : stx$2.token.sm_endLineStart;
                stx$2.token.sm_startRange = typeof stx$2.token.sm_startRange == 'undefined' ? stx$2.token.startRange : stx$2.token.sm_startRange;
                stx$2.token.sm_endRange = typeof stx$2.token.sm_endRange == 'undefined' ? stx$2.token.endRange : stx$2.token.sm_endRange;
                if (stx$2.token.startLineNumber !== current.lineNumber) {
                    if (stx$2.token.startLineNumber !== current.lastLineNumber) {
                        current.lineNumber++;
                        current.lastLineNumber = stx$2.token.startLineNumber;
                        stx$2.token.startLineNumber = current.lineNumber;
                    } else {
                        current.lastLineNumber = stx$2.token.startLineNumber;
                        stx$2.token.startLineNumber = current.lineNumber;
                    }
                }
                return stx$2;
            }
            // handle tokens with missing line info
            stx$2.token.lineNumber = typeof stx$2.token.lineNumber == 'undefined' ? original.token.lineNumber : stx$2.token.lineNumber;
            stx$2.token.lineStart = typeof stx$2.token.lineStart == 'undefined' ? original.token.lineStart : stx$2.token.lineStart;
            stx$2.token.range = typeof stx$2.token.range == 'undefined' ? original.token.range : stx$2.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of
            // just write once).
            stx$2.token.sm_lineNumber = typeof stx$2.token.sm_lineNumber == 'undefined' ? stx$2.token.lineNumber : stx$2.token.sm_lineNumber;
            stx$2.token.sm_lineStart = typeof stx$2.token.sm_lineStart == 'undefined' ? stx$2.token.lineStart : stx$2.token.sm_lineStart;
            stx$2.token.sm_range = typeof stx$2.token.sm_range == 'undefined' ? stx$2.token.range.slice() : stx$2.token.sm_range;
            if (// move the line info to line up with the macro name
                // (line info starting from the macro name)
                stx$2.token.lineNumber !== current.lineNumber) {
                if (stx$2.token.lineNumber !== current.lastLineNumber) {
                    current.lineNumber++;
                    current.lastLineNumber = stx$2.token.lineNumber;
                    stx$2.token.lineNumber = current.lineNumber;
                } else {
                    current.lastLineNumber = stx$2.token.lineNumber;
                    stx$2.token.lineNumber = current.lineNumber;
                }
            }
            return stx$2;
        });
    }
    function getName(head, rest) {
        var idx = 0;
        var curr = head;
        var next = rest[idx];
        var name = [head];
        while (true) {
            if (next && (next.token.type === parser.Token.Punctuator || next.token.type === parser.Token.Identifier || next.token.type === parser.Token.Keyword) && toksAdjacent(curr, next)) {
                name.push(next);
                curr = next;
                next = rest[++idx];
            } else {
                return name;
            }
        }
    }
    function getValueInEnv(head, rest, context, phase) {
        if (!(head.token.type === parser.Token.Identifier || head.token.type === parser.Token.Keyword || head.token.type === parser.Token.Punctuator)) {
            return null;
        }
        var name = getName(head, rest);
        if (// simple case, don't need to create a new syntax object
            name.length === 1) {
            if (context.env.names.get(unwrapSyntax(name[0]))) {
                var resolvedName = resolve(name[0], phase);
                if (context.env.has(resolvedName)) {
                    return context.env.get(resolvedName);
                }
            }
            return null;
        } else {
            while (name.length > 0) {
                var nameStr = name.map(unwrapSyntax).join('');
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
    function resolveFast(stx, env, phase) {
        var name = unwrapSyntax(stx);
        return env.names.get(name) ? resolve(stx, phase) : name;
    }
    function expandMacro(stx, context, opCtx, opType, macroObj) {
        var // pull the macro transformer out the environment
        head = stx[0];
        var rest = stx.slice(1);
        macroObj = macroObj || getValueInEnv(head, rest, context, context.phase);
        var stxArg = rest.slice(macroObj.fullName.length - 1);
        var transformer;
        if (opType != null) {
            assert(opType === 'binary' || opType === 'unary', 'operator type should be either unary or binary: ' + opType);
            transformer = macroObj[opType].fn;
        } else {
            transformer = macroObj.fn;
        }
        assert(typeof transformer === 'function', 'Macro transformer not bound for: ' + head.token.value);
        var // create a new mark to be used for the input to
        // the macro
        newMark = fresh();
        var transformerContext = makeExpanderContext(_.defaults({ mark: newMark }, context));
        // apply the transformer
        var rt;
        try {
            rt = transformer([head].concat(stxArg), transformerContext, opCtx.prevStx, opCtx.prevTerms);
        } catch (e) {
            if (e instanceof SyntaxCaseError) {
                var // add a nicer error for syntax case
                nameStr = macroObj.fullName.map(function (stx$2) {
                    return stx$2.token.value;
                }).join('');
                if (opType != null) {
                    var argumentString = '`' + stxArg.slice(0, 5).map(function (stx$2) {
                        return stx$2.token.value;
                    }).join(' ') + '...`';
                    throwSyntaxError('operator', 'Operator `' + nameStr + '` could not be matched with ' + argumentString, head);
                } else {
                    var argumentString = '`' + stxArg.slice(0, 5).map(function (stx$2) {
                        return stx$2.token.value;
                    }).join(' ') + '...`';
                    throwSyntaxError('macro', 'Macro `' + nameStr + '` could not be matched with ' + argumentString, head);
                }
            } else {
                // just rethrow it
                throw e;
            }
        }
        if (!builtinMode && !macroObj.builtin) {
            expandCount++;
        }
        if (!Array.isArray(rt.result)) {
            throwSyntaxError('enforest', 'Macro must return a syntax array', stx[0]);
        }
        if (rt.result.length > 0) {
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
        if (assoc === 'left') {
            return left <= right;
        }
        return left < right;
    }
    function toksAdjacent(a, b) {
        var arange = a.token.sm_range || a.token.range || a.token.endRange;
        var brange = b.token.sm_range || b.token.range || b.token.endRange;
        return arange && brange && arange[1] === brange[0];
    }
    function syntaxInnerValuesEq(synA, synB) {
        var a = synA.token.inner, b = synB.token.inner;
        return function (ziped) {
            return _.all(ziped, function (pair) {
                return unwrapSyntax(pair[0]) === unwrapSyntax(pair[1]);
            });
        }(a.length === b.length && _.zip(a, b));
    }
    function enforest(toks, context, prevStx, prevTerms) {
        assert(toks.length > 0, 'enforest assumes there are tokens to work with');
        prevStx = prevStx || [];
        prevTerms = prevTerms || [];
        if (expandCount >= maxExpands) {
            return {
                result: null,
                rest: toks
            };
        }
        function step(head, rest, opCtx) {
            var innerTokens;
            assert(Array.isArray(rest), 'result must at least be an empty array');
            if (head.isTermTree) {
                var isCustomOp = false;
                var uopMacroObj;
                var uopSyntax;
                if (head.isPunc || head.isKeyword || head.isId) {
                    if (head.isPunc) {
                        uopSyntax = head.punc;
                    } else if (head.isKeyword) {
                        uopSyntax = head.keyword;
                    } else if (head.isId) {
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
                if (// unary operator
                    isCustomOp && uopMacroObj.unary || uopSyntax && stxIsUnaryOp(uopSyntax)) {
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
                    var leftLeft = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartial ? opCtx.prevTerms[0] : null;
                    var unopTerm = PartialOperation.create(head, leftLeft);
                    var unopPrevStx = tagWithTerm(unopTerm, head.destruct(context).reverse()).concat(opCtx.prevStx);
                    var unopPrevTerms = [unopTerm].concat(opCtx.prevTerms);
                    var unopOpCtx = _.extend({}, opCtx, {
                        combine: function (t) {
                            if (t.isExpr) {
                                if (isCustomOp && uopMacroObj.unary) {
                                    var rt$2 = expandMacro(uopMacroName.concat(t.destruct(context)), context, opCtx, 'unary');
                                    var newt = get_expression(rt$2.result, context);
                                    assert(newt.rest.length === 0, 'should never have left over syntax');
                                    return opCtx.combine(newt.result);
                                }
                                return opCtx.combine(UnaryOp.create(uopSyntax, t));
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
                } else if (head.isExpr && (rest[0] && rest[1] && (stxIsBinOp(rest[0]) && !bopMacroObj || bopMacroObj && bopMacroObj.isOp && bopMacroObj.binary))) {
                    var opRes;
                    var op = rest[0];
                    var left = head;
                    var rightStx = rest.slice(1);
                    var leftLeft = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartial ? opCtx.prevTerms[0] : null;
                    var leftTerm = PartialExpression.create(head.destruct(context), leftLeft, function () {
                        return step(head, [], opCtx);
                    });
                    var opTerm = PartialOperation.create(op, leftTerm);
                    var opPrevStx = tagWithTerm(opTerm, [rest[0]]).concat(tagWithTerm(leftTerm, head.destruct(context)).reverse(), opCtx.prevStx);
                    var opPrevTerms = [
                        opTerm,
                        leftTerm
                    ].concat(opCtx.prevTerms);
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
                    assert(bopPrec !== undefined, 'expecting a precedence for operator: ' + op);
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
                    assert(opCtx.combine !== undefined, 'expecting a combine function');
                    var opRightStx = rightStx;
                    var bopMacroName;
                    if (isCustomOp) {
                        bopMacroName = rest.slice(0, bopMacroObj.fullName.length);
                        opRightStx = rightStx.slice(bopMacroObj.fullName.length - 1);
                    }
                    var bopOpCtx = _.extend({}, opCtx, {
                        combine: function (right) {
                            if (right.isExpr) {
                                if (isCustomOp && bopMacroObj.binary) {
                                    var leftStx = left.destruct(context);
                                    var rightStx$2 = right.destruct(context);
                                    var rt$2 = expandMacro(bopMacroName.concat(syn.makeDelim('()', leftStx, leftStx[0]), syn.makeDelim('()', rightStx$2, rightStx$2[0])), context, opCtx, 'binary');
                                    var newt = get_expression(rt$2.result, context);
                                    assert(newt.rest.length === 0, 'should never have left over syntax');
                                    return {
                                        term: newt.result,
                                        prevStx: opPrevStx,
                                        prevTerms: opPrevTerms
                                    };
                                }
                                return {
                                    term: BinOp.create(left, op, right),
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
                        prevTerms: opPrevTerms
                    });
                    return step(opRightStx[0], opRightStx.slice(1), bopOpCtx);
                } else if (head.isExpr && (rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()')) {
                    var parenRes = enforestParenExpression(rest[0], context);
                    if (parenRes) {
                        return step(Call.create(head, parenRes), rest.slice(1), opCtx);
                    }
                } else if (head.isExpr && (rest[0] && resolveFast(rest[0], context.env, context.phase) === '?')) {
                    var question = rest[0];
                    var condRes = enforest(rest.slice(1), context);
                    if (condRes.result) {
                        var truExpr = condRes.result;
                        var condRight = condRes.rest;
                        if (truExpr.isExpr && condRight[0] && resolveFast(condRight[0], context.env, context.phase) === ':') {
                            var colon = condRight[0];
                            var flsRes = enforest(condRight.slice(1), context);
                            var flsExpr = flsRes.result;
                            if (flsExpr.isExpr) {
                                if (// operators are combined before the ternary
                                    opCtx.prec >= 4) {
                                    var // ternary is like a operator with prec 4
                                    headResult = opCtx.combine(head);
                                    var condTerm = ConditionalExpression.create(headResult.term, question, truExpr, colon, flsExpr);
                                    if (opCtx.stack.length > 0) {
                                        return step(condTerm, flsRes.rest, opCtx.stack[0]);
                                    } else {
                                        return {
                                            result: condTerm,
                                            rest: flsRes.rest,
                                            prevStx: headResult.prevStx,
                                            prevTerms: headResult.prevTerms
                                        };
                                    }
                                } else {
                                    var condTerm = ConditionalExpression.create(head, question, truExpr, colon, flsExpr);
                                    return step(condTerm, flsRes.rest, opCtx);
                                }
                            }
                        }
                    }
                } else if (head.isDelimiter && head.delim.token.value === '()' && rest[0] && rest[0].token.type === parser.Token.Punctuator && resolveFast(rest[0], context.env, context.phase) === '=>') {
                    var arrowRes = enforest(rest.slice(1), context);
                    if (arrowRes.result && arrowRes.result.isExpr) {
                        return step(ArrowFun.create(head.delim, rest[0], arrowRes.result.destruct(context)), arrowRes.rest, opCtx);
                    } else {
                        throwSyntaxError('enforest', 'Body of arrow function must be an expression', rest.slice(1));
                    }
                } else if (head.isId && rest[0] && rest[0].token.type === parser.Token.Punctuator && resolveFast(rest[0], context.env, context.phase) === '=>') {
                    var res = enforest(rest.slice(1), context);
                    if (res.result && res.result.isExpr) {
                        return step(ArrowFun.create(head.id, rest[0], res.result.destruct(context)), res.rest, opCtx);
                    } else {
                        throwSyntaxError('enforest', 'Body of arrow function must be an expression', rest.slice(1));
                    }
                } else if (head.isDelimiter && head.delim.token.value === '()') {
                    if (// empty parens are acceptable but enforest
                        // doesn't accept empty arrays so short
                        // circuit here
                        head.delim.token.inner.length === 0) {
                        return step(ParenExpression.create([Empty.create()], head.delim, []), rest, opCtx);
                    } else {
                        var parenRes = enforestParenExpression(head.delim, context);
                        if (parenRes) {
                            return step(parenRes, rest, opCtx);
                        }
                    }
                } else if (head.isExpr && ((head.isId || head.isObjGet || head.isObjDotGet || head.isThisExpression) && rest[0] && rest[1] && !bopMacroObj && stxIsAssignOp(rest[0]))) {
                    var opRes = enforestAssignment(rest, context, head, prevStx, prevTerms);
                    if (opRes && opRes.result) {
                        return step(opRes.result, opRes.rest, _.extend({}, opCtx, {
                            prevStx: opRes.prevStx,
                            prevTerms: opRes.prevTerms
                        }));
                    }
                } else if (head.isExpr && (rest[0] && (unwrapSyntax(rest[0]) === '++' || unwrapSyntax(rest[0]) === '--'))) {
                    if (// Check if the operator is a macro first.
                        context.env.has(resolveFast(rest[0], context.env, context.phase))) {
                        var headStx = tagWithTerm(head, head.destruct(context).reverse());
                        var opPrevStx = headStx.concat(prevStx);
                        var opPrevTerms = [head].concat(prevTerms);
                        var opRes = enforest(rest, context, opPrevStx, opPrevTerms);
                        if (opRes.prevTerms.length < opPrevTerms.length) {
                            return opRes;
                        } else if (opRes.result) {
                            return step(head, opRes.result.destruct(context).concat(opRes.rest), opCtx);
                        }
                    }
                    return step(PostfixOp.create(head, rest[0]), rest.slice(1), opCtx);
                } else if (head.isExpr && (rest[0] && rest[0].token.value === '[]')) {
                    return step(ObjGet.create(head, Delimiter.create(rest[0])), rest.slice(1), opCtx);
                } else if (head.isExpr && (rest[0] && unwrapSyntax(rest[0]) === '.' && !context.env.has(resolveFast(rest[0], context.env, context.phase)) && rest[1] && (rest[1].token.type === parser.Token.Identifier || rest[1].token.type === parser.Token.Keyword))) {
                    if (// Check if the identifier is a macro first.
                        context.env.has(resolveFast(rest[1], context.env, context.phase))) {
                        var headStx = tagWithTerm(head, head.destruct(context).reverse());
                        var dotTerm = Punc.create(rest[0]);
                        var dotTerms = [dotTerm].concat(head, prevTerms);
                        var dotStx = tagWithTerm(dotTerm, [rest[0]]).concat(headStx, prevStx);
                        var dotRes = enforest(rest.slice(1), context, dotStx, dotTerms);
                        if (dotRes.prevTerms.length < dotTerms.length) {
                            return dotRes;
                        } else if (dotRes.result) {
                            return step(head, [rest[0]].concat(dotRes.result.destruct(context), dotRes.rest), opCtx);
                        }
                    }
                    return step(ObjDotGet.create(head, rest[0], rest[1]), rest.slice(2), opCtx);
                } else if (head.isDelimiter && head.delim.token.value === '[]') {
                    return step(ArrayLiteral.create(head), rest, opCtx);
                } else if (head.isDelimiter && head.delim.token.value === '{}') {
                    return step(Block.create(head), rest, opCtx);
                } else if (head.isId && unwrapSyntax(head.id) === '#quoteSyntax' && rest[0] && rest[0].token.value === '{}') {
                    return step(QuoteSyntax.create(rest[0]), rest.slice(1), opCtx);
                } else if (head.isKeyword && unwrapSyntax(head.keyword) === 'return') {
                    if (rest[0] && rest[0].token.lineNumber === head.keyword.token.lineNumber) {
                        var returnPrevStx = tagWithTerm(head, head.destruct(context)).concat(opCtx.prevStx);
                        var returnPrevTerms = [head].concat(opCtx.prevTerms);
                        var returnExpr = enforest(rest, context, returnPrevStx, returnPrevTerms);
                        if (returnExpr.prevTerms.length < opCtx.prevTerms.length) {
                            return returnExpr;
                        }
                        if (returnExpr.result.isExpr) {
                            return step(ReturnStatement.create(head, returnExpr.result), returnExpr.rest, opCtx);
                        }
                    } else {
                        return step(ReturnStatement.create(head, Empty.create()), rest, opCtx);
                    }
                } else if (head.isKeyword && unwrapSyntax(head.keyword) === 'let') {
                    var nameTokens = [];
                    if (rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()') {
                        nameTokens = rest[0].token.inner;
                    } else {
                        nameTokens.push(rest[0]);
                    }
                    if (// Let macro
                        rest[1] && rest[1].token.value === '=' && rest[2] && rest[2].token.value === 'macro') {
                        var mac = enforest(rest.slice(2), context);
                        if (mac.result) {
                            if (!mac.result.isAnonMacro) {
                                throwSyntaxError('enforest', 'expecting an anonymous macro definition in syntax let binding', rest.slice(2));
                            }
                            return step(LetMacro.create(nameTokens, mac.result.body), mac.rest, opCtx);
                        }
                    } else {
                        var lsRes = enforestVarStatement(rest, context, head.keyword);
                        if (lsRes && lsRes.result) {
                            return step(LetStatement.create(head, lsRes.result), lsRes.rest, opCtx);
                        }
                    }
                } else if (head.isKeyword && unwrapSyntax(head.keyword) === 'var' && rest[0]) {
                    var vsRes = enforestVarStatement(rest, context, head.keyword);
                    if (vsRes && vsRes.result) {
                        return step(VariableStatement.create(head, vsRes.result), vsRes.rest, opCtx);
                    }
                } else if (head.isKeyword && unwrapSyntax(head.keyword) === 'const' && rest[0]) {
                    var csRes = enforestVarStatement(rest, context, head.keyword);
                    if (csRes && csRes.result) {
                        return step(ConstStatement.create(head, csRes.result), csRes.rest, opCtx);
                    }
                } else if (head.isKeyword && unwrapSyntax(head.keyword) === 'for' && rest[0] && rest[0].token.value === '()') {
                    return step(ForStatement.create(head.keyword, rest[0]), rest.slice(1), opCtx);
                }
            } else {
                assert(head && head.token, 'assuming head is a syntax object');
                var macroObj = expandCount < maxExpands && getValueInEnv(head, rest, context, context.phase);
                if (// macro invocation
                    macroObj && typeof macroObj.fn === 'function' && !macroObj.isOp) {
                    var rt = expandMacro([head].concat(rest), context, opCtx, null, macroObj);
                    var newOpCtx = opCtx;
                    if (rt.prevTerms && rt.prevTerms.length < opCtx.prevTerms.length) {
                        newOpCtx = rewindOpCtx(opCtx, rt);
                    }
                    if (rt.result.length > 0) {
                        return step(rt.result[0], rt.result.slice(1).concat(rt.rest), newOpCtx);
                    } else {
                        return step(Empty.create(), rt.rest, newOpCtx);
                    }
                } else if (head.token.type === parser.Token.Identifier && unwrapSyntax(head) === 'macro' && resolve(head, context.phase) === 'macro' && rest[0] && rest[0].token.value === '{}') {
                    return step(AnonMacro.create(rest[0].token.inner), rest.slice(1), opCtx);
                } else if (head.token.type === parser.Token.Identifier && unwrapSyntax(head) === 'macro' && resolve(head, context.phase) === 'macro') {
                    var nameTokens = [];
                    if (rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()') {
                        nameTokens = rest[0].token.inner;
                    } else {
                        nameTokens.push(rest[0]);
                    }
                    if (rest[1] && rest[1].token.type === parser.Token.Delimiter) {
                        return step(Macro.create(nameTokens, rest[1].token.inner), rest.slice(2), opCtx);
                    } else {
                        throwSyntaxError('enforest', 'Macro declaration must include body', rest[1]);
                    }
                } else if (head.token.type === parser.Token.Identifier && head.token.value === 'unaryop' && rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()' && rest[1] && rest[1].token.type === parser.Token.NumericLiteral && rest[2] && rest[2].token.type === parser.Token.Delimiter && rest[2] && rest[2].token.value === '{}') {
                    var trans = enforest(rest[2].token.inner, context);
                    return step(OperatorDefinition.create(syn.makeValue('unary', head), rest[0].token.inner, rest[1], null, trans.result.body), rest.slice(3), opCtx);
                } else if (head.token.type === parser.Token.Identifier && head.token.value === 'binaryop' && rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()' && rest[1] && rest[1].token.type === parser.Token.NumericLiteral && rest[2] && rest[2].token.type === parser.Token.Identifier && rest[3] && rest[3].token.type === parser.Token.Delimiter && rest[3] && rest[3].token.value === '{}') {
                    var trans = enforest(rest[3].token.inner, context);
                    return step(OperatorDefinition.create(syn.makeValue('binary', head), rest[0].token.inner, rest[1], rest[2], trans.result.body), rest.slice(4), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'function' && rest[0] && rest[0].token.type === parser.Token.Identifier && rest[1] && rest[1].token.type === parser.Token.Delimiter && rest[1].token.value === '()' && rest[2] && rest[2].token.type === parser.Token.Delimiter && rest[2].token.value === '{}') {
                    rest[1].token.inner = rest[1].token.inner;
                    rest[2].token.inner = rest[2].token.inner;
                    return step(NamedFun.create(head, null, rest[0], rest[1], rest[2]), rest.slice(3), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'function' && rest[0] && rest[0].token.type === parser.Token.Punctuator && rest[0].token.value === '*' && rest[1] && rest[1].token.type === parser.Token.Identifier && rest[2] && rest[2].token.type === parser.Token.Delimiter && rest[2].token.value === '()' && rest[3] && rest[3].token.type === parser.Token.Delimiter && rest[3].token.value === '{}') {
                    rest[2].token.inner = rest[2].token.inner;
                    rest[3].token.inner = rest[3].token.inner;
                    return step(NamedFun.create(head, rest[0], rest[1], rest[2], rest[3]), rest.slice(4), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'function' && rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()' && rest[1] && rest[1].token.type === parser.Token.Delimiter && rest[1].token.value === '{}') {
                    rest[0].token.inner = rest[0].token.inner;
                    rest[1].token.inner = rest[1].token.inner;
                    return step(AnonFun.create(head, null, rest[0], rest[1]), rest.slice(2), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'function' && rest[0] && rest[0].token.type === parser.Token.Punctuator && rest[0].token.value === '*' && rest[1] && rest[1].token.type === parser.Token.Delimiter && rest[1].token.value === '()' && rest[2] && rest[2].token.type === parser.Token.Delimiter && rest[2].token.value === '{}') {
                    rest[1].token.inner = rest[1].token.inner;
                    rest[2].token.inner = rest[2].token.inner;
                    return step(AnonFun.create(head, rest[0], rest[1], rest[2]), rest.slice(3), opCtx);
                } else if ((head.token.type === parser.Token.Delimiter && head.token.value === '()' || head.token.type === parser.Token.Identifier) && rest[0] && rest[0].token.type === parser.Token.Punctuator && resolveFast(rest[0], context.env, context.phase) === '=>' && rest[1] && rest[1].token.type === parser.Token.Delimiter && rest[1].token.value === '{}') {
                    return step(ArrowFun.create(head, rest[0], rest[1]), rest.slice(2), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'catch' && rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()' && rest[1] && rest[1].token.type === parser.Token.Delimiter && rest[1].token.value === '{}') {
                    rest[0].token.inner = rest[0].token.inner;
                    rest[1].token.inner = rest[1].token.inner;
                    return step(CatchClause.create(head, rest[0], rest[1]), rest.slice(2), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'this') {
                    return step(ThisExpression.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.NumericLiteral || head.token.type === parser.Token.StringLiteral || head.token.type === parser.Token.BooleanLiteral || head.token.type === parser.Token.RegularExpression || head.token.type === parser.Token.NullLiteral) {
                    return step(Lit.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'import' && rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '{}' && rest[1] && unwrapSyntax(rest[1]) === 'from' && rest[2] && rest[2].token.type === parser.Token.StringLiteral && rest[3] && unwrapSyntax(rest[3]) === 'for' && rest[4] && unwrapSyntax(rest[4]) === 'macros') {
                    var importRest;
                    if (rest[5] && rest[5].token.type === parser.Token.Punctuator && rest[5].token.value === ';') {
                        importRest = rest.slice(6);
                    } else {
                        importRest = rest.slice(5);
                    }
                    return step(ImportForMacros.create(rest[0], rest[2]), importRest, opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'import' && rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '{}' && rest[1] && unwrapSyntax(rest[1]) === 'from' && rest[2] && rest[2].token.type === parser.Token.StringLiteral) {
                    var importRest;
                    if (rest[3] && rest[3].token.type === parser.Token.Punctuator && rest[3].token.value === ';') {
                        importRest = rest.slice(4);
                    } else {
                        importRest = rest.slice(3);
                    }
                    return step(Import.create(head, rest[0], rest[1], rest[2]), importRest, opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'export' && rest[0] && (rest[0].token.type === parser.Token.Identifier || rest[0].token.type === parser.Token.Keyword || rest[0].token.type === parser.Token.Punctuator || rest[0].token.type === parser.Token.Delimiter)) {
                    if (unwrapSyntax(rest[1]) !== ';' && toksAdjacent(rest[0], rest[1])) {
                        throwSyntaxError('enforest', 'multi-token macro/operator names must be wrapped in () when exporting', rest[1]);
                    }
                    return step(Export.create(head, rest[0]), rest.slice(1), opCtx);
                } else if (head.token.type === parser.Token.Identifier) {
                    return step(Id.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.Punctuator) {
                    return step(Punc.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'with') {
                    throwSyntaxError('enforest', 'with is not supported in sweet.js', head);
                } else if (head.token.type === parser.Token.Keyword) {
                    return step(Keyword.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.Delimiter) {
                    return step(Delimiter.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.Template) {
                    return step(Template.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.EOF) {
                    assert(rest.length === 0, 'nothing should be after an EOF');
                    return step(EOF.create(head), [], opCtx);
                } else {
                    // todo: are we missing cases?
                    assert(false, 'not implemented');
                }
            }
            if (// Potentially an infix macro
                // This should only be invoked on runtime syntax terms
                !head.isMacro && !head.isLetMacro && !head.isAnonMacro && !head.isOperatorDefinition && rest.length && nameInEnv(rest[0], rest.slice(1), context, context.phase) && getValueInEnv(rest[0], rest.slice(1), context, context.phase).isOp === false) {
                var infLeftTerm = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartial ? opCtx.prevTerms[0] : null;
                var infTerm = PartialExpression.create(head.destruct(context), infLeftTerm, function () {
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
            var // done with current step so combine and continue on
            combResult = opCtx.combine(head);
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
            combine: function (t) {
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
        if (// If we've consumed all pending operators, we can just start over.
            // It's important that we always thread the new prevStx and prevTerms
            // through, otherwise the old ones will still persist.
            !res.prevTerms.length || !res.prevTerms[0].isPartial) {
            return _.extend({}, opCtx, {
                combine: function (t) {
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
            if (!res.prevTerms[i].isPartial) {
                break;
            }
            if (res.prevTerms[i].isPartialOperation) {
                op = res.prevTerms[i];
                break;
            }
        }
        if (// If the op matches the current opCtx, we don't need to rewind
            // anything, but we still need to persist the prevStx and prevTerms.
            opCtx.op === op) {
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
        assert(false, 'Rewind failed.');
    }
    function get_expression(stx, context) {
        if (stx[0].term) {
            for (var termLen = 1; termLen < stx.length; termLen++) {
                if (stx[termLen].term !== stx[0].term) {
                    break;
                }
            }
            if (// Guard the termLen because we can have a multi-token term that
                // we don't want to split. TODO: is there something we can do to
                // get around this safely?
                stx[0].term.isPartialExpression && termLen === stx[0].term.stx.length) {
                var expr = stx[0].term.combine().result;
                for (var i = 1, term = stx[0].term; i < stx.length; i++) {
                    if (stx[i].term !== term) {
                        if (term && term.isPartial) {
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
            } else if (stx[0].term.isExpr) {
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
        if (!res.result || !res.result.isExpr) {
            return {
                result: null,
                rest: stx
            };
        }
        return res;
    }
    function tagWithTerm(term, stx) {
        return stx.map(function (s) {
            var src = s.token;
            var keys = Object.keys(src);
            var newtok = {};
            for (var i = 0, len = keys.length, key; i < len; i++) {
                key = keys[i];
                newtok[key] = src[key];
            }
            s = syntaxFromToken(newtok, s);
            s.term = term;
            return s;
        });
    }
    function applyMarkToPatternEnv(newMark, env) {
        function dfs(match) {
            if (match.level === 0) {
                // replace the match property with the marked syntax
                match.match = _.map(match.match, function (stx) {
                    return stx.mark(newMark);
                });
            } else {
                _.each(match.match, function (match$2) {
                    dfs(match$2);
                });
            }
        }
        _.keys(env).forEach(function (key) {
            dfs(env[key]);
        });
    }
    function loadMacroDef(body, context, phase) {
        var expanded = body[0].destruct(context, { stripCompileTerm: true });
        var stub = parser.read('()');
        stub[0].token.inner = expanded;
        var flattend = flatten(stub);
        var bodyCode = codegen.generate(parser.parse(flattend, { phase: phase }));
        var macroGlobal = {
            makeValue: syn.makeValue,
            makeRegex: syn.makeRegex,
            makeIdent: syn.makeIdent,
            makeKeyword: syn.makeKeyword,
            makePunc: syn.makePunc,
            makeDelim: syn.makeDelim,
            filename: context.filename,
            require: function (id) {
                if (context.requireModule) {
                    return context.requireModule(id, context.filename);
                }
                return require(id);
            },
            getExpr: function (stx) {
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
            getIdent: function (stx) {
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
            getLit: function (stx) {
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
            getPattern: function (id) {
                return context.patternMap.get(id);
            },
            getTemplate: function (id) {
                assert(context.templateMap.has(id), 'missing template');
                return syn.cloneSyntaxArray(context.templateMap.get(id));
            },
            applyMarkToPatternEnv: applyMarkToPatternEnv,
            mergeMatches: function (newMatch, oldMatch) {
                newMatch.patternEnv = _.extend({}, oldMatch.patternEnv, newMatch.patternEnv);
                return newMatch;
            },
            console: console
        };
        context.env.keys().forEach(function (key) {
            var val = context.env.get(key);
            if (// load the compile time values into the global object
                val && val.value) {
                macroGlobal[key] = val.value;
            }
        });
        var macroFn;
        if (vm) {
            macroFn = vm.runInNewContext('(function() { return ' + bodyCode + ' })()', macroGlobal);
        } else {
            macroFn = scopedEval(bodyCode, macroGlobal);
        }
        return macroFn;
    }
    function expandToTermTree(stx, context) {
        assert(context, 'expander context is required');
        var f, head, prevStx, restStx, prevTerms, macroDefinition;
        var rest = stx;
        while (rest.length > 0) {
            assert(rest[0].token, 'expecting a syntax object');
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
            if (head.isMacro && expandCount < maxExpands) {
                if (!(// raw function primitive form
                    head.body[0] && head.body[0].token.type === parser.Token.Keyword && head.body[0].token.value === 'function')) {
                    throwSyntaxError('load macro', 'Primitive macro form must contain a function for the macro body', head.body);
                }
                // expand the body
                head.body = expand(head.body, makeExpanderContext(_.extend({}, context, { phase: context.phase + 1 })));
                //  and load the macro definition into the environment
                macroDefinition = loadMacroDef(head.body, context, context.phase + 1);
                var name = head.name.map(unwrapSyntax).join('');
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
            if (head.isLetMacro && expandCount < maxExpands) {
                if (!(// raw function primitive form
                    head.body[0] && head.body[0].token.type === parser.Token.Keyword && head.body[0].token.value === 'function')) {
                    throwSyntaxError('load macro', 'Primitive macro form must contain a function for the macro body', head.body);
                }
                // expand the body
                head.body = expand(head.body, makeExpanderContext(_.extend({ phase: context.phase + 1 }, context)));
                //  and load the macro definition into the environment
                macroDefinition = loadMacroDef(head.body, context, context.phase + 1);
                var freshName = fresh();
                var name = head.name.map(unwrapSyntax).join('');
                var oldName = head.name;
                var nameStx = syn.makeIdent(name, head.name[0]);
                var renamedName = nameStx.rename(nameStx, freshName);
                // store a reference to the full name in the props object.
                // this allows us to communicate the original full name to
                // `visit` later on.
                renamedName.props.fullName = oldName;
                head.name = [renamedName];
                rest = _.map(rest, function (stx$2) {
                    return stx$2.rename(nameStx, freshName);
                });
                context.env.names.set(name, true);
                context.env.set(resolve(renamedName, context.phase), {
                    fn: macroDefinition,
                    isOp: false,
                    builtin: builtinMode,
                    fullName: oldName
                });
            }
            if (head.isOperatorDefinition) {
                if (!(// raw function primitive form
                    head.body[0] && head.body[0].token.type === parser.Token.Keyword && head.body[0].token.value === 'function')) {
                    throwSyntaxError('load macro', 'Primitive macro form must contain a function for the macro body', head.body);
                }
                // expand the body
                head.body = expand(head.body, makeExpanderContext(_.extend({ phase: context.phase + 1 }, context)));
                var //  and load the macro definition into the environment
                opDefinition = loadMacroDef(head.body, context, context.phase + 1);
                var name = head.name.map(unwrapSyntax).join('');
                var nameStx = syn.makeIdent(name, head.name[0]);
                addToDefinitionCtx([nameStx], context.defscope, false, context.paramscope);
                var resolvedName = resolve(nameStx, context.phase);
                var opObj = context.env.get(resolvedName);
                if (!opObj) {
                    opObj = {
                        isOp: true,
                        builtin: builtinMode,
                        fullName: head.name
                    };
                }
                assert(unwrapSyntax(head.type) === 'binary' || unwrapSyntax(head.type) === 'unary', 'operator must either be binary or unary');
                opObj[unwrapSyntax(head.type)] = {
                    fn: opDefinition,
                    prec: head.prec.token.value,
                    assoc: head.assoc ? head.assoc.token.value : null
                };
                context.env.names.set(name, true);
                context.env.set(resolvedName, opObj);
            }
            if (head.isNamedFun) {
                addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            }
            if (head.isVariableStatement || head.isLetStatement || head.isConstStatement) {
                addToDefinitionCtx(_.map(head.decls, function (decl) {
                    return decl.ident;
                }), context.defscope, true, context.paramscope);
            }
            if (head.isBlock && head.body.isDelimiter) {
                head.body.delim.token.inner.forEach(function (term) {
                    if (term.isVariableStatement) {
                        addToDefinitionCtx(_.map(term.decls, function (decl) {
                            return decl.ident;
                        }), context.defscope, true, context.paramscope);
                    }
                });
            }
            if (head.isDelimiter) {
                head.delim.token.inner.forEach(function (term) {
                    if (term.isVariableStatement) {
                        addToDefinitionCtx(_.map(term.decls, function (decl) {
                            return decl.ident;
                        }), context.defscope, true, context.paramscope);
                    }
                });
            }
            if (head.isForStatement) {
                var forCond = head.cond.token.inner;
                if (forCond[0] && resolve(forCond[0], context.phase) === 'let' && forCond[1] && forCond[1].token.type === parser.Token.Identifier) {
                    var letNew = fresh();
                    var letId = forCond[1];
                    forCond = forCond.map(function (stx$2) {
                        return stx$2.rename(letId, letNew);
                    });
                    // hack: we want to do the let renaming here, not
                    // in the expansion of `for (...)` so just remove the `let`
                    // keyword
                    head.cond.token.inner = expand([forCond[0]], context).concat(expand(forCond.slice(1), context));
                    if (// nice and easy case: `for (...) { ... }`
                        rest[0] && rest[0].token.value === '{}') {
                        rest[0] = rest[0].rename(letId, letNew);
                    } else {
                        var // need to deal with things like `for (...) if (...) log(...)`
                        bodyEnf = enforest(rest, context);
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
            context: context
        };
    }
    function addToDefinitionCtx(idents, defscope, skipRep, paramscope) {
        assert(idents && idents.length > 0, 'expecting some variable identifiers');
        // flag for skipping repeats since we reuse this function to place both
        // variables declarations (which need to skip redeclarations) and
        // macro definitions which don't
        skipRep = skipRep || false;
        _.chain(idents).filter(function (id) {
            if (skipRep) {
                var /*
                       When var declarations repeat in the same function scope:

                       var x = 24;
                       ...
                       var x = 42;

                       we just need to use the first renaming and leave the
                       definition context as is.
                    */
                varDeclRep = _.find(defscope, function (def) {
                    return def.id.token.value === id.token.value && arraysEqual(marksof(def.id.context), marksof(id.context));
                });
                var /*
                        When var declaration repeat one of the function parameters:

                        function foo(x) {
                            var x;
                        }

                        we don't need to add the var to the definition context.
                    */
                paramDeclRep = _.find(paramscope, function (param) {
                    return param.token.value === id.token.value && arraysEqual(marksof(param.context), marksof(id.context));
                });
                return typeof varDeclRep === 'undefined' && typeof paramDeclRep === 'undefined';
            }
            return true;
        }).each(function (id) {
            var name = fresh();
            defscope.push({
                id: id,
                name: name
            });
        });
    }
    function expandTermTreeToFinal(term, context) {
        assert(context && context.env, 'environment map is required');
        if (term.isArrayLiteral) {
            term.array.delim.token.inner = expand(term.array.delim.token.inner, context);
            return term;
        } else if (term.isBlock) {
            term.body.delim.token.inner = expand(term.body.delim.token.inner, context);
            return term;
        } else if (term.isParenExpression) {
            term.args = _.map(term.args, function (arg) {
                return expandTermTreeToFinal(arg, context);
            });
            return term;
        } else if (term.isCall) {
            term.fun = expandTermTreeToFinal(term.fun, context);
            term.args = expandTermTreeToFinal(term.args, context);
            return term;
        } else if (term.isReturnStatement) {
            term.expr = expandTermTreeToFinal(term.expr, context);
            return term;
        } else if (term.isUnaryOp) {
            term.expr = expandTermTreeToFinal(term.expr, context);
            return term;
        } else if (term.isBinOp || term.isAssignmentExpression) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right = expandTermTreeToFinal(term.right, context);
            return term;
        } else if (term.isObjGet) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right.delim.token.inner = expand(term.right.delim.token.inner, context);
            return term;
        } else if (term.isObjDotGet) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right = expandTermTreeToFinal(term.right, context);
            return term;
        } else if (term.isConditionalExpression) {
            term.cond = expandTermTreeToFinal(term.cond, context);
            term.tru = expandTermTreeToFinal(term.tru, context);
            term.fls = expandTermTreeToFinal(term.fls, context);
            return term;
        } else if (term.isVariableDeclaration) {
            if (term.init) {
                term.init = expandTermTreeToFinal(term.init, context);
            }
            return term;
        } else if (term.isVariableStatement) {
            term.decls = _.map(term.decls, function (decl) {
                return expandTermTreeToFinal(decl, context);
            });
            return term;
        } else if (term.isDelimiter) {
            // expand inside the delimiter and then continue on
            term.delim.token.inner = expand(term.delim.token.inner, context);
            return term;
        } else if (term.isNamedFun || term.isAnonFun || term.isCatchClause || term.isArrowFun || term.isModule) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef = [];
            var paramSingleIdent = term.params && term.params.token.type === parser.Token.Identifier;
            var params;
            if (term.params && term.params.token.type === parser.Token.Delimiter) {
                params = term.params;
            } else if (paramSingleIdent) {
                params = term.params;
            } else {
                params = syn.makeDelim('()', [], null);
            }
            var bodies;
            if (Array.isArray(term.body)) {
                bodies = syn.makeDelim('{}', term.body, null);
            } else {
                bodies = term.body;
            }
            bodies = bodies.addDefCtx(newDef);
            var paramNames = _.map(getParamIdentifiers(params), function (param) {
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
                paramscope: paramNames.map(function (p) {
                    return p.renamedParam;
                })
            }, context));
            var // rename the function body for each of the parameters
            renamedBody = _.reduce(paramNames, function (accBody, p) {
                return accBody.rename(p.originalParam, p.freshName);
            }, bodies);
            renamedBody = renamedBody;
            var expandedResult = expandToTermTree(renamedBody.token.inner, bodyContext);
            var bodyTerms = expandedResult.terms;
            if (expandedResult.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody.token.inner = expandedResult.terms.concat(expandedResult.restStx);
                if (Array.isArray(term.body)) {
                    term.body = renamedBody.token.inner;
                } else {
                    term.body = renamedBody;
                }
                return term;
            }
            var renamedParams = _.map(paramNames, function (p) {
                return p.renamedParam;
            });
            var flatArgs;
            if (paramSingleIdent) {
                flatArgs = renamedParams[0];
            } else {
                var puncCtx = term.params || null;
                flatArgs = syn.makeDelim('()', joinSyntax(renamedParams, syn.makePunc(',', puncCtx)), puncCtx);
            }
            var expandedArgs = expand([flatArgs], bodyContext);
            assert(expandedArgs.length === 1, 'should only get back one result');
            if (// stitch up the function with all the renamings
                term.params) {
                term.params = expandedArgs[0];
            }
            bodyTerms = _.map(bodyTerms, function (bodyTerm) {
                if (// add the definition context to the result of
                    // expansion (this makes sure that syntax objects
                    // introduced by expansion have the def context)
                    bodyTerm.isBlock) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal = expandTermTreeToFinal(bodyTerm, expandedResult.context);
                    return blockFinal.addDefCtx(newDef);
                } else {
                    var termWithCtx = bodyTerm.addDefCtx(newDef);
                    // finish expansion
                    return expandTermTreeToFinal(termWithCtx, expandedResult.context);
                }
            });
            if (term.isModule) {
                bodyTerms.forEach(function (bodyTerm) {
                    if (bodyTerm.isExport) {
                        if (bodyTerm.name.token.type == parser.Token.Delimiter && bodyTerm.name.token.value === '{}') {
                            (function (names) {
                                return names.forEach(function (name) {
                                    term.exports.push(name);
                                });
                            }(filterCommaSep(bodyTerm.name.token.inner)));
                        } else {
                            throwSyntaxError('expand', 'not valid export type', bodyTerm.name);
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
    function expand(stx, context) {
        assert(context, 'must provide an expander context');
        var trees = expandToTermTree(stx, context);
        var terms = _.map(trees.terms, function (term) {
            return expandTermTreeToFinal(term, trees.context);
        });
        if (trees.restStx) {
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
            filename: {
                value: o.filename,
                writable: false,
                enumerable: true,
                configurable: false
            },
            requireModule: {
                value: o.requireModule,
                writable: false,
                enumerable: true,
                configurable: false
            },
            env: {
                value: env,
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            paramscope: {
                value: o.paramscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o.templateMap || new StringMap(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            patternMap: {
                value: o.patternMap || new StringMap(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o.mark,
                writable: false,
                enumerable: true,
                configurable: false
            },
            phase: {
                value: o.phase,
                writable: false,
                enumerable: true,
                configurable: false
            },
            implicitImport: {
                value: o.implicitImport || new StringMap(),
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    function makeModuleExpanderContext(options, templateMap, patternMap, phase) {
        var requireModule = options ? options.requireModule : undefined;
        var filename = options && options.filename ? options.filename : '<anonymous module>';
        return makeExpanderContext({
            filename: filename,
            requireModule: requireModule,
            templateMap: templateMap,
            patternMap: patternMap,
            phase: phase
        });
    }
    function makeTopLevelExpanderContext(options) {
        var requireModule = options ? options.requireModule : undefined;
        var filename = options && options.filename ? options.filename : '<anonymous module>';
        return makeExpanderContext({
            filename: filename,
            requireModule: requireModule
        });
    }
    function expandTopLevel(stx, moduleContexts, options) {
        moduleContexts = moduleContexts || [];
        options = options || {};
        options.flatten = options.flatten != null ? options.flatten : true;
        maxExpands = options.maxExpands || Infinity;
        expandCount = 0;
        var context = makeTopLevelExpanderContext(options);
        var modBody = syn.makeDelim('{}', stx, null);
        modBody = _.reduce(moduleContexts, function (acc, mod) {
            context.env.extend(mod.env);
            context.env.names.extend(mod.env.names);
            return loadModuleExports(acc, context.env, mod.exports, mod.env);
        }, modBody);
        var res = expand([
            syn.makeIdent('module', null),
            modBody
        ], context);
        res = res[0].destruct(context, { stripCompileTerm: true });
        res = res[0].token.inner;
        return options.flatten ? flatten(res) : res;
    }
    function collectImports(mod, context) {
        // TODO: this is currently just grabbing the imports from the
        // very beginning of the file. It really should be able to mix
        // imports/exports/statements at the top level.
        var imports = [];
        var res;
        var rest = mod.body;
        if (// #lang "sweet" expands to imports for the basic macros for sweet.js
            // eventually this should hook into module level extensions
            unwrapSyntax(mod.lang) !== 'base' && unwrapSyntax(mod.lang) !== 'js') {
            var defaultImports = [
                'quoteSyntax',
                'syntax',
                '#',
                'syntaxCase',
                'macro',
                'withSyntax',
                'letstx',
                'macroclass',
                'operator'
            ];
            defaultImports = defaultImports.map(function (name) {
                return syn.makeIdent(name, null);
            });
            imports.push(ImportForMacros.create(syn.makeDelim('{}', joinSyntax(defaultImports, syn.makePunc(',', null)), null), mod.lang));
            imports.push(Import.create(syn.makeKeyword('import', null), syn.makeDelim('{}', joinSyntax(defaultImports, syn.makePunc(',', null)), null), syn.makeIdent('from', null), mod.lang));
        }
        while (true) {
            res = enforest(rest, context);
            if (res.result && (res.result.isImport || res.result.isImportForMacros)) {
                imports.push(res.result);
                rest = res.rest;
            } else {
                break;
            }
        }
        return Module.create(mod.name, mod.lang, rest, imports, mod.exports);
    }
    function resolvePath(name, parent) {
        var path = require('path');
        var resolveSync = require('resolve/lib/sync');
        var root = path.dirname(unwrapSyntax(parent.name));
        var fs = require('fs');
        if (name[0] === '.') {
            name = path.resolve(root, name);
        }
        return resolveSync(name, {
            basedir: root,
            extensions: [
                '.js',
                '.sjs'
            ]
        });
    }
    function createModule(name, body) {
        if (body && body[0] && body[1] && body[2] && unwrapSyntax(body[0]) === '#' && unwrapSyntax(body[1]) === 'lang' && body[2].token.type === parser.Token.StringLiteral) {
            var // consume optional semicolon
            rest = body[3] && body[3].token.value === ';' && body[3].token.type == parser.Token.Punctuator ? body.slice(4) : body.slice(3);
            return Module.create(syn.makeValue(name, null), body[2], rest, [], []);
        }
        return Module.create(syn.makeValue(name, null), syn.makeValue('base', null), body, [], []);
    }
    function loadModule(name) {
        var // node specific code
        fs = require('fs');
        return function (body) {
            return createModule(name, body);
        }(parser.read(fs.readFileSync(name, 'utf8')));
    }
    function invoke(mod, phase, context, options) {
        if (unwrapSyntax(mod.lang) === 'base') {
            var exported = require(unwrapSyntax(mod.name));
            Object.keys(exported).forEach(function (exp) {
                var freshName = fresh();
                var expName = syn.makeIdent(exp, null);
                var renamed = expName.rename(expName, freshName);
                mod.exports.push(renamed);
                context.env.set(resolve(renamed, phase), { value: exported[exp] });
                context.env.names.set(exp, true);
            });
        } else {
            mod.imports.forEach(function (imp) {
                var modToImport = loadImport(imp, mod, options, context);
                if (imp.isImport) {
                    context = invoke(modToImport, phase, context, options);
                }
            });
            var code = function (terms) {
                return codegen.generate(parser.parse(flatten(_.flatten(terms.map(function (term) {
                    return term.destruct(context, {
                        stripCompileTerm: true,
                        stripModuleTerm: true
                    });
                })))));
            }(mod.body);
            var global = { console: console };
            vm.runInNewContext(code, global);
            mod.exports.forEach(function (exp) {
                var expName = resolve(exp, phase);
                var expVal = global[expName];
                context.env.set(expName, { value: expVal });
                context.env.names.set(unwrapSyntax(exp), true);
            });
        }
        return context;
    }
    function visit(mod, phase, context, options) {
        var defctx = [];
        if (// we don't need to visit base modules
            unwrapSyntax(mod.lang) === 'base') {
            return context;
        }
        mod.body = mod.body.map(function (term) {
            return term.addDefCtx(defctx);
        });
        // reset the exports
        mod.exports = [];
        mod.imports.forEach(function (imp) {
            var modToImport = loadImport(imp, mod, options, context);
            if (imp.isImport) {
                context = visit(modToImport, phase, context, options);
            } else if (imp.isImportForMacros) {
                context = invoke(modToImport, phase + 1, context, options);
                context = visit(modToImport, phase + 1, context, options);
            } else {
                assert(false, 'not implemented yet');
            }
            bindImportInMod(imp, mod, modToImport, context, phase);
        });
        mod.body.forEach(function (term) {
            var name;
            var macroDefinition;
            if (term.isMacro) {
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
            if (term.isLetMacro) {
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
            if (term.isOperatorDefinition) {
                var opDefinition = loadMacroDef(term.body, context, phase + 1);
                name = term.name.map(unwrapSyntax).join('');
                var nameStx = syn.makeIdent(name, term.name[0]);
                addToDefinitionCtx([nameStx], defctx, false, []);
                var resolvedName = resolve(nameStx, phase);
                var opObj = context.env.get(resolvedName);
                if (!opObj) {
                    opObj = {
                        isOp: true,
                        builtin: builtinMode,
                        fullName: term.name
                    };
                }
                assert(unwrapSyntax(term.type) === 'binary' || unwrapSyntax(term.type) === 'unary', 'operator must either be binary or unary');
                opObj[unwrapSyntax(term.type)] = {
                    fn: opDefinition,
                    prec: term.prec.token.value,
                    assoc: term.assoc ? term.assoc.token.value : null
                };
                context.env.names.set(name, true);
                context.env.set(resolvedName, opObj);
            }
            if (term.isExport) {
                if (term.name.token.type === parser.Token.Delimiter && term.name.token.value === '{}') {
                    (function (names) {
                        return names.forEach(function (name$2) {
                            mod.exports.push(name$2);
                        });
                    }(filterCommaSep(term.name.token.inner)));
                } else {
                    throwSyntaxError('visit', 'not valid export', term.name);
                }
            }
        });
        return context;
    }
    function mapCommaSep(l, f) {
        return l.map(function (stx, idx) {
            if (idx % 2 !== 0 && (stx.token.type !== parser.Token.Punctuator || stx.token.value !== ',')) {
                throwSyntaxError('import', 'expecting a comma separated list', stx);
            } else if (idx % 2 !== 0) {
                return stx;
            } else {
                return f(stx);
            }
        });
    }
    function filterCommaSep(stx) {
        return stx.filter(function (stx$2, idx) {
            if (idx % 2 !== 0 && (stx$2.token.type !== parser.Token.Punctuator || stx$2.token.value !== ',')) {
                throwSyntaxError('import', 'expecting a comma separated list', stx$2);
            } else if (idx % 2 !== 0) {
                return false;
            } else {
                return true;
            }
        });
    }
    function loadImport(imp, parent, options, context) {
        var modToImport;
        var modFullPath = resolvePath(unwrapSyntax(imp.from), parent);
        if (!availableModules.has(modFullPath)) {
            // load it
            modToImport = function (loaded) {
                return expandModule(loaded, options, context.templateMap, context.patternMap).mod;
            }(loadModule(modFullPath));
            availableModules.set(modFullPath, modToImport);
        } else {
            modToImport = availableModules.get(modFullPath);
        }
        return modToImport;
    }
    function bindImportInMod(imp, mod, modToImport, context, phase) {
        if (imp.names.token.type === parser.Token.Delimiter) {
            if (imp.names.token.inner.length === 0) {
                throwSyntaxCaseError('compileModule', 'must include names to import', imp.names);
            } else {
                var // first collect the import names and their associated bindings
                renamedNames = function (names) {
                    return names.map(function (importName) {
                        var isBase = unwrapSyntax(modToImport.lang) === 'base';
                        var inExports = _.find(modToImport.exports, function (expTerm) {
                            if (importName.token.type === parser.Token.Delimiter) {
                                return expTerm.token.type === parser.Token.Delimiter && syntaxInnerValuesEq(importName, expTerm);
                            }
                            return expTerm.token.value === importName.token.value;
                        });
                        if (!inExports && !isBase) {
                            throwSyntaxError('compile', 'the imported name `' + unwrapSyntax(importName) + '` was not exported from the module', importName);
                        }
                        var exportName, trans, exportNameStr;
                        if (!inExports) {
                            if (// case when importing from a non ES6
                                // module but not for macros so the module
                                // was not invoked and thus nothing in the
                                // context for this name
                                importName.token.type === parser.Token.Delimiter) {
                                exportNameStr = importName.map(unwrapSyntax).join('');
                            } else {
                                exportNameStr = unwrapSyntax(importName);
                            }
                            trans = null;
                        } else if (inExports.token.type === parser.Token.Delimiter) {
                            exportName = inExports.token.inner;
                            exportNameStr = exportName.map(unwrapSyntax).join('');
                            trans = getValueInEnv(exportName[0], exportName.slice(1), context, phase);
                        } else {
                            exportName = inExports;
                            exportNameStr = unwrapSyntax(exportName);
                            trans = getValueInEnv(exportName, [], context, phase);
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
                }(filterCommaSep(imp.names.token.inner));
                // set the new bindings in the context
                renamedNames.forEach(function (name) {
                    context.env.names.set(unwrapSyntax(name.renamed), true);
                    context.env.set(resolve(name.renamed, phase), name.trans);
                    if (// setup a reverse map from each import name to
                        // the import term but only for runtime values
                        name.trans === null || name.trans && name.trans.value) {
                        var resolvedName = resolve(name.renamed, phase);
                        var origName = resolve(name.original, phase);
                        context.implicitImport.set(resolvedName, imp);
                    }
                    mod.body = mod.body.map(function (stx) {
                        return stx.imported(name.original, name.name, phase);
                    });
                });
                imp.names = syn.makeDelim('{}', joinSyntax(renamedNames.map(function (name) {
                    return name.renamed;
                }), syn.makePunc(',', imp.names)), imp.names);
            }
        } else {
            assert(false, 'not implemented yet');
        }
    }
    function expandModule(mod, options, templateMap, patternMap, root) {
        var context = makeModuleExpanderContext(options, templateMap, patternMap, 0);
        return {
            context: context,
            mod: function (mod$2) {
                mod$2.imports.forEach(function (imp) {
                    var modToImport = loadImport(imp, mod$2, options, context);
                    if (imp.isImport) {
                        context = visit(modToImport, 0, context, options);
                    } else if (imp.isImportForMacros) {
                        context = invoke(modToImport, 1, context, options);
                        context = visit(modToImport, 1, context, options);
                    } else {
                        assert(false, 'not implemented yet');
                    }
                    var importPhase = imp.isImport ? 0 : 1;
                    bindImportInMod(imp, mod$2, modToImport, context, importPhase);
                });
                return expandTermTreeToFinal(mod$2, context);
            }(collectImports(mod, context))
        };
    }
    function filterCompileNames(stx, context) {
        assert(stx.token.type === parser.Token.Delimiter, 'must be a delimter');
        var runtimeNames = function (names) {
            return names.filter(function (name) {
                if (name.token.type === parser.Token.Delimiter) {
                    return !nameInEnv(name.token.inner[0], name.token.inner.slice(1), context, 0);
                } else {
                    return !nameInEnv(name, [], context, 0);
                }
            });
        }(filterCommaSep(stx.token.inner));
        var newInner = runtimeNames.reduce(function (acc, name, idx, orig) {
            acc.push(name);
            if (orig.length - 1 !== idx) {
                // don't add trailing comma
                acc.push(syn.makePunc(',', name));
            }
            return acc;
        }, []);
        return syn.makeDelim('{}', newInner, stx);
    }
    function compileModule(mod, options, templateMap, patternMap, root) {
        var expanded = expandModule(mod, options, templateMap, patternMap, root);
        var imports = expanded.mod.imports.reduce(function (acc, imp) {
            if (imp.isImportForMacros) {
                return acc;
            }
            if (imp.names.token.type === parser.Token.Delimiter) {
                imp.names = filterCompileNames(imp.names, expanded.context);
                if (imp.names.token.inner.length === 0) {
                    return acc;
                }
                return acc.concat(flatten(imp.destruct(expanded.context).concat(syn.makePunc(';', imp.names))));
            } else {
                assert(false, 'not implemented yet');
            }
        }, []);
        var output = expanded.mod.body.reduce(function (acc, term) {
            if (// only compile export forms with runtime names
                term.isExport) {
                if (term.name.token.type === parser.Token.Delimiter) {
                    term.name = filterCompileNames(term.name, expanded.context);
                    if (term.name.token.inner.length === 0) {
                        return acc;
                    }
                } else {
                    assert(false, 'not implemented yet');
                }
            }
            return acc.concat(term.destruct(expanded.context, { stripCompileTerm: true }));
        }, []);
        var importsToAdd = [];
        output = function (output$2) {
            return function (output$3) {
                return importsToAdd.concat(output$3);
            }(output$2.map(function (stx) {
                var name = resolve(stx, 0);
                if (expanded.context.implicitImport.has(name)) {
                    var imp = expanded.context.implicitImport.get(name);
                    importsToAdd = importsToAdd.concat(flatten(imp.destruct(expanded.context)));
                }
                return stx;
            }));
        }(flatten(output));
        return imports.concat(output);
    }
    function compile(stx, options) {
        var fs = require('fs');
        var filename = options && typeof options.filename !== 'undefined' ? fs.realpathSync(options.filename) : '(anonymous module)';
        maxExpands = Infinity;
        expandCount = 0;
        var mod = createModule(filename, stx);
        var // the template map right now is global for every module
        templateMap = new StringMap();
        var patternMap = new StringMap();
        // todo: this is a little bit of a hack, since both the
        // templateMap and patternMap must be persisted between calls
        // to compile we need to throw away any work done on the
        // availableModules between calls to compile. The better
        // solution is to not store stuff in a template/patternMap
        availableModules = new StringMap();
        return compileModule(mod, options, templateMap, patternMap);
    }
    function loadModuleExports(stx, newEnv, exports$3, oldEnv) {
        return _.reduce(exports$3, function (acc, param) {
            var newName = fresh();
            var transformer = oldEnv.get(resolve(param.oldExport));
            if (transformer) {
                newEnv.set(resolve(param.newParam.rename(param.newParam, newName)), transformer);
                return acc.rename(param.newParam, newName);
            } else {
                return acc;
            }
        }, stx);
    }
    function flatten(stx) {
        return _.reduce(stx, function (acc, stx$2) {
            if (stx$2.token.type === parser.Token.Delimiter) {
                var openParen = syntaxFromToken({
                    type: parser.Token.Punctuator,
                    value: stx$2.token.value[0],
                    range: stx$2.token.startRange,
                    sm_range: typeof stx$2.token.sm_startRange == 'undefined' ? stx$2.token.startRange : stx$2.token.sm_startRange,
                    lineNumber: stx$2.token.startLineNumber,
                    sm_lineNumber: typeof stx$2.token.sm_startLineNumber == 'undefined' ? stx$2.token.startLineNumber : stx$2.token.sm_startLineNumber,
                    lineStart: stx$2.token.startLineStart,
                    sm_lineStart: typeof stx$2.token.sm_startLineStart == 'undefined' ? stx$2.token.startLineStart : stx$2.token.sm_startLineStart
                }, stx$2);
                var closeParen = syntaxFromToken({
                    type: parser.Token.Punctuator,
                    value: stx$2.token.value[1],
                    range: stx$2.token.endRange,
                    sm_range: typeof stx$2.token.sm_endRange == 'undefined' ? stx$2.token.endRange : stx$2.token.sm_endRange,
                    lineNumber: stx$2.token.endLineNumber,
                    sm_lineNumber: typeof stx$2.token.sm_endLineNumber == 'undefined' ? stx$2.token.endLineNumber : stx$2.token.sm_endLineNumber,
                    lineStart: stx$2.token.endLineStart,
                    sm_lineStart: typeof stx$2.token.sm_endLineStart == 'undefined' ? stx$2.token.endLineStart : stx$2.token.sm_endLineStart
                }, stx$2);
                if (stx$2.token.leadingComments) {
                    openParen.token.leadingComments = stx$2.token.leadingComments;
                }
                if (stx$2.token.trailingComments) {
                    openParen.token.trailingComments = stx$2.token.trailingComments;
                }
                acc.push(openParen);
                push.apply(acc, flatten(stx$2.token.inner));
                acc.push(closeParen);
                return acc;
            }
            stx$2.token.sm_lineNumber = typeof stx$2.token.sm_lineNumber != 'undefined' ? stx$2.token.sm_lineNumber : stx$2.token.lineNumber;
            stx$2.token.sm_lineStart = typeof stx$2.token.sm_lineStart != 'undefined' ? stx$2.token.sm_lineStart : stx$2.token.lineStart;
            stx$2.token.sm_range = typeof stx$2.token.sm_range != 'undefined' ? stx$2.token.sm_range : stx$2.token.range;
            acc.push(stx$2);
            return acc;
        }, []);
    }
    exports$2.StringMap = StringMap;
    exports$2.enforest = enforest;
    exports$2.expand = expandTopLevel;
    exports$2.compileModule = compile;
    exports$2.resolve = resolve;
    exports$2.get_expression = get_expression;
    exports$2.getName = getName;
    exports$2.getValueInEnv = getValueInEnv;
    exports$2.nameInEnv = nameInEnv;
    exports$2.makeExpanderContext = makeExpanderContext;
    exports$2.Expr = Expr;
    exports$2.VariableStatement = VariableStatement;
    exports$2.tokensToSyntax = syn.tokensToSyntax;
    exports$2.syntaxToTokens = syn.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map