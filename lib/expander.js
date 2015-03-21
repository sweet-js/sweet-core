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
function wrapDelim5457(towrap5513, delimSyntax5514) {
    assert5354(delimSyntax5514.isDelimiterToken(), "expecting a delimiter token");
    return syntaxFromToken5450({
        type: parser5338.Token.Delimiter,
        value: delimSyntax5514.token.value,
        inner: towrap5513,
        range: delimSyntax5514.token.range,
        startLineNumber: delimSyntax5514.token.startLineNumber,
        lineStart: delimSyntax5514.token.lineStart
    }, delimSyntax5514);
}
function getParamIdentifiers5458(argSyntax5515) {
    if (argSyntax5515.isDelimiter()) {
        return _5337.filter(argSyntax5515.token.inner, function (stx5516) {
            return stx5516.token.value !== ",";
        });
    } else if (argSyntax5515.isIdentifier()) {
        return [argSyntax5515];
    } else {
        assert5354(false, "expecting a delimiter or a single identifier for function parameters");
    }
}
function stxIsUnaryOp5459(stx5517) {
    var staticOperators5518 = ["+", "-", "~", "!", "delete", "void", "typeof", "yield", "new", "++", "--"];
    return _5337.contains(staticOperators5518, unwrapSyntax5359(stx5517));
}
function stxIsBinOp5460(stx5519) {
    var staticOperators5520 = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "<<", ">>", ">>>"];
    return _5337.contains(staticOperators5520, unwrapSyntax5359(stx5519));
}
function getUnaryOpPrec5461(op5521) {
    var operatorPrecedence5522 = {
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
    return operatorPrecedence5522[op5521];
}
function getBinaryOpPrec5462(op5523) {
    var operatorPrecedence5524 = {
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
    return operatorPrecedence5524[op5523];
}
function getBinaryOpAssoc5463(op5525) {
    var operatorAssoc5526 = {
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
    return operatorAssoc5526[op5525];
}
function stxIsAssignOp5464(stx5527) {
    var staticOperators5528 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
    return _5337.contains(staticOperators5528, unwrapSyntax5359(stx5527));
}
function enforestImportClause5465(stx5529) {
    if (stx5529[0] && stx5529[0].isDelimiter()) {
        return {
            result: NamedImportTerm5378.create(stx5529[0]),
            rest: stx5529.slice(1)
        };
    } else if (stx5529[0] && stx5529[0].isPunctuator() && unwrapSyntax5359(stx5529[0]) === "*" && stx5529[1] && unwrapSyntax5359(stx5529[1]) === "as" && stx5529[2]) {
        return {
            result: NamespaceImportTerm5380.create(stx5529[0], stx5529[1], stx5529[2]),
            rest: stx5529.slice(3)
        };
    } else {
        return {
            result: DefaultImportTerm5379.create(stx5529[0]),
            rest: stx5529.slice(1)
        };
    }
}
function enforestImportClauseList5466(stx5530) {
    var res5531 = [];
    var clause5532 = enforestImportClause5465(stx5530);
    var rest5533 = clause5532.rest;
    res5531.push(clause5532.result);
    if (rest5533[0] && rest5533[0].isPunctuator() && unwrapSyntax5359(rest5533[0]) === ",") {
        res5531.push(rest5533[0]);
        clause5532 = enforestImportClause5465(rest5533.slice(1));
        res5531.push(clause5532.result);
        rest5533 = clause5532.rest;
    }
    return {
        result: res5531,
        rest: rest5533
    };
}
function enforestImport5467(head5534, rest5535) {
    assert5354(unwrapSyntax5359(head5534) === "import", "only call for imports");
    var clause5536 = enforestImportClauseList5466(rest5535);
    rest5535 = clause5536.rest;
    if (rest5535[0] && unwrapSyntax5359(rest5535[0]) === "from" && rest5535[1] && rest5535[1].isStringLiteral() && rest5535[2] && unwrapSyntax5359(rest5535[2]) === "for" && rest5535[3] && unwrapSyntax5359(rest5535[3]) === "phase" && rest5535[4] && rest5535[4].isNumericLiteral()) {
        var importRest5537;
        if (rest5535[5] && rest5535[5].isPunctuator() && rest5535[5].token.value === ";") {
            importRest5537 = rest5535.slice(6);
        } else {
            importRest5537 = rest5535.slice(5);
        }
        return {
            result: ImportForPhaseTerm5377.create(head5534, clause5536.result, rest5535[0], rest5535[1], rest5535[2], rest5535[3], rest5535[4]),
            rest: importRest5537
        };
    } else if (rest5535[0] && unwrapSyntax5359(rest5535[0]) === "from" && rest5535[1] && rest5535[1].isStringLiteral()) {
        var importRest5537;
        if (rest5535[2] && rest5535[2].isPunctuator() && rest5535[2].token.value === ";") {
            importRest5537 = rest5535.slice(3);
        } else {
            importRest5537 = rest5535.slice(2);
        }
        return {
            result: ImportTerm5376.create(head5534, clause5536.result, rest5535[0], rest5535[1]),
            rest: importRest5537
        };
    } else {
        throwSyntaxError5356("enforest", "unrecognized import syntax", rest5535);
    }
}
function enforestVarStatement5468(stx5539, context5540, varStx5541) {
    var decls5542 = [];
    var rest5543 = stx5539;
    var rhs5544;
    if (!rest5543.length) {
        throwSyntaxError5356("enforest", "Unexpected end of input", varStx5541);
    }
    if (expandCount5453 >= maxExpands5454) {
        return null;
    }
    while (rest5543.length) {
        if (rest5543[0].isIdentifier()) {
            if (rest5543[1] && rest5543[1].isPunctuator() && rest5543[1].token.value === "=") {
                rhs5544 = get_expression5483(rest5543.slice(2), context5540);
                if (rhs5544.result == null) {
                    throwSyntaxError5356("enforest", "Unexpected token", rhs5544.rest[0]);
                }
                if (rhs5544.rest[0] && rhs5544.rest[0].isPunctuator() && rhs5544.rest[0].token.value === ",") {
                    decls5542.push(VariableDeclarationTerm5391.create(rest5543[0], rest5543[1], rhs5544.result, rhs5544.rest[0]));
                    rest5543 = rhs5544.rest.slice(1);
                    continue;
                } else {
                    decls5542.push(VariableDeclarationTerm5391.create(rest5543[0], rest5543[1], rhs5544.result, null));
                    rest5543 = rhs5544.rest;
                    break;
                }
            } else if (rest5543[1] && rest5543[1].isPunctuator() && rest5543[1].token.value === ",") {
                decls5542.push(VariableDeclarationTerm5391.create(rest5543[0], null, null, rest5543[1]));
                rest5543 = rest5543.slice(2);
            } else {
                decls5542.push(VariableDeclarationTerm5391.create(rest5543[0], null, null, null));
                rest5543 = rest5543.slice(1);
                break;
            }
        } else {
            throwSyntaxError5356("enforest", "Unexpected token", rest5543[0]);
        }
    }
    return {
        result: decls5542,
        rest: rest5543
    };
}
function enforestAssignment5469(stx5545, context5546, left5547, prevStx5548, prevTerms5549) {
    var op5550 = stx5545[0];
    var rightStx5551 = stx5545.slice(1);
    var opTerm5552 = PuncTerm5372.create(stx5545[0]);
    var opPrevStx5553 = tagWithTerm5484(opTerm5552, [stx5545[0]]).concat(tagWithTerm5484(left5547, left5547.destruct(context5546).reverse()), prevStx5548);
    var opPrevTerms5554 = [opTerm5552, left5547].concat(prevTerms5549);
    var opRes5555 = enforest5481(rightStx5551, context5546, opPrevStx5553, opPrevTerms5554);
    if (opRes5555.result) {
        if ( // Lookbehind was matched, so it may not even be a binop anymore.
        opRes5555.prevTerms.length < opPrevTerms5554.length) {
            return opRes5555;
        }
        var right5556 = opRes5555.result;
        if ( // only a binop if the right is a real expression
        // so 2+2++ will only match 2+2
        right5556.isExprTerm) {
            var term5557 = AssignmentExpressionTerm5401.create(left5547, op5550, right5556);
            return {
                result: term5557,
                rest: opRes5555.rest,
                prevStx: prevStx5548,
                prevTerms: prevTerms5549
            };
        }
    } else {
        return opRes5555;
    }
}
function enforestParenExpression5470(parens5558, context5559) {
    var argRes5560,
        enforestedArgs5561 = [],
        commas5562 = [];
    var innerTokens5563 = parens5558.token.inner;
    while (innerTokens5563.length > 0) {
        argRes5560 = enforest5481(innerTokens5563, context5559);
        if (!argRes5560.result || !argRes5560.result.isExprTerm) {
            return null;
        }
        enforestedArgs5561.push(argRes5560.result);
        innerTokens5563 = argRes5560.rest;
        if (innerTokens5563[0] && innerTokens5563[0].token.value === ",") {
            // record the comma for later
            commas5562.push(innerTokens5563[0]);
            // but dump it for the next loop turn
            innerTokens5563 = innerTokens5563.slice(1);
        } else {
            // either there are no more tokens or
            // they aren't a comma, either way we
            // are done with the loop
            break;
        }
    }
    return innerTokens5563.length ? null : ParenExpressionTerm5425.create(enforestedArgs5561, parens5558, commas5562);
}
function CompiletimeValue5471(trans5564, module5565, phase5566) {
    this.trans = trans5564;
    this.module = module5565;
    this.phase = phase5566;
}
function RuntimeValue5472(trans5567, module5568, phase5569) {
    this.trans = trans5567;
    this.module = module5568;
    this.phase = phase5569;
}
function getCompiletimeValue5473(stx5570, context5571, phase5572) {
    var store5573,
        env5574 = context5571.env.get(stx5570, phase5572);
    if (env5574 !== null) {
        return env5574.trans;
    } else {
        store5573 = context5571.store.getWithModule(stx5570, phase5572);
        return store5573 !== null ? store5573.trans : null;
    }
}
function getSyntaxTransform5474(stx5575, context5576, phase5577) {
    var t5578 = getCompiletimeValue5473(stx5575, context5576, phase5577);
    if (t5578 && t5578 instanceof VarTransform5345) {
        return null;
    }
    return t5578;
}
function hasSyntaxTransform5475(stx5579, context5580, phase5581) {
    return getSyntaxTransform5474(stx5579, context5580, phase5581) !== null;
}
function hasCompiletimeValue5476(stx5582, context5583, phase5584) {
    return context5583.env.has(stx5582, phase5584) || context5583.store.has(stx5582, phase5584);
}
function expandMacro5477(stx5585, context5586, opCtx5587, opType5588, macroObj5589) {
    var // pull the macro transformer out the environment
    head5590 = stx5585[0];
    var rest5591 = stx5585.slice(1);
    macroObj5589 = macroObj5589 || getSyntaxTransform5474(stx5585, context5586, context5586.phase);
    var stxArg5592 = rest5591.slice(macroObj5589.fullName.length - 1);
    var transformer5593;
    if (opType5588 != null) {
        assert5354(opType5588 === "binary" || opType5588 === "unary", "operator type should be either unary or binary: " + opType5588);
        transformer5593 = macroObj5589[opType5588].fn;
    } else {
        transformer5593 = macroObj5589.fn;
    }
    assert5354(typeof transformer5593 === "function", "Macro transformer not bound for: " + head5590.token.value);
    var transformerContext5594 = makeExpanderContext5492(_5337.defaults({ mark: freshScope5366(context5586.bindings) }, context5586));
    // apply the transformer
    var rt5595;
    try {
        rt5595 = transformer5593([head5590].concat(stxArg5592), transformerContext5594, opCtx5587.prevStx, opCtx5587.prevTerms);
    } catch (e5596) {
        if (e5596 instanceof SyntaxCaseError5358) {
            var // add a nicer error for syntax case
            nameStr5597 = macroObj5589.fullName.map(function (stx5598) {
                return stx5598.token.value;
            }).join("");
            if (opType5588 != null) {
                var argumentString5599 = "`" + stxArg5592.slice(0, 5).map(function (stx5600) {
                    return stx5600.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5356("operator", "Operator `" + nameStr5597 + "` could not be matched with " + argumentString5599, head5590);
            } else {
                var argumentString5599 = "`" + stxArg5592.slice(0, 5).map(function (stx5602) {
                    return stx5602.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5356("macro", "Macro `" + nameStr5597 + "` could not be matched with " + argumentString5599, head5590);
            }
        } else {
            // just rethrow it
            throw e5596;
        }
    }
    if (!builtinMode5452 && !macroObj5589.builtin) {
        expandCount5453++;
    }
    if (!Array.isArray(rt5595.result)) {
        throwSyntaxError5356("enforest", "Macro must return a syntax array", stx5585[0]);
    }
    if (rt5595.result.length > 0) {
        var adjustedResult5603 = adjustLineContext5364(rt5595.result, head5590);
        if (stx5585[0].token.leadingComments) {
            if (adjustedResult5603[0].token.leadingComments) {
                adjustedResult5603[0].token.leadingComments = adjustedResult5603[0].token.leadingComments.concat(head5590.token.leadingComments);
            } else {
                adjustedResult5603[0].token.leadingComments = head5590.token.leadingComments;
            }
        }
        rt5595.result = adjustedResult5603;
    }
    return rt5595;
}
function comparePrec5478(left5604, right5605, assoc5606) {
    if (assoc5606 === "left") {
        return left5604 <= right5605;
    }
    return left5604 < right5605;
}
function toksAdjacent5479(a5607, b5608) {
    var arange5609 = a5607.token.sm_range || a5607.token.range || a5607.token.endRange;
    var brange5610 = b5608.token.sm_range || b5608.token.range || b5608.token.endRange;
    return arange5609 && brange5610 && arange5609[1] === brange5610[0];
}
function syntaxInnerValuesEq5480(synA5611, synB5612) {
    var a5613 = synA5611.token.inner,
        b5614 = synB5612.token.inner;
    return (function (ziped5615) {
        return _5337.all(ziped5615, function (pair5616) {
            return unwrapSyntax5359(pair5616[0]) === unwrapSyntax5359(pair5616[1]);
        });
    })(a5613.length === b5614.length && _5337.zip(a5613, b5614));
}
function enforest5481(toks5617, context5618, prevStx5619, prevTerms5620) {
    assert5354(toks5617.length > 0, "enforest assumes there are tokens to work with");
    prevStx5619 = prevStx5619 || [];
    prevTerms5620 = prevTerms5620 || [];
    if (expandCount5453 >= maxExpands5454) {
        return {
            result: null,
            rest: toks5617
        };
    }
    function step5621(head5622, rest5623, opCtx5624) {
        var innerTokens5625;
        assert5354(Array.isArray(rest5623), "result must at least be an empty array");
        if (head5622.isTermTree) {
            var isCustomOp5627 = false;
            var uopMacroObj5628;
            var uopSyntax5629;
            if (head5622.isPuncTerm || head5622.isKeywordTerm || head5622.isIdTerm) {
                if (head5622.isPuncTerm) {
                    uopSyntax5629 = head5622.punc;
                } else if (head5622.isKeywordTerm) {
                    uopSyntax5629 = head5622.keyword;
                } else if (head5622.isIdTerm) {
                    uopSyntax5629 = head5622.id;
                }
                uopMacroObj5628 = getSyntaxTransform5474([uopSyntax5629].concat(rest5623), context5618, context5618.phase);
                isCustomOp5627 = uopMacroObj5628 && uopMacroObj5628.isOp;
            }
            // look up once (we want to check multiple properties on bopMacroObj
            // without repeatedly calling getValueInEnv)
            var bopMacroObj5630;
            if (rest5623[0] && rest5623[1]) {
                bopMacroObj5630 = getSyntaxTransform5474(rest5623, context5618, context5618.phase);
            }
            if ( // unary operator
            isCustomOp5627 && uopMacroObj5628.unary || uopSyntax5629 && stxIsUnaryOp5459(uopSyntax5629)) {
                var uopPrec5631;
                if (isCustomOp5627 && uopMacroObj5628.unary) {
                    uopPrec5631 = uopMacroObj5628.unary.prec;
                } else {
                    uopPrec5631 = getUnaryOpPrec5461(unwrapSyntax5359(uopSyntax5629));
                }
                var opRest5632 = rest5623;
                var uopMacroName5633;
                if (uopMacroObj5628) {
                    uopMacroName5633 = [uopSyntax5629].concat(rest5623.slice(0, uopMacroObj5628.fullName.length - 1));
                    opRest5632 = rest5623.slice(uopMacroObj5628.fullName.length - 1);
                }
                var leftLeft5634 = opCtx5624.prevTerms[0] && opCtx5624.prevTerms[0].isPartialTerm ? opCtx5624.prevTerms[0] : null;
                var unopTerm5635 = PartialOperationTerm5419.create(head5622, leftLeft5634);
                var unopPrevStx5636 = tagWithTerm5484(unopTerm5635, head5622.destruct(context5618).reverse()).concat(opCtx5624.prevStx);
                var unopPrevTerms5637 = [unopTerm5635].concat(opCtx5624.prevTerms);
                var unopOpCtx5638 = _5337.extend({}, opCtx5624, {
                    combine: function combine(t5639) {
                        if (t5639.isExprTerm) {
                            if (isCustomOp5627 && uopMacroObj5628.unary) {
                                var rt5640 = expandMacro5477(uopMacroName5633.concat(t5639.destruct(context5618)), context5618, opCtx5624, "unary");
                                var newt5641 = get_expression5483(rt5640.result, context5618);
                                assert5354(newt5641.rest.length === 0, "should never have left over syntax");
                                return opCtx5624.combine(newt5641.result);
                            }
                            return opCtx5624.combine(UnaryOpTerm5398.create(uopSyntax5629, t5639));
                        } else {
                            // not actually an expression so don't create
                            // a UnaryOp term just return with the punctuator
                            return opCtx5624.combine(head5622);
                        }
                    },
                    prec: uopPrec5631,
                    prevStx: unopPrevStx5636,
                    prevTerms: unopPrevTerms5637,
                    op: unopTerm5635
                });
                return step5621(opRest5632[0], opRest5632.slice(1), unopOpCtx5638);
            } else if (head5622.isExprTerm && (rest5623[0] && rest5623[1] && (stxIsBinOp5460(rest5623[0]) && !bopMacroObj5630 || bopMacroObj5630 && bopMacroObj5630.isOp && bopMacroObj5630.binary))) {
                var opRes5642;
                var op5643 = rest5623[0];
                var left5644 = head5622;
                var rightStx5645 = rest5623.slice(1);
                var leftLeft5634 = opCtx5624.prevTerms[0] && opCtx5624.prevTerms[0].isPartialTerm ? opCtx5624.prevTerms[0] : null;
                var leftTerm5647 = PartialExpressionTerm5420.create(head5622.destruct(context5618), leftLeft5634, function () {
                    return step5621(head5622, [], opCtx5624);
                });
                var opTerm5648 = PartialOperationTerm5419.create(op5643, leftTerm5647);
                var opPrevStx5649 = tagWithTerm5484(opTerm5648, [rest5623[0]]).concat(tagWithTerm5484(leftTerm5647, head5622.destruct(context5618)).reverse(), opCtx5624.prevStx);
                var opPrevTerms5650 = [opTerm5648, leftTerm5647].concat(opCtx5624.prevTerms);
                var isCustomOp5627 = bopMacroObj5630 && bopMacroObj5630.isOp && bopMacroObj5630.binary;
                var bopPrec5652;
                var bopAssoc5653;
                if (isCustomOp5627 && bopMacroObj5630.binary) {
                    bopPrec5652 = bopMacroObj5630.binary.prec;
                    bopAssoc5653 = bopMacroObj5630.binary.assoc;
                } else {
                    bopPrec5652 = getBinaryOpPrec5462(unwrapSyntax5359(op5643));
                    bopAssoc5653 = getBinaryOpAssoc5463(unwrapSyntax5359(op5643));
                }
                assert5354(bopPrec5652 !== undefined, "expecting a precedence for operator: " + op5643);
                var newStack5654;
                if (comparePrec5478(bopPrec5652, opCtx5624.prec, bopAssoc5653)) {
                    var bopCtx5658 = opCtx5624;
                    var combResult5626 = opCtx5624.combine(head5622);
                    if (opCtx5624.stack.length > 0) {
                        return step5621(combResult5626.term, rest5623, opCtx5624.stack[0]);
                    }
                    left5644 = combResult5626.term;
                    newStack5654 = opCtx5624.stack;
                    opPrevStx5649 = combResult5626.prevStx;
                    opPrevTerms5650 = combResult5626.prevTerms;
                } else {
                    newStack5654 = [opCtx5624].concat(opCtx5624.stack);
                }
                assert5354(opCtx5624.combine !== undefined, "expecting a combine function");
                var opRightStx5655 = rightStx5645;
                var bopMacroName5656;
                if (isCustomOp5627) {
                    bopMacroName5656 = rest5623.slice(0, bopMacroObj5630.fullName.length);
                    opRightStx5655 = rightStx5645.slice(bopMacroObj5630.fullName.length - 1);
                }
                var bopOpCtx5657 = _5337.extend({}, opCtx5624, {
                    combine: function combine(right5660) {
                        if (right5660.isExprTerm) {
                            if (isCustomOp5627 && bopMacroObj5630.binary) {
                                var leftStx5661 = left5644.destruct(context5618);
                                var rightStx5662 = right5660.destruct(context5618);
                                var rt5663 = expandMacro5477(bopMacroName5656.concat(syn5339.makeDelim("()", leftStx5661, leftStx5661[0]), syn5339.makeDelim("()", rightStx5662, rightStx5662[0])), context5618, opCtx5624, "binary");
                                var newt5664 = get_expression5483(rt5663.result, context5618);
                                assert5354(newt5664.rest.length === 0, "should never have left over syntax");
                                return {
                                    term: newt5664.result,
                                    prevStx: opPrevStx5649,
                                    prevTerms: opPrevTerms5650
                                };
                            }
                            return {
                                term: BinOpTerm5400.create(left5644, op5643, right5660),
                                prevStx: opPrevStx5649,
                                prevTerms: opPrevTerms5650
                            };
                        } else {
                            return {
                                term: head5622,
                                prevStx: opPrevStx5649,
                                prevTerms: opPrevTerms5650
                            };
                        }
                    },
                    prec: bopPrec5652,
                    op: opTerm5648,
                    stack: newStack5654,
                    prevStx: opPrevStx5649,
                    prevTerms: opPrevTerms5650
                });
                return step5621(opRightStx5655[0], opRightStx5655.slice(1), bopOpCtx5657);
            } else if (head5622.isExprTerm && (rest5623[0] && rest5623[0].isDelimiter() && rest5623[0].token.value === "()")) {
                var parenRes5665 = enforestParenExpression5470(rest5623[0], context5618);
                if (parenRes5665) {
                    return step5621(CallTerm5409.create(head5622, parenRes5665), rest5623.slice(1), opCtx5624);
                }
            } else if (head5622.isExprTerm && (rest5623[0] && resolve5346(rest5623[0], context5618.phase) === "?")) {
                var question5666 = rest5623[0];
                var condRes5667 = enforest5481(rest5623.slice(1), context5618);
                if (condRes5667.result) {
                    var truExpr5668 = condRes5667.result;
                    var condRight5669 = condRes5667.rest;
                    if (truExpr5668.isExprTerm && condRight5669[0] && resolve5346(condRight5669[0], context5618.phase) === ":") {
                        var colon5670 = condRight5669[0];
                        var flsRes5671 = enforest5481(condRight5669.slice(1), context5618);
                        var flsExpr5672 = flsRes5671.result;
                        if (flsExpr5672.isExprTerm) {
                            if ( // operators are combined before the ternary
                            opCtx5624.prec >= 4) {
                                var // ternary is like a operator with prec 4
                                headResult5673 = opCtx5624.combine(head5622);
                                var condTerm5674 = ConditionalExpressionTerm5402.create(headResult5673.term, question5666, truExpr5668, colon5670, flsExpr5672);
                                if (opCtx5624.stack.length > 0) {
                                    return step5621(condTerm5674, flsRes5671.rest, opCtx5624.stack[0]);
                                } else {
                                    return {
                                        result: condTerm5674,
                                        rest: flsRes5671.rest,
                                        prevStx: headResult5673.prevStx,
                                        prevTerms: headResult5673.prevTerms
                                    };
                                }
                            } else {
                                var condTerm5674 = ConditionalExpressionTerm5402.create(head5622, question5666, truExpr5668, colon5670, flsExpr5672);
                                return step5621(condTerm5674, flsRes5671.rest, opCtx5624);
                            }
                        }
                    }
                }
            } else if (head5622.isDelimiterTerm && head5622.delim.token.value === "()" && rest5623[0] && rest5623[0].isPunctuator() && resolve5346(rest5623[0], context5618.phase) === "=>") {
                var arrowRes5676 = enforest5481(rest5623.slice(1), context5618);
                if (arrowRes5676.result && arrowRes5676.result.isExprTerm) {
                    return step5621(ArrowFunTerm5405.create(head5622.delim, rest5623[0], arrowRes5676.result.destruct(context5618)), arrowRes5676.rest, opCtx5624);
                } else {
                    throwSyntaxError5356("enforest", "Body of arrow function must be an expression", rest5623.slice(1));
                }
            } else if (head5622.isIdTerm && rest5623[0] && rest5623[0].isPunctuator() && resolve5346(rest5623[0], context5618.phase) === "=>") {
                var res5677 = enforest5481(rest5623.slice(1), context5618);
                if (res5677.result && res5677.result.isExprTerm) {
                    return step5621(ArrowFunTerm5405.create(head5622.id, rest5623[0], res5677.result.destruct(context5618)), res5677.rest, opCtx5624);
                } else {
                    throwSyntaxError5356("enforest", "Body of arrow function must be an expression", rest5623.slice(1));
                }
            } else if (head5622.isDelimiterTerm && head5622.delim.token.value === "()") {
                if ( // empty parens are acceptable but enforest
                // doesn't accept empty arrays so short
                // circuit here
                head5622.delim.token.inner.length === 0) {
                    return step5621(ParenExpressionTerm5425.create([EmptyTerm5393.create()], head5622.delim, []), rest5623, opCtx5624);
                } else {
                    var parenRes5665 = enforestParenExpression5470(head5622.delim, context5618);
                    if (parenRes5665) {
                        return step5621(parenRes5665, rest5623, opCtx5624);
                    }
                }
            } else if (head5622.isExprTerm && ((head5622.isIdTerm || head5622.isObjGetTerm || head5622.isObjDotGetTerm || head5622.isThisExpressionTerm) && rest5623[0] && rest5623[1] && !bopMacroObj5630 && stxIsAssignOp5464(rest5623[0]))) {
                var opRes5642 = enforestAssignment5469(rest5623, context5618, head5622, prevStx5619, prevTerms5620);
                if (opRes5642 && opRes5642.result) {
                    return step5621(opRes5642.result, opRes5642.rest, _5337.extend({}, opCtx5624, {
                        prevStx: opRes5642.prevStx,
                        prevTerms: opRes5642.prevTerms
                    }));
                }
            } else if (head5622.isExprTerm && (rest5623[0] && (unwrapSyntax5359(rest5623[0]) === "++" || unwrapSyntax5359(rest5623[0]) === "--"))) {
                if ( // Check if the operator is a macro first.
                hasSyntaxTransform5475(rest5623[0], context5618, context5618.phase)) {
                    var headStx5680 = tagWithTerm5484(head5622, head5622.destruct(context5618).reverse());
                    var opPrevStx5649 = headStx5680.concat(prevStx5619);
                    var opPrevTerms5650 = [head5622].concat(prevTerms5620);
                    var opRes5642 = enforest5481(rest5623, context5618, opPrevStx5649, opPrevTerms5650);
                    if (opRes5642.prevTerms.length < opPrevTerms5650.length) {
                        return opRes5642;
                    } else if (opRes5642.result) {
                        return step5621(head5622, opRes5642.result.destruct(context5618).concat(opRes5642.rest), opCtx5624);
                    }
                }
                return step5621(PostfixOpTerm5399.create(head5622, rest5623[0]), rest5623.slice(1), opCtx5624);
            } else if (head5622.isExprTerm && (rest5623[0] && rest5623[0].token.value === "[]")) {
                return step5621(ObjGetTerm5407.create(head5622, DelimiterTerm5373.create(rest5623[0])), rest5623.slice(1), opCtx5624);
            } else if (head5622.isExprTerm && (rest5623[0] && unwrapSyntax5359(rest5623[0]) === "." && !hasSyntaxTransform5475(rest5623[0], context5618, context5618.phase) && rest5623[1] && (rest5623[1].isIdentifier() || rest5623[1].isKeyword()))) {
                if ( // Check if the identifier is a macro first.
                hasSyntaxTransform5475(rest5623[1], context5618, context5618.phase)) {
                    var headStx5680 = tagWithTerm5484(head5622, head5622.destruct(context5618).reverse());
                    var dotTerm5685 = PuncTerm5372.create(rest5623[0]);
                    var dotTerms5686 = [dotTerm5685].concat(head5622, prevTerms5620);
                    var dotStx5687 = tagWithTerm5484(dotTerm5685, [rest5623[0]]).concat(headStx5680, prevStx5619);
                    var dotRes5688 = enforest5481(rest5623.slice(1), context5618, dotStx5687, dotTerms5686);
                    if (dotRes5688.prevTerms.length < dotTerms5686.length) {
                        return dotRes5688;
                    } else if (dotRes5688.result) {
                        return step5621(head5622, [rest5623[0]].concat(dotRes5688.result.destruct(context5618), dotRes5688.rest), opCtx5624);
                    }
                }
                return step5621(ObjDotGetTerm5406.create(head5622, rest5623[0], rest5623[1]), rest5623.slice(2), opCtx5624);
            } else if (head5622.isDelimiterTerm && head5622.delim.token.value === "[]") {
                return step5621(ArrayLiteralTerm5416.create(head5622), rest5623, opCtx5624);
            } else if (head5622.isDelimiterTerm && head5622.delim.token.value === "{}") {
                return step5621(BlockTerm5415.create(head5622), rest5623, opCtx5624);
            } else if (head5622.isIdTerm && unwrapSyntax5359(head5622.id) === "#quoteSyntax" && rest5623[0] && rest5623[0].token.value === "{}") {
                return step5621(QuoteSyntaxTerm5410.create(rest5623[0]), rest5623.slice(1), opCtx5624);
            } else if (head5622.isKeywordTerm && unwrapSyntax5359(head5622.keyword) === "return") {
                if (rest5623[0] && rest5623[0].token.lineNumber === head5622.keyword.token.lineNumber) {
                    var returnPrevStx5689 = tagWithTerm5484(head5622, head5622.destruct(context5618)).concat(opCtx5624.prevStx);
                    var returnPrevTerms5690 = [head5622].concat(opCtx5624.prevTerms);
                    var returnExpr5691 = enforest5481(rest5623, context5618, returnPrevStx5689, returnPrevTerms5690);
                    if (returnExpr5691.prevTerms.length < opCtx5624.prevTerms.length) {
                        return returnExpr5691;
                    }
                    if (returnExpr5691.result.isExprTerm) {
                        return step5621(ReturnStatementTerm5396.create(head5622, returnExpr5691.result), returnExpr5691.rest, opCtx5624);
                    }
                } else {
                    return step5621(ReturnStatementTerm5396.create(head5622, EmptyTerm5393.create()), rest5623, opCtx5624);
                }
            } else if (head5622.isKeywordTerm && unwrapSyntax5359(head5622.keyword) === "let") {
                var normalizedName5692;
                if (rest5623[0] && rest5623[0].isDelimiter() && rest5623[0].token.value === "()") {
                    normalizedName5692 = rest5623[0];
                } else {
                    normalizedName5692 = syn5339.makeDelim("()", [rest5623[0]], rest5623[0]);
                }
                var lsRes5693 = enforestVarStatement5468(rest5623, context5618, head5622.keyword);
                if (lsRes5693 && lsRes5693.result) {
                    return step5621(LetStatementTerm5423.create(head5622, lsRes5693.result), lsRes5693.rest, opCtx5624);
                }
            } else if (head5622.isKeywordTerm && unwrapSyntax5359(head5622.keyword) === "var" && rest5623[0]) {
                var vsRes5694 = enforestVarStatement5468(rest5623, context5618, head5622.keyword);
                if (vsRes5694 && vsRes5694.result) {
                    return step5621(VariableStatementTerm5422.create(head5622, vsRes5694.result), vsRes5694.rest, opCtx5624);
                }
            } else if (head5622.isKeywordTerm && unwrapSyntax5359(head5622.keyword) === "const" && rest5623[0]) {
                var csRes5695 = enforestVarStatement5468(rest5623, context5618, head5622.keyword);
                if (csRes5695 && csRes5695.result) {
                    return step5621(ConstStatementTerm5424.create(head5622, csRes5695.result), csRes5695.rest, opCtx5624);
                }
            } else if (head5622.isKeywordTerm && unwrapSyntax5359(head5622.keyword) === "for" && rest5623[0] && rest5623[0].token.value === "()") {
                return step5621(ForStatementTerm5395.create(head5622.keyword, rest5623[0]), rest5623.slice(1), opCtx5624);
            }
        } else {
            assert5354(head5622 && head5622.token, "assuming head is a syntax object");
            var macroObj5696 = expandCount5453 < maxExpands5454 && getSyntaxTransform5474([head5622].concat(rest5623), context5618, context5618.phase);
            if (head5622 && context5618.stopMap.has(resolve5346(head5622, context5618.phase))) {
                return step5621(StopQuotedTerm5411.create(head5622, rest5623[0]), rest5623.slice(1), opCtx5624);
            } else if (macroObj5696 && typeof macroObj5696.fn === "function" && !macroObj5696.isOp) {
                var rt5697 = expandMacro5477([head5622].concat(rest5623), context5618, opCtx5624, null, macroObj5696);
                var newOpCtx5698 = opCtx5624;
                if (rt5697.prevTerms && rt5697.prevTerms.length < opCtx5624.prevTerms.length) {
                    newOpCtx5698 = rewindOpCtx5482(opCtx5624, rt5697);
                }
                if (rt5697.result.length > 0) {
                    return step5621(rt5697.result[0], rt5697.result.slice(1).concat(rt5697.rest), newOpCtx5698);
                } else {
                    return step5621(EmptyTerm5393.create(), rt5697.rest, newOpCtx5698);
                }
            } else if (head5622.isIdentifier() && unwrapSyntax5359(head5622) === "stxrec" && resolve5346(head5622, context5618.phase) === "stxrec") {
                var normalizedName5692;
                if (rest5623[0] && rest5623[0].isDelimiter() && rest5623[0].token.value === "()") {
                    normalizedName5692 = rest5623[0];
                } else {
                    normalizedName5692 = syn5339.makeDelim("()", [rest5623[0]], rest5623[0]);
                }
                if (rest5623[1] && rest5623[1].isDelimiter()) {
                    return step5621(MacroTerm5387.create(normalizedName5692, rest5623[1].token.inner), rest5623.slice(2), opCtx5624);
                } else {
                    throwSyntaxError5356("enforest", "Macro declaration must include body", rest5623[1]);
                }
            } else if (head5622.isIdentifier() && head5622.token.value === "unaryop" && rest5623[0] && rest5623[0].isDelimiter() && rest5623[0].token.value === "()" && rest5623[1] && rest5623[1].isNumericLiteral() && rest5623[2] && rest5623[2].isDelimiter() && rest5623[2] && rest5623[2].token.value === "{}") {
                var trans5700 = enforest5481(rest5623[2].token.inner, context5618);
                return step5621(OperatorDefinitionTerm5389.create(syn5339.makeValue("unary", head5622), rest5623[0], rest5623[1], null, trans5700.result.body), rest5623.slice(3), opCtx5624);
            } else if (head5622.isIdentifier() && head5622.token.value === "binaryop" && rest5623[0] && rest5623[0].isDelimiter() && rest5623[0].token.value === "()" && rest5623[1] && rest5623[1].isNumericLiteral() && rest5623[2] && rest5623[2].isIdentifier() && rest5623[3] && rest5623[3].isDelimiter() && rest5623[3] && rest5623[3].token.value === "{}") {
                var trans5700 = enforest5481(rest5623[3].token.inner, context5618);
                return step5621(OperatorDefinitionTerm5389.create(syn5339.makeValue("binary", head5622), rest5623[0], rest5623[1], rest5623[2], trans5700.result.body), rest5623.slice(4), opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "function" && rest5623[0] && rest5623[0].isIdentifier() && rest5623[1] && rest5623[1].isDelimiter() && rest5623[1].token.value === "()" && rest5623[2] && rest5623[2].isDelimiter() && rest5623[2].token.value === "{}") {
                rest5623[1].token.inner = rest5623[1].token.inner;
                rest5623[2].token.inner = rest5623[2].token.inner;
                return step5621(NamedFunTerm5403.create(head5622, null, rest5623[0], rest5623[1], rest5623[2]), rest5623.slice(3), opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "function" && rest5623[0] && rest5623[0].isPunctuator() && rest5623[0].token.value === "*" && rest5623[1] && rest5623[1].isIdentifier() && rest5623[2] && rest5623[2].isDelimiter() && rest5623[2].token.value === "()" && rest5623[3] && rest5623[3].isDelimiter() && rest5623[3].token.value === "{}") {
                return step5621(NamedFunTerm5403.create(head5622, rest5623[0], rest5623[1], rest5623[2], rest5623[3]), rest5623.slice(4), opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "function" && rest5623[0] && rest5623[0].isDelimiter() && rest5623[0].token.value === "()" && rest5623[1] && rest5623[1].isDelimiter() && rest5623[1].token.value === "{}") {
                return step5621(AnonFunTerm5404.create(head5622, null, rest5623[0], rest5623[1]), rest5623.slice(2), opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "function" && rest5623[0] && rest5623[0].isPunctuator() && rest5623[0].token.value === "*" && rest5623[1] && rest5623[1].isDelimiter() && rest5623[1].token.value === "()" && rest5623[2] && rest5623[2].isDelimiter && rest5623[2].token.value === "{}") {
                rest5623[1].token.inner = rest5623[1].token.inner;
                rest5623[2].token.inner = rest5623[2].token.inner;
                return step5621(AnonFunTerm5404.create(head5622, rest5623[0], rest5623[1], rest5623[2]), rest5623.slice(3), opCtx5624);
            } else if ((head5622.isDelimiter() && head5622.token.value === "()" || head5622.isIdentifier()) && rest5623[0] && rest5623[0].isPunctuator() && resolve5346(rest5623[0], context5618.phase) === "=>" && rest5623[1] && rest5623[1].isDelimiter() && rest5623[1].token.value === "{}") {
                return step5621(ArrowFunTerm5405.create(head5622, rest5623[0], rest5623[1]), rest5623.slice(2), opCtx5624);
            } else if (head5622.isIdentifier() && head5622.token.value === "forPhase" && rest5623[0] && rest5623[0].isNumericLiteral() && rest5623[1] && rest5623[1].isDelimiter()) {
                return step5621(ForPhaseTerm5390.create(rest5623[0], rest5623[1].token.inner), rest5623.slice(2), opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "catch" && rest5623[0] && rest5623[0].isDelimiter() && rest5623[0].token.value === "()" && rest5623[1] && rest5623[1].isDelimiter() && rest5623[1].token.value === "{}") {
                rest5623[0].token.inner = rest5623[0].token.inner;
                rest5623[1].token.inner = rest5623[1].token.inner;
                return step5621(CatchClauseTerm5394.create(head5622, rest5623[0], rest5623[1]), rest5623.slice(2), opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "this") {
                return step5621(ThisExpressionTerm5413.create(head5622), rest5623, opCtx5624);
            } else if (head5622.isNumericLiteral() || head5622.isStringLiteral() || head5622.isBooleanLiteral() || head5622.isRegularExpression() || head5622.isNullLiteral()) {
                return step5621(LitTerm5414.create(head5622), rest5623, opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "import") {
                var imp5702 = enforestImport5467(head5622, rest5623);
                return step5621(imp5702.result, imp5702.rest, opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "export" && rest5623[0] && rest5623[0].isDelimiter()) {
                return step5621(ExportNameTerm5383.create(head5622, rest5623[0]), rest5623.slice(1), opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "export" && rest5623[0] && rest5623[0].isKeyword() && unwrapSyntax5359(rest5623[0]) === "default" && rest5623[1]) {
                var res5677 = enforest5481(rest5623.slice(1), context5618);
                return step5621(ExportDefaultTerm5384.create(head5622, rest5623[0], res5677.result), res5677.rest, opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "export" && rest5623[0]) {
                var res5677 = enforest5481(rest5623, context5618);
                return step5621(ExportDeclTerm5385.create(head5622, res5677.result), res5677.rest, opCtx5624);
            } else if (head5622.isIdentifier()) {
                return step5621(IdTerm5417.create(head5622), rest5623, opCtx5624);
            } else if (head5622.isPunctuator()) {
                return step5621(PuncTerm5372.create(head5622), rest5623, opCtx5624);
            } else if (head5622.isKeyword() && unwrapSyntax5359(head5622) === "with") {
                throwSyntaxError5356("enforest", "with is not supported in sweet.js", head5622);
            } else if (head5622.isKeyword()) {
                return step5621(KeywordTerm5371.create(head5622), rest5623, opCtx5624);
            } else if (head5622.isDelimiter()) {
                return step5621(DelimiterTerm5373.create(head5622), rest5623, opCtx5624);
            } else if (head5622.isTemplate()) {
                return step5621(TemplateTerm5408.create(head5622), rest5623, opCtx5624);
            } else if (head5622.isEOF()) {
                assert5354(rest5623.length === 0, "nothing should be after an EOF");
                return step5621(EOFTerm5370.create(head5622), [], opCtx5624);
            } else {
                // todo: are we missing cases?
                assert5354(false, "not implemented");
            }
        }
        if ( // Potentially an infix macro
        // This should only be invoked on runtime syntax terms
        !head5622.isMacroTerm && !head5622.isAnonMacroTerm && !head5622.isOperatorDefinitionTerm && rest5623.length && hasSyntaxTransform5475(rest5623, context5618, context5618.phase) && getSyntaxTransform5474(rest5623, context5618, context5618.phase).isOp === false) {
            var infLeftTerm5705 = opCtx5624.prevTerms[0] && opCtx5624.prevTerms[0].isPartialTerm ? opCtx5624.prevTerms[0] : null;
            var infTerm5706 = PartialExpressionTerm5420.create(head5622.destruct(context5618), infLeftTerm5705, function () {
                return step5621(head5622, [], opCtx5624);
            });
            var infPrevStx5707 = tagWithTerm5484(infTerm5706, head5622.destruct(context5618)).reverse().concat(opCtx5624.prevStx);
            var infPrevTerms5708 = [infTerm5706].concat(opCtx5624.prevTerms);
            var infRes5709 = expandMacro5477(rest5623, context5618, {
                prevStx: infPrevStx5707,
                prevTerms: infPrevTerms5708
            });
            if (infRes5709.prevTerms && infRes5709.prevTerms.length < infPrevTerms5708.length) {
                var infOpCtx5710 = rewindOpCtx5482(opCtx5624, infRes5709);
                return step5621(infRes5709.result[0], infRes5709.result.slice(1).concat(infRes5709.rest), infOpCtx5710);
            } else {
                return step5621(head5622, infRes5709.result.concat(infRes5709.rest), opCtx5624);
            }
        }
        var // done with current step so combine and continue on
        combResult5626 = opCtx5624.combine(head5622);
        if (opCtx5624.stack.length === 0) {
            return {
                result: combResult5626.term,
                rest: rest5623,
                prevStx: combResult5626.prevStx,
                prevTerms: combResult5626.prevTerms
            };
        } else {
            return step5621(combResult5626.term, rest5623, opCtx5624.stack[0]);
        }
    }
    return step5621(toks5617[0], toks5617.slice(1), {
        combine: function combine(t5711) {
            return {
                term: t5711,
                prevStx: prevStx5619,
                prevTerms: prevTerms5620
            };
        },
        prec: 0,
        stack: [],
        op: null,
        prevStx: prevStx5619,
        prevTerms: prevTerms5620
    });
}
function rewindOpCtx5482(opCtx5712, res5713) {
    if ( // If we've consumed all pending operators, we can just start over.
    // It's important that we always thread the new prevStx and prevTerms
    // through, otherwise the old ones will still persist.
    !res5713.prevTerms.length || !res5713.prevTerms[0].isPartialTerm) {
        return _5337.extend({}, opCtx5712, {
            combine: function combine(t5717) {
                return {
                    term: t5717,
                    prevStx: res5713.prevStx,
                    prevTerms: res5713.prevTerms
                };
            },
            prec: 0,
            op: null,
            stack: [],
            prevStx: res5713.prevStx,
            prevTerms: res5713.prevTerms
        });
    }
    // To rewind, we need to find the first (previous) pending operator. It
    // acts as a marker in the opCtx to let us know how far we need to go
    // back.
    var op5714 = null;
    for (var i5715 = 0; i5715 < res5713.prevTerms.length; i5715++) {
        if (!res5713.prevTerms[i5715].isPartialTerm) {
            break;
        }
        if (res5713.prevTerms[i5715].isPartialOperationTerm) {
            op5714 = res5713.prevTerms[i5715];
            break;
        }
    }
    if ( // If the op matches the current opCtx, we don't need to rewind
    // anything, but we still need to persist the prevStx and prevTerms.
    opCtx5712.op === op5714) {
        return _5337.extend({}, opCtx5712, {
            prevStx: res5713.prevStx,
            prevTerms: res5713.prevTerms
        });
    }
    for (var i5715 = 0; i5715 < opCtx5712.stack.length; i5715++) {
        if (opCtx5712.stack[i5715].op === op5714) {
            return _5337.extend({}, opCtx5712.stack[i5715], {
                prevStx: res5713.prevStx,
                prevTerms: res5713.prevTerms
            });
        }
    }
    assert5354(false, "Rewind failed.");
}
function get_expression5483(stx5718, context5719) {
    if (stx5718[0].term) {
        for (var termLen5721 = 1; termLen5721 < stx5718.length; termLen5721++) {
            if (stx5718[termLen5721].term !== stx5718[0].term) {
                break;
            }
        }
        if ( // Guard the termLen because we can have a multi-token term that
        // we don't want to split. TODO: is there something we can do to
        // get around this safely?
        stx5718[0].term.isPartialExpressionTerm && termLen5721 === stx5718[0].term.stx.length) {
            var expr5722 = stx5718[0].term.combine().result;
            for (var i5723 = 1, term5724 = stx5718[0].term; i5723 < stx5718.length; i5723++) {
                if (stx5718[i5723].term !== term5724) {
                    if (term5724 && term5724.isPartialTerm) {
                        term5724 = term5724.left;
                        i5723--;
                    } else {
                        break;
                    }
                }
            }
            return {
                result: expr5722,
                rest: stx5718.slice(i5723)
            };
        } else if (stx5718[0].term.isExprTerm) {
            return {
                result: stx5718[0].term,
                rest: stx5718.slice(termLen5721)
            };
        } else {
            return {
                result: null,
                rest: stx5718
            };
        }
    }
    var res5720 = enforest5481(stx5718, context5719);
    if (!res5720.result || !res5720.result.isExprTerm) {
        return {
            result: null,
            rest: stx5718
        };
    }
    return res5720;
}
function tagWithTerm5484(term5725, stx5726) {
    return stx5726.map(function (s5727) {
        s5727 = s5727.clone();
        s5727.term = term5725;
        return s5727;
    });
}
function applyMarkToPatternEnv5485(newMark5728, env5729) {
    function dfs5730(match5731) {
        if (match5731.level === 0) {
            // replace the match property with the marked syntax
            match5731.match = _5337.map(match5731.match, function (stx5732) {
                return stx5732.mark(newMark5728);
            });
        } else {
            _5337.each(match5731.match, function (match5733) {
                dfs5730(match5733);
            });
        }
    }
    _5337.keys(env5729).forEach(function (key5734) {
        dfs5730(env5729[key5734]);
    });
}
function markIn5486(arr5735, mark5736) {
    return arr5735.map(function (stx5737) {
        return stx5737.mark(mark5736);
    });
}
function markDefOut5487(arr5738, mark5739, def5740) {
    return arr5738.map(function (stx5741) {
        return stx5741.mark(mark5739);
    });
}
function loadMacroDef5488(body5742, context5743, phase5744) {
    var expanded5745 = body5742[0].destruct(context5743, { stripCompileTerm: true });
    var stub5746 = parser5338.read("()");
    stub5746[0].token.inner = expanded5745;
    var flattend5747 = flatten5512(stub5746);
    var bodyCode5748 = codegen5336.generate(parser5338.parse(flattend5747, { phase: phase5744 }));
    var localCtx5749;
    var macroGlobal5750 = {
        makeValue: syn5339.makeValue,
        makeRegex: syn5339.makeRegex,
        makeIdent: syn5339.makeIdent,
        makeKeyword: syn5339.makeKeyword,
        makePunc: syn5339.makePunc,
        makeDelim: syn5339.makeDelim,
        localExpand: function localExpand(stx5752, stop5753) {
            stop5753 = stop5753 || [];
            var markedStx5754 = markIn5486(stx5752, localCtx5749.mark);
            var stopMap5755 = new StringMap5341();
            stop5753.forEach(function (stop5759) {
                stopMap5755.set(resolve5346(stop5759, localCtx5749.phase), true);
            });
            var localExpandCtx5756 = makeExpanderContext5492(_5337.extend({}, localCtx5749, { stopMap: stopMap5755 }));
            var terms5757 = expand5491(markedStx5754, localExpandCtx5756);
            var newStx5758 = terms5757.reduce(function (acc5760, term5761) {
                acc5760.push.apply(acc5760, term5761.destruct(localCtx5749, { stripCompileTerm: true }));
                return acc5760;
            }, []);
            return markDefOut5487(newStx5758, localCtx5749.mark, localCtx5749.defscope);
        },
        filename: context5743.filename,
        getExpr: function getExpr(stx5762) {
            if (stx5762.length === 0) {
                return {
                    success: false,
                    result: [],
                    rest: []
                };
            }
            var markedStx5763 = markIn5486(stx5762, localCtx5749.mark);
            var r5764 = get_expression5483(markedStx5763, localCtx5749);
            return {
                success: r5764.result !== null,
                result: r5764.result === null ? [] : markDefOut5487(r5764.result.destruct(localCtx5749, { stripCompileTerm: true }), localCtx5749.mark, localCtx5749.defscope),
                rest: markDefOut5487(r5764.rest, localCtx5749.mark, localCtx5749.defscope)
            };
        },
        getIdent: function getIdent(stx5765) {
            if (stx5765[0] && stx5765[0].isIdentifier()) {
                return {
                    success: true,
                    result: [stx5765[0]],
                    rest: stx5765.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5765
            };
        },
        getLit: function getLit(stx5766) {
            if (stx5766[0] && patternModule5352.typeIsLiteral(stx5766[0].token.type)) {
                return {
                    success: true,
                    result: [stx5766[0]],
                    rest: stx5766.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5766
            };
        },
        unwrapSyntax: syn5339.unwrapSyntax,
        throwSyntaxError: throwSyntaxError5356,
        throwSyntaxCaseError: throwSyntaxCaseError5357,
        prettyPrint: syn5339.prettyPrint,
        parser: parser5338,
        __fresh: fresh5365,
        __freshScope: freshScope5366,
        __scope: context5743.scope,
        __bindings: context5743.bindings,
        _: _5337,
        patternModule: patternModule5352,
        getPattern: function getPattern(id5767) {
            return context5743.patternMap.get(id5767);
        },
        getPatternMap: function getPatternMap() {
            return context5743.patternMap;
        },
        getTemplate: function getTemplate(id5768) {
            assert5354(context5743.templateMap.has(id5768), "missing template");
            return syn5339.cloneSyntaxArray(context5743.templateMap.get(id5768));
        },
        getTemplateMap: function getTemplateMap() {
            // the template map is global across all context during compilation
            return context5743.templateMap;
        },
        applyMarkToPatternEnv: applyMarkToPatternEnv5485,
        mergeMatches: function mergeMatches(newMatch5769, oldMatch5770) {
            newMatch5769.patternEnv = _5337.extend({}, oldMatch5770.patternEnv, newMatch5769.patternEnv);
            return newMatch5769;
        },
        console: console
    };
    context5743.env.keysStr().forEach(function (key5771) {
        var val5772 = context5743.env.getStr(key5771);
        if ( // load the runtime values into the global object
        val5772 && val5772 instanceof RuntimeValue5472) {
            macroGlobal5750[key5771] = val5772.trans.value;
        }
    });
    context5743.store.keysStr().forEach(function (key5773) {
        var val5774 = context5743.store.getStr(key5773);
        if ( // load the runtime values into the global object
        val5774 && val5774 instanceof RuntimeValue5472) {
            macroGlobal5750[key5773] = val5774.trans.value;
        }
    });
    var macroFn5751 = scopedEval5449(bodyCode5748, macroGlobal5750);
    return function (stx5775, context5776, prevStx5777, prevTerms5778) {
        localCtx5749 = context5776;
        return macroFn5751(stx5775, context5776, prevStx5777, prevTerms5778);
    };
}
function expandToTermTree5489(stx5779, context5780) {
    assert5354(context5780, "expander context is required");
    var f5781, head5782, prevStx5783, restStx5784, prevTerms5785, macroDefinition5786;
    var rest5787 = stx5779;
    while (rest5787.length > 0) {
        assert5354(rest5787[0].token, "expecting a syntax object");
        f5781 = enforest5481(rest5787, context5780, prevStx5783, prevTerms5785);
        // head :: TermTree
        head5782 = f5781.result;
        // rest :: [Syntax]
        rest5787 = f5781.rest;
        if (!head5782) {
            // no head means the expansions stopped prematurely (for stepping)
            restStx5784 = rest5787;
            break;
        }
        var destructed5788 = tagWithTerm5484(head5782, f5781.result.destruct(context5780));
        prevTerms5785 = [head5782].concat(f5781.prevTerms);
        prevStx5783 = destructed5788.reverse().concat(f5781.prevStx);
        if (head5782.isImportTerm) {
            var // record the import in the module record for easier access
            entries5789 = context5780.moduleRecord.addImport(head5782);
            var // load up the (possibly cached) import module
            importMod5790 = loadImport5504(unwrapSyntax5359(head5782.from), context5780, context5780.moduleRecord.name);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5780 = visit5501(importMod5790.term, importMod5790.record, context5780.phase, context5780);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5505(entries5789, importMod5790.term, importMod5790.record, context5780, context5780.phase);
        }
        if (head5782.isImportForPhaseTerm) {
            var // record the import in the module record for easier access
            entries5789 = context5780.moduleRecord.addImport(head5782);
            var // load up the (possibly cached) import module
            importMod5790 = loadImport5504(unwrapSyntax5359(head5782.from), context5780, context5780.moduleRecord.name);
            // invoking an imported module loads the runtime values
            // into the environment for this phase
            context5780 = invoke5499(importMod5790.term, importMod5790.record, context5780.phase + head5782.phase.token.value, context5780);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5780 = visit5501(importMod5790.term, importMod5790.record, context5780.phase + head5782.phase.token.value, context5780);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5505(entries5789, importMod5790.term, importMod5790.record, context5780, context5780.phase);
        }
        if (head5782.isForPhaseTerm) {
            var phaseShiftedContext5793 = makeExpanderContext5492(_5337.defaults({ phase: context5780.phase + head5782.phase.token.value }, context5780));
            head5782.body = expand5491(head5782.body, phaseShiftedContext5793);
        }
        if ((head5782.isExportDefaultTerm && head5782.decl.isMacroTerm || head5782.isMacroTerm) && expandCount5453 < maxExpands5454) {
            var macroDecl5794 = head5782.isExportDefaultTerm ? head5782.decl : head5782;
            if (!( // raw function primitive form
            macroDecl5794.body[0] && macroDecl5794.body[0].isKeyword() && macroDecl5794.body[0].token.value === "function")) {
                throwSyntaxError5356("load macro", "Primitive macro form must contain a function for the macro body", macroDecl5794.body);
            }
            // expand the body
            macroDecl5794.body = expand5491(macroDecl5794.body, makeExpanderContext5492(_5337.defaults({ phase: context5780.phase + 1 }, context5780)));
            //  and load the macro definition into the environment
            macroDefinition5786 = loadMacroDef5488(macroDecl5794.body, context5780, context5780.phase + 1);
            var fullName5795 = macroDecl5794.name.token.inner;
            var multiTokName5796 = makeMultiToken5367(macroDecl5794.name);
            multiTokName5796 = multiTokName5796.delScope(context5780.useScope);
            context5780.bindings.add(multiTokName5796, fresh5365(), context5780.phase);
            context5780.env.set(multiTokName5796, context5780.phase, new CompiletimeValue5471(new SyntaxTransform5344(macroDefinition5786, false, builtinMode5452, fullName5795), context5780.moduleRecord.name, context5780.phase));
        }
        if (head5782.isOperatorDefinitionTerm) {
            if (!( // raw function primitive form
            head5782.body[0] && head5782.body[0].isKeyword() && head5782.body[0].token.value === "function")) {
                throwSyntaxError5356("load macro", "Primitive macro form must contain a function for the macro body", head5782.body);
            }
            // expand the body
            head5782.body = expand5491(head5782.body, makeExpanderContext5492(_5337.defaults({ phase: context5780.phase + 1 }, context5780)));
            var //  and load the macro definition into the environment
            opDefinition5797 = loadMacroDef5488(head5782.body, context5780, context5780.phase + 1);
            var fullName5795 = head5782.name.token.inner;
            var multiTokName5796 = makeMultiToken5367(head5782.name);
            multiTokName5796 = multiTokName5796.delScope(context5780.useScope);
            context5780.bindings.add(multiTokName5796, fresh5365(), context5780.phase);
            var opObj5800 = getSyntaxTransform5474(multiTokName5796, context5780, context5780.phase);
            if (!opObj5800) {
                opObj5800 = {
                    isOp: true,
                    builtin: builtinMode5452,
                    fullName: fullName5795
                };
            }
            assert5354(unwrapSyntax5359(head5782.type) === "binary" || unwrapSyntax5359(head5782.type) === "unary", "operator must either be binary or unary");
            opObj5800[unwrapSyntax5359(head5782.type)] = {
                fn: opDefinition5797,
                prec: head5782.prec.token.value,
                assoc: head5782.assoc ? head5782.assoc.token.value : null
            };
            context5780.env.set(multiTokName5796, context5780.phase, new CompiletimeValue5471(opObj5800, context5780.moduleRecord.name, context5780.phase));
        }
        if (head5782.isNamedFunTerm) {
            // addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            head5782.name = head5782.name.delScope(context5780.useScope);
            context5780.bindings.add(head5782.name, fresh5365(), context5780.phase);
        }
        if (head5782.isVariableStatementTerm || head5782.isLetStatementTerm || head5782.isConstStatementTerm) {
            head5782.decls = head5782.decls.map(function (decl5801) {
                decl5801.ident = decl5801.ident.delScope(context5780.useScope);
                context5780.bindings.add(decl5801.ident, fresh5365(), context5780.phase);
                return decl5801;
            });
        }
        if (head5782.isBlockTerm && head5782.body.isDelimiterTerm) {
            head5782.body.delim.token.inner.forEach(function (term5802) {
                if (term5802.isVariableStatementTerm) {
                    term5802.decls = term5802.decls.map(function (decl5803) {
                        decl5803.ident = decl5803.ident.delScope(context5780.useScope);
                        context5780.bindings.add(decl5803.ident, fresh5365(), context5780.phase);
                        return decl5803;
                    });
                }
            });
        }
        if (head5782.isDelimiterTerm) {
            head5782.delim.token.inner.forEach(function (term5804) {
                if (term5804.isVariableStatementTerm) {
                    term5804.decls = term5804.decls.map(function (decl5805) {
                        decl5805.ident = decl5805.ident.delScope(context5780.useScope);
                        context5780.bindings.add(decl5805.ident, fresh5365(), context5780.phase);
                        return decl5805;
                    });
                }
            });
        }
        if (head5782.isForStatementTerm) {
            var forCond5806 = head5782.cond.token.inner;
            if (forCond5806[0] && resolve5346(forCond5806[0], context5780.phase) === "let" && forCond5806[1] && forCond5806[1].isIdentifier()) {
                var letNew5807 = fresh5365();
                var letId5808 = forCond5806[1];
                forCond5806 = forCond5806.map(function (stx5809) {
                    return stx5809.rename(letId5808, letNew5807);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head5782.cond.token.inner = expand5491([forCond5806[0]], context5780).concat(expand5491(forCond5806.slice(1), context5780));
                if ( // nice and easy case: `for (...) { ... }`
                rest5787[0] && rest5787[0].token.value === "{}") {
                    rest5787[0] = rest5787[0].rename(letId5808, letNew5807);
                } else {
                    var // need to deal with things like `for (...) if (...) log(...)`
                    bodyEnf5810 = enforest5481(rest5787, context5780);
                    var bodyDestructed5811 = bodyEnf5810.result.destruct(context5780);
                    var renamedBodyTerm5812 = bodyEnf5810.result.rename(letId5808, letNew5807);
                    tagWithTerm5484(renamedBodyTerm5812, bodyDestructed5811);
                    rest5787 = bodyEnf5810.rest;
                    prevStx5783 = bodyDestructed5811.reverse().concat(prevStx5783);
                    prevTerms5785 = [renamedBodyTerm5812].concat(prevTerms5785);
                }
            } else {
                head5782.cond.token.inner = expand5491(head5782.cond.token.inner, context5780);
            }
        }
    }
    return {
        // prevTerms are stored in reverse for the purposes of infix
        // lookbehind matching, so we need to re-reverse them.
        terms: prevTerms5785 ? prevTerms5785.reverse() : [],
        restStx: restStx5784,
        context: context5780
    };
}
function expandTermTreeToFinal5490(term5813, context5814) {
    assert5354(context5814 && context5814.env, "environment map is required");
    if (term5813.isArrayLiteralTerm) {
        term5813.array.delim.token.inner = expand5491(term5813.array.delim.token.inner, context5814);
        return term5813;
    } else if (term5813.isBlockTerm) {
        term5813.body.delim.token.inner = expand5491(term5813.body.delim.token.inner, context5814);
        return term5813;
    } else if (term5813.isParenExpressionTerm) {
        term5813.args = _5337.map(term5813.args, function (arg5815) {
            return expandTermTreeToFinal5490(arg5815, context5814);
        });
        return term5813;
    } else if (term5813.isCallTerm) {
        term5813.fun = expandTermTreeToFinal5490(term5813.fun, context5814);
        term5813.args = expandTermTreeToFinal5490(term5813.args, context5814);
        return term5813;
    } else if (term5813.isReturnStatementTerm) {
        term5813.expr = expandTermTreeToFinal5490(term5813.expr, context5814);
        return term5813;
    } else if (term5813.isUnaryOpTerm) {
        term5813.expr = expandTermTreeToFinal5490(term5813.expr, context5814);
        return term5813;
    } else if (term5813.isBinOpTerm || term5813.isAssignmentExpressionTerm) {
        term5813.left = expandTermTreeToFinal5490(term5813.left, context5814);
        term5813.right = expandTermTreeToFinal5490(term5813.right, context5814);
        return term5813;
    } else if (term5813.isObjGetTerm) {
        term5813.left = expandTermTreeToFinal5490(term5813.left, context5814);
        term5813.right.delim.token.inner = expand5491(term5813.right.delim.token.inner, context5814);
        return term5813;
    } else if (term5813.isObjDotGetTerm) {
        term5813.left = expandTermTreeToFinal5490(term5813.left, context5814);
        term5813.right = expandTermTreeToFinal5490(term5813.right, context5814);
        return term5813;
    } else if (term5813.isConditionalExpressionTerm) {
        term5813.cond = expandTermTreeToFinal5490(term5813.cond, context5814);
        term5813.tru = expandTermTreeToFinal5490(term5813.tru, context5814);
        term5813.fls = expandTermTreeToFinal5490(term5813.fls, context5814);
        return term5813;
    } else if (term5813.isVariableDeclarationTerm) {
        if (term5813.init) {
            term5813.init = expandTermTreeToFinal5490(term5813.init, context5814);
        }
        return term5813;
    } else if (term5813.isVariableStatementTerm) {
        term5813.decls = _5337.map(term5813.decls, function (decl5816) {
            return expandTermTreeToFinal5490(decl5816, context5814);
        });
        return term5813;
    } else if (term5813.isDelimiterTerm) {
        // expand inside the delimiter and then continue on
        term5813.delim.token.inner = expand5491(term5813.delim.token.inner, context5814);
        return term5813;
    } else if (term5813.isIdTerm) {
        var varTrans5817 = getCompiletimeValue5473(term5813.id, context5814, context5814.phase);
        if (varTrans5817 instanceof VarTransform5345) {
            term5813.id = syntaxFromToken5450(term5813.id.token, varTrans5817.id);
        }
        return term5813;
    } else if (term5813.isNamedFunTerm || term5813.isAnonFunTerm || term5813.isCatchClauseTerm || term5813.isArrowFunTerm || term5813.isModuleTerm) {
        var newDef5818;
        var paramSingleIdent5821;
        var params5822;
        var bodies5823;
        var paramNames5824;
        var bodyContext5825;
        var renamedBody5826;
        var expandedResult5827;
        var bodyTerms5828;
        var renamedParams5829;
        var flatArgs5830;
        var puncCtx5836;
        var expandedArgs5831;

        var _ret = (function () {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            newDef5818 = [];

            var scope5819 = freshScope5366(context5814.bindings);
            var useScope5820 = freshScope5366(context5814.bindings);
            paramSingleIdent5821 = term5813.params && term5813.params.isIdentifier();

            if (term5813.params && term5813.params.isDelimiter()) {
                params5822 = term5813.params;
            } else if (paramSingleIdent5821) {
                params5822 = term5813.params;
            } else {
                params5822 = syn5339.makeDelim("()", [], null);
            }

            if (Array.isArray(term5813.body)) {
                bodies5823 = syn5339.makeDelim("{}", term5813.body, null);
            } else {
                bodies5823 = term5813.body;
            }
            paramNames5824 = _5337.map(getParamIdentifiers5458(params5822), function (param5832) {
                var paramNew5833 = param5832.mark(scope5819);
                context5814.bindings.add(paramNew5833, fresh5365(), context5814.phase);
                context5814.env.set(paramNew5833, context5814.phase, new CompiletimeValue5471(new VarTransform5345(paramNew5833), context5814.moduleRecord.name, context5814.phase));
                return {
                    originalParam: param5832,
                    renamedParam: paramNew5833
                };
            });
            bodyContext5825 = makeExpanderContext5492(_5337.defaults({
                scope: scope5819,
                useScope: useScope5820,
                defscope: newDef5818,
                // paramscope is used to filter out var redeclarations
                paramscope: paramNames5824.map(function (p5834) {
                    return p5834.renamedParam;
                })
            }, context5814));
            renamedBody5826 = bodies5823.mark(scope5819);
            expandedResult5827 = expandToTermTree5489(renamedBody5826.token.inner, bodyContext5825);
            bodyTerms5828 = expandedResult5827.terms;

            if (expandedResult5827.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody5826.token.inner = expandedResult5827.terms.concat(expandedResult5827.restStx);
                if (Array.isArray(term5813.body)) {
                    term5813.body = renamedBody5826.token.inner;
                } else {
                    term5813.body = renamedBody5826;
                }
                return {
                    v: term5813
                };
            }
            renamedParams5829 = _5337.map(paramNames5824, function (p5835) {
                return p5835.renamedParam;
            });

            if (paramSingleIdent5821) {
                flatArgs5830 = renamedParams5829[0];
            } else {
                puncCtx5836 = term5813.params || null;

                flatArgs5830 = syn5339.makeDelim("()", joinSyntax5451(renamedParams5829, syn5339.makePunc(",", puncCtx5836)), puncCtx5836);
            }
            expandedArgs5831 = expand5491([flatArgs5830], bodyContext5825);

            assert5354(expandedArgs5831.length === 1, "should only get back one result");
            if ( // stitch up the function with all the renamings
            term5813.params) {
                term5813.params = expandedArgs5831[0];
            }
            bodyTerms5828 = _5337.map(bodyTerms5828, function (bodyTerm5837) {
                if ( // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                bodyTerm5837.isBlockTerm) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal5838 = expandTermTreeToFinal5490(bodyTerm5837, expandedResult5827.context);
                    return blockFinal5838;
                } else {
                    var termWithCtx5839 = bodyTerm5837;
                    // finish expansion
                    return expandTermTreeToFinal5490(termWithCtx5839, expandedResult5827.context);
                }
            });
            if (term5813.isModuleTerm) {
                bodyTerms5828.forEach(function (bodyTerm5840) {
                    if (bodyTerm5840.isExportNameTerm || bodyTerm5840.isExportDeclTerm || bodyTerm5840.isExportDefaultTerm) {
                        context5814.moduleRecord.addExport(bodyTerm5840);
                    }
                });
            }
            renamedBody5826.token.inner = bodyTerms5828;
            if (Array.isArray(term5813.body)) {
                term5813.body = renamedBody5826.token.inner;
            } else {
                term5813.body = renamedBody5826;
            }
            // and continue expand the rest
            return {
                v: term5813
            };
        })();

        if (typeof _ret === "object") return _ret.v;
    }
    // the term is fine as is
    return term5813;
}
function expand5491(stx5841, context5842) {
    assert5354(context5842, "must provide an expander context");
    var trees5843 = expandToTermTree5489(stx5841, context5842);
    var terms5844 = _5337.map(trees5843.terms, function (term5845) {
        return expandTermTreeToFinal5490(term5845, trees5843.context);
    });
    if (trees5843.restStx) {
        terms5844.push.apply(terms5844, trees5843.restStx);
    }
    return terms5844;
}
function makeExpanderContext5492(o5846) {
    o5846 = o5846 || {};
    var env5847 = o5846.env || new NameMap5342();
    var store5848 = o5846.store || new NameMap5342();
    var bindings5849 = o5846.bindings || new BindingMap5343();
    return Object.create(Object.prototype, {
        filename: {
            value: o5846.filename,
            writable: false,
            enumerable: true,
            configurable: false
        },
        compileSuffix: {
            value: o5846.compileSuffix || ".jsc",
            writable: false,
            enumerable: true,
            configurable: false
        },
        env: {
            value: env5847,
            writable: false,
            enumerable: true,
            configurable: false
        },
        store: {
            value: store5848,
            writable: false,
            enumerable: true,
            configurable: false
        },
        defscope: {
            value: o5846.defscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        paramscope: {
            value: o5846.paramscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        templateMap: {
            value: o5846.templateMap || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        patternMap: {
            value: o5846.patternMap || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        mark: {
            value: o5846.mark,
            writable: false,
            enumerable: true,
            configurable: false
        },
        bindings: {
            value: bindings5849,
            writable: false,
            enumerable: true,
            configurable: false
        },
        scope: {
            value: o5846.scope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        useScope: {
            value: o5846.useScope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        phase: {
            value: o5846.phase || 0,
            writable: false,
            enumerable: true,
            configurable: false
        },
        implicitImport: {
            value: o5846.implicitImport || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        stopMap: {
            value: o5846.stopMap || new StringMap5341(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        moduleRecord: {
            value: o5846.moduleRecord || {},
            writable: false,
            enumerable: true,
            configurable: false
        }
    });
}
function makeModuleExpanderContext5493(filename5850, templateMap5851, patternMap5852, phase5853, moduleRecord5854, compileSuffix5855, bindings5856) {
    return makeExpanderContext5492({
        filename: filename5850,
        templateMap: templateMap5851,
        patternMap: patternMap5852,
        phase: phase5853,
        moduleRecord: moduleRecord5854,
        compileSuffix: compileSuffix5855,
        bindings: bindings5856
    });
}
function makeTopLevelExpanderContext5494(options5857) {
    var filename5858 = options5857 && options5857.filename ? options5857.filename : "<anonymous module>";
    return makeExpanderContext5492({ filename: filename5858 });
}
function resolvePath5495(name5859, parent5860) {
    var path5861 = require("path");
    var resolveSync5862 = require("resolve/lib/sync");
    var root5863 = path5861.dirname(parent5860);
    var fs5864 = require("fs");
    if (name5859[0] === ".") {
        name5859 = path5861.resolve(root5863, name5859);
    }
    return resolveSync5862(name5859, {
        basedir: root5863,
        extensions: [".js", ".sjs"]
    });
}
function defaultImportStx5496(importPath5865, ctx5866) {
    var rtNames5867 = ["stxnonrec", "stxrec", "macroclass", "operator"];
    var ctNames5868 = ["quoteSyntax", "syntax", "#", "syntaxCase", "stxnonrec", "stxrec", "withSyntax", "letstx", "macroclass", "operator"];
    var importNames5869 = rtNames5867.map(function (name5873) {
        return syn5339.makeIdent(name5873, ctx5866);
    });
    var importForMacrosNames5870 = ctNames5868.map(function (name5874) {
        return syn5339.makeIdent(name5874, ctx5866);
    });
    var // import { names ... } from "importPath" for phase 1
    importForMacrosStmt5871 = [syn5339.makeKeyword("import", ctx5866), syn5339.makeDelim("{}", joinSyntax5451(importForMacrosNames5870, syn5339.makePunc(",", ctx5866)), ctx5866), syn5339.makeIdent("from", ctx5866), syn5339.makeValue(importPath5865, ctx5866), syn5339.makeKeyword("for", ctx5866), syn5339.makeIdent("phase", ctx5866), syn5339.makeValue(1, ctx5866)];
    var // import { names ... } from "importPath"
    importStmt5872 = [syn5339.makeKeyword("import", ctx5866), syn5339.makeDelim("{}", joinSyntax5451(importNames5869, syn5339.makePunc(",", ctx5866)), ctx5866), syn5339.makeIdent("from", ctx5866), syn5339.makeValue(importPath5865, ctx5866)];
    return importStmt5872.concat(importForMacrosStmt5871);
}
function createModule5497(name5875, body5876) {
    var language5877 = "base";
    var modBody5878 = body5876;
    if (body5876 && body5876[0] && body5876[1] && body5876[2] && unwrapSyntax5359(body5876[0]) === "#" && unwrapSyntax5359(body5876[1]) === "lang" && body5876[2].isStringLiteral()) {
        language5877 = unwrapSyntax5359(body5876[2]);
        // consume optional semicolon
        modBody5878 = body5876[3] && body5876[3].token.value === ";" && body5876[3].isPunctuator() ? body5876.slice(4) : body5876.slice(3);
    }
    if ( // insert the default import statements into the module body
    language5877 !== "base" && language5877 !== "js") {
        // "base" and "js" are currently special languages meaning don't
        // insert the default imports
        modBody5878 = defaultImportStx5496(language5877, body5876[0]).concat(modBody5878);
    }
    return {
        record: new ModuleRecord5351(name5875, language5877),
        term: ModuleTerm5375.create(modBody5878)
    };
}
function loadModule5498(name5879) {
    var // node specific code
    fs5880 = require("fs");
    return (function (body5881) {
        return createModule5497(name5879, body5881);
    })(parser5338.read(fs5880.readFileSync(name5879, "utf8")));
}
function invoke5499(modTerm5882, modRecord5883, phase5884, context5885) {
    if (modRecord5883.language === "base") {
        var // base modules can just use the normal require pipeline
        exported5886 = require(modRecord5883.name);
        Object.keys(exported5886).forEach(function (exp5887) {
            var // create new bindings in the context
            expName5888 = syn5339.makeIdent(exp5887, null).mark(freshScope5366(context5885.bindings));
            context5885.bindings.add(expName5888, fresh5365(), phase5884);
            modRecord5883.exportEntries.push(new ExportEntry5350(null, expName5888, expName5888));
            context5885.store.setWithModule(expName5888, phase5884, modRecord5883.name, new RuntimeValue5472({ value: exported5886[exp5887] }, modRecord5883.name, phase5884));
        });
    } else {
        // recursively invoke any imports in this module at this
        // phase and update the context
        modRecord5883.importedModules.forEach(function (impPath5891) {
            var importMod5892 = loadImport5504(impPath5891, context5885, modRecord5883.name);
            var impEntries5893 = modRecord5883.getImportsForModule(impPath5891);
            if (_5337.any(impEntries5893, function (entry5894) {
                return entry5894.forPhase === 0;
            })) {
                context5885 = invoke5499(importMod5892.term, importMod5892.record, phase5884, context5885);
            }
        });
        var // turn the module into text so we can eval it
        code5889 = (function (terms5895) {
            return codegen5336.generate(parser5338.parse(flatten5512(_5337.flatten(terms5895.map(function (term5896) {
                return term5896.destruct(context5885, {
                    stripCompileTerm: true,
                    stripModuleTerm: true
                });
            })))));
        })(modTerm5882.body);
        var global5890 = { console: console };
        // eval but with a fresh heap
        vm5353.runInNewContext(code5889, global5890);
        // update the exports with the runtime values
        modRecord5883.exportEntries.forEach(function (entry5897) {
            var // we have to get the value with the localName
            expName5898 = resolve5346(entry5897.localName, 0);
            var expVal5899 = global5890[expName5898];
            if (expVal5899) {
                context5885.bindings.add(entry5897.exportName, fresh5365(), phase5884);
                // and set it as the export name
                context5885.store.set(entry5897.exportName, phase5884, new RuntimeValue5472({ value: expVal5899 }, modRecord5883.name, phase5884));
            }
        });
    }
    return context5885;
}
function visitTerms5500(terms5900, modRecord5901, phase5902, context5903) {
    var name5904;
    var macroDefinition5905;
    var exportName5906;
    var entries5907;
    terms5900.forEach(function (term5908) {
        if ( // add the exported names to the module record
        term5908.isExportNameTerm || term5908.isExportDeclTerm || term5908.isExportDefaultTerm) {
            entries5907 = modRecord5901.addExport(term5908);
        }
        if (term5908.isExportDefaultTerm && term5908.decl.isMacroTerm || term5908.isMacroTerm) {
            var _multiTokName5909 = undefined,
                _fullName5910 = undefined,
                macBody5911 = term5908.isExportDefaultTerm ? term5908.decl.body : term5908.body;
            macroDefinition5905 = loadMacroDef5488(macBody5911, context5903, phase5902 + 1);
            if (term5908.isExportDefaultTerm) {
                _multiTokName5909 = entries5907[0].exportName;
                _fullName5910 = [entries5907[0].exportName];
            } else {
                _multiTokName5909 = makeMultiToken5367(term5908.name);
                _fullName5910 = term5908.name.token.inner;
            }
            // todo: handle implicit imports
            context5903.bindings.add(_multiTokName5909, fresh5365(), phase5902);
            context5903.store.set(_multiTokName5909, phase5902, new CompiletimeValue5471(new SyntaxTransform5344(macroDefinition5905, false, builtinMode5452, _fullName5910), phase5902, modRecord5901.name));
        }
        if (term5908.isForPhaseTerm) {
            visitTerms5500(term5908.body, modRecord5901, phase5902 + term5908.phase.token.value, context5903);
        }
        if (term5908.isOperatorDefinitionTerm) {
            var opDefinition5912 = loadMacroDef5488(term5908.body, context5903, phase5902 + 1);
            var multiTokName5909 = makeMultiToken5367(term5908.name);
            var fullName5910 = term5908.name.token.inner;
            var opObj5915 = {
                isOp: true,
                builtin: builtinMode5452,
                fullName: fullName5910
            };
            assert5354(unwrapSyntax5359(term5908.type) === "binary" || unwrapSyntax5359(term5908.type) === "unary", "operator must either be binary or unary");
            opObj5915[unwrapSyntax5359(term5908.type)] = {
                fn: opDefinition5912,
                prec: term5908.prec.token.value,
                assoc: term5908.assoc ? term5908.assoc.token.value : null
            };
            // bind in the store for the current phase
            context5903.bindings.add(multiTokName5909, fresh5365(), phase5902);
            context5903.store.set(multiTokName5909, phase5902, new CompiletimeValue5471(opObj5915, phase5902, modRecord5901.name));
        }
    });
}
function visit5501(modTerm5916, modRecord5917, phase5918, context5919) {
    if ( // don't need to visit base modules since they do not support macros
    modRecord5917.language === "base") {
        return context5919;
    }
    // reset the exports
    modRecord5917.exportEntries = [];
    // for each of the imported modules, recursively visit and
    // invoke them at the appropriate phase and then bind the
    // imported names in this module
    modRecord5917.importedModules.forEach(function (impPath5920) {
        var // load the (possibly cached) module for this import
        importMod5921 = loadImport5504(impPath5920, context5919, modRecord5917.name);
        var // grab all the import statements for that module
        impEntries5922 = modRecord5917.getImportsForModule(impPath5920);
        var uniquePhases5923 = _5337.uniq(impEntries5922.map(function (entry) {
            return entry.forPhase;
        }));
        uniquePhases5923.forEach(function (impPhase5924) {
            context5919 = visit5501(importMod5921.term, importMod5921.record, phase5918 + impPhase5924, context5919);
            if ( // don't need to invoke when importing for phase 0 (runtime)
            impPhase5924 > 0) {
                context5919 = invoke5499(importMod5921.term, importMod5921.record, phase5918 + impPhase5924, context5919);
            }
        });
        bindImportInMod5505(impEntries5922, importMod5921.term, importMod5921.record, context5919, phase5918);
    });
    // load the transformers into the store
    visitTerms5500(modTerm5916.body, modRecord5917, phase5918, context5919);
    return context5919;
}
function mapCommaSep5502(l5925, f5926) {
    return l5925.map(function (stx5927, idx5928) {
        if (idx5928 % 2 !== 0 && (!stx5927.isPunctuator() || stx5927.token.value !== ",")) {
            throwSyntaxError5356("import", "expecting a comma separated list", stx5927);
        } else if (idx5928 % 2 !== 0) {
            return stx5927;
        } else {
            return f5926(stx5927);
        }
    });
}
function filterModuleCommaSep5503(stx5929) {
    return stx5929.filter(function (stx5930, idx5931) {
        if (idx5931 % 2 !== 0 && (!stx5930.isPunctuator() || stx5930.token.value !== ",")) {
            throwSyntaxError5356("import", "expecting a comma separated list", stx5930);
        } else if (idx5931 % 2 !== 0) {
            return false;
        } else {
            return true;
        }
    });
}
function loadImport5504(path5932, context5933, parentPath5934) {
    var modFullPath5935 = resolvePath5495(path5932, parentPath5934);
    if (!availableModules5455.has(modFullPath5935)) {
        var // load it
        modToImport5936 = (function (mod5937) {
            if (mod5937.record.language === "base") {
                return {
                    term: mod5937,
                    record: mod5937.record
                };
            }
            var expanded5938 = expandModule5506(mod5937.term, modFullPath5935, context5933.templateMap, context5933.patternMap, mod5937.record, context5933.compileSuffix, context5933.bindings);
            return {
                term: expanded5938.mod,
                record: expanded5938.context.moduleRecord
            };
        })(loadModule5498(modFullPath5935));
        availableModules5455.set(modFullPath5935, modToImport5936);
        return modToImport5936;
    }
    return availableModules5455.get(modFullPath5935);
}
function bindImportInMod5505(impEntries5939, modTerm5940, modRecord5941, context5942, phase5943) {
    impEntries5939.forEach(function (entry5944) {
        var isBase5945 = modRecord5941.language === "base";
        var inExports5946 = _5337.find(modRecord5941.exportEntries, function (expEntry5949) {
            return unwrapSyntax5359(expEntry5949.exportName) === unwrapSyntax5359(entry5944.importName);
        });
        if (!(inExports5946 || isBase5945)) {
            throwSyntaxError5356("compile", "the imported name `" + unwrapSyntax5359(entry5944.importName) + "` was not exported from the module", entry5944.importName);
        }
        var exportName5947;
        if (inExports5946) {
            exportName5947 = inExports5946.exportName;
        } else {
            assert5354(false, "not implemented yet: missing export name");
        }
        var localName5948 = entry5944.localName;
        context5942.bindings.addForward(localName5948, exportName5947, phase5943 + entry5944.forPhase);
    });
}
// (ModuleTerm, Str, Map, Map, ModuleRecord) -> {
//     context: ExpanderContext,
//     mod: ModuleTerm
// }
function expandModule5506(mod5950, filename5951, templateMap5952, patternMap5953, moduleRecord5954, compileSuffix5955, bindings5956) {
    var // create a new expander context for this module
    context5957 = makeModuleExpanderContext5493(filename5951, templateMap5952, patternMap5953, 0, moduleRecord5954, compileSuffix5955, bindings5956);
    return {
        context: context5957,
        mod: expandTermTreeToFinal5490(mod5950, context5957)
    };
}
function isCompileName5507(stx5958, context5959) {
    if (stx5958.isDelimiter()) {
        return !hasSyntaxTransform5475(stx5958.token.inner, context5959, 0);
    } else {
        return !hasSyntaxTransform5475(stx5958, context5959, 0);
    }
}
function filterCompileNames5508(stx5960, context5961) {
    assert5354(stx5960.isDelimiter(), "must be a delimter");
    var runtimeNames5962 = (function (names5964) {
        return names5964.filter(function (name5965) {
            return isCompileName5507(name5965, context5961);
        });
    })(filterModuleCommaSep5503(stx5960.token.inner));
    var newInner5963 = runtimeNames5962.reduce(function (acc5966, name5967, idx5968, orig5969) {
        acc5966.push(name5967);
        if (orig5969.length - 1 !== idx5968) {
            // don't add trailing comma
            acc5966.push(syn5339.makePunc(",", name5967));
        }
        return acc5966;
    }, []);
    return syn5339.makeDelim("{}", newInner5963, stx5960);
}
function flattenModule5509(modTerm5970, modRecord5971, context5972) {
    var // filter the imports to just the imports and names that are
    // actually available at runtime
    imports5973 = modRecord5971.getRuntimeImportEntries().filter(function (entry5977) {
        return isCompileName5507(entry5977.localName, context5972);
    });
    var exports5974 = modRecord5971.exportEntries.filter(function (entry5978) {
        return isCompileName5507(entry5978.localName, context5972);
    });
    var // filter out all of the import and export statements
    output5975 = modTerm5970.body.reduce(function (acc5979, term5980) {
        if (term5980.isExportNameTerm || term5980.isExportDeclTerm || term5980.isExportDefaultTerm || term5980.isImportTerm || term5980.isImportForPhaseTerm) {
            return acc5979;
        }
        return acc5979.concat(term5980.destruct(context5972, { stripCompileTerm: true }));
    }, []);
    output5975 = (function (output5981) {
        return output5981.map(function (stx5982) {
            var name5983 = resolve5346(stx5982, 0);
            if ( // collect the implicit imports (those imports that
            // must be included because a macro expanded to a reference
            // to an import from some other module)
            context5972.implicitImport.has(name5983)) {
                var implicit5984 = context5972.implicitImport.get(name5983);
                if ( // don't double add the import
                !_5337.find(imports5973, function (imp5985) {
                    return imp5985 === implicit5984;
                })) {
                    imports5973.push(implicit5984);
                }
            }
            return stx5982;
        });
    })(flatten5512(output5975));
    var // flatten everything
    flatImports5976 = imports5973.reduce(function (acc5986, entry5987) {
        entry5987.moduleRequest = entry5987.moduleRequest.clone();
        entry5987.moduleRequest.token.value += context5972.compileSuffix;
        return acc5986.concat(flatten5512(entry5987.toTerm().destruct(context5972).concat(syn5339.makePunc(";", entry5987.moduleRequest))));
    }, []);
    return {
        imports: imports5973.map(function (entry5988) {
            return entry5988.toTerm();
        }),
        body: flatImports5976.concat(output5975)
    };
}
function flattenImports5510(imports5989, mod5990, context5991) {
    return imports5989.reduce(function (acc5992, imp5993) {
        var modFullPath5994 = resolvePath5495(unwrapSyntax5359(imp5993.from), context5991.filename);
        if (availableModules5455.has(modFullPath5994)) {
            var modPair5995 = availableModules5455.get(modFullPath5994);
            if (modPair5995.record.language === "base") {
                return acc5992;
            }
            var flattened5996 = flattenModule5509(modPair5995.term, modPair5995.record, context5991);
            acc5992.push({
                path: modFullPath5994,
                code: flattened5996.body
            });
            acc5992 = acc5992.concat(flattenImports5510(flattened5996.imports, mod5990, context5991));
            return acc5992;
        } else {
            assert5354(false, "module was unexpectedly not available for compilation" + modFullPath5994);
        }
    }, []);
}
function compileModule5511(stx5997, options5998) {
    var fs5999 = require("fs");
    options5998 = options5998 || {};
    var filename6000 = options5998 && typeof options5998.filename !== "undefined" ? fs5999.realpathSync(options5998.filename) : "(anonymous module)";
    maxExpands5454 = Infinity;
    expandCount5453 = 0;
    var mod6001 = createModule5497(filename6000, stx5997);
    var // the template and pattern maps are global for every module
    templateMap6002 = new StringMap5341();
    var patternMap6003 = new StringMap5341();
    availableModules5455 = new StringMap5341();
    var expanded6004 = expandModule5506(mod6001.term, filename6000, templateMap6002, patternMap6003, mod6001.record, options5998.compileSuffix);
    var flattened6005 = flattenModule5509(expanded6004.mod, expanded6004.context.moduleRecord, expanded6004.context);
    var compiledModules6006 = flattenImports5510(flattened6005.imports, expanded6004.mod, expanded6004.context);
    return [{
        path: filename6000,
        code: flattened6005.body
    }].concat(compiledModules6006);
}
function flatten5512(stx6007) {
    return _5337.reduce(stx6007, function (acc6008, stx6009) {
        if (stx6009.isDelimiter()) {
            var openParen6010 = syntaxFromToken5450({
                type: parser5338.Token.Punctuator,
                value: stx6009.token.value[0],
                range: stx6009.token.startRange,
                sm_range: typeof stx6009.token.sm_startRange == "undefined" ? stx6009.token.startRange : stx6009.token.sm_startRange,
                lineNumber: stx6009.token.startLineNumber,
                sm_lineNumber: typeof stx6009.token.sm_startLineNumber == "undefined" ? stx6009.token.startLineNumber : stx6009.token.sm_startLineNumber,
                lineStart: stx6009.token.startLineStart,
                sm_lineStart: typeof stx6009.token.sm_startLineStart == "undefined" ? stx6009.token.startLineStart : stx6009.token.sm_startLineStart
            }, stx6009);
            var closeParen6011 = syntaxFromToken5450({
                type: parser5338.Token.Punctuator,
                value: stx6009.token.value[1],
                range: stx6009.token.endRange,
                sm_range: typeof stx6009.token.sm_endRange == "undefined" ? stx6009.token.endRange : stx6009.token.sm_endRange,
                lineNumber: stx6009.token.endLineNumber,
                sm_lineNumber: typeof stx6009.token.sm_endLineNumber == "undefined" ? stx6009.token.endLineNumber : stx6009.token.sm_endLineNumber,
                lineStart: stx6009.token.endLineStart,
                sm_lineStart: typeof stx6009.token.sm_endLineStart == "undefined" ? stx6009.token.endLineStart : stx6009.token.sm_endLineStart
            }, stx6009);
            if (stx6009.token.leadingComments) {
                openParen6010.token.leadingComments = stx6009.token.leadingComments;
            }
            if (stx6009.token.trailingComments) {
                openParen6010.token.trailingComments = stx6009.token.trailingComments;
            }
            acc6008.push(openParen6010);
            push5456.apply(acc6008, flatten5512(stx6009.token.inner));
            acc6008.push(closeParen6011);
            return acc6008;
        }
        stx6009.token.sm_lineNumber = typeof stx6009.token.sm_lineNumber != "undefined" ? stx6009.token.sm_lineNumber : stx6009.token.lineNumber;
        stx6009.token.sm_lineStart = typeof stx6009.token.sm_lineStart != "undefined" ? stx6009.token.sm_lineStart : stx6009.token.lineStart;
        stx6009.token.sm_range = typeof stx6009.token.sm_range != "undefined" ? stx6009.token.sm_range : stx6009.token.range;
        acc6008.push(stx6009);
        return acc6008;
    }, []);
}
exports.StringMap = StringMap5341;
exports.enforest = enforest5481;
exports.compileModule = compileModule5511;
exports.getCompiletimeValue = getCompiletimeValue5473;
exports.hasCompiletimeValue = hasCompiletimeValue5476;
exports.getSyntaxTransform = getSyntaxTransform5474;
exports.hasSyntaxTransform = hasSyntaxTransform5475;
exports.resolve = resolve5346;
exports.get_expression = get_expression5483;
exports.makeExpanderContext = makeExpanderContext5492;
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