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
    var isMark$538 = function isMark$538(m$28) {
        return m$28 && typeof m$28.mark !== 'undefined';
    };
    function Rename(id$30, name$31, ctx$32) {
        return {
            id: id$30,
            name: name$31,
            context: ctx$32
        };
    }
    var isRename$539 = function (r$34) {
        return r$34 && typeof r$34.id !== 'undefined' && typeof r$34.name !== 'undefined';
    };
    function DummyRename(name$36, ctx$37) {
        return {
            dummy_name: name$36,
            context: ctx$37
        };
    }
    var isDummyRename$540 = function (r$39) {
        return r$39 && typeof r$39.dummy_name !== 'undefined';
    };
    var syntaxProto$541 = {
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
        if (isDummyRename$540(ctx$70) && ctx$70.dummy_name === dummyName$72) {
            return _$5.reduce(varNames$71, function (accCtx$74, v$75) {
                return Rename(v$75.originalVar, v$75.freshName, accCtx$74);
            }, ctx$70.context);
        }
        if (isDummyRename$540(ctx$70) && ctx$70.dummy_name !== dummyName$72) {
            return DummyRename(ctx$70.dummy_name, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        if (isMark$538(ctx$70)) {
            return Mark(ctx$70.mark, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        if (isRename$539(ctx$70)) {
            return Rename(ctx$70.id.swap_dummy_rename(varNames$71, dummyName$72), ctx$70.name, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        parser$6.assert(false, 'expecting a fixed set of context types');
    }
    function findDummyParent(ctx$77, dummyName$78) {
        if (ctx$77 === null || ctx$77.context === null) {
            return null;
        }
        if (isDummyRename$540(ctx$77.context) && ctx$77.context.dummy_name === dummyName$78) {
            return ctx$77;
        }
        return findDummyParent(ctx$77.context);
    }
    function syntaxFromToken(token$80, oldctx$81) {
        var ctx$83 = typeof oldctx$81 !== 'undefined' ? oldctx$81 : null;
        return Object.create(syntaxProto$541, {
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
        if (isMark$538(ctx$87)) {
            mark$90 = ctx$87.mark;
            submarks$91 = marksof(ctx$87.context, stopName$88);
            return remdup(mark$90, submarks$91);
        }
        if (isDummyRename$540(ctx$87)) {
            return marksof(ctx$87.context);
        }
        if (isRename$539(ctx$87)) {
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
        if (isMark$538(ctx$98) || isDummyRename$540(ctx$98)) {
            return resolveCtx(originalName$97, ctx$98.context);
        }
        if (isRename$539(ctx$98)) {
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
    var nextFresh$542 = 0;
    function fresh() {
        return nextFresh$542++;
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
    var containsPatternVar$543 = function (patterns$115) {
        return _$5.any(patterns$115, function (pat$117) {
            if (pat$117.token.type === parser$6.Token.Delimiter) {
                return containsPatternVar$543(pat$117.token.inner);
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
        return delim$161 && delim$161.token.type === parser$6.Token.Delimiter && delim$161.token.value === '()' && delim$161.token.inner.length === 1 && delim$161.token.inner[0].token.type !== parser$6.Token.Delimiter && !containsPatternVar$543(delim$161.token.inner);
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
        parser$6.assert(term$191.hasPrototype(Block$552) && term$191.body.hasPrototype(Delimiter$561), 'expecting a Block');
        return _$5.reduce(term$191.body.delim.token.inner, function (acc$193, curr$194) {
            if (curr$194.hasPrototype(VariableStatement$571)) {
                return _$5.reduce(curr$194.decls, function (acc$196, decl$197) {
                    return acc$196.concat(decl$197.ident);
                }, acc$193);
            } else if (curr$194.hasPrototype(Block$552)) {
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
    var TermTree$544 = {destruct: function (breakDelim$203) {
                return _$5.reduce(this.properties, _$5.bind(function (acc$205, prop$206) {
                    if (this[prop$206] && this[prop$206].hasPrototype(TermTree$544)) {
                        return acc$205.concat(this[prop$206].destruct(breakDelim$203));
                    } else if (this[prop$206]) {
                        return acc$205.concat(this[prop$206]);
                    } else {
                        return acc$205;
                    }
                }, this), []);
            }};
    var EOF$545 = TermTree$544.extend({
            properties: ['eof'],
            construct: function (e$208) {
                this.eof = e$208;
            }
        });
    var Statement$546 = TermTree$544.extend({construct: function () {
            }});
    var Expr$547 = TermTree$544.extend({construct: function () {
            }});
    var PrimaryExpression$548 = Expr$547.extend({construct: function () {
            }});
    var ThisExpression$549 = PrimaryExpression$548.extend({
            properties: ['this'],
            construct: function (that$213) {
                this.this = that$213;
            }
        });
    var Lit$550 = PrimaryExpression$548.extend({
            properties: ['lit'],
            construct: function (l$215) {
                this.lit = l$215;
            }
        });
    exports$4._test.PropertyAssignment = PropertyAssignment$551;
    var PropertyAssignment$551 = TermTree$544.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$217, assignment$218) {
                this.propName = propName$217;
                this.assignment = assignment$218;
            }
        });
    var Block$552 = PrimaryExpression$548.extend({
            properties: ['body'],
            construct: function (body$220) {
                this.body = body$220;
            }
        });
    var ArrayLiteral$553 = PrimaryExpression$548.extend({
            properties: ['array'],
            construct: function (ar$222) {
                this.array = ar$222;
            }
        });
    var ParenExpression$554 = PrimaryExpression$548.extend({
            properties: ['expr'],
            construct: function (expr$224) {
                this.expr = expr$224;
            }
        });
    var UnaryOp$555 = Expr$547.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$226, expr$227) {
                this.op = op$226;
                this.expr = expr$227;
            }
        });
    var PostfixOp$556 = Expr$547.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$229, op$230) {
                this.expr = expr$229;
                this.op = op$230;
            }
        });
    var BinOp$557 = Expr$547.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$232, left$233, right$234) {
                this.op = op$232;
                this.left = left$233;
                this.right = right$234;
            }
        });
    var ConditionalExpression$558 = Expr$547.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$236, question$237, tru$238, colon$239, fls$240) {
                this.cond = cond$236;
                this.question = question$237;
                this.tru = tru$238;
                this.colon = colon$239;
                this.fls = fls$240;
            }
        });
    var Keyword$559 = TermTree$544.extend({
            properties: ['keyword'],
            construct: function (k$242) {
                this.keyword = k$242;
            }
        });
    var Punc$560 = TermTree$544.extend({
            properties: ['punc'],
            construct: function (p$244) {
                this.punc = p$244;
            }
        });
    var Delimiter$561 = TermTree$544.extend({
            properties: ['delim'],
            destruct: function (breakDelim$246) {
                parser$6.assert(this.delim, 'expecting delim to be defined');
                var innerStx$251 = _$5.reduce(this.delim.token.inner, function (acc$248, term$249) {
                        if (term$249.hasPrototype(TermTree$544)) {
                            return acc$248.concat(term$249.destruct(breakDelim$246));
                        } else {
                            return acc$248.concat(term$249);
                        }
                    }, []);
                if (breakDelim$246) {
                    var openParen$252 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$253 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$252].concat(innerStx$251).concat(closeParen$253);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$254) {
                this.delim = d$254;
            }
        });
    var Id$562 = PrimaryExpression$548.extend({
            properties: ['id'],
            construct: function (id$256) {
                this.id = id$256;
            }
        });
    var NamedFun$563 = Expr$547.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$258, name$259, params$260, body$261) {
                this.keyword = keyword$258;
                this.name = name$259;
                this.params = params$260;
                this.body = body$261;
            }
        });
    var AnonFun$564 = Expr$547.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$263, params$264, body$265) {
                this.keyword = keyword$263;
                this.params = params$264;
                this.body = body$265;
            }
        });
    var Macro$565 = TermTree$544.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$267, body$268) {
                this.name = name$267;
                this.body = body$268;
            }
        });
    var Const$566 = Expr$547.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$270, call$271) {
                this.newterm = newterm$270;
                this.call = call$271;
            }
        });
    var Call$567 = Expr$547.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$273) {
                parser$6.assert(this.fun.hasPrototype(TermTree$544), 'expecting a term tree in destruct of call');
                var that$279 = this;
                this.delim = syntaxFromToken(_$5.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$5.reduce(this.args, function (acc$275, term$276) {
                    parser$6.assert(term$276 && term$276.hasPrototype(TermTree$544), 'expecting term trees in destruct of Call');
                    var dst$278 = acc$275.concat(term$276.destruct(breakDelim$273));
                    if (that$279.commas.length > 0) {
                        dst$278 = dst$278.concat(that$279.commas.shift());
                    }
                    return dst$278;
                }, []);
                return this.fun.destruct(breakDelim$273).concat(Delimiter$561.create(this.delim).destruct(breakDelim$273));
            },
            construct: function (fun$280, args$281, delim$282, commas$283) {
                parser$6.assert(Array.isArray(args$281), 'requires an array of arguments terms');
                this.fun = fun$280;
                this.args = args$281;
                this.delim = delim$282;
                this.commas = commas$283;
            }
        });
    var ObjDotGet$568 = Expr$547.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$285, dot$286, right$287) {
                this.left = left$285;
                this.dot = dot$286;
                this.right = right$287;
            }
        });
    var ObjGet$569 = Expr$547.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$289, right$290) {
                this.left = left$289;
                this.right = right$290;
            }
        });
    var VariableDeclaration$570 = TermTree$544.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$292, eqstx$293, init$294, comma$295) {
                this.ident = ident$292;
                this.eqstx = eqstx$293;
                this.init = init$294;
                this.comma = comma$295;
            }
        });
    var VariableStatement$571 = Statement$546.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$297) {
                return this.varkw.destruct(breakDelim$297).concat(_$5.reduce(this.decls, function (acc$299, decl$300) {
                    return acc$299.concat(decl$300.destruct(breakDelim$297));
                }, []));
            },
            construct: function (varkw$302, decls$303) {
                parser$6.assert(Array.isArray(decls$303), 'decls must be an array');
                this.varkw = varkw$302;
                this.decls = decls$303;
            }
        });
    function stxIsUnaryOp(stx$305) {
        var staticOperators$307 = [
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
        return _$5.contains(staticOperators$307, stx$305.token.value);
    }
    function stxIsBinOp(stx$308) {
        var staticOperators$310 = [
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
        return _$5.contains(staticOperators$310, stx$308.token.value);
    }
    function enforestVarStatement(stx$311, env$312) {
        parser$6.assert(stx$311[0] && stx$311[0].token.type === parser$6.Token.Identifier, 'must start at the identifier');
        var decls$314 = [], rest$315 = stx$311, initRes$316, subRes$317;
        if (stx$311[1] && stx$311[1].token.type === parser$6.Token.Punctuator && stx$311[1].token.value === '=') {
            initRes$316 = enforest(stx$311.slice(2), env$312);
            if (initRes$316.result.hasPrototype(Expr$547)) {
                rest$315 = initRes$316.rest;
                if (initRes$316.rest[0].token.type === parser$6.Token.Punctuator && initRes$316.rest[0].token.value === ',' && initRes$316.rest[1] && initRes$316.rest[1].token.type === parser$6.Token.Identifier) {
                    decls$314.push(VariableDeclaration$570.create(stx$311[0], stx$311[1], initRes$316.result, initRes$316.rest[0]));
                    subRes$317 = enforestVarStatement(initRes$316.rest.slice(1), env$312);
                    decls$314 = decls$314.concat(subRes$317.result);
                    rest$315 = subRes$317.rest;
                } else {
                    decls$314.push(VariableDeclaration$570.create(stx$311[0], stx$311[1], initRes$316.result));
                }
            } else {
                parser$6.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$311[1] && stx$311[1].token.type === parser$6.Token.Punctuator && stx$311[1].token.value === ',') {
            decls$314.push(VariableDeclaration$570.create(stx$311[0], null, null, stx$311[1]));
            subRes$317 = enforestVarStatement(stx$311.slice(2), env$312);
            decls$314 = decls$314.concat(subRes$317.result);
            rest$315 = subRes$317.rest;
        } else {
            decls$314.push(VariableDeclaration$570.create(stx$311[0]));
            rest$315 = stx$311.slice(1);
        }
        return {
            result: decls$314,
            rest: rest$315
        };
    }
    function enforest(toks$318, env$319) {
        env$319 = env$319 || new Map();
        parser$6.assert(toks$318.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$321, rest$322) {
            var innerTokens$326;
            parser$6.assert(Array.isArray(rest$322), 'result must at least be an empty array');
            if (head$321.hasPrototype(TermTree$544)) {
                if (head$321.hasPrototype(Expr$547) && rest$322[0] && rest$322[0].token.type === parser$6.Token.Delimiter && rest$322[0].token.value === '()') {
                    var argRes$327, enforestedArgs$328 = [], commas$329 = [];
                    innerTokens$326 = rest$322[0].token.inner;
                    while (innerTokens$326.length > 0) {
                        argRes$327 = enforest(innerTokens$326, env$319);
                        enforestedArgs$328.push(argRes$327.result);
                        innerTokens$326 = argRes$327.rest;
                        if (innerTokens$326[0] && innerTokens$326[0].token.value === ',') {
                            commas$329.push(innerTokens$326[0]);
                            innerTokens$326 = innerTokens$326.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$330 = _$5.all(enforestedArgs$328, function (argTerm$324) {
                            return argTerm$324.hasPrototype(Expr$547);
                        });
                    if (innerTokens$326.length === 0 && argsAreExprs$330) {
                        return step(Call$567.create(head$321, enforestedArgs$328, rest$322[0], commas$329), rest$322.slice(1));
                    }
                } else if (head$321.hasPrototype(Keyword$559) && head$321.keyword.token.value === 'new' && rest$322[0]) {
                    var newCallRes$331 = enforest(rest$322, env$319);
                    if (newCallRes$331.result.hasPrototype(Call$567)) {
                        return step(Const$566.create(head$321, newCallRes$331.result), newCallRes$331.rest);
                    }
                } else if (head$321.hasPrototype(Expr$547) && rest$322[0] && rest$322[0].token.value === '?') {
                    var question$332 = rest$322[0];
                    var condRes$333 = enforest(rest$322.slice(1), env$319);
                    var truExpr$334 = condRes$333.result;
                    var right$335 = condRes$333.rest;
                    if (truExpr$334.hasPrototype(Expr$547) && right$335[0] && right$335[0].token.value === ':') {
                        var colon$336 = right$335[0];
                        var flsRes$337 = enforest(right$335.slice(1), env$319);
                        var flsExpr$338 = flsRes$337.result;
                        if (flsExpr$338.hasPrototype(Expr$547)) {
                            return step(ConditionalExpression$558.create(head$321, question$332, truExpr$334, colon$336, flsExpr$338), flsRes$337.rest);
                        }
                    }
                } else if (head$321.hasPrototype(Delimiter$561) && head$321.delim.token.value === '()') {
                    innerTokens$326 = head$321.delim.token.inner;
                    if (innerTokens$326.length === 0) {
                        return step(ParenExpression$554.create(head$321), rest$322);
                    } else {
                        var innerTerm$339 = get_expression(innerTokens$326, env$319);
                        if (innerTerm$339.result && innerTerm$339.result.hasPrototype(Expr$547)) {
                            return step(ParenExpression$554.create(head$321), rest$322);
                        }
                    }
                } else if (rest$322[0] && rest$322[1] && stxIsBinOp(rest$322[0])) {
                    var op$340 = rest$322[0];
                    var left$341 = head$321;
                    var bopRes$342 = enforest(rest$322.slice(1), env$319);
                    var right$335 = bopRes$342.result;
                    if (right$335.hasPrototype(Expr$547)) {
                        return step(BinOp$557.create(op$340, left$341, right$335), bopRes$342.rest);
                    }
                } else if (head$321.hasPrototype(Punc$560) && stxIsUnaryOp(head$321.punc) || head$321.hasPrototype(Keyword$559) && stxIsUnaryOp(head$321.keyword)) {
                    var unopRes$343 = enforest(rest$322);
                    var op$340 = head$321.hasPrototype(Punc$560) ? head$321.punc : head$321.keyword;
                    if (unopRes$343.result.hasPrototype(Expr$547)) {
                        return step(UnaryOp$555.create(op$340, unopRes$343.result), unopRes$343.rest);
                    }
                } else if (head$321.hasPrototype(Expr$547) && rest$322[0] && (rest$322[0].token.value === '++' || rest$322[0].token.value === '--')) {
                    return step(PostfixOp$556.create(head$321, rest$322[0]), rest$322.slice(1));
                } else if (head$321.hasPrototype(Expr$547) && rest$322[0] && rest$322[0].token.value === '[]') {
                    var getRes$344 = enforest(rest$322[0].token.inner, env$319);
                    var resStx$345 = mkSyntax('[]', parser$6.Token.Delimiter, rest$322[0]);
                    resStx$345.token.inner = [getRes$344.result];
                    if (getRes$344.rest.length > 0) {
                        return step(ObjGet$569.create(head$321, Delimiter$561.create(resStx$345)), rest$322.slice(1));
                    }
                } else if (head$321.hasPrototype(Expr$547) && rest$322[0] && rest$322[0].token.value === '.' && rest$322[1] && rest$322[1].token.type === parser$6.Token.Identifier) {
                    return step(ObjDotGet$568.create(head$321, rest$322[0], rest$322[1]), rest$322.slice(2));
                } else if (head$321.hasPrototype(Delimiter$561) && head$321.delim.token.value === '[]') {
                    return step(ArrayLiteral$553.create(head$321), rest$322);
                } else if (head$321.hasPrototype(Delimiter$561) && head$321.delim.token.value === '{}') {
                    innerTokens$326 = head$321.delim.token.inner;
                    return step(Block$552.create(head$321), rest$322);
                } else if (head$321.hasPrototype(Keyword$559) && head$321.keyword.token.value === 'var' && rest$322[0] && rest$322[0].token.type === parser$6.Token.Identifier) {
                    var vsRes$346 = enforestVarStatement(rest$322, env$319);
                    if (vsRes$346) {
                        return step(VariableStatement$571.create(head$321, vsRes$346.result), vsRes$346.rest);
                    }
                }
            } else {
                parser$6.assert(head$321 && head$321.token, 'assuming head is a syntax object');
                if ((head$321.token.type === parser$6.Token.Identifier || head$321.token.type === parser$6.Token.Keyword) && env$319.has(head$321.token.value)) {
                    var transformer$347 = env$319.get(head$321.token.value);
                    var rt$348 = transformer$347(rest$322, head$321, env$319);
                    return step(rt$348.result[0], rt$348.result.slice(1).concat(rt$348.rest));
                } else if (head$321.token.type === parser$6.Token.Identifier && head$321.token.value === 'macro' && rest$322[0] && (rest$322[0].token.type === parser$6.Token.Identifier || rest$322[0].token.type === parser$6.Token.Keyword) && rest$322[1] && rest$322[1].token.type === parser$6.Token.Delimiter && rest$322[1].token.value === '{}') {
                    return step(Macro$565.create(rest$322[0], rest$322[1].token.inner), rest$322.slice(2));
                } else if (head$321.token.type === parser$6.Token.Keyword && head$321.token.value === 'function' && rest$322[0] && rest$322[0].token.type === parser$6.Token.Identifier && rest$322[1] && rest$322[1].token.type === parser$6.Token.Delimiter && rest$322[1].token.value === '()' && rest$322[2] && rest$322[2].token.type === parser$6.Token.Delimiter && rest$322[2].token.value === '{}') {
                    return step(NamedFun$563.create(head$321, rest$322[0], rest$322[1], rest$322[2]), rest$322.slice(3));
                } else if (head$321.token.type === parser$6.Token.Keyword && head$321.token.value === 'function' && rest$322[0] && rest$322[0].token.type === parser$6.Token.Delimiter && rest$322[0].token.value === '()' && rest$322[1] && rest$322[1].token.type === parser$6.Token.Delimiter && rest$322[1].token.value === '{}') {
                    return step(AnonFun$564.create(head$321, rest$322[0], rest$322[1]), rest$322.slice(2));
                } else if (head$321.token.type === parser$6.Token.Keyword && head$321.token.value === 'this') {
                    return step(ThisExpression$549.create(head$321), rest$322);
                } else if (head$321.token.type === parser$6.Token.NumericLiteral || head$321.token.type === parser$6.Token.StringLiteral || head$321.token.type === parser$6.Token.BooleanLiteral || head$321.token.type === parser$6.Token.RegexLiteral || head$321.token.type === parser$6.Token.NullLiteral) {
                    return step(Lit$550.create(head$321), rest$322);
                } else if (head$321.token.type === parser$6.Token.Identifier) {
                    return step(Id$562.create(head$321), rest$322);
                } else if (head$321.token.type === parser$6.Token.Punctuator) {
                    return step(Punc$560.create(head$321), rest$322);
                } else if (head$321.token.type === parser$6.Token.Keyword && head$321.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$321.token.type === parser$6.Token.Keyword) {
                    return step(Keyword$559.create(head$321), rest$322);
                } else if (head$321.token.type === parser$6.Token.Delimiter) {
                    return step(Delimiter$561.create(head$321), rest$322);
                } else if (head$321.token.type === parser$6.Token.EOF) {
                    parser$6.assert(rest$322.length === 0, 'nothing should be after an EOF');
                    return step(EOF$545.create(head$321), []);
                } else {
                    parser$6.assert(false, 'not implemented');
                }
            }
            return {
                result: head$321,
                rest: rest$322
            };
        }
        return step(toks$318[0], toks$318.slice(1));
    }
    function get_expression(stx$349, env$350) {
        var res$352 = enforest(stx$349, env$350);
        if (!res$352.result.hasPrototype(Expr$547)) {
            return {
                result: null,
                rest: stx$349
            };
        }
        return res$352;
    }
    function typeIsLiteral(type$353) {
        return type$353 === parser$6.Token.NullLiteral || type$353 === parser$6.Token.NumericLiteral || type$353 === parser$6.Token.StringLiteral || type$353 === parser$6.Token.RegexLiteral || type$353 === parser$6.Token.BooleanLiteral;
    }
    exports$4._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$355, stx$356, env$357) {
        var result$359, rest$360;
        if (patternClass$355 === 'token' && stx$356[0] && stx$356[0].token.type !== parser$6.Token.EOF) {
            result$359 = [stx$356[0]];
            rest$360 = stx$356.slice(1);
        } else if (patternClass$355 === 'lit' && stx$356[0] && typeIsLiteral(stx$356[0].token.type)) {
            result$359 = [stx$356[0]];
            rest$360 = stx$356.slice(1);
        } else if (patternClass$355 === 'ident' && stx$356[0] && stx$356[0].token.type === parser$6.Token.Identifier) {
            result$359 = [stx$356[0]];
            rest$360 = stx$356.slice(1);
        } else if (patternClass$355 === 'VariableStatement') {
            var match$361 = enforest(stx$356, env$357);
            if (match$361.result && match$361.result.hasPrototype(VariableStatement$571)) {
                result$359 = match$361.result.destruct(false);
                rest$360 = match$361.rest;
            } else {
                result$359 = null;
                rest$360 = stx$356;
            }
        } else if (patternClass$355 === 'expr') {
            var match$361 = get_expression(stx$356, env$357);
            if (match$361.result === null || !match$361.result.hasPrototype(Expr$547)) {
                result$359 = null;
                rest$360 = stx$356;
            } else {
                result$359 = match$361.result.destruct(false);
                rest$360 = match$361.rest;
            }
        } else {
            result$359 = null;
            rest$360 = stx$356;
        }
        return {
            result: result$359,
            rest: rest$360
        };
    }
    function matchPattern(pattern$362, stx$363, env$364, patternEnv$365) {
        var subMatch$370;
        var match$371, matchEnv$372;
        var rest$373;
        var success$374;
        if (stx$363.length === 0) {
            return {
                success: false,
                rest: stx$363,
                patternEnv: patternEnv$365
            };
        }
        parser$6.assert(stx$363.length > 0, 'should have had something to match here');
        if (pattern$362.token.type === parser$6.Token.Delimiter) {
            if (pattern$362.class === 'pattern_group') {
                subMatch$370 = matchPatterns(pattern$362.token.inner, stx$363, env$364, false);
                rest$373 = subMatch$370.rest;
            } else if (stx$363[0].token.type === parser$6.Token.Delimiter && stx$363[0].token.value === pattern$362.token.value) {
                subMatch$370 = matchPatterns(pattern$362.token.inner, stx$363[0].token.inner, env$364, false);
                rest$373 = stx$363.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$363,
                    patternEnv: patternEnv$365
                };
            }
            success$374 = subMatch$370.success;
            _$5.keys(subMatch$370.patternEnv).forEach(function (patternKey$367) {
                if (pattern$362.repeat) {
                    var nextLevel$369 = subMatch$370.patternEnv[patternKey$367].level + 1;
                    if (patternEnv$365[patternKey$367]) {
                        patternEnv$365[patternKey$367].level = nextLevel$369;
                        patternEnv$365[patternKey$367].match.push(subMatch$370.patternEnv[patternKey$367]);
                    } else {
                        patternEnv$365[patternKey$367] = {
                            level: nextLevel$369,
                            match: [subMatch$370.patternEnv[patternKey$367]]
                        };
                    }
                } else {
                    patternEnv$365[patternKey$367] = subMatch$370.patternEnv[patternKey$367];
                }
            });
        } else {
            if (pattern$362.class === 'pattern_literal') {
                if (pattern$362.token.value === stx$363[0].token.value) {
                    success$374 = true;
                    rest$373 = stx$363.slice(1);
                } else {
                    success$374 = false;
                    rest$373 = stx$363;
                }
            } else {
                match$371 = matchPatternClass(pattern$362.class, stx$363, env$364);
                success$374 = match$371.result !== null;
                rest$373 = match$371.rest;
                matchEnv$372 = {
                    level: 0,
                    match: match$371.result
                };
                if (match$371.result !== null) {
                    if (pattern$362.repeat) {
                        if (patternEnv$365[pattern$362.token.value]) {
                            patternEnv$365[pattern$362.token.value].match.push(matchEnv$372);
                        } else {
                            patternEnv$365[pattern$362.token.value] = {
                                level: 1,
                                match: [matchEnv$372]
                            };
                        }
                    } else {
                        patternEnv$365[pattern$362.token.value] = matchEnv$372;
                    }
                }
            }
        }
        return {
            success: success$374,
            rest: rest$373,
            patternEnv: patternEnv$365
        };
    }
    function matchPatterns(patterns$375, stx$376, env$377, topLevel$378) {
        topLevel$378 = topLevel$378 || false;
        var result$380 = [];
        var patternEnv$381 = {};
        var match$382;
        var pattern$383;
        var rest$384 = stx$376;
        var success$385 = true;
        for (var i = 0; i < patterns$375.length; i++) {
            pattern$383 = patterns$375[i];
            do {
                match$382 = matchPattern(pattern$383, rest$384, env$377, patternEnv$381);
                if (!match$382.success) {
                    success$385 = false;
                }
                rest$384 = match$382.rest;
                patternEnv$381 = match$382.patternEnv;
                if (pattern$383.repeat && success$385) {
                    if (rest$384[0] && rest$384[0].token.value === pattern$383.separator) {
                        rest$384 = rest$384.slice(1);
                    } else if (pattern$383.separator === ' ') {
                        continue;
                    } else if (pattern$383.separator !== ' ' && rest$384.length > 0 && i === patterns$375.length - 1 && topLevel$378 === false) {
                        success$385 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$383.repeat && match$382.success && rest$384.length > 0);
        }
        return {
            success: success$385,
            rest: rest$384,
            patternEnv: patternEnv$381
        };
    }
    function transcribe(macroBody$386, macroNameStx$387, env$388) {
        return _$5.chain(macroBody$386).reduce(function (acc$390, bodyStx$391, idx$392, original$393) {
            var last$395 = original$393[idx$392 - 1];
            var next$396 = original$393[idx$392 + 1];
            var nextNext$397 = original$393[idx$392 + 2];
            if (bodyStx$391.token.value === '...') {
                return acc$390;
            }
            if (delimIsSeparator(bodyStx$391) && next$396 && next$396.token.value === '...') {
                return acc$390;
            }
            if (bodyStx$391.token.value === '$' && next$396 && next$396.token.type === parser$6.Token.Delimiter && next$396.token.value === '()') {
                return acc$390;
            }
            if (bodyStx$391.token.value === '$' && next$396 && next$396.token.type === parser$6.Token.Delimiter && next$396.token.value === '[]') {
                next$396.literal = true;
                return acc$390;
            }
            if (bodyStx$391.token.type === parser$6.Token.Delimiter && bodyStx$391.token.value === '()' && last$395 && last$395.token.value === '$') {
                bodyStx$391.group = true;
            }
            if (bodyStx$391.literal === true) {
                parser$6.assert(bodyStx$391.token.type === parser$6.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$390.concat(bodyStx$391.token.inner);
            }
            if (next$396 && next$396.token.value === '...') {
                bodyStx$391.repeat = true;
                bodyStx$391.separator = ' ';
            } else if (delimIsSeparator(next$396) && nextNext$397 && nextNext$397.token.value === '...') {
                bodyStx$391.repeat = true;
                bodyStx$391.separator = next$396.token.inner[0].token.value;
            }
            return acc$390.concat(bodyStx$391);
        }, []).reduce(function (acc$398, bodyStx$399, idx$400) {
            if (bodyStx$399.repeat) {
                if (bodyStx$399.token.type === parser$6.Token.Delimiter) {
                    var fv$416 = _$5.filter(freeVarsInPattern(bodyStx$399.token.inner), function (pat$402) {
                            return env$388.hasOwnProperty(pat$402);
                        });
                    var restrictedEnv$417 = [];
                    var nonScalar$418 = _$5.find(fv$416, function (pat$404) {
                            return env$388[pat$404].level > 0;
                        });
                    parser$6.assert(typeof nonScalar$418 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$419 = env$388[nonScalar$418].match.length;
                    var sameLength$420 = _$5.all(fv$416, function (pat$406) {
                            return env$388[pat$406].level === 0 || env$388[pat$406].match.length === repeatLength$419;
                        });
                    parser$6.assert(sameLength$420, 'all non-scalars must have the same length');
                    restrictedEnv$417 = _$5.map(_$5.range(repeatLength$419), function (idx$408) {
                        var renv$412 = {};
                        _$5.each(fv$416, function (pat$410) {
                            if (env$388[pat$410].level === 0) {
                                renv$412[pat$410] = env$388[pat$410];
                            } else {
                                renv$412[pat$410] = env$388[pat$410].match[idx$408];
                            }
                        });
                        return renv$412;
                    });
                    var transcribed$421 = _$5.map(restrictedEnv$417, function (renv$413) {
                            if (bodyStx$399.group) {
                                return transcribe(bodyStx$399.token.inner, macroNameStx$387, renv$413);
                            } else {
                                var newBody$415 = syntaxFromToken(_$5.clone(bodyStx$399.token), bodyStx$399.context);
                                newBody$415.token.inner = transcribe(bodyStx$399.token.inner, macroNameStx$387, renv$413);
                                return newBody$415;
                            }
                        });
                    var joined$422;
                    if (bodyStx$399.group) {
                        joined$422 = joinSyntaxArr(transcribed$421, bodyStx$399.separator);
                    } else {
                        joined$422 = joinSyntax(transcribed$421, bodyStx$399.separator);
                    }
                    return acc$398.concat(joined$422);
                }
                parser$6.assert(env$388[bodyStx$399.token.value].level === 1, 'ellipses level does not match');
                return acc$398.concat(joinRepeatedMatch(env$388[bodyStx$399.token.value].match, bodyStx$399.separator));
            } else {
                if (bodyStx$399.token.type === parser$6.Token.Delimiter) {
                    var newBody$423 = syntaxFromToken(_$5.clone(bodyStx$399.token), macroBody$386.context);
                    newBody$423.token.inner = transcribe(bodyStx$399.token.inner, macroNameStx$387, env$388);
                    return acc$398.concat(newBody$423);
                }
                if (Object.prototype.hasOwnProperty.bind(env$388)(bodyStx$399.token.value)) {
                    parser$6.assert(env$388[bodyStx$399.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$399.token.value);
                    return acc$398.concat(takeLineContext(macroNameStx$387, env$388[bodyStx$399.token.value].match));
                }
                return acc$398.concat(takeLineContext(macroNameStx$387, [bodyStx$399]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$424, env$425) {
        function dfs(match$427) {
            if (match$427.level === 0) {
                match$427.match = _$5.map(match$427.match, function (stx$429) {
                    return stx$429.mark(newMark$424);
                });
            } else {
                _$5.each(match$427.match, function (match$431) {
                    dfs(match$431);
                });
            }
        }
        _$5.keys(env$425).forEach(function (key$433) {
            dfs(env$425[key$433]);
        });
    }
    function makeTransformer(cases$435, macroName$436) {
        var sortedCases$451 = _$5.sortBy(cases$435, function (mcase$438) {
                return patternLength(mcase$438.pattern);
            }).reverse();
        return function transformer(stx$440, macroNameStx$441, env$442) {
            var match$446;
            var casePattern$447, caseBody$448;
            var newMark$449;
            var macroResult$450;
            for (var i = 0; i < sortedCases$451.length; i++) {
                casePattern$447 = sortedCases$451[i].pattern;
                caseBody$448 = sortedCases$451[i].body;
                match$446 = matchPatterns(casePattern$447, stx$440, env$442, true);
                if (match$446.success) {
                    newMark$449 = fresh();
                    applyMarkToPatternEnv(newMark$449, match$446.patternEnv);
                    macroResult$450 = transcribe(caseBody$448, macroNameStx$441, match$446.patternEnv);
                    macroResult$450 = _$5.map(macroResult$450, function (stx$444) {
                        return stx$444.mark(newMark$449);
                    });
                    return {
                        result: macroResult$450,
                        rest: match$446.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$441.token.value);
        };
    }
    function findCase(start$452, stx$453) {
        parser$6.assert(start$452 >= 0 && start$452 < stx$453.length, 'start out of bounds');
        var idx$455 = start$452;
        while (idx$455 < stx$453.length) {
            if (stx$453[idx$455].token.value === 'case') {
                return idx$455;
            }
            idx$455++;
        }
        return -1;
    }
    function findCaseArrow(start$456, stx$457) {
        parser$6.assert(start$456 >= 0 && start$456 < stx$457.length, 'start out of bounds');
        var idx$459 = start$456;
        while (idx$459 < stx$457.length) {
            if (stx$457[idx$459].token.value === '=' && stx$457[idx$459 + 1] && stx$457[idx$459 + 1].token.value === '>') {
                return idx$459;
            }
            idx$459++;
        }
        return -1;
    }
    function loadMacroDef(mac$460) {
        var body$462 = mac$460.body;
        var caseOffset$463 = 0;
        var arrowOffset$464 = 0;
        var casePattern$465;
        var caseBody$466;
        var caseBodyIdx$467;
        var cases$468 = [];
        while (caseOffset$463 < body$462.length && body$462[caseOffset$463].token.value === 'case') {
            arrowOffset$464 = findCaseArrow(caseOffset$463, body$462);
            if (arrowOffset$464 > 0 && arrowOffset$464 < body$462.length) {
                caseBodyIdx$467 = arrowOffset$464 + 2;
                if (caseBodyIdx$467 >= body$462.length) {
                    throwError('case body missing in macro definition');
                }
                casePattern$465 = body$462.slice(caseOffset$463 + 1, arrowOffset$464);
                caseBody$466 = body$462[caseBodyIdx$467].token.inner;
                cases$468.push({
                    pattern: loadPattern(casePattern$465, mac$460.name),
                    body: caseBody$466
                });
            } else {
                throwError('case body missing in macro definition');
            }
            caseOffset$463 = findCase(arrowOffset$464, body$462);
            if (caseOffset$463 < 0) {
                break;
            }
        }
        return makeTransformer(cases$468);
    }
    function expandToTermTree(stx$469, env$470) {
        parser$6.assert(env$470, 'environment map is required');
        if (stx$469.length === 0) {
            return {
                terms: [],
                env: env$470
            };
        }
        parser$6.assert(stx$469[0].token, 'expecting a syntax object');
        var f$472 = enforest(stx$469, env$470);
        var head$473 = f$472.result;
        var rest$474 = f$472.rest;
        if (head$473.hasPrototype(Macro$565)) {
            var macroDefinition$475 = loadMacroDef(head$473);
            env$470.set(head$473.name.token.value, macroDefinition$475);
            return expandToTermTree(rest$474, env$470);
        }
        var trees$476 = expandToTermTree(rest$474, env$470);
        return {
            terms: [head$473].concat(trees$476.terms),
            env: trees$476.env
        };
    }
    function expandTermTreeToFinal(term$477, env$478, ctx$479) {
        parser$6.assert(env$478, 'environment map is required');
        parser$6.assert(ctx$479, 'context map is required');
        if (term$477.hasPrototype(ArrayLiteral$553)) {
            term$477.array.delim.token.inner = expand(term$477.array.delim.token.inner, env$478);
            return term$477;
        } else if (term$477.hasPrototype(Block$552)) {
            term$477.body.delim.token.inner = expand(term$477.body.delim.token.inner, env$478);
            return term$477;
        } else if (term$477.hasPrototype(ParenExpression$554)) {
            term$477.expr.delim.token.inner = expand(term$477.expr.delim.token.inner, env$478, ctx$479);
            return term$477;
        } else if (term$477.hasPrototype(Call$567)) {
            term$477.fun = expandTermTreeToFinal(term$477.fun, env$478, ctx$479);
            term$477.args = _$5.map(term$477.args, function (arg$481) {
                return expandTermTreeToFinal(arg$481, env$478, ctx$479);
            });
            return term$477;
        } else if (term$477.hasPrototype(UnaryOp$555)) {
            term$477.expr = expandTermTreeToFinal(term$477.expr, env$478, ctx$479);
            return term$477;
        } else if (term$477.hasPrototype(BinOp$557)) {
            term$477.left = expandTermTreeToFinal(term$477.left, env$478, ctx$479);
            term$477.right = expandTermTreeToFinal(term$477.right, env$478, ctx$479);
            return term$477;
        } else if (term$477.hasPrototype(ObjDotGet$568)) {
            term$477.left = expandTermTreeToFinal(term$477.left, env$478, ctx$479);
            term$477.right = expandTermTreeToFinal(term$477.right, env$478, ctx$479);
            return term$477;
        } else if (term$477.hasPrototype(VariableDeclaration$570)) {
            if (term$477.init) {
                term$477.init = expandTermTreeToFinal(term$477.init, env$478, ctx$479);
            }
            return term$477;
        } else if (term$477.hasPrototype(VariableStatement$571)) {
            term$477.decls = _$5.map(term$477.decls, function (decl$483) {
                return expandTermTreeToFinal(decl$483, env$478, ctx$479);
            });
            return term$477;
        } else if (term$477.hasPrototype(Delimiter$561)) {
            term$477.delim.token.inner = expand(term$477.delim.token.inner, env$478);
            return term$477;
        } else if (term$477.hasPrototype(NamedFun$563) || term$477.hasPrototype(AnonFun$564)) {
            var paramNames$507 = _$5.map(getParamIdentifiers(term$477.params), function (param$485) {
                    var freshName$487 = fresh();
                    return {
                        freshName: freshName$487,
                        originalParam: param$485,
                        renamedParam: param$485.rename(param$485, freshName$487)
                    };
                });
            var newCtx$508 = ctx$479;
            var stxBody$509 = term$477.body;
            var renamedBody$510 = _$5.reduce(paramNames$507, function (accBody$488, p$489) {
                    return accBody$488.rename(p$489.originalParam, p$489.freshName);
                }, stxBody$509);
            var dummyName$511 = fresh();
            renamedBody$510 = renamedBody$510.push_dummy_rename(dummyName$511);
            var bodyTerms$512 = expand([renamedBody$510], env$478, newCtx$508);
            parser$6.assert(bodyTerms$512.length === 1 && bodyTerms$512[0].body, 'expecting a block in the bodyTerms');
            var varIdents$513 = getVarDeclIdentifiers(bodyTerms$512[0]);
            varIdents$513 = _$5.filter(varIdents$513, function (varId$491) {
                return !_$5.any(paramNames$507, function (p$493) {
                    return resolve(varId$491) === resolve(p$493.renamedParam);
                });
            });
            varIdents$513 = _$5.uniq(varIdents$513, false, function (v$495) {
                return resolve(v$495);
            });
            var varNames$514 = _$5.map(varIdents$513, function (ident$497) {
                    var freshName$499 = fresh();
                    return {
                        freshName: freshName$499,
                        dummyName: dummyName$511,
                        originalVar: ident$497,
                        renamedVar: ident$497.swap_dummy_rename([{
                                freshName: freshName$499,
                                originalVar: ident$497
                            }], dummyName$511)
                    };
                });
            var flattenedBody$515 = _$5.map(flatten(bodyTerms$512), function (stx$500) {
                    var isDecl$504;
                    if (stx$500.token.type === parser$6.Token.Identifier) {
                        isDecl$504 = _$5.find(varNames$514, function (v$502) {
                            return v$502.originalVar === stx$500;
                        });
                        if (isDecl$504) {
                            return isDecl$504.renamedVar;
                        }
                        return stx$500.swap_dummy_rename(varNames$514, dummyName$511);
                    }
                    return stx$500;
                });
            var renamedParams$516 = _$5.map(paramNames$507, function (p$505) {
                    return p$505.renamedParam;
                });
            var flatArgs$517 = wrapDelim(joinSyntax(renamedParams$516, ','), term$477.params);
            var expandedArgs$518 = expand([flatArgs$517], env$478, ctx$479);
            parser$6.assert(expandedArgs$518.length === 1, 'should only get back one result');
            term$477.params = expandedArgs$518[0];
            term$477.body = flattenedBody$515;
            return term$477;
        }
        return term$477;
    }
    function expand(stx$519, env$520, ctx$521) {
        env$520 = env$520 || new Map();
        ctx$521 = ctx$521 || new Map();
        var trees$525 = expandToTermTree(stx$519, env$520, ctx$521);
        return _$5.map(trees$525.terms, function (term$523) {
            return expandTermTreeToFinal(term$523, trees$525.env, ctx$521);
        });
    }
    function expandTopLevel(stx$526) {
        var fun$528 = syntaxFromToken({
                value: 'function',
                type: parser$6.Token.Keyword
            });
        var name$529 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$6.Token.Identifier
            });
        var params$530 = syntaxFromToken({
                value: '()',
                type: parser$6.Token.Delimiter,
                inner: []
            });
        var body$531 = syntaxFromToken({
                value: '{}',
                type: parser$6.Token.Delimiter,
                inner: stx$526
            });
        var res$532 = expand([
                fun$528,
                name$529,
                params$530,
                body$531
            ]);
        return res$532[0].body.slice(1, res$532[0].body.length - 1);
    }
    function flatten(terms$533) {
        return _$5.reduce(terms$533, function (acc$535, term$536) {
            return acc$535.concat(term$536.destruct(true));
        }, []);
    }
    exports$4.enforest = enforest;
    exports$4.expand = expandTopLevel;
    exports$4.resolve = resolve;
    exports$4.flatten = flatten;
    exports$4.tokensToSyntax = tokensToSyntax;
    exports$4.syntaxToTokens = syntaxToTokens;
}));