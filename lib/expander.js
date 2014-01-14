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
        factory$255(exports, require('underscore'), require('./parser'), require('./syntax'), require('./scopedEval'), require('./patterns'), require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'scopedEval',
            'patterns'
        ], factory$255);
    }
}(this, function (exports$256, _$257, parser$258, syn$259, se$260, patternModule$261, gen$262) {
    'use strict';
    var codegen$263 = gen$262 || escodegen;
    var assert$264 = syn$259.assert;
    var throwSyntaxError$265 = syn$259.throwSyntaxError;
    var unwrapSyntax$266 = syn$259.unwrapSyntax;
    // used to export "private" methods for unit testing
    exports$256._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$459 = Object.create(this);
                if (typeof o$459.construct === 'function') {
                    o$459.construct.apply(o$459, arguments);
                }
                return o$459;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$460) {
                var result$461 = Object.create(this);
                for (var prop$462 in properties$460) {
                    if (properties$460.hasOwnProperty(prop$462)) {
                        result$461[prop$462] = properties$460[prop$462];
                    }
                }
                return result$461;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$463) {
                function F$464() {
                }
                F$464.prototype = proto$463;
                return this instanceof F$464;
            },
            enumerable: false,
            writable: true
        }
    });
    function StringMap$377(o$465) {
        this.__data = o$465 || {};
    }
    StringMap$377.prototype = {
        has: function (key$466) {
            return Object.prototype.hasOwnProperty.call(this.__data, key$466);
        },
        get: function (key$467) {
            return this.has(key$467) ? this.__data[key$467] : void 0;
        },
        set: function (key$468, value$469) {
            this.__data[key$468] = value$469;
        },
        extend: function () {
            var args$470 = _$257.map(_$257.toArray(arguments), function (x$471) {
                    return x$471.__data;
                });
            _$257.extend.apply(_$257, [this.__data].concat(args$470));
            return this;
        }
    };
    var scopedEval$378 = se$260.scopedEval;
    var Rename$379 = syn$259.Rename;
    var Mark$380 = syn$259.Mark;
    var Def$381 = syn$259.Def;
    var syntaxFromToken$382 = syn$259.syntaxFromToken;
    var joinSyntax$383 = syn$259.joinSyntax;
    var builtinMode$384 = false;
    var expandCount$385 = 0;
    var maxExpands$386;
    var push$387 = Array.prototype.push;
    function remdup$388(mark$472, mlist$473) {
        if (mark$472 === _$257.first(mlist$473)) {
            return _$257.rest(mlist$473, 1);
        }
        return [mark$472].concat(mlist$473);
    }
    // (CSyntax) -> [...Num]
    function marksof$389(ctx$474, stopName$475, originalName$476) {
        var mark$477, submarks$478;
        if (ctx$474 instanceof Mark$380) {
            mark$477 = ctx$474.mark;
            submarks$478 = marksof$389(ctx$474.context, stopName$475, originalName$476);
            return remdup$388(mark$477, submarks$478);
        }
        if (ctx$474 instanceof Def$381) {
            return marksof$389(ctx$474.context, stopName$475, originalName$476);
        }
        if (ctx$474 instanceof Rename$379) {
            if (stopName$475 === originalName$476 + '$' + ctx$474.name) {
                return [];
            }
            return marksof$389(ctx$474.context, stopName$475, originalName$476);
        }
        return [];
    }
    function resolve$390(stx$479) {
        return resolveCtx$394(stx$479.token.value, stx$479.context, [], []);
    }
    function arraysEqual$391(a$480, b$481) {
        if (a$480.length !== b$481.length) {
            return false;
        }
        for (var i$482 = 0; i$482 < a$480.length; i$482++) {
            if (a$480[i$482] !== b$481[i$482]) {
                return false;
            }
        }
        return true;
    }
    function renames$392(defctx$483, oldctx$484, originalName$485) {
        var acc$486 = oldctx$484;
        for (var i$487 = 0; i$487 < defctx$483.length; i$487++) {
            if (defctx$483[i$487].id.token.value === originalName$485) {
                acc$486 = new Rename$379(defctx$483[i$487].id, defctx$483[i$487].name, acc$486, defctx$483);
            }
        }
        return acc$486;
    }
    function unionEl$393(arr$488, el$489) {
        if (arr$488.indexOf(el$489) === -1) {
            var res$490 = arr$488.slice(0);
            res$490.push(el$489);
            return res$490;
        }
        return arr$488;
    }
    // (Syntax) -> String
    function resolveCtx$394(originalName$491, ctx$492, stop_spine$493, stop_branch$494) {
        if (ctx$492 instanceof Mark$380) {
            return resolveCtx$394(originalName$491, ctx$492.context, stop_spine$493, stop_branch$494);
        }
        if (ctx$492 instanceof Def$381) {
            if (stop_spine$493.indexOf(ctx$492.defctx) !== -1) {
                return resolveCtx$394(originalName$491, ctx$492.context, stop_spine$493, stop_branch$494);
            } else {
                return resolveCtx$394(originalName$491, renames$392(ctx$492.defctx, ctx$492.context, originalName$491), stop_spine$493, unionEl$393(stop_branch$494, ctx$492.defctx));
            }
        }
        if (ctx$492 instanceof Rename$379) {
            if (originalName$491 === ctx$492.id.token.value) {
                var idName$495 = resolveCtx$394(ctx$492.id.token.value, ctx$492.id.context, stop_branch$494, stop_branch$494);
                var subName$496 = resolveCtx$394(originalName$491, ctx$492.context, unionEl$393(stop_spine$493, ctx$492.def), stop_branch$494);
                if (idName$495 === subName$496) {
                    var idMarks$497 = marksof$389(ctx$492.id.context, originalName$491 + '$' + ctx$492.name, originalName$491);
                    var subMarks$498 = marksof$389(ctx$492.context, originalName$491 + '$' + ctx$492.name, originalName$491);
                    if (arraysEqual$391(idMarks$497, subMarks$498)) {
                        return originalName$491 + '$' + ctx$492.name;
                    }
                }
            }
            return resolveCtx$394(originalName$491, ctx$492.context, stop_spine$493, stop_branch$494);
        }
        return originalName$491;
    }
    var nextFresh$395 = 0;
    // fun () -> Num
    function fresh$396() {
        return nextFresh$395++;
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$397(towrap$499, delimSyntax$500) {
        assert$264(delimSyntax$500.token.type === parser$258.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$382({
            type: parser$258.Token.Delimiter,
            value: delimSyntax$500.token.value,
            inner: towrap$499,
            range: delimSyntax$500.token.range,
            startLineNumber: delimSyntax$500.token.startLineNumber,
            lineStart: delimSyntax$500.token.lineStart
        }, delimSyntax$500);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$398(argSyntax$501) {
        if (argSyntax$501.token.type === parser$258.Token.Delimiter) {
            return _$257.filter(argSyntax$501.token.inner, function (stx$502) {
                return stx$502.token.value !== ',';
            });
        } else if (argSyntax$501.token.type === parser$258.Token.Identifier) {
            return [argSyntax$501];
        } else {
            assert$264(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$399 = {
            destruct: function () {
                return _$257.reduce(this.properties, _$257.bind(function (acc$503, prop$504) {
                    if (this[prop$504] && this[prop$504].hasPrototype(TermTree$399)) {
                        push$387.apply(acc$503, this[prop$504].destruct());
                        return acc$503;
                    } else if (this[prop$504] && this[prop$504].token && this[prop$504].token.inner) {
                        var clone$505 = syntaxFromToken$382(_$257.clone(this[prop$504].token), this[prop$504]);
                        clone$505.token.inner = _$257.reduce(clone$505.token.inner, function (acc$506, t$507) {
                            if (t$507.hasPrototype(TermTree$399)) {
                                push$387.apply(acc$506, t$507.destruct());
                                return acc$506;
                            }
                            acc$506.push(t$507);
                            return acc$506;
                        }, []);
                        acc$503.push(clone$505);
                        return acc$503;
                    } else if (Array.isArray(this[prop$504])) {
                        var destArr$508 = _$257.reduce(this[prop$504], function (acc$509, t$510) {
                                if (t$510.hasPrototype(TermTree$399)) {
                                    push$387.apply(acc$509, t$510.destruct());
                                    return acc$509;
                                }
                                acc$509.push(t$510);
                                return acc$509;
                            }, []);
                        push$387.apply(acc$503, destArr$508);
                        return acc$503;
                    } else if (this[prop$504]) {
                        acc$503.push(this[prop$504]);
                        return acc$503;
                    } else {
                        return acc$503;
                    }
                }, this), []);
            },
            addDefCtx: function (def$511) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$512) {
                    var prop$513 = this.properties[i$512];
                    if (Array.isArray(this[prop$513])) {
                        this[prop$513] = _$257.map(this[prop$513], function (item$514) {
                            return item$514.addDefCtx(def$511);
                        });
                    } else if (this[prop$513]) {
                        this[prop$513] = this[prop$513].addDefCtx(def$511);
                    }
                }, this));
                return this;
            },
            rename: function (id$515, name$516) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$517) {
                    var prop$518 = this.properties[i$517];
                    if (Array.isArray(this[prop$518])) {
                        this[prop$518] = _$257.map(this[prop$518], function (item$519) {
                            return item$519.rename(id$515, name$516);
                        });
                    } else if (this[prop$518]) {
                        this[prop$518] = this[prop$518].rename(id$515, name$516);
                    }
                }, this));
                return this;
            }
        };
    var EOF$400 = TermTree$399.extend({
            properties: ['eof'],
            construct: function (e$520) {
                this.eof = e$520;
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
            construct: function (that$521) {
                this.this = that$521;
            }
        });
    var Lit$405 = PrimaryExpression$403.extend({
            properties: ['lit'],
            construct: function (l$522) {
                this.lit = l$522;
            }
        });
    exports$256._test.PropertyAssignment = PropertyAssignment$406;
    var PropertyAssignment$406 = TermTree$399.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$523, assignment$524) {
                this.propName = propName$523;
                this.assignment = assignment$524;
            }
        });
    var Block$407 = PrimaryExpression$403.extend({
            properties: ['body'],
            construct: function (body$525) {
                this.body = body$525;
            }
        });
    var ArrayLiteral$408 = PrimaryExpression$403.extend({
            properties: ['array'],
            construct: function (ar$526) {
                this.array = ar$526;
            }
        });
    var ParenExpression$409 = PrimaryExpression$403.extend({
            properties: ['expr'],
            construct: function (expr$527) {
                this.expr = expr$527;
            }
        });
    var UnaryOp$410 = Expr$402.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$528, expr$529) {
                this.op = op$528;
                this.expr = expr$529;
            }
        });
    var PostfixOp$411 = Expr$402.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$530, op$531) {
                this.expr = expr$530;
                this.op = op$531;
            }
        });
    var BinOp$412 = Expr$402.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$532, left$533, right$534) {
                this.op = op$532;
                this.left = left$533;
                this.right = right$534;
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
            construct: function (cond$535, question$536, tru$537, colon$538, fls$539) {
                this.cond = cond$535;
                this.question = question$536;
                this.tru = tru$537;
                this.colon = colon$538;
                this.fls = fls$539;
            }
        });
    var Keyword$414 = TermTree$399.extend({
            properties: ['keyword'],
            construct: function (k$540) {
                this.keyword = k$540;
            }
        });
    var Punc$415 = TermTree$399.extend({
            properties: ['punc'],
            construct: function (p$541) {
                this.punc = p$541;
            }
        });
    var Delimiter$416 = TermTree$399.extend({
            properties: ['delim'],
            construct: function (d$542) {
                this.delim = d$542;
            }
        });
    var Id$417 = PrimaryExpression$403.extend({
            properties: ['id'],
            construct: function (id$543) {
                this.id = id$543;
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
            construct: function (keyword$544, star$545, name$546, params$547, body$548) {
                this.keyword = keyword$544;
                this.star = star$545;
                this.name = name$546;
                this.params = params$547;
                this.body = body$548;
            }
        });
    var AnonFun$419 = Expr$402.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$549, star$550, params$551, body$552) {
                this.keyword = keyword$549;
                this.star = star$550;
                this.params = params$551;
                this.body = body$552;
            }
        });
    var ArrowFun$420 = Expr$402.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$553, arrow$554, body$555) {
                this.params = params$553;
                this.arrow = arrow$554;
                this.body = body$555;
            }
        });
    var LetMacro$421 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$556, body$557) {
                this.name = name$556;
                this.body = body$557;
            }
        });
    var Macro$422 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$558, body$559) {
                this.name = name$558;
                this.body = body$559;
            }
        });
    var AnonMacro$423 = TermTree$399.extend({
            properties: ['body'],
            construct: function (body$560) {
                this.body = body$560;
            }
        });
    var Const$424 = Expr$402.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$561, call$562) {
                this.newterm = newterm$561;
                this.call = call$562;
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
                assert$264(this.fun.hasPrototype(TermTree$399), 'expecting a term tree in destruct of call');
                var commas$563 = this.commas.slice();
                var delim$564 = syntaxFromToken$382(_$257.clone(this.delim.token), this.delim);
                delim$564.token.inner = _$257.reduce(this.args, function (acc$566, term$567) {
                    assert$264(term$567 && term$567.hasPrototype(TermTree$399), 'expecting term trees in destruct of Call');
                    push$387.apply(acc$566, term$567.destruct());
                    // add all commas except for the last one
                    if (commas$563.length > 0) {
                        acc$566.push(commas$563.shift());
                    }
                    return acc$566;
                }, []);
                var res$565 = this.fun.destruct();
                push$387.apply(res$565, Delimiter$416.create(delim$564).destruct());
                return res$565;
            },
            construct: function (funn$568, args$569, delim$570, commas$571) {
                assert$264(Array.isArray(args$569), 'requires an array of arguments terms');
                this.fun = funn$568;
                this.args = args$569;
                this.delim = delim$570;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$571;
            }
        });
    var ObjDotGet$426 = Expr$402.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$572, dot$573, right$574) {
                this.left = left$572;
                this.dot = dot$573;
                this.right = right$574;
            }
        });
    var ObjGet$427 = Expr$402.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$575, right$576) {
                this.left = left$575;
                this.right = right$576;
            }
        });
    var VariableDeclaration$428 = TermTree$399.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$577, eqstx$578, init$579, comma$580) {
                this.ident = ident$577;
                this.eqstx = eqstx$578;
                this.init = init$579;
                this.comma = comma$580;
            }
        });
    var VariableStatement$429 = Statement$401.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$257.reduce(this.decls, function (acc$581, decl$582) {
                    push$387.apply(acc$581, decl$582.destruct());
                    return acc$581;
                }, []));
            },
            construct: function (varkw$583, decls$584) {
                assert$264(Array.isArray(decls$584), 'decls must be an array');
                this.varkw = varkw$583;
                this.decls = decls$584;
            }
        });
    var LetStatement$430 = Statement$401.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$257.reduce(this.decls, function (acc$585, decl$586) {
                    push$387.apply(acc$585, decl$586.destruct());
                    return acc$585;
                }, []));
            },
            construct: function (letkw$587, decls$588) {
                assert$264(Array.isArray(decls$588), 'decls must be an array');
                this.letkw = letkw$587;
                this.decls = decls$588;
            }
        });
    var ConstStatement$431 = Statement$401.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$257.reduce(this.decls, function (acc$589, decl$590) {
                    push$387.apply(acc$589, decl$590.destruct());
                    return acc$589;
                }, []));
            },
            construct: function (constkw$591, decls$592) {
                assert$264(Array.isArray(decls$592), 'decls must be an array');
                this.constkw = constkw$591;
                this.decls = decls$592;
            }
        });
    var CatchClause$432 = Statement$401.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$593, params$594, body$595) {
                this.catchkw = catchkw$593;
                this.params = params$594;
                this.body = body$595;
            }
        });
    var Module$433 = TermTree$399.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$596) {
                this.body = body$596;
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
            construct: function (name$597) {
                this.name = name$597;
            }
        });
    var ForStatement$436 = Statement$401.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$598, cond$599) {
                this.forkw = forkw$598;
                this.cond = cond$599;
            }
        });
    var YieldExpression$437 = Expr$402.extend({
            properties: [
                'yieldkw',
                'expr'
            ],
            construct: function (yieldkw$600, expr$601) {
                this.yieldkw = yieldkw$600;
                this.expr = expr$601;
            }
        });
    var Template$438 = Expr$402.extend({
            properties: ['template'],
            construct: function (template$602) {
                this.template = template$602;
            }
        });
    function stxIsUnaryOp$439(stx$603) {
        var staticOperators$604 = [
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
        return _$257.contains(staticOperators$604, unwrapSyntax$266(stx$603));
    }
    function stxIsBinOp$440(stx$605) {
        var staticOperators$606 = [
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
        return _$257.contains(staticOperators$606, unwrapSyntax$266(stx$605));
    }
    function enforestVarStatement$441(stx$607, context$608, varStx$609) {
        var isLet$610 = /^(?:let|const)$/.test(varStx$609.token.value);
        var decls$611 = [];
        var rest$612 = stx$607;
        var rhs$613;
        if (!rest$612.length) {
            throwSyntaxError$265('enforest', 'Unexpected end of input', varStx$609);
        }
        while (rest$612.length) {
            if (rest$612[0].token.type === parser$258.Token.Identifier) {
                if (isLet$610) {
                    var freshName$614 = fresh$396();
                    var renamedId$615 = rest$612[0].rename(rest$612[0], freshName$614);
                    rest$612 = rest$612.map(function (stx$616) {
                        return stx$616.rename(rest$612[0], freshName$614);
                    });
                    rest$612[0] = renamedId$615;
                }
                if (rest$612[1].token.type === parser$258.Token.Punctuator && rest$612[1].token.value === '=') {
                    rhs$613 = get_expression$445(rest$612.slice(2), context$608);
                    if (rhs$613.result == null) {
                        throwSyntaxError$265('enforest', 'Unexpected token', rhs$613.rest[0]);
                    }
                    if (rhs$613.rest[0].token.type === parser$258.Token.Punctuator && rhs$613.rest[0].token.value === ',') {
                        decls$611.push(VariableDeclaration$428.create(rest$612[0], rest$612[1], rhs$613.result, rhs$613.rest[0]));
                        rest$612 = rhs$613.rest.slice(1);
                        continue;
                    } else {
                        decls$611.push(VariableDeclaration$428.create(rest$612[0], rest$612[1], rhs$613.result, null));
                        rest$612 = rhs$613.rest;
                        break;
                    }
                } else if (rest$612[1].token.type === parser$258.Token.Punctuator && rest$612[1].token.value === ',') {
                    decls$611.push(VariableDeclaration$428.create(rest$612[0], null, null, rest$612[1]));
                    rest$612 = rest$612.slice(2);
                } else {
                    decls$611.push(VariableDeclaration$428.create(rest$612[0], null, null, null));
                    rest$612 = rest$612.slice(1);
                    break;
                }
            } else {
                throwSyntaxError$265('enforest', 'Unexpected token', rest$612[0]);
            }
        }
        return {
            result: decls$611,
            rest: rest$612
        };
    }
    function adjustLineContext$442(stx$617, original$618, current$619) {
        current$619 = current$619 || {
            lastLineNumber: original$618.token.lineNumber,
            lineNumber: original$618.token.lineNumber - 1
        };
        return _$257.map(stx$617, function (stx$620) {
            if (stx$620.token.type === parser$258.Token.Delimiter) {
                // handle tokens with missing line info
                stx$620.token.startLineNumber = typeof stx$620.token.startLineNumber == 'undefined' ? original$618.token.lineNumber : stx$620.token.startLineNumber;
                stx$620.token.endLineNumber = typeof stx$620.token.endLineNumber == 'undefined' ? original$618.token.lineNumber : stx$620.token.endLineNumber;
                stx$620.token.startLineStart = typeof stx$620.token.startLineStart == 'undefined' ? original$618.token.lineStart : stx$620.token.startLineStart;
                stx$620.token.endLineStart = typeof stx$620.token.endLineStart == 'undefined' ? original$618.token.lineStart : stx$620.token.endLineStart;
                stx$620.token.startRange = typeof stx$620.token.startRange == 'undefined' ? original$618.token.range : stx$620.token.startRange;
                stx$620.token.endRange = typeof stx$620.token.endRange == 'undefined' ? original$618.token.range : stx$620.token.endRange;
                stx$620.token.sm_startLineNumber = typeof stx$620.token.sm_startLineNumber == 'undefined' ? stx$620.token.startLineNumber : stx$620.token.sm_startLineNumber;
                stx$620.token.sm_endLineNumber = typeof stx$620.token.sm_endLineNumber == 'undefined' ? stx$620.token.endLineNumber : stx$620.token.sm_endLineNumber;
                stx$620.token.sm_startLineStart = typeof stx$620.token.sm_startLineStart == 'undefined' ? stx$620.token.startLineStart : stx$620.token.sm_startLineStart;
                stx$620.token.sm_endLineStart = typeof stx$620.token.sm_endLineStart == 'undefined' ? stx$620.token.endLineStart : stx$620.token.sm_endLineStart;
                stx$620.token.sm_startRange = typeof stx$620.token.sm_startRange == 'undefined' ? stx$620.token.startRange : stx$620.token.sm_startRange;
                stx$620.token.sm_endRange = typeof stx$620.token.sm_endRange == 'undefined' ? stx$620.token.endRange : stx$620.token.sm_endRange;
                if (stx$620.token.startLineNumber === current$619.lastLineNumber && current$619.lastLineNumber !== current$619.lineNumber) {
                    stx$620.token.startLineNumber = current$619.lineNumber;
                } else if (stx$620.token.startLineNumber !== current$619.lastLineNumber) {
                    current$619.lineNumber++;
                    current$619.lastLineNumber = stx$620.token.startLineNumber;
                    stx$620.token.startLineNumber = current$619.lineNumber;
                }
                if (stx$620.token.inner.length > 0) {
                    stx$620.token.inner = adjustLineContext$442(stx$620.token.inner, original$618, current$619);
                }
                return stx$620;
            }
            // handle tokens with missing line info
            stx$620.token.lineNumber = typeof stx$620.token.lineNumber == 'undefined' ? original$618.token.lineNumber : stx$620.token.lineNumber;
            stx$620.token.lineStart = typeof stx$620.token.lineStart == 'undefined' ? original$618.token.lineStart : stx$620.token.lineStart;
            stx$620.token.range = typeof stx$620.token.range == 'undefined' ? original$618.token.range : stx$620.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$620.token.sm_lineNumber = typeof stx$620.token.sm_lineNumber == 'undefined' ? stx$620.token.lineNumber : stx$620.token.sm_lineNumber;
            stx$620.token.sm_lineStart = typeof stx$620.token.sm_lineStart == 'undefined' ? stx$620.token.lineStart : stx$620.token.sm_lineStart;
            stx$620.token.sm_range = typeof stx$620.token.sm_range == 'undefined' ? _$257.clone(stx$620.token.range) : stx$620.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$620.token.lineNumber === current$619.lastLineNumber && current$619.lastLineNumber !== current$619.lineNumber) {
                stx$620.token.lineNumber = current$619.lineNumber;
            } else if (stx$620.token.lineNumber !== current$619.lastLineNumber) {
                current$619.lineNumber++;
                current$619.lastLineNumber = stx$620.token.lineNumber;
                stx$620.token.lineNumber = current$619.lineNumber;
            }
            return stx$620;
        });
    }
    function tokenValuesArePrefix$443(first$621, second$622) {
        // short circuit 
        if (second$622.length < first$621.length) {
            return false;
        }
        for (var i$623 = 0; i$623 < first$621.length; i$623++) {
            if (unwrapSyntax$266(first$621[i$623]) !== unwrapSyntax$266(second$622[i$623])) {
                return false;
            }
            // make sure multi token macros do not have any whitespace between the tokens
            if (i$623 > 0 && second$622[i$623 - 1].token.range[1] !== second$622[i$623].token.range[0]) {
                return false;
            }
        }
        return true;
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$444(toks$624, context$625, prevStx$626, prevTerms$627) {
        assert$264(toks$624.length > 0, 'enforest assumes there are tokens to work with');
        prevStx$626 = prevStx$626 || [];
        prevTerms$627 = prevTerms$627 || [];
        function step$628(head$629, rest$630) {
            var innerTokens$631;
            assert$264(Array.isArray(rest$630), 'result must at least be an empty array');
            if (head$629.hasPrototype(TermTree$399)) {
                // function call
                var emp$634 = head$629.emp;
                var emp$634 = head$629.emp;
                var keyword$637 = head$629.keyword;
                var delim$639 = head$629.delim;
                var id$641 = head$629.id;
                var delim$639 = head$629.delim;
                var emp$634 = head$629.emp;
                var punc$645 = head$629.punc;
                var keyword$637 = head$629.keyword;
                var emp$634 = head$629.emp;
                var emp$634 = head$629.emp;
                var emp$634 = head$629.emp;
                var delim$639 = head$629.delim;
                var delim$639 = head$629.delim;
                var id$641 = head$629.id;
                var keyword$637 = head$629.keyword;
                var keyword$637 = head$629.keyword;
                var keyword$637 = head$629.keyword;
                var keyword$637 = head$629.keyword;
                var keyword$637 = head$629.keyword;
                if (head$629.hasPrototype(Expr$402) && rest$630[0] && rest$630[0].token.type === parser$258.Token.Delimiter && rest$630[0].token.value === '()') {
                    var argRes$680, enforestedArgs$681 = [], commas$682 = [];
                    rest$630[0].expose();
                    innerTokens$631 = rest$630[0].token.inner;
                    while (innerTokens$631.length > 0) {
                        argRes$680 = enforest$444(innerTokens$631, context$625);
                        enforestedArgs$681.push(argRes$680.result);
                        innerTokens$631 = argRes$680.rest;
                        if (innerTokens$631[0] && innerTokens$631[0].token.value === ',') {
                            // record the comma for later
                            commas$682.push(innerTokens$631[0]);
                            // but dump it for the next loop turn
                            innerTokens$631 = innerTokens$631.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$683 = _$257.all(enforestedArgs$681, function (argTerm$684) {
                            return argTerm$684.hasPrototype(Expr$402);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$631.length === 0 && argsAreExprs$683) {
                        return step$628(Call$425.create(head$629, enforestedArgs$681, rest$630[0], commas$682), rest$630.slice(1));
                    }
                } else if (head$629.hasPrototype(Expr$402) && rest$630[0] && unwrapSyntax$266(rest$630[0]) === '?') {
                    var question$685 = rest$630[0];
                    var condRes$686 = enforest$444(rest$630.slice(1), context$625);
                    var truExpr$687 = condRes$686.result;
                    var condRight$688 = condRes$686.rest;
                    if (truExpr$687.hasPrototype(Expr$402) && condRight$688[0] && unwrapSyntax$266(condRight$688[0]) === ':') {
                        var colon$689 = condRight$688[0];
                        var flsRes$690 = enforest$444(condRight$688.slice(1), context$625);
                        var flsExpr$691 = flsRes$690.result;
                        if (flsExpr$691.hasPrototype(Expr$402)) {
                            return step$628(ConditionalExpression$413.create(head$629, question$685, truExpr$687, colon$689, flsExpr$691), flsRes$690.rest);
                        }
                    }
                } else if (head$629.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$637) === 'new' && rest$630[0]) {
                    var newCallRes$692 = enforest$444(rest$630, context$625);
                    if (newCallRes$692.result.hasPrototype(Call$425)) {
                        return step$628(Const$424.create(head$629, newCallRes$692.result), newCallRes$692.rest);
                    }
                } else if (head$629.hasPrototype(Delimiter$416) && delim$639.token.value === '()' && rest$630[0] && rest$630[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$630[0]) === '=>') {
                    var arrowRes$693 = enforest$444(rest$630.slice(1), context$625);
                    if (arrowRes$693.result.hasPrototype(Expr$402)) {
                        return step$628(ArrowFun$420.create(delim$639, rest$630[0], arrowRes$693.result.destruct()), arrowRes$693.rest);
                    } else {
                        throwSyntaxError$265('enforest', 'Body of arrow function must be an expression', rest$630.slice(1));
                    }
                } else if (head$629.hasPrototype(Id$417) && rest$630[0] && rest$630[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$630[0]) === '=>') {
                    var res$694 = enforest$444(rest$630.slice(1), context$625);
                    if (res$694.result.hasPrototype(Expr$402)) {
                        return step$628(ArrowFun$420.create(id$641, rest$630[0], res$694.result.destruct()), res$694.rest);
                    } else {
                        throwSyntaxError$265('enforest', 'Body of arrow function must be an expression', rest$630.slice(1));
                    }
                } else if (head$629.hasPrototype(Delimiter$416) && delim$639.token.value === '()') {
                    innerTokens$631 = delim$639.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$631.length === 0) {
                        return step$628(ParenExpression$409.create(head$629), rest$630);
                    } else {
                        var innerTerm$695 = get_expression$445(innerTokens$631, context$625);
                        if (innerTerm$695.result && innerTerm$695.result.hasPrototype(Expr$402)) {
                            return step$628(ParenExpression$409.create(head$629), rest$630);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$629.hasPrototype(Expr$402) && rest$630[0] && rest$630[1] && stxIsBinOp$440(rest$630[0])) {
                    // Check if the operator is a macro first.
                    if (context$625.env.has(resolve$390(rest$630[0])) && tokenValuesArePrefix$443(context$625.env.get(resolve$390(rest$630[0])).fullName, rest$630)) {
                        var headStx$703 = tagWithTerm$446(head$629, head$629.destruct().reverse());
                        prevStx$626 = headStx$703.concat(prevStx$626);
                        prevTerms$627 = [head$629].concat(prevTerms$627);
                        return step$628(rest$630[0], rest$630.slice(1));
                    }
                    var op$696 = rest$630[0];
                    var left$697 = head$629;
                    var rightStx$698 = rest$630.slice(1);
                    var bopPrevStx$699 = [rest$630[0]].concat(head$629.destruct().reverse(), prevStx$626);
                    var bopPrevTerms$700 = [
                            Punc$415.create(rest$630[0]),
                            head$629
                        ].concat(prevTerms$627);
                    var bopRes$701 = enforest$444(rightStx$698, context$625, bopPrevStx$699, bopPrevTerms$700);
                    // Lookbehind was matched, so it may not even be a binop anymore.
                    if (bopRes$701.prevTerms.length < bopPrevTerms$700.length) {
                        return bopRes$701;
                    }
                    var right$702 = bopRes$701.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$702.hasPrototype(Expr$402)) {
                        return step$628(BinOp$412.create(op$696, left$697, right$702), bopRes$701.rest);
                    }
                } else if (head$629.hasPrototype(Punc$415) && stxIsUnaryOp$439(punc$645)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$629.punc.term = head$629;
                    var unopPrevStx$704 = [punc$645].concat(prevStx$626);
                    var unopPrevTerms$705 = [head$629].concat(prevTerms$627);
                    var unopRes$706 = enforest$444(rest$630, context$625, unopPrevStx$704, unopPrevTerms$705);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopRes$706.prevTerms.length < unopPrevTerms$705.length) {
                        return unopRes$706;
                    }
                    if (unopRes$706.result.hasPrototype(Expr$402)) {
                        return step$628(UnaryOp$410.create(punc$645, unopRes$706.result), unopRes$706.rest);
                    }
                } else if (head$629.hasPrototype(Keyword$414) && stxIsUnaryOp$439(keyword$637)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$629.keyword.term = head$629;
                    var unopKeyPrevStx$707 = [keyword$637].concat(prevStx$626);
                    var unopKeyPrevTerms$708 = [head$629].concat(prevTerms$627);
                    var unopKeyres$709 = enforest$444(rest$630, context$625, unopKeyPrevStx$707, unopKeyPrevTerms$708);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopKeyres$709.prevTerms.length < unopKeyPrevTerms$708.length) {
                        return unopKeyres$709;
                    }
                    if (unopKeyres$709.result.hasPrototype(Expr$402)) {
                        return step$628(UnaryOp$410.create(keyword$637, unopKeyres$709.result), unopKeyres$709.rest);
                    }
                } else if (head$629.hasPrototype(Expr$402) && rest$630[0] && (unwrapSyntax$266(rest$630[0]) === '++' || unwrapSyntax$266(rest$630[0]) === '--')) {
                    // Check if the operator is a macro first.
                    if (context$625.env.has(resolve$390(rest$630[0]))) {
                        var headStx$703 = tagWithTerm$446(head$629, head$629.destruct().reverse());
                        prevStx$626 = headStx$703.concat(prevStx$626);
                        prevTerms$627 = [head$629].concat(prevTerms$627);
                        return step$628(rest$630[0], rest$630.slice(1));
                    }
                    return step$628(PostfixOp$411.create(head$629, rest$630[0]), rest$630.slice(1));
                } else if (head$629.hasPrototype(Expr$402) && rest$630[0] && rest$630[0].token.value === '[]') {
                    return step$628(ObjGet$427.create(head$629, Delimiter$416.create(rest$630[0].expose())), rest$630.slice(1));
                } else if (head$629.hasPrototype(Expr$402) && rest$630[0] && unwrapSyntax$266(rest$630[0]) === '.' && !context$625.env.has(resolve$390(rest$630[0])) && rest$630[1] && rest$630[1].token.type === parser$258.Token.Identifier) {
                    // Check if the identifier is a macro first.
                    if (context$625.env.has(resolve$390(rest$630[1]))) {
                        var headStx$703 = tagWithTerm$446(head$629, head$629.destruct().reverse());
                        var dotTerm$710 = Punc$415.create(rest$630[0]);
                        var dotTerms$711 = [dotTerm$710].concat(head$629, prevTerms$627);
                        var dotStx$712 = tagWithTerm$446(dotTerm$710, [rest$630[0]]).concat(headStx$703, prevStx$626);
                        var dotRes$713 = enforest$444(rest$630.slice(1), context$625, dotStx$712, dotTerms$711);
                        if (dotRes$713.prevTerms.length < dotTerms$711.length) {
                            return dotRes$713;
                        } else {
                            return step$628(head$629, [rest$630[0]].concat(dotRes$713.result.destruct(), dotRes$713.rest), prevStx$626, prevTerms$627);
                        }
                    }
                    return step$628(ObjDotGet$426.create(head$629, rest$630[0], rest$630[1]), rest$630.slice(2));
                } else if (head$629.hasPrototype(Delimiter$416) && delim$639.token.value === '[]') {
                    return step$628(ArrayLiteral$408.create(head$629), rest$630);
                } else if (head$629.hasPrototype(Delimiter$416) && head$629.delim.token.value === '{}') {
                    return step$628(Block$407.create(head$629), rest$630);
                } else if (head$629.hasPrototype(Id$417) && unwrapSyntax$266(id$641) === '#quoteSyntax' && rest$630[0] && rest$630[0].token.value === '{}') {
                    var tempId$714 = fresh$396();
                    context$625.templateMap.set(tempId$714, rest$630[0].token.inner);
                    return step$628(syn$259.makeIdent('getTemplate', id$641), [syn$259.makeDelim('()', [syn$259.makeValue(tempId$714, id$641)], id$641)].concat(rest$630.slice(1)));
                } else if (head$629.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$637) === 'let') {
                    var nameTokens$715 = [];
                    for (var i$716 = 0; i$716 < rest$630.length; i$716++) {
                        if (rest$630[i$716].token.type === parser$258.Token.Punctuator && rest$630[i$716].token.value === '=') {
                            break;
                        } else if (i$716 > 0 && rest$630[i$716 - 1].token.range[1] !== rest$630[i$716].token.range[0]) {
                            throwSyntaxError$265('enforest', 'Multi token macro names must not contain spaces between tokens', rest$630[i$716]);
                        } else if (rest$630[i$716].token.type === parser$258.Token.Keyword || rest$630[i$716].token.type === parser$258.Token.Punctuator || rest$630[i$716].token.type === parser$258.Token.Identifier) {
                            nameTokens$715.push(rest$630[i$716]);
                        } else {
                            throwSyntaxError$265('enforest', 'Macro name must be a legal identifier or punctuator', rest$630[i$716]);
                        }
                    }
                    // Let macro
                    if (rest$630[i$716 + 1] && rest$630[i$716 + 1].token.value === 'macro') {
                        var mac$717 = enforest$444(rest$630.slice(i$716 + 1), context$625);
                        if (!mac$717.result.hasPrototype(AnonMacro$423)) {
                            throwSyntaxError$265('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$630.slice(i$716 + 1));
                        }
                        return step$628(LetMacro$421.create(nameTokens$715, mac$717.result.body), mac$717.rest);
                    }    // Let statement
                    else {
                        var lsRes$718 = enforestVarStatement$441(rest$630, context$625, keyword$637);
                        if (lsRes$718) {
                            return step$628(LetStatement$430.create(head$629, lsRes$718.result), lsRes$718.rest);
                        }
                    }
                } else if (head$629.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$637) === 'var' && rest$630[0]) {
                    var vsRes$719 = enforestVarStatement$441(rest$630, context$625, keyword$637);
                    if (vsRes$719) {
                        return step$628(VariableStatement$429.create(head$629, vsRes$719.result), vsRes$719.rest);
                    }
                } else if (head$629.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$637) === 'const' && rest$630[0]) {
                    var csRes$720 = enforestVarStatement$441(rest$630, context$625, keyword$637);
                    if (csRes$720) {
                        return step$628(ConstStatement$431.create(head$629, csRes$720.result), csRes$720.rest);
                    }
                } else if (head$629.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$637) === 'for' && rest$630[0] && rest$630[0].token.value === '()') {
                    return step$628(ForStatement$436.create(keyword$637, rest$630[0]), rest$630.slice(1));
                } else if (head$629.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$637) === 'yield') {
                    var yieldExprRes$721 = enforest$444(rest$630, context$625);
                    if (yieldExprRes$721.result.hasPrototype(Expr$402)) {
                        return step$628(YieldExpression$437.create(keyword$637, yieldExprRes$721.result), yieldExprRes$721.rest);
                    }
                }
            } else {
                assert$264(head$629 && head$629.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$629.token.type === parser$258.Token.Identifier || head$629.token.type === parser$258.Token.Keyword || head$629.token.type === parser$258.Token.Punctuator) && expandCount$385 < maxExpands$386 && context$625.env.has(resolve$390(head$629)) && tokenValuesArePrefix$443(context$625.env.get(resolve$390(head$629)).fullName, [head$629].concat(rest$630))) {
                    // pull the macro transformer out the environment
                    var macroObj$722 = context$625.env.get(resolve$390(head$629));
                    var transformer$723 = macroObj$722.fn;
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$724 = fresh$396();
                    var transformerContext$725 = makeExpanderContext$454(_$257.defaults({ mark: newMark$724 }, context$625));
                    if (!builtinMode$384 && !macroObj$722.builtin) {
                        expandCount$385++;
                    }
                    // apply the transformer
                    var rt$726;
                    try {
                        rt$726 = transformer$723([head$629].concat(rest$630.slice(macroObj$722.fullName.length - 1)), transformerContext$725, prevStx$626, prevTerms$627);
                    } catch (e$727) {
                        if (e$727.type && e$727.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$728 = '`' + rest$630.slice(0, 5).map(function (stx$729) {
                                    return stx$729.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$265('macro', 'Macro `' + head$629.token.value + '` could not be matched with ' + argumentString$728, head$629);
                        } else {
                            // just rethrow it
                            throw e$727;
                        }
                    }
                    if (rt$726.prevTerms) {
                        prevTerms$627 = rt$726.prevTerms;
                    }
                    if (rt$726.prevStx) {
                        prevStx$626 = rt$726.prevStx;
                    }
                    if (!Array.isArray(rt$726.result)) {
                        throwSyntaxError$265('enforest', 'Macro must return a syntax array', head$629);
                    }
                    if (rt$726.result.length > 0) {
                        var adjustedResult$730 = adjustLineContext$442(rt$726.result, head$629);
                        adjustedResult$730[0].token.leadingComments = head$629.token.leadingComments;
                        return step$628(adjustedResult$730[0], adjustedResult$730.slice(1).concat(rt$726.rest));
                    } else {
                        return step$628(Empty$434.create(), rt$726.rest);
                    }
                }    // anon macro definition
                else if (head$629.token.type === parser$258.Token.Identifier && head$629.token.value === 'macro' && rest$630[0] && rest$630[0].token.value === '{}') {
                    return step$628(AnonMacro$423.create(rest$630[0].expose().token.inner), rest$630.slice(1));
                }    // macro definition
                else if (head$629.token.type === parser$258.Token.Identifier && head$629.token.value === 'macro') {
                    var nameTokens$715 = [];
                    for (var i$716 = 0; i$716 < rest$630.length; i$716++) {
                        // done with the name once we find the delimiter
                        if (rest$630[i$716].token.type === parser$258.Token.Delimiter) {
                            break;
                        } else if (i$716 > 0 && rest$630[i$716 - 1].token.range[1] !== rest$630[i$716].token.range[0]) {
                            throwSyntaxError$265('enforest', 'Multi token macro names must not contain spaces between tokens', rest$630[i$716]);
                        } else if (rest$630[i$716].token.type === parser$258.Token.Identifier || rest$630[i$716].token.type === parser$258.Token.Keyword || rest$630[i$716].token.type === parser$258.Token.Punctuator) {
                            nameTokens$715.push(rest$630[i$716]);
                        } else {
                            throwSyntaxError$265('enforest', 'Macro name must be a legal identifier or punctuator', rest$630[i$716]);
                        }
                    }
                    if (rest$630[i$716] && rest$630[i$716].token.type === parser$258.Token.Delimiter) {
                        return step$628(Macro$422.create(nameTokens$715, rest$630[i$716].expose().token.inner), rest$630.slice(i$716 + 1));
                    } else {
                        throwSyntaxError$265('enforest', 'Macro declaration must include body', rest$630[i$716]);
                    }
                }    // module definition
                else if (unwrapSyntax$266(head$629) === 'module' && rest$630[0] && rest$630[0].token.value === '{}') {
                    return step$628(Module$433.create(rest$630[0]), rest$630.slice(1));
                }    // function definition
                else if (head$629.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$629) === 'function' && rest$630[0] && rest$630[0].token.type === parser$258.Token.Identifier && rest$630[1] && rest$630[1].token.type === parser$258.Token.Delimiter && rest$630[1].token.value === '()' && rest$630[2] && rest$630[2].token.type === parser$258.Token.Delimiter && rest$630[2].token.value === '{}') {
                    rest$630[1].token.inner = rest$630[1].expose().token.inner;
                    rest$630[2].token.inner = rest$630[2].expose().token.inner;
                    return step$628(NamedFun$418.create(head$629, null, rest$630[0], rest$630[1], rest$630[2]), rest$630.slice(3));
                }    // generator function definition
                else if (head$629.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$629) === 'function' && rest$630[0] && rest$630[0].token.type === parser$258.Token.Punctuator && rest$630[0].token.value === '*' && rest$630[1] && rest$630[1].token.type === parser$258.Token.Identifier && rest$630[2] && rest$630[2].token.type === parser$258.Token.Delimiter && rest$630[2].token.value === '()' && rest$630[3] && rest$630[3].token.type === parser$258.Token.Delimiter && rest$630[3].token.value === '{}') {
                    rest$630[2].token.inner = rest$630[2].expose().token.inner;
                    rest$630[3].token.inner = rest$630[3].expose().token.inner;
                    return step$628(NamedFun$418.create(head$629, rest$630[0], rest$630[1], rest$630[2], rest$630[3]), rest$630.slice(4));
                }    // anonymous function definition
                else if (head$629.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$629) === 'function' && rest$630[0] && rest$630[0].token.type === parser$258.Token.Delimiter && rest$630[0].token.value === '()' && rest$630[1] && rest$630[1].token.type === parser$258.Token.Delimiter && rest$630[1].token.value === '{}') {
                    rest$630[0].token.inner = rest$630[0].expose().token.inner;
                    rest$630[1].token.inner = rest$630[1].expose().token.inner;
                    return step$628(AnonFun$419.create(head$629, null, rest$630[0], rest$630[1]), rest$630.slice(2));
                }    // anonymous generator function definition
                else if (head$629.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$629) === 'function' && rest$630[0] && rest$630[0].token.type === parser$258.Token.Punctuator && rest$630[0].token.value === '*' && rest$630[1] && rest$630[1].token.type === parser$258.Token.Delimiter && rest$630[1].token.value === '()' && rest$630[2] && rest$630[2].token.type === parser$258.Token.Delimiter && rest$630[2].token.value === '{}') {
                    rest$630[1].token.inner = rest$630[1].expose().token.inner;
                    rest$630[2].token.inner = rest$630[2].expose().token.inner;
                    return step$628(AnonFun$419.create(head$629, rest$630[0], rest$630[1], rest$630[2]), rest$630.slice(3));
                }    // arrow function
                else if ((head$629.token.type === parser$258.Token.Delimiter && head$629.token.value === '()' || head$629.token.type === parser$258.Token.Identifier) && rest$630[0] && rest$630[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$630[0]) === '=>' && rest$630[1] && rest$630[1].token.type === parser$258.Token.Delimiter && rest$630[1].token.value === '{}') {
                    return step$628(ArrowFun$420.create(head$629, rest$630[0], rest$630[1]), rest$630.slice(2));
                }    // catch statement
                else if (head$629.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$629) === 'catch' && rest$630[0] && rest$630[0].token.type === parser$258.Token.Delimiter && rest$630[0].token.value === '()' && rest$630[1] && rest$630[1].token.type === parser$258.Token.Delimiter && rest$630[1].token.value === '{}') {
                    rest$630[0].token.inner = rest$630[0].expose().token.inner;
                    rest$630[1].token.inner = rest$630[1].expose().token.inner;
                    return step$628(CatchClause$432.create(head$629, rest$630[0], rest$630[1]), rest$630.slice(2));
                }    // this expression
                else if (head$629.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$629) === 'this') {
                    return step$628(ThisExpression$404.create(head$629), rest$630);
                }    // literal
                else if (head$629.token.type === parser$258.Token.NumericLiteral || head$629.token.type === parser$258.Token.StringLiteral || head$629.token.type === parser$258.Token.BooleanLiteral || head$629.token.type === parser$258.Token.RegularExpression || head$629.token.type === parser$258.Token.NullLiteral) {
                    return step$628(Lit$405.create(head$629), rest$630);
                }    // export
                else if (head$629.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$629) === 'export' && rest$630[0] && (rest$630[0].token.type === parser$258.Token.Identifier || rest$630[0].token.type === parser$258.Token.Keyword || rest$630[0].token.type === parser$258.Token.Punctuator)) {
                    return step$628(Export$435.create(rest$630[0]), rest$630.slice(1));
                }    // identifier
                else if (head$629.token.type === parser$258.Token.Identifier) {
                    return step$628(Id$417.create(head$629), rest$630);
                }    // punctuator
                else if (head$629.token.type === parser$258.Token.Punctuator) {
                    return step$628(Punc$415.create(head$629), rest$630);
                } else if (head$629.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$629) === 'with') {
                    throwSyntaxError$265('enforest', 'with is not supported in sweet.js', head$629);
                }    // keyword
                else if (head$629.token.type === parser$258.Token.Keyword) {
                    return step$628(Keyword$414.create(head$629), rest$630);
                }    // Delimiter
                else if (head$629.token.type === parser$258.Token.Delimiter) {
                    return step$628(Delimiter$416.create(head$629.expose()), rest$630);
                } else if (head$629.token.type === parser$258.Token.Template) {
                    return step$628(Template$438.create(head$629), rest$630);
                }    // end of file
                else if (head$629.token.type === parser$258.Token.EOF) {
                    assert$264(rest$630.length === 0, 'nothing should be after an EOF');
                    return step$628(EOF$400.create(head$629), []);
                } else {
                    // todo: are we missing cases?
                    assert$264(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$629,
                rest: rest$630,
                prevStx: prevStx$626,
                prevTerms: prevTerms$627
            };
        }
        return step$628(toks$624[0], toks$624.slice(1));
    }
    function get_expression$445(stx$731, context$732) {
        var res$733 = enforest$444(stx$731, context$732);
        var next$734 = res$733;
        var peek$735;
        var prevStx$736;
        if (!next$734.result.hasPrototype(Expr$402)) {
            return {
                result: null,
                rest: stx$731
            };
        }
        while (next$734.rest.length) {
            // Enforest the next term tree since it might be an infix macro that
            // consumes the initial expression.
            peek$735 = enforest$444(next$734.rest, context$732, next$734.result.destruct(), [next$734.result]);
            // If it has prev terms it wasn't infix, but it we need to run it
            // through enforest together with the initial expression to see if
            // it extends it into a longer expression.
            if (peek$735.prevTerms.length === 1) {
                peek$735 = enforest$444([next$734.result].concat(peek$735.result.destruct(), peek$735.rest), context$732);
            }
            // No new expression was created, so we've reached the end.
            if (peek$735.result === next$734.result) {
                break;
            }
            // A new expression was created, so loop back around and keep going.
            next$734 = peek$735;
        }
        return next$734;
    }
    function tagWithTerm$446(term$737, stx$738) {
        _$257.forEach(stx$738, function (s$739) {
            s$739.term = term$737;
        });
        return stx$738;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$447(newMark$740, env$741) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$742(match$743) {
            if (match$743.level === 0) {
                // replace the match property with the marked syntax
                match$743.match = _$257.map(match$743.match, function (stx$744) {
                    return stx$744.mark(newMark$740);
                });
            } else {
                _$257.each(match$743.match, function (match$745) {
                    dfs$742(match$745);
                });
            }
        }
        _$257.keys(env$741).forEach(function (key$746) {
            dfs$742(env$741[key$746]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$448(mac$747, context$748) {
        var body$749 = mac$747.body;
        // raw function primitive form
        if (!(body$749[0] && body$749[0].token.type === parser$258.Token.Keyword && body$749[0].token.value === 'function')) {
            throwSyntaxError$265('load macro', 'Primitive macro form must contain a function for the macro body', body$749);
        }
        var stub$750 = parser$258.read('()');
        stub$750[0].token.inner = body$749;
        var expanded$751 = expand$453(stub$750, context$748);
        expanded$751 = expanded$751[0].destruct().concat(expanded$751[1].eof);
        var flattend$752 = flatten$458(expanded$751);
        var bodyCode$753 = codegen$263.generate(parser$258.parse(flattend$752));
        var macroFn$754 = scopedEval$378(bodyCode$753, {
                makeValue: syn$259.makeValue,
                makeRegex: syn$259.makeRegex,
                makeIdent: syn$259.makeIdent,
                makeKeyword: syn$259.makeKeyword,
                makePunc: syn$259.makePunc,
                makeDelim: syn$259.makeDelim,
                getExpr: function (stx$755) {
                    var r$756;
                    if (stx$755.length === 0) {
                        return {
                            success: false,
                            result: [],
                            rest: []
                        };
                    }
                    r$756 = get_expression$445(stx$755, context$748);
                    return {
                        success: r$756.result !== null,
                        result: r$756.result === null ? [] : r$756.result.destruct(),
                        rest: r$756.rest
                    };
                },
                getIdent: function (stx$757) {
                    if (stx$757[0] && stx$757[0].token.type === parser$258.Token.Identifier) {
                        return {
                            success: true,
                            result: [stx$757[0]],
                            rest: stx$757.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$757
                    };
                },
                getLit: function (stx$758) {
                    if (stx$758[0] && patternModule$261.typeIsLiteral(stx$758[0].token.type)) {
                        return {
                            success: true,
                            result: [stx$758[0]],
                            rest: stx$758.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$758
                    };
                },
                unwrapSyntax: syn$259.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$265,
                prettyPrint: syn$259.prettyPrint,
                parser: parser$258,
                __fresh: fresh$396,
                _: _$257,
                patternModule: patternModule$261,
                getTemplate: function (id$759) {
                    return cloneSyntaxArray$449(context$748.templateMap.get(id$759));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$447,
                mergeMatches: function (newMatch$760, oldMatch$761) {
                    newMatch$760.patternEnv = _$257.extend({}, oldMatch$761.patternEnv, newMatch$760.patternEnv);
                    return newMatch$760;
                }
            });
        return macroFn$754;
    }
    function cloneSyntaxArray$449(arr$762) {
        return arr$762.map(function (stx$763) {
            var o$764 = syntaxFromToken$382(_$257.clone(stx$763.token), stx$763);
            if (o$764.token.type === parser$258.Token.Delimiter) {
                o$764.token.inner = cloneSyntaxArray$449(o$764.token.inner);
            }
            return o$764;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$450(stx$765, context$766, prevStx$767, prevTerms$768) {
        assert$264(context$766, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$765.length === 0) {
            return {
                terms: prevTerms$768 ? prevTerms$768.reverse() : [],
                context: context$766
            };
        }
        assert$264(stx$765[0].token, 'expecting a syntax object');
        var f$769 = enforest$444(stx$765, context$766, prevStx$767, prevTerms$768);
        // head :: TermTree
        var head$770 = f$769.result;
        // rest :: [Syntax]
        var rest$771 = f$769.rest;
        var macroDefinition$772;
        if (head$770.hasPrototype(Macro$422) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$772 = loadMacroDef$448(head$770, context$766);
            addToDefinitionCtx$451([head$770.name[0]], context$766.defscope, false);
            context$766.env.set(resolve$390(head$770.name[0]), {
                fn: macroDefinition$772,
                builtin: builtinMode$384,
                fullName: head$770.name
            });
            return expandToTermTree$450(rest$771, context$766, prevStx$767, prevTerms$768);
        }
        if (head$770.hasPrototype(LetMacro$421) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$772 = loadMacroDef$448(head$770, context$766);
            var freshName$776 = fresh$396();
            var name$777 = head$770.name[0];
            var renamedName$778 = name$777.rename(name$777, freshName$776);
            rest$771 = _$257.map(rest$771, function (stx$779) {
                return stx$779.rename(name$777, freshName$776);
            });
            head$770.name[0] = renamedName$778;
            context$766.env.set(resolve$390(renamedName$778), {
                fn: macroDefinition$772,
                builtin: builtinMode$384,
                fullName: head$770.name
            });
            return expandToTermTree$450(rest$771, context$766, prevStx$767, prevTerms$768);
        }
        // We build the newPrevTerms/Stx here (instead of at the beginning) so
        // that macro definitions don't get added to it.
        var destructed$773 = tagWithTerm$446(head$770, f$769.result.destruct());
        var newPrevTerms$774 = [head$770].concat(f$769.prevTerms);
        var newPrevStx$775 = destructed$773.reverse().concat(f$769.prevStx);
        if (head$770.hasPrototype(NamedFun$418)) {
            addToDefinitionCtx$451([head$770.name], context$766.defscope, true);
        }
        if (head$770.hasPrototype(VariableStatement$429)) {
            addToDefinitionCtx$451(_$257.map(head$770.decls, function (decl$780) {
                return decl$780.ident;
            }), context$766.defscope, true);
        }
        if (head$770.hasPrototype(Block$407) && head$770.body.hasPrototype(Delimiter$416)) {
            head$770.body.delim.token.inner.forEach(function (term$781) {
                if (term$781.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$451(_$257.map(term$781.decls, function (decl$782) {
                        return decl$782.ident;
                    }), context$766.defscope, true);
                }
            });
        }
        if (head$770.hasPrototype(Delimiter$416)) {
            head$770.delim.token.inner.forEach(function (term$783) {
                if (term$783.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$451(_$257.map(term$783.decls, function (decl$784) {
                        return decl$784.ident;
                    }), context$766.defscope, true);
                }
            });
        }
        if (head$770.hasPrototype(ForStatement$436)) {
            head$770.cond.expose();
            var forCond$785 = head$770.cond.token.inner;
            if (forCond$785[0] && resolve$390(forCond$785[0]) === 'let' && forCond$785[1] && forCond$785[1].token.type === parser$258.Token.Identifier) {
                var letNew$786 = fresh$396();
                var letId$787 = forCond$785[1];
                forCond$785 = forCond$785.map(function (stx$788) {
                    return stx$788.rename(letId$787, letNew$786);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$770.cond.token.inner = expand$453([forCond$785[0]], context$766).concat(expand$453(forCond$785.slice(1), context$766));
                // nice and easy case: `for (...) { ... }`
                if (rest$771[0] && rest$771[0].token.value === '{}') {
                    rest$771[0] = rest$771[0].rename(letId$787, letNew$786);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$789 = enforest$444(rest$771, context$766);
                    var bodyDestructed$790 = bodyEnf$789.result.destruct();
                    var renamedBodyTerm$791 = bodyEnf$789.result.rename(letId$787, letNew$786);
                    tagWithTerm$446(renamedBodyTerm$791, bodyDestructed$790);
                    return expandToTermTree$450(bodyEnf$789.rest, context$766, bodyDestructed$790.reverse().concat(newPrevStx$775), [renamedBodyTerm$791].concat(newPrevTerms$774));
                }
            } else {
                head$770.cond.token.inner = expand$453(head$770.cond.token.inner, context$766);
            }
        }
        return expandToTermTree$450(rest$771, context$766, newPrevStx$775, newPrevTerms$774);
    }
    function addToDefinitionCtx$451(idents$792, defscope$793, skipRep$794) {
        assert$264(idents$792 && idents$792.length > 0, 'expecting some variable identifiers');
        skipRep$794 = skipRep$794 || false;
        _$257.each(idents$792, function (id$795) {
            var skip$796 = false;
            if (skipRep$794) {
                var declRepeat$797 = _$257.find(defscope$793, function (def$798) {
                        return def$798.id.token.value === id$795.token.value && arraysEqual$391(marksof$389(def$798.id.context), marksof$389(id$795.context));
                    });
                skip$796 = typeof declRepeat$797 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$796) {
                var name$799 = fresh$396();
                defscope$793.push({
                    id: id$795,
                    name: name$799
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$452(term$800, context$801) {
        assert$264(context$801 && context$801.env, 'environment map is required');
        if (term$800.hasPrototype(ArrayLiteral$408)) {
            term$800.array.delim.token.inner = expand$453(term$800.array.delim.expose().token.inner, context$801);
            return term$800;
        } else if (term$800.hasPrototype(Block$407)) {
            term$800.body.delim.token.inner = expand$453(term$800.body.delim.expose().token.inner, context$801);
            return term$800;
        } else if (term$800.hasPrototype(ParenExpression$409)) {
            term$800.expr.delim.token.inner = expand$453(term$800.expr.delim.expose().token.inner, context$801);
            return term$800;
        } else if (term$800.hasPrototype(Call$425)) {
            term$800.fun = expandTermTreeToFinal$452(term$800.fun, context$801);
            term$800.args = _$257.map(term$800.args, function (arg$802) {
                return expandTermTreeToFinal$452(arg$802, context$801);
            });
            return term$800;
        } else if (term$800.hasPrototype(UnaryOp$410)) {
            term$800.expr = expandTermTreeToFinal$452(term$800.expr, context$801);
            return term$800;
        } else if (term$800.hasPrototype(BinOp$412)) {
            term$800.left = expandTermTreeToFinal$452(term$800.left, context$801);
            term$800.right = expandTermTreeToFinal$452(term$800.right, context$801);
            return term$800;
        } else if (term$800.hasPrototype(ObjGet$427)) {
            term$800.right.delim.token.inner = expand$453(term$800.right.delim.expose().token.inner, context$801);
            return term$800;
        } else if (term$800.hasPrototype(ObjDotGet$426)) {
            term$800.left = expandTermTreeToFinal$452(term$800.left, context$801);
            term$800.right = expandTermTreeToFinal$452(term$800.right, context$801);
            return term$800;
        } else if (term$800.hasPrototype(VariableDeclaration$428)) {
            if (term$800.init) {
                term$800.init = expandTermTreeToFinal$452(term$800.init, context$801);
            }
            return term$800;
        } else if (term$800.hasPrototype(VariableStatement$429)) {
            term$800.decls = _$257.map(term$800.decls, function (decl$803) {
                return expandTermTreeToFinal$452(decl$803, context$801);
            });
            return term$800;
        } else if (term$800.hasPrototype(Delimiter$416)) {
            // expand inside the delimiter and then continue on
            term$800.delim.token.inner = expand$453(term$800.delim.expose().token.inner, context$801);
            return term$800;
        } else if (term$800.hasPrototype(NamedFun$418) || term$800.hasPrototype(AnonFun$419) || term$800.hasPrototype(CatchClause$432) || term$800.hasPrototype(ArrowFun$420) || term$800.hasPrototype(Module$433)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$804 = [];
            var bodyContext$805 = makeExpanderContext$454(_$257.defaults({ defscope: newDef$804 }, context$801));
            var paramSingleIdent$806 = term$800.params && term$800.params.token.type === parser$258.Token.Identifier;
            var params$807;
            if (term$800.params && term$800.params.token.type === parser$258.Token.Delimiter) {
                params$807 = term$800.params.expose();
            } else if (paramSingleIdent$806) {
                params$807 = term$800.params;
            } else {
                params$807 = syn$259.makeDelim('()', [], null);
            }
            var bodies$808;
            if (Array.isArray(term$800.body)) {
                bodies$808 = syn$259.makeDelim('{}', term$800.body, null);
            } else {
                bodies$808 = term$800.body;
            }
            bodies$808 = bodies$808.addDefCtx(newDef$804);
            var paramNames$809 = _$257.map(getParamIdentifiers$398(params$807), function (param$816) {
                    var freshName$817 = fresh$396();
                    return {
                        freshName: freshName$817,
                        originalParam: param$816,
                        renamedParam: param$816.rename(param$816, freshName$817)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$810 = _$257.reduce(paramNames$809, function (accBody$818, p$819) {
                    return accBody$818.rename(p$819.originalParam, p$819.freshName);
                }, bodies$808);
            renamedBody$810 = renamedBody$810.expose();
            var expandedResult$811 = expandToTermTree$450(renamedBody$810.token.inner, bodyContext$805);
            var bodyTerms$812 = expandedResult$811.terms;
            var renamedParams$813 = _$257.map(paramNames$809, function (p$820) {
                    return p$820.renamedParam;
                });
            var flatArgs$814;
            if (paramSingleIdent$806) {
                flatArgs$814 = renamedParams$813[0];
            } else {
                flatArgs$814 = syn$259.makeDelim('()', joinSyntax$383(renamedParams$813, ','), term$800.params || null);
            }
            var expandedArgs$815 = expand$453([flatArgs$814], bodyContext$805);
            assert$264(expandedArgs$815.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$800.params) {
                term$800.params = expandedArgs$815[0];
            }
            bodyTerms$812 = _$257.map(bodyTerms$812, function (bodyTerm$821) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$822 = bodyTerm$821.addDefCtx(newDef$804);
                // finish expansion
                return expandTermTreeToFinal$452(termWithCtx$822, expandedResult$811.context);
            });
            if (term$800.hasPrototype(Module$433)) {
                bodyTerms$812 = _$257.filter(bodyTerms$812, function (bodyTerm$823) {
                    if (bodyTerm$823.hasPrototype(Export$435)) {
                        term$800.exports.push(bodyTerm$823);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$810.token.inner = bodyTerms$812;
            if (Array.isArray(term$800.body)) {
                term$800.body = renamedBody$810.token.inner;
            } else {
                term$800.body = renamedBody$810;
            }
            // and continue expand the rest
            return term$800;
        }
        // the term is fine as is
        return term$800;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$453(stx$824, context$825) {
        assert$264(context$825, 'must provide an expander context');
        var trees$826 = expandToTermTree$450(stx$824, context$825);
        return _$257.map(trees$826.terms, function (term$827) {
            return expandTermTreeToFinal$452(term$827, trees$826.context);
        });
    }
    function makeExpanderContext$454(o$828) {
        o$828 = o$828 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$828.env || new StringMap$377(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$828.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$828.templateMap || new StringMap$377(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$828.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$455(stx$829, moduleContexts$830, _maxExpands$831) {
        moduleContexts$830 = moduleContexts$830 || [];
        maxExpands$386 = _maxExpands$831 || Infinity;
        expandCount$385 = 0;
        var context$832 = makeExpanderContext$454();
        var modBody$833 = syn$259.makeDelim('{}', stx$829, null);
        modBody$833 = _$257.reduce(moduleContexts$830, function (acc$835, mod$836) {
            context$832.env.extend(mod$836.env);
            return loadModuleExports$457(acc$835, context$832.env, mod$836.exports, mod$836.env);
        }, modBody$833);
        var res$834 = expand$453([
                syn$259.makeIdent('module', null),
                modBody$833
            ], context$832);
        res$834 = res$834[0].destruct();
        return flatten$458(res$834[0].token.inner);
    }
    function expandModule$456(stx$837, moduleContexts$838) {
        moduleContexts$838 = moduleContexts$838 || [];
        maxExpands$386 = Infinity;
        expandCount$385 = 0;
        var context$839 = makeExpanderContext$454();
        var modBody$840 = syn$259.makeDelim('{}', stx$837, null);
        modBody$840 = _$257.reduce(moduleContexts$838, function (acc$842, mod$843) {
            context$839.env.extend(mod$843.env);
            return loadModuleExports$457(acc$842, context$839.env, mod$843.exports, mod$843.env);
        }, modBody$840);
        builtinMode$384 = true;
        var moduleRes$841 = expand$453([
                syn$259.makeIdent('module', null),
                modBody$840
            ], context$839);
        builtinMode$384 = false;
        context$839.exports = _$257.map(moduleRes$841[0].exports, function (term$844) {
            return {
                oldExport: term$844.name,
                newParam: syn$259.makeIdent(term$844.name.token.value, null)
            };
        });
        return context$839;
    }
    function loadModuleExports$457(stx$845, newEnv$846, exports$847, oldEnv$848) {
        return _$257.reduce(exports$847, function (acc$849, param$850) {
            var newName$851 = fresh$396();
            newEnv$846.set(resolve$390(param$850.newParam.rename(param$850.newParam, newName$851)), oldEnv$848.get(resolve$390(param$850.oldExport)));
            return acc$849.rename(param$850.newParam, newName$851);
        }, stx$845);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$458(stx$852) {
        return _$257.reduce(stx$852, function (acc$853, stx$854) {
            if (stx$854.token.type === parser$258.Token.Delimiter) {
                var exposed$855 = stx$854.expose();
                var openParen$856 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$854.token.value[0],
                        range: stx$854.token.startRange,
                        sm_range: typeof stx$854.token.sm_startRange == 'undefined' ? stx$854.token.startRange : stx$854.token.sm_startRange,
                        lineNumber: stx$854.token.startLineNumber,
                        sm_lineNumber: typeof stx$854.token.sm_startLineNumber == 'undefined' ? stx$854.token.startLineNumber : stx$854.token.sm_startLineNumber,
                        lineStart: stx$854.token.startLineStart,
                        sm_lineStart: typeof stx$854.token.sm_startLineStart == 'undefined' ? stx$854.token.startLineStart : stx$854.token.sm_startLineStart
                    }, exposed$855);
                var closeParen$857 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$854.token.value[1],
                        range: stx$854.token.endRange,
                        sm_range: typeof stx$854.token.sm_endRange == 'undefined' ? stx$854.token.endRange : stx$854.token.sm_endRange,
                        lineNumber: stx$854.token.endLineNumber,
                        sm_lineNumber: typeof stx$854.token.sm_endLineNumber == 'undefined' ? stx$854.token.endLineNumber : stx$854.token.sm_endLineNumber,
                        lineStart: stx$854.token.endLineStart,
                        sm_lineStart: typeof stx$854.token.sm_endLineStart == 'undefined' ? stx$854.token.endLineStart : stx$854.token.sm_endLineStart
                    }, exposed$855);
                if (stx$854.token.leadingComments) {
                    openParen$856.token.leadingComments = stx$854.token.leadingComments;
                }
                if (stx$854.token.trailingComments) {
                    openParen$856.token.trailingComments = stx$854.token.trailingComments;
                }
                acc$853.push(openParen$856);
                push$387.apply(acc$853, flatten$458(exposed$855.token.inner));
                acc$853.push(closeParen$857);
                return acc$853;
            }
            stx$854.token.sm_lineNumber = stx$854.token.sm_lineNumber ? stx$854.token.sm_lineNumber : stx$854.token.lineNumber;
            stx$854.token.sm_lineStart = stx$854.token.sm_lineStart ? stx$854.token.sm_lineStart : stx$854.token.lineStart;
            stx$854.token.sm_range = stx$854.token.sm_range ? stx$854.token.sm_range : stx$854.token.range;
            acc$853.push(stx$854);
            return acc$853;
        }, []);
    }
    exports$256.StringMap = StringMap$377;
    exports$256.enforest = enforest$444;
    exports$256.expand = expandTopLevel$455;
    exports$256.expandModule = expandModule$456;
    exports$256.resolve = resolve$390;
    exports$256.get_expression = get_expression$445;
    exports$256.makeExpanderContext = makeExpanderContext$454;
    exports$256.Expr = Expr$402;
    exports$256.VariableStatement = VariableStatement$429;
    exports$256.tokensToSyntax = syn$259.tokensToSyntax;
    exports$256.syntaxToTokens = syn$259.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map