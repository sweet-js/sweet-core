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
                var o$390 = Object.create(this);
                if (typeof o$390.construct === 'function') {
                    o$390.construct.apply(o$390, arguments);
                }
                return o$390;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$391) {
                var result$392 = Object.create(this);
                for (var prop$393 in properties$391) {
                    if (properties$391.hasOwnProperty(prop$393)) {
                        result$392[prop$393] = properties$391[prop$393];
                    }
                }
                return result$392;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$394) {
                function F$395() {
                }
                F$395.prototype = proto$394;
                return this instanceof F$395;
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
    var builtinMode$322 = false;
    var expandCount$323 = 0;
    var maxExpands$324;
    function remdup$325(mark$396, mlist$397) {
        if (mark$396 === _$212.first(mlist$397)) {
            return _$212.rest(mlist$397, 1);
        }
        return [mark$396].concat(mlist$397);
    }
    // (CSyntax) -> [...Num]
    function marksof$326(ctx$398, stopName$399, originalName$400) {
        var mark$401, submarks$402;
        if (isMark$318(ctx$398)) {
            mark$401 = ctx$398.mark;
            submarks$402 = marksof$326(ctx$398.context, stopName$399, originalName$400);
            return remdup$325(mark$401, submarks$402);
        }
        if (isDef$317(ctx$398)) {
            return marksof$326(ctx$398.context, stopName$399, originalName$400);
        }
        if (isRename$319(ctx$398)) {
            if (stopName$399 === originalName$400 + '$' + ctx$398.name) {
                return [];
            }
            return marksof$326(ctx$398.context, stopName$399, originalName$400);
        }
        return [];
    }
    function resolve$327(stx$403) {
        return resolveCtx$331(stx$403.token.value, stx$403.context, [], []);
    }
    function arraysEqual$328(a$404, b$405) {
        if (a$404.length !== b$405.length) {
            return false;
        }
        for (var i$406 = 0; i$406 < a$404.length; i$406++) {
            if (a$404[i$406] !== b$405[i$406]) {
                return false;
            }
        }
        return true;
    }
    function renames$329(defctx$407, oldctx$408, originalName$409) {
        var acc$410 = oldctx$408;
        for (var i$411 = 0; i$411 < defctx$407.length; i$411++) {
            if (defctx$407[i$411].id.token.value === originalName$409) {
                acc$410 = Rename$313(defctx$407[i$411].id, defctx$407[i$411].name, acc$410, defctx$407);
            }
        }
        return acc$410;
    }
    function unionEl$330(arr$412, el$413) {
        if (arr$412.indexOf(el$413) === -1) {
            var res$414 = arr$412.slice(0);
            res$414.push(el$413);
            return res$414;
        }
        return arr$412;
    }
    // (Syntax) -> String
    function resolveCtx$331(originalName$415, ctx$416, stop_spine$417, stop_branch$418) {
        if (isMark$318(ctx$416)) {
            return resolveCtx$331(originalName$415, ctx$416.context, stop_spine$417, stop_branch$418);
        }
        if (isDef$317(ctx$416)) {
            if (stop_spine$417.indexOf(ctx$416.defctx) !== -1) {
                return resolveCtx$331(originalName$415, ctx$416.context, stop_spine$417, stop_branch$418);
            } else {
                return resolveCtx$331(originalName$415, renames$329(ctx$416.defctx, ctx$416.context, originalName$415), stop_spine$417, unionEl$330(stop_branch$418, ctx$416.defctx));
            }
        }
        if (isRename$319(ctx$416)) {
            if (originalName$415 === ctx$416.id.token.value) {
                var idName$419 = resolveCtx$331(ctx$416.id.token.value, ctx$416.id.context, stop_branch$418, stop_branch$418);
                var subName$420 = resolveCtx$331(originalName$415, ctx$416.context, unionEl$330(stop_spine$417, ctx$416.def), stop_branch$418);
                if (idName$419 === subName$420) {
                    var idMarks$421 = marksof$326(ctx$416.id.context, originalName$415 + '$' + ctx$416.name, originalName$415);
                    var subMarks$422 = marksof$326(ctx$416.context, originalName$415 + '$' + ctx$416.name, originalName$415);
                    if (arraysEqual$328(idMarks$421, subMarks$422)) {
                        return originalName$415 + '$' + ctx$416.name;
                    }
                }
            }
            return resolveCtx$331(originalName$415, ctx$416.context, stop_spine$417, stop_branch$418);
        }
        return originalName$415;
    }
    var nextFresh$332 = 0;
    // fun () -> Num
    function fresh$333() {
        return nextFresh$332++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$334(towrap$423, delimSyntax$424) {
        assert$220(delimSyntax$424.token.type === parser$213.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$320({
            type: parser$213.Token.Delimiter,
            value: delimSyntax$424.token.value,
            inner: towrap$423,
            range: delimSyntax$424.token.range,
            startLineNumber: delimSyntax$424.token.startLineNumber,
            lineStart: delimSyntax$424.token.lineStart
        }, delimSyntax$424);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$335(argSyntax$425) {
        if (argSyntax$425.token.type === parser$213.Token.Delimiter) {
            return _$212.filter(argSyntax$425.token.inner, function (stx$426) {
                return stx$426.token.value !== ',';
            });
        } else if (argSyntax$425.token.type === parser$213.Token.Identifier) {
            return [argSyntax$425];
        } else {
            assert$220(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$336 = {
            destruct: function () {
                return _$212.reduce(this.properties, _$212.bind(function (acc$427, prop$428) {
                    if (this[prop$428] && this[prop$428].hasPrototype(TermTree$336)) {
                        return acc$427.concat(this[prop$428].destruct());
                    } else if (this[prop$428] && this[prop$428].token && this[prop$428].token.inner) {
                        this[prop$428].token.inner = _$212.reduce(this[prop$428].token.inner, function (acc$429, t$430) {
                            if (t$430.hasPrototype(TermTree$336)) {
                                return acc$429.concat(t$430.destruct());
                            }
                            return acc$429.concat(t$430);
                        }, []);
                        return acc$427.concat(this[prop$428]);
                    } else if (Array.isArray(this[prop$428])) {
                        return acc$427.concat(_$212.reduce(this[prop$428], function (acc$431, t$432) {
                            if (t$432.hasPrototype(TermTree$336)) {
                                return acc$431.concat(t$432.destruct());
                            }
                            return acc$431.concat(t$432);
                        }, []));
                    } else if (this[prop$428]) {
                        return acc$427.concat(this[prop$428]);
                    } else {
                        return acc$427;
                    }
                }, this), []);
            },
            addDefCtx: function (def$433) {
                for (var i$434 = 0; i$434 < this.properties.length; i$434++) {
                    var prop$435 = this.properties[i$434];
                    if (Array.isArray(this[prop$435])) {
                        this[prop$435] = _$212.map(this[prop$435], function (item$436) {
                            return item$436.addDefCtx(def$433);
                        });
                    } else if (this[prop$435]) {
                        this[prop$435] = this[prop$435].addDefCtx(def$433);
                    }
                }
                return this;
            },
            rename: function (id$437, name$438) {
                for (var i$439 = 0; i$439 < this.properties.length; i$439++) {
                    var prop$440 = this.properties[i$439];
                    if (Array.isArray(this[prop$440])) {
                        this[prop$440] = _$212.map(this[prop$440], function (item$441) {
                            return item$441.rename(id$437, name$438);
                        });
                    } else if (this[prop$440]) {
                        this[prop$440] = this[prop$440].rename(id$437, name$438);
                    }
                }
                return this;
            }
        };
    var EOF$337 = TermTree$336.extend({
            properties: ['eof'],
            construct: function (e$442) {
                this.eof = e$442;
            }
        });
    var Statement$338 = TermTree$336.extend({
            construct: function () {
            }
        });
    var Expr$339 = Statement$338.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$340 = Expr$339.extend({
            construct: function () {
            }
        });
    var ThisExpression$341 = PrimaryExpression$340.extend({
            properties: ['this'],
            construct: function (that$443) {
                this.this = that$443;
            }
        });
    var Lit$342 = PrimaryExpression$340.extend({
            properties: ['lit'],
            construct: function (l$444) {
                this.lit = l$444;
            }
        });
    exports$211._test.PropertyAssignment = PropertyAssignment$343;
    var PropertyAssignment$343 = TermTree$336.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$445, assignment$446) {
                this.propName = propName$445;
                this.assignment = assignment$446;
            }
        });
    var Block$344 = PrimaryExpression$340.extend({
            properties: ['body'],
            construct: function (body$447) {
                this.body = body$447;
            }
        });
    var ArrayLiteral$345 = PrimaryExpression$340.extend({
            properties: ['array'],
            construct: function (ar$448) {
                this.array = ar$448;
            }
        });
    var ParenExpression$346 = PrimaryExpression$340.extend({
            properties: ['expr'],
            construct: function (expr$449) {
                this.expr = expr$449;
            }
        });
    var UnaryOp$347 = Expr$339.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$450, expr$451) {
                this.op = op$450;
                this.expr = expr$451;
            }
        });
    var PostfixOp$348 = Expr$339.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$452, op$453) {
                this.expr = expr$452;
                this.op = op$453;
            }
        });
    var BinOp$349 = Expr$339.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$454, left$455, right$456) {
                this.op = op$454;
                this.left = left$455;
                this.right = right$456;
            }
        });
    var ConditionalExpression$350 = Expr$339.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$457, question$458, tru$459, colon$460, fls$461) {
                this.cond = cond$457;
                this.question = question$458;
                this.tru = tru$459;
                this.colon = colon$460;
                this.fls = fls$461;
            }
        });
    var Keyword$351 = TermTree$336.extend({
            properties: ['keyword'],
            construct: function (k$462) {
                this.keyword = k$462;
            }
        });
    var Punc$352 = TermTree$336.extend({
            properties: ['punc'],
            construct: function (p$463) {
                this.punc = p$463;
            }
        });
    var Delimiter$353 = TermTree$336.extend({
            properties: ['delim'],
            construct: function (d$464) {
                this.delim = d$464;
            }
        });
    var Id$354 = PrimaryExpression$340.extend({
            properties: ['id'],
            construct: function (id$465) {
                this.id = id$465;
            }
        });
    var NamedFun$355 = Expr$339.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$466, star$467, name$468, params$469, body$470) {
                this.keyword = keyword$466;
                this.star = star$467;
                this.name = name$468;
                this.params = params$469;
                this.body = body$470;
            }
        });
    var AnonFun$356 = Expr$339.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$471, star$472, params$473, body$474) {
                this.keyword = keyword$471;
                this.star = star$472;
                this.params = params$473;
                this.body = body$474;
            }
        });
    var ArrowFun$357 = Expr$339.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$475, arrow$476, body$477) {
                this.params = params$475;
                this.arrow = arrow$476;
                this.body = body$477;
            }
        });
    var LetMacro$358 = TermTree$336.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$478, body$479) {
                this.name = name$478;
                this.body = body$479;
            }
        });
    var Macro$359 = TermTree$336.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$480, body$481) {
                this.name = name$480;
                this.body = body$481;
            }
        });
    var AnonMacro$360 = TermTree$336.extend({
            properties: ['body'],
            construct: function (body$482) {
                this.body = body$482;
            }
        });
    var Const$361 = Expr$339.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$483, call$484) {
                this.newterm = newterm$483;
                this.call = call$484;
            }
        });
    var Call$362 = Expr$339.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                assert$220(this.fun.hasPrototype(TermTree$336), 'expecting a term tree in destruct of call');
                var that$485 = this;
                this.delim = syntaxFromToken$320(_$212.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$212.reduce(this.args, function (acc$486, term$487) {
                    assert$220(term$487 && term$487.hasPrototype(TermTree$336), 'expecting term trees in destruct of Call');
                    var dst$488 = acc$486.concat(term$487.destruct());
                    // add all commas except for the last one
                    if (that$485.commas.length > 0) {
                        dst$488 = dst$488.concat(that$485.commas.shift());
                    }
                    return dst$488;
                }, []);
                return this.fun.destruct().concat(Delimiter$353.create(this.delim).destruct());
            },
            construct: function (funn$489, args$490, delim$491, commas$492) {
                assert$220(Array.isArray(args$490), 'requires an array of arguments terms');
                this.fun = funn$489;
                this.args = args$490;
                this.delim = delim$491;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$492;
            }
        });
    var ObjDotGet$363 = Expr$339.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$493, dot$494, right$495) {
                this.left = left$493;
                this.dot = dot$494;
                this.right = right$495;
            }
        });
    var ObjGet$364 = Expr$339.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$496, right$497) {
                this.left = left$496;
                this.right = right$497;
            }
        });
    var VariableDeclaration$365 = TermTree$336.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$498, eqstx$499, init$500, comma$501) {
                this.ident = ident$498;
                this.eqstx = eqstx$499;
                this.init = init$500;
                this.comma = comma$501;
            }
        });
    var VariableStatement$366 = Statement$338.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$212.reduce(this.decls, function (acc$502, decl$503) {
                    return acc$502.concat(decl$503.destruct());
                }, []));
            },
            construct: function (varkw$504, decls$505) {
                assert$220(Array.isArray(decls$505), 'decls must be an array');
                this.varkw = varkw$504;
                this.decls = decls$505;
            }
        });
    var LetStatement$367 = Statement$338.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$212.reduce(this.decls, function (acc$506, decl$507) {
                    return acc$506.concat(decl$507.destruct());
                }, []));
            },
            construct: function (letkw$508, decls$509) {
                assert$220(Array.isArray(decls$509), 'decls must be an array');
                this.letkw = letkw$508;
                this.decls = decls$509;
            }
        });
    var ConstStatement$368 = Statement$338.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$212.reduce(this.decls, function (acc$510, decl$511) {
                    return acc$510.concat(decl$511.destruct());
                }, []));
            },
            construct: function (constkw$512, decls$513) {
                assert$220(Array.isArray(decls$513), 'decls must be an array');
                this.constkw = constkw$512;
                this.decls = decls$513;
            }
        });
    var CatchClause$369 = Statement$338.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$514, params$515, body$516) {
                this.catchkw = catchkw$514;
                this.params = params$515;
                this.body = body$516;
            }
        });
    var Module$370 = TermTree$336.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$517) {
                this.body = body$517;
                this.exports = [];
            }
        });
    var Empty$371 = Statement$338.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$372 = TermTree$336.extend({
            properties: ['name'],
            construct: function (name$518) {
                this.name = name$518;
            }
        });
    var ForStatement$373 = Statement$338.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$519, cond$520) {
                this.forkw = forkw$519;
                this.cond = cond$520;
            }
        });
    function stxIsUnaryOp$374(stx$521) {
        var staticOperators$522 = [
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
        return _$212.contains(staticOperators$522, unwrapSyntax$222(stx$521));
    }
    function stxIsBinOp$375(stx$523) {
        var staticOperators$524 = [
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
        return _$212.contains(staticOperators$524, unwrapSyntax$222(stx$523));
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$376(stx$525, context$526, isLet$527) {
        var decls$528 = [];
        var res$529 = enforest$378(stx$525, context$526);
        var result$530 = res$529.result;
        var rest$531 = res$529.rest;
        if (rest$531[0]) {
            if (isLet$527 && result$530.hasPrototype(Id$354)) {
                var freshName$533 = fresh$333();
                var renamedId$534 = result$530.id.rename(result$530.id, freshName$533);
                rest$531 = rest$531.map(function (stx$535) {
                    return stx$535.rename(result$530.id, freshName$533);
                });
                result$530.id = renamedId$534;
            }
            var nextRes$532 = enforest$378(rest$531, context$526);
            // x = ...
            if (nextRes$532.result.hasPrototype(Punc$352) && nextRes$532.result.punc.token.value === '=') {
                var initializerRes$536 = enforest$378(nextRes$532.rest, context$526);
                // x = y + z, ...
                if (initializerRes$536.rest[0] && initializerRes$536.rest[0].token.value === ',') {
                    decls$528.push(VariableDeclaration$365.create(result$530.id, nextRes$532.result.punc, initializerRes$536.result, initializerRes$536.rest[0]));
                    var subRes$537 = enforestVarStatement$376(initializerRes$536.rest.slice(1), context$526, isLet$527);
                    decls$528 = decls$528.concat(subRes$537.result);
                    rest$531 = subRes$537.rest;
                }    // x = y ...
                else {
                    decls$528.push(VariableDeclaration$365.create(result$530.id, nextRes$532.result.punc, initializerRes$536.result));
                    rest$531 = initializerRes$536.rest;
                }
            }    // x ,...;
            else if (nextRes$532.result.hasPrototype(Punc$352) && nextRes$532.result.punc.token.value === ',') {
                decls$528.push(VariableDeclaration$365.create(result$530.id, null, null, nextRes$532.result.punc));
                var subRes$537 = enforestVarStatement$376(nextRes$532.rest, context$526, isLet$527);
                decls$528 = decls$528.concat(subRes$537.result);
                rest$531 = subRes$537.rest;
            } else {
                if (result$530.hasPrototype(Id$354)) {
                    decls$528.push(VariableDeclaration$365.create(result$530.id));
                } else {
                    throwSyntaxError$221('enforest', 'Expecting an identifier in variable declaration', rest$531);
                }
            }
        }    // x EOF
        else {
            if (result$530.hasPrototype(Id$354)) {
                decls$528.push(VariableDeclaration$365.create(result$530.id));
            } else if (result$530.hasPrototype(BinOp$349) && result$530.op.token.value === 'in') {
                decls$528.push(VariableDeclaration$365.create(result$530.left.id, result$530.op, result$530.right));
            } else {
                throwSyntaxError$221('enforest', 'Expecting an identifier in variable declaration', stx$525);
            }
        }
        return {
            result: decls$528,
            rest: rest$531
        };
    }
    function adjustLineContext$377(stx$538, original$539, current$540) {
        current$540 = current$540 || {
            lastLineNumber: original$539.token.lineNumber,
            lineNumber: original$539.token.lineNumber - 1
        };
        return _$212.map(stx$538, function (stx$541) {
            if (stx$541.token.type === parser$213.Token.Delimiter) {
                // handle tokens with missing line info
                stx$541.token.startLineNumber = typeof stx$541.token.startLineNumber == 'undefined' ? original$539.token.lineNumber : stx$541.token.startLineNumber;
                stx$541.token.endLineNumber = typeof stx$541.token.endLineNumber == 'undefined' ? original$539.token.lineNumber : stx$541.token.endLineNumber;
                stx$541.token.startLineStart = typeof stx$541.token.startLineStart == 'undefined' ? original$539.token.lineStart : stx$541.token.startLineStart;
                stx$541.token.endLineStart = typeof stx$541.token.endLineStart == 'undefined' ? original$539.token.lineStart : stx$541.token.endLineStart;
                stx$541.token.startRange = typeof stx$541.token.startRange == 'undefined' ? original$539.token.range : stx$541.token.startRange;
                stx$541.token.endRange = typeof stx$541.token.endRange == 'undefined' ? original$539.token.range : stx$541.token.endRange;
                stx$541.token.sm_startLineNumber = typeof stx$541.token.sm_startLineNumber == 'undefined' ? stx$541.token.startLineNumber : stx$541.token.sm_startLineNumber;
                stx$541.token.sm_endLineNumber = typeof stx$541.token.sm_endLineNumber == 'undefined' ? stx$541.token.endLineNumber : stx$541.token.sm_endLineNumber;
                stx$541.token.sm_startLineStart = typeof stx$541.token.sm_startLineStart == 'undefined' ? stx$541.token.startLineStart : stx$541.token.sm_startLineStart;
                stx$541.token.sm_endLineStart = typeof stx$541.token.sm_endLineStart == 'undefined' ? stx$541.token.endLineStart : stx$541.token.sm_endLineStart;
                stx$541.token.sm_startRange = typeof stx$541.token.sm_startRange == 'undefined' ? stx$541.token.startRange : stx$541.token.sm_startRange;
                stx$541.token.sm_endRange = typeof stx$541.token.sm_endRange == 'undefined' ? stx$541.token.endRange : stx$541.token.sm_endRange;
                if (stx$541.token.startLineNumber === current$540.lastLineNumber && current$540.lastLineNumber !== current$540.lineNumber) {
                    stx$541.token.startLineNumber = current$540.lineNumber;
                } else if (stx$541.token.startLineNumber !== current$540.lastLineNumber) {
                    current$540.lineNumber++;
                    current$540.lastLineNumber = stx$541.token.startLineNumber;
                    stx$541.token.startLineNumber = current$540.lineNumber;
                }
                if (stx$541.token.inner.length > 0) {
                    stx$541.token.inner = adjustLineContext$377(stx$541.token.inner, original$539, current$540);
                }
                return stx$541;
            }
            // handle tokens with missing line info
            stx$541.token.lineNumber = typeof stx$541.token.lineNumber == 'undefined' ? original$539.token.lineNumber : stx$541.token.lineNumber;
            stx$541.token.lineStart = typeof stx$541.token.lineStart == 'undefined' ? original$539.token.lineStart : stx$541.token.lineStart;
            stx$541.token.range = typeof stx$541.token.range == 'undefined' ? original$539.token.range : stx$541.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$541.token.sm_lineNumber = typeof stx$541.token.sm_lineNumber == 'undefined' ? stx$541.token.lineNumber : stx$541.token.sm_lineNumber;
            stx$541.token.sm_lineStart = typeof stx$541.token.sm_lineStart == 'undefined' ? stx$541.token.lineStart : stx$541.token.sm_lineStart;
            stx$541.token.sm_range = typeof stx$541.token.sm_range == 'undefined' ? _$212.clone(stx$541.token.range) : stx$541.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$541.token.lineNumber === current$540.lastLineNumber && current$540.lastLineNumber !== current$540.lineNumber) {
                stx$541.token.lineNumber = current$540.lineNumber;
            } else if (stx$541.token.lineNumber !== current$540.lastLineNumber) {
                current$540.lineNumber++;
                current$540.lastLineNumber = stx$541.token.lineNumber;
                stx$541.token.lineNumber = current$540.lineNumber;
            }
            return stx$541;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$378(toks$542, context$543) {
        assert$220(toks$542.length > 0, 'enforest assumes there are tokens to work with');
        function step$544(head$545, rest$546) {
            var innerTokens$547;
            assert$220(Array.isArray(rest$546), 'result must at least be an empty array');
            if (head$545.hasPrototype(TermTree$336)) {
                // function call
                var emp$550 = head$545.emp;
                var emp$550 = head$545.emp;
                var keyword$553 = head$545.keyword;
                var delim$555 = head$545.delim;
                var id$557 = head$545.id;
                var delim$555 = head$545.delim;
                var emp$550 = head$545.emp;
                var punc$561 = head$545.punc;
                var keyword$553 = head$545.keyword;
                var emp$550 = head$545.emp;
                var emp$550 = head$545.emp;
                var emp$550 = head$545.emp;
                var delim$555 = head$545.delim;
                var delim$555 = head$545.delim;
                var id$557 = head$545.id;
                var keyword$553 = head$545.keyword;
                var keyword$553 = head$545.keyword;
                var keyword$553 = head$545.keyword;
                var keyword$553 = head$545.keyword;
                var keyword$553 = head$545.keyword;
                if (head$545.hasPrototype(Expr$339) && rest$546[0] && rest$546[0].token.type === parser$213.Token.Delimiter && rest$546[0].token.value === '()') {
                    var argRes$596, enforestedArgs$597 = [], commas$598 = [];
                    rest$546[0].expose();
                    innerTokens$547 = rest$546[0].token.inner;
                    while (innerTokens$547.length > 0) {
                        argRes$596 = enforest$378(innerTokens$547, context$543);
                        enforestedArgs$597.push(argRes$596.result);
                        innerTokens$547 = argRes$596.rest;
                        if (innerTokens$547[0] && innerTokens$547[0].token.value === ',') {
                            // record the comma for later
                            commas$598.push(innerTokens$547[0]);
                            // but dump it for the next loop turn
                            innerTokens$547 = innerTokens$547.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$599 = _$212.all(enforestedArgs$597, function (argTerm$600) {
                            return argTerm$600.hasPrototype(Expr$339);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$547.length === 0 && argsAreExprs$599) {
                        return step$544(Call$362.create(head$545, enforestedArgs$597, rest$546[0], commas$598), rest$546.slice(1));
                    }
                } else if (head$545.hasPrototype(Expr$339) && rest$546[0] && unwrapSyntax$222(rest$546[0]) === '?') {
                    var question$601 = rest$546[0];
                    var condRes$602 = enforest$378(rest$546.slice(1), context$543);
                    var truExpr$603 = condRes$602.result;
                    var right$604 = condRes$602.rest;
                    if (truExpr$603.hasPrototype(Expr$339) && right$604[0] && unwrapSyntax$222(right$604[0]) === ':') {
                        var colon$605 = right$604[0];
                        var flsRes$606 = enforest$378(right$604.slice(1), context$543);
                        var flsExpr$607 = flsRes$606.result;
                        if (flsExpr$607.hasPrototype(Expr$339)) {
                            return step$544(ConditionalExpression$350.create(head$545, question$601, truExpr$603, colon$605, flsExpr$607), flsRes$606.rest);
                        }
                    }
                } else if (head$545.hasPrototype(Keyword$351) && unwrapSyntax$222(keyword$553) === 'new' && rest$546[0]) {
                    var newCallRes$608 = enforest$378(rest$546, context$543);
                    if (newCallRes$608.result.hasPrototype(Call$362)) {
                        return step$544(Const$361.create(head$545, newCallRes$608.result), newCallRes$608.rest);
                    }
                } else if (head$545.hasPrototype(Delimiter$353) && delim$555.token.value === '()' && rest$546[0] && rest$546[0].token.type === parser$213.Token.Punctuator && unwrapSyntax$222(rest$546[0]) === '=>') {
                    var res$609 = enforest$378(rest$546.slice(1), context$543);
                    if (res$609.result.hasPrototype(Expr$339)) {
                        return step$544(ArrowFun$357.create(delim$555, rest$546[0], res$609.result.destruct()), res$609.rest);
                    } else {
                        throwSyntaxError$221('enforest', 'Body of arrow function must be an expression', rest$546.slice(1));
                    }
                } else if (head$545.hasPrototype(Id$354) && rest$546[0] && rest$546[0].token.type === parser$213.Token.Punctuator && unwrapSyntax$222(rest$546[0]) === '=>') {
                    var res$609 = enforest$378(rest$546.slice(1), context$543);
                    if (res$609.result.hasPrototype(Expr$339)) {
                        return step$544(ArrowFun$357.create(id$557, rest$546[0], res$609.result.destruct()), res$609.rest);
                    } else {
                        throwSyntaxError$221('enforest', 'Body of arrow function must be an expression', rest$546.slice(1));
                    }
                } else if (head$545.hasPrototype(Delimiter$353) && delim$555.token.value === '()') {
                    innerTokens$547 = delim$555.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$547.length === 0) {
                        return step$544(ParenExpression$346.create(head$545), rest$546);
                    } else {
                        var innerTerm$610 = get_expression$379(innerTokens$547, context$543);
                        if (innerTerm$610.result && innerTerm$610.result.hasPrototype(Expr$339)) {
                            return step$544(ParenExpression$346.create(head$545), rest$546);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$545.hasPrototype(Expr$339) && rest$546[0] && rest$546[1] && stxIsBinOp$375(rest$546[0])) {
                    var op$611 = rest$546[0];
                    var left$612 = head$545;
                    var bopRes$613 = enforest$378(rest$546.slice(1), context$543);
                    var right$604 = bopRes$613.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$604.hasPrototype(Expr$339)) {
                        return step$544(BinOp$349.create(op$611, left$612, right$604), bopRes$613.rest);
                    }
                } else if (head$545.hasPrototype(Punc$352) && stxIsUnaryOp$374(punc$561)) {
                    var unopRes$614 = enforest$378(rest$546, context$543);
                    if (unopRes$614.result.hasPrototype(Expr$339)) {
                        return step$544(UnaryOp$347.create(punc$561, unopRes$614.result), unopRes$614.rest);
                    }
                } else if (head$545.hasPrototype(Keyword$351) && stxIsUnaryOp$374(keyword$553)) {
                    var unopRes$614 = enforest$378(rest$546, context$543);
                    if (unopRes$614.result.hasPrototype(Expr$339)) {
                        return step$544(UnaryOp$347.create(keyword$553, unopRes$614.result), unopRes$614.rest);
                    }
                } else if (head$545.hasPrototype(Expr$339) && rest$546[0] && (unwrapSyntax$222(rest$546[0]) === '++' || unwrapSyntax$222(rest$546[0]) === '--')) {
                    return step$544(PostfixOp$348.create(head$545, rest$546[0]), rest$546.slice(1));
                } else if (head$545.hasPrototype(Expr$339) && rest$546[0] && rest$546[0].token.value === '[]') {
                    return step$544(ObjGet$364.create(head$545, Delimiter$353.create(rest$546[0].expose())), rest$546.slice(1));
                } else if (head$545.hasPrototype(Expr$339) && rest$546[0] && unwrapSyntax$222(rest$546[0]) === '.' && rest$546[1] && rest$546[1].token.type === parser$213.Token.Identifier) {
                    return step$544(ObjDotGet$363.create(head$545, rest$546[0], rest$546[1]), rest$546.slice(2));
                } else if (head$545.hasPrototype(Delimiter$353) && delim$555.token.value === '[]') {
                    return step$544(ArrayLiteral$345.create(head$545), rest$546);
                } else if (head$545.hasPrototype(Delimiter$353) && head$545.delim.token.value === '{}') {
                    return step$544(Block$344.create(head$545), rest$546);
                } else if (head$545.hasPrototype(Id$354) && unwrapSyntax$222(id$557) === '#quoteSyntax' && rest$546[0] && rest$546[0].token.value === '{}') {
                    var tempId$615 = fresh$333();
                    context$543.templateMap.set(tempId$615, rest$546[0].token.inner);
                    return step$544(syn$214.makeIdent('getTemplate', id$557), [syn$214.makeDelim('()', [syn$214.makeValue(tempId$615, id$557)], id$557)].concat(rest$546.slice(1)));
                } else if (head$545.hasPrototype(Keyword$351) && unwrapSyntax$222(keyword$553) === 'let' && (rest$546[0] && rest$546[0].token.type === parser$213.Token.Identifier || rest$546[0] && rest$546[0].token.type === parser$213.Token.Keyword || rest$546[0] && rest$546[0].token.type === parser$213.Token.Punctuator) && rest$546[1] && unwrapSyntax$222(rest$546[1]) === '=' && rest$546[2] && rest$546[2].token.value === 'macro') {
                    var mac$616 = enforest$378(rest$546.slice(2), context$543);
                    if (!mac$616.result.hasPrototype(AnonMacro$360)) {
                        throwSyntaxError$221('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$546.slice(2));
                    }
                    return step$544(LetMacro$358.create(rest$546[0], mac$616.result.body), mac$616.rest);
                } else if (head$545.hasPrototype(Keyword$351) && unwrapSyntax$222(keyword$553) === 'var' && rest$546[0]) {
                    var vsRes$617 = enforestVarStatement$376(rest$546, context$543, false);
                    if (vsRes$617) {
                        return step$544(VariableStatement$366.create(head$545, vsRes$617.result), vsRes$617.rest);
                    }
                } else if (head$545.hasPrototype(Keyword$351) && unwrapSyntax$222(keyword$553) === 'let' && rest$546[0]) {
                    var vsRes$617 = enforestVarStatement$376(rest$546, context$543, true);
                    if (vsRes$617) {
                        return step$544(LetStatement$367.create(head$545, vsRes$617.result), vsRes$617.rest);
                    }
                } else if (head$545.hasPrototype(Keyword$351) && unwrapSyntax$222(keyword$553) === 'const' && rest$546[0]) {
                    var vsRes$617 = enforestVarStatement$376(rest$546, context$543, true);
                    if (vsRes$617) {
                        return step$544(ConstStatement$368.create(head$545, vsRes$617.result), vsRes$617.rest);
                    }
                } else if (head$545.hasPrototype(Keyword$351) && unwrapSyntax$222(keyword$553) === 'for' && rest$546[0] && rest$546[0].token.value === '()') {
                    return step$544(ForStatement$373.create(keyword$553, rest$546[0]), rest$546.slice(1));
                }
            } else {
                assert$220(head$545 && head$545.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$545.token.type === parser$213.Token.Identifier || head$545.token.type === parser$213.Token.Keyword || head$545.token.type === parser$213.Token.Punctuator) && context$543.env.has(resolve$327(head$545))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$618 = fresh$333();
                    var transformerContext$619 = makeExpanderContext$387(_$212.defaults({ mark: newMark$618 }, context$543));
                    // pull the macro transformer out the environment
                    var mac$616 = context$543.env.get(resolve$327(head$545));
                    var transformer$620 = mac$616.fn;
                    if (expandCount$323 >= maxExpands$324) {
                        return {
                            result: head$545,
                            rest: rest$546
                        };
                    } else if (!builtinMode$322 && !mac$616.builtin) {
                        expandCount$323++;
                    }
                    // apply the transformer
                    try {
                        var rt$621 = transformer$620([head$545].concat(rest$546), transformerContext$619);
                    } catch (e$622) {
                        if (e$622.type && e$622.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$623 = '`' + rest$546.slice(0, 5).map(function (stx$624) {
                                    return stx$624.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$221('macro', 'Macro `' + head$545.token.value + '` could not be matched with ' + argumentString$623, head$545);
                        } else {
                            // just rethrow it
                            throw e$622;
                        }
                    }
                    if (!Array.isArray(rt$621.result)) {
                        throwSyntaxError$221('enforest', 'Macro must return a syntax array', head$545);
                    }
                    if (rt$621.result.length > 0) {
                        var adjustedResult$625 = adjustLineContext$377(rt$621.result, head$545);
                        adjustedResult$625[0].token.leadingComments = head$545.token.leadingComments;
                        return step$544(adjustedResult$625[0], adjustedResult$625.slice(1).concat(rt$621.rest));
                    } else {
                        return step$544(Empty$371.create(), rt$621.rest);
                    }
                }    // anon macro definition
                else if (head$545.token.type === parser$213.Token.Identifier && head$545.token.value === 'macro' && rest$546[0] && rest$546[0].token.value === '{}') {
                    return step$544(AnonMacro$360.create(rest$546[0].expose().token.inner), rest$546.slice(1));
                }    // macro definition
                else if (head$545.token.type === parser$213.Token.Identifier && head$545.token.value === 'macro' && rest$546[0] && (rest$546[0].token.type === parser$213.Token.Identifier || rest$546[0].token.type === parser$213.Token.Keyword || rest$546[0].token.type === parser$213.Token.Punctuator) && rest$546[1] && rest$546[1].token.type === parser$213.Token.Delimiter && rest$546[1].token.value === '{}') {
                    return step$544(Macro$359.create(rest$546[0], rest$546[1].expose().token.inner), rest$546.slice(2));
                }    // module definition
                else if (unwrapSyntax$222(head$545) === 'module' && rest$546[0] && rest$546[0].token.value === '{}') {
                    return step$544(Module$370.create(rest$546[0]), rest$546.slice(1));
                }    // function definition
                else if (head$545.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$545) === 'function' && rest$546[0] && rest$546[0].token.type === parser$213.Token.Identifier && rest$546[1] && rest$546[1].token.type === parser$213.Token.Delimiter && rest$546[1].token.value === '()' && rest$546[2] && rest$546[2].token.type === parser$213.Token.Delimiter && rest$546[2].token.value === '{}') {
                    rest$546[1].token.inner = rest$546[1].expose().token.inner;
                    rest$546[2].token.inner = rest$546[2].expose().token.inner;
                    return step$544(NamedFun$355.create(head$545, null, rest$546[0], rest$546[1], rest$546[2]), rest$546.slice(3));
                }    // generator function definition
                else if (head$545.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$545) === 'function' && rest$546[0] && rest$546[0].token.type === parser$213.Token.Punctuator && rest$546[0].token.value === '*' && rest$546[1] && rest$546[1].token.type === parser$213.Token.Identifier && rest$546[2] && rest$546[2].token.type === parser$213.Token.Delimiter && rest$546[2].token.value === '()' && rest$546[3] && rest$546[3].token.type === parser$213.Token.Delimiter && rest$546[3].token.value === '{}') {
                    rest$546[2].token.inner = rest$546[2].expose().token.inner;
                    rest$546[3].token.inner = rest$546[3].expose().token.inner;
                    return step$544(NamedFun$355.create(head$545, rest$546[0], rest$546[1], rest$546[2], rest$546[3]), rest$546.slice(4));
                }    // anonymous function definition
                else if (head$545.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$545) === 'function' && rest$546[0] && rest$546[0].token.type === parser$213.Token.Delimiter && rest$546[0].token.value === '()' && rest$546[1] && rest$546[1].token.type === parser$213.Token.Delimiter && rest$546[1].token.value === '{}') {
                    rest$546[0].token.inner = rest$546[0].expose().token.inner;
                    rest$546[1].token.inner = rest$546[1].expose().token.inner;
                    return step$544(AnonFun$356.create(head$545, null, rest$546[0], rest$546[1]), rest$546.slice(2));
                }    // anonymous generator function definition
                else if (head$545.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$545) === 'function' && rest$546[0] && rest$546[0].token.type === parser$213.Token.Punctuator && rest$546[0].token.value === '*' && rest$546[1] && rest$546[1].token.type === parser$213.Token.Delimiter && rest$546[1].token.value === '()' && rest$546[2] && rest$546[2].token.type === parser$213.Token.Delimiter && rest$546[2].token.value === '{}') {
                    rest$546[1].token.inner = rest$546[1].expose().token.inner;
                    rest$546[2].token.inner = rest$546[2].expose().token.inner;
                    return step$544(AnonFun$356.create(head$545, rest$546[0], rest$546[1], rest$546[2]), rest$546.slice(3));
                }    // arrow function
                else if ((head$545.token.type === parser$213.Token.Delimiter && head$545.token.value === '()' || head$545.token.type === parser$213.Token.Identifier) && rest$546[0] && rest$546[0].token.type === parser$213.Token.Punctuator && rest$546[0].token.value === '=>' && rest$546[1] && rest$546[1].token.type === parser$213.Token.Delimiter && rest$546[1].token.value === '{}') {
                    return step$544(ArrowFun$357.create(head$545, rest$546[0], rest$546[1]), rest$546.slice(2));
                }    // catch statement
                else if (head$545.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$545) === 'catch' && rest$546[0] && rest$546[0].token.type === parser$213.Token.Delimiter && rest$546[0].token.value === '()' && rest$546[1] && rest$546[1].token.type === parser$213.Token.Delimiter && rest$546[1].token.value === '{}') {
                    rest$546[0].token.inner = rest$546[0].expose().token.inner;
                    rest$546[1].token.inner = rest$546[1].expose().token.inner;
                    return step$544(CatchClause$369.create(head$545, rest$546[0], rest$546[1]), rest$546.slice(2));
                }    // this expression
                else if (head$545.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$545) === 'this') {
                    return step$544(ThisExpression$341.create(head$545), rest$546);
                }    // literal
                else if (head$545.token.type === parser$213.Token.NumericLiteral || head$545.token.type === parser$213.Token.StringLiteral || head$545.token.type === parser$213.Token.BooleanLiteral || head$545.token.type === parser$213.Token.RegularExpression || head$545.token.type === parser$213.Token.NullLiteral) {
                    return step$544(Lit$342.create(head$545), rest$546);
                }    // export
                else if (head$545.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$545) === 'export' && rest$546[0] && (rest$546[0].token.type === parser$213.Token.Identifier || rest$546[0].token.type === parser$213.Token.Keyword || rest$546[0].token.type === parser$213.Token.Punctuator)) {
                    return step$544(Export$372.create(rest$546[0]), rest$546.slice(1));
                }    // identifier
                else if (head$545.token.type === parser$213.Token.Identifier) {
                    return step$544(Id$354.create(head$545), rest$546);
                }    // punctuator
                else if (head$545.token.type === parser$213.Token.Punctuator) {
                    return step$544(Punc$352.create(head$545), rest$546);
                } else if (head$545.token.type === parser$213.Token.Keyword && unwrapSyntax$222(head$545) === 'with') {
                    throwSyntaxError$221('enforest', 'with is not supported in sweet.js', head$545);
                }    // keyword
                else if (head$545.token.type === parser$213.Token.Keyword) {
                    return step$544(Keyword$351.create(head$545), rest$546);
                }    // Delimiter
                else if (head$545.token.type === parser$213.Token.Delimiter) {
                    return step$544(Delimiter$353.create(head$545.expose()), rest$546);
                }    // end of file
                else if (head$545.token.type === parser$213.Token.EOF) {
                    assert$220(rest$546.length === 0, 'nothing should be after an EOF');
                    return step$544(EOF$337.create(head$545), []);
                } else {
                    // todo: are we missing cases?
                    assert$220(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$545,
                rest: rest$546
            };
        }
        return step$544(toks$542[0], toks$542.slice(1));
    }
    function get_expression$379(stx$626, context$627) {
        var res$628 = enforest$378(stx$626, context$627);
        if (!res$628.result.hasPrototype(Expr$339)) {
            return {
                result: null,
                rest: stx$626
            };
        }
        return res$628;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$380(newMark$629, env$630) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$631(match$632) {
            if (match$632.level === 0) {
                // replace the match property with the marked syntax
                match$632.match = _$212.map(match$632.match, function (stx$633) {
                    return stx$633.mark(newMark$629);
                });
            } else {
                _$212.each(match$632.match, function (match$634) {
                    dfs$631(match$634);
                });
            }
        }
        _$212.keys(env$630).forEach(function (key$635) {
            dfs$631(env$630[key$635]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$381(mac$636, context$637) {
        var body$638 = mac$636.body;
        // raw function primitive form
        if (!(body$638[0] && body$638[0].token.type === parser$213.Token.Keyword && body$638[0].token.value === 'function')) {
            throwSyntaxError$221('load macro', 'Primitive macro form must contain a function for the macro body', body$638);
        }
        var stub$639 = parser$213.read('()');
        stub$639[0].token.inner = body$638;
        var expanded$640 = expand$386(stub$639, context$637);
        expanded$640 = expanded$640[0].destruct().concat(expanded$640[1].eof);
        var flattend$641 = flatten$389(expanded$640);
        var bodyCode$642 = codegen$219.generate(parser$213.parse(flattend$641));
        var macroFn$643 = scopedEval$312(bodyCode$642, {
                makeValue: syn$214.makeValue,
                makeRegex: syn$214.makeRegex,
                makeIdent: syn$214.makeIdent,
                makeKeyword: syn$214.makeKeyword,
                makePunc: syn$214.makePunc,
                makeDelim: syn$214.makeDelim,
                unwrapSyntax: syn$214.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$221,
                prettyPrint: syn$214.prettyPrint,
                parser: parser$213,
                _: _$212,
                patternModule: patternModule$217,
                getTemplate: function (id$644) {
                    return cloneSyntaxArray$382(context$637.templateMap.get(id$644));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$380,
                mergeMatches: function (newMatch$645, oldMatch$646) {
                    newMatch$645.patternEnv = _$212.extend({}, oldMatch$646.patternEnv, newMatch$645.patternEnv);
                    return newMatch$645;
                }
            });
        return macroFn$643;
    }
    function cloneSyntaxArray$382(arr$647) {
        return arr$647.map(function (stx$648) {
            var o$649 = syntaxFromToken$320(_$212.clone(stx$648.token), stx$648);
            if (o$649.token.type === parser$213.Token.Delimiter) {
                o$649.token.inner = cloneSyntaxArray$382(o$649.token.inner);
            }
            return o$649;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$383(stx$650, context$651) {
        assert$220(context$651, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$650.length === 0) {
            return {
                terms: [],
                context: context$651
            };
        }
        assert$220(stx$650[0].token, 'expecting a syntax object');
        var f$652 = enforest$378(stx$650, context$651);
        // head :: TermTree
        var head$653 = f$652.result;
        // rest :: [Syntax]
        var rest$654 = f$652.rest;
        if (head$653.hasPrototype(Macro$359) && expandCount$323 < maxExpands$324) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$656 = loadMacroDef$381(head$653, context$651);
            addToDefinitionCtx$384([head$653.name], context$651.defscope, false);
            context$651.env.set(resolve$327(head$653.name), {
                fn: macroDefinition$656,
                builtin: builtinMode$322
            });
            return expandToTermTree$383(rest$654, context$651);
        }
        if (head$653.hasPrototype(LetMacro$358) && expandCount$323 < maxExpands$324) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$656 = loadMacroDef$381(head$653, context$651);
            var freshName$657 = fresh$333();
            var renamedName$658 = head$653.name.rename(head$653.name, freshName$657);
            rest$654 = _$212.map(rest$654, function (stx$659) {
                return stx$659.rename(head$653.name, freshName$657);
            });
            head$653.name = renamedName$658;
            context$651.env.set(resolve$327(head$653.name), {
                fn: macroDefinition$656,
                builtin: builtinMode$322
            });
            return expandToTermTree$383(rest$654, context$651);
        }
        if (head$653.hasPrototype(NamedFun$355)) {
            addToDefinitionCtx$384([head$653.name], context$651.defscope, true);
        }
        if (head$653.hasPrototype(VariableStatement$366)) {
            addToDefinitionCtx$384(_$212.map(head$653.decls, function (decl$660) {
                return decl$660.ident;
            }), context$651.defscope, true);
        }
        if (head$653.hasPrototype(Block$344) && head$653.body.hasPrototype(Delimiter$353)) {
            head$653.body.delim.token.inner.forEach(function (term$661) {
                if (term$661.hasPrototype(VariableStatement$366)) {
                    addToDefinitionCtx$384(_$212.map(term$661.decls, function (decl$662) {
                        return decl$662.ident;
                    }), context$651.defscope, true);
                }
            });
        }
        if (head$653.hasPrototype(Delimiter$353)) {
            head$653.delim.token.inner.forEach(function (term$663) {
                if (term$663.hasPrototype(VariableStatement$366)) {
                    addToDefinitionCtx$384(_$212.map(term$663.decls, function (decl$664) {
                        return decl$664.ident;
                    }), context$651.defscope, true);
                }
            });
        }
        if (head$653.hasPrototype(ForStatement$373)) {
            head$653.cond.expose();
            var forCond$665 = head$653.cond.token.inner;
            if (forCond$665[0] && resolve$327(forCond$665[0]) === 'let' && forCond$665[1] && forCond$665[1].token.type === parser$213.Token.Identifier) {
                var letNew$666 = fresh$333();
                var letId$667 = forCond$665[1];
                forCond$665 = forCond$665.map(function (stx$668) {
                    return stx$668.rename(letId$667, letNew$666);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$653.cond.token.inner = expand$386([forCond$665[0]], context$651).concat(expand$386(forCond$665.slice(1), context$651));
                // nice and easy case: `for (...) { ... }`
                if (rest$654[0] && rest$654[0].token.value === '{}') {
                    rest$654[0] = rest$654[0].rename(letId$667, letNew$666);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$669 = enforest$378(rest$654, context$651);
                    var renamedBodyTerm$670 = bodyEnf$669.result.rename(letId$667, letNew$666);
                    var forTrees$671 = expandToTermTree$383(bodyEnf$669.rest, context$651);
                    return {
                        terms: [
                            head$653,
                            renamedBodyTerm$670
                        ].concat(forTrees$671.terms),
                        context: forTrees$671.context
                    };
                }
            } else {
                head$653.cond.token.inner = expand$386(head$653.cond.token.inner, context$651);
            }
        }
        var trees$655 = expandToTermTree$383(rest$654, context$651);
        return {
            terms: [head$653].concat(trees$655.terms),
            context: trees$655.context
        };
    }
    function addToDefinitionCtx$384(idents$672, defscope$673, skipRep$674) {
        assert$220(idents$672 && idents$672.length > 0, 'expecting some variable identifiers');
        skipRep$674 = skipRep$674 || false;
        _$212.each(idents$672, function (id$675) {
            var skip$676 = false;
            if (skipRep$674) {
                var declRepeat$677 = _$212.find(defscope$673, function (def$678) {
                        return def$678.id.token.value === id$675.token.value && arraysEqual$328(marksof$326(def$678.id.context), marksof$326(id$675.context));
                    });
                skip$676 = typeof declRepeat$677 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$676) {
                var name$679 = fresh$333();
                defscope$673.push({
                    id: id$675,
                    name: name$679
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$385(term$680, context$681) {
        assert$220(context$681 && context$681.env, 'environment map is required');
        if (term$680.hasPrototype(ArrayLiteral$345)) {
            term$680.array.delim.token.inner = expand$386(term$680.array.delim.expose().token.inner, context$681);
            return term$680;
        } else if (term$680.hasPrototype(Block$344)) {
            term$680.body.delim.token.inner = expand$386(term$680.body.delim.expose().token.inner, context$681);
            return term$680;
        } else if (term$680.hasPrototype(ParenExpression$346)) {
            term$680.expr.delim.token.inner = expand$386(term$680.expr.delim.expose().token.inner, context$681);
            return term$680;
        } else if (term$680.hasPrototype(Call$362)) {
            term$680.fun = expandTermTreeToFinal$385(term$680.fun, context$681);
            term$680.args = _$212.map(term$680.args, function (arg$682) {
                return expandTermTreeToFinal$385(arg$682, context$681);
            });
            return term$680;
        } else if (term$680.hasPrototype(UnaryOp$347)) {
            term$680.expr = expandTermTreeToFinal$385(term$680.expr, context$681);
            return term$680;
        } else if (term$680.hasPrototype(BinOp$349)) {
            term$680.left = expandTermTreeToFinal$385(term$680.left, context$681);
            term$680.right = expandTermTreeToFinal$385(term$680.right, context$681);
            return term$680;
        } else if (term$680.hasPrototype(ObjGet$364)) {
            term$680.right.delim.token.inner = expand$386(term$680.right.delim.expose().token.inner, context$681);
            return term$680;
        } else if (term$680.hasPrototype(ObjDotGet$363)) {
            term$680.left = expandTermTreeToFinal$385(term$680.left, context$681);
            term$680.right = expandTermTreeToFinal$385(term$680.right, context$681);
            return term$680;
        } else if (term$680.hasPrototype(VariableDeclaration$365)) {
            if (term$680.init) {
                term$680.init = expandTermTreeToFinal$385(term$680.init, context$681);
            }
            return term$680;
        } else if (term$680.hasPrototype(VariableStatement$366)) {
            term$680.decls = _$212.map(term$680.decls, function (decl$683) {
                return expandTermTreeToFinal$385(decl$683, context$681);
            });
            return term$680;
        } else if (term$680.hasPrototype(Delimiter$353)) {
            // expand inside the delimiter and then continue on
            term$680.delim.token.inner = expand$386(term$680.delim.expose().token.inner, context$681);
            return term$680;
        } else if (term$680.hasPrototype(NamedFun$355) || term$680.hasPrototype(AnonFun$356) || term$680.hasPrototype(CatchClause$369) || term$680.hasPrototype(ArrowFun$357) || term$680.hasPrototype(Module$370)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$684 = [];
            var bodyContext$685 = makeExpanderContext$387(_$212.defaults({ defscope: newDef$684 }, context$681));
            var paramSingleIdent$686 = term$680.params && term$680.params.token.type === parser$213.Token.Identifier;
            if (term$680.params && term$680.params.token.type === parser$213.Token.Delimiter) {
                var params$693 = term$680.params.expose();
            } else if (paramSingleIdent$686) {
                var params$693 = term$680.params;
            } else {
                var params$693 = syn$214.makeDelim('()', [], null);
            }
            if (Array.isArray(term$680.body)) {
                var bodies$694 = syn$214.makeDelim('{}', term$680.body, null);
            } else {
                var bodies$694 = term$680.body;
            }
            bodies$694 = bodies$694.addDefCtx(newDef$684);
            var paramNames$687 = _$212.map(getParamIdentifiers$335(params$693), function (param$695) {
                    var freshName$696 = fresh$333();
                    return {
                        freshName: freshName$696,
                        originalParam: param$695,
                        renamedParam: param$695.rename(param$695, freshName$696)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$688 = _$212.reduce(paramNames$687, function (accBody$697, p$698) {
                    return accBody$697.rename(p$698.originalParam, p$698.freshName);
                }, bodies$694);
            renamedBody$688 = renamedBody$688.expose();
            var expandedResult$689 = expandToTermTree$383(renamedBody$688.token.inner, bodyContext$685);
            var bodyTerms$690 = expandedResult$689.terms;
            var renamedParams$691 = _$212.map(paramNames$687, function (p$699) {
                    return p$699.renamedParam;
                });
            if (paramSingleIdent$686) {
                var flatArgs$700 = renamedParams$691[0];
            } else {
                var flatArgs$700 = syn$214.makeDelim('()', joinSyntax$321(renamedParams$691, ','), term$680.params);
            }
            var expandedArgs$692 = expand$386([flatArgs$700], bodyContext$685);
            assert$220(expandedArgs$692.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$680.params) {
                term$680.params = expandedArgs$692[0];
            }
            bodyTerms$690 = _$212.map(bodyTerms$690, function (bodyTerm$701) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$702 = bodyTerm$701.addDefCtx(newDef$684);
                // finish expansion
                return expandTermTreeToFinal$385(termWithCtx$702, expandedResult$689.context);
            });
            if (term$680.hasPrototype(Module$370)) {
                bodyTerms$690 = _$212.filter(bodyTerms$690, function (bodyTerm$703) {
                    if (bodyTerm$703.hasPrototype(Export$372)) {
                        term$680.exports.push(bodyTerm$703);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$688.token.inner = bodyTerms$690;
            if (Array.isArray(term$680.body)) {
                term$680.body = renamedBody$688.token.inner;
            } else {
                term$680.body = renamedBody$688;
            }
            // and continue expand the rest
            return term$680;
        }
        // the term is fine as is
        return term$680;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$386(stx$704, context$705) {
        assert$220(context$705, 'must provide an expander context');
        var trees$706 = expandToTermTree$383(stx$704, context$705);
        return _$212.map(trees$706.terms, function (term$707) {
            return expandTermTreeToFinal$385(term$707, trees$706.context);
        });
    }
    function makeExpanderContext$387(o$708) {
        o$708 = o$708 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$708.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$708.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$708.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$708.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$388(stx$709, builtinSource$710, _maxExpands$711) {
        var env$712 = new Map();
        var params$713 = [];
        var context$714, builtInContext$715 = makeExpanderContext$387({ env: env$712 });
        maxExpands$324 = _maxExpands$711 || Infinity;
        expandCount$323 = 0;
        if (builtinSource$710) {
            var builtinRead$718 = parser$213.read(builtinSource$710);
            builtinRead$718 = [
                syn$214.makeIdent('module', null),
                syn$214.makeDelim('{}', builtinRead$718, null)
            ];
            builtinMode$322 = true;
            var builtinRes$719 = expand$386(builtinRead$718, builtInContext$715);
            builtinMode$322 = false;
            params$713 = _$212.map(builtinRes$719[0].exports, function (term$720) {
                return {
                    oldExport: term$720.name,
                    newParam: syn$214.makeIdent(term$720.name.token.value, null)
                };
            });
        }
        var modBody$716 = syn$214.makeDelim('{}', stx$709, null);
        modBody$716 = _$212.reduce(params$713, function (acc$721, param$722) {
            var newName$723 = fresh$333();
            env$712.set(resolve$327(param$722.newParam.rename(param$722.newParam, newName$723)), env$712.get(resolve$327(param$722.oldExport)));
            return acc$721.rename(param$722.newParam, newName$723);
        }, modBody$716);
        context$714 = makeExpanderContext$387({ env: env$712 });
        var res$717 = expand$386([
                syn$214.makeIdent('module', null),
                modBody$716
            ], context$714);
        res$717 = res$717[0].destruct();
        return flatten$389(res$717[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$389(stx$724) {
        return _$212.reduce(stx$724, function (acc$725, stx$726) {
            if (stx$726.token.type === parser$213.Token.Delimiter) {
                var exposed$727 = stx$726.expose();
                var openParen$728 = syntaxFromToken$320({
                        type: parser$213.Token.Punctuator,
                        value: stx$726.token.value[0],
                        range: stx$726.token.startRange,
                        sm_range: typeof stx$726.token.sm_startRange == 'undefined' ? stx$726.token.startRange : stx$726.token.sm_startRange,
                        lineNumber: stx$726.token.startLineNumber,
                        sm_lineNumber: typeof stx$726.token.sm_startLineNumber == 'undefined' ? stx$726.token.startLineNumber : stx$726.token.sm_startLineNumber,
                        lineStart: stx$726.token.startLineStart,
                        sm_lineStart: typeof stx$726.token.sm_startLineStart == 'undefined' ? stx$726.token.startLineStart : stx$726.token.sm_startLineStart
                    }, exposed$727);
                var closeParen$729 = syntaxFromToken$320({
                        type: parser$213.Token.Punctuator,
                        value: stx$726.token.value[1],
                        range: stx$726.token.endRange,
                        sm_range: typeof stx$726.token.sm_endRange == 'undefined' ? stx$726.token.endRange : stx$726.token.sm_endRange,
                        lineNumber: stx$726.token.endLineNumber,
                        sm_lineNumber: typeof stx$726.token.sm_endLineNumber == 'undefined' ? stx$726.token.endLineNumber : stx$726.token.sm_endLineNumber,
                        lineStart: stx$726.token.endLineStart,
                        sm_lineStart: typeof stx$726.token.sm_endLineStart == 'undefined' ? stx$726.token.endLineStart : stx$726.token.sm_endLineStart
                    }, exposed$727);
                if (stx$726.token.leadingComments) {
                    openParen$728.token.leadingComments = stx$726.token.leadingComments;
                }
                if (stx$726.token.trailingComments) {
                    openParen$728.token.trailingComments = stx$726.token.trailingComments;
                }
                return acc$725.concat(openParen$728).concat(flatten$389(exposed$727.token.inner)).concat(closeParen$729);
            }
            stx$726.token.sm_lineNumber = stx$726.token.sm_lineNumber ? stx$726.token.sm_lineNumber : stx$726.token.lineNumber;
            stx$726.token.sm_lineStart = stx$726.token.sm_lineStart ? stx$726.token.sm_lineStart : stx$726.token.lineStart;
            stx$726.token.sm_range = stx$726.token.sm_range ? stx$726.token.sm_range : stx$726.token.range;
            return acc$725.concat(stx$726);
        }, []);
    }
    exports$211.enforest = enforest$378;
    exports$211.expand = expandTopLevel$388;
    exports$211.resolve = resolve$327;
    exports$211.get_expression = get_expression$379;
    exports$211.makeExpanderContext = makeExpanderContext$387;
    exports$211.Expr = Expr$339;
    exports$211.VariableStatement = VariableStatement$366;
    exports$211.tokensToSyntax = syn$214.tokensToSyntax;
    exports$211.syntaxToTokens = syn$214.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map