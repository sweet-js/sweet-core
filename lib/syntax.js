(function (root$1198, factory$1199) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1199(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$1199);
    }
}(this, function (exports$1200, _$1201, es6$1202, parser$1203) {
    // (CSyntax, Str) -> CContext
    function Rename$1205(id$1252, name$1253, ctx$1254, defctx$1255) {
        defctx$1255 = defctx$1255 || null;
        return {
            id: id$1252,
            name: name$1253,
            context: ctx$1254,
            def: defctx$1255
        };
    }
    // (Num) -> CContext
    function Mark$1207(mark$1256, ctx$1257) {
        return {
            mark: mark$1256,
            context: ctx$1257
        };
    }
    function Def$1209(defctx$1258, ctx$1259) {
        return {
            defctx: defctx$1258,
            context: ctx$1259
        };
    }
    function Var$1211(id$1260) {
        return { id: id$1260 };
    }
    function isRename$1213(r$1261) {
        return r$1261 && typeof r$1261.id !== 'undefined' && typeof r$1261.name !== 'undefined';
    }
    ;
    function isMark$1215(m$1262) {
        return m$1262 && typeof m$1262.mark !== 'undefined';
    }
    ;
    function isDef$1217(ctx$1263) {
        return ctx$1263 && typeof ctx$1263.defctx !== 'undefined';
    }
    function Syntax$1219(token$1264, oldstx$1265) {
        this.token = token$1264;
        this.context = oldstx$1265 && oldstx$1265.context ? oldstx$1265.context : null;
        this.deferredContext = oldstx$1265 && oldstx$1265.deferredContext ? oldstx$1265.deferredContext : null;
    }
    Syntax$1219.prototype = {
        mark: function (newMark$1272) {
            if (this.token.inner) {
                var next$1273 = syntaxFromToken$1221(this.token, this);
                next$1273.deferredContext = Mark$1207(newMark$1272, this.deferredContext);
                return next$1273;
            }
            return syntaxFromToken$1221(this.token, { context: Mark$1207(newMark$1272, this.context) });
        },
        rename: function (id$1274, name$1275, defctx$1276) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1277 = syntaxFromToken$1221(this.token, this);
                next$1277.deferredContext = Rename$1205(id$1274, name$1275, this.deferredContext, defctx$1276);
                return next$1277;
            }
            if (this.token.type === parser$1203.Token.Identifier || this.token.type === parser$1203.Token.Keyword) {
                return syntaxFromToken$1221(this.token, { context: Rename$1205(id$1274, name$1275, this.context, defctx$1276) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1278) {
            if (this.token.inner) {
                var next$1279 = syntaxFromToken$1221(this.token, this);
                next$1279.deferredContext = Def$1209(defctx$1278, this.deferredContext);
                return next$1279;
            }
            return syntaxFromToken$1221(this.token, { context: Def$1209(defctx$1278, this.context) });
        },
        getDefCtx: function () {
            var ctx$1280 = this.context;
            while (ctx$1280 !== null) {
                if (isDef$1217(ctx$1280)) {
                    return ctx$1280.defctx;
                }
                ctx$1280 = ctx$1280.context;
            }
            return null;
        },
        expose: function () {
            parser$1203.assert(this.token.type === parser$1203.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1282(stxCtx$1284, ctx$1285) {
                if (ctx$1285 == null) {
                    return stxCtx$1284;
                } else if (isRename$1213(ctx$1285)) {
                    return Rename$1205(ctx$1285.id, ctx$1285.name, applyContext$1282(stxCtx$1284, ctx$1285.context), ctx$1285.def);
                } else if (isMark$1215(ctx$1285)) {
                    return Mark$1207(ctx$1285.mark, applyContext$1282(stxCtx$1284, ctx$1285.context));
                } else if (isDef$1217(ctx$1285)) {
                    return Def$1209(ctx$1285.defctx, applyContext$1282(stxCtx$1284, ctx$1285.context));
                } else {
                    parser$1203.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$1201.map(this.token.inner, _$1201.bind(function (stx$1286) {
                if (stx$1286.token.inner) {
                    var next$1287 = syntaxFromToken$1221(stx$1286.token, stx$1286);
                    next$1287.deferredContext = applyContext$1282(stx$1286.deferredContext, this.deferredContext);
                    return next$1287;
                } else {
                    return syntaxFromToken$1221(stx$1286.token, { context: applyContext$1282(stx$1286.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1288 = this.token.type === parser$1203.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1288 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1221(token$1289, oldstx$1290) {
        return new Syntax$1219(token$1289, oldstx$1290);
    }
    function mkSyntax$1223(stx$1291, value$1292, type$1293, inner$1294) {
        if (stx$1291 && Array.isArray(stx$1291) && stx$1291.length === 1) {
            stx$1291 = stx$1291[0];
        } else if (stx$1291 && Array.isArray(stx$1291)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$1291);
        }
        if (type$1293 === parser$1203.Token.Delimiter) {
            var startLineNumber$1295, startLineStart$1296, endLineNumber$1297, endLineStart$1298, startRange$1299, endRange$1300;
            if (!Array.isArray(inner$1294)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1291 && stx$1291.token.type === parser$1203.Token.Delimiter) {
                startLineNumber$1295 = stx$1291.token.startLineNumber;
                startLineStart$1296 = stx$1291.token.startLineStart;
                endLineNumber$1297 = stx$1291.token.endLineNumber;
                endLineStart$1298 = stx$1291.token.endLineStart;
                startRange$1299 = stx$1291.token.startRange;
                endRange$1300 = stx$1291.token.endRange;
            } else if (stx$1291 && stx$1291.token) {
                startLineNumber$1295 = stx$1291.token.lineNumber;
                startLineStart$1296 = stx$1291.token.lineStart;
                endLineNumber$1297 = stx$1291.token.lineNumber;
                endLineStart$1298 = stx$1291.token.lineStart;
                startRange$1299 = stx$1291.token.range;
                endRange$1300 = stx$1291.token.range;
            } else {
                startLineNumber$1295 = 0;
                startLineStart$1296 = 0;
                endLineNumber$1297 = 0;
                endLineStart$1298 = 0;
                startRange$1299 = [
                    0,
                    0
                ];
                endRange$1300 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$1221({
                type: parser$1203.Token.Delimiter,
                value: value$1292,
                inner: inner$1294,
                startLineStart: startLineStart$1296,
                startLineNumber: startLineNumber$1295,
                endLineStart: endLineStart$1298,
                endLineNumber: endLineNumber$1297,
                startRange: startRange$1299,
                endRange: endRange$1300
            }, stx$1291);
        } else {
            var lineStart$1301, lineNumber$1302, range$1303;
            if (stx$1291 && stx$1291.token.type === parser$1203.Token.Delimiter) {
                lineStart$1301 = stx$1291.token.startLineStart;
                lineNumber$1302 = stx$1291.token.startLineNumber;
                range$1303 = stx$1291.token.startRange;
            } else if (stx$1291 && stx$1291.token) {
                lineStart$1301 = stx$1291.token.lineStart;
                lineNumber$1302 = stx$1291.token.lineNumber;
                range$1303 = stx$1291.token.range;
            } else {
                lineStart$1301 = 0;
                lineNumber$1302 = 0;
                range$1303 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$1221({
                type: type$1293,
                value: value$1292,
                lineStart: lineStart$1301,
                lineNumber: lineNumber$1302,
                range: range$1303
            }, stx$1291);
        }
    }
    function makeValue$1225(val$1304, stx$1305) {
        if (typeof val$1304 === 'boolean') {
            return mkSyntax$1223(stx$1305, val$1304 ? 'true' : 'false', parser$1203.Token.BooleanLiteral);
        } else if (typeof val$1304 === 'number') {
            if (val$1304 !== val$1304) {
                return makeDelim$1235('()', [
                    makeValue$1225(0, stx$1305),
                    makePunc$1233('/', stx$1305),
                    makeValue$1225(0, stx$1305)
                ], stx$1305);
            }
            if (val$1304 < 0) {
                return makeDelim$1235('()', [
                    makePunc$1233('-', stx$1305),
                    makeValue$1225(Math.abs(val$1304), stx$1305)
                ], stx$1305);
            } else {
                return mkSyntax$1223(stx$1305, val$1304, parser$1203.Token.NumericLiteral);
            }
        } else if (typeof val$1304 === 'string') {
            return mkSyntax$1223(stx$1305, val$1304, parser$1203.Token.StringLiteral);
        } else if (val$1304 === null) {
            return mkSyntax$1223(stx$1305, 'null', parser$1203.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$1304);
        }
    }
    function makeRegex$1227(val$1306, flags$1307, stx$1308) {
        var newstx$1309 = mkSyntax$1223(stx$1308, new RegExp(val$1306, flags$1307), parser$1203.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1309.token.literal = val$1306;
        return newstx$1309;
    }
    function makeIdent$1229(val$1310, stx$1311) {
        return mkSyntax$1223(stx$1311, val$1310, parser$1203.Token.Identifier);
    }
    function makeKeyword$1231(val$1312, stx$1313) {
        return mkSyntax$1223(stx$1313, val$1312, parser$1203.Token.Keyword);
    }
    function makePunc$1233(val$1314, stx$1315) {
        return mkSyntax$1223(stx$1315, val$1314, parser$1203.Token.Punctuator);
    }
    function makeDelim$1235(val$1316, inner$1317, stx$1318) {
        return mkSyntax$1223(stx$1318, val$1316, parser$1203.Token.Delimiter, inner$1317);
    }
    function unwrapSyntax$1237(stx$1319) {
        if (Array.isArray(stx$1319) && stx$1319.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1319 = stx$1319[0];
        }
        if (stx$1319.token) {
            if (stx$1319.token.type === parser$1203.Token.Delimiter) {
                return stx$1319.token;
            } else {
                return stx$1319.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1319);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1239(stx$1320) {
        return _$1201.map(stx$1320, function (stx$1322) {
            if (stx$1322.token.inner) {
                stx$1322.token.inner = syntaxToTokens$1239(stx$1322.token.inner);
            }
            return stx$1322.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1241(tokens$1323) {
        if (!_$1201.isArray(tokens$1323)) {
            tokens$1323 = [tokens$1323];
        }
        return _$1201.map(tokens$1323, function (token$1325) {
            if (token$1325.inner) {
                token$1325.inner = tokensToSyntax$1241(token$1325.inner);
            }
            return syntaxFromToken$1221(token$1325);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1243(tojoin$1326, punc$1327) {
        if (tojoin$1326.length === 0) {
            return [];
        }
        if (punc$1327 === ' ') {
            return tojoin$1326;
        }
        return _$1201.reduce(_$1201.rest(tojoin$1326, 1), function (acc$1329, join$1330) {
            return acc$1329.concat(makePunc$1233(punc$1327, join$1330), join$1330);
        }, [_$1201.first(tojoin$1326)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1245(tojoin$1331, punc$1332) {
        if (tojoin$1331.length === 0) {
            return [];
        }
        if (punc$1332 === ' ') {
            return _$1201.flatten(tojoin$1331, true);
        }
        return _$1201.reduce(_$1201.rest(tojoin$1331, 1), function (acc$1334, join$1335) {
            return acc$1334.concat(makePunc$1233(punc$1332, _$1201.first(join$1335)), join$1335);
        }, _$1201.first(tojoin$1331));
    }
    function MacroSyntaxError$1247(name$1336, message$1337, stx$1338) {
        this.name = name$1336;
        this.message = message$1337;
        this.stx = stx$1338;
    }
    function throwSyntaxError$1249(name$1339, message$1340, stx$1341) {
        if (stx$1341 && Array.isArray(stx$1341)) {
            stx$1341 = stx$1341[0];
        }
        throw new MacroSyntaxError$1247(name$1339, message$1340, stx$1341);
    }
    function printSyntaxError$1251(code$1342, err$1343) {
        if (!err$1343.stx) {
            return '[' + err$1343.name + '] ' + err$1343.message;
        }
        var token$1344 = err$1343.stx.token;
        var lineNumber$1345 = token$1344.startLineNumber || token$1344.lineNumber;
        var lineStart$1346 = token$1344.startLineStart || token$1344.lineStart;
        var start$1347 = token$1344.range[0];
        var offset$1348 = start$1347 - lineStart$1346;
        var line$1349 = '';
        var pre$1350 = lineNumber$1345 + ': ';
        var ch$1351;
        while (ch$1351 = code$1342.charAt(lineStart$1346++)) {
            if (ch$1351 == '\r' || ch$1351 == '\n') {
                break;
            }
            line$1349 += ch$1351;
        }
        return '[' + err$1343.name + '] ' + err$1343.message + '\n' + pre$1350 + line$1349 + '\n' + Array(offset$1348 + pre$1350.length).join(' ') + ' ^';
    }
    exports$1200.unwrapSyntax = unwrapSyntax$1237;
    exports$1200.makeDelim = makeDelim$1235;
    exports$1200.makePunc = makePunc$1233;
    exports$1200.makeKeyword = makeKeyword$1231;
    exports$1200.makeIdent = makeIdent$1229;
    exports$1200.makeRegex = makeRegex$1227;
    exports$1200.makeValue = makeValue$1225;
    exports$1200.Rename = Rename$1205;
    exports$1200.Mark = Mark$1207;
    exports$1200.Var = Var$1211;
    exports$1200.Def = Def$1209;
    exports$1200.isDef = isDef$1217;
    exports$1200.isMark = isMark$1215;
    exports$1200.isRename = isRename$1213;
    exports$1200.syntaxFromToken = syntaxFromToken$1221;
    exports$1200.tokensToSyntax = tokensToSyntax$1241;
    exports$1200.syntaxToTokens = syntaxToTokens$1239;
    exports$1200.joinSyntax = joinSyntax$1243;
    exports$1200.joinSyntaxArr = joinSyntaxArr$1245;
    exports$1200.MacroSyntaxError = MacroSyntaxError$1247;
    exports$1200.throwSyntaxError = throwSyntaxError$1249;
    exports$1200.printSyntaxError = printSyntaxError$1251;
}));