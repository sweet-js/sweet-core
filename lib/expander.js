(function (root$93, factory$94) {
    if (typeof exports === 'object') {
        factory$94(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
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
    exports$95._test = {};
    Object.prototype.create = function () {
        var o$232 = Object.create(this);
        if (typeof o$232.construct === 'function') {
            o$232.construct.apply(o$232, arguments);
        }
        return o$232;
    };
    Object.prototype.extend = function (properties$233) {
        var result$234 = Object.create(this);
        for (var prop$235 in properties$233) {
            if (properties$233.hasOwnProperty(prop$235)) {
                result$234[prop$235] = properties$233[prop$235];
            }
        }
        return result$234;
    };
    Object.prototype.hasPrototype = function (proto$236) {
        function F$237() {
        }
        F$237.prototype = proto$236;
        return this instanceof F$237;
    };
    function throwError$162(msg$238) {
        throw new Error(msg$238);
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
    function remdup$173(mark$239, mlist$240) {
        if (mark$239 === _$96.first(mlist$240)) {
            return _$96.rest(mlist$240, 1);
        }
        return [mark$239].concat(mlist$240);
    }
    function marksof$174(ctx$241, stopName$242, originalName$243) {
        var mark$244, submarks$245;
        if (isMark$169(ctx$241)) {
            mark$244 = ctx$241.mark;
            submarks$245 = marksof$174(ctx$241.context, stopName$242, originalName$243);
            return remdup$173(mark$244, submarks$245);
        }
        if (isDef$168(ctx$241)) {
            return marksof$174(ctx$241.context, stopName$242, originalName$243);
        }
        if (isRename$170(ctx$241)) {
            if (stopName$242 === originalName$243 + '$' + ctx$241.name) {
                return [];
            }
            return marksof$174(ctx$241.context, stopName$242, originalName$243);
        }
        return [];
    }
    function resolve$175(stx$246) {
        return resolveCtx$179(stx$246.token.value, stx$246.context, [], []);
    }
    function arraysEqual$176(a$247, b$248) {
        if (a$247.length !== b$248.length) {
            return false;
        }
        for (var i$249 = 0; i$249 < a$247.length; i$249++) {
            if (a$247[i$249] !== b$248[i$249]) {
                return false;
            }
        }
        return true;
    }
    function renames$177(defctx$250, oldctx$251, originalName$252) {
        var acc$253 = oldctx$251;
        for (var i$254 = 0; i$254 < defctx$250.length; i$254++) {
            if (defctx$250[i$254].id.token.value === originalName$252) {
                acc$253 = Rename$164(defctx$250[i$254].id, defctx$250[i$254].name, acc$253, defctx$250);
            }
        }
        return acc$253;
    }
    function unionEl$178(arr$255, el$256) {
        if (arr$255.indexOf(el$256) === -1) {
            var res$257 = arr$255.slice(0);
            res$257.push(el$256);
            return res$257;
        }
        return arr$255;
    }
    function resolveCtx$179(originalName$258, ctx$259, stop_spine$260, stop_branch$261) {
        if (isMark$169(ctx$259)) {
            return resolveCtx$179(originalName$258, ctx$259.context, stop_spine$260, stop_branch$261);
        }
        if (isDef$168(ctx$259)) {
            if (stop_spine$260.indexOf(ctx$259.defctx) !== -1) {
                return resolveCtx$179(originalName$258, ctx$259.context, stop_spine$260, stop_branch$261);
            } else {
                return resolveCtx$179(originalName$258, renames$177(ctx$259.defctx, ctx$259.context, originalName$258), stop_spine$260, unionEl$178(stop_branch$261, ctx$259.defctx));
            }
        }
        if (isRename$170(ctx$259)) {
            if (originalName$258 === ctx$259.id.token.value) {
                var idName$262 = resolveCtx$179(ctx$259.id.token.value, ctx$259.id.context, stop_branch$261, stop_branch$261);
                var subName$263 = resolveCtx$179(originalName$258, ctx$259.context, unionEl$178(stop_spine$260, ctx$259.def), stop_branch$261);
                if (idName$262 === subName$263) {
                    var idMarks$264 = marksof$174(ctx$259.id.context, originalName$258 + '$' + ctx$259.name, originalName$258);
                    var subMarks$265 = marksof$174(ctx$259.context, originalName$258 + '$' + ctx$259.name, originalName$258);
                    if (arraysEqual$176(idMarks$264, subMarks$265)) {
                        return originalName$258 + '$' + ctx$259.name;
                    }
                }
            }
            return resolveCtx$179(originalName$258, ctx$259.context, unionEl$178(stop_spine$260, ctx$259.def), stop_branch$261);
        }
        return originalName$258;
    }
    var nextFresh$180 = 0;
    function fresh$181() {
        return nextFresh$180++;
    }
    ;
    function joinSyntax$182(tojoin$266, punc$267) {
        if (tojoin$266.length === 0) {
            return [];
        }
        if (punc$267 === ' ') {
            return tojoin$266;
        }
        return _$96.reduce(_$96.rest(tojoin$266, 1), function (acc$268, join$269) {
            return acc$268.concat(mkSyntax$172(punc$267, parser$97.Token.Punctuator, join$269), join$269);
        }, [_$96.first(tojoin$266)]);
    }
    function wrapDelim$183(towrap$270, delimSyntax$271) {
        parser$97.assert(delimSyntax$271.token.type === parser$97.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$171({
            type: parser$97.Token.Delimiter,
            value: delimSyntax$271.token.value,
            inner: towrap$270,
            range: delimSyntax$271.token.range,
            startLineNumber: delimSyntax$271.token.startLineNumber,
            lineStart: delimSyntax$271.token.lineStart
        }, delimSyntax$271.context);
    }
    function getParamIdentifiers$184(argSyntax$272) {
        parser$97.assert(argSyntax$272.token.type === parser$97.Token.Delimiter, 'expecting delimiter for function params');
        return _$96.filter(argSyntax$272.token.inner, function (stx$273) {
            return stx$273.token.value !== ',';
        });
    }
    var TermTree$185 = {
            destruct: function () {
                return _$96.reduce(this.properties, _$96.bind(function (acc$274, prop$275) {
                    if (this[prop$275] && this[prop$275].hasPrototype(TermTree$185)) {
                        return acc$274.concat(this[prop$275].destruct());
                    } else if (this[prop$275] && this[prop$275].token && this[prop$275].token.inner) {
                        this[prop$275].token.inner = _$96.reduce(this[prop$275].token.inner, function (acc$276, t$277) {
                            if (t$277.hasPrototype(TermTree$185)) {
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
    var EOF$186 = TermTree$185.extend({
            properties: ['eof'],
            construct: function (e$278) {
                this.eof = e$278;
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
            construct: function (that$279) {
                this.this = that$279;
            }
        });
    var Lit$191 = PrimaryExpression$189.extend({
            properties: ['lit'],
            construct: function (l$280) {
                this.lit = l$280;
            }
        });
    exports$95._test.PropertyAssignment = PropertyAssignment$192;
    var PropertyAssignment$192 = TermTree$185.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$281, assignment$282) {
                this.propName = propName$281;
                this.assignment = assignment$282;
            }
        });
    var Block$193 = PrimaryExpression$189.extend({
            properties: ['body'],
            construct: function (body$283) {
                this.body = body$283;
            }
        });
    var ArrayLiteral$194 = PrimaryExpression$189.extend({
            properties: ['array'],
            construct: function (ar$284) {
                this.array = ar$284;
            }
        });
    var ParenExpression$195 = PrimaryExpression$189.extend({
            properties: ['expr'],
            construct: function (expr$285) {
                this.expr = expr$285;
            }
        });
    var UnaryOp$196 = Expr$188.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$286, expr$287) {
                this.op = op$286;
                this.expr = expr$287;
            }
        });
    var PostfixOp$197 = Expr$188.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$288, op$289) {
                this.expr = expr$288;
                this.op = op$289;
            }
        });
    var BinOp$198 = Expr$188.extend({
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
    var ConditionalExpression$199 = Expr$188.extend({
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
    var Keyword$200 = TermTree$185.extend({
            properties: ['keyword'],
            construct: function (k$298) {
                this.keyword = k$298;
            }
        });
    var Punc$201 = TermTree$185.extend({
            properties: ['punc'],
            construct: function (p$299) {
                this.punc = p$299;
            }
        });
    var Delimiter$202 = TermTree$185.extend({
            properties: ['delim'],
            construct: function (d$300) {
                this.delim = d$300;
            }
        });
    var Id$203 = PrimaryExpression$189.extend({
            properties: ['id'],
            construct: function (id$301) {
                this.id = id$301;
            }
        });
    var NamedFun$204 = Expr$188.extend({
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
    var AnonFun$205 = Expr$188.extend({
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
    var LetMacro$206 = TermTree$185.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$309, body$310) {
                this.name = name$309;
                this.body = body$310;
            }
        });
    var Macro$207 = TermTree$185.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$311, body$312) {
                this.name = name$311;
                this.body = body$312;
            }
        });
    var AnonMacro$208 = TermTree$185.extend({
            properties: ['body'],
            construct: function (body$313) {
                this.body = body$313;
            }
        });
    var Const$209 = Expr$188.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$314, call$315) {
                this.newterm = newterm$314;
                this.call = call$315;
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
                var that$316 = this;
                this.delim = syntaxFromToken$171(_$96.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$96.reduce(this.args, function (acc$317, term$318) {
                    parser$97.assert(term$318 && term$318.hasPrototype(TermTree$185), 'expecting term trees in destruct of Call');
                    var dst$319 = acc$317.concat(term$318.destruct());
                    if (that$316.commas.length > 0) {
                        dst$319 = dst$319.concat(that$316.commas.shift());
                    }
                    return dst$319;
                }, []);
                return this.fun.destruct().concat(Delimiter$202.create(this.delim).destruct());
            },
            construct: function (funn$320, args$321, delim$322, commas$323) {
                parser$97.assert(Array.isArray(args$321), 'requires an array of arguments terms');
                this.fun = funn$320;
                this.args = args$321;
                this.delim = delim$322;
                this.commas = commas$323;
            }
        });
    var ObjDotGet$211 = Expr$188.extend({
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
    var ObjGet$212 = Expr$188.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$327, right$328) {
                this.left = left$327;
                this.right = right$328;
            }
        });
    var VariableDeclaration$213 = TermTree$185.extend({
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
    var VariableStatement$214 = Statement$187.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$96.reduce(this.decls, function (acc$333, decl$334) {
                    return acc$333.concat(decl$334.destruct());
                }, []));
            },
            construct: function (varkw$335, decls$336) {
                parser$97.assert(Array.isArray(decls$336), 'decls must be an array');
                this.varkw = varkw$335;
                this.decls = decls$336;
            }
        });
    var CatchClause$215 = TermTree$185.extend({
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
    var Module$216 = TermTree$185.extend({
            properties: ['body'],
            construct: function (body$340) {
                this.body = body$340;
            }
        });
    var Empty$217 = TermTree$185.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$218(stx$341) {
        var staticOperators$342 = [
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
        return _$96.contains(staticOperators$342, stx$341.token.value);
    }
    function stxIsBinOp$219(stx$343) {
        var staticOperators$344 = [
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
        return _$96.contains(staticOperators$344, stx$343.token.value);
    }
    function enforestVarStatement$220(stx$345, env$346) {
        var decls$347 = [];
        var res$348 = enforest$222(stx$345, env$346);
        var result$349 = res$348.result;
        var rest$350 = res$348.rest;
        if (rest$350[0]) {
            var nextRes$351 = enforest$222(rest$350, env$346);
            if (nextRes$351.result.hasPrototype(Punc$201) && nextRes$351.result.punc.token.value === '=') {
                var initializerRes$352 = enforest$222(nextRes$351.rest, env$346);
                if (initializerRes$352.rest[0]) {
                    var restRes$353 = enforest$222(initializerRes$352.rest, env$346);
                    if (restRes$353.result.hasPrototype(Punc$201) && restRes$353.result.punc.token.value === ',') {
                        decls$347.push(VariableDeclaration$213.create(result$349.id, nextRes$351.result.punc, initializerRes$352.result, restRes$353.result.punc));
                        var subRes$354 = enforestVarStatement$220(restRes$353.rest, env$346);
                        decls$347 = decls$347.concat(subRes$354.result);
                        rest$350 = subRes$354.rest;
                    } else {
                        decls$347.push(VariableDeclaration$213.create(result$349.id, nextRes$351.result.punc, initializerRes$352.result));
                        rest$350 = initializerRes$352.rest;
                    }
                } else {
                    decls$347.push(VariableDeclaration$213.create(result$349.id, nextRes$351.result.punc, initializerRes$352.result));
                }
            } else if (nextRes$351.result.hasPrototype(Punc$201) && nextRes$351.result.punc.token.value === ',') {
                decls$347.push(VariableDeclaration$213.create(result$349.id, null, null, nextRes$351.result.punc));
                var subRes$354 = enforestVarStatement$220(nextRes$351.rest, env$346);
                decls$347 = decls$347.concat(subRes$354.result);
                rest$350 = subRes$354.rest;
            } else {
                if (result$349.hasPrototype(Id$203)) {
                    decls$347.push(VariableDeclaration$213.create(result$349.id));
                } else {
                    throwError$162('Expecting an identifier in variable declaration');
                }
            }
        } else {
            if (result$349.hasPrototype(Id$203)) {
                decls$347.push(VariableDeclaration$213.create(result$349.id));
            } else if (result$349.hasPrototype(BinOp$198) && result$349.op.token.value === 'in') {
                decls$347.push(VariableDeclaration$213.create(result$349.left.id, result$349.op, result$349.right));
            } else {
                throwError$162('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$347,
            rest: rest$350
        };
    }
    function adjustLineContext$221(stx$355, original$356) {
        var last$357 = stx$355[0] && typeof stx$355[0].token.range == 'undefined' ? original$356 : stx$355[0];
        return _$96.map(stx$355, function (stx$358) {
            if (typeof stx$358.token.range == 'undefined') {
                stx$358.token.range = last$357.token.range;
            }
            if (stx$358.token.type === parser$97.Token.Delimiter) {
                stx$358.token.sm_startLineNumber = original$356.token.lineNumber;
                stx$358.token.sm_endLineNumber = original$356.token.lineNumber;
                stx$358.token.sm_startLineStart = original$356.token.lineStart;
                stx$358.token.sm_endLineStart = original$356.token.lineStart;
                if (stx$358.token.inner.length > 0) {
                    stx$358.token.inner = adjustLineContext$221(stx$358.token.inner, original$356);
                }
                last$357 = stx$358;
                return stx$358;
            }
            stx$358.token.sm_lineNumber = original$356.token.lineNumber;
            stx$358.token.sm_lineStart = original$356.token.lineStart;
            last$357 = stx$358;
            return stx$358;
        });
    }
    function enforest$222(toks$359, env$360) {
        env$360 = env$360 || new Map();
        parser$97.assert(toks$359.length > 0, 'enforest assumes there are tokens to work with');
        function step$361(head$362, rest$363) {
            var innerTokens$364;
            parser$97.assert(Array.isArray(rest$363), 'result must at least be an empty array');
            if (head$362.hasPrototype(TermTree$185)) {
                var emp$367 = head$362.emp;
                var emp$367 = head$362.emp;
                var keyword$370 = head$362.keyword;
                var delim$372 = head$362.delim;
                var emp$367 = head$362.emp;
                var punc$375 = head$362.punc;
                var keyword$370 = head$362.keyword;
                var emp$367 = head$362.emp;
                var emp$367 = head$362.emp;
                var emp$367 = head$362.emp;
                var delim$372 = head$362.delim;
                var delim$372 = head$362.delim;
                var keyword$370 = head$362.keyword;
                var keyword$370 = head$362.keyword;
                if (head$362.hasPrototype(Expr$188) && (rest$363[0] && rest$363[0].token.type === parser$97.Token.Delimiter && rest$363[0].token.value === '()')) {
                    var argRes$400, enforestedArgs$401 = [], commas$402 = [];
                    rest$363[0].expose();
                    innerTokens$364 = rest$363[0].token.inner;
                    while (innerTokens$364.length > 0) {
                        argRes$400 = enforest$222(innerTokens$364, env$360);
                        enforestedArgs$401.push(argRes$400.result);
                        innerTokens$364 = argRes$400.rest;
                        if (innerTokens$364[0] && innerTokens$364[0].token.value === ',') {
                            commas$402.push(innerTokens$364[0]);
                            innerTokens$364 = innerTokens$364.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$403 = _$96.all(enforestedArgs$401, function (argTerm$404) {
                            return argTerm$404.hasPrototype(Expr$188);
                        });
                    if (innerTokens$364.length === 0 && argsAreExprs$403) {
                        return step$361(Call$210.create(head$362, enforestedArgs$401, rest$363[0], commas$402), rest$363.slice(1));
                    }
                } else if (head$362.hasPrototype(Expr$188) && (rest$363[0] && rest$363[0].token.value === '?')) {
                    var question$405 = rest$363[0];
                    var condRes$406 = enforest$222(rest$363.slice(1), env$360);
                    var truExpr$407 = condRes$406.result;
                    var right$408 = condRes$406.rest;
                    if (truExpr$407.hasPrototype(Expr$188) && right$408[0] && right$408[0].token.value === ':') {
                        var colon$409 = right$408[0];
                        var flsRes$410 = enforest$222(right$408.slice(1), env$360);
                        var flsExpr$411 = flsRes$410.result;
                        if (flsExpr$411.hasPrototype(Expr$188)) {
                            return step$361(ConditionalExpression$199.create(head$362, question$405, truExpr$407, colon$409, flsExpr$411), flsRes$410.rest);
                        }
                    }
                } else if (head$362.hasPrototype(Keyword$200) && (keyword$370.token.value === 'new' && rest$363[0])) {
                    var newCallRes$412 = enforest$222(rest$363, env$360);
                    if (newCallRes$412.result.hasPrototype(Call$210)) {
                        return step$361(Const$209.create(head$362, newCallRes$412.result), newCallRes$412.rest);
                    }
                } else if (head$362.hasPrototype(Delimiter$202) && delim$372.token.value === '()') {
                    innerTokens$364 = delim$372.token.inner;
                    if (innerTokens$364.length === 0) {
                        return step$361(ParenExpression$195.create(head$362), rest$363);
                    } else {
                        var innerTerm$413 = get_expression$223(innerTokens$364, env$360);
                        if (innerTerm$413.result && innerTerm$413.result.hasPrototype(Expr$188)) {
                            return step$361(ParenExpression$195.create(head$362), rest$363);
                        }
                    }
                } else if (head$362.hasPrototype(TermTree$185) && (rest$363[0] && rest$363[1] && stxIsBinOp$219(rest$363[0]))) {
                    var op$414 = rest$363[0];
                    var left$415 = head$362;
                    var bopRes$416 = enforest$222(rest$363.slice(1), env$360);
                    var right$408 = bopRes$416.result;
                    if (right$408.hasPrototype(Expr$188)) {
                        return step$361(BinOp$198.create(op$414, left$415, right$408), bopRes$416.rest);
                    }
                } else if (head$362.hasPrototype(Punc$201) && stxIsUnaryOp$218(punc$375)) {
                    var unopRes$417 = enforest$222(rest$363, env$360);
                    if (unopRes$417.result.hasPrototype(Expr$188)) {
                        return step$361(UnaryOp$196.create(punc$375, unopRes$417.result), unopRes$417.rest);
                    }
                } else if (head$362.hasPrototype(Keyword$200) && stxIsUnaryOp$218(keyword$370)) {
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
                    // CommonJS
                    // AMD. Register as an anonymous module.
                    // used to export "private" methods for unit testing
                    // some convenience monkey patching
                    // todo: add more message information
                    // (CSyntax) -> [...Num]
                    // (Syntax) -> String
                    // fun () -> Num
                    // ([...CSyntax], Str) -> [...CSyntax])
                    // wraps the array of syntax objects in the delimiters given by the second argument
                    // ([...CSyntax], CSyntax) -> [...CSyntax]
                    // (CSyntax) -> [...CSyntax]
                    // A TermTree is the core data structure for the macro expansion process.
                    // It acts as a semi-structured representation of the syntax.
                    // Go back to the syntax object representation. Uses the
                    // ordered list of properties that each subclass sets to
                    // determine the order in which multiple children are
                    // destructed.
                    // () -> [...Syntax]
                    // add all commas except for the last one
                    // an ugly little hack to keep the same syntax objects
                    // (with associated line numbers etc.) for all the commas
                    // separating the arguments
                    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
                    // assumes stx starts at the identifier. ie:
                    // var x = ...
                    //     ^
                    // x = ...
                    // x = y + z, ...
                    // x = y ...
                    // x = y EOF
                    // x ,...;
                    // x EOF
                    // enforest the tokens, returns an object with the `result` TermTree and
                    // the uninterpreted `rest` of the syntax
                    // function call
                    // Call
                    // record the comma for later
                    // but dump it for the next loop turn
                    // either there are no more tokens or
                    // they aren't a comma, either way we
                    // are done with the loop
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    // Conditional ( x ? true : false)
                    // Constructor
                    // ParenExpr
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    // if the tokens inside the paren aren't an expression
                    // we just leave it as a delimiter
                    // BinOp
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    // UnaryOp (via punctuation)
                    // UnaryOp (via keyword)
                    var unopRes$417 = enforest$222(rest$363, env$360);
                    if (unopRes$417.result.hasPrototype(Expr$188)) {
                        return step$361(UnaryOp$196.create(keyword$370, unopRes$417.result), unopRes$417.rest);
                    }
                } else if (head$362.hasPrototype(Expr$188) && (rest$363[0] && (rest$363[0].token.value === '++' || rest$363[0].token.value === '--'))) {
                    return step$361(PostfixOp$197.create(head$362, rest$363[0]), rest$363.slice(1));
                } else if (head$362.hasPrototype(Expr$188) && (rest$363[0] && rest$363[0].token.value === '[]')) {
                    return step$361(ObjGet$212.create(head$362, Delimiter$202.create(rest$363[0].expose())), rest$363.slice(1));
                } else if (head$362.hasPrototype(Expr$188) && (rest$363[0] && rest$363[0].token.value === '.' && rest$363[1] && rest$363[1].token.type === parser$97.Token.Identifier)) {
                    return step$361(ObjDotGet$211.create(head$362, rest$363[0], rest$363[1]), rest$363.slice(2));
                } else if (head$362.hasPrototype(Delimiter$202) && delim$372.token.value === '[]') {
                    // ArrayLiteral
                    return step$361(ArrayLiteral$194.create(head$362), rest$363);
                } else if (head$362.hasPrototype(Delimiter$202) && head$362.delim.token.value === '{}') {
                    // Block
                    return step$361(Block$193.create(head$362), rest$363);
                } else if (head$362.hasPrototype(Keyword$200) && (keyword$370.token.value === 'let' && (rest$363[0] && rest$363[0].token.type === parser$97.Token.Identifier || rest$363[0] && rest$363[0].token.type === parser$97.Token.Keyword) && rest$363[1] && rest$363[1].token.value === '=' && rest$363[2] && rest$363[2].token.value === 'macro')) {
                    var mac$418 = enforest$222(rest$363.slice(2), env$360);
                    if (!mac$418.result.hasPrototype(AnonMacro$208)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding');
                    }
                    return step$361(LetMacro$206.create(rest$363[0], mac$418.result.body), mac$418.rest);
                } else if (head$362.hasPrototype(Keyword$200) && (keyword$370.token.value === 'var' && rest$363[0])) {
                    var vsRes$419 = enforestVarStatement$220(rest$363, env$360);
                    if (vsRes$419) {
                        return step$361(VariableStatement$214.create(head$362, vsRes$419.result), vsRes$419.rest);
                    }
                }
            } else {
                parser$97.assert(head$362 && head$362.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$362.token.type === parser$97.Token.Identifier || head$362.token.type === parser$97.Token.Keyword) && env$360.has(resolve$175(head$362))) {
                    // pull the macro transformer out the environment
                    var transformer$420 = env$360.get(resolve$175(head$362)).fn;
                    // apply the transformer
                    var rt$421 = transformer$420([head$362].concat(rest$363), env$360);
                    if (!Array.isArray(rt$421.result)) {
                        throwError$162('Macro transformer must return a result array, not: ' + rt$421.result);
                    }
                    if (rt$421.result.length > 0) {
                        var adjustedResult$422 = adjustLineContext$221(rt$421.result, head$362);
                        return step$361(adjustedResult$422[0], adjustedResult$422.slice(1).concat(rt$421.rest));
                    } else {
                        return step$361(Empty$217.create(), rt$421.rest);    // anon macro definition
                    }
                } else if (head$362.token.type === parser$97.Token.Identifier && head$362.token.value === 'macro' && rest$363[0] && rest$363[0].token.value === '{}') {
                    return step$361(AnonMacro$208.create(rest$363[0].expose().token.inner), rest$363.slice(1));
                } else if (head$362.token.type === parser$97.Token.Identifier && head$362.token.value === 'macro' && rest$363[0] && (rest$363[0].token.type === parser$97.Token.Identifier || rest$363[0].token.type === parser$97.Token.Keyword) && rest$363[1] && rest$363[1].token.type === parser$97.Token.Delimiter && rest$363[1].token.value === '{}') {
                    return step$361(Macro$207.create(rest$363[0], rest$363[1].expose().token.inner), rest$363.slice(2));
                } else if (head$362.token.value === 'module' && rest$363[0] && rest$363[0].token.value === '{}') {
                    return step$361(Module$216.create(rest$363[0]), rest$363.slice(1));
                } else if (head$362.token.type === parser$97.Token.Keyword && head$362.token.value === 'function' && rest$363[0] && rest$363[0].token.type === parser$97.Token.Identifier && rest$363[1] && rest$363[1].token.type === parser$97.Token.Delimiter && rest$363[1].token.value === '()' && rest$363[2] && rest$363[2].token.type === parser$97.Token.Delimiter && rest$363[2].token.value === '{}') {
                    rest$363[1].token.inner = rest$363[1].expose().token.inner;
                    rest$363[2].token.inner = rest$363[2].expose().token.inner;
                    return step$361(NamedFun$204.create(head$362, rest$363[0], rest$363[1], rest$363[2]), rest$363.slice(3));
                } else if (head$362.token.type === parser$97.Token.Keyword && head$362.token.value === 'function' && rest$363[0] && rest$363[0].token.type === parser$97.Token.Delimiter && rest$363[0].token.value === '()' && rest$363[1] && rest$363[1].token.type === parser$97.Token.Delimiter && rest$363[1].token.value === '{}') {
                    rest$363[0].token.inner = rest$363[0].expose().token.inner;
                    rest$363[1].token.inner = rest$363[1].expose().token.inner;
                    return step$361(AnonFun$205.create(head$362, rest$363[0], rest$363[1]), rest$363.slice(2));
                } else if (head$362.token.type === parser$97.Token.Keyword && head$362.token.value === 'catch' && rest$363[0] && rest$363[0].token.type === parser$97.Token.Delimiter && rest$363[0].token.value === '()' && rest$363[1] && rest$363[1].token.type === parser$97.Token.Delimiter && rest$363[1].token.value === '{}') {
                    rest$363[0].token.inner = rest$363[0].expose().token.inner;
                    rest$363[1].token.inner = rest$363[1].expose().token.inner;
                    return step$361(CatchClause$215.create(head$362, rest$363[0], rest$363[1]), rest$363.slice(2));
                } else if (head$362.token.type === parser$97.Token.Keyword && head$362.token.value === 'this') {
                    return step$361(ThisExpression$190.create(head$362), rest$363);
                } else if (head$362.token.type === parser$97.Token.NumericLiteral || head$362.token.type === parser$97.Token.StringLiteral || head$362.token.type === parser$97.Token.BooleanLiteral || head$362.token.type === parser$97.Token.RegexLiteral || head$362.token.type === parser$97.Token.NullLiteral) {
                    return step$361(Lit$191.create(head$362), rest$363);
                } else if (head$362.token.type === parser$97.Token.Identifier) {
                    return step$361(Id$203.create(head$362), rest$363);
                } else if (head$362.token.type === parser$97.Token.Punctuator) {
                    return step$361(Punc$201.create(head$362), rest$363);
                } else if (head$362.token.type === parser$97.Token.Keyword && head$362.token.value === 'with') {
                    throwError$162('with is not supported in sweet.js');
                } else if (head$362.token.type === parser$97.Token.Keyword) {
                    return step$361(Keyword$200.create(head$362), rest$363);
                } else if (head$362.token.type === parser$97.Token.Delimiter) {
                    return step$361(Delimiter$202.create(head$362.expose()), rest$363);
                } else if (head$362.token.type === parser$97.Token.EOF) {
                    parser$97.assert(rest$363.length === 0, 'nothing should be after an EOF');
                    return step$361(EOF$186.create(head$362), []);
                } else {
                    // todo: are we missing cases?
                    parser$97.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$362,
                rest: rest$363
            };
        }
        return step$361(toks$359[0], toks$359.slice(1));
    }
    function get_expression$223(stx$423, env$424) {
        var res$425 = enforest$222(stx$423, env$424);
        if (!res$425.result.hasPrototype(Expr$188)) {
            return {
                result: null,
                rest: stx$423
            };
        }
        return res$425;
    }
    function applyMarkToPatternEnv$224(newMark$426, env$427) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$428(match$429) {
            if (match$429.level === 0) {
                // replace the match property with the marked syntax
                match$429.match = _$96.map(match$429.match, function (stx$430) {
                    return stx$430.mark(newMark$426);
                });
            } else {
                _$96.each(match$429.match, function (match$431) {
                    dfs$428(match$431);
                });
            }
        }
        _$96.keys(env$427).forEach(function (key$432) {
            dfs$428(env$427[key$432]);
        });
    }
    function loadMacroDef$225(mac$433, env$434, defscope$435, templateMap$436) {
        var body$437 = mac$433.body;
        // raw function primitive form
        if (!(body$437[0] && body$437[0].token.type === parser$97.Token.Keyword && body$437[0].token.value === 'function')) {
            throwError$162('Primitive macro form must contain a function for the macro body');
        }
        var stub$438 = parser$97.read('()')[0];
        stub$438[0].token.inner = body$437;
        var expanded$439 = expand$229(stub$438, env$434, defscope$435, templateMap$436);
        expanded$439 = expanded$439[0].destruct().concat(expanded$439[1].eof);
        var flattend$440 = flatten$231(expanded$439);
        var bodyCode$441 = codegen$103.generate(parser$97.parse(flattend$440));
        var macroFn$442 = scopedEval$163(bodyCode$441, {
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
                getTemplate: function (id$443) {
                    return templateMap$436.get(id$443);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$224,
                mergeMatches: function (newMatch$444, oldMatch$445) {
                    newMatch$444.patternEnv = _$96.extend({}, oldMatch$445.patternEnv, newMatch$444.patternEnv);
                    return newMatch$444;
                }
            });
        return macroFn$442;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$226(stx$446, env$447, defscope$448, templateMap$449) {
        parser$97.assert(env$447, 'environment map is required');
        // short circuit when syntax array is empty
        if (stx$446.length === 0) {
            return {
                terms: [],
                env: env$447
            };
        }
        parser$97.assert(stx$446[0].token, 'expecting a syntax object');
        var f$450 = enforest$222(stx$446, env$447);
        // head :: TermTree
        var head$451 = f$450.result;
        // rest :: [Syntax]
        var rest$452 = f$450.rest;
        if (head$451.hasPrototype(Macro$207)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$454 = loadMacroDef$225(head$451, env$447, defscope$448, templateMap$449);
            addToDefinitionCtx$227([head$451.name], defscope$448, false);
            env$447.set(resolve$175(head$451.name), { fn: macroDefinition$454 });
            return expandToTermTree$226(rest$452, env$447, defscope$448, templateMap$449);
        }
        if (head$451.hasPrototype(LetMacro$206)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$454 = loadMacroDef$225(head$451, env$447, defscope$448, templateMap$449);
            var freshName$455 = fresh$181();
            var renamedName$456 = head$451.name.rename(head$451.name, freshName$455);
            rest$452 = _$96.map(rest$452, function (stx$457) {
                return stx$457.rename(head$451.name, freshName$455);
            });
            head$451.name = renamedName$456;
            env$447.set(resolve$175(head$451.name), { fn: macroDefinition$454 });
            return expandToTermTree$226(rest$452, env$447, defscope$448, templateMap$449);
        }
        if (head$451.hasPrototype(NamedFun$204)) {
            addToDefinitionCtx$227([head$451.name], defscope$448, true);
        }
        if (head$451.hasPrototype(Id$203) && head$451.id.token.value === '#quoteSyntax' && rest$452[0] && rest$452[0].token.value === '{}') {
            var tempId$458 = fresh$181();
            templateMap$449.set(tempId$458, rest$452[0].token.inner);
            return expandToTermTree$226([
                syn$98.makeIdent('getTemplate', head$451.id),
                syn$98.makeDelim('()', [syn$98.makeValue(tempId$458, head$451.id)], head$451.id)
            ].concat(rest$452.slice(1)), env$447, defscope$448, templateMap$449);
        }
        if (head$451.hasPrototype(VariableStatement$214)) {
            addToDefinitionCtx$227(_$96.map(head$451.decls, function (decl$459) {
                return decl$459.ident;
            }), defscope$448, true);
        }
        if (head$451.hasPrototype(Block$193) && head$451.body.hasPrototype(Delimiter$202)) {
            head$451.body.delim.token.inner.forEach(function (term$460) {
                if (term$460.hasPrototype(VariableStatement$214)) {
                    addToDefinitionCtx$227(_$96.map(term$460.decls, function (decl$461) {
                        return decl$461.ident;
                    }), defscope$448, true);
                }
            });
        }
        if (head$451.hasPrototype(Delimiter$202)) {
            head$451.delim.token.inner.forEach(function (term$462) {
                if (term$462.hasPrototype(VariableStatement$214)) {
                    addToDefinitionCtx$227(_$96.map(term$462.decls, function (decl$463) {
                        return decl$463.ident;
                    }), defscope$448, true);
                }
            });
        }
        var trees$453 = expandToTermTree$226(rest$452, env$447, defscope$448, templateMap$449);
        return {
            terms: [head$451].concat(trees$453.terms),
            env: trees$453.env
        };
    }
    function addToDefinitionCtx$227(idents$464, defscope$465, skipRep$466) {
        parser$97.assert(idents$464 && idents$464.length > 0, 'expecting some variable identifiers');
        skipRep$466 = skipRep$466 || false;
        _$96.each(idents$464, function (id$467) {
            var skip$468 = false;
            if (skipRep$466) {
                var declRepeat$469 = _$96.find(defscope$465, function (def$470) {
                        return def$470.id.token.value === id$467.token.value && arraysEqual$176(marksof$174(def$470.id.context), marksof$174(id$467.context));
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
                var name$471 = fresh$181();
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
    function expandTermTreeToFinal$228(term$472, env$473, defscope$474, templateMap$475) {
        parser$97.assert(env$473, 'environment map is required');
        if (term$472.hasPrototype(ArrayLiteral$194)) {
            term$472.array.delim.token.inner = expand$229(term$472.array.delim.token.inner, env$473, defscope$474, templateMap$475);
            return term$472;
        } else if (term$472.hasPrototype(Block$193)) {
            term$472.body.delim.token.inner = expand$229(term$472.body.delim.token.inner, env$473, defscope$474, templateMap$475);
            return term$472;
        } else if (term$472.hasPrototype(ParenExpression$195)) {
            term$472.expr.delim.token.inner = expand$229(term$472.expr.delim.token.inner, env$473, defscope$474, templateMap$475);
            return term$472;
        } else if (term$472.hasPrototype(Call$210)) {
            term$472.fun = expandTermTreeToFinal$228(term$472.fun, env$473, defscope$474, templateMap$475);
            term$472.args = _$96.map(term$472.args, function (arg$476) {
                return expandTermTreeToFinal$228(arg$476, env$473, defscope$474, templateMap$475);
            });
            return term$472;
        } else if (term$472.hasPrototype(UnaryOp$196)) {
            term$472.expr = expandTermTreeToFinal$228(term$472.expr, env$473, defscope$474, templateMap$475);
            return term$472;
        } else if (term$472.hasPrototype(BinOp$198)) {
            term$472.left = expandTermTreeToFinal$228(term$472.left, env$473, defscope$474, templateMap$475);
            term$472.right = expandTermTreeToFinal$228(term$472.right, env$473, defscope$474);
            return term$472;
        } else if (term$472.hasPrototype(ObjGet$212)) {
            term$472.right.delim.token.inner = expand$229(term$472.right.delim.token.inner, env$473, defscope$474, templateMap$475);
            return term$472;
        } else if (term$472.hasPrototype(ObjDotGet$211)) {
            term$472.left = expandTermTreeToFinal$228(term$472.left, env$473, defscope$474, templateMap$475);
            term$472.right = expandTermTreeToFinal$228(term$472.right, env$473, defscope$474, templateMap$475);
            return term$472;
        } else if (term$472.hasPrototype(VariableDeclaration$213)) {
            if (term$472.init) {
                term$472.init = expandTermTreeToFinal$228(term$472.init, env$473, defscope$474, templateMap$475);
            }
            return term$472;
        } else if (term$472.hasPrototype(VariableStatement$214)) {
            term$472.decls = _$96.map(term$472.decls, function (decl$477) {
                return expandTermTreeToFinal$228(decl$477, env$473, defscope$474, templateMap$475);
            });
            return term$472;
        } else if (term$472.hasPrototype(Delimiter$202)) {
            // expand inside the delimiter and then continue on
            term$472.delim.token.inner = expand$229(term$472.delim.token.inner, env$473, defscope$474, templateMap$475);
            return term$472;
        } else if (term$472.hasPrototype(NamedFun$204) || term$472.hasPrototype(AnonFun$205) || term$472.hasPrototype(CatchClause$215) || term$472.hasPrototype(Module$216)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$478 = [];
            if (term$472.params) {
                var params$487 = term$472.params.addDefCtx(newDef$478);
            } else {
                var params$487 = syn$98.makeDelim('()', [], null);
            }
            var bodies$479 = term$472.body.addDefCtx(newDef$478);
            var paramNames$480 = _$96.map(getParamIdentifiers$184(params$487), function (param$488) {
                    var freshName$489 = fresh$181();
                    return {
                        freshName: freshName$489,
                        originalParam: param$488,
                        renamedParam: param$488.rename(param$488, freshName$489)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$481 = _$96.reduce(paramNames$480, function (accBody$490, p$491) {
                    return accBody$490.rename(p$491.originalParam, p$491.freshName);
                }, bodies$479);
            renamedBody$481 = renamedBody$481.expose();
            var bodyTerms$482 = expand$229([renamedBody$481], env$473, newDef$478, templateMap$475);
            parser$97.assert(bodyTerms$482.length === 1 && bodyTerms$482[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$483 = _$96.map(paramNames$480, function (p$492) {
                    return p$492.renamedParam;
                });
            var flatArgs$484 = syn$98.makeDelim('()', joinSyntax$182(renamedParams$483, ','), term$472.params);
            var expandedArgs$485 = expand$229([flatArgs$484], env$473, newDef$478, templateMap$475);
            parser$97.assert(expandedArgs$485.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            term$472.params = expandedArgs$485[0];
            var flattenedBody$486 = bodyTerms$482[0].destruct();
            flattenedBody$486 = _$96.reduce(newDef$478, function (acc$493, def$494) {
                return acc$493.rename(def$494.id, def$494.name);
            }, flattenedBody$486[0]);
            term$472.body = flattenedBody$486;
            // and continue expand the rest
            return term$472;
        }
        // the term is fine as is
        return term$472;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$229(stx$495, env$496, defscope$497, templateMap$498) {
        env$496 = env$496 || new Map();
        templateMap$498 = templateMap$498 || new Map();
        var trees$499 = expandToTermTree$226(stx$495, env$496, defscope$497, templateMap$498);
        return _$96.map(trees$499.terms, function (term$500) {
            return expandTermTreeToFinal$228(term$500, trees$499.env, defscope$497, templateMap$498);
        });
    }
    function expandTopLevel$230(stx$501, builtinSource$502) {
        if (builtinSource$502) {
            var builtinRead$504 = parser$97.read(builtinSource$502)[0];
            builtinRead$504 = [
                syn$98.makeIdent('module', null),
                syn$98.makeDelim('{}', builtinRead$504, null)
            ];
            var builtinRes$505 = expand$229(builtinRead$504);
        }
        var res$503 = expand$229([
                syn$98.makeIdent('module', null),
                syn$98.makeDelim('{}', stx$501)
            ]);
        return flatten$231(res$503[0].body.token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$231(stx$506) {
        return _$96.reduce(stx$506, function (acc$507, stx$508) {
            if (stx$508.token.type === parser$97.Token.Delimiter) {
                var exposed$509 = stx$508.expose();
                var openParen$510 = syntaxFromToken$171({
                        type: parser$97.Token.Punctuator,
                        value: stx$508.token.value[0],
                        range: stx$508.token.startRange,
                        lineNumber: stx$508.token.startLineNumber,
                        sm_lineNumber: stx$508.token.sm_startLineNumber ? stx$508.token.sm_startLineNumber : stx$508.token.startLineNumber,
                        lineStart: stx$508.token.startLineStart,
                        sm_lineStart: stx$508.token.sm_startLineStart ? stx$508.token.sm_startLineStart : stx$508.token.startLineStart
                    }, exposed$509.context);
                var closeParen$511 = syntaxFromToken$171({
                        type: parser$97.Token.Punctuator,
                        value: stx$508.token.value[1],
                        range: stx$508.token.endRange,
                        lineNumber: stx$508.token.endLineNumber,
                        sm_lineNumber: stx$508.token.sm_endLineNumber ? stx$508.token.sm_endLineNumber : stx$508.token.endLineNumber,
                        lineStart: stx$508.token.endLineStart,
                        sm_lineStart: stx$508.token.sm_endLineStart ? stx$508.token.sm_endLineStart : stx$508.token.endLineStart
                    }, exposed$509.context);
                return acc$507.concat(openParen$510).concat(flatten$231(exposed$509.token.inner)).concat(closeParen$511);
            }
            stx$508.token.sm_lineNumber = stx$508.token.sm_lineNumber ? stx$508.token.sm_lineNumber : stx$508.token.lineNumber;
            stx$508.token.sm_lineStart = stx$508.token.sm_lineStart ? stx$508.token.sm_lineStart : stx$508.token.lineStart;
            return acc$507.concat(stx$508);
        }, []);
    }
    exports$95.enforest = enforest$222;
    exports$95.expand = expandTopLevel$230;
    exports$95.resolve = resolve$175;
    exports$95.get_expression = get_expression$223;
    exports$95.Expr = Expr$188;
    exports$95.VariableStatement = VariableStatement$214;
    exports$95.tokensToSyntax = syn$98.tokensToSyntax;
    exports$95.syntaxToTokens = syn$98.syntaxToTokens;
}));