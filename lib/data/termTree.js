"use strict";

var _3229 = require("underscore"),
    syn3230 = require("../syntax"),
    assert3231 = require("assert");
var syntaxFromToken3232 = syn3230.syntaxFromToken,
    adjustLineContext3233 = syn3230.adjustLineContext,
    fresh3234 = syn3230.fresh;
var push3235 = Array.prototype.push;
function inherit3236(parent3478, child3479, methods3480) {
    var P3481 = function P3481() {};
    P3481.prototype = parent3478.prototype;
    child3479.prototype = new P3481();
    child3479.prototype.constructor = child3479;
    _3229.extend(child3479.prototype, methods3480);
}
function TermTree3421() {}
TermTree3421.properties = [];
TermTree3421.create = function () {
    return new TermTree3421();
};
TermTree3421.prototype = {
    isTermTree: true,
    destruct: function (context3482, options3483) {
        assert3231(context3482, "must pass in the context to destruct");
        options3483 = options3483 || {};
        var self3484 = this;
        if (options3483.stripCompileTerm && this.isCompileTimeTerm) {
            return [];
        }
        if (options3483.stripModuleTerm && this.isModuleTimeTerm) {
            return [];
        }
        return _3229.reduce(this.constructor.properties, function (acc3485, prop3486) {
            if (self3484[prop3486] && self3484[prop3486].isTermTree) {
                push3235.apply(acc3485, self3484[prop3486].destruct(context3482, options3483));
                return acc3485;
            } else if (self3484[prop3486] && self3484[prop3486].token && self3484[prop3486].token.inner) {
                var src3487 = self3484[prop3486].token;
                var keys3488 = Object.keys(src3487);
                var newtok3489 = {};
                for (var i3490 = 0, len3491 = keys3488.length, key3492; i3490 < len3491; i3490++) {
                    key3492 = keys3488[i3490];
                    newtok3489[key3492] = src3487[key3492];
                }
                var clone3493 = syntaxFromToken3232(newtok3489, self3484[prop3486]);
                clone3493.token.inner = _3229.reduce(clone3493.token.inner, function (acc3494, t3495) {
                    if (t3495 && t3495.isTermTree) {
                        push3235.apply(acc3494, t3495.destruct(context3482, options3483));
                        return acc3494;
                    }
                    acc3494.push(t3495);
                    return acc3494;
                }, []);
                acc3485.push(clone3493);
                return acc3485;
            } else if (Array.isArray(self3484[prop3486])) {
                var destArr3496 = _3229.reduce(self3484[prop3486], function (acc3497, t3498) {
                    if (t3498 && t3498.isTermTree) {
                        push3235.apply(acc3497, t3498.destruct(context3482, options3483));
                        return acc3497;
                    }
                    acc3497.push(t3498);
                    return acc3497;
                }, []);
                push3235.apply(acc3485, destArr3496);
                return acc3485;
            } else if (self3484[prop3486]) {
                acc3485.push(self3484[prop3486]);
                return acc3485;
            } else {
                return acc3485;
            }
        }, []);
    }
};
function EOFTerm3422(eof3499) {
    this.eof = eof3499;
}
EOFTerm3422.properties = ["eof"];
EOFTerm3422.create = function (eof3500) {
    return new EOFTerm3422(eof3500);
};
inherit3236(TermTree3421, EOFTerm3422, { isEOFTerm: true });
function KeywordTerm3423(keyword3501) {
    this.keyword = keyword3501;
}
KeywordTerm3423.properties = ["keyword"];
KeywordTerm3423.create = function (keyword3502) {
    return new KeywordTerm3423(keyword3502);
};
inherit3236(TermTree3421, KeywordTerm3423, { isKeywordTerm: true });
function PuncTerm3424(punc3503) {
    this.punc = punc3503;
}
PuncTerm3424.properties = ["punc"];
PuncTerm3424.create = function (punc3504) {
    return new PuncTerm3424(punc3504);
};
inherit3236(TermTree3421, PuncTerm3424, { isPuncTerm: true });
function DelimiterTerm3425(delim3505) {
    this.delim = delim3505;
}
DelimiterTerm3425.properties = ["delim"];
DelimiterTerm3425.create = function (delim3506) {
    return new DelimiterTerm3425(delim3506);
};
inherit3236(TermTree3421, DelimiterTerm3425, { isDelimiterTerm: true });
function ModuleTimeTerm3426() {}
ModuleTimeTerm3426.properties = [];
ModuleTimeTerm3426.create = function () {
    return new ModuleTimeTerm3426();
};
inherit3236(TermTree3421, ModuleTimeTerm3426, { isModuleTimeTerm: true });
function ModuleTerm3427(body3507) {
    this.body = body3507;
}
ModuleTerm3427.properties = ["body"];
ModuleTerm3427.create = function (body3508) {
    return new ModuleTerm3427(body3508);
};
inherit3236(ModuleTimeTerm3426, ModuleTerm3427, { isModuleTerm: true });
function ImportTerm3428(kw3509, clause3510, fromkw3511, from3512) {
    this.kw = kw3509;
    this.clause = clause3510;
    this.fromkw = fromkw3511;
    this.from = from3512;
}
ImportTerm3428.properties = ["kw", "clause", "fromkw", "from"];
ImportTerm3428.create = function (kw3513, clause3514, fromkw3515, from3516) {
    return new ImportTerm3428(kw3513, clause3514, fromkw3515, from3516);
};
inherit3236(ModuleTimeTerm3426, ImportTerm3428, { isImportTerm: true });
function ImportForPhaseTerm3429(kw3517, clause3518, fromkw3519, from3520, forkw3521, macroskw3522, phase3523) {
    this.kw = kw3517;
    this.clause = clause3518;
    this.fromkw = fromkw3519;
    this.from = from3520;
    this.forkw = forkw3521;
    this.macroskw = macroskw3522;
    this.phase = phase3523;
}
ImportForPhaseTerm3429.properties = ["kw", "clause", "fromkw", "from", "forkw", "macroskw", "phase"];
ImportForPhaseTerm3429.create = function (kw3524, clause3525, fromkw3526, from3527, forkw3528, macroskw3529, phase3530) {
    return new ImportForPhaseTerm3429(kw3524, clause3525, fromkw3526, from3527, forkw3528, macroskw3529, phase3530);
};
inherit3236(ModuleTimeTerm3426, ImportForPhaseTerm3429, { isImportForPhaseTerm: true });
function NamedImportTerm3430(names3531) {
    this.names = names3531;
}
NamedImportTerm3430.properties = ["names"];
NamedImportTerm3430.create = function (names3532) {
    return new NamedImportTerm3430(names3532);
};
inherit3236(ModuleTimeTerm3426, NamedImportTerm3430, { isNamedImportTerm: true });
function DefaultImportTerm3431(name3533) {
    this.name = name3533;
}
DefaultImportTerm3431.properties = ["name"];
DefaultImportTerm3431.create = function (name3534) {
    return new DefaultImportTerm3431(name3534);
};
inherit3236(ModuleTimeTerm3426, DefaultImportTerm3431, { isDefaultImportTerm: true });
function NamespaceImportTerm3432(star3535, askw3536, name3537) {
    this.star = star3535;
    this.askw = askw3536;
    this.name = name3537;
}
NamespaceImportTerm3432.properties = ["star", "askw", "name"];
NamespaceImportTerm3432.create = function (star3538, askw3539, name3540) {
    return new NamespaceImportTerm3432(star3538, askw3539, name3540);
};
inherit3236(ModuleTimeTerm3426, NamespaceImportTerm3432, { isNamespaceImportTerm: true });
function BindingTerm3433(importName3541) {
    this.importName = importName3541;
}
BindingTerm3433.properties = ["importName"];
BindingTerm3433.create = function (importName3542) {
    return new BindingTerm3433(importName3542);
};
inherit3236(ModuleTimeTerm3426, BindingTerm3433, { isBindingTerm: true });
function QualifiedBindingTerm3434(importName3543, askw3544, localName3545) {
    this.importName = importName3543;
    this.askw = askw3544;
    this.localName = localName3545;
}
QualifiedBindingTerm3434.properties = ["importName", "askw", "localName"];
QualifiedBindingTerm3434.create = function (importName3546, askw3547, localName3548) {
    return new QualifiedBindingTerm3434(importName3546, askw3547, localName3548);
};
inherit3236(ModuleTimeTerm3426, QualifiedBindingTerm3434, { isQualifiedBindingTerm: true });
function ExportNameTerm3435(kw3549, name3550) {
    this.kw = kw3549;
    this.name = name3550;
}
ExportNameTerm3435.properties = ["kw", "name"];
ExportNameTerm3435.create = function (kw3551, name3552) {
    return new ExportNameTerm3435(kw3551, name3552);
};
inherit3236(ModuleTimeTerm3426, ExportNameTerm3435, { isExportNameTerm: true });
function ExportDefaultTerm3436(kw3553, defaultkw3554, decl3555) {
    this.kw = kw3553;
    this.defaultkw = defaultkw3554;
    this.decl = decl3555;
}
ExportDefaultTerm3436.properties = ["kw", "defaultkw", "decl"];
ExportDefaultTerm3436.create = function (kw3556, defaultkw3557, decl3558) {
    return new ExportDefaultTerm3436(kw3556, defaultkw3557, decl3558);
};
inherit3236(ModuleTimeTerm3426, ExportDefaultTerm3436, { isExportDefaultTerm: true });
function ExportDeclTerm3437(kw3559, decl3560) {
    this.kw = kw3559;
    this.decl = decl3560;
}
ExportDeclTerm3437.properties = ["kw", "decl"];
ExportDeclTerm3437.create = function (kw3561, decl3562) {
    return new ExportDeclTerm3437(kw3561, decl3562);
};
inherit3236(ModuleTimeTerm3426, ExportDeclTerm3437, { isExportDeclTerm: true });
function CompileTimeTerm3438() {}
CompileTimeTerm3438.properties = [];
CompileTimeTerm3438.create = function () {
    return new CompileTimeTerm3438();
};
inherit3236(TermTree3421, CompileTimeTerm3438, { isCompileTimeTerm: true });
function MacroTerm3439(name3563, body3564) {
    this.name = name3563;
    this.body = body3564;
}
MacroTerm3439.properties = ["name", "body"];
MacroTerm3439.create = function (name3565, body3566) {
    return new MacroTerm3439(name3565, body3566);
};
inherit3236(CompileTimeTerm3438, MacroTerm3439, { isMacroTerm: true });
function OperatorDefinitionTerm3440(type3567, name3568, prec3569, assoc3570, body3571) {
    this.type = type3567;
    this.name = name3568;
    this.prec = prec3569;
    this.assoc = assoc3570;
    this.body = body3571;
}
OperatorDefinitionTerm3440.properties = ["type", "name", "prec", "assoc", "body"];
OperatorDefinitionTerm3440.create = function (type3572, name3573, prec3574, assoc3575, body3576) {
    return new OperatorDefinitionTerm3440(type3572, name3573, prec3574, assoc3575, body3576);
};
inherit3236(CompileTimeTerm3438, OperatorDefinitionTerm3440, { isOperatorDefinitionTerm: true });
function ForPhaseTerm3441(phase3577, body3578) {
    this.phase = phase3577;
    this.body = body3578;
}
ForPhaseTerm3441.properties = ["phase", "body"];
ForPhaseTerm3441.create = function (phase3579, body3580) {
    return new ForPhaseTerm3441(phase3579, body3580);
};
inherit3236(CompileTimeTerm3438, ForPhaseTerm3441, { isForPhaseTerm: true });
function VariableDeclarationTerm3442(ident3581, eq3582, init3583, comma3584) {
    this.ident = ident3581;
    this.eq = eq3582;
    this.init = init3583;
    this.comma = comma3584;
}
VariableDeclarationTerm3442.properties = ["ident", "eq", "init", "comma"];
VariableDeclarationTerm3442.create = function (ident3585, eq3586, init3587, comma3588) {
    return new VariableDeclarationTerm3442(ident3585, eq3586, init3587, comma3588);
};
inherit3236(TermTree3421, VariableDeclarationTerm3442, { isVariableDeclarationTerm: true });
function StatementTerm3443() {}
StatementTerm3443.properties = [];
StatementTerm3443.create = function () {
    return new StatementTerm3443();
};
inherit3236(TermTree3421, StatementTerm3443, { isStatementTerm: true });
function EmptyTerm3444() {}
EmptyTerm3444.properties = [];
EmptyTerm3444.create = function () {
    return new EmptyTerm3444();
};
inherit3236(StatementTerm3443, EmptyTerm3444, { isEmptyTerm: true });
function CatchClauseTerm3445(keyword3589, params3590, body3591) {
    this.keyword = keyword3589;
    this.params = params3590;
    this.body = body3591;
}
CatchClauseTerm3445.properties = ["keyword", "params", "body"];
CatchClauseTerm3445.create = function (keyword3592, params3593, body3594) {
    return new CatchClauseTerm3445(keyword3592, params3593, body3594);
};
inherit3236(StatementTerm3443, CatchClauseTerm3445, { isCatchClauseTerm: true });
function ForStatementTerm3446(keyword3595, cond3596) {
    this.keyword = keyword3595;
    this.cond = cond3596;
}
ForStatementTerm3446.properties = ["keyword", "cond"];
ForStatementTerm3446.create = function (keyword3597, cond3598) {
    return new ForStatementTerm3446(keyword3597, cond3598);
};
inherit3236(StatementTerm3443, ForStatementTerm3446, { isForStatementTerm: true });
function ClassDeclarationTerm3447(keyword3599, name3600, body3601) {
    this.keyword = keyword3599;
    this.name = name3600;
    this.body = body3601;
}
ClassDeclarationTerm3447.properties = ["keyword", "name", "body"];
ClassDeclarationTerm3447.create = function (keyword3602, name3603, body3604) {
    return new ClassDeclarationTerm3447(keyword3602, name3603, body3604);
};
inherit3236(StatementTerm3443, ClassDeclarationTerm3447, { isClassDeclarationTerm: true });
function ReturnStatementTerm3448(keyword3605, expr3606) {
    this.keyword = keyword3605;
    this.expr = expr3606;
}
ReturnStatementTerm3448.properties = ["keyword", "expr"];
ReturnStatementTerm3448.create = function (keyword3607, expr3608) {
    return new ReturnStatementTerm3448(keyword3607, expr3608);
};
inherit3236(StatementTerm3443, ReturnStatementTerm3448, {
    isReturnStatementTerm: true,
    destruct: function (context3609, options3610) {
        var expr3611 = this.expr.destruct(context3609, options3610);
        // need to adjust the line numbers to make sure that the expr
        // starts on the same line as the return keyword. This might
        // not be the case if an operator or infix macro perturbed the
        // line numbers during expansion.
        expr3611 = adjustLineContext3233(expr3611, this.keyword.keyword);
        return this.keyword.destruct(context3609, options3610).concat(expr3611);
    }
});
function ExprTerm3449() {}
ExprTerm3449.properties = [];
ExprTerm3449.create = function () {
    return new ExprTerm3449();
};
inherit3236(StatementTerm3443, ExprTerm3449, { isExprTerm: true });
function UnaryOpTerm3450(op3612, expr3613) {
    this.op = op3612;
    this.expr = expr3613;
}
UnaryOpTerm3450.properties = ["op", "expr"];
UnaryOpTerm3450.create = function (op3614, expr3615) {
    return new UnaryOpTerm3450(op3614, expr3615);
};
inherit3236(ExprTerm3449, UnaryOpTerm3450, { isUnaryOpTerm: true });
function PostfixOpTerm3451(expr3616, op3617) {
    this.expr = expr3616;
    this.op = op3617;
}
PostfixOpTerm3451.properties = ["expr", "op"];
PostfixOpTerm3451.create = function (expr3618, op3619) {
    return new PostfixOpTerm3451(expr3618, op3619);
};
inherit3236(ExprTerm3449, PostfixOpTerm3451, { isPostfixOpTerm: true });
function BinOpTerm3452(left3620, op3621, right3622) {
    this.left = left3620;
    this.op = op3621;
    this.right = right3622;
}
BinOpTerm3452.properties = ["left", "op", "right"];
BinOpTerm3452.create = function (left3623, op3624, right3625) {
    return new BinOpTerm3452(left3623, op3624, right3625);
};
inherit3236(ExprTerm3449, BinOpTerm3452, { isBinOpTerm: true });
function AssignmentExpressionTerm3453(left3626, op3627, right3628) {
    this.left = left3626;
    this.op = op3627;
    this.right = right3628;
}
AssignmentExpressionTerm3453.properties = ["left", "op", "right"];
AssignmentExpressionTerm3453.create = function (left3629, op3630, right3631) {
    return new AssignmentExpressionTerm3453(left3629, op3630, right3631);
};
inherit3236(ExprTerm3449, AssignmentExpressionTerm3453, { isAssignmentExpressionTerm: true });
function ConditionalExpressionTerm3454(cond3632, question3633, tru3634, colon3635, fls3636) {
    this.cond = cond3632;
    this.question = question3633;
    this.tru = tru3634;
    this.colon = colon3635;
    this.fls = fls3636;
}
ConditionalExpressionTerm3454.properties = ["cond", "question", "tru", "colon", "fls"];
ConditionalExpressionTerm3454.create = function (cond3637, question3638, tru3639, colon3640, fls3641) {
    return new ConditionalExpressionTerm3454(cond3637, question3638, tru3639, colon3640, fls3641);
};
inherit3236(ExprTerm3449, ConditionalExpressionTerm3454, { isConditionalExpressionTerm: true });
function NamedFunTerm3455(keyword3642, star3643, name3644, params3645, body3646) {
    this.keyword = keyword3642;
    this.star = star3643;
    this.name = name3644;
    this.params = params3645;
    this.body = body3646;
}
NamedFunTerm3455.properties = ["keyword", "star", "name", "params", "body"];
NamedFunTerm3455.create = function (keyword3647, star3648, name3649, params3650, body3651) {
    return new NamedFunTerm3455(keyword3647, star3648, name3649, params3650, body3651);
};
inherit3236(ExprTerm3449, NamedFunTerm3455, { isNamedFunTerm: true });
function AnonFunTerm3456(keyword3652, star3653, params3654, body3655) {
    this.keyword = keyword3652;
    this.star = star3653;
    this.params = params3654;
    this.body = body3655;
}
AnonFunTerm3456.properties = ["keyword", "star", "params", "body"];
AnonFunTerm3456.create = function (keyword3656, star3657, params3658, body3659) {
    return new AnonFunTerm3456(keyword3656, star3657, params3658, body3659);
};
inherit3236(ExprTerm3449, AnonFunTerm3456, { isAnonFunTerm: true });
function ArrowFunTerm3457(params3660, arrow3661, body3662) {
    this.params = params3660;
    this.arrow = arrow3661;
    this.body = body3662;
}
ArrowFunTerm3457.properties = ["params", "arrow", "body"];
ArrowFunTerm3457.create = function (params3663, arrow3664, body3665) {
    return new ArrowFunTerm3457(params3663, arrow3664, body3665);
};
inherit3236(ExprTerm3449, ArrowFunTerm3457, { isArrowFunTerm: true });
function ObjDotGetTerm3458(left3666, dot3667, right3668) {
    this.left = left3666;
    this.dot = dot3667;
    this.right = right3668;
}
ObjDotGetTerm3458.properties = ["left", "dot", "right"];
ObjDotGetTerm3458.create = function (left3669, dot3670, right3671) {
    return new ObjDotGetTerm3458(left3669, dot3670, right3671);
};
inherit3236(ExprTerm3449, ObjDotGetTerm3458, { isObjDotGetTerm: true });
function ObjGetTerm3459(left3672, right3673) {
    this.left = left3672;
    this.right = right3673;
}
ObjGetTerm3459.properties = ["left", "right"];
ObjGetTerm3459.create = function (left3674, right3675) {
    return new ObjGetTerm3459(left3674, right3675);
};
inherit3236(ExprTerm3449, ObjGetTerm3459, { isObjGetTerm: true });
function TemplateTerm3460(template3676) {
    this.template = template3676;
}
TemplateTerm3460.properties = ["template"];
TemplateTerm3460.create = function (template3677) {
    return new TemplateTerm3460(template3677);
};
inherit3236(ExprTerm3449, TemplateTerm3460, { isTemplateTerm: true });
function CallTerm3461(fun3678, args3679) {
    this.fun = fun3678;
    this.args = args3679;
}
CallTerm3461.properties = ["fun", "args"];
CallTerm3461.create = function (fun3680, args3681) {
    return new CallTerm3461(fun3680, args3681);
};
inherit3236(ExprTerm3449, CallTerm3461, { isCallTerm: true });
function QuoteSyntaxTerm3462(stx3682) {
    this.stx = stx3682;
}
QuoteSyntaxTerm3462.properties = ["stx"];
QuoteSyntaxTerm3462.create = function (stx3683) {
    return new QuoteSyntaxTerm3462(stx3683);
};
inherit3236(ExprTerm3449, QuoteSyntaxTerm3462, {
    isQuoteSyntaxTerm: true,
    destruct: function (context3684, options3685) {
        var tempId3686 = fresh3234();
        context3684.templateMap.set(tempId3686, this.stx.token.inner);
        return [syn3230.makeIdent("getTemplate", this.stx), syn3230.makeDelim("()", [syn3230.makeValue(tempId3686, this.stx)], this.stx)];
    }
});
function StopQuotedTerm3463(name3687, body3688) {
    this.name = name3687;
    this.body = body3688;
}
StopQuotedTerm3463.properties = ["name", "body"];
StopQuotedTerm3463.create = function (name3689, body3690) {
    return new StopQuotedTerm3463(name3689, body3690);
};
inherit3236(ExprTerm3449, StopQuotedTerm3463, { isStopQuotedTerm: true });
function PrimaryExpressionTerm3464() {}
PrimaryExpressionTerm3464.properties = [];
PrimaryExpressionTerm3464.create = function () {
    return new PrimaryExpressionTerm3464();
};
inherit3236(ExprTerm3449, PrimaryExpressionTerm3464, { isPrimaryExpressionTerm: true });
function ThisExpressionTerm3465(keyword3691) {
    this.keyword = keyword3691;
}
ThisExpressionTerm3465.properties = ["keyword"];
ThisExpressionTerm3465.create = function (keyword3692) {
    return new ThisExpressionTerm3465(keyword3692);
};
inherit3236(PrimaryExpressionTerm3464, ThisExpressionTerm3465, { isThisExpressionTerm: true });
function LitTerm3466(lit3693) {
    this.lit = lit3693;
}
LitTerm3466.properties = ["lit"];
LitTerm3466.create = function (lit3694) {
    return new LitTerm3466(lit3694);
};
inherit3236(PrimaryExpressionTerm3464, LitTerm3466, { isLitTerm: true });
function BlockTerm3467(body3695) {
    this.body = body3695;
}
BlockTerm3467.properties = ["body"];
BlockTerm3467.create = function (body3696) {
    return new BlockTerm3467(body3696);
};
inherit3236(PrimaryExpressionTerm3464, BlockTerm3467, { isBlockTerm: true });
function ArrayLiteralTerm3468(array3697) {
    this.array = array3697;
}
ArrayLiteralTerm3468.properties = ["array"];
ArrayLiteralTerm3468.create = function (array3698) {
    return new ArrayLiteralTerm3468(array3698);
};
inherit3236(PrimaryExpressionTerm3464, ArrayLiteralTerm3468, { isArrayLiteralTerm: true });
function IdTerm3469(id3699) {
    this.id = id3699;
}
IdTerm3469.properties = ["id"];
IdTerm3469.create = function (id3700) {
    return new IdTerm3469(id3700);
};
inherit3236(PrimaryExpressionTerm3464, IdTerm3469, { isIdTerm: true });
function PartialTerm3470() {}
PartialTerm3470.properties = [];
PartialTerm3470.create = function () {
    return new PartialTerm3470();
};
inherit3236(TermTree3421, PartialTerm3470, { isPartialTerm: true });
function PartialOperationTerm3471(stx3701, left3702) {
    this.stx = stx3701;
    this.left = left3702;
}
PartialOperationTerm3471.properties = ["stx", "left"];
PartialOperationTerm3471.create = function (stx3703, left3704) {
    return new PartialOperationTerm3471(stx3703, left3704);
};
inherit3236(PartialTerm3470, PartialOperationTerm3471, { isPartialOperationTerm: true });
function PartialExpressionTerm3472(stx3705, left3706, combine3707) {
    this.stx = stx3705;
    this.left = left3706;
    this.combine = combine3707;
}
PartialExpressionTerm3472.properties = ["stx", "left", "combine"];
PartialExpressionTerm3472.create = function (stx3708, left3709, combine3710) {
    return new PartialExpressionTerm3472(stx3708, left3709, combine3710);
};
inherit3236(PartialTerm3470, PartialExpressionTerm3472, { isPartialExpressionTerm: true });
function BindingStatementTerm3473(keyword3711, decls3712) {
    this.keyword = keyword3711;
    this.decls = decls3712;
}
BindingStatementTerm3473.properties = ["keyword", "decls"];
BindingStatementTerm3473.create = function (keyword3713, decls3714) {
    return new BindingStatementTerm3473(keyword3713, decls3714);
};
inherit3236(StatementTerm3443, BindingStatementTerm3473, {
    isBindingStatementTerm: true,
    destruct: function (context3715, options3716) {
        return this.keyword.destruct(context3715, options3716).concat(_3229.reduce(this.decls, function (acc3717, decl3718) {
            push3235.apply(acc3717, decl3718.destruct(context3715, options3716));
            return acc3717;
        }, []));
    }
});
function VariableStatementTerm3474(keyword3719, decls3720) {
    this.keyword = keyword3719;
    this.decls = decls3720;
}
VariableStatementTerm3474.properties = ["keyword", "decls"];
VariableStatementTerm3474.create = function (keyword3721, decls3722) {
    return new VariableStatementTerm3474(keyword3721, decls3722);
};
inherit3236(BindingStatementTerm3473, VariableStatementTerm3474, { isVariableStatementTerm: true });
function LetStatementTerm3475(keyword3723, decls3724) {
    this.keyword = keyword3723;
    this.decls = decls3724;
}
LetStatementTerm3475.properties = ["keyword", "decls"];
LetStatementTerm3475.create = function (keyword3725, decls3726) {
    return new LetStatementTerm3475(keyword3725, decls3726);
};
inherit3236(BindingStatementTerm3473, LetStatementTerm3475, { isLetStatementTerm: true });
function ConstStatementTerm3476(keyword3727, decls3728) {
    this.keyword = keyword3727;
    this.decls = decls3728;
}
ConstStatementTerm3476.properties = ["keyword", "decls"];
ConstStatementTerm3476.create = function (keyword3729, decls3730) {
    return new ConstStatementTerm3476(keyword3729, decls3730);
};
inherit3236(BindingStatementTerm3473, ConstStatementTerm3476, { isConstStatementTerm: true });
function ParenExpressionTerm3477(args3731, delim3732, commas3733) {
    this.args = args3731;
    this.delim = delim3732;
    this.commas = commas3733;
}
ParenExpressionTerm3477.properties = ["args", "delim", "commas"];
ParenExpressionTerm3477.create = function (args3734, delim3735, commas3736) {
    return new ParenExpressionTerm3477(args3734, delim3735, commas3736);
};
inherit3236(PrimaryExpressionTerm3464, ParenExpressionTerm3477, {
    isParenExpressionTerm: true,
    destruct: function (context3737, options3738) {
        var commas3739 = this.commas.slice();
        var src3740 = this.delim.token;
        var keys3741 = Object.keys(src3740);
        var newtok3742 = {};
        for (var i3743 = 0, len3744 = keys3741.length, key3745; i3743 < len3744; i3743++) {
            key3745 = keys3741[i3743];
            newtok3742[key3745] = src3740[key3745];
        }
        var delim3746 = syntaxFromToken3232(newtok3742, this.delim);
        delim3746.token.inner = _3229.reduce(this.args, function (acc3747, term3748) {
            assert3231(term3748 && term3748.isTermTree, "expecting term trees in destruct of ParenExpression");
            push3235.apply(acc3747, term3748.destruct(context3737, options3738));
            if ( // add all commas except for the last one
            commas3739.length > 0) {
                acc3747.push(commas3739.shift());
            }
            return acc3747;
        }, []);
        return DelimiterTerm3425.create(delim3746).destruct(context3737, options3738);
    }
});
module.exports = {
    TermTree: TermTree3421,
    EOFTerm: EOFTerm3422,
    KeywordTerm: KeywordTerm3423,
    PuncTerm: PuncTerm3424,
    DelimiterTerm: DelimiterTerm3425,
    ModuleTimeTerm: ModuleTimeTerm3426,
    ModuleTerm: ModuleTerm3427,
    ImportTerm: ImportTerm3428,
    ImportForPhaseTerm: ImportForPhaseTerm3429,
    NamedImportTerm: NamedImportTerm3430,
    NamespaceImportTerm: NamespaceImportTerm3432,
    DefaultImportTerm: DefaultImportTerm3431,
    BindingTerm: BindingTerm3433,
    QualifiedBindingTerm: QualifiedBindingTerm3434,
    ExportNameTerm: ExportNameTerm3435,
    ExportDefaultTerm: ExportDefaultTerm3436,
    ExportDeclTerm: ExportDeclTerm3437,
    CompileTimeTerm: CompileTimeTerm3438,
    MacroTerm: MacroTerm3439,
    OperatorDefinitionTerm: OperatorDefinitionTerm3440,
    ForPhaseTerm: ForPhaseTerm3441,
    VariableDeclarationTerm: VariableDeclarationTerm3442,
    StatementTerm: StatementTerm3443,
    EmptyTerm: EmptyTerm3444,
    CatchClauseTerm: CatchClauseTerm3445,
    ForStatementTerm: ForStatementTerm3446,
    ReturnStatementTerm: ReturnStatementTerm3448,
    ExprTerm: ExprTerm3449,
    UnaryOpTerm: UnaryOpTerm3450,
    PostfixOpTerm: PostfixOpTerm3451,
    BinOpTerm: BinOpTerm3452,
    AssignmentExpressionTerm: AssignmentExpressionTerm3453,
    ConditionalExpressionTerm: ConditionalExpressionTerm3454,
    NamedFunTerm: NamedFunTerm3455,
    AnonFunTerm: AnonFunTerm3456,
    ArrowFunTerm: ArrowFunTerm3457,
    ObjDotGetTerm: ObjDotGetTerm3458,
    ObjGetTerm: ObjGetTerm3459,
    TemplateTerm: TemplateTerm3460,
    CallTerm: CallTerm3461,
    QuoteSyntaxTerm: QuoteSyntaxTerm3462,
    StopQuotedTerm: StopQuotedTerm3463,
    PrimaryExpressionTerm: PrimaryExpressionTerm3464,
    ThisExpressionTerm: ThisExpressionTerm3465,
    LitTerm: LitTerm3466,
    BlockTerm: BlockTerm3467,
    ArrayLiteralTerm: ArrayLiteralTerm3468,
    IdTerm: IdTerm3469,
    PartialTerm: PartialTerm3470,
    PartialOperationTerm: PartialOperationTerm3471,
    PartialExpressionTerm: PartialExpressionTerm3472,
    BindingStatementTerm: BindingStatementTerm3473,
    VariableStatementTerm: VariableStatementTerm3474,
    LetStatementTerm: LetStatementTerm3475,
    ClassDeclarationTerm: ClassDeclarationTerm3447,
    ConstStatementTerm: ConstStatementTerm3476,
    ParenExpressionTerm: ParenExpressionTerm3477
};
//# sourceMappingURL=termTree.js.map