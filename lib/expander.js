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
        factory$2(root$1.expander = {}, root$1._, root$1.parser, root$1.es6);
    }
}(this, function (exports$4, _$5, parser$6, es6$7) {
    'use strict';
    exports$4._test = {};
    Object.prototype.create = function () {
        var o$10 = Object.create(this);
        if (typeof o$10.construct === 'function') {
            o$10.construct.apply(o$10, arguments);
        }
        return o$10;
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
    var isMark$549 = function isMark$549(m$28) {
        return m$28 && typeof m$28.mark !== 'undefined';
    };
    function Rename(id$30, name$31, ctx$32) {
        return {
            id: id$30,
            name: name$31,
            context: ctx$32
        };
    }
    var isRename$550 = function (r$34) {
        return r$34 && typeof r$34.id !== 'undefined' && typeof r$34.name !== 'undefined';
    };
    function DummyRename(name$36, ctx$37) {
        return {
            dummy_name: name$36,
            context: ctx$37
        };
    }
    var isDummyRename$551 = function (r$39) {
        return r$39 && typeof r$39.dummy_name !== 'undefined';
    };
    var syntaxProto$552 = {
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
        if (isDummyRename$551(ctx$70) && ctx$70.dummy_name === dummyName$72) {
            return _$5.reduce(varNames$71, function (accCtx$74, v$75) {
                return Rename(v$75.originalVar, v$75.freshName, accCtx$74);
            }, ctx$70.context);
        }
        if (isDummyRename$551(ctx$70) && ctx$70.dummy_name !== dummyName$72) {
            return DummyRename(ctx$70.dummy_name, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        if (isMark$549(ctx$70)) {
            return Mark(ctx$70.mark, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        if (isRename$550(ctx$70)) {
            return Rename(ctx$70.id.swap_dummy_rename(varNames$71, dummyName$72), ctx$70.name, renameDummyCtx(ctx$70.context, varNames$71, dummyName$72));
        }
        parser$6.assert(false, 'expecting a fixed set of context types');
    }
    function findDummyParent(ctx$77, dummyName$78) {
        if (ctx$77 === null || ctx$77.context === null) {
            return null;
        }
        if (isDummyRename$551(ctx$77.context) && ctx$77.context.dummy_name === dummyName$78) {
            return ctx$77;
        }
        return findDummyParent(ctx$77.context);
    }
    function syntaxFromToken(token$80, oldctx$81) {
        var ctx$83 = typeof oldctx$81 !== 'undefined' ? oldctx$81 : null;
        return Object.create(syntaxProto$552, {
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
        if (isMark$549(ctx$87)) {
            mark$90 = ctx$87.mark;
            submarks$91 = marksof(ctx$87.context, stopName$88);
            return remdup(mark$90, submarks$91);
        }
        if (isDummyRename$551(ctx$87)) {
            return marksof(ctx$87.context);
        }
        if (isRename$550(ctx$87)) {
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
        if (isMark$549(ctx$99) || isDummyRename$551(ctx$99)) {
            return resolveCtx(originalName$98, ctx$99.context);
        }
        if (isRename$550(ctx$99)) {
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
    var nextFresh$553 = 0;
    function fresh() {
        return nextFresh$553++;
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
    var containsPatternVar$554 = function (patterns$116) {
        return _$5.any(patterns$116, function (pat$118) {
            if (pat$118.token.type === parser$6.Token.Delimiter) {
                return containsPatternVar$554(pat$118.token.inner);
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
                range: from$139.token.range
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
        return delim$162 && delim$162.token.type === parser$6.Token.Delimiter && delim$162.token.value === '()' && delim$162.token.inner.length === 1 && delim$162.token.inner[0].token.type !== parser$6.Token.Delimiter && !containsPatternVar$554(delim$162.token.inner);
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
        if (term$192.hasPrototype(Block$563) && term$192.body.hasPrototype(Delimiter$572)) {
            toCheck$203 = term$192.body.delim.token.inner;
        } else if (term$192.hasPrototype(Delimiter$572)) {
            toCheck$203 = term$192.delim.token.inner;
        } else {
            parser$6.assert(false, 'expecting a Block or a Delimiter');
        }
        return _$5.reduce(toCheck$203, function (acc$194, curr$195, idx$196, list$197) {
            var prev$202 = list$197[idx$196 - 1];
            if (curr$195.hasPrototype(VariableStatement$582)) {
                return _$5.reduce(curr$195.decls, function (acc$199, decl$200) {
                    return acc$199.concat(decl$200.ident);
                }, acc$194);
            } else if (prev$202 && prev$202.hasPrototype(Keyword$570) && prev$202.keyword.token.value === 'for' && curr$195.hasPrototype(Delimiter$572)) {
                return acc$194.concat(getVarDeclIdentifiers(curr$195));
            } else if (curr$195.hasPrototype(Block$563)) {
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
    var TermTree$555 = {destruct: function (breakDelim$208) {
                return _$5.reduce(this.properties, _$5.bind(function (acc$210, prop$211) {
                    if (this[prop$211] && this[prop$211].hasPrototype(TermTree$555)) {
                        return acc$210.concat(this[prop$211].destruct(breakDelim$208));
                    } else if (this[prop$211]) {
                        return acc$210.concat(this[prop$211]);
                    } else {
                        return acc$210;
                    }
                }, this), []);
            }};
    var EOF$556 = TermTree$555.extend({
            properties: ['eof'],
            construct: function (e$213) {
                this.eof = e$213;
            }
        });
    var Statement$557 = TermTree$555.extend({construct: function () {
            }});
    var Expr$558 = TermTree$555.extend({construct: function () {
            }});
    var PrimaryExpression$559 = Expr$558.extend({construct: function () {
            }});
    var ThisExpression$560 = PrimaryExpression$559.extend({
            properties: ['this'],
            construct: function (that$218) {
                this.this = that$218;
            }
        });
    var Lit$561 = PrimaryExpression$559.extend({
            properties: ['lit'],
            construct: function (l$220) {
                this.lit = l$220;
            }
        });
    exports$4._test.PropertyAssignment = PropertyAssignment$562;
    var PropertyAssignment$562 = TermTree$555.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$222, assignment$223) {
                this.propName = propName$222;
                this.assignment = assignment$223;
            }
        });
    var Block$563 = PrimaryExpression$559.extend({
            properties: ['body'],
            construct: function (body$225) {
                this.body = body$225;
            }
        });
    var ArrayLiteral$564 = PrimaryExpression$559.extend({
            properties: ['array'],
            construct: function (ar$227) {
                this.array = ar$227;
            }
        });
    var ParenExpression$565 = PrimaryExpression$559.extend({
            properties: ['expr'],
            construct: function (expr$229) {
                this.expr = expr$229;
            }
        });
    var UnaryOp$566 = Expr$558.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$231, expr$232) {
                this.op = op$231;
                this.expr = expr$232;
            }
        });
    var PostfixOp$567 = Expr$558.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$234, op$235) {
                this.expr = expr$234;
                this.op = op$235;
            }
        });
    var BinOp$568 = Expr$558.extend({
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
    var ConditionalExpression$569 = Expr$558.extend({
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
    var Keyword$570 = TermTree$555.extend({
            properties: ['keyword'],
            construct: function (k$247) {
                this.keyword = k$247;
            }
        });
    var Punc$571 = TermTree$555.extend({
            properties: ['punc'],
            construct: function (p$249) {
                this.punc = p$249;
            }
        });
    var Delimiter$572 = TermTree$555.extend({
            properties: ['delim'],
            destruct: function (breakDelim$251) {
                parser$6.assert(this.delim, 'expecting delim to be defined');
                var innerStx$256 = _$5.reduce(this.delim.token.inner, function (acc$253, term$254) {
                        if (term$254.hasPrototype(TermTree$555)) {
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
    var Id$573 = PrimaryExpression$559.extend({
            properties: ['id'],
            construct: function (id$261) {
                this.id = id$261;
            }
        });
    var NamedFun$574 = Expr$558.extend({
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
    var AnonFun$575 = Expr$558.extend({
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
    var Macro$576 = TermTree$555.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$272, body$273) {
                this.name = name$272;
                this.body = body$273;
            }
        });
    var Const$577 = Expr$558.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$275, call$276) {
                this.newterm = newterm$275;
                this.call = call$276;
            }
        });
    var Call$578 = Expr$558.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$278) {
                parser$6.assert(this.fun.hasPrototype(TermTree$555), 'expecting a term tree in destruct of call');
                var that$284 = this;
                this.delim = syntaxFromToken(_$5.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$5.reduce(this.args, function (acc$280, term$281) {
                    parser$6.assert(term$281 && term$281.hasPrototype(TermTree$555), 'expecting term trees in destruct of Call');
                    var dst$283 = acc$280.concat(term$281.destruct(breakDelim$278));
                    if (that$284.commas.length > 0) {
                        dst$283 = dst$283.concat(that$284.commas.shift());
                    }
                    return dst$283;
                }, []);
                return this.fun.destruct(breakDelim$278).concat(Delimiter$572.create(this.delim).destruct(breakDelim$278));
            },
            construct: function (funn$285, args$286, delim$287, commas$288) {
                parser$6.assert(Array.isArray(args$286), 'requires an array of arguments terms');
                this.fun = funn$285;
                this.args = args$286;
                this.delim = delim$287;
                this.commas = commas$288;
            }
        });
    var ObjDotGet$579 = Expr$558.extend({
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
    var ObjGet$580 = Expr$558.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$294, right$295) {
                this.left = left$294;
                this.right = right$295;
            }
        });
    var VariableDeclaration$581 = TermTree$555.extend({
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
    var VariableStatement$582 = Statement$557.extend({
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
    var CatchClause$583 = TermTree$555.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$310, params$311, body$312) {
                this.catchkw = catchkw$310;
                this.params = params$311;
                this.body = body$312;
            }
        });
    var Empty$584 = TermTree$555.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp(stx$315) {
        var staticOperators$317 = [
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
        return _$5.contains(staticOperators$317, stx$315.token.value);
    }
    function stxIsBinOp(stx$318) {
        var staticOperators$320 = [
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
        return _$5.contains(staticOperators$320, stx$318.token.value);
    }
    function enforestVarStatement(stx$321, env$322) {
        parser$6.assert(stx$321[0] && stx$321[0].token.type === parser$6.Token.Identifier, 'must start at the identifier');
        var decls$324 = [], rest$325 = stx$321, initRes$326, subRes$327;
        if (stx$321[1] && stx$321[1].token.type === parser$6.Token.Punctuator && stx$321[1].token.value === '=') {
            initRes$326 = enforest(stx$321.slice(2), env$322);
            if (initRes$326.result.hasPrototype(Expr$558)) {
                rest$325 = initRes$326.rest;
                if (initRes$326.rest[0].token.type === parser$6.Token.Punctuator && initRes$326.rest[0].token.value === ',' && initRes$326.rest[1] && initRes$326.rest[1].token.type === parser$6.Token.Identifier) {
                    decls$324.push(VariableDeclaration$581.create(stx$321[0], stx$321[1], initRes$326.result, initRes$326.rest[0]));
                    subRes$327 = enforestVarStatement(initRes$326.rest.slice(1), env$322);
                    decls$324 = decls$324.concat(subRes$327.result);
                    rest$325 = subRes$327.rest;
                } else {
                    decls$324.push(VariableDeclaration$581.create(stx$321[0], stx$321[1], initRes$326.result));
                }
            } else {
                parser$6.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$321[1] && stx$321[1].token.type === parser$6.Token.Punctuator && stx$321[1].token.value === ',') {
            decls$324.push(VariableDeclaration$581.create(stx$321[0], null, null, stx$321[1]));
            subRes$327 = enforestVarStatement(stx$321.slice(2), env$322);
            decls$324 = decls$324.concat(subRes$327.result);
            rest$325 = subRes$327.rest;
        } else {
            decls$324.push(VariableDeclaration$581.create(stx$321[0]));
            rest$325 = stx$321.slice(1);
        }
        return {
            result: decls$324,
            rest: rest$325
        };
    }
    function enforest(toks$328, env$329) {
        env$329 = env$329 || new Map();
        parser$6.assert(toks$328.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$331, rest$332) {
            var innerTokens$336;
            parser$6.assert(Array.isArray(rest$332), 'result must at least be an empty array');
            if (head$331.hasPrototype(TermTree$555)) {
                if (head$331.hasPrototype(Expr$558) && rest$332[0] && rest$332[0].token.type === parser$6.Token.Delimiter && rest$332[0].token.value === '()') {
                    var argRes$337, enforestedArgs$338 = [], commas$339 = [];
                    innerTokens$336 = rest$332[0].token.inner;
                    while (innerTokens$336.length > 0) {
                        argRes$337 = enforest(innerTokens$336, env$329);
                        enforestedArgs$338.push(argRes$337.result);
                        innerTokens$336 = argRes$337.rest;
                        if (innerTokens$336[0] && innerTokens$336[0].token.value === ',') {
                            commas$339.push(innerTokens$336[0]);
                            innerTokens$336 = innerTokens$336.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$340 = _$5.all(enforestedArgs$338, function (argTerm$334) {
                            return argTerm$334.hasPrototype(Expr$558);
                        });
                    if (innerTokens$336.length === 0 && argsAreExprs$340) {
                        return step(Call$578.create(head$331, enforestedArgs$338, rest$332[0], commas$339), rest$332.slice(1));
                    }
                } else if (head$331.hasPrototype(Keyword$570) && head$331.keyword.token.value === 'new' && rest$332[0]) {
                    var newCallRes$341 = enforest(rest$332, env$329);
                    if (newCallRes$341.result.hasPrototype(Call$578)) {
                        return step(Const$577.create(head$331, newCallRes$341.result), newCallRes$341.rest);
                    }
                } else if (head$331.hasPrototype(Expr$558) && rest$332[0] && rest$332[0].token.value === '?') {
                    var question$342 = rest$332[0];
                    var condRes$343 = enforest(rest$332.slice(1), env$329);
                    var truExpr$344 = condRes$343.result;
                    var right$351 = condRes$343.rest;
                    if (truExpr$344.hasPrototype(Expr$558) && right$351[0] && right$351[0].token.value === ':') {
                        var colon$345 = right$351[0];
                        var flsRes$346 = enforest(right$351.slice(1), env$329);
                        var flsExpr$347 = flsRes$346.result;
                        if (flsExpr$347.hasPrototype(Expr$558)) {
                            return step(ConditionalExpression$569.create(head$331, question$342, truExpr$344, colon$345, flsExpr$347), flsRes$346.rest);
                        }
                    }
                } else if (head$331.hasPrototype(Delimiter$572) && head$331.delim.token.value === '()') {
                    innerTokens$336 = head$331.delim.token.inner;
                    if (innerTokens$336.length === 0) {
                        return step(ParenExpression$565.create(head$331), rest$332);
                    } else {
                        var innerTerm$348 = get_expression(innerTokens$336, env$329);
                        if (innerTerm$348.result && innerTerm$348.result.hasPrototype(Expr$558)) {
                            return step(ParenExpression$565.create(head$331), rest$332);
                        }
                    }
                } else if (rest$332[0] && rest$332[1] && stxIsBinOp(rest$332[0])) {
                    var op$353 = rest$332[0];
                    var left$349 = head$331;
                    var bopRes$350 = enforest(rest$332.slice(1), env$329);
                    var right$351 = bopRes$350.result;
                    if (right$351.hasPrototype(Expr$558)) {
                        return step(BinOp$568.create(op$353, left$349, right$351), bopRes$350.rest);
                    }
                } else if (head$331.hasPrototype(Punc$571) && stxIsUnaryOp(head$331.punc) || head$331.hasPrototype(Keyword$570) && stxIsUnaryOp(head$331.keyword)) {
                    var unopRes$352 = enforest(rest$332);
                    var op$353 = head$331.hasPrototype(Punc$571) ? head$331.punc : head$331.keyword;
                    if (unopRes$352.result.hasPrototype(Expr$558)) {
                        return step(UnaryOp$566.create(op$353, unopRes$352.result), unopRes$352.rest);
                    }
                } else if (head$331.hasPrototype(Expr$558) && rest$332[0] && (rest$332[0].token.value === '++' || rest$332[0].token.value === '--')) {
                    return step(PostfixOp$567.create(head$331, rest$332[0]), rest$332.slice(1));
                } else if (head$331.hasPrototype(Expr$558) && rest$332[0] && rest$332[0].token.value === '[]') {
                    var getRes$354 = enforest(rest$332[0].token.inner, env$329);
                    var resStx$355 = mkSyntax('[]', parser$6.Token.Delimiter, rest$332[0]);
                    resStx$355.token.inner = [getRes$354.result];
                    if (getRes$354.rest.length > 0) {
                        return step(ObjGet$580.create(head$331, Delimiter$572.create(resStx$355)), rest$332.slice(1));
                    }
                } else if (head$331.hasPrototype(Expr$558) && rest$332[0] && rest$332[0].token.value === '.' && rest$332[1] && rest$332[1].token.type === parser$6.Token.Identifier) {
                    return step(ObjDotGet$579.create(head$331, rest$332[0], rest$332[1]), rest$332.slice(2));
                } else if (head$331.hasPrototype(Delimiter$572) && head$331.delim.token.value === '[]') {
                    return step(ArrayLiteral$564.create(head$331), rest$332);
                } else if (head$331.hasPrototype(Delimiter$572) && head$331.delim.token.value === '{}') {
                    innerTokens$336 = head$331.delim.token.inner;
                    return step(Block$563.create(head$331), rest$332);
                } else if (head$331.hasPrototype(Keyword$570) && head$331.keyword.token.value === 'var' && rest$332[0] && rest$332[0].token.type === parser$6.Token.Identifier) {
                    var vsRes$356 = enforestVarStatement(rest$332, env$329);
                    if (vsRes$356) {
                        return step(VariableStatement$582.create(head$331, vsRes$356.result), vsRes$356.rest);
                    }
                }
            } else {
                parser$6.assert(head$331 && head$331.token, 'assuming head is a syntax object');
                if ((head$331.token.type === parser$6.Token.Identifier || head$331.token.type === parser$6.Token.Keyword) && env$329.has(head$331.token.value)) {
                    var transformer$357 = env$329.get(head$331.token.value);
                    var rt$358 = transformer$357(rest$332, head$331, env$329);
                    if (rt$358.result.length > 0) {
                        return step(rt$358.result[0], rt$358.result.slice(1).concat(rt$358.rest));
                    } else {
                        return step(Empty$584.create(), rt$358.rest);
                    }
                } else if (head$331.token.type === parser$6.Token.Identifier && head$331.token.value === 'macro' && rest$332[0] && (rest$332[0].token.type === parser$6.Token.Identifier || rest$332[0].token.type === parser$6.Token.Keyword) && rest$332[1] && rest$332[1].token.type === parser$6.Token.Delimiter && rest$332[1].token.value === '{}') {
                    return step(Macro$576.create(rest$332[0], rest$332[1].token.inner), rest$332.slice(2));
                } else if (head$331.token.type === parser$6.Token.Keyword && head$331.token.value === 'function' && rest$332[0] && rest$332[0].token.type === parser$6.Token.Identifier && rest$332[1] && rest$332[1].token.type === parser$6.Token.Delimiter && rest$332[1].token.value === '()' && rest$332[2] && rest$332[2].token.type === parser$6.Token.Delimiter && rest$332[2].token.value === '{}') {
                    return step(NamedFun$574.create(head$331, rest$332[0], rest$332[1], rest$332[2]), rest$332.slice(3));
                } else if (head$331.token.type === parser$6.Token.Keyword && head$331.token.value === 'function' && rest$332[0] && rest$332[0].token.type === parser$6.Token.Delimiter && rest$332[0].token.value === '()' && rest$332[1] && rest$332[1].token.type === parser$6.Token.Delimiter && rest$332[1].token.value === '{}') {
                    return step(AnonFun$575.create(head$331, rest$332[0], rest$332[1]), rest$332.slice(2));
                } else if (head$331.token.type === parser$6.Token.Keyword && head$331.token.value === 'catch' && rest$332[0] && rest$332[0].token.type === parser$6.Token.Delimiter && rest$332[0].token.value === '()' && rest$332[1] && rest$332[1].token.type === parser$6.Token.Delimiter && rest$332[1].token.value === '{}') {
                    return step(CatchClause$583.create(head$331, rest$332[0], rest$332[1]), rest$332.slice(2));
                } else if (head$331.token.type === parser$6.Token.Keyword && head$331.token.value === 'this') {
                    return step(ThisExpression$560.create(head$331), rest$332);
                } else if (head$331.token.type === parser$6.Token.NumericLiteral || head$331.token.type === parser$6.Token.StringLiteral || head$331.token.type === parser$6.Token.BooleanLiteral || head$331.token.type === parser$6.Token.RegexLiteral || head$331.token.type === parser$6.Token.NullLiteral) {
                    return step(Lit$561.create(head$331), rest$332);
                } else if (head$331.token.type === parser$6.Token.Identifier) {
                    return step(Id$573.create(head$331), rest$332);
                } else if (head$331.token.type === parser$6.Token.Punctuator) {
                    return step(Punc$571.create(head$331), rest$332);
                } else if (head$331.token.type === parser$6.Token.Keyword && head$331.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$331.token.type === parser$6.Token.Keyword) {
                    return step(Keyword$570.create(head$331), rest$332);
                } else if (head$331.token.type === parser$6.Token.Delimiter) {
                    return step(Delimiter$572.create(head$331), rest$332);
                } else if (head$331.token.type === parser$6.Token.EOF) {
                    parser$6.assert(rest$332.length === 0, 'nothing should be after an EOF');
                    return step(EOF$556.create(head$331), []);
                } else {
                    parser$6.assert(false, 'not implemented');
                }
            }
            return {
                result: head$331,
                rest: rest$332
            };
        }
        return step(toks$328[0], toks$328.slice(1));
    }
    function get_expression(stx$359, env$360) {
        var res$362 = enforest(stx$359, env$360);
        if (!res$362.result.hasPrototype(Expr$558)) {
            return {
                result: null,
                rest: stx$359
            };
        }
        return res$362;
    }
    function typeIsLiteral(type$363) {
        return type$363 === parser$6.Token.NullLiteral || type$363 === parser$6.Token.NumericLiteral || type$363 === parser$6.Token.StringLiteral || type$363 === parser$6.Token.RegexLiteral || type$363 === parser$6.Token.BooleanLiteral;
    }
    exports$4._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$365, stx$366, env$367) {
        var result$369, rest$370;
        if (patternClass$365 === 'token' && stx$366[0] && stx$366[0].token.type !== parser$6.Token.EOF) {
            result$369 = [stx$366[0]];
            rest$370 = stx$366.slice(1);
        } else if (patternClass$365 === 'lit' && stx$366[0] && typeIsLiteral(stx$366[0].token.type)) {
            result$369 = [stx$366[0]];
            rest$370 = stx$366.slice(1);
        } else if (patternClass$365 === 'ident' && stx$366[0] && stx$366[0].token.type === parser$6.Token.Identifier) {
            result$369 = [stx$366[0]];
            rest$370 = stx$366.slice(1);
        } else if (patternClass$365 === 'VariableStatement') {
            var match$371 = enforest(stx$366, env$367);
            if (match$371.result && match$371.result.hasPrototype(VariableStatement$582)) {
                result$369 = match$371.result.destruct(false);
                rest$370 = match$371.rest;
            } else {
                result$369 = null;
                rest$370 = stx$366;
            }
        } else if (patternClass$365 === 'expr') {
            var match$371 = get_expression(stx$366, env$367);
            if (match$371.result === null || !match$371.result.hasPrototype(Expr$558)) {
                result$369 = null;
                rest$370 = stx$366;
            } else {
                result$369 = match$371.result.destruct(false);
                rest$370 = match$371.rest;
            }
        } else {
            result$369 = null;
            rest$370 = stx$366;
        }
        return {
            result: result$369,
            rest: rest$370
        };
    }
    function matchPattern(pattern$372, stx$373, env$374, patternEnv$375) {
        var subMatch$380;
        var match$381, matchEnv$382;
        var rest$383;
        var success$384;
        if (stx$373.length === 0) {
            return {
                success: false,
                rest: stx$373,
                patternEnv: patternEnv$375
            };
        }
        parser$6.assert(stx$373.length > 0, 'should have had something to match here');
        if (pattern$372.token.type === parser$6.Token.Delimiter) {
            if (pattern$372.class === 'pattern_group') {
                subMatch$380 = matchPatterns(pattern$372.token.inner, stx$373, env$374, false);
                rest$383 = subMatch$380.rest;
            } else if (stx$373[0].token.type === parser$6.Token.Delimiter && stx$373[0].token.value === pattern$372.token.value) {
                subMatch$380 = matchPatterns(pattern$372.token.inner, stx$373[0].token.inner, env$374, false);
                rest$383 = stx$373.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$373,
                    patternEnv: patternEnv$375
                };
            }
            success$384 = subMatch$380.success;
            _$5.keys(subMatch$380.patternEnv).forEach(function (patternKey$377) {
                if (pattern$372.repeat) {
                    var nextLevel$379 = subMatch$380.patternEnv[patternKey$377].level + 1;
                    if (patternEnv$375[patternKey$377]) {
                        patternEnv$375[patternKey$377].level = nextLevel$379;
                        patternEnv$375[patternKey$377].match.push(subMatch$380.patternEnv[patternKey$377]);
                    } else {
                        patternEnv$375[patternKey$377] = {
                            level: nextLevel$379,
                            match: [subMatch$380.patternEnv[patternKey$377]]
                        };
                    }
                } else {
                    patternEnv$375[patternKey$377] = subMatch$380.patternEnv[patternKey$377];
                }
            });
        } else {
            if (pattern$372.class === 'pattern_literal') {
                if (pattern$372.token.value === stx$373[0].token.value) {
                    success$384 = true;
                    rest$383 = stx$373.slice(1);
                } else {
                    success$384 = false;
                    rest$383 = stx$373;
                }
            } else {
                match$381 = matchPatternClass(pattern$372.class, stx$373, env$374);
                success$384 = match$381.result !== null;
                rest$383 = match$381.rest;
                matchEnv$382 = {
                    level: 0,
                    match: match$381.result
                };
                if (match$381.result !== null) {
                    if (pattern$372.repeat) {
                        if (patternEnv$375[pattern$372.token.value]) {
                            patternEnv$375[pattern$372.token.value].match.push(matchEnv$382);
                        } else {
                            patternEnv$375[pattern$372.token.value] = {
                                level: 1,
                                match: [matchEnv$382]
                            };
                        }
                    } else {
                        patternEnv$375[pattern$372.token.value] = matchEnv$382;
                    }
                }
            }
        }
        return {
            success: success$384,
            rest: rest$383,
            patternEnv: patternEnv$375
        };
    }
    function matchPatterns(patterns$385, stx$386, env$387, topLevel$388) {
        topLevel$388 = topLevel$388 || false;
        var result$390 = [];
        var patternEnv$391 = {};
        var match$392;
        var pattern$393;
        var rest$394 = stx$386;
        var success$395 = true;
        for (var i$396 = 0; i$396 < patterns$385.length; i$396++) {
            pattern$393 = patterns$385[i$396];
            do {
                match$392 = matchPattern(pattern$393, rest$394, env$387, patternEnv$391);
                if (!match$392.success) {
                    success$395 = false;
                }
                rest$394 = match$392.rest;
                patternEnv$391 = match$392.patternEnv;
                if (pattern$393.repeat && success$395) {
                    if (rest$394[0] && rest$394[0].token.value === pattern$393.separator) {
                        rest$394 = rest$394.slice(1);
                    } else if (pattern$393.separator === ' ') {
                        continue;
                    } else if (pattern$393.separator !== ' ' && rest$394.length > 0 && i$396 === patterns$385.length - 1 && topLevel$388 === false) {
                        success$395 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$393.repeat && match$392.success && rest$394.length > 0);
        }
        return {
            success: success$395,
            rest: rest$394,
            patternEnv: patternEnv$391
        };
    }
    function transcribe(macroBody$397, macroNameStx$398, env$399) {
        return _$5.chain(macroBody$397).reduce(function (acc$401, bodyStx$402, idx$403, original$404) {
            var last$406 = original$404[idx$403 - 1];
            var next$407 = original$404[idx$403 + 1];
            var nextNext$408 = original$404[idx$403 + 2];
            if (bodyStx$402.token.value === '...') {
                return acc$401;
            }
            if (delimIsSeparator(bodyStx$402) && next$407 && next$407.token.value === '...') {
                return acc$401;
            }
            if (bodyStx$402.token.value === '$' && next$407 && next$407.token.type === parser$6.Token.Delimiter && next$407.token.value === '()') {
                return acc$401;
            }
            if (bodyStx$402.token.value === '$' && next$407 && next$407.token.type === parser$6.Token.Delimiter && next$407.token.value === '[]') {
                next$407.literal = true;
                return acc$401;
            }
            if (bodyStx$402.token.type === parser$6.Token.Delimiter && bodyStx$402.token.value === '()' && last$406 && last$406.token.value === '$') {
                bodyStx$402.group = true;
            }
            if (bodyStx$402.literal === true) {
                parser$6.assert(bodyStx$402.token.type === parser$6.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$401.concat(bodyStx$402.token.inner);
            }
            if (next$407 && next$407.token.value === '...') {
                bodyStx$402.repeat = true;
                bodyStx$402.separator = ' ';
            } else if (delimIsSeparator(next$407) && nextNext$408 && nextNext$408.token.value === '...') {
                bodyStx$402.repeat = true;
                bodyStx$402.separator = next$407.token.inner[0].token.value;
            }
            return acc$401.concat(bodyStx$402);
        }, []).reduce(function (acc$409, bodyStx$410, idx$411) {
            if (bodyStx$410.repeat) {
                if (bodyStx$410.token.type === parser$6.Token.Delimiter) {
                    var fv$427 = _$5.filter(freeVarsInPattern(bodyStx$410.token.inner), function (pat$413) {
                            return env$399.hasOwnProperty(pat$413);
                        });
                    var restrictedEnv$428 = [];
                    var nonScalar$429 = _$5.find(fv$427, function (pat$415) {
                            return env$399[pat$415].level > 0;
                        });
                    parser$6.assert(typeof nonScalar$429 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$430 = env$399[nonScalar$429].match.length;
                    var sameLength$431 = _$5.all(fv$427, function (pat$417) {
                            return env$399[pat$417].level === 0 || env$399[pat$417].match.length === repeatLength$430;
                        });
                    parser$6.assert(sameLength$431, 'all non-scalars must have the same length');
                    restrictedEnv$428 = _$5.map(_$5.range(repeatLength$430), function (idx$419) {
                        var renv$423 = {};
                        _$5.each(fv$427, function (pat$421) {
                            if (env$399[pat$421].level === 0) {
                                renv$423[pat$421] = env$399[pat$421];
                            } else {
                                renv$423[pat$421] = env$399[pat$421].match[idx$419];
                            }
                        });
                        return renv$423;
                    });
                    var transcribed$432 = _$5.map(restrictedEnv$428, function (renv$424) {
                            if (bodyStx$410.group) {
                                return transcribe(bodyStx$410.token.inner, macroNameStx$398, renv$424);
                            } else {
                                var newBody$426 = syntaxFromToken(_$5.clone(bodyStx$410.token), bodyStx$410.context);
                                newBody$426.token.inner = transcribe(bodyStx$410.token.inner, macroNameStx$398, renv$424);
                                return newBody$426;
                            }
                        });
                    var joined$433;
                    if (bodyStx$410.group) {
                        joined$433 = joinSyntaxArr(transcribed$432, bodyStx$410.separator);
                    } else {
                        joined$433 = joinSyntax(transcribed$432, bodyStx$410.separator);
                    }
                    return acc$409.concat(joined$433);
                }
                parser$6.assert(env$399[bodyStx$410.token.value].level === 1, 'ellipses level does not match');
                return acc$409.concat(joinRepeatedMatch(env$399[bodyStx$410.token.value].match, bodyStx$410.separator));
            } else {
                if (bodyStx$410.token.type === parser$6.Token.Delimiter) {
                    var newBody$434 = syntaxFromToken(_$5.clone(bodyStx$410.token), macroBody$397.context);
                    newBody$434.token.inner = transcribe(bodyStx$410.token.inner, macroNameStx$398, env$399);
                    return acc$409.concat(newBody$434);
                }
                if (Object.prototype.hasOwnProperty.bind(env$399)(bodyStx$410.token.value)) {
                    parser$6.assert(env$399[bodyStx$410.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$410.token.value);
                    return acc$409.concat(takeLineContext(macroNameStx$398, env$399[bodyStx$410.token.value].match));
                }
                return acc$409.concat(takeLineContext(macroNameStx$398, [bodyStx$410]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$435, env$436) {
        function dfs(match$438) {
            if (match$438.level === 0) {
                match$438.match = _$5.map(match$438.match, function (stx$440) {
                    return stx$440.mark(newMark$435);
                });
            } else {
                _$5.each(match$438.match, function (match$442) {
                    dfs(match$442);
                });
            }
        }
        _$5.keys(env$436).forEach(function (key$444) {
            dfs(env$436[key$444]);
        });
    }
    function makeTransformer(cases$446, macroName$447) {
        var sortedCases$463 = _$5.sortBy(cases$446, function (mcase$449) {
                return patternLength(mcase$449.pattern);
            }).reverse();
        return function transformer(stx$451, macroNameStx$452, env$453) {
            var match$457;
            var casePattern$458, caseBody$459;
            var newMark$460;
            var macroResult$461;
            for (var i$462 = 0; i$462 < sortedCases$463.length; i$462++) {
                casePattern$458 = sortedCases$463[i$462].pattern;
                caseBody$459 = sortedCases$463[i$462].body;
                match$457 = matchPatterns(casePattern$458, stx$451, env$453, true);
                if (match$457.success) {
                    newMark$460 = fresh();
                    applyMarkToPatternEnv(newMark$460, match$457.patternEnv);
                    macroResult$461 = transcribe(caseBody$459, macroNameStx$452, match$457.patternEnv);
                    macroResult$461 = _$5.map(macroResult$461, function (stx$455) {
                        return stx$455.mark(newMark$460);
                    });
                    return {
                        result: macroResult$461,
                        rest: match$457.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$452.token.value);
        };
    }
    function findCase(start$464, stx$465) {
        parser$6.assert(start$464 >= 0 && start$464 < stx$465.length, 'start out of bounds');
        var idx$467 = start$464;
        while (idx$467 < stx$465.length) {
            if (stx$465[idx$467].token.value === 'case') {
                return idx$467;
            }
            idx$467++;
        }
        return -1;
    }
    function findCaseArrow(start$468, stx$469) {
        parser$6.assert(start$468 >= 0 && start$468 < stx$469.length, 'start out of bounds');
        var idx$471 = start$468;
        while (idx$471 < stx$469.length) {
            if (stx$469[idx$471].token.value === '=' && stx$469[idx$471 + 1] && stx$469[idx$471 + 1].token.value === '>') {
                return idx$471;
            }
            idx$471++;
        }
        return -1;
    }
    function loadMacroDef(mac$472) {
        var body$474 = mac$472.body;
        var caseOffset$475 = 0;
        var arrowOffset$476 = 0;
        var casePattern$477;
        var caseBody$478;
        var caseBodyIdx$479;
        var cases$480 = [];
        while (caseOffset$475 < body$474.length && body$474[caseOffset$475].token.value === 'case') {
            arrowOffset$476 = findCaseArrow(caseOffset$475, body$474);
            if (arrowOffset$476 > 0 && arrowOffset$476 < body$474.length) {
                caseBodyIdx$479 = arrowOffset$476 + 2;
                if (caseBodyIdx$479 >= body$474.length) {
                    throwError('case body missing in macro definition');
                }
                casePattern$477 = body$474.slice(caseOffset$475 + 1, arrowOffset$476);
                caseBody$478 = body$474[caseBodyIdx$479].token.inner;
                cases$480.push({
                    pattern: loadPattern(casePattern$477, mac$472.name),
                    body: caseBody$478
                });
            } else {
                throwError('case body missing in macro definition');
            }
            caseOffset$475 = findCase(arrowOffset$476, body$474);
            if (caseOffset$475 < 0) {
                break;
            }
        }
        return makeTransformer(cases$480);
    }
    function expandToTermTree(stx$481, env$482) {
        parser$6.assert(env$482, 'environment map is required');
        if (stx$481.length === 0) {
            return {
                terms: [],
                env: env$482
            };
        }
        parser$6.assert(stx$481[0].token, 'expecting a syntax object');
        var f$484 = enforest(stx$481, env$482);
        var head$485 = f$484.result;
        var rest$486 = f$484.rest;
        if (head$485.hasPrototype(Macro$576)) {
            var macroDefinition$487 = loadMacroDef(head$485);
            env$482.set(head$485.name.token.value, macroDefinition$487);
            return expandToTermTree(rest$486, env$482);
        }
        var trees$488 = expandToTermTree(rest$486, env$482);
        return {
            terms: [head$485].concat(trees$488.terms),
            env: trees$488.env
        };
    }
    function expandTermTreeToFinal(term$489, env$490, ctx$491) {
        parser$6.assert(env$490, 'environment map is required');
        parser$6.assert(ctx$491, 'context map is required');
        if (term$489.hasPrototype(ArrayLiteral$564)) {
            term$489.array.delim.token.inner = expand(term$489.array.delim.token.inner, env$490);
            return term$489;
        } else if (term$489.hasPrototype(Block$563)) {
            term$489.body.delim.token.inner = expand(term$489.body.delim.token.inner, env$490);
            return term$489;
        } else if (term$489.hasPrototype(ParenExpression$565)) {
            term$489.expr.delim.token.inner = expand(term$489.expr.delim.token.inner, env$490, ctx$491);
            return term$489;
        } else if (term$489.hasPrototype(Call$578)) {
            term$489.fun = expandTermTreeToFinal(term$489.fun, env$490, ctx$491);
            term$489.args = _$5.map(term$489.args, function (arg$493) {
                return expandTermTreeToFinal(arg$493, env$490, ctx$491);
            });
            return term$489;
        } else if (term$489.hasPrototype(UnaryOp$566)) {
            term$489.expr = expandTermTreeToFinal(term$489.expr, env$490, ctx$491);
            return term$489;
        } else if (term$489.hasPrototype(BinOp$568)) {
            term$489.left = expandTermTreeToFinal(term$489.left, env$490, ctx$491);
            term$489.right = expandTermTreeToFinal(term$489.right, env$490, ctx$491);
            return term$489;
        } else if (term$489.hasPrototype(ObjDotGet$579)) {
            term$489.left = expandTermTreeToFinal(term$489.left, env$490, ctx$491);
            term$489.right = expandTermTreeToFinal(term$489.right, env$490, ctx$491);
            return term$489;
        } else if (term$489.hasPrototype(VariableDeclaration$581)) {
            if (term$489.init) {
                term$489.init = expandTermTreeToFinal(term$489.init, env$490, ctx$491);
            }
            return term$489;
        } else if (term$489.hasPrototype(VariableStatement$582)) {
            term$489.decls = _$5.map(term$489.decls, function (decl$495) {
                return expandTermTreeToFinal(decl$495, env$490, ctx$491);
            });
            return term$489;
        } else if (term$489.hasPrototype(Delimiter$572)) {
            term$489.delim.token.inner = expand(term$489.delim.token.inner, env$490);
            return term$489;
        } else if (term$489.hasPrototype(NamedFun$574) || term$489.hasPrototype(AnonFun$575) || term$489.hasPrototype(CatchClause$583)) {
            var paramNames$515 = _$5.map(getParamIdentifiers(term$489.params), function (param$497) {
                    var freshName$499 = fresh();
                    return {
                        freshName: freshName$499,
                        originalParam: param$497,
                        renamedParam: param$497.rename(param$497, freshName$499)
                    };
                });
            var newCtx$516 = ctx$491;
            var stxBody$517 = term$489.body;
            var renamedBody$518 = _$5.reduce(paramNames$515, function (accBody$500, p$501) {
                    return accBody$500.rename(p$501.originalParam, p$501.freshName);
                }, stxBody$517);
            var dummyName$519 = fresh();
            renamedBody$518 = renamedBody$518.push_dummy_rename(dummyName$519);
            var bodyTerms$520 = expand([renamedBody$518], env$490, newCtx$516);
            parser$6.assert(bodyTerms$520.length === 1 && bodyTerms$520[0].body, 'expecting a block in the bodyTerms');
            var varIdents$521 = getVarDeclIdentifiers(bodyTerms$520[0]);
            var acc$522 = [];
            for (var i$523 = 0; i$523 < varIdents$521.length; i$523++) {
                var isUnique$524 = !_$5.find(varIdents$521.slice(i$523 + 1), function (id$503) {
                        return resolve(varIdents$521[i$523]) === resolve(id$503) && arraysEqual(marksof(varIdents$521[i$523].context), marksof(id$503.context));
                    });
                if (isUnique$524) {
                    acc$522.push(varIdents$521[i$523]);
                }
            }
            varIdents$521 = acc$522;
            var varNames$525 = _$5.map(varIdents$521, function (ident$505) {
                    var freshName$507 = fresh();
                    return {
                        freshName: freshName$507,
                        dummyName: dummyName$519,
                        originalVar: ident$505,
                        renamedVar: ident$505.rename(ident$505, freshName$507)
                    };
                });
            var flattenedBody$526 = _$5.map(flatten(bodyTerms$520), function (stx$508) {
                    var isDecl$512;
                    if (stx$508.token.type === parser$6.Token.Identifier) {
                        isDecl$512 = _$5.find(varNames$525, function (v$510) {
                            return v$510.originalVar === stx$508;
                        });
                        if (isDecl$512) {
                            return isDecl$512.renamedVar;
                        }
                        return stx$508.swap_dummy_rename(varNames$525, dummyName$519);
                    }
                    return stx$508;
                });
            var renamedParams$527 = _$5.map(paramNames$515, function (p$513) {
                    return p$513.renamedParam;
                });
            var flatArgs$528 = wrapDelim(joinSyntax(renamedParams$527, ','), term$489.params);
            var expandedArgs$529 = expand([flatArgs$528], env$490, ctx$491);
            parser$6.assert(expandedArgs$529.length === 1, 'should only get back one result');
            term$489.params = expandedArgs$529[0];
            term$489.body = flattenedBody$526;
            return term$489;
        }
        return term$489;
    }
    function expand(stx$530, env$531, ctx$532) {
        env$531 = env$531 || new Map();
        ctx$532 = ctx$532 || new Map();
        var trees$536 = expandToTermTree(stx$530, env$531, ctx$532);
        return _$5.map(trees$536.terms, function (term$534) {
            return expandTermTreeToFinal(term$534, trees$536.env, ctx$532);
        });
    }
    function expandTopLevel(stx$537) {
        var funn$539 = syntaxFromToken({
                value: 'function',
                type: parser$6.Token.Keyword
            });
        var name$540 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$6.Token.Identifier
            });
        var params$541 = syntaxFromToken({
                value: '()',
                type: parser$6.Token.Delimiter,
                inner: []
            });
        var body$542 = syntaxFromToken({
                value: '{}',
                type: parser$6.Token.Delimiter,
                inner: stx$537
            });
        var res$543 = expand([
                funn$539,
                name$540,
                params$541,
                body$542
            ]);
        return res$543[0].body.slice(1, res$543[0].body.length - 1);
    }
    function flatten(terms$544) {
        return _$5.reduce(terms$544, function (acc$546, term$547) {
            return acc$546.concat(term$547.destruct(true));
        }, []);
    }
    exports$4.enforest = enforest;
    exports$4.expand = expandTopLevel;
    exports$4.resolve = resolve;
    exports$4.flatten = flatten;
    exports$4.tokensToSyntax = tokensToSyntax;
    exports$4.syntaxToTokens = syntaxToTokens;
}));