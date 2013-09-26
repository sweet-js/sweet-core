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
    var mkSyntax$176 = syn$102.mkSyntax;
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
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$186(tojoin$271, punc$272) {
        if (tojoin$271.length === 0) {
            return [];
        }
        if (punc$272 === ' ') {
            return tojoin$271;
        }
        return _$100.reduce(_$100.rest(tojoin$271, 1), function (acc$273, join$274) {
            return acc$273.concat(mkSyntax$176(punc$272, parser$101.Token.Punctuator, join$274), join$274);
        }, [_$100.first(tojoin$271)]);
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$187(towrap$275, delimSyntax$276) {
        parser$101.assert(delimSyntax$276.token.type === parser$101.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$175({
            type: parser$101.Token.Delimiter,
            value: delimSyntax$276.token.value,
            inner: towrap$275,
            range: delimSyntax$276.token.range,
            startLineNumber: delimSyntax$276.token.startLineNumber,
            lineStart: delimSyntax$276.token.lineStart
        }, delimSyntax$276.context);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$188(argSyntax$277) {
        parser$101.assert(argSyntax$277.token.type === parser$101.Token.Delimiter, 'expecting delimiter for function params');
        return _$100.filter(argSyntax$277.token.inner, function (stx$278) {
            return stx$278.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$189 = {
            destruct: function () {
                return _$100.reduce(this.properties, _$100.bind(function (acc$279, prop$280) {
                    if (this[prop$280] && this[prop$280].hasPrototype(TermTree$189)) {
                        return acc$279.concat(this[prop$280].destruct());
                    } else if (this[prop$280] && this[prop$280].token && this[prop$280].token.inner) {
                        this[prop$280].token.inner = _$100.reduce(this[prop$280].token.inner, function (acc$281, t$282) {
                            if (t$282.hasPrototype(TermTree$189)) {
                                return acc$281.concat(t$282.destruct());
                            }
                            return acc$281.concat(t$282);
                        }, []);
                        return acc$279.concat(this[prop$280]);
                    } else if (this[prop$280]) {
                        return acc$279.concat(this[prop$280]);
                    } else {
                        return acc$279;
                    }
                }, this), []);
            }
        };
    var EOF$190 = TermTree$189.extend({
            properties: ['eof'],
            construct: function (e$283) {
                this.eof = e$283;
            }
        });
    var Statement$191 = TermTree$189.extend({
            construct: function () {
            }
        });
    var Expr$192 = TermTree$189.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$193 = Expr$192.extend({
            construct: function () {
            }
        });
    var ThisExpression$194 = PrimaryExpression$193.extend({
            properties: ['this'],
            construct: function (that$284) {
                this.this = that$284;
            }
        });
    var Lit$195 = PrimaryExpression$193.extend({
            properties: ['lit'],
            construct: function (l$285) {
                this.lit = l$285;
            }
        });
    exports$99._test.PropertyAssignment = PropertyAssignment$196;
    var PropertyAssignment$196 = TermTree$189.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$286, assignment$287) {
                this.propName = propName$286;
                this.assignment = assignment$287;
            }
        });
    var Block$197 = PrimaryExpression$193.extend({
            properties: ['body'],
            construct: function (body$288) {
                this.body = body$288;
            }
        });
    var ArrayLiteral$198 = PrimaryExpression$193.extend({
            properties: ['array'],
            construct: function (ar$289) {
                this.array = ar$289;
            }
        });
    var ParenExpression$199 = PrimaryExpression$193.extend({
            properties: ['expr'],
            construct: function (expr$290) {
                this.expr = expr$290;
            }
        });
    var UnaryOp$200 = Expr$192.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$291, expr$292) {
                this.op = op$291;
                this.expr = expr$292;
            }
        });
    var PostfixOp$201 = Expr$192.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$293, op$294) {
                this.expr = expr$293;
                this.op = op$294;
            }
        });
    var BinOp$202 = Expr$192.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$295, left$296, right$297) {
                this.op = op$295;
                this.left = left$296;
                this.right = right$297;
            }
        });
    var ConditionalExpression$203 = Expr$192.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$298, question$299, tru$300, colon$301, fls$302) {
                this.cond = cond$298;
                this.question = question$299;
                this.tru = tru$300;
                this.colon = colon$301;
                this.fls = fls$302;
            }
        });
    var Keyword$204 = TermTree$189.extend({
            properties: ['keyword'],
            construct: function (k$303) {
                this.keyword = k$303;
            }
        });
    var Punc$205 = TermTree$189.extend({
            properties: ['punc'],
            construct: function (p$304) {
                this.punc = p$304;
            }
        });
    var Delimiter$206 = TermTree$189.extend({
            properties: ['delim'],
            construct: function (d$305) {
                this.delim = d$305;
            }
        });
    var Id$207 = PrimaryExpression$193.extend({
            properties: ['id'],
            construct: function (id$306) {
                this.id = id$306;
            }
        });
    var NamedFun$208 = Expr$192.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$307, name$308, params$309, body$310) {
                this.keyword = keyword$307;
                this.name = name$308;
                this.params = params$309;
                this.body = body$310;
            }
        });
    var AnonFun$209 = Expr$192.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$311, params$312, body$313) {
                this.keyword = keyword$311;
                this.params = params$312;
                this.body = body$313;
            }
        });
    var LetMacro$210 = TermTree$189.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$314, body$315) {
                this.name = name$314;
                this.body = body$315;
            }
        });
    var Macro$211 = TermTree$189.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$316, body$317) {
                this.name = name$316;
                this.body = body$317;
            }
        });
    var AnonMacro$212 = TermTree$189.extend({
            properties: ['body'],
            construct: function (body$318) {
                this.body = body$318;
            }
        });
    var Const$213 = Expr$192.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$319, call$320) {
                this.newterm = newterm$319;
                this.call = call$320;
            }
        });
    var Call$214 = Expr$192.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$101.assert(this.fun.hasPrototype(TermTree$189), 'expecting a term tree in destruct of call');
                var that$321 = this;
                this.delim = syntaxFromToken$175(_$100.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$100.reduce(this.args, function (acc$322, term$323) {
                    parser$101.assert(term$323 && term$323.hasPrototype(TermTree$189), 'expecting term trees in destruct of Call');
                    var dst$324 = acc$322.concat(term$323.destruct());
                    // add all commas except for the last one
                    if (that$321.commas.length > 0) {
                        dst$324 = dst$324.concat(that$321.commas.shift());
                    }
                    return dst$324;
                }, []);
                return this.fun.destruct().concat(Delimiter$206.create(this.delim).destruct());
            },
            construct: function (funn$325, args$326, delim$327, commas$328) {
                parser$101.assert(Array.isArray(args$326), 'requires an array of arguments terms');
                this.fun = funn$325;
                this.args = args$326;
                this.delim = delim$327;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$328;
            }
        });
    var ObjDotGet$215 = Expr$192.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$329, dot$330, right$331) {
                this.left = left$329;
                this.dot = dot$330;
                this.right = right$331;
            }
        });
    var ObjGet$216 = Expr$192.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$332, right$333) {
                this.left = left$332;
                this.right = right$333;
            }
        });
    var VariableDeclaration$217 = TermTree$189.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$334, eqstx$335, init$336, comma$337) {
                this.ident = ident$334;
                this.eqstx = eqstx$335;
                this.init = init$336;
                this.comma = comma$337;
            }
        });
    var VariableStatement$218 = Statement$191.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$100.reduce(this.decls, function (acc$338, decl$339) {
                    return acc$338.concat(decl$339.destruct());
                }, []));
            },
            construct: function (varkw$340, decls$341) {
                parser$101.assert(Array.isArray(decls$341), 'decls must be an array');
                this.varkw = varkw$340;
                this.decls = decls$341;
            }
        });
    var CatchClause$219 = TermTree$189.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$342, params$343, body$344) {
                this.catchkw = catchkw$342;
                this.params = params$343;
                this.body = body$344;
            }
        });
    var Module$220 = TermTree$189.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$345) {
                this.body = body$345;
                this.exports = [];
            }
        });
    var Empty$221 = TermTree$189.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$222 = TermTree$189.extend({
            properties: ['name'],
            construct: function (name$346) {
                this.name = name$346;
            }
        });
    function stxIsUnaryOp$223(stx$347) {
        var staticOperators$348 = [
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
        return _$100.contains(staticOperators$348, stx$347.token.value);
    }
    function stxIsBinOp$224(stx$349) {
        var staticOperators$350 = [
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
        return _$100.contains(staticOperators$350, stx$349.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$225(stx$351, env$352) {
        var decls$353 = [];
        var res$354 = enforest$227(stx$351, env$352);
        var result$355 = res$354.result;
        var rest$356 = res$354.rest;
        if (rest$356[0]) {
            var nextRes$357 = enforest$227(rest$356, env$352);
            // x = ...
            if (nextRes$357.result.hasPrototype(Punc$205) && nextRes$357.result.punc.token.value === '=') {
                var initializerRes$358 = enforest$227(nextRes$357.rest, env$352);
                if (initializerRes$358.rest[0]) {
                    var restRes$359 = enforest$227(initializerRes$358.rest, env$352);
                    // x = y + z, ...
                    if (restRes$359.result.hasPrototype(Punc$205) && restRes$359.result.punc.token.value === ',') {
                        decls$353.push(VariableDeclaration$217.create(result$355.id, nextRes$357.result.punc, initializerRes$358.result, restRes$359.result.punc));
                        var subRes$360 = enforestVarStatement$225(restRes$359.rest, env$352);
                        decls$353 = decls$353.concat(subRes$360.result);
                        rest$356 = subRes$360.rest;
                    } else {
                        decls$353.push(VariableDeclaration$217.create(result$355.id, nextRes$357.result.punc, initializerRes$358.result));
                        rest$356 = initializerRes$358.rest;    // x = y EOF
                    }
                } else {
                    decls$353.push(VariableDeclaration$217.create(result$355.id, nextRes$357.result.punc, initializerRes$358.result));    // x ,...;
                }
            } else if (nextRes$357.result.hasPrototype(Punc$205) && nextRes$357.result.punc.token.value === ',') {
                decls$353.push(VariableDeclaration$217.create(result$355.id, null, null, nextRes$357.result.punc));
                var subRes$360 = enforestVarStatement$225(nextRes$357.rest, env$352);
                decls$353 = decls$353.concat(subRes$360.result);
                rest$356 = subRes$360.rest;
            } else {
                if (result$355.hasPrototype(Id$207)) {
                    decls$353.push(VariableDeclaration$217.create(result$355.id));
                } else {
                    throwError$166('Expecting an identifier in variable declaration');
                }    // x EOF
            }
        } else {
            if (result$355.hasPrototype(Id$207)) {
                decls$353.push(VariableDeclaration$217.create(result$355.id));
            } else if (result$355.hasPrototype(BinOp$202) && result$355.op.token.value === 'in') {
                decls$353.push(VariableDeclaration$217.create(result$355.left.id, result$355.op, result$355.right));
            } else {
                throwError$166('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$353,
            rest: rest$356
        };
    }
    function adjustLineContext$226(stx$361, original$362) {
        var last$363 = stx$361[0] && typeof stx$361[0].token.range == 'undefined' ? original$362 : stx$361[0];
        return _$100.map(stx$361, function (stx$364) {
            if (typeof stx$364.token.range == 'undefined') {
                stx$364.token.range = last$363.token.range;
            }
            if (stx$364.token.type === parser$101.Token.Delimiter) {
                stx$364.token.sm_startLineNumber = original$362.token.lineNumber;
                stx$364.token.sm_endLineNumber = original$362.token.lineNumber;
                stx$364.token.sm_startLineStart = original$362.token.lineStart;
                stx$364.token.sm_endLineStart = original$362.token.lineStart;
                if (stx$364.token.inner.length > 0) {
                    stx$364.token.inner = adjustLineContext$226(stx$364.token.inner, original$362);
                }
                last$363 = stx$364;
                return stx$364;
            }
            stx$364.token.sm_lineNumber = original$362.token.lineNumber;
            stx$364.token.sm_lineStart = original$362.token.lineStart;
            last$363 = stx$364;
            return stx$364;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$227(toks$365, env$366) {
        env$366 = env$366 || new Map();
        parser$101.assert(toks$365.length > 0, 'enforest assumes there are tokens to work with');
        function step$367(head$368, rest$369) {
            var innerTokens$370;
            parser$101.assert(Array.isArray(rest$369), 'result must at least be an empty array');
            if (head$368.hasPrototype(TermTree$189)) {
                // function call
                var emp$373 = head$368.emp;
                var emp$373 = head$368.emp;
                var keyword$376 = head$368.keyword;
                var delim$378 = head$368.delim;
                var emp$373 = head$368.emp;
                var punc$381 = head$368.punc;
                var keyword$376 = head$368.keyword;
                var emp$373 = head$368.emp;
                var emp$373 = head$368.emp;
                var emp$373 = head$368.emp;
                var delim$378 = head$368.delim;
                var delim$378 = head$368.delim;
                var keyword$376 = head$368.keyword;
                var keyword$376 = head$368.keyword;
                if (head$368.hasPrototype(Expr$192) && (rest$369[0] && rest$369[0].token.type === parser$101.Token.Delimiter && rest$369[0].token.value === '()')) {
                    var argRes$406, enforestedArgs$407 = [], commas$408 = [];
                    rest$369[0].expose();
                    innerTokens$370 = rest$369[0].token.inner;
                    while (innerTokens$370.length > 0) {
                        argRes$406 = enforest$227(innerTokens$370, env$366);
                        enforestedArgs$407.push(argRes$406.result);
                        innerTokens$370 = argRes$406.rest;
                        if (innerTokens$370[0] && innerTokens$370[0].token.value === ',') {
                            commas$408.push(innerTokens$370[0]);
                            innerTokens$370 = innerTokens$370.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$409 = _$100.all(enforestedArgs$407, function (argTerm$410) {
                            return argTerm$410.hasPrototype(Expr$192);
                        });
                    if (innerTokens$370.length === 0 && argsAreExprs$409) {
                        return step$367(Call$214.create(head$368, enforestedArgs$407, rest$369[0], commas$408), rest$369.slice(1));
                    }
                } else if (head$368.hasPrototype(Expr$192) && (rest$369[0] && rest$369[0].token.value === '?')) {
                    var question$411 = rest$369[0];
                    var condRes$412 = enforest$227(rest$369.slice(1), env$366);
                    var truExpr$413 = condRes$412.result;
                    var right$414 = condRes$412.rest;
                    if (truExpr$413.hasPrototype(Expr$192) && right$414[0] && right$414[0].token.value === ':') {
                        var colon$415 = right$414[0];
                        var flsRes$416 = enforest$227(right$414.slice(1), env$366);
                        var flsExpr$417 = flsRes$416.result;
                        if (flsExpr$417.hasPrototype(Expr$192)) {
                            return step$367(ConditionalExpression$203.create(head$368, question$411, truExpr$413, colon$415, flsExpr$417), flsRes$416.rest);
                        }
                    }
                } else if (head$368.hasPrototype(Keyword$204) && (keyword$376.token.value === 'new' && rest$369[0])) {
                    var newCallRes$418 = enforest$227(rest$369, env$366);
                    if (newCallRes$418.result.hasPrototype(Call$214)) {
                        return step$367(Const$213.create(head$368, newCallRes$418.result), newCallRes$418.rest);
                    }
                } else if (head$368.hasPrototype(Delimiter$206) && delim$378.token.value === '()') {
                    innerTokens$370 = delim$378.token.inner;
                    if (innerTokens$370.length === 0) {
                        return step$367(ParenExpression$199.create(head$368), rest$369);
                    } else {
                        var innerTerm$419 = get_expression$228(innerTokens$370, env$366);
                        if (innerTerm$419.result && innerTerm$419.result.hasPrototype(Expr$192)) {
                            return step$367(ParenExpression$199.create(head$368), rest$369);    // if the tokens inside the paren aren't an expression
                                                                                                // we just leave it as a delimiter
                        }
                    }
                } else if (head$368.hasPrototype(TermTree$189) && (rest$369[0] && rest$369[1] && stxIsBinOp$224(rest$369[0]))) {
                    var op$420 = rest$369[0];
                    var left$421 = head$368;
                    var bopRes$422 = enforest$227(rest$369.slice(1), env$366);
                    var right$414 = bopRes$422.result;
                    if (right$414.hasPrototype(Expr$192)) {
                        return step$367(BinOp$202.create(op$420, left$421, right$414), bopRes$422.rest);
                    }
                } else if (head$368.hasPrototype(Punc$205) && stxIsUnaryOp$223(punc$381)) {
                    var unopRes$423 = enforest$227(rest$369, env$366);
                    if (unopRes$423.result.hasPrototype(Expr$192)) {
                        return step$367(UnaryOp$200.create(punc$381, unopRes$423.result), unopRes$423.rest);
                    }
                } else if (head$368.hasPrototype(Keyword$204) && stxIsUnaryOp$223(keyword$376)) {
                    var unopRes$423 = enforest$227(rest$369, env$366);
                    if (unopRes$423.result.hasPrototype(Expr$192)) {
                        return step$367(UnaryOp$200.create(keyword$376, unopRes$423.result), unopRes$423.rest);
                    }
                } else if (head$368.hasPrototype(Expr$192) && (rest$369[0] && (rest$369[0].token.value === '++' || rest$369[0].token.value === '--'))) {
                    return step$367(PostfixOp$201.create(head$368, rest$369[0]), rest$369.slice(1));
                } else if (head$368.hasPrototype(Expr$192) && (rest$369[0] && rest$369[0].token.value === '[]')) {
                    return step$367(ObjGet$216.create(head$368, Delimiter$206.create(rest$369[0].expose())), rest$369.slice(1));
                } else if (head$368.hasPrototype(Expr$192) && (rest$369[0] && rest$369[0].token.value === '.' && rest$369[1] && rest$369[1].token.type === parser$101.Token.Identifier)) {
                    return step$367(ObjDotGet$215.create(head$368, rest$369[0], rest$369[1]), rest$369.slice(2));
                } else if (head$368.hasPrototype(Delimiter$206) && delim$378.token.value === '[]') {
                    return step$367(ArrayLiteral$198.create(head$368), rest$369);
                } else if (head$368.hasPrototype(Delimiter$206) && head$368.delim.token.value === '{}') {
                    return step$367(Block$197.create(head$368), rest$369);
                } else if (head$368.hasPrototype(Keyword$204) && (keyword$376.token.value === 'let' && (rest$369[0] && rest$369[0].token.type === parser$101.Token.Identifier || rest$369[0] && rest$369[0].token.type === parser$101.Token.Keyword) && rest$369[1] && rest$369[1].token.value === '=' && rest$369[2] && rest$369[2].token.value === 'macro')) {
                    var mac$424 = enforest$227(rest$369.slice(2), env$366);
                    if (!mac$424.result.hasPrototype(AnonMacro$212)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$424.result);
                    }
                    return step$367(LetMacro$210.create(rest$369[0], mac$424.result.body), mac$424.rest);
                } else if (head$368.hasPrototype(Keyword$204) && (keyword$376.token.value === 'var' && rest$369[0])) {
                    var vsRes$425 = enforestVarStatement$225(rest$369, env$366);
                    if (vsRes$425) {
                        return step$367(VariableStatement$218.create(head$368, vsRes$425.result), vsRes$425.rest);
                    }
                }
            } else {
                parser$101.assert(head$368 && head$368.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$368.token.type === parser$101.Token.Identifier || head$368.token.type === parser$101.Token.Keyword || head$368.token.type === parser$101.Token.Punctuator) && env$366.has(resolve$179(head$368))) {
                    // pull the macro transformer out the environment
                    var transformer$426 = env$366.get(resolve$179(head$368)).fn;
                    // apply the transformer
                    var rt$427 = transformer$426([head$368].concat(rest$369), env$366);
                    if (!Array.isArray(rt$427.result)) {
                        throwError$166('Macro transformer must return a result array, not: ' + rt$427.result);
                    }
                    if (rt$427.result.length > 0) {
                        var adjustedResult$428 = adjustLineContext$226(rt$427.result, head$368);
                        return step$367(adjustedResult$428[0], adjustedResult$428.slice(1).concat(rt$427.rest));
                    } else {
                        return step$367(Empty$221.create(), rt$427.rest);    // anon macro definition
                    }
                } else if (head$368.token.type === parser$101.Token.Identifier && head$368.token.value === 'macro' && rest$369[0] && rest$369[0].token.value === '{}') {
                    return step$367(AnonMacro$212.create(rest$369[0].expose().token.inner), rest$369.slice(1));
                } else if (head$368.token.type === parser$101.Token.Identifier && head$368.token.value === 'macro' && rest$369[0] && (rest$369[0].token.type === parser$101.Token.Identifier || rest$369[0].token.type === parser$101.Token.Keyword || rest$369[0].token.type === parser$101.Token.Punctuator) && rest$369[1] && rest$369[1].token.type === parser$101.Token.Delimiter && rest$369[1].token.value === '{}') {
                    return step$367(Macro$211.create(rest$369[0], rest$369[1].expose().token.inner), rest$369.slice(2));
                } else if (head$368.token.value === 'module' && rest$369[0] && rest$369[0].token.value === '{}') {
                    return step$367(Module$220.create(rest$369[0]), rest$369.slice(1));
                } else if (head$368.token.type === parser$101.Token.Keyword && head$368.token.value === 'function' && rest$369[0] && rest$369[0].token.type === parser$101.Token.Identifier && rest$369[1] && rest$369[1].token.type === parser$101.Token.Delimiter && rest$369[1].token.value === '()' && rest$369[2] && rest$369[2].token.type === parser$101.Token.Delimiter && rest$369[2].token.value === '{}') {
                    rest$369[1].token.inner = rest$369[1].expose().token.inner;
                    rest$369[2].token.inner = rest$369[2].expose().token.inner;
                    return step$367(NamedFun$208.create(head$368, rest$369[0], rest$369[1], rest$369[2]), rest$369.slice(3));
                } else if (head$368.token.type === parser$101.Token.Keyword && head$368.token.value === 'function' && rest$369[0] && rest$369[0].token.type === parser$101.Token.Delimiter && rest$369[0].token.value === '()' && rest$369[1] && rest$369[1].token.type === parser$101.Token.Delimiter && rest$369[1].token.value === '{}') {
                    rest$369[0].token.inner = rest$369[0].expose().token.inner;
                    rest$369[1].token.inner = rest$369[1].expose().token.inner;
                    return step$367(AnonFun$209.create(head$368, rest$369[0], rest$369[1]), rest$369.slice(2));
                } else if (head$368.token.type === parser$101.Token.Keyword && head$368.token.value === 'catch' && rest$369[0] && rest$369[0].token.type === parser$101.Token.Delimiter && rest$369[0].token.value === '()' && rest$369[1] && rest$369[1].token.type === parser$101.Token.Delimiter && rest$369[1].token.value === '{}') {
                    rest$369[0].token.inner = rest$369[0].expose().token.inner;
                    rest$369[1].token.inner = rest$369[1].expose().token.inner;
                    return step$367(CatchClause$219.create(head$368, rest$369[0], rest$369[1]), rest$369.slice(2));
                } else if (head$368.token.type === parser$101.Token.Keyword && head$368.token.value === 'this') {
                    return step$367(ThisExpression$194.create(head$368), rest$369);
                } else if (head$368.token.type === parser$101.Token.NumericLiteral || head$368.token.type === parser$101.Token.StringLiteral || head$368.token.type === parser$101.Token.BooleanLiteral || head$368.token.type === parser$101.Token.RegexLiteral || head$368.token.type === parser$101.Token.NullLiteral) {
                    return step$367(Lit$195.create(head$368), rest$369);
                } else if (head$368.token.type === parser$101.Token.Identifier && head$368.token.value === 'export' && rest$369[0] && (rest$369[0].token.type === parser$101.Token.Identifier || rest$369[0].token.type === parser$101.Token.Keyword || rest$369[0].token.type === parser$101.Token.Punctuator)) {
                    return step$367(Export$222.create(rest$369[0]), rest$369.slice(1));
                } else if (head$368.token.type === parser$101.Token.Identifier) {
                    return step$367(Id$207.create(head$368), rest$369);
                } else if (head$368.token.type === parser$101.Token.Punctuator) {
                    return step$367(Punc$205.create(head$368), rest$369);
                } else if (head$368.token.type === parser$101.Token.Keyword && head$368.token.value === 'with') {
                    throwError$166('with is not supported in sweet.js');
                } else if (head$368.token.type === parser$101.Token.Keyword) {
                    return step$367(Keyword$204.create(head$368), rest$369);
                } else if (head$368.token.type === parser$101.Token.Delimiter) {
                    return step$367(Delimiter$206.create(head$368.expose()), rest$369);
                } else if (head$368.token.type === parser$101.Token.EOF) {
                    parser$101.assert(rest$369.length === 0, 'nothing should be after an EOF');
                    return step$367(EOF$190.create(head$368), []);
                } else {
                    // todo: are we missing cases?
                    parser$101.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$368,
                rest: rest$369
            };
        }
        return step$367(toks$365[0], toks$365.slice(1));
    }
    function get_expression$228(stx$429, env$430) {
        var res$431 = enforest$227(stx$429, env$430);
        if (!res$431.result.hasPrototype(Expr$192)) {
            return {
                result: null,
                rest: stx$429
            };
        }
        return res$431;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$229(newMark$432, env$433) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$434(match$435) {
            if (match$435.level === 0) {
                // replace the match property with the marked syntax
                match$435.match = _$100.map(match$435.match, function (stx$436) {
                    return stx$436.mark(newMark$432);
                });
            } else {
                _$100.each(match$435.match, function (match$437) {
                    dfs$434(match$437);
                });
            }
        }
        _$100.keys(env$433).forEach(function (key$438) {
            dfs$434(env$433[key$438]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$230(mac$439, env$440, defscope$441, templateMap$442) {
        var body$443 = mac$439.body;
        // raw function primitive form
        if (!(body$443[0] && body$443[0].token.type === parser$101.Token.Keyword && body$443[0].token.value === 'function')) {
            throwError$166('Primitive macro form must contain a function for the macro body');
        }
        var stub$444 = parser$101.read('()')[0];
        stub$444[0].token.inner = body$443;
        var expanded$445 = expand$234(stub$444, env$440, defscope$441, templateMap$442);
        expanded$445 = expanded$445[0].destruct().concat(expanded$445[1].eof);
        var flattend$446 = flatten$236(expanded$445);
        var bodyCode$447 = codegen$107.generate(parser$101.parse(flattend$446));
        var macroFn$448 = scopedEval$167(bodyCode$447, {
                makeValue: syn$102.makeValue,
                makeRegex: syn$102.makeRegex,
                makeIdent: syn$102.makeIdent,
                makeKeyword: syn$102.makeKeyword,
                makePunc: syn$102.makePunc,
                makeDelim: syn$102.makeDelim,
                unwrapSyntax: syn$102.unwrapSyntax,
                fresh: fresh$185,
                _: _$100,
                parser: parser$101,
                patternModule: patternModule$105,
                getTemplate: function (id$449) {
                    return templateMap$442.get(id$449);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$229,
                mergeMatches: function (newMatch$450, oldMatch$451) {
                    newMatch$450.patternEnv = _$100.extend({}, oldMatch$451.patternEnv, newMatch$450.patternEnv);
                    return newMatch$450;
                }
            });
        return macroFn$448;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$231(stx$452, env$453, defscope$454, templateMap$455) {
        parser$101.assert(env$453, 'environment map is required');
        // short circuit when syntax array is empty
        if (stx$452.length === 0) {
            return {
                terms: [],
                env: env$453
            };
        }
        parser$101.assert(stx$452[0].token, 'expecting a syntax object');
        var f$456 = enforest$227(stx$452, env$453);
        // head :: TermTree
        var head$457 = f$456.result;
        // rest :: [Syntax]
        var rest$458 = f$456.rest;
        if (head$457.hasPrototype(Macro$211)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$460 = loadMacroDef$230(head$457, env$453, defscope$454, templateMap$455);
            addToDefinitionCtx$232([head$457.name], defscope$454, false);
            env$453.set(resolve$179(head$457.name), { fn: macroDefinition$460 });
            return expandToTermTree$231(rest$458, env$453, defscope$454, templateMap$455);
        }
        if (head$457.hasPrototype(LetMacro$210)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$460 = loadMacroDef$230(head$457, env$453, defscope$454, templateMap$455);
            var freshName$461 = fresh$185();
            var renamedName$462 = head$457.name.rename(head$457.name, freshName$461);
            rest$458 = _$100.map(rest$458, function (stx$463) {
                return stx$463.rename(head$457.name, freshName$461);
            });
            head$457.name = renamedName$462;
            env$453.set(resolve$179(head$457.name), { fn: macroDefinition$460 });
            return expandToTermTree$231(rest$458, env$453, defscope$454, templateMap$455);
        }
        if (head$457.hasPrototype(NamedFun$208)) {
            addToDefinitionCtx$232([head$457.name], defscope$454, true);
        }
        if (head$457.hasPrototype(Id$207) && head$457.id.token.value === '#quoteSyntax' && rest$458[0] && rest$458[0].token.value === '{}') {
            var tempId$464 = fresh$185();
            templateMap$455.set(tempId$464, rest$458[0].token.inner);
            return expandToTermTree$231([
                syn$102.makeIdent('getTemplate', head$457.id),
                syn$102.makeDelim('()', [syn$102.makeValue(tempId$464, head$457.id)], head$457.id)
            ].concat(rest$458.slice(1)), env$453, defscope$454, templateMap$455);
        }
        if (head$457.hasPrototype(VariableStatement$218)) {
            addToDefinitionCtx$232(_$100.map(head$457.decls, function (decl$465) {
                return decl$465.ident;
            }), defscope$454, true);
        }
        if (head$457.hasPrototype(Block$197) && head$457.body.hasPrototype(Delimiter$206)) {
            head$457.body.delim.token.inner.forEach(function (term$466) {
                if (term$466.hasPrototype(VariableStatement$218)) {
                    addToDefinitionCtx$232(_$100.map(term$466.decls, function (decl$467) {
                        return decl$467.ident;
                    }), defscope$454, true);
                }
            });
        }
        if (head$457.hasPrototype(Delimiter$206)) {
            head$457.delim.token.inner.forEach(function (term$468) {
                if (term$468.hasPrototype(VariableStatement$218)) {
                    addToDefinitionCtx$232(_$100.map(term$468.decls, function (decl$469) {
                        return decl$469.ident;
                    }), defscope$454, true);
                }
            });
        }
        var trees$459 = expandToTermTree$231(rest$458, env$453, defscope$454, templateMap$455);
        return {
            terms: [head$457].concat(trees$459.terms),
            env: trees$459.env
        };
    }
    function addToDefinitionCtx$232(idents$470, defscope$471, skipRep$472) {
        parser$101.assert(idents$470 && idents$470.length > 0, 'expecting some variable identifiers');
        skipRep$472 = skipRep$472 || false;
        _$100.each(idents$470, function (id$473) {
            var skip$474 = false;
            if (skipRep$472) {
                var declRepeat$475 = _$100.find(defscope$471, function (def$476) {
                        return def$476.id.token.value === id$473.token.value && arraysEqual$180(marksof$178(def$476.id.context), marksof$178(id$473.context));
                    });
                skip$474 = typeof declRepeat$475 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$474) {
                var name$477 = fresh$185();
                defscope$471.push({
                    id: id$473,
                    name: name$477
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$233(term$478, env$479, defscope$480, templateMap$481) {
        parser$101.assert(env$479, 'environment map is required');
        if (term$478.hasPrototype(ArrayLiteral$198)) {
            term$478.array.delim.token.inner = expand$234(term$478.array.delim.token.inner, env$479, defscope$480, templateMap$481);
            return term$478;
        } else if (term$478.hasPrototype(Block$197)) {
            term$478.body.delim.token.inner = expand$234(term$478.body.delim.token.inner, env$479, defscope$480, templateMap$481);
            return term$478;
        } else if (term$478.hasPrototype(ParenExpression$199)) {
            term$478.expr.delim.token.inner = expand$234(term$478.expr.delim.token.inner, env$479, defscope$480, templateMap$481);
            return term$478;
        } else if (term$478.hasPrototype(Call$214)) {
            term$478.fun = expandTermTreeToFinal$233(term$478.fun, env$479, defscope$480, templateMap$481);
            term$478.args = _$100.map(term$478.args, function (arg$482) {
                return expandTermTreeToFinal$233(arg$482, env$479, defscope$480, templateMap$481);
            });
            return term$478;
        } else if (term$478.hasPrototype(UnaryOp$200)) {
            term$478.expr = expandTermTreeToFinal$233(term$478.expr, env$479, defscope$480, templateMap$481);
            return term$478;
        } else if (term$478.hasPrototype(BinOp$202)) {
            term$478.left = expandTermTreeToFinal$233(term$478.left, env$479, defscope$480, templateMap$481);
            term$478.right = expandTermTreeToFinal$233(term$478.right, env$479, defscope$480);
            return term$478;
        } else if (term$478.hasPrototype(ObjGet$216)) {
            term$478.right.delim.token.inner = expand$234(term$478.right.delim.token.inner, env$479, defscope$480, templateMap$481);
            return term$478;
        } else if (term$478.hasPrototype(ObjDotGet$215)) {
            term$478.left = expandTermTreeToFinal$233(term$478.left, env$479, defscope$480, templateMap$481);
            term$478.right = expandTermTreeToFinal$233(term$478.right, env$479, defscope$480, templateMap$481);
            return term$478;
        } else if (term$478.hasPrototype(VariableDeclaration$217)) {
            if (term$478.init) {
                term$478.init = expandTermTreeToFinal$233(term$478.init, env$479, defscope$480, templateMap$481);
            }
            return term$478;
        } else if (term$478.hasPrototype(VariableStatement$218)) {
            term$478.decls = _$100.map(term$478.decls, function (decl$483) {
                return expandTermTreeToFinal$233(decl$483, env$479, defscope$480, templateMap$481);
            });
            return term$478;
        } else if (term$478.hasPrototype(Delimiter$206)) {
            // expand inside the delimiter and then continue on
            term$478.delim.token.inner = expand$234(term$478.delim.token.inner, env$479, defscope$480, templateMap$481);
            return term$478;
        } else if (term$478.hasPrototype(NamedFun$208) || term$478.hasPrototype(AnonFun$209) || term$478.hasPrototype(CatchClause$219) || term$478.hasPrototype(Module$220)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$484 = [];
            if (term$478.params) {
                var params$493 = term$478.params.addDefCtx(newDef$484);
            } else {
                var params$493 = syn$102.makeDelim('()', [], null);
            }
            var bodies$485 = term$478.body.addDefCtx(newDef$484);
            var paramNames$486 = _$100.map(getParamIdentifiers$188(params$493), function (param$494) {
                    var freshName$495 = fresh$185();
                    return {
                        freshName: freshName$495,
                        originalParam: param$494,
                        renamedParam: param$494.rename(param$494, freshName$495)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$487 = _$100.reduce(paramNames$486, function (accBody$496, p$497) {
                    return accBody$496.rename(p$497.originalParam, p$497.freshName);
                }, bodies$485);
            renamedBody$487 = renamedBody$487.expose();
            var bodyTerms$488 = expand$234([renamedBody$487], env$479, newDef$484, templateMap$481);
            parser$101.assert(bodyTerms$488.length === 1 && bodyTerms$488[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$489 = _$100.map(paramNames$486, function (p$498) {
                    return p$498.renamedParam;
                });
            var flatArgs$490 = syn$102.makeDelim('()', joinSyntax$186(renamedParams$489, ','), term$478.params);
            var expandedArgs$491 = expand$234([flatArgs$490], env$479, newDef$484, templateMap$481);
            parser$101.assert(expandedArgs$491.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            term$478.params = expandedArgs$491[0];
            if (term$478.hasPrototype(Module$220)) {
                bodyTerms$488[0].body.delim.token.inner = _$100.filter(bodyTerms$488[0].body.delim.token.inner, function (innerTerm$499) {
                    if (innerTerm$499.hasPrototype(Export$222)) {
                        term$478.exports.push(innerTerm$499);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            var flattenedBody$492 = bodyTerms$488[0].destruct();
            flattenedBody$492 = _$100.reduce(newDef$484, function (acc$500, def$501) {
                return acc$500.rename(def$501.id, def$501.name);
            }, flattenedBody$492[0]);
            term$478.body = flattenedBody$492;
            // and continue expand the rest
            return term$478;
        }
        // the term is fine as is
        return term$478;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$234(stx$502, env$503, defscope$504, templateMap$505) {
        env$503 = env$503 || new Map();
        templateMap$505 = templateMap$505 || new Map();
        var trees$506 = expandToTermTree$231(stx$502, env$503, defscope$504, templateMap$505);
        return _$100.map(trees$506.terms, function (term$507) {
            return expandTermTreeToFinal$233(term$507, trees$506.env, defscope$504, templateMap$505);
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$235(stx$508, builtinSource$509) {
        var buildinEnv$510 = new Map();
        var env$511 = new Map();
        var params$512 = [];
        if (builtinSource$509) {
            var builtinRead$515 = parser$101.read(builtinSource$509)[0];
            builtinRead$515 = [
                syn$102.makeIdent('module', null),
                syn$102.makeDelim('{}', builtinRead$515, null)
            ];
            var builtinRes$516 = expand$234(builtinRead$515, buildinEnv$510);
            params$512 = _$100.map(builtinRes$516[0].exports, function (term$517) {
                return {
                    oldExport: term$517.name,
                    newParam: syn$102.makeIdent(term$517.name.token.value, null)
                };
            });
        }
        var modBody$513 = syn$102.makeDelim('{}', stx$508, null);
        modBody$513 = _$100.reduce(params$512, function (acc$518, param$519) {
            var newName$520 = fresh$185();
            env$511.set(resolve$179(param$519.newParam.rename(param$519.newParam, newName$520)), buildinEnv$510.get(resolve$179(param$519.oldExport)));
            return acc$518.rename(param$519.newParam, newName$520);
        }, modBody$513);
        var res$514 = expand$234([
                syn$102.makeIdent('module', null),
                modBody$513
            ], env$511);
        return flatten$236(res$514[0].body.token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$236(stx$521) {
        return _$100.reduce(stx$521, function (acc$522, stx$523) {
            if (stx$523.token.type === parser$101.Token.Delimiter) {
                var exposed$524 = stx$523.expose();
                var openParen$525 = syntaxFromToken$175({
                        type: parser$101.Token.Punctuator,
                        value: stx$523.token.value[0],
                        range: stx$523.token.startRange,
                        lineNumber: stx$523.token.startLineNumber,
                        sm_lineNumber: stx$523.token.sm_startLineNumber ? stx$523.token.sm_startLineNumber : stx$523.token.startLineNumber,
                        lineStart: stx$523.token.startLineStart,
                        sm_lineStart: stx$523.token.sm_startLineStart ? stx$523.token.sm_startLineStart : stx$523.token.startLineStart
                    }, exposed$524.context);
                var closeParen$526 = syntaxFromToken$175({
                        type: parser$101.Token.Punctuator,
                        value: stx$523.token.value[1],
                        range: stx$523.token.endRange,
                        lineNumber: stx$523.token.endLineNumber,
                        sm_lineNumber: stx$523.token.sm_endLineNumber ? stx$523.token.sm_endLineNumber : stx$523.token.endLineNumber,
                        lineStart: stx$523.token.endLineStart,
                        sm_lineStart: stx$523.token.sm_endLineStart ? stx$523.token.sm_endLineStart : stx$523.token.endLineStart
                    }, exposed$524.context);
                return acc$522.concat(openParen$525).concat(flatten$236(exposed$524.token.inner)).concat(closeParen$526);
            }
            stx$523.token.sm_lineNumber = stx$523.token.sm_lineNumber ? stx$523.token.sm_lineNumber : stx$523.token.lineNumber;
            stx$523.token.sm_lineStart = stx$523.token.sm_lineStart ? stx$523.token.sm_lineStart : stx$523.token.lineStart;
            return acc$522.concat(stx$523);
        }, []);
    }
    exports$99.enforest = enforest$227;
    exports$99.expand = expandTopLevel$235;
    exports$99.resolve = resolve$179;
    exports$99.get_expression = get_expression$228;
    exports$99.Expr = Expr$192;
    exports$99.VariableStatement = VariableStatement$218;
    exports$99.tokensToSyntax = syn$102.tokensToSyntax;
    exports$99.syntaxToTokens = syn$102.syntaxToTokens;
}));