(function (root$1284, factory$1285) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1285(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1285);
    }
}(this, function (exports$1286, _$1287, es6$1288, parser$1289, expander$1290, syntax$1291) {
    var get_expression$1292 = expander$1290.get_expression;
    var syntaxFromToken$1293 = syntax$1291.syntaxFromToken;
    var makePunc$1294 = syntax$1291.makePunc;
    var joinSyntax$1295 = syntax$1291.joinSyntax;
    var joinSyntaxArr$1296 = syntax$1291.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1299(pattern$1336) {
        var fv$1337 = [];
        _$1287.each(pattern$1336, function (pat$1340) {
            if (isPatternVar$1311(pat$1340)) {
                fv$1337.push(pat$1340.token.value);
            } else if (pat$1340.token.type === parser$1289.Token.Delimiter) {
                fv$1337 = fv$1337.concat(freeVarsInPattern$1299(pat$1340.token.inner));
            }
        });
        return fv$1337;
    }
    function typeIsLiteral$1302(type$1341) {
        return type$1341 === parser$1289.Token.NullLiteral || type$1341 === parser$1289.Token.NumericLiteral || type$1341 === parser$1289.Token.StringLiteral || type$1341 === parser$1289.Token.RegexLiteral || type$1341 === parser$1289.Token.BooleanLiteral;
    }
    function containsPatternVar$1305(patterns$1342) {
        return _$1287.any(patterns$1342, function (pat$1345) {
            if (pat$1345.token.type === parser$1289.Token.Delimiter) {
                return containsPatternVar$1305(pat$1345.token.inner);
            }
            return isPatternVar$1311(pat$1345);
        });
    }
    function delimIsSeparator$1308(delim$1346) {
        return delim$1346 && delim$1346.token && delim$1346.token.type === parser$1289.Token.Delimiter && delim$1346.token.value === '()' && delim$1346.token.inner.length === 1 && delim$1346.token.inner[0].token.type !== parser$1289.Token.Delimiter && !containsPatternVar$1305(delim$1346.token.inner);
    }
    function isPatternVar$1311(stx$1347) {
        return stx$1347.token.value[0] === '$' && stx$1347.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1314(tojoin$1348, punc$1349) {
        return _$1287.reduce(_$1287.rest(tojoin$1348, 1), function (acc$1352, join$1353) {
            if (punc$1349 === ' ') {
                return acc$1352.concat(join$1353.match);
            }
            return acc$1352.concat(makePunc$1294(punc$1349, _$1287.first(join$1353.match)), join$1353.match);
        }, _$1287.first(tojoin$1348).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1317(from$1354, to$1355) {
        return _$1287.map(to$1355, function (stx$1358) {
            return takeLine$1320(from$1354, stx$1358);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1320(from$1359, to$1360) {
        if (to$1360.token.type === parser$1289.Token.Delimiter) {
            var next$1361;
            if (from$1359.token.type === parser$1289.Token.Delimiter) {
                next$1361 = syntaxFromToken$1293({
                    type: parser$1289.Token.Delimiter,
                    value: to$1360.token.value,
                    inner: to$1360.token.inner,
                    startRange: from$1359.token.startRange,
                    endRange: from$1359.token.endRange,
                    startLineNumber: from$1359.token.startLineNumber,
                    startLineStart: from$1359.token.startLineStart,
                    endLineNumber: from$1359.token.endLineNumber,
                    endLineStart: from$1359.token.endLineStart
                }, to$1360);
            } else {
                next$1361 = syntaxFromToken$1293({
                    type: parser$1289.Token.Delimiter,
                    value: to$1360.token.value,
                    inner: to$1360.token.inner,
                    startRange: from$1359.token.range,
                    endRange: from$1359.token.range,
                    startLineNumber: from$1359.token.lineNumber,
                    startLineStart: from$1359.token.lineStart,
                    endLineNumber: from$1359.token.lineNumber,
                    endLineStart: from$1359.token.lineStart
                }, to$1360);
            }
        } else {
            if (from$1359.token.type === parser$1289.Token.Delimiter) {
                next$1361 = syntaxFromToken$1293({
                    value: to$1360.token.value,
                    type: to$1360.token.type,
                    lineNumber: from$1359.token.startLineNumber,
                    lineStart: from$1359.token.startLineStart,
                    range: from$1359.token.startRange
                }, to$1360);
            } else {
                next$1361 = syntaxFromToken$1293({
                    value: to$1360.token.value,
                    type: to$1360.token.type,
                    lineNumber: from$1359.token.lineNumber,
                    lineStart: from$1359.token.lineStart,
                    range: from$1359.token.range
                }, to$1360);
            }
        }
        if (to$1360.token.leadingComments) {
            next$1361.token.leadingComments = to$1360.token.leadingComments;
        }
        if (to$1360.token.trailingComments) {
            next$1361.token.trailingComments = to$1360.token.trailingComments;
        }
        return next$1361;
    }
    function loadPattern$1323(patterns$1362) {
        return _$1287.chain(patterns$1362).reduce(function (acc$1367, patStx$1368, idx$1369) {
            var last$1370 = patterns$1362[idx$1369 - 1];
            var lastLast$1371 = patterns$1362[idx$1369 - 2];
            var next$1372 = patterns$1362[idx$1369 + 1];
            var nextNext$1373 = patterns$1362[idx$1369 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1368.token.value === ':') {
                if (last$1370 && isPatternVar$1311(last$1370) && !isPatternVar$1311(next$1372)) {
                    return acc$1367;
                }
            }
            if (last$1370 && last$1370.token.value === ':') {
                if (lastLast$1371 && isPatternVar$1311(lastLast$1371) && !isPatternVar$1311(patStx$1368)) {
                    return acc$1367;
                }
            }
            // skip over $
            if (patStx$1368.token.value === '$' && next$1372 && next$1372.token.type === parser$1289.Token.Delimiter) {
                return acc$1367;
            }
            if (isPatternVar$1311(patStx$1368)) {
                if (next$1372 && next$1372.token.value === ':' && !isPatternVar$1311(nextNext$1373)) {
                    if (typeof nextNext$1373 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1368.class = nextNext$1373.token.value;
                } else {
                    patStx$1368.class = 'token';
                }
            } else if (patStx$1368.token.type === parser$1289.Token.Delimiter) {
                if (last$1370 && last$1370.token.value === '$') {
                    patStx$1368.class = 'pattern_group';
                }
                patStx$1368.token.inner = loadPattern$1323(patStx$1368.token.inner);
            } else {
                patStx$1368.class = 'pattern_literal';
            }
            return acc$1367.concat(patStx$1368);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1374, patStx$1375, idx$1376, patterns$1377) {
            var separator$1378 = ' ';
            var repeat$1379 = false;
            var next$1380 = patterns$1377[idx$1376 + 1];
            var nextNext$1381 = patterns$1377[idx$1376 + 2];
            if (next$1380 && next$1380.token.value === '...') {
                repeat$1379 = true;
                separator$1378 = ' ';
            } else if (delimIsSeparator$1308(next$1380) && nextNext$1381 && nextNext$1381.token.value === '...') {
                repeat$1379 = true;
                parser$1289.assert(next$1380.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1378 = next$1380.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1375.token.value === '...' || delimIsSeparator$1308(patStx$1375) && next$1380 && next$1380.token.value === '...') {
                return acc$1374;
            }
            patStx$1375.repeat = repeat$1379;
            patStx$1375.separator = separator$1378;
            return acc$1374.concat(patStx$1375);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1326(patternClass$1382, stx$1383, env$1384) {
        var result$1385, rest$1386;
        // pattern has no parse class
        if (patternClass$1382 === 'token' && stx$1383[0] && stx$1383[0].token.type !== parser$1289.Token.EOF) {
            result$1385 = [stx$1383[0]];
            rest$1386 = stx$1383.slice(1);
        } else if (patternClass$1382 === 'lit' && stx$1383[0] && typeIsLiteral$1302(stx$1383[0].token.type)) {
            result$1385 = [stx$1383[0]];
            rest$1386 = stx$1383.slice(1);
        } else if (patternClass$1382 === 'ident' && stx$1383[0] && stx$1383[0].token.type === parser$1289.Token.Identifier) {
            result$1385 = [stx$1383[0]];
            rest$1386 = stx$1383.slice(1);
        } else if (stx$1383.length > 0 && patternClass$1382 === 'VariableStatement') {
            var match$1387 = expander$1290.enforest(stx$1383, expander$1290.makeExpanderContext({ env: env$1384 }));
            if (match$1387.result && match$1387.result.hasPrototype(expander$1290.VariableStatement)) {
                result$1385 = match$1387.result.destruct(false);
                rest$1386 = match$1387.rest;
            } else {
                result$1385 = null;
                rest$1386 = stx$1383;
            }
        } else if (stx$1383.length > 0 && patternClass$1382 === 'expr') {
            var match$1387 = expander$1290.get_expression(stx$1383, expander$1290.makeExpanderContext({ env: env$1384 }));
            if (match$1387.result === null || !match$1387.result.hasPrototype(expander$1290.Expr)) {
                result$1385 = null;
                rest$1386 = stx$1383;
            } else {
                result$1385 = match$1387.result.destruct(false);
                rest$1386 = match$1387.rest;
            }
        } else {
            result$1385 = null;
            rest$1386 = stx$1383;
        }
        return {
            result: result$1385,
            rest: rest$1386
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1329(patterns$1388, stx$1389, env$1390, topLevel$1391) {
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
        topLevel$1391 = topLevel$1391 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1392 = [];
        var patternEnv$1393 = {};
        var match$1394;
        var pattern$1395;
        var rest$1396 = stx$1389;
        var success$1397 = true;
        for (var i$1398 = 0; i$1398 < patterns$1388.length; i$1398++) {
            if (success$1397 === false) {
                break;
            }
            pattern$1395 = patterns$1388[i$1398];
            do {
                match$1394 = matchPattern$1332(pattern$1395, rest$1396, env$1390, patternEnv$1393);
                if (!match$1394.success && pattern$1395.repeat) {
                    // a repeat can match zero tokens and still be a
                    // "success" so break out of the inner loop and
                    // try the next pattern
                    break;
                }
                if (!match$1394.success) {
                    success$1397 = false;
                    break;
                }
                rest$1396 = match$1394.rest;
                patternEnv$1393 = match$1394.patternEnv;
                if (success$1397 && !(topLevel$1391 || pattern$1395.repeat)) {
                    // the very last pattern matched, inside a
                    // delimiter, not a repeat, *and* there are more
                    // unmatched bits of syntax
                    if (i$1398 == patterns$1388.length - 1 && rest$1396.length !== 0) {
                        success$1397 = false;
                        break;
                    }
                }
                if (pattern$1395.repeat && success$1397) {
                    if (rest$1396[0] && rest$1396[0].token.value === pattern$1395.separator) {
                        // more tokens and the next token matches the separator
                        rest$1396 = rest$1396.slice(1);
                    } else if (pattern$1395.separator === ' ') {
                        // no separator specified (using the empty string for this)
                        // so keep going
                        continue;
                    } else if (pattern$1395.separator !== ' ' && rest$1396.length > 0 && i$1398 === patterns$1388.length - 1 && topLevel$1391 === false) {
                        // separator is specified, there is a next token, the
                        // next token doesn't match the separator, there are
                        // no more patterns, and this is a top level pattern
                        // so the match has failed
                        success$1397 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$1395.repeat && success$1397 && rest$1396.length > 0);
        }
        return {
            success: success$1397,
            rest: rest$1396,
            patternEnv: patternEnv$1393
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
    function matchPattern$1332(pattern$1399, stx$1400, env$1401, patternEnv$1402) {
        var subMatch$1403;
        var match$1404, matchEnv$1405;
        var rest$1406;
        var success$1407;
        if (typeof pattern$1399.inner !== 'undefined') {
            if (pattern$1399.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1403 = matchPatterns$1329(pattern$1399.inner, stx$1400, env$1401, true);
                rest$1406 = subMatch$1403.rest;
            } else if (stx$1400[0] && stx$1400[0].token.type === parser$1289.Token.Delimiter && stx$1400[0].token.value === pattern$1399.value) {
                stx$1400[0].expose();
                if (pattern$1399.inner.length === 0 && stx$1400[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1400,
                        patternEnv: patternEnv$1402
                    };
                }
                subMatch$1403 = matchPatterns$1329(pattern$1399.inner, stx$1400[0].token.inner, env$1401, false);
                rest$1406 = stx$1400.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1400,
                    patternEnv: patternEnv$1402
                };
            }
            success$1407 = subMatch$1403.success;
            // merge the subpattern matches with the current pattern environment
            _$1287.keys(subMatch$1403.patternEnv).forEach(function (patternKey$1410) {
                if (pattern$1399.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1411 = subMatch$1403.patternEnv[patternKey$1410].level + 1;
                    if (patternEnv$1402[patternKey$1410]) {
                        patternEnv$1402[patternKey$1410].level = nextLevel$1411;
                        patternEnv$1402[patternKey$1410].match.push(subMatch$1403.patternEnv[patternKey$1410]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1402[patternKey$1410] = {
                            level: nextLevel$1411,
                            match: [subMatch$1403.patternEnv[patternKey$1410]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1402[patternKey$1410] = subMatch$1403.patternEnv[patternKey$1410];
                }
            });
        } else {
            if (pattern$1399.class === 'pattern_literal') {
                // wildcard
                if (stx$1400[0] && pattern$1399.value === '_') {
                    success$1407 = true;
                    rest$1406 = stx$1400.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1400[0] && pattern$1399.value === stx$1400[0].token.value) {
                    success$1407 = true;
                    rest$1406 = stx$1400.slice(1);
                } else {
                    success$1407 = false;
                    rest$1406 = stx$1400;
                }
            } else {
                match$1404 = matchPatternClass$1326(pattern$1399.class, stx$1400, env$1401);
                success$1407 = match$1404.result !== null;
                rest$1406 = match$1404.rest;
                matchEnv$1405 = {
                    level: 0,
                    match: match$1404.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1399.repeat) {
                    if (patternEnv$1402[pattern$1399.value]) {
                        patternEnv$1402[pattern$1399.value].match.push(matchEnv$1405);
                    } else {
                        // initialize if necessary
                        patternEnv$1402[pattern$1399.value] = {
                            level: 1,
                            match: [matchEnv$1405]
                        };
                    }
                } else {
                    patternEnv$1402[pattern$1399.value] = matchEnv$1405;
                }
            }
        }
        return {
            success: success$1407,
            rest: rest$1406,
            patternEnv: patternEnv$1402
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1335(macroBody$1412, macroNameStx$1413, env$1414) {
        return _$1287.chain(macroBody$1412).reduce(function (acc$1419, bodyStx$1420, idx$1421, original$1422) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1423 = original$1422[idx$1421 - 1];
            var next$1424 = original$1422[idx$1421 + 1];
            var nextNext$1425 = original$1422[idx$1421 + 2];
            // drop `...`
            if (bodyStx$1420.token.value === '...') {
                return acc$1419;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1308(bodyStx$1420) && next$1424 && next$1424.token.value === '...') {
                return acc$1419;
            }
            // skip the $ in $(...)
            if (bodyStx$1420.token.value === '$' && next$1424 && next$1424.token.type === parser$1289.Token.Delimiter && next$1424.token.value === '()') {
                return acc$1419;
            }
            // mark $[...] as a literal
            if (bodyStx$1420.token.value === '$' && next$1424 && next$1424.token.type === parser$1289.Token.Delimiter && next$1424.token.value === '[]') {
                next$1424.literal = true;
                return acc$1419;
            }
            if (bodyStx$1420.token.type === parser$1289.Token.Delimiter && bodyStx$1420.token.value === '()' && last$1423 && last$1423.token.value === '$') {
                bodyStx$1420.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1420.literal === true) {
                parser$1289.assert(bodyStx$1420.token.type === parser$1289.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1419.concat(bodyStx$1420.token.inner);
            }
            if (next$1424 && next$1424.token.value === '...') {
                bodyStx$1420.repeat = true;
                bodyStx$1420.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1308(next$1424) && nextNext$1425 && nextNext$1425.token.value === '...') {
                bodyStx$1420.repeat = true;
                bodyStx$1420.separator = next$1424.token.inner[0].token.value;
            }
            return acc$1419.concat(bodyStx$1420);
        }, []).reduce(function (acc$1426, bodyStx$1427, idx$1428) {
            // then do the actual transcription
            if (bodyStx$1427.repeat) {
                if (bodyStx$1427.token.type === parser$1289.Token.Delimiter) {
                    bodyStx$1427.expose();
                    var fv$1431 = _$1287.filter(freeVarsInPattern$1299(bodyStx$1427.token.inner), function (pat$1446) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1414.hasOwnProperty(pat$1446);
                        });
                    var restrictedEnv$1432 = [];
                    var nonScalar$1435 = _$1287.find(fv$1431, function (pat$1447) {
                            return env$1414[pat$1447].level > 0;
                        });
                    parser$1289.assert(typeof nonScalar$1435 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1436 = env$1414[nonScalar$1435].match.length;
                    var sameLength$1439 = _$1287.all(fv$1431, function (pat$1448) {
                            return env$1414[pat$1448].level === 0 || env$1414[pat$1448].match.length === repeatLength$1436;
                        });
                    parser$1289.assert(sameLength$1439, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1432 = _$1287.map(_$1287.range(repeatLength$1436), function (idx$1449) {
                        var renv$1450 = {};
                        _$1287.each(fv$1431, function (pat$1453) {
                            if (env$1414[pat$1453].level === 0) {
                                // copy scalars over
                                renv$1450[pat$1453] = env$1414[pat$1453];
                            } else {
                                // grab the match at this index
                                renv$1450[pat$1453] = env$1414[pat$1453].match[idx$1449];
                            }
                        });
                        return renv$1450;
                    });
                    var transcribed$1444 = _$1287.map(restrictedEnv$1432, function (renv$1454) {
                            if (bodyStx$1427.group) {
                                return transcribe$1335(bodyStx$1427.token.inner, macroNameStx$1413, renv$1454);
                            } else {
                                var newBody$1455 = syntaxFromToken$1293(_$1287.clone(bodyStx$1427.token), bodyStx$1427);
                                newBody$1455.token.inner = transcribe$1335(bodyStx$1427.token.inner, macroNameStx$1413, renv$1454);
                                return newBody$1455;
                            }
                        });
                    var joined$1445;
                    if (bodyStx$1427.group) {
                        joined$1445 = joinSyntaxArr$1296(transcribed$1444, bodyStx$1427.separator);
                    } else {
                        joined$1445 = joinSyntax$1295(transcribed$1444, bodyStx$1427.separator);
                    }
                    return acc$1426.concat(joined$1445);
                }
                if (!env$1414[bodyStx$1427.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1427.token.value + ' is not bound for the template');
                } else if (env$1414[bodyStx$1427.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1427.token.value + ' does not match in the template');
                }
                return acc$1426.concat(joinRepeatedMatch$1314(env$1414[bodyStx$1427.token.value].match, bodyStx$1427.separator));
            } else {
                if (bodyStx$1427.token.type === parser$1289.Token.Delimiter) {
                    bodyStx$1427.expose();
                    var newBody$1456 = syntaxFromToken$1293(_$1287.clone(bodyStx$1427.token), macroBody$1412);
                    newBody$1456.token.inner = transcribe$1335(bodyStx$1427.token.inner, macroNameStx$1413, env$1414);
                    return acc$1426.concat(takeLineContext$1317(macroNameStx$1413, [newBody$1456]));
                }
                if (isPatternVar$1311(bodyStx$1427) && Object.prototype.hasOwnProperty.bind(env$1414)(bodyStx$1427.token.value)) {
                    if (!env$1414[bodyStx$1427.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1427.token.value + ' is not bound for the template');
                    } else if (env$1414[bodyStx$1427.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1427.token.value + ' does not match in the template');
                    }
                    return acc$1426.concat(takeLineContext$1317(macroNameStx$1413, env$1414[bodyStx$1427.token.value].match));
                }
                return acc$1426.concat(takeLineContext$1317(macroNameStx$1413, [bodyStx$1427]));
            }
        }, []).value();
    }
    exports$1286.loadPattern = loadPattern$1323;
    exports$1286.matchPatterns = matchPatterns$1329;
    exports$1286.transcribe = transcribe$1335;
    exports$1286.matchPatternClass = matchPatternClass$1326;
    exports$1286.takeLineContext = takeLineContext$1317;
    exports$1286.takeLine = takeLine$1320;
}));