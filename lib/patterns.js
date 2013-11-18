(function (root$1198, factory$1199) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1199(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1199);
    }
}(this, function (exports$1200, _$1201, es6$1202, parser$1203, expander$1204, syntax$1205) {
    var get_expression$1206 = expander$1204.get_expression;
    var syntaxFromToken$1207 = syntax$1205.syntaxFromToken;
    var makePunc$1208 = syntax$1205.makePunc;
    var joinSyntax$1209 = syntax$1205.joinSyntax;
    var joinSyntaxArr$1210 = syntax$1205.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1212(pattern$1237) {
        var fv$1238 = [];
        _$1201.each(pattern$1237, function (pat$1240) {
            if (isPatternVar$1220(pat$1240)) {
                fv$1238.push(pat$1240.token.value);
            } else if (pat$1240.token.type === parser$1203.Token.Delimiter) {
                fv$1238 = fv$1238.concat(freeVarsInPattern$1212(pat$1240.token.inner));
            }
        });
        return fv$1238;
    }
    function typeIsLiteral$1214(type$1241) {
        return type$1241 === parser$1203.Token.NullLiteral || type$1241 === parser$1203.Token.NumericLiteral || type$1241 === parser$1203.Token.StringLiteral || type$1241 === parser$1203.Token.RegexLiteral || type$1241 === parser$1203.Token.BooleanLiteral;
    }
    function containsPatternVar$1216(patterns$1242) {
        return _$1201.any(patterns$1242, function (pat$1244) {
            if (pat$1244.token.type === parser$1203.Token.Delimiter) {
                return containsPatternVar$1216(pat$1244.token.inner);
            }
            return isPatternVar$1220(pat$1244);
        });
    }
    function delimIsSeparator$1218(delim$1245) {
        return delim$1245 && delim$1245.token && delim$1245.token.type === parser$1203.Token.Delimiter && delim$1245.token.value === '()' && delim$1245.token.inner.length === 1 && delim$1245.token.inner[0].token.type !== parser$1203.Token.Delimiter && !containsPatternVar$1216(delim$1245.token.inner);
    }
    function isPatternVar$1220(stx$1246) {
        return stx$1246.token.value[0] === '$' && stx$1246.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1222(tojoin$1247, punc$1248) {
        return _$1201.reduce(_$1201.rest(tojoin$1247, 1), function (acc$1250, join$1251) {
            if (punc$1248 === ' ') {
                return acc$1250.concat(join$1251.match);
            }
            return acc$1250.concat(makePunc$1208(punc$1248, _$1201.first(join$1251.match)), join$1251.match);
        }, _$1201.first(tojoin$1247).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1224(from$1252, to$1253) {
        return _$1201.map(to$1253, function (stx$1255) {
            return takeLine$1226(from$1252, stx$1255);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1226(from$1256, to$1257) {
        if (to$1257.token.type === parser$1203.Token.Delimiter) {
            var next$1258;
            if (from$1256.token.type === parser$1203.Token.Delimiter) {
                next$1258 = syntaxFromToken$1207({
                    type: parser$1203.Token.Delimiter,
                    value: to$1257.token.value,
                    inner: to$1257.token.inner,
                    startRange: from$1256.token.startRange,
                    endRange: from$1256.token.endRange,
                    startLineNumber: from$1256.token.startLineNumber,
                    startLineStart: from$1256.token.startLineStart,
                    endLineNumber: from$1256.token.endLineNumber,
                    endLineStart: from$1256.token.endLineStart
                }, to$1257);
            } else {
                next$1258 = syntaxFromToken$1207({
                    type: parser$1203.Token.Delimiter,
                    value: to$1257.token.value,
                    inner: to$1257.token.inner,
                    startRange: from$1256.token.range,
                    endRange: from$1256.token.range,
                    startLineNumber: from$1256.token.lineNumber,
                    startLineStart: from$1256.token.lineStart,
                    endLineNumber: from$1256.token.lineNumber,
                    endLineStart: from$1256.token.lineStart
                }, to$1257);
            }
        } else {
            if (from$1256.token.type === parser$1203.Token.Delimiter) {
                next$1258 = syntaxFromToken$1207({
                    value: to$1257.token.value,
                    type: to$1257.token.type,
                    lineNumber: from$1256.token.startLineNumber,
                    lineStart: from$1256.token.startLineStart,
                    range: from$1256.token.startRange
                }, to$1257);
            } else {
                next$1258 = syntaxFromToken$1207({
                    value: to$1257.token.value,
                    type: to$1257.token.type,
                    lineNumber: from$1256.token.lineNumber,
                    lineStart: from$1256.token.lineStart,
                    range: from$1256.token.range
                }, to$1257);
            }
        }
        if (to$1257.token.leadingComments) {
            next$1258.token.leadingComments = to$1257.token.leadingComments;
        }
        if (to$1257.token.trailingComments) {
            next$1258.token.trailingComments = to$1257.token.trailingComments;
        }
        return next$1258;
    }
    function loadPattern$1228(patterns$1259) {
        return _$1201.chain(patterns$1259).reduce(function (acc$1262, patStx$1263, idx$1264) {
            var last$1265 = patterns$1259[idx$1264 - 1];
            var lastLast$1266 = patterns$1259[idx$1264 - 2];
            var next$1267 = patterns$1259[idx$1264 + 1];
            var nextNext$1268 = patterns$1259[idx$1264 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1263.token.value === ':') {
                if (last$1265 && isPatternVar$1220(last$1265) && !isPatternVar$1220(next$1267)) {
                    return acc$1262;
                }
            }
            if (last$1265 && last$1265.token.value === ':') {
                if (lastLast$1266 && isPatternVar$1220(lastLast$1266) && !isPatternVar$1220(patStx$1263)) {
                    return acc$1262;
                }
            }
            // skip over $
            if (patStx$1263.token.value === '$' && next$1267 && next$1267.token.type === parser$1203.Token.Delimiter) {
                return acc$1262;
            }
            if (isPatternVar$1220(patStx$1263)) {
                if (next$1267 && next$1267.token.value === ':' && !isPatternVar$1220(nextNext$1268)) {
                    if (typeof nextNext$1268 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1263.class = nextNext$1268.token.value;
                } else {
                    patStx$1263.class = 'token';
                }
            } else if (patStx$1263.token.type === parser$1203.Token.Delimiter) {
                if (last$1265 && last$1265.token.value === '$') {
                    patStx$1263.class = 'pattern_group';
                }
                patStx$1263.token.inner = loadPattern$1228(patStx$1263.token.inner);
            } else {
                patStx$1263.class = 'pattern_literal';
            }
            return acc$1262.concat(patStx$1263);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1269, patStx$1270, idx$1271, patterns$1272) {
            var separator$1273 = ' ';
            var repeat$1274 = false;
            var next$1275 = patterns$1272[idx$1271 + 1];
            var nextNext$1276 = patterns$1272[idx$1271 + 2];
            if (next$1275 && next$1275.token.value === '...') {
                repeat$1274 = true;
                separator$1273 = ' ';
            } else if (delimIsSeparator$1218(next$1275) && nextNext$1276 && nextNext$1276.token.value === '...') {
                repeat$1274 = true;
                parser$1203.assert(next$1275.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1273 = next$1275.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1270.token.value === '...' || delimIsSeparator$1218(patStx$1270) && next$1275 && next$1275.token.value === '...') {
                return acc$1269;
            }
            patStx$1270.repeat = repeat$1274;
            patStx$1270.separator = separator$1273;
            return acc$1269.concat(patStx$1270);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1230(patternClass$1277, stx$1278, env$1279) {
        var result$1280, rest$1281;
        // pattern has no parse class
        if (patternClass$1277 === 'token' && stx$1278[0] && stx$1278[0].token.type !== parser$1203.Token.EOF) {
            result$1280 = [stx$1278[0]];
            rest$1281 = stx$1278.slice(1);
        } else if (patternClass$1277 === 'lit' && stx$1278[0] && typeIsLiteral$1214(stx$1278[0].token.type)) {
            result$1280 = [stx$1278[0]];
            rest$1281 = stx$1278.slice(1);
        } else if (patternClass$1277 === 'ident' && stx$1278[0] && stx$1278[0].token.type === parser$1203.Token.Identifier) {
            result$1280 = [stx$1278[0]];
            rest$1281 = stx$1278.slice(1);
        } else if (stx$1278.length > 0 && patternClass$1277 === 'VariableStatement') {
            var match$1282 = expander$1204.enforest(stx$1278, expander$1204.makeExpanderContext({ env: env$1279 }));
            if (match$1282.result && match$1282.result.hasPrototype(expander$1204.VariableStatement)) {
                result$1280 = match$1282.result.destruct(false);
                rest$1281 = match$1282.rest;
            } else {
                result$1280 = null;
                rest$1281 = stx$1278;
            }
        } else if (stx$1278.length > 0 && patternClass$1277 === 'expr') {
            var match$1282 = expander$1204.get_expression(stx$1278, expander$1204.makeExpanderContext({ env: env$1279 }));
            if (match$1282.result === null || !match$1282.result.hasPrototype(expander$1204.Expr)) {
                result$1280 = null;
                rest$1281 = stx$1278;
            } else {
                result$1280 = match$1282.result.destruct(false);
                rest$1281 = match$1282.rest;
            }
        } else {
            result$1280 = null;
            rest$1281 = stx$1278;
        }
        return {
            result: result$1280,
            rest: rest$1281
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1232(patterns$1283, stx$1284, env$1285, topLevel$1286) {
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
        topLevel$1286 = topLevel$1286 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1287 = [];
        var patternEnv$1288 = {};
        var match$1289;
        var pattern$1290;
        var rest$1291 = stx$1284;
        var success$1292 = true;
        for (var i$1293 = 0; i$1293 < patterns$1283.length; i$1293++) {
            if (success$1292 === false) {
                break;
            }
            pattern$1290 = patterns$1283[i$1293];
            do {
                match$1289 = matchPattern$1234(pattern$1290, rest$1291, env$1285, patternEnv$1288);
                if (!match$1289.success && pattern$1290.repeat) {
                    // a repeat can match zero tokens and still be a
                    // "success" so break out of the inner loop and
                    // try the next pattern
                    break;
                }
                if (!match$1289.success) {
                    success$1292 = false;
                    break;
                }
                rest$1291 = match$1289.rest;
                patternEnv$1288 = match$1289.patternEnv;
                if (success$1292 && !(topLevel$1286 || pattern$1290.repeat)) {
                    // the very last pattern matched, inside a
                    // delimiter, not a repeat, *and* there are more
                    // unmatched bits of syntax
                    if (i$1293 == patterns$1283.length - 1 && rest$1291.length !== 0) {
                        success$1292 = false;
                        break;
                    }
                }
                if (pattern$1290.repeat && success$1292) {
                    if (rest$1291[0] && rest$1291[0].token.value === pattern$1290.separator) {
                        // more tokens and the next token matches the separator
                        rest$1291 = rest$1291.slice(1);
                    } else if (pattern$1290.separator === ' ') {
                        // no separator specified (using the empty string for this)
                        // so keep going
                        continue;
                    } else if (pattern$1290.separator !== ' ' && rest$1291.length > 0 && i$1293 === patterns$1283.length - 1 && topLevel$1286 === false) {
                        // separator is specified, there is a next token, the
                        // next token doesn't match the separator, there are
                        // no more patterns, and this is a top level pattern
                        // so the match has failed
                        success$1292 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$1290.repeat && success$1292 && rest$1291.length > 0);
        }
        return {
            success: success$1292,
            rest: rest$1291,
            patternEnv: patternEnv$1288
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
    function matchPattern$1234(pattern$1294, stx$1295, env$1296, patternEnv$1297) {
        var subMatch$1298;
        var match$1299, matchEnv$1300;
        var rest$1301;
        var success$1302;
        if (typeof pattern$1294.inner !== 'undefined') {
            if (pattern$1294.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1298 = matchPatterns$1232(pattern$1294.inner, stx$1295, env$1296, true);
                rest$1301 = subMatch$1298.rest;
            } else if (stx$1295[0] && stx$1295[0].token.type === parser$1203.Token.Delimiter && stx$1295[0].token.value === pattern$1294.value) {
                stx$1295[0].expose();
                if (pattern$1294.inner.length === 0 && stx$1295[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1295,
                        patternEnv: patternEnv$1297
                    };
                }
                subMatch$1298 = matchPatterns$1232(pattern$1294.inner, stx$1295[0].token.inner, env$1296, false);
                rest$1301 = stx$1295.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1295,
                    patternEnv: patternEnv$1297
                };
            }
            success$1302 = subMatch$1298.success;
            // merge the subpattern matches with the current pattern environment
            _$1201.keys(subMatch$1298.patternEnv).forEach(function (patternKey$1304) {
                if (pattern$1294.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1305 = subMatch$1298.patternEnv[patternKey$1304].level + 1;
                    if (patternEnv$1297[patternKey$1304]) {
                        patternEnv$1297[patternKey$1304].level = nextLevel$1305;
                        patternEnv$1297[patternKey$1304].match.push(subMatch$1298.patternEnv[patternKey$1304]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1297[patternKey$1304] = {
                            level: nextLevel$1305,
                            match: [subMatch$1298.patternEnv[patternKey$1304]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1297[patternKey$1304] = subMatch$1298.patternEnv[patternKey$1304];
                }
            });
        } else {
            if (pattern$1294.class === 'pattern_literal') {
                // wildcard
                if (stx$1295[0] && pattern$1294.value === '_') {
                    success$1302 = true;
                    rest$1301 = stx$1295.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1295[0] && pattern$1294.value === stx$1295[0].token.value) {
                    success$1302 = true;
                    rest$1301 = stx$1295.slice(1);
                } else {
                    success$1302 = false;
                    rest$1301 = stx$1295;
                }
            } else {
                match$1299 = matchPatternClass$1230(pattern$1294.class, stx$1295, env$1296);
                success$1302 = match$1299.result !== null;
                rest$1301 = match$1299.rest;
                matchEnv$1300 = {
                    level: 0,
                    match: match$1299.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1294.repeat) {
                    if (patternEnv$1297[pattern$1294.value]) {
                        patternEnv$1297[pattern$1294.value].match.push(matchEnv$1300);
                    } else {
                        // initialize if necessary
                        patternEnv$1297[pattern$1294.value] = {
                            level: 1,
                            match: [matchEnv$1300]
                        };
                    }
                } else {
                    patternEnv$1297[pattern$1294.value] = matchEnv$1300;
                }
            }
        }
        return {
            success: success$1302,
            rest: rest$1301,
            patternEnv: patternEnv$1297
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1236(macroBody$1306, macroNameStx$1307, env$1308) {
        return _$1201.chain(macroBody$1306).reduce(function (acc$1311, bodyStx$1312, idx$1313, original$1314) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1315 = original$1314[idx$1313 - 1];
            var next$1316 = original$1314[idx$1313 + 1];
            var nextNext$1317 = original$1314[idx$1313 + 2];
            // drop `...`
            if (bodyStx$1312.token.value === '...') {
                return acc$1311;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1218(bodyStx$1312) && next$1316 && next$1316.token.value === '...') {
                return acc$1311;
            }
            // skip the $ in $(...)
            if (bodyStx$1312.token.value === '$' && next$1316 && next$1316.token.type === parser$1203.Token.Delimiter && next$1316.token.value === '()') {
                return acc$1311;
            }
            // mark $[...] as a literal
            if (bodyStx$1312.token.value === '$' && next$1316 && next$1316.token.type === parser$1203.Token.Delimiter && next$1316.token.value === '[]') {
                next$1316.literal = true;
                return acc$1311;
            }
            if (bodyStx$1312.token.type === parser$1203.Token.Delimiter && bodyStx$1312.token.value === '()' && last$1315 && last$1315.token.value === '$') {
                bodyStx$1312.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1312.literal === true) {
                parser$1203.assert(bodyStx$1312.token.type === parser$1203.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1311.concat(bodyStx$1312.token.inner);
            }
            if (next$1316 && next$1316.token.value === '...') {
                bodyStx$1312.repeat = true;
                bodyStx$1312.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1218(next$1316) && nextNext$1317 && nextNext$1317.token.value === '...') {
                bodyStx$1312.repeat = true;
                bodyStx$1312.separator = next$1316.token.inner[0].token.value;
            }
            return acc$1311.concat(bodyStx$1312);
        }, []).reduce(function (acc$1318, bodyStx$1319, idx$1320) {
            // then do the actual transcription
            if (bodyStx$1319.repeat) {
                if (bodyStx$1319.token.type === parser$1203.Token.Delimiter) {
                    bodyStx$1319.expose();
                    var fv$1322 = _$1201.filter(freeVarsInPattern$1212(bodyStx$1319.token.inner), function (pat$1333) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1308.hasOwnProperty(pat$1333);
                        });
                    var restrictedEnv$1323 = [];
                    var nonScalar$1325 = _$1201.find(fv$1322, function (pat$1334) {
                            return env$1308[pat$1334].level > 0;
                        });
                    parser$1203.assert(typeof nonScalar$1325 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1326 = env$1308[nonScalar$1325].match.length;
                    var sameLength$1328 = _$1201.all(fv$1322, function (pat$1335) {
                            return env$1308[pat$1335].level === 0 || env$1308[pat$1335].match.length === repeatLength$1326;
                        });
                    parser$1203.assert(sameLength$1328, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1323 = _$1201.map(_$1201.range(repeatLength$1326), function (idx$1336) {
                        var renv$1337 = {};
                        _$1201.each(fv$1322, function (pat$1339) {
                            if (env$1308[pat$1339].level === 0) {
                                // copy scalars over
                                renv$1337[pat$1339] = env$1308[pat$1339];
                            } else {
                                // grab the match at this index
                                renv$1337[pat$1339] = env$1308[pat$1339].match[idx$1336];
                            }
                        });
                        return renv$1337;
                    });
                    var transcribed$1331 = _$1201.map(restrictedEnv$1323, function (renv$1340) {
                            if (bodyStx$1319.group) {
                                return transcribe$1236(bodyStx$1319.token.inner, macroNameStx$1307, renv$1340);
                            } else {
                                var newBody$1341 = syntaxFromToken$1207(_$1201.clone(bodyStx$1319.token), bodyStx$1319);
                                newBody$1341.token.inner = transcribe$1236(bodyStx$1319.token.inner, macroNameStx$1307, renv$1340);
                                return newBody$1341;
                            }
                        });
                    var joined$1332;
                    if (bodyStx$1319.group) {
                        joined$1332 = joinSyntaxArr$1210(transcribed$1331, bodyStx$1319.separator);
                    } else {
                        joined$1332 = joinSyntax$1209(transcribed$1331, bodyStx$1319.separator);
                    }
                    return acc$1318.concat(joined$1332);
                }
                if (!env$1308[bodyStx$1319.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1319.token.value + ' is not bound for the template');
                } else if (env$1308[bodyStx$1319.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1319.token.value + ' does not match in the template');
                }
                return acc$1318.concat(joinRepeatedMatch$1222(env$1308[bodyStx$1319.token.value].match, bodyStx$1319.separator));
            } else {
                if (bodyStx$1319.token.type === parser$1203.Token.Delimiter) {
                    bodyStx$1319.expose();
                    var newBody$1342 = syntaxFromToken$1207(_$1201.clone(bodyStx$1319.token), macroBody$1306);
                    newBody$1342.token.inner = transcribe$1236(bodyStx$1319.token.inner, macroNameStx$1307, env$1308);
                    return acc$1318.concat(takeLineContext$1224(macroNameStx$1307, [newBody$1342]));
                }
                if (isPatternVar$1220(bodyStx$1319) && Object.prototype.hasOwnProperty.bind(env$1308)(bodyStx$1319.token.value)) {
                    if (!env$1308[bodyStx$1319.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1319.token.value + ' is not bound for the template');
                    } else if (env$1308[bodyStx$1319.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1319.token.value + ' does not match in the template');
                    }
                    return acc$1318.concat(takeLineContext$1224(macroNameStx$1307, env$1308[bodyStx$1319.token.value].match));
                }
                return acc$1318.concat(takeLineContext$1224(macroNameStx$1307, [bodyStx$1319]));
            }
        }, []).value();
    }
    exports$1200.loadPattern = loadPattern$1228;
    exports$1200.matchPatterns = matchPatterns$1232;
    exports$1200.transcribe = transcribe$1236;
    exports$1200.matchPatternClass = matchPatternClass$1230;
    exports$1200.takeLineContext = takeLineContext$1224;
    exports$1200.takeLine = takeLine$1226;
}));