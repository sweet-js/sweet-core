(function (root$738, factory$739) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$739(exports, require('underscore'), require('./parser'), require('./syntax'), require('./scopedEval'), require('./patterns'), require('escodegen'), require('vm'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'scopedEval',
            'patterns',
            'escodegen'
        ], factory$739);
    }
}(this, function (exports$740, _$741, parser$742, syn$743, se$744, patternModule$745, gen$746, vm$747) {
    'use strict';
    var // escodegen still doesn't quite support AMD: https://github.com/Constellation/escodegen/issues/115
    codegen$748 = typeof escodegen !== 'undefined' ? escodegen : gen$746;
    var assert$749 = syn$743.assert;
    var throwSyntaxError$750 = syn$743.throwSyntaxError;
    var throwSyntaxCaseError$751 = syn$743.throwSyntaxCaseError;
    var SyntaxCaseError$752 = syn$743.SyntaxCaseError;
    var unwrapSyntax$753 = syn$743.unwrapSyntax;
    // used to export "private" methods for unit testing
    exports$740._test = {};
    function StringMap$824(o$1340) {
        this.__data = o$1340 || {};
    }
    StringMap$824.prototype = {
        keys: function () {
            return Object.keys(this.__data);
        },
        has: function (key$1341) {
            return Object.prototype.hasOwnProperty.call(this.__data, key$1341);
        },
        get: function (key$1342) {
            return this.has(key$1342) ? this.__data[key$1342] : void 0;
        },
        set: function (key$1343, value$1344) {
            this.__data[key$1343] = value$1344;
        },
        extend: function () {
            var args$1345 = _$741.map(_$741.toArray(arguments), function (x$1346) {
                return x$1346.__data;
            });
            _$741.extend.apply(_$741, [this.__data].concat(args$1345));
            return this;
        }
    };
    var scopedEval$825 = se$744.scopedEval;
    var Rename$826 = syn$743.Rename;
    var Mark$827 = syn$743.Mark;
    var Def$828 = syn$743.Def;
    var Imported$829 = syn$743.Imported;
    var syntaxFromToken$830 = syn$743.syntaxFromToken;
    var joinSyntax$831 = syn$743.joinSyntax;
    var builtinMode$832 = false;
    var expandCount$833 = 0;
    var maxExpands$834;
    var availableModules$835;
    var push$836 = Array.prototype.push;
    function remdup$837(mark$1347, mlist$1348) {
        if (mark$1347 === _$741.first(mlist$1348)) {
            return _$741.rest(mlist$1348, 1);
        }
        return [mark$1347].concat(mlist$1348);
    }
    function marksof$838(ctx$1349, stopName$1350, originalName$1351) {
        while (ctx$1349) {
            if (ctx$1349.constructor === Mark$827) {
                return remdup$837(ctx$1349.mark, marksof$838(ctx$1349.context, stopName$1350, originalName$1351));
            }
            if (ctx$1349.constructor === Def$828) {
                ctx$1349 = ctx$1349.context;
                continue;
            }
            if (ctx$1349.constructor === Rename$826) {
                if (stopName$1350 === originalName$1351 + '$' + ctx$1349.name) {
                    return [];
                }
                ctx$1349 = ctx$1349.context;
                continue;
            }
            if (ctx$1349.constructor === Imported$829) {
                ctx$1349 = ctx$1349.context;
                continue;
            }
            assert$749(false, 'Unknown context type');
        }
        return [];
    }
    function resolve$839(stx$1352, phase$1353) {
        assert$749(phase$1353 !== undefined, 'must pass in phase');
        return resolveCtx$840(stx$1352.token.value, stx$1352.context, [], [], {}, phase$1353);
    }
    function resolveCtx$840(originalName$1354, ctx$1355, stop_spine$1356, stop_branch$1357, cache$1358, phase$1359) {
        if (!ctx$1355) {
            return originalName$1354;
        }
        var key$1360 = ctx$1355.instNum;
        return cache$1358[key$1360] || (cache$1358[key$1360] = resolveCtxFull$841(originalName$1354, ctx$1355, stop_spine$1356, stop_branch$1357, cache$1358, phase$1359));
    }
    function resolveCtxFull$841(originalName$1361, ctx$1362, stop_spine$1363, stop_branch$1364, cache$1365, phase$1366) {
        while (true) {
            if (!ctx$1362) {
                return originalName$1361;
            }
            if (ctx$1362.constructor === Mark$827) {
                ctx$1362 = ctx$1362.context;
                continue;
            }
            if (ctx$1362.constructor === Def$828) {
                if (stop_spine$1363.indexOf(ctx$1362.defctx) !== -1) {
                    ctx$1362 = ctx$1362.context;
                    continue;
                } else {
                    stop_branch$1364 = unionEl$844(stop_branch$1364, ctx$1362.defctx);
                    ctx$1362 = renames$843(ctx$1362.defctx, ctx$1362.context, originalName$1361);
                    continue;
                }
            }
            if (ctx$1362.constructor === Rename$826) {
                if (originalName$1361 === ctx$1362.id.token.value) {
                    var idName$1367 = resolveCtx$840(ctx$1362.id.token.value, ctx$1362.id.context, stop_branch$1364, stop_branch$1364, cache$1365, 0);
                    var subName$1368 = resolveCtx$840(originalName$1361, ctx$1362.context, unionEl$844(stop_spine$1363, ctx$1362.def), stop_branch$1364, cache$1365, 0);
                    if (idName$1367 === subName$1368) {
                        var idMarks$1369 = marksof$838(ctx$1362.id.context, originalName$1361 + '$' + ctx$1362.name, originalName$1361);
                        var subMarks$1370 = marksof$838(ctx$1362.context, originalName$1361 + '$' + ctx$1362.name, originalName$1361);
                        if (arraysEqual$842(idMarks$1369, subMarks$1370)) {
                            return originalName$1361 + '$' + ctx$1362.name;
                        }
                    }
                }
                ctx$1362 = ctx$1362.context;
                continue;
            }
            if (ctx$1362.constructor === Imported$829) {
                if (phase$1366 === ctx$1362.phase) {
                    if (originalName$1361 === ctx$1362.id.token.value) {
                        return originalName$1361 + '$' + ctx$1362.name;
                    }
                }
                ctx$1362 = ctx$1362.context;
                continue;
            }
            assert$749(false, 'Unknown context type');
        }
    }
    function arraysEqual$842(a$1371, b$1372) {
        if (a$1371.length !== b$1372.length) {
            return false;
        }
        for (var i$1373 = 0; i$1373 < a$1371.length; i$1373++) {
            if (a$1371[i$1373] !== b$1372[i$1373]) {
                return false;
            }
        }
        return true;
    }
    function renames$843(defctx$1374, oldctx$1375, originalName$1376) {
        var acc$1377 = oldctx$1375;
        for (var i$1378 = 0; i$1378 < defctx$1374.length; i$1378++) {
            if (defctx$1374[i$1378].id.token.value === originalName$1376) {
                acc$1377 = new Rename$826(defctx$1374[i$1378].id, defctx$1374[i$1378].name, acc$1377, defctx$1374);
            }
        }
        return acc$1377;
    }
    function unionEl$844(arr$1379, el$1380) {
        if (arr$1379.indexOf(el$1380) === -1) {
            var res$1381 = arr$1379.slice(0);
            res$1381.push(el$1380);
            return res$1381;
        }
        return arr$1379;
    }
    var nextFresh$845 = 0;
    function fresh$846() {
        return nextFresh$845++;
    }
    function wrapDelim$847(towrap$1382, delimSyntax$1383) {
        assert$749(delimSyntax$1383.token.type === parser$742.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$830({
            type: parser$742.Token.Delimiter,
            value: delimSyntax$1383.token.value,
            inner: towrap$1382,
            range: delimSyntax$1383.token.range,
            startLineNumber: delimSyntax$1383.token.startLineNumber,
            lineStart: delimSyntax$1383.token.lineStart
        }, delimSyntax$1383);
    }
    function getParamIdentifiers$848(argSyntax$1384) {
        if (argSyntax$1384.token.type === parser$742.Token.Delimiter) {
            return _$741.filter(argSyntax$1384.token.inner, function (stx$1385) {
                return stx$1385.token.value !== ',';
            });
        } else if (argSyntax$1384.token.type === parser$742.Token.Identifier) {
            return [argSyntax$1384];
        } else {
            assert$749(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    function inherit$850(parent$1386, child$1387, methods$1388) {
        var P$1389 = function () {
        };
        P$1389.prototype = parent$1386.prototype;
        child$1387.prototype = new P$1389();
        child$1387.prototype.constructor = child$1387;
        _$741.extend(child$1387.prototype, methods$1388);
    }
    function TermTree$1051() {
    }
    TermTree$1051.properties = [];
    TermTree$1051.create = function () {
        return new TermTree$1051();
    };
    TermTree$1051.prototype = {
        'isTermTree': true,
        'destruct': function (context$1395, options$1396) {
            assert$749(context$1395, 'must pass in the context to destruct');
            options$1396 = options$1396 || {};
            var self$1397 = this;
            if (options$1396.stripCompileTerm && this.isCompileTimeTerm) {
                return [];
            }
            if (options$1396.stripModuleTerm && this.isModuleTerm) {
                return [];
            }
            return _$741.reduce(this.constructor.properties, function (acc$1398, prop$1399) {
                if (self$1397[prop$1399] && self$1397[prop$1399].isTermTree) {
                    push$836.apply(acc$1398, self$1397[prop$1399].destruct(context$1395, options$1396));
                    return acc$1398;
                } else if (self$1397[prop$1399] && self$1397[prop$1399].token && self$1397[prop$1399].token.inner) {
                    var src$1401 = self$1397[prop$1399].token;
                    var keys$1402 = Object.keys(src$1401);
                    var newtok$1403 = {};
                    for (var i$1404 = 0, len$1405 = keys$1402.length, key$1406; i$1404 < len$1405; i$1404++) {
                        key$1406 = keys$1402[i$1404];
                        newtok$1403[key$1406] = src$1401[key$1406];
                    }
                    var clone$1407 = syntaxFromToken$830(newtok$1403, self$1397[prop$1399]);
                    clone$1407.token.inner = _$741.reduce(clone$1407.token.inner, function (acc$1408, t$1409) {
                        if (t$1409 && t$1409.isTermTree) {
                            push$836.apply(acc$1408, t$1409.destruct(context$1395, options$1396));
                            return acc$1408;
                        }
                        acc$1408.push(t$1409);
                        return acc$1408;
                    }, []);
                    acc$1398.push(clone$1407);
                    return acc$1398;
                } else if (Array.isArray(self$1397[prop$1399])) {
                    var destArr$1410 = _$741.reduce(self$1397[prop$1399], function (acc$1411, t$1412) {
                        if (t$1412 && t$1412.isTermTree) {
                            push$836.apply(acc$1411, t$1412.destruct(context$1395, options$1396));
                            return acc$1411;
                        }
                        acc$1411.push(t$1412);
                        return acc$1411;
                    }, []);
                    push$836.apply(acc$1398, destArr$1410);
                    return acc$1398;
                } else if (self$1397[prop$1399]) {
                    acc$1398.push(self$1397[prop$1399]);
                    return acc$1398;
                } else {
                    return acc$1398;
                }
            }, []);
        },
        'addDefCtx': function (def$1413) {
            var self$1414 = this;
            _$741.each(this.constructor.properties, function (prop$1415) {
                if (Array.isArray(self$1414[prop$1415])) {
                    self$1414[prop$1415] = _$741.map(self$1414[prop$1415], function (item$1416) {
                        return item$1416.addDefCtx(def$1413);
                    });
                } else if (self$1414[prop$1415]) {
                    self$1414[prop$1415] = self$1414[prop$1415].addDefCtx(def$1413);
                }
            });
            return this;
        },
        'rename': function (id$1417, name$1418, phase$1419) {
            var self$1420 = this;
            _$741.each(this.constructor.properties, function (prop$1421) {
                if (Array.isArray(self$1420[prop$1421])) {
                    self$1420[prop$1421] = _$741.map(self$1420[prop$1421], function (item$1422) {
                        return item$1422.rename(id$1417, name$1418, phase$1419);
                    });
                } else if (self$1420[prop$1421]) {
                    self$1420[prop$1421] = self$1420[prop$1421].rename(id$1417, name$1418, phase$1419);
                }
            });
            return this;
        },
        'imported': function (id$1423, name$1424, phase$1425) {
            var self$1426 = this;
            _$741.each(this.constructor.properties, function (prop$1427) {
                if (Array.isArray(self$1426[prop$1427])) {
                    self$1426[prop$1427] = _$741.map(self$1426[prop$1427], function (item$1428) {
                        return item$1428.imported(id$1423, name$1424, phase$1425);
                    });
                } else if (self$1426[prop$1427]) {
                    self$1426[prop$1427] = self$1426[prop$1427].imported(id$1423, name$1424, phase$1425);
                }
            });
            return this;
        }
    };
    function EOF$1055(eof$1429) {
        this.eof = eof$1429;
    }
    EOF$1055.properties = ['eof'];
    EOF$1055.create = function (eof$1431) {
        return new EOF$1055(eof$1431);
    };
    inherit$850(TermTree$1051, EOF$1055, { 'isEOF': true });
    function Keyword$1060(keyword$1433) {
        this.keyword = keyword$1433;
    }
    Keyword$1060.properties = ['keyword'];
    Keyword$1060.create = function (keyword$1435) {
        return new Keyword$1060(keyword$1435);
    };
    inherit$850(TermTree$1051, Keyword$1060, { 'isKeyword': true });
    function Punc$1065(punc$1437) {
        this.punc = punc$1437;
    }
    Punc$1065.properties = ['punc'];
    Punc$1065.create = function (punc$1439) {
        return new Punc$1065(punc$1439);
    };
    inherit$850(TermTree$1051, Punc$1065, { 'isPunc': true });
    function Delimiter$1070(delim$1441) {
        this.delim = delim$1441;
    }
    Delimiter$1070.properties = ['delim'];
    Delimiter$1070.create = function (delim$1443) {
        return new Delimiter$1070(delim$1443);
    };
    inherit$850(TermTree$1051, Delimiter$1070, { 'isDelimiter': true });
    function ModuleTerm$1075() {
    }
    ModuleTerm$1075.properties = [];
    ModuleTerm$1075.create = function () {
        return new ModuleTerm$1075();
    };
    inherit$850(TermTree$1051, ModuleTerm$1075, { 'isModuleTerm': true });
    function Module$1080(name$1446, lang$1447, body$1448, imports$1449, exports$1450) {
        this.name = name$1446;
        this.lang = lang$1447;
        this.body = body$1448;
        this.imports = imports$1449;
        this.exports = exports$1450;
    }
    Module$1080.properties = [
        'name',
        'lang',
        'body',
        'imports',
        'exports'
    ];
    Module$1080.create = function (name$1456, lang$1457, body$1458, imports$1459, exports$1460) {
        return new Module$1080(name$1456, lang$1457, body$1458, imports$1459, exports$1460);
    };
    inherit$850(ModuleTerm$1075, Module$1080, { 'isModule': true });
    function Import$1085(kw$1462, names$1463, fromkw$1464, from$1465) {
        this.kw = kw$1462;
        this.names = names$1463;
        this.fromkw = fromkw$1464;
        this.from = from$1465;
    }
    Import$1085.properties = [
        'kw',
        'names',
        'fromkw',
        'from'
    ];
    Import$1085.create = function (kw$1470, names$1471, fromkw$1472, from$1473) {
        return new Import$1085(kw$1470, names$1471, fromkw$1472, from$1473);
    };
    inherit$850(ModuleTerm$1075, Import$1085, { 'isImport': true });
    function ImportForMacros$1090(names$1475, from$1476) {
        this.names = names$1475;
        this.from = from$1476;
    }
    ImportForMacros$1090.properties = [
        'names',
        'from'
    ];
    ImportForMacros$1090.create = function (names$1479, from$1480) {
        return new ImportForMacros$1090(names$1479, from$1480);
    };
    inherit$850(ModuleTerm$1075, ImportForMacros$1090, { 'isImportForMacros': true });
    function Export$1095(kw$1482, name$1483) {
        this.kw = kw$1482;
        this.name = name$1483;
    }
    Export$1095.properties = [
        'kw',
        'name'
    ];
    Export$1095.create = function (kw$1486, name$1487) {
        return new Export$1095(kw$1486, name$1487);
    };
    inherit$850(ModuleTerm$1075, Export$1095, { 'isExport': true });
    function CompileTimeTerm$1100() {
    }
    CompileTimeTerm$1100.properties = [];
    CompileTimeTerm$1100.create = function () {
        return new CompileTimeTerm$1100();
    };
    inherit$850(TermTree$1051, CompileTimeTerm$1100, { 'isCompileTimeTerm': true });
    function LetMacro$1105(name$1490, body$1491) {
        this.name = name$1490;
        this.body = body$1491;
    }
    LetMacro$1105.properties = [
        'name',
        'body'
    ];
    LetMacro$1105.create = function (name$1494, body$1495) {
        return new LetMacro$1105(name$1494, body$1495);
    };
    inherit$850(CompileTimeTerm$1100, LetMacro$1105, { 'isLetMacro': true });
    function Macro$1110(name$1497, body$1498) {
        this.name = name$1497;
        this.body = body$1498;
    }
    Macro$1110.properties = [
        'name',
        'body'
    ];
    Macro$1110.create = function (name$1501, body$1502) {
        return new Macro$1110(name$1501, body$1502);
    };
    inherit$850(CompileTimeTerm$1100, Macro$1110, { 'isMacro': true });
    function AnonMacro$1115(body$1504) {
        this.body = body$1504;
    }
    AnonMacro$1115.properties = ['body'];
    AnonMacro$1115.create = function (body$1506) {
        return new AnonMacro$1115(body$1506);
    };
    inherit$850(CompileTimeTerm$1100, AnonMacro$1115, { 'isAnonMacro': true });
    function OperatorDefinition$1120(type$1508, name$1509, prec$1510, assoc$1511, body$1512) {
        this.type = type$1508;
        this.name = name$1509;
        this.prec = prec$1510;
        this.assoc = assoc$1511;
        this.body = body$1512;
    }
    OperatorDefinition$1120.properties = [
        'type',
        'name',
        'prec',
        'assoc',
        'body'
    ];
    OperatorDefinition$1120.create = function (type$1518, name$1519, prec$1520, assoc$1521, body$1522) {
        return new OperatorDefinition$1120(type$1518, name$1519, prec$1520, assoc$1521, body$1522);
    };
    inherit$850(CompileTimeTerm$1100, OperatorDefinition$1120, { 'isOperatorDefinition': true });
    function VariableDeclaration$1125(ident$1524, eq$1525, init$1526, comma$1527) {
        this.ident = ident$1524;
        this.eq = eq$1525;
        this.init = init$1526;
        this.comma = comma$1527;
    }
    VariableDeclaration$1125.properties = [
        'ident',
        'eq',
        'init',
        'comma'
    ];
    VariableDeclaration$1125.create = function (ident$1532, eq$1533, init$1534, comma$1535) {
        return new VariableDeclaration$1125(ident$1532, eq$1533, init$1534, comma$1535);
    };
    inherit$850(TermTree$1051, VariableDeclaration$1125, { 'isVariableDeclaration': true });
    function Statement$1130() {
    }
    Statement$1130.properties = [];
    Statement$1130.create = function () {
        return new Statement$1130();
    };
    inherit$850(TermTree$1051, Statement$1130, { 'isStatement': true });
    function Empty$1135() {
    }
    Empty$1135.properties = [];
    Empty$1135.create = function () {
        return new Empty$1135();
    };
    inherit$850(Statement$1130, Empty$1135, { 'isEmpty': true });
    function CatchClause$1140(keyword$1539, params$1540, body$1541) {
        this.keyword = keyword$1539;
        this.params = params$1540;
        this.body = body$1541;
    }
    CatchClause$1140.properties = [
        'keyword',
        'params',
        'body'
    ];
    CatchClause$1140.create = function (keyword$1545, params$1546, body$1547) {
        return new CatchClause$1140(keyword$1545, params$1546, body$1547);
    };
    inherit$850(Statement$1130, CatchClause$1140, { 'isCatchClause': true });
    function ForStatement$1145(keyword$1549, cond$1550) {
        this.keyword = keyword$1549;
        this.cond = cond$1550;
    }
    ForStatement$1145.properties = [
        'keyword',
        'cond'
    ];
    ForStatement$1145.create = function (keyword$1553, cond$1554) {
        return new ForStatement$1145(keyword$1553, cond$1554);
    };
    inherit$850(Statement$1130, ForStatement$1145, { 'isForStatement': true });
    function ReturnStatement$1150(keyword$1556, expr$1557) {
        this.keyword = keyword$1556;
        this.expr = expr$1557;
    }
    ReturnStatement$1150.properties = [
        'keyword',
        'expr'
    ];
    ReturnStatement$1150.create = function (keyword$1560, expr$1561) {
        return new ReturnStatement$1150(keyword$1560, expr$1561);
    };
    inherit$850(Statement$1130, ReturnStatement$1150, {
        'isReturnStatement': true,
        'destruct': function (context$1564, options$1565) {
            var expr$1566 = this.expr.destruct(context$1564, options$1565);
            // need to adjust the line numbers to make sure that the expr
            // starts on the same line as the return keyword. This might
            // not be the case if an operator or infix macro perturbed the
            // line numbers during expansion.
            expr$1566 = adjustLineContext$1301(expr$1566, this.keyword.keyword);
            return this.keyword.destruct(context$1564, options$1565).concat(expr$1566);
        }
    });
    function Expr$1155() {
    }
    Expr$1155.properties = [];
    Expr$1155.create = function () {
        return new Expr$1155();
    };
    inherit$850(Statement$1130, Expr$1155, { 'isExpr': true });
    function UnaryOp$1160(op$1568, expr$1569) {
        this.op = op$1568;
        this.expr = expr$1569;
    }
    UnaryOp$1160.properties = [
        'op',
        'expr'
    ];
    UnaryOp$1160.create = function (op$1572, expr$1573) {
        return new UnaryOp$1160(op$1572, expr$1573);
    };
    inherit$850(Expr$1155, UnaryOp$1160, { 'isUnaryOp': true });
    function PostfixOp$1165(expr$1575, op$1576) {
        this.expr = expr$1575;
        this.op = op$1576;
    }
    PostfixOp$1165.properties = [
        'expr',
        'op'
    ];
    PostfixOp$1165.create = function (expr$1579, op$1580) {
        return new PostfixOp$1165(expr$1579, op$1580);
    };
    inherit$850(Expr$1155, PostfixOp$1165, { 'isPostfixOp': true });
    function BinOp$1170(left$1582, op$1583, right$1584) {
        this.left = left$1582;
        this.op = op$1583;
        this.right = right$1584;
    }
    BinOp$1170.properties = [
        'left',
        'op',
        'right'
    ];
    BinOp$1170.create = function (left$1588, op$1589, right$1590) {
        return new BinOp$1170(left$1588, op$1589, right$1590);
    };
    inherit$850(Expr$1155, BinOp$1170, { 'isBinOp': true });
    function AssignmentExpression$1175(left$1592, op$1593, right$1594) {
        this.left = left$1592;
        this.op = op$1593;
        this.right = right$1594;
    }
    AssignmentExpression$1175.properties = [
        'left',
        'op',
        'right'
    ];
    AssignmentExpression$1175.create = function (left$1598, op$1599, right$1600) {
        return new AssignmentExpression$1175(left$1598, op$1599, right$1600);
    };
    inherit$850(Expr$1155, AssignmentExpression$1175, { 'isAssignmentExpression': true });
    function ConditionalExpression$1180(cond$1602, question$1603, tru$1604, colon$1605, fls$1606) {
        this.cond = cond$1602;
        this.question = question$1603;
        this.tru = tru$1604;
        this.colon = colon$1605;
        this.fls = fls$1606;
    }
    ConditionalExpression$1180.properties = [
        'cond',
        'question',
        'tru',
        'colon',
        'fls'
    ];
    ConditionalExpression$1180.create = function (cond$1612, question$1613, tru$1614, colon$1615, fls$1616) {
        return new ConditionalExpression$1180(cond$1612, question$1613, tru$1614, colon$1615, fls$1616);
    };
    inherit$850(Expr$1155, ConditionalExpression$1180, { 'isConditionalExpression': true });
    function NamedFun$1185(keyword$1618, star$1619, name$1620, params$1621, body$1622) {
        this.keyword = keyword$1618;
        this.star = star$1619;
        this.name = name$1620;
        this.params = params$1621;
        this.body = body$1622;
    }
    NamedFun$1185.properties = [
        'keyword',
        'star',
        'name',
        'params',
        'body'
    ];
    NamedFun$1185.create = function (keyword$1628, star$1629, name$1630, params$1631, body$1632) {
        return new NamedFun$1185(keyword$1628, star$1629, name$1630, params$1631, body$1632);
    };
    inherit$850(Expr$1155, NamedFun$1185, { 'isNamedFun': true });
    function AnonFun$1190(keyword$1634, star$1635, params$1636, body$1637) {
        this.keyword = keyword$1634;
        this.star = star$1635;
        this.params = params$1636;
        this.body = body$1637;
    }
    AnonFun$1190.properties = [
        'keyword',
        'star',
        'params',
        'body'
    ];
    AnonFun$1190.create = function (keyword$1642, star$1643, params$1644, body$1645) {
        return new AnonFun$1190(keyword$1642, star$1643, params$1644, body$1645);
    };
    inherit$850(Expr$1155, AnonFun$1190, { 'isAnonFun': true });
    function ArrowFun$1195(params$1647, arrow$1648, body$1649) {
        this.params = params$1647;
        this.arrow = arrow$1648;
        this.body = body$1649;
    }
    ArrowFun$1195.properties = [
        'params',
        'arrow',
        'body'
    ];
    ArrowFun$1195.create = function (params$1653, arrow$1654, body$1655) {
        return new ArrowFun$1195(params$1653, arrow$1654, body$1655);
    };
    inherit$850(Expr$1155, ArrowFun$1195, { 'isArrowFun': true });
    function ObjDotGet$1200(left$1657, dot$1658, right$1659) {
        this.left = left$1657;
        this.dot = dot$1658;
        this.right = right$1659;
    }
    ObjDotGet$1200.properties = [
        'left',
        'dot',
        'right'
    ];
    ObjDotGet$1200.create = function (left$1663, dot$1664, right$1665) {
        return new ObjDotGet$1200(left$1663, dot$1664, right$1665);
    };
    inherit$850(Expr$1155, ObjDotGet$1200, { 'isObjDotGet': true });
    function ObjGet$1205(left$1667, right$1668) {
        this.left = left$1667;
        this.right = right$1668;
    }
    ObjGet$1205.properties = [
        'left',
        'right'
    ];
    ObjGet$1205.create = function (left$1671, right$1672) {
        return new ObjGet$1205(left$1671, right$1672);
    };
    inherit$850(Expr$1155, ObjGet$1205, { 'isObjGet': true });
    function Template$1210(template$1674) {
        this.template = template$1674;
    }
    Template$1210.properties = ['template'];
    Template$1210.create = function (template$1676) {
        return new Template$1210(template$1676);
    };
    inherit$850(Expr$1155, Template$1210, { 'isTemplate': true });
    function Call$1215(fun$1678, args$1679) {
        this.fun = fun$1678;
        this.args = args$1679;
    }
    Call$1215.properties = [
        'fun',
        'args'
    ];
    Call$1215.create = function (fun$1682, args$1683) {
        return new Call$1215(fun$1682, args$1683);
    };
    inherit$850(Expr$1155, Call$1215, { 'isCall': true });
    function QuoteSyntax$1220(stx$1685) {
        this.stx = stx$1685;
    }
    QuoteSyntax$1220.properties = ['stx'];
    QuoteSyntax$1220.create = function (stx$1687) {
        return new QuoteSyntax$1220(stx$1687);
    };
    inherit$850(Expr$1155, QuoteSyntax$1220, {
        'isQuoteSyntax': true,
        'destruct': function (context$1690, options$1691) {
            var tempId$1692 = fresh$846();
            context$1690.templateMap.set(tempId$1692, this.stx.token.inner);
            return [
                syn$743.makeIdent('getTemplate', this.stx),
                syn$743.makeDelim('()', [syn$743.makeValue(tempId$1692, this.stx)], this.stx)
            ];
        }
    });
    function PrimaryExpression$1225() {
    }
    PrimaryExpression$1225.properties = [];
    PrimaryExpression$1225.create = function () {
        return new PrimaryExpression$1225();
    };
    inherit$850(Expr$1155, PrimaryExpression$1225, { 'isPrimaryExpression': true });
    function ThisExpression$1230(keyword$1694) {
        this.keyword = keyword$1694;
    }
    ThisExpression$1230.properties = ['keyword'];
    ThisExpression$1230.create = function (keyword$1696) {
        return new ThisExpression$1230(keyword$1696);
    };
    inherit$850(PrimaryExpression$1225, ThisExpression$1230, { 'isThisExpression': true });
    function Lit$1235(lit$1698) {
        this.lit = lit$1698;
    }
    Lit$1235.properties = ['lit'];
    Lit$1235.create = function (lit$1700) {
        return new Lit$1235(lit$1700);
    };
    inherit$850(PrimaryExpression$1225, Lit$1235, { 'isLit': true });
    function Block$1240(body$1702) {
        this.body = body$1702;
    }
    Block$1240.properties = ['body'];
    Block$1240.create = function (body$1704) {
        return new Block$1240(body$1704);
    };
    inherit$850(PrimaryExpression$1225, Block$1240, { 'isBlock': true });
    function ArrayLiteral$1245(array$1706) {
        this.array = array$1706;
    }
    ArrayLiteral$1245.properties = ['array'];
    ArrayLiteral$1245.create = function (array$1708) {
        return new ArrayLiteral$1245(array$1708);
    };
    inherit$850(PrimaryExpression$1225, ArrayLiteral$1245, { 'isArrayLiteral': true });
    function Id$1250(id$1710) {
        this.id = id$1710;
    }
    Id$1250.properties = ['id'];
    Id$1250.create = function (id$1712) {
        return new Id$1250(id$1712);
    };
    inherit$850(PrimaryExpression$1225, Id$1250, { 'isId': true });
    function Partial$1255() {
    }
    Partial$1255.properties = [];
    Partial$1255.create = function () {
        return new Partial$1255();
    };
    inherit$850(TermTree$1051, Partial$1255, { 'isPartial': true });
    function PartialOperation$1260(stx$1715, left$1716) {
        this.stx = stx$1715;
        this.left = left$1716;
    }
    PartialOperation$1260.properties = [
        'stx',
        'left'
    ];
    PartialOperation$1260.create = function (stx$1719, left$1720) {
        return new PartialOperation$1260(stx$1719, left$1720);
    };
    inherit$850(Partial$1255, PartialOperation$1260, { 'isPartialOperation': true });
    function PartialExpression$1265(stx$1722, left$1723, combine$1724) {
        this.stx = stx$1722;
        this.left = left$1723;
        this.combine = combine$1724;
    }
    PartialExpression$1265.properties = [
        'stx',
        'left',
        'combine'
    ];
    PartialExpression$1265.create = function (stx$1728, left$1729, combine$1730) {
        return new PartialExpression$1265(stx$1728, left$1729, combine$1730);
    };
    inherit$850(Partial$1255, PartialExpression$1265, { 'isPartialExpression': true });
    function BindingStatement$1270(keyword$1732, decls$1733) {
        this.keyword = keyword$1732;
        this.decls = decls$1733;
    }
    BindingStatement$1270.properties = [
        'keyword',
        'decls'
    ];
    BindingStatement$1270.create = function (keyword$1736, decls$1737) {
        return new BindingStatement$1270(keyword$1736, decls$1737);
    };
    inherit$850(Statement$1130, BindingStatement$1270, {
        'isBindingStatement': true,
        'destruct': function (context$1740, options$1741) {
            return this.keyword.destruct(context$1740, options$1741).concat(_$741.reduce(this.decls, function (acc$1742, decl$1743) {
                push$836.apply(acc$1742, decl$1743.destruct(context$1740, options$1741));
                return acc$1742;
            }, []));
        }
    });
    function VariableStatement$1275(keyword$1744, decls$1745) {
        this.keyword = keyword$1744;
        this.decls = decls$1745;
    }
    VariableStatement$1275.properties = [
        'keyword',
        'decls'
    ];
    VariableStatement$1275.create = function (keyword$1748, decls$1749) {
        return new VariableStatement$1275(keyword$1748, decls$1749);
    };
    inherit$850(BindingStatement$1270, VariableStatement$1275, { 'isVariableStatement': true });
    function LetStatement$1280(keyword$1751, decls$1752) {
        this.keyword = keyword$1751;
        this.decls = decls$1752;
    }
    LetStatement$1280.properties = [
        'keyword',
        'decls'
    ];
    LetStatement$1280.create = function (keyword$1755, decls$1756) {
        return new LetStatement$1280(keyword$1755, decls$1756);
    };
    inherit$850(BindingStatement$1270, LetStatement$1280, { 'isLetStatement': true });
    function ConstStatement$1285(keyword$1758, decls$1759) {
        this.keyword = keyword$1758;
        this.decls = decls$1759;
    }
    ConstStatement$1285.properties = [
        'keyword',
        'decls'
    ];
    ConstStatement$1285.create = function (keyword$1762, decls$1763) {
        return new ConstStatement$1285(keyword$1762, decls$1763);
    };
    inherit$850(BindingStatement$1270, ConstStatement$1285, { 'isConstStatement': true });
    function ParenExpression$1290(args$1765, delim$1766, commas$1767) {
        this.args = args$1765;
        this.delim = delim$1766;
        this.commas = commas$1767;
    }
    ParenExpression$1290.properties = [
        'args',
        'delim',
        'commas'
    ];
    ParenExpression$1290.create = function (args$1771, delim$1772, commas$1773) {
        return new ParenExpression$1290(args$1771, delim$1772, commas$1773);
    };
    inherit$850(PrimaryExpression$1225, ParenExpression$1290, {
        'isParenExpression': true,
        'destruct': function (context$1776, options$1777) {
            var commas$1778 = this.commas.slice();
            var src$1780 = this.delim.token;
            var keys$1781 = Object.keys(src$1780);
            var newtok$1782 = {};
            for (var i$1783 = 0, len$1784 = keys$1781.length, key$1785; i$1783 < len$1784; i$1783++) {
                key$1785 = keys$1781[i$1783];
                newtok$1782[key$1785] = src$1780[key$1785];
            }
            var delim$1786 = syntaxFromToken$830(newtok$1782, this.delim);
            delim$1786.token.inner = _$741.reduce(this.args, function (acc$1787, term$1788) {
                assert$749(term$1788 && term$1788.isTermTree, 'expecting term trees in destruct of ParenExpression');
                push$836.apply(acc$1787, term$1788.destruct(context$1776, options$1777));
                if (// add all commas except for the last one
                    commas$1778.length > 0) {
                    acc$1787.push(commas$1778.shift());
                }
                return acc$1787;
            }, []);
            return Delimiter$1070.create(delim$1786).destruct(context$1776, options$1777);
        }
    });
    function stxIsUnaryOp$1292(stx$1789) {
        var staticOperators$1790 = [
            '+',
            '-',
            '~',
            '!',
            'delete',
            'void',
            'typeof',
            'yield',
            'new',
            '++',
            '--'
        ];
        return _$741.contains(staticOperators$1790, unwrapSyntax$753(stx$1789));
    }
    function stxIsBinOp$1293(stx$1791) {
        var staticOperators$1792 = [
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
        return _$741.contains(staticOperators$1792, unwrapSyntax$753(stx$1791));
    }
    function getUnaryOpPrec$1294(op$1793) {
        var operatorPrecedence$1794 = {
            'new': 16,
            '++': 15,
            '--': 15,
            '!': 14,
            '~': 14,
            '+': 14,
            '-': 14,
            'typeof': 14,
            'void': 14,
            'delete': 14,
            'yield': 2
        };
        return operatorPrecedence$1794[op$1793];
    }
    function getBinaryOpPrec$1295(op$1795) {
        var operatorPrecedence$1796 = {
            '*': 13,
            '/': 13,
            '%': 13,
            '+': 12,
            '-': 12,
            '>>': 11,
            '<<': 11,
            '>>>': 11,
            '<': 10,
            '<=': 10,
            '>': 10,
            '>=': 10,
            'in': 10,
            'instanceof': 10,
            '==': 9,
            '!=': 9,
            '===': 9,
            '!==': 9,
            '&': 8,
            '^': 7,
            '|': 6,
            '&&': 5,
            '||': 4
        };
        return operatorPrecedence$1796[op$1795];
    }
    function getBinaryOpAssoc$1296(op$1797) {
        var operatorAssoc$1798 = {
            '*': 'left',
            '/': 'left',
            '%': 'left',
            '+': 'left',
            '-': 'left',
            '>>': 'left',
            '<<': 'left',
            '>>>': 'left',
            '<': 'left',
            '<=': 'left',
            '>': 'left',
            '>=': 'left',
            'in': 'left',
            'instanceof': 'left',
            '==': 'left',
            '!=': 'left',
            '===': 'left',
            '!==': 'left',
            '&': 'left',
            '^': 'left',
            '|': 'left',
            '&&': 'left',
            '||': 'left'
        };
        return operatorAssoc$1798[op$1797];
    }
    function stxIsAssignOp$1297(stx$1799) {
        var staticOperators$1800 = [
            '=',
            '+=',
            '-=',
            '*=',
            '/=',
            '%=',
            '<<=',
            '>>=',
            '>>>=',
            '|=',
            '^=',
            '&='
        ];
        return _$741.contains(staticOperators$1800, unwrapSyntax$753(stx$1799));
    }
    function enforestVarStatement$1298(stx$1801, context$1802, varStx$1803) {
        var decls$1804 = [];
        var rest$1805 = stx$1801;
        var rhs$1806;
        if (!rest$1805.length) {
            throwSyntaxError$750('enforest', 'Unexpected end of input', varStx$1803);
        }
        if (expandCount$833 >= maxExpands$834) {
            return null;
        }
        while (rest$1805.length) {
            if (rest$1805[0].token.type === parser$742.Token.Identifier) {
                if (rest$1805[1] && rest$1805[1].token.type === parser$742.Token.Punctuator && rest$1805[1].token.value === '=') {
                    rhs$1806 = get_expression$1312(rest$1805.slice(2), context$1802);
                    if (rhs$1806.result == null) {
                        throwSyntaxError$750('enforest', 'Unexpected token', rhs$1806.rest[0]);
                    }
                    if (rhs$1806.rest[0] && rhs$1806.rest[0].token.type === parser$742.Token.Punctuator && rhs$1806.rest[0].token.value === ',') {
                        decls$1804.push(VariableDeclaration$1125.create(rest$1805[0], rest$1805[1], rhs$1806.result, rhs$1806.rest[0]));
                        rest$1805 = rhs$1806.rest.slice(1);
                        continue;
                    } else {
                        decls$1804.push(VariableDeclaration$1125.create(rest$1805[0], rest$1805[1], rhs$1806.result, null));
                        rest$1805 = rhs$1806.rest;
                        break;
                    }
                } else if (rest$1805[1] && rest$1805[1].token.type === parser$742.Token.Punctuator && rest$1805[1].token.value === ',') {
                    decls$1804.push(VariableDeclaration$1125.create(rest$1805[0], null, null, rest$1805[1]));
                    rest$1805 = rest$1805.slice(2);
                } else {
                    decls$1804.push(VariableDeclaration$1125.create(rest$1805[0], null, null, null));
                    rest$1805 = rest$1805.slice(1);
                    break;
                }
            } else {
                throwSyntaxError$750('enforest', 'Unexpected token', rest$1805[0]);
            }
        }
        return {
            result: decls$1804,
            rest: rest$1805
        };
    }
    function enforestAssignment$1299(stx$1807, context$1808, left$1809, prevStx$1810, prevTerms$1811) {
        var op$1812 = stx$1807[0];
        var rightStx$1813 = stx$1807.slice(1);
        var opTerm$1814 = Punc$1065.create(stx$1807[0]);
        var opPrevStx$1815 = tagWithTerm$1313(opTerm$1814, [stx$1807[0]]).concat(tagWithTerm$1313(left$1809, left$1809.destruct(context$1808).reverse()), prevStx$1810);
        var opPrevTerms$1816 = [
            opTerm$1814,
            left$1809
        ].concat(prevTerms$1811);
        var opRes$1817 = enforest$1310(rightStx$1813, context$1808, opPrevStx$1815, opPrevTerms$1816);
        if (opRes$1817.result) {
            if (// Lookbehind was matched, so it may not even be a binop anymore.
                opRes$1817.prevTerms.length < opPrevTerms$1816.length) {
                return opRes$1817;
            }
            var right$1818 = opRes$1817.result;
            if (// only a binop if the right is a real expression
                // so 2+2++ will only match 2+2
                right$1818.isExpr) {
                var term$1819 = AssignmentExpression$1175.create(left$1809, op$1812, right$1818);
                return {
                    result: term$1819,
                    rest: opRes$1817.rest,
                    prevStx: prevStx$1810,
                    prevTerms: prevTerms$1811
                };
            }
        } else {
            return opRes$1817;
        }
    }
    function enforestParenExpression$1300(parens$1820, context$1821) {
        var argRes$1822, enforestedArgs$1823 = [], commas$1824 = [];
        var innerTokens$1825 = parens$1820.token.inner;
        while (innerTokens$1825.length > 0) {
            argRes$1822 = enforest$1310(innerTokens$1825, context$1821);
            if (!argRes$1822.result || !argRes$1822.result.isExpr) {
                return null;
            }
            enforestedArgs$1823.push(argRes$1822.result);
            innerTokens$1825 = argRes$1822.rest;
            if (innerTokens$1825[0] && innerTokens$1825[0].token.value === ',') {
                // record the comma for later
                commas$1824.push(innerTokens$1825[0]);
                // but dump it for the next loop turn
                innerTokens$1825 = innerTokens$1825.slice(1);
            } else {
                // either there are no more tokens or
                // they aren't a comma, either way we
                // are done with the loop
                break;
            }
        }
        return innerTokens$1825.length ? null : ParenExpression$1290.create(enforestedArgs$1823, parens$1820, commas$1824);
    }
    function adjustLineContext$1301(stx$1826, original$1827, current$1828) {
        if (// short circuit when the array is empty;
            stx$1826.length === 0) {
            return stx$1826;
        }
        current$1828 = current$1828 || {
            lastLineNumber: stx$1826[0].token.lineNumber || stx$1826[0].token.startLineNumber,
            lineNumber: original$1827.token.lineNumber
        };
        return _$741.map(stx$1826, function (stx$1829) {
            if (stx$1829.token.type === parser$742.Token.Delimiter) {
                // handle tokens with missing line info
                stx$1829.token.startLineNumber = typeof stx$1829.token.startLineNumber == 'undefined' ? original$1827.token.lineNumber : stx$1829.token.startLineNumber;
                stx$1829.token.endLineNumber = typeof stx$1829.token.endLineNumber == 'undefined' ? original$1827.token.lineNumber : stx$1829.token.endLineNumber;
                stx$1829.token.startLineStart = typeof stx$1829.token.startLineStart == 'undefined' ? original$1827.token.lineStart : stx$1829.token.startLineStart;
                stx$1829.token.endLineStart = typeof stx$1829.token.endLineStart == 'undefined' ? original$1827.token.lineStart : stx$1829.token.endLineStart;
                stx$1829.token.startRange = typeof stx$1829.token.startRange == 'undefined' ? original$1827.token.range : stx$1829.token.startRange;
                stx$1829.token.endRange = typeof stx$1829.token.endRange == 'undefined' ? original$1827.token.range : stx$1829.token.endRange;
                stx$1829.token.sm_startLineNumber = typeof stx$1829.token.sm_startLineNumber == 'undefined' ? stx$1829.token.startLineNumber : stx$1829.token.sm_startLineNumber;
                stx$1829.token.sm_endLineNumber = typeof stx$1829.token.sm_endLineNumber == 'undefined' ? stx$1829.token.endLineNumber : stx$1829.token.sm_endLineNumber;
                stx$1829.token.sm_startLineStart = typeof stx$1829.token.sm_startLineStart == 'undefined' ? stx$1829.token.startLineStart : stx$1829.token.sm_startLineStart;
                stx$1829.token.sm_endLineStart = typeof stx$1829.token.sm_endLineStart == 'undefined' ? stx$1829.token.endLineStart : stx$1829.token.sm_endLineStart;
                stx$1829.token.sm_startRange = typeof stx$1829.token.sm_startRange == 'undefined' ? stx$1829.token.startRange : stx$1829.token.sm_startRange;
                stx$1829.token.sm_endRange = typeof stx$1829.token.sm_endRange == 'undefined' ? stx$1829.token.endRange : stx$1829.token.sm_endRange;
                if (stx$1829.token.startLineNumber !== current$1828.lineNumber) {
                    if (stx$1829.token.startLineNumber !== current$1828.lastLineNumber) {
                        current$1828.lineNumber++;
                        current$1828.lastLineNumber = stx$1829.token.startLineNumber;
                        stx$1829.token.startLineNumber = current$1828.lineNumber;
                    } else {
                        current$1828.lastLineNumber = stx$1829.token.startLineNumber;
                        stx$1829.token.startLineNumber = current$1828.lineNumber;
                    }
                }
                return stx$1829;
            }
            // handle tokens with missing line info
            stx$1829.token.lineNumber = typeof stx$1829.token.lineNumber == 'undefined' ? original$1827.token.lineNumber : stx$1829.token.lineNumber;
            stx$1829.token.lineStart = typeof stx$1829.token.lineStart == 'undefined' ? original$1827.token.lineStart : stx$1829.token.lineStart;
            stx$1829.token.range = typeof stx$1829.token.range == 'undefined' ? original$1827.token.range : stx$1829.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of
            // just write once).
            stx$1829.token.sm_lineNumber = typeof stx$1829.token.sm_lineNumber == 'undefined' ? stx$1829.token.lineNumber : stx$1829.token.sm_lineNumber;
            stx$1829.token.sm_lineStart = typeof stx$1829.token.sm_lineStart == 'undefined' ? stx$1829.token.lineStart : stx$1829.token.sm_lineStart;
            stx$1829.token.sm_range = typeof stx$1829.token.sm_range == 'undefined' ? stx$1829.token.range.slice() : stx$1829.token.sm_range;
            if (// move the line info to line up with the macro name
                // (line info starting from the macro name)
                stx$1829.token.lineNumber !== current$1828.lineNumber) {
                if (stx$1829.token.lineNumber !== current$1828.lastLineNumber) {
                    current$1828.lineNumber++;
                    current$1828.lastLineNumber = stx$1829.token.lineNumber;
                    stx$1829.token.lineNumber = current$1828.lineNumber;
                } else {
                    current$1828.lastLineNumber = stx$1829.token.lineNumber;
                    stx$1829.token.lineNumber = current$1828.lineNumber;
                }
            }
            return stx$1829;
        });
    }
    function getName$1302(head$1830, rest$1831) {
        var idx$1832 = 0;
        var curr$1833 = head$1830;
        var next$1834 = rest$1831[idx$1832];
        var name$1835 = [head$1830];
        while (true) {
            if (next$1834 && (next$1834.token.type === parser$742.Token.Punctuator || next$1834.token.type === parser$742.Token.Identifier || next$1834.token.type === parser$742.Token.Keyword) && toksAdjacent$1308(curr$1833, next$1834)) {
                name$1835.push(next$1834);
                curr$1833 = next$1834;
                next$1834 = rest$1831[++idx$1832];
            } else {
                return name$1835;
            }
        }
    }
    function getValueInEnv$1303(head$1836, rest$1837, context$1838, phase$1839) {
        if (!(head$1836.token.type === parser$742.Token.Identifier || head$1836.token.type === parser$742.Token.Keyword || head$1836.token.type === parser$742.Token.Punctuator)) {
            return null;
        }
        var name$1840 = getName$1302(head$1836, rest$1837);
        if (// simple case, don't need to create a new syntax object
            name$1840.length === 1) {
            if (context$1838.env.names.get(unwrapSyntax$753(name$1840[0]))) {
                var resolvedName$1841 = resolve$839(name$1840[0], phase$1839);
                if (context$1838.env.has(resolvedName$1841)) {
                    return context$1838.env.get(resolvedName$1841);
                }
            }
            return null;
        } else {
            while (name$1840.length > 0) {
                var nameStr$1842 = name$1840.map(unwrapSyntax$753).join('');
                if (context$1838.env.names.get(nameStr$1842)) {
                    var nameStx$1843 = syn$743.makeIdent(nameStr$1842, name$1840[0]);
                    var resolvedName$1841 = resolve$839(nameStx$1843, phase$1839);
                    if (context$1838.env.has(resolvedName$1841)) {
                        return context$1838.env.get(resolvedName$1841);
                    }
                }
                name$1840.pop();
            }
            return null;
        }
    }
    function nameInEnv$1304(head$1844, rest$1845, context$1846, phase$1847) {
        return getValueInEnv$1303(head$1844, rest$1845, context$1846, phase$1847) !== null;
    }
    function resolveFast$1305(stx$1848, env$1849, phase$1850) {
        var name$1851 = unwrapSyntax$753(stx$1848);
        return env$1849.names.get(name$1851) ? resolve$839(stx$1848, phase$1850) : name$1851;
    }
    function expandMacro$1306(stx$1852, context$1853, opCtx$1854, opType$1855, macroObj$1856) {
        var // pull the macro transformer out the environment
        head$1857 = stx$1852[0];
        var rest$1858 = stx$1852.slice(1);
        macroObj$1856 = macroObj$1856 || getValueInEnv$1303(head$1857, rest$1858, context$1853, context$1853.phase);
        var stxArg$1859 = rest$1858.slice(macroObj$1856.fullName.length - 1);
        var transformer$1860;
        if (opType$1855 != null) {
            assert$749(opType$1855 === 'binary' || opType$1855 === 'unary', 'operator type should be either unary or binary: ' + opType$1855);
            transformer$1860 = macroObj$1856[opType$1855].fn;
        } else {
            transformer$1860 = macroObj$1856.fn;
        }
        assert$749(typeof transformer$1860 === 'function', 'Macro transformer not bound for: ' + head$1857.token.value);
        var // create a new mark to be used for the input to
        // the macro
        newMark$1861 = fresh$846();
        var transformerContext$1862 = makeExpanderContext$1320(_$741.defaults({ mark: newMark$1861 }, context$1853));
        // apply the transformer
        var rt$1863;
        try {
            rt$1863 = transformer$1860([head$1857].concat(stxArg$1859), transformerContext$1862, opCtx$1854.prevStx, opCtx$1854.prevTerms);
        } catch (e$1864) {
            if (e$1864 instanceof SyntaxCaseError$752) {
                var // add a nicer error for syntax case
                nameStr$1865 = macroObj$1856.fullName.map(function (stx$1866) {
                    return stx$1866.token.value;
                }).join('');
                if (opType$1855 != null) {
                    var argumentString$1867 = '`' + stxArg$1859.slice(0, 5).map(function (stx$1868) {
                        return stx$1868.token.value;
                    }).join(' ') + '...`';
                    throwSyntaxError$750('operator', 'Operator `' + nameStr$1865 + '` could not be matched with ' + argumentString$1867, head$1857);
                } else {
                    var argumentString$1867 = '`' + stxArg$1859.slice(0, 5).map(function (stx$1869) {
                        return stx$1869.token.value;
                    }).join(' ') + '...`';
                    throwSyntaxError$750('macro', 'Macro `' + nameStr$1865 + '` could not be matched with ' + argumentString$1867, head$1857);
                }
            } else {
                // just rethrow it
                throw e$1864;
            }
        }
        if (!builtinMode$832 && !macroObj$1856.builtin) {
            expandCount$833++;
        }
        if (!Array.isArray(rt$1863.result)) {
            throwSyntaxError$750('enforest', 'Macro must return a syntax array', stx$1852[0]);
        }
        if (rt$1863.result.length > 0) {
            var adjustedResult$1870 = adjustLineContext$1301(rt$1863.result, head$1857);
            if (stx$1852[0].token.leadingComments) {
                if (adjustedResult$1870[0].token.leadingComments) {
                    adjustedResult$1870[0].token.leadingComments = adjustedResult$1870[0].token.leadingComments.concat(head$1857.token.leadingComments);
                } else {
                    adjustedResult$1870[0].token.leadingComments = head$1857.token.leadingComments;
                }
            }
            rt$1863.result = adjustedResult$1870;
        }
        return rt$1863;
    }
    function comparePrec$1307(left$1871, right$1872, assoc$1873) {
        if (assoc$1873 === 'left') {
            return left$1871 <= right$1872;
        }
        return left$1871 < right$1872;
    }
    function toksAdjacent$1308(a$1874, b$1875) {
        var arange$1876 = a$1874.token.sm_range || a$1874.token.range || a$1874.token.endRange;
        var brange$1877 = b$1875.token.sm_range || b$1875.token.range || b$1875.token.endRange;
        return arange$1876 && brange$1877 && arange$1876[1] === brange$1877[0];
    }
    function syntaxInnerValuesEq$1309(synA$1878, synB$1879) {
        var a$1880 = synA$1878.token.inner, b$1881 = synB$1879.token.inner;
        return function (ziped$1885) {
            return _$741.all(ziped$1885, function (pair$1886) {
                return unwrapSyntax$753(pair$1886[0]) === unwrapSyntax$753(pair$1886[1]);
            });
        }(a$1880.length === b$1881.length && _$741.zip(a$1880, b$1881));
    }
    function enforest$1310(toks$1887, context$1888, prevStx$1889, prevTerms$1890) {
        assert$749(toks$1887.length > 0, 'enforest assumes there are tokens to work with');
        prevStx$1889 = prevStx$1889 || [];
        prevTerms$1890 = prevTerms$1890 || [];
        if (expandCount$833 >= maxExpands$834) {
            return {
                result: null,
                rest: toks$1887
            };
        }
        function step$1891(head$1892, rest$1893, opCtx$1894) {
            var innerTokens$1895;
            assert$749(Array.isArray(rest$1893), 'result must at least be an empty array');
            if (head$1892.isTermTree) {
                var isCustomOp$1897 = false;
                var uopMacroObj$1898;
                var uopSyntax$1899;
                if (head$1892.isPunc || head$1892.isKeyword || head$1892.isId) {
                    if (head$1892.isPunc) {
                        uopSyntax$1899 = head$1892.punc;
                    } else if (head$1892.isKeyword) {
                        uopSyntax$1899 = head$1892.keyword;
                    } else if (head$1892.isId) {
                        uopSyntax$1899 = head$1892.id;
                    }
                    uopMacroObj$1898 = getValueInEnv$1303(uopSyntax$1899, rest$1893, context$1888, context$1888.phase);
                    isCustomOp$1897 = uopMacroObj$1898 && uopMacroObj$1898.isOp;
                }
                // look up once (we want to check multiple properties on bopMacroObj
                // without repeatedly calling getValueInEnv)
                var bopMacroObj$1900;
                if (rest$1893[0] && rest$1893[1]) {
                    bopMacroObj$1900 = getValueInEnv$1303(rest$1893[0], rest$1893.slice(1), context$1888, context$1888.phase);
                }
                if (// unary operator
                    isCustomOp$1897 && uopMacroObj$1898.unary || uopSyntax$1899 && stxIsUnaryOp$1292(uopSyntax$1899)) {
                    var uopPrec$1901;
                    if (isCustomOp$1897 && uopMacroObj$1898.unary) {
                        uopPrec$1901 = uopMacroObj$1898.unary.prec;
                    } else {
                        uopPrec$1901 = getUnaryOpPrec$1294(unwrapSyntax$753(uopSyntax$1899));
                    }
                    var opRest$1902 = rest$1893;
                    var uopMacroName$1903;
                    if (uopMacroObj$1898) {
                        uopMacroName$1903 = [uopSyntax$1899].concat(rest$1893.slice(0, uopMacroObj$1898.fullName.length - 1));
                        opRest$1902 = rest$1893.slice(uopMacroObj$1898.fullName.length - 1);
                    }
                    var leftLeft$1904 = opCtx$1894.prevTerms[0] && opCtx$1894.prevTerms[0].isPartial ? opCtx$1894.prevTerms[0] : null;
                    var unopTerm$1905 = PartialOperation$1260.create(head$1892, leftLeft$1904);
                    var unopPrevStx$1906 = tagWithTerm$1313(unopTerm$1905, head$1892.destruct(context$1888).reverse()).concat(opCtx$1894.prevStx);
                    var unopPrevTerms$1907 = [unopTerm$1905].concat(opCtx$1894.prevTerms);
                    var unopOpCtx$1908 = _$741.extend({}, opCtx$1894, {
                        combine: function (t$1909) {
                            if (t$1909.isExpr) {
                                if (isCustomOp$1897 && uopMacroObj$1898.unary) {
                                    var rt$1910 = expandMacro$1306(uopMacroName$1903.concat(t$1909.destruct(context$1888)), context$1888, opCtx$1894, 'unary');
                                    var newt$1911 = get_expression$1312(rt$1910.result, context$1888);
                                    assert$749(newt$1911.rest.length === 0, 'should never have left over syntax');
                                    return opCtx$1894.combine(newt$1911.result);
                                }
                                return opCtx$1894.combine(UnaryOp$1160.create(uopSyntax$1899, t$1909));
                            } else {
                                // not actually an expression so don't create
                                // a UnaryOp term just return with the punctuator
                                return opCtx$1894.combine(head$1892);
                            }
                        },
                        prec: uopPrec$1901,
                        prevStx: unopPrevStx$1906,
                        prevTerms: unopPrevTerms$1907,
                        op: unopTerm$1905
                    });
                    return step$1891(opRest$1902[0], opRest$1902.slice(1), unopOpCtx$1908);
                } else if (head$1892.isExpr && (rest$1893[0] && rest$1893[1] && (stxIsBinOp$1293(rest$1893[0]) && !bopMacroObj$1900 || bopMacroObj$1900 && bopMacroObj$1900.isOp && bopMacroObj$1900.binary))) {
                    var opRes$1912;
                    var op$1913 = rest$1893[0];
                    var left$1914 = head$1892;
                    var rightStx$1915 = rest$1893.slice(1);
                    var leftLeft$1904 = opCtx$1894.prevTerms[0] && opCtx$1894.prevTerms[0].isPartial ? opCtx$1894.prevTerms[0] : null;
                    var leftTerm$1916 = PartialExpression$1265.create(head$1892.destruct(context$1888), leftLeft$1904, function () {
                        return step$1891(head$1892, [], opCtx$1894);
                    });
                    var opTerm$1917 = PartialOperation$1260.create(op$1913, leftTerm$1916);
                    var opPrevStx$1918 = tagWithTerm$1313(opTerm$1917, [rest$1893[0]]).concat(tagWithTerm$1313(leftTerm$1916, head$1892.destruct(context$1888)).reverse(), opCtx$1894.prevStx);
                    var opPrevTerms$1919 = [
                        opTerm$1917,
                        leftTerm$1916
                    ].concat(opCtx$1894.prevTerms);
                    var isCustomOp$1897 = bopMacroObj$1900 && bopMacroObj$1900.isOp && bopMacroObj$1900.binary;
                    var bopPrec$1920;
                    var bopAssoc$1921;
                    if (isCustomOp$1897 && bopMacroObj$1900.binary) {
                        bopPrec$1920 = bopMacroObj$1900.binary.prec;
                        bopAssoc$1921 = bopMacroObj$1900.binary.assoc;
                    } else {
                        bopPrec$1920 = getBinaryOpPrec$1295(unwrapSyntax$753(op$1913));
                        bopAssoc$1921 = getBinaryOpAssoc$1296(unwrapSyntax$753(op$1913));
                    }
                    assert$749(bopPrec$1920 !== undefined, 'expecting a precedence for operator: ' + op$1913);
                    var newStack$1922;
                    if (comparePrec$1307(bopPrec$1920, opCtx$1894.prec, bopAssoc$1921)) {
                        var bopCtx$1926 = opCtx$1894;
                        var combResult$1896 = opCtx$1894.combine(head$1892);
                        if (opCtx$1894.stack.length > 0) {
                            return step$1891(combResult$1896.term, rest$1893, opCtx$1894.stack[0]);
                        }
                        left$1914 = combResult$1896.term;
                        newStack$1922 = opCtx$1894.stack;
                        opPrevStx$1918 = combResult$1896.prevStx;
                        opPrevTerms$1919 = combResult$1896.prevTerms;
                    } else {
                        newStack$1922 = [opCtx$1894].concat(opCtx$1894.stack);
                    }
                    assert$749(opCtx$1894.combine !== undefined, 'expecting a combine function');
                    var opRightStx$1923 = rightStx$1915;
                    var bopMacroName$1924;
                    if (isCustomOp$1897) {
                        bopMacroName$1924 = rest$1893.slice(0, bopMacroObj$1900.fullName.length);
                        opRightStx$1923 = rightStx$1915.slice(bopMacroObj$1900.fullName.length - 1);
                    }
                    var bopOpCtx$1925 = _$741.extend({}, opCtx$1894, {
                        combine: function (right$1927) {
                            if (right$1927.isExpr) {
                                if (isCustomOp$1897 && bopMacroObj$1900.binary) {
                                    var leftStx$1928 = left$1914.destruct(context$1888);
                                    var rightStx$1929 = right$1927.destruct(context$1888);
                                    var rt$1930 = expandMacro$1306(bopMacroName$1924.concat(syn$743.makeDelim('()', leftStx$1928, leftStx$1928[0]), syn$743.makeDelim('()', rightStx$1929, rightStx$1929[0])), context$1888, opCtx$1894, 'binary');
                                    var newt$1931 = get_expression$1312(rt$1930.result, context$1888);
                                    assert$749(newt$1931.rest.length === 0, 'should never have left over syntax');
                                    return {
                                        term: newt$1931.result,
                                        prevStx: opPrevStx$1918,
                                        prevTerms: opPrevTerms$1919
                                    };
                                }
                                return {
                                    term: BinOp$1170.create(left$1914, op$1913, right$1927),
                                    prevStx: opPrevStx$1918,
                                    prevTerms: opPrevTerms$1919
                                };
                            } else {
                                return {
                                    term: head$1892,
                                    prevStx: opPrevStx$1918,
                                    prevTerms: opPrevTerms$1919
                                };
                            }
                        },
                        prec: bopPrec$1920,
                        op: opTerm$1917,
                        stack: newStack$1922,
                        prevStx: opPrevStx$1918,
                        prevTerms: opPrevTerms$1919
                    });
                    return step$1891(opRightStx$1923[0], opRightStx$1923.slice(1), bopOpCtx$1925);
                } else if (head$1892.isExpr && (rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Delimiter && rest$1893[0].token.value === '()')) {
                    var parenRes$1932 = enforestParenExpression$1300(rest$1893[0], context$1888);
                    if (parenRes$1932) {
                        return step$1891(Call$1215.create(head$1892, parenRes$1932), rest$1893.slice(1), opCtx$1894);
                    }
                } else if (head$1892.isExpr && (rest$1893[0] && resolveFast$1305(rest$1893[0], context$1888.env, context$1888.phase) === '?')) {
                    var question$1933 = rest$1893[0];
                    var condRes$1934 = enforest$1310(rest$1893.slice(1), context$1888);
                    if (condRes$1934.result) {
                        var truExpr$1935 = condRes$1934.result;
                        var condRight$1936 = condRes$1934.rest;
                        if (truExpr$1935.isExpr && condRight$1936[0] && resolveFast$1305(condRight$1936[0], context$1888.env, context$1888.phase) === ':') {
                            var colon$1937 = condRight$1936[0];
                            var flsRes$1938 = enforest$1310(condRight$1936.slice(1), context$1888);
                            var flsExpr$1939 = flsRes$1938.result;
                            if (flsExpr$1939.isExpr) {
                                if (// operators are combined before the ternary
                                    opCtx$1894.prec >= 4) {
                                    var // ternary is like a operator with prec 4
                                    headResult$1940 = opCtx$1894.combine(head$1892);
                                    var condTerm$1941 = ConditionalExpression$1180.create(headResult$1940.term, question$1933, truExpr$1935, colon$1937, flsExpr$1939);
                                    if (opCtx$1894.stack.length > 0) {
                                        return step$1891(condTerm$1941, flsRes$1938.rest, opCtx$1894.stack[0]);
                                    } else {
                                        return {
                                            result: condTerm$1941,
                                            rest: flsRes$1938.rest,
                                            prevStx: headResult$1940.prevStx,
                                            prevTerms: headResult$1940.prevTerms
                                        };
                                    }
                                } else {
                                    var condTerm$1941 = ConditionalExpression$1180.create(head$1892, question$1933, truExpr$1935, colon$1937, flsExpr$1939);
                                    return step$1891(condTerm$1941, flsRes$1938.rest, opCtx$1894);
                                }
                            }
                        }
                    }
                } else if (head$1892.isDelimiter && head$1892.delim.token.value === '()' && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Punctuator && resolveFast$1305(rest$1893[0], context$1888.env, context$1888.phase) === '=>') {
                    var arrowRes$1942 = enforest$1310(rest$1893.slice(1), context$1888);
                    if (arrowRes$1942.result && arrowRes$1942.result.isExpr) {
                        return step$1891(ArrowFun$1195.create(head$1892.delim, rest$1893[0], arrowRes$1942.result.destruct(context$1888)), arrowRes$1942.rest, opCtx$1894);
                    } else {
                        throwSyntaxError$750('enforest', 'Body of arrow function must be an expression', rest$1893.slice(1));
                    }
                } else if (head$1892.isId && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Punctuator && resolveFast$1305(rest$1893[0], context$1888.env, context$1888.phase) === '=>') {
                    var res$1943 = enforest$1310(rest$1893.slice(1), context$1888);
                    if (res$1943.result && res$1943.result.isExpr) {
                        return step$1891(ArrowFun$1195.create(head$1892.id, rest$1893[0], res$1943.result.destruct(context$1888)), res$1943.rest, opCtx$1894);
                    } else {
                        throwSyntaxError$750('enforest', 'Body of arrow function must be an expression', rest$1893.slice(1));
                    }
                } else if (head$1892.isDelimiter && head$1892.delim.token.value === '()') {
                    if (// empty parens are acceptable but enforest
                        // doesn't accept empty arrays so short
                        // circuit here
                        head$1892.delim.token.inner.length === 0) {
                        return step$1891(ParenExpression$1290.create([Empty$1135.create()], head$1892.delim, []), rest$1893, opCtx$1894);
                    } else {
                        var parenRes$1932 = enforestParenExpression$1300(head$1892.delim, context$1888);
                        if (parenRes$1932) {
                            return step$1891(parenRes$1932, rest$1893, opCtx$1894);
                        }
                    }
                } else if (head$1892.isExpr && ((head$1892.isId || head$1892.isObjGet || head$1892.isObjDotGet || head$1892.isThisExpression) && rest$1893[0] && rest$1893[1] && !bopMacroObj$1900 && stxIsAssignOp$1297(rest$1893[0]))) {
                    var opRes$1912 = enforestAssignment$1299(rest$1893, context$1888, head$1892, prevStx$1889, prevTerms$1890);
                    if (opRes$1912 && opRes$1912.result) {
                        return step$1891(opRes$1912.result, opRes$1912.rest, _$741.extend({}, opCtx$1894, {
                            prevStx: opRes$1912.prevStx,
                            prevTerms: opRes$1912.prevTerms
                        }));
                    }
                } else if (head$1892.isExpr && (rest$1893[0] && (unwrapSyntax$753(rest$1893[0]) === '++' || unwrapSyntax$753(rest$1893[0]) === '--'))) {
                    if (// Check if the operator is a macro first.
                        context$1888.env.has(resolveFast$1305(rest$1893[0], context$1888.env, context$1888.phase))) {
                        var headStx$1944 = tagWithTerm$1313(head$1892, head$1892.destruct(context$1888).reverse());
                        var opPrevStx$1918 = headStx$1944.concat(prevStx$1889);
                        var opPrevTerms$1919 = [head$1892].concat(prevTerms$1890);
                        var opRes$1912 = enforest$1310(rest$1893, context$1888, opPrevStx$1918, opPrevTerms$1919);
                        if (opRes$1912.prevTerms.length < opPrevTerms$1919.length) {
                            return opRes$1912;
                        } else if (opRes$1912.result) {
                            return step$1891(head$1892, opRes$1912.result.destruct(context$1888).concat(opRes$1912.rest), opCtx$1894);
                        }
                    }
                    return step$1891(PostfixOp$1165.create(head$1892, rest$1893[0]), rest$1893.slice(1), opCtx$1894);
                } else if (head$1892.isExpr && (rest$1893[0] && rest$1893[0].token.value === '[]')) {
                    return step$1891(ObjGet$1205.create(head$1892, Delimiter$1070.create(rest$1893[0])), rest$1893.slice(1), opCtx$1894);
                } else if (head$1892.isExpr && (rest$1893[0] && unwrapSyntax$753(rest$1893[0]) === '.' && !context$1888.env.has(resolveFast$1305(rest$1893[0], context$1888.env, context$1888.phase)) && rest$1893[1] && (rest$1893[1].token.type === parser$742.Token.Identifier || rest$1893[1].token.type === parser$742.Token.Keyword))) {
                    if (// Check if the identifier is a macro first.
                        context$1888.env.has(resolveFast$1305(rest$1893[1], context$1888.env, context$1888.phase))) {
                        var headStx$1944 = tagWithTerm$1313(head$1892, head$1892.destruct(context$1888).reverse());
                        var dotTerm$1945 = Punc$1065.create(rest$1893[0]);
                        var dotTerms$1946 = [dotTerm$1945].concat(head$1892, prevTerms$1890);
                        var dotStx$1947 = tagWithTerm$1313(dotTerm$1945, [rest$1893[0]]).concat(headStx$1944, prevStx$1889);
                        var dotRes$1948 = enforest$1310(rest$1893.slice(1), context$1888, dotStx$1947, dotTerms$1946);
                        if (dotRes$1948.prevTerms.length < dotTerms$1946.length) {
                            return dotRes$1948;
                        } else if (dotRes$1948.result) {
                            return step$1891(head$1892, [rest$1893[0]].concat(dotRes$1948.result.destruct(context$1888), dotRes$1948.rest), opCtx$1894);
                        }
                    }
                    return step$1891(ObjDotGet$1200.create(head$1892, rest$1893[0], rest$1893[1]), rest$1893.slice(2), opCtx$1894);
                } else if (head$1892.isDelimiter && head$1892.delim.token.value === '[]') {
                    return step$1891(ArrayLiteral$1245.create(head$1892), rest$1893, opCtx$1894);
                } else if (head$1892.isDelimiter && head$1892.delim.token.value === '{}') {
                    return step$1891(Block$1240.create(head$1892), rest$1893, opCtx$1894);
                } else if (head$1892.isId && unwrapSyntax$753(head$1892.id) === '#quoteSyntax' && rest$1893[0] && rest$1893[0].token.value === '{}') {
                    return step$1891(QuoteSyntax$1220.create(rest$1893[0]), rest$1893.slice(1), opCtx$1894);
                } else if (head$1892.isKeyword && unwrapSyntax$753(head$1892.keyword) === 'return') {
                    if (rest$1893[0] && rest$1893[0].token.lineNumber === head$1892.keyword.token.lineNumber) {
                        var returnPrevStx$1949 = tagWithTerm$1313(head$1892, head$1892.destruct(context$1888)).concat(opCtx$1894.prevStx);
                        var returnPrevTerms$1950 = [head$1892].concat(opCtx$1894.prevTerms);
                        var returnExpr$1951 = enforest$1310(rest$1893, context$1888, returnPrevStx$1949, returnPrevTerms$1950);
                        if (returnExpr$1951.prevTerms.length < opCtx$1894.prevTerms.length) {
                            return returnExpr$1951;
                        }
                        if (returnExpr$1951.result.isExpr) {
                            return step$1891(ReturnStatement$1150.create(head$1892, returnExpr$1951.result), returnExpr$1951.rest, opCtx$1894);
                        }
                    } else {
                        return step$1891(ReturnStatement$1150.create(head$1892, Empty$1135.create()), rest$1893, opCtx$1894);
                    }
                } else if (head$1892.isKeyword && unwrapSyntax$753(head$1892.keyword) === 'let') {
                    var nameTokens$1952 = [];
                    if (rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Delimiter && rest$1893[0].token.value === '()') {
                        nameTokens$1952 = rest$1893[0].token.inner;
                    } else {
                        nameTokens$1952.push(rest$1893[0]);
                    }
                    if (// Let macro
                        rest$1893[1] && rest$1893[1].token.value === '=' && rest$1893[2] && rest$1893[2].token.value === 'macro') {
                        var mac$1953 = enforest$1310(rest$1893.slice(2), context$1888);
                        if (mac$1953.result) {
                            if (!mac$1953.result.isAnonMacro) {
                                throwSyntaxError$750('enforest', 'expecting an anonymous macro definition in syntax let binding', rest$1893.slice(2));
                            }
                            return step$1891(LetMacro$1105.create(nameTokens$1952, mac$1953.result.body), mac$1953.rest, opCtx$1894);
                        }
                    } else {
                        var lsRes$1954 = enforestVarStatement$1298(rest$1893, context$1888, head$1892.keyword);
                        if (lsRes$1954 && lsRes$1954.result) {
                            return step$1891(LetStatement$1280.create(head$1892, lsRes$1954.result), lsRes$1954.rest, opCtx$1894);
                        }
                    }
                } else if (head$1892.isKeyword && unwrapSyntax$753(head$1892.keyword) === 'var' && rest$1893[0]) {
                    var vsRes$1955 = enforestVarStatement$1298(rest$1893, context$1888, head$1892.keyword);
                    if (vsRes$1955 && vsRes$1955.result) {
                        return step$1891(VariableStatement$1275.create(head$1892, vsRes$1955.result), vsRes$1955.rest, opCtx$1894);
                    }
                } else if (head$1892.isKeyword && unwrapSyntax$753(head$1892.keyword) === 'const' && rest$1893[0]) {
                    var csRes$1956 = enforestVarStatement$1298(rest$1893, context$1888, head$1892.keyword);
                    if (csRes$1956 && csRes$1956.result) {
                        return step$1891(ConstStatement$1285.create(head$1892, csRes$1956.result), csRes$1956.rest, opCtx$1894);
                    }
                } else if (head$1892.isKeyword && unwrapSyntax$753(head$1892.keyword) === 'for' && rest$1893[0] && rest$1893[0].token.value === '()') {
                    return step$1891(ForStatement$1145.create(head$1892.keyword, rest$1893[0]), rest$1893.slice(1), opCtx$1894);
                }
            } else {
                assert$749(head$1892 && head$1892.token, 'assuming head is a syntax object');
                var macroObj$1957 = expandCount$833 < maxExpands$834 && getValueInEnv$1303(head$1892, rest$1893, context$1888, context$1888.phase);
                if (// macro invocation
                    macroObj$1957 && typeof macroObj$1957.fn === 'function' && !macroObj$1957.isOp) {
                    var rt$1958 = expandMacro$1306([head$1892].concat(rest$1893), context$1888, opCtx$1894, null, macroObj$1957);
                    var newOpCtx$1959 = opCtx$1894;
                    if (rt$1958.prevTerms && rt$1958.prevTerms.length < opCtx$1894.prevTerms.length) {
                        newOpCtx$1959 = rewindOpCtx$1311(opCtx$1894, rt$1958);
                    }
                    if (rt$1958.result.length > 0) {
                        return step$1891(rt$1958.result[0], rt$1958.result.slice(1).concat(rt$1958.rest), newOpCtx$1959);
                    } else {
                        return step$1891(Empty$1135.create(), rt$1958.rest, newOpCtx$1959);
                    }
                } else if (head$1892.token.type === parser$742.Token.Identifier && unwrapSyntax$753(head$1892) === 'macro' && resolve$839(head$1892, context$1888.phase) === 'macro' && rest$1893[0] && rest$1893[0].token.value === '{}') {
                    return step$1891(AnonMacro$1115.create(rest$1893[0].token.inner), rest$1893.slice(1), opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Identifier && unwrapSyntax$753(head$1892) === 'macro' && resolve$839(head$1892, context$1888.phase) === 'macro') {
                    var nameTokens$1952 = [];
                    if (rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Delimiter && rest$1893[0].token.value === '()') {
                        nameTokens$1952 = rest$1893[0].token.inner;
                    } else {
                        nameTokens$1952.push(rest$1893[0]);
                    }
                    if (rest$1893[1] && rest$1893[1].token.type === parser$742.Token.Delimiter) {
                        return step$1891(Macro$1110.create(nameTokens$1952, rest$1893[1].token.inner), rest$1893.slice(2), opCtx$1894);
                    } else {
                        throwSyntaxError$750('enforest', 'Macro declaration must include body', rest$1893[1]);
                    }
                } else if (head$1892.token.type === parser$742.Token.Identifier && head$1892.token.value === 'unaryop' && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Delimiter && rest$1893[0].token.value === '()' && rest$1893[1] && rest$1893[1].token.type === parser$742.Token.NumericLiteral && rest$1893[2] && rest$1893[2].token.type === parser$742.Token.Delimiter && rest$1893[2] && rest$1893[2].token.value === '{}') {
                    var trans$1960 = enforest$1310(rest$1893[2].token.inner, context$1888);
                    return step$1891(OperatorDefinition$1120.create(syn$743.makeValue('unary', head$1892), rest$1893[0].token.inner, rest$1893[1], null, trans$1960.result.body), rest$1893.slice(3), opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Identifier && head$1892.token.value === 'binaryop' && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Delimiter && rest$1893[0].token.value === '()' && rest$1893[1] && rest$1893[1].token.type === parser$742.Token.NumericLiteral && rest$1893[2] && rest$1893[2].token.type === parser$742.Token.Identifier && rest$1893[3] && rest$1893[3].token.type === parser$742.Token.Delimiter && rest$1893[3] && rest$1893[3].token.value === '{}') {
                    var trans$1960 = enforest$1310(rest$1893[3].token.inner, context$1888);
                    return step$1891(OperatorDefinition$1120.create(syn$743.makeValue('binary', head$1892), rest$1893[0].token.inner, rest$1893[1], rest$1893[2], trans$1960.result.body), rest$1893.slice(4), opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Keyword && unwrapSyntax$753(head$1892) === 'function' && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Identifier && rest$1893[1] && rest$1893[1].token.type === parser$742.Token.Delimiter && rest$1893[1].token.value === '()' && rest$1893[2] && rest$1893[2].token.type === parser$742.Token.Delimiter && rest$1893[2].token.value === '{}') {
                    rest$1893[1].token.inner = rest$1893[1].token.inner;
                    rest$1893[2].token.inner = rest$1893[2].token.inner;
                    return step$1891(NamedFun$1185.create(head$1892, null, rest$1893[0], rest$1893[1], rest$1893[2]), rest$1893.slice(3), opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Keyword && unwrapSyntax$753(head$1892) === 'function' && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Punctuator && rest$1893[0].token.value === '*' && rest$1893[1] && rest$1893[1].token.type === parser$742.Token.Identifier && rest$1893[2] && rest$1893[2].token.type === parser$742.Token.Delimiter && rest$1893[2].token.value === '()' && rest$1893[3] && rest$1893[3].token.type === parser$742.Token.Delimiter && rest$1893[3].token.value === '{}') {
                    rest$1893[2].token.inner = rest$1893[2].token.inner;
                    rest$1893[3].token.inner = rest$1893[3].token.inner;
                    return step$1891(NamedFun$1185.create(head$1892, rest$1893[0], rest$1893[1], rest$1893[2], rest$1893[3]), rest$1893.slice(4), opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Keyword && unwrapSyntax$753(head$1892) === 'function' && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Delimiter && rest$1893[0].token.value === '()' && rest$1893[1] && rest$1893[1].token.type === parser$742.Token.Delimiter && rest$1893[1].token.value === '{}') {
                    rest$1893[0].token.inner = rest$1893[0].token.inner;
                    rest$1893[1].token.inner = rest$1893[1].token.inner;
                    return step$1891(AnonFun$1190.create(head$1892, null, rest$1893[0], rest$1893[1]), rest$1893.slice(2), opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Keyword && unwrapSyntax$753(head$1892) === 'function' && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Punctuator && rest$1893[0].token.value === '*' && rest$1893[1] && rest$1893[1].token.type === parser$742.Token.Delimiter && rest$1893[1].token.value === '()' && rest$1893[2] && rest$1893[2].token.type === parser$742.Token.Delimiter && rest$1893[2].token.value === '{}') {
                    rest$1893[1].token.inner = rest$1893[1].token.inner;
                    rest$1893[2].token.inner = rest$1893[2].token.inner;
                    return step$1891(AnonFun$1190.create(head$1892, rest$1893[0], rest$1893[1], rest$1893[2]), rest$1893.slice(3), opCtx$1894);
                } else if ((head$1892.token.type === parser$742.Token.Delimiter && head$1892.token.value === '()' || head$1892.token.type === parser$742.Token.Identifier) && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Punctuator && resolveFast$1305(rest$1893[0], context$1888.env, context$1888.phase) === '=>' && rest$1893[1] && rest$1893[1].token.type === parser$742.Token.Delimiter && rest$1893[1].token.value === '{}') {
                    return step$1891(ArrowFun$1195.create(head$1892, rest$1893[0], rest$1893[1]), rest$1893.slice(2), opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Keyword && unwrapSyntax$753(head$1892) === 'catch' && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Delimiter && rest$1893[0].token.value === '()' && rest$1893[1] && rest$1893[1].token.type === parser$742.Token.Delimiter && rest$1893[1].token.value === '{}') {
                    rest$1893[0].token.inner = rest$1893[0].token.inner;
                    rest$1893[1].token.inner = rest$1893[1].token.inner;
                    return step$1891(CatchClause$1140.create(head$1892, rest$1893[0], rest$1893[1]), rest$1893.slice(2), opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Keyword && unwrapSyntax$753(head$1892) === 'this') {
                    return step$1891(ThisExpression$1230.create(head$1892), rest$1893, opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.NumericLiteral || head$1892.token.type === parser$742.Token.StringLiteral || head$1892.token.type === parser$742.Token.BooleanLiteral || head$1892.token.type === parser$742.Token.RegularExpression || head$1892.token.type === parser$742.Token.NullLiteral) {
                    return step$1891(Lit$1235.create(head$1892), rest$1893, opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Keyword && unwrapSyntax$753(head$1892) === 'import' && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Delimiter && rest$1893[0].token.value === '{}' && rest$1893[1] && unwrapSyntax$753(rest$1893[1]) === 'from' && rest$1893[2] && rest$1893[2].token.type === parser$742.Token.StringLiteral && rest$1893[3] && unwrapSyntax$753(rest$1893[3]) === 'for' && rest$1893[4] && unwrapSyntax$753(rest$1893[4]) === 'macros') {
                    var importRest$1961;
                    if (rest$1893[5] && rest$1893[5].token.type === parser$742.Token.Punctuator && rest$1893[5].token.value === ';') {
                        importRest$1961 = rest$1893.slice(6);
                    } else {
                        importRest$1961 = rest$1893.slice(5);
                    }
                    return step$1891(ImportForMacros$1090.create(rest$1893[0], rest$1893[2]), importRest$1961, opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Keyword && unwrapSyntax$753(head$1892) === 'import' && rest$1893[0] && rest$1893[0].token.type === parser$742.Token.Delimiter && rest$1893[0].token.value === '{}' && rest$1893[1] && unwrapSyntax$753(rest$1893[1]) === 'from' && rest$1893[2] && rest$1893[2].token.type === parser$742.Token.StringLiteral) {
                    var importRest$1961;
                    if (rest$1893[3] && rest$1893[3].token.type === parser$742.Token.Punctuator && rest$1893[3].token.value === ';') {
                        importRest$1961 = rest$1893.slice(4);
                    } else {
                        importRest$1961 = rest$1893.slice(3);
                    }
                    return step$1891(Import$1085.create(head$1892, rest$1893[0], rest$1893[1], rest$1893[2]), importRest$1961, opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Keyword && unwrapSyntax$753(head$1892) === 'export' && rest$1893[0] && (rest$1893[0].token.type === parser$742.Token.Identifier || rest$1893[0].token.type === parser$742.Token.Keyword || rest$1893[0].token.type === parser$742.Token.Punctuator || rest$1893[0].token.type === parser$742.Token.Delimiter)) {
                    if (unwrapSyntax$753(rest$1893[1]) !== ';' && toksAdjacent$1308(rest$1893[0], rest$1893[1])) {
                        throwSyntaxError$750('enforest', 'multi-token macro/operator names must be wrapped in () when exporting', rest$1893[1]);
                    }
                    return step$1891(Export$1095.create(head$1892, rest$1893[0]), rest$1893.slice(1), opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Identifier) {
                    return step$1891(Id$1250.create(head$1892), rest$1893, opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Punctuator) {
                    return step$1891(Punc$1065.create(head$1892), rest$1893, opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Keyword && unwrapSyntax$753(head$1892) === 'with') {
                    throwSyntaxError$750('enforest', 'with is not supported in sweet.js', head$1892);
                } else if (head$1892.token.type === parser$742.Token.Keyword) {
                    return step$1891(Keyword$1060.create(head$1892), rest$1893, opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Delimiter) {
                    return step$1891(Delimiter$1070.create(head$1892), rest$1893, opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.Template) {
                    return step$1891(Template$1210.create(head$1892), rest$1893, opCtx$1894);
                } else if (head$1892.token.type === parser$742.Token.EOF) {
                    assert$749(rest$1893.length === 0, 'nothing should be after an EOF');
                    return step$1891(EOF$1055.create(head$1892), [], opCtx$1894);
                } else {
                    // todo: are we missing cases?
                    assert$749(false, 'not implemented');
                }
            }
            if (// Potentially an infix macro
                // This should only be invoked on runtime syntax terms
                !head$1892.isMacro && !head$1892.isLetMacro && !head$1892.isAnonMacro && !head$1892.isOperatorDefinition && rest$1893.length && nameInEnv$1304(rest$1893[0], rest$1893.slice(1), context$1888, context$1888.phase) && getValueInEnv$1303(rest$1893[0], rest$1893.slice(1), context$1888, context$1888.phase).isOp === false) {
                var infLeftTerm$1962 = opCtx$1894.prevTerms[0] && opCtx$1894.prevTerms[0].isPartial ? opCtx$1894.prevTerms[0] : null;
                var infTerm$1963 = PartialExpression$1265.create(head$1892.destruct(context$1888), infLeftTerm$1962, function () {
                    return step$1891(head$1892, [], opCtx$1894);
                });
                var infPrevStx$1964 = tagWithTerm$1313(infTerm$1963, head$1892.destruct(context$1888)).reverse().concat(opCtx$1894.prevStx);
                var infPrevTerms$1965 = [infTerm$1963].concat(opCtx$1894.prevTerms);
                var infRes$1966 = expandMacro$1306(rest$1893, context$1888, {
                    prevStx: infPrevStx$1964,
                    prevTerms: infPrevTerms$1965
                });
                if (infRes$1966.prevTerms && infRes$1966.prevTerms.length < infPrevTerms$1965.length) {
                    var infOpCtx$1967 = rewindOpCtx$1311(opCtx$1894, infRes$1966);
                    return step$1891(infRes$1966.result[0], infRes$1966.result.slice(1).concat(infRes$1966.rest), infOpCtx$1967);
                } else {
                    return step$1891(head$1892, infRes$1966.result.concat(infRes$1966.rest), opCtx$1894);
                }
            }
            var // done with current step so combine and continue on
            combResult$1896 = opCtx$1894.combine(head$1892);
            if (opCtx$1894.stack.length === 0) {
                return {
                    result: combResult$1896.term,
                    rest: rest$1893,
                    prevStx: combResult$1896.prevStx,
                    prevTerms: combResult$1896.prevTerms
                };
            } else {
                return step$1891(combResult$1896.term, rest$1893, opCtx$1894.stack[0]);
            }
        }
        return step$1891(toks$1887[0], toks$1887.slice(1), {
            combine: function (t$1968) {
                return {
                    term: t$1968,
                    prevStx: prevStx$1889,
                    prevTerms: prevTerms$1890
                };
            },
            prec: 0,
            stack: [],
            op: null,
            prevStx: prevStx$1889,
            prevTerms: prevTerms$1890
        });
    }
    function rewindOpCtx$1311(opCtx$1969, res$1970) {
        if (// If we've consumed all pending operators, we can just start over.
            // It's important that we always thread the new prevStx and prevTerms
            // through, otherwise the old ones will still persist.
            !res$1970.prevTerms.length || !res$1970.prevTerms[0].isPartial) {
            return _$741.extend({}, opCtx$1969, {
                combine: function (t$1973) {
                    return {
                        term: t$1973,
                        prevStx: res$1970.prevStx,
                        prevTerms: res$1970.prevTerms
                    };
                },
                prec: 0,
                op: null,
                stack: [],
                prevStx: res$1970.prevStx,
                prevTerms: res$1970.prevTerms
            });
        }
        // To rewind, we need to find the first (previous) pending operator. It
        // acts as a marker in the opCtx to let us know how far we need to go
        // back.
        var op$1971 = null;
        for (var i$1972 = 0; i$1972 < res$1970.prevTerms.length; i$1972++) {
            if (!res$1970.prevTerms[i$1972].isPartial) {
                break;
            }
            if (res$1970.prevTerms[i$1972].isPartialOperation) {
                op$1971 = res$1970.prevTerms[i$1972];
                break;
            }
        }
        if (// If the op matches the current opCtx, we don't need to rewind
            // anything, but we still need to persist the prevStx and prevTerms.
            opCtx$1969.op === op$1971) {
            return _$741.extend({}, opCtx$1969, {
                prevStx: res$1970.prevStx,
                prevTerms: res$1970.prevTerms
            });
        }
        for (var i$1972 = 0; i$1972 < opCtx$1969.stack.length; i$1972++) {
            if (opCtx$1969.stack[i$1972].op === op$1971) {
                return _$741.extend({}, opCtx$1969.stack[i$1972], {
                    prevStx: res$1970.prevStx,
                    prevTerms: res$1970.prevTerms
                });
            }
        }
        assert$749(false, 'Rewind failed.');
    }
    function get_expression$1312(stx$1974, context$1975) {
        if (stx$1974[0].term) {
            for (var termLen$1977 = 1; termLen$1977 < stx$1974.length; termLen$1977++) {
                if (stx$1974[termLen$1977].term !== stx$1974[0].term) {
                    break;
                }
            }
            if (// Guard the termLen because we can have a multi-token term that
                // we don't want to split. TODO: is there something we can do to
                // get around this safely?
                stx$1974[0].term.isPartialExpression && termLen$1977 === stx$1974[0].term.stx.length) {
                var expr$1978 = stx$1974[0].term.combine().result;
                for (var i$1979 = 1, term$1980 = stx$1974[0].term; i$1979 < stx$1974.length; i$1979++) {
                    if (stx$1974[i$1979].term !== term$1980) {
                        if (term$1980 && term$1980.isPartial) {
                            term$1980 = term$1980.left;
                            i$1979--;
                        } else {
                            break;
                        }
                    }
                }
                return {
                    result: expr$1978,
                    rest: stx$1974.slice(i$1979)
                };
            } else if (stx$1974[0].term.isExpr) {
                return {
                    result: stx$1974[0].term,
                    rest: stx$1974.slice(termLen$1977)
                };
            } else {
                return {
                    result: null,
                    rest: stx$1974
                };
            }
        }
        var res$1976 = enforest$1310(stx$1974, context$1975);
        if (!res$1976.result || !res$1976.result.isExpr) {
            return {
                result: null,
                rest: stx$1974
            };
        }
        return res$1976;
    }
    function tagWithTerm$1313(term$1981, stx$1982) {
        return stx$1982.map(function (s$1983) {
            var src$1985 = s$1983.token;
            var keys$1986 = Object.keys(src$1985);
            var newtok$1987 = {};
            for (var i$1988 = 0, len$1989 = keys$1986.length, key$1990; i$1988 < len$1989; i$1988++) {
                key$1990 = keys$1986[i$1988];
                newtok$1987[key$1990] = src$1985[key$1990];
            }
            s$1983 = syntaxFromToken$830(newtok$1987, s$1983);
            s$1983.term = term$1981;
            return s$1983;
        });
    }
    function applyMarkToPatternEnv$1314(newMark$1991, env$1992) {
        function dfs$1993(match$1994) {
            if (match$1994.level === 0) {
                // replace the match property with the marked syntax
                match$1994.match = _$741.map(match$1994.match, function (stx$1995) {
                    return stx$1995.mark(newMark$1991);
                });
            } else {
                _$741.each(match$1994.match, function (match$1996) {
                    dfs$1993(match$1996);
                });
            }
        }
        _$741.keys(env$1992).forEach(function (key$1997) {
            dfs$1993(env$1992[key$1997]);
        });
    }
    function loadMacroDef$1315(body$1998, context$1999, phase$2000) {
        var expanded$2001 = body$1998[0].destruct(context$1999, { stripCompileTerm: true });
        var stub$2002 = parser$742.read('()');
        stub$2002[0].token.inner = expanded$2001;
        var flattend$2003 = flatten$1339(stub$2002);
        var bodyCode$2004 = codegen$748.generate(parser$742.parse(flattend$2003, { phase: phase$2000 }));
        var macroGlobal$2005 = {
            makeValue: syn$743.makeValue,
            makeRegex: syn$743.makeRegex,
            makeIdent: syn$743.makeIdent,
            makeKeyword: syn$743.makeKeyword,
            makePunc: syn$743.makePunc,
            makeDelim: syn$743.makeDelim,
            filename: context$1999.filename,
            require: function (id$2008) {
                if (context$1999.requireModule) {
                    return context$1999.requireModule(id$2008, context$1999.filename);
                }
                return require(id$2008);
            },
            getExpr: function (stx$2009) {
                var r$2010;
                if (stx$2009.length === 0) {
                    return {
                        success: false,
                        result: [],
                        rest: []
                    };
                }
                r$2010 = get_expression$1312(stx$2009, context$1999);
                return {
                    success: r$2010.result !== null,
                    result: r$2010.result === null ? [] : r$2010.result.destruct(context$1999),
                    rest: r$2010.rest
                };
            },
            getIdent: function (stx$2011) {
                if (stx$2011[0] && stx$2011[0].token.type === parser$742.Token.Identifier) {
                    return {
                        success: true,
                        result: [stx$2011[0]],
                        rest: stx$2011.slice(1)
                    };
                }
                return {
                    success: false,
                    result: [],
                    rest: stx$2011
                };
            },
            getLit: function (stx$2012) {
                if (stx$2012[0] && patternModule$745.typeIsLiteral(stx$2012[0].token.type)) {
                    return {
                        success: true,
                        result: [stx$2012[0]],
                        rest: stx$2012.slice(1)
                    };
                }
                return {
                    success: false,
                    result: [],
                    rest: stx$2012
                };
            },
            unwrapSyntax: syn$743.unwrapSyntax,
            throwSyntaxError: throwSyntaxError$750,
            throwSyntaxCaseError: throwSyntaxCaseError$751,
            prettyPrint: syn$743.prettyPrint,
            parser: parser$742,
            __fresh: fresh$846,
            _: _$741,
            patternModule: patternModule$745,
            getPattern: function (id$2013) {
                return context$1999.patternMap.get(id$2013);
            },
            getTemplate: function (id$2014) {
                assert$749(context$1999.templateMap.has(id$2014), 'missing template');
                return syn$743.cloneSyntaxArray(context$1999.templateMap.get(id$2014));
            },
            applyMarkToPatternEnv: applyMarkToPatternEnv$1314,
            mergeMatches: function (newMatch$2015, oldMatch$2016) {
                newMatch$2015.patternEnv = _$741.extend({}, oldMatch$2016.patternEnv, newMatch$2015.patternEnv);
                return newMatch$2015;
            },
            console: console
        };
        context$1999.env.keys().forEach(function (key$2017) {
            var val$2018 = context$1999.env.get(key$2017);
            if (// load the compile time values into the global object
                val$2018 && val$2018.value) {
                macroGlobal$2005[key$2017] = val$2018.value;
            }
        });
        var macroFn$2007;
        if (vm$747) {
            macroFn$2007 = vm$747.runInNewContext('(function() { return ' + bodyCode$2004 + ' })()', macroGlobal$2005);
        } else {
            macroFn$2007 = scopedEval$825(bodyCode$2004, macroGlobal$2005);
        }
        return macroFn$2007;
    }
    function expandToTermTree$1316(stx$2019, context$2020) {
        assert$749(context$2020, 'expander context is required');
        var f$2021, head$2022, prevStx$2023, restStx$2024, prevTerms$2025, macroDefinition$2026;
        var rest$2027 = stx$2019;
        while (rest$2027.length > 0) {
            assert$749(rest$2027[0].token, 'expecting a syntax object');
            f$2021 = enforest$1310(rest$2027, context$2020, prevStx$2023, prevTerms$2025);
            // head :: TermTree
            head$2022 = f$2021.result;
            // rest :: [Syntax]
            rest$2027 = f$2021.rest;
            if (!head$2022) {
                // no head means the expansions stopped prematurely (for stepping)
                restStx$2024 = rest$2027;
                break;
            }
            var destructed$2028 = tagWithTerm$1313(head$2022, f$2021.result.destruct(context$2020));
            prevTerms$2025 = [head$2022].concat(f$2021.prevTerms);
            prevStx$2023 = destructed$2028.reverse().concat(f$2021.prevStx);
            if (head$2022.isMacro && expandCount$833 < maxExpands$834) {
                if (!(// raw function primitive form
                    head$2022.body[0] && head$2022.body[0].token.type === parser$742.Token.Keyword && head$2022.body[0].token.value === 'function')) {
                    throwSyntaxError$750('load macro', 'Primitive macro form must contain a function for the macro body', head$2022.body);
                }
                // expand the body
                head$2022.body = expand$1319(head$2022.body, makeExpanderContext$1320(_$741.extend({}, context$2020, { phase: context$2020.phase + 1 })));
                //  and load the macro definition into the environment
                macroDefinition$2026 = loadMacroDef$1315(head$2022.body, context$2020, context$2020.phase + 1);
                var name$2029 = head$2022.name.map(unwrapSyntax$753).join('');
                var nameStx$2030 = syn$743.makeIdent(name$2029, head$2022.name[0]);
                addToDefinitionCtx$1317([nameStx$2030], context$2020.defscope, false, context$2020.paramscope);
                context$2020.env.names.set(name$2029, true);
                context$2020.env.set(resolve$839(nameStx$2030, context$2020.phase), {
                    fn: macroDefinition$2026,
                    isOp: false,
                    builtin: builtinMode$832,
                    fullName: head$2022.name
                });
            }
            if (head$2022.isLetMacro && expandCount$833 < maxExpands$834) {
                if (!(// raw function primitive form
                    head$2022.body[0] && head$2022.body[0].token.type === parser$742.Token.Keyword && head$2022.body[0].token.value === 'function')) {
                    throwSyntaxError$750('load macro', 'Primitive macro form must contain a function for the macro body', head$2022.body);
                }
                // expand the body
                head$2022.body = expand$1319(head$2022.body, makeExpanderContext$1320(_$741.extend({ phase: context$2020.phase + 1 }, context$2020)));
                //  and load the macro definition into the environment
                macroDefinition$2026 = loadMacroDef$1315(head$2022.body, context$2020, context$2020.phase + 1);
                var freshName$2031 = fresh$846();
                var name$2029 = head$2022.name.map(unwrapSyntax$753).join('');
                var oldName$2032 = head$2022.name;
                var nameStx$2030 = syn$743.makeIdent(name$2029, head$2022.name[0]);
                var renamedName$2033 = nameStx$2030.rename(nameStx$2030, freshName$2031);
                // store a reference to the full name in the props object.
                // this allows us to communicate the original full name to
                // `visit` later on.
                renamedName$2033.props.fullName = oldName$2032;
                head$2022.name = [renamedName$2033];
                rest$2027 = _$741.map(rest$2027, function (stx$2034) {
                    return stx$2034.rename(nameStx$2030, freshName$2031);
                });
                context$2020.env.names.set(name$2029, true);
                context$2020.env.set(resolve$839(renamedName$2033, context$2020.phase), {
                    fn: macroDefinition$2026,
                    isOp: false,
                    builtin: builtinMode$832,
                    fullName: oldName$2032
                });
            }
            if (head$2022.isOperatorDefinition) {
                if (!(// raw function primitive form
                    head$2022.body[0] && head$2022.body[0].token.type === parser$742.Token.Keyword && head$2022.body[0].token.value === 'function')) {
                    throwSyntaxError$750('load macro', 'Primitive macro form must contain a function for the macro body', head$2022.body);
                }
                // expand the body
                head$2022.body = expand$1319(head$2022.body, makeExpanderContext$1320(_$741.extend({ phase: context$2020.phase + 1 }, context$2020)));
                var //  and load the macro definition into the environment
                opDefinition$2035 = loadMacroDef$1315(head$2022.body, context$2020, context$2020.phase + 1);
                var name$2029 = head$2022.name.map(unwrapSyntax$753).join('');
                var nameStx$2030 = syn$743.makeIdent(name$2029, head$2022.name[0]);
                addToDefinitionCtx$1317([nameStx$2030], context$2020.defscope, false, context$2020.paramscope);
                var resolvedName$2036 = resolve$839(nameStx$2030, context$2020.phase);
                var opObj$2037 = context$2020.env.get(resolvedName$2036);
                if (!opObj$2037) {
                    opObj$2037 = {
                        isOp: true,
                        builtin: builtinMode$832,
                        fullName: head$2022.name
                    };
                }
                assert$749(unwrapSyntax$753(head$2022.type) === 'binary' || unwrapSyntax$753(head$2022.type) === 'unary', 'operator must either be binary or unary');
                opObj$2037[unwrapSyntax$753(head$2022.type)] = {
                    fn: opDefinition$2035,
                    prec: head$2022.prec.token.value,
                    assoc: head$2022.assoc ? head$2022.assoc.token.value : null
                };
                context$2020.env.names.set(name$2029, true);
                context$2020.env.set(resolvedName$2036, opObj$2037);
            }
            if (head$2022.isNamedFun) {
                addToDefinitionCtx$1317([head$2022.name], context$2020.defscope, true, context$2020.paramscope);
            }
            if (head$2022.isVariableStatement || head$2022.isLetStatement || head$2022.isConstStatement) {
                addToDefinitionCtx$1317(_$741.map(head$2022.decls, function (decl$2038) {
                    return decl$2038.ident;
                }), context$2020.defscope, true, context$2020.paramscope);
            }
            if (head$2022.isBlock && head$2022.body.isDelimiter) {
                head$2022.body.delim.token.inner.forEach(function (term$2039) {
                    if (term$2039.isVariableStatement) {
                        addToDefinitionCtx$1317(_$741.map(term$2039.decls, function (decl$2040) {
                            return decl$2040.ident;
                        }), context$2020.defscope, true, context$2020.paramscope);
                    }
                });
            }
            if (head$2022.isDelimiter) {
                head$2022.delim.token.inner.forEach(function (term$2041) {
                    if (term$2041.isVariableStatement) {
                        addToDefinitionCtx$1317(_$741.map(term$2041.decls, function (decl$2042) {
                            return decl$2042.ident;
                        }), context$2020.defscope, true, context$2020.paramscope);
                    }
                });
            }
            if (head$2022.isForStatement) {
                var forCond$2043 = head$2022.cond.token.inner;
                if (forCond$2043[0] && resolve$839(forCond$2043[0], context$2020.phase) === 'let' && forCond$2043[1] && forCond$2043[1].token.type === parser$742.Token.Identifier) {
                    var letNew$2044 = fresh$846();
                    var letId$2045 = forCond$2043[1];
                    forCond$2043 = forCond$2043.map(function (stx$2046) {
                        return stx$2046.rename(letId$2045, letNew$2044);
                    });
                    // hack: we want to do the let renaming here, not
                    // in the expansion of `for (...)` so just remove the `let`
                    // keyword
                    head$2022.cond.token.inner = expand$1319([forCond$2043[0]], context$2020).concat(expand$1319(forCond$2043.slice(1), context$2020));
                    if (// nice and easy case: `for (...) { ... }`
                        rest$2027[0] && rest$2027[0].token.value === '{}') {
                        rest$2027[0] = rest$2027[0].rename(letId$2045, letNew$2044);
                    } else {
                        var // need to deal with things like `for (...) if (...) log(...)`
                        bodyEnf$2047 = enforest$1310(rest$2027, context$2020);
                        var bodyDestructed$2048 = bodyEnf$2047.result.destruct(context$2020);
                        var renamedBodyTerm$2049 = bodyEnf$2047.result.rename(letId$2045, letNew$2044);
                        tagWithTerm$1313(renamedBodyTerm$2049, bodyDestructed$2048);
                        rest$2027 = bodyEnf$2047.rest;
                        prevStx$2023 = bodyDestructed$2048.reverse().concat(prevStx$2023);
                        prevTerms$2025 = [renamedBodyTerm$2049].concat(prevTerms$2025);
                    }
                } else {
                    head$2022.cond.token.inner = expand$1319(head$2022.cond.token.inner, context$2020);
                }
            }
        }
        return {
            // prevTerms are stored in reverse for the purposes of infix
            // lookbehind matching, so we need to re-reverse them.
            terms: prevTerms$2025 ? prevTerms$2025.reverse() : [],
            restStx: restStx$2024,
            context: context$2020
        };
    }
    function addToDefinitionCtx$1317(idents$2050, defscope$2051, skipRep$2052, paramscope$2053) {
        assert$749(idents$2050 && idents$2050.length > 0, 'expecting some variable identifiers');
        // flag for skipping repeats since we reuse this function to place both
        // variables declarations (which need to skip redeclarations) and
        // macro definitions which don't
        skipRep$2052 = skipRep$2052 || false;
        _$741.chain(idents$2050).filter(function (id$2054) {
            if (skipRep$2052) {
                var /*
                       When var declarations repeat in the same function scope:

                       var x = 24;
                       ...
                       var x = 42;

                       we just need to use the first renaming and leave the
                       definition context as is.
                    */
                varDeclRep$2055 = _$741.find(defscope$2051, function (def$2057) {
                    return def$2057.id.token.value === id$2054.token.value && arraysEqual$842(marksof$838(def$2057.id.context), marksof$838(id$2054.context));
                });
                var /*
                        When var declaration repeat one of the function parameters:

                        function foo(x) {
                            var x;
                        }

                        we don't need to add the var to the definition context.
                    */
                paramDeclRep$2056 = _$741.find(paramscope$2053, function (param$2058) {
                    return param$2058.token.value === id$2054.token.value && arraysEqual$842(marksof$838(param$2058.context), marksof$838(id$2054.context));
                });
                return typeof varDeclRep$2055 === 'undefined' && typeof paramDeclRep$2056 === 'undefined';
            }
            return true;
        }).each(function (id$2059) {
            var name$2060 = fresh$846();
            defscope$2051.push({
                id: id$2059,
                name: name$2060
            });
        });
    }
    function expandTermTreeToFinal$1318(term$2061, context$2062) {
        assert$749(context$2062 && context$2062.env, 'environment map is required');
        if (term$2061.isArrayLiteral) {
            term$2061.array.delim.token.inner = expand$1319(term$2061.array.delim.token.inner, context$2062);
            return term$2061;
        } else if (term$2061.isBlock) {
            term$2061.body.delim.token.inner = expand$1319(term$2061.body.delim.token.inner, context$2062);
            return term$2061;
        } else if (term$2061.isParenExpression) {
            term$2061.args = _$741.map(term$2061.args, function (arg$2063) {
                return expandTermTreeToFinal$1318(arg$2063, context$2062);
            });
            return term$2061;
        } else if (term$2061.isCall) {
            term$2061.fun = expandTermTreeToFinal$1318(term$2061.fun, context$2062);
            term$2061.args = expandTermTreeToFinal$1318(term$2061.args, context$2062);
            return term$2061;
        } else if (term$2061.isReturnStatement) {
            term$2061.expr = expandTermTreeToFinal$1318(term$2061.expr, context$2062);
            return term$2061;
        } else if (term$2061.isUnaryOp) {
            term$2061.expr = expandTermTreeToFinal$1318(term$2061.expr, context$2062);
            return term$2061;
        } else if (term$2061.isBinOp || term$2061.isAssignmentExpression) {
            term$2061.left = expandTermTreeToFinal$1318(term$2061.left, context$2062);
            term$2061.right = expandTermTreeToFinal$1318(term$2061.right, context$2062);
            return term$2061;
        } else if (term$2061.isObjGet) {
            term$2061.left = expandTermTreeToFinal$1318(term$2061.left, context$2062);
            term$2061.right.delim.token.inner = expand$1319(term$2061.right.delim.token.inner, context$2062);
            return term$2061;
        } else if (term$2061.isObjDotGet) {
            term$2061.left = expandTermTreeToFinal$1318(term$2061.left, context$2062);
            term$2061.right = expandTermTreeToFinal$1318(term$2061.right, context$2062);
            return term$2061;
        } else if (term$2061.isConditionalExpression) {
            term$2061.cond = expandTermTreeToFinal$1318(term$2061.cond, context$2062);
            term$2061.tru = expandTermTreeToFinal$1318(term$2061.tru, context$2062);
            term$2061.fls = expandTermTreeToFinal$1318(term$2061.fls, context$2062);
            return term$2061;
        } else if (term$2061.isVariableDeclaration) {
            if (term$2061.init) {
                term$2061.init = expandTermTreeToFinal$1318(term$2061.init, context$2062);
            }
            return term$2061;
        } else if (term$2061.isVariableStatement) {
            term$2061.decls = _$741.map(term$2061.decls, function (decl$2064) {
                return expandTermTreeToFinal$1318(decl$2064, context$2062);
            });
            return term$2061;
        } else if (term$2061.isDelimiter) {
            // expand inside the delimiter and then continue on
            term$2061.delim.token.inner = expand$1319(term$2061.delim.token.inner, context$2062);
            return term$2061;
        } else if (term$2061.isNamedFun || term$2061.isAnonFun || term$2061.isCatchClause || term$2061.isArrowFun || term$2061.isModule) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$2065 = [];
            var paramSingleIdent$2066 = term$2061.params && term$2061.params.token.type === parser$742.Token.Identifier;
            var params$2067;
            if (term$2061.params && term$2061.params.token.type === parser$742.Token.Delimiter) {
                params$2067 = term$2061.params;
            } else if (paramSingleIdent$2066) {
                params$2067 = term$2061.params;
            } else {
                params$2067 = syn$743.makeDelim('()', [], null);
            }
            var bodies$2068;
            if (Array.isArray(term$2061.body)) {
                bodies$2068 = syn$743.makeDelim('{}', term$2061.body, null);
            } else {
                bodies$2068 = term$2061.body;
            }
            bodies$2068 = bodies$2068.addDefCtx(newDef$2065);
            var paramNames$2069 = _$741.map(getParamIdentifiers$848(params$2067), function (param$2077) {
                var freshName$2078 = fresh$846();
                return {
                    freshName: freshName$2078,
                    originalParam: param$2077,
                    renamedParam: param$2077.rename(param$2077, freshName$2078)
                };
            });
            var bodyContext$2070 = makeExpanderContext$1320(_$741.defaults({
                defscope: newDef$2065,
                // paramscope is used to filter out var redeclarations
                paramscope: paramNames$2069.map(function (p$2079) {
                    return p$2079.renamedParam;
                })
            }, context$2062));
            var // rename the function body for each of the parameters
            renamedBody$2071 = _$741.reduce(paramNames$2069, function (accBody$2080, p$2081) {
                return accBody$2080.rename(p$2081.originalParam, p$2081.freshName);
            }, bodies$2068);
            renamedBody$2071 = renamedBody$2071;
            var expandedResult$2072 = expandToTermTree$1316(renamedBody$2071.token.inner, bodyContext$2070);
            var bodyTerms$2073 = expandedResult$2072.terms;
            if (expandedResult$2072.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody$2071.token.inner = expandedResult$2072.terms.concat(expandedResult$2072.restStx);
                if (Array.isArray(term$2061.body)) {
                    term$2061.body = renamedBody$2071.token.inner;
                } else {
                    term$2061.body = renamedBody$2071;
                }
                return term$2061;
            }
            var renamedParams$2074 = _$741.map(paramNames$2069, function (p$2082) {
                return p$2082.renamedParam;
            });
            var flatArgs$2075;
            if (paramSingleIdent$2066) {
                flatArgs$2075 = renamedParams$2074[0];
            } else {
                var puncCtx$2083 = term$2061.params || null;
                flatArgs$2075 = syn$743.makeDelim('()', joinSyntax$831(renamedParams$2074, syn$743.makePunc(',', puncCtx$2083)), puncCtx$2083);
            }
            var expandedArgs$2076 = expand$1319([flatArgs$2075], bodyContext$2070);
            assert$749(expandedArgs$2076.length === 1, 'should only get back one result');
            if (// stitch up the function with all the renamings
                term$2061.params) {
                term$2061.params = expandedArgs$2076[0];
            }
            bodyTerms$2073 = _$741.map(bodyTerms$2073, function (bodyTerm$2084) {
                if (// add the definition context to the result of
                    // expansion (this makes sure that syntax objects
                    // introduced by expansion have the def context)
                    bodyTerm$2084.isBlock) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal$2085 = expandTermTreeToFinal$1318(bodyTerm$2084, expandedResult$2072.context);
                    return blockFinal$2085.addDefCtx(newDef$2065);
                } else {
                    var termWithCtx$2086 = bodyTerm$2084.addDefCtx(newDef$2065);
                    // finish expansion
                    return expandTermTreeToFinal$1318(termWithCtx$2086, expandedResult$2072.context);
                }
            });
            if (term$2061.isModule) {
                bodyTerms$2073.forEach(function (bodyTerm$2088) {
                    if (bodyTerm$2088.isExport) {
                        if (bodyTerm$2088.name.token.type == parser$742.Token.Delimiter && bodyTerm$2088.name.token.value === '{}') {
                            (function (names$2093) {
                                return names$2093.forEach(function (name$2094) {
                                    term$2061.exports.push(name$2094);
                                });
                            }(filterCommaSep$1331(bodyTerm$2088.name.token.inner)));
                        } else {
                            throwSyntaxError$750('expand', 'not valid export type', bodyTerm$2088.name);
                        }
                    }
                });
            }
            renamedBody$2071.token.inner = bodyTerms$2073;
            if (Array.isArray(term$2061.body)) {
                term$2061.body = renamedBody$2071.token.inner;
            } else {
                term$2061.body = renamedBody$2071;
            }
            // and continue expand the rest
            return term$2061;
        }
        // the term is fine as is
        return term$2061;
    }
    function expand$1319(stx$2095, context$2096) {
        assert$749(context$2096, 'must provide an expander context');
        var trees$2097 = expandToTermTree$1316(stx$2095, context$2096);
        var terms$2098 = _$741.map(trees$2097.terms, function (term$2099) {
            return expandTermTreeToFinal$1318(term$2099, trees$2097.context);
        });
        if (trees$2097.restStx) {
            terms$2098.push.apply(terms$2098, trees$2097.restStx);
        }
        return terms$2098;
    }
    function makeExpanderContext$1320(o$2100) {
        o$2100 = o$2100 || {};
        var env$2101 = o$2100.env || new StringMap$824();
        if (!env$2101.names) {
            env$2101.names = new StringMap$824();
        }
        return Object.create(Object.prototype, {
            filename: {
                value: o$2100.filename,
                writable: false,
                enumerable: true,
                configurable: false
            },
            requireModule: {
                value: o$2100.requireModule,
                writable: false,
                enumerable: true,
                configurable: false
            },
            env: {
                value: env$2101,
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$2100.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            paramscope: {
                value: o$2100.paramscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$2100.templateMap || new StringMap$824(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            patternMap: {
                value: o$2100.patternMap || new StringMap$824(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$2100.mark,
                writable: false,
                enumerable: true,
                configurable: false
            },
            phase: {
                value: o$2100.phase,
                writable: false,
                enumerable: true,
                configurable: false
            },
            implicitImport: {
                value: o$2100.implicitImport || new StringMap$824(),
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    function makeModuleExpanderContext$1321(options$2102, templateMap$2103, patternMap$2104, phase$2105) {
        var requireModule$2106 = options$2102 ? options$2102.requireModule : undefined;
        var filename$2107 = options$2102 && options$2102.filename ? options$2102.filename : '<anonymous module>';
        return makeExpanderContext$1320({
            filename: filename$2107,
            requireModule: requireModule$2106,
            templateMap: templateMap$2103,
            patternMap: patternMap$2104,
            phase: phase$2105
        });
    }
    function makeTopLevelExpanderContext$1322(options$2108) {
        var requireModule$2109 = options$2108 ? options$2108.requireModule : undefined;
        var filename$2110 = options$2108 && options$2108.filename ? options$2108.filename : '<anonymous module>';
        return makeExpanderContext$1320({
            filename: filename$2110,
            requireModule: requireModule$2109
        });
    }
    function expandTopLevel$1323(stx$2111, moduleContexts$2112, options$2113) {
        moduleContexts$2112 = moduleContexts$2112 || [];
        options$2113 = options$2113 || {};
        options$2113.flatten = options$2113.flatten != null ? options$2113.flatten : true;
        maxExpands$834 = options$2113.maxExpands || Infinity;
        expandCount$833 = 0;
        var context$2114 = makeTopLevelExpanderContext$1322(options$2113);
        var modBody$2115 = syn$743.makeDelim('{}', stx$2111, null);
        modBody$2115 = _$741.reduce(moduleContexts$2112, function (acc$2117, mod$2118) {
            context$2114.env.extend(mod$2118.env);
            context$2114.env.names.extend(mod$2118.env.names);
            return loadModuleExports$1338(acc$2117, context$2114.env, mod$2118.exports, mod$2118.env);
        }, modBody$2115);
        var res$2116 = expand$1319([
            syn$743.makeIdent('module', null),
            modBody$2115
        ], context$2114);
        res$2116 = res$2116[0].destruct(context$2114, { stripCompileTerm: true });
        res$2116 = res$2116[0].token.inner;
        return options$2113.flatten ? flatten$1339(res$2116) : res$2116;
    }
    function collectImports$1324(mod$2119, context$2120) {
        // TODO: this is currently just grabbing the imports from the
        // very beginning of the file. It really should be able to mix
        // imports/exports/statements at the top level.
        var imports$2121 = [];
        var res$2122;
        var rest$2123 = mod$2119.body;
        if (// #lang "sweet" expands to imports for the basic macros for sweet.js
            // eventually this should hook into module level extensions
            unwrapSyntax$753(mod$2119.lang) !== 'base' && unwrapSyntax$753(mod$2119.lang) !== 'js') {
            var defaultImports$2124 = [
                'quoteSyntax',
                'syntax',
                '#',
                'syntaxCase',
                'macro',
                'withSyntax',
                'letstx',
                'macroclass',
                'operator'
            ];
            defaultImports$2124 = defaultImports$2124.map(function (name$2126) {
                return syn$743.makeIdent(name$2126, null);
            });
            imports$2121.push(ImportForMacros$1090.create(syn$743.makeDelim('{}', joinSyntax$831(defaultImports$2124, syn$743.makePunc(',', null)), null), mod$2119.lang));
            imports$2121.push(Import$1085.create(syn$743.makeKeyword('import', null), syn$743.makeDelim('{}', joinSyntax$831(defaultImports$2124, syn$743.makePunc(',', null)), null), syn$743.makeIdent('from', null), mod$2119.lang));
        }
        while (true) {
            res$2122 = enforest$1310(rest$2123, context$2120);
            if (res$2122.result && (res$2122.result.isImport || res$2122.result.isImportForMacros)) {
                imports$2121.push(res$2122.result);
                rest$2123 = res$2122.rest;
            } else {
                break;
            }
        }
        return Module$1080.create(mod$2119.name, mod$2119.lang, rest$2123, imports$2121, mod$2119.exports);
    }
    function resolvePath$1325(name$2127, parent$2128) {
        var path$2129 = require('path');
        var resolveSync$2130 = require('resolve/lib/sync');
        var root$2131 = path$2129.dirname(unwrapSyntax$753(parent$2128.name));
        var fs$2132 = require('fs');
        if (name$2127[0] === '.') {
            name$2127 = path$2129.resolve(root$2131, name$2127);
        }
        return resolveSync$2130(name$2127, {
            basedir: root$2131,
            extensions: [
                '.js',
                '.sjs'
            ]
        });
    }
    function createModule$1326(name$2133, body$2134) {
        if (body$2134 && body$2134[0] && body$2134[1] && body$2134[2] && unwrapSyntax$753(body$2134[0]) === '#' && unwrapSyntax$753(body$2134[1]) === 'lang' && body$2134[2].token.type === parser$742.Token.StringLiteral) {
            var // consume optional semicolon
            rest$2135 = body$2134[3] && body$2134[3].token.value === ';' && body$2134[3].token.type == parser$742.Token.Punctuator ? body$2134.slice(4) : body$2134.slice(3);
            return Module$1080.create(syn$743.makeValue(name$2133, null), body$2134[2], rest$2135, [], []);
        }
        return Module$1080.create(syn$743.makeValue(name$2133, null), syn$743.makeValue('base', null), body$2134, [], []);
    }
    function loadModule$1327(name$2136) {
        var // node specific code
        fs$2137 = require('fs');
        return function (body$2141) {
            return createModule$1326(name$2136, body$2141);
        }(parser$742.read(fs$2137.readFileSync(name$2136, 'utf8')));
    }
    function invoke$1328(mod$2142, phase$2143, context$2144, options$2145) {
        if (unwrapSyntax$753(mod$2142.lang) === 'base') {
            var exported$2146 = require(unwrapSyntax$753(mod$2142.name));
            Object.keys(exported$2146).forEach(function (exp$2148) {
                var freshName$2149 = fresh$846();
                var expName$2150 = syn$743.makeIdent(exp$2148, null);
                var renamed$2151 = expName$2150.rename(expName$2150, freshName$2149);
                mod$2142.exports.push(renamed$2151);
                context$2144.env.set(resolve$839(renamed$2151, phase$2143), { value: exported$2146[exp$2148] });
                context$2144.env.names.set(exp$2148, true);
            });
        } else {
            mod$2142.imports.forEach(function (imp$2163) {
                var modToImport$2164 = loadImport$1332(imp$2163, mod$2142, options$2145, context$2144);
                if (imp$2163.isImport) {
                    context$2144 = invoke$1328(modToImport$2164, phase$2143, context$2144, options$2145);
                }
            });
            var code$2160 = function (terms$2165) {
                return codegen$748.generate(parser$742.parse(flatten$1339(_$741.flatten(terms$2165.map(function (term$2166) {
                    return term$2166.destruct(context$2144, {
                        stripCompileTerm: true,
                        stripModuleTerm: true
                    });
                })))));
            }(mod$2142.body);
            var global$2161 = { console: console };
            vm$747.runInNewContext(code$2160, global$2161);
            mod$2142.exports.forEach(function (exp$2167) {
                var expName$2168 = resolve$839(exp$2167, phase$2143);
                var expVal$2169 = global$2161[expName$2168];
                context$2144.env.set(expName$2168, { value: expVal$2169 });
                context$2144.env.names.set(unwrapSyntax$753(exp$2167), true);
            });
        }
        return context$2144;
    }
    function visit$1329(mod$2170, phase$2171, context$2172, options$2173) {
        var defctx$2174 = [];
        if (// we don't need to visit base modules
            unwrapSyntax$753(mod$2170.lang) === 'base') {
            return context$2172;
        }
        mod$2170.body = mod$2170.body.map(function (term$2178) {
            return term$2178.addDefCtx(defctx$2174);
        });
        // reset the exports
        mod$2170.exports = [];
        mod$2170.imports.forEach(function (imp$2179) {
            var modToImport$2180 = loadImport$1332(imp$2179, mod$2170, options$2173, context$2172);
            if (imp$2179.isImport) {
                context$2172 = visit$1329(modToImport$2180, phase$2171, context$2172, options$2173);
            } else if (imp$2179.isImportForMacros) {
                context$2172 = invoke$1328(modToImport$2180, phase$2171 + 1, context$2172, options$2173);
                context$2172 = visit$1329(modToImport$2180, phase$2171 + 1, context$2172, options$2173);
            } else {
                assert$749(false, 'not implemented yet');
            }
            bindImportInMod$1333(imp$2179, mod$2170, modToImport$2180, context$2172, phase$2171);
        });
        mod$2170.body.forEach(function (term$2181) {
            var name$2182;
            var macroDefinition$2183;
            if (term$2181.isMacro) {
                macroDefinition$2183 = loadMacroDef$1315(term$2181.body, context$2172, phase$2171 + 1);
                name$2182 = unwrapSyntax$753(term$2181.name[0]);
                context$2172.env.names.set(name$2182, true);
                context$2172.env.set(resolve$839(term$2181.name[0], phase$2171), {
                    fn: macroDefinition$2183,
                    isOp: false,
                    builtin: builtinMode$832,
                    fullName: term$2181.name
                });
            }
            if (term$2181.isLetMacro) {
                macroDefinition$2183 = loadMacroDef$1315(term$2181.body, context$2172, phase$2171 + 1);
                // compilation collapses multi-token let macro names into single identifier
                name$2182 = unwrapSyntax$753(term$2181.name[0]);
                context$2172.env.names.set(name$2182, true);
                context$2172.env.set(resolve$839(term$2181.name[0], phase$2171), {
                    fn: macroDefinition$2183,
                    isOp: false,
                    builtin: builtinMode$832,
                    fullName: term$2181.name[0].props.fullName
                });
            }
            if (term$2181.isOperatorDefinition) {
                var opDefinition$2184 = loadMacroDef$1315(term$2181.body, context$2172, phase$2171 + 1);
                name$2182 = term$2181.name.map(unwrapSyntax$753).join('');
                var nameStx$2185 = syn$743.makeIdent(name$2182, term$2181.name[0]);
                addToDefinitionCtx$1317([nameStx$2185], defctx$2174, false, []);
                var resolvedName$2186 = resolve$839(nameStx$2185, phase$2171);
                var opObj$2187 = context$2172.env.get(resolvedName$2186);
                if (!opObj$2187) {
                    opObj$2187 = {
                        isOp: true,
                        builtin: builtinMode$832,
                        fullName: term$2181.name
                    };
                }
                assert$749(unwrapSyntax$753(term$2181.type) === 'binary' || unwrapSyntax$753(term$2181.type) === 'unary', 'operator must either be binary or unary');
                opObj$2187[unwrapSyntax$753(term$2181.type)] = {
                    fn: opDefinition$2184,
                    prec: term$2181.prec.token.value,
                    assoc: term$2181.assoc ? term$2181.assoc.token.value : null
                };
                context$2172.env.names.set(name$2182, true);
                context$2172.env.set(resolvedName$2186, opObj$2187);
            }
            if (term$2181.isExport) {
                if (term$2181.name.token.type === parser$742.Token.Delimiter && term$2181.name.token.value === '{}') {
                    (function (names$2192) {
                        return names$2192.forEach(function (name$2193) {
                            mod$2170.exports.push(name$2193);
                        });
                    }(filterCommaSep$1331(term$2181.name.token.inner)));
                } else {
                    throwSyntaxError$750('visit', 'not valid export', term$2181.name);
                }
            }
        });
        return context$2172;
    }
    function mapCommaSep$1330(l$2194, f$2195) {
        return l$2194.map(function (stx$2197, idx$2198) {
            if (idx$2198 % 2 !== 0 && (stx$2197.token.type !== parser$742.Token.Punctuator || stx$2197.token.value !== ',')) {
                throwSyntaxError$750('import', 'expecting a comma separated list', stx$2197);
            } else if (idx$2198 % 2 !== 0) {
                return stx$2197;
            } else {
                return f$2195(stx$2197);
            }
        });
    }
    function filterCommaSep$1331(stx$2199) {
        return stx$2199.filter(function (stx$2201, idx$2202) {
            if (idx$2202 % 2 !== 0 && (stx$2201.token.type !== parser$742.Token.Punctuator || stx$2201.token.value !== ',')) {
                throwSyntaxError$750('import', 'expecting a comma separated list', stx$2201);
            } else if (idx$2202 % 2 !== 0) {
                return false;
            } else {
                return true;
            }
        });
    }
    function loadImport$1332(imp$2203, parent$2204, options$2205, context$2206) {
        var modToImport$2207;
        var modFullPath$2208 = resolvePath$1325(unwrapSyntax$753(imp$2203.from), parent$2204);
        if (!availableModules$835.has(modFullPath$2208)) {
            // load it
            modToImport$2207 = function (loaded$2211) {
                return expandModule$1334(loaded$2211, options$2205, context$2206.templateMap, context$2206.patternMap).mod;
            }(loadModule$1327(modFullPath$2208));
            availableModules$835.set(modFullPath$2208, modToImport$2207);
        } else {
            modToImport$2207 = availableModules$835.get(modFullPath$2208);
        }
        return modToImport$2207;
    }
    function bindImportInMod$1333(imp$2212, mod$2213, modToImport$2214, context$2215, phase$2216) {
        if (imp$2212.names.token.type === parser$742.Token.Delimiter) {
            if (imp$2212.names.token.inner.length === 0) {
                throwSyntaxCaseError$751('compileModule', 'must include names to import', imp$2212.names);
            } else {
                var // first collect the import names and their associated bindings
                renamedNames$2221 = function (names$2224) {
                    return names$2224.map(function (importName$2225) {
                        var isBase$2226 = unwrapSyntax$753(modToImport$2214.lang) === 'base';
                        var inExports$2228 = _$741.find(modToImport$2214.exports, function (expTerm$2234) {
                            if (importName$2225.token.type === parser$742.Token.Delimiter) {
                                return expTerm$2234.token.type === parser$742.Token.Delimiter && syntaxInnerValuesEq$1309(importName$2225, expTerm$2234);
                            }
                            return expTerm$2234.token.value === importName$2225.token.value;
                        });
                        if (!inExports$2228 && !isBase$2226) {
                            throwSyntaxError$750('compile', 'the imported name `' + unwrapSyntax$753(importName$2225) + '` was not exported from the module', importName$2225);
                        }
                        var exportName$2229, trans$2230, exportNameStr$2231;
                        if (!inExports$2228) {
                            if (// case when importing from a non ES6
                                // module but not for macros so the module
                                // was not invoked and thus nothing in the
                                // context for this name
                                importName$2225.token.type === parser$742.Token.Delimiter) {
                                exportNameStr$2231 = importName$2225.map(unwrapSyntax$753).join('');
                            } else {
                                exportNameStr$2231 = unwrapSyntax$753(importName$2225);
                            }
                            trans$2230 = null;
                        } else if (inExports$2228.token.type === parser$742.Token.Delimiter) {
                            exportName$2229 = inExports$2228.token.inner;
                            exportNameStr$2231 = exportName$2229.map(unwrapSyntax$753).join('');
                            trans$2230 = getValueInEnv$1303(exportName$2229[0], exportName$2229.slice(1), context$2215, phase$2216);
                        } else {
                            exportName$2229 = inExports$2228;
                            exportNameStr$2231 = unwrapSyntax$753(exportName$2229);
                            trans$2230 = getValueInEnv$1303(exportName$2229, [], context$2215, phase$2216);
                        }
                        var newParam$2232 = syn$743.makeIdent(exportNameStr$2231, importName$2225);
                        var newName$2233 = fresh$846();
                        return {
                            original: newParam$2232,
                            renamed: newParam$2232.imported(newParam$2232, newName$2233, phase$2216),
                            name: newName$2233,
                            trans: trans$2230
                        };
                    });
                }(filterCommaSep$1331(imp$2212.names.token.inner));
                // set the new bindings in the context
                renamedNames$2221.forEach(function (name$2235) {
                    context$2215.env.names.set(unwrapSyntax$753(name$2235.renamed), true);
                    context$2215.env.set(resolve$839(name$2235.renamed, phase$2216), name$2235.trans);
                    if (// setup a reverse map from each import name to
                        // the import term but only for runtime values
                        name$2235.trans === null || name$2235.trans && name$2235.trans.value) {
                        var resolvedName$2237 = resolve$839(name$2235.renamed, phase$2216);
                        var origName$2238 = resolve$839(name$2235.original, phase$2216);
                        context$2215.implicitImport.set(resolvedName$2237, imp$2212);
                    }
                    mod$2213.body = mod$2213.body.map(function (stx$2239) {
                        return stx$2239.imported(name$2235.original, name$2235.name, phase$2216);
                    });
                });
                imp$2212.names = syn$743.makeDelim('{}', joinSyntax$831(renamedNames$2221.map(function (name$2240) {
                    return name$2240.renamed;
                }), syn$743.makePunc(',', imp$2212.names)), imp$2212.names);
            }
        } else {
            assert$749(false, 'not implemented yet');
        }
    }
    function expandModule$1334(mod$2241, options$2242, templateMap$2243, patternMap$2244) {
        var context$2245 = makeModuleExpanderContext$1321(options$2242, templateMap$2243, patternMap$2244, 0);
        return {
            context: context$2245,
            mod: function (mod$2248) {
                mod$2248.imports.forEach(function (imp$2250) {
                    var modToImport$2251 = loadImport$1332(imp$2250, mod$2248, options$2242, context$2245);
                    if (imp$2250.isImport) {
                        context$2245 = visit$1329(modToImport$2251, 0, context$2245, options$2242);
                    } else if (imp$2250.isImportForMacros) {
                        context$2245 = invoke$1328(modToImport$2251, 1, context$2245, options$2242);
                        context$2245 = visit$1329(modToImport$2251, 1, context$2245, options$2242);
                    } else {
                        assert$749(false, 'not implemented yet');
                    }
                    var importPhase$2252 = imp$2250.isImport ? 0 : 1;
                    bindImportInMod$1333(imp$2250, mod$2248, modToImport$2251, context$2245, importPhase$2252);
                });
                return expandTermTreeToFinal$1318(mod$2248, context$2245);
            }(collectImports$1324(mod$2241, context$2245))
        };
    }
    function filterCompileNames$1335(stx$2253, context$2254) {
        assert$749(stx$2253.token.type === parser$742.Token.Delimiter, 'must be a delimter');
        var runtimeNames$2258 = function (names$2261) {
            return names$2261.filter(function (name$2263) {
                if (name$2263.token.type === parser$742.Token.Delimiter) {
                    return !nameInEnv$1304(name$2263.token.inner[0], name$2263.token.inner.slice(1), context$2254, 0);
                } else {
                    return !nameInEnv$1304(name$2263, [], context$2254, 0);
                }
            });
        }(filterCommaSep$1331(stx$2253.token.inner));
        var newInner$2260 = runtimeNames$2258.reduce(function (acc$2264, name$2265, idx$2266, orig$2267) {
            acc$2264.push(name$2265);
            if (orig$2267.length - 1 !== idx$2266) {
                // don't add trailing comma
                acc$2264.push(syn$743.makePunc(',', name$2265));
            }
            return acc$2264;
        }, []);
        return syn$743.makeDelim('{}', newInner$2260, stx$2253);
    }
    function flattenModule$1336(mod$2268, context$2269) {
        var // filter the imports to just the imports and names that are
        // actually available at runtime
        imports$2271 = mod$2268.imports.reduce(function (acc$2280, imp$2281) {
            if (imp$2281.isImportForMacros) {
                return acc$2280;
            }
            if (imp$2281.names.token.type === parser$742.Token.Delimiter) {
                imp$2281.names = filterCompileNames$1335(imp$2281.names, context$2269);
                if (imp$2281.names.token.inner.length === 0) {
                    return acc$2280;
                }
                return acc$2280.concat(imp$2281);
            } else {
                assert$749(false, 'not implemented yet');
            }
        }, []);
        var // filter the exports to just the exports and names that are
        // actually available at runtime
        output$2273 = mod$2268.body.reduce(function (acc$2282, term$2283) {
            if (term$2283.isExport) {
                if (term$2283.name.token.type === parser$742.Token.Delimiter) {
                    term$2283.name = filterCompileNames$1335(term$2283.name, context$2269);
                    if (term$2283.name.token.inner.length === 0) {
                        return acc$2282;
                    }
                } else {
                    assert$749(false, 'not implemented yet');
                }
            }
            return acc$2282.concat(term$2283.destruct(context$2269, { stripCompileTerm: true }));
        }, []);
        output$2273 = function (output$2284) {
            return output$2284.map(function (stx$2285) {
                var name$2286 = resolve$839(stx$2285, 0);
                if (// collect the implicit imports (those imports that
                    // must be included because a macro expanded to a reference
                    // to an import from some other module)
                    context$2269.implicitImport.has(name$2286)) {
                    imports$2271.push(context$2269.implicitImport.get(name$2286));
                }
                return stx$2285;
            });
        }(flatten$1339(output$2273));
        var // flatten everything
        flatImports$2279 = imports$2271.reduce(function (acc$2287, imp$2288) {
            return acc$2287.concat(flatten$1339(imp$2288.destruct(context$2269).concat(syn$743.makePunc(';', imp$2288.names))));
        }, []);
        return {
            imports: imports$2271,
            body: flatImports$2279.concat(output$2273)
        };
    }
    function compileModule$1337(stx$2289, options$2290) {
        var fs$2291 = require('fs');
        var filename$2292 = options$2290 && typeof options$2290.filename !== 'undefined' ? fs$2291.realpathSync(options$2290.filename) : '(anonymous module)';
        maxExpands$834 = Infinity;
        expandCount$833 = 0;
        var mod$2293 = createModule$1326(filename$2292, stx$2289);
        var // the template and pattern maps are global for every module
        templateMap$2294 = new StringMap$824();
        var patternMap$2295 = new StringMap$824();
        availableModules$835 = new StringMap$824();
        var expanded$2296 = expandModule$1334(mod$2293, options$2290, templateMap$2294, patternMap$2295);
        var flattened$2297 = flattenModule$1336(expanded$2296.mod, expanded$2296.context);
        var compiledModules$2299 = flattened$2297.imports.map(function (imp$2300) {
            var modFullPath$2301 = resolvePath$1325(unwrapSyntax$753(imp$2300.from), mod$2293);
            if (availableModules$835.has(modFullPath$2301)) {
                var flattened$2302 = flattenModule$1336(availableModules$835.get(modFullPath$2301), expanded$2296.context);
                return {
                    path: modFullPath$2301,
                    code: flattened$2302.body
                };
            } else {
                assert$749(false, 'module was unexpectedly not available for compilation' + modFullPath$2301);
            }
        });
        return [{
                path: filename$2292,
                code: flattened$2297.body
            }].concat(compiledModules$2299);
    }
    function loadModuleExports$1338(stx$2303, newEnv$2304, exports$2305, oldEnv$2306) {
        return _$741.reduce(exports$2305, function (acc$2307, param$2308) {
            var newName$2309 = fresh$846();
            var transformer$2310 = oldEnv$2306.get(resolve$839(param$2308.oldExport));
            if (transformer$2310) {
                newEnv$2304.set(resolve$839(param$2308.newParam.rename(param$2308.newParam, newName$2309)), transformer$2310);
                return acc$2307.rename(param$2308.newParam, newName$2309);
            } else {
                return acc$2307;
            }
        }, stx$2303);
    }
    function flatten$1339(stx$2311) {
        return _$741.reduce(stx$2311, function (acc$2312, stx$2313) {
            if (stx$2313.token.type === parser$742.Token.Delimiter) {
                var openParen$2314 = syntaxFromToken$830({
                    type: parser$742.Token.Punctuator,
                    value: stx$2313.token.value[0],
                    range: stx$2313.token.startRange,
                    sm_range: typeof stx$2313.token.sm_startRange == 'undefined' ? stx$2313.token.startRange : stx$2313.token.sm_startRange,
                    lineNumber: stx$2313.token.startLineNumber,
                    sm_lineNumber: typeof stx$2313.token.sm_startLineNumber == 'undefined' ? stx$2313.token.startLineNumber : stx$2313.token.sm_startLineNumber,
                    lineStart: stx$2313.token.startLineStart,
                    sm_lineStart: typeof stx$2313.token.sm_startLineStart == 'undefined' ? stx$2313.token.startLineStart : stx$2313.token.sm_startLineStart
                }, stx$2313);
                var closeParen$2315 = syntaxFromToken$830({
                    type: parser$742.Token.Punctuator,
                    value: stx$2313.token.value[1],
                    range: stx$2313.token.endRange,
                    sm_range: typeof stx$2313.token.sm_endRange == 'undefined' ? stx$2313.token.endRange : stx$2313.token.sm_endRange,
                    lineNumber: stx$2313.token.endLineNumber,
                    sm_lineNumber: typeof stx$2313.token.sm_endLineNumber == 'undefined' ? stx$2313.token.endLineNumber : stx$2313.token.sm_endLineNumber,
                    lineStart: stx$2313.token.endLineStart,
                    sm_lineStart: typeof stx$2313.token.sm_endLineStart == 'undefined' ? stx$2313.token.endLineStart : stx$2313.token.sm_endLineStart
                }, stx$2313);
                if (stx$2313.token.leadingComments) {
                    openParen$2314.token.leadingComments = stx$2313.token.leadingComments;
                }
                if (stx$2313.token.trailingComments) {
                    openParen$2314.token.trailingComments = stx$2313.token.trailingComments;
                }
                acc$2312.push(openParen$2314);
                push$836.apply(acc$2312, flatten$1339(stx$2313.token.inner));
                acc$2312.push(closeParen$2315);
                return acc$2312;
            }
            stx$2313.token.sm_lineNumber = typeof stx$2313.token.sm_lineNumber != 'undefined' ? stx$2313.token.sm_lineNumber : stx$2313.token.lineNumber;
            stx$2313.token.sm_lineStart = typeof stx$2313.token.sm_lineStart != 'undefined' ? stx$2313.token.sm_lineStart : stx$2313.token.lineStart;
            stx$2313.token.sm_range = typeof stx$2313.token.sm_range != 'undefined' ? stx$2313.token.sm_range : stx$2313.token.range;
            acc$2312.push(stx$2313);
            return acc$2312;
        }, []);
    }
    exports$740.StringMap = StringMap$824;
    exports$740.enforest = enforest$1310;
    exports$740.expand = expandTopLevel$1323;
    exports$740.compileModule = compileModule$1337;
    exports$740.resolve = resolve$839;
    exports$740.get_expression = get_expression$1312;
    exports$740.getName = getName$1302;
    exports$740.getValueInEnv = getValueInEnv$1303;
    exports$740.nameInEnv = nameInEnv$1304;
    exports$740.makeExpanderContext = makeExpanderContext$1320;
    exports$740.Expr = Expr$1155;
    exports$740.VariableStatement = VariableStatement$1275;
    exports$740.tokensToSyntax = syn$743.tokensToSyntax;
    exports$740.syntaxToTokens = syn$743.syntaxToTokens;
}));