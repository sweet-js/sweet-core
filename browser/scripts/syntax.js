(function (root$1284, factory$1285) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1285(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$1285);
    }
}(this, function (exports$1286, _$1287, es6$1288, parser$1289) {
    // (CSyntax, Str) -> CContext
    function Rename$1292(id$1362, name$1363, ctx$1364, defctx$1365) {
        defctx$1365 = defctx$1365 || null;
        return {
            id: id$1362,
            name: name$1363,
            context: ctx$1364,
            def: defctx$1365
        };
    }
    // (Num) -> CContext
    function Mark$1295(mark$1366, ctx$1367) {
        return {
            mark: mark$1366,
            context: ctx$1367
        };
    }
    function Def$1298(defctx$1368, ctx$1369) {
        return {
            defctx: defctx$1368,
            context: ctx$1369
        };
    }
    function Var$1301(id$1370) {
        return { id: id$1370 };
    }
    function isRename$1304(r$1371) {
        return r$1371 && typeof r$1371.id !== 'undefined' && typeof r$1371.name !== 'undefined';
    }
    ;
    function isMark$1307(m$1372) {
        return m$1372 && typeof m$1372.mark !== 'undefined';
    }
    ;
    function isDef$1310(ctx$1373) {
        return ctx$1373 && typeof ctx$1373.defctx !== 'undefined';
    }
    function Syntax$1313(token$1374, oldstx$1375) {
        this.token = token$1374;
        this.context = oldstx$1375 && oldstx$1375.context ? oldstx$1375.context : null;
        this.deferredContext = oldstx$1375 && oldstx$1375.deferredContext ? oldstx$1375.deferredContext : null;
    }
    Syntax$1313.prototype = {
        mark: function (newMark$1388) {
            if (this.token.inner) {
                var next$1389 = syntaxFromToken$1316(this.token, this);
                next$1389.deferredContext = Mark$1295(newMark$1388, this.deferredContext);
                return next$1389;
            }
            return syntaxFromToken$1316(this.token, { context: Mark$1295(newMark$1388, this.context) });
        },
        rename: function (id$1390, name$1391, defctx$1392) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1393 = syntaxFromToken$1316(this.token, this);
                next$1393.deferredContext = Rename$1292(id$1390, name$1391, this.deferredContext, defctx$1392);
                return next$1393;
            }
            if (this.token.type === parser$1289.Token.Identifier || this.token.type === parser$1289.Token.Keyword) {
                return syntaxFromToken$1316(this.token, { context: Rename$1292(id$1390, name$1391, this.context, defctx$1392) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1394) {
            if (this.token.inner) {
                var next$1395 = syntaxFromToken$1316(this.token, this);
                next$1395.deferredContext = Def$1298(defctx$1394, this.deferredContext);
                return next$1395;
            }
            return syntaxFromToken$1316(this.token, { context: Def$1298(defctx$1394, this.context) });
        },
        getDefCtx: function () {
            var ctx$1396 = this.context;
            while (ctx$1396 !== null) {
                if (isDef$1310(ctx$1396)) {
                    return ctx$1396.defctx;
                }
                ctx$1396 = ctx$1396.context;
            }
            return null;
        },
        expose: function () {
            parser$1289.assert(this.token.type === parser$1289.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1399(stxCtx$1402, ctx$1403) {
                if (ctx$1403 == null) {
                    return stxCtx$1402;
                } else if (isRename$1304(ctx$1403)) {
                    return Rename$1292(ctx$1403.id, ctx$1403.name, applyContext$1399(stxCtx$1402, ctx$1403.context), ctx$1403.def);
                } else if (isMark$1307(ctx$1403)) {
                    return Mark$1295(ctx$1403.mark, applyContext$1399(stxCtx$1402, ctx$1403.context));
                } else if (isDef$1310(ctx$1403)) {
                    return Def$1298(ctx$1403.defctx, applyContext$1399(stxCtx$1402, ctx$1403.context));
                } else {
                    parser$1289.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$1287.map(this.token.inner, _$1287.bind(function (stx$1404) {
                if (stx$1404.token.inner) {
                    var next$1405 = syntaxFromToken$1316(stx$1404.token, stx$1404);
                    next$1405.deferredContext = applyContext$1399(stx$1404.deferredContext, this.deferredContext);
                    return next$1405;
                } else {
                    return syntaxFromToken$1316(stx$1404.token, { context: applyContext$1399(stx$1404.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1406 = this.token.type === parser$1289.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1406 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1316(token$1407, oldstx$1408) {
        return new Syntax$1313(token$1407, oldstx$1408);
    }
    function mkSyntax$1319(stx$1409, value$1410, type$1411, inner$1412) {
        if (stx$1409 && Array.isArray(stx$1409) && stx$1409.length === 1) {
            stx$1409 = stx$1409[0];
        } else if (stx$1409 && Array.isArray(stx$1409)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$1409);
        }
        if (type$1411 === parser$1289.Token.Delimiter) {
            var startLineNumber$1413, startLineStart$1414, endLineNumber$1415, endLineStart$1416, startRange$1417, endRange$1418;
            if (!Array.isArray(inner$1412)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1409 && stx$1409.token.type === parser$1289.Token.Delimiter) {
                startLineNumber$1413 = stx$1409.token.startLineNumber;
                startLineStart$1414 = stx$1409.token.startLineStart;
                endLineNumber$1415 = stx$1409.token.endLineNumber;
                endLineStart$1416 = stx$1409.token.endLineStart;
                startRange$1417 = stx$1409.token.startRange;
                endRange$1418 = stx$1409.token.endRange;
            } else if (stx$1409 && stx$1409.token) {
                startLineNumber$1413 = stx$1409.token.lineNumber;
                startLineStart$1414 = stx$1409.token.lineStart;
                endLineNumber$1415 = stx$1409.token.lineNumber;
                endLineStart$1416 = stx$1409.token.lineStart;
                startRange$1417 = stx$1409.token.range;
                endRange$1418 = stx$1409.token.range;
            } else {
                startLineNumber$1413 = 0;
                startLineStart$1414 = 0;
                endLineNumber$1415 = 0;
                endLineStart$1416 = 0;
                startRange$1417 = [
                    0,
                    0
                ];
                endRange$1418 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$1316({
                type: parser$1289.Token.Delimiter,
                value: value$1410,
                inner: inner$1412,
                startLineStart: startLineStart$1414,
                startLineNumber: startLineNumber$1413,
                endLineStart: endLineStart$1416,
                endLineNumber: endLineNumber$1415,
                startRange: startRange$1417,
                endRange: endRange$1418
            }, stx$1409);
        } else {
            var lineStart$1419, lineNumber$1420, range$1421;
            if (stx$1409 && stx$1409.token.type === parser$1289.Token.Delimiter) {
                lineStart$1419 = stx$1409.token.startLineStart;
                lineNumber$1420 = stx$1409.token.startLineNumber;
                range$1421 = stx$1409.token.startRange;
            } else if (stx$1409 && stx$1409.token) {
                lineStart$1419 = stx$1409.token.lineStart;
                lineNumber$1420 = stx$1409.token.lineNumber;
                range$1421 = stx$1409.token.range;
            } else {
                lineStart$1419 = 0;
                lineNumber$1420 = 0;
                range$1421 = [
                    0,
                    0
                ];
            }
            return syntaxFromToken$1316({
                type: type$1411,
                value: value$1410,
                lineStart: lineStart$1419,
                lineNumber: lineNumber$1420,
                range: range$1421
            }, stx$1409);
        }
    }
    function makeValue$1322(val$1422, stx$1423) {
        if (typeof val$1422 === 'boolean') {
            return mkSyntax$1319(stx$1423, val$1422 ? 'true' : 'false', parser$1289.Token.BooleanLiteral);
        } else if (typeof val$1422 === 'number') {
            if (val$1422 !== val$1422) {
                return makeDelim$1337('()', [
                    makeValue$1322(0, stx$1423),
                    makePunc$1334('/', stx$1423),
                    makeValue$1322(0, stx$1423)
                ], stx$1423);
            }
            if (val$1422 < 0) {
                return makeDelim$1337('()', [
                    makePunc$1334('-', stx$1423),
                    makeValue$1322(Math.abs(val$1422), stx$1423)
                ], stx$1423);
            } else {
                return mkSyntax$1319(stx$1423, val$1422, parser$1289.Token.NumericLiteral);
            }
        } else if (typeof val$1422 === 'string') {
            return mkSyntax$1319(stx$1423, val$1422, parser$1289.Token.StringLiteral);
        } else if (val$1422 === null) {
            return mkSyntax$1319(stx$1423, 'null', parser$1289.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$1422);
        }
    }
    function makeRegex$1325(val$1424, flags$1425, stx$1426) {
        var newstx$1427 = mkSyntax$1319(stx$1426, new RegExp(val$1424, flags$1425), parser$1289.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1427.token.literal = val$1424;
        return newstx$1427;
    }
    function makeIdent$1328(val$1428, stx$1429) {
        return mkSyntax$1319(stx$1429, val$1428, parser$1289.Token.Identifier);
    }
    function makeKeyword$1331(val$1430, stx$1431) {
        return mkSyntax$1319(stx$1431, val$1430, parser$1289.Token.Keyword);
    }
    function makePunc$1334(val$1432, stx$1433) {
        return mkSyntax$1319(stx$1433, val$1432, parser$1289.Token.Punctuator);
    }
    function makeDelim$1337(val$1434, inner$1435, stx$1436) {
        return mkSyntax$1319(stx$1436, val$1434, parser$1289.Token.Delimiter, inner$1435);
    }
    function unwrapSyntax$1340(stx$1437) {
        if (Array.isArray(stx$1437) && stx$1437.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1437 = stx$1437[0];
        }
        if (stx$1437.token) {
            if (stx$1437.token.type === parser$1289.Token.Delimiter) {
                return stx$1437.token;
            } else {
                return stx$1437.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1437);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1343(stx$1438) {
        return _$1287.map(stx$1438, function (stx$1441) {
            if (stx$1441.token.inner) {
                stx$1441.token.inner = syntaxToTokens$1343(stx$1441.token.inner);
            }
            return stx$1441.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1346(tokens$1442) {
        if (!_$1287.isArray(tokens$1442)) {
            tokens$1442 = [tokens$1442];
        }
        return _$1287.map(tokens$1442, function (token$1445) {
            if (token$1445.inner) {
                token$1445.inner = tokensToSyntax$1346(token$1445.inner);
            }
            return syntaxFromToken$1316(token$1445);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1349(tojoin$1446, punc$1447) {
        if (tojoin$1446.length === 0) {
            return [];
        }
        if (punc$1447 === ' ') {
            return tojoin$1446;
        }
        return _$1287.reduce(_$1287.rest(tojoin$1446, 1), function (acc$1450, join$1451) {
            return acc$1450.concat(makePunc$1334(punc$1447, join$1451), join$1451);
        }, [_$1287.first(tojoin$1446)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1352(tojoin$1452, punc$1453) {
        if (tojoin$1452.length === 0) {
            return [];
        }
        if (punc$1453 === ' ') {
            return _$1287.flatten(tojoin$1452, true);
        }
        return _$1287.reduce(_$1287.rest(tojoin$1452, 1), function (acc$1456, join$1457) {
            return acc$1456.concat(makePunc$1334(punc$1453, _$1287.first(join$1457)), join$1457);
        }, _$1287.first(tojoin$1452));
    }
    function MacroSyntaxError$1355(name$1458, message$1459, stx$1460) {
        this.name = name$1458;
        this.message = message$1459;
        this.stx = stx$1460;
    }
    function throwSyntaxError$1358(name$1461, message$1462, stx$1463) {
        if (stx$1463 && Array.isArray(stx$1463)) {
            stx$1463 = stx$1463[0];
        }
        throw new MacroSyntaxError$1355(name$1461, message$1462, stx$1463);
    }
    function printSyntaxError$1361(code$1464, err$1465) {
        if (!err$1465.stx) {
            return '[' + err$1465.name + '] ' + err$1465.message;
        }
        var token$1466 = err$1465.stx.token;
        var lineNumber$1467 = token$1466.startLineNumber || token$1466.lineNumber;
        var lineStart$1468 = token$1466.startLineStart || token$1466.lineStart;
        var start$1469 = token$1466.range[0];
        var offset$1470 = start$1469 - lineStart$1468;
        var line$1471 = '';
        var pre$1472 = lineNumber$1467 + ': ';
        var ch$1473;
        while (ch$1473 = code$1464.charAt(lineStart$1468++)) {
            if (ch$1473 == '\r' || ch$1473 == '\n') {
                break;
            }
            line$1471 += ch$1473;
        }
        return '[' + err$1465.name + '] ' + err$1465.message + '\n' + pre$1472 + line$1471 + '\n' + Array(offset$1470 + pre$1472.length).join(' ') + ' ^';
    }
    exports$1286.unwrapSyntax = unwrapSyntax$1340;
    exports$1286.makeDelim = makeDelim$1337;
    exports$1286.makePunc = makePunc$1334;
    exports$1286.makeKeyword = makeKeyword$1331;
    exports$1286.makeIdent = makeIdent$1328;
    exports$1286.makeRegex = makeRegex$1325;
    exports$1286.makeValue = makeValue$1322;
    exports$1286.Rename = Rename$1292;
    exports$1286.Mark = Mark$1295;
    exports$1286.Var = Var$1301;
    exports$1286.Def = Def$1298;
    exports$1286.isDef = isDef$1310;
    exports$1286.isMark = isMark$1307;
    exports$1286.isRename = isRename$1304;
    exports$1286.syntaxFromToken = syntaxFromToken$1316;
    exports$1286.tokensToSyntax = tokensToSyntax$1346;
    exports$1286.syntaxToTokens = syntaxToTokens$1343;
    exports$1286.joinSyntax = joinSyntax$1349;
    exports$1286.joinSyntaxArr = joinSyntaxArr$1352;
    exports$1286.MacroSyntaxError = MacroSyntaxError$1355;
    exports$1286.throwSyntaxError = throwSyntaxError$1358;
    exports$1286.printSyntaxError = printSyntaxError$1361;
}));