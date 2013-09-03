(function (root$84, factory$85) {
    if (typeof exports === 'object') {
        factory$85(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('escodegen'), require('./es6-module-loader'), require('./scopedEval'), require('./patterns'));
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
        ], factory$85);
    }
}(this, function (exports$86, _$87, parser$88, syn$89, es6$90, codegen$91, modules$92, se$93, patternModule$94) {
    'use strict';
    exports$86._test = {};
    Object.prototype.create = function () {
        var o$222 = Object.create(this);
        if (typeof o$222.construct === 'function') {
            o$222.construct.apply(o$222, arguments);
        }
        return o$222;
    };
    Object.prototype.extend = function (properties$223) {
        var result$224 = Object.create(this);
        for (var prop$225 in properties$223) {
            if (properties$223.hasOwnProperty(prop$225)) {
                result$224[prop$225] = properties$223[prop$225];
            }
        }
        return result$224;
    };
    Object.prototype.hasPrototype = function (proto$226) {
        function F$227() {
        }
        F$227.prototype = proto$226;
        return this instanceof F$227;
    };
    function throwError$153(msg$228) {
        throw new Error(msg$228);
    }
    var Loader$154 = modules$92.Loader;
    var Module$155 = modules$92.Module;
    var scopedEval$156 = se$93.scopedEval;
    var Rename$157 = syn$89.Rename;
    var Mark$158 = syn$89.Mark;
    var Var$159 = syn$89.Var;
    var Def$160 = syn$89.Def;
    var isDef$161 = syn$89.isDef;
    var isMark$162 = syn$89.isMark;
    var isRename$163 = syn$89.isRename;
    var syntaxFromToken$164 = syn$89.syntaxFromToken;
    var mkSyntax$165 = syn$89.mkSyntax;
    function remdup$166(mark$229, mlist$230) {
        if (mark$229 === _$87.first(mlist$230)) {
            return _$87.rest(mlist$230, 1);
        }
        return [mark$229].concat(mlist$230);
    }
    function marksof$167(ctx$231, stopName$232, originalName$233) {
        var mark$234, submarks$235;
        if (isMark$162(ctx$231)) {
            mark$234 = ctx$231.mark;
            submarks$235 = marksof$167(ctx$231.context, stopName$232, originalName$233);
            return remdup$166(mark$234, submarks$235);
        }
        if (isDef$161(ctx$231)) {
            return marksof$167(ctx$231.context, stopName$232, originalName$233);
        }
        if (isRename$163(ctx$231)) {
            if (stopName$232 === originalName$233 + '$' + ctx$231.name) {
                return [];
            }
            return marksof$167(ctx$231.context, stopName$232, originalName$233);
        }
        return [];
    }
    function resolve$168(stx$236) {
        return resolveCtx$172(stx$236.token.value, stx$236.context, [], []);
    }
    function arraysEqual$169(a$237, b$238) {
        if (a$237.length !== b$238.length) {
            return false;
        }
        for (var i$239 = 0; i$239 < a$237.length; i$239++) {
            if (a$237[i$239] !== b$238[i$239]) {
                return false;
            }
        }
        return true;
    }
    function renames$170(defctx$240, oldctx$241, originalName$242) {
        var acc$243 = oldctx$241;
        for (var i$244 = 0; i$244 < defctx$240.length; i$244++) {
            if (defctx$240[i$244].id.token.value === originalName$242) {
                acc$243 = Rename$157(defctx$240[i$244].id, defctx$240[i$244].name, acc$243, defctx$240);
            }
        }
        return acc$243;
    }
    function unionEl$171(arr$245, el$246) {
        if (arr$245.indexOf(el$246) === -1) {
            var res$247 = arr$245.slice(0);
            res$247.push(el$246);
            return res$247;
        }
        return arr$245;
    }
    function resolveCtx$172(originalName$248, ctx$249, stop_spine$250, stop_branch$251) {
        if (isMark$162(ctx$249)) {
            return resolveCtx$172(originalName$248, ctx$249.context, stop_spine$250, stop_branch$251);
        }
        if (isDef$161(ctx$249)) {
            if (stop_spine$250.indexOf(ctx$249.defctx) !== -1) {
                return resolveCtx$172(originalName$248, ctx$249.context, stop_spine$250, stop_branch$251);
            } else {
                return resolveCtx$172(originalName$248, renames$170(ctx$249.defctx, ctx$249.context, originalName$248), stop_spine$250, unionEl$171(stop_branch$251, ctx$249.defctx));
            }
        }
        if (isRename$163(ctx$249)) {
            if (originalName$248 === ctx$249.id.token.value) {
                var idName$252 = resolveCtx$172(ctx$249.id.token.value, ctx$249.id.context, stop_branch$251, stop_branch$251);
                var subName$253 = resolveCtx$172(originalName$248, ctx$249.context, unionEl$171(stop_spine$250, ctx$249.def), stop_branch$251);
                if (idName$252 === subName$253) {
                    var idMarks$254 = marksof$167(ctx$249.id.context, originalName$248 + '$' + ctx$249.name, originalName$248);
                    var subMarks$255 = marksof$167(ctx$249.context, originalName$248 + '$' + ctx$249.name, originalName$248);
                    if (arraysEqual$169(idMarks$254, subMarks$255)) {
                        return originalName$248 + '$' + ctx$249.name;
                    }
                }
            }
            return resolveCtx$172(originalName$248, ctx$249.context, unionEl$171(stop_spine$250, ctx$249.def), stop_branch$251);
        }
        return originalName$248;
    }
    var nextFresh$173 = 0;
    function fresh$174() {
        return nextFresh$173++;
    }
    ;
    function joinSyntax$175(tojoin$256, punc$257) {
        if (tojoin$256.length === 0) {
            return [];
        }
        if (punc$257 === ' ') {
            return tojoin$256;
        }
        return _$87.reduce(_$87.rest(tojoin$256, 1), function (acc$258, join$259) {
            return acc$258.concat(mkSyntax$165(punc$257, parser$88.Token.Punctuator, join$259), join$259);
        }, [_$87.first(tojoin$256)]);
    }
    function wrapDelim$176(towrap$260, delimSyntax$261) {
        parser$88.assert(delimSyntax$261.token.type === parser$88.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$164({
            type: parser$88.Token.Delimiter,
            value: delimSyntax$261.token.value,
            inner: towrap$260,
            range: delimSyntax$261.token.range,
            startLineNumber: delimSyntax$261.token.startLineNumber,
            lineStart: delimSyntax$261.token.lineStart
        }, delimSyntax$261.context);
    }
    function getParamIdentifiers$177(argSyntax$262) {
        parser$88.assert(argSyntax$262.token.type === parser$88.Token.Delimiter, 'expecting delimiter for function params');
        return _$87.filter(argSyntax$262.token.inner, function (stx$263) {
            return stx$263.token.value !== ',';
        });
    }
    var TermTree$178 = {destruct: function (breakDelim$264) {
                return _$87.reduce(this.properties, _$87.bind(function (acc$265, prop$266) {
                    if (this[prop$266] && this[prop$266].hasPrototype(TermTree$178)) {
                        return acc$265.concat(this[prop$266].destruct(breakDelim$264));
                    } else if (this[prop$266]) {
                        return acc$265.concat(this[prop$266]);
                    } else {
                        return acc$265;
                    }
                }, this), []);
            }};
    var EOF$179 = TermTree$178.extend({
            properties: ['eof'],
            construct: function (e$267) {
                this.eof = e$267;
            }
        });
    var Statement$180 = TermTree$178.extend({construct: function () {
            }});
    var Expr$181 = TermTree$178.extend({construct: function () {
            }});
    var PrimaryExpression$182 = Expr$181.extend({construct: function () {
            }});
    var ThisExpression$183 = PrimaryExpression$182.extend({
            properties: ['this'],
            construct: function (that$268) {
                this.this = that$268;
            }
        });
    var Lit$184 = PrimaryExpression$182.extend({
            properties: ['lit'],
            construct: function (l$269) {
                this.lit = l$269;
            }
        });
    exports$86._test.PropertyAssignment = PropertyAssignment$185;
    var PropertyAssignment$185 = TermTree$178.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$270, assignment$271) {
                this.propName = propName$270;
                this.assignment = assignment$271;
            }
        });
    var Block$186 = PrimaryExpression$182.extend({
            properties: ['body'],
            construct: function (body$272) {
                this.body = body$272;
            }
        });
    var ArrayLiteral$187 = PrimaryExpression$182.extend({
            properties: ['array'],
            construct: function (ar$273) {
                this.array = ar$273;
            }
        });
    var ParenExpression$188 = PrimaryExpression$182.extend({
            properties: ['expr'],
            construct: function (expr$274) {
                this.expr = expr$274;
            }
        });
    var UnaryOp$189 = Expr$181.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$275, expr$276) {
                this.op = op$275;
                this.expr = expr$276;
            }
        });
    var PostfixOp$190 = Expr$181.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$277, op$278) {
                this.expr = expr$277;
                this.op = op$278;
            }
        });
    var BinOp$191 = Expr$181.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$279, left$280, right$281) {
                this.op = op$279;
                this.left = left$280;
                this.right = right$281;
            }
        });
    var ConditionalExpression$192 = Expr$181.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$282, question$283, tru$284, colon$285, fls$286) {
                this.cond = cond$282;
                this.question = question$283;
                this.tru = tru$284;
                this.colon = colon$285;
                this.fls = fls$286;
            }
        });
    var Keyword$193 = TermTree$178.extend({
            properties: ['keyword'],
            construct: function (k$287) {
                this.keyword = k$287;
            }
        });
    var Punc$194 = TermTree$178.extend({
            properties: ['punc'],
            construct: function (p$288) {
                this.punc = p$288;
            }
        });
    var Delimiter$195 = TermTree$178.extend({
            properties: ['delim'],
            destruct: function (breakDelim$289) {
                parser$88.assert(this.delim, 'expecting delim to be defined');
                var innerStx$290 = _$87.reduce(this.delim.token.inner, function (acc$291, term$292) {
                        if (term$292.hasPrototype(TermTree$178)) {
                            return acc$291.concat(term$292.destruct(breakDelim$289));
                        } else {
                            return acc$291.concat(term$292);
                        }
                    }, []);
                if (breakDelim$289) {
                    var openParen$293 = syntaxFromToken$164({
                            type: parser$88.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$294 = syntaxFromToken$164({
                            type: parser$88.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$293].concat(innerStx$290).concat(closeParen$294);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$295) {
                this.delim = d$295;
            }
        });
    var Id$196 = PrimaryExpression$182.extend({
            properties: ['id'],
            construct: function (id$296) {
                this.id = id$296;
            }
        });
    var NamedFun$197 = Expr$181.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$297, name$298, params$299, body$300) {
                this.keyword = keyword$297;
                this.name = name$298;
                this.params = params$299;
                this.body = body$300;
            }
        });
    var AnonFun$198 = Expr$181.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$301, params$302, body$303) {
                this.keyword = keyword$301;
                this.params = params$302;
                this.body = body$303;
            }
        });
    var LetMacro$199 = TermTree$178.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$304, body$305) {
                this.name = name$304;
                this.body = body$305;
            }
        });
    var Macro$200 = TermTree$178.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$306, body$307) {
                this.name = name$306;
                this.body = body$307;
            }
        });
    var Const$201 = Expr$181.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$308, call$309) {
                this.newterm = newterm$308;
                this.call = call$309;
            }
        });
    var Call$202 = Expr$181.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$310) {
                parser$88.assert(this.fun.hasPrototype(TermTree$178), 'expecting a term tree in destruct of call');
                var that$311 = this;
                this.delim = syntaxFromToken$164(_$87.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$87.reduce(this.args, function (acc$312, term$313) {
                    parser$88.assert(term$313 && term$313.hasPrototype(TermTree$178), 'expecting term trees in destruct of Call');
                    var dst$314 = acc$312.concat(term$313.destruct(breakDelim$310));
                    if (that$311.commas.length > 0) {
                        dst$314 = dst$314.concat(that$311.commas.shift());
                    }
                    return dst$314;
                }, []);
                return this.fun.destruct(breakDelim$310).concat(Delimiter$195.create(this.delim).destruct(breakDelim$310));
            },
            construct: function (funn$315, args$316, delim$317, commas$318) {
                parser$88.assert(Array.isArray(args$316), 'requires an array of arguments terms');
                this.fun = funn$315;
                this.args = args$316;
                this.delim = delim$317;
                this.commas = commas$318;
            }
        });
    var ObjDotGet$203 = Expr$181.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$319, dot$320, right$321) {
                this.left = left$319;
                this.dot = dot$320;
                this.right = right$321;
            }
        });
    var ObjGet$204 = Expr$181.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$322, right$323) {
                this.left = left$322;
                this.right = right$323;
            }
        });
    var VariableDeclaration$205 = TermTree$178.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$324, eqstx$325, init$326, comma$327) {
                this.ident = ident$324;
                this.eqstx = eqstx$325;
                this.init = init$326;
                this.comma = comma$327;
            }
        });
    var VariableStatement$206 = Statement$180.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$328) {
                return this.varkw.destruct(breakDelim$328).concat(_$87.reduce(this.decls, function (acc$329, decl$330) {
                    return acc$329.concat(decl$330.destruct(breakDelim$328));
                }, []));
            },
            construct: function (varkw$331, decls$332) {
                parser$88.assert(Array.isArray(decls$332), 'decls must be an array');
                this.varkw = varkw$331;
                this.decls = decls$332;
            }
        });
    var CatchClause$207 = TermTree$178.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$333, params$334, body$335) {
                this.catchkw = catchkw$333;
                this.params = params$334;
                this.body = body$335;
            }
        });
    var Empty$208 = TermTree$178.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$209(stx$336) {
        var staticOperators$337 = [
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
        return _$87.contains(staticOperators$337, stx$336.token.value);
    }
    function stxIsBinOp$210(stx$338) {
        var staticOperators$339 = [
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
        return _$87.contains(staticOperators$339, stx$338.token.value);
    }
    function enforestVarStatement$211(stx$340, env$341) {
        var decls$342 = [];
        var res$343 = enforest$212(stx$340, env$341);
        var result$344 = res$343.result;
        var rest$345 = res$343.rest;
        if (rest$345[0]) {
            var nextRes$346 = enforest$212(rest$345, env$341);
            if (nextRes$346.result.hasPrototype(Punc$194) && nextRes$346.result.punc.token.value === '=') {
                var initializerRes$347 = enforest$212(nextRes$346.rest, env$341);
                if (initializerRes$347.rest[0]) {
                    var restRes$348 = enforest$212(initializerRes$347.rest, env$341);
                    if (restRes$348.result.hasPrototype(Punc$194) && restRes$348.result.punc.token.value === ',') {
                        decls$342.push(VariableDeclaration$205.create(result$344.id, nextRes$346.result.punc, initializerRes$347.result, restRes$348.result.punc));
                        var subRes$349 = enforestVarStatement$211(restRes$348.rest, env$341);
                        decls$342 = decls$342.concat(subRes$349.result);
                        rest$345 = subRes$349.rest;
                    } else {
                        decls$342.push(VariableDeclaration$205.create(result$344.id, nextRes$346.result.punc, initializerRes$347.result));
                        rest$345 = initializerRes$347.rest;
                    }
                } else {
                    decls$342.push(VariableDeclaration$205.create(result$344.id, nextRes$346.result.punc, initializerRes$347.result));
                }
            } else if (nextRes$346.result.hasPrototype(Punc$194) && nextRes$346.result.punc.token.value === ',') {
                decls$342.push(VariableDeclaration$205.create(result$344.id, null, null, nextRes$346.result.punc));
                var subRes$349 = enforestVarStatement$211(nextRes$346.rest, env$341);
                decls$342 = decls$342.concat(subRes$349.result);
                rest$345 = subRes$349.rest;
            } else {
                if (result$344.hasPrototype(Id$196)) {
                    decls$342.push(VariableDeclaration$205.create(result$344.id));
                } else {
                    throwError$153('Expecting an identifier in variable declaration');
                }
            }
        } else {
            if (result$344.hasPrototype(Id$196)) {
                decls$342.push(VariableDeclaration$205.create(result$344.id));
            } else if (result$344.hasPrototype(BinOp$191) && result$344.op.token.value === 'in') {
                decls$342.push(VariableDeclaration$205.create(result$344.left.id, result$344.op, result$344.right));
            } else {
                throwError$153('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$342,
            rest: rest$345
        };
    }
    function enforest$212(toks$350, env$351) {
        env$351 = env$351 || new Map();
        parser$88.assert(toks$350.length > 0, 'enforest assumes there are tokens to work with');
        function step$352(head$353, rest$354) {
            var innerTokens$355;
            parser$88.assert(Array.isArray(rest$354), 'result must at least be an empty array');
            if (head$353.hasPrototype(TermTree$178)) {
                var emp$358 = head$353.emp;
                var emp$358 = head$353.emp;
                var keyword$361 = head$353.keyword;
                var delim$363 = head$353.delim;
                var emp$358 = head$353.emp;
                var punc$366 = head$353.punc;
                var keyword$361 = head$353.keyword;
                var emp$358 = head$353.emp;
                var emp$358 = head$353.emp;
                var emp$358 = head$353.emp;
                var delim$363 = head$353.delim;
                var delim$363 = head$353.delim;
                var keyword$361 = head$353.keyword;
                if (head$353.hasPrototype(Expr$181) && (rest$354[0] && rest$354[0].token.type === parser$88.Token.Delimiter && rest$354[0].token.value === '()')) {
                    var argRes$389, enforestedArgs$390 = [], commas$391 = [];
                    innerTokens$355 = rest$354[0].token.inner;
                    while (innerTokens$355.length > 0) {
                        argRes$389 = enforest$212(innerTokens$355, env$351);
                        enforestedArgs$390.push(argRes$389.result);
                        innerTokens$355 = argRes$389.rest;
                        if (innerTokens$355[0] && innerTokens$355[0].token.value === ',') {
                            commas$391.push(innerTokens$355[0]);
                            innerTokens$355 = innerTokens$355.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$392 = _$87.all(enforestedArgs$390, function (argTerm$393) {
                            return argTerm$393.hasPrototype(Expr$181);
                        });
                    if (innerTokens$355.length === 0 && argsAreExprs$392) {
                        return step$352(Call$202.create(head$353, enforestedArgs$390, rest$354[0], commas$391), rest$354.slice(1));
                    }
                } else if (head$353.hasPrototype(Expr$181) && (rest$354[0] && rest$354[0].token.value === '?')) {
                    var question$394 = rest$354[0];
                    var condRes$395 = enforest$212(rest$354.slice(1), env$351);
                    var truExpr$396 = condRes$395.result;
                    var right$397 = condRes$395.rest;
                    if (truExpr$396.hasPrototype(Expr$181) && right$397[0] && right$397[0].token.value === ':') {
                        var colon$398 = right$397[0];
                        var flsRes$399 = enforest$212(right$397.slice(1), env$351);
                        var flsExpr$400 = flsRes$399.result;
                        if (flsExpr$400.hasPrototype(Expr$181)) {
                            return step$352(ConditionalExpression$192.create(head$353, question$394, truExpr$396, colon$398, flsExpr$400), flsRes$399.rest);
                        }
                    }
                } else if (head$353.hasPrototype(Keyword$193) && (keyword$361.token.value === 'new' && rest$354[0])) {
                    var newCallRes$401 = enforest$212(rest$354, env$351);
                    if (newCallRes$401.result.hasPrototype(Call$202)) {
                        return step$352(Const$201.create(head$353, newCallRes$401.result), newCallRes$401.rest);
                    }
                } else if (head$353.hasPrototype(Delimiter$195) && delim$363.token.value === '()') {
                    innerTokens$355 = delim$363.token.inner;
                    if (innerTokens$355.length === 0) {
                        return step$352(ParenExpression$188.create(head$353), rest$354);
                    } else {
                        var innerTerm$402 = get_expression$213(innerTokens$355, env$351);
                        if (innerTerm$402.result && innerTerm$402.result.hasPrototype(Expr$181)) {
                            return step$352(ParenExpression$188.create(head$353), rest$354);
                        }
                    }
                } else if (head$353.hasPrototype(TermTree$178) && (rest$354[0] && rest$354[1] && stxIsBinOp$210(rest$354[0]))) {
                    var op$403 = rest$354[0];
                    var left$404 = head$353;
                    var bopRes$405 = enforest$212(rest$354.slice(1), env$351);
                    var right$397 = bopRes$405.result;
                    if (right$397.hasPrototype(Expr$181)) {
                        return step$352(BinOp$191.create(op$403, left$404, right$397), bopRes$405.rest);
                    }
                } else if (head$353.hasPrototype(Punc$194) && stxIsUnaryOp$209(punc$366)) {
                    var unopRes$406 = enforest$212(rest$354, env$351);
                    if (unopRes$406.result.hasPrototype(Expr$181)) {
                        return step$352(UnaryOp$189.create(punc$366, unopRes$406.result), unopRes$406.rest);
                    }
                } else if (head$353.hasPrototype(Keyword$193) && stxIsUnaryOp$209(keyword$361)) {
                    var unopRes$406 = enforest$212(rest$354, env$351);
                    if (unopRes$406.result.hasPrototype(Expr$181)) {
                        return step$352(UnaryOp$189.create(keyword$361, unopRes$406.result), unopRes$406.rest);
                    }
                } else if (head$353.hasPrototype(Expr$181) && (rest$354[0] && (rest$354[0].token.value === '++' || rest$354[0].token.value === '--'))) {
                    return step$352(PostfixOp$190.create(head$353, rest$354[0]), rest$354.slice(1));
                } else if (head$353.hasPrototype(Expr$181) && (rest$354[0] && rest$354[0].token.value === '[]')) {
                    var getRes$407 = enforest$212(rest$354[0].token.inner, env$351);
                    var resStx$408 = mkSyntax$165('[]', parser$88.Token.Delimiter, rest$354[0]);
                    resStx$408.token.inner = [getRes$407.result];
                    return step$352(ObjGet$204.create(head$353, Delimiter$195.create(resStx$408)), rest$354.slice(1));
                } else if (head$353.hasPrototype(Expr$181) && (rest$354[0] && rest$354[0].token.value === '.' && rest$354[1] && rest$354[1].token.type === parser$88.Token.Identifier)) {
                    return step$352(ObjDotGet$203.create(head$353, rest$354[0], rest$354[1]), rest$354.slice(2));
                } else if (head$353.hasPrototype(Delimiter$195) && delim$363.token.value === '[]') {
                    return step$352(ArrayLiteral$187.create(head$353), rest$354);
                } else if (head$353.hasPrototype(Delimiter$195) && head$353.delim.token.value === '{}') {
                    return step$352(Block$186.create(head$353), rest$354);
                } else if (head$353.hasPrototype(Keyword$193) && (keyword$361.token.value === 'var' && rest$354[0])) {
                    var vsRes$409 = enforestVarStatement$211(rest$354, env$351);
                    if (vsRes$409) {
                        return step$352(VariableStatement$206.create(head$353, vsRes$409.result), vsRes$409.rest);
                    }
                }
            } else {
                parser$88.assert(head$353 && head$353.token, 'assuming head is a syntax object');
                if ((head$353.token.type === parser$88.Token.Identifier || head$353.token.type === parser$88.Token.Keyword || head$353.token.type === parser$88.Token.Punctuator) && env$351.has(head$353.token.value) && env$351.get(head$353.token.value).name === resolve$168(head$353)) {
                    var transformer$410 = env$351.get(head$353.token.value).fn;
                    var rt$411 = transformer$410([head$353].concat(rest$354), env$351);
                    if (!Array.isArray(rt$411.result)) {
                        throwError$153('Macro transformer must return a result array, not: ' + rt$411.result);
                    }
                    if (rt$411.result.length > 0) {
                        return step$352(rt$411.result[0], rt$411.result.slice(1).concat(rt$411.rest));
                    } else {
                        return step$352(Empty$208.create(), rt$411.rest);
                    }
                } else if (head$353.token.value === 'let' && rest$354[0] && rest$354[0].token.type === parser$88.Token.Identifier && rest$354[1] && rest$354[1].token.value === '=' && rest$354[2] && rest$354[2].token.value === 'macro' && rest$354[3] && rest$354[3].token.value === '{}') {
                    return step$352(LetMacro$199.create(rest$354[0], rest$354[3].token.inner), rest$354.slice(4));
                } else if (head$353.token.type === parser$88.Token.Identifier && head$353.token.value === 'macro' && rest$354[0] && (rest$354[0].token.type === parser$88.Token.Identifier || rest$354[0].token.type === parser$88.Token.Keyword || rest$354[0].token.type === parser$88.Token.Punctuator) && rest$354[1] && rest$354[1].token.type === parser$88.Token.Delimiter && rest$354[1].token.value === '{}') {
                    return step$352(Macro$200.create(rest$354[0], rest$354[1].token.inner), rest$354.slice(2));
                } else if (head$353.token.type === parser$88.Token.Keyword && head$353.token.value === 'function' && rest$354[0] && rest$354[0].token.type === parser$88.Token.Identifier && rest$354[1] && rest$354[1].token.type === parser$88.Token.Delimiter && rest$354[1].token.value === '()' && rest$354[2] && rest$354[2].token.type === parser$88.Token.Delimiter && rest$354[2].token.value === '{}') {
                    return step$352(NamedFun$197.create(head$353, rest$354[0], rest$354[1], rest$354[2]), rest$354.slice(3));
                } else if (head$353.token.type === parser$88.Token.Keyword && head$353.token.value === 'function' && rest$354[0] && rest$354[0].token.type === parser$88.Token.Delimiter && rest$354[0].token.value === '()' && rest$354[1] && rest$354[1].token.type === parser$88.Token.Delimiter && rest$354[1].token.value === '{}') {
                    return step$352(AnonFun$198.create(head$353, rest$354[0], rest$354[1]), rest$354.slice(2));
                } else if (head$353.token.type === parser$88.Token.Keyword && head$353.token.value === 'catch' && rest$354[0] && rest$354[0].token.type === parser$88.Token.Delimiter && rest$354[0].token.value === '()' && rest$354[1] && rest$354[1].token.type === parser$88.Token.Delimiter && rest$354[1].token.value === '{}') {
                    return step$352(CatchClause$207.create(head$353, rest$354[0], rest$354[1]), rest$354.slice(2));
                } else if (head$353.token.type === parser$88.Token.Keyword && head$353.token.value === 'this') {
                    return step$352(ThisExpression$183.create(head$353), rest$354);
                } else if (head$353.token.type === parser$88.Token.NumericLiteral || head$353.token.type === parser$88.Token.StringLiteral || head$353.token.type === parser$88.Token.BooleanLiteral || head$353.token.type === parser$88.Token.RegexLiteral || head$353.token.type === parser$88.Token.NullLiteral) {
                    return step$352(Lit$184.create(head$353), rest$354);
                } else if (head$353.token.type === parser$88.Token.Identifier) {
                    return step$352(Id$196.create(head$353), rest$354);
                } else if (head$353.token.type === parser$88.Token.Punctuator) {
                    return step$352(Punc$194.create(head$353), rest$354);
                } else if (head$353.token.type === parser$88.Token.Keyword && head$353.token.value === 'with') {
                    throwError$153('with is not supported in sweet.js');
                } else if (head$353.token.type === parser$88.Token.Keyword) {
                    return step$352(Keyword$193.create(head$353), rest$354);
                } else if (head$353.token.type === parser$88.Token.Delimiter) {
                    return step$352(Delimiter$195.create(head$353), rest$354);
                } else if (head$353.token.type === parser$88.Token.EOF) {
                    parser$88.assert(rest$354.length === 0, 'nothing should be after an EOF');
                    return step$352(EOF$179.create(head$353), []);
                } else {
                    parser$88.assert(false, 'not implemented');
                }
            }
            return {
                result: head$353,
                rest: rest$354
            };
        }
        return step$352(toks$350[0], toks$350.slice(1));
    }
    function get_expression$213(stx$412, env$413) {
        var res$414 = enforest$212(stx$412, env$413);
        if (!res$414.result.hasPrototype(Expr$181)) {
            return {
                result: null,
                rest: stx$412
            };
        }
        return res$414;
    }
    function applyMarkToPatternEnv$214(newMark$415, env$416) {
        function dfs$417(match$418) {
            if (match$418.level === 0) {
                match$418.match = _$87.map(match$418.match, function (stx$419) {
                    return stx$419.mark(newMark$415);
                });
            } else {
                _$87.each(match$418.match, function (match$420) {
                    dfs$417(match$420);
                });
            }
        }
        _$87.keys(env$416).forEach(function (key$421) {
            dfs$417(env$416[key$421]);
        });
    }
    function loadMacroDef$215(mac$422, env$423, defscope$424, templateMap$425) {
        var body$426 = mac$422.body;
        if (!(body$426[0] && body$426[0].token.type === parser$88.Token.Keyword && body$426[0].token.value === 'function')) {
            throwError$153('Primitive macro form must contain a function for the macro body');
        }
        var stub$427 = parser$88.read('()');
        stub$427[0].token.inner = body$426;
        var expanded$428 = flatten$221(expand$219(stub$427, env$423, defscope$424, templateMap$425));
        var bodyCode$429 = codegen$91.generate(parser$88.parse(expanded$428));
        var macroFn$430 = scopedEval$156(bodyCode$429, {
                makeValue: syn$89.makeValue,
                makeRegex: syn$89.makeRegex,
                makeIdent: syn$89.makeIdent,
                makeKeyword: syn$89.makeKeyword,
                makePunc: syn$89.makePunc,
                makeDelim: syn$89.makeDelim,
                unwrapSyntax: syn$89.unwrapSyntax,
                fresh: fresh$174,
                _: _$87,
                parser: parser$88,
                patternModule: patternModule$94,
                getTemplate: function (id$431) {
                    return templateMap$425.get(id$431);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$214,
                mergeMatches: function (newMatch$432, oldMatch$433) {
                    newMatch$432.patternEnv = _$87.extend({}, oldMatch$433.patternEnv, newMatch$432.patternEnv);
                    return newMatch$432;
                }
            });
        return macroFn$430;
    }
    function expandToTermTree$216(stx$434, env$435, defscope$436, templateMap$437) {
        parser$88.assert(env$435, 'environment map is required');
        if (stx$434.length === 0) {
            return {
                terms: [],
                env: env$435
            };
        }
        parser$88.assert(stx$434[0].token, 'expecting a syntax object');
        var f$438 = enforest$212(stx$434, env$435);
        var head$439 = f$438.result;
        var rest$440 = f$438.rest;
        if (head$439.hasPrototype(Macro$200)) {
            var macroDefinition$442 = loadMacroDef$215(head$439, env$435, defscope$436, templateMap$437);
            addToDefinitionCtx$217([head$439.name], defscope$436, false);
            env$435.set(head$439.name.token.value, {
                name: resolve$168(head$439.name),
                fn: macroDefinition$442
            });
            return expandToTermTree$216(rest$440, env$435, defscope$436, templateMap$437);
        }
        if (head$439.hasPrototype(LetMacro$199)) {
            var macroDefinition$442 = loadMacroDef$215(head$439, env$435, defscope$436, templateMap$437);
            addToDefinitionCtx$217([head$439.name], defscope$436, false);
            env$435.set(resolve$168(head$439.name), macroDefinition$442);
            return expandToTermTree$216(rest$440, env$435, defscope$436, templateMap$437);
        }
        if (head$439.hasPrototype(NamedFun$197)) {
            addToDefinitionCtx$217([head$439.name], defscope$436, true);
        }
        if (head$439.hasPrototype(Id$196) && head$439.id.token.value === '#quoteSyntax' && rest$440[0] && rest$440[0].token.value === '{}') {
            var tempId$443 = fresh$174();
            templateMap$437.set(tempId$443, rest$440[0].token.inner);
            return expandToTermTree$216([
                syn$89.makeIdent('getTemplate', head$439.id),
                syn$89.makeDelim('()', [syn$89.makeValue(tempId$443, head$439.id)])
            ].concat(rest$440.slice(1)), env$435, defscope$436, templateMap$437);
        }
        if (head$439.hasPrototype(VariableStatement$206)) {
            addToDefinitionCtx$217(_$87.map(head$439.decls, function (decl$444) {
                return decl$444.ident;
            }), defscope$436, true);
        }
        if (head$439.hasPrototype(Block$186) && head$439.body.hasPrototype(Delimiter$195)) {
            head$439.body.delim.token.inner.forEach(function (term$445) {
                if (term$445.hasPrototype(VariableStatement$206)) {
                    addToDefinitionCtx$217(_$87.map(term$445.decls, function (decl$446) {
                        return decl$446.ident;
                    }), defscope$436, true);
                }
            });
        }
        if (head$439.hasPrototype(Delimiter$195)) {
            head$439.delim.token.inner.forEach(function (term$447) {
                if (term$447.hasPrototype(VariableStatement$206)) {
                    addToDefinitionCtx$217(_$87.map(term$447.decls, function (decl$448) {
                        return decl$448.ident;
                    }), defscope$436, true);
                }
            });
        }
        var trees$441 = expandToTermTree$216(rest$440, env$435, defscope$436, templateMap$437);
        return {
            terms: [head$439].concat(trees$441.terms),
            env: trees$441.env
        };
    }
    function addToDefinitionCtx$217(idents$449, defscope$450, skipRep$451) {
        parser$88.assert(idents$449 && idents$449.length > 0, 'expecting some variable identifiers');
        skipRep$451 = skipRep$451 || false;
        _$87.each(idents$449, function (id$452) {
            var skip$453 = false;
            if (skipRep$451) {
                var declRepeat$454 = _$87.find(defscope$450, function (def$455) {
                        return def$455.id.token.value === id$452.token.value && arraysEqual$169(marksof$167(def$455.id.context), marksof$167(id$452.context));
                    });
                skip$453 = typeof declRepeat$454 !== 'undefined';
            }
            if (!skip$453) {
                var name$456 = fresh$174();
                defscope$450.push({
                    id: id$452,
                    name: name$456
                });
            }
        });
    }
    function expandTermTreeToFinal$218(term$457, env$458, defscope$459, templateMap$460) {
        parser$88.assert(env$458, 'environment map is required');
        if (term$457.hasPrototype(ArrayLiteral$187)) {
            term$457.array.delim.token.inner = expand$219(term$457.array.delim.token.inner, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(Block$186)) {
            term$457.body.delim.token.inner = expand$219(term$457.body.delim.token.inner, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(ParenExpression$188)) {
            term$457.expr.delim.token.inner = expand$219(term$457.expr.delim.token.inner, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(Call$202)) {
            term$457.fun = expandTermTreeToFinal$218(term$457.fun, env$458, defscope$459, templateMap$460);
            term$457.args = _$87.map(term$457.args, function (arg$461) {
                return expandTermTreeToFinal$218(arg$461, env$458, defscope$459, templateMap$460);
            });
            return term$457;
        } else if (term$457.hasPrototype(UnaryOp$189)) {
            term$457.expr = expandTermTreeToFinal$218(term$457.expr, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(BinOp$191)) {
            term$457.left = expandTermTreeToFinal$218(term$457.left, env$458, defscope$459, templateMap$460);
            term$457.right = expandTermTreeToFinal$218(term$457.right, env$458, defscope$459);
            return term$457;
        } else if (term$457.hasPrototype(ObjDotGet$203)) {
            term$457.left = expandTermTreeToFinal$218(term$457.left, env$458, defscope$459, templateMap$460);
            term$457.right = expandTermTreeToFinal$218(term$457.right, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(VariableDeclaration$205)) {
            if (term$457.init) {
                term$457.init = expandTermTreeToFinal$218(term$457.init, env$458, defscope$459, templateMap$460);
            }
            return term$457;
        } else if (term$457.hasPrototype(VariableStatement$206)) {
            term$457.decls = _$87.map(term$457.decls, function (decl$462) {
                return expandTermTreeToFinal$218(decl$462, env$458, defscope$459, templateMap$460);
            });
            return term$457;
        } else if (term$457.hasPrototype(Delimiter$195)) {
            term$457.delim.token.inner = expand$219(term$457.delim.token.inner, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(NamedFun$197) || term$457.hasPrototype(AnonFun$198) || term$457.hasPrototype(CatchClause$207)) {
            var newDef$463 = [];
            var params$464 = term$457.params.addDefCtx(newDef$463);
            var bodies$465 = term$457.body.addDefCtx(newDef$463);
            var paramNames$466 = _$87.map(getParamIdentifiers$177(params$464), function (param$474) {
                    var freshName$475 = fresh$174();
                    return {
                        freshName: freshName$475,
                        originalParam: param$474,
                        renamedParam: param$474.rename(param$474, freshName$475)
                    };
                });
            var stxBody$467 = bodies$465;
            var renamedBody$468 = _$87.reduce(paramNames$466, function (accBody$476, p$477) {
                    return accBody$476.rename(p$477.originalParam, p$477.freshName);
                }, stxBody$467);
            var bodyTerms$469 = expand$219([renamedBody$468], env$458, newDef$463, templateMap$460);
            parser$88.assert(bodyTerms$469.length === 1 && bodyTerms$469[0].body, 'expecting a block in the bodyTerms');
            var flattenedBody$470 = flatten$221(bodyTerms$469);
            var renamedParams$471 = _$87.map(paramNames$466, function (p$478) {
                    return p$478.renamedParam;
                });
            var flatArgs$472 = wrapDelim$176(joinSyntax$175(renamedParams$471, ','), term$457.params);
            var expandedArgs$473 = expand$219([flatArgs$472], env$458, newDef$463, templateMap$460);
            parser$88.assert(expandedArgs$473.length === 1, 'should only get back one result');
            term$457.params = expandedArgs$473[0];
            term$457.body = _$87.map(flattenedBody$470, function (stx$479) {
                return _$87.reduce(newDef$463, function (acc$480, def$481) {
                    return acc$480.rename(def$481.id, def$481.name);
                }, stx$479);
            });
            return term$457;
        }
        return term$457;
    }
    function expand$219(stx$482, env$483, defscope$484, templateMap$485) {
        env$483 = env$483 || new Map();
        templateMap$485 = templateMap$485 || new Map();
        var trees$486 = expandToTermTree$216(stx$482, env$483, defscope$484, templateMap$485);
        return _$87.map(trees$486.terms, function (term$487) {
            return expandTermTreeToFinal$218(term$487, trees$486.env, defscope$484, templateMap$485);
        });
    }
    function expandTopLevel$220(stx$488) {
        var funn$489 = syntaxFromToken$164({
                value: 'function',
                type: parser$88.Token.Keyword
            });
        var params$490 = syntaxFromToken$164({
                value: '()',
                type: parser$88.Token.Delimiter,
                inner: []
            });
        var body$491 = syntaxFromToken$164({
                value: '{}',
                type: parser$88.Token.Delimiter,
                inner: stx$488
            });
        var res$492 = expand$219([
                funn$489,
                params$490,
                body$491
            ]);
        return _$87.map(res$492[0].body.slice(1, res$492[0].body.length - 1), function (stx$493) {
            return stx$493;
        });
    }
    function flatten$221(terms$494) {
        return _$87.reduce(terms$494, function (acc$495, term$496) {
            return acc$495.concat(term$496.destruct(true));
        }, []);
    }
    exports$86.enforest = enforest$212;
    exports$86.expand = expandTopLevel$220;
    exports$86.resolve = resolve$168;
    exports$86.flatten = flatten$221;
    exports$86.get_expression = get_expression$213;
    exports$86.Expr = Expr$181;
    exports$86.VariableStatement = VariableStatement$206;
    exports$86.tokensToSyntax = syn$89.tokensToSyntax;
}));