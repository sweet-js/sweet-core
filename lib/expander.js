(function (root$186, factory$187) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$187(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$187);
    }
}(this, function (exports$188, _$189, parser$190, syn$191, es6$192, se$193, patternModule$194, gen$195) {
    'use strict';
    var codegen$196 = gen$195 || escodegen;
    // used to export "private" methods for unit testing
    exports$188._test = {};
    // some convenience monkey patching
    Object.prototype.create = function () {
        var o$325 = Object.create(this);
        if (typeof o$325.construct === 'function') {
            o$325.construct.apply(o$325, arguments);
        }
        return o$325;
    };
    Object.prototype.extend = function (properties$326) {
        var result$327 = Object.create(this);
        for (var prop$328 in properties$326) {
            if (properties$326.hasOwnProperty(prop$328)) {
                result$327[prop$328] = properties$326[prop$328];
            }
        }
        return result$327;
    };
    Object.prototype.hasPrototype = function (proto$329) {
        function F$330() {
        }
        F$330.prototype = proto$329;
        return this instanceof F$330;
    };
    // todo: add more message information
    function throwError$255(msg$331) {
        throw new Error(msg$331);
    }
    var scopedEval$256 = se$193.scopedEval;
    var Rename$257 = syn$191.Rename;
    var Mark$258 = syn$191.Mark;
    var Var$259 = syn$191.Var;
    var Def$260 = syn$191.Def;
    var isDef$261 = syn$191.isDef;
    var isMark$262 = syn$191.isMark;
    var isRename$263 = syn$191.isRename;
    var syntaxFromToken$264 = syn$191.syntaxFromToken;
    var mkSyntax$265 = syn$191.mkSyntax;
    function remdup$266(mark$332, mlist$333) {
        if (mark$332 === _$189.first(mlist$333)) {
            return _$189.rest(mlist$333, 1);
        }
        return [mark$332].concat(mlist$333);
    }
    // (CSyntax) -> [...Num]
    function marksof$267(ctx$334, stopName$335, originalName$336) {
        var mark$337, submarks$338;
        if (isMark$262(ctx$334)) {
            mark$337 = ctx$334.mark;
            submarks$338 = marksof$267(ctx$334.context, stopName$335, originalName$336);
            return remdup$266(mark$337, submarks$338);
        }
        if (isDef$261(ctx$334)) {
            return marksof$267(ctx$334.context, stopName$335, originalName$336);
        }
        if (isRename$263(ctx$334)) {
            if (stopName$335 === originalName$336 + '$' + ctx$334.name) {
                return [];
            }
            return marksof$267(ctx$334.context, stopName$335, originalName$336);
        }
        return [];
    }
    function resolve$268(stx$339) {
        return resolveCtx$272(stx$339.token.value, stx$339.context, [], []);
    }
    function arraysEqual$269(a$340, b$341) {
        if (a$340.length !== b$341.length) {
            return false;
        }
        for (var i$342 = 0; i$342 < a$340.length; i$342++) {
            if (a$340[i$342] !== b$341[i$342]) {
                return false;
            }
        }
        return true;
    }
    function renames$270(defctx$343, oldctx$344, originalName$345) {
        var acc$346 = oldctx$344;
        for (var i$347 = 0; i$347 < defctx$343.length; i$347++) {
            if (defctx$343[i$347].id.token.value === originalName$345) {
                acc$346 = Rename$257(defctx$343[i$347].id, defctx$343[i$347].name, acc$346, defctx$343);
            }
        }
        return acc$346;
    }
    function unionEl$271(arr$348, el$349) {
        if (arr$348.indexOf(el$349) === -1) {
            var res$350 = arr$348.slice(0);
            res$350.push(el$349);
            return res$350;
        }
        return arr$348;
    }
    function resolveCtx$272(originalName$351, ctx$352, stop_spine$353, stop_branch$354) {
        if (isMark$262(ctx$352)) {
            return resolveCtx$272(originalName$351, ctx$352.context, stop_spine$353, stop_branch$354);
        }
        if (isDef$261(ctx$352)) {
            if (stop_spine$353.indexOf(ctx$352.defctx) !== -1) {
                return resolveCtx$272(originalName$351, ctx$352.context, stop_spine$353, stop_branch$354);
            } else {
                return resolveCtx$272(originalName$351, renames$270(ctx$352.defctx, ctx$352.context, originalName$351), stop_spine$353, unionEl$271(stop_branch$354, ctx$352.defctx));
            }
        }
        if (isRename$263(ctx$352)) {
            if (originalName$351 === ctx$352.id.token.value) {
                var idName$355 = resolveCtx$272(ctx$352.id.token.value, ctx$352.id.context, stop_branch$354, stop_branch$354);
                var subName$356 = resolveCtx$272(originalName$351, ctx$352.context, unionEl$271(stop_spine$353, ctx$352.def), stop_branch$354);
                if (idName$355 === subName$356) {
                    var idMarks$357 = marksof$267(ctx$352.id.context, originalName$351 + '$' + ctx$352.name, originalName$351);
                    var subMarks$358 = marksof$267(ctx$352.context, originalName$351 + '$' + ctx$352.name, originalName$351);
                    if (arraysEqual$269(idMarks$357, subMarks$358)) {
                        return originalName$351 + '$' + ctx$352.name;
                    }
                }
            }
            return resolveCtx$272(originalName$351, ctx$352.context, unionEl$271(stop_spine$353, ctx$352.def), stop_branch$354);
        }
        return originalName$351;
    }
    var nextFresh$273 = 0;
    // fun () -> Num
    function fresh$274() {
        return nextFresh$273++;
    }
    ;
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$275(tojoin$359, punc$360) {
        if (tojoin$359.length === 0) {
            return [];
        }
        if (punc$360 === ' ') {
            return tojoin$359;
        }
        return _$189.reduce(_$189.rest(tojoin$359, 1), function (acc$361, join$362) {
            return acc$361.concat(mkSyntax$265(punc$360, parser$190.Token.Punctuator, join$362), join$362);
        }, [_$189.first(tojoin$359)]);
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$276(towrap$363, delimSyntax$364) {
        parser$190.assert(delimSyntax$364.token.type === parser$190.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$264({
            type: parser$190.Token.Delimiter,
            value: delimSyntax$364.token.value,
            inner: towrap$363,
            range: delimSyntax$364.token.range,
            startLineNumber: delimSyntax$364.token.startLineNumber,
            lineStart: delimSyntax$364.token.lineStart
        }, delimSyntax$364.context);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$277(argSyntax$365) {
        parser$190.assert(argSyntax$365.token.type === parser$190.Token.Delimiter, 'expecting delimiter for function params');
        return _$189.filter(argSyntax$365.token.inner, function (stx$366) {
            return stx$366.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$278 = {
            destruct: function () {
                return _$189.reduce(this.properties, _$189.bind(function (acc$367, prop$368) {
                    if (this[prop$368] && this[prop$368].hasPrototype(TermTree$278)) {
                        return acc$367.concat(this[prop$368].destruct());
                    } else if (this[prop$368] && this[prop$368].token && this[prop$368].token.inner) {
                        this[prop$368].token.inner = _$189.reduce(this[prop$368].token.inner, function (acc$369, t$370) {
                            if (t$370.hasPrototype(TermTree$278)) {
                                return acc$369.concat(t$370.destruct());
                            }
                            return acc$369.concat(t$370);
                        }, []);
                        return acc$367.concat(this[prop$368]);
                    } else if (this[prop$368]) {
                        return acc$367.concat(this[prop$368]);
                    } else {
                        return acc$367;
                    }
                }, this), []);
            }
        };
    var EOF$279 = TermTree$278.extend({
            properties: ['eof'],
            construct: function (e$371) {
                this.eof = e$371;
            }
        });
    var Statement$280 = TermTree$278.extend({
            construct: function () {
            }
        });
    var Expr$281 = TermTree$278.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$282 = Expr$281.extend({
            construct: function () {
            }
        });
    var ThisExpression$283 = PrimaryExpression$282.extend({
            properties: ['this'],
            construct: function (that$372) {
                this.this = that$372;
            }
        });
    var Lit$284 = PrimaryExpression$282.extend({
            properties: ['lit'],
            construct: function (l$373) {
                this.lit = l$373;
            }
        });
    exports$188._test.PropertyAssignment = PropertyAssignment$285;
    var PropertyAssignment$285 = TermTree$278.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$374, assignment$375) {
                this.propName = propName$374;
                this.assignment = assignment$375;
            }
        });
    var Block$286 = PrimaryExpression$282.extend({
            properties: ['body'],
            construct: function (body$376) {
                this.body = body$376;
            }
        });
    var ArrayLiteral$287 = PrimaryExpression$282.extend({
            properties: ['array'],
            construct: function (ar$377) {
                this.array = ar$377;
            }
        });
    var ParenExpression$288 = PrimaryExpression$282.extend({
            properties: ['expr'],
            construct: function (expr$378) {
                this.expr = expr$378;
            }
        });
    var UnaryOp$289 = Expr$281.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$379, expr$380) {
                this.op = op$379;
                this.expr = expr$380;
            }
        });
    var PostfixOp$290 = Expr$281.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$381, op$382) {
                this.expr = expr$381;
                this.op = op$382;
            }
        });
    var BinOp$291 = Expr$281.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$383, left$384, right$385) {
                this.op = op$383;
                this.left = left$384;
                this.right = right$385;
            }
        });
    var ConditionalExpression$292 = Expr$281.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$386, question$387, tru$388, colon$389, fls$390) {
                this.cond = cond$386;
                this.question = question$387;
                this.tru = tru$388;
                this.colon = colon$389;
                this.fls = fls$390;
            }
        });
    var Keyword$293 = TermTree$278.extend({
            properties: ['keyword'],
            construct: function (k$391) {
                this.keyword = k$391;
            }
        });
    var Punc$294 = TermTree$278.extend({
            properties: ['punc'],
            construct: function (p$392) {
                this.punc = p$392;
            }
        });
    var Delimiter$295 = TermTree$278.extend({
            properties: ['delim'],
            construct: function (d$393) {
                this.delim = d$393;
            }
        });
    var Id$296 = PrimaryExpression$282.extend({
            properties: ['id'],
            construct: function (id$394) {
                this.id = id$394;
            }
        });
    var NamedFun$297 = Expr$281.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$395, name$396, params$397, body$398) {
                this.keyword = keyword$395;
                this.name = name$396;
                this.params = params$397;
                this.body = body$398;
            }
        });
    var AnonFun$298 = Expr$281.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$399, params$400, body$401) {
                this.keyword = keyword$399;
                this.params = params$400;
                this.body = body$401;
            }
        });
    var LetMacro$299 = TermTree$278.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$402, body$403) {
                this.name = name$402;
                this.body = body$403;
            }
        });
    var Macro$300 = TermTree$278.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$404, body$405) {
                this.name = name$404;
                this.body = body$405;
            }
        });
    var AnonMacro$301 = TermTree$278.extend({
            properties: ['body'],
            construct: function (body$406) {
                this.body = body$406;
            }
        });
    var Const$302 = Expr$281.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$407, call$408) {
                this.newterm = newterm$407;
                this.call = call$408;
            }
        });
    var Call$303 = Expr$281.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$190.assert(this.fun.hasPrototype(TermTree$278), 'expecting a term tree in destruct of call');
                var that$409 = this;
                this.delim = syntaxFromToken$264(_$189.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$189.reduce(this.args, function (acc$410, term$411) {
                    parser$190.assert(term$411 && term$411.hasPrototype(TermTree$278), 'expecting term trees in destruct of Call');
                    var dst$412 = acc$410.concat(term$411.destruct());
                    // add all commas except for the last one
                    if (that$409.commas.length > 0) {
                        dst$412 = dst$412.concat(that$409.commas.shift());
                    }
                    return dst$412;
                }, []);
                return this.fun.destruct().concat(Delimiter$295.create(this.delim).destruct());
            },
            construct: function (funn$413, args$414, delim$415, commas$416) {
                parser$190.assert(Array.isArray(args$414), 'requires an array of arguments terms');
                this.fun = funn$413;
                this.args = args$414;
                this.delim = delim$415;
                this.commas = commas$416;
            }
        });
    var ObjDotGet$304 = Expr$281.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$417, dot$418, right$419) {
                this.left = left$417;
                this.dot = dot$418;
                this.right = right$419;
            }
        });
    var ObjGet$305 = Expr$281.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$420, right$421) {
                this.left = left$420;
                this.right = right$421;
            }
        });
    var VariableDeclaration$306 = TermTree$278.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$422, eqstx$423, init$424, comma$425) {
                this.ident = ident$422;
                this.eqstx = eqstx$423;
                this.init = init$424;
                this.comma = comma$425;
            }
        });
    var VariableStatement$307 = Statement$280.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$189.reduce(this.decls, function (acc$426, decl$427) {
                    return acc$426.concat(decl$427.destruct());
                }, []));
            },
            construct: function (varkw$428, decls$429) {
                parser$190.assert(Array.isArray(decls$429), 'decls must be an array');
                this.varkw = varkw$428;
                this.decls = decls$429;
            }
        });
    var CatchClause$308 = TermTree$278.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$430, params$431, body$432) {
                this.catchkw = catchkw$430;
                this.params = params$431;
                this.body = body$432;
            }
        });
    var Module$309 = TermTree$278.extend({
            properties: ['body'],
            construct: function (body$433) {
                this.body = body$433;
            }
        });
    var Empty$310 = TermTree$278.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$311(stx$434) {
        var staticOperators$435 = [
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
        return _$189.contains(staticOperators$435, stx$434.token.value);
    }
    function stxIsBinOp$312(stx$436) {
        var staticOperators$437 = [
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
        return _$189.contains(staticOperators$437, stx$436.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$313(stx$438, env$439) {
        var decls$440 = [];
        var res$441 = enforest$315(stx$438, env$439);
        var result$442 = res$441.result;
        var rest$443 = res$441.rest;
        if (rest$443[0]) {
            var nextRes$444 = enforest$315(rest$443, env$439);
            // x = ...
            if (nextRes$444.result.hasPrototype(Punc$294) && nextRes$444.result.punc.token.value === '=') {
                var initializerRes$445 = enforest$315(nextRes$444.rest, env$439);
                if (initializerRes$445.rest[0]) {
                    var restRes$446 = enforest$315(initializerRes$445.rest, env$439);
                    // x = y + z, ...
                    if (restRes$446.result.hasPrototype(Punc$294) && restRes$446.result.punc.token.value === ',') {
                        decls$440.push(VariableDeclaration$306.create(result$442.id, nextRes$444.result.punc, initializerRes$445.result, restRes$446.result.punc));
                        var subRes$447 = enforestVarStatement$313(restRes$446.rest, env$439);
                        decls$440 = decls$440.concat(subRes$447.result);
                        rest$443 = subRes$447.rest;
                    } else {
                        decls$440.push(VariableDeclaration$306.create(result$442.id, nextRes$444.result.punc, initializerRes$445.result));
                        rest$443 = initializerRes$445.rest;    // x = y EOF
                    }
                } else {
                    decls$440.push(VariableDeclaration$306.create(result$442.id, nextRes$444.result.punc, initializerRes$445.result));    // x ,...;
                }
            } else if (nextRes$444.result.hasPrototype(Punc$294) && nextRes$444.result.punc.token.value === ',') {
                decls$440.push(VariableDeclaration$306.create(result$442.id, null, null, nextRes$444.result.punc));
                var subRes$447 = enforestVarStatement$313(nextRes$444.rest, env$439);
                decls$440 = decls$440.concat(subRes$447.result);
                rest$443 = subRes$447.rest;
            } else {
                if (result$442.hasPrototype(Id$296)) {
                    decls$440.push(VariableDeclaration$306.create(result$442.id));
                } else {
                    throwError$255('Expecting an identifier in variable declaration');
                }    // x EOF
            }
        } else {
            if (result$442.hasPrototype(Id$296)) {
                decls$440.push(VariableDeclaration$306.create(result$442.id));
            } else if (result$442.hasPrototype(BinOp$291) && result$442.op.token.value === 'in') {
                decls$440.push(VariableDeclaration$306.create(result$442.left.id, result$442.op, result$442.right));
            } else {
                throwError$255('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$440,
            rest: rest$443
        };
    }
    function adjustLineContext$314(stx$448, original$449) {
        var last$450 = stx$448[0] && typeof stx$448[0].token.range == 'undefined' ? original$449 : stx$448[0];
        return _$189.map(stx$448, function (stx$451) {
            if (typeof stx$451.token.range == 'undefined') {
                stx$451.token.range = last$450.token.range;
            }
            if (stx$451.token.type === parser$190.Token.Delimiter) {
                stx$451.token.sm_startLineNumber = original$449.token.lineNumber;
                stx$451.token.sm_endLineNumber = original$449.token.lineNumber;
                stx$451.token.sm_startLineStart = original$449.token.lineStart;
                stx$451.token.sm_endLineStart = original$449.token.lineStart;
                if (stx$451.token.inner.length > 0) {
                    stx$451.token.inner = adjustLineContext$314(stx$451.token.inner, original$449);
                }
                last$450 = stx$451;
                return stx$451;
            }
            stx$451.token.sm_lineNumber = original$449.token.lineNumber;
            stx$451.token.sm_lineStart = original$449.token.lineStart;
            last$450 = stx$451;
            return stx$451;
        });
    }
    function enforest$315(toks$452, env$453) {
        env$453 = env$453 || new Map();
        parser$190.assert(toks$452.length > 0, 'enforest assumes there are tokens to work with');
        function step$454(head$455, rest$456) {
            var innerTokens$457;
            parser$190.assert(Array.isArray(rest$456), 'result must at least be an empty array');
            if (head$455.hasPrototype(TermTree$278)) {
                var emp$460 = head$455.emp;
                var emp$460 = head$455.emp;
                var keyword$463 = head$455.keyword;
                var delim$465 = head$455.delim;
                var emp$460 = head$455.emp;
                var punc$468 = head$455.punc;
                var keyword$463 = head$455.keyword;
                var emp$460 = head$455.emp;
                var emp$460 = head$455.emp;
                var emp$460 = head$455.emp;
                var delim$465 = head$455.delim;
                var delim$465 = head$455.delim;
                var keyword$463 = head$455.keyword;
                var keyword$463 = head$455.keyword;
                if (head$455.hasPrototype(Expr$281) && (rest$456[0] && rest$456[0].token.type === parser$190.Token.Delimiter && rest$456[0].token.value === '()')) {
                    var argRes$493, enforestedArgs$494 = [], commas$495 = [];
                    rest$456[0].expose();
                    innerTokens$457 = rest$456[0].token.inner;
                    while (innerTokens$457.length > 0) {
                        argRes$493 = enforest$315(innerTokens$457, env$453);
                        enforestedArgs$494.push(argRes$493.result);
                        innerTokens$457 = argRes$493.rest;
                        if (innerTokens$457[0] && innerTokens$457[0].token.value === ',') {
                            commas$495.push(innerTokens$457[0]);
                            innerTokens$457 = innerTokens$457.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$496 = _$189.all(enforestedArgs$494, function (argTerm$497) {
                            return argTerm$497.hasPrototype(Expr$281);
                        });
                    if (innerTokens$457.length === 0 && argsAreExprs$496) {
                        return step$454(Call$303.create(head$455, enforestedArgs$494, rest$456[0], commas$495), rest$456.slice(1));
                    }
                } else if (head$455.hasPrototype(Expr$281) && (rest$456[0] && rest$456[0].token.value === '?')) {
                    var question$498 = rest$456[0];
                    var condRes$499 = enforest$315(rest$456.slice(1), env$453);
                    var truExpr$500 = condRes$499.result;
                    var right$501 = condRes$499.rest;
                    if (truExpr$500.hasPrototype(Expr$281) && right$501[0] && right$501[0].token.value === ':') {
                        var colon$502 = right$501[0];
                        var flsRes$503 = enforest$315(right$501.slice(1), env$453);
                        var flsExpr$504 = flsRes$503.result;
                        if (flsExpr$504.hasPrototype(Expr$281)) {
                            return step$454(ConditionalExpression$292.create(head$455, question$498, truExpr$500, colon$502, flsExpr$504), flsRes$503.rest);
                        }
                    }
                } else if (head$455.hasPrototype(Keyword$293) && (keyword$463.token.value === 'new' && rest$456[0])) {
                    // Constructor
                    var newCallRes$505 = enforest$315(rest$456, env$453);
                    if (newCallRes$505.result.hasPrototype(Call$303)) {
                        return step$454(Const$302.create(head$455, newCallRes$505.result), newCallRes$505.rest);
                    }
                } else if (head$455.hasPrototype(Delimiter$295) && delim$465.token.value === '()') {
                    // ParenExpr
                    innerTokens$457 = delim$465.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$457.length === 0) {
                        return step$454(ParenExpression$288.create(head$455), rest$456);
                    } else {
                        var innerTerm$506 = get_expression$316(innerTokens$457, env$453);
                        if (innerTerm$506.result && innerTerm$506.result.hasPrototype(Expr$281)) {
                            return step$454(ParenExpression$288.create(head$455), rest$456);
                        }
                    }
                } else if (head$455.hasPrototype(TermTree$278) && (rest$456[0] && rest$456[1] && stxIsBinOp$312(rest$456[0]))) {
                    var op$507 = rest$456[0];
                    var left$508 = head$455;
                    var bopRes$509 = enforest$315(rest$456.slice(1), env$453);
                    var right$501 = bopRes$509.result;
                    if (right$501.hasPrototype(Expr$281)) {
                        return step$454(BinOp$291.create(op$507, left$508, right$501), bopRes$509.rest);
                    }
                } else if (head$455.hasPrototype(Punc$294) && stxIsUnaryOp$311(punc$468)) {
                    var unopRes$510 = enforest$315(rest$456, env$453);
                    if (unopRes$510.result.hasPrototype(Expr$281)) {
                        return step$454(UnaryOp$289.create(punc$468, unopRes$510.result), unopRes$510.rest);
                    }
                } else if (head$455.hasPrototype(Keyword$293) && stxIsUnaryOp$311(keyword$463)) {
                    var unopRes$510 = enforest$315(rest$456, env$453);
                    if (unopRes$510.result.hasPrototype(Expr$281)) {
                        return step$454(UnaryOp$289.create(keyword$463, unopRes$510.result), unopRes$510.rest);
                    }
                } else if (head$455.hasPrototype(Expr$281) && (rest$456[0] && (rest$456[0].token.value === '++' || rest$456[0].token.value === '--'))) {
                    return step$454(PostfixOp$290.create(head$455, rest$456[0]), rest$456.slice(1));
                } else if (head$455.hasPrototype(Expr$281) && (rest$456[0] && rest$456[0].token.value === '[]')) {
                    return step$454(ObjGet$305.create(head$455, Delimiter$295.create(rest$456[0].expose())), rest$456.slice(1));
                } else if (head$455.hasPrototype(Expr$281) && (rest$456[0] && rest$456[0].token.value === '.' && rest$456[1] && rest$456[1].token.type === parser$190.Token.Identifier)) {
                    return step$454(ObjDotGet$304.create(head$455, rest$456[0], rest$456[1]), rest$456.slice(2));
                } else if (head$455.hasPrototype(Delimiter$295) && delim$465.token.value === '[]') {
                    return step$454(ArrayLiteral$287.create(head$455), rest$456);
                } else if (head$455.hasPrototype(Delimiter$295) && head$455.delim.token.value === '{}') {
                    return step$454(Block$286.create(head$455), rest$456);
                } else if (head$455.hasPrototype(Keyword$293) && (keyword$463.token.value === 'let' && (rest$456[0] && rest$456[0].token.type === parser$190.Token.Identifier || rest$456[0] && rest$456[0].token.type === parser$190.Token.Keyword) && rest$456[1] && rest$456[1].token.value === '=' && rest$456[2] && rest$456[2].token.value === 'macro')) {
                    var mac$511 = enforest$315(rest$456.slice(2), env$453);
                    if (!mac$511.result.hasPrototype(AnonMacro$301)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding');
                    }
                    return step$454(LetMacro$299.create(rest$456[0], mac$511.result.body), mac$511.rest);
                } else if (head$455.hasPrototype(Keyword$293) && (keyword$463.token.value === 'var' && rest$456[0])) {
                    var vsRes$512 = enforestVarStatement$313(rest$456, env$453);
                    if (vsRes$512) {
                        return step$454(VariableStatement$307.create(head$455, vsRes$512.result), vsRes$512.rest);
                    }
                }
            } else {
                parser$190.assert(head$455 && head$455.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$455.token.type === parser$190.Token.Identifier || head$455.token.type === parser$190.Token.Keyword || head$455.token.type === parser$190.Token.Punctuator) && env$453.has(resolve$268(head$455))) {
                    // pull the macro transformer out the environment
                    var transformer$513 = env$453.get(resolve$268(head$455)).fn;
                    // apply the transformer
                    var rt$514 = transformer$513([head$455].concat(rest$456), env$453);
                    if (!Array.isArray(rt$514.result)) {
                        throwError$255('Macro transformer must return a result array, not: ' + rt$514.result);
                    }
                    if (rt$514.result.length > 0) {
                        var adjustedResult$515 = adjustLineContext$314(rt$514.result, head$455);
                        return step$454(adjustedResult$515[0], adjustedResult$515.slice(1).concat(rt$514.rest));
                    } else {
                        return step$454(Empty$310.create(), rt$514.rest);    // anon macro definition
                    }
                } else if (head$455.token.type === parser$190.Token.Identifier && head$455.token.value === 'macro' && rest$456[0] && rest$456[0].token.value === '{}') {
                    return step$454(AnonMacro$301.create(rest$456[0].expose().token.inner), rest$456.slice(1));
                } else if (head$455.token.type === parser$190.Token.Identifier && head$455.token.value === 'macro' && rest$456[0] && (rest$456[0].token.type === parser$190.Token.Identifier || rest$456[0].token.type === parser$190.Token.Keyword || rest$456[0].token.type === parser$190.Token.Punctuator) && rest$456[1] && rest$456[1].token.type === parser$190.Token.Delimiter && rest$456[1].token.value === '{}') {
                    return step$454(Macro$300.create(rest$456[0], rest$456[1].expose().token.inner), rest$456.slice(2));
                } else if (head$455.token.value === 'module' && rest$456[0] && rest$456[0].token.value === '{}') {
                    return step$454(Module$309.create(rest$456[0]), rest$456.slice(1));
                } else if (head$455.token.type === parser$190.Token.Keyword && head$455.token.value === 'function' && rest$456[0] && rest$456[0].token.type === parser$190.Token.Identifier && rest$456[1] && rest$456[1].token.type === parser$190.Token.Delimiter && rest$456[1].token.value === '()' && rest$456[2] && rest$456[2].token.type === parser$190.Token.Delimiter && rest$456[2].token.value === '{}') {
                    rest$456[1].token.inner = rest$456[1].expose().token.inner;
                    rest$456[2].token.inner = rest$456[2].expose().token.inner;
                    return step$454(NamedFun$297.create(head$455, rest$456[0], rest$456[1], rest$456[2]), rest$456.slice(3));
                } else if (head$455.token.type === parser$190.Token.Keyword && head$455.token.value === 'function' && rest$456[0] && rest$456[0].token.type === parser$190.Token.Delimiter && rest$456[0].token.value === '()' && rest$456[1] && rest$456[1].token.type === parser$190.Token.Delimiter && rest$456[1].token.value === '{}') {
                    rest$456[0].token.inner = rest$456[0].expose().token.inner;
                    rest$456[1].token.inner = rest$456[1].expose().token.inner;
                    return step$454(AnonFun$298.create(head$455, rest$456[0], rest$456[1]), rest$456.slice(2));
                } else if (head$455.token.type === parser$190.Token.Keyword && head$455.token.value === 'catch' && rest$456[0] && rest$456[0].token.type === parser$190.Token.Delimiter && rest$456[0].token.value === '()' && rest$456[1] && rest$456[1].token.type === parser$190.Token.Delimiter && rest$456[1].token.value === '{}') {
                    rest$456[0].token.inner = rest$456[0].expose().token.inner;
                    rest$456[1].token.inner = rest$456[1].expose().token.inner;
                    return step$454(CatchClause$308.create(head$455, rest$456[0], rest$456[1]), rest$456.slice(2));
                } else if (head$455.token.type === parser$190.Token.Keyword && head$455.token.value === 'this') {
                    return step$454(ThisExpression$283.create(head$455), rest$456);
                } else if (head$455.token.type === parser$190.Token.NumericLiteral || head$455.token.type === parser$190.Token.StringLiteral || head$455.token.type === parser$190.Token.BooleanLiteral || head$455.token.type === parser$190.Token.RegexLiteral || head$455.token.type === parser$190.Token.NullLiteral) {
                    return step$454(Lit$284.create(head$455), rest$456);
                } else if (head$455.token.type === parser$190.Token.Identifier) {
                    return step$454(Id$296.create(head$455), rest$456);
                } else if (head$455.token.type === parser$190.Token.Punctuator) {
                    return step$454(Punc$294.create(head$455), rest$456);
                } else if (head$455.token.type === parser$190.Token.Keyword && head$455.token.value === 'with') {
                    throwError$255('with is not supported in sweet.js');
                } else if (head$455.token.type === parser$190.Token.Keyword) {
                    return step$454(Keyword$293.create(head$455), rest$456);
                } else if (head$455.token.type === parser$190.Token.Delimiter) {
                    return step$454(Delimiter$295.create(head$455.expose()), rest$456);
                } else if (head$455.token.type === parser$190.Token.EOF) {
                    parser$190.assert(rest$456.length === 0, 'nothing should be after an EOF');
                    return step$454(EOF$279.create(head$455), []);
                } else {
                    // todo: are we missing cases?
                    parser$190.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$455,
                rest: rest$456
            };
        }
        return step$454(toks$452[0], toks$452.slice(1));
    }
    function get_expression$316(stx$516, env$517) {
        var res$518 = enforest$315(stx$516, env$517);
        if (!res$518.result.hasPrototype(Expr$281)) {
            return {
                result: null,
                rest: stx$516
            };
        }
        return res$518;
    }
    function applyMarkToPatternEnv$317(newMark$519, env$520) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$521(match$522) {
            if (match$522.level === 0) {
                // replace the match property with the marked syntax
                match$522.match = _$189.map(match$522.match, function (stx$523) {
                    return stx$523.mark(newMark$519);
                });
            } else {
                _$189.each(match$522.match, function (match$524) {
                    dfs$521(match$524);
                });
            }
        }
        _$189.keys(env$520).forEach(function (key$525) {
            dfs$521(env$520[key$525]);
        });
    }
    function loadMacroDef$318(mac$526, env$527, defscope$528, templateMap$529) {
        var body$530 = mac$526.body;
        // raw function primitive form
        if (!(body$530[0] && body$530[0].token.type === parser$190.Token.Keyword && body$530[0].token.value === 'function')) {
            throwError$255('Primitive macro form must contain a function for the macro body');
        }
        var stub$531 = parser$190.read('()')[0];
        stub$531[0].token.inner = body$530;
        var expanded$532 = expand$322(stub$531, env$527, defscope$528, templateMap$529);
        expanded$532 = expanded$532[0].destruct().concat(expanded$532[1].eof);
        var flattend$533 = flatten$324(expanded$532);
        var bodyCode$534 = codegen$196.generate(parser$190.parse(flattend$533));
        var macroFn$535 = scopedEval$256(bodyCode$534, {
                makeValue: syn$191.makeValue,
                makeRegex: syn$191.makeRegex,
                makeIdent: syn$191.makeIdent,
                makeKeyword: syn$191.makeKeyword,
                makePunc: syn$191.makePunc,
                makeDelim: syn$191.makeDelim,
                unwrapSyntax: syn$191.unwrapSyntax,
                fresh: fresh$274,
                _: _$189,
                parser: parser$190,
                patternModule: patternModule$194,
                getTemplate: function (id$536) {
                    return templateMap$529.get(id$536);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$317,
                mergeMatches: function (newMatch$537, oldMatch$538) {
                    newMatch$537.patternEnv = _$189.extend({}, oldMatch$538.patternEnv, newMatch$537.patternEnv);
                    return newMatch$537;
                }
            });
        return macroFn$535;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$319(stx$539, env$540, defscope$541, templateMap$542) {
        parser$190.assert(env$540, 'environment map is required');
        // short circuit when syntax array is empty
        if (stx$539.length === 0) {
            return {
                terms: [],
                env: env$540
            };
        }
        parser$190.assert(stx$539[0].token, 'expecting a syntax object');
        var f$543 = enforest$315(stx$539, env$540);
        // head :: TermTree
        var head$544 = f$543.result;
        // rest :: [Syntax]
        var rest$545 = f$543.rest;
        if (head$544.hasPrototype(Macro$300)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$547 = loadMacroDef$318(head$544, env$540, defscope$541, templateMap$542);
            addToDefinitionCtx$320([head$544.name], defscope$541, false);
            env$540.set(resolve$268(head$544.name), { fn: macroDefinition$547 });
            return expandToTermTree$319(rest$545, env$540, defscope$541, templateMap$542);
        }
        if (head$544.hasPrototype(LetMacro$299)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$547 = loadMacroDef$318(head$544, env$540, defscope$541, templateMap$542);
            var freshName$548 = fresh$274();
            var renamedName$549 = head$544.name.rename(head$544.name, freshName$548);
            rest$545 = _$189.map(rest$545, function (stx$550) {
                return stx$550.rename(head$544.name, freshName$548);
            });
            head$544.name = renamedName$549;
            env$540.set(resolve$268(head$544.name), { fn: macroDefinition$547 });
            return expandToTermTree$319(rest$545, env$540, defscope$541, templateMap$542);
        }
        if (head$544.hasPrototype(NamedFun$297)) {
            addToDefinitionCtx$320([head$544.name], defscope$541, true);
        }
        if (head$544.hasPrototype(Id$296) && head$544.id.token.value === '#quoteSyntax' && rest$545[0] && rest$545[0].token.value === '{}') {
            var tempId$551 = fresh$274();
            templateMap$542.set(tempId$551, rest$545[0].token.inner);
            return expandToTermTree$319([
                syn$191.makeIdent('getTemplate', head$544.id),
                syn$191.makeDelim('()', [syn$191.makeValue(tempId$551, head$544.id)], head$544.id)
            ].concat(rest$545.slice(1)), env$540, defscope$541, templateMap$542);
        }
        if (head$544.hasPrototype(VariableStatement$307)) {
            addToDefinitionCtx$320(_$189.map(head$544.decls, function (decl$552) {
                return decl$552.ident;
            }), defscope$541, true);
        }
        if (head$544.hasPrototype(Block$286) && head$544.body.hasPrototype(Delimiter$295)) {
            head$544.body.delim.token.inner.forEach(function (term$553) {
                if (term$553.hasPrototype(VariableStatement$307)) {
                    addToDefinitionCtx$320(_$189.map(term$553.decls, function (decl$554) {
                        return decl$554.ident;
                    }), defscope$541, true);
                }
            });
        }
        if (head$544.hasPrototype(Delimiter$295)) {
            head$544.delim.token.inner.forEach(function (term$555) {
                if (term$555.hasPrototype(VariableStatement$307)) {
                    addToDefinitionCtx$320(_$189.map(term$555.decls, function (decl$556) {
                        return decl$556.ident;
                    }), defscope$541, true);
                }
            });
        }
        var trees$546 = expandToTermTree$319(rest$545, env$540, defscope$541, templateMap$542);
        return {
            terms: [head$544].concat(trees$546.terms),
            env: trees$546.env
        };
    }
    function addToDefinitionCtx$320(idents$557, defscope$558, skipRep$559) {
        parser$190.assert(idents$557 && idents$557.length > 0, 'expecting some variable identifiers');
        skipRep$559 = skipRep$559 || false;
        _$189.each(idents$557, function (id$560) {
            var skip$561 = false;
            if (skipRep$559) {
                var declRepeat$562 = _$189.find(defscope$558, function (def$563) {
                        return def$563.id.token.value === id$560.token.value && arraysEqual$269(marksof$267(def$563.id.context), marksof$267(id$560.context));
                    });
                skip$561 = typeof declRepeat$562 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$561) {
                var name$564 = fresh$274();
                defscope$558.push({
                    id: id$560,
                    name: name$564
                });
            }
        });
    }
    function expandTermTreeToFinal$321(term$565, env$566, defscope$567, templateMap$568) {
        parser$190.assert(env$566, 'environment map is required');
        if (term$565.hasPrototype(ArrayLiteral$287)) {
            term$565.array.delim.token.inner = expand$322(term$565.array.delim.token.inner, env$566, defscope$567, templateMap$568);
            return term$565;
        } else if (term$565.hasPrototype(Block$286)) {
            term$565.body.delim.token.inner = expand$322(term$565.body.delim.token.inner, env$566, defscope$567, templateMap$568);
            return term$565;
        } else if (term$565.hasPrototype(ParenExpression$288)) {
            term$565.expr.delim.token.inner = expand$322(term$565.expr.delim.token.inner, env$566, defscope$567, templateMap$568);
            return term$565;
        } else if (term$565.hasPrototype(Call$303)) {
            term$565.fun = expandTermTreeToFinal$321(term$565.fun, env$566, defscope$567, templateMap$568);
            term$565.args = _$189.map(term$565.args, function (arg$569) {
                return expandTermTreeToFinal$321(arg$569, env$566, defscope$567, templateMap$568);
            });
            return term$565;
        } else if (term$565.hasPrototype(UnaryOp$289)) {
            term$565.expr = expandTermTreeToFinal$321(term$565.expr, env$566, defscope$567, templateMap$568);
            return term$565;
        } else if (term$565.hasPrototype(BinOp$291)) {
            term$565.left = expandTermTreeToFinal$321(term$565.left, env$566, defscope$567, templateMap$568);
            term$565.right = expandTermTreeToFinal$321(term$565.right, env$566, defscope$567);
            return term$565;
        } else if (term$565.hasPrototype(ObjGet$305)) {
            term$565.right.delim.token.inner = expand$322(term$565.right.delim.token.inner, env$566, defscope$567, templateMap$568);
            return term$565;
        } else if (term$565.hasPrototype(ObjDotGet$304)) {
            term$565.left = expandTermTreeToFinal$321(term$565.left, env$566, defscope$567, templateMap$568);
            term$565.right = expandTermTreeToFinal$321(term$565.right, env$566, defscope$567, templateMap$568);
            return term$565;
        } else if (term$565.hasPrototype(VariableDeclaration$306)) {
            if (term$565.init) {
                term$565.init = expandTermTreeToFinal$321(term$565.init, env$566, defscope$567, templateMap$568);
            }
            return term$565;
        } else if (term$565.hasPrototype(VariableStatement$307)) {
            term$565.decls = _$189.map(term$565.decls, function (decl$570) {
                return expandTermTreeToFinal$321(decl$570, env$566, defscope$567, templateMap$568);
            });
            return term$565;
        } else if (term$565.hasPrototype(Delimiter$295)) {
            // expand inside the delimiter and then continue on
            term$565.delim.token.inner = expand$322(term$565.delim.token.inner, env$566, defscope$567, templateMap$568);
            return term$565;
        } else if (term$565.hasPrototype(NamedFun$297) || term$565.hasPrototype(AnonFun$298) || term$565.hasPrototype(CatchClause$308) || term$565.hasPrototype(Module$309)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$571 = [];
            if (term$565.params) {
                var params$580 = term$565.params.addDefCtx(newDef$571);
            } else {
                var params$580 = syn$191.makeDelim('()', [], null);
            }
            var bodies$572 = term$565.body.addDefCtx(newDef$571);
            var paramNames$573 = _$189.map(getParamIdentifiers$277(params$580), function (param$581) {
                    var freshName$582 = fresh$274();
                    return {
                        freshName: freshName$582,
                        originalParam: param$581,
                        renamedParam: param$581.rename(param$581, freshName$582)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$574 = _$189.reduce(paramNames$573, function (accBody$583, p$584) {
                    return accBody$583.rename(p$584.originalParam, p$584.freshName);
                }, bodies$572);
            renamedBody$574 = renamedBody$574.expose();
            var bodyTerms$575 = expand$322([renamedBody$574], env$566, newDef$571, templateMap$568);
            parser$190.assert(bodyTerms$575.length === 1 && bodyTerms$575[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$576 = _$189.map(paramNames$573, function (p$585) {
                    return p$585.renamedParam;
                });
            var flatArgs$577 = syn$191.makeDelim('()', joinSyntax$275(renamedParams$576, ','), term$565.params);
            var expandedArgs$578 = expand$322([flatArgs$577], env$566, newDef$571, templateMap$568);
            parser$190.assert(expandedArgs$578.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            term$565.params = expandedArgs$578[0];
            var flattenedBody$579 = bodyTerms$575[0].destruct();
            flattenedBody$579 = _$189.reduce(newDef$571, function (acc$586, def$587) {
                return acc$586.rename(def$587.id, def$587.name);
            }, flattenedBody$579[0]);
            term$565.body = flattenedBody$579;
            // and continue expand the rest
            return term$565;
        }
        // the term is fine as is
        return term$565;
    }
    function expand$322(stx$588, env$589, defscope$590, templateMap$591) {
        env$589 = env$589 || new Map();
        templateMap$591 = templateMap$591 || new Map();
        var trees$592 = expandToTermTree$319(stx$588, env$589, defscope$590, templateMap$591);
        return _$189.map(trees$592.terms, function (term$593) {
            return expandTermTreeToFinal$321(term$593, trees$592.env, defscope$590, templateMap$591);
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$323(stx$594, builtinSource$595) {
        if (builtinSource$595) {
            var builtinRead$597 = parser$190.read(builtinSource$595)[0];
            builtinRead$597 = [
                syn$191.makeIdent('module', null),
                syn$191.makeDelim('{}', builtinRead$597, null)
            ];
            var builtinRes$598 = expand$322(builtinRead$597);
        }
        var res$596 = expand$322([
                syn$191.makeIdent('module', null),
                syn$191.makeDelim('{}', stx$594)
            ]);
        return flatten$324(res$596[0].body.token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$324(stx$599) {
        return _$189.reduce(stx$599, function (acc$600, stx$601) {
            if (stx$601.token.type === parser$190.Token.Delimiter) {
                var exposed$602 = stx$601.expose();
                var openParen$603 = syntaxFromToken$264({
                        type: parser$190.Token.Punctuator,
                        value: stx$601.token.value[0],
                        range: stx$601.token.startRange,
                        lineNumber: stx$601.token.startLineNumber,
                        sm_lineNumber: stx$601.token.sm_startLineNumber ? stx$601.token.sm_startLineNumber : stx$601.token.startLineNumber,
                        lineStart: stx$601.token.startLineStart,
                        sm_lineStart: stx$601.token.sm_startLineStart ? stx$601.token.sm_startLineStart : stx$601.token.startLineStart
                    }, exposed$602.context);
                var closeParen$604 = syntaxFromToken$264({
                        type: parser$190.Token.Punctuator,
                        value: stx$601.token.value[1],
                        range: stx$601.token.endRange,
                        lineNumber: stx$601.token.endLineNumber,
                        sm_lineNumber: stx$601.token.sm_endLineNumber ? stx$601.token.sm_endLineNumber : stx$601.token.endLineNumber,
                        lineStart: stx$601.token.endLineStart,
                        sm_lineStart: stx$601.token.sm_endLineStart ? stx$601.token.sm_endLineStart : stx$601.token.endLineStart
                    }, exposed$602.context);
                return acc$600.concat(openParen$603).concat(flatten$324(exposed$602.token.inner)).concat(closeParen$604);
            }
            stx$601.token.sm_lineNumber = stx$601.token.sm_lineNumber ? stx$601.token.sm_lineNumber : stx$601.token.lineNumber;
            stx$601.token.sm_lineStart = stx$601.token.sm_lineStart ? stx$601.token.sm_lineStart : stx$601.token.lineStart;
            return acc$600.concat(stx$601);
        }, []);
    }
    exports$188.enforest = enforest$315;
    exports$188.expand = expandTopLevel$323;
    exports$188.resolve = resolve$268;
    exports$188.get_expression = get_expression$316;
    exports$188.Expr = Expr$281;
    exports$188.VariableStatement = VariableStatement$307;
    exports$188.tokensToSyntax = syn$191.tokensToSyntax;
    exports$188.syntaxToTokens = syn$191.syntaxToTokens;
}));