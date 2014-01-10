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
                var o$455 = Object.create(this);
                if (typeof o$455.construct === 'function') {
                    o$455.construct.apply(o$455, arguments);
                }
                return o$455;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$456) {
                var result$457 = Object.create(this);
                for (var prop$458 in properties$456) {
                    if (properties$456.hasOwnProperty(prop$458)) {
                        result$457[prop$458] = properties$456[prop$458];
                    }
                }
                return result$457;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$459) {
                function F$460() {
                }
                F$460.prototype = proto$459;
                return this instanceof F$460;
            },
            enumerable: false,
            writable: true
        }
    });
    function StringMap$377(o$461) {
        this.__data = o$461 || {};
    }
    StringMap$377.prototype = {
        has: function (key$462) {
            return Object.prototype.hasOwnProperty.call(this.__data, key$462);
        },
        get: function (key$463) {
            return this.has(key$463) ? this.__data[key$463] : void 0;
        },
        set: function (key$464, value$465) {
            this.__data[key$464] = value$465;
        },
        extend: function () {
            var args$466 = _$257.map(_$257.toArray(arguments), function (x$467) {
                    return x$467.__data;
                });
            _$257.extend.apply(_$257, [this.__data].concat(args$466));
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
    function remdup$388(mark$468, mlist$469) {
        if (mark$468 === _$257.first(mlist$469)) {
            return _$257.rest(mlist$469, 1);
        }
        return [mark$468].concat(mlist$469);
    }
    // (CSyntax) -> [...Num]
    function marksof$389(ctx$470, stopName$471, originalName$472) {
        var mark$473, submarks$474;
        if (ctx$470 instanceof Mark$380) {
            mark$473 = ctx$470.mark;
            submarks$474 = marksof$389(ctx$470.context, stopName$471, originalName$472);
            return remdup$388(mark$473, submarks$474);
        }
        if (ctx$470 instanceof Def$381) {
            return marksof$389(ctx$470.context, stopName$471, originalName$472);
        }
        if (ctx$470 instanceof Rename$379) {
            if (stopName$471 === originalName$472 + '$' + ctx$470.name) {
                return [];
            }
            return marksof$389(ctx$470.context, stopName$471, originalName$472);
        }
        return [];
    }
    function resolve$390(stx$475) {
        return resolveCtx$394(stx$475.token.value, stx$475.context, [], []);
    }
    function arraysEqual$391(a$476, b$477) {
        if (a$476.length !== b$477.length) {
            return false;
        }
        for (var i$478 = 0; i$478 < a$476.length; i$478++) {
            if (a$476[i$478] !== b$477[i$478]) {
                return false;
            }
        }
        return true;
    }
    function renames$392(defctx$479, oldctx$480, originalName$481) {
        var acc$482 = oldctx$480;
        for (var i$483 = 0; i$483 < defctx$479.length; i$483++) {
            if (defctx$479[i$483].id.token.value === originalName$481) {
                acc$482 = new Rename$379(defctx$479[i$483].id, defctx$479[i$483].name, acc$482, defctx$479);
            }
        }
        return acc$482;
    }
    function unionEl$393(arr$484, el$485) {
        if (arr$484.indexOf(el$485) === -1) {
            var res$486 = arr$484.slice(0);
            res$486.push(el$485);
            return res$486;
        }
        return arr$484;
    }
    // (Syntax) -> String
    function resolveCtx$394(originalName$487, ctx$488, stop_spine$489, stop_branch$490) {
        if (ctx$488 instanceof Mark$380) {
            return resolveCtx$394(originalName$487, ctx$488.context, stop_spine$489, stop_branch$490);
        }
        if (ctx$488 instanceof Def$381) {
            if (stop_spine$489.indexOf(ctx$488.defctx) !== -1) {
                return resolveCtx$394(originalName$487, ctx$488.context, stop_spine$489, stop_branch$490);
            } else {
                return resolveCtx$394(originalName$487, renames$392(ctx$488.defctx, ctx$488.context, originalName$487), stop_spine$489, unionEl$393(stop_branch$490, ctx$488.defctx));
            }
        }
        if (ctx$488 instanceof Rename$379) {
            if (originalName$487 === ctx$488.id.token.value) {
                var idName$491 = resolveCtx$394(ctx$488.id.token.value, ctx$488.id.context, stop_branch$490, stop_branch$490);
                var subName$492 = resolveCtx$394(originalName$487, ctx$488.context, unionEl$393(stop_spine$489, ctx$488.def), stop_branch$490);
                if (idName$491 === subName$492) {
                    var idMarks$493 = marksof$389(ctx$488.id.context, originalName$487 + '$' + ctx$488.name, originalName$487);
                    var subMarks$494 = marksof$389(ctx$488.context, originalName$487 + '$' + ctx$488.name, originalName$487);
                    if (arraysEqual$391(idMarks$493, subMarks$494)) {
                        return originalName$487 + '$' + ctx$488.name;
                    }
                }
            }
            return resolveCtx$394(originalName$487, ctx$488.context, stop_spine$489, stop_branch$490);
        }
        return originalName$487;
    }
    var nextFresh$395 = 0;
    // fun () -> Num
    function fresh$396() {
        return nextFresh$395++;
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$397(towrap$495, delimSyntax$496) {
        assert$264(delimSyntax$496.token.type === parser$258.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$382({
            type: parser$258.Token.Delimiter,
            value: delimSyntax$496.token.value,
            inner: towrap$495,
            range: delimSyntax$496.token.range,
            startLineNumber: delimSyntax$496.token.startLineNumber,
            lineStart: delimSyntax$496.token.lineStart
        }, delimSyntax$496);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$398(argSyntax$497) {
        if (argSyntax$497.token.type === parser$258.Token.Delimiter) {
            return _$257.filter(argSyntax$497.token.inner, function (stx$498) {
                return stx$498.token.value !== ',';
            });
        } else if (argSyntax$497.token.type === parser$258.Token.Identifier) {
            return [argSyntax$497];
        } else {
            assert$264(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$399 = {
            destruct: function () {
                return _$257.reduce(this.properties, _$257.bind(function (acc$499, prop$500) {
                    if (this[prop$500] && this[prop$500].hasPrototype(TermTree$399)) {
                        push$387.apply(acc$499, this[prop$500].destruct());
                        return acc$499;
                    } else if (this[prop$500] && this[prop$500].token && this[prop$500].token.inner) {
                        var clone$501 = syntaxFromToken$382(_$257.clone(this[prop$500].token), this[prop$500]);
                        clone$501.token.inner = _$257.reduce(clone$501.token.inner, function (acc$502, t$503) {
                            if (t$503.hasPrototype(TermTree$399)) {
                                push$387.apply(acc$502, t$503.destruct());
                                return acc$502;
                            }
                            acc$502.push(t$503);
                            return acc$502;
                        }, []);
                        acc$499.push(clone$501);
                        return acc$499;
                    } else if (Array.isArray(this[prop$500])) {
                        var destArr$504 = _$257.reduce(this[prop$500], function (acc$505, t$506) {
                                if (t$506.hasPrototype(TermTree$399)) {
                                    push$387.apply(acc$505, t$506.destruct());
                                    return acc$505;
                                }
                                acc$505.push(t$506);
                                return acc$505;
                            }, []);
                        push$387.apply(acc$499, destArr$504);
                        return acc$499;
                    } else if (this[prop$500]) {
                        acc$499.push(this[prop$500]);
                        return acc$499;
                    } else {
                        return acc$499;
                    }
                }, this), []);
            },
            addDefCtx: function (def$507) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$508) {
                    var prop$509 = this.properties[i$508];
                    if (Array.isArray(this[prop$509])) {
                        this[prop$509] = _$257.map(this[prop$509], function (item$510) {
                            return item$510.addDefCtx(def$507);
                        });
                    } else if (this[prop$509]) {
                        this[prop$509] = this[prop$509].addDefCtx(def$507);
                    }
                }, this));
                return this;
            },
            rename: function (id$511, name$512) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$513) {
                    var prop$514 = this.properties[i$513];
                    if (Array.isArray(this[prop$514])) {
                        this[prop$514] = _$257.map(this[prop$514], function (item$515) {
                            return item$515.rename(id$511, name$512);
                        });
                    } else if (this[prop$514]) {
                        this[prop$514] = this[prop$514].rename(id$511, name$512);
                    }
                }, this));
                return this;
            }
        };
    var EOF$400 = TermTree$399.extend({
            properties: ['eof'],
            construct: function (e$516) {
                this.eof = e$516;
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
            construct: function (that$517) {
                this.this = that$517;
            }
        });
    var Lit$405 = PrimaryExpression$403.extend({
            properties: ['lit'],
            construct: function (l$518) {
                this.lit = l$518;
            }
        });
    exports$256._test.PropertyAssignment = PropertyAssignment$406;
    var PropertyAssignment$406 = TermTree$399.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$519, assignment$520) {
                this.propName = propName$519;
                this.assignment = assignment$520;
            }
        });
    var Block$407 = PrimaryExpression$403.extend({
            properties: ['body'],
            construct: function (body$521) {
                this.body = body$521;
            }
        });
    var ArrayLiteral$408 = PrimaryExpression$403.extend({
            properties: ['array'],
            construct: function (ar$522) {
                this.array = ar$522;
            }
        });
    var ParenExpression$409 = PrimaryExpression$403.extend({
            properties: ['expr'],
            construct: function (expr$523) {
                this.expr = expr$523;
            }
        });
    var UnaryOp$410 = Expr$402.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$524, expr$525) {
                this.op = op$524;
                this.expr = expr$525;
            }
        });
    var PostfixOp$411 = Expr$402.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$526, op$527) {
                this.expr = expr$526;
                this.op = op$527;
            }
        });
    var BinOp$412 = Expr$402.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$528, left$529, right$530) {
                this.op = op$528;
                this.left = left$529;
                this.right = right$530;
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
            construct: function (cond$531, question$532, tru$533, colon$534, fls$535) {
                this.cond = cond$531;
                this.question = question$532;
                this.tru = tru$533;
                this.colon = colon$534;
                this.fls = fls$535;
            }
        });
    var Keyword$414 = TermTree$399.extend({
            properties: ['keyword'],
            construct: function (k$536) {
                this.keyword = k$536;
            }
        });
    var Punc$415 = TermTree$399.extend({
            properties: ['punc'],
            construct: function (p$537) {
                this.punc = p$537;
            }
        });
    var Delimiter$416 = TermTree$399.extend({
            properties: ['delim'],
            construct: function (d$538) {
                this.delim = d$538;
            }
        });
    var Id$417 = PrimaryExpression$403.extend({
            properties: ['id'],
            construct: function (id$539) {
                this.id = id$539;
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
            construct: function (keyword$540, star$541, name$542, params$543, body$544) {
                this.keyword = keyword$540;
                this.star = star$541;
                this.name = name$542;
                this.params = params$543;
                this.body = body$544;
            }
        });
    var AnonFun$419 = Expr$402.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$545, star$546, params$547, body$548) {
                this.keyword = keyword$545;
                this.star = star$546;
                this.params = params$547;
                this.body = body$548;
            }
        });
    var ArrowFun$420 = Expr$402.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$549, arrow$550, body$551) {
                this.params = params$549;
                this.arrow = arrow$550;
                this.body = body$551;
            }
        });
    var LetMacro$421 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$552, body$553) {
                this.name = name$552;
                this.body = body$553;
            }
        });
    var Macro$422 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$554, body$555) {
                this.name = name$554;
                this.body = body$555;
            }
        });
    var AnonMacro$423 = TermTree$399.extend({
            properties: ['body'],
            construct: function (body$556) {
                this.body = body$556;
            }
        });
    var Const$424 = Expr$402.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$557, call$558) {
                this.newterm = newterm$557;
                this.call = call$558;
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
                var commas$559 = this.commas.slice();
                var delim$560 = syntaxFromToken$382(_$257.clone(this.delim.token), this.delim);
                delim$560.token.inner = _$257.reduce(this.args, function (acc$562, term$563) {
                    assert$264(term$563 && term$563.hasPrototype(TermTree$399), 'expecting term trees in destruct of Call');
                    push$387.apply(acc$562, term$563.destruct());
                    // add all commas except for the last one
                    if (commas$559.length > 0) {
                        acc$562.push(commas$559.shift());
                    }
                    return acc$562;
                }, []);
                var res$561 = this.fun.destruct();
                push$387.apply(res$561, Delimiter$416.create(delim$560).destruct());
                return res$561;
            },
            construct: function (funn$564, args$565, delim$566, commas$567) {
                assert$264(Array.isArray(args$565), 'requires an array of arguments terms');
                this.fun = funn$564;
                this.args = args$565;
                this.delim = delim$566;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$567;
            }
        });
    var ObjDotGet$426 = Expr$402.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$568, dot$569, right$570) {
                this.left = left$568;
                this.dot = dot$569;
                this.right = right$570;
            }
        });
    var ObjGet$427 = Expr$402.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$571, right$572) {
                this.left = left$571;
                this.right = right$572;
            }
        });
    var VariableDeclaration$428 = TermTree$399.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$573, eqstx$574, init$575, comma$576) {
                this.ident = ident$573;
                this.eqstx = eqstx$574;
                this.init = init$575;
                this.comma = comma$576;
            }
        });
    var VariableStatement$429 = Statement$401.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$257.reduce(this.decls, function (acc$577, decl$578) {
                    push$387.apply(acc$577, decl$578.destruct());
                    return acc$577;
                }, []));
            },
            construct: function (varkw$579, decls$580) {
                assert$264(Array.isArray(decls$580), 'decls must be an array');
                this.varkw = varkw$579;
                this.decls = decls$580;
            }
        });
    var LetStatement$430 = Statement$401.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$257.reduce(this.decls, function (acc$581, decl$582) {
                    push$387.apply(acc$581, decl$582.destruct());
                    return acc$581;
                }, []));
            },
            construct: function (letkw$583, decls$584) {
                assert$264(Array.isArray(decls$584), 'decls must be an array');
                this.letkw = letkw$583;
                this.decls = decls$584;
            }
        });
    var ConstStatement$431 = Statement$401.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$257.reduce(this.decls, function (acc$585, decl$586) {
                    push$387.apply(acc$585, decl$586.destruct());
                    return acc$585;
                }, []));
            },
            construct: function (constkw$587, decls$588) {
                assert$264(Array.isArray(decls$588), 'decls must be an array');
                this.constkw = constkw$587;
                this.decls = decls$588;
            }
        });
    var CatchClause$432 = Statement$401.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$589, params$590, body$591) {
                this.catchkw = catchkw$589;
                this.params = params$590;
                this.body = body$591;
            }
        });
    var Module$433 = TermTree$399.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$592) {
                this.body = body$592;
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
            construct: function (name$593) {
                this.name = name$593;
            }
        });
    var ForStatement$436 = Statement$401.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$594, cond$595) {
                this.forkw = forkw$594;
                this.cond = cond$595;
            }
        });
    function stxIsUnaryOp$437(stx$596) {
        var staticOperators$597 = [
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
        return _$257.contains(staticOperators$597, unwrapSyntax$266(stx$596));
    }
    function stxIsBinOp$438(stx$598) {
        var staticOperators$599 = [
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
        return _$257.contains(staticOperators$599, unwrapSyntax$266(stx$598));
    }
    function enforestVarStatement$439(stx$600, context$601, varStx$602) {
        var isLet$603 = /^(?:let|const)$/.test(varStx$602.token.value);
        var decls$604 = [];
        var rest$605 = stx$600;
        var rhs$606;
        if (!rest$605.length) {
            throwSyntaxError$265('enforest', 'Unexpected end of input', varStx$602);
        }
        while (rest$605.length) {
            if (rest$605[0].token.type === parser$258.Token.Identifier) {
                if (isLet$603) {
                    var freshName$607 = fresh$396();
                    var renamedId$608 = rest$605[0].rename(rest$605[0], freshName$607);
                    rest$605 = rest$605.map(function (stx$609) {
                        return stx$609.rename(rest$605[0], freshName$607);
                    });
                    rest$605[0] = renamedId$608;
                }
                if (rest$605[1].token.type === parser$258.Token.Punctuator && rest$605[1].token.value === '=') {
                    rhs$606 = get_expression$442(rest$605.slice(2), context$601);
                    if (rhs$606.result == null) {
                        throwSyntaxError$265('enforest', 'Unexpected token', rhs$606.rest[0]);
                    }
                    if (rhs$606.rest[0].token.type === parser$258.Token.Punctuator && rhs$606.rest[0].token.value === ',') {
                        decls$604.push(VariableDeclaration$428.create(rest$605[0], rest$605[1], rhs$606.result, rhs$606.rest[0]));
                        rest$605 = rhs$606.rest.slice(1);
                        continue;
                    } else {
                        decls$604.push(VariableDeclaration$428.create(rest$605[0], rest$605[1], rhs$606.result, null));
                        rest$605 = rhs$606.rest;
                        break;
                    }
                } else if (rest$605[1].token.type === parser$258.Token.Punctuator && rest$605[1].token.value === ',') {
                    decls$604.push(VariableDeclaration$428.create(rest$605[0], null, null, rest$605[1]));
                    rest$605 = rest$605.slice(2);
                } else {
                    decls$604.push(VariableDeclaration$428.create(rest$605[0], null, null, null));
                    rest$605 = rest$605.slice(1);
                    break;
                }
            } else {
                throwSyntaxError$265('enforest', 'Unexpected token', rest$605[0]);
            }
        }
        return {
            result: decls$604,
            rest: rest$605
        };
    }
    function adjustLineContext$440(stx$610, original$611, current$612) {
        current$612 = current$612 || {
            lastLineNumber: original$611.token.lineNumber,
            lineNumber: original$611.token.lineNumber - 1
        };
        return _$257.map(stx$610, function (stx$613) {
            if (stx$613.token.type === parser$258.Token.Delimiter) {
                // handle tokens with missing line info
                stx$613.token.startLineNumber = typeof stx$613.token.startLineNumber == 'undefined' ? original$611.token.lineNumber : stx$613.token.startLineNumber;
                stx$613.token.endLineNumber = typeof stx$613.token.endLineNumber == 'undefined' ? original$611.token.lineNumber : stx$613.token.endLineNumber;
                stx$613.token.startLineStart = typeof stx$613.token.startLineStart == 'undefined' ? original$611.token.lineStart : stx$613.token.startLineStart;
                stx$613.token.endLineStart = typeof stx$613.token.endLineStart == 'undefined' ? original$611.token.lineStart : stx$613.token.endLineStart;
                stx$613.token.startRange = typeof stx$613.token.startRange == 'undefined' ? original$611.token.range : stx$613.token.startRange;
                stx$613.token.endRange = typeof stx$613.token.endRange == 'undefined' ? original$611.token.range : stx$613.token.endRange;
                stx$613.token.sm_startLineNumber = typeof stx$613.token.sm_startLineNumber == 'undefined' ? stx$613.token.startLineNumber : stx$613.token.sm_startLineNumber;
                stx$613.token.sm_endLineNumber = typeof stx$613.token.sm_endLineNumber == 'undefined' ? stx$613.token.endLineNumber : stx$613.token.sm_endLineNumber;
                stx$613.token.sm_startLineStart = typeof stx$613.token.sm_startLineStart == 'undefined' ? stx$613.token.startLineStart : stx$613.token.sm_startLineStart;
                stx$613.token.sm_endLineStart = typeof stx$613.token.sm_endLineStart == 'undefined' ? stx$613.token.endLineStart : stx$613.token.sm_endLineStart;
                stx$613.token.sm_startRange = typeof stx$613.token.sm_startRange == 'undefined' ? stx$613.token.startRange : stx$613.token.sm_startRange;
                stx$613.token.sm_endRange = typeof stx$613.token.sm_endRange == 'undefined' ? stx$613.token.endRange : stx$613.token.sm_endRange;
                if (stx$613.token.startLineNumber === current$612.lastLineNumber && current$612.lastLineNumber !== current$612.lineNumber) {
                    stx$613.token.startLineNumber = current$612.lineNumber;
                } else if (stx$613.token.startLineNumber !== current$612.lastLineNumber) {
                    current$612.lineNumber++;
                    current$612.lastLineNumber = stx$613.token.startLineNumber;
                    stx$613.token.startLineNumber = current$612.lineNumber;
                }
                if (stx$613.token.inner.length > 0) {
                    stx$613.token.inner = adjustLineContext$440(stx$613.token.inner, original$611, current$612);
                }
                return stx$613;
            }
            // handle tokens with missing line info
            stx$613.token.lineNumber = typeof stx$613.token.lineNumber == 'undefined' ? original$611.token.lineNumber : stx$613.token.lineNumber;
            stx$613.token.lineStart = typeof stx$613.token.lineStart == 'undefined' ? original$611.token.lineStart : stx$613.token.lineStart;
            stx$613.token.range = typeof stx$613.token.range == 'undefined' ? original$611.token.range : stx$613.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$613.token.sm_lineNumber = typeof stx$613.token.sm_lineNumber == 'undefined' ? stx$613.token.lineNumber : stx$613.token.sm_lineNumber;
            stx$613.token.sm_lineStart = typeof stx$613.token.sm_lineStart == 'undefined' ? stx$613.token.lineStart : stx$613.token.sm_lineStart;
            stx$613.token.sm_range = typeof stx$613.token.sm_range == 'undefined' ? _$257.clone(stx$613.token.range) : stx$613.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$613.token.lineNumber === current$612.lastLineNumber && current$612.lastLineNumber !== current$612.lineNumber) {
                stx$613.token.lineNumber = current$612.lineNumber;
            } else if (stx$613.token.lineNumber !== current$612.lastLineNumber) {
                current$612.lineNumber++;
                current$612.lastLineNumber = stx$613.token.lineNumber;
                stx$613.token.lineNumber = current$612.lineNumber;
            }
            return stx$613;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$441(toks$614, context$615, prevStx$616, prevTerms$617) {
        assert$264(toks$614.length > 0, 'enforest assumes there are tokens to work with');
        prevStx$616 = prevStx$616 || [];
        prevTerms$617 = prevTerms$617 || [];
        function step$618(head$619, rest$620) {
            var innerTokens$621;
            assert$264(Array.isArray(rest$620), 'result must at least be an empty array');
            if (head$619.hasPrototype(TermTree$399)) {
                // function call
                var emp$624 = head$619.emp;
                var emp$624 = head$619.emp;
                var keyword$627 = head$619.keyword;
                var delim$629 = head$619.delim;
                var id$631 = head$619.id;
                var delim$629 = head$619.delim;
                var emp$624 = head$619.emp;
                var punc$635 = head$619.punc;
                var keyword$627 = head$619.keyword;
                var emp$624 = head$619.emp;
                var emp$624 = head$619.emp;
                var emp$624 = head$619.emp;
                var delim$629 = head$619.delim;
                var delim$629 = head$619.delim;
                var id$631 = head$619.id;
                var keyword$627 = head$619.keyword;
                var keyword$627 = head$619.keyword;
                var keyword$627 = head$619.keyword;
                var keyword$627 = head$619.keyword;
                var keyword$627 = head$619.keyword;
                if (head$619.hasPrototype(Expr$402) && rest$620[0] && rest$620[0].token.type === parser$258.Token.Delimiter && rest$620[0].token.value === '()') {
                    var argRes$670, enforestedArgs$671 = [], commas$672 = [];
                    rest$620[0].expose();
                    innerTokens$621 = rest$620[0].token.inner;
                    while (innerTokens$621.length > 0) {
                        argRes$670 = enforest$441(innerTokens$621, context$615);
                        enforestedArgs$671.push(argRes$670.result);
                        innerTokens$621 = argRes$670.rest;
                        if (innerTokens$621[0] && innerTokens$621[0].token.value === ',') {
                            // record the comma for later
                            commas$672.push(innerTokens$621[0]);
                            // but dump it for the next loop turn
                            innerTokens$621 = innerTokens$621.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$673 = _$257.all(enforestedArgs$671, function (argTerm$674) {
                            return argTerm$674.hasPrototype(Expr$402);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$621.length === 0 && argsAreExprs$673) {
                        return step$618(Call$425.create(head$619, enforestedArgs$671, rest$620[0], commas$672), rest$620.slice(1));
                    }
                } else if (head$619.hasPrototype(Expr$402) && rest$620[0] && unwrapSyntax$266(rest$620[0]) === '?') {
                    var question$675 = rest$620[0];
                    var condRes$676 = enforest$441(rest$620.slice(1), context$615);
                    var truExpr$677 = condRes$676.result;
                    var condRight$678 = condRes$676.rest;
                    if (truExpr$677.hasPrototype(Expr$402) && condRight$678[0] && unwrapSyntax$266(condRight$678[0]) === ':') {
                        var colon$679 = condRight$678[0];
                        var flsRes$680 = enforest$441(condRight$678.slice(1), context$615);
                        var flsExpr$681 = flsRes$680.result;
                        if (flsExpr$681.hasPrototype(Expr$402)) {
                            return step$618(ConditionalExpression$413.create(head$619, question$675, truExpr$677, colon$679, flsExpr$681), flsRes$680.rest);
                        }
                    }
                } else if (head$619.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$627) === 'new' && rest$620[0]) {
                    var newCallRes$682 = enforest$441(rest$620, context$615);
                    if (newCallRes$682.result.hasPrototype(Call$425)) {
                        return step$618(Const$424.create(head$619, newCallRes$682.result), newCallRes$682.rest);
                    }
                } else if (head$619.hasPrototype(Delimiter$416) && delim$629.token.value === '()' && rest$620[0] && rest$620[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$620[0]) === '=>') {
                    var arrowRes$683 = enforest$441(rest$620.slice(1), context$615);
                    if (arrowRes$683.result.hasPrototype(Expr$402)) {
                        return step$618(ArrowFun$420.create(delim$629, rest$620[0], arrowRes$683.result.destruct()), arrowRes$683.rest);
                    } else {
                        throwSyntaxError$265('enforest', 'Body of arrow function must be an expression', rest$620.slice(1));
                    }
                } else if (head$619.hasPrototype(Id$417) && rest$620[0] && rest$620[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$620[0]) === '=>') {
                    var res$684 = enforest$441(rest$620.slice(1), context$615);
                    if (res$684.result.hasPrototype(Expr$402)) {
                        return step$618(ArrowFun$420.create(id$631, rest$620[0], res$684.result.destruct()), res$684.rest);
                    } else {
                        throwSyntaxError$265('enforest', 'Body of arrow function must be an expression', rest$620.slice(1));
                    }
                } else if (head$619.hasPrototype(Delimiter$416) && delim$629.token.value === '()') {
                    innerTokens$621 = delim$629.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$621.length === 0) {
                        return step$618(ParenExpression$409.create(head$619), rest$620);
                    } else {
                        var innerTerm$685 = get_expression$442(innerTokens$621, context$615);
                        if (innerTerm$685.result && innerTerm$685.result.hasPrototype(Expr$402)) {
                            return step$618(ParenExpression$409.create(head$619), rest$620);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$619.hasPrototype(Expr$402) && rest$620[0] && rest$620[1] && stxIsBinOp$438(rest$620[0])) {
                    var op$686 = rest$620[0];
                    var left$687 = head$619;
                    var rightStx$688 = rest$620.slice(1);
                    var bopPrevStx$689 = [rest$620[0]].concat(head$619.destruct().reverse(), prevStx$616);
                    var bopPrevTerms$690 = [
                            Punc$415.create(rest$620[0]),
                            head$619
                        ].concat(prevTerms$617);
                    var bopRes$691 = enforest$441(rightStx$688, context$615, bopPrevStx$689, bopPrevTerms$690);
                    // Lookbehind was matched, so it may not even be a binop anymore.
                    if (bopRes$691.prevTerms.length < bopPrevTerms$690.length) {
                        return bopRes$691;
                    }
                    var right$692 = bopRes$691.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$692.hasPrototype(Expr$402)) {
                        return step$618(BinOp$412.create(op$686, left$687, right$692), bopRes$691.rest);
                    }
                } else if (head$619.hasPrototype(Punc$415) && stxIsUnaryOp$437(punc$635)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$619.punc.term = head$619;
                    var unopPrevStx$693 = [punc$635].concat(prevStx$616);
                    var unopPrevTerms$694 = [head$619].concat(prevTerms$617);
                    var unopRes$695 = enforest$441(rest$620, context$615, unopPrevStx$693, unopPrevTerms$694);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopRes$695.prevTerms.length < unopPrevTerms$694.length) {
                        return unopRes$695;
                    }
                    if (unopRes$695.result.hasPrototype(Expr$402)) {
                        return step$618(UnaryOp$410.create(punc$635, unopRes$695.result), unopRes$695.rest);
                    }
                } else if (head$619.hasPrototype(Keyword$414) && stxIsUnaryOp$437(keyword$627)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$619.keyword.term = head$619;
                    var unopKeyPrevStx$696 = [keyword$627].concat(prevStx$616);
                    var unopKeyPrevTerms$697 = [head$619].concat(prevTerms$617);
                    var unopKeyres$698 = enforest$441(rest$620, context$615, unopKeyPrevStx$696, unopKeyPrevTerms$697);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopKeyres$698.prevTerms.length < unopKeyPrevTerms$697.length) {
                        return unopKeyres$698;
                    }
                    if (unopKeyres$698.result.hasPrototype(Expr$402)) {
                        return step$618(UnaryOp$410.create(keyword$627, unopKeyres$698.result), unopKeyres$698.rest);
                    }
                } else if (head$619.hasPrototype(Expr$402) && rest$620[0] && (unwrapSyntax$266(rest$620[0]) === '++' || unwrapSyntax$266(rest$620[0]) === '--')) {
                    return step$618(PostfixOp$411.create(head$619, rest$620[0]), rest$620.slice(1));
                } else if (head$619.hasPrototype(Expr$402) && rest$620[0] && rest$620[0].token.value === '[]') {
                    return step$618(ObjGet$427.create(head$619, Delimiter$416.create(rest$620[0].expose())), rest$620.slice(1));
                } else if (head$619.hasPrototype(Expr$402) && rest$620[0] && unwrapSyntax$266(rest$620[0]) === '.' && rest$620[1] && rest$620[1].token.type === parser$258.Token.Identifier) {
                    return step$618(ObjDotGet$426.create(head$619, rest$620[0], rest$620[1]), rest$620.slice(2));
                } else if (head$619.hasPrototype(Delimiter$416) && delim$629.token.value === '[]') {
                    return step$618(ArrayLiteral$408.create(head$619), rest$620);
                } else if (head$619.hasPrototype(Delimiter$416) && head$619.delim.token.value === '{}') {
                    return step$618(Block$407.create(head$619), rest$620);
                } else if (head$619.hasPrototype(Id$417) && unwrapSyntax$266(id$631) === '#quoteSyntax' && rest$620[0] && rest$620[0].token.value === '{}') {
                    var tempId$699 = fresh$396();
                    context$615.templateMap.set(tempId$699, rest$620[0].token.inner);
                    return step$618(syn$259.makeIdent('getTemplate', id$631), [syn$259.makeDelim('()', [syn$259.makeValue(tempId$699, id$631)], id$631)].concat(rest$620.slice(1)));
                } else if (head$619.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$627) === 'let' && (rest$620[0] && rest$620[0].token.type === parser$258.Token.Identifier || rest$620[0] && rest$620[0].token.type === parser$258.Token.Keyword || rest$620[0] && rest$620[0].token.type === parser$258.Token.Punctuator) && rest$620[1] && unwrapSyntax$266(rest$620[1]) === '=' && rest$620[2] && rest$620[2].token.value === 'macro') {
                    var mac$700 = enforest$441(rest$620.slice(2), context$615);
                    if (!mac$700.result.hasPrototype(AnonMacro$423)) {
                        throwSyntaxError$265('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$620.slice(2));
                    }
                    return step$618(LetMacro$421.create(rest$620[0], mac$700.result.body), mac$700.rest);
                } else if (head$619.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$627) === 'var' && rest$620[0]) {
                    var vsRes$701 = enforestVarStatement$439(rest$620, context$615, keyword$627);
                    if (vsRes$701) {
                        return step$618(VariableStatement$429.create(head$619, vsRes$701.result), vsRes$701.rest);
                    }
                } else if (head$619.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$627) === 'let' && rest$620[0]) {
                    var lsRes$702 = enforestVarStatement$439(rest$620, context$615, keyword$627);
                    if (lsRes$702) {
                        return step$618(LetStatement$430.create(head$619, lsRes$702.result), lsRes$702.rest);
                    }
                } else if (head$619.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$627) === 'const' && rest$620[0]) {
                    var csRes$703 = enforestVarStatement$439(rest$620, context$615, keyword$627);
                    if (csRes$703) {
                        return step$618(ConstStatement$431.create(head$619, csRes$703.result), csRes$703.rest);
                    }
                } else if (head$619.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$627) === 'for' && rest$620[0] && rest$620[0].token.value === '()') {
                    return step$618(ForStatement$436.create(keyword$627, rest$620[0]), rest$620.slice(1));
                }
            } else {
                assert$264(head$619 && head$619.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$619.token.type === parser$258.Token.Identifier || head$619.token.type === parser$258.Token.Keyword || head$619.token.type === parser$258.Token.Punctuator) && expandCount$385 < maxExpands$386 && context$615.env.has(resolve$390(head$619))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$704 = fresh$396();
                    var transformerContext$705 = makeExpanderContext$450(_$257.defaults({ mark: newMark$704 }, context$615));
                    // pull the macro transformer out the environment
                    var macroObj$706 = context$615.env.get(resolve$390(head$619));
                    var transformer$707 = macroObj$706.fn;
                    if (!builtinMode$384 && !macroObj$706.builtin) {
                        expandCount$385++;
                    }
                    // apply the transformer
                    var rt$708;
                    try {
                        rt$708 = transformer$707([head$619].concat(rest$620), transformerContext$705, prevStx$616, prevTerms$617);
                    } catch (e$709) {
                        if (e$709.type && e$709.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$710 = '`' + rest$620.slice(0, 5).map(function (stx$711) {
                                    return stx$711.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$265('macro', 'Macro `' + head$619.token.value + '` could not be matched with ' + argumentString$710, head$619);
                        } else {
                            // just rethrow it
                            throw e$709;
                        }
                    }
                    if (rt$708.prevTerms) {
                        prevTerms$617 = rt$708.prevTerms;
                    }
                    if (rt$708.prevStx) {
                        prevStx$616 = rt$708.prevStx;
                    }
                    if (!Array.isArray(rt$708.result)) {
                        throwSyntaxError$265('enforest', 'Macro must return a syntax array', head$619);
                    }
                    if (rt$708.result.length > 0) {
                        var adjustedResult$712 = adjustLineContext$440(rt$708.result, head$619);
                        adjustedResult$712[0].token.leadingComments = head$619.token.leadingComments;
                        return step$618(adjustedResult$712[0], adjustedResult$712.slice(1).concat(rt$708.rest));
                    } else {
                        return step$618(Empty$434.create(), rt$708.rest);
                    }
                }    // anon macro definition
                else if (head$619.token.type === parser$258.Token.Identifier && head$619.token.value === 'macro' && rest$620[0] && rest$620[0].token.value === '{}') {
                    return step$618(AnonMacro$423.create(rest$620[0].expose().token.inner), rest$620.slice(1));
                }    // macro definition
                else if (head$619.token.type === parser$258.Token.Identifier && head$619.token.value === 'macro' && rest$620[0] && (rest$620[0].token.type === parser$258.Token.Identifier || rest$620[0].token.type === parser$258.Token.Keyword || rest$620[0].token.type === parser$258.Token.Punctuator) && rest$620[1] && rest$620[1].token.type === parser$258.Token.Delimiter && rest$620[1].token.value === '{}') {
                    return step$618(Macro$422.create(rest$620[0], rest$620[1].expose().token.inner), rest$620.slice(2));
                }    // module definition
                else if (unwrapSyntax$266(head$619) === 'module' && rest$620[0] && rest$620[0].token.value === '{}') {
                    return step$618(Module$433.create(rest$620[0]), rest$620.slice(1));
                }    // function definition
                else if (head$619.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$619) === 'function' && rest$620[0] && rest$620[0].token.type === parser$258.Token.Identifier && rest$620[1] && rest$620[1].token.type === parser$258.Token.Delimiter && rest$620[1].token.value === '()' && rest$620[2] && rest$620[2].token.type === parser$258.Token.Delimiter && rest$620[2].token.value === '{}') {
                    rest$620[1].token.inner = rest$620[1].expose().token.inner;
                    rest$620[2].token.inner = rest$620[2].expose().token.inner;
                    return step$618(NamedFun$418.create(head$619, null, rest$620[0], rest$620[1], rest$620[2]), rest$620.slice(3));
                }    // generator function definition
                else if (head$619.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$619) === 'function' && rest$620[0] && rest$620[0].token.type === parser$258.Token.Punctuator && rest$620[0].token.value === '*' && rest$620[1] && rest$620[1].token.type === parser$258.Token.Identifier && rest$620[2] && rest$620[2].token.type === parser$258.Token.Delimiter && rest$620[2].token.value === '()' && rest$620[3] && rest$620[3].token.type === parser$258.Token.Delimiter && rest$620[3].token.value === '{}') {
                    rest$620[2].token.inner = rest$620[2].expose().token.inner;
                    rest$620[3].token.inner = rest$620[3].expose().token.inner;
                    return step$618(NamedFun$418.create(head$619, rest$620[0], rest$620[1], rest$620[2], rest$620[3]), rest$620.slice(4));
                }    // anonymous function definition
                else if (head$619.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$619) === 'function' && rest$620[0] && rest$620[0].token.type === parser$258.Token.Delimiter && rest$620[0].token.value === '()' && rest$620[1] && rest$620[1].token.type === parser$258.Token.Delimiter && rest$620[1].token.value === '{}') {
                    rest$620[0].token.inner = rest$620[0].expose().token.inner;
                    rest$620[1].token.inner = rest$620[1].expose().token.inner;
                    return step$618(AnonFun$419.create(head$619, null, rest$620[0], rest$620[1]), rest$620.slice(2));
                }    // anonymous generator function definition
                else if (head$619.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$619) === 'function' && rest$620[0] && rest$620[0].token.type === parser$258.Token.Punctuator && rest$620[0].token.value === '*' && rest$620[1] && rest$620[1].token.type === parser$258.Token.Delimiter && rest$620[1].token.value === '()' && rest$620[2] && rest$620[2].token.type === parser$258.Token.Delimiter && rest$620[2].token.value === '{}') {
                    rest$620[1].token.inner = rest$620[1].expose().token.inner;
                    rest$620[2].token.inner = rest$620[2].expose().token.inner;
                    return step$618(AnonFun$419.create(head$619, rest$620[0], rest$620[1], rest$620[2]), rest$620.slice(3));
                }    // arrow function
                else if ((head$619.token.type === parser$258.Token.Delimiter && head$619.token.value === '()' || head$619.token.type === parser$258.Token.Identifier) && rest$620[0] && rest$620[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$620[0]) === '=>' && rest$620[1] && rest$620[1].token.type === parser$258.Token.Delimiter && rest$620[1].token.value === '{}') {
                    return step$618(ArrowFun$420.create(head$619, rest$620[0], rest$620[1]), rest$620.slice(2));
                }    // catch statement
                else if (head$619.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$619) === 'catch' && rest$620[0] && rest$620[0].token.type === parser$258.Token.Delimiter && rest$620[0].token.value === '()' && rest$620[1] && rest$620[1].token.type === parser$258.Token.Delimiter && rest$620[1].token.value === '{}') {
                    rest$620[0].token.inner = rest$620[0].expose().token.inner;
                    rest$620[1].token.inner = rest$620[1].expose().token.inner;
                    return step$618(CatchClause$432.create(head$619, rest$620[0], rest$620[1]), rest$620.slice(2));
                }    // this expression
                else if (head$619.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$619) === 'this') {
                    return step$618(ThisExpression$404.create(head$619), rest$620);
                }    // literal
                else if (head$619.token.type === parser$258.Token.NumericLiteral || head$619.token.type === parser$258.Token.StringLiteral || head$619.token.type === parser$258.Token.BooleanLiteral || head$619.token.type === parser$258.Token.RegularExpression || head$619.token.type === parser$258.Token.NullLiteral) {
                    return step$618(Lit$405.create(head$619), rest$620);
                }    // export
                else if (head$619.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$619) === 'export' && rest$620[0] && (rest$620[0].token.type === parser$258.Token.Identifier || rest$620[0].token.type === parser$258.Token.Keyword || rest$620[0].token.type === parser$258.Token.Punctuator)) {
                    return step$618(Export$435.create(rest$620[0]), rest$620.slice(1));
                }    // identifier
                else if (head$619.token.type === parser$258.Token.Identifier) {
                    return step$618(Id$417.create(head$619), rest$620);
                }    // punctuator
                else if (head$619.token.type === parser$258.Token.Punctuator) {
                    return step$618(Punc$415.create(head$619), rest$620);
                } else if (head$619.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$619) === 'with') {
                    throwSyntaxError$265('enforest', 'with is not supported in sweet.js', head$619);
                }    // keyword
                else if (head$619.token.type === parser$258.Token.Keyword) {
                    return step$618(Keyword$414.create(head$619), rest$620);
                }    // Delimiter
                else if (head$619.token.type === parser$258.Token.Delimiter) {
                    return step$618(Delimiter$416.create(head$619.expose()), rest$620);
                }    // end of file
                else if (head$619.token.type === parser$258.Token.EOF) {
                    assert$264(rest$620.length === 0, 'nothing should be after an EOF');
                    return step$618(EOF$400.create(head$619), []);
                } else {
                    // todo: are we missing cases?
                    assert$264(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$619,
                rest: rest$620,
                prevStx: prevStx$616,
                prevTerms: prevTerms$617
            };
        }
        return step$618(toks$614[0], toks$614.slice(1));
    }
    function get_expression$442(stx$713, context$714) {
        var res$715 = enforest$441(stx$713, context$714);
        var next$716 = res$715;
        var peek$717;
        var prevStx$718;
        if (!next$716.result.hasPrototype(Expr$402)) {
            return {
                result: null,
                rest: stx$713
            };
        }
        while (next$716.rest.length) {
            // Enforest the next term tree since it might be an infix macro that
            // consumes the initial expression.
            peek$717 = enforest$441(next$716.rest, context$714, next$716.result.destruct(), [next$716.result]);
            // If it has prev terms it wasn't infix, but it we need to run it
            // through enforest together with the initial expression to see if
            // it extends it into a longer expression.
            if (peek$717.prevTerms.length === 1) {
                peek$717 = enforest$441([next$716.result].concat(peek$717.result.destruct(), peek$717.rest), context$714);
            }
            // No new expression was created, so we've reached the end.
            if (peek$717.result === next$716.result) {
                break;
            }
            // A new expression was created, so loop back around and keep going.
            next$716 = peek$717;
        }
        return next$716;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$443(newMark$719, env$720) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$721(match$722) {
            if (match$722.level === 0) {
                // replace the match property with the marked syntax
                match$722.match = _$257.map(match$722.match, function (stx$723) {
                    return stx$723.mark(newMark$719);
                });
            } else {
                _$257.each(match$722.match, function (match$724) {
                    dfs$721(match$724);
                });
            }
        }
        _$257.keys(env$720).forEach(function (key$725) {
            dfs$721(env$720[key$725]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$444(mac$726, context$727) {
        var body$728 = mac$726.body;
        // raw function primitive form
        if (!(body$728[0] && body$728[0].token.type === parser$258.Token.Keyword && body$728[0].token.value === 'function')) {
            throwSyntaxError$265('load macro', 'Primitive macro form must contain a function for the macro body', body$728);
        }
        var stub$729 = parser$258.read('()');
        stub$729[0].token.inner = body$728;
        var expanded$730 = expand$449(stub$729, context$727);
        expanded$730 = expanded$730[0].destruct().concat(expanded$730[1].eof);
        var flattend$731 = flatten$454(expanded$730);
        var bodyCode$732 = codegen$263.generate(parser$258.parse(flattend$731));
        var macroFn$733 = scopedEval$378(bodyCode$732, {
                makeValue: syn$259.makeValue,
                makeRegex: syn$259.makeRegex,
                makeIdent: syn$259.makeIdent,
                makeKeyword: syn$259.makeKeyword,
                makePunc: syn$259.makePunc,
                makeDelim: syn$259.makeDelim,
                getExpr: function (stx$734) {
                    var r$735;
                    if (stx$734.length === 0) {
                        return {
                            success: false,
                            result: [],
                            rest: []
                        };
                    }
                    r$735 = get_expression$442(stx$734, context$727);
                    return {
                        success: r$735.result !== null,
                        result: r$735.result === null ? [] : r$735.result.destruct(),
                        rest: r$735.rest
                    };
                },
                getIdent: function (stx$736) {
                    if (stx$736[0] && stx$736[0].token.type === parser$258.Token.Identifier) {
                        return {
                            success: true,
                            result: [stx$736[0]],
                            rest: stx$736.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$736
                    };
                },
                getLit: function (stx$737) {
                    if (stx$737[0] && patternModule$261.typeIsLiteral(stx$737[0].token.type)) {
                        return {
                            success: true,
                            result: [stx$737[0]],
                            rest: stx$737.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$737
                    };
                },
                unwrapSyntax: syn$259.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$265,
                prettyPrint: syn$259.prettyPrint,
                parser: parser$258,
                __fresh: fresh$396,
                _: _$257,
                patternModule: patternModule$261,
                getTemplate: function (id$738) {
                    return cloneSyntaxArray$445(context$727.templateMap.get(id$738));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$443,
                mergeMatches: function (newMatch$739, oldMatch$740) {
                    newMatch$739.patternEnv = _$257.extend({}, oldMatch$740.patternEnv, newMatch$739.patternEnv);
                    return newMatch$739;
                }
            });
        return macroFn$733;
    }
    function cloneSyntaxArray$445(arr$741) {
        return arr$741.map(function (stx$742) {
            var o$743 = syntaxFromToken$382(_$257.clone(stx$742.token), stx$742);
            if (o$743.token.type === parser$258.Token.Delimiter) {
                o$743.token.inner = cloneSyntaxArray$445(o$743.token.inner);
            }
            return o$743;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$446(stx$744, context$745, prevStx$746, prevTerms$747) {
        assert$264(context$745, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$744.length === 0) {
            return {
                terms: prevTerms$747 ? prevTerms$747.reverse() : [],
                context: context$745
            };
        }
        assert$264(stx$744[0].token, 'expecting a syntax object');
        var f$748 = enforest$441(stx$744, context$745, prevStx$746, prevTerms$747);
        // head :: TermTree
        var head$749 = f$748.result;
        // rest :: [Syntax]
        var rest$750 = f$748.rest;
        var macroDefinition$751;
        if (head$749.hasPrototype(Macro$422) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$751 = loadMacroDef$444(head$749, context$745);
            addToDefinitionCtx$447([head$749.name], context$745.defscope, false);
            context$745.env.set(resolve$390(head$749.name), {
                fn: macroDefinition$751,
                builtin: builtinMode$384
            });
            return expandToTermTree$446(rest$750, context$745, prevStx$746, prevTerms$747);
        }
        if (head$749.hasPrototype(LetMacro$421) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$751 = loadMacroDef$444(head$749, context$745);
            var freshName$755 = fresh$396();
            var renamedName$756 = head$749.name.rename(head$749.name, freshName$755);
            rest$750 = _$257.map(rest$750, function (stx$757) {
                return stx$757.rename(head$749.name, freshName$755);
            });
            head$749.name = renamedName$756;
            context$745.env.set(resolve$390(head$749.name), {
                fn: macroDefinition$751,
                builtin: builtinMode$384
            });
            return expandToTermTree$446(rest$750, context$745, prevStx$746, prevTerms$747);
        }
        // We build the newPrevTerms/Stx here (instead of at the beginning) so
        // that macro definitions don't get added to it.
        var destructed$752 = f$748.result.destruct();
        destructed$752.forEach(function (stx$758) {
            stx$758.term = head$749;
        });
        var newPrevTerms$753 = [head$749].concat(f$748.prevTerms);
        var newPrevStx$754 = destructed$752.reverse().concat(f$748.prevStx);
        if (head$749.hasPrototype(NamedFun$418)) {
            addToDefinitionCtx$447([head$749.name], context$745.defscope, true);
        }
        if (head$749.hasPrototype(VariableStatement$429)) {
            addToDefinitionCtx$447(_$257.map(head$749.decls, function (decl$759) {
                return decl$759.ident;
            }), context$745.defscope, true);
        }
        if (head$749.hasPrototype(Block$407) && head$749.body.hasPrototype(Delimiter$416)) {
            head$749.body.delim.token.inner.forEach(function (term$760) {
                if (term$760.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$447(_$257.map(term$760.decls, function (decl$761) {
                        return decl$761.ident;
                    }), context$745.defscope, true);
                }
            });
        }
        if (head$749.hasPrototype(Delimiter$416)) {
            head$749.delim.token.inner.forEach(function (term$762) {
                if (term$762.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$447(_$257.map(term$762.decls, function (decl$763) {
                        return decl$763.ident;
                    }), context$745.defscope, true);
                }
            });
        }
        if (head$749.hasPrototype(ForStatement$436)) {
            head$749.cond.expose();
            var forCond$764 = head$749.cond.token.inner;
            if (forCond$764[0] && resolve$390(forCond$764[0]) === 'let' && forCond$764[1] && forCond$764[1].token.type === parser$258.Token.Identifier) {
                var letNew$765 = fresh$396();
                var letId$766 = forCond$764[1];
                forCond$764 = forCond$764.map(function (stx$767) {
                    return stx$767.rename(letId$766, letNew$765);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$749.cond.token.inner = expand$449([forCond$764[0]], context$745).concat(expand$449(forCond$764.slice(1), context$745));
                // nice and easy case: `for (...) { ... }`
                if (rest$750[0] && rest$750[0].token.value === '{}') {
                    rest$750[0] = rest$750[0].rename(letId$766, letNew$765);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$768 = enforest$441(rest$750, context$745);
                    var bodyDestructed$769 = bodyEnf$768.result.destruct();
                    var renamedBodyTerm$770 = bodyEnf$768.result.rename(letId$766, letNew$765);
                    bodyDestructed$769.forEach(function (stx$771) {
                        stx$771.term = renamedBodyTerm$770;
                    });
                    return expandToTermTree$446(bodyEnf$768.rest, context$745, bodyDestructed$769.reverse().concat(newPrevStx$754), [renamedBodyTerm$770].concat(newPrevTerms$753));
                }
            } else {
                head$749.cond.token.inner = expand$449(head$749.cond.token.inner, context$745);
            }
        }
        return expandToTermTree$446(rest$750, context$745, newPrevStx$754, newPrevTerms$753);
    }
    function addToDefinitionCtx$447(idents$772, defscope$773, skipRep$774) {
        assert$264(idents$772 && idents$772.length > 0, 'expecting some variable identifiers');
        skipRep$774 = skipRep$774 || false;
        _$257.each(idents$772, function (id$775) {
            var skip$776 = false;
            if (skipRep$774) {
                var declRepeat$777 = _$257.find(defscope$773, function (def$778) {
                        return def$778.id.token.value === id$775.token.value && arraysEqual$391(marksof$389(def$778.id.context), marksof$389(id$775.context));
                    });
                skip$776 = typeof declRepeat$777 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$776) {
                var name$779 = fresh$396();
                defscope$773.push({
                    id: id$775,
                    name: name$779
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$448(term$780, context$781) {
        assert$264(context$781 && context$781.env, 'environment map is required');
        if (term$780.hasPrototype(ArrayLiteral$408)) {
            term$780.array.delim.token.inner = expand$449(term$780.array.delim.expose().token.inner, context$781);
            return term$780;
        } else if (term$780.hasPrototype(Block$407)) {
            term$780.body.delim.token.inner = expand$449(term$780.body.delim.expose().token.inner, context$781);
            return term$780;
        } else if (term$780.hasPrototype(ParenExpression$409)) {
            term$780.expr.delim.token.inner = expand$449(term$780.expr.delim.expose().token.inner, context$781);
            return term$780;
        } else if (term$780.hasPrototype(Call$425)) {
            term$780.fun = expandTermTreeToFinal$448(term$780.fun, context$781);
            term$780.args = _$257.map(term$780.args, function (arg$782) {
                return expandTermTreeToFinal$448(arg$782, context$781);
            });
            return term$780;
        } else if (term$780.hasPrototype(UnaryOp$410)) {
            term$780.expr = expandTermTreeToFinal$448(term$780.expr, context$781);
            return term$780;
        } else if (term$780.hasPrototype(BinOp$412)) {
            term$780.left = expandTermTreeToFinal$448(term$780.left, context$781);
            term$780.right = expandTermTreeToFinal$448(term$780.right, context$781);
            return term$780;
        } else if (term$780.hasPrototype(ObjGet$427)) {
            term$780.right.delim.token.inner = expand$449(term$780.right.delim.expose().token.inner, context$781);
            return term$780;
        } else if (term$780.hasPrototype(ObjDotGet$426)) {
            term$780.left = expandTermTreeToFinal$448(term$780.left, context$781);
            term$780.right = expandTermTreeToFinal$448(term$780.right, context$781);
            return term$780;
        } else if (term$780.hasPrototype(VariableDeclaration$428)) {
            if (term$780.init) {
                term$780.init = expandTermTreeToFinal$448(term$780.init, context$781);
            }
            return term$780;
        } else if (term$780.hasPrototype(VariableStatement$429)) {
            term$780.decls = _$257.map(term$780.decls, function (decl$783) {
                return expandTermTreeToFinal$448(decl$783, context$781);
            });
            return term$780;
        } else if (term$780.hasPrototype(Delimiter$416)) {
            // expand inside the delimiter and then continue on
            term$780.delim.token.inner = expand$449(term$780.delim.expose().token.inner, context$781);
            return term$780;
        } else if (term$780.hasPrototype(NamedFun$418) || term$780.hasPrototype(AnonFun$419) || term$780.hasPrototype(CatchClause$432) || term$780.hasPrototype(ArrowFun$420) || term$780.hasPrototype(Module$433)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$784 = [];
            var bodyContext$785 = makeExpanderContext$450(_$257.defaults({ defscope: newDef$784 }, context$781));
            var paramSingleIdent$786 = term$780.params && term$780.params.token.type === parser$258.Token.Identifier;
            var params$787;
            if (term$780.params && term$780.params.token.type === parser$258.Token.Delimiter) {
                params$787 = term$780.params.expose();
            } else if (paramSingleIdent$786) {
                params$787 = term$780.params;
            } else {
                params$787 = syn$259.makeDelim('()', [], null);
            }
            var bodies$788;
            if (Array.isArray(term$780.body)) {
                bodies$788 = syn$259.makeDelim('{}', term$780.body, null);
            } else {
                bodies$788 = term$780.body;
            }
            bodies$788 = bodies$788.addDefCtx(newDef$784);
            var paramNames$789 = _$257.map(getParamIdentifiers$398(params$787), function (param$796) {
                    var freshName$797 = fresh$396();
                    return {
                        freshName: freshName$797,
                        originalParam: param$796,
                        renamedParam: param$796.rename(param$796, freshName$797)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$790 = _$257.reduce(paramNames$789, function (accBody$798, p$799) {
                    return accBody$798.rename(p$799.originalParam, p$799.freshName);
                }, bodies$788);
            renamedBody$790 = renamedBody$790.expose();
            var expandedResult$791 = expandToTermTree$446(renamedBody$790.token.inner, bodyContext$785);
            var bodyTerms$792 = expandedResult$791.terms;
            var renamedParams$793 = _$257.map(paramNames$789, function (p$800) {
                    return p$800.renamedParam;
                });
            var flatArgs$794;
            if (paramSingleIdent$786) {
                flatArgs$794 = renamedParams$793[0];
            } else {
                flatArgs$794 = syn$259.makeDelim('()', joinSyntax$383(renamedParams$793, ','), term$780.params || null);
            }
            var expandedArgs$795 = expand$449([flatArgs$794], bodyContext$785);
            assert$264(expandedArgs$795.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$780.params) {
                term$780.params = expandedArgs$795[0];
            }
            bodyTerms$792 = _$257.map(bodyTerms$792, function (bodyTerm$801) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$802 = bodyTerm$801.addDefCtx(newDef$784);
                // finish expansion
                return expandTermTreeToFinal$448(termWithCtx$802, expandedResult$791.context);
            });
            if (term$780.hasPrototype(Module$433)) {
                bodyTerms$792 = _$257.filter(bodyTerms$792, function (bodyTerm$803) {
                    if (bodyTerm$803.hasPrototype(Export$435)) {
                        term$780.exports.push(bodyTerm$803);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$790.token.inner = bodyTerms$792;
            if (Array.isArray(term$780.body)) {
                term$780.body = renamedBody$790.token.inner;
            } else {
                term$780.body = renamedBody$790;
            }
            // and continue expand the rest
            return term$780;
        }
        // the term is fine as is
        return term$780;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$449(stx$804, context$805) {
        assert$264(context$805, 'must provide an expander context');
        var trees$806 = expandToTermTree$446(stx$804, context$805);
        return _$257.map(trees$806.terms, function (term$807) {
            return expandTermTreeToFinal$448(term$807, trees$806.context);
        });
    }
    function makeExpanderContext$450(o$808) {
        o$808 = o$808 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$808.env || new StringMap$377(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$808.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$808.templateMap || new StringMap$377(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$808.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$451(stx$809, moduleContexts$810, _maxExpands$811) {
        moduleContexts$810 = moduleContexts$810 || [];
        maxExpands$386 = _maxExpands$811 || Infinity;
        expandCount$385 = 0;
        var context$812 = makeExpanderContext$450();
        var modBody$813 = syn$259.makeDelim('{}', stx$809, null);
        modBody$813 = _$257.reduce(moduleContexts$810, function (acc$815, mod$816) {
            context$812.env.extend(mod$816.env);
            return loadModuleExports$453(acc$815, context$812.env, mod$816.exports, mod$816.env);
        }, modBody$813);
        var res$814 = expand$449([
                syn$259.makeIdent('module', null),
                modBody$813
            ], context$812);
        res$814 = res$814[0].destruct();
        return flatten$454(res$814[0].token.inner);
    }
    function expandModule$452(stx$817, moduleContexts$818) {
        moduleContexts$818 = moduleContexts$818 || [];
        maxExpands$386 = Infinity;
        expandCount$385 = 0;
        var context$819 = makeExpanderContext$450();
        var modBody$820 = syn$259.makeDelim('{}', stx$817, null);
        modBody$820 = _$257.reduce(moduleContexts$818, function (acc$822, mod$823) {
            context$819.env.extend(mod$823.env);
            return loadModuleExports$453(acc$822, context$819.env, mod$823.exports, mod$823.env);
        }, modBody$820);
        builtinMode$384 = true;
        var moduleRes$821 = expand$449([
                syn$259.makeIdent('module', null),
                modBody$820
            ], context$819);
        builtinMode$384 = false;
        context$819.exports = _$257.map(moduleRes$821[0].exports, function (term$824) {
            return {
                oldExport: term$824.name,
                newParam: syn$259.makeIdent(term$824.name.token.value, null)
            };
        });
        return context$819;
    }
    function loadModuleExports$453(stx$825, newEnv$826, exports$827, oldEnv$828) {
        return _$257.reduce(exports$827, function (acc$829, param$830) {
            var newName$831 = fresh$396();
            newEnv$826.set(resolve$390(param$830.newParam.rename(param$830.newParam, newName$831)), oldEnv$828.get(resolve$390(param$830.oldExport)));
            return acc$829.rename(param$830.newParam, newName$831);
        }, stx$825);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$454(stx$832) {
        return _$257.reduce(stx$832, function (acc$833, stx$834) {
            if (stx$834.token.type === parser$258.Token.Delimiter) {
                var exposed$835 = stx$834.expose();
                var openParen$836 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$834.token.value[0],
                        range: stx$834.token.startRange,
                        sm_range: typeof stx$834.token.sm_startRange == 'undefined' ? stx$834.token.startRange : stx$834.token.sm_startRange,
                        lineNumber: stx$834.token.startLineNumber,
                        sm_lineNumber: typeof stx$834.token.sm_startLineNumber == 'undefined' ? stx$834.token.startLineNumber : stx$834.token.sm_startLineNumber,
                        lineStart: stx$834.token.startLineStart,
                        sm_lineStart: typeof stx$834.token.sm_startLineStart == 'undefined' ? stx$834.token.startLineStart : stx$834.token.sm_startLineStart
                    }, exposed$835);
                var closeParen$837 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$834.token.value[1],
                        range: stx$834.token.endRange,
                        sm_range: typeof stx$834.token.sm_endRange == 'undefined' ? stx$834.token.endRange : stx$834.token.sm_endRange,
                        lineNumber: stx$834.token.endLineNumber,
                        sm_lineNumber: typeof stx$834.token.sm_endLineNumber == 'undefined' ? stx$834.token.endLineNumber : stx$834.token.sm_endLineNumber,
                        lineStart: stx$834.token.endLineStart,
                        sm_lineStart: typeof stx$834.token.sm_endLineStart == 'undefined' ? stx$834.token.endLineStart : stx$834.token.sm_endLineStart
                    }, exposed$835);
                if (stx$834.token.leadingComments) {
                    openParen$836.token.leadingComments = stx$834.token.leadingComments;
                }
                if (stx$834.token.trailingComments) {
                    openParen$836.token.trailingComments = stx$834.token.trailingComments;
                }
                acc$833.push(openParen$836);
                push$387.apply(acc$833, flatten$454(exposed$835.token.inner));
                acc$833.push(closeParen$837);
                return acc$833;
            }
            stx$834.token.sm_lineNumber = stx$834.token.sm_lineNumber ? stx$834.token.sm_lineNumber : stx$834.token.lineNumber;
            stx$834.token.sm_lineStart = stx$834.token.sm_lineStart ? stx$834.token.sm_lineStart : stx$834.token.lineStart;
            stx$834.token.sm_range = stx$834.token.sm_range ? stx$834.token.sm_range : stx$834.token.range;
            acc$833.push(stx$834);
            return acc$833;
        }, []);
    }
    exports$256.StringMap = StringMap$377;
    exports$256.enforest = enforest$441;
    exports$256.expand = expandTopLevel$451;
    exports$256.expandModule = expandModule$452;
    exports$256.resolve = resolve$390;
    exports$256.get_expression = get_expression$442;
    exports$256.makeExpanderContext = makeExpanderContext$450;
    exports$256.Expr = Expr$402;
    exports$256.VariableStatement = VariableStatement$429;
    exports$256.tokensToSyntax = syn$259.tokensToSyntax;
    exports$256.syntaxToTokens = syn$259.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map