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
                    var condRight$605 = condRes$603.rest;
                    if (truExpr$604.hasPrototype(Expr$340) && condRight$605[0] && unwrapSyntax$223(condRight$605[0]) === ':') {
                        var colon$606 = condRight$605[0];
                        var flsRes$607 = enforest$379(condRight$605.slice(1), context$544);
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
                    var arrowRes$610 = enforest$379(rest$547.slice(1), context$544);
                    if (arrowRes$610.result.hasPrototype(Expr$340)) {
                        return step$545(ArrowFun$358.create(delim$556, rest$547[0], arrowRes$610.result.destruct()), arrowRes$610.rest);
                    } else {
                        throwSyntaxError$222('enforest', 'Body of arrow function must be an expression', rest$547.slice(1));
                    }
                } else if (head$546.hasPrototype(Id$355) && rest$547[0] && rest$547[0].token.type === parser$214.Token.Punctuator && unwrapSyntax$223(rest$547[0]) === '=>') {
                    var res$611 = enforest$379(rest$547.slice(1), context$544);
                    if (res$611.result.hasPrototype(Expr$340)) {
                        return step$545(ArrowFun$358.create(id$558, rest$547[0], res$611.result.destruct()), res$611.rest);
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
                        var innerTerm$612 = get_expression$380(innerTokens$548, context$544);
                        if (innerTerm$612.result && innerTerm$612.result.hasPrototype(Expr$340)) {
                            return step$545(ParenExpression$347.create(head$546), rest$547);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$546.hasPrototype(Expr$340) && rest$547[0] && rest$547[1] && stxIsBinOp$376(rest$547[0])) {
                    var op$613 = rest$547[0];
                    var left$614 = head$546;
                    var bopRes$615 = enforest$379(rest$547.slice(1), context$544);
                    var right$616 = bopRes$615.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$616.hasPrototype(Expr$340)) {
                        return step$545(BinOp$350.create(op$613, left$614, right$616), bopRes$615.rest);
                    }
                } else if (head$546.hasPrototype(Punc$353) && stxIsUnaryOp$375(punc$562)) {
                    var unopRes$617 = enforest$379(rest$547, context$544);
                    if (unopRes$617.result.hasPrototype(Expr$340)) {
                        return step$545(UnaryOp$348.create(punc$562, unopRes$617.result), unopRes$617.rest);
                    }
                } else if (head$546.hasPrototype(Keyword$352) && stxIsUnaryOp$375(keyword$554)) {
                    var unopKeyres$618 = enforest$379(rest$547, context$544);
                    if (unopKeyres$618.result.hasPrototype(Expr$340)) {
                        return step$545(UnaryOp$348.create(keyword$554, unopKeyres$618.result), unopKeyres$618.rest);
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
                    var tempId$619 = fresh$334();
                    context$544.templateMap.set(tempId$619, rest$547[0].token.inner);
                    return step$545(syn$215.makeIdent('getTemplate', id$558), [syn$215.makeDelim('()', [syn$215.makeValue(tempId$619, id$558)], id$558)].concat(rest$547.slice(1)));
                } else if (head$546.hasPrototype(Keyword$352) && unwrapSyntax$223(keyword$554) === 'let' && (rest$547[0] && rest$547[0].token.type === parser$214.Token.Identifier || rest$547[0] && rest$547[0].token.type === parser$214.Token.Keyword || rest$547[0] && rest$547[0].token.type === parser$214.Token.Punctuator) && rest$547[1] && unwrapSyntax$223(rest$547[1]) === '=' && rest$547[2] && rest$547[2].token.value === 'macro') {
                    var mac$620 = enforest$379(rest$547.slice(2), context$544);
                    if (!mac$620.result.hasPrototype(AnonMacro$361)) {
                        throwSyntaxError$222('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$547.slice(2));
                    }
                    return step$545(LetMacro$359.create(rest$547[0], mac$620.result.body), mac$620.rest);
                } else if (head$546.hasPrototype(Keyword$352) && unwrapSyntax$223(keyword$554) === 'var' && rest$547[0]) {
                    var vsRes$621 = enforestVarStatement$377(rest$547, context$544, false);
                    if (vsRes$621) {
                        return step$545(VariableStatement$367.create(head$546, vsRes$621.result), vsRes$621.rest);
                    }
                } else if (head$546.hasPrototype(Keyword$352) && unwrapSyntax$223(keyword$554) === 'let' && rest$547[0]) {
                    var lsRes$622 = enforestVarStatement$377(rest$547, context$544, true);
                    if (lsRes$622) {
                        return step$545(LetStatement$368.create(head$546, lsRes$622.result), lsRes$622.rest);
                    }
                } else if (head$546.hasPrototype(Keyword$352) && unwrapSyntax$223(keyword$554) === 'const' && rest$547[0]) {
                    var csRes$623 = enforestVarStatement$377(rest$547, context$544, true);
                    if (csRes$623) {
                        return step$545(ConstStatement$369.create(head$546, csRes$623.result), csRes$623.rest);
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
                    var newMark$624 = fresh$334();
                    var transformerContext$625 = makeExpanderContext$388(_$213.defaults({ mark: newMark$624 }, context$544));
                    // pull the macro transformer out the environment
                    var macroObj$626 = context$544.env.get(resolve$328(head$546));
                    var transformer$627 = macroObj$626.fn;
                    if (expandCount$324 >= maxExpands$325) {
                        return {
                            result: head$546,
                            rest: rest$547
                        };
                    } else if (!builtinMode$323 && !macroObj$626.builtin) {
                        expandCount$324++;
                    }
                    // apply the transformer
                    var rt$628;
                    try {
                        rt$628 = transformer$627([head$546].concat(rest$547), transformerContext$625);
                    } catch (e$629) {
                        if (e$629.type && e$629.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$630 = '`' + rest$547.slice(0, 5).map(function (stx$631) {
                                    return stx$631.token.value;
                                }).join(' ') + '...`';
                            throwSyntaxError$222('macro', 'Macro `' + head$546.token.value + '` could not be matched with ' + argumentString$630, head$546);
                        } else {
                            // just rethrow it
                            throw e$629;
                        }
                    }
                    if (!Array.isArray(rt$628.result)) {
                        throwSyntaxError$222('enforest', 'Macro must return a syntax array', head$546);
                    }
                    if (rt$628.result.length > 0) {
                        var adjustedResult$632 = adjustLineContext$378(rt$628.result, head$546);
                        adjustedResult$632[0].token.leadingComments = head$546.token.leadingComments;
                        return step$545(adjustedResult$632[0], adjustedResult$632.slice(1).concat(rt$628.rest));
                    } else {
                        return step$545(Empty$372.create(), rt$628.rest);
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
    function get_expression$380(stx$633, context$634) {
        var res$635 = enforest$379(stx$633, context$634);
        if (!res$635.result.hasPrototype(Expr$340)) {
            return {
                result: null,
                rest: stx$633
            };
        }
        return res$635;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$381(newMark$636, env$637) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$638(match$639) {
            if (match$639.level === 0) {
                // replace the match property with the marked syntax
                match$639.match = _$213.map(match$639.match, function (stx$640) {
                    return stx$640.mark(newMark$636);
                });
            } else {
                _$213.each(match$639.match, function (match$641) {
                    dfs$638(match$641);
                });
            }
        }
        _$213.keys(env$637).forEach(function (key$642) {
            dfs$638(env$637[key$642]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$382(mac$643, context$644) {
        var body$645 = mac$643.body;
        // raw function primitive form
        if (!(body$645[0] && body$645[0].token.type === parser$214.Token.Keyword && body$645[0].token.value === 'function')) {
            throwSyntaxError$222('load macro', 'Primitive macro form must contain a function for the macro body', body$645);
        }
        var stub$646 = parser$214.read('()');
        stub$646[0].token.inner = body$645;
        var expanded$647 = expand$387(stub$646, context$644);
        expanded$647 = expanded$647[0].destruct().concat(expanded$647[1].eof);
        var flattend$648 = flatten$390(expanded$647);
        var bodyCode$649 = codegen$220.generate(parser$214.parse(flattend$648));
        var macroFn$650 = scopedEval$313(bodyCode$649, {
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
                getTemplate: function (id$651) {
                    return cloneSyntaxArray$383(context$644.templateMap.get(id$651));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$381,
                mergeMatches: function (newMatch$652, oldMatch$653) {
                    newMatch$652.patternEnv = _$213.extend({}, oldMatch$653.patternEnv, newMatch$652.patternEnv);
                    return newMatch$652;
                }
            });
        return macroFn$650;
    }
    function cloneSyntaxArray$383(arr$654) {
        return arr$654.map(function (stx$655) {
            var o$656 = syntaxFromToken$321(_$213.clone(stx$655.token), stx$655);
            if (o$656.token.type === parser$214.Token.Delimiter) {
                o$656.token.inner = cloneSyntaxArray$383(o$656.token.inner);
            }
            return o$656;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$384(stx$657, context$658) {
        assert$221(context$658, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$657.length === 0) {
            return {
                terms: [],
                context: context$658
            };
        }
        assert$221(stx$657[0].token, 'expecting a syntax object');
        var f$659 = enforest$379(stx$657, context$658);
        // head :: TermTree
        var head$660 = f$659.result;
        // rest :: [Syntax]
        var rest$661 = f$659.rest;
        var macroDefinition$662;
        if (head$660.hasPrototype(Macro$360) && expandCount$324 < maxExpands$325) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$662 = loadMacroDef$382(head$660, context$658);
            addToDefinitionCtx$385([head$660.name], context$658.defscope, false);
            context$658.env.set(resolve$328(head$660.name), {
                fn: macroDefinition$662,
                builtin: builtinMode$323
            });
            return expandToTermTree$384(rest$661, context$658);
        }
        if (head$660.hasPrototype(LetMacro$359) && expandCount$324 < maxExpands$325) {
            // load the macro definition into the environment and continue expanding
            macroDefinition$662 = loadMacroDef$382(head$660, context$658);
            var freshName$664 = fresh$334();
            var renamedName$665 = head$660.name.rename(head$660.name, freshName$664);
            rest$661 = _$213.map(rest$661, function (stx$666) {
                return stx$666.rename(head$660.name, freshName$664);
            });
            head$660.name = renamedName$665;
            context$658.env.set(resolve$328(head$660.name), {
                fn: macroDefinition$662,
                builtin: builtinMode$323
            });
            return expandToTermTree$384(rest$661, context$658);
        }
        if (head$660.hasPrototype(NamedFun$356)) {
            addToDefinitionCtx$385([head$660.name], context$658.defscope, true);
        }
        if (head$660.hasPrototype(VariableStatement$367)) {
            addToDefinitionCtx$385(_$213.map(head$660.decls, function (decl$667) {
                return decl$667.ident;
            }), context$658.defscope, true);
        }
        if (head$660.hasPrototype(Block$345) && head$660.body.hasPrototype(Delimiter$354)) {
            head$660.body.delim.token.inner.forEach(function (term$668) {
                if (term$668.hasPrototype(VariableStatement$367)) {
                    addToDefinitionCtx$385(_$213.map(term$668.decls, function (decl$669) {
                        return decl$669.ident;
                    }), context$658.defscope, true);
                }
            });
        }
        if (head$660.hasPrototype(Delimiter$354)) {
            head$660.delim.token.inner.forEach(function (term$670) {
                if (term$670.hasPrototype(VariableStatement$367)) {
                    addToDefinitionCtx$385(_$213.map(term$670.decls, function (decl$671) {
                        return decl$671.ident;
                    }), context$658.defscope, true);
                }
            });
        }
        if (head$660.hasPrototype(ForStatement$374)) {
            head$660.cond.expose();
            var forCond$672 = head$660.cond.token.inner;
            if (forCond$672[0] && resolve$328(forCond$672[0]) === 'let' && forCond$672[1] && forCond$672[1].token.type === parser$214.Token.Identifier) {
                var letNew$673 = fresh$334();
                var letId$674 = forCond$672[1];
                forCond$672 = forCond$672.map(function (stx$675) {
                    return stx$675.rename(letId$674, letNew$673);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head$660.cond.token.inner = expand$387([forCond$672[0]], context$658).concat(expand$387(forCond$672.slice(1), context$658));
                // nice and easy case: `for (...) { ... }`
                if (rest$661[0] && rest$661[0].token.value === '{}') {
                    rest$661[0] = rest$661[0].rename(letId$674, letNew$673);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf$676 = enforest$379(rest$661, context$658);
                    var renamedBodyTerm$677 = bodyEnf$676.result.rename(letId$674, letNew$673);
                    var forTrees$678 = expandToTermTree$384(bodyEnf$676.rest, context$658);
                    return {
                        terms: [
                            head$660,
                            renamedBodyTerm$677
                        ].concat(forTrees$678.terms),
                        context: forTrees$678.context
                    };
                }
            } else {
                head$660.cond.token.inner = expand$387(head$660.cond.token.inner, context$658);
            }
        }
        var trees$663 = expandToTermTree$384(rest$661, context$658);
        return {
            terms: [head$660].concat(trees$663.terms),
            context: trees$663.context
        };
    }
    function addToDefinitionCtx$385(idents$679, defscope$680, skipRep$681) {
        assert$221(idents$679 && idents$679.length > 0, 'expecting some variable identifiers');
        skipRep$681 = skipRep$681 || false;
        _$213.each(idents$679, function (id$682) {
            var skip$683 = false;
            if (skipRep$681) {
                var declRepeat$684 = _$213.find(defscope$680, function (def$685) {
                        return def$685.id.token.value === id$682.token.value && arraysEqual$329(marksof$327(def$685.id.context), marksof$327(id$682.context));
                    });
                skip$683 = typeof declRepeat$684 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$683) {
                var name$686 = fresh$334();
                defscope$680.push({
                    id: id$682,
                    name: name$686
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$386(term$687, context$688) {
        assert$221(context$688 && context$688.env, 'environment map is required');
        if (term$687.hasPrototype(ArrayLiteral$346)) {
            term$687.array.delim.token.inner = expand$387(term$687.array.delim.expose().token.inner, context$688);
            return term$687;
        } else if (term$687.hasPrototype(Block$345)) {
            term$687.body.delim.token.inner = expand$387(term$687.body.delim.expose().token.inner, context$688);
            return term$687;
        } else if (term$687.hasPrototype(ParenExpression$347)) {
            term$687.expr.delim.token.inner = expand$387(term$687.expr.delim.expose().token.inner, context$688);
            return term$687;
        } else if (term$687.hasPrototype(Call$363)) {
            term$687.fun = expandTermTreeToFinal$386(term$687.fun, context$688);
            term$687.args = _$213.map(term$687.args, function (arg$689) {
                return expandTermTreeToFinal$386(arg$689, context$688);
            });
            return term$687;
        } else if (term$687.hasPrototype(UnaryOp$348)) {
            term$687.expr = expandTermTreeToFinal$386(term$687.expr, context$688);
            return term$687;
        } else if (term$687.hasPrototype(BinOp$350)) {
            term$687.left = expandTermTreeToFinal$386(term$687.left, context$688);
            term$687.right = expandTermTreeToFinal$386(term$687.right, context$688);
            return term$687;
        } else if (term$687.hasPrototype(ObjGet$365)) {
            term$687.right.delim.token.inner = expand$387(term$687.right.delim.expose().token.inner, context$688);
            return term$687;
        } else if (term$687.hasPrototype(ObjDotGet$364)) {
            term$687.left = expandTermTreeToFinal$386(term$687.left, context$688);
            term$687.right = expandTermTreeToFinal$386(term$687.right, context$688);
            return term$687;
        } else if (term$687.hasPrototype(VariableDeclaration$366)) {
            if (term$687.init) {
                term$687.init = expandTermTreeToFinal$386(term$687.init, context$688);
            }
            return term$687;
        } else if (term$687.hasPrototype(VariableStatement$367)) {
            term$687.decls = _$213.map(term$687.decls, function (decl$690) {
                return expandTermTreeToFinal$386(decl$690, context$688);
            });
            return term$687;
        } else if (term$687.hasPrototype(Delimiter$354)) {
            // expand inside the delimiter and then continue on
            term$687.delim.token.inner = expand$387(term$687.delim.expose().token.inner, context$688);
            return term$687;
        } else if (term$687.hasPrototype(NamedFun$356) || term$687.hasPrototype(AnonFun$357) || term$687.hasPrototype(CatchClause$370) || term$687.hasPrototype(ArrowFun$358) || term$687.hasPrototype(Module$371)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$691 = [];
            var bodyContext$692 = makeExpanderContext$388(_$213.defaults({ defscope: newDef$691 }, context$688));
            var paramSingleIdent$693 = term$687.params && term$687.params.token.type === parser$214.Token.Identifier;
            var params$694;
            if (term$687.params && term$687.params.token.type === parser$214.Token.Delimiter) {
                params$694 = term$687.params.expose();
            } else if (paramSingleIdent$693) {
                params$694 = term$687.params;
            } else {
                params$694 = syn$215.makeDelim('()', [], null);
            }
            var bodies$695;
            if (Array.isArray(term$687.body)) {
                bodies$695 = syn$215.makeDelim('{}', term$687.body, null);
            } else {
                bodies$695 = term$687.body;
            }
            bodies$695 = bodies$695.addDefCtx(newDef$691);
            var paramNames$696 = _$213.map(getParamIdentifiers$336(params$694), function (param$703) {
                    var freshName$704 = fresh$334();
                    return {
                        freshName: freshName$704,
                        originalParam: param$703,
                        renamedParam: param$703.rename(param$703, freshName$704)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$697 = _$213.reduce(paramNames$696, function (accBody$705, p$706) {
                    return accBody$705.rename(p$706.originalParam, p$706.freshName);
                }, bodies$695);
            renamedBody$697 = renamedBody$697.expose();
            var expandedResult$698 = expandToTermTree$384(renamedBody$697.token.inner, bodyContext$692);
            var bodyTerms$699 = expandedResult$698.terms;
            var renamedParams$700 = _$213.map(paramNames$696, function (p$707) {
                    return p$707.renamedParam;
                });
            var flatArgs$701;
            if (paramSingleIdent$693) {
                flatArgs$701 = renamedParams$700[0];
            } else {
                flatArgs$701 = syn$215.makeDelim('()', joinSyntax$322(renamedParams$700, ','), term$687.params);
            }
            var expandedArgs$702 = expand$387([flatArgs$701], bodyContext$692);
            assert$221(expandedArgs$702.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$687.params) {
                term$687.params = expandedArgs$702[0];
            }
            bodyTerms$699 = _$213.map(bodyTerms$699, function (bodyTerm$708) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$709 = bodyTerm$708.addDefCtx(newDef$691);
                // finish expansion
                return expandTermTreeToFinal$386(termWithCtx$709, expandedResult$698.context);
            });
            if (term$687.hasPrototype(Module$371)) {
                bodyTerms$699 = _$213.filter(bodyTerms$699, function (bodyTerm$710) {
                    if (bodyTerm$710.hasPrototype(Export$373)) {
                        term$687.exports.push(bodyTerm$710);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$697.token.inner = bodyTerms$699;
            if (Array.isArray(term$687.body)) {
                term$687.body = renamedBody$697.token.inner;
            } else {
                term$687.body = renamedBody$697;
            }
            // and continue expand the rest
            return term$687;
        }
        // the term is fine as is
        return term$687;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$387(stx$711, context$712) {
        assert$221(context$712, 'must provide an expander context');
        var trees$713 = expandToTermTree$384(stx$711, context$712);
        return _$213.map(trees$713.terms, function (term$714) {
            return expandTermTreeToFinal$386(term$714, trees$713.context);
        });
    }
    function makeExpanderContext$388(o$715) {
        o$715 = o$715 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$715.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$715.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$715.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$715.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$389(stx$716, builtinSource$717, _maxExpands$718) {
        var env$719 = new Map();
        var params$720 = [];
        var context$721, builtInContext$722 = makeExpanderContext$388({ env: env$719 });
        maxExpands$325 = _maxExpands$718 || Infinity;
        expandCount$324 = 0;
        if (builtinSource$717) {
            var builtinRead$725 = parser$214.read(builtinSource$717);
            builtinRead$725 = [
                syn$215.makeIdent('module', null),
                syn$215.makeDelim('{}', builtinRead$725, null)
            ];
            builtinMode$323 = true;
            var builtinRes$726 = expand$387(builtinRead$725, builtInContext$722);
            builtinMode$323 = false;
            params$720 = _$213.map(builtinRes$726[0].exports, function (term$727) {
                return {
                    oldExport: term$727.name,
                    newParam: syn$215.makeIdent(term$727.name.token.value, null)
                };
            });
        }
        var modBody$723 = syn$215.makeDelim('{}', stx$716, null);
        modBody$723 = _$213.reduce(params$720, function (acc$728, param$729) {
            var newName$730 = fresh$334();
            env$719.set(resolve$328(param$729.newParam.rename(param$729.newParam, newName$730)), env$719.get(resolve$328(param$729.oldExport)));
            return acc$728.rename(param$729.newParam, newName$730);
        }, modBody$723);
        context$721 = makeExpanderContext$388({ env: env$719 });
        var res$724 = expand$387([
                syn$215.makeIdent('module', null),
                modBody$723
            ], context$721);
        res$724 = res$724[0].destruct();
        return flatten$390(res$724[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$390(stx$731) {
        return _$213.reduce(stx$731, function (acc$732, stx$733) {
            if (stx$733.token.type === parser$214.Token.Delimiter) {
                var exposed$734 = stx$733.expose();
                var openParen$735 = syntaxFromToken$321({
                        type: parser$214.Token.Punctuator,
                        value: stx$733.token.value[0],
                        range: stx$733.token.startRange,
                        sm_range: typeof stx$733.token.sm_startRange == 'undefined' ? stx$733.token.startRange : stx$733.token.sm_startRange,
                        lineNumber: stx$733.token.startLineNumber,
                        sm_lineNumber: typeof stx$733.token.sm_startLineNumber == 'undefined' ? stx$733.token.startLineNumber : stx$733.token.sm_startLineNumber,
                        lineStart: stx$733.token.startLineStart,
                        sm_lineStart: typeof stx$733.token.sm_startLineStart == 'undefined' ? stx$733.token.startLineStart : stx$733.token.sm_startLineStart
                    }, exposed$734);
                var closeParen$736 = syntaxFromToken$321({
                        type: parser$214.Token.Punctuator,
                        value: stx$733.token.value[1],
                        range: stx$733.token.endRange,
                        sm_range: typeof stx$733.token.sm_endRange == 'undefined' ? stx$733.token.endRange : stx$733.token.sm_endRange,
                        lineNumber: stx$733.token.endLineNumber,
                        sm_lineNumber: typeof stx$733.token.sm_endLineNumber == 'undefined' ? stx$733.token.endLineNumber : stx$733.token.sm_endLineNumber,
                        lineStart: stx$733.token.endLineStart,
                        sm_lineStart: typeof stx$733.token.sm_endLineStart == 'undefined' ? stx$733.token.endLineStart : stx$733.token.sm_endLineStart
                    }, exposed$734);
                if (stx$733.token.leadingComments) {
                    openParen$735.token.leadingComments = stx$733.token.leadingComments;
                }
                if (stx$733.token.trailingComments) {
                    openParen$735.token.trailingComments = stx$733.token.trailingComments;
                }
                return acc$732.concat(openParen$735).concat(flatten$390(exposed$734.token.inner)).concat(closeParen$736);
            }
            stx$733.token.sm_lineNumber = stx$733.token.sm_lineNumber ? stx$733.token.sm_lineNumber : stx$733.token.lineNumber;
            stx$733.token.sm_lineStart = stx$733.token.sm_lineStart ? stx$733.token.sm_lineStart : stx$733.token.lineStart;
            stx$733.token.sm_range = stx$733.token.sm_range ? stx$733.token.sm_range : stx$733.token.range;
            return acc$732.concat(stx$733);
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