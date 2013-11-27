(function (root$1250, factory$1251) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1251(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1251);
    }
}(this, function (exports$1252, _$1253, es6$1254, parser$1255, expander$1256, syntax$1257) {
    var get_expression$1258 = expander$1256.get_expression;
    var syntaxFromToken$1259 = syntax$1257.syntaxFromToken;
    var makePunc$1260 = syntax$1257.makePunc;
    var joinSyntax$1261 = syntax$1257.joinSyntax;
    var joinSyntaxArr$1262 = syntax$1257.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1263(pattern$1276) {
        var fv$1277 = [];
        _$1253.each(pattern$1276, function (pat$1278) {
            if (isPatternVar$1267(pat$1278)) {
                fv$1277.push(pat$1278.token.value);
            } else if (pat$1278.token.type === parser$1255.Token.Delimiter) {
                fv$1277 = fv$1277.concat(freeVarsInPattern$1263(pat$1278.token.inner));
            }
        });
        return fv$1277;
    }
    function typeIsLiteral$1264(type$1279) {
        return type$1279 === parser$1255.Token.NullLiteral || type$1279 === parser$1255.Token.NumericLiteral || type$1279 === parser$1255.Token.StringLiteral || type$1279 === parser$1255.Token.RegexLiteral || type$1279 === parser$1255.Token.BooleanLiteral;
    }
    function containsPatternVar$1265(patterns$1280) {
        return _$1253.any(patterns$1280, function (pat$1281) {
            if (pat$1281.token.type === parser$1255.Token.Delimiter) {
                return containsPatternVar$1265(pat$1281.token.inner);
            }
            return isPatternVar$1267(pat$1281);
        });
    }
    function delimIsSeparator$1266(delim$1282) {
        return delim$1282 && delim$1282.token && delim$1282.token.type === parser$1255.Token.Delimiter && delim$1282.token.value === '()' && delim$1282.token.inner.length === 1 && delim$1282.token.inner[0].token.type !== parser$1255.Token.Delimiter && !containsPatternVar$1265(delim$1282.token.inner);
    }
    function isPatternVar$1267(stx$1283) {
        return stx$1283.token.value[0] === '$' && stx$1283.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1268(tojoin$1284, punc$1285) {
        return _$1253.reduce(_$1253.rest(tojoin$1284, 1), function (acc$1286, join$1287) {
            if (punc$1285 === ' ') {
                return acc$1286.concat(join$1287.match);
            }
            return acc$1286.concat(makePunc$1260(punc$1285, _$1253.first(join$1287.match)), join$1287.match);
        }, _$1253.first(tojoin$1284).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1269(from$1288, to$1289) {
        return _$1253.map(to$1289, function (stx$1290) {
            return takeLine$1270(from$1288, stx$1290);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1270(from$1291, to$1292) {
        if (to$1292.token.type === parser$1255.Token.Delimiter) {
            var next$1293;
            if (from$1291.token.type === parser$1255.Token.Delimiter) {
                next$1293 = syntaxFromToken$1259({
                    type: parser$1255.Token.Delimiter,
                    value: to$1292.token.value,
                    inner: takeLineContext$1269(from$1291, to$1292.token.inner),
                    startRange: from$1291.token.startRange,
                    endRange: from$1291.token.endRange,
                    startLineNumber: from$1291.token.startLineNumber,
                    startLineStart: from$1291.token.startLineStart,
                    endLineNumber: from$1291.token.endLineNumber,
                    endLineStart: from$1291.token.endLineStart
                }, to$1292);
            } else {
                next$1293 = syntaxFromToken$1259({
                    type: parser$1255.Token.Delimiter,
                    value: to$1292.token.value,
                    inner: takeLineContext$1269(from$1291, to$1292.token.inner),
                    startRange: from$1291.token.range,
                    endRange: from$1291.token.range,
                    startLineNumber: from$1291.token.lineNumber,
                    startLineStart: from$1291.token.lineStart,
                    endLineNumber: from$1291.token.lineNumber,
                    endLineStart: from$1291.token.lineStart
                }, to$1292);
            }
        } else {
            if (from$1291.token.type === parser$1255.Token.Delimiter) {
                next$1293 = syntaxFromToken$1259({
                    value: to$1292.token.value,
                    type: to$1292.token.type,
                    lineNumber: from$1291.token.startLineNumber,
                    lineStart: from$1291.token.startLineStart,
                    range: from$1291.token.startRange
                }, to$1292);
            } else {
                next$1293 = syntaxFromToken$1259({
                    value: to$1292.token.value,
                    type: to$1292.token.type,
                    lineNumber: from$1291.token.lineNumber,
                    lineStart: from$1291.token.lineStart,
                    range: from$1291.token.range
                }, to$1292);
            }
        }
        if (to$1292.token.leadingComments) {
            next$1293.token.leadingComments = to$1292.token.leadingComments;
        }
        if (to$1292.token.trailingComments) {
            next$1293.token.trailingComments = to$1292.token.trailingComments;
        }
        return next$1293;
    }
    function loadPattern$1271(patterns$1294) {
        return _$1253.chain(patterns$1294).reduce(function (acc$1295, patStx$1296, idx$1297) {
            var last$1298 = patterns$1294[idx$1297 - 1];
            var lastLast$1299 = patterns$1294[idx$1297 - 2];
            var next$1300 = patterns$1294[idx$1297 + 1];
            var nextNext$1301 = patterns$1294[idx$1297 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1296.token.value === ':') {
                if (last$1298 && isPatternVar$1267(last$1298) && !isPatternVar$1267(next$1300)) {
                    return acc$1295;
                }
            }
            if (last$1298 && last$1298.token.value === ':') {
                if (lastLast$1299 && isPatternVar$1267(lastLast$1299) && !isPatternVar$1267(patStx$1296)) {
                    return acc$1295;
                }
            }
            // skip over $
            if (patStx$1296.token.value === '$' && next$1300 && next$1300.token.type === parser$1255.Token.Delimiter) {
                return acc$1295;
            }
            if (isPatternVar$1267(patStx$1296)) {
                if (next$1300 && next$1300.token.value === ':' && !isPatternVar$1267(nextNext$1301)) {
                    if (typeof nextNext$1301 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1296.class = nextNext$1301.token.value;
                } else {
                    patStx$1296.class = 'token';
                }
            } else if (patStx$1296.token.type === parser$1255.Token.Delimiter) {
                if (last$1298 && last$1298.token.value === '$') {
                    patStx$1296.class = 'pattern_group';
                }
                patStx$1296.token.inner = loadPattern$1271(patStx$1296.token.inner);
            } else {
                patStx$1296.class = 'pattern_literal';
            }
            return acc$1295.concat(patStx$1296);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1302, patStx$1303, idx$1304, patterns$1305) {
            var separator$1306 = ' ';
            var repeat$1307 = false;
            var next$1308 = patterns$1305[idx$1304 + 1];
            var nextNext$1309 = patterns$1305[idx$1304 + 2];
            if (next$1308 && next$1308.token.value === '...') {
                repeat$1307 = true;
                separator$1306 = ' ';
            } else if (delimIsSeparator$1266(next$1308) && nextNext$1309 && nextNext$1309.token.value === '...') {
                repeat$1307 = true;
                parser$1255.assert(next$1308.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1306 = next$1308.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1303.token.value === '...' || delimIsSeparator$1266(patStx$1303) && next$1308 && next$1308.token.value === '...') {
                return acc$1302;
            }
            patStx$1303.repeat = repeat$1307;
            patStx$1303.separator = separator$1306;
            return acc$1302.concat(patStx$1303);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1272(patternClass$1310, stx$1311, env$1312) {
        var result$1313, rest$1314;
        // pattern has no parse class
        if (patternClass$1310 === 'token' && stx$1311[0] && stx$1311[0].token.type !== parser$1255.Token.EOF) {
            result$1313 = [stx$1311[0]];
            rest$1314 = stx$1311.slice(1);
        } else if (patternClass$1310 === 'lit' && stx$1311[0] && typeIsLiteral$1264(stx$1311[0].token.type)) {
            result$1313 = [stx$1311[0]];
            rest$1314 = stx$1311.slice(1);
        } else if (patternClass$1310 === 'ident' && stx$1311[0] && stx$1311[0].token.type === parser$1255.Token.Identifier) {
            result$1313 = [stx$1311[0]];
            rest$1314 = stx$1311.slice(1);
        } else if (stx$1311.length > 0 && patternClass$1310 === 'VariableStatement') {
            var match$1315 = expander$1256.enforest(stx$1311, expander$1256.makeExpanderContext({ env: env$1312 }));
            if (match$1315.result && match$1315.result.hasPrototype(expander$1256.VariableStatement)) {
                result$1313 = match$1315.result.destruct(false);
                rest$1314 = match$1315.rest;
            } else {
                result$1313 = null;
                rest$1314 = stx$1311;
            }
        } else if (stx$1311.length > 0 && patternClass$1310 === 'expr') {
            var match$1315 = expander$1256.get_expression(stx$1311, expander$1256.makeExpanderContext({ env: env$1312 }));
            if (match$1315.result === null || !match$1315.result.hasPrototype(expander$1256.Expr)) {
                result$1313 = null;
                rest$1314 = stx$1311;
            } else {
                result$1313 = match$1315.result.destruct(false);
                rest$1314 = match$1315.rest;
            }
        } else {
            result$1313 = null;
            rest$1314 = stx$1311;
        }
        return {
            result: result$1313,
            rest: rest$1314
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1273(patterns$1316, stx$1317, env$1318, topLevel$1319) {
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
        topLevel$1319 = topLevel$1319 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1320 = [];
        var patternEnv$1321 = {};
        var match$1322;
        var pattern$1323;
        var rest$1324 = stx$1317;
        var success$1325 = true;
        patternLoop:
            for (var i$1326 = 0; i$1326 < patterns$1316.length; i$1326++) {
                if (success$1325 === false) {
                    break;
                }
                pattern$1323 = patterns$1316[i$1326];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1323.repeat && i$1326 + 1 < patterns$1316.length) {
                        var restMatch$1327 = matchPatterns$1273(patterns$1316.slice(i$1326 + 1), rest$1324, env$1318, topLevel$1319);
                        if (restMatch$1327.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1322 = matchPattern$1274(pattern$1323, [], env$1318, patternEnv$1321);
                            patternEnv$1321 = _$1253.extend(restMatch$1327.patternEnv, match$1322.patternEnv);
                            rest$1324 = restMatch$1327.rest;
                            break patternLoop;
                        }
                    }
                    match$1322 = matchPattern$1274(pattern$1323, rest$1324, env$1318, patternEnv$1321);
                    if (!match$1322.success && pattern$1323.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1322.success) {
                        success$1325 = false;
                        break;
                    }
                    rest$1324 = match$1322.rest;
                    patternEnv$1321 = match$1322.patternEnv;
                    if (success$1325 && !(topLevel$1319 || pattern$1323.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1326 == patterns$1316.length - 1 && rest$1324.length !== 0) {
                            success$1325 = false;
                            break;
                        }
                    }
                    if (pattern$1323.repeat && success$1325) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (rest$1324[0] && rest$1324[0].token.value === pattern$1323.separator) {
                            // more tokens and the next token matches the separator
                            rest$1324 = rest$1324.slice(1);
                        } else if (pattern$1323.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (pattern$1323.separator !== ' ' && rest$1324.length > 0 && i$1326 === patterns$1316.length - 1 && topLevel$1319 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1325 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1323.repeat && success$1325 && rest$1324.length > 0);
            }
        return {
            success: success$1325,
            rest: rest$1324,
            patternEnv: patternEnv$1321
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
    function matchPattern$1274(pattern$1328, stx$1329, env$1330, patternEnv$1331) {
        var subMatch$1332;
        var match$1333, matchEnv$1334;
        var rest$1335;
        var success$1336;
        if (typeof pattern$1328.inner !== 'undefined') {
            if (pattern$1328.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1332 = matchPatterns$1273(pattern$1328.inner, stx$1329, env$1330, true);
                rest$1335 = subMatch$1332.rest;
            } else if (stx$1329[0] && stx$1329[0].token.type === parser$1255.Token.Delimiter && stx$1329[0].token.value === pattern$1328.value) {
                stx$1329[0].expose();
                if (pattern$1328.inner.length === 0 && stx$1329[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1329,
                        patternEnv: patternEnv$1331
                    };
                }
                subMatch$1332 = matchPatterns$1273(pattern$1328.inner, stx$1329[0].token.inner, env$1330, false);
                rest$1335 = stx$1329.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1329,
                    patternEnv: patternEnv$1331
                };
            }
            success$1336 = subMatch$1332.success;
            // merge the subpattern matches with the current pattern environment
            _$1253.keys(subMatch$1332.patternEnv).forEach(function (patternKey$1337) {
                if (pattern$1328.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1338 = subMatch$1332.patternEnv[patternKey$1337].level + 1;
                    if (patternEnv$1331[patternKey$1337]) {
                        patternEnv$1331[patternKey$1337].level = nextLevel$1338;
                        patternEnv$1331[patternKey$1337].match.push(subMatch$1332.patternEnv[patternKey$1337]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1331[patternKey$1337] = {
                            level: nextLevel$1338,
                            match: [subMatch$1332.patternEnv[patternKey$1337]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1331[patternKey$1337] = subMatch$1332.patternEnv[patternKey$1337];
                }
            });
        } else {
            if (pattern$1328.class === 'pattern_literal') {
                // wildcard
                if (stx$1329[0] && pattern$1328.value === '_') {
                    success$1336 = true;
                    rest$1335 = stx$1329.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1329[0] && pattern$1328.value === stx$1329[0].token.value) {
                    success$1336 = true;
                    rest$1335 = stx$1329.slice(1);
                } else {
                    success$1336 = false;
                    rest$1335 = stx$1329;
                }
            } else {
                match$1333 = matchPatternClass$1272(pattern$1328.class, stx$1329, env$1330);
                success$1336 = match$1333.result !== null;
                rest$1335 = match$1333.rest;
                matchEnv$1334 = {
                    level: 0,
                    match: match$1333.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1328.repeat) {
                    if (patternEnv$1331[pattern$1328.value]) {
                        patternEnv$1331[pattern$1328.value].match.push(matchEnv$1334);
                    } else {
                        // initialize if necessary
                        patternEnv$1331[pattern$1328.value] = {
                            level: 1,
                            match: [matchEnv$1334]
                        };
                    }
                } else {
                    patternEnv$1331[pattern$1328.value] = matchEnv$1334;
                }
            }
        }
        return {
            success: success$1336,
            rest: rest$1335,
            patternEnv: patternEnv$1331
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1275(macroBody$1339, macroNameStx$1340, env$1341) {
        return _$1253.chain(macroBody$1339).reduce(function (acc$1342, bodyStx$1343, idx$1344, original$1345) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1346 = original$1345[idx$1344 - 1];
            var next$1347 = original$1345[idx$1344 + 1];
            var nextNext$1348 = original$1345[idx$1344 + 2];
            // drop `...`
            if (bodyStx$1343.token.value === '...') {
                return acc$1342;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1266(bodyStx$1343) && next$1347 && next$1347.token.value === '...') {
                return acc$1342;
            }
            // skip the $ in $(...)
            if (bodyStx$1343.token.value === '$' && next$1347 && next$1347.token.type === parser$1255.Token.Delimiter && next$1347.token.value === '()') {
                return acc$1342;
            }
            // mark $[...] as a literal
            if (bodyStx$1343.token.value === '$' && next$1347 && next$1347.token.type === parser$1255.Token.Delimiter && next$1347.token.value === '[]') {
                next$1347.literal = true;
                return acc$1342;
            }
            if (bodyStx$1343.token.type === parser$1255.Token.Delimiter && bodyStx$1343.token.value === '()' && last$1346 && last$1346.token.value === '$') {
                bodyStx$1343.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1343.literal === true) {
                parser$1255.assert(bodyStx$1343.token.type === parser$1255.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1342.concat(bodyStx$1343.token.inner);
            }
            if (next$1347 && next$1347.token.value === '...') {
                bodyStx$1343.repeat = true;
                bodyStx$1343.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1266(next$1347) && nextNext$1348 && nextNext$1348.token.value === '...') {
                bodyStx$1343.repeat = true;
                bodyStx$1343.separator = next$1347.token.inner[0].token.value;
            }
            return acc$1342.concat(bodyStx$1343);
        }, []).reduce(function (acc$1349, bodyStx$1350, idx$1351) {
            // then do the actual transcription
            if (bodyStx$1350.repeat) {
                if (bodyStx$1350.token.type === parser$1255.Token.Delimiter) {
                    bodyStx$1350.expose();
                    var fv$1352 = _$1253.filter(freeVarsInPattern$1263(bodyStx$1350.token.inner), function (pat$1359) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1341.hasOwnProperty(pat$1359);
                        });
                    var restrictedEnv$1353 = [];
                    var nonScalar$1354 = _$1253.find(fv$1352, function (pat$1360) {
                            return env$1341[pat$1360].level > 0;
                        });
                    parser$1255.assert(typeof nonScalar$1354 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1355 = env$1341[nonScalar$1354].match.length;
                    var sameLength$1356 = _$1253.all(fv$1352, function (pat$1361) {
                            return env$1341[pat$1361].level === 0 || env$1341[pat$1361].match.length === repeatLength$1355;
                        });
                    parser$1255.assert(sameLength$1356, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1353 = _$1253.map(_$1253.range(repeatLength$1355), function (idx$1362) {
                        var renv$1363 = {};
                        _$1253.each(fv$1352, function (pat$1364) {
                            if (env$1341[pat$1364].level === 0) {
                                // copy scalars over
                                renv$1363[pat$1364] = env$1341[pat$1364];
                            } else {
                                // grab the match at this index
                                renv$1363[pat$1364] = env$1341[pat$1364].match[idx$1362];
                            }
                        });
                        return renv$1363;
                    });
                    var transcribed$1357 = _$1253.map(restrictedEnv$1353, function (renv$1365) {
                            if (bodyStx$1350.group) {
                                return transcribe$1275(bodyStx$1350.token.inner, macroNameStx$1340, renv$1365);
                            } else {
                                var newBody$1366 = syntaxFromToken$1259(_$1253.clone(bodyStx$1350.token), bodyStx$1350);
                                newBody$1366.token.inner = transcribe$1275(bodyStx$1350.token.inner, macroNameStx$1340, renv$1365);
                                return newBody$1366;
                            }
                        });
                    var joined$1358;
                    if (bodyStx$1350.group) {
                        joined$1358 = joinSyntaxArr$1262(transcribed$1357, bodyStx$1350.separator);
                    } else {
                        joined$1358 = joinSyntax$1261(transcribed$1357, bodyStx$1350.separator);
                    }
                    return acc$1349.concat(joined$1358);
                }
                if (!env$1341[bodyStx$1350.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1350.token.value + ' is not bound for the template');
                } else if (env$1341[bodyStx$1350.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1350.token.value + ' does not match in the template');
                }
                return acc$1349.concat(joinRepeatedMatch$1268(env$1341[bodyStx$1350.token.value].match, bodyStx$1350.separator));
            } else {
                if (bodyStx$1350.token.type === parser$1255.Token.Delimiter) {
                    bodyStx$1350.expose();
                    var newBody$1367 = syntaxFromToken$1259(_$1253.clone(bodyStx$1350.token), macroBody$1339);
                    newBody$1367.token.inner = transcribe$1275(bodyStx$1350.token.inner, macroNameStx$1340, env$1341);
                    return acc$1349.concat([newBody$1367]);
                }
                if (isPatternVar$1267(bodyStx$1350) && Object.prototype.hasOwnProperty.bind(env$1341)(bodyStx$1350.token.value)) {
                    if (!env$1341[bodyStx$1350.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1350.token.value + ' is not bound for the template');
                    } else if (env$1341[bodyStx$1350.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1350.token.value + ' does not match in the template');
                    }
                    return acc$1349.concat(env$1341[bodyStx$1350.token.value].match);
                }
                return acc$1349.concat([bodyStx$1350]);
            }
        }, []).value();
    }
    exports$1252.loadPattern = loadPattern$1271;
    exports$1252.matchPatterns = matchPatterns$1273;
    exports$1252.transcribe = transcribe$1275;
    exports$1252.matchPatternClass = matchPatternClass$1272;
    exports$1252.takeLineContext = takeLineContext$1269;
    exports$1252.takeLine = takeLine$1270;
}));