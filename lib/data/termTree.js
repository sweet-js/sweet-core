"use strict";

var _3039 = require("underscore"),
    syn3040 = require("../syntax"),
    assert3041 = require("assert");
var syntaxFromToken3042 = syn3040.syntaxFromToken,
    adjustLineContext3043 = syn3040.adjustLineContext,
    fresh3044 = syn3040.fresh;
var push3045 = Array.prototype.push;
function inherit3046(parent3286, child3287, methods3288) {
    var P3289 = function P3289() {};
    P3289.prototype = parent3286.prototype;
    child3287.prototype = new P3289();
    child3287.prototype.constructor = child3287;
    _3039.extend(child3287.prototype, methods3288);
}
function TermTree3228() {}
TermTree3228.properties = [];
TermTree3228.create = function () {
    return new TermTree3228();
};
TermTree3228.prototype = {
    isTermTree: true,
    destruct: function (context3290, options3291) {
        assert3041(context3290, "must pass in the context to destruct");
        options3291 = options3291 || {};
        var self3292 = this;
        if (options3291.stripCompileTerm && this.isCompileTimeTerm) {
            return [];
        }
        if (options3291.stripModuleTerm && this.isModuleTimeTerm) {
            return [];
        }
        return _3039.reduce(this.constructor.properties, function (acc3293, prop3294) {
            if (self3292[prop3294] && self3292[prop3294].isTermTree) {
                push3045.apply(acc3293, self3292[prop3294].destruct(context3290, options3291));
                return acc3293;
            } else if (self3292[prop3294] && self3292[prop3294].token && self3292[prop3294].token.inner) {
                var src3295 = self3292[prop3294].token;
                var keys3296 = Object.keys(src3295);
                var newtok3297 = {};
                for (var i3298 = 0, len3299 = keys3296.length, key3300; i3298 < len3299; i3298++) {
                    key3300 = keys3296[i3298];
                    newtok3297[key3300] = src3295[key3300];
                }
                var clone3301 = syntaxFromToken3042(newtok3297, self3292[prop3294]);
                clone3301.token.inner = _3039.reduce(clone3301.token.inner, function (acc3302, t3303) {
                    if (t3303 && t3303.isTermTree) {
                        push3045.apply(acc3302, t3303.destruct(context3290, options3291));
                        return acc3302;
                    }
                    acc3302.push(t3303);
                    return acc3302;
                }, []);
                acc3293.push(clone3301);
                return acc3293;
            } else if (Array.isArray(self3292[prop3294])) {
                var destArr3304 = _3039.reduce(self3292[prop3294], function (acc3305, t3306) {
                    if (t3306 && t3306.isTermTree) {
                        push3045.apply(acc3305, t3306.destruct(context3290, options3291));
                        return acc3305;
                    }
                    acc3305.push(t3306);
                    return acc3305;
                }, []);
                push3045.apply(acc3293, destArr3304);
                return acc3293;
            } else if (self3292[prop3294]) {
                acc3293.push(self3292[prop3294]);
                return acc3293;
            } else {
                return acc3293;
            }
        }, []);
    },
    addDefCtx: function (def3307) {
        var self3308 = this;
        _3039.each(this.constructor.properties, function (prop3309) {
            if (Array.isArray(self3308[prop3309])) {
                self3308[prop3309] = _3039.map(self3308[prop3309], function (item3310) {
                    return item3310.addDefCtx(def3307);
                });
            } else if (self3308[prop3309]) {
                self3308[prop3309] = self3308[prop3309].addDefCtx(def3307);
            }
        });
        return this;
    },
    rename: function (id3311, name3312, phase3313) {
        var self3314 = this;
        _3039.each(this.constructor.properties, function (prop3315) {
            if (Array.isArray(self3314[prop3315])) {
                self3314[prop3315] = _3039.map(self3314[prop3315], function (item3316) {
                    return item3316.rename(id3311, name3312, phase3313);
                });
            } else if (self3314[prop3315]) {
                self3314[prop3315] = self3314[prop3315].rename(id3311, name3312, phase3313);
            }
        });
        return this;
    },
    imported: function (id3317, name3318, phase3319, mod3320) {
        var self3321 = this;
        _3039.each(this.constructor.properties, function (prop3322) {
            if (Array.isArray(self3321[prop3322])) {
                self3321[prop3322] = _3039.map(self3321[prop3322], function (item3323) {
                    return item3323.imported(id3317, name3318, phase3319, mod3320);
                });
            } else if (self3321[prop3322]) {
                self3321[prop3322] = self3321[prop3322].imported(id3317, name3318, phase3319, mod3320);
            }
        });
        return this;
    }
};
function EOFTerm3229(eof3324) {
    this.eof = eof3324;
}
EOFTerm3229.properties = ["eof"];
EOFTerm3229.create = function (eof3325) {
    return new EOFTerm3229(eof3325);
};
inherit3046(TermTree3228, EOFTerm3229, { isEOFTerm: true });
function KeywordTerm3230(keyword3326) {
    this.keyword = keyword3326;
}
KeywordTerm3230.properties = ["keyword"];
KeywordTerm3230.create = function (keyword3327) {
    return new KeywordTerm3230(keyword3327);
};
inherit3046(TermTree3228, KeywordTerm3230, { isKeywordTerm: true });
function PuncTerm3231(punc3328) {
    this.punc = punc3328;
}
PuncTerm3231.properties = ["punc"];
PuncTerm3231.create = function (punc3329) {
    return new PuncTerm3231(punc3329);
};
inherit3046(TermTree3228, PuncTerm3231, { isPuncTerm: true });
function DelimiterTerm3232(delim3330) {
    this.delim = delim3330;
}
DelimiterTerm3232.properties = ["delim"];
DelimiterTerm3232.create = function (delim3331) {
    return new DelimiterTerm3232(delim3331);
};
inherit3046(TermTree3228, DelimiterTerm3232, { isDelimiterTerm: true });
function ModuleTimeTerm3233() {}
ModuleTimeTerm3233.properties = [];
ModuleTimeTerm3233.create = function () {
    return new ModuleTimeTerm3233();
};
inherit3046(TermTree3228, ModuleTimeTerm3233, { isModuleTimeTerm: true });
function ModuleTerm3234(body3332) {
    this.body = body3332;
}
ModuleTerm3234.properties = ["body"];
ModuleTerm3234.create = function (body3333) {
    return new ModuleTerm3234(body3333);
};
inherit3046(ModuleTimeTerm3233, ModuleTerm3234, { isModuleTerm: true });
function ImportTerm3235(kw3334, clause3335, fromkw3336, from3337) {
    this.kw = kw3334;
    this.clause = clause3335;
    this.fromkw = fromkw3336;
    this.from = from3337;
}
ImportTerm3235.properties = ["kw", "clause", "fromkw", "from"];
ImportTerm3235.create = function (kw3338, clause3339, fromkw3340, from3341) {
    return new ImportTerm3235(kw3338, clause3339, fromkw3340, from3341);
};
inherit3046(ModuleTimeTerm3233, ImportTerm3235, { isImportTerm: true });
function ImportForMacrosTerm3236(kw3342, clause3343, fromkw3344, from3345, forkw3346, macroskw3347) {
    this.kw = kw3342;
    this.clause = clause3343;
    this.fromkw = fromkw3344;
    this.from = from3345;
    this.forkw = forkw3346;
    this.macroskw = macroskw3347;
}
ImportForMacrosTerm3236.properties = ["kw", "clause", "fromkw", "from", "forkw", "macroskw"];
ImportForMacrosTerm3236.create = function (kw3348, clause3349, fromkw3350, from3351, forkw3352, macroskw3353) {
    return new ImportForMacrosTerm3236(kw3348, clause3349, fromkw3350, from3351, forkw3352, macroskw3353);
};
inherit3046(ModuleTimeTerm3233, ImportForMacrosTerm3236, { isImportForMacrosTerm: true });
function NamedImportTerm3237(names3354) {
    this.names = names3354;
}
NamedImportTerm3237.properties = ["names"];
NamedImportTerm3237.create = function (names3355) {
    return new NamedImportTerm3237(names3355);
};
inherit3046(ModuleTimeTerm3233, NamedImportTerm3237, { isNamedImportTerm: true });
function DefaultImportTerm3238(name3356) {
    this.name = name3356;
}
DefaultImportTerm3238.properties = ["name"];
DefaultImportTerm3238.create = function (name3357) {
    return new DefaultImportTerm3238(name3357);
};
inherit3046(ModuleTimeTerm3233, DefaultImportTerm3238, { isDefaultImportTerm: true });
function NamespaceImportTerm3239(star3358, askw3359, name3360) {
    this.star = star3358;
    this.askw = askw3359;
    this.name = name3360;
}
NamespaceImportTerm3239.properties = ["star", "askw", "name"];
NamespaceImportTerm3239.create = function (star3361, askw3362, name3363) {
    return new NamespaceImportTerm3239(star3361, askw3362, name3363);
};
inherit3046(ModuleTimeTerm3233, NamespaceImportTerm3239, { isNamespaceImportTerm: true });
function BindingTerm3240(importName3364) {
    this.importName = importName3364;
}
BindingTerm3240.properties = ["importName"];
BindingTerm3240.create = function (importName3365) {
    return new BindingTerm3240(importName3365);
};
inherit3046(ModuleTimeTerm3233, BindingTerm3240, { isBindingTerm: true });
function QualifiedBindingTerm3241(importName3366, askw3367, localName3368) {
    this.importName = importName3366;
    this.askw = askw3367;
    this.localName = localName3368;
}
QualifiedBindingTerm3241.properties = ["importName", "askw", "localName"];
QualifiedBindingTerm3241.create = function (importName3369, askw3370, localName3371) {
    return new QualifiedBindingTerm3241(importName3369, askw3370, localName3371);
};
inherit3046(ModuleTimeTerm3233, QualifiedBindingTerm3241, { isQualifiedBindingTerm: true });
function ExportNameTerm3242(kw3372, name3373) {
    this.kw = kw3372;
    this.name = name3373;
}
ExportNameTerm3242.properties = ["kw", "name"];
ExportNameTerm3242.create = function (kw3374, name3375) {
    return new ExportNameTerm3242(kw3374, name3375);
};
inherit3046(ModuleTimeTerm3233, ExportNameTerm3242, { isExportNameTerm: true });
function ExportDefaultTerm3243(kw3376, defaultkw3377, decl3378) {
    this.kw = kw3376;
    this.defaultkw = defaultkw3377;
    this.decl = decl3378;
}
ExportDefaultTerm3243.properties = ["kw", "defaultkw", "decl"];
ExportDefaultTerm3243.create = function (kw3379, defaultkw3380, decl3381) {
    return new ExportDefaultTerm3243(kw3379, defaultkw3380, decl3381);
};
inherit3046(ModuleTimeTerm3233, ExportDefaultTerm3243, { isExportDefaultTerm: true });
function ExportDeclTerm3244(kw3382, decl3383) {
    this.kw = kw3382;
    this.decl = decl3383;
}
ExportDeclTerm3244.properties = ["kw", "decl"];
ExportDeclTerm3244.create = function (kw3384, decl3385) {
    return new ExportDeclTerm3244(kw3384, decl3385);
};
inherit3046(ModuleTimeTerm3233, ExportDeclTerm3244, { isExportDeclTerm: true });
function CompileTimeTerm3245() {}
CompileTimeTerm3245.properties = [];
CompileTimeTerm3245.create = function () {
    return new CompileTimeTerm3245();
};
inherit3046(TermTree3228, CompileTimeTerm3245, { isCompileTimeTerm: true });
function LetMacroTerm3246(name3386, body3387) {
    this.name = name3386;
    this.body = body3387;
}
LetMacroTerm3246.properties = ["name", "body"];
LetMacroTerm3246.create = function (name3388, body3389) {
    return new LetMacroTerm3246(name3388, body3389);
};
inherit3046(CompileTimeTerm3245, LetMacroTerm3246, { isLetMacroTerm: true });
function MacroTerm3247(name3390, body3391) {
    this.name = name3390;
    this.body = body3391;
}
MacroTerm3247.properties = ["name", "body"];
MacroTerm3247.create = function (name3392, body3393) {
    return new MacroTerm3247(name3392, body3393);
};
inherit3046(CompileTimeTerm3245, MacroTerm3247, { isMacroTerm: true });
function AnonMacroTerm3248(body3394) {
    this.body = body3394;
}
AnonMacroTerm3248.properties = ["body"];
AnonMacroTerm3248.create = function (body3395) {
    return new AnonMacroTerm3248(body3395);
};
inherit3046(CompileTimeTerm3245, AnonMacroTerm3248, { isAnonMacroTerm: true });
function OperatorDefinitionTerm3249(type3396, name3397, prec3398, assoc3399, body3400) {
    this.type = type3396;
    this.name = name3397;
    this.prec = prec3398;
    this.assoc = assoc3399;
    this.body = body3400;
}
OperatorDefinitionTerm3249.properties = ["type", "name", "prec", "assoc", "body"];
OperatorDefinitionTerm3249.create = function (type3401, name3402, prec3403, assoc3404, body3405) {
    return new OperatorDefinitionTerm3249(type3401, name3402, prec3403, assoc3404, body3405);
};
inherit3046(CompileTimeTerm3245, OperatorDefinitionTerm3249, { isOperatorDefinitionTerm: true });
function VariableDeclarationTerm3250(ident3406, eq3407, init3408, comma3409) {
    this.ident = ident3406;
    this.eq = eq3407;
    this.init = init3408;
    this.comma = comma3409;
}
VariableDeclarationTerm3250.properties = ["ident", "eq", "init", "comma"];
VariableDeclarationTerm3250.create = function (ident3410, eq3411, init3412, comma3413) {
    return new VariableDeclarationTerm3250(ident3410, eq3411, init3412, comma3413);
};
inherit3046(TermTree3228, VariableDeclarationTerm3250, { isVariableDeclarationTerm: true });
function StatementTerm3251() {}
StatementTerm3251.properties = [];
StatementTerm3251.create = function () {
    return new StatementTerm3251();
};
inherit3046(TermTree3228, StatementTerm3251, { isStatementTerm: true });
function EmptyTerm3252() {}
EmptyTerm3252.properties = [];
EmptyTerm3252.create = function () {
    return new EmptyTerm3252();
};
inherit3046(StatementTerm3251, EmptyTerm3252, { isEmptyTerm: true });
function CatchClauseTerm3253(keyword3414, params3415, body3416) {
    this.keyword = keyword3414;
    this.params = params3415;
    this.body = body3416;
}
CatchClauseTerm3253.properties = ["keyword", "params", "body"];
CatchClauseTerm3253.create = function (keyword3417, params3418, body3419) {
    return new CatchClauseTerm3253(keyword3417, params3418, body3419);
};
inherit3046(StatementTerm3251, CatchClauseTerm3253, { isCatchClauseTerm: true });
function ForStatementTerm3254(keyword3420, cond3421) {
    this.keyword = keyword3420;
    this.cond = cond3421;
}
ForStatementTerm3254.properties = ["keyword", "cond"];
ForStatementTerm3254.create = function (keyword3422, cond3423) {
    return new ForStatementTerm3254(keyword3422, cond3423);
};
inherit3046(StatementTerm3251, ForStatementTerm3254, { isForStatementTerm: true });
function ClassDeclarationTerm3255(keyword3424, name3425, body3426) {
    this.keyword = keyword3424;
    this.name = name3425;
    this.body = body3426;
}
ClassDeclarationTerm3255.properties = ["keyword", "name", "body"];
ClassDeclarationTerm3255.create = function (keyword3427, name3428, body3429) {
    return new ClassDeclarationTerm3255(keyword3427, name3428, body3429);
};
inherit3046(StatementTerm3251, ClassDeclarationTerm3255, { isClassDeclarationTerm: true });
function ReturnStatementTerm3256(keyword3430, expr3431) {
    this.keyword = keyword3430;
    this.expr = expr3431;
}
ReturnStatementTerm3256.properties = ["keyword", "expr"];
ReturnStatementTerm3256.create = function (keyword3432, expr3433) {
    return new ReturnStatementTerm3256(keyword3432, expr3433);
};
inherit3046(StatementTerm3251, ReturnStatementTerm3256, {
    isReturnStatementTerm: true,
    destruct: function (context3434, options3435) {
        var expr3436 = this.expr.destruct(context3434, options3435);
        // need to adjust the line numbers to make sure that the expr
        // starts on the same line as the return keyword. This might
        // not be the case if an operator or infix macro perturbed the
        // line numbers during expansion.
        expr3436 = adjustLineContext3043(expr3436, this.keyword.keyword);
        return this.keyword.destruct(context3434, options3435).concat(expr3436);
    }
});
function ExprTerm3257() {}
ExprTerm3257.properties = [];
ExprTerm3257.create = function () {
    return new ExprTerm3257();
};
inherit3046(StatementTerm3251, ExprTerm3257, { isExprTerm: true });
function UnaryOpTerm3258(op3437, expr3438) {
    this.op = op3437;
    this.expr = expr3438;
}
UnaryOpTerm3258.properties = ["op", "expr"];
UnaryOpTerm3258.create = function (op3439, expr3440) {
    return new UnaryOpTerm3258(op3439, expr3440);
};
inherit3046(ExprTerm3257, UnaryOpTerm3258, { isUnaryOpTerm: true });
function PostfixOpTerm3259(expr3441, op3442) {
    this.expr = expr3441;
    this.op = op3442;
}
PostfixOpTerm3259.properties = ["expr", "op"];
PostfixOpTerm3259.create = function (expr3443, op3444) {
    return new PostfixOpTerm3259(expr3443, op3444);
};
inherit3046(ExprTerm3257, PostfixOpTerm3259, { isPostfixOpTerm: true });
function BinOpTerm3260(left3445, op3446, right3447) {
    this.left = left3445;
    this.op = op3446;
    this.right = right3447;
}
BinOpTerm3260.properties = ["left", "op", "right"];
BinOpTerm3260.create = function (left3448, op3449, right3450) {
    return new BinOpTerm3260(left3448, op3449, right3450);
};
inherit3046(ExprTerm3257, BinOpTerm3260, { isBinOpTerm: true });
function AssignmentExpressionTerm3261(left3451, op3452, right3453) {
    this.left = left3451;
    this.op = op3452;
    this.right = right3453;
}
AssignmentExpressionTerm3261.properties = ["left", "op", "right"];
AssignmentExpressionTerm3261.create = function (left3454, op3455, right3456) {
    return new AssignmentExpressionTerm3261(left3454, op3455, right3456);
};
inherit3046(ExprTerm3257, AssignmentExpressionTerm3261, { isAssignmentExpressionTerm: true });
function ConditionalExpressionTerm3262(cond3457, question3458, tru3459, colon3460, fls3461) {
    this.cond = cond3457;
    this.question = question3458;
    this.tru = tru3459;
    this.colon = colon3460;
    this.fls = fls3461;
}
ConditionalExpressionTerm3262.properties = ["cond", "question", "tru", "colon", "fls"];
ConditionalExpressionTerm3262.create = function (cond3462, question3463, tru3464, colon3465, fls3466) {
    return new ConditionalExpressionTerm3262(cond3462, question3463, tru3464, colon3465, fls3466);
};
inherit3046(ExprTerm3257, ConditionalExpressionTerm3262, { isConditionalExpressionTerm: true });
function NamedFunTerm3263(keyword3467, star3468, name3469, params3470, body3471) {
    this.keyword = keyword3467;
    this.star = star3468;
    this.name = name3469;
    this.params = params3470;
    this.body = body3471;
}
NamedFunTerm3263.properties = ["keyword", "star", "name", "params", "body"];
NamedFunTerm3263.create = function (keyword3472, star3473, name3474, params3475, body3476) {
    return new NamedFunTerm3263(keyword3472, star3473, name3474, params3475, body3476);
};
inherit3046(ExprTerm3257, NamedFunTerm3263, { isNamedFunTerm: true });
function AnonFunTerm3264(keyword3477, star3478, params3479, body3480) {
    this.keyword = keyword3477;
    this.star = star3478;
    this.params = params3479;
    this.body = body3480;
}
AnonFunTerm3264.properties = ["keyword", "star", "params", "body"];
AnonFunTerm3264.create = function (keyword3481, star3482, params3483, body3484) {
    return new AnonFunTerm3264(keyword3481, star3482, params3483, body3484);
};
inherit3046(ExprTerm3257, AnonFunTerm3264, { isAnonFunTerm: true });
function ArrowFunTerm3265(params3485, arrow3486, body3487) {
    this.params = params3485;
    this.arrow = arrow3486;
    this.body = body3487;
}
ArrowFunTerm3265.properties = ["params", "arrow", "body"];
ArrowFunTerm3265.create = function (params3488, arrow3489, body3490) {
    return new ArrowFunTerm3265(params3488, arrow3489, body3490);
};
inherit3046(ExprTerm3257, ArrowFunTerm3265, { isArrowFunTerm: true });
function ObjDotGetTerm3266(left3491, dot3492, right3493) {
    this.left = left3491;
    this.dot = dot3492;
    this.right = right3493;
}
ObjDotGetTerm3266.properties = ["left", "dot", "right"];
ObjDotGetTerm3266.create = function (left3494, dot3495, right3496) {
    return new ObjDotGetTerm3266(left3494, dot3495, right3496);
};
inherit3046(ExprTerm3257, ObjDotGetTerm3266, { isObjDotGetTerm: true });
function ObjGetTerm3267(left3497, right3498) {
    this.left = left3497;
    this.right = right3498;
}
ObjGetTerm3267.properties = ["left", "right"];
ObjGetTerm3267.create = function (left3499, right3500) {
    return new ObjGetTerm3267(left3499, right3500);
};
inherit3046(ExprTerm3257, ObjGetTerm3267, { isObjGetTerm: true });
function TemplateTerm3268(template3501) {
    this.template = template3501;
}
TemplateTerm3268.properties = ["template"];
TemplateTerm3268.create = function (template3502) {
    return new TemplateTerm3268(template3502);
};
inherit3046(ExprTerm3257, TemplateTerm3268, { isTemplateTerm: true });
function CallTerm3269(fun3503, args3504) {
    this.fun = fun3503;
    this.args = args3504;
}
CallTerm3269.properties = ["fun", "args"];
CallTerm3269.create = function (fun3505, args3506) {
    return new CallTerm3269(fun3505, args3506);
};
inherit3046(ExprTerm3257, CallTerm3269, { isCallTerm: true });
function QuoteSyntaxTerm3270(stx3507) {
    this.stx = stx3507;
}
QuoteSyntaxTerm3270.properties = ["stx"];
QuoteSyntaxTerm3270.create = function (stx3508) {
    return new QuoteSyntaxTerm3270(stx3508);
};
inherit3046(ExprTerm3257, QuoteSyntaxTerm3270, {
    isQuoteSyntaxTerm: true,
    destruct: function (context3509, options3510) {
        var tempId3511 = fresh3044();
        context3509.templateMap.set(tempId3511, this.stx.token.inner);
        return [syn3040.makeIdent("getTemplate", this.stx), syn3040.makeDelim("()", [syn3040.makeValue(tempId3511, this.stx)], this.stx)];
    }
});
function StopQuotedTerm3271(name3512, body3513) {
    this.name = name3512;
    this.body = body3513;
}
StopQuotedTerm3271.properties = ["name", "body"];
StopQuotedTerm3271.create = function (name3514, body3515) {
    return new StopQuotedTerm3271(name3514, body3515);
};
inherit3046(ExprTerm3257, StopQuotedTerm3271, { isStopQuotedTerm: true });
function PrimaryExpressionTerm3272() {}
PrimaryExpressionTerm3272.properties = [];
PrimaryExpressionTerm3272.create = function () {
    return new PrimaryExpressionTerm3272();
};
inherit3046(ExprTerm3257, PrimaryExpressionTerm3272, { isPrimaryExpressionTerm: true });
function ThisExpressionTerm3273(keyword3516) {
    this.keyword = keyword3516;
}
ThisExpressionTerm3273.properties = ["keyword"];
ThisExpressionTerm3273.create = function (keyword3517) {
    return new ThisExpressionTerm3273(keyword3517);
};
inherit3046(PrimaryExpressionTerm3272, ThisExpressionTerm3273, { isThisExpressionTerm: true });
function LitTerm3274(lit3518) {
    this.lit = lit3518;
}
LitTerm3274.properties = ["lit"];
LitTerm3274.create = function (lit3519) {
    return new LitTerm3274(lit3519);
};
inherit3046(PrimaryExpressionTerm3272, LitTerm3274, { isLitTerm: true });
function BlockTerm3275(body3520) {
    this.body = body3520;
}
BlockTerm3275.properties = ["body"];
BlockTerm3275.create = function (body3521) {
    return new BlockTerm3275(body3521);
};
inherit3046(PrimaryExpressionTerm3272, BlockTerm3275, { isBlockTerm: true });
function ArrayLiteralTerm3276(array3522) {
    this.array = array3522;
}
ArrayLiteralTerm3276.properties = ["array"];
ArrayLiteralTerm3276.create = function (array3523) {
    return new ArrayLiteralTerm3276(array3523);
};
inherit3046(PrimaryExpressionTerm3272, ArrayLiteralTerm3276, { isArrayLiteralTerm: true });
function IdTerm3277(id3524) {
    this.id = id3524;
}
IdTerm3277.properties = ["id"];
IdTerm3277.create = function (id3525) {
    return new IdTerm3277(id3525);
};
inherit3046(PrimaryExpressionTerm3272, IdTerm3277, { isIdTerm: true });
function PartialTerm3278() {}
PartialTerm3278.properties = [];
PartialTerm3278.create = function () {
    return new PartialTerm3278();
};
inherit3046(TermTree3228, PartialTerm3278, { isPartialTerm: true });
function PartialOperationTerm3279(stx3526, left3527) {
    this.stx = stx3526;
    this.left = left3527;
}
PartialOperationTerm3279.properties = ["stx", "left"];
PartialOperationTerm3279.create = function (stx3528, left3529) {
    return new PartialOperationTerm3279(stx3528, left3529);
};
inherit3046(PartialTerm3278, PartialOperationTerm3279, { isPartialOperationTerm: true });
function PartialExpressionTerm3280(stx3530, left3531, combine3532) {
    this.stx = stx3530;
    this.left = left3531;
    this.combine = combine3532;
}
PartialExpressionTerm3280.properties = ["stx", "left", "combine"];
PartialExpressionTerm3280.create = function (stx3533, left3534, combine3535) {
    return new PartialExpressionTerm3280(stx3533, left3534, combine3535);
};
inherit3046(PartialTerm3278, PartialExpressionTerm3280, { isPartialExpressionTerm: true });
function BindingStatementTerm3281(keyword3536, decls3537) {
    this.keyword = keyword3536;
    this.decls = decls3537;
}
BindingStatementTerm3281.properties = ["keyword", "decls"];
BindingStatementTerm3281.create = function (keyword3538, decls3539) {
    return new BindingStatementTerm3281(keyword3538, decls3539);
};
inherit3046(StatementTerm3251, BindingStatementTerm3281, {
    isBindingStatementTerm: true,
    destruct: function (context3540, options3541) {
        return this.keyword.destruct(context3540, options3541).concat(_3039.reduce(this.decls, function (acc3542, decl3543) {
            push3045.apply(acc3542, decl3543.destruct(context3540, options3541));
            return acc3542;
        }, []));
    }
});
function VariableStatementTerm3282(keyword3544, decls3545) {
    this.keyword = keyword3544;
    this.decls = decls3545;
}
VariableStatementTerm3282.properties = ["keyword", "decls"];
VariableStatementTerm3282.create = function (keyword3546, decls3547) {
    return new VariableStatementTerm3282(keyword3546, decls3547);
};
inherit3046(BindingStatementTerm3281, VariableStatementTerm3282, { isVariableStatementTerm: true });
function LetStatementTerm3283(keyword3548, decls3549) {
    this.keyword = keyword3548;
    this.decls = decls3549;
}
LetStatementTerm3283.properties = ["keyword", "decls"];
LetStatementTerm3283.create = function (keyword3550, decls3551) {
    return new LetStatementTerm3283(keyword3550, decls3551);
};
inherit3046(BindingStatementTerm3281, LetStatementTerm3283, { isLetStatementTerm: true });
function ConstStatementTerm3284(keyword3552, decls3553) {
    this.keyword = keyword3552;
    this.decls = decls3553;
}
ConstStatementTerm3284.properties = ["keyword", "decls"];
ConstStatementTerm3284.create = function (keyword3554, decls3555) {
    return new ConstStatementTerm3284(keyword3554, decls3555);
};
inherit3046(BindingStatementTerm3281, ConstStatementTerm3284, { isConstStatementTerm: true });
function ParenExpressionTerm3285(args3556, delim3557, commas3558) {
    this.args = args3556;
    this.delim = delim3557;
    this.commas = commas3558;
}
ParenExpressionTerm3285.properties = ["args", "delim", "commas"];
ParenExpressionTerm3285.create = function (args3559, delim3560, commas3561) {
    return new ParenExpressionTerm3285(args3559, delim3560, commas3561);
};
inherit3046(PrimaryExpressionTerm3272, ParenExpressionTerm3285, {
    isParenExpressionTerm: true,
    destruct: function (context3562, options3563) {
        var commas3564 = this.commas.slice();
        var src3565 = this.delim.token;
        var keys3566 = Object.keys(src3565);
        var newtok3567 = {};
        for (var i3568 = 0, len3569 = keys3566.length, key3570; i3568 < len3569; i3568++) {
            key3570 = keys3566[i3568];
            newtok3567[key3570] = src3565[key3570];
        }
        var delim3571 = syntaxFromToken3042(newtok3567, this.delim);
        delim3571.token.inner = _3039.reduce(this.args, function (acc3572, term3573) {
            assert3041(term3573 && term3573.isTermTree, "expecting term trees in destruct of ParenExpression");
            push3045.apply(acc3572, term3573.destruct(context3562, options3563));
            if ( // add all commas except for the last one
            commas3564.length > 0) {
                acc3572.push(commas3564.shift());
            }
            return acc3572;
        }, []);
        return DelimiterTerm3232.create(delim3571).destruct(context3562, options3563);
    }
});
module.exports = {
    TermTree: TermTree3228,
    EOFTerm: EOFTerm3229,
    KeywordTerm: KeywordTerm3230,
    PuncTerm: PuncTerm3231,
    DelimiterTerm: DelimiterTerm3232,
    ModuleTimeTerm: ModuleTimeTerm3233,
    ModuleTerm: ModuleTerm3234,
    ImportTerm: ImportTerm3235,
    ImportForMacrosTerm: ImportForMacrosTerm3236,
    NamedImportTerm: NamedImportTerm3237,
    NamespaceImportTerm: NamespaceImportTerm3239,
    DefaultImportTerm: DefaultImportTerm3238,
    BindingTerm: BindingTerm3240,
    QualifiedBindingTerm: QualifiedBindingTerm3241,
    ExportNameTerm: ExportNameTerm3242,
    ExportDefaultTerm: ExportDefaultTerm3243,
    ExportDeclTerm: ExportDeclTerm3244,
    CompileTimeTerm: CompileTimeTerm3245,
    LetMacroTerm: LetMacroTerm3246,
    MacroTerm: MacroTerm3247,
    AnonMacroTerm: AnonMacroTerm3248,
    OperatorDefinitionTerm: OperatorDefinitionTerm3249,
    VariableDeclarationTerm: VariableDeclarationTerm3250,
    StatementTerm: StatementTerm3251,
    EmptyTerm: EmptyTerm3252,
    CatchClauseTerm: CatchClauseTerm3253,
    ForStatementTerm: ForStatementTerm3254,
    ReturnStatementTerm: ReturnStatementTerm3256,
    ExprTerm: ExprTerm3257,
    UnaryOpTerm: UnaryOpTerm3258,
    PostfixOpTerm: PostfixOpTerm3259,
    BinOpTerm: BinOpTerm3260,
    AssignmentExpressionTerm: AssignmentExpressionTerm3261,
    ConditionalExpressionTerm: ConditionalExpressionTerm3262,
    NamedFunTerm: NamedFunTerm3263,
    AnonFunTerm: AnonFunTerm3264,
    ArrowFunTerm: ArrowFunTerm3265,
    ObjDotGetTerm: ObjDotGetTerm3266,
    ObjGetTerm: ObjGetTerm3267,
    TemplateTerm: TemplateTerm3268,
    CallTerm: CallTerm3269,
    QuoteSyntaxTerm: QuoteSyntaxTerm3270,
    StopQuotedTerm: StopQuotedTerm3271,
    PrimaryExpressionTerm: PrimaryExpressionTerm3272,
    ThisExpressionTerm: ThisExpressionTerm3273,
    LitTerm: LitTerm3274,
    BlockTerm: BlockTerm3275,
    ArrayLiteralTerm: ArrayLiteralTerm3276,
    IdTerm: IdTerm3277,
    PartialTerm: PartialTerm3278,
    PartialOperationTerm: PartialOperationTerm3279,
    PartialExpressionTerm: PartialExpressionTerm3280,
    BindingStatementTerm: BindingStatementTerm3281,
    VariableStatementTerm: VariableStatementTerm3282,
    LetStatementTerm: LetStatementTerm3283,
    ClassDeclarationTerm: ClassDeclarationTerm3255,
    ConstStatementTerm: ConstStatementTerm3284,
    ParenExpressionTerm: ParenExpressionTerm3285
};
//# sourceMappingURL=termTree.js.map