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
                var o$453 = Object.create(this);
                if (typeof o$453.construct === 'function') {
                    o$453.construct.apply(o$453, arguments);
                }
                return o$453;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$454) {
                var result$455 = Object.create(this);
                for (var prop$456 in properties$454) {
                    if (properties$454.hasOwnProperty(prop$456)) {
                        result$455[prop$456] = properties$454[prop$456];
                    }
                }
                return result$455;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$457) {
                function F$458() {
                }
                F$458.prototype = proto$457;
                return this instanceof F$458;
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
    function remdup$388(mark$459, mlist$460) {
        if (mark$459 === _$257.first(mlist$460)) {
            return _$257.rest(mlist$460, 1);
        }
        return [mark$459].concat(mlist$460);
    }
    // (CSyntax) -> [...Num]
    function marksof$389(ctx$461, stopName$462, originalName$463) {
        var mark$464, submarks$465;
        if (ctx$461 instanceof Mark$380) {
            mark$464 = ctx$461.mark;
            submarks$465 = marksof$389(ctx$461.context, stopName$462, originalName$463);
            return remdup$388(mark$464, submarks$465);
        }
        if (ctx$461 instanceof Def$381) {
            return marksof$389(ctx$461.context, stopName$462, originalName$463);
        }
        if (ctx$461 instanceof Rename$379) {
            if (stopName$462 === originalName$463 + '$' + ctx$461.name) {
                return [];
            }
            return marksof$389(ctx$461.context, stopName$462, originalName$463);
        }
        return [];
    }
    function resolve$390(stx$466) {
        return resolveCtx$394(stx$466.token.value, stx$466.context, [], []);
    }
    function arraysEqual$391(a$467, b$468) {
        if (a$467.length !== b$468.length) {
            return false;
        }
        for (var i$469 = 0; i$469 < a$467.length; i$469++) {
            if (a$467[i$469] !== b$468[i$469]) {
                return false;
            }
        }
        return true;
    }
    function renames$392(defctx$470, oldctx$471, originalName$472) {
        var acc$473 = oldctx$471;
        for (var i$474 = 0; i$474 < defctx$470.length; i$474++) {
            if (defctx$470[i$474].id.token.value === originalName$472) {
                acc$473 = new Rename$379(defctx$470[i$474].id, defctx$470[i$474].name, acc$473, defctx$470);
            }
        }
        return acc$473;
    }
    function unionEl$393(arr$475, el$476) {
        if (arr$475.indexOf(el$476) === -1) {
            var res$477 = arr$475.slice(0);
            res$477.push(el$476);
            return res$477;
        }
        return arr$475;
    }
    // (Syntax) -> String
    function resolveCtx$394(originalName$478, ctx$479, stop_spine$480, stop_branch$481) {
        if (ctx$479 instanceof Mark$380) {
            return resolveCtx$394(originalName$478, ctx$479.context, stop_spine$480, stop_branch$481);
        }
        if (ctx$479 instanceof Def$381) {
            if (stop_spine$480.indexOf(ctx$479.defctx) !== -1) {
                return resolveCtx$394(originalName$478, ctx$479.context, stop_spine$480, stop_branch$481);
            } else {
                return resolveCtx$394(originalName$478, renames$392(ctx$479.defctx, ctx$479.context, originalName$478), stop_spine$480, unionEl$393(stop_branch$481, ctx$479.defctx));
            }
        }
        if (ctx$479 instanceof Rename$379) {
            if (originalName$478 === ctx$479.id.token.value) {
                var idName$482 = resolveCtx$394(ctx$479.id.token.value, ctx$479.id.context, stop_branch$481, stop_branch$481);
                var subName$483 = resolveCtx$394(originalName$478, ctx$479.context, unionEl$393(stop_spine$480, ctx$479.def), stop_branch$481);
                if (idName$482 === subName$483) {
                    var idMarks$484 = marksof$389(ctx$479.id.context, originalName$478 + '$' + ctx$479.name, originalName$478);
                    var subMarks$485 = marksof$389(ctx$479.context, originalName$478 + '$' + ctx$479.name, originalName$478);
                    if (arraysEqual$391(idMarks$484, subMarks$485)) {
                        return originalName$478 + '$' + ctx$479.name;
                    }
                }
            }
            return resolveCtx$394(originalName$478, ctx$479.context, stop_spine$480, stop_branch$481);
        }
        return originalName$478;
    }
    var nextFresh$395 = 0;
    // fun () -> Num
    function fresh$396() {
        return nextFresh$395++;
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$397(towrap$486, delimSyntax$487) {
        assert$265(delimSyntax$487.token.type === parser$258.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$382({
            type: parser$258.Token.Delimiter,
            value: delimSyntax$487.token.value,
            inner: towrap$486,
            range: delimSyntax$487.token.range,
            startLineNumber: delimSyntax$487.token.startLineNumber,
            lineStart: delimSyntax$487.token.lineStart
        }, delimSyntax$487);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$398(argSyntax$488) {
        if (argSyntax$488.token.type === parser$258.Token.Delimiter) {
            return _$257.filter(argSyntax$488.token.inner, function (stx$489) {
                return stx$489.token.value !== ',';
            });
        } else if (argSyntax$488.token.type === parser$258.Token.Identifier) {
            return [argSyntax$488];
        } else {
            assert$265(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$399 = {
            destruct: function () {
                return _$257.reduce(this.properties, _$257.bind(function (acc$490, prop$491) {
                    if (this[prop$491] && this[prop$491].hasPrototype(TermTree$399)) {
                        push$387.apply(acc$490, this[prop$491].destruct());
                        return acc$490;
                    } else if (this[prop$491] && this[prop$491].token && this[prop$491].token.inner) {
                        var clone$492 = syntaxFromToken$382(_$257.clone(this[prop$491].token), this[prop$491]);
                        clone$492.token.inner = _$257.reduce(clone$492.token.inner, function (acc$493, t$494) {
                            if (t$494.hasPrototype(TermTree$399)) {
                                push$387.apply(acc$493, t$494.destruct());
                                return acc$493;
                            }
                            acc$493.push(t$494);
                            return acc$493;
                        }, []);
                        acc$490.push(clone$492);
                        return acc$490;
                    } else if (Array.isArray(this[prop$491])) {
                        var destArr$495 = _$257.reduce(this[prop$491], function (acc$496, t$497) {
                                if (t$497.hasPrototype(TermTree$399)) {
                                    push$387.apply(acc$496, t$497.destruct());
                                    return acc$496;
                                }
                                acc$496.push(t$497);
                                return acc$496;
                            }, []);
                        push$387.apply(acc$490, destArr$495);
                        return acc$490;
                    } else if (this[prop$491]) {
                        acc$490.push(this[prop$491]);
                        return acc$490;
                    } else {
                        return acc$490;
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
                var commas$550 = this.commas.slice();
                var delim$551 = syntaxFromToken$382(_$257.clone(this.delim.token), this.delim);
                delim$551.token.inner = _$257.reduce(this.args, function (acc$553, term$554) {
                    assert$265(term$554 && term$554.hasPrototype(TermTree$399), 'expecting term trees in destruct of Call');
                    push$387.apply(acc$553, term$554.destruct());
                    // add all commas except for the last one
                    if (commas$550.length > 0) {
                        acc$553.push(commas$550.shift());
                    }
                    return acc$553;
                }, []);
                var res$552 = this.fun.destruct();
                push$387.apply(res$552, Delimiter$416.create(delim$551).destruct());
                return res$552;
            },
            construct: function (funn$555, args$556, delim$557, commas$558) {
                assert$265(Array.isArray(args$556), 'requires an array of arguments terms');
                this.fun = funn$555;
                this.args = args$556;
                this.delim = delim$557;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$558;
            }
        });
    var ObjDotGet$426 = Expr$402.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$559, dot$560, right$561) {
                this.left = left$559;
                this.dot = dot$560;
                this.right = right$561;
            }
        });
    var ObjGet$427 = Expr$402.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$562, right$563) {
                this.left = left$562;
                this.right = right$563;
            }
        });
    var VariableDeclaration$428 = TermTree$399.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$564, eqstx$565, init$566, comma$567) {
                this.ident = ident$564;
                this.eqstx = eqstx$565;
                this.init = init$566;
                this.comma = comma$567;
            }
        });
    var VariableStatement$429 = Statement$401.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$257.reduce(this.decls, function (acc$568, decl$569) {
                    push$387.apply(acc$568, decl$569.destruct());
                    return acc$568;
                }, []));
            },
            construct: function (varkw$570, decls$571) {
                assert$265(Array.isArray(decls$571), 'decls must be an array');
                this.varkw = varkw$570;
                this.decls = decls$571;
            }
        });
    var LetStatement$430 = Statement$401.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$257.reduce(this.decls, function (acc$572, decl$573) {
                    push$387.apply(acc$572, decl$573.destruct());
                    return acc$572;
                }, []));
            },
            construct: function (letkw$574, decls$575) {
                assert$265(Array.isArray(decls$575), 'decls must be an array');
                this.letkw = letkw$574;
                this.decls = decls$575;
            }
        });
    var ConstStatement$431 = Statement$401.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$257.reduce(this.decls, function (acc$576, decl$577) {
                    push$387.apply(acc$576, decl$577.destruct());
                    return acc$576;
                }, []));
            },
            construct: function (constkw$578, decls$579) {
                assert$265(Array.isArray(decls$579), 'decls must be an array');
                this.constkw = constkw$578;
                this.decls = decls$579;
            }
        });
    var CatchClause$432 = Statement$401.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$580, params$581, body$582) {
                this.catchkw = catchkw$580;
                this.params = params$581;
                this.body = body$582;
            }
        });
    var Module$433 = TermTree$399.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$583) {
                this.body = body$583;
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
            construct: function (name$584) {
                this.name = name$584;
            }
        });
    var ForStatement$436 = Statement$401.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$585, cond$586) {
                this.forkw = forkw$585;
                this.cond = cond$586;
            }
        });
    function stxIsUnaryOp$437(stx$587) {
        var staticOperators$588 = [
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
        return _$257.contains(staticOperators$588, unwrapSyntax$267(stx$587));
    }
    function stxIsBinOp$438(stx$589) {
        var staticOperators$590 = [
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
        return _$257.contains(staticOperators$590, unwrapSyntax$267(stx$589));
    }
    function enforestVarStatement$439(stx$591, context$592, varStx$593) {
        var isLet$594 = /^(?:let|const)$/.test(varStx$593.token.value);
        var decls$595 = [];
        var rest$596 = stx$591;
        var rhs$597;
        if (!rest$596.length) {
            throwSyntaxError$266('enforest', 'Unexpected end of input', varStx$593);
        }
        while (rest$596.length) {
            if (rest$596[0].token.type === parser$258.Token.Identifier) {
                if (isLet$594) {
                    var freshName$598 = fresh$396();
                    var renamedId$599 = rest$596[0].rename(rest$596[0], freshName$598);
                    rest$596 = rest$596.map(function (stx$600) {
                        return stx$600.rename(rest$596[0], freshName$598);
                    });
                    rest$596[0] = renamedId$599;
                }
                if (rest$596[1].token.type === parser$258.Token.Punctuator && rest$596[1].token.value === '=') {
                    rhs$597 = get_expression$442(rest$596.slice(2), context$592);
                    if (rhs$597.result == null) {
                        throwSyntaxError$266('enforest', 'Unexpected token', rhs$597.rest[0]);
                    }
                    if (rhs$597.rest[0].token.type === parser$258.Token.Punctuator && rhs$597.rest[0].token.value === ',') {
                        decls$595.push(VariableDeclaration$428.create(rest$596[0], rest$596[1], rhs$597.result, rhs$597.rest[0]));
                        rest$596 = rhs$597.rest.slice(1);
                        continue;
                    } else {
                        decls$595.push(VariableDeclaration$428.create(rest$596[0], rest$596[1], rhs$597.result, null));
                        rest$596 = rhs$597.rest;
                        break;
                    }
                } else if (rest$596[1].token.type === parser$258.Token.Punctuator && rest$596[1].token.value === ',') {
                    decls$595.push(VariableDeclaration$428.create(rest$596[0], null, null, rest$596[1]));
                    rest$596 = rest$596.slice(2);
                } else {
                    decls$595.push(VariableDeclaration$428.create(rest$596[0], null, null, null));
                    rest$596 = rest$596.slice(1);
                    break;
                }
            } else {
                throwSyntaxError$266('enforest', 'Unexpected token', rest$596[0]);
            }
        }
        return {
            result: decls$595,
            rest: rest$596
        };
    }
    function adjustLineContext$440(stx$601, original$602, current$603) {
        current$603 = current$603 || {
            lastLineNumber: original$602.token.lineNumber,
            lineNumber: original$602.token.lineNumber - 1
        };
        return _$257.map(stx$601, function (stx$604) {
            if (stx$604.token.type === parser$258.Token.Delimiter) {
                // handle tokens with missing line info
                stx$604.token.startLineNumber = typeof stx$604.token.startLineNumber == 'undefined' ? original$602.token.lineNumber : stx$604.token.startLineNumber;
                stx$604.token.endLineNumber = typeof stx$604.token.endLineNumber == 'undefined' ? original$602.token.lineNumber : stx$604.token.endLineNumber;
                stx$604.token.startLineStart = typeof stx$604.token.startLineStart == 'undefined' ? original$602.token.lineStart : stx$604.token.startLineStart;
                stx$604.token.endLineStart = typeof stx$604.token.endLineStart == 'undefined' ? original$602.token.lineStart : stx$604.token.endLineStart;
                stx$604.token.startRange = typeof stx$604.token.startRange == 'undefined' ? original$602.token.range : stx$604.token.startRange;
                stx$604.token.endRange = typeof stx$604.token.endRange == 'undefined' ? original$602.token.range : stx$604.token.endRange;
                stx$604.token.sm_startLineNumber = typeof stx$604.token.sm_startLineNumber == 'undefined' ? stx$604.token.startLineNumber : stx$604.token.sm_startLineNumber;
                stx$604.token.sm_endLineNumber = typeof stx$604.token.sm_endLineNumber == 'undefined' ? stx$604.token.endLineNumber : stx$604.token.sm_endLineNumber;
                stx$604.token.sm_startLineStart = typeof stx$604.token.sm_startLineStart == 'undefined' ? stx$604.token.startLineStart : stx$604.token.sm_startLineStart;
                stx$604.token.sm_endLineStart = typeof stx$604.token.sm_endLineStart == 'undefined' ? stx$604.token.endLineStart : stx$604.token.sm_endLineStart;
                stx$604.token.sm_startRange = typeof stx$604.token.sm_startRange == 'undefined' ? stx$604.token.startRange : stx$604.token.sm_startRange;
                stx$604.token.sm_endRange = typeof stx$604.token.sm_endRange == 'undefined' ? stx$604.token.endRange : stx$604.token.sm_endRange;
                if (stx$604.token.startLineNumber === current$603.lastLineNumber && current$603.lastLineNumber !== current$603.lineNumber) {
                    stx$604.token.startLineNumber = current$603.lineNumber;
                } else if (stx$604.token.startLineNumber !== current$603.lastLineNumber) {
                    current$603.lineNumber++;
                    current$603.lastLineNumber = stx$604.token.startLineNumber;
                    stx$604.token.startLineNumber = current$603.lineNumber;
                }
                if (stx$604.token.inner.length > 0) {
                    stx$604.token.inner = adjustLineContext$440(stx$604.token.inner, original$602, current$603);
                }
                return stx$604;
            }
            // handle tokens with missing line info
            stx$604.token.lineNumber = typeof stx$604.token.lineNumber == 'undefined' ? original$602.token.lineNumber : stx$604.token.lineNumber;
            stx$604.token.lineStart = typeof stx$604.token.lineStart == 'undefined' ? original$602.token.lineStart : stx$604.token.lineStart;
            stx$604.token.range = typeof stx$604.token.range == 'undefined' ? original$602.token.range : stx$604.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$604.token.sm_lineNumber = typeof stx$604.token.sm_lineNumber == 'undefined' ? stx$604.token.lineNumber : stx$604.token.sm_lineNumber;
            stx$604.token.sm_lineStart = typeof stx$604.token.sm_lineStart == 'undefined' ? stx$604.token.lineStart : stx$604.token.sm_lineStart;
            stx$604.token.sm_range = typeof stx$604.token.sm_range == 'undefined' ? _$257.clone(stx$604.token.range) : stx$604.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$604.token.lineNumber === current$603.lastLineNumber && current$603.lastLineNumber !== current$603.lineNumber) {
                stx$604.token.lineNumber = current$603.lineNumber;
            } else if (stx$604.token.lineNumber !== current$603.lastLineNumber) {
                current$603.lineNumber++;
                current$603.lastLineNumber = stx$604.token.lineNumber;
                stx$604.token.lineNumber = current$603.lineNumber;
            }
            return stx$604;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$441(toks$605, context$606, prevStx$607, prevTerms$608) {
        assert$265(toks$605.length > 0, 'enforest assumes there are tokens to work with');
        prevStx$607 = prevStx$607 || [];
        prevTerms$608 = prevTerms$608 || [];
        function step$609(head$610, rest$611) {
            var innerTokens$612;
            assert$265(Array.isArray(rest$611), 'result must at least be an empty array');
            if (head$610.hasPrototype(TermTree$399)) {
                // function call
                var emp$615 = head$610.emp;
                var emp$615 = head$610.emp;
                var keyword$618 = head$610.keyword;
                var delim$620 = head$610.delim;
                var id$622 = head$610.id;
                var delim$620 = head$610.delim;
                var emp$615 = head$610.emp;
                var punc$626 = head$610.punc;
                var keyword$618 = head$610.keyword;
                var emp$615 = head$610.emp;
                var emp$615 = head$610.emp;
                var emp$615 = head$610.emp;
                var delim$620 = head$610.delim;
                var delim$620 = head$610.delim;
                var id$622 = head$610.id;
                var keyword$618 = head$610.keyword;
                var keyword$618 = head$610.keyword;
                var keyword$618 = head$610.keyword;
                var keyword$618 = head$610.keyword;
                var keyword$618 = head$610.keyword;
                if (head$610.hasPrototype(Expr$402) && rest$611[0] && rest$611[0].token.type === parser$258.Token.Delimiter && rest$611[0].token.value === '()') {
                    var argRes$661, enforestedArgs$662 = [], commas$663 = [];
                    rest$611[0].expose();
                    innerTokens$612 = rest$611[0].token.inner;
                    while (innerTokens$612.length > 0) {
                        argRes$661 = enforest$441(innerTokens$612, context$606);
                        enforestedArgs$662.push(argRes$661.result);
                        innerTokens$612 = argRes$661.rest;
                        if (innerTokens$612[0] && innerTokens$612[0].token.value === ',') {
                            // record the comma for later
                            commas$663.push(innerTokens$612[0]);
                            // but dump it for the next loop turn
                            innerTokens$612 = innerTokens$612.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$664 = _$257.all(enforestedArgs$662, function (argTerm$665) {
                            return argTerm$665.hasPrototype(Expr$402);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$612.length === 0 && argsAreExprs$664) {
                        return step$609(Call$425.create(head$610, enforestedArgs$662, rest$611[0], commas$663), rest$611.slice(1));
                    }
                } else if (head$610.hasPrototype(Expr$402) && rest$611[0] && unwrapSyntax$267(rest$611[0]) === '?') {
                    var question$666 = rest$611[0];
                    var condRes$667 = enforest$441(rest$611.slice(1), context$606);
                    var truExpr$668 = condRes$667.result;
                    var condRight$669 = condRes$667.rest;
                    if (truExpr$668.hasPrototype(Expr$402) && condRight$669[0] && unwrapSyntax$267(condRight$669[0]) === ':') {
                        var colon$670 = condRight$669[0];
                        var flsRes$671 = enforest$441(condRight$669.slice(1), context$606);
                        var flsExpr$672 = flsRes$671.result;
                        if (flsExpr$672.hasPrototype(Expr$402)) {
                            return step$609(ConditionalExpression$413.create(head$610, question$666, truExpr$668, colon$670, flsExpr$672), flsRes$671.rest);
                        }
                    }
                } else if (head$610.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$618) === 'new' && rest$611[0]) {
                    var newCallRes$673 = enforest$441(rest$611, context$606);
                    if (newCallRes$673.result.hasPrototype(Call$425)) {
                        return step$609(Const$424.create(head$610, newCallRes$673.result), newCallRes$673.rest);
                    }
                } else if (head$610.hasPrototype(Delimiter$416) && delim$620.token.value === '()' && rest$611[0] && rest$611[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$611[0]) === '=>') {
                    var arrowRes$674 = enforest$441(rest$611.slice(1), context$606);
                    if (arrowRes$674.result.hasPrototype(Expr$402)) {
                        return step$609(ArrowFun$420.create(delim$620, rest$611[0], arrowRes$674.result.destruct()), arrowRes$674.rest);
                    } else {
                        throwSyntaxError$266('enforest', 'Body of arrow function must be an expression', rest$611.slice(1));
                    }
                } else if (head$610.hasPrototype(Id$417) && rest$611[0] && rest$611[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$611[0]) === '=>') {
                    var res$675 = enforest$441(rest$611.slice(1), context$606);
                    if (res$675.result.hasPrototype(Expr$402)) {
                        return step$609(ArrowFun$420.create(id$622, rest$611[0], res$675.result.destruct()), res$675.rest);
                    } else {
                        throwSyntaxError$266('enforest', 'Body of arrow function must be an expression', rest$611.slice(1));
                    }
                } else if (head$610.hasPrototype(Delimiter$416) && delim$620.token.value === '()') {
                    innerTokens$612 = delim$620.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$612.length === 0) {
                        return step$609(ParenExpression$409.create(head$610), rest$611);
                    } else {
                        var innerTerm$676 = get_expression$442(innerTokens$612, context$606);
                        if (innerTerm$676.result && innerTerm$676.result.hasPrototype(Expr$402)) {
                            return step$609(ParenExpression$409.create(head$610), rest$611);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$610.hasPrototype(Expr$402) && rest$611[0] && rest$611[1] && stxIsBinOp$438(rest$611[0])) {
                    var op$677 = rest$611[0];
                    var left$678 = head$610;
                    var rightStx$679 = rest$611.slice(1);
                    var bopPrevStx$680 = [rest$611[0]].concat(head$610.destruct().reverse(), prevStx$607);
                    var bopPrevTerms$681 = [
                            Punc$415.create(rest$611[0]),
                            head$610
                        ].concat(prevTerms$608);
                    var bopRes$682 = enforest$441(rightStx$679, context$606, bopPrevStx$680, bopPrevTerms$681);
                    // Lookbehind was matched, so it may not even be a binop anymore.
                    if (bopRes$682.prevTerms.length < bopPrevTerms$681.length) {
                        return bopRes$682;
                    }
                    var right$683 = bopRes$682.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$683.hasPrototype(Expr$402)) {
                        return step$609(BinOp$412.create(op$677, left$678, right$683), bopRes$682.rest);
                    }
                } else if (head$610.hasPrototype(Punc$415) && stxIsUnaryOp$437(punc$626)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$610.punc.term = head$610;
                    var unopPrevStx$684 = [punc$626].concat(prevStx$607);
                    var unopPrevTerms$685 = [head$610].concat(prevTerms$608);
                    var unopRes$686 = enforest$441(rest$611, context$606, unopPrevStx$684, unopPrevTerms$685);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopRes$686.prevTerms.length < unopPrevTerms$685.length) {
                        return unopRes$686;
                    }
                    if (unopRes$686.result.hasPrototype(Expr$402)) {
                        return step$609(UnaryOp$410.create(punc$626, unopRes$686.result), unopRes$686.rest);
                    }
                } else if (head$610.hasPrototype(Keyword$414) && stxIsUnaryOp$437(keyword$618)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$610.keyword.term = head$610;
                    var unopKeyPrevStx$687 = [keyword$618].concat(prevStx$607);
                    var unopKeyPrevTerms$688 = [head$610].concat(prevTerms$608);
                    var unopKeyres$689 = enforest$441(rest$611, context$606, unopKeyPrevStx$687, unopKeyPrevTerms$688);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopKeyres$689.prevTerms.length < unopKeyPrevTerms$688.length) {
                        return unopKeyres$689;
                    }
                    if (unopKeyres$689.result.hasPrototype(Expr$402)) {
                        return step$609(UnaryOp$410.create(keyword$618, unopKeyres$689.result), unopKeyres$689.rest);
                    }
                } else if (head$610.hasPrototype(Expr$402) && rest$611[0] && (unwrapSyntax$267(rest$611[0]) === '++' || unwrapSyntax$267(rest$611[0]) === '--')) {
                    return step$609(PostfixOp$411.create(head$610, rest$611[0]), rest$611.slice(1));
                } else if (head$610.hasPrototype(Expr$402) && rest$611[0] && rest$611[0].token.value === '[]') {
                    return step$609(ObjGet$427.create(head$610, Delimiter$416.create(rest$611[0].expose())), rest$611.slice(1));
                } else if (head$610.hasPrototype(Expr$402) && rest$611[0] && unwrapSyntax$267(rest$611[0]) === '.' && rest$611[1] && rest$611[1].token.type === parser$258.Token.Identifier) {
                    return step$609(ObjDotGet$426.create(head$610, rest$611[0], rest$611[1]), rest$611.slice(2));
                } else if (head$610.hasPrototype(Delimiter$416) && delim$620.token.value === '[]') {
                    return step$609(ArrayLiteral$408.create(head$610), rest$611);
                } else if (head$610.hasPrototype(Delimiter$416) && head$610.delim.token.value === '{}') {
                    return step$609(Block$407.create(head$610), rest$611);
                } else if (head$610.hasPrototype(Id$417) && unwrapSyntax$267(id$622) === '#quoteSyntax' && rest$611[0] && rest$611[0].token.value === '{}') {
                    var tempId$690 = fresh$396();
                    context$606.templateMap.set(tempId$690, rest$611[0].token.inner);
                    return step$609(syn$259.makeIdent('getTemplate', id$622), [syn$259.makeDelim('()', [syn$259.makeValue(tempId$690, id$622)], id$622)].concat(rest$611.slice(1)));
                } else if (head$610.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$618) === 'let' && (rest$611[0] && rest$611[0].token.type === parser$258.Token.Identifier || rest$611[0] && rest$611[0].token.type === parser$258.Token.Keyword || rest$611[0] && rest$611[0].token.type === parser$258.Token.Punctuator) && rest$611[1] && unwrapSyntax$267(rest$611[1]) === '=' && rest$611[2] && rest$611[2].token.value === 'macro') {
                    var mac$691 = enforest$441(rest$611.slice(2), context$606);
                    if (!mac$691.result.hasPrototype(AnonMacro$423)) {
                        throwSyntaxError$266('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$611.slice(2));
                    }
                    return step$609(LetMacro$421.create(rest$611[0], mac$691.result.body), mac$691.rest);
                } else if (head$610.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$618) === 'var' && rest$611[0]) {
                    var vsRes$692 = enforestVarStatement$439(rest$611, context$606, keyword$618);
                    if (vsRes$692) {
                        return step$609(VariableStatement$429.create(head$610, vsRes$692.result), vsRes$692.rest);
                    }
                } else if (head$610.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$618) === 'let' && rest$611[0]) {
                    var lsRes$693 = enforestVarStatement$439(rest$611, context$606, keyword$618);
                    if (lsRes$693) {
                        return step$609(LetStatement$430.create(head$610, lsRes$693.result), lsRes$693.rest);
                    }
                } else if (head$610.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$618) === 'const' && rest$611[0]) {
                    var csRes$694 = enforestVarStatement$439(rest$611, context$606, keyword$618);
                    if (csRes$694) {
                        return step$609(ConstStatement$431.create(head$610, csRes$694.result), csRes$694.rest);
                    }
                } else if (head$610.hasPrototype(Keyword$414) && unwrapSyntax$267(keyword$618) === 'for' && rest$611[0] && rest$611[0].token.value === '()') {
                    return step$609(ForStatement$436.create(keyword$618, rest$611[0]), rest$611.slice(1));
                }
            } else {
                assert$265(head$610 && head$610.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$610.token.type === parser$258.Token.Identifier || head$610.token.type === parser$258.Token.Keyword || head$610.token.type === parser$258.Token.Punctuator) && expandCount$385 < maxExpands$386 && context$606.env.has(resolve$390(head$610))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$695 = fresh$396();
                    var transformerContext$696 = makeExpanderContext$450(_$257.defaults({ mark: newMark$695 }, context$606));
                    // pull the macro transformer out the environment
                    var macroObj$697 = context$606.env.get(resolve$390(head$610));
                    var transformer$698 = macroObj$697.fn;
                    if (!builtinMode$384 && !macroObj$697.builtin) {
                        expandCount$385++;
                    }
                    // apply the transformer
                    var rt$699;
                    try {
                        rt$699 = transformer$698([head$610].concat(rest$611), transformerContext$696, prevStx$607, prevTerms$608);
                    } catch (e$700) {
                        if (e$700.type && e$700.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$701 = '`' + rest$611.slice(0, 5).map(function (stx$702) {
                                    return stx$702.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$266('macro', 'Macro `' + head$610.token.value + '` could not be matched with ' + argumentString$701, head$610);
                        } else {
                            // just rethrow it
                            throw e$700;
                        }
                    }
                    if (rt$699.prevTerms) {
                        prevTerms$608 = rt$699.prevTerms;
                    }
                    if (rt$699.prevStx) {
                        prevStx$607 = rt$699.prevStx;
                    }
                    if (!Array.isArray(rt$699.result)) {
                        throwSyntaxError$266('enforest', 'Macro must return a syntax array', head$610);
                    }
                    if (rt$699.result.length > 0) {
                        var adjustedResult$703 = adjustLineContext$440(rt$699.result, head$610);
                        adjustedResult$703[0].token.leadingComments = head$610.token.leadingComments;
                        return step$609(adjustedResult$703[0], adjustedResult$703.slice(1).concat(rt$699.rest));
                    } else {
                        return step$609(Empty$434.create(), rt$699.rest);
                    }
                }    // anon macro definition
                else if (head$610.token.type === parser$258.Token.Identifier && head$610.token.value === 'macro' && rest$611[0] && rest$611[0].token.value === '{}') {
                    return step$609(AnonMacro$423.create(rest$611[0].expose().token.inner), rest$611.slice(1));
                }    // macro definition
                else if (head$610.token.type === parser$258.Token.Identifier && head$610.token.value === 'macro' && rest$611[0] && (rest$611[0].token.type === parser$258.Token.Identifier || rest$611[0].token.type === parser$258.Token.Keyword || rest$611[0].token.type === parser$258.Token.Punctuator) && rest$611[1] && rest$611[1].token.type === parser$258.Token.Delimiter && rest$611[1].token.value === '{}') {
                    return step$609(Macro$422.create(rest$611[0], rest$611[1].expose().token.inner), rest$611.slice(2));
                }    // module definition
                else if (unwrapSyntax$267(head$610) === 'module' && rest$611[0] && rest$611[0].token.value === '{}') {
                    return step$609(Module$433.create(rest$611[0]), rest$611.slice(1));
                }    // function definition
                else if (head$610.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$610) === 'function' && rest$611[0] && rest$611[0].token.type === parser$258.Token.Identifier && rest$611[1] && rest$611[1].token.type === parser$258.Token.Delimiter && rest$611[1].token.value === '()' && rest$611[2] && rest$611[2].token.type === parser$258.Token.Delimiter && rest$611[2].token.value === '{}') {
                    rest$611[1].token.inner = rest$611[1].expose().token.inner;
                    rest$611[2].token.inner = rest$611[2].expose().token.inner;
                    return step$609(NamedFun$418.create(head$610, null, rest$611[0], rest$611[1], rest$611[2]), rest$611.slice(3));
                }    // generator function definition
                else if (head$610.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$610) === 'function' && rest$611[0] && rest$611[0].token.type === parser$258.Token.Punctuator && rest$611[0].token.value === '*' && rest$611[1] && rest$611[1].token.type === parser$258.Token.Identifier && rest$611[2] && rest$611[2].token.type === parser$258.Token.Delimiter && rest$611[2].token.value === '()' && rest$611[3] && rest$611[3].token.type === parser$258.Token.Delimiter && rest$611[3].token.value === '{}') {
                    rest$611[2].token.inner = rest$611[2].expose().token.inner;
                    rest$611[3].token.inner = rest$611[3].expose().token.inner;
                    return step$609(NamedFun$418.create(head$610, rest$611[0], rest$611[1], rest$611[2], rest$611[3]), rest$611.slice(4));
                }    // anonymous function definition
                else if (head$610.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$610) === 'function' && rest$611[0] && rest$611[0].token.type === parser$258.Token.Delimiter && rest$611[0].token.value === '()' && rest$611[1] && rest$611[1].token.type === parser$258.Token.Delimiter && rest$611[1].token.value === '{}') {
                    rest$611[0].token.inner = rest$611[0].expose().token.inner;
                    rest$611[1].token.inner = rest$611[1].expose().token.inner;
                    return step$609(AnonFun$419.create(head$610, null, rest$611[0], rest$611[1]), rest$611.slice(2));
                }    // anonymous generator function definition
                else if (head$610.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$610) === 'function' && rest$611[0] && rest$611[0].token.type === parser$258.Token.Punctuator && rest$611[0].token.value === '*' && rest$611[1] && rest$611[1].token.type === parser$258.Token.Delimiter && rest$611[1].token.value === '()' && rest$611[2] && rest$611[2].token.type === parser$258.Token.Delimiter && rest$611[2].token.value === '{}') {
                    rest$611[1].token.inner = rest$611[1].expose().token.inner;
                    rest$611[2].token.inner = rest$611[2].expose().token.inner;
                    return step$609(AnonFun$419.create(head$610, rest$611[0], rest$611[1], rest$611[2]), rest$611.slice(3));
                }    // arrow function
                else if ((head$610.token.type === parser$258.Token.Delimiter && head$610.token.value === '()' || head$610.token.type === parser$258.Token.Identifier) && rest$611[0] && rest$611[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$611[0]) === '=>' && rest$611[1] && rest$611[1].token.type === parser$258.Token.Delimiter && rest$611[1].token.value === '{}') {
                    return step$609(ArrowFun$420.create(head$610, rest$611[0], rest$611[1]), rest$611.slice(2));
                }    // catch statement
                else if (head$610.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$610) === 'catch' && rest$611[0] && rest$611[0].token.type === parser$258.Token.Delimiter && rest$611[0].token.value === '()' && rest$611[1] && rest$611[1].token.type === parser$258.Token.Delimiter && rest$611[1].token.value === '{}') {
                    rest$611[0].token.inner = rest$611[0].expose().token.inner;
                    rest$611[1].token.inner = rest$611[1].expose().token.inner;
                    return step$609(CatchClause$432.create(head$610, rest$611[0], rest$611[1]), rest$611.slice(2));
                }    // this expression
                else if (head$610.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$610) === 'this') {
                    return step$609(ThisExpression$404.create(head$610), rest$611);
                }    // literal
                else if (head$610.token.type === parser$258.Token.NumericLiteral || head$610.token.type === parser$258.Token.StringLiteral || head$610.token.type === parser$258.Token.BooleanLiteral || head$610.token.type === parser$258.Token.RegularExpression || head$610.token.type === parser$258.Token.NullLiteral) {
                    return step$609(Lit$405.create(head$610), rest$611);
                }    // export
                else if (head$610.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$610) === 'export' && rest$611[0] && (rest$611[0].token.type === parser$258.Token.Identifier || rest$611[0].token.type === parser$258.Token.Keyword || rest$611[0].token.type === parser$258.Token.Punctuator)) {
                    return step$609(Export$435.create(rest$611[0]), rest$611.slice(1));
                }    // identifier
                else if (head$610.token.type === parser$258.Token.Identifier) {
                    return step$609(Id$417.create(head$610), rest$611);
                }    // punctuator
                else if (head$610.token.type === parser$258.Token.Punctuator) {
                    return step$609(Punc$415.create(head$610), rest$611);
                } else if (head$610.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$610) === 'with') {
                    throwSyntaxError$266('enforest', 'with is not supported in sweet.js', head$610);
                }    // keyword
                else if (head$610.token.type === parser$258.Token.Keyword) {
                    return step$609(Keyword$414.create(head$610), rest$611);
                }    // Delimiter
                else if (head$610.token.type === parser$258.Token.Delimiter) {
                    return step$609(Delimiter$416.create(head$610.expose()), rest$611);
                }    // end of file
                else if (head$610.token.type === parser$258.Token.EOF) {
                    assert$265(rest$611.length === 0, 'nothing should be after an EOF');
                    return step$609(EOF$400.create(head$610), []);
                } else {
                    // todo: are we missing cases?
                    assert$265(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$610,
                rest: rest$611,
                prevStx: prevStx$607,
                prevTerms: prevTerms$608
            };
        }
        return step$609(toks$605[0], toks$605.slice(1));
    }
    function get_expression$442(stx$704, context$705) {
        var res$706 = enforest$441(stx$704, context$705);
        var next$707 = res$706;
        var peek$708;
        var prevStx$709;
        if (!next$707.result.hasPrototype(Expr$402)) {
            return {
                result: null,
                rest: stx$704
            };
        }
        while (next$707.rest.length) {
            // Enforest the next term tree since it might be an infix macro that
            // consumes the initial expression.
            peek$708 = enforest$441(next$707.rest, context$705, next$707.result.destruct(), [next$707.result]);
            // If it has prev terms it wasn't infix, but it we need to run it
            // through enforest together with the initial expression to see if
            // it extends it into a longer expression.
            if (peek$708.prevTerms.length === 1) {
                peek$708 = enforest$441([next$707.result].concat(peek$708.result.destruct(), peek$708.rest), context$705);
            }
            // No new expression was created, so we've reached the end.
            if (peek$708.result === next$707.result) {
                break;
            }
            // A new expression was created, so loop back around and keep going.
            next$707 = peek$708;
        }
        return next$707;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$443(newMark$710, env$711) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$712(match$713) {
            if (match$713.level === 0) {
                // replace the match property with the marked syntax
                match$713.match = _$257.map(match$713.match, function (stx$714) {
                    return stx$714.mark(newMark$710);
                });
            } else {
                _$257.each(match$713.match, function (match$715) {
                    dfs$712(match$715);
                });
            }
        }
        _$257.keys(env$711).forEach(function (key$716) {
            dfs$712(env$711[key$716]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$444(mac$717, context$718) {
        var body$719 = mac$717.body;
        // raw function primitive form
        if (!(body$719[0] && body$719[0].token.type === parser$258.Token.Keyword && body$719[0].token.value === 'function')) {
            throwSyntaxError$266('load macro', 'Primitive macro form must contain a function for the macro body', body$719);
        }
        var stub$720 = parser$258.read('()');
        stub$720[0].token.inner = body$719;
        var expanded$721 = expand$449(stub$720, context$718);
        expanded$721 = expanded$721[0].destruct().concat(expanded$721[1].eof);
        var flattend$722 = flatten$452(expanded$721);
        var bodyCode$723 = codegen$264.generate(parser$258.parse(flattend$722));
        var macroFn$724 = scopedEval$378(bodyCode$723, {
                makeValue: syn$259.makeValue,
                makeRegex: syn$259.makeRegex,
                makeIdent: syn$259.makeIdent,
                makeKeyword: syn$259.makeKeyword,
                makePunc: syn$259.makePunc,
                makeDelim: syn$259.makeDelim,
                getExpr: function (stx$725) {
                    var r$726;
                    if (stx$725.length === 0) {
                        return {
                            success: false,
                            result: [],
                            rest: []
                        };
                    }
                    r$726 = get_expression$442(stx$725, context$718);
                    return {
                        success: r$726.result !== null,
                        result: r$726.result === null ? [] : r$726.result.destruct(),
                        rest: r$726.rest
                    };
                },
                getIdent: function (stx$727) {
                    if (stx$727[0] && stx$727[0].token.type === parser$258.Token.Identifier) {
                        return {
                            success: true,
                            result: [stx$727[0]],
                            rest: stx$727.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$727
                    };
                },
                getLit: function (stx$728) {
                    if (stx$728[0] && patternModule$262.typeIsLiteral(stx$728[0].token.type)) {
                        return {
                            success: true,
                            result: [stx$728[0]],
                            rest: stx$728.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$728
                    };
                },
                unwrapSyntax: syn$259.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$266,
                prettyPrint: syn$259.prettyPrint,
                parser: parser$258,
                __fresh: fresh$396,
                _: _$257,
                patternModule: patternModule$262,
                getTemplate: function (id$729) {
                    return cloneSyntaxArray$445(context$718.templateMap.get(id$729));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$443,
                mergeMatches: function (newMatch$730, oldMatch$731) {
                    newMatch$730.patternEnv = _$257.extend({}, oldMatch$731.patternEnv, newMatch$730.patternEnv);
                    return newMatch$730;
                }
            });
        return macroFn$724;
    }
    function cloneSyntaxArray$445(arr$732) {
        return arr$732.map(function (stx$733) {
            var o$734 = syntaxFromToken$382(_$257.clone(stx$733.token), stx$733);
            if (o$734.token.type === parser$258.Token.Delimiter) {
                o$734.token.inner = cloneSyntaxArray$445(o$734.token.inner);
            }
            return o$734;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$446(stx$735, context$736, prevStx$737, prevTerms$738) {
        assert$265(context$736, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$735.length === 0) {
            return {
                terms: prevTerms$738 ? prevTerms$738.reverse() : [],
                context: context$736
            };
        }
        assert$265(stx$735[0].token, 'expecting a syntax object');
        var f$739 = enforest$441(stx$735, context$736, prevStx$737, prevTerms$738);
        // head :: TermTree
        var head$740 = f$739.result;
        // rest :: [Syntax]
        var rest$741 = f$739.rest;
        var macroDefinition$742;
        if (head$740.hasPrototype(Macro$422) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$742 = loadMacroDef$444(head$740, context$736);
            addToDefinitionCtx$447([head$740.name], context$736.defscope, false);
            context$736.env.set(resolve$390(head$740.name), {
                fn: macroDefinition$742,
                builtin: builtinMode$384
            });
            return expandToTermTree$446(rest$741, context$736, prevStx$737, prevTerms$738);
        }
        if (head$740.hasPrototype(LetMacro$421) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$742 = loadMacroDef$444(head$740, context$736);
            var freshName$746 = fresh$396();
            var renamedName$747 = head$740.name.rename(head$740.name, freshName$746);
            rest$741 = _$257.map(rest$741, function (stx$748) {
                return stx$748.rename(head$740.name, freshName$746);
            });
            head$740.name = renamedName$747;
            context$736.env.set(resolve$390(head$740.name), {
                fn: macroDefinition$742,
                builtin: builtinMode$384
            });
            return expandToTermTree$446(rest$741, context$736, prevStx$737, prevTerms$738);
        }
        // We build the newPrevTerms/Stx here (instead of at the beginning) so
        // that macro definitions don't get added to it.
        var destructed$743 = f$739.result.destruct();
        destructed$743.forEach(function (stx$749) {
            stx$749.term = head$740;
        });
        var newPrevTerms$744 = [head$740].concat(f$739.prevTerms);
        var newPrevStx$745 = destructed$743.reverse().concat(f$739.prevStx);
        if (head$740.hasPrototype(NamedFun$418)) {
            addToDefinitionCtx$447([head$740.name], context$736.defscope, true);
        }
        if (head$740.hasPrototype(VariableStatement$429)) {
            addToDefinitionCtx$447(_$257.map(head$740.decls, function (decl$750) {
                return decl$750.ident;
            }), context$736.defscope, true);
        }
        if (head$740.hasPrototype(Block$407) && head$740.body.hasPrototype(Delimiter$416)) {
            head$740.body.delim.token.inner.forEach(function (term$751) {
                if (term$751.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$447(_$257.map(term$751.decls, function (decl$752) {
                        return decl$752.ident;
                    }), context$736.defscope, true);
                }
            });
        }
        if (head$740.hasPrototype(Delimiter$416)) {
            head$740.delim.token.inner.forEach(function (term$753) {
                if (term$753.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$447(_$257.map(term$753.decls, function (decl$754) {
                        return decl$754.ident;
                    }), context$736.defscope, true);
                }
            });
        }
        if (head$740.hasPrototype(ForStatement$436)) {
            head$740.cond.expose();
            var forCond$755 = head$740.cond.token.inner;
            if (forCond$755[0] && resolve$390(forCond$755[0]) === 'let' && forCond$755[1] && forCond$755[1].token.type === parser$258.Token.Identifier) {
                var letNew$756 = fresh$396();
                var letId$757 = forCond$755[1];
                forCond$755 = forCond$755.map(function (stx$758) {
                    return stx$758.rename(letId$757, letNew$756);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$740.cond.token.inner = expand$449([forCond$755[0]], context$736).concat(expand$449(forCond$755.slice(1), context$736));
                // nice and easy case: `for (...) { ... }`
                if (rest$741[0] && rest$741[0].token.value === '{}') {
                    rest$741[0] = rest$741[0].rename(letId$757, letNew$756);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$759 = enforest$441(rest$741, context$736);
                    var bodyDestructed$760 = bodyEnf$759.result.destruct();
                    var renamedBodyTerm$761 = bodyEnf$759.result.rename(letId$757, letNew$756);
                    bodyDestructed$760.forEach(function (stx$762) {
                        stx$762.term = renamedBodyTerm$761;
                    });
                    return expandToTermTree$446(bodyEnf$759.rest, context$736, bodyDestructed$760.reverse().concat(newPrevStx$745), [renamedBodyTerm$761].concat(newPrevTerms$744));
                }
            } else {
                head$740.cond.token.inner = expand$449(head$740.cond.token.inner, context$736);
            }
        }
        return expandToTermTree$446(rest$741, context$736, newPrevStx$745, newPrevTerms$744);
    }
    function addToDefinitionCtx$447(idents$763, defscope$764, skipRep$765) {
        assert$265(idents$763 && idents$763.length > 0, 'expecting some variable identifiers');
        skipRep$765 = skipRep$765 || false;
        _$257.each(idents$763, function (id$766) {
            var skip$767 = false;
            if (skipRep$765) {
                var declRepeat$768 = _$257.find(defscope$764, function (def$769) {
                        return def$769.id.token.value === id$766.token.value && arraysEqual$391(marksof$389(def$769.id.context), marksof$389(id$766.context));
                    });
                skip$767 = typeof declRepeat$768 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$767) {
                var name$770 = fresh$396();
                defscope$764.push({
                    id: id$766,
                    name: name$770
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$448(term$771, context$772) {
        assert$265(context$772 && context$772.env, 'environment map is required');
        if (term$771.hasPrototype(ArrayLiteral$408)) {
            term$771.array.delim.token.inner = expand$449(term$771.array.delim.expose().token.inner, context$772);
            return term$771;
        } else if (term$771.hasPrototype(Block$407)) {
            term$771.body.delim.token.inner = expand$449(term$771.body.delim.expose().token.inner, context$772);
            return term$771;
        } else if (term$771.hasPrototype(ParenExpression$409)) {
            term$771.expr.delim.token.inner = expand$449(term$771.expr.delim.expose().token.inner, context$772);
            return term$771;
        } else if (term$771.hasPrototype(Call$425)) {
            term$771.fun = expandTermTreeToFinal$448(term$771.fun, context$772);
            term$771.args = _$257.map(term$771.args, function (arg$773) {
                return expandTermTreeToFinal$448(arg$773, context$772);
            });
            return term$771;
        } else if (term$771.hasPrototype(UnaryOp$410)) {
            term$771.expr = expandTermTreeToFinal$448(term$771.expr, context$772);
            return term$771;
        } else if (term$771.hasPrototype(BinOp$412)) {
            term$771.left = expandTermTreeToFinal$448(term$771.left, context$772);
            term$771.right = expandTermTreeToFinal$448(term$771.right, context$772);
            return term$771;
        } else if (term$771.hasPrototype(ObjGet$427)) {
            term$771.right.delim.token.inner = expand$449(term$771.right.delim.expose().token.inner, context$772);
            return term$771;
        } else if (term$771.hasPrototype(ObjDotGet$426)) {
            term$771.left = expandTermTreeToFinal$448(term$771.left, context$772);
            term$771.right = expandTermTreeToFinal$448(term$771.right, context$772);
            return term$771;
        } else if (term$771.hasPrototype(VariableDeclaration$428)) {
            if (term$771.init) {
                term$771.init = expandTermTreeToFinal$448(term$771.init, context$772);
            }
            return term$771;
        } else if (term$771.hasPrototype(VariableStatement$429)) {
            term$771.decls = _$257.map(term$771.decls, function (decl$774) {
                return expandTermTreeToFinal$448(decl$774, context$772);
            });
            return term$771;
        } else if (term$771.hasPrototype(Delimiter$416)) {
            // expand inside the delimiter and then continue on
            term$771.delim.token.inner = expand$449(term$771.delim.expose().token.inner, context$772);
            return term$771;
        } else if (term$771.hasPrototype(NamedFun$418) || term$771.hasPrototype(AnonFun$419) || term$771.hasPrototype(CatchClause$432) || term$771.hasPrototype(ArrowFun$420) || term$771.hasPrototype(Module$433)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$775 = [];
            var bodyContext$776 = makeExpanderContext$450(_$257.defaults({ defscope: newDef$775 }, context$772));
            var paramSingleIdent$777 = term$771.params && term$771.params.token.type === parser$258.Token.Identifier;
            var params$778;
            if (term$771.params && term$771.params.token.type === parser$258.Token.Delimiter) {
                params$778 = term$771.params.expose();
            } else if (paramSingleIdent$777) {
                params$778 = term$771.params;
            } else {
                params$778 = syn$259.makeDelim('()', [], null);
            }
            var bodies$779;
            if (Array.isArray(term$771.body)) {
                bodies$779 = syn$259.makeDelim('{}', term$771.body, null);
            } else {
                bodies$779 = term$771.body;
            }
            bodies$779 = bodies$779.addDefCtx(newDef$775);
            var paramNames$780 = _$257.map(getParamIdentifiers$398(params$778), function (param$787) {
                    var freshName$788 = fresh$396();
                    return {
                        freshName: freshName$788,
                        originalParam: param$787,
                        renamedParam: param$787.rename(param$787, freshName$788)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$781 = _$257.reduce(paramNames$780, function (accBody$789, p$790) {
                    return accBody$789.rename(p$790.originalParam, p$790.freshName);
                }, bodies$779);
            renamedBody$781 = renamedBody$781.expose();
            var expandedResult$782 = expandToTermTree$446(renamedBody$781.token.inner, bodyContext$776);
            var bodyTerms$783 = expandedResult$782.terms;
            var renamedParams$784 = _$257.map(paramNames$780, function (p$791) {
                    return p$791.renamedParam;
                });
            var flatArgs$785;
            if (paramSingleIdent$777) {
                flatArgs$785 = renamedParams$784[0];
            } else {
                flatArgs$785 = syn$259.makeDelim('()', joinSyntax$383(renamedParams$784, ','), term$771.params || null);
            }
            var expandedArgs$786 = expand$449([flatArgs$785], bodyContext$776);
            assert$265(expandedArgs$786.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$771.params) {
                term$771.params = expandedArgs$786[0];
            }
            bodyTerms$783 = _$257.map(bodyTerms$783, function (bodyTerm$792) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$793 = bodyTerm$792.addDefCtx(newDef$775);
                // finish expansion
                return expandTermTreeToFinal$448(termWithCtx$793, expandedResult$782.context);
            });
            if (term$771.hasPrototype(Module$433)) {
                bodyTerms$783 = _$257.filter(bodyTerms$783, function (bodyTerm$794) {
                    if (bodyTerm$794.hasPrototype(Export$435)) {
                        term$771.exports.push(bodyTerm$794);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$781.token.inner = bodyTerms$783;
            if (Array.isArray(term$771.body)) {
                term$771.body = renamedBody$781.token.inner;
            } else {
                term$771.body = renamedBody$781;
            }
            // and continue expand the rest
            return term$771;
        }
        // the term is fine as is
        return term$771;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$449(stx$795, context$796) {
        assert$265(context$796, 'must provide an expander context');
        var trees$797 = expandToTermTree$446(stx$795, context$796);
        return _$257.map(trees$797.terms, function (term$798) {
            return expandTermTreeToFinal$448(term$798, trees$797.context);
        });
    }
    function makeExpanderContext$450(o$799) {
        o$799 = o$799 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$799.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$799.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$799.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$799.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$451(stx$800, builtinSource$801, _maxExpands$802) {
        var env$803 = new Map();
        var params$804 = [];
        var context$805, builtInContext$806 = makeExpanderContext$450({ env: env$803 });
        maxExpands$386 = _maxExpands$802 || Infinity;
        expandCount$385 = 0;
        if (builtinSource$801) {
            var builtinRead$809 = parser$258.read(builtinSource$801);
            builtinRead$809 = [
                syn$259.makeIdent('module', null),
                syn$259.makeDelim('{}', builtinRead$809, null)
            ];
            builtinMode$384 = true;
            var builtinRes$810 = expand$449(builtinRead$809, builtInContext$806);
            builtinMode$384 = false;
            params$804 = _$257.map(builtinRes$810[0].exports, function (term$811) {
                return {
                    oldExport: term$811.name,
                    newParam: syn$259.makeIdent(term$811.name.token.value, null)
                };
            });
        }
        var modBody$807 = syn$259.makeDelim('{}', stx$800, null);
        modBody$807 = _$257.reduce(params$804, function (acc$812, param$813) {
            var newName$814 = fresh$396();
            env$803.set(resolve$390(param$813.newParam.rename(param$813.newParam, newName$814)), env$803.get(resolve$390(param$813.oldExport)));
            return acc$812.rename(param$813.newParam, newName$814);
        }, modBody$807);
        context$805 = makeExpanderContext$450({ env: env$803 });
        var res$808 = expand$449([
                syn$259.makeIdent('module', null),
                modBody$807
            ], context$805);
        res$808 = res$808[0].destruct();
        return flatten$452(res$808[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$452(stx$815) {
        return _$257.reduce(stx$815, function (acc$816, stx$817) {
            if (stx$817.token.type === parser$258.Token.Delimiter) {
                var exposed$818 = stx$817.expose();
                var openParen$819 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$817.token.value[0],
                        range: stx$817.token.startRange,
                        sm_range: typeof stx$817.token.sm_startRange == 'undefined' ? stx$817.token.startRange : stx$817.token.sm_startRange,
                        lineNumber: stx$817.token.startLineNumber,
                        sm_lineNumber: typeof stx$817.token.sm_startLineNumber == 'undefined' ? stx$817.token.startLineNumber : stx$817.token.sm_startLineNumber,
                        lineStart: stx$817.token.startLineStart,
                        sm_lineStart: typeof stx$817.token.sm_startLineStart == 'undefined' ? stx$817.token.startLineStart : stx$817.token.sm_startLineStart
                    }, exposed$818);
                var closeParen$820 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$817.token.value[1],
                        range: stx$817.token.endRange,
                        sm_range: typeof stx$817.token.sm_endRange == 'undefined' ? stx$817.token.endRange : stx$817.token.sm_endRange,
                        lineNumber: stx$817.token.endLineNumber,
                        sm_lineNumber: typeof stx$817.token.sm_endLineNumber == 'undefined' ? stx$817.token.endLineNumber : stx$817.token.sm_endLineNumber,
                        lineStart: stx$817.token.endLineStart,
                        sm_lineStart: typeof stx$817.token.sm_endLineStart == 'undefined' ? stx$817.token.endLineStart : stx$817.token.sm_endLineStart
                    }, exposed$818);
                if (stx$817.token.leadingComments) {
                    openParen$819.token.leadingComments = stx$817.token.leadingComments;
                }
                if (stx$817.token.trailingComments) {
                    openParen$819.token.trailingComments = stx$817.token.trailingComments;
                }
                acc$816.push(openParen$819);
                push$387.apply(acc$816, flatten$452(exposed$818.token.inner));
                acc$816.push(closeParen$820);
                return acc$816;
            }
            stx$817.token.sm_lineNumber = stx$817.token.sm_lineNumber ? stx$817.token.sm_lineNumber : stx$817.token.lineNumber;
            stx$817.token.sm_lineStart = stx$817.token.sm_lineStart ? stx$817.token.sm_lineStart : stx$817.token.lineStart;
            stx$817.token.sm_range = stx$817.token.sm_range ? stx$817.token.sm_range : stx$817.token.range;
            acc$816.push(stx$817);
            return acc$816;
        }, []);
    }
    exports$256.enforest = enforest$441;
    exports$256.expand = expandTopLevel$451;
    exports$256.resolve = resolve$390;
    exports$256.get_expression = get_expression$442;
    exports$256.makeExpanderContext = makeExpanderContext$450;
    exports$256.Expr = Expr$402;
    exports$256.VariableStatement = VariableStatement$429;
    exports$256.tokensToSyntax = syn$259.tokensToSyntax;
    exports$256.syntaxToTokens = syn$259.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map