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
    makeImportEntries5347 = require("./mod/importEntry").makeImportEntries,
    ExportEntry5348 = require("./mod/exportEntry").ExportEntry,
    ModuleRecord5349 = require("./mod/moduleRecord").ModuleRecord,
    patternModule5350 = require("./patterns"),
    vm5351 = require("vm"),
    assert5352 = require("assert"),
    termTree5353 = require("./data/termTree");
var throwSyntaxError5354 = syn5339.throwSyntaxError;
var throwSyntaxCaseError5355 = syn5339.throwSyntaxCaseError;
var SyntaxCaseError5356 = syn5339.SyntaxCaseError;
var unwrapSyntax5357 = syn5339.unwrapSyntax;
var makeIdent5358 = syn5339.makeIdent;
var makePunc5359 = syn5339.makePunc;
var makeDelim5360 = syn5339.makeDelim;
var makeValue5361 = syn5339.makeValue;
var adjustLineContext5362 = syn5339.adjustLineContext;
var fresh5363 = syn5339.fresh;
var freshScope5364 = syn5339.freshScope;
var makeMultiToken5365 = syn5339.makeMultiToken;
var Scope5366 = syn5339.Scope;
var TermTree5367 = termTree5353.TermTree,
    EOFTerm5368 = termTree5353.EOFTerm,
    KeywordTerm5369 = termTree5353.KeywordTerm,
    PuncTerm5370 = termTree5353.PuncTerm,
    DelimiterTerm5371 = termTree5353.DelimiterTerm,
    ModuleTimeTerm5372 = termTree5353.ModuleTimeTerm,
    ModuleTerm5373 = termTree5353.ModuleTerm,
    ImportTerm5374 = termTree5353.ImportTerm,
    ImportForPhaseTerm5375 = termTree5353.ImportForPhaseTerm,
    NamedImportTerm5376 = termTree5353.NamedImportTerm,
    DefaultImportTerm5377 = termTree5353.DefaultImportTerm,
    NamespaceImportTerm5378 = termTree5353.NamespaceImportTerm,
    BindingTerm5379 = termTree5353.BindingTerm,
    QualifiedBindingTerm5380 = termTree5353.QualifiedBindingTerm,
    ExportNameTerm5381 = termTree5353.ExportNameTerm,
    ExportDefaultTerm5382 = termTree5353.ExportDefaultTerm,
    ExportDeclTerm5383 = termTree5353.ExportDeclTerm,
    CompileTimeTerm5384 = termTree5353.CompileTimeTerm,
    MacroTerm5385 = termTree5353.MacroTerm,
    ClassDeclarationTerm5386 = termTree5353.ClassDeclarationTerm,
    OperatorDefinitionTerm5387 = termTree5353.OperatorDefinitionTerm,
    ForPhaseTerm5388 = termTree5353.ForPhaseTerm,
    VariableDeclarationTerm5389 = termTree5353.VariableDeclarationTerm,
    StatementTerm5390 = termTree5353.StatementTerm,
    EmptyTerm5391 = termTree5353.EmptyTerm,
    CatchClauseTerm5392 = termTree5353.CatchClauseTerm,
    ForStatementTerm5393 = termTree5353.ForStatementTerm,
    ReturnStatementTerm5394 = termTree5353.ReturnStatementTerm,
    ExprTerm5395 = termTree5353.ExprTerm,
    UnaryOpTerm5396 = termTree5353.UnaryOpTerm,
    PostfixOpTerm5397 = termTree5353.PostfixOpTerm,
    BinOpTerm5398 = termTree5353.BinOpTerm,
    AssignmentExpressionTerm5399 = termTree5353.AssignmentExpressionTerm,
    ConditionalExpressionTerm5400 = termTree5353.ConditionalExpressionTerm,
    NamedFunTerm5401 = termTree5353.NamedFunTerm,
    AnonFunTerm5402 = termTree5353.AnonFunTerm,
    ArrowFunTerm5403 = termTree5353.ArrowFunTerm,
    ObjDotGetTerm5404 = termTree5353.ObjDotGetTerm,
    ObjGetTerm5405 = termTree5353.ObjGetTerm,
    TemplateTerm5406 = termTree5353.TemplateTerm,
    CallTerm5407 = termTree5353.CallTerm,
    QuoteSyntaxTerm5408 = termTree5353.QuoteSyntaxTerm,
    StopQuotedTerm5409 = termTree5353.StopQuotedTerm,
    PrimaryExpressionTerm5410 = termTree5353.PrimaryExpressionTerm,
    ThisExpressionTerm5411 = termTree5353.ThisExpressionTerm,
    LitTerm5412 = termTree5353.LitTerm,
    BlockTerm5413 = termTree5353.BlockTerm,
    ArrayLiteralTerm5414 = termTree5353.ArrayLiteralTerm,
    IdTerm5415 = termTree5353.IdTerm,
    PartialTerm5416 = termTree5353.PartialTerm,
    PartialOperationTerm5417 = termTree5353.PartialOperationTerm,
    PartialExpressionTerm5418 = termTree5353.PartialExpressionTerm,
    BindingStatementTerm5419 = termTree5353.BindingStatementTerm,
    VariableStatementTerm5420 = termTree5353.VariableStatementTerm,
    LetStatementTerm5421 = termTree5353.LetStatementTerm,
    ConstStatementTerm5422 = termTree5353.ConstStatementTerm,
    ParenExpressionTerm5423 = termTree5353.ParenExpressionTerm;
var scopedEval5447 = se5340.scopedEval;
var syntaxFromToken5448 = syn5339.syntaxFromToken;
var joinSyntax5449 = syn5339.joinSyntax;
var builtinMode5450 = false;
var expandCount5451 = 0;
var maxExpands5452;
var availableModules5453;
var push5454 = Array.prototype.push;
function getParamIdentifiers5455(argSyntax5506) {
    if (argSyntax5506.isDelimiter()) {
        return _5337.filter(argSyntax5506.token.inner, function (stx5507) {
            return stx5507.token.value !== ",";
        });
    } else if (argSyntax5506.isIdentifier()) {
        return [argSyntax5506];
    } else {
        assert5352(false, "expecting a delimiter or a single identifier for function parameters");
    }
}
function stxIsUnaryOp5456(stx5508) {
    var staticOperators5509 = ["+", "-", "~", "!", "delete", "void", "typeof", "yield", "new", "++", "--"];
    return _5337.contains(staticOperators5509, unwrapSyntax5357(stx5508));
}
function stxIsBinOp5457(stx5510) {
    var staticOperators5511 = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "<<", ">>", ">>>"];
    return _5337.contains(staticOperators5511, unwrapSyntax5357(stx5510));
}
function getUnaryOpPrec5458(op5512) {
    var operatorPrecedence5513 = {
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
    return operatorPrecedence5513[op5512];
}
function getBinaryOpPrec5459(op5514) {
    var operatorPrecedence5515 = {
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
    return operatorPrecedence5515[op5514];
}
function getBinaryOpAssoc5460(op5516) {
    var operatorAssoc5517 = {
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
    return operatorAssoc5517[op5516];
}
function stxIsAssignOp5461(stx5518) {
    var staticOperators5519 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
    return _5337.contains(staticOperators5519, unwrapSyntax5357(stx5518));
}
function enforestImportClause5462(stx5520) {
    if (stx5520[0] && stx5520[0].isDelimiter()) {
        return {
            result: NamedImportTerm5376.create(stx5520[0]),
            rest: stx5520.slice(1)
        };
    } else if (stx5520[0] && stx5520[0].isPunctuator() && unwrapSyntax5357(stx5520[0]) === "*" && stx5520[1] && unwrapSyntax5357(stx5520[1]) === "as" && stx5520[2]) {
        return {
            result: NamespaceImportTerm5378.create(stx5520[0], stx5520[1], stx5520[2]),
            rest: stx5520.slice(3)
        };
    } else {
        return {
            result: DefaultImportTerm5377.create(stx5520[0]),
            rest: stx5520.slice(1)
        };
    }
}
function enforestImportClauseList5463(stx5521) {
    var res5522 = [];
    var clause5523 = enforestImportClause5462(stx5521);
    var rest5524 = clause5523.rest;
    res5522.push(clause5523.result);
    if (rest5524[0] && rest5524[0].isPunctuator() && unwrapSyntax5357(rest5524[0]) === ",") {
        res5522.push(rest5524[0]);
        clause5523 = enforestImportClause5462(rest5524.slice(1));
        res5522.push(clause5523.result);
        rest5524 = clause5523.rest;
    }
    return {
        result: res5522,
        rest: rest5524
    };
}
function enforestImport5464(head5525, rest5526) {
    assert5352(unwrapSyntax5357(head5525) === "import", "only call for imports");
    var clause5527 = enforestImportClauseList5463(rest5526);
    var importRest5528;
    rest5526 = clause5527.rest;
    if (rest5526[0] && unwrapSyntax5357(rest5526[0]) === "from" && rest5526[1] && rest5526[1].isStringLiteral() && rest5526[2] && unwrapSyntax5357(rest5526[2]) === "for" && rest5526[3] && unwrapSyntax5357(rest5526[3]) === "phase" && rest5526[4] && rest5526[4].isNumericLiteral()) {
        if (rest5526[5] && rest5526[5].isPunctuator() && rest5526[5].token.value === ";") {
            importRest5528 = rest5526.slice(6);
        } else {
            importRest5528 = rest5526.slice(5);
        }
        return {
            result: ImportForPhaseTerm5375.create(head5525, clause5527.result, rest5526[0], rest5526[1], rest5526[2], rest5526[3], rest5526[4]),
            rest: importRest5528
        };
    } else if (rest5526[0] && unwrapSyntax5357(rest5526[0]) === "from" && rest5526[1] && rest5526[1].isStringLiteral()) {
        if (rest5526[2] && rest5526[2].isPunctuator() && rest5526[2].token.value === ";") {
            importRest5528 = rest5526.slice(3);
        } else {
            importRest5528 = rest5526.slice(2);
        }
        return {
            result: ImportTerm5374.create(head5525, clause5527.result, rest5526[0], rest5526[1]),
            rest: importRest5528
        };
    } else {
        throwSyntaxError5354("enforest", "unrecognized import syntax", rest5526);
    }
}
function enforestVarStatement5465(stx5529, context5530, varStx5531) {
    var decls5532 = [];
    var rest5533 = stx5529;
    var rhs5534;
    if (!rest5533.length) {
        throwSyntaxError5354("enforest", "Unexpected end of input", varStx5531);
    }
    if (expandCount5451 >= maxExpands5452) {
        return null;
    }
    while (rest5533.length) {
        if (rest5533[0].isIdentifier()) {
            if (rest5533[1] && rest5533[1].isPunctuator() && rest5533[1].token.value === "=") {
                rhs5534 = get_expression5480(rest5533.slice(2), context5530);
                if (rhs5534.result == null) {
                    throwSyntaxError5354("enforest", "Unexpected token", rhs5534.rest[0]);
                }
                if (rhs5534.rest[0] && rhs5534.rest[0].isPunctuator() && rhs5534.rest[0].token.value === ",") {
                    decls5532.push(VariableDeclarationTerm5389.create(rest5533[0], rest5533[1], rhs5534.result, rhs5534.rest[0]));
                    rest5533 = rhs5534.rest.slice(1);
                    continue;
                } else {
                    decls5532.push(VariableDeclarationTerm5389.create(rest5533[0], rest5533[1], rhs5534.result, null));
                    rest5533 = rhs5534.rest;
                    break;
                }
            } else if (rest5533[1] && rest5533[1].isPunctuator() && rest5533[1].token.value === ",") {
                decls5532.push(VariableDeclarationTerm5389.create(rest5533[0], null, null, rest5533[1]));
                rest5533 = rest5533.slice(2);
            } else {
                decls5532.push(VariableDeclarationTerm5389.create(rest5533[0], null, null, null));
                rest5533 = rest5533.slice(1);
                break;
            }
        } else {
            throwSyntaxError5354("enforest", "Unexpected token", rest5533[0]);
        }
    }
    return {
        result: decls5532,
        rest: rest5533
    };
}
function enforestAssignment5466(stx5535, context5536, left5537, prevStx5538, prevTerms5539) {
    var op5540 = stx5535[0];
    var rightStx5541 = stx5535.slice(1);
    var opTerm5542 = PuncTerm5370.create(stx5535[0]);
    var opPrevStx5543 = tagWithTerm5481(opTerm5542, [stx5535[0]]).concat(tagWithTerm5481(left5537, left5537.destruct(context5536).reverse()), prevStx5538);
    var opPrevTerms5544 = [opTerm5542, left5537].concat(prevTerms5539);
    var opRes5545 = enforest5478(rightStx5541, context5536, opPrevStx5543, opPrevTerms5544);
    if (opRes5545.result) {
        if ( // Lookbehind was matched, so it may not even be a binop anymore.
        opRes5545.prevTerms.length < opPrevTerms5544.length) {
            return opRes5545;
        }
        var right5546 = opRes5545.result;
        if ( // only a binop if the right is a real expression
        // so 2+2++ will only match 2+2
        right5546.isExprTerm) {
            var term5547 = AssignmentExpressionTerm5399.create(left5537, op5540, right5546);
            return {
                result: term5547,
                rest: opRes5545.rest,
                prevStx: prevStx5538,
                prevTerms: prevTerms5539
            };
        }
    } else {
        return opRes5545;
    }
}
function enforestParenExpression5467(parens5548, context5549) {
    var argRes5550,
        enforestedArgs5551 = [],
        commas5552 = [];
    var innerTokens5553 = parens5548.token.inner;
    while (innerTokens5553.length > 0) {
        argRes5550 = enforest5478(innerTokens5553, context5549);
        if (!argRes5550.result || !argRes5550.result.isExprTerm) {
            return null;
        }
        enforestedArgs5551.push(argRes5550.result);
        innerTokens5553 = argRes5550.rest;
        if (innerTokens5553[0] && innerTokens5553[0].token.value === ",") {
            // record the comma for later
            commas5552.push(innerTokens5553[0]);
            // but dump it for the next loop turn
            innerTokens5553 = innerTokens5553.slice(1);
        } else {
            // either there are no more tokens or
            // they aren't a comma, either way we
            // are done with the loop
            break;
        }
    }
    return innerTokens5553.length ? null : ParenExpressionTerm5423.create(enforestedArgs5551, parens5548, commas5552);
}
function CompiletimeValue5468(trans5554, module5555, phase5556) {
    this.trans = trans5554;
    this.module = module5555;
    this.phase = phase5556;
}
function RuntimeValue5469(trans5557, module5558, phase5559) {
    this.trans = trans5557;
    this.module = module5558;
    this.phase = phase5559;
}
function getCompiletimeValue5470(stx5560, context5561, phase5562) {
    var store5563,
        env5564 = context5561.env.get(stx5560, phase5562);
    if (env5564 !== null) {
        return env5564.trans;
    } else {
        store5563 = context5561.store.get(stx5560, phase5562);
        return store5563 !== null ? store5563.trans : null;
    }
}
function getSyntaxTransform5471(stx5565, context5566, phase5567) {
    var t5568 = getCompiletimeValue5470(stx5565, context5566, phase5567);
    if (t5568 && t5568 instanceof VarTransform5345) {
        return null;
    }
    return t5568;
}
function getVarTransform5472(stx5569, context5570, phase5571) {
    var t5572 = getCompiletimeValue5470(stx5569, context5570, phase5571);
    if (t5572 && t5572 instanceof VarTransform5345) {
        return t5572;
    }
    return null;
}
function hasSyntaxTransform5473(stx5573, context5574, phase5575) {
    return getSyntaxTransform5471(stx5573, context5574, phase5575) !== null;
}
function hasVarTransform5474(stx5576, context5577, phase5578) {
    return getVarTransform5472(stx5576, context5577, phase5578) !== null;
}
function hasCompiletimeValue5475(stx5579, context5580, phase5581) {
    return context5580.env.has(stx5579, phase5581) || context5580.store.has(stx5579, phase5581);
}
function expandMacro5476(stx5582, context5583, opCtx5584, opType5585, macroObj5586) {
    var // pull the macro transformer out the environment
    head5587 = stx5582[0];
    var rest5588 = stx5582.slice(1);
    macroObj5586 = macroObj5586 || getSyntaxTransform5471(stx5582, context5583, context5583.phase);
    var stxArg5589 = rest5588.slice(macroObj5586.fullName.length - 1);
    var transformer5590;
    if (opType5585 != null) {
        assert5352(opType5585 === "binary" || opType5585 === "unary", "operator type should be either unary or binary: " + opType5585);
        transformer5590 = macroObj5586[opType5585].fn;
    } else {
        transformer5590 = macroObj5586.fn;
    }
    assert5352(typeof transformer5590 === "function", "Macro transformer not bound for: " + head5587.token.value);
    var transformerContext5591 = makeExpanderContext5489(_5337.defaults({ mark: freshScope5364(context5583.bindings) }, context5583));
    // apply the transformer
    var rt5592;
    try {
        rt5592 = transformer5590([head5587].concat(stxArg5589), transformerContext5591, opCtx5584.prevStx, opCtx5584.prevTerms);
    } catch (e5593) {
        if (e5593 instanceof SyntaxCaseError5356) {
            var // add a nicer error for syntax case
            nameStr5594 = macroObj5586.fullName.map(function (stx5595) {
                return stx5595.token.value;
            }).join("");
            if (opType5585 != null) {
                var argumentString5596 = "`" + stxArg5589.slice(0, 5).map(function (stx5597) {
                    return stx5597.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5354("operator", "Operator `" + nameStr5594 + "` could not be matched with " + argumentString5596, head5587);
            } else {
                var argumentString5596 = "`" + stxArg5589.slice(0, 5).map(function (stx5599) {
                    return stx5599.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5354("macro", "Macro `" + nameStr5594 + "` could not be matched with " + argumentString5596, head5587);
            }
        } else {
            // just rethrow it
            throw e5593;
        }
    }
    if (!builtinMode5450 && !macroObj5586.builtin) {
        expandCount5451++;
    }
    if (!Array.isArray(rt5592.result)) {
        throwSyntaxError5354("enforest", "Macro must return a syntax array", stx5582[0]);
    }
    if (rt5592.result.length > 0) {
        var adjustedResult5600 = adjustLineContext5362(rt5592.result, head5587);
        if (stx5582[0].token.leadingComments) {
            if (adjustedResult5600[0].token.leadingComments) {
                adjustedResult5600[0].token.leadingComments = adjustedResult5600[0].token.leadingComments.concat(head5587.token.leadingComments);
            } else {
                adjustedResult5600[0].token.leadingComments = head5587.token.leadingComments;
            }
        }
        rt5592.result = adjustedResult5600;
    }
    return rt5592;
}
function comparePrec5477(left5601, right5602, assoc5603) {
    if (assoc5603 === "left") {
        return left5601 <= right5602;
    }
    return left5601 < right5602;
}
function enforest5478(toks5604, context5605, prevStx5606, prevTerms5607) {
    assert5352(toks5604.length > 0, "enforest assumes there are tokens to work with");
    prevStx5606 = prevStx5606 || [];
    prevTerms5607 = prevTerms5607 || [];
    if (expandCount5451 >= maxExpands5452) {
        return {
            result: null,
            rest: toks5604
        };
    }
    function step5608(head5609, rest5610, opCtx5611) {
        var innerTokens5612;
        assert5352(Array.isArray(rest5610), "result must at least be an empty array");
        if (head5609.isTermTree) {
            var isCustomOp5614 = false;
            var uopMacroObj5615;
            var uopSyntax5616;
            if (head5609.isPuncTerm || head5609.isKeywordTerm || head5609.isIdTerm) {
                if (head5609.isPuncTerm) {
                    uopSyntax5616 = head5609.punc;
                } else if (head5609.isKeywordTerm) {
                    uopSyntax5616 = head5609.keyword;
                } else if (head5609.isIdTerm) {
                    uopSyntax5616 = head5609.id;
                }
                uopMacroObj5615 = getSyntaxTransform5471([uopSyntax5616].concat(rest5610), context5605, context5605.phase);
                isCustomOp5614 = uopMacroObj5615 && uopMacroObj5615.isOp;
            }
            // look up once (we want to check multiple properties on bopMacroObj
            // without repeatedly calling getValueInEnv)
            var bopMacroObj5617;
            if (rest5610[0] && rest5610[1]) {
                bopMacroObj5617 = getSyntaxTransform5471(rest5610, context5605, context5605.phase);
            }
            if ( // unary operator
            isCustomOp5614 && uopMacroObj5615.unary || uopSyntax5616 && stxIsUnaryOp5456(uopSyntax5616)) {
                var uopPrec5618;
                if (isCustomOp5614 && uopMacroObj5615.unary) {
                    uopPrec5618 = uopMacroObj5615.unary.prec;
                } else {
                    uopPrec5618 = getUnaryOpPrec5458(unwrapSyntax5357(uopSyntax5616));
                }
                var opRest5619 = rest5610;
                var uopMacroName5620;
                if (uopMacroObj5615) {
                    uopMacroName5620 = [uopSyntax5616].concat(rest5610.slice(0, uopMacroObj5615.fullName.length - 1));
                    opRest5619 = rest5610.slice(uopMacroObj5615.fullName.length - 1);
                }
                var leftLeft5621 = opCtx5611.prevTerms[0] && opCtx5611.prevTerms[0].isPartialTerm ? opCtx5611.prevTerms[0] : null;
                var unopTerm5622 = PartialOperationTerm5417.create(head5609, leftLeft5621);
                var unopPrevStx5623 = tagWithTerm5481(unopTerm5622, head5609.destruct(context5605).reverse()).concat(opCtx5611.prevStx);
                var unopPrevTerms5624 = [unopTerm5622].concat(opCtx5611.prevTerms);
                var unopOpCtx5625 = _5337.extend({}, opCtx5611, {
                    combine: function combine(t5626) {
                        if (t5626.isExprTerm) {
                            if (isCustomOp5614 && uopMacroObj5615.unary) {
                                var rt5627 = expandMacro5476(uopMacroName5620.concat(t5626.destruct(context5605)), context5605, opCtx5611, "unary");
                                var newt5628 = get_expression5480(rt5627.result, context5605);
                                assert5352(newt5628.rest.length === 0, "should never have left over syntax");
                                return opCtx5611.combine(newt5628.result);
                            }
                            return opCtx5611.combine(UnaryOpTerm5396.create(uopSyntax5616, t5626));
                        } else {
                            // not actually an expression so don't create
                            // a UnaryOp term just return with the punctuator
                            return opCtx5611.combine(head5609);
                        }
                    },
                    prec: uopPrec5618,
                    prevStx: unopPrevStx5623,
                    prevTerms: unopPrevTerms5624,
                    op: unopTerm5622
                });
                return step5608(opRest5619[0], opRest5619.slice(1), unopOpCtx5625);
            } else if (head5609.isExprTerm && (rest5610[0] && rest5610[1] && (stxIsBinOp5457(rest5610[0]) && !bopMacroObj5617 || bopMacroObj5617 && bopMacroObj5617.isOp && bopMacroObj5617.binary))) {
                var opRes5629;
                var op5630 = rest5610[0];
                var left5631 = head5609;
                var rightStx5632 = rest5610.slice(1);
                var leftLeft5621 = opCtx5611.prevTerms[0] && opCtx5611.prevTerms[0].isPartialTerm ? opCtx5611.prevTerms[0] : null;
                var leftTerm5634 = PartialExpressionTerm5418.create(head5609.destruct(context5605), leftLeft5621, function () {
                    return step5608(head5609, [], opCtx5611);
                });
                var opTerm5635 = PartialOperationTerm5417.create(op5630, leftTerm5634);
                var opPrevStx5636 = tagWithTerm5481(opTerm5635, [rest5610[0]]).concat(tagWithTerm5481(leftTerm5634, head5609.destruct(context5605)).reverse(), opCtx5611.prevStx);
                var opPrevTerms5637 = [opTerm5635, leftTerm5634].concat(opCtx5611.prevTerms);
                var isCustomOp5614 = bopMacroObj5617 && bopMacroObj5617.isOp && bopMacroObj5617.binary;
                var bopPrec5639;
                var bopAssoc5640;
                if (isCustomOp5614 && bopMacroObj5617.binary) {
                    bopPrec5639 = bopMacroObj5617.binary.prec;
                    bopAssoc5640 = bopMacroObj5617.binary.assoc;
                } else {
                    bopPrec5639 = getBinaryOpPrec5459(unwrapSyntax5357(op5630));
                    bopAssoc5640 = getBinaryOpAssoc5460(unwrapSyntax5357(op5630));
                }
                assert5352(bopPrec5639 !== undefined, "expecting a precedence for operator: " + op5630);
                var newStack5641;
                if (comparePrec5477(bopPrec5639, opCtx5611.prec, bopAssoc5640)) {
                    var bopCtx5645 = opCtx5611;
                    var combResult5613 = opCtx5611.combine(head5609);
                    if (opCtx5611.stack.length > 0) {
                        return step5608(combResult5613.term, rest5610, opCtx5611.stack[0]);
                    }
                    left5631 = combResult5613.term;
                    newStack5641 = opCtx5611.stack;
                    opPrevStx5636 = combResult5613.prevStx;
                    opPrevTerms5637 = combResult5613.prevTerms;
                } else {
                    newStack5641 = [opCtx5611].concat(opCtx5611.stack);
                }
                assert5352(opCtx5611.combine !== undefined, "expecting a combine function");
                var opRightStx5642 = rightStx5632;
                var bopMacroName5643;
                if (isCustomOp5614) {
                    bopMacroName5643 = rest5610.slice(0, bopMacroObj5617.fullName.length);
                    opRightStx5642 = rightStx5632.slice(bopMacroObj5617.fullName.length - 1);
                }
                var bopOpCtx5644 = _5337.extend({}, opCtx5611, {
                    combine: function combine(right5647) {
                        if (right5647.isExprTerm) {
                            if (isCustomOp5614 && bopMacroObj5617.binary) {
                                var leftStx5648 = left5631.destruct(context5605);
                                var rightStx5649 = right5647.destruct(context5605);
                                var rt5650 = expandMacro5476(bopMacroName5643.concat(syn5339.makeDelim("()", leftStx5648, leftStx5648[0]), syn5339.makeDelim("()", rightStx5649, rightStx5649[0])), context5605, opCtx5611, "binary");
                                var newt5651 = get_expression5480(rt5650.result, context5605);
                                assert5352(newt5651.rest.length === 0, "should never have left over syntax");
                                return {
                                    term: newt5651.result,
                                    prevStx: opPrevStx5636,
                                    prevTerms: opPrevTerms5637
                                };
                            }
                            return {
                                term: BinOpTerm5398.create(left5631, op5630, right5647),
                                prevStx: opPrevStx5636,
                                prevTerms: opPrevTerms5637
                            };
                        } else {
                            return {
                                term: head5609,
                                prevStx: opPrevStx5636,
                                prevTerms: opPrevTerms5637
                            };
                        }
                    },
                    prec: bopPrec5639,
                    op: opTerm5635,
                    stack: newStack5641,
                    prevStx: opPrevStx5636,
                    prevTerms: opPrevTerms5637
                });
                return step5608(opRightStx5642[0], opRightStx5642.slice(1), bopOpCtx5644);
            } else if (head5609.isExprTerm && (rest5610[0] && rest5610[0].isDelimiter() && rest5610[0].token.value === "()")) {
                var parenRes5652 = enforestParenExpression5467(rest5610[0], context5605);
                if (parenRes5652) {
                    return step5608(CallTerm5407.create(head5609, parenRes5652), rest5610.slice(1), opCtx5611);
                }
            } else if (head5609.isExprTerm && (rest5610[0] && resolve5346(rest5610[0], context5605.phase) === "?")) {
                var question5653 = rest5610[0];
                var condRes5654 = enforest5478(rest5610.slice(1), context5605);
                if (condRes5654.result) {
                    var truExpr5655 = condRes5654.result;
                    var condRight5656 = condRes5654.rest;
                    if (truExpr5655.isExprTerm && condRight5656[0] && resolve5346(condRight5656[0], context5605.phase) === ":") {
                        var colon5657 = condRight5656[0];
                        var flsRes5658 = enforest5478(condRight5656.slice(1), context5605);
                        var flsExpr5659 = flsRes5658.result;
                        if (flsExpr5659.isExprTerm) {
                            if ( // operators are combined before the ternary
                            opCtx5611.prec >= 4) {
                                var // ternary is like a operator with prec 4
                                headResult5660 = opCtx5611.combine(head5609);
                                var condTerm5661 = ConditionalExpressionTerm5400.create(headResult5660.term, question5653, truExpr5655, colon5657, flsExpr5659);
                                if (opCtx5611.stack.length > 0) {
                                    return step5608(condTerm5661, flsRes5658.rest, opCtx5611.stack[0]);
                                } else {
                                    return {
                                        result: condTerm5661,
                                        rest: flsRes5658.rest,
                                        prevStx: headResult5660.prevStx,
                                        prevTerms: headResult5660.prevTerms
                                    };
                                }
                            } else {
                                var condTerm5661 = ConditionalExpressionTerm5400.create(head5609, question5653, truExpr5655, colon5657, flsExpr5659);
                                return step5608(condTerm5661, flsRes5658.rest, opCtx5611);
                            }
                        }
                    }
                }
            } else if (head5609.isDelimiterTerm && head5609.delim.token.value === "()" && rest5610[0] && rest5610[0].isPunctuator() && resolve5346(rest5610[0], context5605.phase) === "=>") {
                var arrowRes5663 = enforest5478(rest5610.slice(1), context5605);
                if (arrowRes5663.result && arrowRes5663.result.isExprTerm) {
                    return step5608(ArrowFunTerm5403.create(head5609.delim, rest5610[0], arrowRes5663.result.destruct(context5605)), arrowRes5663.rest, opCtx5611);
                } else {
                    throwSyntaxError5354("enforest", "Body of arrow function must be an expression", rest5610.slice(1));
                }
            } else if (head5609.isIdTerm && rest5610[0] && rest5610[0].isPunctuator() && resolve5346(rest5610[0], context5605.phase) === "=>") {
                var res5664 = enforest5478(rest5610.slice(1), context5605);
                if (res5664.result && res5664.result.isExprTerm) {
                    return step5608(ArrowFunTerm5403.create(head5609.id, rest5610[0], res5664.result.destruct(context5605)), res5664.rest, opCtx5611);
                } else {
                    throwSyntaxError5354("enforest", "Body of arrow function must be an expression", rest5610.slice(1));
                }
            } else if (head5609.isDelimiterTerm && head5609.delim.token.value === "()") {
                if ( // empty parens are acceptable but enforest
                // doesn't accept empty arrays so short
                // circuit here
                head5609.delim.token.inner.length === 0) {
                    return step5608(ParenExpressionTerm5423.create([EmptyTerm5391.create()], head5609.delim, []), rest5610, opCtx5611);
                } else {
                    var parenRes5652 = enforestParenExpression5467(head5609.delim, context5605);
                    if (parenRes5652) {
                        return step5608(parenRes5652, rest5610, opCtx5611);
                    }
                }
            } else if (head5609.isExprTerm && ((head5609.isIdTerm || head5609.isObjGetTerm || head5609.isObjDotGetTerm || head5609.isThisExpressionTerm) && rest5610[0] && rest5610[1] && !bopMacroObj5617 && stxIsAssignOp5461(rest5610[0]))) {
                var opRes5629 = enforestAssignment5466(rest5610, context5605, head5609, prevStx5606, prevTerms5607);
                if (opRes5629 && opRes5629.result) {
                    return step5608(opRes5629.result, opRes5629.rest, _5337.extend({}, opCtx5611, {
                        prevStx: opRes5629.prevStx,
                        prevTerms: opRes5629.prevTerms
                    }));
                }
            } else if (head5609.isExprTerm && (rest5610[0] && (unwrapSyntax5357(rest5610[0]) === "++" || unwrapSyntax5357(rest5610[0]) === "--"))) {
                if ( // Check if the operator is a macro first.
                hasSyntaxTransform5473(rest5610[0], context5605, context5605.phase)) {
                    var headStx5667 = tagWithTerm5481(head5609, head5609.destruct(context5605).reverse());
                    var opPrevStx5636 = headStx5667.concat(prevStx5606);
                    var opPrevTerms5637 = [head5609].concat(prevTerms5607);
                    var opRes5629 = enforest5478(rest5610, context5605, opPrevStx5636, opPrevTerms5637);
                    if (opRes5629.prevTerms.length < opPrevTerms5637.length) {
                        return opRes5629;
                    } else if (opRes5629.result) {
                        return step5608(head5609, opRes5629.result.destruct(context5605).concat(opRes5629.rest), opCtx5611);
                    }
                }
                return step5608(PostfixOpTerm5397.create(head5609, rest5610[0]), rest5610.slice(1), opCtx5611);
            } else if (head5609.isExprTerm && (rest5610[0] && rest5610[0].token.value === "[]")) {
                return step5608(ObjGetTerm5405.create(head5609, DelimiterTerm5371.create(rest5610[0])), rest5610.slice(1), opCtx5611);
            } else if (head5609.isExprTerm && (rest5610[0] && unwrapSyntax5357(rest5610[0]) === "." && !hasSyntaxTransform5473(rest5610[0], context5605, context5605.phase) && rest5610[1] && (rest5610[1].isIdentifier() || rest5610[1].isKeyword()))) {
                if ( // Check if the identifier is a macro first.
                hasSyntaxTransform5473(rest5610[1], context5605, context5605.phase)) {
                    var headStx5667 = tagWithTerm5481(head5609, head5609.destruct(context5605).reverse());
                    var dotTerm5672 = PuncTerm5370.create(rest5610[0]);
                    var dotTerms5673 = [dotTerm5672].concat(head5609, prevTerms5607);
                    var dotStx5674 = tagWithTerm5481(dotTerm5672, [rest5610[0]]).concat(headStx5667, prevStx5606);
                    var dotRes5675 = enforest5478(rest5610.slice(1), context5605, dotStx5674, dotTerms5673);
                    if (dotRes5675.prevTerms.length < dotTerms5673.length) {
                        return dotRes5675;
                    } else if (dotRes5675.result) {
                        return step5608(head5609, [rest5610[0]].concat(dotRes5675.result.destruct(context5605), dotRes5675.rest), opCtx5611);
                    }
                }
                return step5608(ObjDotGetTerm5404.create(head5609, rest5610[0], rest5610[1]), rest5610.slice(2), opCtx5611);
            } else if (head5609.isDelimiterTerm && head5609.delim.token.value === "[]") {
                return step5608(ArrayLiteralTerm5414.create(head5609), rest5610, opCtx5611);
            } else if (head5609.isDelimiterTerm && head5609.delim.token.value === "{}") {
                return step5608(BlockTerm5413.create(head5609), rest5610, opCtx5611);
            } else if (head5609.isIdTerm && unwrapSyntax5357(head5609.id) === "#quoteSyntax" && rest5610[0] && rest5610[0].token.value === "{}") {
                return step5608(QuoteSyntaxTerm5408.create(rest5610[0]), rest5610.slice(1), opCtx5611);
            } else if (head5609.isKeywordTerm && unwrapSyntax5357(head5609.keyword) === "return") {
                if (rest5610[0] && rest5610[0].token.lineNumber === head5609.keyword.token.lineNumber) {
                    var returnPrevStx5676 = tagWithTerm5481(head5609, head5609.destruct(context5605)).concat(opCtx5611.prevStx);
                    var returnPrevTerms5677 = [head5609].concat(opCtx5611.prevTerms);
                    var returnExpr5678 = enforest5478(rest5610, context5605, returnPrevStx5676, returnPrevTerms5677);
                    if (returnExpr5678.prevTerms.length < opCtx5611.prevTerms.length) {
                        return returnExpr5678;
                    }
                    if (returnExpr5678.result.isExprTerm) {
                        return step5608(ReturnStatementTerm5394.create(head5609, returnExpr5678.result), returnExpr5678.rest, opCtx5611);
                    }
                } else {
                    return step5608(ReturnStatementTerm5394.create(head5609, EmptyTerm5391.create()), rest5610, opCtx5611);
                }
            } else if (head5609.isKeywordTerm && unwrapSyntax5357(head5609.keyword) === "let") {
                var normalizedName5679;
                if (rest5610[0] && rest5610[0].isDelimiter() && rest5610[0].token.value === "()") {
                    normalizedName5679 = rest5610[0];
                } else {
                    normalizedName5679 = syn5339.makeDelim("()", [rest5610[0]], rest5610[0]);
                }
                var lsRes5680 = enforestVarStatement5465(rest5610, context5605, head5609.keyword);
                if (lsRes5680 && lsRes5680.result) {
                    return step5608(LetStatementTerm5421.create(head5609, lsRes5680.result), lsRes5680.rest, opCtx5611);
                }
            } else if (head5609.isKeywordTerm && unwrapSyntax5357(head5609.keyword) === "var" && rest5610[0]) {
                var vsRes5681 = enforestVarStatement5465(rest5610, context5605, head5609.keyword);
                if (vsRes5681 && vsRes5681.result) {
                    return step5608(VariableStatementTerm5420.create(head5609, vsRes5681.result), vsRes5681.rest, opCtx5611);
                }
            } else if (head5609.isKeywordTerm && unwrapSyntax5357(head5609.keyword) === "const" && rest5610[0]) {
                var csRes5682 = enforestVarStatement5465(rest5610, context5605, head5609.keyword);
                if (csRes5682 && csRes5682.result) {
                    return step5608(ConstStatementTerm5422.create(head5609, csRes5682.result), csRes5682.rest, opCtx5611);
                }
            } else if (head5609.isKeywordTerm && unwrapSyntax5357(head5609.keyword) === "for" && rest5610[0] && rest5610[0].token.value === "()") {
                return step5608(ForStatementTerm5393.create(head5609.keyword, rest5610[0]), rest5610.slice(1), opCtx5611);
            }
        } else {
            assert5352(head5609 && head5609.token, "assuming head is a syntax object");
            var macroObj5683 = expandCount5451 < maxExpands5452 && getSyntaxTransform5471([head5609].concat(rest5610), context5605, context5605.phase);
            if (head5609 && context5605.stopMap.has(resolve5346(head5609, context5605.phase))) {
                return step5608(StopQuotedTerm5409.create(head5609, rest5610[0]), rest5610.slice(1), opCtx5611);
            } else if (macroObj5683 && typeof macroObj5683.fn === "function" && !macroObj5683.isOp) {
                var rt5684 = expandMacro5476([head5609].concat(rest5610), context5605, opCtx5611, null, macroObj5683);
                var newOpCtx5685 = opCtx5611;
                if (rt5684.prevTerms && rt5684.prevTerms.length < opCtx5611.prevTerms.length) {
                    newOpCtx5685 = rewindOpCtx5479(opCtx5611, rt5684);
                }
                if (rt5684.result.length > 0) {
                    return step5608(rt5684.result[0], rt5684.result.slice(1).concat(rt5684.rest), newOpCtx5685);
                } else {
                    return step5608(EmptyTerm5391.create(), rt5684.rest, newOpCtx5685);
                }
            } else if (head5609.isIdentifier() && unwrapSyntax5357(head5609) === "stxrec" && resolve5346(head5609, context5605.phase) === "stxrec") {
                var normalizedName5679;
                if (rest5610[0] && rest5610[0].isDelimiter() && rest5610[0].token.value === "()") {
                    normalizedName5679 = rest5610[0];
                } else {
                    normalizedName5679 = syn5339.makeDelim("()", [rest5610[0]], rest5610[0]);
                }
                if (rest5610[1] && rest5610[1].isDelimiter()) {
                    return step5608(MacroTerm5385.create(normalizedName5679, rest5610[1].token.inner), rest5610.slice(2), opCtx5611);
                } else {
                    throwSyntaxError5354("enforest", "Macro declaration must include body", rest5610[1]);
                }
            } else if (head5609.isIdentifier() && head5609.token.value === "unaryop" && rest5610[0] && rest5610[0].isDelimiter() && rest5610[0].token.value === "()" && rest5610[1] && rest5610[1].isNumericLiteral() && rest5610[2] && rest5610[2].isDelimiter() && rest5610[2] && rest5610[2].token.value === "{}") {
                var trans5687 = enforest5478(rest5610[2].token.inner, context5605);
                return step5608(OperatorDefinitionTerm5387.create(syn5339.makeValue("unary", head5609), rest5610[0], rest5610[1], null, trans5687.result.body), rest5610.slice(3), opCtx5611);
            } else if (head5609.isIdentifier() && head5609.token.value === "binaryop" && rest5610[0] && rest5610[0].isDelimiter() && rest5610[0].token.value === "()" && rest5610[1] && rest5610[1].isNumericLiteral() && rest5610[2] && rest5610[2].isIdentifier() && rest5610[3] && rest5610[3].isDelimiter() && rest5610[3] && rest5610[3].token.value === "{}") {
                var trans5687 = enforest5478(rest5610[3].token.inner, context5605);
                return step5608(OperatorDefinitionTerm5387.create(syn5339.makeValue("binary", head5609), rest5610[0], rest5610[1], rest5610[2], trans5687.result.body), rest5610.slice(4), opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "function" && rest5610[0] && rest5610[0].isIdentifier() && rest5610[1] && rest5610[1].isDelimiter() && rest5610[1].token.value === "()" && rest5610[2] && rest5610[2].isDelimiter() && rest5610[2].token.value === "{}") {
                rest5610[1].token.inner = rest5610[1].token.inner;
                rest5610[2].token.inner = rest5610[2].token.inner;
                return step5608(NamedFunTerm5401.create(head5609, null, rest5610[0], rest5610[1], rest5610[2]), rest5610.slice(3), opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "function" && rest5610[0] && rest5610[0].isPunctuator() && rest5610[0].token.value === "*" && rest5610[1] && rest5610[1].isIdentifier() && rest5610[2] && rest5610[2].isDelimiter() && rest5610[2].token.value === "()" && rest5610[3] && rest5610[3].isDelimiter() && rest5610[3].token.value === "{}") {
                return step5608(NamedFunTerm5401.create(head5609, rest5610[0], rest5610[1], rest5610[2], rest5610[3]), rest5610.slice(4), opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "function" && rest5610[0] && rest5610[0].isDelimiter() && rest5610[0].token.value === "()" && rest5610[1] && rest5610[1].isDelimiter() && rest5610[1].token.value === "{}") {
                return step5608(AnonFunTerm5402.create(head5609, null, rest5610[0], rest5610[1]), rest5610.slice(2), opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "function" && rest5610[0] && rest5610[0].isPunctuator() && rest5610[0].token.value === "*" && rest5610[1] && rest5610[1].isDelimiter() && rest5610[1].token.value === "()" && rest5610[2] && rest5610[2].isDelimiter && rest5610[2].token.value === "{}") {
                rest5610[1].token.inner = rest5610[1].token.inner;
                rest5610[2].token.inner = rest5610[2].token.inner;
                return step5608(AnonFunTerm5402.create(head5609, rest5610[0], rest5610[1], rest5610[2]), rest5610.slice(3), opCtx5611);
            } else if ((head5609.isDelimiter() && head5609.token.value === "()" || head5609.isIdentifier()) && rest5610[0] && rest5610[0].isPunctuator() && resolve5346(rest5610[0], context5605.phase) === "=>" && rest5610[1] && rest5610[1].isDelimiter() && rest5610[1].token.value === "{}") {
                return step5608(ArrowFunTerm5403.create(head5609, rest5610[0], rest5610[1]), rest5610.slice(2), opCtx5611);
            } else if (head5609.isIdentifier() && head5609.token.value === "forPhase" && rest5610[0] && rest5610[0].isNumericLiteral() && rest5610[1] && rest5610[1].isDelimiter()) {
                return step5608(ForPhaseTerm5388.create(rest5610[0], rest5610[1].token.inner), rest5610.slice(2), opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "catch" && rest5610[0] && rest5610[0].isDelimiter() && rest5610[0].token.value === "()" && rest5610[1] && rest5610[1].isDelimiter() && rest5610[1].token.value === "{}") {
                rest5610[0].token.inner = rest5610[0].token.inner;
                rest5610[1].token.inner = rest5610[1].token.inner;
                return step5608(CatchClauseTerm5392.create(head5609, rest5610[0], rest5610[1]), rest5610.slice(2), opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "this") {
                return step5608(ThisExpressionTerm5411.create(head5609), rest5610, opCtx5611);
            } else if (head5609.isNumericLiteral() || head5609.isStringLiteral() || head5609.isBooleanLiteral() || head5609.isRegularExpression() || head5609.isNullLiteral()) {
                return step5608(LitTerm5412.create(head5609), rest5610, opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "import") {
                var imp5689 = enforestImport5464(head5609, rest5610);
                return step5608(imp5689.result, imp5689.rest, opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "export" && rest5610[0] && rest5610[0].isDelimiter()) {
                return step5608(ExportNameTerm5381.create(head5609, rest5610[0]), rest5610.slice(1), opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "export" && rest5610[0] && rest5610[0].isKeyword() && unwrapSyntax5357(rest5610[0]) === "default" && rest5610[1]) {
                var res5664 = enforest5478(rest5610.slice(1), context5605);
                return step5608(ExportDefaultTerm5382.create(head5609, rest5610[0], res5664.result), res5664.rest, opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "export" && rest5610[0]) {
                var res5664 = enforest5478(rest5610, context5605);
                return step5608(ExportDeclTerm5383.create(head5609, res5664.result), res5664.rest, opCtx5611);
            } else if (head5609.isIdentifier()) {
                return step5608(IdTerm5415.create(head5609), rest5610, opCtx5611);
            } else if (head5609.isPunctuator()) {
                return step5608(PuncTerm5370.create(head5609), rest5610, opCtx5611);
            } else if (head5609.isKeyword() && unwrapSyntax5357(head5609) === "with") {
                throwSyntaxError5354("enforest", "with is not supported in sweet.js", head5609);
            } else if (head5609.isKeyword()) {
                return step5608(KeywordTerm5369.create(head5609), rest5610, opCtx5611);
            } else if (head5609.isDelimiter()) {
                return step5608(DelimiterTerm5371.create(head5609), rest5610, opCtx5611);
            } else if (head5609.isTemplate()) {
                return step5608(TemplateTerm5406.create(head5609), rest5610, opCtx5611);
            } else if (head5609.isEOF()) {
                assert5352(rest5610.length === 0, "nothing should be after an EOF");
                return step5608(EOFTerm5368.create(head5609), [], opCtx5611);
            } else {
                // todo: are we missing cases?
                assert5352(false, "not implemented");
            }
        }
        if ( // Potentially an infix macro
        // This should only be invoked on runtime syntax terms
        !head5609.isMacroTerm && !head5609.isAnonMacroTerm && !head5609.isOperatorDefinitionTerm && rest5610.length && hasSyntaxTransform5473(rest5610, context5605, context5605.phase) && getSyntaxTransform5471(rest5610, context5605, context5605.phase).isOp === false) {
            var infLeftTerm5692 = opCtx5611.prevTerms[0] && opCtx5611.prevTerms[0].isPartialTerm ? opCtx5611.prevTerms[0] : null;
            var infTerm5693 = PartialExpressionTerm5418.create(head5609.destruct(context5605), infLeftTerm5692, function () {
                return step5608(head5609, [], opCtx5611);
            });
            var infPrevStx5694 = tagWithTerm5481(infTerm5693, head5609.destruct(context5605)).reverse().concat(opCtx5611.prevStx);
            var infPrevTerms5695 = [infTerm5693].concat(opCtx5611.prevTerms);
            var infRes5696 = expandMacro5476(rest5610, context5605, {
                prevStx: infPrevStx5694,
                prevTerms: infPrevTerms5695
            });
            if (infRes5696.prevTerms && infRes5696.prevTerms.length < infPrevTerms5695.length) {
                var infOpCtx5697 = rewindOpCtx5479(opCtx5611, infRes5696);
                return step5608(infRes5696.result[0], infRes5696.result.slice(1).concat(infRes5696.rest), infOpCtx5697);
            } else {
                return step5608(head5609, infRes5696.result.concat(infRes5696.rest), opCtx5611);
            }
        }
        var // done with current step so combine and continue on
        combResult5613 = opCtx5611.combine(head5609);
        if (opCtx5611.stack.length === 0) {
            return {
                result: combResult5613.term,
                rest: rest5610,
                prevStx: combResult5613.prevStx,
                prevTerms: combResult5613.prevTerms
            };
        } else {
            return step5608(combResult5613.term, rest5610, opCtx5611.stack[0]);
        }
    }
    return step5608(toks5604[0], toks5604.slice(1), {
        combine: function combine(t5698) {
            return {
                term: t5698,
                prevStx: prevStx5606,
                prevTerms: prevTerms5607
            };
        },
        prec: 0,
        stack: [],
        op: null,
        prevStx: prevStx5606,
        prevTerms: prevTerms5607
    });
}
function rewindOpCtx5479(opCtx5699, res5700) {
    if ( // If we've consumed all pending operators, we can just start over.
    // It's important that we always thread the new prevStx and prevTerms
    // through, otherwise the old ones will still persist.
    !res5700.prevTerms.length || !res5700.prevTerms[0].isPartialTerm) {
        return _5337.extend({}, opCtx5699, {
            combine: function combine(t5704) {
                return {
                    term: t5704,
                    prevStx: res5700.prevStx,
                    prevTerms: res5700.prevTerms
                };
            },
            prec: 0,
            op: null,
            stack: [],
            prevStx: res5700.prevStx,
            prevTerms: res5700.prevTerms
        });
    }
    // To rewind, we need to find the first (previous) pending operator. It
    // acts as a marker in the opCtx to let us know how far we need to go
    // back.
    var op5701 = null;
    for (var i5702 = 0; i5702 < res5700.prevTerms.length; i5702++) {
        if (!res5700.prevTerms[i5702].isPartialTerm) {
            break;
        }
        if (res5700.prevTerms[i5702].isPartialOperationTerm) {
            op5701 = res5700.prevTerms[i5702];
            break;
        }
    }
    if ( // If the op matches the current opCtx, we don't need to rewind
    // anything, but we still need to persist the prevStx and prevTerms.
    opCtx5699.op === op5701) {
        return _5337.extend({}, opCtx5699, {
            prevStx: res5700.prevStx,
            prevTerms: res5700.prevTerms
        });
    }
    for (var i5702 = 0; i5702 < opCtx5699.stack.length; i5702++) {
        if (opCtx5699.stack[i5702].op === op5701) {
            return _5337.extend({}, opCtx5699.stack[i5702], {
                prevStx: res5700.prevStx,
                prevTerms: res5700.prevTerms
            });
        }
    }
    assert5352(false, "Rewind failed.");
}
function get_expression5480(stx5705, context5706) {
    if (stx5705[0].term) {
        for (var termLen5708 = 1; termLen5708 < stx5705.length; termLen5708++) {
            if (stx5705[termLen5708].term !== stx5705[0].term) {
                break;
            }
        }
        if ( // Guard the termLen because we can have a multi-token term that
        // we don't want to split. TODO: is there something we can do to
        // get around this safely?
        stx5705[0].term.isPartialExpressionTerm && termLen5708 === stx5705[0].term.stx.length) {
            var expr5709 = stx5705[0].term.combine().result;
            for (var i5710 = 1, term5711 = stx5705[0].term; i5710 < stx5705.length; i5710++) {
                if (stx5705[i5710].term !== term5711) {
                    if (term5711 && term5711.isPartialTerm) {
                        term5711 = term5711.left;
                        i5710--;
                    } else {
                        break;
                    }
                }
            }
            return {
                result: expr5709,
                rest: stx5705.slice(i5710)
            };
        } else if (stx5705[0].term.isExprTerm) {
            return {
                result: stx5705[0].term,
                rest: stx5705.slice(termLen5708)
            };
        } else {
            return {
                result: null,
                rest: stx5705
            };
        }
    }
    var res5707 = enforest5478(stx5705, context5706);
    if (!res5707.result || !res5707.result.isExprTerm) {
        return {
            result: null,
            rest: stx5705
        };
    }
    return res5707;
}
function tagWithTerm5481(term5712, stx5713) {
    return stx5713.map(function (s5714) {
        s5714 = s5714.clone();
        s5714.term = term5712;
        return s5714;
    });
}
function applyMarkToPatternEnv5482(newMark5715, env5716) {
    function dfs5717(match5718) {
        if (match5718.level === 0) {
            // replace the match property with the marked syntax
            match5718.match = _5337.map(match5718.match, function (stx5719) {
                return stx5719.mark(newMark5715);
            });
        } else {
            _5337.each(match5718.match, function (match5720) {
                dfs5717(match5720);
            });
        }
    }
    _5337.keys(env5716).forEach(function (key5721) {
        dfs5717(env5716[key5721]);
    });
}
function markIn5483(arr5722, mark5723) {
    return arr5722.map(function (stx5724) {
        return stx5724.mark(mark5723);
    });
}
function markDefOut5484(arr5725, mark5726, def5727) {
    return arr5725.map(function (stx5728) {
        return stx5728.mark(mark5726);
    });
}
function loadMacroDef5485(body5729, context5730, phase5731) {
    var expanded5732 = body5729[0].destruct(context5730, { stripCompileTerm: true });
    var stub5733 = parser5338.read("()");
    stub5733[0].token.inner = expanded5732;
    var flattend5734 = flatten5505(stub5733);
    var bodyCode5735 = codegen5336.generate(parser5338.parse(flattend5734, { phase: phase5731 }));
    var localCtx5736;
    var macroGlobal5737 = {
        makeValue: syn5339.makeValue,
        makeRegex: syn5339.makeRegex,
        makeIdent: syn5339.makeIdent,
        makeKeyword: syn5339.makeKeyword,
        makePunc: syn5339.makePunc,
        makeDelim: syn5339.makeDelim,
        localExpand: function localExpand(stx5739, stop5740) {
            stop5740 = stop5740 || [];
            var markedStx5741 = markIn5483(stx5739, localCtx5736.mark);
            var stopMap5742 = new StringMap5341();
            stop5740.forEach(function (stop5746) {
                stopMap5742.set(resolve5346(stop5746, localCtx5736.phase), true);
            });
            var localExpandCtx5743 = makeExpanderContext5489(_5337.extend({}, localCtx5736, { stopMap: stopMap5742 }));
            var terms5744 = expand5488(markedStx5741, localExpandCtx5743);
            var newStx5745 = terms5744.reduce(function (acc5747, term5748) {
                acc5747.push.apply(acc5747, term5748.destruct(localCtx5736, { stripCompileTerm: true }));
                return acc5747;
            }, []);
            return markDefOut5484(newStx5745, localCtx5736.mark, localCtx5736.defscope);
        },
        filename: context5730.filename,
        getExpr: function getExpr(stx5749) {
            if (stx5749.length === 0) {
                return {
                    success: false,
                    result: [],
                    rest: []
                };
            }
            var markedStx5750 = markIn5483(stx5749, localCtx5736.mark);
            var r5751 = get_expression5480(markedStx5750, localCtx5736);
            return {
                success: r5751.result !== null,
                result: r5751.result === null ? [] : markDefOut5484(r5751.result.destruct(localCtx5736, { stripCompileTerm: true }), localCtx5736.mark, localCtx5736.defscope),
                rest: markDefOut5484(r5751.rest, localCtx5736.mark, localCtx5736.defscope)
            };
        },
        getIdent: function getIdent(stx5752) {
            if (stx5752[0] && stx5752[0].isIdentifier()) {
                return {
                    success: true,
                    result: [stx5752[0]],
                    rest: stx5752.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5752
            };
        },
        getLit: function getLit(stx5753) {
            if (stx5753[0] && patternModule5350.typeIsLiteral(stx5753[0].token.type)) {
                return {
                    success: true,
                    result: [stx5753[0]],
                    rest: stx5753.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5753
            };
        },
        unwrapSyntax: syn5339.unwrapSyntax,
        throwSyntaxError: throwSyntaxError5354,
        throwSyntaxCaseError: throwSyntaxCaseError5355,
        prettyPrint: syn5339.prettyPrint,
        parser: parser5338,
        __fresh: fresh5363,
        __freshScope: freshScope5364,
        __scope: context5730.scope,
        __bindings: context5730.bindings,
        _: _5337,
        patternModule: patternModule5350,
        getPattern: function getPattern(id5754) {
            return context5730.patternMap.get(id5754);
        },
        getPatternMap: function getPatternMap() {
            return context5730.patternMap;
        },
        getTemplate: function getTemplate(id5755) {
            assert5352(context5730.templateMap.has(id5755), "missing template");
            return syn5339.cloneSyntaxArray(context5730.templateMap.get(id5755));
        },
        getTemplateMap: function getTemplateMap() {
            // the template map is global across all context during compilation
            return context5730.templateMap;
        },
        applyMarkToPatternEnv: applyMarkToPatternEnv5482,
        mergeMatches: function mergeMatches(newMatch5756, oldMatch5757) {
            newMatch5756.patternEnv = _5337.extend({}, oldMatch5757.patternEnv, newMatch5756.patternEnv);
            return newMatch5756;
        },
        console: console
    };
    context5730.env.keysStr().forEach(function (key5758) {
        var val5759 = context5730.env.getStr(key5758);
        if ( // load the runtime values into the global object
        val5759 && val5759 instanceof RuntimeValue5469) {
            macroGlobal5737[key5758] = val5759.trans.value;
        }
    });
    context5730.store.keysStr().forEach(function (key5760) {
        var val5761 = context5730.store.getStr(key5760);
        if ( // load the runtime values into the global object
        val5761 && val5761 instanceof RuntimeValue5469) {
            macroGlobal5737[key5760] = val5761.trans.value;
        }
    });
    var macroFn5738 = scopedEval5447(bodyCode5735, macroGlobal5737);
    return function (stx5762, context5763, prevStx5764, prevTerms5765) {
        localCtx5736 = context5763;
        return macroFn5738(stx5762, context5763, prevStx5764, prevTerms5765);
    };
}
function expandToTermTree5486(stx5766, context5767) {
    assert5352(context5767, "expander context is required");
    var f5768, head5769, prevStx5770, restStx5771, prevTerms5772, macroDefinition5773;
    var rest5774 = stx5766;
    while (rest5774.length > 0) {
        assert5352(rest5774[0].token, "expecting a syntax object");
        f5768 = enforest5478(rest5774, context5767, prevStx5770, prevTerms5772);
        // head :: TermTree
        head5769 = f5768.result;
        // rest :: [Syntax]
        rest5774 = f5768.rest;
        if (!head5769) {
            // no head means the expansions stopped prematurely (for stepping)
            restStx5771 = rest5774;
            break;
        }
        var destructed5775 = tagWithTerm5481(head5769, f5768.result.destruct(context5767));
        prevTerms5772 = [head5769].concat(f5768.prevTerms);
        prevStx5770 = destructed5775.reverse().concat(f5768.prevStx);
        if (head5769.isImportTerm) {
            var // record the import in the module record for easier access
            entries5776 = context5767.moduleRecord.addImport(head5769);
            var // load up the (possibly cached) import module
            importMod5777 = loadImport5498(unwrapSyntax5357(head5769.from), context5767, context5767.moduleRecord.name);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5767 = visit5497(importMod5777.term, importMod5777.record, context5767.phase, context5767);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5499(entries5776, importMod5777.term, importMod5777.record, context5767, context5767.phase);
        }
        if (head5769.isImportForPhaseTerm) {
            var // record the import in the module record for easier access
            entries5776 = context5767.moduleRecord.addImport(head5769);
            var // load up the (possibly cached) import module
            importMod5777 = loadImport5498(unwrapSyntax5357(head5769.from), context5767, context5767.moduleRecord.name);
            // invoking an imported module loads the runtime values
            // into the environment for this phase
            context5767 = invoke5495(importMod5777.term, importMod5777.record, context5767.phase + head5769.phase.token.value, context5767);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5767 = visit5497(importMod5777.term, importMod5777.record, context5767.phase + head5769.phase.token.value, context5767);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5499(entries5776, importMod5777.term, importMod5777.record, context5767, context5767.phase);
        }
        if (head5769.isForPhaseTerm) {
            var phaseShiftedContext5780 = makeExpanderContext5489(_5337.defaults({ phase: context5767.phase + head5769.phase.token.value }, context5767));
            head5769.body = expand5488(head5769.body, phaseShiftedContext5780);
        }
        if ((head5769.isExportDefaultTerm && head5769.decl.isMacroTerm || head5769.isMacroTerm) && expandCount5451 < maxExpands5452) {
            var macroDecl5781 = head5769.isExportDefaultTerm ? head5769.decl : head5769;
            if (!( // raw function primitive form
            macroDecl5781.body[0] && macroDecl5781.body[0].isKeyword() && macroDecl5781.body[0].token.value === "function")) {
                throwSyntaxError5354("load macro", "Primitive macro form must contain a function for the macro body", macroDecl5781.body);
            }
            // expand the body
            macroDecl5781.body = expand5488(macroDecl5781.body, makeExpanderContext5489(_5337.defaults({ phase: context5767.phase + 1 }, context5767)));
            //  and load the macro definition into the environment
            macroDefinition5773 = loadMacroDef5485(macroDecl5781.body, context5767, context5767.phase + 1);
            var fullName5782 = macroDecl5781.name.token.inner;
            var multiTokName5783 = makeMultiToken5365(macroDecl5781.name);
            multiTokName5783 = multiTokName5783.delScope(context5767.useScope);
            context5767.bindings.add(multiTokName5783, fresh5363(), context5767.phase);
            context5767.env.set(multiTokName5783, context5767.phase, new CompiletimeValue5468(new SyntaxTransform5344(macroDefinition5773, false, builtinMode5450, fullName5782), context5767.moduleRecord.name, context5767.phase));
        }
        if (head5769.isOperatorDefinitionTerm) {
            if (!( // raw function primitive form
            head5769.body[0] && head5769.body[0].isKeyword() && head5769.body[0].token.value === "function")) {
                throwSyntaxError5354("load macro", "Primitive macro form must contain a function for the macro body", head5769.body);
            }
            // expand the body
            head5769.body = expand5488(head5769.body, makeExpanderContext5489(_5337.defaults({ phase: context5767.phase + 1 }, context5767)));
            var //  and load the macro definition into the environment
            opDefinition5784 = loadMacroDef5485(head5769.body, context5767, context5767.phase + 1);
            var fullName5782 = head5769.name.token.inner;
            var multiTokName5783 = makeMultiToken5365(head5769.name);
            multiTokName5783 = multiTokName5783.delScope(context5767.useScope);
            context5767.bindings.add(multiTokName5783, fresh5363(), context5767.phase);
            var opObj5787 = getSyntaxTransform5471(multiTokName5783, context5767, context5767.phase);
            if (!opObj5787) {
                opObj5787 = {
                    isOp: true,
                    builtin: builtinMode5450,
                    fullName: fullName5782
                };
            }
            assert5352(unwrapSyntax5357(head5769.type) === "binary" || unwrapSyntax5357(head5769.type) === "unary", "operator must either be binary or unary");
            opObj5787[unwrapSyntax5357(head5769.type)] = {
                fn: opDefinition5784,
                prec: head5769.prec.token.value,
                assoc: head5769.assoc ? head5769.assoc.token.value : null
            };
            context5767.env.set(multiTokName5783, context5767.phase, new CompiletimeValue5468(opObj5787, context5767.moduleRecord.name, context5767.phase));
        }
        if (head5769.isNamedFunTerm) {
            // addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            head5769.name = head5769.name.delScope(context5767.useScope);
            context5767.bindings.add(head5769.name, fresh5363(), context5767.phase);
            context5767.env.set(head5769.name, context5767.phase, new CompiletimeValue5468(new VarTransform5345(head5769.name), context5767.moduleRecord.name, context5767.phase));
        }
        if (head5769.isVariableStatementTerm || head5769.isLetStatementTerm || head5769.isConstStatementTerm) {
            head5769.decls = head5769.decls.map(function (decl5788) {
                decl5788.ident = decl5788.ident.delScope(context5767.useScope);
                context5767.bindings.add(decl5788.ident, fresh5363(), context5767.phase);
                context5767.env.set(decl5788.ident, context5767.phase, new CompiletimeValue5468(new VarTransform5345(decl5788.ident), context5767.moduleRecord.name, context5767.name));
                return decl5788;
            });
        }
        if (head5769.isBlockTerm && head5769.body.isDelimiterTerm) {
            head5769.body.delim.token.inner.forEach(function (term5789) {
                if (term5789.isVariableStatementTerm) {
                    term5789.decls = term5789.decls.map(function (decl5790) {
                        decl5790.ident = decl5790.ident.delScope(context5767.useScope);
                        context5767.bindings.add(decl5790.ident, fresh5363(), context5767.phase);
                        return decl5790;
                    });
                }
            });
        }
        if (head5769.isDelimiterTerm) {
            head5769.delim.token.inner.forEach(function (term5791) {
                if (term5791.isVariableStatementTerm) {
                    term5791.decls = term5791.decls.map(function (decl5792) {
                        decl5792.ident = decl5792.ident.delScope(context5767.useScope);
                        context5767.bindings.add(decl5792.ident, fresh5363(), context5767.phase);
                        return decl5792;
                    });
                }
            });
        }
        if (head5769.isForStatementTerm) {
            var forCond5793 = head5769.cond.token.inner;
            if (forCond5793[0] && resolve5346(forCond5793[0], context5767.phase) === "let" && forCond5793[1] && forCond5793[1].isIdentifier()) {
                var letNew5794 = fresh5363();
                var letId5795 = forCond5793[1];
                forCond5793 = forCond5793.map(function (stx5796) {
                    return stx5796.rename(letId5795, letNew5794);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head5769.cond.token.inner = expand5488([forCond5793[0]], context5767).concat(expand5488(forCond5793.slice(1), context5767));
                if ( // nice and easy case: `for (...) { ... }`
                rest5774[0] && rest5774[0].token.value === "{}") {
                    rest5774[0] = rest5774[0].rename(letId5795, letNew5794);
                } else {
                    var // need to deal with things like `for (...) if (...) log(...)`
                    bodyEnf5797 = enforest5478(rest5774, context5767);
                    var bodyDestructed5798 = bodyEnf5797.result.destruct(context5767);
                    var renamedBodyTerm5799 = bodyEnf5797.result.rename(letId5795, letNew5794);
                    tagWithTerm5481(renamedBodyTerm5799, bodyDestructed5798);
                    rest5774 = bodyEnf5797.rest;
                    prevStx5770 = bodyDestructed5798.reverse().concat(prevStx5770);
                    prevTerms5772 = [renamedBodyTerm5799].concat(prevTerms5772);
                }
            } else {
                head5769.cond.token.inner = expand5488(head5769.cond.token.inner, context5767);
            }
        }
    }
    return {
        // prevTerms are stored in reverse for the purposes of infix
        // lookbehind matching, so we need to re-reverse them.
        terms: prevTerms5772 ? prevTerms5772.reverse() : [],
        restStx: restStx5771,
        context: context5767
    };
}
function expandTermTreeToFinal5487(term5800, context5801) {
    assert5352(context5801 && context5801.env, "environment map is required");
    if (term5800.isArrayLiteralTerm) {
        term5800.array.delim.token.inner = expand5488(term5800.array.delim.token.inner, context5801);
        return term5800;
    } else if (term5800.isBlockTerm) {
        term5800.body.delim.token.inner = expand5488(term5800.body.delim.token.inner, context5801);
        return term5800;
    } else if (term5800.isParenExpressionTerm) {
        term5800.args = _5337.map(term5800.args, function (arg5802) {
            return expandTermTreeToFinal5487(arg5802, context5801);
        });
        return term5800;
    } else if (term5800.isCallTerm) {
        term5800.fun = expandTermTreeToFinal5487(term5800.fun, context5801);
        term5800.args = expandTermTreeToFinal5487(term5800.args, context5801);
        return term5800;
    } else if (term5800.isReturnStatementTerm) {
        term5800.expr = expandTermTreeToFinal5487(term5800.expr, context5801);
        return term5800;
    } else if (term5800.isUnaryOpTerm) {
        term5800.expr = expandTermTreeToFinal5487(term5800.expr, context5801);
        return term5800;
    } else if (term5800.isBinOpTerm || term5800.isAssignmentExpressionTerm) {
        term5800.left = expandTermTreeToFinal5487(term5800.left, context5801);
        term5800.right = expandTermTreeToFinal5487(term5800.right, context5801);
        return term5800;
    } else if (term5800.isObjGetTerm) {
        term5800.left = expandTermTreeToFinal5487(term5800.left, context5801);
        term5800.right.delim.token.inner = expand5488(term5800.right.delim.token.inner, context5801);
        return term5800;
    } else if (term5800.isObjDotGetTerm) {
        term5800.left = expandTermTreeToFinal5487(term5800.left, context5801);
        term5800.right = expandTermTreeToFinal5487(term5800.right, context5801);
        return term5800;
    } else if (term5800.isConditionalExpressionTerm) {
        term5800.cond = expandTermTreeToFinal5487(term5800.cond, context5801);
        term5800.tru = expandTermTreeToFinal5487(term5800.tru, context5801);
        term5800.fls = expandTermTreeToFinal5487(term5800.fls, context5801);
        return term5800;
    } else if (term5800.isVariableDeclarationTerm) {
        if (term5800.init) {
            term5800.init = expandTermTreeToFinal5487(term5800.init, context5801);
        }
        return term5800;
    } else if (term5800.isVariableStatementTerm) {
        term5800.decls = _5337.map(term5800.decls, function (decl5803) {
            return expandTermTreeToFinal5487(decl5803, context5801);
        });
        return term5800;
    } else if (term5800.isDelimiterTerm) {
        // expand inside the delimiter and then continue on
        term5800.delim.token.inner = expand5488(term5800.delim.token.inner, context5801);
        return term5800;
    } else if (term5800.isIdTerm) {
        var varTrans5804 = getCompiletimeValue5470(term5800.id, context5801, context5801.phase);
        if (varTrans5804 instanceof VarTransform5345) {
            term5800.id = syntaxFromToken5448(term5800.id.token, varTrans5804.id);
        }
        return term5800;
    } else if (term5800.isNamedFunTerm || term5800.isAnonFunTerm || term5800.isCatchClauseTerm || term5800.isArrowFunTerm || term5800.isModuleTerm) {
        var newDef5805;
        var paramSingleIdent5808;
        var params5809;
        var bodies5810;
        var paramNames5811;
        var bodyContext5812;
        var renamedBody5813;
        var expandedResult5814;
        var bodyTerms5815;
        var renamedParams5816;
        var flatArgs5817;
        var puncCtx5823;
        var expandedArgs5818;

        var _ret = (function () {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            newDef5805 = [];

            var scope5806 = freshScope5364(context5801.bindings);
            var useScope5807 = freshScope5364(context5801.bindings);
            paramSingleIdent5808 = term5800.params && term5800.params.isIdentifier();

            if (term5800.params && term5800.params.isDelimiter()) {
                params5809 = term5800.params;
            } else if (paramSingleIdent5808) {
                params5809 = term5800.params;
            } else {
                params5809 = syn5339.makeDelim("()", [], null);
            }

            if (Array.isArray(term5800.body)) {
                bodies5810 = syn5339.makeDelim("{}", term5800.body, null);
            } else {
                bodies5810 = term5800.body;
            }
            paramNames5811 = _5337.map(getParamIdentifiers5455(params5809), function (param5819) {
                var paramNew5820 = param5819.mark(scope5806);
                context5801.bindings.add(paramNew5820, fresh5363(), context5801.phase);
                context5801.env.set(paramNew5820, context5801.phase, new CompiletimeValue5468(new VarTransform5345(paramNew5820), context5801.moduleRecord.name, context5801.phase));
                return {
                    originalParam: param5819,
                    renamedParam: paramNew5820
                };
            });
            bodyContext5812 = makeExpanderContext5489(_5337.defaults({
                scope: scope5806,
                useScope: useScope5807,
                defscope: newDef5805,
                // paramscope is used to filter out var redeclarations
                paramscope: paramNames5811.map(function (p5821) {
                    return p5821.renamedParam;
                })
            }, context5801));
            renamedBody5813 = bodies5810.mark(scope5806);
            expandedResult5814 = expandToTermTree5486(renamedBody5813.token.inner, bodyContext5812);
            bodyTerms5815 = expandedResult5814.terms;

            if (expandedResult5814.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody5813.token.inner = expandedResult5814.terms.concat(expandedResult5814.restStx);
                if (Array.isArray(term5800.body)) {
                    term5800.body = renamedBody5813.token.inner;
                } else {
                    term5800.body = renamedBody5813;
                }
                return {
                    v: term5800
                };
            }
            renamedParams5816 = _5337.map(paramNames5811, function (p5822) {
                return p5822.renamedParam;
            });

            if (paramSingleIdent5808) {
                flatArgs5817 = renamedParams5816[0];
            } else {
                puncCtx5823 = term5800.params || null;

                flatArgs5817 = syn5339.makeDelim("()", joinSyntax5449(renamedParams5816, syn5339.makePunc(",", puncCtx5823)), puncCtx5823);
            }
            expandedArgs5818 = expand5488([flatArgs5817], bodyContext5812);

            assert5352(expandedArgs5818.length === 1, "should only get back one result");
            if ( // stitch up the function with all the renamings
            term5800.params) {
                term5800.params = expandedArgs5818[0];
            }
            bodyTerms5815 = _5337.map(bodyTerms5815, function (bodyTerm5824) {
                if ( // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                bodyTerm5824.isBlockTerm) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal5825 = expandTermTreeToFinal5487(bodyTerm5824, expandedResult5814.context);
                    return blockFinal5825;
                } else {
                    var termWithCtx5826 = bodyTerm5824;
                    // finish expansion
                    return expandTermTreeToFinal5487(termWithCtx5826, expandedResult5814.context);
                }
            });
            if (term5800.isModuleTerm) {
                bodyTerms5815.forEach(function (bodyTerm5827) {
                    if (bodyTerm5827.isExportNameTerm || bodyTerm5827.isExportDeclTerm || bodyTerm5827.isExportDefaultTerm) {
                        context5801.moduleRecord.addExport(bodyTerm5827);
                    }
                });
            }
            renamedBody5813.token.inner = bodyTerms5815;
            if (Array.isArray(term5800.body)) {
                term5800.body = renamedBody5813.token.inner;
            } else {
                term5800.body = renamedBody5813;
            }
            // and continue expand the rest
            return {
                v: term5800
            };
        })();

        if (typeof _ret === "object") return _ret.v;
    }
    // the term is fine as is
    return term5800;
}
function expand5488(stx5828, context5829) {
    assert5352(context5829, "must provide an expander context");
    var trees5830 = expandToTermTree5486(stx5828, context5829);
    var terms5831 = _5337.map(trees5830.terms, function (term5832) {
        return expandTermTreeToFinal5487(term5832, trees5830.context);
    });
    if (trees5830.restStx) {
        terms5831.push.apply(terms5831, trees5830.restStx);
    }
    return terms5831;
}
function makeExpanderContext5489(o5833) {
    o5833 = o5833 || {};
    var env5834 = o5833.env || new NameMap5342();
    var store5835 = o5833.store || new NameMap5342();
    var bindings5836 = o5833.bindings || new BindingMap5343();
    return Object.create(Object.prototype, {
        filename: {
            value: o5833.filename,
            writable: false,
            enumerable: true,
            configurable: false
        },
        compileSuffix: {
            value: o5833.compileSuffix || ".jsc",
            writable: false,
            enumerable: true,
            configurable: false
        },
        env: {
            value: env5834,
            writable: false,
            enumerable: true,
            configurable: false
        },
        store: {
            value: store5835,
            writable: false,
            enumerable: true,
            configurable: false
        },
        defscope: {
            value: o5833.defscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        paramscope: {
            value: o5833.paramscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        templateMap: {
            value: o5833.templateMap || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        patternMap: {
            value: o5833.patternMap || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        mark: {
            value: o5833.mark,
            writable: false,
            enumerable: true,
            configurable: false
        },
        bindings: {
            value: bindings5836,
            writable: false,
            enumerable: true,
            configurable: false
        },
        scope: {
            value: o5833.scope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        useScope: {
            value: o5833.useScope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        phase: {
            value: o5833.phase || 0,
            writable: false,
            enumerable: true,
            configurable: false
        },
        implicitImport: {
            value: o5833.implicitImport || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        stopMap: {
            value: o5833.stopMap || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        moduleRecord: {
            value: o5833.moduleRecord || {},
            writable: false,
            enumerable: true,
            configurable: false
        }
    });
}
function makeModuleExpanderContext5490(filename5837, templateMap5838, patternMap5839, phase5840, moduleRecord5841, compileSuffix5842, bindings5843) {
    return makeExpanderContext5489({
        filename: filename5837,
        templateMap: templateMap5838,
        patternMap: patternMap5839,
        phase: phase5840,
        moduleRecord: moduleRecord5841,
        compileSuffix: compileSuffix5842,
        bindings: bindings5843
    });
}
function resolvePath5491(name5844, parent5845) {
    var path5846 = require("path");
    var resolveSync5847 = require("resolve/lib/sync");
    var root5848 = path5846.dirname(parent5845);
    var fs5849 = require("fs");
    if (name5844[0] === ".") {
        name5844 = path5846.resolve(root5848, name5844);
    }
    return resolveSync5847(name5844, {
        basedir: root5848,
        extensions: [".js", ".sjs"]
    });
}
function defaultImportStx5492(importPath5850, ctx5851) {
    var rtNames5852 = ["stxnonrec", "stxrec", "macroclass", "operator"];
    var ctNames5853 = ["quoteSyntax", "syntax", "#", "syntaxCase", "stxnonrec", "stxrec", "withSyntax", "letstx", "macroclass", "operator"];
    var importNames5854 = rtNames5852.map(function (name5858) {
        return syn5339.makeIdent(name5858, ctx5851);
    });
    var importForMacrosNames5855 = ctNames5853.map(function (name5859) {
        return syn5339.makeIdent(name5859, ctx5851);
    });
    var // import { names ... } from "importPath" for phase 1
    importForMacrosStmt5856 = [syn5339.makeKeyword("import", ctx5851), syn5339.makeDelim("{}", joinSyntax5449(importForMacrosNames5855, syn5339.makePunc(",", ctx5851)), ctx5851), syn5339.makeIdent("from", ctx5851), syn5339.makeValue(importPath5850, ctx5851), syn5339.makeKeyword("for", ctx5851), syn5339.makeIdent("phase", ctx5851), syn5339.makeValue(1, ctx5851)];
    var // import { names ... } from "importPath"
    importStmt5857 = [syn5339.makeKeyword("import", ctx5851), syn5339.makeDelim("{}", joinSyntax5449(importNames5854, syn5339.makePunc(",", ctx5851)), ctx5851), syn5339.makeIdent("from", ctx5851), syn5339.makeValue(importPath5850, ctx5851)];
    return importStmt5857.concat(importForMacrosStmt5856);
}
function createModule5493(name5860, body5861) {
    var language5862 = "base";
    var modBody5863 = body5861;
    if (body5861 && body5861[0] && body5861[1] && body5861[2] && unwrapSyntax5357(body5861[0]) === "#" && unwrapSyntax5357(body5861[1]) === "lang" && body5861[2].isStringLiteral()) {
        language5862 = unwrapSyntax5357(body5861[2]);
        // consume optional semicolon
        modBody5863 = body5861[3] && body5861[3].token.value === ";" && body5861[3].isPunctuator() ? body5861.slice(4) : body5861.slice(3);
    }
    if ( // insert the default import statements into the module body
    language5862 !== "base" && language5862 !== "js") {
        // "base" and "js" are currently special languages meaning don't
        // insert the default imports
        modBody5863 = defaultImportStx5492(language5862, body5861[0]).concat(modBody5863);
    }
    return {
        record: new ModuleRecord5349(name5860, language5862),
        term: ModuleTerm5373.create(modBody5863)
    };
}
function loadModule5494(name5864) {
    var // node specific code
    fs5865 = require("fs");
    return (function (body5866) {
        return createModule5493(name5864, body5866);
    })(parser5338.read(fs5865.readFileSync(name5864, "utf8")));
}
function invoke5495(modTerm5867, modRecord5868, phase5869, context5870) {
    if (modRecord5868.language === "base") {
        var // base modules can just use the normal require pipeline
        exported5871 = require(modRecord5868.name);
        Object.keys(exported5871).forEach(function (exp5872) {
            var // create new bindings in the context
            expName5873 = syn5339.makeIdent(exp5872, null).mark(freshScope5364(context5870.bindings));
            context5870.bindings.add(expName5873, fresh5363(), phase5869);
            modRecord5868.exportEntries.push(new ExportEntry5348(null, expName5873, expName5873));
            context5870.store.setWithModule(expName5873, phase5869, modRecord5868.name, new RuntimeValue5469({ value: exported5871[exp5872] }, modRecord5868.name, phase5869));
        });
    } else {
        // recursively invoke any imports in this module at this
        // phase and update the context
        modRecord5868.importedModules.forEach(function (impPath5876) {
            var importMod5877 = loadImport5498(impPath5876, context5870, modRecord5868.name);
            var impEntries5878 = modRecord5868.getImportsForModule(impPath5876);
            if (_5337.any(impEntries5878, function (entry5879) {
                return entry5879.forPhase === 0;
            })) {
                context5870 = invoke5495(importMod5877.term, importMod5877.record, phase5869, context5870);
            }
        });
        var // turn the module into text so we can eval it
        code5874 = (function (terms5880) {
            return codegen5336.generate(parser5338.parse(flatten5505(_5337.flatten(terms5880.map(function (term5881) {
                return term5881.destruct(context5870, {
                    stripCompileTerm: true,
                    stripModuleTerm: true
                });
            })))));
        })(modTerm5867.body);
        var global5875 = { console: console };
        // eval but with a fresh heap
        vm5351.runInNewContext(code5874, global5875);
        // update the exports with the runtime values
        modRecord5868.exportEntries.forEach(function (entry5882) {
            var // we have to get the value with the localName
            expName5883 = resolve5346(entry5882.localName, 0);
            var expVal5884 = global5875[expName5883];
            if (expVal5884) {
                context5870.bindings.add(entry5882.exportName, fresh5363(), phase5869);
                // and set it as the export name
                context5870.store.set(entry5882.exportName, phase5869, new RuntimeValue5469({ value: expVal5884 }, modRecord5868.name, phase5869));
            }
        });
    }
    return context5870;
}
function visitTerms5496(terms5885, modRecord5886, phase5887, context5888) {
    var name5889;
    var macroDefinition5890;
    var exportName5891;
    var entries5892;
    terms5885.forEach(function (term5893) {
        if ( // add the exported names to the module record
        term5893.isExportNameTerm || term5893.isExportDeclTerm || term5893.isExportDefaultTerm) {
            entries5892 = modRecord5886.addExport(term5893);
        }
        if (term5893.isExportDefaultTerm && term5893.decl.isMacroTerm || term5893.isMacroTerm) {
            var _multiTokName5894 = undefined,
                _fullName5895 = undefined,
                macBody5896 = term5893.isExportDefaultTerm ? term5893.decl.body : term5893.body;
            if (term5893.isExportDefaultTerm) {
                _multiTokName5894 = entries5892[0].exportName;
                _fullName5895 = [entries5892[0].exportName];
            } else {
                _multiTokName5894 = makeMultiToken5365(term5893.name);
                _fullName5895 = term5893.name.token.inner;
            }
            if ( // todo: handle implicit imports
            !context5888.store.has(_multiTokName5894, phase5887)) {
                macroDefinition5890 = loadMacroDef5485(macBody5896, context5888, phase5887 + 1);
                context5888.bindings.add(_multiTokName5894, fresh5363(), phase5887);
                context5888.store.set(_multiTokName5894, phase5887, new CompiletimeValue5468(new SyntaxTransform5344(macroDefinition5890, false, builtinMode5450, _fullName5895), phase5887, modRecord5886.name));
            }
        }
        if (term5893.isForPhaseTerm) {
            visitTerms5496(term5893.body, modRecord5886, phase5887 + term5893.phase.token.value, context5888);
        }
        if (term5893.isOperatorDefinitionTerm) {
            var multiTokName5894 = makeMultiToken5365(term5893.name);
            var fullName5895 = term5893.name.token.inner;
            if (!context5888.store.has(multiTokName5894, phase5887)) {
                var opDefinition5899 = loadMacroDef5485(term5893.body, context5888, phase5887 + 1);
                var opObj5900 = {
                    isOp: true,
                    builtin: builtinMode5450,
                    fullName: fullName5895
                };
                assert5352(unwrapSyntax5357(term5893.type) === "binary" || unwrapSyntax5357(term5893.type) === "unary", "operator must either be binary or unary");
                opObj5900[unwrapSyntax5357(term5893.type)] = {
                    fn: opDefinition5899,
                    prec: term5893.prec.token.value,
                    assoc: term5893.assoc ? term5893.assoc.token.value : null
                };
                // bind in the store for the current phase
                context5888.bindings.add(multiTokName5894, fresh5363(), phase5887);
                context5888.store.set(multiTokName5894, phase5887, new CompiletimeValue5468(opObj5900, phase5887, modRecord5886.name));
            }
        }
    });
}
function visit5497(modTerm5901, modRecord5902, phase5903, context5904) {
    if ( // don't need to visit base modules since they do not support macros
    modRecord5902.language === "base") {
        return context5904;
    }
    // reset the exports
    modRecord5902.exportEntries = [];
    // for each of the imported modules, recursively visit and
    // invoke them at the appropriate phase and then bind the
    // imported names in this module
    modRecord5902.importedModules.forEach(function (impPath5905) {
        var // load the (possibly cached) module for this import
        importMod5906 = loadImport5498(impPath5905, context5904, modRecord5902.name);
        var // grab all the import statements for that module
        impEntries5907 = modRecord5902.getImportsForModule(impPath5905);
        var uniquePhases5908 = _5337.uniq(impEntries5907.map(function (entry) {
            return entry.forPhase;
        }));
        uniquePhases5908.forEach(function (impPhase5909) {
            context5904 = visit5497(importMod5906.term, importMod5906.record, phase5903 + impPhase5909, context5904);
            if ( // don't need to invoke when importing for phase 0 (runtime)
            impPhase5909 > 0) {
                context5904 = invoke5495(importMod5906.term, importMod5906.record, phase5903 + impPhase5909, context5904);
            }
        });
        bindImportInMod5499(impEntries5907, importMod5906.term, importMod5906.record, context5904, phase5903);
    });
    // load the transformers into the store
    visitTerms5496(modTerm5901.body, modRecord5902, phase5903, context5904);
    return context5904;
}
function loadImport5498(path5910, context5911, parentPath5912) {
    var modFullPath5913 = resolvePath5491(path5910, parentPath5912);
    if (!availableModules5453.has(modFullPath5913)) {
        var // load it
        modToImport5914 = (function (mod5915) {
            if (mod5915.record.language === "base") {
                return {
                    term: mod5915,
                    record: mod5915.record
                };
            }
            var loadContext5916 = makeExpanderContext5489(_5337.defaults({
                // need to expand with a fresh environment but we keep the store
                env: new NameMap5342(),
                // always expand from phase 0
                phase: 0,
                filename: modFullPath5913,
                moduleRecord: mod5915.record
            }, context5911));
            var expanded5917 = expandModule5500(mod5915.term, loadContext5916);
            return {
                term: expanded5917.mod,
                record: expanded5917.context.moduleRecord
            };
        })(loadModule5494(modFullPath5913));
        availableModules5453.set(modFullPath5913, modToImport5914);
        return modToImport5914;
    }
    return availableModules5453.get(modFullPath5913);
}
function bindImportInMod5499(impEntries5918, modTerm5919, modRecord5920, context5921, phase5922) {
    impEntries5918.forEach(function (entry5923) {
        var isBase5924 = modRecord5920.language === "base";
        var inExports5925 = _5337.find(modRecord5920.exportEntries, function (expEntry5928) {
            return unwrapSyntax5357(expEntry5928.exportName) === unwrapSyntax5357(entry5923.importName);
        });
        if (!(inExports5925 || isBase5924)) {
            throwSyntaxError5354("compile", "the imported name `" + unwrapSyntax5357(entry5923.importName) + "` was not exported from the module", entry5923.importName);
        }
        var exportName5926;
        if (inExports5925) {
            exportName5926 = inExports5925.exportName;
        } else {
            assert5352(false, "not implemented yet: missing export name");
        }
        var localName5927 = entry5923.localName;
        context5921.bindings.addForward(localName5927, exportName5926, phase5922 + entry5923.forPhase);
    });
}
function expandModule5500(mod5929, context5930) {
    return {
        context: context5930,
        mod: expandTermTreeToFinal5487(mod5929, context5930)
    };
}
function isRuntimeName5501(stx5931, context5932) {
    if (stx5931.isDelimiter()) {
        return hasVarTransform5474(stx5931.token.inner, context5932, 0);
    } else {
        return hasVarTransform5474(stx5931, context5932, 0);
    }
}
function isCompiletimeName5502(stx5933, context5934) {
    if (stx5933.isDelimiter()) {
        return hasSyntaxTransform5473(stx5933.token.inner, context5934, 0);
    } else {
        return hasSyntaxTransform5473(stx5933, context5934, 0);
    }
}
function flattenModule5503(modTerm5935, modRecord5936, context5937) {
    var // filter the imports to just the imports and names that are
    // actually available at runtime
    imports5938 = modRecord5936.getRuntimeImportEntries().filter(function (entry5944) {
        return !isCompiletimeName5502(entry5944.localName, context5937);
    });
    var exports5939 = modRecord5936.exportEntries.filter(function (entry5945) {
        return isRuntimeName5501(entry5945.localName, context5937);
    });
    var eof5940 = undefined;
    var // filter out all of the import and export statements
    output5941 = modTerm5935.body.reduce(function (acc5946, term5947) {
        if (term5947.isExportNameTerm || term5947.isExportDeclTerm || term5947.isExportDefaultTerm || term5947.isImportTerm || term5947.isImportForPhaseTerm) {
            return acc5946;
        }
        if (term5947.isEOFTerm) {
            eof5940 = term5947.destruct(context5937);
            return acc5946;
        }
        return acc5946.concat(term5947.destruct(context5937, { stripCompileTerm: true }));
    }, []);
    output5941 = (function (output5948) {
        return output5948.map(function (stx5949) {
            var name5950 = resolve5346(stx5949, 0);
            if ( // collect the implicit imports (those imports that
            // must be included because a macro expanded to a reference
            // to an import from some other module)
            context5937.implicitImport.has(name5950)) {
                var implicit5951 = context5937.implicitImport.get(name5950);
                if ( // don't double add the import
                !_5337.find(imports5938, function (imp5952) {
                    return imp5952 === implicit5951;
                })) {
                    imports5938.push(implicit5951);
                }
            }
            return stx5949;
        });
    })(flatten5505(output5941));
    var // flatten everything
    flatImports5942 = imports5938.reduce(function (acc5953, entry5954) {
        entry5954.moduleRequest = entry5954.moduleRequest.clone();
        entry5954.moduleRequest.token.value += context5937.compileSuffix;
        return acc5953.concat(flatten5505(entry5954.toTerm().destruct(context5937).concat(syn5339.makePunc(";", entry5954.moduleRequest))));
    }, []);
    var flatExports5943 = exports5939.reduce(function (acc, entry) {
        return acc.concat(flatten5505(entry.toTerm().destruct(context5937).concat(syn5339.makePunc(";", entry.localName))));
    }, []);
    return {
        imports: imports5938.map(function (entry5955) {
            return entry5955.toTerm();
        }),
        body: flatImports5942.concat(output5941).concat(flatExports5943).concat(eof5940)
    };
}
function compileModule5504(stx5956, options5957) {
    var fs5958 = require("fs");
    options5957 = options5957 || {};
    var filename5959 = options5957 && typeof options5957.filename !== "undefined" ? fs5958.realpathSync(options5957.filename) : "(anonymous module)";
    maxExpands5452 = Infinity;
    expandCount5451 = 0;
    var mod5960 = createModule5493(filename5959, stx5956);
    var // the template and pattern maps are global for every module
    templateMap5961 = new StringMap5341();
    var patternMap5962 = new StringMap5341();
    availableModules5453 = new StringMap5341();
    var context5963 = makeExpanderContext5489({
        filename: filename5959,
        templateMap: templateMap5961,
        patternMap: patternMap5962,
        phase: 0,
        moduleRecord: mod5960.record,
        compileSuffix: options5957.compileSuffix
    });
    var expanded5964 = expandModule5500(mod5960.term, context5963);
    var flattened5965 = flattenModule5503(expanded5964.mod, expanded5964.context.moduleRecord, expanded5964.context);
    var compiledModules5966 = [];
    availableModules5453.keys().forEach(function (modName5967) {
        var mod5968 = availableModules5453.get(modName5967);
        if (mod5968.record.language !== "base") {
            var flattened5969 = flattenModule5503(mod5968.term, mod5968.record, expanded5964.context);
            compiledModules5966.push({
                path: modName5967,
                code: flattened5969.body
            });
        }
    });
    return [{
        path: filename5959,
        code: flattened5965.body
    }].concat(compiledModules5966);
}
function flatten5505(stx5970) {
    return _5337.reduce(stx5970, function (acc5971, stx5972) {
        if (stx5972.isDelimiter()) {
            var openParen5973 = syntaxFromToken5448({
                type: parser5338.Token.Punctuator,
                value: stx5972.token.value[0],
                range: stx5972.token.startRange,
                sm_range: typeof stx5972.token.sm_startRange == "undefined" ? stx5972.token.startRange : stx5972.token.sm_startRange,
                lineNumber: stx5972.token.startLineNumber,
                sm_lineNumber: typeof stx5972.token.sm_startLineNumber == "undefined" ? stx5972.token.startLineNumber : stx5972.token.sm_startLineNumber,
                lineStart: stx5972.token.startLineStart,
                sm_lineStart: typeof stx5972.token.sm_startLineStart == "undefined" ? stx5972.token.startLineStart : stx5972.token.sm_startLineStart
            }, stx5972);
            var closeParen5974 = syntaxFromToken5448({
                type: parser5338.Token.Punctuator,
                value: stx5972.token.value[1],
                range: stx5972.token.endRange,
                sm_range: typeof stx5972.token.sm_endRange == "undefined" ? stx5972.token.endRange : stx5972.token.sm_endRange,
                lineNumber: stx5972.token.endLineNumber,
                sm_lineNumber: typeof stx5972.token.sm_endLineNumber == "undefined" ? stx5972.token.endLineNumber : stx5972.token.sm_endLineNumber,
                lineStart: stx5972.token.endLineStart,
                sm_lineStart: typeof stx5972.token.sm_endLineStart == "undefined" ? stx5972.token.endLineStart : stx5972.token.sm_endLineStart
            }, stx5972);
            if (stx5972.token.leadingComments) {
                openParen5973.token.leadingComments = stx5972.token.leadingComments;
            }
            if (stx5972.token.trailingComments) {
                openParen5973.token.trailingComments = stx5972.token.trailingComments;
            }
            acc5971.push(openParen5973);
            push5454.apply(acc5971, flatten5505(stx5972.token.inner));
            acc5971.push(closeParen5974);
            return acc5971;
        }
        stx5972.token.sm_lineNumber = typeof stx5972.token.sm_lineNumber != "undefined" ? stx5972.token.sm_lineNumber : stx5972.token.lineNumber;
        stx5972.token.sm_lineStart = typeof stx5972.token.sm_lineStart != "undefined" ? stx5972.token.sm_lineStart : stx5972.token.lineStart;
        stx5972.token.sm_range = typeof stx5972.token.sm_range != "undefined" ? stx5972.token.sm_range : stx5972.token.range;
        acc5971.push(stx5972);
        return acc5971;
    }, []);
}
exports.StringMap = StringMap5341;
exports.enforest = enforest5478;
exports.compileModule = compileModule5504;
exports.getCompiletimeValue = getCompiletimeValue5470;
exports.hasCompiletimeValue = hasCompiletimeValue5475;
exports.getSyntaxTransform = getSyntaxTransform5471;
exports.hasSyntaxTransform = hasSyntaxTransform5473;
exports.resolve = resolve5346;
exports.get_expression = get_expression5480;
exports.makeExpanderContext = makeExpanderContext5489;
exports.ExprTerm = ExprTerm5395;
exports.VariableStatementTerm = VariableStatementTerm5420;
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