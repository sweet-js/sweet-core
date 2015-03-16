"use strict";

var codegen5338 = require("escodegen"),
    _5339 = require("underscore"),
    parser5340 = require("./parser"),
    syn5341 = require("./syntax"),
    se5342 = require("./scopedEval"),
    StringMap5343 = require("./data/stringMap"),
    NameMap5344 = require("./data/nameMap"),
    BindingMap5345 = require("./data/bindingMap"),
    SyntaxTransform5346 = require("./data/transforms").SyntaxTransform,
    VarTransform5347 = require("./data/transforms").VarTransform,
    resolve5348 = require("./stx/resolve").resolve,
    marksof5349 = require("./stx/resolve").marksof,
    arraysEqual5350 = require("./stx/resolve").arraysEqual,
    makeImportEntries5351 = require("./mod/importEntry").makeImportEntries,
    ExportEntry5352 = require("./mod/exportEntry").ExportEntry,
    ModuleRecord5353 = require("./mod/moduleRecord").ModuleRecord,
    patternModule5354 = require("./patterns"),
    vm5355 = require("vm"),
    assert5356 = require("assert"),
    termTree5357 = require("./data/termTree");
var throwSyntaxError5358 = syn5341.throwSyntaxError;
var throwSyntaxCaseError5359 = syn5341.throwSyntaxCaseError;
var SyntaxCaseError5360 = syn5341.SyntaxCaseError;
var unwrapSyntax5361 = syn5341.unwrapSyntax;
var makeIdent5362 = syn5341.makeIdent;
var makePunc5363 = syn5341.makePunc;
var makeDelim5364 = syn5341.makeDelim;
var makeValue5365 = syn5341.makeValue;
var adjustLineContext5366 = syn5341.adjustLineContext;
var fresh5367 = syn5341.fresh;
var freshScope5368 = syn5341.freshScope;
var makeMultiToken5369 = syn5341.makeMultiToken;
var Scope5370 = syn5341.Scope;
var TermTree5371 = termTree5357.TermTree,
    EOFTerm5372 = termTree5357.EOFTerm,
    KeywordTerm5373 = termTree5357.KeywordTerm,
    PuncTerm5374 = termTree5357.PuncTerm,
    DelimiterTerm5375 = termTree5357.DelimiterTerm,
    ModuleTimeTerm5376 = termTree5357.ModuleTimeTerm,
    ModuleTerm5377 = termTree5357.ModuleTerm,
    ImportTerm5378 = termTree5357.ImportTerm,
    ImportForPhaseTerm5379 = termTree5357.ImportForPhaseTerm,
    NamedImportTerm5380 = termTree5357.NamedImportTerm,
    DefaultImportTerm5381 = termTree5357.DefaultImportTerm,
    NamespaceImportTerm5382 = termTree5357.NamespaceImportTerm,
    BindingTerm5383 = termTree5357.BindingTerm,
    QualifiedBindingTerm5384 = termTree5357.QualifiedBindingTerm,
    ExportNameTerm5385 = termTree5357.ExportNameTerm,
    ExportDefaultTerm5386 = termTree5357.ExportDefaultTerm,
    ExportDeclTerm5387 = termTree5357.ExportDeclTerm,
    CompileTimeTerm5388 = termTree5357.CompileTimeTerm,
    MacroTerm5389 = termTree5357.MacroTerm,
    ClassDeclarationTerm5390 = termTree5357.ClassDeclarationTerm,
    OperatorDefinitionTerm5391 = termTree5357.OperatorDefinitionTerm,
    ForPhaseTerm5392 = termTree5357.ForPhaseTerm,
    VariableDeclarationTerm5393 = termTree5357.VariableDeclarationTerm,
    StatementTerm5394 = termTree5357.StatementTerm,
    EmptyTerm5395 = termTree5357.EmptyTerm,
    CatchClauseTerm5396 = termTree5357.CatchClauseTerm,
    ForStatementTerm5397 = termTree5357.ForStatementTerm,
    ReturnStatementTerm5398 = termTree5357.ReturnStatementTerm,
    ExprTerm5399 = termTree5357.ExprTerm,
    UnaryOpTerm5400 = termTree5357.UnaryOpTerm,
    PostfixOpTerm5401 = termTree5357.PostfixOpTerm,
    BinOpTerm5402 = termTree5357.BinOpTerm,
    AssignmentExpressionTerm5403 = termTree5357.AssignmentExpressionTerm,
    ConditionalExpressionTerm5404 = termTree5357.ConditionalExpressionTerm,
    NamedFunTerm5405 = termTree5357.NamedFunTerm,
    AnonFunTerm5406 = termTree5357.AnonFunTerm,
    ArrowFunTerm5407 = termTree5357.ArrowFunTerm,
    ObjDotGetTerm5408 = termTree5357.ObjDotGetTerm,
    ObjGetTerm5409 = termTree5357.ObjGetTerm,
    TemplateTerm5410 = termTree5357.TemplateTerm,
    CallTerm5411 = termTree5357.CallTerm,
    QuoteSyntaxTerm5412 = termTree5357.QuoteSyntaxTerm,
    StopQuotedTerm5413 = termTree5357.StopQuotedTerm,
    PrimaryExpressionTerm5414 = termTree5357.PrimaryExpressionTerm,
    ThisExpressionTerm5415 = termTree5357.ThisExpressionTerm,
    LitTerm5416 = termTree5357.LitTerm,
    BlockTerm5417 = termTree5357.BlockTerm,
    ArrayLiteralTerm5418 = termTree5357.ArrayLiteralTerm,
    IdTerm5419 = termTree5357.IdTerm,
    PartialTerm5420 = termTree5357.PartialTerm,
    PartialOperationTerm5421 = termTree5357.PartialOperationTerm,
    PartialExpressionTerm5422 = termTree5357.PartialExpressionTerm,
    BindingStatementTerm5423 = termTree5357.BindingStatementTerm,
    VariableStatementTerm5424 = termTree5357.VariableStatementTerm,
    LetStatementTerm5425 = termTree5357.LetStatementTerm,
    ConstStatementTerm5426 = termTree5357.ConstStatementTerm,
    ParenExpressionTerm5427 = termTree5357.ParenExpressionTerm;
var scopedEval5451 = se5342.scopedEval;
var syntaxFromToken5452 = syn5341.syntaxFromToken;
var joinSyntax5453 = syn5341.joinSyntax;
var builtinMode5454 = false;
var expandCount5455 = 0;
var maxExpands5456;
var availableModules5457;
var push5458 = Array.prototype.push;
function wrapDelim5459(towrap5516, delimSyntax5517) {
    assert5356(delimSyntax5517.isDelimiterToken(), "expecting a delimiter token");
    return syntaxFromToken5452({
        type: parser5340.Token.Delimiter,
        value: delimSyntax5517.token.value,
        inner: towrap5516,
        range: delimSyntax5517.token.range,
        startLineNumber: delimSyntax5517.token.startLineNumber,
        lineStart: delimSyntax5517.token.lineStart
    }, delimSyntax5517);
}
function getParamIdentifiers5460(argSyntax5518) {
    if (argSyntax5518.isDelimiter()) {
        return _5339.filter(argSyntax5518.token.inner, function (stx5519) {
            return stx5519.token.value !== ",";
        });
    } else if (argSyntax5518.isIdentifier()) {
        return [argSyntax5518];
    } else {
        assert5356(false, "expecting a delimiter or a single identifier for function parameters");
    }
}
function stxIsUnaryOp5461(stx5520) {
    var staticOperators5521 = ["+", "-", "~", "!", "delete", "void", "typeof", "yield", "new", "++", "--"];
    return _5339.contains(staticOperators5521, unwrapSyntax5361(stx5520));
}
function stxIsBinOp5462(stx5522) {
    var staticOperators5523 = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "<<", ">>", ">>>"];
    return _5339.contains(staticOperators5523, unwrapSyntax5361(stx5522));
}
function getUnaryOpPrec5463(op5524) {
    var operatorPrecedence5525 = {
        "new": 16,
        "++": 15,
        "--": 15,
        "!": 14,
        "~": 14,
        "+": 14,
        "-": 14,
        "typeof": 14,
        "void": 14,
        "delete": 14,
        "yield": 2
    };
    return operatorPrecedence5525[op5524];
}
function getBinaryOpPrec5464(op5526) {
    var operatorPrecedence5527 = {
        "*": 13,
        "/": 13,
        "%": 13,
        "+": 12,
        "-": 12,
        ">>": 11,
        "<<": 11,
        ">>>": 11,
        "<": 10,
        "<=": 10,
        ">": 10,
        ">=": 10,
        "in": 10,
        "instanceof": 10,
        "==": 9,
        "!=": 9,
        "===": 9,
        "!==": 9,
        "&": 8,
        "^": 7,
        "|": 6,
        "&&": 5,
        "||": 4
    };
    return operatorPrecedence5527[op5526];
}
function getBinaryOpAssoc5465(op5528) {
    var operatorAssoc5529 = {
        "*": "left",
        "/": "left",
        "%": "left",
        "+": "left",
        "-": "left",
        ">>": "left",
        "<<": "left",
        ">>>": "left",
        "<": "left",
        "<=": "left",
        ">": "left",
        ">=": "left",
        "in": "left",
        "instanceof": "left",
        "==": "left",
        "!=": "left",
        "===": "left",
        "!==": "left",
        "&": "left",
        "^": "left",
        "|": "left",
        "&&": "left",
        "||": "left"
    };
    return operatorAssoc5529[op5528];
}
function stxIsAssignOp5466(stx5530) {
    var staticOperators5531 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
    return _5339.contains(staticOperators5531, unwrapSyntax5361(stx5530));
}
function enforestImportClause5467(stx5532) {
    if (stx5532[0] && stx5532[0].isDelimiter()) {
        return {
            result: NamedImportTerm5380.create(stx5532[0]),
            rest: stx5532.slice(1)
        };
    } else if (stx5532[0] && stx5532[0].isPunctuator() && unwrapSyntax5361(stx5532[0]) === "*" && stx5532[1] && unwrapSyntax5361(stx5532[1]) === "as" && stx5532[2]) {
        return {
            result: NamespaceImportTerm5382.create(stx5532[0], stx5532[1], stx5532[2]),
            rest: stx5532.slice(3)
        };
    } else {
        return {
            result: DefaultImportTerm5381.create(stx5532[0]),
            rest: stx5532.slice(1)
        };
    }
}
function enforestImportClauseList5468(stx5533) {
    var res5534 = [];
    var clause5535 = enforestImportClause5467(stx5533);
    var rest5536 = clause5535.rest;
    res5534.push(clause5535.result);
    if (rest5536[0] && rest5536[0].isPunctuator() && unwrapSyntax5361(rest5536[0]) === ",") {
        res5534.push(rest5536[0]);
        clause5535 = enforestImportClause5467(rest5536.slice(1));
        res5534.push(clause5535.result);
        rest5536 = clause5535.rest;
    }
    return {
        result: res5534,
        rest: rest5536
    };
}
function enforestImport5469(head5537, rest5538) {
    assert5356(unwrapSyntax5361(head5537) === "import", "only call for imports");
    var clause5539 = enforestImportClauseList5468(rest5538);
    rest5538 = clause5539.rest;
    if (rest5538[0] && unwrapSyntax5361(rest5538[0]) === "from" && rest5538[1] && rest5538[1].isStringLiteral() && rest5538[2] && unwrapSyntax5361(rest5538[2]) === "for" && rest5538[3] && unwrapSyntax5361(rest5538[3]) === "phase" && rest5538[4] && rest5538[4].isNumericLiteral()) {
        var importRest5540;
        if (rest5538[5] && rest5538[5].isPunctuator() && rest5538[5].token.value === ";") {
            importRest5540 = rest5538.slice(6);
        } else {
            importRest5540 = rest5538.slice(5);
        }
        return {
            result: ImportForPhaseTerm5379.create(head5537, clause5539.result, rest5538[0], rest5538[1], rest5538[2], rest5538[3], rest5538[4]),
            rest: importRest5540
        };
    } else if (rest5538[0] && unwrapSyntax5361(rest5538[0]) === "from" && rest5538[1] && rest5538[1].isStringLiteral()) {
        var importRest5540;
        if (rest5538[2] && rest5538[2].isPunctuator() && rest5538[2].token.value === ";") {
            importRest5540 = rest5538.slice(3);
        } else {
            importRest5540 = rest5538.slice(2);
        }
        return {
            result: ImportTerm5378.create(head5537, clause5539.result, rest5538[0], rest5538[1]),
            rest: importRest5540
        };
    } else {
        throwSyntaxError5358("enforest", "unrecognized import syntax", rest5538);
    }
}
function enforestVarStatement5470(stx5542, context5543, varStx5544) {
    var decls5545 = [];
    var rest5546 = stx5542;
    var rhs5547;
    if (!rest5546.length) {
        throwSyntaxError5358("enforest", "Unexpected end of input", varStx5544);
    }
    if (expandCount5455 >= maxExpands5456) {
        return null;
    }
    while (rest5546.length) {
        if (rest5546[0].isIdentifier()) {
            if (rest5546[1] && rest5546[1].isPunctuator() && rest5546[1].token.value === "=") {
                rhs5547 = get_expression5486(rest5546.slice(2), context5543);
                if (rhs5547.result == null) {
                    throwSyntaxError5358("enforest", "Unexpected token", rhs5547.rest[0]);
                }
                if (rhs5547.rest[0] && rhs5547.rest[0].isPunctuator() && rhs5547.rest[0].token.value === ",") {
                    decls5545.push(VariableDeclarationTerm5393.create(rest5546[0], rest5546[1], rhs5547.result, rhs5547.rest[0]));
                    rest5546 = rhs5547.rest.slice(1);
                    continue;
                } else {
                    decls5545.push(VariableDeclarationTerm5393.create(rest5546[0], rest5546[1], rhs5547.result, null));
                    rest5546 = rhs5547.rest;
                    break;
                }
            } else if (rest5546[1] && rest5546[1].isPunctuator() && rest5546[1].token.value === ",") {
                decls5545.push(VariableDeclarationTerm5393.create(rest5546[0], null, null, rest5546[1]));
                rest5546 = rest5546.slice(2);
            } else {
                decls5545.push(VariableDeclarationTerm5393.create(rest5546[0], null, null, null));
                rest5546 = rest5546.slice(1);
                break;
            }
        } else {
            throwSyntaxError5358("enforest", "Unexpected token", rest5546[0]);
        }
    }
    return {
        result: decls5545,
        rest: rest5546
    };
}
function enforestAssignment5471(stx5548, context5549, left5550, prevStx5551, prevTerms5552) {
    var op5553 = stx5548[0];
    var rightStx5554 = stx5548.slice(1);
    var opTerm5555 = PuncTerm5374.create(stx5548[0]);
    var opPrevStx5556 = tagWithTerm5487(opTerm5555, [stx5548[0]]).concat(tagWithTerm5487(left5550, left5550.destruct(context5549).reverse()), prevStx5551);
    var opPrevTerms5557 = [opTerm5555, left5550].concat(prevTerms5552);
    var opRes5558 = enforest5484(rightStx5554, context5549, opPrevStx5556, opPrevTerms5557);
    if (opRes5558.result) {
        if ( // Lookbehind was matched, so it may not even be a binop anymore.
        opRes5558.prevTerms.length < opPrevTerms5557.length) {
            return opRes5558;
        }
        var right5559 = opRes5558.result;
        if ( // only a binop if the right is a real expression
        // so 2+2++ will only match 2+2
        right5559.isExprTerm) {
            var term5560 = AssignmentExpressionTerm5403.create(left5550, op5553, right5559);
            return {
                result: term5560,
                rest: opRes5558.rest,
                prevStx: prevStx5551,
                prevTerms: prevTerms5552
            };
        }
    } else {
        return opRes5558;
    }
}
function enforestParenExpression5472(parens5561, context5562) {
    var argRes5563,
        enforestedArgs5564 = [],
        commas5565 = [];
    var innerTokens5566 = parens5561.token.inner;
    while (innerTokens5566.length > 0) {
        argRes5563 = enforest5484(innerTokens5566, context5562);
        if (!argRes5563.result || !argRes5563.result.isExprTerm) {
            return null;
        }
        enforestedArgs5564.push(argRes5563.result);
        innerTokens5566 = argRes5563.rest;
        if (innerTokens5566[0] && innerTokens5566[0].token.value === ",") {
            // record the comma for later
            commas5565.push(innerTokens5566[0]);
            // but dump it for the next loop turn
            innerTokens5566 = innerTokens5566.slice(1);
        } else {
            // either there are no more tokens or
            // they aren't a comma, either way we
            // are done with the loop
            break;
        }
    }
    return innerTokens5566.length ? null : ParenExpressionTerm5427.create(enforestedArgs5564, parens5561, commas5565);
}
function resolveFast5473(stx5567, context5568, phase5569) {
    var name5570 = unwrapSyntax5361(stx5567);
    if (context5568.env.hasName(name5570) || context5568.store.hasName(name5570)) {
        return resolve5348(stx5567, phase5569);
    }
    return name5570;
}
function CompiletimeValue5474(trans5571, module5572, phase5573) {
    this.trans = trans5571;
    this.module = module5572;
    this.phase = phase5573;
}
function RuntimeValue5475(trans5574, module5575, phase5576) {
    this.trans = trans5574;
    this.module = module5575;
    this.phase = phase5576;
}
function getCompiletimeValue5476(stx5577, context5578, phase5579) {
    var store5580,
        env5581 = context5578.env.get(stx5577, phase5579);
    if (env5581 !== null) {
        return env5581.trans;
    } else {
        store5580 = context5578.store.getWithModule(stx5577, phase5579);
        return store5580 !== null ? store5580.trans : null;
    }
}
function getSyntaxTransform5477(stx5582, context5583, phase5584) {
    var t5585 = getCompiletimeValue5476(stx5582, context5583, phase5584);
    if (t5585 && t5585 instanceof VarTransform5347) {
        return null;
    }
    return t5585;
}
function hasSyntaxTransform5478(stx5586, context5587, phase5588) {
    return getSyntaxTransform5477(stx5586, context5587, phase5588) !== null;
}
function hasCompiletimeValue5479(stx5589, context5590, phase5591) {
    return context5590.env.has(stx5589, phase5591) || context5590.store.has(stx5589, phase5591);
}
function expandMacro5480(stx5592, context5593, opCtx5594, opType5595, macroObj5596) {
    var // pull the macro transformer out the environment
    head5597 = stx5592[0];
    var rest5598 = stx5592.slice(1);
    macroObj5596 = macroObj5596 || getSyntaxTransform5477(stx5592, context5593, context5593.phase);
    var stxArg5599 = rest5598.slice(macroObj5596.fullName.length - 1);
    var transformer5600;
    if (opType5595 != null) {
        assert5356(opType5595 === "binary" || opType5595 === "unary", "operator type should be either unary or binary: " + opType5595);
        transformer5600 = macroObj5596[opType5595].fn;
    } else {
        transformer5600 = macroObj5596.fn;
    }
    assert5356(typeof transformer5600 === "function", "Macro transformer not bound for: " + head5597.token.value);
    var transformerContext5601 = makeExpanderContext5495(_5339.defaults({ mark: freshScope5368(context5593.bindings) }, context5593));
    // apply the transformer
    var rt5602;
    try {
        rt5602 = transformer5600([head5597].concat(stxArg5599), transformerContext5601, opCtx5594.prevStx, opCtx5594.prevTerms);
    } catch (e5603) {
        if (e5603 instanceof SyntaxCaseError5360) {
            var // add a nicer error for syntax case
            nameStr5604 = macroObj5596.fullName.map(function (stx5605) {
                return stx5605.token.value;
            }).join("");
            if (opType5595 != null) {
                var argumentString5606 = "`" + stxArg5599.slice(0, 5).map(function (stx5607) {
                    return stx5607.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5358("operator", "Operator `" + nameStr5604 + "` could not be matched with " + argumentString5606, head5597);
            } else {
                var argumentString5606 = "`" + stxArg5599.slice(0, 5).map(function (stx5609) {
                    return stx5609.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5358("macro", "Macro `" + nameStr5604 + "` could not be matched with " + argumentString5606, head5597);
            }
        } else {
            // just rethrow it
            throw e5603;
        }
    }
    if (!builtinMode5454 && !macroObj5596.builtin) {
        expandCount5455++;
    }
    if (!Array.isArray(rt5602.result)) {
        throwSyntaxError5358("enforest", "Macro must return a syntax array", stx5592[0]);
    }
    if (rt5602.result.length > 0) {
        var adjustedResult5610 = adjustLineContext5366(rt5602.result, head5597);
        if (stx5592[0].token.leadingComments) {
            if (adjustedResult5610[0].token.leadingComments) {
                adjustedResult5610[0].token.leadingComments = adjustedResult5610[0].token.leadingComments.concat(head5597.token.leadingComments);
            } else {
                adjustedResult5610[0].token.leadingComments = head5597.token.leadingComments;
            }
        }
        rt5602.result = adjustedResult5610;
    }
    return rt5602;
}
function comparePrec5481(left5611, right5612, assoc5613) {
    if (assoc5613 === "left") {
        return left5611 <= right5612;
    }
    return left5611 < right5612;
}
function toksAdjacent5482(a5614, b5615) {
    var arange5616 = a5614.token.sm_range || a5614.token.range || a5614.token.endRange;
    var brange5617 = b5615.token.sm_range || b5615.token.range || b5615.token.endRange;
    return arange5616 && brange5617 && arange5616[1] === brange5617[0];
}
function syntaxInnerValuesEq5483(synA5618, synB5619) {
    var a5620 = synA5618.token.inner,
        b5621 = synB5619.token.inner;
    return (function (ziped5622) {
        return _5339.all(ziped5622, function (pair5623) {
            return unwrapSyntax5361(pair5623[0]) === unwrapSyntax5361(pair5623[1]);
        });
    })(a5620.length === b5621.length && _5339.zip(a5620, b5621));
}
function enforest5484(toks5624, context5625, prevStx5626, prevTerms5627) {
    assert5356(toks5624.length > 0, "enforest assumes there are tokens to work with");
    prevStx5626 = prevStx5626 || [];
    prevTerms5627 = prevTerms5627 || [];
    if (expandCount5455 >= maxExpands5456) {
        return {
            result: null,
            rest: toks5624
        };
    }
    function step5628(head5629, rest5630, opCtx5631) {
        var innerTokens5632;
        assert5356(Array.isArray(rest5630), "result must at least be an empty array");
        if (head5629.isTermTree) {
            var isCustomOp5634 = false;
            var uopMacroObj5635;
            var uopSyntax5636;
            if (head5629.isPuncTerm || head5629.isKeywordTerm || head5629.isIdTerm) {
                if (head5629.isPuncTerm) {
                    uopSyntax5636 = head5629.punc;
                } else if (head5629.isKeywordTerm) {
                    uopSyntax5636 = head5629.keyword;
                } else if (head5629.isIdTerm) {
                    uopSyntax5636 = head5629.id;
                }
                uopMacroObj5635 = getSyntaxTransform5477([uopSyntax5636].concat(rest5630), context5625, context5625.phase);
                isCustomOp5634 = uopMacroObj5635 && uopMacroObj5635.isOp;
            }
            // look up once (we want to check multiple properties on bopMacroObj
            // without repeatedly calling getValueInEnv)
            var bopMacroObj5637;
            if (rest5630[0] && rest5630[1]) {
                bopMacroObj5637 = getSyntaxTransform5477(rest5630, context5625, context5625.phase);
            }
            if ( // unary operator
            isCustomOp5634 && uopMacroObj5635.unary || uopSyntax5636 && stxIsUnaryOp5461(uopSyntax5636)) {
                var uopPrec5638;
                if (isCustomOp5634 && uopMacroObj5635.unary) {
                    uopPrec5638 = uopMacroObj5635.unary.prec;
                } else {
                    uopPrec5638 = getUnaryOpPrec5463(unwrapSyntax5361(uopSyntax5636));
                }
                var opRest5639 = rest5630;
                var uopMacroName5640;
                if (uopMacroObj5635) {
                    uopMacroName5640 = [uopSyntax5636].concat(rest5630.slice(0, uopMacroObj5635.fullName.length - 1));
                    opRest5639 = rest5630.slice(uopMacroObj5635.fullName.length - 1);
                }
                var leftLeft5641 = opCtx5631.prevTerms[0] && opCtx5631.prevTerms[0].isPartialTerm ? opCtx5631.prevTerms[0] : null;
                var unopTerm5642 = PartialOperationTerm5421.create(head5629, leftLeft5641);
                var unopPrevStx5643 = tagWithTerm5487(unopTerm5642, head5629.destruct(context5625).reverse()).concat(opCtx5631.prevStx);
                var unopPrevTerms5644 = [unopTerm5642].concat(opCtx5631.prevTerms);
                var unopOpCtx5645 = _5339.extend({}, opCtx5631, {
                    combine: function combine(t5646) {
                        if (t5646.isExprTerm) {
                            if (isCustomOp5634 && uopMacroObj5635.unary) {
                                var rt5647 = expandMacro5480(uopMacroName5640.concat(t5646.destruct(context5625)), context5625, opCtx5631, "unary");
                                var newt5648 = get_expression5486(rt5647.result, context5625);
                                assert5356(newt5648.rest.length === 0, "should never have left over syntax");
                                return opCtx5631.combine(newt5648.result);
                            }
                            return opCtx5631.combine(UnaryOpTerm5400.create(uopSyntax5636, t5646));
                        } else {
                            // not actually an expression so don't create
                            // a UnaryOp term just return with the punctuator
                            return opCtx5631.combine(head5629);
                        }
                    },
                    prec: uopPrec5638,
                    prevStx: unopPrevStx5643,
                    prevTerms: unopPrevTerms5644,
                    op: unopTerm5642
                });
                return step5628(opRest5639[0], opRest5639.slice(1), unopOpCtx5645);
            } else if (head5629.isExprTerm && (rest5630[0] && rest5630[1] && (stxIsBinOp5462(rest5630[0]) && !bopMacroObj5637 || bopMacroObj5637 && bopMacroObj5637.isOp && bopMacroObj5637.binary))) {
                var opRes5649;
                var op5650 = rest5630[0];
                var left5651 = head5629;
                var rightStx5652 = rest5630.slice(1);
                var leftLeft5641 = opCtx5631.prevTerms[0] && opCtx5631.prevTerms[0].isPartialTerm ? opCtx5631.prevTerms[0] : null;
                var leftTerm5654 = PartialExpressionTerm5422.create(head5629.destruct(context5625), leftLeft5641, function () {
                    return step5628(head5629, [], opCtx5631);
                });
                var opTerm5655 = PartialOperationTerm5421.create(op5650, leftTerm5654);
                var opPrevStx5656 = tagWithTerm5487(opTerm5655, [rest5630[0]]).concat(tagWithTerm5487(leftTerm5654, head5629.destruct(context5625)).reverse(), opCtx5631.prevStx);
                var opPrevTerms5657 = [opTerm5655, leftTerm5654].concat(opCtx5631.prevTerms);
                var isCustomOp5634 = bopMacroObj5637 && bopMacroObj5637.isOp && bopMacroObj5637.binary;
                var bopPrec5659;
                var bopAssoc5660;
                if (isCustomOp5634 && bopMacroObj5637.binary) {
                    bopPrec5659 = bopMacroObj5637.binary.prec;
                    bopAssoc5660 = bopMacroObj5637.binary.assoc;
                } else {
                    bopPrec5659 = getBinaryOpPrec5464(unwrapSyntax5361(op5650));
                    bopAssoc5660 = getBinaryOpAssoc5465(unwrapSyntax5361(op5650));
                }
                assert5356(bopPrec5659 !== undefined, "expecting a precedence for operator: " + op5650);
                var newStack5661;
                if (comparePrec5481(bopPrec5659, opCtx5631.prec, bopAssoc5660)) {
                    var bopCtx5665 = opCtx5631;
                    var combResult5633 = opCtx5631.combine(head5629);
                    if (opCtx5631.stack.length > 0) {
                        return step5628(combResult5633.term, rest5630, opCtx5631.stack[0]);
                    }
                    left5651 = combResult5633.term;
                    newStack5661 = opCtx5631.stack;
                    opPrevStx5656 = combResult5633.prevStx;
                    opPrevTerms5657 = combResult5633.prevTerms;
                } else {
                    newStack5661 = [opCtx5631].concat(opCtx5631.stack);
                }
                assert5356(opCtx5631.combine !== undefined, "expecting a combine function");
                var opRightStx5662 = rightStx5652;
                var bopMacroName5663;
                if (isCustomOp5634) {
                    bopMacroName5663 = rest5630.slice(0, bopMacroObj5637.fullName.length);
                    opRightStx5662 = rightStx5652.slice(bopMacroObj5637.fullName.length - 1);
                }
                var bopOpCtx5664 = _5339.extend({}, opCtx5631, {
                    combine: function combine(right5667) {
                        if (right5667.isExprTerm) {
                            if (isCustomOp5634 && bopMacroObj5637.binary) {
                                var leftStx5668 = left5651.destruct(context5625);
                                var rightStx5669 = right5667.destruct(context5625);
                                var rt5670 = expandMacro5480(bopMacroName5663.concat(syn5341.makeDelim("()", leftStx5668, leftStx5668[0]), syn5341.makeDelim("()", rightStx5669, rightStx5669[0])), context5625, opCtx5631, "binary");
                                var newt5671 = get_expression5486(rt5670.result, context5625);
                                assert5356(newt5671.rest.length === 0, "should never have left over syntax");
                                return {
                                    term: newt5671.result,
                                    prevStx: opPrevStx5656,
                                    prevTerms: opPrevTerms5657
                                };
                            }
                            return {
                                term: BinOpTerm5402.create(left5651, op5650, right5667),
                                prevStx: opPrevStx5656,
                                prevTerms: opPrevTerms5657
                            };
                        } else {
                            return {
                                term: head5629,
                                prevStx: opPrevStx5656,
                                prevTerms: opPrevTerms5657
                            };
                        }
                    },
                    prec: bopPrec5659,
                    op: opTerm5655,
                    stack: newStack5661,
                    prevStx: opPrevStx5656,
                    prevTerms: opPrevTerms5657
                });
                return step5628(opRightStx5662[0], opRightStx5662.slice(1), bopOpCtx5664);
            } else if (head5629.isExprTerm && (rest5630[0] && rest5630[0].isDelimiter() && rest5630[0].token.value === "()")) {
                var parenRes5672 = enforestParenExpression5472(rest5630[0], context5625);
                if (parenRes5672) {
                    return step5628(CallTerm5411.create(head5629, parenRes5672), rest5630.slice(1), opCtx5631);
                }
            } else if (head5629.isExprTerm && (rest5630[0] && resolveFast5473(rest5630[0], context5625, context5625.phase) === "?")) {
                var question5673 = rest5630[0];
                var condRes5674 = enforest5484(rest5630.slice(1), context5625);
                if (condRes5674.result) {
                    var truExpr5675 = condRes5674.result;
                    var condRight5676 = condRes5674.rest;
                    if (truExpr5675.isExprTerm && condRight5676[0] && resolveFast5473(condRight5676[0], context5625, context5625.phase) === ":") {
                        var colon5677 = condRight5676[0];
                        var flsRes5678 = enforest5484(condRight5676.slice(1), context5625);
                        var flsExpr5679 = flsRes5678.result;
                        if (flsExpr5679.isExprTerm) {
                            if ( // operators are combined before the ternary
                            opCtx5631.prec >= 4) {
                                var // ternary is like a operator with prec 4
                                headResult5680 = opCtx5631.combine(head5629);
                                var condTerm5681 = ConditionalExpressionTerm5404.create(headResult5680.term, question5673, truExpr5675, colon5677, flsExpr5679);
                                if (opCtx5631.stack.length > 0) {
                                    return step5628(condTerm5681, flsRes5678.rest, opCtx5631.stack[0]);
                                } else {
                                    return {
                                        result: condTerm5681,
                                        rest: flsRes5678.rest,
                                        prevStx: headResult5680.prevStx,
                                        prevTerms: headResult5680.prevTerms
                                    };
                                }
                            } else {
                                var condTerm5681 = ConditionalExpressionTerm5404.create(head5629, question5673, truExpr5675, colon5677, flsExpr5679);
                                return step5628(condTerm5681, flsRes5678.rest, opCtx5631);
                            }
                        }
                    }
                }
            } else if (head5629.isDelimiterTerm && head5629.delim.token.value === "()" && rest5630[0] && rest5630[0].isPunctuator() && resolveFast5473(rest5630[0], context5625, context5625.phase) === "=>") {
                var arrowRes5683 = enforest5484(rest5630.slice(1), context5625);
                if (arrowRes5683.result && arrowRes5683.result.isExprTerm) {
                    return step5628(ArrowFunTerm5407.create(head5629.delim, rest5630[0], arrowRes5683.result.destruct(context5625)), arrowRes5683.rest, opCtx5631);
                } else {
                    throwSyntaxError5358("enforest", "Body of arrow function must be an expression", rest5630.slice(1));
                }
            } else if (head5629.isIdTerm && rest5630[0] && rest5630[0].isPunctuator() && resolveFast5473(rest5630[0], context5625, context5625.phase) === "=>") {
                var res5684 = enforest5484(rest5630.slice(1), context5625);
                if (res5684.result && res5684.result.isExprTerm) {
                    return step5628(ArrowFunTerm5407.create(head5629.id, rest5630[0], res5684.result.destruct(context5625)), res5684.rest, opCtx5631);
                } else {
                    throwSyntaxError5358("enforest", "Body of arrow function must be an expression", rest5630.slice(1));
                }
            } else if (head5629.isDelimiterTerm && head5629.delim.token.value === "()") {
                if ( // empty parens are acceptable but enforest
                // doesn't accept empty arrays so short
                // circuit here
                head5629.delim.token.inner.length === 0) {
                    return step5628(ParenExpressionTerm5427.create([EmptyTerm5395.create()], head5629.delim, []), rest5630, opCtx5631);
                } else {
                    var parenRes5672 = enforestParenExpression5472(head5629.delim, context5625);
                    if (parenRes5672) {
                        return step5628(parenRes5672, rest5630, opCtx5631);
                    }
                }
            } else if (head5629.isExprTerm && ((head5629.isIdTerm || head5629.isObjGetTerm || head5629.isObjDotGetTerm || head5629.isThisExpressionTerm) && rest5630[0] && rest5630[1] && !bopMacroObj5637 && stxIsAssignOp5466(rest5630[0]))) {
                var opRes5649 = enforestAssignment5471(rest5630, context5625, head5629, prevStx5626, prevTerms5627);
                if (opRes5649 && opRes5649.result) {
                    return step5628(opRes5649.result, opRes5649.rest, _5339.extend({}, opCtx5631, {
                        prevStx: opRes5649.prevStx,
                        prevTerms: opRes5649.prevTerms
                    }));
                }
            } else if (head5629.isExprTerm && (rest5630[0] && (unwrapSyntax5361(rest5630[0]) === "++" || unwrapSyntax5361(rest5630[0]) === "--"))) {
                if ( // Check if the operator is a macro first.
                hasSyntaxTransform5478(rest5630[0], context5625, context5625.phase)) {
                    var headStx5687 = tagWithTerm5487(head5629, head5629.destruct(context5625).reverse());
                    var opPrevStx5656 = headStx5687.concat(prevStx5626);
                    var opPrevTerms5657 = [head5629].concat(prevTerms5627);
                    var opRes5649 = enforest5484(rest5630, context5625, opPrevStx5656, opPrevTerms5657);
                    if (opRes5649.prevTerms.length < opPrevTerms5657.length) {
                        return opRes5649;
                    } else if (opRes5649.result) {
                        return step5628(head5629, opRes5649.result.destruct(context5625).concat(opRes5649.rest), opCtx5631);
                    }
                }
                return step5628(PostfixOpTerm5401.create(head5629, rest5630[0]), rest5630.slice(1), opCtx5631);
            } else if (head5629.isExprTerm && (rest5630[0] && rest5630[0].token.value === "[]")) {
                return step5628(ObjGetTerm5409.create(head5629, DelimiterTerm5375.create(rest5630[0])), rest5630.slice(1), opCtx5631);
            } else if (head5629.isExprTerm && (rest5630[0] && unwrapSyntax5361(rest5630[0]) === "." && !hasSyntaxTransform5478(rest5630[0], context5625, context5625.phase) && rest5630[1] && (rest5630[1].isIdentifier() || rest5630[1].isKeyword()))) {
                if ( // Check if the identifier is a macro first.
                hasSyntaxTransform5478(rest5630[1], context5625, context5625.phase)) {
                    var headStx5687 = tagWithTerm5487(head5629, head5629.destruct(context5625).reverse());
                    var dotTerm5692 = PuncTerm5374.create(rest5630[0]);
                    var dotTerms5693 = [dotTerm5692].concat(head5629, prevTerms5627);
                    var dotStx5694 = tagWithTerm5487(dotTerm5692, [rest5630[0]]).concat(headStx5687, prevStx5626);
                    var dotRes5695 = enforest5484(rest5630.slice(1), context5625, dotStx5694, dotTerms5693);
                    if (dotRes5695.prevTerms.length < dotTerms5693.length) {
                        return dotRes5695;
                    } else if (dotRes5695.result) {
                        return step5628(head5629, [rest5630[0]].concat(dotRes5695.result.destruct(context5625), dotRes5695.rest), opCtx5631);
                    }
                }
                return step5628(ObjDotGetTerm5408.create(head5629, rest5630[0], rest5630[1]), rest5630.slice(2), opCtx5631);
            } else if (head5629.isDelimiterTerm && head5629.delim.token.value === "[]") {
                return step5628(ArrayLiteralTerm5418.create(head5629), rest5630, opCtx5631);
            } else if (head5629.isDelimiterTerm && head5629.delim.token.value === "{}") {
                return step5628(BlockTerm5417.create(head5629), rest5630, opCtx5631);
            } else if (head5629.isIdTerm && unwrapSyntax5361(head5629.id) === "#quoteSyntax" && rest5630[0] && rest5630[0].token.value === "{}") {
                return step5628(QuoteSyntaxTerm5412.create(rest5630[0]), rest5630.slice(1), opCtx5631);
            } else if (head5629.isKeywordTerm && unwrapSyntax5361(head5629.keyword) === "return") {
                if (rest5630[0] && rest5630[0].token.lineNumber === head5629.keyword.token.lineNumber) {
                    var returnPrevStx5696 = tagWithTerm5487(head5629, head5629.destruct(context5625)).concat(opCtx5631.prevStx);
                    var returnPrevTerms5697 = [head5629].concat(opCtx5631.prevTerms);
                    var returnExpr5698 = enforest5484(rest5630, context5625, returnPrevStx5696, returnPrevTerms5697);
                    if (returnExpr5698.prevTerms.length < opCtx5631.prevTerms.length) {
                        return returnExpr5698;
                    }
                    if (returnExpr5698.result.isExprTerm) {
                        return step5628(ReturnStatementTerm5398.create(head5629, returnExpr5698.result), returnExpr5698.rest, opCtx5631);
                    }
                } else {
                    return step5628(ReturnStatementTerm5398.create(head5629, EmptyTerm5395.create()), rest5630, opCtx5631);
                }
            } else if (head5629.isKeywordTerm && unwrapSyntax5361(head5629.keyword) === "let") {
                var normalizedName5699;
                if (rest5630[0] && rest5630[0].isDelimiter() && rest5630[0].token.value === "()") {
                    normalizedName5699 = rest5630[0];
                } else {
                    normalizedName5699 = syn5341.makeDelim("()", [rest5630[0]], rest5630[0]);
                }
                var lsRes5700 = enforestVarStatement5470(rest5630, context5625, head5629.keyword);
                if (lsRes5700 && lsRes5700.result) {
                    return step5628(LetStatementTerm5425.create(head5629, lsRes5700.result), lsRes5700.rest, opCtx5631);
                }
            } else if (head5629.isKeywordTerm && unwrapSyntax5361(head5629.keyword) === "var" && rest5630[0]) {
                var vsRes5701 = enforestVarStatement5470(rest5630, context5625, head5629.keyword);
                if (vsRes5701 && vsRes5701.result) {
                    return step5628(VariableStatementTerm5424.create(head5629, vsRes5701.result), vsRes5701.rest, opCtx5631);
                }
            } else if (head5629.isKeywordTerm && unwrapSyntax5361(head5629.keyword) === "const" && rest5630[0]) {
                var csRes5702 = enforestVarStatement5470(rest5630, context5625, head5629.keyword);
                if (csRes5702 && csRes5702.result) {
                    return step5628(ConstStatementTerm5426.create(head5629, csRes5702.result), csRes5702.rest, opCtx5631);
                }
            } else if (head5629.isKeywordTerm && unwrapSyntax5361(head5629.keyword) === "for" && rest5630[0] && rest5630[0].token.value === "()") {
                return step5628(ForStatementTerm5397.create(head5629.keyword, rest5630[0]), rest5630.slice(1), opCtx5631);
            }
        } else {
            assert5356(head5629 && head5629.token, "assuming head is a syntax object");
            var macroObj5703 = expandCount5455 < maxExpands5456 && getSyntaxTransform5477([head5629].concat(rest5630), context5625, context5625.phase);
            if (head5629 && context5625.stopMap.has(resolve5348(head5629, context5625.phase))) {
                return step5628(StopQuotedTerm5413.create(head5629, rest5630[0]), rest5630.slice(1), opCtx5631);
            } else if (macroObj5703 && typeof macroObj5703.fn === "function" && !macroObj5703.isOp) {
                var rt5704 = expandMacro5480([head5629].concat(rest5630), context5625, opCtx5631, null, macroObj5703);
                var newOpCtx5705 = opCtx5631;
                if (rt5704.prevTerms && rt5704.prevTerms.length < opCtx5631.prevTerms.length) {
                    newOpCtx5705 = rewindOpCtx5485(opCtx5631, rt5704);
                }
                if (rt5704.result.length > 0) {
                    return step5628(rt5704.result[0], rt5704.result.slice(1).concat(rt5704.rest), newOpCtx5705);
                } else {
                    return step5628(EmptyTerm5395.create(), rt5704.rest, newOpCtx5705);
                }
            } else if (head5629.isIdentifier() && unwrapSyntax5361(head5629) === "stxrec" && resolve5348(head5629, context5625.phase) === "stxrec") {
                var normalizedName5699;
                if (rest5630[0] && rest5630[0].isDelimiter() && rest5630[0].token.value === "()") {
                    normalizedName5699 = rest5630[0];
                } else {
                    normalizedName5699 = syn5341.makeDelim("()", [rest5630[0]], rest5630[0]);
                }
                if (rest5630[1] && rest5630[1].isDelimiter()) {
                    return step5628(MacroTerm5389.create(normalizedName5699, rest5630[1].token.inner), rest5630.slice(2), opCtx5631);
                } else {
                    throwSyntaxError5358("enforest", "Macro declaration must include body", rest5630[1]);
                }
            } else if (head5629.isIdentifier() && head5629.token.value === "unaryop" && rest5630[0] && rest5630[0].isDelimiter() && rest5630[0].token.value === "()" && rest5630[1] && rest5630[1].isNumericLiteral() && rest5630[2] && rest5630[2].isDelimiter() && rest5630[2] && rest5630[2].token.value === "{}") {
                var trans5707 = enforest5484(rest5630[2].token.inner, context5625);
                return step5628(OperatorDefinitionTerm5391.create(syn5341.makeValue("unary", head5629), rest5630[0], rest5630[1], null, trans5707.result.body), rest5630.slice(3), opCtx5631);
            } else if (head5629.isIdentifier() && head5629.token.value === "binaryop" && rest5630[0] && rest5630[0].isDelimiter() && rest5630[0].token.value === "()" && rest5630[1] && rest5630[1].isNumericLiteral() && rest5630[2] && rest5630[2].isIdentifier() && rest5630[3] && rest5630[3].isDelimiter() && rest5630[3] && rest5630[3].token.value === "{}") {
                var trans5707 = enforest5484(rest5630[3].token.inner, context5625);
                return step5628(OperatorDefinitionTerm5391.create(syn5341.makeValue("binary", head5629), rest5630[0], rest5630[1], rest5630[2], trans5707.result.body), rest5630.slice(4), opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "function" && rest5630[0] && rest5630[0].isIdentifier() && rest5630[1] && rest5630[1].isDelimiter() && rest5630[1].token.value === "()" && rest5630[2] && rest5630[2].isDelimiter() && rest5630[2].token.value === "{}") {
                rest5630[1].token.inner = rest5630[1].token.inner;
                rest5630[2].token.inner = rest5630[2].token.inner;
                return step5628(NamedFunTerm5405.create(head5629, null, rest5630[0], rest5630[1], rest5630[2]), rest5630.slice(3), opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "function" && rest5630[0] && rest5630[0].isPunctuator() && rest5630[0].token.value === "*" && rest5630[1] && rest5630[1].isIdentifier() && rest5630[2] && rest5630[2].isDelimiter() && rest5630[2].token.value === "()" && rest5630[3] && rest5630[3].isDelimiter() && rest5630[3].token.value === "{}") {
                return step5628(NamedFunTerm5405.create(head5629, rest5630[0], rest5630[1], rest5630[2], rest5630[3]), rest5630.slice(4), opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "function" && rest5630[0] && rest5630[0].isDelimiter() && rest5630[0].token.value === "()" && rest5630[1] && rest5630[1].isDelimiter() && rest5630[1].token.value === "{}") {
                return step5628(AnonFunTerm5406.create(head5629, null, rest5630[0], rest5630[1]), rest5630.slice(2), opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "function" && rest5630[0] && rest5630[0].isPunctuator() && rest5630[0].token.value === "*" && rest5630[1] && rest5630[1].isDelimiter() && rest5630[1].token.value === "()" && rest5630[2] && rest5630[2].isDelimiter && rest5630[2].token.value === "{}") {
                rest5630[1].token.inner = rest5630[1].token.inner;
                rest5630[2].token.inner = rest5630[2].token.inner;
                return step5628(AnonFunTerm5406.create(head5629, rest5630[0], rest5630[1], rest5630[2]), rest5630.slice(3), opCtx5631);
            } else if ((head5629.isDelimiter() && head5629.token.value === "()" || head5629.isIdentifier()) && rest5630[0] && rest5630[0].isPunctuator() && resolveFast5473(rest5630[0], context5625, context5625.phase) === "=>" && rest5630[1] && rest5630[1].isDelimiter() && rest5630[1].token.value === "{}") {
                return step5628(ArrowFunTerm5407.create(head5629, rest5630[0], rest5630[1]), rest5630.slice(2), opCtx5631);
            } else if (head5629.isIdentifier() && head5629.token.value === "forPhase" && rest5630[0] && rest5630[0].isNumericLiteral() && rest5630[1] && rest5630[1].isDelimiter()) {
                return step5628(ForPhaseTerm5392.create(rest5630[0], rest5630[1].token.inner), rest5630.slice(2), opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "catch" && rest5630[0] && rest5630[0].isDelimiter() && rest5630[0].token.value === "()" && rest5630[1] && rest5630[1].isDelimiter() && rest5630[1].token.value === "{}") {
                rest5630[0].token.inner = rest5630[0].token.inner;
                rest5630[1].token.inner = rest5630[1].token.inner;
                return step5628(CatchClauseTerm5396.create(head5629, rest5630[0], rest5630[1]), rest5630.slice(2), opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "this") {
                return step5628(ThisExpressionTerm5415.create(head5629), rest5630, opCtx5631);
            } else if (head5629.isNumericLiteral() || head5629.isStringLiteral() || head5629.isBooleanLiteral() || head5629.isRegularExpression() || head5629.isNullLiteral()) {
                return step5628(LitTerm5416.create(head5629), rest5630, opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "import") {
                var imp5709 = enforestImport5469(head5629, rest5630);
                return step5628(imp5709.result, imp5709.rest, opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "export" && rest5630[0] && rest5630[0].isDelimiter()) {
                return step5628(ExportNameTerm5385.create(head5629, rest5630[0]), rest5630.slice(1), opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "export" && rest5630[0] && rest5630[0].isKeyword() && unwrapSyntax5361(rest5630[0]) === "default" && rest5630[1]) {
                var res5684 = enforest5484(rest5630.slice(1), context5625);
                return step5628(ExportDefaultTerm5386.create(head5629, rest5630[0], res5684.result), res5684.rest, opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "export" && rest5630[0]) {
                var res5684 = enforest5484(rest5630, context5625);
                return step5628(ExportDeclTerm5387.create(head5629, res5684.result), res5684.rest, opCtx5631);
            } else if (head5629.isIdentifier()) {
                return step5628(IdTerm5419.create(head5629), rest5630, opCtx5631);
            } else if (head5629.isPunctuator()) {
                return step5628(PuncTerm5374.create(head5629), rest5630, opCtx5631);
            } else if (head5629.isKeyword() && unwrapSyntax5361(head5629) === "with") {
                throwSyntaxError5358("enforest", "with is not supported in sweet.js", head5629);
            } else if (head5629.isKeyword()) {
                return step5628(KeywordTerm5373.create(head5629), rest5630, opCtx5631);
            } else if (head5629.isDelimiter()) {
                return step5628(DelimiterTerm5375.create(head5629), rest5630, opCtx5631);
            } else if (head5629.isTemplate()) {
                return step5628(TemplateTerm5410.create(head5629), rest5630, opCtx5631);
            } else if (head5629.isEOF()) {
                assert5356(rest5630.length === 0, "nothing should be after an EOF");
                return step5628(EOFTerm5372.create(head5629), [], opCtx5631);
            } else {
                // todo: are we missing cases?
                assert5356(false, "not implemented");
            }
        }
        if ( // Potentially an infix macro
        // This should only be invoked on runtime syntax terms
        !head5629.isMacroTerm && !head5629.isAnonMacroTerm && !head5629.isOperatorDefinitionTerm && rest5630.length && hasSyntaxTransform5478(rest5630, context5625, context5625.phase) && getSyntaxTransform5477(rest5630, context5625, context5625.phase).isOp === false) {
            var infLeftTerm5712 = opCtx5631.prevTerms[0] && opCtx5631.prevTerms[0].isPartialTerm ? opCtx5631.prevTerms[0] : null;
            var infTerm5713 = PartialExpressionTerm5422.create(head5629.destruct(context5625), infLeftTerm5712, function () {
                return step5628(head5629, [], opCtx5631);
            });
            var infPrevStx5714 = tagWithTerm5487(infTerm5713, head5629.destruct(context5625)).reverse().concat(opCtx5631.prevStx);
            var infPrevTerms5715 = [infTerm5713].concat(opCtx5631.prevTerms);
            var infRes5716 = expandMacro5480(rest5630, context5625, {
                prevStx: infPrevStx5714,
                prevTerms: infPrevTerms5715
            });
            if (infRes5716.prevTerms && infRes5716.prevTerms.length < infPrevTerms5715.length) {
                var infOpCtx5717 = rewindOpCtx5485(opCtx5631, infRes5716);
                return step5628(infRes5716.result[0], infRes5716.result.slice(1).concat(infRes5716.rest), infOpCtx5717);
            } else {
                return step5628(head5629, infRes5716.result.concat(infRes5716.rest), opCtx5631);
            }
        }
        var // done with current step so combine and continue on
        combResult5633 = opCtx5631.combine(head5629);
        if (opCtx5631.stack.length === 0) {
            return {
                result: combResult5633.term,
                rest: rest5630,
                prevStx: combResult5633.prevStx,
                prevTerms: combResult5633.prevTerms
            };
        } else {
            return step5628(combResult5633.term, rest5630, opCtx5631.stack[0]);
        }
    }
    return step5628(toks5624[0], toks5624.slice(1), {
        combine: function combine(t5718) {
            return {
                term: t5718,
                prevStx: prevStx5626,
                prevTerms: prevTerms5627
            };
        },
        prec: 0,
        stack: [],
        op: null,
        prevStx: prevStx5626,
        prevTerms: prevTerms5627
    });
}
function rewindOpCtx5485(opCtx5719, res5720) {
    if ( // If we've consumed all pending operators, we can just start over.
    // It's important that we always thread the new prevStx and prevTerms
    // through, otherwise the old ones will still persist.
    !res5720.prevTerms.length || !res5720.prevTerms[0].isPartialTerm) {
        return _5339.extend({}, opCtx5719, {
            combine: function combine(t5724) {
                return {
                    term: t5724,
                    prevStx: res5720.prevStx,
                    prevTerms: res5720.prevTerms
                };
            },
            prec: 0,
            op: null,
            stack: [],
            prevStx: res5720.prevStx,
            prevTerms: res5720.prevTerms
        });
    }
    // To rewind, we need to find the first (previous) pending operator. It
    // acts as a marker in the opCtx to let us know how far we need to go
    // back.
    var op5721 = null;
    for (var i5722 = 0; i5722 < res5720.prevTerms.length; i5722++) {
        if (!res5720.prevTerms[i5722].isPartialTerm) {
            break;
        }
        if (res5720.prevTerms[i5722].isPartialOperationTerm) {
            op5721 = res5720.prevTerms[i5722];
            break;
        }
    }
    if ( // If the op matches the current opCtx, we don't need to rewind
    // anything, but we still need to persist the prevStx and prevTerms.
    opCtx5719.op === op5721) {
        return _5339.extend({}, opCtx5719, {
            prevStx: res5720.prevStx,
            prevTerms: res5720.prevTerms
        });
    }
    for (var i5722 = 0; i5722 < opCtx5719.stack.length; i5722++) {
        if (opCtx5719.stack[i5722].op === op5721) {
            return _5339.extend({}, opCtx5719.stack[i5722], {
                prevStx: res5720.prevStx,
                prevTerms: res5720.prevTerms
            });
        }
    }
    assert5356(false, "Rewind failed.");
}
function get_expression5486(stx5725, context5726) {
    if (stx5725[0].term) {
        for (var termLen5728 = 1; termLen5728 < stx5725.length; termLen5728++) {
            if (stx5725[termLen5728].term !== stx5725[0].term) {
                break;
            }
        }
        if ( // Guard the termLen because we can have a multi-token term that
        // we don't want to split. TODO: is there something we can do to
        // get around this safely?
        stx5725[0].term.isPartialExpressionTerm && termLen5728 === stx5725[0].term.stx.length) {
            var expr5729 = stx5725[0].term.combine().result;
            for (var i5730 = 1, term5731 = stx5725[0].term; i5730 < stx5725.length; i5730++) {
                if (stx5725[i5730].term !== term5731) {
                    if (term5731 && term5731.isPartialTerm) {
                        term5731 = term5731.left;
                        i5730--;
                    } else {
                        break;
                    }
                }
            }
            return {
                result: expr5729,
                rest: stx5725.slice(i5730)
            };
        } else if (stx5725[0].term.isExprTerm) {
            return {
                result: stx5725[0].term,
                rest: stx5725.slice(termLen5728)
            };
        } else {
            return {
                result: null,
                rest: stx5725
            };
        }
    }
    var res5727 = enforest5484(stx5725, context5726);
    if (!res5727.result || !res5727.result.isExprTerm) {
        return {
            result: null,
            rest: stx5725
        };
    }
    return res5727;
}
function tagWithTerm5487(term5732, stx5733) {
    return stx5733.map(function (s5734) {
        s5734 = s5734.clone();
        s5734.term = term5732;
        return s5734;
    });
}
function applyMarkToPatternEnv5488(newMark5735, env5736) {
    function dfs5737(match5738) {
        if (match5738.level === 0) {
            // replace the match property with the marked syntax
            match5738.match = _5339.map(match5738.match, function (stx5739) {
                return stx5739.mark(newMark5735);
            });
        } else {
            _5339.each(match5738.match, function (match5740) {
                dfs5737(match5740);
            });
        }
    }
    _5339.keys(env5736).forEach(function (key5741) {
        dfs5737(env5736[key5741]);
    });
}
function markIn5489(arr5742, mark5743) {
    return arr5742.map(function (stx5744) {
        return stx5744.mark(mark5743);
    });
}
function markDefOut5490(arr5745, mark5746, def5747) {
    return arr5745.map(function (stx5748) {
        return stx5748.mark(mark5746);
    });
}
function loadMacroDef5491(body5749, context5750, phase5751) {
    var expanded5752 = body5749[0].destruct(context5750, { stripCompileTerm: true });
    var stub5753 = parser5340.read("()");
    stub5753[0].token.inner = expanded5752;
    var flattend5754 = flatten5515(stub5753);
    var bodyCode5755 = codegen5338.generate(parser5340.parse(flattend5754, { phase: phase5751 }));
    var localCtx5756;
    var macroGlobal5757 = {
        makeValue: syn5341.makeValue,
        makeRegex: syn5341.makeRegex,
        makeIdent: syn5341.makeIdent,
        makeKeyword: syn5341.makeKeyword,
        makePunc: syn5341.makePunc,
        makeDelim: syn5341.makeDelim,
        localExpand: function localExpand(stx5759, stop5760) {
            stop5760 = stop5760 || [];
            var markedStx5761 = markIn5489(stx5759, localCtx5756.mark);
            var stopMap5762 = new StringMap5343();
            stop5760.forEach(function (stop5766) {
                stopMap5762.set(resolve5348(stop5766, localCtx5756.phase), true);
            });
            var localExpandCtx5763 = makeExpanderContext5495(_5339.extend({}, localCtx5756, { stopMap: stopMap5762 }));
            var terms5764 = expand5494(markedStx5761, localExpandCtx5763);
            var newStx5765 = terms5764.reduce(function (acc5767, term5768) {
                acc5767.push.apply(acc5767, term5768.destruct(localCtx5756, { stripCompileTerm: true }));
                return acc5767;
            }, []);
            return markDefOut5490(newStx5765, localCtx5756.mark, localCtx5756.defscope);
        },
        filename: context5750.filename,
        getExpr: function getExpr(stx5769) {
            if (stx5769.length === 0) {
                return {
                    success: false,
                    result: [],
                    rest: []
                };
            }
            var markedStx5770 = markIn5489(stx5769, localCtx5756.mark);
            var r5771 = get_expression5486(markedStx5770, localCtx5756);
            return {
                success: r5771.result !== null,
                result: r5771.result === null ? [] : markDefOut5490(r5771.result.destruct(localCtx5756, { stripCompileTerm: true }), localCtx5756.mark, localCtx5756.defscope),
                rest: markDefOut5490(r5771.rest, localCtx5756.mark, localCtx5756.defscope)
            };
        },
        getIdent: function getIdent(stx5772) {
            if (stx5772[0] && stx5772[0].isIdentifier()) {
                return {
                    success: true,
                    result: [stx5772[0]],
                    rest: stx5772.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5772
            };
        },
        getLit: function getLit(stx5773) {
            if (stx5773[0] && patternModule5354.typeIsLiteral(stx5773[0].token.type)) {
                return {
                    success: true,
                    result: [stx5773[0]],
                    rest: stx5773.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5773
            };
        },
        unwrapSyntax: syn5341.unwrapSyntax,
        throwSyntaxError: throwSyntaxError5358,
        throwSyntaxCaseError: throwSyntaxCaseError5359,
        prettyPrint: syn5341.prettyPrint,
        parser: parser5340,
        __fresh: fresh5367,
        __freshScope: freshScope5368,
        __scope: context5750.scope,
        __bindings: context5750.bindings,
        _: _5339,
        patternModule: patternModule5354,
        getPattern: function getPattern(id5774) {
            return context5750.patternMap.get(id5774);
        },
        getPatternMap: function getPatternMap() {
            return context5750.patternMap;
        },
        getTemplate: function getTemplate(id5775) {
            assert5356(context5750.templateMap.has(id5775), "missing template");
            return syn5341.cloneSyntaxArray(context5750.templateMap.get(id5775));
        },
        getTemplateMap: function getTemplateMap() {
            // the template map is global across all context during compilation
            return context5750.templateMap;
        },
        applyMarkToPatternEnv: applyMarkToPatternEnv5488,
        mergeMatches: function mergeMatches(newMatch5776, oldMatch5777) {
            newMatch5776.patternEnv = _5339.extend({}, oldMatch5777.patternEnv, newMatch5776.patternEnv);
            return newMatch5776;
        },
        console: console
    };
    context5750.env.keysStr().forEach(function (key5778) {
        var val5779 = context5750.env.getStr(key5778);
        if ( // load the runtime values into the global object
        val5779 && val5779 instanceof RuntimeValue5475) {
            macroGlobal5757[key5778] = val5779.trans.value;
        }
    });
    context5750.store.keysStr().forEach(function (key5780) {
        var val5781 = context5750.store.getStr(key5780);
        if ( // load the runtime values into the global object
        val5781 && val5781 instanceof RuntimeValue5475) {
            macroGlobal5757[key5780] = val5781.trans.value;
        }
    });
    var macroFn5758;
    // if (!vm) {
    //     macroFn = vm.runInNewContext("(function() { return " + bodyCode + " })()",
    //                                  macroGlobal);
    // } else {
    macroFn5758 = scopedEval5451(bodyCode5755, macroGlobal5757);
    return function (stx5782, context5783, prevStx5784, prevTerms5785) {
        localCtx5756 = context5783;
        return macroFn5758(stx5782, context5783, prevStx5784, prevTerms5785);
    };
}
function expandToTermTree5492(stx5786, context5787) {
    assert5356(context5787, "expander context is required");
    var f5788, head5789, prevStx5790, restStx5791, prevTerms5792, macroDefinition5793;
    var rest5794 = stx5786;
    while (rest5794.length > 0) {
        assert5356(rest5794[0].token, "expecting a syntax object");
        f5788 = enforest5484(rest5794, context5787, prevStx5790, prevTerms5792);
        // head :: TermTree
        head5789 = f5788.result;
        // rest :: [Syntax]
        rest5794 = f5788.rest;
        if (!head5789) {
            // no head means the expansions stopped prematurely (for stepping)
            restStx5791 = rest5794;
            break;
        }
        var destructed5795 = tagWithTerm5487(head5789, f5788.result.destruct(context5787));
        prevTerms5792 = [head5789].concat(f5788.prevTerms);
        prevStx5790 = destructed5795.reverse().concat(f5788.prevStx);
        if (head5789.isImportTerm) {
            var // record the import in the module record for easier access
            entries5796 = context5787.moduleRecord.addImport(head5789);
            var // load up the (possibly cached) import module
            importMod5797 = loadImport5507(unwrapSyntax5361(head5789.from), context5787, context5787.moduleRecord.name);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5787 = visit5504(importMod5797.term, importMod5797.record, context5787.phase, context5787);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5508(entries5796, importMod5797.term, importMod5797.record, context5787, context5787.phase);
        }
        if (head5789.isImportForPhaseTerm) {
            var // record the import in the module record for easier access
            entries5796 = context5787.moduleRecord.addImport(head5789);
            var // load up the (possibly cached) import module
            importMod5797 = loadImport5507(unwrapSyntax5361(head5789.from), context5787, context5787.moduleRecord.name);
            // invoking an imported module loads the runtime values
            // into the environment for this phase
            context5787 = invoke5502(importMod5797.term, importMod5797.record, context5787.phase + head5789.phase.token.value, context5787);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5787 = visit5504(importMod5797.term, importMod5797.record, context5787.phase + head5789.phase.token.value, context5787);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5508(entries5796, importMod5797.term, importMod5797.record, context5787, context5787.phase);
        }
        if (head5789.isForPhaseTerm) {
            var phaseShiftedContext5800 = makeExpanderContext5495(_5339.defaults({ phase: context5787.phase + head5789.phase.token.value }, context5787));
            head5789.body = expand5494(head5789.body, phaseShiftedContext5800);
        }
        if ((head5789.isExportDefaultTerm && head5789.decl.isMacroTerm || head5789.isMacroTerm) && expandCount5455 < maxExpands5456) {
            var macroDecl5801 = head5789.isExportDefaultTerm ? head5789.decl : head5789;
            if (!( // raw function primitive form
            macroDecl5801.body[0] && macroDecl5801.body[0].isKeyword() && macroDecl5801.body[0].token.value === "function")) {
                throwSyntaxError5358("load macro", "Primitive macro form must contain a function for the macro body", macroDecl5801.body);
            }
            // expand the body
            macroDecl5801.body = expand5494(macroDecl5801.body, makeExpanderContext5495(_5339.defaults({ phase: context5787.phase + 1 }, context5787)));
            //  and load the macro definition into the environment
            macroDefinition5793 = loadMacroDef5491(macroDecl5801.body, context5787, context5787.phase + 1);
            var fullName5802 = macroDecl5801.name.token.inner;
            var multiTokName5803 = makeMultiToken5369(macroDecl5801.name);
            multiTokName5803 = multiTokName5803.delScope(context5787.useScope);
            context5787.bindings.add(multiTokName5803, fresh5367(), context5787.phase);
            context5787.env.set(multiTokName5803, context5787.phase, new CompiletimeValue5474(new SyntaxTransform5346(macroDefinition5793, false, builtinMode5454, fullName5802), context5787.moduleRecord.name, context5787.phase));
        }
        if (head5789.isOperatorDefinitionTerm) {
            if (!( // raw function primitive form
            head5789.body[0] && head5789.body[0].isKeyword() && head5789.body[0].token.value === "function")) {
                throwSyntaxError5358("load macro", "Primitive macro form must contain a function for the macro body", head5789.body);
            }
            // expand the body
            head5789.body = expand5494(head5789.body, makeExpanderContext5495(_5339.defaults({ phase: context5787.phase + 1 }, context5787)));
            var //  and load the macro definition into the environment
            opDefinition5804 = loadMacroDef5491(head5789.body, context5787, context5787.phase + 1);
            var fullName5802 = head5789.name.token.inner;
            var multiTokName5803 = makeMultiToken5369(head5789.name);
            multiTokName5803 = multiTokName5803.delScope(context5787.useScope);
            context5787.bindings.add(multiTokName5803, fresh5367(), context5787.phase);
            var opObj5807 = getSyntaxTransform5477(multiTokName5803, context5787, context5787.phase);
            if (!opObj5807) {
                opObj5807 = {
                    isOp: true,
                    builtin: builtinMode5454,
                    fullName: fullName5802
                };
            }
            assert5356(unwrapSyntax5361(head5789.type) === "binary" || unwrapSyntax5361(head5789.type) === "unary", "operator must either be binary or unary");
            opObj5807[unwrapSyntax5361(head5789.type)] = {
                fn: opDefinition5804,
                prec: head5789.prec.token.value,
                assoc: head5789.assoc ? head5789.assoc.token.value : null
            };
            context5787.env.set(multiTokName5803, context5787.phase, new CompiletimeValue5474(opObj5807, context5787.moduleRecord.name, context5787.phase));
        }
        if (head5789.isNamedFunTerm) {
            // addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            head5789.name = head5789.name.delScope(context5787.useScope);
            context5787.bindings.add(head5789.name, fresh5367(), context5787.phase);
        }
        if (head5789.isVariableStatementTerm || head5789.isLetStatementTerm || head5789.isConstStatementTerm) {
            head5789.decls = head5789.decls.map(function (decl5808) {
                decl5808.ident = decl5808.ident.delScope(context5787.useScope);
                context5787.bindings.add(decl5808.ident, fresh5367(), context5787.phase);
                return decl5808;
            });
        }
        if (head5789.isBlockTerm && head5789.body.isDelimiterTerm) {
            head5789.body.delim.token.inner.forEach(function (term5809) {
                if (term5809.isVariableStatementTerm) {
                    term5809.decls = term5809.decls.map(function (decl5810) {
                        decl5810.ident = decl5810.ident.delScope(context5787.useScope);
                        context5787.bindings.add(decl5810.ident, fresh5367(), context5787.phase);
                        return decl5810;
                    });
                }
            });
        }
        if (head5789.isDelimiterTerm) {
            head5789.delim.token.inner.forEach(function (term5811) {
                if (term5811.isVariableStatementTerm) {
                    term5811.decls = term5811.decls.map(function (decl5812) {
                        decl5812.ident = decl5812.ident.delScope(context5787.useScope);
                        context5787.bindings.add(decl5812.ident, fresh5367(), context5787.phase);
                        return decl5812;
                    });
                }
            });
        }
        if (head5789.isForStatementTerm) {
            var forCond5813 = head5789.cond.token.inner;
            if (forCond5813[0] && resolve5348(forCond5813[0], context5787.phase) === "let" && forCond5813[1] && forCond5813[1].isIdentifier()) {
                var letNew5814 = fresh5367();
                var letId5815 = forCond5813[1];
                forCond5813 = forCond5813.map(function (stx5816) {
                    return stx5816.rename(letId5815, letNew5814);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head5789.cond.token.inner = expand5494([forCond5813[0]], context5787).concat(expand5494(forCond5813.slice(1), context5787));
                if ( // nice and easy case: `for (...) { ... }`
                rest5794[0] && rest5794[0].token.value === "{}") {
                    rest5794[0] = rest5794[0].rename(letId5815, letNew5814);
                } else {
                    var // need to deal with things like `for (...) if (...) log(...)`
                    bodyEnf5817 = enforest5484(rest5794, context5787);
                    var bodyDestructed5818 = bodyEnf5817.result.destruct(context5787);
                    var renamedBodyTerm5819 = bodyEnf5817.result.rename(letId5815, letNew5814);
                    tagWithTerm5487(renamedBodyTerm5819, bodyDestructed5818);
                    rest5794 = bodyEnf5817.rest;
                    prevStx5790 = bodyDestructed5818.reverse().concat(prevStx5790);
                    prevTerms5792 = [renamedBodyTerm5819].concat(prevTerms5792);
                }
            } else {
                head5789.cond.token.inner = expand5494(head5789.cond.token.inner, context5787);
            }
        }
    }
    return {
        // prevTerms are stored in reverse for the purposes of infix
        // lookbehind matching, so we need to re-reverse them.
        terms: prevTerms5792 ? prevTerms5792.reverse() : [],
        restStx: restStx5791,
        context: context5787
    };
}
function expandTermTreeToFinal5493(term5820, context5821) {
    assert5356(context5821 && context5821.env, "environment map is required");
    if (term5820.isArrayLiteralTerm) {
        term5820.array.delim.token.inner = expand5494(term5820.array.delim.token.inner, context5821);
        return term5820;
    } else if (term5820.isBlockTerm) {
        term5820.body.delim.token.inner = expand5494(term5820.body.delim.token.inner, context5821);
        return term5820;
    } else if (term5820.isParenExpressionTerm) {
        term5820.args = _5339.map(term5820.args, function (arg5822) {
            return expandTermTreeToFinal5493(arg5822, context5821);
        });
        return term5820;
    } else if (term5820.isCallTerm) {
        term5820.fun = expandTermTreeToFinal5493(term5820.fun, context5821);
        term5820.args = expandTermTreeToFinal5493(term5820.args, context5821);
        return term5820;
    } else if (term5820.isReturnStatementTerm) {
        term5820.expr = expandTermTreeToFinal5493(term5820.expr, context5821);
        return term5820;
    } else if (term5820.isUnaryOpTerm) {
        term5820.expr = expandTermTreeToFinal5493(term5820.expr, context5821);
        return term5820;
    } else if (term5820.isBinOpTerm || term5820.isAssignmentExpressionTerm) {
        term5820.left = expandTermTreeToFinal5493(term5820.left, context5821);
        term5820.right = expandTermTreeToFinal5493(term5820.right, context5821);
        return term5820;
    } else if (term5820.isObjGetTerm) {
        term5820.left = expandTermTreeToFinal5493(term5820.left, context5821);
        term5820.right.delim.token.inner = expand5494(term5820.right.delim.token.inner, context5821);
        return term5820;
    } else if (term5820.isObjDotGetTerm) {
        term5820.left = expandTermTreeToFinal5493(term5820.left, context5821);
        term5820.right = expandTermTreeToFinal5493(term5820.right, context5821);
        return term5820;
    } else if (term5820.isConditionalExpressionTerm) {
        term5820.cond = expandTermTreeToFinal5493(term5820.cond, context5821);
        term5820.tru = expandTermTreeToFinal5493(term5820.tru, context5821);
        term5820.fls = expandTermTreeToFinal5493(term5820.fls, context5821);
        return term5820;
    } else if (term5820.isVariableDeclarationTerm) {
        if (term5820.init) {
            term5820.init = expandTermTreeToFinal5493(term5820.init, context5821);
        }
        return term5820;
    } else if (term5820.isVariableStatementTerm) {
        term5820.decls = _5339.map(term5820.decls, function (decl5823) {
            return expandTermTreeToFinal5493(decl5823, context5821);
        });
        return term5820;
    } else if (term5820.isDelimiterTerm) {
        // expand inside the delimiter and then continue on
        term5820.delim.token.inner = expand5494(term5820.delim.token.inner, context5821);
        return term5820;
    } else if (term5820.isIdTerm) {
        var varTrans5824 = getCompiletimeValue5476(term5820.id, context5821, context5821.phase);
        if (varTrans5824 instanceof VarTransform5347) {
            term5820.id = syntaxFromToken5452(term5820.id.token, varTrans5824.id);
        }
        return term5820;
    } else if (term5820.isNamedFunTerm || term5820.isAnonFunTerm || term5820.isCatchClauseTerm || term5820.isArrowFunTerm || term5820.isModuleTerm) {
        var newDef5825;
        var paramSingleIdent5828;
        var params5829;
        var bodies5830;
        var paramNames5831;
        var bodyContext5832;
        var renamedBody5833;
        var expandedResult5834;
        var bodyTerms5835;
        var renamedParams5836;
        var flatArgs5837;
        var puncCtx5843;
        var expandedArgs5838;

        var _ret = (function () {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            newDef5825 = [];

            var scope5826 = freshScope5368(context5821.bindings);
            var useScope5827 = freshScope5368(context5821.bindings);
            paramSingleIdent5828 = term5820.params && term5820.params.isIdentifier();

            if (term5820.params && term5820.params.isDelimiter()) {
                params5829 = term5820.params;
            } else if (paramSingleIdent5828) {
                params5829 = term5820.params;
            } else {
                params5829 = syn5341.makeDelim("()", [], null);
            }

            if (Array.isArray(term5820.body)) {
                bodies5830 = syn5341.makeDelim("{}", term5820.body, null);
            } else {
                bodies5830 = term5820.body;
            }
            paramNames5831 = _5339.map(getParamIdentifiers5460(params5829), function (param5839) {
                var paramNew5840 = param5839.mark(scope5826);
                context5821.bindings.add(paramNew5840, fresh5367(), context5821.phase);
                context5821.env.set(paramNew5840, context5821.phase, new CompiletimeValue5474(new VarTransform5347(paramNew5840), context5821.moduleRecord.name, context5821.phase));
                return {
                    originalParam: param5839,
                    renamedParam: paramNew5840
                };
            });
            bodyContext5832 = makeExpanderContext5495(_5339.defaults({
                scope: scope5826,
                useScope: useScope5827,
                defscope: newDef5825,
                // paramscope is used to filter out var redeclarations
                paramscope: paramNames5831.map(function (p5841) {
                    return p5841.renamedParam;
                })
            }, context5821));
            renamedBody5833 = bodies5830.mark(scope5826);
            expandedResult5834 = expandToTermTree5492(renamedBody5833.token.inner, bodyContext5832);
            bodyTerms5835 = expandedResult5834.terms;

            if (expandedResult5834.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody5833.token.inner = expandedResult5834.terms.concat(expandedResult5834.restStx);
                if (Array.isArray(term5820.body)) {
                    term5820.body = renamedBody5833.token.inner;
                } else {
                    term5820.body = renamedBody5833;
                }
                return {
                    v: term5820
                };
            }
            renamedParams5836 = _5339.map(paramNames5831, function (p5842) {
                return p5842.renamedParam;
            });

            if (paramSingleIdent5828) {
                flatArgs5837 = renamedParams5836[0];
            } else {
                puncCtx5843 = term5820.params || null;

                flatArgs5837 = syn5341.makeDelim("()", joinSyntax5453(renamedParams5836, syn5341.makePunc(",", puncCtx5843)), puncCtx5843);
            }
            expandedArgs5838 = expand5494([flatArgs5837], bodyContext5832);

            assert5356(expandedArgs5838.length === 1, "should only get back one result");
            if ( // stitch up the function with all the renamings
            term5820.params) {
                term5820.params = expandedArgs5838[0];
            }
            bodyTerms5835 = _5339.map(bodyTerms5835, function (bodyTerm5844) {
                if ( // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                bodyTerm5844.isBlockTerm) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal5845 = expandTermTreeToFinal5493(bodyTerm5844, expandedResult5834.context);
                    return blockFinal5845;
                } else {
                    var termWithCtx5846 = bodyTerm5844;
                    // finish expansion
                    return expandTermTreeToFinal5493(termWithCtx5846, expandedResult5834.context);
                }
            });
            if (term5820.isModuleTerm) {
                bodyTerms5835.forEach(function (bodyTerm5847) {
                    if (bodyTerm5847.isExportNameTerm || bodyTerm5847.isExportDeclTerm || bodyTerm5847.isExportDefaultTerm) {
                        context5821.moduleRecord.addExport(bodyTerm5847);
                    }
                });
            }
            renamedBody5833.token.inner = bodyTerms5835;
            if (Array.isArray(term5820.body)) {
                term5820.body = renamedBody5833.token.inner;
            } else {
                term5820.body = renamedBody5833;
            }
            // and continue expand the rest
            return {
                v: term5820
            };
        })();

        if (typeof _ret === "object") return _ret.v;
    }
    // the term is fine as is
    return term5820;
}
function expand5494(stx5848, context5849) {
    assert5356(context5849, "must provide an expander context");
    var trees5850 = expandToTermTree5492(stx5848, context5849);
    var terms5851 = _5339.map(trees5850.terms, function (term5852) {
        return expandTermTreeToFinal5493(term5852, trees5850.context);
    });
    if (trees5850.restStx) {
        terms5851.push.apply(terms5851, trees5850.restStx);
    }
    return terms5851;
}
function makeExpanderContext5495(o5853) {
    o5853 = o5853 || {};
    var env5854 = o5853.env || new NameMap5344();
    var store5855 = o5853.store || new NameMap5344();
    var bindings5856 = o5853.bindings || new BindingMap5345();
    return Object.create(Object.prototype, {
        filename: {
            value: o5853.filename,
            writable: false,
            enumerable: true,
            configurable: false
        },
        compileSuffix: {
            value: o5853.compileSuffix || ".jsc",
            writable: false,
            enumerable: true,
            configurable: false
        },
        env: {
            value: env5854,
            writable: false,
            enumerable: true,
            configurable: false
        },
        store: {
            value: store5855,
            writable: false,
            enumerable: true,
            configurable: false
        },
        defscope: {
            value: o5853.defscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        paramscope: {
            value: o5853.paramscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        templateMap: {
            value: o5853.templateMap || new StringMap5343(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        patternMap: {
            value: o5853.patternMap || new StringMap5343(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        mark: {
            value: o5853.mark,
            writable: false,
            enumerable: true,
            configurable: false
        },
        bindings: {
            value: bindings5856,
            writable: false,
            enumerable: true,
            configurable: false
        },
        scope: {
            value: o5853.scope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        useScope: {
            value: o5853.useScope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        phase: {
            value: o5853.phase || 0,
            writable: false,
            enumerable: true,
            configurable: false
        },
        implicitImport: {
            value: o5853.implicitImport || new StringMap5343(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        stopMap: {
            value: o5853.stopMap || new StringMap5343(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        moduleRecord: {
            value: o5853.moduleRecord || {},
            writable: false,
            enumerable: true,
            configurable: false
        }
    });
}
function makeModuleExpanderContext5496(filename5857, templateMap5858, patternMap5859, phase5860, moduleRecord5861, compileSuffix5862, bindings5863) {
    return makeExpanderContext5495({
        filename: filename5857,
        templateMap: templateMap5858,
        patternMap: patternMap5859,
        phase: phase5860,
        moduleRecord: moduleRecord5861,
        compileSuffix: compileSuffix5862,
        bindings: bindings5863
    });
}
function makeTopLevelExpanderContext5497(options5864) {
    var filename5865 = options5864 && options5864.filename ? options5864.filename : "<anonymous module>";
    return makeExpanderContext5495({ filename: filename5865 });
}
function resolvePath5498(name5866, parent5867) {
    var path5868 = require("path");
    var resolveSync5869 = require("resolve/lib/sync");
    var root5870 = path5868.dirname(parent5867);
    var fs5871 = require("fs");
    if (name5866[0] === ".") {
        name5866 = path5868.resolve(root5870, name5866);
    }
    return resolveSync5869(name5866, {
        basedir: root5870,
        extensions: [".js", ".sjs"]
    });
}
function defaultImportStx5499(importPath5872, ctx5873) {
    var rtNames5874 = ["stxnonrec", "stxrec", "macroclass", "operator"];
    var ctNames5875 = ["quoteSyntax", "syntax", "#", "syntaxCase", "stxnonrec", "stxrec", "withSyntax", "letstx", "macroclass", "operator"];
    var importNames5876 = rtNames5874.map(function (name5880) {
        return syn5341.makeIdent(name5880, ctx5873);
    });
    var importForMacrosNames5877 = ctNames5875.map(function (name5881) {
        return syn5341.makeIdent(name5881, ctx5873);
    });
    var // import { names ... } from "importPath" for phase 1
    importForMacrosStmt5878 = [syn5341.makeKeyword("import", ctx5873), syn5341.makeDelim("{}", joinSyntax5453(importForMacrosNames5877, syn5341.makePunc(",", ctx5873)), ctx5873), syn5341.makeIdent("from", ctx5873), syn5341.makeValue(importPath5872, ctx5873), syn5341.makeKeyword("for", ctx5873), syn5341.makeIdent("phase", ctx5873), syn5341.makeValue(1, ctx5873)];
    var // import { names ... } from "importPath"
    importStmt5879 = [syn5341.makeKeyword("import", ctx5873), syn5341.makeDelim("{}", joinSyntax5453(importNames5876, syn5341.makePunc(",", ctx5873)), ctx5873), syn5341.makeIdent("from", ctx5873), syn5341.makeValue(importPath5872, ctx5873)];
    return importStmt5879.concat(importForMacrosStmt5878);
}
function createModule5500(name5882, body5883) {
    var language5884 = "base";
    var modBody5885 = body5883;
    if (body5883 && body5883[0] && body5883[1] && body5883[2] && unwrapSyntax5361(body5883[0]) === "#" && unwrapSyntax5361(body5883[1]) === "lang" && body5883[2].isStringLiteral()) {
        language5884 = unwrapSyntax5361(body5883[2]);
        // consume optional semicolon
        modBody5885 = body5883[3] && body5883[3].token.value === ";" && body5883[3].isPunctuator() ? body5883.slice(4) : body5883.slice(3);
    }
    if ( // insert the default import statements into the module body
    language5884 !== "base" && language5884 !== "js") {
        // "base" and "js" are currently special languages meaning don't
        // insert the default imports
        modBody5885 = defaultImportStx5499(language5884, body5883[0]).concat(modBody5885);
    }
    return {
        record: new ModuleRecord5353(name5882, language5884),
        term: ModuleTerm5377.create(modBody5885)
    };
}
function loadModule5501(name5886) {
    var // node specific code
    fs5887 = require("fs");
    return (function (body5888) {
        return createModule5500(name5886, body5888);
    })(parser5340.read(fs5887.readFileSync(name5886, "utf8")));
}
function invoke5502(modTerm5889, modRecord5890, phase5891, context5892) {
    if (modRecord5890.language === "base") {
        var // base modules can just use the normal require pipeline
        exported5893 = require(modRecord5890.name);
        Object.keys(exported5893).forEach(function (exp5894) {
            var // create new bindings in the context
            expName5895 = syn5341.makeIdent(exp5894, null).mark(freshScope5368(context5892.bindings));
            context5892.bindings.add(expName5895, fresh5367(), phase5891);
            modRecord5890.exportEntries.push(new ExportEntry5352(null, expName5895, expName5895));
            context5892.store.setWithModule(expName5895, phase5891, modRecord5890.name, new RuntimeValue5475({ value: exported5893[exp5894] }, modRecord5890.name, phase5891));
        });
    } else {
        // recursively invoke any imports in this module at this
        // phase and update the context
        modRecord5890.importedModules.forEach(function (impPath5898) {
            var importMod5899 = loadImport5507(impPath5898, context5892, modRecord5890.name);
            var impEntries5900 = modRecord5890.getImportsForModule(impPath5898);
            if (_5339.any(impEntries5900, function (entry5901) {
                return entry5901.forPhase === 0;
            })) {
                context5892 = invoke5502(importMod5899.term, importMod5899.record, phase5891, context5892);
            }
        });
        var // turn the module into text so we can eval it
        code5896 = (function (terms5902) {
            return codegen5338.generate(parser5340.parse(flatten5515(_5339.flatten(terms5902.map(function (term5903) {
                return term5903.destruct(context5892, {
                    stripCompileTerm: true,
                    stripModuleTerm: true
                });
            })))));
        })(modTerm5889.body);
        var global5897 = { console: console };
        // eval but with a fresh heap
        vm5355.runInNewContext(code5896, global5897);
    }
    return context5892;
}
function visitTerms5503(terms5904, modRecord5905, phase5906, context5907) {
    var name5908;
    var macroDefinition5909;
    var exportName5910;
    var entries5911;
    terms5904.forEach(function (term5912) {
        if ( // add the exported names to the module record
        term5912.isExportNameTerm || term5912.isExportDeclTerm || term5912.isExportDefaultTerm) {
            entries5911 = modRecord5905.addExport(term5912);
        }
        if (term5912.isExportDefaultTerm && term5912.decl.isMacroTerm || term5912.isMacroTerm) {
            var _multiTokName5913 = undefined,
                _fullName5914 = undefined,
                macBody5915 = term5912.isExportDefaultTerm ? term5912.decl.body : term5912.body;
            macroDefinition5909 = loadMacroDef5491(macBody5915, context5907, phase5906 + 1);
            if (term5912.isExportDefaultTerm) {
                _multiTokName5913 = entries5911[0].exportName;
                _fullName5914 = [entries5911[0].exportName];
            } else {
                _multiTokName5913 = makeMultiToken5369(term5912.name);
                _fullName5914 = term5912.name.token.inner;
            }
            // todo: handle implicit imports
            context5907.bindings.add(_multiTokName5913, fresh5367(), phase5906);
            context5907.store.set(_multiTokName5913, phase5906, new CompiletimeValue5474(new SyntaxTransform5346(macroDefinition5909, false, builtinMode5454, _fullName5914), phase5906, modRecord5905.name));
        }
        if (term5912.isForPhaseTerm) {
            visitTerms5503(term5912.body, modRecord5905, phase5906 + term5912.phase.token.value, context5907);
        }
        if (term5912.isOperatorDefinitionTerm) {
            var opDefinition5916 = loadMacroDef5491(term5912.body, context5907, phase5906 + 1);
            var multiTokName5913 = makeMultiToken5369(term5912.name);
            var fullName5914 = term5912.name.token.inner;
            var opObj5919 = {
                isOp: true,
                builtin: builtinMode5454,
                fullName: fullName5914
            };
            assert5356(unwrapSyntax5361(term5912.type) === "binary" || unwrapSyntax5361(term5912.type) === "unary", "operator must either be binary or unary");
            opObj5919[unwrapSyntax5361(term5912.type)] = {
                fn: opDefinition5916,
                prec: term5912.prec.token.value,
                assoc: term5912.assoc ? term5912.assoc.token.value : null
            };
            // bind in the store for the current phase
            context5907.bindings.add(multiTokName5913, fresh5367(), phase5906);
            context5907.store.set(phaseName, phase5906, new CompiletimeValue5474(opObj5919, phase5906, modRecord5905.name));
        }
    });
}
function visit5504(modTerm5920, modRecord5921, phase5922, context5923) {
    if ( // don't need to visit base modules since they do not support macros
    modRecord5921.language === "base") {
        return context5923;
    }
    // reset the exports
    modRecord5921.exportEntries = [];
    // for each of the imported modules, recursively visit and
    // invoke them at the appropriate phase and then bind the
    // imported names in this module
    modRecord5921.importedModules.forEach(function (impPath5924) {
        var // load the (possibly cached) module for this import
        importMod5925 = loadImport5507(impPath5924, context5923, modRecord5921.name);
        var // grab all the import statements for that module
        impEntries5926 = modRecord5921.getImportsForModule(impPath5924);
        var uniquePhases5927 = _5339.uniq(impEntries5926.map(function (entry) {
            return entry.forPhase;
        }));
        uniquePhases5927.forEach(function (impPhase5928) {
            context5923 = visit5504(importMod5925.term, importMod5925.record, phase5922 + impPhase5928, context5923);
            if ( // don't need to invoke when importing for phase 0 (runtime)
            impPhase5928 > 0) {
                context5923 = invoke5502(importMod5925.term, importMod5925.record, phase5922 + impPhase5928, context5923);
            }
        });
        bindImportInMod5508(impEntries5926, importMod5925.term, importMod5925.record, context5923, phase5922);
    });
    // load the transformers into the store
    visitTerms5503(modTerm5920.body, modRecord5921, phase5922, context5923);
    return context5923;
}
function mapCommaSep5505(l5929, f5930) {
    return l5929.map(function (stx5931, idx5932) {
        if (idx5932 % 2 !== 0 && (!stx5931.isPunctuator() || stx5931.token.value !== ",")) {
            throwSyntaxError5358("import", "expecting a comma separated list", stx5931);
        } else if (idx5932 % 2 !== 0) {
            return stx5931;
        } else {
            return f5930(stx5931);
        }
    });
}
function filterModuleCommaSep5506(stx5933) {
    return stx5933.filter(function (stx5934, idx5935) {
        if (idx5935 % 2 !== 0 && (!stx5934.isPunctuator() || stx5934.token.value !== ",")) {
            throwSyntaxError5358("import", "expecting a comma separated list", stx5934);
        } else if (idx5935 % 2 !== 0) {
            return false;
        } else {
            return true;
        }
    });
}
function loadImport5507(path5936, context5937, parentPath5938) {
    var modFullPath5939 = resolvePath5498(path5936, parentPath5938);
    if (!availableModules5457.has(modFullPath5939)) {
        var // load it
        modToImport5940 = (function (mod5941) {
            if (mod5941.record.language === "base") {
                return {
                    term: mod5941,
                    record: mod5941.record
                };
            }
            var expanded5942 = expandModule5509(mod5941.term, modFullPath5939, context5937.templateMap, context5937.patternMap, mod5941.record, context5937.compileSuffix, context5937.bindings);
            return {
                term: expanded5942.mod,
                record: expanded5942.context.moduleRecord
            };
        })(loadModule5501(modFullPath5939));
        availableModules5457.set(modFullPath5939, modToImport5940);
        return modToImport5940;
    }
    return availableModules5457.get(modFullPath5939);
}
function bindImportInMod5508(impEntries5943, modTerm5944, modRecord5945, context5946, phase5947) {
    impEntries5943.forEach(function (entry5948) {
        var isBase5949 = modRecord5945.language === "base";
        var inExports5950 = _5339.find(modRecord5945.exportEntries, function (expEntry5953) {
            return unwrapSyntax5361(expEntry5953.exportName) === unwrapSyntax5361(entry5948.importName);
        });
        if (!(inExports5950 || isBase5949)) {
            throwSyntaxError5358("compile", "the imported name `" + unwrapSyntax5361(entry5948.importName) + "` was not exported from the module", entry5948.importName);
        }
        var exportName5951;
        if (inExports5950) {
            exportName5951 = inExports5950.exportName;
        } else {
            assert5356(false, "not implemented yet: missing export name");
        }
        var localName5952 = entry5948.localName;
        context5946.bindings.addForward(localName5952, exportName5951, phase5947 + entry5948.forPhase);
    });
}
// (ModuleTerm, Str, Map, Map, ModuleRecord) -> {
//     context: ExpanderContext,
//     mod: ModuleTerm
// }
function expandModule5509(mod5954, filename5955, templateMap5956, patternMap5957, moduleRecord5958, compileSuffix5959, bindings5960) {
    var // create a new expander context for this module
    context5961 = makeModuleExpanderContext5496(filename5955, templateMap5956, patternMap5957, 0, moduleRecord5958, compileSuffix5959, bindings5960);
    return {
        context: context5961,
        mod: expandTermTreeToFinal5493(mod5954, context5961)
    };
}
function isCompileName5510(stx5962, context5963) {
    if (stx5962.isDelimiter()) {
        return !hasSyntaxTransform5478(stx5962.token.inner, context5963, 0);
    } else {
        return !hasSyntaxTransform5478(stx5962, context5963, 0);
    }
}
function filterCompileNames5511(stx5964, context5965) {
    assert5356(stx5964.isDelimiter(), "must be a delimter");
    var runtimeNames5966 = (function (names5968) {
        return names5968.filter(function (name5969) {
            return isCompileName5510(name5969, context5965);
        });
    })(filterModuleCommaSep5506(stx5964.token.inner));
    var newInner5967 = runtimeNames5966.reduce(function (acc5970, name5971, idx5972, orig5973) {
        acc5970.push(name5971);
        if (orig5973.length - 1 !== idx5972) {
            // don't add trailing comma
            acc5970.push(syn5341.makePunc(",", name5971));
        }
        return acc5970;
    }, []);
    return syn5341.makeDelim("{}", newInner5967, stx5964);
}
function flattenModule5512(modTerm5974, modRecord5975, context5976) {
    var // filter the imports to just the imports and names that are
    // actually available at runtime
    imports5977 = modRecord5975.getRuntimeImportEntries().filter(function (entry5981) {
        return isCompileName5510(entry5981.localName, context5976);
    });
    var exports5978 = modRecord5975.exportEntries.filter(function (entry5982) {
        return isCompileName5510(entry5982.localName, context5976);
    });
    var // filter out all of the import and export statements
    output5979 = modTerm5974.body.reduce(function (acc5983, term5984) {
        if (term5984.isExportNameTerm || term5984.isExportDeclTerm || term5984.isExportDefaultTerm || term5984.isImportTerm || term5984.isImportForPhaseTerm) {
            return acc5983;
        }
        return acc5983.concat(term5984.destruct(context5976, { stripCompileTerm: true }));
    }, []);
    output5979 = (function (output5985) {
        return output5985.map(function (stx5986) {
            var name5987 = resolve5348(stx5986, 0);
            if ( // collect the implicit imports (those imports that
            // must be included because a macro expanded to a reference
            // to an import from some other module)
            context5976.implicitImport.has(name5987)) {
                var implicit5988 = context5976.implicitImport.get(name5987);
                if ( // don't double add the import
                !_5339.find(imports5977, function (imp5989) {
                    return imp5989 === implicit5988;
                })) {
                    imports5977.push(implicit5988);
                }
            }
            return stx5986;
        });
    })(flatten5515(output5979));
    var // flatten everything
    flatImports5980 = imports5977.reduce(function (acc5990, entry5991) {
        entry5991.moduleRequest = entry5991.moduleRequest.clone();
        entry5991.moduleRequest.token.value += context5976.compileSuffix;
        return acc5990.concat(flatten5515(entry5991.toTerm().destruct(context5976).concat(syn5341.makePunc(";", entry5991.moduleRequest))));
    }, []);
    return {
        imports: imports5977.map(function (entry5992) {
            return entry5992.toTerm();
        }),
        body: flatImports5980.concat(output5979)
    };
}
function flattenImports5513(imports5993, mod5994, context5995) {
    return imports5993.reduce(function (acc5996, imp5997) {
        var modFullPath5998 = resolvePath5498(unwrapSyntax5361(imp5997.from), context5995.filename);
        if (availableModules5457.has(modFullPath5998)) {
            var modPair5999 = availableModules5457.get(modFullPath5998);
            if (modPair5999.record.language === "base") {
                return acc5996;
            }
            var flattened6000 = flattenModule5512(modPair5999.term, modPair5999.record, context5995);
            acc5996.push({
                path: modFullPath5998,
                code: flattened6000.body
            });
            acc5996 = acc5996.concat(flattenImports5513(flattened6000.imports, mod5994, context5995));
            return acc5996;
        } else {
            assert5356(false, "module was unexpectedly not available for compilation" + modFullPath5998);
        }
    }, []);
}
function compileModule5514(stx6001, options6002) {
    var fs6003 = require("fs");
    options6002 = options6002 || {};
    var filename6004 = options6002 && typeof options6002.filename !== "undefined" ? fs6003.realpathSync(options6002.filename) : "(anonymous module)";
    maxExpands5456 = Infinity;
    expandCount5455 = 0;
    var mod6005 = createModule5500(filename6004, stx6001);
    var // the template and pattern maps are global for every module
    templateMap6006 = new StringMap5343();
    var patternMap6007 = new StringMap5343();
    availableModules5457 = new StringMap5343();
    var expanded6008 = expandModule5509(mod6005.term, filename6004, templateMap6006, patternMap6007, mod6005.record, options6002.compileSuffix);
    var flattened6009 = flattenModule5512(expanded6008.mod, expanded6008.context.moduleRecord, expanded6008.context);
    var compiledModules6010 = flattenImports5513(flattened6009.imports, expanded6008.mod, expanded6008.context);
    return [{
        path: filename6004,
        code: flattened6009.body
    }].concat(compiledModules6010);
}
function flatten5515(stx6011) {
    return _5339.reduce(stx6011, function (acc6012, stx6013) {
        if (stx6013.isDelimiter()) {
            var openParen6014 = syntaxFromToken5452({
                type: parser5340.Token.Punctuator,
                value: stx6013.token.value[0],
                range: stx6013.token.startRange,
                sm_range: typeof stx6013.token.sm_startRange == "undefined" ? stx6013.token.startRange : stx6013.token.sm_startRange,
                lineNumber: stx6013.token.startLineNumber,
                sm_lineNumber: typeof stx6013.token.sm_startLineNumber == "undefined" ? stx6013.token.startLineNumber : stx6013.token.sm_startLineNumber,
                lineStart: stx6013.token.startLineStart,
                sm_lineStart: typeof stx6013.token.sm_startLineStart == "undefined" ? stx6013.token.startLineStart : stx6013.token.sm_startLineStart
            }, stx6013);
            var closeParen6015 = syntaxFromToken5452({
                type: parser5340.Token.Punctuator,
                value: stx6013.token.value[1],
                range: stx6013.token.endRange,
                sm_range: typeof stx6013.token.sm_endRange == "undefined" ? stx6013.token.endRange : stx6013.token.sm_endRange,
                lineNumber: stx6013.token.endLineNumber,
                sm_lineNumber: typeof stx6013.token.sm_endLineNumber == "undefined" ? stx6013.token.endLineNumber : stx6013.token.sm_endLineNumber,
                lineStart: stx6013.token.endLineStart,
                sm_lineStart: typeof stx6013.token.sm_endLineStart == "undefined" ? stx6013.token.endLineStart : stx6013.token.sm_endLineStart
            }, stx6013);
            if (stx6013.token.leadingComments) {
                openParen6014.token.leadingComments = stx6013.token.leadingComments;
            }
            if (stx6013.token.trailingComments) {
                openParen6014.token.trailingComments = stx6013.token.trailingComments;
            }
            acc6012.push(openParen6014);
            push5458.apply(acc6012, flatten5515(stx6013.token.inner));
            acc6012.push(closeParen6015);
            return acc6012;
        }
        stx6013.token.sm_lineNumber = typeof stx6013.token.sm_lineNumber != "undefined" ? stx6013.token.sm_lineNumber : stx6013.token.lineNumber;
        stx6013.token.sm_lineStart = typeof stx6013.token.sm_lineStart != "undefined" ? stx6013.token.sm_lineStart : stx6013.token.lineStart;
        stx6013.token.sm_range = typeof stx6013.token.sm_range != "undefined" ? stx6013.token.sm_range : stx6013.token.range;
        acc6012.push(stx6013);
        return acc6012;
    }, []);
}
exports.StringMap = StringMap5343;
exports.enforest = enforest5484;
exports.compileModule = compileModule5514;
exports.getCompiletimeValue = getCompiletimeValue5476;
exports.hasCompiletimeValue = hasCompiletimeValue5479;
exports.getSyntaxTransform = getSyntaxTransform5477;
exports.hasSyntaxTransform = hasSyntaxTransform5478;
exports.resolve = resolve5348;
exports.get_expression = get_expression5486;
exports.makeExpanderContext = makeExpanderContext5495;
exports.ExprTerm = ExprTerm5399;
exports.VariableStatementTerm = VariableStatementTerm5424;
exports.tokensToSyntax = syn5341.tokensToSyntax;
exports.syntaxToTokens = syn5341.syntaxToTokens;
/*
  Copyright (C) 2012 Tim Disney <tim@disnet.me>


  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*global require: true, exports:true, console: true
*/
// import @ from "contracts.js"
//# sourceMappingURL=expander.js.map