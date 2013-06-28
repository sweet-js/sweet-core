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
            construct: function (fun$285, args$286, delim$287, commas$288) {
                parser$6.assert(Array.isArray(args$286), 'requires an array of arguments terms');
                this.fun = fun$285;
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
    function stxIsUnaryOp(stx$314) {
        var staticOperators$316 = [
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
        return _$5.contains(staticOperators$316, stx$314.token.value);
    }
    function stxIsBinOp(stx$317) {
        var staticOperators$319 = [
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
        return _$5.contains(staticOperators$319, stx$317.token.value);
    }
    function enforestVarStatement(stx$320, env$321) {
        parser$6.assert(stx$320[0] && stx$320[0].token.type === parser$6.Token.Identifier, 'must start at the identifier');
        var decls$323 = [], rest$324 = stx$320, initRes$325, subRes$326;
        if (stx$320[1] && stx$320[1].token.type === parser$6.Token.Punctuator && stx$320[1].token.value === '=') {
            initRes$325 = enforest(stx$320.slice(2), env$321);
            if (initRes$325.result.hasPrototype(Expr$558)) {
                rest$324 = initRes$325.rest;
                if (initRes$325.rest[0].token.type === parser$6.Token.Punctuator && initRes$325.rest[0].token.value === ',' && initRes$325.rest[1] && initRes$325.rest[1].token.type === parser$6.Token.Identifier) {
                    decls$323.push(VariableDeclaration$581.create(stx$320[0], stx$320[1], initRes$325.result, initRes$325.rest[0]));
                    subRes$326 = enforestVarStatement(initRes$325.rest.slice(1), env$321);
                    decls$323 = decls$323.concat(subRes$326.result);
                    rest$324 = subRes$326.rest;
                } else {
                    decls$323.push(VariableDeclaration$581.create(stx$320[0], stx$320[1], initRes$325.result));
                }
            } else {
                parser$6.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$320[1] && stx$320[1].token.type === parser$6.Token.Punctuator && stx$320[1].token.value === ',') {
            decls$323.push(VariableDeclaration$581.create(stx$320[0], null, null, stx$320[1]));
            subRes$326 = enforestVarStatement(stx$320.slice(2), env$321);
            decls$323 = decls$323.concat(subRes$326.result);
            rest$324 = subRes$326.rest;
        } else {
            decls$323.push(VariableDeclaration$581.create(stx$320[0]));
            rest$324 = stx$320.slice(1);
        }
        return {
            result: decls$323,
            rest: rest$324
        };
    }
    function enforest(toks$327, env$328) {
        env$328 = env$328 || new Map();
        parser$6.assert(toks$327.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$330, rest$331) {
            var innerTokens$335;
            parser$6.assert(Array.isArray(rest$331), 'result must at least be an empty array');
            if (head$330.hasPrototype(TermTree$555)) {
                if (head$330.hasPrototype(Expr$558) && rest$331[0] && rest$331[0].token.type === parser$6.Token.Delimiter && rest$331[0].token.value === '()') {
                    var argRes$336, enforestedArgs$337 = [], commas$338 = [];
                    innerTokens$335 = rest$331[0].token.inner;
                    while (innerTokens$335.length > 0) {
                        argRes$336 = enforest(innerTokens$335, env$328);
                        enforestedArgs$337.push(argRes$336.result);
                        innerTokens$335 = argRes$336.rest;
                        if (innerTokens$335[0] && innerTokens$335[0].token.value === ',') {
                            commas$338.push(innerTokens$335[0]);
                            innerTokens$335 = innerTokens$335.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$339 = _$5.all(enforestedArgs$337, function (argTerm$333) {
                            return argTerm$333.hasPrototype(Expr$558);
                        });
                    if (innerTokens$335.length === 0 && argsAreExprs$339) {
                        return step(Call$578.create(head$330, enforestedArgs$337, rest$331[0], commas$338), rest$331.slice(1));
                    }
                } else if (head$330.hasPrototype(Keyword$570) && head$330.keyword.token.value === 'new' && rest$331[0]) {
                    var newCallRes$340 = enforest(rest$331, env$328);
                    if (newCallRes$340.result.hasPrototype(Call$578)) {
                        return step(Const$577.create(head$330, newCallRes$340.result), newCallRes$340.rest);
                    }
                } else if (head$330.hasPrototype(Expr$558) && rest$331[0] && rest$331[0].token.value === '?') {
                    var question$341 = rest$331[0];
                    var condRes$342 = enforest(rest$331.slice(1), env$328);
                    var truExpr$343 = condRes$342.result;
                    var right$344 = condRes$342.rest;
                    if (truExpr$343.hasPrototype(Expr$558) && right$344[0] && right$344[0].token.value === ':') {
                        var colon$345 = right$344[0];
                        var flsRes$346 = enforest(right$344.slice(1), env$328);
                        var flsExpr$347 = flsRes$346.result;
                        if (flsExpr$347.hasPrototype(Expr$558)) {
                            return step(ConditionalExpression$569.create(head$330, question$341, truExpr$343, colon$345, flsExpr$347), flsRes$346.rest);
                        }
                    }
                } else if (head$330.hasPrototype(Delimiter$572) && head$330.delim.token.value === '()') {
                    innerTokens$335 = head$330.delim.token.inner;
                    if (innerTokens$335.length === 0) {
                        return step(ParenExpression$565.create(head$330), rest$331);
                    } else {
                        var innerTerm$348 = get_expression(innerTokens$335, env$328);
                        if (innerTerm$348.result && innerTerm$348.result.hasPrototype(Expr$558)) {
                            return step(ParenExpression$565.create(head$330), rest$331);
                        }
                    }
                } else if (rest$331[0] && rest$331[1] && stxIsBinOp(rest$331[0])) {
                    var op$349 = rest$331[0];
                    var left$350 = head$330;
                    var bopRes$351 = enforest(rest$331.slice(1), env$328);
                    var right$344 = bopRes$351.result;
                    if (right$344.hasPrototype(Expr$558)) {
                        return step(BinOp$568.create(op$349, left$350, right$344), bopRes$351.rest);
                    }
                } else if (head$330.hasPrototype(Punc$571) && stxIsUnaryOp(head$330.punc) || head$330.hasPrototype(Keyword$570) && stxIsUnaryOp(head$330.keyword)) {
                    var unopRes$352 = enforest(rest$331);
                    var op$349 = head$330.hasPrototype(Punc$571) ? head$330.punc : head$330.keyword;
                    if (unopRes$352.result.hasPrototype(Expr$558)) {
                        return step(UnaryOp$566.create(op$349, unopRes$352.result), unopRes$352.rest);
                    }
                } else if (head$330.hasPrototype(Expr$558) && rest$331[0] && (rest$331[0].token.value === '++' || rest$331[0].token.value === '--')) {
                    return step(PostfixOp$567.create(head$330, rest$331[0]), rest$331.slice(1));
                } else if (head$330.hasPrototype(Expr$558) && rest$331[0] && rest$331[0].token.value === '[]') {
                    var getRes$353 = enforest(rest$331[0].token.inner, env$328);
                    var resStx$354 = mkSyntax('[]', parser$6.Token.Delimiter, rest$331[0]);
                    resStx$354.token.inner = [getRes$353.result];
                    if (getRes$353.rest.length > 0) {
                        return step(ObjGet$580.create(head$330, Delimiter$572.create(resStx$354)), rest$331.slice(1));
                    }
                } else if (head$330.hasPrototype(Expr$558) && rest$331[0] && rest$331[0].token.value === '.' && rest$331[1] && rest$331[1].token.type === parser$6.Token.Identifier) {
                    return step(ObjDotGet$579.create(head$330, rest$331[0], rest$331[1]), rest$331.slice(2));
                } else if (head$330.hasPrototype(Delimiter$572) && head$330.delim.token.value === '[]') {
                    return step(ArrayLiteral$564.create(head$330), rest$331);
                } else if (head$330.hasPrototype(Delimiter$572) && head$330.delim.token.value === '{}') {
                    innerTokens$335 = head$330.delim.token.inner;
                    return step(Block$563.create(head$330), rest$331);
                } else if (head$330.hasPrototype(Keyword$570) && head$330.keyword.token.value === 'var' && rest$331[0] && rest$331[0].token.type === parser$6.Token.Identifier) {
                    var vsRes$355 = enforestVarStatement(rest$331, env$328);
                    if (vsRes$355) {
                        return step(VariableStatement$582.create(head$330, vsRes$355.result), vsRes$355.rest);
                    }
                }
            } else {
                parser$6.assert(head$330 && head$330.token, 'assuming head is a syntax object');
                if ((head$330.token.type === parser$6.Token.Identifier || head$330.token.type === parser$6.Token.Keyword) && env$328.has(head$330.token.value)) {
                    var transformer$356 = env$328.get(head$330.token.value);
                    var rt$357 = transformer$356(rest$331, head$330, env$328);
                    return step(rt$357.result[0], rt$357.result.slice(1).concat(rt$357.rest));
                } else if (head$330.token.type === parser$6.Token.Identifier && head$330.token.value === 'macro' && rest$331[0] && (rest$331[0].token.type === parser$6.Token.Identifier || rest$331[0].token.type === parser$6.Token.Keyword) && rest$331[1] && rest$331[1].token.type === parser$6.Token.Delimiter && rest$331[1].token.value === '{}') {
                    return step(Macro$576.create(rest$331[0], rest$331[1].token.inner), rest$331.slice(2));
                } else if (head$330.token.type === parser$6.Token.Keyword && head$330.token.value === 'function' && rest$331[0] && rest$331[0].token.type === parser$6.Token.Identifier && rest$331[1] && rest$331[1].token.type === parser$6.Token.Delimiter && rest$331[1].token.value === '()' && rest$331[2] && rest$331[2].token.type === parser$6.Token.Delimiter && rest$331[2].token.value === '{}') {
                    return step(NamedFun$574.create(head$330, rest$331[0], rest$331[1], rest$331[2]), rest$331.slice(3));
                } else if (head$330.token.type === parser$6.Token.Keyword && head$330.token.value === 'function' && rest$331[0] && rest$331[0].token.type === parser$6.Token.Delimiter && rest$331[0].token.value === '()' && rest$331[1] && rest$331[1].token.type === parser$6.Token.Delimiter && rest$331[1].token.value === '{}') {
                    return step(AnonFun$575.create(head$330, rest$331[0], rest$331[1]), rest$331.slice(2));
                } else if (head$330.token.type === parser$6.Token.Keyword && head$330.token.value === 'catch' && rest$331[0] && rest$331[0].token.type === parser$6.Token.Delimiter && rest$331[0].token.value === '()' && rest$331[1] && rest$331[1].token.type === parser$6.Token.Delimiter && rest$331[1].token.value === '{}') {
                    return step(CatchClause$583.create(head$330, rest$331[0], rest$331[1]), rest$331.slice(2));
                } else if (head$330.token.type === parser$6.Token.Keyword && head$330.token.value === 'this') {
                    return step(ThisExpression$560.create(head$330), rest$331);
                } else if (head$330.token.type === parser$6.Token.NumericLiteral || head$330.token.type === parser$6.Token.StringLiteral || head$330.token.type === parser$6.Token.BooleanLiteral || head$330.token.type === parser$6.Token.RegexLiteral || head$330.token.type === parser$6.Token.NullLiteral) {
                    return step(Lit$561.create(head$330), rest$331);
                } else if (head$330.token.type === parser$6.Token.Identifier) {
                    return step(Id$573.create(head$330), rest$331);
                } else if (head$330.token.type === parser$6.Token.Punctuator) {
                    return step(Punc$571.create(head$330), rest$331);
                } else if (head$330.token.type === parser$6.Token.Keyword && head$330.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$330.token.type === parser$6.Token.Keyword) {
                    return step(Keyword$570.create(head$330), rest$331);
                } else if (head$330.token.type === parser$6.Token.Delimiter) {
                    return step(Delimiter$572.create(head$330), rest$331);
                } else if (head$330.token.type === parser$6.Token.EOF) {
                    parser$6.assert(rest$331.length === 0, 'nothing should be after an EOF');
                    return step(EOF$556.create(head$330), []);
                } else {
                    parser$6.assert(false, 'not implemented');
                }
            }
            return {
                result: head$330,
                rest: rest$331
            };
        }
        return step(toks$327[0], toks$327.slice(1));
    }
    function get_expression(stx$358, env$359) {
        var res$361 = enforest(stx$358, env$359);
        if (!res$361.result.hasPrototype(Expr$558)) {
            return {
                result: null,
                rest: stx$358
            };
        }
        return res$361;
    }
    function typeIsLiteral(type$362) {
        return type$362 === parser$6.Token.NullLiteral || type$362 === parser$6.Token.NumericLiteral || type$362 === parser$6.Token.StringLiteral || type$362 === parser$6.Token.RegexLiteral || type$362 === parser$6.Token.BooleanLiteral;
    }
    exports$4._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$364, stx$365, env$366) {
        var result$368, rest$369;
        if (patternClass$364 === 'token' && stx$365[0] && stx$365[0].token.type !== parser$6.Token.EOF) {
            result$368 = [stx$365[0]];
            rest$369 = stx$365.slice(1);
        } else if (patternClass$364 === 'lit' && stx$365[0] && typeIsLiteral(stx$365[0].token.type)) {
            result$368 = [stx$365[0]];
            rest$369 = stx$365.slice(1);
        } else if (patternClass$364 === 'ident' && stx$365[0] && stx$365[0].token.type === parser$6.Token.Identifier) {
            result$368 = [stx$365[0]];
            rest$369 = stx$365.slice(1);
        } else if (patternClass$364 === 'VariableStatement') {
            var match$370 = enforest(stx$365, env$366);
            if (match$370.result && match$370.result.hasPrototype(VariableStatement$582)) {
                result$368 = match$370.result.destruct(false);
                rest$369 = match$370.rest;
            } else {
                result$368 = null;
                rest$369 = stx$365;
            }
        } else if (patternClass$364 === 'expr') {
            var match$370 = get_expression(stx$365, env$366);
            if (match$370.result === null || !match$370.result.hasPrototype(Expr$558)) {
                result$368 = null;
                rest$369 = stx$365;
            } else {
                result$368 = match$370.result.destruct(false);
                rest$369 = match$370.rest;
            }
        } else {
            result$368 = null;
            rest$369 = stx$365;
        }
        return {
            result: result$368,
            rest: rest$369
        };
    }
    function matchPattern(pattern$371, stx$372, env$373, patternEnv$374) {
        var subMatch$379;
        var match$380, matchEnv$381;
        var rest$382;
        var success$383;
        if (stx$372.length === 0) {
            return {
                success: false,
                rest: stx$372,
                patternEnv: patternEnv$374
            };
        }
        parser$6.assert(stx$372.length > 0, 'should have had something to match here');
        if (pattern$371.token.type === parser$6.Token.Delimiter) {
            if (pattern$371.class === 'pattern_group') {
                subMatch$379 = matchPatterns(pattern$371.token.inner, stx$372, env$373, false);
                rest$382 = subMatch$379.rest;
            } else if (stx$372[0].token.type === parser$6.Token.Delimiter && stx$372[0].token.value === pattern$371.token.value) {
                subMatch$379 = matchPatterns(pattern$371.token.inner, stx$372[0].token.inner, env$373, false);
                rest$382 = stx$372.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$372,
                    patternEnv: patternEnv$374
                };
            }
            success$383 = subMatch$379.success;
            _$5.keys(subMatch$379.patternEnv).forEach(function (patternKey$376) {
                if (pattern$371.repeat) {
                    var nextLevel$378 = subMatch$379.patternEnv[patternKey$376].level + 1;
                    if (patternEnv$374[patternKey$376]) {
                        patternEnv$374[patternKey$376].level = nextLevel$378;
                        patternEnv$374[patternKey$376].match.push(subMatch$379.patternEnv[patternKey$376]);
                    } else {
                        patternEnv$374[patternKey$376] = {
                            level: nextLevel$378,
                            match: [subMatch$379.patternEnv[patternKey$376]]
                        };
                    }
                } else {
                    patternEnv$374[patternKey$376] = subMatch$379.patternEnv[patternKey$376];
                }
            });
        } else {
            if (pattern$371.class === 'pattern_literal') {
                if (pattern$371.token.value === stx$372[0].token.value) {
                    success$383 = true;
                    rest$382 = stx$372.slice(1);
                } else {
                    success$383 = false;
                    rest$382 = stx$372;
                }
            } else {
                match$380 = matchPatternClass(pattern$371.class, stx$372, env$373);
                success$383 = match$380.result !== null;
                rest$382 = match$380.rest;
                matchEnv$381 = {
                    level: 0,
                    match: match$380.result
                };
                if (match$380.result !== null) {
                    if (pattern$371.repeat) {
                        if (patternEnv$374[pattern$371.token.value]) {
                            patternEnv$374[pattern$371.token.value].match.push(matchEnv$381);
                        } else {
                            patternEnv$374[pattern$371.token.value] = {
                                level: 1,
                                match: [matchEnv$381]
                            };
                        }
                    } else {
                        patternEnv$374[pattern$371.token.value] = matchEnv$381;
                    }
                }
            }
        }
        return {
            success: success$383,
            rest: rest$382,
            patternEnv: patternEnv$374
        };
    }
    function matchPatterns(patterns$384, stx$385, env$386, topLevel$387) {
        topLevel$387 = topLevel$387 || false;
        var result$389 = [];
        var patternEnv$390 = {};
        var match$391;
        var pattern$392;
        var rest$393 = stx$385;
        var success$394 = true;
        for (var i$395 = 0; i$395 < patterns$384.length; i$395++) {
            pattern$392 = patterns$384[i$395];
            do {
                match$391 = matchPattern(pattern$392, rest$393, env$386, patternEnv$390);
                if (!match$391.success) {
                    success$394 = false;
                }
                rest$393 = match$391.rest;
                patternEnv$390 = match$391.patternEnv;
                if (pattern$392.repeat && success$394) {
                    if (rest$393[0] && rest$393[0].token.value === pattern$392.separator) {
                        rest$393 = rest$393.slice(1);
                    } else if (pattern$392.separator === ' ') {
                        continue;
                    } else if (pattern$392.separator !== ' ' && rest$393.length > 0 && i$395 === patterns$384.length - 1 && topLevel$387 === false) {
                        success$394 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$392.repeat && match$391.success && rest$393.length > 0);
        }
        return {
            success: success$394,
            rest: rest$393,
            patternEnv: patternEnv$390
        };
    }
    function transcribe(macroBody$396, macroNameStx$397, env$398) {
        return _$5.chain(macroBody$396).reduce(function (acc$400, bodyStx$401, idx$402, original$403) {
            var last$405 = original$403[idx$402 - 1];
            var next$406 = original$403[idx$402 + 1];
            var nextNext$407 = original$403[idx$402 + 2];
            if (bodyStx$401.token.value === '...') {
                return acc$400;
            }
            if (delimIsSeparator(bodyStx$401) && next$406 && next$406.token.value === '...') {
                return acc$400;
            }
            if (bodyStx$401.token.value === '$' && next$406 && next$406.token.type === parser$6.Token.Delimiter && next$406.token.value === '()') {
                return acc$400;
            }
            if (bodyStx$401.token.value === '$' && next$406 && next$406.token.type === parser$6.Token.Delimiter && next$406.token.value === '[]') {
                next$406.literal = true;
                return acc$400;
            }
            if (bodyStx$401.token.type === parser$6.Token.Delimiter && bodyStx$401.token.value === '()' && last$405 && last$405.token.value === '$') {
                bodyStx$401.group = true;
            }
            if (bodyStx$401.literal === true) {
                parser$6.assert(bodyStx$401.token.type === parser$6.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$400.concat(bodyStx$401.token.inner);
            }
            if (next$406 && next$406.token.value === '...') {
                bodyStx$401.repeat = true;
                bodyStx$401.separator = ' ';
            } else if (delimIsSeparator(next$406) && nextNext$407 && nextNext$407.token.value === '...') {
                bodyStx$401.repeat = true;
                bodyStx$401.separator = next$406.token.inner[0].token.value;
            }
            return acc$400.concat(bodyStx$401);
        }, []).reduce(function (acc$408, bodyStx$409, idx$410) {
            if (bodyStx$409.repeat) {
                if (bodyStx$409.token.type === parser$6.Token.Delimiter) {
                    var fv$426 = _$5.filter(freeVarsInPattern(bodyStx$409.token.inner), function (pat$412) {
                            return env$398.hasOwnProperty(pat$412);
                        });
                    var restrictedEnv$427 = [];
                    var nonScalar$428 = _$5.find(fv$426, function (pat$414) {
                            return env$398[pat$414].level > 0;
                        });
                    parser$6.assert(typeof nonScalar$428 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$429 = env$398[nonScalar$428].match.length;
                    var sameLength$430 = _$5.all(fv$426, function (pat$416) {
                            return env$398[pat$416].level === 0 || env$398[pat$416].match.length === repeatLength$429;
                        });
                    parser$6.assert(sameLength$430, 'all non-scalars must have the same length');
                    restrictedEnv$427 = _$5.map(_$5.range(repeatLength$429), function (idx$418) {
                        var renv$422 = {};
                        _$5.each(fv$426, function (pat$420) {
                            if (env$398[pat$420].level === 0) {
                                renv$422[pat$420] = env$398[pat$420];
                            } else {
                                renv$422[pat$420] = env$398[pat$420].match[idx$418];
                            }
                        });
                        return renv$422;
                    });
                    var transcribed$431 = _$5.map(restrictedEnv$427, function (renv$423) {
                            if (bodyStx$409.group) {
                                return transcribe(bodyStx$409.token.inner, macroNameStx$397, renv$423);
                            } else {
                                var newBody$425 = syntaxFromToken(_$5.clone(bodyStx$409.token), bodyStx$409.context);
                                newBody$425.token.inner = transcribe(bodyStx$409.token.inner, macroNameStx$397, renv$423);
                                return newBody$425;
                            }
                        });
                    var joined$432;
                    if (bodyStx$409.group) {
                        joined$432 = joinSyntaxArr(transcribed$431, bodyStx$409.separator);
                    } else {
                        joined$432 = joinSyntax(transcribed$431, bodyStx$409.separator);
                    }
                    return acc$408.concat(joined$432);
                }
                parser$6.assert(env$398[bodyStx$409.token.value].level === 1, 'ellipses level does not match');
                return acc$408.concat(joinRepeatedMatch(env$398[bodyStx$409.token.value].match, bodyStx$409.separator));
            } else {
                if (bodyStx$409.token.type === parser$6.Token.Delimiter) {
                    var newBody$433 = syntaxFromToken(_$5.clone(bodyStx$409.token), macroBody$396.context);
                    newBody$433.token.inner = transcribe(bodyStx$409.token.inner, macroNameStx$397, env$398);
                    return acc$408.concat(newBody$433);
                }
                if (Object.prototype.hasOwnProperty.bind(env$398)(bodyStx$409.token.value)) {
                    parser$6.assert(env$398[bodyStx$409.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$409.token.value);
                    return acc$408.concat(takeLineContext(macroNameStx$397, env$398[bodyStx$409.token.value].match));
                }
                return acc$408.concat(takeLineContext(macroNameStx$397, [bodyStx$409]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$434, env$435) {
        function dfs(match$437) {
            if (match$437.level === 0) {
                match$437.match = _$5.map(match$437.match, function (stx$439) {
                    return stx$439.mark(newMark$434);
                });
            } else {
                _$5.each(match$437.match, function (match$441) {
                    dfs(match$441);
                });
            }
        }
        _$5.keys(env$435).forEach(function (key$443) {
            dfs(env$435[key$443]);
        });
    }
    function makeTransformer(cases$445, macroName$446) {
        var sortedCases$462 = _$5.sortBy(cases$445, function (mcase$448) {
                return patternLength(mcase$448.pattern);
            }).reverse();
        return function transformer(stx$450, macroNameStx$451, env$452) {
            var match$456;
            var casePattern$457, caseBody$458;
            var newMark$459;
            var macroResult$460;
            for (var i$461 = 0; i$461 < sortedCases$462.length; i$461++) {
                casePattern$457 = sortedCases$462[i$461].pattern;
                caseBody$458 = sortedCases$462[i$461].body;
                match$456 = matchPatterns(casePattern$457, stx$450, env$452, true);
                if (match$456.success) {
                    newMark$459 = fresh();
                    applyMarkToPatternEnv(newMark$459, match$456.patternEnv);
                    macroResult$460 = transcribe(caseBody$458, macroNameStx$451, match$456.patternEnv);
                    macroResult$460 = _$5.map(macroResult$460, function (stx$454) {
                        return stx$454.mark(newMark$459);
                    });
                    return {
                        result: macroResult$460,
                        rest: match$456.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$451.token.value);
        };
    }
    function findCase(start$463, stx$464) {
        parser$6.assert(start$463 >= 0 && start$463 < stx$464.length, 'start out of bounds');
        var idx$466 = start$463;
        while (idx$466 < stx$464.length) {
            if (stx$464[idx$466].token.value === 'case') {
                return idx$466;
            }
            idx$466++;
        }
        return -1;
    }
    function findCaseArrow(start$467, stx$468) {
        parser$6.assert(start$467 >= 0 && start$467 < stx$468.length, 'start out of bounds');
        var idx$470 = start$467;
        while (idx$470 < stx$468.length) {
            if (stx$468[idx$470].token.value === '=' && stx$468[idx$470 + 1] && stx$468[idx$470 + 1].token.value === '>') {
                return idx$470;
            }
            idx$470++;
        }
        return -1;
    }
    function loadMacroDef(mac$471) {
        var body$473 = mac$471.body;
        var caseOffset$474 = 0;
        var arrowOffset$475 = 0;
        var casePattern$476;
        var caseBody$477;
        var caseBodyIdx$478;
        var cases$479 = [];
        while (caseOffset$474 < body$473.length && body$473[caseOffset$474].token.value === 'case') {
            arrowOffset$475 = findCaseArrow(caseOffset$474, body$473);
            if (arrowOffset$475 > 0 && arrowOffset$475 < body$473.length) {
                caseBodyIdx$478 = arrowOffset$475 + 2;
                if (caseBodyIdx$478 >= body$473.length) {
                    throwError('case body missing in macro definition');
                }
                casePattern$476 = body$473.slice(caseOffset$474 + 1, arrowOffset$475);
                caseBody$477 = body$473[caseBodyIdx$478].token.inner;
                cases$479.push({
                    pattern: loadPattern(casePattern$476, mac$471.name),
                    body: caseBody$477
                });
            } else {
                throwError('case body missing in macro definition');
            }
            caseOffset$474 = findCase(arrowOffset$475, body$473);
            if (caseOffset$474 < 0) {
                break;
            }
        }
        return makeTransformer(cases$479);
    }
    function expandToTermTree(stx$480, env$481) {
        parser$6.assert(env$481, 'environment map is required');
        if (stx$480.length === 0) {
            return {
                terms: [],
                env: env$481
            };
        }
        parser$6.assert(stx$480[0].token, 'expecting a syntax object');
        var f$483 = enforest(stx$480, env$481);
        var head$484 = f$483.result;
        var rest$485 = f$483.rest;
        if (head$484.hasPrototype(Macro$576)) {
            var macroDefinition$486 = loadMacroDef(head$484);
            env$481.set(head$484.name.token.value, macroDefinition$486);
            return expandToTermTree(rest$485, env$481);
        }
        var trees$487 = expandToTermTree(rest$485, env$481);
        return {
            terms: [head$484].concat(trees$487.terms),
            env: trees$487.env
        };
    }
    function expandTermTreeToFinal(term$488, env$489, ctx$490) {
        parser$6.assert(env$489, 'environment map is required');
        parser$6.assert(ctx$490, 'context map is required');
        if (term$488.hasPrototype(ArrayLiteral$564)) {
            term$488.array.delim.token.inner = expand(term$488.array.delim.token.inner, env$489);
            return term$488;
        } else if (term$488.hasPrototype(Block$563)) {
            term$488.body.delim.token.inner = expand(term$488.body.delim.token.inner, env$489);
            return term$488;
        } else if (term$488.hasPrototype(ParenExpression$565)) {
            term$488.expr.delim.token.inner = expand(term$488.expr.delim.token.inner, env$489, ctx$490);
            return term$488;
        } else if (term$488.hasPrototype(Call$578)) {
            term$488.fun = expandTermTreeToFinal(term$488.fun, env$489, ctx$490);
            term$488.args = _$5.map(term$488.args, function (arg$492) {
                return expandTermTreeToFinal(arg$492, env$489, ctx$490);
            });
            return term$488;
        } else if (term$488.hasPrototype(UnaryOp$566)) {
            term$488.expr = expandTermTreeToFinal(term$488.expr, env$489, ctx$490);
            return term$488;
        } else if (term$488.hasPrototype(BinOp$568)) {
            term$488.left = expandTermTreeToFinal(term$488.left, env$489, ctx$490);
            term$488.right = expandTermTreeToFinal(term$488.right, env$489, ctx$490);
            return term$488;
        } else if (term$488.hasPrototype(ObjDotGet$579)) {
            term$488.left = expandTermTreeToFinal(term$488.left, env$489, ctx$490);
            term$488.right = expandTermTreeToFinal(term$488.right, env$489, ctx$490);
            return term$488;
        } else if (term$488.hasPrototype(VariableDeclaration$581)) {
            if (term$488.init) {
                term$488.init = expandTermTreeToFinal(term$488.init, env$489, ctx$490);
            }
            return term$488;
        } else if (term$488.hasPrototype(VariableStatement$582)) {
            term$488.decls = _$5.map(term$488.decls, function (decl$494) {
                return expandTermTreeToFinal(decl$494, env$489, ctx$490);
            });
            return term$488;
        } else if (term$488.hasPrototype(Delimiter$572)) {
            term$488.delim.token.inner = expand(term$488.delim.token.inner, env$489);
            return term$488;
        } else if (term$488.hasPrototype(NamedFun$574) || term$488.hasPrototype(AnonFun$575) || term$488.hasPrototype(CatchClause$583)) {
            var paramNames$518 = _$5.map(getParamIdentifiers(term$488.params), function (param$496) {
                    var freshName$498 = fresh();
                    return {
                        freshName: freshName$498,
                        originalParam: param$496,
                        renamedParam: param$496.rename(param$496, freshName$498)
                    };
                });
            var newCtx$519 = ctx$490;
            var stxBody$520 = term$488.body;
            var renamedBody$521 = _$5.reduce(paramNames$518, function (accBody$499, p$500) {
                    return accBody$499.rename(p$500.originalParam, p$500.freshName);
                }, stxBody$520);
            var dummyName$522 = fresh();
            renamedBody$521 = renamedBody$521.push_dummy_rename(dummyName$522);
            var bodyTerms$523 = expand([renamedBody$521], env$489, newCtx$519);
            parser$6.assert(bodyTerms$523.length === 1 && bodyTerms$523[0].body, 'expecting a block in the bodyTerms');
            var varIdents$524 = getVarDeclIdentifiers(bodyTerms$523[0]);
            varIdents$524 = _$5.filter(varIdents$524, function (varId$502) {
                return !_$5.any(paramNames$518, function (p$504) {
                    return resolve(varId$502) === resolve(p$504.renamedParam);
                });
            });
            varIdents$524 = _$5.uniq(varIdents$524, false, function (v$506) {
                return resolve(v$506);
            });
            var varNames$525 = _$5.map(varIdents$524, function (ident$508) {
                    var freshName$510 = fresh();
                    return {
                        freshName: freshName$510,
                        dummyName: dummyName$522,
                        originalVar: ident$508,
                        renamedVar: ident$508.swap_dummy_rename([{
                                freshName: freshName$510,
                                originalVar: ident$508
                            }], dummyName$522)
                    };
                });
            var flattenedBody$526 = _$5.map(flatten(bodyTerms$523), function (stx$511) {
                    var isDecl$515;
                    if (stx$511.token.type === parser$6.Token.Identifier) {
                        isDecl$515 = _$5.find(varNames$525, function (v$513) {
                            return v$513.originalVar === stx$511;
                        });
                        if (isDecl$515) {
                            return isDecl$515.renamedVar;
                        }
                        return stx$511.swap_dummy_rename(varNames$525, dummyName$522);
                    }
                    return stx$511;
                });
            var renamedParams$527 = _$5.map(paramNames$518, function (p$516) {
                    return p$516.renamedParam;
                });
            var flatArgs$528 = wrapDelim(joinSyntax(renamedParams$527, ','), term$488.params);
            var expandedArgs$529 = expand([flatArgs$528], env$489, ctx$490);
            parser$6.assert(expandedArgs$529.length === 1, 'should only get back one result');
            term$488.params = expandedArgs$529[0];
            term$488.body = flattenedBody$526;
            return term$488;
        }
        return term$488;
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
        var fun$539 = syntaxFromToken({
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
                fun$539,
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