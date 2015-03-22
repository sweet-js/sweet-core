"use strict";

var codegen5336 = require("escodegen"),
    _5337 = require("underscore"),
    parser5338 = require("./parser"),
    syn5339 = require("./syntax"),
    se5340 = require("./scopedEval"),
    StringMap5341 = require("./data/stringMap"),
    NameMap5342 = require("./data/nameMap"),
    BindingMap5343 = require("./data/bindingMap"),
    SyntaxTransform5344 = require("./data/transforms").SyntaxTransform,
    VarTransform5345 = require("./data/transforms").VarTransform,
    resolve5346 = require("./stx/resolve").resolve,
    marksof5347 = require("./stx/resolve").marksof,
    arraysEqual5348 = require("./stx/resolve").arraysEqual,
    makeImportEntries5349 = require("./mod/importEntry").makeImportEntries,
    ExportEntry5350 = require("./mod/exportEntry").ExportEntry,
    ModuleRecord5351 = require("./mod/moduleRecord").ModuleRecord,
    patternModule5352 = require("./patterns"),
    vm5353 = require("vm"),
    assert5354 = require("assert"),
    termTree5355 = require("./data/termTree");
var throwSyntaxError5356 = syn5339.throwSyntaxError;
var throwSyntaxCaseError5357 = syn5339.throwSyntaxCaseError;
var SyntaxCaseError5358 = syn5339.SyntaxCaseError;
var unwrapSyntax5359 = syn5339.unwrapSyntax;
var makeIdent5360 = syn5339.makeIdent;
var makePunc5361 = syn5339.makePunc;
var makeDelim5362 = syn5339.makeDelim;
var makeValue5363 = syn5339.makeValue;
var adjustLineContext5364 = syn5339.adjustLineContext;
var fresh5365 = syn5339.fresh;
var freshScope5366 = syn5339.freshScope;
var makeMultiToken5367 = syn5339.makeMultiToken;
var Scope5368 = syn5339.Scope;
var TermTree5369 = termTree5355.TermTree,
    EOFTerm5370 = termTree5355.EOFTerm,
    KeywordTerm5371 = termTree5355.KeywordTerm,
    PuncTerm5372 = termTree5355.PuncTerm,
    DelimiterTerm5373 = termTree5355.DelimiterTerm,
    ModuleTimeTerm5374 = termTree5355.ModuleTimeTerm,
    ModuleTerm5375 = termTree5355.ModuleTerm,
    ImportTerm5376 = termTree5355.ImportTerm,
    ImportForPhaseTerm5377 = termTree5355.ImportForPhaseTerm,
    NamedImportTerm5378 = termTree5355.NamedImportTerm,
    DefaultImportTerm5379 = termTree5355.DefaultImportTerm,
    NamespaceImportTerm5380 = termTree5355.NamespaceImportTerm,
    BindingTerm5381 = termTree5355.BindingTerm,
    QualifiedBindingTerm5382 = termTree5355.QualifiedBindingTerm,
    ExportNameTerm5383 = termTree5355.ExportNameTerm,
    ExportDefaultTerm5384 = termTree5355.ExportDefaultTerm,
    ExportDeclTerm5385 = termTree5355.ExportDeclTerm,
    CompileTimeTerm5386 = termTree5355.CompileTimeTerm,
    MacroTerm5387 = termTree5355.MacroTerm,
    ClassDeclarationTerm5388 = termTree5355.ClassDeclarationTerm,
    OperatorDefinitionTerm5389 = termTree5355.OperatorDefinitionTerm,
    ForPhaseTerm5390 = termTree5355.ForPhaseTerm,
    VariableDeclarationTerm5391 = termTree5355.VariableDeclarationTerm,
    StatementTerm5392 = termTree5355.StatementTerm,
    EmptyTerm5393 = termTree5355.EmptyTerm,
    CatchClauseTerm5394 = termTree5355.CatchClauseTerm,
    ForStatementTerm5395 = termTree5355.ForStatementTerm,
    ReturnStatementTerm5396 = termTree5355.ReturnStatementTerm,
    ExprTerm5397 = termTree5355.ExprTerm,
    UnaryOpTerm5398 = termTree5355.UnaryOpTerm,
    PostfixOpTerm5399 = termTree5355.PostfixOpTerm,
    BinOpTerm5400 = termTree5355.BinOpTerm,
    AssignmentExpressionTerm5401 = termTree5355.AssignmentExpressionTerm,
    ConditionalExpressionTerm5402 = termTree5355.ConditionalExpressionTerm,
    NamedFunTerm5403 = termTree5355.NamedFunTerm,
    AnonFunTerm5404 = termTree5355.AnonFunTerm,
    ArrowFunTerm5405 = termTree5355.ArrowFunTerm,
    ObjDotGetTerm5406 = termTree5355.ObjDotGetTerm,
    ObjGetTerm5407 = termTree5355.ObjGetTerm,
    TemplateTerm5408 = termTree5355.TemplateTerm,
    CallTerm5409 = termTree5355.CallTerm,
    QuoteSyntaxTerm5410 = termTree5355.QuoteSyntaxTerm,
    StopQuotedTerm5411 = termTree5355.StopQuotedTerm,
    PrimaryExpressionTerm5412 = termTree5355.PrimaryExpressionTerm,
    ThisExpressionTerm5413 = termTree5355.ThisExpressionTerm,
    LitTerm5414 = termTree5355.LitTerm,
    BlockTerm5415 = termTree5355.BlockTerm,
    ArrayLiteralTerm5416 = termTree5355.ArrayLiteralTerm,
    IdTerm5417 = termTree5355.IdTerm,
    PartialTerm5418 = termTree5355.PartialTerm,
    PartialOperationTerm5419 = termTree5355.PartialOperationTerm,
    PartialExpressionTerm5420 = termTree5355.PartialExpressionTerm,
    BindingStatementTerm5421 = termTree5355.BindingStatementTerm,
    VariableStatementTerm5422 = termTree5355.VariableStatementTerm,
    LetStatementTerm5423 = termTree5355.LetStatementTerm,
    ConstStatementTerm5424 = termTree5355.ConstStatementTerm,
    ParenExpressionTerm5425 = termTree5355.ParenExpressionTerm;
var scopedEval5449 = se5340.scopedEval;
var syntaxFromToken5450 = syn5339.syntaxFromToken;
var joinSyntax5451 = syn5339.joinSyntax;
var builtinMode5452 = false;
var expandCount5453 = 0;
var maxExpands5454;
var availableModules5455;
var push5456 = Array.prototype.push;
function getParamIdentifiers5457(argSyntax5507) {
    if (argSyntax5507.isDelimiter()) {
        return _5337.filter(argSyntax5507.token.inner, function (stx5508) {
            return stx5508.token.value !== ",";
        });
    } else if (argSyntax5507.isIdentifier()) {
        return [argSyntax5507];
    } else {
        assert5354(false, "expecting a delimiter or a single identifier for function parameters");
    }
}
function stxIsUnaryOp5458(stx5509) {
    var staticOperators5510 = ["+", "-", "~", "!", "delete", "void", "typeof", "yield", "new", "++", "--"];
    return _5337.contains(staticOperators5510, unwrapSyntax5359(stx5509));
}
function stxIsBinOp5459(stx5511) {
    var staticOperators5512 = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "<<", ">>", ">>>"];
    return _5337.contains(staticOperators5512, unwrapSyntax5359(stx5511));
}
function getUnaryOpPrec5460(op5513) {
    var operatorPrecedence5514 = {
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
    return operatorPrecedence5514[op5513];
}
function getBinaryOpPrec5461(op5515) {
    var operatorPrecedence5516 = {
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
    return operatorPrecedence5516[op5515];
}
function getBinaryOpAssoc5462(op5517) {
    var operatorAssoc5518 = {
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
    return operatorAssoc5518[op5517];
}
function stxIsAssignOp5463(stx5519) {
    var staticOperators5520 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
    return _5337.contains(staticOperators5520, unwrapSyntax5359(stx5519));
}
function enforestImportClause5464(stx5521) {
    if (stx5521[0] && stx5521[0].isDelimiter()) {
        return {
            result: NamedImportTerm5378.create(stx5521[0]),
            rest: stx5521.slice(1)
        };
    } else if (stx5521[0] && stx5521[0].isPunctuator() && unwrapSyntax5359(stx5521[0]) === "*" && stx5521[1] && unwrapSyntax5359(stx5521[1]) === "as" && stx5521[2]) {
        return {
            result: NamespaceImportTerm5380.create(stx5521[0], stx5521[1], stx5521[2]),
            rest: stx5521.slice(3)
        };
    } else {
        return {
            result: DefaultImportTerm5379.create(stx5521[0]),
            rest: stx5521.slice(1)
        };
    }
}
function enforestImportClauseList5465(stx5522) {
    var res5523 = [];
    var clause5524 = enforestImportClause5464(stx5522);
    var rest5525 = clause5524.rest;
    res5523.push(clause5524.result);
    if (rest5525[0] && rest5525[0].isPunctuator() && unwrapSyntax5359(rest5525[0]) === ",") {
        res5523.push(rest5525[0]);
        clause5524 = enforestImportClause5464(rest5525.slice(1));
        res5523.push(clause5524.result);
        rest5525 = clause5524.rest;
    }
    return {
        result: res5523,
        rest: rest5525
    };
}
function enforestImport5466(head5526, rest5527) {
    assert5354(unwrapSyntax5359(head5526) === "import", "only call for imports");
    var clause5528 = enforestImportClauseList5465(rest5527);
    rest5527 = clause5528.rest;
    if (rest5527[0] && unwrapSyntax5359(rest5527[0]) === "from" && rest5527[1] && rest5527[1].isStringLiteral() && rest5527[2] && unwrapSyntax5359(rest5527[2]) === "for" && rest5527[3] && unwrapSyntax5359(rest5527[3]) === "phase" && rest5527[4] && rest5527[4].isNumericLiteral()) {
        var importRest5529;
        if (rest5527[5] && rest5527[5].isPunctuator() && rest5527[5].token.value === ";") {
            importRest5529 = rest5527.slice(6);
        } else {
            importRest5529 = rest5527.slice(5);
        }
        return {
            result: ImportForPhaseTerm5377.create(head5526, clause5528.result, rest5527[0], rest5527[1], rest5527[2], rest5527[3], rest5527[4]),
            rest: importRest5529
        };
    } else if (rest5527[0] && unwrapSyntax5359(rest5527[0]) === "from" && rest5527[1] && rest5527[1].isStringLiteral()) {
        var importRest5529;
        if (rest5527[2] && rest5527[2].isPunctuator() && rest5527[2].token.value === ";") {
            importRest5529 = rest5527.slice(3);
        } else {
            importRest5529 = rest5527.slice(2);
        }
        return {
            result: ImportTerm5376.create(head5526, clause5528.result, rest5527[0], rest5527[1]),
            rest: importRest5529
        };
    } else {
        throwSyntaxError5356("enforest", "unrecognized import syntax", rest5527);
    }
}
function enforestVarStatement5467(stx5531, context5532, varStx5533) {
    var decls5534 = [];
    var rest5535 = stx5531;
    var rhs5536;
    if (!rest5535.length) {
        throwSyntaxError5356("enforest", "Unexpected end of input", varStx5533);
    }
    if (expandCount5453 >= maxExpands5454) {
        return null;
    }
    while (rest5535.length) {
        if (rest5535[0].isIdentifier()) {
            if (rest5535[1] && rest5535[1].isPunctuator() && rest5535[1].token.value === "=") {
                rhs5536 = get_expression5482(rest5535.slice(2), context5532);
                if (rhs5536.result == null) {
                    throwSyntaxError5356("enforest", "Unexpected token", rhs5536.rest[0]);
                }
                if (rhs5536.rest[0] && rhs5536.rest[0].isPunctuator() && rhs5536.rest[0].token.value === ",") {
                    decls5534.push(VariableDeclarationTerm5391.create(rest5535[0], rest5535[1], rhs5536.result, rhs5536.rest[0]));
                    rest5535 = rhs5536.rest.slice(1);
                    continue;
                } else {
                    decls5534.push(VariableDeclarationTerm5391.create(rest5535[0], rest5535[1], rhs5536.result, null));
                    rest5535 = rhs5536.rest;
                    break;
                }
            } else if (rest5535[1] && rest5535[1].isPunctuator() && rest5535[1].token.value === ",") {
                decls5534.push(VariableDeclarationTerm5391.create(rest5535[0], null, null, rest5535[1]));
                rest5535 = rest5535.slice(2);
            } else {
                decls5534.push(VariableDeclarationTerm5391.create(rest5535[0], null, null, null));
                rest5535 = rest5535.slice(1);
                break;
            }
        } else {
            throwSyntaxError5356("enforest", "Unexpected token", rest5535[0]);
        }
    }
    return {
        result: decls5534,
        rest: rest5535
    };
}
function enforestAssignment5468(stx5537, context5538, left5539, prevStx5540, prevTerms5541) {
    var op5542 = stx5537[0];
    var rightStx5543 = stx5537.slice(1);
    var opTerm5544 = PuncTerm5372.create(stx5537[0]);
    var opPrevStx5545 = tagWithTerm5483(opTerm5544, [stx5537[0]]).concat(tagWithTerm5483(left5539, left5539.destruct(context5538).reverse()), prevStx5540);
    var opPrevTerms5546 = [opTerm5544, left5539].concat(prevTerms5541);
    var opRes5547 = enforest5480(rightStx5543, context5538, opPrevStx5545, opPrevTerms5546);
    if (opRes5547.result) {
        if ( // Lookbehind was matched, so it may not even be a binop anymore.
        opRes5547.prevTerms.length < opPrevTerms5546.length) {
            return opRes5547;
        }
        var right5548 = opRes5547.result;
        if ( // only a binop if the right is a real expression
        // so 2+2++ will only match 2+2
        right5548.isExprTerm) {
            var term5549 = AssignmentExpressionTerm5401.create(left5539, op5542, right5548);
            return {
                result: term5549,
                rest: opRes5547.rest,
                prevStx: prevStx5540,
                prevTerms: prevTerms5541
            };
        }
    } else {
        return opRes5547;
    }
}
function enforestParenExpression5469(parens5550, context5551) {
    var argRes5552,
        enforestedArgs5553 = [],
        commas5554 = [];
    var innerTokens5555 = parens5550.token.inner;
    while (innerTokens5555.length > 0) {
        argRes5552 = enforest5480(innerTokens5555, context5551);
        if (!argRes5552.result || !argRes5552.result.isExprTerm) {
            return null;
        }
        enforestedArgs5553.push(argRes5552.result);
        innerTokens5555 = argRes5552.rest;
        if (innerTokens5555[0] && innerTokens5555[0].token.value === ",") {
            // record the comma for later
            commas5554.push(innerTokens5555[0]);
            // but dump it for the next loop turn
            innerTokens5555 = innerTokens5555.slice(1);
        } else {
            // either there are no more tokens or
            // they aren't a comma, either way we
            // are done with the loop
            break;
        }
    }
    return innerTokens5555.length ? null : ParenExpressionTerm5425.create(enforestedArgs5553, parens5550, commas5554);
}
function CompiletimeValue5470(trans5556, module5557, phase5558) {
    this.trans = trans5556;
    this.module = module5557;
    this.phase = phase5558;
}
function RuntimeValue5471(trans5559, module5560, phase5561) {
    this.trans = trans5559;
    this.module = module5560;
    this.phase = phase5561;
}
function getCompiletimeValue5472(stx5562, context5563, phase5564) {
    var store5565,
        env5566 = context5563.env.get(stx5562, phase5564);
    if (env5566 !== null) {
        return env5566.trans;
    } else {
        store5565 = context5563.store.get(stx5562, phase5564);
        return store5565 !== null ? store5565.trans : null;
    }
}
function getSyntaxTransform5473(stx5567, context5568, phase5569) {
    var t5570 = getCompiletimeValue5472(stx5567, context5568, phase5569);
    if (t5570 && t5570 instanceof VarTransform5345) {
        return null;
    }
    return t5570;
}
function getVarTransform5474(stx5571, context5572, phase5573) {
    var t5574 = getCompiletimeValue5472(stx5571, context5572, phase5573);
    if (t5574 && t5574 instanceof VarTransform5345) {
        return t5574;
    }
    return null;
}
function hasSyntaxTransform5475(stx5575, context5576, phase5577) {
    return getSyntaxTransform5473(stx5575, context5576, phase5577) !== null;
}
function hasVarTransform5476(stx5578, context5579, phase5580) {
    return getVarTransform5474(stx5578, context5579, phase5580) !== null;
}
function hasCompiletimeValue5477(stx5581, context5582, phase5583) {
    return context5582.env.has(stx5581, phase5583) || context5582.store.has(stx5581, phase5583);
}
function expandMacro5478(stx5584, context5585, opCtx5586, opType5587, macroObj5588) {
    var // pull the macro transformer out the environment
    head5589 = stx5584[0];
    var rest5590 = stx5584.slice(1);
    macroObj5588 = macroObj5588 || getSyntaxTransform5473(stx5584, context5585, context5585.phase);
    var stxArg5591 = rest5590.slice(macroObj5588.fullName.length - 1);
    var transformer5592;
    if (opType5587 != null) {
        assert5354(opType5587 === "binary" || opType5587 === "unary", "operator type should be either unary or binary: " + opType5587);
        transformer5592 = macroObj5588[opType5587].fn;
    } else {
        transformer5592 = macroObj5588.fn;
    }
    assert5354(typeof transformer5592 === "function", "Macro transformer not bound for: " + head5589.token.value);
    var transformerContext5593 = makeExpanderContext5491(_5337.defaults({ mark: freshScope5366(context5585.bindings) }, context5585));
    // apply the transformer
    var rt5594;
    try {
        rt5594 = transformer5592([head5589].concat(stxArg5591), transformerContext5593, opCtx5586.prevStx, opCtx5586.prevTerms);
    } catch (e5595) {
        if (e5595 instanceof SyntaxCaseError5358) {
            var // add a nicer error for syntax case
            nameStr5596 = macroObj5588.fullName.map(function (stx5597) {
                return stx5597.token.value;
            }).join("");
            if (opType5587 != null) {
                var argumentString5598 = "`" + stxArg5591.slice(0, 5).map(function (stx5599) {
                    return stx5599.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5356("operator", "Operator `" + nameStr5596 + "` could not be matched with " + argumentString5598, head5589);
            } else {
                var argumentString5598 = "`" + stxArg5591.slice(0, 5).map(function (stx5601) {
                    return stx5601.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5356("macro", "Macro `" + nameStr5596 + "` could not be matched with " + argumentString5598, head5589);
            }
        } else {
            // just rethrow it
            throw e5595;
        }
    }
    if (!builtinMode5452 && !macroObj5588.builtin) {
        expandCount5453++;
    }
    if (!Array.isArray(rt5594.result)) {
        throwSyntaxError5356("enforest", "Macro must return a syntax array", stx5584[0]);
    }
    if (rt5594.result.length > 0) {
        var adjustedResult5602 = adjustLineContext5364(rt5594.result, head5589);
        if (stx5584[0].token.leadingComments) {
            if (adjustedResult5602[0].token.leadingComments) {
                adjustedResult5602[0].token.leadingComments = adjustedResult5602[0].token.leadingComments.concat(head5589.token.leadingComments);
            } else {
                adjustedResult5602[0].token.leadingComments = head5589.token.leadingComments;
            }
        }
        rt5594.result = adjustedResult5602;
    }
    return rt5594;
}
function comparePrec5479(left5603, right5604, assoc5605) {
    if (assoc5605 === "left") {
        return left5603 <= right5604;
    }
    return left5603 < right5604;
}
function enforest5480(toks5606, context5607, prevStx5608, prevTerms5609) {
    assert5354(toks5606.length > 0, "enforest assumes there are tokens to work with");
    prevStx5608 = prevStx5608 || [];
    prevTerms5609 = prevTerms5609 || [];
    if (expandCount5453 >= maxExpands5454) {
        return {
            result: null,
            rest: toks5606
        };
    }
    function step5610(head5611, rest5612, opCtx5613) {
        var innerTokens5614;
        assert5354(Array.isArray(rest5612), "result must at least be an empty array");
        if (head5611.isTermTree) {
            var isCustomOp5616 = false;
            var uopMacroObj5617;
            var uopSyntax5618;
            if (head5611.isPuncTerm || head5611.isKeywordTerm || head5611.isIdTerm) {
                if (head5611.isPuncTerm) {
                    uopSyntax5618 = head5611.punc;
                } else if (head5611.isKeywordTerm) {
                    uopSyntax5618 = head5611.keyword;
                } else if (head5611.isIdTerm) {
                    uopSyntax5618 = head5611.id;
                }
                uopMacroObj5617 = getSyntaxTransform5473([uopSyntax5618].concat(rest5612), context5607, context5607.phase);
                isCustomOp5616 = uopMacroObj5617 && uopMacroObj5617.isOp;
            }
            // look up once (we want to check multiple properties on bopMacroObj
            // without repeatedly calling getValueInEnv)
            var bopMacroObj5619;
            if (rest5612[0] && rest5612[1]) {
                bopMacroObj5619 = getSyntaxTransform5473(rest5612, context5607, context5607.phase);
            }
            if ( // unary operator
            isCustomOp5616 && uopMacroObj5617.unary || uopSyntax5618 && stxIsUnaryOp5458(uopSyntax5618)) {
                var uopPrec5620;
                if (isCustomOp5616 && uopMacroObj5617.unary) {
                    uopPrec5620 = uopMacroObj5617.unary.prec;
                } else {
                    uopPrec5620 = getUnaryOpPrec5460(unwrapSyntax5359(uopSyntax5618));
                }
                var opRest5621 = rest5612;
                var uopMacroName5622;
                if (uopMacroObj5617) {
                    uopMacroName5622 = [uopSyntax5618].concat(rest5612.slice(0, uopMacroObj5617.fullName.length - 1));
                    opRest5621 = rest5612.slice(uopMacroObj5617.fullName.length - 1);
                }
                var leftLeft5623 = opCtx5613.prevTerms[0] && opCtx5613.prevTerms[0].isPartialTerm ? opCtx5613.prevTerms[0] : null;
                var unopTerm5624 = PartialOperationTerm5419.create(head5611, leftLeft5623);
                var unopPrevStx5625 = tagWithTerm5483(unopTerm5624, head5611.destruct(context5607).reverse()).concat(opCtx5613.prevStx);
                var unopPrevTerms5626 = [unopTerm5624].concat(opCtx5613.prevTerms);
                var unopOpCtx5627 = _5337.extend({}, opCtx5613, {
                    combine: function combine(t5628) {
                        if (t5628.isExprTerm) {
                            if (isCustomOp5616 && uopMacroObj5617.unary) {
                                var rt5629 = expandMacro5478(uopMacroName5622.concat(t5628.destruct(context5607)), context5607, opCtx5613, "unary");
                                var newt5630 = get_expression5482(rt5629.result, context5607);
                                assert5354(newt5630.rest.length === 0, "should never have left over syntax");
                                return opCtx5613.combine(newt5630.result);
                            }
                            return opCtx5613.combine(UnaryOpTerm5398.create(uopSyntax5618, t5628));
                        } else {
                            // not actually an expression so don't create
                            // a UnaryOp term just return with the punctuator
                            return opCtx5613.combine(head5611);
                        }
                    },
                    prec: uopPrec5620,
                    prevStx: unopPrevStx5625,
                    prevTerms: unopPrevTerms5626,
                    op: unopTerm5624
                });
                return step5610(opRest5621[0], opRest5621.slice(1), unopOpCtx5627);
            } else if (head5611.isExprTerm && (rest5612[0] && rest5612[1] && (stxIsBinOp5459(rest5612[0]) && !bopMacroObj5619 || bopMacroObj5619 && bopMacroObj5619.isOp && bopMacroObj5619.binary))) {
                var opRes5631;
                var op5632 = rest5612[0];
                var left5633 = head5611;
                var rightStx5634 = rest5612.slice(1);
                var leftLeft5623 = opCtx5613.prevTerms[0] && opCtx5613.prevTerms[0].isPartialTerm ? opCtx5613.prevTerms[0] : null;
                var leftTerm5636 = PartialExpressionTerm5420.create(head5611.destruct(context5607), leftLeft5623, function () {
                    return step5610(head5611, [], opCtx5613);
                });
                var opTerm5637 = PartialOperationTerm5419.create(op5632, leftTerm5636);
                var opPrevStx5638 = tagWithTerm5483(opTerm5637, [rest5612[0]]).concat(tagWithTerm5483(leftTerm5636, head5611.destruct(context5607)).reverse(), opCtx5613.prevStx);
                var opPrevTerms5639 = [opTerm5637, leftTerm5636].concat(opCtx5613.prevTerms);
                var isCustomOp5616 = bopMacroObj5619 && bopMacroObj5619.isOp && bopMacroObj5619.binary;
                var bopPrec5641;
                var bopAssoc5642;
                if (isCustomOp5616 && bopMacroObj5619.binary) {
                    bopPrec5641 = bopMacroObj5619.binary.prec;
                    bopAssoc5642 = bopMacroObj5619.binary.assoc;
                } else {
                    bopPrec5641 = getBinaryOpPrec5461(unwrapSyntax5359(op5632));
                    bopAssoc5642 = getBinaryOpAssoc5462(unwrapSyntax5359(op5632));
                }
                assert5354(bopPrec5641 !== undefined, "expecting a precedence for operator: " + op5632);
                var newStack5643;
                if (comparePrec5479(bopPrec5641, opCtx5613.prec, bopAssoc5642)) {
                    var bopCtx5647 = opCtx5613;
                    var combResult5615 = opCtx5613.combine(head5611);
                    if (opCtx5613.stack.length > 0) {
                        return step5610(combResult5615.term, rest5612, opCtx5613.stack[0]);
                    }
                    left5633 = combResult5615.term;
                    newStack5643 = opCtx5613.stack;
                    opPrevStx5638 = combResult5615.prevStx;
                    opPrevTerms5639 = combResult5615.prevTerms;
                } else {
                    newStack5643 = [opCtx5613].concat(opCtx5613.stack);
                }
                assert5354(opCtx5613.combine !== undefined, "expecting a combine function");
                var opRightStx5644 = rightStx5634;
                var bopMacroName5645;
                if (isCustomOp5616) {
                    bopMacroName5645 = rest5612.slice(0, bopMacroObj5619.fullName.length);
                    opRightStx5644 = rightStx5634.slice(bopMacroObj5619.fullName.length - 1);
                }
                var bopOpCtx5646 = _5337.extend({}, opCtx5613, {
                    combine: function combine(right5649) {
                        if (right5649.isExprTerm) {
                            if (isCustomOp5616 && bopMacroObj5619.binary) {
                                var leftStx5650 = left5633.destruct(context5607);
                                var rightStx5651 = right5649.destruct(context5607);
                                var rt5652 = expandMacro5478(bopMacroName5645.concat(syn5339.makeDelim("()", leftStx5650, leftStx5650[0]), syn5339.makeDelim("()", rightStx5651, rightStx5651[0])), context5607, opCtx5613, "binary");
                                var newt5653 = get_expression5482(rt5652.result, context5607);
                                assert5354(newt5653.rest.length === 0, "should never have left over syntax");
                                return {
                                    term: newt5653.result,
                                    prevStx: opPrevStx5638,
                                    prevTerms: opPrevTerms5639
                                };
                            }
                            return {
                                term: BinOpTerm5400.create(left5633, op5632, right5649),
                                prevStx: opPrevStx5638,
                                prevTerms: opPrevTerms5639
                            };
                        } else {
                            return {
                                term: head5611,
                                prevStx: opPrevStx5638,
                                prevTerms: opPrevTerms5639
                            };
                        }
                    },
                    prec: bopPrec5641,
                    op: opTerm5637,
                    stack: newStack5643,
                    prevStx: opPrevStx5638,
                    prevTerms: opPrevTerms5639
                });
                return step5610(opRightStx5644[0], opRightStx5644.slice(1), bopOpCtx5646);
            } else if (head5611.isExprTerm && (rest5612[0] && rest5612[0].isDelimiter() && rest5612[0].token.value === "()")) {
                var parenRes5654 = enforestParenExpression5469(rest5612[0], context5607);
                if (parenRes5654) {
                    return step5610(CallTerm5409.create(head5611, parenRes5654), rest5612.slice(1), opCtx5613);
                }
            } else if (head5611.isExprTerm && (rest5612[0] && resolve5346(rest5612[0], context5607.phase) === "?")) {
                var question5655 = rest5612[0];
                var condRes5656 = enforest5480(rest5612.slice(1), context5607);
                if (condRes5656.result) {
                    var truExpr5657 = condRes5656.result;
                    var condRight5658 = condRes5656.rest;
                    if (truExpr5657.isExprTerm && condRight5658[0] && resolve5346(condRight5658[0], context5607.phase) === ":") {
                        var colon5659 = condRight5658[0];
                        var flsRes5660 = enforest5480(condRight5658.slice(1), context5607);
                        var flsExpr5661 = flsRes5660.result;
                        if (flsExpr5661.isExprTerm) {
                            if ( // operators are combined before the ternary
                            opCtx5613.prec >= 4) {
                                var // ternary is like a operator with prec 4
                                headResult5662 = opCtx5613.combine(head5611);
                                var condTerm5663 = ConditionalExpressionTerm5402.create(headResult5662.term, question5655, truExpr5657, colon5659, flsExpr5661);
                                if (opCtx5613.stack.length > 0) {
                                    return step5610(condTerm5663, flsRes5660.rest, opCtx5613.stack[0]);
                                } else {
                                    return {
                                        result: condTerm5663,
                                        rest: flsRes5660.rest,
                                        prevStx: headResult5662.prevStx,
                                        prevTerms: headResult5662.prevTerms
                                    };
                                }
                            } else {
                                var condTerm5663 = ConditionalExpressionTerm5402.create(head5611, question5655, truExpr5657, colon5659, flsExpr5661);
                                return step5610(condTerm5663, flsRes5660.rest, opCtx5613);
                            }
                        }
                    }
                }
            } else if (head5611.isDelimiterTerm && head5611.delim.token.value === "()" && rest5612[0] && rest5612[0].isPunctuator() && resolve5346(rest5612[0], context5607.phase) === "=>") {
                var arrowRes5665 = enforest5480(rest5612.slice(1), context5607);
                if (arrowRes5665.result && arrowRes5665.result.isExprTerm) {
                    return step5610(ArrowFunTerm5405.create(head5611.delim, rest5612[0], arrowRes5665.result.destruct(context5607)), arrowRes5665.rest, opCtx5613);
                } else {
                    throwSyntaxError5356("enforest", "Body of arrow function must be an expression", rest5612.slice(1));
                }
            } else if (head5611.isIdTerm && rest5612[0] && rest5612[0].isPunctuator() && resolve5346(rest5612[0], context5607.phase) === "=>") {
                var res5666 = enforest5480(rest5612.slice(1), context5607);
                if (res5666.result && res5666.result.isExprTerm) {
                    return step5610(ArrowFunTerm5405.create(head5611.id, rest5612[0], res5666.result.destruct(context5607)), res5666.rest, opCtx5613);
                } else {
                    throwSyntaxError5356("enforest", "Body of arrow function must be an expression", rest5612.slice(1));
                }
            } else if (head5611.isDelimiterTerm && head5611.delim.token.value === "()") {
                if ( // empty parens are acceptable but enforest
                // doesn't accept empty arrays so short
                // circuit here
                head5611.delim.token.inner.length === 0) {
                    return step5610(ParenExpressionTerm5425.create([EmptyTerm5393.create()], head5611.delim, []), rest5612, opCtx5613);
                } else {
                    var parenRes5654 = enforestParenExpression5469(head5611.delim, context5607);
                    if (parenRes5654) {
                        return step5610(parenRes5654, rest5612, opCtx5613);
                    }
                }
            } else if (head5611.isExprTerm && ((head5611.isIdTerm || head5611.isObjGetTerm || head5611.isObjDotGetTerm || head5611.isThisExpressionTerm) && rest5612[0] && rest5612[1] && !bopMacroObj5619 && stxIsAssignOp5463(rest5612[0]))) {
                var opRes5631 = enforestAssignment5468(rest5612, context5607, head5611, prevStx5608, prevTerms5609);
                if (opRes5631 && opRes5631.result) {
                    return step5610(opRes5631.result, opRes5631.rest, _5337.extend({}, opCtx5613, {
                        prevStx: opRes5631.prevStx,
                        prevTerms: opRes5631.prevTerms
                    }));
                }
            } else if (head5611.isExprTerm && (rest5612[0] && (unwrapSyntax5359(rest5612[0]) === "++" || unwrapSyntax5359(rest5612[0]) === "--"))) {
                if ( // Check if the operator is a macro first.
                hasSyntaxTransform5475(rest5612[0], context5607, context5607.phase)) {
                    var headStx5669 = tagWithTerm5483(head5611, head5611.destruct(context5607).reverse());
                    var opPrevStx5638 = headStx5669.concat(prevStx5608);
                    var opPrevTerms5639 = [head5611].concat(prevTerms5609);
                    var opRes5631 = enforest5480(rest5612, context5607, opPrevStx5638, opPrevTerms5639);
                    if (opRes5631.prevTerms.length < opPrevTerms5639.length) {
                        return opRes5631;
                    } else if (opRes5631.result) {
                        return step5610(head5611, opRes5631.result.destruct(context5607).concat(opRes5631.rest), opCtx5613);
                    }
                }
                return step5610(PostfixOpTerm5399.create(head5611, rest5612[0]), rest5612.slice(1), opCtx5613);
            } else if (head5611.isExprTerm && (rest5612[0] && rest5612[0].token.value === "[]")) {
                return step5610(ObjGetTerm5407.create(head5611, DelimiterTerm5373.create(rest5612[0])), rest5612.slice(1), opCtx5613);
            } else if (head5611.isExprTerm && (rest5612[0] && unwrapSyntax5359(rest5612[0]) === "." && !hasSyntaxTransform5475(rest5612[0], context5607, context5607.phase) && rest5612[1] && (rest5612[1].isIdentifier() || rest5612[1].isKeyword()))) {
                if ( // Check if the identifier is a macro first.
                hasSyntaxTransform5475(rest5612[1], context5607, context5607.phase)) {
                    var headStx5669 = tagWithTerm5483(head5611, head5611.destruct(context5607).reverse());
                    var dotTerm5674 = PuncTerm5372.create(rest5612[0]);
                    var dotTerms5675 = [dotTerm5674].concat(head5611, prevTerms5609);
                    var dotStx5676 = tagWithTerm5483(dotTerm5674, [rest5612[0]]).concat(headStx5669, prevStx5608);
                    var dotRes5677 = enforest5480(rest5612.slice(1), context5607, dotStx5676, dotTerms5675);
                    if (dotRes5677.prevTerms.length < dotTerms5675.length) {
                        return dotRes5677;
                    } else if (dotRes5677.result) {
                        return step5610(head5611, [rest5612[0]].concat(dotRes5677.result.destruct(context5607), dotRes5677.rest), opCtx5613);
                    }
                }
                return step5610(ObjDotGetTerm5406.create(head5611, rest5612[0], rest5612[1]), rest5612.slice(2), opCtx5613);
            } else if (head5611.isDelimiterTerm && head5611.delim.token.value === "[]") {
                return step5610(ArrayLiteralTerm5416.create(head5611), rest5612, opCtx5613);
            } else if (head5611.isDelimiterTerm && head5611.delim.token.value === "{}") {
                return step5610(BlockTerm5415.create(head5611), rest5612, opCtx5613);
            } else if (head5611.isIdTerm && unwrapSyntax5359(head5611.id) === "#quoteSyntax" && rest5612[0] && rest5612[0].token.value === "{}") {
                return step5610(QuoteSyntaxTerm5410.create(rest5612[0]), rest5612.slice(1), opCtx5613);
            } else if (head5611.isKeywordTerm && unwrapSyntax5359(head5611.keyword) === "return") {
                if (rest5612[0] && rest5612[0].token.lineNumber === head5611.keyword.token.lineNumber) {
                    var returnPrevStx5678 = tagWithTerm5483(head5611, head5611.destruct(context5607)).concat(opCtx5613.prevStx);
                    var returnPrevTerms5679 = [head5611].concat(opCtx5613.prevTerms);
                    var returnExpr5680 = enforest5480(rest5612, context5607, returnPrevStx5678, returnPrevTerms5679);
                    if (returnExpr5680.prevTerms.length < opCtx5613.prevTerms.length) {
                        return returnExpr5680;
                    }
                    if (returnExpr5680.result.isExprTerm) {
                        return step5610(ReturnStatementTerm5396.create(head5611, returnExpr5680.result), returnExpr5680.rest, opCtx5613);
                    }
                } else {
                    return step5610(ReturnStatementTerm5396.create(head5611, EmptyTerm5393.create()), rest5612, opCtx5613);
                }
            } else if (head5611.isKeywordTerm && unwrapSyntax5359(head5611.keyword) === "let") {
                var normalizedName5681;
                if (rest5612[0] && rest5612[0].isDelimiter() && rest5612[0].token.value === "()") {
                    normalizedName5681 = rest5612[0];
                } else {
                    normalizedName5681 = syn5339.makeDelim("()", [rest5612[0]], rest5612[0]);
                }
                var lsRes5682 = enforestVarStatement5467(rest5612, context5607, head5611.keyword);
                if (lsRes5682 && lsRes5682.result) {
                    return step5610(LetStatementTerm5423.create(head5611, lsRes5682.result), lsRes5682.rest, opCtx5613);
                }
            } else if (head5611.isKeywordTerm && unwrapSyntax5359(head5611.keyword) === "var" && rest5612[0]) {
                var vsRes5683 = enforestVarStatement5467(rest5612, context5607, head5611.keyword);
                if (vsRes5683 && vsRes5683.result) {
                    return step5610(VariableStatementTerm5422.create(head5611, vsRes5683.result), vsRes5683.rest, opCtx5613);
                }
            } else if (head5611.isKeywordTerm && unwrapSyntax5359(head5611.keyword) === "const" && rest5612[0]) {
                var csRes5684 = enforestVarStatement5467(rest5612, context5607, head5611.keyword);
                if (csRes5684 && csRes5684.result) {
                    return step5610(ConstStatementTerm5424.create(head5611, csRes5684.result), csRes5684.rest, opCtx5613);
                }
            } else if (head5611.isKeywordTerm && unwrapSyntax5359(head5611.keyword) === "for" && rest5612[0] && rest5612[0].token.value === "()") {
                return step5610(ForStatementTerm5395.create(head5611.keyword, rest5612[0]), rest5612.slice(1), opCtx5613);
            }
        } else {
            assert5354(head5611 && head5611.token, "assuming head is a syntax object");
            var macroObj5685 = expandCount5453 < maxExpands5454 && getSyntaxTransform5473([head5611].concat(rest5612), context5607, context5607.phase);
            if (head5611 && context5607.stopMap.has(resolve5346(head5611, context5607.phase))) {
                return step5610(StopQuotedTerm5411.create(head5611, rest5612[0]), rest5612.slice(1), opCtx5613);
            } else if (macroObj5685 && typeof macroObj5685.fn === "function" && !macroObj5685.isOp) {
                var rt5686 = expandMacro5478([head5611].concat(rest5612), context5607, opCtx5613, null, macroObj5685);
                var newOpCtx5687 = opCtx5613;
                if (rt5686.prevTerms && rt5686.prevTerms.length < opCtx5613.prevTerms.length) {
                    newOpCtx5687 = rewindOpCtx5481(opCtx5613, rt5686);
                }
                if (rt5686.result.length > 0) {
                    return step5610(rt5686.result[0], rt5686.result.slice(1).concat(rt5686.rest), newOpCtx5687);
                } else {
                    return step5610(EmptyTerm5393.create(), rt5686.rest, newOpCtx5687);
                }
            } else if (head5611.isIdentifier() && unwrapSyntax5359(head5611) === "stxrec" && resolve5346(head5611, context5607.phase) === "stxrec") {
                var normalizedName5681;
                if (rest5612[0] && rest5612[0].isDelimiter() && rest5612[0].token.value === "()") {
                    normalizedName5681 = rest5612[0];
                } else {
                    normalizedName5681 = syn5339.makeDelim("()", [rest5612[0]], rest5612[0]);
                }
                if (rest5612[1] && rest5612[1].isDelimiter()) {
                    return step5610(MacroTerm5387.create(normalizedName5681, rest5612[1].token.inner), rest5612.slice(2), opCtx5613);
                } else {
                    throwSyntaxError5356("enforest", "Macro declaration must include body", rest5612[1]);
                }
            } else if (head5611.isIdentifier() && head5611.token.value === "unaryop" && rest5612[0] && rest5612[0].isDelimiter() && rest5612[0].token.value === "()" && rest5612[1] && rest5612[1].isNumericLiteral() && rest5612[2] && rest5612[2].isDelimiter() && rest5612[2] && rest5612[2].token.value === "{}") {
                var trans5689 = enforest5480(rest5612[2].token.inner, context5607);
                return step5610(OperatorDefinitionTerm5389.create(syn5339.makeValue("unary", head5611), rest5612[0], rest5612[1], null, trans5689.result.body), rest5612.slice(3), opCtx5613);
            } else if (head5611.isIdentifier() && head5611.token.value === "binaryop" && rest5612[0] && rest5612[0].isDelimiter() && rest5612[0].token.value === "()" && rest5612[1] && rest5612[1].isNumericLiteral() && rest5612[2] && rest5612[2].isIdentifier() && rest5612[3] && rest5612[3].isDelimiter() && rest5612[3] && rest5612[3].token.value === "{}") {
                var trans5689 = enforest5480(rest5612[3].token.inner, context5607);
                return step5610(OperatorDefinitionTerm5389.create(syn5339.makeValue("binary", head5611), rest5612[0], rest5612[1], rest5612[2], trans5689.result.body), rest5612.slice(4), opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "function" && rest5612[0] && rest5612[0].isIdentifier() && rest5612[1] && rest5612[1].isDelimiter() && rest5612[1].token.value === "()" && rest5612[2] && rest5612[2].isDelimiter() && rest5612[2].token.value === "{}") {
                rest5612[1].token.inner = rest5612[1].token.inner;
                rest5612[2].token.inner = rest5612[2].token.inner;
                return step5610(NamedFunTerm5403.create(head5611, null, rest5612[0], rest5612[1], rest5612[2]), rest5612.slice(3), opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "function" && rest5612[0] && rest5612[0].isPunctuator() && rest5612[0].token.value === "*" && rest5612[1] && rest5612[1].isIdentifier() && rest5612[2] && rest5612[2].isDelimiter() && rest5612[2].token.value === "()" && rest5612[3] && rest5612[3].isDelimiter() && rest5612[3].token.value === "{}") {
                return step5610(NamedFunTerm5403.create(head5611, rest5612[0], rest5612[1], rest5612[2], rest5612[3]), rest5612.slice(4), opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "function" && rest5612[0] && rest5612[0].isDelimiter() && rest5612[0].token.value === "()" && rest5612[1] && rest5612[1].isDelimiter() && rest5612[1].token.value === "{}") {
                return step5610(AnonFunTerm5404.create(head5611, null, rest5612[0], rest5612[1]), rest5612.slice(2), opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "function" && rest5612[0] && rest5612[0].isPunctuator() && rest5612[0].token.value === "*" && rest5612[1] && rest5612[1].isDelimiter() && rest5612[1].token.value === "()" && rest5612[2] && rest5612[2].isDelimiter && rest5612[2].token.value === "{}") {
                rest5612[1].token.inner = rest5612[1].token.inner;
                rest5612[2].token.inner = rest5612[2].token.inner;
                return step5610(AnonFunTerm5404.create(head5611, rest5612[0], rest5612[1], rest5612[2]), rest5612.slice(3), opCtx5613);
            } else if ((head5611.isDelimiter() && head5611.token.value === "()" || head5611.isIdentifier()) && rest5612[0] && rest5612[0].isPunctuator() && resolve5346(rest5612[0], context5607.phase) === "=>" && rest5612[1] && rest5612[1].isDelimiter() && rest5612[1].token.value === "{}") {
                return step5610(ArrowFunTerm5405.create(head5611, rest5612[0], rest5612[1]), rest5612.slice(2), opCtx5613);
            } else if (head5611.isIdentifier() && head5611.token.value === "forPhase" && rest5612[0] && rest5612[0].isNumericLiteral() && rest5612[1] && rest5612[1].isDelimiter()) {
                return step5610(ForPhaseTerm5390.create(rest5612[0], rest5612[1].token.inner), rest5612.slice(2), opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "catch" && rest5612[0] && rest5612[0].isDelimiter() && rest5612[0].token.value === "()" && rest5612[1] && rest5612[1].isDelimiter() && rest5612[1].token.value === "{}") {
                rest5612[0].token.inner = rest5612[0].token.inner;
                rest5612[1].token.inner = rest5612[1].token.inner;
                return step5610(CatchClauseTerm5394.create(head5611, rest5612[0], rest5612[1]), rest5612.slice(2), opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "this") {
                return step5610(ThisExpressionTerm5413.create(head5611), rest5612, opCtx5613);
            } else if (head5611.isNumericLiteral() || head5611.isStringLiteral() || head5611.isBooleanLiteral() || head5611.isRegularExpression() || head5611.isNullLiteral()) {
                return step5610(LitTerm5414.create(head5611), rest5612, opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "import") {
                var imp5691 = enforestImport5466(head5611, rest5612);
                return step5610(imp5691.result, imp5691.rest, opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "export" && rest5612[0] && rest5612[0].isDelimiter()) {
                return step5610(ExportNameTerm5383.create(head5611, rest5612[0]), rest5612.slice(1), opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "export" && rest5612[0] && rest5612[0].isKeyword() && unwrapSyntax5359(rest5612[0]) === "default" && rest5612[1]) {
                var res5666 = enforest5480(rest5612.slice(1), context5607);
                return step5610(ExportDefaultTerm5384.create(head5611, rest5612[0], res5666.result), res5666.rest, opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "export" && rest5612[0]) {
                var res5666 = enforest5480(rest5612, context5607);
                return step5610(ExportDeclTerm5385.create(head5611, res5666.result), res5666.rest, opCtx5613);
            } else if (head5611.isIdentifier()) {
                return step5610(IdTerm5417.create(head5611), rest5612, opCtx5613);
            } else if (head5611.isPunctuator()) {
                return step5610(PuncTerm5372.create(head5611), rest5612, opCtx5613);
            } else if (head5611.isKeyword() && unwrapSyntax5359(head5611) === "with") {
                throwSyntaxError5356("enforest", "with is not supported in sweet.js", head5611);
            } else if (head5611.isKeyword()) {
                return step5610(KeywordTerm5371.create(head5611), rest5612, opCtx5613);
            } else if (head5611.isDelimiter()) {
                return step5610(DelimiterTerm5373.create(head5611), rest5612, opCtx5613);
            } else if (head5611.isTemplate()) {
                return step5610(TemplateTerm5408.create(head5611), rest5612, opCtx5613);
            } else if (head5611.isEOF()) {
                assert5354(rest5612.length === 0, "nothing should be after an EOF");
                return step5610(EOFTerm5370.create(head5611), [], opCtx5613);
            } else {
                // todo: are we missing cases?
                assert5354(false, "not implemented");
            }
        }
        if ( // Potentially an infix macro
        // This should only be invoked on runtime syntax terms
        !head5611.isMacroTerm && !head5611.isAnonMacroTerm && !head5611.isOperatorDefinitionTerm && rest5612.length && hasSyntaxTransform5475(rest5612, context5607, context5607.phase) && getSyntaxTransform5473(rest5612, context5607, context5607.phase).isOp === false) {
            var infLeftTerm5694 = opCtx5613.prevTerms[0] && opCtx5613.prevTerms[0].isPartialTerm ? opCtx5613.prevTerms[0] : null;
            var infTerm5695 = PartialExpressionTerm5420.create(head5611.destruct(context5607), infLeftTerm5694, function () {
                return step5610(head5611, [], opCtx5613);
            });
            var infPrevStx5696 = tagWithTerm5483(infTerm5695, head5611.destruct(context5607)).reverse().concat(opCtx5613.prevStx);
            var infPrevTerms5697 = [infTerm5695].concat(opCtx5613.prevTerms);
            var infRes5698 = expandMacro5478(rest5612, context5607, {
                prevStx: infPrevStx5696,
                prevTerms: infPrevTerms5697
            });
            if (infRes5698.prevTerms && infRes5698.prevTerms.length < infPrevTerms5697.length) {
                var infOpCtx5699 = rewindOpCtx5481(opCtx5613, infRes5698);
                return step5610(infRes5698.result[0], infRes5698.result.slice(1).concat(infRes5698.rest), infOpCtx5699);
            } else {
                return step5610(head5611, infRes5698.result.concat(infRes5698.rest), opCtx5613);
            }
        }
        var // done with current step so combine and continue on
        combResult5615 = opCtx5613.combine(head5611);
        if (opCtx5613.stack.length === 0) {
            return {
                result: combResult5615.term,
                rest: rest5612,
                prevStx: combResult5615.prevStx,
                prevTerms: combResult5615.prevTerms
            };
        } else {
            return step5610(combResult5615.term, rest5612, opCtx5613.stack[0]);
        }
    }
    return step5610(toks5606[0], toks5606.slice(1), {
        combine: function combine(t5700) {
            return {
                term: t5700,
                prevStx: prevStx5608,
                prevTerms: prevTerms5609
            };
        },
        prec: 0,
        stack: [],
        op: null,
        prevStx: prevStx5608,
        prevTerms: prevTerms5609
    });
}
function rewindOpCtx5481(opCtx5701, res5702) {
    if ( // If we've consumed all pending operators, we can just start over.
    // It's important that we always thread the new prevStx and prevTerms
    // through, otherwise the old ones will still persist.
    !res5702.prevTerms.length || !res5702.prevTerms[0].isPartialTerm) {
        return _5337.extend({}, opCtx5701, {
            combine: function combine(t5706) {
                return {
                    term: t5706,
                    prevStx: res5702.prevStx,
                    prevTerms: res5702.prevTerms
                };
            },
            prec: 0,
            op: null,
            stack: [],
            prevStx: res5702.prevStx,
            prevTerms: res5702.prevTerms
        });
    }
    // To rewind, we need to find the first (previous) pending operator. It
    // acts as a marker in the opCtx to let us know how far we need to go
    // back.
    var op5703 = null;
    for (var i5704 = 0; i5704 < res5702.prevTerms.length; i5704++) {
        if (!res5702.prevTerms[i5704].isPartialTerm) {
            break;
        }
        if (res5702.prevTerms[i5704].isPartialOperationTerm) {
            op5703 = res5702.prevTerms[i5704];
            break;
        }
    }
    if ( // If the op matches the current opCtx, we don't need to rewind
    // anything, but we still need to persist the prevStx and prevTerms.
    opCtx5701.op === op5703) {
        return _5337.extend({}, opCtx5701, {
            prevStx: res5702.prevStx,
            prevTerms: res5702.prevTerms
        });
    }
    for (var i5704 = 0; i5704 < opCtx5701.stack.length; i5704++) {
        if (opCtx5701.stack[i5704].op === op5703) {
            return _5337.extend({}, opCtx5701.stack[i5704], {
                prevStx: res5702.prevStx,
                prevTerms: res5702.prevTerms
            });
        }
    }
    assert5354(false, "Rewind failed.");
}
function get_expression5482(stx5707, context5708) {
    if (stx5707[0].term) {
        for (var termLen5710 = 1; termLen5710 < stx5707.length; termLen5710++) {
            if (stx5707[termLen5710].term !== stx5707[0].term) {
                break;
            }
        }
        if ( // Guard the termLen because we can have a multi-token term that
        // we don't want to split. TODO: is there something we can do to
        // get around this safely?
        stx5707[0].term.isPartialExpressionTerm && termLen5710 === stx5707[0].term.stx.length) {
            var expr5711 = stx5707[0].term.combine().result;
            for (var i5712 = 1, term5713 = stx5707[0].term; i5712 < stx5707.length; i5712++) {
                if (stx5707[i5712].term !== term5713) {
                    if (term5713 && term5713.isPartialTerm) {
                        term5713 = term5713.left;
                        i5712--;
                    } else {
                        break;
                    }
                }
            }
            return {
                result: expr5711,
                rest: stx5707.slice(i5712)
            };
        } else if (stx5707[0].term.isExprTerm) {
            return {
                result: stx5707[0].term,
                rest: stx5707.slice(termLen5710)
            };
        } else {
            return {
                result: null,
                rest: stx5707
            };
        }
    }
    var res5709 = enforest5480(stx5707, context5708);
    if (!res5709.result || !res5709.result.isExprTerm) {
        return {
            result: null,
            rest: stx5707
        };
    }
    return res5709;
}
function tagWithTerm5483(term5714, stx5715) {
    return stx5715.map(function (s5716) {
        s5716 = s5716.clone();
        s5716.term = term5714;
        return s5716;
    });
}
function applyMarkToPatternEnv5484(newMark5717, env5718) {
    function dfs5719(match5720) {
        if (match5720.level === 0) {
            // replace the match property with the marked syntax
            match5720.match = _5337.map(match5720.match, function (stx5721) {
                return stx5721.mark(newMark5717);
            });
        } else {
            _5337.each(match5720.match, function (match5722) {
                dfs5719(match5722);
            });
        }
    }
    _5337.keys(env5718).forEach(function (key5723) {
        dfs5719(env5718[key5723]);
    });
}
function markIn5485(arr5724, mark5725) {
    return arr5724.map(function (stx5726) {
        return stx5726.mark(mark5725);
    });
}
function markDefOut5486(arr5727, mark5728, def5729) {
    return arr5727.map(function (stx5730) {
        return stx5730.mark(mark5728);
    });
}
function loadMacroDef5487(body5731, context5732, phase5733) {
    var expanded5734 = body5731[0].destruct(context5732, { stripCompileTerm: true });
    var stub5735 = parser5338.read("()");
    stub5735[0].token.inner = expanded5734;
    var flattend5736 = flatten5506(stub5735);
    var bodyCode5737 = codegen5336.generate(parser5338.parse(flattend5736, { phase: phase5733 }));
    var localCtx5738;
    var macroGlobal5739 = {
        makeValue: syn5339.makeValue,
        makeRegex: syn5339.makeRegex,
        makeIdent: syn5339.makeIdent,
        makeKeyword: syn5339.makeKeyword,
        makePunc: syn5339.makePunc,
        makeDelim: syn5339.makeDelim,
        localExpand: function localExpand(stx5741, stop5742) {
            stop5742 = stop5742 || [];
            var markedStx5743 = markIn5485(stx5741, localCtx5738.mark);
            var stopMap5744 = new StringMap5341();
            stop5742.forEach(function (stop5748) {
                stopMap5744.set(resolve5346(stop5748, localCtx5738.phase), true);
            });
            var localExpandCtx5745 = makeExpanderContext5491(_5337.extend({}, localCtx5738, { stopMap: stopMap5744 }));
            var terms5746 = expand5490(markedStx5743, localExpandCtx5745);
            var newStx5747 = terms5746.reduce(function (acc5749, term5750) {
                acc5749.push.apply(acc5749, term5750.destruct(localCtx5738, { stripCompileTerm: true }));
                return acc5749;
            }, []);
            return markDefOut5486(newStx5747, localCtx5738.mark, localCtx5738.defscope);
        },
        filename: context5732.filename,
        getExpr: function getExpr(stx5751) {
            if (stx5751.length === 0) {
                return {
                    success: false,
                    result: [],
                    rest: []
                };
            }
            var markedStx5752 = markIn5485(stx5751, localCtx5738.mark);
            var r5753 = get_expression5482(markedStx5752, localCtx5738);
            return {
                success: r5753.result !== null,
                result: r5753.result === null ? [] : markDefOut5486(r5753.result.destruct(localCtx5738, { stripCompileTerm: true }), localCtx5738.mark, localCtx5738.defscope),
                rest: markDefOut5486(r5753.rest, localCtx5738.mark, localCtx5738.defscope)
            };
        },
        getIdent: function getIdent(stx5754) {
            if (stx5754[0] && stx5754[0].isIdentifier()) {
                return {
                    success: true,
                    result: [stx5754[0]],
                    rest: stx5754.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5754
            };
        },
        getLit: function getLit(stx5755) {
            if (stx5755[0] && patternModule5352.typeIsLiteral(stx5755[0].token.type)) {
                return {
                    success: true,
                    result: [stx5755[0]],
                    rest: stx5755.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5755
            };
        },
        unwrapSyntax: syn5339.unwrapSyntax,
        throwSyntaxError: throwSyntaxError5356,
        throwSyntaxCaseError: throwSyntaxCaseError5357,
        prettyPrint: syn5339.prettyPrint,
        parser: parser5338,
        __fresh: fresh5365,
        __freshScope: freshScope5366,
        __scope: context5732.scope,
        __bindings: context5732.bindings,
        _: _5337,
        patternModule: patternModule5352,
        getPattern: function getPattern(id5756) {
            return context5732.patternMap.get(id5756);
        },
        getPatternMap: function getPatternMap() {
            return context5732.patternMap;
        },
        getTemplate: function getTemplate(id5757) {
            assert5354(context5732.templateMap.has(id5757), "missing template");
            return syn5339.cloneSyntaxArray(context5732.templateMap.get(id5757));
        },
        getTemplateMap: function getTemplateMap() {
            // the template map is global across all context during compilation
            return context5732.templateMap;
        },
        applyMarkToPatternEnv: applyMarkToPatternEnv5484,
        mergeMatches: function mergeMatches(newMatch5758, oldMatch5759) {
            newMatch5758.patternEnv = _5337.extend({}, oldMatch5759.patternEnv, newMatch5758.patternEnv);
            return newMatch5758;
        },
        console: console
    };
    context5732.env.keysStr().forEach(function (key5760) {
        var val5761 = context5732.env.getStr(key5760);
        if ( // load the runtime values into the global object
        val5761 && val5761 instanceof RuntimeValue5471) {
            macroGlobal5739[key5760] = val5761.trans.value;
        }
    });
    context5732.store.keysStr().forEach(function (key5762) {
        var val5763 = context5732.store.getStr(key5762);
        if ( // load the runtime values into the global object
        val5763 && val5763 instanceof RuntimeValue5471) {
            macroGlobal5739[key5762] = val5763.trans.value;
        }
    });
    var macroFn5740 = scopedEval5449(bodyCode5737, macroGlobal5739);
    return function (stx5764, context5765, prevStx5766, prevTerms5767) {
        localCtx5738 = context5765;
        return macroFn5740(stx5764, context5765, prevStx5766, prevTerms5767);
    };
}
function expandToTermTree5488(stx5768, context5769) {
    assert5354(context5769, "expander context is required");
    var f5770, head5771, prevStx5772, restStx5773, prevTerms5774, macroDefinition5775;
    var rest5776 = stx5768;
    while (rest5776.length > 0) {
        assert5354(rest5776[0].token, "expecting a syntax object");
        f5770 = enforest5480(rest5776, context5769, prevStx5772, prevTerms5774);
        // head :: TermTree
        head5771 = f5770.result;
        // rest :: [Syntax]
        rest5776 = f5770.rest;
        if (!head5771) {
            // no head means the expansions stopped prematurely (for stepping)
            restStx5773 = rest5776;
            break;
        }
        var destructed5777 = tagWithTerm5483(head5771, f5770.result.destruct(context5769));
        prevTerms5774 = [head5771].concat(f5770.prevTerms);
        prevStx5772 = destructed5777.reverse().concat(f5770.prevStx);
        if (head5771.isImportTerm) {
            var // record the import in the module record for easier access
            entries5778 = context5769.moduleRecord.addImport(head5771);
            var // load up the (possibly cached) import module
            importMod5779 = loadImport5500(unwrapSyntax5359(head5771.from), context5769, context5769.moduleRecord.name);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5769 = visit5499(importMod5779.term, importMod5779.record, context5769.phase, context5769);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5501(entries5778, importMod5779.term, importMod5779.record, context5769, context5769.phase);
        }
        if (head5771.isImportForPhaseTerm) {
            var // record the import in the module record for easier access
            entries5778 = context5769.moduleRecord.addImport(head5771);
            var // load up the (possibly cached) import module
            importMod5779 = loadImport5500(unwrapSyntax5359(head5771.from), context5769, context5769.moduleRecord.name);
            // invoking an imported module loads the runtime values
            // into the environment for this phase
            context5769 = invoke5497(importMod5779.term, importMod5779.record, context5769.phase + head5771.phase.token.value, context5769);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5769 = visit5499(importMod5779.term, importMod5779.record, context5769.phase + head5771.phase.token.value, context5769);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5501(entries5778, importMod5779.term, importMod5779.record, context5769, context5769.phase);
        }
        if (head5771.isForPhaseTerm) {
            var phaseShiftedContext5782 = makeExpanderContext5491(_5337.defaults({ phase: context5769.phase + head5771.phase.token.value }, context5769));
            head5771.body = expand5490(head5771.body, phaseShiftedContext5782);
        }
        if ((head5771.isExportDefaultTerm && head5771.decl.isMacroTerm || head5771.isMacroTerm) && expandCount5453 < maxExpands5454) {
            var macroDecl5783 = head5771.isExportDefaultTerm ? head5771.decl : head5771;
            if (!( // raw function primitive form
            macroDecl5783.body[0] && macroDecl5783.body[0].isKeyword() && macroDecl5783.body[0].token.value === "function")) {
                throwSyntaxError5356("load macro", "Primitive macro form must contain a function for the macro body", macroDecl5783.body);
            }
            // expand the body
            macroDecl5783.body = expand5490(macroDecl5783.body, makeExpanderContext5491(_5337.defaults({ phase: context5769.phase + 1 }, context5769)));
            //  and load the macro definition into the environment
            macroDefinition5775 = loadMacroDef5487(macroDecl5783.body, context5769, context5769.phase + 1);
            var fullName5784 = macroDecl5783.name.token.inner;
            var multiTokName5785 = makeMultiToken5367(macroDecl5783.name);
            multiTokName5785 = multiTokName5785.delScope(context5769.useScope);
            context5769.bindings.add(multiTokName5785, fresh5365(), context5769.phase);
            context5769.env.set(multiTokName5785, context5769.phase, new CompiletimeValue5470(new SyntaxTransform5344(macroDefinition5775, false, builtinMode5452, fullName5784), context5769.moduleRecord.name, context5769.phase));
        }
        if (head5771.isOperatorDefinitionTerm) {
            if (!( // raw function primitive form
            head5771.body[0] && head5771.body[0].isKeyword() && head5771.body[0].token.value === "function")) {
                throwSyntaxError5356("load macro", "Primitive macro form must contain a function for the macro body", head5771.body);
            }
            // expand the body
            head5771.body = expand5490(head5771.body, makeExpanderContext5491(_5337.defaults({ phase: context5769.phase + 1 }, context5769)));
            var //  and load the macro definition into the environment
            opDefinition5786 = loadMacroDef5487(head5771.body, context5769, context5769.phase + 1);
            var fullName5784 = head5771.name.token.inner;
            var multiTokName5785 = makeMultiToken5367(head5771.name);
            multiTokName5785 = multiTokName5785.delScope(context5769.useScope);
            context5769.bindings.add(multiTokName5785, fresh5365(), context5769.phase);
            var opObj5789 = getSyntaxTransform5473(multiTokName5785, context5769, context5769.phase);
            if (!opObj5789) {
                opObj5789 = {
                    isOp: true,
                    builtin: builtinMode5452,
                    fullName: fullName5784
                };
            }
            assert5354(unwrapSyntax5359(head5771.type) === "binary" || unwrapSyntax5359(head5771.type) === "unary", "operator must either be binary or unary");
            opObj5789[unwrapSyntax5359(head5771.type)] = {
                fn: opDefinition5786,
                prec: head5771.prec.token.value,
                assoc: head5771.assoc ? head5771.assoc.token.value : null
            };
            context5769.env.set(multiTokName5785, context5769.phase, new CompiletimeValue5470(opObj5789, context5769.moduleRecord.name, context5769.phase));
        }
        if (head5771.isNamedFunTerm) {
            // addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            head5771.name = head5771.name.delScope(context5769.useScope);
            context5769.bindings.add(head5771.name, fresh5365(), context5769.phase);
            context5769.env.set(head5771.name, context5769.phase, new CompiletimeValue5470(new VarTransform5345(head5771.name), context5769.moduleRecord.name, context5769.phase));
        }
        if (head5771.isVariableStatementTerm || head5771.isLetStatementTerm || head5771.isConstStatementTerm) {
            head5771.decls = head5771.decls.map(function (decl5790) {
                decl5790.ident = decl5790.ident.delScope(context5769.useScope);
                context5769.bindings.add(decl5790.ident, fresh5365(), context5769.phase);
                context5769.env.set(decl5790.ident, context5769.phase, new CompiletimeValue5470(new VarTransform5345(decl5790.ident), context5769.moduleRecord.name, context5769.name));
                return decl5790;
            });
        }
        if (head5771.isBlockTerm && head5771.body.isDelimiterTerm) {
            head5771.body.delim.token.inner.forEach(function (term5791) {
                if (term5791.isVariableStatementTerm) {
                    term5791.decls = term5791.decls.map(function (decl5792) {
                        decl5792.ident = decl5792.ident.delScope(context5769.useScope);
                        context5769.bindings.add(decl5792.ident, fresh5365(), context5769.phase);
                        return decl5792;
                    });
                }
            });
        }
        if (head5771.isDelimiterTerm) {
            head5771.delim.token.inner.forEach(function (term5793) {
                if (term5793.isVariableStatementTerm) {
                    term5793.decls = term5793.decls.map(function (decl5794) {
                        decl5794.ident = decl5794.ident.delScope(context5769.useScope);
                        context5769.bindings.add(decl5794.ident, fresh5365(), context5769.phase);
                        return decl5794;
                    });
                }
            });
        }
        if (head5771.isForStatementTerm) {
            var forCond5795 = head5771.cond.token.inner;
            if (forCond5795[0] && resolve5346(forCond5795[0], context5769.phase) === "let" && forCond5795[1] && forCond5795[1].isIdentifier()) {
                var letNew5796 = fresh5365();
                var letId5797 = forCond5795[1];
                forCond5795 = forCond5795.map(function (stx5798) {
                    return stx5798.rename(letId5797, letNew5796);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head5771.cond.token.inner = expand5490([forCond5795[0]], context5769).concat(expand5490(forCond5795.slice(1), context5769));
                if ( // nice and easy case: `for (...) { ... }`
                rest5776[0] && rest5776[0].token.value === "{}") {
                    rest5776[0] = rest5776[0].rename(letId5797, letNew5796);
                } else {
                    var // need to deal with things like `for (...) if (...) log(...)`
                    bodyEnf5799 = enforest5480(rest5776, context5769);
                    var bodyDestructed5800 = bodyEnf5799.result.destruct(context5769);
                    var renamedBodyTerm5801 = bodyEnf5799.result.rename(letId5797, letNew5796);
                    tagWithTerm5483(renamedBodyTerm5801, bodyDestructed5800);
                    rest5776 = bodyEnf5799.rest;
                    prevStx5772 = bodyDestructed5800.reverse().concat(prevStx5772);
                    prevTerms5774 = [renamedBodyTerm5801].concat(prevTerms5774);
                }
            } else {
                head5771.cond.token.inner = expand5490(head5771.cond.token.inner, context5769);
            }
        }
    }
    return {
        // prevTerms are stored in reverse for the purposes of infix
        // lookbehind matching, so we need to re-reverse them.
        terms: prevTerms5774 ? prevTerms5774.reverse() : [],
        restStx: restStx5773,
        context: context5769
    };
}
function expandTermTreeToFinal5489(term5802, context5803) {
    assert5354(context5803 && context5803.env, "environment map is required");
    if (term5802.isArrayLiteralTerm) {
        term5802.array.delim.token.inner = expand5490(term5802.array.delim.token.inner, context5803);
        return term5802;
    } else if (term5802.isBlockTerm) {
        term5802.body.delim.token.inner = expand5490(term5802.body.delim.token.inner, context5803);
        return term5802;
    } else if (term5802.isParenExpressionTerm) {
        term5802.args = _5337.map(term5802.args, function (arg5804) {
            return expandTermTreeToFinal5489(arg5804, context5803);
        });
        return term5802;
    } else if (term5802.isCallTerm) {
        term5802.fun = expandTermTreeToFinal5489(term5802.fun, context5803);
        term5802.args = expandTermTreeToFinal5489(term5802.args, context5803);
        return term5802;
    } else if (term5802.isReturnStatementTerm) {
        term5802.expr = expandTermTreeToFinal5489(term5802.expr, context5803);
        return term5802;
    } else if (term5802.isUnaryOpTerm) {
        term5802.expr = expandTermTreeToFinal5489(term5802.expr, context5803);
        return term5802;
    } else if (term5802.isBinOpTerm || term5802.isAssignmentExpressionTerm) {
        term5802.left = expandTermTreeToFinal5489(term5802.left, context5803);
        term5802.right = expandTermTreeToFinal5489(term5802.right, context5803);
        return term5802;
    } else if (term5802.isObjGetTerm) {
        term5802.left = expandTermTreeToFinal5489(term5802.left, context5803);
        term5802.right.delim.token.inner = expand5490(term5802.right.delim.token.inner, context5803);
        return term5802;
    } else if (term5802.isObjDotGetTerm) {
        term5802.left = expandTermTreeToFinal5489(term5802.left, context5803);
        term5802.right = expandTermTreeToFinal5489(term5802.right, context5803);
        return term5802;
    } else if (term5802.isConditionalExpressionTerm) {
        term5802.cond = expandTermTreeToFinal5489(term5802.cond, context5803);
        term5802.tru = expandTermTreeToFinal5489(term5802.tru, context5803);
        term5802.fls = expandTermTreeToFinal5489(term5802.fls, context5803);
        return term5802;
    } else if (term5802.isVariableDeclarationTerm) {
        if (term5802.init) {
            term5802.init = expandTermTreeToFinal5489(term5802.init, context5803);
        }
        return term5802;
    } else if (term5802.isVariableStatementTerm) {
        term5802.decls = _5337.map(term5802.decls, function (decl5805) {
            return expandTermTreeToFinal5489(decl5805, context5803);
        });
        return term5802;
    } else if (term5802.isDelimiterTerm) {
        // expand inside the delimiter and then continue on
        term5802.delim.token.inner = expand5490(term5802.delim.token.inner, context5803);
        return term5802;
    } else if (term5802.isIdTerm) {
        var varTrans5806 = getCompiletimeValue5472(term5802.id, context5803, context5803.phase);
        if (varTrans5806 instanceof VarTransform5345) {
            term5802.id = syntaxFromToken5450(term5802.id.token, varTrans5806.id);
        }
        return term5802;
    } else if (term5802.isNamedFunTerm || term5802.isAnonFunTerm || term5802.isCatchClauseTerm || term5802.isArrowFunTerm || term5802.isModuleTerm) {
        var newDef5807;
        var paramSingleIdent5810;
        var params5811;
        var bodies5812;
        var paramNames5813;
        var bodyContext5814;
        var renamedBody5815;
        var expandedResult5816;
        var bodyTerms5817;
        var renamedParams5818;
        var flatArgs5819;
        var puncCtx5825;
        var expandedArgs5820;

        var _ret = (function () {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            newDef5807 = [];

            var scope5808 = freshScope5366(context5803.bindings);
            var useScope5809 = freshScope5366(context5803.bindings);
            paramSingleIdent5810 = term5802.params && term5802.params.isIdentifier();

            if (term5802.params && term5802.params.isDelimiter()) {
                params5811 = term5802.params;
            } else if (paramSingleIdent5810) {
                params5811 = term5802.params;
            } else {
                params5811 = syn5339.makeDelim("()", [], null);
            }

            if (Array.isArray(term5802.body)) {
                bodies5812 = syn5339.makeDelim("{}", term5802.body, null);
            } else {
                bodies5812 = term5802.body;
            }
            paramNames5813 = _5337.map(getParamIdentifiers5457(params5811), function (param5821) {
                var paramNew5822 = param5821.mark(scope5808);
                context5803.bindings.add(paramNew5822, fresh5365(), context5803.phase);
                context5803.env.set(paramNew5822, context5803.phase, new CompiletimeValue5470(new VarTransform5345(paramNew5822), context5803.moduleRecord.name, context5803.phase));
                return {
                    originalParam: param5821,
                    renamedParam: paramNew5822
                };
            });
            bodyContext5814 = makeExpanderContext5491(_5337.defaults({
                scope: scope5808,
                useScope: useScope5809,
                defscope: newDef5807,
                // paramscope is used to filter out var redeclarations
                paramscope: paramNames5813.map(function (p5823) {
                    return p5823.renamedParam;
                })
            }, context5803));
            renamedBody5815 = bodies5812.mark(scope5808);
            expandedResult5816 = expandToTermTree5488(renamedBody5815.token.inner, bodyContext5814);
            bodyTerms5817 = expandedResult5816.terms;

            if (expandedResult5816.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody5815.token.inner = expandedResult5816.terms.concat(expandedResult5816.restStx);
                if (Array.isArray(term5802.body)) {
                    term5802.body = renamedBody5815.token.inner;
                } else {
                    term5802.body = renamedBody5815;
                }
                return {
                    v: term5802
                };
            }
            renamedParams5818 = _5337.map(paramNames5813, function (p5824) {
                return p5824.renamedParam;
            });

            if (paramSingleIdent5810) {
                flatArgs5819 = renamedParams5818[0];
            } else {
                puncCtx5825 = term5802.params || null;

                flatArgs5819 = syn5339.makeDelim("()", joinSyntax5451(renamedParams5818, syn5339.makePunc(",", puncCtx5825)), puncCtx5825);
            }
            expandedArgs5820 = expand5490([flatArgs5819], bodyContext5814);

            assert5354(expandedArgs5820.length === 1, "should only get back one result");
            if ( // stitch up the function with all the renamings
            term5802.params) {
                term5802.params = expandedArgs5820[0];
            }
            bodyTerms5817 = _5337.map(bodyTerms5817, function (bodyTerm5826) {
                if ( // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                bodyTerm5826.isBlockTerm) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal5827 = expandTermTreeToFinal5489(bodyTerm5826, expandedResult5816.context);
                    return blockFinal5827;
                } else {
                    var termWithCtx5828 = bodyTerm5826;
                    // finish expansion
                    return expandTermTreeToFinal5489(termWithCtx5828, expandedResult5816.context);
                }
            });
            if (term5802.isModuleTerm) {
                bodyTerms5817.forEach(function (bodyTerm5829) {
                    if (bodyTerm5829.isExportNameTerm || bodyTerm5829.isExportDeclTerm || bodyTerm5829.isExportDefaultTerm) {
                        context5803.moduleRecord.addExport(bodyTerm5829);
                    }
                });
            }
            renamedBody5815.token.inner = bodyTerms5817;
            if (Array.isArray(term5802.body)) {
                term5802.body = renamedBody5815.token.inner;
            } else {
                term5802.body = renamedBody5815;
            }
            // and continue expand the rest
            return {
                v: term5802
            };
        })();

        if (typeof _ret === "object") return _ret.v;
    }
    // the term is fine as is
    return term5802;
}
function expand5490(stx5830, context5831) {
    assert5354(context5831, "must provide an expander context");
    var trees5832 = expandToTermTree5488(stx5830, context5831);
    var terms5833 = _5337.map(trees5832.terms, function (term5834) {
        return expandTermTreeToFinal5489(term5834, trees5832.context);
    });
    if (trees5832.restStx) {
        terms5833.push.apply(terms5833, trees5832.restStx);
    }
    return terms5833;
}
function makeExpanderContext5491(o5835) {
    o5835 = o5835 || {};
    var env5836 = o5835.env || new NameMap5342();
    var store5837 = o5835.store || new NameMap5342();
    var bindings5838 = o5835.bindings || new BindingMap5343();
    return Object.create(Object.prototype, {
        filename: {
            value: o5835.filename,
            writable: false,
            enumerable: true,
            configurable: false
        },
        compileSuffix: {
            value: o5835.compileSuffix || ".jsc",
            writable: false,
            enumerable: true,
            configurable: false
        },
        env: {
            value: env5836,
            writable: false,
            enumerable: true,
            configurable: false
        },
        store: {
            value: store5837,
            writable: false,
            enumerable: true,
            configurable: false
        },
        defscope: {
            value: o5835.defscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        paramscope: {
            value: o5835.paramscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        templateMap: {
            value: o5835.templateMap || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        patternMap: {
            value: o5835.patternMap || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        mark: {
            value: o5835.mark,
            writable: false,
            enumerable: true,
            configurable: false
        },
        bindings: {
            value: bindings5838,
            writable: false,
            enumerable: true,
            configurable: false
        },
        scope: {
            value: o5835.scope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        useScope: {
            value: o5835.useScope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        phase: {
            value: o5835.phase || 0,
            writable: false,
            enumerable: true,
            configurable: false
        },
        implicitImport: {
            value: o5835.implicitImport || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        stopMap: {
            value: o5835.stopMap || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        moduleRecord: {
            value: o5835.moduleRecord || {},
            writable: false,
            enumerable: true,
            configurable: false
        }
    });
}
function makeModuleExpanderContext5492(filename5839, templateMap5840, patternMap5841, phase5842, moduleRecord5843, compileSuffix5844, bindings5845) {
    return makeExpanderContext5491({
        filename: filename5839,
        templateMap: templateMap5840,
        patternMap: patternMap5841,
        phase: phase5842,
        moduleRecord: moduleRecord5843,
        compileSuffix: compileSuffix5844,
        bindings: bindings5845
    });
}
function resolvePath5493(name5846, parent5847) {
    var path5848 = require("path");
    var resolveSync5849 = require("resolve/lib/sync");
    var root5850 = path5848.dirname(parent5847);
    var fs5851 = require("fs");
    if (name5846[0] === ".") {
        name5846 = path5848.resolve(root5850, name5846);
    }
    return resolveSync5849(name5846, {
        basedir: root5850,
        extensions: [".js", ".sjs"]
    });
}
function defaultImportStx5494(importPath5852, ctx5853) {
    var rtNames5854 = ["stxnonrec", "stxrec", "macroclass", "operator"];
    var ctNames5855 = ["quoteSyntax", "syntax", "#", "syntaxCase", "stxnonrec", "stxrec", "withSyntax", "letstx", "macroclass", "operator"];
    var importNames5856 = rtNames5854.map(function (name5860) {
        return syn5339.makeIdent(name5860, ctx5853);
    });
    var importForMacrosNames5857 = ctNames5855.map(function (name5861) {
        return syn5339.makeIdent(name5861, ctx5853);
    });
    var // import { names ... } from "importPath" for phase 1
    importForMacrosStmt5858 = [syn5339.makeKeyword("import", ctx5853), syn5339.makeDelim("{}", joinSyntax5451(importForMacrosNames5857, syn5339.makePunc(",", ctx5853)), ctx5853), syn5339.makeIdent("from", ctx5853), syn5339.makeValue(importPath5852, ctx5853), syn5339.makeKeyword("for", ctx5853), syn5339.makeIdent("phase", ctx5853), syn5339.makeValue(1, ctx5853)];
    var // import { names ... } from "importPath"
    importStmt5859 = [syn5339.makeKeyword("import", ctx5853), syn5339.makeDelim("{}", joinSyntax5451(importNames5856, syn5339.makePunc(",", ctx5853)), ctx5853), syn5339.makeIdent("from", ctx5853), syn5339.makeValue(importPath5852, ctx5853)];
    return importStmt5859.concat(importForMacrosStmt5858);
}
function createModule5495(name5862, body5863) {
    var language5864 = "base";
    var modBody5865 = body5863;
    if (body5863 && body5863[0] && body5863[1] && body5863[2] && unwrapSyntax5359(body5863[0]) === "#" && unwrapSyntax5359(body5863[1]) === "lang" && body5863[2].isStringLiteral()) {
        language5864 = unwrapSyntax5359(body5863[2]);
        // consume optional semicolon
        modBody5865 = body5863[3] && body5863[3].token.value === ";" && body5863[3].isPunctuator() ? body5863.slice(4) : body5863.slice(3);
    }
    if ( // insert the default import statements into the module body
    language5864 !== "base" && language5864 !== "js") {
        // "base" and "js" are currently special languages meaning don't
        // insert the default imports
        modBody5865 = defaultImportStx5494(language5864, body5863[0]).concat(modBody5865);
    }
    return {
        record: new ModuleRecord5351(name5862, language5864),
        term: ModuleTerm5375.create(modBody5865)
    };
}
function loadModule5496(name5866) {
    var // node specific code
    fs5867 = require("fs");
    return (function (body5868) {
        return createModule5495(name5866, body5868);
    })(parser5338.read(fs5867.readFileSync(name5866, "utf8")));
}
function invoke5497(modTerm5869, modRecord5870, phase5871, context5872) {
    if (modRecord5870.language === "base") {
        var // base modules can just use the normal require pipeline
        exported5873 = require(modRecord5870.name);
        Object.keys(exported5873).forEach(function (exp5874) {
            var // create new bindings in the context
            expName5875 = syn5339.makeIdent(exp5874, null).mark(freshScope5366(context5872.bindings));
            context5872.bindings.add(expName5875, fresh5365(), phase5871);
            modRecord5870.exportEntries.push(new ExportEntry5350(null, expName5875, expName5875));
            context5872.store.setWithModule(expName5875, phase5871, modRecord5870.name, new RuntimeValue5471({ value: exported5873[exp5874] }, modRecord5870.name, phase5871));
        });
    } else {
        // recursively invoke any imports in this module at this
        // phase and update the context
        modRecord5870.importedModules.forEach(function (impPath5878) {
            var importMod5879 = loadImport5500(impPath5878, context5872, modRecord5870.name);
            var impEntries5880 = modRecord5870.getImportsForModule(impPath5878);
            if (_5337.any(impEntries5880, function (entry5881) {
                return entry5881.forPhase === 0;
            })) {
                context5872 = invoke5497(importMod5879.term, importMod5879.record, phase5871, context5872);
            }
        });
        var // turn the module into text so we can eval it
        code5876 = (function (terms5882) {
            return codegen5336.generate(parser5338.parse(flatten5506(_5337.flatten(terms5882.map(function (term5883) {
                return term5883.destruct(context5872, {
                    stripCompileTerm: true,
                    stripModuleTerm: true
                });
            })))));
        })(modTerm5869.body);
        var global5877 = { console: console };
        // eval but with a fresh heap
        vm5353.runInNewContext(code5876, global5877);
        // update the exports with the runtime values
        modRecord5870.exportEntries.forEach(function (entry5884) {
            var // we have to get the value with the localName
            expName5885 = resolve5346(entry5884.localName, 0);
            var expVal5886 = global5877[expName5885];
            if (expVal5886) {
                context5872.bindings.add(entry5884.exportName, fresh5365(), phase5871);
                // and set it as the export name
                context5872.store.set(entry5884.exportName, phase5871, new RuntimeValue5471({ value: expVal5886 }, modRecord5870.name, phase5871));
            }
        });
    }
    return context5872;
}
function visitTerms5498(terms5887, modRecord5888, phase5889, context5890) {
    var name5891;
    var macroDefinition5892;
    var exportName5893;
    var entries5894;
    terms5887.forEach(function (term5895) {
        if ( // add the exported names to the module record
        term5895.isExportNameTerm || term5895.isExportDeclTerm || term5895.isExportDefaultTerm) {
            entries5894 = modRecord5888.addExport(term5895);
        }
        if (term5895.isExportDefaultTerm && term5895.decl.isMacroTerm || term5895.isMacroTerm) {
            var _multiTokName5896 = undefined,
                _fullName5897 = undefined,
                macBody5898 = term5895.isExportDefaultTerm ? term5895.decl.body : term5895.body;
            macroDefinition5892 = loadMacroDef5487(macBody5898, context5890, phase5889 + 1);
            if (term5895.isExportDefaultTerm) {
                _multiTokName5896 = entries5894[0].exportName;
                _fullName5897 = [entries5894[0].exportName];
            } else {
                _multiTokName5896 = makeMultiToken5367(term5895.name);
                _fullName5897 = term5895.name.token.inner;
            }
            // todo: handle implicit imports
            context5890.bindings.add(_multiTokName5896, fresh5365(), phase5889);
            context5890.store.set(_multiTokName5896, phase5889, new CompiletimeValue5470(new SyntaxTransform5344(macroDefinition5892, false, builtinMode5452, _fullName5897), phase5889, modRecord5888.name));
        }
        if (term5895.isForPhaseTerm) {
            visitTerms5498(term5895.body, modRecord5888, phase5889 + term5895.phase.token.value, context5890);
        }
        if (term5895.isOperatorDefinitionTerm) {
            var opDefinition5899 = loadMacroDef5487(term5895.body, context5890, phase5889 + 1);
            var multiTokName5896 = makeMultiToken5367(term5895.name);
            var fullName5897 = term5895.name.token.inner;
            var opObj5902 = {
                isOp: true,
                builtin: builtinMode5452,
                fullName: fullName5897
            };
            assert5354(unwrapSyntax5359(term5895.type) === "binary" || unwrapSyntax5359(term5895.type) === "unary", "operator must either be binary or unary");
            opObj5902[unwrapSyntax5359(term5895.type)] = {
                fn: opDefinition5899,
                prec: term5895.prec.token.value,
                assoc: term5895.assoc ? term5895.assoc.token.value : null
            };
            // bind in the store for the current phase
            context5890.bindings.add(multiTokName5896, fresh5365(), phase5889);
            context5890.store.set(multiTokName5896, phase5889, new CompiletimeValue5470(opObj5902, phase5889, modRecord5888.name));
        }
    });
}
function visit5499(modTerm5903, modRecord5904, phase5905, context5906) {
    if ( // don't need to visit base modules since they do not support macros
    modRecord5904.language === "base") {
        return context5906;
    }
    // reset the exports
    modRecord5904.exportEntries = [];
    // for each of the imported modules, recursively visit and
    // invoke them at the appropriate phase and then bind the
    // imported names in this module
    modRecord5904.importedModules.forEach(function (impPath5907) {
        var // load the (possibly cached) module for this import
        importMod5908 = loadImport5500(impPath5907, context5906, modRecord5904.name);
        var // grab all the import statements for that module
        impEntries5909 = modRecord5904.getImportsForModule(impPath5907);
        var uniquePhases5910 = _5337.uniq(impEntries5909.map(function (entry) {
            return entry.forPhase;
        }));
        uniquePhases5910.forEach(function (impPhase5911) {
            context5906 = visit5499(importMod5908.term, importMod5908.record, phase5905 + impPhase5911, context5906);
            if ( // don't need to invoke when importing for phase 0 (runtime)
            impPhase5911 > 0) {
                context5906 = invoke5497(importMod5908.term, importMod5908.record, phase5905 + impPhase5911, context5906);
            }
        });
        bindImportInMod5501(impEntries5909, importMod5908.term, importMod5908.record, context5906, phase5905);
    });
    // load the transformers into the store
    visitTerms5498(modTerm5903.body, modRecord5904, phase5905, context5906);
    return context5906;
}
function loadImport5500(path5912, context5913, parentPath5914) {
    var modFullPath5915 = resolvePath5493(path5912, parentPath5914);
    if (!availableModules5455.has(modFullPath5915)) {
        var // load it
        modToImport5916 = (function (mod5917) {
            if (mod5917.record.language === "base") {
                return {
                    term: mod5917,
                    record: mod5917.record
                };
            }
            var expanded5918 = expandModule5502(mod5917.term, modFullPath5915, context5913.templateMap, context5913.patternMap, mod5917.record, context5913.compileSuffix, context5913.bindings);
            return {
                term: expanded5918.mod,
                record: expanded5918.context.moduleRecord
            };
        })(loadModule5496(modFullPath5915));
        availableModules5455.set(modFullPath5915, modToImport5916);
        return modToImport5916;
    }
    return availableModules5455.get(modFullPath5915);
}
function bindImportInMod5501(impEntries5919, modTerm5920, modRecord5921, context5922, phase5923) {
    impEntries5919.forEach(function (entry5924) {
        var isBase5925 = modRecord5921.language === "base";
        var inExports5926 = _5337.find(modRecord5921.exportEntries, function (expEntry5929) {
            return unwrapSyntax5359(expEntry5929.exportName) === unwrapSyntax5359(entry5924.importName);
        });
        if (!(inExports5926 || isBase5925)) {
            throwSyntaxError5356("compile", "the imported name `" + unwrapSyntax5359(entry5924.importName) + "` was not exported from the module", entry5924.importName);
        }
        var exportName5927;
        if (inExports5926) {
            exportName5927 = inExports5926.exportName;
        } else {
            assert5354(false, "not implemented yet: missing export name");
        }
        var localName5928 = entry5924.localName;
        context5922.bindings.addForward(localName5928, exportName5927, phase5923 + entry5924.forPhase);
    });
}
// (ModuleTerm, Str, Map, Map, ModuleRecord) -> {
//     context: ExpanderContext,
//     mod: ModuleTerm
// }
function expandModule5502(mod5930, filename5931, templateMap5932, patternMap5933, moduleRecord5934, compileSuffix5935, bindings5936) {
    var // create a new expander context for this module
    context5937 = makeModuleExpanderContext5492(filename5931, templateMap5932, patternMap5933, 0, moduleRecord5934, compileSuffix5935, bindings5936);
    return {
        context: context5937,
        mod: expandTermTreeToFinal5489(mod5930, context5937)
    };
}
function isRuntimeName5503(stx5938, context5939) {
    if (stx5938.isDelimiter()) {
        return hasVarTransform5476(stx5938.token.inner, context5939, 0);
    } else {
        return hasVarTransform5476(stx5938, context5939, 0);
    }
}
function flattenModule5504(modTerm5940, modRecord5941, context5942) {
    var // filter the imports to just the imports and names that are
    // actually available at runtime
    imports5943 = modRecord5941.getRuntimeImportEntries().filter(function (entry5949) {
        return isRuntimeName5503(entry5949.localName, context5942);
    });
    var exports5944 = modRecord5941.exportEntries.filter(function (entry5950) {
        return isRuntimeName5503(entry5950.localName, context5942);
    });
    var eof5945 = undefined;
    var // filter out all of the import and export statements
    output5946 = modTerm5940.body.reduce(function (acc5951, term5952) {
        if (term5952.isExportNameTerm || term5952.isExportDeclTerm || term5952.isExportDefaultTerm || term5952.isImportTerm || term5952.isImportForPhaseTerm) {
            return acc5951;
        }
        if (term5952.isEOFTerm) {
            eof5945 = term5952.destruct(context5942);
            return acc5951;
        }
        return acc5951.concat(term5952.destruct(context5942, { stripCompileTerm: true }));
    }, []);
    output5946 = (function (output5953) {
        return output5953.map(function (stx5954) {
            var name5955 = resolve5346(stx5954, 0);
            if ( // collect the implicit imports (those imports that
            // must be included because a macro expanded to a reference
            // to an import from some other module)
            context5942.implicitImport.has(name5955)) {
                var implicit5956 = context5942.implicitImport.get(name5955);
                if ( // don't double add the import
                !_5337.find(imports5943, function (imp5957) {
                    return imp5957 === implicit5956;
                })) {
                    imports5943.push(implicit5956);
                }
            }
            return stx5954;
        });
    })(flatten5506(output5946));
    var // flatten everything
    flatImports5947 = imports5943.reduce(function (acc5958, entry5959) {
        entry5959.moduleRequest = entry5959.moduleRequest.clone();
        entry5959.moduleRequest.token.value += context5942.compileSuffix;
        return acc5958.concat(flatten5506(entry5959.toTerm().destruct(context5942).concat(syn5339.makePunc(";", entry5959.moduleRequest))));
    }, []);
    var flatExports5948 = exports5944.reduce(function (acc, entry) {
        return acc.concat(flatten5506(entry.toTerm().destruct(context5942).concat(syn5339.makePunc(";", entry.localName))));
    }, []);
    return {
        imports: imports5943.map(function (entry5960) {
            return entry5960.toTerm();
        }),
        body: flatImports5947.concat(output5946).concat(flatExports5948).concat(eof5945)
    };
}
function compileModule5505(stx5961, options5962) {
    var fs5963 = require("fs");
    options5962 = options5962 || {};
    var filename5964 = options5962 && typeof options5962.filename !== "undefined" ? fs5963.realpathSync(options5962.filename) : "(anonymous module)";
    maxExpands5454 = Infinity;
    expandCount5453 = 0;
    var mod5965 = createModule5495(filename5964, stx5961);
    var // the template and pattern maps are global for every module
    templateMap5966 = new StringMap5341();
    var patternMap5967 = new StringMap5341();
    availableModules5455 = new StringMap5341();
    var expanded5968 = expandModule5502(mod5965.term, filename5964, templateMap5966, patternMap5967, mod5965.record, options5962.compileSuffix);
    var flattened5969 = flattenModule5504(expanded5968.mod, expanded5968.context.moduleRecord, expanded5968.context);
    var compiledModules5970 = [];
    availableModules5455.keys().forEach(function (modName5971) {
        var mod5972 = availableModules5455.get(modName5971);
        if (mod5972.record.language !== "base") {
            var flattened5973 = flattenModule5504(mod5972.term, mod5972.record, expanded5968.context);
            compiledModules5970.push({
                path: modName5971,
                code: flattened5973.body
            });
        }
    });
    return [{
        path: filename5964,
        code: flattened5969.body
    }].concat(compiledModules5970);
}
function flatten5506(stx5974) {
    return _5337.reduce(stx5974, function (acc5975, stx5976) {
        if (stx5976.isDelimiter()) {
            var openParen5977 = syntaxFromToken5450({
                type: parser5338.Token.Punctuator,
                value: stx5976.token.value[0],
                range: stx5976.token.startRange,
                sm_range: typeof stx5976.token.sm_startRange == "undefined" ? stx5976.token.startRange : stx5976.token.sm_startRange,
                lineNumber: stx5976.token.startLineNumber,
                sm_lineNumber: typeof stx5976.token.sm_startLineNumber == "undefined" ? stx5976.token.startLineNumber : stx5976.token.sm_startLineNumber,
                lineStart: stx5976.token.startLineStart,
                sm_lineStart: typeof stx5976.token.sm_startLineStart == "undefined" ? stx5976.token.startLineStart : stx5976.token.sm_startLineStart
            }, stx5976);
            var closeParen5978 = syntaxFromToken5450({
                type: parser5338.Token.Punctuator,
                value: stx5976.token.value[1],
                range: stx5976.token.endRange,
                sm_range: typeof stx5976.token.sm_endRange == "undefined" ? stx5976.token.endRange : stx5976.token.sm_endRange,
                lineNumber: stx5976.token.endLineNumber,
                sm_lineNumber: typeof stx5976.token.sm_endLineNumber == "undefined" ? stx5976.token.endLineNumber : stx5976.token.sm_endLineNumber,
                lineStart: stx5976.token.endLineStart,
                sm_lineStart: typeof stx5976.token.sm_endLineStart == "undefined" ? stx5976.token.endLineStart : stx5976.token.sm_endLineStart
            }, stx5976);
            if (stx5976.token.leadingComments) {
                openParen5977.token.leadingComments = stx5976.token.leadingComments;
            }
            if (stx5976.token.trailingComments) {
                openParen5977.token.trailingComments = stx5976.token.trailingComments;
            }
            acc5975.push(openParen5977);
            push5456.apply(acc5975, flatten5506(stx5976.token.inner));
            acc5975.push(closeParen5978);
            return acc5975;
        }
        stx5976.token.sm_lineNumber = typeof stx5976.token.sm_lineNumber != "undefined" ? stx5976.token.sm_lineNumber : stx5976.token.lineNumber;
        stx5976.token.sm_lineStart = typeof stx5976.token.sm_lineStart != "undefined" ? stx5976.token.sm_lineStart : stx5976.token.lineStart;
        stx5976.token.sm_range = typeof stx5976.token.sm_range != "undefined" ? stx5976.token.sm_range : stx5976.token.range;
        acc5975.push(stx5976);
        return acc5975;
    }, []);
}
exports.StringMap = StringMap5341;
exports.enforest = enforest5480;
exports.compileModule = compileModule5505;
exports.getCompiletimeValue = getCompiletimeValue5472;
exports.hasCompiletimeValue = hasCompiletimeValue5477;
exports.getSyntaxTransform = getSyntaxTransform5473;
exports.hasSyntaxTransform = hasSyntaxTransform5475;
exports.resolve = resolve5346;
exports.get_expression = get_expression5482;
exports.makeExpanderContext = makeExpanderContext5491;
exports.ExprTerm = ExprTerm5397;
exports.VariableStatementTerm = VariableStatementTerm5422;
exports.tokensToSyntax = syn5339.tokensToSyntax;
exports.syntaxToTokens = syn5339.syntaxToTokens;
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