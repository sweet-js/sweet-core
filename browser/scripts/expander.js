(function (root$1, factory$2) {
    if (typeof exports === 'object') {
        factory$2(exports, require('underscore'), require('./parser'), require('es6-collections'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'es6-collections'
        ], factory$2);
    } else {
        factory$2(root$1.expander = {}, root$1._, root$1.parser);
    }
}(this, function (exports$4, _$5, parser$6, es6$7) {
    'use strict';
    exports$4._test = {};
    Object.prototype.create = function () {
        var obj$10 = Object.create(this);
        if (typeof obj$10.construct === 'function') {
            obj$10.construct.apply(obj$10, arguments);
        }
        return obj$10;
    };
    Object.prototype.extend = function (properties$11) {
        var result$13 = Object.create(this);
        for (var prop in properties$11) {
            if (properties$11.hasOwnProperty(prop)) {
                result$13[prop] = properties$11[prop];
            }
        }
        return result$13;
    };
    Object.prototype.hasPrototype = function (proto$14) {
        function F() {
        }
        F.prototype = proto$14;
        return this instanceof F;
    };
    function throwError(msg$17) {
        throw new Error(msg$17);
    }
    function mkSyntax(value$19, type$20, stx$21) {
        return syntaxFromToken({
            type: type$20,
            value: value$19,
            lineStart: stx$21.token.lineStart,
            lineNumber: stx$21.token.lineNumber
        }, stx$21.context);
    }
    function Mark(mark$23, ctx$24) {
        return {
            mark: mark$23,
            context: ctx$24
        };
    }
    function Var(id$26) {
        return {id: id$26};
    }
    var isMark$534 = function isMark$534(m$28) {
        return m$28 && typeof m$28.mark !== 'undefined';
    };
    function Rename(id$30, name$31, ctx$32) {
        return {
            id: id$30,
            name: name$31,
            context: ctx$32
        };
    }
    var isRename$535 = function (r$34) {
        return r$34 && typeof r$34.id !== 'undefined' && typeof r$34.name !== 'undefined';
    };
    function DummyRename(name$36, ctx$37) {
        return {
            dummy_name: name$36,
            context: ctx$37
        };
    }
    var isDummyRename$536 = function (r$39) {
        return r$39 && typeof r$39.dummy_name !== 'undefined';
    };
    var syntaxProto$537 = {
            mark: function mark(newMark$41) {
                var markedToken$45 = _$5.clone(this.token);
                if (this.token.inner) {
                    var markedInner$46 = _$5.map(this.token.inner, function (stx$43) {
                            return stx$43.mark(newMark$41);
                        });
                    markedToken$45.inner = markedInner$46;
                }
                var newMarkObj$47 = Mark(newMark$41, this.context);
                var stmp$48 = syntaxFromToken(markedToken$45, newMarkObj$47);
                return stmp$48;
            },
            rename: function (id$49, name$50) {
                if (this.token.inner) {
                    var renamedInner$54 = _$5.map(this.token.inner, function (stx$52) {
                            return stx$52.rename(id$49, name$50);
                        });
                    this.token.inner = renamedInner$54;
                }
                if (this.token.value === id$49.token.value) {
                    return syntaxFromToken(this.token, Rename(id$49, name$50, this.context));
                } else {
                    return this;
                }
            },
            push_dummy_rename: function (name$55) {
                if (this.token.inner) {
                    var renamedInner$59 = _$5.map(this.token.inner, function (stx$57) {
                            return stx$57.push_dummy_rename(name$55);
                        });
                    this.token.inner = renamedInner$59;
                }
                return syntaxFromToken(this.token, DummyRename(name$55, this.context));
            },
            swap_dummy_rename: function (varNames$60, dummyName$61) {
                parser$6.assert(this.token.type !== parser$6.Token.Delimiter, 'expecting everything to be flattened');
                var that$65 = this;
                var matchingVarNames$66 = _$5.filter(varNames$60, function (v$63) {
                        return v$63.originalVar.token.value === that$65.token.value;
                    });
                var newStx$67 = syntaxFromToken(this.token, renameDummyCtx(this.context, matchingVarNames$66, dummyName$61));
                return newStx$67;
            },
            toString: function () {
                var val$69 = this.token.type === parser$6.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$69 + ']';
            }
        };
    function renameDummyCtx(ctx$70, varNames$71, dummyName$72) {
        if (ctx$70 === null) {
            return null;
        }
        if (isDummyRename$536(ctx$70) && ctx$70.dummy_name === dummyName$72) {
            return _$5.reduce(varNames$71, function (accCtx$74, v$75) {
                return Rename(v$75.originalVar, v$75.freshName, accCtx$74);
            }, ctx$70.context);
        }
        if (isDummyRename$536(ctx$70) && ctx$70.dummy_name !== dummyName$72) {
            return DummyRename(ctx$70.dummy_name, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        if (isMark$534(ctx$70)) {
            return Mark(ctx$70.mark, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        if (isRename$535(ctx$70)) {
            return Rename(ctx$70.id.swap_dummy_rename(varNames$71, dummyName$72), ctx$70.name, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        parser$6.assert(false, 'expecting a fixed set of context types');
    }
    function findDummyParent(ctx$77, dummyName$78) {
        if (ctx$77 === null || ctx$77.context === null) {
            return null;
        }
        if (isDummyRename$536(ctx$77.context) && ctx$77.context.dummy_name === dummyName$78) {
            return ctx$77;
        }
        return findDummyParent(ctx$77.context);
    }
    function syntaxFromToken(token$80, oldctx$81) {
        var ctx$83 = typeof oldctx$81 !== 'undefined' ? oldctx$81 : null;
        return Object.create(syntaxProto$537, {
            token: {
                value: token$80,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$83,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
    }
    function remdup(mark$84, mlist$85) {
        if (mark$84 === _$5.first(mlist$85)) {
            return _$5.rest(mlist$85, 1);
        }
        return [mark$84].concat(mlist$85);
    }
    function marksof(ctx$87, stopName$88) {
        var mark$90, submarks$91;
        if (isMark$534(ctx$87)) {
            mark$90 = ctx$87.mark;
            submarks$91 = marksof(ctx$87.context, stopName$88);
            return remdup(mark$90, submarks$91);
        }
        if (isDummyRename$536(ctx$87)) {
            return marksof(ctx$87.context);
        }
        if (isRename$535(ctx$87)) {
            if (stopName$88 === ctx$87.name) {
                return [];
            }
            return marksof(ctx$87.context, stopName$88);
        }
        return [];
    }
    function resolve(stx$92) {
        return resolveCtx(stx$92.token.value, stx$92.context);
    }
    function arraysEqual(a$94, b$95) {
        if (a$94.length !== b$95.length) {
            return false;
        }
        for (var i = 0; i < a$94.length; i++) {
            if (a$94[i] !== b$95[i]) {
                return false;
            }
        }
        return true;
    }
    function resolveCtx(originalName$97, ctx$98) {
        if (isMark$534(ctx$98) || isDummyRename$536(ctx$98)) {
            return resolveCtx(originalName$97, ctx$98.context);
        }
        if (isRename$535(ctx$98)) {
            var idName$100 = resolveCtx(ctx$98.id.token.value, ctx$98.id.context);
            var subName$101 = resolveCtx(originalName$97, ctx$98.context);
            if (idName$100 === subName$101) {
                var idMarks$102 = marksof(ctx$98.id.context, idName$100);
                var subMarks$103 = marksof(ctx$98.context, idName$100);
                if (arraysEqual(idMarks$102, subMarks$103)) {
                    return originalName$97 + '$' + ctx$98.name;
                }
            }
            return resolveCtx(originalName$97, ctx$98.context);
        }
        return originalName$97;
    }
    var nextFresh$538 = 0;
    function fresh() {
        return nextFresh$538++;
    }
    ;
    function tokensToSyntax(tokens$105) {
        if (!_$5.isArray(tokens$105)) {
            tokens$105 = [tokens$105];
        }
        return _$5.map(tokens$105, function (token$107) {
            if (token$107.inner) {
                token$107.inner = tokensToSyntax(token$107.inner);
            }
            return syntaxFromToken(token$107);
        });
    }
    function syntaxToTokens(syntax$109) {
        return _$5.map(syntax$109, function (stx$111) {
            if (stx$111.token.inner) {
                stx$111.token.inner = syntaxToTokens(stx$111.token.inner);
            }
            return stx$111.token;
        });
    }
    function isPatternVar(token$113) {
        return token$113.type === parser$6.Token.Identifier && token$113.value[0] === '$' && token$113.value !== '$';
    }
    var containsPatternVar$539 = function (patterns$115) {
        return _$5.any(patterns$115, function (pat$117) {
            if (pat$117.token.type === parser$6.Token.Delimiter) {
                return containsPatternVar$539(pat$117.token.inner);
            }
            return isPatternVar(pat$117);
        });
    };
    function loadPattern(patterns$119) {
        return _$5.chain(patterns$119).reduce(function (acc$121, patStx$122, idx$123) {
            var last$125 = patterns$119[idx$123 - 1];
            var lastLast$126 = patterns$119[idx$123 - 2];
            var next$127 = patterns$119[idx$123 + 1];
            var nextNext$128 = patterns$119[idx$123 + 2];
            if (patStx$122.token.value === ':') {
                if (last$125 && isPatternVar(last$125.token)) {
                    return acc$121;
                }
            }
            if (last$125 && last$125.token.value === ':') {
                if (lastLast$126 && isPatternVar(lastLast$126.token)) {
                    return acc$121;
                }
            }
            if (patStx$122.token.value === '$' && next$127 && next$127.token.type === parser$6.Token.Delimiter) {
                return acc$121;
            }
            if (isPatternVar(patStx$122.token)) {
                if (next$127 && next$127.token.value === ':') {
                    parser$6.assert(typeof nextNext$128 !== 'undefined', 'expecting a pattern class');
                    patStx$122.class = nextNext$128.token.value;
                } else {
                    patStx$122.class = 'token';
                }
            } else if (patStx$122.token.type === parser$6.Token.Delimiter) {
                if (last$125 && last$125.token.value === '$') {
                    patStx$122.class = 'pattern_group';
                }
                patStx$122.token.inner = loadPattern(patStx$122.token.inner);
            } else {
                patStx$122.class = 'pattern_literal';
            }
            return acc$121.concat(patStx$122);
        }, []).reduce(function (acc$129, patStx$130, idx$131, patterns$132) {
            var separator$134 = ' ';
            var repeat$135 = false;
            var next$136 = patterns$132[idx$131 + 1];
            var nextNext$137 = patterns$132[idx$131 + 2];
            if (next$136 && next$136.token.value === '...') {
                repeat$135 = true;
                separator$134 = ' ';
            } else if (delimIsSeparator(next$136) && nextNext$137 && nextNext$137.token.value === '...') {
                repeat$135 = true;
                parser$6.assert(next$136.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$134 = next$136.token.inner[0].token.value;
            }
            if (patStx$130.token.value === '...' || delimIsSeparator(patStx$130) && next$136 && next$136.token.value === '...') {
                return acc$129;
            }
            patStx$130.repeat = repeat$135;
            patStx$130.separator = separator$134;
            return acc$129.concat(patStx$130);
        }, []).value();
    }
    function takeLineContext(from$138, to$139) {
        return _$5.map(to$139, function (stx$141) {
            if (stx$141.token.type === parser$6.Token.Delimiter) {
                return syntaxFromToken({
                    type: parser$6.Token.Delimiter,
                    value: stx$141.token.value,
                    inner: stx$141.token.inner,
                    startRange: from$138.range,
                    endRange: from$138.range,
                    startLineNumber: from$138.token.lineNumber,
                    startLineStart: from$138.token.lineStart,
                    endLineNumber: from$138.token.lineNumber,
                    endLineStart: from$138.token.lineStart
                }, stx$141.context);
            }
            return syntaxFromToken({
                value: stx$141.token.value,
                type: stx$141.token.type,
                lineNumber: from$138.token.lineNumber,
                lineStart: from$138.token.lineStart,
                range: null
            }, stx$141.context);
        });
    }
    function joinRepeatedMatch(tojoin$143, punc$144) {
        return _$5.reduce(_$5.rest(tojoin$143, 1), function (acc$146, join$147) {
            if (punc$144 === ' ') {
                return acc$146.concat(join$147.match);
            }
            return acc$146.concat(mkSyntax(punc$144, parser$6.Token.Punctuator, _$5.first(join$147.match)), join$147.match);
        }, _$5.first(tojoin$143).match);
    }
    function joinSyntax(tojoin$149, punc$150) {
        if (tojoin$149.length === 0) {
            return [];
        }
        if (punc$150 === ' ') {
            return tojoin$149;
        }
        return _$5.reduce(_$5.rest(tojoin$149, 1), function (acc$152, join$153) {
            return acc$152.concat(mkSyntax(punc$150, parser$6.Token.Punctuator, join$153), join$153);
        }, [_$5.first(tojoin$149)]);
    }
    function joinSyntaxArr(tojoin$155, punc$156) {
        if (tojoin$155.length === 0) {
            return [];
        }
        if (punc$156 === ' ') {
            return _$5.flatten(tojoin$155, true);
        }
        return _$5.reduce(_$5.rest(tojoin$155, 1), function (acc$158, join$159) {
            return acc$158.concat(mkSyntax(punc$156, parser$6.Token.Punctuator, _$5.first(join$159)), join$159);
        }, _$5.first(tojoin$155));
    }
    function delimIsSeparator(delim$161) {
        return delim$161 && delim$161.token.type === parser$6.Token.Delimiter && delim$161.token.value === '()' && delim$161.token.inner.length === 1 && delim$161.token.inner[0].token.type !== parser$6.Token.Delimiter && !containsPatternVar$539(delim$161.token.inner);
    }
    function freeVarsInPattern(pattern$163) {
        var fv$167 = [];
        _$5.each(pattern$163, function (pat$165) {
            if (isPatternVar(pat$165.token)) {
                fv$167.push(pat$165.token.value);
            } else if (pat$165.token.type === parser$6.Token.Delimiter) {
                fv$167 = fv$167.concat(freeVarsInPattern(pat$165.token.inner));
            }
        });
        return fv$167;
    }
    function patternLength(patterns$168) {
        return _$5.reduce(patterns$168, function (acc$170, pat$171) {
            if (pat$171.token.type === parser$6.Token.Delimiter) {
                return acc$170 + 1 + patternLength(pat$171.token.inner);
            }
            return acc$170 + 1;
        }, 0);
    }
    function matchStx(value$173, stx$174) {
        return stx$174 && stx$174.token && stx$174.token.value === value$173;
    }
    function wrapDelim(towrap$176, delimSyntax$177) {
        parser$6.assert(delimSyntax$177.token.type === parser$6.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser$6.Token.Delimiter,
            value: delimSyntax$177.token.value,
            inner: towrap$176,
            range: delimSyntax$177.token.range,
            startLineNumber: delimSyntax$177.token.startLineNumber,
            lineStart: delimSyntax$177.token.lineStart
        }, delimSyntax$177.context);
    }
    function getParamIdentifiers(argSyntax$179) {
        parser$6.assert(argSyntax$179.token.type === parser$6.Token.Delimiter, 'expecting delimiter for function params');
        return _$5.filter(argSyntax$179.token.inner, function (stx$181) {
            return stx$181.token.value !== ',';
        });
    }
    function isFunctionStx(stx$183) {
        return stx$183 && stx$183.token.type === parser$6.Token.Keyword && stx$183.token.value === 'function';
    }
    function isVarStx(stx$185) {
        return stx$185 && stx$185.token.type === parser$6.Token.Keyword && stx$185.token.value === 'var';
    }
    function varNamesInAST(ast$187) {
        return _$5.map(ast$187, function (item$189) {
            return item$189.id.name;
        });
    }
    function getVarDeclIdentifiers(term$191) {
        parser$6.assert(term$191.hasPrototype(Block$548) && term$191.body.hasPrototype(Delimiter$557), 'expecting a Block');
        return _$5.reduce(term$191.body.delim.token.inner, function (acc$193, curr$194) {
            if (curr$194.hasPrototype(VariableStatement$567)) {
                return _$5.reduce(curr$194.decls, function (acc$196, decl$197) {
                    return acc$196.concat(decl$197.ident);
                }, acc$193);
            } else if (curr$194.hasPrototype(Block$548)) {
                return acc$193.concat(getVarDeclIdentifiers(curr$194));
            }
            return acc$193;
        }, []);
    }
    function replaceVarIdent(stx$199, orig$200, renamed$201) {
        if (stx$199 === orig$200) {
            return renamed$201;
        }
        return stx$199;
    }
    var TermTree$540 = {destruct: function () {
                return _$5.reduce(this.properties, _$5.bind(function (acc$204, prop$205) {
                    if (this[prop$205] && this[prop$205].hasPrototype(TermTree$540)) {
                        return acc$204.concat(this[prop$205].destruct());
                    } else if (this[prop$205]) {
                        return acc$204.concat(this[prop$205]);
                    } else {
                        return acc$204;
                    }
                }, this), []);
            }};
    var EOF$541 = TermTree$540.extend({
            properties: ['eof'],
            construct: function (e$207) {
                this.eof = e$207;
            }
        });
    var Statement$542 = TermTree$540.extend({construct: function () {
            }});
    var Expr$543 = TermTree$540.extend({construct: function () {
            }});
    var PrimaryExpression$544 = Expr$543.extend({construct: function () {
            }});
    var ThisExpression$545 = PrimaryExpression$544.extend({
            properties: ['this'],
            construct: function (that$212) {
                this.this = that$212;
            }
        });
    var Lit$546 = PrimaryExpression$544.extend({
            properties: ['lit'],
            construct: function (l$214) {
                this.lit = l$214;
            }
        });
    exports$4._test.PropertyAssignment = PropertyAssignment$547;
    var PropertyAssignment$547 = TermTree$540.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$216, assignment$217) {
                this.propName = propName$216;
                this.assignment = assignment$217;
            }
        });
    var Block$548 = PrimaryExpression$544.extend({
            properties: ['body'],
            construct: function (body$219) {
                this.body = body$219;
            }
        });
    var ArrayLiteral$549 = PrimaryExpression$544.extend({
            properties: ['array'],
            construct: function (ar$221) {
                this.array = ar$221;
            }
        });
    var ParenExpression$550 = PrimaryExpression$544.extend({
            properties: ['expr'],
            construct: function (expr$223) {
                this.expr = expr$223;
            }
        });
    var UnaryOp$551 = Expr$543.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$225, expr$226) {
                this.op = op$225;
                this.expr = expr$226;
            }
        });
    var PostfixOp$552 = Expr$543.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$228, op$229) {
                this.expr = expr$228;
                this.op = op$229;
            }
        });
    var BinOp$553 = Expr$543.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$231, left$232, right$233) {
                this.op = op$231;
                this.left = left$232;
                this.right = right$233;
            }
        });
    var ConditionalExpression$554 = Expr$543.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$235, question$236, tru$237, colon$238, fls$239) {
                this.cond = cond$235;
                this.question = question$236;
                this.tru = tru$237;
                this.colon = colon$238;
                this.fls = fls$239;
            }
        });
    var Keyword$555 = TermTree$540.extend({
            properties: ['keyword'],
            construct: function (k$241) {
                this.keyword = k$241;
            }
        });
    var Punc$556 = TermTree$540.extend({
            properties: ['punc'],
            construct: function (p$243) {
                this.punc = p$243;
            }
        });
    var Delimiter$557 = TermTree$540.extend({
            properties: ['delim'],
            destruct: function () {
                parser$6.assert(this.delim, 'expecting delim to be defined');
                var openParen$249 = syntaxFromToken({
                        type: parser$6.Token.Punctuator,
                        value: this.delim.token.value[0],
                        range: this.delim.token.startRange,
                        lineNumber: this.delim.token.startLineNumber,
                        lineStart: this.delim.token.startLineStart
                    });
                var closeParen$250 = syntaxFromToken({
                        type: parser$6.Token.Punctuator,
                        value: this.delim.token.value[1],
                        range: this.delim.token.endRange,
                        lineNumber: this.delim.token.endLineNumber,
                        lineStart: this.delim.token.endLineStart
                    });
                var innerStx$251 = _$5.reduce(this.delim.token.inner, function (acc$246, term$247) {
                        if (term$247.hasPrototype(TermTree$540)) {
                            return acc$246.concat(term$247.destruct());
                        } else {
                            return acc$246.concat(term$247);
                        }
                    }, []);
                return [openParen$249].concat(innerStx$251).concat(closeParen$250);
            },
            construct: function (d$252) {
                this.delim = d$252;
            }
        });
    var Id$558 = PrimaryExpression$544.extend({
            properties: ['id'],
            construct: function (id$254) {
                this.id = id$254;
            }
        });
    var NamedFun$559 = Expr$543.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$256, name$257, params$258, body$259) {
                this.keyword = keyword$256;
                this.name = name$257;
                this.params = params$258;
                this.body = body$259;
            }
        });
    var AnonFun$560 = Expr$543.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$261, params$262, body$263) {
                this.keyword = keyword$261;
                this.params = params$262;
                this.body = body$263;
            }
        });
    var Macro$561 = TermTree$540.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$265, body$266) {
                this.name = name$265;
                this.body = body$266;
            }
        });
    var Const$562 = Expr$543.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$268, call$269) {
                this.newterm = newterm$268;
                this.call = call$269;
            }
        });
    var Call$563 = Expr$543.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$6.assert(this.fun.hasPrototype(TermTree$540), 'expecting a term tree in destruct of call');
                var that$276 = this;
                this.delim = syntaxFromToken(_$5.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$5.reduce(this.args, function (acc$272, term$273) {
                    parser$6.assert(term$273 && term$273.hasPrototype(TermTree$540), 'expecting term trees in destruct of Call');
                    var dst$275 = acc$272.concat(term$273.destruct());
                    if (that$276.commas.length > 0) {
                        dst$275 = dst$275.concat(that$276.commas.shift());
                    }
                    return dst$275;
                }, []);
                return this.fun.destruct().concat(Delimiter$557.create(this.delim).destruct());
            },
            construct: function (fun$277, args$278, delim$279, commas$280) {
                parser$6.assert(Array.isArray(args$278), 'requires an array of arguments terms');
                this.fun = fun$277;
                this.args = args$278;
                this.delim = delim$279;
                this.commas = commas$280;
            }
        });
    var ObjDotGet$564 = Expr$543.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$282, dot$283, right$284) {
                this.left = left$282;
                this.dot = dot$283;
                this.right = right$284;
            }
        });
    var ObjGet$565 = Expr$543.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$286, right$287) {
                this.left = left$286;
                this.right = right$287;
            }
        });
    var VariableDeclaration$566 = TermTree$540.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$289, eqstx$290, init$291, comma$292) {
                this.ident = ident$289;
                this.eqstx = eqstx$290;
                this.init = init$291;
                this.comma = comma$292;
            }
        });
    var VariableStatement$567 = Statement$542.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$5.reduce(this.decls, function (acc$295, decl$296) {
                    return acc$295.concat(decl$296.destruct());
                }, []));
            },
            construct: function (varkw$298, decls$299) {
                parser$6.assert(Array.isArray(decls$299), 'decls must be an array');
                this.varkw = varkw$298;
                this.decls = decls$299;
            }
        });
    function stxIsUnaryOp(stx$301) {
        var staticOperators$303 = [
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
        return _$5.contains(staticOperators$303, stx$301.token.value);
    }
    function stxIsBinOp(stx$304) {
        var staticOperators$306 = [
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
        return _$5.contains(staticOperators$306, stx$304.token.value);
    }
    function enforestVarStatement(stx$307, env$308) {
        parser$6.assert(stx$307[0] && stx$307[0].token.type === parser$6.Token.Identifier, 'must start at the identifier');
        var decls$310 = [], rest$311 = stx$307, initRes$312, subRes$313;
        if (stx$307[1] && stx$307[1].token.type === parser$6.Token.Punctuator && stx$307[1].token.value === '=') {
            initRes$312 = enforest(stx$307.slice(2), env$308);
            if (initRes$312.result.hasPrototype(Expr$543)) {
                rest$311 = initRes$312.rest;
                if (initRes$312.rest[0].token.type === parser$6.Token.Punctuator && initRes$312.rest[0].token.value === ',' && initRes$312.rest[1] && initRes$312.rest[1].token.type === parser$6.Token.Identifier) {
                    decls$310.push(VariableDeclaration$566.create(stx$307[0], stx$307[1], initRes$312.result, initRes$312.rest[0]));
                    subRes$313 = enforestVarStatement(initRes$312.rest.slice(1), env$308);
                    decls$310 = decls$310.concat(subRes$313.result);
                    rest$311 = subRes$313.rest;
                } else {
                    decls$310.push(VariableDeclaration$566.create(stx$307[0], stx$307[1], initRes$312.result));
                }
            } else {
                parser$6.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$307[1] && stx$307[1].token.type === parser$6.Token.Punctuator && stx$307[1].token.value === ',') {
            decls$310.push(VariableDeclaration$566.create(stx$307[0], null, null, stx$307[1]));
            subRes$313 = enforestVarStatement(stx$307.slice(2), env$308);
            decls$310 = decls$310.concat(subRes$313.result);
            rest$311 = subRes$313.rest;
        } else {
            decls$310.push(VariableDeclaration$566.create(stx$307[0]));
            rest$311 = stx$307.slice(1);
        }
        return {
            result: decls$310,
            rest: rest$311
        };
    }
    function enforest(toks$314, env$315) {
        env$315 = env$315 || new Map();
        parser$6.assert(toks$314.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$317, rest$318) {
            var innerTokens$322;
            parser$6.assert(Array.isArray(rest$318), 'result must at least be an empty array');
            if (head$317.hasPrototype(TermTree$540)) {
                if (head$317.hasPrototype(Expr$543) && rest$318[0] && rest$318[0].token.type === parser$6.Token.Delimiter && rest$318[0].token.value === '()') {
                    var argRes$323, enforestedArgs$324 = [], commas$325 = [];
                    innerTokens$322 = rest$318[0].token.inner;
                    while (innerTokens$322.length > 0) {
                        argRes$323 = enforest(innerTokens$322, env$315);
                        enforestedArgs$324.push(argRes$323.result);
                        innerTokens$322 = argRes$323.rest;
                        if (innerTokens$322[0] && innerTokens$322[0].token.value === ',') {
                            commas$325.push(innerTokens$322[0]);
                            innerTokens$322 = innerTokens$322.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$326 = _$5.all(enforestedArgs$324, function (argTerm$320) {
                            return argTerm$320.hasPrototype(Expr$543);
                        });
                    if (innerTokens$322.length === 0 && argsAreExprs$326) {
                        return step(Call$563.create(head$317, enforestedArgs$324, rest$318[0], commas$325), rest$318.slice(1));
                    }
                } else if (head$317.hasPrototype(Keyword$555) && head$317.keyword.token.value === 'new' && rest$318[0]) {
                    var newCallRes$327 = enforest(rest$318, env$315);
                    if (newCallRes$327.result.hasPrototype(Call$563)) {
                        return step(Const$562.create(head$317, newCallRes$327.result), newCallRes$327.rest);
                    }
                } else if (head$317.hasPrototype(Expr$543) && rest$318[0] && rest$318[0].token.value === '?') {
                    var question$328 = rest$318[0];
                    var condRes$329 = enforest(rest$318.slice(1), env$315);
                    var truExpr$330 = condRes$329.result;
                    var right$331 = condRes$329.rest;
                    if (truExpr$330.hasPrototype(Expr$543) && right$331[0] && right$331[0].token.value === ':') {
                        var colon$332 = right$331[0];
                        var flsRes$333 = enforest(right$331.slice(1), env$315);
                        var flsExpr$334 = flsRes$333.result;
                        if (flsExpr$334.hasPrototype(Expr$543)) {
                            return step(ConditionalExpression$554.create(head$317, question$328, truExpr$330, colon$332, flsExpr$334), flsRes$333.rest);
                        }
                    }
                } else if (head$317.hasPrototype(Delimiter$557) && head$317.delim.token.value === '()') {
                    innerTokens$322 = head$317.delim.token.inner;
                    if (innerTokens$322.length === 0) {
                        return step(ParenExpression$550.create(head$317), rest$318);
                    } else {
                        var innerTerm$335 = get_expression(innerTokens$322, env$315);
                        if (innerTerm$335.result && innerTerm$335.result.hasPrototype(Expr$543)) {
                            return step(ParenExpression$550.create(head$317), rest$318);
                        }
                    }
                } else if (rest$318[0] && rest$318[1] && stxIsBinOp(rest$318[0])) {
                    var op$336 = rest$318[0];
                    var left$337 = head$317;
                    var bopRes$338 = enforest(rest$318.slice(1), env$315);
                    var right$331 = bopRes$338.result;
                    if (right$331.hasPrototype(Expr$543)) {
                        return step(BinOp$553.create(op$336, left$337, right$331), bopRes$338.rest);
                    }
                } else if (head$317.hasPrototype(Punc$556) && stxIsUnaryOp(head$317.punc) || head$317.hasPrototype(Keyword$555) && stxIsUnaryOp(head$317.keyword)) {
                    var unopRes$339 = enforest(rest$318);
                    var op$336 = head$317.hasPrototype(Punc$556) ? head$317.punc : head$317.keyword;
                    if (unopRes$339.result.hasPrototype(Expr$543)) {
                        return step(UnaryOp$551.create(op$336, unopRes$339.result), unopRes$339.rest);
                    }
                } else if (head$317.hasPrototype(Expr$543) && rest$318[0] && (rest$318[0].token.value === '++' || rest$318[0].token.value === '--')) {
                    return step(PostfixOp$552.create(head$317, rest$318[0]), rest$318.slice(1));
                } else if (head$317.hasPrototype(Expr$543) && rest$318[0] && rest$318[0].token.value === '[]') {
                    var getRes$340 = enforest(rest$318[0].token.inner, env$315);
                    var resStx$341 = mkSyntax('[]', parser$6.Token.Delimiter, rest$318[0]);
                    resStx$341.token.inner = [getRes$340.result];
                    if (getRes$340.rest.length > 0) {
                        return step(ObjGet$565.create(head$317, Delimiter$557.create(resStx$341)), rest$318.slice(1));
                    }
                } else if (head$317.hasPrototype(Expr$543) && rest$318[0] && rest$318[0].token.value === '.' && rest$318[1] && rest$318[1].token.type === parser$6.Token.Identifier) {
                    return step(ObjDotGet$564.create(head$317, rest$318[0], rest$318[1]), rest$318.slice(2));
                } else if (head$317.hasPrototype(Delimiter$557) && head$317.delim.token.value === '[]') {
                    return step(ArrayLiteral$549.create(head$317), rest$318);
                } else if (head$317.hasPrototype(Delimiter$557) && head$317.delim.token.value === '{}') {
                    innerTokens$322 = head$317.delim.token.inner;
                    return step(Block$548.create(head$317), rest$318);
                } else if (head$317.hasPrototype(Keyword$555) && head$317.keyword.token.value === 'var' && rest$318[0] && rest$318[0].token.type === parser$6.Token.Identifier) {
                    var vsRes$342 = enforestVarStatement(rest$318, env$315);
                    if (vsRes$342) {
                        return step(VariableStatement$567.create(head$317, vsRes$342.result), vsRes$342.rest);
                    }
                }
            } else {
                parser$6.assert(head$317 && head$317.token, 'assuming head is a syntax object');
                if ((head$317.token.type === parser$6.Token.Identifier || head$317.token.type === parser$6.Token.Keyword) && env$315.has(head$317.token.value)) {
                    var transformer$343 = env$315.get(head$317.token.value);
                    var rt$344 = transformer$343(rest$318, head$317, env$315);
                    return step(rt$344.result[0], rt$344.result.slice(1).concat(rt$344.rest));
                } else if (head$317.token.type === parser$6.Token.Identifier && head$317.token.value === 'macro' && rest$318[0] && (rest$318[0].token.type === parser$6.Token.Identifier || rest$318[0].token.type === parser$6.Token.Keyword) && rest$318[1] && rest$318[1].token.type === parser$6.Token.Delimiter && rest$318[1].token.value === '{}') {
                    return step(Macro$561.create(rest$318[0], rest$318[1].token.inner), rest$318.slice(2));
                } else if (head$317.token.type === parser$6.Token.Keyword && head$317.token.value === 'function' && rest$318[0] && rest$318[0].token.type === parser$6.Token.Identifier && rest$318[1] && rest$318[1].token.type === parser$6.Token.Delimiter && rest$318[1].token.value === '()' && rest$318[2] && rest$318[2].token.type === parser$6.Token.Delimiter && rest$318[2].token.value === '{}') {
                    return step(NamedFun$559.create(head$317, rest$318[0], rest$318[1], rest$318[2]), rest$318.slice(3));
                } else if (head$317.token.type === parser$6.Token.Keyword && head$317.token.value === 'function' && rest$318[0] && rest$318[0].token.type === parser$6.Token.Delimiter && rest$318[0].token.value === '()' && rest$318[1] && rest$318[1].token.type === parser$6.Token.Delimiter && rest$318[1].token.value === '{}') {
                    return step(AnonFun$560.create(head$317, rest$318[0], rest$318[1]), rest$318.slice(2));
                } else if (head$317.token.type === parser$6.Token.Keyword && head$317.token.value === 'this') {
                    return step(ThisExpression$545.create(head$317), rest$318);
                } else if (head$317.token.type === parser$6.Token.NumericLiteral || head$317.token.type === parser$6.Token.StringLiteral || head$317.token.type === parser$6.Token.BooleanLiteral || head$317.token.type === parser$6.Token.RegexLiteral || head$317.token.type === parser$6.Token.NullLiteral) {
                    return step(Lit$546.create(head$317), rest$318);
                } else if (head$317.token.type === parser$6.Token.Identifier) {
                    return step(Id$558.create(head$317), rest$318);
                } else if (head$317.token.type === parser$6.Token.Punctuator) {
                    return step(Punc$556.create(head$317), rest$318);
                } else if (head$317.token.type === parser$6.Token.Keyword && head$317.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$317.token.type === parser$6.Token.Keyword) {
                    return step(Keyword$555.create(head$317), rest$318);
                } else if (head$317.token.type === parser$6.Token.Delimiter) {
                    return step(Delimiter$557.create(head$317), rest$318);
                } else if (head$317.token.type === parser$6.Token.EOF) {
                    parser$6.assert(rest$318.length === 0, 'nothing should be after an EOF');
                    return step(EOF$541.create(head$317), []);
                } else {
                    parser$6.assert(false, 'not implemented');
                }
            }
            return {
                result: head$317,
                rest: rest$318
            };
        }
        return step(toks$314[0], toks$314.slice(1));
    }
    function get_expression(stx$345, env$346) {
        var res$348 = enforest(stx$345, env$346);
        if (!res$348.result.hasPrototype(Expr$543)) {
            return {
                result: null,
                rest: stx$345
            };
        }
        return res$348;
    }
    function typeIsLiteral(type$349) {
        return type$349 === parser$6.Token.NullLiteral || type$349 === parser$6.Token.NumericLiteral || type$349 === parser$6.Token.StringLiteral || type$349 === parser$6.Token.RegexLiteral || type$349 === parser$6.Token.BooleanLiteral;
    }
    exports$4._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$351, stx$352, env$353) {
        var result$355, rest$356;
        if (patternClass$351 === 'token' && stx$352[0] && stx$352[0].token.type !== parser$6.Token.EOF) {
            result$355 = [stx$352[0]];
            rest$356 = stx$352.slice(1);
        } else if (patternClass$351 === 'lit' && stx$352[0] && typeIsLiteral(stx$352[0].token.type)) {
            result$355 = [stx$352[0]];
            rest$356 = stx$352.slice(1);
        } else if (patternClass$351 === 'ident' && stx$352[0] && stx$352[0].token.type === parser$6.Token.Identifier) {
            result$355 = [stx$352[0]];
            rest$356 = stx$352.slice(1);
        } else if (patternClass$351 === 'VariableStatement') {
            var match$357 = enforest(stx$352, env$353);
            if (match$357.result && match$357.result.hasPrototype(VariableStatement$567)) {
                result$355 = match$357.result.destruct();
                rest$356 = match$357.rest;
            } else {
                result$355 = null;
                rest$356 = stx$352;
            }
        } else if (patternClass$351 === 'expr') {
            var match$357 = get_expression(stx$352, env$353);
            if (match$357.result === null || !match$357.result.hasPrototype(Expr$543)) {
                result$355 = null;
                rest$356 = stx$352;
            } else {
                result$355 = match$357.result.destruct();
                rest$356 = match$357.rest;
            }
        } else {
            result$355 = null;
            rest$356 = stx$352;
        }
        return {
            result: result$355,
            rest: rest$356
        };
    }
    function matchPattern(pattern$358, stx$359, env$360, patternEnv$361) {
        var subMatch$366;
        var match$367, matchEnv$368;
        var rest$369;
        var success$370;
        if (stx$359.length === 0) {
            return {
                success: false,
                rest: stx$359,
                patternEnv: patternEnv$361
            };
        }
        parser$6.assert(stx$359.length > 0, 'should have had something to match here');
        if (pattern$358.token.type === parser$6.Token.Delimiter) {
            if (pattern$358.class === 'pattern_group') {
                subMatch$366 = matchPatterns(pattern$358.token.inner, stx$359, env$360, false);
                rest$369 = subMatch$366.rest;
            } else if (stx$359[0].token.type === parser$6.Token.Delimiter && stx$359[0].token.value === pattern$358.token.value) {
                subMatch$366 = matchPatterns(pattern$358.token.inner, stx$359[0].token.inner, env$360, false);
                rest$369 = stx$359.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$359,
                    patternEnv: patternEnv$361
                };
            }
            success$370 = subMatch$366.success;
            _$5.keys(subMatch$366.patternEnv).forEach(function (patternKey$363) {
                if (pattern$358.repeat) {
                    var nextLevel$365 = subMatch$366.patternEnv[patternKey$363].level + 1;
                    if (patternEnv$361[patternKey$363]) {
                        patternEnv$361[patternKey$363].level = nextLevel$365;
                        patternEnv$361[patternKey$363].match.push(subMatch$366.patternEnv[patternKey$363]);
                    } else {
                        patternEnv$361[patternKey$363] = {
                            level: nextLevel$365,
                            match: [subMatch$366.patternEnv[patternKey$363]]
                        };
                    }
                } else {
                    patternEnv$361[patternKey$363] = subMatch$366.patternEnv[patternKey$363];
                }
            });
        } else {
            if (pattern$358.class === 'pattern_literal') {
                if (pattern$358.token.value === stx$359[0].token.value) {
                    success$370 = true;
                    rest$369 = stx$359.slice(1);
                } else {
                    success$370 = false;
                    rest$369 = stx$359;
                }
            } else {
                match$367 = matchPatternClass(pattern$358.class, stx$359, env$360);
                success$370 = match$367.result !== null;
                rest$369 = match$367.rest;
                matchEnv$368 = {
                    level: 0,
                    match: match$367.result
                };
                if (match$367.result !== null) {
                    if (pattern$358.repeat) {
                        if (patternEnv$361[pattern$358.token.value]) {
                            patternEnv$361[pattern$358.token.value].match.push(matchEnv$368);
                        } else {
                            patternEnv$361[pattern$358.token.value] = {
                                level: 1,
                                match: [matchEnv$368]
                            };
                        }
                    } else {
                        patternEnv$361[pattern$358.token.value] = matchEnv$368;
                    }
                }
            }
        }
        return {
            success: success$370,
            rest: rest$369,
            patternEnv: patternEnv$361
        };
    }
    function matchPatterns(patterns$371, stx$372, env$373, topLevel$374) {
        topLevel$374 = topLevel$374 || false;
        var result$376 = [];
        var patternEnv$377 = {};
        var match$378;
        var pattern$379;
        var rest$380 = stx$372;
        var success$381 = true;
        for (var i = 0; i < patterns$371.length; i++) {
            pattern$379 = patterns$371[i];
            do {
                match$378 = matchPattern(pattern$379, rest$380, env$373, patternEnv$377);
                if (!match$378.success) {
                    success$381 = false;
                }
                rest$380 = match$378.rest;
                patternEnv$377 = match$378.patternEnv;
                if (pattern$379.repeat && success$381) {
                    if (rest$380[0] && rest$380[0].token.value === pattern$379.separator) {
                        rest$380 = rest$380.slice(1);
                    } else if (pattern$379.separator === ' ') {
                        continue;
                    } else if (pattern$379.separator !== ' ' && rest$380.length > 0 && i === patterns$371.length - 1 && topLevel$374 === false) {
                        success$381 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$379.repeat && match$378.success && rest$380.length > 0);
        }
        return {
            success: success$381,
            rest: rest$380,
            patternEnv: patternEnv$377
        };
    }
    function transcribe(macroBody$382, macroNameStx$383, env$384) {
        return _$5.chain(macroBody$382).reduce(function (acc$386, bodyStx$387, idx$388, original$389) {
            var last$391 = original$389[idx$388 - 1];
            var next$392 = original$389[idx$388 + 1];
            var nextNext$393 = original$389[idx$388 + 2];
            if (bodyStx$387.token.value === '...') {
                return acc$386;
            }
            if (delimIsSeparator(bodyStx$387) && next$392 && next$392.token.value === '...') {
                return acc$386;
            }
            if (bodyStx$387.token.value === '$' && next$392 && next$392.token.type === parser$6.Token.Delimiter && next$392.token.value === '()') {
                return acc$386;
            }
            if (bodyStx$387.token.value === '$' && next$392 && next$392.token.type === parser$6.Token.Delimiter && next$392.token.value === '[]') {
                next$392.literal = true;
                return acc$386;
            }
            if (bodyStx$387.token.type === parser$6.Token.Delimiter && bodyStx$387.token.value === '()' && last$391 && last$391.token.value === '$') {
                bodyStx$387.group = true;
            }
            if (bodyStx$387.literal === true) {
                parser$6.assert(bodyStx$387.token.type === parser$6.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$386.concat(bodyStx$387.token.inner);
            }
            if (next$392 && next$392.token.value === '...') {
                bodyStx$387.repeat = true;
                bodyStx$387.separator = ' ';
            } else if (delimIsSeparator(next$392) && nextNext$393 && nextNext$393.token.value === '...') {
                bodyStx$387.repeat = true;
                bodyStx$387.separator = next$392.token.inner[0].token.value;
            }
            return acc$386.concat(bodyStx$387);
        }, []).reduce(function (acc$394, bodyStx$395, idx$396) {
            if (bodyStx$395.repeat) {
                if (bodyStx$395.token.type === parser$6.Token.Delimiter) {
                    var fv$412 = _$5.filter(freeVarsInPattern(bodyStx$395.token.inner), function (pat$398) {
                            return env$384.hasOwnProperty(pat$398);
                        });
                    var restrictedEnv$413 = [];
                    var nonScalar$414 = _$5.find(fv$412, function (pat$400) {
                            return env$384[pat$400].level > 0;
                        });
                    parser$6.assert(typeof nonScalar$414 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$415 = env$384[nonScalar$414].match.length;
                    var sameLength$416 = _$5.all(fv$412, function (pat$402) {
                            return env$384[pat$402].level === 0 || env$384[pat$402].match.length === repeatLength$415;
                        });
                    parser$6.assert(sameLength$416, 'all non-scalars must have the same length');
                    restrictedEnv$413 = _$5.map(_$5.range(repeatLength$415), function (idx$404) {
                        var renv$408 = {};
                        _$5.each(fv$412, function (pat$406) {
                            if (env$384[pat$406].level === 0) {
                                renv$408[pat$406] = env$384[pat$406];
                            } else {
                                renv$408[pat$406] = env$384[pat$406].match[idx$404];
                            }
                        });
                        return renv$408;
                    });
                    var transcribed$417 = _$5.map(restrictedEnv$413, function (renv$409) {
                            if (bodyStx$395.group) {
                                return transcribe(bodyStx$395.token.inner, macroNameStx$383, renv$409);
                            } else {
                                var newBody$411 = syntaxFromToken(_$5.clone(bodyStx$395.token), bodyStx$395.context);
                                newBody$411.token.inner = transcribe(bodyStx$395.token.inner, macroNameStx$383, renv$409);
                                return newBody$411;
                            }
                        });
                    var joined$418;
                    if (bodyStx$395.group) {
                        joined$418 = joinSyntaxArr(transcribed$417, bodyStx$395.separator);
                    } else {
                        joined$418 = joinSyntax(transcribed$417, bodyStx$395.separator);
                    }
                    return acc$394.concat(joined$418);
                }
                parser$6.assert(env$384[bodyStx$395.token.value].level === 1, 'ellipses level does not match');
                return acc$394.concat(joinRepeatedMatch(env$384[bodyStx$395.token.value].match, bodyStx$395.separator));
            } else {
                if (bodyStx$395.token.type === parser$6.Token.Delimiter) {
                    var newBody$419 = syntaxFromToken(_$5.clone(bodyStx$395.token), macroBody$382.context);
                    newBody$419.token.inner = transcribe(bodyStx$395.token.inner, macroNameStx$383, env$384);
                    return acc$394.concat(newBody$419);
                }
                if (Object.prototype.hasOwnProperty.bind(env$384)(bodyStx$395.token.value)) {
                    parser$6.assert(env$384[bodyStx$395.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$395.token.value);
                    return acc$394.concat(takeLineContext(macroNameStx$383, env$384[bodyStx$395.token.value].match));
                }
                return acc$394.concat(takeLineContext(macroNameStx$383, [bodyStx$395]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$420, env$421) {
        function dfs(match$423) {
            if (match$423.level === 0) {
                match$423.match = _$5.map(match$423.match, function (stx$425) {
                    return stx$425.mark(newMark$420);
                });
            } else {
                _$5.each(match$423.match, function (match$427) {
                    dfs(match$427);
                });
            }
        }
        _$5.keys(env$421).forEach(function (key$429) {
            dfs(env$421[key$429]);
        });
    }
    function makeTransformer(cases$431, macroName$432) {
        var sortedCases$447 = _$5.sortBy(cases$431, function (mcase$434) {
                return patternLength(mcase$434.pattern);
            }).reverse();
        return function transformer(stx$436, macroNameStx$437, env$438) {
            var match$442;
            var casePattern$443, caseBody$444;
            var newMark$445;
            var macroResult$446;
            for (var i = 0; i < sortedCases$447.length; i++) {
                casePattern$443 = sortedCases$447[i].pattern;
                caseBody$444 = sortedCases$447[i].body;
                match$442 = matchPatterns(casePattern$443, stx$436, env$438, true);
                if (match$442.success) {
                    newMark$445 = fresh();
                    applyMarkToPatternEnv(newMark$445, match$442.patternEnv);
                    macroResult$446 = transcribe(caseBody$444, macroNameStx$437, match$442.patternEnv);
                    macroResult$446 = _$5.map(macroResult$446, function (stx$440) {
                        return stx$440.mark(newMark$445);
                    });
                    return {
                        result: macroResult$446,
                        rest: match$442.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$437.token.value);
        };
    }
    function findCase(start$448, stx$449) {
        parser$6.assert(start$448 >= 0 && start$448 < stx$449.length, 'start out of bounds');
        var idx$451 = start$448;
        while (idx$451 < stx$449.length) {
            if (stx$449[idx$451].token.value === 'case') {
                return idx$451;
            }
            idx$451++;
        }
        return -1;
    }
    function findCaseArrow(start$452, stx$453) {
        parser$6.assert(start$452 >= 0 && start$452 < stx$453.length, 'start out of bounds');
        var idx$455 = start$452;
        while (idx$455 < stx$453.length) {
            if (stx$453[idx$455].token.value === '=' && stx$453[idx$455 + 1] && stx$453[idx$455 + 1].token.value === '>') {
                return idx$455;
            }
            idx$455++;
        }
        return -1;
    }
    function loadMacroDef(mac$456) {
        var body$458 = mac$456.body;
        var caseOffset$459 = 0;
        var arrowOffset$460 = 0;
        var casePattern$461;
        var caseBody$462;
        var caseBodyIdx$463;
        var cases$464 = [];
        while (caseOffset$459 < body$458.length && body$458[caseOffset$459].token.value === 'case') {
            arrowOffset$460 = findCaseArrow(caseOffset$459, body$458);
            if (arrowOffset$460 > 0 && arrowOffset$460 < body$458.length) {
                caseBodyIdx$463 = arrowOffset$460 + 2;
                if (caseBodyIdx$463 >= body$458.length) {
                    throwError('case body missing in macro definition');
                }
                casePattern$461 = body$458.slice(caseOffset$459 + 1, arrowOffset$460);
                caseBody$462 = body$458[caseBodyIdx$463].token.inner;
                cases$464.push({
                    pattern: loadPattern(casePattern$461, mac$456.name),
                    body: caseBody$462
                });
            } else {
                throwError('case body missing in macro definition');
            }
            caseOffset$459 = findCase(arrowOffset$460, body$458);
            if (caseOffset$459 < 0) {
                break;
            }
        }
        return makeTransformer(cases$464);
    }
    function expandToTermTree(stx$465, env$466) {
        parser$6.assert(env$466, 'environment map is required');
        if (stx$465.length === 0) {
            return {
                terms: [],
                env: env$466
            };
        }
        parser$6.assert(stx$465[0].token, 'expecting a syntax object');
        var f$468 = enforest(stx$465, env$466);
        var head$469 = f$468.result;
        var rest$470 = f$468.rest;
        if (head$469.hasPrototype(Macro$561)) {
            var macroDefinition$471 = loadMacroDef(head$469);
            env$466.set(head$469.name.token.value, macroDefinition$471);
            return expandToTermTree(rest$470, env$466);
        }
        var trees$472 = expandToTermTree(rest$470, env$466);
        return {
            terms: [head$469].concat(trees$472.terms),
            env: trees$472.env
        };
    }
    function expandTermTreeToFinal(term$473, env$474, ctx$475) {
        parser$6.assert(env$474, 'environment map is required');
        parser$6.assert(ctx$475, 'context map is required');
        if (term$473.hasPrototype(ArrayLiteral$549)) {
            term$473.array.delim.token.inner = expand(term$473.array.delim.token.inner, env$474);
            return term$473;
        } else if (term$473.hasPrototype(Block$548)) {
            term$473.body.delim.token.inner = expand(term$473.body.delim.token.inner, env$474);
            return term$473;
        } else if (term$473.hasPrototype(ParenExpression$550)) {
            term$473.expr.delim.token.inner = expand(term$473.expr.delim.token.inner, env$474, ctx$475);
            return term$473;
        } else if (term$473.hasPrototype(Call$563)) {
            term$473.fun = expandTermTreeToFinal(term$473.fun, env$474, ctx$475);
            term$473.args = _$5.map(term$473.args, function (arg$477) {
                return expandTermTreeToFinal(arg$477, env$474, ctx$475);
            });
            return term$473;
        } else if (term$473.hasPrototype(UnaryOp$551)) {
            term$473.expr = expandTermTreeToFinal(term$473.expr, env$474, ctx$475);
            return term$473;
        } else if (term$473.hasPrototype(BinOp$553)) {
            term$473.left = expandTermTreeToFinal(term$473.left, env$474, ctx$475);
            term$473.right = expandTermTreeToFinal(term$473.right, env$474, ctx$475);
            return term$473;
        } else if (term$473.hasPrototype(ObjDotGet$564)) {
            term$473.left = expandTermTreeToFinal(term$473.left, env$474, ctx$475);
            term$473.right = expandTermTreeToFinal(term$473.right, env$474, ctx$475);
            return term$473;
        } else if (term$473.hasPrototype(VariableDeclaration$566)) {
            if (term$473.init) {
                term$473.init = expandTermTreeToFinal(term$473.init, env$474, ctx$475);
            }
            return term$473;
        } else if (term$473.hasPrototype(VariableStatement$567)) {
            term$473.decls = _$5.map(term$473.decls, function (decl$479) {
                return expandTermTreeToFinal(decl$479, env$474, ctx$475);
            });
            return term$473;
        } else if (term$473.hasPrototype(Delimiter$557)) {
            term$473.delim.token.inner = expand(term$473.delim.token.inner, env$474);
            return term$473;
        } else if (term$473.hasPrototype(NamedFun$559) || term$473.hasPrototype(AnonFun$560)) {
            var paramNames$503 = _$5.map(getParamIdentifiers(term$473.params), function (param$481) {
                    var freshName$483 = fresh();
                    return {
                        freshName: freshName$483,
                        originalParam: param$481,
                        renamedParam: param$481.rename(param$481, freshName$483)
                    };
                });
            var newCtx$504 = ctx$475;
            var stxBody$505 = term$473.body;
            var renamedBody$506 = _$5.reduce(paramNames$503, function (accBody$484, p$485) {
                    return accBody$484.rename(p$485.originalParam, p$485.freshName);
                }, stxBody$505);
            var dummyName$507 = fresh();
            renamedBody$506 = renamedBody$506.push_dummy_rename(dummyName$507);
            var bodyTerms$508 = expand([renamedBody$506], env$474, newCtx$504);
            parser$6.assert(bodyTerms$508.length === 1 && bodyTerms$508[0].body, 'expecting a block in the bodyTerms');
            var varIdents$509 = getVarDeclIdentifiers(bodyTerms$508[0]);
            varIdents$509 = _$5.filter(varIdents$509, function (varId$487) {
                return !_$5.any(paramNames$503, function (p$489) {
                    return resolve(varId$487) === resolve(p$489.renamedParam);
                });
            });
            varIdents$509 = _$5.uniq(varIdents$509, false, function (v$491) {
                return resolve(v$491);
            });
            var varNames$510 = _$5.map(varIdents$509, function (ident$493) {
                    var freshName$495 = fresh();
                    return {
                        freshName: freshName$495,
                        dummyName: dummyName$507,
                        originalVar: ident$493,
                        renamedVar: ident$493.swap_dummy_rename([{
                                freshName: freshName$495,
                                originalVar: ident$493
                            }], dummyName$507)
                    };
                });
            var flattenedBody$511 = _$5.map(flatten(bodyTerms$508), function (stx$496) {
                    var isDecl$500;
                    if (stx$496.token.type === parser$6.Token.Identifier) {
                        isDecl$500 = _$5.find(varNames$510, function (v$498) {
                            return v$498.originalVar === stx$496;
                        });
                        if (isDecl$500) {
                            return isDecl$500.renamedVar;
                        }
                        return stx$496.swap_dummy_rename(varNames$510, dummyName$507);
                    }
                    return stx$496;
                });
            var renamedParams$512 = _$5.map(paramNames$503, function (p$501) {
                    return p$501.renamedParam;
                });
            var flatArgs$513 = wrapDelim(joinSyntax(renamedParams$512, ','), term$473.params);
            var expandedArgs$514 = expand([flatArgs$513], env$474, ctx$475);
            parser$6.assert(expandedArgs$514.length === 1, 'should only get back one result');
            term$473.params = expandedArgs$514[0];
            term$473.body = flattenedBody$511;
            return term$473;
        }
        return term$473;
    }
    function expand(stx$515, env$516, ctx$517) {
        env$516 = env$516 || new Map();
        ctx$517 = ctx$517 || new Map();
        var trees$521 = expandToTermTree(stx$515, env$516, ctx$517);
        return _$5.map(trees$521.terms, function (term$519) {
            return expandTermTreeToFinal(term$519, trees$521.env, ctx$517);
        });
    }
    function expandTopLevel(stx$522) {
        var fun$524 = syntaxFromToken({
                value: 'function',
                type: parser$6.Token.Keyword
            });
        var name$525 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$6.Token.Identifier
            });
        var params$526 = syntaxFromToken({
                value: '()',
                type: parser$6.Token.Delimiter,
                inner: []
            });
        var body$527 = syntaxFromToken({
                value: '{}',
                type: parser$6.Token.Delimiter,
                inner: stx$522
            });
        var res$528 = expand([
                fun$524,
                name$525,
                params$526,
                body$527
            ]);
        return res$528[0].body.slice(1, res$528[0].body.length - 1);
    }
    function flatten(terms$529) {
        return _$5.reduce(terms$529, function (acc$531, term$532) {
            return acc$531.concat(term$532.destruct());
        }, []);
    }
    exports$4.enforest = enforest;
    exports$4.expand = expandTopLevel;
    exports$4.resolve = resolve;
    exports$4.flatten = flatten;
    exports$4.tokensToSyntax = tokensToSyntax;
    exports$4.syntaxToTokens = syntaxToTokens;
}));