(function (root$82, factory$83) {
    if (typeof exports === 'object') {
        factory$83(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('escodegen'), require('./es6-module-loader'), require('./scopedEval'), require('./patterns'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'es6-collections',
            'escodegen',
            'es6-module-loader',
            'scopedEval',
            'patterns'
        ], factory$83);
    }
}(this, function (exports$84, _$85, parser$86, syn$87, es6$88, codegen$89, modules$90, se$91, patternModule$92) {
    'use strict';
    exports$84._test = {};
    Object.prototype.create = function () {
        var o$195 = Object.create(this);
        if (typeof o$195.construct === 'function') {
            o$195.construct.apply(o$195, arguments);
        }
        return o$195;
    };
    Object.prototype.extend = function (properties$196) {
        var result$197 = Object.create(this);
        for (var prop$198 in properties$196) {
            if (properties$196.hasOwnProperty(prop$198)) {
                result$197[prop$198] = properties$196[prop$198];
            }
        }
        return result$197;
    };
    Object.prototype.hasPrototype = function (proto$199) {
        function F$200() {
        }
        F$200.prototype = proto$199;
        return this instanceof F$200;
    };
    function throwError$201(msg$202) {
        throw new Error(msg$202);
    }
    var Loader$151 = modules$90.Loader;
    var Module$152 = modules$90.Module;
    var scopedEval$153 = se$91.scopedEval;
    var Rename$154 = syn$87.Rename;
    var Mark$155 = syn$87.Mark;
    var Var$156 = syn$87.Var;
    var Def$157 = syn$87.Def;
    var isDef$158 = syn$87.isDef;
    var isMark$159 = syn$87.isMark;
    var isRename$160 = syn$87.isRename;
    var syntaxFromToken$161 = syn$87.syntaxFromToken;
    var mkSyntax$162 = syn$87.mkSyntax;
    function remdup$203(mark$204, mlist$205) {
        if (mark$204 === _$85.first(mlist$205)) {
            return _$85.rest(mlist$205, 1);
        }
        return [mark$204].concat(mlist$205);
    }
    function marksof$206(ctx$207, stopName$208, originalName$209) {
        var mark$210, submarks$211;
        if (isMark$159(ctx$207)) {
            mark$210 = ctx$207.mark;
            submarks$211 = marksof$206(ctx$207.context, stopName$208, originalName$209);
            return remdup$203(mark$210, submarks$211);
        }
        if (isDef$158(ctx$207)) {
            return marksof$206(ctx$207.context, stopName$208, originalName$209);
        }
        if (isRename$160(ctx$207)) {
            if (stopName$208 === originalName$209 + '$' + ctx$207.name) {
                return [];
            }
            return marksof$206(ctx$207.context, stopName$208, originalName$209);
        }
        return [];
    }
    function resolve$212(stx$213) {
        return resolveCtx$228(stx$213.token.value, stx$213.context, [], []);
    }
    function arraysEqual$214(a$215, b$216) {
        if (a$215.length !== b$216.length) {
            return false;
        }
        for (var i$217 = 0; i$217 < a$215.length; i$217++) {
            if (a$215[i$217] !== b$216[i$217]) {
                return false;
            }
        }
        return true;
    }
    function renames$218(defctx$219, oldctx$220, originalName$221) {
        var acc$222 = oldctx$220;
        for (var i$223 = 0; i$223 < defctx$219.length; i$223++) {
            if (defctx$219[i$223].id.token.value === originalName$221) {
                acc$222 = Rename$154(defctx$219[i$223].id, defctx$219[i$223].name, acc$222, defctx$219);
            }
        }
        return acc$222;
    }
    function unionEl$224(arr$225, el$226) {
        if (arr$225.indexOf(el$226) === -1) {
            var res$227 = arr$225.slice(0);
            res$227.push(el$226);
            return res$227;
        }
        return arr$225;
    }
    function resolveCtx$228(originalName$229, ctx$230, stop_spine$231, stop_branch$232) {
        if (isMark$159(ctx$230)) {
            return resolveCtx$228(originalName$229, ctx$230.context, stop_spine$231, stop_branch$232);
        }
        if (isDef$158(ctx$230)) {
            if (stop_spine$231.indexOf(ctx$230.defctx) !== -1) {
                return resolveCtx$228(originalName$229, ctx$230.context, stop_spine$231, stop_branch$232);
            } else {
                return resolveCtx$228(originalName$229, renames$218(ctx$230.defctx, ctx$230.context, originalName$229), stop_spine$231, unionEl$224(stop_branch$232, ctx$230.defctx));
            }
        }
        if (isRename$160(ctx$230)) {
            if (originalName$229 === ctx$230.id.token.value) {
                var idName$233 = resolveCtx$228(ctx$230.id.token.value, ctx$230.id.context, stop_branch$232, stop_branch$232);
                var subName$234 = resolveCtx$228(originalName$229, ctx$230.context, unionEl$224(stop_spine$231, ctx$230.def), stop_branch$232);
                if (idName$233 === subName$234) {
                    var idMarks$235 = marksof$206(ctx$230.id.context, originalName$229 + '$' + ctx$230.name, originalName$229);
                    var subMarks$236 = marksof$206(ctx$230.context, originalName$229 + '$' + ctx$230.name, originalName$229);
                    if (arraysEqual$214(idMarks$235, subMarks$236)) {
                        return originalName$229 + '$' + ctx$230.name;
                    }
                }
            }
            return resolveCtx$228(originalName$229, ctx$230.context, unionEl$224(stop_spine$231, ctx$230.def), stop_branch$232);
        }
        return originalName$229;
    }
    var nextFresh$163 = 0;
    function fresh$237() {
        return nextFresh$163++;
    }
    ;
    function joinSyntax$238(tojoin$239, punc$240) {
        if (tojoin$239.length === 0) {
            return [];
        }
        if (punc$240 === ' ') {
            return tojoin$239;
        }
        return _$85.reduce(_$85.rest(tojoin$239, 1), function (acc$241, join$242) {
            return acc$241.concat(mkSyntax$162(punc$240, parser$86.Token.Punctuator, join$242), join$242);
        }, [_$85.first(tojoin$239)]);
    }
    function wrapDelim$243(towrap$244, delimSyntax$245) {
        parser$86.assert(delimSyntax$245.token.type === parser$86.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$161({
            type: parser$86.Token.Delimiter,
            value: delimSyntax$245.token.value,
            inner: towrap$244,
            range: delimSyntax$245.token.range,
            startLineNumber: delimSyntax$245.token.startLineNumber,
            lineStart: delimSyntax$245.token.lineStart
        }, delimSyntax$245.context);
    }
    function getParamIdentifiers$246(argSyntax$247) {
        parser$86.assert(argSyntax$247.token.type === parser$86.Token.Delimiter, 'expecting delimiter for function params');
        return _$85.filter(argSyntax$247.token.inner, function (stx$248) {
            return stx$248.token.value !== ',';
        });
    }
    var TermTree$164 = {destruct: function (breakDelim$249) {
                return _$85.reduce(this.properties, _$85.bind(function (acc$250, prop$251) {
                    if (this[prop$251] && this[prop$251].hasPrototype(TermTree$164)) {
                        return acc$250.concat(this[prop$251].destruct(breakDelim$249));
                    } else if (this[prop$251]) {
                        return acc$250.concat(this[prop$251]);
                    } else {
                        return acc$250;
                    }
                }, this), []);
            }};
    var EOF$165 = TermTree$164.extend({
            properties: ['eof'],
            construct: function (e$252) {
                this.eof = e$252;
            }
        });
    var Statement$166 = TermTree$164.extend({construct: function () {
            }});
    var Expr$167 = TermTree$164.extend({construct: function () {
            }});
    var PrimaryExpression$168 = Expr$167.extend({construct: function () {
            }});
    var ThisExpression$169 = PrimaryExpression$168.extend({
            properties: ['this'],
            construct: function (that$253) {
                this.this = that$253;
            }
        });
    var Lit$170 = PrimaryExpression$168.extend({
            properties: ['lit'],
            construct: function (l$254) {
                this.lit = l$254;
            }
        });
    exports$84._test.PropertyAssignment = PropertyAssignment$171;
    var PropertyAssignment$171 = TermTree$164.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$255, assignment$256) {
                this.propName = propName$255;
                this.assignment = assignment$256;
            }
        });
    var Block$172 = PrimaryExpression$168.extend({
            properties: ['body'],
            construct: function (body$257) {
                this.body = body$257;
            }
        });
    var ArrayLiteral$173 = PrimaryExpression$168.extend({
            properties: ['array'],
            construct: function (ar$258) {
                this.array = ar$258;
            }
        });
    var ParenExpression$174 = PrimaryExpression$168.extend({
            properties: ['expr'],
            construct: function (expr$259) {
                this.expr = expr$259;
            }
        });
    var UnaryOp$175 = Expr$167.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$260, expr$261) {
                this.op = op$260;
                this.expr = expr$261;
            }
        });
    var PostfixOp$176 = Expr$167.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$262, op$263) {
                this.expr = expr$262;
                this.op = op$263;
            }
        });
    var BinOp$177 = Expr$167.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$264, left$265, right$266) {
                this.op = op$264;
                this.left = left$265;
                this.right = right$266;
            }
        });
    var ConditionalExpression$178 = Expr$167.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$267, question$268, tru$269, colon$270, fls$271) {
                this.cond = cond$267;
                this.question = question$268;
                this.tru = tru$269;
                this.colon = colon$270;
                this.fls = fls$271;
            }
        });
    var Keyword$179 = TermTree$164.extend({
            properties: ['keyword'],
            construct: function (k$272) {
                this.keyword = k$272;
            }
        });
    var Punc$180 = TermTree$164.extend({
            properties: ['punc'],
            construct: function (p$273) {
                this.punc = p$273;
            }
        });
    var Delimiter$181 = TermTree$164.extend({
            properties: ['delim'],
            destruct: function (breakDelim$274) {
                parser$86.assert(this.delim, 'expecting delim to be defined');
                var innerStx$275 = _$85.reduce(this.delim.token.inner, function (acc$276, term$277) {
                        if (term$277.hasPrototype(TermTree$164)) {
                            return acc$276.concat(term$277.destruct(breakDelim$274));
                        } else {
                            return acc$276.concat(term$277);
                        }
                    }, []);
                if (breakDelim$274) {
                    var openParen$278 = syntaxFromToken$161({
                            type: parser$86.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$279 = syntaxFromToken$161({
                            type: parser$86.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$278].concat(innerStx$275).concat(closeParen$279);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$280) {
                this.delim = d$280;
            }
        });
    var Id$182 = PrimaryExpression$168.extend({
            properties: ['id'],
            construct: function (id$281) {
                this.id = id$281;
            }
        });
    var NamedFun$183 = Expr$167.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$282, name$283, params$284, body$285) {
                this.keyword = keyword$282;
                this.name = name$283;
                this.params = params$284;
                this.body = body$285;
            }
        });
    var AnonFun$184 = Expr$167.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$286, params$287, body$288) {
                this.keyword = keyword$286;
                this.params = params$287;
                this.body = body$288;
            }
        });
    var LetMacro$185 = TermTree$164.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$289, body$290) {
                this.name = name$289;
                this.body = body$290;
            }
        });
    var Macro$186 = TermTree$164.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$291, body$292) {
                this.name = name$291;
                this.body = body$292;
            }
        });
    var Const$187 = Expr$167.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$293, call$294) {
                this.newterm = newterm$293;
                this.call = call$294;
            }
        });
    var Call$188 = Expr$167.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$295) {
                parser$86.assert(this.fun.hasPrototype(TermTree$164), 'expecting a term tree in destruct of call');
                var that$296 = this;
                this.delim = syntaxFromToken$161(_$85.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$85.reduce(this.args, function (acc$297, term$298) {
                    parser$86.assert(term$298 && term$298.hasPrototype(TermTree$164), 'expecting term trees in destruct of Call');
                    var dst$299 = acc$297.concat(term$298.destruct(breakDelim$295));
                    if (that$296.commas.length > 0) {
                        dst$299 = dst$299.concat(that$296.commas.shift());
                    }
                    return dst$299;
                }, []);
                return this.fun.destruct(breakDelim$295).concat(Delimiter$181.create(this.delim).destruct(breakDelim$295));
            },
            construct: function (funn$300, args$301, delim$302, commas$303) {
                parser$86.assert(Array.isArray(args$301), 'requires an array of arguments terms');
                this.fun = funn$300;
                this.args = args$301;
                this.delim = delim$302;
                this.commas = commas$303;
            }
        });
    var ObjDotGet$189 = Expr$167.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$304, dot$305, right$306) {
                this.left = left$304;
                this.dot = dot$305;
                this.right = right$306;
            }
        });
    var ObjGet$190 = Expr$167.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$307, right$308) {
                this.left = left$307;
                this.right = right$308;
            }
        });
    var VariableDeclaration$191 = TermTree$164.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$309, eqstx$310, init$311, comma$312) {
                this.ident = ident$309;
                this.eqstx = eqstx$310;
                this.init = init$311;
                this.comma = comma$312;
            }
        });
    var VariableStatement$192 = Statement$166.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$313) {
                return this.varkw.destruct(breakDelim$313).concat(_$85.reduce(this.decls, function (acc$314, decl$315) {
                    return acc$314.concat(decl$315.destruct(breakDelim$313));
                }, []));
            },
            construct: function (varkw$316, decls$317) {
                parser$86.assert(Array.isArray(decls$317), 'decls must be an array');
                this.varkw = varkw$316;
                this.decls = decls$317;
            }
        });
    var CatchClause$193 = TermTree$164.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$318, params$319, body$320) {
                this.catchkw = catchkw$318;
                this.params = params$319;
                this.body = body$320;
            }
        });
    var Empty$194 = TermTree$164.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$321(stx$322) {
        var staticOperators$323 = [
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
        return _$85.contains(staticOperators$323, stx$322.token.value);
    }
    function stxIsBinOp$324(stx$325) {
        var staticOperators$326 = [
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
        return _$85.contains(staticOperators$326, stx$325.token.value);
    }
    function enforestVarStatement$327(stx$328, env$329) {
        var decls$330 = [];
        var res$331 = enforest$338(stx$328, env$329);
        var result$332 = res$331.result;
        var rest$333 = res$331.rest;
        if (rest$333[0]) {
            var nextRes$334 = enforest$338(rest$333, env$329);
            if (nextRes$334.result.hasPrototype(Punc$180) && nextRes$334.result.punc.token.value === '=') {
                var initializerRes$335 = enforest$338(nextRes$334.rest, env$329);
                if (initializerRes$335.rest[0]) {
                    var restRes$336 = enforest$338(initializerRes$335.rest, env$329);
                    if (restRes$336.result.hasPrototype(Punc$180) && restRes$336.result.punc.token.value === ',') {
                        decls$330.push(VariableDeclaration$191.create(result$332.id, nextRes$334.result.punc, initializerRes$335.result, restRes$336.result.punc));
                        var subRes$337 = enforestVarStatement$327(restRes$336.rest, env$329);
                        decls$330 = decls$330.concat(subRes$337.result);
                        rest$333 = subRes$337.rest;
                    } else {
                        decls$330.push(VariableDeclaration$191.create(result$332.id, nextRes$334.result.punc, initializerRes$335.result));
                        rest$333 = initializerRes$335.rest;
                    }
                } else {
                    decls$330.push(VariableDeclaration$191.create(result$332.id, nextRes$334.result.punc, initializerRes$335.result));
                }
            } else if (nextRes$334.result.hasPrototype(Punc$180) && nextRes$334.result.punc.token.value === ',') {
                decls$330.push(VariableDeclaration$191.create(result$332.id, null, null, nextRes$334.result.punc));
                var subRes$337 = enforestVarStatement$327(nextRes$334.rest, env$329);
                decls$330 = decls$330.concat(subRes$337.result);
                rest$333 = subRes$337.rest;
            } else {
                if (result$332.hasPrototype(Id$182)) {
                    decls$330.push(VariableDeclaration$191.create(result$332.id));
                } else {
                    throwError$201('Expecting an identifier in variable declaration');
                }
            }
        } else {
            if (result$332.hasPrototype(Id$182)) {
                decls$330.push(VariableDeclaration$191.create(result$332.id));
            } else if (result$332.hasPrototype(BinOp$177) && result$332.op.token.value === 'in') {
                decls$330.push(VariableDeclaration$191.create(result$332.left.id, result$332.op, result$332.right));
            } else {
                throwError$201('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$330,
            rest: rest$333
        };
    }
    function enforest$338(toks$339, env$340) {
        env$340 = env$340 || new Map();
        parser$86.assert(toks$339.length > 0, 'enforest assumes there are tokens to work with');
        function step$341(head$342, rest$343) {
            var innerTokens$344;
            parser$86.assert(Array.isArray(rest$343), 'result must at least be an empty array');
            if (head$342.hasPrototype(TermTree$164)) {
                var emp$347 = head$342.emp;
                var emp$347 = head$342.emp;
                var keyword$350 = head$342.keyword;
                var delim$352 = head$342.delim;
                var emp$347 = head$342.emp;
                var punc$355 = head$342.punc;
                var keyword$350 = head$342.keyword;
                var emp$347 = head$342.emp;
                var emp$347 = head$342.emp;
                var emp$347 = head$342.emp;
                var delim$352 = head$342.delim;
                var delim$352 = head$342.delim;
                var keyword$350 = head$342.keyword;
                if (head$342.hasPrototype(Expr$167) && (rest$343[0] && rest$343[0].token.type === parser$86.Token.Delimiter && rest$343[0].token.value === '()')) {
                    var argRes$378, enforestedArgs$379 = [], commas$380 = [];
                    innerTokens$344 = rest$343[0].token.inner;
                    while (innerTokens$344.length > 0) {
                        argRes$378 = enforest$338(innerTokens$344, env$340);
                        enforestedArgs$379.push(argRes$378.result);
                        innerTokens$344 = argRes$378.rest;
                        if (innerTokens$344[0] && innerTokens$344[0].token.value === ',') {
                            commas$380.push(innerTokens$344[0]);
                            innerTokens$344 = innerTokens$344.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$381 = _$85.all(enforestedArgs$379, function (argTerm$382) {
                            return argTerm$382.hasPrototype(Expr$167);
                        });
                    if (innerTokens$344.length === 0 && argsAreExprs$381) {
                        return step$341(Call$188.create(head$342, enforestedArgs$379, rest$343[0], commas$380), rest$343.slice(1));
                    }
                } else if (head$342.hasPrototype(Expr$167) && (rest$343[0] && rest$343[0].token.value === '?')) {
                    var question$383 = rest$343[0];
                    var condRes$384 = enforest$338(rest$343.slice(1), env$340);
                    var truExpr$385 = condRes$384.result;
                    var right$386 = condRes$384.rest;
                    if (truExpr$385.hasPrototype(Expr$167) && right$386[0] && right$386[0].token.value === ':') {
                        var colon$387 = right$386[0];
                        var flsRes$388 = enforest$338(right$386.slice(1), env$340);
                        var flsExpr$389 = flsRes$388.result;
                        if (flsExpr$389.hasPrototype(Expr$167)) {
                            return step$341(ConditionalExpression$178.create(head$342, question$383, truExpr$385, colon$387, flsExpr$389), flsRes$388.rest);
                        }
                    }
                } else if (head$342.hasPrototype(Keyword$179) && (keyword$350.token.value === 'new' && rest$343[0])) {
                    var newCallRes$390 = enforest$338(rest$343, env$340);
                    if (newCallRes$390.result.hasPrototype(Call$188)) {
                        return step$341(Const$187.create(head$342, newCallRes$390.result), newCallRes$390.rest);
                    }
                } else if (head$342.hasPrototype(Delimiter$181) && delim$352.token.value === '()') {
                    innerTokens$344 = delim$352.token.inner;
                    if (innerTokens$344.length === 0) {
                        return step$341(ParenExpression$174.create(head$342), rest$343);
                    } else {
                        var innerTerm$391 = get_expression$401(innerTokens$344, env$340);
                        if (innerTerm$391.result && innerTerm$391.result.hasPrototype(Expr$167)) {
                            return step$341(ParenExpression$174.create(head$342), rest$343);
                        }
                    }
                } else if (head$342.hasPrototype(TermTree$164) && (rest$343[0] && rest$343[1] && stxIsBinOp$324(rest$343[0]))) {
                    var op$392 = rest$343[0];
                    var left$393 = head$342;
                    var bopRes$394 = enforest$338(rest$343.slice(1), env$340);
                    var right$386 = bopRes$394.result;
                    if (right$386.hasPrototype(Expr$167)) {
                        return step$341(BinOp$177.create(op$392, left$393, right$386), bopRes$394.rest);
                    }
                } else if (head$342.hasPrototype(Punc$180) && stxIsUnaryOp$321(punc$355)) {
                    var unopRes$395 = enforest$338(rest$343, env$340);
                    if (unopRes$395.result.hasPrototype(Expr$167)) {
                        return step$341(UnaryOp$175.create(punc$355, unopRes$395.result), unopRes$395.rest);
                    }
                } else if (head$342.hasPrototype(Keyword$179) && stxIsUnaryOp$321(keyword$350)) {
                    var unopRes$395 = enforest$338(rest$343, env$340);
                    if (unopRes$395.result.hasPrototype(Expr$167)) {
                        return step$341(UnaryOp$175.create(keyword$350, unopRes$395.result), unopRes$395.rest);
                    }
                } else if (head$342.hasPrototype(Expr$167) && (rest$343[0] && (rest$343[0].token.value === '++' || rest$343[0].token.value === '--'))) {
                    return step$341(PostfixOp$176.create(head$342, rest$343[0]), rest$343.slice(1));
                } else if (head$342.hasPrototype(Expr$167) && (rest$343[0] && rest$343[0].token.value === '[]')) {
                    var getRes$396 = enforest$338(rest$343[0].token.inner, env$340);
                    var resStx$397 = mkSyntax$162('[]', parser$86.Token.Delimiter, rest$343[0]);
                    resStx$397.token.inner = [getRes$396.result];
                    return step$341(ObjGet$190.create(head$342, Delimiter$181.create(resStx$397)), rest$343.slice(1));
                } else if (head$342.hasPrototype(Expr$167) && (rest$343[0] && rest$343[0].token.value === '.' && rest$343[1] && rest$343[1].token.type === parser$86.Token.Identifier)) {
                    return step$341(ObjDotGet$189.create(head$342, rest$343[0], rest$343[1]), rest$343.slice(2));
                } else if (head$342.hasPrototype(Delimiter$181) && delim$352.token.value === '[]') {
                    return step$341(ArrayLiteral$173.create(head$342), rest$343);
                } else if (head$342.hasPrototype(Delimiter$181) && head$342.delim.token.value === '{}') {
                    return step$341(Block$172.create(head$342), rest$343);
                } else if (head$342.hasPrototype(Keyword$179) && (keyword$350.token.value === 'var' && rest$343[0])) {
                    var vsRes$398 = enforestVarStatement$327(rest$343, env$340);
                    if (vsRes$398) {
                        return step$341(VariableStatement$192.create(head$342, vsRes$398.result), vsRes$398.rest);
                    }
                }
            } else {
                parser$86.assert(head$342 && head$342.token, 'assuming head is a syntax object');
                if ((head$342.token.type === parser$86.Token.Identifier || head$342.token.type === parser$86.Token.Keyword || head$342.token.type === parser$86.Token.Punctuator) && env$340.has(head$342.token.value) && env$340.get(head$342.token.value).name === resolve$212(head$342)) {
                    var transformer$399 = env$340.get(head$342.token.value).fn;
                    var rt$400 = transformer$399([head$342].concat(rest$343), env$340);
                    if (!Array.isArray(rt$400.result)) {
                        throwError$201('Macro transformer must return a result array, not: ' + rt$400.result);
                    }
                    if (rt$400.result.length > 0) {
                        return step$341(rt$400.result[0], rt$400.result.slice(1).concat(rt$400.rest));
                    } else {
                        return step$341(Empty$194.create(), rt$400.rest);
                    }
                } else if (head$342.token.value === 'let' && rest$343[0] && rest$343[0].token.type === parser$86.Token.Identifier && rest$343[1] && rest$343[1].token.value === '=' && rest$343[2] && rest$343[2].token.value === 'macro' && rest$343[3] && rest$343[3].token.value === '{}') {
                    return step$341(LetMacro$185.create(rest$343[0], rest$343[3].token.inner), rest$343.slice(4));
                } else if (head$342.token.type === parser$86.Token.Identifier && head$342.token.value === 'macro' && rest$343[0] && (rest$343[0].token.type === parser$86.Token.Identifier || rest$343[0].token.type === parser$86.Token.Keyword || rest$343[0].token.type === parser$86.Token.Punctuator) && rest$343[1] && rest$343[1].token.type === parser$86.Token.Delimiter && rest$343[1].token.value === '{}') {
                    return step$341(Macro$186.create(rest$343[0], rest$343[1].token.inner), rest$343.slice(2));
                } else if (head$342.token.type === parser$86.Token.Keyword && head$342.token.value === 'function' && rest$343[0] && rest$343[0].token.type === parser$86.Token.Identifier && rest$343[1] && rest$343[1].token.type === parser$86.Token.Delimiter && rest$343[1].token.value === '()' && rest$343[2] && rest$343[2].token.type === parser$86.Token.Delimiter && rest$343[2].token.value === '{}') {
                    return step$341(NamedFun$183.create(head$342, rest$343[0], rest$343[1], rest$343[2]), rest$343.slice(3));
                } else if (head$342.token.type === parser$86.Token.Keyword && head$342.token.value === 'function' && rest$343[0] && rest$343[0].token.type === parser$86.Token.Delimiter && rest$343[0].token.value === '()' && rest$343[1] && rest$343[1].token.type === parser$86.Token.Delimiter && rest$343[1].token.value === '{}') {
                    return step$341(AnonFun$184.create(head$342, rest$343[0], rest$343[1]), rest$343.slice(2));
                } else if (head$342.token.type === parser$86.Token.Keyword && head$342.token.value === 'catch' && rest$343[0] && rest$343[0].token.type === parser$86.Token.Delimiter && rest$343[0].token.value === '()' && rest$343[1] && rest$343[1].token.type === parser$86.Token.Delimiter && rest$343[1].token.value === '{}') {
                    return step$341(CatchClause$193.create(head$342, rest$343[0], rest$343[1]), rest$343.slice(2));
                } else if (head$342.token.type === parser$86.Token.Keyword && head$342.token.value === 'this') {
                    return step$341(ThisExpression$169.create(head$342), rest$343);
                } else if (head$342.token.type === parser$86.Token.NumericLiteral || head$342.token.type === parser$86.Token.StringLiteral || head$342.token.type === parser$86.Token.BooleanLiteral || head$342.token.type === parser$86.Token.RegexLiteral || head$342.token.type === parser$86.Token.NullLiteral) {
                    return step$341(Lit$170.create(head$342), rest$343);
                } else if (head$342.token.type === parser$86.Token.Identifier) {
                    return step$341(Id$182.create(head$342), rest$343);
                } else if (head$342.token.type === parser$86.Token.Punctuator) {
                    return step$341(Punc$180.create(head$342), rest$343);
                } else if (head$342.token.type === parser$86.Token.Keyword && head$342.token.value === 'with') {
                    throwError$201('with is not supported in sweet.js');
                } else if (head$342.token.type === parser$86.Token.Keyword) {
                    return step$341(Keyword$179.create(head$342), rest$343);
                } else if (head$342.token.type === parser$86.Token.Delimiter) {
                    return step$341(Delimiter$181.create(head$342), rest$343);
                } else if (head$342.token.type === parser$86.Token.EOF) {
                    parser$86.assert(rest$343.length === 0, 'nothing should be after an EOF');
                    return step$341(EOF$165.create(head$342), []);
                } else {
                    parser$86.assert(false, 'not implemented');
                }
            }
            return {
                result: head$342,
                rest: rest$343
            };
        }
        return step$341(toks$339[0], toks$339.slice(1));
    }
    function get_expression$401(stx$402, env$403) {
        var res$404 = enforest$338(stx$402, env$403);
        if (!res$404.result.hasPrototype(Expr$167)) {
            return {
                result: null,
                rest: stx$402
            };
        }
        return res$404;
    }
    function applyMarkToPatternEnv$405(newMark$406, env$407) {
        function dfs$408(match$409) {
            if (match$409.level === 0) {
                match$409.match = _$85.map(match$409.match, function (stx$410) {
                    return stx$410.mark(newMark$406);
                });
            } else {
                _$85.each(match$409.match, function (match$411) {
                    dfs$408(match$411);
                });
            }
        }
        _$85.keys(env$407).forEach(function (key$412) {
            dfs$408(env$407[key$412]);
        });
    }
    function loadMacroDef$413(mac$414, env$415, defscope$416, templateMap$417) {
        var body$418 = mac$414.body;
        if (!(body$418[0] && body$418[0].token.type === parser$86.Token.Keyword && body$418[0].token.value === 'function')) {
            throwError$201('Primitive macro form must contain a function for the macro body');
        }
        var stub$419 = parser$86.read('()');
        stub$419[0].token.inner = body$418;
        var expanded$420 = flatten$491(expand$477(stub$419, env$415, defscope$416, templateMap$417));
        var bodyCode$421 = codegen$89.generate(parser$86.parse(expanded$420));
        var macroFn$422 = scopedEval$153(bodyCode$421, {
                makeValue: syn$87.makeValue,
                makeRegex: syn$87.makeRegex,
                makeIdent: syn$87.makeIdent,
                makeKeyword: syn$87.makeKeyword,
                makePunc: syn$87.makePunc,
                makeDelim: syn$87.makeDelim,
                unwrapSyntax: syn$87.unwrapSyntax,
                fresh: fresh$237,
                _: _$85,
                parser: parser$86,
                patternModule: patternModule$92,
                getTemplate: function (id$423) {
                    return templateMap$417.get(id$423);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$405,
                mergeMatches: function (newMatch$424, oldMatch$425) {
                    newMatch$424.patternEnv = _$85.extend({}, oldMatch$425.patternEnv, newMatch$424.patternEnv);
                    return newMatch$424;
                }
            });
        return macroFn$422;
    }
    function expandToTermTree$426(stx$427, env$428, defscope$429, templateMap$430) {
        parser$86.assert(env$428, 'environment map is required');
        if (stx$427.length === 0) {
            return {
                terms: [],
                env: env$428
            };
        }
        parser$86.assert(stx$427[0].token, 'expecting a syntax object');
        var f$431 = enforest$338(stx$427, env$428);
        var head$432 = f$431.result;
        var rest$433 = f$431.rest;
        if (head$432.hasPrototype(Macro$186)) {
            var macroDefinition$435 = loadMacroDef$413(head$432, env$428, defscope$429, templateMap$430);
            addToDefinitionCtx$442([head$432.name], defscope$429, false);
            env$428.set(head$432.name.token.value, {
                name: resolve$212(head$432.name),
                fn: macroDefinition$435
            });
            return expandToTermTree$426(rest$433, env$428, defscope$429, templateMap$430);
        }
        if (head$432.hasPrototype(LetMacro$185)) {
            var macroDefinition$435 = loadMacroDef$413(head$432, env$428, defscope$429, templateMap$430);
            addToDefinitionCtx$442([head$432.name], defscope$429, false);
            env$428.set(resolve$212(head$432.name), macroDefinition$435);
            return expandToTermTree$426(rest$433, env$428, defscope$429, templateMap$430);
        }
        if (head$432.hasPrototype(NamedFun$183)) {
            addToDefinitionCtx$442([head$432.name], defscope$429, true);
        }
        if (head$432.hasPrototype(Id$182) && head$432.id.token.value === '#quoteSyntax' && rest$433[0] && rest$433[0].token.value === '{}') {
            var tempId$436 = fresh$237();
            templateMap$430.set(tempId$436, rest$433[0].token.inner);
            return expandToTermTree$426([
                syn$87.makeIdent('getTemplate', head$432.id),
                syn$87.makeDelim('()', [syn$87.makeValue(tempId$436, head$432.id)])
            ].concat(rest$433.slice(1)), env$428, defscope$429, templateMap$430);
        }
        if (head$432.hasPrototype(VariableStatement$192)) {
            addToDefinitionCtx$442(_$85.map(head$432.decls, function (decl$437) {
                return decl$437.ident;
            }), defscope$429, true);
        }
        if (head$432.hasPrototype(Block$172) && head$432.body.hasPrototype(Delimiter$181)) {
            head$432.body.delim.token.inner.forEach(function (term$438) {
                if (term$438.hasPrototype(VariableStatement$192)) {
                    addToDefinitionCtx$442(_$85.map(term$438.decls, function (decl$439) {
                        return decl$439.ident;
                    }), defscope$429, true);
                }
            });
        }
        if (head$432.hasPrototype(Delimiter$181)) {
            head$432.delim.token.inner.forEach(function (term$440) {
                if (term$440.hasPrototype(VariableStatement$192)) {
                    addToDefinitionCtx$442(_$85.map(term$440.decls, function (decl$441) {
                        return decl$441.ident;
                    }), defscope$429, true);
                }
            });
        }
        var trees$434 = expandToTermTree$426(rest$433, env$428, defscope$429, templateMap$430);
        return {
            terms: [head$432].concat(trees$434.terms),
            env: trees$434.env
        };
    }
    function addToDefinitionCtx$442(idents$443, defscope$444, skipRep$445) {
        parser$86.assert(idents$443 && idents$443.length > 0, 'expecting some variable identifiers');
        skipRep$445 = skipRep$445 || false;
        _$85.each(idents$443, function (id$446) {
            var skip$447 = false;
            if (skipRep$445) {
                var declRepeat$448 = _$85.find(defscope$444, function (def$449) {
                        return def$449.id.token.value === id$446.token.value && arraysEqual$214(marksof$206(def$449.id.context), marksof$206(id$446.context));
                    });
                skip$447 = typeof declRepeat$448 !== 'undefined';
            }
            if (!skip$447) {
                var name$450 = fresh$237();
                defscope$444.push({
                    id: id$446,
                    name: name$450
                });
            }
        });
    }
    function expandTermTreeToFinal$451(term$452, env$453, defscope$454, templateMap$455) {
        parser$86.assert(env$453, 'environment map is required');
        if (term$452.hasPrototype(ArrayLiteral$173)) {
            term$452.array.delim.token.inner = expand$477(term$452.array.delim.token.inner, env$453, defscope$454, templateMap$455);
            return term$452;
        } else if (term$452.hasPrototype(Block$172)) {
            term$452.body.delim.token.inner = expand$477(term$452.body.delim.token.inner, env$453, defscope$454, templateMap$455);
            return term$452;
        } else if (term$452.hasPrototype(ParenExpression$174)) {
            term$452.expr.delim.token.inner = expand$477(term$452.expr.delim.token.inner, env$453, defscope$454, templateMap$455);
            return term$452;
        } else if (term$452.hasPrototype(Call$188)) {
            term$452.fun = expandTermTreeToFinal$451(term$452.fun, env$453, defscope$454, templateMap$455);
            term$452.args = _$85.map(term$452.args, function (arg$456) {
                return expandTermTreeToFinal$451(arg$456, env$453, defscope$454, templateMap$455);
            });
            return term$452;
        } else if (term$452.hasPrototype(UnaryOp$175)) {
            term$452.expr = expandTermTreeToFinal$451(term$452.expr, env$453, defscope$454, templateMap$455);
            return term$452;
        } else if (term$452.hasPrototype(BinOp$177)) {
            term$452.left = expandTermTreeToFinal$451(term$452.left, env$453, defscope$454, templateMap$455);
            term$452.right = expandTermTreeToFinal$451(term$452.right, env$453, defscope$454);
            return term$452;
        } else if (term$452.hasPrototype(ObjDotGet$189)) {
            term$452.left = expandTermTreeToFinal$451(term$452.left, env$453, defscope$454, templateMap$455);
            term$452.right = expandTermTreeToFinal$451(term$452.right, env$453, defscope$454, templateMap$455);
            return term$452;
        } else if (term$452.hasPrototype(VariableDeclaration$191)) {
            if (term$452.init) {
                term$452.init = expandTermTreeToFinal$451(term$452.init, env$453, defscope$454, templateMap$455);
            }
            return term$452;
        } else if (term$452.hasPrototype(VariableStatement$192)) {
            term$452.decls = _$85.map(term$452.decls, function (decl$457) {
                return expandTermTreeToFinal$451(decl$457, env$453, defscope$454, templateMap$455);
            });
            return term$452;
        } else if (term$452.hasPrototype(Delimiter$181)) {
            term$452.delim.token.inner = expand$477(term$452.delim.token.inner, env$453, defscope$454, templateMap$455);
            return term$452;
        } else if (term$452.hasPrototype(NamedFun$183) || term$452.hasPrototype(AnonFun$184) || term$452.hasPrototype(CatchClause$193)) {
            var newDef$458 = [];
            var params$459 = term$452.params.addDefCtx(newDef$458);
            var bodies$460 = term$452.body.addDefCtx(newDef$458);
            var paramNames$461 = _$85.map(getParamIdentifiers$246(params$459), function (param$469) {
                    var freshName$470 = fresh$237();
                    return {
                        freshName: freshName$470,
                        originalParam: param$469,
                        renamedParam: param$469.rename(param$469, freshName$470)
                    };
                });
            var stxBody$462 = bodies$460;
            var renamedBody$463 = _$85.reduce(paramNames$461, function (accBody$471, p$472) {
                    return accBody$471.rename(p$472.originalParam, p$472.freshName);
                }, stxBody$462);
            var bodyTerms$464 = expand$477([renamedBody$463], env$453, newDef$458, templateMap$455);
            parser$86.assert(bodyTerms$464.length === 1 && bodyTerms$464[0].body, 'expecting a block in the bodyTerms');
            var flattenedBody$465 = flatten$491(bodyTerms$464);
            var renamedParams$466 = _$85.map(paramNames$461, function (p$473) {
                    return p$473.renamedParam;
                });
            var flatArgs$467 = wrapDelim$243(joinSyntax$238(renamedParams$466, ','), term$452.params);
            var expandedArgs$468 = expand$477([flatArgs$467], env$453, newDef$458, templateMap$455);
            parser$86.assert(expandedArgs$468.length === 1, 'should only get back one result');
            term$452.params = expandedArgs$468[0];
            term$452.body = _$85.map(flattenedBody$465, function (stx$474) {
                return _$85.reduce(newDef$458, function (acc$475, def$476) {
                    return acc$475.rename(def$476.id, def$476.name);
                }, stx$474);
            });
            return term$452;
        }
        return term$452;
    }
    function expand$477(stx$478, env$479, defscope$480, templateMap$481) {
        env$479 = env$479 || new Map();
        templateMap$481 = templateMap$481 || new Map();
        var trees$482 = expandToTermTree$426(stx$478, env$479, defscope$480, templateMap$481);
        return _$85.map(trees$482.terms, function (term$483) {
            return expandTermTreeToFinal$451(term$483, trees$482.env, defscope$480, templateMap$481);
        });
    }
    function expandTopLevel$484(stx$485) {
        var funn$486 = syntaxFromToken$161({
                value: 'function',
                type: parser$86.Token.Keyword
            });
        var params$487 = syntaxFromToken$161({
                value: '()',
                type: parser$86.Token.Delimiter,
                inner: []
            });
        var body$488 = syntaxFromToken$161({
                value: '{}',
                type: parser$86.Token.Delimiter,
                inner: stx$485
            });
        var res$489 = expand$477([
                funn$486,
                params$487,
                body$488
            ]);
        return _$85.map(res$489[0].body.slice(1, res$489[0].body.length - 1), function (stx$490) {
            return stx$490;
        });
    }
    function flatten$491(terms$492) {
        return _$85.reduce(terms$492, function (acc$493, term$494) {
            return acc$493.concat(term$494.destruct(true));
        }, []);
    }
    exports$84.enforest = enforest$338;
    exports$84.expand = expandTopLevel$484;
    exports$84.resolve = resolve$212;
    exports$84.flatten = flatten$491;
    exports$84.get_expression = get_expression$401;
    exports$84.Expr = Expr$167;
    exports$84.VariableStatement = VariableStatement$192;
    exports$84.tokensToSyntax = syn$87.tokensToSyntax;
}));