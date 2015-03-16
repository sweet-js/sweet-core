"use strict";

var codegen5358 = require("escodegen"),
    _5359 = require("underscore"),
    parser5360 = require("./parser"),
    syn5361 = require("./syntax"),
    se5362 = require("./scopedEval"),
    StringMap5363 = require("./data/stringMap"),
    NameMap5364 = require("./data/nameMap"),
    BindingMap5365 = require("./data/bindingMap"),
    SyntaxTransform5366 = require("./data/transforms").SyntaxTransform,
    VarTransform5367 = require("./data/transforms").VarTransform,
    resolve5368 = require("./stx/resolve").resolve,
    marksof5369 = require("./stx/resolve").marksof,
    arraysEqual5370 = require("./stx/resolve").arraysEqual,
    makeImportEntries5371 = require("./mod/importEntry").makeImportEntries,
    ExportEntry5372 = require("./mod/exportEntry").ExportEntry,
    ModuleRecord5373 = require("./mod/moduleRecord").ModuleRecord,
    patternModule5374 = require("./patterns"),
    vm5375 = require("vm"),
    assert5376 = require("assert"),
    termTree5377 = require("./data/termTree");
var throwSyntaxError5378 = syn5361.throwSyntaxError;
var throwSyntaxCaseError5379 = syn5361.throwSyntaxCaseError;
var SyntaxCaseError5380 = syn5361.SyntaxCaseError;
var unwrapSyntax5381 = syn5361.unwrapSyntax;
var makeIdent5382 = syn5361.makeIdent;
var makePunc5383 = syn5361.makePunc;
var makeDelim5384 = syn5361.makeDelim;
var makeValue5385 = syn5361.makeValue;
var adjustLineContext5386 = syn5361.adjustLineContext;
var fresh5387 = syn5361.fresh;
var freshScope5388 = syn5361.freshScope;
var makeMultiToken5389 = syn5361.makeMultiToken;
var Scope5390 = syn5361.Scope;
var TermTree5391 = termTree5377.TermTree,
    EOFTerm5392 = termTree5377.EOFTerm,
    KeywordTerm5393 = termTree5377.KeywordTerm,
    PuncTerm5394 = termTree5377.PuncTerm,
    DelimiterTerm5395 = termTree5377.DelimiterTerm,
    ModuleTimeTerm5396 = termTree5377.ModuleTimeTerm,
    ModuleTerm5397 = termTree5377.ModuleTerm,
    ImportTerm5398 = termTree5377.ImportTerm,
    ImportForPhaseTerm5399 = termTree5377.ImportForPhaseTerm,
    NamedImportTerm5400 = termTree5377.NamedImportTerm,
    DefaultImportTerm5401 = termTree5377.DefaultImportTerm,
    NamespaceImportTerm5402 = termTree5377.NamespaceImportTerm,
    BindingTerm5403 = termTree5377.BindingTerm,
    QualifiedBindingTerm5404 = termTree5377.QualifiedBindingTerm,
    ExportNameTerm5405 = termTree5377.ExportNameTerm,
    ExportDefaultTerm5406 = termTree5377.ExportDefaultTerm,
    ExportDeclTerm5407 = termTree5377.ExportDeclTerm,
    CompileTimeTerm5408 = termTree5377.CompileTimeTerm,
    LetMacroTerm5409 = termTree5377.LetMacroTerm,
    MacroTerm5410 = termTree5377.MacroTerm,
    AnonMacroTerm5411 = termTree5377.AnonMacroTerm,
    ClassDeclarationTerm5412 = termTree5377.ClassDeclarationTerm,
    OperatorDefinitionTerm5413 = termTree5377.OperatorDefinitionTerm,
    ForPhaseTerm5414 = termTree5377.ForPhaseTerm,
    VariableDeclarationTerm5415 = termTree5377.VariableDeclarationTerm,
    StatementTerm5416 = termTree5377.StatementTerm,
    EmptyTerm5417 = termTree5377.EmptyTerm,
    CatchClauseTerm5418 = termTree5377.CatchClauseTerm,
    ForStatementTerm5419 = termTree5377.ForStatementTerm,
    ReturnStatementTerm5420 = termTree5377.ReturnStatementTerm,
    ExprTerm5421 = termTree5377.ExprTerm,
    UnaryOpTerm5422 = termTree5377.UnaryOpTerm,
    PostfixOpTerm5423 = termTree5377.PostfixOpTerm,
    BinOpTerm5424 = termTree5377.BinOpTerm,
    AssignmentExpressionTerm5425 = termTree5377.AssignmentExpressionTerm,
    ConditionalExpressionTerm5426 = termTree5377.ConditionalExpressionTerm,
    NamedFunTerm5427 = termTree5377.NamedFunTerm,
    AnonFunTerm5428 = termTree5377.AnonFunTerm,
    ArrowFunTerm5429 = termTree5377.ArrowFunTerm,
    ObjDotGetTerm5430 = termTree5377.ObjDotGetTerm,
    ObjGetTerm5431 = termTree5377.ObjGetTerm,
    TemplateTerm5432 = termTree5377.TemplateTerm,
    CallTerm5433 = termTree5377.CallTerm,
    QuoteSyntaxTerm5434 = termTree5377.QuoteSyntaxTerm,
    StopQuotedTerm5435 = termTree5377.StopQuotedTerm,
    PrimaryExpressionTerm5436 = termTree5377.PrimaryExpressionTerm,
    ThisExpressionTerm5437 = termTree5377.ThisExpressionTerm,
    LitTerm5438 = termTree5377.LitTerm,
    BlockTerm5439 = termTree5377.BlockTerm,
    ArrayLiteralTerm5440 = termTree5377.ArrayLiteralTerm,
    IdTerm5441 = termTree5377.IdTerm,
    PartialTerm5442 = termTree5377.PartialTerm,
    PartialOperationTerm5443 = termTree5377.PartialOperationTerm,
    PartialExpressionTerm5444 = termTree5377.PartialExpressionTerm,
    BindingStatementTerm5445 = termTree5377.BindingStatementTerm,
    VariableStatementTerm5446 = termTree5377.VariableStatementTerm,
    LetStatementTerm5447 = termTree5377.LetStatementTerm,
    ConstStatementTerm5448 = termTree5377.ConstStatementTerm,
    ParenExpressionTerm5449 = termTree5377.ParenExpressionTerm;
var scopedEval5473 = se5362.scopedEval;
var syntaxFromToken5474 = syn5361.syntaxFromToken;
var joinSyntax5475 = syn5361.joinSyntax;
var builtinMode5476 = false;
var expandCount5477 = 0;
var maxExpands5478;
var availableModules5479;
var push5480 = Array.prototype.push;
function wrapDelim5481(towrap5538, delimSyntax5539) {
    assert5376(delimSyntax5539.isDelimiterToken(), "expecting a delimiter token");
    return syntaxFromToken5474({
        type: parser5360.Token.Delimiter,
        value: delimSyntax5539.token.value,
        inner: towrap5538,
        range: delimSyntax5539.token.range,
        startLineNumber: delimSyntax5539.token.startLineNumber,
        lineStart: delimSyntax5539.token.lineStart
    }, delimSyntax5539);
}
function getParamIdentifiers5482(argSyntax5540) {
    if (argSyntax5540.isDelimiter()) {
        return _5359.filter(argSyntax5540.token.inner, function (stx5541) {
            return stx5541.token.value !== ",";
        });
    } else if (argSyntax5540.isIdentifier()) {
        return [argSyntax5540];
    } else {
        assert5376(false, "expecting a delimiter or a single identifier for function parameters");
    }
}
function stxIsUnaryOp5483(stx5542) {
    var staticOperators5543 = ["+", "-", "~", "!", "delete", "void", "typeof", "yield", "new", "++", "--"];
    return _5359.contains(staticOperators5543, unwrapSyntax5381(stx5542));
}
function stxIsBinOp5484(stx5544) {
    var staticOperators5545 = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "<<", ">>", ">>>"];
    return _5359.contains(staticOperators5545, unwrapSyntax5381(stx5544));
}
function getUnaryOpPrec5485(op5546) {
    var operatorPrecedence5547 = {
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
    return operatorPrecedence5547[op5546];
}
function getBinaryOpPrec5486(op5548) {
    var operatorPrecedence5549 = {
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
    return operatorPrecedence5549[op5548];
}
function getBinaryOpAssoc5487(op5550) {
    var operatorAssoc5551 = {
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
    return operatorAssoc5551[op5550];
}
function stxIsAssignOp5488(stx5552) {
    var staticOperators5553 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
    return _5359.contains(staticOperators5553, unwrapSyntax5381(stx5552));
}
function enforestImportClause5489(stx5554) {
    if (stx5554[0] && stx5554[0].isDelimiter()) {
        return {
            result: NamedImportTerm5400.create(stx5554[0]),
            rest: stx5554.slice(1)
        };
    } else if (stx5554[0] && stx5554[0].isPunctuator() && unwrapSyntax5381(stx5554[0]) === "*" && stx5554[1] && unwrapSyntax5381(stx5554[1]) === "as" && stx5554[2]) {
        return {
            result: NamespaceImportTerm5402.create(stx5554[0], stx5554[1], stx5554[2]),
            rest: stx5554.slice(3)
        };
    } else {
        return {
            result: DefaultImportTerm5401.create(stx5554[0]),
            rest: stx5554.slice(1)
        };
    }
}
function enforestImportClauseList5490(stx5555) {
    var res5556 = [];
    var clause5557 = enforestImportClause5489(stx5555);
    var rest5558 = clause5557.rest;
    res5556.push(clause5557.result);
    if (rest5558[0] && rest5558[0].isPunctuator() && unwrapSyntax5381(rest5558[0]) === ",") {
        res5556.push(rest5558[0]);
        clause5557 = enforestImportClause5489(rest5558.slice(1));
        res5556.push(clause5557.result);
        rest5558 = clause5557.rest;
    }
    return {
        result: res5556,
        rest: rest5558
    };
}
function enforestImport5491(head5559, rest5560) {
    assert5376(unwrapSyntax5381(head5559) === "import", "only call for imports");
    var clause5561 = enforestImportClauseList5490(rest5560);
    rest5560 = clause5561.rest;
    if (rest5560[0] && unwrapSyntax5381(rest5560[0]) === "from" && rest5560[1] && rest5560[1].isStringLiteral() && rest5560[2] && unwrapSyntax5381(rest5560[2]) === "for" && rest5560[3] && unwrapSyntax5381(rest5560[3]) === "phase" && rest5560[4] && rest5560[4].isNumericLiteral()) {
        var importRest5562;
        if (rest5560[5] && rest5560[5].isPunctuator() && rest5560[5].token.value === ";") {
            importRest5562 = rest5560.slice(6);
        } else {
            importRest5562 = rest5560.slice(5);
        }
        return {
            result: ImportForPhaseTerm5399.create(head5559, clause5561.result, rest5560[0], rest5560[1], rest5560[2], rest5560[3], rest5560[4]),
            rest: importRest5562
        };
    } else if (rest5560[0] && unwrapSyntax5381(rest5560[0]) === "from" && rest5560[1] && rest5560[1].isStringLiteral()) {
        var importRest5562;
        if (rest5560[2] && rest5560[2].isPunctuator() && rest5560[2].token.value === ";") {
            importRest5562 = rest5560.slice(3);
        } else {
            importRest5562 = rest5560.slice(2);
        }
        return {
            result: ImportTerm5398.create(head5559, clause5561.result, rest5560[0], rest5560[1]),
            rest: importRest5562
        };
    } else {
        throwSyntaxError5378("enforest", "unrecognized import syntax", rest5560);
    }
}
function enforestVarStatement5492(stx5564, context5565, varStx5566) {
    var decls5567 = [];
    var rest5568 = stx5564;
    var rhs5569;
    if (!rest5568.length) {
        throwSyntaxError5378("enforest", "Unexpected end of input", varStx5566);
    }
    if (expandCount5477 >= maxExpands5478) {
        return null;
    }
    while (rest5568.length) {
        if (rest5568[0].isIdentifier()) {
            if (rest5568[1] && rest5568[1].isPunctuator() && rest5568[1].token.value === "=") {
                rhs5569 = get_expression5508(rest5568.slice(2), context5565);
                if (rhs5569.result == null) {
                    throwSyntaxError5378("enforest", "Unexpected token", rhs5569.rest[0]);
                }
                if (rhs5569.rest[0] && rhs5569.rest[0].isPunctuator() && rhs5569.rest[0].token.value === ",") {
                    decls5567.push(VariableDeclarationTerm5415.create(rest5568[0], rest5568[1], rhs5569.result, rhs5569.rest[0]));
                    rest5568 = rhs5569.rest.slice(1);
                    continue;
                } else {
                    decls5567.push(VariableDeclarationTerm5415.create(rest5568[0], rest5568[1], rhs5569.result, null));
                    rest5568 = rhs5569.rest;
                    break;
                }
            } else if (rest5568[1] && rest5568[1].isPunctuator() && rest5568[1].token.value === ",") {
                decls5567.push(VariableDeclarationTerm5415.create(rest5568[0], null, null, rest5568[1]));
                rest5568 = rest5568.slice(2);
            } else {
                decls5567.push(VariableDeclarationTerm5415.create(rest5568[0], null, null, null));
                rest5568 = rest5568.slice(1);
                break;
            }
        } else {
            throwSyntaxError5378("enforest", "Unexpected token", rest5568[0]);
        }
    }
    return {
        result: decls5567,
        rest: rest5568
    };
}
function enforestAssignment5493(stx5570, context5571, left5572, prevStx5573, prevTerms5574) {
    var op5575 = stx5570[0];
    var rightStx5576 = stx5570.slice(1);
    var opTerm5577 = PuncTerm5394.create(stx5570[0]);
    var opPrevStx5578 = tagWithTerm5509(opTerm5577, [stx5570[0]]).concat(tagWithTerm5509(left5572, left5572.destruct(context5571).reverse()), prevStx5573);
    var opPrevTerms5579 = [opTerm5577, left5572].concat(prevTerms5574);
    var opRes5580 = enforest5506(rightStx5576, context5571, opPrevStx5578, opPrevTerms5579);
    if (opRes5580.result) {
        if ( // Lookbehind was matched, so it may not even be a binop anymore.
        opRes5580.prevTerms.length < opPrevTerms5579.length) {
            return opRes5580;
        }
        var right5581 = opRes5580.result;
        if ( // only a binop if the right is a real expression
        // so 2+2++ will only match 2+2
        right5581.isExprTerm) {
            var term5582 = AssignmentExpressionTerm5425.create(left5572, op5575, right5581);
            return {
                result: term5582,
                rest: opRes5580.rest,
                prevStx: prevStx5573,
                prevTerms: prevTerms5574
            };
        }
    } else {
        return opRes5580;
    }
}
function enforestParenExpression5494(parens5583, context5584) {
    var argRes5585,
        enforestedArgs5586 = [],
        commas5587 = [];
    var innerTokens5588 = parens5583.token.inner;
    while (innerTokens5588.length > 0) {
        argRes5585 = enforest5506(innerTokens5588, context5584);
        if (!argRes5585.result || !argRes5585.result.isExprTerm) {
            return null;
        }
        enforestedArgs5586.push(argRes5585.result);
        innerTokens5588 = argRes5585.rest;
        if (innerTokens5588[0] && innerTokens5588[0].token.value === ",") {
            // record the comma for later
            commas5587.push(innerTokens5588[0]);
            // but dump it for the next loop turn
            innerTokens5588 = innerTokens5588.slice(1);
        } else {
            // either there are no more tokens or
            // they aren't a comma, either way we
            // are done with the loop
            break;
        }
    }
    return innerTokens5588.length ? null : ParenExpressionTerm5449.create(enforestedArgs5586, parens5583, commas5587);
}
function resolveFast5495(stx5589, context5590, phase5591) {
    var name5592 = unwrapSyntax5381(stx5589);
    if (context5590.env.hasName(name5592) || context5590.store.hasName(name5592)) {
        return resolve5368(stx5589, phase5591);
    }
    return name5592;
}
function CompiletimeValue5496(trans5593, module5594, phase5595) {
    this.trans = trans5593;
    this.module = module5594;
    this.phase = phase5595;
}
function RuntimeValue5497(trans5596, module5597, phase5598) {
    this.trans = trans5596;
    this.module = module5597;
    this.phase = phase5598;
}
function getCompiletimeValue5498(stx5599, context5600, phase5601) {
    var store5602,
        env5603 = context5600.env.get(stx5599, phase5601);
    if (env5603 !== null) {
        return env5603.trans;
    } else {
        store5602 = context5600.store.getWithModule(stx5599, phase5601);
        return store5602 !== null ? store5602.trans : null;
    }
}
function getSyntaxTransform5499(stx5604, context5605, phase5606) {
    var t5607 = getCompiletimeValue5498(stx5604, context5605, phase5606);
    if (t5607 && t5607 instanceof VarTransform5367) {
        return null;
    }
    return t5607;
}
function hasSyntaxTransform5500(stx5608, context5609, phase5610) {
    return getSyntaxTransform5499(stx5608, context5609, phase5610) !== null;
}
function hasCompiletimeValue5501(stx5611, context5612, phase5613) {
    return context5612.env.has(stx5611, phase5613) || context5612.store.has(stx5611, phase5613);
}
function expandMacro5502(stx5614, context5615, opCtx5616, opType5617, macroObj5618) {
    var // pull the macro transformer out the environment
    head5619 = stx5614[0];
    var rest5620 = stx5614.slice(1);
    macroObj5618 = macroObj5618 || getSyntaxTransform5499(stx5614, context5615, context5615.phase);
    var stxArg5621 = rest5620.slice(macroObj5618.fullName.length - 1);
    var transformer5622;
    if (opType5617 != null) {
        assert5376(opType5617 === "binary" || opType5617 === "unary", "operator type should be either unary or binary: " + opType5617);
        transformer5622 = macroObj5618[opType5617].fn;
    } else {
        transformer5622 = macroObj5618.fn;
    }
    assert5376(typeof transformer5622 === "function", "Macro transformer not bound for: " + head5619.token.value);
    var transformerContext5623 = makeExpanderContext5517(_5359.defaults({ mark: freshScope5388(context5615.bindings) }, context5615));
    // apply the transformer
    var rt5624;
    try {
        rt5624 = transformer5622([head5619].concat(stxArg5621), transformerContext5623, opCtx5616.prevStx, opCtx5616.prevTerms);
    } catch (e5625) {
        if (e5625 instanceof SyntaxCaseError5380) {
            var // add a nicer error for syntax case
            nameStr5626 = macroObj5618.fullName.map(function (stx5627) {
                return stx5627.token.value;
            }).join("");
            if (opType5617 != null) {
                var argumentString5628 = "`" + stxArg5621.slice(0, 5).map(function (stx5629) {
                    return stx5629.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5378("operator", "Operator `" + nameStr5626 + "` could not be matched with " + argumentString5628, head5619);
            } else {
                var argumentString5628 = "`" + stxArg5621.slice(0, 5).map(function (stx5631) {
                    return stx5631.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5378("macro", "Macro `" + nameStr5626 + "` could not be matched with " + argumentString5628, head5619);
            }
        } else {
            // just rethrow it
            throw e5625;
        }
    }
    if (!builtinMode5476 && !macroObj5618.builtin) {
        expandCount5477++;
    }
    if (!Array.isArray(rt5624.result)) {
        throwSyntaxError5378("enforest", "Macro must return a syntax array", stx5614[0]);
    }
    if (rt5624.result.length > 0) {
        var adjustedResult5632 = adjustLineContext5386(rt5624.result, head5619);
        if (stx5614[0].token.leadingComments) {
            if (adjustedResult5632[0].token.leadingComments) {
                adjustedResult5632[0].token.leadingComments = adjustedResult5632[0].token.leadingComments.concat(head5619.token.leadingComments);
            } else {
                adjustedResult5632[0].token.leadingComments = head5619.token.leadingComments;
            }
        }
        rt5624.result = adjustedResult5632;
    }
    return rt5624;
}
function comparePrec5503(left5633, right5634, assoc5635) {
    if (assoc5635 === "left") {
        return left5633 <= right5634;
    }
    return left5633 < right5634;
}
function toksAdjacent5504(a5636, b5637) {
    var arange5638 = a5636.token.sm_range || a5636.token.range || a5636.token.endRange;
    var brange5639 = b5637.token.sm_range || b5637.token.range || b5637.token.endRange;
    return arange5638 && brange5639 && arange5638[1] === brange5639[0];
}
function syntaxInnerValuesEq5505(synA5640, synB5641) {
    var a5642 = synA5640.token.inner,
        b5643 = synB5641.token.inner;
    return (function (ziped5644) {
        return _5359.all(ziped5644, function (pair5645) {
            return unwrapSyntax5381(pair5645[0]) === unwrapSyntax5381(pair5645[1]);
        });
    })(a5642.length === b5643.length && _5359.zip(a5642, b5643));
}
function enforest5506(toks5646, context5647, prevStx5648, prevTerms5649) {
    assert5376(toks5646.length > 0, "enforest assumes there are tokens to work with");
    prevStx5648 = prevStx5648 || [];
    prevTerms5649 = prevTerms5649 || [];
    if (expandCount5477 >= maxExpands5478) {
        return {
            result: null,
            rest: toks5646
        };
    }
    function step5650(head5651, rest5652, opCtx5653) {
        var innerTokens5654;
        assert5376(Array.isArray(rest5652), "result must at least be an empty array");
        if (head5651.isTermTree) {
            var isCustomOp5656 = false;
            var uopMacroObj5657;
            var uopSyntax5658;
            if (head5651.isPuncTerm || head5651.isKeywordTerm || head5651.isIdTerm) {
                if (head5651.isPuncTerm) {
                    uopSyntax5658 = head5651.punc;
                } else if (head5651.isKeywordTerm) {
                    uopSyntax5658 = head5651.keyword;
                } else if (head5651.isIdTerm) {
                    uopSyntax5658 = head5651.id;
                }
                uopMacroObj5657 = getSyntaxTransform5499([uopSyntax5658].concat(rest5652), context5647, context5647.phase);
                isCustomOp5656 = uopMacroObj5657 && uopMacroObj5657.isOp;
            }
            // look up once (we want to check multiple properties on bopMacroObj
            // without repeatedly calling getValueInEnv)
            var bopMacroObj5659;
            if (rest5652[0] && rest5652[1]) {
                bopMacroObj5659 = getSyntaxTransform5499(rest5652, context5647, context5647.phase);
            }
            if ( // unary operator
            isCustomOp5656 && uopMacroObj5657.unary || uopSyntax5658 && stxIsUnaryOp5483(uopSyntax5658)) {
                var uopPrec5660;
                if (isCustomOp5656 && uopMacroObj5657.unary) {
                    uopPrec5660 = uopMacroObj5657.unary.prec;
                } else {
                    uopPrec5660 = getUnaryOpPrec5485(unwrapSyntax5381(uopSyntax5658));
                }
                var opRest5661 = rest5652;
                var uopMacroName5662;
                if (uopMacroObj5657) {
                    uopMacroName5662 = [uopSyntax5658].concat(rest5652.slice(0, uopMacroObj5657.fullName.length - 1));
                    opRest5661 = rest5652.slice(uopMacroObj5657.fullName.length - 1);
                }
                var leftLeft5663 = opCtx5653.prevTerms[0] && opCtx5653.prevTerms[0].isPartialTerm ? opCtx5653.prevTerms[0] : null;
                var unopTerm5664 = PartialOperationTerm5443.create(head5651, leftLeft5663);
                var unopPrevStx5665 = tagWithTerm5509(unopTerm5664, head5651.destruct(context5647).reverse()).concat(opCtx5653.prevStx);
                var unopPrevTerms5666 = [unopTerm5664].concat(opCtx5653.prevTerms);
                var unopOpCtx5667 = _5359.extend({}, opCtx5653, {
                    combine: function combine(t5668) {
                        if (t5668.isExprTerm) {
                            if (isCustomOp5656 && uopMacroObj5657.unary) {
                                var rt5669 = expandMacro5502(uopMacroName5662.concat(t5668.destruct(context5647)), context5647, opCtx5653, "unary");
                                var newt5670 = get_expression5508(rt5669.result, context5647);
                                assert5376(newt5670.rest.length === 0, "should never have left over syntax");
                                return opCtx5653.combine(newt5670.result);
                            }
                            return opCtx5653.combine(UnaryOpTerm5422.create(uopSyntax5658, t5668));
                        } else {
                            // not actually an expression so don't create
                            // a UnaryOp term just return with the punctuator
                            return opCtx5653.combine(head5651);
                        }
                    },
                    prec: uopPrec5660,
                    prevStx: unopPrevStx5665,
                    prevTerms: unopPrevTerms5666,
                    op: unopTerm5664
                });
                return step5650(opRest5661[0], opRest5661.slice(1), unopOpCtx5667);
            } else if (head5651.isExprTerm && (rest5652[0] && rest5652[1] && (stxIsBinOp5484(rest5652[0]) && !bopMacroObj5659 || bopMacroObj5659 && bopMacroObj5659.isOp && bopMacroObj5659.binary))) {
                var opRes5671;
                var op5672 = rest5652[0];
                var left5673 = head5651;
                var rightStx5674 = rest5652.slice(1);
                var leftLeft5663 = opCtx5653.prevTerms[0] && opCtx5653.prevTerms[0].isPartialTerm ? opCtx5653.prevTerms[0] : null;
                var leftTerm5676 = PartialExpressionTerm5444.create(head5651.destruct(context5647), leftLeft5663, function () {
                    return step5650(head5651, [], opCtx5653);
                });
                var opTerm5677 = PartialOperationTerm5443.create(op5672, leftTerm5676);
                var opPrevStx5678 = tagWithTerm5509(opTerm5677, [rest5652[0]]).concat(tagWithTerm5509(leftTerm5676, head5651.destruct(context5647)).reverse(), opCtx5653.prevStx);
                var opPrevTerms5679 = [opTerm5677, leftTerm5676].concat(opCtx5653.prevTerms);
                var isCustomOp5656 = bopMacroObj5659 && bopMacroObj5659.isOp && bopMacroObj5659.binary;
                var bopPrec5681;
                var bopAssoc5682;
                if (isCustomOp5656 && bopMacroObj5659.binary) {
                    bopPrec5681 = bopMacroObj5659.binary.prec;
                    bopAssoc5682 = bopMacroObj5659.binary.assoc;
                } else {
                    bopPrec5681 = getBinaryOpPrec5486(unwrapSyntax5381(op5672));
                    bopAssoc5682 = getBinaryOpAssoc5487(unwrapSyntax5381(op5672));
                }
                assert5376(bopPrec5681 !== undefined, "expecting a precedence for operator: " + op5672);
                var newStack5683;
                if (comparePrec5503(bopPrec5681, opCtx5653.prec, bopAssoc5682)) {
                    var bopCtx5687 = opCtx5653;
                    var combResult5655 = opCtx5653.combine(head5651);
                    if (opCtx5653.stack.length > 0) {
                        return step5650(combResult5655.term, rest5652, opCtx5653.stack[0]);
                    }
                    left5673 = combResult5655.term;
                    newStack5683 = opCtx5653.stack;
                    opPrevStx5678 = combResult5655.prevStx;
                    opPrevTerms5679 = combResult5655.prevTerms;
                } else {
                    newStack5683 = [opCtx5653].concat(opCtx5653.stack);
                }
                assert5376(opCtx5653.combine !== undefined, "expecting a combine function");
                var opRightStx5684 = rightStx5674;
                var bopMacroName5685;
                if (isCustomOp5656) {
                    bopMacroName5685 = rest5652.slice(0, bopMacroObj5659.fullName.length);
                    opRightStx5684 = rightStx5674.slice(bopMacroObj5659.fullName.length - 1);
                }
                var bopOpCtx5686 = _5359.extend({}, opCtx5653, {
                    combine: function combine(right5689) {
                        if (right5689.isExprTerm) {
                            if (isCustomOp5656 && bopMacroObj5659.binary) {
                                var leftStx5690 = left5673.destruct(context5647);
                                var rightStx5691 = right5689.destruct(context5647);
                                var rt5692 = expandMacro5502(bopMacroName5685.concat(syn5361.makeDelim("()", leftStx5690, leftStx5690[0]), syn5361.makeDelim("()", rightStx5691, rightStx5691[0])), context5647, opCtx5653, "binary");
                                var newt5693 = get_expression5508(rt5692.result, context5647);
                                assert5376(newt5693.rest.length === 0, "should never have left over syntax");
                                return {
                                    term: newt5693.result,
                                    prevStx: opPrevStx5678,
                                    prevTerms: opPrevTerms5679
                                };
                            }
                            return {
                                term: BinOpTerm5424.create(left5673, op5672, right5689),
                                prevStx: opPrevStx5678,
                                prevTerms: opPrevTerms5679
                            };
                        } else {
                            return {
                                term: head5651,
                                prevStx: opPrevStx5678,
                                prevTerms: opPrevTerms5679
                            };
                        }
                    },
                    prec: bopPrec5681,
                    op: opTerm5677,
                    stack: newStack5683,
                    prevStx: opPrevStx5678,
                    prevTerms: opPrevTerms5679
                });
                return step5650(opRightStx5684[0], opRightStx5684.slice(1), bopOpCtx5686);
            } else if (head5651.isExprTerm && (rest5652[0] && rest5652[0].isDelimiter() && rest5652[0].token.value === "()")) {
                var parenRes5694 = enforestParenExpression5494(rest5652[0], context5647);
                if (parenRes5694) {
                    return step5650(CallTerm5433.create(head5651, parenRes5694), rest5652.slice(1), opCtx5653);
                }
            } else if (head5651.isExprTerm && (rest5652[0] && resolveFast5495(rest5652[0], context5647, context5647.phase) === "?")) {
                var question5695 = rest5652[0];
                var condRes5696 = enforest5506(rest5652.slice(1), context5647);
                if (condRes5696.result) {
                    var truExpr5697 = condRes5696.result;
                    var condRight5698 = condRes5696.rest;
                    if (truExpr5697.isExprTerm && condRight5698[0] && resolveFast5495(condRight5698[0], context5647, context5647.phase) === ":") {
                        var colon5699 = condRight5698[0];
                        var flsRes5700 = enforest5506(condRight5698.slice(1), context5647);
                        var flsExpr5701 = flsRes5700.result;
                        if (flsExpr5701.isExprTerm) {
                            if ( // operators are combined before the ternary
                            opCtx5653.prec >= 4) {
                                var // ternary is like a operator with prec 4
                                headResult5702 = opCtx5653.combine(head5651);
                                var condTerm5703 = ConditionalExpressionTerm5426.create(headResult5702.term, question5695, truExpr5697, colon5699, flsExpr5701);
                                if (opCtx5653.stack.length > 0) {
                                    return step5650(condTerm5703, flsRes5700.rest, opCtx5653.stack[0]);
                                } else {
                                    return {
                                        result: condTerm5703,
                                        rest: flsRes5700.rest,
                                        prevStx: headResult5702.prevStx,
                                        prevTerms: headResult5702.prevTerms
                                    };
                                }
                            } else {
                                var condTerm5703 = ConditionalExpressionTerm5426.create(head5651, question5695, truExpr5697, colon5699, flsExpr5701);
                                return step5650(condTerm5703, flsRes5700.rest, opCtx5653);
                            }
                        }
                    }
                }
            } else if (head5651.isDelimiterTerm && head5651.delim.token.value === "()" && rest5652[0] && rest5652[0].isPunctuator() && resolveFast5495(rest5652[0], context5647, context5647.phase) === "=>") {
                var arrowRes5705 = enforest5506(rest5652.slice(1), context5647);
                if (arrowRes5705.result && arrowRes5705.result.isExprTerm) {
                    return step5650(ArrowFunTerm5429.create(head5651.delim, rest5652[0], arrowRes5705.result.destruct(context5647)), arrowRes5705.rest, opCtx5653);
                } else {
                    throwSyntaxError5378("enforest", "Body of arrow function must be an expression", rest5652.slice(1));
                }
            } else if (head5651.isIdTerm && rest5652[0] && rest5652[0].isPunctuator() && resolveFast5495(rest5652[0], context5647, context5647.phase) === "=>") {
                var res5706 = enforest5506(rest5652.slice(1), context5647);
                if (res5706.result && res5706.result.isExprTerm) {
                    return step5650(ArrowFunTerm5429.create(head5651.id, rest5652[0], res5706.result.destruct(context5647)), res5706.rest, opCtx5653);
                } else {
                    throwSyntaxError5378("enforest", "Body of arrow function must be an expression", rest5652.slice(1));
                }
            } else if (head5651.isDelimiterTerm && head5651.delim.token.value === "()") {
                if ( // empty parens are acceptable but enforest
                // doesn't accept empty arrays so short
                // circuit here
                head5651.delim.token.inner.length === 0) {
                    return step5650(ParenExpressionTerm5449.create([EmptyTerm5417.create()], head5651.delim, []), rest5652, opCtx5653);
                } else {
                    var parenRes5694 = enforestParenExpression5494(head5651.delim, context5647);
                    if (parenRes5694) {
                        return step5650(parenRes5694, rest5652, opCtx5653);
                    }
                }
            } else if (head5651.isExprTerm && ((head5651.isIdTerm || head5651.isObjGetTerm || head5651.isObjDotGetTerm || head5651.isThisExpressionTerm) && rest5652[0] && rest5652[1] && !bopMacroObj5659 && stxIsAssignOp5488(rest5652[0]))) {
                var opRes5671 = enforestAssignment5493(rest5652, context5647, head5651, prevStx5648, prevTerms5649);
                if (opRes5671 && opRes5671.result) {
                    return step5650(opRes5671.result, opRes5671.rest, _5359.extend({}, opCtx5653, {
                        prevStx: opRes5671.prevStx,
                        prevTerms: opRes5671.prevTerms
                    }));
                }
            } else if (head5651.isExprTerm && (rest5652[0] && (unwrapSyntax5381(rest5652[0]) === "++" || unwrapSyntax5381(rest5652[0]) === "--"))) {
                if ( // Check if the operator is a macro first.
                hasSyntaxTransform5500(rest5652[0], context5647, context5647.phase)) {
                    var headStx5709 = tagWithTerm5509(head5651, head5651.destruct(context5647).reverse());
                    var opPrevStx5678 = headStx5709.concat(prevStx5648);
                    var opPrevTerms5679 = [head5651].concat(prevTerms5649);
                    var opRes5671 = enforest5506(rest5652, context5647, opPrevStx5678, opPrevTerms5679);
                    if (opRes5671.prevTerms.length < opPrevTerms5679.length) {
                        return opRes5671;
                    } else if (opRes5671.result) {
                        return step5650(head5651, opRes5671.result.destruct(context5647).concat(opRes5671.rest), opCtx5653);
                    }
                }
                return step5650(PostfixOpTerm5423.create(head5651, rest5652[0]), rest5652.slice(1), opCtx5653);
            } else if (head5651.isExprTerm && (rest5652[0] && rest5652[0].token.value === "[]")) {
                return step5650(ObjGetTerm5431.create(head5651, DelimiterTerm5395.create(rest5652[0])), rest5652.slice(1), opCtx5653);
            } else if (head5651.isExprTerm && (rest5652[0] && unwrapSyntax5381(rest5652[0]) === "." && !hasSyntaxTransform5500(rest5652[0], context5647, context5647.phase) && rest5652[1] && (rest5652[1].isIdentifier() || rest5652[1].isKeyword()))) {
                if ( // Check if the identifier is a macro first.
                hasSyntaxTransform5500(rest5652[1], context5647, context5647.phase)) {
                    var headStx5709 = tagWithTerm5509(head5651, head5651.destruct(context5647).reverse());
                    var dotTerm5714 = PuncTerm5394.create(rest5652[0]);
                    var dotTerms5715 = [dotTerm5714].concat(head5651, prevTerms5649);
                    var dotStx5716 = tagWithTerm5509(dotTerm5714, [rest5652[0]]).concat(headStx5709, prevStx5648);
                    var dotRes5717 = enforest5506(rest5652.slice(1), context5647, dotStx5716, dotTerms5715);
                    if (dotRes5717.prevTerms.length < dotTerms5715.length) {
                        return dotRes5717;
                    } else if (dotRes5717.result) {
                        return step5650(head5651, [rest5652[0]].concat(dotRes5717.result.destruct(context5647), dotRes5717.rest), opCtx5653);
                    }
                }
                return step5650(ObjDotGetTerm5430.create(head5651, rest5652[0], rest5652[1]), rest5652.slice(2), opCtx5653);
            } else if (head5651.isDelimiterTerm && head5651.delim.token.value === "[]") {
                return step5650(ArrayLiteralTerm5440.create(head5651), rest5652, opCtx5653);
            } else if (head5651.isDelimiterTerm && head5651.delim.token.value === "{}") {
                return step5650(BlockTerm5439.create(head5651), rest5652, opCtx5653);
            } else if (head5651.isIdTerm && unwrapSyntax5381(head5651.id) === "#quoteSyntax" && rest5652[0] && rest5652[0].token.value === "{}") {
                return step5650(QuoteSyntaxTerm5434.create(rest5652[0]), rest5652.slice(1), opCtx5653);
            } else if (head5651.isKeywordTerm && unwrapSyntax5381(head5651.keyword) === "return") {
                if (rest5652[0] && rest5652[0].token.lineNumber === head5651.keyword.token.lineNumber) {
                    var returnPrevStx5718 = tagWithTerm5509(head5651, head5651.destruct(context5647)).concat(opCtx5653.prevStx);
                    var returnPrevTerms5719 = [head5651].concat(opCtx5653.prevTerms);
                    var returnExpr5720 = enforest5506(rest5652, context5647, returnPrevStx5718, returnPrevTerms5719);
                    if (returnExpr5720.prevTerms.length < opCtx5653.prevTerms.length) {
                        return returnExpr5720;
                    }
                    if (returnExpr5720.result.isExprTerm) {
                        return step5650(ReturnStatementTerm5420.create(head5651, returnExpr5720.result), returnExpr5720.rest, opCtx5653);
                    }
                } else {
                    return step5650(ReturnStatementTerm5420.create(head5651, EmptyTerm5417.create()), rest5652, opCtx5653);
                }
            } else if (head5651.isKeywordTerm && unwrapSyntax5381(head5651.keyword) === "let") {
                var normalizedName5721;
                if (rest5652[0] && rest5652[0].isDelimiter() && rest5652[0].token.value === "()") {
                    normalizedName5721 = rest5652[0];
                } else {
                    normalizedName5721 = syn5361.makeDelim("()", [rest5652[0]], rest5652[0]);
                }
                var lsRes5722 = enforestVarStatement5492(rest5652, context5647, head5651.keyword);
                if (lsRes5722 && lsRes5722.result) {
                    return step5650(LetStatementTerm5447.create(head5651, lsRes5722.result), lsRes5722.rest, opCtx5653);
                }
            } else if (head5651.isKeywordTerm && unwrapSyntax5381(head5651.keyword) === "var" && rest5652[0]) {
                var vsRes5723 = enforestVarStatement5492(rest5652, context5647, head5651.keyword);
                if (vsRes5723 && vsRes5723.result) {
                    return step5650(VariableStatementTerm5446.create(head5651, vsRes5723.result), vsRes5723.rest, opCtx5653);
                }
            } else if (head5651.isKeywordTerm && unwrapSyntax5381(head5651.keyword) === "const" && rest5652[0]) {
                var csRes5724 = enforestVarStatement5492(rest5652, context5647, head5651.keyword);
                if (csRes5724 && csRes5724.result) {
                    return step5650(ConstStatementTerm5448.create(head5651, csRes5724.result), csRes5724.rest, opCtx5653);
                }
            } else if (head5651.isKeywordTerm && unwrapSyntax5381(head5651.keyword) === "for" && rest5652[0] && rest5652[0].token.value === "()") {
                return step5650(ForStatementTerm5419.create(head5651.keyword, rest5652[0]), rest5652.slice(1), opCtx5653);
            }
        } else {
            assert5376(head5651 && head5651.token, "assuming head is a syntax object");
            var macroObj5725 = expandCount5477 < maxExpands5478 && getSyntaxTransform5499([head5651].concat(rest5652), context5647, context5647.phase);
            if (head5651 && context5647.stopMap.has(resolve5368(head5651, context5647.phase))) {
                return step5650(StopQuotedTerm5435.create(head5651, rest5652[0]), rest5652.slice(1), opCtx5653);
            } else if (macroObj5725 && typeof macroObj5725.fn === "function" && !macroObj5725.isOp) {
                var rt5726 = expandMacro5502([head5651].concat(rest5652), context5647, opCtx5653, null, macroObj5725);
                var newOpCtx5727 = opCtx5653;
                if (rt5726.prevTerms && rt5726.prevTerms.length < opCtx5653.prevTerms.length) {
                    newOpCtx5727 = rewindOpCtx5507(opCtx5653, rt5726);
                }
                if (rt5726.result.length > 0) {
                    return step5650(rt5726.result[0], rt5726.result.slice(1).concat(rt5726.rest), newOpCtx5727);
                } else {
                    return step5650(EmptyTerm5417.create(), rt5726.rest, newOpCtx5727);
                }
            } else if (head5651.isIdentifier() && unwrapSyntax5381(head5651) === "macro" && resolve5368(head5651, context5647.phase) === "macro" && rest5652[0] && rest5652[0].token.value === "{}") {
                return step5650(AnonMacroTerm5411.create(rest5652[0].token.inner), rest5652.slice(1), opCtx5653);
            } else if (head5651.isIdentifier() && unwrapSyntax5381(head5651) === "stxrec" && resolve5368(head5651, context5647.phase) === "stxrec") {
                var normalizedName5721;
                if (rest5652[0] && rest5652[0].isDelimiter() && rest5652[0].token.value === "()") {
                    normalizedName5721 = rest5652[0];
                } else {
                    normalizedName5721 = syn5361.makeDelim("()", [rest5652[0]], rest5652[0]);
                }
                if (rest5652[1] && rest5652[1].isDelimiter()) {
                    return step5650(MacroTerm5410.create(normalizedName5721, rest5652[1].token.inner), rest5652.slice(2), opCtx5653);
                } else {
                    throwSyntaxError5378("enforest", "Macro declaration must include body", rest5652[1]);
                }
            } else if (head5651.isIdentifier() && head5651.token.value === "unaryop" && rest5652[0] && rest5652[0].isDelimiter() && rest5652[0].token.value === "()" && rest5652[1] && rest5652[1].isNumericLiteral() && rest5652[2] && rest5652[2].isDelimiter() && rest5652[2] && rest5652[2].token.value === "{}") {
                var trans5729 = enforest5506(rest5652[2].token.inner, context5647);
                return step5650(OperatorDefinitionTerm5413.create(syn5361.makeValue("unary", head5651), rest5652[0], rest5652[1], null, trans5729.result.body), rest5652.slice(3), opCtx5653);
            } else if (head5651.isIdentifier() && head5651.token.value === "binaryop" && rest5652[0] && rest5652[0].isDelimiter() && rest5652[0].token.value === "()" && rest5652[1] && rest5652[1].isNumericLiteral() && rest5652[2] && rest5652[2].isIdentifier() && rest5652[3] && rest5652[3].isDelimiter() && rest5652[3] && rest5652[3].token.value === "{}") {
                var trans5729 = enforest5506(rest5652[3].token.inner, context5647);
                return step5650(OperatorDefinitionTerm5413.create(syn5361.makeValue("binary", head5651), rest5652[0], rest5652[1], rest5652[2], trans5729.result.body), rest5652.slice(4), opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "function" && rest5652[0] && rest5652[0].isIdentifier() && rest5652[1] && rest5652[1].isDelimiter() && rest5652[1].token.value === "()" && rest5652[2] && rest5652[2].isDelimiter() && rest5652[2].token.value === "{}") {
                rest5652[1].token.inner = rest5652[1].token.inner;
                rest5652[2].token.inner = rest5652[2].token.inner;
                return step5650(NamedFunTerm5427.create(head5651, null, rest5652[0], rest5652[1], rest5652[2]), rest5652.slice(3), opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "function" && rest5652[0] && rest5652[0].isPunctuator() && rest5652[0].token.value === "*" && rest5652[1] && rest5652[1].isIdentifier() && rest5652[2] && rest5652[2].isDelimiter() && rest5652[2].token.value === "()" && rest5652[3] && rest5652[3].isDelimiter() && rest5652[3].token.value === "{}") {
                return step5650(NamedFunTerm5427.create(head5651, rest5652[0], rest5652[1], rest5652[2], rest5652[3]), rest5652.slice(4), opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "function" && rest5652[0] && rest5652[0].isDelimiter() && rest5652[0].token.value === "()" && rest5652[1] && rest5652[1].isDelimiter() && rest5652[1].token.value === "{}") {
                return step5650(AnonFunTerm5428.create(head5651, null, rest5652[0], rest5652[1]), rest5652.slice(2), opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "function" && rest5652[0] && rest5652[0].isPunctuator() && rest5652[0].token.value === "*" && rest5652[1] && rest5652[1].isDelimiter() && rest5652[1].token.value === "()" && rest5652[2] && rest5652[2].isDelimiter && rest5652[2].token.value === "{}") {
                rest5652[1].token.inner = rest5652[1].token.inner;
                rest5652[2].token.inner = rest5652[2].token.inner;
                return step5650(AnonFunTerm5428.create(head5651, rest5652[0], rest5652[1], rest5652[2]), rest5652.slice(3), opCtx5653);
            } else if ((head5651.isDelimiter() && head5651.token.value === "()" || head5651.isIdentifier()) && rest5652[0] && rest5652[0].isPunctuator() && resolveFast5495(rest5652[0], context5647, context5647.phase) === "=>" && rest5652[1] && rest5652[1].isDelimiter() && rest5652[1].token.value === "{}") {
                return step5650(ArrowFunTerm5429.create(head5651, rest5652[0], rest5652[1]), rest5652.slice(2), opCtx5653);
            } else if (head5651.isIdentifier() && head5651.token.value === "forPhase" && rest5652[0] && rest5652[0].isNumericLiteral() && rest5652[1] && rest5652[1].isDelimiter()) {
                return step5650(ForPhaseTerm5414.create(rest5652[0], rest5652[1].token.inner), rest5652.slice(2), opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "catch" && rest5652[0] && rest5652[0].isDelimiter() && rest5652[0].token.value === "()" && rest5652[1] && rest5652[1].isDelimiter() && rest5652[1].token.value === "{}") {
                rest5652[0].token.inner = rest5652[0].token.inner;
                rest5652[1].token.inner = rest5652[1].token.inner;
                return step5650(CatchClauseTerm5418.create(head5651, rest5652[0], rest5652[1]), rest5652.slice(2), opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "this") {
                return step5650(ThisExpressionTerm5437.create(head5651), rest5652, opCtx5653);
            } else if (head5651.isNumericLiteral() || head5651.isStringLiteral() || head5651.isBooleanLiteral() || head5651.isRegularExpression() || head5651.isNullLiteral()) {
                return step5650(LitTerm5438.create(head5651), rest5652, opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "import") {
                var imp5731 = enforestImport5491(head5651, rest5652);
                return step5650(imp5731.result, imp5731.rest, opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "export" && rest5652[0] && rest5652[0].isDelimiter()) {
                return step5650(ExportNameTerm5405.create(head5651, rest5652[0]), rest5652.slice(1), opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "export" && rest5652[0] && rest5652[0].isKeyword() && unwrapSyntax5381(rest5652[0]) === "default" && rest5652[1]) {
                var res5706 = enforest5506(rest5652.slice(1), context5647);
                return step5650(ExportDefaultTerm5406.create(head5651, rest5652[0], res5706.result), res5706.rest, opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "export" && rest5652[0]) {
                var res5706 = enforest5506(rest5652, context5647);
                return step5650(ExportDeclTerm5407.create(head5651, res5706.result), res5706.rest, opCtx5653);
            } else if (head5651.isIdentifier()) {
                return step5650(IdTerm5441.create(head5651), rest5652, opCtx5653);
            } else if (head5651.isPunctuator()) {
                return step5650(PuncTerm5394.create(head5651), rest5652, opCtx5653);
            } else if (head5651.isKeyword() && unwrapSyntax5381(head5651) === "with") {
                throwSyntaxError5378("enforest", "with is not supported in sweet.js", head5651);
            } else if (head5651.isKeyword()) {
                return step5650(KeywordTerm5393.create(head5651), rest5652, opCtx5653);
            } else if (head5651.isDelimiter()) {
                return step5650(DelimiterTerm5395.create(head5651), rest5652, opCtx5653);
            } else if (head5651.isTemplate()) {
                return step5650(TemplateTerm5432.create(head5651), rest5652, opCtx5653);
            } else if (head5651.isEOF()) {
                assert5376(rest5652.length === 0, "nothing should be after an EOF");
                return step5650(EOFTerm5392.create(head5651), [], opCtx5653);
            } else {
                // todo: are we missing cases?
                assert5376(false, "not implemented");
            }
        }
        if ( // Potentially an infix macro
        // This should only be invoked on runtime syntax terms
        !head5651.isMacroTerm && !head5651.isLetMacroTerm && !head5651.isAnonMacroTerm && !head5651.isOperatorDefinitionTerm && rest5652.length && hasSyntaxTransform5500(rest5652, context5647, context5647.phase) && getSyntaxTransform5499(rest5652, context5647, context5647.phase).isOp === false) {
            var infLeftTerm5734 = opCtx5653.prevTerms[0] && opCtx5653.prevTerms[0].isPartialTerm ? opCtx5653.prevTerms[0] : null;
            var infTerm5735 = PartialExpressionTerm5444.create(head5651.destruct(context5647), infLeftTerm5734, function () {
                return step5650(head5651, [], opCtx5653);
            });
            var infPrevStx5736 = tagWithTerm5509(infTerm5735, head5651.destruct(context5647)).reverse().concat(opCtx5653.prevStx);
            var infPrevTerms5737 = [infTerm5735].concat(opCtx5653.prevTerms);
            var infRes5738 = expandMacro5502(rest5652, context5647, {
                prevStx: infPrevStx5736,
                prevTerms: infPrevTerms5737
            });
            if (infRes5738.prevTerms && infRes5738.prevTerms.length < infPrevTerms5737.length) {
                var infOpCtx5739 = rewindOpCtx5507(opCtx5653, infRes5738);
                return step5650(infRes5738.result[0], infRes5738.result.slice(1).concat(infRes5738.rest), infOpCtx5739);
            } else {
                return step5650(head5651, infRes5738.result.concat(infRes5738.rest), opCtx5653);
            }
        }
        var // done with current step so combine and continue on
        combResult5655 = opCtx5653.combine(head5651);
        if (opCtx5653.stack.length === 0) {
            return {
                result: combResult5655.term,
                rest: rest5652,
                prevStx: combResult5655.prevStx,
                prevTerms: combResult5655.prevTerms
            };
        } else {
            return step5650(combResult5655.term, rest5652, opCtx5653.stack[0]);
        }
    }
    return step5650(toks5646[0], toks5646.slice(1), {
        combine: function combine(t5740) {
            return {
                term: t5740,
                prevStx: prevStx5648,
                prevTerms: prevTerms5649
            };
        },
        prec: 0,
        stack: [],
        op: null,
        prevStx: prevStx5648,
        prevTerms: prevTerms5649
    });
}
function rewindOpCtx5507(opCtx5741, res5742) {
    if ( // If we've consumed all pending operators, we can just start over.
    // It's important that we always thread the new prevStx and prevTerms
    // through, otherwise the old ones will still persist.
    !res5742.prevTerms.length || !res5742.prevTerms[0].isPartialTerm) {
        return _5359.extend({}, opCtx5741, {
            combine: function combine(t5746) {
                return {
                    term: t5746,
                    prevStx: res5742.prevStx,
                    prevTerms: res5742.prevTerms
                };
            },
            prec: 0,
            op: null,
            stack: [],
            prevStx: res5742.prevStx,
            prevTerms: res5742.prevTerms
        });
    }
    // To rewind, we need to find the first (previous) pending operator. It
    // acts as a marker in the opCtx to let us know how far we need to go
    // back.
    var op5743 = null;
    for (var i5744 = 0; i5744 < res5742.prevTerms.length; i5744++) {
        if (!res5742.prevTerms[i5744].isPartialTerm) {
            break;
        }
        if (res5742.prevTerms[i5744].isPartialOperationTerm) {
            op5743 = res5742.prevTerms[i5744];
            break;
        }
    }
    if ( // If the op matches the current opCtx, we don't need to rewind
    // anything, but we still need to persist the prevStx and prevTerms.
    opCtx5741.op === op5743) {
        return _5359.extend({}, opCtx5741, {
            prevStx: res5742.prevStx,
            prevTerms: res5742.prevTerms
        });
    }
    for (var i5744 = 0; i5744 < opCtx5741.stack.length; i5744++) {
        if (opCtx5741.stack[i5744].op === op5743) {
            return _5359.extend({}, opCtx5741.stack[i5744], {
                prevStx: res5742.prevStx,
                prevTerms: res5742.prevTerms
            });
        }
    }
    assert5376(false, "Rewind failed.");
}
function get_expression5508(stx5747, context5748) {
    if (stx5747[0].term) {
        for (var termLen5750 = 1; termLen5750 < stx5747.length; termLen5750++) {
            if (stx5747[termLen5750].term !== stx5747[0].term) {
                break;
            }
        }
        if ( // Guard the termLen because we can have a multi-token term that
        // we don't want to split. TODO: is there something we can do to
        // get around this safely?
        stx5747[0].term.isPartialExpressionTerm && termLen5750 === stx5747[0].term.stx.length) {
            var expr5751 = stx5747[0].term.combine().result;
            for (var i5752 = 1, term5753 = stx5747[0].term; i5752 < stx5747.length; i5752++) {
                if (stx5747[i5752].term !== term5753) {
                    if (term5753 && term5753.isPartialTerm) {
                        term5753 = term5753.left;
                        i5752--;
                    } else {
                        break;
                    }
                }
            }
            return {
                result: expr5751,
                rest: stx5747.slice(i5752)
            };
        } else if (stx5747[0].term.isExprTerm) {
            return {
                result: stx5747[0].term,
                rest: stx5747.slice(termLen5750)
            };
        } else {
            return {
                result: null,
                rest: stx5747
            };
        }
    }
    var res5749 = enforest5506(stx5747, context5748);
    if (!res5749.result || !res5749.result.isExprTerm) {
        return {
            result: null,
            rest: stx5747
        };
    }
    return res5749;
}
function tagWithTerm5509(term5754, stx5755) {
    return stx5755.map(function (s5756) {
        s5756 = s5756.clone();
        s5756.term = term5754;
        return s5756;
    });
}
function applyMarkToPatternEnv5510(newMark5757, env5758) {
    function dfs5759(match5760) {
        if (match5760.level === 0) {
            // replace the match property with the marked syntax
            match5760.match = _5359.map(match5760.match, function (stx5761) {
                return stx5761.mark(newMark5757);
            });
        } else {
            _5359.each(match5760.match, function (match5762) {
                dfs5759(match5762);
            });
        }
    }
    _5359.keys(env5758).forEach(function (key5763) {
        dfs5759(env5758[key5763]);
    });
}
function markIn5511(arr5764, mark5765) {
    return arr5764.map(function (stx5766) {
        return stx5766.mark(mark5765);
    });
}
function markDefOut5512(arr5767, mark5768, def5769) {
    return arr5767.map(function (stx5770) {
        return stx5770.mark(mark5768);
    });
}
function loadMacroDef5513(body5771, context5772, phase5773) {
    var expanded5774 = body5771[0].destruct(context5772, { stripCompileTerm: true });
    var stub5775 = parser5360.read("()");
    stub5775[0].token.inner = expanded5774;
    var flattend5776 = flatten5537(stub5775);
    var bodyCode5777 = codegen5358.generate(parser5360.parse(flattend5776, { phase: phase5773 }));
    var localCtx5778;
    var macroGlobal5779 = {
        makeValue: syn5361.makeValue,
        makeRegex: syn5361.makeRegex,
        makeIdent: syn5361.makeIdent,
        makeKeyword: syn5361.makeKeyword,
        makePunc: syn5361.makePunc,
        makeDelim: syn5361.makeDelim,
        localExpand: function localExpand(stx5781, stop5782) {
            stop5782 = stop5782 || [];
            var markedStx5783 = markIn5511(stx5781, localCtx5778.mark);
            var stopMap5784 = new StringMap5363();
            stop5782.forEach(function (stop5788) {
                stopMap5784.set(resolve5368(stop5788, localCtx5778.phase), true);
            });
            var localExpandCtx5785 = makeExpanderContext5517(_5359.extend({}, localCtx5778, { stopMap: stopMap5784 }));
            var terms5786 = expand5516(markedStx5783, localExpandCtx5785);
            var newStx5787 = terms5786.reduce(function (acc5789, term5790) {
                acc5789.push.apply(acc5789, term5790.destruct(localCtx5778, { stripCompileTerm: true }));
                return acc5789;
            }, []);
            return markDefOut5512(newStx5787, localCtx5778.mark, localCtx5778.defscope);
        },
        filename: context5772.filename,
        getExpr: function getExpr(stx5791) {
            if (stx5791.length === 0) {
                return {
                    success: false,
                    result: [],
                    rest: []
                };
            }
            var markedStx5792 = markIn5511(stx5791, localCtx5778.mark);
            var r5793 = get_expression5508(markedStx5792, localCtx5778);
            return {
                success: r5793.result !== null,
                result: r5793.result === null ? [] : markDefOut5512(r5793.result.destruct(localCtx5778, { stripCompileTerm: true }), localCtx5778.mark, localCtx5778.defscope),
                rest: markDefOut5512(r5793.rest, localCtx5778.mark, localCtx5778.defscope)
            };
        },
        getIdent: function getIdent(stx5794) {
            if (stx5794[0] && stx5794[0].isIdentifier()) {
                return {
                    success: true,
                    result: [stx5794[0]],
                    rest: stx5794.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5794
            };
        },
        getLit: function getLit(stx5795) {
            if (stx5795[0] && patternModule5374.typeIsLiteral(stx5795[0].token.type)) {
                return {
                    success: true,
                    result: [stx5795[0]],
                    rest: stx5795.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5795
            };
        },
        unwrapSyntax: syn5361.unwrapSyntax,
        throwSyntaxError: throwSyntaxError5378,
        throwSyntaxCaseError: throwSyntaxCaseError5379,
        prettyPrint: syn5361.prettyPrint,
        parser: parser5360,
        __fresh: fresh5387,
        __freshScope: freshScope5388,
        __scope: context5772.scope,
        __bindings: context5772.bindings,
        _: _5359,
        patternModule: patternModule5374,
        getPattern: function getPattern(id5796) {
            return context5772.patternMap.get(id5796);
        },
        getPatternMap: function getPatternMap() {
            return context5772.patternMap;
        },
        getTemplate: function getTemplate(id5797) {
            assert5376(context5772.templateMap.has(id5797), "missing template");
            return syn5361.cloneSyntaxArray(context5772.templateMap.get(id5797));
        },
        getTemplateMap: function getTemplateMap() {
            // the template map is global across all context during compilation
            return context5772.templateMap;
        },
        applyMarkToPatternEnv: applyMarkToPatternEnv5510,
        mergeMatches: function mergeMatches(newMatch5798, oldMatch5799) {
            newMatch5798.patternEnv = _5359.extend({}, oldMatch5799.patternEnv, newMatch5798.patternEnv);
            return newMatch5798;
        },
        console: console
    };
    context5772.env.keysStr().forEach(function (key5800) {
        var val5801 = context5772.env.getStr(key5800);
        if ( // load the runtime values into the global object
        val5801 && val5801 instanceof RuntimeValue5497) {
            macroGlobal5779[key5800] = val5801.trans.value;
        }
    });
    context5772.store.keysStr().forEach(function (key5802) {
        var val5803 = context5772.store.getStr(key5802);
        if ( // load the runtime values into the global object
        val5803 && val5803 instanceof RuntimeValue5497) {
            macroGlobal5779[key5802] = val5803.trans.value;
        }
    });
    var macroFn5780;
    // if (!vm) {
    //     macroFn = vm.runInNewContext("(function() { return " + bodyCode + " })()",
    //                                  macroGlobal);
    // } else {
    macroFn5780 = scopedEval5473(bodyCode5777, macroGlobal5779);
    return function (stx5804, context5805, prevStx5806, prevTerms5807) {
        localCtx5778 = context5805;
        return macroFn5780(stx5804, context5805, prevStx5806, prevTerms5807);
    };
}
function expandToTermTree5514(stx5808, context5809) {
    assert5376(context5809, "expander context is required");
    var f5810, head5811, prevStx5812, restStx5813, prevTerms5814, macroDefinition5815;
    var rest5816 = stx5808;
    while (rest5816.length > 0) {
        assert5376(rest5816[0].token, "expecting a syntax object");
        f5810 = enforest5506(rest5816, context5809, prevStx5812, prevTerms5814);
        // head :: TermTree
        head5811 = f5810.result;
        // rest :: [Syntax]
        rest5816 = f5810.rest;
        if (!head5811) {
            // no head means the expansions stopped prematurely (for stepping)
            restStx5813 = rest5816;
            break;
        }
        var destructed5817 = tagWithTerm5509(head5811, f5810.result.destruct(context5809));
        prevTerms5814 = [head5811].concat(f5810.prevTerms);
        prevStx5812 = destructed5817.reverse().concat(f5810.prevStx);
        if (head5811.isImportTerm) {
            var // record the import in the module record for easier access
            entries5818 = context5809.moduleRecord.addImport(head5811);
            var // load up the (possibly cached) import module
            importMod5819 = loadImport5529(unwrapSyntax5381(head5811.from), context5809, context5809.moduleRecord.name);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5809 = visit5526(importMod5819.term, importMod5819.record, context5809.phase, context5809);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5530(entries5818, importMod5819.term, importMod5819.record, context5809, context5809.phase);
        }
        if (head5811.isImportForPhaseTerm) {
            var // record the import in the module record for easier access
            entries5818 = context5809.moduleRecord.addImport(head5811);
            var // load up the (possibly cached) import module
            importMod5819 = loadImport5529(unwrapSyntax5381(head5811.from), context5809, context5809.moduleRecord.name);
            // invoking an imported module loads the runtime values
            // into the environment for this phase
            context5809 = invoke5524(importMod5819.term, importMod5819.record, context5809.phase + head5811.phase.token.value, context5809);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5809 = visit5526(importMod5819.term, importMod5819.record, context5809.phase + head5811.phase.token.value, context5809);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5530(entries5818, importMod5819.term, importMod5819.record, context5809, context5809.phase);
        }
        if (head5811.isForPhaseTerm) {
            var phaseShiftedContext5822 = makeExpanderContext5517(_5359.defaults({ phase: context5809.phase + head5811.phase.token.value }, context5809));
            head5811.body = expand5516(head5811.body, phaseShiftedContext5822);
        }
        if ((head5811.isExportDefaultTerm && head5811.decl.isMacroTerm || head5811.isMacroTerm) && expandCount5477 < maxExpands5478) {
            var macroDecl5823 = head5811.isExportDefaultTerm ? head5811.decl : head5811;
            if (!( // raw function primitive form
            macroDecl5823.body[0] && macroDecl5823.body[0].isKeyword() && macroDecl5823.body[0].token.value === "function")) {
                throwSyntaxError5378("load macro", "Primitive macro form must contain a function for the macro body", macroDecl5823.body);
            }
            // expand the body
            macroDecl5823.body = expand5516(macroDecl5823.body, makeExpanderContext5517(_5359.defaults({ phase: context5809.phase + 1 }, context5809)));
            //  and load the macro definition into the environment
            macroDefinition5815 = loadMacroDef5513(macroDecl5823.body, context5809, context5809.phase + 1);
            var fullName5824 = macroDecl5823.name.token.inner;
            var multiTokName5825 = makeMultiToken5389(macroDecl5823.name);
            multiTokName5825 = multiTokName5825.delScope(context5809.useScope);
            context5809.bindings.add(multiTokName5825, fresh5387(), context5809.phase);
            context5809.env.set(multiTokName5825, context5809.phase, new CompiletimeValue5496(new SyntaxTransform5366(macroDefinition5815, false, builtinMode5476, fullName5824), context5809.moduleRecord.name, context5809.phase));
        }
        if (head5811.isLetMacroTerm && expandCount5477 < maxExpands5478) {
            if (!( // raw function primitive form
            head5811.body[0] && head5811.body[0].isKeyword() && head5811.body[0].token.value === "function")) {
                throwSyntaxError5378("load macro", "Primitive macro form must contain a function for the macro body", head5811.body);
            }
            // expand the body
            head5811.body = expand5516(head5811.body, makeExpanderContext5517(_5359.defaults({ phase: context5809.phase + 1 }, context5809)));
            //  and load the macro definition into the environment
            macroDefinition5815 = loadMacroDef5513(head5811.body, context5809, context5809.phase + 1);
            var _fullName5824 = head5811.name.token.inner;
            var _multiTokName5825 = makeMultiToken5389(head5811.name);
            // var freshName = fresh();
            // var renamedName = multiTokName.rename(multiTokName, freshName);
            //
            // head.name = head.name.rename(multiTokName, freshName);
            // rest = _.map(rest, function(stx) {
            //     return stx.rename(multiTokName, freshName);
            // });
            _multiTokName5825 = _multiTokName5825.delScope(context5809.useScope);
            context5809.bindings.add(_multiTokName5825, fresh5387(), context5809.phase);
            context5809.env.set(_multiTokName5825, context5809.phase, new CompiletimeValue5496(new SyntaxTransform5366(macroDefinition5815, false, builtinMode5476, _fullName5824), context5809.moduleRecord.name, context5809.phase));
        }
        if (head5811.isOperatorDefinitionTerm) {
            if (!( // raw function primitive form
            head5811.body[0] && head5811.body[0].isKeyword() && head5811.body[0].token.value === "function")) {
                throwSyntaxError5378("load macro", "Primitive macro form must contain a function for the macro body", head5811.body);
            }
            // expand the body
            head5811.body = expand5516(head5811.body, makeExpanderContext5517(_5359.defaults({ phase: context5809.phase + 1 }, context5809)));
            var //  and load the macro definition into the environment
            opDefinition5828 = loadMacroDef5513(head5811.body, context5809, context5809.phase + 1);
            var fullName5824 = head5811.name.token.inner;
            var multiTokName5825 = makeMultiToken5389(head5811.name);
            multiTokName5825 = multiTokName5825.delScope(context5809.useScope);
            context5809.bindings.add(multiTokName5825, fresh5387(), context5809.phase);
            var opObj5831 = getSyntaxTransform5499(multiTokName5825, context5809, context5809.phase);
            if (!opObj5831) {
                opObj5831 = {
                    isOp: true,
                    builtin: builtinMode5476,
                    fullName: fullName5824
                };
            }
            assert5376(unwrapSyntax5381(head5811.type) === "binary" || unwrapSyntax5381(head5811.type) === "unary", "operator must either be binary or unary");
            opObj5831[unwrapSyntax5381(head5811.type)] = {
                fn: opDefinition5828,
                prec: head5811.prec.token.value,
                assoc: head5811.assoc ? head5811.assoc.token.value : null
            };
            context5809.env.set(multiTokName5825, context5809.phase, new CompiletimeValue5496(opObj5831, context5809.moduleRecord.name, context5809.phase));
        }
        if (head5811.isNamedFunTerm) {
            // addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            head5811.name = head5811.name.delScope(context5809.useScope);
            context5809.bindings.add(head5811.name, fresh5387(), context5809.phase);
        }
        if (head5811.isVariableStatementTerm || head5811.isLetStatementTerm || head5811.isConstStatementTerm) {
            head5811.decls = head5811.decls.map(function (decl5832) {
                decl5832.ident = decl5832.ident.delScope(context5809.useScope);
                context5809.bindings.add(decl5832.ident, fresh5387(), context5809.phase);
                return decl5832;
            });
        }
        if (head5811.isBlockTerm && head5811.body.isDelimiterTerm) {
            head5811.body.delim.token.inner.forEach(function (term5833) {
                if (term5833.isVariableStatementTerm) {
                    term5833.decls = term5833.decls.map(function (decl5834) {
                        decl5834.ident = decl5834.ident.delScope(context5809.useScope);
                        context5809.bindings.add(decl5834.ident, fresh5387(), context5809.phase);
                        return decl5834;
                    });
                }
            });
        }
        if (head5811.isDelimiterTerm) {
            head5811.delim.token.inner.forEach(function (term5835) {
                if (term5835.isVariableStatementTerm) {
                    term5835.decls = term5835.decls.map(function (decl5836) {
                        decl5836.ident = decl5836.ident.delScope(context5809.useScope);
                        context5809.bindings.add(decl5836.ident, fresh5387(), context5809.phase);
                        return decl5836;
                    });
                }
            });
        }
        if (head5811.isForStatementTerm) {
            var forCond5837 = head5811.cond.token.inner;
            if (forCond5837[0] && resolve5368(forCond5837[0], context5809.phase) === "let" && forCond5837[1] && forCond5837[1].isIdentifier()) {
                var letNew5838 = fresh5387();
                var letId5839 = forCond5837[1];
                forCond5837 = forCond5837.map(function (stx5840) {
                    return stx5840.rename(letId5839, letNew5838);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head5811.cond.token.inner = expand5516([forCond5837[0]], context5809).concat(expand5516(forCond5837.slice(1), context5809));
                if ( // nice and easy case: `for (...) { ... }`
                rest5816[0] && rest5816[0].token.value === "{}") {
                    rest5816[0] = rest5816[0].rename(letId5839, letNew5838);
                } else {
                    var // need to deal with things like `for (...) if (...) log(...)`
                    bodyEnf5841 = enforest5506(rest5816, context5809);
                    var bodyDestructed5842 = bodyEnf5841.result.destruct(context5809);
                    var renamedBodyTerm5843 = bodyEnf5841.result.rename(letId5839, letNew5838);
                    tagWithTerm5509(renamedBodyTerm5843, bodyDestructed5842);
                    rest5816 = bodyEnf5841.rest;
                    prevStx5812 = bodyDestructed5842.reverse().concat(prevStx5812);
                    prevTerms5814 = [renamedBodyTerm5843].concat(prevTerms5814);
                }
            } else {
                head5811.cond.token.inner = expand5516(head5811.cond.token.inner, context5809);
            }
        }
    }
    return {
        // prevTerms are stored in reverse for the purposes of infix
        // lookbehind matching, so we need to re-reverse them.
        terms: prevTerms5814 ? prevTerms5814.reverse() : [],
        restStx: restStx5813,
        context: context5809
    };
}
function expandTermTreeToFinal5515(term5844, context5845) {
    assert5376(context5845 && context5845.env, "environment map is required");
    if (term5844.isArrayLiteralTerm) {
        term5844.array.delim.token.inner = expand5516(term5844.array.delim.token.inner, context5845);
        return term5844;
    } else if (term5844.isBlockTerm) {
        term5844.body.delim.token.inner = expand5516(term5844.body.delim.token.inner, context5845);
        return term5844;
    } else if (term5844.isParenExpressionTerm) {
        term5844.args = _5359.map(term5844.args, function (arg5846) {
            return expandTermTreeToFinal5515(arg5846, context5845);
        });
        return term5844;
    } else if (term5844.isCallTerm) {
        term5844.fun = expandTermTreeToFinal5515(term5844.fun, context5845);
        term5844.args = expandTermTreeToFinal5515(term5844.args, context5845);
        return term5844;
    } else if (term5844.isReturnStatementTerm) {
        term5844.expr = expandTermTreeToFinal5515(term5844.expr, context5845);
        return term5844;
    } else if (term5844.isUnaryOpTerm) {
        term5844.expr = expandTermTreeToFinal5515(term5844.expr, context5845);
        return term5844;
    } else if (term5844.isBinOpTerm || term5844.isAssignmentExpressionTerm) {
        term5844.left = expandTermTreeToFinal5515(term5844.left, context5845);
        term5844.right = expandTermTreeToFinal5515(term5844.right, context5845);
        return term5844;
    } else if (term5844.isObjGetTerm) {
        term5844.left = expandTermTreeToFinal5515(term5844.left, context5845);
        term5844.right.delim.token.inner = expand5516(term5844.right.delim.token.inner, context5845);
        return term5844;
    } else if (term5844.isObjDotGetTerm) {
        term5844.left = expandTermTreeToFinal5515(term5844.left, context5845);
        term5844.right = expandTermTreeToFinal5515(term5844.right, context5845);
        return term5844;
    } else if (term5844.isConditionalExpressionTerm) {
        term5844.cond = expandTermTreeToFinal5515(term5844.cond, context5845);
        term5844.tru = expandTermTreeToFinal5515(term5844.tru, context5845);
        term5844.fls = expandTermTreeToFinal5515(term5844.fls, context5845);
        return term5844;
    } else if (term5844.isVariableDeclarationTerm) {
        if (term5844.init) {
            term5844.init = expandTermTreeToFinal5515(term5844.init, context5845);
        }
        return term5844;
    } else if (term5844.isVariableStatementTerm) {
        term5844.decls = _5359.map(term5844.decls, function (decl5847) {
            return expandTermTreeToFinal5515(decl5847, context5845);
        });
        return term5844;
    } else if (term5844.isDelimiterTerm) {
        // expand inside the delimiter and then continue on
        term5844.delim.token.inner = expand5516(term5844.delim.token.inner, context5845);
        return term5844;
    } else if (term5844.isIdTerm) {
        var varTrans5848 = getCompiletimeValue5498(term5844.id, context5845, context5845.phase);
        if (varTrans5848 instanceof VarTransform5367) {
            term5844.id = syntaxFromToken5474(term5844.id.token, varTrans5848.id);
        }
        return term5844;
    } else if (term5844.isNamedFunTerm || term5844.isAnonFunTerm || term5844.isCatchClauseTerm || term5844.isArrowFunTerm || term5844.isModuleTerm) {
        var newDef5849;
        var paramSingleIdent5852;
        var params5853;
        var bodies5854;
        var paramNames5855;
        var bodyContext5856;
        var renamedBody5857;
        var expandedResult5858;
        var bodyTerms5859;
        var renamedParams5860;
        var flatArgs5861;
        var puncCtx5867;
        var expandedArgs5862;

        var _ret = (function () {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            newDef5849 = [];

            var scope5850 = freshScope5388(context5845.bindings);
            var useScope5851 = freshScope5388(context5845.bindings);
            paramSingleIdent5852 = term5844.params && term5844.params.isIdentifier();

            if (term5844.params && term5844.params.isDelimiter()) {
                params5853 = term5844.params;
            } else if (paramSingleIdent5852) {
                params5853 = term5844.params;
            } else {
                params5853 = syn5361.makeDelim("()", [], null);
            }

            if (Array.isArray(term5844.body)) {
                bodies5854 = syn5361.makeDelim("{}", term5844.body, null);
            } else {
                bodies5854 = term5844.body;
            }
            paramNames5855 = _5359.map(getParamIdentifiers5482(params5853), function (param5863) {
                var paramNew5864 = param5863.mark(scope5850);
                context5845.bindings.add(paramNew5864, fresh5387(), context5845.phase);
                context5845.env.set(paramNew5864, context5845.phase, new CompiletimeValue5496(new VarTransform5367(paramNew5864), context5845.moduleRecord.name, context5845.phase));
                return {
                    originalParam: param5863,
                    renamedParam: paramNew5864
                };
            });
            bodyContext5856 = makeExpanderContext5517(_5359.defaults({
                scope: scope5850,
                useScope: useScope5851,
                defscope: newDef5849,
                // paramscope is used to filter out var redeclarations
                paramscope: paramNames5855.map(function (p5865) {
                    return p5865.renamedParam;
                })
            }, context5845));
            renamedBody5857 = bodies5854.mark(scope5850);
            expandedResult5858 = expandToTermTree5514(renamedBody5857.token.inner, bodyContext5856);
            bodyTerms5859 = expandedResult5858.terms;

            if (expandedResult5858.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody5857.token.inner = expandedResult5858.terms.concat(expandedResult5858.restStx);
                if (Array.isArray(term5844.body)) {
                    term5844.body = renamedBody5857.token.inner;
                } else {
                    term5844.body = renamedBody5857;
                }
                return {
                    v: term5844
                };
            }
            renamedParams5860 = _5359.map(paramNames5855, function (p5866) {
                return p5866.renamedParam;
            });

            if (paramSingleIdent5852) {
                flatArgs5861 = renamedParams5860[0];
            } else {
                puncCtx5867 = term5844.params || null;

                flatArgs5861 = syn5361.makeDelim("()", joinSyntax5475(renamedParams5860, syn5361.makePunc(",", puncCtx5867)), puncCtx5867);
            }
            expandedArgs5862 = expand5516([flatArgs5861], bodyContext5856);

            assert5376(expandedArgs5862.length === 1, "should only get back one result");
            if ( // stitch up the function with all the renamings
            term5844.params) {
                term5844.params = expandedArgs5862[0];
            }
            bodyTerms5859 = _5359.map(bodyTerms5859, function (bodyTerm5868) {
                if ( // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                bodyTerm5868.isBlockTerm) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal5869 = expandTermTreeToFinal5515(bodyTerm5868, expandedResult5858.context);
                    return blockFinal5869;
                } else {
                    var termWithCtx5870 = bodyTerm5868;
                    // finish expansion
                    return expandTermTreeToFinal5515(termWithCtx5870, expandedResult5858.context);
                }
            });
            if (term5844.isModuleTerm) {
                bodyTerms5859.forEach(function (bodyTerm5871) {
                    if (bodyTerm5871.isExportNameTerm || bodyTerm5871.isExportDeclTerm || bodyTerm5871.isExportDefaultTerm) {
                        context5845.moduleRecord.addExport(bodyTerm5871);
                    }
                });
            }
            renamedBody5857.token.inner = bodyTerms5859;
            if (Array.isArray(term5844.body)) {
                term5844.body = renamedBody5857.token.inner;
            } else {
                term5844.body = renamedBody5857;
            }
            // and continue expand the rest
            return {
                v: term5844
            };
        })();

        if (typeof _ret === "object") return _ret.v;
    }
    // the term is fine as is
    return term5844;
}
function expand5516(stx5872, context5873) {
    assert5376(context5873, "must provide an expander context");
    var trees5874 = expandToTermTree5514(stx5872, context5873);
    var terms5875 = _5359.map(trees5874.terms, function (term5876) {
        return expandTermTreeToFinal5515(term5876, trees5874.context);
    });
    if (trees5874.restStx) {
        terms5875.push.apply(terms5875, trees5874.restStx);
    }
    return terms5875;
}
function makeExpanderContext5517(o5877) {
    o5877 = o5877 || {};
    var env5878 = o5877.env || new NameMap5364();
    var store5879 = o5877.store || new NameMap5364();
    var bindings5880 = o5877.bindings || new BindingMap5365();
    return Object.create(Object.prototype, {
        filename: {
            value: o5877.filename,
            writable: false,
            enumerable: true,
            configurable: false
        },
        compileSuffix: {
            value: o5877.compileSuffix || ".jsc",
            writable: false,
            enumerable: true,
            configurable: false
        },
        env: {
            value: env5878,
            writable: false,
            enumerable: true,
            configurable: false
        },
        store: {
            value: store5879,
            writable: false,
            enumerable: true,
            configurable: false
        },
        defscope: {
            value: o5877.defscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        paramscope: {
            value: o5877.paramscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        templateMap: {
            value: o5877.templateMap || new StringMap5363(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        patternMap: {
            value: o5877.patternMap || new StringMap5363(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        mark: {
            value: o5877.mark,
            writable: false,
            enumerable: true,
            configurable: false
        },
        bindings: {
            value: bindings5880,
            writable: false,
            enumerable: true,
            configurable: false
        },
        scope: {
            value: o5877.scope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        useScope: {
            value: o5877.useScope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        phase: {
            value: o5877.phase || 0,
            writable: false,
            enumerable: true,
            configurable: false
        },
        implicitImport: {
            value: o5877.implicitImport || new StringMap5363(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        stopMap: {
            value: o5877.stopMap || new StringMap5363(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        moduleRecord: {
            value: o5877.moduleRecord || {},
            writable: false,
            enumerable: true,
            configurable: false
        }
    });
}
function makeModuleExpanderContext5518(filename5881, templateMap5882, patternMap5883, phase5884, moduleRecord5885, compileSuffix5886, bindings5887) {
    return makeExpanderContext5517({
        filename: filename5881,
        templateMap: templateMap5882,
        patternMap: patternMap5883,
        phase: phase5884,
        moduleRecord: moduleRecord5885,
        compileSuffix: compileSuffix5886,
        bindings: bindings5887
    });
}
function makeTopLevelExpanderContext5519(options5888) {
    var filename5889 = options5888 && options5888.filename ? options5888.filename : "<anonymous module>";
    return makeExpanderContext5517({ filename: filename5889 });
}
function resolvePath5520(name5890, parent5891) {
    var path5892 = require("path");
    var resolveSync5893 = require("resolve/lib/sync");
    var root5894 = path5892.dirname(parent5891);
    var fs5895 = require("fs");
    if (name5890[0] === ".") {
        name5890 = path5892.resolve(root5894, name5890);
    }
    return resolveSync5893(name5890, {
        basedir: root5894,
        extensions: [".js", ".sjs"]
    });
}
function defaultImportStx5521(importPath5896, ctx5897) {
    var rtNames5898 = ["stxnonrec", "stxrec", "macroclass", "operator"];
    var ctNames5899 = ["quoteSyntax", "syntax", "#", "syntaxCase", "stxnonrec", "stxrec", "withSyntax", "letstx", "macroclass", "operator"];
    var importNames5900 = rtNames5898.map(function (name5904) {
        return syn5361.makeIdent(name5904, ctx5897);
    });
    var importForMacrosNames5901 = ctNames5899.map(function (name5905) {
        return syn5361.makeIdent(name5905, ctx5897);
    });
    var // import { names ... } from "importPath" for phase 1
    importForMacrosStmt5902 = [syn5361.makeKeyword("import", ctx5897), syn5361.makeDelim("{}", joinSyntax5475(importForMacrosNames5901, syn5361.makePunc(",", ctx5897)), ctx5897), syn5361.makeIdent("from", ctx5897), syn5361.makeValue(importPath5896, ctx5897), syn5361.makeKeyword("for", ctx5897), syn5361.makeIdent("phase", ctx5897), syn5361.makeValue(1, ctx5897)];
    var // import { names ... } from "importPath"
    importStmt5903 = [syn5361.makeKeyword("import", ctx5897), syn5361.makeDelim("{}", joinSyntax5475(importNames5900, syn5361.makePunc(",", ctx5897)), ctx5897), syn5361.makeIdent("from", ctx5897), syn5361.makeValue(importPath5896, ctx5897)];
    return importStmt5903.concat(importForMacrosStmt5902);
}
function createModule5522(name5906, body5907) {
    var language5908 = "base";
    var modBody5909 = body5907;
    if (body5907 && body5907[0] && body5907[1] && body5907[2] && unwrapSyntax5381(body5907[0]) === "#" && unwrapSyntax5381(body5907[1]) === "lang" && body5907[2].isStringLiteral()) {
        language5908 = unwrapSyntax5381(body5907[2]);
        // consume optional semicolon
        modBody5909 = body5907[3] && body5907[3].token.value === ";" && body5907[3].isPunctuator() ? body5907.slice(4) : body5907.slice(3);
    }
    if ( // insert the default import statements into the module body
    language5908 !== "base" && language5908 !== "js") {
        // "base" and "js" are currently special languages meaning don't
        // insert the default imports
        modBody5909 = defaultImportStx5521(language5908, body5907[0]).concat(modBody5909);
    }
    return {
        record: new ModuleRecord5373(name5906, language5908),
        term: ModuleTerm5397.create(modBody5909)
    };
}
function loadModule5523(name5910) {
    var // node specific code
    fs5911 = require("fs");
    return (function (body5912) {
        return createModule5522(name5910, body5912);
    })(parser5360.read(fs5911.readFileSync(name5910, "utf8")));
}
function invoke5524(modTerm5913, modRecord5914, phase5915, context5916) {
    if (modRecord5914.language === "base") {
        var // base modules can just use the normal require pipeline
        exported5917 = require(modRecord5914.name);
        Object.keys(exported5917).forEach(function (exp5918) {
            var // create new bindings in the context
            expName5919 = syn5361.makeIdent(exp5918, null).mark(freshScope5388(context5916.bindings));
            context5916.bindings.add(expName5919, fresh5387(), phase5915);
            modRecord5914.exportEntries.push(new ExportEntry5372(null, expName5919, expName5919));
            context5916.store.setWithModule(expName5919, phase5915, modRecord5914.name, new RuntimeValue5497({ value: exported5917[exp5918] }, modRecord5914.name, phase5915));
        });
    } else {
        // recursively invoke any imports in this module at this
        // phase and update the context
        modRecord5914.importedModules.forEach(function (impPath5922) {
            var importMod5923 = loadImport5529(impPath5922, context5916, modRecord5914.name);
            var impEntries5924 = modRecord5914.getImportsForModule(impPath5922);
            if (_5359.any(impEntries5924, function (entry5925) {
                return entry5925.forPhase === 0;
            })) {
                context5916 = invoke5524(importMod5923.term, importMod5923.record, phase5915, context5916);
            }
        });
        var // turn the module into text so we can eval it
        code5920 = (function (terms5926) {
            return codegen5358.generate(parser5360.parse(flatten5537(_5359.flatten(terms5926.map(function (term5927) {
                return term5927.destruct(context5916, {
                    stripCompileTerm: true,
                    stripModuleTerm: true
                });
            })))));
        })(modTerm5913.body);
        var global5921 = { console: console };
        // eval but with a fresh heap
        vm5375.runInNewContext(code5920, global5921);
    }
    return context5916;
}
function visitTerms5525(terms5928, modRecord5929, phase5930, context5931) {
    var name5932;
    var macroDefinition5933;
    var exportName5934;
    var entries5935;
    terms5928.forEach(function (term5936) {
        if ( // add the exported names to the module record
        term5936.isExportNameTerm || term5936.isExportDeclTerm || term5936.isExportDefaultTerm) {
            entries5935 = modRecord5929.addExport(term5936);
        }
        if (term5936.isExportDefaultTerm && term5936.decl.isMacroTerm || term5936.isMacroTerm || term5936.isLetMacroTerm) {
            var _multiTokName5937 = undefined,
                _fullName5938 = undefined,
                macBody5939 = term5936.isExportDefaultTerm ? term5936.decl.body : term5936.body;
            macroDefinition5933 = loadMacroDef5513(macBody5939, context5931, phase5930 + 1);
            if (term5936.isExportDefaultTerm) {
                _multiTokName5937 = entries5935[0].exportName;
                _fullName5938 = [entries5935[0].exportName];
            } else {
                _multiTokName5937 = makeMultiToken5389(term5936.name);
                _fullName5938 = term5936.name.token.inner;
            }
            // todo: handle implicit imports
            context5931.bindings.add(_multiTokName5937, fresh5387(), phase5930);
            context5931.store.set(_multiTokName5937, phase5930, new CompiletimeValue5496(new SyntaxTransform5366(macroDefinition5933, false, builtinMode5476, _fullName5938), phase5930, modRecord5929.name));
        }
        if (term5936.isForPhaseTerm) {
            visitTerms5525(term5936.body, modRecord5929, phase5930 + term5936.phase.token.value, context5931);
        }
        if (term5936.isOperatorDefinitionTerm) {
            var opDefinition5940 = loadMacroDef5513(term5936.body, context5931, phase5930 + 1);
            var multiTokName5937 = makeMultiToken5389(term5936.name);
            var fullName5938 = term5936.name.token.inner;
            var opObj5943 = {
                isOp: true,
                builtin: builtinMode5476,
                fullName: fullName5938
            };
            assert5376(unwrapSyntax5381(term5936.type) === "binary" || unwrapSyntax5381(term5936.type) === "unary", "operator must either be binary or unary");
            opObj5943[unwrapSyntax5381(term5936.type)] = {
                fn: opDefinition5940,
                prec: term5936.prec.token.value,
                assoc: term5936.assoc ? term5936.assoc.token.value : null
            };
            // bind in the store for the current phase
            context5931.bindings.add(multiTokName5937, fresh5387(), phase5930);
            context5931.store.set(phaseName, phase5930, new CompiletimeValue5496(opObj5943, phase5930, modRecord5929.name));
        }
    });
}
function visit5526(modTerm5944, modRecord5945, phase5946, context5947) {
    if ( // don't need to visit base modules since they do not support macros
    modRecord5945.language === "base") {
        return context5947;
    }
    // reset the exports
    modRecord5945.exportEntries = [];
    // for each of the imported modules, recursively visit and
    // invoke them at the appropriate phase and then bind the
    // imported names in this module
    modRecord5945.importedModules.forEach(function (impPath5948) {
        var // load the (possibly cached) module for this import
        importMod5949 = loadImport5529(impPath5948, context5947, modRecord5945.name);
        var // grab all the import statements for that module
        impEntries5950 = modRecord5945.getImportsForModule(impPath5948);
        var uniquePhases5951 = _5359.uniq(impEntries5950.map(function (entry) {
            return entry.forPhase;
        }));
        uniquePhases5951.forEach(function (impPhase5952) {
            context5947 = visit5526(importMod5949.term, importMod5949.record, phase5946 + impPhase5952, context5947);
            if ( // don't need to invoke when importing for phase 0 (runtime)
            impPhase5952 > 0) {
                context5947 = invoke5524(importMod5949.term, importMod5949.record, phase5946 + impPhase5952, context5947);
            }
        });
        bindImportInMod5530(impEntries5950, importMod5949.term, importMod5949.record, context5947, phase5946);
    });
    // load the transformers into the store
    visitTerms5525(modTerm5944.body, modRecord5945, phase5946, context5947);
    return context5947;
}
function mapCommaSep5527(l5953, f5954) {
    return l5953.map(function (stx5955, idx5956) {
        if (idx5956 % 2 !== 0 && (!stx5955.isPunctuator() || stx5955.token.value !== ",")) {
            throwSyntaxError5378("import", "expecting a comma separated list", stx5955);
        } else if (idx5956 % 2 !== 0) {
            return stx5955;
        } else {
            return f5954(stx5955);
        }
    });
}
function filterModuleCommaSep5528(stx5957) {
    return stx5957.filter(function (stx5958, idx5959) {
        if (idx5959 % 2 !== 0 && (!stx5958.isPunctuator() || stx5958.token.value !== ",")) {
            throwSyntaxError5378("import", "expecting a comma separated list", stx5958);
        } else if (idx5959 % 2 !== 0) {
            return false;
        } else {
            return true;
        }
    });
}
function loadImport5529(path5960, context5961, parentPath5962) {
    var modFullPath5963 = resolvePath5520(path5960, parentPath5962);
    if (!availableModules5479.has(modFullPath5963)) {
        var // load it
        modToImport5964 = (function (mod5965) {
            if (mod5965.record.language === "base") {
                return {
                    term: mod5965,
                    record: mod5965.record
                };
            }
            var expanded5966 = expandModule5531(mod5965.term, modFullPath5963, context5961.templateMap, context5961.patternMap, mod5965.record, context5961.compileSuffix, context5961.bindings);
            return {
                term: expanded5966.mod,
                record: expanded5966.context.moduleRecord
            };
        })(loadModule5523(modFullPath5963));
        availableModules5479.set(modFullPath5963, modToImport5964);
        return modToImport5964;
    }
    return availableModules5479.get(modFullPath5963);
}
function bindImportInMod5530(impEntries5967, modTerm5968, modRecord5969, context5970, phase5971) {
    impEntries5967.forEach(function (entry5972) {
        var isBase5973 = modRecord5969.language === "base";
        var inExports5974 = _5359.find(modRecord5969.exportEntries, function (expEntry5977) {
            return unwrapSyntax5381(expEntry5977.exportName) === unwrapSyntax5381(entry5972.importName);
        });
        if (!(inExports5974 || isBase5973)) {
            throwSyntaxError5378("compile", "the imported name `" + unwrapSyntax5381(entry5972.importName) + "` was not exported from the module", entry5972.importName);
        }
        var exportName5975;
        if (inExports5974) {
            exportName5975 = inExports5974.exportName;
        } else {
            assert5376(false, "not implemented yet: missing export name");
        }
        var localName5976 = entry5972.localName;
        context5970.bindings.addForward(localName5976, exportName5975, phase5971 + entry5972.forPhase);
    });
}
// (ModuleTerm, Str, Map, Map, ModuleRecord) -> {
//     context: ExpanderContext,
//     mod: ModuleTerm
// }
function expandModule5531(mod5978, filename5979, templateMap5980, patternMap5981, moduleRecord5982, compileSuffix5983, bindings5984) {
    var // create a new expander context for this module
    context5985 = makeModuleExpanderContext5518(filename5979, templateMap5980, patternMap5981, 0, moduleRecord5982, compileSuffix5983, bindings5984);
    return {
        context: context5985,
        mod: expandTermTreeToFinal5515(mod5978, context5985)
    };
}
function isCompileName5532(stx5986, context5987) {
    if (stx5986.isDelimiter()) {
        return !hasSyntaxTransform5500(stx5986.token.inner, context5987, 0);
    } else {
        return !hasSyntaxTransform5500(stx5986, context5987, 0);
    }
}
function filterCompileNames5533(stx5988, context5989) {
    assert5376(stx5988.isDelimiter(), "must be a delimter");
    var runtimeNames5990 = (function (names5992) {
        return names5992.filter(function (name5993) {
            return isCompileName5532(name5993, context5989);
        });
    })(filterModuleCommaSep5528(stx5988.token.inner));
    var newInner5991 = runtimeNames5990.reduce(function (acc5994, name5995, idx5996, orig5997) {
        acc5994.push(name5995);
        if (orig5997.length - 1 !== idx5996) {
            // don't add trailing comma
            acc5994.push(syn5361.makePunc(",", name5995));
        }
        return acc5994;
    }, []);
    return syn5361.makeDelim("{}", newInner5991, stx5988);
}
function flattenModule5534(modTerm5998, modRecord5999, context6000) {
    var // filter the imports to just the imports and names that are
    // actually available at runtime
    imports6001 = modRecord5999.getRuntimeImportEntries().filter(function (entry6005) {
        return isCompileName5532(entry6005.localName, context6000);
    });
    var exports6002 = modRecord5999.exportEntries.filter(function (entry6006) {
        return isCompileName5532(entry6006.localName, context6000);
    });
    var // filter out all of the import and export statements
    output6003 = modTerm5998.body.reduce(function (acc6007, term6008) {
        if (term6008.isExportNameTerm || term6008.isExportDeclTerm || term6008.isExportDefaultTerm || term6008.isImportTerm || term6008.isImportForPhaseTerm) {
            return acc6007;
        }
        return acc6007.concat(term6008.destruct(context6000, { stripCompileTerm: true }));
    }, []);
    output6003 = (function (output6009) {
        return output6009.map(function (stx6010) {
            var name6011 = resolve5368(stx6010, 0);
            if ( // collect the implicit imports (those imports that
            // must be included because a macro expanded to a reference
            // to an import from some other module)
            context6000.implicitImport.has(name6011)) {
                var implicit6012 = context6000.implicitImport.get(name6011);
                if ( // don't double add the import
                !_5359.find(imports6001, function (imp6013) {
                    return imp6013 === implicit6012;
                })) {
                    imports6001.push(implicit6012);
                }
            }
            return stx6010;
        });
    })(flatten5537(output6003));
    var // flatten everything
    flatImports6004 = imports6001.reduce(function (acc6014, entry6015) {
        entry6015.moduleRequest = entry6015.moduleRequest.clone();
        entry6015.moduleRequest.token.value += context6000.compileSuffix;
        return acc6014.concat(flatten5537(entry6015.toTerm().destruct(context6000).concat(syn5361.makePunc(";", entry6015.moduleRequest))));
    }, []);
    return {
        imports: imports6001.map(function (entry6016) {
            return entry6016.toTerm();
        }),
        body: flatImports6004.concat(output6003)
    };
}
function flattenImports5535(imports6017, mod6018, context6019) {
    return imports6017.reduce(function (acc6020, imp6021) {
        var modFullPath6022 = resolvePath5520(unwrapSyntax5381(imp6021.from), context6019.filename);
        if (availableModules5479.has(modFullPath6022)) {
            var modPair6023 = availableModules5479.get(modFullPath6022);
            if (modPair6023.record.language === "base") {
                return acc6020;
            }
            var flattened6024 = flattenModule5534(modPair6023.term, modPair6023.record, context6019);
            acc6020.push({
                path: modFullPath6022,
                code: flattened6024.body
            });
            acc6020 = acc6020.concat(flattenImports5535(flattened6024.imports, mod6018, context6019));
            return acc6020;
        } else {
            assert5376(false, "module was unexpectedly not available for compilation" + modFullPath6022);
        }
    }, []);
}
function compileModule5536(stx6025, options6026) {
    var fs6027 = require("fs");
    options6026 = options6026 || {};
    var filename6028 = options6026 && typeof options6026.filename !== "undefined" ? fs6027.realpathSync(options6026.filename) : "(anonymous module)";
    maxExpands5478 = Infinity;
    expandCount5477 = 0;
    var mod6029 = createModule5522(filename6028, stx6025);
    var // the template and pattern maps are global for every module
    templateMap6030 = new StringMap5363();
    var patternMap6031 = new StringMap5363();
    availableModules5479 = new StringMap5363();
    var expanded6032 = expandModule5531(mod6029.term, filename6028, templateMap6030, patternMap6031, mod6029.record, options6026.compileSuffix);
    var flattened6033 = flattenModule5534(expanded6032.mod, expanded6032.context.moduleRecord, expanded6032.context);
    var compiledModules6034 = flattenImports5535(flattened6033.imports, expanded6032.mod, expanded6032.context);
    return [{
        path: filename6028,
        code: flattened6033.body
    }].concat(compiledModules6034);
}
function flatten5537(stx6035) {
    return _5359.reduce(stx6035, function (acc6036, stx6037) {
        if (stx6037.isDelimiter()) {
            var openParen6038 = syntaxFromToken5474({
                type: parser5360.Token.Punctuator,
                value: stx6037.token.value[0],
                range: stx6037.token.startRange,
                sm_range: typeof stx6037.token.sm_startRange == "undefined" ? stx6037.token.startRange : stx6037.token.sm_startRange,
                lineNumber: stx6037.token.startLineNumber,
                sm_lineNumber: typeof stx6037.token.sm_startLineNumber == "undefined" ? stx6037.token.startLineNumber : stx6037.token.sm_startLineNumber,
                lineStart: stx6037.token.startLineStart,
                sm_lineStart: typeof stx6037.token.sm_startLineStart == "undefined" ? stx6037.token.startLineStart : stx6037.token.sm_startLineStart
            }, stx6037);
            var closeParen6039 = syntaxFromToken5474({
                type: parser5360.Token.Punctuator,
                value: stx6037.token.value[1],
                range: stx6037.token.endRange,
                sm_range: typeof stx6037.token.sm_endRange == "undefined" ? stx6037.token.endRange : stx6037.token.sm_endRange,
                lineNumber: stx6037.token.endLineNumber,
                sm_lineNumber: typeof stx6037.token.sm_endLineNumber == "undefined" ? stx6037.token.endLineNumber : stx6037.token.sm_endLineNumber,
                lineStart: stx6037.token.endLineStart,
                sm_lineStart: typeof stx6037.token.sm_endLineStart == "undefined" ? stx6037.token.endLineStart : stx6037.token.sm_endLineStart
            }, stx6037);
            if (stx6037.token.leadingComments) {
                openParen6038.token.leadingComments = stx6037.token.leadingComments;
            }
            if (stx6037.token.trailingComments) {
                openParen6038.token.trailingComments = stx6037.token.trailingComments;
            }
            acc6036.push(openParen6038);
            push5480.apply(acc6036, flatten5537(stx6037.token.inner));
            acc6036.push(closeParen6039);
            return acc6036;
        }
        stx6037.token.sm_lineNumber = typeof stx6037.token.sm_lineNumber != "undefined" ? stx6037.token.sm_lineNumber : stx6037.token.lineNumber;
        stx6037.token.sm_lineStart = typeof stx6037.token.sm_lineStart != "undefined" ? stx6037.token.sm_lineStart : stx6037.token.lineStart;
        stx6037.token.sm_range = typeof stx6037.token.sm_range != "undefined" ? stx6037.token.sm_range : stx6037.token.range;
        acc6036.push(stx6037);
        return acc6036;
    }, []);
}
exports.StringMap = StringMap5363;
exports.enforest = enforest5506;
exports.compileModule = compileModule5536;
exports.getCompiletimeValue = getCompiletimeValue5498;
exports.hasCompiletimeValue = hasCompiletimeValue5501;
exports.getSyntaxTransform = getSyntaxTransform5499;
exports.hasSyntaxTransform = hasSyntaxTransform5500;
exports.resolve = resolve5368;
exports.get_expression = get_expression5508;
exports.makeExpanderContext = makeExpanderContext5517;
exports.ExprTerm = ExprTerm5421;
exports.VariableStatementTerm = VariableStatementTerm5446;
exports.tokensToSyntax = syn5361.tokensToSyntax;
exports.syntaxToTokens = syn5361.syntaxToTokens;
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