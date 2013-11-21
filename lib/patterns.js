(function (root$1246, factory$1247) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1247(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1247);
    }
}(this, function (exports$1248, _$1249, es6$1250, parser$1251, expander$1252, syntax$1253) {
    var get_expression$1254 = expander$1252.get_expression;
    var syntaxFromToken$1255 = syntax$1253.syntaxFromToken;
    var makePunc$1256 = syntax$1253.makePunc;
    var joinSyntax$1257 = syntax$1253.joinSyntax;
    var joinSyntaxArr$1258 = syntax$1253.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1259(pattern$1272) {
        var fv$1273 = [];
        _$1249.each(pattern$1272, function (pat$1274) {
            if (isPatternVar$1263(pat$1274)) {
                fv$1273.push(pat$1274.token.value);
            } else if (pat$1274.token.type === parser$1251.Token.Delimiter) {
                fv$1273 = fv$1273.concat(freeVarsInPattern$1259(pat$1274.token.inner));
            }
        });
        return fv$1273;
    }
    function typeIsLiteral$1260(type$1275) {
        return type$1275 === parser$1251.Token.NullLiteral || type$1275 === parser$1251.Token.NumericLiteral || type$1275 === parser$1251.Token.StringLiteral || type$1275 === parser$1251.Token.RegexLiteral || type$1275 === parser$1251.Token.BooleanLiteral;
    }
    function containsPatternVar$1261(patterns$1276) {
        return _$1249.any(patterns$1276, function (pat$1277) {
            if (pat$1277.token.type === parser$1251.Token.Delimiter) {
                return containsPatternVar$1261(pat$1277.token.inner);
            }
            return isPatternVar$1263(pat$1277);
        });
    }
    function delimIsSeparator$1262(delim$1278) {
        return delim$1278 && delim$1278.token && delim$1278.token.type === parser$1251.Token.Delimiter && delim$1278.token.value === '()' && delim$1278.token.inner.length === 1 && delim$1278.token.inner[0].token.type !== parser$1251.Token.Delimiter && !containsPatternVar$1261(delim$1278.token.inner);
    }
    function isPatternVar$1263(stx$1279) {
        return stx$1279.token.value[0] === '$' && stx$1279.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1264(tojoin$1280, punc$1281) {
        return _$1249.reduce(_$1249.rest(tojoin$1280, 1), function (acc$1282, join$1283) {
            if (punc$1281 === ' ') {
                return acc$1282.concat(join$1283.match);
            }
            return acc$1282.concat(makePunc$1256(punc$1281, _$1249.first(join$1283.match)), join$1283.match);
        }, _$1249.first(tojoin$1280).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1265(from$1284, to$1285) {
        return _$1249.map(to$1285, function (stx$1286) {
            return takeLine$1266(from$1284, stx$1286);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1266(from$1287, to$1288) {
        if (to$1288.token.type === parser$1251.Token.Delimiter) {
            var next$1289;
            if (from$1287.token.type === parser$1251.Token.Delimiter) {
                next$1289 = syntaxFromToken$1255({
                    type: parser$1251.Token.Delimiter,
                    value: to$1288.token.value,
                    inner: takeLineContext$1265(from$1287, to$1288.token.inner),
                    startRange: from$1287.token.startRange,
                    endRange: from$1287.token.endRange,
                    startLineNumber: from$1287.token.startLineNumber,
                    startLineStart: from$1287.token.startLineStart,
                    endLineNumber: from$1287.token.endLineNumber,
                    endLineStart: from$1287.token.endLineStart
                }, to$1288);
            } else {
                next$1289 = syntaxFromToken$1255({
                    type: parser$1251.Token.Delimiter,
                    value: to$1288.token.value,
                    inner: takeLineContext$1265(from$1287, to$1288.token.inner),
                    startRange: from$1287.token.range,
                    endRange: from$1287.token.range,
                    startLineNumber: from$1287.token.lineNumber,
                    startLineStart: from$1287.token.lineStart,
                    endLineNumber: from$1287.token.lineNumber,
                    endLineStart: from$1287.token.lineStart
                }, to$1288);
            }
        } else {
            if (from$1287.token.type === parser$1251.Token.Delimiter) {
                next$1289 = syntaxFromToken$1255({
                    value: to$1288.token.value,
                    type: to$1288.token.type,
                    lineNumber: from$1287.token.startLineNumber,
                    lineStart: from$1287.token.startLineStart,
                    range: from$1287.token.startRange
                }, to$1288);
            } else {
                next$1289 = syntaxFromToken$1255({
                    value: to$1288.token.value,
                    type: to$1288.token.type,
                    lineNumber: from$1287.token.lineNumber,
                    lineStart: from$1287.token.lineStart,
                    range: from$1287.token.range
                }, to$1288);
            }
        }
        if (to$1288.token.leadingComments) {
            next$1289.token.leadingComments = to$1288.token.leadingComments;
        }
        if (to$1288.token.trailingComments) {
            next$1289.token.trailingComments = to$1288.token.trailingComments;
        }
        return next$1289;
    }
    function loadPattern$1267(patterns$1290) {
        return _$1249.chain(patterns$1290).reduce(function (acc$1291, patStx$1292, idx$1293) {
            var last$1294 = patterns$1290[idx$1293 - 1];
            var lastLast$1295 = patterns$1290[idx$1293 - 2];
            var next$1296 = patterns$1290[idx$1293 + 1];
            var nextNext$1297 = patterns$1290[idx$1293 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1292.token.value === ':') {
                if (last$1294 && isPatternVar$1263(last$1294) && !isPatternVar$1263(next$1296)) {
                    return acc$1291;
                }
            }
            if (last$1294 && last$1294.token.value === ':') {
                if (lastLast$1295 && isPatternVar$1263(lastLast$1295) && !isPatternVar$1263(patStx$1292)) {
                    return acc$1291;
                }
            }
            // skip over $
            if (patStx$1292.token.value === '$' && next$1296 && next$1296.token.type === parser$1251.Token.Delimiter) {
                return acc$1291;
            }
            if (isPatternVar$1263(patStx$1292)) {
                if (next$1296 && next$1296.token.value === ':' && !isPatternVar$1263(nextNext$1297)) {
                    if (typeof nextNext$1297 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1292.class = nextNext$1297.token.value;
                } else {
                    patStx$1292.class = 'token';
                }
            } else if (patStx$1292.token.type === parser$1251.Token.Delimiter) {
                if (last$1294 && last$1294.token.value === '$') {
                    patStx$1292.class = 'pattern_group';
                }
                patStx$1292.token.inner = loadPattern$1267(patStx$1292.token.inner);
            } else {
                patStx$1292.class = 'pattern_literal';
            }
            return acc$1291.concat(patStx$1292);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1298, patStx$1299, idx$1300, patterns$1301) {
            var separator$1302 = ' ';
            var repeat$1303 = false;
            var next$1304 = patterns$1301[idx$1300 + 1];
            var nextNext$1305 = patterns$1301[idx$1300 + 2];
            if (next$1304 && next$1304.token.value === '...') {
                repeat$1303 = true;
                separator$1302 = ' ';
            } else if (delimIsSeparator$1262(next$1304) && nextNext$1305 && nextNext$1305.token.value === '...') {
                repeat$1303 = true;
                parser$1251.assert(next$1304.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1302 = next$1304.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1299.token.value === '...' || delimIsSeparator$1262(patStx$1299) && next$1304 && next$1304.token.value === '...') {
                return acc$1298;
            }
            patStx$1299.repeat = repeat$1303;
            patStx$1299.separator = separator$1302;
            return acc$1298.concat(patStx$1299);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1268(patternClass$1306, stx$1307, env$1308) {
        var result$1309, rest$1310;
        // pattern has no parse class
        if (patternClass$1306 === 'token' && stx$1307[0] && stx$1307[0].token.type !== parser$1251.Token.EOF) {
            result$1309 = [stx$1307[0]];
            rest$1310 = stx$1307.slice(1);
        } else if (patternClass$1306 === 'lit' && stx$1307[0] && typeIsLiteral$1260(stx$1307[0].token.type)) {
            result$1309 = [stx$1307[0]];
            rest$1310 = stx$1307.slice(1);
        } else if (patternClass$1306 === 'ident' && stx$1307[0] && stx$1307[0].token.type === parser$1251.Token.Identifier) {
            result$1309 = [stx$1307[0]];
            rest$1310 = stx$1307.slice(1);
        } else if (stx$1307.length > 0 && patternClass$1306 === 'VariableStatement') {
            var match$1311 = expander$1252.enforest(stx$1307, expander$1252.makeExpanderContext({ env: env$1308 }));
            if (match$1311.result && match$1311.result.hasPrototype(expander$1252.VariableStatement)) {
                result$1309 = match$1311.result.destruct(false);
                rest$1310 = match$1311.rest;
            } else {
                result$1309 = null;
                rest$1310 = stx$1307;
            }
        } else if (stx$1307.length > 0 && patternClass$1306 === 'expr') {
            var match$1311 = expander$1252.get_expression(stx$1307, expander$1252.makeExpanderContext({ env: env$1308 }));
            if (match$1311.result === null || !match$1311.result.hasPrototype(expander$1252.Expr)) {
                result$1309 = null;
                rest$1310 = stx$1307;
            } else {
                result$1309 = match$1311.result.destruct(false);
                rest$1310 = match$1311.rest;
            }
        } else {
            result$1309 = null;
            rest$1310 = stx$1307;
        }
        return {
            result: result$1309,
            rest: rest$1310
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1269(patterns$1312, stx$1313, env$1314, topLevel$1315) {
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
        topLevel$1315 = topLevel$1315 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1316 = [];
        var patternEnv$1317 = {};
        var match$1318;
        var pattern$1319;
        var rest$1320 = stx$1313;
        var success$1321 = true;
        for (var i$1322 = 0; i$1322 < patterns$1312.length; i$1322++) {
            if (success$1321 === false) {
                break;
            }
            pattern$1319 = patterns$1312[i$1322];
            do {
                match$1318 = matchPattern$1270(pattern$1319, rest$1320, env$1314, patternEnv$1317);
                if (!match$1318.success && pattern$1319.repeat) {
                    // a repeat can match zero tokens and still be a
                    // "success" so break out of the inner loop and
                    // try the next pattern
                    break;
                }
                if (!match$1318.success) {
                    success$1321 = false;
                    break;
                }
                rest$1320 = match$1318.rest;
                patternEnv$1317 = match$1318.patternEnv;
                if (success$1321 && !(topLevel$1315 || pattern$1319.repeat)) {
                    // the very last pattern matched, inside a
                    // delimiter, not a repeat, *and* there are more
                    // unmatched bits of syntax
                    if (i$1322 == patterns$1312.length - 1 && rest$1320.length !== 0) {
                        success$1321 = false;
                        break;
                    }
                }
                if (pattern$1319.repeat && success$1321) {
                    if (rest$1320[0] && rest$1320[0].token.value === pattern$1319.separator) {
                        // more tokens and the next token matches the separator
                        rest$1320 = rest$1320.slice(1);
                    } else if (pattern$1319.separator === ' ') {
                        // no separator specified (using the empty string for this)
                        // so keep going
                        continue;
                    } else if (pattern$1319.separator !== ' ' && rest$1320.length > 0 && i$1322 === patterns$1312.length - 1 && topLevel$1315 === false) {
                        // separator is specified, there is a next token, the
                        // next token doesn't match the separator, there are
                        // no more patterns, and this is a top level pattern
                        // so the match has failed
                        success$1321 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$1319.repeat && success$1321 && rest$1320.length > 0);
        }
        return {
            success: success$1321,
            rest: rest$1320,
            patternEnv: patternEnv$1317
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
    function matchPattern$1270(pattern$1323, stx$1324, env$1325, patternEnv$1326) {
        var subMatch$1327;
        var match$1328, matchEnv$1329;
        var rest$1330;
        var success$1331;
        if (typeof pattern$1323.inner !== 'undefined') {
            if (pattern$1323.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1327 = matchPatterns$1269(pattern$1323.inner, stx$1324, env$1325, true);
                rest$1330 = subMatch$1327.rest;
            } else if (stx$1324[0] && stx$1324[0].token.type === parser$1251.Token.Delimiter && stx$1324[0].token.value === pattern$1323.value) {
                stx$1324[0].expose();
                if (pattern$1323.inner.length === 0 && stx$1324[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1324,
                        patternEnv: patternEnv$1326
                    };
                }
                subMatch$1327 = matchPatterns$1269(pattern$1323.inner, stx$1324[0].token.inner, env$1325, false);
                rest$1330 = stx$1324.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1324,
                    patternEnv: patternEnv$1326
                };
            }
            success$1331 = subMatch$1327.success;
            // merge the subpattern matches with the current pattern environment
            _$1249.keys(subMatch$1327.patternEnv).forEach(function (patternKey$1332) {
                if (pattern$1323.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1333 = subMatch$1327.patternEnv[patternKey$1332].level + 1;
                    if (patternEnv$1326[patternKey$1332]) {
                        patternEnv$1326[patternKey$1332].level = nextLevel$1333;
                        patternEnv$1326[patternKey$1332].match.push(subMatch$1327.patternEnv[patternKey$1332]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1326[patternKey$1332] = {
                            level: nextLevel$1333,
                            match: [subMatch$1327.patternEnv[patternKey$1332]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1326[patternKey$1332] = subMatch$1327.patternEnv[patternKey$1332];
                }
            });
        } else {
            if (pattern$1323.class === 'pattern_literal') {
                // wildcard
                if (stx$1324[0] && pattern$1323.value === '_') {
                    success$1331 = true;
                    rest$1330 = stx$1324.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1324[0] && pattern$1323.value === stx$1324[0].token.value) {
                    success$1331 = true;
                    rest$1330 = stx$1324.slice(1);
                } else {
                    success$1331 = false;
                    rest$1330 = stx$1324;
                }
            } else {
                match$1328 = matchPatternClass$1268(pattern$1323.class, stx$1324, env$1325);
                success$1331 = match$1328.result !== null;
                rest$1330 = match$1328.rest;
                matchEnv$1329 = {
                    level: 0,
                    match: match$1328.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1323.repeat) {
                    if (patternEnv$1326[pattern$1323.value]) {
                        patternEnv$1326[pattern$1323.value].match.push(matchEnv$1329);
                    } else {
                        // initialize if necessary
                        patternEnv$1326[pattern$1323.value] = {
                            level: 1,
                            match: [matchEnv$1329]
                        };
                    }
                } else {
                    patternEnv$1326[pattern$1323.value] = matchEnv$1329;
                }
            }
        }
        return {
            success: success$1331,
            rest: rest$1330,
            patternEnv: patternEnv$1326
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1271(macroBody$1334, macroNameStx$1335, env$1336) {
        return _$1249.chain(macroBody$1334).reduce(function (acc$1337, bodyStx$1338, idx$1339, original$1340) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1341 = original$1340[idx$1339 - 1];
            var next$1342 = original$1340[idx$1339 + 1];
            var nextNext$1343 = original$1340[idx$1339 + 2];
            // drop `...`
            if (bodyStx$1338.token.value === '...') {
                return acc$1337;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1262(bodyStx$1338) && next$1342 && next$1342.token.value === '...') {
                return acc$1337;
            }
            // skip the $ in $(...)
            if (bodyStx$1338.token.value === '$' && next$1342 && next$1342.token.type === parser$1251.Token.Delimiter && next$1342.token.value === '()') {
                return acc$1337;
            }
            // mark $[...] as a literal
            if (bodyStx$1338.token.value === '$' && next$1342 && next$1342.token.type === parser$1251.Token.Delimiter && next$1342.token.value === '[]') {
                next$1342.literal = true;
                return acc$1337;
            }
            if (bodyStx$1338.token.type === parser$1251.Token.Delimiter && bodyStx$1338.token.value === '()' && last$1341 && last$1341.token.value === '$') {
                bodyStx$1338.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1338.literal === true) {
                parser$1251.assert(bodyStx$1338.token.type === parser$1251.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1337.concat(bodyStx$1338.token.inner);
            }
            if (next$1342 && next$1342.token.value === '...') {
                bodyStx$1338.repeat = true;
                bodyStx$1338.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1262(next$1342) && nextNext$1343 && nextNext$1343.token.value === '...') {
                bodyStx$1338.repeat = true;
                bodyStx$1338.separator = next$1342.token.inner[0].token.value;
            }
            return acc$1337.concat(bodyStx$1338);
        }, []).reduce(function (acc$1344, bodyStx$1345, idx$1346) {
            // then do the actual transcription
            if (bodyStx$1345.repeat) {
                if (bodyStx$1345.token.type === parser$1251.Token.Delimiter) {
                    bodyStx$1345.expose();
                    var fv$1347 = _$1249.filter(freeVarsInPattern$1259(bodyStx$1345.token.inner), function (pat$1354) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1336.hasOwnProperty(pat$1354);
                        });
                    var restrictedEnv$1348 = [];
                    var nonScalar$1349 = _$1249.find(fv$1347, function (pat$1355) {
                            return env$1336[pat$1355].level > 0;
                        });
                    parser$1251.assert(typeof nonScalar$1349 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1350 = env$1336[nonScalar$1349].match.length;
                    var sameLength$1351 = _$1249.all(fv$1347, function (pat$1356) {
                            return env$1336[pat$1356].level === 0 || env$1336[pat$1356].match.length === repeatLength$1350;
                        });
                    parser$1251.assert(sameLength$1351, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1348 = _$1249.map(_$1249.range(repeatLength$1350), function (idx$1357) {
                        var renv$1358 = {};
                        _$1249.each(fv$1347, function (pat$1359) {
                            if (env$1336[pat$1359].level === 0) {
                                // copy scalars over
                                renv$1358[pat$1359] = env$1336[pat$1359];
                            } else {
                                // grab the match at this index
                                renv$1358[pat$1359] = env$1336[pat$1359].match[idx$1357];
                            }
                        });
                        return renv$1358;
                    });
                    var transcribed$1352 = _$1249.map(restrictedEnv$1348, function (renv$1360) {
                            if (bodyStx$1345.group) {
                                return transcribe$1271(bodyStx$1345.token.inner, macroNameStx$1335, renv$1360);
                            } else {
                                var newBody$1361 = syntaxFromToken$1255(_$1249.clone(bodyStx$1345.token), bodyStx$1345);
                                newBody$1361.token.inner = transcribe$1271(bodyStx$1345.token.inner, macroNameStx$1335, renv$1360);
                                return newBody$1361;
                            }
                        });
                    var joined$1353;
                    if (bodyStx$1345.group) {
                        joined$1353 = joinSyntaxArr$1258(transcribed$1352, bodyStx$1345.separator);
                    } else {
                        joined$1353 = joinSyntax$1257(transcribed$1352, bodyStx$1345.separator);
                    }
                    return acc$1344.concat(joined$1353);
                }
                if (!env$1336[bodyStx$1345.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1345.token.value + ' is not bound for the template');
                } else if (env$1336[bodyStx$1345.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1345.token.value + ' does not match in the template');
                }
                return acc$1344.concat(joinRepeatedMatch$1264(env$1336[bodyStx$1345.token.value].match, bodyStx$1345.separator));
            } else {
                if (bodyStx$1345.token.type === parser$1251.Token.Delimiter) {
                    bodyStx$1345.expose();
                    var newBody$1362 = syntaxFromToken$1255(_$1249.clone(bodyStx$1345.token), macroBody$1334);
                    newBody$1362.token.inner = transcribe$1271(bodyStx$1345.token.inner, macroNameStx$1335, env$1336);
                    return acc$1344.concat([newBody$1362]);
                }
                if (isPatternVar$1263(bodyStx$1345) && Object.prototype.hasOwnProperty.bind(env$1336)(bodyStx$1345.token.value)) {
                    if (!env$1336[bodyStx$1345.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1345.token.value + ' is not bound for the template');
                    } else if (env$1336[bodyStx$1345.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1345.token.value + ' does not match in the template');
                    }
                    return acc$1344.concat(env$1336[bodyStx$1345.token.value].match);
                }
                return acc$1344.concat([bodyStx$1345]);
            }
        }, []).value();
    }
    exports$1248.loadPattern = loadPattern$1267;
    exports$1248.matchPatterns = matchPatterns$1269;
    exports$1248.transcribe = transcribe$1271;
    exports$1248.matchPatternClass = matchPatternClass$1268;
    exports$1248.takeLineContext = takeLineContext$1265;
    exports$1248.takeLine = takeLine$1266;
}));
//# sourceMappingURL=patterns.js.map