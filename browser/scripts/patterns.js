(function (root$1286, factory$1287) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1287(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1287);
    }
}(this, function (exports$1288, _$1289, es6$1290, parser$1291, expander$1292, syntax$1293) {
    var get_expression$1294 = expander$1292.get_expression;
    var syntaxFromToken$1295 = syntax$1293.syntaxFromToken;
    var makePunc$1296 = syntax$1293.makePunc;
    var joinSyntax$1297 = syntax$1293.joinSyntax;
    var joinSyntaxArr$1298 = syntax$1293.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1299(pattern$1312) {
        var fv$1313 = [];
        _$1289.each(pattern$1312, function (pat$1314) {
            if (isPatternVar$1303(pat$1314)) {
                fv$1313.push(pat$1314.token.value);
            } else if (pat$1314.token.type === parser$1291.Token.Delimiter) {
                fv$1313 = fv$1313.concat(freeVarsInPattern$1299(pat$1314.token.inner));
            }
        });
        return fv$1313;
    }
    function typeIsLiteral$1300(type$1315) {
        return type$1315 === parser$1291.Token.NullLiteral || type$1315 === parser$1291.Token.NumericLiteral || type$1315 === parser$1291.Token.StringLiteral || type$1315 === parser$1291.Token.RegexLiteral || type$1315 === parser$1291.Token.BooleanLiteral;
    }
    function containsPatternVar$1301(patterns$1316) {
        return _$1289.any(patterns$1316, function (pat$1317) {
            if (pat$1317.token.type === parser$1291.Token.Delimiter) {
                return containsPatternVar$1301(pat$1317.token.inner);
            }
            return isPatternVar$1303(pat$1317);
        });
    }
    function delimIsSeparator$1302(delim$1318) {
        return delim$1318 && delim$1318.token && delim$1318.token.type === parser$1291.Token.Delimiter && delim$1318.token.value === '()' && delim$1318.token.inner.length === 1 && delim$1318.token.inner[0].token.type !== parser$1291.Token.Delimiter && !containsPatternVar$1301(delim$1318.token.inner);
    }
    function isPatternVar$1303(stx$1319) {
        return stx$1319.token.value[0] === '$' && stx$1319.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1304(tojoin$1320, punc$1321) {
        return _$1289.reduce(_$1289.rest(tojoin$1320, 1), function (acc$1322, join$1323) {
            if (punc$1321 === ' ') {
                return acc$1322.concat(join$1323.match);
            }
            return acc$1322.concat(makePunc$1296(punc$1321, _$1289.first(join$1323.match)), join$1323.match);
        }, _$1289.first(tojoin$1320).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1305(from$1324, to$1325) {
        return _$1289.map(to$1325, function (stx$1326) {
            return takeLine$1306(from$1324, stx$1326);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1306(from$1327, to$1328) {
        if (to$1328.token.type === parser$1291.Token.Delimiter) {
            var next$1329;
            if (from$1327.token.type === parser$1291.Token.Delimiter) {
                next$1329 = syntaxFromToken$1295({
                    type: parser$1291.Token.Delimiter,
                    value: to$1328.token.value,
                    inner: takeLineContext$1305(from$1327, to$1328.token.inner),
                    startRange: from$1327.token.startRange,
                    endRange: from$1327.token.endRange,
                    startLineNumber: from$1327.token.startLineNumber,
                    startLineStart: from$1327.token.startLineStart,
                    endLineNumber: from$1327.token.endLineNumber,
                    endLineStart: from$1327.token.endLineStart
                }, to$1328);
            } else {
                next$1329 = syntaxFromToken$1295({
                    type: parser$1291.Token.Delimiter,
                    value: to$1328.token.value,
                    inner: takeLineContext$1305(from$1327, to$1328.token.inner),
                    startRange: from$1327.token.range,
                    endRange: from$1327.token.range,
                    startLineNumber: from$1327.token.lineNumber,
                    startLineStart: from$1327.token.lineStart,
                    endLineNumber: from$1327.token.lineNumber,
                    endLineStart: from$1327.token.lineStart
                }, to$1328);
            }
        } else {
            if (from$1327.token.type === parser$1291.Token.Delimiter) {
                next$1329 = syntaxFromToken$1295({
                    value: to$1328.token.value,
                    type: to$1328.token.type,
                    lineNumber: from$1327.token.startLineNumber,
                    lineStart: from$1327.token.startLineStart,
                    range: from$1327.token.startRange
                }, to$1328);
            } else {
                next$1329 = syntaxFromToken$1295({
                    value: to$1328.token.value,
                    type: to$1328.token.type,
                    lineNumber: from$1327.token.lineNumber,
                    lineStart: from$1327.token.lineStart,
                    range: from$1327.token.range
                }, to$1328);
            }
        }
        if (to$1328.token.leadingComments) {
            next$1329.token.leadingComments = to$1328.token.leadingComments;
        }
        if (to$1328.token.trailingComments) {
            next$1329.token.trailingComments = to$1328.token.trailingComments;
        }
        return next$1329;
    }
    function loadPattern$1307(patterns$1330) {
        return _$1289.chain(patterns$1330).reduce(function (acc$1331, patStx$1332, idx$1333) {
            var last$1334 = patterns$1330[idx$1333 - 1];
            var lastLast$1335 = patterns$1330[idx$1333 - 2];
            var next$1336 = patterns$1330[idx$1333 + 1];
            var nextNext$1337 = patterns$1330[idx$1333 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1332.token.value === ':') {
                if (last$1334 && isPatternVar$1303(last$1334) && !isPatternVar$1303(next$1336)) {
                    return acc$1331;
                }
            }
            if (last$1334 && last$1334.token.value === ':') {
                if (lastLast$1335 && isPatternVar$1303(lastLast$1335) && !isPatternVar$1303(patStx$1332)) {
                    return acc$1331;
                }
            }
            // skip over $
            if (patStx$1332.token.value === '$' && next$1336 && next$1336.token.type === parser$1291.Token.Delimiter) {
                return acc$1331;
            }
            if (isPatternVar$1303(patStx$1332)) {
                if (next$1336 && next$1336.token.value === ':' && !isPatternVar$1303(nextNext$1337)) {
                    if (typeof nextNext$1337 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1332.class = nextNext$1337.token.value;
                } else {
                    patStx$1332.class = 'token';
                }
            } else if (patStx$1332.token.type === parser$1291.Token.Delimiter) {
                if (last$1334 && last$1334.token.value === '$') {
                    patStx$1332.class = 'pattern_group';
                }
                patStx$1332.token.inner = loadPattern$1307(patStx$1332.token.inner);
            } else {
                patStx$1332.class = 'pattern_literal';
            }
            return acc$1331.concat(patStx$1332);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1338, patStx$1339, idx$1340, patterns$1341) {
            var separator$1342 = ' ';
            var repeat$1343 = false;
            var next$1344 = patterns$1341[idx$1340 + 1];
            var nextNext$1345 = patterns$1341[idx$1340 + 2];
            if (next$1344 && next$1344.token.value === '...') {
                repeat$1343 = true;
                separator$1342 = ' ';
            } else if (delimIsSeparator$1302(next$1344) && nextNext$1345 && nextNext$1345.token.value === '...') {
                repeat$1343 = true;
                parser$1291.assert(next$1344.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1342 = next$1344.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1339.token.value === '...' || delimIsSeparator$1302(patStx$1339) && next$1344 && next$1344.token.value === '...') {
                return acc$1338;
            }
            patStx$1339.repeat = repeat$1343;
            patStx$1339.separator = separator$1342;
            return acc$1338.concat(patStx$1339);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1308(patternClass$1346, stx$1347, env$1348) {
        var result$1349, rest$1350;
        // pattern has no parse class
        if (patternClass$1346 === 'token' && stx$1347[0] && stx$1347[0].token.type !== parser$1291.Token.EOF) {
            result$1349 = [stx$1347[0]];
            rest$1350 = stx$1347.slice(1);
        } else if (patternClass$1346 === 'lit' && stx$1347[0] && typeIsLiteral$1300(stx$1347[0].token.type)) {
            result$1349 = [stx$1347[0]];
            rest$1350 = stx$1347.slice(1);
        } else if (patternClass$1346 === 'ident' && stx$1347[0] && stx$1347[0].token.type === parser$1291.Token.Identifier) {
            result$1349 = [stx$1347[0]];
            rest$1350 = stx$1347.slice(1);
        } else if (stx$1347.length > 0 && patternClass$1346 === 'VariableStatement') {
            var match$1351 = expander$1292.enforest(stx$1347, expander$1292.makeExpanderContext({ env: env$1348 }));
            if (match$1351.result && match$1351.result.hasPrototype(expander$1292.VariableStatement)) {
                result$1349 = match$1351.result.destruct(false);
                rest$1350 = match$1351.rest;
            } else {
                result$1349 = null;
                rest$1350 = stx$1347;
            }
        } else if (stx$1347.length > 0 && patternClass$1346 === 'expr') {
            var match$1351 = expander$1292.get_expression(stx$1347, expander$1292.makeExpanderContext({ env: env$1348 }));
            if (match$1351.result === null || !match$1351.result.hasPrototype(expander$1292.Expr)) {
                result$1349 = null;
                rest$1350 = stx$1347;
            } else {
                result$1349 = match$1351.result.destruct(false);
                rest$1350 = match$1351.rest;
            }
        } else {
            result$1349 = null;
            rest$1350 = stx$1347;
        }
        return {
            result: result$1349,
            rest: rest$1350
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1309(patterns$1352, stx$1353, env$1354, topLevel$1355) {
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
        topLevel$1355 = topLevel$1355 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1356 = [];
        var patternEnv$1357 = {};
        var match$1358;
        var pattern$1359;
        var rest$1360 = stx$1353;
        var success$1361 = true;
        patternLoop:
            for (var i$1362 = 0; i$1362 < patterns$1352.length; i$1362++) {
                if (success$1361 === false) {
                    break;
                }
                pattern$1359 = patterns$1352[i$1362];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1359.repeat && i$1362 + 1 < patterns$1352.length) {
                        var restMatch$1363 = matchPatterns$1309(patterns$1352.slice(i$1362 + 1), rest$1360, env$1354, topLevel$1355);
                        if (restMatch$1363.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1358 = matchPattern$1310(pattern$1359, [], env$1354, patternEnv$1357);
                            patternEnv$1357 = _$1289.extend(restMatch$1363.patternEnv, match$1358.patternEnv);
                            rest$1360 = restMatch$1363.rest;
                            break patternLoop;
                        }
                    }
                    match$1358 = matchPattern$1310(pattern$1359, rest$1360, env$1354, patternEnv$1357);
                    if (!match$1358.success && pattern$1359.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1358.success) {
                        success$1361 = false;
                        break;
                    }
                    rest$1360 = match$1358.rest;
                    patternEnv$1357 = match$1358.patternEnv;
                    if (success$1361 && !(topLevel$1355 || pattern$1359.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1362 == patterns$1352.length - 1 && rest$1360.length !== 0) {
                            success$1361 = false;
                            break;
                        }
                    }
                    if (pattern$1359.repeat && success$1361) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (rest$1360[0] && rest$1360[0].token.value === pattern$1359.separator) {
                            // more tokens and the next token matches the separator
                            rest$1360 = rest$1360.slice(1);
                        } else if (pattern$1359.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (pattern$1359.separator !== ' ' && rest$1360.length > 0 && i$1362 === patterns$1352.length - 1 && topLevel$1355 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1361 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1359.repeat && success$1361 && rest$1360.length > 0);
            }
        return {
            success: success$1361,
            rest: rest$1360,
            patternEnv: patternEnv$1357
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
    function matchPattern$1310(pattern$1364, stx$1365, env$1366, patternEnv$1367) {
        var subMatch$1368;
        var match$1369, matchEnv$1370;
        var rest$1371;
        var success$1372;
        if (typeof pattern$1364.inner !== 'undefined') {
            if (pattern$1364.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1368 = matchPatterns$1309(pattern$1364.inner, stx$1365, env$1366, true);
                rest$1371 = subMatch$1368.rest;
            } else if (stx$1365[0] && stx$1365[0].token.type === parser$1291.Token.Delimiter && stx$1365[0].token.value === pattern$1364.value) {
                stx$1365[0].expose();
                if (pattern$1364.inner.length === 0 && stx$1365[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1365,
                        patternEnv: patternEnv$1367
                    };
                }
                subMatch$1368 = matchPatterns$1309(pattern$1364.inner, stx$1365[0].token.inner, env$1366, false);
                rest$1371 = stx$1365.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1365,
                    patternEnv: patternEnv$1367
                };
            }
            success$1372 = subMatch$1368.success;
            // merge the subpattern matches with the current pattern environment
            _$1289.keys(subMatch$1368.patternEnv).forEach(function (patternKey$1373) {
                if (pattern$1364.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1374 = subMatch$1368.patternEnv[patternKey$1373].level + 1;
                    if (patternEnv$1367[patternKey$1373]) {
                        patternEnv$1367[patternKey$1373].level = nextLevel$1374;
                        patternEnv$1367[patternKey$1373].match.push(subMatch$1368.patternEnv[patternKey$1373]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1367[patternKey$1373] = {
                            level: nextLevel$1374,
                            match: [subMatch$1368.patternEnv[patternKey$1373]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1367[patternKey$1373] = subMatch$1368.patternEnv[patternKey$1373];
                }
            });
        } else {
            if (pattern$1364.class === 'pattern_literal') {
                // wildcard
                if (stx$1365[0] && pattern$1364.value === '_') {
                    success$1372 = true;
                    rest$1371 = stx$1365.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1365[0] && pattern$1364.value === stx$1365[0].token.value) {
                    success$1372 = true;
                    rest$1371 = stx$1365.slice(1);
                } else {
                    success$1372 = false;
                    rest$1371 = stx$1365;
                }
            } else {
                match$1369 = matchPatternClass$1308(pattern$1364.class, stx$1365, env$1366);
                success$1372 = match$1369.result !== null;
                rest$1371 = match$1369.rest;
                matchEnv$1370 = {
                    level: 0,
                    match: match$1369.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1364.repeat) {
                    if (patternEnv$1367[pattern$1364.value]) {
                        patternEnv$1367[pattern$1364.value].match.push(matchEnv$1370);
                    } else {
                        // initialize if necessary
                        patternEnv$1367[pattern$1364.value] = {
                            level: 1,
                            match: [matchEnv$1370]
                        };
                    }
                } else {
                    patternEnv$1367[pattern$1364.value] = matchEnv$1370;
                }
            }
        }
        return {
            success: success$1372,
            rest: rest$1371,
            patternEnv: patternEnv$1367
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1311(macroBody$1375, macroNameStx$1376, env$1377) {
        return _$1289.chain(macroBody$1375).reduce(function (acc$1378, bodyStx$1379, idx$1380, original$1381) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1382 = original$1381[idx$1380 - 1];
            var next$1383 = original$1381[idx$1380 + 1];
            var nextNext$1384 = original$1381[idx$1380 + 2];
            // drop `...`
            if (bodyStx$1379.token.value === '...') {
                return acc$1378;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1302(bodyStx$1379) && next$1383 && next$1383.token.value === '...') {
                return acc$1378;
            }
            // skip the $ in $(...)
            if (bodyStx$1379.token.value === '$' && next$1383 && next$1383.token.type === parser$1291.Token.Delimiter && next$1383.token.value === '()') {
                return acc$1378;
            }
            // mark $[...] as a literal
            if (bodyStx$1379.token.value === '$' && next$1383 && next$1383.token.type === parser$1291.Token.Delimiter && next$1383.token.value === '[]') {
                next$1383.literal = true;
                return acc$1378;
            }
            if (bodyStx$1379.token.type === parser$1291.Token.Delimiter && bodyStx$1379.token.value === '()' && last$1382 && last$1382.token.value === '$') {
                bodyStx$1379.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1379.literal === true) {
                parser$1291.assert(bodyStx$1379.token.type === parser$1291.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1378.concat(bodyStx$1379.token.inner);
            }
            if (next$1383 && next$1383.token.value === '...') {
                bodyStx$1379.repeat = true;
                bodyStx$1379.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1302(next$1383) && nextNext$1384 && nextNext$1384.token.value === '...') {
                bodyStx$1379.repeat = true;
                bodyStx$1379.separator = next$1383.token.inner[0].token.value;
            }
            return acc$1378.concat(bodyStx$1379);
        }, []).reduce(function (acc$1385, bodyStx$1386, idx$1387) {
            // then do the actual transcription
            if (bodyStx$1386.repeat) {
                if (bodyStx$1386.token.type === parser$1291.Token.Delimiter) {
                    bodyStx$1386.expose();
                    var fv$1388 = _$1289.filter(freeVarsInPattern$1299(bodyStx$1386.token.inner), function (pat$1395) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1377.hasOwnProperty(pat$1395);
                        });
                    var restrictedEnv$1389 = [];
                    var nonScalar$1390 = _$1289.find(fv$1388, function (pat$1396) {
                            return env$1377[pat$1396].level > 0;
                        });
                    parser$1291.assert(typeof nonScalar$1390 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1391 = env$1377[nonScalar$1390].match.length;
                    var sameLength$1392 = _$1289.all(fv$1388, function (pat$1397) {
                            return env$1377[pat$1397].level === 0 || env$1377[pat$1397].match.length === repeatLength$1391;
                        });
                    parser$1291.assert(sameLength$1392, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1389 = _$1289.map(_$1289.range(repeatLength$1391), function (idx$1398) {
                        var renv$1399 = {};
                        _$1289.each(fv$1388, function (pat$1400) {
                            if (env$1377[pat$1400].level === 0) {
                                // copy scalars over
                                renv$1399[pat$1400] = env$1377[pat$1400];
                            } else {
                                // grab the match at this index
                                renv$1399[pat$1400] = env$1377[pat$1400].match[idx$1398];
                            }
                        });
                        return renv$1399;
                    });
                    var transcribed$1393 = _$1289.map(restrictedEnv$1389, function (renv$1401) {
                            if (bodyStx$1386.group) {
                                return transcribe$1311(bodyStx$1386.token.inner, macroNameStx$1376, renv$1401);
                            } else {
                                var newBody$1402 = syntaxFromToken$1295(_$1289.clone(bodyStx$1386.token), bodyStx$1386);
                                newBody$1402.token.inner = transcribe$1311(bodyStx$1386.token.inner, macroNameStx$1376, renv$1401);
                                return newBody$1402;
                            }
                        });
                    var joined$1394;
                    if (bodyStx$1386.group) {
                        joined$1394 = joinSyntaxArr$1298(transcribed$1393, bodyStx$1386.separator);
                    } else {
                        joined$1394 = joinSyntax$1297(transcribed$1393, bodyStx$1386.separator);
                    }
                    return acc$1385.concat(joined$1394);
                }
                if (!env$1377[bodyStx$1386.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1386.token.value + ' is not bound for the template');
                } else if (env$1377[bodyStx$1386.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1386.token.value + ' does not match in the template');
                }
                return acc$1385.concat(joinRepeatedMatch$1304(env$1377[bodyStx$1386.token.value].match, bodyStx$1386.separator));
            } else {
                if (bodyStx$1386.token.type === parser$1291.Token.Delimiter) {
                    bodyStx$1386.expose();
                    var newBody$1403 = syntaxFromToken$1295(_$1289.clone(bodyStx$1386.token), macroBody$1375);
                    newBody$1403.token.inner = transcribe$1311(bodyStx$1386.token.inner, macroNameStx$1376, env$1377);
                    return acc$1385.concat([newBody$1403]);
                }
                if (isPatternVar$1303(bodyStx$1386) && Object.prototype.hasOwnProperty.bind(env$1377)(bodyStx$1386.token.value)) {
                    if (!env$1377[bodyStx$1386.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1386.token.value + ' is not bound for the template');
                    } else if (env$1377[bodyStx$1386.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1386.token.value + ' does not match in the template');
                    }
                    return acc$1385.concat(env$1377[bodyStx$1386.token.value].match);
                }
                return acc$1385.concat([bodyStx$1386]);
            }
        }, []).value();
    }
    exports$1288.loadPattern = loadPattern$1307;
    exports$1288.matchPatterns = matchPatterns$1309;
    exports$1288.transcribe = transcribe$1311;
    exports$1288.matchPatternClass = matchPatternClass$1308;
    exports$1288.takeLineContext = takeLineContext$1305;
    exports$1288.takeLine = takeLine$1306;
}));