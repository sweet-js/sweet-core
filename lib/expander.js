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
    // used to export "private" methods for unit testing
    exports$172._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$346 = Object.create(this);
                if (typeof o$346.construct === 'function') {
                    o$346.construct.apply(o$346, arguments);
                }
                return o$346;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$347) {
                var result$348 = Object.create(this);
                for (var prop$349 in properties$347) {
                    if (properties$347.hasOwnProperty(prop$349)) {
                        result$348[prop$349] = properties$347[prop$349];
                    }
                }
                return result$348;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$350) {
                function F$351() {
                }
                F$351.prototype = proto$350;
                return this instanceof F$351;
            },
            enumerable: false,
            writable: true
        }
    });
    var scopedEval$272 = se$177.scopedEval;
    var Rename$273 = syn$175.Rename;
    var Mark$274 = syn$175.Mark;
    var Var$275 = syn$175.Var;
    var Def$276 = syn$175.Def;
    var isDef$277 = syn$175.isDef;
    var isMark$278 = syn$175.isMark;
    var isRename$279 = syn$175.isRename;
    var syntaxFromToken$280 = syn$175.syntaxFromToken;
    var joinSyntax$281 = syn$175.joinSyntax;
    function remdup$282(mark$352, mlist$353) {
        if (mark$352 === _$173.first(mlist$353)) {
            return _$173.rest(mlist$353, 1);
        }
        return [mark$352].concat(mlist$353);
    }
    // (CSyntax) -> [...Num]
    function marksof$283(ctx$354, stopName$355, originalName$356) {
        var mark$357, submarks$358;
        if (isMark$278(ctx$354)) {
            mark$357 = ctx$354.mark;
            submarks$358 = marksof$283(ctx$354.context, stopName$355, originalName$356);
            return remdup$282(mark$357, submarks$358);
        }
        if (isDef$277(ctx$354)) {
            return marksof$283(ctx$354.context, stopName$355, originalName$356);
        }
        if (isRename$279(ctx$354)) {
            if (stopName$355 === originalName$356 + '$' + ctx$354.name) {
                return [];
            }
            return marksof$283(ctx$354.context, stopName$355, originalName$356);
        }
        return [];
    }
    function resolve$284(stx$359) {
        return resolveCtx$288(stx$359.token.value, stx$359.context, [], []);
    }
    function arraysEqual$285(a$360, b$361) {
        if (a$360.length !== b$361.length) {
            return false;
        }
        for (var i$362 = 0; i$362 < a$360.length; i$362++) {
            if (a$360[i$362] !== b$361[i$362]) {
                return false;
            }
        }
        return true;
    }
    function renames$286(defctx$363, oldctx$364, originalName$365) {
        var acc$366 = oldctx$364;
        for (var i$367 = 0; i$367 < defctx$363.length; i$367++) {
            if (defctx$363[i$367].id.token.value === originalName$365) {
                acc$366 = Rename$273(defctx$363[i$367].id, defctx$363[i$367].name, acc$366, defctx$363);
            }
        }
        return acc$366;
    }
    function unionEl$287(arr$368, el$369) {
        if (arr$368.indexOf(el$369) === -1) {
            var res$370 = arr$368.slice(0);
            res$370.push(el$369);
            return res$370;
        }
        return arr$368;
    }
    // (Syntax) -> String
    function resolveCtx$288(originalName$371, ctx$372, stop_spine$373, stop_branch$374) {
        if (isMark$278(ctx$372)) {
            return resolveCtx$288(originalName$371, ctx$372.context, stop_spine$373, stop_branch$374);
        }
        if (isDef$277(ctx$372)) {
            if (stop_spine$373.indexOf(ctx$372.defctx) !== -1) {
                return resolveCtx$288(originalName$371, ctx$372.context, stop_spine$373, stop_branch$374);
            } else {
                return resolveCtx$288(originalName$371, renames$286(ctx$372.defctx, ctx$372.context, originalName$371), stop_spine$373, unionEl$287(stop_branch$374, ctx$372.defctx));
            }
        }
        if (isRename$279(ctx$372)) {
            if (originalName$371 === ctx$372.id.token.value) {
                var idName$375 = resolveCtx$288(ctx$372.id.token.value, ctx$372.id.context, stop_branch$374, stop_branch$374);
                var subName$376 = resolveCtx$288(originalName$371, ctx$372.context, unionEl$287(stop_spine$373, ctx$372.def), stop_branch$374);
                if (idName$375 === subName$376) {
                    var idMarks$377 = marksof$283(ctx$372.id.context, originalName$371 + '$' + ctx$372.name, originalName$371);
                    var subMarks$378 = marksof$283(ctx$372.context, originalName$371 + '$' + ctx$372.name, originalName$371);
                    if (arraysEqual$285(idMarks$377, subMarks$378)) {
                        return originalName$371 + '$' + ctx$372.name;
                    }
                }
            }
            return resolveCtx$288(originalName$371, ctx$372.context, stop_spine$373, stop_branch$374);
        }
        return originalName$371;
    }
    var nextFresh$289 = 0;
    // fun () -> Num
    function fresh$290() {
        return nextFresh$289++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$291(towrap$379, delimSyntax$380) {
        assert$181(delimSyntax$380.token.type === parser$174.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$280({
            type: parser$174.Token.Delimiter,
            value: delimSyntax$380.token.value,
            inner: towrap$379,
            range: delimSyntax$380.token.range,
            startLineNumber: delimSyntax$380.token.startLineNumber,
            lineStart: delimSyntax$380.token.lineStart
        }, delimSyntax$380);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$292(argSyntax$381) {
        if (argSyntax$381.token.type === parser$174.Token.Delimiter) {
            return _$173.filter(argSyntax$381.token.inner, function (stx$382) {
                return stx$382.token.value !== ',';
            });
        } else if (argSyntax$381.token.type === parser$174.Token.Identifier) {
            return [argSyntax$381];
        } else {
            assert$181(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$293 = {
            destruct: function () {
                return _$173.reduce(this.properties, _$173.bind(function (acc$383, prop$384) {
                    if (this[prop$384] && this[prop$384].hasPrototype(TermTree$293)) {
                        return acc$383.concat(this[prop$384].destruct());
                    } else if (this[prop$384] && this[prop$384].token && this[prop$384].token.inner) {
                        this[prop$384].token.inner = _$173.reduce(this[prop$384].token.inner, function (acc$385, t$386) {
                            if (t$386.hasPrototype(TermTree$293)) {
                                return acc$385.concat(t$386.destruct());
                            }
                            return acc$385.concat(t$386);
                        }, []);
                        return acc$383.concat(this[prop$384]);
                    } else if (Array.isArray(this[prop$384])) {
                        return acc$383.concat(_$173.reduce(this[prop$384], function (acc$387, t$388) {
                            if (t$388.hasPrototype(TermTree$293)) {
                                return acc$387.concat(t$388.destruct());
                            }
                            return acc$387.concat(t$388);
                        }, []));
                    } else if (this[prop$384]) {
                        return acc$383.concat(this[prop$384]);
                    } else {
                        return acc$383;
                    }
                }, this), []);
            },
            addDefCtx: function (def$389) {
                for (var i$390 = 0; i$390 < this.properties.length; i$390++) {
                    var prop$391 = this.properties[i$390];
                    if (Array.isArray(this[prop$391])) {
                        this[prop$391] = _$173.map(this[prop$391], function (item$392) {
                            return item$392.addDefCtx(def$389);
                        });
                    } else if (this[prop$391]) {
                        this[prop$391] = this[prop$391].addDefCtx(def$389);
                    }
                }
                return this;
            }
        };
    var EOF$294 = TermTree$293.extend({
            properties: ['eof'],
            construct: function (e$393) {
                this.eof = e$393;
            }
        });
    var Statement$295 = TermTree$293.extend({
            construct: function () {
            }
        });
    var Expr$296 = TermTree$293.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$297 = Expr$296.extend({
            construct: function () {
            }
        });
    var ThisExpression$298 = PrimaryExpression$297.extend({
            properties: ['this'],
            construct: function (that$394) {
                this.this = that$394;
            }
        });
    var Lit$299 = PrimaryExpression$297.extend({
            properties: ['lit'],
            construct: function (l$395) {
                this.lit = l$395;
            }
        });
    exports$172._test.PropertyAssignment = PropertyAssignment$300;
    var PropertyAssignment$300 = TermTree$293.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$396, assignment$397) {
                this.propName = propName$396;
                this.assignment = assignment$397;
            }
        });
    var Block$301 = PrimaryExpression$297.extend({
            properties: ['body'],
            construct: function (body$398) {
                this.body = body$398;
            }
        });
    var ArrayLiteral$302 = PrimaryExpression$297.extend({
            properties: ['array'],
            construct: function (ar$399) {
                this.array = ar$399;
            }
        });
    var ParenExpression$303 = PrimaryExpression$297.extend({
            properties: ['expr'],
            construct: function (expr$400) {
                this.expr = expr$400;
            }
        });
    var UnaryOp$304 = Expr$296.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$401, expr$402) {
                this.op = op$401;
                this.expr = expr$402;
            }
        });
    var PostfixOp$305 = Expr$296.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$403, op$404) {
                this.expr = expr$403;
                this.op = op$404;
            }
        });
    var BinOp$306 = Expr$296.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$405, left$406, right$407) {
                this.op = op$405;
                this.left = left$406;
                this.right = right$407;
            }
        });
    var ConditionalExpression$307 = Expr$296.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$408, question$409, tru$410, colon$411, fls$412) {
                this.cond = cond$408;
                this.question = question$409;
                this.tru = tru$410;
                this.colon = colon$411;
                this.fls = fls$412;
            }
        });
    var Keyword$308 = TermTree$293.extend({
            properties: ['keyword'],
            construct: function (k$413) {
                this.keyword = k$413;
            }
        });
    var Punc$309 = TermTree$293.extend({
            properties: ['punc'],
            construct: function (p$414) {
                this.punc = p$414;
            }
        });
    var Delimiter$310 = TermTree$293.extend({
            properties: ['delim'],
            construct: function (d$415) {
                this.delim = d$415;
            }
        });
    var Id$311 = PrimaryExpression$297.extend({
            properties: ['id'],
            construct: function (id$416) {
                this.id = id$416;
            }
        });
    var NamedFun$312 = Expr$296.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$417, star$418, name$419, params$420, body$421) {
                this.keyword = keyword$417;
                this.star = star$418;
                this.name = name$419;
                this.params = params$420;
                this.body = body$421;
            }
        });
    var AnonFun$313 = Expr$296.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$422, star$423, params$424, body$425) {
                this.keyword = keyword$422;
                this.star = star$423;
                this.params = params$424;
                this.body = body$425;
            }
        });
    var ArrowFun$314 = Expr$296.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$426, arrow$427, body$428) {
                this.params = params$426;
                this.arrow = arrow$427;
                this.body = body$428;
            }
        });
    var LetMacro$315 = TermTree$293.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$429, body$430) {
                this.name = name$429;
                this.body = body$430;
            }
        });
    var Macro$316 = TermTree$293.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$431, body$432) {
                this.name = name$431;
                this.body = body$432;
            }
        });
    var AnonMacro$317 = TermTree$293.extend({
            properties: ['body'],
            construct: function (body$433) {
                this.body = body$433;
            }
        });
    var Const$318 = Expr$296.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$434, call$435) {
                this.newterm = newterm$434;
                this.call = call$435;
            }
        });
    var Call$319 = Expr$296.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                assert$181(this.fun.hasPrototype(TermTree$293), 'expecting a term tree in destruct of call');
                var that$436 = this;
                this.delim = syntaxFromToken$280(_$173.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$173.reduce(this.args, function (acc$437, term$438) {
                    assert$181(term$438 && term$438.hasPrototype(TermTree$293), 'expecting term trees in destruct of Call');
                    var dst$439 = acc$437.concat(term$438.destruct());
                    // add all commas except for the last one
                    if (that$436.commas.length > 0) {
                        dst$439 = dst$439.concat(that$436.commas.shift());
                    }
                    return dst$439;
                }, []);
                return this.fun.destruct().concat(Delimiter$310.create(this.delim).destruct());
            },
            construct: function (funn$440, args$441, delim$442, commas$443) {
                assert$181(Array.isArray(args$441), 'requires an array of arguments terms');
                this.fun = funn$440;
                this.args = args$441;
                this.delim = delim$442;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$443;
            }
        });
    var ObjDotGet$320 = Expr$296.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$444, dot$445, right$446) {
                this.left = left$444;
                this.dot = dot$445;
                this.right = right$446;
            }
        });
    var ObjGet$321 = Expr$296.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$447, right$448) {
                this.left = left$447;
                this.right = right$448;
            }
        });
    var VariableDeclaration$322 = TermTree$293.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$449, eqstx$450, init$451, comma$452) {
                this.ident = ident$449;
                this.eqstx = eqstx$450;
                this.init = init$451;
                this.comma = comma$452;
            }
        });
    var VariableStatement$323 = Statement$295.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$173.reduce(this.decls, function (acc$453, decl$454) {
                    return acc$453.concat(decl$454.destruct());
                }, []));
            },
            construct: function (varkw$455, decls$456) {
                assert$181(Array.isArray(decls$456), 'decls must be an array');
                this.varkw = varkw$455;
                this.decls = decls$456;
            }
        });
    var LetStatement$324 = Statement$295.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$173.reduce(this.decls, function (acc$457, decl$458) {
                    return acc$457.concat(decl$458.destruct());
                }, []));
            },
            construct: function (letkw$459, decls$460) {
                assert$181(Array.isArray(decls$460), 'decls must be an array');
                this.letkw = letkw$459;
                this.decls = decls$460;
            }
        });
    var ConstStatement$325 = Statement$295.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$173.reduce(this.decls, function (acc$461, decl$462) {
                    return acc$461.concat(decl$462.destruct());
                }, []));
            },
            construct: function (constkw$463, decls$464) {
                assert$181(Array.isArray(decls$464), 'decls must be an array');
                this.constkw = constkw$463;
                this.decls = decls$464;
            }
        });
    var CatchClause$326 = TermTree$293.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$465, params$466, body$467) {
                this.catchkw = catchkw$465;
                this.params = params$466;
                this.body = body$467;
            }
        });
    var Module$327 = TermTree$293.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$468) {
                this.body = body$468;
                this.exports = [];
            }
        });
    var Empty$328 = TermTree$293.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$329 = TermTree$293.extend({
            properties: ['name'],
            construct: function (name$469) {
                this.name = name$469;
            }
        });
    function stxIsUnaryOp$330(stx$470) {
        var staticOperators$471 = [
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
        return _$173.contains(staticOperators$471, stx$470.token.value);
    }
    function stxIsBinOp$331(stx$472) {
        var staticOperators$473 = [
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
        return _$173.contains(staticOperators$473, stx$472.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$332(stx$474, context$475, isLet$476) {
        var decls$477 = [];
        var res$478 = enforest$334(stx$474, context$475);
        var result$479 = res$478.result;
        var rest$480 = res$478.rest;
        if (rest$480[0]) {
            if (isLet$476 && result$479.hasPrototype(Id$311)) {
                var freshName$482 = fresh$290();
                var renamedId$483 = result$479.id.rename(result$479.id, freshName$482);
                rest$480 = rest$480.map(function (stx$484) {
                    return stx$484.rename(result$479.id, freshName$482);
                });
                result$479.id = renamedId$483;
            }
            var nextRes$481 = enforest$334(rest$480, context$475);
            // x = ...
            if (nextRes$481.result.hasPrototype(Punc$309) && nextRes$481.result.punc.token.value === '=') {
                var initializerRes$485 = enforest$334(nextRes$481.rest, context$475);
                // x = y + z, ...
                if (initializerRes$485.rest[0] && initializerRes$485.rest[0].token.value === ',') {
                    decls$477.push(VariableDeclaration$322.create(result$479.id, nextRes$481.result.punc, initializerRes$485.result, initializerRes$485.rest[0]));
                    var subRes$486 = enforestVarStatement$332(initializerRes$485.rest.slice(1), context$475, isLet$476);
                    decls$477 = decls$477.concat(subRes$486.result);
                    rest$480 = subRes$486.rest;
                }    // x = y ...
                else {
                    decls$477.push(VariableDeclaration$322.create(result$479.id, nextRes$481.result.punc, initializerRes$485.result));
                    rest$480 = initializerRes$485.rest;
                }
            }    // x ,...;
            else if (nextRes$481.result.hasPrototype(Punc$309) && nextRes$481.result.punc.token.value === ',') {
                decls$477.push(VariableDeclaration$322.create(result$479.id, null, null, nextRes$481.result.punc));
                var subRes$486 = enforestVarStatement$332(nextRes$481.rest, context$475, isLet$476);
                decls$477 = decls$477.concat(subRes$486.result);
                rest$480 = subRes$486.rest;
            } else {
                if (result$479.hasPrototype(Id$311)) {
                    decls$477.push(VariableDeclaration$322.create(result$479.id));
                } else {
                    throwSyntaxError$182('enforest', 'Expecting an identifier in variable declaration', rest$480);
                }
            }
        }    // x EOF
        else {
            if (result$479.hasPrototype(Id$311)) {
                decls$477.push(VariableDeclaration$322.create(result$479.id));
            } else if (result$479.hasPrototype(BinOp$306) && result$479.op.token.value === 'in') {
                decls$477.push(VariableDeclaration$322.create(result$479.left.id, result$479.op, result$479.right));
            } else {
                throwSyntaxError$182('enforest', 'Expecting an identifier in variable declaration', stx$474);
            }
        }
        return {
            result: decls$477,
            rest: rest$480
        };
    }
    function adjustLineContext$333(stx$487, original$488, current$489) {
        current$489 = current$489 || {
            lastLineNumber: original$488.token.lineNumber,
            lineNumber: original$488.token.lineNumber - 1
        };
        return _$173.map(stx$487, function (stx$490) {
            if (stx$490.token.type === parser$174.Token.Delimiter) {
                // handle tokens with missing line info
                stx$490.token.startLineNumber = typeof stx$490.token.startLineNumber == 'undefined' ? original$488.token.lineNumber : stx$490.token.startLineNumber;
                stx$490.token.endLineNumber = typeof stx$490.token.endLineNumber == 'undefined' ? original$488.token.lineNumber : stx$490.token.endLineNumber;
                stx$490.token.startLineStart = typeof stx$490.token.startLineStart == 'undefined' ? original$488.token.lineStart : stx$490.token.startLineStart;
                stx$490.token.endLineStart = typeof stx$490.token.endLineStart == 'undefined' ? original$488.token.lineStart : stx$490.token.endLineStart;
                stx$490.token.startRange = typeof stx$490.token.startRange == 'undefined' ? original$488.token.range : stx$490.token.startRange;
                stx$490.token.endRange = typeof stx$490.token.endRange == 'undefined' ? original$488.token.range : stx$490.token.endRange;
                stx$490.token.sm_startLineNumber = typeof stx$490.token.sm_startLineNumber == 'undefined' ? stx$490.token.startLineNumber : stx$490.token.sm_startLineNumber;
                stx$490.token.sm_endLineNumber = typeof stx$490.token.sm_endLineNumber == 'undefined' ? stx$490.token.endLineNumber : stx$490.token.sm_endLineNumber;
                stx$490.token.sm_startLineStart = typeof stx$490.token.sm_startLineStart == 'undefined' ? stx$490.token.startLineStart : stx$490.token.sm_startLineStart;
                stx$490.token.sm_endLineStart = typeof stx$490.token.sm_endLineStart == 'undefined' ? stx$490.token.endLineStart : stx$490.token.sm_endLineStart;
                stx$490.token.sm_startRange = typeof stx$490.token.sm_startRange == 'undefined' ? stx$490.token.startRange : stx$490.token.sm_startRange;
                stx$490.token.sm_endRange = typeof stx$490.token.sm_endRange == 'undefined' ? stx$490.token.endRange : stx$490.token.sm_endRange;
                if (stx$490.token.startLineNumber === current$489.lastLineNumber && current$489.lastLineNumber !== current$489.lineNumber) {
                    stx$490.token.startLineNumber = current$489.lineNumber;
                } else if (stx$490.token.startLineNumber !== current$489.lastLineNumber) {
                    current$489.lineNumber++;
                    current$489.lastLineNumber = stx$490.token.startLineNumber;
                    stx$490.token.startLineNumber = current$489.lineNumber;
                }
                if (stx$490.token.inner.length > 0) {
                    stx$490.token.inner = adjustLineContext$333(stx$490.token.inner, original$488, current$489);
                }
                return stx$490;
            }
            // handle tokens with missing line info
            stx$490.token.lineNumber = typeof stx$490.token.lineNumber == 'undefined' ? original$488.token.lineNumber : stx$490.token.lineNumber;
            stx$490.token.lineStart = typeof stx$490.token.lineStart == 'undefined' ? original$488.token.lineStart : stx$490.token.lineStart;
            stx$490.token.range = typeof stx$490.token.range == 'undefined' ? original$488.token.range : stx$490.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$490.token.sm_lineNumber = typeof stx$490.token.sm_lineNumber == 'undefined' ? stx$490.token.lineNumber : stx$490.token.sm_lineNumber;
            stx$490.token.sm_lineStart = typeof stx$490.token.sm_lineStart == 'undefined' ? stx$490.token.lineStart : stx$490.token.sm_lineStart;
            stx$490.token.sm_range = typeof stx$490.token.sm_range == 'undefined' ? _$173.clone(stx$490.token.range) : stx$490.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$490.token.lineNumber === current$489.lastLineNumber && current$489.lastLineNumber !== current$489.lineNumber) {
                stx$490.token.lineNumber = current$489.lineNumber;
            } else if (stx$490.token.lineNumber !== current$489.lastLineNumber) {
                current$489.lineNumber++;
                current$489.lastLineNumber = stx$490.token.lineNumber;
                stx$490.token.lineNumber = current$489.lineNumber;
            }
            return stx$490;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$334(toks$491, context$492) {
        assert$181(toks$491.length > 0, 'enforest assumes there are tokens to work with');
        function step$493(head$494, rest$495) {
            var innerTokens$496;
            assert$181(Array.isArray(rest$495), 'result must at least be an empty array');
            if (head$494.hasPrototype(TermTree$293)) {
                // function call
                var emp$499 = head$494.emp;
                var emp$499 = head$494.emp;
                var keyword$502 = head$494.keyword;
                var delim$504 = head$494.delim;
                var id$506 = head$494.id;
                var delim$504 = head$494.delim;
                var emp$499 = head$494.emp;
                var punc$510 = head$494.punc;
                var keyword$502 = head$494.keyword;
                var emp$499 = head$494.emp;
                var emp$499 = head$494.emp;
                var emp$499 = head$494.emp;
                var delim$504 = head$494.delim;
                var delim$504 = head$494.delim;
                var id$506 = head$494.id;
                var keyword$502 = head$494.keyword;
                var keyword$502 = head$494.keyword;
                var keyword$502 = head$494.keyword;
                var keyword$502 = head$494.keyword;
                if (head$494.hasPrototype(Expr$296) && rest$495[0] && rest$495[0].token.type === parser$174.Token.Delimiter && rest$495[0].token.value === '()') {
                    var argRes$543, enforestedArgs$544 = [], commas$545 = [];
                    rest$495[0].expose();
                    innerTokens$496 = rest$495[0].token.inner;
                    while (innerTokens$496.length > 0) {
                        argRes$543 = enforest$334(innerTokens$496, context$492);
                        enforestedArgs$544.push(argRes$543.result);
                        innerTokens$496 = argRes$543.rest;
                        if (innerTokens$496[0] && innerTokens$496[0].token.value === ',') {
                            // record the comma for later
                            commas$545.push(innerTokens$496[0]);
                            // but dump it for the next loop turn
                            innerTokens$496 = innerTokens$496.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$546 = _$173.all(enforestedArgs$544, function (argTerm$547) {
                            return argTerm$547.hasPrototype(Expr$296);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$496.length === 0 && argsAreExprs$546) {
                        return step$493(Call$319.create(head$494, enforestedArgs$544, rest$495[0], commas$545), rest$495.slice(1));
                    }
                } else if (head$494.hasPrototype(Expr$296) && rest$495[0] && rest$495[0].token.value === '?') {
                    var question$548 = rest$495[0];
                    var condRes$549 = enforest$334(rest$495.slice(1), context$492);
                    var truExpr$550 = condRes$549.result;
                    var right$551 = condRes$549.rest;
                    if (truExpr$550.hasPrototype(Expr$296) && right$551[0] && right$551[0].token.value === ':') {
                        var colon$552 = right$551[0];
                        var flsRes$553 = enforest$334(right$551.slice(1), context$492);
                        var flsExpr$554 = flsRes$553.result;
                        if (flsExpr$554.hasPrototype(Expr$296)) {
                            return step$493(ConditionalExpression$307.create(head$494, question$548, truExpr$550, colon$552, flsExpr$554), flsRes$553.rest);
                        }
                    }
                } else if (head$494.hasPrototype(Keyword$308) && keyword$502.token.value === 'new' && rest$495[0]) {
                    var newCallRes$555 = enforest$334(rest$495, context$492);
                    if (newCallRes$555.result.hasPrototype(Call$319)) {
                        return step$493(Const$318.create(head$494, newCallRes$555.result), newCallRes$555.rest);
                    }
                } else if (head$494.hasPrototype(Delimiter$310) && delim$504.token.value === '()' && rest$495[0] && rest$495[0].token.type === parser$174.Token.Punctuator && rest$495[0].token.value === '=>') {
                    var res$556 = enforest$334(rest$495.slice(1), context$492);
                    if (res$556.result.hasPrototype(Expr$296)) {
                        return step$493(ArrowFun$314.create(delim$504, rest$495[0], res$556.result.destruct()), res$556.rest);
                    } else {
                        throwSyntaxError$182('enforest', 'Body of arrow function must be an expression', rest$495.slice(1));
                    }
                } else if (head$494.hasPrototype(Id$311) && rest$495[0] && rest$495[0].token.type === parser$174.Token.Punctuator && rest$495[0].token.value === '=>') {
                    var res$556 = enforest$334(rest$495.slice(1), context$492);
                    if (res$556.result.hasPrototype(Expr$296)) {
                        return step$493(ArrowFun$314.create(id$506, rest$495[0], res$556.result.destruct()), res$556.rest);
                    } else {
                        throwSyntaxError$182('enforest', 'Body of arrow function must be an expression', rest$495.slice(1));
                    }
                } else if (head$494.hasPrototype(Delimiter$310) && delim$504.token.value === '()') {
                    innerTokens$496 = delim$504.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$496.length === 0) {
                        return step$493(ParenExpression$303.create(head$494), rest$495);
                    } else {
                        var innerTerm$557 = get_expression$335(innerTokens$496, context$492);
                        if (innerTerm$557.result && innerTerm$557.result.hasPrototype(Expr$296)) {
                            return step$493(ParenExpression$303.create(head$494), rest$495);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$494.hasPrototype(Expr$296) && rest$495[0] && rest$495[1] && stxIsBinOp$331(rest$495[0])) {
                    var op$558 = rest$495[0];
                    var left$559 = head$494;
                    var bopRes$560 = enforest$334(rest$495.slice(1), context$492);
                    var right$551 = bopRes$560.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$551.hasPrototype(Expr$296)) {
                        return step$493(BinOp$306.create(op$558, left$559, right$551), bopRes$560.rest);
                    }
                } else if (head$494.hasPrototype(Punc$309) && stxIsUnaryOp$330(punc$510)) {
                    var unopRes$561 = enforest$334(rest$495, context$492);
                    if (unopRes$561.result.hasPrototype(Expr$296)) {
                        return step$493(UnaryOp$304.create(punc$510, unopRes$561.result), unopRes$561.rest);
                    }
                } else if (head$494.hasPrototype(Keyword$308) && stxIsUnaryOp$330(keyword$502)) {
                    var unopRes$561 = enforest$334(rest$495, context$492);
                    if (unopRes$561.result.hasPrototype(Expr$296)) {
                        return step$493(UnaryOp$304.create(keyword$502, unopRes$561.result), unopRes$561.rest);
                    }
                } else if (head$494.hasPrototype(Expr$296) && rest$495[0] && (rest$495[0].token.value === '++' || rest$495[0].token.value === '--')) {
                    return step$493(PostfixOp$305.create(head$494, rest$495[0]), rest$495.slice(1));
                } else if (head$494.hasPrototype(Expr$296) && rest$495[0] && rest$495[0].token.value === '[]') {
                    return step$493(ObjGet$321.create(head$494, Delimiter$310.create(rest$495[0].expose())), rest$495.slice(1));
                } else if (head$494.hasPrototype(Expr$296) && rest$495[0] && rest$495[0].token.value === '.' && rest$495[1] && rest$495[1].token.type === parser$174.Token.Identifier) {
                    return step$493(ObjDotGet$320.create(head$494, rest$495[0], rest$495[1]), rest$495.slice(2));
                } else if (head$494.hasPrototype(Delimiter$310) && delim$504.token.value === '[]') {
                    return step$493(ArrayLiteral$302.create(head$494), rest$495);
                } else if (head$494.hasPrototype(Delimiter$310) && head$494.delim.token.value === '{}') {
                    return step$493(Block$301.create(head$494), rest$495);
                } else if (head$494.hasPrototype(Id$311) && id$506.token.value === '#quoteSyntax' && rest$495[0] && rest$495[0].token.value === '{}') {
                    var tempId$562 = fresh$290();
                    context$492.templateMap.set(tempId$562, rest$495[0].token.inner);
                    return step$493(syn$175.makeIdent('getTemplate', id$506), [syn$175.makeDelim('()', [syn$175.makeValue(tempId$562, id$506)], id$506)].concat(rest$495.slice(1)));
                } else if (head$494.hasPrototype(Keyword$308) && keyword$502.token.value === 'let' && (rest$495[0] && rest$495[0].token.type === parser$174.Token.Identifier || rest$495[0] && rest$495[0].token.type === parser$174.Token.Keyword || rest$495[0] && rest$495[0].token.type === parser$174.Token.Punctuator) && rest$495[1] && rest$495[1].token.value === '=' && rest$495[2] && rest$495[2].token.value === 'macro') {
                    var mac$563 = enforest$334(rest$495.slice(2), context$492);
                    if (!mac$563.result.hasPrototype(AnonMacro$317)) {
                        throwSyntaxError$182('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$495.slice(2));
                    }
                    return step$493(LetMacro$315.create(rest$495[0], mac$563.result.body), mac$563.rest);
                } else if (head$494.hasPrototype(Keyword$308) && keyword$502.token.value === 'var' && rest$495[0]) {
                    var vsRes$564 = enforestVarStatement$332(rest$495, context$492, false);
                    if (vsRes$564) {
                        return step$493(VariableStatement$323.create(head$494, vsRes$564.result), vsRes$564.rest);
                    }
                } else if (head$494.hasPrototype(Keyword$308) && keyword$502.token.value === 'let' && rest$495[0]) {
                    var vsRes$564 = enforestVarStatement$332(rest$495, context$492, true);
                    if (vsRes$564) {
                        return step$493(LetStatement$324.create(head$494, vsRes$564.result), vsRes$564.rest);
                    }
                } else if (head$494.hasPrototype(Keyword$308) && keyword$502.token.value === 'const' && rest$495[0]) {
                    var vsRes$564 = enforestVarStatement$332(rest$495, context$492, true);
                    if (vsRes$564) {
                        return step$493(ConstStatement$325.create(head$494, vsRes$564.result), vsRes$564.rest);
                    }
                }
            } else {
                assert$181(head$494 && head$494.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$494.token.type === parser$174.Token.Identifier || head$494.token.type === parser$174.Token.Keyword || head$494.token.type === parser$174.Token.Punctuator) && context$492.env.has(resolve$284(head$494))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$565 = fresh$290();
                    var transformerContext$566 = makeExpanderContext$343(_$173.defaults({ mark: newMark$565 }, context$492));
                    // pull the macro transformer out the environment
                    var transformer$567 = context$492.env.get(resolve$284(head$494)).fn;
                    // apply the transformer
                    try {
                        var rt$568 = transformer$567([head$494].concat(rest$495), transformerContext$566);
                    } catch (e$569) {
                        if (e$569.type && e$569.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$570 = '`' + rest$495.slice(0, 5).map(function (stx$571) {
                                    return stx$571.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$182('macro', 'Macro `' + head$494.token.value + '` could not be matched with ' + argumentString$570, head$494);
                        } else {
                            // just rethrow it
                            throw e$569;
                        }
                    }
                    if (!Array.isArray(rt$568.result)) {
                        throwSyntaxError$182('enforest', 'Macro must return a syntax array', head$494);
                    }
                    if (rt$568.result.length > 0) {
                        var adjustedResult$572 = adjustLineContext$333(rt$568.result, head$494);
                        adjustedResult$572[0].token.leadingComments = head$494.token.leadingComments;
                        return step$493(adjustedResult$572[0], adjustedResult$572.slice(1).concat(rt$568.rest));
                    } else {
                        return step$493(Empty$328.create(), rt$568.rest);
                    }
                }    // anon macro definition
                else if (head$494.token.type === parser$174.Token.Identifier && head$494.token.value === 'macro' && rest$495[0] && rest$495[0].token.value === '{}') {
                    return step$493(AnonMacro$317.create(rest$495[0].expose().token.inner), rest$495.slice(1));
                }    // macro definition
                else if (head$494.token.type === parser$174.Token.Identifier && head$494.token.value === 'macro' && rest$495[0] && (rest$495[0].token.type === parser$174.Token.Identifier || rest$495[0].token.type === parser$174.Token.Keyword || rest$495[0].token.type === parser$174.Token.Punctuator) && rest$495[1] && rest$495[1].token.type === parser$174.Token.Delimiter && rest$495[1].token.value === '{}') {
                    return step$493(Macro$316.create(rest$495[0], rest$495[1].expose().token.inner), rest$495.slice(2));
                }    // module definition
                else if (head$494.token.value === 'module' && rest$495[0] && rest$495[0].token.value === '{}') {
                    return step$493(Module$327.create(rest$495[0]), rest$495.slice(1));
                }    // function definition
                else if (head$494.token.type === parser$174.Token.Keyword && head$494.token.value === 'function' && rest$495[0] && rest$495[0].token.type === parser$174.Token.Identifier && rest$495[1] && rest$495[1].token.type === parser$174.Token.Delimiter && rest$495[1].token.value === '()' && rest$495[2] && rest$495[2].token.type === parser$174.Token.Delimiter && rest$495[2].token.value === '{}') {
                    rest$495[1].token.inner = rest$495[1].expose().token.inner;
                    rest$495[2].token.inner = rest$495[2].expose().token.inner;
                    return step$493(NamedFun$312.create(head$494, null, rest$495[0], rest$495[1], rest$495[2]), rest$495.slice(3));
                }    // generator function definition
                else if (head$494.token.type === parser$174.Token.Keyword && head$494.token.value === 'function' && rest$495[0] && rest$495[0].token.type === parser$174.Token.Punctuator && rest$495[0].token.value === '*' && rest$495[1] && rest$495[1].token.type === parser$174.Token.Identifier && rest$495[2] && rest$495[2].token.type === parser$174.Token.Delimiter && rest$495[2].token.value === '()' && rest$495[3] && rest$495[3].token.type === parser$174.Token.Delimiter && rest$495[3].token.value === '{}') {
                    rest$495[2].token.inner = rest$495[2].expose().token.inner;
                    rest$495[3].token.inner = rest$495[3].expose().token.inner;
                    return step$493(NamedFun$312.create(head$494, rest$495[0], rest$495[1], rest$495[2], rest$495[3]), rest$495.slice(4));
                }    // anonymous function definition
                else if (head$494.token.type === parser$174.Token.Keyword && head$494.token.value === 'function' && rest$495[0] && rest$495[0].token.type === parser$174.Token.Delimiter && rest$495[0].token.value === '()' && rest$495[1] && rest$495[1].token.type === parser$174.Token.Delimiter && rest$495[1].token.value === '{}') {
                    rest$495[0].token.inner = rest$495[0].expose().token.inner;
                    rest$495[1].token.inner = rest$495[1].expose().token.inner;
                    return step$493(AnonFun$313.create(head$494, null, rest$495[0], rest$495[1]), rest$495.slice(2));
                }    // anonymous generator function definition
                else if (head$494.token.type === parser$174.Token.Keyword && head$494.token.value === 'function' && rest$495[0] && rest$495[0].token.type === parser$174.Token.Punctuator && rest$495[0].token.value === '*' && rest$495[1] && rest$495[1].token.type === parser$174.Token.Delimiter && rest$495[1].token.value === '()' && rest$495[2] && rest$495[2].token.type === parser$174.Token.Delimiter && rest$495[2].token.value === '{}') {
                    rest$495[1].token.inner = rest$495[1].expose().token.inner;
                    rest$495[2].token.inner = rest$495[2].expose().token.inner;
                    return step$493(AnonFun$313.create(head$494, rest$495[0], rest$495[1], rest$495[2]), rest$495.slice(3));
                }    // arrow function
                else if ((head$494.token.type === parser$174.Token.Delimiter && head$494.token.value === '()' || head$494.token.type === parser$174.Token.Identifier) && rest$495[0] && rest$495[0].token.type === parser$174.Token.Punctuator && rest$495[0].token.value === '=>' && rest$495[1] && rest$495[1].token.type === parser$174.Token.Delimiter && rest$495[1].token.value === '{}') {
                    return step$493(ArrowFun$314.create(head$494, rest$495[0], rest$495[1]), rest$495.slice(2));
                }    // catch statement
                else if (head$494.token.type === parser$174.Token.Keyword && head$494.token.value === 'catch' && rest$495[0] && rest$495[0].token.type === parser$174.Token.Delimiter && rest$495[0].token.value === '()' && rest$495[1] && rest$495[1].token.type === parser$174.Token.Delimiter && rest$495[1].token.value === '{}') {
                    rest$495[0].token.inner = rest$495[0].expose().token.inner;
                    rest$495[1].token.inner = rest$495[1].expose().token.inner;
                    return step$493(CatchClause$326.create(head$494, rest$495[0], rest$495[1]), rest$495.slice(2));
                }    // this expression
                else if (head$494.token.type === parser$174.Token.Keyword && head$494.token.value === 'this') {
                    return step$493(ThisExpression$298.create(head$494), rest$495);
                }    // literal
                else if (head$494.token.type === parser$174.Token.NumericLiteral || head$494.token.type === parser$174.Token.StringLiteral || head$494.token.type === parser$174.Token.BooleanLiteral || head$494.token.type === parser$174.Token.RegularExpression || head$494.token.type === parser$174.Token.NullLiteral) {
                    return step$493(Lit$299.create(head$494), rest$495);
                }    // export
                else if (head$494.token.type === parser$174.Token.Keyword && head$494.token.value === 'export' && rest$495[0] && (rest$495[0].token.type === parser$174.Token.Identifier || rest$495[0].token.type === parser$174.Token.Keyword || rest$495[0].token.type === parser$174.Token.Punctuator)) {
                    return step$493(Export$329.create(rest$495[0]), rest$495.slice(1));
                }    // identifier
                else if (head$494.token.type === parser$174.Token.Identifier) {
                    return step$493(Id$311.create(head$494), rest$495);
                }    // punctuator
                else if (head$494.token.type === parser$174.Token.Punctuator) {
                    return step$493(Punc$309.create(head$494), rest$495);
                } else if (head$494.token.type === parser$174.Token.Keyword && head$494.token.value === 'with') {
                    throwSyntaxError$182('enforest', 'with is not supported in sweet.js', head$494);
                }    // keyword
                else if (head$494.token.type === parser$174.Token.Keyword) {
                    return step$493(Keyword$308.create(head$494), rest$495);
                }    // Delimiter
                else if (head$494.token.type === parser$174.Token.Delimiter) {
                    return step$493(Delimiter$310.create(head$494.expose()), rest$495);
                }    // end of file
                else if (head$494.token.type === parser$174.Token.EOF) {
                    assert$181(rest$495.length === 0, 'nothing should be after an EOF');
                    return step$493(EOF$294.create(head$494), []);
                } else {
                    // todo: are we missing cases?
                    assert$181(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$494,
                rest: rest$495
            };
        }
        return step$493(toks$491[0], toks$491.slice(1));
    }
    function get_expression$335(stx$573, context$574) {
        var res$575 = enforest$334(stx$573, context$574);
        if (!res$575.result.hasPrototype(Expr$296)) {
            return {
                result: null,
                rest: stx$573
            };
        }
        return res$575;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$336(newMark$576, env$577) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$578(match$579) {
            if (match$579.level === 0) {
                // replace the match property with the marked syntax
                match$579.match = _$173.map(match$579.match, function (stx$580) {
                    return stx$580.mark(newMark$576);
                });
            } else {
                _$173.each(match$579.match, function (match$581) {
                    dfs$578(match$581);
                });
            }
        }
        _$173.keys(env$577).forEach(function (key$582) {
            dfs$578(env$577[key$582]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$337(mac$583, context$584) {
        var body$585 = mac$583.body;
        // raw function primitive form
        if (!(body$585[0] && body$585[0].token.type === parser$174.Token.Keyword && body$585[0].token.value === 'function')) {
            throwSyntaxError$182('load macro', 'Primitive macro form must contain a function for the macro body', body$585);
        }
        var stub$586 = parser$174.read('()');
        stub$586[0].token.inner = body$585;
        var expanded$587 = expand$342(stub$586, context$584);
        expanded$587 = expanded$587[0].destruct().concat(expanded$587[1].eof);
        var flattend$588 = flatten$345(expanded$587);
        var bodyCode$589 = codegen$180.generate(parser$174.parse(flattend$588));
        var macroFn$590 = scopedEval$272(bodyCode$589, {
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
                getTemplate: function (id$591) {
                    return cloneSyntaxArray$338(context$584.templateMap.get(id$591));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$336,
                mergeMatches: function (newMatch$592, oldMatch$593) {
                    newMatch$592.patternEnv = _$173.extend({}, oldMatch$593.patternEnv, newMatch$592.patternEnv);
                    return newMatch$592;
                }
            });
        return macroFn$590;
    }
    function cloneSyntaxArray$338(arr$594) {
        return arr$594.map(function (stx$595) {
            var o$596 = syntaxFromToken$280(_$173.clone(stx$595.token), stx$595);
            if (o$596.token.type === parser$174.Token.Delimiter) {
                o$596.token.inner = cloneSyntaxArray$338(o$596.token.inner);
            }
            return o$596;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$339(stx$597, context$598) {
        assert$181(context$598, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$597.length === 0) {
            return {
                terms: [],
                context: context$598
            };
        }
        assert$181(stx$597[0].token, 'expecting a syntax object');
        var f$599 = enforest$334(stx$597, context$598);
        // head :: TermTree
        var head$600 = f$599.result;
        // rest :: [Syntax]
        var rest$601 = f$599.rest;
        if (head$600.hasPrototype(Macro$316)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$603 = loadMacroDef$337(head$600, context$598);
            addToDefinitionCtx$340([head$600.name], context$598.defscope, false);
            context$598.env.set(resolve$284(head$600.name), { fn: macroDefinition$603 });
            return expandToTermTree$339(rest$601, context$598);
        }
        if (head$600.hasPrototype(LetMacro$315)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$603 = loadMacroDef$337(head$600, context$598);
            var freshName$604 = fresh$290();
            var renamedName$605 = head$600.name.rename(head$600.name, freshName$604);
            rest$601 = _$173.map(rest$601, function (stx$606) {
                return stx$606.rename(head$600.name, freshName$604);
            });
            head$600.name = renamedName$605;
            context$598.env.set(resolve$284(head$600.name), { fn: macroDefinition$603 });
            return expandToTermTree$339(rest$601, context$598);
        }
        if (head$600.hasPrototype(NamedFun$312)) {
            addToDefinitionCtx$340([head$600.name], context$598.defscope, true);
        }
        if (head$600.hasPrototype(VariableStatement$323)) {
            addToDefinitionCtx$340(_$173.map(head$600.decls, function (decl$607) {
                return decl$607.ident;
            }), context$598.defscope, true);
        }
        if (head$600.hasPrototype(Block$301) && head$600.body.hasPrototype(Delimiter$310)) {
            head$600.body.delim.token.inner.forEach(function (term$608) {
                if (term$608.hasPrototype(VariableStatement$323)) {
                    addToDefinitionCtx$340(_$173.map(term$608.decls, function (decl$609) {
                        return decl$609.ident;
                    }), context$598.defscope, true);
                }
            });
        }
        if (head$600.hasPrototype(Delimiter$310)) {
            head$600.delim.token.inner.forEach(function (term$610) {
                if (term$610.hasPrototype(VariableStatement$323)) {
                    addToDefinitionCtx$340(_$173.map(term$610.decls, function (decl$611) {
                        return decl$611.ident;
                    }), context$598.defscope, true);
                }
            });
        }
        var trees$602 = expandToTermTree$339(rest$601, context$598);
        return {
            terms: [head$600].concat(trees$602.terms),
            context: trees$602.context
        };
    }
    function addToDefinitionCtx$340(idents$612, defscope$613, skipRep$614) {
        assert$181(idents$612 && idents$612.length > 0, 'expecting some variable identifiers');
        skipRep$614 = skipRep$614 || false;
        _$173.each(idents$612, function (id$615) {
            var skip$616 = false;
            if (skipRep$614) {
                var declRepeat$617 = _$173.find(defscope$613, function (def$618) {
                        return def$618.id.token.value === id$615.token.value && arraysEqual$285(marksof$283(def$618.id.context), marksof$283(id$615.context));
                    });
                skip$616 = typeof declRepeat$617 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$616) {
                var name$619 = fresh$290();
                defscope$613.push({
                    id: id$615,
                    name: name$619
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$341(term$620, context$621) {
        assert$181(context$621 && context$621.env, 'environment map is required');
        if (term$620.hasPrototype(ArrayLiteral$302)) {
            term$620.array.delim.token.inner = expand$342(term$620.array.delim.expose().token.inner, context$621);
            return term$620;
        } else if (term$620.hasPrototype(Block$301)) {
            term$620.body.delim.token.inner = expand$342(term$620.body.delim.expose().token.inner, context$621);
            return term$620;
        } else if (term$620.hasPrototype(ParenExpression$303)) {
            term$620.expr.delim.token.inner = expand$342(term$620.expr.delim.expose().token.inner, context$621);
            return term$620;
        } else if (term$620.hasPrototype(Call$319)) {
            term$620.fun = expandTermTreeToFinal$341(term$620.fun, context$621);
            term$620.args = _$173.map(term$620.args, function (arg$622) {
                return expandTermTreeToFinal$341(arg$622, context$621);
            });
            return term$620;
        } else if (term$620.hasPrototype(UnaryOp$304)) {
            term$620.expr = expandTermTreeToFinal$341(term$620.expr, context$621);
            return term$620;
        } else if (term$620.hasPrototype(BinOp$306)) {
            term$620.left = expandTermTreeToFinal$341(term$620.left, context$621);
            term$620.right = expandTermTreeToFinal$341(term$620.right, context$621);
            return term$620;
        } else if (term$620.hasPrototype(ObjGet$321)) {
            term$620.right.delim.token.inner = expand$342(term$620.right.delim.expose().token.inner, context$621);
            return term$620;
        } else if (term$620.hasPrototype(ObjDotGet$320)) {
            term$620.left = expandTermTreeToFinal$341(term$620.left, context$621);
            term$620.right = expandTermTreeToFinal$341(term$620.right, context$621);
            return term$620;
        } else if (term$620.hasPrototype(VariableDeclaration$322)) {
            if (term$620.init) {
                term$620.init = expandTermTreeToFinal$341(term$620.init, context$621);
            }
            return term$620;
        } else if (term$620.hasPrototype(VariableStatement$323)) {
            term$620.decls = _$173.map(term$620.decls, function (decl$623) {
                return expandTermTreeToFinal$341(decl$623, context$621);
            });
            return term$620;
        } else if (term$620.hasPrototype(Delimiter$310)) {
            // expand inside the delimiter and then continue on
            term$620.delim.token.inner = expand$342(term$620.delim.expose().token.inner, context$621);
            return term$620;
        } else if (term$620.hasPrototype(NamedFun$312) || term$620.hasPrototype(AnonFun$313) || term$620.hasPrototype(CatchClause$326) || term$620.hasPrototype(ArrowFun$314) || term$620.hasPrototype(Module$327)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$624 = [];
            var bodyContext$625 = makeExpanderContext$343(_$173.defaults({ defscope: newDef$624 }, context$621));
            var paramSingleIdent$626 = term$620.params && term$620.params.token.type === parser$174.Token.Identifier;
            if (term$620.params && term$620.params.token.type === parser$174.Token.Delimiter) {
                var params$633 = term$620.params.expose();
            } else if (paramSingleIdent$626) {
                var params$633 = term$620.params;
            } else {
                var params$633 = syn$175.makeDelim('()', [], null);
            }
            if (Array.isArray(term$620.body)) {
                var bodies$634 = syn$175.makeDelim('{}', term$620.body, null);
            } else {
                var bodies$634 = term$620.body;
            }
            bodies$634 = bodies$634.addDefCtx(newDef$624);
            var paramNames$627 = _$173.map(getParamIdentifiers$292(params$633), function (param$635) {
                    var freshName$636 = fresh$290();
                    return {
                        freshName: freshName$636,
                        originalParam: param$635,
                        renamedParam: param$635.rename(param$635, freshName$636)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$628 = _$173.reduce(paramNames$627, function (accBody$637, p$638) {
                    return accBody$637.rename(p$638.originalParam, p$638.freshName);
                }, bodies$634);
            renamedBody$628 = renamedBody$628.expose();
            var expandedResult$629 = expandToTermTree$339(renamedBody$628.token.inner, bodyContext$625);
            var bodyTerms$630 = expandedResult$629.terms;
            var renamedParams$631 = _$173.map(paramNames$627, function (p$639) {
                    return p$639.renamedParam;
                });
            if (paramSingleIdent$626) {
                var flatArgs$640 = renamedParams$631[0];
            } else {
                var flatArgs$640 = syn$175.makeDelim('()', joinSyntax$281(renamedParams$631, ','), term$620.params);
            }
            var expandedArgs$632 = expand$342([flatArgs$640], bodyContext$625);
            assert$181(expandedArgs$632.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$620.params) {
                term$620.params = expandedArgs$632[0];
            }
            bodyTerms$630 = _$173.map(bodyTerms$630, function (bodyTerm$641) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$642 = bodyTerm$641.addDefCtx(newDef$624);
                // finish expansion
                return expandTermTreeToFinal$341(termWithCtx$642, expandedResult$629.context);
            });
            if (term$620.hasPrototype(Module$327)) {
                bodyTerms$630 = _$173.filter(bodyTerms$630, function (bodyTerm$643) {
                    if (bodyTerm$643.hasPrototype(Export$329)) {
                        term$620.exports.push(bodyTerm$643);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$628.token.inner = bodyTerms$630;
            if (Array.isArray(term$620.body)) {
                term$620.body = renamedBody$628.token.inner;
            } else {
                term$620.body = renamedBody$628;
            }
            // and continue expand the rest
            return term$620;
        }
        // the term is fine as is
        return term$620;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$342(stx$644, context$645) {
        assert$181(context$645, 'must provide an expander context');
        var trees$646 = expandToTermTree$339(stx$644, context$645);
        return _$173.map(trees$646.terms, function (term$647) {
            return expandTermTreeToFinal$341(term$647, trees$646.context);
        });
    }
    function makeExpanderContext$343(o$648) {
        o$648 = o$648 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$648.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$648.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$648.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$648.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$344(stx$649, builtinSource$650) {
        var env$651 = new Map();
        var params$652 = [];
        var context$653, builtInContext$654 = makeExpanderContext$343({ env: env$651 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$650) {
            var builtinRead$657 = parser$174.read(builtinSource$650);
            builtinRead$657 = [
                syn$175.makeIdent('module', null),
                syn$175.makeDelim('{}', builtinRead$657, null)
            ];
            var builtinRes$658 = expand$342(builtinRead$657, builtInContext$654);
            params$652 = _$173.map(builtinRes$658[0].exports, function (term$659) {
                return {
                    oldExport: term$659.name,
                    newParam: syn$175.makeIdent(term$659.name.token.value, null)
                };
            });
        }
        var modBody$655 = syn$175.makeDelim('{}', stx$649, null);
        modBody$655 = _$173.reduce(params$652, function (acc$660, param$661) {
            var newName$662 = fresh$290();
            env$651.set(resolve$284(param$661.newParam.rename(param$661.newParam, newName$662)), env$651.get(resolve$284(param$661.oldExport)));
            return acc$660.rename(param$661.newParam, newName$662);
        }, modBody$655);
        context$653 = makeExpanderContext$343({ env: env$651 });
        var res$656 = expand$342([
                syn$175.makeIdent('module', null),
                modBody$655
            ], context$653);
        res$656 = res$656[0].destruct();
        return flatten$345(res$656[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$345(stx$663) {
        return _$173.reduce(stx$663, function (acc$664, stx$665) {
            if (stx$665.token.type === parser$174.Token.Delimiter) {
                var exposed$666 = stx$665.expose();
                var openParen$667 = syntaxFromToken$280({
                        type: parser$174.Token.Punctuator,
                        value: stx$665.token.value[0],
                        range: stx$665.token.startRange,
                        sm_range: typeof stx$665.token.sm_startRange == 'undefined' ? stx$665.token.startRange : stx$665.token.sm_startRange,
                        lineNumber: stx$665.token.startLineNumber,
                        sm_lineNumber: typeof stx$665.token.sm_startLineNumber == 'undefined' ? stx$665.token.startLineNumber : stx$665.token.sm_startLineNumber,
                        lineStart: stx$665.token.startLineStart,
                        sm_lineStart: typeof stx$665.token.sm_startLineStart == 'undefined' ? stx$665.token.startLineStart : stx$665.token.sm_startLineStart
                    }, exposed$666);
                var closeParen$668 = syntaxFromToken$280({
                        type: parser$174.Token.Punctuator,
                        value: stx$665.token.value[1],
                        range: stx$665.token.endRange,
                        sm_range: typeof stx$665.token.sm_endRange == 'undefined' ? stx$665.token.endRange : stx$665.token.sm_endRange,
                        lineNumber: stx$665.token.endLineNumber,
                        sm_lineNumber: typeof stx$665.token.sm_endLineNumber == 'undefined' ? stx$665.token.endLineNumber : stx$665.token.sm_endLineNumber,
                        lineStart: stx$665.token.endLineStart,
                        sm_lineStart: typeof stx$665.token.sm_endLineStart == 'undefined' ? stx$665.token.endLineStart : stx$665.token.sm_endLineStart
                    }, exposed$666);
                if (stx$665.token.leadingComments) {
                    openParen$667.token.leadingComments = stx$665.token.leadingComments;
                }
                if (stx$665.token.trailingComments) {
                    openParen$667.token.trailingComments = stx$665.token.trailingComments;
                }
                return acc$664.concat(openParen$667).concat(flatten$345(exposed$666.token.inner)).concat(closeParen$668);
            }
            stx$665.token.sm_lineNumber = stx$665.token.sm_lineNumber ? stx$665.token.sm_lineNumber : stx$665.token.lineNumber;
            stx$665.token.sm_lineStart = stx$665.token.sm_lineStart ? stx$665.token.sm_lineStart : stx$665.token.lineStart;
            stx$665.token.sm_range = stx$665.token.sm_range ? stx$665.token.sm_range : stx$665.token.range;
            return acc$664.concat(stx$665);
        }, []);
    }
    exports$172.enforest = enforest$334;
    exports$172.expand = expandTopLevel$344;
    exports$172.resolve = resolve$284;
    exports$172.get_expression = get_expression$335;
    exports$172.makeExpanderContext = makeExpanderContext$343;
    exports$172.Expr = Expr$296;
    exports$172.VariableStatement = VariableStatement$323;
    exports$172.tokensToSyntax = syn$175.tokensToSyntax;
    exports$172.syntaxToTokens = syn$175.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map