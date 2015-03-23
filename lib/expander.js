"use strict";

var codegen5216 = require("escodegen"),
    _5217 = require("underscore"),
    parser5218 = require("./parser"),
    syn5219 = require("./syntax"),
    se5220 = require("./scopedEval"),
    StringMap5221 = require("./data/stringMap"),
    NameMap5222 = require("./data/nameMap"),
    BindingMap5223 = require("./data/bindingMap"),
    SyntaxTransform5224 = require("./data/transforms").SyntaxTransform,
    VarTransform5225 = require("./data/transforms").VarTransform,
    resolve5226 = require("./stx/resolve").resolve,
    makeImportEntries5227 = require("./mod/importEntry").makeImportEntries,
    ExportEntry5228 = require("./mod/exportEntry").ExportEntry,
    ModuleRecord5229 = require("./mod/moduleRecord").ModuleRecord,
    patternModule5230 = require("./patterns"),
    vm5231 = require("vm"),
    assert5232 = require("assert"),
    termTree5233 = require("./data/termTree");
var throwSyntaxError5234 = syn5219.throwSyntaxError;
var throwSyntaxCaseError5235 = syn5219.throwSyntaxCaseError;
var SyntaxCaseError5236 = syn5219.SyntaxCaseError;
var unwrapSyntax5237 = syn5219.unwrapSyntax;
var makeIdent5238 = syn5219.makeIdent;
var makePunc5239 = syn5219.makePunc;
var makeDelim5240 = syn5219.makeDelim;
var makeValue5241 = syn5219.makeValue;
var adjustLineContext5242 = syn5219.adjustLineContext;
var fresh5243 = syn5219.fresh;
var freshScope5244 = syn5219.freshScope;
var makeMultiToken5245 = syn5219.makeMultiToken;
var Scope5246 = syn5219.Scope;
var TermTree5247 = termTree5233.TermTree,
    EOFTerm5248 = termTree5233.EOFTerm,
    KeywordTerm5249 = termTree5233.KeywordTerm,
    PuncTerm5250 = termTree5233.PuncTerm,
    DelimiterTerm5251 = termTree5233.DelimiterTerm,
    ModuleTimeTerm5252 = termTree5233.ModuleTimeTerm,
    ModuleTerm5253 = termTree5233.ModuleTerm,
    ImportTerm5254 = termTree5233.ImportTerm,
    ImportForPhaseTerm5255 = termTree5233.ImportForPhaseTerm,
    NamedImportTerm5256 = termTree5233.NamedImportTerm,
    DefaultImportTerm5257 = termTree5233.DefaultImportTerm,
    NamespaceImportTerm5258 = termTree5233.NamespaceImportTerm,
    BindingTerm5259 = termTree5233.BindingTerm,
    QualifiedBindingTerm5260 = termTree5233.QualifiedBindingTerm,
    ExportNameTerm5261 = termTree5233.ExportNameTerm,
    ExportDefaultTerm5262 = termTree5233.ExportDefaultTerm,
    ExportDeclTerm5263 = termTree5233.ExportDeclTerm,
    CompileTimeTerm5264 = termTree5233.CompileTimeTerm,
    MacroTerm5265 = termTree5233.MacroTerm,
    ClassDeclarationTerm5266 = termTree5233.ClassDeclarationTerm,
    OperatorDefinitionTerm5267 = termTree5233.OperatorDefinitionTerm,
    ForPhaseTerm5268 = termTree5233.ForPhaseTerm,
    VariableDeclarationTerm5269 = termTree5233.VariableDeclarationTerm,
    StatementTerm5270 = termTree5233.StatementTerm,
    EmptyTerm5271 = termTree5233.EmptyTerm,
    CatchClauseTerm5272 = termTree5233.CatchClauseTerm,
    ForStatementTerm5273 = termTree5233.ForStatementTerm,
    ReturnStatementTerm5274 = termTree5233.ReturnStatementTerm,
    ExprTerm5275 = termTree5233.ExprTerm,
    UnaryOpTerm5276 = termTree5233.UnaryOpTerm,
    PostfixOpTerm5277 = termTree5233.PostfixOpTerm,
    BinOpTerm5278 = termTree5233.BinOpTerm,
    AssignmentExpressionTerm5279 = termTree5233.AssignmentExpressionTerm,
    ConditionalExpressionTerm5280 = termTree5233.ConditionalExpressionTerm,
    NamedFunTerm5281 = termTree5233.NamedFunTerm,
    AnonFunTerm5282 = termTree5233.AnonFunTerm,
    ArrowFunTerm5283 = termTree5233.ArrowFunTerm,
    ObjDotGetTerm5284 = termTree5233.ObjDotGetTerm,
    ObjGetTerm5285 = termTree5233.ObjGetTerm,
    TemplateTerm5286 = termTree5233.TemplateTerm,
    CallTerm5287 = termTree5233.CallTerm,
    QuoteSyntaxTerm5288 = termTree5233.QuoteSyntaxTerm,
    StopQuotedTerm5289 = termTree5233.StopQuotedTerm,
    PrimaryExpressionTerm5290 = termTree5233.PrimaryExpressionTerm,
    ThisExpressionTerm5291 = termTree5233.ThisExpressionTerm,
    LitTerm5292 = termTree5233.LitTerm,
    BlockTerm5293 = termTree5233.BlockTerm,
    ArrayLiteralTerm5294 = termTree5233.ArrayLiteralTerm,
    IdTerm5295 = termTree5233.IdTerm,
    PartialTerm5296 = termTree5233.PartialTerm,
    PartialOperationTerm5297 = termTree5233.PartialOperationTerm,
    PartialExpressionTerm5298 = termTree5233.PartialExpressionTerm,
    BindingStatementTerm5299 = termTree5233.BindingStatementTerm,
    VariableStatementTerm5300 = termTree5233.VariableStatementTerm,
    LetStatementTerm5301 = termTree5233.LetStatementTerm,
    ConstStatementTerm5302 = termTree5233.ConstStatementTerm,
    ParenExpressionTerm5303 = termTree5233.ParenExpressionTerm;
var scopedEval5327 = se5220.scopedEval;
var syntaxFromToken5328 = syn5219.syntaxFromToken;
var joinSyntax5329 = syn5219.joinSyntax;
var builtinMode5330 = false;
var expandCount5331 = 0;
var maxExpands5332;
var availableModules5333;
var push5334 = Array.prototype.push;
function getParamIdentifiers5335(argSyntax5386) {
    if (argSyntax5386.isDelimiter()) {
        return _5217.filter(argSyntax5386.token.inner, function (stx5387) {
            return stx5387.token.value !== ",";
        });
    } else if (argSyntax5386.isIdentifier()) {
        return [argSyntax5386];
    } else {
        assert5232(false, "expecting a delimiter or a single identifier for function parameters");
    }
}
function stxIsUnaryOp5336(stx5388) {
    var staticOperators5389 = ["+", "-", "~", "!", "delete", "void", "typeof", "yield", "new", "++", "--"];
    return _5217.contains(staticOperators5389, unwrapSyntax5237(stx5388));
}
function stxIsBinOp5337(stx5390) {
    var staticOperators5391 = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "<<", ">>", ">>>"];
    return _5217.contains(staticOperators5391, unwrapSyntax5237(stx5390));
}
function getUnaryOpPrec5338(op5392) {
    var operatorPrecedence5393 = {
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
    return operatorPrecedence5393[op5392];
}
function getBinaryOpPrec5339(op5394) {
    var operatorPrecedence5395 = {
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
    return operatorPrecedence5395[op5394];
}
function getBinaryOpAssoc5340(op5396) {
    var operatorAssoc5397 = {
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
    return operatorAssoc5397[op5396];
}
function stxIsAssignOp5341(stx5398) {
    var staticOperators5399 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
    return _5217.contains(staticOperators5399, unwrapSyntax5237(stx5398));
}
function enforestImportClause5342(stx5400) {
    if (stx5400[0] && stx5400[0].isDelimiter()) {
        return {
            result: NamedImportTerm5256.create(stx5400[0]),
            rest: stx5400.slice(1)
        };
    } else if (stx5400[0] && stx5400[0].isPunctuator() && unwrapSyntax5237(stx5400[0]) === "*" && stx5400[1] && unwrapSyntax5237(stx5400[1]) === "as" && stx5400[2]) {
        return {
            result: NamespaceImportTerm5258.create(stx5400[0], stx5400[1], stx5400[2]),
            rest: stx5400.slice(3)
        };
    } else {
        return {
            result: DefaultImportTerm5257.create(stx5400[0]),
            rest: stx5400.slice(1)
        };
    }
}
function enforestImportClauseList5343(stx5401) {
    var res5402 = [];
    var clause5403 = enforestImportClause5342(stx5401);
    var rest5404 = clause5403.rest;
    res5402.push(clause5403.result);
    if (rest5404[0] && rest5404[0].isPunctuator() && unwrapSyntax5237(rest5404[0]) === ",") {
        res5402.push(rest5404[0]);
        clause5403 = enforestImportClause5342(rest5404.slice(1));
        res5402.push(clause5403.result);
        rest5404 = clause5403.rest;
    }
    return {
        result: res5402,
        rest: rest5404
    };
}
function enforestImport5344(head5405, rest5406) {
    assert5232(unwrapSyntax5237(head5405) === "import", "only call for imports");
    var clause5407 = enforestImportClauseList5343(rest5406);
    var importRest5408;
    rest5406 = clause5407.rest;
    if (rest5406[0] && unwrapSyntax5237(rest5406[0]) === "from" && rest5406[1] && rest5406[1].isStringLiteral() && rest5406[2] && unwrapSyntax5237(rest5406[2]) === "for" && rest5406[3] && unwrapSyntax5237(rest5406[3]) === "phase" && rest5406[4] && rest5406[4].isNumericLiteral()) {
        if (rest5406[5] && rest5406[5].isPunctuator() && rest5406[5].token.value === ";") {
            importRest5408 = rest5406.slice(6);
        } else {
            importRest5408 = rest5406.slice(5);
        }
        return {
            result: ImportForPhaseTerm5255.create(head5405, clause5407.result, rest5406[0], rest5406[1], rest5406[2], rest5406[3], rest5406[4]),
            rest: importRest5408
        };
    } else if (rest5406[0] && unwrapSyntax5237(rest5406[0]) === "from" && rest5406[1] && rest5406[1].isStringLiteral()) {
        if (rest5406[2] && rest5406[2].isPunctuator() && rest5406[2].token.value === ";") {
            importRest5408 = rest5406.slice(3);
        } else {
            importRest5408 = rest5406.slice(2);
        }
        return {
            result: ImportTerm5254.create(head5405, clause5407.result, rest5406[0], rest5406[1]),
            rest: importRest5408
        };
    } else {
        throwSyntaxError5234("enforest", "unrecognized import syntax", rest5406);
    }
}
function enforestVarStatement5345(stx5409, context5410, varStx5411) {
    var decls5412 = [];
    var rest5413 = stx5409;
    var rhs5414;
    if (!rest5413.length) {
        throwSyntaxError5234("enforest", "Unexpected end of input", varStx5411);
    }
    if (expandCount5331 >= maxExpands5332) {
        return null;
    }
    while (rest5413.length) {
        if (rest5413[0].isIdentifier()) {
            if (rest5413[1] && rest5413[1].isPunctuator() && rest5413[1].token.value === "=") {
                rhs5414 = get_expression5360(rest5413.slice(2), context5410);
                if (rhs5414.result == null) {
                    throwSyntaxError5234("enforest", "Unexpected token", rhs5414.rest[0]);
                }
                if (rhs5414.rest[0] && rhs5414.rest[0].isPunctuator() && rhs5414.rest[0].token.value === ",") {
                    decls5412.push(VariableDeclarationTerm5269.create(rest5413[0], rest5413[1], rhs5414.result, rhs5414.rest[0]));
                    rest5413 = rhs5414.rest.slice(1);
                    continue;
                } else {
                    decls5412.push(VariableDeclarationTerm5269.create(rest5413[0], rest5413[1], rhs5414.result, null));
                    rest5413 = rhs5414.rest;
                    break;
                }
            } else if (rest5413[1] && rest5413[1].isPunctuator() && rest5413[1].token.value === ",") {
                decls5412.push(VariableDeclarationTerm5269.create(rest5413[0], null, null, rest5413[1]));
                rest5413 = rest5413.slice(2);
            } else {
                decls5412.push(VariableDeclarationTerm5269.create(rest5413[0], null, null, null));
                rest5413 = rest5413.slice(1);
                break;
            }
        } else {
            throwSyntaxError5234("enforest", "Unexpected token", rest5413[0]);
        }
    }
    return {
        result: decls5412,
        rest: rest5413
    };
}
function enforestAssignment5346(stx5415, context5416, left5417, prevStx5418, prevTerms5419) {
    var op5420 = stx5415[0];
    var rightStx5421 = stx5415.slice(1);
    var opTerm5422 = PuncTerm5250.create(stx5415[0]);
    var opPrevStx5423 = tagWithTerm5361(opTerm5422, [stx5415[0]]).concat(tagWithTerm5361(left5417, left5417.destruct(context5416).reverse()), prevStx5418);
    var opPrevTerms5424 = [opTerm5422, left5417].concat(prevTerms5419);
    var opRes5425 = enforest5358(rightStx5421, context5416, opPrevStx5423, opPrevTerms5424);
    if (opRes5425.result) {
        if ( // Lookbehind was matched, so it may not even be a binop anymore.
        opRes5425.prevTerms.length < opPrevTerms5424.length) {
            return opRes5425;
        }
        var right5426 = opRes5425.result;
        if ( // only a binop if the right is a real expression
        // so 2+2++ will only match 2+2
        right5426.isExprTerm) {
            var term5427 = AssignmentExpressionTerm5279.create(left5417, op5420, right5426);
            return {
                result: term5427,
                rest: opRes5425.rest,
                prevStx: prevStx5418,
                prevTerms: prevTerms5419
            };
        }
    } else {
        return opRes5425;
    }
}
function enforestParenExpression5347(parens5428, context5429) {
    var argRes5430,
        enforestedArgs5431 = [],
        commas5432 = [];
    var innerTokens5433 = parens5428.token.inner;
    while (innerTokens5433.length > 0) {
        argRes5430 = enforest5358(innerTokens5433, context5429);
        if (!argRes5430.result || !argRes5430.result.isExprTerm) {
            return null;
        }
        enforestedArgs5431.push(argRes5430.result);
        innerTokens5433 = argRes5430.rest;
        if (innerTokens5433[0] && innerTokens5433[0].token.value === ",") {
            // record the comma for later
            commas5432.push(innerTokens5433[0]);
            // but dump it for the next loop turn
            innerTokens5433 = innerTokens5433.slice(1);
        } else {
            // either there are no more tokens or
            // they aren't a comma, either way we
            // are done with the loop
            break;
        }
    }
    return innerTokens5433.length ? null : ParenExpressionTerm5303.create(enforestedArgs5431, parens5428, commas5432);
}
function CompiletimeValue5348(trans5434, module5435, phase5436) {
    this.trans = trans5434;
    this.module = module5435;
    this.phase = phase5436;
}
function RuntimeValue5349(trans5437, module5438, phase5439) {
    this.trans = trans5437;
    this.module = module5438;
    this.phase = phase5439;
}
function getCompiletimeValue5350(stx5440, context5441, phase5442) {
    var store5443,
        env5444 = context5441.env.get(stx5440, phase5442);
    if (env5444 !== null) {
        return env5444.trans;
    } else {
        store5443 = context5441.store.get(stx5440, phase5442);
        return store5443 !== null ? store5443.trans : null;
    }
}
function getSyntaxTransform5351(stx5445, context5446, phase5447) {
    var t5448 = getCompiletimeValue5350(stx5445, context5446, phase5447);
    if (t5448 && t5448 instanceof VarTransform5225) {
        return null;
    }
    return t5448;
}
function getVarTransform5352(stx5449, context5450, phase5451) {
    var t5452 = getCompiletimeValue5350(stx5449, context5450, phase5451);
    if (t5452 && t5452 instanceof VarTransform5225) {
        return t5452;
    }
    return null;
}
function hasSyntaxTransform5353(stx5453, context5454, phase5455) {
    return getSyntaxTransform5351(stx5453, context5454, phase5455) !== null;
}
function hasVarTransform5354(stx5456, context5457, phase5458) {
    return getVarTransform5352(stx5456, context5457, phase5458) !== null;
}
function hasCompiletimeValue5355(stx5459, context5460, phase5461) {
    return context5460.env.has(stx5459, phase5461) || context5460.store.has(stx5459, phase5461);
}
function expandMacro5356(stx5462, context5463, opCtx5464, opType5465, macroObj5466) {
    var // pull the macro transformer out the environment
    head5467 = stx5462[0];
    var rest5468 = stx5462.slice(1);
    macroObj5466 = macroObj5466 || getSyntaxTransform5351(stx5462, context5463, context5463.phase);
    var stxArg5469 = rest5468.slice(macroObj5466.fullName.length - 1);
    var transformer5470;
    if (opType5465 != null) {
        assert5232(opType5465 === "binary" || opType5465 === "unary", "operator type should be either unary or binary: " + opType5465);
        transformer5470 = macroObj5466[opType5465].fn;
    } else {
        transformer5470 = macroObj5466.fn;
    }
    assert5232(typeof transformer5470 === "function", "Macro transformer not bound for: " + head5467.token.value);
    var transformerContext5471 = makeExpanderContext5369(_5217.defaults({ mark: freshScope5244(context5463.bindings) }, context5463));
    // apply the transformer
    var rt5472;
    try {
        rt5472 = transformer5470([head5467].concat(stxArg5469), transformerContext5471, opCtx5464.prevStx, opCtx5464.prevTerms);
    } catch (e5473) {
        if (e5473 instanceof SyntaxCaseError5236) {
            var // add a nicer error for syntax case
            nameStr5474 = macroObj5466.fullName.map(function (stx5475) {
                return stx5475.token.value;
            }).join("");
            if (opType5465 != null) {
                var argumentString5476 = "`" + stxArg5469.slice(0, 5).map(function (stx5477) {
                    return stx5477.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5234("operator", "Operator `" + nameStr5474 + "` could not be matched with " + argumentString5476, head5467);
            } else {
                var argumentString5476 = "`" + stxArg5469.slice(0, 5).map(function (stx5479) {
                    return stx5479.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5234("macro", "Macro `" + nameStr5474 + "` could not be matched with " + argumentString5476, head5467);
            }
        } else {
            // just rethrow it
            throw e5473;
        }
    }
    if (!builtinMode5330 && !macroObj5466.builtin) {
        expandCount5331++;
    }
    if (!Array.isArray(rt5472.result)) {
        throwSyntaxError5234("enforest", "Macro must return a syntax array", stx5462[0]);
    }
    if (rt5472.result.length > 0) {
        var adjustedResult5480 = adjustLineContext5242(rt5472.result, head5467);
        if (stx5462[0].token.leadingComments) {
            if (adjustedResult5480[0].token.leadingComments) {
                adjustedResult5480[0].token.leadingComments = adjustedResult5480[0].token.leadingComments.concat(head5467.token.leadingComments);
            } else {
                adjustedResult5480[0].token.leadingComments = head5467.token.leadingComments;
            }
        }
        rt5472.result = adjustedResult5480;
    }
    return rt5472;
}
function comparePrec5357(left5481, right5482, assoc5483) {
    if (assoc5483 === "left") {
        return left5481 <= right5482;
    }
    return left5481 < right5482;
}
function enforest5358(toks5484, context5485, prevStx5486, prevTerms5487) {
    assert5232(toks5484.length > 0, "enforest assumes there are tokens to work with");
    prevStx5486 = prevStx5486 || [];
    prevTerms5487 = prevTerms5487 || [];
    if (expandCount5331 >= maxExpands5332) {
        return {
            result: null,
            rest: toks5484
        };
    }
    function step5488(head5489, rest5490, opCtx5491) {
        var innerTokens5492;
        assert5232(Array.isArray(rest5490), "result must at least be an empty array");
        if (head5489.isTermTree) {
            var isCustomOp5494 = false;
            var uopMacroObj5495;
            var uopSyntax5496;
            if (head5489.isPuncTerm || head5489.isKeywordTerm || head5489.isIdTerm) {
                if (head5489.isPuncTerm) {
                    uopSyntax5496 = head5489.punc;
                } else if (head5489.isKeywordTerm) {
                    uopSyntax5496 = head5489.keyword;
                } else if (head5489.isIdTerm) {
                    uopSyntax5496 = head5489.id;
                }
                uopMacroObj5495 = getSyntaxTransform5351([uopSyntax5496].concat(rest5490), context5485, context5485.phase);
                isCustomOp5494 = uopMacroObj5495 && uopMacroObj5495.isOp;
            }
            // look up once (we want to check multiple properties on bopMacroObj
            // without repeatedly calling getValueInEnv)
            var bopMacroObj5497;
            if (rest5490[0] && rest5490[1]) {
                bopMacroObj5497 = getSyntaxTransform5351(rest5490, context5485, context5485.phase);
            }
            if ( // unary operator
            isCustomOp5494 && uopMacroObj5495.unary || uopSyntax5496 && stxIsUnaryOp5336(uopSyntax5496)) {
                var uopPrec5498;
                if (isCustomOp5494 && uopMacroObj5495.unary) {
                    uopPrec5498 = uopMacroObj5495.unary.prec;
                } else {
                    uopPrec5498 = getUnaryOpPrec5338(unwrapSyntax5237(uopSyntax5496));
                }
                var opRest5499 = rest5490;
                var uopMacroName5500;
                if (uopMacroObj5495) {
                    uopMacroName5500 = [uopSyntax5496].concat(rest5490.slice(0, uopMacroObj5495.fullName.length - 1));
                    opRest5499 = rest5490.slice(uopMacroObj5495.fullName.length - 1);
                }
                var leftLeft5501 = opCtx5491.prevTerms[0] && opCtx5491.prevTerms[0].isPartialTerm ? opCtx5491.prevTerms[0] : null;
                var unopTerm5502 = PartialOperationTerm5297.create(head5489, leftLeft5501);
                var unopPrevStx5503 = tagWithTerm5361(unopTerm5502, head5489.destruct(context5485).reverse()).concat(opCtx5491.prevStx);
                var unopPrevTerms5504 = [unopTerm5502].concat(opCtx5491.prevTerms);
                var unopOpCtx5505 = _5217.extend({}, opCtx5491, {
                    combine: function combine(t5506) {
                        if (t5506.isExprTerm) {
                            if (isCustomOp5494 && uopMacroObj5495.unary) {
                                var rt5507 = expandMacro5356(uopMacroName5500.concat(t5506.destruct(context5485)), context5485, opCtx5491, "unary");
                                var newt5508 = get_expression5360(rt5507.result, context5485);
                                assert5232(newt5508.rest.length === 0, "should never have left over syntax");
                                return opCtx5491.combine(newt5508.result);
                            }
                            return opCtx5491.combine(UnaryOpTerm5276.create(uopSyntax5496, t5506));
                        } else {
                            // not actually an expression so don't create
                            // a UnaryOp term just return with the punctuator
                            return opCtx5491.combine(head5489);
                        }
                    },
                    prec: uopPrec5498,
                    prevStx: unopPrevStx5503,
                    prevTerms: unopPrevTerms5504,
                    op: unopTerm5502
                });
                return step5488(opRest5499[0], opRest5499.slice(1), unopOpCtx5505);
            } else if (head5489.isExprTerm && (rest5490[0] && rest5490[1] && (stxIsBinOp5337(rest5490[0]) && !bopMacroObj5497 || bopMacroObj5497 && bopMacroObj5497.isOp && bopMacroObj5497.binary))) {
                var opRes5509;
                var op5510 = rest5490[0];
                var left5511 = head5489;
                var rightStx5512 = rest5490.slice(1);
                var leftLeft5501 = opCtx5491.prevTerms[0] && opCtx5491.prevTerms[0].isPartialTerm ? opCtx5491.prevTerms[0] : null;
                var leftTerm5514 = PartialExpressionTerm5298.create(head5489.destruct(context5485), leftLeft5501, function () {
                    return step5488(head5489, [], opCtx5491);
                });
                var opTerm5515 = PartialOperationTerm5297.create(op5510, leftTerm5514);
                var opPrevStx5516 = tagWithTerm5361(opTerm5515, [rest5490[0]]).concat(tagWithTerm5361(leftTerm5514, head5489.destruct(context5485)).reverse(), opCtx5491.prevStx);
                var opPrevTerms5517 = [opTerm5515, leftTerm5514].concat(opCtx5491.prevTerms);
                var isCustomOp5494 = bopMacroObj5497 && bopMacroObj5497.isOp && bopMacroObj5497.binary;
                var bopPrec5519;
                var bopAssoc5520;
                if (isCustomOp5494 && bopMacroObj5497.binary) {
                    bopPrec5519 = bopMacroObj5497.binary.prec;
                    bopAssoc5520 = bopMacroObj5497.binary.assoc;
                } else {
                    bopPrec5519 = getBinaryOpPrec5339(unwrapSyntax5237(op5510));
                    bopAssoc5520 = getBinaryOpAssoc5340(unwrapSyntax5237(op5510));
                }
                assert5232(bopPrec5519 !== undefined, "expecting a precedence for operator: " + op5510);
                var newStack5521;
                if (comparePrec5357(bopPrec5519, opCtx5491.prec, bopAssoc5520)) {
                    var bopCtx5525 = opCtx5491;
                    var combResult5493 = opCtx5491.combine(head5489);
                    if (opCtx5491.stack.length > 0) {
                        return step5488(combResult5493.term, rest5490, opCtx5491.stack[0]);
                    }
                    left5511 = combResult5493.term;
                    newStack5521 = opCtx5491.stack;
                    opPrevStx5516 = combResult5493.prevStx;
                    opPrevTerms5517 = combResult5493.prevTerms;
                } else {
                    newStack5521 = [opCtx5491].concat(opCtx5491.stack);
                }
                assert5232(opCtx5491.combine !== undefined, "expecting a combine function");
                var opRightStx5522 = rightStx5512;
                var bopMacroName5523;
                if (isCustomOp5494) {
                    bopMacroName5523 = rest5490.slice(0, bopMacroObj5497.fullName.length);
                    opRightStx5522 = rightStx5512.slice(bopMacroObj5497.fullName.length - 1);
                }
                var bopOpCtx5524 = _5217.extend({}, opCtx5491, {
                    combine: function combine(right5527) {
                        if (right5527.isExprTerm) {
                            if (isCustomOp5494 && bopMacroObj5497.binary) {
                                var leftStx5528 = left5511.destruct(context5485);
                                var rightStx5529 = right5527.destruct(context5485);
                                var rt5530 = expandMacro5356(bopMacroName5523.concat(syn5219.makeDelim("()", leftStx5528, leftStx5528[0]), syn5219.makeDelim("()", rightStx5529, rightStx5529[0])), context5485, opCtx5491, "binary");
                                var newt5531 = get_expression5360(rt5530.result, context5485);
                                assert5232(newt5531.rest.length === 0, "should never have left over syntax");
                                return {
                                    term: newt5531.result,
                                    prevStx: opPrevStx5516,
                                    prevTerms: opPrevTerms5517
                                };
                            }
                            return {
                                term: BinOpTerm5278.create(left5511, op5510, right5527),
                                prevStx: opPrevStx5516,
                                prevTerms: opPrevTerms5517
                            };
                        } else {
                            return {
                                term: head5489,
                                prevStx: opPrevStx5516,
                                prevTerms: opPrevTerms5517
                            };
                        }
                    },
                    prec: bopPrec5519,
                    op: opTerm5515,
                    stack: newStack5521,
                    prevStx: opPrevStx5516,
                    prevTerms: opPrevTerms5517
                });
                return step5488(opRightStx5522[0], opRightStx5522.slice(1), bopOpCtx5524);
            } else if (head5489.isExprTerm && (rest5490[0] && rest5490[0].isDelimiter() && rest5490[0].token.value === "()")) {
                var parenRes5532 = enforestParenExpression5347(rest5490[0], context5485);
                if (parenRes5532) {
                    return step5488(CallTerm5287.create(head5489, parenRes5532), rest5490.slice(1), opCtx5491);
                }
            } else if (head5489.isExprTerm && (rest5490[0] && resolve5226(rest5490[0], context5485.phase) === "?")) {
                var question5533 = rest5490[0];
                var condRes5534 = enforest5358(rest5490.slice(1), context5485);
                if (condRes5534.result) {
                    var truExpr5535 = condRes5534.result;
                    var condRight5536 = condRes5534.rest;
                    if (truExpr5535.isExprTerm && condRight5536[0] && resolve5226(condRight5536[0], context5485.phase) === ":") {
                        var colon5537 = condRight5536[0];
                        var flsRes5538 = enforest5358(condRight5536.slice(1), context5485);
                        var flsExpr5539 = flsRes5538.result;
                        if (flsExpr5539.isExprTerm) {
                            if ( // operators are combined before the ternary
                            opCtx5491.prec >= 4) {
                                var // ternary is like a operator with prec 4
                                headResult5540 = opCtx5491.combine(head5489);
                                var condTerm5541 = ConditionalExpressionTerm5280.create(headResult5540.term, question5533, truExpr5535, colon5537, flsExpr5539);
                                if (opCtx5491.stack.length > 0) {
                                    return step5488(condTerm5541, flsRes5538.rest, opCtx5491.stack[0]);
                                } else {
                                    return {
                                        result: condTerm5541,
                                        rest: flsRes5538.rest,
                                        prevStx: headResult5540.prevStx,
                                        prevTerms: headResult5540.prevTerms
                                    };
                                }
                            } else {
                                var condTerm5541 = ConditionalExpressionTerm5280.create(head5489, question5533, truExpr5535, colon5537, flsExpr5539);
                                return step5488(condTerm5541, flsRes5538.rest, opCtx5491);
                            }
                        }
                    }
                }
            } else if (head5489.isDelimiterTerm && head5489.delim.token.value === "()" && rest5490[0] && rest5490[0].isPunctuator() && resolve5226(rest5490[0], context5485.phase) === "=>") {
                var arrowRes5543 = enforest5358(rest5490.slice(1), context5485);
                if (arrowRes5543.result && arrowRes5543.result.isExprTerm) {
                    return step5488(ArrowFunTerm5283.create(head5489.delim, rest5490[0], arrowRes5543.result.destruct(context5485)), arrowRes5543.rest, opCtx5491);
                } else {
                    throwSyntaxError5234("enforest", "Body of arrow function must be an expression", rest5490.slice(1));
                }
            } else if (head5489.isIdTerm && rest5490[0] && rest5490[0].isPunctuator() && resolve5226(rest5490[0], context5485.phase) === "=>") {
                var res5544 = enforest5358(rest5490.slice(1), context5485);
                if (res5544.result && res5544.result.isExprTerm) {
                    return step5488(ArrowFunTerm5283.create(head5489.id, rest5490[0], res5544.result.destruct(context5485)), res5544.rest, opCtx5491);
                } else {
                    throwSyntaxError5234("enforest", "Body of arrow function must be an expression", rest5490.slice(1));
                }
            } else if (head5489.isDelimiterTerm && head5489.delim.token.value === "()") {
                if ( // empty parens are acceptable but enforest
                // doesn't accept empty arrays so short
                // circuit here
                head5489.delim.token.inner.length === 0) {
                    return step5488(ParenExpressionTerm5303.create([EmptyTerm5271.create()], head5489.delim, []), rest5490, opCtx5491);
                } else {
                    var parenRes5532 = enforestParenExpression5347(head5489.delim, context5485);
                    if (parenRes5532) {
                        return step5488(parenRes5532, rest5490, opCtx5491);
                    }
                }
            } else if (head5489.isExprTerm && ((head5489.isIdTerm || head5489.isObjGetTerm || head5489.isObjDotGetTerm || head5489.isThisExpressionTerm) && rest5490[0] && rest5490[1] && !bopMacroObj5497 && stxIsAssignOp5341(rest5490[0]))) {
                var opRes5509 = enforestAssignment5346(rest5490, context5485, head5489, prevStx5486, prevTerms5487);
                if (opRes5509 && opRes5509.result) {
                    return step5488(opRes5509.result, opRes5509.rest, _5217.extend({}, opCtx5491, {
                        prevStx: opRes5509.prevStx,
                        prevTerms: opRes5509.prevTerms
                    }));
                }
            } else if (head5489.isExprTerm && (rest5490[0] && (unwrapSyntax5237(rest5490[0]) === "++" || unwrapSyntax5237(rest5490[0]) === "--"))) {
                if ( // Check if the operator is a macro first.
                hasSyntaxTransform5353(rest5490[0], context5485, context5485.phase)) {
                    var headStx5547 = tagWithTerm5361(head5489, head5489.destruct(context5485).reverse());
                    var opPrevStx5516 = headStx5547.concat(prevStx5486);
                    var opPrevTerms5517 = [head5489].concat(prevTerms5487);
                    var opRes5509 = enforest5358(rest5490, context5485, opPrevStx5516, opPrevTerms5517);
                    if (opRes5509.prevTerms.length < opPrevTerms5517.length) {
                        return opRes5509;
                    } else if (opRes5509.result) {
                        return step5488(head5489, opRes5509.result.destruct(context5485).concat(opRes5509.rest), opCtx5491);
                    }
                }
                return step5488(PostfixOpTerm5277.create(head5489, rest5490[0]), rest5490.slice(1), opCtx5491);
            } else if (head5489.isExprTerm && (rest5490[0] && rest5490[0].token.value === "[]")) {
                return step5488(ObjGetTerm5285.create(head5489, DelimiterTerm5251.create(rest5490[0])), rest5490.slice(1), opCtx5491);
            } else if (head5489.isExprTerm && (rest5490[0] && unwrapSyntax5237(rest5490[0]) === "." && !hasSyntaxTransform5353(rest5490[0], context5485, context5485.phase) && rest5490[1] && (rest5490[1].isIdentifier() || rest5490[1].isKeyword()))) {
                if ( // Check if the identifier is a macro first.
                hasSyntaxTransform5353(rest5490[1], context5485, context5485.phase)) {
                    var headStx5547 = tagWithTerm5361(head5489, head5489.destruct(context5485).reverse());
                    var dotTerm5552 = PuncTerm5250.create(rest5490[0]);
                    var dotTerms5553 = [dotTerm5552].concat(head5489, prevTerms5487);
                    var dotStx5554 = tagWithTerm5361(dotTerm5552, [rest5490[0]]).concat(headStx5547, prevStx5486);
                    var dotRes5555 = enforest5358(rest5490.slice(1), context5485, dotStx5554, dotTerms5553);
                    if (dotRes5555.prevTerms.length < dotTerms5553.length) {
                        return dotRes5555;
                    } else if (dotRes5555.result) {
                        return step5488(head5489, [rest5490[0]].concat(dotRes5555.result.destruct(context5485), dotRes5555.rest), opCtx5491);
                    }
                }
                return step5488(ObjDotGetTerm5284.create(head5489, rest5490[0], rest5490[1]), rest5490.slice(2), opCtx5491);
            } else if (head5489.isDelimiterTerm && head5489.delim.token.value === "[]") {
                return step5488(ArrayLiteralTerm5294.create(head5489), rest5490, opCtx5491);
            } else if (head5489.isDelimiterTerm && head5489.delim.token.value === "{}") {
                return step5488(BlockTerm5293.create(head5489), rest5490, opCtx5491);
            } else if (head5489.isIdTerm && unwrapSyntax5237(head5489.id) === "#quoteSyntax" && rest5490[0] && rest5490[0].token.value === "{}") {
                return step5488(QuoteSyntaxTerm5288.create(rest5490[0]), rest5490.slice(1), opCtx5491);
            } else if (head5489.isKeywordTerm && unwrapSyntax5237(head5489.keyword) === "return") {
                if (rest5490[0] && rest5490[0].token.lineNumber === head5489.keyword.token.lineNumber) {
                    var returnPrevStx5556 = tagWithTerm5361(head5489, head5489.destruct(context5485)).concat(opCtx5491.prevStx);
                    var returnPrevTerms5557 = [head5489].concat(opCtx5491.prevTerms);
                    var returnExpr5558 = enforest5358(rest5490, context5485, returnPrevStx5556, returnPrevTerms5557);
                    if (returnExpr5558.prevTerms.length < opCtx5491.prevTerms.length) {
                        return returnExpr5558;
                    }
                    if (returnExpr5558.result.isExprTerm) {
                        return step5488(ReturnStatementTerm5274.create(head5489, returnExpr5558.result), returnExpr5558.rest, opCtx5491);
                    }
                } else {
                    return step5488(ReturnStatementTerm5274.create(head5489, EmptyTerm5271.create()), rest5490, opCtx5491);
                }
            } else if (head5489.isKeywordTerm && unwrapSyntax5237(head5489.keyword) === "let") {
                var normalizedName5559;
                if (rest5490[0] && rest5490[0].isDelimiter() && rest5490[0].token.value === "()") {
                    normalizedName5559 = rest5490[0];
                } else {
                    normalizedName5559 = syn5219.makeDelim("()", [rest5490[0]], rest5490[0]);
                }
                var lsRes5560 = enforestVarStatement5345(rest5490, context5485, head5489.keyword);
                if (lsRes5560 && lsRes5560.result) {
                    return step5488(LetStatementTerm5301.create(head5489, lsRes5560.result), lsRes5560.rest, opCtx5491);
                }
            } else if (head5489.isKeywordTerm && unwrapSyntax5237(head5489.keyword) === "var" && rest5490[0]) {
                var vsRes5561 = enforestVarStatement5345(rest5490, context5485, head5489.keyword);
                if (vsRes5561 && vsRes5561.result) {
                    return step5488(VariableStatementTerm5300.create(head5489, vsRes5561.result), vsRes5561.rest, opCtx5491);
                }
            } else if (head5489.isKeywordTerm && unwrapSyntax5237(head5489.keyword) === "const" && rest5490[0]) {
                var csRes5562 = enforestVarStatement5345(rest5490, context5485, head5489.keyword);
                if (csRes5562 && csRes5562.result) {
                    return step5488(ConstStatementTerm5302.create(head5489, csRes5562.result), csRes5562.rest, opCtx5491);
                }
            } else if (head5489.isKeywordTerm && unwrapSyntax5237(head5489.keyword) === "for" && rest5490[0] && rest5490[0].token.value === "()") {
                return step5488(ForStatementTerm5273.create(head5489.keyword, rest5490[0]), rest5490.slice(1), opCtx5491);
            }
        } else {
            assert5232(head5489 && head5489.token, "assuming head is a syntax object");
            var macroObj5563 = expandCount5331 < maxExpands5332 && getSyntaxTransform5351([head5489].concat(rest5490), context5485, context5485.phase);
            if (head5489 && context5485.stopMap.has(resolve5226(head5489, context5485.phase))) {
                return step5488(StopQuotedTerm5289.create(head5489, rest5490[0]), rest5490.slice(1), opCtx5491);
            } else if (macroObj5563 && typeof macroObj5563.fn === "function" && !macroObj5563.isOp) {
                var rt5564 = expandMacro5356([head5489].concat(rest5490), context5485, opCtx5491, null, macroObj5563);
                var newOpCtx5565 = opCtx5491;
                if (rt5564.prevTerms && rt5564.prevTerms.length < opCtx5491.prevTerms.length) {
                    newOpCtx5565 = rewindOpCtx5359(opCtx5491, rt5564);
                }
                if (rt5564.result.length > 0) {
                    return step5488(rt5564.result[0], rt5564.result.slice(1).concat(rt5564.rest), newOpCtx5565);
                } else {
                    return step5488(EmptyTerm5271.create(), rt5564.rest, newOpCtx5565);
                }
            } else if (head5489.isIdentifier() && unwrapSyntax5237(head5489) === "stxrec" && resolve5226(head5489, context5485.phase) === "stxrec") {
                var normalizedName5559;
                if (rest5490[0] && rest5490[0].isDelimiter() && rest5490[0].token.value === "()") {
                    normalizedName5559 = rest5490[0];
                } else {
                    normalizedName5559 = syn5219.makeDelim("()", [rest5490[0]], rest5490[0]);
                }
                if (rest5490[1] && rest5490[1].isDelimiter()) {
                    return step5488(MacroTerm5265.create(normalizedName5559, rest5490[1].token.inner), rest5490.slice(2), opCtx5491);
                } else {
                    throwSyntaxError5234("enforest", "Macro declaration must include body", rest5490[1]);
                }
            } else if (head5489.isIdentifier() && head5489.token.value === "unaryop" && rest5490[0] && rest5490[0].isDelimiter() && rest5490[0].token.value === "()" && rest5490[1] && rest5490[1].isNumericLiteral() && rest5490[2] && rest5490[2].isDelimiter() && rest5490[2] && rest5490[2].token.value === "{}") {
                var trans5567 = enforest5358(rest5490[2].token.inner, context5485);
                return step5488(OperatorDefinitionTerm5267.create(syn5219.makeValue("unary", head5489), rest5490[0], rest5490[1], null, trans5567.result.body), rest5490.slice(3), opCtx5491);
            } else if (head5489.isIdentifier() && head5489.token.value === "binaryop" && rest5490[0] && rest5490[0].isDelimiter() && rest5490[0].token.value === "()" && rest5490[1] && rest5490[1].isNumericLiteral() && rest5490[2] && rest5490[2].isIdentifier() && rest5490[3] && rest5490[3].isDelimiter() && rest5490[3] && rest5490[3].token.value === "{}") {
                var trans5567 = enforest5358(rest5490[3].token.inner, context5485);
                return step5488(OperatorDefinitionTerm5267.create(syn5219.makeValue("binary", head5489), rest5490[0], rest5490[1], rest5490[2], trans5567.result.body), rest5490.slice(4), opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "function" && rest5490[0] && rest5490[0].isIdentifier() && rest5490[1] && rest5490[1].isDelimiter() && rest5490[1].token.value === "()" && rest5490[2] && rest5490[2].isDelimiter() && rest5490[2].token.value === "{}") {
                rest5490[1].token.inner = rest5490[1].token.inner;
                rest5490[2].token.inner = rest5490[2].token.inner;
                return step5488(NamedFunTerm5281.create(head5489, null, rest5490[0], rest5490[1], rest5490[2]), rest5490.slice(3), opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "function" && rest5490[0] && rest5490[0].isPunctuator() && rest5490[0].token.value === "*" && rest5490[1] && rest5490[1].isIdentifier() && rest5490[2] && rest5490[2].isDelimiter() && rest5490[2].token.value === "()" && rest5490[3] && rest5490[3].isDelimiter() && rest5490[3].token.value === "{}") {
                return step5488(NamedFunTerm5281.create(head5489, rest5490[0], rest5490[1], rest5490[2], rest5490[3]), rest5490.slice(4), opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "function" && rest5490[0] && rest5490[0].isDelimiter() && rest5490[0].token.value === "()" && rest5490[1] && rest5490[1].isDelimiter() && rest5490[1].token.value === "{}") {
                return step5488(AnonFunTerm5282.create(head5489, null, rest5490[0], rest5490[1]), rest5490.slice(2), opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "function" && rest5490[0] && rest5490[0].isPunctuator() && rest5490[0].token.value === "*" && rest5490[1] && rest5490[1].isDelimiter() && rest5490[1].token.value === "()" && rest5490[2] && rest5490[2].isDelimiter && rest5490[2].token.value === "{}") {
                rest5490[1].token.inner = rest5490[1].token.inner;
                rest5490[2].token.inner = rest5490[2].token.inner;
                return step5488(AnonFunTerm5282.create(head5489, rest5490[0], rest5490[1], rest5490[2]), rest5490.slice(3), opCtx5491);
            } else if ((head5489.isDelimiter() && head5489.token.value === "()" || head5489.isIdentifier()) && rest5490[0] && rest5490[0].isPunctuator() && resolve5226(rest5490[0], context5485.phase) === "=>" && rest5490[1] && rest5490[1].isDelimiter() && rest5490[1].token.value === "{}") {
                return step5488(ArrowFunTerm5283.create(head5489, rest5490[0], rest5490[1]), rest5490.slice(2), opCtx5491);
            } else if (head5489.isIdentifier() && head5489.token.value === "forPhase" && rest5490[0] && rest5490[0].isNumericLiteral() && rest5490[1] && rest5490[1].isDelimiter()) {
                return step5488(ForPhaseTerm5268.create(rest5490[0], rest5490[1].token.inner), rest5490.slice(2), opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "catch" && rest5490[0] && rest5490[0].isDelimiter() && rest5490[0].token.value === "()" && rest5490[1] && rest5490[1].isDelimiter() && rest5490[1].token.value === "{}") {
                rest5490[0].token.inner = rest5490[0].token.inner;
                rest5490[1].token.inner = rest5490[1].token.inner;
                return step5488(CatchClauseTerm5272.create(head5489, rest5490[0], rest5490[1]), rest5490.slice(2), opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "this") {
                return step5488(ThisExpressionTerm5291.create(head5489), rest5490, opCtx5491);
            } else if (head5489.isNumericLiteral() || head5489.isStringLiteral() || head5489.isBooleanLiteral() || head5489.isRegularExpression() || head5489.isNullLiteral()) {
                return step5488(LitTerm5292.create(head5489), rest5490, opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "import") {
                var imp5569 = enforestImport5344(head5489, rest5490);
                return step5488(imp5569.result, imp5569.rest, opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "export" && rest5490[0] && rest5490[0].isDelimiter()) {
                return step5488(ExportNameTerm5261.create(head5489, rest5490[0]), rest5490.slice(1), opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "export" && rest5490[0] && rest5490[0].isKeyword() && unwrapSyntax5237(rest5490[0]) === "default" && rest5490[1]) {
                var res5544 = enforest5358(rest5490.slice(1), context5485);
                return step5488(ExportDefaultTerm5262.create(head5489, rest5490[0], res5544.result), res5544.rest, opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "export" && rest5490[0]) {
                var res5544 = enforest5358(rest5490, context5485);
                return step5488(ExportDeclTerm5263.create(head5489, res5544.result), res5544.rest, opCtx5491);
            } else if (head5489.isIdentifier()) {
                return step5488(IdTerm5295.create(head5489), rest5490, opCtx5491);
            } else if (head5489.isPunctuator()) {
                return step5488(PuncTerm5250.create(head5489), rest5490, opCtx5491);
            } else if (head5489.isKeyword() && unwrapSyntax5237(head5489) === "with") {
                throwSyntaxError5234("enforest", "with is not supported in sweet.js", head5489);
            } else if (head5489.isKeyword()) {
                return step5488(KeywordTerm5249.create(head5489), rest5490, opCtx5491);
            } else if (head5489.isDelimiter()) {
                return step5488(DelimiterTerm5251.create(head5489), rest5490, opCtx5491);
            } else if (head5489.isTemplate()) {
                return step5488(TemplateTerm5286.create(head5489), rest5490, opCtx5491);
            } else if (head5489.isEOF()) {
                assert5232(rest5490.length === 0, "nothing should be after an EOF");
                return step5488(EOFTerm5248.create(head5489), [], opCtx5491);
            } else {
                // todo: are we missing cases?
                assert5232(false, "not implemented");
            }
        }
        if ( // Potentially an infix macro
        // This should only be invoked on runtime syntax terms
        !head5489.isMacroTerm && !head5489.isAnonMacroTerm && !head5489.isOperatorDefinitionTerm && rest5490.length && hasSyntaxTransform5353(rest5490, context5485, context5485.phase) && getSyntaxTransform5351(rest5490, context5485, context5485.phase).isOp === false) {
            var infLeftTerm5572 = opCtx5491.prevTerms[0] && opCtx5491.prevTerms[0].isPartialTerm ? opCtx5491.prevTerms[0] : null;
            var infTerm5573 = PartialExpressionTerm5298.create(head5489.destruct(context5485), infLeftTerm5572, function () {
                return step5488(head5489, [], opCtx5491);
            });
            var infPrevStx5574 = tagWithTerm5361(infTerm5573, head5489.destruct(context5485)).reverse().concat(opCtx5491.prevStx);
            var infPrevTerms5575 = [infTerm5573].concat(opCtx5491.prevTerms);
            var infRes5576 = expandMacro5356(rest5490, context5485, {
                prevStx: infPrevStx5574,
                prevTerms: infPrevTerms5575
            });
            if (infRes5576.prevTerms && infRes5576.prevTerms.length < infPrevTerms5575.length) {
                var infOpCtx5577 = rewindOpCtx5359(opCtx5491, infRes5576);
                return step5488(infRes5576.result[0], infRes5576.result.slice(1).concat(infRes5576.rest), infOpCtx5577);
            } else {
                return step5488(head5489, infRes5576.result.concat(infRes5576.rest), opCtx5491);
            }
        }
        var // done with current step so combine and continue on
        combResult5493 = opCtx5491.combine(head5489);
        if (opCtx5491.stack.length === 0) {
            return {
                result: combResult5493.term,
                rest: rest5490,
                prevStx: combResult5493.prevStx,
                prevTerms: combResult5493.prevTerms
            };
        } else {
            return step5488(combResult5493.term, rest5490, opCtx5491.stack[0]);
        }
    }
    return step5488(toks5484[0], toks5484.slice(1), {
        combine: function combine(t5578) {
            return {
                term: t5578,
                prevStx: prevStx5486,
                prevTerms: prevTerms5487
            };
        },
        prec: 0,
        stack: [],
        op: null,
        prevStx: prevStx5486,
        prevTerms: prevTerms5487
    });
}
function rewindOpCtx5359(opCtx5579, res5580) {
    if ( // If we've consumed all pending operators, we can just start over.
    // It's important that we always thread the new prevStx and prevTerms
    // through, otherwise the old ones will still persist.
    !res5580.prevTerms.length || !res5580.prevTerms[0].isPartialTerm) {
        return _5217.extend({}, opCtx5579, {
            combine: function combine(t5584) {
                return {
                    term: t5584,
                    prevStx: res5580.prevStx,
                    prevTerms: res5580.prevTerms
                };
            },
            prec: 0,
            op: null,
            stack: [],
            prevStx: res5580.prevStx,
            prevTerms: res5580.prevTerms
        });
    }
    // To rewind, we need to find the first (previous) pending operator. It
    // acts as a marker in the opCtx to let us know how far we need to go
    // back.
    var op5581 = null;
    for (var i5582 = 0; i5582 < res5580.prevTerms.length; i5582++) {
        if (!res5580.prevTerms[i5582].isPartialTerm) {
            break;
        }
        if (res5580.prevTerms[i5582].isPartialOperationTerm) {
            op5581 = res5580.prevTerms[i5582];
            break;
        }
    }
    if ( // If the op matches the current opCtx, we don't need to rewind
    // anything, but we still need to persist the prevStx and prevTerms.
    opCtx5579.op === op5581) {
        return _5217.extend({}, opCtx5579, {
            prevStx: res5580.prevStx,
            prevTerms: res5580.prevTerms
        });
    }
    for (var i5582 = 0; i5582 < opCtx5579.stack.length; i5582++) {
        if (opCtx5579.stack[i5582].op === op5581) {
            return _5217.extend({}, opCtx5579.stack[i5582], {
                prevStx: res5580.prevStx,
                prevTerms: res5580.prevTerms
            });
        }
    }
    assert5232(false, "Rewind failed.");
}
function get_expression5360(stx5585, context5586) {
    if (stx5585[0].term) {
        for (var termLen5588 = 1; termLen5588 < stx5585.length; termLen5588++) {
            if (stx5585[termLen5588].term !== stx5585[0].term) {
                break;
            }
        }
        if ( // Guard the termLen because we can have a multi-token term that
        // we don't want to split. TODO: is there something we can do to
        // get around this safely?
        stx5585[0].term.isPartialExpressionTerm && termLen5588 === stx5585[0].term.stx.length) {
            var expr5589 = stx5585[0].term.combine().result;
            for (var i5590 = 1, term5591 = stx5585[0].term; i5590 < stx5585.length; i5590++) {
                if (stx5585[i5590].term !== term5591) {
                    if (term5591 && term5591.isPartialTerm) {
                        term5591 = term5591.left;
                        i5590--;
                    } else {
                        break;
                    }
                }
            }
            return {
                result: expr5589,
                rest: stx5585.slice(i5590)
            };
        } else if (stx5585[0].term.isExprTerm) {
            return {
                result: stx5585[0].term,
                rest: stx5585.slice(termLen5588)
            };
        } else {
            return {
                result: null,
                rest: stx5585
            };
        }
    }
    var res5587 = enforest5358(stx5585, context5586);
    if (!res5587.result || !res5587.result.isExprTerm) {
        return {
            result: null,
            rest: stx5585
        };
    }
    return res5587;
}
function tagWithTerm5361(term5592, stx5593) {
    return stx5593.map(function (s5594) {
        s5594 = s5594.clone();
        s5594.term = term5592;
        return s5594;
    });
}
function applyMarkToPatternEnv5362(newMark5595, env5596) {
    function dfs5597(match5598) {
        if (match5598.level === 0) {
            // replace the match property with the marked syntax
            match5598.match = _5217.map(match5598.match, function (stx5599) {
                return stx5599.mark(newMark5595);
            });
        } else {
            _5217.each(match5598.match, function (match5600) {
                dfs5597(match5600);
            });
        }
    }
    _5217.keys(env5596).forEach(function (key5601) {
        dfs5597(env5596[key5601]);
    });
}
function markIn5363(arr5602, mark5603) {
    return arr5602.map(function (stx5604) {
        return stx5604.mark(mark5603);
    });
}
function markDefOut5364(arr5605, mark5606, def5607) {
    return arr5605.map(function (stx5608) {
        return stx5608.mark(mark5606);
    });
}
function loadMacroDef5365(body5609, context5610, phase5611) {
    var expanded5612 = body5609[0].destruct(context5610, { stripCompileTerm: true });
    var stub5613 = parser5218.read("()");
    stub5613[0].token.inner = expanded5612;
    var flattend5614 = flatten5385(stub5613);
    var bodyCode5615 = codegen5216.generate(parser5218.parse(flattend5614, { phase: phase5611 }));
    var localCtx5616;
    var macroGlobal5617 = {
        makeValue: syn5219.makeValue,
        makeRegex: syn5219.makeRegex,
        makeIdent: syn5219.makeIdent,
        makeKeyword: syn5219.makeKeyword,
        makePunc: syn5219.makePunc,
        makeDelim: syn5219.makeDelim,
        localExpand: function localExpand(stx5619, stop5620) {
            stop5620 = stop5620 || [];
            var markedStx5621 = markIn5363(stx5619, localCtx5616.mark);
            var stopMap5622 = new StringMap5221();
            stop5620.forEach(function (stop5626) {
                stopMap5622.set(resolve5226(stop5626, localCtx5616.phase), true);
            });
            var localExpandCtx5623 = makeExpanderContext5369(_5217.extend({}, localCtx5616, { stopMap: stopMap5622 }));
            var terms5624 = expand5368(markedStx5621, localExpandCtx5623);
            var newStx5625 = terms5624.reduce(function (acc5627, term5628) {
                acc5627.push.apply(acc5627, term5628.destruct(localCtx5616, { stripCompileTerm: true }));
                return acc5627;
            }, []);
            return markDefOut5364(newStx5625, localCtx5616.mark, localCtx5616.defscope);
        },
        filename: context5610.filename,
        getExpr: function getExpr(stx5629) {
            if (stx5629.length === 0) {
                return {
                    success: false,
                    result: [],
                    rest: []
                };
            }
            var markedStx5630 = markIn5363(stx5629, localCtx5616.mark);
            var r5631 = get_expression5360(markedStx5630, localCtx5616);
            return {
                success: r5631.result !== null,
                result: r5631.result === null ? [] : markDefOut5364(r5631.result.destruct(localCtx5616, { stripCompileTerm: true }), localCtx5616.mark, localCtx5616.defscope),
                rest: markDefOut5364(r5631.rest, localCtx5616.mark, localCtx5616.defscope)
            };
        },
        getIdent: function getIdent(stx5632) {
            if (stx5632[0] && stx5632[0].isIdentifier()) {
                return {
                    success: true,
                    result: [stx5632[0]],
                    rest: stx5632.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5632
            };
        },
        getLit: function getLit(stx5633) {
            if (stx5633[0] && patternModule5230.typeIsLiteral(stx5633[0].token.type)) {
                return {
                    success: true,
                    result: [stx5633[0]],
                    rest: stx5633.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5633
            };
        },
        unwrapSyntax: syn5219.unwrapSyntax,
        throwSyntaxError: throwSyntaxError5234,
        throwSyntaxCaseError: throwSyntaxCaseError5235,
        prettyPrint: syn5219.prettyPrint,
        parser: parser5218,
        __fresh: fresh5243,
        __freshScope: freshScope5244,
        __scope: context5610.scope,
        __bindings: context5610.bindings,
        _: _5217,
        patternModule: patternModule5230,
        getPattern: function getPattern(id5634) {
            return context5610.patternMap.get(id5634);
        },
        getPatternMap: function getPatternMap() {
            return context5610.patternMap;
        },
        getTemplate: function getTemplate(id5635) {
            assert5232(context5610.templateMap.has(id5635), "missing template");
            return syn5219.cloneSyntaxArray(context5610.templateMap.get(id5635));
        },
        getTemplateMap: function getTemplateMap() {
            // the template map is global across all context during compilation
            return context5610.templateMap;
        },
        applyMarkToPatternEnv: applyMarkToPatternEnv5362,
        mergeMatches: function mergeMatches(newMatch5636, oldMatch5637) {
            newMatch5636.patternEnv = _5217.extend({}, oldMatch5637.patternEnv, newMatch5636.patternEnv);
            return newMatch5636;
        },
        console: console
    };
    context5610.env.keysStr().forEach(function (key5638) {
        var val5639 = context5610.env.getStr(key5638);
        if ( // load the runtime values into the global object
        val5639 && val5639 instanceof RuntimeValue5349) {
            macroGlobal5617[key5638] = val5639.trans.value;
        }
    });
    context5610.store.keysStr().forEach(function (key5640) {
        var val5641 = context5610.store.getStr(key5640);
        if ( // load the runtime values into the global object
        val5641 && val5641 instanceof RuntimeValue5349) {
            macroGlobal5617[key5640] = val5641.trans.value;
        }
    });
    var macroFn5618 = scopedEval5327(bodyCode5615, macroGlobal5617);
    return function (stx5642, context5643, prevStx5644, prevTerms5645) {
        localCtx5616 = context5643;
        return macroFn5618(stx5642, context5643, prevStx5644, prevTerms5645);
    };
}
function expandToTermTree5366(stx5646, context5647) {
    assert5232(context5647, "expander context is required");
    var f5648, head5649, prevStx5650, restStx5651, prevTerms5652, macroDefinition5653;
    var rest5654 = stx5646;
    while (rest5654.length > 0) {
        assert5232(rest5654[0].token, "expecting a syntax object");
        f5648 = enforest5358(rest5654, context5647, prevStx5650, prevTerms5652);
        // head :: TermTree
        head5649 = f5648.result;
        // rest :: [Syntax]
        rest5654 = f5648.rest;
        if (!head5649) {
            // no head means the expansions stopped prematurely (for stepping)
            restStx5651 = rest5654;
            break;
        }
        var destructed5655 = tagWithTerm5361(head5649, f5648.result.destruct(context5647));
        prevTerms5652 = [head5649].concat(f5648.prevTerms);
        prevStx5650 = destructed5655.reverse().concat(f5648.prevStx);
        if (head5649.isImportTerm) {
            var // record the import in the module record for easier access
            entries5656 = context5647.moduleRecord.addImport(head5649);
            var // load up the (possibly cached) import module
            importMod5657 = loadImport5378(unwrapSyntax5237(head5649.from), context5647, context5647.moduleRecord.name);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5647 = visit5377(importMod5657.term, importMod5657.record, context5647.phase, context5647);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5379(entries5656, importMod5657.term, importMod5657.record, context5647, context5647.phase);
        }
        if (head5649.isImportForPhaseTerm) {
            var // record the import in the module record for easier access
            entries5656 = context5647.moduleRecord.addImport(head5649);
            var // load up the (possibly cached) import module
            importMod5657 = loadImport5378(unwrapSyntax5237(head5649.from), context5647, context5647.moduleRecord.name);
            // invoking an imported module loads the runtime values
            // into the environment for this phase
            context5647 = invoke5375(importMod5657.term, importMod5657.record, context5647.phase + head5649.phase.token.value, context5647);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5647 = visit5377(importMod5657.term, importMod5657.record, context5647.phase + head5649.phase.token.value, context5647);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod5379(entries5656, importMod5657.term, importMod5657.record, context5647, context5647.phase);
        }
        if (head5649.isForPhaseTerm) {
            var phaseShiftedContext5660 = makeExpanderContext5369(_5217.defaults({ phase: context5647.phase + head5649.phase.token.value }, context5647));
            head5649.body = expand5368(head5649.body, phaseShiftedContext5660);
        }
        if ((head5649.isExportDefaultTerm && head5649.decl.isMacroTerm || head5649.isMacroTerm) && expandCount5331 < maxExpands5332) {
            var macroDecl5661 = head5649.isExportDefaultTerm ? head5649.decl : head5649;
            if (!( // raw function primitive form
            macroDecl5661.body[0] && macroDecl5661.body[0].isKeyword() && macroDecl5661.body[0].token.value === "function")) {
                throwSyntaxError5234("load macro", "Primitive macro form must contain a function for the macro body", macroDecl5661.body);
            }
            // expand the body
            macroDecl5661.body = expand5368(macroDecl5661.body, makeExpanderContext5369(_5217.defaults({ phase: context5647.phase + 1 }, context5647)));
            //  and load the macro definition into the environment
            macroDefinition5653 = loadMacroDef5365(macroDecl5661.body, context5647, context5647.phase + 1);
            var fullName5662 = macroDecl5661.name.token.inner;
            var multiTokName5663 = makeMultiToken5245(macroDecl5661.name);
            multiTokName5663 = multiTokName5663.delScope(context5647.useScope);
            context5647.bindings.add(multiTokName5663, fresh5243(), context5647.phase);
            context5647.env.set(multiTokName5663, context5647.phase, new CompiletimeValue5348(new SyntaxTransform5224(macroDefinition5653, false, builtinMode5330, fullName5662), context5647.moduleRecord.name, context5647.phase));
        }
        if (head5649.isOperatorDefinitionTerm) {
            if (!( // raw function primitive form
            head5649.body[0] && head5649.body[0].isKeyword() && head5649.body[0].token.value === "function")) {
                throwSyntaxError5234("load macro", "Primitive macro form must contain a function for the macro body", head5649.body);
            }
            // expand the body
            head5649.body = expand5368(head5649.body, makeExpanderContext5369(_5217.defaults({ phase: context5647.phase + 1 }, context5647)));
            var //  and load the macro definition into the environment
            opDefinition5664 = loadMacroDef5365(head5649.body, context5647, context5647.phase + 1);
            var fullName5662 = head5649.name.token.inner;
            var multiTokName5663 = makeMultiToken5245(head5649.name);
            multiTokName5663 = multiTokName5663.delScope(context5647.useScope);
            context5647.bindings.add(multiTokName5663, fresh5243(), context5647.phase);
            var opObj5667 = getSyntaxTransform5351(multiTokName5663, context5647, context5647.phase);
            if (!opObj5667) {
                opObj5667 = {
                    isOp: true,
                    builtin: builtinMode5330,
                    fullName: fullName5662
                };
            }
            assert5232(unwrapSyntax5237(head5649.type) === "binary" || unwrapSyntax5237(head5649.type) === "unary", "operator must either be binary or unary");
            opObj5667[unwrapSyntax5237(head5649.type)] = {
                fn: opDefinition5664,
                prec: head5649.prec.token.value,
                assoc: head5649.assoc ? head5649.assoc.token.value : null
            };
            context5647.env.set(multiTokName5663, context5647.phase, new CompiletimeValue5348(opObj5667, context5647.moduleRecord.name, context5647.phase));
        }
        if (head5649.isNamedFunTerm) {
            // addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            head5649.name = head5649.name.delScope(context5647.useScope);
            context5647.bindings.add(head5649.name, fresh5243(), context5647.phase);
            context5647.env.set(head5649.name, context5647.phase, new CompiletimeValue5348(new VarTransform5225(head5649.name), context5647.moduleRecord.name, context5647.phase));
            context5647.store.set(head5649.name, context5647.phase, new CompiletimeValue5348(new VarTransform5225(head5649.name), context5647.moduleRecord.name, context5647.phase));
        }
        if (head5649.isVariableStatementTerm || head5649.isLetStatementTerm || head5649.isConstStatementTerm) {
            head5649.decls = head5649.decls.map(function (decl5668) {
                decl5668.ident = decl5668.ident.delScope(context5647.useScope);
                context5647.bindings.add(decl5668.ident, fresh5243(), context5647.phase);
                context5647.env.set(decl5668.ident, context5647.phase, new CompiletimeValue5348(new VarTransform5225(decl5668.ident), context5647.moduleRecord.name, context5647.name));
                context5647.store.set(decl5668.ident, context5647.phase, new CompiletimeValue5348(new VarTransform5225(decl5668.ident), context5647.moduleRecord.name, context5647.name));
                return decl5668;
            });
        }
        if (head5649.isBlockTerm && head5649.body.isDelimiterTerm) {
            head5649.body.delim.token.inner.forEach(function (term5669) {
                if (term5669.isVariableStatementTerm) {
                    term5669.decls = term5669.decls.map(function (decl5670) {
                        decl5670.ident = decl5670.ident.delScope(context5647.useScope);
                        context5647.bindings.add(decl5670.ident, fresh5243(), context5647.phase);
                        return decl5670;
                    });
                }
            });
        }
        if (head5649.isDelimiterTerm) {
            head5649.delim.token.inner.forEach(function (term5671) {
                if (term5671.isVariableStatementTerm) {
                    term5671.decls = term5671.decls.map(function (decl5672) {
                        decl5672.ident = decl5672.ident.delScope(context5647.useScope);
                        context5647.bindings.add(decl5672.ident, fresh5243(), context5647.phase);
                        return decl5672;
                    });
                }
            });
        }
        if (head5649.isForStatementTerm) {
            var forCond5673 = head5649.cond.token.inner;
            if (forCond5673[0] && resolve5226(forCond5673[0], context5647.phase) === "let" && forCond5673[1] && forCond5673[1].isIdentifier()) {
                var letNew5674 = fresh5243();
                var letId5675 = forCond5673[1];
                forCond5673 = forCond5673.map(function (stx5676) {
                    return stx5676.rename(letId5675, letNew5674);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head5649.cond.token.inner = expand5368([forCond5673[0]], context5647).concat(expand5368(forCond5673.slice(1), context5647));
                if ( // nice and easy case: `for (...) { ... }`
                rest5654[0] && rest5654[0].token.value === "{}") {
                    rest5654[0] = rest5654[0].rename(letId5675, letNew5674);
                } else {
                    var // need to deal with things like `for (...) if (...) log(...)`
                    bodyEnf5677 = enforest5358(rest5654, context5647);
                    var bodyDestructed5678 = bodyEnf5677.result.destruct(context5647);
                    var renamedBodyTerm5679 = bodyEnf5677.result.rename(letId5675, letNew5674);
                    tagWithTerm5361(renamedBodyTerm5679, bodyDestructed5678);
                    rest5654 = bodyEnf5677.rest;
                    prevStx5650 = bodyDestructed5678.reverse().concat(prevStx5650);
                    prevTerms5652 = [renamedBodyTerm5679].concat(prevTerms5652);
                }
            } else {
                head5649.cond.token.inner = expand5368(head5649.cond.token.inner, context5647);
            }
        }
    }
    return {
        // prevTerms are stored in reverse for the purposes of infix
        // lookbehind matching, so we need to re-reverse them.
        terms: prevTerms5652 ? prevTerms5652.reverse() : [],
        restStx: restStx5651,
        context: context5647
    };
}
function expandTermTreeToFinal5367(term5680, context5681) {
    assert5232(context5681 && context5681.env, "environment map is required");
    if (term5680.isArrayLiteralTerm) {
        term5680.array.delim.token.inner = expand5368(term5680.array.delim.token.inner, context5681);
        return term5680;
    } else if (term5680.isBlockTerm) {
        term5680.body.delim.token.inner = expand5368(term5680.body.delim.token.inner, context5681);
        return term5680;
    } else if (term5680.isParenExpressionTerm) {
        term5680.args = _5217.map(term5680.args, function (arg5682) {
            return expandTermTreeToFinal5367(arg5682, context5681);
        });
        return term5680;
    } else if (term5680.isCallTerm) {
        term5680.fun = expandTermTreeToFinal5367(term5680.fun, context5681);
        term5680.args = expandTermTreeToFinal5367(term5680.args, context5681);
        return term5680;
    } else if (term5680.isReturnStatementTerm) {
        term5680.expr = expandTermTreeToFinal5367(term5680.expr, context5681);
        return term5680;
    } else if (term5680.isUnaryOpTerm) {
        term5680.expr = expandTermTreeToFinal5367(term5680.expr, context5681);
        return term5680;
    } else if (term5680.isBinOpTerm || term5680.isAssignmentExpressionTerm) {
        term5680.left = expandTermTreeToFinal5367(term5680.left, context5681);
        term5680.right = expandTermTreeToFinal5367(term5680.right, context5681);
        return term5680;
    } else if (term5680.isObjGetTerm) {
        term5680.left = expandTermTreeToFinal5367(term5680.left, context5681);
        term5680.right.delim.token.inner = expand5368(term5680.right.delim.token.inner, context5681);
        return term5680;
    } else if (term5680.isObjDotGetTerm) {
        term5680.left = expandTermTreeToFinal5367(term5680.left, context5681);
        term5680.right = expandTermTreeToFinal5367(term5680.right, context5681);
        return term5680;
    } else if (term5680.isConditionalExpressionTerm) {
        term5680.cond = expandTermTreeToFinal5367(term5680.cond, context5681);
        term5680.tru = expandTermTreeToFinal5367(term5680.tru, context5681);
        term5680.fls = expandTermTreeToFinal5367(term5680.fls, context5681);
        return term5680;
    } else if (term5680.isVariableDeclarationTerm) {
        if (term5680.init) {
            term5680.init = expandTermTreeToFinal5367(term5680.init, context5681);
        }
        return term5680;
    } else if (term5680.isVariableStatementTerm) {
        term5680.decls = _5217.map(term5680.decls, function (decl5683) {
            return expandTermTreeToFinal5367(decl5683, context5681);
        });
        return term5680;
    } else if (term5680.isDelimiterTerm) {
        // expand inside the delimiter and then continue on
        term5680.delim.token.inner = expand5368(term5680.delim.token.inner, context5681);
        return term5680;
    } else if (term5680.isIdTerm) {
        var varTrans5684 = getCompiletimeValue5350(term5680.id, context5681, context5681.phase);
        if (varTrans5684 instanceof VarTransform5225) {
            term5680.id = syntaxFromToken5328(term5680.id.token, varTrans5684.id);
        }
        return term5680;
    } else if (term5680.isNamedFunTerm || term5680.isAnonFunTerm || term5680.isCatchClauseTerm || term5680.isArrowFunTerm || term5680.isModuleTerm) {
        var newDef5685;
        var paramSingleIdent5688;
        var params5689;
        var bodies5690;
        var paramNames5691;
        var bodyContext5692;
        var renamedBody5693;
        var expandedResult5694;
        var bodyTerms5695;
        var renamedParams5696;
        var flatArgs5697;
        var puncCtx5703;
        var expandedArgs5698;

        var _ret = (function () {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            newDef5685 = [];

            var scope5686 = freshScope5244(context5681.bindings);
            var useScope5687 = freshScope5244(context5681.bindings);
            paramSingleIdent5688 = term5680.params && term5680.params.isIdentifier();

            if (term5680.params && term5680.params.isDelimiter()) {
                params5689 = term5680.params;
            } else if (paramSingleIdent5688) {
                params5689 = term5680.params;
            } else {
                params5689 = syn5219.makeDelim("()", [], null);
            }

            if (Array.isArray(term5680.body)) {
                bodies5690 = syn5219.makeDelim("{}", term5680.body, null);
            } else {
                bodies5690 = term5680.body;
            }
            paramNames5691 = _5217.map(getParamIdentifiers5335(params5689), function (param5699) {
                var paramNew5700 = param5699.mark(scope5686);
                context5681.bindings.add(paramNew5700, fresh5243(), context5681.phase);
                context5681.env.set(paramNew5700, context5681.phase, new CompiletimeValue5348(new VarTransform5225(paramNew5700), context5681.moduleRecord.name, context5681.phase));
                return {
                    originalParam: param5699,
                    renamedParam: paramNew5700
                };
            });
            bodyContext5692 = makeExpanderContext5369(_5217.defaults({
                scope: scope5686,
                useScope: useScope5687,
                defscope: newDef5685,
                // paramscope is used to filter out var redeclarations
                paramscope: paramNames5691.map(function (p5701) {
                    return p5701.renamedParam;
                })
            }, context5681));
            renamedBody5693 = bodies5690.mark(scope5686);
            expandedResult5694 = expandToTermTree5366(renamedBody5693.token.inner, bodyContext5692);
            bodyTerms5695 = expandedResult5694.terms;

            if (expandedResult5694.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody5693.token.inner = expandedResult5694.terms.concat(expandedResult5694.restStx);
                if (Array.isArray(term5680.body)) {
                    term5680.body = renamedBody5693.token.inner;
                } else {
                    term5680.body = renamedBody5693;
                }
                return {
                    v: term5680
                };
            }
            renamedParams5696 = _5217.map(paramNames5691, function (p5702) {
                return p5702.renamedParam;
            });

            if (paramSingleIdent5688) {
                flatArgs5697 = renamedParams5696[0];
            } else {
                puncCtx5703 = term5680.params || null;

                flatArgs5697 = syn5219.makeDelim("()", joinSyntax5329(renamedParams5696, syn5219.makePunc(",", puncCtx5703)), puncCtx5703);
            }
            expandedArgs5698 = expand5368([flatArgs5697], bodyContext5692);

            assert5232(expandedArgs5698.length === 1, "should only get back one result");
            if ( // stitch up the function with all the renamings
            term5680.params) {
                term5680.params = expandedArgs5698[0];
            }
            bodyTerms5695 = _5217.map(bodyTerms5695, function (bodyTerm5704) {
                if ( // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                bodyTerm5704.isBlockTerm) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal5705 = expandTermTreeToFinal5367(bodyTerm5704, expandedResult5694.context);
                    return blockFinal5705;
                } else {
                    var termWithCtx5706 = bodyTerm5704;
                    // finish expansion
                    return expandTermTreeToFinal5367(termWithCtx5706, expandedResult5694.context);
                }
            });
            if (term5680.isModuleTerm) {
                bodyTerms5695.forEach(function (bodyTerm5707) {
                    if (bodyTerm5707.isExportNameTerm || bodyTerm5707.isExportDeclTerm || bodyTerm5707.isExportDefaultTerm) {
                        context5681.moduleRecord.addExport(bodyTerm5707);
                    }
                });
            }
            renamedBody5693.token.inner = bodyTerms5695;
            if (Array.isArray(term5680.body)) {
                term5680.body = renamedBody5693.token.inner;
            } else {
                term5680.body = renamedBody5693;
            }
            // and continue expand the rest
            return {
                v: term5680
            };
        })();

        if (typeof _ret === "object") return _ret.v;
    }
    // the term is fine as is
    return term5680;
}
function expand5368(stx5708, context5709) {
    assert5232(context5709, "must provide an expander context");
    var trees5710 = expandToTermTree5366(stx5708, context5709);
    var terms5711 = _5217.map(trees5710.terms, function (term5712) {
        return expandTermTreeToFinal5367(term5712, trees5710.context);
    });
    if (trees5710.restStx) {
        terms5711.push.apply(terms5711, trees5710.restStx);
    }
    return terms5711;
}
function makeExpanderContext5369(o5713) {
    o5713 = o5713 || {};
    var env5714 = o5713.env || new NameMap5222();
    var store5715 = o5713.store || new NameMap5222();
    var bindings5716 = o5713.bindings || new BindingMap5223();
    return Object.create(Object.prototype, {
        filename: {
            value: o5713.filename,
            writable: false,
            enumerable: true,
            configurable: false
        },
        compileSuffix: {
            value: o5713.compileSuffix || ".jsc",
            writable: false,
            enumerable: true,
            configurable: false
        },
        env: {
            value: env5714,
            writable: false,
            enumerable: true,
            configurable: false
        },
        store: {
            value: store5715,
            writable: false,
            enumerable: true,
            configurable: false
        },
        defscope: {
            value: o5713.defscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        paramscope: {
            value: o5713.paramscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        templateMap: {
            value: o5713.templateMap || new StringMap5221(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        patternMap: {
            value: o5713.patternMap || new StringMap5221(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        mark: {
            value: o5713.mark,
            writable: false,
            enumerable: true,
            configurable: false
        },
        bindings: {
            value: bindings5716,
            writable: false,
            enumerable: true,
            configurable: false
        },
        scope: {
            value: o5713.scope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        useScope: {
            value: o5713.useScope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        phase: {
            value: o5713.phase || 0,
            writable: false,
            enumerable: true,
            configurable: false
        },
        implicitImport: {
            value: o5713.implicitImport || new StringMap5221(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        stopMap: {
            value: o5713.stopMap || new StringMap5221(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        moduleRecord: {
            value: o5713.moduleRecord || {},
            writable: false,
            enumerable: true,
            configurable: false
        }
    });
}
function makeModuleExpanderContext5370(filename5717, templateMap5718, patternMap5719, phase5720, moduleRecord5721, compileSuffix5722, bindings5723) {
    return makeExpanderContext5369({
        filename: filename5717,
        templateMap: templateMap5718,
        patternMap: patternMap5719,
        phase: phase5720,
        moduleRecord: moduleRecord5721,
        compileSuffix: compileSuffix5722,
        bindings: bindings5723
    });
}
function resolvePath5371(name5724, parent5725) {
    var path5726 = require("path");
    var resolveSync5727 = require("resolve/lib/sync");
    var root5728 = path5726.dirname(parent5725);
    var fs5729 = require("fs");
    if (name5724[0] === ".") {
        name5724 = path5726.resolve(root5728, name5724);
    }
    return resolveSync5727(name5724, {
        basedir: root5728,
        extensions: [".js", ".sjs"]
    });
}
function defaultImportStx5372(importPath5730, ctx5731) {
    var rtNames5732 = ["stxnonrec", "stxrec", "macroclass", "operator"];
    var ctNames5733 = ["quoteSyntax", "syntax", "#", "syntaxCase", "stxnonrec", "stxrec", "withSyntax", "letstx", "macroclass", "operator"];
    var importNames5734 = rtNames5732.map(function (name5738) {
        return syn5219.makeIdent(name5738, ctx5731);
    });
    var importForMacrosNames5735 = ctNames5733.map(function (name5739) {
        return syn5219.makeIdent(name5739, ctx5731);
    });
    var // import { names ... } from "importPath" for phase 1
    importForMacrosStmt5736 = [syn5219.makeKeyword("import", ctx5731), syn5219.makeDelim("{}", joinSyntax5329(importForMacrosNames5735, syn5219.makePunc(",", ctx5731)), ctx5731), syn5219.makeIdent("from", ctx5731), syn5219.makeValue(importPath5730, ctx5731), syn5219.makeKeyword("for", ctx5731), syn5219.makeIdent("phase", ctx5731), syn5219.makeValue(1, ctx5731)];
    var // import { names ... } from "importPath"
    importStmt5737 = [syn5219.makeKeyword("import", ctx5731), syn5219.makeDelim("{}", joinSyntax5329(importNames5734, syn5219.makePunc(",", ctx5731)), ctx5731), syn5219.makeIdent("from", ctx5731), syn5219.makeValue(importPath5730, ctx5731)];
    return importStmt5737.concat(importForMacrosStmt5736);
}
function createModule5373(name5740, body5741) {
    var language5742 = "base";
    var modBody5743 = body5741;
    if (body5741 && body5741[0] && body5741[1] && body5741[2] && unwrapSyntax5237(body5741[0]) === "#" && unwrapSyntax5237(body5741[1]) === "lang" && body5741[2].isStringLiteral()) {
        language5742 = unwrapSyntax5237(body5741[2]);
        // consume optional semicolon
        modBody5743 = body5741[3] && body5741[3].token.value === ";" && body5741[3].isPunctuator() ? body5741.slice(4) : body5741.slice(3);
    }
    if ( // insert the default import statements into the module body
    language5742 !== "base" && language5742 !== "js") {
        // "base" and "js" are currently special languages meaning don't
        // insert the default imports
        modBody5743 = defaultImportStx5372(language5742, body5741[0]).concat(modBody5743);
    }
    return {
        record: new ModuleRecord5229(name5740, language5742),
        term: ModuleTerm5253.create(modBody5743)
    };
}
function loadModule5374(name5744) {
    var // node specific code
    fs5745 = require("fs");
    return (function (body5746) {
        return createModule5373(name5744, body5746);
    })(parser5218.read(fs5745.readFileSync(name5744, "utf8")));
}
function invoke5375(modTerm5747, modRecord5748, phase5749, context5750) {
    if (modRecord5748.language === "base") {
        var // base modules can just use the normal require pipeline
        exported5751 = require(modRecord5748.name);
        Object.keys(exported5751).forEach(function (exp5752) {
            var // create new bindings in the context
            expName5753 = syn5219.makeIdent(exp5752, null).mark(freshScope5244(context5750.bindings));
            context5750.bindings.add(expName5753, fresh5243(), phase5749);
            modRecord5748.exportEntries.push(new ExportEntry5228(null, expName5753, expName5753));
            context5750.store.setWithModule(expName5753, phase5749, modRecord5748.name, new RuntimeValue5349({ value: exported5751[exp5752] }, modRecord5748.name, phase5749));
        });
    } else {
        // recursively invoke any imports in this module at this
        // phase and update the context
        modRecord5748.importedModules.forEach(function (impPath5756) {
            var importMod5757 = loadImport5378(impPath5756, context5750, modRecord5748.name);
            var impEntries5758 = modRecord5748.getImportsForModule(impPath5756);
            if (_5217.any(impEntries5758, function (entry5759) {
                return entry5759.forPhase === 0;
            })) {
                context5750 = invoke5375(importMod5757.term, importMod5757.record, phase5749, context5750);
            }
        });
        var // turn the module into text so we can eval it
        code5754 = (function (terms5760) {
            return codegen5216.generate(parser5218.parse(flatten5385(_5217.flatten(terms5760.map(function (term5761) {
                return term5761.destruct(context5750, {
                    stripCompileTerm: true,
                    stripModuleTerm: true
                });
            })))));
        })(modTerm5747.body);
        var global5755 = { console: console };
        // eval but with a fresh heap
        vm5231.runInNewContext(code5754, global5755);
        // update the exports with the runtime values
        modRecord5748.exportEntries.forEach(function (entry5762) {
            var // we have to get the value with the localName
            expName5763 = resolve5226(entry5762.localName, 0);
            var expVal5764 = global5755[expName5763];
            if (expVal5764) {
                context5750.bindings.add(entry5762.exportName, fresh5243(), phase5749);
                // and set it as the export name
                context5750.store.set(entry5762.exportName, phase5749, new RuntimeValue5349({ value: expVal5764 }, modRecord5748.name, phase5749));
            }
        });
    }
    return context5750;
}
function visitTerms5376(terms5765, modRecord5766, phase5767, context5768) {
    var name5769;
    var macroDefinition5770;
    var exportName5771;
    var entries5772;
    terms5765.forEach(function (term5773) {
        if ( // add the exported names to the module record
        term5773.isExportNameTerm || term5773.isExportDeclTerm || term5773.isExportDefaultTerm) {
            entries5772 = modRecord5766.addExport(term5773);
        }
        if (term5773.isExportDefaultTerm && term5773.decl.isMacroTerm || term5773.isMacroTerm) {
            var _multiTokName5774 = undefined,
                _fullName5775 = undefined,
                macBody5776 = term5773.isExportDefaultTerm ? term5773.decl.body : term5773.body;
            if (term5773.isExportDefaultTerm) {
                _multiTokName5774 = entries5772[0].exportName;
                _fullName5775 = [entries5772[0].exportName];
            } else {
                _multiTokName5774 = makeMultiToken5245(term5773.name);
                _fullName5775 = term5773.name.token.inner;
            }
            if ( // todo: handle implicit imports
            !context5768.store.has(_multiTokName5774, phase5767)) {
                macroDefinition5770 = loadMacroDef5365(macBody5776, context5768, phase5767 + 1);
                context5768.bindings.add(_multiTokName5774, fresh5243(), phase5767);
                context5768.store.set(_multiTokName5774, phase5767, new CompiletimeValue5348(new SyntaxTransform5224(macroDefinition5770, false, builtinMode5330, _fullName5775), phase5767, modRecord5766.name));
            }
        }
        if (term5773.isForPhaseTerm) {
            visitTerms5376(term5773.body, modRecord5766, phase5767 + term5773.phase.token.value, context5768);
        }
        if (term5773.isOperatorDefinitionTerm) {
            var multiTokName5774 = makeMultiToken5245(term5773.name);
            var fullName5775 = term5773.name.token.inner;
            if (!context5768.store.has(multiTokName5774, phase5767)) {
                var opDefinition5779 = loadMacroDef5365(term5773.body, context5768, phase5767 + 1);
                var opObj5780 = {
                    isOp: true,
                    builtin: builtinMode5330,
                    fullName: fullName5775
                };
                assert5232(unwrapSyntax5237(term5773.type) === "binary" || unwrapSyntax5237(term5773.type) === "unary", "operator must either be binary or unary");
                opObj5780[unwrapSyntax5237(term5773.type)] = {
                    fn: opDefinition5779,
                    prec: term5773.prec.token.value,
                    assoc: term5773.assoc ? term5773.assoc.token.value : null
                };
                // bind in the store for the current phase
                context5768.bindings.add(multiTokName5774, fresh5243(), phase5767);
                context5768.store.set(multiTokName5774, phase5767, new CompiletimeValue5348(opObj5780, phase5767, modRecord5766.name));
            }
        }
    });
}
function visit5377(modTerm5781, modRecord5782, phase5783, context5784) {
    if ( // don't need to visit base modules since they do not support macros
    modRecord5782.language === "base") {
        return context5784;
    }
    // reset the exports
    modRecord5782.exportEntries = [];
    // for each of the imported modules, recursively visit and
    // invoke them at the appropriate phase and then bind the
    // imported names in this module
    modRecord5782.importedModules.forEach(function (impPath5785) {
        var // load the (possibly cached) module for this import
        importMod5786 = loadImport5378(impPath5785, context5784, modRecord5782.name);
        var // grab all the import statements for that module
        impEntries5787 = modRecord5782.getImportsForModule(impPath5785);
        var uniquePhases5788 = _5217.uniq(impEntries5787.map(function (entry) {
            return entry.forPhase;
        }));
        uniquePhases5788.forEach(function (impPhase5789) {
            context5784 = visit5377(importMod5786.term, importMod5786.record, phase5783 + impPhase5789, context5784);
            if ( // don't need to invoke when importing for phase 0 (runtime)
            impPhase5789 > 0) {
                context5784 = invoke5375(importMod5786.term, importMod5786.record, phase5783 + impPhase5789, context5784);
            }
        });
        bindImportInMod5379(impEntries5787, importMod5786.term, importMod5786.record, context5784, phase5783);
    });
    // load the transformers into the store
    visitTerms5376(modTerm5781.body, modRecord5782, phase5783, context5784);
    return context5784;
}
function loadImport5378(path5790, context5791, parentPath5792) {
    var modFullPath5793 = resolvePath5371(path5790, parentPath5792);
    if (!availableModules5333.has(modFullPath5793)) {
        var // load it
        modToImport5794 = (function (mod5795) {
            if (mod5795.record.language === "base") {
                return {
                    term: mod5795,
                    record: mod5795.record
                };
            }
            var loadContext5796 = makeExpanderContext5369(_5217.defaults({
                // need to expand with a fresh environment but we keep the store
                env: new NameMap5222(),
                // always expand from phase 0
                phase: 0,
                filename: modFullPath5793,
                moduleRecord: mod5795.record
            }, context5791));
            var expanded5797 = expandModule5380(mod5795.term, loadContext5796);
            return {
                term: expanded5797.mod,
                record: expanded5797.context.moduleRecord
            };
        })(loadModule5374(modFullPath5793));
        availableModules5333.set(modFullPath5793, modToImport5794);
        return modToImport5794;
    }
    return availableModules5333.get(modFullPath5793);
}
function bindImportInMod5379(impEntries5798, modTerm5799, modRecord5800, context5801, phase5802) {
    impEntries5798.forEach(function (entry5803) {
        var isBase5804 = modRecord5800.language === "base";
        var inExports5805 = _5217.find(modRecord5800.exportEntries, function (expEntry5808) {
            return unwrapSyntax5237(expEntry5808.exportName) === unwrapSyntax5237(entry5803.importName);
        });
        if (!(inExports5805 || isBase5804)) {
            throwSyntaxError5234("compile", "the imported name `" + unwrapSyntax5237(entry5803.importName) + "` was not exported from the module", entry5803.importName);
        }
        var exportName5806;
        if (inExports5805) {
            exportName5806 = inExports5805.exportName;
        } else {
            assert5232(false, "not implemented yet: missing export name");
        }
        var localName5807 = entry5803.localName;
        context5801.bindings.addForward(localName5807, exportName5806, phase5802 + entry5803.forPhase);
    });
}
function expandModule5380(mod5809, context5810) {
    return {
        context: context5810,
        mod: expandTermTreeToFinal5367(mod5809, context5810)
    };
}
function isRuntimeName5381(stx5811, context5812) {
    if (stx5811.isDelimiter()) {
        return hasVarTransform5354(stx5811.token.inner, context5812, 0);
    } else {
        return hasVarTransform5354(stx5811, context5812, 0);
    }
}
function isCompiletimeName5382(stx5813, context5814) {
    if (stx5813.isDelimiter()) {
        return hasSyntaxTransform5353(stx5813.token.inner, context5814, 0);
    } else {
        return hasSyntaxTransform5353(stx5813, context5814, 0);
    }
}
function flattenModule5383(modTerm5815, modRecord5816, context5817) {
    var // filter the imports to just the imports and names that are
    // actually available at runtime
    imports5818 = modRecord5816.getRuntimeImportEntries().filter(function (entry5824) {
        return !isCompiletimeName5382(entry5824.localName, context5817);
    });
    var exports5819 = modRecord5816.exportEntries.filter(function (entry5825) {
        return isRuntimeName5381(entry5825.localName, context5817);
    });
    var eof5820 = undefined;
    var // filter out all of the import and export statements
    output5821 = modTerm5815.body.reduce(function (acc5826, term5827) {
        if (term5827.isExportNameTerm || term5827.isExportDeclTerm || term5827.isExportDefaultTerm || term5827.isImportTerm || term5827.isImportForPhaseTerm) {
            return acc5826;
        }
        if (term5827.isEOFTerm) {
            eof5820 = term5827.destruct(context5817);
            return acc5826;
        }
        return acc5826.concat(term5827.destruct(context5817, { stripCompileTerm: true }));
    }, []);
    output5821 = (function (output5828) {
        return output5828.map(function (stx5829) {
            var name5830 = resolve5226(stx5829, 0);
            if ( // collect the implicit imports (those imports that
            // must be included because a macro expanded to a reference
            // to an import from some other module)
            context5817.implicitImport.has(name5830)) {
                var implicit5831 = context5817.implicitImport.get(name5830);
                if ( // don't double add the import
                !_5217.find(imports5818, function (imp5832) {
                    return imp5832 === implicit5831;
                })) {
                    imports5818.push(implicit5831);
                }
            }
            return stx5829;
        });
    })(flatten5385(output5821));
    var // flatten everything
    flatImports5822 = imports5818.reduce(function (acc5833, entry5834) {
        entry5834.moduleRequest = entry5834.moduleRequest.clone();
        entry5834.moduleRequest.token.value += context5817.compileSuffix;
        return acc5833.concat(flatten5385(entry5834.toTerm().destruct(context5817).concat(syn5219.makePunc(";", entry5834.moduleRequest))));
    }, []);
    var flatExports5823 = exports5819.reduce(function (acc, entry) {
        return acc.concat(flatten5385(entry.toTerm().destruct(context5817).concat(syn5219.makePunc(";", entry.localName))));
    }, []);
    return {
        imports: imports5818.map(function (entry5835) {
            return entry5835.toTerm();
        }),
        body: flatImports5822.concat(output5821).concat(flatExports5823).concat(eof5820)
    };
}
function compileModule5384(stx5836, options5837) {
    var fs5838 = require("fs");
    options5837 = options5837 || {};
    var filename5839 = options5837 && typeof options5837.filename !== "undefined" ? fs5838.realpathSync(options5837.filename) : "(anonymous module)";
    maxExpands5332 = Infinity;
    expandCount5331 = 0;
    var mod5840 = createModule5373(filename5839, stx5836);
    var // the template and pattern maps are global for every module
    templateMap5841 = new StringMap5221();
    var patternMap5842 = new StringMap5221();
    availableModules5333 = new StringMap5221();
    var context5843 = makeExpanderContext5369({
        filename: filename5839,
        templateMap: templateMap5841,
        patternMap: patternMap5842,
        phase: 0,
        moduleRecord: mod5840.record,
        compileSuffix: options5837.compileSuffix
    });
    var expanded5844 = expandModule5380(mod5840.term, context5843);
    var flattened5845 = flattenModule5383(expanded5844.mod, expanded5844.context.moduleRecord, expanded5844.context);
    var compiledModules5846 = [];
    availableModules5333.keys().forEach(function (modName5847) {
        var mod5848 = availableModules5333.get(modName5847);
        if (mod5848.record.language !== "base") {
            var flattened5849 = flattenModule5383(mod5848.term, mod5848.record, expanded5844.context);
            compiledModules5846.push({
                path: modName5847,
                code: flattened5849.body
            });
        }
    });
    return [{
        path: filename5839,
        code: flattened5845.body
    }].concat(compiledModules5846);
}
function flatten5385(stx5850) {
    return _5217.reduce(stx5850, function (acc5851, stx5852) {
        if (stx5852.isDelimiter()) {
            var openParen5853 = syntaxFromToken5328({
                type: parser5218.Token.Punctuator,
                value: stx5852.token.value[0],
                range: stx5852.token.startRange,
                sm_range: typeof stx5852.token.sm_startRange == "undefined" ? stx5852.token.startRange : stx5852.token.sm_startRange,
                lineNumber: stx5852.token.startLineNumber,
                sm_lineNumber: typeof stx5852.token.sm_startLineNumber == "undefined" ? stx5852.token.startLineNumber : stx5852.token.sm_startLineNumber,
                lineStart: stx5852.token.startLineStart,
                sm_lineStart: typeof stx5852.token.sm_startLineStart == "undefined" ? stx5852.token.startLineStart : stx5852.token.sm_startLineStart
            }, stx5852);
            var closeParen5854 = syntaxFromToken5328({
                type: parser5218.Token.Punctuator,
                value: stx5852.token.value[1],
                range: stx5852.token.endRange,
                sm_range: typeof stx5852.token.sm_endRange == "undefined" ? stx5852.token.endRange : stx5852.token.sm_endRange,
                lineNumber: stx5852.token.endLineNumber,
                sm_lineNumber: typeof stx5852.token.sm_endLineNumber == "undefined" ? stx5852.token.endLineNumber : stx5852.token.sm_endLineNumber,
                lineStart: stx5852.token.endLineStart,
                sm_lineStart: typeof stx5852.token.sm_endLineStart == "undefined" ? stx5852.token.endLineStart : stx5852.token.sm_endLineStart
            }, stx5852);
            if (stx5852.token.leadingComments) {
                openParen5853.token.leadingComments = stx5852.token.leadingComments;
            }
            if (stx5852.token.trailingComments) {
                openParen5853.token.trailingComments = stx5852.token.trailingComments;
            }
            acc5851.push(openParen5853);
            push5334.apply(acc5851, flatten5385(stx5852.token.inner));
            acc5851.push(closeParen5854);
            return acc5851;
        }
        stx5852.token.sm_lineNumber = typeof stx5852.token.sm_lineNumber != "undefined" ? stx5852.token.sm_lineNumber : stx5852.token.lineNumber;
        stx5852.token.sm_lineStart = typeof stx5852.token.sm_lineStart != "undefined" ? stx5852.token.sm_lineStart : stx5852.token.lineStart;
        stx5852.token.sm_range = typeof stx5852.token.sm_range != "undefined" ? stx5852.token.sm_range : stx5852.token.range;
        acc5851.push(stx5852);
        return acc5851;
    }, []);
}
exports.StringMap = StringMap5221;
exports.enforest = enforest5358;
exports.compileModule = compileModule5384;
exports.getCompiletimeValue = getCompiletimeValue5350;
exports.hasCompiletimeValue = hasCompiletimeValue5355;
exports.getSyntaxTransform = getSyntaxTransform5351;
exports.hasSyntaxTransform = hasSyntaxTransform5353;
exports.resolve = resolve5226;
exports.get_expression = get_expression5360;
exports.makeExpanderContext = makeExpanderContext5369;
exports.ExprTerm = ExprTerm5275;
exports.VariableStatementTerm = VariableStatementTerm5300;
exports.tokensToSyntax = syn5219.tokensToSyntax;
exports.syntaxToTokens = syn5219.syntaxToTokens;
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