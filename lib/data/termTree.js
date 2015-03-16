"use strict";

var _3237 = require("underscore"),
    syn3238 = require("../syntax"),
    assert3239 = require("assert");
var syntaxFromToken3240 = syn3238.syntaxFromToken,
    adjustLineContext3241 = syn3238.adjustLineContext,
    fresh3242 = syn3238.fresh;
var push3243 = Array.prototype.push;
function inherit3244(parent3488, child3489, methods3490) {
    var P3491 = function P3491() {};
    P3491.prototype = parent3488.prototype;
    child3489.prototype = new P3491();
    child3489.prototype.constructor = child3489;
    _3237.extend(child3489.prototype, methods3490);
}
function TermTree3429() {}
TermTree3429.properties = [];
TermTree3429.create = function () {
    return new TermTree3429();
};
TermTree3429.prototype = {
    isTermTree: true,
    destruct: function (context3492, options3493) {
        assert3239(context3492, "must pass in the context to destruct");
        options3493 = options3493 || {};
        var self3494 = this;
        if (options3493.stripCompileTerm && this.isCompileTimeTerm) {
            return [];
        }
        if (options3493.stripModuleTerm && this.isModuleTimeTerm) {
            return [];
        }
        return _3237.reduce(this.constructor.properties, function (acc3495, prop3496) {
            if (self3494[prop3496] && self3494[prop3496].isTermTree) {
                push3243.apply(acc3495, self3494[prop3496].destruct(context3492, options3493));
                return acc3495;
            } else if (self3494[prop3496] && self3494[prop3496].token && self3494[prop3496].token.inner) {
                var src3497 = self3494[prop3496].token;
                var keys3498 = Object.keys(src3497);
                var newtok3499 = {};
                for (var i3500 = 0, len3501 = keys3498.length, key3502; i3500 < len3501; i3500++) {
                    key3502 = keys3498[i3500];
                    newtok3499[key3502] = src3497[key3502];
                }
                var clone3503 = syntaxFromToken3240(newtok3499, self3494[prop3496]);
                clone3503.token.inner = _3237.reduce(clone3503.token.inner, function (acc3504, t3505) {
                    if (t3505 && t3505.isTermTree) {
                        push3243.apply(acc3504, t3505.destruct(context3492, options3493));
                        return acc3504;
                    }
                    acc3504.push(t3505);
                    return acc3504;
                }, []);
                acc3495.push(clone3503);
                return acc3495;
            } else if (Array.isArray(self3494[prop3496])) {
                var destArr3506 = _3237.reduce(self3494[prop3496], function (acc3507, t3508) {
                    if (t3508 && t3508.isTermTree) {
                        push3243.apply(acc3507, t3508.destruct(context3492, options3493));
                        return acc3507;
                    }
                    acc3507.push(t3508);
                    return acc3507;
                }, []);
                push3243.apply(acc3495, destArr3506);
                return acc3495;
            } else if (self3494[prop3496]) {
                acc3495.push(self3494[prop3496]);
                return acc3495;
            } else {
                return acc3495;
            }
        }, []);
    }
};
function EOFTerm3430(eof3509) {
    this.eof = eof3509;
}
EOFTerm3430.properties = ["eof"];
EOFTerm3430.create = function (eof3510) {
    return new EOFTerm3430(eof3510);
};
inherit3244(TermTree3429, EOFTerm3430, { isEOFTerm: true });
function KeywordTerm3431(keyword3511) {
    this.keyword = keyword3511;
}
KeywordTerm3431.properties = ["keyword"];
KeywordTerm3431.create = function (keyword3512) {
    return new KeywordTerm3431(keyword3512);
};
inherit3244(TermTree3429, KeywordTerm3431, { isKeywordTerm: true });
function PuncTerm3432(punc3513) {
    this.punc = punc3513;
}
PuncTerm3432.properties = ["punc"];
PuncTerm3432.create = function (punc3514) {
    return new PuncTerm3432(punc3514);
};
inherit3244(TermTree3429, PuncTerm3432, { isPuncTerm: true });
function DelimiterTerm3433(delim3515) {
    this.delim = delim3515;
}
DelimiterTerm3433.properties = ["delim"];
DelimiterTerm3433.create = function (delim3516) {
    return new DelimiterTerm3433(delim3516);
};
inherit3244(TermTree3429, DelimiterTerm3433, { isDelimiterTerm: true });
function ModuleTimeTerm3434() {}
ModuleTimeTerm3434.properties = [];
ModuleTimeTerm3434.create = function () {
    return new ModuleTimeTerm3434();
};
inherit3244(TermTree3429, ModuleTimeTerm3434, { isModuleTimeTerm: true });
function ModuleTerm3435(body3517) {
    this.body = body3517;
}
ModuleTerm3435.properties = ["body"];
ModuleTerm3435.create = function (body3518) {
    return new ModuleTerm3435(body3518);
};
inherit3244(ModuleTimeTerm3434, ModuleTerm3435, { isModuleTerm: true });
function ImportTerm3436(kw3519, clause3520, fromkw3521, from3522) {
    this.kw = kw3519;
    this.clause = clause3520;
    this.fromkw = fromkw3521;
    this.from = from3522;
}
ImportTerm3436.properties = ["kw", "clause", "fromkw", "from"];
ImportTerm3436.create = function (kw3523, clause3524, fromkw3525, from3526) {
    return new ImportTerm3436(kw3523, clause3524, fromkw3525, from3526);
};
inherit3244(ModuleTimeTerm3434, ImportTerm3436, { isImportTerm: true });
function ImportForPhaseTerm3437(kw3527, clause3528, fromkw3529, from3530, forkw3531, macroskw3532, phase3533) {
    this.kw = kw3527;
    this.clause = clause3528;
    this.fromkw = fromkw3529;
    this.from = from3530;
    this.forkw = forkw3531;
    this.macroskw = macroskw3532;
    this.phase = phase3533;
}
ImportForPhaseTerm3437.properties = ["kw", "clause", "fromkw", "from", "forkw", "macroskw", "phase"];
ImportForPhaseTerm3437.create = function (kw3534, clause3535, fromkw3536, from3537, forkw3538, macroskw3539, phase3540) {
    return new ImportForPhaseTerm3437(kw3534, clause3535, fromkw3536, from3537, forkw3538, macroskw3539, phase3540);
};
inherit3244(ModuleTimeTerm3434, ImportForPhaseTerm3437, { isImportForPhaseTerm: true });
function NamedImportTerm3438(names3541) {
    this.names = names3541;
}
NamedImportTerm3438.properties = ["names"];
NamedImportTerm3438.create = function (names3542) {
    return new NamedImportTerm3438(names3542);
};
inherit3244(ModuleTimeTerm3434, NamedImportTerm3438, { isNamedImportTerm: true });
function DefaultImportTerm3439(name3543) {
    this.name = name3543;
}
DefaultImportTerm3439.properties = ["name"];
DefaultImportTerm3439.create = function (name3544) {
    return new DefaultImportTerm3439(name3544);
};
inherit3244(ModuleTimeTerm3434, DefaultImportTerm3439, { isDefaultImportTerm: true });
function NamespaceImportTerm3440(star3545, askw3546, name3547) {
    this.star = star3545;
    this.askw = askw3546;
    this.name = name3547;
}
NamespaceImportTerm3440.properties = ["star", "askw", "name"];
NamespaceImportTerm3440.create = function (star3548, askw3549, name3550) {
    return new NamespaceImportTerm3440(star3548, askw3549, name3550);
};
inherit3244(ModuleTimeTerm3434, NamespaceImportTerm3440, { isNamespaceImportTerm: true });
function BindingTerm3441(importName3551) {
    this.importName = importName3551;
}
BindingTerm3441.properties = ["importName"];
BindingTerm3441.create = function (importName3552) {
    return new BindingTerm3441(importName3552);
};
inherit3244(ModuleTimeTerm3434, BindingTerm3441, { isBindingTerm: true });
function QualifiedBindingTerm3442(importName3553, askw3554, localName3555) {
    this.importName = importName3553;
    this.askw = askw3554;
    this.localName = localName3555;
}
QualifiedBindingTerm3442.properties = ["importName", "askw", "localName"];
QualifiedBindingTerm3442.create = function (importName3556, askw3557, localName3558) {
    return new QualifiedBindingTerm3442(importName3556, askw3557, localName3558);
};
inherit3244(ModuleTimeTerm3434, QualifiedBindingTerm3442, { isQualifiedBindingTerm: true });
function ExportNameTerm3443(kw3559, name3560) {
    this.kw = kw3559;
    this.name = name3560;
}
ExportNameTerm3443.properties = ["kw", "name"];
ExportNameTerm3443.create = function (kw3561, name3562) {
    return new ExportNameTerm3443(kw3561, name3562);
};
inherit3244(ModuleTimeTerm3434, ExportNameTerm3443, { isExportNameTerm: true });
function ExportDefaultTerm3444(kw3563, defaultkw3564, decl3565) {
    this.kw = kw3563;
    this.defaultkw = defaultkw3564;
    this.decl = decl3565;
}
ExportDefaultTerm3444.properties = ["kw", "defaultkw", "decl"];
ExportDefaultTerm3444.create = function (kw3566, defaultkw3567, decl3568) {
    return new ExportDefaultTerm3444(kw3566, defaultkw3567, decl3568);
};
inherit3244(ModuleTimeTerm3434, ExportDefaultTerm3444, { isExportDefaultTerm: true });
function ExportDeclTerm3445(kw3569, decl3570) {
    this.kw = kw3569;
    this.decl = decl3570;
}
ExportDeclTerm3445.properties = ["kw", "decl"];
ExportDeclTerm3445.create = function (kw3571, decl3572) {
    return new ExportDeclTerm3445(kw3571, decl3572);
};
inherit3244(ModuleTimeTerm3434, ExportDeclTerm3445, { isExportDeclTerm: true });
function CompileTimeTerm3446() {}
CompileTimeTerm3446.properties = [];
CompileTimeTerm3446.create = function () {
    return new CompileTimeTerm3446();
};
inherit3244(TermTree3429, CompileTimeTerm3446, { isCompileTimeTerm: true });
function LetMacroTerm3447(name3573, body3574) {
    this.name = name3573;
    this.body = body3574;
}
LetMacroTerm3447.properties = ["name", "body"];
LetMacroTerm3447.create = function (name3575, body3576) {
    return new LetMacroTerm3447(name3575, body3576);
};
inherit3244(CompileTimeTerm3446, LetMacroTerm3447, { isLetMacroTerm: true });
function MacroTerm3448(name3577, body3578) {
    this.name = name3577;
    this.body = body3578;
}
MacroTerm3448.properties = ["name", "body"];
MacroTerm3448.create = function (name3579, body3580) {
    return new MacroTerm3448(name3579, body3580);
};
inherit3244(CompileTimeTerm3446, MacroTerm3448, { isMacroTerm: true });
function AnonMacroTerm3449(body3581) {
    this.body = body3581;
}
AnonMacroTerm3449.properties = ["body"];
AnonMacroTerm3449.create = function (body3582) {
    return new AnonMacroTerm3449(body3582);
};
inherit3244(CompileTimeTerm3446, AnonMacroTerm3449, { isAnonMacroTerm: true });
function OperatorDefinitionTerm3450(type3583, name3584, prec3585, assoc3586, body3587) {
    this.type = type3583;
    this.name = name3584;
    this.prec = prec3585;
    this.assoc = assoc3586;
    this.body = body3587;
}
OperatorDefinitionTerm3450.properties = ["type", "name", "prec", "assoc", "body"];
OperatorDefinitionTerm3450.create = function (type3588, name3589, prec3590, assoc3591, body3592) {
    return new OperatorDefinitionTerm3450(type3588, name3589, prec3590, assoc3591, body3592);
};
inherit3244(CompileTimeTerm3446, OperatorDefinitionTerm3450, { isOperatorDefinitionTerm: true });
function ForPhaseTerm3451(phase3593, body3594) {
    this.phase = phase3593;
    this.body = body3594;
}
ForPhaseTerm3451.properties = ["phase", "body"];
ForPhaseTerm3451.create = function (phase3595, body3596) {
    return new ForPhaseTerm3451(phase3595, body3596);
};
inherit3244(CompileTimeTerm3446, ForPhaseTerm3451, { isForPhaseTerm: true });
function VariableDeclarationTerm3452(ident3597, eq3598, init3599, comma3600) {
    this.ident = ident3597;
    this.eq = eq3598;
    this.init = init3599;
    this.comma = comma3600;
}
VariableDeclarationTerm3452.properties = ["ident", "eq", "init", "comma"];
VariableDeclarationTerm3452.create = function (ident3601, eq3602, init3603, comma3604) {
    return new VariableDeclarationTerm3452(ident3601, eq3602, init3603, comma3604);
};
inherit3244(TermTree3429, VariableDeclarationTerm3452, { isVariableDeclarationTerm: true });
function StatementTerm3453() {}
StatementTerm3453.properties = [];
StatementTerm3453.create = function () {
    return new StatementTerm3453();
};
inherit3244(TermTree3429, StatementTerm3453, { isStatementTerm: true });
function EmptyTerm3454() {}
EmptyTerm3454.properties = [];
EmptyTerm3454.create = function () {
    return new EmptyTerm3454();
};
inherit3244(StatementTerm3453, EmptyTerm3454, { isEmptyTerm: true });
function CatchClauseTerm3455(keyword3605, params3606, body3607) {
    this.keyword = keyword3605;
    this.params = params3606;
    this.body = body3607;
}
CatchClauseTerm3455.properties = ["keyword", "params", "body"];
CatchClauseTerm3455.create = function (keyword3608, params3609, body3610) {
    return new CatchClauseTerm3455(keyword3608, params3609, body3610);
};
inherit3244(StatementTerm3453, CatchClauseTerm3455, { isCatchClauseTerm: true });
function ForStatementTerm3456(keyword3611, cond3612) {
    this.keyword = keyword3611;
    this.cond = cond3612;
}
ForStatementTerm3456.properties = ["keyword", "cond"];
ForStatementTerm3456.create = function (keyword3613, cond3614) {
    return new ForStatementTerm3456(keyword3613, cond3614);
};
inherit3244(StatementTerm3453, ForStatementTerm3456, { isForStatementTerm: true });
function ClassDeclarationTerm3457(keyword3615, name3616, body3617) {
    this.keyword = keyword3615;
    this.name = name3616;
    this.body = body3617;
}
ClassDeclarationTerm3457.properties = ["keyword", "name", "body"];
ClassDeclarationTerm3457.create = function (keyword3618, name3619, body3620) {
    return new ClassDeclarationTerm3457(keyword3618, name3619, body3620);
};
inherit3244(StatementTerm3453, ClassDeclarationTerm3457, { isClassDeclarationTerm: true });
function ReturnStatementTerm3458(keyword3621, expr3622) {
    this.keyword = keyword3621;
    this.expr = expr3622;
}
ReturnStatementTerm3458.properties = ["keyword", "expr"];
ReturnStatementTerm3458.create = function (keyword3623, expr3624) {
    return new ReturnStatementTerm3458(keyword3623, expr3624);
};
inherit3244(StatementTerm3453, ReturnStatementTerm3458, {
    isReturnStatementTerm: true,
    destruct: function (context3625, options3626) {
        var expr3627 = this.expr.destruct(context3625, options3626);
        // need to adjust the line numbers to make sure that the expr
        // starts on the same line as the return keyword. This might
        // not be the case if an operator or infix macro perturbed the
        // line numbers during expansion.
        expr3627 = adjustLineContext3241(expr3627, this.keyword.keyword);
        return this.keyword.destruct(context3625, options3626).concat(expr3627);
    }
});
function ExprTerm3459() {}
ExprTerm3459.properties = [];
ExprTerm3459.create = function () {
    return new ExprTerm3459();
};
inherit3244(StatementTerm3453, ExprTerm3459, { isExprTerm: true });
function UnaryOpTerm3460(op3628, expr3629) {
    this.op = op3628;
    this.expr = expr3629;
}
UnaryOpTerm3460.properties = ["op", "expr"];
UnaryOpTerm3460.create = function (op3630, expr3631) {
    return new UnaryOpTerm3460(op3630, expr3631);
};
inherit3244(ExprTerm3459, UnaryOpTerm3460, { isUnaryOpTerm: true });
function PostfixOpTerm3461(expr3632, op3633) {
    this.expr = expr3632;
    this.op = op3633;
}
PostfixOpTerm3461.properties = ["expr", "op"];
PostfixOpTerm3461.create = function (expr3634, op3635) {
    return new PostfixOpTerm3461(expr3634, op3635);
};
inherit3244(ExprTerm3459, PostfixOpTerm3461, { isPostfixOpTerm: true });
function BinOpTerm3462(left3636, op3637, right3638) {
    this.left = left3636;
    this.op = op3637;
    this.right = right3638;
}
BinOpTerm3462.properties = ["left", "op", "right"];
BinOpTerm3462.create = function (left3639, op3640, right3641) {
    return new BinOpTerm3462(left3639, op3640, right3641);
};
inherit3244(ExprTerm3459, BinOpTerm3462, { isBinOpTerm: true });
function AssignmentExpressionTerm3463(left3642, op3643, right3644) {
    this.left = left3642;
    this.op = op3643;
    this.right = right3644;
}
AssignmentExpressionTerm3463.properties = ["left", "op", "right"];
AssignmentExpressionTerm3463.create = function (left3645, op3646, right3647) {
    return new AssignmentExpressionTerm3463(left3645, op3646, right3647);
};
inherit3244(ExprTerm3459, AssignmentExpressionTerm3463, { isAssignmentExpressionTerm: true });
function ConditionalExpressionTerm3464(cond3648, question3649, tru3650, colon3651, fls3652) {
    this.cond = cond3648;
    this.question = question3649;
    this.tru = tru3650;
    this.colon = colon3651;
    this.fls = fls3652;
}
ConditionalExpressionTerm3464.properties = ["cond", "question", "tru", "colon", "fls"];
ConditionalExpressionTerm3464.create = function (cond3653, question3654, tru3655, colon3656, fls3657) {
    return new ConditionalExpressionTerm3464(cond3653, question3654, tru3655, colon3656, fls3657);
};
inherit3244(ExprTerm3459, ConditionalExpressionTerm3464, { isConditionalExpressionTerm: true });
function NamedFunTerm3465(keyword3658, star3659, name3660, params3661, body3662) {
    this.keyword = keyword3658;
    this.star = star3659;
    this.name = name3660;
    this.params = params3661;
    this.body = body3662;
}
NamedFunTerm3465.properties = ["keyword", "star", "name", "params", "body"];
NamedFunTerm3465.create = function (keyword3663, star3664, name3665, params3666, body3667) {
    return new NamedFunTerm3465(keyword3663, star3664, name3665, params3666, body3667);
};
inherit3244(ExprTerm3459, NamedFunTerm3465, { isNamedFunTerm: true });
function AnonFunTerm3466(keyword3668, star3669, params3670, body3671) {
    this.keyword = keyword3668;
    this.star = star3669;
    this.params = params3670;
    this.body = body3671;
}
AnonFunTerm3466.properties = ["keyword", "star", "params", "body"];
AnonFunTerm3466.create = function (keyword3672, star3673, params3674, body3675) {
    return new AnonFunTerm3466(keyword3672, star3673, params3674, body3675);
};
inherit3244(ExprTerm3459, AnonFunTerm3466, { isAnonFunTerm: true });
function ArrowFunTerm3467(params3676, arrow3677, body3678) {
    this.params = params3676;
    this.arrow = arrow3677;
    this.body = body3678;
}
ArrowFunTerm3467.properties = ["params", "arrow", "body"];
ArrowFunTerm3467.create = function (params3679, arrow3680, body3681) {
    return new ArrowFunTerm3467(params3679, arrow3680, body3681);
};
inherit3244(ExprTerm3459, ArrowFunTerm3467, { isArrowFunTerm: true });
function ObjDotGetTerm3468(left3682, dot3683, right3684) {
    this.left = left3682;
    this.dot = dot3683;
    this.right = right3684;
}
ObjDotGetTerm3468.properties = ["left", "dot", "right"];
ObjDotGetTerm3468.create = function (left3685, dot3686, right3687) {
    return new ObjDotGetTerm3468(left3685, dot3686, right3687);
};
inherit3244(ExprTerm3459, ObjDotGetTerm3468, { isObjDotGetTerm: true });
function ObjGetTerm3469(left3688, right3689) {
    this.left = left3688;
    this.right = right3689;
}
ObjGetTerm3469.properties = ["left", "right"];
ObjGetTerm3469.create = function (left3690, right3691) {
    return new ObjGetTerm3469(left3690, right3691);
};
inherit3244(ExprTerm3459, ObjGetTerm3469, { isObjGetTerm: true });
function TemplateTerm3470(template3692) {
    this.template = template3692;
}
TemplateTerm3470.properties = ["template"];
TemplateTerm3470.create = function (template3693) {
    return new TemplateTerm3470(template3693);
};
inherit3244(ExprTerm3459, TemplateTerm3470, { isTemplateTerm: true });
function CallTerm3471(fun3694, args3695) {
    this.fun = fun3694;
    this.args = args3695;
}
CallTerm3471.properties = ["fun", "args"];
CallTerm3471.create = function (fun3696, args3697) {
    return new CallTerm3471(fun3696, args3697);
};
inherit3244(ExprTerm3459, CallTerm3471, { isCallTerm: true });
function QuoteSyntaxTerm3472(stx3698) {
    this.stx = stx3698;
}
QuoteSyntaxTerm3472.properties = ["stx"];
QuoteSyntaxTerm3472.create = function (stx3699) {
    return new QuoteSyntaxTerm3472(stx3699);
};
inherit3244(ExprTerm3459, QuoteSyntaxTerm3472, {
    isQuoteSyntaxTerm: true,
    destruct: function (context3700, options3701) {
        var tempId3702 = fresh3242();
        context3700.templateMap.set(tempId3702, this.stx.token.inner);
        return [syn3238.makeIdent("getTemplate", this.stx), syn3238.makeDelim("()", [syn3238.makeValue(tempId3702, this.stx)], this.stx)];
    }
});
function StopQuotedTerm3473(name3703, body3704) {
    this.name = name3703;
    this.body = body3704;
}
StopQuotedTerm3473.properties = ["name", "body"];
StopQuotedTerm3473.create = function (name3705, body3706) {
    return new StopQuotedTerm3473(name3705, body3706);
};
inherit3244(ExprTerm3459, StopQuotedTerm3473, { isStopQuotedTerm: true });
function PrimaryExpressionTerm3474() {}
PrimaryExpressionTerm3474.properties = [];
PrimaryExpressionTerm3474.create = function () {
    return new PrimaryExpressionTerm3474();
};
inherit3244(ExprTerm3459, PrimaryExpressionTerm3474, { isPrimaryExpressionTerm: true });
function ThisExpressionTerm3475(keyword3707) {
    this.keyword = keyword3707;
}
ThisExpressionTerm3475.properties = ["keyword"];
ThisExpressionTerm3475.create = function (keyword3708) {
    return new ThisExpressionTerm3475(keyword3708);
};
inherit3244(PrimaryExpressionTerm3474, ThisExpressionTerm3475, { isThisExpressionTerm: true });
function LitTerm3476(lit3709) {
    this.lit = lit3709;
}
LitTerm3476.properties = ["lit"];
LitTerm3476.create = function (lit3710) {
    return new LitTerm3476(lit3710);
};
inherit3244(PrimaryExpressionTerm3474, LitTerm3476, { isLitTerm: true });
function BlockTerm3477(body3711) {
    this.body = body3711;
}
BlockTerm3477.properties = ["body"];
BlockTerm3477.create = function (body3712) {
    return new BlockTerm3477(body3712);
};
inherit3244(PrimaryExpressionTerm3474, BlockTerm3477, { isBlockTerm: true });
function ArrayLiteralTerm3478(array3713) {
    this.array = array3713;
}
ArrayLiteralTerm3478.properties = ["array"];
ArrayLiteralTerm3478.create = function (array3714) {
    return new ArrayLiteralTerm3478(array3714);
};
inherit3244(PrimaryExpressionTerm3474, ArrayLiteralTerm3478, { isArrayLiteralTerm: true });
function IdTerm3479(id3715) {
    this.id = id3715;
}
IdTerm3479.properties = ["id"];
IdTerm3479.create = function (id3716) {
    return new IdTerm3479(id3716);
};
inherit3244(PrimaryExpressionTerm3474, IdTerm3479, { isIdTerm: true });
function PartialTerm3480() {}
PartialTerm3480.properties = [];
PartialTerm3480.create = function () {
    return new PartialTerm3480();
};
inherit3244(TermTree3429, PartialTerm3480, { isPartialTerm: true });
function PartialOperationTerm3481(stx3717, left3718) {
    this.stx = stx3717;
    this.left = left3718;
}
PartialOperationTerm3481.properties = ["stx", "left"];
PartialOperationTerm3481.create = function (stx3719, left3720) {
    return new PartialOperationTerm3481(stx3719, left3720);
};
inherit3244(PartialTerm3480, PartialOperationTerm3481, { isPartialOperationTerm: true });
function PartialExpressionTerm3482(stx3721, left3722, combine3723) {
    this.stx = stx3721;
    this.left = left3722;
    this.combine = combine3723;
}
PartialExpressionTerm3482.properties = ["stx", "left", "combine"];
PartialExpressionTerm3482.create = function (stx3724, left3725, combine3726) {
    return new PartialExpressionTerm3482(stx3724, left3725, combine3726);
};
inherit3244(PartialTerm3480, PartialExpressionTerm3482, { isPartialExpressionTerm: true });
function BindingStatementTerm3483(keyword3727, decls3728) {
    this.keyword = keyword3727;
    this.decls = decls3728;
}
BindingStatementTerm3483.properties = ["keyword", "decls"];
BindingStatementTerm3483.create = function (keyword3729, decls3730) {
    return new BindingStatementTerm3483(keyword3729, decls3730);
};
inherit3244(StatementTerm3453, BindingStatementTerm3483, {
    isBindingStatementTerm: true,
    destruct: function (context3731, options3732) {
        return this.keyword.destruct(context3731, options3732).concat(_3237.reduce(this.decls, function (acc3733, decl3734) {
            push3243.apply(acc3733, decl3734.destruct(context3731, options3732));
            return acc3733;
        }, []));
    }
});
function VariableStatementTerm3484(keyword3735, decls3736) {
    this.keyword = keyword3735;
    this.decls = decls3736;
}
VariableStatementTerm3484.properties = ["keyword", "decls"];
VariableStatementTerm3484.create = function (keyword3737, decls3738) {
    return new VariableStatementTerm3484(keyword3737, decls3738);
};
inherit3244(BindingStatementTerm3483, VariableStatementTerm3484, { isVariableStatementTerm: true });
function LetStatementTerm3485(keyword3739, decls3740) {
    this.keyword = keyword3739;
    this.decls = decls3740;
}
LetStatementTerm3485.properties = ["keyword", "decls"];
LetStatementTerm3485.create = function (keyword3741, decls3742) {
    return new LetStatementTerm3485(keyword3741, decls3742);
};
inherit3244(BindingStatementTerm3483, LetStatementTerm3485, { isLetStatementTerm: true });
function ConstStatementTerm3486(keyword3743, decls3744) {
    this.keyword = keyword3743;
    this.decls = decls3744;
}
ConstStatementTerm3486.properties = ["keyword", "decls"];
ConstStatementTerm3486.create = function (keyword3745, decls3746) {
    return new ConstStatementTerm3486(keyword3745, decls3746);
};
inherit3244(BindingStatementTerm3483, ConstStatementTerm3486, { isConstStatementTerm: true });
function ParenExpressionTerm3487(args3747, delim3748, commas3749) {
    this.args = args3747;
    this.delim = delim3748;
    this.commas = commas3749;
}
ParenExpressionTerm3487.properties = ["args", "delim", "commas"];
ParenExpressionTerm3487.create = function (args3750, delim3751, commas3752) {
    return new ParenExpressionTerm3487(args3750, delim3751, commas3752);
};
inherit3244(PrimaryExpressionTerm3474, ParenExpressionTerm3487, {
    isParenExpressionTerm: true,
    destruct: function (context3753, options3754) {
        var commas3755 = this.commas.slice();
        var src3756 = this.delim.token;
        var keys3757 = Object.keys(src3756);
        var newtok3758 = {};
        for (var i3759 = 0, len3760 = keys3757.length, key3761; i3759 < len3760; i3759++) {
            key3761 = keys3757[i3759];
            newtok3758[key3761] = src3756[key3761];
        }
        var delim3762 = syntaxFromToken3240(newtok3758, this.delim);
        delim3762.token.inner = _3237.reduce(this.args, function (acc3763, term3764) {
            assert3239(term3764 && term3764.isTermTree, "expecting term trees in destruct of ParenExpression");
            push3243.apply(acc3763, term3764.destruct(context3753, options3754));
            if ( // add all commas except for the last one
            commas3755.length > 0) {
                acc3763.push(commas3755.shift());
            }
            return acc3763;
        }, []);
        return DelimiterTerm3433.create(delim3762).destruct(context3753, options3754);
    }
});
module.exports = {
    TermTree: TermTree3429,
    EOFTerm: EOFTerm3430,
    KeywordTerm: KeywordTerm3431,
    PuncTerm: PuncTerm3432,
    DelimiterTerm: DelimiterTerm3433,
    ModuleTimeTerm: ModuleTimeTerm3434,
    ModuleTerm: ModuleTerm3435,
    ImportTerm: ImportTerm3436,
    ImportForPhaseTerm: ImportForPhaseTerm3437,
    NamedImportTerm: NamedImportTerm3438,
    NamespaceImportTerm: NamespaceImportTerm3440,
    DefaultImportTerm: DefaultImportTerm3439,
    BindingTerm: BindingTerm3441,
    QualifiedBindingTerm: QualifiedBindingTerm3442,
    ExportNameTerm: ExportNameTerm3443,
    ExportDefaultTerm: ExportDefaultTerm3444,
    ExportDeclTerm: ExportDeclTerm3445,
    CompileTimeTerm: CompileTimeTerm3446,
    LetMacroTerm: LetMacroTerm3447,
    MacroTerm: MacroTerm3448,
    AnonMacroTerm: AnonMacroTerm3449,
    OperatorDefinitionTerm: OperatorDefinitionTerm3450,
    ForPhaseTerm: ForPhaseTerm3451,
    VariableDeclarationTerm: VariableDeclarationTerm3452,
    StatementTerm: StatementTerm3453,
    EmptyTerm: EmptyTerm3454,
    CatchClauseTerm: CatchClauseTerm3455,
    ForStatementTerm: ForStatementTerm3456,
    ReturnStatementTerm: ReturnStatementTerm3458,
    ExprTerm: ExprTerm3459,
    UnaryOpTerm: UnaryOpTerm3460,
    PostfixOpTerm: PostfixOpTerm3461,
    BinOpTerm: BinOpTerm3462,
    AssignmentExpressionTerm: AssignmentExpressionTerm3463,
    ConditionalExpressionTerm: ConditionalExpressionTerm3464,
    NamedFunTerm: NamedFunTerm3465,
    AnonFunTerm: AnonFunTerm3466,
    ArrowFunTerm: ArrowFunTerm3467,
    ObjDotGetTerm: ObjDotGetTerm3468,
    ObjGetTerm: ObjGetTerm3469,
    TemplateTerm: TemplateTerm3470,
    CallTerm: CallTerm3471,
    QuoteSyntaxTerm: QuoteSyntaxTerm3472,
    StopQuotedTerm: StopQuotedTerm3473,
    PrimaryExpressionTerm: PrimaryExpressionTerm3474,
    ThisExpressionTerm: ThisExpressionTerm3475,
    LitTerm: LitTerm3476,
    BlockTerm: BlockTerm3477,
    ArrayLiteralTerm: ArrayLiteralTerm3478,
    IdTerm: IdTerm3479,
    PartialTerm: PartialTerm3480,
    PartialOperationTerm: PartialOperationTerm3481,
    PartialExpressionTerm: PartialExpressionTerm3482,
    BindingStatementTerm: BindingStatementTerm3483,
    VariableStatementTerm: VariableStatementTerm3484,
    LetStatementTerm: LetStatementTerm3485,
    ClassDeclarationTerm: ClassDeclarationTerm3457,
    ConstStatementTerm: ConstStatementTerm3486,
    ParenExpressionTerm: ParenExpressionTerm3487
};
//# sourceMappingURL=termTree.js.map