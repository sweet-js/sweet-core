"use strict";

var _3147 = require("underscore"),
    syn3148 = require("../syntax"),
    assert3149 = require("assert");
var syntaxFromToken3150 = syn3148.syntaxFromToken,
    adjustLineContext3151 = syn3148.adjustLineContext,
    fresh3152 = syn3148.fresh;
var push3153 = Array.prototype.push;
function inherit3154(parent3396, child3397, methods3398) {
    var P3399 = function P3399() {};
    P3399.prototype = parent3396.prototype;
    child3397.prototype = new P3399();
    child3397.prototype.constructor = child3397;
    _3147.extend(child3397.prototype, methods3398);
}
function TermTree3339() {}
TermTree3339.properties = [];
TermTree3339.create = function () {
    return new TermTree3339();
};
TermTree3339.prototype = {
    isTermTree: true,
    destruct: function (context3400, options3401) {
        assert3149(context3400, "must pass in the context to destruct");
        options3401 = options3401 || {};
        var self3402 = this;
        if (options3401.stripCompileTerm && this.isCompileTimeTerm) {
            return [];
        }
        if (options3401.stripModuleTerm && this.isModuleTimeTerm) {
            return [];
        }
        return _3147.reduce(this.constructor.properties, function (acc3403, prop3404) {
            if (self3402[prop3404] && self3402[prop3404].isTermTree) {
                push3153.apply(acc3403, self3402[prop3404].destruct(context3400, options3401));
                return acc3403;
            } else if (self3402[prop3404] && self3402[prop3404].token && self3402[prop3404].token.inner) {
                var src3405 = self3402[prop3404].token;
                var keys3406 = Object.keys(src3405);
                var newtok3407 = {};
                for (var i3408 = 0, len3409 = keys3406.length, key3410; i3408 < len3409; i3408++) {
                    key3410 = keys3406[i3408];
                    newtok3407[key3410] = src3405[key3410];
                }
                var clone3411 = syntaxFromToken3150(newtok3407, self3402[prop3404]);
                clone3411.token.inner = _3147.reduce(clone3411.token.inner, function (acc3412, t3413) {
                    if (t3413 && t3413.isTermTree) {
                        push3153.apply(acc3412, t3413.destruct(context3400, options3401));
                        return acc3412;
                    }
                    acc3412.push(t3413);
                    return acc3412;
                }, []);
                acc3403.push(clone3411);
                return acc3403;
            } else if (Array.isArray(self3402[prop3404])) {
                var destArr3414 = _3147.reduce(self3402[prop3404], function (acc3415, t3416) {
                    if (t3416 && t3416.isTermTree) {
                        push3153.apply(acc3415, t3416.destruct(context3400, options3401));
                        return acc3415;
                    }
                    acc3415.push(t3416);
                    return acc3415;
                }, []);
                push3153.apply(acc3403, destArr3414);
                return acc3403;
            } else if (self3402[prop3404]) {
                acc3403.push(self3402[prop3404]);
                return acc3403;
            } else {
                return acc3403;
            }
        }, []);
    }
};
function EOFTerm3340(eof3417) {
    this.eof = eof3417;
}
EOFTerm3340.properties = ["eof"];
EOFTerm3340.create = function (eof3418) {
    return new EOFTerm3340(eof3418);
};
inherit3154(TermTree3339, EOFTerm3340, { isEOFTerm: true });
function KeywordTerm3341(keyword3419) {
    this.keyword = keyword3419;
}
KeywordTerm3341.properties = ["keyword"];
KeywordTerm3341.create = function (keyword3420) {
    return new KeywordTerm3341(keyword3420);
};
inherit3154(TermTree3339, KeywordTerm3341, { isKeywordTerm: true });
function PuncTerm3342(punc3421) {
    this.punc = punc3421;
}
PuncTerm3342.properties = ["punc"];
PuncTerm3342.create = function (punc3422) {
    return new PuncTerm3342(punc3422);
};
inherit3154(TermTree3339, PuncTerm3342, { isPuncTerm: true });
function DelimiterTerm3343(delim3423) {
    this.delim = delim3423;
}
DelimiterTerm3343.properties = ["delim"];
DelimiterTerm3343.create = function (delim3424) {
    return new DelimiterTerm3343(delim3424);
};
inherit3154(TermTree3339, DelimiterTerm3343, { isDelimiterTerm: true });
function ModuleTimeTerm3344() {}
ModuleTimeTerm3344.properties = [];
ModuleTimeTerm3344.create = function () {
    return new ModuleTimeTerm3344();
};
inherit3154(TermTree3339, ModuleTimeTerm3344, { isModuleTimeTerm: true });
function ModuleTerm3345(body3425) {
    this.body = body3425;
}
ModuleTerm3345.properties = ["body"];
ModuleTerm3345.create = function (body3426) {
    return new ModuleTerm3345(body3426);
};
inherit3154(ModuleTimeTerm3344, ModuleTerm3345, { isModuleTerm: true });
function ImportTerm3346(kw3427, clause3428, fromkw3429, from3430) {
    this.kw = kw3427;
    this.clause = clause3428;
    this.fromkw = fromkw3429;
    this.from = from3430;
}
ImportTerm3346.properties = ["kw", "clause", "fromkw", "from"];
ImportTerm3346.create = function (kw3431, clause3432, fromkw3433, from3434) {
    return new ImportTerm3346(kw3431, clause3432, fromkw3433, from3434);
};
inherit3154(ModuleTimeTerm3344, ImportTerm3346, { isImportTerm: true });
function ImportForPhaseTerm3347(kw3435, clause3436, fromkw3437, from3438, forkw3439, macroskw3440, phase3441) {
    this.kw = kw3435;
    this.clause = clause3436;
    this.fromkw = fromkw3437;
    this.from = from3438;
    this.forkw = forkw3439;
    this.macroskw = macroskw3440;
    this.phase = phase3441;
}
ImportForPhaseTerm3347.properties = ["kw", "clause", "fromkw", "from", "forkw", "macroskw", "phase"];
ImportForPhaseTerm3347.create = function (kw3442, clause3443, fromkw3444, from3445, forkw3446, macroskw3447, phase3448) {
    return new ImportForPhaseTerm3347(kw3442, clause3443, fromkw3444, from3445, forkw3446, macroskw3447, phase3448);
};
inherit3154(ModuleTimeTerm3344, ImportForPhaseTerm3347, { isImportForPhaseTerm: true });
function NamedImportTerm3348(names3449) {
    this.names = names3449;
}
NamedImportTerm3348.properties = ["names"];
NamedImportTerm3348.create = function (names3450) {
    return new NamedImportTerm3348(names3450);
};
inherit3154(ModuleTimeTerm3344, NamedImportTerm3348, { isNamedImportTerm: true });
function DefaultImportTerm3349(name3451) {
    this.name = name3451;
}
DefaultImportTerm3349.properties = ["name"];
DefaultImportTerm3349.create = function (name3452) {
    return new DefaultImportTerm3349(name3452);
};
inherit3154(ModuleTimeTerm3344, DefaultImportTerm3349, { isDefaultImportTerm: true });
function NamespaceImportTerm3350(star3453, askw3454, name3455) {
    this.star = star3453;
    this.askw = askw3454;
    this.name = name3455;
}
NamespaceImportTerm3350.properties = ["star", "askw", "name"];
NamespaceImportTerm3350.create = function (star3456, askw3457, name3458) {
    return new NamespaceImportTerm3350(star3456, askw3457, name3458);
};
inherit3154(ModuleTimeTerm3344, NamespaceImportTerm3350, { isNamespaceImportTerm: true });
function BindingTerm3351(importName3459) {
    this.importName = importName3459;
}
BindingTerm3351.properties = ["importName"];
BindingTerm3351.create = function (importName3460) {
    return new BindingTerm3351(importName3460);
};
inherit3154(ModuleTimeTerm3344, BindingTerm3351, { isBindingTerm: true });
function QualifiedBindingTerm3352(importName3461, askw3462, localName3463) {
    this.importName = importName3461;
    this.askw = askw3462;
    this.localName = localName3463;
}
QualifiedBindingTerm3352.properties = ["importName", "askw", "localName"];
QualifiedBindingTerm3352.create = function (importName3464, askw3465, localName3466) {
    return new QualifiedBindingTerm3352(importName3464, askw3465, localName3466);
};
inherit3154(ModuleTimeTerm3344, QualifiedBindingTerm3352, { isQualifiedBindingTerm: true });
function ExportNameTerm3353(kw3467, name3468) {
    this.kw = kw3467;
    this.name = name3468;
}
ExportNameTerm3353.properties = ["kw", "name"];
ExportNameTerm3353.create = function (kw3469, name3470) {
    return new ExportNameTerm3353(kw3469, name3470);
};
inherit3154(ModuleTimeTerm3344, ExportNameTerm3353, { isExportNameTerm: true });
function ExportDefaultTerm3354(kw3471, defaultkw3472, decl3473) {
    this.kw = kw3471;
    this.defaultkw = defaultkw3472;
    this.decl = decl3473;
}
ExportDefaultTerm3354.properties = ["kw", "defaultkw", "decl"];
ExportDefaultTerm3354.create = function (kw3474, defaultkw3475, decl3476) {
    return new ExportDefaultTerm3354(kw3474, defaultkw3475, decl3476);
};
inherit3154(ModuleTimeTerm3344, ExportDefaultTerm3354, { isExportDefaultTerm: true });
function ExportDeclTerm3355(kw3477, decl3478) {
    this.kw = kw3477;
    this.decl = decl3478;
}
ExportDeclTerm3355.properties = ["kw", "decl"];
ExportDeclTerm3355.create = function (kw3479, decl3480) {
    return new ExportDeclTerm3355(kw3479, decl3480);
};
inherit3154(ModuleTimeTerm3344, ExportDeclTerm3355, { isExportDeclTerm: true });
function CompileTimeTerm3356() {}
CompileTimeTerm3356.properties = [];
CompileTimeTerm3356.create = function () {
    return new CompileTimeTerm3356();
};
inherit3154(TermTree3339, CompileTimeTerm3356, { isCompileTimeTerm: true });
function MacroTerm3357(name3481, body3482) {
    this.name = name3481;
    this.body = body3482;
}
MacroTerm3357.properties = ["name", "body"];
MacroTerm3357.create = function (name3483, body3484) {
    return new MacroTerm3357(name3483, body3484);
};
inherit3154(CompileTimeTerm3356, MacroTerm3357, { isMacroTerm: true });
function OperatorDefinitionTerm3358(type3485, name3486, prec3487, assoc3488, body3489) {
    this.type = type3485;
    this.name = name3486;
    this.prec = prec3487;
    this.assoc = assoc3488;
    this.body = body3489;
}
OperatorDefinitionTerm3358.properties = ["type", "name", "prec", "assoc", "body"];
OperatorDefinitionTerm3358.create = function (type3490, name3491, prec3492, assoc3493, body3494) {
    return new OperatorDefinitionTerm3358(type3490, name3491, prec3492, assoc3493, body3494);
};
inherit3154(CompileTimeTerm3356, OperatorDefinitionTerm3358, { isOperatorDefinitionTerm: true });
function ForPhaseTerm3359(phase3495, body3496) {
    this.phase = phase3495;
    this.body = body3496;
}
ForPhaseTerm3359.properties = ["phase", "body"];
ForPhaseTerm3359.create = function (phase3497, body3498) {
    return new ForPhaseTerm3359(phase3497, body3498);
};
inherit3154(CompileTimeTerm3356, ForPhaseTerm3359, { isForPhaseTerm: true });
function VariableDeclarationTerm3360(ident3499, eq3500, init3501, comma3502) {
    this.ident = ident3499;
    this.eq = eq3500;
    this.init = init3501;
    this.comma = comma3502;
}
VariableDeclarationTerm3360.properties = ["ident", "eq", "init", "comma"];
VariableDeclarationTerm3360.create = function (ident3503, eq3504, init3505, comma3506) {
    return new VariableDeclarationTerm3360(ident3503, eq3504, init3505, comma3506);
};
inherit3154(TermTree3339, VariableDeclarationTerm3360, { isVariableDeclarationTerm: true });
function StatementTerm3361() {}
StatementTerm3361.properties = [];
StatementTerm3361.create = function () {
    return new StatementTerm3361();
};
inherit3154(TermTree3339, StatementTerm3361, { isStatementTerm: true });
function EmptyTerm3362() {}
EmptyTerm3362.properties = [];
EmptyTerm3362.create = function () {
    return new EmptyTerm3362();
};
inherit3154(StatementTerm3361, EmptyTerm3362, { isEmptyTerm: true });
function CatchClauseTerm3363(keyword3507, params3508, body3509) {
    this.keyword = keyword3507;
    this.params = params3508;
    this.body = body3509;
}
CatchClauseTerm3363.properties = ["keyword", "params", "body"];
CatchClauseTerm3363.create = function (keyword3510, params3511, body3512) {
    return new CatchClauseTerm3363(keyword3510, params3511, body3512);
};
inherit3154(StatementTerm3361, CatchClauseTerm3363, { isCatchClauseTerm: true });
function ForStatementTerm3364(keyword3513, cond3514) {
    this.keyword = keyword3513;
    this.cond = cond3514;
}
ForStatementTerm3364.properties = ["keyword", "cond"];
ForStatementTerm3364.create = function (keyword3515, cond3516) {
    return new ForStatementTerm3364(keyword3515, cond3516);
};
inherit3154(StatementTerm3361, ForStatementTerm3364, { isForStatementTerm: true });
function ClassDeclarationTerm3365(keyword3517, name3518, body3519) {
    this.keyword = keyword3517;
    this.name = name3518;
    this.body = body3519;
}
ClassDeclarationTerm3365.properties = ["keyword", "name", "body"];
ClassDeclarationTerm3365.create = function (keyword3520, name3521, body3522) {
    return new ClassDeclarationTerm3365(keyword3520, name3521, body3522);
};
inherit3154(StatementTerm3361, ClassDeclarationTerm3365, { isClassDeclarationTerm: true });
function ReturnStatementTerm3366(keyword3523, expr3524) {
    this.keyword = keyword3523;
    this.expr = expr3524;
}
ReturnStatementTerm3366.properties = ["keyword", "expr"];
ReturnStatementTerm3366.create = function (keyword3525, expr3526) {
    return new ReturnStatementTerm3366(keyword3525, expr3526);
};
inherit3154(StatementTerm3361, ReturnStatementTerm3366, {
    isReturnStatementTerm: true,
    destruct: function (context3527, options3528) {
        var expr3529 = this.expr.destruct(context3527, options3528);
        // need to adjust the line numbers to make sure that the expr
        // starts on the same line as the return keyword. This might
        // not be the case if an operator or infix macro perturbed the
        // line numbers during expansion.
        expr3529 = adjustLineContext3151(expr3529, this.keyword.keyword);
        return this.keyword.destruct(context3527, options3528).concat(expr3529);
    }
});
function ExprTerm3367() {}
ExprTerm3367.properties = [];
ExprTerm3367.create = function () {
    return new ExprTerm3367();
};
inherit3154(StatementTerm3361, ExprTerm3367, { isExprTerm: true });
function UnaryOpTerm3368(op3530, expr3531) {
    this.op = op3530;
    this.expr = expr3531;
}
UnaryOpTerm3368.properties = ["op", "expr"];
UnaryOpTerm3368.create = function (op3532, expr3533) {
    return new UnaryOpTerm3368(op3532, expr3533);
};
inherit3154(ExprTerm3367, UnaryOpTerm3368, { isUnaryOpTerm: true });
function PostfixOpTerm3369(expr3534, op3535) {
    this.expr = expr3534;
    this.op = op3535;
}
PostfixOpTerm3369.properties = ["expr", "op"];
PostfixOpTerm3369.create = function (expr3536, op3537) {
    return new PostfixOpTerm3369(expr3536, op3537);
};
inherit3154(ExprTerm3367, PostfixOpTerm3369, { isPostfixOpTerm: true });
function BinOpTerm3370(left3538, op3539, right3540) {
    this.left = left3538;
    this.op = op3539;
    this.right = right3540;
}
BinOpTerm3370.properties = ["left", "op", "right"];
BinOpTerm3370.create = function (left3541, op3542, right3543) {
    return new BinOpTerm3370(left3541, op3542, right3543);
};
inherit3154(ExprTerm3367, BinOpTerm3370, { isBinOpTerm: true });
function AssignmentExpressionTerm3371(left3544, op3545, right3546) {
    this.left = left3544;
    this.op = op3545;
    this.right = right3546;
}
AssignmentExpressionTerm3371.properties = ["left", "op", "right"];
AssignmentExpressionTerm3371.create = function (left3547, op3548, right3549) {
    return new AssignmentExpressionTerm3371(left3547, op3548, right3549);
};
inherit3154(ExprTerm3367, AssignmentExpressionTerm3371, { isAssignmentExpressionTerm: true });
function ConditionalExpressionTerm3372(cond3550, question3551, tru3552, colon3553, fls3554) {
    this.cond = cond3550;
    this.question = question3551;
    this.tru = tru3552;
    this.colon = colon3553;
    this.fls = fls3554;
}
ConditionalExpressionTerm3372.properties = ["cond", "question", "tru", "colon", "fls"];
ConditionalExpressionTerm3372.create = function (cond3555, question3556, tru3557, colon3558, fls3559) {
    return new ConditionalExpressionTerm3372(cond3555, question3556, tru3557, colon3558, fls3559);
};
inherit3154(ExprTerm3367, ConditionalExpressionTerm3372, { isConditionalExpressionTerm: true });
function NamedFunTerm3373(keyword3560, star3561, name3562, params3563, body3564) {
    this.keyword = keyword3560;
    this.star = star3561;
    this.name = name3562;
    this.params = params3563;
    this.body = body3564;
}
NamedFunTerm3373.properties = ["keyword", "star", "name", "params", "body"];
NamedFunTerm3373.create = function (keyword3565, star3566, name3567, params3568, body3569) {
    return new NamedFunTerm3373(keyword3565, star3566, name3567, params3568, body3569);
};
inherit3154(ExprTerm3367, NamedFunTerm3373, { isNamedFunTerm: true });
function AnonFunTerm3374(keyword3570, star3571, params3572, body3573) {
    this.keyword = keyword3570;
    this.star = star3571;
    this.params = params3572;
    this.body = body3573;
}
AnonFunTerm3374.properties = ["keyword", "star", "params", "body"];
AnonFunTerm3374.create = function (keyword3574, star3575, params3576, body3577) {
    return new AnonFunTerm3374(keyword3574, star3575, params3576, body3577);
};
inherit3154(ExprTerm3367, AnonFunTerm3374, { isAnonFunTerm: true });
function ArrowFunTerm3375(params3578, arrow3579, body3580) {
    this.params = params3578;
    this.arrow = arrow3579;
    this.body = body3580;
}
ArrowFunTerm3375.properties = ["params", "arrow", "body"];
ArrowFunTerm3375.create = function (params3581, arrow3582, body3583) {
    return new ArrowFunTerm3375(params3581, arrow3582, body3583);
};
inherit3154(ExprTerm3367, ArrowFunTerm3375, { isArrowFunTerm: true });
function ObjDotGetTerm3376(left3584, dot3585, right3586) {
    this.left = left3584;
    this.dot = dot3585;
    this.right = right3586;
}
ObjDotGetTerm3376.properties = ["left", "dot", "right"];
ObjDotGetTerm3376.create = function (left3587, dot3588, right3589) {
    return new ObjDotGetTerm3376(left3587, dot3588, right3589);
};
inherit3154(ExprTerm3367, ObjDotGetTerm3376, { isObjDotGetTerm: true });
function ObjGetTerm3377(left3590, right3591) {
    this.left = left3590;
    this.right = right3591;
}
ObjGetTerm3377.properties = ["left", "right"];
ObjGetTerm3377.create = function (left3592, right3593) {
    return new ObjGetTerm3377(left3592, right3593);
};
inherit3154(ExprTerm3367, ObjGetTerm3377, { isObjGetTerm: true });
function TemplateTerm3378(template3594) {
    this.template = template3594;
}
TemplateTerm3378.properties = ["template"];
TemplateTerm3378.create = function (template3595) {
    return new TemplateTerm3378(template3595);
};
inherit3154(ExprTerm3367, TemplateTerm3378, { isTemplateTerm: true });
function CallTerm3379(fun3596, args3597) {
    this.fun = fun3596;
    this.args = args3597;
}
CallTerm3379.properties = ["fun", "args"];
CallTerm3379.create = function (fun3598, args3599) {
    return new CallTerm3379(fun3598, args3599);
};
inherit3154(ExprTerm3367, CallTerm3379, { isCallTerm: true });
function QuoteSyntaxTerm3380(stx3600) {
    this.stx = stx3600;
}
QuoteSyntaxTerm3380.properties = ["stx"];
QuoteSyntaxTerm3380.create = function (stx3601) {
    return new QuoteSyntaxTerm3380(stx3601);
};
inherit3154(ExprTerm3367, QuoteSyntaxTerm3380, {
    isQuoteSyntaxTerm: true,
    destruct: function (context3602, options3603) {
        var tempId3604 = fresh3152();
        context3602.templateMap.set(tempId3604, this.stx.token.inner);
        return [syn3148.makeIdent("getTemplate", this.stx), syn3148.makeDelim("()", [syn3148.makeValue(tempId3604, this.stx)], this.stx)];
    }
});
function StopQuotedTerm3381(name3605, body3606) {
    this.name = name3605;
    this.body = body3606;
}
StopQuotedTerm3381.properties = ["name", "body"];
StopQuotedTerm3381.create = function (name3607, body3608) {
    return new StopQuotedTerm3381(name3607, body3608);
};
inherit3154(ExprTerm3367, StopQuotedTerm3381, { isStopQuotedTerm: true });
function PrimaryExpressionTerm3382() {}
PrimaryExpressionTerm3382.properties = [];
PrimaryExpressionTerm3382.create = function () {
    return new PrimaryExpressionTerm3382();
};
inherit3154(ExprTerm3367, PrimaryExpressionTerm3382, { isPrimaryExpressionTerm: true });
function ThisExpressionTerm3383(keyword3609) {
    this.keyword = keyword3609;
}
ThisExpressionTerm3383.properties = ["keyword"];
ThisExpressionTerm3383.create = function (keyword3610) {
    return new ThisExpressionTerm3383(keyword3610);
};
inherit3154(PrimaryExpressionTerm3382, ThisExpressionTerm3383, { isThisExpressionTerm: true });
function LitTerm3384(lit3611) {
    this.lit = lit3611;
}
LitTerm3384.properties = ["lit"];
LitTerm3384.create = function (lit3612) {
    return new LitTerm3384(lit3612);
};
inherit3154(PrimaryExpressionTerm3382, LitTerm3384, { isLitTerm: true });
function BlockTerm3385(body3613) {
    this.body = body3613;
}
BlockTerm3385.properties = ["body"];
BlockTerm3385.create = function (body3614) {
    return new BlockTerm3385(body3614);
};
inherit3154(PrimaryExpressionTerm3382, BlockTerm3385, { isBlockTerm: true });
function ArrayLiteralTerm3386(array3615) {
    this.array = array3615;
}
ArrayLiteralTerm3386.properties = ["array"];
ArrayLiteralTerm3386.create = function (array3616) {
    return new ArrayLiteralTerm3386(array3616);
};
inherit3154(PrimaryExpressionTerm3382, ArrayLiteralTerm3386, { isArrayLiteralTerm: true });
function IdTerm3387(id3617) {
    this.id = id3617;
}
IdTerm3387.properties = ["id"];
IdTerm3387.create = function (id3618) {
    return new IdTerm3387(id3618);
};
inherit3154(PrimaryExpressionTerm3382, IdTerm3387, { isIdTerm: true });
function PartialTerm3388() {}
PartialTerm3388.properties = [];
PartialTerm3388.create = function () {
    return new PartialTerm3388();
};
inherit3154(TermTree3339, PartialTerm3388, { isPartialTerm: true });
function PartialOperationTerm3389(stx3619, left3620) {
    this.stx = stx3619;
    this.left = left3620;
}
PartialOperationTerm3389.properties = ["stx", "left"];
PartialOperationTerm3389.create = function (stx3621, left3622) {
    return new PartialOperationTerm3389(stx3621, left3622);
};
inherit3154(PartialTerm3388, PartialOperationTerm3389, { isPartialOperationTerm: true });
function PartialExpressionTerm3390(stx3623, left3624, combine3625) {
    this.stx = stx3623;
    this.left = left3624;
    this.combine = combine3625;
}
PartialExpressionTerm3390.properties = ["stx", "left", "combine"];
PartialExpressionTerm3390.create = function (stx3626, left3627, combine3628) {
    return new PartialExpressionTerm3390(stx3626, left3627, combine3628);
};
inherit3154(PartialTerm3388, PartialExpressionTerm3390, { isPartialExpressionTerm: true });
function BindingStatementTerm3391(keyword3629, decls3630) {
    this.keyword = keyword3629;
    this.decls = decls3630;
}
BindingStatementTerm3391.properties = ["keyword", "decls"];
BindingStatementTerm3391.create = function (keyword3631, decls3632) {
    return new BindingStatementTerm3391(keyword3631, decls3632);
};
inherit3154(StatementTerm3361, BindingStatementTerm3391, {
    isBindingStatementTerm: true,
    destruct: function (context3633, options3634) {
        return this.keyword.destruct(context3633, options3634).concat(_3147.reduce(this.decls, function (acc3635, decl3636) {
            push3153.apply(acc3635, decl3636.destruct(context3633, options3634));
            return acc3635;
        }, []));
    }
});
function VariableStatementTerm3392(keyword3637, decls3638) {
    this.keyword = keyword3637;
    this.decls = decls3638;
}
VariableStatementTerm3392.properties = ["keyword", "decls"];
VariableStatementTerm3392.create = function (keyword3639, decls3640) {
    return new VariableStatementTerm3392(keyword3639, decls3640);
};
inherit3154(BindingStatementTerm3391, VariableStatementTerm3392, { isVariableStatementTerm: true });
function LetStatementTerm3393(keyword3641, decls3642) {
    this.keyword = keyword3641;
    this.decls = decls3642;
}
LetStatementTerm3393.properties = ["keyword", "decls"];
LetStatementTerm3393.create = function (keyword3643, decls3644) {
    return new LetStatementTerm3393(keyword3643, decls3644);
};
inherit3154(BindingStatementTerm3391, LetStatementTerm3393, { isLetStatementTerm: true });
function ConstStatementTerm3394(keyword3645, decls3646) {
    this.keyword = keyword3645;
    this.decls = decls3646;
}
ConstStatementTerm3394.properties = ["keyword", "decls"];
ConstStatementTerm3394.create = function (keyword3647, decls3648) {
    return new ConstStatementTerm3394(keyword3647, decls3648);
};
inherit3154(BindingStatementTerm3391, ConstStatementTerm3394, { isConstStatementTerm: true });
function ParenExpressionTerm3395(args3649, delim3650, commas3651) {
    this.args = args3649;
    this.delim = delim3650;
    this.commas = commas3651;
}
ParenExpressionTerm3395.properties = ["args", "delim", "commas"];
ParenExpressionTerm3395.create = function (args3652, delim3653, commas3654) {
    return new ParenExpressionTerm3395(args3652, delim3653, commas3654);
};
inherit3154(PrimaryExpressionTerm3382, ParenExpressionTerm3395, {
    isParenExpressionTerm: true,
    destruct: function (context3655, options3656) {
        var commas3657 = this.commas.slice();
        var src3658 = this.delim.token;
        var keys3659 = Object.keys(src3658);
        var newtok3660 = {};
        for (var i3661 = 0, len3662 = keys3659.length, key3663; i3661 < len3662; i3661++) {
            key3663 = keys3659[i3661];
            newtok3660[key3663] = src3658[key3663];
        }
        var delim3664 = syntaxFromToken3150(newtok3660, this.delim);
        delim3664.token.inner = _3147.reduce(this.args, function (acc3665, term3666) {
            assert3149(term3666 && term3666.isTermTree, "expecting term trees in destruct of ParenExpression");
            push3153.apply(acc3665, term3666.destruct(context3655, options3656));
            if ( // add all commas except for the last one
            commas3657.length > 0) {
                acc3665.push(commas3657.shift());
            }
            return acc3665;
        }, []);
        return DelimiterTerm3343.create(delim3664).destruct(context3655, options3656);
    }
});
module.exports = {
    TermTree: TermTree3339,
    EOFTerm: EOFTerm3340,
    KeywordTerm: KeywordTerm3341,
    PuncTerm: PuncTerm3342,
    DelimiterTerm: DelimiterTerm3343,
    ModuleTimeTerm: ModuleTimeTerm3344,
    ModuleTerm: ModuleTerm3345,
    ImportTerm: ImportTerm3346,
    ImportForPhaseTerm: ImportForPhaseTerm3347,
    NamedImportTerm: NamedImportTerm3348,
    NamespaceImportTerm: NamespaceImportTerm3350,
    DefaultImportTerm: DefaultImportTerm3349,
    BindingTerm: BindingTerm3351,
    QualifiedBindingTerm: QualifiedBindingTerm3352,
    ExportNameTerm: ExportNameTerm3353,
    ExportDefaultTerm: ExportDefaultTerm3354,
    ExportDeclTerm: ExportDeclTerm3355,
    CompileTimeTerm: CompileTimeTerm3356,
    MacroTerm: MacroTerm3357,
    OperatorDefinitionTerm: OperatorDefinitionTerm3358,
    ForPhaseTerm: ForPhaseTerm3359,
    VariableDeclarationTerm: VariableDeclarationTerm3360,
    StatementTerm: StatementTerm3361,
    EmptyTerm: EmptyTerm3362,
    CatchClauseTerm: CatchClauseTerm3363,
    ForStatementTerm: ForStatementTerm3364,
    ReturnStatementTerm: ReturnStatementTerm3366,
    ExprTerm: ExprTerm3367,
    UnaryOpTerm: UnaryOpTerm3368,
    PostfixOpTerm: PostfixOpTerm3369,
    BinOpTerm: BinOpTerm3370,
    AssignmentExpressionTerm: AssignmentExpressionTerm3371,
    ConditionalExpressionTerm: ConditionalExpressionTerm3372,
    NamedFunTerm: NamedFunTerm3373,
    AnonFunTerm: AnonFunTerm3374,
    ArrowFunTerm: ArrowFunTerm3375,
    ObjDotGetTerm: ObjDotGetTerm3376,
    ObjGetTerm: ObjGetTerm3377,
    TemplateTerm: TemplateTerm3378,
    CallTerm: CallTerm3379,
    QuoteSyntaxTerm: QuoteSyntaxTerm3380,
    StopQuotedTerm: StopQuotedTerm3381,
    PrimaryExpressionTerm: PrimaryExpressionTerm3382,
    ThisExpressionTerm: ThisExpressionTerm3383,
    LitTerm: LitTerm3384,
    BlockTerm: BlockTerm3385,
    ArrayLiteralTerm: ArrayLiteralTerm3386,
    IdTerm: IdTerm3387,
    PartialTerm: PartialTerm3388,
    PartialOperationTerm: PartialOperationTerm3389,
    PartialExpressionTerm: PartialExpressionTerm3390,
    BindingStatementTerm: BindingStatementTerm3391,
    VariableStatementTerm: VariableStatementTerm3392,
    LetStatementTerm: LetStatementTerm3393,
    ClassDeclarationTerm: ClassDeclarationTerm3365,
    ConstStatementTerm: ConstStatementTerm3394,
    ParenExpressionTerm: ParenExpressionTerm3395
};
//# sourceMappingURL=termTree.js.map