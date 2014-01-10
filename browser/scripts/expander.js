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
                var o$457 = Object.create(this);
                if (typeof o$457.construct === 'function') {
                    o$457.construct.apply(o$457, arguments);
                }
                return o$457;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$458) {
                var result$459 = Object.create(this);
                for (var prop$460 in properties$458) {
                    if (properties$458.hasOwnProperty(prop$460)) {
                        result$459[prop$460] = properties$458[prop$460];
                    }
                }
                return result$459;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$461) {
                function F$462() {
                }
                F$462.prototype = proto$461;
                return this instanceof F$462;
            },
            enumerable: false,
            writable: true
        }
    });
    function StringMap$377(o$463) {
        this.__data = o$463 || {};
    }
    StringMap$377.prototype = {
        has: function (key$464) {
            return Object.prototype.hasOwnProperty.call(this.__data, key$464);
        },
        get: function (key$465) {
            return this.has(key$465) ? this.__data[key$465] : void 0;
        },
        set: function (key$466, value$467) {
            this.__data[key$466] = value$467;
        },
        extend: function () {
            var args$468 = _$257.map(_$257.toArray(arguments), function (x$469) {
                    return x$469.__data;
                });
            _$257.extend.apply(_$257, [this.__data].concat(args$468));
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
    function remdup$388(mark$470, mlist$471) {
        if (mark$470 === _$257.first(mlist$471)) {
            return _$257.rest(mlist$471, 1);
        }
        return [mark$470].concat(mlist$471);
    }
    // (CSyntax) -> [...Num]
    function marksof$389(ctx$472, stopName$473, originalName$474) {
        var mark$475, submarks$476;
        if (ctx$472 instanceof Mark$380) {
            mark$475 = ctx$472.mark;
            submarks$476 = marksof$389(ctx$472.context, stopName$473, originalName$474);
            return remdup$388(mark$475, submarks$476);
        }
        if (ctx$472 instanceof Def$381) {
            return marksof$389(ctx$472.context, stopName$473, originalName$474);
        }
        if (ctx$472 instanceof Rename$379) {
            if (stopName$473 === originalName$474 + '$' + ctx$472.name) {
                return [];
            }
            return marksof$389(ctx$472.context, stopName$473, originalName$474);
        }
        return [];
    }
    function resolve$390(stx$477) {
        return resolveCtx$394(stx$477.token.value, stx$477.context, [], []);
    }
    function arraysEqual$391(a$478, b$479) {
        if (a$478.length !== b$479.length) {
            return false;
        }
        for (var i$480 = 0; i$480 < a$478.length; i$480++) {
            if (a$478[i$480] !== b$479[i$480]) {
                return false;
            }
        }
        return true;
    }
    function renames$392(defctx$481, oldctx$482, originalName$483) {
        var acc$484 = oldctx$482;
        for (var i$485 = 0; i$485 < defctx$481.length; i$485++) {
            if (defctx$481[i$485].id.token.value === originalName$483) {
                acc$484 = new Rename$379(defctx$481[i$485].id, defctx$481[i$485].name, acc$484, defctx$481);
            }
        }
        return acc$484;
    }
    function unionEl$393(arr$486, el$487) {
        if (arr$486.indexOf(el$487) === -1) {
            var res$488 = arr$486.slice(0);
            res$488.push(el$487);
            return res$488;
        }
        return arr$486;
    }
    // (Syntax) -> String
    function resolveCtx$394(originalName$489, ctx$490, stop_spine$491, stop_branch$492) {
        if (ctx$490 instanceof Mark$380) {
            return resolveCtx$394(originalName$489, ctx$490.context, stop_spine$491, stop_branch$492);
        }
        if (ctx$490 instanceof Def$381) {
            if (stop_spine$491.indexOf(ctx$490.defctx) !== -1) {
                return resolveCtx$394(originalName$489, ctx$490.context, stop_spine$491, stop_branch$492);
            } else {
                return resolveCtx$394(originalName$489, renames$392(ctx$490.defctx, ctx$490.context, originalName$489), stop_spine$491, unionEl$393(stop_branch$492, ctx$490.defctx));
            }
        }
        if (ctx$490 instanceof Rename$379) {
            if (originalName$489 === ctx$490.id.token.value) {
                var idName$493 = resolveCtx$394(ctx$490.id.token.value, ctx$490.id.context, stop_branch$492, stop_branch$492);
                var subName$494 = resolveCtx$394(originalName$489, ctx$490.context, unionEl$393(stop_spine$491, ctx$490.def), stop_branch$492);
                if (idName$493 === subName$494) {
                    var idMarks$495 = marksof$389(ctx$490.id.context, originalName$489 + '$' + ctx$490.name, originalName$489);
                    var subMarks$496 = marksof$389(ctx$490.context, originalName$489 + '$' + ctx$490.name, originalName$489);
                    if (arraysEqual$391(idMarks$495, subMarks$496)) {
                        return originalName$489 + '$' + ctx$490.name;
                    }
                }
            }
            return resolveCtx$394(originalName$489, ctx$490.context, stop_spine$491, stop_branch$492);
        }
        return originalName$489;
    }
    var nextFresh$395 = 0;
    // fun () -> Num
    function fresh$396() {
        return nextFresh$395++;
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$397(towrap$497, delimSyntax$498) {
        assert$264(delimSyntax$498.token.type === parser$258.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$382({
            type: parser$258.Token.Delimiter,
            value: delimSyntax$498.token.value,
            inner: towrap$497,
            range: delimSyntax$498.token.range,
            startLineNumber: delimSyntax$498.token.startLineNumber,
            lineStart: delimSyntax$498.token.lineStart
        }, delimSyntax$498);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$398(argSyntax$499) {
        if (argSyntax$499.token.type === parser$258.Token.Delimiter) {
            return _$257.filter(argSyntax$499.token.inner, function (stx$500) {
                return stx$500.token.value !== ',';
            });
        } else if (argSyntax$499.token.type === parser$258.Token.Identifier) {
            return [argSyntax$499];
        } else {
            assert$264(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$399 = {
            destruct: function () {
                return _$257.reduce(this.properties, _$257.bind(function (acc$501, prop$502) {
                    if (this[prop$502] && this[prop$502].hasPrototype(TermTree$399)) {
                        push$387.apply(acc$501, this[prop$502].destruct());
                        return acc$501;
                    } else if (this[prop$502] && this[prop$502].token && this[prop$502].token.inner) {
                        var clone$503 = syntaxFromToken$382(_$257.clone(this[prop$502].token), this[prop$502]);
                        clone$503.token.inner = _$257.reduce(clone$503.token.inner, function (acc$504, t$505) {
                            if (t$505.hasPrototype(TermTree$399)) {
                                push$387.apply(acc$504, t$505.destruct());
                                return acc$504;
                            }
                            acc$504.push(t$505);
                            return acc$504;
                        }, []);
                        acc$501.push(clone$503);
                        return acc$501;
                    } else if (Array.isArray(this[prop$502])) {
                        var destArr$506 = _$257.reduce(this[prop$502], function (acc$507, t$508) {
                                if (t$508.hasPrototype(TermTree$399)) {
                                    push$387.apply(acc$507, t$508.destruct());
                                    return acc$507;
                                }
                                acc$507.push(t$508);
                                return acc$507;
                            }, []);
                        push$387.apply(acc$501, destArr$506);
                        return acc$501;
                    } else if (this[prop$502]) {
                        acc$501.push(this[prop$502]);
                        return acc$501;
                    } else {
                        return acc$501;
                    }
                }, this), []);
            },
            addDefCtx: function (def$509) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$510) {
                    var prop$511 = this.properties[i$510];
                    if (Array.isArray(this[prop$511])) {
                        this[prop$511] = _$257.map(this[prop$511], function (item$512) {
                            return item$512.addDefCtx(def$509);
                        });
                    } else if (this[prop$511]) {
                        this[prop$511] = this[prop$511].addDefCtx(def$509);
                    }
                }, this));
                return this;
            },
            rename: function (id$513, name$514) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$515) {
                    var prop$516 = this.properties[i$515];
                    if (Array.isArray(this[prop$516])) {
                        this[prop$516] = _$257.map(this[prop$516], function (item$517) {
                            return item$517.rename(id$513, name$514);
                        });
                    } else if (this[prop$516]) {
                        this[prop$516] = this[prop$516].rename(id$513, name$514);
                    }
                }, this));
                return this;
            }
        };
    var EOF$400 = TermTree$399.extend({
            properties: ['eof'],
            construct: function (e$518) {
                this.eof = e$518;
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
            construct: function (that$519) {
                this.this = that$519;
            }
        });
    var Lit$405 = PrimaryExpression$403.extend({
            properties: ['lit'],
            construct: function (l$520) {
                this.lit = l$520;
            }
        });
    exports$256._test.PropertyAssignment = PropertyAssignment$406;
    var PropertyAssignment$406 = TermTree$399.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$521, assignment$522) {
                this.propName = propName$521;
                this.assignment = assignment$522;
            }
        });
    var Block$407 = PrimaryExpression$403.extend({
            properties: ['body'],
            construct: function (body$523) {
                this.body = body$523;
            }
        });
    var ArrayLiteral$408 = PrimaryExpression$403.extend({
            properties: ['array'],
            construct: function (ar$524) {
                this.array = ar$524;
            }
        });
    var ParenExpression$409 = PrimaryExpression$403.extend({
            properties: ['expr'],
            construct: function (expr$525) {
                this.expr = expr$525;
            }
        });
    var UnaryOp$410 = Expr$402.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$526, expr$527) {
                this.op = op$526;
                this.expr = expr$527;
            }
        });
    var PostfixOp$411 = Expr$402.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$528, op$529) {
                this.expr = expr$528;
                this.op = op$529;
            }
        });
    var BinOp$412 = Expr$402.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$530, left$531, right$532) {
                this.op = op$530;
                this.left = left$531;
                this.right = right$532;
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
            construct: function (cond$533, question$534, tru$535, colon$536, fls$537) {
                this.cond = cond$533;
                this.question = question$534;
                this.tru = tru$535;
                this.colon = colon$536;
                this.fls = fls$537;
            }
        });
    var Keyword$414 = TermTree$399.extend({
            properties: ['keyword'],
            construct: function (k$538) {
                this.keyword = k$538;
            }
        });
    var Punc$415 = TermTree$399.extend({
            properties: ['punc'],
            construct: function (p$539) {
                this.punc = p$539;
            }
        });
    var Delimiter$416 = TermTree$399.extend({
            properties: ['delim'],
            construct: function (d$540) {
                this.delim = d$540;
            }
        });
    var Id$417 = PrimaryExpression$403.extend({
            properties: ['id'],
            construct: function (id$541) {
                this.id = id$541;
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
            construct: function (keyword$542, star$543, name$544, params$545, body$546) {
                this.keyword = keyword$542;
                this.star = star$543;
                this.name = name$544;
                this.params = params$545;
                this.body = body$546;
            }
        });
    var AnonFun$419 = Expr$402.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$547, star$548, params$549, body$550) {
                this.keyword = keyword$547;
                this.star = star$548;
                this.params = params$549;
                this.body = body$550;
            }
        });
    var ArrowFun$420 = Expr$402.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$551, arrow$552, body$553) {
                this.params = params$551;
                this.arrow = arrow$552;
                this.body = body$553;
            }
        });
    var LetMacro$421 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$554, body$555) {
                this.name = name$554;
                this.body = body$555;
            }
        });
    var Macro$422 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$556, body$557) {
                this.name = name$556;
                this.body = body$557;
            }
        });
    var AnonMacro$423 = TermTree$399.extend({
            properties: ['body'],
            construct: function (body$558) {
                this.body = body$558;
            }
        });
    var Const$424 = Expr$402.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$559, call$560) {
                this.newterm = newterm$559;
                this.call = call$560;
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
                var commas$561 = this.commas.slice();
                var delim$562 = syntaxFromToken$382(_$257.clone(this.delim.token), this.delim);
                delim$562.token.inner = _$257.reduce(this.args, function (acc$564, term$565) {
                    assert$264(term$565 && term$565.hasPrototype(TermTree$399), 'expecting term trees in destruct of Call');
                    push$387.apply(acc$564, term$565.destruct());
                    // add all commas except for the last one
                    if (commas$561.length > 0) {
                        acc$564.push(commas$561.shift());
                    }
                    return acc$564;
                }, []);
                var res$563 = this.fun.destruct();
                push$387.apply(res$563, Delimiter$416.create(delim$562).destruct());
                return res$563;
            },
            construct: function (funn$566, args$567, delim$568, commas$569) {
                assert$264(Array.isArray(args$567), 'requires an array of arguments terms');
                this.fun = funn$566;
                this.args = args$567;
                this.delim = delim$568;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$569;
            }
        });
    var ObjDotGet$426 = Expr$402.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$570, dot$571, right$572) {
                this.left = left$570;
                this.dot = dot$571;
                this.right = right$572;
            }
        });
    var ObjGet$427 = Expr$402.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$573, right$574) {
                this.left = left$573;
                this.right = right$574;
            }
        });
    var VariableDeclaration$428 = TermTree$399.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$575, eqstx$576, init$577, comma$578) {
                this.ident = ident$575;
                this.eqstx = eqstx$576;
                this.init = init$577;
                this.comma = comma$578;
            }
        });
    var VariableStatement$429 = Statement$401.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$257.reduce(this.decls, function (acc$579, decl$580) {
                    push$387.apply(acc$579, decl$580.destruct());
                    return acc$579;
                }, []));
            },
            construct: function (varkw$581, decls$582) {
                assert$264(Array.isArray(decls$582), 'decls must be an array');
                this.varkw = varkw$581;
                this.decls = decls$582;
            }
        });
    var LetStatement$430 = Statement$401.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$257.reduce(this.decls, function (acc$583, decl$584) {
                    push$387.apply(acc$583, decl$584.destruct());
                    return acc$583;
                }, []));
            },
            construct: function (letkw$585, decls$586) {
                assert$264(Array.isArray(decls$586), 'decls must be an array');
                this.letkw = letkw$585;
                this.decls = decls$586;
            }
        });
    var ConstStatement$431 = Statement$401.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$257.reduce(this.decls, function (acc$587, decl$588) {
                    push$387.apply(acc$587, decl$588.destruct());
                    return acc$587;
                }, []));
            },
            construct: function (constkw$589, decls$590) {
                assert$264(Array.isArray(decls$590), 'decls must be an array');
                this.constkw = constkw$589;
                this.decls = decls$590;
            }
        });
    var CatchClause$432 = Statement$401.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$591, params$592, body$593) {
                this.catchkw = catchkw$591;
                this.params = params$592;
                this.body = body$593;
            }
        });
    var Module$433 = TermTree$399.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$594) {
                this.body = body$594;
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
            construct: function (name$595) {
                this.name = name$595;
            }
        });
    var ForStatement$436 = Statement$401.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$596, cond$597) {
                this.forkw = forkw$596;
                this.cond = cond$597;
            }
        });
    function stxIsUnaryOp$437(stx$598) {
        var staticOperators$599 = [
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
        return _$257.contains(staticOperators$599, unwrapSyntax$266(stx$598));
    }
    function stxIsBinOp$438(stx$600) {
        var staticOperators$601 = [
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
        return _$257.contains(staticOperators$601, unwrapSyntax$266(stx$600));
    }
    function enforestVarStatement$439(stx$602, context$603, varStx$604) {
        var isLet$605 = /^(?:let|const)$/.test(varStx$604.token.value);
        var decls$606 = [];
        var rest$607 = stx$602;
        var rhs$608;
        if (!rest$607.length) {
            throwSyntaxError$265('enforest', 'Unexpected end of input', varStx$604);
        }
        while (rest$607.length) {
            if (rest$607[0].token.type === parser$258.Token.Identifier) {
                if (isLet$605) {
                    var freshName$609 = fresh$396();
                    var renamedId$610 = rest$607[0].rename(rest$607[0], freshName$609);
                    rest$607 = rest$607.map(function (stx$611) {
                        return stx$611.rename(rest$607[0], freshName$609);
                    });
                    rest$607[0] = renamedId$610;
                }
                if (rest$607[1].token.type === parser$258.Token.Punctuator && rest$607[1].token.value === '=') {
                    rhs$608 = get_expression$443(rest$607.slice(2), context$603);
                    if (rhs$608.result == null) {
                        throwSyntaxError$265('enforest', 'Unexpected token', rhs$608.rest[0]);
                    }
                    if (rhs$608.rest[0].token.type === parser$258.Token.Punctuator && rhs$608.rest[0].token.value === ',') {
                        decls$606.push(VariableDeclaration$428.create(rest$607[0], rest$607[1], rhs$608.result, rhs$608.rest[0]));
                        rest$607 = rhs$608.rest.slice(1);
                        continue;
                    } else {
                        decls$606.push(VariableDeclaration$428.create(rest$607[0], rest$607[1], rhs$608.result, null));
                        rest$607 = rhs$608.rest;
                        break;
                    }
                } else if (rest$607[1].token.type === parser$258.Token.Punctuator && rest$607[1].token.value === ',') {
                    decls$606.push(VariableDeclaration$428.create(rest$607[0], null, null, rest$607[1]));
                    rest$607 = rest$607.slice(2);
                } else {
                    decls$606.push(VariableDeclaration$428.create(rest$607[0], null, null, null));
                    rest$607 = rest$607.slice(1);
                    break;
                }
            } else {
                throwSyntaxError$265('enforest', 'Unexpected token', rest$607[0]);
            }
        }
        return {
            result: decls$606,
            rest: rest$607
        };
    }
    function adjustLineContext$440(stx$612, original$613, current$614) {
        current$614 = current$614 || {
            lastLineNumber: original$613.token.lineNumber,
            lineNumber: original$613.token.lineNumber - 1
        };
        return _$257.map(stx$612, function (stx$615) {
            if (stx$615.token.type === parser$258.Token.Delimiter) {
                // handle tokens with missing line info
                stx$615.token.startLineNumber = typeof stx$615.token.startLineNumber == 'undefined' ? original$613.token.lineNumber : stx$615.token.startLineNumber;
                stx$615.token.endLineNumber = typeof stx$615.token.endLineNumber == 'undefined' ? original$613.token.lineNumber : stx$615.token.endLineNumber;
                stx$615.token.startLineStart = typeof stx$615.token.startLineStart == 'undefined' ? original$613.token.lineStart : stx$615.token.startLineStart;
                stx$615.token.endLineStart = typeof stx$615.token.endLineStart == 'undefined' ? original$613.token.lineStart : stx$615.token.endLineStart;
                stx$615.token.startRange = typeof stx$615.token.startRange == 'undefined' ? original$613.token.range : stx$615.token.startRange;
                stx$615.token.endRange = typeof stx$615.token.endRange == 'undefined' ? original$613.token.range : stx$615.token.endRange;
                stx$615.token.sm_startLineNumber = typeof stx$615.token.sm_startLineNumber == 'undefined' ? stx$615.token.startLineNumber : stx$615.token.sm_startLineNumber;
                stx$615.token.sm_endLineNumber = typeof stx$615.token.sm_endLineNumber == 'undefined' ? stx$615.token.endLineNumber : stx$615.token.sm_endLineNumber;
                stx$615.token.sm_startLineStart = typeof stx$615.token.sm_startLineStart == 'undefined' ? stx$615.token.startLineStart : stx$615.token.sm_startLineStart;
                stx$615.token.sm_endLineStart = typeof stx$615.token.sm_endLineStart == 'undefined' ? stx$615.token.endLineStart : stx$615.token.sm_endLineStart;
                stx$615.token.sm_startRange = typeof stx$615.token.sm_startRange == 'undefined' ? stx$615.token.startRange : stx$615.token.sm_startRange;
                stx$615.token.sm_endRange = typeof stx$615.token.sm_endRange == 'undefined' ? stx$615.token.endRange : stx$615.token.sm_endRange;
                if (stx$615.token.startLineNumber === current$614.lastLineNumber && current$614.lastLineNumber !== current$614.lineNumber) {
                    stx$615.token.startLineNumber = current$614.lineNumber;
                } else if (stx$615.token.startLineNumber !== current$614.lastLineNumber) {
                    current$614.lineNumber++;
                    current$614.lastLineNumber = stx$615.token.startLineNumber;
                    stx$615.token.startLineNumber = current$614.lineNumber;
                }
                if (stx$615.token.inner.length > 0) {
                    stx$615.token.inner = adjustLineContext$440(stx$615.token.inner, original$613, current$614);
                }
                return stx$615;
            }
            // handle tokens with missing line info
            stx$615.token.lineNumber = typeof stx$615.token.lineNumber == 'undefined' ? original$613.token.lineNumber : stx$615.token.lineNumber;
            stx$615.token.lineStart = typeof stx$615.token.lineStart == 'undefined' ? original$613.token.lineStart : stx$615.token.lineStart;
            stx$615.token.range = typeof stx$615.token.range == 'undefined' ? original$613.token.range : stx$615.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$615.token.sm_lineNumber = typeof stx$615.token.sm_lineNumber == 'undefined' ? stx$615.token.lineNumber : stx$615.token.sm_lineNumber;
            stx$615.token.sm_lineStart = typeof stx$615.token.sm_lineStart == 'undefined' ? stx$615.token.lineStart : stx$615.token.sm_lineStart;
            stx$615.token.sm_range = typeof stx$615.token.sm_range == 'undefined' ? _$257.clone(stx$615.token.range) : stx$615.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$615.token.lineNumber === current$614.lastLineNumber && current$614.lastLineNumber !== current$614.lineNumber) {
                stx$615.token.lineNumber = current$614.lineNumber;
            } else if (stx$615.token.lineNumber !== current$614.lastLineNumber) {
                current$614.lineNumber++;
                current$614.lastLineNumber = stx$615.token.lineNumber;
                stx$615.token.lineNumber = current$614.lineNumber;
            }
            return stx$615;
        });
    }
    function tokenValuesArePrefix$441(first$616, second$617) {
        // short circuit 
        if (second$617.length < first$616.length) {
            return false;
        }
        for (var i$618 = 0; i$618 < first$616.length; i$618++) {
            if (unwrapSyntax$266(first$616[i$618]) !== unwrapSyntax$266(second$617[i$618])) {
                return false;
            }
        }
        return true;
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$442(toks$619, context$620, prevStx$621, prevTerms$622) {
        assert$264(toks$619.length > 0, 'enforest assumes there are tokens to work with');
        prevStx$621 = prevStx$621 || [];
        prevTerms$622 = prevTerms$622 || [];
        function step$623(head$624, rest$625) {
            var innerTokens$626;
            assert$264(Array.isArray(rest$625), 'result must at least be an empty array');
            if (head$624.hasPrototype(TermTree$399)) {
                // function call
                var emp$629 = head$624.emp;
                var emp$629 = head$624.emp;
                var keyword$632 = head$624.keyword;
                var delim$634 = head$624.delim;
                var id$636 = head$624.id;
                var delim$634 = head$624.delim;
                var emp$629 = head$624.emp;
                var punc$640 = head$624.punc;
                var keyword$632 = head$624.keyword;
                var emp$629 = head$624.emp;
                var emp$629 = head$624.emp;
                var emp$629 = head$624.emp;
                var delim$634 = head$624.delim;
                var delim$634 = head$624.delim;
                var id$636 = head$624.id;
                var keyword$632 = head$624.keyword;
                var keyword$632 = head$624.keyword;
                var keyword$632 = head$624.keyword;
                var keyword$632 = head$624.keyword;
                if (head$624.hasPrototype(Expr$402) && rest$625[0] && rest$625[0].token.type === parser$258.Token.Delimiter && rest$625[0].token.value === '()') {
                    var argRes$673, enforestedArgs$674 = [], commas$675 = [];
                    rest$625[0].expose();
                    innerTokens$626 = rest$625[0].token.inner;
                    while (innerTokens$626.length > 0) {
                        argRes$673 = enforest$442(innerTokens$626, context$620);
                        enforestedArgs$674.push(argRes$673.result);
                        innerTokens$626 = argRes$673.rest;
                        if (innerTokens$626[0] && innerTokens$626[0].token.value === ',') {
                            // record the comma for later
                            commas$675.push(innerTokens$626[0]);
                            // but dump it for the next loop turn
                            innerTokens$626 = innerTokens$626.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$676 = _$257.all(enforestedArgs$674, function (argTerm$677) {
                            return argTerm$677.hasPrototype(Expr$402);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$626.length === 0 && argsAreExprs$676) {
                        return step$623(Call$425.create(head$624, enforestedArgs$674, rest$625[0], commas$675), rest$625.slice(1));
                    }
                } else if (head$624.hasPrototype(Expr$402) && rest$625[0] && unwrapSyntax$266(rest$625[0]) === '?') {
                    var question$678 = rest$625[0];
                    var condRes$679 = enforest$442(rest$625.slice(1), context$620);
                    var truExpr$680 = condRes$679.result;
                    var condRight$681 = condRes$679.rest;
                    if (truExpr$680.hasPrototype(Expr$402) && condRight$681[0] && unwrapSyntax$266(condRight$681[0]) === ':') {
                        var colon$682 = condRight$681[0];
                        var flsRes$683 = enforest$442(condRight$681.slice(1), context$620);
                        var flsExpr$684 = flsRes$683.result;
                        if (flsExpr$684.hasPrototype(Expr$402)) {
                            return step$623(ConditionalExpression$413.create(head$624, question$678, truExpr$680, colon$682, flsExpr$684), flsRes$683.rest);
                        }
                    }
                } else if (head$624.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$632) === 'new' && rest$625[0]) {
                    var newCallRes$685 = enforest$442(rest$625, context$620);
                    if (newCallRes$685.result.hasPrototype(Call$425)) {
                        return step$623(Const$424.create(head$624, newCallRes$685.result), newCallRes$685.rest);
                    }
                } else if (head$624.hasPrototype(Delimiter$416) && delim$634.token.value === '()' && rest$625[0] && rest$625[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$625[0]) === '=>') {
                    var arrowRes$686 = enforest$442(rest$625.slice(1), context$620);
                    if (arrowRes$686.result.hasPrototype(Expr$402)) {
                        return step$623(ArrowFun$420.create(delim$634, rest$625[0], arrowRes$686.result.destruct()), arrowRes$686.rest);
                    } else {
                        throwSyntaxError$265('enforest', 'Body of arrow function must be an expression', rest$625.slice(1));
                    }
                } else if (head$624.hasPrototype(Id$417) && rest$625[0] && rest$625[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$625[0]) === '=>') {
                    var res$687 = enforest$442(rest$625.slice(1), context$620);
                    if (res$687.result.hasPrototype(Expr$402)) {
                        return step$623(ArrowFun$420.create(id$636, rest$625[0], res$687.result.destruct()), res$687.rest);
                    } else {
                        throwSyntaxError$265('enforest', 'Body of arrow function must be an expression', rest$625.slice(1));
                    }
                } else if (head$624.hasPrototype(Delimiter$416) && delim$634.token.value === '()') {
                    innerTokens$626 = delim$634.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$626.length === 0) {
                        return step$623(ParenExpression$409.create(head$624), rest$625);
                    } else {
                        var innerTerm$688 = get_expression$443(innerTokens$626, context$620);
                        if (innerTerm$688.result && innerTerm$688.result.hasPrototype(Expr$402)) {
                            return step$623(ParenExpression$409.create(head$624), rest$625);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$624.hasPrototype(Expr$402) && rest$625[0] && rest$625[1] && stxIsBinOp$438(rest$625[0])) {
                    // Check if the operator is a macro first.
                    if (context$620.env.has(resolve$390(rest$625[0]))) {
                        var headStx$696 = tagWithTerm$444(head$624, head$624.destruct().reverse());
                        prevStx$621 = headStx$696.concat(prevStx$621);
                        prevTerms$622 = [head$624].concat(prevTerms$622);
                        return step$623(rest$625[0], rest$625.slice(1));
                    }
                    var op$689 = rest$625[0];
                    var left$690 = head$624;
                    var rightStx$691 = rest$625.slice(1);
                    var bopPrevStx$692 = [rest$625[0]].concat(head$624.destruct().reverse(), prevStx$621);
                    var bopPrevTerms$693 = [
                            Punc$415.create(rest$625[0]),
                            head$624
                        ].concat(prevTerms$622);
                    var bopRes$694 = enforest$442(rightStx$691, context$620, bopPrevStx$692, bopPrevTerms$693);
                    // Lookbehind was matched, so it may not even be a binop anymore.
                    if (bopRes$694.prevTerms.length < bopPrevTerms$693.length) {
                        return bopRes$694;
                    }
                    var right$695 = bopRes$694.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$695.hasPrototype(Expr$402)) {
                        return step$623(BinOp$412.create(op$689, left$690, right$695), bopRes$694.rest);
                    }
                } else if (head$624.hasPrototype(Punc$415) && stxIsUnaryOp$437(punc$640)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$624.punc.term = head$624;
                    var unopPrevStx$697 = [punc$640].concat(prevStx$621);
                    var unopPrevTerms$698 = [head$624].concat(prevTerms$622);
                    var unopRes$699 = enforest$442(rest$625, context$620, unopPrevStx$697, unopPrevTerms$698);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopRes$699.prevTerms.length < unopPrevTerms$698.length) {
                        return unopRes$699;
                    }
                    if (unopRes$699.result.hasPrototype(Expr$402)) {
                        return step$623(UnaryOp$410.create(punc$640, unopRes$699.result), unopRes$699.rest);
                    }
                } else if (head$624.hasPrototype(Keyword$414) && stxIsUnaryOp$437(keyword$632)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$624.keyword.term = head$624;
                    var unopKeyPrevStx$700 = [keyword$632].concat(prevStx$621);
                    var unopKeyPrevTerms$701 = [head$624].concat(prevTerms$622);
                    var unopKeyres$702 = enforest$442(rest$625, context$620, unopKeyPrevStx$700, unopKeyPrevTerms$701);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopKeyres$702.prevTerms.length < unopKeyPrevTerms$701.length) {
                        return unopKeyres$702;
                    }
                    if (unopKeyres$702.result.hasPrototype(Expr$402)) {
                        return step$623(UnaryOp$410.create(keyword$632, unopKeyres$702.result), unopKeyres$702.rest);
                    }
                } else if (head$624.hasPrototype(Expr$402) && rest$625[0] && (unwrapSyntax$266(rest$625[0]) === '++' || unwrapSyntax$266(rest$625[0]) === '--')) {
                    // Check if the operator is a macro first.
                    if (context$620.env.has(resolve$390(rest$625[0]))) {
                        var headStx$696 = tagWithTerm$444(head$624, head$624.destruct().reverse());
                        prevStx$621 = headStx$696.concat(prevStx$621);
                        prevTerms$622 = [head$624].concat(prevTerms$622);
                        return step$623(rest$625[0], rest$625.slice(1));
                    }
                    return step$623(PostfixOp$411.create(head$624, rest$625[0]), rest$625.slice(1));
                } else if (head$624.hasPrototype(Expr$402) && rest$625[0] && rest$625[0].token.value === '[]') {
                    return step$623(ObjGet$427.create(head$624, Delimiter$416.create(rest$625[0].expose())), rest$625.slice(1));
                } else if (head$624.hasPrototype(Expr$402) && rest$625[0] && unwrapSyntax$266(rest$625[0]) === '.' && rest$625[1] && rest$625[1].token.type === parser$258.Token.Identifier) {
                    return step$623(ObjDotGet$426.create(head$624, rest$625[0], rest$625[1]), rest$625.slice(2));
                } else if (head$624.hasPrototype(Delimiter$416) && delim$634.token.value === '[]') {
                    return step$623(ArrayLiteral$408.create(head$624), rest$625);
                } else if (head$624.hasPrototype(Delimiter$416) && head$624.delim.token.value === '{}') {
                    return step$623(Block$407.create(head$624), rest$625);
                } else if (head$624.hasPrototype(Id$417) && unwrapSyntax$266(id$636) === '#quoteSyntax' && rest$625[0] && rest$625[0].token.value === '{}') {
                    var tempId$703 = fresh$396();
                    context$620.templateMap.set(tempId$703, rest$625[0].token.inner);
                    return step$623(syn$259.makeIdent('getTemplate', id$636), [syn$259.makeDelim('()', [syn$259.makeValue(tempId$703, id$636)], id$636)].concat(rest$625.slice(1)));
                } else if (head$624.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$632) === 'let') {
                    var nameTokens$704 = [];
                    for (var i$705 = 0; i$705 < rest$625.length; i$705++) {
                        if (rest$625[i$705].token.type === parser$258.Token.Punctuator && rest$625[i$705].token.value === '=') {
                            break;
                        } else if (rest$625[i$705].token.type === parser$258.Token.Keyword || rest$625[i$705].token.type === parser$258.Token.Punctuator || rest$625[i$705].token.type === parser$258.Token.Identifier) {
                            nameTokens$704.push(rest$625[i$705]);
                        } else {
                            throwSyntaxError$265('enforest', 'Macro name must be a legal identifier or punctuator', rest$625[i$705]);
                        }
                    }
                    // Let macro
                    if (rest$625[i$705 + 1] && rest$625[i$705 + 1].token.value === 'macro') {
                        var mac$706 = enforest$442(rest$625.slice(i$705 + 1), context$620);
                        if (!mac$706.result.hasPrototype(AnonMacro$423)) {
                            throwSyntaxError$265('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$625.slice(i$705 + 1));
                        }
                        return step$623(LetMacro$421.create(nameTokens$704, mac$706.result.body), mac$706.rest);
                    }    // Let statement
                    else {
                        var lsRes$707 = enforestVarStatement$439(rest$625, context$620, keyword$632);
                        if (lsRes$707) {
                            return step$623(LetStatement$430.create(head$624, lsRes$707.result), lsRes$707.rest);
                        }
                    }
                } else if (head$624.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$632) === 'var' && rest$625[0]) {
                    var vsRes$708 = enforestVarStatement$439(rest$625, context$620, keyword$632);
                    if (vsRes$708) {
                        return step$623(VariableStatement$429.create(head$624, vsRes$708.result), vsRes$708.rest);
                    }
                } else if (head$624.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$632) === 'const' && rest$625[0]) {
                    var csRes$709 = enforestVarStatement$439(rest$625, context$620, keyword$632);
                    if (csRes$709) {
                        return step$623(ConstStatement$431.create(head$624, csRes$709.result), csRes$709.rest);
                    }
                } else if (head$624.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$632) === 'for' && rest$625[0] && rest$625[0].token.value === '()') {
                    return step$623(ForStatement$436.create(keyword$632, rest$625[0]), rest$625.slice(1));
                }
            } else {
                assert$264(head$624 && head$624.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$624.token.type === parser$258.Token.Identifier || head$624.token.type === parser$258.Token.Keyword || head$624.token.type === parser$258.Token.Punctuator) && expandCount$385 < maxExpands$386 && context$620.env.has(resolve$390(head$624)) && tokenValuesArePrefix$441(context$620.env.get(resolve$390(head$624)).fullName, [head$624].concat(rest$625))) {
                    // pull the macro transformer out the environment
                    var macroObj$710 = context$620.env.get(resolve$390(head$624));
                    var transformer$711 = macroObj$710.fn;
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$712 = fresh$396();
                    var transformerContext$713 = makeExpanderContext$452(_$257.defaults({ mark: newMark$712 }, context$620));
                    if (!builtinMode$384 && !macroObj$710.builtin) {
                        expandCount$385++;
                    }
                    // apply the transformer
                    var rt$714;
                    try {
                        rt$714 = transformer$711([head$624].concat(rest$625.slice(macroObj$710.fullName.length - 1)), transformerContext$713, prevStx$621, prevTerms$622);
                    } catch (e$715) {
                        if (e$715.type && e$715.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$716 = '`' + rest$625.slice(0, 5).map(function (stx$717) {
                                    return stx$717.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$265('macro', 'Macro `' + head$624.token.value + '` could not be matched with ' + argumentString$716, head$624);
                        } else {
                            // just rethrow it
                            throw e$715;
                        }
                    }
                    if (rt$714.prevTerms) {
                        prevTerms$622 = rt$714.prevTerms;
                    }
                    if (rt$714.prevStx) {
                        prevStx$621 = rt$714.prevStx;
                    }
                    if (!Array.isArray(rt$714.result)) {
                        throwSyntaxError$265('enforest', 'Macro must return a syntax array', head$624);
                    }
                    if (rt$714.result.length > 0) {
                        var adjustedResult$718 = adjustLineContext$440(rt$714.result, head$624);
                        adjustedResult$718[0].token.leadingComments = head$624.token.leadingComments;
                        return step$623(adjustedResult$718[0], adjustedResult$718.slice(1).concat(rt$714.rest));
                    } else {
                        return step$623(Empty$434.create(), rt$714.rest);
                    }
                }    // anon macro definition
                else if (head$624.token.type === parser$258.Token.Identifier && head$624.token.value === 'macro' && rest$625[0] && rest$625[0].token.value === '{}') {
                    return step$623(AnonMacro$423.create(rest$625[0].expose().token.inner), rest$625.slice(1));
                }    // macro definition
                else if (head$624.token.type === parser$258.Token.Identifier && head$624.token.value === 'macro') {
                    var nameTokens$704 = [];
                    for (var i$705 = 0; i$705 < rest$625.length; i$705++) {
                        // done with the name once we find the delimiter
                        if (rest$625[i$705].token.type === parser$258.Token.Delimiter) {
                            break;
                        } else if (rest$625[i$705].token.type === parser$258.Token.Identifier || rest$625[i$705].token.type === parser$258.Token.Keyword || rest$625[i$705].token.type === parser$258.Token.Punctuator) {
                            nameTokens$704.push(rest$625[i$705]);
                        } else {
                            throwSyntaxError$265('enforest', 'Macro name must be a legal identifier or punctuator', rest$625[i$705]);
                        }
                    }
                    if (rest$625[i$705] && rest$625[i$705].token.type === parser$258.Token.Delimiter) {
                        return step$623(Macro$422.create(nameTokens$704, rest$625[i$705].expose().token.inner), rest$625.slice(i$705 + 1));
                    } else {
                        throwSyntaxError$265('enforest', 'Macro declaration must include body', rest$625[i$705]);
                    }
                }    // module definition
                else if (unwrapSyntax$266(head$624) === 'module' && rest$625[0] && rest$625[0].token.value === '{}') {
                    return step$623(Module$433.create(rest$625[0]), rest$625.slice(1));
                }    // function definition
                else if (head$624.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$624) === 'function' && rest$625[0] && rest$625[0].token.type === parser$258.Token.Identifier && rest$625[1] && rest$625[1].token.type === parser$258.Token.Delimiter && rest$625[1].token.value === '()' && rest$625[2] && rest$625[2].token.type === parser$258.Token.Delimiter && rest$625[2].token.value === '{}') {
                    rest$625[1].token.inner = rest$625[1].expose().token.inner;
                    rest$625[2].token.inner = rest$625[2].expose().token.inner;
                    return step$623(NamedFun$418.create(head$624, null, rest$625[0], rest$625[1], rest$625[2]), rest$625.slice(3));
                }    // generator function definition
                else if (head$624.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$624) === 'function' && rest$625[0] && rest$625[0].token.type === parser$258.Token.Punctuator && rest$625[0].token.value === '*' && rest$625[1] && rest$625[1].token.type === parser$258.Token.Identifier && rest$625[2] && rest$625[2].token.type === parser$258.Token.Delimiter && rest$625[2].token.value === '()' && rest$625[3] && rest$625[3].token.type === parser$258.Token.Delimiter && rest$625[3].token.value === '{}') {
                    rest$625[2].token.inner = rest$625[2].expose().token.inner;
                    rest$625[3].token.inner = rest$625[3].expose().token.inner;
                    return step$623(NamedFun$418.create(head$624, rest$625[0], rest$625[1], rest$625[2], rest$625[3]), rest$625.slice(4));
                }    // anonymous function definition
                else if (head$624.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$624) === 'function' && rest$625[0] && rest$625[0].token.type === parser$258.Token.Delimiter && rest$625[0].token.value === '()' && rest$625[1] && rest$625[1].token.type === parser$258.Token.Delimiter && rest$625[1].token.value === '{}') {
                    rest$625[0].token.inner = rest$625[0].expose().token.inner;
                    rest$625[1].token.inner = rest$625[1].expose().token.inner;
                    return step$623(AnonFun$419.create(head$624, null, rest$625[0], rest$625[1]), rest$625.slice(2));
                }    // anonymous generator function definition
                else if (head$624.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$624) === 'function' && rest$625[0] && rest$625[0].token.type === parser$258.Token.Punctuator && rest$625[0].token.value === '*' && rest$625[1] && rest$625[1].token.type === parser$258.Token.Delimiter && rest$625[1].token.value === '()' && rest$625[2] && rest$625[2].token.type === parser$258.Token.Delimiter && rest$625[2].token.value === '{}') {
                    rest$625[1].token.inner = rest$625[1].expose().token.inner;
                    rest$625[2].token.inner = rest$625[2].expose().token.inner;
                    return step$623(AnonFun$419.create(head$624, rest$625[0], rest$625[1], rest$625[2]), rest$625.slice(3));
                }    // arrow function
                else if ((head$624.token.type === parser$258.Token.Delimiter && head$624.token.value === '()' || head$624.token.type === parser$258.Token.Identifier) && rest$625[0] && rest$625[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$625[0]) === '=>' && rest$625[1] && rest$625[1].token.type === parser$258.Token.Delimiter && rest$625[1].token.value === '{}') {
                    return step$623(ArrowFun$420.create(head$624, rest$625[0], rest$625[1]), rest$625.slice(2));
                }    // catch statement
                else if (head$624.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$624) === 'catch' && rest$625[0] && rest$625[0].token.type === parser$258.Token.Delimiter && rest$625[0].token.value === '()' && rest$625[1] && rest$625[1].token.type === parser$258.Token.Delimiter && rest$625[1].token.value === '{}') {
                    rest$625[0].token.inner = rest$625[0].expose().token.inner;
                    rest$625[1].token.inner = rest$625[1].expose().token.inner;
                    return step$623(CatchClause$432.create(head$624, rest$625[0], rest$625[1]), rest$625.slice(2));
                }    // this expression
                else if (head$624.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$624) === 'this') {
                    return step$623(ThisExpression$404.create(head$624), rest$625);
                }    // literal
                else if (head$624.token.type === parser$258.Token.NumericLiteral || head$624.token.type === parser$258.Token.StringLiteral || head$624.token.type === parser$258.Token.BooleanLiteral || head$624.token.type === parser$258.Token.RegularExpression || head$624.token.type === parser$258.Token.NullLiteral) {
                    return step$623(Lit$405.create(head$624), rest$625);
                }    // export
                else if (head$624.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$624) === 'export' && rest$625[0] && (rest$625[0].token.type === parser$258.Token.Identifier || rest$625[0].token.type === parser$258.Token.Keyword || rest$625[0].token.type === parser$258.Token.Punctuator)) {
                    return step$623(Export$435.create(rest$625[0]), rest$625.slice(1));
                }    // identifier
                else if (head$624.token.type === parser$258.Token.Identifier) {
                    return step$623(Id$417.create(head$624), rest$625);
                }    // punctuator
                else if (head$624.token.type === parser$258.Token.Punctuator) {
                    return step$623(Punc$415.create(head$624), rest$625);
                } else if (head$624.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$624) === 'with') {
                    throwSyntaxError$265('enforest', 'with is not supported in sweet.js', head$624);
                }    // keyword
                else if (head$624.token.type === parser$258.Token.Keyword) {
                    return step$623(Keyword$414.create(head$624), rest$625);
                }    // Delimiter
                else if (head$624.token.type === parser$258.Token.Delimiter) {
                    return step$623(Delimiter$416.create(head$624.expose()), rest$625);
                }    // end of file
                else if (head$624.token.type === parser$258.Token.EOF) {
                    assert$264(rest$625.length === 0, 'nothing should be after an EOF');
                    return step$623(EOF$400.create(head$624), []);
                } else {
                    // todo: are we missing cases?
                    assert$264(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$624,
                rest: rest$625,
                prevStx: prevStx$621,
                prevTerms: prevTerms$622
            };
        }
        return step$623(toks$619[0], toks$619.slice(1));
    }
    function get_expression$443(stx$719, context$720) {
        var res$721 = enforest$442(stx$719, context$720);
        var next$722 = res$721;
        var peek$723;
        var prevStx$724;
        if (!next$722.result.hasPrototype(Expr$402)) {
            return {
                result: null,
                rest: stx$719
            };
        }
        while (next$722.rest.length) {
            // Enforest the next term tree since it might be an infix macro that
            // consumes the initial expression.
            peek$723 = enforest$442(next$722.rest, context$720, next$722.result.destruct(), [next$722.result]);
            // If it has prev terms it wasn't infix, but it we need to run it
            // through enforest together with the initial expression to see if
            // it extends it into a longer expression.
            if (peek$723.prevTerms.length === 1) {
                peek$723 = enforest$442([next$722.result].concat(peek$723.result.destruct(), peek$723.rest), context$720);
            }
            // No new expression was created, so we've reached the end.
            if (peek$723.result === next$722.result) {
                break;
            }
            // A new expression was created, so loop back around and keep going.
            next$722 = peek$723;
        }
        return next$722;
    }
    function tagWithTerm$444(term$725, stx$726) {
        _$257.forEach(stx$726, function (s$727) {
            s$727.term = term$725;
        });
        return stx$726;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$445(newMark$728, env$729) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$730(match$731) {
            if (match$731.level === 0) {
                // replace the match property with the marked syntax
                match$731.match = _$257.map(match$731.match, function (stx$732) {
                    return stx$732.mark(newMark$728);
                });
            } else {
                _$257.each(match$731.match, function (match$733) {
                    dfs$730(match$733);
                });
            }
        }
        _$257.keys(env$729).forEach(function (key$734) {
            dfs$730(env$729[key$734]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$446(mac$735, context$736) {
        var body$737 = mac$735.body;
        // raw function primitive form
        if (!(body$737[0] && body$737[0].token.type === parser$258.Token.Keyword && body$737[0].token.value === 'function')) {
            throwSyntaxError$265('load macro', 'Primitive macro form must contain a function for the macro body', body$737);
        }
        var stub$738 = parser$258.read('()');
        stub$738[0].token.inner = body$737;
        var expanded$739 = expand$451(stub$738, context$736);
        expanded$739 = expanded$739[0].destruct().concat(expanded$739[1].eof);
        var flattend$740 = flatten$456(expanded$739);
        var bodyCode$741 = codegen$263.generate(parser$258.parse(flattend$740));
        var macroFn$742 = scopedEval$378(bodyCode$741, {
                makeValue: syn$259.makeValue,
                makeRegex: syn$259.makeRegex,
                makeIdent: syn$259.makeIdent,
                makeKeyword: syn$259.makeKeyword,
                makePunc: syn$259.makePunc,
                makeDelim: syn$259.makeDelim,
                getExpr: function (stx$743) {
                    var r$744;
                    if (stx$743.length === 0) {
                        return {
                            success: false,
                            result: [],
                            rest: []
                        };
                    }
                    r$744 = get_expression$443(stx$743, context$736);
                    return {
                        success: r$744.result !== null,
                        result: r$744.result === null ? [] : r$744.result.destruct(),
                        rest: r$744.rest
                    };
                },
                getIdent: function (stx$745) {
                    if (stx$745[0] && stx$745[0].token.type === parser$258.Token.Identifier) {
                        return {
                            success: true,
                            result: [stx$745[0]],
                            rest: stx$745.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$745
                    };
                },
                getLit: function (stx$746) {
                    if (stx$746[0] && patternModule$261.typeIsLiteral(stx$746[0].token.type)) {
                        return {
                            success: true,
                            result: [stx$746[0]],
                            rest: stx$746.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$746
                    };
                },
                unwrapSyntax: syn$259.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$265,
                prettyPrint: syn$259.prettyPrint,
                parser: parser$258,
                __fresh: fresh$396,
                _: _$257,
                patternModule: patternModule$261,
                getTemplate: function (id$747) {
                    return cloneSyntaxArray$447(context$736.templateMap.get(id$747));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$445,
                mergeMatches: function (newMatch$748, oldMatch$749) {
                    newMatch$748.patternEnv = _$257.extend({}, oldMatch$749.patternEnv, newMatch$748.patternEnv);
                    return newMatch$748;
                }
            });
        return macroFn$742;
    }
    function cloneSyntaxArray$447(arr$750) {
        return arr$750.map(function (stx$751) {
            var o$752 = syntaxFromToken$382(_$257.clone(stx$751.token), stx$751);
            if (o$752.token.type === parser$258.Token.Delimiter) {
                o$752.token.inner = cloneSyntaxArray$447(o$752.token.inner);
            }
            return o$752;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$448(stx$753, context$754, prevStx$755, prevTerms$756) {
        assert$264(context$754, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$753.length === 0) {
            return {
                terms: prevTerms$756 ? prevTerms$756.reverse() : [],
                context: context$754
            };
        }
        assert$264(stx$753[0].token, 'expecting a syntax object');
        var f$757 = enforest$442(stx$753, context$754, prevStx$755, prevTerms$756);
        // head :: TermTree
        var head$758 = f$757.result;
        // rest :: [Syntax]
        var rest$759 = f$757.rest;
        var macroDefinition$760;
        if (head$758.hasPrototype(Macro$422) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$760 = loadMacroDef$446(head$758, context$754);
            addToDefinitionCtx$449([head$758.name[0]], context$754.defscope, false);
            context$754.env.set(resolve$390(head$758.name[0]), {
                fn: macroDefinition$760,
                builtin: builtinMode$384,
                fullName: head$758.name
            });
            return expandToTermTree$448(rest$759, context$754, prevStx$755, prevTerms$756);
        }
        if (head$758.hasPrototype(LetMacro$421) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$760 = loadMacroDef$446(head$758, context$754);
            var freshName$764 = fresh$396();
            var name$765 = head$758.name[0];
            var renamedName$766 = name$765.rename(name$765, freshName$764);
            rest$759 = _$257.map(rest$759, function (stx$767) {
                return stx$767.rename(name$765, freshName$764);
            });
            head$758.name[0] = renamedName$766;
            context$754.env.set(resolve$390(renamedName$766), {
                fn: macroDefinition$760,
                builtin: builtinMode$384,
                fullName: head$758.name
            });
            return expandToTermTree$448(rest$759, context$754, prevStx$755, prevTerms$756);
        }
        // We build the newPrevTerms/Stx here (instead of at the beginning) so
        // that macro definitions don't get added to it.
        var destructed$761 = tagWithTerm$444(head$758, f$757.result.destruct());
        var newPrevTerms$762 = [head$758].concat(f$757.prevTerms);
        var newPrevStx$763 = destructed$761.reverse().concat(f$757.prevStx);
        if (head$758.hasPrototype(NamedFun$418)) {
            addToDefinitionCtx$449([head$758.name], context$754.defscope, true);
        }
        if (head$758.hasPrototype(VariableStatement$429)) {
            addToDefinitionCtx$449(_$257.map(head$758.decls, function (decl$768) {
                return decl$768.ident;
            }), context$754.defscope, true);
        }
        if (head$758.hasPrototype(Block$407) && head$758.body.hasPrototype(Delimiter$416)) {
            head$758.body.delim.token.inner.forEach(function (term$769) {
                if (term$769.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$449(_$257.map(term$769.decls, function (decl$770) {
                        return decl$770.ident;
                    }), context$754.defscope, true);
                }
            });
        }
        if (head$758.hasPrototype(Delimiter$416)) {
            head$758.delim.token.inner.forEach(function (term$771) {
                if (term$771.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$449(_$257.map(term$771.decls, function (decl$772) {
                        return decl$772.ident;
                    }), context$754.defscope, true);
                }
            });
        }
        if (head$758.hasPrototype(ForStatement$436)) {
            head$758.cond.expose();
            var forCond$773 = head$758.cond.token.inner;
            if (forCond$773[0] && resolve$390(forCond$773[0]) === 'let' && forCond$773[1] && forCond$773[1].token.type === parser$258.Token.Identifier) {
                var letNew$774 = fresh$396();
                var letId$775 = forCond$773[1];
                forCond$773 = forCond$773.map(function (stx$776) {
                    return stx$776.rename(letId$775, letNew$774);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$758.cond.token.inner = expand$451([forCond$773[0]], context$754).concat(expand$451(forCond$773.slice(1), context$754));
                // nice and easy case: `for (...) { ... }`
                if (rest$759[0] && rest$759[0].token.value === '{}') {
                    rest$759[0] = rest$759[0].rename(letId$775, letNew$774);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$777 = enforest$442(rest$759, context$754);
                    var bodyDestructed$778 = bodyEnf$777.result.destruct();
                    var renamedBodyTerm$779 = bodyEnf$777.result.rename(letId$775, letNew$774);
                    tagWithTerm$444(renamedBodyTerm$779, bodyDestructed$778);
                    return expandToTermTree$448(bodyEnf$777.rest, context$754, bodyDestructed$778.reverse().concat(newPrevStx$763), [renamedBodyTerm$779].concat(newPrevTerms$762));
                }
            } else {
                head$758.cond.token.inner = expand$451(head$758.cond.token.inner, context$754);
            }
        }
        return expandToTermTree$448(rest$759, context$754, newPrevStx$763, newPrevTerms$762);
    }
    function addToDefinitionCtx$449(idents$780, defscope$781, skipRep$782) {
        assert$264(idents$780 && idents$780.length > 0, 'expecting some variable identifiers');
        skipRep$782 = skipRep$782 || false;
        _$257.each(idents$780, function (id$783) {
            var skip$784 = false;
            if (skipRep$782) {
                var declRepeat$785 = _$257.find(defscope$781, function (def$786) {
                        return def$786.id.token.value === id$783.token.value && arraysEqual$391(marksof$389(def$786.id.context), marksof$389(id$783.context));
                    });
                skip$784 = typeof declRepeat$785 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$784) {
                var name$787 = fresh$396();
                defscope$781.push({
                    id: id$783,
                    name: name$787
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$450(term$788, context$789) {
        assert$264(context$789 && context$789.env, 'environment map is required');
        if (term$788.hasPrototype(ArrayLiteral$408)) {
            term$788.array.delim.token.inner = expand$451(term$788.array.delim.expose().token.inner, context$789);
            return term$788;
        } else if (term$788.hasPrototype(Block$407)) {
            term$788.body.delim.token.inner = expand$451(term$788.body.delim.expose().token.inner, context$789);
            return term$788;
        } else if (term$788.hasPrototype(ParenExpression$409)) {
            term$788.expr.delim.token.inner = expand$451(term$788.expr.delim.expose().token.inner, context$789);
            return term$788;
        } else if (term$788.hasPrototype(Call$425)) {
            term$788.fun = expandTermTreeToFinal$450(term$788.fun, context$789);
            term$788.args = _$257.map(term$788.args, function (arg$790) {
                return expandTermTreeToFinal$450(arg$790, context$789);
            });
            return term$788;
        } else if (term$788.hasPrototype(UnaryOp$410)) {
            term$788.expr = expandTermTreeToFinal$450(term$788.expr, context$789);
            return term$788;
        } else if (term$788.hasPrototype(BinOp$412)) {
            term$788.left = expandTermTreeToFinal$450(term$788.left, context$789);
            term$788.right = expandTermTreeToFinal$450(term$788.right, context$789);
            return term$788;
        } else if (term$788.hasPrototype(ObjGet$427)) {
            term$788.right.delim.token.inner = expand$451(term$788.right.delim.expose().token.inner, context$789);
            return term$788;
        } else if (term$788.hasPrototype(ObjDotGet$426)) {
            term$788.left = expandTermTreeToFinal$450(term$788.left, context$789);
            term$788.right = expandTermTreeToFinal$450(term$788.right, context$789);
            return term$788;
        } else if (term$788.hasPrototype(VariableDeclaration$428)) {
            if (term$788.init) {
                term$788.init = expandTermTreeToFinal$450(term$788.init, context$789);
            }
            return term$788;
        } else if (term$788.hasPrototype(VariableStatement$429)) {
            term$788.decls = _$257.map(term$788.decls, function (decl$791) {
                return expandTermTreeToFinal$450(decl$791, context$789);
            });
            return term$788;
        } else if (term$788.hasPrototype(Delimiter$416)) {
            // expand inside the delimiter and then continue on
            term$788.delim.token.inner = expand$451(term$788.delim.expose().token.inner, context$789);
            return term$788;
        } else if (term$788.hasPrototype(NamedFun$418) || term$788.hasPrototype(AnonFun$419) || term$788.hasPrototype(CatchClause$432) || term$788.hasPrototype(ArrowFun$420) || term$788.hasPrototype(Module$433)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$792 = [];
            var bodyContext$793 = makeExpanderContext$452(_$257.defaults({ defscope: newDef$792 }, context$789));
            var paramSingleIdent$794 = term$788.params && term$788.params.token.type === parser$258.Token.Identifier;
            var params$795;
            if (term$788.params && term$788.params.token.type === parser$258.Token.Delimiter) {
                params$795 = term$788.params.expose();
            } else if (paramSingleIdent$794) {
                params$795 = term$788.params;
            } else {
                params$795 = syn$259.makeDelim('()', [], null);
            }
            var bodies$796;
            if (Array.isArray(term$788.body)) {
                bodies$796 = syn$259.makeDelim('{}', term$788.body, null);
            } else {
                bodies$796 = term$788.body;
            }
            bodies$796 = bodies$796.addDefCtx(newDef$792);
            var paramNames$797 = _$257.map(getParamIdentifiers$398(params$795), function (param$804) {
                    var freshName$805 = fresh$396();
                    return {
                        freshName: freshName$805,
                        originalParam: param$804,
                        renamedParam: param$804.rename(param$804, freshName$805)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$798 = _$257.reduce(paramNames$797, function (accBody$806, p$807) {
                    return accBody$806.rename(p$807.originalParam, p$807.freshName);
                }, bodies$796);
            renamedBody$798 = renamedBody$798.expose();
            var expandedResult$799 = expandToTermTree$448(renamedBody$798.token.inner, bodyContext$793);
            var bodyTerms$800 = expandedResult$799.terms;
            var renamedParams$801 = _$257.map(paramNames$797, function (p$808) {
                    return p$808.renamedParam;
                });
            var flatArgs$802;
            if (paramSingleIdent$794) {
                flatArgs$802 = renamedParams$801[0];
            } else {
                flatArgs$802 = syn$259.makeDelim('()', joinSyntax$383(renamedParams$801, ','), term$788.params || null);
            }
            var expandedArgs$803 = expand$451([flatArgs$802], bodyContext$793);
            assert$264(expandedArgs$803.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$788.params) {
                term$788.params = expandedArgs$803[0];
            }
            bodyTerms$800 = _$257.map(bodyTerms$800, function (bodyTerm$809) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$810 = bodyTerm$809.addDefCtx(newDef$792);
                // finish expansion
                return expandTermTreeToFinal$450(termWithCtx$810, expandedResult$799.context);
            });
            if (term$788.hasPrototype(Module$433)) {
                bodyTerms$800 = _$257.filter(bodyTerms$800, function (bodyTerm$811) {
                    if (bodyTerm$811.hasPrototype(Export$435)) {
                        term$788.exports.push(bodyTerm$811);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$798.token.inner = bodyTerms$800;
            if (Array.isArray(term$788.body)) {
                term$788.body = renamedBody$798.token.inner;
            } else {
                term$788.body = renamedBody$798;
            }
            // and continue expand the rest
            return term$788;
        }
        // the term is fine as is
        return term$788;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$451(stx$812, context$813) {
        assert$264(context$813, 'must provide an expander context');
        var trees$814 = expandToTermTree$448(stx$812, context$813);
        return _$257.map(trees$814.terms, function (term$815) {
            return expandTermTreeToFinal$450(term$815, trees$814.context);
        });
    }
    function makeExpanderContext$452(o$816) {
        o$816 = o$816 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$816.env || new StringMap$377(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$816.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$816.templateMap || new StringMap$377(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$816.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$453(stx$817, moduleContexts$818, _maxExpands$819) {
        moduleContexts$818 = moduleContexts$818 || [];
        maxExpands$386 = _maxExpands$819 || Infinity;
        expandCount$385 = 0;
        var context$820 = makeExpanderContext$452();
        var modBody$821 = syn$259.makeDelim('{}', stx$817, null);
        modBody$821 = _$257.reduce(moduleContexts$818, function (acc$823, mod$824) {
            context$820.env.extend(mod$824.env);
            return loadModuleExports$455(acc$823, context$820.env, mod$824.exports, mod$824.env);
        }, modBody$821);
        var res$822 = expand$451([
                syn$259.makeIdent('module', null),
                modBody$821
            ], context$820);
        res$822 = res$822[0].destruct();
        return flatten$456(res$822[0].token.inner);
    }
    function expandModule$454(stx$825, moduleContexts$826) {
        moduleContexts$826 = moduleContexts$826 || [];
        maxExpands$386 = Infinity;
        expandCount$385 = 0;
        var context$827 = makeExpanderContext$452();
        var modBody$828 = syn$259.makeDelim('{}', stx$825, null);
        modBody$828 = _$257.reduce(moduleContexts$826, function (acc$830, mod$831) {
            context$827.env.extend(mod$831.env);
            return loadModuleExports$455(acc$830, context$827.env, mod$831.exports, mod$831.env);
        }, modBody$828);
        builtinMode$384 = true;
        var moduleRes$829 = expand$451([
                syn$259.makeIdent('module', null),
                modBody$828
            ], context$827);
        builtinMode$384 = false;
        context$827.exports = _$257.map(moduleRes$829[0].exports, function (term$832) {
            return {
                oldExport: term$832.name,
                newParam: syn$259.makeIdent(term$832.name.token.value, null)
            };
        });
        return context$827;
    }
    function loadModuleExports$455(stx$833, newEnv$834, exports$835, oldEnv$836) {
        return _$257.reduce(exports$835, function (acc$837, param$838) {
            var newName$839 = fresh$396();
            newEnv$834.set(resolve$390(param$838.newParam.rename(param$838.newParam, newName$839)), oldEnv$836.get(resolve$390(param$838.oldExport)));
            return acc$837.rename(param$838.newParam, newName$839);
        }, stx$833);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$456(stx$840) {
        return _$257.reduce(stx$840, function (acc$841, stx$842) {
            if (stx$842.token.type === parser$258.Token.Delimiter) {
                var exposed$843 = stx$842.expose();
                var openParen$844 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$842.token.value[0],
                        range: stx$842.token.startRange,
                        sm_range: typeof stx$842.token.sm_startRange == 'undefined' ? stx$842.token.startRange : stx$842.token.sm_startRange,
                        lineNumber: stx$842.token.startLineNumber,
                        sm_lineNumber: typeof stx$842.token.sm_startLineNumber == 'undefined' ? stx$842.token.startLineNumber : stx$842.token.sm_startLineNumber,
                        lineStart: stx$842.token.startLineStart,
                        sm_lineStart: typeof stx$842.token.sm_startLineStart == 'undefined' ? stx$842.token.startLineStart : stx$842.token.sm_startLineStart
                    }, exposed$843);
                var closeParen$845 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$842.token.value[1],
                        range: stx$842.token.endRange,
                        sm_range: typeof stx$842.token.sm_endRange == 'undefined' ? stx$842.token.endRange : stx$842.token.sm_endRange,
                        lineNumber: stx$842.token.endLineNumber,
                        sm_lineNumber: typeof stx$842.token.sm_endLineNumber == 'undefined' ? stx$842.token.endLineNumber : stx$842.token.sm_endLineNumber,
                        lineStart: stx$842.token.endLineStart,
                        sm_lineStart: typeof stx$842.token.sm_endLineStart == 'undefined' ? stx$842.token.endLineStart : stx$842.token.sm_endLineStart
                    }, exposed$843);
                if (stx$842.token.leadingComments) {
                    openParen$844.token.leadingComments = stx$842.token.leadingComments;
                }
                if (stx$842.token.trailingComments) {
                    openParen$844.token.trailingComments = stx$842.token.trailingComments;
                }
                acc$841.push(openParen$844);
                push$387.apply(acc$841, flatten$456(exposed$843.token.inner));
                acc$841.push(closeParen$845);
                return acc$841;
            }
            stx$842.token.sm_lineNumber = stx$842.token.sm_lineNumber ? stx$842.token.sm_lineNumber : stx$842.token.lineNumber;
            stx$842.token.sm_lineStart = stx$842.token.sm_lineStart ? stx$842.token.sm_lineStart : stx$842.token.lineStart;
            stx$842.token.sm_range = stx$842.token.sm_range ? stx$842.token.sm_range : stx$842.token.range;
            acc$841.push(stx$842);
            return acc$841;
        }, []);
    }
    exports$256.StringMap = StringMap$377;
    exports$256.enforest = enforest$442;
    exports$256.expand = expandTopLevel$453;
    exports$256.expandModule = expandModule$454;
    exports$256.resolve = resolve$390;
    exports$256.get_expression = get_expression$443;
    exports$256.makeExpanderContext = makeExpanderContext$452;
    exports$256.Expr = Expr$402;
    exports$256.VariableStatement = VariableStatement$429;
    exports$256.tokensToSyntax = syn$259.tokensToSyntax;
    exports$256.syntaxToTokens = syn$259.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map