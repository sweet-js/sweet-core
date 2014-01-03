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
(function (root$254, factory$255) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$255(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$255);
    }
}(this, function (exports$256, _$257, parser$258, syn$259, es6$260, se$261, patternModule$262, gen$263) {
    'use strict';
    var codegen$264 = gen$263 || escodegen;
    var assert$265 = syn$259.assert;
    var throwSyntaxError$266 = syn$259.throwSyntaxError;
    var unwrapSyntax$267 = syn$259.unwrapSyntax;
    // used to export "private" methods for unit testing
    exports$256._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$454 = Object.create(this);
                if (typeof o$454.construct === 'function') {
                    o$454.construct.apply(o$454, arguments);
                }
                return o$454;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$455) {
                var result$456 = Object.create(this);
                for (var prop$457 in properties$455) {
                    if (properties$455.hasOwnProperty(prop$457)) {
                        result$456[prop$457] = properties$455[prop$457];
                    }
                }
                return result$456;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$458) {
                function F$459() {
                }
                F$459.prototype = proto$458;
                return this instanceof F$459;
            },
            enumerable: false,
            writable: true
        }
    });
    var scopedEval$378 = se$261.scopedEval;
    var Rename$379 = syn$259.Rename;
    var Mark$380 = syn$259.Mark;
    var Def$381 = syn$259.Def;
    var syntaxFromToken$382 = syn$259.syntaxFromToken;
    var joinSyntax$383 = syn$259.joinSyntax;
    var builtinMode$384 = false;
    var expandCount$385 = 0;
    var maxExpands$386;
    var push$387 = Array.prototype.push;
    function remdup$388(mark$460, mlist$461) {
        if (mark$460 === _$257.first(mlist$461)) {
            return _$257.rest(mlist$461, 1);
        }
        return [mark$460].concat(mlist$461);
    }
    // (CSyntax) -> [...Num]
    function marksof$389(ctx$462, stopName$463, originalName$464) {
        var mark$465, submarks$466;
        if (ctx$462 instanceof Mark$380) {
            mark$465 = ctx$462.mark;
            submarks$466 = marksof$389(ctx$462.context, stopName$463, originalName$464);
            return remdup$388(mark$465, submarks$466);
        }
        if (ctx$462 instanceof Def$381) {
            return marksof$389(ctx$462.context, stopName$463, originalName$464);
        }
        if (ctx$462 instanceof Rename$379) {
            if (stopName$463 === originalName$464 + '$' + ctx$462.name) {
                return [];
            }
            return marksof$389(ctx$462.context, stopName$463, originalName$464);
        }
        return [];
    }
    function resolve$390(stx$467) {
        return resolveCtx$394(stx$467.token.value, stx$467.context, [], []);
    }
    function arraysEqual$391(a$468, b$469) {
        if (a$468.length !== b$469.length) {
            return false;
        }
        for (var i$470 = 0; i$470 < a$468.length; i$470++) {
            if (a$468[i$470] !== b$469[i$470]) {
                return false;
            }
        }
        return true;
    }
    function renames$392(defctx$471, oldctx$472, originalName$473) {
        var acc$474 = oldctx$472;
        for (var i$475 = 0; i$475 < defctx$471.length; i$475++) {
            if (defctx$471[i$475].id.token.value === originalName$473) {
                acc$474 = new Rename$379(defctx$471[i$475].id, defctx$471[i$475].name, acc$474, defctx$471);
            }
        }
        return acc$474;
    }
    function unionEl$393(arr$476, el$477) {
        if (arr$476.indexOf(el$477) === -1) {
            var res$478 = arr$476.slice(0);
            res$478.push(el$477);
            return res$478;
        }
        return arr$476;
    }
    // (Syntax) -> String
    function resolveCtx$394(originalName$479, ctx$480, stop_spine$481, stop_branch$482) {
        if (ctx$480 instanceof Mark$380) {
            return resolveCtx$394(originalName$479, ctx$480.context, stop_spine$481, stop_branch$482);
        }
        if (ctx$480 instanceof Def$381) {
            if (stop_spine$481.indexOf(ctx$480.defctx) !== -1) {
                return resolveCtx$394(originalName$479, ctx$480.context, stop_spine$481, stop_branch$482);
            } else {
                return resolveCtx$394(originalName$479, renames$392(ctx$480.defctx, ctx$480.context, originalName$479), stop_spine$481, unionEl$393(stop_branch$482, ctx$480.defctx));
            }
        }
        if (ctx$480 instanceof Rename$379) {
            if (originalName$479 === ctx$480.id.token.value) {
                var idName$483 = resolveCtx$394(ctx$480.id.token.value, ctx$480.id.context, stop_branch$482, stop_branch$482);
                var subName$484 = resolveCtx$394(originalName$479, ctx$480.context, unionEl$393(stop_spine$481, ctx$480.def), stop_branch$482);
                if (idName$483 === subName$484) {
                    var idMarks$485 = marksof$389(ctx$480.id.context, originalName$479 + '$' + ctx$480.name, originalName$479);
                    var subMarks$486 = marksof$389(ctx$480.context, originalName$479 + '$' + ctx$480.name, originalName$479);
                    if (arraysEqual$391(idMarks$485, subMarks$486)) {
                        return originalName$479 + '$' + ctx$480.name;
                    }
                }
            }
            return resolveCtx$394(originalName$479, ctx$480.context, stop_spine$481, stop_branch$482);
        }
        return originalName$479;
    }
    var nextFresh$395 = 0;
    // fun () -> Num
    function fresh$396() {
        return nextFresh$395++;
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$397(towrap$487, delimSyntax$488) {
        assert$265(delimSyntax$488.token.type === parser$258.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$382({
            type: parser$258.Token.Delimiter,
            value: delimSyntax$488.token.value,
            inner: towrap$487,
            range: delimSyntax$488.token.range,
            startLineNumber: delimSyntax$488.token.startLineNumber,
            lineStart: delimSyntax$488.token.lineStart
        }, delimSyntax$488);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$398(argSyntax$489) {
        if (argSyntax$489.token.type === parser$258.Token.Delimiter) {
            return _$257.filter(argSyntax$489.token.inner, function (stx$490) {
                return stx$490.token.value !== ',';
            });
        } else if (argSyntax$489.token.type === parser$258.Token.Identifier) {
            return [argSyntax$489];
        } else {
            assert$265(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$399 = {
            destruct: function () {
                return _$257.reduce(this.properties, _$257.bind(function (acc$491, prop$492) {
                    if (this[prop$492] && this[prop$492].hasPrototype(TermTree$399)) {
                        push$387.apply(acc$491, this[prop$492].destruct());
                        return acc$491;
                    } else if (this[prop$492] && this[prop$492].token && this[prop$492].token.inner) {
                        this[prop$492].token.inner = _$257.reduce(this[prop$492].token.inner, function (acc$493, t$494) {
                            if (t$494.hasPrototype(TermTree$399)) {
                                push$387.apply(acc$493, t$494.destruct());
                                return acc$493;
                            }
                            acc$493.push(t$494);
                            return acc$493;
                        }, []);
                        acc$491.push(this[prop$492]);
                        return acc$491;
                    } else if (Array.isArray(this[prop$492])) {
                        var destArr$495 = _$257.reduce(this[prop$492], function (acc$496, t$497) {
                                if (t$497.hasPrototype(TermTree$399)) {
                                    push$387.apply(acc$496, t$497.destruct());
                                    return acc$496;
                                }
                                acc$496.push(t$497);
                                return acc$496;
                            }, []);
                        push$387.apply(acc$491, destArr$495);
                        return acc$491;
                    } else if (this[prop$492]) {
                        acc$491.push(this[prop$492]);
                        return acc$491;
                    } else {
                        return acc$491;
                    }
                }, this), []);
            },
            addDefCtx: function (def$498) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$499) {
                    var prop$500 = this.properties[i$499];
                    if (Array.isArray(this[prop$500])) {
                        this[prop$500] = _$257.map(this[prop$500], function (item$501) {
                            return item$501.addDefCtx(def$498);
                        });
                    } else if (this[prop$500]) {
                        this[prop$500] = this[prop$500].addDefCtx(def$498);
                    }
                }, this));
                return this;
            },
            rename: function (id$502, name$503) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$504) {
                    var prop$505 = this.properties[i$504];
                    if (Array.isArray(this[prop$505])) {
                        this[prop$505] = _$257.map(this[prop$505], function (item$506) {
                            return item$506.rename(id$502, name$503);
                        });
                    } else if (this[prop$505]) {
                        this[prop$505] = this[prop$505].rename(id$502, name$503);
                    }
                }, this));
                return this;
            }
        };
    var EOF$400 = TermTree$399.extend({
            properties: ['eof'],
            construct: function (e$507) {
                this.eof = e$507;
            }
        });
    var Statement$401 = TermTree$399.extend({
            construct: function () {
            }
        });
    var Expr$402 = Statement$401.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$403 = Expr$402.extend({
            construct: function () {
            }
        });
    var ThisExpression$404 = PrimaryExpression$403.extend({
            properties: ['this'],
            construct: function (that$508) {
                this.this = that$508;
            }
        });
    var Lit$405 = PrimaryExpression$403.extend({
            properties: ['lit'],
            construct: function (l$509) {
                this.lit = l$509;
            }
        });
    exports$256._test.PropertyAssignment = PropertyAssignment$406;
    var PropertyAssignment$406 = TermTree$399.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$510, assignment$511) {
                this.propName = propName$510;
                this.assignment = assignment$511;
            }
        });
    var Block$407 = PrimaryExpression$403.extend({
            properties: ['body'],
            construct: function (body$512) {
                this.body = body$512;
            }
        });
    var ArrayLiteral$408 = PrimaryExpression$403.extend({
            properties: ['array'],
            construct: function (ar$513) {
                this.array = ar$513;
            }
        });
    var ParenExpression$409 = PrimaryExpression$403.extend({
            properties: ['expr'],
            construct: function (expr$514) {
                this.expr = expr$514;
            }
        });
    var UnaryOp$410 = Expr$402.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$515, expr$516) {
                this.op = op$515;
                this.expr = expr$516;
            }
        });
    var PostfixOp$411 = Expr$402.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$517, op$518) {
                this.expr = expr$517;
                this.op = op$518;
            }
        });
    var BinOp$412 = Expr$402.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$519, left$520, right$521) {
                this.op = op$519;
                this.left = left$520;
                this.right = right$521;
            }
        });
    var ConditionalExpression$413 = Expr$402.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$522, question$523, tru$524, colon$525, fls$526) {
                this.cond = cond$522;
                this.question = question$523;
                this.tru = tru$524;
                this.colon = colon$525;
                this.fls = fls$526;
            }
        });
    var Keyword$414 = TermTree$399.extend({
            properties: ['keyword'],
            construct: function (k$527) {
                this.keyword = k$527;
            }
        });
    var Punc$415 = TermTree$399.extend({
            properties: ['punc'],
            construct: function (p$528) {
                this.punc = p$528;
            }
        });
    var Delimiter$416 = TermTree$399.extend({
            properties: ['delim'],
            construct: function (d$529) {
                this.delim = d$529;
            }
        });
    var Id$417 = PrimaryExpression$403.extend({
            properties: ['id'],
            construct: function (id$530) {
                this.id = id$530;
            }
        });
    var NamedFun$418 = Expr$402.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$531, star$532, name$533, params$534, body$535) {
                this.keyword = keyword$531;
                this.star = star$532;
                this.name = name$533;
                this.params = params$534;
                this.body = body$535;
            }
        });
    var AnonFun$419 = Expr$402.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$536, star$537, params$538, body$539) {
                this.keyword = keyword$536;
                this.star = star$537;
                this.params = params$538;
                this.body = body$539;
            }
        });
    var ArrowFun$420 = Expr$402.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$540, arrow$541, body$542) {
                this.params = params$540;
                this.arrow = arrow$541;
                this.body = body$542;
            }
        });
    var LetMacro$421 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$543, body$544) {
                this.name = name$543;
                this.body = body$544;
            }
        });
    var Macro$422 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$545, body$546) {
                this.name = name$545;
                this.body = body$546;
            }
        });
    var AnonMacro$423 = TermTree$399.extend({
            properties: ['body'],
            construct: function (body$547) {
                this.body = body$547;
            }
        });
    var Const$424 = Expr$402.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$548, call$549) {
                this.newterm = newterm$548;
                this.call = call$549;
            }
        });
    var Call$425 = Expr$402.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                assert$265(this.fun.hasPrototype(TermTree$399), 'expecting a term tree in destruct of call');
                var that$550 = this;
                this.delim = syntaxFromToken$382(_$257.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$257.reduce(this.args, function (acc$552, term$553) {
                    assert$265(term$553 && term$553.hasPrototype(TermTree$399), 'expecting term trees in destruct of Call');
                    push$387.apply(acc$552, term$553.destruct());
                    // add all commas except for the last one
                    if (that$550.commas.length > 0) {
                        acc$552.push(that$550.commas.shift());
                    }
                    return acc$552;
                }, []);
                var res$551 = this.fun.destruct();
                push$387.apply(res$551, Delimiter$416.create(this.delim).destruct());
                return res$551;
            },
            construct: function (funn$554, args$555, delim$556, commas$557) {
                assert$265(Array.isArray(args$555), 'requires an array of arguments terms');
                this.fun = funn$554;
                this.args = args$555;
                this.delim = delim$556;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$557;
            }
        });
    var ObjDotGet$426 = Expr$402.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$558, dot$559, right$560) {
                this.left = left$558;
                this.dot = dot$559;
                this.right = right$560;
            }
        });
    var ObjGet$427 = Expr$402.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$561, right$562) {
                this.left = left$561;
                this.right = right$562;
            }
        });
    var VariableDeclaration$428 = TermTree$399.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$563, eqstx$564, init$565, comma$566) {
                this.ident = ident$563;
                this.eqstx = eqstx$564;
                this.init = init$565;
                this.comma = comma$566;
            }
        });
    var VariableStatement$429 = Statement$401.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$257.reduce(this.decls, function (acc$567, decl$568) {
                    push$387.apply(acc$567, decl$568.destruct());
                    return acc$567;
                }, []));
            },
            construct: function (varkw$569, decls$570) {
                assert$265(Array.isArray(decls$570), 'decls must be an array');
                this.varkw = varkw$569;
                this.decls = decls$570;
            }
        });
    var LetStatement$430 = Statement$401.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$257.reduce(this.decls, function (acc$571, decl$572) {
                    push$387.apply(acc$571, decl$572.destruct());
                    return acc$571;
                }, []));
            },
            construct: function (letkw$573, decls$574) {
                assert$265(Array.isArray(decls$574), 'decls must be an array');
                this.letkw = letkw$573;
                this.decls = decls$574;
            }
        });
    var ConstStatement$431 = Statement$401.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$257.reduce(this.decls, function (acc$575, decl$576) {
                    push$387.apply(acc$575, decl$576.destruct());
                    return acc$575;
                }, []));
            },
            construct: function (constkw$577, decls$578) {
                assert$265(Array.isArray(decls$578), 'decls must be an array');
                this.constkw = constkw$577;
                this.decls = decls$578;
            }
        });
    var CatchClause$432 = Statement$401.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$579, params$580, body$581) {
                this.catchkw = catchkw$579;
                this.params = params$580;
                this.body = body$581;
            }
        });
    var Module$433 = TermTree$399.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$582) {
                this.body = body$582;
                this.exports = [];
            }
        });
    var Empty$434 = Statement$401.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$435 = TermTree$399.extend({
            properties: ['name'],
            construct: function (name$583) {
                this.name = name$583;
            }
        });
    var ForStatement$436 = Statement$401.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$584, cond$585) {
                this.forkw = forkw$584;
                this.cond = cond$585;
            }
        });
    function stxIsUnaryOp$437(stx$586) {
        var staticOperators$587 = [
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
        return _$257.contains(staticOperators$587, unwrapSyntax$267(stx$586));
    }
    function stxIsBinOp$438(stx$588) {
        var staticOperators$589 = [
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
        return _$257.contains(staticOperators$589, unwrapSyntax$267(stx$588));
    }
    function enforestVarStatement$439(stx$590, context$591, varStx$592) {
        var isLet$593 = /^(?:let|const)$/.test(varStx$592.token.value);
        var decls$594 = [];
        var rest$595 = stx$590;
        var rhs$596;
        if (!rest$595.length) {
            throwSyntaxError$266('enforest', 'Unexpected end of input', varStx$592);
        }
        while (rest$595.length) {
            if (rest$595[0].token.type === parser$258.Token.Identifier) {
                if (isLet$593) {
                    var freshName$597 = fresh$396();
                    var renamedId$598 = rest$595[0].rename(rest$595[0], freshName$597);
                    rest$595 = rest$595.map(function (stx$599) {
                        return stx$599.rename(rest$595[0], freshName$597);
                    });
                    rest$595[0] = renamedId$598;
                }
                if (rest$595[1].token.type === parser$258.Token.Punctuator && rest$595[1].token.value === '=') {
                    rhs$596 = get_expression$443(rest$595.slice(2), context$591);
                    if (rhs$596.result == null) {
                        throwSyntaxError$266('enforest', 'Unexpected token', rhs$596.rest[0]);
                    }
                    if (rhs$596.rest[0].token.type === parser$258.Token.Punctuator && rhs$596.rest[0].token.value === ',') {
                        decls$594.push(VariableDeclaration$428.create(rest$595[0], rest$595[1], rhs$596.result, rhs$596.rest[0]));
                        rest$595 = rhs$596.rest.slice(1);
                        continue;
                    } else {
                        decls$594.push(VariableDeclaration$428.create(rest$595[0], rest$595[1], rhs$596.result, null));
                        rest$595 = rhs$596.rest;
                        break;
                    }
                } else if (rest$595[1].token.type === parser$258.Token.Punctuator && rest$595[1].token.value === ',') {
                    decls$594.push(VariableDeclaration$428.create(rest$595[0], null, null, rest$595[1]));
                    rest$595 = rest$595.slice(2);
                } else {
                    decls$594.push(VariableDeclaration$428.create(rest$595[0], null, null, null));
                    rest$595 = rest$595.slice(1);
                    break;
                }
            } else {
                throwSyntaxError$266('enforest', 'Unexpected token', rest$595[0]);
            }
        }
        return {
            result: decls$594,
            destructed: rest$595.length ? stx$590.slice(0, 0 - rest$595.length) : stx$590,
            rest: rest$595
        };
    }
    function adjustLineContext$440(stx$600, original$601, current$602) {
        current$602 = current$602 || {
            lastLineNumber: original$601.token.lineNumber,
            lineNumber: original$601.token.lineNumber - 1
        };
        return _$257.map(stx$600, function (stx$603) {
            if (stx$603.token.type === parser$258.Token.Delimiter) {
                // handle tokens with missing line info
                stx$603.token.startLineNumber = typeof stx$603.token.startLineNumber == 'undefined' ? original$601.token.lineNumber : stx$603.token.startLineNumber;
                stx$603.token.endLineNumber = typeof stx$603.token.endLineNumber == 'undefined' ? original$601.token.lineNumber : stx$603.token.endLineNumber;
                stx$603.token.startLineStart = typeof stx$603.token.startLineStart == 'undefined' ? original$601.token.lineStart : stx$603.token.startLineStart;
                stx$603.token.endLineStart = typeof stx$603.token.endLineStart == 'undefined' ? original$601.token.lineStart : stx$603.token.endLineStart;
                stx$603.token.startRange = typeof stx$603.token.startRange == 'undefined' ? original$601.token.range : stx$603.token.startRange;
                stx$603.token.endRange = typeof stx$603.token.endRange == 'undefined' ? original$601.token.range : stx$603.token.endRange;
                stx$603.token.sm_startLineNumber = typeof stx$603.token.sm_startLineNumber == 'undefined' ? stx$603.token.startLineNumber : stx$603.token.sm_startLineNumber;
                stx$603.token.sm_endLineNumber = typeof stx$603.token.sm_endLineNumber == 'undefined' ? stx$603.token.endLineNumber : stx$603.token.sm_endLineNumber;
                stx$603.token.sm_startLineStart = typeof stx$603.token.sm_startLineStart == 'undefined' ? stx$603.token.startLineStart : stx$603.token.sm_startLineStart;
                stx$603.token.sm_endLineStart = typeof stx$603.token.sm_endLineStart == 'undefined' ? stx$603.token.endLineStart : stx$603.token.sm_endLineStart;
                stx$603.token.sm_startRange = typeof stx$603.token.sm_startRange == 'undefined' ? stx$603.token.startRange : stx$603.token.sm_startRange;
                stx$603.token.sm_endRange = typeof stx$603.token.sm_endRange == 'undefined' ? stx$603.token.endRange : stx$603.token.sm_endRange;
                if (stx$603.token.startLineNumber === current$602.lastLineNumber && current$602.lastLineNumber !== current$602.lineNumber) {
                    stx$603.token.startLineNumber = current$602.lineNumber;
                } else if (stx$603.token.startLineNumber !== current$602.lastLineNumber) {
                    current$602.lineNumber++;
                    current$602.lastLineNumber = stx$603.token.startLineNumber;
                    stx$603.token.startLineNumber = current$602.lineNumber;
                }
                if (stx$603.token.inner.length > 0) {
                    stx$603.token.inner = adjustLineContext$440(stx$603.token.inner, original$601, current$602);
                }
                return stx$603;
            }
            // handle tokens with missing line info
            stx$603.token.lineNumber = typeof stx$603.token.lineNumber == 'undefined' ? original$601.token.lineNumber : stx$603.token.lineNumber;
            stx$603.token.lineStart = typeof stx$603.token.lineStart == 'undefined' ? original$601.token.lineStart : stx$603.token.lineStart;
            stx$603.token.range = typeof stx$603.token.range == 'undefined' ? original$601.token.range : stx$603.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$603.token.sm_lineNumber = typeof stx$603.token.sm_lineNumber == 'undefined' ? stx$603.token.lineNumber : stx$603.token.sm_lineNumber;
            stx$603.token.sm_lineStart = typeof stx$603.token.sm_lineStart == 'undefined' ? stx$603.token.lineStart : stx$603.token.sm_lineStart;
            stx$603.token.sm_range = typeof stx$603.token.sm_range == 'undefined' ? _$257.clone(stx$603.token.range) : stx$603.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$603.token.lineNumber === current$602.lastLineNumber && current$602.lastLineNumber !== current$602.lineNumber) {
                stx$603.token.lineNumber = current$602.lineNumber;
            } else if (stx$603.token.lineNumber !== current$602.lastLineNumber) {
                current$602.lineNumber++;
                current$602.lastLineNumber = stx$603.token.lineNumber;
                stx$603.token.lineNumber = current$602.lineNumber;
            }
            return stx$603;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$441(toks$604, context$605, prevStx$606, prevTerms$607) {
        assert$265(toks$604.length > 0, 'enforest assumes there are tokens to work with');
        prevStx$606 = prevStx$606 || [];
        prevTerms$607 = prevTerms$607 || [];
        function step$608(head$609, rest$610) {
            var innerTokens$611;
            assert$265(Array.isArray(rest$610), 'result must at least be an empty array');
            if (head$609.hasPrototype(TermTree$399)) {
                // function call
                var emp$614 = head$609.emp;
                var emp$614 = head$609.emp;
                var keyword$617 = head$609.keyword;
                var delim$619 = head$609.delim;
                var id$621 = head$609.id;
                var delim$619 = head$609.delim;
                var emp$614 = head$609.emp;
                var punc$625 = head$609.punc;
                var keyword$617 = head$609.keyword;
                var emp$614 = head$609.emp;
                var emp$614 = head$609.emp;
                var emp$614 = head$609.emp;
                var delim$619 = head$609.delim;
                var delim$619 = head$609.delim;
                var id$621 = head$609.id;
                var keyword$617 = head$609.keyword;
                var keyword$617 = head$609.keyword;
                var keyword$617 = head$609.keyword;
                var keyword$617 = head$609.keyword;
                var keyword$617 = head$609.keyword;
                if (head$609.hasPrototype(Expr$402) && rest$610[0] && rest$610[0].token.type === parser$258.Token.Delimiter && rest$610[0].token.value === '()') {
                    var argRes$660, enforestedArgs$661 = [], commas$662 = [];
                    rest$610[0].expose();
                    innerTokens$611 = rest$610[0].token.inner;
                    while (innerTokens$611.length > 0) {
                        argRes$660 = enforest$441(innerTokens$611, context$605);
                        enforestedArgs$661.push(argRes$660.result);
                        innerTokens$611 = argRes$660.rest;
                        if (innerTokens$611[0] && innerTokens$611[0].token.value === ',') {
                            // record the comma for later
                            commas$662.push(innerTokens$611[0]);
                            // but dump it for the next loop turn
                            innerTokens$611 = innerTokens$611.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$663 = _$257.all(enforestedArgs$661, function (argTerm$664) {
                            return argTerm$664.hasPrototype(Expr$402);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$611.length === 0 && argsAreExprs$663) {
                        return step$608(Call$425.create(head$609, enforestedArgs$661, rest$610[0], commas$662), rest$610.slice(1));
                    }
                } else if (head$609.hasPrototype(Expr$402) && rest$610[0] && unwrapSyntax$267(rest$610[0]) === '?') {
                    var question$665 = rest$610[0];
                    var condRes$666 = enforest$441(rest$610.slice(1), context$605);
                    var truExpr$667 = condRes$666.result;
                    var condRight$668 = condRes$666.rest;
                    if (truExpr$667.hasPrototype(Expr$402) && condRight$668[0] && unwrapSyntax$267(condRight$668[0]) === ':') {
                        var colon$669 = condRight$668[0];
                        var flsRes$670 = enforest$441(condRight$668.slice(1), context$605);
                        var flsExpr$671 = flsRes$670.result;
                        if (flsExpr$671.hasPrototype(Expr$402)) {
                            return step$608(ConditionalExpression$413.create(head$609, question$665, truExpr$667, colon$669, flsExpr$671), flsRes$670.rest);
                        }
                    }
                } else if (head$609.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$617) === 'new' && rest$610[0]) {
                    var newCallRes$672 = enforest$441(rest$610, context$605);
                    if (newCallRes$672.result.hasPrototype(Call$425)) {
                        return step$608(Const$424.create(head$609, newCallRes$672.result), newCallRes$672.rest);
                    }
                } else if (head$609.hasPrototype(Delimiter$416) && delim$619.token.value === '()' && rest$610[0] && rest$610[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$610[0]) === '=>') {
                    var arrowRes$673 = enforest$441(rest$610.slice(1), context$605);
                    if (arrowRes$673.result.hasPrototype(Expr$402)) {
                        return step$608(ArrowFun$420.create(delim$619, rest$610[0], arrowRes$673.result.destruct()), arrowRes$673.rest);
                    } else {
                        throwSyntaxError$266('enforest', 'Body of arrow function must be an expression', rest$610.slice(1));
                    }
                } else if (head$609.hasPrototype(Id$417) && rest$610[0] && rest$610[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$610[0]) === '=>') {
                    var res$674 = enforest$441(rest$610.slice(1), context$605);
                    if (res$674.result.hasPrototype(Expr$402)) {
                        return step$608(ArrowFun$420.create(id$621, rest$610[0], res$674.result.destruct()), res$674.rest);
                    } else {
                        throwSyntaxError$266('enforest', 'Body of arrow function must be an expression', rest$610.slice(1));
                    }
                } else if (head$609.hasPrototype(Delimiter$416) && delim$619.token.value === '()') {
                    innerTokens$611 = delim$619.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$611.length === 0) {
                        return step$608(ParenExpression$409.create(head$609), rest$610);
                    } else {
                        var innerTerm$675 = get_expression$443(innerTokens$611, context$605);
                        if (innerTerm$675.result && innerTerm$675.result.hasPrototype(Expr$402)) {
                            return step$608(ParenExpression$409.create(head$609), rest$610);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$609.hasPrototype(Expr$402) && rest$610[0] && rest$610[1] && stxIsBinOp$438(rest$610[0])) {
                    var op$676 = rest$610[0];
                    var left$677 = head$609;
                    var rightStx$678 = rest$610.slice(1);
                    var bopPrevStx$679 = getHeadStx$442(toks$604, rightStx$678).reverse().concat(prevStx$606);
                    var bopPrevTerms$680 = [
                            Punc$415.create(rest$610[0]),
                            head$609
                        ].concat(prevTerms$607);
                    var bopRes$681 = enforest$441(rightStx$678, context$605, bopPrevStx$679, bopPrevTerms$680);
                    // Lookbehind was matched, so it may not even be a binop anymore.
                    if (bopRes$681.prevTerms.length < bopPrevTerms$680.length) {
                        return bopRes$681;
                    }
                    var right$682 = bopRes$681.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$682.hasPrototype(Expr$402)) {
                        return step$608(BinOp$412.create(op$676, left$677, right$682), bopRes$681.rest);
                    }
                } else if (head$609.hasPrototype(Punc$415) && stxIsUnaryOp$437(punc$625)) {
                    var unopPrevStx$683 = [punc$625].concat(prevStx$606);
                    var unopPrevTerms$684 = [head$609].concat(prevTerms$607);
                    var unopRes$685 = enforest$441(rest$610, context$605, unopPrevStx$683, unopPrevTerms$684);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopRes$685.prevTerms.length < unopPrevTerms$684.length) {
                        return unopRes$685;
                    }
                    if (unopRes$685.result.hasPrototype(Expr$402)) {
                        return step$608(UnaryOp$410.create(punc$625, unopRes$685.result), unopRes$685.rest);
                    }
                } else if (head$609.hasPrototype(Keyword$414) && stxIsUnaryOp$437(keyword$617)) {
                    var unopKeyPrevStx$686 = [keyword$617].concat(prevStx$606);
                    var unopKeyPrevTerms$687 = [head$609].concat(prevTerms$607);
                    var unopKeyres$688 = enforest$441(rest$610, context$605, unopKeyPrevStx$686, unopKeyPrevTerms$687);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopKeyres$688.prevTerms.length < unopKeyPrevTerms$687.length) {
                        return unopKeyres$688;
                    }
                    if (unopKeyres$688.result.hasPrototype(Expr$402)) {
                        return step$608(UnaryOp$410.create(keyword$617, unopKeyres$688.result), unopKeyres$688.rest);
                    }
                } else if (head$609.hasPrototype(Expr$402) && rest$610[0] && (unwrapSyntax$267(rest$610[0]) === '++' || unwrapSyntax$267(rest$610[0]) === '--')) {
                    return step$608(PostfixOp$411.create(head$609, rest$610[0]), rest$610.slice(1));
                } else if (head$609.hasPrototype(Expr$402) && rest$610[0] && rest$610[0].token.value === '[]') {
                    return step$608(ObjGet$427.create(head$609, Delimiter$416.create(rest$610[0].expose())), rest$610.slice(1));
                } else if (head$609.hasPrototype(Expr$402) && rest$610[0] && unwrapSyntax$267(rest$610[0]) === '.' && rest$610[1] && rest$610[1].token.type === parser$258.Token.Identifier) {
                    return step$608(ObjDotGet$426.create(head$609, rest$610[0], rest$610[1]), rest$610.slice(2));
                } else if (head$609.hasPrototype(Delimiter$416) && delim$619.token.value === '[]') {
                    return step$608(ArrayLiteral$408.create(head$609), rest$610);
                } else if (head$609.hasPrototype(Delimiter$416) && head$609.delim.token.value === '{}') {
                    return step$608(Block$407.create(head$609), rest$610);
                } else if (head$609.hasPrototype(Id$417) && unwrapSyntax$267(id$621) === '#quoteSyntax' && rest$610[0] && rest$610[0].token.value === '{}') {
                    var tempId$689 = fresh$396();
                    context$605.templateMap.set(tempId$689, rest$610[0].token.inner);
                    return step$608(syn$259.makeIdent('getTemplate', id$621), [syn$259.makeDelim('()', [syn$259.makeValue(tempId$689, id$621)], id$621)].concat(rest$610.slice(1)));
                } else if (head$609.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$617) === 'let' && (rest$610[0] && rest$610[0].token.type === parser$258.Token.Identifier || rest$610[0] && rest$610[0].token.type === parser$258.Token.Keyword || rest$610[0] && rest$610[0].token.type === parser$258.Token.Punctuator) && rest$610[1] && unwrapSyntax$267(rest$610[1]) === '=' && rest$610[2] && rest$610[2].token.value === 'macro') {
                    var mac$690 = enforest$441(rest$610.slice(2), context$605);
                    if (!mac$690.result.hasPrototype(AnonMacro$423)) {
                        throwSyntaxError$266('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$610.slice(2));
                    }
                    return step$608(LetMacro$421.create(rest$610[0], mac$690.result.body), mac$690.rest);
                } else if (head$609.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$617) === 'var' && rest$610[0]) {
                    var vsRes$691 = enforestVarStatement$439(rest$610, context$605, keyword$617);
                    if (vsRes$691) {
                        return step$608(VariableStatement$429.create(head$609, vsRes$691.result), vsRes$691.rest);
                    }
                } else if (head$609.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$617) === 'let' && rest$610[0]) {
                    var lsRes$692 = enforestVarStatement$439(rest$610, context$605, keyword$617);
                    if (lsRes$692) {
                        return step$608(LetStatement$430.create(head$609, lsRes$692.result), lsRes$692.rest);
                    }
                } else if (head$609.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$617) === 'const' && rest$610[0]) {
                    var csRes$693 = enforestVarStatement$439(rest$610, context$605, keyword$617);
                    if (csRes$693) {
                        return step$608(ConstStatement$431.create(head$609, csRes$693.result), csRes$693.rest);
                    }
                } else if (head$609.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$617) === 'for' && rest$610[0] && rest$610[0].token.value === '()') {
                    return step$608(ForStatement$436.create(keyword$617, rest$610[0]), rest$610.slice(1));
                }
            } else {
                assert$265(head$609 && head$609.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$609.token.type === parser$258.Token.Identifier || head$609.token.type === parser$258.Token.Keyword || head$609.token.type === parser$258.Token.Punctuator) && context$605.env.has(resolve$390(head$609))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$694 = fresh$396();
                    var transformerContext$695 = makeExpanderContext$451(_$257.defaults({ mark: newMark$694 }, context$605));
                    // pull the macro transformer out the environment
                    var macroObj$696 = context$605.env.get(resolve$390(head$609));
                    var transformer$697 = macroObj$696.fn;
                    if (expandCount$385 >= maxExpands$386) {
                        return {
                            result: head$609,
                            rest: rest$610
                        };
                    } else if (!builtinMode$384 && !macroObj$696.builtin) {
                        expandCount$385++;
                    }
                    // apply the transformer
                    var rt$698;
                    try {
                        rt$698 = transformer$697([head$609].concat(rest$610), transformerContext$695, prevStx$606, prevTerms$607);
                    } catch (e$699) {
                        if (e$699.type && e$699.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$700 = '`' + rest$610.slice(0, 5).map(function (stx$701) {
                                    return stx$701.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$266('macro', 'Macro `' + head$609.token.value + '` could not be matched with ' + argumentString$700, head$609);
                        } else {
                            // just rethrow it
                            throw e$699;
                        }
                    }
                    if (rt$698.prevTerms) {
                        prevTerms$607 = rt$698.prevTerms;
                    }
                    if (rt$698.prevStx) {
                        // Adjust toks if lookbehind was matched so we can calculate
                        // the correct destructed syntax.
                        if (rt$698.prevStx.length < prevStx$606.length) {
                            toks$604 = rt$698.result.concat(rt$698.rest);
                        }
                        prevStx$606 = rt$698.prevStx;
                    }
                    if (!Array.isArray(rt$698.result)) {
                        throwSyntaxError$266('enforest', 'Macro must return a syntax array', head$609);
                    }
                    if (rt$698.result.length > 0) {
                        var adjustedResult$702 = adjustLineContext$440(rt$698.result, head$609);
                        adjustedResult$702[0].token.leadingComments = head$609.token.leadingComments;
                        return step$608(adjustedResult$702[0], adjustedResult$702.slice(1).concat(rt$698.rest));
                    } else {
                        return step$608(Empty$434.create(), rt$698.rest);
                    }
                }    // anon macro definition
                else if (head$609.token.type === parser$258.Token.Identifier && head$609.token.value === 'macro' && rest$610[0] && rest$610[0].token.value === '{}') {
                    return step$608(AnonMacro$423.create(rest$610[0].expose().token.inner), rest$610.slice(1));
                }    // macro definition
                else if (head$609.token.type === parser$258.Token.Identifier && head$609.token.value === 'macro' && rest$610[0] && (rest$610[0].token.type === parser$258.Token.Identifier || rest$610[0].token.type === parser$258.Token.Keyword || rest$610[0].token.type === parser$258.Token.Punctuator) && rest$610[1] && rest$610[1].token.type === parser$258.Token.Delimiter && rest$610[1].token.value === '{}') {
                    return step$608(Macro$422.create(rest$610[0], rest$610[1].expose().token.inner), rest$610.slice(2));
                }    // module definition
                else if (unwrapSyntax$267(head$609) === 'module' && rest$610[0] && rest$610[0].token.value === '{}') {
                    return step$608(Module$433.create(rest$610[0]), rest$610.slice(1));
                }    // function definition
                else if (head$609.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$609) === 'function' && rest$610[0] && rest$610[0].token.type === parser$258.Token.Identifier && rest$610[1] && rest$610[1].token.type === parser$258.Token.Delimiter && rest$610[1].token.value === '()' && rest$610[2] && rest$610[2].token.type === parser$258.Token.Delimiter && rest$610[2].token.value === '{}') {
                    rest$610[1].token.inner = rest$610[1].expose().token.inner;
                    rest$610[2].token.inner = rest$610[2].expose().token.inner;
                    return step$608(NamedFun$418.create(head$609, null, rest$610[0], rest$610[1], rest$610[2]), rest$610.slice(3));
                }    // generator function definition
                else if (head$609.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$609) === 'function' && rest$610[0] && rest$610[0].token.type === parser$258.Token.Punctuator && rest$610[0].token.value === '*' && rest$610[1] && rest$610[1].token.type === parser$258.Token.Identifier && rest$610[2] && rest$610[2].token.type === parser$258.Token.Delimiter && rest$610[2].token.value === '()' && rest$610[3] && rest$610[3].token.type === parser$258.Token.Delimiter && rest$610[3].token.value === '{}') {
                    rest$610[2].token.inner = rest$610[2].expose().token.inner;
                    rest$610[3].token.inner = rest$610[3].expose().token.inner;
                    return step$608(NamedFun$418.create(head$609, rest$610[0], rest$610[1], rest$610[2], rest$610[3]), rest$610.slice(4));
                }    // anonymous function definition
                else if (head$609.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$609) === 'function' && rest$610[0] && rest$610[0].token.type === parser$258.Token.Delimiter && rest$610[0].token.value === '()' && rest$610[1] && rest$610[1].token.type === parser$258.Token.Delimiter && rest$610[1].token.value === '{}') {
                    rest$610[0].token.inner = rest$610[0].expose().token.inner;
                    rest$610[1].token.inner = rest$610[1].expose().token.inner;
                    return step$608(AnonFun$419.create(head$609, null, rest$610[0], rest$610[1]), rest$610.slice(2));
                }    // anonymous generator function definition
                else if (head$609.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$609) === 'function' && rest$610[0] && rest$610[0].token.type === parser$258.Token.Punctuator && rest$610[0].token.value === '*' && rest$610[1] && rest$610[1].token.type === parser$258.Token.Delimiter && rest$610[1].token.value === '()' && rest$610[2] && rest$610[2].token.type === parser$258.Token.Delimiter && rest$610[2].token.value === '{}') {
                    rest$610[1].token.inner = rest$610[1].expose().token.inner;
                    rest$610[2].token.inner = rest$610[2].expose().token.inner;
                    return step$608(AnonFun$419.create(head$609, rest$610[0], rest$610[1], rest$610[2]), rest$610.slice(3));
                }    // arrow function
                else if ((head$609.token.type === parser$258.Token.Delimiter && head$609.token.value === '()' || head$609.token.type === parser$258.Token.Identifier) && rest$610[0] && rest$610[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$610[0]) === '=>' && rest$610[1] && rest$610[1].token.type === parser$258.Token.Delimiter && rest$610[1].token.value === '{}') {
                    return step$608(ArrowFun$420.create(head$609, rest$610[0], rest$610[1]), rest$610.slice(2));
                }    // catch statement
                else if (head$609.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$609) === 'catch' && rest$610[0] && rest$610[0].token.type === parser$258.Token.Delimiter && rest$610[0].token.value === '()' && rest$610[1] && rest$610[1].token.type === parser$258.Token.Delimiter && rest$610[1].token.value === '{}') {
                    rest$610[0].token.inner = rest$610[0].expose().token.inner;
                    rest$610[1].token.inner = rest$610[1].expose().token.inner;
                    return step$608(CatchClause$432.create(head$609, rest$610[0], rest$610[1]), rest$610.slice(2));
                }    // this expression
                else if (head$609.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$609) === 'this') {
                    return step$608(ThisExpression$404.create(head$609), rest$610);
                }    // literal
                else if (head$609.token.type === parser$258.Token.NumericLiteral || head$609.token.type === parser$258.Token.StringLiteral || head$609.token.type === parser$258.Token.BooleanLiteral || head$609.token.type === parser$258.Token.RegularExpression || head$609.token.type === parser$258.Token.NullLiteral) {
                    return step$608(Lit$405.create(head$609), rest$610);
                }    // export
                else if (head$609.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$609) === 'export' && rest$610[0] && (rest$610[0].token.type === parser$258.Token.Identifier || rest$610[0].token.type === parser$258.Token.Keyword || rest$610[0].token.type === parser$258.Token.Punctuator)) {
                    return step$608(Export$435.create(rest$610[0]), rest$610.slice(1));
                }    // identifier
                else if (head$609.token.type === parser$258.Token.Identifier) {
                    return step$608(Id$417.create(head$609), rest$610);
                }    // punctuator
                else if (head$609.token.type === parser$258.Token.Punctuator) {
                    return step$608(Punc$415.create(head$609), rest$610);
                } else if (head$609.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$609) === 'with') {
                    throwSyntaxError$266('enforest', 'with is not supported in sweet.js', head$609);
                }    // keyword
                else if (head$609.token.type === parser$258.Token.Keyword) {
                    return step$608(Keyword$414.create(head$609), rest$610);
                }    // Delimiter
                else if (head$609.token.type === parser$258.Token.Delimiter) {
                    return step$608(Delimiter$416.create(head$609.expose()), rest$610);
                }    // end of file
                else if (head$609.token.type === parser$258.Token.EOF) {
                    assert$265(rest$610.length === 0, 'nothing should be after an EOF');
                    return step$608(EOF$400.create(head$609), []);
                } else {
                    // todo: are we missing cases?
                    assert$265(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$609,
                destructed: getHeadStx$442(toks$604, rest$610),
                rest: rest$610,
                prevStx: prevStx$606,
                prevTerms: prevTerms$607
            };
        }
        return step$608(toks$604[0], toks$604.slice(1));
    }
    function getHeadStx$442(before$703, after$704) {
        return after$704.length ? before$703.slice(0, -after$704.length) : before$703;
    }
    function get_expression$443(stx$705, context$706) {
        var res$707 = enforest$441(stx$705, context$706);
        var next$708 = res$707;
        var peek$709;
        var prevStx$710;
        if (!next$708.result.hasPrototype(Expr$402)) {
            return {
                result: null,
                rest: stx$705
            };
        }
        while (next$708.rest.length) {
            // Enforest the next term tree since it might be an infix macro that
            // consumes the initial expression.
            peek$709 = enforest$441(next$708.rest, context$706, next$708.destructed, [next$708.result]);
            // If it has prev terms it wasn't infix, but it we need to run it
            // through enforest together with the initial expression to see if
            // it extends it into a longer expression.
            if (peek$709.prevTerms.length === 1) {
                peek$709 = enforest$441([next$708.result].concat(peek$709.destructed, peek$709.rest), context$706);
            }
            // No new expression was created, so we've reached the end.
            if (peek$709.result === next$708.result) {
                break;
            }
            // A new expression was created, so loop back around and keep going.
            next$708 = peek$709;
        }
        return next$708;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$444(newMark$711, env$712) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$713(match$714) {
            if (match$714.level === 0) {
                // replace the match property with the marked syntax
                match$714.match = _$257.map(match$714.match, function (stx$715) {
                    return stx$715.mark(newMark$711);
                });
            } else {
                _$257.each(match$714.match, function (match$716) {
                    dfs$713(match$716);
                });
            }
        }
        _$257.keys(env$712).forEach(function (key$717) {
            dfs$713(env$712[key$717]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$445(mac$718, context$719) {
        var body$720 = mac$718.body;
        // raw function primitive form
        if (!(body$720[0] && body$720[0].token.type === parser$258.Token.Keyword && body$720[0].token.value === 'function')) {
            throwSyntaxError$266('load macro', 'Primitive macro form must contain a function for the macro body', body$720);
        }
        var stub$721 = parser$258.read('()');
        stub$721[0].token.inner = body$720;
        var expanded$722 = expand$450(stub$721, context$719);
        expanded$722 = expanded$722[0].destruct().concat(expanded$722[1].eof);
        var flattend$723 = flatten$453(expanded$722);
        var bodyCode$724 = codegen$264.generate(parser$258.parse(flattend$723));
        var macroFn$725 = scopedEval$378(bodyCode$724, {
                makeValue: syn$259.makeValue,
                makeRegex: syn$259.makeRegex,
                makeIdent: syn$259.makeIdent,
                makeKeyword: syn$259.makeKeyword,
                makePunc: syn$259.makePunc,
                makeDelim: syn$259.makeDelim,
                unwrapSyntax: syn$259.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$266,
                prettyPrint: syn$259.prettyPrint,
                parser: parser$258,
                __fresh: fresh$396,
                _: _$257,
                patternModule: patternModule$262,
                getTemplate: function (id$726) {
                    return cloneSyntaxArray$446(context$719.templateMap.get(id$726));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$444,
                mergeMatches: function (newMatch$727, oldMatch$728) {
                    newMatch$727.patternEnv = _$257.extend({}, oldMatch$728.patternEnv, newMatch$727.patternEnv);
                    return newMatch$727;
                }
            });
        return macroFn$725;
    }
    function cloneSyntaxArray$446(arr$729) {
        return arr$729.map(function (stx$730) {
            var o$731 = syntaxFromToken$382(_$257.clone(stx$730.token), stx$730);
            if (o$731.token.type === parser$258.Token.Delimiter) {
                o$731.token.inner = cloneSyntaxArray$446(o$731.token.inner);
            }
            return o$731;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$447(stx$732, context$733, prevStx$734, prevTerms$735) {
        assert$265(context$733, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$732.length === 0) {
            return {
                terms: prevTerms$735 ? prevTerms$735.reverse() : [],
                context: context$733
            };
        }
        assert$265(stx$732[0].token, 'expecting a syntax object');
        var f$736 = enforest$441(stx$732, context$733, prevStx$734, prevTerms$735);
        // head :: TermTree
        var head$737 = f$736.result;
        // rest :: [Syntax]
        var rest$738 = f$736.rest;
        var macroDefinition$739;
        if (head$737.hasPrototype(Macro$422) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$739 = loadMacroDef$445(head$737, context$733);
            addToDefinitionCtx$448([head$737.name], context$733.defscope, false);
            context$733.env.set(resolve$390(head$737.name), {
                fn: macroDefinition$739,
                builtin: builtinMode$384
            });
            return expandToTermTree$447(rest$738, context$733, prevStx$734, prevTerms$735);
        }
        if (head$737.hasPrototype(LetMacro$421) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$739 = loadMacroDef$445(head$737, context$733);
            var freshName$742 = fresh$396();
            var renamedName$743 = head$737.name.rename(head$737.name, freshName$742);
            rest$738 = _$257.map(rest$738, function (stx$744) {
                return stx$744.rename(head$737.name, freshName$742);
            });
            head$737.name = renamedName$743;
            context$733.env.set(resolve$390(head$737.name), {
                fn: macroDefinition$739,
                builtin: builtinMode$384
            });
            return expandToTermTree$447(rest$738, context$733, prevStx$734, prevTerms$735);
        }
        // We build the newPrevTerms/Stx here (instead of at the beginning) so
        // that macro definitions don't get added to it.
        f$736.destructed.forEach(function (stx$745) {
            stx$745.term = head$737;
        });
        var newPrevTerms$740 = [head$737].concat(f$736.prevTerms);
        var newPrevStx$741 = f$736.destructed.reverse().concat(f$736.prevStx);
        if (head$737.hasPrototype(NamedFun$418)) {
            addToDefinitionCtx$448([head$737.name], context$733.defscope, true);
        }
        if (head$737.hasPrototype(VariableStatement$429)) {
            addToDefinitionCtx$448(_$257.map(head$737.decls, function (decl$746) {
                return decl$746.ident;
            }), context$733.defscope, true);
        }
        if (head$737.hasPrototype(Block$407) && head$737.body.hasPrototype(Delimiter$416)) {
            head$737.body.delim.token.inner.forEach(function (term$747) {
                if (term$747.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$448(_$257.map(term$747.decls, function (decl$748) {
                        return decl$748.ident;
                    }), context$733.defscope, true);
                }
            });
        }
        if (head$737.hasPrototype(Delimiter$416)) {
            head$737.delim.token.inner.forEach(function (term$749) {
                if (term$749.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$448(_$257.map(term$749.decls, function (decl$750) {
                        return decl$750.ident;
                    }), context$733.defscope, true);
                }
            });
        }
        if (head$737.hasPrototype(ForStatement$436)) {
            head$737.cond.expose();
            var forCond$751 = head$737.cond.token.inner;
            if (forCond$751[0] && resolve$390(forCond$751[0]) === 'let' && forCond$751[1] && forCond$751[1].token.type === parser$258.Token.Identifier) {
                var letNew$752 = fresh$396();
                var letId$753 = forCond$751[1];
                forCond$751 = forCond$751.map(function (stx$754) {
                    return stx$754.rename(letId$753, letNew$752);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$737.cond.token.inner = expand$450([forCond$751[0]], context$733).concat(expand$450(forCond$751.slice(1), context$733));
                // nice and easy case: `for (...) { ... }`
                if (rest$738[0] && rest$738[0].token.value === '{}') {
                    rest$738[0] = rest$738[0].rename(letId$753, letNew$752);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$755 = enforest$441(rest$738, context$733);
                    var renamedBodyTerm$756 = bodyEnf$755.result.rename(letId$753, letNew$752);
                    bodyEnf$755.destructed.forEach(function (stx$757) {
                        stx$757.term = renamedBodyTerm$756;
                    });
                    return expandToTermTree$447(bodyEnf$755.rest, context$733, bodyEnf$755.destructed.reverse().concat(newPrevStx$741), [renamedBodyTerm$756].concat(newPrevTerms$740));
                }
            } else {
                head$737.cond.token.inner = expand$450(head$737.cond.token.inner, context$733);
            }
        }
        return expandToTermTree$447(rest$738, context$733, newPrevStx$741, newPrevTerms$740);
    }
    function addToDefinitionCtx$448(idents$758, defscope$759, skipRep$760) {
        assert$265(idents$758 && idents$758.length > 0, 'expecting some variable identifiers');
        skipRep$760 = skipRep$760 || false;
        _$257.each(idents$758, function (id$761) {
            var skip$762 = false;
            if (skipRep$760) {
                var declRepeat$763 = _$257.find(defscope$759, function (def$764) {
                        return def$764.id.token.value === id$761.token.value && arraysEqual$391(marksof$389(def$764.id.context), marksof$389(id$761.context));
                    });
                skip$762 = typeof declRepeat$763 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$762) {
                var name$765 = fresh$396();
                defscope$759.push({
                    id: id$761,
                    name: name$765
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$449(term$766, context$767) {
        assert$265(context$767 && context$767.env, 'environment map is required');
        if (term$766.hasPrototype(ArrayLiteral$408)) {
            term$766.array.delim.token.inner = expand$450(term$766.array.delim.expose().token.inner, context$767);
            return term$766;
        } else if (term$766.hasPrototype(Block$407)) {
            term$766.body.delim.token.inner = expand$450(term$766.body.delim.expose().token.inner, context$767);
            return term$766;
        } else if (term$766.hasPrototype(ParenExpression$409)) {
            term$766.expr.delim.token.inner = expand$450(term$766.expr.delim.expose().token.inner, context$767);
            return term$766;
        } else if (term$766.hasPrototype(Call$425)) {
            term$766.fun = expandTermTreeToFinal$449(term$766.fun, context$767);
            term$766.args = _$257.map(term$766.args, function (arg$768) {
                return expandTermTreeToFinal$449(arg$768, context$767);
            });
            return term$766;
        } else if (term$766.hasPrototype(UnaryOp$410)) {
            term$766.expr = expandTermTreeToFinal$449(term$766.expr, context$767);
            return term$766;
        } else if (term$766.hasPrototype(BinOp$412)) {
            term$766.left = expandTermTreeToFinal$449(term$766.left, context$767);
            term$766.right = expandTermTreeToFinal$449(term$766.right, context$767);
            return term$766;
        } else if (term$766.hasPrototype(ObjGet$427)) {
            term$766.right.delim.token.inner = expand$450(term$766.right.delim.expose().token.inner, context$767);
            return term$766;
        } else if (term$766.hasPrototype(ObjDotGet$426)) {
            term$766.left = expandTermTreeToFinal$449(term$766.left, context$767);
            term$766.right = expandTermTreeToFinal$449(term$766.right, context$767);
            return term$766;
        } else if (term$766.hasPrototype(VariableDeclaration$428)) {
            if (term$766.init) {
                term$766.init = expandTermTreeToFinal$449(term$766.init, context$767);
            }
            return term$766;
        } else if (term$766.hasPrototype(VariableStatement$429)) {
            term$766.decls = _$257.map(term$766.decls, function (decl$769) {
                return expandTermTreeToFinal$449(decl$769, context$767);
            });
            return term$766;
        } else if (term$766.hasPrototype(Delimiter$416)) {
            // expand inside the delimiter and then continue on
            term$766.delim.token.inner = expand$450(term$766.delim.expose().token.inner, context$767);
            return term$766;
        } else if (term$766.hasPrototype(NamedFun$418) || term$766.hasPrototype(AnonFun$419) || term$766.hasPrototype(CatchClause$432) || term$766.hasPrototype(ArrowFun$420) || term$766.hasPrototype(Module$433)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$770 = [];
            var bodyContext$771 = makeExpanderContext$451(_$257.defaults({ defscope: newDef$770 }, context$767));
            var paramSingleIdent$772 = term$766.params && term$766.params.token.type === parser$258.Token.Identifier;
            var params$773;
            if (term$766.params && term$766.params.token.type === parser$258.Token.Delimiter) {
                params$773 = term$766.params.expose();
            } else if (paramSingleIdent$772) {
                params$773 = term$766.params;
            } else {
                params$773 = syn$259.makeDelim('()', [], null);
            }
            var bodies$774;
            if (Array.isArray(term$766.body)) {
                bodies$774 = syn$259.makeDelim('{}', term$766.body, null);
            } else {
                bodies$774 = term$766.body;
            }
            bodies$774 = bodies$774.addDefCtx(newDef$770);
            var paramNames$775 = _$257.map(getParamIdentifiers$398(params$773), function (param$782) {
                    var freshName$783 = fresh$396();
                    return {
                        freshName: freshName$783,
                        originalParam: param$782,
                        renamedParam: param$782.rename(param$782, freshName$783)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$776 = _$257.reduce(paramNames$775, function (accBody$784, p$785) {
                    return accBody$784.rename(p$785.originalParam, p$785.freshName);
                }, bodies$774);
            renamedBody$776 = renamedBody$776.expose();
            var expandedResult$777 = expandToTermTree$447(renamedBody$776.token.inner, bodyContext$771);
            var bodyTerms$778 = expandedResult$777.terms;
            var renamedParams$779 = _$257.map(paramNames$775, function (p$786) {
                    return p$786.renamedParam;
                });
            var flatArgs$780;
            if (paramSingleIdent$772) {
                flatArgs$780 = renamedParams$779[0];
            } else {
                flatArgs$780 = syn$259.makeDelim('()', joinSyntax$383(renamedParams$779, ','), term$766.params);
            }
            var expandedArgs$781 = expand$450([flatArgs$780], bodyContext$771);
            assert$265(expandedArgs$781.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$766.params) {
                term$766.params = expandedArgs$781[0];
            }
            bodyTerms$778 = _$257.map(bodyTerms$778, function (bodyTerm$787) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$788 = bodyTerm$787.addDefCtx(newDef$770);
                // finish expansion
                return expandTermTreeToFinal$449(termWithCtx$788, expandedResult$777.context);
            });
            if (term$766.hasPrototype(Module$433)) {
                bodyTerms$778 = _$257.filter(bodyTerms$778, function (bodyTerm$789) {
                    if (bodyTerm$789.hasPrototype(Export$435)) {
                        term$766.exports.push(bodyTerm$789);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$776.token.inner = bodyTerms$778;
            if (Array.isArray(term$766.body)) {
                term$766.body = renamedBody$776.token.inner;
            } else {
                term$766.body = renamedBody$776;
            }
            // and continue expand the rest
            return term$766;
        }
        // the term is fine as is
        return term$766;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$450(stx$790, context$791) {
        assert$265(context$791, 'must provide an expander context');
        var trees$792 = expandToTermTree$447(stx$790, context$791);
        return _$257.map(trees$792.terms, function (term$793) {
            return expandTermTreeToFinal$449(term$793, trees$792.context);
        });
    }
    function makeExpanderContext$451(o$794) {
        o$794 = o$794 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$794.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$794.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$794.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$794.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$452(stx$795, builtinSource$796, _maxExpands$797) {
        var env$798 = new Map();
        var params$799 = [];
        var context$800, builtInContext$801 = makeExpanderContext$451({ env: env$798 });
        maxExpands$386 = _maxExpands$797 || Infinity;
        expandCount$385 = 0;
        if (builtinSource$796) {
            var builtinRead$804 = parser$258.read(builtinSource$796);
            builtinRead$804 = [
                syn$259.makeIdent('module', null),
                syn$259.makeDelim('{}', builtinRead$804, null)
            ];
            builtinMode$384 = true;
            var builtinRes$805 = expand$450(builtinRead$804, builtInContext$801);
            builtinMode$384 = false;
            params$799 = _$257.map(builtinRes$805[0].exports, function (term$806) {
                return {
                    oldExport: term$806.name,
                    newParam: syn$259.makeIdent(term$806.name.token.value, null)
                };
            });
        }
        var modBody$802 = syn$259.makeDelim('{}', stx$795, null);
        modBody$802 = _$257.reduce(params$799, function (acc$807, param$808) {
            var newName$809 = fresh$396();
            env$798.set(resolve$390(param$808.newParam.rename(param$808.newParam, newName$809)), env$798.get(resolve$390(param$808.oldExport)));
            return acc$807.rename(param$808.newParam, newName$809);
        }, modBody$802);
        context$800 = makeExpanderContext$451({ env: env$798 });
        var res$803 = expand$450([
                syn$259.makeIdent('module', null),
                modBody$802
            ], context$800);
        res$803 = res$803[0].destruct();
        return flatten$453(res$803[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$453(stx$810) {
        return _$257.reduce(stx$810, function (acc$811, stx$812) {
            if (stx$812.token.type === parser$258.Token.Delimiter) {
                var exposed$813 = stx$812.expose();
                var openParen$814 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$812.token.value[0],
                        range: stx$812.token.startRange,
                        sm_range: typeof stx$812.token.sm_startRange == 'undefined' ? stx$812.token.startRange : stx$812.token.sm_startRange,
                        lineNumber: stx$812.token.startLineNumber,
                        sm_lineNumber: typeof stx$812.token.sm_startLineNumber == 'undefined' ? stx$812.token.startLineNumber : stx$812.token.sm_startLineNumber,
                        lineStart: stx$812.token.startLineStart,
                        sm_lineStart: typeof stx$812.token.sm_startLineStart == 'undefined' ? stx$812.token.startLineStart : stx$812.token.sm_startLineStart
                    }, exposed$813);
                var closeParen$815 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$812.token.value[1],
                        range: stx$812.token.endRange,
                        sm_range: typeof stx$812.token.sm_endRange == 'undefined' ? stx$812.token.endRange : stx$812.token.sm_endRange,
                        lineNumber: stx$812.token.endLineNumber,
                        sm_lineNumber: typeof stx$812.token.sm_endLineNumber == 'undefined' ? stx$812.token.endLineNumber : stx$812.token.sm_endLineNumber,
                        lineStart: stx$812.token.endLineStart,
                        sm_lineStart: typeof stx$812.token.sm_endLineStart == 'undefined' ? stx$812.token.endLineStart : stx$812.token.sm_endLineStart
                    }, exposed$813);
                if (stx$812.token.leadingComments) {
                    openParen$814.token.leadingComments = stx$812.token.leadingComments;
                }
                if (stx$812.token.trailingComments) {
                    openParen$814.token.trailingComments = stx$812.token.trailingComments;
                }
                acc$811.push(openParen$814);
                push$387.apply(acc$811, flatten$453(exposed$813.token.inner));
                acc$811.push(closeParen$815);
                return acc$811;
            }
            stx$812.token.sm_lineNumber = stx$812.token.sm_lineNumber ? stx$812.token.sm_lineNumber : stx$812.token.lineNumber;
            stx$812.token.sm_lineStart = stx$812.token.sm_lineStart ? stx$812.token.sm_lineStart : stx$812.token.lineStart;
            stx$812.token.sm_range = stx$812.token.sm_range ? stx$812.token.sm_range : stx$812.token.range;
            acc$811.push(stx$812);
            return acc$811;
        }, []);
    }
    exports$256.enforest = enforest$441;
    exports$256.expand = expandTopLevel$452;
    exports$256.resolve = resolve$390;
    exports$256.get_expression = get_expression$443;
    exports$256.makeExpanderContext = makeExpanderContext$451;
    exports$256.Expr = Expr$402;
    exports$256.VariableStatement = VariableStatement$429;
    exports$256.tokensToSyntax = syn$259.tokensToSyntax;
    exports$256.syntaxToTokens = syn$259.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map