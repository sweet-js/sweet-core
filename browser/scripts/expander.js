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
(function (root$209, factory$210) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$210(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$210);
    }
}(this, function (exports$211, _$212, parser$213, syn$214, es6$215, se$216, patternModule$217, gen$218) {
    'use strict';
    var codegen$219 = gen$218 || escodegen;
    var assert$220 = syn$214.assert;
    var throwSyntaxError$221 = syn$214.throwSyntaxError;
    var unwrapSyntax$222 = syn$214.unwrapSyntax;
    // used to export "private" methods for unit testing
    exports$211._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$387 = Object.create(this);
                if (typeof o$387.construct === 'function') {
                    o$387.construct.apply(o$387, arguments);
                }
                return o$387;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$388) {
                var result$389 = Object.create(this);
                for (var prop$390 in properties$388) {
                    if (properties$388.hasOwnProperty(prop$390)) {
                        result$389[prop$390] = properties$388[prop$390];
                    }
                }
                return result$389;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$391) {
                function F$392() {
                }
                F$392.prototype = proto$391;
                return this instanceof F$392;
            },
            enumerable: false,
            writable: true
        }
    });
    var scopedEval$312 = se$216.scopedEval;
    var Rename$313 = syn$214.Rename;
    var Mark$314 = syn$214.Mark;
    var Var$315 = syn$214.Var;
    var Def$316 = syn$214.Def;
    var isDef$317 = syn$214.isDef;
    var isMark$318 = syn$214.isMark;
    var isRename$319 = syn$214.isRename;
    var syntaxFromToken$320 = syn$214.syntaxFromToken;
    var joinSyntax$321 = syn$214.joinSyntax;
    function remdup$322(mark$393, mlist$394) {
        if (mark$393 === _$212.first(mlist$394)) {
            return _$212.rest(mlist$394, 1);
        }
        return [mark$393].concat(mlist$394);
    }
    // (CSyntax) -> [...Num]
    function marksof$323(ctx$395, stopName$396, originalName$397) {
        var mark$398, submarks$399;
        if (isMark$318(ctx$395)) {
            mark$398 = ctx$395.mark;
            submarks$399 = marksof$323(ctx$395.context, stopName$396, originalName$397);
            return remdup$322(mark$398, submarks$399);
        }
        if (isDef$317(ctx$395)) {
            return marksof$323(ctx$395.context, stopName$396, originalName$397);
        }
        if (isRename$319(ctx$395)) {
            if (stopName$396 === originalName$397 + '$' + ctx$395.name) {
                return [];
            }
            return marksof$323(ctx$395.context, stopName$396, originalName$397);
        }
        return [];
    }
    function resolve$324(stx$400) {
        return resolveCtx$328(stx$400.token.value, stx$400.context, [], []);
    }
    function arraysEqual$325(a$401, b$402) {
        if (a$401.length !== b$402.length) {
            return false;
        }
        for (var i$403 = 0; i$403 < a$401.length; i$403++) {
            if (a$401[i$403] !== b$402[i$403]) {
                return false;
            }
        }
        return true;
    }
    function renames$326(defctx$404, oldctx$405, originalName$406) {
        var acc$407 = oldctx$405;
        for (var i$408 = 0; i$408 < defctx$404.length; i$408++) {
            if (defctx$404[i$408].id.token.value === originalName$406) {
                acc$407 = Rename$313(defctx$404[i$408].id, defctx$404[i$408].name, acc$407, defctx$404);
            }
        }
        return acc$407;
    }
    function unionEl$327(arr$409, el$410) {
        if (arr$409.indexOf(el$410) === -1) {
            var res$411 = arr$409.slice(0);
            res$411.push(el$410);
            return res$411;
        }
        return arr$409;
    }
    // (Syntax) -> String
    function resolveCtx$328(originalName$412, ctx$413, stop_spine$414, stop_branch$415) {
        if (isMark$318(ctx$413)) {
            return resolveCtx$328(originalName$412, ctx$413.context, stop_spine$414, stop_branch$415);
        }
        if (isDef$317(ctx$413)) {
            if (stop_spine$414.indexOf(ctx$413.defctx) !== -1) {
                return resolveCtx$328(originalName$412, ctx$413.context, stop_spine$414, stop_branch$415);
            } else {
                return resolveCtx$328(originalName$412, renames$326(ctx$413.defctx, ctx$413.context, originalName$412), stop_spine$414, unionEl$327(stop_branch$415, ctx$413.defctx));
            }
        }
        if (isRename$319(ctx$413)) {
            if (originalName$412 === ctx$413.id.token.value) {
                var idName$416 = resolveCtx$328(ctx$413.id.token.value, ctx$413.id.context, stop_branch$415, stop_branch$415);
                var subName$417 = resolveCtx$328(originalName$412, ctx$413.context, unionEl$327(stop_spine$414, ctx$413.def), stop_branch$415);
                if (idName$416 === subName$417) {
                    var idMarks$418 = marksof$323(ctx$413.id.context, originalName$412 + '$' + ctx$413.name, originalName$412);
                    var subMarks$419 = marksof$323(ctx$413.context, originalName$412 + '$' + ctx$413.name, originalName$412);
                    if (arraysEqual$325(idMarks$418, subMarks$419)) {
                        return originalName$412 + '$' + ctx$413.name;
                    }
                }
            }
            return resolveCtx$328(originalName$412, ctx$413.context, stop_spine$414, stop_branch$415);
        }
        return originalName$412;
    }
    var nextFresh$329 = 0;
    // fun () -> Num
    function fresh$330() {
        return nextFresh$329++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$331(towrap$420, delimSyntax$421) {
        assert$220(delimSyntax$421.token.type === parser$213.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$320({
            type: parser$213.Token.Delimiter,
            value: delimSyntax$421.token.value,
            inner: towrap$420,
            range: delimSyntax$421.token.range,
            startLineNumber: delimSyntax$421.token.startLineNumber,
            lineStart: delimSyntax$421.token.lineStart
        }, delimSyntax$421);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$332(argSyntax$422) {
        if (argSyntax$422.token.type === parser$213.Token.Delimiter) {
            return _$212.filter(argSyntax$422.token.inner, function (stx$423) {
                return stx$423.token.value !== ',';
            });
        } else if (argSyntax$422.token.type === parser$213.Token.Identifier) {
            return [argSyntax$422];
        } else {
            assert$220(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$333 = {
            destruct: function () {
                return _$212.reduce(this.properties, _$212.bind(function (acc$424, prop$425) {
                    if (this[prop$425] && this[prop$425].hasPrototype(TermTree$333)) {
                        return acc$424.concat(this[prop$425].destruct());
                    } else if (this[prop$425] && this[prop$425].token && this[prop$425].token.inner) {
                        this[prop$425].token.inner = _$212.reduce(this[prop$425].token.inner, function (acc$426, t$427) {
                            if (t$427.hasPrototype(TermTree$333)) {
                                return acc$426.concat(t$427.destruct());
                            }
                            return acc$426.concat(t$427);
                        }, []);
                        return acc$424.concat(this[prop$425]);
                    } else if (Array.isArray(this[prop$425])) {
                        return acc$424.concat(_$212.reduce(this[prop$425], function (acc$428, t$429) {
                            if (t$429.hasPrototype(TermTree$333)) {
                                return acc$428.concat(t$429.destruct());
                            }
                            return acc$428.concat(t$429);
                        }, []));
                    } else if (this[prop$425]) {
                        return acc$424.concat(this[prop$425]);
                    } else {
                        return acc$424;
                    }
                }, this), []);
            },
            addDefCtx: function (def$430) {
                for (var i$431 = 0; i$431 < this.properties.length; i$431++) {
                    var prop$432 = this.properties[i$431];
                    if (Array.isArray(this[prop$432])) {
                        this[prop$432] = _$212.map(this[prop$432], function (item$433) {
                            return item$433.addDefCtx(def$430);
                        });
                    } else if (this[prop$432]) {
                        this[prop$432] = this[prop$432].addDefCtx(def$430);
                    }
                }
                return this;
            },
            rename: function (id$434, name$435) {
                for (var i$436 = 0; i$436 < this.properties.length; i$436++) {
                    var prop$437 = this.properties[i$436];
                    if (Array.isArray(this[prop$437])) {
                        this[prop$437] = _$212.map(this[prop$437], function (item$438) {
                            return item$438.rename(id$434, name$435);
                        });
                    } else if (this[prop$437]) {
                        this[prop$437] = this[prop$437].rename(id$434, name$435);
                    }
                }
                return this;
            }
        };
    var EOF$334 = TermTree$333.extend({
            properties: ['eof'],
            construct: function (e$439) {
                this.eof = e$439;
            }
        });
    var Statement$335 = TermTree$333.extend({
            construct: function () {
            }
        });
    var Expr$336 = Statement$335.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$337 = Expr$336.extend({
            construct: function () {
            }
        });
    var ThisExpression$338 = PrimaryExpression$337.extend({
            properties: ['this'],
            construct: function (that$440) {
                this.this = that$440;
            }
        });
    var Lit$339 = PrimaryExpression$337.extend({
            properties: ['lit'],
            construct: function (l$441) {
                this.lit = l$441;
            }
        });
    exports$211._test.PropertyAssignment = PropertyAssignment$340;
    var PropertyAssignment$340 = TermTree$333.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$442, assignment$443) {
                this.propName = propName$442;
                this.assignment = assignment$443;
            }
        });
    var Block$341 = PrimaryExpression$337.extend({
            properties: ['body'],
            construct: function (body$444) {
                this.body = body$444;
            }
        });
    var ArrayLiteral$342 = PrimaryExpression$337.extend({
            properties: ['array'],
            construct: function (ar$445) {
                this.array = ar$445;
            }
        });
    var ParenExpression$343 = PrimaryExpression$337.extend({
            properties: ['expr'],
            construct: function (expr$446) {
                this.expr = expr$446;
            }
        });
    var UnaryOp$344 = Expr$336.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$447, expr$448) {
                this.op = op$447;
                this.expr = expr$448;
            }
        });
    var PostfixOp$345 = Expr$336.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$449, op$450) {
                this.expr = expr$449;
                this.op = op$450;
            }
        });
    var BinOp$346 = Expr$336.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$451, left$452, right$453) {
                this.op = op$451;
                this.left = left$452;
                this.right = right$453;
            }
        });
    var ConditionalExpression$347 = Expr$336.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$454, question$455, tru$456, colon$457, fls$458) {
                this.cond = cond$454;
                this.question = question$455;
                this.tru = tru$456;
                this.colon = colon$457;
                this.fls = fls$458;
            }
        });
    var Keyword$348 = TermTree$333.extend({
            properties: ['keyword'],
            construct: function (k$459) {
                this.keyword = k$459;
            }
        });
    var Punc$349 = TermTree$333.extend({
            properties: ['punc'],
            construct: function (p$460) {
                this.punc = p$460;
            }
        });
    var Delimiter$350 = TermTree$333.extend({
            properties: ['delim'],
            construct: function (d$461) {
                this.delim = d$461;
            }
        });
    var Id$351 = PrimaryExpression$337.extend({
            properties: ['id'],
            construct: function (id$462) {
                this.id = id$462;
            }
        });
    var NamedFun$352 = Expr$336.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$463, star$464, name$465, params$466, body$467) {
                this.keyword = keyword$463;
                this.star = star$464;
                this.name = name$465;
                this.params = params$466;
                this.body = body$467;
            }
        });
    var AnonFun$353 = Expr$336.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$468, star$469, params$470, body$471) {
                this.keyword = keyword$468;
                this.star = star$469;
                this.params = params$470;
                this.body = body$471;
            }
        });
    var ArrowFun$354 = Expr$336.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$472, arrow$473, body$474) {
                this.params = params$472;
                this.arrow = arrow$473;
                this.body = body$474;
            }
        });
    var LetMacro$355 = TermTree$333.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$475, body$476) {
                this.name = name$475;
                this.body = body$476;
            }
        });
    var Macro$356 = TermTree$333.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$477, body$478) {
                this.name = name$477;
                this.body = body$478;
            }
        });
    var AnonMacro$357 = TermTree$333.extend({
            properties: ['body'],
            construct: function (body$479) {
                this.body = body$479;
            }
        });
    var Const$358 = Expr$336.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$480, call$481) {
                this.newterm = newterm$480;
                this.call = call$481;
            }
        });
    var Call$359 = Expr$336.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                assert$220(this.fun.hasPrototype(TermTree$333), 'expecting a term tree in destruct of call');
                var that$482 = this;
                this.delim = syntaxFromToken$320(_$212.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$212.reduce(this.args, function (acc$483, term$484) {
                    assert$220(term$484 && term$484.hasPrototype(TermTree$333), 'expecting term trees in destruct of Call');
                    var dst$485 = acc$483.concat(term$484.destruct());
                    // add all commas except for the last one
                    if (that$482.commas.length > 0) {
                        dst$485 = dst$485.concat(that$482.commas.shift());
                    }
                    return dst$485;
                }, []);
                return this.fun.destruct().concat(Delimiter$350.create(this.delim).destruct());
            },
            construct: function (funn$486, args$487, delim$488, commas$489) {
                assert$220(Array.isArray(args$487), 'requires an array of arguments terms');
                this.fun = funn$486;
                this.args = args$487;
                this.delim = delim$488;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$489;
            }
        });
    var ObjDotGet$360 = Expr$336.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$490, dot$491, right$492) {
                this.left = left$490;
                this.dot = dot$491;
                this.right = right$492;
            }
        });
    var ObjGet$361 = Expr$336.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$493, right$494) {
                this.left = left$493;
                this.right = right$494;
            }
        });
    var VariableDeclaration$362 = TermTree$333.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$495, eqstx$496, init$497, comma$498) {
                this.ident = ident$495;
                this.eqstx = eqstx$496;
                this.init = init$497;
                this.comma = comma$498;
            }
        });
    var VariableStatement$363 = Statement$335.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$212.reduce(this.decls, function (acc$499, decl$500) {
                    return acc$499.concat(decl$500.destruct());
                }, []));
            },
            construct: function (varkw$501, decls$502) {
                assert$220(Array.isArray(decls$502), 'decls must be an array');
                this.varkw = varkw$501;
                this.decls = decls$502;
            }
        });
    var LetStatement$364 = Statement$335.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$212.reduce(this.decls, function (acc$503, decl$504) {
                    return acc$503.concat(decl$504.destruct());
                }, []));
            },
            construct: function (letkw$505, decls$506) {
                assert$220(Array.isArray(decls$506), 'decls must be an array');
                this.letkw = letkw$505;
                this.decls = decls$506;
            }
        });
    var ConstStatement$365 = Statement$335.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$212.reduce(this.decls, function (acc$507, decl$508) {
                    return acc$507.concat(decl$508.destruct());
                }, []));
            },
            construct: function (constkw$509, decls$510) {
                assert$220(Array.isArray(decls$510), 'decls must be an array');
                this.constkw = constkw$509;
                this.decls = decls$510;
            }
        });
    var CatchClause$366 = Statement$335.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$511, params$512, body$513) {
                this.catchkw = catchkw$511;
                this.params = params$512;
                this.body = body$513;
            }
        });
    var Module$367 = TermTree$333.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$514) {
                this.body = body$514;
                this.exports = [];
            }
        });
    var Empty$368 = Statement$335.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$369 = TermTree$333.extend({
            properties: ['name'],
            construct: function (name$515) {
                this.name = name$515;
            }
        });
    var ForStatement$370 = Statement$335.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$516, cond$517) {
                this.forkw = forkw$516;
                this.cond = cond$517;
            }
        });
    function stxIsUnaryOp$371(stx$518) {
        var staticOperators$519 = [
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
        return _$212.contains(staticOperators$519, unwrapSyntax$222(stx$518));
    }
    function stxIsBinOp$372(stx$520) {
        var staticOperators$521 = [
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
        return _$212.contains(staticOperators$521, unwrapSyntax$222(stx$520));
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$373(stx$522, context$523, isLet$524) {
        var decls$525 = [];
        var res$526 = enforest$375(stx$522, context$523);
        var result$527 = res$526.result;
        var rest$528 = res$526.rest;
        if (rest$528[0]) {
            if (isLet$524 && result$527.hasPrototype(Id$351)) {
                var freshName$530 = fresh$330();
                var renamedId$531 = result$527.id.rename(result$527.id, freshName$530);
                rest$528 = rest$528.map(function (stx$532) {
                    return stx$532.rename(result$527.id, freshName$530);
                });
                result$527.id = renamedId$531;
            }
            var nextRes$529 = enforest$375(rest$528, context$523);
            // x = ...
            if (nextRes$529.result.hasPrototype(Punc$349) && nextRes$529.result.punc.token.value === '=') {
                var initializerRes$533 = enforest$375(nextRes$529.rest, context$523);
                // x = y + z, ...
                if (initializerRes$533.rest[0] && initializerRes$533.rest[0].token.value === ',') {
                    decls$525.push(VariableDeclaration$362.create(result$527.id, nextRes$529.result.punc, initializerRes$533.result, initializerRes$533.rest[0]));
                    var subRes$534 = enforestVarStatement$373(initializerRes$533.rest.slice(1), context$523, isLet$524);
                    decls$525 = decls$525.concat(subRes$534.result);
                    rest$528 = subRes$534.rest;
                }    // x = y ...
                else {
                    decls$525.push(VariableDeclaration$362.create(result$527.id, nextRes$529.result.punc, initializerRes$533.result));
                    rest$528 = initializerRes$533.rest;
                }
            }    // x ,...;
            else if (nextRes$529.result.hasPrototype(Punc$349) && nextRes$529.result.punc.token.value === ',') {
                decls$525.push(VariableDeclaration$362.create(result$527.id, null, null, nextRes$529.result.punc));
                var subRes$534 = enforestVarStatement$373(nextRes$529.rest, context$523, isLet$524);
                decls$525 = decls$525.concat(subRes$534.result);
                rest$528 = subRes$534.rest;
            } else {
                if (result$527.hasPrototype(Id$351)) {
                    decls$525.push(VariableDeclaration$362.create(result$527.id));
                } else {
                    throwSyntaxError$221('enforest', 'Expecting an identifier in variable declaration', rest$528);
                }
            }
        }    // x EOF
        else {
            if (result$527.hasPrototype(Id$351)) {
                decls$525.push(VariableDeclaration$362.create(result$527.id));
            } else if (result$527.hasPrototype(BinOp$346) && result$527.op.token.value === 'in') {
                decls$525.push(VariableDeclaration$362.create(result$527.left.id, result$527.op, result$527.right));
            } else {
                throwSyntaxError$221('enforest', 'Expecting an identifier in variable declaration', stx$522);
            }
        }
        return {
            result: decls$525,
            rest: rest$528
        };
    }
    function adjustLineContext$374(stx$535, original$536, current$537) {
        current$537 = current$537 || {
            lastLineNumber: original$536.token.lineNumber,
            lineNumber: original$536.token.lineNumber - 1
        };
        return _$212.map(stx$535, function (stx$538) {
            if (stx$538.token.type === parser$213.Token.Delimiter) {
                // handle tokens with missing line info
                stx$538.token.startLineNumber = typeof stx$538.token.startLineNumber == 'undefined' ? original$536.token.lineNumber : stx$538.token.startLineNumber;
                stx$538.token.endLineNumber = typeof stx$538.token.endLineNumber == 'undefined' ? original$536.token.lineNumber : stx$538.token.endLineNumber;
                stx$538.token.startLineStart = typeof stx$538.token.startLineStart == 'undefined' ? original$536.token.lineStart : stx$538.token.startLineStart;
                stx$538.token.endLineStart = typeof stx$538.token.endLineStart == 'undefined' ? original$536.token.lineStart : stx$538.token.endLineStart;
                stx$538.token.startRange = typeof stx$538.token.startRange == 'undefined' ? original$536.token.range : stx$538.token.startRange;
                stx$538.token.endRange = typeof stx$538.token.endRange == 'undefined' ? original$536.token.range : stx$538.token.endRange;
                stx$538.token.sm_startLineNumber = typeof stx$538.token.sm_startLineNumber == 'undefined' ? stx$538.token.startLineNumber : stx$538.token.sm_startLineNumber;
                stx$538.token.sm_endLineNumber = typeof stx$538.token.sm_endLineNumber == 'undefined' ? stx$538.token.endLineNumber : stx$538.token.sm_endLineNumber;
                stx$538.token.sm_startLineStart = typeof stx$538.token.sm_startLineStart == 'undefined' ? stx$538.token.startLineStart : stx$538.token.sm_startLineStart;
                stx$538.token.sm_endLineStart = typeof stx$538.token.sm_endLineStart == 'undefined' ? stx$538.token.endLineStart : stx$538.token.sm_endLineStart;
                stx$538.token.sm_startRange = typeof stx$538.token.sm_startRange == 'undefined' ? stx$538.token.startRange : stx$538.token.sm_startRange;
                stx$538.token.sm_endRange = typeof stx$538.token.sm_endRange == 'undefined' ? stx$538.token.endRange : stx$538.token.sm_endRange;
                if (stx$538.token.startLineNumber === current$537.lastLineNumber && current$537.lastLineNumber !== current$537.lineNumber) {
                    stx$538.token.startLineNumber = current$537.lineNumber;
                } else if (stx$538.token.startLineNumber !== current$537.lastLineNumber) {
                    current$537.lineNumber++;
                    current$537.lastLineNumber = stx$538.token.startLineNumber;
                    stx$538.token.startLineNumber = current$537.lineNumber;
                }
                if (stx$538.token.inner.length > 0) {
                    stx$538.token.inner = adjustLineContext$374(stx$538.token.inner, original$536, current$537);
                }
                return stx$538;
            }
            // handle tokens with missing line info
            stx$538.token.lineNumber = typeof stx$538.token.lineNumber == 'undefined' ? original$536.token.lineNumber : stx$538.token.lineNumber;
            stx$538.token.lineStart = typeof stx$538.token.lineStart == 'undefined' ? original$536.token.lineStart : stx$538.token.lineStart;
            stx$538.token.range = typeof stx$538.token.range == 'undefined' ? original$536.token.range : stx$538.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$538.token.sm_lineNumber = typeof stx$538.token.sm_lineNumber == 'undefined' ? stx$538.token.lineNumber : stx$538.token.sm_lineNumber;
            stx$538.token.sm_lineStart = typeof stx$538.token.sm_lineStart == 'undefined' ? stx$538.token.lineStart : stx$538.token.sm_lineStart;
            stx$538.token.sm_range = typeof stx$538.token.sm_range == 'undefined' ? _$212.clone(stx$538.token.range) : stx$538.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$538.token.lineNumber === current$537.lastLineNumber && current$537.lastLineNumber !== current$537.lineNumber) {
                stx$538.token.lineNumber = current$537.lineNumber;
            } else if (stx$538.token.lineNumber !== current$537.lastLineNumber) {
                current$537.lineNumber++;
                current$537.lastLineNumber = stx$538.token.lineNumber;
                stx$538.token.lineNumber = current$537.lineNumber;
            }
            return stx$538;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$375(toks$539, context$540) {
        assert$220(toks$539.length > 0, 'enforest assumes there are tokens to work with');
        function step$541(head$542, rest$543) {
            var innerTokens$544;
            assert$220(Array.isArray(rest$543), 'result must at least be an empty array');
            if (head$542.hasPrototype(TermTree$333)) {
                // function call
                var emp$547 = head$542.emp;
                var emp$547 = head$542.emp;
                var keyword$550 = head$542.keyword;
                var delim$552 = head$542.delim;
                var id$554 = head$542.id;
                var delim$552 = head$542.delim;
                var emp$547 = head$542.emp;
                var punc$558 = head$542.punc;
                var keyword$550 = head$542.keyword;
                var emp$547 = head$542.emp;
                var emp$547 = head$542.emp;
                var emp$547 = head$542.emp;
                var delim$552 = head$542.delim;
                var delim$552 = head$542.delim;
                var id$554 = head$542.id;
                var keyword$550 = head$542.keyword;
                var keyword$550 = head$542.keyword;
                var keyword$550 = head$542.keyword;
                var keyword$550 = head$542.keyword;
                var keyword$550 = head$542.keyword;
                if (head$542.hasPrototype(Expr$336) && rest$543[0] && rest$543[0].token.type === parser$213.Token.Delimiter && rest$543[0].token.value === '()') {
                    var argRes$593, enforestedArgs$594 = [], commas$595 = [];
                    rest$543[0].expose();
                    innerTokens$544 = rest$543[0].token.inner;
                    while (innerTokens$544.length > 0) {
                        argRes$593 = enforest$375(innerTokens$544, context$540);
                        enforestedArgs$594.push(argRes$593.result);
                        innerTokens$544 = argRes$593.rest;
                        if (innerTokens$544[0] && innerTokens$544[0].token.value === ',') {
                            // record the comma for later
                            commas$595.push(innerTokens$544[0]);
                            // but dump it for the next loop turn
                            innerTokens$544 = innerTokens$544.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$596 = _$212.all(enforestedArgs$594, function (argTerm$597) {
                            return argTerm$597.hasPrototype(Expr$336);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$544.length === 0 && argsAreExprs$596) {
                        return step$541(Call$359.create(head$542, enforestedArgs$594, rest$543[0], commas$595), rest$543.slice(1));
                    }
                } else if (head$542.hasPrototype(Expr$336) && rest$543[0] && unwrapSyntax$222(rest$543[0]) === '?') {
                    var question$598 = rest$543[0];
                    var condRes$599 = enforest$375(rest$543.slice(1), context$540);
                    var truExpr$600 = condRes$599.result;
                    var right$601 = condRes$599.rest;
                    if (truExpr$600.hasPrototype(Expr$336) && right$601[0] && unwrapSyntax$222(right$601[0]) === ':') {
                        var colon$602 = right$601[0];
                        var flsRes$603 = enforest$375(right$601.slice(1), context$540);
                        var flsExpr$604 = flsRes$603.result;
                        if (flsExpr$604.hasPrototype(Expr$336)) {
                            return step$541(ConditionalExpression$347.create(head$542, question$598, truExpr$600, colon$602, flsExpr$604), flsRes$603.rest);
                        }
                    }
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$222(keyword$550) === 'new' && rest$543[0]) {
                    var newCallRes$605 = enforest$375(rest$543, context$540);
                    if (newCallRes$605.result.hasPrototype(Call$359)) {
                        return step$541(Const$358.create(head$542, newCallRes$605.result), newCallRes$605.rest);
                    }
                } else if (head$542.hasPrototype(Delimiter$350) && delim$552.token.value === '()' && rest$543[0] && rest$543[0].token.type === parser$213.Token.Punctuator && unwrapSyntax$222(rest$543[0]) === '=>') {
                    var res$606 = enforest$375(rest$543.slice(1), context$540);
                    if (res$606.result.hasPrototype(Expr$336)) {
                        return step$541(ArrowFun$354.create(delim$552, rest$543[0], res$606.result.destruct()), res$606.rest);
                    } else {
                        throwSyntaxError$221('enforest', 'Body of arrow function must be an expression', rest$543.slice(1));
                    }
                } else if (head$542.hasPrototype(Id$351) && rest$543[0] && rest$543[0].token.type === parser$213.Token.Punctuator && unwrapSyntax$222(rest$543[0]) === '=>') {
                    var res$606 = enforest$375(rest$543.slice(1), context$540);
                    if (res$606.result.hasPrototype(Expr$336)) {
                        return step$541(ArrowFun$354.create(id$554, rest$543[0], res$606.result.destruct()), res$606.rest);
                    } else {
                        throwSyntaxError$221('enforest', 'Body of arrow function must be an expression', rest$543.slice(1));
                    }
                } else if (head$542.hasPrototype(Delimiter$350) && delim$552.token.value === '()') {
                    innerTokens$544 = delim$552.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$544.length === 0) {
                        return step$541(ParenExpression$343.create(head$542), rest$543);
                    } else {
                        var innerTerm$607 = get_expression$376(innerTokens$544, context$540);
                        if (innerTerm$607.result && innerTerm$607.result.hasPrototype(Expr$336)) {
                            return step$541(ParenExpression$343.create(head$542), rest$543);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$542.hasPrototype(Expr$336) && rest$543[0] && rest$543[1] && stxIsBinOp$372(rest$543[0])) {
                    var op$608 = rest$543[0];
                    var left$609 = head$542;
                    var bopRes$610 = enforest$375(rest$543.slice(1), context$540);
                    var right$601 = bopRes$610.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$601.hasPrototype(Expr$336)) {
                        return step$541(BinOp$346.create(op$608, left$609, right$601), bopRes$610.rest);
                    }
                } else if (head$542.hasPrototype(Punc$349) && stxIsUnaryOp$371(punc$558)) {
                    var unopRes$611 = enforest$375(rest$543, context$540);
                    if (unopRes$611.result.hasPrototype(Expr$336)) {
                        return step$541(UnaryOp$344.create(punc$558, unopRes$611.result), unopRes$611.rest);
                    }
                } else if (head$542.hasPrototype(Keyword$348) && stxIsUnaryOp$371(keyword$550)) {
                    var unopRes$611 = enforest$375(rest$543, context$540);
                    if (unopRes$611.result.hasPrototype(Expr$336)) {
                        return step$541(UnaryOp$344.create(keyword$550, unopRes$611.result), unopRes$611.rest);
                    }
                } else if (head$542.hasPrototype(Expr$336) && rest$543[0] && (unwrapSyntax$222(rest$543[0]) === '++' || unwrapSyntax$222(rest$543[0]) === '--')) {
                    return step$541(PostfixOp$345.create(head$542, rest$543[0]), rest$543.slice(1));
                } else if (head$542.hasPrototype(Expr$336) && rest$543[0] && rest$543[0].token.value === '[]') {
                    return step$541(ObjGet$361.create(head$542, Delimiter$350.create(rest$543[0].expose())), rest$543.slice(1));
                } else if (head$542.hasPrototype(Expr$336) && rest$543[0] && unwrapSyntax$222(rest$543[0]) === '.' && rest$543[1] && rest$543[1].token.type === parser$213.Token.Identifier) {
                    return step$541(ObjDotGet$360.create(head$542, rest$543[0], rest$543[1]), rest$543.slice(2));
                } else if (head$542.hasPrototype(Delimiter$350) && delim$552.token.value === '[]') {
                    return step$541(ArrayLiteral$342.create(head$542), rest$543);
                } else if (head$542.hasPrototype(Delimiter$350) && head$542.delim.token.value === '{}') {
                    return step$541(Block$341.create(head$542), rest$543);
                } else if (head$542.hasPrototype(Id$351) && unwrapSyntax$222(id$554) === '#quoteSyntax' && rest$543[0] && rest$543[0].token.value === '{}') {
                    var tempId$612 = fresh$330();
                    context$540.templateMap.set(tempId$612, rest$543[0].token.inner);
                    return step$541(syn$214.makeIdent('getTemplate', id$554), [syn$214.makeDelim('()', [syn$214.makeValue(tempId$612, id$554)], id$554)].concat(rest$543.slice(1)));
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$222(keyword$550) === 'let' && (rest$543[0] && rest$543[0].token.type === parser$213.Token.Identifier || rest$543[0] && rest$543[0].token.type === parser$213.Token.Keyword || rest$543[0] && rest$543[0].token.type === parser$213.Token.Punctuator) && rest$543[1] && unwrapSyntax$222(rest$543[1]) === '=' && rest$543[2] && rest$543[2].token.value === 'macro') {
                    var mac$613 = enforest$375(rest$543.slice(2), context$540);
                    if (!mac$613.result.hasPrototype(AnonMacro$357)) {
                        throwSyntaxError$221('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$543.slice(2));
                    }
                    return step$541(LetMacro$355.create(rest$543[0], mac$613.result.body), mac$613.rest);
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$222(keyword$550) === 'var' && rest$543[0]) {
                    var vsRes$614 = enforestVarStatement$373(rest$543, context$540, false);
                    if (vsRes$614) {
                        return step$541(VariableStatement$363.create(head$542, vsRes$614.result), vsRes$614.rest);
                    }
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$222(keyword$550) === 'let' && rest$543[0]) {
                    var vsRes$614 = enforestVarStatement$373(rest$543, context$540, true);
                    if (vsRes$614) {
                        return step$541(LetStatement$364.create(head$542, vsRes$614.result), vsRes$614.rest);
                    }
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$222(keyword$550) === 'const' && rest$543[0]) {
                    var vsRes$614 = enforestVarStatement$373(rest$543, context$540, true);
                    if (vsRes$614) {
                        return step$541(ConstStatement$365.create(head$542, vsRes$614.result), vsRes$614.rest);
                    }
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$222(keyword$550) === 'for' && rest$543[0] && rest$543[0].token.value === '()') {
                    return step$541(ForStatement$370.create(keyword$550, rest$543[0]), rest$543.slice(1));
                }
            } else {
                assert$220(head$542 && head$542.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$542.token.type === parser$213.Token.Identifier || head$542.token.type === parser$213.Token.Keyword || head$542.token.type === parser$213.Token.Punctuator) && context$540.env.has(resolve$324(head$542))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$615 = fresh$330();
                    var transformerContext$616 = makeExpanderContext$384(_$212.defaults({ mark: newMark$615 }, context$540));
                    // pull the macro transformer out the environment
                    var transformer$617 = context$540.env.get(resolve$324(head$542)).fn;
                    // apply the transformer
                    try {
                        var rt$618 = transformer$617([head$542].concat(rest$543), transformerContext$616);
                    } catch (e$619) {
                        if (e$619.type && e$619.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$620 = '`' + rest$543.slice(0, 5).map(function (stx$621) {
                                    return stx$621.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$221('macro', 'Macro `' + head$542.token.value + '` could not be matched with ' + argumentString$620, head$542);
                        } else {
                            // just rethrow it
                            throw e$619;
                        }
                    }
                    if (!Array.isArray(rt$618.result)) {
                        throwSyntaxError$221('enforest', 'Macro must return a syntax array', head$542);
                    }
                    if (rt$618.result.length > 0) {
                        var adjustedResult$622 = adjustLineContext$374(rt$618.result, head$542);
                        adjustedResult$622[0].token.leadingComments = head$542.token.leadingComments;
                        return step$541(adjustedResult$622[0], adjustedResult$622.slice(1).concat(rt$618.rest));
                    } else {
                        return step$541(Empty$368.create(), rt$618.rest);
                    }
                }    // anon macro definition
                else if (head$542.token.type === parser$213.Token.Identifier && head$542.token.value === 'macro' && rest$543[0] && rest$543[0].token.value === '{}') {
                    return step$541(AnonMacro$357.create(rest$543[0].expose().token.inner), rest$543.slice(1));
                }    // macro definition
                else if (head$542.token.type === parser$213.Token.Identifier && head$542.token.value === 'macro' && rest$543[0] && (rest$543[0].token.type === parser$213.Token.Identifier || rest$543[0].token.type === parser$213.Token.Keyword || rest$543[0].token.type === parser$213.Token.Punctuator) && rest$543[1] && rest$543[1].token.type === parser$213.Token.Delimiter && rest$543[1].token.value === '{}') {
                    return step$541(Macro$356.create(rest$543[0], rest$543[1].expose().token.inner), rest$543.slice(2));
                }    // module definition
                else if (unwrapSyntax$222(head$542) === 'module' && rest$543[0] && rest$543[0].token.value === '{}') {
                    return step$541(Module$367.create(rest$543[0]), rest$543.slice(1));
                }    // function definition
                else if (head$542.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$542) === 'function' && rest$543[0] && rest$543[0].token.type === parser$213.Token.Identifier && rest$543[1] && rest$543[1].token.type === parser$213.Token.Delimiter && rest$543[1].token.value === '()' && rest$543[2] && rest$543[2].token.type === parser$213.Token.Delimiter && rest$543[2].token.value === '{}') {
                    rest$543[1].token.inner = rest$543[1].expose().token.inner;
                    rest$543[2].token.inner = rest$543[2].expose().token.inner;
                    return step$541(NamedFun$352.create(head$542, null, rest$543[0], rest$543[1], rest$543[2]), rest$543.slice(3));
                }    // generator function definition
                else if (head$542.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$542) === 'function' && rest$543[0] && rest$543[0].token.type === parser$213.Token.Punctuator && rest$543[0].token.value === '*' && rest$543[1] && rest$543[1].token.type === parser$213.Token.Identifier && rest$543[2] && rest$543[2].token.type === parser$213.Token.Delimiter && rest$543[2].token.value === '()' && rest$543[3] && rest$543[3].token.type === parser$213.Token.Delimiter && rest$543[3].token.value === '{}') {
                    rest$543[2].token.inner = rest$543[2].expose().token.inner;
                    rest$543[3].token.inner = rest$543[3].expose().token.inner;
                    return step$541(NamedFun$352.create(head$542, rest$543[0], rest$543[1], rest$543[2], rest$543[3]), rest$543.slice(4));
                }    // anonymous function definition
                else if (head$542.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$542) === 'function' && rest$543[0] && rest$543[0].token.type === parser$213.Token.Delimiter && rest$543[0].token.value === '()' && rest$543[1] && rest$543[1].token.type === parser$213.Token.Delimiter && rest$543[1].token.value === '{}') {
                    rest$543[0].token.inner = rest$543[0].expose().token.inner;
                    rest$543[1].token.inner = rest$543[1].expose().token.inner;
                    return step$541(AnonFun$353.create(head$542, null, rest$543[0], rest$543[1]), rest$543.slice(2));
                }    // anonymous generator function definition
                else if (head$542.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$542) === 'function' && rest$543[0] && rest$543[0].token.type === parser$213.Token.Punctuator && rest$543[0].token.value === '*' && rest$543[1] && rest$543[1].token.type === parser$213.Token.Delimiter && rest$543[1].token.value === '()' && rest$543[2] && rest$543[2].token.type === parser$213.Token.Delimiter && rest$543[2].token.value === '{}') {
                    rest$543[1].token.inner = rest$543[1].expose().token.inner;
                    rest$543[2].token.inner = rest$543[2].expose().token.inner;
                    return step$541(AnonFun$353.create(head$542, rest$543[0], rest$543[1], rest$543[2]), rest$543.slice(3));
                }    // arrow function
                else if ((head$542.token.type === parser$213.Token.Delimiter && head$542.token.value === '()' || head$542.token.type === parser$213.Token.Identifier) && rest$543[0] && rest$543[0].token.type === parser$213.Token.Punctuator && rest$543[0].token.value === '=>' && rest$543[1] && rest$543[1].token.type === parser$213.Token.Delimiter && rest$543[1].token.value === '{}') {
                    return step$541(ArrowFun$354.create(head$542, rest$543[0], rest$543[1]), rest$543.slice(2));
                }    // catch statement
                else if (head$542.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$542) === 'catch' && rest$543[0] && rest$543[0].token.type === parser$213.Token.Delimiter && rest$543[0].token.value === '()' && rest$543[1] && rest$543[1].token.type === parser$213.Token.Delimiter && rest$543[1].token.value === '{}') {
                    rest$543[0].token.inner = rest$543[0].expose().token.inner;
                    rest$543[1].token.inner = rest$543[1].expose().token.inner;
                    return step$541(CatchClause$366.create(head$542, rest$543[0], rest$543[1]), rest$543.slice(2));
                }    // this expression
                else if (head$542.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$542) === 'this') {
                    return step$541(ThisExpression$338.create(head$542), rest$543);
                }    // literal
                else if (head$542.token.type === parser$213.Token.NumericLiteral || head$542.token.type === parser$213.Token.StringLiteral || head$542.token.type === parser$213.Token.BooleanLiteral || head$542.token.type === parser$213.Token.RegularExpression || head$542.token.type === parser$213.Token.NullLiteral) {
                    return step$541(Lit$339.create(head$542), rest$543);
                }    // export
                else if (head$542.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$542) === 'export' && rest$543[0] && (rest$543[0].token.type === parser$213.Token.Identifier || rest$543[0].token.type === parser$213.Token.Keyword || rest$543[0].token.type === parser$213.Token.Punctuator)) {
                    return step$541(Export$369.create(rest$543[0]), rest$543.slice(1));
                }    // identifier
                else if (head$542.token.type === parser$213.Token.Identifier) {
                    return step$541(Id$351.create(head$542), rest$543);
                }    // punctuator
                else if (head$542.token.type === parser$213.Token.Punctuator) {
                    return step$541(Punc$349.create(head$542), rest$543);
                } else if (head$542.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$542) === 'with') {
                    throwSyntaxError$221('enforest', 'with is not supported in sweet.js', head$542);
                }    // keyword
                else if (head$542.token.type === parser$213.Token.Keyword) {
                    return step$541(Keyword$348.create(head$542), rest$543);
                }    // Delimiter
                else if (head$542.token.type === parser$213.Token.Delimiter) {
                    return step$541(Delimiter$350.create(head$542.expose()), rest$543);
                }    // end of file
                else if (head$542.token.type === parser$213.Token.EOF) {
                    assert$220(rest$543.length === 0, 'nothing should be after an EOF');
                    return step$541(EOF$334.create(head$542), []);
                } else {
                    // todo: are we missing cases?
                    assert$220(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$542,
                rest: rest$543
            };
        }
        return step$541(toks$539[0], toks$539.slice(1));
    }
    function get_expression$376(stx$623, context$624) {
        var res$625 = enforest$375(stx$623, context$624);
        if (!res$625.result.hasPrototype(Expr$336)) {
            return {
                result: null,
                rest: stx$623
            };
        }
        return res$625;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$377(newMark$626, env$627) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$628(match$629) {
            if (match$629.level === 0) {
                // replace the match property with the marked syntax
                match$629.match = _$212.map(match$629.match, function (stx$630) {
                    return stx$630.mark(newMark$626);
                });
            } else {
                _$212.each(match$629.match, function (match$631) {
                    dfs$628(match$631);
                });
            }
        }
        _$212.keys(env$627).forEach(function (key$632) {
            dfs$628(env$627[key$632]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$378(mac$633, context$634) {
        var body$635 = mac$633.body;
        // raw function primitive form
        if (!(body$635[0] && body$635[0].token.type === parser$213.Token.Keyword && body$635[0].token.value === 'function')) {
            throwSyntaxError$221('load macro', 'Primitive macro form must contain a function for the macro body', body$635);
        }
        var stub$636 = parser$213.read('()');
        stub$636[0].token.inner = body$635;
        var expanded$637 = expand$383(stub$636, context$634);
        expanded$637 = expanded$637[0].destruct().concat(expanded$637[1].eof);
        var flattend$638 = flatten$386(expanded$637);
        var bodyCode$639 = codegen$219.generate(parser$213.parse(flattend$638));
        var macroFn$640 = scopedEval$312(bodyCode$639, {
                makeValue: syn$214.makeValue,
                makeRegex: syn$214.makeRegex,
                makeIdent: syn$214.makeIdent,
                makeKeyword: syn$214.makeKeyword,
                makePunc: syn$214.makePunc,
                makeDelim: syn$214.makeDelim,
                unwrapSyntax: syn$214.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$221,
                parser: parser$213,
                _: _$212,
                patternModule: patternModule$217,
                getTemplate: function (id$641) {
                    return cloneSyntaxArray$379(context$634.templateMap.get(id$641));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$377,
                mergeMatches: function (newMatch$642, oldMatch$643) {
                    newMatch$642.patternEnv = _$212.extend({}, oldMatch$643.patternEnv, newMatch$642.patternEnv);
                    return newMatch$642;
                }
            });
        return macroFn$640;
    }
    function cloneSyntaxArray$379(arr$644) {
        return arr$644.map(function (stx$645) {
            var o$646 = syntaxFromToken$320(_$212.clone(stx$645.token), stx$645);
            if (o$646.token.type === parser$213.Token.Delimiter) {
                o$646.token.inner = cloneSyntaxArray$379(o$646.token.inner);
            }
            return o$646;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$380(stx$647, context$648) {
        assert$220(context$648, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$647.length === 0) {
            return {
                terms: [],
                context: context$648
            };
        }
        assert$220(stx$647[0].token, 'expecting a syntax object');
        var f$649 = enforest$375(stx$647, context$648);
        // head :: TermTree
        var head$650 = f$649.result;
        // rest :: [Syntax]
        var rest$651 = f$649.rest;
        if (head$650.hasPrototype(Macro$356)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$653 = loadMacroDef$378(head$650, context$648);
            addToDefinitionCtx$381([head$650.name], context$648.defscope, false);
            context$648.env.set(resolve$324(head$650.name), { fn: macroDefinition$653 });
            return expandToTermTree$380(rest$651, context$648);
        }
        if (head$650.hasPrototype(LetMacro$355)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$653 = loadMacroDef$378(head$650, context$648);
            var freshName$654 = fresh$330();
            var renamedName$655 = head$650.name.rename(head$650.name, freshName$654);
            rest$651 = _$212.map(rest$651, function (stx$656) {
                return stx$656.rename(head$650.name, freshName$654);
            });
            head$650.name = renamedName$655;
            context$648.env.set(resolve$324(head$650.name), { fn: macroDefinition$653 });
            return expandToTermTree$380(rest$651, context$648);
        }
        if (head$650.hasPrototype(NamedFun$352)) {
            addToDefinitionCtx$381([head$650.name], context$648.defscope, true);
        }
        if (head$650.hasPrototype(VariableStatement$363)) {
            addToDefinitionCtx$381(_$212.map(head$650.decls, function (decl$657) {
                return decl$657.ident;
            }), context$648.defscope, true);
        }
        if (head$650.hasPrototype(Block$341) && head$650.body.hasPrototype(Delimiter$350)) {
            head$650.body.delim.token.inner.forEach(function (term$658) {
                if (term$658.hasPrototype(VariableStatement$363)) {
                    addToDefinitionCtx$381(_$212.map(term$658.decls, function (decl$659) {
                        return decl$659.ident;
                    }), context$648.defscope, true);
                }
            });
        }
        if (head$650.hasPrototype(Delimiter$350)) {
            head$650.delim.token.inner.forEach(function (term$660) {
                if (term$660.hasPrototype(VariableStatement$363)) {
                    addToDefinitionCtx$381(_$212.map(term$660.decls, function (decl$661) {
                        return decl$661.ident;
                    }), context$648.defscope, true);
                }
            });
        }
        if (head$650.hasPrototype(ForStatement$370)) {
            head$650.cond.expose();
            var forCond$662 = head$650.cond.token.inner;
            if (forCond$662[0] && resolve$324(forCond$662[0]) === 'let' && forCond$662[1] && forCond$662[1].token.type === parser$213.Token.Identifier) {
                var letNew$663 = fresh$330();
                var letId$664 = forCond$662[1];
                forCond$662 = forCond$662.map(function (stx$665) {
                    return stx$665.rename(letId$664, letNew$663);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$650.cond.token.inner = expand$383([forCond$662[0]], context$648).concat(expand$383(forCond$662.slice(1), context$648));
                // nice and easy case: `for (...) { ... }`
                if (rest$651[0] && rest$651[0].token.value === '{}') {
                    rest$651[0] = rest$651[0].rename(letId$664, letNew$663);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$666 = enforest$375(rest$651, context$648);
                    var renamedBodyTerm$667 = bodyEnf$666.result.rename(letId$664, letNew$663);
                    var forTrees$668 = expandToTermTree$380(bodyEnf$666.rest, context$648);
                    return {
                        terms: [
                            head$650,
                            renamedBodyTerm$667
                        ].concat(forTrees$668.terms),
                        context: forTrees$668.context
                    };
                }
            } else {
                head$650.cond.token.inner = expand$383(head$650.cond.token.inner, context$648);
            }
        }
        var trees$652 = expandToTermTree$380(rest$651, context$648);
        return {
            terms: [head$650].concat(trees$652.terms),
            context: trees$652.context
        };
    }
    function addToDefinitionCtx$381(idents$669, defscope$670, skipRep$671) {
        assert$220(idents$669 && idents$669.length > 0, 'expecting some variable identifiers');
        skipRep$671 = skipRep$671 || false;
        _$212.each(idents$669, function (id$672) {
            var skip$673 = false;
            if (skipRep$671) {
                var declRepeat$674 = _$212.find(defscope$670, function (def$675) {
                        return def$675.id.token.value === id$672.token.value && arraysEqual$325(marksof$323(def$675.id.context), marksof$323(id$672.context));
                    });
                skip$673 = typeof declRepeat$674 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$673) {
                var name$676 = fresh$330();
                defscope$670.push({
                    id: id$672,
                    name: name$676
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$382(term$677, context$678) {
        assert$220(context$678 && context$678.env, 'environment map is required');
        if (term$677.hasPrototype(ArrayLiteral$342)) {
            term$677.array.delim.token.inner = expand$383(term$677.array.delim.expose().token.inner, context$678);
            return term$677;
        } else if (term$677.hasPrototype(Block$341)) {
            term$677.body.delim.token.inner = expand$383(term$677.body.delim.expose().token.inner, context$678);
            return term$677;
        } else if (term$677.hasPrototype(ParenExpression$343)) {
            term$677.expr.delim.token.inner = expand$383(term$677.expr.delim.expose().token.inner, context$678);
            return term$677;
        } else if (term$677.hasPrototype(Call$359)) {
            term$677.fun = expandTermTreeToFinal$382(term$677.fun, context$678);
            term$677.args = _$212.map(term$677.args, function (arg$679) {
                return expandTermTreeToFinal$382(arg$679, context$678);
            });
            return term$677;
        } else if (term$677.hasPrototype(UnaryOp$344)) {
            term$677.expr = expandTermTreeToFinal$382(term$677.expr, context$678);
            return term$677;
        } else if (term$677.hasPrototype(BinOp$346)) {
            term$677.left = expandTermTreeToFinal$382(term$677.left, context$678);
            term$677.right = expandTermTreeToFinal$382(term$677.right, context$678);
            return term$677;
        } else if (term$677.hasPrototype(ObjGet$361)) {
            term$677.right.delim.token.inner = expand$383(term$677.right.delim.expose().token.inner, context$678);
            return term$677;
        } else if (term$677.hasPrototype(ObjDotGet$360)) {
            term$677.left = expandTermTreeToFinal$382(term$677.left, context$678);
            term$677.right = expandTermTreeToFinal$382(term$677.right, context$678);
            return term$677;
        } else if (term$677.hasPrototype(VariableDeclaration$362)) {
            if (term$677.init) {
                term$677.init = expandTermTreeToFinal$382(term$677.init, context$678);
            }
            return term$677;
        } else if (term$677.hasPrototype(VariableStatement$363)) {
            term$677.decls = _$212.map(term$677.decls, function (decl$680) {
                return expandTermTreeToFinal$382(decl$680, context$678);
            });
            return term$677;
        } else if (term$677.hasPrototype(Delimiter$350)) {
            // expand inside the delimiter and then continue on
            term$677.delim.token.inner = expand$383(term$677.delim.expose().token.inner, context$678);
            return term$677;
        } else if (term$677.hasPrototype(NamedFun$352) || term$677.hasPrototype(AnonFun$353) || term$677.hasPrototype(CatchClause$366) || term$677.hasPrototype(ArrowFun$354) || term$677.hasPrototype(Module$367)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$681 = [];
            var bodyContext$682 = makeExpanderContext$384(_$212.defaults({ defscope: newDef$681 }, context$678));
            var paramSingleIdent$683 = term$677.params && term$677.params.token.type === parser$213.Token.Identifier;
            if (term$677.params && term$677.params.token.type === parser$213.Token.Delimiter) {
                var params$690 = term$677.params.expose();
            } else if (paramSingleIdent$683) {
                var params$690 = term$677.params;
            } else {
                var params$690 = syn$214.makeDelim('()', [], null);
            }
            if (Array.isArray(term$677.body)) {
                var bodies$691 = syn$214.makeDelim('{}', term$677.body, null);
            } else {
                var bodies$691 = term$677.body;
            }
            bodies$691 = bodies$691.addDefCtx(newDef$681);
            var paramNames$684 = _$212.map(getParamIdentifiers$332(params$690), function (param$692) {
                    var freshName$693 = fresh$330();
                    return {
                        freshName: freshName$693,
                        originalParam: param$692,
                        renamedParam: param$692.rename(param$692, freshName$693)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$685 = _$212.reduce(paramNames$684, function (accBody$694, p$695) {
                    return accBody$694.rename(p$695.originalParam, p$695.freshName);
                }, bodies$691);
            renamedBody$685 = renamedBody$685.expose();
            var expandedResult$686 = expandToTermTree$380(renamedBody$685.token.inner, bodyContext$682);
            var bodyTerms$687 = expandedResult$686.terms;
            var renamedParams$688 = _$212.map(paramNames$684, function (p$696) {
                    return p$696.renamedParam;
                });
            if (paramSingleIdent$683) {
                var flatArgs$697 = renamedParams$688[0];
            } else {
                var flatArgs$697 = syn$214.makeDelim('()', joinSyntax$321(renamedParams$688, ','), term$677.params);
            }
            var expandedArgs$689 = expand$383([flatArgs$697], bodyContext$682);
            assert$220(expandedArgs$689.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$677.params) {
                term$677.params = expandedArgs$689[0];
            }
            bodyTerms$687 = _$212.map(bodyTerms$687, function (bodyTerm$698) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$699 = bodyTerm$698.addDefCtx(newDef$681);
                // finish expansion
                return expandTermTreeToFinal$382(termWithCtx$699, expandedResult$686.context);
            });
            if (term$677.hasPrototype(Module$367)) {
                bodyTerms$687 = _$212.filter(bodyTerms$687, function (bodyTerm$700) {
                    if (bodyTerm$700.hasPrototype(Export$369)) {
                        term$677.exports.push(bodyTerm$700);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$685.token.inner = bodyTerms$687;
            if (Array.isArray(term$677.body)) {
                term$677.body = renamedBody$685.token.inner;
            } else {
                term$677.body = renamedBody$685;
            }
            // and continue expand the rest
            return term$677;
        }
        // the term is fine as is
        return term$677;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$383(stx$701, context$702) {
        assert$220(context$702, 'must provide an expander context');
        var trees$703 = expandToTermTree$380(stx$701, context$702);
        return _$212.map(trees$703.terms, function (term$704) {
            return expandTermTreeToFinal$382(term$704, trees$703.context);
        });
    }
    function makeExpanderContext$384(o$705) {
        o$705 = o$705 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$705.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$705.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$705.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$705.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$385(stx$706, builtinSource$707) {
        var env$708 = new Map();
        var params$709 = [];
        var context$710, builtInContext$711 = makeExpanderContext$384({ env: env$708 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$707) {
            var builtinRead$714 = parser$213.read(builtinSource$707);
            builtinRead$714 = [
                syn$214.makeIdent('module', null),
                syn$214.makeDelim('{}', builtinRead$714, null)
            ];
            var builtinRes$715 = expand$383(builtinRead$714, builtInContext$711);
            params$709 = _$212.map(builtinRes$715[0].exports, function (term$716) {
                return {
                    oldExport: term$716.name,
                    newParam: syn$214.makeIdent(term$716.name.token.value, null)
                };
            });
        }
        var modBody$712 = syn$214.makeDelim('{}', stx$706, null);
        modBody$712 = _$212.reduce(params$709, function (acc$717, param$718) {
            var newName$719 = fresh$330();
            env$708.set(resolve$324(param$718.newParam.rename(param$718.newParam, newName$719)), env$708.get(resolve$324(param$718.oldExport)));
            return acc$717.rename(param$718.newParam, newName$719);
        }, modBody$712);
        context$710 = makeExpanderContext$384({ env: env$708 });
        var res$713 = expand$383([
                syn$214.makeIdent('module', null),
                modBody$712
            ], context$710);
        res$713 = res$713[0].destruct();
        return flatten$386(res$713[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$386(stx$720) {
        return _$212.reduce(stx$720, function (acc$721, stx$722) {
            if (stx$722.token.type === parser$213.Token.Delimiter) {
                var exposed$723 = stx$722.expose();
                var openParen$724 = syntaxFromToken$320({
                        type: parser$213.Token.Punctuator,
                        value: stx$722.token.value[0],
                        range: stx$722.token.startRange,
                        sm_range: typeof stx$722.token.sm_startRange == 'undefined' ? stx$722.token.startRange : stx$722.token.sm_startRange,
                        lineNumber: stx$722.token.startLineNumber,
                        sm_lineNumber: typeof stx$722.token.sm_startLineNumber == 'undefined' ? stx$722.token.startLineNumber : stx$722.token.sm_startLineNumber,
                        lineStart: stx$722.token.startLineStart,
                        sm_lineStart: typeof stx$722.token.sm_startLineStart == 'undefined' ? stx$722.token.startLineStart : stx$722.token.sm_startLineStart
                    }, exposed$723);
                var closeParen$725 = syntaxFromToken$320({
                        type: parser$213.Token.Punctuator,
                        value: stx$722.token.value[1],
                        range: stx$722.token.endRange,
                        sm_range: typeof stx$722.token.sm_endRange == 'undefined' ? stx$722.token.endRange : stx$722.token.sm_endRange,
                        lineNumber: stx$722.token.endLineNumber,
                        sm_lineNumber: typeof stx$722.token.sm_endLineNumber == 'undefined' ? stx$722.token.endLineNumber : stx$722.token.sm_endLineNumber,
                        lineStart: stx$722.token.endLineStart,
                        sm_lineStart: typeof stx$722.token.sm_endLineStart == 'undefined' ? stx$722.token.endLineStart : stx$722.token.sm_endLineStart
                    }, exposed$723);
                if (stx$722.token.leadingComments) {
                    openParen$724.token.leadingComments = stx$722.token.leadingComments;
                }
                if (stx$722.token.trailingComments) {
                    openParen$724.token.trailingComments = stx$722.token.trailingComments;
                }
                return acc$721.concat(openParen$724).concat(flatten$386(exposed$723.token.inner)).concat(closeParen$725);
            }
            stx$722.token.sm_lineNumber = stx$722.token.sm_lineNumber ? stx$722.token.sm_lineNumber : stx$722.token.lineNumber;
            stx$722.token.sm_lineStart = stx$722.token.sm_lineStart ? stx$722.token.sm_lineStart : stx$722.token.lineStart;
            stx$722.token.sm_range = stx$722.token.sm_range ? stx$722.token.sm_range : stx$722.token.range;
            return acc$721.concat(stx$722);
        }, []);
    }
    exports$211.enforest = enforest$375;
    exports$211.expand = expandTopLevel$385;
    exports$211.resolve = resolve$324;
    exports$211.get_expression = get_expression$376;
    exports$211.makeExpanderContext = makeExpanderContext$384;
    exports$211.Expr = Expr$336;
    exports$211.VariableStatement = VariableStatement$363;
    exports$211.tokensToSyntax = syn$214.tokensToSyntax;
    exports$211.syntaxToTokens = syn$214.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map