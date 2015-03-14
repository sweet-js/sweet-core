"use strict";

var _8905 = require("underscore"),
    parser8906 = require("./parser"),
    expander8907 = require("./expander"),
    syntax8908 = require("./syntax"),
    assert8909 = require("assert");
var get_expression8910 = expander8907.get_expression;
var syntaxFromToken8911 = syntax8908.syntaxFromToken;
var makePunc8912 = syntax8908.makePunc;
var makeIdent8913 = syntax8908.makeIdent;
var makeDelim8914 = syntax8908.makeDelim;
var joinSyntax8915 = syntax8908.joinSyntax;
var joinSyntaxArray8916 = syntax8908.joinSyntaxArray;
var cloneSyntax8917 = syntax8908.cloneSyntax;
var cloneSyntaxArray8918 = syntax8908.cloneSyntaxArray;
var throwSyntaxError8919 = syntax8908.throwSyntaxError;
var push8920 = Array.prototype.push;
function freeVarsInPattern8921(pattern8946) {
    var fv8947 = [];
    _8905.each(pattern8946, function (pat8948) {
        if (isPatternVar8925(pat8948)) {
            fv8947.push(pat8948.token.value);
        } else if (pat8948.token.type === parser8906.Token.Delimiter) {
            push8920.apply(fv8947, freeVarsInPattern8921(pat8948.token.inner));
        }
    });
    return fv8947;
}
function typeIsLiteral8922(type8949) {
    return type8949 === parser8906.Token.NullLiteral || type8949 === parser8906.Token.NumericLiteral || type8949 === parser8906.Token.StringLiteral || type8949 === parser8906.Token.RegexLiteral || type8949 === parser8906.Token.BooleanLiteral;
}
function containsPatternVar8923(patterns8950) {
    return _8905.any(patterns8950, function (pat8951) {
        if (pat8951.token.type === parser8906.Token.Delimiter) {
            return containsPatternVar8923(pat8951.token.inner);
        }
        return isPatternVar8925(pat8951);
    });
}
function delimIsSeparator8924(delim8952) {
    return delim8952 && delim8952.token && delim8952.token.type === parser8906.Token.Delimiter && delim8952.token.value === "()" && delim8952.token.inner.length === 1 && delim8952.token.inner[0].token.type !== parser8906.Token.Delimiter && !containsPatternVar8923(delim8952.token.inner);
}
function isPatternVar8925(stx8953) {
    return stx8953.token.value[0] === "$" && stx8953.token.value !== "$";
}
function joinRepeatedMatch8926(tojoin8954, punc8955) {
    return _8905.reduce(_8905.rest(tojoin8954, 1), function (acc8956, join8957) {
        if (punc8955 === " ") {
            return acc8956.concat(cloneSyntaxArray8918(join8957.match));
        }
        return acc8956.concat(cloneSyntax8917(punc8955), cloneSyntaxArray8918(join8957.match));
    }, cloneSyntaxArray8918(_8905.first(tojoin8954).match));
}
function takeLineContext8927(from8958, to8959) {
    return _8905.map(to8959, function (stx8960) {
        return takeLine8928(from8958, stx8960);
    });
}
function takeLine8928(from8961, to8962) {
    var next8963;
    if (to8962.token.type === parser8906.Token.Delimiter) {
        var sm_startLineNumber8964 = typeof to8962.token.sm_startLineNumber !== "undefined" ? to8962.token.sm_startLineNumber : to8962.token.startLineNumber;
        var sm_endLineNumber8965 = typeof to8962.token.sm_endLineNumber !== "undefined" ? to8962.token.sm_endLineNumber : to8962.token.endLineNumber;
        var sm_startLineStart8966 = typeof to8962.token.sm_startLineStart !== "undefined" ? to8962.token.sm_startLineStart : to8962.token.startLineStart;
        var sm_endLineStart8967 = typeof to8962.token.sm_endLineStart !== "undefined" ? to8962.token.sm_endLineStart : to8962.token.endLineStart;
        var sm_startRange8968 = typeof to8962.token.sm_startRange !== "undefined" ? to8962.token.sm_startRange : to8962.token.startRange;
        var sm_endRange8969 = typeof to8962.token.sm_endRange !== "undefined" ? to8962.token.sm_endRange : to8962.token.endRange;
        if (from8961.token.type === parser8906.Token.Delimiter) {
            next8963 = syntaxFromToken8911({
                type: parser8906.Token.Delimiter,
                value: to8962.token.value,
                inner: takeLineContext8927(from8961, to8962.token.inner),
                startRange: from8961.token.startRange,
                endRange: from8961.token.endRange,
                startLineNumber: from8961.token.startLineNumber,
                startLineStart: from8961.token.startLineStart,
                endLineNumber: from8961.token.endLineNumber,
                endLineStart: from8961.token.endLineStart,
                sm_startLineNumber: sm_startLineNumber8964,
                sm_endLineNumber: sm_endLineNumber8965,
                sm_startLineStart: sm_startLineStart8966,
                sm_endLineStart: sm_endLineStart8967,
                sm_startRange: sm_startRange8968,
                sm_endRange: sm_endRange8969
            }, to8962);
        } else {
            next8963 = syntaxFromToken8911({
                type: parser8906.Token.Delimiter,
                value: to8962.token.value,
                inner: takeLineContext8927(from8961, to8962.token.inner),
                startRange: from8961.token.range,
                endRange: from8961.token.range,
                startLineNumber: from8961.token.lineNumber,
                startLineStart: from8961.token.lineStart,
                endLineNumber: from8961.token.lineNumber,
                endLineStart: from8961.token.lineStart,
                sm_startLineNumber: sm_startLineNumber8964,
                sm_endLineNumber: sm_endLineNumber8965,
                sm_startLineStart: sm_startLineStart8966,
                sm_endLineStart: sm_endLineStart8967,
                sm_startRange: sm_startRange8968,
                sm_endRange: sm_endRange8969
            }, to8962);
        }
    } else {
        var sm_lineNumber8970 = typeof to8962.token.sm_lineNumber !== "undefined" ? to8962.token.sm_lineNumber : to8962.token.lineNumber;
        var sm_lineStart8971 = typeof to8962.token.sm_lineStart !== "undefined" ? to8962.token.sm_lineStart : to8962.token.lineStart;
        var sm_range8972 = typeof to8962.token.sm_range !== "undefined" ? to8962.token.sm_range : to8962.token.range;
        if (from8961.token.type === parser8906.Token.Delimiter) {
            next8963 = syntaxFromToken8911({
                value: to8962.token.value,
                type: to8962.token.type,
                lineNumber: from8961.token.startLineNumber,
                lineStart: from8961.token.startLineStart,
                range: from8961.token.startRange,
                sm_lineNumber: sm_lineNumber8970,
                sm_lineStart: sm_lineStart8971,
                sm_range: sm_range8972
            }, to8962);
        } else {
            next8963 = syntaxFromToken8911({
                value: to8962.token.value,
                type: to8962.token.type,
                lineNumber: from8961.token.lineNumber,
                lineStart: from8961.token.lineStart,
                range: from8961.token.range,
                sm_lineNumber: sm_lineNumber8970,
                sm_lineStart: sm_lineStart8971,
                sm_range: sm_range8972
            }, to8962);
        }
    }
    if (to8962.token.leadingComments) {
        next8963.token.leadingComments = to8962.token.leadingComments;
    }
    if (to8962.token.trailingComments) {
        next8963.token.trailingComments = to8962.token.trailingComments;
    }
    return next8963;
}
function reversePattern8929(patterns8973) {
    var len8974 = patterns8973.length;
    var pat8975;
    return _8905.reduceRight(patterns8973, function (acc8976, pat8977) {
        if (pat8977["class"] === "pattern_group" || pat8977["class"] === "named_group") {
            pat8977.inner = reversePattern8929(pat8977.inner);
        }
        if (pat8977.repeat) {
            pat8977.leading = !pat8977.leading;
        }
        acc8976.push(pat8977);
        return acc8976;
    }, []);
}
function loadLiteralGroup8930(patterns8978) {
    return patterns8978.map(function (patStx8979) {
        var pat8980 = patternToObject8931(patStx8979);
        if (pat8980.inner) {
            pat8980.inner = loadLiteralGroup8930(pat8980.inner);
        } else {
            pat8980["class"] = "pattern_literal";
        }
        return pat8980;
    });
}
function patternToObject8931(pat8981) {
    var obj8982 = {
        type: pat8981.token.type,
        value: pat8981.token.value
    };
    if (pat8981.token.inner) {
        obj8982.inner = pat8981.token.inner;
    }
    return obj8982;
}
function isPrimaryClass8932(name8983) {
    return ["expr", "lit", "ident", "token", "invoke", "invokeRec"].indexOf(name8983) > -1;
}
function loadPattern8933(patterns8984, reverse8985) {
    var patts8986 = [];
    for (var i8987 = 0; i8987 < patterns8984.length; i8987++) {
        var tok18988 = patterns8984[i8987];
        var tok28989 = patterns8984[i8987 + 1];
        var tok38990 = patterns8984[i8987 + 2];
        var tok48991 = patterns8984[i8987 + 3];
        var last8992 = patts8986[patts8986.length - 1];
        var patt8993;
        assert8909(tok18988, "Expecting syntax object");
        if ( // Repeaters
        tok18988.token.type === parser8906.Token.Delimiter && tok18988.token.value === "()" && tok28989 && tok28989.token.type === parser8906.Token.Punctuator && tok28989.token.value === "..." && last8992) {
            assert8909(tok18988.token.inner.length === 1, "currently assuming all separators are a single token");
            i8987 += 1;
            last8992.repeat = true;
            last8992.separator = tok18988.token.inner[0];
            continue;
        } else if (tok18988.token.type === parser8906.Token.Punctuator && tok18988.token.value === "..." && last8992) {
            last8992.repeat = true;
            last8992.separator = " ";
            continue;
        } else if (isPatternVar8925(tok18988)) {
            patt8993 = patternToObject8931(tok18988);
            if (tok28989 && tok28989.token.type === parser8906.Token.Punctuator && tok28989.token.value === ":" && tok38990 && (tok38990.token.type === parser8906.Token.Identifier || tok38990.token.type === parser8906.Token.Delimiter && (tok38990.token.value === "[]" || tok38990.token.value === "()"))) {
                i8987 += 2;
                if (tok38990.token.value === "[]") {
                    patt8993["class"] = "named_group";
                    patt8993.inner = loadLiteralGroup8930(tok38990.token.inner);
                } else if (tok38990.token.value === "()") {
                    patt8993["class"] = "named_group";
                    patt8993.inner = loadPattern8933(tok38990.token.inner);
                } else if (isPrimaryClass8932(tok38990.token.value)) {
                    patt8993["class"] = tok38990.token.value;
                    if (patt8993["class"] === "invokeRec" || patt8993["class"] === "invoke") {
                        i8987 += 1;
                        if (tok48991.token.value === "()" && tok48991.token.inner.length) {
                            patt8993.macroName = tok48991.token.inner;
                        } else {
                            throwSyntaxError8919(patt8993["class"], "Expected macro parameter", tok38990);
                        }
                    }
                } else {
                    patt8993["class"] = "invoke";
                    patt8993.macroName = [tok38990];
                }
            } else {
                patt8993["class"] = "token";
            }
        } else if (tok18988.token.type === parser8906.Token.Identifier && tok18988.token.value === "$" && tok28989.token.type === parser8906.Token.Delimiter) {
            i8987 += 1;
            patt8993 = patternToObject8931(tok28989);
            patt8993["class"] = "pattern_group";
            if (patt8993.value === "[]") {
                patt8993.inner = loadLiteralGroup8930(patt8993.inner);
            } else {
                patt8993.inner = loadPattern8933(tok28989.token.inner);
            }
        } else if (tok18988.token.type === parser8906.Token.Identifier && tok18988.token.value === "_") {
            patt8993 = patternToObject8931(tok18988);
            patt8993["class"] = "wildcard";
        } else {
            patt8993 = patternToObject8931(tok18988);
            patt8993["class"] = "pattern_literal";
            if (patt8993.inner) {
                patt8993.inner = loadPattern8933(tok18988.token.inner);
            }
        }
        if ( // Macro classes aren't allowed in lookbehind because we wouldn't
        // know where to insert the macro, and you can't use a L->R macro
        // to match R->L.
        reverse8985 && patt8993.macroName) {
            throwSyntaxError8919(patt8993["class"], "Not allowed in top-level lookbehind", patt8993.macroName[0]);
        }
        patts8986.push(patt8993);
    }
    return reverse8985 ? reversePattern8929(patts8986) : patts8986;
}
function cachedTermMatch8934(stx8994, term8995) {
    var res8996 = [];
    var i8997 = 0;
    while (stx8994[i8997] && stx8994[i8997].term === term8995) {
        res8996.unshift(stx8994[i8997]);
        i8997++;
    }
    return {
        result: term8995,
        destructed: res8996,
        rest: stx8994.slice(res8996.length)
    };
}
function expandWithMacro8935(macroName8998, stx8999, context9000, rec9001) {
    var name9002 = macroName8998.map(syntax8908.unwrapSyntax).join("");
    var ident9003 = syntax8908.makeIdent(name9002, macroName8998[0]);
    var macroObj9004 = expander8907.getSyntaxTransform(ident9003, context9000, context9000.phase);
    var newContext9005 = expander8907.makeExpanderContext(context9000);
    if (!macroObj9004) {
        throwSyntaxError8919("invoke", "Macro not in scope", macroName8998[0]);
    }
    var next9006 = macroName8998.slice(-1).concat(stx8999);
    var rest9007, result9008, rt9009, patternEnv9010;
    while (macroObj9004 && next9006) {
        try {
            rt9009 = macroObj9004.fn(next9006, newContext9005, [], []);
            result9008 = rt9009.result;
            rest9007 = rt9009.rest;
            patternEnv9010 = rt9009.patterns;
        } catch (e9011) {
            if (e9011 instanceof syntax8908.SyntaxCaseError) {
                result9008 = null;
                rest9007 = stx8999;
                break;
            } else {
                throw e9011;
            }
        }
        if (rec9001 && result9008.length >= 1) {
            var nextMacro9012 = expander8907.getSyntaxTransform(result9008, context9000, context9000.phase);
            if (nextMacro9012) {
                macroObj9004 = nextMacro9012;
                next9006 = result9008.concat(rest9007);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    return {
        result: result9008,
        rest: rest9007,
        patternEnv: patternEnv9010
    };
}
function matchPatternClass8936(patternObj9013, stx9014, context9015) {
    var result9016, rest9017, match9018, patternEnv9019;
    if ( // pattern has no parse class
    patternObj9013["class"] === "token" && stx9014[0] && stx9014[0].token.type !== parser8906.Token.EOF) {
        result9016 = [stx9014[0]];
        rest9017 = stx9014.slice(1);
    } else if (patternObj9013["class"] === "lit" && stx9014[0] && typeIsLiteral8922(stx9014[0].token.type)) {
        result9016 = [stx9014[0]];
        rest9017 = stx9014.slice(1);
    } else if (patternObj9013["class"] === "ident" && stx9014[0] && stx9014[0].token.type === parser8906.Token.Identifier) {
        result9016 = [stx9014[0]];
        rest9017 = stx9014.slice(1);
    } else if (stx9014.length > 0 && patternObj9013["class"] === "VariableStatement") {
        match9018 = stx9014[0].term ? cachedTermMatch8934(stx9014, stx9014[0].term) : expander8907.enforest(stx9014, expander8907.makeExpanderContext(context9015));
        if (match9018.result && match9018.result.isVariableStatementTerm) {
            result9016 = match9018.destructed || match9018.result.destruct(context9015);
            rest9017 = match9018.rest;
        } else {
            result9016 = null;
            rest9017 = stx9014;
        }
    } else if (stx9014.length > 0 && patternObj9013["class"] === "expr") {
        match9018 = expander8907.get_expression(stx9014, expander8907.makeExpanderContext(context9015));
        if (match9018.result === null || !match9018.result.isExprTerm) {
            result9016 = null;
            rest9017 = stx9014;
        } else {
            result9016 = match9018.destructed || match9018.result.destruct(context9015);
            result9016 = [syntax8908.makeDelim("()", result9016, result9016[0])];
            rest9017 = match9018.rest;
        }
    } else if (stx9014.length > 0 && (patternObj9013["class"] === "invoke" || patternObj9013["class"] === "invokeRec")) {
        match9018 = expandWithMacro8935(patternObj9013.macroName, stx9014, context9015, patternObj9013["class"] === "invokeRec");
        result9016 = match9018.result;
        rest9017 = match9018.result ? match9018.rest : stx9014;
        patternEnv9019 = match9018.patternEnv;
    } else {
        result9016 = null;
        rest9017 = stx9014;
    }
    return {
        result: result9016,
        rest: rest9017,
        patternEnv: patternEnv9019
    };
}
function matchPatterns8937(patterns9020, stx9021, context9022, topLevel9023) {
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
    topLevel9023 = topLevel9023 || false;
    // note that there are two environments floating around,
    // one is the mapping of identifiers to macro definitions (env)
    // and the other is the pattern environment (patternEnv) that maps
    // patterns in a macro case to syntax.
    var result9024 = [];
    var patternEnv9025 = {};
    var match9026;
    var pattern9027;
    var rest9028 = stx9021;
    var success9029 = true;
    var inLeading9030;
    patternLoop: for (var i9031 = 0; i9031 < patterns9020.length; i9031++) {
        if (success9029 === false) {
            break;
        }
        pattern9027 = patterns9020[i9031];
        inLeading9030 = false;
        do {
            if ( // handles cases where patterns trail a repeated pattern like `$x ... ;`
            pattern9027.repeat && i9031 + 1 < patterns9020.length) {
                var restMatch9033 = matchPatterns8937(patterns9020.slice(i9031 + 1), rest9028, context9022, topLevel9023);
                if (restMatch9033.success) {
                    // match the repeat pattern on the empty array to fill in its
                    // pattern variable in the environment
                    match9026 = matchPattern8938(pattern9027, [], context9022, patternEnv9025, topLevel9023);
                    patternEnv9025 = _8905.extend(restMatch9033.patternEnv, match9026.patternEnv);
                    rest9028 = restMatch9033.rest;
                    break patternLoop;
                }
            }
            if (pattern9027.repeat && pattern9027.leading && pattern9027.separator !== " ") {
                if (rest9028[0].token.value === pattern9027.separator.token.value) {
                    if (!inLeading9030) {
                        inLeading9030 = true;
                    }
                    rest9028 = rest9028.slice(1);
                } else {
                    if ( // If we are in a leading repeat, the separator is required.
                    inLeading9030) {
                        success9029 = false;
                        break;
                    }
                }
            }
            match9026 = matchPattern8938(pattern9027, rest9028, context9022, patternEnv9025, topLevel9023);
            if (!match9026.success && pattern9027.repeat) {
                // a repeat can match zero tokens and still be a
                // "success" so break out of the inner loop and
                // try the next pattern
                break;
            }
            if (!match9026.success) {
                success9029 = false;
                break;
            }
            rest9028 = match9026.rest;
            patternEnv9025 = match9026.patternEnv;
            if (success9029 && !(topLevel9023 || pattern9027.repeat)) {
                if ( // the very last pattern matched, inside a
                // delimiter, not a repeat, *and* there are more
                // unmatched bits of syntax
                i9031 == patterns9020.length - 1 && rest9028.length !== 0) {
                    success9029 = false;
                    break;
                }
            }
            if (pattern9027.repeat && !pattern9027.leading && success9029) {
                if ( // if (i < patterns.length - 1 && rest.length > 0) {
                //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                //     if (restMatch.success) {
                //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                //         rest = restMatch.rest;
                //         break patternLoop;
                //     }
                // }
                pattern9027.separator === " ") {
                    // no separator specified (using the empty string for this)
                    // so keep going
                    continue;
                } else if (rest9028[0] && rest9028[0].token.value === pattern9027.separator.token.value) {
                    // more tokens and the next token matches the separator
                    rest9028 = rest9028.slice(1);
                } else if (pattern9027.separator !== " " && rest9028.length > 0 && i9031 === patterns9020.length - 1 && topLevel9023 === false) {
                    // separator is specified, there is a next token, the
                    // next token doesn't match the separator, there are
                    // no more patterns, and this is a top level pattern
                    // so the match has failed
                    success9029 = false;
                    break;
                } else {
                    break;
                }
            }
        } while (pattern9027.repeat && success9029 && rest9028.length > 0);
    }
    if ( // If we are in a delimiter and we haven't matched all the syntax, it
    // was a failed match.
    !topLevel9023 && rest9028.length) {
        success9029 = false;
    }
    var result9024;
    if (success9029) {
        result9024 = rest9028.length ? stx9021.slice(0, -rest9028.length) : stx9021;
    } else {
        result9024 = [];
    }
    return {
        success: success9029,
        result: result9024,
        rest: rest9028,
        patternEnv: patternEnv9025
    };
}
function matchPattern8938(pattern9034, stx9035, context9036, patternEnv9037, topLevel9038) {
    var subMatch9039;
    var match9040, matchEnv9041;
    var rest9042;
    var success9043;
    if (typeof pattern9034.inner !== "undefined") {
        if (pattern9034["class"] === "pattern_group") {
            // pattern groups don't match the delimiters
            subMatch9039 = matchPatterns8937(pattern9034.inner, stx9035, context9036, true);
            rest9042 = subMatch9039.rest;
            success9043 = subMatch9039.success;
        } else if (pattern9034["class"] === "named_group") {
            subMatch9039 = matchPatterns8937(pattern9034.inner, stx9035, context9036, true);
            rest9042 = subMatch9039.rest;
            success9043 = subMatch9039.success;
            if (success9043) {
                var namedMatch9044 = {};
                namedMatch9044[pattern9034.value] = {
                    level: 0,
                    match: subMatch9039.result,
                    topLevel: topLevel9038
                };
                subMatch9039.patternEnv = loadPatternEnv8940(namedMatch9044, subMatch9039.patternEnv, topLevel9038, false, pattern9034.value);
            }
        } else if (stx9035[0] && stx9035[0].token.type === parser8906.Token.Delimiter && stx9035[0].token.value === pattern9034.value) {
            if (pattern9034.inner.length === 0 && stx9035[0].token.inner.length !== 0) {
                return {
                    success: false,
                    rest: stx9035,
                    patternEnv: patternEnv9037
                };
            }
            subMatch9039 = matchPatterns8937(pattern9034.inner, stx9035[0].token.inner, context9036, false);
            rest9042 = stx9035.slice(1);
            success9043 = subMatch9039.success;
        } else {
            subMatch9039 = matchPatterns8937(pattern9034.inner, [], context9036, false);
            success9043 = false;
        }
        if (success9043) {
            patternEnv9037 = loadPatternEnv8940(patternEnv9037, subMatch9039.patternEnv, topLevel9038, pattern9034.repeat);
        } else if (pattern9034.repeat) {
            patternEnv9037 = initPatternEnv8939(patternEnv9037, subMatch9039.patternEnv, topLevel9038);
        }
    } else {
        if (pattern9034["class"] === "wildcard") {
            success9043 = true;
            rest9042 = stx9035.slice(1);
        } else if (pattern9034["class"] === "pattern_literal") {
            if ( // match the literal but don't update the pattern environment
            stx9035[0] && pattern9034.value === stx9035[0].token.value) {
                success9043 = true;
                rest9042 = stx9035.slice(1);
            } else {
                success9043 = false;
                rest9042 = stx9035;
            }
        } else {
            match9040 = matchPatternClass8936(pattern9034, stx9035, context9036);
            success9043 = match9040.result !== null;
            rest9042 = match9040.rest;
            matchEnv9041 = {
                level: 0,
                match: match9040.result,
                topLevel: topLevel9038
            };
            if ( // push the match onto this value's slot in the environment
            pattern9034.repeat) {
                if (patternEnv9037[pattern9034.value] && success9043) {
                    patternEnv9037[pattern9034.value].match.push(matchEnv9041);
                } else if (patternEnv9037[pattern9034.value] === undefined) {
                    // initialize if necessary
                    patternEnv9037[pattern9034.value] = {
                        level: 1,
                        match: [matchEnv9041],
                        topLevel: topLevel9038
                    };
                }
            } else {
                patternEnv9037[pattern9034.value] = matchEnv9041;
            }
            patternEnv9037 = loadPatternEnv8940(patternEnv9037, match9040.patternEnv, topLevel9038, pattern9034.repeat, pattern9034.value);
        }
    }
    return {
        success: success9043,
        rest: rest9042,
        patternEnv: patternEnv9037
    };
}
function initPatternEnv8939(toEnv9045, fromEnv9046, topLevel9047) {
    _8905.forEach(fromEnv9046, function (patternVal9048, patternKey9049) {
        if (!toEnv9045[patternKey9049]) {
            toEnv9045[patternKey9049] = {
                level: patternVal9048.level + 1,
                match: [patternVal9048],
                topLevel: topLevel9047
            };
        }
    });
    return toEnv9045;
}
function loadPatternEnv8940(toEnv9050, fromEnv9051, topLevel9052, repeat9053, prefix9054) {
    prefix9054 = prefix9054 || "";
    _8905.forEach(fromEnv9051, function (patternVal9055, patternKey9056) {
        var patternName9057 = prefix9054 + patternKey9056;
        if (repeat9053) {
            var nextLevel9058 = patternVal9055.level + 1;
            if (toEnv9050[patternName9057]) {
                toEnv9050[patternName9057].level = nextLevel9058;
                toEnv9050[patternName9057].match.push(patternVal9055);
            } else {
                toEnv9050[patternName9057] = {
                    level: nextLevel9058,
                    match: [patternVal9055],
                    topLevel: topLevel9052
                };
            }
        } else {
            toEnv9050[patternName9057] = patternVal9055;
        }
    });
    return toEnv9050;
}
function matchLookbehind8941(patterns9059, stx9060, terms9061, context9062) {
    var success9063, patternEnv9064, prevStx9065, prevTerms9066;
    if ( // No lookbehind, noop.
    !patterns9059.length) {
        success9063 = true;
        patternEnv9064 = {};
        prevStx9065 = stx9060;
        prevTerms9066 = terms9061;
    } else {
        var match9067 = matchPatterns8937(patterns9059, stx9060, context9062, true);
        var last9068 = match9067.result[match9067.result.length - 1];
        success9063 = match9067.success;
        patternEnv9064 = match9067.patternEnv;
        if (success9063) {
            if (match9067.rest.length) {
                if (last9068 && last9068.term && last9068.term === match9067.rest[0].term) {
                    // The term tree was split, so its a failed match;
                    success9063 = false;
                } else {
                    prevStx9065 = match9067.rest;
                    for (var
                    // Find where to slice the prevTerms to match up with
                    // the state of prevStx.
                    i9069 = 0, len9070 = terms9061.length; i9069 < len9070; i9069++) {
                        if (terms9061[i9069] === prevStx9065[0].term) {
                            prevTerms9066 = terms9061.slice(i9069);
                            break;
                        }
                    }
                    assert8909(prevTerms9066, "No matching previous term found");
                }
            } else {
                prevTerms9066 = [];
                prevStx9065 = [];
            }
        }
    }
    // We need to reverse the matches for any top level repeaters because
    // they match in reverse, and thus put their results in backwards.
    _8905.forEach(patternEnv9064, function (val9071, key9072) {
        if (val9071.level && val9071.match && val9071.topLevel) {
            val9071.match.reverse();
        }
    });
    return {
        success: success9063,
        patternEnv: patternEnv9064,
        prevStx: prevStx9065,
        prevTerms: prevTerms9066
    };
}
function hasMatch8942(m9073) {
    if (m9073.level === 0) {
        return m9073.match.length > 0;
    }
    return !!m9073.match;
}
function transcribe8943(macroBody9074, macroNameStx9075, env9076) {
    return _8905.chain(macroBody9074).reduce(function (acc9077, bodyStx9078, idx9079, original9080) {
        var // first find the ellipses and mark the syntax objects
        // (note that this step does not eagerly go into delimiter bodies)
        last9081 = original9080[idx9079 - 1];
        var next9082 = original9080[idx9079 + 1];
        var nextNext9083 = original9080[idx9079 + 2];
        if ( // drop `...`
        bodyStx9078.token.value === "...") {
            return acc9077;
        }
        if ( // drop `(<separator)` when followed by an ellipse
        delimIsSeparator8924(bodyStx9078) && next9082 && next9082.token.value === "...") {
            return acc9077;
        }
        if ( // skip the $ in $(...)
        bodyStx9078.token.value === "$" && next9082 && next9082.token.type === parser8906.Token.Delimiter && next9082.token.value === "()") {
            return acc9077;
        }
        if ( // mark $[...] as a literal
        bodyStx9078.token.value === "$" && next9082 && next9082.token.type === parser8906.Token.Delimiter && next9082.token.value === "[]") {
            next9082.literal = true;
            return acc9077;
        }
        if (bodyStx9078.token.type === parser8906.Token.Delimiter && bodyStx9078.token.value === "()" && last9081 && last9081.token.value === "$") {
            bodyStx9078.group = true;
        }
        if ( // literal [] delimiters have their bodies just
        // directly passed along
        bodyStx9078.literal === true) {
            assert8909(bodyStx9078.token.type === parser8906.Token.Delimiter, "expecting a literal to be surrounded by []");
            return acc9077.concat(bodyStx9078.token.inner);
        }
        if (next9082 && next9082.token.value === "...") {
            bodyStx9078.repeat = true;
            bodyStx9078.separator = " ";
        } else if (delimIsSeparator8924(next9082) && nextNext9083 && nextNext9083.token.value === "...") {
            bodyStx9078.repeat = true;
            bodyStx9078.separator = next9082.token.inner[0];
        }
        acc9077.push(bodyStx9078);
        return acc9077;
    }, []).reduce(function (acc9084, bodyStx9085, idx9086) {
        if ( // then do the actual transcription
        bodyStx9085.repeat) {
            if (bodyStx9085.token.type === parser8906.Token.Delimiter) {
                var fv9087 = _8905.filter(freeVarsInPattern8921(bodyStx9085.token.inner), function (pat9094) {
                    // ignore "patterns"
                    // that aren't in the
                    // environment (treat
                    // them like literals)
                    return env9076.hasOwnProperty(pat9094);
                });
                var restrictedEnv9088 = [];
                var nonScalar9089 = _8905.find(fv9087, function (pat9095) {
                    return env9076[pat9095].level > 0;
                });
                assert8909(typeof nonScalar9089 !== "undefined", "must have a least one non-scalar in repeat");
                var repeatLength9090 = env9076[nonScalar9089].match.length;
                var sameLength9091 = _8905.all(fv9087, function (pat9096) {
                    return env9076[pat9096].level === 0 || env9076[pat9096].match.length === repeatLength9090;
                });
                assert8909(sameLength9091, "all non-scalars must have the same length");
                // create a list of envs restricted to the free vars
                _8905.each(_8905.range(repeatLength9090), function (idx9097) {
                    var renv9098 = {};
                    _8905.each(fv9087, function (pat9100) {
                        if (env9076[pat9100].level === 0) {
                            // copy scalars over
                            renv9098[pat9100] = env9076[pat9100];
                        } else {
                            // grab the match at this index
                            renv9098[pat9100] = env9076[pat9100].match[idx9097];
                        }
                    });
                    var allHaveMatch9099 = Object.keys(renv9098).every(function (pat9101) {
                        return hasMatch8942(renv9098[pat9101]);
                    });
                    if (allHaveMatch9099) {
                        restrictedEnv9088.push(renv9098);
                    }
                });
                var transcribed9092 = _8905.map(restrictedEnv9088, function (renv9102) {
                    if (bodyStx9085.group) {
                        return transcribe8943(bodyStx9085.token.inner, macroNameStx9075, renv9102);
                    } else {
                        var newBody9103 = syntaxFromToken8911(_8905.clone(bodyStx9085.token), bodyStx9085);
                        newBody9103.token.inner = transcribe8943(bodyStx9085.token.inner, macroNameStx9075, renv9102);
                        return newBody9103;
                    }
                });
                var joined9093;
                if (bodyStx9085.group) {
                    joined9093 = joinSyntaxArray8916(transcribed9092, bodyStx9085.separator);
                } else {
                    joined9093 = joinSyntax8915(transcribed9092, bodyStx9085.separator);
                }
                push8920.apply(acc9084, joined9093);
                return acc9084;
            }
            if (!env9076[bodyStx9085.token.value]) {
                throwSyntaxError8919("patterns", "The pattern variable is not bound for the template", bodyStx9085);
            } else if (env9076[bodyStx9085.token.value].level !== 1) {
                throwSyntaxError8919("patterns", "Ellipses level does not match in the template", bodyStx9085);
            }
            push8920.apply(acc9084, joinRepeatedMatch8926(env9076[bodyStx9085.token.value].match, bodyStx9085.separator));
            return acc9084;
        } else {
            if (bodyStx9085.token.type === parser8906.Token.Delimiter) {
                var newBody9104 = syntaxFromToken8911(_8905.clone(bodyStx9085.token), macroBody9074);
                newBody9104.token.inner = transcribe8943(bodyStx9085.token.inner, macroNameStx9075, env9076);
                acc9084.push(newBody9104);
                return acc9084;
            }
            if (isPatternVar8925(bodyStx9085) && Object.prototype.hasOwnProperty.bind(env9076)(bodyStx9085.token.value)) {
                if (!env9076[bodyStx9085.token.value]) {
                    throwSyntaxError8919("patterns", "The pattern variable is not bound for the template", bodyStx9085);
                } else if (env9076[bodyStx9085.token.value].level !== 0) {
                    throwSyntaxError8919("patterns", "Ellipses level does not match in the template", bodyStx9085);
                }
                push8920.apply(acc9084, takeLineContext8927(bodyStx9085, env9076[bodyStx9085.token.value].match));
                return acc9084;
            }
            acc9084.push(syntaxFromToken8911(_8905.clone(bodyStx9085.token), bodyStx9085));
            return acc9084;
        }
    }, []).value();
}
function cloneMatch8944(oldMatch9105) {
    var newMatch9106 = {
        success: oldMatch9105.success,
        rest: oldMatch9105.rest,
        patternEnv: {}
    };
    for (var pat9107 in oldMatch9105.patternEnv) {
        if (oldMatch9105.patternEnv.hasOwnProperty(pat9107)) {
            newMatch9106.patternEnv[pat9107] = oldMatch9105.patternEnv[pat9107];
        }
    }
    return newMatch9106;
}
function makeIdentityRule8945(pattern9108, isInfix9109, context9110) {
    var inf9111 = [];
    var pat9112 = [];
    var stx9113 = [];
    if (isInfix9109) {
        for (var i9114 = 0; i9114 < pattern9108.length; i9114++) {
            if (pattern9108[i9114].token.type === parser8906.Token.Punctuator && pattern9108[i9114].token.value === "|") {
                pat9112.push(makeIdent8913("$inf", context9110), makePunc8912(":", context9110), makeDelim8914("()", inf9111, context9110), pattern9108[0], makeIdent8913("$id", context9110), makePunc8912(":", context9110), makeDelim8914("()", pat9112.slice(i9114 + 1), context9110));
                stx9113.push(makeIdent8913("$inf", context9110), makeIdent8913("$id", context9110));
                break;
            }
            inf9111.push(pattern9108[i9114]);
        }
    } else {
        pat9112.push(makeIdent8913("$id", context9110), makePunc8912(":", context9110), makeDelim8914("()", pattern9108, context9110));
        stx9113.push(makeIdent8913("$id", context9110));
    }
    return {
        pattern: pat9112,
        body: stx9113
    };
}
exports.loadPattern = loadPattern8933;
exports.matchPatterns = matchPatterns8937;
exports.matchLookbehind = matchLookbehind8941;
exports.transcribe = transcribe8943;
exports.matchPatternClass = matchPatternClass8936;
exports.takeLineContext = takeLineContext8927;
exports.takeLine = takeLine8928;
exports.typeIsLiteral = typeIsLiteral8922;
exports.cloneMatch = cloneMatch8944;
exports.makeIdentityRule = makeIdentityRule8945;
/*global require: true, exports:true
*/
//# sourceMappingURL=patterns.js.map