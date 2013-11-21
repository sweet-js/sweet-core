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
(function (root$115, factory$116) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$116(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$116);
    }
}(this, function (exports$117, _$118, parser$119, syn$120, es6$121, se$122, patternModule$123, gen$124) {
    'use strict';
    var codegen$125 = gen$124 || escodegen;
    // used to export "private" methods for unit testing
    exports$117._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$280 = Object.create(this);
                if (typeof o$280.construct === 'function') {
                    o$280.construct.apply(o$280, arguments);
                }
                return o$280;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$281) {
                var result$282 = Object.create(this);
                for (var prop$283 in properties$281) {
                    if (properties$281.hasOwnProperty(prop$283)) {
                        result$282[prop$283] = properties$281[prop$283];
                    }
                }
                return result$282;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$284) {
                function F$285() {
                }
                F$285.prototype = proto$284;
                return this instanceof F$285;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$209(msg$286) {
        throw new Error(msg$286);
    }
    var scopedEval$210 = se$122.scopedEval;
    var Rename$211 = syn$120.Rename;
    var Mark$212 = syn$120.Mark;
    var Var$213 = syn$120.Var;
    var Def$214 = syn$120.Def;
    var isDef$215 = syn$120.isDef;
    var isMark$216 = syn$120.isMark;
    var isRename$217 = syn$120.isRename;
    var syntaxFromToken$218 = syn$120.syntaxFromToken;
    var joinSyntax$219 = syn$120.joinSyntax;
    function remdup$220(mark$287, mlist$288) {
        if (mark$287 === _$118.first(mlist$288)) {
            return _$118.rest(mlist$288, 1);
        }
        return [mark$287].concat(mlist$288);
    }
    // (CSyntax) -> [...Num]
    function marksof$221(ctx$289, stopName$290, originalName$291) {
        var mark$292, submarks$293;
        if (isMark$216(ctx$289)) {
            mark$292 = ctx$289.mark;
            submarks$293 = marksof$221(ctx$289.context, stopName$290, originalName$291);
            return remdup$220(mark$292, submarks$293);
        }
        if (isDef$215(ctx$289)) {
            return marksof$221(ctx$289.context, stopName$290, originalName$291);
        }
        if (isRename$217(ctx$289)) {
            if (stopName$290 === originalName$291 + '$' + ctx$289.name) {
                return [];
            }
            return marksof$221(ctx$289.context, stopName$290, originalName$291);
        }
        return [];
    }
    function resolve$222(stx$294) {
        return resolveCtx$226(stx$294.token.value, stx$294.context, [], []);
    }
    function arraysEqual$223(a$295, b$296) {
        if (a$295.length !== b$296.length) {
            return false;
        }
        for (var i$297 = 0; i$297 < a$295.length; i$297++) {
            if (a$295[i$297] !== b$296[i$297]) {
                return false;
            }
        }
        return true;
    }
    function renames$224(defctx$298, oldctx$299, originalName$300) {
        var acc$301 = oldctx$299;
        for (var i$302 = 0; i$302 < defctx$298.length; i$302++) {
            if (defctx$298[i$302].id.token.value === originalName$300) {
                acc$301 = Rename$211(defctx$298[i$302].id, defctx$298[i$302].name, acc$301, defctx$298);
            }
        }
        return acc$301;
    }
    function unionEl$225(arr$303, el$304) {
        if (arr$303.indexOf(el$304) === -1) {
            var res$305 = arr$303.slice(0);
            res$305.push(el$304);
            return res$305;
        }
        return arr$303;
    }
    // (Syntax) -> String
    function resolveCtx$226(originalName$306, ctx$307, stop_spine$308, stop_branch$309) {
        if (isMark$216(ctx$307)) {
            return resolveCtx$226(originalName$306, ctx$307.context, stop_spine$308, stop_branch$309);
        }
        if (isDef$215(ctx$307)) {
            if (stop_spine$308.indexOf(ctx$307.defctx) !== -1) {
                return resolveCtx$226(originalName$306, ctx$307.context, stop_spine$308, stop_branch$309);
            } else {
                return resolveCtx$226(originalName$306, renames$224(ctx$307.defctx, ctx$307.context, originalName$306), stop_spine$308, unionEl$225(stop_branch$309, ctx$307.defctx));
            }
        }
        if (isRename$217(ctx$307)) {
            if (originalName$306 === ctx$307.id.token.value) {
                var idName$310 = resolveCtx$226(ctx$307.id.token.value, ctx$307.id.context, stop_branch$309, stop_branch$309);
                var subName$311 = resolveCtx$226(originalName$306, ctx$307.context, unionEl$225(stop_spine$308, ctx$307.def), stop_branch$309);
                if (idName$310 === subName$311) {
                    var idMarks$312 = marksof$221(ctx$307.id.context, originalName$306 + '$' + ctx$307.name, originalName$306);
                    var subMarks$313 = marksof$221(ctx$307.context, originalName$306 + '$' + ctx$307.name, originalName$306);
                    if (arraysEqual$223(idMarks$312, subMarks$313)) {
                        return originalName$306 + '$' + ctx$307.name;
                    }
                }
            }
            return resolveCtx$226(originalName$306, ctx$307.context, stop_spine$308, stop_branch$309);
        }
        return originalName$306;
    }
    var nextFresh$227 = 0;
    // fun () -> Num
    function fresh$228() {
        return nextFresh$227++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$229(towrap$314, delimSyntax$315) {
        parser$119.assert(delimSyntax$315.token.type === parser$119.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$218({
            type: parser$119.Token.Delimiter,
            value: delimSyntax$315.token.value,
            inner: towrap$314,
            range: delimSyntax$315.token.range,
            startLineNumber: delimSyntax$315.token.startLineNumber,
            lineStart: delimSyntax$315.token.lineStart
        }, delimSyntax$315);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$230(argSyntax$316) {
        parser$119.assert(argSyntax$316.token.type === parser$119.Token.Delimiter, 'expecting delimiter for function params');
        return _$118.filter(argSyntax$316.token.inner, function (stx$317) {
            return stx$317.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$231 = {
            destruct: function () {
                return _$118.reduce(this.properties, _$118.bind(function (acc$318, prop$319) {
                    if (this[prop$319] && this[prop$319].hasPrototype(TermTree$231)) {
                        return acc$318.concat(this[prop$319].destruct());
                    } else if (this[prop$319] && this[prop$319].token && this[prop$319].token.inner) {
                        this[prop$319].token.inner = _$118.reduce(this[prop$319].token.inner, function (acc$320, t$321) {
                            if (t$321.hasPrototype(TermTree$231)) {
                                return acc$320.concat(t$321.destruct());
                            }
                            return acc$320.concat(t$321);
                        }, []);
                        return acc$318.concat(this[prop$319]);
                    } else if (this[prop$319]) {
                        return acc$318.concat(this[prop$319]);
                    } else {
                        return acc$318;
                    }
                }, this), []);
            },
            addDefCtx: function (def$322) {
                for (var i$323 = 0; i$323 < this.properties.length; i$323++) {
                    var prop$324 = this.properties[i$323];
                    if (Array.isArray(this[prop$324])) {
                        this[prop$324] = _$118.map(this[prop$324], function (item$325) {
                            return item$325.addDefCtx(def$322);
                        });
                    } else if (this[prop$324]) {
                        this[prop$324] = this[prop$324].addDefCtx(def$322);
                    }
                }
                return this;
            }
        };
    var EOF$232 = TermTree$231.extend({
            properties: ['eof'],
            construct: function (e$326) {
                this.eof = e$326;
            }
        });
    var Statement$233 = TermTree$231.extend({
            construct: function () {
            }
        });
    var Expr$234 = TermTree$231.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$235 = Expr$234.extend({
            construct: function () {
            }
        });
    var ThisExpression$236 = PrimaryExpression$235.extend({
            properties: ['this'],
            construct: function (that$327) {
                this.this = that$327;
            }
        });
    var Lit$237 = PrimaryExpression$235.extend({
            properties: ['lit'],
            construct: function (l$328) {
                this.lit = l$328;
            }
        });
    exports$117._test.PropertyAssignment = PropertyAssignment$238;
    var PropertyAssignment$238 = TermTree$231.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$329, assignment$330) {
                this.propName = propName$329;
                this.assignment = assignment$330;
            }
        });
    var Block$239 = PrimaryExpression$235.extend({
            properties: ['body'],
            construct: function (body$331) {
                this.body = body$331;
            }
        });
    var ArrayLiteral$240 = PrimaryExpression$235.extend({
            properties: ['array'],
            construct: function (ar$332) {
                this.array = ar$332;
            }
        });
    var ParenExpression$241 = PrimaryExpression$235.extend({
            properties: ['expr'],
            construct: function (expr$333) {
                this.expr = expr$333;
            }
        });
    var UnaryOp$242 = Expr$234.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$334, expr$335) {
                this.op = op$334;
                this.expr = expr$335;
            }
        });
    var PostfixOp$243 = Expr$234.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$336, op$337) {
                this.expr = expr$336;
                this.op = op$337;
            }
        });
    var BinOp$244 = Expr$234.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$338, left$339, right$340) {
                this.op = op$338;
                this.left = left$339;
                this.right = right$340;
            }
        });
    var ConditionalExpression$245 = Expr$234.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$341, question$342, tru$343, colon$344, fls$345) {
                this.cond = cond$341;
                this.question = question$342;
                this.tru = tru$343;
                this.colon = colon$344;
                this.fls = fls$345;
            }
        });
    var Keyword$246 = TermTree$231.extend({
            properties: ['keyword'],
            construct: function (k$346) {
                this.keyword = k$346;
            }
        });
    var Punc$247 = TermTree$231.extend({
            properties: ['punc'],
            construct: function (p$347) {
                this.punc = p$347;
            }
        });
    var Delimiter$248 = TermTree$231.extend({
            properties: ['delim'],
            construct: function (d$348) {
                this.delim = d$348;
            }
        });
    var Id$249 = PrimaryExpression$235.extend({
            properties: ['id'],
            construct: function (id$349) {
                this.id = id$349;
            }
        });
    var NamedFun$250 = Expr$234.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$350, name$351, params$352, body$353) {
                this.keyword = keyword$350;
                this.name = name$351;
                this.params = params$352;
                this.body = body$353;
            }
        });
    var AnonFun$251 = Expr$234.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$354, params$355, body$356) {
                this.keyword = keyword$354;
                this.params = params$355;
                this.body = body$356;
            }
        });
    var LetMacro$252 = TermTree$231.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$357, body$358) {
                this.name = name$357;
                this.body = body$358;
            }
        });
    var Macro$253 = TermTree$231.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$359, body$360) {
                this.name = name$359;
                this.body = body$360;
            }
        });
    var AnonMacro$254 = TermTree$231.extend({
            properties: ['body'],
            construct: function (body$361) {
                this.body = body$361;
            }
        });
    var Const$255 = Expr$234.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$362, call$363) {
                this.newterm = newterm$362;
                this.call = call$363;
            }
        });
    var Call$256 = Expr$234.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$119.assert(this.fun.hasPrototype(TermTree$231), 'expecting a term tree in destruct of call');
                var that$364 = this;
                this.delim = syntaxFromToken$218(_$118.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$118.reduce(this.args, function (acc$365, term$366) {
                    parser$119.assert(term$366 && term$366.hasPrototype(TermTree$231), 'expecting term trees in destruct of Call');
                    var dst$367 = acc$365.concat(term$366.destruct());
                    // add all commas except for the last one
                    if (that$364.commas.length > 0) {
                        dst$367 = dst$367.concat(that$364.commas.shift());
                    }
                    return dst$367;
                }, []);
                return this.fun.destruct().concat(Delimiter$248.create(this.delim).destruct());
            },
            construct: function (funn$368, args$369, delim$370, commas$371) {
                parser$119.assert(Array.isArray(args$369), 'requires an array of arguments terms');
                this.fun = funn$368;
                this.args = args$369;
                this.delim = delim$370;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$371;
            }
        });
    var ObjDotGet$257 = Expr$234.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$372, dot$373, right$374) {
                this.left = left$372;
                this.dot = dot$373;
                this.right = right$374;
            }
        });
    var ObjGet$258 = Expr$234.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$375, right$376) {
                this.left = left$375;
                this.right = right$376;
            }
        });
    var VariableDeclaration$259 = TermTree$231.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$377, eqstx$378, init$379, comma$380) {
                this.ident = ident$377;
                this.eqstx = eqstx$378;
                this.init = init$379;
                this.comma = comma$380;
            }
        });
    var VariableStatement$260 = Statement$233.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$118.reduce(this.decls, function (acc$381, decl$382) {
                    return acc$381.concat(decl$382.destruct());
                }, []));
            },
            construct: function (varkw$383, decls$384) {
                parser$119.assert(Array.isArray(decls$384), 'decls must be an array');
                this.varkw = varkw$383;
                this.decls = decls$384;
            }
        });
    var CatchClause$261 = TermTree$231.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$385, params$386, body$387) {
                this.catchkw = catchkw$385;
                this.params = params$386;
                this.body = body$387;
            }
        });
    var Module$262 = TermTree$231.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$388) {
                this.body = body$388;
                this.exports = [];
            }
        });
    var Empty$263 = TermTree$231.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$264 = TermTree$231.extend({
            properties: ['name'],
            construct: function (name$389) {
                this.name = name$389;
            }
        });
    function stxIsUnaryOp$265(stx$390) {
        var staticOperators$391 = [
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
        return _$118.contains(staticOperators$391, stx$390.token.value);
    }
    function stxIsBinOp$266(stx$392) {
        var staticOperators$393 = [
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
        return _$118.contains(staticOperators$393, stx$392.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$267(stx$394, context$395) {
        var decls$396 = [];
        var res$397 = enforest$269(stx$394, context$395);
        var result$398 = res$397.result;
        var rest$399 = res$397.rest;
        if (rest$399[0]) {
            var nextRes$400 = enforest$269(rest$399, context$395);
            // x = ...
            if (nextRes$400.result.hasPrototype(Punc$247) && nextRes$400.result.punc.token.value === '=') {
                var initializerRes$401 = enforest$269(nextRes$400.rest, context$395);
                if (initializerRes$401.rest[0]) {
                    var restRes$402 = enforest$269(initializerRes$401.rest, context$395);
                    // x = y + z, ...
                    if (restRes$402.result.hasPrototype(Punc$247) && restRes$402.result.punc.token.value === ',') {
                        decls$396.push(VariableDeclaration$259.create(result$398.id, nextRes$400.result.punc, initializerRes$401.result, restRes$402.result.punc));
                        var subRes$403 = enforestVarStatement$267(restRes$402.rest, context$395);
                        decls$396 = decls$396.concat(subRes$403.result);
                        rest$399 = subRes$403.rest;
                    }    // x = y ...
                    else {
                        decls$396.push(VariableDeclaration$259.create(result$398.id, nextRes$400.result.punc, initializerRes$401.result));
                        rest$399 = initializerRes$401.rest;
                    }
                }    // x = y EOF
                else {
                    decls$396.push(VariableDeclaration$259.create(result$398.id, nextRes$400.result.punc, initializerRes$401.result));
                }
            }    // x ,...;
            else if (nextRes$400.result.hasPrototype(Punc$247) && nextRes$400.result.punc.token.value === ',') {
                decls$396.push(VariableDeclaration$259.create(result$398.id, null, null, nextRes$400.result.punc));
                var subRes$403 = enforestVarStatement$267(nextRes$400.rest, context$395);
                decls$396 = decls$396.concat(subRes$403.result);
                rest$399 = subRes$403.rest;
            } else {
                if (result$398.hasPrototype(Id$249)) {
                    decls$396.push(VariableDeclaration$259.create(result$398.id));
                } else {
                    throwError$209('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$398.hasPrototype(Id$249)) {
                decls$396.push(VariableDeclaration$259.create(result$398.id));
            } else if (result$398.hasPrototype(BinOp$244) && result$398.op.token.value === 'in') {
                decls$396.push(VariableDeclaration$259.create(result$398.left.id, result$398.op, result$398.right));
            } else {
                throwError$209('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$396,
            rest: rest$399
        };
    }
    function adjustLineContext$268(stx$404, original$405, current$406) {
        current$406 = current$406 || {
            lastLineNumber: original$405.token.lineNumber,
            lineNumber: original$405.token.lineNumber - 1
        };
        return _$118.map(stx$404, function (stx$407) {
            if (stx$407.token.type === parser$119.Token.Delimiter) {
                stx$407.token.sm_startLineNumber = stx$407.token.sm_startLineNumber || stx$407.token.startLineNumber;
                stx$407.token.sm_endLineNumber = stx$407.token.sm_endLineNumber || stx$407.token.endLineNumber;
                stx$407.token.sm_startLineStart = stx$407.token.sm_startLineStart || stx$407.token.startLineStart;
                stx$407.token.sm_endLineStart = stx$407.token.sm_endLineStart || stx$407.token.endLineStart;
                stx$407.token.startLineNumber = original$405.token.lineNumber;
                if (stx$407.token.inner.length > 0) {
                    stx$407.token.inner = adjustLineContext$268(stx$407.token.inner, original$405, current$406);
                }
                return stx$407;
            }
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$407.token.sm_lineNumber = stx$407.token.sm_lineNumber || stx$407.token.lineNumber;
            stx$407.token.sm_lineStart = stx$407.token.sm_lineStart || stx$407.token.lineStart;
            stx$407.token.sm_range = stx$407.token.sm_range || _$118.clone(stx$407.token.range);
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            stx$407.token.lineNumber = original$405.token.lineNumber;
            return stx$407;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$269(toks$408, context$409) {
        parser$119.assert(toks$408.length > 0, 'enforest assumes there are tokens to work with');
        function step$410(head$411, rest$412) {
            var innerTokens$413;
            parser$119.assert(Array.isArray(rest$412), 'result must at least be an empty array');
            if (head$411.hasPrototype(TermTree$231)) {
                // function call
                var emp$416 = head$411.emp;
                var emp$416 = head$411.emp;
                var keyword$419 = head$411.keyword;
                var delim$421 = head$411.delim;
                var emp$416 = head$411.emp;
                var punc$424 = head$411.punc;
                var keyword$419 = head$411.keyword;
                var emp$416 = head$411.emp;
                var emp$416 = head$411.emp;
                var emp$416 = head$411.emp;
                var delim$421 = head$411.delim;
                var delim$421 = head$411.delim;
                var keyword$419 = head$411.keyword;
                var keyword$419 = head$411.keyword;
                if (head$411.hasPrototype(Expr$234) && (rest$412[0] && rest$412[0].token.type === parser$119.Token.Delimiter && rest$412[0].token.value === '()')) {
                    var argRes$449, enforestedArgs$450 = [], commas$451 = [];
                    rest$412[0].expose();
                    innerTokens$413 = rest$412[0].token.inner;
                    while (innerTokens$413.length > 0) {
                        argRes$449 = enforest$269(innerTokens$413, context$409);
                        enforestedArgs$450.push(argRes$449.result);
                        innerTokens$413 = argRes$449.rest;
                        if (innerTokens$413[0] && innerTokens$413[0].token.value === ',') {
                            // record the comma for later
                            commas$451.push(innerTokens$413[0]);
                            // but dump it for the next loop turn
                            innerTokens$413 = innerTokens$413.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$452 = _$118.all(enforestedArgs$450, function (argTerm$453) {
                            return argTerm$453.hasPrototype(Expr$234);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$413.length === 0 && argsAreExprs$452) {
                        return step$410(Call$256.create(head$411, enforestedArgs$450, rest$412[0], commas$451), rest$412.slice(1));
                    }
                } else if (head$411.hasPrototype(Expr$234) && (rest$412[0] && rest$412[0].token.value === '?')) {
                    var question$454 = rest$412[0];
                    var condRes$455 = enforest$269(rest$412.slice(1), context$409);
                    var truExpr$456 = condRes$455.result;
                    var right$457 = condRes$455.rest;
                    if (truExpr$456.hasPrototype(Expr$234) && right$457[0] && right$457[0].token.value === ':') {
                        var colon$458 = right$457[0];
                        var flsRes$459 = enforest$269(right$457.slice(1), context$409);
                        var flsExpr$460 = flsRes$459.result;
                        if (flsExpr$460.hasPrototype(Expr$234)) {
                            return step$410(ConditionalExpression$245.create(head$411, question$454, truExpr$456, colon$458, flsExpr$460), flsRes$459.rest);
                        }
                    }
                } else if (head$411.hasPrototype(Keyword$246) && (keyword$419.token.value === 'new' && rest$412[0])) {
                    var newCallRes$461 = enforest$269(rest$412, context$409);
                    if (newCallRes$461.result.hasPrototype(Call$256)) {
                        return step$410(Const$255.create(head$411, newCallRes$461.result), newCallRes$461.rest);
                    }
                } else if (head$411.hasPrototype(Delimiter$248) && delim$421.token.value === '()') {
                    innerTokens$413 = delim$421.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$413.length === 0) {
                        return step$410(ParenExpression$241.create(head$411), rest$412);
                    } else {
                        var innerTerm$462 = get_expression$270(innerTokens$413, context$409);
                        if (innerTerm$462.result && innerTerm$462.result.hasPrototype(Expr$234)) {
                            return step$410(ParenExpression$241.create(head$411), rest$412);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$411.hasPrototype(Expr$234) && (rest$412[0] && rest$412[1] && stxIsBinOp$266(rest$412[0]))) {
                    var op$463 = rest$412[0];
                    var left$464 = head$411;
                    var bopRes$465 = enforest$269(rest$412.slice(1), context$409);
                    var right$457 = bopRes$465.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$457.hasPrototype(Expr$234)) {
                        return step$410(BinOp$244.create(op$463, left$464, right$457), bopRes$465.rest);
                    }
                } else if (head$411.hasPrototype(Punc$247) && stxIsUnaryOp$265(punc$424)) {
                    var unopRes$466 = enforest$269(rest$412, context$409);
                    if (unopRes$466.result.hasPrototype(Expr$234)) {
                        return step$410(UnaryOp$242.create(punc$424, unopRes$466.result), unopRes$466.rest);
                    }
                } else if (head$411.hasPrototype(Keyword$246) && stxIsUnaryOp$265(keyword$419)) {
                    var unopRes$466 = enforest$269(rest$412, context$409);
                    if (unopRes$466.result.hasPrototype(Expr$234)) {
                        return step$410(UnaryOp$242.create(keyword$419, unopRes$466.result), unopRes$466.rest);
                    }
                } else if (head$411.hasPrototype(Expr$234) && (rest$412[0] && (rest$412[0].token.value === '++' || rest$412[0].token.value === '--'))) {
                    return step$410(PostfixOp$243.create(head$411, rest$412[0]), rest$412.slice(1));
                } else if (head$411.hasPrototype(Expr$234) && (rest$412[0] && rest$412[0].token.value === '[]')) {
                    return step$410(ObjGet$258.create(head$411, Delimiter$248.create(rest$412[0].expose())), rest$412.slice(1));
                } else if (head$411.hasPrototype(Expr$234) && (rest$412[0] && rest$412[0].token.value === '.' && rest$412[1] && rest$412[1].token.type === parser$119.Token.Identifier)) {
                    return step$410(ObjDotGet$257.create(head$411, rest$412[0], rest$412[1]), rest$412.slice(2));
                } else if (head$411.hasPrototype(Delimiter$248) && delim$421.token.value === '[]') {
                    return step$410(ArrayLiteral$240.create(head$411), rest$412);
                } else if (head$411.hasPrototype(Delimiter$248) && head$411.delim.token.value === '{}') {
                    return step$410(Block$239.create(head$411), rest$412);
                } else if (head$411.hasPrototype(Keyword$246) && (keyword$419.token.value === 'let' && (rest$412[0] && rest$412[0].token.type === parser$119.Token.Identifier || rest$412[0] && rest$412[0].token.type === parser$119.Token.Keyword || rest$412[0] && rest$412[0].token.type === parser$119.Token.Punctuator) && rest$412[1] && rest$412[1].token.value === '=' && rest$412[2] && rest$412[2].token.value === 'macro')) {
                    var mac$467 = enforest$269(rest$412.slice(2), context$409);
                    if (!mac$467.result.hasPrototype(AnonMacro$254)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$467.result);
                    }
                    return step$410(LetMacro$252.create(rest$412[0], mac$467.result.body), mac$467.rest);
                } else if (head$411.hasPrototype(Keyword$246) && (keyword$419.token.value === 'var' && rest$412[0])) {
                    var vsRes$468 = enforestVarStatement$267(rest$412, context$409);
                    if (vsRes$468) {
                        return step$410(VariableStatement$260.create(head$411, vsRes$468.result), vsRes$468.rest);
                    }
                }
            } else {
                parser$119.assert(head$411 && head$411.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$411.token.type === parser$119.Token.Identifier || head$411.token.type === parser$119.Token.Keyword || head$411.token.type === parser$119.Token.Punctuator) && context$409.env.has(resolve$222(head$411))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$469 = fresh$228();
                    var transformerContext$470 = makeExpanderContext$277(_$118.defaults({ mark: newMark$469 }, context$409));
                    // pull the macro transformer out the environment
                    var transformer$471 = context$409.env.get(resolve$222(head$411)).fn;
                    // apply the transformer
                    var rt$472 = transformer$471([head$411].concat(rest$412), transformerContext$470);
                    if (!Array.isArray(rt$472.result)) {
                        throwError$209('Macro transformer must return a result array, not: ' + rt$472.result);
                    }
                    if (rt$472.result.length > 0) {
                        var adjustedResult$473 = adjustLineContext$268(rt$472.result, head$411);
                        adjustedResult$473[0].token.leadingComments = head$411.token.leadingComments;
                        return step$410(adjustedResult$473[0], adjustedResult$473.slice(1).concat(rt$472.rest));
                    } else {
                        return step$410(Empty$263.create(), rt$472.rest);
                    }
                }    // anon macro definition
                else if (head$411.token.type === parser$119.Token.Identifier && head$411.token.value === 'macro' && rest$412[0] && rest$412[0].token.value === '{}') {
                    return step$410(AnonMacro$254.create(rest$412[0].expose().token.inner), rest$412.slice(1));
                }    // macro definition
                else if (head$411.token.type === parser$119.Token.Identifier && head$411.token.value === 'macro' && rest$412[0] && (rest$412[0].token.type === parser$119.Token.Identifier || rest$412[0].token.type === parser$119.Token.Keyword || rest$412[0].token.type === parser$119.Token.Punctuator) && rest$412[1] && rest$412[1].token.type === parser$119.Token.Delimiter && rest$412[1].token.value === '{}') {
                    return step$410(Macro$253.create(rest$412[0], rest$412[1].expose().token.inner), rest$412.slice(2));
                }    // module definition
                else if (head$411.token.value === 'module' && rest$412[0] && rest$412[0].token.value === '{}') {
                    return step$410(Module$262.create(rest$412[0]), rest$412.slice(1));
                }    // function definition
                else if (head$411.token.type === parser$119.Token.Keyword && head$411.token.value === 'function' && rest$412[0] && rest$412[0].token.type === parser$119.Token.Identifier && rest$412[1] && rest$412[1].token.type === parser$119.Token.Delimiter && rest$412[1].token.value === '()' && rest$412[2] && rest$412[2].token.type === parser$119.Token.Delimiter && rest$412[2].token.value === '{}') {
                    rest$412[1].token.inner = rest$412[1].expose().token.inner;
                    rest$412[2].token.inner = rest$412[2].expose().token.inner;
                    return step$410(NamedFun$250.create(head$411, rest$412[0], rest$412[1], rest$412[2]), rest$412.slice(3));
                }    // anonymous function definition
                else if (head$411.token.type === parser$119.Token.Keyword && head$411.token.value === 'function' && rest$412[0] && rest$412[0].token.type === parser$119.Token.Delimiter && rest$412[0].token.value === '()' && rest$412[1] && rest$412[1].token.type === parser$119.Token.Delimiter && rest$412[1].token.value === '{}') {
                    rest$412[0].token.inner = rest$412[0].expose().token.inner;
                    rest$412[1].token.inner = rest$412[1].expose().token.inner;
                    return step$410(AnonFun$251.create(head$411, rest$412[0], rest$412[1]), rest$412.slice(2));
                }    // catch statement
                else if (head$411.token.type === parser$119.Token.Keyword && head$411.token.value === 'catch' && rest$412[0] && rest$412[0].token.type === parser$119.Token.Delimiter && rest$412[0].token.value === '()' && rest$412[1] && rest$412[1].token.type === parser$119.Token.Delimiter && rest$412[1].token.value === '{}') {
                    rest$412[0].token.inner = rest$412[0].expose().token.inner;
                    rest$412[1].token.inner = rest$412[1].expose().token.inner;
                    return step$410(CatchClause$261.create(head$411, rest$412[0], rest$412[1]), rest$412.slice(2));
                }    // this expression
                else if (head$411.token.type === parser$119.Token.Keyword && head$411.token.value === 'this') {
                    return step$410(ThisExpression$236.create(head$411), rest$412);
                }    // literal
                else if (head$411.token.type === parser$119.Token.NumericLiteral || head$411.token.type === parser$119.Token.StringLiteral || head$411.token.type === parser$119.Token.BooleanLiteral || head$411.token.type === parser$119.Token.RegexLiteral || head$411.token.type === parser$119.Token.NullLiteral) {
                    return step$410(Lit$237.create(head$411), rest$412);
                }    // export
                else if (head$411.token.type === parser$119.Token.Identifier && head$411.token.value === 'export' && rest$412[0] && (rest$412[0].token.type === parser$119.Token.Identifier || rest$412[0].token.type === parser$119.Token.Keyword || rest$412[0].token.type === parser$119.Token.Punctuator)) {
                    return step$410(Export$264.create(rest$412[0]), rest$412.slice(1));
                }    // identifier
                else if (head$411.token.type === parser$119.Token.Identifier) {
                    return step$410(Id$249.create(head$411), rest$412);
                }    // punctuator
                else if (head$411.token.type === parser$119.Token.Punctuator) {
                    return step$410(Punc$247.create(head$411), rest$412);
                } else if (head$411.token.type === parser$119.Token.Keyword && head$411.token.value === 'with') {
                    throwError$209('with is not supported in sweet.js');
                }    // keyword
                else if (head$411.token.type === parser$119.Token.Keyword) {
                    return step$410(Keyword$246.create(head$411), rest$412);
                }    // Delimiter
                else if (head$411.token.type === parser$119.Token.Delimiter) {
                    return step$410(Delimiter$248.create(head$411.expose()), rest$412);
                }    // end of file
                else if (head$411.token.type === parser$119.Token.EOF) {
                    parser$119.assert(rest$412.length === 0, 'nothing should be after an EOF');
                    return step$410(EOF$232.create(head$411), []);
                } else {
                    // todo: are we missing cases?
                    parser$119.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$411,
                rest: rest$412
            };
        }
        return step$410(toks$408[0], toks$408.slice(1));
    }
    function get_expression$270(stx$474, context$475) {
        var res$476 = enforest$269(stx$474, context$475);
        if (!res$476.result.hasPrototype(Expr$234)) {
            return {
                result: null,
                rest: stx$474
            };
        }
        return res$476;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$271(newMark$477, env$478) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$479(match$480) {
            if (match$480.level === 0) {
                // replace the match property with the marked syntax
                match$480.match = _$118.map(match$480.match, function (stx$481) {
                    return stx$481.mark(newMark$477);
                });
            } else {
                _$118.each(match$480.match, function (match$482) {
                    dfs$479(match$482);
                });
            }
        }
        _$118.keys(env$478).forEach(function (key$483) {
            dfs$479(env$478[key$483]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$272(mac$484, context$485) {
        var body$486 = mac$484.body;
        // raw function primitive form
        if (!(body$486[0] && body$486[0].token.type === parser$119.Token.Keyword && body$486[0].token.value === 'function')) {
            throwError$209('Primitive macro form must contain a function for the macro body');
        }
        var stub$487 = parser$119.read('()');
        stub$487[0].token.inner = body$486;
        var expanded$488 = expand$276(stub$487, context$485);
        expanded$488 = expanded$488[0].destruct().concat(expanded$488[1].eof);
        var flattend$489 = flatten$279(expanded$488);
        var bodyCode$490 = codegen$125.generate(parser$119.parse(flattend$489));
        var macroFn$491 = scopedEval$210(bodyCode$490, {
                makeValue: syn$120.makeValue,
                makeRegex: syn$120.makeRegex,
                makeIdent: syn$120.makeIdent,
                makeKeyword: syn$120.makeKeyword,
                makePunc: syn$120.makePunc,
                makeDelim: syn$120.makeDelim,
                unwrapSyntax: syn$120.unwrapSyntax,
                throwSyntaxError: syn$120.throwSyntaxError,
                parser: parser$119,
                _: _$118,
                patternModule: patternModule$123,
                getTemplate: function (id$492) {
                    return context$485.templateMap.get(id$492);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$271,
                mergeMatches: function (newMatch$493, oldMatch$494) {
                    newMatch$493.patternEnv = _$118.extend({}, oldMatch$494.patternEnv, newMatch$493.patternEnv);
                    return newMatch$493;
                }
            });
        return macroFn$491;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$273(stx$495, context$496) {
        parser$119.assert(context$496, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$495.length === 0) {
            return {
                terms: [],
                context: context$496
            };
        }
        parser$119.assert(stx$495[0].token, 'expecting a syntax object');
        var f$497 = enforest$269(stx$495, context$496);
        // head :: TermTree
        var head$498 = f$497.result;
        // rest :: [Syntax]
        var rest$499 = f$497.rest;
        if (head$498.hasPrototype(Macro$253)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$501 = loadMacroDef$272(head$498, context$496);
            addToDefinitionCtx$274([head$498.name], context$496.defscope, false);
            context$496.env.set(resolve$222(head$498.name), { fn: macroDefinition$501 });
            return expandToTermTree$273(rest$499, context$496);
        }
        if (head$498.hasPrototype(LetMacro$252)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$501 = loadMacroDef$272(head$498, context$496);
            var freshName$502 = fresh$228();
            var renamedName$503 = head$498.name.rename(head$498.name, freshName$502);
            rest$499 = _$118.map(rest$499, function (stx$504) {
                return stx$504.rename(head$498.name, freshName$502);
            });
            head$498.name = renamedName$503;
            context$496.env.set(resolve$222(head$498.name), { fn: macroDefinition$501 });
            return expandToTermTree$273(rest$499, context$496);
        }
        if (head$498.hasPrototype(NamedFun$250)) {
            addToDefinitionCtx$274([head$498.name], context$496.defscope, true);
        }
        if (head$498.hasPrototype(Id$249) && head$498.id.token.value === '#quoteSyntax' && rest$499[0] && rest$499[0].token.value === '{}') {
            var tempId$505 = fresh$228();
            context$496.templateMap.set(tempId$505, rest$499[0].token.inner);
            return expandToTermTree$273([
                syn$120.makeIdent('getTemplate', head$498.id),
                syn$120.makeDelim('()', [syn$120.makeValue(tempId$505, head$498.id)], head$498.id)
            ].concat(rest$499.slice(1)), context$496);
        }
        if (head$498.hasPrototype(VariableStatement$260)) {
            addToDefinitionCtx$274(_$118.map(head$498.decls, function (decl$506) {
                return decl$506.ident;
            }), context$496.defscope, true);
        }
        if (head$498.hasPrototype(Block$239) && head$498.body.hasPrototype(Delimiter$248)) {
            head$498.body.delim.token.inner.forEach(function (term$507) {
                if (term$507.hasPrototype(VariableStatement$260)) {
                    addToDefinitionCtx$274(_$118.map(term$507.decls, function (decl$508) {
                        return decl$508.ident;
                    }), context$496.defscope, true);
                }
            });
        }
        if (head$498.hasPrototype(Delimiter$248)) {
            head$498.delim.token.inner.forEach(function (term$509) {
                if (term$509.hasPrototype(VariableStatement$260)) {
                    addToDefinitionCtx$274(_$118.map(term$509.decls, function (decl$510) {
                        return decl$510.ident;
                    }), context$496.defscope, true);
                }
            });
        }
        var trees$500 = expandToTermTree$273(rest$499, context$496);
        return {
            terms: [head$498].concat(trees$500.terms),
            context: trees$500.context
        };
    }
    function addToDefinitionCtx$274(idents$511, defscope$512, skipRep$513) {
        parser$119.assert(idents$511 && idents$511.length > 0, 'expecting some variable identifiers');
        skipRep$513 = skipRep$513 || false;
        _$118.each(idents$511, function (id$514) {
            var skip$515 = false;
            if (skipRep$513) {
                var declRepeat$516 = _$118.find(defscope$512, function (def$517) {
                        return def$517.id.token.value === id$514.token.value && arraysEqual$223(marksof$221(def$517.id.context), marksof$221(id$514.context));
                    });
                skip$515 = typeof declRepeat$516 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$515) {
                var name$518 = fresh$228();
                defscope$512.push({
                    id: id$514,
                    name: name$518
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$275(term$519, context$520) {
        parser$119.assert(context$520 && context$520.env, 'environment map is required');
        if (term$519.hasPrototype(ArrayLiteral$240)) {
            term$519.array.delim.token.inner = expand$276(term$519.array.delim.expose().token.inner, context$520);
            return term$519;
        } else if (term$519.hasPrototype(Block$239)) {
            term$519.body.delim.token.inner = expand$276(term$519.body.delim.expose().token.inner, context$520);
            return term$519;
        } else if (term$519.hasPrototype(ParenExpression$241)) {
            term$519.expr.delim.token.inner = expand$276(term$519.expr.delim.expose().token.inner, context$520);
            return term$519;
        } else if (term$519.hasPrototype(Call$256)) {
            term$519.fun = expandTermTreeToFinal$275(term$519.fun, context$520);
            term$519.args = _$118.map(term$519.args, function (arg$521) {
                return expandTermTreeToFinal$275(arg$521, context$520);
            });
            return term$519;
        } else if (term$519.hasPrototype(UnaryOp$242)) {
            term$519.expr = expandTermTreeToFinal$275(term$519.expr, context$520);
            return term$519;
        } else if (term$519.hasPrototype(BinOp$244)) {
            term$519.left = expandTermTreeToFinal$275(term$519.left, context$520);
            term$519.right = expandTermTreeToFinal$275(term$519.right, context$520);
            return term$519;
        } else if (term$519.hasPrototype(ObjGet$258)) {
            term$519.right.delim.token.inner = expand$276(term$519.right.delim.expose().token.inner, context$520);
            return term$519;
        } else if (term$519.hasPrototype(ObjDotGet$257)) {
            term$519.left = expandTermTreeToFinal$275(term$519.left, context$520);
            term$519.right = expandTermTreeToFinal$275(term$519.right, context$520);
            return term$519;
        } else if (term$519.hasPrototype(VariableDeclaration$259)) {
            if (term$519.init) {
                term$519.init = expandTermTreeToFinal$275(term$519.init, context$520);
            }
            return term$519;
        } else if (term$519.hasPrototype(VariableStatement$260)) {
            term$519.decls = _$118.map(term$519.decls, function (decl$522) {
                return expandTermTreeToFinal$275(decl$522, context$520);
            });
            return term$519;
        } else if (term$519.hasPrototype(Delimiter$248)) {
            // expand inside the delimiter and then continue on
            term$519.delim.token.inner = expand$276(term$519.delim.expose().token.inner, context$520);
            return term$519;
        } else if (term$519.hasPrototype(NamedFun$250) || term$519.hasPrototype(AnonFun$251) || term$519.hasPrototype(CatchClause$261) || term$519.hasPrototype(Module$262)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$523 = [];
            var bodyContext$524 = makeExpanderContext$277(_$118.defaults({ defscope: newDef$523 }, context$520));
            if (term$519.params) {
                var params$533 = term$519.params.expose();
            } else {
                var params$533 = syn$120.makeDelim('()', [], null);
            }
            var bodies$525 = term$519.body.addDefCtx(newDef$523);
            var paramNames$526 = _$118.map(getParamIdentifiers$230(params$533), function (param$534) {
                    var freshName$535 = fresh$228();
                    return {
                        freshName: freshName$535,
                        originalParam: param$534,
                        renamedParam: param$534.rename(param$534, freshName$535)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$527 = _$118.reduce(paramNames$526, function (accBody$536, p$537) {
                    return accBody$536.rename(p$537.originalParam, p$537.freshName);
                }, bodies$525);
            renamedBody$527 = renamedBody$527.expose();
            var expandedResult$528 = expandToTermTree$273(renamedBody$527.token.inner, bodyContext$524);
            var bodyTerms$529 = expandedResult$528.terms;
            var renamedParams$530 = _$118.map(paramNames$526, function (p$538) {
                    return p$538.renamedParam;
                });
            var flatArgs$531 = syn$120.makeDelim('()', joinSyntax$219(renamedParams$530, ','), term$519.params);
            var expandedArgs$532 = expand$276([flatArgs$531], bodyContext$524);
            parser$119.assert(expandedArgs$532.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$519.params) {
                term$519.params = expandedArgs$532[0];
            }
            bodyTerms$529 = _$118.map(bodyTerms$529, function (bodyTerm$539) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$540 = bodyTerm$539.addDefCtx(newDef$523);
                // finish expansion
                return expandTermTreeToFinal$275(termWithCtx$540, expandedResult$528.context);
            });
            if (term$519.hasPrototype(Module$262)) {
                bodyTerms$529 = _$118.filter(bodyTerms$529, function (bodyTerm$541) {
                    if (bodyTerm$541.hasPrototype(Export$264)) {
                        term$519.exports.push(bodyTerm$541);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$527.token.inner = bodyTerms$529;
            term$519.body = renamedBody$527;
            // and continue expand the rest
            return term$519;
        }
        // the term is fine as is
        return term$519;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$276(stx$542, context$543) {
        parser$119.assert(context$543, 'must provide an expander context');
        var trees$544 = expandToTermTree$273(stx$542, context$543);
        return _$118.map(trees$544.terms, function (term$545) {
            return expandTermTreeToFinal$275(term$545, trees$544.context);
        });
    }
    function makeExpanderContext$277(o$546) {
        o$546 = o$546 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$546.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$546.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$546.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$546.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$278(stx$547, builtinSource$548) {
        var builtInEnv$549 = new Map();
        var env$550 = new Map();
        var params$551 = [];
        var context$552, builtInContext$553 = makeExpanderContext$277({ env: builtInEnv$549 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$548) {
            var builtinRead$556 = parser$119.read(builtinSource$548);
            builtinRead$556 = [
                syn$120.makeIdent('module', null),
                syn$120.makeDelim('{}', builtinRead$556, null)
            ];
            var builtinRes$557 = expand$276(builtinRead$556, builtInContext$553);
            params$551 = _$118.map(builtinRes$557[0].exports, function (term$558) {
                return {
                    oldExport: term$558.name,
                    newParam: syn$120.makeIdent(term$558.name.token.value, null)
                };
            });
        }
        var modBody$554 = syn$120.makeDelim('{}', stx$547, null);
        modBody$554 = _$118.reduce(params$551, function (acc$559, param$560) {
            var newName$561 = fresh$228();
            env$550.set(resolve$222(param$560.newParam.rename(param$560.newParam, newName$561)), builtInEnv$549.get(resolve$222(param$560.oldExport)));
            return acc$559.rename(param$560.newParam, newName$561);
        }, modBody$554);
        context$552 = makeExpanderContext$277({ env: env$550 });
        var res$555 = expand$276([
                syn$120.makeIdent('module', null),
                modBody$554
            ], context$552);
        res$555 = res$555[0].destruct();
        return flatten$279(res$555[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$279(stx$562) {
        return _$118.reduce(stx$562, function (acc$563, stx$564) {
            if (stx$564.token.type === parser$119.Token.Delimiter) {
                var exposed$565 = stx$564.expose();
                var openParen$566 = syntaxFromToken$218({
                        type: parser$119.Token.Punctuator,
                        value: stx$564.token.value[0],
                        range: stx$564.token.startRange,
                        sm_range: stx$564.token.sm_range ? stx$564.token.sm_range : stx$564.token.startRange,
                        lineNumber: stx$564.token.startLineNumber,
                        sm_lineNumber: stx$564.token.sm_startLineNumber ? stx$564.token.sm_startLineNumber : stx$564.token.startLineNumber,
                        lineStart: stx$564.token.startLineStart,
                        sm_lineStart: stx$564.token.sm_startLineStart ? stx$564.token.sm_startLineStart : stx$564.token.startLineStart
                    }, exposed$565);
                var closeParen$567 = syntaxFromToken$218({
                        type: parser$119.Token.Punctuator,
                        value: stx$564.token.value[1],
                        range: stx$564.token.endRange,
                        sm_range: stx$564.token.sm_range ? stx$564.token.sm_range : stx$564.token.endRange,
                        lineNumber: stx$564.token.endLineNumber,
                        sm_lineNumber: stx$564.token.sm_endLineNumber ? stx$564.token.sm_endLineNumber : stx$564.token.endLineNumber,
                        lineStart: stx$564.token.endLineStart,
                        sm_lineStart: stx$564.token.sm_endLineStart ? stx$564.token.sm_endLineStart : stx$564.token.endLineStart
                    }, exposed$565);
                if (stx$564.token.leadingComments) {
                    openParen$566.token.leadingComments = stx$564.token.leadingComments;
                }
                if (stx$564.token.trailingComments) {
                    openParen$566.token.trailingComments = stx$564.token.trailingComments;
                }
                return acc$563.concat(openParen$566).concat(flatten$279(exposed$565.token.inner)).concat(closeParen$567);
            }
            stx$564.token.sm_lineNumber = stx$564.token.sm_lineNumber ? stx$564.token.sm_lineNumber : stx$564.token.lineNumber;
            stx$564.token.sm_lineStart = stx$564.token.sm_lineStart ? stx$564.token.sm_lineStart : stx$564.token.lineStart;
            stx$564.token.sm_range = stx$564.token.sm_range ? stx$564.token.sm_range : stx$564.token.range;
            return acc$563.concat(stx$564);
        }, []);
    }
    exports$117.enforest = enforest$269;
    exports$117.expand = expandTopLevel$278;
    exports$117.resolve = resolve$222;
    exports$117.get_expression = get_expression$270;
    exports$117.makeExpanderContext = makeExpanderContext$277;
    exports$117.Expr = Expr$234;
    exports$117.VariableStatement = VariableStatement$260;
    exports$117.tokensToSyntax = syn$120.tokensToSyntax;
    exports$117.syntaxToTokens = syn$120.syntaxToTokens;
}));