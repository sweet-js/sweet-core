"use strict";

var _3229 = require("underscore"),
    syn3230 = require("../syntax"),
    assert3231 = require("assert");
var syntaxFromToken3232 = syn3230.syntaxFromToken,
    adjustLineContext3233 = syn3230.adjustLineContext,
    fresh3234 = syn3230.fresh;
var push3235 = Array.prototype.push;
function inherit3236(parent3480, child3481, methods3482) {
    var P3483 = function P3483() {};
    P3483.prototype = parent3480.prototype;
    child3481.prototype = new P3483();
    child3481.prototype.constructor = child3481;
    _3229.extend(child3481.prototype, methods3482);
}
function TermTree3421() {}
TermTree3421.properties = [];
TermTree3421.create = function () {
    return new TermTree3421();
};
TermTree3421.prototype = {
    isTermTree: true,
    destruct: function (context3484, options3485) {
        assert3231(context3484, "must pass in the context to destruct");
        options3485 = options3485 || {};
        var self3486 = this;
        if (options3485.stripCompileTerm && this.isCompileTimeTerm) {
            return [];
        }
        if (options3485.stripModuleTerm && this.isModuleTimeTerm) {
            return [];
        }
        return _3229.reduce(this.constructor.properties, function (acc3487, prop3488) {
            if (self3486[prop3488] && self3486[prop3488].isTermTree) {
                push3235.apply(acc3487, self3486[prop3488].destruct(context3484, options3485));
                return acc3487;
            } else if (self3486[prop3488] && self3486[prop3488].token && self3486[prop3488].token.inner) {
                var src3489 = self3486[prop3488].token;
                var keys3490 = Object.keys(src3489);
                var newtok3491 = {};
                for (var i3492 = 0, len3493 = keys3490.length, key3494; i3492 < len3493; i3492++) {
                    key3494 = keys3490[i3492];
                    newtok3491[key3494] = src3489[key3494];
                }
                var clone3495 = syntaxFromToken3232(newtok3491, self3486[prop3488]);
                clone3495.token.inner = _3229.reduce(clone3495.token.inner, function (acc3496, t3497) {
                    if (t3497 && t3497.isTermTree) {
                        push3235.apply(acc3496, t3497.destruct(context3484, options3485));
                        return acc3496;
                    }
                    acc3496.push(t3497);
                    return acc3496;
                }, []);
                acc3487.push(clone3495);
                return acc3487;
            } else if (Array.isArray(self3486[prop3488])) {
                var destArr3498 = _3229.reduce(self3486[prop3488], function (acc3499, t3500) {
                    if (t3500 && t3500.isTermTree) {
                        push3235.apply(acc3499, t3500.destruct(context3484, options3485));
                        return acc3499;
                    }
                    acc3499.push(t3500);
                    return acc3499;
                }, []);
                push3235.apply(acc3487, destArr3498);
                return acc3487;
            } else if (self3486[prop3488]) {
                acc3487.push(self3486[prop3488]);
                return acc3487;
            } else {
                return acc3487;
            }
        }, []);
    }
};
function EOFTerm3422(eof3501) {
    this.eof = eof3501;
}
EOFTerm3422.properties = ["eof"];
EOFTerm3422.create = function (eof3502) {
    return new EOFTerm3422(eof3502);
};
inherit3236(TermTree3421, EOFTerm3422, { isEOFTerm: true });
function KeywordTerm3423(keyword3503) {
    this.keyword = keyword3503;
}
KeywordTerm3423.properties = ["keyword"];
KeywordTerm3423.create = function (keyword3504) {
    return new KeywordTerm3423(keyword3504);
};
inherit3236(TermTree3421, KeywordTerm3423, { isKeywordTerm: true });
function PuncTerm3424(punc3505) {
    this.punc = punc3505;
}
PuncTerm3424.properties = ["punc"];
PuncTerm3424.create = function (punc3506) {
    return new PuncTerm3424(punc3506);
};
inherit3236(TermTree3421, PuncTerm3424, { isPuncTerm: true });
function DelimiterTerm3425(delim3507) {
    this.delim = delim3507;
}
DelimiterTerm3425.properties = ["delim"];
DelimiterTerm3425.create = function (delim3508) {
    return new DelimiterTerm3425(delim3508);
};
inherit3236(TermTree3421, DelimiterTerm3425, { isDelimiterTerm: true });
function ModuleTimeTerm3426() {}
ModuleTimeTerm3426.properties = [];
ModuleTimeTerm3426.create = function () {
    return new ModuleTimeTerm3426();
};
inherit3236(TermTree3421, ModuleTimeTerm3426, { isModuleTimeTerm: true });
function ModuleTerm3427(body3509) {
    this.body = body3509;
}
ModuleTerm3427.properties = ["body"];
ModuleTerm3427.create = function (body3510) {
    return new ModuleTerm3427(body3510);
};
inherit3236(ModuleTimeTerm3426, ModuleTerm3427, { isModuleTerm: true });
function ImportTerm3428(kw3511, clause3512, fromkw3513, from3514) {
    this.kw = kw3511;
    this.clause = clause3512;
    this.fromkw = fromkw3513;
    this.from = from3514;
}
ImportTerm3428.properties = ["kw", "clause", "fromkw", "from"];
ImportTerm3428.create = function (kw3515, clause3516, fromkw3517, from3518) {
    return new ImportTerm3428(kw3515, clause3516, fromkw3517, from3518);
};
inherit3236(ModuleTimeTerm3426, ImportTerm3428, { isImportTerm: true });
function ImportForPhaseTerm3429(kw3519, clause3520, fromkw3521, from3522, forkw3523, macroskw3524, phase3525) {
    this.kw = kw3519;
    this.clause = clause3520;
    this.fromkw = fromkw3521;
    this.from = from3522;
    this.forkw = forkw3523;
    this.macroskw = macroskw3524;
    this.phase = phase3525;
}
ImportForPhaseTerm3429.properties = ["kw", "clause", "fromkw", "from", "forkw", "macroskw", "phase"];
ImportForPhaseTerm3429.create = function (kw3526, clause3527, fromkw3528, from3529, forkw3530, macroskw3531, phase3532) {
    return new ImportForPhaseTerm3429(kw3526, clause3527, fromkw3528, from3529, forkw3530, macroskw3531, phase3532);
};
inherit3236(ModuleTimeTerm3426, ImportForPhaseTerm3429, { isImportForPhaseTerm: true });
function NamedImportTerm3430(names3533) {
    this.names = names3533;
}
NamedImportTerm3430.properties = ["names"];
NamedImportTerm3430.create = function (names3534) {
    return new NamedImportTerm3430(names3534);
};
inherit3236(ModuleTimeTerm3426, NamedImportTerm3430, { isNamedImportTerm: true });
function DefaultImportTerm3431(name3535) {
    this.name = name3535;
}
DefaultImportTerm3431.properties = ["name"];
DefaultImportTerm3431.create = function (name3536) {
    return new DefaultImportTerm3431(name3536);
};
inherit3236(ModuleTimeTerm3426, DefaultImportTerm3431, { isDefaultImportTerm: true });
function NamespaceImportTerm3432(star3537, askw3538, name3539) {
    this.star = star3537;
    this.askw = askw3538;
    this.name = name3539;
}
NamespaceImportTerm3432.properties = ["star", "askw", "name"];
NamespaceImportTerm3432.create = function (star3540, askw3541, name3542) {
    return new NamespaceImportTerm3432(star3540, askw3541, name3542);
};
inherit3236(ModuleTimeTerm3426, NamespaceImportTerm3432, { isNamespaceImportTerm: true });
function BindingTerm3433(importName3543) {
    this.importName = importName3543;
}
BindingTerm3433.properties = ["importName"];
BindingTerm3433.create = function (importName3544) {
    return new BindingTerm3433(importName3544);
};
inherit3236(ModuleTimeTerm3426, BindingTerm3433, { isBindingTerm: true });
function QualifiedBindingTerm3434(importName3545, askw3546, localName3547) {
    this.importName = importName3545;
    this.askw = askw3546;
    this.localName = localName3547;
}
QualifiedBindingTerm3434.properties = ["importName", "askw", "localName"];
QualifiedBindingTerm3434.create = function (importName3548, askw3549, localName3550) {
    return new QualifiedBindingTerm3434(importName3548, askw3549, localName3550);
};
inherit3236(ModuleTimeTerm3426, QualifiedBindingTerm3434, { isQualifiedBindingTerm: true });
function ExportNameTerm3435(kw3551, name3552) {
    this.kw = kw3551;
    this.name = name3552;
}
ExportNameTerm3435.properties = ["kw", "name"];
ExportNameTerm3435.create = function (kw3553, name3554) {
    return new ExportNameTerm3435(kw3553, name3554);
};
inherit3236(ModuleTimeTerm3426, ExportNameTerm3435, { isExportNameTerm: true });
function ExportDefaultTerm3436(kw3555, defaultkw3556, decl3557) {
    this.kw = kw3555;
    this.defaultkw = defaultkw3556;
    this.decl = decl3557;
}
ExportDefaultTerm3436.properties = ["kw", "defaultkw", "decl"];
ExportDefaultTerm3436.create = function (kw3558, defaultkw3559, decl3560) {
    return new ExportDefaultTerm3436(kw3558, defaultkw3559, decl3560);
};
inherit3236(ModuleTimeTerm3426, ExportDefaultTerm3436, { isExportDefaultTerm: true });
function ExportDeclTerm3437(kw3561, decl3562) {
    this.kw = kw3561;
    this.decl = decl3562;
}
ExportDeclTerm3437.properties = ["kw", "decl"];
ExportDeclTerm3437.create = function (kw3563, decl3564) {
    return new ExportDeclTerm3437(kw3563, decl3564);
};
inherit3236(ModuleTimeTerm3426, ExportDeclTerm3437, { isExportDeclTerm: true });
function CompileTimeTerm3438() {}
CompileTimeTerm3438.properties = [];
CompileTimeTerm3438.create = function () {
    return new CompileTimeTerm3438();
};
inherit3236(TermTree3421, CompileTimeTerm3438, { isCompileTimeTerm: true });
function LetMacroTerm3439(name3565, body3566) {
    this.name = name3565;
    this.body = body3566;
}
LetMacroTerm3439.properties = ["name", "body"];
LetMacroTerm3439.create = function (name3567, body3568) {
    return new LetMacroTerm3439(name3567, body3568);
};
inherit3236(CompileTimeTerm3438, LetMacroTerm3439, { isLetMacroTerm: true });
function MacroTerm3440(name3569, body3570) {
    this.name = name3569;
    this.body = body3570;
}
MacroTerm3440.properties = ["name", "body"];
MacroTerm3440.create = function (name3571, body3572) {
    return new MacroTerm3440(name3571, body3572);
};
inherit3236(CompileTimeTerm3438, MacroTerm3440, { isMacroTerm: true });
function AnonMacroTerm3441(body3573) {
    this.body = body3573;
}
AnonMacroTerm3441.properties = ["body"];
AnonMacroTerm3441.create = function (body3574) {
    return new AnonMacroTerm3441(body3574);
};
inherit3236(CompileTimeTerm3438, AnonMacroTerm3441, { isAnonMacroTerm: true });
function OperatorDefinitionTerm3442(type3575, name3576, prec3577, assoc3578, body3579) {
    this.type = type3575;
    this.name = name3576;
    this.prec = prec3577;
    this.assoc = assoc3578;
    this.body = body3579;
}
OperatorDefinitionTerm3442.properties = ["type", "name", "prec", "assoc", "body"];
OperatorDefinitionTerm3442.create = function (type3580, name3581, prec3582, assoc3583, body3584) {
    return new OperatorDefinitionTerm3442(type3580, name3581, prec3582, assoc3583, body3584);
};
inherit3236(CompileTimeTerm3438, OperatorDefinitionTerm3442, { isOperatorDefinitionTerm: true });
function ForPhaseTerm3443(phase3585, body3586) {
    this.phase = phase3585;
    this.body = body3586;
}
ForPhaseTerm3443.properties = ["phase", "body"];
ForPhaseTerm3443.create = function (phase3587, body3588) {
    return new ForPhaseTerm3443(phase3587, body3588);
};
inherit3236(CompileTimeTerm3438, ForPhaseTerm3443, { isForPhaseTerm: true });
function VariableDeclarationTerm3444(ident3589, eq3590, init3591, comma3592) {
    this.ident = ident3589;
    this.eq = eq3590;
    this.init = init3591;
    this.comma = comma3592;
}
VariableDeclarationTerm3444.properties = ["ident", "eq", "init", "comma"];
VariableDeclarationTerm3444.create = function (ident3593, eq3594, init3595, comma3596) {
    return new VariableDeclarationTerm3444(ident3593, eq3594, init3595, comma3596);
};
inherit3236(TermTree3421, VariableDeclarationTerm3444, { isVariableDeclarationTerm: true });
function StatementTerm3445() {}
StatementTerm3445.properties = [];
StatementTerm3445.create = function () {
    return new StatementTerm3445();
};
inherit3236(TermTree3421, StatementTerm3445, { isStatementTerm: true });
function EmptyTerm3446() {}
EmptyTerm3446.properties = [];
EmptyTerm3446.create = function () {
    return new EmptyTerm3446();
};
inherit3236(StatementTerm3445, EmptyTerm3446, { isEmptyTerm: true });
function CatchClauseTerm3447(keyword3597, params3598, body3599) {
    this.keyword = keyword3597;
    this.params = params3598;
    this.body = body3599;
}
CatchClauseTerm3447.properties = ["keyword", "params", "body"];
CatchClauseTerm3447.create = function (keyword3600, params3601, body3602) {
    return new CatchClauseTerm3447(keyword3600, params3601, body3602);
};
inherit3236(StatementTerm3445, CatchClauseTerm3447, { isCatchClauseTerm: true });
function ForStatementTerm3448(keyword3603, cond3604) {
    this.keyword = keyword3603;
    this.cond = cond3604;
}
ForStatementTerm3448.properties = ["keyword", "cond"];
ForStatementTerm3448.create = function (keyword3605, cond3606) {
    return new ForStatementTerm3448(keyword3605, cond3606);
};
inherit3236(StatementTerm3445, ForStatementTerm3448, { isForStatementTerm: true });
function ClassDeclarationTerm3449(keyword3607, name3608, body3609) {
    this.keyword = keyword3607;
    this.name = name3608;
    this.body = body3609;
}
ClassDeclarationTerm3449.properties = ["keyword", "name", "body"];
ClassDeclarationTerm3449.create = function (keyword3610, name3611, body3612) {
    return new ClassDeclarationTerm3449(keyword3610, name3611, body3612);
};
inherit3236(StatementTerm3445, ClassDeclarationTerm3449, { isClassDeclarationTerm: true });
function ReturnStatementTerm3450(keyword3613, expr3614) {
    this.keyword = keyword3613;
    this.expr = expr3614;
}
ReturnStatementTerm3450.properties = ["keyword", "expr"];
ReturnStatementTerm3450.create = function (keyword3615, expr3616) {
    return new ReturnStatementTerm3450(keyword3615, expr3616);
};
inherit3236(StatementTerm3445, ReturnStatementTerm3450, {
    isReturnStatementTerm: true,
    destruct: function (context3617, options3618) {
        var expr3619 = this.expr.destruct(context3617, options3618);
        // need to adjust the line numbers to make sure that the expr
        // starts on the same line as the return keyword. This might
        // not be the case if an operator or infix macro perturbed the
        // line numbers during expansion.
        expr3619 = adjustLineContext3233(expr3619, this.keyword.keyword);
        return this.keyword.destruct(context3617, options3618).concat(expr3619);
    }
});
function ExprTerm3451() {}
ExprTerm3451.properties = [];
ExprTerm3451.create = function () {
    return new ExprTerm3451();
};
inherit3236(StatementTerm3445, ExprTerm3451, { isExprTerm: true });
function UnaryOpTerm3452(op3620, expr3621) {
    this.op = op3620;
    this.expr = expr3621;
}
UnaryOpTerm3452.properties = ["op", "expr"];
UnaryOpTerm3452.create = function (op3622, expr3623) {
    return new UnaryOpTerm3452(op3622, expr3623);
};
inherit3236(ExprTerm3451, UnaryOpTerm3452, { isUnaryOpTerm: true });
function PostfixOpTerm3453(expr3624, op3625) {
    this.expr = expr3624;
    this.op = op3625;
}
PostfixOpTerm3453.properties = ["expr", "op"];
PostfixOpTerm3453.create = function (expr3626, op3627) {
    return new PostfixOpTerm3453(expr3626, op3627);
};
inherit3236(ExprTerm3451, PostfixOpTerm3453, { isPostfixOpTerm: true });
function BinOpTerm3454(left3628, op3629, right3630) {
    this.left = left3628;
    this.op = op3629;
    this.right = right3630;
}
BinOpTerm3454.properties = ["left", "op", "right"];
BinOpTerm3454.create = function (left3631, op3632, right3633) {
    return new BinOpTerm3454(left3631, op3632, right3633);
};
inherit3236(ExprTerm3451, BinOpTerm3454, { isBinOpTerm: true });
function AssignmentExpressionTerm3455(left3634, op3635, right3636) {
    this.left = left3634;
    this.op = op3635;
    this.right = right3636;
}
AssignmentExpressionTerm3455.properties = ["left", "op", "right"];
AssignmentExpressionTerm3455.create = function (left3637, op3638, right3639) {
    return new AssignmentExpressionTerm3455(left3637, op3638, right3639);
};
inherit3236(ExprTerm3451, AssignmentExpressionTerm3455, { isAssignmentExpressionTerm: true });
function ConditionalExpressionTerm3456(cond3640, question3641, tru3642, colon3643, fls3644) {
    this.cond = cond3640;
    this.question = question3641;
    this.tru = tru3642;
    this.colon = colon3643;
    this.fls = fls3644;
}
ConditionalExpressionTerm3456.properties = ["cond", "question", "tru", "colon", "fls"];
ConditionalExpressionTerm3456.create = function (cond3645, question3646, tru3647, colon3648, fls3649) {
    return new ConditionalExpressionTerm3456(cond3645, question3646, tru3647, colon3648, fls3649);
};
inherit3236(ExprTerm3451, ConditionalExpressionTerm3456, { isConditionalExpressionTerm: true });
function NamedFunTerm3457(keyword3650, star3651, name3652, params3653, body3654) {
    this.keyword = keyword3650;
    this.star = star3651;
    this.name = name3652;
    this.params = params3653;
    this.body = body3654;
}
NamedFunTerm3457.properties = ["keyword", "star", "name", "params", "body"];
NamedFunTerm3457.create = function (keyword3655, star3656, name3657, params3658, body3659) {
    return new NamedFunTerm3457(keyword3655, star3656, name3657, params3658, body3659);
};
inherit3236(ExprTerm3451, NamedFunTerm3457, { isNamedFunTerm: true });
function AnonFunTerm3458(keyword3660, star3661, params3662, body3663) {
    this.keyword = keyword3660;
    this.star = star3661;
    this.params = params3662;
    this.body = body3663;
}
AnonFunTerm3458.properties = ["keyword", "star", "params", "body"];
AnonFunTerm3458.create = function (keyword3664, star3665, params3666, body3667) {
    return new AnonFunTerm3458(keyword3664, star3665, params3666, body3667);
};
inherit3236(ExprTerm3451, AnonFunTerm3458, { isAnonFunTerm: true });
function ArrowFunTerm3459(params3668, arrow3669, body3670) {
    this.params = params3668;
    this.arrow = arrow3669;
    this.body = body3670;
}
ArrowFunTerm3459.properties = ["params", "arrow", "body"];
ArrowFunTerm3459.create = function (params3671, arrow3672, body3673) {
    return new ArrowFunTerm3459(params3671, arrow3672, body3673);
};
inherit3236(ExprTerm3451, ArrowFunTerm3459, { isArrowFunTerm: true });
function ObjDotGetTerm3460(left3674, dot3675, right3676) {
    this.left = left3674;
    this.dot = dot3675;
    this.right = right3676;
}
ObjDotGetTerm3460.properties = ["left", "dot", "right"];
ObjDotGetTerm3460.create = function (left3677, dot3678, right3679) {
    return new ObjDotGetTerm3460(left3677, dot3678, right3679);
};
inherit3236(ExprTerm3451, ObjDotGetTerm3460, { isObjDotGetTerm: true });
function ObjGetTerm3461(left3680, right3681) {
    this.left = left3680;
    this.right = right3681;
}
ObjGetTerm3461.properties = ["left", "right"];
ObjGetTerm3461.create = function (left3682, right3683) {
    return new ObjGetTerm3461(left3682, right3683);
};
inherit3236(ExprTerm3451, ObjGetTerm3461, { isObjGetTerm: true });
function TemplateTerm3462(template3684) {
    this.template = template3684;
}
TemplateTerm3462.properties = ["template"];
TemplateTerm3462.create = function (template3685) {
    return new TemplateTerm3462(template3685);
};
inherit3236(ExprTerm3451, TemplateTerm3462, { isTemplateTerm: true });
function CallTerm3463(fun3686, args3687) {
    this.fun = fun3686;
    this.args = args3687;
}
CallTerm3463.properties = ["fun", "args"];
CallTerm3463.create = function (fun3688, args3689) {
    return new CallTerm3463(fun3688, args3689);
};
inherit3236(ExprTerm3451, CallTerm3463, { isCallTerm: true });
function QuoteSyntaxTerm3464(stx3690) {
    this.stx = stx3690;
}
QuoteSyntaxTerm3464.properties = ["stx"];
QuoteSyntaxTerm3464.create = function (stx3691) {
    return new QuoteSyntaxTerm3464(stx3691);
};
inherit3236(ExprTerm3451, QuoteSyntaxTerm3464, {
    isQuoteSyntaxTerm: true,
    destruct: function (context3692, options3693) {
        var tempId3694 = fresh3234();
        context3692.templateMap.set(tempId3694, this.stx.token.inner);
        return [syn3230.makeIdent("getTemplate", this.stx), syn3230.makeDelim("()", [syn3230.makeValue(tempId3694, this.stx)], this.stx)];
    }
});
function StopQuotedTerm3465(name3695, body3696) {
    this.name = name3695;
    this.body = body3696;
}
StopQuotedTerm3465.properties = ["name", "body"];
StopQuotedTerm3465.create = function (name3697, body3698) {
    return new StopQuotedTerm3465(name3697, body3698);
};
inherit3236(ExprTerm3451, StopQuotedTerm3465, { isStopQuotedTerm: true });
function PrimaryExpressionTerm3466() {}
PrimaryExpressionTerm3466.properties = [];
PrimaryExpressionTerm3466.create = function () {
    return new PrimaryExpressionTerm3466();
};
inherit3236(ExprTerm3451, PrimaryExpressionTerm3466, { isPrimaryExpressionTerm: true });
function ThisExpressionTerm3467(keyword3699) {
    this.keyword = keyword3699;
}
ThisExpressionTerm3467.properties = ["keyword"];
ThisExpressionTerm3467.create = function (keyword3700) {
    return new ThisExpressionTerm3467(keyword3700);
};
inherit3236(PrimaryExpressionTerm3466, ThisExpressionTerm3467, { isThisExpressionTerm: true });
function LitTerm3468(lit3701) {
    this.lit = lit3701;
}
LitTerm3468.properties = ["lit"];
LitTerm3468.create = function (lit3702) {
    return new LitTerm3468(lit3702);
};
inherit3236(PrimaryExpressionTerm3466, LitTerm3468, { isLitTerm: true });
function BlockTerm3469(body3703) {
    this.body = body3703;
}
BlockTerm3469.properties = ["body"];
BlockTerm3469.create = function (body3704) {
    return new BlockTerm3469(body3704);
};
inherit3236(PrimaryExpressionTerm3466, BlockTerm3469, { isBlockTerm: true });
function ArrayLiteralTerm3470(array3705) {
    this.array = array3705;
}
ArrayLiteralTerm3470.properties = ["array"];
ArrayLiteralTerm3470.create = function (array3706) {
    return new ArrayLiteralTerm3470(array3706);
};
inherit3236(PrimaryExpressionTerm3466, ArrayLiteralTerm3470, { isArrayLiteralTerm: true });
function IdTerm3471(id3707) {
    this.id = id3707;
}
IdTerm3471.properties = ["id"];
IdTerm3471.create = function (id3708) {
    return new IdTerm3471(id3708);
};
inherit3236(PrimaryExpressionTerm3466, IdTerm3471, { isIdTerm: true });
function PartialTerm3472() {}
PartialTerm3472.properties = [];
PartialTerm3472.create = function () {
    return new PartialTerm3472();
};
inherit3236(TermTree3421, PartialTerm3472, { isPartialTerm: true });
function PartialOperationTerm3473(stx3709, left3710) {
    this.stx = stx3709;
    this.left = left3710;
}
PartialOperationTerm3473.properties = ["stx", "left"];
PartialOperationTerm3473.create = function (stx3711, left3712) {
    return new PartialOperationTerm3473(stx3711, left3712);
};
inherit3236(PartialTerm3472, PartialOperationTerm3473, { isPartialOperationTerm: true });
function PartialExpressionTerm3474(stx3713, left3714, combine3715) {
    this.stx = stx3713;
    this.left = left3714;
    this.combine = combine3715;
}
PartialExpressionTerm3474.properties = ["stx", "left", "combine"];
PartialExpressionTerm3474.create = function (stx3716, left3717, combine3718) {
    return new PartialExpressionTerm3474(stx3716, left3717, combine3718);
};
inherit3236(PartialTerm3472, PartialExpressionTerm3474, { isPartialExpressionTerm: true });
function BindingStatementTerm3475(keyword3719, decls3720) {
    this.keyword = keyword3719;
    this.decls = decls3720;
}
BindingStatementTerm3475.properties = ["keyword", "decls"];
BindingStatementTerm3475.create = function (keyword3721, decls3722) {
    return new BindingStatementTerm3475(keyword3721, decls3722);
};
inherit3236(StatementTerm3445, BindingStatementTerm3475, {
    isBindingStatementTerm: true,
    destruct: function (context3723, options3724) {
        return this.keyword.destruct(context3723, options3724).concat(_3229.reduce(this.decls, function (acc3725, decl3726) {
            push3235.apply(acc3725, decl3726.destruct(context3723, options3724));
            return acc3725;
        }, []));
    }
});
function VariableStatementTerm3476(keyword3727, decls3728) {
    this.keyword = keyword3727;
    this.decls = decls3728;
}
VariableStatementTerm3476.properties = ["keyword", "decls"];
VariableStatementTerm3476.create = function (keyword3729, decls3730) {
    return new VariableStatementTerm3476(keyword3729, decls3730);
};
inherit3236(BindingStatementTerm3475, VariableStatementTerm3476, { isVariableStatementTerm: true });
function LetStatementTerm3477(keyword3731, decls3732) {
    this.keyword = keyword3731;
    this.decls = decls3732;
}
LetStatementTerm3477.properties = ["keyword", "decls"];
LetStatementTerm3477.create = function (keyword3733, decls3734) {
    return new LetStatementTerm3477(keyword3733, decls3734);
};
inherit3236(BindingStatementTerm3475, LetStatementTerm3477, { isLetStatementTerm: true });
function ConstStatementTerm3478(keyword3735, decls3736) {
    this.keyword = keyword3735;
    this.decls = decls3736;
}
ConstStatementTerm3478.properties = ["keyword", "decls"];
ConstStatementTerm3478.create = function (keyword3737, decls3738) {
    return new ConstStatementTerm3478(keyword3737, decls3738);
};
inherit3236(BindingStatementTerm3475, ConstStatementTerm3478, { isConstStatementTerm: true });
function ParenExpressionTerm3479(args3739, delim3740, commas3741) {
    this.args = args3739;
    this.delim = delim3740;
    this.commas = commas3741;
}
ParenExpressionTerm3479.properties = ["args", "delim", "commas"];
ParenExpressionTerm3479.create = function (args3742, delim3743, commas3744) {
    return new ParenExpressionTerm3479(args3742, delim3743, commas3744);
};
inherit3236(PrimaryExpressionTerm3466, ParenExpressionTerm3479, {
    isParenExpressionTerm: true,
    destruct: function (context3745, options3746) {
        var commas3747 = this.commas.slice();
        var src3748 = this.delim.token;
        var keys3749 = Object.keys(src3748);
        var newtok3750 = {};
        for (var i3751 = 0, len3752 = keys3749.length, key3753; i3751 < len3752; i3751++) {
            key3753 = keys3749[i3751];
            newtok3750[key3753] = src3748[key3753];
        }
        var delim3754 = syntaxFromToken3232(newtok3750, this.delim);
        delim3754.token.inner = _3229.reduce(this.args, function (acc3755, term3756) {
            assert3231(term3756 && term3756.isTermTree, "expecting term trees in destruct of ParenExpression");
            push3235.apply(acc3755, term3756.destruct(context3745, options3746));
            if ( // add all commas except for the last one
            commas3747.length > 0) {
                acc3755.push(commas3747.shift());
            }
            return acc3755;
        }, []);
        return DelimiterTerm3425.create(delim3754).destruct(context3745, options3746);
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
    LetMacroTerm: LetMacroTerm3439,
    MacroTerm: MacroTerm3440,
    AnonMacroTerm: AnonMacroTerm3441,
    OperatorDefinitionTerm: OperatorDefinitionTerm3442,
    ForPhaseTerm: ForPhaseTerm3443,
    VariableDeclarationTerm: VariableDeclarationTerm3444,
    StatementTerm: StatementTerm3445,
    EmptyTerm: EmptyTerm3446,
    CatchClauseTerm: CatchClauseTerm3447,
    ForStatementTerm: ForStatementTerm3448,
    ReturnStatementTerm: ReturnStatementTerm3450,
    ExprTerm: ExprTerm3451,
    UnaryOpTerm: UnaryOpTerm3452,
    PostfixOpTerm: PostfixOpTerm3453,
    BinOpTerm: BinOpTerm3454,
    AssignmentExpressionTerm: AssignmentExpressionTerm3455,
    ConditionalExpressionTerm: ConditionalExpressionTerm3456,
    NamedFunTerm: NamedFunTerm3457,
    AnonFunTerm: AnonFunTerm3458,
    ArrowFunTerm: ArrowFunTerm3459,
    ObjDotGetTerm: ObjDotGetTerm3460,
    ObjGetTerm: ObjGetTerm3461,
    TemplateTerm: TemplateTerm3462,
    CallTerm: CallTerm3463,
    QuoteSyntaxTerm: QuoteSyntaxTerm3464,
    StopQuotedTerm: StopQuotedTerm3465,
    PrimaryExpressionTerm: PrimaryExpressionTerm3466,
    ThisExpressionTerm: ThisExpressionTerm3467,
    LitTerm: LitTerm3468,
    BlockTerm: BlockTerm3469,
    ArrayLiteralTerm: ArrayLiteralTerm3470,
    IdTerm: IdTerm3471,
    PartialTerm: PartialTerm3472,
    PartialOperationTerm: PartialOperationTerm3473,
    PartialExpressionTerm: PartialExpressionTerm3474,
    BindingStatementTerm: BindingStatementTerm3475,
    VariableStatementTerm: VariableStatementTerm3476,
    LetStatementTerm: LetStatementTerm3477,
    ClassDeclarationTerm: ClassDeclarationTerm3449,
    ConstStatementTerm: ConstStatementTerm3478,
    ParenExpressionTerm: ParenExpressionTerm3479
};
//# sourceMappingURL=termTree.js.map