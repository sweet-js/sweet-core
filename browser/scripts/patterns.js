(function (root$1247, factory$1248) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1248(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1248);
    }
}(this, function (exports$1249, _$1250, es6$1251, parser$1252, expander$1253, syntax$1254) {
    var get_expression$1255 = expander$1253.get_expression;
    var syntaxFromToken$1256 = syntax$1254.syntaxFromToken;
    var makePunc$1257 = syntax$1254.makePunc;
    var joinSyntax$1258 = syntax$1254.joinSyntax;
    var joinSyntaxArr$1259 = syntax$1254.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1260(pattern$1273) {
        var fv$1274 = [];
        _$1250.each(pattern$1273, function (pat$1275) {
            if (isPatternVar$1264(pat$1275)) {
                fv$1274.push(pat$1275.token.value);
            } else if (pat$1275.token.type === parser$1252.Token.Delimiter) {
                fv$1274 = fv$1274.concat(freeVarsInPattern$1260(pat$1275.token.inner));
            }
        });
        return fv$1274;
    }
    function typeIsLiteral$1261(type$1276) {
        return type$1276 === parser$1252.Token.NullLiteral || type$1276 === parser$1252.Token.NumericLiteral || type$1276 === parser$1252.Token.StringLiteral || type$1276 === parser$1252.Token.RegexLiteral || type$1276 === parser$1252.Token.BooleanLiteral;
    }
    function containsPatternVar$1262(patterns$1277) {
        return _$1250.any(patterns$1277, function (pat$1278) {
            if (pat$1278.token.type === parser$1252.Token.Delimiter) {
                return containsPatternVar$1262(pat$1278.token.inner);
            }
            return isPatternVar$1264(pat$1278);
        });
    }
    function delimIsSeparator$1263(delim$1279) {
        return delim$1279 && delim$1279.token && delim$1279.token.type === parser$1252.Token.Delimiter && delim$1279.token.value === '()' && delim$1279.token.inner.length === 1 && delim$1279.token.inner[0].token.type !== parser$1252.Token.Delimiter && !containsPatternVar$1262(delim$1279.token.inner);
    }
    function isPatternVar$1264(stx$1280) {
        return stx$1280.token.value[0] === '$' && stx$1280.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1265(tojoin$1281, punc$1282) {
        return _$1250.reduce(_$1250.rest(tojoin$1281, 1), function (acc$1283, join$1284) {
            if (punc$1282 === ' ') {
                return acc$1283.concat(join$1284.match);
            }
            return acc$1283.concat(makePunc$1257(punc$1282, _$1250.first(join$1284.match)), join$1284.match);
        }, _$1250.first(tojoin$1281).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1266(from$1285, to$1286) {
        return _$1250.map(to$1286, function (stx$1287) {
            return takeLine$1267(from$1285, stx$1287);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1267(from$1288, to$1289) {
        if (to$1289.token.type === parser$1252.Token.Delimiter) {
            var next$1290;
            if (from$1288.token.type === parser$1252.Token.Delimiter) {
                next$1290 = syntaxFromToken$1256({
                    type: parser$1252.Token.Delimiter,
                    value: to$1289.token.value,
                    inner: to$1289.token.inner,
                    startRange: from$1288.token.startRange,
                    endRange: from$1288.token.endRange,
                    startLineNumber: from$1288.token.startLineNumber,
                    startLineStart: from$1288.token.startLineStart,
                    endLineNumber: from$1288.token.endLineNumber,
                    endLineStart: from$1288.token.endLineStart
                }, to$1289);
            } else {
                next$1290 = syntaxFromToken$1256({
                    type: parser$1252.Token.Delimiter,
                    value: to$1289.token.value,
                    inner: to$1289.token.inner,
                    startRange: from$1288.token.range,
                    endRange: from$1288.token.range,
                    startLineNumber: from$1288.token.lineNumber,
                    startLineStart: from$1288.token.lineStart,
                    endLineNumber: from$1288.token.lineNumber,
                    endLineStart: from$1288.token.lineStart
                }, to$1289);
            }
        } else {
            if (from$1288.token.type === parser$1252.Token.Delimiter) {
                next$1290 = syntaxFromToken$1256({
                    value: to$1289.token.value,
                    type: to$1289.token.type,
                    lineNumber: from$1288.token.startLineNumber,
                    lineStart: from$1288.token.startLineStart,
                    range: from$1288.token.startRange
                }, to$1289);
            } else {
                next$1290 = syntaxFromToken$1256({
                    value: to$1289.token.value,
                    type: to$1289.token.type,
                    lineNumber: from$1288.token.lineNumber,
                    lineStart: from$1288.token.lineStart,
                    range: from$1288.token.range
                }, to$1289);
            }
        }
        if (to$1289.token.leadingComments) {
            next$1290.token.leadingComments = to$1289.token.leadingComments;
        }
        if (to$1289.token.trailingComments) {
            next$1290.token.trailingComments = to$1289.token.trailingComments;
        }
        return next$1290;
    }
    function loadPattern$1268(patterns$1291) {
        return _$1250.chain(patterns$1291).reduce(function (acc$1292, patStx$1293, idx$1294) {
            var last$1295 = patterns$1291[idx$1294 - 1];
            var lastLast$1296 = patterns$1291[idx$1294 - 2];
            var next$1297 = patterns$1291[idx$1294 + 1];
            var nextNext$1298 = patterns$1291[idx$1294 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1293.token.value === ':') {
                if (last$1295 && isPatternVar$1264(last$1295) && !isPatternVar$1264(next$1297)) {
                    return acc$1292;
                }
            }
            if (last$1295 && last$1295.token.value === ':') {
                if (lastLast$1296 && isPatternVar$1264(lastLast$1296) && !isPatternVar$1264(patStx$1293)) {
                    return acc$1292;
                }
            }
            // skip over $
            if (patStx$1293.token.value === '$' && next$1297 && next$1297.token.type === parser$1252.Token.Delimiter) {
                return acc$1292;
            }
            if (isPatternVar$1264(patStx$1293)) {
                if (next$1297 && next$1297.token.value === ':' && !isPatternVar$1264(nextNext$1298)) {
                    if (typeof nextNext$1298 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1293.class = nextNext$1298.token.value;
                } else {
                    patStx$1293.class = 'token';
                }
            } else if (patStx$1293.token.type === parser$1252.Token.Delimiter) {
                if (last$1295 && last$1295.token.value === '$') {
                    patStx$1293.class = 'pattern_group';
                }
                patStx$1293.token.inner = loadPattern$1268(patStx$1293.token.inner);
            } else {
                patStx$1293.class = 'pattern_literal';
            }
            return acc$1292.concat(patStx$1293);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1299, patStx$1300, idx$1301, patterns$1302) {
            var separator$1303 = ' ';
            var repeat$1304 = false;
            var next$1305 = patterns$1302[idx$1301 + 1];
            var nextNext$1306 = patterns$1302[idx$1301 + 2];
            if (next$1305 && next$1305.token.value === '...') {
                repeat$1304 = true;
                separator$1303 = ' ';
            } else if (delimIsSeparator$1263(next$1305) && nextNext$1306 && nextNext$1306.token.value === '...') {
                repeat$1304 = true;
                parser$1252.assert(next$1305.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1303 = next$1305.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1300.token.value === '...' || delimIsSeparator$1263(patStx$1300) && next$1305 && next$1305.token.value === '...') {
                return acc$1299;
            }
            patStx$1300.repeat = repeat$1304;
            patStx$1300.separator = separator$1303;
            return acc$1299.concat(patStx$1300);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1269(patternClass$1307, stx$1308, env$1309) {
        var result$1310, rest$1311;
        // pattern has no parse class
        if (patternClass$1307 === 'token' && stx$1308[0] && stx$1308[0].token.type !== parser$1252.Token.EOF) {
            result$1310 = [stx$1308[0]];
            rest$1311 = stx$1308.slice(1);
        } else if (patternClass$1307 === 'lit' && stx$1308[0] && typeIsLiteral$1261(stx$1308[0].token.type)) {
            result$1310 = [stx$1308[0]];
            rest$1311 = stx$1308.slice(1);
        } else if (patternClass$1307 === 'ident' && stx$1308[0] && stx$1308[0].token.type === parser$1252.Token.Identifier) {
            result$1310 = [stx$1308[0]];
            rest$1311 = stx$1308.slice(1);
        } else if (stx$1308.length > 0 && patternClass$1307 === 'VariableStatement') {
            var match$1312 = expander$1253.enforest(stx$1308, expander$1253.makeExpanderContext({ env: env$1309 }));
            if (match$1312.result && match$1312.result.hasPrototype(expander$1253.VariableStatement)) {
                result$1310 = match$1312.result.destruct(false);
                rest$1311 = match$1312.rest;
            } else {
                result$1310 = null;
                rest$1311 = stx$1308;
            }
        } else if (stx$1308.length > 0 && patternClass$1307 === 'expr') {
            var match$1312 = expander$1253.get_expression(stx$1308, expander$1253.makeExpanderContext({ env: env$1309 }));
            if (match$1312.result === null || !match$1312.result.hasPrototype(expander$1253.Expr)) {
                result$1310 = null;
                rest$1311 = stx$1308;
            } else {
                result$1310 = match$1312.result.destruct(false);
                rest$1311 = match$1312.rest;
            }
        } else {
            result$1310 = null;
            rest$1311 = stx$1308;
        }
        return {
            result: result$1310,
            rest: rest$1311
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1270(patterns$1313, stx$1314, env$1315, topLevel$1316) {
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
        topLevel$1316 = topLevel$1316 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1317 = [];
        var patternEnv$1318 = {};
        var match$1319;
        var pattern$1320;
        var rest$1321 = stx$1314;
        var success$1322 = true;
        for (var i$1323 = 0; i$1323 < patterns$1313.length; i$1323++) {
            if (success$1322 === false) {
                break;
            }
            pattern$1320 = patterns$1313[i$1323];
            do {
                match$1319 = matchPattern$1271(pattern$1320, rest$1321, env$1315, patternEnv$1318);
                if (!match$1319.success && pattern$1320.repeat) {
                    // a repeat can match zero tokens and still be a
                    // "success" so break out of the inner loop and
                    // try the next pattern
                    break;
                }
                if (!match$1319.success) {
                    success$1322 = false;
                    break;
                }
                rest$1321 = match$1319.rest;
                patternEnv$1318 = match$1319.patternEnv;
                if (success$1322 && !(topLevel$1316 || pattern$1320.repeat)) {
                    // the very last pattern matched, inside a
                    // delimiter, not a repeat, *and* there are more
                    // unmatched bits of syntax
                    if (i$1323 == patterns$1313.length - 1 && rest$1321.length !== 0) {
                        success$1322 = false;
                        break;
                    }
                }
                if (pattern$1320.repeat && success$1322) {
                    if (rest$1321[0] && rest$1321[0].token.value === pattern$1320.separator) {
                        // more tokens and the next token matches the separator
                        rest$1321 = rest$1321.slice(1);
                    } else if (pattern$1320.separator === ' ') {
                        // no separator specified (using the empty string for this)
                        // so keep going
                        continue;
                    } else if (pattern$1320.separator !== ' ' && rest$1321.length > 0 && i$1323 === patterns$1313.length - 1 && topLevel$1316 === false) {
                        // separator is specified, there is a next token, the
                        // next token doesn't match the separator, there are
                        // no more patterns, and this is a top level pattern
                        // so the match has failed
                        success$1322 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$1320.repeat && success$1322 && rest$1321.length > 0);
        }
        return {
            success: success$1322,
            rest: rest$1321,
            patternEnv: patternEnv$1318
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
    function matchPattern$1271(pattern$1324, stx$1325, env$1326, patternEnv$1327) {
        var subMatch$1328;
        var match$1329, matchEnv$1330;
        var rest$1331;
        var success$1332;
        if (typeof pattern$1324.inner !== 'undefined') {
            if (pattern$1324.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1328 = matchPatterns$1270(pattern$1324.inner, stx$1325, env$1326, true);
                rest$1331 = subMatch$1328.rest;
            } else if (stx$1325[0] && stx$1325[0].token.type === parser$1252.Token.Delimiter && stx$1325[0].token.value === pattern$1324.value) {
                stx$1325[0].expose();
                if (pattern$1324.inner.length === 0 && stx$1325[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1325,
                        patternEnv: patternEnv$1327
                    };
                }
                subMatch$1328 = matchPatterns$1270(pattern$1324.inner, stx$1325[0].token.inner, env$1326, false);
                rest$1331 = stx$1325.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1325,
                    patternEnv: patternEnv$1327
                };
            }
            success$1332 = subMatch$1328.success;
            // merge the subpattern matches with the current pattern environment
            _$1250.keys(subMatch$1328.patternEnv).forEach(function (patternKey$1333) {
                if (pattern$1324.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1334 = subMatch$1328.patternEnv[patternKey$1333].level + 1;
                    if (patternEnv$1327[patternKey$1333]) {
                        patternEnv$1327[patternKey$1333].level = nextLevel$1334;
                        patternEnv$1327[patternKey$1333].match.push(subMatch$1328.patternEnv[patternKey$1333]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1327[patternKey$1333] = {
                            level: nextLevel$1334,
                            match: [subMatch$1328.patternEnv[patternKey$1333]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1327[patternKey$1333] = subMatch$1328.patternEnv[patternKey$1333];
                }
            });
        } else {
            if (pattern$1324.class === 'pattern_literal') {
                // wildcard
                if (stx$1325[0] && pattern$1324.value === '_') {
                    success$1332 = true;
                    rest$1331 = stx$1325.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1325[0] && pattern$1324.value === stx$1325[0].token.value) {
                    success$1332 = true;
                    rest$1331 = stx$1325.slice(1);
                } else {
                    success$1332 = false;
                    rest$1331 = stx$1325;
                }
            } else {
                match$1329 = matchPatternClass$1269(pattern$1324.class, stx$1325, env$1326);
                success$1332 = match$1329.result !== null;
                rest$1331 = match$1329.rest;
                matchEnv$1330 = {
                    level: 0,
                    match: match$1329.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1324.repeat) {
                    if (patternEnv$1327[pattern$1324.value]) {
                        patternEnv$1327[pattern$1324.value].match.push(matchEnv$1330);
                    } else {
                        // initialize if necessary
                        patternEnv$1327[pattern$1324.value] = {
                            level: 1,
                            match: [matchEnv$1330]
                        };
                    }
                } else {
                    patternEnv$1327[pattern$1324.value] = matchEnv$1330;
                }
            }
        }
        return {
            success: success$1332,
            rest: rest$1331,
            patternEnv: patternEnv$1327
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1272(macroBody$1335, macroNameStx$1336, env$1337) {
        return _$1250.chain(macroBody$1335).reduce(function (acc$1338, bodyStx$1339, idx$1340, original$1341) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1342 = original$1341[idx$1340 - 1];
            var next$1343 = original$1341[idx$1340 + 1];
            var nextNext$1344 = original$1341[idx$1340 + 2];
            // drop `...`
            if (bodyStx$1339.token.value === '...') {
                return acc$1338;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1263(bodyStx$1339) && next$1343 && next$1343.token.value === '...') {
                return acc$1338;
            }
            // skip the $ in $(...)
            if (bodyStx$1339.token.value === '$' && next$1343 && next$1343.token.type === parser$1252.Token.Delimiter && next$1343.token.value === '()') {
                return acc$1338;
            }
            // mark $[...] as a literal
            if (bodyStx$1339.token.value === '$' && next$1343 && next$1343.token.type === parser$1252.Token.Delimiter && next$1343.token.value === '[]') {
                next$1343.literal = true;
                return acc$1338;
            }
            if (bodyStx$1339.token.type === parser$1252.Token.Delimiter && bodyStx$1339.token.value === '()' && last$1342 && last$1342.token.value === '$') {
                bodyStx$1339.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1339.literal === true) {
                parser$1252.assert(bodyStx$1339.token.type === parser$1252.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1338.concat(bodyStx$1339.token.inner);
            }
            if (next$1343 && next$1343.token.value === '...') {
                bodyStx$1339.repeat = true;
                bodyStx$1339.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1263(next$1343) && nextNext$1344 && nextNext$1344.token.value === '...') {
                bodyStx$1339.repeat = true;
                bodyStx$1339.separator = next$1343.token.inner[0].token.value;
            }
            return acc$1338.concat(bodyStx$1339);
        }, []).reduce(function (acc$1345, bodyStx$1346, idx$1347) {
            // then do the actual transcription
            if (bodyStx$1346.repeat) {
                if (bodyStx$1346.token.type === parser$1252.Token.Delimiter) {
                    bodyStx$1346.expose();
                    var fv$1348 = _$1250.filter(freeVarsInPattern$1260(bodyStx$1346.token.inner), function (pat$1355) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1337.hasOwnProperty(pat$1355);
                        });
                    var restrictedEnv$1349 = [];
                    var nonScalar$1350 = _$1250.find(fv$1348, function (pat$1356) {
                            return env$1337[pat$1356].level > 0;
                        });
                    parser$1252.assert(typeof nonScalar$1350 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1351 = env$1337[nonScalar$1350].match.length;
                    var sameLength$1352 = _$1250.all(fv$1348, function (pat$1357) {
                            return env$1337[pat$1357].level === 0 || env$1337[pat$1357].match.length === repeatLength$1351;
                        });
                    parser$1252.assert(sameLength$1352, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1349 = _$1250.map(_$1250.range(repeatLength$1351), function (idx$1358) {
                        var renv$1359 = {};
                        _$1250.each(fv$1348, function (pat$1360) {
                            if (env$1337[pat$1360].level === 0) {
                                // copy scalars over
                                renv$1359[pat$1360] = env$1337[pat$1360];
                            } else {
                                // grab the match at this index
                                renv$1359[pat$1360] = env$1337[pat$1360].match[idx$1358];
                            }
                        });
                        return renv$1359;
                    });
                    var transcribed$1353 = _$1250.map(restrictedEnv$1349, function (renv$1361) {
                            if (bodyStx$1346.group) {
                                return transcribe$1272(bodyStx$1346.token.inner, macroNameStx$1336, renv$1361);
                            } else {
                                var newBody$1362 = syntaxFromToken$1256(_$1250.clone(bodyStx$1346.token), bodyStx$1346);
                                newBody$1362.token.inner = transcribe$1272(bodyStx$1346.token.inner, macroNameStx$1336, renv$1361);
                                return newBody$1362;
                            }
                        });
                    var joined$1354;
                    if (bodyStx$1346.group) {
                        joined$1354 = joinSyntaxArr$1259(transcribed$1353, bodyStx$1346.separator);
                    } else {
                        joined$1354 = joinSyntax$1258(transcribed$1353, bodyStx$1346.separator);
                    }
                    return acc$1345.concat(joined$1354);
                }
                if (!env$1337[bodyStx$1346.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1346.token.value + ' is not bound for the template');
                } else if (env$1337[bodyStx$1346.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1346.token.value + ' does not match in the template');
                }
                return acc$1345.concat(joinRepeatedMatch$1265(env$1337[bodyStx$1346.token.value].match, bodyStx$1346.separator));
            } else {
                if (bodyStx$1346.token.type === parser$1252.Token.Delimiter) {
                    bodyStx$1346.expose();
                    var newBody$1363 = syntaxFromToken$1256(_$1250.clone(bodyStx$1346.token), macroBody$1335);
                    newBody$1363.token.inner = transcribe$1272(bodyStx$1346.token.inner, macroNameStx$1336, env$1337);
                    return acc$1345.concat(takeLineContext$1266(macroNameStx$1336, [newBody$1363]));
                }
                if (isPatternVar$1264(bodyStx$1346) && Object.prototype.hasOwnProperty.bind(env$1337)(bodyStx$1346.token.value)) {
                    if (!env$1337[bodyStx$1346.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1346.token.value + ' is not bound for the template');
                    } else if (env$1337[bodyStx$1346.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1346.token.value + ' does not match in the template');
                    }
                    return acc$1345.concat(takeLineContext$1266(macroNameStx$1336, env$1337[bodyStx$1346.token.value].match));
                }
                return acc$1345.concat(takeLineContext$1266(macroNameStx$1336, [bodyStx$1346]));
            }
        }, []).value();
    }
    exports$1249.loadPattern = loadPattern$1268;
    exports$1249.matchPatterns = matchPatterns$1270;
    exports$1249.transcribe = transcribe$1272;
    exports$1249.matchPatternClass = matchPatternClass$1269;
    exports$1249.takeLineContext = takeLineContext$1266;
    exports$1249.takeLine = takeLine$1267;
}));