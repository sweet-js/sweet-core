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
                var o$391 = Object.create(this);
                if (typeof o$391.construct === 'function') {
                    o$391.construct.apply(o$391, arguments);
                }
                return o$391;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$392) {
                var result$393 = Object.create(this);
                for (var prop$394 in properties$392) {
                    if (properties$392.hasOwnProperty(prop$394)) {
                        result$393[prop$394] = properties$392[prop$394];
                    }
                }
                return result$393;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$395) {
                function F$396() {
                }
                F$396.prototype = proto$395;
                return this instanceof F$396;
            },
            enumerable: false,
            writable: true
        }
    });
    var scopedEval$313 = se$217.scopedEval;
    var Rename$314 = syn$215.Rename;
    var Mark$315 = syn$215.Mark;
    var Var$316 = syn$215.Var;
    var Def$317 = syn$215.Def;
    var isDef$318 = syn$215.isDef;
    var isMark$319 = syn$215.isMark;
    var isRename$320 = syn$215.isRename;
    var syntaxFromToken$321 = syn$215.syntaxFromToken;
    var joinSyntax$322 = syn$215.joinSyntax;
    var builtinMode$323 = false;
    var expandCount$324 = 0;
    var maxExpands$325;
    function remdup$326(mark$397, mlist$398) {
        if (mark$397 === _$213.first(mlist$398)) {
            return _$213.rest(mlist$398, 1);
        }
        return [mark$397].concat(mlist$398);
    }
    // (CSyntax) -> [...Num]
    function marksof$327(ctx$399, stopName$400, originalName$401) {
        var mark$402, submarks$403;
        if (isMark$319(ctx$399)) {
            mark$402 = ctx$399.mark;
            submarks$403 = marksof$327(ctx$399.context, stopName$400, originalName$401);
            return remdup$326(mark$402, submarks$403);
        }
        if (isDef$318(ctx$399)) {
            return marksof$327(ctx$399.context, stopName$400, originalName$401);
        }
        if (isRename$320(ctx$399)) {
            if (stopName$400 === originalName$401 + '$' + ctx$399.name) {
                return [];
            }
            return marksof$327(ctx$399.context, stopName$400, originalName$401);
        }
        return [];
    }
    function resolve$328(stx$404) {
        return resolveCtx$332(stx$404.token.value, stx$404.context, [], []);
    }
    function arraysEqual$329(a$405, b$406) {
        if (a$405.length !== b$406.length) {
            return false;
        }
        for (var i$407 = 0; i$407 < a$405.length; i$407++) {
            if (a$405[i$407] !== b$406[i$407]) {
                return false;
            }
        }
        return true;
    }
    function renames$330(defctx$408, oldctx$409, originalName$410) {
        var acc$411 = oldctx$409;
        for (var i$412 = 0; i$412 < defctx$408.length; i$412++) {
            if (defctx$408[i$412].id.token.value === originalName$410) {
                acc$411 = Rename$314(defctx$408[i$412].id, defctx$408[i$412].name, acc$411, defctx$408);
            }
        }
        return acc$411;
    }
    function unionEl$331(arr$413, el$414) {
        if (arr$413.indexOf(el$414) === -1) {
            var res$415 = arr$413.slice(0);
            res$415.push(el$414);
            return res$415;
        }
        return arr$413;
    }
    // (Syntax) -> String
    function resolveCtx$332(originalName$416, ctx$417, stop_spine$418, stop_branch$419) {
        if (isMark$319(ctx$417)) {
            return resolveCtx$332(originalName$416, ctx$417.context, stop_spine$418, stop_branch$419);
        }
        if (isDef$318(ctx$417)) {
            if (stop_spine$418.indexOf(ctx$417.defctx) !== -1) {
                return resolveCtx$332(originalName$416, ctx$417.context, stop_spine$418, stop_branch$419);
            } else {
                return resolveCtx$332(originalName$416, renames$330(ctx$417.defctx, ctx$417.context, originalName$416), stop_spine$418, unionEl$331(stop_branch$419, ctx$417.defctx));
            }
        }
        if (isRename$320(ctx$417)) {
            if (originalName$416 === ctx$417.id.token.value) {
                var idName$420 = resolveCtx$332(ctx$417.id.token.value, ctx$417.id.context, stop_branch$419, stop_branch$419);
                var subName$421 = resolveCtx$332(originalName$416, ctx$417.context, unionEl$331(stop_spine$418, ctx$417.def), stop_branch$419);
                if (idName$420 === subName$421) {
                    var idMarks$422 = marksof$327(ctx$417.id.context, originalName$416 + '$' + ctx$417.name, originalName$416);
                    var subMarks$423 = marksof$327(ctx$417.context, originalName$416 + '$' + ctx$417.name, originalName$416);
                    if (arraysEqual$329(idMarks$422, subMarks$423)) {
                        return originalName$416 + '$' + ctx$417.name;
                    }
                }
            }
            return resolveCtx$332(originalName$416, ctx$417.context, stop_spine$418, stop_branch$419);
        }
        return originalName$416;
    }
    var nextFresh$333 = 0;
    // fun () -> Num
    function fresh$334() {
        return nextFresh$333++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$335(towrap$424, delimSyntax$425) {
        assert$221(delimSyntax$425.token.type === parser$214.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$321({
            type: parser$214.Token.Delimiter,
            value: delimSyntax$425.token.value,
            inner: towrap$424,
            range: delimSyntax$425.token.range,
            startLineNumber: delimSyntax$425.token.startLineNumber,
            lineStart: delimSyntax$425.token.lineStart
        }, delimSyntax$425);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$336(argSyntax$426) {
        if (argSyntax$426.token.type === parser$214.Token.Delimiter) {
            return _$213.filter(argSyntax$426.token.inner, function (stx$427) {
                return stx$427.token.value !== ',';
            });
        } else if (argSyntax$426.token.type === parser$214.Token.Identifier) {
            return [argSyntax$426];
        } else {
            assert$221(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$337 = {
            destruct: function () {
                return _$213.reduce(this.properties, _$213.bind(function (acc$428, prop$429) {
                    if (this[prop$429] && this[prop$429].hasPrototype(TermTree$337)) {
                        return acc$428.concat(this[prop$429].destruct());
                    } else if (this[prop$429] && this[prop$429].token && this[prop$429].token.inner) {
                        this[prop$429].token.inner = _$213.reduce(this[prop$429].token.inner, function (acc$430, t$431) {
                            if (t$431.hasPrototype(TermTree$337)) {
                                return acc$430.concat(t$431.destruct());
                            }
                            return acc$430.concat(t$431);
                        }, []);
                        return acc$428.concat(this[prop$429]);
                    } else if (Array.isArray(this[prop$429])) {
                        return acc$428.concat(_$213.reduce(this[prop$429], function (acc$432, t$433) {
                            if (t$433.hasPrototype(TermTree$337)) {
                                return acc$432.concat(t$433.destruct());
                            }
                            return acc$432.concat(t$433);
                        }, []));
                    } else if (this[prop$429]) {
                        return acc$428.concat(this[prop$429]);
                    } else {
                        return acc$428;
                    }
                }, this), []);
            },
            addDefCtx: function (def$434) {
                for (var i$435 = 0; i$435 < this.properties.length; i$435++) {
                    var prop$436 = this.properties[i$435];
                    if (Array.isArray(this[prop$436])) {
                        this[prop$436] = _$213.map(this[prop$436], function (item$437) {
                            return item$437.addDefCtx(def$434);
                        });
                    } else if (this[prop$436]) {
                        this[prop$436] = this[prop$436].addDefCtx(def$434);
                    }
                }
                return this;
            },
            rename: function (id$438, name$439) {
                for (var i$440 = 0; i$440 < this.properties.length; i$440++) {
                    var prop$441 = this.properties[i$440];
                    if (Array.isArray(this[prop$441])) {
                        this[prop$441] = _$213.map(this[prop$441], function (item$442) {
                            return item$442.rename(id$438, name$439);
                        });
                    } else if (this[prop$441]) {
                        this[prop$441] = this[prop$441].rename(id$438, name$439);
                    }
                }
                return this;
            }
        };
    var EOF$338 = TermTree$337.extend({
            properties: ['eof'],
            construct: function (e$443) {
                this.eof = e$443;
            }
        });
    var Statement$339 = TermTree$337.extend({
            construct: function () {
            }
        });
    var Expr$340 = Statement$339.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$341 = Expr$340.extend({
            construct: function () {
            }
        });
    var ThisExpression$342 = PrimaryExpression$341.extend({
            properties: ['this'],
            construct: function (that$444) {
                this.this = that$444;
            }
        });
    var Lit$343 = PrimaryExpression$341.extend({
            properties: ['lit'],
            construct: function (l$445) {
                this.lit = l$445;
            }
        });
    exports$212._test.PropertyAssignment = PropertyAssignment$344;
    var PropertyAssignment$344 = TermTree$337.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$446, assignment$447) {
                this.propName = propName$446;
                this.assignment = assignment$447;
            }
        });
    var Block$345 = PrimaryExpression$341.extend({
            properties: ['body'],
            construct: function (body$448) {
                this.body = body$448;
            }
        });
    var ArrayLiteral$346 = PrimaryExpression$341.extend({
            properties: ['array'],
            construct: function (ar$449) {
                this.array = ar$449;
            }
        });
    var ParenExpression$347 = PrimaryExpression$341.extend({
            properties: ['expr'],
            construct: function (expr$450) {
                this.expr = expr$450;
            }
        });
    var UnaryOp$348 = Expr$340.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$451, expr$452) {
                this.op = op$451;
                this.expr = expr$452;
            }
        });
    var PostfixOp$349 = Expr$340.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$453, op$454) {
                this.expr = expr$453;
                this.op = op$454;
            }
        });
    var BinOp$350 = Expr$340.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$455, left$456, right$457) {
                this.op = op$455;
                this.left = left$456;
                this.right = right$457;
            }
        });
    var ConditionalExpression$351 = Expr$340.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$458, question$459, tru$460, colon$461, fls$462) {
                this.cond = cond$458;
                this.question = question$459;
                this.tru = tru$460;
                this.colon = colon$461;
                this.fls = fls$462;
            }
        });
    var Keyword$352 = TermTree$337.extend({
            properties: ['keyword'],
            construct: function (k$463) {
                this.keyword = k$463;
            }
        });
    var Punc$353 = TermTree$337.extend({
            properties: ['punc'],
            construct: function (p$464) {
                this.punc = p$464;
            }
        });
    var Delimiter$354 = TermTree$337.extend({
            properties: ['delim'],
            construct: function (d$465) {
                this.delim = d$465;
            }
        });
    var Id$355 = PrimaryExpression$341.extend({
            properties: ['id'],
            construct: function (id$466) {
                this.id = id$466;
            }
        });
    var NamedFun$356 = Expr$340.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$467, star$468, name$469, params$470, body$471) {
                this.keyword = keyword$467;
                this.star = star$468;
                this.name = name$469;
                this.params = params$470;
                this.body = body$471;
            }
        });
    var AnonFun$357 = Expr$340.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$472, star$473, params$474, body$475) {
                this.keyword = keyword$472;
                this.star = star$473;
                this.params = params$474;
                this.body = body$475;
            }
        });
    var ArrowFun$358 = Expr$340.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$476, arrow$477, body$478) {
                this.params = params$476;
                this.arrow = arrow$477;
                this.body = body$478;
            }
        });
    var LetMacro$359 = TermTree$337.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$479, body$480) {
                this.name = name$479;
                this.body = body$480;
            }
        });
    var Macro$360 = TermTree$337.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$481, body$482) {
                this.name = name$481;
                this.body = body$482;
            }
        });
    var AnonMacro$361 = TermTree$337.extend({
            properties: ['body'],
            construct: function (body$483) {
                this.body = body$483;
            }
        });
    var Const$362 = Expr$340.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$484, call$485) {
                this.newterm = newterm$484;
                this.call = call$485;
            }
        });
    var Call$363 = Expr$340.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                assert$221(this.fun.hasPrototype(TermTree$337), 'expecting a term tree in destruct of call');
                var that$486 = this;
                this.delim = syntaxFromToken$321(_$213.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$213.reduce(this.args, function (acc$487, term$488) {
                    assert$221(term$488 && term$488.hasPrototype(TermTree$337), 'expecting term trees in destruct of Call');
                    var dst$489 = acc$487.concat(term$488.destruct());
                    // add all commas except for the last one
                    if (that$486.commas.length > 0) {
                        dst$489 = dst$489.concat(that$486.commas.shift());
                    }
                    return dst$489;
                }, []);
                return this.fun.destruct().concat(Delimiter$354.create(this.delim).destruct());
            },
            construct: function (funn$490, args$491, delim$492, commas$493) {
                assert$221(Array.isArray(args$491), 'requires an array of arguments terms');
                this.fun = funn$490;
                this.args = args$491;
                this.delim = delim$492;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$493;
            }
        });
    var ObjDotGet$364 = Expr$340.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$494, dot$495, right$496) {
                this.left = left$494;
                this.dot = dot$495;
                this.right = right$496;
            }
        });
    var ObjGet$365 = Expr$340.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$497, right$498) {
                this.left = left$497;
                this.right = right$498;
            }
        });
    var VariableDeclaration$366 = TermTree$337.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$499, eqstx$500, init$501, comma$502) {
                this.ident = ident$499;
                this.eqstx = eqstx$500;
                this.init = init$501;
                this.comma = comma$502;
            }
        });
    var VariableStatement$367 = Statement$339.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$213.reduce(this.decls, function (acc$503, decl$504) {
                    return acc$503.concat(decl$504.destruct());
                }, []));
            },
            construct: function (varkw$505, decls$506) {
                assert$221(Array.isArray(decls$506), 'decls must be an array');
                this.varkw = varkw$505;
                this.decls = decls$506;
            }
        });
    var LetStatement$368 = Statement$339.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$213.reduce(this.decls, function (acc$507, decl$508) {
                    return acc$507.concat(decl$508.destruct());
                }, []));
            },
            construct: function (letkw$509, decls$510) {
                assert$221(Array.isArray(decls$510), 'decls must be an array');
                this.letkw = letkw$509;
                this.decls = decls$510;
            }
        });
    var ConstStatement$369 = Statement$339.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$213.reduce(this.decls, function (acc$511, decl$512) {
                    return acc$511.concat(decl$512.destruct());
                }, []));
            },
            construct: function (constkw$513, decls$514) {
                assert$221(Array.isArray(decls$514), 'decls must be an array');
                this.constkw = constkw$513;
                this.decls = decls$514;
            }
        });
    var CatchClause$370 = Statement$339.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$515, params$516, body$517) {
                this.catchkw = catchkw$515;
                this.params = params$516;
                this.body = body$517;
            }
        });
    var Module$371 = TermTree$337.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$518) {
                this.body = body$518;
                this.exports = [];
            }
        });
    var Empty$372 = Statement$339.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$373 = TermTree$337.extend({
            properties: ['name'],
            construct: function (name$519) {
                this.name = name$519;
            }
        });
    var ForStatement$374 = Statement$339.extend({
            properties: [
                'forkw',
                'cond'
            ],
            construct: function (forkw$520, cond$521) {
                this.forkw = forkw$520;
                this.cond = cond$521;
            }
        });
    function stxIsUnaryOp$375(stx$522) {
        var staticOperators$523 = [
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
        return _$213.contains(staticOperators$523, unwrapSyntax$223(stx$522));
    }
    function stxIsBinOp$376(stx$524) {
        var staticOperators$525 = [
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
        return _$213.contains(staticOperators$525, unwrapSyntax$223(stx$524));
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$377(stx$526, context$527, isLet$528) {
        var decls$529 = [];
        var res$530 = enforest$379(stx$526, context$527);
        var result$531 = res$530.result;
        var rest$532 = res$530.rest;
        if (rest$532[0]) {
            if (isLet$528 && result$531.hasPrototype(Id$355)) {
                var freshName$534 = fresh$334();
                var renamedId$535 = result$531.id.rename(result$531.id, freshName$534);
                rest$532 = rest$532.map(function (stx$536) {
                    return stx$536.rename(result$531.id, freshName$534);
                });
                result$531.id = renamedId$535;
            }
            var nextRes$533 = enforest$379(rest$532, context$527);
            // x = ...
            if (nextRes$533.result.hasPrototype(Punc$353) && nextRes$533.result.punc.token.value === '=') {
                var initializerRes$537 = enforest$379(nextRes$533.rest, context$527);
                // x = y + z, ...
                if (initializerRes$537.rest[0] && initializerRes$537.rest[0].token.value === ',') {
                    decls$529.push(VariableDeclaration$366.create(result$531.id, nextRes$533.result.punc, initializerRes$537.result, initializerRes$537.rest[0]));
                    var subRes$538 = enforestVarStatement$377(initializerRes$537.rest.slice(1), context$527, isLet$528);
                    decls$529 = decls$529.concat(subRes$538.result);
                    rest$532 = subRes$538.rest;
                }    // x = y ...
                else {
                    decls$529.push(VariableDeclaration$366.create(result$531.id, nextRes$533.result.punc, initializerRes$537.result));
                    rest$532 = initializerRes$537.rest;
                }
            }    // x ,...;
            else if (nextRes$533.result.hasPrototype(Punc$353) && nextRes$533.result.punc.token.value === ',') {
                decls$529.push(VariableDeclaration$366.create(result$531.id, null, null, nextRes$533.result.punc));
                var subRes$538 = enforestVarStatement$377(nextRes$533.rest, context$527, isLet$528);
                decls$529 = decls$529.concat(subRes$538.result);
                rest$532 = subRes$538.rest;
            } else {
                if (result$531.hasPrototype(Id$355)) {
                    decls$529.push(VariableDeclaration$366.create(result$531.id));
                } else {
                    throwSyntaxError$222('enforest', 'Expecting an identifier in variable declaration', rest$532);
                }
            }
        }    // x EOF
        else {
            if (result$531.hasPrototype(Id$355)) {
                decls$529.push(VariableDeclaration$366.create(result$531.id));
            } else if (result$531.hasPrototype(BinOp$350) && result$531.op.token.value === 'in') {
                decls$529.push(VariableDeclaration$366.create(result$531.left.id, result$531.op, result$531.right));
            } else {
                throwSyntaxError$222('enforest', 'Expecting an identifier in variable declaration', stx$526);
            }
        }
        return {
            result: decls$529,
            rest: rest$532
        };
    }
    function adjustLineContext$378(stx$539, original$540, current$541) {
        current$541 = current$541 || {
            lastLineNumber: original$540.token.lineNumber,
            lineNumber: original$540.token.lineNumber - 1
        };
        return _$213.map(stx$539, function (stx$542) {
            if (stx$542.token.type === parser$214.Token.Delimiter) {
                // handle tokens with missing line info
                stx$542.token.startLineNumber = typeof stx$542.token.startLineNumber == 'undefined' ? original$540.token.lineNumber : stx$542.token.startLineNumber;
                stx$542.token.endLineNumber = typeof stx$542.token.endLineNumber == 'undefined' ? original$540.token.lineNumber : stx$542.token.endLineNumber;
                stx$542.token.startLineStart = typeof stx$542.token.startLineStart == 'undefined' ? original$540.token.lineStart : stx$542.token.startLineStart;
                stx$542.token.endLineStart = typeof stx$542.token.endLineStart == 'undefined' ? original$540.token.lineStart : stx$542.token.endLineStart;
                stx$542.token.startRange = typeof stx$542.token.startRange == 'undefined' ? original$540.token.range : stx$542.token.startRange;
                stx$542.token.endRange = typeof stx$542.token.endRange == 'undefined' ? original$540.token.range : stx$542.token.endRange;
                stx$542.token.sm_startLineNumber = typeof stx$542.token.sm_startLineNumber == 'undefined' ? stx$542.token.startLineNumber : stx$542.token.sm_startLineNumber;
                stx$542.token.sm_endLineNumber = typeof stx$542.token.sm_endLineNumber == 'undefined' ? stx$542.token.endLineNumber : stx$542.token.sm_endLineNumber;
                stx$542.token.sm_startLineStart = typeof stx$542.token.sm_startLineStart == 'undefined' ? stx$542.token.startLineStart : stx$542.token.sm_startLineStart;
                stx$542.token.sm_endLineStart = typeof stx$542.token.sm_endLineStart == 'undefined' ? stx$542.token.endLineStart : stx$542.token.sm_endLineStart;
                stx$542.token.sm_startRange = typeof stx$542.token.sm_startRange == 'undefined' ? stx$542.token.startRange : stx$542.token.sm_startRange;
                stx$542.token.sm_endRange = typeof stx$542.token.sm_endRange == 'undefined' ? stx$542.token.endRange : stx$542.token.sm_endRange;
                if (stx$542.token.startLineNumber === current$541.lastLineNumber && current$541.lastLineNumber !== current$541.lineNumber) {
                    stx$542.token.startLineNumber = current$541.lineNumber;
                } else if (stx$542.token.startLineNumber !== current$541.lastLineNumber) {
                    current$541.lineNumber++;
                    current$541.lastLineNumber = stx$542.token.startLineNumber;
                    stx$542.token.startLineNumber = current$541.lineNumber;
                }
                if (stx$542.token.inner.length > 0) {
                    stx$542.token.inner = adjustLineContext$378(stx$542.token.inner, original$540, current$541);
                }
                return stx$542;
            }
            // handle tokens with missing line info
            stx$542.token.lineNumber = typeof stx$542.token.lineNumber == 'undefined' ? original$540.token.lineNumber : stx$542.token.lineNumber;
            stx$542.token.lineStart = typeof stx$542.token.lineStart == 'undefined' ? original$540.token.lineStart : stx$542.token.lineStart;
            stx$542.token.range = typeof stx$542.token.range == 'undefined' ? original$540.token.range : stx$542.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$542.token.sm_lineNumber = typeof stx$542.token.sm_lineNumber == 'undefined' ? stx$542.token.lineNumber : stx$542.token.sm_lineNumber;
            stx$542.token.sm_lineStart = typeof stx$542.token.sm_lineStart == 'undefined' ? stx$542.token.lineStart : stx$542.token.sm_lineStart;
            stx$542.token.sm_range = typeof stx$542.token.sm_range == 'undefined' ? _$213.clone(stx$542.token.range) : stx$542.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$542.token.lineNumber === current$541.lastLineNumber && current$541.lastLineNumber !== current$541.lineNumber) {
                stx$542.token.lineNumber = current$541.lineNumber;
            } else if (stx$542.token.lineNumber !== current$541.lastLineNumber) {
                current$541.lineNumber++;
                current$541.lastLineNumber = stx$542.token.lineNumber;
                stx$542.token.lineNumber = current$541.lineNumber;
            }
            return stx$542;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$379(toks$543, context$544) {
        assert$221(toks$543.length > 0, 'enforest assumes there are tokens to work with');
        function step$545(head$546, rest$547) {
            var innerTokens$548;
            assert$221(Array.isArray(rest$547), 'result must at least be an empty array');
            if (head$546.hasPrototype(TermTree$337)) {
                // function call
                var emp$551 = head$546.emp;
                var emp$551 = head$546.emp;
                var keyword$554 = head$546.keyword;
                var delim$556 = head$546.delim;
                var id$558 = head$546.id;
                var delim$556 = head$546.delim;
                var emp$551 = head$546.emp;
                var punc$562 = head$546.punc;
                var keyword$554 = head$546.keyword;
                var emp$551 = head$546.emp;
                var emp$551 = head$546.emp;
                var emp$551 = head$546.emp;
                var delim$556 = head$546.delim;
                var delim$556 = head$546.delim;
                var id$558 = head$546.id;
                var keyword$554 = head$546.keyword;
                var keyword$554 = head$546.keyword;
                var keyword$554 = head$546.keyword;
                var keyword$554 = head$546.keyword;
                var keyword$554 = head$546.keyword;
                if (head$546.hasPrototype(Expr$340) && rest$547[0] && rest$547[0].token.type === parser$214.Token.Delimiter && rest$547[0].token.value === '()') {
                    var argRes$597, enforestedArgs$598 = [], commas$599 = [];
                    rest$547[0].expose();
                    innerTokens$548 = rest$547[0].token.inner;
                    while (innerTokens$548.length > 0) {
                        argRes$597 = enforest$379(innerTokens$548, context$544);
                        enforestedArgs$598.push(argRes$597.result);
                        innerTokens$548 = argRes$597.rest;
                        if (innerTokens$548[0] && innerTokens$548[0].token.value === ',') {
                            // record the comma for later
                            commas$599.push(innerTokens$548[0]);
                            // but dump it for the next loop turn
                            innerTokens$548 = innerTokens$548.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$600 = _$213.all(enforestedArgs$598, function (argTerm$601) {
                            return argTerm$601.hasPrototype(Expr$340);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$548.length === 0 && argsAreExprs$600) {
                        return step$545(Call$363.create(head$546, enforestedArgs$598, rest$547[0], commas$599), rest$547.slice(1));
                    }
                } else if (head$546.hasPrototype(Expr$340) && rest$547[0] && unwrapSyntax$223(rest$547[0]) === '?') {
                    var question$602 = rest$547[0];
                    var condRes$603 = enforest$379(rest$547.slice(1), context$544);
                    var truExpr$604 = condRes$603.result;
                    var right$605 = condRes$603.rest;
                    if (truExpr$604.hasPrototype(Expr$340) && right$605[0] && unwrapSyntax$223(right$605[0]) === ':') {
                        var colon$606 = right$605[0];
                        var flsRes$607 = enforest$379(right$605.slice(1), context$544);
                        var flsExpr$608 = flsRes$607.result;
                        if (flsExpr$608.hasPrototype(Expr$340)) {
                            return step$545(ConditionalExpression$351.create(head$546, question$602, truExpr$604, colon$606, flsExpr$608), flsRes$607.rest);
                        }
                    }
                } else if (head$546.hasPrototype(Keyword$352) && unwrapSyntax$223(keyword$554) === 'new' && rest$547[0]) {
                    var newCallRes$609 = enforest$379(rest$547, context$544);
                    if (newCallRes$609.result.hasPrototype(Call$363)) {
                        return step$545(Const$362.create(head$546, newCallRes$609.result), newCallRes$609.rest);
                    }
                } else if (head$546.hasPrototype(Delimiter$354) && delim$556.token.value === '()' && rest$547[0] && rest$547[0].token.type === parser$214.Token.Punctuator && unwrapSyntax$223(rest$547[0]) === '=>') {
                    var res$610 = enforest$379(rest$547.slice(1), context$544);
                    if (res$610.result.hasPrototype(Expr$340)) {
                        return step$545(ArrowFun$358.create(delim$556, rest$547[0], res$610.result.destruct()), res$610.rest);
                    } else {
                        throwSyntaxError$222('enforest', 'Body of arrow function must be an expression', rest$547.slice(1));
                    }
                } else if (head$546.hasPrototype(Id$355) && rest$547[0] && rest$547[0].token.type === parser$214.Token.Punctuator && unwrapSyntax$223(rest$547[0]) === '=>') {
                    var res$610 = enforest$379(rest$547.slice(1), context$544);
                    if (res$610.result.hasPrototype(Expr$340)) {
                        return step$545(ArrowFun$358.create(id$558, rest$547[0], res$610.result.destruct()), res$610.rest);
                    } else {
                        throwSyntaxError$222('enforest', 'Body of arrow function must be an expression', rest$547.slice(1));
                    }
                } else if (head$546.hasPrototype(Delimiter$354) && delim$556.token.value === '()') {
                    innerTokens$548 = delim$556.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$548.length === 0) {
                        return step$545(ParenExpression$347.create(head$546), rest$547);
                    } else {
                        var innerTerm$611 = get_expression$380(innerTokens$548, context$544);
                        if (innerTerm$611.result && innerTerm$611.result.hasPrototype(Expr$340)) {
                            return step$545(ParenExpression$347.create(head$546), rest$547);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$546.hasPrototype(Expr$340) && rest$547[0] && rest$547[1] && stxIsBinOp$376(rest$547[0])) {
                    var op$612 = rest$547[0];
                    var left$613 = head$546;
                    var bopRes$614 = enforest$379(rest$547.slice(1), context$544);
                    var right$605 = bopRes$614.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$605.hasPrototype(Expr$340)) {
                        return step$545(BinOp$350.create(op$612, left$613, right$605), bopRes$614.rest);
                    }
                } else if (head$546.hasPrototype(Punc$353) && stxIsUnaryOp$375(punc$562)) {
                    var unopRes$615 = enforest$379(rest$547, context$544);
                    if (unopRes$615.result.hasPrototype(Expr$340)) {
                        return step$545(UnaryOp$348.create(punc$562, unopRes$615.result), unopRes$615.rest);
                    }
                } else if (head$546.hasPrototype(Keyword$352) && stxIsUnaryOp$375(keyword$554)) {
                    var unopRes$615 = enforest$379(rest$547, context$544);
                    if (unopRes$615.result.hasPrototype(Expr$340)) {
                        return step$545(UnaryOp$348.create(keyword$554, unopRes$615.result), unopRes$615.rest);
                    }
                } else if (head$546.hasPrototype(Expr$340) && rest$547[0] && (unwrapSyntax$223(rest$547[0]) === '++' || unwrapSyntax$223(rest$547[0]) === '--')) {
                    return step$545(PostfixOp$349.create(head$546, rest$547[0]), rest$547.slice(1));
                } else if (head$546.hasPrototype(Expr$340) && rest$547[0] && rest$547[0].token.value === '[]') {
                    return step$545(ObjGet$365.create(head$546, Delimiter$354.create(rest$547[0].expose())), rest$547.slice(1));
                } else if (head$546.hasPrototype(Expr$340) && rest$547[0] && unwrapSyntax$223(rest$547[0]) === '.' && rest$547[1] && rest$547[1].token.type === parser$214.Token.Identifier) {
                    return step$545(ObjDotGet$364.create(head$546, rest$547[0], rest$547[1]), rest$547.slice(2));
                } else if (head$546.hasPrototype(Delimiter$354) && delim$556.token.value === '[]') {
                    return step$545(ArrayLiteral$346.create(head$546), rest$547);
                } else if (head$546.hasPrototype(Delimiter$354) && head$546.delim.token.value === '{}') {
                    return step$545(Block$345.create(head$546), rest$547);
                } else if (head$546.hasPrototype(Id$355) && unwrapSyntax$223(id$558) === '#quoteSyntax' && rest$547[0] && rest$547[0].token.value === '{}') {
                    var tempId$616 = fresh$334();
                    context$544.templateMap.set(tempId$616, rest$547[0].token.inner);
                    return step$545(syn$215.makeIdent('getTemplate', id$558), [syn$215.makeDelim('()', [syn$215.makeValue(tempId$616, id$558)], id$558)].concat(rest$547.slice(1)));
                } else if (head$546.hasPrototype(Keyword$352) && unwrapSyntax$223(keyword$554) === 'let' && (rest$547[0] && rest$547[0].token.type === parser$214.Token.Identifier || rest$547[0] && rest$547[0].token.type === parser$214.Token.Keyword || rest$547[0] && rest$547[0].token.type === parser$214.Token.Punctuator) && rest$547[1] && unwrapSyntax$223(rest$547[1]) === '=' && rest$547[2] && rest$547[2].token.value === 'macro') {
                    var mac$617 = enforest$379(rest$547.slice(2), context$544);
                    if (!mac$617.result.hasPrototype(AnonMacro$361)) {
                        throwSyntaxError$222('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$547.slice(2));
                    }
                    return step$545(LetMacro$359.create(rest$547[0], mac$617.result.body), mac$617.rest);
                } else if (head$546.hasPrototype(Keyword$352) && unwrapSyntax$223(keyword$554) === 'var' && rest$547[0]) {
                    var vsRes$618 = enforestVarStatement$377(rest$547, context$544, false);
                    if (vsRes$618) {
                        return step$545(VariableStatement$367.create(head$546, vsRes$618.result), vsRes$618.rest);
                    }
                } else if (head$546.hasPrototype(Keyword$352) && unwrapSyntax$223(keyword$554) === 'let' && rest$547[0]) {
                    var vsRes$618 = enforestVarStatement$377(rest$547, context$544, true);
                    if (vsRes$618) {
                        return step$545(LetStatement$368.create(head$546, vsRes$618.result), vsRes$618.rest);
                    }
                } else if (head$546.hasPrototype(Keyword$352) && unwrapSyntax$223(keyword$554) === 'const' && rest$547[0]) {
                    var vsRes$618 = enforestVarStatement$377(rest$547, context$544, true);
                    if (vsRes$618) {
                        return step$545(ConstStatement$369.create(head$546, vsRes$618.result), vsRes$618.rest);
                    }
                } else if (head$546.hasPrototype(Keyword$352) && unwrapSyntax$223(keyword$554) === 'for' && rest$547[0] && rest$547[0].token.value === '()') {
                    return step$545(ForStatement$374.create(keyword$554, rest$547[0]), rest$547.slice(1));
                }
            } else {
                assert$221(head$546 && head$546.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$546.token.type === parser$214.Token.Identifier || head$546.token.type === parser$214.Token.Keyword || head$546.token.type === parser$214.Token.Punctuator) && context$544.env.has(resolve$328(head$546))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$619 = fresh$334();
                    var transformerContext$620 = makeExpanderContext$388(_$213.defaults({ mark: newMark$619 }, context$544));
                    // pull the macro transformer out the environment
                    var mac$617 = context$544.env.get(resolve$328(head$546));
                    var transformer$621 = mac$617.fn;
                    if (expandCount$324 >= maxExpands$325) {
                        return {
                            result: head$546,
                            rest: rest$547
                        };
                    } else if (!builtinMode$323 && !mac$617.builtin) {
                        expandCount$324++;
                    }
                    // apply the transformer
                    try {
                        var rt$622 = transformer$621([head$546].concat(rest$547), transformerContext$620);
                    } catch (e$623) {
                        if (e$623.type && e$623.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$624 = '`' + rest$547.slice(0, 5).map(function (stx$625) {
                                    return stx$625.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$222('macro', 'Macro `' + head$546.token.value + '` could not be matched with ' + argumentString$624, head$546);
                        } else {
                            // just rethrow it
                            throw e$623;
                        }
                    }
                    if (!Array.isArray(rt$622.result)) {
                        throwSyntaxError$222('enforest', 'Macro must return a syntax array', head$546);
                    }
                    if (rt$622.result.length > 0) {
                        var adjustedResult$626 = adjustLineContext$378(rt$622.result, head$546);
                        adjustedResult$626[0].token.leadingComments = head$546.token.leadingComments;
                        return step$545(adjustedResult$626[0], adjustedResult$626.slice(1).concat(rt$622.rest));
                    } else {
                        return step$545(Empty$372.create(), rt$622.rest);
                    }
                }    // anon macro definition
                else if (head$546.token.type === parser$214.Token.Identifier && head$546.token.value === 'macro' && rest$547[0] && rest$547[0].token.value === '{}') {
                    return step$545(AnonMacro$361.create(rest$547[0].expose().token.inner), rest$547.slice(1));
                }    // macro definition
                else if (head$546.token.type === parser$214.Token.Identifier && head$546.token.value === 'macro' && rest$547[0] && (rest$547[0].token.type === parser$214.Token.Identifier || rest$547[0].token.type === parser$214.Token.Keyword || rest$547[0].token.type === parser$214.Token.Punctuator) && rest$547[1] && rest$547[1].token.type === parser$214.Token.Delimiter && rest$547[1].token.value === '{}') {
                    return step$545(Macro$360.create(rest$547[0], rest$547[1].expose().token.inner), rest$547.slice(2));
                }    // module definition
                else if (unwrapSyntax$223(head$546) === 'module' && rest$547[0] && rest$547[0].token.value === '{}') {
                    return step$545(Module$371.create(rest$547[0]), rest$547.slice(1));
                }    // function definition
                else if (head$546.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$546) === 'function' && rest$547[0] && rest$547[0].token.type === parser$214.Token.Identifier && rest$547[1] && rest$547[1].token.type === parser$214.Token.Delimiter && rest$547[1].token.value === '()' && rest$547[2] && rest$547[2].token.type === parser$214.Token.Delimiter && rest$547[2].token.value === '{}') {
                    rest$547[1].token.inner = rest$547[1].expose().token.inner;
                    rest$547[2].token.inner = rest$547[2].expose().token.inner;
                    return step$545(NamedFun$356.create(head$546, null, rest$547[0], rest$547[1], rest$547[2]), rest$547.slice(3));
                }    // generator function definition
                else if (head$546.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$546) === 'function' && rest$547[0] && rest$547[0].token.type === parser$214.Token.Punctuator && rest$547[0].token.value === '*' && rest$547[1] && rest$547[1].token.type === parser$214.Token.Identifier && rest$547[2] && rest$547[2].token.type === parser$214.Token.Delimiter && rest$547[2].token.value === '()' && rest$547[3] && rest$547[3].token.type === parser$214.Token.Delimiter && rest$547[3].token.value === '{}') {
                    rest$547[2].token.inner = rest$547[2].expose().token.inner;
                    rest$547[3].token.inner = rest$547[3].expose().token.inner;
                    return step$545(NamedFun$356.create(head$546, rest$547[0], rest$547[1], rest$547[2], rest$547[3]), rest$547.slice(4));
                }    // anonymous function definition
                else if (head$546.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$546) === 'function' && rest$547[0] && rest$547[0].token.type === parser$214.Token.Delimiter && rest$547[0].token.value === '()' && rest$547[1] && rest$547[1].token.type === parser$214.Token.Delimiter && rest$547[1].token.value === '{}') {
                    rest$547[0].token.inner = rest$547[0].expose().token.inner;
                    rest$547[1].token.inner = rest$547[1].expose().token.inner;
                    return step$545(AnonFun$357.create(head$546, null, rest$547[0], rest$547[1]), rest$547.slice(2));
                }    // anonymous generator function definition
                else if (head$546.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$546) === 'function' && rest$547[0] && rest$547[0].token.type === parser$214.Token.Punctuator && rest$547[0].token.value === '*' && rest$547[1] && rest$547[1].token.type === parser$214.Token.Delimiter && rest$547[1].token.value === '()' && rest$547[2] && rest$547[2].token.type === parser$214.Token.Delimiter && rest$547[2].token.value === '{}') {
                    rest$547[1].token.inner = rest$547[1].expose().token.inner;
                    rest$547[2].token.inner = rest$547[2].expose().token.inner;
                    return step$545(AnonFun$357.create(head$546, rest$547[0], rest$547[1], rest$547[2]), rest$547.slice(3));
                }    // arrow function
                else if ((head$546.token.type === parser$214.Token.Delimiter && head$546.token.value === '()' || head$546.token.type === parser$214.Token.Identifier) && rest$547[0] && rest$547[0].token.type === parser$214.Token.Punctuator && rest$547[0].token.value === '=>' && rest$547[1] && rest$547[1].token.type === parser$214.Token.Delimiter && rest$547[1].token.value === '{}') {
                    return step$545(ArrowFun$358.create(head$546, rest$547[0], rest$547[1]), rest$547.slice(2));
                }    // catch statement
                else if (head$546.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$546) === 'catch' && rest$547[0] && rest$547[0].token.type === parser$214.Token.Delimiter && rest$547[0].token.value === '()' && rest$547[1] && rest$547[1].token.type === parser$214.Token.Delimiter && rest$547[1].token.value === '{}') {
                    rest$547[0].token.inner = rest$547[0].expose().token.inner;
                    rest$547[1].token.inner = rest$547[1].expose().token.inner;
                    return step$545(CatchClause$370.create(head$546, rest$547[0], rest$547[1]), rest$547.slice(2));
                }    // this expression
                else if (head$546.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$546) === 'this') {
                    return step$545(ThisExpression$342.create(head$546), rest$547);
                }    // literal
                else if (head$546.token.type === parser$214.Token.NumericLiteral || head$546.token.type === parser$214.Token.StringLiteral || head$546.token.type === parser$214.Token.BooleanLiteral || head$546.token.type === parser$214.Token.RegularExpression || head$546.token.type === parser$214.Token.NullLiteral) {
                    return step$545(Lit$343.create(head$546), rest$547);
                }    // export
                else if (head$546.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$546) === 'export' && rest$547[0] && (rest$547[0].token.type === parser$214.Token.Identifier || rest$547[0].token.type === parser$214.Token.Keyword || rest$547[0].token.type === parser$214.Token.Punctuator)) {
                    return step$545(Export$373.create(rest$547[0]), rest$547.slice(1));
                }    // identifier
                else if (head$546.token.type === parser$214.Token.Identifier) {
                    return step$545(Id$355.create(head$546), rest$547);
                }    // punctuator
                else if (head$546.token.type === parser$214.Token.Punctuator) {
                    return step$545(Punc$353.create(head$546), rest$547);
                } else if (head$546.token.type === parser$214.Token.Keyword && unwrapSyntax$223(head$546) === 'with') {
                    throwSyntaxError$222('enforest', 'with is not supported in sweet.js', head$546);
                }    // keyword
                else if (head$546.token.type === parser$214.Token.Keyword) {
                    return step$545(Keyword$352.create(head$546), rest$547);
                }    // Delimiter
                else if (head$546.token.type === parser$214.Token.Delimiter) {
                    return step$545(Delimiter$354.create(head$546.expose()), rest$547);
                }    // end of file
                else if (head$546.token.type === parser$214.Token.EOF) {
                    assert$221(rest$547.length === 0, 'nothing should be after an EOF');
                    return step$545(EOF$338.create(head$546), []);
                } else {
                    // todo: are we missing cases?
                    assert$221(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$546,
                rest: rest$547
            };
        }
        return step$545(toks$543[0], toks$543.slice(1));
    }
    function get_expression$380(stx$627, context$628) {
        var res$629 = enforest$379(stx$627, context$628);
        if (!res$629.result.hasPrototype(Expr$340)) {
            return {
                result: null,
                rest: stx$627
            };
        }
        return res$629;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$381(newMark$630, env$631) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$632(match$633) {
            if (match$633.level === 0) {
                // replace the match property with the marked syntax
                match$633.match = _$213.map(match$633.match, function (stx$634) {
                    return stx$634.mark(newMark$630);
                });
            } else {
                _$213.each(match$633.match, function (match$635) {
                    dfs$632(match$635);
                });
            }
        }
        _$213.keys(env$631).forEach(function (key$636) {
            dfs$632(env$631[key$636]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$382(mac$637, context$638) {
        var body$639 = mac$637.body;
        // raw function primitive form
        if (!(body$639[0] && body$639[0].token.type === parser$214.Token.Keyword && body$639[0].token.value === 'function')) {
            throwSyntaxError$222('load macro', 'Primitive macro form must contain a function for the macro body', body$639);
        }
        var stub$640 = parser$214.read('()');
        stub$640[0].token.inner = body$639;
        var expanded$641 = expand$387(stub$640, context$638);
        expanded$641 = expanded$641[0].destruct().concat(expanded$641[1].eof);
        var flattend$642 = flatten$390(expanded$641);
        var bodyCode$643 = codegen$220.generate(parser$214.parse(flattend$642));
        var macroFn$644 = scopedEval$313(bodyCode$643, {
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
                __fresh: fresh$334,
                _: _$213,
                patternModule: patternModule$218,
                getTemplate: function (id$645) {
                    return cloneSyntaxArray$383(context$638.templateMap.get(id$645));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$381,
                mergeMatches: function (newMatch$646, oldMatch$647) {
                    newMatch$646.patternEnv = _$213.extend({}, oldMatch$647.patternEnv, newMatch$646.patternEnv);
                    return newMatch$646;
                }
            });
        return macroFn$644;
    }
    function cloneSyntaxArray$383(arr$648) {
        return arr$648.map(function (stx$649) {
            var o$650 = syntaxFromToken$321(_$213.clone(stx$649.token), stx$649);
            if (o$650.token.type === parser$214.Token.Delimiter) {
                o$650.token.inner = cloneSyntaxArray$383(o$650.token.inner);
            }
            return o$650;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$384(stx$651, context$652) {
        assert$221(context$652, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$651.length === 0) {
            return {
                terms: [],
                context: context$652
            };
        }
        assert$221(stx$651[0].token, 'expecting a syntax object');
        var f$653 = enforest$379(stx$651, context$652);
        // head :: TermTree
        var head$654 = f$653.result;
        // rest :: [Syntax]
        var rest$655 = f$653.rest;
        if (head$654.hasPrototype(Macro$360) && expandCount$324 < maxExpands$325) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$657 = loadMacroDef$382(head$654, context$652);
            addToDefinitionCtx$385([head$654.name], context$652.defscope, false);
            context$652.env.set(resolve$328(head$654.name), {
                fn: macroDefinition$657,
                builtin: builtinMode$323
            });
            return expandToTermTree$384(rest$655, context$652);
        }
        if (head$654.hasPrototype(LetMacro$359) && expandCount$324 < maxExpands$325) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$657 = loadMacroDef$382(head$654, context$652);
            var freshName$658 = fresh$334();
            var renamedName$659 = head$654.name.rename(head$654.name, freshName$658);
            rest$655 = _$213.map(rest$655, function (stx$660) {
                return stx$660.rename(head$654.name, freshName$658);
            });
            head$654.name = renamedName$659;
            context$652.env.set(resolve$328(head$654.name), {
                fn: macroDefinition$657,
                builtin: builtinMode$323
            });
            return expandToTermTree$384(rest$655, context$652);
        }
        if (head$654.hasPrototype(NamedFun$356)) {
            addToDefinitionCtx$385([head$654.name], context$652.defscope, true);
        }
        if (head$654.hasPrototype(VariableStatement$367)) {
            addToDefinitionCtx$385(_$213.map(head$654.decls, function (decl$661) {
                return decl$661.ident;
            }), context$652.defscope, true);
        }
        if (head$654.hasPrototype(Block$345) && head$654.body.hasPrototype(Delimiter$354)) {
            head$654.body.delim.token.inner.forEach(function (term$662) {
                if (term$662.hasPrototype(VariableStatement$367)) {
                    addToDefinitionCtx$385(_$213.map(term$662.decls, function (decl$663) {
                        return decl$663.ident;
                    }), context$652.defscope, true);
                }
            });
        }
        if (head$654.hasPrototype(Delimiter$354)) {
            head$654.delim.token.inner.forEach(function (term$664) {
                if (term$664.hasPrototype(VariableStatement$367)) {
                    addToDefinitionCtx$385(_$213.map(term$664.decls, function (decl$665) {
                        return decl$665.ident;
                    }), context$652.defscope, true);
                }
            });
        }
        if (head$654.hasPrototype(ForStatement$374)) {
            head$654.cond.expose();
            var forCond$666 = head$654.cond.token.inner;
            if (forCond$666[0] && resolve$328(forCond$666[0]) === 'let' && forCond$666[1] && forCond$666[1].token.type === parser$214.Token.Identifier) {
                var letNew$667 = fresh$334();
                var letId$668 = forCond$666[1];
                forCond$666 = forCond$666.map(function (stx$669) {
                    return stx$669.rename(letId$668, letNew$667);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$654.cond.token.inner = expand$387([forCond$666[0]], context$652).concat(expand$387(forCond$666.slice(1), context$652));
                // nice and easy case: `for (...) { ... }`
                if (rest$655[0] && rest$655[0].token.value === '{}') {
                    rest$655[0] = rest$655[0].rename(letId$668, letNew$667);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$670 = enforest$379(rest$655, context$652);
                    var renamedBodyTerm$671 = bodyEnf$670.result.rename(letId$668, letNew$667);
                    var forTrees$672 = expandToTermTree$384(bodyEnf$670.rest, context$652);
                    return {
                        terms: [
                            head$654,
                            renamedBodyTerm$671
                        ].concat(forTrees$672.terms),
                        context: forTrees$672.context
                    };
                }
            } else {
                head$654.cond.token.inner = expand$387(head$654.cond.token.inner, context$652);
            }
        }
        var trees$656 = expandToTermTree$384(rest$655, context$652);
        return {
            terms: [head$654].concat(trees$656.terms),
            context: trees$656.context
        };
    }
    function addToDefinitionCtx$385(idents$673, defscope$674, skipRep$675) {
        assert$221(idents$673 && idents$673.length > 0, 'expecting some variable identifiers');
        skipRep$675 = skipRep$675 || false;
        _$213.each(idents$673, function (id$676) {
            var skip$677 = false;
            if (skipRep$675) {
                var declRepeat$678 = _$213.find(defscope$674, function (def$679) {
                        return def$679.id.token.value === id$676.token.value && arraysEqual$329(marksof$327(def$679.id.context), marksof$327(id$676.context));
                    });
                skip$677 = typeof declRepeat$678 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$677) {
                var name$680 = fresh$334();
                defscope$674.push({
                    id: id$676,
                    name: name$680
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$386(term$681, context$682) {
        assert$221(context$682 && context$682.env, 'environment map is required');
        if (term$681.hasPrototype(ArrayLiteral$346)) {
            term$681.array.delim.token.inner = expand$387(term$681.array.delim.expose().token.inner, context$682);
            return term$681;
        } else if (term$681.hasPrototype(Block$345)) {
            term$681.body.delim.token.inner = expand$387(term$681.body.delim.expose().token.inner, context$682);
            return term$681;
        } else if (term$681.hasPrototype(ParenExpression$347)) {
            term$681.expr.delim.token.inner = expand$387(term$681.expr.delim.expose().token.inner, context$682);
            return term$681;
        } else if (term$681.hasPrototype(Call$363)) {
            term$681.fun = expandTermTreeToFinal$386(term$681.fun, context$682);
            term$681.args = _$213.map(term$681.args, function (arg$683) {
                return expandTermTreeToFinal$386(arg$683, context$682);
            });
            return term$681;
        } else if (term$681.hasPrototype(UnaryOp$348)) {
            term$681.expr = expandTermTreeToFinal$386(term$681.expr, context$682);
            return term$681;
        } else if (term$681.hasPrototype(BinOp$350)) {
            term$681.left = expandTermTreeToFinal$386(term$681.left, context$682);
            term$681.right = expandTermTreeToFinal$386(term$681.right, context$682);
            return term$681;
        } else if (term$681.hasPrototype(ObjGet$365)) {
            term$681.right.delim.token.inner = expand$387(term$681.right.delim.expose().token.inner, context$682);
            return term$681;
        } else if (term$681.hasPrototype(ObjDotGet$364)) {
            term$681.left = expandTermTreeToFinal$386(term$681.left, context$682);
            term$681.right = expandTermTreeToFinal$386(term$681.right, context$682);
            return term$681;
        } else if (term$681.hasPrototype(VariableDeclaration$366)) {
            if (term$681.init) {
                term$681.init = expandTermTreeToFinal$386(term$681.init, context$682);
            }
            return term$681;
        } else if (term$681.hasPrototype(VariableStatement$367)) {
            term$681.decls = _$213.map(term$681.decls, function (decl$684) {
                return expandTermTreeToFinal$386(decl$684, context$682);
            });
            return term$681;
        } else if (term$681.hasPrototype(Delimiter$354)) {
            // expand inside the delimiter and then continue on
            term$681.delim.token.inner = expand$387(term$681.delim.expose().token.inner, context$682);
            return term$681;
        } else if (term$681.hasPrototype(NamedFun$356) || term$681.hasPrototype(AnonFun$357) || term$681.hasPrototype(CatchClause$370) || term$681.hasPrototype(ArrowFun$358) || term$681.hasPrototype(Module$371)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$685 = [];
            var bodyContext$686 = makeExpanderContext$388(_$213.defaults({ defscope: newDef$685 }, context$682));
            var paramSingleIdent$687 = term$681.params && term$681.params.token.type === parser$214.Token.Identifier;
            if (term$681.params && term$681.params.token.type === parser$214.Token.Delimiter) {
                var params$694 = term$681.params.expose();
            } else if (paramSingleIdent$687) {
                var params$694 = term$681.params;
            } else {
                var params$694 = syn$215.makeDelim('()', [], null);
            }
            if (Array.isArray(term$681.body)) {
                var bodies$695 = syn$215.makeDelim('{}', term$681.body, null);
            } else {
                var bodies$695 = term$681.body;
            }
            bodies$695 = bodies$695.addDefCtx(newDef$685);
            var paramNames$688 = _$213.map(getParamIdentifiers$336(params$694), function (param$696) {
                    var freshName$697 = fresh$334();
                    return {
                        freshName: freshName$697,
                        originalParam: param$696,
                        renamedParam: param$696.rename(param$696, freshName$697)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$689 = _$213.reduce(paramNames$688, function (accBody$698, p$699) {
                    return accBody$698.rename(p$699.originalParam, p$699.freshName);
                }, bodies$695);
            renamedBody$689 = renamedBody$689.expose();
            var expandedResult$690 = expandToTermTree$384(renamedBody$689.token.inner, bodyContext$686);
            var bodyTerms$691 = expandedResult$690.terms;
            var renamedParams$692 = _$213.map(paramNames$688, function (p$700) {
                    return p$700.renamedParam;
                });
            if (paramSingleIdent$687) {
                var flatArgs$701 = renamedParams$692[0];
            } else {
                var flatArgs$701 = syn$215.makeDelim('()', joinSyntax$322(renamedParams$692, ','), term$681.params);
            }
            var expandedArgs$693 = expand$387([flatArgs$701], bodyContext$686);
            assert$221(expandedArgs$693.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$681.params) {
                term$681.params = expandedArgs$693[0];
            }
            bodyTerms$691 = _$213.map(bodyTerms$691, function (bodyTerm$702) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$703 = bodyTerm$702.addDefCtx(newDef$685);
                // finish expansion
                return expandTermTreeToFinal$386(termWithCtx$703, expandedResult$690.context);
            });
            if (term$681.hasPrototype(Module$371)) {
                bodyTerms$691 = _$213.filter(bodyTerms$691, function (bodyTerm$704) {
                    if (bodyTerm$704.hasPrototype(Export$373)) {
                        term$681.exports.push(bodyTerm$704);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$689.token.inner = bodyTerms$691;
            if (Array.isArray(term$681.body)) {
                term$681.body = renamedBody$689.token.inner;
            } else {
                term$681.body = renamedBody$689;
            }
            // and continue expand the rest
            return term$681;
        }
        // the term is fine as is
        return term$681;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$387(stx$705, context$706) {
        assert$221(context$706, 'must provide an expander context');
        var trees$707 = expandToTermTree$384(stx$705, context$706);
        return _$213.map(trees$707.terms, function (term$708) {
            return expandTermTreeToFinal$386(term$708, trees$707.context);
        });
    }
    function makeExpanderContext$388(o$709) {
        o$709 = o$709 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$709.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$709.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$709.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$709.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$389(stx$710, builtinSource$711, _maxExpands$712) {
        var env$713 = new Map();
        var params$714 = [];
        var context$715, builtInContext$716 = makeExpanderContext$388({ env: env$713 });
        maxExpands$325 = _maxExpands$712 || Infinity;
        expandCount$324 = 0;
        if (builtinSource$711) {
            var builtinRead$719 = parser$214.read(builtinSource$711);
            builtinRead$719 = [
                syn$215.makeIdent('module', null),
                syn$215.makeDelim('{}', builtinRead$719, null)
            ];
            builtinMode$323 = true;
            var builtinRes$720 = expand$387(builtinRead$719, builtInContext$716);
            builtinMode$323 = false;
            params$714 = _$213.map(builtinRes$720[0].exports, function (term$721) {
                return {
                    oldExport: term$721.name,
                    newParam: syn$215.makeIdent(term$721.name.token.value, null)
                };
            });
        }
        var modBody$717 = syn$215.makeDelim('{}', stx$710, null);
        modBody$717 = _$213.reduce(params$714, function (acc$722, param$723) {
            var newName$724 = fresh$334();
            env$713.set(resolve$328(param$723.newParam.rename(param$723.newParam, newName$724)), env$713.get(resolve$328(param$723.oldExport)));
            return acc$722.rename(param$723.newParam, newName$724);
        }, modBody$717);
        context$715 = makeExpanderContext$388({ env: env$713 });
        var res$718 = expand$387([
                syn$215.makeIdent('module', null),
                modBody$717
            ], context$715);
        res$718 = res$718[0].destruct();
        return flatten$390(res$718[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$390(stx$725) {
        return _$213.reduce(stx$725, function (acc$726, stx$727) {
            if (stx$727.token.type === parser$214.Token.Delimiter) {
                var exposed$728 = stx$727.expose();
                var openParen$729 = syntaxFromToken$321({
                        type: parser$214.Token.Punctuator,
                        value: stx$727.token.value[0],
                        range: stx$727.token.startRange,
                        sm_range: typeof stx$727.token.sm_startRange == 'undefined' ? stx$727.token.startRange : stx$727.token.sm_startRange,
                        lineNumber: stx$727.token.startLineNumber,
                        sm_lineNumber: typeof stx$727.token.sm_startLineNumber == 'undefined' ? stx$727.token.startLineNumber : stx$727.token.sm_startLineNumber,
                        lineStart: stx$727.token.startLineStart,
                        sm_lineStart: typeof stx$727.token.sm_startLineStart == 'undefined' ? stx$727.token.startLineStart : stx$727.token.sm_startLineStart
                    }, exposed$728);
                var closeParen$730 = syntaxFromToken$321({
                        type: parser$214.Token.Punctuator,
                        value: stx$727.token.value[1],
                        range: stx$727.token.endRange,
                        sm_range: typeof stx$727.token.sm_endRange == 'undefined' ? stx$727.token.endRange : stx$727.token.sm_endRange,
                        lineNumber: stx$727.token.endLineNumber,
                        sm_lineNumber: typeof stx$727.token.sm_endLineNumber == 'undefined' ? stx$727.token.endLineNumber : stx$727.token.sm_endLineNumber,
                        lineStart: stx$727.token.endLineStart,
                        sm_lineStart: typeof stx$727.token.sm_endLineStart == 'undefined' ? stx$727.token.endLineStart : stx$727.token.sm_endLineStart
                    }, exposed$728);
                if (stx$727.token.leadingComments) {
                    openParen$729.token.leadingComments = stx$727.token.leadingComments;
                }
                if (stx$727.token.trailingComments) {
                    openParen$729.token.trailingComments = stx$727.token.trailingComments;
                }
                return acc$726.concat(openParen$729).concat(flatten$390(exposed$728.token.inner)).concat(closeParen$730);
            }
            stx$727.token.sm_lineNumber = stx$727.token.sm_lineNumber ? stx$727.token.sm_lineNumber : stx$727.token.lineNumber;
            stx$727.token.sm_lineStart = stx$727.token.sm_lineStart ? stx$727.token.sm_lineStart : stx$727.token.lineStart;
            stx$727.token.sm_range = stx$727.token.sm_range ? stx$727.token.sm_range : stx$727.token.range;
            return acc$726.concat(stx$727);
        }, []);
    }
    exports$212.enforest = enforest$379;
    exports$212.expand = expandTopLevel$389;
    exports$212.resolve = resolve$328;
    exports$212.get_expression = get_expression$380;
    exports$212.makeExpanderContext = makeExpanderContext$388;
    exports$212.Expr = Expr$340;
    exports$212.VariableStatement = VariableStatement$367;
    exports$212.tokensToSyntax = syn$215.tokensToSyntax;
    exports$212.syntaxToTokens = syn$215.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map