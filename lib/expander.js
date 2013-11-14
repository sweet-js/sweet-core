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
(function (root$97, factory$98) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$98(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$98);
    }
}(this, function (exports$99, _$100, parser$101, syn$102, es6$103, se$104, patternModule$105, gen$106) {
    'use strict';
    var codegen$107 = gen$106 || escodegen;
    // used to export "private" methods for unit testing
    exports$99._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$237 = Object.create(this);
                if (typeof o$237.construct === 'function') {
                    o$237.construct.apply(o$237, arguments);
                }
                return o$237;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$238) {
                var result$239 = Object.create(this);
                for (var prop$240 in properties$238) {
                    if (properties$238.hasOwnProperty(prop$240)) {
                        result$239[prop$240] = properties$238[prop$240];
                    }
                }
                return result$239;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$241) {
                function F$242() {
                }
                F$242.prototype = proto$241;
                return this instanceof F$242;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$166(msg$243) {
        throw new Error(msg$243);
    }
    var scopedEval$167 = se$104.scopedEval;
    var Rename$168 = syn$102.Rename;
    var Mark$169 = syn$102.Mark;
    var Var$170 = syn$102.Var;
    var Def$171 = syn$102.Def;
    var isDef$172 = syn$102.isDef;
    var isMark$173 = syn$102.isMark;
    var isRename$174 = syn$102.isRename;
    var syntaxFromToken$175 = syn$102.syntaxFromToken;
    var joinSyntax$176 = syn$102.joinSyntax;
    function remdup$177(mark$244, mlist$245) {
        if (mark$244 === _$100.first(mlist$245)) {
            return _$100.rest(mlist$245, 1);
        }
        return [mark$244].concat(mlist$245);
    }
    // (CSyntax) -> [...Num]
    function marksof$178(ctx$246, stopName$247, originalName$248) {
        var mark$249, submarks$250;
        if (isMark$173(ctx$246)) {
            mark$249 = ctx$246.mark;
            submarks$250 = marksof$178(ctx$246.context, stopName$247, originalName$248);
            return remdup$177(mark$249, submarks$250);
        }
        if (isDef$172(ctx$246)) {
            return marksof$178(ctx$246.context, stopName$247, originalName$248);
        }
        if (isRename$174(ctx$246)) {
            if (stopName$247 === originalName$248 + '$' + ctx$246.name) {
                return [];
            }
            return marksof$178(ctx$246.context, stopName$247, originalName$248);
        }
        return [];
    }
    function resolve$179(stx$251) {
        return resolveCtx$183(stx$251.token.value, stx$251.context, [], []);
    }
    function arraysEqual$180(a$252, b$253) {
        if (a$252.length !== b$253.length) {
            return false;
        }
        for (var i$254 = 0; i$254 < a$252.length; i$254++) {
            if (a$252[i$254] !== b$253[i$254]) {
                return false;
            }
        }
        return true;
    }
    function renames$181(defctx$255, oldctx$256, originalName$257) {
        var acc$258 = oldctx$256;
        for (var i$259 = 0; i$259 < defctx$255.length; i$259++) {
            if (defctx$255[i$259].id.token.value === originalName$257) {
                acc$258 = Rename$168(defctx$255[i$259].id, defctx$255[i$259].name, acc$258, defctx$255);
            }
        }
        return acc$258;
    }
    function unionEl$182(arr$260, el$261) {
        if (arr$260.indexOf(el$261) === -1) {
            var res$262 = arr$260.slice(0);
            res$262.push(el$261);
            return res$262;
        }
        return arr$260;
    }
    // (Syntax) -> String
    function resolveCtx$183(originalName$263, ctx$264, stop_spine$265, stop_branch$266) {
        if (isMark$173(ctx$264)) {
            return resolveCtx$183(originalName$263, ctx$264.context, stop_spine$265, stop_branch$266);
        }
        if (isDef$172(ctx$264)) {
            if (stop_spine$265.indexOf(ctx$264.defctx) !== -1) {
                return resolveCtx$183(originalName$263, ctx$264.context, stop_spine$265, stop_branch$266);
            } else {
                return resolveCtx$183(originalName$263, renames$181(ctx$264.defctx, ctx$264.context, originalName$263), stop_spine$265, unionEl$182(stop_branch$266, ctx$264.defctx));
            }
        }
        if (isRename$174(ctx$264)) {
            if (originalName$263 === ctx$264.id.token.value) {
                var idName$267 = resolveCtx$183(ctx$264.id.token.value, ctx$264.id.context, stop_branch$266, stop_branch$266);
                var subName$268 = resolveCtx$183(originalName$263, ctx$264.context, unionEl$182(stop_spine$265, ctx$264.def), stop_branch$266);
                if (idName$267 === subName$268) {
                    var idMarks$269 = marksof$178(ctx$264.id.context, originalName$263 + '$' + ctx$264.name, originalName$263);
                    var subMarks$270 = marksof$178(ctx$264.context, originalName$263 + '$' + ctx$264.name, originalName$263);
                    if (arraysEqual$180(idMarks$269, subMarks$270)) {
                        return originalName$263 + '$' + ctx$264.name;
                    }
                }
            }
            return resolveCtx$183(originalName$263, ctx$264.context, unionEl$182(stop_spine$265, ctx$264.def), stop_branch$266);
        }
        return originalName$263;
    }
    var nextFresh$184 = 0;
    // fun () -> Num
    function fresh$185() {
        return nextFresh$184++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$186(towrap$271, delimSyntax$272) {
        parser$101.assert(delimSyntax$272.token.type === parser$101.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$175({
            type: parser$101.Token.Delimiter,
            value: delimSyntax$272.token.value,
            inner: towrap$271,
            range: delimSyntax$272.token.range,
            startLineNumber: delimSyntax$272.token.startLineNumber,
            lineStart: delimSyntax$272.token.lineStart
        }, delimSyntax$272);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$187(argSyntax$273) {
        parser$101.assert(argSyntax$273.token.type === parser$101.Token.Delimiter, 'expecting delimiter for function params');
        return _$100.filter(argSyntax$273.token.inner, function (stx$274) {
            return stx$274.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$188 = {
            destruct: function () {
                return _$100.reduce(this.properties, _$100.bind(function (acc$275, prop$276) {
                    if (this[prop$276] && this[prop$276].hasPrototype(TermTree$188)) {
                        return acc$275.concat(this[prop$276].destruct());
                    } else if (this[prop$276] && this[prop$276].token && this[prop$276].token.inner) {
                        this[prop$276].token.inner = _$100.reduce(this[prop$276].token.inner, function (acc$277, t$278) {
                            if (t$278.hasPrototype(TermTree$188)) {
                                return acc$277.concat(t$278.destruct());
                            }
                            return acc$277.concat(t$278);
                        }, []);
                        return acc$275.concat(this[prop$276]);
                    } else if (this[prop$276]) {
                        return acc$275.concat(this[prop$276]);
                    } else {
                        return acc$275;
                    }
                }, this), []);
            }
        };
    var EOF$189 = TermTree$188.extend({
            properties: ['eof'],
            construct: function (e$279) {
                this.eof = e$279;
            }
        });
    var Statement$190 = TermTree$188.extend({
            construct: function () {
            }
        });
    var Expr$191 = TermTree$188.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$192 = Expr$191.extend({
            construct: function () {
            }
        });
    var ThisExpression$193 = PrimaryExpression$192.extend({
            properties: ['this'],
            construct: function (that$280) {
                this.this = that$280;
            }
        });
    var Lit$194 = PrimaryExpression$192.extend({
            properties: ['lit'],
            construct: function (l$281) {
                this.lit = l$281;
            }
        });
    exports$99._test.PropertyAssignment = PropertyAssignment$195;
    var PropertyAssignment$195 = TermTree$188.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$282, assignment$283) {
                this.propName = propName$282;
                this.assignment = assignment$283;
            }
        });
    var Block$196 = PrimaryExpression$192.extend({
            properties: ['body'],
            construct: function (body$284) {
                this.body = body$284;
            }
        });
    var ArrayLiteral$197 = PrimaryExpression$192.extend({
            properties: ['array'],
            construct: function (ar$285) {
                this.array = ar$285;
            }
        });
    var ParenExpression$198 = PrimaryExpression$192.extend({
            properties: ['expr'],
            construct: function (expr$286) {
                this.expr = expr$286;
            }
        });
    var UnaryOp$199 = Expr$191.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$287, expr$288) {
                this.op = op$287;
                this.expr = expr$288;
            }
        });
    var PostfixOp$200 = Expr$191.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$289, op$290) {
                this.expr = expr$289;
                this.op = op$290;
            }
        });
    var BinOp$201 = Expr$191.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$291, left$292, right$293) {
                this.op = op$291;
                this.left = left$292;
                this.right = right$293;
            }
        });
    var ConditionalExpression$202 = Expr$191.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$294, question$295, tru$296, colon$297, fls$298) {
                this.cond = cond$294;
                this.question = question$295;
                this.tru = tru$296;
                this.colon = colon$297;
                this.fls = fls$298;
            }
        });
    var Keyword$203 = TermTree$188.extend({
            properties: ['keyword'],
            construct: function (k$299) {
                this.keyword = k$299;
            }
        });
    var Punc$204 = TermTree$188.extend({
            properties: ['punc'],
            construct: function (p$300) {
                this.punc = p$300;
            }
        });
    var Delimiter$205 = TermTree$188.extend({
            properties: ['delim'],
            construct: function (d$301) {
                this.delim = d$301;
            }
        });
    var Id$206 = PrimaryExpression$192.extend({
            properties: ['id'],
            construct: function (id$302) {
                this.id = id$302;
            }
        });
    var NamedFun$207 = Expr$191.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$303, name$304, params$305, body$306) {
                this.keyword = keyword$303;
                this.name = name$304;
                this.params = params$305;
                this.body = body$306;
            }
        });
    var AnonFun$208 = Expr$191.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$307, params$308, body$309) {
                this.keyword = keyword$307;
                this.params = params$308;
                this.body = body$309;
            }
        });
    var LetMacro$209 = TermTree$188.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$310, body$311) {
                this.name = name$310;
                this.body = body$311;
            }
        });
    var Macro$210 = TermTree$188.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$312, body$313) {
                this.name = name$312;
                this.body = body$313;
            }
        });
    var AnonMacro$211 = TermTree$188.extend({
            properties: ['body'],
            construct: function (body$314) {
                this.body = body$314;
            }
        });
    var Const$212 = Expr$191.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$315, call$316) {
                this.newterm = newterm$315;
                this.call = call$316;
            }
        });
    var Call$213 = Expr$191.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$101.assert(this.fun.hasPrototype(TermTree$188), 'expecting a term tree in destruct of call');
                var that$317 = this;
                this.delim = syntaxFromToken$175(_$100.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$100.reduce(this.args, function (acc$318, term$319) {
                    parser$101.assert(term$319 && term$319.hasPrototype(TermTree$188), 'expecting term trees in destruct of Call');
                    var dst$320 = acc$318.concat(term$319.destruct());
                    // add all commas except for the last one
                    if (that$317.commas.length > 0) {
                        dst$320 = dst$320.concat(that$317.commas.shift());
                    }
                    return dst$320;
                }, []);
                return this.fun.destruct().concat(Delimiter$205.create(this.delim).destruct());
            },
            construct: function (funn$321, args$322, delim$323, commas$324) {
                parser$101.assert(Array.isArray(args$322), 'requires an array of arguments terms');
                this.fun = funn$321;
                this.args = args$322;
                this.delim = delim$323;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$324;
            }
        });
    var ObjDotGet$214 = Expr$191.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$325, dot$326, right$327) {
                this.left = left$325;
                this.dot = dot$326;
                this.right = right$327;
            }
        });
    var ObjGet$215 = Expr$191.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$328, right$329) {
                this.left = left$328;
                this.right = right$329;
            }
        });
    var VariableDeclaration$216 = TermTree$188.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$330, eqstx$331, init$332, comma$333) {
                this.ident = ident$330;
                this.eqstx = eqstx$331;
                this.init = init$332;
                this.comma = comma$333;
            }
        });
    var VariableStatement$217 = Statement$190.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$100.reduce(this.decls, function (acc$334, decl$335) {
                    return acc$334.concat(decl$335.destruct());
                }, []));
            },
            construct: function (varkw$336, decls$337) {
                parser$101.assert(Array.isArray(decls$337), 'decls must be an array');
                this.varkw = varkw$336;
                this.decls = decls$337;
            }
        });
    var CatchClause$218 = TermTree$188.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$338, params$339, body$340) {
                this.catchkw = catchkw$338;
                this.params = params$339;
                this.body = body$340;
            }
        });
    var Module$219 = TermTree$188.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$341) {
                this.body = body$341;
                this.exports = [];
            }
        });
    var Empty$220 = TermTree$188.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$221 = TermTree$188.extend({
            properties: ['name'],
            construct: function (name$342) {
                this.name = name$342;
            }
        });
    function stxIsUnaryOp$222(stx$343) {
        var staticOperators$344 = [
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
        return _$100.contains(staticOperators$344, stx$343.token.value);
    }
    function stxIsBinOp$223(stx$345) {
        var staticOperators$346 = [
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
        return _$100.contains(staticOperators$346, stx$345.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$224(stx$347, context$348) {
        var decls$349 = [];
        var res$350 = enforest$226(stx$347, context$348);
        var result$351 = res$350.result;
        var rest$352 = res$350.rest;
        if (rest$352[0]) {
            var nextRes$353 = enforest$226(rest$352, context$348);
            // x = ...
            if (nextRes$353.result.hasPrototype(Punc$204) && nextRes$353.result.punc.token.value === '=') {
                var initializerRes$354 = enforest$226(nextRes$353.rest, context$348);
                if (initializerRes$354.rest[0]) {
                    var restRes$355 = enforest$226(initializerRes$354.rest, context$348);
                    // x = y + z, ...
                    if (restRes$355.result.hasPrototype(Punc$204) && restRes$355.result.punc.token.value === ',') {
                        decls$349.push(VariableDeclaration$216.create(result$351.id, nextRes$353.result.punc, initializerRes$354.result, restRes$355.result.punc));
                        var subRes$356 = enforestVarStatement$224(restRes$355.rest, context$348);
                        decls$349 = decls$349.concat(subRes$356.result);
                        rest$352 = subRes$356.rest;
                    }    // x = y ...
                    else {
                        decls$349.push(VariableDeclaration$216.create(result$351.id, nextRes$353.result.punc, initializerRes$354.result));
                        rest$352 = initializerRes$354.rest;
                    }
                }    // x = y EOF
                else {
                    decls$349.push(VariableDeclaration$216.create(result$351.id, nextRes$353.result.punc, initializerRes$354.result));
                }
            }    // x ,...;
            else if (nextRes$353.result.hasPrototype(Punc$204) && nextRes$353.result.punc.token.value === ',') {
                decls$349.push(VariableDeclaration$216.create(result$351.id, null, null, nextRes$353.result.punc));
                var subRes$356 = enforestVarStatement$224(nextRes$353.rest, context$348);
                decls$349 = decls$349.concat(subRes$356.result);
                rest$352 = subRes$356.rest;
            } else {
                if (result$351.hasPrototype(Id$206)) {
                    decls$349.push(VariableDeclaration$216.create(result$351.id));
                } else {
                    throwError$166('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$351.hasPrototype(Id$206)) {
                decls$349.push(VariableDeclaration$216.create(result$351.id));
            } else if (result$351.hasPrototype(BinOp$201) && result$351.op.token.value === 'in') {
                decls$349.push(VariableDeclaration$216.create(result$351.left.id, result$351.op, result$351.right));
            } else {
                throwError$166('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$349,
            rest: rest$352
        };
    }
    function adjustLineContext$225(stx$357, original$358) {
        var last$359 = stx$357[0] && typeof stx$357[0].token.range == 'undefined' ? original$358 : stx$357[0];
        return _$100.map(stx$357, function (stx$360) {
            if (typeof stx$360.token.range == 'undefined') {
                stx$360.token.range = last$359.token.range;
            }
            if (stx$360.token.type === parser$101.Token.Delimiter) {
                stx$360.token.sm_startLineNumber = original$358.token.lineNumber;
                stx$360.token.sm_endLineNumber = original$358.token.lineNumber;
                stx$360.token.sm_startLineStart = original$358.token.lineStart;
                stx$360.token.sm_endLineStart = original$358.token.lineStart;
                if (stx$360.token.inner.length > 0) {
                    stx$360.token.inner = adjustLineContext$225(stx$360.token.inner, original$358);
                }
                last$359 = stx$360;
                return stx$360;
            }
            stx$360.token.sm_lineNumber = original$358.token.lineNumber;
            stx$360.token.sm_lineStart = original$358.token.lineStart;
            last$359 = stx$360;
            return stx$360;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$226(toks$361, context$362) {
        parser$101.assert(toks$361.length > 0, 'enforest assumes there are tokens to work with');
        function step$363(head$364, rest$365) {
            var innerTokens$366;
            parser$101.assert(Array.isArray(rest$365), 'result must at least be an empty array');
            if (head$364.hasPrototype(TermTree$188)) {
                // function call
                var emp$369 = head$364.emp;
                var emp$369 = head$364.emp;
                var keyword$372 = head$364.keyword;
                var delim$374 = head$364.delim;
                var emp$369 = head$364.emp;
                var punc$377 = head$364.punc;
                var keyword$372 = head$364.keyword;
                var emp$369 = head$364.emp;
                var emp$369 = head$364.emp;
                var emp$369 = head$364.emp;
                var delim$374 = head$364.delim;
                var delim$374 = head$364.delim;
                var keyword$372 = head$364.keyword;
                var keyword$372 = head$364.keyword;
                if (head$364.hasPrototype(Expr$191) && (rest$365[0] && rest$365[0].token.type === parser$101.Token.Delimiter && rest$365[0].token.value === '()')) {
                    var argRes$402, enforestedArgs$403 = [], commas$404 = [];
                    rest$365[0].expose();
                    innerTokens$366 = rest$365[0].token.inner;
                    while (innerTokens$366.length > 0) {
                        argRes$402 = enforest$226(innerTokens$366, context$362);
                        enforestedArgs$403.push(argRes$402.result);
                        innerTokens$366 = argRes$402.rest;
                        if (innerTokens$366[0] && innerTokens$366[0].token.value === ',') {
                            // record the comma for later
                            commas$404.push(innerTokens$366[0]);
                            // but dump it for the next loop turn
                            innerTokens$366 = innerTokens$366.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$405 = _$100.all(enforestedArgs$403, function (argTerm$406) {
                            return argTerm$406.hasPrototype(Expr$191);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$366.length === 0 && argsAreExprs$405) {
                        return step$363(Call$213.create(head$364, enforestedArgs$403, rest$365[0], commas$404), rest$365.slice(1));
                    }
                } else if (head$364.hasPrototype(Expr$191) && (rest$365[0] && rest$365[0].token.value === '?')) {
                    var question$407 = rest$365[0];
                    var condRes$408 = enforest$226(rest$365.slice(1), context$362);
                    var truExpr$409 = condRes$408.result;
                    var right$410 = condRes$408.rest;
                    if (truExpr$409.hasPrototype(Expr$191) && right$410[0] && right$410[0].token.value === ':') {
                        var colon$411 = right$410[0];
                        var flsRes$412 = enforest$226(right$410.slice(1), context$362);
                        var flsExpr$413 = flsRes$412.result;
                        if (flsExpr$413.hasPrototype(Expr$191)) {
                            return step$363(ConditionalExpression$202.create(head$364, question$407, truExpr$409, colon$411, flsExpr$413), flsRes$412.rest);
                        }
                    }
                } else if (head$364.hasPrototype(Keyword$203) && (keyword$372.token.value === 'new' && rest$365[0])) {
                    var newCallRes$414 = enforest$226(rest$365, context$362);
                    if (newCallRes$414.result.hasPrototype(Call$213)) {
                        return step$363(Const$212.create(head$364, newCallRes$414.result), newCallRes$414.rest);
                    }
                } else if (head$364.hasPrototype(Delimiter$205) && delim$374.token.value === '()') {
                    innerTokens$366 = delim$374.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$366.length === 0) {
                        return step$363(ParenExpression$198.create(head$364), rest$365);
                    } else {
                        var innerTerm$415 = get_expression$227(innerTokens$366, context$362);
                        if (innerTerm$415.result && innerTerm$415.result.hasPrototype(Expr$191)) {
                            return step$363(ParenExpression$198.create(head$364), rest$365);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$364.hasPrototype(TermTree$188) && (rest$365[0] && rest$365[1] && stxIsBinOp$223(rest$365[0]))) {
                    var op$416 = rest$365[0];
                    var left$417 = head$364;
                    var bopRes$418 = enforest$226(rest$365.slice(1), context$362);
                    var right$410 = bopRes$418.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$410.hasPrototype(Expr$191)) {
                        return step$363(BinOp$201.create(op$416, left$417, right$410), bopRes$418.rest);
                    }
                } else if (head$364.hasPrototype(Punc$204) && stxIsUnaryOp$222(punc$377)) {
                    var unopRes$419 = enforest$226(rest$365, context$362);
                    if (unopRes$419.result.hasPrototype(Expr$191)) {
                        return step$363(UnaryOp$199.create(punc$377, unopRes$419.result), unopRes$419.rest);
                    }
                } else if (head$364.hasPrototype(Keyword$203) && stxIsUnaryOp$222(keyword$372)) {
                    var unopRes$419 = enforest$226(rest$365, context$362);
                    if (unopRes$419.result.hasPrototype(Expr$191)) {
                        return step$363(UnaryOp$199.create(keyword$372, unopRes$419.result), unopRes$419.rest);
                    }
                } else if (head$364.hasPrototype(Expr$191) && (rest$365[0] && (rest$365[0].token.value === '++' || rest$365[0].token.value === '--'))) {
                    return step$363(PostfixOp$200.create(head$364, rest$365[0]), rest$365.slice(1));
                } else if (head$364.hasPrototype(Expr$191) && (rest$365[0] && rest$365[0].token.value === '[]')) {
                    return step$363(ObjGet$215.create(head$364, Delimiter$205.create(rest$365[0].expose())), rest$365.slice(1));
                } else if (head$364.hasPrototype(Expr$191) && (rest$365[0] && rest$365[0].token.value === '.' && rest$365[1] && rest$365[1].token.type === parser$101.Token.Identifier)) {
                    return step$363(ObjDotGet$214.create(head$364, rest$365[0], rest$365[1]), rest$365.slice(2));
                } else if (head$364.hasPrototype(Delimiter$205) && delim$374.token.value === '[]') {
                    return step$363(ArrayLiteral$197.create(head$364), rest$365);
                } else if (head$364.hasPrototype(Delimiter$205) && head$364.delim.token.value === '{}') {
                    return step$363(Block$196.create(head$364), rest$365);
                } else if (head$364.hasPrototype(Keyword$203) && (keyword$372.token.value === 'let' && (rest$365[0] && rest$365[0].token.type === parser$101.Token.Identifier || rest$365[0] && rest$365[0].token.type === parser$101.Token.Keyword) && rest$365[1] && rest$365[1].token.value === '=' && rest$365[2] && rest$365[2].token.value === 'macro')) {
                    var mac$420 = enforest$226(rest$365.slice(2), context$362);
                    if (!mac$420.result.hasPrototype(AnonMacro$211)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$420.result);
                    }
                    return step$363(LetMacro$209.create(rest$365[0], mac$420.result.body), mac$420.rest);
                } else if (head$364.hasPrototype(Keyword$203) && (keyword$372.token.value === 'var' && rest$365[0])) {
                    var vsRes$421 = enforestVarStatement$224(rest$365, context$362);
                    if (vsRes$421) {
                        return step$363(VariableStatement$217.create(head$364, vsRes$421.result), vsRes$421.rest);
                    }
                }
            } else {
                parser$101.assert(head$364 && head$364.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$364.token.type === parser$101.Token.Identifier || head$364.token.type === parser$101.Token.Keyword || head$364.token.type === parser$101.Token.Punctuator) && context$362.env.has(resolve$179(head$364))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$422 = fresh$185();
                    var transformerContext$423 = makeExpanderContext$234(_$100.defaults({ mark: newMark$422 }, context$362));
                    // pull the macro transformer out the environment
                    var transformer$424 = context$362.env.get(resolve$179(head$364)).fn;
                    // apply the transformer
                    var rt$425 = transformer$424([head$364].concat(rest$365), transformerContext$423);
                    if (!Array.isArray(rt$425.result)) {
                        throwError$166('Macro transformer must return a result array, not: ' + rt$425.result);
                    }
                    if (rt$425.result.length > 0) {
                        var adjustedResult$426 = adjustLineContext$225(rt$425.result, head$364);
                        adjustedResult$426[0].token.leadingComments = head$364.token.leadingComments;
                        return step$363(adjustedResult$426[0], adjustedResult$426.slice(1).concat(rt$425.rest));
                    } else {
                        return step$363(Empty$220.create(), rt$425.rest);
                    }
                }    // anon macro definition
                else if (head$364.token.type === parser$101.Token.Identifier && head$364.token.value === 'macro' && rest$365[0] && rest$365[0].token.value === '{}') {
                    return step$363(AnonMacro$211.create(rest$365[0].expose().token.inner), rest$365.slice(1));
                }    // macro definition
                else if (head$364.token.type === parser$101.Token.Identifier && head$364.token.value === 'macro' && rest$365[0] && (rest$365[0].token.type === parser$101.Token.Identifier || rest$365[0].token.type === parser$101.Token.Keyword || rest$365[0].token.type === parser$101.Token.Punctuator) && rest$365[1] && rest$365[1].token.type === parser$101.Token.Delimiter && rest$365[1].token.value === '{}') {
                    return step$363(Macro$210.create(rest$365[0], rest$365[1].expose().token.inner), rest$365.slice(2));
                }    // module definition
                else if (head$364.token.value === 'module' && rest$365[0] && rest$365[0].token.value === '{}') {
                    return step$363(Module$219.create(rest$365[0]), rest$365.slice(1));
                }    // function definition
                else if (head$364.token.type === parser$101.Token.Keyword && head$364.token.value === 'function' && rest$365[0] && rest$365[0].token.type === parser$101.Token.Identifier && rest$365[1] && rest$365[1].token.type === parser$101.Token.Delimiter && rest$365[1].token.value === '()' && rest$365[2] && rest$365[2].token.type === parser$101.Token.Delimiter && rest$365[2].token.value === '{}') {
                    rest$365[1].token.inner = rest$365[1].expose().token.inner;
                    rest$365[2].token.inner = rest$365[2].expose().token.inner;
                    return step$363(NamedFun$207.create(head$364, rest$365[0], rest$365[1], rest$365[2]), rest$365.slice(3));
                }    // anonymous function definition
                else if (head$364.token.type === parser$101.Token.Keyword && head$364.token.value === 'function' && rest$365[0] && rest$365[0].token.type === parser$101.Token.Delimiter && rest$365[0].token.value === '()' && rest$365[1] && rest$365[1].token.type === parser$101.Token.Delimiter && rest$365[1].token.value === '{}') {
                    rest$365[0].token.inner = rest$365[0].expose().token.inner;
                    rest$365[1].token.inner = rest$365[1].expose().token.inner;
                    return step$363(AnonFun$208.create(head$364, rest$365[0], rest$365[1]), rest$365.slice(2));
                }    // catch statement
                else if (head$364.token.type === parser$101.Token.Keyword && head$364.token.value === 'catch' && rest$365[0] && rest$365[0].token.type === parser$101.Token.Delimiter && rest$365[0].token.value === '()' && rest$365[1] && rest$365[1].token.type === parser$101.Token.Delimiter && rest$365[1].token.value === '{}') {
                    rest$365[0].token.inner = rest$365[0].expose().token.inner;
                    rest$365[1].token.inner = rest$365[1].expose().token.inner;
                    return step$363(CatchClause$218.create(head$364, rest$365[0], rest$365[1]), rest$365.slice(2));
                }    // this expression
                else if (head$364.token.type === parser$101.Token.Keyword && head$364.token.value === 'this') {
                    return step$363(ThisExpression$193.create(head$364), rest$365);
                }    // literal
                else if (head$364.token.type === parser$101.Token.NumericLiteral || head$364.token.type === parser$101.Token.StringLiteral || head$364.token.type === parser$101.Token.BooleanLiteral || head$364.token.type === parser$101.Token.RegexLiteral || head$364.token.type === parser$101.Token.NullLiteral) {
                    return step$363(Lit$194.create(head$364), rest$365);
                }    // export
                else if (head$364.token.type === parser$101.Token.Identifier && head$364.token.value === 'export' && rest$365[0] && (rest$365[0].token.type === parser$101.Token.Identifier || rest$365[0].token.type === parser$101.Token.Keyword || rest$365[0].token.type === parser$101.Token.Punctuator)) {
                    return step$363(Export$221.create(rest$365[0]), rest$365.slice(1));
                }    // identifier
                else if (head$364.token.type === parser$101.Token.Identifier) {
                    return step$363(Id$206.create(head$364), rest$365);
                }    // punctuator
                else if (head$364.token.type === parser$101.Token.Punctuator) {
                    return step$363(Punc$204.create(head$364), rest$365);
                } else if (head$364.token.type === parser$101.Token.Keyword && head$364.token.value === 'with') {
                    throwError$166('with is not supported in sweet.js');
                }    // keyword
                else if (head$364.token.type === parser$101.Token.Keyword) {
                    return step$363(Keyword$203.create(head$364), rest$365);
                }    // Delimiter
                else if (head$364.token.type === parser$101.Token.Delimiter) {
                    return step$363(Delimiter$205.create(head$364.expose()), rest$365);
                }    // end of file
                else if (head$364.token.type === parser$101.Token.EOF) {
                    parser$101.assert(rest$365.length === 0, 'nothing should be after an EOF');
                    return step$363(EOF$189.create(head$364), []);
                } else {
                    // todo: are we missing cases?
                    parser$101.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$364,
                rest: rest$365
            };
        }
        return step$363(toks$361[0], toks$361.slice(1));
    }
    function get_expression$227(stx$427, context$428) {
        var res$429 = enforest$226(stx$427, context$428);
        if (!res$429.result.hasPrototype(Expr$191)) {
            return {
                result: null,
                rest: stx$427
            };
        }
        return res$429;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$228(newMark$430, env$431) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$432(match$433) {
            if (match$433.level === 0) {
                // replace the match property with the marked syntax
                match$433.match = _$100.map(match$433.match, function (stx$434) {
                    return stx$434.mark(newMark$430);
                });
            } else {
                _$100.each(match$433.match, function (match$435) {
                    dfs$432(match$435);
                });
            }
        }
        _$100.keys(env$431).forEach(function (key$436) {
            dfs$432(env$431[key$436]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$229(mac$437, context$438) {
        var body$439 = mac$437.body;
        // raw function primitive form
        if (!(body$439[0] && body$439[0].token.type === parser$101.Token.Keyword && body$439[0].token.value === 'function')) {
            throwError$166('Primitive macro form must contain a function for the macro body');
        }
        var stub$440 = parser$101.read('()');
        stub$440[0].token.inner = body$439;
        var expanded$441 = expand$233(stub$440, context$438);
        expanded$441 = expanded$441[0].destruct().concat(expanded$441[1].eof);
        var flattend$442 = flatten$236(expanded$441);
        var bodyCode$443 = codegen$107.generate(parser$101.parse(flattend$442));
        var macroFn$444 = scopedEval$167(bodyCode$443, {
                makeValue: syn$102.makeValue,
                makeRegex: syn$102.makeRegex,
                makeIdent: syn$102.makeIdent,
                makeKeyword: syn$102.makeKeyword,
                makePunc: syn$102.makePunc,
                makeDelim: syn$102.makeDelim,
                unwrapSyntax: syn$102.unwrapSyntax,
                throwSyntaxError: syn$102.throwSyntaxError,
                fresh: fresh$185,
                _: _$100,
                parser: parser$101,
                patternModule: patternModule$105,
                getTemplate: function (id$445) {
                    return context$438.templateMap.get(id$445);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$228,
                mergeMatches: function (newMatch$446, oldMatch$447) {
                    newMatch$446.patternEnv = _$100.extend({}, oldMatch$447.patternEnv, newMatch$446.patternEnv);
                    return newMatch$446;
                }
            });
        return macroFn$444;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$230(stx$448, context$449) {
        parser$101.assert(context$449, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$448.length === 0) {
            return {
                terms: [],
                context: context$449
            };
        }
        parser$101.assert(stx$448[0].token, 'expecting a syntax object');
        var f$450 = enforest$226(stx$448, context$449);
        // head :: TermTree
        var head$451 = f$450.result;
        // rest :: [Syntax]
        var rest$452 = f$450.rest;
        if (head$451.hasPrototype(Macro$210)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$454 = loadMacroDef$229(head$451, context$449);
            addToDefinitionCtx$231([head$451.name], context$449.defscope, false);
            context$449.env.set(resolve$179(head$451.name), { fn: macroDefinition$454 });
            return expandToTermTree$230(rest$452, context$449);
        }
        if (head$451.hasPrototype(LetMacro$209)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$454 = loadMacroDef$229(head$451, context$449);
            var freshName$455 = fresh$185();
            var renamedName$456 = head$451.name.rename(head$451.name, freshName$455);
            rest$452 = _$100.map(rest$452, function (stx$457) {
                return stx$457.rename(head$451.name, freshName$455);
            });
            head$451.name = renamedName$456;
            context$449.env.set(resolve$179(head$451.name), { fn: macroDefinition$454 });
            return expandToTermTree$230(rest$452, context$449);
        }
        if (head$451.hasPrototype(NamedFun$207)) {
            addToDefinitionCtx$231([head$451.name], context$449.defscope, true);
        }
        if (head$451.hasPrototype(Id$206) && head$451.id.token.value === '#quoteSyntax' && rest$452[0] && rest$452[0].token.value === '{}') {
            var tempId$458 = fresh$185();
            context$449.templateMap.set(tempId$458, rest$452[0].token.inner);
            return expandToTermTree$230([
                syn$102.makeIdent('getTemplate', head$451.id),
                syn$102.makeDelim('()', [syn$102.makeValue(tempId$458, head$451.id)], head$451.id)
            ].concat(rest$452.slice(1)), context$449);
        }
        if (head$451.hasPrototype(VariableStatement$217)) {
            addToDefinitionCtx$231(_$100.map(head$451.decls, function (decl$459) {
                return decl$459.ident;
            }), context$449.defscope, true);
        }
        if (head$451.hasPrototype(Block$196) && head$451.body.hasPrototype(Delimiter$205)) {
            head$451.body.delim.token.inner.forEach(function (term$460) {
                if (term$460.hasPrototype(VariableStatement$217)) {
                    addToDefinitionCtx$231(_$100.map(term$460.decls, function (decl$461) {
                        return decl$461.ident;
                    }), context$449.defscope, true);
                }
            });
        }
        if (head$451.hasPrototype(Delimiter$205)) {
            head$451.delim.token.inner.forEach(function (term$462) {
                if (term$462.hasPrototype(VariableStatement$217)) {
                    addToDefinitionCtx$231(_$100.map(term$462.decls, function (decl$463) {
                        return decl$463.ident;
                    }), context$449.defscope, true);
                }
            });
        }
        var trees$453 = expandToTermTree$230(rest$452, context$449);
        return {
            terms: [head$451].concat(trees$453.terms),
            context: trees$453.context
        };
    }
    function addToDefinitionCtx$231(idents$464, defscope$465, skipRep$466) {
        parser$101.assert(idents$464 && idents$464.length > 0, 'expecting some variable identifiers');
        skipRep$466 = skipRep$466 || false;
        _$100.each(idents$464, function (id$467) {
            var skip$468 = false;
            if (skipRep$466) {
                var declRepeat$469 = _$100.find(defscope$465, function (def$470) {
                        return def$470.id.token.value === id$467.token.value && arraysEqual$180(marksof$178(def$470.id.context), marksof$178(id$467.context));
                    });
                skip$468 = typeof declRepeat$469 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$468) {
                var name$471 = fresh$185();
                defscope$465.push({
                    id: id$467,
                    name: name$471
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$232(term$472, context$473) {
        parser$101.assert(context$473 && context$473.env, 'environment map is required');
        if (term$472.hasPrototype(ArrayLiteral$197)) {
            term$472.array.delim.token.inner = expand$233(term$472.array.delim.token.inner, context$473);
            return term$472;
        } else if (term$472.hasPrototype(Block$196)) {
            term$472.body.delim.token.inner = expand$233(term$472.body.delim.token.inner, context$473);
            return term$472;
        } else if (term$472.hasPrototype(ParenExpression$198)) {
            term$472.expr.delim.token.inner = expand$233(term$472.expr.delim.token.inner, context$473);
            return term$472;
        } else if (term$472.hasPrototype(Call$213)) {
            term$472.fun = expandTermTreeToFinal$232(term$472.fun, context$473);
            term$472.args = _$100.map(term$472.args, function (arg$474) {
                return expandTermTreeToFinal$232(arg$474, context$473);
            });
            return term$472;
        } else if (term$472.hasPrototype(UnaryOp$199)) {
            term$472.expr = expandTermTreeToFinal$232(term$472.expr, context$473);
            return term$472;
        } else if (term$472.hasPrototype(BinOp$201)) {
            term$472.left = expandTermTreeToFinal$232(term$472.left, context$473);
            term$472.right = expandTermTreeToFinal$232(term$472.right, context$473);
            return term$472;
        } else if (term$472.hasPrototype(ObjGet$215)) {
            term$472.right.delim.token.inner = expand$233(term$472.right.delim.token.inner, context$473);
            return term$472;
        } else if (term$472.hasPrototype(ObjDotGet$214)) {
            term$472.left = expandTermTreeToFinal$232(term$472.left, context$473);
            term$472.right = expandTermTreeToFinal$232(term$472.right, context$473);
            return term$472;
        } else if (term$472.hasPrototype(VariableDeclaration$216)) {
            if (term$472.init) {
                term$472.init = expandTermTreeToFinal$232(term$472.init, context$473);
            }
            return term$472;
        } else if (term$472.hasPrototype(VariableStatement$217)) {
            term$472.decls = _$100.map(term$472.decls, function (decl$475) {
                return expandTermTreeToFinal$232(decl$475, context$473);
            });
            return term$472;
        } else if (term$472.hasPrototype(Delimiter$205)) {
            // expand inside the delimiter and then continue on
            term$472.delim.token.inner = expand$233(term$472.delim.token.inner, context$473);
            return term$472;
        } else if (term$472.hasPrototype(NamedFun$207) || term$472.hasPrototype(AnonFun$208) || term$472.hasPrototype(CatchClause$218) || term$472.hasPrototype(Module$219)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$476 = [];
            var bodyContext$477 = makeExpanderContext$234(_$100.defaults({ defscope: newDef$476 }, context$473));
            if (term$472.params) {
                var params$486 = term$472.params.addDefCtx(newDef$476);
            } else {
                var params$486 = syn$102.makeDelim('()', [], null);
            }
            var bodies$478 = term$472.body.addDefCtx(newDef$476);
            var paramNames$479 = _$100.map(getParamIdentifiers$187(params$486), function (param$487) {
                    var freshName$488 = fresh$185();
                    return {
                        freshName: freshName$488,
                        originalParam: param$487,
                        renamedParam: param$487.rename(param$487, freshName$488)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$480 = _$100.reduce(paramNames$479, function (accBody$489, p$490) {
                    return accBody$489.rename(p$490.originalParam, p$490.freshName);
                }, bodies$478);
            renamedBody$480 = renamedBody$480.expose();
            var bodyTerms$481 = expand$233([renamedBody$480], bodyContext$477);
            parser$101.assert(bodyTerms$481.length === 1 && bodyTerms$481[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$482 = _$100.map(paramNames$479, function (p$491) {
                    return p$491.renamedParam;
                });
            var flatArgs$483 = syn$102.makeDelim('()', joinSyntax$176(renamedParams$482, ','), term$472.params);
            var expandedArgs$484 = expand$233([flatArgs$483], bodyContext$477);
            parser$101.assert(expandedArgs$484.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$472.params) {
                term$472.params = expandedArgs$484[0];
            }
            if (term$472.hasPrototype(Module$219)) {
                bodyTerms$481[0].body.delim.token.inner = _$100.filter(bodyTerms$481[0].body.delim.token.inner, function (innerTerm$492) {
                    if (innerTerm$492.hasPrototype(Export$221)) {
                        term$472.exports.push(innerTerm$492);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            var flattenedBody$485 = bodyTerms$481[0].destruct();
            flattenedBody$485 = _$100.reduce(newDef$476, function (acc$493, def$494) {
                return acc$493.rename(def$494.id, def$494.name);
            }, flattenedBody$485[0]);
            term$472.body = flattenedBody$485;
            // and continue expand the rest
            return term$472;
        }
        // the term is fine as is
        return term$472;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$233(stx$495, context$496) {
        parser$101.assert(context$496, 'must provide an expander context');
        var trees$497 = expandToTermTree$230(stx$495, context$496);
        return _$100.map(trees$497.terms, function (term$498) {
            return expandTermTreeToFinal$232(term$498, trees$497.context);
        });
    }
    function makeExpanderContext$234(o$499) {
        o$499 = o$499 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$499.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$499.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$499.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$499.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$235(stx$500, builtinSource$501) {
        var builtInEnv$502 = new Map();
        var env$503 = new Map();
        var params$504 = [];
        var context$505, builtInContext$506 = makeExpanderContext$234({ env: builtInEnv$502 });
        if (builtinSource$501) {
            var builtinRead$509 = parser$101.read(builtinSource$501);
            builtinRead$509 = [
                syn$102.makeIdent('module', null),
                syn$102.makeDelim('{}', builtinRead$509, null)
            ];
            var builtinRes$510 = expand$233(builtinRead$509, builtInContext$506);
            params$504 = _$100.map(builtinRes$510[0].exports, function (term$511) {
                return {
                    oldExport: term$511.name,
                    newParam: syn$102.makeIdent(term$511.name.token.value, null)
                };
            });
        }
        var modBody$507 = syn$102.makeDelim('{}', stx$500, null);
        modBody$507 = _$100.reduce(params$504, function (acc$512, param$513) {
            var newName$514 = fresh$185();
            env$503.set(resolve$179(param$513.newParam.rename(param$513.newParam, newName$514)), builtInEnv$502.get(resolve$179(param$513.oldExport)));
            return acc$512.rename(param$513.newParam, newName$514);
        }, modBody$507);
        context$505 = makeExpanderContext$234({ env: env$503 });
        var res$508 = expand$233([
                syn$102.makeIdent('module', null),
                modBody$507
            ], context$505);
        return flatten$236(res$508[0].body.expose().token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$236(stx$515) {
        return _$100.reduce(stx$515, function (acc$516, stx$517) {
            if (stx$517.token.type === parser$101.Token.Delimiter) {
                var exposed$518 = stx$517.expose();
                var openParen$519 = syntaxFromToken$175({
                        type: parser$101.Token.Punctuator,
                        value: stx$517.token.value[0],
                        range: stx$517.token.startRange,
                        lineNumber: stx$517.token.startLineNumber,
                        sm_lineNumber: stx$517.token.sm_startLineNumber ? stx$517.token.sm_startLineNumber : stx$517.token.startLineNumber,
                        lineStart: stx$517.token.startLineStart,
                        sm_lineStart: stx$517.token.sm_startLineStart ? stx$517.token.sm_startLineStart : stx$517.token.startLineStart
                    }, exposed$518);
                var closeParen$520 = syntaxFromToken$175({
                        type: parser$101.Token.Punctuator,
                        value: stx$517.token.value[1],
                        range: stx$517.token.endRange,
                        lineNumber: stx$517.token.endLineNumber,
                        sm_lineNumber: stx$517.token.sm_endLineNumber ? stx$517.token.sm_endLineNumber : stx$517.token.endLineNumber,
                        lineStart: stx$517.token.endLineStart,
                        sm_lineStart: stx$517.token.sm_endLineStart ? stx$517.token.sm_endLineStart : stx$517.token.endLineStart
                    }, exposed$518);
                if (stx$517.token.leadingComments) {
                    openParen$519.token.leadingComments = stx$517.token.leadingComments;
                }
                if (stx$517.token.trailingComments) {
                    openParen$519.token.trailingComments = stx$517.token.trailingComments;
                }
                return acc$516.concat(openParen$519).concat(flatten$236(exposed$518.token.inner)).concat(closeParen$520);
            }
            stx$517.token.sm_lineNumber = stx$517.token.sm_lineNumber ? stx$517.token.sm_lineNumber : stx$517.token.lineNumber;
            stx$517.token.sm_lineStart = stx$517.token.sm_lineStart ? stx$517.token.sm_lineStart : stx$517.token.lineStart;
            return acc$516.concat(stx$517);
        }, []);
    }
    exports$99.enforest = enforest$226;
    exports$99.expand = expandTopLevel$235;
    exports$99.resolve = resolve$179;
    exports$99.get_expression = get_expression$227;
    exports$99.makeExpanderContext = makeExpanderContext$234;
    exports$99.Expr = Expr$191;
    exports$99.VariableStatement = VariableStatement$217;
    exports$99.tokensToSyntax = syn$102.tokensToSyntax;
    exports$99.syntaxToTokens = syn$102.syntaxToTokens;
}));