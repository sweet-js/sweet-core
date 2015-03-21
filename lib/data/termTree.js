"use strict";

var _3227 = require("underscore"),
    syn3228 = require("../syntax"),
    assert3229 = require("assert");
var syntaxFromToken3230 = syn3228.syntaxFromToken,
    adjustLineContext3231 = syn3228.adjustLineContext,
    fresh3232 = syn3228.fresh;
var push3233 = Array.prototype.push;
function inherit3234(parent3476, child3477, methods3478) {
    var P3479 = function P3479() {};
    P3479.prototype = parent3476.prototype;
    child3477.prototype = new P3479();
    child3477.prototype.constructor = child3477;
    _3227.extend(child3477.prototype, methods3478);
}
function TermTree3419() {}
TermTree3419.properties = [];
TermTree3419.create = function () {
    return new TermTree3419();
};
TermTree3419.prototype = {
    isTermTree: true,
    destruct: function (context3480, options3481) {
        assert3229(context3480, "must pass in the context to destruct");
        options3481 = options3481 || {};
        var self3482 = this;
        if (options3481.stripCompileTerm && this.isCompileTimeTerm) {
            return [];
        }
        if (options3481.stripModuleTerm && this.isModuleTimeTerm) {
            return [];
        }
        return _3227.reduce(this.constructor.properties, function (acc3483, prop3484) {
            if (self3482[prop3484] && self3482[prop3484].isTermTree) {
                push3233.apply(acc3483, self3482[prop3484].destruct(context3480, options3481));
                return acc3483;
            } else if (self3482[prop3484] && self3482[prop3484].token && self3482[prop3484].token.inner) {
                var src3485 = self3482[prop3484].token;
                var keys3486 = Object.keys(src3485);
                var newtok3487 = {};
                for (var i3488 = 0, len3489 = keys3486.length, key3490; i3488 < len3489; i3488++) {
                    key3490 = keys3486[i3488];
                    newtok3487[key3490] = src3485[key3490];
                }
                var clone3491 = syntaxFromToken3230(newtok3487, self3482[prop3484]);
                clone3491.token.inner = _3227.reduce(clone3491.token.inner, function (acc3492, t3493) {
                    if (t3493 && t3493.isTermTree) {
                        push3233.apply(acc3492, t3493.destruct(context3480, options3481));
                        return acc3492;
                    }
                    acc3492.push(t3493);
                    return acc3492;
                }, []);
                acc3483.push(clone3491);
                return acc3483;
            } else if (Array.isArray(self3482[prop3484])) {
                var destArr3494 = _3227.reduce(self3482[prop3484], function (acc3495, t3496) {
                    if (t3496 && t3496.isTermTree) {
                        push3233.apply(acc3495, t3496.destruct(context3480, options3481));
                        return acc3495;
                    }
                    acc3495.push(t3496);
                    return acc3495;
                }, []);
                push3233.apply(acc3483, destArr3494);
                return acc3483;
            } else if (self3482[prop3484]) {
                acc3483.push(self3482[prop3484]);
                return acc3483;
            } else {
                return acc3483;
            }
        }, []);
    }
};
function EOFTerm3420(eof3497) {
    this.eof = eof3497;
}
EOFTerm3420.properties = ["eof"];
EOFTerm3420.create = function (eof3498) {
    return new EOFTerm3420(eof3498);
};
inherit3234(TermTree3419, EOFTerm3420, { isEOFTerm: true });
function KeywordTerm3421(keyword3499) {
    this.keyword = keyword3499;
}
KeywordTerm3421.properties = ["keyword"];
KeywordTerm3421.create = function (keyword3500) {
    return new KeywordTerm3421(keyword3500);
};
inherit3234(TermTree3419, KeywordTerm3421, { isKeywordTerm: true });
function PuncTerm3422(punc3501) {
    this.punc = punc3501;
}
PuncTerm3422.properties = ["punc"];
PuncTerm3422.create = function (punc3502) {
    return new PuncTerm3422(punc3502);
};
inherit3234(TermTree3419, PuncTerm3422, { isPuncTerm: true });
function DelimiterTerm3423(delim3503) {
    this.delim = delim3503;
}
DelimiterTerm3423.properties = ["delim"];
DelimiterTerm3423.create = function (delim3504) {
    return new DelimiterTerm3423(delim3504);
};
inherit3234(TermTree3419, DelimiterTerm3423, { isDelimiterTerm: true });
function ModuleTimeTerm3424() {}
ModuleTimeTerm3424.properties = [];
ModuleTimeTerm3424.create = function () {
    return new ModuleTimeTerm3424();
};
inherit3234(TermTree3419, ModuleTimeTerm3424, { isModuleTimeTerm: true });
function ModuleTerm3425(body3505) {
    this.body = body3505;
}
ModuleTerm3425.properties = ["body"];
ModuleTerm3425.create = function (body3506) {
    return new ModuleTerm3425(body3506);
};
inherit3234(ModuleTimeTerm3424, ModuleTerm3425, { isModuleTerm: true });
function ImportTerm3426(kw3507, clause3508, fromkw3509, from3510) {
    this.kw = kw3507;
    this.clause = clause3508;
    this.fromkw = fromkw3509;
    this.from = from3510;
}
ImportTerm3426.properties = ["kw", "clause", "fromkw", "from"];
ImportTerm3426.create = function (kw3511, clause3512, fromkw3513, from3514) {
    return new ImportTerm3426(kw3511, clause3512, fromkw3513, from3514);
};
inherit3234(ModuleTimeTerm3424, ImportTerm3426, { isImportTerm: true });
function ImportForPhaseTerm3427(kw3515, clause3516, fromkw3517, from3518, forkw3519, macroskw3520, phase3521) {
    this.kw = kw3515;
    this.clause = clause3516;
    this.fromkw = fromkw3517;
    this.from = from3518;
    this.forkw = forkw3519;
    this.macroskw = macroskw3520;
    this.phase = phase3521;
}
ImportForPhaseTerm3427.properties = ["kw", "clause", "fromkw", "from", "forkw", "macroskw", "phase"];
ImportForPhaseTerm3427.create = function (kw3522, clause3523, fromkw3524, from3525, forkw3526, macroskw3527, phase3528) {
    return new ImportForPhaseTerm3427(kw3522, clause3523, fromkw3524, from3525, forkw3526, macroskw3527, phase3528);
};
inherit3234(ModuleTimeTerm3424, ImportForPhaseTerm3427, { isImportForPhaseTerm: true });
function NamedImportTerm3428(names3529) {
    this.names = names3529;
}
NamedImportTerm3428.properties = ["names"];
NamedImportTerm3428.create = function (names3530) {
    return new NamedImportTerm3428(names3530);
};
inherit3234(ModuleTimeTerm3424, NamedImportTerm3428, { isNamedImportTerm: true });
function DefaultImportTerm3429(name3531) {
    this.name = name3531;
}
DefaultImportTerm3429.properties = ["name"];
DefaultImportTerm3429.create = function (name3532) {
    return new DefaultImportTerm3429(name3532);
};
inherit3234(ModuleTimeTerm3424, DefaultImportTerm3429, { isDefaultImportTerm: true });
function NamespaceImportTerm3430(star3533, askw3534, name3535) {
    this.star = star3533;
    this.askw = askw3534;
    this.name = name3535;
}
NamespaceImportTerm3430.properties = ["star", "askw", "name"];
NamespaceImportTerm3430.create = function (star3536, askw3537, name3538) {
    return new NamespaceImportTerm3430(star3536, askw3537, name3538);
};
inherit3234(ModuleTimeTerm3424, NamespaceImportTerm3430, { isNamespaceImportTerm: true });
function BindingTerm3431(importName3539) {
    this.importName = importName3539;
}
BindingTerm3431.properties = ["importName"];
BindingTerm3431.create = function (importName3540) {
    return new BindingTerm3431(importName3540);
};
inherit3234(ModuleTimeTerm3424, BindingTerm3431, { isBindingTerm: true });
function QualifiedBindingTerm3432(importName3541, askw3542, localName3543) {
    this.importName = importName3541;
    this.askw = askw3542;
    this.localName = localName3543;
}
QualifiedBindingTerm3432.properties = ["importName", "askw", "localName"];
QualifiedBindingTerm3432.create = function (importName3544, askw3545, localName3546) {
    return new QualifiedBindingTerm3432(importName3544, askw3545, localName3546);
};
inherit3234(ModuleTimeTerm3424, QualifiedBindingTerm3432, { isQualifiedBindingTerm: true });
function ExportNameTerm3433(kw3547, name3548) {
    this.kw = kw3547;
    this.name = name3548;
}
ExportNameTerm3433.properties = ["kw", "name"];
ExportNameTerm3433.create = function (kw3549, name3550) {
    return new ExportNameTerm3433(kw3549, name3550);
};
inherit3234(ModuleTimeTerm3424, ExportNameTerm3433, { isExportNameTerm: true });
function ExportDefaultTerm3434(kw3551, defaultkw3552, decl3553) {
    this.kw = kw3551;
    this.defaultkw = defaultkw3552;
    this.decl = decl3553;
}
ExportDefaultTerm3434.properties = ["kw", "defaultkw", "decl"];
ExportDefaultTerm3434.create = function (kw3554, defaultkw3555, decl3556) {
    return new ExportDefaultTerm3434(kw3554, defaultkw3555, decl3556);
};
inherit3234(ModuleTimeTerm3424, ExportDefaultTerm3434, { isExportDefaultTerm: true });
function ExportDeclTerm3435(kw3557, decl3558) {
    this.kw = kw3557;
    this.decl = decl3558;
}
ExportDeclTerm3435.properties = ["kw", "decl"];
ExportDeclTerm3435.create = function (kw3559, decl3560) {
    return new ExportDeclTerm3435(kw3559, decl3560);
};
inherit3234(ModuleTimeTerm3424, ExportDeclTerm3435, { isExportDeclTerm: true });
function CompileTimeTerm3436() {}
CompileTimeTerm3436.properties = [];
CompileTimeTerm3436.create = function () {
    return new CompileTimeTerm3436();
};
inherit3234(TermTree3419, CompileTimeTerm3436, { isCompileTimeTerm: true });
function MacroTerm3437(name3561, body3562) {
    this.name = name3561;
    this.body = body3562;
}
MacroTerm3437.properties = ["name", "body"];
MacroTerm3437.create = function (name3563, body3564) {
    return new MacroTerm3437(name3563, body3564);
};
inherit3234(CompileTimeTerm3436, MacroTerm3437, { isMacroTerm: true });
function OperatorDefinitionTerm3438(type3565, name3566, prec3567, assoc3568, body3569) {
    this.type = type3565;
    this.name = name3566;
    this.prec = prec3567;
    this.assoc = assoc3568;
    this.body = body3569;
}
OperatorDefinitionTerm3438.properties = ["type", "name", "prec", "assoc", "body"];
OperatorDefinitionTerm3438.create = function (type3570, name3571, prec3572, assoc3573, body3574) {
    return new OperatorDefinitionTerm3438(type3570, name3571, prec3572, assoc3573, body3574);
};
inherit3234(CompileTimeTerm3436, OperatorDefinitionTerm3438, { isOperatorDefinitionTerm: true });
function ForPhaseTerm3439(phase3575, body3576) {
    this.phase = phase3575;
    this.body = body3576;
}
ForPhaseTerm3439.properties = ["phase", "body"];
ForPhaseTerm3439.create = function (phase3577, body3578) {
    return new ForPhaseTerm3439(phase3577, body3578);
};
inherit3234(CompileTimeTerm3436, ForPhaseTerm3439, { isForPhaseTerm: true });
function VariableDeclarationTerm3440(ident3579, eq3580, init3581, comma3582) {
    this.ident = ident3579;
    this.eq = eq3580;
    this.init = init3581;
    this.comma = comma3582;
}
VariableDeclarationTerm3440.properties = ["ident", "eq", "init", "comma"];
VariableDeclarationTerm3440.create = function (ident3583, eq3584, init3585, comma3586) {
    return new VariableDeclarationTerm3440(ident3583, eq3584, init3585, comma3586);
};
inherit3234(TermTree3419, VariableDeclarationTerm3440, { isVariableDeclarationTerm: true });
function StatementTerm3441() {}
StatementTerm3441.properties = [];
StatementTerm3441.create = function () {
    return new StatementTerm3441();
};
inherit3234(TermTree3419, StatementTerm3441, { isStatementTerm: true });
function EmptyTerm3442() {}
EmptyTerm3442.properties = [];
EmptyTerm3442.create = function () {
    return new EmptyTerm3442();
};
inherit3234(StatementTerm3441, EmptyTerm3442, { isEmptyTerm: true });
function CatchClauseTerm3443(keyword3587, params3588, body3589) {
    this.keyword = keyword3587;
    this.params = params3588;
    this.body = body3589;
}
CatchClauseTerm3443.properties = ["keyword", "params", "body"];
CatchClauseTerm3443.create = function (keyword3590, params3591, body3592) {
    return new CatchClauseTerm3443(keyword3590, params3591, body3592);
};
inherit3234(StatementTerm3441, CatchClauseTerm3443, { isCatchClauseTerm: true });
function ForStatementTerm3444(keyword3593, cond3594) {
    this.keyword = keyword3593;
    this.cond = cond3594;
}
ForStatementTerm3444.properties = ["keyword", "cond"];
ForStatementTerm3444.create = function (keyword3595, cond3596) {
    return new ForStatementTerm3444(keyword3595, cond3596);
};
inherit3234(StatementTerm3441, ForStatementTerm3444, { isForStatementTerm: true });
function ClassDeclarationTerm3445(keyword3597, name3598, body3599) {
    this.keyword = keyword3597;
    this.name = name3598;
    this.body = body3599;
}
ClassDeclarationTerm3445.properties = ["keyword", "name", "body"];
ClassDeclarationTerm3445.create = function (keyword3600, name3601, body3602) {
    return new ClassDeclarationTerm3445(keyword3600, name3601, body3602);
};
inherit3234(StatementTerm3441, ClassDeclarationTerm3445, { isClassDeclarationTerm: true });
function ReturnStatementTerm3446(keyword3603, expr3604) {
    this.keyword = keyword3603;
    this.expr = expr3604;
}
ReturnStatementTerm3446.properties = ["keyword", "expr"];
ReturnStatementTerm3446.create = function (keyword3605, expr3606) {
    return new ReturnStatementTerm3446(keyword3605, expr3606);
};
inherit3234(StatementTerm3441, ReturnStatementTerm3446, {
    isReturnStatementTerm: true,
    destruct: function (context3607, options3608) {
        var expr3609 = this.expr.destruct(context3607, options3608);
        // need to adjust the line numbers to make sure that the expr
        // starts on the same line as the return keyword. This might
        // not be the case if an operator or infix macro perturbed the
        // line numbers during expansion.
        expr3609 = adjustLineContext3231(expr3609, this.keyword.keyword);
        return this.keyword.destruct(context3607, options3608).concat(expr3609);
    }
});
function ExprTerm3447() {}
ExprTerm3447.properties = [];
ExprTerm3447.create = function () {
    return new ExprTerm3447();
};
inherit3234(StatementTerm3441, ExprTerm3447, { isExprTerm: true });
function UnaryOpTerm3448(op3610, expr3611) {
    this.op = op3610;
    this.expr = expr3611;
}
UnaryOpTerm3448.properties = ["op", "expr"];
UnaryOpTerm3448.create = function (op3612, expr3613) {
    return new UnaryOpTerm3448(op3612, expr3613);
};
inherit3234(ExprTerm3447, UnaryOpTerm3448, { isUnaryOpTerm: true });
function PostfixOpTerm3449(expr3614, op3615) {
    this.expr = expr3614;
    this.op = op3615;
}
PostfixOpTerm3449.properties = ["expr", "op"];
PostfixOpTerm3449.create = function (expr3616, op3617) {
    return new PostfixOpTerm3449(expr3616, op3617);
};
inherit3234(ExprTerm3447, PostfixOpTerm3449, { isPostfixOpTerm: true });
function BinOpTerm3450(left3618, op3619, right3620) {
    this.left = left3618;
    this.op = op3619;
    this.right = right3620;
}
BinOpTerm3450.properties = ["left", "op", "right"];
BinOpTerm3450.create = function (left3621, op3622, right3623) {
    return new BinOpTerm3450(left3621, op3622, right3623);
};
inherit3234(ExprTerm3447, BinOpTerm3450, { isBinOpTerm: true });
function AssignmentExpressionTerm3451(left3624, op3625, right3626) {
    this.left = left3624;
    this.op = op3625;
    this.right = right3626;
}
AssignmentExpressionTerm3451.properties = ["left", "op", "right"];
AssignmentExpressionTerm3451.create = function (left3627, op3628, right3629) {
    return new AssignmentExpressionTerm3451(left3627, op3628, right3629);
};
inherit3234(ExprTerm3447, AssignmentExpressionTerm3451, { isAssignmentExpressionTerm: true });
function ConditionalExpressionTerm3452(cond3630, question3631, tru3632, colon3633, fls3634) {
    this.cond = cond3630;
    this.question = question3631;
    this.tru = tru3632;
    this.colon = colon3633;
    this.fls = fls3634;
}
ConditionalExpressionTerm3452.properties = ["cond", "question", "tru", "colon", "fls"];
ConditionalExpressionTerm3452.create = function (cond3635, question3636, tru3637, colon3638, fls3639) {
    return new ConditionalExpressionTerm3452(cond3635, question3636, tru3637, colon3638, fls3639);
};
inherit3234(ExprTerm3447, ConditionalExpressionTerm3452, { isConditionalExpressionTerm: true });
function NamedFunTerm3453(keyword3640, star3641, name3642, params3643, body3644) {
    this.keyword = keyword3640;
    this.star = star3641;
    this.name = name3642;
    this.params = params3643;
    this.body = body3644;
}
NamedFunTerm3453.properties = ["keyword", "star", "name", "params", "body"];
NamedFunTerm3453.create = function (keyword3645, star3646, name3647, params3648, body3649) {
    return new NamedFunTerm3453(keyword3645, star3646, name3647, params3648, body3649);
};
inherit3234(ExprTerm3447, NamedFunTerm3453, { isNamedFunTerm: true });
function AnonFunTerm3454(keyword3650, star3651, params3652, body3653) {
    this.keyword = keyword3650;
    this.star = star3651;
    this.params = params3652;
    this.body = body3653;
}
AnonFunTerm3454.properties = ["keyword", "star", "params", "body"];
AnonFunTerm3454.create = function (keyword3654, star3655, params3656, body3657) {
    return new AnonFunTerm3454(keyword3654, star3655, params3656, body3657);
};
inherit3234(ExprTerm3447, AnonFunTerm3454, { isAnonFunTerm: true });
function ArrowFunTerm3455(params3658, arrow3659, body3660) {
    this.params = params3658;
    this.arrow = arrow3659;
    this.body = body3660;
}
ArrowFunTerm3455.properties = ["params", "arrow", "body"];
ArrowFunTerm3455.create = function (params3661, arrow3662, body3663) {
    return new ArrowFunTerm3455(params3661, arrow3662, body3663);
};
inherit3234(ExprTerm3447, ArrowFunTerm3455, { isArrowFunTerm: true });
function ObjDotGetTerm3456(left3664, dot3665, right3666) {
    this.left = left3664;
    this.dot = dot3665;
    this.right = right3666;
}
ObjDotGetTerm3456.properties = ["left", "dot", "right"];
ObjDotGetTerm3456.create = function (left3667, dot3668, right3669) {
    return new ObjDotGetTerm3456(left3667, dot3668, right3669);
};
inherit3234(ExprTerm3447, ObjDotGetTerm3456, { isObjDotGetTerm: true });
function ObjGetTerm3457(left3670, right3671) {
    this.left = left3670;
    this.right = right3671;
}
ObjGetTerm3457.properties = ["left", "right"];
ObjGetTerm3457.create = function (left3672, right3673) {
    return new ObjGetTerm3457(left3672, right3673);
};
inherit3234(ExprTerm3447, ObjGetTerm3457, { isObjGetTerm: true });
function TemplateTerm3458(template3674) {
    this.template = template3674;
}
TemplateTerm3458.properties = ["template"];
TemplateTerm3458.create = function (template3675) {
    return new TemplateTerm3458(template3675);
};
inherit3234(ExprTerm3447, TemplateTerm3458, { isTemplateTerm: true });
function CallTerm3459(fun3676, args3677) {
    this.fun = fun3676;
    this.args = args3677;
}
CallTerm3459.properties = ["fun", "args"];
CallTerm3459.create = function (fun3678, args3679) {
    return new CallTerm3459(fun3678, args3679);
};
inherit3234(ExprTerm3447, CallTerm3459, { isCallTerm: true });
function QuoteSyntaxTerm3460(stx3680) {
    this.stx = stx3680;
}
QuoteSyntaxTerm3460.properties = ["stx"];
QuoteSyntaxTerm3460.create = function (stx3681) {
    return new QuoteSyntaxTerm3460(stx3681);
};
inherit3234(ExprTerm3447, QuoteSyntaxTerm3460, {
    isQuoteSyntaxTerm: true,
    destruct: function (context3682, options3683) {
        var tempId3684 = fresh3232();
        context3682.templateMap.set(tempId3684, this.stx.token.inner);
        return [syn3228.makeIdent("getTemplate", this.stx), syn3228.makeDelim("()", [syn3228.makeValue(tempId3684, this.stx)], this.stx)];
    }
});
function StopQuotedTerm3461(name3685, body3686) {
    this.name = name3685;
    this.body = body3686;
}
StopQuotedTerm3461.properties = ["name", "body"];
StopQuotedTerm3461.create = function (name3687, body3688) {
    return new StopQuotedTerm3461(name3687, body3688);
};
inherit3234(ExprTerm3447, StopQuotedTerm3461, { isStopQuotedTerm: true });
function PrimaryExpressionTerm3462() {}
PrimaryExpressionTerm3462.properties = [];
PrimaryExpressionTerm3462.create = function () {
    return new PrimaryExpressionTerm3462();
};
inherit3234(ExprTerm3447, PrimaryExpressionTerm3462, { isPrimaryExpressionTerm: true });
function ThisExpressionTerm3463(keyword3689) {
    this.keyword = keyword3689;
}
ThisExpressionTerm3463.properties = ["keyword"];
ThisExpressionTerm3463.create = function (keyword3690) {
    return new ThisExpressionTerm3463(keyword3690);
};
inherit3234(PrimaryExpressionTerm3462, ThisExpressionTerm3463, { isThisExpressionTerm: true });
function LitTerm3464(lit3691) {
    this.lit = lit3691;
}
LitTerm3464.properties = ["lit"];
LitTerm3464.create = function (lit3692) {
    return new LitTerm3464(lit3692);
};
inherit3234(PrimaryExpressionTerm3462, LitTerm3464, { isLitTerm: true });
function BlockTerm3465(body3693) {
    this.body = body3693;
}
BlockTerm3465.properties = ["body"];
BlockTerm3465.create = function (body3694) {
    return new BlockTerm3465(body3694);
};
inherit3234(PrimaryExpressionTerm3462, BlockTerm3465, { isBlockTerm: true });
function ArrayLiteralTerm3466(array3695) {
    this.array = array3695;
}
ArrayLiteralTerm3466.properties = ["array"];
ArrayLiteralTerm3466.create = function (array3696) {
    return new ArrayLiteralTerm3466(array3696);
};
inherit3234(PrimaryExpressionTerm3462, ArrayLiteralTerm3466, { isArrayLiteralTerm: true });
function IdTerm3467(id3697) {
    this.id = id3697;
}
IdTerm3467.properties = ["id"];
IdTerm3467.create = function (id3698) {
    return new IdTerm3467(id3698);
};
inherit3234(PrimaryExpressionTerm3462, IdTerm3467, { isIdTerm: true });
function PartialTerm3468() {}
PartialTerm3468.properties = [];
PartialTerm3468.create = function () {
    return new PartialTerm3468();
};
inherit3234(TermTree3419, PartialTerm3468, { isPartialTerm: true });
function PartialOperationTerm3469(stx3699, left3700) {
    this.stx = stx3699;
    this.left = left3700;
}
PartialOperationTerm3469.properties = ["stx", "left"];
PartialOperationTerm3469.create = function (stx3701, left3702) {
    return new PartialOperationTerm3469(stx3701, left3702);
};
inherit3234(PartialTerm3468, PartialOperationTerm3469, { isPartialOperationTerm: true });
function PartialExpressionTerm3470(stx3703, left3704, combine3705) {
    this.stx = stx3703;
    this.left = left3704;
    this.combine = combine3705;
}
PartialExpressionTerm3470.properties = ["stx", "left", "combine"];
PartialExpressionTerm3470.create = function (stx3706, left3707, combine3708) {
    return new PartialExpressionTerm3470(stx3706, left3707, combine3708);
};
inherit3234(PartialTerm3468, PartialExpressionTerm3470, { isPartialExpressionTerm: true });
function BindingStatementTerm3471(keyword3709, decls3710) {
    this.keyword = keyword3709;
    this.decls = decls3710;
}
BindingStatementTerm3471.properties = ["keyword", "decls"];
BindingStatementTerm3471.create = function (keyword3711, decls3712) {
    return new BindingStatementTerm3471(keyword3711, decls3712);
};
inherit3234(StatementTerm3441, BindingStatementTerm3471, {
    isBindingStatementTerm: true,
    destruct: function (context3713, options3714) {
        return this.keyword.destruct(context3713, options3714).concat(_3227.reduce(this.decls, function (acc3715, decl3716) {
            push3233.apply(acc3715, decl3716.destruct(context3713, options3714));
            return acc3715;
        }, []));
    }
});
function VariableStatementTerm3472(keyword3717, decls3718) {
    this.keyword = keyword3717;
    this.decls = decls3718;
}
VariableStatementTerm3472.properties = ["keyword", "decls"];
VariableStatementTerm3472.create = function (keyword3719, decls3720) {
    return new VariableStatementTerm3472(keyword3719, decls3720);
};
inherit3234(BindingStatementTerm3471, VariableStatementTerm3472, { isVariableStatementTerm: true });
function LetStatementTerm3473(keyword3721, decls3722) {
    this.keyword = keyword3721;
    this.decls = decls3722;
}
LetStatementTerm3473.properties = ["keyword", "decls"];
LetStatementTerm3473.create = function (keyword3723, decls3724) {
    return new LetStatementTerm3473(keyword3723, decls3724);
};
inherit3234(BindingStatementTerm3471, LetStatementTerm3473, { isLetStatementTerm: true });
function ConstStatementTerm3474(keyword3725, decls3726) {
    this.keyword = keyword3725;
    this.decls = decls3726;
}
ConstStatementTerm3474.properties = ["keyword", "decls"];
ConstStatementTerm3474.create = function (keyword3727, decls3728) {
    return new ConstStatementTerm3474(keyword3727, decls3728);
};
inherit3234(BindingStatementTerm3471, ConstStatementTerm3474, { isConstStatementTerm: true });
function ParenExpressionTerm3475(args3729, delim3730, commas3731) {
    this.args = args3729;
    this.delim = delim3730;
    this.commas = commas3731;
}
ParenExpressionTerm3475.properties = ["args", "delim", "commas"];
ParenExpressionTerm3475.create = function (args3732, delim3733, commas3734) {
    return new ParenExpressionTerm3475(args3732, delim3733, commas3734);
};
inherit3234(PrimaryExpressionTerm3462, ParenExpressionTerm3475, {
    isParenExpressionTerm: true,
    destruct: function (context3735, options3736) {
        var commas3737 = this.commas.slice();
        var src3738 = this.delim.token;
        var keys3739 = Object.keys(src3738);
        var newtok3740 = {};
        for (var i3741 = 0, len3742 = keys3739.length, key3743; i3741 < len3742; i3741++) {
            key3743 = keys3739[i3741];
            newtok3740[key3743] = src3738[key3743];
        }
        var delim3744 = syntaxFromToken3230(newtok3740, this.delim);
        delim3744.token.inner = _3227.reduce(this.args, function (acc3745, term3746) {
            assert3229(term3746 && term3746.isTermTree, "expecting term trees in destruct of ParenExpression");
            push3233.apply(acc3745, term3746.destruct(context3735, options3736));
            if ( // add all commas except for the last one
            commas3737.length > 0) {
                acc3745.push(commas3737.shift());
            }
            return acc3745;
        }, []);
        return DelimiterTerm3423.create(delim3744).destruct(context3735, options3736);
    }
});
module.exports = {
    TermTree: TermTree3419,
    EOFTerm: EOFTerm3420,
    KeywordTerm: KeywordTerm3421,
    PuncTerm: PuncTerm3422,
    DelimiterTerm: DelimiterTerm3423,
    ModuleTimeTerm: ModuleTimeTerm3424,
    ModuleTerm: ModuleTerm3425,
    ImportTerm: ImportTerm3426,
    ImportForPhaseTerm: ImportForPhaseTerm3427,
    NamedImportTerm: NamedImportTerm3428,
    NamespaceImportTerm: NamespaceImportTerm3430,
    DefaultImportTerm: DefaultImportTerm3429,
    BindingTerm: BindingTerm3431,
    QualifiedBindingTerm: QualifiedBindingTerm3432,
    ExportNameTerm: ExportNameTerm3433,
    ExportDefaultTerm: ExportDefaultTerm3434,
    ExportDeclTerm: ExportDeclTerm3435,
    CompileTimeTerm: CompileTimeTerm3436,
    MacroTerm: MacroTerm3437,
    OperatorDefinitionTerm: OperatorDefinitionTerm3438,
    ForPhaseTerm: ForPhaseTerm3439,
    VariableDeclarationTerm: VariableDeclarationTerm3440,
    StatementTerm: StatementTerm3441,
    EmptyTerm: EmptyTerm3442,
    CatchClauseTerm: CatchClauseTerm3443,
    ForStatementTerm: ForStatementTerm3444,
    ReturnStatementTerm: ReturnStatementTerm3446,
    ExprTerm: ExprTerm3447,
    UnaryOpTerm: UnaryOpTerm3448,
    PostfixOpTerm: PostfixOpTerm3449,
    BinOpTerm: BinOpTerm3450,
    AssignmentExpressionTerm: AssignmentExpressionTerm3451,
    ConditionalExpressionTerm: ConditionalExpressionTerm3452,
    NamedFunTerm: NamedFunTerm3453,
    AnonFunTerm: AnonFunTerm3454,
    ArrowFunTerm: ArrowFunTerm3455,
    ObjDotGetTerm: ObjDotGetTerm3456,
    ObjGetTerm: ObjGetTerm3457,
    TemplateTerm: TemplateTerm3458,
    CallTerm: CallTerm3459,
    QuoteSyntaxTerm: QuoteSyntaxTerm3460,
    StopQuotedTerm: StopQuotedTerm3461,
    PrimaryExpressionTerm: PrimaryExpressionTerm3462,
    ThisExpressionTerm: ThisExpressionTerm3463,
    LitTerm: LitTerm3464,
    BlockTerm: BlockTerm3465,
    ArrayLiteralTerm: ArrayLiteralTerm3466,
    IdTerm: IdTerm3467,
    PartialTerm: PartialTerm3468,
    PartialOperationTerm: PartialOperationTerm3469,
    PartialExpressionTerm: PartialExpressionTerm3470,
    BindingStatementTerm: BindingStatementTerm3471,
    VariableStatementTerm: VariableStatementTerm3472,
    LetStatementTerm: LetStatementTerm3473,
    ClassDeclarationTerm: ClassDeclarationTerm3445,
    ConstStatementTerm: ConstStatementTerm3474,
    ParenExpressionTerm: ParenExpressionTerm3475
};
//# sourceMappingURL=termTree.js.map