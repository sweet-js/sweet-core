"use strict";

var codegen5346 = require("escodegen"),
    _5347 = require("underscore"),
    parser5348 = require("./parser"),
    syn5349 = require("./syntax"),
    se5350 = require("./scopedEval"),
    StringMap5351 = require("./data/stringMap"),
    NameMap5352 = require("./data/nameMap"),
    BindingMap5353 = require("./data/bindingMap"),
    SyntaxTransform5354 = require("./data/transforms").SyntaxTransform,
    VarTransform5355 = require("./data/transforms").VarTransform,
    resolve5356 = require("./stx/resolve").resolve,
    marksof5357 = require("./stx/resolve").marksof,
    arraysEqual5358 = require("./stx/resolve").arraysEqual,
    makeImportEntries5359 = require("./mod/importEntry").makeImportEntries,
    ExportEntry5360 = require("./mod/exportEntry").ExportEntry,
    ModuleRecord5361 = require("./mod/moduleRecord").ModuleRecord,
    patternModule5362 = require("./patterns"),
    vm5363 = require("vm"),
    assert5364 = require("assert"),
    termTree5365 = require("./data/termTree");
var throwSyntaxError5366 = syn5349.throwSyntaxError;
var throwSyntaxCaseError5367 = syn5349.throwSyntaxCaseError;
var SyntaxCaseError5368 = syn5349.SyntaxCaseError;
var unwrapSyntax5369 = syn5349.unwrapSyntax;
var makeIdent5370 = syn5349.makeIdent;
var makePunc5371 = syn5349.makePunc;
var makeDelim5372 = syn5349.makeDelim;
var makeValue5373 = syn5349.makeValue;
var adjustLineContext5374 = syn5349.adjustLineContext;
var fresh5375 = syn5349.fresh;
var freshScope5376 = syn5349.freshScope;
var makeMultiToken5377 = syn5349.makeMultiToken;
var Scope5378 = syn5349.Scope;
var TermTree5379 = termTree5365.TermTree,
    EOFTerm5380 = termTree5365.EOFTerm,
    KeywordTerm5381 = termTree5365.KeywordTerm,
    PuncTerm5382 = termTree5365.PuncTerm,
    DelimiterTerm5383 = termTree5365.DelimiterTerm,
    ModuleTimeTerm5384 = termTree5365.ModuleTimeTerm,
    ModuleTerm5385 = termTree5365.ModuleTerm,
    ImportTerm5386 = termTree5365.ImportTerm,
    ImportForPhaseTerm5387 = termTree5365.ImportForPhaseTerm,
    NamedImportTerm5388 = termTree5365.NamedImportTerm,
    DefaultImportTerm5389 = termTree5365.DefaultImportTerm,
    NamespaceImportTerm5390 = termTree5365.NamespaceImportTerm,
    BindingTerm5391 = termTree5365.BindingTerm,
    QualifiedBindingTerm5392 = termTree5365.QualifiedBindingTerm,
    ExportNameTerm5393 = termTree5365.ExportNameTerm,
    ExportDefaultTerm5394 = termTree5365.ExportDefaultTerm,
    ExportDeclTerm5395 = termTree5365.ExportDeclTerm,
    CompileTimeTerm5396 = termTree5365.CompileTimeTerm,
    LetMacroTerm5397 = termTree5365.LetMacroTerm,
    MacroTerm5398 = termTree5365.MacroTerm,
    AnonMacroTerm5399 = termTree5365.AnonMacroTerm,
    ClassDeclarationTerm5400 = termTree5365.ClassDeclarationTerm,
    OperatorDefinitionTerm5401 = termTree5365.OperatorDefinitionTerm,
    ForPhaseTerm5402 = termTree5365.ForPhaseTerm,
    VariableDeclarationTerm5403 = termTree5365.VariableDeclarationTerm,
    StatementTerm5404 = termTree5365.StatementTerm,
    EmptyTerm5405 = termTree5365.EmptyTerm,
    CatchClauseTerm5406 = termTree5365.CatchClauseTerm,
    ForStatementTerm5407 = termTree5365.ForStatementTerm,
    ReturnStatementTerm5408 = termTree5365.ReturnStatementTerm,
    ExprTerm5409 = termTree5365.ExprTerm,
    UnaryOpTerm5410 = termTree5365.UnaryOpTerm,
    PostfixOpTerm5411 = termTree5365.PostfixOpTerm,
    BinOpTerm5412 = termTree5365.BinOpTerm,
    AssignmentExpressionTerm5413 = termTree5365.AssignmentExpressionTerm,
    ConditionalExpressionTerm5414 = termTree5365.ConditionalExpressionTerm,
    NamedFunTerm5415 = termTree5365.NamedFunTerm,
    AnonFunTerm5416 = termTree5365.AnonFunTerm,
    ArrowFunTerm5417 = termTree5365.ArrowFunTerm,
    ObjDotGetTerm5418 = termTree5365.ObjDotGetTerm,
    ObjGetTerm5419 = termTree5365.ObjGetTerm,
    TemplateTerm5420 = termTree5365.TemplateTerm,
    CallTerm5421 = termTree5365.CallTerm,
    QuoteSyntaxTerm5422 = termTree5365.QuoteSyntaxTerm,
    StopQuotedTerm5423 = termTree5365.StopQuotedTerm,
    PrimaryExpressionTerm5424 = termTree5365.PrimaryExpressionTerm,
    ThisExpressionTerm5425 = termTree5365.ThisExpressionTerm,
    LitTerm5426 = termTree5365.LitTerm,
    BlockTerm5427 = termTree5365.BlockTerm,
    ArrayLiteralTerm5428 = termTree5365.ArrayLiteralTerm,
    IdTerm5429 = termTree5365.IdTerm,
    PartialTerm5430 = termTree5365.PartialTerm,
    PartialOperationTerm5431 = termTree5365.PartialOperationTerm,
    PartialExpressionTerm5432 = termTree5365.PartialExpressionTerm,
    BindingStatementTerm5433 = termTree5365.BindingStatementTerm,
    VariableStatementTerm5434 = termTree5365.VariableStatementTerm,
    LetStatementTerm5435 = termTree5365.LetStatementTerm,
    ConstStatementTerm5436 = termTree5365.ConstStatementTerm,
    ParenExpressionTerm5437 = termTree5365.ParenExpressionTerm;
var scopedEval5461 = se5350.scopedEval;
var syntaxFromToken5462 = syn5349.syntaxFromToken;
var joinSyntax5463 = syn5349.joinSyntax;
var builtinMode5464 = false;
var expandCount5465 = 0;
var maxExpands5466;
var availableModules5467;
var push5468 = Array.prototype.push;
function wrapDelim5469(towrap5526, delimSyntax5527) {
    assert5364(delimSyntax5527.isDelimiterToken(), "expecting a delimiter token");
    return syntaxFromToken5462({
        type: parser5348.Token.Delimiter,
        value: delimSyntax5527.token.value,
        inner: towrap5526,
        range: delimSyntax5527.token.range,
        startLineNumber: delimSyntax5527.token.startLineNumber,
        lineStart: delimSyntax5527.token.lineStart
    }, delimSyntax5527);
}
function getParamIdentifiers5470(argSyntax5528) {
    if (argSyntax5528.isDelimiter()) {
        return _5347.filter(argSyntax5528.token.inner, function (stx5529) {
            return stx5529.token.value !== ",";
        });
    } else if (argSyntax5528.isIdentifier()) {
        return [argSyntax5528];
    } else {
        assert5364(false, "expecting a delimiter or a single identifier for function parameters");
    }
}
function stxIsUnaryOp5471(stx5530) {
    var staticOperators5531 = ["+", "-", "~", "!", "delete", "void", "typeof", "yield", "new", "++", "--"];
    return _5347.contains(staticOperators5531, unwrapSyntax5369(stx5530));
}
function stxIsBinOp5472(stx5532) {
    var staticOperators5533 = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "<<", ">>", ">>>"];
    return _5347.contains(staticOperators5533, unwrapSyntax5369(stx5532));
}
function getUnaryOpPrec5473(op5534) {
    var operatorPrecedence5535 = {
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
    return operatorPrecedence5535[op5534];
}
function getBinaryOpPrec5474(op5536) {
    var operatorPrecedence5537 = {
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
    return operatorPrecedence5537[op5536];
}
function getBinaryOpAssoc5475(op5538) {
    var operatorAssoc5539 = {
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
    return operatorAssoc5539[op5538];
}
function stxIsAssignOp5476(stx5540) {
    var staticOperators5541 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
    return _5347.contains(staticOperators5541, unwrapSyntax5369(stx5540));
}
function enforestImportClause5477(stx5542) {
    if (stx5542[0] && stx5542[0].isDelimiter()) {
        return {
            result: NamedImportTerm5388.create(stx5542[0]),
            rest: stx5542.slice(1)
        };
    } else if (stx5542[0] && stx5542[0].isPunctuator() && unwrapSyntax5369(stx5542[0]) === "*" && stx5542[1] && unwrapSyntax5369(stx5542[1]) === "as" && stx5542[2]) {
        return {
            result: NamespaceImportTerm5390.create(stx5542[0], stx5542[1], stx5542[2]),
            rest: stx5542.slice(3)
        };
    } else {
        return {
            result: DefaultImportTerm5389.create(stx5542[0]),
            rest: stx5542.slice(1)
        };
    }
}
function enforestImportClauseList5478(stx5543) {
    var res5544 = [];
    var clause5545 = enforestImportClause5477(stx5543);
    var rest5546 = clause5545.rest;
    res5544.push(clause5545.result);
    if (rest5546[0] && rest5546[0].isPunctuator() && unwrapSyntax5369(rest5546[0]) === ",") {
        res5544.push(rest5546[0]);
        clause5545 = enforestImportClause5477(rest5546.slice(1));
        res5544.push(clause5545.result);
        rest5546 = clause5545.rest;
    }
    return {
        result: res5544,
        rest: rest5546
    };
}
function enforestImport5479(head5547, rest5548) {
    assert5364(unwrapSyntax5369(head5547) === "import", "only call for imports");
    var clause5549 = enforestImportClauseList5478(rest5548);
    rest5548 = clause5549.rest;
    if (rest5548[0] && unwrapSyntax5369(rest5548[0]) === "from" && rest5548[1] && rest5548[1].isStringLiteral() && rest5548[2] && unwrapSyntax5369(rest5548[2]) === "for" && rest5548[3] && unwrapSyntax5369(rest5548[3]) === "phase" && rest5548[4] && rest5548[4].isNumericLiteral()) {
        var importRest5550;
        if (rest5548[5] && rest5548[5].isPunctuator() && rest5548[5].token.value === ";") {
            importRest5550 = rest5548.slice(6);
        } else {
            importRest5550 = rest5548.slice(5);
        }
        return {
            result: ImportForPhaseTerm5387.create(head5547, clause5549.result, rest5548[0], rest5548[1], rest5548[2], rest5548[3], rest5548[4]),
            rest: importRest5550
        };
    } else if (rest5548[0] && unwrapSyntax5369(rest5548[0]) === "from" && rest5548[1] && rest5548[1].isStringLiteral()) {
        var importRest5550;
        if (rest5548[2] && rest5548[2].isPunctuator() && rest5548[2].token.value === ";") {
            importRest5550 = rest5548.slice(3);
        } else {
            importRest5550 = rest5548.slice(2);
        }
        return {
            result: ImportTerm5386.create(head5547, clause5549.result, rest5548[0], rest5548[1]),
            rest: importRest5550
        };
    } else {
        throwSyntaxError5366("enforest", "unrecognized import syntax", rest5548);
    }
}
function enforestVarStatement5480(stx5552, context5553, varStx5554) {
    var decls5555 = [];
    var rest5556 = stx5552;
    var rhs5557;
    if (!rest5556.length) {
        throwSyntaxError5366("enforest", "Unexpected end of input", varStx5554);
    }
    if (expandCount5465 >= maxExpands5466) {
        return null;
    }
    while (rest5556.length) {
        if (rest5556[0].isIdentifier()) {
            if (rest5556[1] && rest5556[1].isPunctuator() && rest5556[1].token.value === "=") {
                rhs5557 = get_expression5496(rest5556.slice(2), context5553);
                if (rhs5557.result == null) {
                    throwSyntaxError5366("enforest", "Unexpected token", rhs5557.rest[0]);
                }
                if (rhs5557.rest[0] && rhs5557.rest[0].isPunctuator() && rhs5557.rest[0].token.value === ",") {
                    decls5555.push(VariableDeclarationTerm5403.create(rest5556[0], rest5556[1], rhs5557.result, rhs5557.rest[0]));
                    rest5556 = rhs5557.rest.slice(1);
                    continue;
                } else {
                    decls5555.push(VariableDeclarationTerm5403.create(rest5556[0], rest5556[1], rhs5557.result, null));
                    rest5556 = rhs5557.rest;
                    break;
                }
            } else if (rest5556[1] && rest5556[1].isPunctuator() && rest5556[1].token.value === ",") {
                decls5555.push(VariableDeclarationTerm5403.create(rest5556[0], null, null, rest5556[1]));
                rest5556 = rest5556.slice(2);
            } else {
                decls5555.push(VariableDeclarationTerm5403.create(rest5556[0], null, null, null));
                rest5556 = rest5556.slice(1);
                break;
            }
        } else {
            throwSyntaxError5366("enforest", "Unexpected token", rest5556[0]);
        }
    }
    return {
        result: decls5555,
        rest: rest5556
    };
}
function enforestAssignment5481(stx5558, context5559, left5560, prevStx5561, prevTerms5562) {
    var op5563 = stx5558[0];
    var rightStx5564 = stx5558.slice(1);
    var opTerm5565 = PuncTerm5382.create(stx5558[0]);
    var opPrevStx5566 = tagWithTerm5497(opTerm5565, [stx5558[0]]).concat(tagWithTerm5497(left5560, left5560.destruct(context5559).reverse()), prevStx5561);
    var opPrevTerms5567 = [opTerm5565, left5560].concat(prevTerms5562);
    var opRes5568 = enforest5494(rightStx5564, context5559, opPrevStx5566, opPrevTerms5567);
    if (opRes5568.result) {
        if ( // Lookbehind was matched, so it may not even be a binop anymore.
        opRes5568.prevTerms.length < opPrevTerms5567.length) {
            return opRes5568;
        }
        var right5569 = opRes5568.result;
        if ( // only a binop if the right is a real expression
        // so 2+2++ will only match 2+2
        right5569.isExprTerm) {
            var term5570 = AssignmentExpressionTerm5413.create(left5560, op5563, right5569);
            return {
                result: term5570,
                rest: opRes5568.rest,
                prevStx: prevStx5561,
                prevTerms: prevTerms5562
            };
        }
    } else {
        return opRes5568;
    }
}
function enforestParenExpression5482(parens5571, context5572) {
    var argRes5573,
        enforestedArgs5574 = [],
        commas5575 = [];
    var innerTokens5576 = parens5571.token.inner;
    while (innerTokens5576.length > 0) {
        argRes5573 = enforest5494(innerTokens5576, context5572);
        if (!argRes5573.result || !argRes5573.result.isExprTerm) {
            return null;
        }
        enforestedArgs5574.push(argRes5573.result);
        innerTokens5576 = argRes5573.rest;
        if (innerTokens5576[0] && innerTokens5576[0].token.value === ",") {
            // record the comma for later
            commas5575.push(innerTokens5576[0]);
            // but dump it for the next loop turn
            innerTokens5576 = innerTokens5576.slice(1);
        } else {
            // either there are no more tokens or
            // they aren't a comma, either way we
            // are done with the loop
            break;
        }
    }
    return innerTokens5576.length ? null : ParenExpressionTerm5437.create(enforestedArgs5574, parens5571, commas5575);
}
function resolveFast5483(stx5577, context5578, phase5579) {
    var name5580 = unwrapSyntax5369(stx5577);
    if (context5578.env.hasName(name5580) || context5578.store.hasName(name5580)) {
        return resolve5356(stx5577, phase5579);
    }
    return name5580;
}
function CompiletimeValue5484(trans5581, module5582, phase5583) {
    this.trans = trans5581;
    this.module = module5582;
    this.phase = phase5583;
}
function RuntimeValue5485(trans5584, module5585, phase5586) {
    this.trans = trans5584;
    this.module = module5585;
    this.phase = phase5586;
}
function getCompiletimeValue5486(stx5587, context5588, phase5589) {
    var store5590,
        env5591 = context5588.env.get(stx5587, phase5589);
    if (env5591 !== null) {
        return env5591.trans;
    } else {
        store5590 = context5588.store.getWithModule(stx5587, phase5589);
        return store5590 !== null ? store5590.trans : null;
    }
}
function getSyntaxTransform5487(stx5592, context5593, phase5594) {
    var t5595 = getCompiletimeValue5486(stx5592, context5593, phase5594);
    if (t5595 && t5595 instanceof VarTransform5355) {
        return null;
    }
    return t5595;
}
function hasSyntaxTransform5488(stx5596, context5597, phase5598) {
    return getSyntaxTransform5487(stx5596, context5597, phase5598) !== null;
}
function hasCompiletimeValue5489(stx5599, context5600, phase5601) {
    return context5600.env.has(stx5599, phase5601) || context5600.store.has(stx5599, phase5601);
}
function expandMacro5490(stx5602, context5603, opCtx5604, opType5605, macroObj5606) {
    var // pull the macro transformer out the environment
    head5607 = stx5602[0];
    var rest5608 = stx5602.slice(1);
    macroObj5606 = macroObj5606 || getSyntaxTransform5487(stx5602, context5603, context5603.phase);
    var stxArg5609 = rest5608.slice(macroObj5606.fullName.length - 1);
    var transformer5610;
    if (opType5605 != null) {
        assert5364(opType5605 === "binary" || opType5605 === "unary", "operator type should be either unary or binary: " + opType5605);
        transformer5610 = macroObj5606[opType5605].fn;
    } else {
        transformer5610 = macroObj5606.fn;
    }
    assert5364(typeof transformer5610 === "function", "Macro transformer not bound for: " + head5607.token.value);
    var transformerContext5611 = makeExpanderContext5505(_5347.defaults({ mark: freshScope5376(context5603.bindings) }, context5603));
    // apply the transformer
    var rt5612;
    try {
        rt5612 = transformer5610([head5607].concat(stxArg5609), transformerContext5611, opCtx5604.prevStx, opCtx5604.prevTerms);
    } catch (e5613) {
        if (e5613 instanceof SyntaxCaseError5368) {
            var // add a nicer error for syntax case
            nameStr5614 = macroObj5606.fullName.map(function (stx5615) {
                return stx5615.token.value;
            }).join("");
            if (opType5605 != null) {
                var argumentString5616 = "`" + stxArg5609.slice(0, 5).map(function (stx5617) {
                    return stx5617.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5366("operator", "Operator `" + nameStr5614 + "` could not be matched with " + argumentString5616, head5607);
            } else {
                var argumentString5616 = "`" + stxArg5609.slice(0, 5).map(function (stx5619) {
                    return stx5619.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5366("macro", "Macro `" + nameStr5614 + "` could not be matched with " + argumentString5616, head5607);
            }
        } else {
            // just rethrow it
            throw e5613;
        }
    }
    if (!builtinMode5464 && !macroObj5606.builtin) {
        expandCount5465++;
    }
    if (!Array.isArray(rt5612.result)) {
        throwSyntaxError5366("enforest", "Macro must return a syntax array", stx5602[0]);
    }
    if (rt5612.result.length > 0) {
        var adjustedResult5620 = adjustLineContext5374(rt5612.result, head5607);
        if (stx5602[0].token.leadingComments) {
            if (adjustedResult5620[0].token.leadingComments) {
                adjustedResult5620[0].token.leadingComments = adjustedResult5620[0].token.leadingComments.concat(head5607.token.leadingComments);
            } else {
                adjustedResult5620[0].token.leadingComments = head5607.token.leadingComments;
            }
        }
        rt5612.result = adjustedResult5620;
    }
    return rt5612;
}
function comparePrec5491(left5621, right5622, assoc5623) {
    if (assoc5623 === "left") {
        return left5621 <= right5622;
    }
    return left5621 < right5622;
}
function toksAdjacent5492(a5624, b5625) {
    var arange5626 = a5624.token.sm_range || a5624.token.range || a5624.token.endRange;
    var brange5627 = b5625.token.sm_range || b5625.token.range || b5625.token.endRange;
    return arange5626 && brange5627 && arange5626[1] === brange5627[0];
}
function syntaxInnerValuesEq5493(synA5628, synB5629) {
    var a5630 = synA5628.token.inner,
        b5631 = synB5629.token.inner;
    return (function (ziped5632) {
        return _5347.all(ziped5632, function (pair5633) {
            return unwrapSyntax5369(pair5633[0]) === unwrapSyntax5369(pair5633[1]);
        });
    })(a5630.length === b5631.length && _5347.zip(a5630, b5631));
}
function enforest5494(toks5634, context5635, prevStx5636, prevTerms5637) {
    assert5364(toks5634.length > 0, "enforest assumes there are tokens to work with");
    prevStx5636 = prevStx5636 || [];
    prevTerms5637 = prevTerms5637 || [];
    if (expandCount5465 >= maxExpands5466) {
        return {
            result: null,
            rest: toks5634
        };
    }
    function step5638(head5639, rest5640, opCtx5641) {
        var innerTokens5642;
        assert5364(Array.isArray(rest5640), "result must at least be an empty array");
        if (head5639.isTermTree) {
            var isCustomOp5644 = false;
            var uopMacroObj5645;
            var uopSyntax5646;
            if (head5639.isPuncTerm || head5639.isKeywordTerm || head5639.isIdTerm) {
                if (head5639.isPuncTerm) {
                    uopSyntax5646 = head5639.punc;
                } else if (head5639.isKeywordTerm) {
                    uopSyntax5646 = head5639.keyword;
                } else if (head5639.isIdTerm) {
                    uopSyntax5646 = head5639.id;
                }
                uopMacroObj5645 = getSyntaxTransform5487([uopSyntax5646].concat(rest5640), context5635, context5635.phase);
                isCustomOp5644 = uopMacroObj5645 && uopMacroObj5645.isOp;
            }
            // look up once (we want to check multiple properties on bopMacroObj
            // without repeatedly calling getValueInEnv)
            var bopMacroObj5647;
            if (rest5640[0] && rest5640[1]) {
                bopMacroObj5647 = getSyntaxTransform5487(rest5640, context5635, context5635.phase);
            }
            if ( // unary operator
            isCustomOp5644 && uopMacroObj5645.unary || uopSyntax5646 && stxIsUnaryOp5471(uopSyntax5646)) {
                var uopPrec5648;
                if (isCustomOp5644 && uopMacroObj5645.unary) {
                    uopPrec5648 = uopMacroObj5645.unary.prec;
                } else {
                    uopPrec5648 = getUnaryOpPrec5473(unwrapSyntax5369(uopSyntax5646));
                }
                var opRest5649 = rest5640;
                var uopMacroName5650;
                if (uopMacroObj5645) {
                    uopMacroName5650 = [uopSyntax5646].concat(rest5640.slice(0, uopMacroObj5645.fullName.length - 1));
                    opRest5649 = rest5640.slice(uopMacroObj5645.fullName.length - 1);
                }
                var leftLeft5651 = opCtx5641.prevTerms[0] && opCtx5641.prevTerms[0].isPartialTerm ? opCtx5641.prevTerms[0] : null;
                var unopTerm5652 = PartialOperationTerm5431.create(head5639, leftLeft5651);
                var unopPrevStx5653 = tagWithTerm5497(unopTerm5652, head5639.destruct(context5635).reverse()).concat(opCtx5641.prevStx);
                var unopPrevTerms5654 = [unopTerm5652].concat(opCtx5641.prevTerms);
                var unopOpCtx5655 = _5347.extend({}, opCtx5641, {
                    combine: function combine(t5656) {
                        if (t5656.isExprTerm) {
                            if (isCustomOp5644 && uopMacroObj5645.unary) {
                                var rt5657 = expandMacro5490(uopMacroName5650.concat(t5656.destruct(context5635)), context5635, opCtx5641, "unary");
                                var newt5658 = get_expression5496(rt5657.result, context5635);
                                assert5364(newt5658.rest.length === 0, "should never have left over syntax");
                                return opCtx5641.combine(newt5658.result);
                            }
                            return opCtx5641.combine(UnaryOpTerm5410.create(uopSyntax5646, t5656));
                        } else {
                            // not actually an expression so don't create
                            // a UnaryOp term just return with the punctuator
                            return opCtx5641.combine(head5639);
                        }
                    },
                    prec: uopPrec5648,
                    prevStx: unopPrevStx5653,
                    prevTerms: unopPrevTerms5654,
                    op: unopTerm5652
                });
                return step5638(opRest5649[0], opRest5649.slice(1), unopOpCtx5655);
            } else if (head5639.isExprTerm && (rest5640[0] && rest5640[1] && (stxIsBinOp5472(rest5640[0]) && !bopMacroObj5647 || bopMacroObj5647 && bopMacroObj5647.isOp && bopMacroObj5647.binary))) {
                var opRes5659;
                var op5660 = rest5640[0];
                var left5661 = head5639;
                var rightStx5662 = rest5640.slice(1);
                var leftLeft5651 = opCtx5641.prevTerms[0] && opCtx5641.prevTerms[0].isPartialTerm ? opCtx5641.prevTerms[0] : null;
                var leftTerm5664 = PartialExpressionTerm5432.create(head5639.destruct(context5635), leftLeft5651, function () {
                    return step5638(head5639, [], opCtx5641);
                });
                var opTerm5665 = PartialOperationTerm5431.create(op5660, leftTerm5664);
                var opPrevStx5666 = tagWithTerm5497(opTerm5665, [rest5640[0]]).concat(tagWithTerm5497(leftTerm5664, head5639.destruct(context5635)).reverse(), opCtx5641.prevStx);
                var opPrevTerms5667 = [opTerm5665, leftTerm5664].concat(opCtx5641.prevTerms);
                var isCustomOp5644 = bopMacroObj5647 && bopMacroObj5647.isOp && bopMacroObj5647.binary;
                var bopPrec5669;
                var bopAssoc5670;
                if (isCustomOp5644 && bopMacroObj5647.binary) {
                    bopPrec5669 = bopMacroObj5647.binary.prec;
                    bopAssoc5670 = bopMacroObj5647.binary.assoc;
                } else {
                    bopPrec5669 = getBinaryOpPrec5474(unwrapSyntax5369(op5660));
                    bopAssoc5670 = getBinaryOpAssoc5475(unwrapSyntax5369(op5660));
                }
                assert5364(bopPrec5669 !== undefined, "expecting a precedence for operator: " + op5660);
                var newStack5671;
                if (comparePrec5491(bopPrec5669, opCtx5641.prec, bopAssoc5670)) {
                    var bopCtx5675 = opCtx5641;
                    var combResult5643 = opCtx5641.combine(head5639);
                    if (opCtx5641.stack.length > 0) {
                        return step5638(combResult5643.term, rest5640, opCtx5641.stack[0]);
                    }
                    left5661 = combResult5643.term;
                    newStack5671 = opCtx5641.stack;
                    opPrevStx5666 = combResult5643.prevStx;
                    opPrevTerms5667 = combResult5643.prevTerms;
                } else {
                    newStack5671 = [opCtx5641].concat(opCtx5641.stack);
                }
                assert5364(opCtx5641.combine !== undefined, "expecting a combine function");
                var opRightStx5672 = rightStx5662;
                var bopMacroName5673;
                if (isCustomOp5644) {
                    bopMacroName5673 = rest5640.slice(0, bopMacroObj5647.fullName.length);
                    opRightStx5672 = rightStx5662.slice(bopMacroObj5647.fullName.length - 1);
                }
                var bopOpCtx5674 = _5347.extend({}, opCtx5641, {
                    combine: function combine(right5677) {
                        if (right5677.isExprTerm) {
                            if (isCustomOp5644 && bopMacroObj5647.binary) {
                                var leftStx5678 = left5661.destruct(context5635);
                                var rightStx5679 = right5677.destruct(context5635);
                                var rt5680 = expandMacro5490(bopMacroName5673.concat(syn5349.makeDelim("()", leftStx5678, leftStx5678[0]), syn5349.makeDelim("()", rightStx5679, rightStx5679[0])), context5635, opCtx5641, "binary");
                                var newt5681 = get_expression5496(rt5680.result, context5635);
                                assert5364(newt5681.rest.length === 0, "should never have left over syntax");
                                return {
                                    term: newt5681.result,
                                    prevStx: opPrevStx5666,
                                    prevTerms: opPrevTerms5667
                                };
                            }
                            return {
                                term: BinOpTerm5412.create(left5661, op5660, right5677),
                                prevStx: opPrevStx5666,
                                prevTerms: opPrevTerms5667
                            };
                        } else {
                            return {
                                term: head5639,
                                prevStx: opPrevStx5666,
                                prevTerms: opPrevTerms5667
                            };
                        }
                    },
                    prec: bopPrec5669,
                    op: opTerm5665,
                    stack: newStack5671,
                    prevStx: opPrevStx5666,
                    prevTerms: opPrevTerms5667
                });
                return step5638(opRightStx5672[0], opRightStx5672.slice(1), bopOpCtx5674);
            } else if (head5639.isExprTerm && (rest5640[0] && rest5640[0].isDelimiter() && rest5640[0].token.value === "()")) {
                var parenRes5682 = enforestParenExpression5482(rest5640[0], context5635);
                if (parenRes5682) {
                    return step5638(CallTerm5421.create(head5639, parenRes5682), rest5640.slice(1), opCtx5641);
                }
            } else if (head5639.isExprTerm && (rest5640[0] && resolveFast5483(rest5640[0], context5635, context5635.phase) === "?")) {
                var question5683 = rest5640[0];
                var condRes5684 = enforest5494(rest5640.slice(1), context5635);
                if (condRes5684.result) {
                    var truExpr5685 = condRes5684.result;
                    var condRight5686 = condRes5684.rest;
                    if (truExpr5685.isExprTerm && condRight5686[0] && resolveFast5483(condRight5686[0], context5635, context5635.phase) === ":") {
                        var colon5687 = condRight5686[0];
                        var flsRes5688 = enforest5494(condRight5686.slice(1), context5635);
                        var flsExpr5689 = flsRes5688.result;
                        if (flsExpr5689.isExprTerm) {
                            if ( // operators are combined before the ternary
                            opCtx5641.prec >= 4) {
                                var // ternary is like a operator with prec 4
                                headResult5690 = opCtx5641.combine(head5639);
                                var condTerm5691 = ConditionalExpressionTerm5414.create(headResult5690.term, question5683, truExpr5685, colon5687, flsExpr5689);
                                if (opCtx5641.stack.length > 0) {
                                    return step5638(condTerm5691, flsRes5688.rest, opCtx5641.stack[0]);
                                } else {
                                    return {
                                        result: condTerm5691,
                                        rest: flsRes5688.rest,
                                        prevStx: headResult5690.prevStx,
                                        prevTerms: headResult5690.prevTerms
                                    };
                                }
                            } else {
                                var condTerm5691 = ConditionalExpressionTerm5414.create(head5639, question5683, truExpr5685, colon5687, flsExpr5689);
                                return step5638(condTerm5691, flsRes5688.rest, opCtx5641);
                            }
                        }
                    }
                }
            } else if (head5639.isDelimiterTerm && head5639.delim.token.value === "()" && rest5640[0] && rest5640[0].isPunctuator() && resolveFast5483(rest5640[0], context5635, context5635.phase) === "=>") {
                var arrowRes5693 = enforest5494(rest5640.slice(1), context5635);
                if (arrowRes5693.result && arrowRes5693.result.isExprTerm) {
                    return step5638(ArrowFunTerm5417.create(head5639.delim, rest5640[0], arrowRes5693.result.destruct(context5635)), arrowRes5693.rest, opCtx5641);
                } else {
                    throwSyntaxError5366("enforest", "Body of arrow function must be an expression", rest5640.slice(1));
                }
            } else if (head5639.isIdTerm && rest5640[0] && rest5640[0].isPunctuator() && resolveFast5483(rest5640[0], context5635, context5635.phase) === "=>") {
                var res5694 = enforest5494(rest5640.slice(1), context5635);
                if (res5694.result && res5694.result.isExprTerm) {
                    return step5638(ArrowFunTerm5417.create(head5639.id, rest5640[0], res5694.result.destruct(context5635)), res5694.rest, opCtx5641);
                } else {
                    throwSyntaxError5366("enforest", "Body of arrow function must be an expression", rest5640.slice(1));
                }
            } else if (head5639.isDelimiterTerm && head5639.delim.token.value === "()") {
                if ( // empty parens are acceptable but enforest
                // doesn't accept empty arrays so short
                // circuit here
                head5639.delim.token.inner.length === 0) {
                    return step5638(ParenExpressionTerm5437.create([EmptyTerm5405.create()], head5639.delim, []), rest5640, opCtx5641);
                } else {
                    var parenRes5682 = enforestParenExpression5482(head5639.delim, context5635);
                    if (parenRes5682) {
                        return step5638(parenRes5682, rest5640, opCtx5641);
                    }
                }
            } else if (head5639.isExprTerm && ((head5639.isIdTerm || head5639.isObjGetTerm || head5639.isObjDotGetTerm || head5639.isThisExpressionTerm) && rest5640[0] && rest5640[1] && !bopMacroObj5647 && stxIsAssignOp5476(rest5640[0]))) {
                var opRes5659 = enforestAssignment5481(rest5640, context5635, head5639, prevStx5636, prevTerms5637);
                if (opRes5659 && opRes5659.result) {
                    return step5638(opRes5659.result, opRes5659.rest, _5347.extend({}, opCtx5641, {
                        prevStx: opRes5659.prevStx,
                        prevTerms: opRes5659.prevTerms
                    }));
                }
            } else if (head5639.isExprTerm && (rest5640[0] && (unwrapSyntax5369(rest5640[0]) === "++" || unwrapSyntax5369(rest5640[0]) === "--"))) {
                if ( // Check if the operator is a macro first.
                hasSyntaxTransform5488(rest5640[0], context5635, context5635.phase)) {
                    var headStx5697 = tagWithTerm5497(head5639, head5639.destruct(context5635).reverse());
                    var opPrevStx5666 = headStx5697.concat(prevStx5636);
                    var opPrevTerms5667 = [head5639].concat(prevTerms5637);
                    var opRes5659 = enforest5494(rest5640, context5635, opPrevStx5666, opPrevTerms5667);
                    if (opRes5659.prevTerms.length < opPrevTerms5667.length) {
                        return opRes5659;
                    } else if (opRes5659.result) {
                        return step5638(head5639, opRes5659.result.destruct(context5635).concat(opRes5659.rest), opCtx5641);
                    }
                }
                return step5638(PostfixOpTerm5411.create(head5639, rest5640[0]), rest5640.slice(1), opCtx5641);
            } else if (head5639.isExprTerm && (rest5640[0] && rest5640[0].token.value === "[]")) {
                return step5638(ObjGetTerm5419.create(head5639, DelimiterTerm5383.create(rest5640[0])), rest5640.slice(1), opCtx5641);
            } else if (head5639.isExprTerm && (rest5640[0] && unwrapSyntax5369(rest5640[0]) === "." && !hasSyntaxTransform5488(rest5640[0], context5635, context5635.phase) && rest5640[1] && (rest5640[1].isIdentifier() || rest5640[1].isKeyword()))) {
                if ( // Check if the identifier is a macro first.
                hasSyntaxTransform5488(rest5640[1], context5635, context5635.phase)) {
                    var headStx5697 = tagWithTerm5497(head5639, head5639.destruct(context5635).reverse());
                    var dotTerm5702 = PuncTerm5382.create(rest5640[0]);
                    var dotTerms5703 = [dotTerm5702].concat(head5639, prevTerms5637);
                    var dotStx5704 = tagWithTerm5497(dotTerm5702, [rest5640[0]]).concat(headStx5697, prevStx5636);
                    var dotRes5705 = enforest5494(rest5640.slice(1), context5635, dotStx5704, dotTerms5703);
                    if (dotRes5705.prevTerms.length < dotTerms5703.length) {
                        return dotRes5705;
                    } else if (dotRes5705.result) {
                        return step5638(head5639, [rest5640[0]].concat(dotRes5705.result.destruct(context5635), dotRes5705.rest), opCtx5641);
                    }
                }
                return step5638(ObjDotGetTerm5418.create(head5639, rest5640[0], rest5640[1]), rest5640.slice(2), opCtx5641);
            } else if (head5639.isDelimiterTerm && head5639.delim.token.value === "[]") {
                return step5638(ArrayLiteralTerm5428.create(head5639), rest5640, opCtx5641);
            } else if (head5639.isDelimiterTerm && head5639.delim.token.value === "{}") {
                return step5638(BlockTerm5427.create(head5639), rest5640, opCtx5641);
            } else if (head5639.isIdTerm && unwrapSyntax5369(head5639.id) === "#quoteSyntax" && rest5640[0] && rest5640[0].token.value === "{}") {
                return step5638(QuoteSyntaxTerm5422.create(rest5640[0]), rest5640.slice(1), opCtx5641);
            } else if (head5639.isKeywordTerm && unwrapSyntax5369(head5639.keyword) === "return") {
                if (rest5640[0] && rest5640[0].token.lineNumber === head5639.keyword.token.lineNumber) {
                    var returnPrevStx5706 = tagWithTerm5497(head5639, head5639.destruct(context5635)).concat(opCtx5641.prevStx);
                    var returnPrevTerms5707 = [head5639].concat(opCtx5641.prevTerms);
                    var returnExpr5708 = enforest5494(rest5640, context5635, returnPrevStx5706, returnPrevTerms5707);
                    if (returnExpr5708.prevTerms.length < opCtx5641.prevTerms.length) {
                        return returnExpr5708;
                    }
                    if (returnExpr5708.result.isExprTerm) {
                        return step5638(ReturnStatementTerm5408.create(head5639, returnExpr5708.result), returnExpr5708.rest, opCtx5641);
                    }
                } else {
                    return step5638(ReturnStatementTerm5408.create(head5639, EmptyTerm5405.create()), rest5640, opCtx5641);
                }
            } else if (head5639.isKeywordTerm && unwrapSyntax5369(head5639.keyword) === "let") {
                var normalizedName5709;
                if (rest5640[0] && rest5640[0].isDelimiter() && rest5640[0].token.value === "()") {
                    normalizedName5709 = rest5640[0];
                } else {
                    normalizedName5709 = syn5349.makeDelim("()", [rest5640[0]], rest5640[0]);
                }
                var lsRes5710 = enforestVarStatement5480(rest5640, context5635, head5639.keyword);
                if (lsRes5710 && lsRes5710.result) {
                    return step5638(LetStatementTerm5435.create(head5639, lsRes5710.result), lsRes5710.rest, opCtx5641);
                }
            } else if (head5639.isKeywordTerm && unwrapSyntax5369(head5639.keyword) === "var" && rest5640[0]) {
                var vsRes5711 = enforestVarStatement5480(rest5640, context5635, head5639.keyword);
                if (vsRes5711 && vsRes5711.result) {
                    return step5638(VariableStatementTerm5434.create(head5639, vsRes5711.result), vsRes5711.rest, opCtx5641);
                }
            } else if (head5639.isKeywordTerm && unwrapSyntax5369(head5639.keyword) === "const" && rest5640[0]) {
                var csRes5712 = enforestVarStatement5480(rest5640, context5635, head5639.keyword);
                if (csRes5712 && csRes5712.result) {
                    return step5638(ConstStatementTerm5436.create(head5639, csRes5712.result), csRes5712.rest, opCtx5641);
                }
            } else if (head5639.isKeywordTerm && unwrapSyntax5369(head5639.keyword) === "for" && rest5640[0] && rest5640[0].token.value === "()") {
                return step5638(ForStatementTerm5407.create(head5639.keyword, rest5640[0]), rest5640.slice(1), opCtx5641);
            }
        } else {
            assert5364(head5639 && head5639.token, "assuming head is a syntax object");
            var macroObj5713 = expandCount5465 < maxExpands5466 && getSyntaxTransform5487([head5639].concat(rest5640), context5635, context5635.phase);
            if (head5639 && context5635.stopMap.has(resolve5356(head5639, context5635.phase))) {
                return step5638(StopQuotedTerm5423.create(head5639, rest5640[0]), rest5640.slice(1), opCtx5641);
            } else if (macroObj5713 && typeof macroObj5713.fn === "function" && !macroObj5713.isOp) {
                var rt5714 = expandMacro5490([head5639].concat(rest5640), context5635, opCtx5641, null, macroObj5713);
                var newOpCtx5715 = opCtx5641;
                if (rt5714.prevTerms && rt5714.prevTerms.length < opCtx5641.prevTerms.length) {
                    newOpCtx5715 = rewindOpCtx5495(opCtx5641, rt5714);
                }
                if (rt5714.result.length > 0) {
                    return step5638(rt5714.result[0], rt5714.result.slice(1).concat(rt5714.rest), newOpCtx5715);
                } else {
                    return step5638(EmptyTerm5405.create(), rt5714.rest, newOpCtx5715);
                }
            } else if (head5639.isIdentifier() && unwrapSyntax5369(head5639) === "macro" && resolve5356(head5639, context5635.phase) === "macro" && rest5640[0] && rest5640[0].token.value === "{}") {
                return step5638(AnonMacroTerm5399.create(rest5640[0].token.inner), rest5640.slice(1), opCtx5641);
            } else if (head5639.isIdentifier() && unwrapSyntax5369(head5639) === "stxrec" && resolve5356(head5639, context5635.phase) === "stxrec") {
                var normalizedName5709;
                if (rest5640[0] && rest5640[0].isDelimiter() && rest5640[0].token.value === "()") {
                    normalizedName5709 = rest5640[0];
                } else {
                    normalizedName5709 = syn5349.makeDelim("()", [rest5640[0]], rest5640[0]);
                }
                if (rest5640[1] && rest5640[1].isDelimiter()) {
                    return step5638(MacroTerm5398.create(normalizedName5709, rest5640[1].token.inner), rest5640.slice(2), opCtx5641);
                } else {
                    throwSyntaxError5366("enforest", "Macro declaration must include body", rest5640[1]);
                }
            } else if (head5639.isIdentifier() && head5639.token.value === "unaryop" && rest5640[0] && rest5640[0].isDelimiter() && rest5640[0].token.value === "()" && rest5640[1] && rest5640[1].isNumericLiteral() && rest5640[2] && rest5640[2].isDelimiter() && rest5640[2] && rest5640[2].token.value === "{}") {
                var trans5717 = enforest5494(rest5640[2].token.inner, context5635);
                return step5638(OperatorDefinitionTerm5401.create(syn5349.makeValue("unary", head5639), rest5640[0], rest5640[1], null, trans5717.result.body), rest5640.slice(3), opCtx5641);
            } else if (head5639.isIdentifier() && head5639.token.value === "binaryop" && rest5640[0] && rest5640[0].isDelimiter() && rest5640[0].token.value === "()" && rest5640[1] && rest5640[1].isNumericLiteral() && rest5640[2] && rest5640[2].isIdentifier() && rest5640[3] && rest5640[3].isDelimiter() && rest5640[3] && rest5640[3].token.value === "{}") {
                var trans5717 = enforest5494(rest5640[3].token.inner, context5635);
                return step5638(OperatorDefinitionTerm5401.create(syn5349.makeValue("binary", head5639), rest5640[0], rest5640[1], rest5640[2], trans5717.result.body), rest5640.slice(4), opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "function" && rest5640[0] && rest5640[0].isIdentifier() && rest5640[1] && rest5640[1].isDelimiter() && rest5640[1].token.value === "()" && rest5640[2] && rest5640[2].isDelimiter() && rest5640[2].token.value === "{}") {
                rest5640[1].token.inner = rest5640[1].token.inner;
                rest5640[2].token.inner = rest5640[2].token.inner;
                return step5638(NamedFunTerm5415.create(head5639, null, rest5640[0], rest5640[1], rest5640[2]), rest5640.slice(3), opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "function" && rest5640[0] && rest5640[0].isPunctuator() && rest5640[0].token.value === "*" && rest5640[1] && rest5640[1].isIdentifier() && rest5640[2] && rest5640[2].isDelimiter() && rest5640[2].token.value === "()" && rest5640[3] && rest5640[3].isDelimiter() && rest5640[3].token.value === "{}") {
                return step5638(NamedFunTerm5415.create(head5639, rest5640[0], rest5640[1], rest5640[2], rest5640[3]), rest5640.slice(4), opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "function" && rest5640[0] && rest5640[0].isDelimiter() && rest5640[0].token.value === "()" && rest5640[1] && rest5640[1].isDelimiter() && rest5640[1].token.value === "{}") {
                return step5638(AnonFunTerm5416.create(head5639, null, rest5640[0], rest5640[1]), rest5640.slice(2), opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "function" && rest5640[0] && rest5640[0].isPunctuator() && rest5640[0].token.value === "*" && rest5640[1] && rest5640[1].isDelimiter() && rest5640[1].token.value === "()" && rest5640[2] && rest5640[2].isDelimiter && rest5640[2].token.value === "{}") {
                rest5640[1].token.inner = rest5640[1].token.inner;
                rest5640[2].token.inner = rest5640[2].token.inner;
                return step5638(AnonFunTerm5416.create(head5639, rest5640[0], rest5640[1], rest5640[2]), rest5640.slice(3), opCtx5641);
            } else if ((head5639.isDelimiter() && head5639.token.value === "()" || head5639.isIdentifier()) && rest5640[0] && rest5640[0].isPunctuator() && resolveFast5483(rest5640[0], context5635, context5635.phase) === "=>" && rest5640[1] && rest5640[1].isDelimiter() && rest5640[1].token.value === "{}") {
                return step5638(ArrowFunTerm5417.create(head5639, rest5640[0], rest5640[1]), rest5640.slice(2), opCtx5641);
            } else if (head5639.isIdentifier() && head5639.token.value === "forPhase" && rest5640[0] && rest5640[0].isNumericLiteral() && rest5640[1] && rest5640[1].isDelimiter()) {
                return step5638(ForPhaseTerm5402.create(rest5640[0], rest5640[1].token.inner), rest5640.slice(2), opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "catch" && rest5640[0] && rest5640[0].isDelimiter() && rest5640[0].token.value === "()" && rest5640[1] && rest5640[1].isDelimiter() && rest5640[1].token.value === "{}") {
                rest5640[0].token.inner = rest5640[0].token.inner;
                rest5640[1].token.inner = rest5640[1].token.inner;
                return step5638(CatchClauseTerm5406.create(head5639, rest5640[0], rest5640[1]), rest5640.slice(2), opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "this") {
                return step5638(ThisExpressionTerm5425.create(head5639), rest5640, opCtx5641);
            } else if (head5639.isNumericLiteral() || head5639.isStringLiteral() || head5639.isBooleanLiteral() || head5639.isRegularExpression() || head5639.isNullLiteral()) {
                return step5638(LitTerm5426.create(head5639), rest5640, opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "import") {
                var imp5719 = enforestImport5479(head5639, rest5640);
                return step5638(imp5719.result, imp5719.rest, opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "export" && rest5640[0] && rest5640[0].isDelimiter()) {
                return step5638(ExportNameTerm5393.create(head5639, rest5640[0]), rest5640.slice(1), opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "export" && rest5640[0] && rest5640[0].isKeyword() && unwrapSyntax5369(rest5640[0]) === "default" && rest5640[1]) {
                var res5694 = enforest5494(rest5640.slice(1), context5635);
                return step5638(ExportDefaultTerm5394.create(head5639, rest5640[0], res5694.result), res5694.rest, opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "export" && rest5640[0]) {
                var res5694 = enforest5494(rest5640, context5635);
                return step5638(ExportDeclTerm5395.create(head5639, res5694.result), res5694.rest, opCtx5641);
            } else if (head5639.isIdentifier()) {
                return step5638(IdTerm5429.create(head5639), rest5640, opCtx5641);
            } else if (head5639.isPunctuator()) {
                return step5638(PuncTerm5382.create(head5639), rest5640, opCtx5641);
            } else if (head5639.isKeyword() && unwrapSyntax5369(head5639) === "with") {
                throwSyntaxError5366("enforest", "with is not supported in sweet.js", head5639);
            } else if (head5639.isKeyword()) {
                return step5638(KeywordTerm5381.create(head5639), rest5640, opCtx5641);
            } else if (head5639.isDelimiter()) {
                return step5638(DelimiterTerm5383.create(head5639), rest5640, opCtx5641);
            } else if (head5639.isTemplate()) {
                return step5638(TemplateTerm5420.create(head5639), rest5640, opCtx5641);
            } else if (head5639.isEOF()) {
                assert5364(rest5640.length === 0, "nothing should be after an EOF");
                return step5638(EOFTerm5380.create(head5639), [], opCtx5641);
            } else {
                // todo: are we missing cases?
                assert5364(false, "not implemented");
            }
        }
        if ( // Potentially an infix macro
        // This should only be invoked on runtime syntax terms
        !head5639.isMacroTerm && !head5639.isLetMacroTerm && !head5639.isAnonMacroTerm && !head5639.isOperatorDefinitionTerm && rest5640.length && hasSyntaxTransform5488(rest5640, context5635, context5635.phase) && getSyntaxTransform5487(rest5640, context5635, context5635.phase).isOp === false) {
            var infLeftTerm5722 = opCtx5641.prevTerms[0] && opCtx5641.prevTerms[0].isPartialTerm ? opCtx5641.prevTerms[0] : null;
            var infTerm5723 = PartialExpressionTerm5432.create(head5639.destruct(context5635), infLeftTerm5722, function () {
                return step5638(head5639, [], opCtx5641);
            });
            var infPrevStx5724 = tagWithTerm5497(infTerm5723, head5639.destruct(context5635)).reverse().concat(opCtx5641.prevStx);
            var infPrevTerms5725 = [infTerm5723].concat(opCtx5641.prevTerms);
            var infRes5726 = expandMacro5490(rest5640, context5635, {
                prevStx: infPrevStx5724,
                prevTerms: infPrevTerms5725
            });
            if (infRes5726.prevTerms && infRes5726.prevTerms.length < infPrevTerms5725.length) {
                var infOpCtx5727 = rewindOpCtx5495(opCtx5641, infRes5726);
                return step5638(infRes5726.result[0], infRes5726.result.slice(1).concat(infRes5726.rest), infOpCtx5727);
            } else {
                return step5638(head5639, infRes5726.result.concat(infRes5726.rest), opCtx5641);
            }
        }
        var // done with current step so combine and continue on
        combResult5643 = opCtx5641.combine(head5639);
        if (opCtx5641.stack.length === 0) {
            return {
                result: combResult5643.term,
                rest: rest5640,
                prevStx: combResult5643.prevStx,
                prevTerms: combResult5643.prevTerms
            };
        } else {
            return step5638(combResult5643.term, rest5640, opCtx5641.stack[0]);
        }
    }
    return step5638(toks5634[0], toks5634.slice(1), {
        combine: function combine(t5728) {
            return {
                term: t5728,
                prevStx: prevStx5636,
                prevTerms: prevTerms5637
            };
        },
        prec: 0,
        stack: [],
        op: null,
        prevStx: prevStx5636,
        prevTerms: prevTerms5637
    });
}
function rewindOpCtx5495(opCtx5729, res5730) {
    if ( // If we've consumed all pending operators, we can just start over.
    // It's important that we always thread the new prevStx and prevTerms
    // through, otherwise the old ones will still persist.
    !res5730.prevTerms.length || !res5730.prevTerms[0].isPartialTerm) {
        return _5347.extend({}, opCtx5729, {
            combine: function combine(t5734) {
                return {
                    term: t5734,
                    prevStx: res5730.prevStx,
                    prevTerms: res5730.prevTerms
                };
            },
            prec: 0,
            op: null,
            stack: [],
            prevStx: res5730.prevStx,
            prevTerms: res5730.prevTerms
        });
    }
    // To rewind, we need to find the first (previous) pending operator. It
    // acts as a marker in the opCtx to let us know how far we need to go
    // back.
    var op5731 = null;
    for (var i5732 = 0; i5732 < res5730.prevTerms.length; i5732++) {
        if (!res5730.prevTerms[i5732].isPartialTerm) {
            break;
        }
        if (res5730.prevTerms[i5732].isPartialOperationTerm) {
            op5731 = res5730.prevTerms[i5732];
            break;
        }
    }
    if ( // If the op matches the current opCtx, we don't need to rewind
    // anything, but we still need to persist the prevStx and prevTerms.
    opCtx5729.op === op5731) {
        return _5347.extend({}, opCtx5729, {
            prevStx: res5730.prevStx,
            prevTerms: res5730.prevTerms
        });
    }
    for (var i5732 = 0; i5732 < opCtx5729.stack.length; i5732++) {
        if (opCtx5729.stack[i5732].op === op5731) {
            return _5347.extend({}, opCtx5729.stack[i5732], {
                prevStx: res5730.prevStx,
                prevTerms: res5730.prevTerms
            });
        }
    }
    assert5364(false, "Rewind failed.");
}
function get_expression5496(stx5735, context5736) {
    if (stx5735[0].term) {
        for (var termLen5738 = 1; termLen5738 < stx5735.length; termLen5738++) {
            if (stx5735[termLen5738].term !== stx5735[0].term) {
                break;
            }
        }
        if ( // Guard the termLen because we can have a multi-token term that
        // we don't want to split. TODO: is there something we can do to
        // get around this safely?
        stx5735[0].term.isPartialExpressionTerm && termLen5738 === stx5735[0].term.stx.length) {
            var expr5739 = stx5735[0].term.combine().result;
            for (var i5740 = 1, term5741 = stx5735[0].term; i5740 < stx5735.length; i5740++) {
                if (stx5735[i5740].term !== term5741) {
                    if (term5741 && term5741.isPartialTerm) {
                        term5741 = term5741.left;
                        i5740--;
                    } else {
                        break;
                    }
                }
            }
            return {
                result: expr5739,
                rest: stx5735.slice(i5740)
            };
        } else if (stx5735[0].term.isExprTerm) {
            return {
                result: stx5735[0].term,
                rest: stx5735.slice(termLen5738)
            };
        } else {
            return {
                result: null,
                rest: stx5735
            };
        }
    }
    var res5737 = enforest5494(stx5735, context5736);
    if (!res5737.result || !res5737.result.isExprTerm) {
        return {
            result: null,
            rest: stx5735
        };
    }
    return res5737;
}
function tagWithTerm5497(term5742, stx5743) {
    return stx5743.map(function (s5744) {
        s5744 = s5744.clone();
        s5744.term = term5742;
        return s5744;
    });
}
function applyMarkToPatternEnv5498(newMark5745, env5746) {
    function dfs5747(match5748) {
        if (match5748.level === 0) {
            // replace the match property with the marked syntax
            match5748.match = _5347.map(match5748.match, function (stx5749) {
                return stx5749.mark(newMark5745);
            });
        } else {
            _5347.each(match5748.match, function (match5750) {
                dfs5747(match5750);
            });
        }
    }
    _5347.keys(env5746).forEach(function (key5751) {
        dfs5747(env5746[key5751]);
    });
}
function markIn5499(arr5752, mark5753) {
    return arr5752.map(function (stx5754) {
        return stx5754.mark(mark5753);
    });
}
function markDefOut5500(arr5755, mark5756, def5757) {
    return arr5755.map(function (stx5758) {
        return stx5758.mark(mark5756);
    });
}
function loadMacroDef5501(body5759, context5760, phase5761) {
    var expanded5762 = body5759[0].destruct(context5760, { stripCompileTerm: true });
    var stub5763 = parser5348.read("()");
    stub5763[0].token.inner = expanded5762;
    var flattend5764 = flatten5525(stub5763);
    var bodyCode5765 = codegen5346.generate(parser5348.parse(flattend5764, { phase: phase5761 }));
    var localCtx5766;
    var macroGlobal5767 = {
        makeValue: syn5349.makeValue,
        makeRegex: syn5349.makeRegex,
        makeIdent: syn5349.makeIdent,
        makeKeyword: syn5349.makeKeyword,
        makePunc: syn5349.makePunc,
        makeDelim: syn5349.makeDelim,
        localExpand: function localExpand(stx5769, stop5770) {
            stop5770 = stop5770 || [];
            var markedStx5771 = markIn5499(stx5769, localCtx5766.mark);
            var stopMap5772 = new StringMap5351();
            stop5770.forEach(function (stop5776) {
                stopMap5772.set(resolve5356(stop5776, localCtx5766.phase), true);
            });
            var localExpandCtx5773 = makeExpanderContext5505(_5347.extend({}, localCtx5766, { stopMap: stopMap5772 }));
            var terms5774 = expand5504(markedStx5771, localExpandCtx5773);
            var newStx5775 = terms5774.reduce(function (acc5777, term5778) {
                acc5777.push.apply(acc5777, term5778.destruct(localCtx5766, { stripCompileTerm: true }));
                return acc5777;
            }, []);
            return markDefOut5500(newStx5775, localCtx5766.mark, localCtx5766.defscope);
        },
        filename: context5760.filename,
        getExpr: function getExpr(stx5779) {
            if (stx5779.length === 0) {
                return {
                    success: false,
                    result: [],
                    rest: []
                };
            }
            var markedStx5780 = markIn5499(stx5779, localCtx5766.mark);
            var r5781 = get_expression5496(markedStx5780, localCtx5766);
            return {
                success: r5781.result !== null,
                result: r5781.result === null ? [] : markDefOut5500(r5781.result.destruct(localCtx5766, { stripCompileTerm: true }), localCtx5766.mark, localCtx5766.defscope),
                rest: markDefOut5500(r5781.rest, localCtx5766.mark, localCtx5766.defscope)
            };
        },
        getIdent: function getIdent(stx5782) {
            if (stx5782[0] && stx5782[0].isIdentifier()) {
                return {
                    success: true,
                    result: [stx5782[0]],
                    rest: stx5782.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5782
            };
        },
        getLit: function getLit(stx5783) {
            if (stx5783[0] && patternModule5362.typeIsLiteral(stx5783[0].token.type)) {
                return {
                    success: true,
                    result: [stx5783[0]],
                    rest: stx5783.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5783
            };
        },
        unwrapSyntax: syn5349.unwrapSyntax,
        throwSyntaxError: throwSyntaxError5366,
        throwSyntaxCaseError: throwSyntaxCaseError5367,
        prettyPrint: syn5349.prettyPrint,
        parser: parser5348,
        __fresh: fresh5375,
        __freshScope: freshScope5376,
        __scope: context5760.scope,
        __bindings: context5760.bindings,
        _: _5347,
        patternModule: patternModule5362,
        getPattern: function getPattern(id5784) {
            return context5760.patternMap.get(id5784);
        },
        getPatternMap: function getPatternMap() {
            return context5760.patternMap;
        },
        getTemplate: function getTemplate(id5785) {
            assert5364(context5760.templateMap.has(id5785), "missing template");
            return syn5349.cloneSyntaxArray(context5760.templateMap.get(id5785));
        },
        getTemplateMap: function getTemplateMap() {
            // the template map is global across all context during compilation
            return context5760.templateMap;
        },
        applyMarkToPatternEnv: applyMarkToPatternEnv5498,
        mergeMatches: function mergeMatches(newMatch5786, oldMatch5787) {
            newMatch5786.patternEnv = _5347.extend({}, oldMatch5787.patternEnv, newMatch5786.patternEnv);
            return newMatch5786;
        },
        console: console
    };
    context5760.env.keysStr().forEach(function (key5788) {
        var val5789 = context5760.env.getStr(key5788);
        if ( // load the runtime values into the global object
        val5789 && val5789 instanceof RuntimeValue5485) {
            macroGlobal5767[key5788] = val5789.trans.value;
        }
    });
    context5760.store.keysStr().forEach(function (key5790) {
        var val5791 = context5760.store.getStr(key5790);
        if ( // load the runtime values into the global object
        val5791 && val5791 instanceof RuntimeValue5485) {
            macroGlobal5767[key5790] = val5791.trans.value;
        }
    });
    var macroFn5768;
    // if (!vm) {
    //     macroFn = vm.runInNewContext("(function() { return " + bodyCode + " })()",
    //                                  macroGlobal);
    // } else {
    macroFn5768 = scopedEval5461(bodyCode5765, macroGlobal5767);
    return function (stx5792, context5793, prevStx5794, prevTerms5795) {
        localCtx5766 = context5793;
        return macroFn5768(stx5792, context5793, prevStx5794, prevTerms5795);
    };
}
function expandToTermTree5502(stx5796, context5797) {
    assert5364(context5797, "expander context is required");
    var f5798, head5799, prevStx5800, restStx5801, prevTerms5802, macroDefinition5803;
    var rest5804 = stx5796;
    while (rest5804.length > 0) {
        assert5364(rest5804[0].token, "expecting a syntax object");
        f5798 = enforest5494(rest5804, context5797, prevStx5800, prevTerms5802);
        // head :: TermTree
        head5799 = f5798.result;
        // rest :: [Syntax]
        rest5804 = f5798.rest;
        if (!head5799) {
            // no head means the expansions stopped prematurely (for stepping)
            restStx5801 = rest5804;
            break;
        }
        var destructed5805 = tagWithTerm5497(head5799, f5798.result.destruct(context5797));
        prevTerms5802 = [head5799].concat(f5798.prevTerms);
        prevStx5800 = destructed5805.reverse().concat(f5798.prevStx);
        if (head5799.isImportTerm) {
            var // record the import in the module record for easier access
            entries5806 = context5797.moduleRecord.addImport(head5799);
            var // load up the (possibly cached) import module
            importMod5807 = loadImport5517(unwrapSyntax5369(head5799.from), context5797, context5797.moduleRecord.name);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5797 = visit5514(importMod5807.term, importMod5807.record, context5797.phase, context5797);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5518(entries5806, importMod5807.term, importMod5807.record, context5797, context5797.phase);
        }
        if (head5799.isImportForPhaseTerm) {
            var // record the import in the module record for easier access
            entries5806 = context5797.moduleRecord.addImport(head5799);
            var // load up the (possibly cached) import module
            importMod5807 = loadImport5517(unwrapSyntax5369(head5799.from), context5797, context5797.moduleRecord.name);
            // invoking an imported module loads the runtime values
            // into the environment for this phase
            context5797 = invoke5512(importMod5807.term, importMod5807.record, context5797.phase + head5799.phase.token.value, context5797);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5797 = visit5514(importMod5807.term, importMod5807.record, context5797.phase + head5799.phase.token.value, context5797);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5518(entries5806, importMod5807.term, importMod5807.record, context5797, context5797.phase);
        }
        if (head5799.isForPhaseTerm) {
            var phaseShiftedContext5810 = makeExpanderContext5505(_5347.defaults({ phase: context5797.phase + head5799.phase.token.value }, context5797));
            head5799.body = expand5504(head5799.body, phaseShiftedContext5810);
        }
        if ((head5799.isExportDefaultTerm && head5799.decl.isMacroTerm || head5799.isMacroTerm) && expandCount5465 < maxExpands5466) {
            var macroDecl5811 = head5799.isExportDefaultTerm ? head5799.decl : head5799;
            if (!( // raw function primitive form
            macroDecl5811.body[0] && macroDecl5811.body[0].isKeyword() && macroDecl5811.body[0].token.value === "function")) {
                throwSyntaxError5366("load macro", "Primitive macro form must contain a function for the macro body", macroDecl5811.body);
            }
            // expand the body
            macroDecl5811.body = expand5504(macroDecl5811.body, makeExpanderContext5505(_5347.defaults({ phase: context5797.phase + 1 }, context5797)));
            //  and load the macro definition into the environment
            macroDefinition5803 = loadMacroDef5501(macroDecl5811.body, context5797, context5797.phase + 1);
            var fullName5812 = macroDecl5811.name.token.inner;
            var multiTokName5813 = makeMultiToken5377(macroDecl5811.name);
            multiTokName5813 = multiTokName5813.delScope(context5797.useScope);
            context5797.bindings.add(multiTokName5813, fresh5375(), context5797.phase);
            context5797.env.set(multiTokName5813, context5797.phase, new CompiletimeValue5484(new SyntaxTransform5354(macroDefinition5803, false, builtinMode5464, fullName5812), context5797.moduleRecord.name, context5797.phase));
        }
        if (head5799.isLetMacroTerm && expandCount5465 < maxExpands5466) {
            if (!( // raw function primitive form
            head5799.body[0] && head5799.body[0].isKeyword() && head5799.body[0].token.value === "function")) {
                throwSyntaxError5366("load macro", "Primitive macro form must contain a function for the macro body", head5799.body);
            }
            // expand the body
            head5799.body = expand5504(head5799.body, makeExpanderContext5505(_5347.defaults({ phase: context5797.phase + 1 }, context5797)));
            //  and load the macro definition into the environment
            macroDefinition5803 = loadMacroDef5501(head5799.body, context5797, context5797.phase + 1);
            var _fullName5812 = head5799.name.token.inner;
            var _multiTokName5813 = makeMultiToken5377(head5799.name);
            // var freshName = fresh();
            // var renamedName = multiTokName.rename(multiTokName, freshName);
            //
            // head.name = head.name.rename(multiTokName, freshName);
            // rest = _.map(rest, function(stx) {
            //     return stx.rename(multiTokName, freshName);
            // });
            _multiTokName5813 = _multiTokName5813.delScope(context5797.useScope);
            context5797.bindings.add(_multiTokName5813, fresh5375(), context5797.phase);
            context5797.env.set(_multiTokName5813, context5797.phase, new CompiletimeValue5484(new SyntaxTransform5354(macroDefinition5803, false, builtinMode5464, _fullName5812), context5797.moduleRecord.name, context5797.phase));
        }
        if (head5799.isOperatorDefinitionTerm) {
            if (!( // raw function primitive form
            head5799.body[0] && head5799.body[0].isKeyword() && head5799.body[0].token.value === "function")) {
                throwSyntaxError5366("load macro", "Primitive macro form must contain a function for the macro body", head5799.body);
            }
            // expand the body
            head5799.body = expand5504(head5799.body, makeExpanderContext5505(_5347.defaults({ phase: context5797.phase + 1 }, context5797)));
            var //  and load the macro definition into the environment
            opDefinition5816 = loadMacroDef5501(head5799.body, context5797, context5797.phase + 1);
            var fullName5812 = head5799.name.token.inner;
            var multiTokName5813 = makeMultiToken5377(head5799.name);
            multiTokName5813 = multiTokName5813.delScope(context5797.useScope);
            context5797.bindings.add(multiTokName5813, fresh5375(), context5797.phase);
            var opObj5819 = getSyntaxTransform5487(multiTokName5813, context5797, context5797.phase);
            if (!opObj5819) {
                opObj5819 = {
                    isOp: true,
                    builtin: builtinMode5464,
                    fullName: fullName5812
                };
            }
            assert5364(unwrapSyntax5369(head5799.type) === "binary" || unwrapSyntax5369(head5799.type) === "unary", "operator must either be binary or unary");
            opObj5819[unwrapSyntax5369(head5799.type)] = {
                fn: opDefinition5816,
                prec: head5799.prec.token.value,
                assoc: head5799.assoc ? head5799.assoc.token.value : null
            };
            context5797.env.set(multiTokName5813, context5797.phase, new CompiletimeValue5484(opObj5819, context5797.moduleRecord.name, context5797.phase));
        }
        if (head5799.isNamedFunTerm) {
            // addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            head5799.name = head5799.name.delScope(context5797.useScope);
            context5797.bindings.add(head5799.name, fresh5375(), context5797.phase);
        }
        if (head5799.isVariableStatementTerm || head5799.isLetStatementTerm || head5799.isConstStatementTerm) {
            head5799.decls = head5799.decls.map(function (decl5820) {
                decl5820.ident = decl5820.ident.delScope(context5797.useScope);
                context5797.bindings.add(decl5820.ident, fresh5375(), context5797.phase);
                return decl5820;
            });
        }
        if (head5799.isBlockTerm && head5799.body.isDelimiterTerm) {
            head5799.body.delim.token.inner.forEach(function (term5821) {
                if (term5821.isVariableStatementTerm) {
                    term5821.decls = term5821.decls.map(function (decl5822) {
                        decl5822.ident = decl5822.ident.delScope(context5797.useScope);
                        context5797.bindings.add(decl5822.ident, fresh5375(), context5797.phase);
                        return decl5822;
                    });
                }
            });
        }
        if (head5799.isDelimiterTerm) {
            head5799.delim.token.inner.forEach(function (term5823) {
                if (term5823.isVariableStatementTerm) {
                    term5823.decls = term5823.decls.map(function (decl5824) {
                        decl5824.ident = decl5824.ident.delScope(context5797.useScope);
                        context5797.bindings.add(decl5824.ident, fresh5375(), context5797.phase);
                        return decl5824;
                    });
                }
            });
        }
        if (head5799.isForStatementTerm) {
            var forCond5825 = head5799.cond.token.inner;
            if (forCond5825[0] && resolve5356(forCond5825[0], context5797.phase) === "let" && forCond5825[1] && forCond5825[1].isIdentifier()) {
                var letNew5826 = fresh5375();
                var letId5827 = forCond5825[1];
                forCond5825 = forCond5825.map(function (stx5828) {
                    return stx5828.rename(letId5827, letNew5826);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head5799.cond.token.inner = expand5504([forCond5825[0]], context5797).concat(expand5504(forCond5825.slice(1), context5797));
                if ( // nice and easy case: `for (...) { ... }`
                rest5804[0] && rest5804[0].token.value === "{}") {
                    rest5804[0] = rest5804[0].rename(letId5827, letNew5826);
                } else {
                    var // need to deal with things like `for (...) if (...) log(...)`
                    bodyEnf5829 = enforest5494(rest5804, context5797);
                    var bodyDestructed5830 = bodyEnf5829.result.destruct(context5797);
                    var renamedBodyTerm5831 = bodyEnf5829.result.rename(letId5827, letNew5826);
                    tagWithTerm5497(renamedBodyTerm5831, bodyDestructed5830);
                    rest5804 = bodyEnf5829.rest;
                    prevStx5800 = bodyDestructed5830.reverse().concat(prevStx5800);
                    prevTerms5802 = [renamedBodyTerm5831].concat(prevTerms5802);
                }
            } else {
                head5799.cond.token.inner = expand5504(head5799.cond.token.inner, context5797);
            }
        }
    }
    return {
        // prevTerms are stored in reverse for the purposes of infix
        // lookbehind matching, so we need to re-reverse them.
        terms: prevTerms5802 ? prevTerms5802.reverse() : [],
        restStx: restStx5801,
        context: context5797
    };
}
function expandTermTreeToFinal5503(term5832, context5833) {
    assert5364(context5833 && context5833.env, "environment map is required");
    if (term5832.isArrayLiteralTerm) {
        term5832.array.delim.token.inner = expand5504(term5832.array.delim.token.inner, context5833);
        return term5832;
    } else if (term5832.isBlockTerm) {
        term5832.body.delim.token.inner = expand5504(term5832.body.delim.token.inner, context5833);
        return term5832;
    } else if (term5832.isParenExpressionTerm) {
        term5832.args = _5347.map(term5832.args, function (arg5834) {
            return expandTermTreeToFinal5503(arg5834, context5833);
        });
        return term5832;
    } else if (term5832.isCallTerm) {
        term5832.fun = expandTermTreeToFinal5503(term5832.fun, context5833);
        term5832.args = expandTermTreeToFinal5503(term5832.args, context5833);
        return term5832;
    } else if (term5832.isReturnStatementTerm) {
        term5832.expr = expandTermTreeToFinal5503(term5832.expr, context5833);
        return term5832;
    } else if (term5832.isUnaryOpTerm) {
        term5832.expr = expandTermTreeToFinal5503(term5832.expr, context5833);
        return term5832;
    } else if (term5832.isBinOpTerm || term5832.isAssignmentExpressionTerm) {
        term5832.left = expandTermTreeToFinal5503(term5832.left, context5833);
        term5832.right = expandTermTreeToFinal5503(term5832.right, context5833);
        return term5832;
    } else if (term5832.isObjGetTerm) {
        term5832.left = expandTermTreeToFinal5503(term5832.left, context5833);
        term5832.right.delim.token.inner = expand5504(term5832.right.delim.token.inner, context5833);
        return term5832;
    } else if (term5832.isObjDotGetTerm) {
        term5832.left = expandTermTreeToFinal5503(term5832.left, context5833);
        term5832.right = expandTermTreeToFinal5503(term5832.right, context5833);
        return term5832;
    } else if (term5832.isConditionalExpressionTerm) {
        term5832.cond = expandTermTreeToFinal5503(term5832.cond, context5833);
        term5832.tru = expandTermTreeToFinal5503(term5832.tru, context5833);
        term5832.fls = expandTermTreeToFinal5503(term5832.fls, context5833);
        return term5832;
    } else if (term5832.isVariableDeclarationTerm) {
        if (term5832.init) {
            term5832.init = expandTermTreeToFinal5503(term5832.init, context5833);
        }
        return term5832;
    } else if (term5832.isVariableStatementTerm) {
        term5832.decls = _5347.map(term5832.decls, function (decl5835) {
            return expandTermTreeToFinal5503(decl5835, context5833);
        });
        return term5832;
    } else if (term5832.isDelimiterTerm) {
        // expand inside the delimiter and then continue on
        term5832.delim.token.inner = expand5504(term5832.delim.token.inner, context5833);
        return term5832;
    } else if (term5832.isIdTerm) {
        var varTrans5836 = getCompiletimeValue5486(term5832.id, context5833, context5833.phase);
        if (varTrans5836 instanceof VarTransform5355) {
            term5832.id = syntaxFromToken5462(term5832.id.token, varTrans5836.id);
        }
        return term5832;
    } else if (term5832.isNamedFunTerm || term5832.isAnonFunTerm || term5832.isCatchClauseTerm || term5832.isArrowFunTerm || term5832.isModuleTerm) {
        var newDef5837;
        var paramSingleIdent5840;
        var params5841;
        var bodies5842;
        var paramNames5843;
        var bodyContext5844;
        var renamedBody5845;
        var expandedResult5846;
        var bodyTerms5847;
        var renamedParams5848;
        var flatArgs5849;
        var puncCtx5855;
        var expandedArgs5850;

        var _ret = (function () {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            newDef5837 = [];

            var scope5838 = freshScope5376(context5833.bindings);
            var useScope5839 = freshScope5376(context5833.bindings);
            paramSingleIdent5840 = term5832.params && term5832.params.isIdentifier();

            if (term5832.params && term5832.params.isDelimiter()) {
                params5841 = term5832.params;
            } else if (paramSingleIdent5840) {
                params5841 = term5832.params;
            } else {
                params5841 = syn5349.makeDelim("()", [], null);
            }

            if (Array.isArray(term5832.body)) {
                bodies5842 = syn5349.makeDelim("{}", term5832.body, null);
            } else {
                bodies5842 = term5832.body;
            }
            paramNames5843 = _5347.map(getParamIdentifiers5470(params5841), function (param5851) {
                var paramNew5852 = param5851.mark(scope5838);
                context5833.bindings.add(paramNew5852, fresh5375(), context5833.phase);
                context5833.env.set(paramNew5852, context5833.phase, new CompiletimeValue5484(new VarTransform5355(paramNew5852), context5833.moduleRecord.name, context5833.phase));
                return {
                    originalParam: param5851,
                    renamedParam: paramNew5852
                };
            });
            bodyContext5844 = makeExpanderContext5505(_5347.defaults({
                scope: scope5838,
                useScope: useScope5839,
                defscope: newDef5837,
                // paramscope is used to filter out var redeclarations
                paramscope: paramNames5843.map(function (p5853) {
                    return p5853.renamedParam;
                })
            }, context5833));
            renamedBody5845 = bodies5842.mark(scope5838);
            expandedResult5846 = expandToTermTree5502(renamedBody5845.token.inner, bodyContext5844);
            bodyTerms5847 = expandedResult5846.terms;

            if (expandedResult5846.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody5845.token.inner = expandedResult5846.terms.concat(expandedResult5846.restStx);
                if (Array.isArray(term5832.body)) {
                    term5832.body = renamedBody5845.token.inner;
                } else {
                    term5832.body = renamedBody5845;
                }
                return {
                    v: term5832
                };
            }
            renamedParams5848 = _5347.map(paramNames5843, function (p5854) {
                return p5854.renamedParam;
            });

            if (paramSingleIdent5840) {
                flatArgs5849 = renamedParams5848[0];
            } else {
                puncCtx5855 = term5832.params || null;

                flatArgs5849 = syn5349.makeDelim("()", joinSyntax5463(renamedParams5848, syn5349.makePunc(",", puncCtx5855)), puncCtx5855);
            }
            expandedArgs5850 = expand5504([flatArgs5849], bodyContext5844);

            assert5364(expandedArgs5850.length === 1, "should only get back one result");
            if ( // stitch up the function with all the renamings
            term5832.params) {
                term5832.params = expandedArgs5850[0];
            }
            bodyTerms5847 = _5347.map(bodyTerms5847, function (bodyTerm5856) {
                if ( // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                bodyTerm5856.isBlockTerm) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal5857 = expandTermTreeToFinal5503(bodyTerm5856, expandedResult5846.context);
                    return blockFinal5857;
                } else {
                    var termWithCtx5858 = bodyTerm5856;
                    // finish expansion
                    return expandTermTreeToFinal5503(termWithCtx5858, expandedResult5846.context);
                }
            });
            if (term5832.isModuleTerm) {
                bodyTerms5847.forEach(function (bodyTerm5859) {
                    if (bodyTerm5859.isExportNameTerm || bodyTerm5859.isExportDeclTerm || bodyTerm5859.isExportDefaultTerm) {
                        context5833.moduleRecord.addExport(bodyTerm5859);
                    }
                });
            }
            renamedBody5845.token.inner = bodyTerms5847;
            if (Array.isArray(term5832.body)) {
                term5832.body = renamedBody5845.token.inner;
            } else {
                term5832.body = renamedBody5845;
            }
            // and continue expand the rest
            return {
                v: term5832
            };
        })();

        if (typeof _ret === "object") return _ret.v;
    }
    // the term is fine as is
    return term5832;
}
function expand5504(stx5860, context5861) {
    assert5364(context5861, "must provide an expander context");
    var trees5862 = expandToTermTree5502(stx5860, context5861);
    var terms5863 = _5347.map(trees5862.terms, function (term5864) {
        return expandTermTreeToFinal5503(term5864, trees5862.context);
    });
    if (trees5862.restStx) {
        terms5863.push.apply(terms5863, trees5862.restStx);
    }
    return terms5863;
}
function makeExpanderContext5505(o5865) {
    o5865 = o5865 || {};
    var env5866 = o5865.env || new NameMap5352();
    var store5867 = o5865.store || new NameMap5352();
    var bindings5868 = o5865.bindings || new BindingMap5353();
    return Object.create(Object.prototype, {
        filename: {
            value: o5865.filename,
            writable: false,
            enumerable: true,
            configurable: false
        },
        compileSuffix: {
            value: o5865.compileSuffix || ".jsc",
            writable: false,
            enumerable: true,
            configurable: false
        },
        env: {
            value: env5866,
            writable: false,
            enumerable: true,
            configurable: false
        },
        store: {
            value: store5867,
            writable: false,
            enumerable: true,
            configurable: false
        },
        defscope: {
            value: o5865.defscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        paramscope: {
            value: o5865.paramscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        templateMap: {
            value: o5865.templateMap || new StringMap5351(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        patternMap: {
            value: o5865.patternMap || new StringMap5351(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        mark: {
            value: o5865.mark,
            writable: false,
            enumerable: true,
            configurable: false
        },
        bindings: {
            value: bindings5868,
            writable: false,
            enumerable: true,
            configurable: false
        },
        scope: {
            value: o5865.scope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        useScope: {
            value: o5865.useScope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        phase: {
            value: o5865.phase || 0,
            writable: false,
            enumerable: true,
            configurable: false
        },
        implicitImport: {
            value: o5865.implicitImport || new StringMap5351(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        stopMap: {
            value: o5865.stopMap || new StringMap5351(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        moduleRecord: {
            value: o5865.moduleRecord || {},
            writable: false,
            enumerable: true,
            configurable: false
        }
    });
}
function makeModuleExpanderContext5506(filename5869, templateMap5870, patternMap5871, phase5872, moduleRecord5873, compileSuffix5874, bindings5875) {
    return makeExpanderContext5505({
        filename: filename5869,
        templateMap: templateMap5870,
        patternMap: patternMap5871,
        phase: phase5872,
        moduleRecord: moduleRecord5873,
        compileSuffix: compileSuffix5874,
        bindings: bindings5875
    });
}
function makeTopLevelExpanderContext5507(options5876) {
    var filename5877 = options5876 && options5876.filename ? options5876.filename : "<anonymous module>";
    return makeExpanderContext5505({ filename: filename5877 });
}
function resolvePath5508(name5878, parent5879) {
    var path5880 = require("path");
    var resolveSync5881 = require("resolve/lib/sync");
    var root5882 = path5880.dirname(parent5879);
    var fs5883 = require("fs");
    if (name5878[0] === ".") {
        name5878 = path5880.resolve(root5882, name5878);
    }
    return resolveSync5881(name5878, {
        basedir: root5882,
        extensions: [".js", ".sjs"]
    });
}
function defaultImportStx5509(importPath5884, ctx5885) {
    var rtNames5886 = ["stxnonrec", "stxrec", "macroclass", "operator"];
    var ctNames5887 = ["quoteSyntax", "syntax", "#", "syntaxCase", "stxnonrec", "stxrec", "withSyntax", "letstx", "macroclass", "operator"];
    var importNames5888 = rtNames5886.map(function (name5892) {
        return syn5349.makeIdent(name5892, ctx5885);
    });
    var importForMacrosNames5889 = ctNames5887.map(function (name5893) {
        return syn5349.makeIdent(name5893, ctx5885);
    });
    var // import { names ... } from "importPath" for phase 1
    importForMacrosStmt5890 = [syn5349.makeKeyword("import", ctx5885), syn5349.makeDelim("{}", joinSyntax5463(importForMacrosNames5889, syn5349.makePunc(",", ctx5885)), ctx5885), syn5349.makeIdent("from", ctx5885), syn5349.makeValue(importPath5884, ctx5885), syn5349.makeKeyword("for", ctx5885), syn5349.makeIdent("phase", ctx5885), syn5349.makeValue(1, ctx5885)];
    var // import { names ... } from "importPath"
    importStmt5891 = [syn5349.makeKeyword("import", ctx5885), syn5349.makeDelim("{}", joinSyntax5463(importNames5888, syn5349.makePunc(",", ctx5885)), ctx5885), syn5349.makeIdent("from", ctx5885), syn5349.makeValue(importPath5884, ctx5885)];
    return importStmt5891.concat(importForMacrosStmt5890);
}
function createModule5510(name5894, body5895) {
    var language5896 = "base";
    var modBody5897 = body5895;
    if (body5895 && body5895[0] && body5895[1] && body5895[2] && unwrapSyntax5369(body5895[0]) === "#" && unwrapSyntax5369(body5895[1]) === "lang" && body5895[2].isStringLiteral()) {
        language5896 = unwrapSyntax5369(body5895[2]);
        // consume optional semicolon
        modBody5897 = body5895[3] && body5895[3].token.value === ";" && body5895[3].isPunctuator() ? body5895.slice(4) : body5895.slice(3);
    }
    if ( // insert the default import statements into the module body
    language5896 !== "base" && language5896 !== "js") {
        // "base" and "js" are currently special languages meaning don't
        // insert the default imports
        modBody5897 = defaultImportStx5509(language5896, body5895[0]).concat(modBody5897);
    }
    return {
        record: new ModuleRecord5361(name5894, language5896),
        term: ModuleTerm5385.create(modBody5897)
    };
}
function loadModule5511(name5898) {
    var // node specific code
    fs5899 = require("fs");
    return (function (body5900) {
        return createModule5510(name5898, body5900);
    })(parser5348.read(fs5899.readFileSync(name5898, "utf8")));
}
function invoke5512(modTerm5901, modRecord5902, phase5903, context5904) {
    if (modRecord5902.language === "base") {
        var // base modules can just use the normal require pipeline
        exported5905 = require(modRecord5902.name);
        Object.keys(exported5905).forEach(function (exp5906) {
            var // create new bindings in the context
            expName5907 = syn5349.makeIdent(exp5906, null).mark(freshScope5376(context5904.bindings));
            context5904.bindings.add(expName5907, fresh5375(), phase5903);
            modRecord5902.exportEntries.push(new ExportEntry5360(null, expName5907, expName5907));
            context5904.store.setWithModule(expName5907, phase5903, modRecord5902.name, new RuntimeValue5485({ value: exported5905[exp5906] }, modRecord5902.name, phase5903));
        });
    } else {
        // recursively invoke any imports in this module at this
        // phase and update the context
        modRecord5902.importedModules.forEach(function (impPath5910) {
            var importMod5911 = loadImport5517(impPath5910, context5904, modRecord5902.name);
            var impEntries5912 = modRecord5902.getImportsForModule(impPath5910);
            if (_5347.any(impEntries5912, function (entry5913) {
                return entry5913.forPhase === 0;
            })) {
                context5904 = invoke5512(importMod5911.term, importMod5911.record, phase5903, context5904);
            }
        });
        var // turn the module into text so we can eval it
        code5908 = (function (terms5914) {
            return codegen5346.generate(parser5348.parse(flatten5525(_5347.flatten(terms5914.map(function (term5915) {
                return term5915.destruct(context5904, {
                    stripCompileTerm: true,
                    stripModuleTerm: true
                });
            })))));
        })(modTerm5901.body);
        var global5909 = { console: console };
        // eval but with a fresh heap
        vm5363.runInNewContext(code5908, global5909);
    }
    return context5904;
}
function visitTerms5513(terms5916, modRecord5917, phase5918, context5919) {
    var name5920;
    var macroDefinition5921;
    var exportName5922;
    var entries5923;
    terms5916.forEach(function (term5924) {
        if ( // add the exported names to the module record
        term5924.isExportNameTerm || term5924.isExportDeclTerm || term5924.isExportDefaultTerm) {
            entries5923 = modRecord5917.addExport(term5924);
        }
        if (term5924.isExportDefaultTerm && term5924.decl.isMacroTerm || term5924.isMacroTerm || term5924.isLetMacroTerm) {
            var _multiTokName5925 = undefined,
                _fullName5926 = undefined,
                macBody5927 = term5924.isExportDefaultTerm ? term5924.decl.body : term5924.body;
            macroDefinition5921 = loadMacroDef5501(macBody5927, context5919, phase5918 + 1);
            if (term5924.isExportDefaultTerm) {
                _multiTokName5925 = entries5923[0].exportName;
                _fullName5926 = [entries5923[0].exportName];
            } else {
                _multiTokName5925 = makeMultiToken5377(term5924.name);
                _fullName5926 = term5924.name.token.inner;
            }
            // todo: handle implicit imports
            context5919.bindings.add(_multiTokName5925, fresh5375(), phase5918);
            context5919.store.set(_multiTokName5925, phase5918, new CompiletimeValue5484(new SyntaxTransform5354(macroDefinition5921, false, builtinMode5464, _fullName5926), phase5918, modRecord5917.name));
        }
        if (term5924.isForPhaseTerm) {
            visitTerms5513(term5924.body, modRecord5917, phase5918 + term5924.phase.token.value, context5919);
        }
        if (term5924.isOperatorDefinitionTerm) {
            var opDefinition5928 = loadMacroDef5501(term5924.body, context5919, phase5918 + 1);
            var multiTokName5925 = makeMultiToken5377(term5924.name);
            var fullName5926 = term5924.name.token.inner;
            var opObj5931 = {
                isOp: true,
                builtin: builtinMode5464,
                fullName: fullName5926
            };
            assert5364(unwrapSyntax5369(term5924.type) === "binary" || unwrapSyntax5369(term5924.type) === "unary", "operator must either be binary or unary");
            opObj5931[unwrapSyntax5369(term5924.type)] = {
                fn: opDefinition5928,
                prec: term5924.prec.token.value,
                assoc: term5924.assoc ? term5924.assoc.token.value : null
            };
            // bind in the store for the current phase
            context5919.bindings.add(multiTokName5925, fresh5375(), phase5918);
            context5919.store.set(phaseName, phase5918, new CompiletimeValue5484(opObj5931, phase5918, modRecord5917.name));
        }
    });
}
function visit5514(modTerm5932, modRecord5933, phase5934, context5935) {
    if ( // don't need to visit base modules since they do not support macros
    modRecord5933.language === "base") {
        return context5935;
    }
    // reset the exports
    modRecord5933.exportEntries = [];
    // for each of the imported modules, recursively visit and
    // invoke them at the appropriate phase and then bind the
    // imported names in this module
    modRecord5933.importedModules.forEach(function (impPath5936) {
        var // load the (possibly cached) module for this import
        importMod5937 = loadImport5517(impPath5936, context5935, modRecord5933.name);
        var // grab all the import statements for that module
        impEntries5938 = modRecord5933.getImportsForModule(impPath5936);
        var uniquePhases5939 = _5347.uniq(impEntries5938.map(function (entry) {
            return entry.forPhase;
        }));
        uniquePhases5939.forEach(function (impPhase5940) {
            context5935 = visit5514(importMod5937.term, importMod5937.record, phase5934 + impPhase5940, context5935);
            if ( // don't need to invoke when importing for phase 0 (runtime)
            impPhase5940 > 0) {
                context5935 = invoke5512(importMod5937.term, importMod5937.record, phase5934 + impPhase5940, context5935);
            }
        });
        bindImportInMod5518(impEntries5938, importMod5937.term, importMod5937.record, context5935, phase5934);
    });
    // load the transformers into the store
    visitTerms5513(modTerm5932.body, modRecord5933, phase5934, context5935);
    return context5935;
}
function mapCommaSep5515(l5941, f5942) {
    return l5941.map(function (stx5943, idx5944) {
        if (idx5944 % 2 !== 0 && (!stx5943.isPunctuator() || stx5943.token.value !== ",")) {
            throwSyntaxError5366("import", "expecting a comma separated list", stx5943);
        } else if (idx5944 % 2 !== 0) {
            return stx5943;
        } else {
            return f5942(stx5943);
        }
    });
}
function filterModuleCommaSep5516(stx5945) {
    return stx5945.filter(function (stx5946, idx5947) {
        if (idx5947 % 2 !== 0 && (!stx5946.isPunctuator() || stx5946.token.value !== ",")) {
            throwSyntaxError5366("import", "expecting a comma separated list", stx5946);
        } else if (idx5947 % 2 !== 0) {
            return false;
        } else {
            return true;
        }
    });
}
function loadImport5517(path5948, context5949, parentPath5950) {
    var modFullPath5951 = resolvePath5508(path5948, parentPath5950);
    if (!availableModules5467.has(modFullPath5951)) {
        var // load it
        modToImport5952 = (function (mod5953) {
            if (mod5953.record.language === "base") {
                return {
                    term: mod5953,
                    record: mod5953.record
                };
            }
            var expanded5954 = expandModule5519(mod5953.term, modFullPath5951, context5949.templateMap, context5949.patternMap, mod5953.record, context5949.compileSuffix, context5949.bindings);
            return {
                term: expanded5954.mod,
                record: expanded5954.context.moduleRecord
            };
        })(loadModule5511(modFullPath5951));
        availableModules5467.set(modFullPath5951, modToImport5952);
        return modToImport5952;
    }
    return availableModules5467.get(modFullPath5951);
}
function bindImportInMod5518(impEntries5955, modTerm5956, modRecord5957, context5958, phase5959) {
    impEntries5955.forEach(function (entry5960) {
        var isBase5961 = modRecord5957.language === "base";
        var inExports5962 = _5347.find(modRecord5957.exportEntries, function (expEntry5965) {
            return unwrapSyntax5369(expEntry5965.exportName) === unwrapSyntax5369(entry5960.importName);
        });
        if (!(inExports5962 || isBase5961)) {
            throwSyntaxError5366("compile", "the imported name `" + unwrapSyntax5369(entry5960.importName) + "` was not exported from the module", entry5960.importName);
        }
        var exportName5963;
        if (inExports5962) {
            exportName5963 = inExports5962.exportName;
        } else {
            assert5364(false, "not implemented yet: missing export name");
        }
        var localName5964 = entry5960.localName;
        context5958.bindings.addForward(localName5964, exportName5963, phase5959 + entry5960.forPhase);
    });
}
// (ModuleTerm, Str, Map, Map, ModuleRecord) -> {
//     context: ExpanderContext,
//     mod: ModuleTerm
// }
function expandModule5519(mod5966, filename5967, templateMap5968, patternMap5969, moduleRecord5970, compileSuffix5971, bindings5972) {
    var // create a new expander context for this module
    context5973 = makeModuleExpanderContext5506(filename5967, templateMap5968, patternMap5969, 0, moduleRecord5970, compileSuffix5971, bindings5972);
    return {
        context: context5973,
        mod: expandTermTreeToFinal5503(mod5966, context5973)
    };
}
function isCompileName5520(stx5974, context5975) {
    if (stx5974.isDelimiter()) {
        return !hasSyntaxTransform5488(stx5974.token.inner, context5975, 0);
    } else {
        return !hasSyntaxTransform5488(stx5974, context5975, 0);
    }
}
function filterCompileNames5521(stx5976, context5977) {
    assert5364(stx5976.isDelimiter(), "must be a delimter");
    var runtimeNames5978 = (function (names5980) {
        return names5980.filter(function (name5981) {
            return isCompileName5520(name5981, context5977);
        });
    })(filterModuleCommaSep5516(stx5976.token.inner));
    var newInner5979 = runtimeNames5978.reduce(function (acc5982, name5983, idx5984, orig5985) {
        acc5982.push(name5983);
        if (orig5985.length - 1 !== idx5984) {
            // don't add trailing comma
            acc5982.push(syn5349.makePunc(",", name5983));
        }
        return acc5982;
    }, []);
    return syn5349.makeDelim("{}", newInner5979, stx5976);
}
function flattenModule5522(modTerm5986, modRecord5987, context5988) {
    var // filter the imports to just the imports and names that are
    // actually available at runtime
    imports5989 = modRecord5987.getRuntimeImportEntries().filter(function (entry5993) {
        return isCompileName5520(entry5993.localName, context5988);
    });
    var exports5990 = modRecord5987.exportEntries.filter(function (entry5994) {
        return isCompileName5520(entry5994.localName, context5988);
    });
    var // filter out all of the import and export statements
    output5991 = modTerm5986.body.reduce(function (acc5995, term5996) {
        if (term5996.isExportNameTerm || term5996.isExportDeclTerm || term5996.isExportDefaultTerm || term5996.isImportTerm || term5996.isImportForPhaseTerm) {
            return acc5995;
        }
        return acc5995.concat(term5996.destruct(context5988, { stripCompileTerm: true }));
    }, []);
    output5991 = (function (output5997) {
        return output5997.map(function (stx5998) {
            var name5999 = resolve5356(stx5998, 0);
            if ( // collect the implicit imports (those imports that
            // must be included because a macro expanded to a reference
            // to an import from some other module)
            context5988.implicitImport.has(name5999)) {
                var implicit6000 = context5988.implicitImport.get(name5999);
                if ( // don't double add the import
                !_5347.find(imports5989, function (imp6001) {
                    return imp6001 === implicit6000;
                })) {
                    imports5989.push(implicit6000);
                }
            }
            return stx5998;
        });
    })(flatten5525(output5991));
    var // flatten everything
    flatImports5992 = imports5989.reduce(function (acc6002, entry6003) {
        entry6003.moduleRequest = entry6003.moduleRequest.clone();
        entry6003.moduleRequest.token.value += context5988.compileSuffix;
        return acc6002.concat(flatten5525(entry6003.toTerm().destruct(context5988).concat(syn5349.makePunc(";", entry6003.moduleRequest))));
    }, []);
    return {
        imports: imports5989.map(function (entry6004) {
            return entry6004.toTerm();
        }),
        body: flatImports5992.concat(output5991)
    };
}
function flattenImports5523(imports6005, mod6006, context6007) {
    return imports6005.reduce(function (acc6008, imp6009) {
        var modFullPath6010 = resolvePath5508(unwrapSyntax5369(imp6009.from), context6007.filename);
        if (availableModules5467.has(modFullPath6010)) {
            var modPair6011 = availableModules5467.get(modFullPath6010);
            if (modPair6011.record.language === "base") {
                return acc6008;
            }
            var flattened6012 = flattenModule5522(modPair6011.term, modPair6011.record, context6007);
            acc6008.push({
                path: modFullPath6010,
                code: flattened6012.body
            });
            acc6008 = acc6008.concat(flattenImports5523(flattened6012.imports, mod6006, context6007));
            return acc6008;
        } else {
            assert5364(false, "module was unexpectedly not available for compilation" + modFullPath6010);
        }
    }, []);
}
function compileModule5524(stx6013, options6014) {
    var fs6015 = require("fs");
    options6014 = options6014 || {};
    var filename6016 = options6014 && typeof options6014.filename !== "undefined" ? fs6015.realpathSync(options6014.filename) : "(anonymous module)";
    maxExpands5466 = Infinity;
    expandCount5465 = 0;
    var mod6017 = createModule5510(filename6016, stx6013);
    var // the template and pattern maps are global for every module
    templateMap6018 = new StringMap5351();
    var patternMap6019 = new StringMap5351();
    availableModules5467 = new StringMap5351();
    var expanded6020 = expandModule5519(mod6017.term, filename6016, templateMap6018, patternMap6019, mod6017.record, options6014.compileSuffix);
    var flattened6021 = flattenModule5522(expanded6020.mod, expanded6020.context.moduleRecord, expanded6020.context);
    var compiledModules6022 = flattenImports5523(flattened6021.imports, expanded6020.mod, expanded6020.context);
    return [{
        path: filename6016,
        code: flattened6021.body
    }].concat(compiledModules6022);
}
function flatten5525(stx6023) {
    return _5347.reduce(stx6023, function (acc6024, stx6025) {
        if (stx6025.isDelimiter()) {
            var openParen6026 = syntaxFromToken5462({
                type: parser5348.Token.Punctuator,
                value: stx6025.token.value[0],
                range: stx6025.token.startRange,
                sm_range: typeof stx6025.token.sm_startRange == "undefined" ? stx6025.token.startRange : stx6025.token.sm_startRange,
                lineNumber: stx6025.token.startLineNumber,
                sm_lineNumber: typeof stx6025.token.sm_startLineNumber == "undefined" ? stx6025.token.startLineNumber : stx6025.token.sm_startLineNumber,
                lineStart: stx6025.token.startLineStart,
                sm_lineStart: typeof stx6025.token.sm_startLineStart == "undefined" ? stx6025.token.startLineStart : stx6025.token.sm_startLineStart
            }, stx6025);
            var closeParen6027 = syntaxFromToken5462({
                type: parser5348.Token.Punctuator,
                value: stx6025.token.value[1],
                range: stx6025.token.endRange,
                sm_range: typeof stx6025.token.sm_endRange == "undefined" ? stx6025.token.endRange : stx6025.token.sm_endRange,
                lineNumber: stx6025.token.endLineNumber,
                sm_lineNumber: typeof stx6025.token.sm_endLineNumber == "undefined" ? stx6025.token.endLineNumber : stx6025.token.sm_endLineNumber,
                lineStart: stx6025.token.endLineStart,
                sm_lineStart: typeof stx6025.token.sm_endLineStart == "undefined" ? stx6025.token.endLineStart : stx6025.token.sm_endLineStart
            }, stx6025);
            if (stx6025.token.leadingComments) {
                openParen6026.token.leadingComments = stx6025.token.leadingComments;
            }
            if (stx6025.token.trailingComments) {
                openParen6026.token.trailingComments = stx6025.token.trailingComments;
            }
            acc6024.push(openParen6026);
            push5468.apply(acc6024, flatten5525(stx6025.token.inner));
            acc6024.push(closeParen6027);
            return acc6024;
        }
        stx6025.token.sm_lineNumber = typeof stx6025.token.sm_lineNumber != "undefined" ? stx6025.token.sm_lineNumber : stx6025.token.lineNumber;
        stx6025.token.sm_lineStart = typeof stx6025.token.sm_lineStart != "undefined" ? stx6025.token.sm_lineStart : stx6025.token.lineStart;
        stx6025.token.sm_range = typeof stx6025.token.sm_range != "undefined" ? stx6025.token.sm_range : stx6025.token.range;
        acc6024.push(stx6025);
        return acc6024;
    }, []);
}
exports.StringMap = StringMap5351;
exports.enforest = enforest5494;
exports.compileModule = compileModule5524;
exports.getCompiletimeValue = getCompiletimeValue5486;
exports.hasCompiletimeValue = hasCompiletimeValue5489;
exports.getSyntaxTransform = getSyntaxTransform5487;
exports.hasSyntaxTransform = hasSyntaxTransform5488;
exports.resolve = resolve5356;
exports.get_expression = get_expression5496;
exports.makeExpanderContext = makeExpanderContext5505;
exports.ExprTerm = ExprTerm5409;
exports.VariableStatementTerm = VariableStatementTerm5434;
exports.tokensToSyntax = syn5349.tokensToSyntax;
exports.syntaxToTokens = syn5349.syntaxToTokens;
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