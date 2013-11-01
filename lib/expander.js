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
                var o$236 = Object.create(this);
                if (typeof o$236.construct === 'function') {
                    o$236.construct.apply(o$236, arguments);
                }
                return o$236;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$237) {
                var result$238 = Object.create(this);
                for (var prop$239 in properties$237) {
                    if (properties$237.hasOwnProperty(prop$239)) {
                        result$238[prop$239] = properties$237[prop$239];
                    }
                }
                return result$238;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$240) {
                function F$241() {
                }
                F$241.prototype = proto$240;
                return this instanceof F$241;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$166(msg$242) {
        throw new Error(msg$242);
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
    function remdup$177(mark$243, mlist$244) {
        if (mark$243 === _$100.first(mlist$244)) {
            return _$100.rest(mlist$244, 1);
        }
        return [mark$243].concat(mlist$244);
    }
    // (CSyntax) -> [...Num]
    function marksof$178(ctx$245, stopName$246, originalName$247) {
        var mark$248, submarks$249;
        if (isMark$173(ctx$245)) {
            mark$248 = ctx$245.mark;
            submarks$249 = marksof$178(ctx$245.context, stopName$246, originalName$247);
            return remdup$177(mark$248, submarks$249);
        }
        if (isDef$172(ctx$245)) {
            return marksof$178(ctx$245.context, stopName$246, originalName$247);
        }
        if (isRename$174(ctx$245)) {
            if (stopName$246 === originalName$247 + '$' + ctx$245.name) {
                return [];
            }
            return marksof$178(ctx$245.context, stopName$246, originalName$247);
        }
        return [];
    }
    function resolve$179(stx$250) {
        return resolveCtx$183(stx$250.token.value, stx$250.context, [], []);
    }
    function arraysEqual$180(a$251, b$252) {
        if (a$251.length !== b$252.length) {
            return false;
        }
        for (var i$253 = 0; i$253 < a$251.length; i$253++) {
            if (a$251[i$253] !== b$252[i$253]) {
                return false;
            }
        }
        return true;
    }
    function renames$181(defctx$254, oldctx$255, originalName$256) {
        var acc$257 = oldctx$255;
        for (var i$258 = 0; i$258 < defctx$254.length; i$258++) {
            if (defctx$254[i$258].id.token.value === originalName$256) {
                acc$257 = Rename$168(defctx$254[i$258].id, defctx$254[i$258].name, acc$257, defctx$254);
            }
        }
        return acc$257;
    }
    function unionEl$182(arr$259, el$260) {
        if (arr$259.indexOf(el$260) === -1) {
            var res$261 = arr$259.slice(0);
            res$261.push(el$260);
            return res$261;
        }
        return arr$259;
    }
    // (Syntax) -> String
    function resolveCtx$183(originalName$262, ctx$263, stop_spine$264, stop_branch$265) {
        if (isMark$173(ctx$263)) {
            return resolveCtx$183(originalName$262, ctx$263.context, stop_spine$264, stop_branch$265);
        }
        if (isDef$172(ctx$263)) {
            if (stop_spine$264.indexOf(ctx$263.defctx) !== -1) {
                return resolveCtx$183(originalName$262, ctx$263.context, stop_spine$264, stop_branch$265);
            } else {
                return resolveCtx$183(originalName$262, renames$181(ctx$263.defctx, ctx$263.context, originalName$262), stop_spine$264, unionEl$182(stop_branch$265, ctx$263.defctx));
            }
        }
        if (isRename$174(ctx$263)) {
            if (originalName$262 === ctx$263.id.token.value) {
                var idName$266 = resolveCtx$183(ctx$263.id.token.value, ctx$263.id.context, stop_branch$265, stop_branch$265);
                var subName$267 = resolveCtx$183(originalName$262, ctx$263.context, unionEl$182(stop_spine$264, ctx$263.def), stop_branch$265);
                if (idName$266 === subName$267) {
                    var idMarks$268 = marksof$178(ctx$263.id.context, originalName$262 + '$' + ctx$263.name, originalName$262);
                    var subMarks$269 = marksof$178(ctx$263.context, originalName$262 + '$' + ctx$263.name, originalName$262);
                    if (arraysEqual$180(idMarks$268, subMarks$269)) {
                        return originalName$262 + '$' + ctx$263.name;
                    }
                }
            }
            return resolveCtx$183(originalName$262, ctx$263.context, unionEl$182(stop_spine$264, ctx$263.def), stop_branch$265);
        }
        return originalName$262;
    }
    var nextFresh$184 = 0;
    // fun () -> Num
    function fresh$185() {
        return nextFresh$184++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$186(towrap$270, delimSyntax$271) {
        parser$101.assert(delimSyntax$271.token.type === parser$101.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$175({
            type: parser$101.Token.Delimiter,
            value: delimSyntax$271.token.value,
            inner: towrap$270,
            range: delimSyntax$271.token.range,
            startLineNumber: delimSyntax$271.token.startLineNumber,
            lineStart: delimSyntax$271.token.lineStart
        }, delimSyntax$271);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$187(argSyntax$272) {
        parser$101.assert(argSyntax$272.token.type === parser$101.Token.Delimiter, 'expecting delimiter for function params');
        return _$100.filter(argSyntax$272.token.inner, function (stx$273) {
            return stx$273.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$188 = {
            destruct: function () {
                return _$100.reduce(this.properties, _$100.bind(function (acc$274, prop$275) {
                    if (this[prop$275] && this[prop$275].hasPrototype(TermTree$188)) {
                        return acc$274.concat(this[prop$275].destruct());
                    } else if (this[prop$275] && this[prop$275].token && this[prop$275].token.inner) {
                        this[prop$275].token.inner = _$100.reduce(this[prop$275].token.inner, function (acc$276, t$277) {
                            if (t$277.hasPrototype(TermTree$188)) {
                                return acc$276.concat(t$277.destruct());
                            }
                            return acc$276.concat(t$277);
                        }, []);
                        return acc$274.concat(this[prop$275]);
                    } else if (this[prop$275]) {
                        return acc$274.concat(this[prop$275]);
                    } else {
                        return acc$274;
                    }
                }, this), []);
            }
        };
    var EOF$189 = TermTree$188.extend({
            properties: ['eof'],
            construct: function (e$278) {
                this.eof = e$278;
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
            construct: function (that$279) {
                this.this = that$279;
            }
        });
    var Lit$194 = PrimaryExpression$192.extend({
            properties: ['lit'],
            construct: function (l$280) {
                this.lit = l$280;
            }
        });
    exports$99._test.PropertyAssignment = PropertyAssignment$195;
    var PropertyAssignment$195 = TermTree$188.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$281, assignment$282) {
                this.propName = propName$281;
                this.assignment = assignment$282;
            }
        });
    var Block$196 = PrimaryExpression$192.extend({
            properties: ['body'],
            construct: function (body$283) {
                this.body = body$283;
            }
        });
    var ArrayLiteral$197 = PrimaryExpression$192.extend({
            properties: ['array'],
            construct: function (ar$284) {
                this.array = ar$284;
            }
        });
    var ParenExpression$198 = PrimaryExpression$192.extend({
            properties: ['expr'],
            construct: function (expr$285) {
                this.expr = expr$285;
            }
        });
    var UnaryOp$199 = Expr$191.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$286, expr$287) {
                this.op = op$286;
                this.expr = expr$287;
            }
        });
    var PostfixOp$200 = Expr$191.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$288, op$289) {
                this.expr = expr$288;
                this.op = op$289;
            }
        });
    var BinOp$201 = Expr$191.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$290, left$291, right$292) {
                this.op = op$290;
                this.left = left$291;
                this.right = right$292;
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
            construct: function (cond$293, question$294, tru$295, colon$296, fls$297) {
                this.cond = cond$293;
                this.question = question$294;
                this.tru = tru$295;
                this.colon = colon$296;
                this.fls = fls$297;
            }
        });
    var Keyword$203 = TermTree$188.extend({
            properties: ['keyword'],
            construct: function (k$298) {
                this.keyword = k$298;
            }
        });
    var Punc$204 = TermTree$188.extend({
            properties: ['punc'],
            construct: function (p$299) {
                this.punc = p$299;
            }
        });
    var Delimiter$205 = TermTree$188.extend({
            properties: ['delim'],
            construct: function (d$300) {
                this.delim = d$300;
            }
        });
    var Id$206 = PrimaryExpression$192.extend({
            properties: ['id'],
            construct: function (id$301) {
                this.id = id$301;
            }
        });
    var NamedFun$207 = Expr$191.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$302, name$303, params$304, body$305) {
                this.keyword = keyword$302;
                this.name = name$303;
                this.params = params$304;
                this.body = body$305;
            }
        });
    var AnonFun$208 = Expr$191.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$306, params$307, body$308) {
                this.keyword = keyword$306;
                this.params = params$307;
                this.body = body$308;
            }
        });
    var LetMacro$209 = TermTree$188.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$309, body$310) {
                this.name = name$309;
                this.body = body$310;
            }
        });
    var Macro$210 = TermTree$188.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$311, body$312) {
                this.name = name$311;
                this.body = body$312;
            }
        });
    var AnonMacro$211 = TermTree$188.extend({
            properties: ['body'],
            construct: function (body$313) {
                this.body = body$313;
            }
        });
    var Const$212 = Expr$191.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$314, call$315) {
                this.newterm = newterm$314;
                this.call = call$315;
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
                var that$316 = this;
                this.delim = syntaxFromToken$175(_$100.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$100.reduce(this.args, function (acc$317, term$318) {
                    parser$101.assert(term$318 && term$318.hasPrototype(TermTree$188), 'expecting term trees in destruct of Call');
                    var dst$319 = acc$317.concat(term$318.destruct());
                    // add all commas except for the last one
                    if (that$316.commas.length > 0) {
                        dst$319 = dst$319.concat(that$316.commas.shift());
                    }
                    return dst$319;
                }, []);
                return this.fun.destruct().concat(Delimiter$205.create(this.delim).destruct());
            },
            construct: function (funn$320, args$321, delim$322, commas$323) {
                parser$101.assert(Array.isArray(args$321), 'requires an array of arguments terms');
                this.fun = funn$320;
                this.args = args$321;
                this.delim = delim$322;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$323;
            }
        });
    var ObjDotGet$214 = Expr$191.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$324, dot$325, right$326) {
                this.left = left$324;
                this.dot = dot$325;
                this.right = right$326;
            }
        });
    var ObjGet$215 = Expr$191.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$327, right$328) {
                this.left = left$327;
                this.right = right$328;
            }
        });
    var VariableDeclaration$216 = TermTree$188.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$329, eqstx$330, init$331, comma$332) {
                this.ident = ident$329;
                this.eqstx = eqstx$330;
                this.init = init$331;
                this.comma = comma$332;
            }
        });
    var VariableStatement$217 = Statement$190.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$100.reduce(this.decls, function (acc$333, decl$334) {
                    return acc$333.concat(decl$334.destruct());
                }, []));
            },
            construct: function (varkw$335, decls$336) {
                parser$101.assert(Array.isArray(decls$336), 'decls must be an array');
                this.varkw = varkw$335;
                this.decls = decls$336;
            }
        });
    var CatchClause$218 = TermTree$188.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$337, params$338, body$339) {
                this.catchkw = catchkw$337;
                this.params = params$338;
                this.body = body$339;
            }
        });
    var Module$219 = TermTree$188.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$340) {
                this.body = body$340;
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
            construct: function (name$341) {
                this.name = name$341;
            }
        });
    function stxIsUnaryOp$222(stx$342) {
        var staticOperators$343 = [
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
        return _$100.contains(staticOperators$343, stx$342.token.value);
    }
    function stxIsBinOp$223(stx$344) {
        var staticOperators$345 = [
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
        return _$100.contains(staticOperators$345, stx$344.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$224(stx$346, env$347) {
        var decls$348 = [];
        var res$349 = enforest$226(stx$346, env$347);
        var result$350 = res$349.result;
        var rest$351 = res$349.rest;
        if (rest$351[0]) {
            var nextRes$352 = enforest$226(rest$351, env$347);
            // x = ...
            if (nextRes$352.result.hasPrototype(Punc$204) && nextRes$352.result.punc.token.value === '=') {
                var initializerRes$353 = enforest$226(nextRes$352.rest, env$347);
                if (initializerRes$353.rest[0]) {
                    var restRes$354 = enforest$226(initializerRes$353.rest, env$347);
                    // x = y + z, ...
                    if (restRes$354.result.hasPrototype(Punc$204) && restRes$354.result.punc.token.value === ',') {
                        decls$348.push(VariableDeclaration$216.create(result$350.id, nextRes$352.result.punc, initializerRes$353.result, restRes$354.result.punc));
                        var subRes$355 = enforestVarStatement$224(restRes$354.rest, env$347);
                        decls$348 = decls$348.concat(subRes$355.result);
                        rest$351 = subRes$355.rest;
                    } else {
                        decls$348.push(VariableDeclaration$216.create(result$350.id, nextRes$352.result.punc, initializerRes$353.result));
                        rest$351 = initializerRes$353.rest;    // x = y EOF
                    }
                } else {
                    decls$348.push(VariableDeclaration$216.create(result$350.id, nextRes$352.result.punc, initializerRes$353.result));    // x ,...;
                }
            } else if (nextRes$352.result.hasPrototype(Punc$204) && nextRes$352.result.punc.token.value === ',') {
                decls$348.push(VariableDeclaration$216.create(result$350.id, null, null, nextRes$352.result.punc));
                var subRes$355 = enforestVarStatement$224(nextRes$352.rest, env$347);
                decls$348 = decls$348.concat(subRes$355.result);
                rest$351 = subRes$355.rest;
            } else {
                if (result$350.hasPrototype(Id$206)) {
                    decls$348.push(VariableDeclaration$216.create(result$350.id));
                } else {
                    throwError$166('Expecting an identifier in variable declaration');
                }    // x EOF
            }
        } else {
            if (result$350.hasPrototype(Id$206)) {
                decls$348.push(VariableDeclaration$216.create(result$350.id));
            } else if (result$350.hasPrototype(BinOp$201) && result$350.op.token.value === 'in') {
                decls$348.push(VariableDeclaration$216.create(result$350.left.id, result$350.op, result$350.right));
            } else {
                throwError$166('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$348,
            rest: rest$351
        };
    }
    function adjustLineContext$225(stx$356, original$357) {
        var last$358 = stx$356[0] && typeof stx$356[0].token.range == 'undefined' ? original$357 : stx$356[0];
        return _$100.map(stx$356, function (stx$359) {
            if (typeof stx$359.token.range == 'undefined') {
                stx$359.token.range = last$358.token.range;
            }
            if (stx$359.token.type === parser$101.Token.Delimiter) {
                stx$359.token.sm_startLineNumber = original$357.token.lineNumber;
                stx$359.token.sm_endLineNumber = original$357.token.lineNumber;
                stx$359.token.sm_startLineStart = original$357.token.lineStart;
                stx$359.token.sm_endLineStart = original$357.token.lineStart;
                if (stx$359.token.inner.length > 0) {
                    stx$359.token.inner = adjustLineContext$225(stx$359.token.inner, original$357);
                }
                last$358 = stx$359;
                return stx$359;
            }
            stx$359.token.sm_lineNumber = original$357.token.lineNumber;
            stx$359.token.sm_lineStart = original$357.token.lineStart;
            last$358 = stx$359;
            return stx$359;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$226(toks$360, env$361) {
        env$361 = env$361 || new Map();
        parser$101.assert(toks$360.length > 0, 'enforest assumes there are tokens to work with');
        function step$362(head$363, rest$364) {
            var innerTokens$365;
            parser$101.assert(Array.isArray(rest$364), 'result must at least be an empty array');
            if (head$363.hasPrototype(TermTree$188)) {
                // function call
                var emp$368 = head$363.emp;
                var emp$368 = head$363.emp;
                var keyword$371 = head$363.keyword;
                var delim$373 = head$363.delim;
                var emp$368 = head$363.emp;
                var punc$376 = head$363.punc;
                var keyword$371 = head$363.keyword;
                var emp$368 = head$363.emp;
                var emp$368 = head$363.emp;
                var emp$368 = head$363.emp;
                var delim$373 = head$363.delim;
                var delim$373 = head$363.delim;
                var keyword$371 = head$363.keyword;
                var keyword$371 = head$363.keyword;
                if (head$363.hasPrototype(Expr$191) && (rest$364[0] && rest$364[0].token.type === parser$101.Token.Delimiter && rest$364[0].token.value === '()')) {
                    var argRes$401, enforestedArgs$402 = [], commas$403 = [];
                    rest$364[0].expose();
                    innerTokens$365 = rest$364[0].token.inner;
                    while (innerTokens$365.length > 0) {
                        argRes$401 = enforest$226(innerTokens$365, env$361);
                        enforestedArgs$402.push(argRes$401.result);
                        innerTokens$365 = argRes$401.rest;
                        if (innerTokens$365[0] && innerTokens$365[0].token.value === ',') {
                            commas$403.push(innerTokens$365[0]);
                            innerTokens$365 = innerTokens$365.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$404 = _$100.all(enforestedArgs$402, function (argTerm$405) {
                            return argTerm$405.hasPrototype(Expr$191);
                        });
                    if (innerTokens$365.length === 0 && argsAreExprs$404) {
                        return step$362(Call$213.create(head$363, enforestedArgs$402, rest$364[0], commas$403), rest$364.slice(1));
                    }
                } else if (head$363.hasPrototype(Expr$191) && (rest$364[0] && rest$364[0].token.value === '?')) {
                    var question$406 = rest$364[0];
                    var condRes$407 = enforest$226(rest$364.slice(1), env$361);
                    var truExpr$408 = condRes$407.result;
                    var right$409 = condRes$407.rest;
                    if (truExpr$408.hasPrototype(Expr$191) && right$409[0] && right$409[0].token.value === ':') {
                        var colon$410 = right$409[0];
                        var flsRes$411 = enforest$226(right$409.slice(1), env$361);
                        var flsExpr$412 = flsRes$411.result;
                        if (flsExpr$412.hasPrototype(Expr$191)) {
                            return step$362(ConditionalExpression$202.create(head$363, question$406, truExpr$408, colon$410, flsExpr$412), flsRes$411.rest);
                        }
                    }
                } else if (head$363.hasPrototype(Keyword$203) && (keyword$371.token.value === 'new' && rest$364[0])) {
                    var newCallRes$413 = enforest$226(rest$364, env$361);
                    if (newCallRes$413.result.hasPrototype(Call$213)) {
                        return step$362(Const$212.create(head$363, newCallRes$413.result), newCallRes$413.rest);
                    }
                } else if (head$363.hasPrototype(Delimiter$205) && delim$373.token.value === '()') {
                    innerTokens$365 = delim$373.token.inner;
                    if (innerTokens$365.length === 0) {
                        return step$362(ParenExpression$198.create(head$363), rest$364);
                    } else {
                        var innerTerm$414 = get_expression$227(innerTokens$365, env$361);
                        if (innerTerm$414.result && innerTerm$414.result.hasPrototype(Expr$191)) {
                            return step$362(ParenExpression$198.create(head$363), rest$364);
                        }
                    }
                } else if (head$363.hasPrototype(TermTree$188) && (rest$364[0] && rest$364[1] && stxIsBinOp$223(rest$364[0]))) {
                    var op$415 = rest$364[0];
                    var left$416 = head$363;
                    var bopRes$417 = enforest$226(rest$364.slice(1), env$361);
                    var right$409 = bopRes$417.result;
                    if (right$409.hasPrototype(Expr$191)) {
                        return step$362(BinOp$201.create(op$415, left$416, right$409), bopRes$417.rest);
                    }
                } else if (head$363.hasPrototype(Punc$204) && stxIsUnaryOp$222(punc$376)) {
                    var unopRes$418 = enforest$226(rest$364, env$361);
                    if (unopRes$418.result.hasPrototype(Expr$191)) {
                        return step$362(UnaryOp$199.create(punc$376, unopRes$418.result), unopRes$418.rest);
                    }
                } else if (head$363.hasPrototype(Keyword$203) && stxIsUnaryOp$222(keyword$371)) {
                    var unopRes$418 = enforest$226(rest$364, env$361);
                    if (unopRes$418.result.hasPrototype(Expr$191)) {
                        return step$362(UnaryOp$199.create(keyword$371, unopRes$418.result), unopRes$418.rest);
                    }
                } else if (head$363.hasPrototype(Expr$191) && (rest$364[0] && (rest$364[0].token.value === '++' || rest$364[0].token.value === '--'))) {
                    return step$362(PostfixOp$200.create(head$363, rest$364[0]), rest$364.slice(1));
                } else if (head$363.hasPrototype(Expr$191) && (rest$364[0] && rest$364[0].token.value === '[]')) {
                    return step$362(ObjGet$215.create(head$363, Delimiter$205.create(rest$364[0].expose())), rest$364.slice(1));
                } else if (head$363.hasPrototype(Expr$191) && (rest$364[0] && rest$364[0].token.value === '.' && rest$364[1] && rest$364[1].token.type === parser$101.Token.Identifier)) {
                    return step$362(ObjDotGet$214.create(head$363, rest$364[0], rest$364[1]), rest$364.slice(2));
                } else if (head$363.hasPrototype(Delimiter$205) && delim$373.token.value === '[]') {
                    return step$362(ArrayLiteral$197.create(head$363), rest$364);
                } else if (head$363.hasPrototype(Delimiter$205) && head$363.delim.token.value === '{}') {
                    return step$362(Block$196.create(head$363), rest$364);
                } else if (head$363.hasPrototype(Keyword$203) && (keyword$371.token.value === 'let' && (rest$364[0] && rest$364[0].token.type === parser$101.Token.Identifier || rest$364[0] && rest$364[0].token.type === parser$101.Token.Keyword) && rest$364[1] && rest$364[1].token.value === '=' && rest$364[2] && rest$364[2].token.value === 'macro')) {
                    var mac$419 = enforest$226(rest$364.slice(2), env$361);
                    if (!mac$419.result.hasPrototype(AnonMacro$211)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$419.result);
                    }
                    return step$362(LetMacro$209.create(rest$364[0], mac$419.result.body), mac$419.rest);
                } else if (head$363.hasPrototype(Keyword$203) && (keyword$371.token.value === 'var' && rest$364[0])) {
                    var vsRes$420 = enforestVarStatement$224(rest$364, env$361);
                    if (vsRes$420) {
                        return step$362(VariableStatement$217.create(head$363, vsRes$420.result), vsRes$420.rest);
                    }
                }
            } else {
                parser$101.assert(head$363 && head$363.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$363.token.type === parser$101.Token.Identifier || head$363.token.type === parser$101.Token.Keyword || head$363.token.type === parser$101.Token.Punctuator) && env$361.has(resolve$179(head$363))) {
                    // pull the macro transformer out the environment
                    var transformer$421 = env$361.get(resolve$179(head$363)).fn;
                    // apply the transformer
                    var rt$422 = transformer$421([head$363].concat(rest$364), env$361);
                    if (!Array.isArray(rt$422.result)) {
                        throwError$166('Macro transformer must return a result array, not: ' + rt$422.result);
                    }
                    if (rt$422.result.length > 0) {
                        var adjustedResult$423 = adjustLineContext$225(rt$422.result, head$363);
                        adjustedResult$423[0].token.leadingComments = head$363.token.leadingComments;
                        return step$362(adjustedResult$423[0], adjustedResult$423.slice(1).concat(rt$422.rest));
                    } else {
                        return step$362(Empty$220.create(), rt$422.rest);    // anon macro definition
                    }
                } else if (head$363.token.type === parser$101.Token.Identifier && head$363.token.value === 'macro' && rest$364[0] && rest$364[0].token.value === '{}') {
                    return step$362(AnonMacro$211.create(rest$364[0].expose().token.inner), rest$364.slice(1));
                } else if (head$363.token.type === parser$101.Token.Identifier && head$363.token.value === 'macro' && rest$364[0] && (rest$364[0].token.type === parser$101.Token.Identifier || rest$364[0].token.type === parser$101.Token.Keyword || rest$364[0].token.type === parser$101.Token.Punctuator) && rest$364[1] && rest$364[1].token.type === parser$101.Token.Delimiter && rest$364[1].token.value === '{}') {
                    return step$362(Macro$210.create(rest$364[0], rest$364[1].expose().token.inner), rest$364.slice(2));
                } else if (head$363.token.value === 'module' && rest$364[0] && rest$364[0].token.value === '{}') {
                    return step$362(Module$219.create(rest$364[0]), rest$364.slice(1));
                } else if (head$363.token.type === parser$101.Token.Keyword && head$363.token.value === 'function' && rest$364[0] && rest$364[0].token.type === parser$101.Token.Identifier && rest$364[1] && rest$364[1].token.type === parser$101.Token.Delimiter && rest$364[1].token.value === '()' && rest$364[2] && rest$364[2].token.type === parser$101.Token.Delimiter && rest$364[2].token.value === '{}') {
                    rest$364[1].token.inner = rest$364[1].expose().token.inner;
                    rest$364[2].token.inner = rest$364[2].expose().token.inner;
                    return step$362(NamedFun$207.create(head$363, rest$364[0], rest$364[1], rest$364[2]), rest$364.slice(3));
                } else if (head$363.token.type === parser$101.Token.Keyword && head$363.token.value === 'function' && rest$364[0] && rest$364[0].token.type === parser$101.Token.Delimiter && rest$364[0].token.value === '()' && rest$364[1] && rest$364[1].token.type === parser$101.Token.Delimiter && rest$364[1].token.value === '{}') {
                    rest$364[0].token.inner = rest$364[0].expose().token.inner;
                    rest$364[1].token.inner = rest$364[1].expose().token.inner;
                    return step$362(AnonFun$208.create(head$363, rest$364[0], rest$364[1]), rest$364.slice(2));
                } else if (head$363.token.type === parser$101.Token.Keyword && head$363.token.value === 'catch' && rest$364[0] && rest$364[0].token.type === parser$101.Token.Delimiter && rest$364[0].token.value === '()' && rest$364[1] && rest$364[1].token.type === parser$101.Token.Delimiter && rest$364[1].token.value === '{}') {
                    rest$364[0].token.inner = rest$364[0].expose().token.inner;
                    rest$364[1].token.inner = rest$364[1].expose().token.inner;
                    return step$362(CatchClause$218.create(head$363, rest$364[0], rest$364[1]), rest$364.slice(2));
                } else if (head$363.token.type === parser$101.Token.Keyword && head$363.token.value === 'this') {
                    return step$362(ThisExpression$193.create(head$363), rest$364);
                } else if (head$363.token.type === parser$101.Token.NumericLiteral || head$363.token.type === parser$101.Token.StringLiteral || head$363.token.type === parser$101.Token.BooleanLiteral || head$363.token.type === parser$101.Token.RegexLiteral || head$363.token.type === parser$101.Token.NullLiteral) {
                    return step$362(Lit$194.create(head$363), rest$364);
                } else if (head$363.token.type === parser$101.Token.Identifier && head$363.token.value === 'export' && rest$364[0] && (rest$364[0].token.type === parser$101.Token.Identifier || rest$364[0].token.type === parser$101.Token.Keyword || rest$364[0].token.type === parser$101.Token.Punctuator)) {
                    return step$362(Export$221.create(rest$364[0]), rest$364.slice(1));
                } else if (head$363.token.type === parser$101.Token.Identifier) {
                    return step$362(Id$206.create(head$363), rest$364);
                } else if (head$363.token.type === parser$101.Token.Punctuator) {
                    return step$362(Punc$204.create(head$363), rest$364);
                } else if (head$363.token.type === parser$101.Token.Keyword && head$363.token.value === 'with') {
                    throwError$166('with is not supported in sweet.js');
                } else if (head$363.token.type === parser$101.Token.Keyword) {
                    return step$362(Keyword$203.create(head$363), rest$364);
                } else if (head$363.token.type === parser$101.Token.Delimiter) {
                    return step$362(Delimiter$205.create(head$363.expose()), rest$364);
                } else if (head$363.token.type === parser$101.Token.EOF) {
                    parser$101.assert(rest$364.length === 0, 'nothing should be after an EOF');
                    return step$362(EOF$189.create(head$363), []);
                } else {
                    // todo: are we missing cases?
                    parser$101.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$363,
                rest: rest$364
            };
        }
        return step$362(toks$360[0], toks$360.slice(1));
    }
    function get_expression$227(stx$424, env$425) {
        var res$426 = enforest$226(stx$424, env$425);
        if (!res$426.result.hasPrototype(Expr$191)) {
            return {
                result: null,
                rest: stx$424
            };
        }
        return res$426;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$228(newMark$427, env$428) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$429(match$430) {
            if (match$430.level === 0) {
                // replace the match property with the marked syntax
                match$430.match = _$100.map(match$430.match, function (stx$431) {
                    return stx$431.mark(newMark$427);
                });
            } else {
                _$100.each(match$430.match, function (match$432) {
                    dfs$429(match$432);
                });
            }
        }
        _$100.keys(env$428).forEach(function (key$433) {
            dfs$429(env$428[key$433]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$229(mac$434, env$435, defscope$436, templateMap$437) {
        var body$438 = mac$434.body;
        // raw function primitive form
        if (!(body$438[0] && body$438[0].token.type === parser$101.Token.Keyword && body$438[0].token.value === 'function')) {
            throwError$166('Primitive macro form must contain a function for the macro body');
        }
        var stub$439 = parser$101.read('()');
        stub$439[0].token.inner = body$438;
        var expanded$440 = expand$233(stub$439, env$435, defscope$436, templateMap$437);
        expanded$440 = expanded$440[0].destruct().concat(expanded$440[1].eof);
        var flattend$441 = flatten$235(expanded$440);
        var bodyCode$442 = codegen$107.generate(parser$101.parse(flattend$441));
        var macroFn$443 = scopedEval$167(bodyCode$442, {
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
                getTemplate: function (id$444) {
                    return templateMap$437.get(id$444);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$228,
                mergeMatches: function (newMatch$445, oldMatch$446) {
                    newMatch$445.patternEnv = _$100.extend({}, oldMatch$446.patternEnv, newMatch$445.patternEnv);
                    return newMatch$445;
                }
            });
        return macroFn$443;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$230(stx$447, env$448, defscope$449, templateMap$450) {
        parser$101.assert(env$448, 'environment map is required');
        // short circuit when syntax array is empty
        if (stx$447.length === 0) {
            return {
                terms: [],
                env: env$448
            };
        }
        parser$101.assert(stx$447[0].token, 'expecting a syntax object');
        var f$451 = enforest$226(stx$447, env$448);
        // head :: TermTree
        var head$452 = f$451.result;
        // rest :: [Syntax]
        var rest$453 = f$451.rest;
        if (head$452.hasPrototype(Macro$210)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$455 = loadMacroDef$229(head$452, env$448, defscope$449, templateMap$450);
            addToDefinitionCtx$231([head$452.name], defscope$449, false);
            env$448.set(resolve$179(head$452.name), { fn: macroDefinition$455 });
            return expandToTermTree$230(rest$453, env$448, defscope$449, templateMap$450);
        }
        if (head$452.hasPrototype(LetMacro$209)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$455 = loadMacroDef$229(head$452, env$448, defscope$449, templateMap$450);
            var freshName$456 = fresh$185();
            var renamedName$457 = head$452.name.rename(head$452.name, freshName$456);
            rest$453 = _$100.map(rest$453, function (stx$458) {
                return stx$458.rename(head$452.name, freshName$456);
            });
            head$452.name = renamedName$457;
            env$448.set(resolve$179(head$452.name), { fn: macroDefinition$455 });
            return expandToTermTree$230(rest$453, env$448, defscope$449, templateMap$450);
        }
        if (head$452.hasPrototype(NamedFun$207)) {
            addToDefinitionCtx$231([head$452.name], defscope$449, true);
        }
        if (head$452.hasPrototype(Id$206) && head$452.id.token.value === '#quoteSyntax' && rest$453[0] && rest$453[0].token.value === '{}') {
            var tempId$459 = fresh$185();
            templateMap$450.set(tempId$459, rest$453[0].token.inner);
            return expandToTermTree$230([
                syn$102.makeIdent('getTemplate', head$452.id),
                syn$102.makeDelim('()', [syn$102.makeValue(tempId$459, head$452.id)], head$452.id)
            ].concat(rest$453.slice(1)), env$448, defscope$449, templateMap$450);
        }
        if (head$452.hasPrototype(VariableStatement$217)) {
            addToDefinitionCtx$231(_$100.map(head$452.decls, function (decl$460) {
                return decl$460.ident;
            }), defscope$449, true);
        }
        if (head$452.hasPrototype(Block$196) && head$452.body.hasPrototype(Delimiter$205)) {
            head$452.body.delim.token.inner.forEach(function (term$461) {
                if (term$461.hasPrototype(VariableStatement$217)) {
                    addToDefinitionCtx$231(_$100.map(term$461.decls, function (decl$462) {
                        return decl$462.ident;
                    }), defscope$449, true);
                }
            });
        }
        if (head$452.hasPrototype(Delimiter$205)) {
            head$452.delim.token.inner.forEach(function (term$463) {
                if (term$463.hasPrototype(VariableStatement$217)) {
                    addToDefinitionCtx$231(_$100.map(term$463.decls, function (decl$464) {
                        return decl$464.ident;
                    }), defscope$449, true);
                }
            });
        }
        var trees$454 = expandToTermTree$230(rest$453, env$448, defscope$449, templateMap$450);
        return {
            terms: [head$452].concat(trees$454.terms),
            env: trees$454.env
        };
    }
    function addToDefinitionCtx$231(idents$465, defscope$466, skipRep$467) {
        parser$101.assert(idents$465 && idents$465.length > 0, 'expecting some variable identifiers');
        skipRep$467 = skipRep$467 || false;
        _$100.each(idents$465, function (id$468) {
            var skip$469 = false;
            if (skipRep$467) {
                var declRepeat$470 = _$100.find(defscope$466, function (def$471) {
                        return def$471.id.token.value === id$468.token.value && arraysEqual$180(marksof$178(def$471.id.context), marksof$178(id$468.context));
                    });
                skip$469 = typeof declRepeat$470 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$469) {
                var name$472 = fresh$185();
                defscope$466.push({
                    id: id$468,
                    name: name$472
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$232(term$473, env$474, defscope$475, templateMap$476) {
        parser$101.assert(env$474, 'environment map is required');
        if (term$473.hasPrototype(ArrayLiteral$197)) {
            term$473.array.delim.token.inner = expand$233(term$473.array.delim.token.inner, env$474, defscope$475, templateMap$476);
            return term$473;
        } else if (term$473.hasPrototype(Block$196)) {
            term$473.body.delim.token.inner = expand$233(term$473.body.delim.token.inner, env$474, defscope$475, templateMap$476);
            return term$473;
        } else if (term$473.hasPrototype(ParenExpression$198)) {
            term$473.expr.delim.token.inner = expand$233(term$473.expr.delim.token.inner, env$474, defscope$475, templateMap$476);
            return term$473;
        } else if (term$473.hasPrototype(Call$213)) {
            term$473.fun = expandTermTreeToFinal$232(term$473.fun, env$474, defscope$475, templateMap$476);
            term$473.args = _$100.map(term$473.args, function (arg$477) {
                return expandTermTreeToFinal$232(arg$477, env$474, defscope$475, templateMap$476);
            });
            return term$473;
        } else if (term$473.hasPrototype(UnaryOp$199)) {
            term$473.expr = expandTermTreeToFinal$232(term$473.expr, env$474, defscope$475, templateMap$476);
            return term$473;
        } else if (term$473.hasPrototype(BinOp$201)) {
            term$473.left = expandTermTreeToFinal$232(term$473.left, env$474, defscope$475, templateMap$476);
            term$473.right = expandTermTreeToFinal$232(term$473.right, env$474, defscope$475);
            return term$473;
        } else if (term$473.hasPrototype(ObjGet$215)) {
            term$473.right.delim.token.inner = expand$233(term$473.right.delim.token.inner, env$474, defscope$475, templateMap$476);
            return term$473;
        } else if (term$473.hasPrototype(ObjDotGet$214)) {
            term$473.left = expandTermTreeToFinal$232(term$473.left, env$474, defscope$475, templateMap$476);
            term$473.right = expandTermTreeToFinal$232(term$473.right, env$474, defscope$475, templateMap$476);
            return term$473;
        } else if (term$473.hasPrototype(VariableDeclaration$216)) {
            if (term$473.init) {
                term$473.init = expandTermTreeToFinal$232(term$473.init, env$474, defscope$475, templateMap$476);
            }
            return term$473;
        } else if (term$473.hasPrototype(VariableStatement$217)) {
            term$473.decls = _$100.map(term$473.decls, function (decl$478) {
                return expandTermTreeToFinal$232(decl$478, env$474, defscope$475, templateMap$476);
            });
            return term$473;
        } else if (term$473.hasPrototype(Delimiter$205)) {
            // expand inside the delimiter and then continue on
            term$473.delim.token.inner = expand$233(term$473.delim.token.inner, env$474, defscope$475, templateMap$476);
            return term$473;
        } else if (term$473.hasPrototype(NamedFun$207) || term$473.hasPrototype(AnonFun$208) || term$473.hasPrototype(CatchClause$218) || term$473.hasPrototype(Module$219)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$479 = [];
            if (term$473.params) {
                var params$488 = term$473.params.addDefCtx(newDef$479);
            } else {
                var params$488 = syn$102.makeDelim('()', [], null);
            }
            var bodies$480 = term$473.body.addDefCtx(newDef$479);
            var paramNames$481 = _$100.map(getParamIdentifiers$187(params$488), function (param$489) {
                    var freshName$490 = fresh$185();
                    return {
                        freshName: freshName$490,
                        originalParam: param$489,
                        renamedParam: param$489.rename(param$489, freshName$490)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$482 = _$100.reduce(paramNames$481, function (accBody$491, p$492) {
                    return accBody$491.rename(p$492.originalParam, p$492.freshName);
                }, bodies$480);
            renamedBody$482 = renamedBody$482.expose();
            var bodyTerms$483 = expand$233([renamedBody$482], env$474, newDef$479, templateMap$476);
            parser$101.assert(bodyTerms$483.length === 1 && bodyTerms$483[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$484 = _$100.map(paramNames$481, function (p$493) {
                    return p$493.renamedParam;
                });
            var flatArgs$485 = syn$102.makeDelim('()', joinSyntax$176(renamedParams$484, ','), term$473.params);
            var expandedArgs$486 = expand$233([flatArgs$485], env$474, newDef$479, templateMap$476);
            parser$101.assert(expandedArgs$486.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$473.params) {
                term$473.params = expandedArgs$486[0];
            }
            if (term$473.hasPrototype(Module$219)) {
                bodyTerms$483[0].body.delim.token.inner = _$100.filter(bodyTerms$483[0].body.delim.token.inner, function (innerTerm$494) {
                    if (innerTerm$494.hasPrototype(Export$221)) {
                        term$473.exports.push(innerTerm$494);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            var flattenedBody$487 = bodyTerms$483[0].destruct();
            flattenedBody$487 = _$100.reduce(newDef$479, function (acc$495, def$496) {
                return acc$495.rename(def$496.id, def$496.name);
            }, flattenedBody$487[0]);
            term$473.body = flattenedBody$487;
            // and continue expand the rest
            return term$473;
        }
        // the term is fine as is
        return term$473;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$233(stx$497, env$498, defscope$499, templateMap$500) {
        env$498 = env$498 || new Map();
        templateMap$500 = templateMap$500 || new Map();
        var trees$501 = expandToTermTree$230(stx$497, env$498, defscope$499, templateMap$500);
        return _$100.map(trees$501.terms, function (term$502) {
            return expandTermTreeToFinal$232(term$502, trees$501.env, defscope$499, templateMap$500);
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$234(stx$503, builtinSource$504) {
        var buildinEnv$505 = new Map();
        var env$506 = new Map();
        var params$507 = [];
        if (builtinSource$504) {
            var builtinRead$510 = parser$101.read(builtinSource$504);
            builtinRead$510 = [
                syn$102.makeIdent('module', null),
                syn$102.makeDelim('{}', builtinRead$510, null)
            ];
            var builtinRes$511 = expand$233(builtinRead$510, buildinEnv$505);
            params$507 = _$100.map(builtinRes$511[0].exports, function (term$512) {
                return {
                    oldExport: term$512.name,
                    newParam: syn$102.makeIdent(term$512.name.token.value, null)
                };
            });
        }
        var modBody$508 = syn$102.makeDelim('{}', stx$503, null);
        modBody$508 = _$100.reduce(params$507, function (acc$513, param$514) {
            var newName$515 = fresh$185();
            env$506.set(resolve$179(param$514.newParam.rename(param$514.newParam, newName$515)), buildinEnv$505.get(resolve$179(param$514.oldExport)));
            return acc$513.rename(param$514.newParam, newName$515);
        }, modBody$508);
        var res$509 = expand$233([
                syn$102.makeIdent('module', null),
                modBody$508
            ], env$506);
        return flatten$235(res$509[0].body.expose().token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$235(stx$516) {
        return _$100.reduce(stx$516, function (acc$517, stx$518) {
            if (stx$518.token.type === parser$101.Token.Delimiter) {
                var exposed$519 = stx$518.expose();
                var openParen$520 = syntaxFromToken$175({
                        type: parser$101.Token.Punctuator,
                        value: stx$518.token.value[0],
                        range: stx$518.token.startRange,
                        lineNumber: stx$518.token.startLineNumber,
                        sm_lineNumber: stx$518.token.sm_startLineNumber ? stx$518.token.sm_startLineNumber : stx$518.token.startLineNumber,
                        lineStart: stx$518.token.startLineStart,
                        sm_lineStart: stx$518.token.sm_startLineStart ? stx$518.token.sm_startLineStart : stx$518.token.startLineStart
                    }, exposed$519);
                var closeParen$521 = syntaxFromToken$175({
                        type: parser$101.Token.Punctuator,
                        value: stx$518.token.value[1],
                        range: stx$518.token.endRange,
                        lineNumber: stx$518.token.endLineNumber,
                        sm_lineNumber: stx$518.token.sm_endLineNumber ? stx$518.token.sm_endLineNumber : stx$518.token.endLineNumber,
                        lineStart: stx$518.token.endLineStart,
                        sm_lineStart: stx$518.token.sm_endLineStart ? stx$518.token.sm_endLineStart : stx$518.token.endLineStart
                    }, exposed$519);
                if (stx$518.token.leadingComments) {
                    openParen$520.token.leadingComments = stx$518.token.leadingComments;
                }
                if (stx$518.token.trailingComments) {
                    openParen$520.token.trailingComments = stx$518.token.trailingComments;
                }
                return acc$517.concat(openParen$520).concat(flatten$235(exposed$519.token.inner)).concat(closeParen$521);
            }
            stx$518.token.sm_lineNumber = stx$518.token.sm_lineNumber ? stx$518.token.sm_lineNumber : stx$518.token.lineNumber;
            stx$518.token.sm_lineStart = stx$518.token.sm_lineStart ? stx$518.token.sm_lineStart : stx$518.token.lineStart;
            return acc$517.concat(stx$518);
        }, []);
    }
    exports$99.enforest = enforest$226;
    exports$99.expand = expandTopLevel$234;
    exports$99.resolve = resolve$179;
    exports$99.get_expression = get_expression$227;
    exports$99.Expr = Expr$191;
    exports$99.VariableStatement = VariableStatement$217;
    exports$99.tokensToSyntax = syn$102.tokensToSyntax;
    exports$99.syntaxToTokens = syn$102.syntaxToTokens;
}));