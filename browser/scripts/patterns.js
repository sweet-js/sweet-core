(function (root$1262, factory$1263) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1263(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1263);
    }
}(this, function (exports$1264, _$1265, es6$1266, parser$1267, expander$1268, syntax$1269) {
    var get_expression$1270 = expander$1268.get_expression;
    var syntaxFromToken$1271 = syntax$1269.syntaxFromToken;
    var makePunc$1272 = syntax$1269.makePunc;
    var joinSyntax$1273 = syntax$1269.joinSyntax;
    var joinSyntaxArr$1274 = syntax$1269.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1275(pattern$1288) {
        var fv$1289 = [];
        _$1265.each(pattern$1288, function (pat$1290) {
            if (isPatternVar$1279(pat$1290)) {
                fv$1289.push(pat$1290.token.value);
            } else if (pat$1290.token.type === parser$1267.Token.Delimiter) {
                fv$1289 = fv$1289.concat(freeVarsInPattern$1275(pat$1290.token.inner));
            }
        });
        return fv$1289;
    }
    function typeIsLiteral$1276(type$1291) {
        return type$1291 === parser$1267.Token.NullLiteral || type$1291 === parser$1267.Token.NumericLiteral || type$1291 === parser$1267.Token.StringLiteral || type$1291 === parser$1267.Token.RegexLiteral || type$1291 === parser$1267.Token.BooleanLiteral;
    }
    function containsPatternVar$1277(patterns$1292) {
        return _$1265.any(patterns$1292, function (pat$1293) {
            if (pat$1293.token.type === parser$1267.Token.Delimiter) {
                return containsPatternVar$1277(pat$1293.token.inner);
            }
            return isPatternVar$1279(pat$1293);
        });
    }
    function delimIsSeparator$1278(delim$1294) {
        return delim$1294 && delim$1294.token && delim$1294.token.type === parser$1267.Token.Delimiter && delim$1294.token.value === '()' && delim$1294.token.inner.length === 1 && delim$1294.token.inner[0].token.type !== parser$1267.Token.Delimiter && !containsPatternVar$1277(delim$1294.token.inner);
    }
    function isPatternVar$1279(stx$1295) {
        return stx$1295.token.value[0] === '$' && stx$1295.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1280(tojoin$1296, punc$1297) {
        return _$1265.reduce(_$1265.rest(tojoin$1296, 1), function (acc$1298, join$1299) {
            if (punc$1297 === ' ') {
                return acc$1298.concat(join$1299.match);
            }
            return acc$1298.concat(makePunc$1272(punc$1297, _$1265.first(join$1299.match)), join$1299.match);
        }, _$1265.first(tojoin$1296).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1281(from$1300, to$1301) {
        return _$1265.map(to$1301, function (stx$1302) {
            return takeLine$1282(from$1300, stx$1302);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1282(from$1303, to$1304) {
        if (to$1304.token.type === parser$1267.Token.Delimiter) {
            var next$1305;
            if (from$1303.token.type === parser$1267.Token.Delimiter) {
                next$1305 = syntaxFromToken$1271({
                    type: parser$1267.Token.Delimiter,
                    value: to$1304.token.value,
                    inner: takeLineContext$1281(from$1303, to$1304.token.inner),
                    startRange: from$1303.token.startRange,
                    endRange: from$1303.token.endRange,
                    startLineNumber: from$1303.token.startLineNumber,
                    startLineStart: from$1303.token.startLineStart,
                    endLineNumber: from$1303.token.endLineNumber,
                    endLineStart: from$1303.token.endLineStart
                }, to$1304);
            } else {
                next$1305 = syntaxFromToken$1271({
                    type: parser$1267.Token.Delimiter,
                    value: to$1304.token.value,
                    inner: takeLineContext$1281(from$1303, to$1304.token.inner),
                    startRange: from$1303.token.range,
                    endRange: from$1303.token.range,
                    startLineNumber: from$1303.token.lineNumber,
                    startLineStart: from$1303.token.lineStart,
                    endLineNumber: from$1303.token.lineNumber,
                    endLineStart: from$1303.token.lineStart
                }, to$1304);
            }
        } else {
            if (from$1303.token.type === parser$1267.Token.Delimiter) {
                next$1305 = syntaxFromToken$1271({
                    value: to$1304.token.value,
                    type: to$1304.token.type,
                    lineNumber: from$1303.token.startLineNumber,
                    lineStart: from$1303.token.startLineStart,
                    range: from$1303.token.startRange
                }, to$1304);
            } else {
                next$1305 = syntaxFromToken$1271({
                    value: to$1304.token.value,
                    type: to$1304.token.type,
                    lineNumber: from$1303.token.lineNumber,
                    lineStart: from$1303.token.lineStart,
                    range: from$1303.token.range
                }, to$1304);
            }
        }
        if (to$1304.token.leadingComments) {
            next$1305.token.leadingComments = to$1304.token.leadingComments;
        }
        if (to$1304.token.trailingComments) {
            next$1305.token.trailingComments = to$1304.token.trailingComments;
        }
        return next$1305;
    }
    function loadPattern$1283(patterns$1306) {
        return _$1265.chain(patterns$1306).reduce(function (acc$1307, patStx$1308, idx$1309) {
            var last$1310 = patterns$1306[idx$1309 - 1];
            var lastLast$1311 = patterns$1306[idx$1309 - 2];
            var next$1312 = patterns$1306[idx$1309 + 1];
            var nextNext$1313 = patterns$1306[idx$1309 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1308.token.value === ':') {
                if (last$1310 && isPatternVar$1279(last$1310) && !isPatternVar$1279(next$1312)) {
                    return acc$1307;
                }
            }
            if (last$1310 && last$1310.token.value === ':') {
                if (lastLast$1311 && isPatternVar$1279(lastLast$1311) && !isPatternVar$1279(patStx$1308)) {
                    return acc$1307;
                }
            }
            // skip over $
            if (patStx$1308.token.value === '$' && next$1312 && next$1312.token.type === parser$1267.Token.Delimiter) {
                return acc$1307;
            }
            if (isPatternVar$1279(patStx$1308)) {
                if (next$1312 && next$1312.token.value === ':' && !isPatternVar$1279(nextNext$1313)) {
                    if (typeof nextNext$1313 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1308.class = nextNext$1313.token.value;
                } else {
                    patStx$1308.class = 'token';
                }
            } else if (patStx$1308.token.type === parser$1267.Token.Delimiter) {
                if (last$1310 && last$1310.token.value === '$') {
                    patStx$1308.class = 'pattern_group';
                }
                patStx$1308.token.inner = loadPattern$1283(patStx$1308.token.inner);
            } else {
                patStx$1308.class = 'pattern_literal';
            }
            return acc$1307.concat(patStx$1308);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1314, patStx$1315, idx$1316, patterns$1317) {
            var separator$1318 = ' ';
            var repeat$1319 = false;
            var next$1320 = patterns$1317[idx$1316 + 1];
            var nextNext$1321 = patterns$1317[idx$1316 + 2];
            if (next$1320 && next$1320.token.value === '...') {
                repeat$1319 = true;
                separator$1318 = ' ';
            } else if (delimIsSeparator$1278(next$1320) && nextNext$1321 && nextNext$1321.token.value === '...') {
                repeat$1319 = true;
                parser$1267.assert(next$1320.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1318 = next$1320.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1315.token.value === '...' || delimIsSeparator$1278(patStx$1315) && next$1320 && next$1320.token.value === '...') {
                return acc$1314;
            }
            patStx$1315.repeat = repeat$1319;
            patStx$1315.separator = separator$1318;
            return acc$1314.concat(patStx$1315);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1284(patternClass$1322, stx$1323, env$1324) {
        var result$1325, rest$1326;
        // pattern has no parse class
        if (patternClass$1322 === 'token' && stx$1323[0] && stx$1323[0].token.type !== parser$1267.Token.EOF) {
            result$1325 = [stx$1323[0]];
            rest$1326 = stx$1323.slice(1);
        } else if (patternClass$1322 === 'lit' && stx$1323[0] && typeIsLiteral$1276(stx$1323[0].token.type)) {
            result$1325 = [stx$1323[0]];
            rest$1326 = stx$1323.slice(1);
        } else if (patternClass$1322 === 'ident' && stx$1323[0] && stx$1323[0].token.type === parser$1267.Token.Identifier) {
            result$1325 = [stx$1323[0]];
            rest$1326 = stx$1323.slice(1);
        } else if (stx$1323.length > 0 && patternClass$1322 === 'VariableStatement') {
            var match$1327 = expander$1268.enforest(stx$1323, expander$1268.makeExpanderContext({ env: env$1324 }));
            if (match$1327.result && match$1327.result.hasPrototype(expander$1268.VariableStatement)) {
                result$1325 = match$1327.result.destruct(false);
                rest$1326 = match$1327.rest;
            } else {
                result$1325 = null;
                rest$1326 = stx$1323;
            }
        } else if (stx$1323.length > 0 && patternClass$1322 === 'expr') {
            var match$1327 = expander$1268.get_expression(stx$1323, expander$1268.makeExpanderContext({ env: env$1324 }));
            if (match$1327.result === null || !match$1327.result.hasPrototype(expander$1268.Expr)) {
                result$1325 = null;
                rest$1326 = stx$1323;
            } else {
                result$1325 = match$1327.result.destruct(false);
                rest$1326 = match$1327.rest;
            }
        } else {
            result$1325 = null;
            rest$1326 = stx$1323;
        }
        return {
            result: result$1325,
            rest: rest$1326
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1285(patterns$1328, stx$1329, env$1330, topLevel$1331) {
        // topLevel lets us know if the patterns are on the top level or nested inside
        // a delimiter:
        //     case $topLevel (,) ... => { }
        //     case ($nested (,) ...) => { }
        // This matters for how we deal with trailing unmatched syntax when the pattern
        // has an ellipses:
        //     m 1,2,3 foo
        // should match 1,2,3 and leave foo alone but:
        //     m (1,2,3 foo)
        // should fail to match entirely.
        topLevel$1331 = topLevel$1331 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1332 = [];
        var patternEnv$1333 = {};
        var match$1334;
        var pattern$1335;
        var rest$1336 = stx$1329;
        var success$1337 = true;
        for (var i$1338 = 0; i$1338 < patterns$1328.length; i$1338++) {
            if (success$1337 === false) {
                break;
            }
            pattern$1335 = patterns$1328[i$1338];
            do {
                match$1334 = matchPattern$1286(pattern$1335, rest$1336, env$1330, patternEnv$1333);
                if (!match$1334.success && pattern$1335.repeat) {
                    // a repeat can match zero tokens and still be a
                    // "success" so break out of the inner loop and
                    // try the next pattern
                    break;
                }
                if (!match$1334.success) {
                    success$1337 = false;
                    break;
                }
                rest$1336 = match$1334.rest;
                patternEnv$1333 = match$1334.patternEnv;
                if (success$1337 && !(topLevel$1331 || pattern$1335.repeat)) {
                    // the very last pattern matched, inside a
                    // delimiter, not a repeat, *and* there are more
                    // unmatched bits of syntax
                    if (i$1338 == patterns$1328.length - 1 && rest$1336.length !== 0) {
                        success$1337 = false;
                        break;
                    }
                }
                if (pattern$1335.repeat && success$1337) {
                    if (rest$1336[0] && rest$1336[0].token.value === pattern$1335.separator) {
                        // more tokens and the next token matches the separator
                        rest$1336 = rest$1336.slice(1);
                    } else if (pattern$1335.separator === ' ') {
                        // no separator specified (using the empty string for this)
                        // so keep going
                        continue;
                    } else if (pattern$1335.separator !== ' ' && rest$1336.length > 0 && i$1338 === patterns$1328.length - 1 && topLevel$1331 === false) {
                        // separator is specified, there is a next token, the
                        // next token doesn't match the separator, there are
                        // no more patterns, and this is a top level pattern
                        // so the match has failed
                        success$1337 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$1335.repeat && success$1337 && rest$1336.length > 0);
        }
        return {
            success: success$1337,
            rest: rest$1336,
            patternEnv: patternEnv$1333
        };
    }
    /* the pattern environment will look something like:
    {
        "$x": {
            level: 2,
            match: [{
                level: 1,
                match: [{
                    level: 0,
                    match: [tok1, tok2, ...]
                }, {
                    level: 0,
                    match: [tok1, tok2, ...]
                }]
            }, {
                level: 1,
                match: [{
                    level: 0,
                    match: [tok1, tok2, ...]
                }]
            }]
        },
        "$y" : ...
    }
    */
    function matchPattern$1286(pattern$1339, stx$1340, env$1341, patternEnv$1342) {
        var subMatch$1343;
        var match$1344, matchEnv$1345;
        var rest$1346;
        var success$1347;
        if (typeof pattern$1339.inner !== 'undefined') {
            if (pattern$1339.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1343 = matchPatterns$1285(pattern$1339.inner, stx$1340, env$1341, true);
                rest$1346 = subMatch$1343.rest;
            } else if (stx$1340[0] && stx$1340[0].token.type === parser$1267.Token.Delimiter && stx$1340[0].token.value === pattern$1339.value) {
                stx$1340[0].expose();
                if (pattern$1339.inner.length === 0 && stx$1340[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1340,
                        patternEnv: patternEnv$1342
                    };
                }
                subMatch$1343 = matchPatterns$1285(pattern$1339.inner, stx$1340[0].token.inner, env$1341, false);
                rest$1346 = stx$1340.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1340,
                    patternEnv: patternEnv$1342
                };
            }
            success$1347 = subMatch$1343.success;
            // merge the subpattern matches with the current pattern environment
            _$1265.keys(subMatch$1343.patternEnv).forEach(function (patternKey$1348) {
                if (pattern$1339.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1349 = subMatch$1343.patternEnv[patternKey$1348].level + 1;
                    if (patternEnv$1342[patternKey$1348]) {
                        patternEnv$1342[patternKey$1348].level = nextLevel$1349;
                        patternEnv$1342[patternKey$1348].match.push(subMatch$1343.patternEnv[patternKey$1348]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1342[patternKey$1348] = {
                            level: nextLevel$1349,
                            match: [subMatch$1343.patternEnv[patternKey$1348]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1342[patternKey$1348] = subMatch$1343.patternEnv[patternKey$1348];
                }
            });
        } else {
            if (pattern$1339.class === 'pattern_literal') {
                // wildcard
                if (stx$1340[0] && pattern$1339.value === '_') {
                    success$1347 = true;
                    rest$1346 = stx$1340.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1340[0] && pattern$1339.value === stx$1340[0].token.value) {
                    success$1347 = true;
                    rest$1346 = stx$1340.slice(1);
                } else {
                    success$1347 = false;
                    rest$1346 = stx$1340;
                }
            } else {
                match$1344 = matchPatternClass$1284(pattern$1339.class, stx$1340, env$1341);
                success$1347 = match$1344.result !== null;
                rest$1346 = match$1344.rest;
                matchEnv$1345 = {
                    level: 0,
                    match: match$1344.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1339.repeat) {
                    if (patternEnv$1342[pattern$1339.value]) {
                        patternEnv$1342[pattern$1339.value].match.push(matchEnv$1345);
                    } else {
                        // initialize if necessary
                        patternEnv$1342[pattern$1339.value] = {
                            level: 1,
                            match: [matchEnv$1345]
                        };
                    }
                } else {
                    patternEnv$1342[pattern$1339.value] = matchEnv$1345;
                }
            }
        }
        return {
            success: success$1347,
            rest: rest$1346,
            patternEnv: patternEnv$1342
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1287(macroBody$1350, macroNameStx$1351, env$1352) {
        return _$1265.chain(macroBody$1350).reduce(function (acc$1353, bodyStx$1354, idx$1355, original$1356) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1357 = original$1356[idx$1355 - 1];
            var next$1358 = original$1356[idx$1355 + 1];
            var nextNext$1359 = original$1356[idx$1355 + 2];
            // drop `...`
            if (bodyStx$1354.token.value === '...') {
                return acc$1353;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1278(bodyStx$1354) && next$1358 && next$1358.token.value === '...') {
                return acc$1353;
            }
            // skip the $ in $(...)
            if (bodyStx$1354.token.value === '$' && next$1358 && next$1358.token.type === parser$1267.Token.Delimiter && next$1358.token.value === '()') {
                return acc$1353;
            }
            // mark $[...] as a literal
            if (bodyStx$1354.token.value === '$' && next$1358 && next$1358.token.type === parser$1267.Token.Delimiter && next$1358.token.value === '[]') {
                next$1358.literal = true;
                return acc$1353;
            }
            if (bodyStx$1354.token.type === parser$1267.Token.Delimiter && bodyStx$1354.token.value === '()' && last$1357 && last$1357.token.value === '$') {
                bodyStx$1354.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1354.literal === true) {
                parser$1267.assert(bodyStx$1354.token.type === parser$1267.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1353.concat(bodyStx$1354.token.inner);
            }
            if (next$1358 && next$1358.token.value === '...') {
                bodyStx$1354.repeat = true;
                bodyStx$1354.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1278(next$1358) && nextNext$1359 && nextNext$1359.token.value === '...') {
                bodyStx$1354.repeat = true;
                bodyStx$1354.separator = next$1358.token.inner[0].token.value;
            }
            return acc$1353.concat(bodyStx$1354);
        }, []).reduce(function (acc$1360, bodyStx$1361, idx$1362) {
            // then do the actual transcription
            if (bodyStx$1361.repeat) {
                if (bodyStx$1361.token.type === parser$1267.Token.Delimiter) {
                    bodyStx$1361.expose();
                    var fv$1363 = _$1265.filter(freeVarsInPattern$1275(bodyStx$1361.token.inner), function (pat$1370) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1352.hasOwnProperty(pat$1370);
                        });
                    var restrictedEnv$1364 = [];
                    var nonScalar$1365 = _$1265.find(fv$1363, function (pat$1371) {
                            return env$1352[pat$1371].level > 0;
                        });
                    parser$1267.assert(typeof nonScalar$1365 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1366 = env$1352[nonScalar$1365].match.length;
                    var sameLength$1367 = _$1265.all(fv$1363, function (pat$1372) {
                            return env$1352[pat$1372].level === 0 || env$1352[pat$1372].match.length === repeatLength$1366;
                        });
                    parser$1267.assert(sameLength$1367, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1364 = _$1265.map(_$1265.range(repeatLength$1366), function (idx$1373) {
                        var renv$1374 = {};
                        _$1265.each(fv$1363, function (pat$1375) {
                            if (env$1352[pat$1375].level === 0) {
                                // copy scalars over
                                renv$1374[pat$1375] = env$1352[pat$1375];
                            } else {
                                // grab the match at this index
                                renv$1374[pat$1375] = env$1352[pat$1375].match[idx$1373];
                            }
                        });
                        return renv$1374;
                    });
                    var transcribed$1368 = _$1265.map(restrictedEnv$1364, function (renv$1376) {
                            if (bodyStx$1361.group) {
                                return transcribe$1287(bodyStx$1361.token.inner, macroNameStx$1351, renv$1376);
                            } else {
                                var newBody$1377 = syntaxFromToken$1271(_$1265.clone(bodyStx$1361.token), bodyStx$1361);
                                newBody$1377.token.inner = transcribe$1287(bodyStx$1361.token.inner, macroNameStx$1351, renv$1376);
                                return newBody$1377;
                            }
                        });
                    var joined$1369;
                    if (bodyStx$1361.group) {
                        joined$1369 = joinSyntaxArr$1274(transcribed$1368, bodyStx$1361.separator);
                    } else {
                        joined$1369 = joinSyntax$1273(transcribed$1368, bodyStx$1361.separator);
                    }
                    return acc$1360.concat(joined$1369);
                }
                if (!env$1352[bodyStx$1361.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1361.token.value + ' is not bound for the template');
                } else if (env$1352[bodyStx$1361.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1361.token.value + ' does not match in the template');
                }
                return acc$1360.concat(joinRepeatedMatch$1280(env$1352[bodyStx$1361.token.value].match, bodyStx$1361.separator));
            } else {
                if (bodyStx$1361.token.type === parser$1267.Token.Delimiter) {
                    bodyStx$1361.expose();
                    var newBody$1378 = syntaxFromToken$1271(_$1265.clone(bodyStx$1361.token), macroBody$1350);
                    newBody$1378.token.inner = transcribe$1287(bodyStx$1361.token.inner, macroNameStx$1351, env$1352);
                    return acc$1360.concat([newBody$1378]);
                }
                if (isPatternVar$1279(bodyStx$1361) && Object.prototype.hasOwnProperty.bind(env$1352)(bodyStx$1361.token.value)) {
                    if (!env$1352[bodyStx$1361.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1361.token.value + ' is not bound for the template');
                    } else if (env$1352[bodyStx$1361.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1361.token.value + ' does not match in the template');
                    }
                    return acc$1360.concat(env$1352[bodyStx$1361.token.value].match);
                }
                return acc$1360.concat([bodyStx$1361]);
            }
        }, []).value();
    }
    exports$1264.loadPattern = loadPattern$1283;
    exports$1264.matchPatterns = matchPatterns$1285;
    exports$1264.transcribe = transcribe$1287;
    exports$1264.matchPatternClass = matchPatternClass$1284;
    exports$1264.takeLineContext = takeLineContext$1281;
    exports$1264.takeLine = takeLine$1282;
}));