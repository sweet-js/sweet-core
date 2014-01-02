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
    function remdup$387(mark$459, mlist$460) {
        if (mark$459 === _$257.first(mlist$460)) {
            return _$257.rest(mlist$460, 1);
        }
        return [mark$459].concat(mlist$460);
    }
    // (CSyntax) -> [...Num]
    function marksof$388(ctx$461, stopName$462, originalName$463) {
        var mark$464, submarks$465;
        if (ctx$461 instanceof Mark$380) {
            mark$464 = ctx$461.mark;
            submarks$465 = marksof$388(ctx$461.context, stopName$462, originalName$463);
            return remdup$387(mark$464, submarks$465);
        }
        if (ctx$461 instanceof Def$381) {
            return marksof$388(ctx$461.context, stopName$462, originalName$463);
        }
        if (ctx$461 instanceof Rename$379) {
            if (stopName$462 === originalName$463 + '$' + ctx$461.name) {
                return [];
            }
            return marksof$388(ctx$461.context, stopName$462, originalName$463);
        }
        return [];
    }
    function resolve$389(stx$466) {
        return resolveCtx$393(stx$466.token.value, stx$466.context, [], []);
    }
    function arraysEqual$390(a$467, b$468) {
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
    function renames$391(defctx$470, oldctx$471, originalName$472) {
        var acc$473 = oldctx$471;
        for (var i$474 = 0; i$474 < defctx$470.length; i$474++) {
            if (defctx$470[i$474].id.token.value === originalName$472) {
                acc$473 = new Rename$379(defctx$470[i$474].id, defctx$470[i$474].name, acc$473, defctx$470);
            }
        }
        return acc$473;
    }
    function unionEl$392(arr$475, el$476) {
        if (arr$475.indexOf(el$476) === -1) {
            var res$477 = arr$475.slice(0);
            res$477.push(el$476);
            return res$477;
        }
        return arr$475;
    }
    // (Syntax) -> String
    function resolveCtx$393(originalName$478, ctx$479, stop_spine$480, stop_branch$481) {
        if (ctx$479 instanceof Mark$380) {
            return resolveCtx$393(originalName$478, ctx$479.context, stop_spine$480, stop_branch$481);
        }
        if (ctx$479 instanceof Def$381) {
            if (stop_spine$480.indexOf(ctx$479.defctx) !== -1) {
                return resolveCtx$393(originalName$478, ctx$479.context, stop_spine$480, stop_branch$481);
            } else {
                return resolveCtx$393(originalName$478, renames$391(ctx$479.defctx, ctx$479.context, originalName$478), stop_spine$480, unionEl$392(stop_branch$481, ctx$479.defctx));
            }
        }
        if (ctx$479 instanceof Rename$379) {
            if (originalName$478 === ctx$479.id.token.value) {
                var idName$482 = resolveCtx$393(ctx$479.id.token.value, ctx$479.id.context, stop_branch$481, stop_branch$481);
                var subName$483 = resolveCtx$393(originalName$478, ctx$479.context, unionEl$392(stop_spine$480, ctx$479.def), stop_branch$481);
                if (idName$482 === subName$483) {
                    var idMarks$484 = marksof$388(ctx$479.id.context, originalName$478 + '$' + ctx$479.name, originalName$478);
                    var subMarks$485 = marksof$388(ctx$479.context, originalName$478 + '$' + ctx$479.name, originalName$478);
                    if (arraysEqual$390(idMarks$484, subMarks$485)) {
                        return originalName$478 + '$' + ctx$479.name;
                    }
                }
            }
            return resolveCtx$393(originalName$478, ctx$479.context, stop_spine$480, stop_branch$481);
        }
        return originalName$478;
    }
    var nextFresh$394 = 0;
    // fun () -> Num
    function fresh$395() {
        return nextFresh$394++;
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$396(towrap$486, delimSyntax$487) {
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
    function getParamIdentifiers$397(argSyntax$488) {
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
    var TermTree$398 = {
            destruct: function () {
                return _$257.reduce(this.properties, _$257.bind(function (acc$490, prop$491) {
                    if (this[prop$491] && this[prop$491].hasPrototype(TermTree$398)) {
                        return acc$490.concat(this[prop$491].destruct());
                    } else if (this[prop$491] && this[prop$491].token && this[prop$491].token.inner) {
                        this[prop$491].token.inner = _$257.reduce(this[prop$491].token.inner, function (acc$492, t$493) {
                            if (t$493.hasPrototype(TermTree$398)) {
                                return acc$492.concat(t$493.destruct());
                            }
                            return acc$492.concat(t$493);
                        }, []);
                        return acc$490.concat(this[prop$491]);
                    } else if (Array.isArray(this[prop$491])) {
                        return acc$490.concat(_$257.reduce(this[prop$491], function (acc$494, t$495) {
                            if (t$495.hasPrototype(TermTree$398)) {
                                return acc$494.concat(t$495.destruct());
                            }
                            return acc$494.concat(t$495);
                        }, []));
                    } else if (this[prop$491]) {
                        return acc$490.concat(this[prop$491]);
                    } else {
                        return acc$490;
                    }
                }, this), []);
            },
            addDefCtx: function (def$496) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$497) {
                    var prop$498 = this.properties[i$497];
                    if (Array.isArray(this[prop$498])) {
                        this[prop$498] = _$257.map(this[prop$498], function (item$499) {
                            return item$499.addDefCtx(def$496);
                        });
                    } else if (this[prop$498]) {
                        this[prop$498] = this[prop$498].addDefCtx(def$496);
                    }
                }, this));
                return this;
            },
            rename: function (id$500, name$501) {
                _$257.each(_$257.range(this.properties.length), _$257.bind(function (i$502) {
                    var prop$503 = this.properties[i$502];
                    if (Array.isArray(this[prop$503])) {
                        this[prop$503] = _$257.map(this[prop$503], function (item$504) {
                            return item$504.rename(id$500, name$501);
                        });
                    } else if (this[prop$503]) {
                        this[prop$503] = this[prop$503].rename(id$500, name$501);
                    }
                }, this));
                return this;
            }
        };
    var EOF$399 = TermTree$398.extend({
            properties: ['eof'],
            construct: function (e$505) {
                this.eof = e$505;
            }
        });
    var Statement$400 = TermTree$398.extend({
            construct: function () {
            }
        });
    var Expr$401 = Statement$400.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$402 = Expr$401.extend({
            construct: function () {
            }
        });
    var ThisExpression$403 = PrimaryExpression$402.extend({
            properties: ['this'],
            construct: function (that$506) {
                this.this = that$506;
            }
        });
    var Lit$404 = PrimaryExpression$402.extend({
            properties: ['lit'],
            construct: function (l$507) {
                this.lit = l$507;
            }
        });
    exports$256._test.PropertyAssignment = PropertyAssignment$405;
    var PropertyAssignment$405 = TermTree$398.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$508, assignment$509) {
                this.propName = propName$508;
                this.assignment = assignment$509;
            }
        });
    var Block$406 = PrimaryExpression$402.extend({
            properties: ['body'],
            construct: function (body$510) {
                this.body = body$510;
            }
        });
    var ArrayLiteral$407 = PrimaryExpression$402.extend({
            properties: ['array'],
            construct: function (ar$511) {
                this.array = ar$511;
            }
        });
    var ParenExpression$408 = PrimaryExpression$402.extend({
            properties: ['expr'],
            construct: function (expr$512) {
                this.expr = expr$512;
            }
        });
    var UnaryOp$409 = Expr$401.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$513, expr$514) {
                this.op = op$513;
                this.expr = expr$514;
            }
        });
    var PostfixOp$410 = Expr$401.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$515, op$516) {
                this.expr = expr$515;
                this.op = op$516;
            }
        });
    var BinOp$411 = Expr$401.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$517, left$518, right$519) {
                this.op = op$517;
                this.left = left$518;
                this.right = right$519;
            }
        });
    var ConditionalExpression$412 = Expr$401.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$520, question$521, tru$522, colon$523, fls$524) {
                this.cond = cond$520;
                this.question = question$521;
                this.tru = tru$522;
                this.colon = colon$523;
                this.fls = fls$524;
            }
        });
    var Keyword$413 = TermTree$398.extend({
            properties: ['keyword'],
            construct: function (k$525) {
                this.keyword = k$525;
            }
        });
    var Punc$414 = TermTree$398.extend({
            properties: ['punc'],
            construct: function (p$526) {
                this.punc = p$526;
            }
        });
    var Delimiter$415 = TermTree$398.extend({
            properties: ['delim'],
            construct: function (d$527) {
                this.delim = d$527;
            }
        });
    var Id$416 = PrimaryExpression$402.extend({
            properties: ['id'],
            construct: function (id$528) {
                this.id = id$528;
            }
        });
    var NamedFun$417 = Expr$401.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$529, star$530, name$531, params$532, body$533) {
                this.keyword = keyword$529;
                this.star = star$530;
                this.name = name$531;
                this.params = params$532;
                this.body = body$533;
            }
        });
    var AnonFun$418 = Expr$401.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$534, star$535, params$536, body$537) {
                this.keyword = keyword$534;
                this.star = star$535;
                this.params = params$536;
                this.body = body$537;
            }
        });
    var ArrowFun$419 = Expr$401.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$538, arrow$539, body$540) {
                this.params = params$538;
                this.arrow = arrow$539;
                this.body = body$540;
            }
        });
    var LetMacro$420 = TermTree$398.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$541, body$542) {
                this.name = name$541;
                this.body = body$542;
            }
        });
    var Macro$421 = TermTree$398.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$543, body$544) {
                this.name = name$543;
                this.body = body$544;
            }
        });
    var AnonMacro$422 = TermTree$398.extend({
            properties: ['body'],
            construct: function (body$545) {
                this.body = body$545;
            }
        });
    var Const$423 = Expr$401.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$546, call$547) {
                this.newterm = newterm$546;
                this.call = call$547;
            }
        });
    var Call$424 = Expr$401.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                assert$265(this.fun.hasPrototype(TermTree$398), 'expecting a term tree in destruct of call');
                var that$548 = this;
                this.delim = syntaxFromToken$382(_$257.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$257.reduce(this.args, function (acc$549, term$550) {
                    assert$265(term$550 && term$550.hasPrototype(TermTree$398), 'expecting term trees in destruct of Call');
                    var dst$551 = acc$549.concat(term$550.destruct());
                    // add all commas except for the last one
                    if (that$548.commas.length > 0) {
                        dst$551 = dst$551.concat(that$548.commas.shift());
                    }
                    return dst$551;
                }, []);
                return this.fun.destruct().concat(Delimiter$415.create(this.delim).destruct());
            },
            construct: function (funn$552, args$553, delim$554, commas$555) {
                assert$265(Array.isArray(args$553), 'requires an array of arguments terms');
                this.fun = funn$552;
                this.args = args$553;
                this.delim = delim$554;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$555;
            }
        });
    var ObjDotGet$425 = Expr$401.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$556, dot$557, right$558) {
                this.left = left$556;
                this.dot = dot$557;
                this.right = right$558;
            }
        });
    var ObjGet$426 = Expr$401.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$559, right$560) {
                this.left = left$559;
                this.right = right$560;
            }
        });
    var VariableDeclaration$427 = TermTree$398.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$561, eqstx$562, init$563, comma$564) {
                this.ident = ident$561;
                this.eqstx = eqstx$562;
                this.init = init$563;
                this.comma = comma$564;
            }
        });
    var VariableStatement$428 = Statement$400.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$257.reduce(this.decls, function (acc$565, decl$566) {
                    return acc$565.concat(decl$566.destruct());
                }, []));
            },
            construct: function (varkw$567, decls$568) {
                assert$265(Array.isArray(decls$568), 'decls must be an array');
                this.varkw = varkw$567;
                this.decls = decls$568;
            }
        });
    var LetStatement$429 = Statement$400.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$257.reduce(this.decls, function (acc$569, decl$570) {
                    return acc$569.concat(decl$570.destruct());
                }, []));
            },
            construct: function (letkw$571, decls$572) {
                assert$265(Array.isArray(decls$572), 'decls must be an array');
                this.letkw = letkw$571;
                this.decls = decls$572;
            }
        });
    var ConstStatement$430 = Statement$400.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$257.reduce(this.decls, function (acc$573, decl$574) {
                    return acc$573.concat(decl$574.destruct());
                }, []));
            },
            construct: function (constkw$575, decls$576) {
                assert$265(Array.isArray(decls$576), 'decls must be an array');
                this.constkw = constkw$575;
                this.decls = decls$576;
            }
        });
    var CatchClause$431 = Statement$400.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$577, params$578, body$579) {
                this.catchkw = catchkw$577;
                this.params = params$578;
                this.body = body$579;
            }
        });
    var Module$432 = TermTree$398.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$580) {
                this.body = body$580;
                this.exports = [];
            }
        });
    var Empty$433 = Statement$400.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$434 = TermTree$398.extend({
            properties: ['name'],
            construct: function (name$581) {
                this.name = name$581;
            }
        });
    var ForStatement$435 = Statement$400.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$582, cond$583) {
                this.forkw = forkw$582;
                this.cond = cond$583;
            }
        });
    function stxIsUnaryOp$436(stx$584) {
        var staticOperators$585 = [
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
        return _$257.contains(staticOperators$585, unwrapSyntax$267(stx$584));
    }
    function stxIsBinOp$437(stx$586) {
        var staticOperators$587 = [
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
        return _$257.contains(staticOperators$587, unwrapSyntax$267(stx$586));
    }
    function enforestVarStatement$438(stx$588, context$589, varStx$590) {
        var isLet$591 = /^(?:let|const)$/.test(varStx$590.token.value);
        var decls$592 = [];
        var rest$593 = stx$588;
        var rhs$594;
        if (!rest$593.length) {
            throwSyntaxError$266('enforest', 'Unexpected end of input', varStx$590);
        }
        while (rest$593.length) {
            if (rest$593[0].token.type === parser$258.Token.Identifier) {
                if (isLet$591) {
                    var freshName$595 = fresh$395();
                    var renamedId$596 = rest$593[0].rename(rest$593[0], freshName$595);
                    rest$593 = rest$593.map(function (stx$597) {
                        return stx$597.rename(rest$593[0], freshName$595);
                    });
                    rest$593[0] = renamedId$596;
                }
                if (rest$593[1].token.type === parser$258.Token.Punctuator && rest$593[1].token.value === '=') {
                    rhs$594 = get_expression$442(rest$593.slice(2), context$589);
                    if (rhs$594.result == null) {
                        throwSyntaxError$266('enforest', 'Unexpected token', rhs$594.rest[0]);
                    }
                    if (rhs$594.rest[0].token.type === parser$258.Token.Punctuator && rhs$594.rest[0].token.value === ',') {
                        decls$592.push(VariableDeclaration$427.create(rest$593[0], rest$593[1], rhs$594.result, rhs$594.rest[0]));
                        rest$593 = rhs$594.rest.slice(1);
                        continue;
                    } else {
                        decls$592.push(VariableDeclaration$427.create(rest$593[0], rest$593[1], rhs$594.result, null));
                        rest$593 = rhs$594.rest;
                        break;
                    }
                } else if (rest$593[1].token.type === parser$258.Token.Punctuator && rest$593[1].token.value === ',') {
                    decls$592.push(VariableDeclaration$427.create(rest$593[0], null, null, rest$593[1]));
                    rest$593 = rest$593.slice(2);
                } else {
                    decls$592.push(VariableDeclaration$427.create(rest$593[0], null, null, null));
                    rest$593 = rest$593.slice(1);
                    break;
                }
            } else {
                throwSyntaxError$266('enforest', 'Unexpected token', rest$593[0]);
            }
        }
        return {
            result: decls$592,
            destructed: rest$593.length ? stx$588.slice(0, 0 - rest$593.length) : stx$588,
            rest: rest$593
        };
    }
    function adjustLineContext$439(stx$598, original$599, current$600) {
        current$600 = current$600 || {
            lastLineNumber: original$599.token.lineNumber,
            lineNumber: original$599.token.lineNumber - 1
        };
        return _$257.map(stx$598, function (stx$601) {
            if (stx$601.token.type === parser$258.Token.Delimiter) {
                // handle tokens with missing line info
                stx$601.token.startLineNumber = typeof stx$601.token.startLineNumber == 'undefined' ? original$599.token.lineNumber : stx$601.token.startLineNumber;
                stx$601.token.endLineNumber = typeof stx$601.token.endLineNumber == 'undefined' ? original$599.token.lineNumber : stx$601.token.endLineNumber;
                stx$601.token.startLineStart = typeof stx$601.token.startLineStart == 'undefined' ? original$599.token.lineStart : stx$601.token.startLineStart;
                stx$601.token.endLineStart = typeof stx$601.token.endLineStart == 'undefined' ? original$599.token.lineStart : stx$601.token.endLineStart;
                stx$601.token.startRange = typeof stx$601.token.startRange == 'undefined' ? original$599.token.range : stx$601.token.startRange;
                stx$601.token.endRange = typeof stx$601.token.endRange == 'undefined' ? original$599.token.range : stx$601.token.endRange;
                stx$601.token.sm_startLineNumber = typeof stx$601.token.sm_startLineNumber == 'undefined' ? stx$601.token.startLineNumber : stx$601.token.sm_startLineNumber;
                stx$601.token.sm_endLineNumber = typeof stx$601.token.sm_endLineNumber == 'undefined' ? stx$601.token.endLineNumber : stx$601.token.sm_endLineNumber;
                stx$601.token.sm_startLineStart = typeof stx$601.token.sm_startLineStart == 'undefined' ? stx$601.token.startLineStart : stx$601.token.sm_startLineStart;
                stx$601.token.sm_endLineStart = typeof stx$601.token.sm_endLineStart == 'undefined' ? stx$601.token.endLineStart : stx$601.token.sm_endLineStart;
                stx$601.token.sm_startRange = typeof stx$601.token.sm_startRange == 'undefined' ? stx$601.token.startRange : stx$601.token.sm_startRange;
                stx$601.token.sm_endRange = typeof stx$601.token.sm_endRange == 'undefined' ? stx$601.token.endRange : stx$601.token.sm_endRange;
                if (stx$601.token.startLineNumber === current$600.lastLineNumber && current$600.lastLineNumber !== current$600.lineNumber) {
                    stx$601.token.startLineNumber = current$600.lineNumber;
                } else if (stx$601.token.startLineNumber !== current$600.lastLineNumber) {
                    current$600.lineNumber++;
                    current$600.lastLineNumber = stx$601.token.startLineNumber;
                    stx$601.token.startLineNumber = current$600.lineNumber;
                }
                if (stx$601.token.inner.length > 0) {
                    stx$601.token.inner = adjustLineContext$439(stx$601.token.inner, original$599, current$600);
                }
                return stx$601;
            }
            // handle tokens with missing line info
            stx$601.token.lineNumber = typeof stx$601.token.lineNumber == 'undefined' ? original$599.token.lineNumber : stx$601.token.lineNumber;
            stx$601.token.lineStart = typeof stx$601.token.lineStart == 'undefined' ? original$599.token.lineStart : stx$601.token.lineStart;
            stx$601.token.range = typeof stx$601.token.range == 'undefined' ? original$599.token.range : stx$601.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$601.token.sm_lineNumber = typeof stx$601.token.sm_lineNumber == 'undefined' ? stx$601.token.lineNumber : stx$601.token.sm_lineNumber;
            stx$601.token.sm_lineStart = typeof stx$601.token.sm_lineStart == 'undefined' ? stx$601.token.lineStart : stx$601.token.sm_lineStart;
            stx$601.token.sm_range = typeof stx$601.token.sm_range == 'undefined' ? _$257.clone(stx$601.token.range) : stx$601.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$601.token.lineNumber === current$600.lastLineNumber && current$600.lastLineNumber !== current$600.lineNumber) {
                stx$601.token.lineNumber = current$600.lineNumber;
            } else if (stx$601.token.lineNumber !== current$600.lastLineNumber) {
                current$600.lineNumber++;
                current$600.lastLineNumber = stx$601.token.lineNumber;
                stx$601.token.lineNumber = current$600.lineNumber;
            }
            return stx$601;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$440(toks$602, context$603, prevStx$604, prevTerms$605) {
        assert$265(toks$602.length > 0, 'enforest assumes there are tokens to work with');
        prevStx$604 = prevStx$604 || [];
        prevTerms$605 = prevTerms$605 || [];
        function step$606(head$607, rest$608) {
            var innerTokens$609;
            assert$265(Array.isArray(rest$608), 'result must at least be an empty array');
            if (head$607.hasPrototype(TermTree$398)) {
                // function call
                var emp$612 = head$607.emp;
                var emp$612 = head$607.emp;
                var keyword$615 = head$607.keyword;
                var delim$617 = head$607.delim;
                var id$619 = head$607.id;
                var delim$617 = head$607.delim;
                var emp$612 = head$607.emp;
                var punc$623 = head$607.punc;
                var keyword$615 = head$607.keyword;
                var emp$612 = head$607.emp;
                var emp$612 = head$607.emp;
                var emp$612 = head$607.emp;
                var delim$617 = head$607.delim;
                var delim$617 = head$607.delim;
                var id$619 = head$607.id;
                var keyword$615 = head$607.keyword;
                var keyword$615 = head$607.keyword;
                var keyword$615 = head$607.keyword;
                var keyword$615 = head$607.keyword;
                var keyword$615 = head$607.keyword;
                if (head$607.hasPrototype(Expr$401) && rest$608[0] && rest$608[0].token.type === parser$258.Token.Delimiter && rest$608[0].token.value === '()') {
                    var argRes$658, enforestedArgs$659 = [], commas$660 = [];
                    rest$608[0].expose();
                    innerTokens$609 = rest$608[0].token.inner;
                    while (innerTokens$609.length > 0) {
                        argRes$658 = enforest$440(innerTokens$609, context$603);
                        enforestedArgs$659.push(argRes$658.result);
                        innerTokens$609 = argRes$658.rest;
                        if (innerTokens$609[0] && innerTokens$609[0].token.value === ',') {
                            // record the comma for later
                            commas$660.push(innerTokens$609[0]);
                            // but dump it for the next loop turn
                            innerTokens$609 = innerTokens$609.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$661 = _$257.all(enforestedArgs$659, function (argTerm$662) {
                            return argTerm$662.hasPrototype(Expr$401);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$609.length === 0 && argsAreExprs$661) {
                        return step$606(Call$424.create(head$607, enforestedArgs$659, rest$608[0], commas$660), rest$608.slice(1));
                    }
                } else if (head$607.hasPrototype(Expr$401) && rest$608[0] && unwrapSyntax$267(rest$608[0]) === '?') {
                    var question$663 = rest$608[0];
                    var condRes$664 = enforest$440(rest$608.slice(1), context$603);
                    var truExpr$665 = condRes$664.result;
                    var condRight$666 = condRes$664.rest;
                    if (truExpr$665.hasPrototype(Expr$401) && condRight$666[0] && unwrapSyntax$267(condRight$666[0]) === ':') {
                        var colon$667 = condRight$666[0];
                        var flsRes$668 = enforest$440(condRight$666.slice(1), context$603);
                        var flsExpr$669 = flsRes$668.result;
                        if (flsExpr$669.hasPrototype(Expr$401)) {
                            return step$606(ConditionalExpression$412.create(head$607, question$663, truExpr$665, colon$667, flsExpr$669), flsRes$668.rest);
                        }
                    }
                } else if (head$607.hasPrototype(Keyword$413) && unwrapSyntax$267(keyword$615) === 'new' && rest$608[0]) {
                    var newCallRes$670 = enforest$440(rest$608, context$603);
                    if (newCallRes$670.result.hasPrototype(Call$424)) {
                        return step$606(Const$423.create(head$607, newCallRes$670.result), newCallRes$670.rest);
                    }
                } else if (head$607.hasPrototype(Delimiter$415) && delim$617.token.value === '()' && rest$608[0] && rest$608[0].token.type === parser$258.Token.Punctuator && resolve$389(rest$608[0]) === '=>') {
                    var arrowRes$671 = enforest$440(rest$608.slice(1), context$603);
                    if (arrowRes$671.result.hasPrototype(Expr$401)) {
                        return step$606(ArrowFun$419.create(delim$617, rest$608[0], arrowRes$671.result.destruct()), arrowRes$671.rest);
                    } else {
                        throwSyntaxError$266('enforest', 'Body of arrow function must be an expression', rest$608.slice(1));
                    }
                } else if (head$607.hasPrototype(Id$416) && rest$608[0] && rest$608[0].token.type === parser$258.Token.Punctuator && resolve$389(rest$608[0]) === '=>') {
                    var res$672 = enforest$440(rest$608.slice(1), context$603);
                    if (res$672.result.hasPrototype(Expr$401)) {
                        return step$606(ArrowFun$419.create(id$619, rest$608[0], res$672.result.destruct()), res$672.rest);
                    } else {
                        throwSyntaxError$266('enforest', 'Body of arrow function must be an expression', rest$608.slice(1));
                    }
                } else if (head$607.hasPrototype(Delimiter$415) && delim$617.token.value === '()') {
                    innerTokens$609 = delim$617.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$609.length === 0) {
                        return step$606(ParenExpression$408.create(head$607), rest$608);
                    } else {
                        var innerTerm$673 = get_expression$442(innerTokens$609, context$603);
                        if (innerTerm$673.result && innerTerm$673.result.hasPrototype(Expr$401)) {
                            return step$606(ParenExpression$408.create(head$607), rest$608);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$607.hasPrototype(Expr$401) && rest$608[0] && rest$608[1] && stxIsBinOp$437(rest$608[0])) {
                    var op$674 = rest$608[0];
                    var left$675 = head$607;
                    var rightStx$676 = rest$608.slice(1);
                    var bopPrevStx$677 = getHeadStx$441(toks$602, rightStx$676).reverse().concat(prevStx$604);
                    var bopPrevTerms$678 = [
                            Punc$414.create(rest$608[0]),
                            head$607
                        ].concat(prevTerms$605);
                    var bopRes$679 = enforest$440(rightStx$676, context$603, bopPrevStx$677, bopPrevTerms$678);
                    // Lookbehind was matched, so it may not even be a binop anymore.
                    if (bopRes$679.prevTerms.length < bopPrevTerms$678.length) {
                        return bopRes$679;
                    }
                    var right$680 = bopRes$679.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$680.hasPrototype(Expr$401)) {
                        return step$606(BinOp$411.create(op$674, left$675, right$680), bopRes$679.rest);
                    }
                } else if (head$607.hasPrototype(Punc$414) && stxIsUnaryOp$436(punc$623)) {
                    var unopPrevStx$681 = [punc$623].concat(prevStx$604);
                    var unopPrevTerms$682 = [head$607].concat(prevTerms$605);
                    var unopRes$683 = enforest$440(rest$608, context$603, unopPrevStx$681, unopPrevTerms$682);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopRes$683.prevTerms.length < unopPrevTerms$682.length) {
                        return unopRes$683;
                    }
                    if (unopRes$683.result.hasPrototype(Expr$401)) {
                        return step$606(UnaryOp$409.create(punc$623, unopRes$683.result), unopRes$683.rest);
                    }
                } else if (head$607.hasPrototype(Keyword$413) && stxIsUnaryOp$436(keyword$615)) {
                    var unopKeyPrevStx$684 = [keyword$615].concat(prevStx$604);
                    var unopKeyPrevTerms$685 = [head$607].concat(prevTerms$605);
                    var unopKeyres$686 = enforest$440(rest$608, context$603, unopKeyPrevStx$684, unopKeyPrevTerms$685);
                    // Lookbehind was matched, so it may not even be a unop anymore
                    if (unopKeyres$686.prevTerms.length < unopKeyPrevTerms$685.length) {
                        return unopKeyres$686;
                    }
                    if (unopKeyres$686.result.hasPrototype(Expr$401)) {
                        return step$606(UnaryOp$409.create(keyword$615, unopKeyres$686.result), unopKeyres$686.rest);
                    }
                } else if (head$607.hasPrototype(Expr$401) && rest$608[0] && (unwrapSyntax$267(rest$608[0]) === '++' || unwrapSyntax$267(rest$608[0]) === '--')) {
                    return step$606(PostfixOp$410.create(head$607, rest$608[0]), rest$608.slice(1));
                } else if (head$607.hasPrototype(Expr$401) && rest$608[0] && rest$608[0].token.value === '[]') {
                    return step$606(ObjGet$426.create(head$607, Delimiter$415.create(rest$608[0].expose())), rest$608.slice(1));
                } else if (head$607.hasPrototype(Expr$401) && rest$608[0] && unwrapSyntax$267(rest$608[0]) === '.' && rest$608[1] && rest$608[1].token.type === parser$258.Token.Identifier) {
                    return step$606(ObjDotGet$425.create(head$607, rest$608[0], rest$608[1]), rest$608.slice(2));
                } else if (head$607.hasPrototype(Delimiter$415) && delim$617.token.value === '[]') {
                    return step$606(ArrayLiteral$407.create(head$607), rest$608);
                } else if (head$607.hasPrototype(Delimiter$415) && head$607.delim.token.value === '{}') {
                    return step$606(Block$406.create(head$607), rest$608);
                } else if (head$607.hasPrototype(Id$416) && unwrapSyntax$267(id$619) === '#quoteSyntax' && rest$608[0] && rest$608[0].token.value === '{}') {
                    var tempId$687 = fresh$395();
                    context$603.templateMap.set(tempId$687, rest$608[0].token.inner);
                    return step$606(syn$259.makeIdent('getTemplate', id$619), [syn$259.makeDelim('()', [syn$259.makeValue(tempId$687, id$619)], id$619)].concat(rest$608.slice(1)));
                } else if (head$607.hasPrototype(Keyword$413) && unwrapSyntax$267(keyword$615) === 'let' && (rest$608[0] && rest$608[0].token.type === parser$258.Token.Identifier || rest$608[0] && rest$608[0].token.type === parser$258.Token.Keyword || rest$608[0] && rest$608[0].token.type === parser$258.Token.Punctuator) && rest$608[1] && unwrapSyntax$267(rest$608[1]) === '=' && rest$608[2] && rest$608[2].token.value === 'macro') {
                    var mac$688 = enforest$440(rest$608.slice(2), context$603);
                    if (!mac$688.result.hasPrototype(AnonMacro$422)) {
                        throwSyntaxError$266('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$608.slice(2));
                    }
                    return step$606(LetMacro$420.create(rest$608[0], mac$688.result.body), mac$688.rest);
                } else if (head$607.hasPrototype(Keyword$413) && unwrapSyntax$267(keyword$615) === 'var' && rest$608[0]) {
                    var vsRes$689 = enforestVarStatement$438(rest$608, context$603, keyword$615);
                    if (vsRes$689) {
                        return step$606(VariableStatement$428.create(head$607, vsRes$689.result), vsRes$689.rest);
                    }
                } else if (head$607.hasPrototype(Keyword$413) && unwrapSyntax$267(keyword$615) === 'let' && rest$608[0]) {
                    var lsRes$690 = enforestVarStatement$438(rest$608, context$603, keyword$615);
                    if (lsRes$690) {
                        return step$606(LetStatement$429.create(head$607, lsRes$690.result), lsRes$690.rest);
                    }
                } else if (head$607.hasPrototype(Keyword$413) && unwrapSyntax$267(keyword$615) === 'const' && rest$608[0]) {
                    var csRes$691 = enforestVarStatement$438(rest$608, context$603, keyword$615);
                    if (csRes$691) {
                        return step$606(ConstStatement$430.create(head$607, csRes$691.result), csRes$691.rest);
                    }
                } else if (head$607.hasPrototype(Keyword$413) && unwrapSyntax$267(keyword$615) === 'for' && rest$608[0] && rest$608[0].token.value === '()') {
                    return step$606(ForStatement$435.create(keyword$615, rest$608[0]), rest$608.slice(1));
                }
            } else {
                assert$265(head$607 && head$607.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$607.token.type === parser$258.Token.Identifier || head$607.token.type === parser$258.Token.Keyword || head$607.token.type === parser$258.Token.Punctuator) && context$603.env.has(resolve$389(head$607))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$692 = fresh$395();
                    var transformerContext$693 = makeExpanderContext$450(_$257.defaults({ mark: newMark$692 }, context$603));
                    // pull the macro transformer out the environment
                    var macroObj$694 = context$603.env.get(resolve$389(head$607));
                    var transformer$695 = macroObj$694.fn;
                    if (expandCount$385 >= maxExpands$386) {
                        return {
                            result: head$607,
                            rest: rest$608
                        };
                    } else if (!builtinMode$384 && !macroObj$694.builtin) {
                        expandCount$385++;
                    }
                    // apply the transformer
                    var rt$696;
                    try {
                        rt$696 = transformer$695([head$607].concat(rest$608), transformerContext$693, prevStx$604, prevTerms$605);
                    } catch (e$697) {
                        if (e$697.type && e$697.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$698 = '`' + rest$608.slice(0, 5).map(function (stx$699) {
                                    return stx$699.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$266('macro', 'Macro `' + head$607.token.value + '` could not be matched with ' + argumentString$698, head$607);
                        } else {
                            // just rethrow it
                            throw e$697;
                        }
                    }
                    if (rt$696.prevTerms) {
                        prevTerms$605 = rt$696.prevTerms;
                    }
                    if (rt$696.prevStx) {
                        // Adjust toks if lookbehind was matched so we can calculate
                        // the correct destructed syntax.
                        if (rt$696.prevStx.length < prevStx$604.length) {
                            toks$602 = rt$696.result.concat(rt$696.rest);
                        }
                        prevStx$604 = rt$696.prevStx;
                    }
                    if (!Array.isArray(rt$696.result)) {
                        throwSyntaxError$266('enforest', 'Macro must return a syntax array', head$607);
                    }
                    if (rt$696.result.length > 0) {
                        var adjustedResult$700 = adjustLineContext$439(rt$696.result, head$607);
                        adjustedResult$700[0].token.leadingComments = head$607.token.leadingComments;
                        return step$606(adjustedResult$700[0], adjustedResult$700.slice(1).concat(rt$696.rest));
                    } else {
                        return step$606(Empty$433.create(), rt$696.rest);
                    }
                }    // anon macro definition
                else if (head$607.token.type === parser$258.Token.Identifier && head$607.token.value === 'macro' && rest$608[0] && rest$608[0].token.value === '{}') {
                    return step$606(AnonMacro$422.create(rest$608[0].expose().token.inner), rest$608.slice(1));
                }    // macro definition
                else if (head$607.token.type === parser$258.Token.Identifier && head$607.token.value === 'macro' && rest$608[0] && (rest$608[0].token.type === parser$258.Token.Identifier || rest$608[0].token.type === parser$258.Token.Keyword || rest$608[0].token.type === parser$258.Token.Punctuator) && rest$608[1] && rest$608[1].token.type === parser$258.Token.Delimiter && rest$608[1].token.value === '{}') {
                    return step$606(Macro$421.create(rest$608[0], rest$608[1].expose().token.inner), rest$608.slice(2));
                }    // module definition
                else if (unwrapSyntax$267(head$607) === 'module' && rest$608[0] && rest$608[0].token.value === '{}') {
                    return step$606(Module$432.create(rest$608[0]), rest$608.slice(1));
                }    // function definition
                else if (head$607.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$607) === 'function' && rest$608[0] && rest$608[0].token.type === parser$258.Token.Identifier && rest$608[1] && rest$608[1].token.type === parser$258.Token.Delimiter && rest$608[1].token.value === '()' && rest$608[2] && rest$608[2].token.type === parser$258.Token.Delimiter && rest$608[2].token.value === '{}') {
                    rest$608[1].token.inner = rest$608[1].expose().token.inner;
                    rest$608[2].token.inner = rest$608[2].expose().token.inner;
                    return step$606(NamedFun$417.create(head$607, null, rest$608[0], rest$608[1], rest$608[2]), rest$608.slice(3));
                }    // generator function definition
                else if (head$607.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$607) === 'function' && rest$608[0] && rest$608[0].token.type === parser$258.Token.Punctuator && rest$608[0].token.value === '*' && rest$608[1] && rest$608[1].token.type === parser$258.Token.Identifier && rest$608[2] && rest$608[2].token.type === parser$258.Token.Delimiter && rest$608[2].token.value === '()' && rest$608[3] && rest$608[3].token.type === parser$258.Token.Delimiter && rest$608[3].token.value === '{}') {
                    rest$608[2].token.inner = rest$608[2].expose().token.inner;
                    rest$608[3].token.inner = rest$608[3].expose().token.inner;
                    return step$606(NamedFun$417.create(head$607, rest$608[0], rest$608[1], rest$608[2], rest$608[3]), rest$608.slice(4));
                }    // anonymous function definition
                else if (head$607.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$607) === 'function' && rest$608[0] && rest$608[0].token.type === parser$258.Token.Delimiter && rest$608[0].token.value === '()' && rest$608[1] && rest$608[1].token.type === parser$258.Token.Delimiter && rest$608[1].token.value === '{}') {
                    rest$608[0].token.inner = rest$608[0].expose().token.inner;
                    rest$608[1].token.inner = rest$608[1].expose().token.inner;
                    return step$606(AnonFun$418.create(head$607, null, rest$608[0], rest$608[1]), rest$608.slice(2));
                }    // anonymous generator function definition
                else if (head$607.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$607) === 'function' && rest$608[0] && rest$608[0].token.type === parser$258.Token.Punctuator && rest$608[0].token.value === '*' && rest$608[1] && rest$608[1].token.type === parser$258.Token.Delimiter && rest$608[1].token.value === '()' && rest$608[2] && rest$608[2].token.type === parser$258.Token.Delimiter && rest$608[2].token.value === '{}') {
                    rest$608[1].token.inner = rest$608[1].expose().token.inner;
                    rest$608[2].token.inner = rest$608[2].expose().token.inner;
                    return step$606(AnonFun$418.create(head$607, rest$608[0], rest$608[1], rest$608[2]), rest$608.slice(3));
                }    // arrow function
                else if ((head$607.token.type === parser$258.Token.Delimiter && head$607.token.value === '()' || head$607.token.type === parser$258.Token.Identifier) && rest$608[0] && rest$608[0].token.type === parser$258.Token.Punctuator && resolve$389(rest$608[0]) === '=>' && rest$608[1] && rest$608[1].token.type === parser$258.Token.Delimiter && rest$608[1].token.value === '{}') {
                    return step$606(ArrowFun$419.create(head$607, rest$608[0], rest$608[1]), rest$608.slice(2));
                }    // catch statement
                else if (head$607.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$607) === 'catch' && rest$608[0] && rest$608[0].token.type === parser$258.Token.Delimiter && rest$608[0].token.value === '()' && rest$608[1] && rest$608[1].token.type === parser$258.Token.Delimiter && rest$608[1].token.value === '{}') {
                    rest$608[0].token.inner = rest$608[0].expose().token.inner;
                    rest$608[1].token.inner = rest$608[1].expose().token.inner;
                    return step$606(CatchClause$431.create(head$607, rest$608[0], rest$608[1]), rest$608.slice(2));
                }    // this expression
                else if (head$607.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$607) === 'this') {
                    return step$606(ThisExpression$403.create(head$607), rest$608);
                }    // literal
                else if (head$607.token.type === parser$258.Token.NumericLiteral || head$607.token.type === parser$258.Token.StringLiteral || head$607.token.type === parser$258.Token.BooleanLiteral || head$607.token.type === parser$258.Token.RegularExpression || head$607.token.type === parser$258.Token.NullLiteral) {
                    return step$606(Lit$404.create(head$607), rest$608);
                }    // export
                else if (head$607.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$607) === 'export' && rest$608[0] && (rest$608[0].token.type === parser$258.Token.Identifier || rest$608[0].token.type === parser$258.Token.Keyword || rest$608[0].token.type === parser$258.Token.Punctuator)) {
                    return step$606(Export$434.create(rest$608[0]), rest$608.slice(1));
                }    // identifier
                else if (head$607.token.type === parser$258.Token.Identifier) {
                    return step$606(Id$416.create(head$607), rest$608);
                }    // punctuator
                else if (head$607.token.type === parser$258.Token.Punctuator) {
                    return step$606(Punc$414.create(head$607), rest$608);
                } else if (head$607.token.type === parser$258.Token.Keyword && unwrapSyntax$267(head$607) === 'with') {
                    throwSyntaxError$266('enforest', 'with is not supported in sweet.js', head$607);
                }    // keyword
                else if (head$607.token.type === parser$258.Token.Keyword) {
                    return step$606(Keyword$413.create(head$607), rest$608);
                }    // Delimiter
                else if (head$607.token.type === parser$258.Token.Delimiter) {
                    return step$606(Delimiter$415.create(head$607.expose()), rest$608);
                }    // end of file
                else if (head$607.token.type === parser$258.Token.EOF) {
                    assert$265(rest$608.length === 0, 'nothing should be after an EOF');
                    return step$606(EOF$399.create(head$607), []);
                } else {
                    // todo: are we missing cases?
                    assert$265(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$607,
                destructed: getHeadStx$441(toks$602, rest$608),
                rest: rest$608,
                prevStx: prevStx$604,
                prevTerms: prevTerms$605
            };
        }
        return step$606(toks$602[0], toks$602.slice(1));
    }
    function getHeadStx$441(before$701, after$702) {
        return after$702.length ? before$701.slice(0, -after$702.length) : before$701;
    }
    function get_expression$442(stx$703, context$704) {
        var res$705 = enforest$440(stx$703, context$704);
        var next$706 = res$705;
        var peek$707;
        var prevStx$708;
        if (!next$706.result.hasPrototype(Expr$401)) {
            return {
                result: null,
                rest: stx$703
            };
        }
        while (next$706.rest.length) {
            // Enforest the next term tree since it might be an infix macro that
            // consumes the initial expression.
            peek$707 = enforest$440(next$706.rest, context$704, next$706.destructed, [next$706.result]);
            // If it has prev terms it wasn't infix, but it we need to run it
            // through enforest together with the initial expression to see if
            // it extends it into a longer expression.
            if (peek$707.prevTerms.length === 1) {
                peek$707 = enforest$440([next$706.result].concat(peek$707.destructed, peek$707.rest), context$704);
            }
            // No new expression was created, so we've reached the end.
            if (peek$707.result === next$706.result) {
                break;
            }
            // A new expression was created, so loop back around and keep going.
            next$706 = peek$707;
        }
        return next$706;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$443(newMark$709, env$710) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$711(match$712) {
            if (match$712.level === 0) {
                // replace the match property with the marked syntax
                match$712.match = _$257.map(match$712.match, function (stx$713) {
                    return stx$713.mark(newMark$709);
                });
            } else {
                _$257.each(match$712.match, function (match$714) {
                    dfs$711(match$714);
                });
            }
        }
        _$257.keys(env$710).forEach(function (key$715) {
            dfs$711(env$710[key$715]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$444(mac$716, context$717) {
        var body$718 = mac$716.body;
        // raw function primitive form
        if (!(body$718[0] && body$718[0].token.type === parser$258.Token.Keyword && body$718[0].token.value === 'function')) {
            throwSyntaxError$266('load macro', 'Primitive macro form must contain a function for the macro body', body$718);
        }
        var stub$719 = parser$258.read('()');
        stub$719[0].token.inner = body$718;
        var expanded$720 = expand$449(stub$719, context$717);
        expanded$720 = expanded$720[0].destruct().concat(expanded$720[1].eof);
        var flattend$721 = flatten$452(expanded$720);
        var bodyCode$722 = codegen$264.generate(parser$258.parse(flattend$721));
        var macroFn$723 = scopedEval$378(bodyCode$722, {
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
                __fresh: fresh$395,
                _: _$257,
                patternModule: patternModule$262,
                getTemplate: function (id$724) {
                    return cloneSyntaxArray$445(context$717.templateMap.get(id$724));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$443,
                mergeMatches: function (newMatch$725, oldMatch$726) {
                    newMatch$725.patternEnv = _$257.extend({}, oldMatch$726.patternEnv, newMatch$725.patternEnv);
                    return newMatch$725;
                }
            });
        return macroFn$723;
    }
    function cloneSyntaxArray$445(arr$727) {
        return arr$727.map(function (stx$728) {
            var o$729 = syntaxFromToken$382(_$257.clone(stx$728.token), stx$728);
            if (o$729.token.type === parser$258.Token.Delimiter) {
                o$729.token.inner = cloneSyntaxArray$445(o$729.token.inner);
            }
            return o$729;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$446(stx$730, context$731, prevStx$732, prevTerms$733) {
        assert$265(context$731, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$730.length === 0) {
            return {
                terms: prevTerms$733 ? prevTerms$733.reverse() : [],
                context: context$731
            };
        }
        assert$265(stx$730[0].token, 'expecting a syntax object');
        var f$734 = enforest$440(stx$730, context$731, prevStx$732, prevTerms$733);
        // head :: TermTree
        var head$735 = f$734.result;
        // rest :: [Syntax]
        var rest$736 = f$734.rest;
        var macroDefinition$737;
        if (head$735.hasPrototype(Macro$421) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$737 = loadMacroDef$444(head$735, context$731);
            addToDefinitionCtx$447([head$735.name], context$731.defscope, false);
            context$731.env.set(resolve$389(head$735.name), {
                fn: macroDefinition$737,
                builtin: builtinMode$384
            });
            return expandToTermTree$446(rest$736, context$731, prevStx$732, prevTerms$733);
        }
        if (head$735.hasPrototype(LetMacro$420) && expandCount$385 < maxExpands$386) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$737 = loadMacroDef$444(head$735, context$731);
            var freshName$740 = fresh$395();
            var renamedName$741 = head$735.name.rename(head$735.name, freshName$740);
            rest$736 = _$257.map(rest$736, function (stx$742) {
                return stx$742.rename(head$735.name, freshName$740);
            });
            head$735.name = renamedName$741;
            context$731.env.set(resolve$389(head$735.name), {
                fn: macroDefinition$737,
                builtin: builtinMode$384
            });
            return expandToTermTree$446(rest$736, context$731, prevStx$732, prevTerms$733);
        }
        // We build the newPrevTerms/Stx here (instead of at the beginning) so
        // that macro definitions don't get added to it.
        f$734.destructed.forEach(function (stx$743) {
            stx$743.term = head$735;
        });
        var newPrevTerms$738 = [head$735].concat(f$734.prevTerms);
        var newPrevStx$739 = f$734.destructed.reverse().concat(f$734.prevStx);
        if (head$735.hasPrototype(NamedFun$417)) {
            addToDefinitionCtx$447([head$735.name], context$731.defscope, true);
        }
        if (head$735.hasPrototype(VariableStatement$428)) {
            addToDefinitionCtx$447(_$257.map(head$735.decls, function (decl$744) {
                return decl$744.ident;
            }), context$731.defscope, true);
        }
        if (head$735.hasPrototype(Block$406) && head$735.body.hasPrototype(Delimiter$415)) {
            head$735.body.delim.token.inner.forEach(function (term$745) {
                if (term$745.hasPrototype(VariableStatement$428)) {
                    addToDefinitionCtx$447(_$257.map(term$745.decls, function (decl$746) {
                        return decl$746.ident;
                    }), context$731.defscope, true);
                }
            });
        }
        if (head$735.hasPrototype(Delimiter$415)) {
            head$735.delim.token.inner.forEach(function (term$747) {
                if (term$747.hasPrototype(VariableStatement$428)) {
                    addToDefinitionCtx$447(_$257.map(term$747.decls, function (decl$748) {
                        return decl$748.ident;
                    }), context$731.defscope, true);
                }
            });
        }
        if (head$735.hasPrototype(ForStatement$435)) {
            head$735.cond.expose();
            var forCond$749 = head$735.cond.token.inner;
            if (forCond$749[0] && resolve$389(forCond$749[0]) === 'let' && forCond$749[1] && forCond$749[1].token.type === parser$258.Token.Identifier) {
                var letNew$750 = fresh$395();
                var letId$751 = forCond$749[1];
                forCond$749 = forCond$749.map(function (stx$752) {
                    return stx$752.rename(letId$751, letNew$750);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$735.cond.token.inner = expand$449([forCond$749[0]], context$731).concat(expand$449(forCond$749.slice(1), context$731));
                // nice and easy case: `for (...) { ... }`
                if (rest$736[0] && rest$736[0].token.value === '{}') {
                    rest$736[0] = rest$736[0].rename(letId$751, letNew$750);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$753 = enforest$440(rest$736, context$731);
                    var renamedBodyTerm$754 = bodyEnf$753.result.rename(letId$751, letNew$750);
                    bodyEnf$753.destructed.forEach(function (stx$755) {
                        stx$755.term = renamedBodyTerm$754;
                    });
                    return expandToTermTree$446(bodyEnf$753.rest, context$731, bodyEnf$753.destructed.reverse().concat(newPrevStx$739), [renamedBodyTerm$754].concat(newPrevTerms$738));
                }
            } else {
                head$735.cond.token.inner = expand$449(head$735.cond.token.inner, context$731);
            }
        }
        return expandToTermTree$446(rest$736, context$731, newPrevStx$739, newPrevTerms$738);
    }
    function addToDefinitionCtx$447(idents$756, defscope$757, skipRep$758) {
        assert$265(idents$756 && idents$756.length > 0, 'expecting some variable identifiers');
        skipRep$758 = skipRep$758 || false;
        _$257.each(idents$756, function (id$759) {
            var skip$760 = false;
            if (skipRep$758) {
                var declRepeat$761 = _$257.find(defscope$757, function (def$762) {
                        return def$762.id.token.value === id$759.token.value && arraysEqual$390(marksof$388(def$762.id.context), marksof$388(id$759.context));
                    });
                skip$760 = typeof declRepeat$761 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$760) {
                var name$763 = fresh$395();
                defscope$757.push({
                    id: id$759,
                    name: name$763
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$448(term$764, context$765) {
        assert$265(context$765 && context$765.env, 'environment map is required');
        if (term$764.hasPrototype(ArrayLiteral$407)) {
            term$764.array.delim.token.inner = expand$449(term$764.array.delim.expose().token.inner, context$765);
            return term$764;
        } else if (term$764.hasPrototype(Block$406)) {
            term$764.body.delim.token.inner = expand$449(term$764.body.delim.expose().token.inner, context$765);
            return term$764;
        } else if (term$764.hasPrototype(ParenExpression$408)) {
            term$764.expr.delim.token.inner = expand$449(term$764.expr.delim.expose().token.inner, context$765);
            return term$764;
        } else if (term$764.hasPrototype(Call$424)) {
            term$764.fun = expandTermTreeToFinal$448(term$764.fun, context$765);
            term$764.args = _$257.map(term$764.args, function (arg$766) {
                return expandTermTreeToFinal$448(arg$766, context$765);
            });
            return term$764;
        } else if (term$764.hasPrototype(UnaryOp$409)) {
            term$764.expr = expandTermTreeToFinal$448(term$764.expr, context$765);
            return term$764;
        } else if (term$764.hasPrototype(BinOp$411)) {
            term$764.left = expandTermTreeToFinal$448(term$764.left, context$765);
            term$764.right = expandTermTreeToFinal$448(term$764.right, context$765);
            return term$764;
        } else if (term$764.hasPrototype(ObjGet$426)) {
            term$764.right.delim.token.inner = expand$449(term$764.right.delim.expose().token.inner, context$765);
            return term$764;
        } else if (term$764.hasPrototype(ObjDotGet$425)) {
            term$764.left = expandTermTreeToFinal$448(term$764.left, context$765);
            term$764.right = expandTermTreeToFinal$448(term$764.right, context$765);
            return term$764;
        } else if (term$764.hasPrototype(VariableDeclaration$427)) {
            if (term$764.init) {
                term$764.init = expandTermTreeToFinal$448(term$764.init, context$765);
            }
            return term$764;
        } else if (term$764.hasPrototype(VariableStatement$428)) {
            term$764.decls = _$257.map(term$764.decls, function (decl$767) {
                return expandTermTreeToFinal$448(decl$767, context$765);
            });
            return term$764;
        } else if (term$764.hasPrototype(Delimiter$415)) {
            // expand inside the delimiter and then continue on
            term$764.delim.token.inner = expand$449(term$764.delim.expose().token.inner, context$765);
            return term$764;
        } else if (term$764.hasPrototype(NamedFun$417) || term$764.hasPrototype(AnonFun$418) || term$764.hasPrototype(CatchClause$431) || term$764.hasPrototype(ArrowFun$419) || term$764.hasPrototype(Module$432)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$768 = [];
            var bodyContext$769 = makeExpanderContext$450(_$257.defaults({ defscope: newDef$768 }, context$765));
            var paramSingleIdent$770 = term$764.params && term$764.params.token.type === parser$258.Token.Identifier;
            var params$771;
            if (term$764.params && term$764.params.token.type === parser$258.Token.Delimiter) {
                params$771 = term$764.params.expose();
            } else if (paramSingleIdent$770) {
                params$771 = term$764.params;
            } else {
                params$771 = syn$259.makeDelim('()', [], null);
            }
            var bodies$772;
            if (Array.isArray(term$764.body)) {
                bodies$772 = syn$259.makeDelim('{}', term$764.body, null);
            } else {
                bodies$772 = term$764.body;
            }
            bodies$772 = bodies$772.addDefCtx(newDef$768);
            var paramNames$773 = _$257.map(getParamIdentifiers$397(params$771), function (param$780) {
                    var freshName$781 = fresh$395();
                    return {
                        freshName: freshName$781,
                        originalParam: param$780,
                        renamedParam: param$780.rename(param$780, freshName$781)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$774 = _$257.reduce(paramNames$773, function (accBody$782, p$783) {
                    return accBody$782.rename(p$783.originalParam, p$783.freshName);
                }, bodies$772);
            renamedBody$774 = renamedBody$774.expose();
            var expandedResult$775 = expandToTermTree$446(renamedBody$774.token.inner, bodyContext$769);
            var bodyTerms$776 = expandedResult$775.terms;
            var renamedParams$777 = _$257.map(paramNames$773, function (p$784) {
                    return p$784.renamedParam;
                });
            var flatArgs$778;
            if (paramSingleIdent$770) {
                flatArgs$778 = renamedParams$777[0];
            } else {
                flatArgs$778 = syn$259.makeDelim('()', joinSyntax$383(renamedParams$777, ','), term$764.params);
            }
            var expandedArgs$779 = expand$449([flatArgs$778], bodyContext$769);
            assert$265(expandedArgs$779.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$764.params) {
                term$764.params = expandedArgs$779[0];
            }
            bodyTerms$776 = _$257.map(bodyTerms$776, function (bodyTerm$785) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$786 = bodyTerm$785.addDefCtx(newDef$768);
                // finish expansion
                return expandTermTreeToFinal$448(termWithCtx$786, expandedResult$775.context);
            });
            if (term$764.hasPrototype(Module$432)) {
                bodyTerms$776 = _$257.filter(bodyTerms$776, function (bodyTerm$787) {
                    if (bodyTerm$787.hasPrototype(Export$434)) {
                        term$764.exports.push(bodyTerm$787);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$774.token.inner = bodyTerms$776;
            if (Array.isArray(term$764.body)) {
                term$764.body = renamedBody$774.token.inner;
            } else {
                term$764.body = renamedBody$774;
            }
            // and continue expand the rest
            return term$764;
        }
        // the term is fine as is
        return term$764;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$449(stx$788, context$789) {
        assert$265(context$789, 'must provide an expander context');
        var trees$790 = expandToTermTree$446(stx$788, context$789);
        return _$257.map(trees$790.terms, function (term$791) {
            return expandTermTreeToFinal$448(term$791, trees$790.context);
        });
    }
    function makeExpanderContext$450(o$792) {
        o$792 = o$792 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$792.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$792.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$792.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$792.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$451(stx$793, builtinSource$794, _maxExpands$795) {
        var env$796 = new Map();
        var params$797 = [];
        var context$798, builtInContext$799 = makeExpanderContext$450({ env: env$796 });
        maxExpands$386 = _maxExpands$795 || Infinity;
        expandCount$385 = 0;
        if (builtinSource$794) {
            var builtinRead$802 = parser$258.read(builtinSource$794);
            builtinRead$802 = [
                syn$259.makeIdent('module', null),
                syn$259.makeDelim('{}', builtinRead$802, null)
            ];
            builtinMode$384 = true;
            var builtinRes$803 = expand$449(builtinRead$802, builtInContext$799);
            builtinMode$384 = false;
            params$797 = _$257.map(builtinRes$803[0].exports, function (term$804) {
                return {
                    oldExport: term$804.name,
                    newParam: syn$259.makeIdent(term$804.name.token.value, null)
                };
            });
        }
        var modBody$800 = syn$259.makeDelim('{}', stx$793, null);
        modBody$800 = _$257.reduce(params$797, function (acc$805, param$806) {
            var newName$807 = fresh$395();
            env$796.set(resolve$389(param$806.newParam.rename(param$806.newParam, newName$807)), env$796.get(resolve$389(param$806.oldExport)));
            return acc$805.rename(param$806.newParam, newName$807);
        }, modBody$800);
        context$798 = makeExpanderContext$450({ env: env$796 });
        var res$801 = expand$449([
                syn$259.makeIdent('module', null),
                modBody$800
            ], context$798);
        res$801 = res$801[0].destruct();
        return flatten$452(res$801[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$452(stx$808) {
        return _$257.reduce(stx$808, function (acc$809, stx$810) {
            if (stx$810.token.type === parser$258.Token.Delimiter) {
                var exposed$811 = stx$810.expose();
                var openParen$812 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$810.token.value[0],
                        range: stx$810.token.startRange,
                        sm_range: typeof stx$810.token.sm_startRange == 'undefined' ? stx$810.token.startRange : stx$810.token.sm_startRange,
                        lineNumber: stx$810.token.startLineNumber,
                        sm_lineNumber: typeof stx$810.token.sm_startLineNumber == 'undefined' ? stx$810.token.startLineNumber : stx$810.token.sm_startLineNumber,
                        lineStart: stx$810.token.startLineStart,
                        sm_lineStart: typeof stx$810.token.sm_startLineStart == 'undefined' ? stx$810.token.startLineStart : stx$810.token.sm_startLineStart
                    }, exposed$811);
                var closeParen$813 = syntaxFromToken$382({
                        type: parser$258.Token.Punctuator,
                        value: stx$810.token.value[1],
                        range: stx$810.token.endRange,
                        sm_range: typeof stx$810.token.sm_endRange == 'undefined' ? stx$810.token.endRange : stx$810.token.sm_endRange,
                        lineNumber: stx$810.token.endLineNumber,
                        sm_lineNumber: typeof stx$810.token.sm_endLineNumber == 'undefined' ? stx$810.token.endLineNumber : stx$810.token.sm_endLineNumber,
                        lineStart: stx$810.token.endLineStart,
                        sm_lineStart: typeof stx$810.token.sm_endLineStart == 'undefined' ? stx$810.token.endLineStart : stx$810.token.sm_endLineStart
                    }, exposed$811);
                if (stx$810.token.leadingComments) {
                    openParen$812.token.leadingComments = stx$810.token.leadingComments;
                }
                if (stx$810.token.trailingComments) {
                    openParen$812.token.trailingComments = stx$810.token.trailingComments;
                }
                return acc$809.concat(openParen$812).concat(flatten$452(exposed$811.token.inner)).concat(closeParen$813);
            }
            stx$810.token.sm_lineNumber = stx$810.token.sm_lineNumber ? stx$810.token.sm_lineNumber : stx$810.token.lineNumber;
            stx$810.token.sm_lineStart = stx$810.token.sm_lineStart ? stx$810.token.sm_lineStart : stx$810.token.lineStart;
            stx$810.token.sm_range = stx$810.token.sm_range ? stx$810.token.sm_range : stx$810.token.range;
            return acc$809.concat(stx$810);
        }, []);
    }
    exports$256.enforest = enforest$440;
    exports$256.expand = expandTopLevel$451;
    exports$256.resolve = resolve$389;
    exports$256.get_expression = get_expression$442;
    exports$256.makeExpanderContext = makeExpanderContext$450;
    exports$256.Expr = Expr$401;
    exports$256.VariableStatement = VariableStatement$428;
    exports$256.tokensToSyntax = syn$259.tokensToSyntax;
    exports$256.syntaxToTokens = syn$259.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map