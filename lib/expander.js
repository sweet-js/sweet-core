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
(function (root$210, factory$211) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$211(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$211);
    }
}(this, function (exports$212, _$213, parser$214, syn$215, es6$216, se$217, patternModule$218, gen$219) {
    'use strict';
    var codegen$220 = gen$219 || escodegen;
    var assert$221 = syn$215.assert;
    var throwSyntaxError$222 = syn$215.throwSyntaxError;
    var unwrapSyntax$223 = syn$215.unwrapSyntax;
    // used to export "private" methods for unit testing
    exports$212._test = {};
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
    var scopedEval$313 = se$217.scopedEval;
    var Rename$314 = syn$215.Rename;
    var Mark$315 = syn$215.Mark;
    var Def$316 = syn$215.Def;
    var syntaxFromToken$317 = syn$215.syntaxFromToken;
    var joinSyntax$318 = syn$215.joinSyntax;
    var builtinMode$319 = false;
    var expandCount$320 = 0;
    var maxExpands$321;
    function remdup$322(mark$393, mlist$394) {
        if (mark$393 === _$213.first(mlist$394)) {
            return _$213.rest(mlist$394, 1);
        }
        return [mark$393].concat(mlist$394);
    }
    // (CSyntax) -> [...Num]
    function marksof$323(ctx$395, stopName$396, originalName$397) {
        var mark$398, submarks$399;
        if (ctx$395 instanceof Mark$315) {
            mark$398 = ctx$395.mark;
            submarks$399 = marksof$323(ctx$395.context, stopName$396, originalName$397);
            return remdup$322(mark$398, submarks$399);
        }
        if (ctx$395 instanceof Def$316) {
            return marksof$323(ctx$395.context, stopName$396, originalName$397);
        }
        if (ctx$395 instanceof Rename$314) {
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
                acc$407 = new Rename$314(defctx$404[i$408].id, defctx$404[i$408].name, acc$407, defctx$404);
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
        if (ctx$413 instanceof Mark$315) {
            return resolveCtx$328(originalName$412, ctx$413.context, stop_spine$414, stop_branch$415);
        }
        if (ctx$413 instanceof Def$316) {
            if (stop_spine$414.indexOf(ctx$413.defctx) !== -1) {
                return resolveCtx$328(originalName$412, ctx$413.context, stop_spine$414, stop_branch$415);
            } else {
                return resolveCtx$328(originalName$412, renames$326(ctx$413.defctx, ctx$413.context, originalName$412), stop_spine$414, unionEl$327(stop_branch$415, ctx$413.defctx));
            }
        }
        if (ctx$413 instanceof Rename$314) {
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
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$331(towrap$420, delimSyntax$421) {
        assert$221(delimSyntax$421.token.type === parser$214.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$317({
            type: parser$214.Token.Delimiter,
            value: delimSyntax$421.token.value,
            inner: towrap$420,
            range: delimSyntax$421.token.range,
            startLineNumber: delimSyntax$421.token.startLineNumber,
            lineStart: delimSyntax$421.token.lineStart
        }, delimSyntax$421);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$332(argSyntax$422) {
        if (argSyntax$422.token.type === parser$214.Token.Delimiter) {
            return _$213.filter(argSyntax$422.token.inner, function (stx$423) {
                return stx$423.token.value !== ',';
            });
        } else if (argSyntax$422.token.type === parser$214.Token.Identifier) {
            return [argSyntax$422];
        } else {
            assert$221(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$333 = {
            destruct: function () {
                return _$213.reduce(this.properties, _$213.bind(function (acc$424, prop$425) {
                    if (this[prop$425] && this[prop$425].hasPrototype(TermTree$333)) {
                        return acc$424.concat(this[prop$425].destruct());
                    } else if (this[prop$425] && this[prop$425].token && this[prop$425].token.inner) {
                        this[prop$425].token.inner = _$213.reduce(this[prop$425].token.inner, function (acc$426, t$427) {
                            if (t$427.hasPrototype(TermTree$333)) {
                                return acc$426.concat(t$427.destruct());
                            }
                            return acc$426.concat(t$427);
                        }, []);
                        return acc$424.concat(this[prop$425]);
                    } else if (Array.isArray(this[prop$425])) {
                        return acc$424.concat(_$213.reduce(this[prop$425], function (acc$428, t$429) {
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
                _$213.each(_$213.range(this.properties.length), _$213.bind(function (i$431) {
                    var prop$432 = this.properties[i$431];
                    if (Array.isArray(this[prop$432])) {
                        this[prop$432] = _$213.map(this[prop$432], function (item$433) {
                            return item$433.addDefCtx(def$430);
                        });
                    } else if (this[prop$432]) {
                        this[prop$432] = this[prop$432].addDefCtx(def$430);
                    }
                }, this));
                return this;
            },
            rename: function (id$434, name$435) {
                _$213.each(_$213.range(this.properties.length), _$213.bind(function (i$436) {
                    var prop$437 = this.properties[i$436];
                    if (Array.isArray(this[prop$437])) {
                        this[prop$437] = _$213.map(this[prop$437], function (item$438) {
                            return item$438.rename(id$434, name$435);
                        });
                    } else if (this[prop$437]) {
                        this[prop$437] = this[prop$437].rename(id$434, name$435);
                    }
                }, this));
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
    exports$212._test.PropertyAssignment = PropertyAssignment$340;
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
                assert$221(this.fun.hasPrototype(TermTree$333), 'expecting a term tree in destruct of call');
                var that$482 = this;
                this.delim = syntaxFromToken$317(_$213.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$213.reduce(this.args, function (acc$483, term$484) {
                    assert$221(term$484 && term$484.hasPrototype(TermTree$333), 'expecting term trees in destruct of Call');
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
                assert$221(Array.isArray(args$487), 'requires an array of arguments terms');
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
                return this.varkw.destruct().concat(_$213.reduce(this.decls, function (acc$499, decl$500) {
                    return acc$499.concat(decl$500.destruct());
                }, []));
            },
            construct: function (varkw$501, decls$502) {
                assert$221(Array.isArray(decls$502), 'decls must be an array');
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
                return this.letkw.destruct().concat(_$213.reduce(this.decls, function (acc$503, decl$504) {
                    return acc$503.concat(decl$504.destruct());
                }, []));
            },
            construct: function (letkw$505, decls$506) {
                assert$221(Array.isArray(decls$506), 'decls must be an array');
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
                return this.constkw.destruct().concat(_$213.reduce(this.decls, function (acc$507, decl$508) {
                    return acc$507.concat(decl$508.destruct());
                }, []));
            },
            construct: function (constkw$509, decls$510) {
                assert$221(Array.isArray(decls$510), 'decls must be an array');
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
        return _$213.contains(staticOperators$519, unwrapSyntax$223(stx$518));
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
        return _$213.contains(staticOperators$521, unwrapSyntax$223(stx$520));
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
                    throwSyntaxError$222('enforest', 'Expecting an identifier in variable declaration', rest$528);
                }
            }
        }    // x EOF
        else {
            if (result$527.hasPrototype(Id$351)) {
                decls$525.push(VariableDeclaration$362.create(result$527.id));
            } else if (result$527.hasPrototype(BinOp$346) && result$527.op.token.value === 'in') {
                decls$525.push(VariableDeclaration$362.create(result$527.left.id, result$527.op, result$527.right));
            } else {
                throwSyntaxError$222('enforest', 'Expecting an identifier in variable declaration', stx$522);
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
        return _$213.map(stx$535, function (stx$538) {
            if (stx$538.token.type === parser$214.Token.Delimiter) {
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
            stx$538.token.sm_range = typeof stx$538.token.sm_range == 'undefined' ? _$213.clone(stx$538.token.range) : stx$538.token.sm_range;
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
        assert$221(toks$539.length > 0, 'enforest assumes there are tokens to work with');
        function step$541(head$542, rest$543) {
            var innerTokens$544;
            assert$221(Array.isArray(rest$543), 'result must at least be an empty array');
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
                if (head$542.hasPrototype(Expr$336) && rest$543[0] && rest$543[0].token.type === parser$214.Token.Delimiter && rest$543[0].token.value === '()') {
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
                    var argsAreExprs$596 = _$213.all(enforestedArgs$594, function (argTerm$597) {
                            return argTerm$597.hasPrototype(Expr$336);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$544.length === 0 && argsAreExprs$596) {
                        return step$541(Call$359.create(head$542, enforestedArgs$594, rest$543[0], commas$595), rest$543.slice(1));
                    }
                } else if (head$542.hasPrototype(Expr$336) && rest$543[0] && unwrapSyntax$223(rest$543[0]) === '?') {
                    var question$598 = rest$543[0];
                    var condRes$599 = enforest$375(rest$543.slice(1), context$540);
                    var truExpr$600 = condRes$599.result;
                    var condRight$601 = condRes$599.rest;
                    if (truExpr$600.hasPrototype(Expr$336) && condRight$601[0] && unwrapSyntax$223(condRight$601[0]) === ':') {
                        var colon$602 = condRight$601[0];
                        var flsRes$603 = enforest$375(condRight$601.slice(1), context$540);
                        var flsExpr$604 = flsRes$603.result;
                        if (flsExpr$604.hasPrototype(Expr$336)) {
                            return step$541(ConditionalExpression$347.create(head$542, question$598, truExpr$600, colon$602, flsExpr$604), flsRes$603.rest);
                        }
                    }
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$223(keyword$550) === 'new' && rest$543[0]) {
                    var newCallRes$605 = enforest$375(rest$543, context$540);
                    if (newCallRes$605.result.hasPrototype(Call$359)) {
                        return step$541(Const$358.create(head$542, newCallRes$605.result), newCallRes$605.rest);
                    }
                } else if (head$542.hasPrototype(Delimiter$350) && delim$552.token.value === '()' && rest$543[0] && rest$543[0].token.type === parser$214.Token.Punctuator && unwrapSyntax$223(rest$543[0]) === '=>') {
                    var arrowRes$606 = enforest$375(rest$543.slice(1), context$540);
                    if (arrowRes$606.result.hasPrototype(Expr$336)) {
                        return step$541(ArrowFun$354.create(delim$552, rest$543[0], arrowRes$606.result.destruct()), arrowRes$606.rest);
                    } else {
                        throwSyntaxError$222('enforest', 'Body of arrow function must be an expression', rest$543.slice(1));
                    }
                } else if (head$542.hasPrototype(Id$351) && rest$543[0] && rest$543[0].token.type === parser$214.Token.Punctuator && unwrapSyntax$223(rest$543[0]) === '=>') {
                    var res$607 = enforest$375(rest$543.slice(1), context$540);
                    if (res$607.result.hasPrototype(Expr$336)) {
                        return step$541(ArrowFun$354.create(id$554, rest$543[0], res$607.result.destruct()), res$607.rest);
                    } else {
                        throwSyntaxError$222('enforest', 'Body of arrow function must be an expression', rest$543.slice(1));
                    }
                } else if (head$542.hasPrototype(Delimiter$350) && delim$552.token.value === '()') {
                    innerTokens$544 = delim$552.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$544.length === 0) {
                        return step$541(ParenExpression$343.create(head$542), rest$543);
                    } else {
                        var innerTerm$608 = get_expression$376(innerTokens$544, context$540);
                        if (innerTerm$608.result && innerTerm$608.result.hasPrototype(Expr$336)) {
                            return step$541(ParenExpression$343.create(head$542), rest$543);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$542.hasPrototype(Expr$336) && rest$543[0] && rest$543[1] && stxIsBinOp$372(rest$543[0])) {
                    var op$609 = rest$543[0];
                    var left$610 = head$542;
                    var bopRes$611 = enforest$375(rest$543.slice(1), context$540);
                    var right$612 = bopRes$611.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$612.hasPrototype(Expr$336)) {
                        return step$541(BinOp$346.create(op$609, left$610, right$612), bopRes$611.rest);
                    }
                } else if (head$542.hasPrototype(Punc$349) && stxIsUnaryOp$371(punc$558)) {
                    var unopRes$613 = enforest$375(rest$543, context$540);
                    if (unopRes$613.result.hasPrototype(Expr$336)) {
                        return step$541(UnaryOp$344.create(punc$558, unopRes$613.result), unopRes$613.rest);
                    }
                } else if (head$542.hasPrototype(Keyword$348) && stxIsUnaryOp$371(keyword$550)) {
                    var unopKeyres$614 = enforest$375(rest$543, context$540);
                    if (unopKeyres$614.result.hasPrototype(Expr$336)) {
                        return step$541(UnaryOp$344.create(keyword$550, unopKeyres$614.result), unopKeyres$614.rest);
                    }
                } else if (head$542.hasPrototype(Expr$336) && rest$543[0] && (unwrapSyntax$223(rest$543[0]) === '++' || unwrapSyntax$223(rest$543[0]) === '--')) {
                    return step$541(PostfixOp$345.create(head$542, rest$543[0]), rest$543.slice(1));
                } else if (head$542.hasPrototype(Expr$336) && rest$543[0] && rest$543[0].token.value === '[]') {
                    return step$541(ObjGet$361.create(head$542, Delimiter$350.create(rest$543[0].expose())), rest$543.slice(1));
                } else if (head$542.hasPrototype(Expr$336) && rest$543[0] && unwrapSyntax$223(rest$543[0]) === '.' && rest$543[1] && rest$543[1].token.type === parser$214.Token.Identifier) {
                    return step$541(ObjDotGet$360.create(head$542, rest$543[0], rest$543[1]), rest$543.slice(2));
                } else if (head$542.hasPrototype(Delimiter$350) && delim$552.token.value === '[]') {
                    return step$541(ArrayLiteral$342.create(head$542), rest$543);
                } else if (head$542.hasPrototype(Delimiter$350) && head$542.delim.token.value === '{}') {
                    return step$541(Block$341.create(head$542), rest$543);
                } else if (head$542.hasPrototype(Id$351) && unwrapSyntax$223(id$554) === '#quoteSyntax' && rest$543[0] && rest$543[0].token.value === '{}') {
                    var tempId$615 = fresh$330();
                    context$540.templateMap.set(tempId$615, rest$543[0].token.inner);
                    return step$541(syn$215.makeIdent('getTemplate', id$554), [syn$215.makeDelim('()', [syn$215.makeValue(tempId$615, id$554)], id$554)].concat(rest$543.slice(1)));
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$223(keyword$550) === 'let' && (rest$543[0] && rest$543[0].token.type === parser$214.Token.Identifier || rest$543[0] && rest$543[0].token.type === parser$214.Token.Keyword || rest$543[0] && rest$543[0].token.type === parser$214.Token.Punctuator) && rest$543[1] && unwrapSyntax$223(rest$543[1]) === '=' && rest$543[2] && rest$543[2].token.value === 'macro') {
                    var mac$616 = enforest$375(rest$543.slice(2), context$540);
                    if (!mac$616.result.hasPrototype(AnonMacro$357)) {
                        throwSyntaxError$222('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$543.slice(2));
                    }
                    return step$541(LetMacro$355.create(rest$543[0], mac$616.result.body), mac$616.rest);
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$223(keyword$550) === 'var' && rest$543[0]) {
                    var vsRes$617 = enforestVarStatement$373(rest$543, context$540, false);
                    if (vsRes$617) {
                        return step$541(VariableStatement$363.create(head$542, vsRes$617.result), vsRes$617.rest);
                    }
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$223(keyword$550) === 'let' && rest$543[0]) {
                    var lsRes$618 = enforestVarStatement$373(rest$543, context$540, true);
                    if (lsRes$618) {
                        return step$541(LetStatement$364.create(head$542, lsRes$618.result), lsRes$618.rest);
                    }
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$223(keyword$550) === 'const' && rest$543[0]) {
                    var csRes$619 = enforestVarStatement$373(rest$543, context$540, true);
                    if (csRes$619) {
                        return step$541(ConstStatement$365.create(head$542, csRes$619.result), csRes$619.rest);
                    }
                } else if (head$542.hasPrototype(Keyword$348) && unwrapSyntax$223(keyword$550) === 'for' && rest$543[0] && rest$543[0].token.value === '()') {
                    return step$541(ForStatement$370.create(keyword$550, rest$543[0]), rest$543.slice(1));
                }
            } else {
                assert$221(head$542 && head$542.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$542.token.type === parser$214.Token.Identifier || head$542.token.type === parser$214.Token.Keyword || head$542.token.type === parser$214.Token.Punctuator) && context$540.env.has(resolve$324(head$542))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$620 = fresh$330();
                    var transformerContext$621 = makeExpanderContext$384(_$213.defaults({ mark: newMark$620 }, context$540));
                    // pull the macro transformer out the environment
                    var macroObj$622 = context$540.env.get(resolve$324(head$542));
                    var transformer$623 = macroObj$622.fn;
                    if (expandCount$320 >= maxExpands$321) {
                        return {
                            result: head$542,
                            rest: rest$543
                        };
                    } else if (!builtinMode$319 && !macroObj$622.builtin) {
                        expandCount$320++;
                    }
                    // apply the transformer
                    var rt$624;
                    try {
                        rt$624 = transformer$623([head$542].concat(rest$543), transformerContext$621);
                    } catch (e$625) {
                        if (e$625.type && e$625.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$626 = '`' + rest$543.slice(0, 5).map(function (stx$627) {
                                    return stx$627.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$222('macro', 'Macro `' + head$542.token.value + '` could not be matched with ' + argumentString$626, head$542);
                        } else {
                            // just rethrow it
                            throw e$625;
                        }
                    }
                    if (!Array.isArray(rt$624.result)) {
                        throwSyntaxError$222('enforest', 'Macro must return a syntax array', head$542);
                    }
                    if (rt$624.result.length > 0) {
                        var adjustedResult$628 = adjustLineContext$374(rt$624.result, head$542);
                        adjustedResult$628[0].token.leadingComments = head$542.token.leadingComments;
                        return step$541(adjustedResult$628[0], adjustedResult$628.slice(1).concat(rt$624.rest));
                    } else {
                        return step$541(Empty$368.create(), rt$624.rest);
                    }
                }    // anon macro definition
                else if (head$542.token.type === parser$214.Token.Identifier && head$542.token.value === 'macro' && rest$543[0] && rest$543[0].token.value === '{}') {
                    return step$541(AnonMacro$357.create(rest$543[0].expose().token.inner), rest$543.slice(1));
                }    // macro definition
                else if (head$542.token.type === parser$214.Token.Identifier && head$542.token.value === 'macro' && rest$543[0] && (rest$543[0].token.type === parser$214.Token.Identifier || rest$543[0].token.type === parser$214.Token.Keyword || rest$543[0].token.type === parser$214.Token.Punctuator) && rest$543[1] && rest$543[1].token.type === parser$214.Token.Delimiter && rest$543[1].token.value === '{}') {
                    return step$541(Macro$356.create(rest$543[0], rest$543[1].expose().token.inner), rest$543.slice(2));
                }    // module definition
                else if (unwrapSyntax$223(head$542) === 'module' && rest$543[0] && rest$543[0].token.value === '{}') {
                    return step$541(Module$367.create(rest$543[0]), rest$543.slice(1));
                }    // function definition
                else if (head$542.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$542) === 'function' && rest$543[0] && rest$543[0].token.type === parser$214.Token.Identifier && rest$543[1] && rest$543[1].token.type === parser$214.Token.Delimiter && rest$543[1].token.value === '()' && rest$543[2] && rest$543[2].token.type === parser$214.Token.Delimiter && rest$543[2].token.value === '{}') {
                    rest$543[1].token.inner = rest$543[1].expose().token.inner;
                    rest$543[2].token.inner = rest$543[2].expose().token.inner;
                    return step$541(NamedFun$352.create(head$542, null, rest$543[0], rest$543[1], rest$543[2]), rest$543.slice(3));
                }    // generator function definition
                else if (head$542.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$542) === 'function' && rest$543[0] && rest$543[0].token.type === parser$214.Token.Punctuator && rest$543[0].token.value === '*' && rest$543[1] && rest$543[1].token.type === parser$214.Token.Identifier && rest$543[2] && rest$543[2].token.type === parser$214.Token.Delimiter && rest$543[2].token.value === '()' && rest$543[3] && rest$543[3].token.type === parser$214.Token.Delimiter && rest$543[3].token.value === '{}') {
                    rest$543[2].token.inner = rest$543[2].expose().token.inner;
                    rest$543[3].token.inner = rest$543[3].expose().token.inner;
                    return step$541(NamedFun$352.create(head$542, rest$543[0], rest$543[1], rest$543[2], rest$543[3]), rest$543.slice(4));
                }    // anonymous function definition
                else if (head$542.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$542) === 'function' && rest$543[0] && rest$543[0].token.type === parser$214.Token.Delimiter && rest$543[0].token.value === '()' && rest$543[1] && rest$543[1].token.type === parser$214.Token.Delimiter && rest$543[1].token.value === '{}') {
                    rest$543[0].token.inner = rest$543[0].expose().token.inner;
                    rest$543[1].token.inner = rest$543[1].expose().token.inner;
                    return step$541(AnonFun$353.create(head$542, null, rest$543[0], rest$543[1]), rest$543.slice(2));
                }    // anonymous generator function definition
                else if (head$542.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$542) === 'function' && rest$543[0] && rest$543[0].token.type === parser$214.Token.Punctuator && rest$543[0].token.value === '*' && rest$543[1] && rest$543[1].token.type === parser$214.Token.Delimiter && rest$543[1].token.value === '()' && rest$543[2] && rest$543[2].token.type === parser$214.Token.Delimiter && rest$543[2].token.value === '{}') {
                    rest$543[1].token.inner = rest$543[1].expose().token.inner;
                    rest$543[2].token.inner = rest$543[2].expose().token.inner;
                    return step$541(AnonFun$353.create(head$542, rest$543[0], rest$543[1], rest$543[2]), rest$543.slice(3));
                }    // arrow function
                else if ((head$542.token.type === parser$214.Token.Delimiter && head$542.token.value === '()' || head$542.token.type === parser$214.Token.Identifier) && rest$543[0] && rest$543[0].token.type === parser$214.Token.Punctuator && rest$543[0].token.value === '=>' && rest$543[1] && rest$543[1].token.type === parser$214.Token.Delimiter && rest$543[1].token.value === '{}') {
                    return step$541(ArrowFun$354.create(head$542, rest$543[0], rest$543[1]), rest$543.slice(2));
                }    // catch statement
                else if (head$542.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$542) === 'catch' && rest$543[0] && rest$543[0].token.type === parser$214.Token.Delimiter && rest$543[0].token.value === '()' && rest$543[1] && rest$543[1].token.type === parser$214.Token.Delimiter && rest$543[1].token.value === '{}') {
                    rest$543[0].token.inner = rest$543[0].expose().token.inner;
                    rest$543[1].token.inner = rest$543[1].expose().token.inner;
                    return step$541(CatchClause$366.create(head$542, rest$543[0], rest$543[1]), rest$543.slice(2));
                }    // this expression
                else if (head$542.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$542) === 'this') {
                    return step$541(ThisExpression$338.create(head$542), rest$543);
                }    // literal
                else if (head$542.token.type === parser$214.Token.NumericLiteral || head$542.token.type === parser$214.Token.StringLiteral || head$542.token.type === parser$214.Token.BooleanLiteral || head$542.token.type === parser$214.Token.RegularExpression || head$542.token.type === parser$214.Token.NullLiteral) {
                    return step$541(Lit$339.create(head$542), rest$543);
                }    // export
                else if (head$542.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$542) === 'export' && rest$543[0] && (rest$543[0].token.type === parser$214.Token.Identifier || rest$543[0].token.type === parser$214.Token.Keyword || rest$543[0].token.type === parser$214.Token.Punctuator)) {
                    return step$541(Export$369.create(rest$543[0]), rest$543.slice(1));
                }    // identifier
                else if (head$542.token.type === parser$214.Token.Identifier) {
                    return step$541(Id$351.create(head$542), rest$543);
                }    // punctuator
                else if (head$542.token.type === parser$214.Token.Punctuator) {
                    return step$541(Punc$349.create(head$542), rest$543);
                } else if (head$542.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$542) === 'with') {
                    throwSyntaxError$222('enforest', 'with is not supported in sweet.js', head$542);
                }    // keyword
                else if (head$542.token.type === parser$214.Token.Keyword) {
                    return step$541(Keyword$348.create(head$542), rest$543);
                }    // Delimiter
                else if (head$542.token.type === parser$214.Token.Delimiter) {
                    return step$541(Delimiter$350.create(head$542.expose()), rest$543);
                }    // end of file
                else if (head$542.token.type === parser$214.Token.EOF) {
                    assert$221(rest$543.length === 0, 'nothing should be after an EOF');
                    return step$541(EOF$334.create(head$542), []);
                } else {
                    // todo: are we missing cases?
                    assert$221(false, 'not implemented');
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
    function get_expression$376(stx$629, context$630) {
        var res$631 = enforest$375(stx$629, context$630);
        if (!res$631.result.hasPrototype(Expr$336)) {
            return {
                result: null,
                rest: stx$629
            };
        }
        return res$631;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$377(newMark$632, env$633) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$634(match$635) {
            if (match$635.level === 0) {
                // replace the match property with the marked syntax
                match$635.match = _$213.map(match$635.match, function (stx$636) {
                    return stx$636.mark(newMark$632);
                });
            } else {
                _$213.each(match$635.match, function (match$637) {
                    dfs$634(match$637);
                });
            }
        }
        _$213.keys(env$633).forEach(function (key$638) {
            dfs$634(env$633[key$638]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$378(mac$639, context$640) {
        var body$641 = mac$639.body;
        // raw function primitive form
        if (!(body$641[0] && body$641[0].token.type === parser$214.Token.Keyword && body$641[0].token.value === 'function')) {
            throwSyntaxError$222('load macro', 'Primitive macro form must contain a function for the macro body', body$641);
        }
        var stub$642 = parser$214.read('()');
        stub$642[0].token.inner = body$641;
        var expanded$643 = expand$383(stub$642, context$640);
        expanded$643 = expanded$643[0].destruct().concat(expanded$643[1].eof);
        var flattend$644 = flatten$386(expanded$643);
        var bodyCode$645 = codegen$220.generate(parser$214.parse(flattend$644));
        var macroFn$646 = scopedEval$313(bodyCode$645, {
                makeValue: syn$215.makeValue,
                makeRegex: syn$215.makeRegex,
                makeIdent: syn$215.makeIdent,
                makeKeyword: syn$215.makeKeyword,
                makePunc: syn$215.makePunc,
                makeDelim: syn$215.makeDelim,
                unwrapSyntax: syn$215.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$222,
                prettyPrint: syn$215.prettyPrint,
                parser: parser$214,
                __fresh: fresh$330,
                _: _$213,
                patternModule: patternModule$218,
                getTemplate: function (id$647) {
                    return cloneSyntaxArray$379(context$640.templateMap.get(id$647));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$377,
                mergeMatches: function (newMatch$648, oldMatch$649) {
                    newMatch$648.patternEnv = _$213.extend({}, oldMatch$649.patternEnv, newMatch$648.patternEnv);
                    return newMatch$648;
                }
            });
        return macroFn$646;
    }
    function cloneSyntaxArray$379(arr$650) {
        return arr$650.map(function (stx$651) {
            var o$652 = syntaxFromToken$317(_$213.clone(stx$651.token), stx$651);
            if (o$652.token.type === parser$214.Token.Delimiter) {
                o$652.token.inner = cloneSyntaxArray$379(o$652.token.inner);
            }
            return o$652;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$380(stx$653, context$654) {
        assert$221(context$654, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$653.length === 0) {
            return {
                terms: [],
                context: context$654
            };
        }
        assert$221(stx$653[0].token, 'expecting a syntax object');
        var f$655 = enforest$375(stx$653, context$654);
        // head :: TermTree
        var head$656 = f$655.result;
        // rest :: [Syntax]
        var rest$657 = f$655.rest;
        var macroDefinition$658;
        if (head$656.hasPrototype(Macro$356) && expandCount$320 < maxExpands$321) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$658 = loadMacroDef$378(head$656, context$654);
            addToDefinitionCtx$381([head$656.name], context$654.defscope, false);
            context$654.env.set(resolve$324(head$656.name), {
                fn: macroDefinition$658,
                builtin: builtinMode$319
            });
            return expandToTermTree$380(rest$657, context$654);
        }
        if (head$656.hasPrototype(LetMacro$355) && expandCount$320 < maxExpands$321) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$658 = loadMacroDef$378(head$656, context$654);
            var freshName$660 = fresh$330();
            var renamedName$661 = head$656.name.rename(head$656.name, freshName$660);
            rest$657 = _$213.map(rest$657, function (stx$662) {
                return stx$662.rename(head$656.name, freshName$660);
            });
            head$656.name = renamedName$661;
            context$654.env.set(resolve$324(head$656.name), {
                fn: macroDefinition$658,
                builtin: builtinMode$319
            });
            return expandToTermTree$380(rest$657, context$654);
        }
        if (head$656.hasPrototype(NamedFun$352)) {
            addToDefinitionCtx$381([head$656.name], context$654.defscope, true);
        }
        if (head$656.hasPrototype(VariableStatement$363)) {
            addToDefinitionCtx$381(_$213.map(head$656.decls, function (decl$663) {
                return decl$663.ident;
            }), context$654.defscope, true);
        }
        if (head$656.hasPrototype(Block$341) && head$656.body.hasPrototype(Delimiter$350)) {
            head$656.body.delim.token.inner.forEach(function (term$664) {
                if (term$664.hasPrototype(VariableStatement$363)) {
                    addToDefinitionCtx$381(_$213.map(term$664.decls, function (decl$665) {
                        return decl$665.ident;
                    }), context$654.defscope, true);
                }
            });
        }
        if (head$656.hasPrototype(Delimiter$350)) {
            head$656.delim.token.inner.forEach(function (term$666) {
                if (term$666.hasPrototype(VariableStatement$363)) {
                    addToDefinitionCtx$381(_$213.map(term$666.decls, function (decl$667) {
                        return decl$667.ident;
                    }), context$654.defscope, true);
                }
            });
        }
        if (head$656.hasPrototype(ForStatement$370)) {
            head$656.cond.expose();
            var forCond$668 = head$656.cond.token.inner;
            if (forCond$668[0] && resolve$324(forCond$668[0]) === 'let' && forCond$668[1] && forCond$668[1].token.type === parser$214.Token.Identifier) {
                var letNew$669 = fresh$330();
                var letId$670 = forCond$668[1];
                forCond$668 = forCond$668.map(function (stx$671) {
                    return stx$671.rename(letId$670, letNew$669);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$656.cond.token.inner = expand$383([forCond$668[0]], context$654).concat(expand$383(forCond$668.slice(1), context$654));
                // nice and easy case: `for (...) { ... }`
                if (rest$657[0] && rest$657[0].token.value === '{}') {
                    rest$657[0] = rest$657[0].rename(letId$670, letNew$669);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$672 = enforest$375(rest$657, context$654);
                    var renamedBodyTerm$673 = bodyEnf$672.result.rename(letId$670, letNew$669);
                    var forTrees$674 = expandToTermTree$380(bodyEnf$672.rest, context$654);
                    return {
                        terms: [
                            head$656,
                            renamedBodyTerm$673
                        ].concat(forTrees$674.terms),
                        context: forTrees$674.context
                    };
                }
            } else {
                head$656.cond.token.inner = expand$383(head$656.cond.token.inner, context$654);
            }
        }
        var trees$659 = expandToTermTree$380(rest$657, context$654);
        return {
            terms: [head$656].concat(trees$659.terms),
            context: trees$659.context
        };
    }
    function addToDefinitionCtx$381(idents$675, defscope$676, skipRep$677) {
        assert$221(idents$675 && idents$675.length > 0, 'expecting some variable identifiers');
        skipRep$677 = skipRep$677 || false;
        _$213.each(idents$675, function (id$678) {
            var skip$679 = false;
            if (skipRep$677) {
                var declRepeat$680 = _$213.find(defscope$676, function (def$681) {
                        return def$681.id.token.value === id$678.token.value && arraysEqual$325(marksof$323(def$681.id.context), marksof$323(id$678.context));
                    });
                skip$679 = typeof declRepeat$680 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$679) {
                var name$682 = fresh$330();
                defscope$676.push({
                    id: id$678,
                    name: name$682
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$382(term$683, context$684) {
        assert$221(context$684 && context$684.env, 'environment map is required');
        if (term$683.hasPrototype(ArrayLiteral$342)) {
            term$683.array.delim.token.inner = expand$383(term$683.array.delim.expose().token.inner, context$684);
            return term$683;
        } else if (term$683.hasPrototype(Block$341)) {
            term$683.body.delim.token.inner = expand$383(term$683.body.delim.expose().token.inner, context$684);
            return term$683;
        } else if (term$683.hasPrototype(ParenExpression$343)) {
            term$683.expr.delim.token.inner = expand$383(term$683.expr.delim.expose().token.inner, context$684);
            return term$683;
        } else if (term$683.hasPrototype(Call$359)) {
            term$683.fun = expandTermTreeToFinal$382(term$683.fun, context$684);
            term$683.args = _$213.map(term$683.args, function (arg$685) {
                return expandTermTreeToFinal$382(arg$685, context$684);
            });
            return term$683;
        } else if (term$683.hasPrototype(UnaryOp$344)) {
            term$683.expr = expandTermTreeToFinal$382(term$683.expr, context$684);
            return term$683;
        } else if (term$683.hasPrototype(BinOp$346)) {
            term$683.left = expandTermTreeToFinal$382(term$683.left, context$684);
            term$683.right = expandTermTreeToFinal$382(term$683.right, context$684);
            return term$683;
        } else if (term$683.hasPrototype(ObjGet$361)) {
            term$683.right.delim.token.inner = expand$383(term$683.right.delim.expose().token.inner, context$684);
            return term$683;
        } else if (term$683.hasPrototype(ObjDotGet$360)) {
            term$683.left = expandTermTreeToFinal$382(term$683.left, context$684);
            term$683.right = expandTermTreeToFinal$382(term$683.right, context$684);
            return term$683;
        } else if (term$683.hasPrototype(VariableDeclaration$362)) {
            if (term$683.init) {
                term$683.init = expandTermTreeToFinal$382(term$683.init, context$684);
            }
            return term$683;
        } else if (term$683.hasPrototype(VariableStatement$363)) {
            term$683.decls = _$213.map(term$683.decls, function (decl$686) {
                return expandTermTreeToFinal$382(decl$686, context$684);
            });
            return term$683;
        } else if (term$683.hasPrototype(Delimiter$350)) {
            // expand inside the delimiter and then continue on
            term$683.delim.token.inner = expand$383(term$683.delim.expose().token.inner, context$684);
            return term$683;
        } else if (term$683.hasPrototype(NamedFun$352) || term$683.hasPrototype(AnonFun$353) || term$683.hasPrototype(CatchClause$366) || term$683.hasPrototype(ArrowFun$354) || term$683.hasPrototype(Module$367)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$687 = [];
            var bodyContext$688 = makeExpanderContext$384(_$213.defaults({ defscope: newDef$687 }, context$684));
            var paramSingleIdent$689 = term$683.params && term$683.params.token.type === parser$214.Token.Identifier;
            var params$690;
            if (term$683.params && term$683.params.token.type === parser$214.Token.Delimiter) {
                params$690 = term$683.params.expose();
            } else if (paramSingleIdent$689) {
                params$690 = term$683.params;
            } else {
                params$690 = syn$215.makeDelim('()', [], null);
            }
            var bodies$691;
            if (Array.isArray(term$683.body)) {
                bodies$691 = syn$215.makeDelim('{}', term$683.body, null);
            } else {
                bodies$691 = term$683.body;
            }
            bodies$691 = bodies$691.addDefCtx(newDef$687);
            var paramNames$692 = _$213.map(getParamIdentifiers$332(params$690), function (param$699) {
                    var freshName$700 = fresh$330();
                    return {
                        freshName: freshName$700,
                        originalParam: param$699,
                        renamedParam: param$699.rename(param$699, freshName$700)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$693 = _$213.reduce(paramNames$692, function (accBody$701, p$702) {
                    return accBody$701.rename(p$702.originalParam, p$702.freshName);
                }, bodies$691);
            renamedBody$693 = renamedBody$693.expose();
            var expandedResult$694 = expandToTermTree$380(renamedBody$693.token.inner, bodyContext$688);
            var bodyTerms$695 = expandedResult$694.terms;
            var renamedParams$696 = _$213.map(paramNames$692, function (p$703) {
                    return p$703.renamedParam;
                });
            var flatArgs$697;
            if (paramSingleIdent$689) {
                flatArgs$697 = renamedParams$696[0];
            } else {
                flatArgs$697 = syn$215.makeDelim('()', joinSyntax$318(renamedParams$696, ','), term$683.params);
            }
            var expandedArgs$698 = expand$383([flatArgs$697], bodyContext$688);
            assert$221(expandedArgs$698.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$683.params) {
                term$683.params = expandedArgs$698[0];
            }
            bodyTerms$695 = _$213.map(bodyTerms$695, function (bodyTerm$704) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$705 = bodyTerm$704.addDefCtx(newDef$687);
                // finish expansion
                return expandTermTreeToFinal$382(termWithCtx$705, expandedResult$694.context);
            });
            if (term$683.hasPrototype(Module$367)) {
                bodyTerms$695 = _$213.filter(bodyTerms$695, function (bodyTerm$706) {
                    if (bodyTerm$706.hasPrototype(Export$369)) {
                        term$683.exports.push(bodyTerm$706);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$693.token.inner = bodyTerms$695;
            if (Array.isArray(term$683.body)) {
                term$683.body = renamedBody$693.token.inner;
            } else {
                term$683.body = renamedBody$693;
            }
            // and continue expand the rest
            return term$683;
        }
        // the term is fine as is
        return term$683;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$383(stx$707, context$708) {
        assert$221(context$708, 'must provide an expander context');
        var trees$709 = expandToTermTree$380(stx$707, context$708);
        return _$213.map(trees$709.terms, function (term$710) {
            return expandTermTreeToFinal$382(term$710, trees$709.context);
        });
    }
    function makeExpanderContext$384(o$711) {
        o$711 = o$711 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$711.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$711.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$711.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$711.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$385(stx$712, builtinSource$713, _maxExpands$714) {
        var env$715 = new Map();
        var params$716 = [];
        var context$717, builtInContext$718 = makeExpanderContext$384({ env: env$715 });
        maxExpands$321 = _maxExpands$714 || Infinity;
        expandCount$320 = 0;
        if (builtinSource$713) {
            var builtinRead$721 = parser$214.read(builtinSource$713);
            builtinRead$721 = [
                syn$215.makeIdent('module', null),
                syn$215.makeDelim('{}', builtinRead$721, null)
            ];
            builtinMode$319 = true;
            var builtinRes$722 = expand$383(builtinRead$721, builtInContext$718);
            builtinMode$319 = false;
            params$716 = _$213.map(builtinRes$722[0].exports, function (term$723) {
                return {
                    oldExport: term$723.name,
                    newParam: syn$215.makeIdent(term$723.name.token.value, null)
                };
            });
        }
        var modBody$719 = syn$215.makeDelim('{}', stx$712, null);
        modBody$719 = _$213.reduce(params$716, function (acc$724, param$725) {
            var newName$726 = fresh$330();
            env$715.set(resolve$324(param$725.newParam.rename(param$725.newParam, newName$726)), env$715.get(resolve$324(param$725.oldExport)));
            return acc$724.rename(param$725.newParam, newName$726);
        }, modBody$719);
        context$717 = makeExpanderContext$384({ env: env$715 });
        var res$720 = expand$383([
                syn$215.makeIdent('module', null),
                modBody$719
            ], context$717);
        res$720 = res$720[0].destruct();
        return flatten$386(res$720[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$386(stx$727) {
        return _$213.reduce(stx$727, function (acc$728, stx$729) {
            if (stx$729.token.type === parser$214.Token.Delimiter) {
                var exposed$730 = stx$729.expose();
                var openParen$731 = syntaxFromToken$317({
                        type: parser$214.Token.Punctuator,
                        value: stx$729.token.value[0],
                        range: stx$729.token.startRange,
                        sm_range: typeof stx$729.token.sm_startRange == 'undefined' ? stx$729.token.startRange : stx$729.token.sm_startRange,
                        lineNumber: stx$729.token.startLineNumber,
                        sm_lineNumber: typeof stx$729.token.sm_startLineNumber == 'undefined' ? stx$729.token.startLineNumber : stx$729.token.sm_startLineNumber,
                        lineStart: stx$729.token.startLineStart,
                        sm_lineStart: typeof stx$729.token.sm_startLineStart == 'undefined' ? stx$729.token.startLineStart : stx$729.token.sm_startLineStart
                    }, exposed$730);
                var closeParen$732 = syntaxFromToken$317({
                        type: parser$214.Token.Punctuator,
                        value: stx$729.token.value[1],
                        range: stx$729.token.endRange,
                        sm_range: typeof stx$729.token.sm_endRange == 'undefined' ? stx$729.token.endRange : stx$729.token.sm_endRange,
                        lineNumber: stx$729.token.endLineNumber,
                        sm_lineNumber: typeof stx$729.token.sm_endLineNumber == 'undefined' ? stx$729.token.endLineNumber : stx$729.token.sm_endLineNumber,
                        lineStart: stx$729.token.endLineStart,
                        sm_lineStart: typeof stx$729.token.sm_endLineStart == 'undefined' ? stx$729.token.endLineStart : stx$729.token.sm_endLineStart
                    }, exposed$730);
                if (stx$729.token.leadingComments) {
                    openParen$731.token.leadingComments = stx$729.token.leadingComments;
                }
                if (stx$729.token.trailingComments) {
                    openParen$731.token.trailingComments = stx$729.token.trailingComments;
                }
                return acc$728.concat(openParen$731).concat(flatten$386(exposed$730.token.inner)).concat(closeParen$732);
            }
            stx$729.token.sm_lineNumber = stx$729.token.sm_lineNumber ? stx$729.token.sm_lineNumber : stx$729.token.lineNumber;
            stx$729.token.sm_lineStart = stx$729.token.sm_lineStart ? stx$729.token.sm_lineStart : stx$729.token.lineStart;
            stx$729.token.sm_range = stx$729.token.sm_range ? stx$729.token.sm_range : stx$729.token.range;
            return acc$728.concat(stx$729);
        }, []);
    }
    exports$212.enforest = enforest$375;
    exports$212.expand = expandTopLevel$385;
    exports$212.resolve = resolve$324;
    exports$212.get_expression = get_expression$376;
    exports$212.makeExpanderContext = makeExpanderContext$384;
    exports$212.Expr = Expr$336;
    exports$212.VariableStatement = VariableStatement$363;
    exports$212.tokensToSyntax = syn$215.tokensToSyntax;
    exports$212.syntaxToTokens = syn$215.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map