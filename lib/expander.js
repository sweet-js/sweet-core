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
(function (root$170, factory$171) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$171(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$171);
    }
}(this, function (exports$172, _$173, parser$174, syn$175, es6$176, se$177, patternModule$178, gen$179) {
    'use strict';
    var codegen$180 = gen$179 || escodegen;
    var assert$181 = syn$175.assert;
    var throwSyntaxError$182 = syn$175.throwSyntaxError;
    var unwrapSyntax$183 = syn$175.unwrapSyntax;
    // used to export "private" methods for unit testing
    exports$172._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$348 = Object.create(this);
                if (typeof o$348.construct === 'function') {
                    o$348.construct.apply(o$348, arguments);
                }
                return o$348;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$349) {
                var result$350 = Object.create(this);
                for (var prop$351 in properties$349) {
                    if (properties$349.hasOwnProperty(prop$351)) {
                        result$350[prop$351] = properties$349[prop$351];
                    }
                }
                return result$350;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$352) {
                function F$353() {
                }
                F$353.prototype = proto$352;
                return this instanceof F$353;
            },
            enumerable: false,
            writable: true
        }
    });
    var scopedEval$273 = se$177.scopedEval;
    var Rename$274 = syn$175.Rename;
    var Mark$275 = syn$175.Mark;
    var Var$276 = syn$175.Var;
    var Def$277 = syn$175.Def;
    var isDef$278 = syn$175.isDef;
    var isMark$279 = syn$175.isMark;
    var isRename$280 = syn$175.isRename;
    var syntaxFromToken$281 = syn$175.syntaxFromToken;
    var joinSyntax$282 = syn$175.joinSyntax;
    function remdup$283(mark$354, mlist$355) {
        if (mark$354 === _$173.first(mlist$355)) {
            return _$173.rest(mlist$355, 1);
        }
        return [mark$354].concat(mlist$355);
    }
    // (CSyntax) -> [...Num]
    function marksof$284(ctx$356, stopName$357, originalName$358) {
        var mark$359, submarks$360;
        if (isMark$279(ctx$356)) {
            mark$359 = ctx$356.mark;
            submarks$360 = marksof$284(ctx$356.context, stopName$357, originalName$358);
            return remdup$283(mark$359, submarks$360);
        }
        if (isDef$278(ctx$356)) {
            return marksof$284(ctx$356.context, stopName$357, originalName$358);
        }
        if (isRename$280(ctx$356)) {
            if (stopName$357 === originalName$358 + '$' + ctx$356.name) {
                return [];
            }
            return marksof$284(ctx$356.context, stopName$357, originalName$358);
        }
        return [];
    }
    function resolve$285(stx$361) {
        return resolveCtx$289(stx$361.token.value, stx$361.context, [], []);
    }
    function arraysEqual$286(a$362, b$363) {
        if (a$362.length !== b$363.length) {
            return false;
        }
        for (var i$364 = 0; i$364 < a$362.length; i$364++) {
            if (a$362[i$364] !== b$363[i$364]) {
                return false;
            }
        }
        return true;
    }
    function renames$287(defctx$365, oldctx$366, originalName$367) {
        var acc$368 = oldctx$366;
        for (var i$369 = 0; i$369 < defctx$365.length; i$369++) {
            if (defctx$365[i$369].id.token.value === originalName$367) {
                acc$368 = Rename$274(defctx$365[i$369].id, defctx$365[i$369].name, acc$368, defctx$365);
            }
        }
        return acc$368;
    }
    function unionEl$288(arr$370, el$371) {
        if (arr$370.indexOf(el$371) === -1) {
            var res$372 = arr$370.slice(0);
            res$372.push(el$371);
            return res$372;
        }
        return arr$370;
    }
    // (Syntax) -> String
    function resolveCtx$289(originalName$373, ctx$374, stop_spine$375, stop_branch$376) {
        if (isMark$279(ctx$374)) {
            return resolveCtx$289(originalName$373, ctx$374.context, stop_spine$375, stop_branch$376);
        }
        if (isDef$278(ctx$374)) {
            if (stop_spine$375.indexOf(ctx$374.defctx) !== -1) {
                return resolveCtx$289(originalName$373, ctx$374.context, stop_spine$375, stop_branch$376);
            } else {
                return resolveCtx$289(originalName$373, renames$287(ctx$374.defctx, ctx$374.context, originalName$373), stop_spine$375, unionEl$288(stop_branch$376, ctx$374.defctx));
            }
        }
        if (isRename$280(ctx$374)) {
            if (originalName$373 === ctx$374.id.token.value) {
                var idName$377 = resolveCtx$289(ctx$374.id.token.value, ctx$374.id.context, stop_branch$376, stop_branch$376);
                var subName$378 = resolveCtx$289(originalName$373, ctx$374.context, unionEl$288(stop_spine$375, ctx$374.def), stop_branch$376);
                if (idName$377 === subName$378) {
                    var idMarks$379 = marksof$284(ctx$374.id.context, originalName$373 + '$' + ctx$374.name, originalName$373);
                    var subMarks$380 = marksof$284(ctx$374.context, originalName$373 + '$' + ctx$374.name, originalName$373);
                    if (arraysEqual$286(idMarks$379, subMarks$380)) {
                        return originalName$373 + '$' + ctx$374.name;
                    }
                }
            }
            return resolveCtx$289(originalName$373, ctx$374.context, stop_spine$375, stop_branch$376);
        }
        return originalName$373;
    }
    var nextFresh$290 = 0;
    // fun () -> Num
    function fresh$291() {
        return nextFresh$290++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$292(towrap$381, delimSyntax$382) {
        assert$181(delimSyntax$382.token.type === parser$174.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$281({
            type: parser$174.Token.Delimiter,
            value: delimSyntax$382.token.value,
            inner: towrap$381,
            range: delimSyntax$382.token.range,
            startLineNumber: delimSyntax$382.token.startLineNumber,
            lineStart: delimSyntax$382.token.lineStart
        }, delimSyntax$382);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$293(argSyntax$383) {
        if (argSyntax$383.token.type === parser$174.Token.Delimiter) {
            return _$173.filter(argSyntax$383.token.inner, function (stx$384) {
                return stx$384.token.value !== ',';
            });
        } else if (argSyntax$383.token.type === parser$174.Token.Identifier) {
            return [argSyntax$383];
        } else {
            assert$181(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$294 = {
            destruct: function () {
                return _$173.reduce(this.properties, _$173.bind(function (acc$385, prop$386) {
                    if (this[prop$386] && this[prop$386].hasPrototype(TermTree$294)) {
                        return acc$385.concat(this[prop$386].destruct());
                    } else if (this[prop$386] && this[prop$386].token && this[prop$386].token.inner) {
                        this[prop$386].token.inner = _$173.reduce(this[prop$386].token.inner, function (acc$387, t$388) {
                            if (t$388.hasPrototype(TermTree$294)) {
                                return acc$387.concat(t$388.destruct());
                            }
                            return acc$387.concat(t$388);
                        }, []);
                        return acc$385.concat(this[prop$386]);
                    } else if (Array.isArray(this[prop$386])) {
                        return acc$385.concat(_$173.reduce(this[prop$386], function (acc$389, t$390) {
                            if (t$390.hasPrototype(TermTree$294)) {
                                return acc$389.concat(t$390.destruct());
                            }
                            return acc$389.concat(t$390);
                        }, []));
                    } else if (this[prop$386]) {
                        return acc$385.concat(this[prop$386]);
                    } else {
                        return acc$385;
                    }
                }, this), []);
            },
            addDefCtx: function (def$391) {
                for (var i$392 = 0; i$392 < this.properties.length; i$392++) {
                    var prop$393 = this.properties[i$392];
                    if (Array.isArray(this[prop$393])) {
                        this[prop$393] = _$173.map(this[prop$393], function (item$394) {
                            return item$394.addDefCtx(def$391);
                        });
                    } else if (this[prop$393]) {
                        this[prop$393] = this[prop$393].addDefCtx(def$391);
                    }
                }
                return this;
            },
            rename: function (id$395, name$396) {
                for (var i$397 = 0; i$397 < this.properties.length; i$397++) {
                    var prop$398 = this.properties[i$397];
                    if (Array.isArray(this[prop$398])) {
                        this[prop$398] = _$173.map(this[prop$398], function (item$399) {
                            return item$399.rename(id$395, name$396);
                        });
                    } else if (this[prop$398]) {
                        this[prop$398] = this[prop$398].rename(id$395, name$396);
                    }
                }
                return this;
            }
        };
    var EOF$295 = TermTree$294.extend({
            properties: ['eof'],
            construct: function (e$400) {
                this.eof = e$400;
            }
        });
    var Statement$296 = TermTree$294.extend({
            construct: function () {
            }
        });
    var Expr$297 = Statement$296.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$298 = Expr$297.extend({
            construct: function () {
            }
        });
    var ThisExpression$299 = PrimaryExpression$298.extend({
            properties: ['this'],
            construct: function (that$401) {
                this.this = that$401;
            }
        });
    var Lit$300 = PrimaryExpression$298.extend({
            properties: ['lit'],
            construct: function (l$402) {
                this.lit = l$402;
            }
        });
    exports$172._test.PropertyAssignment = PropertyAssignment$301;
    var PropertyAssignment$301 = TermTree$294.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$403, assignment$404) {
                this.propName = propName$403;
                this.assignment = assignment$404;
            }
        });
    var Block$302 = PrimaryExpression$298.extend({
            properties: ['body'],
            construct: function (body$405) {
                this.body = body$405;
            }
        });
    var ArrayLiteral$303 = PrimaryExpression$298.extend({
            properties: ['array'],
            construct: function (ar$406) {
                this.array = ar$406;
            }
        });
    var ParenExpression$304 = PrimaryExpression$298.extend({
            properties: ['expr'],
            construct: function (expr$407) {
                this.expr = expr$407;
            }
        });
    var UnaryOp$305 = Expr$297.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$408, expr$409) {
                this.op = op$408;
                this.expr = expr$409;
            }
        });
    var PostfixOp$306 = Expr$297.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$410, op$411) {
                this.expr = expr$410;
                this.op = op$411;
            }
        });
    var BinOp$307 = Expr$297.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$412, left$413, right$414) {
                this.op = op$412;
                this.left = left$413;
                this.right = right$414;
            }
        });
    var ConditionalExpression$308 = Expr$297.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$415, question$416, tru$417, colon$418, fls$419) {
                this.cond = cond$415;
                this.question = question$416;
                this.tru = tru$417;
                this.colon = colon$418;
                this.fls = fls$419;
            }
        });
    var Keyword$309 = TermTree$294.extend({
            properties: ['keyword'],
            construct: function (k$420) {
                this.keyword = k$420;
            }
        });
    var Punc$310 = TermTree$294.extend({
            properties: ['punc'],
            construct: function (p$421) {
                this.punc = p$421;
            }
        });
    var Delimiter$311 = TermTree$294.extend({
            properties: ['delim'],
            construct: function (d$422) {
                this.delim = d$422;
            }
        });
    var Id$312 = PrimaryExpression$298.extend({
            properties: ['id'],
            construct: function (id$423) {
                this.id = id$423;
            }
        });
    var NamedFun$313 = Expr$297.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$424, star$425, name$426, params$427, body$428) {
                this.keyword = keyword$424;
                this.star = star$425;
                this.name = name$426;
                this.params = params$427;
                this.body = body$428;
            }
        });
    var AnonFun$314 = Expr$297.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$429, star$430, params$431, body$432) {
                this.keyword = keyword$429;
                this.star = star$430;
                this.params = params$431;
                this.body = body$432;
            }
        });
    var ArrowFun$315 = Expr$297.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$433, arrow$434, body$435) {
                this.params = params$433;
                this.arrow = arrow$434;
                this.body = body$435;
            }
        });
    var LetMacro$316 = TermTree$294.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$436, body$437) {
                this.name = name$436;
                this.body = body$437;
            }
        });
    var Macro$317 = TermTree$294.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$438, body$439) {
                this.name = name$438;
                this.body = body$439;
            }
        });
    var AnonMacro$318 = TermTree$294.extend({
            properties: ['body'],
            construct: function (body$440) {
                this.body = body$440;
            }
        });
    var Const$319 = Expr$297.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$441, call$442) {
                this.newterm = newterm$441;
                this.call = call$442;
            }
        });
    var Call$320 = Expr$297.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                assert$181(this.fun.hasPrototype(TermTree$294), 'expecting a term tree in destruct of call');
                var that$443 = this;
                this.delim = syntaxFromToken$281(_$173.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$173.reduce(this.args, function (acc$444, term$445) {
                    assert$181(term$445 && term$445.hasPrototype(TermTree$294), 'expecting term trees in destruct of Call');
                    var dst$446 = acc$444.concat(term$445.destruct());
                    // add all commas except for the last one
                    if (that$443.commas.length > 0) {
                        dst$446 = dst$446.concat(that$443.commas.shift());
                    }
                    return dst$446;
                }, []);
                return this.fun.destruct().concat(Delimiter$311.create(this.delim).destruct());
            },
            construct: function (funn$447, args$448, delim$449, commas$450) {
                assert$181(Array.isArray(args$448), 'requires an array of arguments terms');
                this.fun = funn$447;
                this.args = args$448;
                this.delim = delim$449;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$450;
            }
        });
    var ObjDotGet$321 = Expr$297.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$451, dot$452, right$453) {
                this.left = left$451;
                this.dot = dot$452;
                this.right = right$453;
            }
        });
    var ObjGet$322 = Expr$297.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$454, right$455) {
                this.left = left$454;
                this.right = right$455;
            }
        });
    var VariableDeclaration$323 = TermTree$294.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$456, eqstx$457, init$458, comma$459) {
                this.ident = ident$456;
                this.eqstx = eqstx$457;
                this.init = init$458;
                this.comma = comma$459;
            }
        });
    var VariableStatement$324 = Statement$296.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$173.reduce(this.decls, function (acc$460, decl$461) {
                    return acc$460.concat(decl$461.destruct());
                }, []));
            },
            construct: function (varkw$462, decls$463) {
                assert$181(Array.isArray(decls$463), 'decls must be an array');
                this.varkw = varkw$462;
                this.decls = decls$463;
            }
        });
    var LetStatement$325 = Statement$296.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$173.reduce(this.decls, function (acc$464, decl$465) {
                    return acc$464.concat(decl$465.destruct());
                }, []));
            },
            construct: function (letkw$466, decls$467) {
                assert$181(Array.isArray(decls$467), 'decls must be an array');
                this.letkw = letkw$466;
                this.decls = decls$467;
            }
        });
    var ConstStatement$326 = Statement$296.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$173.reduce(this.decls, function (acc$468, decl$469) {
                    return acc$468.concat(decl$469.destruct());
                }, []));
            },
            construct: function (constkw$470, decls$471) {
                assert$181(Array.isArray(decls$471), 'decls must be an array');
                this.constkw = constkw$470;
                this.decls = decls$471;
            }
        });
    var CatchClause$327 = Statement$296.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$472, params$473, body$474) {
                this.catchkw = catchkw$472;
                this.params = params$473;
                this.body = body$474;
            }
        });
    var Module$328 = TermTree$294.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$475) {
                this.body = body$475;
                this.exports = [];
            }
        });
    var Empty$329 = Statement$296.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$330 = TermTree$294.extend({
            properties: ['name'],
            construct: function (name$476) {
                this.name = name$476;
            }
        });
    var ForStatement$331 = Statement$296.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$477, cond$478) {
                this.forkw = forkw$477;
                this.cond = cond$478;
            }
        });
    function stxIsUnaryOp$332(stx$479) {
        var staticOperators$480 = [
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
        return _$173.contains(staticOperators$480, unwrapSyntax$183(stx$479));
    }
    function stxIsBinOp$333(stx$481) {
        var staticOperators$482 = [
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
        return _$173.contains(staticOperators$482, unwrapSyntax$183(stx$481));
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$334(stx$483, context$484, isLet$485) {
        var decls$486 = [];
        var res$487 = enforest$336(stx$483, context$484);
        var result$488 = res$487.result;
        var rest$489 = res$487.rest;
        if (rest$489[0]) {
            if (isLet$485 && result$488.hasPrototype(Id$312)) {
                var freshName$491 = fresh$291();
                var renamedId$492 = result$488.id.rename(result$488.id, freshName$491);
                rest$489 = rest$489.map(function (stx$493) {
                    return stx$493.rename(result$488.id, freshName$491);
                });
                result$488.id = renamedId$492;
            }
            var nextRes$490 = enforest$336(rest$489, context$484);
            // x = ...
            if (nextRes$490.result.hasPrototype(Punc$310) && nextRes$490.result.punc.token.value === '=') {
                var initializerRes$494 = enforest$336(nextRes$490.rest, context$484);
                // x = y + z, ...
                if (initializerRes$494.rest[0] && initializerRes$494.rest[0].token.value === ',') {
                    decls$486.push(VariableDeclaration$323.create(result$488.id, nextRes$490.result.punc, initializerRes$494.result, initializerRes$494.rest[0]));
                    var subRes$495 = enforestVarStatement$334(initializerRes$494.rest.slice(1), context$484, isLet$485);
                    decls$486 = decls$486.concat(subRes$495.result);
                    rest$489 = subRes$495.rest;
                }    // x = y ...
                else {
                    decls$486.push(VariableDeclaration$323.create(result$488.id, nextRes$490.result.punc, initializerRes$494.result));
                    rest$489 = initializerRes$494.rest;
                }
            }    // x ,...;
            else if (nextRes$490.result.hasPrototype(Punc$310) && nextRes$490.result.punc.token.value === ',') {
                decls$486.push(VariableDeclaration$323.create(result$488.id, null, null, nextRes$490.result.punc));
                var subRes$495 = enforestVarStatement$334(nextRes$490.rest, context$484, isLet$485);
                decls$486 = decls$486.concat(subRes$495.result);
                rest$489 = subRes$495.rest;
            } else {
                if (result$488.hasPrototype(Id$312)) {
                    decls$486.push(VariableDeclaration$323.create(result$488.id));
                } else {
                    throwSyntaxError$182('enforest', 'Expecting an identifier in variable declaration', rest$489);
                }
            }
        }    // x EOF
        else {
            if (result$488.hasPrototype(Id$312)) {
                decls$486.push(VariableDeclaration$323.create(result$488.id));
            } else if (result$488.hasPrototype(BinOp$307) && result$488.op.token.value === 'in') {
                decls$486.push(VariableDeclaration$323.create(result$488.left.id, result$488.op, result$488.right));
            } else {
                throwSyntaxError$182('enforest', 'Expecting an identifier in variable declaration', stx$483);
            }
        }
        return {
            result: decls$486,
            rest: rest$489
        };
    }
    function adjustLineContext$335(stx$496, original$497, current$498) {
        current$498 = current$498 || {
            lastLineNumber: original$497.token.lineNumber,
            lineNumber: original$497.token.lineNumber - 1
        };
        return _$173.map(stx$496, function (stx$499) {
            if (stx$499.token.type === parser$174.Token.Delimiter) {
                // handle tokens with missing line info
                stx$499.token.startLineNumber = typeof stx$499.token.startLineNumber == 'undefined' ? original$497.token.lineNumber : stx$499.token.startLineNumber;
                stx$499.token.endLineNumber = typeof stx$499.token.endLineNumber == 'undefined' ? original$497.token.lineNumber : stx$499.token.endLineNumber;
                stx$499.token.startLineStart = typeof stx$499.token.startLineStart == 'undefined' ? original$497.token.lineStart : stx$499.token.startLineStart;
                stx$499.token.endLineStart = typeof stx$499.token.endLineStart == 'undefined' ? original$497.token.lineStart : stx$499.token.endLineStart;
                stx$499.token.startRange = typeof stx$499.token.startRange == 'undefined' ? original$497.token.range : stx$499.token.startRange;
                stx$499.token.endRange = typeof stx$499.token.endRange == 'undefined' ? original$497.token.range : stx$499.token.endRange;
                stx$499.token.sm_startLineNumber = typeof stx$499.token.sm_startLineNumber == 'undefined' ? stx$499.token.startLineNumber : stx$499.token.sm_startLineNumber;
                stx$499.token.sm_endLineNumber = typeof stx$499.token.sm_endLineNumber == 'undefined' ? stx$499.token.endLineNumber : stx$499.token.sm_endLineNumber;
                stx$499.token.sm_startLineStart = typeof stx$499.token.sm_startLineStart == 'undefined' ? stx$499.token.startLineStart : stx$499.token.sm_startLineStart;
                stx$499.token.sm_endLineStart = typeof stx$499.token.sm_endLineStart == 'undefined' ? stx$499.token.endLineStart : stx$499.token.sm_endLineStart;
                stx$499.token.sm_startRange = typeof stx$499.token.sm_startRange == 'undefined' ? stx$499.token.startRange : stx$499.token.sm_startRange;
                stx$499.token.sm_endRange = typeof stx$499.token.sm_endRange == 'undefined' ? stx$499.token.endRange : stx$499.token.sm_endRange;
                if (stx$499.token.startLineNumber === current$498.lastLineNumber && current$498.lastLineNumber !== current$498.lineNumber) {
                    stx$499.token.startLineNumber = current$498.lineNumber;
                } else if (stx$499.token.startLineNumber !== current$498.lastLineNumber) {
                    current$498.lineNumber++;
                    current$498.lastLineNumber = stx$499.token.startLineNumber;
                    stx$499.token.startLineNumber = current$498.lineNumber;
                }
                if (stx$499.token.inner.length > 0) {
                    stx$499.token.inner = adjustLineContext$335(stx$499.token.inner, original$497, current$498);
                }
                return stx$499;
            }
            // handle tokens with missing line info
            stx$499.token.lineNumber = typeof stx$499.token.lineNumber == 'undefined' ? original$497.token.lineNumber : stx$499.token.lineNumber;
            stx$499.token.lineStart = typeof stx$499.token.lineStart == 'undefined' ? original$497.token.lineStart : stx$499.token.lineStart;
            stx$499.token.range = typeof stx$499.token.range == 'undefined' ? original$497.token.range : stx$499.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$499.token.sm_lineNumber = typeof stx$499.token.sm_lineNumber == 'undefined' ? stx$499.token.lineNumber : stx$499.token.sm_lineNumber;
            stx$499.token.sm_lineStart = typeof stx$499.token.sm_lineStart == 'undefined' ? stx$499.token.lineStart : stx$499.token.sm_lineStart;
            stx$499.token.sm_range = typeof stx$499.token.sm_range == 'undefined' ? _$173.clone(stx$499.token.range) : stx$499.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$499.token.lineNumber === current$498.lastLineNumber && current$498.lastLineNumber !== current$498.lineNumber) {
                stx$499.token.lineNumber = current$498.lineNumber;
            } else if (stx$499.token.lineNumber !== current$498.lastLineNumber) {
                current$498.lineNumber++;
                current$498.lastLineNumber = stx$499.token.lineNumber;
                stx$499.token.lineNumber = current$498.lineNumber;
            }
            return stx$499;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$336(toks$500, context$501) {
        assert$181(toks$500.length > 0, 'enforest assumes there are tokens to work with');
        function step$502(head$503, rest$504) {
            var innerTokens$505;
            assert$181(Array.isArray(rest$504), 'result must at least be an empty array');
            if (head$503.hasPrototype(TermTree$294)) {
                // function call
                var emp$508 = head$503.emp;
                var emp$508 = head$503.emp;
                var keyword$511 = head$503.keyword;
                var delim$513 = head$503.delim;
                var id$515 = head$503.id;
                var delim$513 = head$503.delim;
                var emp$508 = head$503.emp;
                var punc$519 = head$503.punc;
                var keyword$511 = head$503.keyword;
                var emp$508 = head$503.emp;
                var emp$508 = head$503.emp;
                var emp$508 = head$503.emp;
                var delim$513 = head$503.delim;
                var delim$513 = head$503.delim;
                var id$515 = head$503.id;
                var keyword$511 = head$503.keyword;
                var keyword$511 = head$503.keyword;
                var keyword$511 = head$503.keyword;
                var keyword$511 = head$503.keyword;
                var keyword$511 = head$503.keyword;
                if (head$503.hasPrototype(Expr$297) && rest$504[0] && rest$504[0].token.type === parser$174.Token.Delimiter && rest$504[0].token.value === '()') {
                    var argRes$554, enforestedArgs$555 = [], commas$556 = [];
                    rest$504[0].expose();
                    innerTokens$505 = rest$504[0].token.inner;
                    while (innerTokens$505.length > 0) {
                        argRes$554 = enforest$336(innerTokens$505, context$501);
                        enforestedArgs$555.push(argRes$554.result);
                        innerTokens$505 = argRes$554.rest;
                        if (innerTokens$505[0] && innerTokens$505[0].token.value === ',') {
                            // record the comma for later
                            commas$556.push(innerTokens$505[0]);
                            // but dump it for the next loop turn
                            innerTokens$505 = innerTokens$505.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$557 = _$173.all(enforestedArgs$555, function (argTerm$558) {
                            return argTerm$558.hasPrototype(Expr$297);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$505.length === 0 && argsAreExprs$557) {
                        return step$502(Call$320.create(head$503, enforestedArgs$555, rest$504[0], commas$556), rest$504.slice(1));
                    }
                } else if (head$503.hasPrototype(Expr$297) && rest$504[0] && unwrapSyntax$183(rest$504[0]) === '?') {
                    var question$559 = rest$504[0];
                    var condRes$560 = enforest$336(rest$504.slice(1), context$501);
                    var truExpr$561 = condRes$560.result;
                    var right$562 = condRes$560.rest;
                    if (truExpr$561.hasPrototype(Expr$297) && right$562[0] && unwrapSyntax$183(right$562[0]) === ':') {
                        var colon$563 = right$562[0];
                        var flsRes$564 = enforest$336(right$562.slice(1), context$501);
                        var flsExpr$565 = flsRes$564.result;
                        if (flsExpr$565.hasPrototype(Expr$297)) {
                            return step$502(ConditionalExpression$308.create(head$503, question$559, truExpr$561, colon$563, flsExpr$565), flsRes$564.rest);
                        }
                    }
                } else if (head$503.hasPrototype(Keyword$309) && unwrapSyntax$183(keyword$511) === 'new' && rest$504[0]) {
                    var newCallRes$566 = enforest$336(rest$504, context$501);
                    if (newCallRes$566.result.hasPrototype(Call$320)) {
                        return step$502(Const$319.create(head$503, newCallRes$566.result), newCallRes$566.rest);
                    }
                } else if (head$503.hasPrototype(Delimiter$311) && delim$513.token.value === '()' && rest$504[0] && rest$504[0].token.type === parser$174.Token.Punctuator && unwrapSyntax$183(rest$504[0]) === '=>') {
                    var res$567 = enforest$336(rest$504.slice(1), context$501);
                    if (res$567.result.hasPrototype(Expr$297)) {
                        return step$502(ArrowFun$315.create(delim$513, rest$504[0], res$567.result.destruct()), res$567.rest);
                    } else {
                        throwSyntaxError$182('enforest', 'Body of arrow function must be an expression', rest$504.slice(1));
                    }
                } else if (head$503.hasPrototype(Id$312) && rest$504[0] && rest$504[0].token.type === parser$174.Token.Punctuator && unwrapSyntax$183(rest$504[0]) === '=>') {
                    var res$567 = enforest$336(rest$504.slice(1), context$501);
                    if (res$567.result.hasPrototype(Expr$297)) {
                        return step$502(ArrowFun$315.create(id$515, rest$504[0], res$567.result.destruct()), res$567.rest);
                    } else {
                        throwSyntaxError$182('enforest', 'Body of arrow function must be an expression', rest$504.slice(1));
                    }
                } else if (head$503.hasPrototype(Delimiter$311) && delim$513.token.value === '()') {
                    innerTokens$505 = delim$513.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$505.length === 0) {
                        return step$502(ParenExpression$304.create(head$503), rest$504);
                    } else {
                        var innerTerm$568 = get_expression$337(innerTokens$505, context$501);
                        if (innerTerm$568.result && innerTerm$568.result.hasPrototype(Expr$297)) {
                            return step$502(ParenExpression$304.create(head$503), rest$504);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$503.hasPrototype(Expr$297) && rest$504[0] && rest$504[1] && stxIsBinOp$333(rest$504[0])) {
                    var op$569 = rest$504[0];
                    var left$570 = head$503;
                    var bopRes$571 = enforest$336(rest$504.slice(1), context$501);
                    var right$562 = bopRes$571.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$562.hasPrototype(Expr$297)) {
                        return step$502(BinOp$307.create(op$569, left$570, right$562), bopRes$571.rest);
                    }
                } else if (head$503.hasPrototype(Punc$310) && stxIsUnaryOp$332(punc$519)) {
                    var unopRes$572 = enforest$336(rest$504, context$501);
                    if (unopRes$572.result.hasPrototype(Expr$297)) {
                        return step$502(UnaryOp$305.create(punc$519, unopRes$572.result), unopRes$572.rest);
                    }
                } else if (head$503.hasPrototype(Keyword$309) && stxIsUnaryOp$332(keyword$511)) {
                    var unopRes$572 = enforest$336(rest$504, context$501);
                    if (unopRes$572.result.hasPrototype(Expr$297)) {
                        return step$502(UnaryOp$305.create(keyword$511, unopRes$572.result), unopRes$572.rest);
                    }
                } else if (head$503.hasPrototype(Expr$297) && rest$504[0] && (unwrapSyntax$183(rest$504[0]) === '++' || unwrapSyntax$183(rest$504[0]) === '--')) {
                    return step$502(PostfixOp$306.create(head$503, rest$504[0]), rest$504.slice(1));
                } else if (head$503.hasPrototype(Expr$297) && rest$504[0] && rest$504[0].token.value === '[]') {
                    return step$502(ObjGet$322.create(head$503, Delimiter$311.create(rest$504[0].expose())), rest$504.slice(1));
                } else if (head$503.hasPrototype(Expr$297) && rest$504[0] && unwrapSyntax$183(rest$504[0]) === '.' && rest$504[1] && rest$504[1].token.type === parser$174.Token.Identifier) {
                    return step$502(ObjDotGet$321.create(head$503, rest$504[0], rest$504[1]), rest$504.slice(2));
                } else if (head$503.hasPrototype(Delimiter$311) && delim$513.token.value === '[]') {
                    return step$502(ArrayLiteral$303.create(head$503), rest$504);
                } else if (head$503.hasPrototype(Delimiter$311) && head$503.delim.token.value === '{}') {
                    return step$502(Block$302.create(head$503), rest$504);
                } else if (head$503.hasPrototype(Id$312) && unwrapSyntax$183(id$515) === '#quoteSyntax' && rest$504[0] && rest$504[0].token.value === '{}') {
                    var tempId$573 = fresh$291();
                    context$501.templateMap.set(tempId$573, rest$504[0].token.inner);
                    return step$502(syn$175.makeIdent('getTemplate', id$515), [syn$175.makeDelim('()', [syn$175.makeValue(tempId$573, id$515)], id$515)].concat(rest$504.slice(1)));
                } else if (head$503.hasPrototype(Keyword$309) && unwrapSyntax$183(keyword$511) === 'let' && (rest$504[0] && rest$504[0].token.type === parser$174.Token.Identifier || rest$504[0] && rest$504[0].token.type === parser$174.Token.Keyword || rest$504[0] && rest$504[0].token.type === parser$174.Token.Punctuator) && rest$504[1] && unwrapSyntax$183(rest$504[1]) === '=' && rest$504[2] && rest$504[2].token.value === 'macro') {
                    var mac$574 = enforest$336(rest$504.slice(2), context$501);
                    if (!mac$574.result.hasPrototype(AnonMacro$318)) {
                        throwSyntaxError$182('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$504.slice(2));
                    }
                    return step$502(LetMacro$316.create(rest$504[0], mac$574.result.body), mac$574.rest);
                } else if (head$503.hasPrototype(Keyword$309) && unwrapSyntax$183(keyword$511) === 'var' && rest$504[0]) {
                    var vsRes$575 = enforestVarStatement$334(rest$504, context$501, false);
                    if (vsRes$575) {
                        return step$502(VariableStatement$324.create(head$503, vsRes$575.result), vsRes$575.rest);
                    }
                } else if (head$503.hasPrototype(Keyword$309) && unwrapSyntax$183(keyword$511) === 'let' && rest$504[0]) {
                    var vsRes$575 = enforestVarStatement$334(rest$504, context$501, true);
                    if (vsRes$575) {
                        return step$502(LetStatement$325.create(head$503, vsRes$575.result), vsRes$575.rest);
                    }
                } else if (head$503.hasPrototype(Keyword$309) && unwrapSyntax$183(keyword$511) === 'const' && rest$504[0]) {
                    var vsRes$575 = enforestVarStatement$334(rest$504, context$501, true);
                    if (vsRes$575) {
                        return step$502(ConstStatement$326.create(head$503, vsRes$575.result), vsRes$575.rest);
                    }
                } else if (head$503.hasPrototype(Keyword$309) && unwrapSyntax$183(keyword$511) === 'for' && rest$504[0] && rest$504[0].token.value === '()') {
                    return step$502(ForStatement$331.create(keyword$511, rest$504[0]), rest$504.slice(1));
                }
            } else {
                assert$181(head$503 && head$503.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$503.token.type === parser$174.Token.Identifier || head$503.token.type === parser$174.Token.Keyword || head$503.token.type === parser$174.Token.Punctuator) && context$501.env.has(resolve$285(head$503))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$576 = fresh$291();
                    var transformerContext$577 = makeExpanderContext$345(_$173.defaults({ mark: newMark$576 }, context$501));
                    // pull the macro transformer out the environment
                    var transformer$578 = context$501.env.get(resolve$285(head$503)).fn;
                    // apply the transformer
                    try {
                        var rt$579 = transformer$578([head$503].concat(rest$504), transformerContext$577);
                    } catch (e$580) {
                        if (e$580.type && e$580.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$581 = '`' + rest$504.slice(0, 5).map(function (stx$582) {
                                    return stx$582.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$182('macro', 'Macro `' + head$503.token.value + '` could not be matched with ' + argumentString$581, head$503);
                        } else {
                            // just rethrow it
                            throw e$580;
                        }
                    }
                    if (!Array.isArray(rt$579.result)) {
                        throwSyntaxError$182('enforest', 'Macro must return a syntax array', head$503);
                    }
                    if (rt$579.result.length > 0) {
                        var adjustedResult$583 = adjustLineContext$335(rt$579.result, head$503);
                        adjustedResult$583[0].token.leadingComments = head$503.token.leadingComments;
                        return step$502(adjustedResult$583[0], adjustedResult$583.slice(1).concat(rt$579.rest));
                    } else {
                        return step$502(Empty$329.create(), rt$579.rest);
                    }
                }    // anon macro definition
                else if (head$503.token.type === parser$174.Token.Identifier && head$503.token.value === 'macro' && rest$504[0] && rest$504[0].token.value === '{}') {
                    return step$502(AnonMacro$318.create(rest$504[0].expose().token.inner), rest$504.slice(1));
                }    // macro definition
                else if (head$503.token.type === parser$174.Token.Identifier && head$503.token.value === 'macro' && rest$504[0] && (rest$504[0].token.type === parser$174.Token.Identifier || rest$504[0].token.type === parser$174.Token.Keyword || rest$504[0].token.type === parser$174.Token.Punctuator) && rest$504[1] && rest$504[1].token.type === parser$174.Token.Delimiter && rest$504[1].token.value === '{}') {
                    return step$502(Macro$317.create(rest$504[0], rest$504[1].expose().token.inner), rest$504.slice(2));
                }    // module definition
                else if (unwrapSyntax$183(head$503) === 'module' && rest$504[0] && rest$504[0].token.value === '{}') {
                    return step$502(Module$328.create(rest$504[0]), rest$504.slice(1));
                }    // function definition
                else if (head$503.token.type === parser$174.Token.Keyword && unwrapSyntax$183(head$503) === 'function' && rest$504[0] && rest$504[0].token.type === parser$174.Token.Identifier && rest$504[1] && rest$504[1].token.type === parser$174.Token.Delimiter && rest$504[1].token.value === '()' && rest$504[2] && rest$504[2].token.type === parser$174.Token.Delimiter && rest$504[2].token.value === '{}') {
                    rest$504[1].token.inner = rest$504[1].expose().token.inner;
                    rest$504[2].token.inner = rest$504[2].expose().token.inner;
                    return step$502(NamedFun$313.create(head$503, null, rest$504[0], rest$504[1], rest$504[2]), rest$504.slice(3));
                }    // generator function definition
                else if (head$503.token.type === parser$174.Token.Keyword && unwrapSyntax$183(head$503) === 'function' && rest$504[0] && rest$504[0].token.type === parser$174.Token.Punctuator && rest$504[0].token.value === '*' && rest$504[1] && rest$504[1].token.type === parser$174.Token.Identifier && rest$504[2] && rest$504[2].token.type === parser$174.Token.Delimiter && rest$504[2].token.value === '()' && rest$504[3] && rest$504[3].token.type === parser$174.Token.Delimiter && rest$504[3].token.value === '{}') {
                    rest$504[2].token.inner = rest$504[2].expose().token.inner;
                    rest$504[3].token.inner = rest$504[3].expose().token.inner;
                    return step$502(NamedFun$313.create(head$503, rest$504[0], rest$504[1], rest$504[2], rest$504[3]), rest$504.slice(4));
                }    // anonymous function definition
                else if (head$503.token.type === parser$174.Token.Keyword && unwrapSyntax$183(head$503) === 'function' && rest$504[0] && rest$504[0].token.type === parser$174.Token.Delimiter && rest$504[0].token.value === '()' && rest$504[1] && rest$504[1].token.type === parser$174.Token.Delimiter && rest$504[1].token.value === '{}') {
                    rest$504[0].token.inner = rest$504[0].expose().token.inner;
                    rest$504[1].token.inner = rest$504[1].expose().token.inner;
                    return step$502(AnonFun$314.create(head$503, null, rest$504[0], rest$504[1]), rest$504.slice(2));
                }    // anonymous generator function definition
                else if (head$503.token.type === parser$174.Token.Keyword && unwrapSyntax$183(head$503) === 'function' && rest$504[0] && rest$504[0].token.type === parser$174.Token.Punctuator && rest$504[0].token.value === '*' && rest$504[1] && rest$504[1].token.type === parser$174.Token.Delimiter && rest$504[1].token.value === '()' && rest$504[2] && rest$504[2].token.type === parser$174.Token.Delimiter && rest$504[2].token.value === '{}') {
                    rest$504[1].token.inner = rest$504[1].expose().token.inner;
                    rest$504[2].token.inner = rest$504[2].expose().token.inner;
                    return step$502(AnonFun$314.create(head$503, rest$504[0], rest$504[1], rest$504[2]), rest$504.slice(3));
                }    // arrow function
                else if ((head$503.token.type === parser$174.Token.Delimiter && head$503.token.value === '()' || head$503.token.type === parser$174.Token.Identifier) && rest$504[0] && rest$504[0].token.type === parser$174.Token.Punctuator && rest$504[0].token.value === '=>' && rest$504[1] && rest$504[1].token.type === parser$174.Token.Delimiter && rest$504[1].token.value === '{}') {
                    return step$502(ArrowFun$315.create(head$503, rest$504[0], rest$504[1]), rest$504.slice(2));
                }    // catch statement
                else if (head$503.token.type === parser$174.Token.Keyword && unwrapSyntax$183(head$503) === 'catch' && rest$504[0] && rest$504[0].token.type === parser$174.Token.Delimiter && rest$504[0].token.value === '()' && rest$504[1] && rest$504[1].token.type === parser$174.Token.Delimiter && rest$504[1].token.value === '{}') {
                    rest$504[0].token.inner = rest$504[0].expose().token.inner;
                    rest$504[1].token.inner = rest$504[1].expose().token.inner;
                    return step$502(CatchClause$327.create(head$503, rest$504[0], rest$504[1]), rest$504.slice(2));
                }    // this expression
                else if (head$503.token.type === parser$174.Token.Keyword && unwrapSyntax$183(head$503) === 'this') {
                    return step$502(ThisExpression$299.create(head$503), rest$504);
                }    // literal
                else if (head$503.token.type === parser$174.Token.NumericLiteral || head$503.token.type === parser$174.Token.StringLiteral || head$503.token.type === parser$174.Token.BooleanLiteral || head$503.token.type === parser$174.Token.RegularExpression || head$503.token.type === parser$174.Token.NullLiteral) {
                    return step$502(Lit$300.create(head$503), rest$504);
                }    // export
                else if (head$503.token.type === parser$174.Token.Keyword && unwrapSyntax$183(head$503) === 'export' && rest$504[0] && (rest$504[0].token.type === parser$174.Token.Identifier || rest$504[0].token.type === parser$174.Token.Keyword || rest$504[0].token.type === parser$174.Token.Punctuator)) {
                    return step$502(Export$330.create(rest$504[0]), rest$504.slice(1));
                }    // identifier
                else if (head$503.token.type === parser$174.Token.Identifier) {
                    return step$502(Id$312.create(head$503), rest$504);
                }    // punctuator
                else if (head$503.token.type === parser$174.Token.Punctuator) {
                    return step$502(Punc$310.create(head$503), rest$504);
                } else if (head$503.token.type === parser$174.Token.Keyword && unwrapSyntax$183(head$503) === 'with') {
                    throwSyntaxError$182('enforest', 'with is not supported in sweet.js', head$503);
                }    // keyword
                else if (head$503.token.type === parser$174.Token.Keyword) {
                    return step$502(Keyword$309.create(head$503), rest$504);
                }    // Delimiter
                else if (head$503.token.type === parser$174.Token.Delimiter) {
                    return step$502(Delimiter$311.create(head$503.expose()), rest$504);
                }    // end of file
                else if (head$503.token.type === parser$174.Token.EOF) {
                    assert$181(rest$504.length === 0, 'nothing should be after an EOF');
                    return step$502(EOF$295.create(head$503), []);
                } else {
                    // todo: are we missing cases?
                    assert$181(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$503,
                rest: rest$504
            };
        }
        return step$502(toks$500[0], toks$500.slice(1));
    }
    function get_expression$337(stx$584, context$585) {
        var res$586 = enforest$336(stx$584, context$585);
        if (!res$586.result.hasPrototype(Expr$297)) {
            return {
                result: null,
                rest: stx$584
            };
        }
        return res$586;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$338(newMark$587, env$588) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$589(match$590) {
            if (match$590.level === 0) {
                // replace the match property with the marked syntax
                match$590.match = _$173.map(match$590.match, function (stx$591) {
                    return stx$591.mark(newMark$587);
                });
            } else {
                _$173.each(match$590.match, function (match$592) {
                    dfs$589(match$592);
                });
            }
        }
        _$173.keys(env$588).forEach(function (key$593) {
            dfs$589(env$588[key$593]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$339(mac$594, context$595) {
        var body$596 = mac$594.body;
        // raw function primitive form
        if (!(body$596[0] && body$596[0].token.type === parser$174.Token.Keyword && body$596[0].token.value === 'function')) {
            throwSyntaxError$182('load macro', 'Primitive macro form must contain a function for the macro body', body$596);
        }
        var stub$597 = parser$174.read('()');
        stub$597[0].token.inner = body$596;
        var expanded$598 = expand$344(stub$597, context$595);
        expanded$598 = expanded$598[0].destruct().concat(expanded$598[1].eof);
        var flattend$599 = flatten$347(expanded$598);
        var bodyCode$600 = codegen$180.generate(parser$174.parse(flattend$599));
        var macroFn$601 = scopedEval$273(bodyCode$600, {
                makeValue: syn$175.makeValue,
                makeRegex: syn$175.makeRegex,
                makeIdent: syn$175.makeIdent,
                makeKeyword: syn$175.makeKeyword,
                makePunc: syn$175.makePunc,
                makeDelim: syn$175.makeDelim,
                unwrapSyntax: syn$175.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$182,
                parser: parser$174,
                _: _$173,
                patternModule: patternModule$178,
                getTemplate: function (id$602) {
                    return cloneSyntaxArray$340(context$595.templateMap.get(id$602));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$338,
                mergeMatches: function (newMatch$603, oldMatch$604) {
                    newMatch$603.patternEnv = _$173.extend({}, oldMatch$604.patternEnv, newMatch$603.patternEnv);
                    return newMatch$603;
                }
            });
        return macroFn$601;
    }
    function cloneSyntaxArray$340(arr$605) {
        return arr$605.map(function (stx$606) {
            var o$607 = syntaxFromToken$281(_$173.clone(stx$606.token), stx$606);
            if (o$607.token.type === parser$174.Token.Delimiter) {
                o$607.token.inner = cloneSyntaxArray$340(o$607.token.inner);
            }
            return o$607;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$341(stx$608, context$609) {
        assert$181(context$609, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$608.length === 0) {
            return {
                terms: [],
                context: context$609
            };
        }
        assert$181(stx$608[0].token, 'expecting a syntax object');
        var f$610 = enforest$336(stx$608, context$609);
        // head :: TermTree
        var head$611 = f$610.result;
        // rest :: [Syntax]
        var rest$612 = f$610.rest;
        if (head$611.hasPrototype(Macro$317)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$614 = loadMacroDef$339(head$611, context$609);
            addToDefinitionCtx$342([head$611.name], context$609.defscope, false);
            context$609.env.set(resolve$285(head$611.name), { fn: macroDefinition$614 });
            return expandToTermTree$341(rest$612, context$609);
        }
        if (head$611.hasPrototype(LetMacro$316)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$614 = loadMacroDef$339(head$611, context$609);
            var freshName$615 = fresh$291();
            var renamedName$616 = head$611.name.rename(head$611.name, freshName$615);
            rest$612 = _$173.map(rest$612, function (stx$617) {
                return stx$617.rename(head$611.name, freshName$615);
            });
            head$611.name = renamedName$616;
            context$609.env.set(resolve$285(head$611.name), { fn: macroDefinition$614 });
            return expandToTermTree$341(rest$612, context$609);
        }
        if (head$611.hasPrototype(NamedFun$313)) {
            addToDefinitionCtx$342([head$611.name], context$609.defscope, true);
        }
        if (head$611.hasPrototype(VariableStatement$324)) {
            addToDefinitionCtx$342(_$173.map(head$611.decls, function (decl$618) {
                return decl$618.ident;
            }), context$609.defscope, true);
        }
        if (head$611.hasPrototype(Block$302) && head$611.body.hasPrototype(Delimiter$311)) {
            head$611.body.delim.token.inner.forEach(function (term$619) {
                if (term$619.hasPrototype(VariableStatement$324)) {
                    addToDefinitionCtx$342(_$173.map(term$619.decls, function (decl$620) {
                        return decl$620.ident;
                    }), context$609.defscope, true);
                }
            });
        }
        if (head$611.hasPrototype(Delimiter$311)) {
            head$611.delim.token.inner.forEach(function (term$621) {
                if (term$621.hasPrototype(VariableStatement$324)) {
                    addToDefinitionCtx$342(_$173.map(term$621.decls, function (decl$622) {
                        return decl$622.ident;
                    }), context$609.defscope, true);
                }
            });
        }
        if (head$611.hasPrototype(ForStatement$331)) {
            head$611.cond.expose();
            var forCond$623 = head$611.cond.token.inner;
            if (forCond$623[0] && resolve$285(forCond$623[0]) === 'let' && forCond$623[1] && forCond$623[1].token.type === parser$174.Token.Identifier) {
                var letNew$624 = fresh$291();
                var letId$625 = forCond$623[1];
                forCond$623 = forCond$623.map(function (stx$626) {
                    return stx$626.rename(letId$625, letNew$624);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$611.cond.token.inner = expand$344([forCond$623[0]], context$609).concat(expand$344(forCond$623.slice(1), context$609));
                // nice and easy case: `for (...) { ... }`
                if (rest$612[0] && rest$612[0].token.value === '{}') {
                    rest$612[0] = rest$612[0].rename(letId$625, letNew$624);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$627 = enforest$336(rest$612, context$609);
                    var renamedBodyTerm$628 = bodyEnf$627.result.rename(letId$625, letNew$624);
                    var forTrees$629 = expandToTermTree$341(bodyEnf$627.rest, context$609);
                    return {
                        terms: [
                            head$611,
                            renamedBodyTerm$628
                        ].concat(forTrees$629.terms),
                        context: forTrees$629.context
                    };
                }
            } else {
                head$611.cond.token.inner = expand$344(head$611.cond.token.inner, context$609);
            }
        }
        var trees$613 = expandToTermTree$341(rest$612, context$609);
        return {
            terms: [head$611].concat(trees$613.terms),
            context: trees$613.context
        };
    }
    function addToDefinitionCtx$342(idents$630, defscope$631, skipRep$632) {
        assert$181(idents$630 && idents$630.length > 0, 'expecting some variable identifiers');
        skipRep$632 = skipRep$632 || false;
        _$173.each(idents$630, function (id$633) {
            var skip$634 = false;
            if (skipRep$632) {
                var declRepeat$635 = _$173.find(defscope$631, function (def$636) {
                        return def$636.id.token.value === id$633.token.value && arraysEqual$286(marksof$284(def$636.id.context), marksof$284(id$633.context));
                    });
                skip$634 = typeof declRepeat$635 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$634) {
                var name$637 = fresh$291();
                defscope$631.push({
                    id: id$633,
                    name: name$637
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$343(term$638, context$639) {
        assert$181(context$639 && context$639.env, 'environment map is required');
        if (term$638.hasPrototype(ArrayLiteral$303)) {
            term$638.array.delim.token.inner = expand$344(term$638.array.delim.expose().token.inner, context$639);
            return term$638;
        } else if (term$638.hasPrototype(Block$302)) {
            term$638.body.delim.token.inner = expand$344(term$638.body.delim.expose().token.inner, context$639);
            return term$638;
        } else if (term$638.hasPrototype(ParenExpression$304)) {
            term$638.expr.delim.token.inner = expand$344(term$638.expr.delim.expose().token.inner, context$639);
            return term$638;
        } else if (term$638.hasPrototype(Call$320)) {
            term$638.fun = expandTermTreeToFinal$343(term$638.fun, context$639);
            term$638.args = _$173.map(term$638.args, function (arg$640) {
                return expandTermTreeToFinal$343(arg$640, context$639);
            });
            return term$638;
        } else if (term$638.hasPrototype(UnaryOp$305)) {
            term$638.expr = expandTermTreeToFinal$343(term$638.expr, context$639);
            return term$638;
        } else if (term$638.hasPrototype(BinOp$307)) {
            term$638.left = expandTermTreeToFinal$343(term$638.left, context$639);
            term$638.right = expandTermTreeToFinal$343(term$638.right, context$639);
            return term$638;
        } else if (term$638.hasPrototype(ObjGet$322)) {
            term$638.right.delim.token.inner = expand$344(term$638.right.delim.expose().token.inner, context$639);
            return term$638;
        } else if (term$638.hasPrototype(ObjDotGet$321)) {
            term$638.left = expandTermTreeToFinal$343(term$638.left, context$639);
            term$638.right = expandTermTreeToFinal$343(term$638.right, context$639);
            return term$638;
        } else if (term$638.hasPrototype(VariableDeclaration$323)) {
            if (term$638.init) {
                term$638.init = expandTermTreeToFinal$343(term$638.init, context$639);
            }
            return term$638;
        } else if (term$638.hasPrototype(VariableStatement$324)) {
            term$638.decls = _$173.map(term$638.decls, function (decl$641) {
                return expandTermTreeToFinal$343(decl$641, context$639);
            });
            return term$638;
        } else if (term$638.hasPrototype(Delimiter$311)) {
            // expand inside the delimiter and then continue on
            term$638.delim.token.inner = expand$344(term$638.delim.expose().token.inner, context$639);
            return term$638;
        } else if (term$638.hasPrototype(NamedFun$313) || term$638.hasPrototype(AnonFun$314) || term$638.hasPrototype(CatchClause$327) || term$638.hasPrototype(ArrowFun$315) || term$638.hasPrototype(Module$328)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$642 = [];
            var bodyContext$643 = makeExpanderContext$345(_$173.defaults({ defscope: newDef$642 }, context$639));
            var paramSingleIdent$644 = term$638.params && term$638.params.token.type === parser$174.Token.Identifier;
            if (term$638.params && term$638.params.token.type === parser$174.Token.Delimiter) {
                var params$651 = term$638.params.expose();
            } else if (paramSingleIdent$644) {
                var params$651 = term$638.params;
            } else {
                var params$651 = syn$175.makeDelim('()', [], null);
            }
            if (Array.isArray(term$638.body)) {
                var bodies$652 = syn$175.makeDelim('{}', term$638.body, null);
            } else {
                var bodies$652 = term$638.body;
            }
            bodies$652 = bodies$652.addDefCtx(newDef$642);
            var paramNames$645 = _$173.map(getParamIdentifiers$293(params$651), function (param$653) {
                    var freshName$654 = fresh$291();
                    return {
                        freshName: freshName$654,
                        originalParam: param$653,
                        renamedParam: param$653.rename(param$653, freshName$654)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$646 = _$173.reduce(paramNames$645, function (accBody$655, p$656) {
                    return accBody$655.rename(p$656.originalParam, p$656.freshName);
                }, bodies$652);
            renamedBody$646 = renamedBody$646.expose();
            var expandedResult$647 = expandToTermTree$341(renamedBody$646.token.inner, bodyContext$643);
            var bodyTerms$648 = expandedResult$647.terms;
            var renamedParams$649 = _$173.map(paramNames$645, function (p$657) {
                    return p$657.renamedParam;
                });
            if (paramSingleIdent$644) {
                var flatArgs$658 = renamedParams$649[0];
            } else {
                var flatArgs$658 = syn$175.makeDelim('()', joinSyntax$282(renamedParams$649, ','), term$638.params);
            }
            var expandedArgs$650 = expand$344([flatArgs$658], bodyContext$643);
            assert$181(expandedArgs$650.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$638.params) {
                term$638.params = expandedArgs$650[0];
            }
            bodyTerms$648 = _$173.map(bodyTerms$648, function (bodyTerm$659) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$660 = bodyTerm$659.addDefCtx(newDef$642);
                // finish expansion
                return expandTermTreeToFinal$343(termWithCtx$660, expandedResult$647.context);
            });
            if (term$638.hasPrototype(Module$328)) {
                bodyTerms$648 = _$173.filter(bodyTerms$648, function (bodyTerm$661) {
                    if (bodyTerm$661.hasPrototype(Export$330)) {
                        term$638.exports.push(bodyTerm$661);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$646.token.inner = bodyTerms$648;
            if (Array.isArray(term$638.body)) {
                term$638.body = renamedBody$646.token.inner;
            } else {
                term$638.body = renamedBody$646;
            }
            // and continue expand the rest
            return term$638;
        }
        // the term is fine as is
        return term$638;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$344(stx$662, context$663) {
        assert$181(context$663, 'must provide an expander context');
        var trees$664 = expandToTermTree$341(stx$662, context$663);
        return _$173.map(trees$664.terms, function (term$665) {
            return expandTermTreeToFinal$343(term$665, trees$664.context);
        });
    }
    function makeExpanderContext$345(o$666) {
        o$666 = o$666 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$666.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$666.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$666.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$666.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$346(stx$667, builtinSource$668) {
        var env$669 = new Map();
        var params$670 = [];
        var context$671, builtInContext$672 = makeExpanderContext$345({ env: env$669 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$668) {
            var builtinRead$675 = parser$174.read(builtinSource$668);
            builtinRead$675 = [
                syn$175.makeIdent('module', null),
                syn$175.makeDelim('{}', builtinRead$675, null)
            ];
            var builtinRes$676 = expand$344(builtinRead$675, builtInContext$672);
            params$670 = _$173.map(builtinRes$676[0].exports, function (term$677) {
                return {
                    oldExport: term$677.name,
                    newParam: syn$175.makeIdent(term$677.name.token.value, null)
                };
            });
        }
        var modBody$673 = syn$175.makeDelim('{}', stx$667, null);
        modBody$673 = _$173.reduce(params$670, function (acc$678, param$679) {
            var newName$680 = fresh$291();
            env$669.set(resolve$285(param$679.newParam.rename(param$679.newParam, newName$680)), env$669.get(resolve$285(param$679.oldExport)));
            return acc$678.rename(param$679.newParam, newName$680);
        }, modBody$673);
        context$671 = makeExpanderContext$345({ env: env$669 });
        var res$674 = expand$344([
                syn$175.makeIdent('module', null),
                modBody$673
            ], context$671);
        res$674 = res$674[0].destruct();
        return flatten$347(res$674[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$347(stx$681) {
        return _$173.reduce(stx$681, function (acc$682, stx$683) {
            if (stx$683.token.type === parser$174.Token.Delimiter) {
                var exposed$684 = stx$683.expose();
                var openParen$685 = syntaxFromToken$281({
                        type: parser$174.Token.Punctuator,
                        value: stx$683.token.value[0],
                        range: stx$683.token.startRange,
                        sm_range: typeof stx$683.token.sm_startRange == 'undefined' ? stx$683.token.startRange : stx$683.token.sm_startRange,
                        lineNumber: stx$683.token.startLineNumber,
                        sm_lineNumber: typeof stx$683.token.sm_startLineNumber == 'undefined' ? stx$683.token.startLineNumber : stx$683.token.sm_startLineNumber,
                        lineStart: stx$683.token.startLineStart,
                        sm_lineStart: typeof stx$683.token.sm_startLineStart == 'undefined' ? stx$683.token.startLineStart : stx$683.token.sm_startLineStart
                    }, exposed$684);
                var closeParen$686 = syntaxFromToken$281({
                        type: parser$174.Token.Punctuator,
                        value: stx$683.token.value[1],
                        range: stx$683.token.endRange,
                        sm_range: typeof stx$683.token.sm_endRange == 'undefined' ? stx$683.token.endRange : stx$683.token.sm_endRange,
                        lineNumber: stx$683.token.endLineNumber,
                        sm_lineNumber: typeof stx$683.token.sm_endLineNumber == 'undefined' ? stx$683.token.endLineNumber : stx$683.token.sm_endLineNumber,
                        lineStart: stx$683.token.endLineStart,
                        sm_lineStart: typeof stx$683.token.sm_endLineStart == 'undefined' ? stx$683.token.endLineStart : stx$683.token.sm_endLineStart
                    }, exposed$684);
                if (stx$683.token.leadingComments) {
                    openParen$685.token.leadingComments = stx$683.token.leadingComments;
                }
                if (stx$683.token.trailingComments) {
                    openParen$685.token.trailingComments = stx$683.token.trailingComments;
                }
                return acc$682.concat(openParen$685).concat(flatten$347(exposed$684.token.inner)).concat(closeParen$686);
            }
            stx$683.token.sm_lineNumber = stx$683.token.sm_lineNumber ? stx$683.token.sm_lineNumber : stx$683.token.lineNumber;
            stx$683.token.sm_lineStart = stx$683.token.sm_lineStart ? stx$683.token.sm_lineStart : stx$683.token.lineStart;
            stx$683.token.sm_range = stx$683.token.sm_range ? stx$683.token.sm_range : stx$683.token.range;
            return acc$682.concat(stx$683);
        }, []);
    }
    exports$172.enforest = enforest$336;
    exports$172.expand = expandTopLevel$346;
    exports$172.resolve = resolve$285;
    exports$172.get_expression = get_expression$337;
    exports$172.makeExpanderContext = makeExpanderContext$345;
    exports$172.Expr = Expr$297;
    exports$172.VariableStatement = VariableStatement$324;
    exports$172.tokensToSyntax = syn$175.tokensToSyntax;
    exports$172.syntaxToTokens = syn$175.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map