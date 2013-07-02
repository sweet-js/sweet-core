(function (root$1, factory$2) {
    if (typeof exports === 'object') {
        factory$2(exports, require('underscore'), require('./parser'), require('es6-collections'), require('contracts-js'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'es6-collections',
            'contracts-js'
        ], factory$2);
    } else {
        factory$2(root$1.expander = {}, root$1._, root$1.parser, root$1.es6, root$1.contracts);
    }
}(this, function (exports$4, _$5, parser$6, es6$7, contracts$8) {
    'use strict';
    var C = contracts$8;
    exports$4._test = {};
    Object.prototype.create = function () {
        var o$22 = Object.create(this);
        if (typeof o$22.construct === 'function') {
            o$22.construct.apply(o$22, arguments);
        }
        return o$22;
    };
    Object.prototype.extend = function (properties$23) {
        var result$25 = Object.create(this);
        for (var prop in properties$23) {
            if (properties$23.hasOwnProperty(prop)) {
                result$25[prop] = properties$23[prop];
            }
        }
        return result$25;
    };
    Object.prototype.hasPrototype = function (proto$26) {
        function F() {
        }
        F.prototype = proto$26;
        return this instanceof F;
    };
    function throwError(msg$29) {
        throw new Error(msg$29);
    }
    function mkSyntax(value$31, type$32, stx$33) {
        return syntaxFromToken({
            type: type$32,
            value: value$31,
            lineStart: stx$33.token.lineStart,
            lineNumber: stx$33.token.lineNumber
        }, stx$33.context);
    }
    function Mark(mark$35, ctx$36) {
        return {
            mark: mark$35,
            context: ctx$36
        };
    }
    function Var(id$38) {
        return {id: id$38};
    }
    var isMark$595 = function isMark$595(m$40) {
        return m$40 && typeof m$40.mark !== 'undefined';
    };
    function Rename(id$42, name$43, ctx$44) {
        return {
            id: id$42,
            name: name$43,
            context: ctx$44
        };
    }
    var isRename$596 = function (r$46) {
        return r$46 && typeof r$46.id !== 'undefined' && typeof r$46.name !== 'undefined';
    };
    function DummyRename(name$48, ctx$49) {
        return {
            dummy_name: name$48,
            context: ctx$49
        };
    }
    var isDummyRename$597 = function (r$51) {
        return r$51 && typeof r$51.dummy_name !== 'undefined';
    };
    C.CToken = C.object({
        type: C.opt(C.Num),
        value: C.opt(C.or(C.Num, C.Str))
    });
    C.CContext = C.object({
        name: C.opt(C.Num),
        dummy_name: C.opt(C.Num),
        context: C.Self
    });
    C.CSyntax = C.object({
        token: C.CToken,
        context: C.CContext
    });
    var syntaxProto$598 = {
            mark: function mark(newMark$82) {
                var markedToken$86 = _$5.clone(this.token);
                if (this.token.inner) {
                    var markedInner$87 = _$5.map(this.token.inner, function (stx$84) {
                            return stx$84.mark(newMark$82);
                        });
                    markedToken$86.inner = markedInner$87;
                }
                var newMarkObj$88 = Mark(newMark$82, this.context);
                var stmp$89 = syntaxFromToken(markedToken$86, newMarkObj$88);
                return stmp$89;
            },
            rename: function (id$90, name$91) {
                if (this.token.inner) {
                    var renamedInner$95 = _$5.map(this.token.inner, function (stx$93) {
                            return stx$93.rename(id$90, name$91);
                        });
                    this.token.inner = renamedInner$95;
                }
                if (this.token.value === id$90.token.value) {
                    return syntaxFromToken(this.token, Rename(id$90, name$91, this.context));
                } else {
                    return this;
                }
            },
            push_dummy_rename: function (name$96) {
                if (this.token.inner) {
                    var renamedInner$100 = _$5.map(this.token.inner, function (stx$98) {
                            return stx$98.push_dummy_rename(name$96);
                        });
                    this.token.inner = renamedInner$100;
                }
                return syntaxFromToken(this.token, DummyRename(name$96, this.context));
            },
            swap_dummy_rename: function (varNames$101, dummyName$102) {
                parser$6.assert(this.token.type !== parser$6.Token.Delimiter, 'expecting everything to be flattened');
                var that$106 = this;
                var matchingVarNames$107 = _$5.filter(varNames$101, function (v$104) {
                        return v$104.originalVar.token.value === that$106.token.value;
                    });
                var newStx$108 = syntaxFromToken(this.token, renameDummyCtx(this.context, matchingVarNames$107, dummyName$102));
                return newStx$108;
            },
            toString: function () {
                var val$110 = this.token.type === parser$6.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$110 + ']';
            }
        };
    function renameDummyCtx(ctx$111, varNames$112, dummyName$113) {
        if (ctx$111 === null) {
            return null;
        }
        if (isDummyRename$597(ctx$111) && ctx$111.dummy_name === dummyName$113) {
            return _$5.reduce(varNames$112, function (accCtx$115, v$116) {
                return Rename(v$116.originalVar, v$116.freshName, accCtx$115);
            }, ctx$111.context);
        }
        if (isDummyRename$597(ctx$111) && ctx$111.dummy_name !== dummyName$113) {
            return DummyRename(ctx$111.dummy_name, renameDummyCtx(ctx$111.context, varNames$112, dummyName$113));
        }
        if (isMark$595(ctx$111)) {
            return Mark(ctx$111.mark, renameDummyCtx(ctx$111.context, varNames$112, dummyName$113));
        }
        if (isRename$596(ctx$111)) {
            return Rename(ctx$111.id.swap_dummy_rename(varNames$112, dummyName$113), ctx$111.name, renameDummyCtx(ctx$111.context, varNames$112, dummyName$113));
        }
        parser$6.assert(false, 'expecting a fixed set of context types');
    }
    function findDummyParent(ctx$118, dummyName$119) {
        if (ctx$118 === null || ctx$118.context === null) {
            return null;
        }
        if (isDummyRename$597(ctx$118.context) && ctx$118.context.dummy_name === dummyName$119) {
            return ctx$118;
        }
        return findDummyParent(ctx$118.context);
    }
    function syntaxFromToken(token$121, oldctx$122) {
        var ctx$124 = typeof oldctx$122 !== 'undefined' ? oldctx$122 : null;
        return Object.create(syntaxProto$598, {
            token: {
                value: token$121,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$124,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
    }
    function remdup(mark$125, mlist$126) {
        if (mark$125 === _$5.first(mlist$126)) {
            return _$5.rest(mlist$126, 1);
        }
        return [mark$125].concat(mlist$126);
    }
    function marksof(ctx$128, stopName$129) {
        var mark$131, submarks$132;
        if (isMark$595(ctx$128)) {
            mark$131 = ctx$128.mark;
            submarks$132 = marksof(ctx$128.context, stopName$129);
            return remdup(mark$131, submarks$132);
        }
        if (isDummyRename$597(ctx$128)) {
            return marksof(ctx$128.context);
        }
        if (isRename$596(ctx$128)) {
            if (stopName$129 === ctx$128.name) {
                return [];
            }
            return marksof(ctx$128.context, stopName$129);
        }
        return [];
    }
    function resolve(stx$133) {
        return resolveCtx(stx$133.token.value, stx$133.context);
    }
    function arraysEqual(a$135, b$136) {
        if (a$135.length !== b$136.length) {
            return false;
        }
        for (var i$138 = 0; i$138 < a$135.length; i$138++) {
            if (a$135[i$138] !== b$136[i$138]) {
                return false;
            }
        }
        return true;
    }
    function resolveCtx(originalName$139, ctx$140) {
        if (isMark$595(ctx$140) || isDummyRename$597(ctx$140)) {
            return resolveCtx(originalName$139, ctx$140.context);
        }
        if (isRename$596(ctx$140)) {
            var idName$142 = resolveCtx(ctx$140.id.token.value, ctx$140.id.context);
            var subName$143 = resolveCtx(originalName$139, ctx$140.context);
            if (idName$142 === subName$143) {
                var idMarks$144 = marksof(ctx$140.id.context, idName$142);
                var subMarks$145 = marksof(ctx$140.context, idName$142);
                if (arraysEqual(idMarks$144, subMarks$145)) {
                    return originalName$139 + '$' + ctx$140.name;
                }
            }
            return resolveCtx(originalName$139, ctx$140.context);
        }
        return originalName$139;
    }
    var nextFresh$599 = 0;
    var fresh$600 = C.guard(C.fun([], C.Num), function () {
            return nextFresh$599++;
        });
    ;
    function tokensToSyntax(tokens$148) {
        if (!_$5.isArray(tokens$148)) {
            tokens$148 = [tokens$148];
        }
        return _$5.map(tokens$148, function (token$150) {
            if (token$150.inner) {
                token$150.inner = tokensToSyntax(token$150.inner);
            }
            return syntaxFromToken(token$150);
        });
    }
    function syntaxToTokens(syntax$152) {
        return _$5.map(syntax$152, function (stx$154) {
            if (stx$154.token.inner) {
                stx$154.token.inner = syntaxToTokens(stx$154.token.inner);
            }
            return stx$154.token;
        });
    }
    var isPatternVar$601 = C.guard(C.fun([C.CToken], C.Bool), function (token$158) {
            return token$158.type === parser$6.Token.Identifier && token$158.value[0] === '$' && token$158.value !== '$';
        });
    var containsPatternVar$602 = function (patterns$160) {
        return _$5.any(patterns$160, function (pat$162) {
            if (pat$162.token.type === parser$6.Token.Delimiter) {
                return containsPatternVar$602(pat$162.token.inner);
            }
            return isPatternVar$601(pat$162);
        });
    };
    function loadPattern(patterns$164) {
        return _$5.chain(patterns$164).reduce(function (acc$166, patStx$167, idx$168) {
            var last$170 = patterns$164[idx$168 - 1];
            var lastLast$171 = patterns$164[idx$168 - 2];
            var next$172 = patterns$164[idx$168 + 1];
            var nextNext$173 = patterns$164[idx$168 + 2];
            if (patStx$167.token.value === ':') {
                if (last$170 && isPatternVar$601(last$170.token)) {
                    return acc$166;
                }
            }
            if (last$170 && last$170.token.value === ':') {
                if (lastLast$171 && isPatternVar$601(lastLast$171.token)) {
                    return acc$166;
                }
            }
            if (patStx$167.token.value === '$' && next$172 && next$172.token.type === parser$6.Token.Delimiter) {
                return acc$166;
            }
            if (isPatternVar$601(patStx$167.token)) {
                if (next$172 && next$172.token.value === ':') {
                    parser$6.assert(typeof nextNext$173 !== 'undefined', 'expecting a pattern class');
                    patStx$167.class = nextNext$173.token.value;
                } else {
                    patStx$167.class = 'token';
                }
            } else if (patStx$167.token.type === parser$6.Token.Delimiter) {
                if (last$170 && last$170.token.value === '$') {
                    patStx$167.class = 'pattern_group';
                }
                patStx$167.token.inner = loadPattern(patStx$167.token.inner);
            } else {
                patStx$167.class = 'pattern_literal';
            }
            return acc$166.concat(patStx$167);
        }, []).reduce(function (acc$174, patStx$175, idx$176, patterns$177) {
            var separator$179 = ' ';
            var repeat$180 = false;
            var next$181 = patterns$177[idx$176 + 1];
            var nextNext$182 = patterns$177[idx$176 + 2];
            if (next$181 && next$181.token.value === '...') {
                repeat$180 = true;
                separator$179 = ' ';
            } else if (delimIsSeparator(next$181) && nextNext$182 && nextNext$182.token.value === '...') {
                repeat$180 = true;
                parser$6.assert(next$181.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$179 = next$181.token.inner[0].token.value;
            }
            if (patStx$175.token.value === '...' || delimIsSeparator(patStx$175) && next$181 && next$181.token.value === '...') {
                return acc$174;
            }
            patStx$175.repeat = repeat$180;
            patStx$175.separator = separator$179;
            return acc$174.concat(patStx$175);
        }, []).value();
    }
    function takeLineContext(from$183, to$184) {
        return _$5.map(to$184, function (stx$186) {
            if (stx$186.token.type === parser$6.Token.Delimiter) {
                return syntaxFromToken({
                    type: parser$6.Token.Delimiter,
                    value: stx$186.token.value,
                    inner: stx$186.token.inner,
                    startRange: from$183.range,
                    endRange: from$183.range,
                    startLineNumber: from$183.token.lineNumber,
                    startLineStart: from$183.token.lineStart,
                    endLineNumber: from$183.token.lineNumber,
                    endLineStart: from$183.token.lineStart
                }, stx$186.context);
            }
            return syntaxFromToken({
                value: stx$186.token.value,
                type: stx$186.token.type,
                lineNumber: from$183.token.lineNumber,
                lineStart: from$183.token.lineStart,
                range: from$183.token.range
            }, stx$186.context);
        });
    }
    function joinRepeatedMatch(tojoin$188, punc$189) {
        return _$5.reduce(_$5.rest(tojoin$188, 1), function (acc$191, join$192) {
            if (punc$189 === ' ') {
                return acc$191.concat(join$192.match);
            }
            return acc$191.concat(mkSyntax(punc$189, parser$6.Token.Punctuator, _$5.first(join$192.match)), join$192.match);
        }, _$5.first(tojoin$188).match);
    }
    function joinSyntax(tojoin$194, punc$195) {
        if (tojoin$194.length === 0) {
            return [];
        }
        if (punc$195 === ' ') {
            return tojoin$194;
        }
        return _$5.reduce(_$5.rest(tojoin$194, 1), function (acc$197, join$198) {
            return acc$197.concat(mkSyntax(punc$195, parser$6.Token.Punctuator, join$198), join$198);
        }, [_$5.first(tojoin$194)]);
    }
    function joinSyntaxArr(tojoin$200, punc$201) {
        if (tojoin$200.length === 0) {
            return [];
        }
        if (punc$201 === ' ') {
            return _$5.flatten(tojoin$200, true);
        }
        return _$5.reduce(_$5.rest(tojoin$200, 1), function (acc$203, join$204) {
            return acc$203.concat(mkSyntax(punc$201, parser$6.Token.Punctuator, _$5.first(join$204)), join$204);
        }, _$5.first(tojoin$200));
    }
    function delimIsSeparator(delim$206) {
        return delim$206 && delim$206.token.type === parser$6.Token.Delimiter && delim$206.token.value === '()' && delim$206.token.inner.length === 1 && delim$206.token.inner[0].token.type !== parser$6.Token.Delimiter && !containsPatternVar$602(delim$206.token.inner);
    }
    function freeVarsInPattern(pattern$208) {
        var fv$212 = [];
        _$5.each(pattern$208, function (pat$210) {
            if (isPatternVar$601(pat$210.token)) {
                fv$212.push(pat$210.token.value);
            } else if (pat$210.token.type === parser$6.Token.Delimiter) {
                fv$212 = fv$212.concat(freeVarsInPattern(pat$210.token.inner));
            }
        });
        return fv$212;
    }
    function patternLength(patterns$213) {
        return _$5.reduce(patterns$213, function (acc$215, pat$216) {
            if (pat$216.token.type === parser$6.Token.Delimiter) {
                return acc$215 + 1 + patternLength(pat$216.token.inner);
            }
            return acc$215 + 1;
        }, 0);
    }
    function matchStx(value$218, stx$219) {
        return stx$219 && stx$219.token && stx$219.token.value === value$218;
    }
    function wrapDelim(towrap$221, delimSyntax$222) {
        parser$6.assert(delimSyntax$222.token.type === parser$6.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser$6.Token.Delimiter,
            value: delimSyntax$222.token.value,
            inner: towrap$221,
            range: delimSyntax$222.token.range,
            startLineNumber: delimSyntax$222.token.startLineNumber,
            lineStart: delimSyntax$222.token.lineStart
        }, delimSyntax$222.context);
    }
    function getParamIdentifiers(argSyntax$224) {
        parser$6.assert(argSyntax$224.token.type === parser$6.Token.Delimiter, 'expecting delimiter for function params');
        return _$5.filter(argSyntax$224.token.inner, function (stx$226) {
            return stx$226.token.value !== ',';
        });
    }
    function isFunctionStx(stx$228) {
        return stx$228 && stx$228.token.type === parser$6.Token.Keyword && stx$228.token.value === 'function';
    }
    function isVarStx(stx$230) {
        return stx$230 && stx$230.token.type === parser$6.Token.Keyword && stx$230.token.value === 'var';
    }
    function varNamesInAST(ast$232) {
        return _$5.map(ast$232, function (item$234) {
            return item$234.id.name;
        });
    }
    function getVarDeclIdentifiers(term$236) {
        var toCheck$247;
        if (term$236.hasPrototype(Block$611) && term$236.body.hasPrototype(Delimiter$620)) {
            toCheck$247 = term$236.body.delim.token.inner;
        } else if (term$236.hasPrototype(Delimiter$620)) {
            toCheck$247 = term$236.delim.token.inner;
        } else {
            parser$6.assert(false, 'expecting a Block or a Delimiter');
        }
        return _$5.reduce(toCheck$247, function (acc$238, curr$239, idx$240, list$241) {
            var prev$246 = list$241[idx$240 - 1];
            if (curr$239.hasPrototype(VariableStatement$630)) {
                return _$5.reduce(curr$239.decls, function (acc$243, decl$244) {
                    return acc$243.concat(decl$244.ident);
                }, acc$238);
            } else if (prev$246 && prev$246.hasPrototype(Keyword$618) && prev$246.keyword.token.value === 'for' && curr$239.hasPrototype(Delimiter$620)) {
                return acc$238.concat(getVarDeclIdentifiers(curr$239));
            } else if (curr$239.hasPrototype(Block$611)) {
                return acc$238.concat(getVarDeclIdentifiers(curr$239));
            }
            return acc$238;
        }, []);
    }
    function replaceVarIdent(stx$248, orig$249, renamed$250) {
        if (stx$248 === orig$249) {
            return renamed$250;
        }
        return stx$248;
    }
    var TermTree$603 = {destruct: function (breakDelim$252) {
                return _$5.reduce(this.properties, _$5.bind(function (acc$254, prop$255) {
                    if (this[prop$255] && this[prop$255].hasPrototype(TermTree$603)) {
                        return acc$254.concat(this[prop$255].destruct(breakDelim$252));
                    } else if (this[prop$255]) {
                        return acc$254.concat(this[prop$255]);
                    } else {
                        return acc$254;
                    }
                }, this), []);
            }};
    var EOF$604 = TermTree$603.extend({
            properties: ['eof'],
            construct: function (e$257) {
                this.eof = e$257;
            }
        });
    var Statement$605 = TermTree$603.extend({construct: function () {
            }});
    var Expr$606 = TermTree$603.extend({construct: function () {
            }});
    var PrimaryExpression$607 = Expr$606.extend({construct: function () {
            }});
    var ThisExpression$608 = PrimaryExpression$607.extend({
            properties: ['this'],
            construct: function (that$262) {
                this.this = that$262;
            }
        });
    var Lit$609 = PrimaryExpression$607.extend({
            properties: ['lit'],
            construct: function (l$264) {
                this.lit = l$264;
            }
        });
    exports$4._test.PropertyAssignment = PropertyAssignment$610;
    var PropertyAssignment$610 = TermTree$603.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$266, assignment$267) {
                this.propName = propName$266;
                this.assignment = assignment$267;
            }
        });
    var Block$611 = PrimaryExpression$607.extend({
            properties: ['body'],
            construct: function (body$269) {
                this.body = body$269;
            }
        });
    var ArrayLiteral$612 = PrimaryExpression$607.extend({
            properties: ['array'],
            construct: function (ar$271) {
                this.array = ar$271;
            }
        });
    var ParenExpression$613 = PrimaryExpression$607.extend({
            properties: ['expr'],
            construct: function (expr$273) {
                this.expr = expr$273;
            }
        });
    var UnaryOp$614 = Expr$606.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$275, expr$276) {
                this.op = op$275;
                this.expr = expr$276;
            }
        });
    var PostfixOp$615 = Expr$606.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$278, op$279) {
                this.expr = expr$278;
                this.op = op$279;
            }
        });
    var BinOp$616 = Expr$606.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$281, left$282, right$283) {
                this.op = op$281;
                this.left = left$282;
                this.right = right$283;
            }
        });
    var ConditionalExpression$617 = Expr$606.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$285, question$286, tru$287, colon$288, fls$289) {
                this.cond = cond$285;
                this.question = question$286;
                this.tru = tru$287;
                this.colon = colon$288;
                this.fls = fls$289;
            }
        });
    var Keyword$618 = TermTree$603.extend({
            properties: ['keyword'],
            construct: function (k$291) {
                this.keyword = k$291;
            }
        });
    var Punc$619 = TermTree$603.extend({
            properties: ['punc'],
            construct: function (p$293) {
                this.punc = p$293;
            }
        });
    var Delimiter$620 = TermTree$603.extend({
            properties: ['delim'],
            destruct: function (breakDelim$295) {
                parser$6.assert(this.delim, 'expecting delim to be defined');
                var innerStx$300 = _$5.reduce(this.delim.token.inner, function (acc$297, term$298) {
                        if (term$298.hasPrototype(TermTree$603)) {
                            return acc$297.concat(term$298.destruct(breakDelim$295));
                        } else {
                            return acc$297.concat(term$298);
                        }
                    }, []);
                if (breakDelim$295) {
                    var openParen$301 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$302 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$301].concat(innerStx$300).concat(closeParen$302);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$303) {
                this.delim = d$303;
            }
        });
    var Id$621 = PrimaryExpression$607.extend({
            properties: ['id'],
            construct: function (id$305) {
                this.id = id$305;
            }
        });
    var NamedFun$622 = Expr$606.extend({
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
    var AnonFun$623 = Expr$606.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$312, params$313, body$314) {
                this.keyword = keyword$312;
                this.params = params$313;
                this.body = body$314;
            }
        });
    var Macro$624 = TermTree$603.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$316, body$317) {
                this.name = name$316;
                this.body = body$317;
            }
        });
    var Const$625 = Expr$606.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$319, call$320) {
                this.newterm = newterm$319;
                this.call = call$320;
            }
        });
    var Call$626 = Expr$606.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$322) {
                parser$6.assert(this.fun.hasPrototype(TermTree$603), 'expecting a term tree in destruct of call');
                var that$328 = this;
                this.delim = syntaxFromToken(_$5.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$5.reduce(this.args, function (acc$324, term$325) {
                    parser$6.assert(term$325 && term$325.hasPrototype(TermTree$603), 'expecting term trees in destruct of Call');
                    var dst$327 = acc$324.concat(term$325.destruct(breakDelim$322));
                    if (that$328.commas.length > 0) {
                        dst$327 = dst$327.concat(that$328.commas.shift());
                    }
                    return dst$327;
                }, []);
                return this.fun.destruct(breakDelim$322).concat(Delimiter$620.create(this.delim).destruct(breakDelim$322));
            },
            construct: function (funn$329, args$330, delim$331, commas$332) {
                parser$6.assert(Array.isArray(args$330), 'requires an array of arguments terms');
                this.fun = funn$329;
                this.args = args$330;
                this.delim = delim$331;
                this.commas = commas$332;
            }
        });
    var ObjDotGet$627 = Expr$606.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$334, dot$335, right$336) {
                this.left = left$334;
                this.dot = dot$335;
                this.right = right$336;
            }
        });
    var ObjGet$628 = Expr$606.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$338, right$339) {
                this.left = left$338;
                this.right = right$339;
            }
        });
    var VariableDeclaration$629 = TermTree$603.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$341, eqstx$342, init$343, comma$344) {
                this.ident = ident$341;
                this.eqstx = eqstx$342;
                this.init = init$343;
                this.comma = comma$344;
            }
        });
    var VariableStatement$630 = Statement$605.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$346) {
                return this.varkw.destruct(breakDelim$346).concat(_$5.reduce(this.decls, function (acc$348, decl$349) {
                    return acc$348.concat(decl$349.destruct(breakDelim$346));
                }, []));
            },
            construct: function (varkw$351, decls$352) {
                parser$6.assert(Array.isArray(decls$352), 'decls must be an array');
                this.varkw = varkw$351;
                this.decls = decls$352;
            }
        });
    var CatchClause$631 = TermTree$603.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$354, params$355, body$356) {
                this.catchkw = catchkw$354;
                this.params = params$355;
                this.body = body$356;
            }
        });
    var Empty$632 = TermTree$603.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp(stx$359) {
        var staticOperators$361 = [
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
        return _$5.contains(staticOperators$361, stx$359.token.value);
    }
    function stxIsBinOp(stx$362) {
        var staticOperators$364 = [
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
        return _$5.contains(staticOperators$364, stx$362.token.value);
    }
    function enforestVarStatement(stx$365, env$366) {
        parser$6.assert(stx$365[0] && stx$365[0].token.type === parser$6.Token.Identifier, 'must start at the identifier');
        var decls$368 = [], rest$369 = stx$365, initRes$370, subRes$371;
        if (stx$365[1] && stx$365[1].token.type === parser$6.Token.Punctuator && stx$365[1].token.value === '=') {
            initRes$370 = enforest(stx$365.slice(2), env$366);
            if (initRes$370.result.hasPrototype(Expr$606)) {
                rest$369 = initRes$370.rest;
                if (initRes$370.rest[0].token.type === parser$6.Token.Punctuator && initRes$370.rest[0].token.value === ',' && initRes$370.rest[1] && initRes$370.rest[1].token.type === parser$6.Token.Identifier) {
                    decls$368.push(VariableDeclaration$629.create(stx$365[0], stx$365[1], initRes$370.result, initRes$370.rest[0]));
                    subRes$371 = enforestVarStatement(initRes$370.rest.slice(1), env$366);
                    decls$368 = decls$368.concat(subRes$371.result);
                    rest$369 = subRes$371.rest;
                } else {
                    decls$368.push(VariableDeclaration$629.create(stx$365[0], stx$365[1], initRes$370.result));
                }
            } else {
                parser$6.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$365[1] && stx$365[1].token.type === parser$6.Token.Punctuator && stx$365[1].token.value === ',') {
            decls$368.push(VariableDeclaration$629.create(stx$365[0], null, null, stx$365[1]));
            subRes$371 = enforestVarStatement(stx$365.slice(2), env$366);
            decls$368 = decls$368.concat(subRes$371.result);
            rest$369 = subRes$371.rest;
        } else {
            decls$368.push(VariableDeclaration$629.create(stx$365[0]));
            rest$369 = stx$365.slice(1);
        }
        return {
            result: decls$368,
            rest: rest$369
        };
    }
    function enforest(toks$372, env$373) {
        env$373 = env$373 || new Map();
        parser$6.assert(toks$372.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$375, rest$376) {
            var innerTokens$380;
            parser$6.assert(Array.isArray(rest$376), 'result must at least be an empty array');
            if (head$375.hasPrototype(TermTree$603)) {
                if (head$375.hasPrototype(Expr$606) && rest$376[0] && rest$376[0].token.type === parser$6.Token.Delimiter && rest$376[0].token.value === '()') {
                    var argRes$381, enforestedArgs$382 = [], commas$383 = [];
                    innerTokens$380 = rest$376[0].token.inner;
                    while (innerTokens$380.length > 0) {
                        argRes$381 = enforest(innerTokens$380, env$373);
                        enforestedArgs$382.push(argRes$381.result);
                        innerTokens$380 = argRes$381.rest;
                        if (innerTokens$380[0] && innerTokens$380[0].token.value === ',') {
                            commas$383.push(innerTokens$380[0]);
                            innerTokens$380 = innerTokens$380.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$384 = _$5.all(enforestedArgs$382, function (argTerm$378) {
                            return argTerm$378.hasPrototype(Expr$606);
                        });
                    if (innerTokens$380.length === 0 && argsAreExprs$384) {
                        return step(Call$626.create(head$375, enforestedArgs$382, rest$376[0], commas$383), rest$376.slice(1));
                    }
                } else if (head$375.hasPrototype(Keyword$618) && head$375.keyword.token.value === 'new' && rest$376[0]) {
                    var newCallRes$385 = enforest(rest$376, env$373);
                    if (newCallRes$385.result.hasPrototype(Call$626)) {
                        return step(Const$625.create(head$375, newCallRes$385.result), newCallRes$385.rest);
                    }
                } else if (head$375.hasPrototype(Expr$606) && rest$376[0] && rest$376[0].token.value === '?') {
                    var question$386 = rest$376[0];
                    var condRes$387 = enforest(rest$376.slice(1), env$373);
                    var truExpr$388 = condRes$387.result;
                    var right$389 = condRes$387.rest;
                    if (truExpr$388.hasPrototype(Expr$606) && right$389[0] && right$389[0].token.value === ':') {
                        var colon$390 = right$389[0];
                        var flsRes$391 = enforest(right$389.slice(1), env$373);
                        var flsExpr$392 = flsRes$391.result;
                        if (flsExpr$392.hasPrototype(Expr$606)) {
                            return step(ConditionalExpression$617.create(head$375, question$386, truExpr$388, colon$390, flsExpr$392), flsRes$391.rest);
                        }
                    }
                } else if (head$375.hasPrototype(Delimiter$620) && head$375.delim.token.value === '()') {
                    innerTokens$380 = head$375.delim.token.inner;
                    if (innerTokens$380.length === 0) {
                        return step(ParenExpression$613.create(head$375), rest$376);
                    } else {
                        var innerTerm$393 = get_expression(innerTokens$380, env$373);
                        if (innerTerm$393.result && innerTerm$393.result.hasPrototype(Expr$606)) {
                            return step(ParenExpression$613.create(head$375), rest$376);
                        }
                    }
                } else if (rest$376[0] && rest$376[1] && stxIsBinOp(rest$376[0])) {
                    var op$394 = rest$376[0];
                    var left$395 = head$375;
                    var bopRes$396 = enforest(rest$376.slice(1), env$373);
                    var right$389 = bopRes$396.result;
                    if (right$389.hasPrototype(Expr$606)) {
                        return step(BinOp$616.create(op$394, left$395, right$389), bopRes$396.rest);
                    }
                } else if (head$375.hasPrototype(Punc$619) && stxIsUnaryOp(head$375.punc) || head$375.hasPrototype(Keyword$618) && stxIsUnaryOp(head$375.keyword)) {
                    var unopRes$397 = enforest(rest$376);
                    var op$394 = head$375.hasPrototype(Punc$619) ? head$375.punc : head$375.keyword;
                    if (unopRes$397.result.hasPrototype(Expr$606)) {
                        return step(UnaryOp$614.create(op$394, unopRes$397.result), unopRes$397.rest);
                    }
                } else if (head$375.hasPrototype(Expr$606) && rest$376[0] && (rest$376[0].token.value === '++' || rest$376[0].token.value === '--')) {
                    return step(PostfixOp$615.create(head$375, rest$376[0]), rest$376.slice(1));
                } else if (head$375.hasPrototype(Expr$606) && rest$376[0] && rest$376[0].token.value === '[]') {
                    var getRes$398 = enforest(rest$376[0].token.inner, env$373);
                    var resStx$399 = mkSyntax('[]', parser$6.Token.Delimiter, rest$376[0]);
                    resStx$399.token.inner = [getRes$398.result];
                    if (getRes$398.rest.length > 0) {
                        return step(ObjGet$628.create(head$375, Delimiter$620.create(resStx$399)), rest$376.slice(1));
                    }
                } else if (head$375.hasPrototype(Expr$606) && rest$376[0] && rest$376[0].token.value === '.' && rest$376[1] && rest$376[1].token.type === parser$6.Token.Identifier) {
                    return step(ObjDotGet$627.create(head$375, rest$376[0], rest$376[1]), rest$376.slice(2));
                } else if (head$375.hasPrototype(Delimiter$620) && head$375.delim.token.value === '[]') {
                    return step(ArrayLiteral$612.create(head$375), rest$376);
                } else if (head$375.hasPrototype(Delimiter$620) && head$375.delim.token.value === '{}') {
                    innerTokens$380 = head$375.delim.token.inner;
                    return step(Block$611.create(head$375), rest$376);
                } else if (head$375.hasPrototype(Keyword$618) && head$375.keyword.token.value === 'var' && rest$376[0] && rest$376[0].token.type === parser$6.Token.Identifier) {
                    var vsRes$400 = enforestVarStatement(rest$376, env$373);
                    if (vsRes$400) {
                        return step(VariableStatement$630.create(head$375, vsRes$400.result), vsRes$400.rest);
                    }
                }
            } else {
                parser$6.assert(head$375 && head$375.token, 'assuming head is a syntax object');
                if ((head$375.token.type === parser$6.Token.Identifier || head$375.token.type === parser$6.Token.Keyword) && env$373.has(head$375.token.value)) {
                    var transformer$401 = env$373.get(head$375.token.value);
                    var rt$402 = transformer$401(rest$376, head$375, env$373);
                    if (rt$402.result.length > 0) {
                        return step(rt$402.result[0], rt$402.result.slice(1).concat(rt$402.rest));
                    } else {
                        return step(Empty$632.create(), rt$402.rest);
                    }
                } else if (head$375.token.type === parser$6.Token.Identifier && head$375.token.value === 'macro' && rest$376[0] && (rest$376[0].token.type === parser$6.Token.Identifier || rest$376[0].token.type === parser$6.Token.Keyword) && rest$376[1] && rest$376[1].token.type === parser$6.Token.Delimiter && rest$376[1].token.value === '{}') {
                    return step(Macro$624.create(rest$376[0], rest$376[1].token.inner), rest$376.slice(2));
                } else if (head$375.token.type === parser$6.Token.Keyword && head$375.token.value === 'function' && rest$376[0] && rest$376[0].token.type === parser$6.Token.Identifier && rest$376[1] && rest$376[1].token.type === parser$6.Token.Delimiter && rest$376[1].token.value === '()' && rest$376[2] && rest$376[2].token.type === parser$6.Token.Delimiter && rest$376[2].token.value === '{}') {
                    return step(NamedFun$622.create(head$375, rest$376[0], rest$376[1], rest$376[2]), rest$376.slice(3));
                } else if (head$375.token.type === parser$6.Token.Keyword && head$375.token.value === 'function' && rest$376[0] && rest$376[0].token.type === parser$6.Token.Delimiter && rest$376[0].token.value === '()' && rest$376[1] && rest$376[1].token.type === parser$6.Token.Delimiter && rest$376[1].token.value === '{}') {
                    return step(AnonFun$623.create(head$375, rest$376[0], rest$376[1]), rest$376.slice(2));
                } else if (head$375.token.type === parser$6.Token.Keyword && head$375.token.value === 'catch' && rest$376[0] && rest$376[0].token.type === parser$6.Token.Delimiter && rest$376[0].token.value === '()' && rest$376[1] && rest$376[1].token.type === parser$6.Token.Delimiter && rest$376[1].token.value === '{}') {
                    return step(CatchClause$631.create(head$375, rest$376[0], rest$376[1]), rest$376.slice(2));
                } else if (head$375.token.type === parser$6.Token.Keyword && head$375.token.value === 'this') {
                    return step(ThisExpression$608.create(head$375), rest$376);
                } else if (head$375.token.type === parser$6.Token.NumericLiteral || head$375.token.type === parser$6.Token.StringLiteral || head$375.token.type === parser$6.Token.BooleanLiteral || head$375.token.type === parser$6.Token.RegexLiteral || head$375.token.type === parser$6.Token.NullLiteral) {
                    return step(Lit$609.create(head$375), rest$376);
                } else if (head$375.token.type === parser$6.Token.Identifier) {
                    return step(Id$621.create(head$375), rest$376);
                } else if (head$375.token.type === parser$6.Token.Punctuator) {
                    return step(Punc$619.create(head$375), rest$376);
                } else if (head$375.token.type === parser$6.Token.Keyword && head$375.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$375.token.type === parser$6.Token.Keyword) {
                    return step(Keyword$618.create(head$375), rest$376);
                } else if (head$375.token.type === parser$6.Token.Delimiter) {
                    return step(Delimiter$620.create(head$375), rest$376);
                } else if (head$375.token.type === parser$6.Token.EOF) {
                    parser$6.assert(rest$376.length === 0, 'nothing should be after an EOF');
                    return step(EOF$604.create(head$375), []);
                } else {
                    parser$6.assert(false, 'not implemented');
                }
            }
            return {
                result: head$375,
                rest: rest$376
            };
        }
        return step(toks$372[0], toks$372.slice(1));
    }
    function get_expression(stx$403, env$404) {
        var res$406 = enforest(stx$403, env$404);
        if (!res$406.result.hasPrototype(Expr$606)) {
            return {
                result: null,
                rest: stx$403
            };
        }
        return res$406;
    }
    function typeIsLiteral(type$407) {
        return type$407 === parser$6.Token.NullLiteral || type$407 === parser$6.Token.NumericLiteral || type$407 === parser$6.Token.StringLiteral || type$407 === parser$6.Token.RegexLiteral || type$407 === parser$6.Token.BooleanLiteral;
    }
    exports$4._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$409, stx$410, env$411) {
        var result$413, rest$414;
        if (patternClass$409 === 'token' && stx$410[0] && stx$410[0].token.type !== parser$6.Token.EOF) {
            result$413 = [stx$410[0]];
            rest$414 = stx$410.slice(1);
        } else if (patternClass$409 === 'lit' && stx$410[0] && typeIsLiteral(stx$410[0].token.type)) {
            result$413 = [stx$410[0]];
            rest$414 = stx$410.slice(1);
        } else if (patternClass$409 === 'ident' && stx$410[0] && stx$410[0].token.type === parser$6.Token.Identifier) {
            result$413 = [stx$410[0]];
            rest$414 = stx$410.slice(1);
        } else if (patternClass$409 === 'VariableStatement') {
            var match$415 = enforest(stx$410, env$411);
            if (match$415.result && match$415.result.hasPrototype(VariableStatement$630)) {
                result$413 = match$415.result.destruct(false);
                rest$414 = match$415.rest;
            } else {
                result$413 = null;
                rest$414 = stx$410;
            }
        } else if (patternClass$409 === 'expr') {
            var match$415 = get_expression(stx$410, env$411);
            if (match$415.result === null || !match$415.result.hasPrototype(Expr$606)) {
                result$413 = null;
                rest$414 = stx$410;
            } else {
                result$413 = match$415.result.destruct(false);
                rest$414 = match$415.rest;
            }
        } else {
            result$413 = null;
            rest$414 = stx$410;
        }
        return {
            result: result$413,
            rest: rest$414
        };
    }
    function matchPattern(pattern$416, stx$417, env$418, patternEnv$419) {
        var subMatch$424;
        var match$425, matchEnv$426;
        var rest$427;
        var success$428;
        if (stx$417.length === 0) {
            return {
                success: false,
                rest: stx$417,
                patternEnv: patternEnv$419
            };
        }
        parser$6.assert(stx$417.length > 0, 'should have had something to match here');
        if (pattern$416.token.type === parser$6.Token.Delimiter) {
            if (pattern$416.class === 'pattern_group') {
                subMatch$424 = matchPatterns(pattern$416.token.inner, stx$417, env$418, false);
                rest$427 = subMatch$424.rest;
            } else if (stx$417[0].token.type === parser$6.Token.Delimiter && stx$417[0].token.value === pattern$416.token.value) {
                subMatch$424 = matchPatterns(pattern$416.token.inner, stx$417[0].token.inner, env$418, false);
                rest$427 = stx$417.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$417,
                    patternEnv: patternEnv$419
                };
            }
            success$428 = subMatch$424.success;
            _$5.keys(subMatch$424.patternEnv).forEach(function (patternKey$421) {
                if (pattern$416.repeat) {
                    var nextLevel$423 = subMatch$424.patternEnv[patternKey$421].level + 1;
                    if (patternEnv$419[patternKey$421]) {
                        patternEnv$419[patternKey$421].level = nextLevel$423;
                        patternEnv$419[patternKey$421].match.push(subMatch$424.patternEnv[patternKey$421]);
                    } else {
                        patternEnv$419[patternKey$421] = {
                            level: nextLevel$423,
                            match: [subMatch$424.patternEnv[patternKey$421]]
                        };
                    }
                } else {
                    patternEnv$419[patternKey$421] = subMatch$424.patternEnv[patternKey$421];
                }
            });
        } else {
            if (pattern$416.class === 'pattern_literal') {
                if (pattern$416.token.value === stx$417[0].token.value) {
                    success$428 = true;
                    rest$427 = stx$417.slice(1);
                } else {
                    success$428 = false;
                    rest$427 = stx$417;
                }
            } else {
                match$425 = matchPatternClass(pattern$416.class, stx$417, env$418);
                success$428 = match$425.result !== null;
                rest$427 = match$425.rest;
                matchEnv$426 = {
                    level: 0,
                    match: match$425.result
                };
                if (match$425.result !== null) {
                    if (pattern$416.repeat) {
                        if (patternEnv$419[pattern$416.token.value]) {
                            patternEnv$419[pattern$416.token.value].match.push(matchEnv$426);
                        } else {
                            patternEnv$419[pattern$416.token.value] = {
                                level: 1,
                                match: [matchEnv$426]
                            };
                        }
                    } else {
                        patternEnv$419[pattern$416.token.value] = matchEnv$426;
                    }
                }
            }
        }
        return {
            success: success$428,
            rest: rest$427,
            patternEnv: patternEnv$419
        };
    }
    function matchPatterns(patterns$429, stx$430, env$431, topLevel$432) {
        topLevel$432 = topLevel$432 || false;
        var result$434 = [];
        var patternEnv$435 = {};
        var match$436;
        var pattern$437;
        var rest$438 = stx$430;
        var success$439 = true;
        for (var i$440 = 0; i$440 < patterns$429.length; i$440++) {
            pattern$437 = patterns$429[i$440];
            do {
                match$436 = matchPattern(pattern$437, rest$438, env$431, patternEnv$435);
                if (!match$436.success) {
                    success$439 = false;
                }
                rest$438 = match$436.rest;
                patternEnv$435 = match$436.patternEnv;
                if (pattern$437.repeat && success$439) {
                    if (rest$438[0] && rest$438[0].token.value === pattern$437.separator) {
                        rest$438 = rest$438.slice(1);
                    } else if (pattern$437.separator === ' ') {
                        continue;
                    } else if (pattern$437.separator !== ' ' && rest$438.length > 0 && i$440 === patterns$429.length - 1 && topLevel$432 === false) {
                        success$439 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$437.repeat && match$436.success && rest$438.length > 0);
        }
        return {
            success: success$439,
            rest: rest$438,
            patternEnv: patternEnv$435
        };
    }
    function transcribe(macroBody$441, macroNameStx$442, env$443) {
        return _$5.chain(macroBody$441).reduce(function (acc$445, bodyStx$446, idx$447, original$448) {
            var last$450 = original$448[idx$447 - 1];
            var next$451 = original$448[idx$447 + 1];
            var nextNext$452 = original$448[idx$447 + 2];
            if (bodyStx$446.token.value === '...') {
                return acc$445;
            }
            if (delimIsSeparator(bodyStx$446) && next$451 && next$451.token.value === '...') {
                return acc$445;
            }
            if (bodyStx$446.token.value === '$' && next$451 && next$451.token.type === parser$6.Token.Delimiter && next$451.token.value === '()') {
                return acc$445;
            }
            if (bodyStx$446.token.value === '$' && next$451 && next$451.token.type === parser$6.Token.Delimiter && next$451.token.value === '[]') {
                next$451.literal = true;
                return acc$445;
            }
            if (bodyStx$446.token.type === parser$6.Token.Delimiter && bodyStx$446.token.value === '()' && last$450 && last$450.token.value === '$') {
                bodyStx$446.group = true;
            }
            if (bodyStx$446.literal === true) {
                parser$6.assert(bodyStx$446.token.type === parser$6.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$445.concat(bodyStx$446.token.inner);
            }
            if (next$451 && next$451.token.value === '...') {
                bodyStx$446.repeat = true;
                bodyStx$446.separator = ' ';
            } else if (delimIsSeparator(next$451) && nextNext$452 && nextNext$452.token.value === '...') {
                bodyStx$446.repeat = true;
                bodyStx$446.separator = next$451.token.inner[0].token.value;
            }
            return acc$445.concat(bodyStx$446);
        }, []).reduce(function (acc$453, bodyStx$454, idx$455) {
            if (bodyStx$454.repeat) {
                if (bodyStx$454.token.type === parser$6.Token.Delimiter) {
                    var fv$471 = _$5.filter(freeVarsInPattern(bodyStx$454.token.inner), function (pat$457) {
                            return env$443.hasOwnProperty(pat$457);
                        });
                    var restrictedEnv$472 = [];
                    var nonScalar$473 = _$5.find(fv$471, function (pat$459) {
                            return env$443[pat$459].level > 0;
                        });
                    parser$6.assert(typeof nonScalar$473 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$474 = env$443[nonScalar$473].match.length;
                    var sameLength$475 = _$5.all(fv$471, function (pat$461) {
                            return env$443[pat$461].level === 0 || env$443[pat$461].match.length === repeatLength$474;
                        });
                    parser$6.assert(sameLength$475, 'all non-scalars must have the same length');
                    restrictedEnv$472 = _$5.map(_$5.range(repeatLength$474), function (idx$463) {
                        var renv$467 = {};
                        _$5.each(fv$471, function (pat$465) {
                            if (env$443[pat$465].level === 0) {
                                renv$467[pat$465] = env$443[pat$465];
                            } else {
                                renv$467[pat$465] = env$443[pat$465].match[idx$463];
                            }
                        });
                        return renv$467;
                    });
                    var transcribed$476 = _$5.map(restrictedEnv$472, function (renv$468) {
                            if (bodyStx$454.group) {
                                return transcribe(bodyStx$454.token.inner, macroNameStx$442, renv$468);
                            } else {
                                var newBody$470 = syntaxFromToken(_$5.clone(bodyStx$454.token), bodyStx$454.context);
                                newBody$470.token.inner = transcribe(bodyStx$454.token.inner, macroNameStx$442, renv$468);
                                return newBody$470;
                            }
                        });
                    var joined$477;
                    if (bodyStx$454.group) {
                        joined$477 = joinSyntaxArr(transcribed$476, bodyStx$454.separator);
                    } else {
                        joined$477 = joinSyntax(transcribed$476, bodyStx$454.separator);
                    }
                    return acc$453.concat(joined$477);
                }
                parser$6.assert(env$443[bodyStx$454.token.value].level === 1, 'ellipses level does not match');
                return acc$453.concat(joinRepeatedMatch(env$443[bodyStx$454.token.value].match, bodyStx$454.separator));
            } else {
                if (bodyStx$454.token.type === parser$6.Token.Delimiter) {
                    var newBody$478 = syntaxFromToken(_$5.clone(bodyStx$454.token), macroBody$441.context);
                    newBody$478.token.inner = transcribe(bodyStx$454.token.inner, macroNameStx$442, env$443);
                    return acc$453.concat(newBody$478);
                }
                if (Object.prototype.hasOwnProperty.bind(env$443)(bodyStx$454.token.value)) {
                    parser$6.assert(env$443[bodyStx$454.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$454.token.value);
                    return acc$453.concat(takeLineContext(macroNameStx$442, env$443[bodyStx$454.token.value].match));
                }
                return acc$453.concat(takeLineContext(macroNameStx$442, [bodyStx$454]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$479, env$480) {
        function dfs(match$482) {
            if (match$482.level === 0) {
                match$482.match = _$5.map(match$482.match, function (stx$484) {
                    return stx$484.mark(newMark$479);
                });
            } else {
                _$5.each(match$482.match, function (match$486) {
                    dfs(match$486);
                });
            }
        }
        _$5.keys(env$480).forEach(function (key$488) {
            dfs(env$480[key$488]);
        });
    }
    function makeTransformer(cases$490, macroName$491) {
        var sortedCases$507 = _$5.sortBy(cases$490, function (mcase$493) {
                return patternLength(mcase$493.pattern);
            }).reverse();
        return function transformer(stx$495, macroNameStx$496, env$497) {
            var match$501;
            var casePattern$502, caseBody$503;
            var newMark$504;
            var macroResult$505;
            for (var i$506 = 0; i$506 < sortedCases$507.length; i$506++) {
                casePattern$502 = sortedCases$507[i$506].pattern;
                caseBody$503 = sortedCases$507[i$506].body;
                match$501 = matchPatterns(casePattern$502, stx$495, env$497, true);
                if (match$501.success) {
                    newMark$504 = fresh$600();
                    applyMarkToPatternEnv(newMark$504, match$501.patternEnv);
                    macroResult$505 = transcribe(caseBody$503, macroNameStx$496, match$501.patternEnv);
                    macroResult$505 = _$5.map(macroResult$505, function (stx$499) {
                        return stx$499.mark(newMark$504);
                    });
                    return {
                        result: macroResult$505,
                        rest: match$501.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$496.token.value);
        };
    }
    function findCase(start$508, stx$509) {
        parser$6.assert(start$508 >= 0 && start$508 < stx$509.length, 'start out of bounds');
        var idx$511 = start$508;
        while (idx$511 < stx$509.length) {
            if (stx$509[idx$511].token.value === 'case') {
                return idx$511;
            }
            idx$511++;
        }
        return -1;
    }
    function findCaseArrow(start$512, stx$513) {
        parser$6.assert(start$512 >= 0 && start$512 < stx$513.length, 'start out of bounds');
        var idx$515 = start$512;
        while (idx$515 < stx$513.length) {
            if (stx$513[idx$515].token.value === '=' && stx$513[idx$515 + 1] && stx$513[idx$515 + 1].token.value === '>') {
                return idx$515;
            }
            idx$515++;
        }
        return -1;
    }
    function loadMacroDef(mac$516) {
        var body$518 = mac$516.body;
        var caseOffset$519 = 0;
        var arrowOffset$520 = 0;
        var casePattern$521;
        var caseBody$522;
        var caseBodyIdx$523;
        var cases$524 = [];
        while (caseOffset$519 < body$518.length && body$518[caseOffset$519].token.value === 'case') {
            arrowOffset$520 = findCaseArrow(caseOffset$519, body$518);
            if (arrowOffset$520 > 0 && arrowOffset$520 < body$518.length) {
                caseBodyIdx$523 = arrowOffset$520 + 2;
                if (caseBodyIdx$523 >= body$518.length) {
                    throwError('case body missing in macro definition');
                }
                casePattern$521 = body$518.slice(caseOffset$519 + 1, arrowOffset$520);
                caseBody$522 = body$518[caseBodyIdx$523].token.inner;
                cases$524.push({
                    pattern: loadPattern(casePattern$521, mac$516.name),
                    body: caseBody$522
                });
            } else {
                throwError('case body missing in macro definition');
            }
            caseOffset$519 = findCase(arrowOffset$520, body$518);
            if (caseOffset$519 < 0) {
                break;
            }
        }
        return makeTransformer(cases$524);
    }
    function expandToTermTree(stx$525, env$526) {
        parser$6.assert(env$526, 'environment map is required');
        if (stx$525.length === 0) {
            return {
                terms: [],
                env: env$526
            };
        }
        parser$6.assert(stx$525[0].token, 'expecting a syntax object');
        var f$528 = enforest(stx$525, env$526);
        var head$529 = f$528.result;
        var rest$530 = f$528.rest;
        if (head$529.hasPrototype(Macro$624)) {
            var macroDefinition$531 = loadMacroDef(head$529);
            env$526.set(head$529.name.token.value, macroDefinition$531);
            return expandToTermTree(rest$530, env$526);
        }
        var trees$532 = expandToTermTree(rest$530, env$526);
        return {
            terms: [head$529].concat(trees$532.terms),
            env: trees$532.env
        };
    }
    function expandTermTreeToFinal(term$533, env$534, ctx$535) {
        parser$6.assert(env$534, 'environment map is required');
        parser$6.assert(ctx$535, 'context map is required');
        if (term$533.hasPrototype(ArrayLiteral$612)) {
            term$533.array.delim.token.inner = expand(term$533.array.delim.token.inner, env$534);
            return term$533;
        } else if (term$533.hasPrototype(Block$611)) {
            term$533.body.delim.token.inner = expand(term$533.body.delim.token.inner, env$534);
            return term$533;
        } else if (term$533.hasPrototype(ParenExpression$613)) {
            term$533.expr.delim.token.inner = expand(term$533.expr.delim.token.inner, env$534, ctx$535);
            return term$533;
        } else if (term$533.hasPrototype(Call$626)) {
            term$533.fun = expandTermTreeToFinal(term$533.fun, env$534, ctx$535);
            term$533.args = _$5.map(term$533.args, function (arg$537) {
                return expandTermTreeToFinal(arg$537, env$534, ctx$535);
            });
            return term$533;
        } else if (term$533.hasPrototype(UnaryOp$614)) {
            term$533.expr = expandTermTreeToFinal(term$533.expr, env$534, ctx$535);
            return term$533;
        } else if (term$533.hasPrototype(BinOp$616)) {
            term$533.left = expandTermTreeToFinal(term$533.left, env$534, ctx$535);
            term$533.right = expandTermTreeToFinal(term$533.right, env$534, ctx$535);
            return term$533;
        } else if (term$533.hasPrototype(ObjDotGet$627)) {
            term$533.left = expandTermTreeToFinal(term$533.left, env$534, ctx$535);
            term$533.right = expandTermTreeToFinal(term$533.right, env$534, ctx$535);
            return term$533;
        } else if (term$533.hasPrototype(VariableDeclaration$629)) {
            if (term$533.init) {
                term$533.init = expandTermTreeToFinal(term$533.init, env$534, ctx$535);
            }
            return term$533;
        } else if (term$533.hasPrototype(VariableStatement$630)) {
            term$533.decls = _$5.map(term$533.decls, function (decl$539) {
                return expandTermTreeToFinal(decl$539, env$534, ctx$535);
            });
            return term$533;
        } else if (term$533.hasPrototype(Delimiter$620)) {
            term$533.delim.token.inner = expand(term$533.delim.token.inner, env$534);
            return term$533;
        } else if (term$533.hasPrototype(NamedFun$622) || term$533.hasPrototype(AnonFun$623) || term$533.hasPrototype(CatchClause$631)) {
            var paramNames$563 = _$5.map(getParamIdentifiers(term$533.params), function (param$541) {
                    var freshName$543 = fresh$600();
                    return {
                        freshName: freshName$543,
                        originalParam: param$541,
                        renamedParam: param$541.rename(param$541, freshName$543)
                    };
                });
            var newCtx$564 = ctx$535;
            var stxBody$565 = term$533.body;
            var renamedBody$566 = _$5.reduce(paramNames$563, function (accBody$544, p$545) {
                    return accBody$544.rename(p$545.originalParam, p$545.freshName);
                }, stxBody$565);
            var dummyName$567 = fresh$600();
            renamedBody$566 = renamedBody$566.push_dummy_rename(dummyName$567);
            var bodyTerms$568 = expand([renamedBody$566], env$534, newCtx$564);
            parser$6.assert(bodyTerms$568.length === 1 && bodyTerms$568[0].body, 'expecting a block in the bodyTerms');
            var varIdents$569 = getVarDeclIdentifiers(bodyTerms$568[0]);
            varIdents$569 = _$5.filter(varIdents$569, function (varId$547) {
                return !_$5.any(paramNames$563, function (p$549) {
                    return resolve(varId$547) === resolve(p$549.renamedParam);
                });
            });
            varIdents$569 = _$5.uniq(varIdents$569, false, function (v$551) {
                return resolve(v$551);
            });
            var varNames$570 = _$5.map(varIdents$569, function (ident$553) {
                    var freshName$555 = fresh$600();
                    return {
                        freshName: freshName$555,
                        dummyName: dummyName$567,
                        originalVar: ident$553,
                        renamedVar: ident$553.swap_dummy_rename([{
                                freshName: freshName$555,
                                originalVar: ident$553
                            }], dummyName$567)
                    };
                });
            var flattenedBody$571 = _$5.map(flatten(bodyTerms$568), function (stx$556) {
                    var isDecl$560;
                    if (stx$556.token.type === parser$6.Token.Identifier) {
                        isDecl$560 = _$5.find(varNames$570, function (v$558) {
                            return v$558.originalVar === stx$556;
                        });
                        if (isDecl$560) {
                            return isDecl$560.renamedVar;
                        }
                        return stx$556.swap_dummy_rename(varNames$570, dummyName$567);
                    }
                    return stx$556;
                });
            var renamedParams$572 = _$5.map(paramNames$563, function (p$561) {
                    return p$561.renamedParam;
                });
            var flatArgs$573 = wrapDelim(joinSyntax(renamedParams$572, ','), term$533.params);
            var expandedArgs$574 = expand([flatArgs$573], env$534, ctx$535);
            parser$6.assert(expandedArgs$574.length === 1, 'should only get back one result');
            term$533.params = expandedArgs$574[0];
            term$533.body = flattenedBody$571;
            return term$533;
        }
        return term$533;
    }
    function expand(stx$575, env$576, ctx$577) {
        env$576 = env$576 || new Map();
        ctx$577 = ctx$577 || new Map();
        var trees$581 = expandToTermTree(stx$575, env$576, ctx$577);
        return _$5.map(trees$581.terms, function (term$579) {
            return expandTermTreeToFinal(term$579, trees$581.env, ctx$577);
        });
    }
    function expandTopLevel(stx$582) {
        var funn$584 = syntaxFromToken({
                value: 'function',
                type: parser$6.Token.Keyword
            });
        var name$585 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$6.Token.Identifier
            });
        var params$586 = syntaxFromToken({
                value: '()',
                type: parser$6.Token.Delimiter,
                inner: []
            });
        var body$587 = syntaxFromToken({
                value: '{}',
                type: parser$6.Token.Delimiter,
                inner: stx$582
            });
        var res$588 = expand([
                funn$584,
                name$585,
                params$586,
                body$587
            ]);
        return res$588[0].body.slice(1, res$588[0].body.length - 1);
    }
    function flatten(terms$589) {
        return _$5.reduce(terms$589, function (acc$591, term$592) {
            return acc$591.concat(term$592.destruct(true));
        }, []);
    }
    exports$4.enforest = enforest;
    exports$4.expand = expandTopLevel;
    exports$4.resolve = resolve;
    exports$4.flatten = flatten;
    exports$4.tokensToSyntax = tokensToSyntax;
    exports$4.syntaxToTokens = syntaxToTokens;
}));