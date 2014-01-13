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
                var o$458 = Object.create(this);
                if (typeof o$458.construct === 'function') {
                    o$458.construct.apply(o$458, arguments);
                }
                return o$458;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$459) {
                var result$460 = Object.create(this);
                for (var prop$461 in properties$459) {
                    if (properties$459.hasOwnProperty(prop$461)) {
                        result$460[prop$461] = properties$459[prop$461];
                    }
                }
                return result$460;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$462) {
                function F$463() {
                }
                F$463.prototype = proto$462;
                return this instanceof F$463;
            },
            enumerable: false,
            writable: true
        }
    });
    function StringMap$377(o$464) {
        this.__data = o$464 || {};
    }
    StringMap$377.prototype = {
        has: function (key$465) {
            return Object.prototype.hasOwnProperty.call(this.__data, key$465);
        },
        get: function (key$466) {
            return this.has(key$466) ? this.__data[key$466] : void 0;
        },
        set: function (key$467, value$468) {
            this.__data[key$467] = value$468;
        },
        extend: function () {
            var args$469 = _$257.map(_$257.toArray(arguments), function (x$470) {
                    return x$470.__data;
                });
            _$257.extend.apply(_$257, [this.__data].concat(args$469));
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
    function remdup$388(mark$471, mlist$472) {
        if (mark$471 === _$257.first(mlist$472)) {
            return _$257.rest(mlist$472, 1);
        }
        return [mark$471].concat(mlist$472);
    }
    // (CSyntax) -> [...Num]
    function marksof$389(ctx$473, stopName$474, originalName$475) {
        var mark$476, submarks$477;
        if (ctx$473 instanceof Mark$380) {
            mark$476 = ctx$473.mark;
            submarks$477 = marksof$389(ctx$473.context, stopName$474, originalName$475);
            return remdup$388(mark$476, submarks$477);
        }
        if (ctx$473 instanceof Def$381) {
            return marksof$389(ctx$473.context, stopName$474, originalName$475);
        }
        if (ctx$473 instanceof Rename$379) {
            if (stopName$474 === originalName$475 + '$' + ctx$473.name) {
                return [];
            }
            return marksof$389(ctx$473.context, stopName$474, originalName$475);
        }
        return [];
    }
    function resolve$390(stx$478) {
        return resolveCtx$394(stx$478.token.value, stx$478.context, [], []);
    }
    function arraysEqual$391(a$479, b$480) {
        if (a$479.length !== b$480.length) {
            return false;
        }
        for (var i$481 = 0; i$481 < a$479.length; i$481++) {
            if (a$479[i$481] !== b$480[i$481]) {
                return false;
            }
        }
        return true;
    }
    function renames$392(defctx$482, oldctx$483, originalName$484) {
        var acc$485 = oldctx$483;
        for (var i$486 = 0; i$486 < defctx$482.length; i$486++) {
            if (defctx$482[i$486].id.token.value === originalName$484) {
                acc$485 = new Rename$379(defctx$482[i$486].id, defctx$482[i$486].name, acc$485, defctx$482);
            }
        }
        return acc$485;
    }
    function unionEl$393(arr$487, el$488) {
        if (arr$487.indexOf(el$488) === -1) {
            var res$489 = arr$487.slice(0);
            res$489.push(el$488);
            return res$489;
        }
        return arr$487;
    }
    // (Syntax) -> String
    function resolveCtx$394(originalName$490, ctx$491, stop_spine$492, stop_branch$493) {
        if (ctx$491 instanceof Mark$380) {
            return resolveCtx$394(originalName$490, ctx$491.context, stop_spine$492, stop_branch$493);
        }
        if (ctx$491 instanceof Def$381) {
            if (stop_spine$492.indexOf(ctx$491.defctx) !== -1) {
                return resolveCtx$394(originalName$490, ctx$491.context, stop_spine$492, stop_branch$493);
            } else {
                return resolveCtx$394(originalName$490, renames$392(ctx$491.defctx, ctx$491.context, originalName$490), stop_spine$492, unionEl$393(stop_branch$493, ctx$491.defctx));
            }
        }
        if (ctx$491 instanceof Rename$379) {
            if (originalName$490 === ctx$491.id.token.value) {
                var idName$494 = resolveCtx$394(ctx$491.id.token.value, ctx$491.id.context, stop_branch$493, stop_branch$493);
                var subName$495 = resolveCtx$394(originalName$490, ctx$491.context, unionEl$393(stop_spine$492, ctx$491.def), stop_branch$493);
                if (idName$494 === subName$495) {
                    var idMarks$496 = marksof$389(ctx$491.id.context, originalName$490 + '$' + ctx$491.name, originalName$490);
                    var subMarks$497 = marksof$389(ctx$491.context, originalName$490 + '$' + ctx$491.name, originalName$490);
                    if (arraysEqual$391(idMarks$496, subMarks$497)) {
                        return originalName$490 + '$' + ctx$491.name;
                    }
                }
            }
            return resolveCtx$394(originalName$490, ctx$491.context, stop_spine$492, stop_branch$493);
        }
        return originalName$490;
    }
    var nextFresh$395 = 0;
    // fun () -> Num
    function fresh$396() {
        return nextFresh$395++;
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$397(towrap$498, delimSyntax$499) {
        assert$264(delimSyntax$499.token.type === parser$258.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$382({
            type: parser$258.Token.Delimiter,
            value: delimSyntax$499.token.value,
            inner: towrap$498,
            range: delimSyntax$499.token.range,
            startLineNumber: delimSyntax$499.token.startLineNumber,
            lineStart: delimSyntax$499.token.lineStart
        }, delimSyntax$499);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$398(argSyntax$500) {
        if (argSyntax$500.token.type === parser$258.Token.Delimiter) {
            return _$257.filter(argSyntax$500.token.inner, function (stx$501) {
                return stx$501.token.value !== ',';
            });
        } else if (argSyntax$500.token.type === parser$258.Token.Identifier) {
            return [argSyntax$500];
        } else {
            assert$264(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$399 = {
            destruct: function () {
                return _$257.reduce(this.properties, _$257.bind(function (acc$502, prop$503) {
                    if (this[prop$503] && this[prop$503].hasPrototype(TermTree$399)) {
                        push$387.apply(acc$502, this[prop$503].destruct());
                        return acc$502;
                    } else if (this[prop$503] && this[prop$503].token && this[prop$503].token.inner) {
                        var clone$504 = syntaxFromToken$382(_$257.clone(this[prop$503].token), this[prop$503]);
                        clone$504.token.inner = _$257.reduce(clone$504.token.inner, function (acc$505, t$506) {
                            if (t$506.hasPrototype(TermTree$399)) {
                                push$387.apply(acc$505, t$506.destruct());
                                return acc$505;
                            }
                            acc$505.push(t$506);
                            return acc$505;
                        }, []);
                        acc$502.push(clone$504);
                        return acc$502;
                    } else if (Array.isArray(this[prop$503])) {
                        var destArr$507 = _$257.reduce(this[prop$503], function (acc$508, t$509) {
                                if (t$509.hasPrototype(TermTree$399)) {
                                    push$387.apply(acc$508, t$509.destruct());
                                    return acc$508;
                                }
                                acc$508.push(t$509);
                                return acc$508;
                            }, []);
                        push$387.apply(acc$502, destArr$507);
                        return acc$502;
                    } else if (this[prop$503]) {
                        acc$502.push(this[prop$503]);
                        return acc$502;
                    } else {
                        return acc$502;
                    }
                }, this), []);
            },
            addDefCtx: function (def$510) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$511) {
                    var prop$512 = this.properties[i$511];
                    if (Array.isArray(this[prop$512])) {
                        this[prop$512] = _$257.map(this[prop$512], function (item$513) {
                            return item$513.addDefCtx(def$510);
                        });
                    } else if (this[prop$512]) {
                        this[prop$512] = this[prop$512].addDefCtx(def$510);
                    }
                }, this));
                return this;
            },
            rename: function (id$514, name$515) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$516) {
                    var prop$517 = this.properties[i$516];
                    if (Array.isArray(this[prop$517])) {
                        this[prop$517] = _$257.map(this[prop$517], function (item$518) {
                            return item$518.rename(id$514, name$515);
                        });
                    } else if (this[prop$517]) {
                        this[prop$517] = this[prop$517].rename(id$514, name$515);
                    }
                }, this));
                return this;
            }
        };
    var EOF$400 = TermTree$399.extend({
            properties: ['eof'],
            construct: function (e$519) {
                this.eof = e$519;
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
            construct: function (that$520) {
                this.this = that$520;
            }
        });
    var Lit$405 = PrimaryExpression$403.extend({
            properties: ['lit'],
            construct: function (l$521) {
                this.lit = l$521;
            }
        });
    exports$256._test.PropertyAssignment = PropertyAssignment$406;
    var PropertyAssignment$406 = TermTree$399.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$522, assignment$523) {
                this.propName = propName$522;
                this.assignment = assignment$523;
            }
        });
    var Block$407 = PrimaryExpression$403.extend({
            properties: ['body'],
            construct: function (body$524) {
                this.body = body$524;
            }
        });
    var ArrayLiteral$408 = PrimaryExpression$403.extend({
            properties: ['array'],
            construct: function (ar$525) {
                this.array = ar$525;
            }
        });
    var ParenExpression$409 = PrimaryExpression$403.extend({
            properties: ['expr'],
            construct: function (expr$526) {
                this.expr = expr$526;
            }
        });
    var UnaryOp$410 = Expr$402.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$527, expr$528) {
                this.op = op$527;
                this.expr = expr$528;
            }
        });
    var PostfixOp$411 = Expr$402.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$529, op$530) {
                this.expr = expr$529;
                this.op = op$530;
            }
        });
    var BinOp$412 = Expr$402.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$531, left$532, right$533) {
                this.op = op$531;
                this.left = left$532;
                this.right = right$533;
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
            construct: function (cond$534, question$535, tru$536, colon$537, fls$538) {
                this.cond = cond$534;
                this.question = question$535;
                this.tru = tru$536;
                this.colon = colon$537;
                this.fls = fls$538;
            }
        });
    var Keyword$414 = TermTree$399.extend({
            properties: ['keyword'],
            construct: function (k$539) {
                this.keyword = k$539;
            }
        });
    var Punc$415 = TermTree$399.extend({
            properties: ['punc'],
            construct: function (p$540) {
                this.punc = p$540;
            }
        });
    var Delimiter$416 = TermTree$399.extend({
            properties: ['delim'],
            construct: function (d$541) {
                this.delim = d$541;
            }
        });
    var Id$417 = PrimaryExpression$403.extend({
            properties: ['id'],
            construct: function (id$542) {
                this.id = id$542;
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
            construct: function (keyword$543, star$544, name$545, params$546, body$547) {
                this.keyword = keyword$543;
                this.star = star$544;
                this.name = name$545;
                this.params = params$546;
                this.body = body$547;
            }
        });
    var AnonFun$419 = Expr$402.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$548, star$549, params$550, body$551) {
                this.keyword = keyword$548;
                this.star = star$549;
                this.params = params$550;
                this.body = body$551;
            }
        });
    var ArrowFun$420 = Expr$402.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$552, arrow$553, body$554) {
                this.params = params$552;
                this.arrow = arrow$553;
                this.body = body$554;
            }
        });
    var LetMacro$421 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$555, body$556) {
                this.name = name$555;
                this.body = body$556;
            }
        });
    var Macro$422 = TermTree$399.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$557, body$558) {
                this.name = name$557;
                this.body = body$558;
            }
        });
    var AnonMacro$423 = TermTree$399.extend({
            properties: ['body'],
            construct: function (body$559) {
                this.body = body$559;
            }
        });
    var Const$424 = Expr$402.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$560, call$561) {
                this.newterm = newterm$560;
                this.call = call$561;
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
                var commas$562 = this.commas.slice();
                var delim$563 = syntaxFromToken$382(_$257.clone(this.delim.token), this.delim);
                delim$563.token.inner = _$257.reduce(this.args, function (acc$565, term$566) {
                    assert$264(term$566 && term$566.hasPrototype(TermTree$399), 'expecting term trees in destruct of Call');
                    push$387.apply(acc$565, term$566.destruct());
                    // add all commas except for the last one
                    if (commas$562.length > 0) {
                        acc$565.push(commas$562.shift());
                    }
                    return acc$565;
                }, []);
                var res$564 = this.fun.destruct();
                push$387.apply(res$564, Delimiter$416.create(delim$563).destruct());
                return res$564;
            },
            construct: function (funn$567, args$568, delim$569, commas$570) {
                assert$264(Array.isArray(args$568), 'requires an array of arguments terms');
                this.fun = funn$567;
                this.args = args$568;
                this.delim = delim$569;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$570;
            }
        });
    var ObjDotGet$426 = Expr$402.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$571, dot$572, right$573) {
                this.left = left$571;
                this.dot = dot$572;
                this.right = right$573;
            }
        });
    var ObjGet$427 = Expr$402.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$574, right$575) {
                this.left = left$574;
                this.right = right$575;
            }
        });
    var VariableDeclaration$428 = TermTree$399.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$576, eqstx$577, init$578, comma$579) {
                this.ident = ident$576;
                this.eqstx = eqstx$577;
                this.init = init$578;
                this.comma = comma$579;
            }
        });
    var VariableStatement$429 = Statement$401.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$257.reduce(this.decls, function (acc$580, decl$581) {
                    push$387.apply(acc$580, decl$581.destruct());
                    return acc$580;
                }, []));
            },
            construct: function (varkw$582, decls$583) {
                assert$264(Array.isArray(decls$583), 'decls must be an array');
                this.varkw = varkw$582;
                this.decls = decls$583;
            }
        });
    var LetStatement$430 = Statement$401.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$257.reduce(this.decls, function (acc$584, decl$585) {
                    push$387.apply(acc$584, decl$585.destruct());
                    return acc$584;
                }, []));
            },
            construct: function (letkw$586, decls$587) {
                assert$264(Array.isArray(decls$587), 'decls must be an array');
                this.letkw = letkw$586;
                this.decls = decls$587;
            }
        });
    var ConstStatement$431 = Statement$401.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$257.reduce(this.decls, function (acc$588, decl$589) {
                    push$387.apply(acc$588, decl$589.destruct());
                    return acc$588;
                }, []));
            },
            construct: function (constkw$590, decls$591) {
                assert$264(Array.isArray(decls$591), 'decls must be an array');
                this.constkw = constkw$590;
                this.decls = decls$591;
            }
        });
    var CatchClause$432 = Statement$401.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$592, params$593, body$594) {
                this.catchkw = catchkw$592;
                this.params = params$593;
                this.body = body$594;
            }
        });
    var Module$433 = TermTree$399.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$595) {
                this.body = body$595;
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
            construct: function (name$596) {
                this.name = name$596;
            }
        });
    var ForStatement$436 = Statement$401.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$597, cond$598) {
                this.forkw = forkw$597;
                this.cond = cond$598;
            }
        });
    var Template$437 = Expr$402.extend({
            properties: ['template'],
            construct: function (template$599) {
                this.template = template$599;
            }
        });
    function stxIsUnaryOp$438(stx$600) {
        var staticOperators$601 = [
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
        return _$257.contains(staticOperators$601, unwrapSyntax$266(stx$600));
    }
    function stxIsBinOp$439(stx$602) {
        var staticOperators$603 = [
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
        return _$257.contains(staticOperators$603, unwrapSyntax$266(stx$602));
    }
    function enforestVarStatement$440(stx$604, context$605, varStx$606) {
        var isLet$607 = /^(?:let|const)$/.test(varStx$606.token.value);
        var decls$608 = [];
        var rest$609 = stx$604;
        var rhs$610;
        if (!rest$609.length) {
            throwSyntaxError$265('enforest', 'Unexpected end of input', varStx$606);
        }
        while (rest$609.length) {
            if (rest$609[0].token.type === parser$258.Token.Identifier) {
                if (isLet$607) {
                    var freshName$611 = fresh$396();
                    var renamedId$612 = rest$609[0].rename(rest$609[0], freshName$611);
                    rest$609 = rest$609.map(function (stx$613) {
                        return stx$613.rename(rest$609[0], freshName$611);
                    });
                    rest$609[0] = renamedId$612;
                }
                if (rest$609[1].token.type === parser$258.Token.Punctuator && rest$609[1].token.value === '=') {
                    rhs$610 = get_expression$444(rest$609.slice(2), context$605);
                    if (rhs$610.result == null) {
                        throwSyntaxError$265('enforest', 'Unexpected token', rhs$610.rest[0]);
                    }
                    if (rhs$610.rest[0].token.type === parser$258.Token.Punctuator && rhs$610.rest[0].token.value === ',') {
                        decls$608.push(VariableDeclaration$428.create(rest$609[0], rest$609[1], rhs$610.result, rhs$610.rest[0]));
                        rest$609 = rhs$610.rest.slice(1);
                        continue;
                    } else {
                        decls$608.push(VariableDeclaration$428.create(rest$609[0], rest$609[1], rhs$610.result, null));
                        rest$609 = rhs$610.rest;
                        break;
                    }
                } else if (rest$609[1].token.type === parser$258.Token.Punctuator && rest$609[1].token.value === ',') {
                    decls$608.push(VariableDeclaration$428.create(rest$609[0], null, null, rest$609[1]));
                    rest$609 = rest$609.slice(2);
                } else {
                    decls$608.push(VariableDeclaration$428.create(rest$609[0], null, null, null));
                    rest$609 = rest$609.slice(1);
                    break;
                }
            } else {
                throwSyntaxError$265('enforest', 'Unexpected token', rest$609[0]);
            }
        }
        return {
            result: decls$608,
            rest: rest$609
        };
    }
    function adjustLineContext$441(stx$614, original$615, current$616) {
        current$616 = current$616 || {
            lastLineNumber: original$615.token.lineNumber,
            lineNumber: original$615.token.lineNumber - 1
        };
        return _$257.map(stx$614, function (stx$617) {
            if (stx$617.token.type === parser$258.Token.Delimiter) {
                // handle tokens with missing line info
                stx$617.token.startLineNumber = typeof stx$617.token.startLineNumber == 'undefined' ? original$615.token.lineNumber : stx$617.token.startLineNumber;
                stx$617.token.endLineNumber = typeof stx$617.token.endLineNumber == 'undefined' ? original$615.token.lineNumber : stx$617.token.endLineNumber;
                stx$617.token.startLineStart = typeof stx$617.token.startLineStart == 'undefined' ? original$615.token.lineStart : stx$617.token.startLineStart;
                stx$617.token.endLineStart = typeof stx$617.token.endLineStart == 'undefined' ? original$615.token.lineStart : stx$617.token.endLineStart;
                stx$617.token.startRange = typeof stx$617.token.startRange == 'undefined' ? original$615.token.range : stx$617.token.startRange;
                stx$617.token.endRange = typeof stx$617.token.endRange == 'undefined' ? original$615.token.range : stx$617.token.endRange;
                stx$617.token.sm_startLineNumber = typeof stx$617.token.sm_startLineNumber == 'undefined' ? stx$617.token.startLineNumber : stx$617.token.sm_startLineNumber;
                stx$617.token.sm_endLineNumber = typeof stx$617.token.sm_endLineNumber == 'undefined' ? stx$617.token.endLineNumber : stx$617.token.sm_endLineNumber;
                stx$617.token.sm_startLineStart = typeof stx$617.token.sm_startLineStart == 'undefined' ? stx$617.token.startLineStart : stx$617.token.sm_startLineStart;
                stx$617.token.sm_endLineStart = typeof stx$617.token.sm_endLineStart == 'undefined' ? stx$617.token.endLineStart : stx$617.token.sm_endLineStart;
                stx$617.token.sm_startRange = typeof stx$617.token.sm_startRange == 'undefined' ? stx$617.token.startRange : stx$617.token.sm_startRange;
                stx$617.token.sm_endRange = typeof stx$617.token.sm_endRange == 'undefined' ? stx$617.token.endRange : stx$617.token.sm_endRange;
                if (stx$617.token.startLineNumber === current$616.lastLineNumber && current$616.lastLineNumber !== current$616.lineNumber) {
                    stx$617.token.startLineNumber = current$616.lineNumber;
                } else if (stx$617.token.startLineNumber !== current$616.lastLineNumber) {
                    current$616.lineNumber++;
                    current$616.lastLineNumber = stx$617.token.startLineNumber;
                    stx$617.token.startLineNumber = current$616.lineNumber;
                }
                if (stx$617.token.inner.length > 0) {
                    stx$617.token.inner = adjustLineContext$441(stx$617.token.inner, original$615, current$616);
                }
                return stx$617;
            }
            // handle tokens with missing line info
            stx$617.token.lineNumber = typeof stx$617.token.lineNumber == 'undefined' ? original$615.token.lineNumber : stx$617.token.lineNumber;
            stx$617.token.lineStart = typeof stx$617.token.lineStart == 'undefined' ? original$615.token.lineStart : stx$617.token.lineStart;
            stx$617.token.range = typeof stx$617.token.range == 'undefined' ? original$615.token.range : stx$617.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$617.token.sm_lineNumber = typeof stx$617.token.sm_lineNumber == 'undefined' ? stx$617.token.lineNumber : stx$617.token.sm_lineNumber;
            stx$617.token.sm_lineStart = typeof stx$617.token.sm_lineStart == 'undefined' ? stx$617.token.lineStart : stx$617.token.sm_lineStart;
            stx$617.token.sm_range = typeof stx$617.token.sm_range == 'undefined' ? _$257.clone(stx$617.token.range) : stx$617.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$617.token.lineNumber === current$616.lastLineNumber && current$616.lastLineNumber !== current$616.lineNumber) {
                stx$617.token.lineNumber = current$616.lineNumber;
            } else if (stx$617.token.lineNumber !== current$616.lastLineNumber) {
                current$616.lineNumber++;
                current$616.lastLineNumber = stx$617.token.lineNumber;
                stx$617.token.lineNumber = current$616.lineNumber;
            }
            return stx$617;
        });
    }
    function tokenValuesArePrefix$442(first$618, second$619) {
        // short circuit 
        if (second$619.length < first$618.length) {
            return false;
        }
        for (var i$620 = 0; i$620 < first$618.length; i$620++) {
            if (unwrapSyntax$266(first$618[i$620]) !== unwrapSyntax$266(second$619[i$620])) {
                return false;
            }
        }
        return true;
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$443(toks$621, context$622, prevStx$623, prevTerms$624) {
        assert$264(toks$621.length > 0, 'enforest assumes there are tokens to work with');
        prevStx$623 = prevStx$623 || [];
        prevTerms$624 = prevTerms$624 || [];
        function step$625(head$626, rest$627) {
            var innerTokens$628;
            assert$264(Array.isArray(rest$627), 'result must at least be an empty array');
            if (head$626.hasPrototype(TermTree$399)) {
                // function call
                var emp$631 = head$626.emp;
                var emp$631 = head$626.emp;
                var keyword$634 = head$626.keyword;
                var delim$636 = head$626.delim;
                var id$638 = head$626.id;
                var delim$636 = head$626.delim;
                var emp$631 = head$626.emp;
                var punc$642 = head$626.punc;
                var keyword$634 = head$626.keyword;
                var emp$631 = head$626.emp;
                var emp$631 = head$626.emp;
                var emp$631 = head$626.emp;
                var delim$636 = head$626.delim;
                var delim$636 = head$626.delim;
                var id$638 = head$626.id;
                var keyword$634 = head$626.keyword;
                var keyword$634 = head$626.keyword;
                var keyword$634 = head$626.keyword;
                var keyword$634 = head$626.keyword;
                if (head$626.hasPrototype(Expr$402) && rest$627[0] && rest$627[0].token.type === parser$258.Token.Delimiter && rest$627[0].token.value === '()') {
                    var argRes$675, enforestedArgs$676 = [], commas$677 = [];
                    rest$627[0].expose();
                    innerTokens$628 = rest$627[0].token.inner;
                    while (innerTokens$628.length > 0) {
                        argRes$675 = enforest$443(innerTokens$628, context$622);
                        enforestedArgs$676.push(argRes$675.result);
                        innerTokens$628 = argRes$675.rest;
                        if (innerTokens$628[0] && innerTokens$628[0].token.value === ',') {
                            // record the comma for later
                            commas$677.push(innerTokens$628[0]);
                            // but dump it for the next loop turn
                            innerTokens$628 = innerTokens$628.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$678 = _$257.all(enforestedArgs$676, function (argTerm$679) {
                            return argTerm$679.hasPrototype(Expr$402);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$628.length === 0 && argsAreExprs$678) {
                        return step$625(Call$425.create(head$626, enforestedArgs$676, rest$627[0], commas$677), rest$627.slice(1));
                    }
                } else if (head$626.hasPrototype(Expr$402) && rest$627[0] && unwrapSyntax$266(rest$627[0]) === '?') {
                    var question$680 = rest$627[0];
                    var condRes$681 = enforest$443(rest$627.slice(1), context$622);
                    var truExpr$682 = condRes$681.result;
                    var condRight$683 = condRes$681.rest;
                    if (truExpr$682.hasPrototype(Expr$402) && condRight$683[0] && unwrapSyntax$266(condRight$683[0]) === ':') {
                        var colon$684 = condRight$683[0];
                        var flsRes$685 = enforest$443(condRight$683.slice(1), context$622);
                        var flsExpr$686 = flsRes$685.result;
                        if (flsExpr$686.hasPrototype(Expr$402)) {
                            return step$625(ConditionalExpression$413.create(head$626, question$680, truExpr$682, colon$684, flsExpr$686), flsRes$685.rest);
                        }
                    }
                } else if (head$626.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$634) === 'new' && rest$627[0]) {
                    var newCallRes$687 = enforest$443(rest$627, context$622);
                    if (newCallRes$687.result.hasPrototype(Call$425)) {
                        return step$625(Const$424.create(head$626, newCallRes$687.result), newCallRes$687.rest);
                    }
                } else if (head$626.hasPrototype(Delimiter$416) && delim$636.token.value === '()' && rest$627[0] && rest$627[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$627[0]) === '=>') {
                    var arrowRes$688 = enforest$443(rest$627.slice(1), context$622);
                    if (arrowRes$688.result.hasPrototype(Expr$402)) {
                        return step$625(ArrowFun$420.create(delim$636, rest$627[0], arrowRes$688.result.destruct()), arrowRes$688.rest);
                    } else {
                        throwSyntaxError$265('enforest', 'Body of arrow function must be an expression', rest$627.slice(1));
                    }
                } else if (head$626.hasPrototype(Id$417) && rest$627[0] && rest$627[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$627[0]) === '=>') {
                    var res$689 = enforest$443(rest$627.slice(1), context$622);
                    if (res$689.result.hasPrototype(Expr$402)) {
                        return step$625(ArrowFun$420.create(id$638, rest$627[0], res$689.result.destruct()), res$689.rest);
                    } else {
                        throwSyntaxError$265('enforest', 'Body of arrow function must be an expression', rest$627.slice(1));
                    }
                } else if (head$626.hasPrototype(Delimiter$416) && delim$636.token.value === '()') {
                    innerTokens$628 = delim$636.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$628.length === 0) {
                        return step$625(ParenExpression$409.create(head$626), rest$627);
                    } else {
                        var innerTerm$690 = get_expression$444(innerTokens$628, context$622);
                        if (innerTerm$690.result && innerTerm$690.result.hasPrototype(Expr$402)) {
                            return step$625(ParenExpression$409.create(head$626), rest$627);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$626.hasPrototype(Expr$402) && rest$627[0] && rest$627[1] && stxIsBinOp$439(rest$627[0])) {
                    // Check if the operator is a macro first.
                    if (context$622.env.has(resolve$390(rest$627[0]))) {
                        var headStx$698 = tagWithTerm$445(head$626, head$626.destruct().reverse());
                        prevStx$623 = headStx$698.concat(prevStx$623);
                        prevTerms$624 = [head$626].concat(prevTerms$624);
                        return step$625(rest$627[0], rest$627.slice(1));
                    }
                    var op$691 = rest$627[0];
                    var left$692 = head$626;
                    var rightStx$693 = rest$627.slice(1);
                    var bopPrevStx$694 = [rest$627[0]].concat(head$626.destruct().reverse(), prevStx$623);
                    var bopPrevTerms$695 = [
                            Punc$415.create(rest$627[0]),
                            head$626
                        ].concat(prevTerms$624);
                    var bopRes$696 = enforest$443(rightStx$693, context$622, bopPrevStx$694, bopPrevTerms$695);
                    // Lookbehind was matched, so it may not even be a binop anymore.
                    if (bopRes$696.prevTerms.length < bopPrevTerms$695.length) {
                        return bopRes$696;
                    }
                    var right$697 = bopRes$696.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$697.hasPrototype(Expr$402)) {
                        return step$625(BinOp$412.create(op$691, left$692, right$697), bopRes$696.rest);
                    }
                } else if (head$626.hasPrototype(Punc$415) && stxIsUnaryOp$438(punc$642)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$626.punc.term = head$626;
                    var unopPrevStx$699 = [punc$642].concat(prevStx$623);
                    var unopPrevTerms$700 = [head$626].concat(prevTerms$624);
                    var unopRes$701 = enforest$443(rest$627, context$622, unopPrevStx$699, unopPrevTerms$700);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopRes$701.prevTerms.length < unopPrevTerms$700.length) {
                        return unopRes$701;
                    }
                    if (unopRes$701.result.hasPrototype(Expr$402)) {
                        return step$625(UnaryOp$410.create(punc$642, unopRes$701.result), unopRes$701.rest);
                    }
                } else if (head$626.hasPrototype(Keyword$414) && stxIsUnaryOp$438(keyword$634)) {
                    // Reference the term on the syntax object for lookbehind.
                    head$626.keyword.term = head$626;
                    var unopKeyPrevStx$702 = [keyword$634].concat(prevStx$623);
                    var unopKeyPrevTerms$703 = [head$626].concat(prevTerms$624);
                    var unopKeyres$704 = enforest$443(rest$627, context$622, unopKeyPrevStx$702, unopKeyPrevTerms$703);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopKeyres$704.prevTerms.length < unopKeyPrevTerms$703.length) {
                        return unopKeyres$704;
                    }
                    if (unopKeyres$704.result.hasPrototype(Expr$402)) {
                        return step$625(UnaryOp$410.create(keyword$634, unopKeyres$704.result), unopKeyres$704.rest);
                    }
                } else if (head$626.hasPrototype(Expr$402) && rest$627[0] && (unwrapSyntax$266(rest$627[0]) === '++' || unwrapSyntax$266(rest$627[0]) === '--')) {
                    // Check if the operator is a macro first.
                    if (context$622.env.has(resolve$390(rest$627[0]))) {
                        var headStx$698 = tagWithTerm$445(head$626, head$626.destruct().reverse());
                        prevStx$623 = headStx$698.concat(prevStx$623);
                        prevTerms$624 = [head$626].concat(prevTerms$624);
                        return step$625(rest$627[0], rest$627.slice(1));
                    }
                    return step$625(PostfixOp$411.create(head$626, rest$627[0]), rest$627.slice(1));
                } else if (head$626.hasPrototype(Expr$402) && rest$627[0] && rest$627[0].token.value === '[]') {
                    return step$625(ObjGet$427.create(head$626, Delimiter$416.create(rest$627[0].expose())), rest$627.slice(1));
                } else if (head$626.hasPrototype(Expr$402) && rest$627[0] && unwrapSyntax$266(rest$627[0]) === '.' && !context$622.env.has(resolve$390(rest$627[0])) && rest$627[1] && rest$627[1].token.type === parser$258.Token.Identifier) {
                    // Check if the identifier is a macro first.
                    if (context$622.env.has(resolve$390(rest$627[1]))) {
                        var headStx$698 = tagWithTerm$445(head$626, head$626.destruct().reverse());
                        var dotTerm$705 = Punc$415.create(rest$627[0]);
                        var dotTerms$706 = [dotTerm$705].concat(head$626, prevTerms$624);
                        var dotStx$707 = tagWithTerm$445(dotTerm$705, [rest$627[0]]).concat(headStx$698, prevStx$623);
                        var dotRes$708 = enforest$443(rest$627.slice(1), context$622, dotStx$707, dotTerms$706);
                        if (dotRes$708.prevTerms.length < dotTerms$706.length) {
                            return dotRes$708;
                        } else {
                            return step$625(head$626, [rest$627[0]].concat(dotRes$708.result.destruct(), dotRes$708.rest), prevStx$623, prevTerms$624);
                        }
                    }
                    return step$625(ObjDotGet$426.create(head$626, rest$627[0], rest$627[1]), rest$627.slice(2));
                } else if (head$626.hasPrototype(Delimiter$416) && delim$636.token.value === '[]') {
                    return step$625(ArrayLiteral$408.create(head$626), rest$627);
                } else if (head$626.hasPrototype(Delimiter$416) && head$626.delim.token.value === '{}') {
                    return step$625(Block$407.create(head$626), rest$627);
                } else if (head$626.hasPrototype(Id$417) && unwrapSyntax$266(id$638) === '#quoteSyntax' && rest$627[0] && rest$627[0].token.value === '{}') {
                    var tempId$709 = fresh$396();
                    context$622.templateMap.set(tempId$709, rest$627[0].token.inner);
                    return step$625(syn$259.makeIdent('getTemplate', id$638), [syn$259.makeDelim('()', [syn$259.makeValue(tempId$709, id$638)], id$638)].concat(rest$627.slice(1)));
                } else if (head$626.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$634) === 'let') {
                    var nameTokens$710 = [];
                    for (var i$711 = 0; i$711 < rest$627.length; i$711++) {
                        if (rest$627[i$711].token.type === parser$258.Token.Punctuator && rest$627[i$711].token.value === '=') {
                            break;
                        } else if (rest$627[i$711].token.type === parser$258.Token.Keyword || rest$627[i$711].token.type === parser$258.Token.Punctuator || rest$627[i$711].token.type === parser$258.Token.Identifier) {
                            nameTokens$710.push(rest$627[i$711]);
                        } else {
                            throwSyntaxError$265('enforest', 'Macro name must be a legal identifier or punctuator', rest$627[i$711]);
                        }
                    }
                    // Let macro
                    if (rest$627[i$711 + 1] && rest$627[i$711 + 1].token.value === 'macro') {
                        var mac$712 = enforest$443(rest$627.slice(i$711 + 1), context$622);
                        if (!mac$712.result.hasPrototype(AnonMacro$423)) {
                            throwSyntaxError$265('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$627.slice(i$711 + 1));
                        }
                        return step$625(LetMacro$421.create(nameTokens$710, mac$712.result.body), mac$712.rest);
                    }    // Let statement
                    else {
                        var lsRes$713 = enforestVarStatement$440(rest$627, context$622, keyword$634);
                        if (lsRes$713) {
                            return step$625(LetStatement$430.create(head$626, lsRes$713.result), lsRes$713.rest);
                        }
                    }
                } else if (head$626.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$634) === 'var' && rest$627[0]) {
                    var vsRes$714 = enforestVarStatement$440(rest$627, context$622, keyword$634);
                    if (vsRes$714) {
                        return step$625(VariableStatement$429.create(head$626, vsRes$714.result), vsRes$714.rest);
                    }
                } else if (head$626.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$634) === 'const' && rest$627[0]) {
                    var csRes$715 = enforestVarStatement$440(rest$627, context$622, keyword$634);
                    if (csRes$715) {
                        return step$625(ConstStatement$431.create(head$626, csRes$715.result), csRes$715.rest);
                    }
                } else if (head$626.hasPrototype(Keyword$414) && unwrapSyntax$266(keyword$634) === 'for' && rest$627[0] && rest$627[0].token.value === '()') {
                    return step$625(ForStatement$436.create(keyword$634, rest$627[0]), rest$627.slice(1));
                }
            } else {
                assert$264(head$626 && head$626.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$626.token.type === parser$258.Token.Identifier || head$626.token.type === parser$258.Token.Keyword || head$626.token.type === parser$258.Token.Punctuator) && expandCount$385 < maxExpands$386 && context$622.env.has(resolve$390(head$626)) && tokenValuesArePrefix$442(context$622.env.get(resolve$390(head$626)).fullName, [head$626].concat(rest$627))) {
                    // pull the macro transformer out the environment
                    var macroObj$716 = context$622.env.get(resolve$390(head$626));
                    var transformer$717 = macroObj$716.fn;
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$718 = fresh$396();
                    var transformerContext$719 = makeExpanderContext$453(_$257.defaults({ mark: newMark$718 }, context$622));
                    if (!builtinMode$384 && !macroObj$716.builtin) {
                        expandCount$385++;
                    }
                    // apply the transformer
                    var rt$720;
                    try {
                        rt$720 = transformer$717([head$626].concat(rest$627.slice(macroObj$716.fullName.length - 1)), transformerContext$719, prevStx$623, prevTerms$624);
                    } catch (e$721) {
                        if (e$721.type && e$721.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$722 = '`' + rest$627.slice(0, 5).map(function (stx$723) {
                                    return stx$723.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$265('macro', 'Macro `' + head$626.token.value + '` could not be matched with ' + argumentString$722, head$626);
                        } else {
                            // just rethrow it
                            throw e$721;
                        }
                    }
                    if (rt$720.prevTerms) {
                        prevTerms$624 = rt$720.prevTerms;
                    }
                    if (rt$720.prevStx) {
                        prevStx$623 = rt$720.prevStx;
                    }
                    if (!Array.isArray(rt$720.result)) {
                        throwSyntaxError$265('enforest', 'Macro must return a syntax array', head$626);
                    }
                    if (rt$720.result.length > 0) {
                        var adjustedResult$724 = adjustLineContext$441(rt$720.result, head$626);
                        adjustedResult$724[0].token.leadingComments = head$626.token.leadingComments;
                        return step$625(adjustedResult$724[0], adjustedResult$724.slice(1).concat(rt$720.rest));
                    } else {
                        return step$625(Empty$434.create(), rt$720.rest);
                    }
                }    // anon macro definition
                else if (head$626.token.type === parser$258.Token.Identifier && head$626.token.value === 'macro' && rest$627[0] && rest$627[0].token.value === '{}') {
                    return step$625(AnonMacro$423.create(rest$627[0].expose().token.inner), rest$627.slice(1));
                }    // macro definition
                else if (head$626.token.type === parser$258.Token.Identifier && head$626.token.value === 'macro') {
                    var nameTokens$710 = [];
                    for (var i$711 = 0; i$711 < rest$627.length; i$711++) {
                        // done with the name once we find the delimiter
                        if (rest$627[i$711].token.type === parser$258.Token.Delimiter) {
                            break;
                        } else if (rest$627[i$711].token.type === parser$258.Token.Identifier || rest$627[i$711].token.type === parser$258.Token.Keyword || rest$627[i$711].token.type === parser$258.Token.Punctuator) {
                            nameTokens$710.push(rest$627[i$711]);
                        } else {
                            throwSyntaxError$265('enforest', 'Macro name must be a legal identifier or punctuator', rest$627[i$711]);
                        }
                    }
                    if (rest$627[i$711] && rest$627[i$711].token.type === parser$258.Token.Delimiter) {
                        return step$625(Macro$422.create(nameTokens$710, rest$627[i$711].expose().token.inner), rest$627.slice(i$711 + 1));
                    } else {
                        throwSyntaxError$265('enforest', 'Macro declaration must include body', rest$627[i$711]);
                    }
                }    // module definition
                else if (unwrapSyntax$266(head$626) === 'module' && rest$627[0] && rest$627[0].token.value === '{}') {
                    return step$625(Module$433.create(rest$627[0]), rest$627.slice(1));
                }    // function definition
                else if (head$626.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$626) === 'function' && rest$627[0] && rest$627[0].token.type === parser$258.Token.Identifier && rest$627[1] && rest$627[1].token.type === parser$258.Token.Delimiter && rest$627[1].token.value === '()' && rest$627[2] && rest$627[2].token.type === parser$258.Token.Delimiter && rest$627[2].token.value === '{}') {
                    rest$627[1].token.inner = rest$627[1].expose().token.inner;
                    rest$627[2].token.inner = rest$627[2].expose().token.inner;
                    return step$625(NamedFun$418.create(head$626, null, rest$627[0], rest$627[1], rest$627[2]), rest$627.slice(3));
                }    // generator function definition
                else if (head$626.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$626) === 'function' && rest$627[0] && rest$627[0].token.type === parser$258.Token.Punctuator && rest$627[0].token.value === '*' && rest$627[1] && rest$627[1].token.type === parser$258.Token.Identifier && rest$627[2] && rest$627[2].token.type === parser$258.Token.Delimiter && rest$627[2].token.value === '()' && rest$627[3] && rest$627[3].token.type === parser$258.Token.Delimiter && rest$627[3].token.value === '{}') {
                    rest$627[2].token.inner = rest$627[2].expose().token.inner;
                    rest$627[3].token.inner = rest$627[3].expose().token.inner;
                    return step$625(NamedFun$418.create(head$626, rest$627[0], rest$627[1], rest$627[2], rest$627[3]), rest$627.slice(4));
                }    // anonymous function definition
                else if (head$626.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$626) === 'function' && rest$627[0] && rest$627[0].token.type === parser$258.Token.Delimiter && rest$627[0].token.value === '()' && rest$627[1] && rest$627[1].token.type === parser$258.Token.Delimiter && rest$627[1].token.value === '{}') {
                    rest$627[0].token.inner = rest$627[0].expose().token.inner;
                    rest$627[1].token.inner = rest$627[1].expose().token.inner;
                    return step$625(AnonFun$419.create(head$626, null, rest$627[0], rest$627[1]), rest$627.slice(2));
                }    // anonymous generator function definition
                else if (head$626.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$626) === 'function' && rest$627[0] && rest$627[0].token.type === parser$258.Token.Punctuator && rest$627[0].token.value === '*' && rest$627[1] && rest$627[1].token.type === parser$258.Token.Delimiter && rest$627[1].token.value === '()' && rest$627[2] && rest$627[2].token.type === parser$258.Token.Delimiter && rest$627[2].token.value === '{}') {
                    rest$627[1].token.inner = rest$627[1].expose().token.inner;
                    rest$627[2].token.inner = rest$627[2].expose().token.inner;
                    return step$625(AnonFun$419.create(head$626, rest$627[0], rest$627[1], rest$627[2]), rest$627.slice(3));
                }    // arrow function
                else if ((head$626.token.type === parser$258.Token.Delimiter && head$626.token.value === '()' || head$626.token.type === parser$258.Token.Identifier) && rest$627[0] && rest$627[0].token.type === parser$258.Token.Punctuator && resolve$390(rest$627[0]) === '=>' && rest$627[1] && rest$627[1].token.type === parser$258.Token.Delimiter && rest$627[1].token.value === '{}') {
                    return step$625(ArrowFun$420.create(head$626, rest$627[0], rest$627[1]), rest$627.slice(2));
                }    // catch statement
                else if (head$626.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$626) === 'catch' && rest$627[0] && rest$627[0].token.type === parser$258.Token.Delimiter && rest$627[0].token.value === '()' && rest$627[1] && rest$627[1].token.type === parser$258.Token.Delimiter && rest$627[1].token.value === '{}') {
                    rest$627[0].token.inner = rest$627[0].expose().token.inner;
                    rest$627[1].token.inner = rest$627[1].expose().token.inner;
                    return step$625(CatchClause$432.create(head$626, rest$627[0], rest$627[1]), rest$627.slice(2));
                }    // this expression
                else if (head$626.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$626) === 'this') {
                    return step$625(ThisExpression$404.create(head$626), rest$627);
                }    // literal
                else if (head$626.token.type === parser$258.Token.NumericLiteral || head$626.token.type === parser$258.Token.StringLiteral || head$626.token.type === parser$258.Token.BooleanLiteral || head$626.token.type === parser$258.Token.RegularExpression || head$626.token.type === parser$258.Token.NullLiteral) {
                    return step$625(Lit$405.create(head$626), rest$627);
                }    // export
                else if (head$626.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$626) === 'export' && rest$627[0] && (rest$627[0].token.type === parser$258.Token.Identifier || rest$627[0].token.type === parser$258.Token.Keyword || rest$627[0].token.type === parser$258.Token.Punctuator)) {
                    return step$625(Export$435.create(rest$627[0]), rest$627.slice(1));
                }    // identifier
                else if (head$626.token.type === parser$258.Token.Identifier) {
                    return step$625(Id$417.create(head$626), rest$627);
                }    // punctuator
                else if (head$626.token.type === parser$258.Token.Punctuator) {
                    return step$625(Punc$415.create(head$626), rest$627);
                } else if (head$626.token.type === parser$258.Token.Keyword && unwrapSyntax$266(head$626) === 'with') {
                    throwSyntaxError$265('enforest', 'with is not supported in sweet.js', head$626);
                }    // keyword
                else if (head$626.token.type === parser$258.Token.Keyword) {
                    return step$625(Keyword$414.create(head$626), rest$627);
                }    // Delimiter
                else if (head$626.token.type === parser$258.Token.Delimiter) {
                    return step$625(Delimiter$416.create(head$626.expose()), rest$627);
                } else if (head$626.token.type === parser$258.Token.Template) {
                    return step$625(Template$437.create(head$626), rest$627);
                }    // end of file
                else if (head$626.token.type === parser$258.Token.EOF) {
                    assert$264(rest$627.length === 0, 'nothing should be after an EOF');
                    return step$625(EOF$400.create(head$626), []);
                } else {
                    // todo: are we missing cases?
                    assert$264(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$626,
                rest: rest$627,
                prevStx: prevStx$623,
                prevTerms: prevTerms$624
            };
        }
        return step$625(toks$621[0], toks$621.slice(1));
    }
    function get_expression$444(stx$725, context$726) {
        var res$727 = enforest$443(stx$725, context$726);
        var next$728 = res$727;
        var peek$729;
        var prevStx$730;
        if (!next$728.result.hasPrototype(Expr$402)) {
            return {
                result: null,
                rest: stx$725
            };
        }
        while (next$728.rest.length) {
            // Enforest the next term tree since it might be an infix macro that
            // consumes the initial expression.
            peek$729 = enforest$443(next$728.rest, context$726, next$728.result.destruct(), [next$728.result]);
            // If it has prev terms it wasn't infix, but it we need to run it
            // through enforest together with the initial expression to see if
            // it extends it into a longer expression.
            if (peek$729.prevTerms.length === 1) {
                peek$729 = enforest$443([next$728.result].concat(peek$729.result.destruct(), peek$729.rest), context$726);
            }
            // No new expression was created, so we've reached the end.
            if (peek$729.result === next$728.result) {
                break;
            }
            // A new expression was created, so loop back around and keep going.
            next$728 = peek$729;
        }
        return next$728;
    }
    function tagWithTerm$445(term$731, stx$732) {
        _$257.forEach(stx$732, function (s$733) {
            s$733.term = term$731;
        });
        return stx$732;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$446(newMark$734, env$735) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$736(match$737) {
            if (match$737.level === 0) {
                // replace the match property with the marked syntax
                match$737.match = _$257.map(match$737.match, function (stx$738) {
                    return stx$738.mark(newMark$734);
                });
            } else {
                _$257.each(match$737.match, function (match$739) {
                    dfs$736(match$739);
                });
            }
        }
        _$257.keys(env$735).forEach(function (key$740) {
            dfs$736(env$735[key$740]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$447(mac$741, context$742) {
        var body$743 = mac$741.body;
        // raw function primitive form
        if (!(body$743[0] && body$743[0].token.type === parser$258.Token.Keyword && body$743[0].token.value === 'function')) {
            throwSyntaxError$265('load macro', 'Primitive macro form must contain a function for the macro body', body$743);
        }
        var stub$744 = parser$258.read('()');
        stub$744[0].token.inner = body$743;
        var expanded$745 = expand$452(stub$744, context$742);
        expanded$745 = expanded$745[0].destruct().concat(expanded$745[1].eof);
        var flattend$746 = flatten$457(expanded$745);
        var bodyCode$747 = codegen$263.generate(parser$258.parse(flattend$746));
        var macroFn$748 = scopedEval$378(bodyCode$747, {
                makeValue: syn$259.makeValue,
                makeRegex: syn$259.makeRegex,
                makeIdent: syn$259.makeIdent,
                makeKeyword: syn$259.makeKeyword,
                makePunc: syn$259.makePunc,
                makeDelim: syn$259.makeDelim,
                getExpr: function (stx$749) {
                    var r$750;
                    if (stx$749.length === 0) {
                        return {
                            success: false,
                            result: [],
                            rest: []
                        };
                    }
                    r$750 = get_expression$444(stx$749, context$742);
                    return {
                        success: r$750.result !== null,
                        result: r$750.result === null ? [] : r$750.result.destruct(),
                        rest: r$750.rest
                    };
                },
                getIdent: function (stx$751) {
                    if (stx$751[0] && stx$751[0].token.type === parser$258.Token.Identifier) {
                        return {
                            success: true,
                            result: [stx$751[0]],
                            rest: stx$751.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$751
                    };
                },
                getLit: function (stx$752) {
                    if (stx$752[0] && patternModule$261.typeIsLiteral(stx$752[0].token.type)) {
                        return {
                            success: true,
                            result: [stx$752[0]],
                            rest: stx$752.slice(1)
                        };
                    }
                    return {
                        success: false,
                        result: [],
                        rest: stx$752
                    };
                },
                unwrapSyntax: syn$259.unwrapSyntax,
                throwSyntaxError: throwSyntaxError$265,
                prettyPrint: syn$259.prettyPrint,
                parser: parser$258,
                __fresh: fresh$396,
                _: _$257,
                patternModule: patternModule$261,
                getTemplate: function (id$753) {
                    return cloneSyntaxArray$448(context$742.templateMap.get(id$753));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$446,
                mergeMatches: function (newMatch$754, oldMatch$755) {
                    newMatch$754.patternEnv = _$257.extend({}, oldMatch$755.patternEnv, newMatch$754.patternEnv);
                    return newMatch$754;
                }
            });
        return macroFn$748;
    }
    function cloneSyntaxArray$448(arr$756) {
        return arr$756.map(function (stx$757) {
            var o$758 = syntaxFromToken$382(_$257.clone(stx$757.token), stx$757);
            if (o$758.token.type === parser$258.Token.Delimiter) {
                o$758.token.inner = cloneSyntaxArray$448(o$758.token.inner);
            }
            return o$758;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$449(stx$759, context$760, prevStx$761, prevTerms$762) {
        assert$264(context$760, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$759.length === 0) {
            return {
                terms: prevTerms$762 ? prevTerms$762.reverse() : [],
                context: context$760
            };
        }
        assert$264(stx$759[0].token, 'expecting a syntax object');
        var f$763 = enforest$443(stx$759, context$760, prevStx$761, prevTerms$762);
        // head :: TermTree
        var head$764 = f$763.result;
        // rest :: [Syntax]
        var rest$765 = f$763.rest;
        var macroDefinition$766;
        if (head$764.hasPrototype(Macro$422) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$766 = loadMacroDef$447(head$764, context$760);
            addToDefinitionCtx$450([head$764.name[0]], context$760.defscope, false);
            context$760.env.set(resolve$390(head$764.name[0]), {
                fn: macroDefinition$766,
                builtin: builtinMode$384,
                fullName: head$764.name
            });
            return expandToTermTree$449(rest$765, context$760, prevStx$761, prevTerms$762);
        }
        if (head$764.hasPrototype(LetMacro$421) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$766 = loadMacroDef$447(head$764, context$760);
            var freshName$770 = fresh$396();
            var name$771 = head$764.name[0];
            var renamedName$772 = name$771.rename(name$771, freshName$770);
            rest$765 = _$257.map(rest$765, function (stx$773) {
                return stx$773.rename(name$771, freshName$770);
            });
            head$764.name[0] = renamedName$772;
            context$760.env.set(resolve$390(renamedName$772), {
                fn: macroDefinition$766,
                builtin: builtinMode$384,
                fullName: head$764.name
            });
            return expandToTermTree$449(rest$765, context$760, prevStx$761, prevTerms$762);
        }
        // We build the newPrevTerms/Stx here (instead of at the beginning) so
        // that macro definitions don't get added to it.
        var destructed$767 = tagWithTerm$445(head$764, f$763.result.destruct());
        var newPrevTerms$768 = [head$764].concat(f$763.prevTerms);
        var newPrevStx$769 = destructed$767.reverse().concat(f$763.prevStx);
        if (head$764.hasPrototype(NamedFun$418)) {
            addToDefinitionCtx$450([head$764.name], context$760.defscope, true);
        }
        if (head$764.hasPrototype(VariableStatement$429)) {
            addToDefinitionCtx$450(_$257.map(head$764.decls, function (decl$774) {
                return decl$774.ident;
            }), context$760.defscope, true);
        }
        if (head$764.hasPrototype(Block$407) && head$764.body.hasPrototype(Delimiter$416)) {
            head$764.body.delim.token.inner.forEach(function (term$775) {
                if (term$775.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$450(_$257.map(term$775.decls, function (decl$776) {
                        return decl$776.ident;
                    }), context$760.defscope, true);
                }
            });
        }
        if (head$764.hasPrototype(Delimiter$416)) {
            head$764.delim.token.inner.forEach(function (term$777) {
                if (term$777.hasPrototype(VariableStatement$429)) {
                    addToDefinitionCtx$450(_$257.map(term$777.decls, function (decl$778) {
                        return decl$778.ident;
                    }), context$760.defscope, true);
                }
            });
        }
        if (head$764.hasPrototype(ForStatement$436)) {
            head$764.cond.expose();
            var forCond$779 = head$764.cond.token.inner;
            if (forCond$779[0] && resolve$390(forCond$779[0]) === 'let' && forCond$779[1] && forCond$779[1].token.type === parser$258.Token.Identifier) {
                var letNew$780 = fresh$396();
                var letId$781 = forCond$779[1];
                forCond$779 = forCond$779.map(function (stx$782) {
                    return stx$782.rename(letId$781, letNew$780);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$764.cond.token.inner = expand$452([forCond$779[0]], context$760).concat(expand$452(forCond$779.slice(1), context$760));
                // nice and easy case: `for (...) { ... }`
                if (rest$765[0] && rest$765[0].token.value === '{}') {
                    rest$765[0] = rest$765[0].rename(letId$781, letNew$780);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$783 = enforest$443(rest$765, context$760);
                    var bodyDestructed$784 = bodyEnf$783.result.destruct();
                    var renamedBodyTerm$785 = bodyEnf$783.result.rename(letId$781, letNew$780);
                    tagWithTerm$445(renamedBodyTerm$785, bodyDestructed$784);
                    return expandToTermTree$449(bodyEnf$783.rest, context$760, bodyDestructed$784.reverse().concat(newPrevStx$769), [renamedBodyTerm$785].concat(newPrevTerms$768));
                }
            } else {
                head$764.cond.token.inner = expand$452(head$764.cond.token.inner, context$760);
            }
        }
        return expandToTermTree$449(rest$765, context$760, newPrevStx$769, newPrevTerms$768);
    }
    function addToDefinitionCtx$450(idents$786, defscope$787, skipRep$788) {
        assert$264(idents$786 && idents$786.length > 0, 'expecting some variable identifiers');
        skipRep$788 = skipRep$788 || false;
        _$257.each(idents$786, function (id$789) {
            var skip$790 = false;
            if (skipRep$788) {
                var declRepeat$791 = _$257.find(defscope$787, function (def$792) {
                        return def$792.id.token.value === id$789.token.value && arraysEqual$391(marksof$389(def$792.id.context), marksof$389(id$789.context));
                    });
                skip$790 = typeof declRepeat$791 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$790) {
                var name$793 = fresh$396();
                defscope$787.push({
                    id: id$789,
                    name: name$793
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$451(term$794, context$795) {
        assert$264(context$795 && context$795.env, 'environment map is required');
        if (term$794.hasPrototype(ArrayLiteral$408)) {
            term$794.array.delim.token.inner = expand$452(term$794.array.delim.expose().token.inner, context$795);
            return term$794;
        } else if (term$794.hasPrototype(Block$407)) {
            term$794.body.delim.token.inner = expand$452(term$794.body.delim.expose().token.inner, context$795);
            return term$794;
        } else if (term$794.hasPrototype(ParenExpression$409)) {
            term$794.expr.delim.token.inner = expand$452(term$794.expr.delim.expose().token.inner, context$795);
            return term$794;
        } else if (term$794.hasPrototype(Call$425)) {
            term$794.fun = expandTermTreeToFinal$451(term$794.fun, context$795);
            term$794.args = _$257.map(term$794.args, function (arg$796) {
                return expandTermTreeToFinal$451(arg$796, context$795);
            });
            return term$794;
        } else if (term$794.hasPrototype(UnaryOp$410)) {
            term$794.expr = expandTermTreeToFinal$451(term$794.expr, context$795);
            return term$794;
        } else if (term$794.hasPrototype(BinOp$412)) {
            term$794.left = expandTermTreeToFinal$451(term$794.left, context$795);
            term$794.right = expandTermTreeToFinal$451(term$794.right, context$795);
            return term$794;
        } else if (term$794.hasPrototype(ObjGet$427)) {
            term$794.right.delim.token.inner = expand$452(term$794.right.delim.expose().token.inner, context$795);
            return term$794;
        } else if (term$794.hasPrototype(ObjDotGet$426)) {
            term$794.left = expandTermTreeToFinal$451(term$794.left, context$795);
            term$794.right = expandTermTreeToFinal$451(term$794.right, context$795);
            return term$794;
        } else if (term$794.hasPrototype(VariableDeclaration$428)) {
            if (term$794.init) {
                term$794.init = expandTermTreeToFinal$451(term$794.init, context$795);
            }
            return term$794;
        } else if (term$794.hasPrototype(VariableStatement$429)) {
            term$794.decls = _$257.map(term$794.decls, function (decl$797) {
                return expandTermTreeToFinal$451(decl$797, context$795);
            });
            return term$794;
        } else if (term$794.hasPrototype(Delimiter$416)) {
            // expand inside the delimiter and then continue on
            term$794.delim.token.inner = expand$452(term$794.delim.expose().token.inner, context$795);
            return term$794;
        } else if (term$794.hasPrototype(NamedFun$418) || term$794.hasPrototype(AnonFun$419) || term$794.hasPrototype(CatchClause$432) || term$794.hasPrototype(ArrowFun$420) || term$794.hasPrototype(Module$433)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$798 = [];
            var bodyContext$799 = makeExpanderContext$453(_$257.defaults({ defscope: newDef$798 }, context$795));
            var paramSingleIdent$800 = term$794.params && term$794.params.token.type === parser$258.Token.Identifier;
            var params$801;
            if (term$794.params && term$794.params.token.type === parser$258.Token.Delimiter) {
                params$801 = term$794.params.expose();
            } else if (paramSingleIdent$800) {
                params$801 = term$794.params;
            } else {
                params$801 = syn$259.makeDelim('()', [], null);
            }
            var bodies$802;
            if (Array.isArray(term$794.body)) {
                bodies$802 = syn$259.makeDelim('{}', term$794.body, null);
            } else {
                bodies$802 = term$794.body;
            }
            bodies$802 = bodies$802.addDefCtx(newDef$798);
            var paramNames$803 = _$257.map(getParamIdentifiers$398(params$801), function (param$810) {
                    var freshName$811 = fresh$396();
                    return {
                        freshName: freshName$811,
                        originalParam: param$810,
                        renamedParam: param$810.rename(param$810, freshName$811)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$804 = _$257.reduce(paramNames$803, function (accBody$812, p$813) {
                    return accBody$812.rename(p$813.originalParam, p$813.freshName);
                }, bodies$802);
            renamedBody$804 = renamedBody$804.expose();
            var expandedResult$805 = expandToTermTree$449(renamedBody$804.token.inner, bodyContext$799);
            var bodyTerms$806 = expandedResult$805.terms;
            var renamedParams$807 = _$257.map(paramNames$803, function (p$814) {
                    return p$814.renamedParam;
                });
            var flatArgs$808;
            if (paramSingleIdent$800) {
                flatArgs$808 = renamedParams$807[0];
            } else {
                flatArgs$808 = syn$259.makeDelim('()', joinSyntax$383(renamedParams$807, ','), term$794.params || null);
            }
            var expandedArgs$809 = expand$452([flatArgs$808], bodyContext$799);
            assert$264(expandedArgs$809.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$794.params) {
                term$794.params = expandedArgs$809[0];
            }
            bodyTerms$806 = _$257.map(bodyTerms$806, function (bodyTerm$815) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$816 = bodyTerm$815.addDefCtx(newDef$798);
                // finish expansion
                return expandTermTreeToFinal$451(termWithCtx$816, expandedResult$805.context);
            });
            if (term$794.hasPrototype(Module$433)) {
                bodyTerms$806 = _$257.filter(bodyTerms$806, function (bodyTerm$817) {
                    if (bodyTerm$817.hasPrototype(Export$435)) {
                        term$794.exports.push(bodyTerm$817);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$804.token.inner = bodyTerms$806;
            if (Array.isArray(term$794.body)) {
                term$794.body = renamedBody$804.token.inner;
            } else {
                term$794.body = renamedBody$804;
            }
            // and continue expand the rest
            return term$794;
        }
        // the term is fine as is
        return term$794;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$452(stx$818, context$819) {
        assert$264(context$819, 'must provide an expander context');
        var trees$820 = expandToTermTree$449(stx$818, context$819);
        return _$257.map(trees$820.terms, function (term$821) {
            return expandTermTreeToFinal$451(term$821, trees$820.context);
        });
    }
    function makeExpanderContext$453(o$822) {
        o$822 = o$822 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$822.env || new StringMap$377(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$822.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$822.templateMap || new StringMap$377(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$822.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$454(stx$823, moduleContexts$824, _maxExpands$825) {
        moduleContexts$824 = moduleContexts$824 || [];
        maxExpands$386 = _maxExpands$825 || Infinity;
        expandCount$385 = 0;
        var context$826 = makeExpanderContext$453();
        var modBody$827 = syn$259.makeDelim('{}', stx$823, null);
        modBody$827 = _$257.reduce(moduleContexts$824, function (acc$829, mod$830) {
            context$826.env.extend(mod$830.env);
            return loadModuleExports$456(acc$829, context$826.env, mod$830.exports, mod$830.env);
        }, modBody$827);
        var res$828 = expand$452([
                syn$259.makeIdent('module', null),
                modBody$827
            ], context$826);
        res$828 = res$828[0].destruct();
        return flatten$457(res$828[0].token.inner);
    }
    function expandModule$455(stx$831, moduleContexts$832) {
        moduleContexts$832 = moduleContexts$832 || [];
        maxExpands$386 = Infinity;
        expandCount$385 = 0;
        var context$833 = makeExpanderContext$453();
        var modBody$834 = syn$259.makeDelim('{}', stx$831, null);
        modBody$834 = _$257.reduce(moduleContexts$832, function (acc$836, mod$837) {
            context$833.env.extend(mod$837.env);
            return loadModuleExports$456(acc$836, context$833.env, mod$837.exports, mod$837.env);
        }, modBody$834);
        builtinMode$384 = true;
        var moduleRes$835 = expand$452([
                syn$259.makeIdent('module', null),
                modBody$834
            ], context$833);
        builtinMode$384 = false;
        context$833.exports = _$257.map(moduleRes$835[0].exports, function (term$838) {
            return {
                oldExport: term$838.name,
                newParam: syn$259.makeIdent(term$838.name.token.value, null)
            };
        });
        return context$833;
    }
    function loadModuleExports$456(stx$839, newEnv$840, exports$841, oldEnv$842) {
        return _$257.reduce(exports$841, function (acc$843, param$844) {
            var newName$845 = fresh$396();
            newEnv$840.set(resolve$390(param$844.newParam.rename(param$844.newParam, newName$845)), oldEnv$842.get(resolve$390(param$844.oldExport)));
            return acc$843.rename(param$844.newParam, newName$845);
        }, stx$839);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$457(stx$846) {
        return _$257.reduce(stx$846, function (acc$847, stx$848) {
            if (stx$848.token.type === parser$258.Token.Delimiter) {
                var exposed$849 = stx$848.expose();
                var openParen$850 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$848.token.value[0],
                        range: stx$848.token.startRange,
                        sm_range: typeof stx$848.token.sm_startRange == 'undefined' ? stx$848.token.startRange : stx$848.token.sm_startRange,
                        lineNumber: stx$848.token.startLineNumber,
                        sm_lineNumber: typeof stx$848.token.sm_startLineNumber == 'undefined' ? stx$848.token.startLineNumber : stx$848.token.sm_startLineNumber,
                        lineStart: stx$848.token.startLineStart,
                        sm_lineStart: typeof stx$848.token.sm_startLineStart == 'undefined' ? stx$848.token.startLineStart : stx$848.token.sm_startLineStart
                    }, exposed$849);
                var closeParen$851 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$848.token.value[1],
                        range: stx$848.token.endRange,
                        sm_range: typeof stx$848.token.sm_endRange == 'undefined' ? stx$848.token.endRange : stx$848.token.sm_endRange,
                        lineNumber: stx$848.token.endLineNumber,
                        sm_lineNumber: typeof stx$848.token.sm_endLineNumber == 'undefined' ? stx$848.token.endLineNumber : stx$848.token.sm_endLineNumber,
                        lineStart: stx$848.token.endLineStart,
                        sm_lineStart: typeof stx$848.token.sm_endLineStart == 'undefined' ? stx$848.token.endLineStart : stx$848.token.sm_endLineStart
                    }, exposed$849);
                if (stx$848.token.leadingComments) {
                    openParen$850.token.leadingComments = stx$848.token.leadingComments;
                }
                if (stx$848.token.trailingComments) {
                    openParen$850.token.trailingComments = stx$848.token.trailingComments;
                }
                acc$847.push(openParen$850);
                push$387.apply(acc$847, flatten$457(exposed$849.token.inner));
                acc$847.push(closeParen$851);
                return acc$847;
            }
            stx$848.token.sm_lineNumber = stx$848.token.sm_lineNumber ? stx$848.token.sm_lineNumber : stx$848.token.lineNumber;
            stx$848.token.sm_lineStart = stx$848.token.sm_lineStart ? stx$848.token.sm_lineStart : stx$848.token.lineStart;
            stx$848.token.sm_range = stx$848.token.sm_range ? stx$848.token.sm_range : stx$848.token.range;
            acc$847.push(stx$848);
            return acc$847;
        }, []);
    }
    exports$256.StringMap = StringMap$377;
    exports$256.enforest = enforest$443;
    exports$256.expand = expandTopLevel$454;
    exports$256.expandModule = expandModule$455;
    exports$256.resolve = resolve$390;
    exports$256.get_expression = get_expression$444;
    exports$256.makeExpanderContext = makeExpanderContext$453;
    exports$256.Expr = Expr$402;
    exports$256.VariableStatement = VariableStatement$429;
    exports$256.tokensToSyntax = syn$259.tokensToSyntax;
    exports$256.syntaxToTokens = syn$259.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map