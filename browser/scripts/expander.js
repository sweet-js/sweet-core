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
                var o$456 = Object.create(this);
                if (typeof o$456.construct === 'function') {
                    o$456.construct.apply(o$456, arguments);
                }
                return o$456;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$457) {
                var result$458 = Object.create(this);
                for (var prop$459 in properties$457) {
                    if (properties$457.hasOwnProperty(prop$459)) {
                        result$458[prop$459] = properties$457[prop$459];
                    }
                }
                return result$458;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$460) {
                function F$461() {
                }
                F$461.prototype = proto$460;
                return this instanceof F$461;
            },
            enumerable: false,
            writable: true
        }
    });
    function StringMap$377(o$462) {
        this.__data = o$462 || {};
    }
    StringMap$377.prototype = {
        has: function (key$463) {
            return Object.prototype.hasOwnProperty.call(this.__data, key$463);
        },
        get: function (key$464) {
            return this.has(key$464) ? this.__data[key$464] : void 0;
        },
        set: function (key$465, value$466) {
            this.__data[key$465] = value$466;
        },
        extend: function () {
            var args$467 = _$257.map(_$257.toArray(arguments), function (x$468) {
                    return x$468.__data;
                });
            _$257.extend.apply(_$257, [this.__data].concat(args$467));
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
    function remdup$388(mark$469, mlist$470) {
        if (mark$469 === _$257.first(mlist$470)) {
            return _$257.rest(mlist$470, 1);
        }
        return [mark$469].concat(mlist$470);
    }
    // (CSyntax) -> [...Num]
    function marksof$389(ctx$471, stopName$472, originalName$473) {
        var mark$474, submarks$475;
        if (ctx$471 instanceof Mark$380) {
            mark$474 = ctx$471.mark;
            submarks$475 = marksof$389(ctx$471.context, stopName$472, originalName$473);
            return remdup$388(mark$474, submarks$475);
        }
        if (ctx$471 instanceof Def$381) {
            return marksof$389(ctx$471.context, stopName$472, originalName$473);
        }
        if (ctx$471 instanceof Rename$379) {
            if (stopName$472 === originalName$473 + '$' + ctx$471.name) {
                return [];
            }
            return marksof$389(ctx$471.context, stopName$472, originalName$473);
        }
        return [];
    }
    function resolve$390(stx$476) {
        return resolveCtx$394(stx$476.token.value, stx$476.context, [], []);
    }
    function arraysEqual$391(a$477, b$478) {
        if (a$477.length !== b$478.length) {
            return false;
        }
        for (var i$479 = 0; i$479 < a$477.length; i$479++) {
            if (a$477[i$479] !== b$478[i$479]) {
                return false;
            }
        }
        return true;
    }
    function renames$392(defctx$480, oldctx$481, originalName$482) {
        var acc$483 = oldctx$481;
        for (var i$484 = 0; i$484 < defctx$480.length; i$484++) {
            if (defctx$480[i$484].id.token.value === originalName$482) {
                acc$483 = new Rename$379(defctx$480[i$484].id, defctx$480[i$484].name, acc$483, defctx$480);
            }
        }
        return acc$483;
    }
    function unionEl$393(arr$485, el$486) {
        if (arr$485.indexOf(el$486) === -1) {
            var res$487 = arr$485.slice(0);
            res$487.push(el$486);
            return res$487;
        }
        return arr$485;
    }
    // (Syntax) -> String
    function resolveCtx$394(originalName$488, ctx$489, stop_spine$490, stop_branch$491) {
        if (ctx$489 instanceof Mark$380) {
            return resolveCtx$394(originalName$488, ctx$489.context, stop_spine$490, stop_branch$491);
        }
        if (ctx$489 instanceof Def$381) {
            if (stop_spine$490.indexOf(ctx$489.defctx) !== -1) {
                return resolveCtx$394(originalName$488, ctx$489.context, stop_spine$490, stop_branch$491);
            } else {
                return resolveCtx$394(originalName$488, renames$392(ctx$489.defctx, ctx$489.context, originalName$488), stop_spine$490, unionEl$393(stop_branch$491, ctx$489.defctx));
            }
        }
        if (ctx$489 instanceof Rename$379) {
            if (originalName$488 === ctx$489.id.token.value) {
                var idName$492 = resolveCtx$394(ctx$489.id.token.value, ctx$489.id.context, stop_branch$491, stop_branch$491);
                var subName$493 = resolveCtx$394(originalName$488, ctx$489.context, unionEl$393(stop_spine$490, ctx$489.def), stop_branch$491);
                if (idName$492 === subName$493) {
                    var idMarks$494 = marksof$389(ctx$489.id.context, originalName$488 + '$' + ctx$489.name, originalName$488);
                    var subMarks$495 = marksof$389(ctx$489.context, originalName$488 + '$' + ctx$489.name, originalName$488);
                    if (arraysEqual$391(idMarks$494, subMarks$495)) {
                        return originalName$488 + '$' + ctx$489.name;
                    }
                }
            }
            return resolveCtx$394(originalName$488, ctx$489.context, stop_spine$490, stop_branch$491);
        }
        return originalName$488;
    }
    var nextFresh$395 = 0;
    // fun () -> Num
    function fresh$396() {
        return nextFresh$395++;
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$397(towrap$496, delimSyntax$497) {
        assert$264(delimSyntax$497.token.type === parser$258.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$382({
            type: parser$258.Token.Delimiter,
            value: delimSyntax$497.token.value,
            inner: towrap$496,
            range: delimSyntax$497.token.range,
            startLineNumber: delimSyntax$497.token.startLineNumber,
            lineStart: delimSyntax$497.token.lineStart
        }, delimSyntax$497);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$398(argSyntax$498) {
        if (argSyntax$498.token.type === parser$258.Token.Delimiter) {
            return _$257.filter(argSyntax$498.token.inner, function (stx$499) {
                return stx$499.token.value !== ',';
            });
        } else if (argSyntax$498.token.type === parser$258.Token.Identifier) {
            return [argSyntax$498];
        } else {
            assert$264(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$399 = {
            destruct: function () {
                return _$257.reduce(this.properties, _$257.bind(function (acc$500, prop$501) {
                    if (this[prop$501] && this[prop$501].hasPrototype(TermTree$399)) {
                        push$387.apply(acc$500, this[prop$501].destruct());
                        return acc$500;
                    } else if (this[prop$501] && this[prop$501].token && this[prop$501].token.inner) {
                        var clone$502 = syntaxFromToken$382(_$257.clone(this[prop$501].token), this[prop$501]);
                        clone$502.token.inner = _$257.reduce(clone$502.token.inner, function (acc$503, t$504) {
                            if (t$504.hasPrototype(TermTree$399)) {
                                push$387.apply(acc$503, t$504.destruct());
                                return acc$503;
                            }
                            acc$503.push(t$504);
                            return acc$503;
                        }, []);
                        acc$500.push(clone$502);
                        return acc$500;
                    } else if (Array.isArray(this[prop$501])) {
                        var destArr$505 = _$257.reduce(this[prop$501], function (acc$506, t$507) {
                                if (t$507.hasPrototype(TermTree$399)) {
                                    push$387.apply(acc$506, t$507.destruct());
                                    return acc$506;
                                }
                                acc$506.push(t$507);
                                return acc$506;
                            }, []);
                        push$387.apply(acc$500, destArr$505);
                        return acc$500;
                    } else if (this[prop$501]) {
                        acc$500.push(this[prop$501]);
                        return acc$500;
                    } else {
                        return acc$500;
                    }
                }, this), []);
            },
            addDefCtx: function (def$508) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$509) {
                    var prop$510 = this.properties[i$509];
                    if (Array.isArray(this[prop$510])) {
                        this[prop$510] = _$257.map(this[prop$510], function (item$511) {
                            return item$511.addDefCtx(def$508);
                        });
                    } else if (this[prop$510]) {
                        this[prop$510] = this[prop$510].addDefCtx(def$508);
                    }
                }, this));
                return this;
            },
            rename: function (id$512, name$513) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$514) {
                    var prop$515 = this.properties[i$514];
                    if (Array.isArray(this[prop$515])) {
                        this[prop$515] = _$257.map(this[prop$515], function (item$516) {
                            return item$516.rename(id$512, name$513);
                        });
                    } else if (this[prop$515]) {
                        this[prop$515] = this[prop$515].rename(id$512, name$513);
                    }
                }, this));
                return this;
            }
        };
    var EOF$400 = TermTree$399.extend({
            properties: ['eof'],
            construct: function (e$517) {
                this.eof = e$517;
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
            construct: function (that$518) {
                this.this = that$518;
            }
        });
    var Lit$405 = PrimaryExpression$403.extend({
            properties: ['lit'],
            construct: function (l$519) {
                this.lit = l$519;
            }
        });
    exports$256._test.PropertyAssignment = PropertyAssignment$406;
    var PropertyAssignment$406 = TermTree$399.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$520, assignment$521) {
                this.propName = propName$520;
                this.assignment = assignment$521;
            }
        });
    var Block$407 = PrimaryExpression$403.extend({
            properties: ['body'],
            construct: function (body$522) {
                this.body = body$522;
            }
        });
    var ArrayLiteral$408 = PrimaryExpression$403.extend({
            properties: ['array'],
            construct: function (ar$523) {
                this.array = ar$523;
            }
        });
    var ParenExpression$409 = PrimaryExpression$403.extend({
            properties: ['expr'],
            construct: function (expr$524) {
                this.expr = expr$524;
            }
        });
    var UnaryOp$410 = Expr$402.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$525, expr$526) {
                this.op = op$525;
                this.expr = expr$526;
            }
        });
    var PostfixOp$411 = Expr$402.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$527, op$528) {
                this.expr = expr$527;
                this.op = op$528;
            }
        });
    var BinOp$412 = Expr$402.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$529, left$530, right$531) {
                this.op = op$529;
                this.left = left$530;
                this.right = right$531;
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
            construct: function (cond$532, question$533, tru$534, colon$535, fls$536) {
                this.cond = cond$532;
                this.question = question$533;
                this.tru = tru$534;
                this.colon = colon$535;
                this.fls = fls$536;
            }
        });
    var Keyword$414 = TermTree$399.extend({
            properties: ['keyword'],
            construct: function (k$537) {
                this.keyword = k$537;
            }
        });
    var Punc$415 = TermTree$399.extend({
            properties: ['punc'],
            construct: function (p$538) {
                this.punc = p$538;
            }
        });
    var Delimiter$416 = TermTree$399.extend({
            properties: ['delim'],
            construct: function (d$539) {
                this.delim = d$539;
            }
        });
    var Id$417 = PrimaryExpression$403.extend({
            properties: ['id'],
            construct: function (id$540) {
                this.id = id$540;
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
            construct: function (keyword$541, star$542, name$543, params$544, body$545) {
                this.keyword = keyword$541;
                this.star = star$542;
                this.name = name$543;
                this.params = params$544;
                this.body = body$545;
            }
        });
    var AnonFun$419 = Expr$402.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$546, star$547, params$548, body$549) {
                this.keyword = keyword$546;
                this.star = star$547;
                this.params = params$548;
                this.body = body$549;
            }
        });
    var ArrowFun$420 = Expr$402.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$550, arrow$551, body$552) {
                this.params = params$550;
                this.arrow = arrow$551;
                this.body = body$552;
            }
        });
    var LetMacro$421 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$553, body$554) {
                this.name = name$553;
                this.body = body$554;
            }
        });
    var Macro$422 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$555, body$556) {
                this.name = name$555;
                this.body = body$556;
            }
        });
    var AnonMacro$423 = TermTree$399.extend({
            properties: ['body'],
            construct: function (body$557) {
                this.body = body$557;
            }
        });
    var Const$424 = Expr$402.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$558, call$559) {
                this.newterm = newterm$558;
                this.call = call$559;
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
                var commas$560 = this.commas.slice();
                var delim$561 = syntaxFromToken$382(_$257.clone(this.delim.token), this.delim);
                delim$561.token.inner = _$257.reduce(this.args, function (acc$563, term$564) {
                    assert$264(term$564 && term$564.hasPrototype(TermTree$399), 'expecting term trees in destruct of Call');
                    push$387.apply(acc$563, term$564.destruct());
                    // add all commas except for the last one
                    if (commas$560.length > 0) {
                        acc$563.push(commas$560.shift());
                    }
                    return acc$563;
                }, []);
                var res$562 = this.fun.destruct();
                push$387.apply(res$562, Delimiter$416.create(delim$561).destruct());
                return res$562;
            },
            construct: function (funn$565, args$566, delim$567, commas$568) {
                assert$264(Array.isArray(args$566), 'requires an array of arguments terms');
                this.fun = funn$565;
                this.args = args$566;
                this.delim = delim$567;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$568;
            }
        });
    var ObjDotGet$426 = Expr$402.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$569, dot$570, right$571) {
                this.left = left$569;
                this.dot = dot$570;
                this.right = right$571;
            }
        });
    var ObjGet$427 = Expr$402.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$572, right$573) {
                this.left = left$572;
                this.right = right$573;
            }
        });
    var VariableDeclaration$428 = TermTree$399.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$574, eqstx$575, init$576, comma$577) {
                this.ident = ident$574;
                this.eqstx = eqstx$575;
                this.init = init$576;
                this.comma = comma$577;
            }
        });
    var VariableStatement$429 = Statement$401.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$257.reduce(this.decls, function (acc$578, decl$579) {
                    push$387.apply(acc$578, decl$579.destruct());
                    return acc$578;
                }, []));
            },
            construct: function (varkw$580, decls$581) {
                assert$264(Array.isArray(decls$581), 'decls must be an array');
                this.varkw = varkw$580;
                this.decls = decls$581;
            }
        });
    var LetStatement$430 = Statement$401.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$257.reduce(this.decls, function (acc$582, decl$583) {
                    push$387.apply(acc$582, decl$583.destruct());
                    return acc$582;
                }, []));
            },
            construct: function (letkw$584, decls$585) {
                assert$264(Array.isArray(decls$585), 'decls must be an array');
                this.letkw = letkw$584;
                this.decls = decls$585;
            }
        });
    var ConstStatement$431 = Statement$401.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$257.reduce(this.decls, function (acc$586, decl$587) {
                    push$387.apply(acc$586, decl$587.destruct());
                    return acc$586;
                }, []));
            },
            construct: function (constkw$588, decls$589) {
                assert$264(Array.isArray(decls$589), 'decls must be an array');
                this.constkw = constkw$588;
                this.decls = decls$589;
            }
        });
    var CatchClause$432 = Statement$401.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$590, params$591, body$592) {
                this.catchkw = catchkw$590;
                this.params = params$591;
                this.body = body$592;
            }
        });
    var Module$433 = TermTree$399.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$593) {
                this.body = body$593;
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
            construct: function (name$594) {
                this.name = name$594;
            }
        });
    var ForStatement$436 = Statement$401.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$595, cond$596) {
                this.forkw = forkw$595;
                this.cond = cond$596;
            }
        });
    function stxIsUnaryOp$437(stx$597) {
        var staticOperators$598 = [
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
        return _$257.contains(staticOperators$598, unwrapSyntax$266(stx$597));
    }
    function stxIsBinOp$438(stx$599) {
        var staticOperators$600 = [
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
        return _$257.contains(staticOperators$600, unwrapSyntax$266(stx$599));
    }
    function enforestVarStatement$439(stx$601, context$602, varStx$603) {
        var isLet$604 = /^(?:let|const)$/.test(varStx$603.token.value);
        var decls$605 = [];
        var rest$606 = stx$601;
        var rhs$607;
        if (!rest$606.length) {
            throwSyntaxError$265('enforest', 'Unexpected end of input', varStx$603);
        }
        while (rest$606.length) {
            if (rest$606[0].token.type === parser$258.Token.Identifier) {
                if (isLet$604) {
                    var freshName$608 = fresh$396();
                    var renamedId$609 = rest$606[0].rename(rest$606[0], freshName$608);
                    rest$606 = rest$606.map(function (stx$610) {
                        return stx$610.rename(rest$606[0], freshName$608);
                    });
                    rest$606[0] = renamedId$609;
                }
                if (rest$606[1].token.type === parser$258.Token.Punctuator && rest$606[1].token.value === '=') {
                    rhs$607 = get_expression$443(rest$606.slice(2), context$602);
                    if (rhs$607.result == null) {
                        throwSyntaxError$265('enforest', 'Unexpected token', rhs$607.rest[0]);
                    }
                    if (rhs$607.rest[0].token.type === parser$258.Token.Punctuator && rhs$607.rest[0].token.value === ',') {
                        decls$605.push(VariableDeclaration$428.create(rest$606[0], rest$606[1], rhs$607.result, rhs$607.rest[0]));
                        rest$606 = rhs$607.rest.slice(1);
                        continue;
                    } else {
                        decls$605.push(VariableDeclaration$428.create(rest$606[0], rest$606[1], rhs$607.result, null));
                        rest$606 = rhs$607.rest;
                        break;
                    }
                } else if (rest$606[1].token.type === parser$258.Token.Punctuator && rest$606[1].token.value === ',') {
                    decls$605.push(VariableDeclaration$428.create(rest$606[0], null, null, rest$606[1]));
                    rest$606 = rest$606.slice(2);
                } else {
                    decls$605.push(VariableDeclaration$428.create(rest$606[0], null, null, null));
                    rest$606 = rest$606.slice(1);
                    break;
                }
            } else {
                throwSyntaxError$265('enforest', 'Unexpected token', rest$606[0]);
            }
        }
        return {
            result: decls$605,
            rest: rest$606
        };
    }
    function adjustLineContext$440(stx$611, original$612, current$613) {
        current$613 = current$613 || {
            lastLineNumber: original$612.token.lineNumber,
            lineNumber: original$612.token.lineNumber - 1
        };
        return _$257.map(stx$611, function (stx$614) {
            if (stx$614.token.type === parser$258.Token.Delimiter) {
                // handle tokens with missing line info
                stx$614.token.startLineNumber = typeof stx$614.token.startLineNumber == 'undefined' ? original$612.token.lineNumber : stx$614.token.startLineNumber;
                stx$614.token.endLineNumber = typeof stx$614.token.endLineNumber == 'undefined' ? original$612.token.lineNumber : stx$614.token.endLineNumber;
                stx$614.token.startLineStart = typeof stx$614.token.startLineStart == 'undefined' ? original$612.token.lineStart : stx$614.token.startLineStart;
                stx$614.token.endLineStart = typeof stx$614.token.endLineStart == 'undefined' ? original$612.token.lineStart : stx$614.token.endLineStart;
                stx$614.token.startRange = typeof stx$614.token.startRange == 'undefined' ? original$612.token.range : stx$614.token.startRange;
                stx$614.token.endRange = typeof stx$614.token.endRange == 'undefined' ? original$612.token.range : stx$614.token.endRange;
                stx$614.token.sm_startLineNumber = typeof stx$614.token.sm_startLineNumber == 'undefined' ? stx$614.token.startLineNumber : stx$614.token.sm_startLineNumber;
                stx$614.token.sm_endLineNumber = typeof stx$614.token.sm_endLineNumber == 'undefined' ? stx$614.token.endLineNumber : stx$614.token.sm_endLineNumber;
                stx$614.token.sm_startLineStart = typeof stx$614.token.sm_startLineStart == 'undefined' ? stx$614.token.startLineStart : stx$614.token.sm_startLineStart;
                stx$614.token.sm_endLineStart = typeof stx$614.token.sm_endLineStart == 'undefined' ? stx$614.token.endLineStart : stx$614.token.sm_endLineStart;
                stx$614.token.sm_startRange = typeof stx$614.token.sm_startRange == 'undefined' ? stx$614.token.startRange : stx$614.token.sm_startRange;
                stx$614.token.sm_endRange = typeof stx$614.token.sm_endRange == 'undefined' ? stx$614.token.endRange : stx$614.token.sm_endRange;
                if (stx$614.token.startLineNumber === current$613.lastLineNumber && current$613.lastLineNumber !== current$613.lineNumber) {
                    stx$614.token.startLineNumber = current$613.lineNumber;
                } else if (stx$614.token.startLineNumber !== current$613.lastLineNumber) {
                    current$613.lineNumber++;
                    current$613.lastLineNumber = stx$614.token.startLineNumber;
                    stx$614.token.startLineNumber = current$613.lineNumber;
                }
                if (stx$614.token.inner.length > 0) {
                    stx$614.token.inner = adjustLineContext$440(stx$614.token.inner, original$612, current$613);
                }
                return stx$614;
            }
            // handle tokens with missing line info
            stx$614.token.lineNumber = typeof stx$614.token.lineNumber == 'undefined' ? original$612.token.lineNumber : stx$614.token.lineNumber;
            stx$614.token.lineStart = typeof stx$614.token.lineStart == 'undefined' ? original$612.token.lineStart : stx$614.token.lineStart;
            stx$614.token.range = typeof stx$614.token.range == 'undefined' ? original$612.token.range : stx$614.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$614.token.sm_lineNumber = typeof stx$614.token.sm_lineNumber == 'undefined' ? stx$614.token.lineNumber : stx$614.token.sm_lineNumber;
            stx$614.token.sm_lineStart = typeof stx$614.token.sm_lineStart == 'undefined' ? stx$614.token.lineStart : stx$614.token.sm_lineStart;
            stx$614.token.sm_range = typeof stx$614.token.sm_range == 'undefined' ? _$257.clone(stx$614.token.range) : stx$614.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$614.token.lineNumber === current$613.lastLineNumber && current$613.lastLineNumber !== current$613.lineNumber) {
                stx$614.token.lineNumber = current$613.lineNumber;
            } else if (stx$614.token.lineNumber !== current$613.lastLineNumber) {
                current$613.lineNumber++;
                current$613.lastLineNumber = stx$614.token.lineNumber;
                stx$614.token.lineNumber = current$613.lineNumber;
            }
            return stx$614;
        });
    }
    function tokenValuesArePrefix$441(first$615, second$616) {
        // short circuit 
        if (second$616.length < first$615.length) {
            return false;
        }
        for (var i$617 = 0; i$617 < first$615.length; i$617++) {
            if (unwrapSyntax$266(first$615[i$617]) !== unwrapSyntax$266(second$616[i$617])) {
                return false;
            }
        }
        return true;
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$442(toks$618, context$619, prevStx$620, prevTerms$621) {
        assert$264(toks$618.length > 0, 'enforest assumes there are tokens to work with');
        prevStx$620 = prevStx$620 || [];
        prevTerms$621 = prevTerms$621 || [];
        function step$622(head$623, rest$624) {
            var innerTokens$625;
            assert$264(Array.isArray(rest$624), 'result must at least be an empty array');
            if (head$623.hasPrototype(TermTree$399)) {
                // function call
                var emp$628 = head$623.emp;
                var emp$628 = head$623.emp;
                var keyword$631 = head$623.keyword;
                var delim$633 = head$623.delim;
                var id$635 = head$623.id;
                var delim$633 = head$623.delim;
                var emp$628 = head$623.emp;
                var punc$639 = head$623.punc;
                var keyword$631 = head$623.keyword;
                var emp$628 = head$623.emp;
                var emp$628 = head$623.emp;
                var emp$628 = head$623.emp;
                var delim$633 = head$623.delim;
                var delim$633 = head$623.delim;
                var id$635 = head$623.id;
                var keyword$631 = head$623.keyword;
                var keyword$631 = head$623.keyword;
                var keyword$631 = head$623.keyword;
                var keyword$631 = head$623.keyword;
                if (head$623.hasPrototype(Expr$402) && rest$624[0] && rest$624[0].token.type === parser$258.Token.Delimiter && rest$624[0].token.value === '()') {
                    var argRes$672, enforestedArgs$673 = [], commas$674 = [];
                    rest$624[0].expose();
                    innerTokens$625 = rest$624[0].token.inner;
                    while (innerTokens$625.length > 0) {
                        argRes$672 = enforest$442(innerTokens$625, context$619);
                        enforestedArgs$673.push(argRes$672.result);
                        innerTokens$625 = argRes$672.rest;
                        if (innerTokens$625[0] && innerTokens$625[0].token.value === ',') {
                            // record the comma for later
                            commas$674.push(innerTokens$625[0]);
                            // but dump it for the next loop turn
                            innerTokens$625 = innerTokens$625.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$675 = _$257.all(enforestedArgs$673, function (argTerm$676) {
                            return argTerm$676.hasPrototype(Expr$402);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$625.length === 0 && argsAreExprs$675) {
                        return step$622(Call$425.create(head$623, enforestedArgs$673, rest$624[0], commas$674), rest$624.slice(1));
                    }
                } else if (head$623.hasPrototype(Expr$402) && rest$624[0] && unwrapSyntax$266(rest$624[0]) === '?') {
                    var question$677 = rest$624[0];
                    var condRes$678 = enforest$442(rest$624.slice(1), context$619);
                    var truExpr$679 = condRes$678.result;
                    var condRight$680 = condRes$678.rest;
                    if (truExpr$679.hasPrototype(Expr$402) && condRight$680[0] && unwrapSyntax$266(condRight$680[0]) === ':') {
                        var colon$681 = condRight$680[0];
                        var flsRes$682 = enforest$442(condRight$680.slice(1), context$619);
                        var flsExpr$683 = flsRes$682.result;
                        if (flsExpr$683.hasPrototype(Expr$402)) {
                            return step$622(ConditionalExpression$413.create(head$623, question$677, truExpr$679, colon$681, flsExpr$683), flsRes$682.rest);
                        }
                    }
                } else if (head$623.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$631) === 'new' && rest$624[0]) {
                    var newCallRes$684 = enforest$442(rest$624, context$619);
                    if (newCallRes$684.result.hasPrototype(Call$425)) {
                        return step$622(Const$424.create(head$623, newCallRes$684.result), newCallRes$684.rest);
                    }
                } else if (head$623.hasPrototype(Delimiter$416) && delim$633.token.value === '()' && rest$624[0] && rest$624[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$624[0]) === '=>') {
                    var arrowRes$685 = enforest$442(rest$624.slice(1), context$619);
                    if (arrowRes$685.result.hasPrototype(Expr$402)) {
                        return step$622(ArrowFun$420.create(delim$633, rest$624[0], arrowRes$685.result.destruct()), arrowRes$685.rest);
                    } else {
                        throwSyntaxError$265('enforest', 'Body of arrow function must be an expression', rest$624.slice(1));
                    }
                } else if (head$623.hasPrototype(Id$417) && rest$624[0] && rest$624[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$624[0]) === '=>') {
                    var res$686 = enforest$442(rest$624.slice(1), context$619);
                    if (res$686.result.hasPrototype(Expr$402)) {
                        return step$622(ArrowFun$420.create(id$635, rest$624[0], res$686.result.destruct()), res$686.rest);
                    } else {
                        throwSyntaxError$265('enforest', 'Body of arrow function must be an expression', rest$624.slice(1));
                    }
                } else if (head$623.hasPrototype(Delimiter$416) && delim$633.token.value === '()') {
                    innerTokens$625 = delim$633.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$625.length === 0) {
                        return step$622(ParenExpression$409.create(head$623), rest$624);
                    } else {
                        var innerTerm$687 = get_expression$443(innerTokens$625, context$619);
                        if (innerTerm$687.result && innerTerm$687.result.hasPrototype(Expr$402)) {
                            return step$622(ParenExpression$409.create(head$623), rest$624);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$623.hasPrototype(Expr$402) && rest$624[0] && rest$624[1] && stxIsBinOp$438(rest$624[0])) {
                    var op$688 = rest$624[0];
                    var left$689 = head$623;
                    var rightStx$690 = rest$624.slice(1);
                    var bopPrevStx$691 = [rest$624[0]].concat(head$623.destruct().reverse(), prevStx$620);
                    var bopPrevTerms$692 = [
                            Punc$415.create(rest$624[0]),
                            head$623
                        ].concat(prevTerms$621);
                    var bopRes$693 = enforest$442(rightStx$690, context$619, bopPrevStx$691, bopPrevTerms$692);
                    // Lookbehind was matched, so it may not even be a binop anymore.
                    if (bopRes$693.prevTerms.length < bopPrevTerms$692.length) {
                        return bopRes$693;
                    }
                    var right$694 = bopRes$693.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$694.hasPrototype(Expr$402)) {
                        return step$622(BinOp$412.create(op$688, left$689, right$694), bopRes$693.rest);
                    }
                } else if (head$623.hasPrototype(Punc$415) && stxIsUnaryOp$437(punc$639)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$623.punc.term = head$623;
                    var unopPrevStx$695 = [punc$639].concat(prevStx$620);
                    var unopPrevTerms$696 = [head$623].concat(prevTerms$621);
                    var unopRes$697 = enforest$442(rest$624, context$619, unopPrevStx$695, unopPrevTerms$696);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopRes$697.prevTerms.length < unopPrevTerms$696.length) {
                        return unopRes$697;
                    }
                    if (unopRes$697.result.hasPrototype(Expr$402)) {
                        return step$622(UnaryOp$410.create(punc$639, unopRes$697.result), unopRes$697.rest);
                    }
                } else if (head$623.hasPrototype(Keyword$414) && stxIsUnaryOp$437(keyword$631)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$623.keyword.term = head$623;
                    var unopKeyPrevStx$698 = [keyword$631].concat(prevStx$620);
                    var unopKeyPrevTerms$699 = [head$623].concat(prevTerms$621);
                    var unopKeyres$700 = enforest$442(rest$624, context$619, unopKeyPrevStx$698, unopKeyPrevTerms$699);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopKeyres$700.prevTerms.length < unopKeyPrevTerms$699.length) {
                        return unopKeyres$700;
                    }
                    if (unopKeyres$700.result.hasPrototype(Expr$402)) {
                        return step$622(UnaryOp$410.create(keyword$631, unopKeyres$700.result), unopKeyres$700.rest);
                    }
                } else if (head$623.hasPrototype(Expr$402) && rest$624[0] && (unwrapSyntax$266(rest$624[0]) === '++' || unwrapSyntax$266(rest$624[0]) === '--')) {
                    return step$622(PostfixOp$411.create(head$623, rest$624[0]), rest$624.slice(1));
                } else if (head$623.hasPrototype(Expr$402) && rest$624[0] && rest$624[0].token.value === '[]') {
                    return step$622(ObjGet$427.create(head$623, Delimiter$416.create(rest$624[0].expose())), rest$624.slice(1));
                } else if (head$623.hasPrototype(Expr$402) && rest$624[0] && unwrapSyntax$266(rest$624[0]) === '.' && rest$624[1] && rest$624[1].token.type === parser$258.Token.Identifier) {
                    return step$622(ObjDotGet$426.create(head$623, rest$624[0], rest$624[1]), rest$624.slice(2));
                } else if (head$623.hasPrototype(Delimiter$416) && delim$633.token.value === '[]') {
                    return step$622(ArrayLiteral$408.create(head$623), rest$624);
                } else if (head$623.hasPrototype(Delimiter$416) && head$623.delim.token.value === '{}') {
                    return step$622(Block$407.create(head$623), rest$624);
                } else if (head$623.hasPrototype(Id$417) && unwrapSyntax$266(id$635) === '#quoteSyntax' && rest$624[0] && rest$624[0].token.value === '{}') {
                    var tempId$701 = fresh$396();
                    context$619.templateMap.set(tempId$701, rest$624[0].token.inner);
                    return step$622(syn$259.makeIdent('getTemplate', id$635), [syn$259.makeDelim('()', [syn$259.makeValue(tempId$701, id$635)], id$635)].concat(rest$624.slice(1)));
                } else if (head$623.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$631) === 'let') {
                    var nameTokens$702 = [];
                    for (var i$703 = 0; i$703 < rest$624.length; i$703++) {
                        if (rest$624[i$703].token.type === parser$258.Token.Punctuator && rest$624[i$703].token.value === '=') {
                            break;
                        } else if (rest$624[i$703].token.type === parser$258.Token.Keyword || rest$624[i$703].token.type === parser$258.Token.Punctuator || rest$624[i$703].token.type === parser$258.Token.Identifier) {
                            nameTokens$702.push(rest$624[i$703]);
                        } else {
                            throwSyntaxError$265('enforest', 'Macro name must be a legal identifier or punctuator', rest$624[i$703]);
                        }
                    }
                    // Let macro
                    if (rest$624[i$703 + 1] && rest$624[i$703 + 1].token.value === 'macro') {
                        var mac$704 = enforest$442(rest$624.slice(i$703 + 1), context$619);
                        if (!mac$704.result.hasPrototype(AnonMacro$423)) {
                            throwSyntaxError$265('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$624.slice(i$703 + 1));
                        }
                        return step$622(LetMacro$421.create(nameTokens$702, mac$704.result.body), mac$704.rest);
                    }    // Let statement
                    else {
                        var lsRes$705 = enforestVarStatement$439(rest$624, context$619, keyword$631);
                        if (lsRes$705) {
                            return step$622(LetStatement$430.create(head$623, lsRes$705.result), lsRes$705.rest);
                        }
                    }
                } else if (head$623.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$631) === 'var' && rest$624[0]) {
                    var vsRes$706 = enforestVarStatement$439(rest$624, context$619, keyword$631);
                    if (vsRes$706) {
                        return step$622(VariableStatement$429.create(head$623, vsRes$706.result), vsRes$706.rest);
                    }
                } else if (head$623.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$631) === 'const' && rest$624[0]) {
                    var csRes$707 = enforestVarStatement$439(rest$624, context$619, keyword$631);
                    if (csRes$707) {
                        return step$622(ConstStatement$431.create(head$623, csRes$707.result), csRes$707.rest);
                    }
                } else if (head$623.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$631) === 'for' && rest$624[0] && rest$624[0].token.value === '()') {
                    return step$622(ForStatement$436.create(keyword$631, rest$624[0]), rest$624.slice(1));
                }
            } else {
                assert$264(head$623 && head$623.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$623.token.type === parser$258.Token.Identifier || head$623.token.type === parser$258.Token.Keyword || head$623.token.type === parser$258.Token.Punctuator) && expandCount$385 < maxExpands$386 && context$619.env.has(resolve$390(head$623)) && tokenValuesArePrefix$441(context$619.env.get(resolve$390(head$623)).fullName, [head$623].concat(rest$624))) {
                    // pull the macro transformer out the environment
                    var macroObj$708 = context$619.env.get(resolve$390(head$623));
                    var transformer$709 = macroObj$708.fn;
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$710 = fresh$396();
                    var transformerContext$711 = makeExpanderContext$451(_$257.defaults({ mark: newMark$710 }, context$619));
                    if (!builtinMode$384 && !macroObj$708.builtin) {
                        expandCount$385++;
                    }
                    // apply the transformer
                    var rt$712;
                    try {
                        rt$712 = transformer$709([head$623].concat(rest$624.slice(macroObj$708.fullName.length - 1)), transformerContext$711, prevStx$620, prevTerms$621);
                    } catch (e$713) {
                        if (e$713.type && e$713.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$714 = '`' + rest$624.slice(0, 5).map(function (stx$715) {
                                    return stx$715.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$265('macro', 'Macro `' + head$623.token.value + '` could not be matched with ' + argumentString$714, head$623);
                        } else {
                            // just rethrow it
                            throw e$713;
                        }
                    }
                    if (rt$712.prevTerms) {
                        prevTerms$621 = rt$712.prevTerms;
                    }
                    if (rt$712.prevStx) {
                        prevStx$620 = rt$712.prevStx;
                    }
                    if (!Array.isArray(rt$712.result)) {
                        throwSyntaxError$265('enforest', 'Macro must return a syntax array', head$623);
                    }
                    if (rt$712.result.length > 0) {
                        var adjustedResult$716 = adjustLineContext$440(rt$712.result, head$623);
                        adjustedResult$716[0].token.leadingComments = head$623.token.leadingComments;
                        return step$622(adjustedResult$716[0], adjustedResult$716.slice(1).concat(rt$712.rest));
                    } else {
                        return step$622(Empty$434.create(), rt$712.rest);
                    }
                }    // anon macro definition
                else if (head$623.token.type === parser$258.Token.Identifier && head$623.token.value === 'macro' && rest$624[0] && rest$624[0].token.value === '{}') {
                    return step$622(AnonMacro$423.create(rest$624[0].expose().token.inner), rest$624.slice(1));
                }    // macro definition
                else if (head$623.token.type === parser$258.Token.Identifier && head$623.token.value === 'macro') {
                    var nameTokens$702 = [];
                    for (var i$703 = 0; i$703 < rest$624.length; i$703++) {
                        // done with the name once we find the delimiter
                        if (rest$624[i$703].token.type === parser$258.Token.Delimiter) {
                            break;
                        } else if (rest$624[i$703].token.type === parser$258.Token.Identifier || rest$624[i$703].token.type === parser$258.Token.Keyword || rest$624[i$703].token.type === parser$258.Token.Punctuator) {
                            nameTokens$702.push(rest$624[i$703]);
                        } else {
                            throwSyntaxError$265('enforest', 'Macro name must be a legal identifier or punctuator', rest$624[i$703]);
                        }
                    }
                    if (rest$624[i$703] && rest$624[i$703].token.type === parser$258.Token.Delimiter) {
                        return step$622(Macro$422.create(nameTokens$702, rest$624[i$703].expose().token.inner), rest$624.slice(i$703 + 1));
                    } else {
                        throwSyntaxError$265('enforest', 'Macro declaration must include body', rest$624[i$703]);
                    }
                }    // module definition
                else if (unwrapSyntax$266(head$623) === 'module' && rest$624[0] && rest$624[0].token.value === '{}') {
                    return step$622(Module$433.create(rest$624[0]), rest$624.slice(1));
                }    // function definition
                else if (head$623.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$623) === 'function' && rest$624[0] && rest$624[0].token.type === parser$258.Token.Identifier && rest$624[1] && rest$624[1].token.type === parser$258.Token.Delimiter && rest$624[1].token.value === '()' && rest$624[2] && rest$624[2].token.type === parser$258.Token.Delimiter && rest$624[2].token.value === '{}') {
                    rest$624[1].token.inner = rest$624[1].expose().token.inner;
                    rest$624[2].token.inner = rest$624[2].expose().token.inner;
                    return step$622(NamedFun$418.create(head$623, null, rest$624[0], rest$624[1], rest$624[2]), rest$624.slice(3));
                }    // generator function definition
                else if (head$623.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$623) === 'function' && rest$624[0] && rest$624[0].token.type === parser$258.Token.Punctuator && rest$624[0].token.value === '*' && rest$624[1] && rest$624[1].token.type === parser$258.Token.Identifier && rest$624[2] && rest$624[2].token.type === parser$258.Token.Delimiter && rest$624[2].token.value === '()' && rest$624[3] && rest$624[3].token.type === parser$258.Token.Delimiter && rest$624[3].token.value === '{}') {
                    rest$624[2].token.inner = rest$624[2].expose().token.inner;
                    rest$624[3].token.inner = rest$624[3].expose().token.inner;
                    return step$622(NamedFun$418.create(head$623, rest$624[0], rest$624[1], rest$624[2], rest$624[3]), rest$624.slice(4));
                }    // anonymous function definition
                else if (head$623.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$623) === 'function' && rest$624[0] && rest$624[0].token.type === parser$258.Token.Delimiter && rest$624[0].token.value === '()' && rest$624[1] && rest$624[1].token.type === parser$258.Token.Delimiter && rest$624[1].token.value === '{}') {
                    rest$624[0].token.inner = rest$624[0].expose().token.inner;
                    rest$624[1].token.inner = rest$624[1].expose().token.inner;
                    return step$622(AnonFun$419.create(head$623, null, rest$624[0], rest$624[1]), rest$624.slice(2));
                }    // anonymous generator function definition
                else if (head$623.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$623) === 'function' && rest$624[0] && rest$624[0].token.type === parser$258.Token.Punctuator && rest$624[0].token.value === '*' && rest$624[1] && rest$624[1].token.type === parser$258.Token.Delimiter && rest$624[1].token.value === '()' && rest$624[2] && rest$624[2].token.type === parser$258.Token.Delimiter && rest$624[2].token.value === '{}') {
                    rest$624[1].token.inner = rest$624[1].expose().token.inner;
                    rest$624[2].token.inner = rest$624[2].expose().token.inner;
                    return step$622(AnonFun$419.create(head$623, rest$624[0], rest$624[1], rest$624[2]), rest$624.slice(3));
                }    // arrow function
                else if ((head$623.token.type === parser$258.Token.Delimiter && head$623.token.value === '()' || head$623.token.type === parser$258.Token.Identifier) && rest$624[0] && rest$624[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$624[0]) === '=>' && rest$624[1] && rest$624[1].token.type === parser$258.Token.Delimiter && rest$624[1].token.value === '{}') {
                    return step$622(ArrowFun$420.create(head$623, rest$624[0], rest$624[1]), rest$624.slice(2));
                }    // catch statement
                else if (head$623.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$623) === 'catch' && rest$624[0] && rest$624[0].token.type === parser$258.Token.Delimiter && rest$624[0].token.value === '()' && rest$624[1] && rest$624[1].token.type === parser$258.Token.Delimiter && rest$624[1].token.value === '{}') {
                    rest$624[0].token.inner = rest$624[0].expose().token.inner;
                    rest$624[1].token.inner = rest$624[1].expose().token.inner;
                    return step$622(CatchClause$432.create(head$623, rest$624[0], rest$624[1]), rest$624.slice(2));
                }    // this expression
                else if (head$623.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$623) === 'this') {
                    return step$622(ThisExpression$404.create(head$623), rest$624);
                }    // literal
                else if (head$623.token.type === parser$258.Token.NumericLiteral || head$623.token.type === parser$258.Token.StringLiteral || head$623.token.type === parser$258.Token.BooleanLiteral || head$623.token.type === parser$258.Token.RegularExpression || head$623.token.type === parser$258.Token.NullLiteral) {
                    return step$622(Lit$405.create(head$623), rest$624);
                }    // export
                else if (head$623.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$623) === 'export' && rest$624[0] && (rest$624[0].token.type === parser$258.Token.Identifier || rest$624[0].token.type === parser$258.Token.Keyword || rest$624[0].token.type === parser$258.Token.Punctuator)) {
                    return step$622(Export$435.create(rest$624[0]), rest$624.slice(1));
                }    // identifier
                else if (head$623.token.type === parser$258.Token.Identifier) {
                    return step$622(Id$417.create(head$623), rest$624);
                }    // punctuator
                else if (head$623.token.type === parser$258.Token.Punctuator) {
                    return step$622(Punc$415.create(head$623), rest$624);
                } else if (head$623.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$623) === 'with') {
                    throwSyntaxError$265('enforest', 'with is not supported in sweet.js', head$623);
                }    // keyword
                else if (head$623.token.type === parser$258.Token.Keyword) {
                    return step$622(Keyword$414.create(head$623), rest$624);
                }    // Delimiter
                else if (head$623.token.type === parser$258.Token.Delimiter) {
                    return step$622(Delimiter$416.create(head$623.expose()), rest$624);
                }    // end of file
                else if (head$623.token.type === parser$258.Token.EOF) {
                    assert$264(rest$624.length === 0, 'nothing should be after an EOF');
                    return step$622(EOF$400.create(head$623), []);
                } else {
                    // todo: are we missing cases?
                    assert$264(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$623,
                rest: rest$624,
                prevStx: prevStx$620,
                prevTerms: prevTerms$621
            };
        }
        return step$622(toks$618[0], toks$618.slice(1));
    }
    function get_expression$443(stx$717, context$718) {
        var res$719 = enforest$442(stx$717, context$718);
        var next$720 = res$719;
        var peek$721;
        var prevStx$722;
        if (!next$720.result.hasPrototype(Expr$402)) {
            return {
                result: null,
                rest: stx$717
            };
        }
        while (next$720.rest.length) {
            // Enforest the next term tree since it might be an infix macro that
            // consumes the initial expression.
            peek$721 = enforest$442(next$720.rest, context$718, next$720.result.destruct(), [next$720.result]);
            // If it has prev terms it wasn't infix, but it we need to run it
            // through enforest together with the initial expression to see if
            // it extends it into a longer expression.
            if (peek$721.prevTerms.length === 1) {
                peek$721 = enforest$442([next$720.result].concat(peek$721.result.destruct(), peek$721.rest), context$718);
            }
            // No new expression was created, so we've reached the end.
            if (peek$721.result === next$720.result) {
                break;
            }
            // A new expression was created, so loop back around and keep going.
            next$720 = peek$721;
        }
        return next$720;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$444(newMark$723, env$724) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$725(match$726) {
            if (match$726.level === 0) {
                // replace the match property with the marked syntax
                match$726.match = _$257.map(match$726.match, function (stx$727) {
                    return stx$727.mark(newMark$723);
                });
            } else {
                _$257.each(match$726.match, function (match$728) {
                    dfs$725(match$728);
                });
            }
        }
        _$257.keys(env$724).forEach(function (key$729) {
            dfs$725(env$724[key$729]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$445(mac$730, context$731) {
        var body$732 = mac$730.body;
        // raw function primitive form
        if (!(body$732[0] && body$732[0].token.type === parser$258.Token.Keyword && body$732[0].token.value === 'function')) {
            throwSyntaxError$265('load macro', 'Primitive macro form must contain a function for the macro body', body$732);
        }
        var stub$733 = parser$258.read('()');
        stub$733[0].token.inner = body$732;
        var expanded$734 = expand$450(stub$733, context$731);
        expanded$734 = expanded$734[0].destruct().concat(expanded$734[1].eof);
        var flattend$735 = flatten$455(expanded$734);
        var bodyCode$736 = codegen$263.generate(parser$258.parse(flattend$735));
        var macroFn$737 = scopedEval$378(bodyCode$736, {
                makeValue: syn$259.makeValue,
                makeRegex: syn$259.makeRegex,
                makeIdent: syn$259.makeIdent,
                makeKeyword: syn$259.makeKeyword,
                makePunc: syn$259.makePunc,
                makeDelim: syn$259.makeDelim,
                getExpr: function (stx$738) {
                    var r$739;
                    if (stx$738.length === 0) {
                        return {
                            success: false,
                            result: [],
                            rest: []
                        };
                    }
                    r$739 = get_expression$443(stx$738, context$731);
                    return {
                        success: r$739.result !== null,
                        result: r$739.result === null ? [] : r$739.result.destruct(),
                        rest: r$739.rest
                    };
                },
                getIdent: function (stx$740) {
                    if (stx$740[0] && stx$740[0].token.type === parser$258.Token.Identifier) {
                        return {
                            success: true,
                            result: [stx$740[0]],
                            rest: stx$740.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$740
                    };
                },
                getLit: function (stx$741) {
                    if (stx$741[0] && patternModule$261.typeIsLiteral(stx$741[0].token.type)) {
                        return {
                            success: true,
                            result: [stx$741[0]],
                            rest: stx$741.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$741
                    };
                },
                unwrapSyntax: syn$259.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$265,
                prettyPrint: syn$259.prettyPrint,
                parser: parser$258,
                __fresh: fresh$396,
                _: _$257,
                patternModule: patternModule$261,
                getTemplate: function (id$742) {
                    return cloneSyntaxArray$446(context$731.templateMap.get(id$742));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$444,
                mergeMatches: function (newMatch$743, oldMatch$744) {
                    newMatch$743.patternEnv = _$257.extend({}, oldMatch$744.patternEnv, newMatch$743.patternEnv);
                    return newMatch$743;
                }
            });
        return macroFn$737;
    }
    function cloneSyntaxArray$446(arr$745) {
        return arr$745.map(function (stx$746) {
            var o$747 = syntaxFromToken$382(_$257.clone(stx$746.token), stx$746);
            if (o$747.token.type === parser$258.Token.Delimiter) {
                o$747.token.inner = cloneSyntaxArray$446(o$747.token.inner);
            }
            return o$747;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$447(stx$748, context$749, prevStx$750, prevTerms$751) {
        assert$264(context$749, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$748.length === 0) {
            return {
                terms: prevTerms$751 ? prevTerms$751.reverse() : [],
                context: context$749
            };
        }
        assert$264(stx$748[0].token, 'expecting a syntax object');
        var f$752 = enforest$442(stx$748, context$749, prevStx$750, prevTerms$751);
        // head :: TermTree
        var head$753 = f$752.result;
        // rest :: [Syntax]
        var rest$754 = f$752.rest;
        var macroDefinition$755;
        if (head$753.hasPrototype(Macro$422) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$755 = loadMacroDef$445(head$753, context$749);
            addToDefinitionCtx$448([head$753.name[0]], context$749.defscope, false);
            context$749.env.set(resolve$390(head$753.name[0]), {
                fn: macroDefinition$755,
                builtin: builtinMode$384,
                fullName: head$753.name
            });
            return expandToTermTree$447(rest$754, context$749, prevStx$750, prevTerms$751);
        }
        if (head$753.hasPrototype(LetMacro$421) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$755 = loadMacroDef$445(head$753, context$749);
            var freshName$759 = fresh$396();
            var name$760 = head$753.name[0];
            var renamedName$761 = name$760.rename(name$760, freshName$759);
            rest$754 = _$257.map(rest$754, function (stx$762) {
                return stx$762.rename(name$760, freshName$759);
            });
            head$753.name[0] = renamedName$761;
            context$749.env.set(resolve$390(renamedName$761), {
                fn: macroDefinition$755,
                builtin: builtinMode$384,
                fullName: head$753.name
            });
            return expandToTermTree$447(rest$754, context$749, prevStx$750, prevTerms$751);
        }
        // We build the newPrevTerms/Stx here (instead of at the beginning) so
        // that macro definitions don't get added to it.
        var destructed$756 = f$752.result.destruct();
        destructed$756.forEach(function (stx$763) {
            stx$763.term = head$753;
        });
        var newPrevTerms$757 = [head$753].concat(f$752.prevTerms);
        var newPrevStx$758 = destructed$756.reverse().concat(f$752.prevStx);
        if (head$753.hasPrototype(NamedFun$418)) {
            addToDefinitionCtx$448([head$753.name], context$749.defscope, true);
        }
        if (head$753.hasPrototype(VariableStatement$429)) {
            addToDefinitionCtx$448(_$257.map(head$753.decls, function (decl$764) {
                return decl$764.ident;
            }), context$749.defscope, true);
        }
        if (head$753.hasPrototype(Block$407) && head$753.body.hasPrototype(Delimiter$416)) {
            head$753.body.delim.token.inner.forEach(function (term$765) {
                if (term$765.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$448(_$257.map(term$765.decls, function (decl$766) {
                        return decl$766.ident;
                    }), context$749.defscope, true);
                }
            });
        }
        if (head$753.hasPrototype(Delimiter$416)) {
            head$753.delim.token.inner.forEach(function (term$767) {
                if (term$767.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$448(_$257.map(term$767.decls, function (decl$768) {
                        return decl$768.ident;
                    }), context$749.defscope, true);
                }
            });
        }
        if (head$753.hasPrototype(ForStatement$436)) {
            head$753.cond.expose();
            var forCond$769 = head$753.cond.token.inner;
            if (forCond$769[0] && resolve$390(forCond$769[0]) === 'let' && forCond$769[1] && forCond$769[1].token.type === parser$258.Token.Identifier) {
                var letNew$770 = fresh$396();
                var letId$771 = forCond$769[1];
                forCond$769 = forCond$769.map(function (stx$772) {
                    return stx$772.rename(letId$771, letNew$770);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$753.cond.token.inner = expand$450([forCond$769[0]], context$749).concat(expand$450(forCond$769.slice(1), context$749));
                // nice and easy case: `for (...) { ... }`
                if (rest$754[0] && rest$754[0].token.value === '{}') {
                    rest$754[0] = rest$754[0].rename(letId$771, letNew$770);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$773 = enforest$442(rest$754, context$749);
                    var bodyDestructed$774 = bodyEnf$773.result.destruct();
                    var renamedBodyTerm$775 = bodyEnf$773.result.rename(letId$771, letNew$770);
                    bodyDestructed$774.forEach(function (stx$776) {
                        stx$776.term = renamedBodyTerm$775;
                    });
                    return expandToTermTree$447(bodyEnf$773.rest, context$749, bodyDestructed$774.reverse().concat(newPrevStx$758), [renamedBodyTerm$775].concat(newPrevTerms$757));
                }
            } else {
                head$753.cond.token.inner = expand$450(head$753.cond.token.inner, context$749);
            }
        }
        return expandToTermTree$447(rest$754, context$749, newPrevStx$758, newPrevTerms$757);
    }
    function addToDefinitionCtx$448(idents$777, defscope$778, skipRep$779) {
        assert$264(idents$777 && idents$777.length > 0, 'expecting some variable identifiers');
        skipRep$779 = skipRep$779 || false;
        _$257.each(idents$777, function (id$780) {
            var skip$781 = false;
            if (skipRep$779) {
                var declRepeat$782 = _$257.find(defscope$778, function (def$783) {
                        return def$783.id.token.value === id$780.token.value && arraysEqual$391(marksof$389(def$783.id.context), marksof$389(id$780.context));
                    });
                skip$781 = typeof declRepeat$782 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$781) {
                var name$784 = fresh$396();
                defscope$778.push({
                    id: id$780,
                    name: name$784
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$449(term$785, context$786) {
        assert$264(context$786 && context$786.env, 'environment map is required');
        if (term$785.hasPrototype(ArrayLiteral$408)) {
            term$785.array.delim.token.inner = expand$450(term$785.array.delim.expose().token.inner, context$786);
            return term$785;
        } else if (term$785.hasPrototype(Block$407)) {
            term$785.body.delim.token.inner = expand$450(term$785.body.delim.expose().token.inner, context$786);
            return term$785;
        } else if (term$785.hasPrototype(ParenExpression$409)) {
            term$785.expr.delim.token.inner = expand$450(term$785.expr.delim.expose().token.inner, context$786);
            return term$785;
        } else if (term$785.hasPrototype(Call$425)) {
            term$785.fun = expandTermTreeToFinal$449(term$785.fun, context$786);
            term$785.args = _$257.map(term$785.args, function (arg$787) {
                return expandTermTreeToFinal$449(arg$787, context$786);
            });
            return term$785;
        } else if (term$785.hasPrototype(UnaryOp$410)) {
            term$785.expr = expandTermTreeToFinal$449(term$785.expr, context$786);
            return term$785;
        } else if (term$785.hasPrototype(BinOp$412)) {
            term$785.left = expandTermTreeToFinal$449(term$785.left, context$786);
            term$785.right = expandTermTreeToFinal$449(term$785.right, context$786);
            return term$785;
        } else if (term$785.hasPrototype(ObjGet$427)) {
            term$785.right.delim.token.inner = expand$450(term$785.right.delim.expose().token.inner, context$786);
            return term$785;
        } else if (term$785.hasPrototype(ObjDotGet$426)) {
            term$785.left = expandTermTreeToFinal$449(term$785.left, context$786);
            term$785.right = expandTermTreeToFinal$449(term$785.right, context$786);
            return term$785;
        } else if (term$785.hasPrototype(VariableDeclaration$428)) {
            if (term$785.init) {
                term$785.init = expandTermTreeToFinal$449(term$785.init, context$786);
            }
            return term$785;
        } else if (term$785.hasPrototype(VariableStatement$429)) {
            term$785.decls = _$257.map(term$785.decls, function (decl$788) {
                return expandTermTreeToFinal$449(decl$788, context$786);
            });
            return term$785;
        } else if (term$785.hasPrototype(Delimiter$416)) {
            // expand inside the delimiter and then continue on
            term$785.delim.token.inner = expand$450(term$785.delim.expose().token.inner, context$786);
            return term$785;
        } else if (term$785.hasPrototype(NamedFun$418) || term$785.hasPrototype(AnonFun$419) || term$785.hasPrototype(CatchClause$432) || term$785.hasPrototype(ArrowFun$420) || term$785.hasPrototype(Module$433)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$789 = [];
            var bodyContext$790 = makeExpanderContext$451(_$257.defaults({ defscope: newDef$789 }, context$786));
            var paramSingleIdent$791 = term$785.params && term$785.params.token.type === parser$258.Token.Identifier;
            var params$792;
            if (term$785.params && term$785.params.token.type === parser$258.Token.Delimiter) {
                params$792 = term$785.params.expose();
            } else if (paramSingleIdent$791) {
                params$792 = term$785.params;
            } else {
                params$792 = syn$259.makeDelim('()', [], null);
            }
            var bodies$793;
            if (Array.isArray(term$785.body)) {
                bodies$793 = syn$259.makeDelim('{}', term$785.body, null);
            } else {
                bodies$793 = term$785.body;
            }
            bodies$793 = bodies$793.addDefCtx(newDef$789);
            var paramNames$794 = _$257.map(getParamIdentifiers$398(params$792), function (param$801) {
                    var freshName$802 = fresh$396();
                    return {
                        freshName: freshName$802,
                        originalParam: param$801,
                        renamedParam: param$801.rename(param$801, freshName$802)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$795 = _$257.reduce(paramNames$794, function (accBody$803, p$804) {
                    return accBody$803.rename(p$804.originalParam, p$804.freshName);
                }, bodies$793);
            renamedBody$795 = renamedBody$795.expose();
            var expandedResult$796 = expandToTermTree$447(renamedBody$795.token.inner, bodyContext$790);
            var bodyTerms$797 = expandedResult$796.terms;
            var renamedParams$798 = _$257.map(paramNames$794, function (p$805) {
                    return p$805.renamedParam;
                });
            var flatArgs$799;
            if (paramSingleIdent$791) {
                flatArgs$799 = renamedParams$798[0];
            } else {
                flatArgs$799 = syn$259.makeDelim('()', joinSyntax$383(renamedParams$798, ','), term$785.params || null);
            }
            var expandedArgs$800 = expand$450([flatArgs$799], bodyContext$790);
            assert$264(expandedArgs$800.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$785.params) {
                term$785.params = expandedArgs$800[0];
            }
            bodyTerms$797 = _$257.map(bodyTerms$797, function (bodyTerm$806) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$807 = bodyTerm$806.addDefCtx(newDef$789);
                // finish expansion
                return expandTermTreeToFinal$449(termWithCtx$807, expandedResult$796.context);
            });
            if (term$785.hasPrototype(Module$433)) {
                bodyTerms$797 = _$257.filter(bodyTerms$797, function (bodyTerm$808) {
                    if (bodyTerm$808.hasPrototype(Export$435)) {
                        term$785.exports.push(bodyTerm$808);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$795.token.inner = bodyTerms$797;
            if (Array.isArray(term$785.body)) {
                term$785.body = renamedBody$795.token.inner;
            } else {
                term$785.body = renamedBody$795;
            }
            // and continue expand the rest
            return term$785;
        }
        // the term is fine as is
        return term$785;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$450(stx$809, context$810) {
        assert$264(context$810, 'must provide an expander context');
        var trees$811 = expandToTermTree$447(stx$809, context$810);
        return _$257.map(trees$811.terms, function (term$812) {
            return expandTermTreeToFinal$449(term$812, trees$811.context);
        });
    }
    function makeExpanderContext$451(o$813) {
        o$813 = o$813 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$813.env || new StringMap$377(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$813.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$813.templateMap || new StringMap$377(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$813.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$452(stx$814, moduleContexts$815, _maxExpands$816) {
        moduleContexts$815 = moduleContexts$815 || [];
        maxExpands$386 = _maxExpands$816 || Infinity;
        expandCount$385 = 0;
        var context$817 = makeExpanderContext$451();
        var modBody$818 = syn$259.makeDelim('{}', stx$814, null);
        modBody$818 = _$257.reduce(moduleContexts$815, function (acc$820, mod$821) {
            context$817.env.extend(mod$821.env);
            return loadModuleExports$454(acc$820, context$817.env, mod$821.exports, mod$821.env);
        }, modBody$818);
        var res$819 = expand$450([
                syn$259.makeIdent('module', null),
                modBody$818
            ], context$817);
        res$819 = res$819[0].destruct();
        return flatten$455(res$819[0].token.inner);
    }
    function expandModule$453(stx$822, moduleContexts$823) {
        moduleContexts$823 = moduleContexts$823 || [];
        maxExpands$386 = Infinity;
        expandCount$385 = 0;
        var context$824 = makeExpanderContext$451();
        var modBody$825 = syn$259.makeDelim('{}', stx$822, null);
        modBody$825 = _$257.reduce(moduleContexts$823, function (acc$827, mod$828) {
            context$824.env.extend(mod$828.env);
            return loadModuleExports$454(acc$827, context$824.env, mod$828.exports, mod$828.env);
        }, modBody$825);
        builtinMode$384 = true;
        var moduleRes$826 = expand$450([
                syn$259.makeIdent('module', null),
                modBody$825
            ], context$824);
        builtinMode$384 = false;
        context$824.exports = _$257.map(moduleRes$826[0].exports, function (term$829) {
            return {
                oldExport: term$829.name,
                newParam: syn$259.makeIdent(term$829.name.token.value, null)
            };
        });
        return context$824;
    }
    function loadModuleExports$454(stx$830, newEnv$831, exports$832, oldEnv$833) {
        return _$257.reduce(exports$832, function (acc$834, param$835) {
            var newName$836 = fresh$396();
            newEnv$831.set(resolve$390(param$835.newParam.rename(param$835.newParam, newName$836)), oldEnv$833.get(resolve$390(param$835.oldExport)));
            return acc$834.rename(param$835.newParam, newName$836);
        }, stx$830);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$455(stx$837) {
        return _$257.reduce(stx$837, function (acc$838, stx$839) {
            if (stx$839.token.type === parser$258.Token.Delimiter) {
                var exposed$840 = stx$839.expose();
                var openParen$841 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$839.token.value[0],
                        range: stx$839.token.startRange,
                        sm_range: typeof stx$839.token.sm_startRange == 'undefined' ? stx$839.token.startRange : stx$839.token.sm_startRange,
                        lineNumber: stx$839.token.startLineNumber,
                        sm_lineNumber: typeof stx$839.token.sm_startLineNumber == 'undefined' ? stx$839.token.startLineNumber : stx$839.token.sm_startLineNumber,
                        lineStart: stx$839.token.startLineStart,
                        sm_lineStart: typeof stx$839.token.sm_startLineStart == 'undefined' ? stx$839.token.startLineStart : stx$839.token.sm_startLineStart
                    }, exposed$840);
                var closeParen$842 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$839.token.value[1],
                        range: stx$839.token.endRange,
                        sm_range: typeof stx$839.token.sm_endRange == 'undefined' ? stx$839.token.endRange : stx$839.token.sm_endRange,
                        lineNumber: stx$839.token.endLineNumber,
                        sm_lineNumber: typeof stx$839.token.sm_endLineNumber == 'undefined' ? stx$839.token.endLineNumber : stx$839.token.sm_endLineNumber,
                        lineStart: stx$839.token.endLineStart,
                        sm_lineStart: typeof stx$839.token.sm_endLineStart == 'undefined' ? stx$839.token.endLineStart : stx$839.token.sm_endLineStart
                    }, exposed$840);
                if (stx$839.token.leadingComments) {
                    openParen$841.token.leadingComments = stx$839.token.leadingComments;
                }
                if (stx$839.token.trailingComments) {
                    openParen$841.token.trailingComments = stx$839.token.trailingComments;
                }
                acc$838.push(openParen$841);
                push$387.apply(acc$838, flatten$455(exposed$840.token.inner));
                acc$838.push(closeParen$842);
                return acc$838;
            }
            stx$839.token.sm_lineNumber = stx$839.token.sm_lineNumber ? stx$839.token.sm_lineNumber : stx$839.token.lineNumber;
            stx$839.token.sm_lineStart = stx$839.token.sm_lineStart ? stx$839.token.sm_lineStart : stx$839.token.lineStart;
            stx$839.token.sm_range = stx$839.token.sm_range ? stx$839.token.sm_range : stx$839.token.range;
            acc$838.push(stx$839);
            return acc$838;
        }, []);
    }
    exports$256.StringMap = StringMap$377;
    exports$256.enforest = enforest$442;
    exports$256.expand = expandTopLevel$452;
    exports$256.expandModule = expandModule$453;
    exports$256.resolve = resolve$390;
    exports$256.get_expression = get_expression$443;
    exports$256.makeExpanderContext = makeExpanderContext$451;
    exports$256.Expr = Expr$402;
    exports$256.VariableStatement = VariableStatement$429;
    exports$256.tokensToSyntax = syn$259.tokensToSyntax;
    exports$256.syntaxToTokens = syn$259.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map