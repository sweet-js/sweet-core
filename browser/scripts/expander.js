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
(function (root$240, factory$241) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$241(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'es6-collections',
            'scopedEval',
            'patterns'
        ], factory$241);
    }
}(this, function (exports$242, _$243, parser$244, syn$245, es6$246, se$247, patternModule$248, gen$249) {
    'use strict';
    var codegen$250 = gen$249 || escodegen;
    var assert$251 = syn$245.assert;
    var throwSyntaxError$252 = syn$245.throwSyntaxError;
    var unwrapSyntax$253 = syn$245.unwrapSyntax;
    // used to export "private" methods for unit testing
    exports$242._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$430 = Object.create(this);
                if (typeof o$430.construct === 'function') {
                    o$430.construct.apply(o$430, arguments);
                }
                return o$430;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$431) {
                var result$432 = Object.create(this);
                for (var prop$433 in properties$431) {
                    if (properties$431.hasOwnProperty(prop$433)) {
                        result$432[prop$433] = properties$431[prop$433];
                    }
                }
                return result$432;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$434) {
                function F$435() {
                }
                F$435.prototype = proto$434;
                return this instanceof F$435;
            },
            enumerable: false,
            writable: true
        }
    });
    var scopedEval$352 = se$247.scopedEval;
    var Rename$353 = syn$245.Rename;
    var Mark$354 = syn$245.Mark;
    var Var$355 = syn$245.Var;
    var Def$356 = syn$245.Def;
    var isDef$357 = syn$245.isDef;
    var isMark$358 = syn$245.isMark;
    var isRename$359 = syn$245.isRename;
    var syntaxFromToken$360 = syn$245.syntaxFromToken;
    var joinSyntax$361 = syn$245.joinSyntax;
    var builtinMode$362 = false;
    var expandCount$363 = 0;
    var maxExpands$364;
    function remdup$365(mark$436, mlist$437) {
        if (mark$436 === _$243.first(mlist$437)) {
            return _$243.rest(mlist$437, 1);
        }
        return [mark$436].concat(mlist$437);
    }
    // (CSyntax) -> [...Num]
    function marksof$366(ctx$438, stopName$439, originalName$440) {
        var mark$441, submarks$442;
        if (isMark$358(ctx$438)) {
            mark$441 = ctx$438.mark;
            submarks$442 = marksof$366(ctx$438.context, stopName$439, originalName$440);
            return remdup$365(mark$441, submarks$442);
        }
        if (isDef$357(ctx$438)) {
            return marksof$366(ctx$438.context, stopName$439, originalName$440);
        }
        if (isRename$359(ctx$438)) {
            if (stopName$439 === originalName$440 + '$' + ctx$438.name) {
                return [];
            }
            return marksof$366(ctx$438.context, stopName$439, originalName$440);
        }
        return [];
    }
    function resolve$367(stx$443) {
        return resolveCtx$371(stx$443.token.value, stx$443.context, [], []);
    }
    function arraysEqual$368(a$444, b$445) {
        if (a$444.length !== b$445.length) {
            return false;
        }
        for (var i$446 = 0; i$446 < a$444.length; i$446++) {
            if (a$444[i$446] !== b$445[i$446]) {
                return false;
            }
        }
        return true;
    }
    function renames$369(defctx$447, oldctx$448, originalName$449) {
        var acc$450 = oldctx$448;
        for (var i$451 = 0; i$451 < defctx$447.length; i$451++) {
            if (defctx$447[i$451].id.token.value === originalName$449) {
                acc$450 = Rename$353(defctx$447[i$451].id, defctx$447[i$451].name, acc$450, defctx$447);
            }
        }
        return acc$450;
    }
    function unionEl$370(arr$452, el$453) {
        if (arr$452.indexOf(el$453) === -1) {
            var res$454 = arr$452.slice(0);
            res$454.push(el$453);
            return res$454;
        }
        return arr$452;
    }
    // (Syntax) -> String
    function resolveCtx$371(originalName$455, ctx$456, stop_spine$457, stop_branch$458) {
        if (isMark$358(ctx$456)) {
            return resolveCtx$371(originalName$455, ctx$456.context, stop_spine$457, stop_branch$458);
        }
        if (isDef$357(ctx$456)) {
            if (stop_spine$457.indexOf(ctx$456.defctx) !== -1) {
                return resolveCtx$371(originalName$455, ctx$456.context, stop_spine$457, stop_branch$458);
            } else {
                return resolveCtx$371(originalName$455, renames$369(ctx$456.defctx, ctx$456.context, originalName$455), stop_spine$457, unionEl$370(stop_branch$458, ctx$456.defctx));
            }
        }
        if (isRename$359(ctx$456)) {
            if (originalName$455 === ctx$456.id.token.value) {
                var idName$459 = resolveCtx$371(ctx$456.id.token.value, ctx$456.id.context, stop_branch$458, stop_branch$458);
                var subName$460 = resolveCtx$371(originalName$455, ctx$456.context, unionEl$370(stop_spine$457, ctx$456.def), stop_branch$458);
                if (idName$459 === subName$460) {
                    var idMarks$461 = marksof$366(ctx$456.id.context, originalName$455 + '$' + ctx$456.name, originalName$455);
                    var subMarks$462 = marksof$366(ctx$456.context, originalName$455 + '$' + ctx$456.name, originalName$455);
                    if (arraysEqual$368(idMarks$461, subMarks$462)) {
                        return originalName$455 + '$' + ctx$456.name;
                    }
                }
            }
            return resolveCtx$371(originalName$455, ctx$456.context, stop_spine$457, stop_branch$458);
        }
        return originalName$455;
    }
    var nextFresh$372 = 0;
    // fun () -> Num
    function fresh$373() {
        return nextFresh$372++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$374(towrap$463, delimSyntax$464) {
        assert$251(delimSyntax$464.token.type === parser$244.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$360({
            type: parser$244.Token.Delimiter,
            value: delimSyntax$464.token.value,
            inner: towrap$463,
            range: delimSyntax$464.token.range,
            startLineNumber: delimSyntax$464.token.startLineNumber,
            lineStart: delimSyntax$464.token.lineStart
        }, delimSyntax$464);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$375(argSyntax$465) {
        if (argSyntax$465.token.type === parser$244.Token.Delimiter) {
            return _$243.filter(argSyntax$465.token.inner, function (stx$466) {
                return stx$466.token.value !== ',';
            });
        } else if (argSyntax$465.token.type === parser$244.Token.Identifier) {
            return [argSyntax$465];
        } else {
            assert$251(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$376 = {
            destruct: function () {
                return _$243.reduce(this.properties, _$243.bind(function (acc$467, prop$468) {
                    if (this[prop$468] && this[prop$468].hasPrototype(TermTree$376)) {
                        return acc$467.concat(this[prop$468].destruct());
                    } else if (this[prop$468] && this[prop$468].token && this[prop$468].token.inner) {
                        this[prop$468].token.inner = _$243.reduce(this[prop$468].token.inner, function (acc$469, t$470) {
                            if (t$470.hasPrototype(TermTree$376)) {
                                return acc$469.concat(t$470.destruct());
                            }
                            return acc$469.concat(t$470);
                        }, []);
                        return acc$467.concat(this[prop$468]);
                    } else if (Array.isArray(this[prop$468])) {
                        return acc$467.concat(_$243.reduce(this[prop$468], function (acc$471, t$472) {
                            if (t$472.hasPrototype(TermTree$376)) {
                                return acc$471.concat(t$472.destruct());
                            }
                            return acc$471.concat(t$472);
                        }, []));
                    } else if (this[prop$468]) {
                        return acc$467.concat(this[prop$468]);
                    } else {
                        return acc$467;
                    }
                }, this), []);
            },
            addDefCtx: function (def$473) {
                for (var i$474 = 0; i$474 < this.properties.length; i$474++) {
                    var prop$475 = this.properties[i$474];
                    if (Array.isArray(this[prop$475])) {
                        this[prop$475] = _$243.map(this[prop$475], function (item$476) {
                            return item$476.addDefCtx(def$473);
                        });
                    } else if (this[prop$475]) {
                        this[prop$475] = this[prop$475].addDefCtx(def$473);
                    }
                }
                return this;
            },
            rename: function (id$477, name$478) {
                for (var i$479 = 0; i$479 < this.properties.length; i$479++) {
                    var prop$480 = this.properties[i$479];
                    if (Array.isArray(this[prop$480])) {
                        this[prop$480] = _$243.map(this[prop$480], function (item$481) {
                            return item$481.rename(id$477, name$478);
                        });
                    } else if (this[prop$480]) {
                        this[prop$480] = this[prop$480].rename(id$477, name$478);
                    }
                }
                return this;
            }
        };
    var EOF$377 = TermTree$376.extend({
            properties: ['eof'],
            construct: function (e$482) {
                this.eof = e$482;
            }
        });
    var Statement$378 = TermTree$376.extend({
            construct: function () {
            }
        });
    var Expr$379 = Statement$378.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$380 = Expr$379.extend({
            construct: function () {
            }
        });
    var ThisExpression$381 = PrimaryExpression$380.extend({
            properties: ['this'],
            construct: function (that$483) {
                this.this = that$483;
            }
        });
    var Lit$382 = PrimaryExpression$380.extend({
            properties: ['lit'],
            construct: function (l$484) {
                this.lit = l$484;
            }
        });
    exports$242._test.PropertyAssignment = PropertyAssignment$383;
    var PropertyAssignment$383 = TermTree$376.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$485, assignment$486) {
                this.propName = propName$485;
                this.assignment = assignment$486;
            }
        });
    var Block$384 = PrimaryExpression$380.extend({
            properties: ['body'],
            construct: function (body$487) {
                this.body = body$487;
            }
        });
    var ArrayLiteral$385 = PrimaryExpression$380.extend({
            properties: ['array'],
            construct: function (ar$488) {
                this.array = ar$488;
            }
        });
    var ParenExpression$386 = PrimaryExpression$380.extend({
            properties: ['expr'],
            construct: function (expr$489) {
                this.expr = expr$489;
            }
        });
    var UnaryOp$387 = Expr$379.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$490, expr$491) {
                this.op = op$490;
                this.expr = expr$491;
            }
        });
    var PostfixOp$388 = Expr$379.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$492, op$493) {
                this.expr = expr$492;
                this.op = op$493;
            }
        });
    var BinOp$389 = Expr$379.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$494, left$495, right$496) {
                this.op = op$494;
                this.left = left$495;
                this.right = right$496;
            }
        });
    var ConditionalExpression$390 = Expr$379.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$497, question$498, tru$499, colon$500, fls$501) {
                this.cond = cond$497;
                this.question = question$498;
                this.tru = tru$499;
                this.colon = colon$500;
                this.fls = fls$501;
            }
        });
    var Keyword$391 = TermTree$376.extend({
            properties: ['keyword'],
            construct: function (k$502) {
                this.keyword = k$502;
            }
        });
    var Punc$392 = TermTree$376.extend({
            properties: ['punc'],
            construct: function (p$503) {
                this.punc = p$503;
            }
        });
    var Delimiter$393 = TermTree$376.extend({
            properties: ['delim'],
            construct: function (d$504) {
                this.delim = d$504;
            }
        });
    var Id$394 = PrimaryExpression$380.extend({
            properties: ['id'],
            construct: function (id$505) {
                this.id = id$505;
            }
        });
    var NamedFun$395 = Expr$379.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$506, star$507, name$508, params$509, body$510) {
                this.keyword = keyword$506;
                this.star = star$507;
                this.name = name$508;
                this.params = params$509;
                this.body = body$510;
            }
        });
    var AnonFun$396 = Expr$379.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$511, star$512, params$513, body$514) {
                this.keyword = keyword$511;
                this.star = star$512;
                this.params = params$513;
                this.body = body$514;
            }
        });
    var ArrowFun$397 = Expr$379.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$515, arrow$516, body$517) {
                this.params = params$515;
                this.arrow = arrow$516;
                this.body = body$517;
            }
        });
    var LetMacro$398 = TermTree$376.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$518, body$519) {
                this.name = name$518;
                this.body = body$519;
            }
        });
    var Macro$399 = TermTree$376.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$520, body$521) {
                this.name = name$520;
                this.body = body$521;
            }
        });
    var AnonMacro$400 = TermTree$376.extend({
            properties: ['body'],
            construct: function (body$522) {
                this.body = body$522;
            }
        });
    var Const$401 = Expr$379.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$523, call$524) {
                this.newterm = newterm$523;
                this.call = call$524;
            }
        });
    var Call$402 = Expr$379.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                assert$251(this.fun.hasPrototype(TermTree$376), 'expecting a term tree in destruct of call');
                var that$525 = this;
                this.delim = syntaxFromToken$360(_$243.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$243.reduce(this.args, function (acc$526, term$527) {
                    assert$251(term$527 && term$527.hasPrototype(TermTree$376), 'expecting term trees in destruct of Call');
                    var dst$528 = acc$526.concat(term$527.destruct());
                    // add all commas except for the last one
                    if (that$525.commas.length > 0) {
                        dst$528 = dst$528.concat(that$525.commas.shift());
                    }
                    return dst$528;
                }, []);
                return this.fun.destruct().concat(Delimiter$393.create(this.delim).destruct());
            },
            construct: function (funn$529, args$530, delim$531, commas$532) {
                assert$251(Array.isArray(args$530), 'requires an array of arguments terms');
                this.fun = funn$529;
                this.args = args$530;
                this.delim = delim$531;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$532;
            }
        });
    var ObjDotGet$403 = Expr$379.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$533, dot$534, right$535) {
                this.left = left$533;
                this.dot = dot$534;
                this.right = right$535;
            }
        });
    var ObjGet$404 = Expr$379.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$536, right$537) {
                this.left = left$536;
                this.right = right$537;
            }
        });
    var VariableDeclaration$405 = TermTree$376.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$538, eqstx$539, init$540, comma$541) {
                this.ident = ident$538;
                this.eqstx = eqstx$539;
                this.init = init$540;
                this.comma = comma$541;
            }
        });
    var VariableStatement$406 = Statement$378.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$243.reduce(this.decls, function (acc$542, decl$543) {
                    return acc$542.concat(decl$543.destruct());
                }, []));
            },
            construct: function (varkw$544, decls$545) {
                assert$251(Array.isArray(decls$545), 'decls must be an array');
                this.varkw = varkw$544;
                this.decls = decls$545;
            }
        });
    var LetStatement$407 = Statement$378.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$243.reduce(this.decls, function (acc$546, decl$547) {
                    return acc$546.concat(decl$547.destruct());
                }, []));
            },
            construct: function (letkw$548, decls$549) {
                assert$251(Array.isArray(decls$549), 'decls must be an array');
                this.letkw = letkw$548;
                this.decls = decls$549;
            }
        });
    var ConstStatement$408 = Statement$378.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$243.reduce(this.decls, function (acc$550, decl$551) {
                    return acc$550.concat(decl$551.destruct());
                }, []));
            },
            construct: function (constkw$552, decls$553) {
                assert$251(Array.isArray(decls$553), 'decls must be an array');
                this.constkw = constkw$552;
                this.decls = decls$553;
            }
        });
    var CatchClause$409 = Statement$378.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$554, params$555, body$556) {
                this.catchkw = catchkw$554;
                this.params = params$555;
                this.body = body$556;
            }
        });
    var Module$410 = TermTree$376.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$557) {
                this.body = body$557;
                this.exports = [];
            }
        });
    var Empty$411 = Statement$378.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$412 = TermTree$376.extend({
            properties: ['name'],
            construct: function (name$558) {
                this.name = name$558;
            }
        });
    var ForStatement$413 = Statement$378.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$559, cond$560) {
                this.forkw = forkw$559;
                this.cond = cond$560;
            }
        });
    function stxIsUnaryOp$414(stx$561) {
        var staticOperators$562 = [
                '+',
                '-',
                '~',
                '!',
                'delete',
                'void',
                'typeof',
                '++',
                '--'
            ];
        return _$243.contains(staticOperators$562, unwrapSyntax$253(stx$561));
    }
    function stxIsBinOp$415(stx$563) {
        var staticOperators$564 = [
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
        return _$243.contains(staticOperators$564, unwrapSyntax$253(stx$563));
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$416(stx$565, context$566, isLet$567) {
        var decls$568 = [];
        var res$569 = enforest$418(stx$565, context$566);
        var result$570 = res$569.result;
        var rest$571 = res$569.rest;
        if (rest$571[0]) {
            if (isLet$567 && result$570.hasPrototype(Id$394)) {
                var freshName$573 = fresh$373();
                var renamedId$574 = result$570.id.rename(result$570.id, freshName$573);
                rest$571 = rest$571.map(function (stx$575) {
                    return stx$575.rename(result$570.id, freshName$573);
                });
                result$570.id = renamedId$574;
            }
            var nextRes$572 = enforest$418(rest$571, context$566);
            // x = ...
            if (nextRes$572.result.hasPrototype(Punc$392) && nextRes$572.result.punc.token.value === '=') {
                var initializerRes$576 = enforest$418(nextRes$572.rest, context$566);
                // x = y + z, ...
                if (initializerRes$576.rest[0] && initializerRes$576.rest[0].token.value === ',') {
                    decls$568.push(VariableDeclaration$405.create(result$570.id, nextRes$572.result.punc, initializerRes$576.result, initializerRes$576.rest[0]));
                    var subRes$577 = enforestVarStatement$416(initializerRes$576.rest.slice(1), context$566, isLet$567);
                    decls$568 = decls$568.concat(subRes$577.result);
                    rest$571 = subRes$577.rest;
                }    // x = y ...
                else {
                    decls$568.push(VariableDeclaration$405.create(result$570.id, nextRes$572.result.punc, initializerRes$576.result));
                    rest$571 = initializerRes$576.rest;
                }
            }    // x ,...;
            else if (nextRes$572.result.hasPrototype(Punc$392) && nextRes$572.result.punc.token.value === ',') {
                decls$568.push(VariableDeclaration$405.create(result$570.id, null, null, nextRes$572.result.punc));
                var subRes$577 = enforestVarStatement$416(nextRes$572.rest, context$566, isLet$567);
                decls$568 = decls$568.concat(subRes$577.result);
                rest$571 = subRes$577.rest;
            } else {
                if (result$570.hasPrototype(Id$394)) {
                    decls$568.push(VariableDeclaration$405.create(result$570.id));
                } else {
                    throwSyntaxError$252('enforest', 'Expecting an identifier in variable declaration', rest$571);
                }
            }
        }    // x EOF
        else {
            if (result$570.hasPrototype(Id$394)) {
                decls$568.push(VariableDeclaration$405.create(result$570.id));
            } else if (result$570.hasPrototype(BinOp$389) && result$570.op.token.value === 'in') {
                decls$568.push(VariableDeclaration$405.create(result$570.left.id, result$570.op, result$570.right));
            } else {
                throwSyntaxError$252('enforest', 'Expecting an identifier in variable declaration', stx$565);
            }
        }
        return {
            result: decls$568,
            rest: rest$571
        };
    }
    function adjustLineContext$417(stx$578, original$579, current$580) {
        current$580 = current$580 || {
            lastLineNumber: original$579.token.lineNumber,
            lineNumber: original$579.token.lineNumber - 1
        };
        return _$243.map(stx$578, function (stx$581) {
            if (stx$581.token.type === parser$244.Token.Delimiter) {
                // handle tokens with missing line info
                stx$581.token.startLineNumber = typeof stx$581.token.startLineNumber == 'undefined' ? original$579.token.lineNumber : stx$581.token.startLineNumber;
                stx$581.token.endLineNumber = typeof stx$581.token.endLineNumber == 'undefined' ? original$579.token.lineNumber : stx$581.token.endLineNumber;
                stx$581.token.startLineStart = typeof stx$581.token.startLineStart == 'undefined' ? original$579.token.lineStart : stx$581.token.startLineStart;
                stx$581.token.endLineStart = typeof stx$581.token.endLineStart == 'undefined' ? original$579.token.lineStart : stx$581.token.endLineStart;
                stx$581.token.startRange = typeof stx$581.token.startRange == 'undefined' ? original$579.token.range : stx$581.token.startRange;
                stx$581.token.endRange = typeof stx$581.token.endRange == 'undefined' ? original$579.token.range : stx$581.token.endRange;
                stx$581.token.sm_startLineNumber = typeof stx$581.token.sm_startLineNumber == 'undefined' ? stx$581.token.startLineNumber : stx$581.token.sm_startLineNumber;
                stx$581.token.sm_endLineNumber = typeof stx$581.token.sm_endLineNumber == 'undefined' ? stx$581.token.endLineNumber : stx$581.token.sm_endLineNumber;
                stx$581.token.sm_startLineStart = typeof stx$581.token.sm_startLineStart == 'undefined' ? stx$581.token.startLineStart : stx$581.token.sm_startLineStart;
                stx$581.token.sm_endLineStart = typeof stx$581.token.sm_endLineStart == 'undefined' ? stx$581.token.endLineStart : stx$581.token.sm_endLineStart;
                stx$581.token.sm_startRange = typeof stx$581.token.sm_startRange == 'undefined' ? stx$581.token.startRange : stx$581.token.sm_startRange;
                stx$581.token.sm_endRange = typeof stx$581.token.sm_endRange == 'undefined' ? stx$581.token.endRange : stx$581.token.sm_endRange;
                if (stx$581.token.startLineNumber === current$580.lastLineNumber && current$580.lastLineNumber !== current$580.lineNumber) {
                    stx$581.token.startLineNumber = current$580.lineNumber;
                } else if (stx$581.token.startLineNumber !== current$580.lastLineNumber) {
                    current$580.lineNumber++;
                    current$580.lastLineNumber = stx$581.token.startLineNumber;
                    stx$581.token.startLineNumber = current$580.lineNumber;
                }
                if (stx$581.token.inner.length > 0) {
                    stx$581.token.inner = adjustLineContext$417(stx$581.token.inner, original$579, current$580);
                }
                return stx$581;
            }
            // handle tokens with missing line info
            stx$581.token.lineNumber = typeof stx$581.token.lineNumber == 'undefined' ? original$579.token.lineNumber : stx$581.token.lineNumber;
            stx$581.token.lineStart = typeof stx$581.token.lineStart == 'undefined' ? original$579.token.lineStart : stx$581.token.lineStart;
            stx$581.token.range = typeof stx$581.token.range == 'undefined' ? original$579.token.range : stx$581.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$581.token.sm_lineNumber = typeof stx$581.token.sm_lineNumber == 'undefined' ? stx$581.token.lineNumber : stx$581.token.sm_lineNumber;
            stx$581.token.sm_lineStart = typeof stx$581.token.sm_lineStart == 'undefined' ? stx$581.token.lineStart : stx$581.token.sm_lineStart;
            stx$581.token.sm_range = typeof stx$581.token.sm_range == 'undefined' ? _$243.clone(stx$581.token.range) : stx$581.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$581.token.lineNumber === current$580.lastLineNumber && current$580.lastLineNumber !== current$580.lineNumber) {
                stx$581.token.lineNumber = current$580.lineNumber;
            } else if (stx$581.token.lineNumber !== current$580.lastLineNumber) {
                current$580.lineNumber++;
                current$580.lastLineNumber = stx$581.token.lineNumber;
                stx$581.token.lineNumber = current$580.lineNumber;
            }
            return stx$581;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$418(toks$582, context$583) {
        assert$251(toks$582.length > 0, 'enforest assumes there are tokens to work with');
        function step$584(head$585, rest$586) {
            var innerTokens$587;
            assert$251(Array.isArray(rest$586), 'result must at least be an empty array');
            if (head$585.hasPrototype(TermTree$376)) {
                // function call
                var emp$590 = head$585.emp;
                var emp$590 = head$585.emp;
                var keyword$593 = head$585.keyword;
                var delim$595 = head$585.delim;
                var id$597 = head$585.id;
                var delim$595 = head$585.delim;
                var emp$590 = head$585.emp;
                var punc$601 = head$585.punc;
                var keyword$593 = head$585.keyword;
                var emp$590 = head$585.emp;
                var emp$590 = head$585.emp;
                var emp$590 = head$585.emp;
                var delim$595 = head$585.delim;
                var delim$595 = head$585.delim;
                var id$597 = head$585.id;
                var keyword$593 = head$585.keyword;
                var keyword$593 = head$585.keyword;
                var keyword$593 = head$585.keyword;
                var keyword$593 = head$585.keyword;
                var keyword$593 = head$585.keyword;
                if (head$585.hasPrototype(Expr$379) && rest$586[0] && rest$586[0].token.type === parser$244.Token.Delimiter && rest$586[0].token.value === '()') {
                    var argRes$636, enforestedArgs$637 = [], commas$638 = [];
                    rest$586[0].expose();
                    innerTokens$587 = rest$586[0].token.inner;
                    while (innerTokens$587.length > 0) {
                        argRes$636 = enforest$418(innerTokens$587, context$583);
                        enforestedArgs$637.push(argRes$636.result);
                        innerTokens$587 = argRes$636.rest;
                        if (innerTokens$587[0] && innerTokens$587[0].token.value === ',') {
                            // record the comma for later
                            commas$638.push(innerTokens$587[0]);
                            // but dump it for the next loop turn
                            innerTokens$587 = innerTokens$587.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$639 = _$243.all(enforestedArgs$637, function (argTerm$640) {
                            return argTerm$640.hasPrototype(Expr$379);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$587.length === 0 && argsAreExprs$639) {
                        return step$584(Call$402.create(head$585, enforestedArgs$637, rest$586[0], commas$638), rest$586.slice(1));
                    }
                } else if (head$585.hasPrototype(Expr$379) && rest$586[0] && unwrapSyntax$253(rest$586[0]) === '?') {
                    var question$641 = rest$586[0];
                    var condRes$642 = enforest$418(rest$586.slice(1), context$583);
                    var truExpr$643 = condRes$642.result;
                    var right$644 = condRes$642.rest;
                    if (truExpr$643.hasPrototype(Expr$379) && right$644[0] && unwrapSyntax$253(right$644[0]) === ':') {
                        var colon$645 = right$644[0];
                        var flsRes$646 = enforest$418(right$644.slice(1), context$583);
                        var flsExpr$647 = flsRes$646.result;
                        if (flsExpr$647.hasPrototype(Expr$379)) {
                            return step$584(ConditionalExpression$390.create(head$585, question$641, truExpr$643, colon$645, flsExpr$647), flsRes$646.rest);
                        }
                    }
                } else if (head$585.hasPrototype(Keyword$391) && unwrapSyntax$253(keyword$593) === 'new' && rest$586[0]) {
                    var newCallRes$648 = enforest$418(rest$586, context$583);
                    if (newCallRes$648.result.hasPrototype(Call$402)) {
                        return step$584(Const$401.create(head$585, newCallRes$648.result), newCallRes$648.rest);
                    }
                } else if (head$585.hasPrototype(Delimiter$393) && delim$595.token.value === '()' && rest$586[0] && rest$586[0].token.type === parser$244.Token.Punctuator && unwrapSyntax$253(rest$586[0]) === '=>') {
                    var res$649 = enforest$418(rest$586.slice(1), context$583);
                    if (res$649.result.hasPrototype(Expr$379)) {
                        return step$584(ArrowFun$397.create(delim$595, rest$586[0], res$649.result.destruct()), res$649.rest);
                    } else {
                        throwSyntaxError$252('enforest', 'Body of arrow function must be an expression', rest$586.slice(1));
                    }
                } else if (head$585.hasPrototype(Id$394) && rest$586[0] && rest$586[0].token.type === parser$244.Token.Punctuator && unwrapSyntax$253(rest$586[0]) === '=>') {
                    var res$649 = enforest$418(rest$586.slice(1), context$583);
                    if (res$649.result.hasPrototype(Expr$379)) {
                        return step$584(ArrowFun$397.create(id$597, rest$586[0], res$649.result.destruct()), res$649.rest);
                    } else {
                        throwSyntaxError$252('enforest', 'Body of arrow function must be an expression', rest$586.slice(1));
                    }
                } else if (head$585.hasPrototype(Delimiter$393) && delim$595.token.value === '()') {
                    innerTokens$587 = delim$595.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$587.length === 0) {
                        return step$584(ParenExpression$386.create(head$585), rest$586);
                    } else {
                        var innerTerm$650 = get_expression$419(innerTokens$587, context$583);
                        if (innerTerm$650.result && innerTerm$650.result.hasPrototype(Expr$379)) {
                            return step$584(ParenExpression$386.create(head$585), rest$586);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$585.hasPrototype(Expr$379) && rest$586[0] && rest$586[1] && stxIsBinOp$415(rest$586[0])) {
                    var op$651 = rest$586[0];
                    var left$652 = head$585;
                    var bopRes$653 = enforest$418(rest$586.slice(1), context$583);
                    var right$644 = bopRes$653.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$644.hasPrototype(Expr$379)) {
                        return step$584(BinOp$389.create(op$651, left$652, right$644), bopRes$653.rest);
                    }
                } else if (head$585.hasPrototype(Punc$392) && stxIsUnaryOp$414(punc$601)) {
                    var unopRes$654 = enforest$418(rest$586, context$583);
                    if (unopRes$654.result.hasPrototype(Expr$379)) {
                        return step$584(UnaryOp$387.create(punc$601, unopRes$654.result), unopRes$654.rest);
                    }
                } else if (head$585.hasPrototype(Keyword$391) && stxIsUnaryOp$414(keyword$593)) {
                    var unopRes$654 = enforest$418(rest$586, context$583);
                    if (unopRes$654.result.hasPrototype(Expr$379)) {
                        return step$584(UnaryOp$387.create(keyword$593, unopRes$654.result), unopRes$654.rest);
                    }
                } else if (head$585.hasPrototype(Expr$379) && rest$586[0] && (unwrapSyntax$253(rest$586[0]) === '++' || unwrapSyntax$253(rest$586[0]) === '--')) {
                    return step$584(PostfixOp$388.create(head$585, rest$586[0]), rest$586.slice(1));
                } else if (head$585.hasPrototype(Expr$379) && rest$586[0] && rest$586[0].token.value === '[]') {
                    return step$584(ObjGet$404.create(head$585, Delimiter$393.create(rest$586[0].expose())), rest$586.slice(1));
                } else if (head$585.hasPrototype(Expr$379) && rest$586[0] && unwrapSyntax$253(rest$586[0]) === '.' && rest$586[1] && rest$586[1].token.type === parser$244.Token.Identifier) {
                    return step$584(ObjDotGet$403.create(head$585, rest$586[0], rest$586[1]), rest$586.slice(2));
                } else if (head$585.hasPrototype(Delimiter$393) && delim$595.token.value === '[]') {
                    return step$584(ArrayLiteral$385.create(head$585), rest$586);
                } else if (head$585.hasPrototype(Delimiter$393) && head$585.delim.token.value === '{}') {
                    return step$584(Block$384.create(head$585), rest$586);
                } else if (head$585.hasPrototype(Id$394) && unwrapSyntax$253(id$597) === '#quoteSyntax' && rest$586[0] && rest$586[0].token.value === '{}') {
                    var tempId$655 = fresh$373();
                    context$583.templateMap.set(tempId$655, rest$586[0].token.inner);
                    return step$584(syn$245.makeIdent('getTemplate', id$597), [syn$245.makeDelim('()', [syn$245.makeValue(tempId$655, id$597)], id$597)].concat(rest$586.slice(1)));
                } else if (head$585.hasPrototype(Keyword$391) && unwrapSyntax$253(keyword$593) === 'let' && (rest$586[0] && rest$586[0].token.type === parser$244.Token.Identifier || rest$586[0] && rest$586[0].token.type === parser$244.Token.Keyword || rest$586[0] && rest$586[0].token.type === parser$244.Token.Punctuator) && rest$586[1] && unwrapSyntax$253(rest$586[1]) === '=' && rest$586[2] && rest$586[2].token.value === 'macro') {
                    var mac$656 = enforest$418(rest$586.slice(2), context$583);
                    if (!mac$656.result.hasPrototype(AnonMacro$400)) {
                        throwSyntaxError$252('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$586.slice(2));
                    }
                    return step$584(LetMacro$398.create(rest$586[0], mac$656.result.body), mac$656.rest);
                } else if (head$585.hasPrototype(Keyword$391) && unwrapSyntax$253(keyword$593) === 'var' && rest$586[0]) {
                    var vsRes$657 = enforestVarStatement$416(rest$586, context$583, false);
                    if (vsRes$657) {
                        return step$584(VariableStatement$406.create(head$585, vsRes$657.result), vsRes$657.rest);
                    }
                } else if (head$585.hasPrototype(Keyword$391) && unwrapSyntax$253(keyword$593) === 'let' && rest$586[0]) {
                    var vsRes$657 = enforestVarStatement$416(rest$586, context$583, true);
                    if (vsRes$657) {
                        return step$584(LetStatement$407.create(head$585, vsRes$657.result), vsRes$657.rest);
                    }
                } else if (head$585.hasPrototype(Keyword$391) && unwrapSyntax$253(keyword$593) === 'const' && rest$586[0]) {
                    var vsRes$657 = enforestVarStatement$416(rest$586, context$583, true);
                    if (vsRes$657) {
                        return step$584(ConstStatement$408.create(head$585, vsRes$657.result), vsRes$657.rest);
                    }
                } else if (head$585.hasPrototype(Keyword$391) && unwrapSyntax$253(keyword$593) === 'for' && rest$586[0] && rest$586[0].token.value === '()') {
                    return step$584(ForStatement$413.create(keyword$593, rest$586[0]), rest$586.slice(1));
                }
            } else {
                assert$251(head$585 && head$585.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$585.token.type === parser$244.Token.Identifier || head$585.token.type === parser$244.Token.Keyword || head$585.token.type === parser$244.Token.Punctuator) && context$583.env.has(resolve$367(head$585))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$658 = fresh$373();
                    var transformerContext$659 = makeExpanderContext$427(_$243.defaults({ mark: newMark$658 }, context$583));
                    // pull the macro transformer out the environment
                    var mac$656 = context$583.env.get(resolve$367(head$585));
                    var transformer$660 = mac$656.fn;
                    if (expandCount$363 >= maxExpands$364) {
                        return {
                            result: head$585,
                            rest: rest$586
                        };
                    } else if (!builtinMode$362 && !mac$656.builtin) {
                        expandCount$363++;
                    }
                    // apply the transformer
                    try {
                        var rt$661 = transformer$660([head$585].concat(rest$586), transformerContext$659);
                    } catch (e$662) {
                        if (e$662.type && e$662.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$663 = '`' + rest$586.slice(0, 5).map(function (stx$664) {
                                    return stx$664.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$252('macro', 'Macro `' + head$585.token.value + '` could not be matched with ' + argumentString$663, head$585);
                        } else {
                            // just rethrow it
                            throw e$662;
                        }
                    }
                    if (!Array.isArray(rt$661.result)) {
                        throwSyntaxError$252('enforest', 'Macro must return a syntax array', head$585);
                    }
                    if (rt$661.result.length > 0) {
                        var adjustedResult$665 = adjustLineContext$417(rt$661.result, head$585);
                        adjustedResult$665[0].token.leadingComments = head$585.token.leadingComments;
                        return step$584(adjustedResult$665[0], adjustedResult$665.slice(1).concat(rt$661.rest));
                    } else {
                        return step$584(Empty$411.create(), rt$661.rest);
                    }
                }    // anon macro definition
                else if (head$585.token.type === parser$244.Token.Identifier && head$585.token.value === 'macro' && rest$586[0] && rest$586[0].token.value === '{}') {
                    return step$584(AnonMacro$400.create(rest$586[0].expose().token.inner), rest$586.slice(1));
                }    // macro definition
                else if (head$585.token.type === parser$244.Token.Identifier && head$585.token.value === 'macro' && rest$586[0] && (rest$586[0].token.type === parser$244.Token.Identifier || rest$586[0].token.type === parser$244.Token.Keyword || rest$586[0].token.type === parser$244.Token.Punctuator) && rest$586[1] && rest$586[1].token.type === parser$244.Token.Delimiter && rest$586[1].token.value === '{}') {
                    return step$584(Macro$399.create(rest$586[0], rest$586[1].expose().token.inner), rest$586.slice(2));
                }    // module definition
                else if (unwrapSyntax$253(head$585) === 'module' && rest$586[0] && rest$586[0].token.value === '{}') {
                    return step$584(Module$410.create(rest$586[0]), rest$586.slice(1));
                }    // function definition
                else if (head$585.token.type === parser$244.Token.Keyword && unwrapSyntax$253(head$585) === 'function' && rest$586[0] && rest$586[0].token.type === parser$244.Token.Identifier && rest$586[1] && rest$586[1].token.type === parser$244.Token.Delimiter && rest$586[1].token.value === '()' && rest$586[2] && rest$586[2].token.type === parser$244.Token.Delimiter && rest$586[2].token.value === '{}') {
                    rest$586[1].token.inner = rest$586[1].expose().token.inner;
                    rest$586[2].token.inner = rest$586[2].expose().token.inner;
                    return step$584(NamedFun$395.create(head$585, null, rest$586[0], rest$586[1], rest$586[2]), rest$586.slice(3));
                }    // generator function definition
                else if (head$585.token.type === parser$244.Token.Keyword && unwrapSyntax$253(head$585) === 'function' && rest$586[0] && rest$586[0].token.type === parser$244.Token.Punctuator && rest$586[0].token.value === '*' && rest$586[1] && rest$586[1].token.type === parser$244.Token.Identifier && rest$586[2] && rest$586[2].token.type === parser$244.Token.Delimiter && rest$586[2].token.value === '()' && rest$586[3] && rest$586[3].token.type === parser$244.Token.Delimiter && rest$586[3].token.value === '{}') {
                    rest$586[2].token.inner = rest$586[2].expose().token.inner;
                    rest$586[3].token.inner = rest$586[3].expose().token.inner;
                    return step$584(NamedFun$395.create(head$585, rest$586[0], rest$586[1], rest$586[2], rest$586[3]), rest$586.slice(4));
                }    // anonymous function definition
                else if (head$585.token.type === parser$244.Token.Keyword && unwrapSyntax$253(head$585) === 'function' && rest$586[0] && rest$586[0].token.type === parser$244.Token.Delimiter && rest$586[0].token.value === '()' && rest$586[1] && rest$586[1].token.type === parser$244.Token.Delimiter && rest$586[1].token.value === '{}') {
                    rest$586[0].token.inner = rest$586[0].expose().token.inner;
                    rest$586[1].token.inner = rest$586[1].expose().token.inner;
                    return step$584(AnonFun$396.create(head$585, null, rest$586[0], rest$586[1]), rest$586.slice(2));
                }    // anonymous generator function definition
                else if (head$585.token.type === parser$244.Token.Keyword && unwrapSyntax$253(head$585) === 'function' && rest$586[0] && rest$586[0].token.type === parser$244.Token.Punctuator && rest$586[0].token.value === '*' && rest$586[1] && rest$586[1].token.type === parser$244.Token.Delimiter && rest$586[1].token.value === '()' && rest$586[2] && rest$586[2].token.type === parser$244.Token.Delimiter && rest$586[2].token.value === '{}') {
                    rest$586[1].token.inner = rest$586[1].expose().token.inner;
                    rest$586[2].token.inner = rest$586[2].expose().token.inner;
                    return step$584(AnonFun$396.create(head$585, rest$586[0], rest$586[1], rest$586[2]), rest$586.slice(3));
                }    // arrow function
                else if ((head$585.token.type === parser$244.Token.Delimiter && head$585.token.value === '()' || head$585.token.type === parser$244.Token.Identifier) && rest$586[0] && rest$586[0].token.type === parser$244.Token.Punctuator && rest$586[0].token.value === '=>' && rest$586[1] && rest$586[1].token.type === parser$244.Token.Delimiter && rest$586[1].token.value === '{}') {
                    return step$584(ArrowFun$397.create(head$585, rest$586[0], rest$586[1]), rest$586.slice(2));
                }    // catch statement
                else if (head$585.token.type === parser$244.Token.Keyword && unwrapSyntax$253(head$585) === 'catch' && rest$586[0] && rest$586[0].token.type === parser$244.Token.Delimiter && rest$586[0].token.value === '()' && rest$586[1] && rest$586[1].token.type === parser$244.Token.Delimiter && rest$586[1].token.value === '{}') {
                    rest$586[0].token.inner = rest$586[0].expose().token.inner;
                    rest$586[1].token.inner = rest$586[1].expose().token.inner;
                    return step$584(CatchClause$409.create(head$585, rest$586[0], rest$586[1]), rest$586.slice(2));
                }    // this expression
                else if (head$585.token.type === parser$244.Token.Keyword && unwrapSyntax$253(head$585) === 'this') {
                    return step$584(ThisExpression$381.create(head$585), rest$586);
                }    // literal
                else if (head$585.token.type === parser$244.Token.NumericLiteral || head$585.token.type === parser$244.Token.StringLiteral || head$585.token.type === parser$244.Token.BooleanLiteral || head$585.token.type === parser$244.Token.RegularExpression || head$585.token.type === parser$244.Token.NullLiteral) {
                    return step$584(Lit$382.create(head$585), rest$586);
                }    // export
                else if (head$585.token.type === parser$244.Token.Keyword && unwrapSyntax$253(head$585) === 'export' && rest$586[0] && (rest$586[0].token.type === parser$244.Token.Identifier || rest$586[0].token.type === parser$244.Token.Keyword || rest$586[0].token.type === parser$244.Token.Punctuator)) {
                    return step$584(Export$412.create(rest$586[0]), rest$586.slice(1));
                }    // identifier
                else if (head$585.token.type === parser$244.Token.Identifier) {
                    return step$584(Id$394.create(head$585), rest$586);
                }    // punctuator
                else if (head$585.token.type === parser$244.Token.Punctuator) {
                    return step$584(Punc$392.create(head$585), rest$586);
                } else if (head$585.token.type === parser$244.Token.Keyword && unwrapSyntax$253(head$585) === 'with') {
                    throwSyntaxError$252('enforest', 'with is not supported in sweet.js', head$585);
                }    // keyword
                else if (head$585.token.type === parser$244.Token.Keyword) {
                    return step$584(Keyword$391.create(head$585), rest$586);
                }    // Delimiter
                else if (head$585.token.type === parser$244.Token.Delimiter) {
                    return step$584(Delimiter$393.create(head$585.expose()), rest$586);
                }    // end of file
                else if (head$585.token.type === parser$244.Token.EOF) {
                    assert$251(rest$586.length === 0, 'nothing should be after an EOF');
                    return step$584(EOF$377.create(head$585), []);
                } else {
                    // todo: are we missing cases?
                    assert$251(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$585,
                rest: rest$586
            };
        }
        return step$584(toks$582[0], toks$582.slice(1));
    }
    function get_expression$419(stx$666, context$667) {
        var res$668 = enforest$418(stx$666, context$667);
        if (!res$668.result.hasPrototype(Expr$379)) {
            return {
                result: null,
                rest: stx$666
            };
        }
        return res$668;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$420(newMark$669, env$670) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$671(match$672) {
            if (match$672.level === 0) {
                // replace the match property with the marked syntax
                match$672.match = _$243.map(match$672.match, function (stx$673) {
                    return stx$673.mark(newMark$669);
                });
            } else {
                _$243.each(match$672.match, function (match$674) {
                    dfs$671(match$674);
                });
            }
        }
        _$243.keys(env$670).forEach(function (key$675) {
            dfs$671(env$670[key$675]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$421(mac$676, context$677) {
        var body$678 = mac$676.body;
        // raw function primitive form
        if (!(body$678[0] && body$678[0].token.type === parser$244.Token.Keyword && body$678[0].token.value === 'function')) {
            throwSyntaxError$252('load macro', 'Primitive macro form must contain a function for the macro body', body$678);
        }
        var stub$679 = parser$244.read('()');
        stub$679[0].token.inner = body$678;
        var expanded$680 = expand$426(stub$679, context$677);
        expanded$680 = expanded$680[0].destruct().concat(expanded$680[1].eof);
        var flattend$681 = flatten$429(expanded$680);
        var bodyCode$682 = codegen$250.generate(parser$244.parse(flattend$681));
        var macroFn$683 = scopedEval$352(bodyCode$682, {
                makeValue: syn$245.makeValue,
                makeRegex: syn$245.makeRegex,
                makeIdent: syn$245.makeIdent,
                makeKeyword: syn$245.makeKeyword,
                makePunc: syn$245.makePunc,
                makeDelim: syn$245.makeDelim,
                unwrapSyntax: syn$245.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$252,
                prettyPrint: syn$245.prettyPrint,
                parser: parser$244,
                __fresh: fresh$373,
                _: _$243,
                patternModule: patternModule$248,
                getTemplate: function (id$684) {
                    return cloneSyntaxArray$422(context$677.templateMap.get(id$684));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$420,
                mergeMatches: function (newMatch$685, oldMatch$686) {
                    newMatch$685.patternEnv = _$243.extend({}, oldMatch$686.patternEnv, newMatch$685.patternEnv);
                    return newMatch$685;
                }
            });
        return macroFn$683;
    }
    function cloneSyntaxArray$422(arr$687) {
        return arr$687.map(function (stx$688) {
            var o$689 = syntaxFromToken$360(_$243.clone(stx$688.token), stx$688);
            if (o$689.token.type === parser$244.Token.Delimiter) {
                o$689.token.inner = cloneSyntaxArray$422(o$689.token.inner);
            }
            return o$689;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$423(stx$690, context$691) {
        assert$251(context$691, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$690.length === 0) {
            return {
                terms: [],
                context: context$691
            };
        }
        assert$251(stx$690[0].token, 'expecting a syntax object');
        var f$692 = enforest$418(stx$690, context$691);
        // head :: TermTree
        var head$693 = f$692.result;
        // rest :: [Syntax]
        var rest$694 = f$692.rest;
        if (head$693.hasPrototype(Macro$399) && expandCount$363 < maxExpands$364) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$696 = loadMacroDef$421(head$693, context$691);
            addToDefinitionCtx$424([head$693.name], context$691.defscope, false);
            context$691.env.set(resolve$367(head$693.name), {
                fn: macroDefinition$696,
                builtin: builtinMode$362
            });
            return expandToTermTree$423(rest$694, context$691);
        }
        if (head$693.hasPrototype(LetMacro$398) && expandCount$363 < maxExpands$364) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$696 = loadMacroDef$421(head$693, context$691);
            var freshName$697 = fresh$373();
            var renamedName$698 = head$693.name.rename(head$693.name, freshName$697);
            rest$694 = _$243.map(rest$694, function (stx$699) {
                return stx$699.rename(head$693.name, freshName$697);
            });
            head$693.name = renamedName$698;
            context$691.env.set(resolve$367(head$693.name), {
                fn: macroDefinition$696,
                builtin: builtinMode$362
            });
            return expandToTermTree$423(rest$694, context$691);
        }
        if (head$693.hasPrototype(NamedFun$395)) {
            addToDefinitionCtx$424([head$693.name], context$691.defscope, true);
        }
        if (head$693.hasPrototype(VariableStatement$406)) {
            addToDefinitionCtx$424(_$243.map(head$693.decls, function (decl$700) {
                return decl$700.ident;
            }), context$691.defscope, true);
        }
        if (head$693.hasPrototype(Block$384) && head$693.body.hasPrototype(Delimiter$393)) {
            head$693.body.delim.token.inner.forEach(function (term$701) {
                if (term$701.hasPrototype(VariableStatement$406)) {
                    addToDefinitionCtx$424(_$243.map(term$701.decls, function (decl$702) {
                        return decl$702.ident;
                    }), context$691.defscope, true);
                }
            });
        }
        if (head$693.hasPrototype(Delimiter$393)) {
            head$693.delim.token.inner.forEach(function (term$703) {
                if (term$703.hasPrototype(VariableStatement$406)) {
                    addToDefinitionCtx$424(_$243.map(term$703.decls, function (decl$704) {
                        return decl$704.ident;
                    }), context$691.defscope, true);
                }
            });
        }
        if (head$693.hasPrototype(ForStatement$413)) {
            head$693.cond.expose();
            var forCond$705 = head$693.cond.token.inner;
            if (forCond$705[0] && resolve$367(forCond$705[0]) === 'let' && forCond$705[1] && forCond$705[1].token.type === parser$244.Token.Identifier) {
                var letNew$706 = fresh$373();
                var letId$707 = forCond$705[1];
                forCond$705 = forCond$705.map(function (stx$708) {
                    return stx$708.rename(letId$707, letNew$706);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$693.cond.token.inner = expand$426([forCond$705[0]], context$691).concat(expand$426(forCond$705.slice(1), context$691));
                // nice and easy case: `for (...) { ... }`
                if (rest$694[0] && rest$694[0].token.value === '{}') {
                    rest$694[0] = rest$694[0].rename(letId$707, letNew$706);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$709 = enforest$418(rest$694, context$691);
                    var renamedBodyTerm$710 = bodyEnf$709.result.rename(letId$707, letNew$706);
                    var forTrees$711 = expandToTermTree$423(bodyEnf$709.rest, context$691);
                    return {
                        terms: [
                            head$693,
                            renamedBodyTerm$710
                        ].concat(forTrees$711.terms),
                        context: forTrees$711.context
                    };
                }
            } else {
                head$693.cond.token.inner = expand$426(head$693.cond.token.inner, context$691);
            }
        }
        var trees$695 = expandToTermTree$423(rest$694, context$691);
        return {
            terms: [head$693].concat(trees$695.terms),
            context: trees$695.context
        };
    }
    function addToDefinitionCtx$424(idents$712, defscope$713, skipRep$714) {
        assert$251(idents$712 && idents$712.length > 0, 'expecting some variable identifiers');
        skipRep$714 = skipRep$714 || false;
        _$243.each(idents$712, function (id$715) {
            var skip$716 = false;
            if (skipRep$714) {
                var declRepeat$717 = _$243.find(defscope$713, function (def$718) {
                        return def$718.id.token.value === id$715.token.value && arraysEqual$368(marksof$366(def$718.id.context), marksof$366(id$715.context));
                    });
                skip$716 = typeof declRepeat$717 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$716) {
                var name$719 = fresh$373();
                defscope$713.push({
                    id: id$715,
                    name: name$719
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$425(term$720, context$721) {
        assert$251(context$721 && context$721.env, 'environment map is required');
        if (term$720.hasPrototype(ArrayLiteral$385)) {
            term$720.array.delim.token.inner = expand$426(term$720.array.delim.expose().token.inner, context$721);
            return term$720;
        } else if (term$720.hasPrototype(Block$384)) {
            term$720.body.delim.token.inner = expand$426(term$720.body.delim.expose().token.inner, context$721);
            return term$720;
        } else if (term$720.hasPrototype(ParenExpression$386)) {
            term$720.expr.delim.token.inner = expand$426(term$720.expr.delim.expose().token.inner, context$721);
            return term$720;
        } else if (term$720.hasPrototype(Call$402)) {
            term$720.fun = expandTermTreeToFinal$425(term$720.fun, context$721);
            term$720.args = _$243.map(term$720.args, function (arg$722) {
                return expandTermTreeToFinal$425(arg$722, context$721);
            });
            return term$720;
        } else if (term$720.hasPrototype(UnaryOp$387)) {
            term$720.expr = expandTermTreeToFinal$425(term$720.expr, context$721);
            return term$720;
        } else if (term$720.hasPrototype(BinOp$389)) {
            term$720.left = expandTermTreeToFinal$425(term$720.left, context$721);
            term$720.right = expandTermTreeToFinal$425(term$720.right, context$721);
            return term$720;
        } else if (term$720.hasPrototype(ObjGet$404)) {
            term$720.right.delim.token.inner = expand$426(term$720.right.delim.expose().token.inner, context$721);
            return term$720;
        } else if (term$720.hasPrototype(ObjDotGet$403)) {
            term$720.left = expandTermTreeToFinal$425(term$720.left, context$721);
            term$720.right = expandTermTreeToFinal$425(term$720.right, context$721);
            return term$720;
        } else if (term$720.hasPrototype(VariableDeclaration$405)) {
            if (term$720.init) {
                term$720.init = expandTermTreeToFinal$425(term$720.init, context$721);
            }
            return term$720;
        } else if (term$720.hasPrototype(VariableStatement$406)) {
            term$720.decls = _$243.map(term$720.decls, function (decl$723) {
                return expandTermTreeToFinal$425(decl$723, context$721);
            });
            return term$720;
        } else if (term$720.hasPrototype(Delimiter$393)) {
            // expand inside the delimiter and then continue on
            term$720.delim.token.inner = expand$426(term$720.delim.expose().token.inner, context$721);
            return term$720;
        } else if (term$720.hasPrototype(NamedFun$395) || term$720.hasPrototype(AnonFun$396) || term$720.hasPrototype(CatchClause$409) || term$720.hasPrototype(ArrowFun$397) || term$720.hasPrototype(Module$410)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$724 = [];
            var bodyContext$725 = makeExpanderContext$427(_$243.defaults({ defscope: newDef$724 }, context$721));
            var paramSingleIdent$726 = term$720.params && term$720.params.token.type === parser$244.Token.Identifier;
            if (term$720.params && term$720.params.token.type === parser$244.Token.Delimiter) {
                var params$733 = term$720.params.expose();
            } else if (paramSingleIdent$726) {
                var params$733 = term$720.params;
            } else {
                var params$733 = syn$245.makeDelim('()', [], null);
            }
            if (Array.isArray(term$720.body)) {
                var bodies$734 = syn$245.makeDelim('{}', term$720.body, null);
            } else {
                var bodies$734 = term$720.body;
            }
            bodies$734 = bodies$734.addDefCtx(newDef$724);
            var paramNames$727 = _$243.map(getParamIdentifiers$375(params$733), function (param$735) {
                    var freshName$736 = fresh$373();
                    return {
                        freshName: freshName$736,
                        originalParam: param$735,
                        renamedParam: param$735.rename(param$735, freshName$736)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$728 = _$243.reduce(paramNames$727, function (accBody$737, p$738) {
                    return accBody$737.rename(p$738.originalParam, p$738.freshName);
                }, bodies$734);
            renamedBody$728 = renamedBody$728.expose();
            var expandedResult$729 = expandToTermTree$423(renamedBody$728.token.inner, bodyContext$725);
            var bodyTerms$730 = expandedResult$729.terms;
            var renamedParams$731 = _$243.map(paramNames$727, function (p$739) {
                    return p$739.renamedParam;
                });
            if (paramSingleIdent$726) {
                var flatArgs$740 = renamedParams$731[0];
            } else {
                var flatArgs$740 = syn$245.makeDelim('()', joinSyntax$361(renamedParams$731, ','), term$720.params);
            }
            var expandedArgs$732 = expand$426([flatArgs$740], bodyContext$725);
            assert$251(expandedArgs$732.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$720.params) {
                term$720.params = expandedArgs$732[0];
            }
            bodyTerms$730 = _$243.map(bodyTerms$730, function (bodyTerm$741) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$742 = bodyTerm$741.addDefCtx(newDef$724);
                // finish expansion
                return expandTermTreeToFinal$425(termWithCtx$742, expandedResult$729.context);
            });
            if (term$720.hasPrototype(Module$410)) {
                bodyTerms$730 = _$243.filter(bodyTerms$730, function (bodyTerm$743) {
                    if (bodyTerm$743.hasPrototype(Export$412)) {
                        term$720.exports.push(bodyTerm$743);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$728.token.inner = bodyTerms$730;
            if (Array.isArray(term$720.body)) {
                term$720.body = renamedBody$728.token.inner;
            } else {
                term$720.body = renamedBody$728;
            }
            // and continue expand the rest
            return term$720;
        }
        // the term is fine as is
        return term$720;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$426(stx$744, context$745) {
        assert$251(context$745, 'must provide an expander context');
        var trees$746 = expandToTermTree$423(stx$744, context$745);
        return _$243.map(trees$746.terms, function (term$747) {
            return expandTermTreeToFinal$425(term$747, trees$746.context);
        });
    }
    function makeExpanderContext$427(o$748) {
        o$748 = o$748 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$748.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$748.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$748.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$748.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$428(stx$749, builtinSource$750, _maxExpands$751) {
        var env$752 = new Map();
        var params$753 = [];
        var context$754, builtInContext$755 = makeExpanderContext$427({ env: env$752 });
        maxExpands$364 = _maxExpands$751 || Infinity;
        expandCount$363 = 0;
        if (builtinSource$750) {
            var builtinRead$758 = parser$244.read(builtinSource$750);
            builtinRead$758 = [
                syn$245.makeIdent('module', null),
                syn$245.makeDelim('{}', builtinRead$758, null)
            ];
            builtinMode$362 = true;
            var builtinRes$759 = expand$426(builtinRead$758, builtInContext$755);
            builtinMode$362 = false;
            params$753 = _$243.map(builtinRes$759[0].exports, function (term$760) {
                return {
                    oldExport: term$760.name,
                    newParam: syn$245.makeIdent(term$760.name.token.value, null)
                };
            });
        }
        var modBody$756 = syn$245.makeDelim('{}', stx$749, null);
        modBody$756 = _$243.reduce(params$753, function (acc$761, param$762) {
            var newName$763 = fresh$373();
            env$752.set(resolve$367(param$762.newParam.rename(param$762.newParam, newName$763)), env$752.get(resolve$367(param$762.oldExport)));
            return acc$761.rename(param$762.newParam, newName$763);
        }, modBody$756);
        context$754 = makeExpanderContext$427({ env: env$752 });
        var res$757 = expand$426([
                syn$245.makeIdent('module', null),
                modBody$756
            ], context$754);
        res$757 = res$757[0].destruct();
        return flatten$429(res$757[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$429(stx$764) {
        return _$243.reduce(stx$764, function (acc$765, stx$766) {
            if (stx$766.token.type === parser$244.Token.Delimiter) {
                var exposed$767 = stx$766.expose();
                var openParen$768 = syntaxFromToken$360({
                        type: parser$244.Token.Punctuator,
                        value: stx$766.token.value[0],
                        range: stx$766.token.startRange,
                        sm_range: typeof stx$766.token.sm_startRange == 'undefined' ? stx$766.token.startRange : stx$766.token.sm_startRange,
                        lineNumber: stx$766.token.startLineNumber,
                        sm_lineNumber: typeof stx$766.token.sm_startLineNumber == 'undefined' ? stx$766.token.startLineNumber : stx$766.token.sm_startLineNumber,
                        lineStart: stx$766.token.startLineStart,
                        sm_lineStart: typeof stx$766.token.sm_startLineStart == 'undefined' ? stx$766.token.startLineStart : stx$766.token.sm_startLineStart
                    }, exposed$767);
                var closeParen$769 = syntaxFromToken$360({
                        type: parser$244.Token.Punctuator,
                        value: stx$766.token.value[1],
                        range: stx$766.token.endRange,
                        sm_range: typeof stx$766.token.sm_endRange == 'undefined' ? stx$766.token.endRange : stx$766.token.sm_endRange,
                        lineNumber: stx$766.token.endLineNumber,
                        sm_lineNumber: typeof stx$766.token.sm_endLineNumber == 'undefined' ? stx$766.token.endLineNumber : stx$766.token.sm_endLineNumber,
                        lineStart: stx$766.token.endLineStart,
                        sm_lineStart: typeof stx$766.token.sm_endLineStart == 'undefined' ? stx$766.token.endLineStart : stx$766.token.sm_endLineStart
                    }, exposed$767);
                if (stx$766.token.leadingComments) {
                    openParen$768.token.leadingComments = stx$766.token.leadingComments;
                }
                if (stx$766.token.trailingComments) {
                    openParen$768.token.trailingComments = stx$766.token.trailingComments;
                }
                return acc$765.concat(openParen$768).concat(flatten$429(exposed$767.token.inner)).concat(closeParen$769);
            }
            stx$766.token.sm_lineNumber = stx$766.token.sm_lineNumber ? stx$766.token.sm_lineNumber : stx$766.token.lineNumber;
            stx$766.token.sm_lineStart = stx$766.token.sm_lineStart ? stx$766.token.sm_lineStart : stx$766.token.lineStart;
            stx$766.token.sm_range = stx$766.token.sm_range ? stx$766.token.sm_range : stx$766.token.range;
            return acc$765.concat(stx$766);
        }, []);
    }
    exports$242.enforest = enforest$418;
    exports$242.expand = expandTopLevel$428;
    exports$242.resolve = resolve$367;
    exports$242.get_expression = get_expression$419;
    exports$242.makeExpanderContext = makeExpanderContext$427;
    exports$242.Expr = Expr$379;
    exports$242.VariableStatement = VariableStatement$406;
    exports$242.tokensToSyntax = syn$245.tokensToSyntax;
    exports$242.syntaxToTokens = syn$245.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map