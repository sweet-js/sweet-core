#lang "../macros/stxcase.js";
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
'use strict';

var codegen = require('escodegen'),
    _ = require('underscore'),
    parser = require('./parser'),
    syn = require('./syntax'),
    se = require('./scopedEval'),
    StringMap = require("./data/stringMap"),
    NameMap = require("./data/nameMap"),
    BindingMap = require("./data/bindingMap"),
    SyntaxTransform = require("./data/transforms").SyntaxTransform,
    VarTransform = require("./data/transforms").VarTransform,
    resolve = require("./stx/resolve").resolve,
    marksof = require("./stx/resolve").marksof,
    arraysEqual = require("./stx/resolve").arraysEqual,
    makeImportEntries = require("./mod/importEntry").makeImportEntries,
    ExportEntry = require("./mod/exportEntry").ExportEntry,
    ModuleRecord = require("./mod/moduleRecord").ModuleRecord,
    patternModule = require("./patterns"),
    vm = require('vm'),
    assert = require("assert"),
    termTree = require("./data/termTree");

var throwSyntaxError = syn.throwSyntaxError;
var throwSyntaxCaseError = syn.throwSyntaxCaseError;
var SyntaxCaseError = syn.SyntaxCaseError;
var unwrapSyntax = syn.unwrapSyntax;
var makeIdent = syn.makeIdent;
var makePunc = syn.makePunc;
var makeDelim = syn.makeDelim;
var makeValue = syn.makeValue;
var adjustLineContext = syn.adjustLineContext;
var fresh = syn.fresh;
var freshScope = syn.freshScope;
var makeMultiToken = syn.makeMultiToken;

var Scope = syn.Scope;

var TermTree                  = termTree.TermTree,
    EOFTerm                   = termTree.EOFTerm,
    KeywordTerm               = termTree.KeywordTerm,
    PuncTerm                  = termTree.PuncTerm,
    DelimiterTerm             = termTree.DelimiterTerm,
    ModuleTimeTerm            = termTree.ModuleTimeTerm,
    ModuleTerm                = termTree.ModuleTerm,
    ImportTerm                = termTree.ImportTerm,
    ImportForPhaseTerm        = termTree.ImportForPhaseTerm,
    NamedImportTerm           = termTree.NamedImportTerm,
    DefaultImportTerm         = termTree.DefaultImportTerm,
    NamespaceImportTerm       = termTree.NamespaceImportTerm,
    BindingTerm               = termTree.BindingTerm,
    QualifiedBindingTerm      = termTree.QualifiedBindingTerm,
    ExportNameTerm            = termTree.ExportNameTerm,
    ExportDefaultTerm         = termTree.ExportDefaultTerm,
    ExportDeclTerm            = termTree.ExportDeclTerm,
    CompileTimeTerm           = termTree.CompileTimeTerm,
    MacroTerm                 = termTree.MacroTerm,
    ClassDeclarationTerm      = termTree.ClassDeclarationTerm,
    OperatorDefinitionTerm    = termTree.OperatorDefinitionTerm,
    ForPhaseTerm              = termTree.ForPhaseTerm,
    VariableDeclarationTerm   = termTree.VariableDeclarationTerm,
    StatementTerm             = termTree.StatementTerm,
    EmptyTerm                 = termTree.EmptyTerm,
    CatchClauseTerm           = termTree.CatchClauseTerm,
    ForStatementTerm          = termTree.ForStatementTerm,
    ReturnStatementTerm       = termTree.ReturnStatementTerm,
    ExprTerm                  = termTree.ExprTerm,
    UnaryOpTerm               = termTree.UnaryOpTerm,
    PostfixOpTerm             = termTree.PostfixOpTerm,
    BinOpTerm                 = termTree.BinOpTerm,
    AssignmentExpressionTerm  = termTree.AssignmentExpressionTerm,
    ConditionalExpressionTerm = termTree.ConditionalExpressionTerm,
    NamedFunTerm              = termTree.NamedFunTerm,
    AnonFunTerm               = termTree.AnonFunTerm,
    ArrowFunTerm              = termTree.ArrowFunTerm,
    ObjDotGetTerm             = termTree.ObjDotGetTerm,
    ObjGetTerm                = termTree.ObjGetTerm,
    TemplateTerm              = termTree.TemplateTerm,
    CallTerm                  = termTree.CallTerm,
    QuoteSyntaxTerm           = termTree.QuoteSyntaxTerm,
    StopQuotedTerm            = termTree.StopQuotedTerm,
    PrimaryExpressionTerm     = termTree.PrimaryExpressionTerm,
    ThisExpressionTerm        = termTree.ThisExpressionTerm,
    LitTerm                   = termTree.LitTerm,
    BlockTerm                 = termTree.BlockTerm,
    ArrayLiteralTerm          = termTree.ArrayLiteralTerm,
    IdTerm                    = termTree.IdTerm,
    PartialTerm               = termTree.PartialTerm,
    PartialOperationTerm      = termTree.PartialOperationTerm,
    PartialExpressionTerm     = termTree.PartialExpressionTerm,
    BindingStatementTerm      = termTree.BindingStatementTerm,
    VariableStatementTerm     = termTree.VariableStatementTerm,
    LetStatementTerm          = termTree.LetStatementTerm,
    ConstStatementTerm        = termTree.ConstStatementTerm,
    ParenExpressionTerm       = termTree.ParenExpressionTerm;

operator (|>) 1 left { $l, $r } => #{ $r($l) }

var scopedEval = se.scopedEval;

var syntaxFromToken = syn.syntaxFromToken;
var joinSyntax = syn.joinSyntax;

var builtinMode = false;
var expandCount = 0;
var maxExpands;
var availableModules;

var push = Array.prototype.push;


// (CSyntax) -> [...CSyntax]
function getParamIdentifiers(argSyntax) {
    if (argSyntax.isDelimiter()) {
        return _.filter(argSyntax.token.inner, function(stx) { return stx.token.value !== ","});
    } else if (argSyntax.isIdentifier()) {
        return [argSyntax];
    } else {
        assert(false, "expecting a delimiter or a single identifier for function parameters");
    }
}



function stxIsUnaryOp(stx) {
    var staticOperators = ["+", "-", "~", "!",
                            "delete", "void", "typeof", "yield", "new",
                            "++", "--"];
    return _.contains(staticOperators, unwrapSyntax(stx));
}

function stxIsBinOp(stx) {
    var staticOperators = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^",
                            "==", "!=", "===", "!==",
                            "<", ">", "<=", ">=", "in", "instanceof",
                            "<<", ">>", ">>>"];
    return _.contains(staticOperators, unwrapSyntax(stx));
}

function getUnaryOpPrec(op) {
    var operatorPrecedence = {
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
    }
    return operatorPrecedence[op];
}

function getBinaryOpPrec(op) {
    var operatorPrecedence = {
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
        "||":4
    }
    return operatorPrecedence[op];
}

function getBinaryOpAssoc(op) {
    var operatorAssoc = {
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
    }
    return operatorAssoc[op];
}

function stxIsAssignOp(stx) {
    var staticOperators = ["=", "+=", "-=", "*=", "/=", "%=",
                           "<<=", ">>=", ">>>=",
                           "|=", "^=", "&="];
    return _.contains(staticOperators, unwrapSyntax(stx));
}

function enforestImportClause(stx) {
    if (stx[0] && stx[0].isDelimiter()) {
        return {
            result: NamedImportTerm.create(stx[0]),
            rest: stx.slice(1)
        };
    } else if (stx[0] && stx[0].isPunctuator() &&
               unwrapSyntax(stx[0]) === "*" &&
               stx[1] && unwrapSyntax(stx[1]) === "as" &&
               stx[2]) {
        return {
            result: NamespaceImportTerm.create(stx[0], stx[1], stx[2]),
            rest: stx.slice(3)
        };
    } else {
        return {
            result: DefaultImportTerm.create(stx[0]),
            rest: stx.slice(1)
        };
    }
}

function enforestImportClauseList(stx) {
    var res = [];
    var clause = enforestImportClause(stx);
    var rest = clause.rest;
    res.push(clause.result);
    if (rest[0] &&
        rest[0].isPunctuator() &&
        unwrapSyntax(rest[0]) === ",") {
        res.push(rest[0]);
        clause = enforestImportClause(rest.slice(1));
        res.push(clause.result);
        rest = clause.rest;
    }
    return {
        result: res,
        rest: rest
    };
}

function enforestImport(head, rest) {
    assert(unwrapSyntax(head) === "import", "only call for imports");

    var clause = enforestImportClauseList(rest);
    rest = clause.rest;

    if (rest[0] && unwrapSyntax(rest[0]) === "from" &&
        rest[1] && rest[1].isStringLiteral() &&
        rest[2] && unwrapSyntax(rest[2]) === "for" &&
        rest[3] && unwrapSyntax(rest[3]) === "phase" &&
        rest[4] && rest[4].isNumericLiteral()) {
        var importRest;
        if (rest[5] && rest[5].isPunctuator() &&
            rest[5].token.value === ";") {
            importRest = rest.slice(6);
        } else {
            importRest = rest.slice(5);
        }

        return {
            result: ImportForPhaseTerm.create(head,
                                              clause.result,
                                              rest[0],
                                              rest[1],
                                              rest[2],
                                              rest[3],
                                              rest[4]),
            rest: importRest
        };
    } else if (rest[0] && unwrapSyntax(rest[0]) === "from" &&
               rest[1] && rest[1].isStringLiteral()) {
        var importRest;
        if (rest[2] && rest[2].isPunctuator() &&
            rest[2].token.value === ";") {
            importRest = rest.slice(3);
        } else {
            importRest = rest.slice(2);
        }

        return {
            result: ImportTerm.create(head,
                                      clause.result,
                                      rest[0],
                                      rest[1]),
            rest: importRest
        };
    } else {
        throwSyntaxError("enforest", "unrecognized import syntax", rest);
    }
}

function enforestVarStatement(stx, context, varStx) {
    var decls = [];
    var rest = stx;
    var rhs;

    if (!rest.length) {
        throwSyntaxError("enforest", "Unexpected end of input", varStx);
    }

    if(expandCount >= maxExpands) {
        return null;
    }

    while (rest.length) {
        if (rest[0].isIdentifier()) {
            if (rest[1] && rest[1].isPunctuator() &&
                rest[1].token.value === "=") {
                rhs = get_expression(rest.slice(2), context);
                if (rhs.result == null) {
                    throwSyntaxError("enforest", "Unexpected token", rhs.rest[0]);
                }
                if (rhs.rest[0] && rhs.rest[0].isPunctuator() &&
                    rhs.rest[0].token.value === ",") {
                    decls.push(VariableDeclarationTerm.create(rest[0], rest[1], rhs.result, rhs.rest[0]));
                    rest = rhs.rest.slice(1);
                    continue;
                } else {
                    decls.push(VariableDeclarationTerm.create(rest[0], rest[1], rhs.result, null));
                    rest = rhs.rest;
                    break;
                }
            } else if (rest[1] && rest[1].isPunctuator() &&
                       rest[1].token.value === ",") {
                decls.push(VariableDeclarationTerm.create(rest[0], null, null, rest[1]));
                rest = rest.slice(2);
            } else {
                decls.push(VariableDeclarationTerm.create(rest[0], null, null, null));
                rest = rest.slice(1);
                break;
            }
        } else {
            throwSyntaxError("enforest", "Unexpected token", rest[0]);
        }
    }

    return {
        result: decls,
        rest: rest
    }
}

function enforestAssignment(stx, context, left, prevStx, prevTerms) {
    var op = stx[0];
    var rightStx = stx.slice(1);

    var opTerm = PuncTerm.create(stx[0]);
    var opPrevStx = tagWithTerm(opTerm, [stx[0]])
                    .concat(tagWithTerm(left, left.destruct(context).reverse()),
                            prevStx);
    var opPrevTerms = [opTerm, left].concat(prevTerms);
    var opRes = enforest(rightStx, context, opPrevStx, opPrevTerms);

    if (opRes.result) {
        // Lookbehind was matched, so it may not even be a binop anymore.
        if (opRes.prevTerms.length < opPrevTerms.length) {
            return opRes;
        }

        var right = opRes.result;
        // only a binop if the right is a real expression
        // so 2+2++ will only match 2+2
        if (right.isExprTerm) {
            var term = AssignmentExpressionTerm.create(left, op, right);
            return {
                result: term,
                rest: opRes.rest,
                prevStx: prevStx,
                prevTerms: prevTerms
            };
        }
    } else {
        return opRes;
    }
}

function enforestParenExpression(parens, context) {
    var argRes, enforestedArgs = [], commas = [];
    var innerTokens = parens.token.inner;
    while (innerTokens.length > 0) {
        argRes = enforest(innerTokens, context);
        if (!argRes.result || !argRes.result.isExprTerm) {
            return null;
        }
        enforestedArgs.push(argRes.result);
        innerTokens = argRes.rest;
        if (innerTokens[0] && innerTokens[0].token.value === ",") {
            // record the comma for later
            commas.push(innerTokens[0]);
            // but dump it for the next loop turn
            innerTokens = innerTokens.slice(1);
        } else {
            // either there are no more tokens or
            // they aren't a comma, either way we
            // are done with the loop
            break;
        }
    }
    return innerTokens.length ? null : ParenExpressionTerm.create(enforestedArgs, parens, commas);
}



function CompiletimeValue(trans, module, phase) {
    this.trans = trans;
    this.module = module;
    this.phase = phase;
}

function RuntimeValue(trans, module, phase) {
    this.trans = trans;
    this.module = module;
    this.phase = phase;
}

// pulls the compiletime value out of either the env or the store
function getCompiletimeValue(stx, context, phase) {
    var store, env = context.env.get(stx, phase);
    if (env !== null) {
        return env.trans;
    } else {
        store = context.store.get(stx, phase);
        return store !== null ? store.trans : null;
    }
}

function getSyntaxTransform(stx, context, phase) {
    var t = getCompiletimeValue(stx, context, phase);
    if (t && t instanceof VarTransform) {
        return null;
    }
    return t;
}

function getVarTransform(stx, context, phase) {
    var t = getCompiletimeValue(stx, context, phase);
    if (t && t instanceof VarTransform) {
        return t;
    }
    return null;
}

function hasSyntaxTransform(stx, context, phase) {
    return getSyntaxTransform(stx, context, phase) !== null;
}

function hasVarTransform(stx, context, phase) {
    return getVarTransform(stx, context, phase) !== null;
}

// checks if a compiletime value exists in the env or store
function hasCompiletimeValue(stx, context, phase) {
    return context.env.has(stx, phase) || context.store.has(stx, phase);
}

function expandMacro(stx, context, opCtx, opType, macroObj) {
    // pull the macro transformer out the environment
    var head = stx[0];
    var rest = stx.slice(1);
    macroObj = macroObj || getSyntaxTransform(stx, context, context.phase);
    var stxArg = rest.slice(macroObj.fullName.length - 1);
    var transformer;
    if (opType != null) {
        assert(opType === "binary" || opType === "unary", "operator type should be either unary or binary: " + opType);
        transformer = macroObj[opType].fn;
    } else {
        transformer = macroObj.fn;
    }

    assert(typeof transformer === "function", "Macro transformer not bound for: "
           + head.token.value);


    var transformerContext = makeExpanderContext(_.defaults({mark: freshScope(context.bindings)}, context));

    // apply the transformer
    var rt;
    try {
        rt = transformer([head].concat(stxArg),
                         transformerContext,
                         opCtx.prevStx,
                         opCtx.prevTerms);
    } catch (e) {
        if (e instanceof SyntaxCaseError) {
            // add a nicer error for syntax case
            var nameStr = macroObj.fullName.map(function(stx) {
                return stx.token.value;
            }).join("");
            if (opType != null) {
                var argumentString = "`" + stxArg.slice(0, 5).map(function(stx) {
                    return stx.token.value;
                }).join(" ") + "...`";
                throwSyntaxError("operator", "Operator `" + nameStr +
                                              "` could not be matched with " +
                                              argumentString,
                                              head);
            } else {
                var argumentString = "`" + stxArg.slice(0, 5).map(function(stx) {
                    return stx.token.value;
                }).join(" ") + "...`";
                throwSyntaxError("macro", "Macro `" + nameStr +
                                              "` could not be matched with " +
                                              argumentString,
                                              head);
            }
        }
        else {
            // just rethrow it
            throw e;
        }
    }

    if (!builtinMode && !macroObj.builtin) {
        expandCount++;
    }


    if(!Array.isArray(rt.result)) {
        throwSyntaxError("enforest", "Macro must return a syntax array", stx[0]);
    }


    if(rt.result.length > 0) {
        let adjustedResult = adjustLineContext(rt.result, head);
        if (stx[0].token.leadingComments) {
            if (adjustedResult[0].token.leadingComments) {
                adjustedResult[0].token.leadingComments = adjustedResult[0].token.leadingComments.concat(head.token.leadingComments);
            } else {
                adjustedResult[0].token.leadingComments = head.token.leadingComments;
            }
        }
        rt.result = adjustedResult;
    }
    return rt;
}

function comparePrec(left, right, assoc) {
    if (assoc === "left") {
        return left <= right;
    }
    return left < right;
}


// enforest the tokens, returns an object with the `result` TermTree and
// the uninterpreted `rest` of the syntax
// @ ([...SyntaxObject], ExpanderContext) -> {
//     result: Null or TermTreeObject,
//     rest: [...SyntaxObject]
// }
function enforest(toks, context, prevStx, prevTerms) {
    assert(toks.length > 0, "enforest assumes there are tokens to work with");

    prevStx = prevStx || [];
    prevTerms = prevTerms || [];

    if(expandCount >= maxExpands) {
        return { result: null,
                 rest: toks };
    }

    function step(head, rest, opCtx) {
        var innerTokens;
        assert(Array.isArray(rest), "result must at least be an empty array");
        if (head.isTermTree) {

            var isCustomOp = false;
            var uopMacroObj;
            var uopSyntax;

            if (head.isPuncTerm || head.isKeywordTerm || head.isIdTerm) {
                if (head.isPuncTerm) {
                    uopSyntax = head.punc;
                } else if (head.isKeywordTerm) {
                    uopSyntax = head.keyword;
                } else if (head.isIdTerm) {
                    uopSyntax = head.id;
                }
                uopMacroObj = getSyntaxTransform([uopSyntax].concat(rest),
                                                  context,
                                                  context.phase);
                isCustomOp = uopMacroObj && uopMacroObj.isOp;
            }

            // look up once (we want to check multiple properties on bopMacroObj
            // without repeatedly calling getValueInEnv)
            var bopMacroObj;
            if (rest[0] && rest[1]) {
                bopMacroObj = getSyntaxTransform(rest, context, context.phase);
            }

            // unary operator
            if ((isCustomOp && uopMacroObj.unary) || (uopSyntax && stxIsUnaryOp(uopSyntax))) {
                var uopPrec;
                if (isCustomOp && uopMacroObj.unary) {
                    uopPrec = uopMacroObj.unary.prec;
                } else {
                    uopPrec = getUnaryOpPrec(unwrapSyntax(uopSyntax));
                }

                var opRest = rest;
                var uopMacroName;
                if (uopMacroObj) {
                    uopMacroName = [uopSyntax].concat(rest.slice(0, uopMacroObj.fullName.length - 1));
                    opRest = rest.slice(uopMacroObj.fullName.length - 1);
                }

                var leftLeft = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartialTerm
                               ? opCtx.prevTerms[0]
                               : null;
                var unopTerm = PartialOperationTerm.create(head, leftLeft);
                var unopPrevStx = tagWithTerm(unopTerm, head.destruct(context).reverse()).concat(opCtx.prevStx);
                var unopPrevTerms = [unopTerm].concat(opCtx.prevTerms);
                var unopOpCtx = _.extend({}, opCtx, {
                    combine: function(t) {
                        if (t.isExprTerm) {
                            if (isCustomOp && uopMacroObj.unary) {
                                var rt = expandMacro(uopMacroName.concat(t.destruct(context)), context, opCtx, "unary");
                                var newt = get_expression(rt.result, context);
                                assert(newt.rest.length === 0, "should never have left over syntax");
                                return opCtx.combine(newt.result);
                            }
                            return opCtx.combine(UnaryOpTerm.create(uopSyntax, t));
                        } else {
                            // not actually an expression so don't create
                            // a UnaryOp term just return with the punctuator
                            return opCtx.combine(head);
                        }
                    },
                    prec: uopPrec,
                    prevStx: unopPrevStx,
                    prevTerms: unopPrevTerms,
                    op: unopTerm
                });
                return step(opRest[0], opRest.slice(1), unopOpCtx);
            // BinOp
            } else if (head.isExprTerm &&
                        (rest[0] && rest[1] &&
                         ((stxIsBinOp(rest[0]) && !bopMacroObj) ||
                          (bopMacroObj && bopMacroObj.isOp && bopMacroObj.binary)))) {
                var opRes;
                var op = rest[0];
                var left = head;
                var rightStx = rest.slice(1);

                var leftLeft = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartialTerm
                               ? opCtx.prevTerms[0]
                               : null;
                var leftTerm = PartialExpressionTerm.create(head.destruct(context), leftLeft, function() {
                    return step(head, [], opCtx);
                });
                var opTerm = PartialOperationTerm.create(op, leftTerm);
                var opPrevStx = tagWithTerm(opTerm, [rest[0]])
                                .concat(tagWithTerm(leftTerm, head.destruct(context)).reverse(),
                                        opCtx.prevStx);
                var opPrevTerms = [opTerm, leftTerm].concat(opCtx.prevTerms);
                var isCustomOp = bopMacroObj && bopMacroObj.isOp && bopMacroObj.binary;

                var bopPrec;
                var bopAssoc;
                if (isCustomOp && bopMacroObj.binary) {
                    bopPrec = bopMacroObj.binary.prec;
                    bopAssoc = bopMacroObj.binary.assoc;
                } else {
                    bopPrec = getBinaryOpPrec(unwrapSyntax(op));
                    bopAssoc = getBinaryOpAssoc(unwrapSyntax(op));
                }
                assert(bopPrec !== undefined, "expecting a precedence for operator: " + op);

                var newStack;
                if (comparePrec(bopPrec, opCtx.prec, bopAssoc)) {
                    var bopCtx = opCtx;
                    var combResult = opCtx.combine(head);

                    if (opCtx.stack.length > 0) {
                        return step(combResult.term, rest, opCtx.stack[0]);
                    }

                    left = combResult.term;
                    newStack = opCtx.stack;
                    opPrevStx = combResult.prevStx;
                    opPrevTerms = combResult.prevTerms;
                } else {
                    newStack = [opCtx].concat(opCtx.stack);
                }


                assert(opCtx.combine !== undefined,
                        "expecting a combine function");

                var opRightStx = rightStx;
                var bopMacroName;
                if (isCustomOp) {
                    bopMacroName = rest.slice(0, bopMacroObj.fullName.length);
                    opRightStx = rightStx.slice(bopMacroObj.fullName.length - 1);
                }
                var bopOpCtx = _.extend({}, opCtx, {
                    combine: function(right) {
                        if (right.isExprTerm) {
                            if (isCustomOp && bopMacroObj.binary) {
                                var leftStx = left.destruct(context);
                                var rightStx = right.destruct(context);
                                var rt = expandMacro(bopMacroName.concat(syn.makeDelim("()", leftStx, leftStx[0]),
                                                                         syn.makeDelim("()", rightStx, rightStx[0])),
                                                     context, opCtx, "binary");
                                var newt = get_expression(rt.result, context);
                                assert(newt.rest.length === 0, "should never have left over syntax");
                                return {
                                    term: newt.result,
                                    prevStx: opPrevStx,
                                    prevTerms: opPrevTerms
                                };
                            }
                            return {
                                term: BinOpTerm.create(left, op, right),
                                prevStx: opPrevStx,
                                prevTerms: opPrevTerms
                            };
                        } else {
                            return {
                                term: head,
                                prevStx: opPrevStx,
                                prevTerms: opPrevTerms
                            };
                        }
                    },
                    prec: bopPrec,
                    op: opTerm,
                    stack: newStack,
                    prevStx: opPrevStx,
                    prevTerms: opPrevTerms,
                });
                return step(opRightStx[0], opRightStx.slice(1), bopOpCtx);
            // Call
            } else if (head.isExprTerm && (rest[0] &&
                                       rest[0].isDelimiter() &&
                                       rest[0].token.value === "()")) {

                var parenRes = enforestParenExpression(rest[0], context);
                if (parenRes) {
                    return step(CallTerm.create(head, parenRes),
                                rest.slice(1),
                                opCtx);
                }
            // Conditional ( x ? true : false)
            } else if (head.isExprTerm &&
                       (rest[0] && resolve(rest[0], context.phase) === "?")) {
                var question = rest[0];
                var condRes = enforest(rest.slice(1), context);
                if (condRes.result) {
                    var truExpr = condRes.result;
                    var condRight = condRes.rest;
                    if (truExpr.isExprTerm &&
                        condRight[0] && resolve(condRight[0], context.phase) === ":") {
                        var colon = condRight[0];
                        var flsRes = enforest(condRight.slice(1), context);
                        var flsExpr = flsRes.result;
                        if (flsExpr.isExprTerm) {
                            // operators are combined before the ternary
                            if (opCtx.prec >= 4) { // ternary is like a operator with prec 4
                                var headResult = opCtx.combine(head);
                                var condTerm = ConditionalExpressionTerm.create(headResult.term,
                                                                            question,
                                                                            truExpr,
                                                                            colon,
                                                                            flsExpr);
                                if (opCtx.stack.length > 0) {
                                    return step(condTerm,
                                                flsRes.rest,
                                                opCtx.stack[0]);
                                } else {
                                    return {
                                        result: condTerm,
                                        rest: flsRes.rest,
                                        prevStx: headResult.prevStx,
                                        prevTerms: headResult.prevTerms
                                    };
                                }
                            } else {
                                var condTerm = ConditionalExpressionTerm.create(head,
                                                                            question,
                                                                            truExpr,
                                                                            colon,
                                                                            flsExpr);
                                return step(condTerm,
                                            flsRes.rest,
                                            opCtx);
                            }
                        }
                    }
                }
            // Arrow functions with expression bodies
            } else if (head.isDelimiterTerm &&
                       head.delim.token.value === "()" &&
                       rest[0] &&
                       rest[0].isPunctuator() &&
                       resolve(rest[0], context.phase) === "=>") {
                var arrowRes = enforest(rest.slice(1), context);
                if (arrowRes.result && arrowRes.result.isExprTerm) {
                    return step(ArrowFunTerm.create(head.delim,
                                                rest[0],
                                                arrowRes.result.destruct(context)),
                                arrowRes.rest,
                                opCtx);
                } else {
                    throwSyntaxError("enforest",
                        "Body of arrow function must be an expression",
                        rest.slice(1));
                }
            // Arrow functions with expression bodies
            } else if (head.isIdTerm &&
                       rest[0] &&
                       rest[0].isPunctuator() &&
                       resolve(rest[0], context.phase) === "=>") {
                var res = enforest(rest.slice(1), context);
                if (res.result && res.result.isExprTerm) {
                    return step(ArrowFunTerm.create(head.id,
                                                rest[0],
                                                res.result.destruct(context)),
                                res.rest,
                                opCtx);
                } else {
                    throwSyntaxError("enforest",
                                     "Body of arrow function must be an expression",
                                     rest.slice(1));
                }
            // ParenExpr
            } else if (head.isDelimiterTerm &&
                       head.delim.token.value === "()") {
                // empty parens are acceptable but enforest
                // doesn't accept empty arrays so short
                // circuit here
                if (head.delim.token.inner.length === 0) {
                    return step(ParenExpressionTerm.create([EmptyTerm.create()], head.delim, []),
                               rest,
                               opCtx);
                } else {
                    var parenRes = enforestParenExpression(head.delim, context);
                    if (parenRes) {
                        return step(parenRes, rest, opCtx);
                    }
                }
            // AssignmentExpression
            } else if (head.isExprTerm &&
                        ((head.isIdTerm ||
                          head.isObjGetTerm ||
                          head.isObjDotGetTerm ||
                          head.isThisExpressionTerm) &&
                        rest[0] && rest[1] && !bopMacroObj && stxIsAssignOp(rest[0]))) {
                var opRes = enforestAssignment(rest, context, head, prevStx, prevTerms);
                if(opRes && opRes.result) {
                    return step(opRes.result, opRes.rest, _.extend({}, opCtx, {
                        prevStx: opRes.prevStx,
                        prevTerms: opRes.prevTerms
                    }));
                }
            // Postfix
            } else if(head.isExprTerm &&
                        (rest[0] && (unwrapSyntax(rest[0]) === "++" ||
                                     unwrapSyntax(rest[0]) === "--"))) {
                // Check if the operator is a macro first.
                if (hasSyntaxTransform(rest[0], context, context.phase)) {
                    var headStx = tagWithTerm(head, head.destruct(context).reverse());
                    var opPrevStx = headStx.concat(prevStx);
                    var opPrevTerms = [head].concat(prevTerms);
                    var opRes = enforest(rest, context, opPrevStx, opPrevTerms);

                    if (opRes.prevTerms.length < opPrevTerms.length) {
                        return opRes;
                    } else if(opRes.result) {
                        return step(head,
                                    opRes.result.destruct(context).concat(opRes.rest),
                                    opCtx);
                    }
                }
                return step(PostfixOpTerm.create(head, rest[0]),
                            rest.slice(1),
                            opCtx);
            // ObjectGet (computed)
            } else if(head.isExprTerm &&
                        (rest[0] && rest[0].token.value === "[]"))  {
                return step(ObjGetTerm.create(head, DelimiterTerm.create(rest[0])),
                            rest.slice(1),
                            opCtx);
            // ObjectGet
            } else if (head.isExprTerm &&
                        (rest[0] && unwrapSyntax(rest[0]) === "." &&
                         !hasSyntaxTransform(rest[0], context, context.phase) &&
                         rest[1] &&
                         (rest[1].isIdentifier() ||
                          rest[1].isKeyword()))) {
                // Check if the identifier is a macro first.
                if (hasSyntaxTransform(rest[1], context, context.phase)) {
                    var headStx = tagWithTerm(head, head.destruct(context).reverse());
                    var dotTerm = PuncTerm.create(rest[0]);
                    var dotTerms = [dotTerm].concat(head, prevTerms);
                    var dotStx = tagWithTerm(dotTerm, [rest[0]]).concat(headStx, prevStx);
                    var dotRes = enforest(rest.slice(1), context, dotStx, dotTerms);

                    if (dotRes.prevTerms.length < dotTerms.length) {
                        return dotRes;
                    } else if(dotRes.result) {
                        return step(head,
                                    [rest[0]].concat(dotRes.result.destruct(context), dotRes.rest),
                                    opCtx);
                    }
                }
                return step(ObjDotGetTerm.create(head, rest[0], rest[1]),
                            rest.slice(2),
                            opCtx);
            // ArrayLiteral
            } else if (head.isDelimiterTerm &&
                        head.delim.token.value === "[]") {
                return step(ArrayLiteralTerm.create(head), rest, opCtx);
            // Block
            } else if (head.isDelimiterTerm &&
                        head.delim.token.value === "{}") {
                return step(BlockTerm.create(head), rest, opCtx);
            // quote syntax
            } else if (head.isIdTerm &&
                        unwrapSyntax(head.id) === "#quoteSyntax" &&
                        rest[0] && rest[0].token.value === "{}") {
                return step(QuoteSyntaxTerm.create(rest[0]), rest.slice(1), opCtx);
            // return statement
            } else if (head.isKeywordTerm && unwrapSyntax(head.keyword) === "return") {
                if (rest[0] && rest[0].token.lineNumber === head.keyword.token.lineNumber) {
                    var returnPrevStx = tagWithTerm(head,
                                                    head.destruct(context)).concat(opCtx.prevStx);
                    var returnPrevTerms = [head].concat(opCtx.prevTerms);
                    var returnExpr = enforest(rest, context, returnPrevStx, returnPrevTerms);
                    if (returnExpr.prevTerms.length < opCtx.prevTerms.length) {
                        return returnExpr;
                    }
                    if (returnExpr.result.isExprTerm) {
                        return step(ReturnStatementTerm.create(head, returnExpr.result),
                                    returnExpr.rest,
                                    opCtx);
                    }
                } else {
                    return step(ReturnStatementTerm.create(head, EmptyTerm.create()),
                               rest,
                               opCtx);
                }
            // let statements
            } else if (head.isKeywordTerm &&
                       unwrapSyntax(head.keyword) === "let") {
                var normalizedName;
                if (rest[0] && rest[0].isDelimiter() &&
                    rest[0].token.value === "()") {
                    normalizedName = rest[0];
                } else {
                    normalizedName = syn.makeDelim("()", [rest[0]], rest[0]);
                }

                var lsRes = enforestVarStatement(rest, context, head.keyword);
                if (lsRes && lsRes.result) {
                    return step(LetStatementTerm.create(head, lsRes.result),
                                lsRes.rest,
                                opCtx);
                }
            // VariableStatement
            } else if (head.isKeywordTerm &&
                       unwrapSyntax(head.keyword) === "var" && rest[0]) {
                var vsRes = enforestVarStatement(rest, context, head.keyword);
                if (vsRes && vsRes.result) {
                    return step(VariableStatementTerm.create(head, vsRes.result),
                                vsRes.rest,
                                opCtx);
                }
            // Const Statement
            } else if (head.isKeywordTerm &&
                       unwrapSyntax(head.keyword) === "const" && rest[0]) {
                var csRes = enforestVarStatement(rest, context, head.keyword);
                if (csRes && csRes.result) {
                    return step(ConstStatementTerm.create(head, csRes.result),
                                csRes.rest,
                                opCtx);
                }
            // for statement
            } else if (head.isKeywordTerm &&
                       unwrapSyntax(head.keyword) === "for" &&
                       rest[0] && rest[0].token.value === "()") {
                return step(ForStatementTerm.create(head.keyword, rest[0]),
                            rest.slice(1),
                            opCtx);
            }
        } else {
            assert(head && head.token, "assuming head is a syntax object");

            var macroObj = expandCount < maxExpands &&
                getSyntaxTransform([head].concat(rest), context, context.phase);

            if (head && context.stopMap.has(resolve(head, context.phase))) {
                return step(StopQuotedTerm.create(head, rest[0]),
                            rest.slice(1),
                            opCtx);
            // macro invocation
            } else if (macroObj && typeof macroObj.fn === "function" && !macroObj.isOp) {
                var rt = expandMacro([head].concat(rest), context, opCtx, null, macroObj);
                var newOpCtx = opCtx;

                if (rt.prevTerms && rt.prevTerms.length < opCtx.prevTerms.length) {
                    newOpCtx = rewindOpCtx(opCtx, rt);
                }

                if (rt.result.length > 0) {
                    return step(rt.result[0],
                                rt.result.slice(1).concat(rt.rest),
                                newOpCtx);
                } else {
                    return step(EmptyTerm.create(), rt.rest, newOpCtx);
                }
            // macro definition
            } else if (head.isIdentifier() &&
                       unwrapSyntax(head) === "stxrec" &&
                       resolve(head, context.phase) === "stxrec") {
                var normalizedName;
                if (rest[0] && rest[0].isDelimiter() &&
                    rest[0].token.value === "()") {
                    normalizedName = rest[0];
                } else {
                    normalizedName = syn.makeDelim("()", [rest[0]], rest[0]);
                }
                if (rest[1] && rest[1].isDelimiter()) {
                    return step(MacroTerm.create(normalizedName, rest[1].token.inner),
                                rest.slice(2),
                                opCtx);
                } else {
                    throwSyntaxError("enforest", "Macro declaration must include body", rest[1]);
                }
            // operator definition
            // unaryop (neg) 1 { macro { rule { $op:expr } => { $op } } }
            } else if (head.isIdentifier() &&
                       head.token.value === "unaryop" &&
                       rest[0] && rest[0].isDelimiter() &&
                       rest[0].token.value === "()" &&
                       rest[1] && rest[1].isNumericLiteral() &&
                       rest[2] && rest[2].isDelimiter() &&
                       rest[2] && rest[2].token.value === "{}") {
                var trans = enforest(rest[2].token.inner, context);
                return step(OperatorDefinitionTerm.create(syn.makeValue("unary", head),
                                                      rest[0],
                                                      rest[1],
                                                      null,
                                                      trans.result.body),
                            rest.slice(3),
                            opCtx);
            // operator definition
            // binaryop (neg) 1 left { macro { rule { $op:expr } => { $op } } }
            } else if (head.isIdentifier() &&
                       head.token.value === "binaryop" &&
                       rest[0] && rest[0].isDelimiter() &&
                       rest[0].token.value === "()" &&
                       rest[1] && rest[1].isNumericLiteral() &&
                       rest[2] && rest[2].isIdentifier() &&
                       rest[3] && rest[3].isDelimiter() &&
                       rest[3] && rest[3].token.value === "{}") {
                var trans = enforest(rest[3].token.inner, context);
                return step(OperatorDefinitionTerm.create(syn.makeValue("binary", head),
                                                      rest[0],
                                                      rest[1],
                                                      rest[2],
                                                      trans.result.body),
                            rest.slice(4),
                            opCtx);
            // function definition
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "function" &&
                       rest[0] && rest[0].isIdentifier() &&
                       rest[1] && rest[1].isDelimiter() &&
                       rest[1].token.value === "()" &&
                       rest[2] && rest[2].isDelimiter() &&
                       rest[2].token.value === "{}") {

                rest[1].token.inner = rest[1].token.inner;
                rest[2].token.inner = rest[2].token.inner;
                return step(NamedFunTerm.create(head, null, rest[0],
                                            rest[1],
                                            rest[2]),
                            rest.slice(3),
                            opCtx);
            // generator function definition
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "function" &&
                       rest[0] && rest[0].isPunctuator() &&
                       rest[0].token.value === "*" &&
                       rest[1] && rest[1].isIdentifier() &&
                       rest[2] && rest[2].isDelimiter() &&
                       rest[2].token.value === "()" &&
                       rest[3] && rest[3].isDelimiter() &&
                       rest[3].token.value === "{}") {

                return step(NamedFunTerm.create(head, rest[0], rest[1],
                                            rest[2],
                                            rest[3]),
                            rest.slice(4),
                            opCtx);
            // anonymous function definition
            } else if(head.isKeyword() &&
                      unwrapSyntax(head) === "function" &&
                      rest[0] && rest[0].isDelimiter() &&
                      rest[0].token.value === "()" &&
                      rest[1] && rest[1].isDelimiter() &&
                      rest[1].token.value === "{}") {

                return step(AnonFunTerm.create(head,
                                            null,
                                            rest[0],
                                            rest[1]),
                            rest.slice(2),
                            opCtx);
            // } else if(head.isKeyword() &&
            //           unwrapSyntax(head) === "class" &&
            //           rest[0] && rest[0].isIdentifier() &&
            //           rest[1] && rest[1].isDelimiter() &&
            //           rest[1].token.value === "{}") {
            //
            //     return step(ClassDeclarationTerm.create(head,
            //                                             rest[0],
            //                                             rest[1]),
            //                 rest.slice(2),
            //                 opCtx);
            // anonymous generator function definition
            } else if(head.isKeyword() &&
                      unwrapSyntax(head) === "function" &&
                      rest[0] && rest[0].isPunctuator() &&
                      rest[0].token.value === "*" &&
                      rest[1] && rest[1].isDelimiter() &&
                      rest[1].token.value === "()" &&
                      rest[2] && rest[2].isDelimiter&&
                      rest[2].token.value === "{}") {

                rest[1].token.inner = rest[1].token.inner;
                rest[2].token.inner = rest[2].token.inner;
                return step(AnonFunTerm.create(head,
                                            rest[0],
                                            rest[1],
                                            rest[2]),
                            rest.slice(3),
                            opCtx);
            // arrow function
            } else if(((head.isDelimiter() &&
                        head.token.value === "()") ||
                       head.isIdentifier()) &&
                      rest[0] && rest[0].isPunctuator() &&
                      resolve(rest[0], context.phase) === "=>" &&
                      rest[1] && rest[1].isDelimiter() &&
                      rest[1].token.value === "{}") {
                return step(ArrowFunTerm.create(head, rest[0], rest[1]),
                            rest.slice(2),
                            opCtx);
            } else if (head.isIdentifier() &&
                       head.token.value === "forPhase" &&
                       rest[0] && rest[0].isNumericLiteral() &&
                       rest[1] && rest[1].isDelimiter()) {
                return step(ForPhaseTerm.create(rest[0], rest[1].token.inner),
                            rest.slice(2), opCtx);
            // catch statement
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "catch" &&
                       rest[0] && rest[0].isDelimiter() &&
                       rest[0].token.value === "()" &&
                       rest[1] && rest[1].isDelimiter() &&
                       rest[1].token.value === "{}") {
                rest[0].token.inner = rest[0].token.inner;
                rest[1].token.inner = rest[1].token.inner;
                return step(CatchClauseTerm.create(head, rest[0], rest[1]),
                            rest.slice(2),
                            opCtx);
            // this expression
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "this") {
                return step(ThisExpressionTerm.create(head), rest, opCtx);
            // literal
            } else if (head.isNumericLiteral() ||
                       head.isStringLiteral()||
                       head.isBooleanLiteral()||
                       head.isRegularExpression() ||
                       head.isNullLiteral()) {

                return step(LitTerm.create(head), rest, opCtx);
            } else if (head.isKeyword() && unwrapSyntax(head) === "import") {
                var imp = enforestImport(head, rest);
                return step(imp.result, imp.rest, opCtx);
            // named export
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "export" &&
                       rest[0] && rest[0].isDelimiter()) {
                return step(ExportNameTerm.create(head, rest[0]),
                            rest.slice(1),
                            opCtx);
            // default export
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "export" &&
                       rest[0] && rest[0].isKeyword() &&
                       unwrapSyntax(rest[0]) === "default" &&
                       rest[1]) {
                var res = enforest(rest.slice(1), context)

                return step(ExportDefaultTerm.create(head, rest[0], res.result),
                            res.rest,
                            opCtx);
            // declaration export
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "export" && rest[0]) {
                var res = enforest(rest, context)
                return step(ExportDeclTerm.create(head, res.result),
                            res.rest,
                            opCtx);
            // identifier
            } else if (head.isIdentifier()) {
                return step(IdTerm.create(head), rest, opCtx);
            // punctuator
            } else if (head.isPunctuator()) {
                return step(PuncTerm.create(head), rest, opCtx);
            } else if (head.isKeyword() &&
                       unwrapSyntax(head) === "with") {
                throwSyntaxError("enforest", "with is not supported in sweet.js", head);
            // keyword
            } else if (head.isKeyword()) {
                return step(KeywordTerm.create(head), rest, opCtx);
            // Delimiter
            } else if (head.isDelimiter()) {
                return step(DelimiterTerm.create(head), rest, opCtx);
            } else if (head.isTemplate()) {
                return step(TemplateTerm.create(head), rest, opCtx);
            // end of file
            } else if (head.isEOF()) {
                assert(rest.length === 0, "nothing should be after an EOF");
                return step(EOFTerm.create(head), [], opCtx);
            } else {
                // todo: are we missing cases?
                assert(false, "not implemented");
            }

        }

        // Potentially an infix macro
        // This should only be invoked on runtime syntax terms
        if (!head.isMacroTerm && !head.isAnonMacroTerm && !head.isOperatorDefinitionTerm &&
            rest.length && hasSyntaxTransform(rest, context, context.phase) &&
            getSyntaxTransform(rest, context, context.phase).isOp === false) {
            var infLeftTerm = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartialTerm
                              ? opCtx.prevTerms[0]
                              : null;
            var infTerm = PartialExpressionTerm.create(head.destruct(context), infLeftTerm, function() {
                return step(head, [], opCtx);
            });
            var infPrevStx = tagWithTerm(infTerm, head.destruct(context)).reverse().concat(opCtx.prevStx);
            var infPrevTerms = [infTerm].concat(opCtx.prevTerms);
            var infRes = expandMacro(rest, context, {
                prevStx: infPrevStx,
                prevTerms: infPrevTerms
            });
            if (infRes.prevTerms && infRes.prevTerms.length < infPrevTerms.length) {
                var infOpCtx = rewindOpCtx(opCtx, infRes);
                return step(infRes.result[0], infRes.result.slice(1).concat(infRes.rest), infOpCtx);
            } else {
                return step(head, infRes.result.concat(infRes.rest), opCtx);
            }
        }

        // done with current step so combine and continue on
        var combResult = opCtx.combine(head);
        if (opCtx.stack.length === 0) {
            return {
                result: combResult.term,
                rest: rest,
                prevStx: combResult.prevStx,
                prevTerms: combResult.prevTerms
            };
        } else {
            return step(combResult.term, rest, opCtx.stack[0]);
        }
    }

    return step(toks[0], toks.slice(1), {
        combine: function(t) {
            return {
                term: t,
                prevStx: prevStx,
                prevTerms: prevTerms
            };
        },
        prec: 0,
        stack: [],
        op: null,
        prevStx: prevStx,
        prevTerms: prevTerms
    });
}

function rewindOpCtx(opCtx, res) {
    // If we've consumed all pending operators, we can just start over.
    // It's important that we always thread the new prevStx and prevTerms
    // through, otherwise the old ones will still persist.
    if (!res.prevTerms.length ||
        !res.prevTerms[0].isPartialTerm) {
        return _.extend({}, opCtx, {
            combine: function(t) {
                return {
                    term: t,
                    prevStx: res.prevStx,
                    prevTerms: res.prevTerms
                };
            },
            prec: 0,
            op: null,
            stack: [],
            prevStx: res.prevStx,
            prevTerms: res.prevTerms
        });
    }

    // To rewind, we need to find the first (previous) pending operator. It
    // acts as a marker in the opCtx to let us know how far we need to go
    // back.
    var op = null;
    for (var i = 0; i < res.prevTerms.length; i++) {
        if (!res.prevTerms[i].isPartialTerm) {
            break;
        }
        if (res.prevTerms[i].isPartialOperationTerm) {
            op = res.prevTerms[i];
            break;
        }
    }

    // If the op matches the current opCtx, we don't need to rewind
    // anything, but we still need to persist the prevStx and prevTerms.
    if (opCtx.op === op) {
        return _.extend({}, opCtx, {
            prevStx: res.prevStx,
            prevTerms: res.prevTerms
        });
    }

    for (var i = 0; i < opCtx.stack.length; i++) {
        if (opCtx.stack[i].op === op) {
            return _.extend({}, opCtx.stack[i], {
                prevStx: res.prevStx,
                prevTerms: res.prevTerms
            });
        }
    }

    assert(false, "Rewind failed.");
}

function get_expression(stx, context) {
    if (stx[0].term) {
        for (var termLen = 1; termLen < stx.length; termLen++) {
            if (stx[termLen].term !== stx[0].term) {
                break;
            }
        }
        // Guard the termLen because we can have a multi-token term that
        // we don't want to split. TODO: is there something we can do to
        // get around this safely?
        if (stx[0].term.isPartialExpressionTerm &&
            termLen === stx[0].term.stx.length) {
            var expr = stx[0].term.combine().result;
            for (var i = 1, term = stx[0].term; i < stx.length; i++) {
                if (stx[i].term !== term) {
                    if (term && term.isPartialTerm) {
                        term = term.left;
                        i--;
                    } else {
                        break;
                    }
                }
            }
            return {
                result: expr,
                rest: stx.slice(i)
            };
        } else if (stx[0].term.isExprTerm) {
            return {
                result: stx[0].term,
                rest: stx.slice(termLen)
            };
        } else {
            return {
              result: null,
              rest: stx
            };
        }
    }

    var res = enforest(stx, context);
    if (!res.result || !res.result.isExprTerm) {
        return {
          result: null,
          rest: stx
        };
    }
    return res;
}

function tagWithTerm(term, stx) {
    return stx.map(function(s) {
        s = s.clone();
        s.term = term;
        return s;
    });
}


// mark each syntax object in the pattern environment,
// mutating the environment
function applyMarkToPatternEnv (newMark, env) {
    /*
    Takes a `match` object:

        {
            level: <num>,
            match: [<match> or <syntax>]
        }

    where the match property is an array of syntax objects at the bottom (0) level.
    Does a depth-first search and applys the mark to each syntax object.
    */
    function dfs(match) {
        if (match.level === 0) {
            // replace the match property with the marked syntax
            match.match = _.map(match.match, function(stx) {
                return stx.mark(newMark);
            });
        } else {
            _.each(match.match, function(match) {
                dfs(match);
            });
        }
    }
    _.keys(env).forEach(function(key) {
        dfs(env[key]);
    });
}

function markIn(arr, mark) {
    return arr.map(function(stx) {
        return stx.mark(mark);
    });
}

function markDefOut(arr, mark, def) {
    return arr.map(function(stx) {
        return stx.mark(mark);
    });
}

// given the syntax for a macro, produce a macro transformer
// (Macro) -> (([...CSyntax]) -> ReadTree)
function loadMacroDef(body, context, phase) {

    var expanded = body[0].destruct(context, {stripCompileTerm: true});
    var stub = parser.read("()");
    stub[0].token.inner = expanded;
    var flattend = flatten(stub);
    var bodyCode = codegen.generate(parser.parse(flattend, {phase: phase}));

    var localCtx;
    var macroGlobal = {
        makeValue: syn.makeValue,
        makeRegex: syn.makeRegex,
        makeIdent: syn.makeIdent,
        makeKeyword: syn.makeKeyword,
        makePunc: syn.makePunc,
        makeDelim: syn.makeDelim,
        localExpand: function(stx, stop) {
            stop = stop || [];
            var markedStx = markIn(stx, localCtx.mark);
            var stopMap = new StringMap();
            stop.forEach(stop => {
                stopMap.set(resolve(stop, localCtx.phase), true);
            })
            var localExpandCtx = makeExpanderContext(_.extend({},
                                                              localCtx,
                                                              {stopMap: stopMap}))
            var terms = expand(markedStx, localExpandCtx);
            var newStx = terms.reduce(function(acc, term) {
                acc.push.apply(acc, term.destruct(localCtx, {stripCompileTerm: true}));
                return acc;
            }, []);

            return markDefOut(newStx, localCtx.mark, localCtx.defscope);
        },
        filename: context.filename,
        getExpr: function(stx) {
            if (stx.length === 0) {
                return {
                    success: false,
                    result: [],
                    rest: []
                };
            }
            var markedStx = markIn(stx, localCtx.mark);
            var r = get_expression(markedStx, localCtx);
            return {
                success: r.result !== null,
                result: r.result === null ? [] : markDefOut(r.result.destruct(localCtx, {stripCompileTerm: true}), localCtx.mark, localCtx.defscope),
                rest: markDefOut(r.rest, localCtx.mark, localCtx.defscope)
            };
        },
        getIdent: function(stx) {
            if (stx[0] && stx[0].isIdentifier()) {
                return {
                    success: true,
                    result: [stx[0]],
                    rest: stx.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx
            };
        },
    getLit: function(stx) {
            if (stx[0] && patternModule.typeIsLiteral(stx[0].token.type)) {
                return {
                    success: true,
                    result: [stx[0]],
                    rest: stx.slice(1)
                };
            }
            return {
                success: false,
                result: [],
                rest: stx
            };
        },
        unwrapSyntax: syn.unwrapSyntax,
        throwSyntaxError: throwSyntaxError,
        throwSyntaxCaseError: throwSyntaxCaseError,
        prettyPrint: syn.prettyPrint,
        parser: parser,
        __fresh: fresh,
        __freshScope: freshScope,
        __scope: context.scope,
        __bindings: context.bindings,
        _: _,
        patternModule: patternModule,
        getPattern: function(id) {
            return context.patternMap.get(id);
        },
        getPatternMap: function() {
            return context.patternMap;
        },
        getTemplate: function(id) {
            assert(context.templateMap.has(id), "missing template");
            return syn.cloneSyntaxArray(context.templateMap.get(id));
        },
        getTemplateMap: function() {
            // the template map is global across all context during compilation
            return context.templateMap;
        },
        applyMarkToPatternEnv: applyMarkToPatternEnv,
        mergeMatches: function(newMatch, oldMatch) {
            newMatch.patternEnv = _.extend({}, oldMatch.patternEnv, newMatch.patternEnv);
            return newMatch;
        },
        console: console
    };
    context.env.keysStr().forEach(key => {
        var val = context.env.getStr(key);
        // load the runtime values into the global object
        if (val && val instanceof RuntimeValue) {
            macroGlobal[key] = val.trans.value;
        }
    });
    context.store.keysStr().forEach(key => {
        var val = context.store.getStr(key);
        // load the runtime values into the global object
        if (val && val instanceof RuntimeValue) {
            macroGlobal[key] = val.trans.value;
        }
    });
    let macroFn = scopedEval(bodyCode, macroGlobal);

    return function(stx, context, prevStx, prevTerms) {
        localCtx = context;
        return macroFn(stx, context, prevStx, prevTerms);
    };
}



// similar to `parse1` in the honu paper
// @ ([...SyntaxObject], ExpanderContext) -> {
//     terms: [...TermTreeObject],
//     context: ExpanderContext,
//     restStx: Undefined or [...SyntaxObject]
// }
function expandToTermTree(stx, context) {
    assert(context, "expander context is required");

    var f, head, prevStx, restStx, prevTerms, macroDefinition;
    var rest = stx;

    while (rest.length > 0) {
        assert(rest[0].token, "expecting a syntax object");

        f = enforest(rest, context, prevStx, prevTerms);
        // head :: TermTree
        head = f.result;
        // rest :: [Syntax]
        rest = f.rest;

        if (!head) {
            // no head means the expansions stopped prematurely (for stepping)
            restStx = rest;
            break;
        }

        var destructed = tagWithTerm(head, f.result.destruct(context));
        prevTerms = [head].concat(f.prevTerms);
        prevStx = destructed.reverse().concat(f.prevStx);

        if (head.isImportTerm) {
            // record the import in the module record for easier access
            var entries = context.moduleRecord.addImport(head);
            // load up the (possibly cached) import module
            var importMod = loadImport(unwrapSyntax(head.from), context, context.moduleRecord.name);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context = visit(importMod.term, importMod.record, context.phase, context);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod(entries, importMod.term, importMod.record, context, context.phase);
        }

        if (head.isImportForPhaseTerm) {
            // record the import in the module record for easier access
            var entries = context.moduleRecord.addImport(head);
            // load up the (possibly cached) import module
            var importMod = loadImport(unwrapSyntax(head.from), context, context.moduleRecord.name);
            // invoking an imported module loads the runtime values
            // into the environment for this phase
            context = invoke(importMod.term, importMod.record, context.phase + head.phase.token.value, context);
            // visiting an imported module loads the compiletime values
            // into the compiletime environment for this phase
            context = visit(importMod.term, importMod.record, context.phase + head.phase.token.value, context);
            // bind the imported names in the rest of the module
            // todo: how to handle references before an import?
            bindImportInMod(entries, importMod.term, importMod.record, context, context.phase);
        }

        if (head.isForPhaseTerm) {
            let phaseShiftedContext = makeExpanderContext(_.defaults({
                phase: context.phase + head.phase.token.value
            }, context));
            head.body = expand(head.body, phaseShiftedContext);
        }

        if (((head.isExportDefaultTerm && head.decl.isMacroTerm) || head.isMacroTerm) && expandCount < maxExpands) {
            var macroDecl = head.isExportDefaultTerm ? head.decl : head;
            // raw function primitive form
            if(!(macroDecl.body[0] && macroDecl.body[0].isKeyword() &&
                 macroDecl.body[0].token.value === "function")) {
                throwSyntaxError("load macro",
                                 "Primitive macro form must contain a function for the macro body",
                                 macroDecl.body);
            }
            // expand the body
            macroDecl.body = expand(macroDecl.body,
                                    makeExpanderContext(_.defaults({phase: context.phase + 1},
                                                                   context)));
            //  and load the macro definition into the environment
            macroDefinition = loadMacroDef(macroDecl.body, context, context.phase + 1);
            var fullName = macroDecl.name.token.inner;
            var multiTokName = makeMultiToken(macroDecl.name);
            multiTokName = multiTokName.delScope(context.useScope);
            context.bindings.add(multiTokName, fresh(), context.phase);

            context.env.set(multiTokName,
                            context.phase,
                            new CompiletimeValue(new SyntaxTransform(macroDefinition,
                                                                     false,
                                                                     builtinMode,
                                                                     fullName),
                                                 context.moduleRecord.name,
                                                 context.phase));
        }


        if (head.isOperatorDefinitionTerm) {
            // raw function primitive form
            if(!(head.body[0] && head.body[0].isKeyword() &&
                 head.body[0].token.value === "function")) {
                throwSyntaxError("load macro",
                                 "Primitive macro form must contain a function for the macro body",
                                 head.body);
            }
            // expand the body
            head.body = expand(head.body,
                               makeExpanderContext(_.defaults({phase: context.phase + 1},
                                                              context)));
            //  and load the macro definition into the environment
            var opDefinition = loadMacroDef(head.body, context, context.phase + 1);

            var fullName = head.name.token.inner;
            var multiTokName = makeMultiToken(head.name);

            multiTokName = multiTokName.delScope(context.useScope);
            context.bindings.add(multiTokName, fresh(), context.phase);

            var opObj = getSyntaxTransform(multiTokName, context, context.phase);
            if (!opObj) {
                opObj = {
                    isOp: true,
                    builtin: builtinMode,
                    fullName: fullName
                }
            }
            assert(unwrapSyntax(head.type) === "binary" ||
                   unwrapSyntax(head.type) === "unary",
                   "operator must either be binary or unary");

            opObj[unwrapSyntax(head.type)] = {
                fn: opDefinition,
                prec: head.prec.token.value,
                assoc: head.assoc ? head.assoc.token.value : null
            };
            context.env.set(multiTokName,
                            context.phase,
                            new CompiletimeValue(opObj,
                                                 context.moduleRecord.name,
                                                 context.phase));
        }

        if (head.isNamedFunTerm) {
            // addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            head.name = head.name.delScope(context.useScope);
            context.bindings.add(head.name, fresh(), context.phase);
            context.env.set(head.name,
                            context.phase,
                            new CompiletimeValue(new VarTransform(head.name),
                                                 context.moduleRecord.name,
                                                 context.phase));
        }

        if (head.isVariableStatementTerm ||
            head.isLetStatementTerm ||
            head.isConstStatementTerm) {
            head.decls = head.decls.map(decl => {
                decl.ident = decl.ident.delScope(context.useScope);
                context.bindings.add(decl.ident, fresh(), context.phase);
                context.env.set(decl.ident,
                                context.phase,
                                new CompiletimeValue(new VarTransform(decl.ident),
                                                     context.moduleRecord.name,
                                                     context.name));
                return decl;
            });
            // addToDefinitionCtx(_.map(head.decls, function(decl) { return decl.ident; }),
            //                    context.defscope,
            //                    true,
            //                    context.paramscope);
        }

        if(head.isBlockTerm && head.body.isDelimiterTerm) {
            head.body.delim.token.inner.forEach(function(term) {
                if (term.isVariableStatementTerm) {
                    term.decls = term.decls.map(decl => {
                        decl.ident = decl.ident.delScope(context.useScope);
                        context.bindings.add(decl.ident, fresh(), context.phase);
                        return decl;
                    })
                    // addToDefinitionCtx(_.map(term.decls, function(decl)  { return decl.ident; }),
                    //                    context.defscope,
                    //                    true,
                    //                    context.paramscope);
                }
            });

        }

        if(head.isDelimiterTerm) {
            head.delim.token.inner.forEach(function(term)  {
                if (term.isVariableStatementTerm) {
                    term.decls = term.decls.map(decl => {
                        decl.ident = decl.ident.delScope(context.useScope);
                        context.bindings.add(decl.ident, fresh(), context.phase);
                        return decl;
                    })
                    // addToDefinitionCtx(_.map(term.decls, function(decl) { return decl.ident; }),
                    //                    context.defscope,
                    //                    true,
                    //                    context.paramscope);

                }
            });
        }

        if (head.isForStatementTerm) {
            var forCond = head.cond.token.inner;
            if(forCond[0] && resolve(forCond[0], context.phase) === "let" &&
               forCond[1] && forCond[1].isIdentifier()) {
                var letNew = fresh();
                var letId = forCond[1];

                forCond = forCond.map(function(stx) {
                    return stx.rename(letId, letNew);
                });

                // hack: we want to do the let renaming here, not
                // in the expansion of `for (...)` so just remove the `let`
                // keyword
                head.cond.token.inner = expand([forCond[0]], context)
                                        .concat(expand(forCond.slice(1), context));

                // nice and easy case: `for (...) { ... }`
                if (rest[0] && rest[0].token.value === "{}") {
                    rest[0] = rest[0].rename(letId, letNew);
                } else {
                    // need to deal with things like `for (...) if (...) log(...)`
                    var bodyEnf = enforest(rest, context);
                    var bodyDestructed = bodyEnf.result.destruct(context);
                    var renamedBodyTerm = bodyEnf.result.rename(letId, letNew);
                    tagWithTerm(renamedBodyTerm, bodyDestructed);
                    rest = bodyEnf.rest;
                    prevStx = bodyDestructed.reverse().concat(prevStx);
                    prevTerms = [renamedBodyTerm].concat(prevTerms);
                }

            } else {
                head.cond.token.inner = expand(head.cond.token.inner, context);
            }
        }
    }

    return {
        // prevTerms are stored in reverse for the purposes of infix
        // lookbehind matching, so we need to re-reverse them.
        terms: prevTerms ? prevTerms.reverse() : [],
        restStx: restStx,
        context: context,
    };
}



// similar to `parse2` in the honu paper except here we
// don't generate an AST yet
// @ (TermTreeObject, ExpanderContext) -> TermTreeObject
function expandTermTreeToFinal (term, context) {
    assert(context && context.env, "environment map is required");

    if (term.isArrayLiteralTerm) {
        term.array.delim.token.inner = expand(term.array.delim.token.inner, context);
        return term;
    } else if (term.isBlockTerm) {
        term.body.delim.token.inner = expand(term.body.delim.token.inner, context);
        return term;
    } else if (term.isParenExpressionTerm) {
        term.args = _.map(term.args, function(arg) {
            return expandTermTreeToFinal(arg, context);
        });
        return term;
    } else if (term.isCallTerm) {
        term.fun = expandTermTreeToFinal(term.fun, context);
        term.args = expandTermTreeToFinal(term.args, context);
        return term;
    } else if (term.isReturnStatementTerm) {
        term.expr = expandTermTreeToFinal(term.expr, context);
        return term;
    } else if (term.isUnaryOpTerm) {
        term.expr = expandTermTreeToFinal(term.expr, context);
        return term;
    } else if (term.isBinOpTerm || term.isAssignmentExpressionTerm) {
        term.left = expandTermTreeToFinal(term.left, context);
        term.right = expandTermTreeToFinal(term.right, context);
        return term;
    } else if (term.isObjGetTerm) {
        term.left = expandTermTreeToFinal(term.left, context);
        term.right.delim.token.inner = expand(term.right.delim.token.inner, context);
        return term;
    } else if (term.isObjDotGetTerm) {
        term.left = expandTermTreeToFinal(term.left, context);
        term.right = expandTermTreeToFinal(term.right, context);
        return term;
    } else if (term.isConditionalExpressionTerm) {
        term.cond = expandTermTreeToFinal(term.cond, context);
        term.tru = expandTermTreeToFinal(term.tru, context);
        term.fls = expandTermTreeToFinal(term.fls, context);
        return term;
    } else if (term.isVariableDeclarationTerm) {
        if (term.init) {
            term.init = expandTermTreeToFinal(term.init, context);
        }
        return term;
    } else if (term.isVariableStatementTerm) {
        term.decls = _.map(term.decls, function(decl) {
            return expandTermTreeToFinal(decl, context);
        });
        return term;
    } else if (term.isDelimiterTerm) {
        // expand inside the delimiter and then continue on
        term.delim.token.inner = expand(term.delim.token.inner, context);
        return term;
    } else if (term.isIdTerm) {
        var varTrans = getCompiletimeValue(term.id, context, context.phase);
        if (varTrans instanceof VarTransform) {
            term.id = syntaxFromToken(term.id.token, varTrans.id) ;
        }
        return term;
    // } else if (term.isClassDeclarationTerm) {
    //     let newScope = freshScope(context.bindings);
    //     context.
    //     term.body = term.body.mark(newScope);
    //     term.body.token.inner = expand(term.body.token.inner, context);
    //     return term;
    } else if (term.isNamedFunTerm ||
               term.isAnonFunTerm ||
               term.isCatchClauseTerm ||
               term.isArrowFunTerm ||
               term.isModuleTerm) {
        // function definitions need a bunch of hygiene logic
        // push down a fresh definition context
        var newDef = [];

        let scope = freshScope(context.bindings);
        let useScope = freshScope(context.bindings);

        var paramSingleIdent = term.params && term.params.isIdentifier();

        var params;
        if (term.params && term.params.isDelimiter()) {
            params = term.params;
        } else if (paramSingleIdent) {
            params = term.params;
        } else {
            params = syn.makeDelim("()", [], null);
        }
        var bodies;
        if (Array.isArray(term.body)) {
            bodies = syn.makeDelim("{}", term.body, null);
        } else {
            bodies = term.body;
        }


        var paramNames = _.map(getParamIdentifiers(params), function(param) {
            let paramNew = param.mark(scope);

            context.bindings.add(paramNew, fresh(), context.phase);

            context.env.set(paramNew,
                            context.phase,
                            new CompiletimeValue(new VarTransform(paramNew),
                                                 context.moduleRecord.name,
                                                 context.phase));
            return {
                originalParam: param,
                renamedParam: paramNew
            };
        });

        var bodyContext = makeExpanderContext(_.defaults({
            scope: scope,
            useScope: useScope,
            defscope: newDef,
            // paramscope is used to filter out var redeclarations
            paramscope: paramNames.map(function(p) {
                return p.renamedParam;
            })
        }, context));


        var renamedBody = bodies.mark(scope);

        var expandedResult = expandToTermTree(renamedBody.token.inner, bodyContext);
        var bodyTerms = expandedResult.terms;

        if(expandedResult.restStx) {
            // The expansion was halted prematurely. Just stop and
            // return what we have so far, along with the rest of the syntax
            renamedBody.token.inner = expandedResult.terms.concat(expandedResult.restStx);
            if(Array.isArray(term.body)) {
                term.body = renamedBody.token.inner;
            }
            else {
                term.body = renamedBody;
            }
            return term;
        }

        var renamedParams = _.map(paramNames, function(p) { return p.renamedParam});
        var flatArgs;
        if (paramSingleIdent) {
            flatArgs = renamedParams[0];
        } else {
            var puncCtx = (term.params || null);
            flatArgs = syn.makeDelim("()",
                                     joinSyntax(renamedParams, syn.makePunc(",", puncCtx)),
                                     puncCtx);
        }

        var expandedArgs = expand([flatArgs], bodyContext);
        assert(expandedArgs.length === 1, "should only get back one result");
        // stitch up the function with all the renamings
        if (term.params) {
            term.params = expandedArgs[0];
        }

        bodyTerms = _.map(bodyTerms, function(bodyTerm) {
            // add the definition context to the result of
            // expansion (this makes sure that syntax objects
            // introduced by expansion have the def context)
            if (bodyTerm.isBlockTerm) {
                // we need to expand blocks before adding the defctx since
                // blocks defer macro expansion.
                var blockFinal = expandTermTreeToFinal(bodyTerm,
                                                       expandedResult.context);
                return blockFinal;
            } else {
                var termWithCtx = bodyTerm;
                // finish expansion
                return expandTermTreeToFinal(termWithCtx,
                                             expandedResult.context);
            }
        })

        if (term.isModuleTerm) {
            bodyTerms.forEach(bodyTerm => {
                if (bodyTerm.isExportNameTerm ||
                    bodyTerm.isExportDeclTerm ||
                    bodyTerm.isExportDefaultTerm) {
                    context.moduleRecord.addExport(bodyTerm);
                }
            });
        }

        renamedBody.token.inner = bodyTerms;
        if (Array.isArray(term.body)) {
            term.body = renamedBody.token.inner;
        } else {
            term.body = renamedBody;
        }

        // and continue expand the rest
        return term;
    }
    // the term is fine as is
    return term;
}

// @ let TermTree = {}

// similar to `parse` in the honu paper
// @ ([...SyntaxObject], ExpanderContext) -> [...TermTreeObject]
function expand(stx, context) {
    assert(context, "must provide an expander context");

    var trees = expandToTermTree(stx, context);
    var terms = _.map(trees.terms, function(term) {
        return expandTermTreeToFinal(term, trees.context);
    });

    if(trees.restStx) {
        terms.push.apply(terms, trees.restStx);
    }

    return terms;
}

function makeExpanderContext(o) {
    o = o || {};

    var env = o.env || new NameMap();
    var store = o.store || new NameMap();
    var bindings = o.bindings || new BindingMap();

    return Object.create(Object.prototype, {
        filename: {value: o.filename,
                   writable: false, enumerable: true, configurable: false},
        compileSuffix: {value: o.compileSuffix || ".jsc",
                        writable: false, enumerable: true, configurable: false},
        env: {value: env,
              writable: false, enumerable: true, configurable: false},
        store: {value: store,
              writable: false, enumerable: true, configurable: false},
        defscope: {value: o.defscope,
                   writable: false, enumerable: true, configurable: false},
        paramscope: {value: o.paramscope,
                     writable: false, enumerable: true, configurable: false},
        templateMap: {value: o.templateMap || new StringMap(),
                      writable: false, enumerable: true, configurable: false},
        patternMap: {value: o.patternMap || new StringMap(),
                     writable: false, enumerable: true, configurable: false},
        mark: {value: o.mark,
                      writable: false, enumerable: true, configurable: false},
        bindings: {value: bindings,
                      writable: false, enumerable: true, configurable: false},
        scope: {value: o.scope,
                      writable: false, enumerable: true, configurable: false},
        useScope: {value: o.useScope,
                      writable: false, enumerable: true, configurable: false},
        phase: {value: o.phase || 0,
                      writable: false, enumerable: true, configurable: false},
        implicitImport: {value: o.implicitImport || new StringMap(),
                         writable: false, enumerable: true, configurable: false},
        stopMap: {value: o.stopMap || new StringMap(),
                         writable: false, enumerable: true, configurable: false},
        moduleRecord: {value: o.moduleRecord || {},
                       writable: false, enumerable: true, configurable: false}
    });
}

function makeModuleExpanderContext(filename, templateMap, patternMap, phase, moduleRecord, compileSuffix, bindings) {
    return makeExpanderContext({
        filename: filename,
        templateMap: templateMap,
        patternMap: patternMap,
        phase: phase,
        moduleRecord: moduleRecord,
        compileSuffix: compileSuffix,
        bindings: bindings
    });
}

// @ (Str, Str) -> Str
function resolvePath(name, parent) {
    var path = require("path");
    var resolveSync = require("resolve/lib/sync");
    var root  = path.dirname(parent);
    var fs = require("fs");
    if (name[0] === ".") {
        name = path.resolve(root, name);
    }
    return resolveSync(name, {
        basedir: root,
        extensions: ['.js', '.sjs']
    });
}

// (Str) -> [...SyntaxObject]
function defaultImportStx(importPath, ctx) {
    let rtNames = [
        "stxnonrec",
        "stxrec",
        "macroclass",
        "operator"
    ]
    var ctNames = [
        "quoteSyntax",
        "syntax",
        "#",
        "syntaxCase",
        "stxnonrec",
        "stxrec",
        "withSyntax",
        "letstx",
        "macroclass",
        "operator"
    ];

    var importNames = rtNames.map(name => syn.makeIdent(name, ctx));
    var importForMacrosNames = ctNames.map(name => syn.makeIdent(name, ctx));
    // import { names ... } from "importPath" for phase 1
    var importForMacrosStmt = [syn.makeKeyword("import", ctx),
                               syn.makeDelim("{}", joinSyntax(importForMacrosNames,
                                                              syn.makePunc(",", ctx)),
                                             ctx),
                               syn.makeIdent("from", ctx),
                               syn.makeValue(importPath, ctx),
                               syn.makeKeyword("for", ctx),
                               syn.makeIdent("phase", ctx),
                               syn.makeValue(1, ctx)];

    // import { names ... } from "importPath"
    var importStmt = [syn.makeKeyword("import", ctx),
                      syn.makeDelim("{}", joinSyntax(importNames,
                                                     syn.makePunc(",", ctx)),
                                    ctx),
                      syn.makeIdent("from", ctx),
                      syn.makeValue(importPath, ctx)];

    return importStmt.concat(importForMacrosStmt);
}

// @ (Str, [...SyntaxObject]) -> {
//    record: ModuleRecord,
//    term: ModuleTerm
// }
function createModule(name, body) {
    var language = "base";
    var modBody = body;

    if (body && body[0] && body[1] && body[2] &&
        unwrapSyntax(body[0]) === "#" &&
        unwrapSyntax(body[1]) === "lang" &&
        body[2].isStringLiteral()) {

        language = unwrapSyntax(body[2]);
        // consume optional semicolon
        modBody = body[3] && body[3].token.value === ";" &&
            body[3].isPunctuator() ? body.slice(4) : body.slice(3);
    }

    // insert the default import statements into the module body
    if (language !== "base" && language !== "js") {
        // "base" and "js" are currently special languages meaning don't
        // insert the default imports
        modBody = defaultImportStx(language, body[0]).concat(modBody);
    }

    return {
        record: new ModuleRecord(name, language),
        term: ModuleTerm.create(modBody)
    };
}

// @ (Str) -> {
//     record: ModuleRecord,
//     term: ModuleTerm
// }
function loadModule(name) {
    // node specific code
    var fs = require("fs");
    return fs.readFileSync(name, 'utf8')
        |> parser.read |> body => {
            return createModule(name, body)
        };

}

// For a given module, phase, and context load the runtime values
// into the context and return the modified context
// @ (ModuleTerm, ModuleRecord, Num, ExpanderContext) -> ExpanderContext
function invoke(modTerm, modRecord, phase, context) {
    if (modRecord.language === "base") {
        // base modules can just use the normal require pipeline
        var exported = require(modRecord.name);
        Object.keys(exported).forEach(exp => {
            // create new bindings in the context
            var expName = syn.makeIdent(exp, null).mark(freshScope(context.bindings));
            context.bindings.add(expName, fresh(), phase);

            modRecord.exportEntries.push(new ExportEntry(null, expName, expName));

            context.store.setWithModule(expName,
                                        phase,
                                        modRecord.name,
                                        new RuntimeValue({value: exported[exp]},
                                                         modRecord.name,
                                                         phase));
        })
    } else {
        // recursively invoke any imports in this module at this
        // phase and update the context
        modRecord.importedModules.forEach(impPath => {
            var importMod = loadImport(impPath, context, modRecord.name);

            var impEntries = modRecord.getImportsForModule(impPath);

            if (_.any(impEntries, entry => entry.forPhase === 0)) {
                context = invoke(importMod.term, importMod.record, phase, context);
            }
        });

        // turn the module into text so we can eval it
        var code = modTerm.body
            |> terms => terms.map(term => term.destruct(context, {stripCompileTerm: true,
                                                                  stripModuleTerm: true}))
            |> _.flatten
            |> flatten
            |> parser.parse
            |> codegen.generate

        var global = {
            console: console
        };

        // eval but with a fresh heap
        vm.runInNewContext(code, global);



        // update the exports with the runtime values
        modRecord.exportEntries.forEach(entry => {
            // we have to get the value with the localName
            var expName = resolve(entry.localName, 0);
            var expVal = global[expName];
            if (expVal) {
                context.bindings.add(entry.exportName, fresh(), phase);
                // and set it as the export name
                context.store.set(entry.exportName,
                                  phase,
                                  new RuntimeValue({value: expVal},
                                                   modRecord.name,
                                                   phase));

            }
        });
    }

    return context;
}

function visitTerms(terms, modRecord, phase, context) {
    var name;
    var macroDefinition;
    var exportName;
    var entries;

    terms.forEach(term => {
        // add the exported names to the module record
        if (term.isExportNameTerm ||
            term.isExportDeclTerm ||
            term.isExportDefaultTerm) {
            entries = modRecord.addExport(term);
        }


        if ((term.isExportDefaultTerm && term.decl.isMacroTerm) ||
            term.isMacroTerm) {
            let multiTokName, fullName,
                macBody = term.isExportDefaultTerm ? term.decl.body : term.body;
            macroDefinition = loadMacroDef(macBody, context, phase + 1);

            if (term.isExportDefaultTerm) {
                multiTokName = entries[0].exportName;
                fullName = [entries[0].exportName];
            } else {
                multiTokName = makeMultiToken(term.name);
                fullName = term.name.token.inner;
            }

            // todo: handle implicit imports

            context.bindings.add(multiTokName, fresh(), phase);
            context.store.set(multiTokName,
                              phase,
                              new CompiletimeValue(
                                  new SyntaxTransform(macroDefinition,
                                                      false,
                                                      builtinMode,
                                                      fullName),
                                  phase,
                                  modRecord.name));
        }

        if (term.isForPhaseTerm) {
            visitTerms(term.body, modRecord, phase + term.phase.token.value, context);
        }

        if (term.isOperatorDefinitionTerm) {
            var opDefinition = loadMacroDef(term.body, context, phase + 1);

            var multiTokName = makeMultiToken(term.name);
            var fullName = term.name.token.inner;

            var opObj = {
                isOp: true,
                builtin: builtinMode,
                fullName: fullName
            }
            assert(unwrapSyntax(term.type) === "binary" ||
                   unwrapSyntax(term.type) === "unary",
                   "operator must either be binary or unary");
            opObj[unwrapSyntax(term.type)] = {
                fn: opDefinition,
                prec: term.prec.token.value,
                assoc: term.assoc ? term.assoc.token.value : null
            };


            // bind in the store for the current phase
            context.bindings.add(multiTokName, fresh(), phase);
            context.store.set(multiTokName,
                              phase,
                              new CompiletimeValue(opObj,
                                                   phase,
                                                   modRecord.name));

        }
    })

}


// For a given module, phase, and context, load the compiletime values into
// the context and return the modified context
// @ (ModuleTerm, ModuleRecord, Num, ExpanderContext) -> ExpanderContext
function visit(modTerm, modRecord, phase, context) {
    // don't need to visit base modules since they do not support macros
    if (modRecord.language === "base") {
        return context;
    }
    // reset the exports
    modRecord.exportEntries = [];

    // for each of the imported modules, recursively visit and
    // invoke them at the appropriate phase and then bind the
    // imported names in this module
    modRecord.importedModules.forEach(impPath => {
        // load the (possibly cached) module for this import
        let importMod = loadImport(impPath, context, modRecord.name);
        // grab all the import statements for that module
        let impEntries = modRecord.getImportsForModule(impPath);

        let uniquePhases = _.uniq(impEntries.map(entry => entry.forPhase));
        uniquePhases.forEach(impPhase => {
            context = visit(importMod.term, importMod.record, phase + impPhase, context);
            // don't need to invoke when importing for phase 0 (runtime)
            if (impPhase > 0) {
                context = invoke(importMod.term, importMod.record, phase + impPhase, context);
            }
        });

        bindImportInMod(impEntries,
                        importMod.term,
                        importMod.record,
                        context,
                        phase);
    });

    // load the transformers into the store
    visitTerms(modTerm.body, modRecord, phase, context);

    return context;
}


// @ (ImportTerm, ExpanderContext) -> {
//     term: ModuleTerm
//     record: ModuleRecord
// }
function loadImport(path, context, parentPath) {
    var modFullPath = resolvePath(path, parentPath);
    if(!availableModules.has(modFullPath)) {
        // load it
        var modToImport = loadModule(modFullPath)
            |> mod => {
                if (mod.record.language === "base") {
                    return {
                        term: mod,
                        record: mod.record
                    };
                }
                var expanded = expandModule(mod.term,
                                            modFullPath,
                                            context.templateMap,
                                            context.patternMap,
                                            mod.record,
                                            context.compileSuffix,
                                            context.bindings);
                return {
                    term: expanded.mod,
                    record: expanded.context.moduleRecord
                };
            };
        availableModules.set(modFullPath, modToImport);
        return modToImport;
    }
    return availableModules.get(modFullPath);
}


// @ (ImportTerm, [...SyntaxObject], ModuleTerm, ModuleRecord, ExpanderContext, Num) -> Void
function bindImportInMod(impEntries, modTerm, modRecord, context, phase) {
    impEntries.forEach(entry => {
        var isBase = modRecord.language === "base";

        var inExports = _.find(modRecord.exportEntries, expEntry => {
            return unwrapSyntax(expEntry.exportName) === unwrapSyntax(entry.importName);
        });
        if (!(inExports || isBase)) {
            throwSyntaxError("compile",
                             "the imported name `" +
                             unwrapSyntax(entry.importName) +
                             "` was not exported from the module",
                             entry.importName);
        }

        var exportName;
        if (inExports) {
            exportName = inExports.exportName;
        } else {
            assert(false, "not implemented yet: missing export name")
        }

        var localName = entry.localName;

        context.bindings.addForward(localName, exportName, phase + entry.forPhase);
    });
}

// (ModuleTerm, Str, Map, Map, ModuleRecord) -> {
//     context: ExpanderContext,
//     mod: ModuleTerm
// }
function expandModule(mod, filename, templateMap, patternMap, moduleRecord, compileSuffix, bindings) {
    // create a new expander context for this module
    var context = makeModuleExpanderContext(filename,
                                            templateMap,
                                            patternMap,
                                            0,
                                            moduleRecord,
                                            compileSuffix,
                                            bindings);
    return {
        context: context,
        mod: expandTermTreeToFinal(mod, context)
    };
}

function isRuntimeName(stx, context) {
    if (stx.isDelimiter()) {
        return hasVarTransform(stx.token.inner, context, 0);
    } else {
        return hasVarTransform(stx, context, 0);
    }
}


// Takes an expanded module term and flattens it.
// @ (ModuleTerm, SweetOptions, TemplateMap, PatternMap) -> [...SyntaxObject]
function flattenModule(modTerm, modRecord, context) {

    // filter the imports to just the imports and names that are
    // actually available at runtime
    var imports = modRecord.getRuntimeImportEntries().filter(entry => {
        return isRuntimeName(entry.localName, context);
    });

    var exports = modRecord.exportEntries.filter(entry => {
        return isRuntimeName(entry.localName, context);
    })

    let eof;

    // filter out all of the import and export statements
    var output = modTerm.body.reduce((acc, term) => {
        if (term.isExportNameTerm ||
            term.isExportDeclTerm ||
            term.isExportDefaultTerm ||
            term.isImportTerm ||
            term.isImportForPhaseTerm) {
            return acc;
        }
        if (term.isEOFTerm) {
            eof = term.destruct(context);
            return acc;
        }
        return acc.concat(term.destruct(context, {stripCompileTerm: true}));
    }, []);


    output = output
        |> flatten
        |> output => output.map(stx => {
            var name = resolve(stx, 0);
            // collect the implicit imports (those imports that
            // must be included because a macro expanded to a reference
            // to an import from some other module)
            if (context.implicitImport.has(name)) {
                var implicit = context.implicitImport.get(name);
                // don't double add the import
                if (!_.find(imports, imp => imp === implicit)) {
                    imports.push(implicit);
                }
            }
            return stx;
        });

    // flatten everything
    var flatImports = imports.reduce((acc, entry) => {
        entry.moduleRequest = entry.moduleRequest.clone();
        entry.moduleRequest.token.value += context.compileSuffix;
        return acc.concat(flatten(entry
                                  .toTerm().destruct(context)
                                  .concat(syn.makePunc(";", entry.moduleRequest))));
    }, []);

    let flatExports = exports.reduce((acc, entry) => {
            return acc.concat(flatten(entry.toTerm()
                                           .destruct(context)
                                           .concat(syn.makePunc(";", entry.localName))));
    }, []);

    return {
        imports: imports.map(entry => entry.toTerm()),
        body: flatImports.concat(output).concat(flatExports).concat(eof)
    };
}

// The entry point to expanding with modules. Starting from the
// token tree of a module, compile it and all its imports. Return
// an array of all the compiled modules.
// @ ([...SyntaxObject], {filename: Str}) -> [...{ path: Str, code: [...SyntaxObject]}]
function compileModule(stx, options) {
    var fs = require("fs");
    options = options || {};
    var filename = options && typeof options.filename !== 'undefined'
        ? fs.realpathSync(options.filename)
        : "(anonymous module)";
    maxExpands = Infinity;
    expandCount = 0;
    var mod = createModule(filename, stx);
    // the template and pattern maps are global for every module
    var templateMap = new StringMap();
    var patternMap = new StringMap();
    availableModules = new StringMap();

    var expanded = expandModule(mod.term,
                                filename,
                                templateMap,
                                patternMap,
                                mod.record,
                                options.compileSuffix);
    var flattened = flattenModule(expanded.mod,
                                  expanded.context.moduleRecord,
                                  expanded.context);

    let compiledModules = [];
    availableModules.keys().forEach(modName => {
        let mod = availableModules.get(modName);
        if (mod.record.language !== "base") {
            var flattened = flattenModule(mod.term, mod.record, expanded.context);
            compiledModules.push({
                path: modName,
                code: flattened.body
            });
        }
    });

    return [{
        path: filename,
        code: flattened.body
    }].concat(compiledModules);
}


// break delimiter tree structure down to flat array of syntax objects
// @ ([...SyntaxObject]) -> [...SyntaxObject]
function flatten(stx) {
    return _.reduce(stx, function(acc, stx) {
        if (stx.isDelimiter()) {
            var openParen = syntaxFromToken({
                type: parser.Token.Punctuator,
                value: stx.token.value[0],
                range: stx.token.startRange,
                sm_range: (typeof stx.token.sm_startRange == 'undefined'
                            ? stx.token.startRange
                            : stx.token.sm_startRange),
                lineNumber: stx.token.startLineNumber,
                sm_lineNumber: (typeof stx.token.sm_startLineNumber == 'undefined'
                                ? stx.token.startLineNumber
                                : stx.token.sm_startLineNumber),
                lineStart: stx.token.startLineStart,
                sm_lineStart: (typeof stx.token.sm_startLineStart == 'undefined'
                               ? stx.token.startLineStart
                               : stx.token.sm_startLineStart)
            }, stx);
            var closeParen = syntaxFromToken({
                type: parser.Token.Punctuator,
                value: stx.token.value[1],
                range: stx.token.endRange,
                sm_range: (typeof stx.token.sm_endRange == 'undefined'
                            ? stx.token.endRange
                            : stx.token.sm_endRange),
                lineNumber: stx.token.endLineNumber,
                sm_lineNumber: (typeof stx.token.sm_endLineNumber == 'undefined'
                                ? stx.token.endLineNumber
                                : stx.token.sm_endLineNumber),
                lineStart: stx.token.endLineStart,
                sm_lineStart: (typeof stx.token.sm_endLineStart == 'undefined'
                                ? stx.token.endLineStart
                                : stx.token.sm_endLineStart)
            }, stx);
            if (stx.token.leadingComments) {
                openParen.token.leadingComments = stx.token.leadingComments;
            }
            if (stx.token.trailingComments) {
                openParen.token.trailingComments = stx.token.trailingComments;
            }
            acc.push(openParen);
            push.apply(acc, flatten(stx.token.inner));
            acc.push(closeParen);
            return acc;
        }
        stx.token.sm_lineNumber = typeof stx.token.sm_lineNumber != 'undefined'
                                ? stx.token.sm_lineNumber
                                : stx.token.lineNumber;
        stx.token.sm_lineStart = typeof stx.token.sm_lineStart != 'undefined'
                                ? stx.token.sm_lineStart
                                : stx.token.lineStart;
        stx.token.sm_range = typeof stx.token.sm_range != 'undefined'
                                ? stx.token.sm_range
                                : stx.token.range;
        acc.push(stx);
        return acc;
    }, []);
}

exports.StringMap = StringMap;
exports.enforest = enforest;
exports.compileModule = compileModule;

exports.getCompiletimeValue = getCompiletimeValue;
exports.hasCompiletimeValue = hasCompiletimeValue;

exports.getSyntaxTransform = getSyntaxTransform;
exports.hasSyntaxTransform = hasSyntaxTransform;

exports.resolve = resolve;
exports.get_expression = get_expression;

exports.makeExpanderContext = makeExpanderContext;

exports.ExprTerm = ExprTerm;
exports.VariableStatementTerm = VariableStatementTerm;

exports.tokensToSyntax = syn.tokensToSyntax;
exports.syntaxToTokens = syn.syntaxToTokens;
