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
(function (root$93, factory$94) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$94(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$94);
    }
}(this, function (exports$95, _$96, parser$97, syn$98, es6$99, se$100, patternModule$101, gen$102) {
    'use strict';
    var codegen$103 = gen$102 || escodegen;
    // used to export "private" methods for unit testing
    exports$95._test = {};
    // some convenience monkey patching
    Object.prototype.create = function () {
        var o$231 = Object.create(this);
        if (typeof o$231.construct === 'function') {
            o$231.construct.apply(o$231, arguments);
        }
        return o$231;
    };
    Object.prototype.extend = function (properties$232) {
        var result$233 = Object.create(this);
        for (var prop$234 in properties$232) {
            if (properties$232.hasOwnProperty(prop$234)) {
                result$233[prop$234] = properties$232[prop$234];
            }
        }
        return result$233;
    };
    Object.prototype.hasPrototype = function (proto$235) {
        function F$236() {
        }
        F$236.prototype = proto$235;
        return this instanceof F$236;
    };
    // todo: add more message information
    function throwError$162(msg$237) {
        throw new Error(msg$237);
    }
    var scopedEval$163 = se$100.scopedEval;
    var Rename$164 = syn$98.Rename;
    var Mark$165 = syn$98.Mark;
    var Var$166 = syn$98.Var;
    var Def$167 = syn$98.Def;
    var isDef$168 = syn$98.isDef;
    var isMark$169 = syn$98.isMark;
    var isRename$170 = syn$98.isRename;
    var syntaxFromToken$171 = syn$98.syntaxFromToken;
    var mkSyntax$172 = syn$98.mkSyntax;
    function remdup$173(mark$238, mlist$239) {
        if (mark$238 === _$96.first(mlist$239)) {
            return _$96.rest(mlist$239, 1);
        }
        return [mark$238].concat(mlist$239);
    }
    // (CSyntax) -> [...Num]
    function marksof$174(ctx$240, stopName$241, originalName$242) {
        var mark$243, submarks$244;
        if (isMark$169(ctx$240)) {
            mark$243 = ctx$240.mark;
            submarks$244 = marksof$174(ctx$240.context, stopName$241, originalName$242);
            return remdup$173(mark$243, submarks$244);
        }
        if (isDef$168(ctx$240)) {
            return marksof$174(ctx$240.context, stopName$241, originalName$242);
        }
        if (isRename$170(ctx$240)) {
            if (stopName$241 === originalName$242 + '$' + ctx$240.name) {
                return [];
            }
            return marksof$174(ctx$240.context, stopName$241, originalName$242);
        }
        return [];
    }
    function resolve$175(stx$245) {
        return resolveCtx$179(stx$245.token.value, stx$245.context, [], []);
    }
    function arraysEqual$176(a$246, b$247) {
        if (a$246.length !== b$247.length) {
            return false;
        }
        for (var i$248 = 0; i$248 < a$246.length; i$248++) {
            if (a$246[i$248] !== b$247[i$248]) {
                return false;
            }
        }
        return true;
    }
    function renames$177(defctx$249, oldctx$250, originalName$251) {
        var acc$252 = oldctx$250;
        for (var i$253 = 0; i$253 < defctx$249.length; i$253++) {
            if (defctx$249[i$253].id.token.value === originalName$251) {
                acc$252 = Rename$164(defctx$249[i$253].id, defctx$249[i$253].name, acc$252, defctx$249);
            }
        }
        return acc$252;
    }
    function unionEl$178(arr$254, el$255) {
        if (arr$254.indexOf(el$255) === -1) {
            var res$256 = arr$254.slice(0);
            res$256.push(el$255);
            return res$256;
        }
        return arr$254;
    }
    // (Syntax) -> String
    function resolveCtx$179(originalName$257, ctx$258, stop_spine$259, stop_branch$260) {
        if (isMark$169(ctx$258)) {
            return resolveCtx$179(originalName$257, ctx$258.context, stop_spine$259, stop_branch$260);
        }
        if (isDef$168(ctx$258)) {
            if (stop_spine$259.indexOf(ctx$258.defctx) !== -1) {
                return resolveCtx$179(originalName$257, ctx$258.context, stop_spine$259, stop_branch$260);
            } else {
                return resolveCtx$179(originalName$257, renames$177(ctx$258.defctx, ctx$258.context, originalName$257), stop_spine$259, unionEl$178(stop_branch$260, ctx$258.defctx));
            }
        }
        if (isRename$170(ctx$258)) {
            if (originalName$257 === ctx$258.id.token.value) {
                var idName$261 = resolveCtx$179(ctx$258.id.token.value, ctx$258.id.context, stop_branch$260, stop_branch$260);
                var subName$262 = resolveCtx$179(originalName$257, ctx$258.context, unionEl$178(stop_spine$259, ctx$258.def), stop_branch$260);
                if (idName$261 === subName$262) {
                    var idMarks$263 = marksof$174(ctx$258.id.context, originalName$257 + '$' + ctx$258.name, originalName$257);
                    var subMarks$264 = marksof$174(ctx$258.context, originalName$257 + '$' + ctx$258.name, originalName$257);
                    if (arraysEqual$176(idMarks$263, subMarks$264)) {
                        return originalName$257 + '$' + ctx$258.name;
                    }
                }
            }
            return resolveCtx$179(originalName$257, ctx$258.context, unionEl$178(stop_spine$259, ctx$258.def), stop_branch$260);
        }
        return originalName$257;
    }
    var nextFresh$180 = 0;
    // fun () -> Num
    function fresh$181() {
        return nextFresh$180++;
    }
    ;
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$182(tojoin$265, punc$266) {
        if (tojoin$265.length === 0) {
            return [];
        }
        if (punc$266 === ' ') {
            return tojoin$265;
        }
        return _$96.reduce(_$96.rest(tojoin$265, 1), function (acc$267, join$268) {
            return acc$267.concat(mkSyntax$172(punc$266, parser$97.Token.Punctuator, join$268), join$268);
        }, [_$96.first(tojoin$265)]);
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$183(towrap$269, delimSyntax$270) {
        parser$97.assert(delimSyntax$270.token.type === parser$97.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$171({
            type: parser$97.Token.Delimiter,
            value: delimSyntax$270.token.value,
            inner: towrap$269,
            range: delimSyntax$270.token.range,
            startLineNumber: delimSyntax$270.token.startLineNumber,
            lineStart: delimSyntax$270.token.lineStart
        }, delimSyntax$270.context);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$184(argSyntax$271) {
        parser$97.assert(argSyntax$271.token.type === parser$97.Token.Delimiter, 'expecting delimiter for function params');
        return _$96.filter(argSyntax$271.token.inner, function (stx$272) {
            return stx$272.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$185 = {
            destruct: function () {
                return _$96.reduce(this.properties, _$96.bind(function (acc$273, prop$274) {
                    if (this[prop$274] && this[prop$274].hasPrototype(TermTree$185)) {
                        return acc$273.concat(this[prop$274].destruct());
                    } else if (this[prop$274] && this[prop$274].token && this[prop$274].token.inner) {
                        this[prop$274].token.inner = _$96.reduce(this[prop$274].token.inner, function (acc$275, t$276) {
                            if (t$276.hasPrototype(TermTree$185)) {
                                return acc$275.concat(t$276.destruct());
                            }
                            return acc$275.concat(t$276);
                        }, []);
                        return acc$273.concat(this[prop$274]);
                    } else if (this[prop$274]) {
                        return acc$273.concat(this[prop$274]);
                    } else {
                        return acc$273;
                    }
                }, this), []);
            }
        };
    var EOF$186 = TermTree$185.extend({
            properties: ['eof'],
            construct: function (e$277) {
                this.eof = e$277;
            }
        });
    var Statement$187 = TermTree$185.extend({
            construct: function () {
            }
        });
    var Expr$188 = TermTree$185.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$189 = Expr$188.extend({
            construct: function () {
            }
        });
    var ThisExpression$190 = PrimaryExpression$189.extend({
            properties: ['this'],
            construct: function (that$278) {
                this.this = that$278;
            }
        });
    var Lit$191 = PrimaryExpression$189.extend({
            properties: ['lit'],
            construct: function (l$279) {
                this.lit = l$279;
            }
        });
    exports$95._test.PropertyAssignment = PropertyAssignment$192;
    var PropertyAssignment$192 = TermTree$185.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$280, assignment$281) {
                this.propName = propName$280;
                this.assignment = assignment$281;
            }
        });
    var Block$193 = PrimaryExpression$189.extend({
            properties: ['body'],
            construct: function (body$282) {
                this.body = body$282;
            }
        });
    var ArrayLiteral$194 = PrimaryExpression$189.extend({
            properties: ['array'],
            construct: function (ar$283) {
                this.array = ar$283;
            }
        });
    var ParenExpression$195 = PrimaryExpression$189.extend({
            properties: ['expr'],
            construct: function (expr$284) {
                this.expr = expr$284;
            }
        });
    var UnaryOp$196 = Expr$188.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$285, expr$286) {
                this.op = op$285;
                this.expr = expr$286;
            }
        });
    var PostfixOp$197 = Expr$188.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$287, op$288) {
                this.expr = expr$287;
                this.op = op$288;
            }
        });
    var BinOp$198 = Expr$188.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$289, left$290, right$291) {
                this.op = op$289;
                this.left = left$290;
                this.right = right$291;
            }
        });
    var ConditionalExpression$199 = Expr$188.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$292, question$293, tru$294, colon$295, fls$296) {
                this.cond = cond$292;
                this.question = question$293;
                this.tru = tru$294;
                this.colon = colon$295;
                this.fls = fls$296;
            }
        });
    var Keyword$200 = TermTree$185.extend({
            properties: ['keyword'],
            construct: function (k$297) {
                this.keyword = k$297;
            }
        });
    var Punc$201 = TermTree$185.extend({
            properties: ['punc'],
            construct: function (p$298) {
                this.punc = p$298;
            }
        });
    var Delimiter$202 = TermTree$185.extend({
            properties: ['delim'],
            construct: function (d$299) {
                this.delim = d$299;
            }
        });
    var Id$203 = PrimaryExpression$189.extend({
            properties: ['id'],
            construct: function (id$300) {
                this.id = id$300;
            }
        });
    var NamedFun$204 = Expr$188.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$301, name$302, params$303, body$304) {
                this.keyword = keyword$301;
                this.name = name$302;
                this.params = params$303;
                this.body = body$304;
            }
        });
    var AnonFun$205 = Expr$188.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$305, params$306, body$307) {
                this.keyword = keyword$305;
                this.params = params$306;
                this.body = body$307;
            }
        });
    var LetMacro$206 = TermTree$185.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$308, body$309) {
                this.name = name$308;
                this.body = body$309;
            }
        });
    var Macro$207 = TermTree$185.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$310, body$311) {
                this.name = name$310;
                this.body = body$311;
            }
        });
    var AnonMacro$208 = TermTree$185.extend({
            properties: ['body'],
            construct: function (body$312) {
                this.body = body$312;
            }
        });
    var Const$209 = Expr$188.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$313, call$314) {
                this.newterm = newterm$313;
                this.call = call$314;
            }
        });
    var Call$210 = Expr$188.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$97.assert(this.fun.hasPrototype(TermTree$185), 'expecting a term tree in destruct of call');
                var that$315 = this;
                this.delim = syntaxFromToken$171(_$96.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$96.reduce(this.args, function (acc$316, term$317) {
                    parser$97.assert(term$317 && term$317.hasPrototype(TermTree$185), 'expecting term trees in destruct of Call');
                    var dst$318 = acc$316.concat(term$317.destruct());
                    // add all commas except for the last one
                    if (that$315.commas.length > 0) {
                        dst$318 = dst$318.concat(that$315.commas.shift());
                    }
                    return dst$318;
                }, []);
                return this.fun.destruct().concat(Delimiter$202.create(this.delim).destruct());
            },
            construct: function (funn$319, args$320, delim$321, commas$322) {
                parser$97.assert(Array.isArray(args$320), 'requires an array of arguments terms');
                this.fun = funn$319;
                this.args = args$320;
                this.delim = delim$321;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$322;
            }
        });
    var ObjDotGet$211 = Expr$188.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$323, dot$324, right$325) {
                this.left = left$323;
                this.dot = dot$324;
                this.right = right$325;
            }
        });
    var ObjGet$212 = Expr$188.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$326, right$327) {
                this.left = left$326;
                this.right = right$327;
            }
        });
    var VariableDeclaration$213 = TermTree$185.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$328, eqstx$329, init$330, comma$331) {
                this.ident = ident$328;
                this.eqstx = eqstx$329;
                this.init = init$330;
                this.comma = comma$331;
            }
        });
    var VariableStatement$214 = Statement$187.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$96.reduce(this.decls, function (acc$332, decl$333) {
                    return acc$332.concat(decl$333.destruct());
                }, []));
            },
            construct: function (varkw$334, decls$335) {
                parser$97.assert(Array.isArray(decls$335), 'decls must be an array');
                this.varkw = varkw$334;
                this.decls = decls$335;
            }
        });
    var CatchClause$215 = TermTree$185.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$336, params$337, body$338) {
                this.catchkw = catchkw$336;
                this.params = params$337;
                this.body = body$338;
            }
        });
    var Empty$216 = TermTree$185.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$217(stx$339) {
        var staticOperators$340 = [
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
        return _$96.contains(staticOperators$340, stx$339.token.value);
    }
    function stxIsBinOp$218(stx$341) {
        var staticOperators$342 = [
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
        return _$96.contains(staticOperators$342, stx$341.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$219(stx$343, env$344) {
        var decls$345 = [];
        var res$346 = enforest$221(stx$343, env$344);
        var result$347 = res$346.result;
        var rest$348 = res$346.rest;
        if (rest$348[0]) {
            var nextRes$349 = enforest$221(rest$348, env$344);
            // x = ...
            if (nextRes$349.result.hasPrototype(Punc$201) && nextRes$349.result.punc.token.value === '=') {
                var initializerRes$350 = enforest$221(nextRes$349.rest, env$344);
                if (initializerRes$350.rest[0]) {
                    var restRes$351 = enforest$221(initializerRes$350.rest, env$344);
                    // x = y + z, ...
                    if (restRes$351.result.hasPrototype(Punc$201) && restRes$351.result.punc.token.value === ',') {
                        decls$345.push(VariableDeclaration$213.create(result$347.id, nextRes$349.result.punc, initializerRes$350.result, restRes$351.result.punc));
                        var subRes$352 = enforestVarStatement$219(restRes$351.rest, env$344);
                        decls$345 = decls$345.concat(subRes$352.result);
                        rest$348 = subRes$352.rest;
                    } else {
                        decls$345.push(VariableDeclaration$213.create(result$347.id, nextRes$349.result.punc, initializerRes$350.result));
                        rest$348 = initializerRes$350.rest;    // x = y EOF
                    }
                } else {
                    decls$345.push(VariableDeclaration$213.create(result$347.id, nextRes$349.result.punc, initializerRes$350.result));    // x ,...;
                }
            } else if (nextRes$349.result.hasPrototype(Punc$201) && nextRes$349.result.punc.token.value === ',') {
                decls$345.push(VariableDeclaration$213.create(result$347.id, null, null, nextRes$349.result.punc));
                var subRes$352 = enforestVarStatement$219(nextRes$349.rest, env$344);
                decls$345 = decls$345.concat(subRes$352.result);
                rest$348 = subRes$352.rest;
            } else {
                if (result$347.hasPrototype(Id$203)) {
                    decls$345.push(VariableDeclaration$213.create(result$347.id));
                } else {
                    throwError$162('Expecting an identifier in variable declaration');
                }    // x EOF
            }
        } else {
            if (result$347.hasPrototype(Id$203)) {
                decls$345.push(VariableDeclaration$213.create(result$347.id));
            } else if (result$347.hasPrototype(BinOp$198) && result$347.op.token.value === 'in') {
                decls$345.push(VariableDeclaration$213.create(result$347.left.id, result$347.op, result$347.right));
            } else {
                throwError$162('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$345,
            rest: rest$348
        };
    }
    function adjustLineContext$220(stx$353, original$354) {
        var last$355 = stx$353[0] && typeof stx$353[0].token.range == 'undefined' ? original$354 : stx$353[0];
        return _$96.map(stx$353, function (stx$356) {
            if (typeof stx$356.token.range == 'undefined') {
                stx$356.token.range = last$355.token.range;
            }
            if (stx$356.token.type === parser$97.Token.Delimiter) {
                stx$356.token.sm_startLineNumber = original$354.token.lineNumber;
                stx$356.token.sm_endLineNumber = original$354.token.lineNumber;
                stx$356.token.sm_startLineStart = original$354.token.lineStart;
                stx$356.token.sm_endLineStart = original$354.token.lineStart;
                if (stx$356.token.inner.length > 0) {
                    stx$356.token.inner = adjustLineContext$220(stx$356.token.inner, original$354);
                }
                last$355 = stx$356;
                return stx$356;
            }
            stx$356.token.sm_lineNumber = original$354.token.lineNumber;
            stx$356.token.sm_lineStart = original$354.token.lineStart;
            last$355 = stx$356;
            return stx$356;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$221(toks$357, env$358) {
        env$358 = env$358 || new Map();
        parser$97.assert(toks$357.length > 0, 'enforest assumes there are tokens to work with');
        function step$359(head$360, rest$361) {
            var innerTokens$362;
            parser$97.assert(Array.isArray(rest$361), 'result must at least be an empty array');
            if (head$360.hasPrototype(TermTree$185)) {
                // function call
                var emp$365 = head$360.emp;
                var emp$365 = head$360.emp;
                var keyword$368 = head$360.keyword;
                var delim$370 = head$360.delim;
                var emp$365 = head$360.emp;
                var punc$373 = head$360.punc;
                var keyword$368 = head$360.keyword;
                var emp$365 = head$360.emp;
                var emp$365 = head$360.emp;
                var emp$365 = head$360.emp;
                var delim$370 = head$360.delim;
                var delim$370 = head$360.delim;
                var keyword$368 = head$360.keyword;
                var keyword$368 = head$360.keyword;
                if (head$360.hasPrototype(Expr$188) && (rest$361[0] && rest$361[0].token.type === parser$97.Token.Delimiter && rest$361[0].token.value === '()')) {
                    var argRes$398, enforestedArgs$399 = [], commas$400 = [];
                    rest$361[0].expose();
                    innerTokens$362 = rest$361[0].token.inner;
                    while (innerTokens$362.length > 0) {
                        argRes$398 = enforest$221(innerTokens$362, env$358);
                        enforestedArgs$399.push(argRes$398.result);
                        innerTokens$362 = argRes$398.rest;
                        if (innerTokens$362[0] && innerTokens$362[0].token.value === ',') {
                            commas$400.push(innerTokens$362[0]);
                            innerTokens$362 = innerTokens$362.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$401 = _$96.all(enforestedArgs$399, function (argTerm$402) {
                            return argTerm$402.hasPrototype(Expr$188);
                        });
                    if (innerTokens$362.length === 0 && argsAreExprs$401) {
                        return step$359(Call$210.create(head$360, enforestedArgs$399, rest$361[0], commas$400), rest$361.slice(1));
                    }
                } else if (head$360.hasPrototype(Expr$188) && (rest$361[0] && rest$361[0].token.value === '?')) {
                    var question$403 = rest$361[0];
                    var condRes$404 = enforest$221(rest$361.slice(1), env$358);
                    var truExpr$405 = condRes$404.result;
                    var right$406 = condRes$404.rest;
                    if (truExpr$405.hasPrototype(Expr$188) && right$406[0] && right$406[0].token.value === ':') {
                        var colon$407 = right$406[0];
                        var flsRes$408 = enforest$221(right$406.slice(1), env$358);
                        var flsExpr$409 = flsRes$408.result;
                        if (flsExpr$409.hasPrototype(Expr$188)) {
                            return step$359(ConditionalExpression$199.create(head$360, question$403, truExpr$405, colon$407, flsExpr$409), flsRes$408.rest);
                        }
                    }
                } else if (head$360.hasPrototype(Keyword$200) && (keyword$368.token.value === 'new' && rest$361[0])) {
                    var newCallRes$410 = enforest$221(rest$361, env$358);
                    if (newCallRes$410.result.hasPrototype(Call$210)) {
                        return step$359(Const$209.create(head$360, newCallRes$410.result), newCallRes$410.rest);
                    }
                } else if (head$360.hasPrototype(Delimiter$202) && delim$370.token.value === '()') {
                    innerTokens$362 = delim$370.token.inner;
                    if (innerTokens$362.length === 0) {
                        return step$359(ParenExpression$195.create(head$360), rest$361);
                    } else {
                        var innerTerm$411 = get_expression$222(innerTokens$362, env$358);
                        if (innerTerm$411.result && innerTerm$411.result.hasPrototype(Expr$188)) {
                            return step$359(ParenExpression$195.create(head$360), rest$361);
                        }
                    }
                } else if (head$360.hasPrototype(TermTree$185) && (rest$361[0] && rest$361[1] && stxIsBinOp$218(rest$361[0]))) {
                    var op$412 = rest$361[0];
                    var left$413 = head$360;
                    var bopRes$414 = enforest$221(rest$361.slice(1), env$358);
                    var right$406 = bopRes$414.result;
                    if (right$406.hasPrototype(Expr$188)) {
                        return step$359(BinOp$198.create(op$412, left$413, right$406), bopRes$414.rest);
                    }
                } else if (head$360.hasPrototype(Punc$201) && stxIsUnaryOp$217(punc$373)) {
                    var unopRes$415 = enforest$221(rest$361, env$358);
                    if (unopRes$415.result.hasPrototype(Expr$188)) {
                        return step$359(UnaryOp$196.create(punc$373, unopRes$415.result), unopRes$415.rest);
                    }
                } else if (head$360.hasPrototype(Keyword$200) && stxIsUnaryOp$217(keyword$368)) {
                    var unopRes$415 = enforest$221(rest$361, env$358);
                    if (unopRes$415.result.hasPrototype(Expr$188)) {
                        return step$359(UnaryOp$196.create(keyword$368, unopRes$415.result), unopRes$415.rest);
                    }
                } else if (head$360.hasPrototype(Expr$188) && (rest$361[0] && (rest$361[0].token.value === '++' || rest$361[0].token.value === '--'))) {
                    return step$359(PostfixOp$197.create(head$360, rest$361[0]), rest$361.slice(1));
                } else if (head$360.hasPrototype(Expr$188) && (rest$361[0] && rest$361[0].token.value === '[]')) {
                    return step$359(ObjGet$212.create(head$360, Delimiter$202.create(rest$361[0].expose())), rest$361.slice(1));
                } else if (head$360.hasPrototype(Expr$188) && (rest$361[0] && rest$361[0].token.value === '.' && rest$361[1] && rest$361[1].token.type === parser$97.Token.Identifier)) {
                    return step$359(ObjDotGet$211.create(head$360, rest$361[0], rest$361[1]), rest$361.slice(2));
                } else if (head$360.hasPrototype(Delimiter$202) && delim$370.token.value === '[]') {
                    return step$359(ArrayLiteral$194.create(head$360), rest$361);
                } else if (head$360.hasPrototype(Delimiter$202) && head$360.delim.token.value === '{}') {
                    return step$359(Block$193.create(head$360), rest$361);
                } else if (head$360.hasPrototype(Keyword$200) && (keyword$368.token.value === 'let' && (rest$361[0] && rest$361[0].token.type === parser$97.Token.Identifier || rest$361[0] && rest$361[0].token.type === parser$97.Token.Keyword) && rest$361[1] && rest$361[1].token.value === '=' && rest$361[2] && rest$361[2].token.value === 'macro')) {
                    var mac$416 = enforest$221(rest$361.slice(2), env$358);
                    if (!mac$416.result.hasPrototype(AnonMacro$208)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding');
                    }
                    return step$359(LetMacro$206.create(rest$361[0], mac$416.result.body), mac$416.rest);
                } else if (head$360.hasPrototype(Keyword$200) && (keyword$368.token.value === 'var' && rest$361[0])) {
                    var vsRes$417 = enforestVarStatement$219(rest$361, env$358);
                    if (vsRes$417) {
                        return step$359(VariableStatement$214.create(head$360, vsRes$417.result), vsRes$417.rest);
                    }
                }
            } else {
                parser$97.assert(head$360 && head$360.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$360.token.type === parser$97.Token.Identifier || head$360.token.type === parser$97.Token.Keyword) && env$358.has(resolve$175(head$360))) {
                    // pull the macro transformer out the environment
                    var transformer$418 = env$358.get(resolve$175(head$360)).fn;
                    // apply the transformer
                    var rt$419 = transformer$418([head$360].concat(rest$361), env$358);
                    if (!Array.isArray(rt$419.result)) {
                        throwError$162('Macro transformer must return a result array, not: ' + rt$419.result);
                    }
                    if (rt$419.result.length > 0) {
                        var adjustedResult$420 = adjustLineContext$220(rt$419.result, head$360);
                        return step$359(adjustedResult$420[0], adjustedResult$420.slice(1).concat(rt$419.rest));
                    } else {
                        return step$359(Empty$216.create(), rt$419.rest);    // anon macro definition
                    }
                } else if (head$360.token.type === parser$97.Token.Identifier && head$360.token.value === 'macro' && rest$361[0] && rest$361[0].token.value === '{}') {
                    return step$359(AnonMacro$208.create(rest$361[0].expose().token.inner), rest$361.slice(1));
                } else if (head$360.token.type === parser$97.Token.Identifier && head$360.token.value === 'macro' && rest$361[0] && (rest$361[0].token.type === parser$97.Token.Identifier || rest$361[0].token.type === parser$97.Token.Keyword) && rest$361[1] && rest$361[1].token.type === parser$97.Token.Delimiter && rest$361[1].token.value === '{}') {
                    return step$359(Macro$207.create(rest$361[0], rest$361[1].expose().token.inner), rest$361.slice(2));
                } else if (head$360.token.type === parser$97.Token.Keyword && head$360.token.value === 'function' && rest$361[0] && rest$361[0].token.type === parser$97.Token.Identifier && rest$361[1] && rest$361[1].token.type === parser$97.Token.Delimiter && rest$361[1].token.value === '()' && rest$361[2] && rest$361[2].token.type === parser$97.Token.Delimiter && rest$361[2].token.value === '{}') {
                    rest$361[1].token.inner = rest$361[1].expose().token.inner;
                    rest$361[2].token.inner = rest$361[2].expose().token.inner;
                    return step$359(NamedFun$204.create(head$360, rest$361[0], rest$361[1], rest$361[2]), rest$361.slice(3));
                } else if (head$360.token.type === parser$97.Token.Keyword && head$360.token.value === 'function' && rest$361[0] && rest$361[0].token.type === parser$97.Token.Delimiter && rest$361[0].token.value === '()' && rest$361[1] && rest$361[1].token.type === parser$97.Token.Delimiter && rest$361[1].token.value === '{}') {
                    rest$361[0].token.inner = rest$361[0].expose().token.inner;
                    rest$361[1].token.inner = rest$361[1].expose().token.inner;
                    return step$359(AnonFun$205.create(head$360, rest$361[0], rest$361[1]), rest$361.slice(2));
                } else if (head$360.token.type === parser$97.Token.Keyword && head$360.token.value === 'catch' && rest$361[0] && rest$361[0].token.type === parser$97.Token.Delimiter && rest$361[0].token.value === '()' && rest$361[1] && rest$361[1].token.type === parser$97.Token.Delimiter && rest$361[1].token.value === '{}') {
                    rest$361[0].token.inner = rest$361[0].expose().token.inner;
                    rest$361[1].token.inner = rest$361[1].expose().token.inner;
                    return step$359(CatchClause$215.create(head$360, rest$361[0], rest$361[1]), rest$361.slice(2));
                } else if (head$360.token.type === parser$97.Token.Keyword && head$360.token.value === 'this') {
                    return step$359(ThisExpression$190.create(head$360), rest$361);
                } else if (head$360.token.type === parser$97.Token.NumericLiteral || head$360.token.type === parser$97.Token.StringLiteral || head$360.token.type === parser$97.Token.BooleanLiteral || head$360.token.type === parser$97.Token.RegexLiteral || head$360.token.type === parser$97.Token.NullLiteral) {
                    return step$359(Lit$191.create(head$360), rest$361);
                } else if (head$360.token.type === parser$97.Token.Identifier) {
                    return step$359(Id$203.create(head$360), rest$361);
                } else if (head$360.token.type === parser$97.Token.Punctuator) {
                    return step$359(Punc$201.create(head$360), rest$361);
                } else if (head$360.token.type === parser$97.Token.Keyword && head$360.token.value === 'with') {
                    throwError$162('with is not supported in sweet.js');
                } else if (head$360.token.type === parser$97.Token.Keyword) {
                    return step$359(Keyword$200.create(head$360), rest$361);
                } else if (head$360.token.type === parser$97.Token.Delimiter) {
                    return step$359(Delimiter$202.create(head$360.expose()), rest$361);
                } else if (head$360.token.type === parser$97.Token.EOF) {
                    parser$97.assert(rest$361.length === 0, 'nothing should be after an EOF');
                    return step$359(EOF$186.create(head$360), []);
                } else {
                    // todo: are we missing cases?
                    parser$97.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$360,
                rest: rest$361
            };
        }
        return step$359(toks$357[0], toks$357.slice(1));
    }
    function get_expression$222(stx$421, env$422) {
        var res$423 = enforest$221(stx$421, env$422);
        if (!res$423.result.hasPrototype(Expr$188)) {
            return {
                result: null,
                rest: stx$421
            };
        }
        return res$423;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$223(newMark$424, env$425) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$426(match$427) {
            if (match$427.level === 0) {
                // replace the match property with the marked syntax
                match$427.match = _$96.map(match$427.match, function (stx$428) {
                    return stx$428.mark(newMark$424);
                });
            } else {
                _$96.each(match$427.match, function (match$429) {
                    dfs$426(match$429);
                });
            }
        }
        _$96.keys(env$425).forEach(function (key$430) {
            dfs$426(env$425[key$430]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$224(mac$431, env$432, defscope$433, templateMap$434) {
        var body$435 = mac$431.body;
        // raw function primitive form
        if (!(body$435[0] && body$435[0].token.type === parser$97.Token.Keyword && body$435[0].token.value === 'function')) {
            throwError$162('Primitive macro form must contain a function for the macro body');
        }
        var stub$436 = parser$97.read('()')[0];
        stub$436[0].token.inner = body$435;
        var expanded$437 = expand$228(stub$436, env$432, defscope$433, templateMap$434);
        expanded$437 = expanded$437[0].destruct().concat(expanded$437[1].eof);
        var flattend$438 = flatten$230(expanded$437);
        var bodyCode$439 = codegen$103.generate(parser$97.parse(flattend$438));
        var macroFn$440 = scopedEval$163(bodyCode$439, {
                makeValue: syn$98.makeValue,
                makeRegex: syn$98.makeRegex,
                makeIdent: syn$98.makeIdent,
                makeKeyword: syn$98.makeKeyword,
                makePunc: syn$98.makePunc,
                makeDelim: syn$98.makeDelim,
                unwrapSyntax: syn$98.unwrapSyntax,
                fresh: fresh$181,
                _: _$96,
                parser: parser$97,
                patternModule: patternModule$101,
                getTemplate: function (id$441) {
                    return templateMap$434.get(id$441);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$223,
                mergeMatches: function (newMatch$442, oldMatch$443) {
                    newMatch$442.patternEnv = _$96.extend({}, oldMatch$443.patternEnv, newMatch$442.patternEnv);
                    return newMatch$442;
                }
            });
        return macroFn$440;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$225(stx$444, env$445, defscope$446, templateMap$447) {
        parser$97.assert(env$445, 'environment map is required');
        // short circuit when syntax array is empty
        if (stx$444.length === 0) {
            return {
                terms: [],
                env: env$445
            };
        }
        parser$97.assert(stx$444[0].token, 'expecting a syntax object');
        var f$448 = enforest$221(stx$444, env$445);
        // head :: TermTree
        var head$449 = f$448.result;
        // rest :: [Syntax]
        var rest$450 = f$448.rest;
        if (head$449.hasPrototype(Macro$207)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$452 = loadMacroDef$224(head$449, env$445, defscope$446, templateMap$447);
            addToDefinitionCtx$226([head$449.name], defscope$446, false);
            env$445.set(resolve$175(head$449.name), { fn: macroDefinition$452 });
            return expandToTermTree$225(rest$450, env$445, defscope$446, templateMap$447);
        }
        if (head$449.hasPrototype(LetMacro$206)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$452 = loadMacroDef$224(head$449, env$445, defscope$446, templateMap$447);
            var freshName$453 = fresh$181();
            var renamedName$454 = head$449.name.rename(head$449.name, freshName$453);
            rest$450 = _$96.map(rest$450, function (stx$455) {
                return stx$455.rename(head$449.name, freshName$453);
            });
            head$449.name = renamedName$454;
            env$445.set(resolve$175(head$449.name), { fn: macroDefinition$452 });
            return expandToTermTree$225(rest$450, env$445, defscope$446, templateMap$447);
        }
        if (head$449.hasPrototype(NamedFun$204)) {
            addToDefinitionCtx$226([head$449.name], defscope$446, true);
        }
        if (head$449.hasPrototype(Id$203) && head$449.id.token.value === '#quoteSyntax' && rest$450[0] && rest$450[0].token.value === '{}') {
            var tempId$456 = fresh$181();
            templateMap$447.set(tempId$456, rest$450[0].token.inner);
            return expandToTermTree$225([
                syn$98.makeIdent('getTemplate', head$449.id),
                syn$98.makeDelim('()', [syn$98.makeValue(tempId$456, head$449.id)], head$449.id)
            ].concat(rest$450.slice(1)), env$445, defscope$446, templateMap$447);
        }
        if (head$449.hasPrototype(VariableStatement$214)) {
            addToDefinitionCtx$226(_$96.map(head$449.decls, function (decl$457) {
                return decl$457.ident;
            }), defscope$446, true);
        }
        if (head$449.hasPrototype(Block$193) && head$449.body.hasPrototype(Delimiter$202)) {
            head$449.body.delim.token.inner.forEach(function (term$458) {
                if (term$458.hasPrototype(VariableStatement$214)) {
                    addToDefinitionCtx$226(_$96.map(term$458.decls, function (decl$459) {
                        return decl$459.ident;
                    }), defscope$446, true);
                }
            });
        }
        if (head$449.hasPrototype(Delimiter$202)) {
            head$449.delim.token.inner.forEach(function (term$460) {
                if (term$460.hasPrototype(VariableStatement$214)) {
                    addToDefinitionCtx$226(_$96.map(term$460.decls, function (decl$461) {
                        return decl$461.ident;
                    }), defscope$446, true);
                }
            });
        }
        var trees$451 = expandToTermTree$225(rest$450, env$445, defscope$446, templateMap$447);
        return {
            terms: [head$449].concat(trees$451.terms),
            env: trees$451.env
        };
    }
    function addToDefinitionCtx$226(idents$462, defscope$463, skipRep$464) {
        parser$97.assert(idents$462 && idents$462.length > 0, 'expecting some variable identifiers');
        skipRep$464 = skipRep$464 || false;
        _$96.each(idents$462, function (id$465) {
            var skip$466 = false;
            if (skipRep$464) {
                var declRepeat$467 = _$96.find(defscope$463, function (def$468) {
                        return def$468.id.token.value === id$465.token.value && arraysEqual$176(marksof$174(def$468.id.context), marksof$174(id$465.context));
                    });
                skip$466 = typeof declRepeat$467 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$466) {
                var name$469 = fresh$181();
                defscope$463.push({
                    id: id$465,
                    name: name$469
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$227(term$470, env$471, defscope$472, templateMap$473) {
        parser$97.assert(env$471, 'environment map is required');
        if (term$470.hasPrototype(ArrayLiteral$194)) {
            term$470.array.delim.token.inner = expand$228(term$470.array.delim.token.inner, env$471, defscope$472, templateMap$473);
            return term$470;
        } else if (term$470.hasPrototype(Block$193)) {
            term$470.body.delim.token.inner = expand$228(term$470.body.delim.token.inner, env$471, defscope$472, templateMap$473);
            return term$470;
        } else if (term$470.hasPrototype(ParenExpression$195)) {
            term$470.expr.delim.token.inner = expand$228(term$470.expr.delim.token.inner, env$471, defscope$472, templateMap$473);
            return term$470;
        } else if (term$470.hasPrototype(Call$210)) {
            term$470.fun = expandTermTreeToFinal$227(term$470.fun, env$471, defscope$472, templateMap$473);
            term$470.args = _$96.map(term$470.args, function (arg$474) {
                return expandTermTreeToFinal$227(arg$474, env$471, defscope$472, templateMap$473);
            });
            return term$470;
        } else if (term$470.hasPrototype(UnaryOp$196)) {
            term$470.expr = expandTermTreeToFinal$227(term$470.expr, env$471, defscope$472, templateMap$473);
            return term$470;
        } else if (term$470.hasPrototype(BinOp$198)) {
            term$470.left = expandTermTreeToFinal$227(term$470.left, env$471, defscope$472, templateMap$473);
            term$470.right = expandTermTreeToFinal$227(term$470.right, env$471, defscope$472);
            return term$470;
        } else if (term$470.hasPrototype(ObjGet$212)) {
            term$470.right.delim.token.inner = expand$228(term$470.right.delim.token.inner, env$471, defscope$472, templateMap$473);
            return term$470;
        } else if (term$470.hasPrototype(ObjDotGet$211)) {
            term$470.left = expandTermTreeToFinal$227(term$470.left, env$471, defscope$472, templateMap$473);
            term$470.right = expandTermTreeToFinal$227(term$470.right, env$471, defscope$472, templateMap$473);
            return term$470;
        } else if (term$470.hasPrototype(VariableDeclaration$213)) {
            if (term$470.init) {
                term$470.init = expandTermTreeToFinal$227(term$470.init, env$471, defscope$472, templateMap$473);
            }
            return term$470;
        } else if (term$470.hasPrototype(VariableStatement$214)) {
            term$470.decls = _$96.map(term$470.decls, function (decl$475) {
                return expandTermTreeToFinal$227(decl$475, env$471, defscope$472, templateMap$473);
            });
            return term$470;
        } else if (term$470.hasPrototype(Delimiter$202)) {
            // expand inside the delimiter and then continue on
            term$470.delim.token.inner = expand$228(term$470.delim.token.inner, env$471, defscope$472, templateMap$473);
            return term$470;
        } else if (term$470.hasPrototype(NamedFun$204) || term$470.hasPrototype(AnonFun$205) || term$470.hasPrototype(CatchClause$215)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$476 = [];
            var params$477 = term$470.params.addDefCtx(newDef$476);
            var bodies$478 = term$470.body.addDefCtx(newDef$476);
            var paramNames$479 = _$96.map(getParamIdentifiers$184(params$477), function (param$486) {
                    var freshName$487 = fresh$181();
                    return {
                        freshName: freshName$487,
                        originalParam: param$486,
                        renamedParam: param$486.rename(param$486, freshName$487)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$480 = _$96.reduce(paramNames$479, function (accBody$488, p$489) {
                    return accBody$488.rename(p$489.originalParam, p$489.freshName);
                }, bodies$478);
            renamedBody$480 = renamedBody$480.expose();
            var bodyTerms$481 = expand$228([renamedBody$480], env$471, newDef$476, templateMap$473);
            parser$97.assert(bodyTerms$481.length === 1 && bodyTerms$481[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$482 = _$96.map(paramNames$479, function (p$490) {
                    return p$490.renamedParam;
                });
            var flatArgs$483 = syn$98.makeDelim('()', joinSyntax$182(renamedParams$482, ','), term$470.params);
            var expandedArgs$484 = expand$228([flatArgs$483], env$471, newDef$476, templateMap$473);
            parser$97.assert(expandedArgs$484.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            term$470.params = expandedArgs$484[0];
            var flattenedBody$485 = bodyTerms$481[0].destruct();
            flattenedBody$485 = _$96.reduce(newDef$476, function (acc$491, def$492) {
                return acc$491.rename(def$492.id, def$492.name);
            }, flattenedBody$485[0]);
            term$470.body = flattenedBody$485;
            // and continue expand the rest
            return term$470;
        }
        // the term is fine as is
        return term$470;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$228(stx$493, env$494, defscope$495, templateMap$496) {
        env$494 = env$494 || new Map();
        templateMap$496 = templateMap$496 || new Map();
        var trees$497 = expandToTermTree$225(stx$493, env$494, defscope$495, templateMap$496);
        return _$96.map(trees$497.terms, function (term$498) {
            return expandTermTreeToFinal$227(term$498, trees$497.env, defscope$495, templateMap$496);
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$229(stx$499) {
        var funn$500 = syntaxFromToken$171({
                value: 'function',
                type: parser$97.Token.Keyword
            });
        var params$501 = syntaxFromToken$171({
                value: '()',
                type: parser$97.Token.Delimiter,
                inner: []
            });
        var body$502 = syntaxFromToken$171({
                value: '{}',
                type: parser$97.Token.Delimiter,
                inner: stx$499
            });
        var res$503 = expand$228([
                funn$500,
                params$501,
                body$502
            ]);
        // drop the { and }
        res$503 = flatten$230([res$503[0].body]);
        return _$96.map(res$503.slice(1, res$503.length - 1), function (stx$504) {
            return stx$504;
        });
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$230(stx$505) {
        return _$96.reduce(stx$505, function (acc$506, stx$507) {
            if (stx$507.token.type === parser$97.Token.Delimiter) {
                var exposed$508 = stx$507.expose();
                var openParen$509 = syntaxFromToken$171({
                        type: parser$97.Token.Punctuator,
                        value: stx$507.token.value[0],
                        range: stx$507.token.startRange,
                        lineNumber: stx$507.token.startLineNumber,
                        sm_lineNumber: stx$507.token.sm_startLineNumber,
                        lineStart: stx$507.token.startLineStart,
                        sm_lineStart: stx$507.token.sm_startLineStart
                    }, exposed$508.context);
                var closeParen$510 = syntaxFromToken$171({
                        type: parser$97.Token.Punctuator,
                        value: stx$507.token.value[1],
                        range: stx$507.token.endRange,
                        lineNumber: stx$507.token.endLineNumber,
                        sm_lineNumber: stx$507.token.sm_endLineNumber,
                        lineStart: stx$507.token.endLineStart,
                        sm_lineStart: stx$507.token.sm_endLineStart
                    }, exposed$508.context);
                return acc$506.concat(openParen$509).concat(flatten$230(exposed$508.token.inner)).concat(closeParen$510);
            }
            return acc$506.concat(stx$507);
        }, []);
    }
    exports$95.enforest = enforest$221;
    exports$95.expand = expandTopLevel$229;
    exports$95.resolve = resolve$175;
    exports$95.get_expression = get_expression$222;
    exports$95.Expr = Expr$188;
    exports$95.VariableStatement = VariableStatement$214;
    exports$95.tokensToSyntax = syn$98.tokensToSyntax;
    exports$95.syntaxToTokens = syn$98.syntaxToTokens;
}));