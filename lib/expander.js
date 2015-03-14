"use strict";

var codegen5069 = require("escodegen"),
    _5070 = require("underscore"),
    parser5071 = require("./parser"),
    syn5072 = require("./syntax"),
    se5073 = require("./scopedEval"),
    StringMap5074 = require("./data/stringMap"),
    NameMap5075 = require("./data/nameMap"),
    BindingMap5076 = require("./data/bindingMap"),
    SyntaxTransform5077 = require("./data/transforms").SyntaxTransform,
    VarTransform5078 = require("./data/transforms").VarTransform,
    resolve5079 = require("./stx/resolve").resolve,
    marksof5080 = require("./stx/resolve").marksof,
    arraysEqual5081 = require("./stx/resolve").arraysEqual,
    makeImportEntries5082 = require("./mod/importEntry").makeImportEntries,
    ExportEntry5083 = require("./mod/exportEntry").ExportEntry,
    ModuleRecord5084 = require("./mod/moduleRecord").ModuleRecord,
    patternModule5085 = require("./patterns"),
    vm5086 = require("vm"),
    assert5087 = require("assert"),
    termTree5088 = require("./data/termTree");
var throwSyntaxError5089 = syn5072.throwSyntaxError;
var throwSyntaxCaseError5090 = syn5072.throwSyntaxCaseError;
var SyntaxCaseError5091 = syn5072.SyntaxCaseError;
var unwrapSyntax5092 = syn5072.unwrapSyntax;
var makeIdent5093 = syn5072.makeIdent;
var makePunc5094 = syn5072.makePunc;
var makeDelim5095 = syn5072.makeDelim;
var makeValue5096 = syn5072.makeValue;
var adjustLineContext5097 = syn5072.adjustLineContext;
var fresh5098 = syn5072.fresh;
var freshScope5099 = syn5072.freshScope;
var makeMultiToken5100 = syn5072.makeMultiToken;
var Scope5101 = syn5072.Scope;
var TermTree5102 = termTree5088.TermTree,
    EOFTerm5103 = termTree5088.EOFTerm,
    KeywordTerm5104 = termTree5088.KeywordTerm,
    PuncTerm5105 = termTree5088.PuncTerm,
    DelimiterTerm5106 = termTree5088.DelimiterTerm,
    ModuleTimeTerm5107 = termTree5088.ModuleTimeTerm,
    ModuleTerm5108 = termTree5088.ModuleTerm,
    ImportTerm5109 = termTree5088.ImportTerm,
    ImportForMacrosTerm5110 = termTree5088.ImportForMacrosTerm,
    NamedImportTerm5111 = termTree5088.NamedImportTerm,
    DefaultImportTerm5112 = termTree5088.DefaultImportTerm,
    NamespaceImportTerm5113 = termTree5088.NamespaceImportTerm,
    BindingTerm5114 = termTree5088.BindingTerm,
    QualifiedBindingTerm5115 = termTree5088.QualifiedBindingTerm,
    ExportNameTerm5116 = termTree5088.ExportNameTerm,
    ExportDefaultTerm5117 = termTree5088.ExportDefaultTerm,
    ExportDeclTerm5118 = termTree5088.ExportDeclTerm,
    CompileTimeTerm5119 = termTree5088.CompileTimeTerm,
    LetMacroTerm5120 = termTree5088.LetMacroTerm,
    MacroTerm5121 = termTree5088.MacroTerm,
    AnonMacroTerm5122 = termTree5088.AnonMacroTerm,
    ClassDeclarationTerm5123 = termTree5088.ClassDeclarationTerm,
    OperatorDefinitionTerm5124 = termTree5088.OperatorDefinitionTerm,
    VariableDeclarationTerm5125 = termTree5088.VariableDeclarationTerm,
    StatementTerm5126 = termTree5088.StatementTerm,
    EmptyTerm5127 = termTree5088.EmptyTerm,
    CatchClauseTerm5128 = termTree5088.CatchClauseTerm,
    ForStatementTerm5129 = termTree5088.ForStatementTerm,
    ReturnStatementTerm5130 = termTree5088.ReturnStatementTerm,
    ExprTerm5131 = termTree5088.ExprTerm,
    UnaryOpTerm5132 = termTree5088.UnaryOpTerm,
    PostfixOpTerm5133 = termTree5088.PostfixOpTerm,
    BinOpTerm5134 = termTree5088.BinOpTerm,
    AssignmentExpressionTerm5135 = termTree5088.AssignmentExpressionTerm,
    ConditionalExpressionTerm5136 = termTree5088.ConditionalExpressionTerm,
    NamedFunTerm5137 = termTree5088.NamedFunTerm,
    AnonFunTerm5138 = termTree5088.AnonFunTerm,
    ArrowFunTerm5139 = termTree5088.ArrowFunTerm,
    ObjDotGetTerm5140 = termTree5088.ObjDotGetTerm,
    ObjGetTerm5141 = termTree5088.ObjGetTerm,
    TemplateTerm5142 = termTree5088.TemplateTerm,
    CallTerm5143 = termTree5088.CallTerm,
    QuoteSyntaxTerm5144 = termTree5088.QuoteSyntaxTerm,
    StopQuotedTerm5145 = termTree5088.StopQuotedTerm,
    PrimaryExpressionTerm5146 = termTree5088.PrimaryExpressionTerm,
    ThisExpressionTerm5147 = termTree5088.ThisExpressionTerm,
    LitTerm5148 = termTree5088.LitTerm,
    BlockTerm5149 = termTree5088.BlockTerm,
    ArrayLiteralTerm5150 = termTree5088.ArrayLiteralTerm,
    IdTerm5151 = termTree5088.IdTerm,
    PartialTerm5152 = termTree5088.PartialTerm,
    PartialOperationTerm5153 = termTree5088.PartialOperationTerm,
    PartialExpressionTerm5154 = termTree5088.PartialExpressionTerm,
    BindingStatementTerm5155 = termTree5088.BindingStatementTerm,
    VariableStatementTerm5156 = termTree5088.VariableStatementTerm,
    LetStatementTerm5157 = termTree5088.LetStatementTerm,
    ConstStatementTerm5158 = termTree5088.ConstStatementTerm,
    ParenExpressionTerm5159 = termTree5088.ParenExpressionTerm;
var scopedEval5183 = se5073.scopedEval;
var syntaxFromToken5184 = syn5072.syntaxFromToken;
var joinSyntax5185 = syn5072.joinSyntax;
var builtinMode5186 = false;
var expandCount5187 = 0;
var maxExpands5188;
var availableModules5189;
var push5190 = Array.prototype.push;
function wrapDelim5191(towrap5247, delimSyntax5248) {
    assert5087(delimSyntax5248.isDelimiterToken(), "expecting a delimiter token");
    return syntaxFromToken5184({
        type: parser5071.Token.Delimiter,
        value: delimSyntax5248.token.value,
        inner: towrap5247,
        range: delimSyntax5248.token.range,
        startLineNumber: delimSyntax5248.token.startLineNumber,
        lineStart: delimSyntax5248.token.lineStart
    }, delimSyntax5248);
}
function getParamIdentifiers5192(argSyntax5249) {
    if (argSyntax5249.isDelimiter()) {
        return _5070.filter(argSyntax5249.token.inner, function (stx5250) {
            return stx5250.token.value !== ",";
        });
    } else if (argSyntax5249.isIdentifier()) {
        return [argSyntax5249];
    } else {
        assert5087(false, "expecting a delimiter or a single identifier for function parameters");
    }
}
function stxIsUnaryOp5193(stx5251) {
    var staticOperators5252 = ["+", "-", "~", "!", "delete", "void", "typeof", "yield", "new", "++", "--"];
    return _5070.contains(staticOperators5252, unwrapSyntax5092(stx5251));
}
function stxIsBinOp5194(stx5253) {
    var staticOperators5254 = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "<<", ">>", ">>>"];
    return _5070.contains(staticOperators5254, unwrapSyntax5092(stx5253));
}
function getUnaryOpPrec5195(op5255) {
    var operatorPrecedence5256 = {
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
    return operatorPrecedence5256[op5255];
}
function getBinaryOpPrec5196(op5257) {
    var operatorPrecedence5258 = {
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
    return operatorPrecedence5258[op5257];
}
function getBinaryOpAssoc5197(op5259) {
    var operatorAssoc5260 = {
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
    return operatorAssoc5260[op5259];
}
function stxIsAssignOp5198(stx5261) {
    var staticOperators5262 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];
    return _5070.contains(staticOperators5262, unwrapSyntax5092(stx5261));
}
function enforestImportClause5199(stx5263) {
    if (stx5263[0] && stx5263[0].isDelimiter()) {
        return {
            result: NamedImportTerm5111.create(stx5263[0]),
            rest: stx5263.slice(1)
        };
    } else if (stx5263[0] && stx5263[0].isPunctuator() && unwrapSyntax5092(stx5263[0]) === "*" && stx5263[1] && unwrapSyntax5092(stx5263[1]) === "as" && stx5263[2]) {
        return {
            result: NamespaceImportTerm5113.create(stx5263[0], stx5263[1], stx5263[2]),
            rest: stx5263.slice(3)
        };
    } else {
        return {
            result: DefaultImportTerm5112.create(stx5263[0]),
            rest: stx5263.slice(1)
        };
    }
}
function enforestImportClauseList5200(stx5264) {
    var res5265 = [];
    var clause5266 = enforestImportClause5199(stx5264);
    var rest5267 = clause5266.rest;
    res5265.push(clause5266.result);
    if (rest5267[0] && rest5267[0].isPunctuator() && unwrapSyntax5092(rest5267[0]) === ",") {
        res5265.push(rest5267[0]);
        clause5266 = enforestImportClause5199(rest5267.slice(1));
        res5265.push(clause5266.result);
        rest5267 = clause5266.rest;
    }
    return {
        result: res5265,
        rest: rest5267
    };
}
function enforestImport5201(head5268, rest5269) {
    assert5087(unwrapSyntax5092(head5268) === "import", "only call for imports");
    var clause5270 = enforestImportClauseList5200(rest5269);
    rest5269 = clause5270.rest;
    if (rest5269[0] && unwrapSyntax5092(rest5269[0]) === "from" && rest5269[1] && rest5269[1].isStringLiteral() && rest5269[2] && unwrapSyntax5092(rest5269[2]) === "for" && rest5269[3] && unwrapSyntax5092(rest5269[3]) === "macros") {
        var importRest5271;
        if (rest5269[4] && rest5269[4].isPunctuator() && rest5269[4].token.value === ";") {
            importRest5271 = rest5269.slice(5);
        } else {
            importRest5271 = rest5269.slice(4);
        }
        return {
            result: ImportForMacrosTerm5110.create(head5268, clause5270.result, rest5269[0], rest5269[1], rest5269[2], rest5269[3]),
            rest: importRest5271
        };
    } else if (rest5269[0] && unwrapSyntax5092(rest5269[0]) === "from" && rest5269[1] && rest5269[1].isStringLiteral()) {
        var importRest5271;
        if (rest5269[2] && rest5269[2].isPunctuator() && rest5269[2].token.value === ";") {
            importRest5271 = rest5269.slice(3);
        } else {
            importRest5271 = rest5269.slice(2);
        }
        return {
            result: ImportTerm5109.create(head5268, clause5270.result, rest5269[0], rest5269[1]),
            rest: importRest5271
        };
    } else {
        throwSyntaxError5089("enforest", "unrecognized import syntax", rest5269);
    }
}
function enforestVarStatement5202(stx5273, context5274, varStx5275) {
    var decls5276 = [];
    var rest5277 = stx5273;
    var rhs5278;
    if (!rest5277.length) {
        throwSyntaxError5089("enforest", "Unexpected end of input", varStx5275);
    }
    if (expandCount5187 >= maxExpands5188) {
        return null;
    }
    while (rest5277.length) {
        if (rest5277[0].isIdentifier()) {
            if (rest5277[1] && rest5277[1].isPunctuator() && rest5277[1].token.value === "=") {
                rhs5278 = get_expression5218(rest5277.slice(2), context5274);
                if (rhs5278.result == null) {
                    throwSyntaxError5089("enforest", "Unexpected token", rhs5278.rest[0]);
                }
                if (rhs5278.rest[0] && rhs5278.rest[0].isPunctuator() && rhs5278.rest[0].token.value === ",") {
                    decls5276.push(VariableDeclarationTerm5125.create(rest5277[0], rest5277[1], rhs5278.result, rhs5278.rest[0]));
                    rest5277 = rhs5278.rest.slice(1);
                    continue;
                } else {
                    decls5276.push(VariableDeclarationTerm5125.create(rest5277[0], rest5277[1], rhs5278.result, null));
                    rest5277 = rhs5278.rest;
                    break;
                }
            } else if (rest5277[1] && rest5277[1].isPunctuator() && rest5277[1].token.value === ",") {
                decls5276.push(VariableDeclarationTerm5125.create(rest5277[0], null, null, rest5277[1]));
                rest5277 = rest5277.slice(2);
            } else {
                decls5276.push(VariableDeclarationTerm5125.create(rest5277[0], null, null, null));
                rest5277 = rest5277.slice(1);
                break;
            }
        } else {
            throwSyntaxError5089("enforest", "Unexpected token", rest5277[0]);
        }
    }
    return {
        result: decls5276,
        rest: rest5277
    };
}
function enforestAssignment5203(stx5279, context5280, left5281, prevStx5282, prevTerms5283) {
    var op5284 = stx5279[0];
    var rightStx5285 = stx5279.slice(1);
    var opTerm5286 = PuncTerm5105.create(stx5279[0]);
    var opPrevStx5287 = tagWithTerm5219(opTerm5286, [stx5279[0]]).concat(tagWithTerm5219(left5281, left5281.destruct(context5280).reverse()), prevStx5282);
    var opPrevTerms5288 = [opTerm5286, left5281].concat(prevTerms5283);
    var opRes5289 = enforest5216(rightStx5285, context5280, opPrevStx5287, opPrevTerms5288);
    if (opRes5289.result) {
        if ( // Lookbehind was matched, so it may not even be a binop anymore.
        opRes5289.prevTerms.length < opPrevTerms5288.length) {
            return opRes5289;
        }
        var right5290 = opRes5289.result;
        if ( // only a binop if the right is a real expression
        // so 2+2++ will only match 2+2
        right5290.isExprTerm) {
            var term5291 = AssignmentExpressionTerm5135.create(left5281, op5284, right5290);
            return {
                result: term5291,
                rest: opRes5289.rest,
                prevStx: prevStx5282,
                prevTerms: prevTerms5283
            };
        }
    } else {
        return opRes5289;
    }
}
function enforestParenExpression5204(parens5292, context5293) {
    var argRes5294,
        enforestedArgs5295 = [],
        commas5296 = [];
    var innerTokens5297 = parens5292.token.inner;
    while (innerTokens5297.length > 0) {
        argRes5294 = enforest5216(innerTokens5297, context5293);
        if (!argRes5294.result || !argRes5294.result.isExprTerm) {
            return null;
        }
        enforestedArgs5295.push(argRes5294.result);
        innerTokens5297 = argRes5294.rest;
        if (innerTokens5297[0] && innerTokens5297[0].token.value === ",") {
            // record the comma for later
            commas5296.push(innerTokens5297[0]);
            // but dump it for the next loop turn
            innerTokens5297 = innerTokens5297.slice(1);
        } else {
            // either there are no more tokens or
            // they aren't a comma, either way we
            // are done with the loop
            break;
        }
    }
    return innerTokens5297.length ? null : ParenExpressionTerm5159.create(enforestedArgs5295, parens5292, commas5296);
}
function resolveFast5205(stx5298, context5299, phase5300) {
    var name5301 = unwrapSyntax5092(stx5298);
    if (context5299.env.hasName(name5301) || context5299.store.hasName(name5301)) {
        return resolve5079(stx5298, phase5300);
    }
    return name5301;
}
function CompiletimeValue5206(trans5302, module5303, phase5304) {
    this.trans = trans5302;
    this.module = module5303;
    this.phase = phase5304;
}
function RuntimeValue5207(trans5305, module5306, phase5307) {
    this.trans = trans5305;
    this.module = module5306;
    this.phase = phase5307;
}
function getCompiletimeValue5208(stx5308, context5309, phase5310) {
    var store5311,
        env5312 = context5309.env.get(stx5308, phase5310);
    if (env5312 !== null) {
        return env5312.trans;
    } else {
        store5311 = context5309.store.getWithModule(stx5308, phase5310);
        return store5311 !== null ? store5311.trans : null;
    }
}
function getSyntaxTransform5209(stx5313, context5314, phase5315) {
    var t5316 = getCompiletimeValue5208(stx5313, context5314, phase5315);
    if (t5316 && t5316 instanceof VarTransform5078) {
        return null;
    }
    return t5316;
}
function hasSyntaxTransform5210(stx5317, context5318, phase5319) {
    return getSyntaxTransform5209(stx5317, context5318, phase5319) !== null;
}
function hasCompiletimeValue5211(stx5320, context5321, phase5322) {
    return context5321.env.has(stx5320, phase5322) || context5321.store.has(stx5320, phase5322);
}
function expandMacro5212(stx5323, context5324, opCtx5325, opType5326, macroObj5327) {
    var // pull the macro transformer out the environment
    head5328 = stx5323[0];
    var rest5329 = stx5323.slice(1);
    macroObj5327 = macroObj5327 || getSyntaxTransform5209(stx5323, context5324, context5324.phase);
    var stxArg5330 = rest5329.slice(macroObj5327.fullName.length - 1);
    var transformer5331;
    if (opType5326 != null) {
        assert5087(opType5326 === "binary" || opType5326 === "unary", "operator type should be either unary or binary: " + opType5326);
        transformer5331 = macroObj5327[opType5326].fn;
    } else {
        transformer5331 = macroObj5327.fn;
    }
    assert5087(typeof transformer5331 === "function", "Macro transformer not bound for: " + head5328.token.value);
    var transformerContext5332 = makeExpanderContext5227(_5070.defaults({ mark: freshScope5099(context5324.bindings) }, context5324));
    // apply the transformer
    var rt5333;
    try {
        rt5333 = transformer5331([head5328].concat(stxArg5330), transformerContext5332, opCtx5325.prevStx, opCtx5325.prevTerms);
    } catch (e5334) {
        if (e5334 instanceof SyntaxCaseError5091) {
            var // add a nicer error for syntax case
            nameStr5335 = macroObj5327.fullName.map(function (stx5336) {
                return stx5336.token.value;
            }).join("");
            if (opType5326 != null) {
                var argumentString5337 = "`" + stxArg5330.slice(0, 5).map(function (stx5338) {
                    return stx5338.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5089("operator", "Operator `" + nameStr5335 + "` could not be matched with " + argumentString5337, head5328);
            } else {
                var argumentString5337 = "`" + stxArg5330.slice(0, 5).map(function (stx5340) {
                    return stx5340.token.value;
                }).join(" ") + "...`";
                throwSyntaxError5089("macro", "Macro `" + nameStr5335 + "` could not be matched with " + argumentString5337, head5328);
            }
        } else {
            // just rethrow it
            throw e5334;
        }
    }
    if (!builtinMode5186 && !macroObj5327.builtin) {
        expandCount5187++;
    }
    if (!Array.isArray(rt5333.result)) {
        throwSyntaxError5089("enforest", "Macro must return a syntax array", stx5323[0]);
    }
    if (rt5333.result.length > 0) {
        var adjustedResult5341 = adjustLineContext5097(rt5333.result, head5328);
        if (stx5323[0].token.leadingComments) {
            if (adjustedResult5341[0].token.leadingComments) {
                adjustedResult5341[0].token.leadingComments = adjustedResult5341[0].token.leadingComments.concat(head5328.token.leadingComments);
            } else {
                adjustedResult5341[0].token.leadingComments = head5328.token.leadingComments;
            }
        }
        rt5333.result = adjustedResult5341;
    }
    return rt5333;
}
function comparePrec5213(left5342, right5343, assoc5344) {
    if (assoc5344 === "left") {
        return left5342 <= right5343;
    }
    return left5342 < right5343;
}
function toksAdjacent5214(a5345, b5346) {
    var arange5347 = a5345.token.sm_range || a5345.token.range || a5345.token.endRange;
    var brange5348 = b5346.token.sm_range || b5346.token.range || b5346.token.endRange;
    return arange5347 && brange5348 && arange5347[1] === brange5348[0];
}
function syntaxInnerValuesEq5215(synA5349, synB5350) {
    var a5351 = synA5349.token.inner,
        b5352 = synB5350.token.inner;
    return (function (ziped5353) {
        return _5070.all(ziped5353, function (pair5354) {
            return unwrapSyntax5092(pair5354[0]) === unwrapSyntax5092(pair5354[1]);
        });
    })(a5351.length === b5352.length && _5070.zip(a5351, b5352));
}
function enforest5216(toks5355, context5356, prevStx5357, prevTerms5358) {
    assert5087(toks5355.length > 0, "enforest assumes there are tokens to work with");
    prevStx5357 = prevStx5357 || [];
    prevTerms5358 = prevTerms5358 || [];
    if (expandCount5187 >= maxExpands5188) {
        return {
            result: null,
            rest: toks5355
        };
    }
    function step5359(head5360, rest5361, opCtx5362) {
        var innerTokens5363;
        assert5087(Array.isArray(rest5361), "result must at least be an empty array");
        if (head5360.isTermTree) {
            var isCustomOp5365 = false;
            var uopMacroObj5366;
            var uopSyntax5367;
            if (head5360.isPuncTerm || head5360.isKeywordTerm || head5360.isIdTerm) {
                if (head5360.isPuncTerm) {
                    uopSyntax5367 = head5360.punc;
                } else if (head5360.isKeywordTerm) {
                    uopSyntax5367 = head5360.keyword;
                } else if (head5360.isIdTerm) {
                    uopSyntax5367 = head5360.id;
                }
                uopMacroObj5366 = getSyntaxTransform5209([uopSyntax5367].concat(rest5361), context5356, context5356.phase);
                isCustomOp5365 = uopMacroObj5366 && uopMacroObj5366.isOp;
            }
            // look up once (we want to check multiple properties on bopMacroObj
            // without repeatedly calling getValueInEnv)
            var bopMacroObj5368;
            if (rest5361[0] && rest5361[1]) {
                bopMacroObj5368 = getSyntaxTransform5209(rest5361, context5356, context5356.phase);
            }
            if ( // unary operator
            isCustomOp5365 && uopMacroObj5366.unary || uopSyntax5367 && stxIsUnaryOp5193(uopSyntax5367)) {
                var uopPrec5369;
                if (isCustomOp5365 && uopMacroObj5366.unary) {
                    uopPrec5369 = uopMacroObj5366.unary.prec;
                } else {
                    uopPrec5369 = getUnaryOpPrec5195(unwrapSyntax5092(uopSyntax5367));
                }
                var opRest5370 = rest5361;
                var uopMacroName5371;
                if (uopMacroObj5366) {
                    uopMacroName5371 = [uopSyntax5367].concat(rest5361.slice(0, uopMacroObj5366.fullName.length - 1));
                    opRest5370 = rest5361.slice(uopMacroObj5366.fullName.length - 1);
                }
                var leftLeft5372 = opCtx5362.prevTerms[0] && opCtx5362.prevTerms[0].isPartialTerm ? opCtx5362.prevTerms[0] : null;
                var unopTerm5373 = PartialOperationTerm5153.create(head5360, leftLeft5372);
                var unopPrevStx5374 = tagWithTerm5219(unopTerm5373, head5360.destruct(context5356).reverse()).concat(opCtx5362.prevStx);
                var unopPrevTerms5375 = [unopTerm5373].concat(opCtx5362.prevTerms);
                var unopOpCtx5376 = _5070.extend({}, opCtx5362, {
                    combine: function combine(t5377) {
                        if (t5377.isExprTerm) {
                            if (isCustomOp5365 && uopMacroObj5366.unary) {
                                var rt5378 = expandMacro5212(uopMacroName5371.concat(t5377.destruct(context5356)), context5356, opCtx5362, "unary");
                                var newt5379 = get_expression5218(rt5378.result, context5356);
                                assert5087(newt5379.rest.length === 0, "should never have left over syntax");
                                return opCtx5362.combine(newt5379.result);
                            }
                            return opCtx5362.combine(UnaryOpTerm5132.create(uopSyntax5367, t5377));
                        } else {
                            // not actually an expression so don't create
                            // a UnaryOp term just return with the punctuator
                            return opCtx5362.combine(head5360);
                        }
                    },
                    prec: uopPrec5369,
                    prevStx: unopPrevStx5374,
                    prevTerms: unopPrevTerms5375,
                    op: unopTerm5373
                });
                return step5359(opRest5370[0], opRest5370.slice(1), unopOpCtx5376);
            } else if (head5360.isExprTerm && (rest5361[0] && rest5361[1] && (stxIsBinOp5194(rest5361[0]) && !bopMacroObj5368 || bopMacroObj5368 && bopMacroObj5368.isOp && bopMacroObj5368.binary))) {
                var opRes5380;
                var op5381 = rest5361[0];
                var left5382 = head5360;
                var rightStx5383 = rest5361.slice(1);
                var leftLeft5372 = opCtx5362.prevTerms[0] && opCtx5362.prevTerms[0].isPartialTerm ? opCtx5362.prevTerms[0] : null;
                var leftTerm5385 = PartialExpressionTerm5154.create(head5360.destruct(context5356), leftLeft5372, function () {
                    return step5359(head5360, [], opCtx5362);
                });
                var opTerm5386 = PartialOperationTerm5153.create(op5381, leftTerm5385);
                var opPrevStx5387 = tagWithTerm5219(opTerm5386, [rest5361[0]]).concat(tagWithTerm5219(leftTerm5385, head5360.destruct(context5356)).reverse(), opCtx5362.prevStx);
                var opPrevTerms5388 = [opTerm5386, leftTerm5385].concat(opCtx5362.prevTerms);
                var isCustomOp5365 = bopMacroObj5368 && bopMacroObj5368.isOp && bopMacroObj5368.binary;
                var bopPrec5390;
                var bopAssoc5391;
                if (isCustomOp5365 && bopMacroObj5368.binary) {
                    bopPrec5390 = bopMacroObj5368.binary.prec;
                    bopAssoc5391 = bopMacroObj5368.binary.assoc;
                } else {
                    bopPrec5390 = getBinaryOpPrec5196(unwrapSyntax5092(op5381));
                    bopAssoc5391 = getBinaryOpAssoc5197(unwrapSyntax5092(op5381));
                }
                assert5087(bopPrec5390 !== undefined, "expecting a precedence for operator: " + op5381);
                var newStack5392;
                if (comparePrec5213(bopPrec5390, opCtx5362.prec, bopAssoc5391)) {
                    var bopCtx5396 = opCtx5362;
                    var combResult5364 = opCtx5362.combine(head5360);
                    if (opCtx5362.stack.length > 0) {
                        return step5359(combResult5364.term, rest5361, opCtx5362.stack[0]);
                    }
                    left5382 = combResult5364.term;
                    newStack5392 = opCtx5362.stack;
                    opPrevStx5387 = combResult5364.prevStx;
                    opPrevTerms5388 = combResult5364.prevTerms;
                } else {
                    newStack5392 = [opCtx5362].concat(opCtx5362.stack);
                }
                assert5087(opCtx5362.combine !== undefined, "expecting a combine function");
                var opRightStx5393 = rightStx5383;
                var bopMacroName5394;
                if (isCustomOp5365) {
                    bopMacroName5394 = rest5361.slice(0, bopMacroObj5368.fullName.length);
                    opRightStx5393 = rightStx5383.slice(bopMacroObj5368.fullName.length - 1);
                }
                var bopOpCtx5395 = _5070.extend({}, opCtx5362, {
                    combine: function combine(right5398) {
                        if (right5398.isExprTerm) {
                            if (isCustomOp5365 && bopMacroObj5368.binary) {
                                var leftStx5399 = left5382.destruct(context5356);
                                var rightStx5400 = right5398.destruct(context5356);
                                var rt5401 = expandMacro5212(bopMacroName5394.concat(syn5072.makeDelim("()", leftStx5399, leftStx5399[0]), syn5072.makeDelim("()", rightStx5400, rightStx5400[0])), context5356, opCtx5362, "binary");
                                var newt5402 = get_expression5218(rt5401.result, context5356);
                                assert5087(newt5402.rest.length === 0, "should never have left over syntax");
                                return {
                                    term: newt5402.result,
                                    prevStx: opPrevStx5387,
                                    prevTerms: opPrevTerms5388
                                };
                            }
                            return {
                                term: BinOpTerm5134.create(left5382, op5381, right5398),
                                prevStx: opPrevStx5387,
                                prevTerms: opPrevTerms5388
                            };
                        } else {
                            return {
                                term: head5360,
                                prevStx: opPrevStx5387,
                                prevTerms: opPrevTerms5388
                            };
                        }
                    },
                    prec: bopPrec5390,
                    op: opTerm5386,
                    stack: newStack5392,
                    prevStx: opPrevStx5387,
                    prevTerms: opPrevTerms5388
                });
                return step5359(opRightStx5393[0], opRightStx5393.slice(1), bopOpCtx5395);
            } else if (head5360.isExprTerm && (rest5361[0] && rest5361[0].isDelimiter() && rest5361[0].token.value === "()")) {
                var parenRes5403 = enforestParenExpression5204(rest5361[0], context5356);
                if (parenRes5403) {
                    return step5359(CallTerm5143.create(head5360, parenRes5403), rest5361.slice(1), opCtx5362);
                }
            } else if (head5360.isExprTerm && (rest5361[0] && resolveFast5205(rest5361[0], context5356, context5356.phase) === "?")) {
                var question5404 = rest5361[0];
                var condRes5405 = enforest5216(rest5361.slice(1), context5356);
                if (condRes5405.result) {
                    var truExpr5406 = condRes5405.result;
                    var condRight5407 = condRes5405.rest;
                    if (truExpr5406.isExprTerm && condRight5407[0] && resolveFast5205(condRight5407[0], context5356, context5356.phase) === ":") {
                        var colon5408 = condRight5407[0];
                        var flsRes5409 = enforest5216(condRight5407.slice(1), context5356);
                        var flsExpr5410 = flsRes5409.result;
                        if (flsExpr5410.isExprTerm) {
                            if ( // operators are combined before the ternary
                            opCtx5362.prec >= 4) {
                                var // ternary is like a operator with prec 4
                                headResult5411 = opCtx5362.combine(head5360);
                                var condTerm5412 = ConditionalExpressionTerm5136.create(headResult5411.term, question5404, truExpr5406, colon5408, flsExpr5410);
                                if (opCtx5362.stack.length > 0) {
                                    return step5359(condTerm5412, flsRes5409.rest, opCtx5362.stack[0]);
                                } else {
                                    return {
                                        result: condTerm5412,
                                        rest: flsRes5409.rest,
                                        prevStx: headResult5411.prevStx,
                                        prevTerms: headResult5411.prevTerms
                                    };
                                }
                            } else {
                                var condTerm5412 = ConditionalExpressionTerm5136.create(head5360, question5404, truExpr5406, colon5408, flsExpr5410);
                                return step5359(condTerm5412, flsRes5409.rest, opCtx5362);
                            }
                        }
                    }
                }
            } else if (head5360.isDelimiterTerm && head5360.delim.token.value === "()" && rest5361[0] && rest5361[0].isPunctuator() && resolveFast5205(rest5361[0], context5356, context5356.phase) === "=>") {
                var arrowRes5414 = enforest5216(rest5361.slice(1), context5356);
                if (arrowRes5414.result && arrowRes5414.result.isExprTerm) {
                    return step5359(ArrowFunTerm5139.create(head5360.delim, rest5361[0], arrowRes5414.result.destruct(context5356)), arrowRes5414.rest, opCtx5362);
                } else {
                    throwSyntaxError5089("enforest", "Body of arrow function must be an expression", rest5361.slice(1));
                }
            } else if (head5360.isIdTerm && rest5361[0] && rest5361[0].isPunctuator() && resolveFast5205(rest5361[0], context5356, context5356.phase) === "=>") {
                var res5415 = enforest5216(rest5361.slice(1), context5356);
                if (res5415.result && res5415.result.isExprTerm) {
                    return step5359(ArrowFunTerm5139.create(head5360.id, rest5361[0], res5415.result.destruct(context5356)), res5415.rest, opCtx5362);
                } else {
                    throwSyntaxError5089("enforest", "Body of arrow function must be an expression", rest5361.slice(1));
                }
            } else if (head5360.isDelimiterTerm && head5360.delim.token.value === "()") {
                if ( // empty parens are acceptable but enforest
                // doesn't accept empty arrays so short
                // circuit here
                head5360.delim.token.inner.length === 0) {
                    return step5359(ParenExpressionTerm5159.create([EmptyTerm5127.create()], head5360.delim, []), rest5361, opCtx5362);
                } else {
                    var parenRes5403 = enforestParenExpression5204(head5360.delim, context5356);
                    if (parenRes5403) {
                        return step5359(parenRes5403, rest5361, opCtx5362);
                    }
                }
            } else if (head5360.isExprTerm && ((head5360.isIdTerm || head5360.isObjGetTerm || head5360.isObjDotGetTerm || head5360.isThisExpressionTerm) && rest5361[0] && rest5361[1] && !bopMacroObj5368 && stxIsAssignOp5198(rest5361[0]))) {
                var opRes5380 = enforestAssignment5203(rest5361, context5356, head5360, prevStx5357, prevTerms5358);
                if (opRes5380 && opRes5380.result) {
                    return step5359(opRes5380.result, opRes5380.rest, _5070.extend({}, opCtx5362, {
                        prevStx: opRes5380.prevStx,
                        prevTerms: opRes5380.prevTerms
                    }));
                }
            } else if (head5360.isExprTerm && (rest5361[0] && (unwrapSyntax5092(rest5361[0]) === "++" || unwrapSyntax5092(rest5361[0]) === "--"))) {
                if ( // Check if the operator is a macro first.
                hasSyntaxTransform5210(rest5361[0], context5356, context5356.phase)) {
                    var headStx5418 = tagWithTerm5219(head5360, head5360.destruct(context5356).reverse());
                    var opPrevStx5387 = headStx5418.concat(prevStx5357);
                    var opPrevTerms5388 = [head5360].concat(prevTerms5358);
                    var opRes5380 = enforest5216(rest5361, context5356, opPrevStx5387, opPrevTerms5388);
                    if (opRes5380.prevTerms.length < opPrevTerms5388.length) {
                        return opRes5380;
                    } else if (opRes5380.result) {
                        return step5359(head5360, opRes5380.result.destruct(context5356).concat(opRes5380.rest), opCtx5362);
                    }
                }
                return step5359(PostfixOpTerm5133.create(head5360, rest5361[0]), rest5361.slice(1), opCtx5362);
            } else if (head5360.isExprTerm && (rest5361[0] && rest5361[0].token.value === "[]")) {
                return step5359(ObjGetTerm5141.create(head5360, DelimiterTerm5106.create(rest5361[0])), rest5361.slice(1), opCtx5362);
            } else if (head5360.isExprTerm && (rest5361[0] && unwrapSyntax5092(rest5361[0]) === "." && !hasSyntaxTransform5210(rest5361[0], context5356, context5356.phase) && rest5361[1] && (rest5361[1].isIdentifier() || rest5361[1].isKeyword()))) {
                if ( // Check if the identifier is a macro first.
                hasSyntaxTransform5210(rest5361[1], context5356, context5356.phase)) {
                    var headStx5418 = tagWithTerm5219(head5360, head5360.destruct(context5356).reverse());
                    var dotTerm5423 = PuncTerm5105.create(rest5361[0]);
                    var dotTerms5424 = [dotTerm5423].concat(head5360, prevTerms5358);
                    var dotStx5425 = tagWithTerm5219(dotTerm5423, [rest5361[0]]).concat(headStx5418, prevStx5357);
                    var dotRes5426 = enforest5216(rest5361.slice(1), context5356, dotStx5425, dotTerms5424);
                    if (dotRes5426.prevTerms.length < dotTerms5424.length) {
                        return dotRes5426;
                    } else if (dotRes5426.result) {
                        return step5359(head5360, [rest5361[0]].concat(dotRes5426.result.destruct(context5356), dotRes5426.rest), opCtx5362);
                    }
                }
                return step5359(ObjDotGetTerm5140.create(head5360, rest5361[0], rest5361[1]), rest5361.slice(2), opCtx5362);
            } else if (head5360.isDelimiterTerm && head5360.delim.token.value === "[]") {
                return step5359(ArrayLiteralTerm5150.create(head5360), rest5361, opCtx5362);
            } else if (head5360.isDelimiterTerm && head5360.delim.token.value === "{}") {
                return step5359(BlockTerm5149.create(head5360), rest5361, opCtx5362);
            } else if (head5360.isIdTerm && unwrapSyntax5092(head5360.id) === "#quoteSyntax" && rest5361[0] && rest5361[0].token.value === "{}") {
                return step5359(QuoteSyntaxTerm5144.create(rest5361[0]), rest5361.slice(1), opCtx5362);
            } else if (head5360.isKeywordTerm && unwrapSyntax5092(head5360.keyword) === "return") {
                if (rest5361[0] && rest5361[0].token.lineNumber === head5360.keyword.token.lineNumber) {
                    var returnPrevStx5427 = tagWithTerm5219(head5360, head5360.destruct(context5356)).concat(opCtx5362.prevStx);
                    var returnPrevTerms5428 = [head5360].concat(opCtx5362.prevTerms);
                    var returnExpr5429 = enforest5216(rest5361, context5356, returnPrevStx5427, returnPrevTerms5428);
                    if (returnExpr5429.prevTerms.length < opCtx5362.prevTerms.length) {
                        return returnExpr5429;
                    }
                    if (returnExpr5429.result.isExprTerm) {
                        return step5359(ReturnStatementTerm5130.create(head5360, returnExpr5429.result), returnExpr5429.rest, opCtx5362);
                    }
                } else {
                    return step5359(ReturnStatementTerm5130.create(head5360, EmptyTerm5127.create()), rest5361, opCtx5362);
                }
            } else if (head5360.isKeywordTerm && unwrapSyntax5092(head5360.keyword) === "let") {
                var normalizedName5430;
                if (rest5361[0] && rest5361[0].isDelimiter() && rest5361[0].token.value === "()") {
                    normalizedName5430 = rest5361[0];
                } else {
                    normalizedName5430 = syn5072.makeDelim("()", [rest5361[0]], rest5361[0]);
                }
                var lsRes5431 = enforestVarStatement5202(rest5361, context5356, head5360.keyword);
                if (lsRes5431 && lsRes5431.result) {
                    return step5359(LetStatementTerm5157.create(head5360, lsRes5431.result), lsRes5431.rest, opCtx5362);
                }
            } else if (head5360.isKeywordTerm && unwrapSyntax5092(head5360.keyword) === "var" && rest5361[0]) {
                var vsRes5432 = enforestVarStatement5202(rest5361, context5356, head5360.keyword);
                if (vsRes5432 && vsRes5432.result) {
                    return step5359(VariableStatementTerm5156.create(head5360, vsRes5432.result), vsRes5432.rest, opCtx5362);
                }
            } else if (head5360.isKeywordTerm && unwrapSyntax5092(head5360.keyword) === "const" && rest5361[0]) {
                var csRes5433 = enforestVarStatement5202(rest5361, context5356, head5360.keyword);
                if (csRes5433 && csRes5433.result) {
                    return step5359(ConstStatementTerm5158.create(head5360, csRes5433.result), csRes5433.rest, opCtx5362);
                }
            } else if (head5360.isKeywordTerm && unwrapSyntax5092(head5360.keyword) === "for" && rest5361[0] && rest5361[0].token.value === "()") {
                return step5359(ForStatementTerm5129.create(head5360.keyword, rest5361[0]), rest5361.slice(1), opCtx5362);
            }
        } else {
            assert5087(head5360 && head5360.token, "assuming head is a syntax object");
            var macroObj5434 = expandCount5187 < maxExpands5188 && getSyntaxTransform5209([head5360].concat(rest5361), context5356, context5356.phase);
            if (head5360 && context5356.stopMap.has(resolve5079(head5360, context5356.phase))) {
                return step5359(StopQuotedTerm5145.create(head5360, rest5361[0]), rest5361.slice(1), opCtx5362);
            } else if (macroObj5434 && typeof macroObj5434.fn === "function" && !macroObj5434.isOp) {
                var rt5435 = expandMacro5212([head5360].concat(rest5361), context5356, opCtx5362, null, macroObj5434);
                var newOpCtx5436 = opCtx5362;
                if (rt5435.prevTerms && rt5435.prevTerms.length < opCtx5362.prevTerms.length) {
                    newOpCtx5436 = rewindOpCtx5217(opCtx5362, rt5435);
                }
                if (rt5435.result.length > 0) {
                    return step5359(rt5435.result[0], rt5435.result.slice(1).concat(rt5435.rest), newOpCtx5436);
                } else {
                    return step5359(EmptyTerm5127.create(), rt5435.rest, newOpCtx5436);
                }
            } else if (head5360.isIdentifier() && unwrapSyntax5092(head5360) === "macro" && resolve5079(head5360, context5356.phase) === "macro" && rest5361[0] && rest5361[0].token.value === "{}") {
                return step5359(AnonMacroTerm5122.create(rest5361[0].token.inner), rest5361.slice(1), opCtx5362);
            } else if (head5360.isIdentifier() && unwrapSyntax5092(head5360) === "stxrec" && resolve5079(head5360, context5356.phase) === "stxrec") {
                var normalizedName5430;
                if (rest5361[0] && rest5361[0].isDelimiter() && rest5361[0].token.value === "()") {
                    normalizedName5430 = rest5361[0];
                } else {
                    normalizedName5430 = syn5072.makeDelim("()", [rest5361[0]], rest5361[0]);
                }
                if (rest5361[1] && rest5361[1].isDelimiter()) {
                    return step5359(MacroTerm5121.create(normalizedName5430, rest5361[1].token.inner), rest5361.slice(2), opCtx5362);
                } else {
                    throwSyntaxError5089("enforest", "Macro declaration must include body", rest5361[1]);
                }
            } else if (head5360.isIdentifier() && head5360.token.value === "unaryop" && rest5361[0] && rest5361[0].isDelimiter() && rest5361[0].token.value === "()" && rest5361[1] && rest5361[1].isNumericLiteral() && rest5361[2] && rest5361[2].isDelimiter() && rest5361[2] && rest5361[2].token.value === "{}") {
                var trans5438 = enforest5216(rest5361[2].token.inner, context5356);
                return step5359(OperatorDefinitionTerm5124.create(syn5072.makeValue("unary", head5360), rest5361[0], rest5361[1], null, trans5438.result.body), rest5361.slice(3), opCtx5362);
            } else if (head5360.isIdentifier() && head5360.token.value === "binaryop" && rest5361[0] && rest5361[0].isDelimiter() && rest5361[0].token.value === "()" && rest5361[1] && rest5361[1].isNumericLiteral() && rest5361[2] && rest5361[2].isIdentifier() && rest5361[3] && rest5361[3].isDelimiter() && rest5361[3] && rest5361[3].token.value === "{}") {
                var trans5438 = enforest5216(rest5361[3].token.inner, context5356);
                return step5359(OperatorDefinitionTerm5124.create(syn5072.makeValue("binary", head5360), rest5361[0], rest5361[1], rest5361[2], trans5438.result.body), rest5361.slice(4), opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "function" && rest5361[0] && rest5361[0].isIdentifier() && rest5361[1] && rest5361[1].isDelimiter() && rest5361[1].token.value === "()" && rest5361[2] && rest5361[2].isDelimiter() && rest5361[2].token.value === "{}") {
                rest5361[1].token.inner = rest5361[1].token.inner;
                rest5361[2].token.inner = rest5361[2].token.inner;
                return step5359(NamedFunTerm5137.create(head5360, null, rest5361[0], rest5361[1], rest5361[2]), rest5361.slice(3), opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "function" && rest5361[0] && rest5361[0].isPunctuator() && rest5361[0].token.value === "*" && rest5361[1] && rest5361[1].isIdentifier() && rest5361[2] && rest5361[2].isDelimiter() && rest5361[2].token.value === "()" && rest5361[3] && rest5361[3].isDelimiter() && rest5361[3].token.value === "{}") {
                return step5359(NamedFunTerm5137.create(head5360, rest5361[0], rest5361[1], rest5361[2], rest5361[3]), rest5361.slice(4), opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "function" && rest5361[0] && rest5361[0].isDelimiter() && rest5361[0].token.value === "()" && rest5361[1] && rest5361[1].isDelimiter() && rest5361[1].token.value === "{}") {
                return step5359(AnonFunTerm5138.create(head5360, null, rest5361[0], rest5361[1]), rest5361.slice(2), opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "function" && rest5361[0] && rest5361[0].isPunctuator() && rest5361[0].token.value === "*" && rest5361[1] && rest5361[1].isDelimiter() && rest5361[1].token.value === "()" && rest5361[2] && rest5361[2].isDelimiter && rest5361[2].token.value === "{}") {
                rest5361[1].token.inner = rest5361[1].token.inner;
                rest5361[2].token.inner = rest5361[2].token.inner;
                return step5359(AnonFunTerm5138.create(head5360, rest5361[0], rest5361[1], rest5361[2]), rest5361.slice(3), opCtx5362);
            } else if ((head5360.isDelimiter() && head5360.token.value === "()" || head5360.isIdentifier()) && rest5361[0] && rest5361[0].isPunctuator() && resolveFast5205(rest5361[0], context5356, context5356.phase) === "=>" && rest5361[1] && rest5361[1].isDelimiter() && rest5361[1].token.value === "{}") {
                return step5359(ArrowFunTerm5139.create(head5360, rest5361[0], rest5361[1]), rest5361.slice(2), opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "catch" && rest5361[0] && rest5361[0].isDelimiter() && rest5361[0].token.value === "()" && rest5361[1] && rest5361[1].isDelimiter() && rest5361[1].token.value === "{}") {
                rest5361[0].token.inner = rest5361[0].token.inner;
                rest5361[1].token.inner = rest5361[1].token.inner;
                return step5359(CatchClauseTerm5128.create(head5360, rest5361[0], rest5361[1]), rest5361.slice(2), opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "this") {
                return step5359(ThisExpressionTerm5147.create(head5360), rest5361, opCtx5362);
            } else if (head5360.isNumericLiteral() || head5360.isStringLiteral() || head5360.isBooleanLiteral() || head5360.isRegularExpression() || head5360.isNullLiteral()) {
                return step5359(LitTerm5148.create(head5360), rest5361, opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "import") {
                var imp5440 = enforestImport5201(head5360, rest5361);
                return step5359(imp5440.result, imp5440.rest, opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "export" && rest5361[0] && rest5361[0].isDelimiter()) {
                return step5359(ExportNameTerm5116.create(head5360, rest5361[0]), rest5361.slice(1), opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "export" && rest5361[0] && rest5361[0].isKeyword() && unwrapSyntax5092(rest5361[0]) === "default" && rest5361[1]) {
                var res5415 = enforest5216(rest5361.slice(1), context5356);
                return step5359(ExportDefaultTerm5117.create(head5360, rest5361[0], res5415.result), res5415.rest, opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "export" && rest5361[0]) {
                var res5415 = enforest5216(rest5361, context5356);
                return step5359(ExportDeclTerm5118.create(head5360, res5415.result), res5415.rest, opCtx5362);
            } else if (head5360.isIdentifier()) {
                return step5359(IdTerm5151.create(head5360), rest5361, opCtx5362);
            } else if (head5360.isPunctuator()) {
                return step5359(PuncTerm5105.create(head5360), rest5361, opCtx5362);
            } else if (head5360.isKeyword() && unwrapSyntax5092(head5360) === "with") {
                throwSyntaxError5089("enforest", "with is not supported in sweet.js", head5360);
            } else if (head5360.isKeyword()) {
                return step5359(KeywordTerm5104.create(head5360), rest5361, opCtx5362);
            } else if (head5360.isDelimiter()) {
                return step5359(DelimiterTerm5106.create(head5360), rest5361, opCtx5362);
            } else if (head5360.isTemplate()) {
                return step5359(TemplateTerm5142.create(head5360), rest5361, opCtx5362);
            } else if (head5360.isEOF()) {
                assert5087(rest5361.length === 0, "nothing should be after an EOF");
                return step5359(EOFTerm5103.create(head5360), [], opCtx5362);
            } else {
                // todo: are we missing cases?
                assert5087(false, "not implemented");
            }
        }
        if ( // Potentially an infix macro
        // This should only be invoked on runtime syntax terms
        !head5360.isMacroTerm && !head5360.isLetMacroTerm && !head5360.isAnonMacroTerm && !head5360.isOperatorDefinitionTerm && rest5361.length && hasSyntaxTransform5210(rest5361, context5356, context5356.phase) && getSyntaxTransform5209(rest5361, context5356, context5356.phase).isOp === false) {
            var infLeftTerm5443 = opCtx5362.prevTerms[0] && opCtx5362.prevTerms[0].isPartialTerm ? opCtx5362.prevTerms[0] : null;
            var infTerm5444 = PartialExpressionTerm5154.create(head5360.destruct(context5356), infLeftTerm5443, function () {
                return step5359(head5360, [], opCtx5362);
            });
            var infPrevStx5445 = tagWithTerm5219(infTerm5444, head5360.destruct(context5356)).reverse().concat(opCtx5362.prevStx);
            var infPrevTerms5446 = [infTerm5444].concat(opCtx5362.prevTerms);
            var infRes5447 = expandMacro5212(rest5361, context5356, {
                prevStx: infPrevStx5445,
                prevTerms: infPrevTerms5446
            });
            if (infRes5447.prevTerms && infRes5447.prevTerms.length < infPrevTerms5446.length) {
                var infOpCtx5448 = rewindOpCtx5217(opCtx5362, infRes5447);
                return step5359(infRes5447.result[0], infRes5447.result.slice(1).concat(infRes5447.rest), infOpCtx5448);
            } else {
                return step5359(head5360, infRes5447.result.concat(infRes5447.rest), opCtx5362);
            }
        }
        var // done with current step so combine and continue on
        combResult5364 = opCtx5362.combine(head5360);
        if (opCtx5362.stack.length === 0) {
            return {
                result: combResult5364.term,
                rest: rest5361,
                prevStx: combResult5364.prevStx,
                prevTerms: combResult5364.prevTerms
            };
        } else {
            return step5359(combResult5364.term, rest5361, opCtx5362.stack[0]);
        }
    }
    return step5359(toks5355[0], toks5355.slice(1), {
        combine: function combine(t5449) {
            return {
                term: t5449,
                prevStx: prevStx5357,
                prevTerms: prevTerms5358
            };
        },
        prec: 0,
        stack: [],
        op: null,
        prevStx: prevStx5357,
        prevTerms: prevTerms5358
    });
}
function rewindOpCtx5217(opCtx5450, res5451) {
    if ( // If we've consumed all pending operators, we can just start over.
    // It's important that we always thread the new prevStx and prevTerms
    // through, otherwise the old ones will still persist.
    !res5451.prevTerms.length || !res5451.prevTerms[0].isPartialTerm) {
        return _5070.extend({}, opCtx5450, {
            combine: function combine(t5455) {
                return {
                    term: t5455,
                    prevStx: res5451.prevStx,
                    prevTerms: res5451.prevTerms
                };
            },
            prec: 0,
            op: null,
            stack: [],
            prevStx: res5451.prevStx,
            prevTerms: res5451.prevTerms
        });
    }
    // To rewind, we need to find the first (previous) pending operator. It
    // acts as a marker in the opCtx to let us know how far we need to go
    // back.
    var op5452 = null;
    for (var i5453 = 0; i5453 < res5451.prevTerms.length; i5453++) {
        if (!res5451.prevTerms[i5453].isPartialTerm) {
            break;
        }
        if (res5451.prevTerms[i5453].isPartialOperationTerm) {
            op5452 = res5451.prevTerms[i5453];
            break;
        }
    }
    if ( // If the op matches the current opCtx, we don't need to rewind
    // anything, but we still need to persist the prevStx and prevTerms.
    opCtx5450.op === op5452) {
        return _5070.extend({}, opCtx5450, {
            prevStx: res5451.prevStx,
            prevTerms: res5451.prevTerms
        });
    }
    for (var i5453 = 0; i5453 < opCtx5450.stack.length; i5453++) {
        if (opCtx5450.stack[i5453].op === op5452) {
            return _5070.extend({}, opCtx5450.stack[i5453], {
                prevStx: res5451.prevStx,
                prevTerms: res5451.prevTerms
            });
        }
    }
    assert5087(false, "Rewind failed.");
}
function get_expression5218(stx5456, context5457) {
    if (stx5456[0].term) {
        for (var termLen5459 = 1; termLen5459 < stx5456.length; termLen5459++) {
            if (stx5456[termLen5459].term !== stx5456[0].term) {
                break;
            }
        }
        if ( // Guard the termLen because we can have a multi-token term that
        // we don't want to split. TODO: is there something we can do to
        // get around this safely?
        stx5456[0].term.isPartialExpressionTerm && termLen5459 === stx5456[0].term.stx.length) {
            var expr5460 = stx5456[0].term.combine().result;
            for (var i5461 = 1, term5462 = stx5456[0].term; i5461 < stx5456.length; i5461++) {
                if (stx5456[i5461].term !== term5462) {
                    if (term5462 && term5462.isPartialTerm) {
                        term5462 = term5462.left;
                        i5461--;
                    } else {
                        break;
                    }
                }
            }
            return {
                result: expr5460,
                rest: stx5456.slice(i5461)
            };
        } else if (stx5456[0].term.isExprTerm) {
            return {
                result: stx5456[0].term,
                rest: stx5456.slice(termLen5459)
            };
        } else {
            return {
                result: null,
                rest: stx5456
            };
        }
    }
    var res5458 = enforest5216(stx5456, context5457);
    if (!res5458.result || !res5458.result.isExprTerm) {
        return {
            result: null,
            rest: stx5456
        };
    }
    return res5458;
}
function tagWithTerm5219(term5463, stx5464) {
    return stx5464.map(function (s5465) {
        s5465 = s5465.clone();
        s5465.term = term5463;
        return s5465;
    });
}
function applyMarkToPatternEnv5220(newMark5466, env5467) {
    function dfs5468(match5469) {
        if (match5469.level === 0) {
            // replace the match property with the marked syntax
            match5469.match = _5070.map(match5469.match, function (stx5470) {
                return stx5470.mark(newMark5466);
            });
        } else {
            _5070.each(match5469.match, function (match5471) {
                dfs5468(match5471);
            });
        }
    }
    _5070.keys(env5467).forEach(function (key5472) {
        dfs5468(env5467[key5472]);
    });
}
function markIn5221(arr5473, mark5474) {
    return arr5473.map(function (stx5475) {
        return stx5475.mark(mark5474);
    });
}
function markDefOut5222(arr5476, mark5477, def5478) {
    return arr5476.map(function (stx5479) {
        return stx5479.mark(mark5477).addDefCtx(def5478);
    });
}
function loadMacroDef5223(body5480, context5481, phase5482) {
    var expanded5483 = body5480[0].destruct(context5481, { stripCompileTerm: true });
    var stub5484 = parser5071.read("()");
    stub5484[0].token.inner = expanded5483;
    var flattend5485 = flatten5246(stub5484);
    var bodyCode5486 = codegen5069.generate(parser5071.parse(flattend5485, { phase: phase5482 }));
    var localCtx5487;
    var macroGlobal5488 = {
        makeValue: syn5072.makeValue,
        makeRegex: syn5072.makeRegex,
        makeIdent: syn5072.makeIdent,
        makeKeyword: syn5072.makeKeyword,
        makePunc: syn5072.makePunc,
        makeDelim: syn5072.makeDelim,
        localExpand: function localExpand(stx5490, stop5491) {
            var markedStx5492 = markIn5221(stx5490, localCtx5487.mark);
            var stopMap5493 = new StringMap5074();
            stop5491.forEach(function (stop5497) {
                stopMap5493.set(resolve5079(stop5497, localCtx5487.phase - 1), true);
            });
            var localExpandCtx5494 = makeExpanderContext5227(_5070.extend({}, localCtx5487, {
                stopMap: stopMap5493,
                phase: localCtx5487.phase - 1
            }));
            var terms5495 = expand5226(markedStx5492, localExpandCtx5494);
            var newStx5496 = terms5495.reduce(function (acc5498, term5499) {
                acc5498.push.apply(acc5498, term5499.destruct(localCtx5487, { stripCompileTerm: true }));
                return acc5498;
            }, []);
            return markDefOut5222(newStx5496, localCtx5487.mark, localCtx5487.defscope);
        },
        filename: context5481.filename,
        getExpr: function getExpr(stx5500) {
            if (stx5500.length === 0) {
                return {
                    success: false,
                    result: [],
                    rest: []
                };
            }
            var markedStx5501 = markIn5221(stx5500, localCtx5487.mark);
            var r5502 = get_expression5218(markedStx5501, localCtx5487);
            return {
                success: r5502.result !== null,
                result: r5502.result === null ? [] : markDefOut5222(r5502.result.destruct(localCtx5487, { stripCompileTerm: true }), localCtx5487.mark, localCtx5487.defscope),
                rest: markDefOut5222(r5502.rest, localCtx5487.mark, localCtx5487.defscope)
            };
        },
        getIdent: function getIdent(stx5503) {
            if (stx5503[0] && stx5503[0].isIdentifier()) {
                return {
                    success: true,
                    result: [stx5503[0]],
                    rest: stx5503.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5503
            };
        },
        getLit: function getLit(stx5504) {
            if (stx5504[0] && patternModule5085.typeIsLiteral(stx5504[0].token.type)) {
                return {
                    success: true,
                    result: [stx5504[0]],
                    rest: stx5504.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx5504
            };
        },
        unwrapSyntax: syn5072.unwrapSyntax,
        throwSyntaxError: throwSyntaxError5089,
        throwSyntaxCaseError: throwSyntaxCaseError5090,
        prettyPrint: syn5072.prettyPrint,
        parser: parser5071,
        __fresh: fresh5098,
        __freshScope: freshScope5099,
        __scope: context5481.scope,
        __bindings: context5481.bindings,
        _: _5070,
        patternModule: patternModule5085,
        getPattern: function getPattern(id5505) {
            return context5481.patternMap.get(id5505);
        },
        getPatternMap: function getPatternMap() {
            return context5481.patternMap;
        },
        getTemplate: function getTemplate(id5506) {
            assert5087(context5481.templateMap.has(id5506), "missing template");
            return syn5072.cloneSyntaxArray(context5481.templateMap.get(id5506));
        },
        getTemplateMap: function getTemplateMap() {
            // the template map is global across all context during compilation
            return context5481.templateMap;
        },
        applyMarkToPatternEnv: applyMarkToPatternEnv5220,
        mergeMatches: function mergeMatches(newMatch5507, oldMatch5508) {
            newMatch5507.patternEnv = _5070.extend({}, oldMatch5508.patternEnv, newMatch5507.patternEnv);
            return newMatch5507;
        },
        console: console
    };
    context5481.env.keysStr().forEach(function (key5509) {
        var val5510 = context5481.env.getStr(key5509);
        if ( // load the runtime values into the global object
        val5510 && val5510 instanceof RuntimeValue5207) {
            macroGlobal5488[key5509] = val5510.trans.value;
        }
    });
    context5481.store.keysStr().forEach(function (key5511) {
        var val5512 = context5481.store.getStr(key5511);
        if ( // load the runtime values into the global object
        val5512 && val5512 instanceof RuntimeValue5207) {
            macroGlobal5488[key5511] = val5512.trans.value;
        }
    });
    var macroFn5489;
    // if (!vm) {
    //     macroFn = vm.runInNewContext("(function() { return " + bodyCode + " })()",
    //                                  macroGlobal);
    // } else {
    macroFn5489 = scopedEval5183(bodyCode5486, macroGlobal5488);
    return function (stx5513, context5514, prevStx5515, prevTerms5516) {
        localCtx5487 = context5514;
        return macroFn5489(stx5513, context5514, prevStx5515, prevTerms5516);
    };
}
function expandToTermTree5224(stx5517, context5518) {
    assert5087(context5518, "expander context is required");
    var f5519, head5520, prevStx5521, restStx5522, prevTerms5523, macroDefinition5524;
    var rest5525 = stx5517;
    while (rest5525.length > 0) {
        assert5087(rest5525[0].token, "expecting a syntax object");
        f5519 = enforest5216(rest5525, context5518, prevStx5521, prevTerms5523);
        // head :: TermTree
        head5520 = f5519.result;
        // rest :: [Syntax]
        rest5525 = f5519.rest;
        if (!head5520) {
            // no head means the expansions stopped prematurely (for stepping)
            restStx5522 = rest5525;
            break;
        }
        var destructed5526 = tagWithTerm5219(head5520, f5519.result.destruct(context5518));
        prevTerms5523 = [head5520].concat(f5519.prevTerms);
        prevStx5521 = destructed5526.reverse().concat(f5519.prevStx);
        if (head5520.isImportTerm) {
            var // record the import in the module record for easier access
            entries5527 = context5518.moduleRecord.addImport(head5520);
            var // load up the (possibly cached) import module
            importMod5528 = loadImport5238(unwrapSyntax5092(head5520.from), context5518);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5518 = visit5235(importMod5528.term, importMod5528.record, context5518.phase, context5518);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            rest5525 = bindImportInMod5239(entries5527, rest5525, importMod5528.term, importMod5528.record, context5518, context5518.phase);
        }
        if (head5520.isImportForMacrosTerm) {
            var // record the import in the module record for easier access
            entries5527 = context5518.moduleRecord.addImport(head5520);
            var // load up the (possibly cached) import module
            importMod5528 = loadImport5238(unwrapSyntax5092(head5520.from), context5518);
            // invoking an imported module loads the runtime values
            // into the environment for this phase
            context5518 = invoke5234(importMod5528.term, importMod5528.record, context5518.phase + 1, context5518);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context5518 = visit5235(importMod5528.term, importMod5528.record, context5518.phase + 1, context5518);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            rest5525 = bindImportInMod5239(entries5527, rest5525, importMod5528.term, importMod5528.record, context5518, context5518.phase + 1);
        }
        if ((head5520.isExportDefaultTerm && head5520.decl.isMacroTerm || head5520.isMacroTerm) && expandCount5187 < maxExpands5188) {
            var macroDecl5531 = head5520.isExportDefaultTerm ? head5520.decl : head5520;
            if (!( // raw function primitive form
            macroDecl5531.body[0] && macroDecl5531.body[0].isKeyword() && macroDecl5531.body[0].token.value === "function")) {
                throwSyntaxError5089("load macro", "Primitive macro form must contain a function for the macro body", macroDecl5531.body);
            }
            // expand the body
            macroDecl5531.body = expand5226(macroDecl5531.body, makeExpanderContext5227(_5070.extend({}, context5518, { phase: context5518.phase + 1 })));
            //  and load the macro definition into the environment
            macroDefinition5524 = loadMacroDef5223(macroDecl5531.body, context5518, context5518.phase + 1);
            var fullName5532 = macroDecl5531.name.token.inner;
            var multiTokName5533 = makeMultiToken5100(macroDecl5531.name);
            multiTokName5533 = multiTokName5533.delScope(context5518.useScope);
            context5518.bindings.add(multiTokName5533, fresh5098(), context5518.phase);
            // addToDefinitionCtx([multiTokName],
            //                    context.defscope,
            //                    false,
            //                    context.paramscope);
            context5518.env.set(multiTokName5533, context5518.phase, new CompiletimeValue5206(new SyntaxTransform5077(macroDefinition5524, false, builtinMode5186, fullName5532), context5518.moduleRecord.name, context5518.phase));
        }
        if (head5520.isLetMacroTerm && expandCount5187 < maxExpands5188) {
            if (!( // raw function primitive form
            head5520.body[0] && head5520.body[0].isKeyword() && head5520.body[0].token.value === "function")) {
                throwSyntaxError5089("load macro", "Primitive macro form must contain a function for the macro body", head5520.body);
            }
            // expand the body
            head5520.body = expand5226(head5520.body, makeExpanderContext5227(_5070.extend({ phase: context5518.phase + 1 }, context5518)));
            //  and load the macro definition into the environment
            macroDefinition5524 = loadMacroDef5223(head5520.body, context5518, context5518.phase + 1);
            var _fullName5532 = head5520.name.token.inner;
            var _multiTokName5533 = makeMultiToken5100(head5520.name);
            // var freshName = fresh();
            // var renamedName = multiTokName.rename(multiTokName, freshName);
            //
            // head.name = head.name.rename(multiTokName, freshName);
            // rest = _.map(rest, function(stx) {
            //     return stx.rename(multiTokName, freshName);
            // });
            _multiTokName5533 = _multiTokName5533.delScope(context5518.useScope);
            context5518.bindings.add(_multiTokName5533, fresh5098(), context5518.phase);
            context5518.env.set(_multiTokName5533, context5518.phase, new CompiletimeValue5206(new SyntaxTransform5077(macroDefinition5524, false, builtinMode5186, _fullName5532), context5518.moduleRecord.name, context5518.phase));
        }
        if (head5520.isOperatorDefinitionTerm) {
            if (!( // raw function primitive form
            head5520.body[0] && head5520.body[0].isKeyword() && head5520.body[0].token.value === "function")) {
                throwSyntaxError5089("load macro", "Primitive macro form must contain a function for the macro body", head5520.body);
            }
            // expand the body
            head5520.body = expand5226(head5520.body, makeExpanderContext5227(_5070.extend({ phase: context5518.phase + 1 }, context5518)));
            var //  and load the macro definition into the environment
            opDefinition5536 = loadMacroDef5223(head5520.body, context5518, context5518.phase + 1);
            var fullName5532 = head5520.name.token.inner;
            var multiTokName5533 = makeMultiToken5100(head5520.name);
            multiTokName5533 = multiTokName5533.delScope(context5518.useScope);
            context5518.bindings.add(multiTokName5533, fresh5098(), context5518.phase);
            var opObj5539 = getSyntaxTransform5209(multiTokName5533, context5518, context5518.phase);
            if (!opObj5539) {
                opObj5539 = {
                    isOp: true,
                    builtin: builtinMode5186,
                    fullName: fullName5532
                };
            }
            assert5087(unwrapSyntax5092(head5520.type) === "binary" || unwrapSyntax5092(head5520.type) === "unary", "operator must either be binary or unary");
            opObj5539[unwrapSyntax5092(head5520.type)] = {
                fn: opDefinition5536,
                prec: head5520.prec.token.value,
                assoc: head5520.assoc ? head5520.assoc.token.value : null
            };
            context5518.env.set(multiTokName5533, context5518.phase, new CompiletimeValue5206(opObj5539, context5518.moduleRecord.name, context5518.phase));
        }
        if (head5520.isNamedFunTerm) {
            // addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            head5520.name = head5520.name.delScope(context5518.useScope);
            context5518.bindings.add(head5520.name, fresh5098(), context5518.phase);
        }
        if (head5520.isVariableStatementTerm || head5520.isLetStatementTerm || head5520.isConstStatementTerm) {
            head5520.decls = head5520.decls.map(function (decl5540) {
                decl5540.ident = decl5540.ident.delScope(context5518.useScope);
                context5518.bindings.add(decl5540.ident, fresh5098(), context5518.phase);
                return decl5540;
            });
        }
        if (head5520.isBlockTerm && head5520.body.isDelimiterTerm) {
            head5520.body.delim.token.inner.forEach(function (term5541) {
                if (term5541.isVariableStatementTerm) {
                    term5541.decls = term5541.decls.map(function (decl5542) {
                        decl5542.ident = decl5542.ident.delScope(context5518.useScope);
                        context5518.bindings.add(decl5542.ident, fresh5098(), context5518.phase);
                        return decl5542;
                    });
                }
            });
        }
        if (head5520.isDelimiterTerm) {
            head5520.delim.token.inner.forEach(function (term5543) {
                if (term5543.isVariableStatementTerm) {
                    term5543.decls = term5543.decls.map(function (decl5544) {
                        decl5544.ident = decl5544.ident.delScope(context5518.useScope);
                        context5518.bindings.add(decl5544.ident, fresh5098(), context5518.phase);
                        return decl5544;
                    });
                }
            });
        }
        if (head5520.isForStatementTerm) {
            var forCond5545 = head5520.cond.token.inner;
            if (forCond5545[0] && resolve5079(forCond5545[0], context5518.phase) === "let" && forCond5545[1] && forCond5545[1].isIdentifier()) {
                var letNew5546 = fresh5098();
                var letId5547 = forCond5545[1];
                forCond5545 = forCond5545.map(function (stx5548) {
                    return stx5548.rename(letId5547, letNew5546);
                });
                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head5520.cond.token.inner = expand5226([forCond5545[0]], context5518).concat(expand5226(forCond5545.slice(1), context5518));
                if ( // nice and easy case: `for (...) { ... }`
                rest5525[0] && rest5525[0].token.value === "{}") {
                    rest5525[0] = rest5525[0].rename(letId5547, letNew5546);
                } else {
                    var // need to deal with things like `for (...) if (...) log(...)`
                    bodyEnf5549 = enforest5216(rest5525, context5518);
                    var bodyDestructed5550 = bodyEnf5549.result.destruct(context5518);
                    var renamedBodyTerm5551 = bodyEnf5549.result.rename(letId5547, letNew5546);
                    tagWithTerm5219(renamedBodyTerm5551, bodyDestructed5550);
                    rest5525 = bodyEnf5549.rest;
                    prevStx5521 = bodyDestructed5550.reverse().concat(prevStx5521);
                    prevTerms5523 = [renamedBodyTerm5551].concat(prevTerms5523);
                }
            } else {
                head5520.cond.token.inner = expand5226(head5520.cond.token.inner, context5518);
            }
        }
    }
    return {
        // prevTerms are stored in reverse for the purposes of infix
        // lookbehind matching, so we need to re-reverse them.
        terms: prevTerms5523 ? prevTerms5523.reverse() : [],
        restStx: restStx5522,
        context: context5518
    };
}
function expandTermTreeToFinal5225(term5552, context5553) {
    assert5087(context5553 && context5553.env, "environment map is required");
    if (term5552.isArrayLiteralTerm) {
        term5552.array.delim.token.inner = expand5226(term5552.array.delim.token.inner, context5553);
        return term5552;
    } else if (term5552.isBlockTerm) {
        term5552.body.delim.token.inner = expand5226(term5552.body.delim.token.inner, context5553);
        return term5552;
    } else if (term5552.isParenExpressionTerm) {
        term5552.args = _5070.map(term5552.args, function (arg5554) {
            return expandTermTreeToFinal5225(arg5554, context5553);
        });
        return term5552;
    } else if (term5552.isCallTerm) {
        term5552.fun = expandTermTreeToFinal5225(term5552.fun, context5553);
        term5552.args = expandTermTreeToFinal5225(term5552.args, context5553);
        return term5552;
    } else if (term5552.isReturnStatementTerm) {
        term5552.expr = expandTermTreeToFinal5225(term5552.expr, context5553);
        return term5552;
    } else if (term5552.isUnaryOpTerm) {
        term5552.expr = expandTermTreeToFinal5225(term5552.expr, context5553);
        return term5552;
    } else if (term5552.isBinOpTerm || term5552.isAssignmentExpressionTerm) {
        term5552.left = expandTermTreeToFinal5225(term5552.left, context5553);
        term5552.right = expandTermTreeToFinal5225(term5552.right, context5553);
        return term5552;
    } else if (term5552.isObjGetTerm) {
        term5552.left = expandTermTreeToFinal5225(term5552.left, context5553);
        term5552.right.delim.token.inner = expand5226(term5552.right.delim.token.inner, context5553);
        return term5552;
    } else if (term5552.isObjDotGetTerm) {
        term5552.left = expandTermTreeToFinal5225(term5552.left, context5553);
        term5552.right = expandTermTreeToFinal5225(term5552.right, context5553);
        return term5552;
    } else if (term5552.isConditionalExpressionTerm) {
        term5552.cond = expandTermTreeToFinal5225(term5552.cond, context5553);
        term5552.tru = expandTermTreeToFinal5225(term5552.tru, context5553);
        term5552.fls = expandTermTreeToFinal5225(term5552.fls, context5553);
        return term5552;
    } else if (term5552.isVariableDeclarationTerm) {
        if (term5552.init) {
            term5552.init = expandTermTreeToFinal5225(term5552.init, context5553);
        }
        return term5552;
    } else if (term5552.isVariableStatementTerm) {
        term5552.decls = _5070.map(term5552.decls, function (decl5555) {
            return expandTermTreeToFinal5225(decl5555, context5553);
        });
        return term5552;
    } else if (term5552.isDelimiterTerm) {
        // expand inside the delimiter and then continue on
        term5552.delim.token.inner = expand5226(term5552.delim.token.inner, context5553);
        return term5552;
    } else if (term5552.isIdTerm) {
        var varTrans5556 = getCompiletimeValue5208(term5552.id, context5553, context5553.phase);
        if (varTrans5556 instanceof VarTransform5078) {
            term5552.id = syntaxFromToken5184(term5552.id.token, varTrans5556.id);
        }
        return term5552;
    } else if (term5552.isNamedFunTerm || term5552.isAnonFunTerm || term5552.isCatchClauseTerm || term5552.isArrowFunTerm || term5552.isModuleTerm) {
        var newDef5557;
        var paramSingleIdent5560;
        var params5561;
        var bodies5562;
        var paramNames5563;
        var bodyContext5564;
        var renamedBody5565;
        var expandedResult5566;
        var bodyTerms5567;
        var renamedParams5568;
        var flatArgs5569;
        var puncCtx5575;
        var expandedArgs5570;

        var _ret = (function () {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            newDef5557 = [];

            var scope5558 = freshScope5099(context5553.bindings);
            var useScope5559 = freshScope5099(context5553.bindings);
            paramSingleIdent5560 = term5552.params && term5552.params.isIdentifier();

            if (term5552.params && term5552.params.isDelimiter()) {
                params5561 = term5552.params;
            } else if (paramSingleIdent5560) {
                params5561 = term5552.params;
            } else {
                params5561 = syn5072.makeDelim("()", [], null);
            }

            if (Array.isArray(term5552.body)) {
                bodies5562 = syn5072.makeDelim("{}", term5552.body, null);
            } else {
                bodies5562 = term5552.body;
            }
            paramNames5563 = _5070.map(getParamIdentifiers5192(params5561), function (param5571) {
                var paramNew5572 = param5571.mark(scope5558);
                context5553.bindings.add(paramNew5572, fresh5098(), context5553.phase);
                context5553.env.set(paramNew5572, context5553.phase, new CompiletimeValue5206(new VarTransform5078(paramNew5572), context5553.moduleRecord.name, context5553.phase));
                return {
                    originalParam: param5571,
                    renamedParam: paramNew5572
                };
            });
            bodyContext5564 = makeExpanderContext5227(_5070.defaults({
                scope: scope5558,
                useScope: useScope5559,
                defscope: newDef5557,
                // paramscope is used to filter out var redeclarations
                paramscope: paramNames5563.map(function (p5573) {
                    return p5573.renamedParam;
                })
            }, context5553));
            renamedBody5565 = bodies5562.mark(scope5558);
            expandedResult5566 = expandToTermTree5224(renamedBody5565.token.inner, bodyContext5564);
            bodyTerms5567 = expandedResult5566.terms;

            if (expandedResult5566.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody5565.token.inner = expandedResult5566.terms.concat(expandedResult5566.restStx);
                if (Array.isArray(term5552.body)) {
                    term5552.body = renamedBody5565.token.inner;
                } else {
                    term5552.body = renamedBody5565;
                }
                return {
                    v: term5552
                };
            }
            renamedParams5568 = _5070.map(paramNames5563, function (p5574) {
                return p5574.renamedParam;
            });

            if (paramSingleIdent5560) {
                flatArgs5569 = renamedParams5568[0];
            } else {
                puncCtx5575 = term5552.params || null;

                flatArgs5569 = syn5072.makeDelim("()", joinSyntax5185(renamedParams5568, syn5072.makePunc(",", puncCtx5575)), puncCtx5575);
            }
            expandedArgs5570 = expand5226([flatArgs5569], bodyContext5564);

            assert5087(expandedArgs5570.length === 1, "should only get back one result");
            if ( // stitch up the function with all the renamings
            term5552.params) {
                term5552.params = expandedArgs5570[0];
            }
            bodyTerms5567 = _5070.map(bodyTerms5567, function (bodyTerm5576) {
                if ( // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                bodyTerm5576.isBlockTerm) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal5577 = expandTermTreeToFinal5225(bodyTerm5576, expandedResult5566.context);
                    return blockFinal5577.addDefCtx(newDef5557);
                } else {
                    var termWithCtx5578 = bodyTerm5576.addDefCtx(newDef5557);
                    // finish expansion
                    return expandTermTreeToFinal5225(termWithCtx5578, expandedResult5566.context);
                }
            });
            if (term5552.isModuleTerm) {
                bodyTerms5567.forEach(function (bodyTerm5579) {
                    if (bodyTerm5579.isExportNameTerm || bodyTerm5579.isExportDeclTerm || bodyTerm5579.isExportDefaultTerm) {
                        context5553.moduleRecord.addExport(bodyTerm5579);
                    }
                });
            }
            renamedBody5565.token.inner = bodyTerms5567;
            if (Array.isArray(term5552.body)) {
                term5552.body = renamedBody5565.token.inner;
            } else {
                term5552.body = renamedBody5565;
            }
            // and continue expand the rest
            return {
                v: term5552
            };
        })();

        if (typeof _ret === "object") return _ret.v;
    }
    // the term is fine as is
    return term5552;
}
function expand5226(stx5580, context5581) {
    assert5087(context5581, "must provide an expander context");
    var trees5582 = expandToTermTree5224(stx5580, context5581);
    var terms5583 = _5070.map(trees5582.terms, function (term5584) {
        return expandTermTreeToFinal5225(term5584, trees5582.context);
    });
    if (trees5582.restStx) {
        terms5583.push.apply(terms5583, trees5582.restStx);
    }
    return terms5583;
}
function makeExpanderContext5227(o5585) {
    o5585 = o5585 || {};
    var env5586 = o5585.env || new NameMap5075();
    var store5587 = o5585.store || new NameMap5075();
    var bindings5588 = o5585.bindings || new BindingMap5076();
    return Object.create(Object.prototype, {
        filename: {
            value: o5585.filename,
            writable: false,
            enumerable: true,
            configurable: false
        },
        compileSuffix: {
            value: o5585.compileSuffix || ".jsc",
            writable: false,
            enumerable: true,
            configurable: false
        },
        env: {
            value: env5586,
            writable: false,
            enumerable: true,
            configurable: false
        },
        store: {
            value: store5587,
            writable: false,
            enumerable: true,
            configurable: false
        },
        defscope: {
            value: o5585.defscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        paramscope: {
            value: o5585.paramscope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        templateMap: {
            value: o5585.templateMap || new StringMap5074(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        patternMap: {
            value: o5585.patternMap || new StringMap5074(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        mark: {
            value: o5585.mark,
            writable: false,
            enumerable: true,
            configurable: false
        },
        bindings: {
            value: bindings5588,
            writable: false,
            enumerable: true,
            configurable: false
        },
        scope: {
            value: o5585.scope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        useScope: {
            value: o5585.useScope,
            writable: false,
            enumerable: true,
            configurable: false
        },
        phase: {
            value: o5585.phase || 0,
            writable: false,
            enumerable: true,
            configurable: false
        },
        implicitImport: {
            value: o5585.implicitImport || new StringMap5074(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        stopMap: {
            value: o5585.stopMap || new StringMap5074(),
            writable: false,
            enumerable: true,
            configurable: false
        },
        moduleRecord: {
            value: o5585.moduleRecord || {},
            writable: false,
            enumerable: true,
            configurable: false
        }
    });
}
function makeModuleExpanderContext5228(filename5589, templateMap5590, patternMap5591, phase5592, moduleRecord5593, compileSuffix5594, bindings5595) {
    return makeExpanderContext5227({
        filename: filename5589,
        templateMap: templateMap5590,
        patternMap: patternMap5591,
        phase: phase5592,
        moduleRecord: moduleRecord5593,
        compileSuffix: compileSuffix5594,
        bindings: bindings5595
    });
}
function makeTopLevelExpanderContext5229(options5596) {
    var filename5597 = options5596 && options5596.filename ? options5596.filename : "<anonymous module>";
    return makeExpanderContext5227({ filename: filename5597 });
}
function resolvePath5230(name5598, parent5599) {
    var path5600 = require("path");
    var resolveSync5601 = require("resolve/lib/sync");
    var root5602 = path5600.dirname(parent5599);
    var fs5603 = require("fs");
    if (name5598[0] === ".") {
        name5598 = path5600.resolve(root5602, name5598);
    }
    return resolveSync5601(name5598, {
        basedir: root5602,
        extensions: [".js", ".sjs"]
    });
}
function defaultImportStx5231(importPath5604, ctx5605) {
    var names5606 = ["quoteSyntax", "syntax", "#", "syntaxCase",
    // "macro",
    // "let",
    "stxnonrec", "stxrec", "withSyntax", "letstx", "macroclass", "operator"];
    var importNames5607 = names5606.map(function (name5611) {
        return syn5072.makeIdent(name5611, ctx5605);
    });
    var importForMacrosNames5608 = names5606.map(function (name5612) {
        return syn5072.makeIdent(name5612, ctx5605);
    });
    var // import { names ... } from "importPath" for macros
    importForMacrosStmt5609 = [syn5072.makeKeyword("import", ctx5605), syn5072.makeDelim("{}", joinSyntax5185(importForMacrosNames5608, syn5072.makePunc(",", ctx5605)), ctx5605), syn5072.makeIdent("from", ctx5605), syn5072.makeValue(importPath5604, ctx5605), syn5072.makeKeyword("for", ctx5605), syn5072.makeIdent("macros", ctx5605)];
    var // import { names ... } from "importPath"
    importStmt5610 = [syn5072.makeKeyword("import", ctx5605), syn5072.makeDelim("{}", joinSyntax5185(importNames5607, syn5072.makePunc(",", ctx5605)), ctx5605), syn5072.makeIdent("from", ctx5605), syn5072.makeValue(importPath5604, ctx5605)];
    return importStmt5610.concat(importForMacrosStmt5609);
}
function createModule5232(name5613, body5614) {
    var language5615 = "base";
    var modBody5616 = body5614;
    if (body5614 && body5614[0] && body5614[1] && body5614[2] && unwrapSyntax5092(body5614[0]) === "#" && unwrapSyntax5092(body5614[1]) === "lang" && body5614[2].isStringLiteral()) {
        language5615 = unwrapSyntax5092(body5614[2]);
        // consume optional semicolon
        modBody5616 = body5614[3] && body5614[3].token.value === ";" && body5614[3].isPunctuator() ? body5614.slice(4) : body5614.slice(3);
    }
    if ( // insert the default import statements into the module body
    language5615 !== "base" && language5615 !== "js") {
        // "base" and "js" are currently special languages meaning don't
        // insert the default imports
        modBody5616 = defaultImportStx5231(language5615, body5614[0]).concat(modBody5616);
    }
    return {
        record: new ModuleRecord5084(name5613, language5615),
        term: ModuleTerm5108.create(modBody5616)
    };
}
function loadModule5233(name5617) {
    var // node specific code
    fs5618 = require("fs");
    return (function (body5619) {
        return createModule5232(name5617, body5619);
    })(parser5071.read(fs5618.readFileSync(name5617, "utf8")));
}
function invoke5234(modTerm5620, modRecord5621, phase5622, context5623) {
    if (modRecord5621.language === "base") {
        var // base modules can just use the normal require pipeline
        exported5624 = require(modRecord5621.name);
        Object.keys(exported5624).forEach(function (exp5625) {
            var // create new bindings in the context
            expName5626 = syn5072.makeIdent(exp5625, null).mark(freshScope5099(context5623.bindings));
            context5623.bindings.add(expName5626, fresh5098(), phase5622);
            modRecord5621.exportEntries.push(new ExportEntry5083(null, expName5626, expName5626));
            context5623.store.setWithModule(expName5626, phase5622, modRecord5621.name, new RuntimeValue5207({ value: exported5624[exp5625] }, modRecord5621.name, phase5622));
        });
    } else {
        // recursively invoke any imports in this module at this
        // phase and update the context
        modRecord5621.importedModules.forEach(function (impPath5629) {
            var importMod5630 = loadImport5238(impPath5629, context5623);
            var impEntries5631 = modRecord5621.getImportsForModule(impPath5629);
            if (_5070.any(impEntries5631, function (entry5632) {
                return entry5632.forPhase === 0;
            })) {
                context5623 = invoke5234(importMod5630.term, importMod5630.record, phase5622, context5623);
            }
        });
        var // turn the module into text so we can eval it
        code5627 = (function (terms5633) {
            return codegen5069.generate(parser5071.parse(flatten5246(_5070.flatten(terms5633.map(function (term5634) {
                return term5634.destruct(context5623, {
                    stripCompileTerm: true,
                    stripModuleTerm: true
                });
            })))));
        })(modTerm5620.body);
        var global5628 = { console: console };
        // eval but with a fresh heap
        vm5086.runInNewContext(code5627, global5628);
        // update the exports with the runtime values
        modRecord5621.exportEntries.forEach(function (entry5635) {
            var // we have to get the value with the localName
            expName5636 = resolve5079(entry5635.localName, 0);
            var expVal5637 = global5628[expName5636];
            context5623.bindings.add(entry5635.exportName, fresh5098(), phase5622);
            // and set it as the export name
            context5623.store.setWithModule(entry5635.exportName, phase5622, modRecord5621.name, new RuntimeValue5207({ value: expVal5637 }, modRecord5621.name, phase5622));
        });
    }
    return context5623;
}
function visit5235(modTerm5638, modRecord5639, phase5640, context5641) {
    if ( // don't need to visit base modules since they do not support macros
    modRecord5639.language === "base") {
        return context5641;
    }
    // reset the exports
    modRecord5639.exportEntries = [];
    // for each of the imported modules, recursively visit and
    // invoke them at the appropriate phase and then bind the
    // imported names in this module
    modRecord5639.importedModules.forEach(function (impPath5642) {
        var // load the (possibly cached) module for this import
        importMod5643 = loadImport5238(impPath5642, context5641);
        var // grab all the import statements for that module
        impEntries5644 = modRecord5639.getImportsForModule(impPath5642);
        if (_5070.any(impEntries5644, function (entry5645) {
            return entry5645.forPhase === 0;
        })) {
            // importing for phase 0 just needs to visit (load
            // compiletime values)
            context5641 = visit5235(importMod5643.term, importMod5643.record, phase5640, context5641);
        } else if (_5070.any(impEntries5644, function (entry5646) {
            return entry5646.forPhase === 1;
        })) {
            // importing for phase 1 needs to visit (load compiletime
            // values) and invoke (load runtime values for phase 1
            // code)
            context5641 = invoke5234(importMod5643.term, importMod5643.record, phase5640 + 1, context5641);
            context5641 = visit5235(importMod5643.term, importMod5643.record, phase5640 + 1, context5641);
        } else {
            // todo: arbitrary phase
            assert5087(false, "not implemented yet");
        }
        modTerm5638.body = bindImportInMod5239(impEntries5644, modTerm5638.body, importMod5643.term, importMod5643.record, context5641, phase5640);
    });
    // load the transformers into the store
    modTerm5638.body.forEach(function (term5647) {
        var name5648;
        var macroDefinition5649;
        var exportName5650;
        var entries5651;
        if ( // add the exported names to the module record
        term5647.isExportNameTerm || term5647.isExportDeclTerm || term5647.isExportDefaultTerm) {
            entries5651 = modRecord5639.addExport(term5647);
        }
        if (term5647.isExportDefaultTerm && term5647.decl.isMacroTerm || term5647.isMacroTerm || term5647.isLetMacroTerm) {
            var _multiTokName5652 = undefined,
                _fullName5653 = undefined,
                macBody5654 = term5647.isExportDefaultTerm ? term5647.decl.body : term5647.body;
            macroDefinition5649 = loadMacroDef5223(macBody5654, context5641, phase5640 + 1);
            if (term5647.isExportDefaultTerm) {
                _multiTokName5652 = entries5651[0].exportName;
                _fullName5653 = [entries5651[0].exportName];
            } else {
                _multiTokName5652 = makeMultiToken5100(term5647.name);
                _fullName5653 = term5647.name.token.inner;
            }
            // todo: handle implicits
            context5641.bindings.add(_multiTokName5652, fresh5098(), phase5640);
            context5641.store.set(_multiTokName5652, phase5640, new CompiletimeValue5206(new SyntaxTransform5077(macroDefinition5649, false, builtinMode5186, _fullName5653), phase5640, modRecord5639.name));
        }
        if (term5647.isOperatorDefinitionTerm) {
            var opDefinition5655 = loadMacroDef5223(term5647.body, context5641, phase5640 + 1);
            var multiTokName5652 = makeMultiToken5100(term5647.name);
            var fullName5653 = term5647.name.token.inner;
            var opObj5658 = {
                isOp: true,
                builtin: builtinMode5186,
                fullName: fullName5653
            };
            assert5087(unwrapSyntax5092(term5647.type) === "binary" || unwrapSyntax5092(term5647.type) === "unary", "operator must either be binary or unary");
            opObj5658[unwrapSyntax5092(term5647.type)] = {
                fn: opDefinition5655,
                prec: term5647.prec.token.value,
                assoc: term5647.assoc ? term5647.assoc.token.value : null
            };
            // bind in the store for the current phase
            context5641.bindings.add(multiTokName5652, fresh5098(), phase5640);
            context5641.store.set(phaseName, phase5640, new CompiletimeValue5206(opObj5658, phase5640, modRecord5639.name));
        }
    });
    return context5641;
}
function mapCommaSep5236(l5659, f5660) {
    return l5659.map(function (stx5661, idx5662) {
        if (idx5662 % 2 !== 0 && (!stx5661.isPunctuator() || stx5661.token.value !== ",")) {
            throwSyntaxError5089("import", "expecting a comma separated list", stx5661);
        } else if (idx5662 % 2 !== 0) {
            return stx5661;
        } else {
            return f5660(stx5661);
        }
    });
}
function filterModuleCommaSep5237(stx5663) {
    return stx5663.filter(function (stx5664, idx5665) {
        if (idx5665 % 2 !== 0 && (!stx5664.isPunctuator() || stx5664.token.value !== ",")) {
            throwSyntaxError5089("import", "expecting a comma separated list", stx5664);
        } else if (idx5665 % 2 !== 0) {
            return false;
        } else {
            return true;
        }
    });
}
function loadImport5238(path5666, context5667) {
    var modFullPath5668 = resolvePath5230(path5666, context5667.filename);
    if (!availableModules5189.has(modFullPath5668)) {
        var // load it
        modToImport5669 = (function (mod5670) {
            if (mod5670.record.language === "base") {
                return {
                    term: mod5670,
                    record: mod5670.record
                };
            }
            var expanded5671 = expandModule5240(mod5670.term, modFullPath5668, context5667.templateMap, context5667.patternMap, mod5670.record, context5667.compileSuffix, context5667.bindings);
            return {
                term: expanded5671.mod,
                record: expanded5671.context.moduleRecord
            };
        })(loadModule5233(modFullPath5668));
        availableModules5189.set(modFullPath5668, modToImport5669);
        return modToImport5669;
    }
    return availableModules5189.get(modFullPath5668);
}
function bindImportInMod5239(impEntries5672, stx5673, modTerm5674, modRecord5675, context5676, phase5677) {
    impEntries5672.forEach(function (entry5678) {
        var isBase5679 = modRecord5675.language === "base";
        var inExports5680 = _5070.find(modRecord5675.exportEntries, function (expEntry5685) {
            return unwrapSyntax5092(expEntry5685.exportName) === unwrapSyntax5092(entry5678.importName);
        });
        if (!(inExports5680 || isBase5679)) {
            throwSyntaxError5089("compile", "the imported name `" + unwrapSyntax5092(entry5678.importName) + "` was not exported from the module", entry5678.importName);
        }
        var exportName5681, trans5682, nameStr5683;
        if (!inExports5680) {
            // case when importing from a non ES6
            // module but not for macros so the module
            // was not invoked and thus nothing in the
            // context for this name
            trans5682 = null;
        } else {
            exportName5681 = inExports5680.exportName;
            trans5682 = getSyntaxTransform5209(exportName5681, context5676, phase5677);
        }
        var localName5684 = entry5678.localName;
        context5676.bindings.add(localName5684, fresh5098(), phase5677);
        context5676.store.set(localName5684, phase5677, new CompiletimeValue5206(trans5682, phase5677, modRecord5675.name));
    });
    // // set the new bindings in the context
    // renamedNames.forEach(name => {
    //     // setup a reverse map from each import name to
    //     // the import term but only for runtime values
    //     if (name.trans === null || (name.trans && name.trans.value)) {
    //         var resolvedName = resolve(name.localName, phase);
    //         context.implicitImport.set(resolvedName, name.entry);
    //     }
    // });
    return stx5673;
}
// (ModuleTerm, Str, Map, Map, ModuleRecord) -> {
//     context: ExpanderContext,
//     mod: ModuleTerm
// }
function expandModule5240(mod5686, filename5687, templateMap5688, patternMap5689, moduleRecord5690, compileSuffix5691, bindings5692) {
    var // create a new expander context for this module
    context5693 = makeModuleExpanderContext5228(filename5687, templateMap5688, patternMap5689, 0, moduleRecord5690, compileSuffix5691, bindings5692);
    return {
        context: context5693,
        mod: expandTermTreeToFinal5225(mod5686, context5693)
    };
}
function isCompileName5241(stx5694, context5695) {
    if (stx5694.isDelimiter()) {
        return !hasSyntaxTransform5210(stx5694.token.inner, context5695, 0);
    } else {
        return !hasSyntaxTransform5210(stx5694, context5695, 0);
    }
}
function filterCompileNames5242(stx5696, context5697) {
    assert5087(stx5696.isDelimiter(), "must be a delimter");
    var runtimeNames5698 = (function (names5700) {
        return names5700.filter(function (name5701) {
            return isCompileName5241(name5701, context5697);
        });
    })(filterModuleCommaSep5237(stx5696.token.inner));
    var newInner5699 = runtimeNames5698.reduce(function (acc5702, name5703, idx5704, orig5705) {
        acc5702.push(name5703);
        if (orig5705.length - 1 !== idx5704) {
            // don't add trailing comma
            acc5702.push(syn5072.makePunc(",", name5703));
        }
        return acc5702;
    }, []);
    return syn5072.makeDelim("{}", newInner5699, stx5696);
}
function flattenModule5243(modTerm5706, modRecord5707, context5708) {
    var // filter the imports to just the imports and names that are
    // actually available at runtime
    imports5709 = modRecord5707.getRuntimeImportEntries().filter(function (entry5713) {
        return isCompileName5241(entry5713.localName, context5708);
    });
    var exports5710 = modRecord5707.exportEntries.filter(function (entry5714) {
        return isCompileName5241(entry5714.localName, context5708);
    });
    var // filter out all of the import and export statements
    output5711 = modTerm5706.body.reduce(function (acc5715, term5716) {
        if (term5716.isExportNameTerm || term5716.isExportDeclTerm || term5716.isExportDefaultTerm || term5716.isImportTerm || term5716.isImportForMacrosTerm) {
            return acc5715;
        }
        return acc5715.concat(term5716.destruct(context5708, { stripCompileTerm: true }));
    }, []);
    output5711 = (function (output5717) {
        return output5717.map(function (stx5718) {
            var name5719 = resolve5079(stx5718, 0);
            if ( // collect the implicit imports (those imports that
            // must be included because a macro expanded to a reference
            // to an import from some other module)
            context5708.implicitImport.has(name5719)) {
                var implicit5720 = context5708.implicitImport.get(name5719);
                if ( // don't double add the import
                !_5070.find(imports5709, function (imp5721) {
                    return imp5721 === implicit5720;
                })) {
                    imports5709.push(implicit5720);
                }
            }
            return stx5718;
        });
    })(flatten5246(output5711));
    var // flatten everything
    flatImports5712 = imports5709.reduce(function (acc5722, entry5723) {
        entry5723.moduleRequest = entry5723.moduleRequest.clone();
        entry5723.moduleRequest.token.value += context5708.compileSuffix;
        return acc5722.concat(flatten5246(entry5723.toTerm().destruct(context5708).concat(syn5072.makePunc(";", entry5723.moduleRequest))));
    }, []);
    return {
        imports: imports5709.map(function (entry5724) {
            return entry5724.toTerm();
        }),
        body: flatImports5712.concat(output5711)
    };
}
function flattenImports5244(imports5725, mod5726, context5727) {
    return imports5725.reduce(function (acc5728, imp5729) {
        var modFullPath5730 = resolvePath5230(unwrapSyntax5092(imp5729.from), context5727.filename);
        if (availableModules5189.has(modFullPath5730)) {
            var modPair5731 = availableModules5189.get(modFullPath5730);
            if (modPair5731.record.language === "base") {
                return acc5728;
            }
            var flattened5732 = flattenModule5243(modPair5731.term, modPair5731.record, context5727);
            acc5728.push({
                path: modFullPath5730,
                code: flattened5732.body
            });
            acc5728 = acc5728.concat(flattenImports5244(flattened5732.imports, mod5726, context5727));
            return acc5728;
        } else {
            assert5087(false, "module was unexpectedly not available for compilation" + modFullPath5730);
        }
    }, []);
}
function compileModule5245(stx5733, options5734) {
    var fs5735 = require("fs");
    options5734 = options5734 || {};
    var filename5736 = options5734 && typeof options5734.filename !== "undefined" ? fs5735.realpathSync(options5734.filename) : "(anonymous module)";
    maxExpands5188 = Infinity;
    expandCount5187 = 0;
    var mod5737 = createModule5232(filename5736, stx5733);
    var // the template and pattern maps are global for every module
    templateMap5738 = new StringMap5074();
    var patternMap5739 = new StringMap5074();
    availableModules5189 = new StringMap5074();
    var expanded5740 = expandModule5240(mod5737.term, filename5736, templateMap5738, patternMap5739, mod5737.record, options5734.compileSuffix);
    var flattened5741 = flattenModule5243(expanded5740.mod, expanded5740.context.moduleRecord, expanded5740.context);
    var compiledModules5742 = flattenImports5244(flattened5741.imports, expanded5740.mod, expanded5740.context);
    return [{
        path: filename5736,
        code: flattened5741.body
    }].concat(compiledModules5742);
}
function flatten5246(stx5743) {
    return _5070.reduce(stx5743, function (acc5744, stx5745) {
        if (stx5745.isDelimiter()) {
            var openParen5746 = syntaxFromToken5184({
                type: parser5071.Token.Punctuator,
                value: stx5745.token.value[0],
                range: stx5745.token.startRange,
                sm_range: typeof stx5745.token.sm_startRange == "undefined" ? stx5745.token.startRange : stx5745.token.sm_startRange,
                lineNumber: stx5745.token.startLineNumber,
                sm_lineNumber: typeof stx5745.token.sm_startLineNumber == "undefined" ? stx5745.token.startLineNumber : stx5745.token.sm_startLineNumber,
                lineStart: stx5745.token.startLineStart,
                sm_lineStart: typeof stx5745.token.sm_startLineStart == "undefined" ? stx5745.token.startLineStart : stx5745.token.sm_startLineStart
            }, stx5745);
            var closeParen5747 = syntaxFromToken5184({
                type: parser5071.Token.Punctuator,
                value: stx5745.token.value[1],
                range: stx5745.token.endRange,
                sm_range: typeof stx5745.token.sm_endRange == "undefined" ? stx5745.token.endRange : stx5745.token.sm_endRange,
                lineNumber: stx5745.token.endLineNumber,
                sm_lineNumber: typeof stx5745.token.sm_endLineNumber == "undefined" ? stx5745.token.endLineNumber : stx5745.token.sm_endLineNumber,
                lineStart: stx5745.token.endLineStart,
                sm_lineStart: typeof stx5745.token.sm_endLineStart == "undefined" ? stx5745.token.endLineStart : stx5745.token.sm_endLineStart
            }, stx5745);
            if (stx5745.token.leadingComments) {
                openParen5746.token.leadingComments = stx5745.token.leadingComments;
            }
            if (stx5745.token.trailingComments) {
                openParen5746.token.trailingComments = stx5745.token.trailingComments;
            }
            acc5744.push(openParen5746);
            push5190.apply(acc5744, flatten5246(stx5745.token.inner));
            acc5744.push(closeParen5747);
            return acc5744;
        }
        stx5745.token.sm_lineNumber = typeof stx5745.token.sm_lineNumber != "undefined" ? stx5745.token.sm_lineNumber : stx5745.token.lineNumber;
        stx5745.token.sm_lineStart = typeof stx5745.token.sm_lineStart != "undefined" ? stx5745.token.sm_lineStart : stx5745.token.lineStart;
        stx5745.token.sm_range = typeof stx5745.token.sm_range != "undefined" ? stx5745.token.sm_range : stx5745.token.range;
        acc5744.push(stx5745);
        return acc5744;
    }, []);
}
exports.StringMap = StringMap5074;
exports.enforest = enforest5216;
exports.compileModule = compileModule5245;
exports.getCompiletimeValue = getCompiletimeValue5208;
exports.hasCompiletimeValue = hasCompiletimeValue5211;
exports.getSyntaxTransform = getSyntaxTransform5209;
exports.hasSyntaxTransform = hasSyntaxTransform5210;
exports.resolve = resolve5079;
exports.get_expression = get_expression5218;
exports.makeExpanderContext = makeExpanderContext5227;
exports.ExprTerm = ExprTerm5131;
exports.VariableStatementTerm = VariableStatementTerm5156;
exports.tokensToSyntax = syn5072.tokensToSyntax;
exports.syntaxToTokens = syn5072.syntaxToTokens;
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