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
    var isMark$545 = function isMark$545(m$28) {
        return m$28 && typeof m$28.mark !== 'undefined';
    };
    function Rename(id$30, name$31, ctx$32) {
        return {
            id: id$30,
            name: name$31,
            context: ctx$32
        };
    }
    var isRename$546 = function (r$34) {
        return r$34 && typeof r$34.id !== 'undefined' && typeof r$34.name !== 'undefined';
    };
    function DummyRename(name$36, ctx$37) {
        return {
            dummy_name: name$36,
            context: ctx$37
        };
    }
    var isDummyRename$547 = function (r$39) {
        return r$39 && typeof r$39.dummy_name !== 'undefined';
    };
    var syntaxProto$548 = {
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
        if (isDummyRename$547(ctx$70) && ctx$70.dummy_name === dummyName$72) {
            return _$5.reduce(varNames$71, function (accCtx$74, v$75) {
                return Rename(v$75.originalVar, v$75.freshName, accCtx$74);
            }, ctx$70.context);
        }
        if (isDummyRename$547(ctx$70) && ctx$70.dummy_name !== dummyName$72) {
            return DummyRename(ctx$70.dummy_name, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        if (isMark$545(ctx$70)) {
            return Mark(ctx$70.mark, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        if (isRename$546(ctx$70)) {
            return Rename(ctx$70.id.swap_dummy_rename(varNames$71, dummyName$72), ctx$70.name, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        parser$6.assert(false, 'expecting a fixed set of context types');
    }
    function findDummyParent(ctx$77, dummyName$78) {
        if (ctx$77 === null || ctx$77.context === null) {
            return null;
        }
        if (isDummyRename$547(ctx$77.context) && ctx$77.context.dummy_name === dummyName$78) {
            return ctx$77;
        }
        return findDummyParent(ctx$77.context);
    }
    function syntaxFromToken(token$80, oldctx$81) {
        var ctx$83 = typeof oldctx$81 !== 'undefined' ? oldctx$81 : null;
        return Object.create(syntaxProto$548, {
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
        if (isMark$545(ctx$87)) {
            mark$90 = ctx$87.mark;
            submarks$91 = marksof(ctx$87.context, stopName$88);
            return remdup(mark$90, submarks$91);
        }
        if (isDummyRename$547(ctx$87)) {
            return marksof(ctx$87.context);
        }
        if (isRename$546(ctx$87)) {
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
        for (var i$97 = 0; i$97 < a$94.length; i$97++) {
            if (a$94[i$97] !== b$95[i$97]) {
                return false;
            }
        }
        return true;
    }
    function resolveCtx(originalName$98, ctx$99) {
        if (isMark$545(ctx$99) || isDummyRename$547(ctx$99)) {
            return resolveCtx(originalName$98, ctx$99.context);
        }
        if (isRename$546(ctx$99)) {
            var idName$101 = resolveCtx(ctx$99.id.token.value, ctx$99.id.context);
            var subName$102 = resolveCtx(originalName$98, ctx$99.context);
            if (idName$101 === subName$102) {
                var idMarks$103 = marksof(ctx$99.id.context, idName$101);
                var subMarks$104 = marksof(ctx$99.context, idName$101);
                if (arraysEqual(idMarks$103, subMarks$104)) {
                    return originalName$98 + '$' + ctx$99.name;
                }
            }
            return resolveCtx(originalName$98, ctx$99.context);
        }
        return originalName$98;
    }
    var nextFresh$549 = 0;
    function fresh() {
        return nextFresh$549++;
    }
    ;
    function tokensToSyntax(tokens$106) {
        if (!_$5.isArray(tokens$106)) {
            tokens$106 = [tokens$106];
        }
        return _$5.map(tokens$106, function (token$108) {
            if (token$108.inner) {
                token$108.inner = tokensToSyntax(token$108.inner);
            }
            return syntaxFromToken(token$108);
        });
    }
    function syntaxToTokens(syntax$110) {
        return _$5.map(syntax$110, function (stx$112) {
            if (stx$112.token.inner) {
                stx$112.token.inner = syntaxToTokens(stx$112.token.inner);
            }
            return stx$112.token;
        });
    }
    function isPatternVar(token$114) {
        return token$114.type === parser$6.Token.Identifier && token$114.value[0] === '$' && token$114.value !== '$';
    }
    var containsPatternVar$550 = function (patterns$116) {
        return _$5.any(patterns$116, function (pat$118) {
            if (pat$118.token.type === parser$6.Token.Delimiter) {
                return containsPatternVar$550(pat$118.token.inner);
            }
            return isPatternVar(pat$118);
        });
    };
    function loadPattern(patterns$120) {
        return _$5.chain(patterns$120).reduce(function (acc$122, patStx$123, idx$124) {
            var last$126 = patterns$120[idx$124 - 1];
            var lastLast$127 = patterns$120[idx$124 - 2];
            var next$128 = patterns$120[idx$124 + 1];
            var nextNext$129 = patterns$120[idx$124 + 2];
            if (patStx$123.token.value === ':') {
                if (last$126 && isPatternVar(last$126.token)) {
                    return acc$122;
                }
            }
            if (last$126 && last$126.token.value === ':') {
                if (lastLast$127 && isPatternVar(lastLast$127.token)) {
                    return acc$122;
                }
            }
            if (patStx$123.token.value === '$' && next$128 && next$128.token.type === parser$6.Token.Delimiter) {
                return acc$122;
            }
            if (isPatternVar(patStx$123.token)) {
                if (next$128 && next$128.token.value === ':') {
                    parser$6.assert(typeof nextNext$129 !== 'undefined', 'expecting a pattern class');
                    patStx$123.class = nextNext$129.token.value;
                } else {
                    patStx$123.class = 'token';
                }
            } else if (patStx$123.token.type === parser$6.Token.Delimiter) {
                if (last$126 && last$126.token.value === '$') {
                    patStx$123.class = 'pattern_group';
                }
                patStx$123.token.inner = loadPattern(patStx$123.token.inner);
            } else {
                patStx$123.class = 'pattern_literal';
            }
            return acc$122.concat(patStx$123);
        }, []).reduce(function (acc$130, patStx$131, idx$132, patterns$133) {
            var separator$135 = ' ';
            var repeat$136 = false;
            var next$137 = patterns$133[idx$132 + 1];
            var nextNext$138 = patterns$133[idx$132 + 2];
            if (next$137 && next$137.token.value === '...') {
                repeat$136 = true;
                separator$135 = ' ';
            } else if (delimIsSeparator(next$137) && nextNext$138 && nextNext$138.token.value === '...') {
                repeat$136 = true;
                parser$6.assert(next$137.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$135 = next$137.token.inner[0].token.value;
            }
            if (patStx$131.token.value === '...' || delimIsSeparator(patStx$131) && next$137 && next$137.token.value === '...') {
                return acc$130;
            }
            patStx$131.repeat = repeat$136;
            patStx$131.separator = separator$135;
            return acc$130.concat(patStx$131);
        }, []).value();
    }
    function takeLineContext(from$139, to$140) {
        return _$5.map(to$140, function (stx$142) {
            if (stx$142.token.type === parser$6.Token.Delimiter) {
                return syntaxFromToken({
                    type: parser$6.Token.Delimiter,
                    value: stx$142.token.value,
                    inner: stx$142.token.inner,
                    startRange: from$139.range,
                    endRange: from$139.range,
                    startLineNumber: from$139.token.lineNumber,
                    startLineStart: from$139.token.lineStart,
                    endLineNumber: from$139.token.lineNumber,
                    endLineStart: from$139.token.lineStart
                }, stx$142.context);
            }
            return syntaxFromToken({
                value: stx$142.token.value,
                type: stx$142.token.type,
                lineNumber: from$139.token.lineNumber,
                lineStart: from$139.token.lineStart,
                range: null
            }, stx$142.context);
        });
    }
    function joinRepeatedMatch(tojoin$144, punc$145) {
        return _$5.reduce(_$5.rest(tojoin$144, 1), function (acc$147, join$148) {
            if (punc$145 === ' ') {
                return acc$147.concat(join$148.match);
            }
            return acc$147.concat(mkSyntax(punc$145, parser$6.Token.Punctuator, _$5.first(join$148.match)), join$148.match);
        }, _$5.first(tojoin$144).match);
    }
    function joinSyntax(tojoin$150, punc$151) {
        if (tojoin$150.length === 0) {
            return [];
        }
        if (punc$151 === ' ') {
            return tojoin$150;
        }
        return _$5.reduce(_$5.rest(tojoin$150, 1), function (acc$153, join$154) {
            return acc$153.concat(mkSyntax(punc$151, parser$6.Token.Punctuator, join$154), join$154);
        }, [_$5.first(tojoin$150)]);
    }
    function joinSyntaxArr(tojoin$156, punc$157) {
        if (tojoin$156.length === 0) {
            return [];
        }
        if (punc$157 === ' ') {
            return _$5.flatten(tojoin$156, true);
        }
        return _$5.reduce(_$5.rest(tojoin$156, 1), function (acc$159, join$160) {
            return acc$159.concat(mkSyntax(punc$157, parser$6.Token.Punctuator, _$5.first(join$160)), join$160);
        }, _$5.first(tojoin$156));
    }
    function delimIsSeparator(delim$162) {
        return delim$162 && delim$162.token.type === parser$6.Token.Delimiter && delim$162.token.value === '()' && delim$162.token.inner.length === 1 && delim$162.token.inner[0].token.type !== parser$6.Token.Delimiter && !containsPatternVar$550(delim$162.token.inner);
    }
    function freeVarsInPattern(pattern$164) {
        var fv$168 = [];
        _$5.each(pattern$164, function (pat$166) {
            if (isPatternVar(pat$166.token)) {
                fv$168.push(pat$166.token.value);
            } else if (pat$166.token.type === parser$6.Token.Delimiter) {
                fv$168 = fv$168.concat(freeVarsInPattern(pat$166.token.inner));
            }
        });
        return fv$168;
    }
    function patternLength(patterns$169) {
        return _$5.reduce(patterns$169, function (acc$171, pat$172) {
            if (pat$172.token.type === parser$6.Token.Delimiter) {
                return acc$171 + 1 + patternLength(pat$172.token.inner);
            }
            return acc$171 + 1;
        }, 0);
    }
    function matchStx(value$174, stx$175) {
        return stx$175 && stx$175.token && stx$175.token.value === value$174;
    }
    function wrapDelim(towrap$177, delimSyntax$178) {
        parser$6.assert(delimSyntax$178.token.type === parser$6.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser$6.Token.Delimiter,
            value: delimSyntax$178.token.value,
            inner: towrap$177,
            range: delimSyntax$178.token.range,
            startLineNumber: delimSyntax$178.token.startLineNumber,
            lineStart: delimSyntax$178.token.lineStart
        }, delimSyntax$178.context);
    }
    function getParamIdentifiers(argSyntax$180) {
        parser$6.assert(argSyntax$180.token.type === parser$6.Token.Delimiter, 'expecting delimiter for function params');
        return _$5.filter(argSyntax$180.token.inner, function (stx$182) {
            return stx$182.token.value !== ',';
        });
    }
    function isFunctionStx(stx$184) {
        return stx$184 && stx$184.token.type === parser$6.Token.Keyword && stx$184.token.value === 'function';
    }
    function isVarStx(stx$186) {
        return stx$186 && stx$186.token.type === parser$6.Token.Keyword && stx$186.token.value === 'var';
    }
    function varNamesInAST(ast$188) {
        return _$5.map(ast$188, function (item$190) {
            return item$190.id.name;
        });
    }
    function getVarDeclIdentifiers(term$192) {
        var toCheck$203;
        if (term$192.hasPrototype(Block$559) && term$192.body.hasPrototype(Delimiter$568)) {
            toCheck$203 = term$192.body.delim.token.inner;
        } else if (term$192.hasPrototype(Delimiter$568)) {
            toCheck$203 = term$192.delim.token.inner;
        } else {
            parser$6.assert(false, 'expecting a Block or a Delimiter');
        }
        return _$5.reduce(toCheck$203, function (acc$194, curr$195, idx$196, list$197) {
            var prev$202 = list$197[idx$196 - 1];
            if (curr$195.hasPrototype(VariableStatement$578)) {
                return _$5.reduce(curr$195.decls, function (acc$199, decl$200) {
                    return acc$199.concat(decl$200.ident);
                }, acc$194);
            } else if (prev$202 && prev$202.hasPrototype(Keyword$566) && prev$202.keyword.token.value === 'for' && curr$195.hasPrototype(Delimiter$568)) {
                return acc$194.concat(getVarDeclIdentifiers(curr$195));
            } else if (curr$195.hasPrototype(Block$559)) {
                return acc$194.concat(getVarDeclIdentifiers(curr$195));
            }
            return acc$194;
        }, []);
    }
    function replaceVarIdent(stx$204, orig$205, renamed$206) {
        if (stx$204 === orig$205) {
            return renamed$206;
        }
        return stx$204;
    }
    var TermTree$551 = {destruct: function (breakDelim$208) {
                return _$5.reduce(this.properties, _$5.bind(function (acc$210, prop$211) {
                    if (this[prop$211] && this[prop$211].hasPrototype(TermTree$551)) {
                        return acc$210.concat(this[prop$211].destruct(breakDelim$208));
                    } else if (this[prop$211]) {
                        return acc$210.concat(this[prop$211]);
                    } else {
                        return acc$210;
                    }
                }, this), []);
            }};
    var EOF$552 = TermTree$551.extend({
            properties: ['eof'],
            construct: function (e$213) {
                this.eof = e$213;
            }
        });
    var Statement$553 = TermTree$551.extend({construct: function () {
            }});
    var Expr$554 = TermTree$551.extend({construct: function () {
            }});
    var PrimaryExpression$555 = Expr$554.extend({construct: function () {
            }});
    var ThisExpression$556 = PrimaryExpression$555.extend({
            properties: ['this'],
            construct: function (that$218) {
                this.this = that$218;
            }
        });
    var Lit$557 = PrimaryExpression$555.extend({
            properties: ['lit'],
            construct: function (l$220) {
                this.lit = l$220;
            }
        });
    exports$4._test.PropertyAssignment = PropertyAssignment$558;
    var PropertyAssignment$558 = TermTree$551.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$222, assignment$223) {
                this.propName = propName$222;
                this.assignment = assignment$223;
            }
        });
    var Block$559 = PrimaryExpression$555.extend({
            properties: ['body'],
            construct: function (body$225) {
                this.body = body$225;
            }
        });
    var ArrayLiteral$560 = PrimaryExpression$555.extend({
            properties: ['array'],
            construct: function (ar$227) {
                this.array = ar$227;
            }
        });
    var ParenExpression$561 = PrimaryExpression$555.extend({
            properties: ['expr'],
            construct: function (expr$229) {
                this.expr = expr$229;
            }
        });
    var UnaryOp$562 = Expr$554.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$231, expr$232) {
                this.op = op$231;
                this.expr = expr$232;
            }
        });
    var PostfixOp$563 = Expr$554.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$234, op$235) {
                this.expr = expr$234;
                this.op = op$235;
            }
        });
    var BinOp$564 = Expr$554.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$237, left$238, right$239) {
                this.op = op$237;
                this.left = left$238;
                this.right = right$239;
            }
        });
    var ConditionalExpression$565 = Expr$554.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$241, question$242, tru$243, colon$244, fls$245) {
                this.cond = cond$241;
                this.question = question$242;
                this.tru = tru$243;
                this.colon = colon$244;
                this.fls = fls$245;
            }
        });
    var Keyword$566 = TermTree$551.extend({
            properties: ['keyword'],
            construct: function (k$247) {
                this.keyword = k$247;
            }
        });
    var Punc$567 = TermTree$551.extend({
            properties: ['punc'],
            construct: function (p$249) {
                this.punc = p$249;
            }
        });
    var Delimiter$568 = TermTree$551.extend({
            properties: ['delim'],
            destruct: function (breakDelim$251) {
                parser$6.assert(this.delim, 'expecting delim to be defined');
                var innerStx$256 = _$5.reduce(this.delim.token.inner, function (acc$253, term$254) {
                        if (term$254.hasPrototype(TermTree$551)) {
                            return acc$253.concat(term$254.destruct(breakDelim$251));
                        } else {
                            return acc$253.concat(term$254);
                        }
                    }, []);
                if (breakDelim$251) {
                    var openParen$257 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$258 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$257].concat(innerStx$256).concat(closeParen$258);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$259) {
                this.delim = d$259;
            }
        });
    var Id$569 = PrimaryExpression$555.extend({
            properties: ['id'],
            construct: function (id$261) {
                this.id = id$261;
            }
        });
    var NamedFun$570 = Expr$554.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$263, name$264, params$265, body$266) {
                this.keyword = keyword$263;
                this.name = name$264;
                this.params = params$265;
                this.body = body$266;
            }
        });
    var AnonFun$571 = Expr$554.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$268, params$269, body$270) {
                this.keyword = keyword$268;
                this.params = params$269;
                this.body = body$270;
            }
        });
    var Macro$572 = TermTree$551.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$272, body$273) {
                this.name = name$272;
                this.body = body$273;
            }
        });
    var Const$573 = Expr$554.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$275, call$276) {
                this.newterm = newterm$275;
                this.call = call$276;
            }
        });
    var Call$574 = Expr$554.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$278) {
                parser$6.assert(this.fun.hasPrototype(TermTree$551), 'expecting a term tree in destruct of call');
                var that$284 = this;
                this.delim = syntaxFromToken(_$5.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$5.reduce(this.args, function (acc$280, term$281) {
                    parser$6.assert(term$281 && term$281.hasPrototype(TermTree$551), 'expecting term trees in destruct of Call');
                    var dst$283 = acc$280.concat(term$281.destruct(breakDelim$278));
                    if (that$284.commas.length > 0) {
                        dst$283 = dst$283.concat(that$284.commas.shift());
                    }
                    return dst$283;
                }, []);
                return this.fun.destruct(breakDelim$278).concat(Delimiter$568.create(this.delim).destruct(breakDelim$278));
            },
            construct: function (fun$285, args$286, delim$287, commas$288) {
                parser$6.assert(Array.isArray(args$286), 'requires an array of arguments terms');
                this.fun = fun$285;
                this.args = args$286;
                this.delim = delim$287;
                this.commas = commas$288;
            }
        });
    var ObjDotGet$575 = Expr$554.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$290, dot$291, right$292) {
                this.left = left$290;
                this.dot = dot$291;
                this.right = right$292;
            }
        });
    var ObjGet$576 = Expr$554.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$294, right$295) {
                this.left = left$294;
                this.right = right$295;
            }
        });
    var VariableDeclaration$577 = TermTree$551.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$297, eqstx$298, init$299, comma$300) {
                this.ident = ident$297;
                this.eqstx = eqstx$298;
                this.init = init$299;
                this.comma = comma$300;
            }
        });
    var VariableStatement$578 = Statement$553.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$302) {
                return this.varkw.destruct(breakDelim$302).concat(_$5.reduce(this.decls, function (acc$304, decl$305) {
                    return acc$304.concat(decl$305.destruct(breakDelim$302));
                }, []));
            },
            construct: function (varkw$307, decls$308) {
                parser$6.assert(Array.isArray(decls$308), 'decls must be an array');
                this.varkw = varkw$307;
                this.decls = decls$308;
            }
        });
    function stxIsUnaryOp(stx$310) {
        var staticOperators$312 = [
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
        return _$5.contains(staticOperators$312, stx$310.token.value);
    }
    function stxIsBinOp(stx$313) {
        var staticOperators$315 = [
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
        return _$5.contains(staticOperators$315, stx$313.token.value);
    }
    function enforestVarStatement(stx$316, env$317) {
        parser$6.assert(stx$316[0] && stx$316[0].token.type === parser$6.Token.Identifier, 'must start at the identifier');
        var decls$319 = [], rest$320 = stx$316, initRes$321, subRes$322;
        if (stx$316[1] && stx$316[1].token.type === parser$6.Token.Punctuator && stx$316[1].token.value === '=') {
            initRes$321 = enforest(stx$316.slice(2), env$317);
            if (initRes$321.result.hasPrototype(Expr$554)) {
                rest$320 = initRes$321.rest;
                if (initRes$321.rest[0].token.type === parser$6.Token.Punctuator && initRes$321.rest[0].token.value === ',' && initRes$321.rest[1] && initRes$321.rest[1].token.type === parser$6.Token.Identifier) {
                    decls$319.push(VariableDeclaration$577.create(stx$316[0], stx$316[1], initRes$321.result, initRes$321.rest[0]));
                    subRes$322 = enforestVarStatement(initRes$321.rest.slice(1), env$317);
                    decls$319 = decls$319.concat(subRes$322.result);
                    rest$320 = subRes$322.rest;
                } else {
                    decls$319.push(VariableDeclaration$577.create(stx$316[0], stx$316[1], initRes$321.result));
                }
            } else {
                parser$6.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$316[1] && stx$316[1].token.type === parser$6.Token.Punctuator && stx$316[1].token.value === ',') {
            decls$319.push(VariableDeclaration$577.create(stx$316[0], null, null, stx$316[1]));
            subRes$322 = enforestVarStatement(stx$316.slice(2), env$317);
            decls$319 = decls$319.concat(subRes$322.result);
            rest$320 = subRes$322.rest;
        } else {
            decls$319.push(VariableDeclaration$577.create(stx$316[0]));
            rest$320 = stx$316.slice(1);
        }
        return {
            result: decls$319,
            rest: rest$320
        };
    }
    function enforest(toks$323, env$324) {
        env$324 = env$324 || new Map();
        parser$6.assert(toks$323.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$326, rest$327) {
            var innerTokens$331;
            parser$6.assert(Array.isArray(rest$327), 'result must at least be an empty array');
            if (head$326.hasPrototype(TermTree$551)) {
                if (head$326.hasPrototype(Expr$554) && rest$327[0] && rest$327[0].token.type === parser$6.Token.Delimiter && rest$327[0].token.value === '()') {
                    var argRes$332, enforestedArgs$333 = [], commas$334 = [];
                    innerTokens$331 = rest$327[0].token.inner;
                    while (innerTokens$331.length > 0) {
                        argRes$332 = enforest(innerTokens$331, env$324);
                        enforestedArgs$333.push(argRes$332.result);
                        innerTokens$331 = argRes$332.rest;
                        if (innerTokens$331[0] && innerTokens$331[0].token.value === ',') {
                            commas$334.push(innerTokens$331[0]);
                            innerTokens$331 = innerTokens$331.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$335 = _$5.all(enforestedArgs$333, function (argTerm$329) {
                            return argTerm$329.hasPrototype(Expr$554);
                        });
                    if (innerTokens$331.length === 0 && argsAreExprs$335) {
                        return step(Call$574.create(head$326, enforestedArgs$333, rest$327[0], commas$334), rest$327.slice(1));
                    }
                } else if (head$326.hasPrototype(Keyword$566) && head$326.keyword.token.value === 'new' && rest$327[0]) {
                    var newCallRes$336 = enforest(rest$327, env$324);
                    if (newCallRes$336.result.hasPrototype(Call$574)) {
                        return step(Const$573.create(head$326, newCallRes$336.result), newCallRes$336.rest);
                    }
                } else if (head$326.hasPrototype(Expr$554) && rest$327[0] && rest$327[0].token.value === '?') {
                    var question$337 = rest$327[0];
                    var condRes$338 = enforest(rest$327.slice(1), env$324);
                    var truExpr$339 = condRes$338.result;
                    var right$340 = condRes$338.rest;
                    if (truExpr$339.hasPrototype(Expr$554) && right$340[0] && right$340[0].token.value === ':') {
                        var colon$341 = right$340[0];
                        var flsRes$342 = enforest(right$340.slice(1), env$324);
                        var flsExpr$343 = flsRes$342.result;
                        if (flsExpr$343.hasPrototype(Expr$554)) {
                            return step(ConditionalExpression$565.create(head$326, question$337, truExpr$339, colon$341, flsExpr$343), flsRes$342.rest);
                        }
                    }
                } else if (head$326.hasPrototype(Delimiter$568) && head$326.delim.token.value === '()') {
                    innerTokens$331 = head$326.delim.token.inner;
                    if (innerTokens$331.length === 0) {
                        return step(ParenExpression$561.create(head$326), rest$327);
                    } else {
                        var innerTerm$344 = get_expression(innerTokens$331, env$324);
                        if (innerTerm$344.result && innerTerm$344.result.hasPrototype(Expr$554)) {
                            return step(ParenExpression$561.create(head$326), rest$327);
                        }
                    }
                } else if (rest$327[0] && rest$327[1] && stxIsBinOp(rest$327[0])) {
                    var op$345 = rest$327[0];
                    var left$346 = head$326;
                    var bopRes$347 = enforest(rest$327.slice(1), env$324);
                    var right$340 = bopRes$347.result;
                    if (right$340.hasPrototype(Expr$554)) {
                        return step(BinOp$564.create(op$345, left$346, right$340), bopRes$347.rest);
                    }
                } else if (head$326.hasPrototype(Punc$567) && stxIsUnaryOp(head$326.punc) || head$326.hasPrototype(Keyword$566) && stxIsUnaryOp(head$326.keyword)) {
                    var unopRes$348 = enforest(rest$327);
                    var op$345 = head$326.hasPrototype(Punc$567) ? head$326.punc : head$326.keyword;
                    if (unopRes$348.result.hasPrototype(Expr$554)) {
                        return step(UnaryOp$562.create(op$345, unopRes$348.result), unopRes$348.rest);
                    }
                } else if (head$326.hasPrototype(Expr$554) && rest$327[0] && (rest$327[0].token.value === '++' || rest$327[0].token.value === '--')) {
                    return step(PostfixOp$563.create(head$326, rest$327[0]), rest$327.slice(1));
                } else if (head$326.hasPrototype(Expr$554) && rest$327[0] && rest$327[0].token.value === '[]') {
                    var getRes$349 = enforest(rest$327[0].token.inner, env$324);
                    var resStx$350 = mkSyntax('[]', parser$6.Token.Delimiter, rest$327[0]);
                    resStx$350.token.inner = [getRes$349.result];
                    if (getRes$349.rest.length > 0) {
                        return step(ObjGet$576.create(head$326, Delimiter$568.create(resStx$350)), rest$327.slice(1));
                    }
                } else if (head$326.hasPrototype(Expr$554) && rest$327[0] && rest$327[0].token.value === '.' && rest$327[1] && rest$327[1].token.type === parser$6.Token.Identifier) {
                    return step(ObjDotGet$575.create(head$326, rest$327[0], rest$327[1]), rest$327.slice(2));
                } else if (head$326.hasPrototype(Delimiter$568) && head$326.delim.token.value === '[]') {
                    return step(ArrayLiteral$560.create(head$326), rest$327);
                } else if (head$326.hasPrototype(Delimiter$568) && head$326.delim.token.value === '{}') {
                    innerTokens$331 = head$326.delim.token.inner;
                    return step(Block$559.create(head$326), rest$327);
                } else if (head$326.hasPrototype(Keyword$566) && head$326.keyword.token.value === 'var' && rest$327[0] && rest$327[0].token.type === parser$6.Token.Identifier) {
                    var vsRes$351 = enforestVarStatement(rest$327, env$324);
                    if (vsRes$351) {
                        return step(VariableStatement$578.create(head$326, vsRes$351.result), vsRes$351.rest);
                    }
                }
            } else {
                parser$6.assert(head$326 && head$326.token, 'assuming head is a syntax object');
                if ((head$326.token.type === parser$6.Token.Identifier || head$326.token.type === parser$6.Token.Keyword) && env$324.has(head$326.token.value)) {
                    var transformer$352 = env$324.get(head$326.token.value);
                    var rt$353 = transformer$352(rest$327, head$326, env$324);
                    return step(rt$353.result[0], rt$353.result.slice(1).concat(rt$353.rest));
                } else if (head$326.token.type === parser$6.Token.Identifier && head$326.token.value === 'macro' && rest$327[0] && (rest$327[0].token.type === parser$6.Token.Identifier || rest$327[0].token.type === parser$6.Token.Keyword) && rest$327[1] && rest$327[1].token.type === parser$6.Token.Delimiter && rest$327[1].token.value === '{}') {
                    return step(Macro$572.create(rest$327[0], rest$327[1].token.inner), rest$327.slice(2));
                } else if (head$326.token.type === parser$6.Token.Keyword && head$326.token.value === 'function' && rest$327[0] && rest$327[0].token.type === parser$6.Token.Identifier && rest$327[1] && rest$327[1].token.type === parser$6.Token.Delimiter && rest$327[1].token.value === '()' && rest$327[2] && rest$327[2].token.type === parser$6.Token.Delimiter && rest$327[2].token.value === '{}') {
                    return step(NamedFun$570.create(head$326, rest$327[0], rest$327[1], rest$327[2]), rest$327.slice(3));
                } else if (head$326.token.type === parser$6.Token.Keyword && head$326.token.value === 'function' && rest$327[0] && rest$327[0].token.type === parser$6.Token.Delimiter && rest$327[0].token.value === '()' && rest$327[1] && rest$327[1].token.type === parser$6.Token.Delimiter && rest$327[1].token.value === '{}') {
                    return step(AnonFun$571.create(head$326, rest$327[0], rest$327[1]), rest$327.slice(2));
                } else if (head$326.token.type === parser$6.Token.Keyword && head$326.token.value === 'this') {
                    return step(ThisExpression$556.create(head$326), rest$327);
                } else if (head$326.token.type === parser$6.Token.NumericLiteral || head$326.token.type === parser$6.Token.StringLiteral || head$326.token.type === parser$6.Token.BooleanLiteral || head$326.token.type === parser$6.Token.RegexLiteral || head$326.token.type === parser$6.Token.NullLiteral) {
                    return step(Lit$557.create(head$326), rest$327);
                } else if (head$326.token.type === parser$6.Token.Identifier) {
                    return step(Id$569.create(head$326), rest$327);
                } else if (head$326.token.type === parser$6.Token.Punctuator) {
                    return step(Punc$567.create(head$326), rest$327);
                } else if (head$326.token.type === parser$6.Token.Keyword && head$326.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$326.token.type === parser$6.Token.Keyword) {
                    return step(Keyword$566.create(head$326), rest$327);
                } else if (head$326.token.type === parser$6.Token.Delimiter) {
                    return step(Delimiter$568.create(head$326), rest$327);
                } else if (head$326.token.type === parser$6.Token.EOF) {
                    parser$6.assert(rest$327.length === 0, 'nothing should be after an EOF');
                    return step(EOF$552.create(head$326), []);
                } else {
                    parser$6.assert(false, 'not implemented');
                }
            }
            return {
                result: head$326,
                rest: rest$327
            };
        }
        return step(toks$323[0], toks$323.slice(1));
    }
    function get_expression(stx$354, env$355) {
        var res$357 = enforest(stx$354, env$355);
        if (!res$357.result.hasPrototype(Expr$554)) {
            return {
                result: null,
                rest: stx$354
            };
        }
        return res$357;
    }
    function typeIsLiteral(type$358) {
        return type$358 === parser$6.Token.NullLiteral || type$358 === parser$6.Token.NumericLiteral || type$358 === parser$6.Token.StringLiteral || type$358 === parser$6.Token.RegexLiteral || type$358 === parser$6.Token.BooleanLiteral;
    }
    exports$4._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$360, stx$361, env$362) {
        var result$364, rest$365;
        if (patternClass$360 === 'token' && stx$361[0] && stx$361[0].token.type !== parser$6.Token.EOF) {
            result$364 = [stx$361[0]];
            rest$365 = stx$361.slice(1);
        } else if (patternClass$360 === 'lit' && stx$361[0] && typeIsLiteral(stx$361[0].token.type)) {
            result$364 = [stx$361[0]];
            rest$365 = stx$361.slice(1);
        } else if (patternClass$360 === 'ident' && stx$361[0] && stx$361[0].token.type === parser$6.Token.Identifier) {
            result$364 = [stx$361[0]];
            rest$365 = stx$361.slice(1);
        } else if (patternClass$360 === 'VariableStatement') {
            var match$366 = enforest(stx$361, env$362);
            if (match$366.result && match$366.result.hasPrototype(VariableStatement$578)) {
                result$364 = match$366.result.destruct(false);
                rest$365 = match$366.rest;
            } else {
                result$364 = null;
                rest$365 = stx$361;
            }
        } else if (patternClass$360 === 'expr') {
            var match$366 = get_expression(stx$361, env$362);
            if (match$366.result === null || !match$366.result.hasPrototype(Expr$554)) {
                result$364 = null;
                rest$365 = stx$361;
            } else {
                result$364 = match$366.result.destruct(false);
                rest$365 = match$366.rest;
            }
        } else {
            result$364 = null;
            rest$365 = stx$361;
        }
        return {
            result: result$364,
            rest: rest$365
        };
    }
    function matchPattern(pattern$367, stx$368, env$369, patternEnv$370) {
        var subMatch$375;
        var match$376, matchEnv$377;
        var rest$378;
        var success$379;
        if (stx$368.length === 0) {
            return {
                success: false,
                rest: stx$368,
                patternEnv: patternEnv$370
            };
        }
        parser$6.assert(stx$368.length > 0, 'should have had something to match here');
        if (pattern$367.token.type === parser$6.Token.Delimiter) {
            if (pattern$367.class === 'pattern_group') {
                subMatch$375 = matchPatterns(pattern$367.token.inner, stx$368, env$369, false);
                rest$378 = subMatch$375.rest;
            } else if (stx$368[0].token.type === parser$6.Token.Delimiter && stx$368[0].token.value === pattern$367.token.value) {
                subMatch$375 = matchPatterns(pattern$367.token.inner, stx$368[0].token.inner, env$369, false);
                rest$378 = stx$368.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$368,
                    patternEnv: patternEnv$370
                };
            }
            success$379 = subMatch$375.success;
            _$5.keys(subMatch$375.patternEnv).forEach(function (patternKey$372) {
                if (pattern$367.repeat) {
                    var nextLevel$374 = subMatch$375.patternEnv[patternKey$372].level + 1;
                    if (patternEnv$370[patternKey$372]) {
                        patternEnv$370[patternKey$372].level = nextLevel$374;
                        patternEnv$370[patternKey$372].match.push(subMatch$375.patternEnv[patternKey$372]);
                    } else {
                        patternEnv$370[patternKey$372] = {
                            level: nextLevel$374,
                            match: [subMatch$375.patternEnv[patternKey$372]]
                        };
                    }
                } else {
                    patternEnv$370[patternKey$372] = subMatch$375.patternEnv[patternKey$372];
                }
            });
        } else {
            if (pattern$367.class === 'pattern_literal') {
                if (pattern$367.token.value === stx$368[0].token.value) {
                    success$379 = true;
                    rest$378 = stx$368.slice(1);
                } else {
                    success$379 = false;
                    rest$378 = stx$368;
                }
            } else {
                match$376 = matchPatternClass(pattern$367.class, stx$368, env$369);
                success$379 = match$376.result !== null;
                rest$378 = match$376.rest;
                matchEnv$377 = {
                    level: 0,
                    match: match$376.result
                };
                if (match$376.result !== null) {
                    if (pattern$367.repeat) {
                        if (patternEnv$370[pattern$367.token.value]) {
                            patternEnv$370[pattern$367.token.value].match.push(matchEnv$377);
                        } else {
                            patternEnv$370[pattern$367.token.value] = {
                                level: 1,
                                match: [matchEnv$377]
                            };
                        }
                    } else {
                        patternEnv$370[pattern$367.token.value] = matchEnv$377;
                    }
                }
            }
        }
        return {
            success: success$379,
            rest: rest$378,
            patternEnv: patternEnv$370
        };
    }
    function matchPatterns(patterns$380, stx$381, env$382, topLevel$383) {
        topLevel$383 = topLevel$383 || false;
        var result$385 = [];
        var patternEnv$386 = {};
        var match$387;
        var pattern$388;
        var rest$389 = stx$381;
        var success$390 = true;
        for (var i$391 = 0; i$391 < patterns$380.length; i$391++) {
            pattern$388 = patterns$380[i$391];
            do {
                match$387 = matchPattern(pattern$388, rest$389, env$382, patternEnv$386);
                if (!match$387.success) {
                    success$390 = false;
                }
                rest$389 = match$387.rest;
                patternEnv$386 = match$387.patternEnv;
                if (pattern$388.repeat && success$390) {
                    if (rest$389[0] && rest$389[0].token.value === pattern$388.separator) {
                        rest$389 = rest$389.slice(1);
                    } else if (pattern$388.separator === ' ') {
                        continue;
                    } else if (pattern$388.separator !== ' ' && rest$389.length > 0 && i$391 === patterns$380.length - 1 && topLevel$383 === false) {
                        success$390 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$388.repeat && match$387.success && rest$389.length > 0);
        }
        return {
            success: success$390,
            rest: rest$389,
            patternEnv: patternEnv$386
        };
    }
    function transcribe(macroBody$392, macroNameStx$393, env$394) {
        return _$5.chain(macroBody$392).reduce(function (acc$396, bodyStx$397, idx$398, original$399) {
            var last$401 = original$399[idx$398 - 1];
            var next$402 = original$399[idx$398 + 1];
            var nextNext$403 = original$399[idx$398 + 2];
            if (bodyStx$397.token.value === '...') {
                return acc$396;
            }
            if (delimIsSeparator(bodyStx$397) && next$402 && next$402.token.value === '...') {
                return acc$396;
            }
            if (bodyStx$397.token.value === '$' && next$402 && next$402.token.type === parser$6.Token.Delimiter && next$402.token.value === '()') {
                return acc$396;
            }
            if (bodyStx$397.token.value === '$' && next$402 && next$402.token.type === parser$6.Token.Delimiter && next$402.token.value === '[]') {
                next$402.literal = true;
                return acc$396;
            }
            if (bodyStx$397.token.type === parser$6.Token.Delimiter && bodyStx$397.token.value === '()' && last$401 && last$401.token.value === '$') {
                bodyStx$397.group = true;
            }
            if (bodyStx$397.literal === true) {
                parser$6.assert(bodyStx$397.token.type === parser$6.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$396.concat(bodyStx$397.token.inner);
            }
            if (next$402 && next$402.token.value === '...') {
                bodyStx$397.repeat = true;
                bodyStx$397.separator = ' ';
            } else if (delimIsSeparator(next$402) && nextNext$403 && nextNext$403.token.value === '...') {
                bodyStx$397.repeat = true;
                bodyStx$397.separator = next$402.token.inner[0].token.value;
            }
            return acc$396.concat(bodyStx$397);
        }, []).reduce(function (acc$404, bodyStx$405, idx$406) {
            if (bodyStx$405.repeat) {
                if (bodyStx$405.token.type === parser$6.Token.Delimiter) {
                    var fv$422 = _$5.filter(freeVarsInPattern(bodyStx$405.token.inner), function (pat$408) {
                            return env$394.hasOwnProperty(pat$408);
                        });
                    var restrictedEnv$423 = [];
                    var nonScalar$424 = _$5.find(fv$422, function (pat$410) {
                            return env$394[pat$410].level > 0;
                        });
                    parser$6.assert(typeof nonScalar$424 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$425 = env$394[nonScalar$424].match.length;
                    var sameLength$426 = _$5.all(fv$422, function (pat$412) {
                            return env$394[pat$412].level === 0 || env$394[pat$412].match.length === repeatLength$425;
                        });
                    parser$6.assert(sameLength$426, 'all non-scalars must have the same length');
                    restrictedEnv$423 = _$5.map(_$5.range(repeatLength$425), function (idx$414) {
                        var renv$418 = {};
                        _$5.each(fv$422, function (pat$416) {
                            if (env$394[pat$416].level === 0) {
                                renv$418[pat$416] = env$394[pat$416];
                            } else {
                                renv$418[pat$416] = env$394[pat$416].match[idx$414];
                            }
                        });
                        return renv$418;
                    });
                    var transcribed$427 = _$5.map(restrictedEnv$423, function (renv$419) {
                            if (bodyStx$405.group) {
                                return transcribe(bodyStx$405.token.inner, macroNameStx$393, renv$419);
                            } else {
                                var newBody$421 = syntaxFromToken(_$5.clone(bodyStx$405.token), bodyStx$405.context);
                                newBody$421.token.inner = transcribe(bodyStx$405.token.inner, macroNameStx$393, renv$419);
                                return newBody$421;
                            }
                        });
                    var joined$428;
                    if (bodyStx$405.group) {
                        joined$428 = joinSyntaxArr(transcribed$427, bodyStx$405.separator);
                    } else {
                        joined$428 = joinSyntax(transcribed$427, bodyStx$405.separator);
                    }
                    return acc$404.concat(joined$428);
                }
                parser$6.assert(env$394[bodyStx$405.token.value].level === 1, 'ellipses level does not match');
                return acc$404.concat(joinRepeatedMatch(env$394[bodyStx$405.token.value].match, bodyStx$405.separator));
            } else {
                if (bodyStx$405.token.type === parser$6.Token.Delimiter) {
                    var newBody$429 = syntaxFromToken(_$5.clone(bodyStx$405.token), macroBody$392.context);
                    newBody$429.token.inner = transcribe(bodyStx$405.token.inner, macroNameStx$393, env$394);
                    return acc$404.concat(newBody$429);
                }
                if (Object.prototype.hasOwnProperty.bind(env$394)(bodyStx$405.token.value)) {
                    parser$6.assert(env$394[bodyStx$405.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$405.token.value);
                    return acc$404.concat(takeLineContext(macroNameStx$393, env$394[bodyStx$405.token.value].match));
                }
                return acc$404.concat(takeLineContext(macroNameStx$393, [bodyStx$405]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$430, env$431) {
        function dfs(match$433) {
            if (match$433.level === 0) {
                match$433.match = _$5.map(match$433.match, function (stx$435) {
                    return stx$435.mark(newMark$430);
                });
            } else {
                _$5.each(match$433.match, function (match$437) {
                    dfs(match$437);
                });
            }
        }
        _$5.keys(env$431).forEach(function (key$439) {
            dfs(env$431[key$439]);
        });
    }
    function makeTransformer(cases$441, macroName$442) {
        var sortedCases$458 = _$5.sortBy(cases$441, function (mcase$444) {
                return patternLength(mcase$444.pattern);
            }).reverse();
        return function transformer(stx$446, macroNameStx$447, env$448) {
            var match$452;
            var casePattern$453, caseBody$454;
            var newMark$455;
            var macroResult$456;
            for (var i$457 = 0; i$457 < sortedCases$458.length; i$457++) {
                casePattern$453 = sortedCases$458[i$457].pattern;
                caseBody$454 = sortedCases$458[i$457].body;
                match$452 = matchPatterns(casePattern$453, stx$446, env$448, true);
                if (match$452.success) {
                    newMark$455 = fresh();
                    applyMarkToPatternEnv(newMark$455, match$452.patternEnv);
                    macroResult$456 = transcribe(caseBody$454, macroNameStx$447, match$452.patternEnv);
                    macroResult$456 = _$5.map(macroResult$456, function (stx$450) {
                        return stx$450.mark(newMark$455);
                    });
                    return {
                        result: macroResult$456,
                        rest: match$452.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$447.token.value);
        };
    }
    function findCase(start$459, stx$460) {
        parser$6.assert(start$459 >= 0 && start$459 < stx$460.length, 'start out of bounds');
        var idx$462 = start$459;
        while (idx$462 < stx$460.length) {
            if (stx$460[idx$462].token.value === 'case') {
                return idx$462;
            }
            idx$462++;
        }
        return -1;
    }
    function findCaseArrow(start$463, stx$464) {
        parser$6.assert(start$463 >= 0 && start$463 < stx$464.length, 'start out of bounds');
        var idx$466 = start$463;
        while (idx$466 < stx$464.length) {
            if (stx$464[idx$466].token.value === '=' && stx$464[idx$466 + 1] && stx$464[idx$466 + 1].token.value === '>') {
                return idx$466;
            }
            idx$466++;
        }
        return -1;
    }
    function loadMacroDef(mac$467) {
        var body$469 = mac$467.body;
        var caseOffset$470 = 0;
        var arrowOffset$471 = 0;
        var casePattern$472;
        var caseBody$473;
        var caseBodyIdx$474;
        var cases$475 = [];
        while (caseOffset$470 < body$469.length && body$469[caseOffset$470].token.value === 'case') {
            arrowOffset$471 = findCaseArrow(caseOffset$470, body$469);
            if (arrowOffset$471 > 0 && arrowOffset$471 < body$469.length) {
                caseBodyIdx$474 = arrowOffset$471 + 2;
                if (caseBodyIdx$474 >= body$469.length) {
                    throwError('case body missing in macro definition');
                }
                casePattern$472 = body$469.slice(caseOffset$470 + 1, arrowOffset$471);
                caseBody$473 = body$469[caseBodyIdx$474].token.inner;
                cases$475.push({
                    pattern: loadPattern(casePattern$472, mac$467.name),
                    body: caseBody$473
                });
            } else {
                throwError('case body missing in macro definition');
            }
            caseOffset$470 = findCase(arrowOffset$471, body$469);
            if (caseOffset$470 < 0) {
                break;
            }
        }
        return makeTransformer(cases$475);
    }
    function expandToTermTree(stx$476, env$477) {
        parser$6.assert(env$477, 'environment map is required');
        if (stx$476.length === 0) {
            return {
                terms: [],
                env: env$477
            };
        }
        parser$6.assert(stx$476[0].token, 'expecting a syntax object');
        var f$479 = enforest(stx$476, env$477);
        var head$480 = f$479.result;
        var rest$481 = f$479.rest;
        if (head$480.hasPrototype(Macro$572)) {
            var macroDefinition$482 = loadMacroDef(head$480);
            env$477.set(head$480.name.token.value, macroDefinition$482);
            return expandToTermTree(rest$481, env$477);
        }
        var trees$483 = expandToTermTree(rest$481, env$477);
        return {
            terms: [head$480].concat(trees$483.terms),
            env: trees$483.env
        };
    }
    function expandTermTreeToFinal(term$484, env$485, ctx$486) {
        parser$6.assert(env$485, 'environment map is required');
        parser$6.assert(ctx$486, 'context map is required');
        if (term$484.hasPrototype(ArrayLiteral$560)) {
            term$484.array.delim.token.inner = expand(term$484.array.delim.token.inner, env$485);
            return term$484;
        } else if (term$484.hasPrototype(Block$559)) {
            term$484.body.delim.token.inner = expand(term$484.body.delim.token.inner, env$485);
            return term$484;
        } else if (term$484.hasPrototype(ParenExpression$561)) {
            term$484.expr.delim.token.inner = expand(term$484.expr.delim.token.inner, env$485, ctx$486);
            return term$484;
        } else if (term$484.hasPrototype(Call$574)) {
            term$484.fun = expandTermTreeToFinal(term$484.fun, env$485, ctx$486);
            term$484.args = _$5.map(term$484.args, function (arg$488) {
                return expandTermTreeToFinal(arg$488, env$485, ctx$486);
            });
            return term$484;
        } else if (term$484.hasPrototype(UnaryOp$562)) {
            term$484.expr = expandTermTreeToFinal(term$484.expr, env$485, ctx$486);
            return term$484;
        } else if (term$484.hasPrototype(BinOp$564)) {
            term$484.left = expandTermTreeToFinal(term$484.left, env$485, ctx$486);
            term$484.right = expandTermTreeToFinal(term$484.right, env$485, ctx$486);
            return term$484;
        } else if (term$484.hasPrototype(ObjDotGet$575)) {
            term$484.left = expandTermTreeToFinal(term$484.left, env$485, ctx$486);
            term$484.right = expandTermTreeToFinal(term$484.right, env$485, ctx$486);
            return term$484;
        } else if (term$484.hasPrototype(VariableDeclaration$577)) {
            if (term$484.init) {
                term$484.init = expandTermTreeToFinal(term$484.init, env$485, ctx$486);
            }
            return term$484;
        } else if (term$484.hasPrototype(VariableStatement$578)) {
            term$484.decls = _$5.map(term$484.decls, function (decl$490) {
                return expandTermTreeToFinal(decl$490, env$485, ctx$486);
            });
            return term$484;
        } else if (term$484.hasPrototype(Delimiter$568)) {
            term$484.delim.token.inner = expand(term$484.delim.token.inner, env$485);
            return term$484;
        } else if (term$484.hasPrototype(NamedFun$570) || term$484.hasPrototype(AnonFun$571)) {
            var paramNames$514 = _$5.map(getParamIdentifiers(term$484.params), function (param$492) {
                    var freshName$494 = fresh();
                    return {
                        freshName: freshName$494,
                        originalParam: param$492,
                        renamedParam: param$492.rename(param$492, freshName$494)
                    };
                });
            var newCtx$515 = ctx$486;
            var stxBody$516 = term$484.body;
            var renamedBody$517 = _$5.reduce(paramNames$514, function (accBody$495, p$496) {
                    return accBody$495.rename(p$496.originalParam, p$496.freshName);
                }, stxBody$516);
            var dummyName$518 = fresh();
            renamedBody$517 = renamedBody$517.push_dummy_rename(dummyName$518);
            var bodyTerms$519 = expand([renamedBody$517], env$485, newCtx$515);
            parser$6.assert(bodyTerms$519.length === 1 && bodyTerms$519[0].body, 'expecting a block in the bodyTerms');
            var varIdents$520 = getVarDeclIdentifiers(bodyTerms$519[0]);
            varIdents$520 = _$5.filter(varIdents$520, function (varId$498) {
                return !_$5.any(paramNames$514, function (p$500) {
                    return resolve(varId$498) === resolve(p$500.renamedParam);
                });
            });
            varIdents$520 = _$5.uniq(varIdents$520, false, function (v$502) {
                return resolve(v$502);
            });
            var varNames$521 = _$5.map(varIdents$520, function (ident$504) {
                    var freshName$506 = fresh();
                    return {
                        freshName: freshName$506,
                        dummyName: dummyName$518,
                        originalVar: ident$504,
                        renamedVar: ident$504.swap_dummy_rename([{
                                freshName: freshName$506,
                                originalVar: ident$504
                            }], dummyName$518)
                    };
                });
            var flattenedBody$522 = _$5.map(flatten(bodyTerms$519), function (stx$507) {
                    var isDecl$511;
                    if (stx$507.token.type === parser$6.Token.Identifier) {
                        isDecl$511 = _$5.find(varNames$521, function (v$509) {
                            return v$509.originalVar === stx$507;
                        });
                        if (isDecl$511) {
                            return isDecl$511.renamedVar;
                        }
                        return stx$507.swap_dummy_rename(varNames$521, dummyName$518);
                    }
                    return stx$507;
                });
            var renamedParams$523 = _$5.map(paramNames$514, function (p$512) {
                    return p$512.renamedParam;
                });
            var flatArgs$524 = wrapDelim(joinSyntax(renamedParams$523, ','), term$484.params);
            var expandedArgs$525 = expand([flatArgs$524], env$485, ctx$486);
            parser$6.assert(expandedArgs$525.length === 1, 'should only get back one result');
            term$484.params = expandedArgs$525[0];
            term$484.body = flattenedBody$522;
            return term$484;
        }
        return term$484;
    }
    function expand(stx$526, env$527, ctx$528) {
        env$527 = env$527 || new Map();
        ctx$528 = ctx$528 || new Map();
        var trees$532 = expandToTermTree(stx$526, env$527, ctx$528);
        return _$5.map(trees$532.terms, function (term$530) {
            return expandTermTreeToFinal(term$530, trees$532.env, ctx$528);
        });
    }
    function expandTopLevel(stx$533) {
        var fun$535 = syntaxFromToken({
                value: 'function',
                type: parser$6.Token.Keyword
            });
        var name$536 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$6.Token.Identifier
            });
        var params$537 = syntaxFromToken({
                value: '()',
                type: parser$6.Token.Delimiter,
                inner: []
            });
        var body$538 = syntaxFromToken({
                value: '{}',
                type: parser$6.Token.Delimiter,
                inner: stx$533
            });
        var res$539 = expand([
                fun$535,
                name$536,
                params$537,
                body$538
            ]);
        return res$539[0].body.slice(1, res$539[0].body.length - 1);
    }
    function flatten(terms$540) {
        return _$5.reduce(terms$540, function (acc$542, term$543) {
            return acc$542.concat(term$543.destruct(true));
        }, []);
    }
    exports$4.enforest = enforest;
    exports$4.expand = expandTopLevel;
    exports$4.resolve = resolve;
    exports$4.flatten = flatten;
    exports$4.tokensToSyntax = tokensToSyntax;
    exports$4.syntaxToTokens = syntaxToTokens;
}));