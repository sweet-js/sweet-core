"use strict";

var expander8218 = require("./expander");
var Token8219, TokenName8220, FnExprTokens8221, Syntax8222, PropertyKind8223, Messages8224, Regex8225, SyntaxTreeDelegate8226, ClassPropertyType8227, source8228, strict8229, index8230, lineNumber8231, lineStart8232, sm_lineNumber8233, sm_lineStart8234, sm_range8235, sm_index8236, length8237, delegate8238, tokenStream8239, streamIndex8240, lookahead8241, lookaheadIndex8242, state8243, phase8244, extra8245;
Token8219 = {
    BooleanLiteral: 1,
    EOF: 2,
    Identifier: 3,
    Keyword: 4,
    NullLiteral: 5,
    NumericLiteral: 6,
    Punctuator: 7,
    StringLiteral: 8,
    RegularExpression: 9,
    Template: 10,
    Delimiter: 11
};
TokenName8220 = {};
TokenName8220[Token8219.BooleanLiteral] = "Boolean";
TokenName8220[Token8219.EOF] = "<end>";
TokenName8220[Token8219.Identifier] = "Identifier";
TokenName8220[Token8219.Keyword] = "Keyword";
TokenName8220[Token8219.NullLiteral] = "Null";
TokenName8220[Token8219.NumericLiteral] = "Numeric";
TokenName8220[Token8219.Punctuator] = "Punctuator";
TokenName8220[Token8219.StringLiteral] = "String";
TokenName8220[Token8219.RegularExpression] = "RegularExpression";
TokenName8220[Token8219.Delimiter] = "Delimiter";
// A function following one of those tokens is an expression.
FnExprTokens8221 = ["(", "{", "[", "in", "typeof", "instanceof", "new", "return", "case", "delete", "throw", "void",
// assignment operators
"=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ",",
// binary/unary operators
"+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!=="];
Syntax8222 = {
    ArrayExpression: "ArrayExpression",
    ArrayPattern: "ArrayPattern",
    ArrowFunctionExpression: "ArrowFunctionExpression",
    AssignmentExpression: "AssignmentExpression",
    BinaryExpression: "BinaryExpression",
    BlockStatement: "BlockStatement",
    BreakStatement: "BreakStatement",
    CallExpression: "CallExpression",
    CatchClause: "CatchClause",
    ClassBody: "ClassBody",
    ClassDeclaration: "ClassDeclaration",
    ClassExpression: "ClassExpression",
    ComprehensionBlock: "ComprehensionBlock",
    ComprehensionExpression: "ComprehensionExpression",
    ConditionalExpression: "ConditionalExpression",
    ContinueStatement: "ContinueStatement",
    DebuggerStatement: "DebuggerStatement",
    DoWhileStatement: "DoWhileStatement",
    EmptyStatement: "EmptyStatement",
    ExportDeclaration: "ExportDeclaration",
    ExportBatchSpecifier: "ExportBatchSpecifier",
    ExportSpecifier: "ExportSpecifier",
    ExpressionStatement: "ExpressionStatement",
    ForInStatement: "ForInStatement",
    ForOfStatement: "ForOfStatement",
    ForStatement: "ForStatement",
    FunctionDeclaration: "FunctionDeclaration",
    FunctionExpression: "FunctionExpression",
    Identifier: "Identifier",
    IfStatement: "IfStatement",
    ImportDeclaration: "ImportDeclaration",
    ImportDefaultSpecifier: "ImportDefaultSpecifier",
    ImportNamespaceSpecifier: "ImportNamespaceSpecifier",
    ImportSpecifier: "ImportSpecifier",
    LabeledStatement: "LabeledStatement",
    Literal: "Literal",
    LogicalExpression: "LogicalExpression",
    MemberExpression: "MemberExpression",
    MethodDefinition: "MethodDefinition",
    ModuleSpecifier: "ModuleSpecifier",
    NewExpression: "NewExpression",
    ObjectExpression: "ObjectExpression",
    ObjectPattern: "ObjectPattern",
    Program: "Program",
    Property: "Property",
    ReturnStatement: "ReturnStatement",
    SequenceExpression: "SequenceExpression",
    SpreadElement: "SpreadElement",
    SwitchCase: "SwitchCase",
    SwitchStatement: "SwitchStatement",
    TaggedTemplateExpression: "TaggedTemplateExpression",
    TemplateElement: "TemplateElement",
    TemplateLiteral: "TemplateLiteral",
    ThisExpression: "ThisExpression",
    ThrowStatement: "ThrowStatement",
    TryStatement: "TryStatement",
    UnaryExpression: "UnaryExpression",
    UpdateExpression: "UpdateExpression",
    VariableDeclaration: "VariableDeclaration",
    VariableDeclarator: "VariableDeclarator",
    WhileStatement: "WhileStatement",
    WithStatement: "WithStatement",
    YieldExpression: "YieldExpression"
};
PropertyKind8223 = {
    Data: 1,
    Get: 2,
    Set: 4
};
ClassPropertyType8227 = {
    "static": "static",
    prototype: "prototype"
};
// Error messages should be identical to V8.
Messages8224 = {
    UnexpectedToken: "Unexpected token %0",
    UnexpectedNumber: "Unexpected number",
    UnexpectedString: "Unexpected string",
    UnexpectedIdentifier: "Unexpected identifier",
    UnexpectedReserved: "Unexpected reserved word",
    UnexpectedTemplate: "Unexpected quasi %0",
    UnexpectedEOS: "Unexpected end of input",
    NewlineAfterThrow: "Illegal newline after throw",
    InvalidRegExp: "Invalid regular expression",
    UnterminatedRegExp: "Invalid regular expression: missing /",
    InvalidLHSInAssignment: "Invalid left-hand side in assignment",
    InvalidLHSInFormalsList: "Invalid left-hand side in formals list",
    InvalidLHSInForIn: "Invalid left-hand side in for-in",
    MultipleDefaultsInSwitch: "More than one default clause in switch statement",
    NoCatchOrFinally: "Missing catch or finally after try",
    UnknownLabel: "Undefined label '%0'",
    Redeclaration: "%0 '%1' has already been declared",
    IllegalContinue: "Illegal continue statement",
    IllegalBreak: "Illegal break statement",
    IllegalDuplicateClassProperty: "Illegal duplicate property in class definition",
    IllegalReturn: "Illegal return statement",
    IllegalYield: "Illegal yield expression",
    IllegalSpread: "Illegal spread element",
    StrictModeWith: "Strict mode code may not include a with statement",
    StrictCatchVariable: "Catch variable may not be eval or arguments in strict mode",
    StrictVarName: "Variable name may not be eval or arguments in strict mode",
    StrictParamName: "Parameter name eval or arguments is not allowed in strict mode",
    StrictParamDupe: "Strict mode function may not have duplicate parameter names",
    ParameterAfterRestParameter: "Rest parameter must be final parameter of an argument list",
    DefaultRestParameter: "Rest parameter can not have a default value",
    ElementAfterSpreadElement: "Spread must be the final element of an element list",
    ObjectPatternAsRestParameter: "Invalid rest parameter",
    ObjectPatternAsSpread: "Invalid spread argument",
    StrictFunctionName: "Function name may not be eval or arguments in strict mode",
    StrictOctalLiteral: "Octal literals are not allowed in strict mode.",
    StrictDelete: "Delete of an unqualified identifier in strict mode.",
    StrictDuplicateProperty: "Duplicate data property in object literal not allowed in strict mode",
    AccessorDataProperty: "Object literal may not have data and accessor property with the same name",
    AccessorGetSet: "Object literal may not have multiple get/set accessors with the same name",
    StrictLHSAssignment: "Assignment to eval or arguments is not allowed in strict mode",
    StrictLHSPostfix: "Postfix increment/decrement may not have eval or arguments operand in strict mode",
    StrictLHSPrefix: "Prefix increment/decrement may not have eval or arguments operand in strict mode",
    StrictReservedWord: "Use of future reserved word in strict mode",
    MissingFromClause: "Missing from clause",
    NoAsAfterImportNamespace: "Missing as after import *",
    InvalidModuleSpecifier: "Invalid module specifier",
    NoUnintializedConst: "Const must be initialized",
    ComprehensionRequiresBlock: "Comprehension must have at least one block",
    ComprehensionError: "Comprehension Error",
    EachNotAllowed: "Each is not supported",
    UnmatchedDelimiter: "Unmatched Delimiter"
};
// See also tools/generate-unicode-regex.py.
Regex8225 = {
    NonAsciiIdentifierStart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),
    NonAsciiIdentifierPart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")
};
function assert8246(condition8402, message8403) {
    if (!condition8402) {
        throw new Error("ASSERT: " + message8403);
    }
}
function isIn8247(el8404, list8405) {
    return list8405.indexOf(el8404) !== -1;
}
function isDecimalDigit8248(ch8406) {
    return ch8406 >= 48 && ch8406 <= 57;
}
function isHexDigit8249(ch8407) {
    return "0123456789abcdefABCDEF".indexOf(ch8407) >= 0;
}
function isOctalDigit8250(ch8408) {
    return "01234567".indexOf(ch8408) >= 0;
}
function isWhiteSpace8251(ch8409) {
    return ch8409 === 32 || // space
    ch8409 === 9 || // tab
    ch8409 === 11 || ch8409 === 12 || ch8409 === 160 || ch8409 >= 5760 && " ᠎             　﻿".indexOf(String.fromCharCode(ch8409)) > 0;
}
function isLineTerminator8252(ch8410) {
    return ch8410 === 10 || ch8410 === 13 || ch8410 === 8232 || ch8410 === 8233;
}
function isIdentifierStart8253(ch8411) {
    return ch8411 === 36 || ch8411 === 95 || // $ (dollar) and _ (underscore)
    ch8411 >= 65 && ch8411 <= 90 || // A..Z
    ch8411 >= 97 && ch8411 <= 122 || // a..z
    ch8411 === 92 || // \ (backslash)
    ch8411 >= 128 && Regex8225.NonAsciiIdentifierStart.test(String.fromCharCode(ch8411));
}
function isIdentifierPart8254(ch8412) {
    return ch8412 === 36 || ch8412 === 95 || // $ (dollar) and _ (underscore)
    ch8412 >= 65 && ch8412 <= 90 || // A..Z
    ch8412 >= 97 && ch8412 <= 122 || // a..z
    ch8412 >= 48 && ch8412 <= 57 || // 0..9
    ch8412 === 92 || // \ (backslash)
    ch8412 >= 128 && Regex8225.NonAsciiIdentifierPart.test(String.fromCharCode(ch8412));
}
function isFutureReservedWord8255(id8413) {
    switch (id8413) {
        case "class":
        case "enum":
        case "export":
        case "extends":
        case "import":
        case "super":
            return true;
        default:
            return false;
    }
}
function isStrictModeReservedWord8256(id8414) {
    switch (id8414) {
        case "implements":
        case "interface":
        case "package":
        case "private":
        case "protected":
        case "public":
        case "static":
        case "yield":
        case "let":
            return true;
        default:
            return false;
    }
}
function isRestrictedWord8257(id8415) {
    return id8415 === "eval" || id8415 === "arguments";
}
function isKeyword8258(id8416) {
    if (strict8229 && isStrictModeReservedWord8256(id8416)) {
        return true;
    }
    switch ( // 'const' is specialized as Keyword in V8.
    // 'yield' is only treated as a keyword in strict mode.
    // 'let' is for compatiblity with SpiderMonkey and ES.next.
    // Some others are from future reserved words.
    id8416.length) {
        case 2:
            return id8416 === "if" || id8416 === "in" || id8416 === "do";
        case 3:
            return id8416 === "var" || id8416 === "for" || id8416 === "new" || id8416 === "try" || id8416 === "let";
        case 4:
            return id8416 === "this" || id8416 === "else" || id8416 === "case" || id8416 === "void" || id8416 === "with" || id8416 === "enum";
        case 5:
            return id8416 === "while" || id8416 === "break" || id8416 === "catch" || id8416 === "throw" || id8416 === "const" || id8416 === "class" || id8416 === "super";
        case 6:
            return id8416 === "return" || id8416 === "typeof" || id8416 === "delete" || id8416 === "switch" || id8416 === "export" || id8416 === "import";
        case 7:
            return id8416 === "default" || id8416 === "finally" || id8416 === "extends";
        case 8:
            return id8416 === "function" || id8416 === "continue" || id8416 === "debugger";
        case 10:
            return id8416 === "instanceof";
        default:
            return false;
    }
}
function skipComment8259() {
    var ch8417, blockComment8418, lineComment8419;
    blockComment8418 = false;
    lineComment8419 = false;
    while (index8230 < length8237) {
        ch8417 = source8228.charCodeAt(index8230);
        if (lineComment8419) {
            ++index8230;
            if (isLineTerminator8252(ch8417)) {
                lineComment8419 = false;
                if (ch8417 === 13 && source8228.charCodeAt(index8230) === 10) {
                    ++index8230;
                }
                ++lineNumber8231;
                lineStart8232 = index8230;
            }
        } else if (blockComment8418) {
            if (isLineTerminator8252(ch8417)) {
                if (ch8417 === 13 && source8228.charCodeAt(index8230 + 1) === 10) {
                    ++index8230;
                }
                ++lineNumber8231;
                ++index8230;
                lineStart8232 = index8230;
                if (index8230 >= length8237) {
                    throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch8417 = source8228.charCodeAt(index8230++);
                if (index8230 >= length8237) {
                    throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
                }
                if ( // Block comment ends with '*/' (char #42, char #47).
                ch8417 === 42) {
                    ch8417 = source8228.charCodeAt(index8230);
                    if (ch8417 === 47) {
                        ++index8230;
                        blockComment8418 = false;
                    }
                }
            }
        } else if (ch8417 === 47) {
            ch8417 = source8228.charCodeAt(index8230 + 1);
            if ( // Line comment starts with '//' (char #47, char #47).
            ch8417 === 47) {
                index8230 += 2;
                lineComment8419 = true;
            } else if (ch8417 === 42) {
                // Block comment starts with '/*' (char #47, char #42).
                index8230 += 2;
                blockComment8418 = true;
                if (index8230 >= length8237) {
                    throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8251(ch8417)) {
            ++index8230;
        } else if (isLineTerminator8252(ch8417)) {
            ++index8230;
            if (ch8417 === 13 && source8228.charCodeAt(index8230) === 10) {
                ++index8230;
            }
            ++lineNumber8231;
            lineStart8232 = index8230;
        } else {
            break;
        }
    }
}
function scanHexEscape8260(prefix8420) {
    var i8421,
        len8422,
        ch8423,
        code8424 = 0;
    len8422 = prefix8420 === "u" ? 4 : 2;
    for (i8421 = 0; i8421 < len8422; ++i8421) {
        if (index8230 < length8237 && isHexDigit8249(source8228[index8230])) {
            ch8423 = source8228[index8230++];
            code8424 = code8424 * 16 + "0123456789abcdef".indexOf(ch8423.toLowerCase());
        } else {
            return "";
        }
    }
    return String.fromCharCode(code8424);
}
function scanUnicodeCodePointEscape8261() {
    var ch8425, code8426, cu18427, cu28428;
    ch8425 = source8228[index8230];
    code8426 = 0;
    if ( // At least, one hex digit is required.
    ch8425 === "}") {
        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
    }
    while (index8230 < length8237) {
        ch8425 = source8228[index8230++];
        if (!isHexDigit8249(ch8425)) {
            break;
        }
        code8426 = code8426 * 16 + "0123456789abcdef".indexOf(ch8425.toLowerCase());
    }
    if (code8426 > 1114111 || ch8425 !== "}") {
        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
    }
    if ( // UTF-16 Encoding
    code8426 <= 65535) {
        return String.fromCharCode(code8426);
    }
    cu18427 = (code8426 - 65536 >> 10) + 55296;
    cu28428 = (code8426 - 65536 & 1023) + 56320;
    return String.fromCharCode(cu18427, cu28428);
}
function getEscapedIdentifier8262() {
    var ch8429, id8430;
    ch8429 = source8228.charCodeAt(index8230++);
    id8430 = String.fromCharCode(ch8429);
    if ( // '\u' (char #92, char #117) denotes an escaped character.
    ch8429 === 92) {
        if (source8228.charCodeAt(index8230) !== 117) {
            throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
        }
        ++index8230;
        ch8429 = scanHexEscape8260("u");
        if (!ch8429 || ch8429 === "\\" || !isIdentifierStart8253(ch8429.charCodeAt(0))) {
            throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
        }
        id8430 = ch8429;
    }
    while (index8230 < length8237) {
        ch8429 = source8228.charCodeAt(index8230);
        if (!isIdentifierPart8254(ch8429)) {
            break;
        }
        ++index8230;
        id8430 += String.fromCharCode(ch8429);
        if ( // '\u' (char #92, char #117) denotes an escaped character.
        ch8429 === 92) {
            id8430 = id8430.substr(0, id8430.length - 1);
            if (source8228.charCodeAt(index8230) !== 117) {
                throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
            }
            ++index8230;
            ch8429 = scanHexEscape8260("u");
            if (!ch8429 || ch8429 === "\\" || !isIdentifierPart8254(ch8429.charCodeAt(0))) {
                throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
            }
            id8430 += ch8429;
        }
    }
    return id8430;
}
function getIdentifier8263() {
    var start8431, ch8432;
    start8431 = index8230++;
    while (index8230 < length8237) {
        ch8432 = source8228.charCodeAt(index8230);
        if (ch8432 === 92) {
            // Blackslash (char #92) marks Unicode escape sequence.
            index8230 = start8431;
            return getEscapedIdentifier8262();
        }
        if (isIdentifierPart8254(ch8432)) {
            ++index8230;
        } else {
            break;
        }
    }
    return source8228.slice(start8431, index8230);
}
function scanIdentifier8264() {
    var start8433, id8434, type8435;
    start8433 = index8230;
    // Backslash (char #92) starts an escaped character.
    id8434 = source8228.charCodeAt(index8230) === 92 ? getEscapedIdentifier8262() : getIdentifier8263();
    if ( // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    id8434.length === 1) {
        type8435 = Token8219.Identifier;
    } else if (isKeyword8258(id8434)) {
        type8435 = Token8219.Keyword;
    } else if (id8434 === "null") {
        type8435 = Token8219.NullLiteral;
    } else if (id8434 === "true" || id8434 === "false") {
        type8435 = Token8219.BooleanLiteral;
    } else {
        type8435 = Token8219.Identifier;
    }
    return {
        type: type8435,
        value: id8434,
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [start8433, index8230]
    };
}
function scanPunctuator8265() {
    var start8436 = index8230,
        code8437 = source8228.charCodeAt(index8230),
        code28438,
        ch18439 = source8228[index8230],
        ch28440,
        ch38441,
        ch48442;
    switch (code8437) {
        // Check for most common single-character punctuators.
        case 40:
        // ( open bracket
        case 41:
        // ) close bracket
        case 59:
        // ; semicolon
        case 44:
        // , comma
        case 123:
        // { open curly brace
        case 125:
        // } close curly brace
        case 91:
        // [
        case 93:
        // ]
        case 58:
        // :
        case 63:
        case // ?
        126:
            // ~
            ++index8230;
            if (extra8245.tokenize) {
                if (code8437 === 40) {
                    extra8245.openParenToken = extra8245.tokens.length;
                } else if (code8437 === 123) {
                    extra8245.openCurlyToken = extra8245.tokens.length;
                }
            }
            return {
                type: Token8219.Punctuator,
                value: String.fromCharCode(code8437),
                lineNumber: lineNumber8231,
                lineStart: lineStart8232,
                range: [start8436, index8230]
            };
        default:
            code28438 = source8228.charCodeAt(index8230 + 1);
            if ( // '=' (char #61) marks an assignment or comparison operator.
            code28438 === 61) {
                switch (code8437) {
                    case 37:
                    // %
                    case 38:
                    // &
                    case 42:
                    // *:
                    case 43:
                    // +
                    case 45:
                    // -
                    case 47:
                    // /
                    case 60:
                    // <
                    case 62:
                    // >
                    case 94:
                    case // ^
                    124:
                        // |
                        index8230 += 2;
                        return {
                            type: Token8219.Punctuator,
                            value: String.fromCharCode(code8437) + String.fromCharCode(code28438),
                            lineNumber: lineNumber8231,
                            lineStart: lineStart8232,
                            range: [start8436, index8230]
                        };
                    case 33:
                    case // !
                    61:
                        // =
                        index8230 += 2;
                        if ( // !== and ===
                        source8228.charCodeAt(index8230) === 61) {
                            ++index8230;
                        }
                        return {
                            type: Token8219.Punctuator,
                            value: source8228.slice(start8436, index8230),
                            lineNumber: lineNumber8231,
                            lineStart: lineStart8232,
                            range: [start8436, index8230]
                        };
                    default:
                        break;
                }
            }
            break;
    }
    // Peek more characters.
    ch28440 = source8228[index8230 + 1];
    ch38441 = source8228[index8230 + 2];
    ch48442 = source8228[index8230 + 3];
    if ( // 4-character punctuator: >>>=
    ch18439 === ">" && ch28440 === ">" && ch38441 === ">") {
        if (ch48442 === "=") {
            index8230 += 4;
            return {
                type: Token8219.Punctuator,
                value: ">>>=",
                lineNumber: lineNumber8231,
                lineStart: lineStart8232,
                range: [start8436, index8230]
            };
        }
    }
    if ( // 3-character punctuators: === !== >>> <<= >>=
    ch18439 === ">" && ch28440 === ">" && ch38441 === ">") {
        index8230 += 3;
        return {
            type: Token8219.Punctuator,
            value: ">>>",
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [start8436, index8230]
        };
    }
    if (ch18439 === "<" && ch28440 === "<" && ch38441 === "=") {
        index8230 += 3;
        return {
            type: Token8219.Punctuator,
            value: "<<=",
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [start8436, index8230]
        };
    }
    if (ch18439 === ">" && ch28440 === ">" && ch38441 === "=") {
        index8230 += 3;
        return {
            type: Token8219.Punctuator,
            value: ">>=",
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [start8436, index8230]
        };
    }
    if (ch18439 === "." && ch28440 === "." && ch38441 === ".") {
        index8230 += 3;
        return {
            type: Token8219.Punctuator,
            value: "...",
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [start8436, index8230]
        };
    }
    if ( // Other 2-character punctuators: ++ -- << >> && ||
    ch18439 === ch28440 && "+-<>&|".indexOf(ch18439) >= 0) {
        index8230 += 2;
        return {
            type: Token8219.Punctuator,
            value: ch18439 + ch28440,
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [start8436, index8230]
        };
    }
    if (ch18439 === "=" && ch28440 === ">") {
        index8230 += 2;
        return {
            type: Token8219.Punctuator,
            value: "=>",
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [start8436, index8230]
        };
    }
    if ("<>=!+-*%&|^/".indexOf(ch18439) >= 0) {
        ++index8230;
        return {
            type: Token8219.Punctuator,
            value: ch18439,
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [start8436, index8230]
        };
    }
    if (ch18439 === ".") {
        ++index8230;
        return {
            type: Token8219.Punctuator,
            value: ch18439,
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [start8436, index8230]
        };
    }
    throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
}
function scanHexLiteral8266(start8443) {
    var number8444 = "";
    while (index8230 < length8237) {
        if (!isHexDigit8249(source8228[index8230])) {
            break;
        }
        number8444 += source8228[index8230++];
    }
    if (number8444.length === 0) {
        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8253(source8228.charCodeAt(index8230))) {
        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8219.NumericLiteral,
        value: parseInt("0x" + number8444, 16),
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [start8443, index8230]
    };
}
function scanOctalLiteral8267(prefix8445, start8446) {
    var number8447, octal8448;
    if (isOctalDigit8250(prefix8445)) {
        octal8448 = true;
        number8447 = "0" + source8228[index8230++];
    } else {
        octal8448 = false;
        ++index8230;
        number8447 = "";
    }
    while (index8230 < length8237) {
        if (!isOctalDigit8250(source8228[index8230])) {
            break;
        }
        number8447 += source8228[index8230++];
    }
    if (!octal8448 && number8447.length === 0) {
        // only 0o or 0O
        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8253(source8228.charCodeAt(index8230)) || isDecimalDigit8248(source8228.charCodeAt(index8230))) {
        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8219.NumericLiteral,
        value: parseInt(number8447, 8),
        octal: octal8448,
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [start8446, index8230]
    };
}
function scanNumericLiteral8268() {
    var number8449, start8450, ch8451, octal8452;
    ch8451 = source8228[index8230];
    assert8246(isDecimalDigit8248(ch8451.charCodeAt(0)) || ch8451 === ".", "Numeric literal must start with a decimal digit or a decimal point");
    start8450 = index8230;
    number8449 = "";
    if (ch8451 !== ".") {
        number8449 = source8228[index8230++];
        ch8451 = source8228[index8230];
        if ( // Hex number starts with '0x'.
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        // Binary number in ES6 starts with '0b'.
        number8449 === "0") {
            if (ch8451 === "x" || ch8451 === "X") {
                ++index8230;
                return scanHexLiteral8266(start8450);
            }
            if (ch8451 === "b" || ch8451 === "B") {
                ++index8230;
                number8449 = "";
                while (index8230 < length8237) {
                    ch8451 = source8228[index8230];
                    if (ch8451 !== "0" && ch8451 !== "1") {
                        break;
                    }
                    number8449 += source8228[index8230++];
                }
                if (number8449.length === 0) {
                    // only 0b or 0B
                    throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
                }
                if (index8230 < length8237) {
                    ch8451 = source8228.charCodeAt(index8230);
                    if (isIdentifierStart8253(ch8451) || isDecimalDigit8248(ch8451)) {
                        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
                    }
                }
                return {
                    type: Token8219.NumericLiteral,
                    value: parseInt(number8449, 2),
                    lineNumber: lineNumber8231,
                    lineStart: lineStart8232,
                    range: [start8450, index8230]
                };
            }
            if (ch8451 === "o" || ch8451 === "O" || isOctalDigit8250(ch8451)) {
                return scanOctalLiteral8267(ch8451, start8450);
            }
            if ( // decimal number starts with '0' such as '09' is illegal.
            ch8451 && isDecimalDigit8248(ch8451.charCodeAt(0))) {
                throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
            }
        }
        while (isDecimalDigit8248(source8228.charCodeAt(index8230))) {
            number8449 += source8228[index8230++];
        }
        ch8451 = source8228[index8230];
    }
    if (ch8451 === ".") {
        number8449 += source8228[index8230++];
        while (isDecimalDigit8248(source8228.charCodeAt(index8230))) {
            number8449 += source8228[index8230++];
        }
        ch8451 = source8228[index8230];
    }
    if (ch8451 === "e" || ch8451 === "E") {
        number8449 += source8228[index8230++];
        ch8451 = source8228[index8230];
        if (ch8451 === "+" || ch8451 === "-") {
            number8449 += source8228[index8230++];
        }
        if (isDecimalDigit8248(source8228.charCodeAt(index8230))) {
            while (isDecimalDigit8248(source8228.charCodeAt(index8230))) {
                number8449 += source8228[index8230++];
            }
        } else {
            throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
        }
    }
    if (isIdentifierStart8253(source8228.charCodeAt(index8230))) {
        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8219.NumericLiteral,
        value: parseFloat(number8449),
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [start8450, index8230]
    };
}
function scanStringLiteral8269() {
    var str8453 = "",
        quote8454,
        start8455,
        ch8456,
        code8457,
        unescaped8458,
        restore8459,
        octal8460 = false;
    quote8454 = source8228[index8230];
    assert8246(quote8454 === "'" || quote8454 === "\"", "String literal must starts with a quote");
    start8455 = index8230;
    ++index8230;
    while (index8230 < length8237) {
        ch8456 = source8228[index8230++];
        if (ch8456 === quote8454) {
            quote8454 = "";
            break;
        } else if (ch8456 === "\\") {
            ch8456 = source8228[index8230++];
            if (!ch8456 || !isLineTerminator8252(ch8456.charCodeAt(0))) {
                switch (ch8456) {
                    case "n":
                        str8453 += "\n";
                        break;
                    case "r":
                        str8453 += "\r";
                        break;
                    case "t":
                        str8453 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8228[index8230] === "{") {
                            ++index8230;
                            str8453 += scanUnicodeCodePointEscape8261();
                        } else {
                            restore8459 = index8230;
                            unescaped8458 = scanHexEscape8260(ch8456);
                            if (unescaped8458) {
                                str8453 += unescaped8458;
                            } else {
                                index8230 = restore8459;
                                str8453 += ch8456;
                            }
                        }
                        break;
                    case "b":
                        str8453 += "\b";
                        break;
                    case "f":
                        str8453 += "\f";
                        break;
                    case "v":
                        str8453 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8250(ch8456)) {
                            code8457 = "01234567".indexOf(ch8456);
                            if ( // \0 is not octal escape sequence
                            code8457 !== 0) {
                                octal8460 = true;
                            }
                            if (index8230 < length8237 && isOctalDigit8250(source8228[index8230])) {
                                octal8460 = true;
                                code8457 = code8457 * 8 + "01234567".indexOf(source8228[index8230++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8456) >= 0 && index8230 < length8237 && isOctalDigit8250(source8228[index8230])) {
                                    code8457 = code8457 * 8 + "01234567".indexOf(source8228[index8230++]);
                                }
                            }
                            str8453 += String.fromCharCode(code8457);
                        } else {
                            str8453 += ch8456;
                        }
                        break;
                }
            } else {
                ++lineNumber8231;
                if (ch8456 === "\r" && source8228[index8230] === "\n") {
                    ++index8230;
                }
                lineStart8232 = index8230;
            }
        } else if (isLineTerminator8252(ch8456.charCodeAt(0))) {
            break;
        } else {
            str8453 += ch8456;
        }
    }
    if (quote8454 !== "") {
        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8219.StringLiteral,
        value: str8453,
        octal: octal8460,
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [start8455, index8230]
    };
}
function scanTemplate8270() {
    var cooked8461 = "",
        ch8462,
        start8463,
        terminated8464,
        tail8465,
        restore8466,
        unescaped8467,
        code8468,
        octal8469;
    terminated8464 = false;
    tail8465 = false;
    start8463 = index8230;
    ++index8230;
    while (index8230 < length8237) {
        ch8462 = source8228[index8230++];
        if (ch8462 === "`") {
            tail8465 = true;
            terminated8464 = true;
            break;
        } else if (ch8462 === "$") {
            if (source8228[index8230] === "{") {
                ++index8230;
                terminated8464 = true;
                break;
            }
            cooked8461 += ch8462;
        } else if (ch8462 === "\\") {
            ch8462 = source8228[index8230++];
            if (!isLineTerminator8252(ch8462.charCodeAt(0))) {
                switch (ch8462) {
                    case "n":
                        cooked8461 += "\n";
                        break;
                    case "r":
                        cooked8461 += "\r";
                        break;
                    case "t":
                        cooked8461 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8228[index8230] === "{") {
                            ++index8230;
                            cooked8461 += scanUnicodeCodePointEscape8261();
                        } else {
                            restore8466 = index8230;
                            unescaped8467 = scanHexEscape8260(ch8462);
                            if (unescaped8467) {
                                cooked8461 += unescaped8467;
                            } else {
                                index8230 = restore8466;
                                cooked8461 += ch8462;
                            }
                        }
                        break;
                    case "b":
                        cooked8461 += "\b";
                        break;
                    case "f":
                        cooked8461 += "\f";
                        break;
                    case "v":
                        cooked8461 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8250(ch8462)) {
                            code8468 = "01234567".indexOf(ch8462);
                            if ( // \0 is not octal escape sequence
                            code8468 !== 0) {
                                octal8469 = true;
                            }
                            if (index8230 < length8237 && isOctalDigit8250(source8228[index8230])) {
                                octal8469 = true;
                                code8468 = code8468 * 8 + "01234567".indexOf(source8228[index8230++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8462) >= 0 && index8230 < length8237 && isOctalDigit8250(source8228[index8230])) {
                                    code8468 = code8468 * 8 + "01234567".indexOf(source8228[index8230++]);
                                }
                            }
                            cooked8461 += String.fromCharCode(code8468);
                        } else {
                            cooked8461 += ch8462;
                        }
                        break;
                }
            } else {
                ++lineNumber8231;
                if (ch8462 === "\r" && source8228[index8230] === "\n") {
                    ++index8230;
                }
                lineStart8232 = index8230;
            }
        } else if (isLineTerminator8252(ch8462.charCodeAt(0))) {
            ++lineNumber8231;
            if (ch8462 === "\r" && source8228[index8230] === "\n") {
                ++index8230;
            }
            lineStart8232 = index8230;
            cooked8461 += "\n";
        } else {
            cooked8461 += ch8462;
        }
    }
    if (!terminated8464) {
        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8219.Template,
        value: {
            cooked: cooked8461,
            raw: source8228.slice(start8463 + 1, index8230 - (tail8465 ? 1 : 2))
        },
        tail: tail8465,
        octal: octal8469,
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [start8463, index8230]
    };
}
function scanTemplateElement8271(option8470) {
    var startsWith8471, template8472;
    lookahead8241 = null;
    skipComment8259();
    startsWith8471 = option8470.head ? "`" : "}";
    if (source8228[index8230] !== startsWith8471) {
        throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
    }
    template8472 = scanTemplate8270();
    return template8472;
}
function scanRegExp8272() {
    var str8473,
        ch8474,
        start8475,
        pattern8476,
        flags8477,
        value8478,
        classMarker8479 = false,
        restore8480,
        terminated8481 = false,
        tmp8482;
    lookahead8241 = null;
    skipComment8259();
    start8475 = index8230;
    ch8474 = source8228[index8230];
    assert8246(ch8474 === "/", "Regular expression literal must start with a slash");
    str8473 = source8228[index8230++];
    while (index8230 < length8237) {
        ch8474 = source8228[index8230++];
        str8473 += ch8474;
        if (classMarker8479) {
            if (ch8474 === "]") {
                classMarker8479 = false;
            }
        } else {
            if (ch8474 === "\\") {
                ch8474 = source8228[index8230++];
                if ( // ECMA-262 7.8.5
                isLineTerminator8252(ch8474.charCodeAt(0))) {
                    throwError8283({}, Messages8224.UnterminatedRegExp);
                }
                str8473 += ch8474;
            } else if (ch8474 === "/") {
                terminated8481 = true;
                break;
            } else if (ch8474 === "[") {
                classMarker8479 = true;
            } else if (isLineTerminator8252(ch8474.charCodeAt(0))) {
                throwError8283({}, Messages8224.UnterminatedRegExp);
            }
        }
    }
    if (!terminated8481) {
        throwError8283({}, Messages8224.UnterminatedRegExp);
    }
    // Exclude leading and trailing slash.
    pattern8476 = str8473.substr(1, str8473.length - 2);
    flags8477 = "";
    while (index8230 < length8237) {
        ch8474 = source8228[index8230];
        if (!isIdentifierPart8254(ch8474.charCodeAt(0))) {
            break;
        }
        ++index8230;
        if (ch8474 === "\\" && index8230 < length8237) {
            ch8474 = source8228[index8230];
            if (ch8474 === "u") {
                ++index8230;
                restore8480 = index8230;
                ch8474 = scanHexEscape8260("u");
                if (ch8474) {
                    flags8477 += ch8474;
                    for (str8473 += "\\u"; restore8480 < index8230; ++restore8480) {
                        str8473 += source8228[restore8480];
                    }
                } else {
                    index8230 = restore8480;
                    flags8477 += "u";
                    str8473 += "\\u";
                }
            } else {
                str8473 += "\\";
            }
        } else {
            flags8477 += ch8474;
            str8473 += ch8474;
        }
    }
    tmp8482 = pattern8476;
    if (flags8477.indexOf("u") >= 0) {
        // Replace each astral symbol and every Unicode code point
        // escape sequence that represents such a symbol with a single
        // ASCII symbol to avoid throwing on regular expressions that
        // are only valid in combination with the `/u` flag.
        tmp8482 = tmp8482.replace(/\\u\{([0-9a-fA-F]{5,6})\}/g, "x").replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
    }
    try {
        // First, detect invalid regular expressions.
        value8478 = new RegExp(tmp8482);
    } catch (e8483) {
        throwError8283({}, Messages8224.InvalidRegExp);
    }
    try {
        // Return a regular expression object for this pattern-flag pair, or
        // `null` in case the current environment doesn't support the flags it
        // uses.
        value8478 = new RegExp(pattern8476, flags8477);
    } catch (exception8484) {
        value8478 = null;
    }
    if (extra8245.tokenize) {
        return {
            type: Token8219.RegularExpression,
            value: value8478,
            regex: {
                pattern: pattern8476,
                flags: flags8477
            },
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [start8475, index8230]
        };
    }
    return {
        type: Token8219.RegularExpression,
        literal: str8473,
        regex: {
            pattern: pattern8476,
            flags: flags8477
        },
        value: value8478,
        range: [start8475, index8230]
    };
}
function isIdentifierName8273(token8485) {
    return token8485.type === Token8219.Identifier || token8485.type === Token8219.Keyword || token8485.type === Token8219.BooleanLiteral || token8485.type === Token8219.NullLiteral;
}
function advanceSlash8274() {
    var prevToken8486, checkToken8487;
    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design
    prevToken8486 = extra8245.tokens[extra8245.tokens.length - 1];
    if (!prevToken8486) {
        // Nothing before that: it cannot be a division.
        return scanRegExp8272();
    }
    if (prevToken8486.type === "Punctuator") {
        if (prevToken8486.value === ")") {
            checkToken8487 = extra8245.tokens[extra8245.openParenToken - 1];
            if (checkToken8487 && checkToken8487.type === "Keyword" && (checkToken8487.value === "if" || checkToken8487.value === "while" || checkToken8487.value === "for" || checkToken8487.value === "with")) {
                return scanRegExp8272();
            }
            return scanPunctuator8265();
        }
        if (prevToken8486.value === "}") {
            if ( // Dividing a function by anything makes little sense,
            // but we have to check for that.
            extra8245.tokens[extra8245.openCurlyToken - 3] && extra8245.tokens[extra8245.openCurlyToken - 3].type === "Keyword") {
                // Anonymous function.
                checkToken8487 = extra8245.tokens[extra8245.openCurlyToken - 4];
                if (!checkToken8487) {
                    return scanPunctuator8265();
                }
            } else if (extra8245.tokens[extra8245.openCurlyToken - 4] && extra8245.tokens[extra8245.openCurlyToken - 4].type === "Keyword") {
                // Named function.
                checkToken8487 = extra8245.tokens[extra8245.openCurlyToken - 5];
                if (!checkToken8487) {
                    return scanRegExp8272();
                }
            } else {
                return scanPunctuator8265();
            }
            if ( // checkToken determines whether the function is
            // a declaration or an expression.
            FnExprTokens8221.indexOf(checkToken8487.value) >= 0) {
                // It is an expression.
                return scanPunctuator8265();
            }
            // It is a declaration.
            return scanRegExp8272();
        }
        return scanRegExp8272();
    }
    if (prevToken8486.type === "Keyword") {
        return scanRegExp8272();
    }
    return scanPunctuator8265();
}
function advance8275() {
    var ch8488;
    skipComment8259();
    if (index8230 >= length8237) {
        return {
            type: Token8219.EOF,
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [index8230, index8230]
        };
    }
    ch8488 = source8228.charCodeAt(index8230);
    if ( // Very common: ( and ) and ;
    ch8488 === 40 || ch8488 === 41 || ch8488 === 58) {
        return scanPunctuator8265();
    }
    if ( // String literal starts with single quote (#39) or double quote (#34).
    ch8488 === 39 || ch8488 === 34) {
        return scanStringLiteral8269();
    }
    if (ch8488 === 96) {
        return scanTemplate8270();
    }
    if (isIdentifierStart8253(ch8488)) {
        return scanIdentifier8264();
    }
    if ( // # and @ are allowed for sweet.js
    ch8488 === 35 || ch8488 === 64) {
        ++index8230;
        return {
            type: Token8219.Punctuator,
            value: String.fromCharCode(ch8488),
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [index8230 - 1, index8230]
        };
    }
    if ( // Dot (.) char #46 can also start a floating-point number, hence the need
    // to check the next character.
    ch8488 === 46) {
        if (isDecimalDigit8248(source8228.charCodeAt(index8230 + 1))) {
            return scanNumericLiteral8268();
        }
        return scanPunctuator8265();
    }
    if (isDecimalDigit8248(ch8488)) {
        return scanNumericLiteral8268();
    }
    if ( // Slash (/) char #47 can also start a regex.
    extra8245.tokenize && ch8488 === 47) {
        return advanceSlash8274();
    }
    return scanPunctuator8265();
}
function lex8276() {
    var token8489;
    token8489 = lookahead8241;
    streamIndex8240 = lookaheadIndex8242;
    lineNumber8231 = token8489.lineNumber;
    lineStart8232 = token8489.lineStart;
    sm_lineNumber8233 = lookahead8241.sm_lineNumber;
    sm_lineStart8234 = lookahead8241.sm_lineStart;
    sm_range8235 = lookahead8241.sm_range;
    sm_index8236 = lookahead8241.sm_range[0];
    lookahead8241 = tokenStream8239[++streamIndex8240].token;
    lookaheadIndex8242 = streamIndex8240;
    index8230 = lookahead8241.range[0];
    if (token8489.leadingComments) {
        extra8245.comments = extra8245.comments.concat(token8489.leadingComments);
        extra8245.trailingComments = extra8245.trailingComments.concat(token8489.leadingComments);
        extra8245.leadingComments = extra8245.leadingComments.concat(token8489.leadingComments);
    }
    return token8489;
}
function peek8277() {
    lookaheadIndex8242 = streamIndex8240 + 1;
    if (lookaheadIndex8242 >= length8237) {
        lookahead8241 = {
            type: Token8219.EOF,
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [index8230, index8230]
        };
        return;
    }
    lookahead8241 = tokenStream8239[lookaheadIndex8242].token;
    index8230 = lookahead8241.range[0];
}
function lookahead28278() {
    var adv8490, pos8491, line8492, start8493, result8494;
    if (streamIndex8240 + 1 >= length8237 || streamIndex8240 + 2 >= length8237) {
        return {
            type: Token8219.EOF,
            lineNumber: lineNumber8231,
            lineStart: lineStart8232,
            range: [index8230, index8230]
        };
    }
    if ( // Scan for the next immediate token.
    lookahead8241 === null) {
        lookaheadIndex8242 = streamIndex8240 + 1;
        lookahead8241 = tokenStream8239[lookaheadIndex8242].token;
        index8230 = lookahead8241.range[0];
    }
    result8494 = tokenStream8239[lookaheadIndex8242 + 1].token;
    return result8494;
}
function markerCreate8279() {
    var sm_index8495 = lookahead8241 ? lookahead8241.sm_range[0] : 0;
    var sm_lineStart8496 = lookahead8241 ? lookahead8241.sm_lineStart : 0;
    var sm_lineNumber8497 = lookahead8241 ? lookahead8241.sm_lineNumber : 1;
    if (!extra8245.loc && !extra8245.range) {
        return undefined;
    }
    return {
        offset: sm_index8495,
        line: sm_lineNumber8497,
        col: sm_index8495 - sm_lineStart8496
    };
}
function processComment8280(node8498) {
    var lastChild8499,
        trailingComments8500,
        bottomRight8501 = extra8245.bottomRightStack,
        last8502 = bottomRight8501[bottomRight8501.length - 1];
    if (node8498.type === Syntax8222.Program) {
        if (node8498.body.length > 0) {
            return;
        }
    }
    if (extra8245.trailingComments.length > 0) {
        if (extra8245.trailingComments[0].range[0] >= node8498.range[1]) {
            trailingComments8500 = extra8245.trailingComments;
            extra8245.trailingComments = [];
        } else {
            extra8245.trailingComments.length = 0;
        }
    } else {
        if (last8502 && last8502.trailingComments && last8502.trailingComments[0].range[0] >= node8498.range[1]) {
            trailingComments8500 = last8502.trailingComments;
            delete last8502.trailingComments;
        }
    }
    if ( // Eating the stack.
    last8502) {
        while (last8502 && last8502.range[0] >= node8498.range[0]) {
            lastChild8499 = last8502;
            last8502 = bottomRight8501.pop();
        }
    }
    if (lastChild8499) {
        if (lastChild8499.leadingComments && lastChild8499.leadingComments[lastChild8499.leadingComments.length - 1].range[1] <= node8498.range[0]) {
            node8498.leadingComments = lastChild8499.leadingComments;
            delete lastChild8499.leadingComments;
        }
    } else if (extra8245.leadingComments.length > 0 && extra8245.leadingComments[extra8245.leadingComments.length - 1].range[1] <= node8498.range[0]) {
        node8498.leadingComments = extra8245.leadingComments;
        extra8245.leadingComments = [];
    }
    if (trailingComments8500) {
        node8498.trailingComments = trailingComments8500;
    }
    bottomRight8501.push(node8498);
}
function markerApply8281(marker8503, node8504) {
    if (extra8245.range) {
        node8504.range = [marker8503.offset, sm_index8236];
    }
    if (extra8245.loc) {
        node8504.loc = {
            start: {
                line: marker8503.line,
                column: marker8503.col
            },
            end: {
                line: sm_lineNumber8233,
                column: sm_index8236 - sm_lineStart8234
            }
        };
        node8504 = delegate8238.postProcess(node8504);
    }
    if (extra8245.attachComment) {
        processComment8280(node8504);
    }
    return node8504;
}
SyntaxTreeDelegate8226 = {
    name: "SyntaxTree",
    postProcess: function postProcess(node8505) {
        return node8505;
    },
    createArrayExpression: function createArrayExpression(elements8506) {
        return {
            type: Syntax8222.ArrayExpression,
            elements: elements8506
        };
    },
    createAssignmentExpression: function createAssignmentExpression(operator8507, left8508, right8509) {
        return {
            type: Syntax8222.AssignmentExpression,
            operator: operator8507,
            left: left8508,
            right: right8509
        };
    },
    createBinaryExpression: function createBinaryExpression(operator8510, left8511, right8512) {
        var type8513 = operator8510 === "||" || operator8510 === "&&" ? Syntax8222.LogicalExpression : Syntax8222.BinaryExpression;
        return {
            type: type8513,
            operator: operator8510,
            left: left8511,
            right: right8512
        };
    },
    createBlockStatement: function createBlockStatement(body8514) {
        return {
            type: Syntax8222.BlockStatement,
            body: body8514
        };
    },
    createBreakStatement: function createBreakStatement(label8515) {
        return {
            type: Syntax8222.BreakStatement,
            label: label8515
        };
    },
    createCallExpression: function createCallExpression(callee8516, args8517) {
        return {
            type: Syntax8222.CallExpression,
            callee: callee8516,
            arguments: args8517
        };
    },
    createCatchClause: function createCatchClause(param8518, body8519) {
        return {
            type: Syntax8222.CatchClause,
            param: param8518,
            body: body8519
        };
    },
    createConditionalExpression: function createConditionalExpression(test8520, consequent8521, alternate8522) {
        return {
            type: Syntax8222.ConditionalExpression,
            test: test8520,
            consequent: consequent8521,
            alternate: alternate8522
        };
    },
    createContinueStatement: function createContinueStatement(label8523) {
        return {
            type: Syntax8222.ContinueStatement,
            label: label8523
        };
    },
    createDebuggerStatement: function createDebuggerStatement() {
        return { type: Syntax8222.DebuggerStatement };
    },
    createDoWhileStatement: function createDoWhileStatement(body8524, test8525) {
        return {
            type: Syntax8222.DoWhileStatement,
            body: body8524,
            test: test8525
        };
    },
    createEmptyStatement: function createEmptyStatement() {
        return { type: Syntax8222.EmptyStatement };
    },
    createExpressionStatement: function createExpressionStatement(expression8526) {
        return {
            type: Syntax8222.ExpressionStatement,
            expression: expression8526
        };
    },
    createForStatement: function createForStatement(init8527, test8528, update8529, body8530) {
        return {
            type: Syntax8222.ForStatement,
            init: init8527,
            test: test8528,
            update: update8529,
            body: body8530
        };
    },
    createForInStatement: function createForInStatement(left8531, right8532, body8533) {
        return {
            type: Syntax8222.ForInStatement,
            left: left8531,
            right: right8532,
            body: body8533,
            each: false
        };
    },
    createForOfStatement: function createForOfStatement(left8534, right8535, body8536) {
        return {
            type: Syntax8222.ForOfStatement,
            left: left8534,
            right: right8535,
            body: body8536
        };
    },
    createFunctionDeclaration: function createFunctionDeclaration(id8537, params8538, defaults8539, body8540, rest8541, generator8542, expression8543) {
        return {
            type: Syntax8222.FunctionDeclaration,
            id: id8537,
            params: params8538,
            defaults: defaults8539,
            body: body8540,
            rest: rest8541,
            generator: generator8542,
            expression: expression8543
        };
    },
    createFunctionExpression: function createFunctionExpression(id8544, params8545, defaults8546, body8547, rest8548, generator8549, expression8550) {
        return {
            type: Syntax8222.FunctionExpression,
            id: id8544,
            params: params8545,
            defaults: defaults8546,
            body: body8547,
            rest: rest8548,
            generator: generator8549,
            expression: expression8550
        };
    },
    createIdentifier: function createIdentifier(name8551) {
        return {
            type: Syntax8222.Identifier,
            name: name8551
        };
    },
    createIfStatement: function createIfStatement(test8552, consequent8553, alternate8554) {
        return {
            type: Syntax8222.IfStatement,
            test: test8552,
            consequent: consequent8553,
            alternate: alternate8554
        };
    },
    createLabeledStatement: function createLabeledStatement(label8555, body8556) {
        return {
            type: Syntax8222.LabeledStatement,
            label: label8555,
            body: body8556
        };
    },
    createLiteral: function createLiteral(token8557) {
        var object8558 = {
            type: Syntax8222.Literal,
            value: token8557.value,
            raw: String(token8557.value)
        };
        if (token8557.regex) {
            object8558.regex = token8557.regex;
        }
        return object8558;
    },
    createMemberExpression: function createMemberExpression(accessor8559, object8560, property8561) {
        return {
            type: Syntax8222.MemberExpression,
            computed: accessor8559 === "[",
            object: object8560,
            property: property8561
        };
    },
    createNewExpression: function createNewExpression(callee8562, args8563) {
        return {
            type: Syntax8222.NewExpression,
            callee: callee8562,
            arguments: args8563
        };
    },
    createObjectExpression: function createObjectExpression(properties8564) {
        return {
            type: Syntax8222.ObjectExpression,
            properties: properties8564
        };
    },
    createPostfixExpression: function createPostfixExpression(operator8565, argument8566) {
        return {
            type: Syntax8222.UpdateExpression,
            operator: operator8565,
            argument: argument8566,
            prefix: false
        };
    },
    createProgram: function createProgram(body8567) {
        return {
            type: Syntax8222.Program,
            body: body8567
        };
    },
    createProperty: function createProperty(kind8568, key8569, value8570, method8571, shorthand8572, computed8573) {
        return {
            type: Syntax8222.Property,
            key: key8569,
            value: value8570,
            kind: kind8568,
            method: method8571,
            shorthand: shorthand8572,
            computed: computed8573
        };
    },
    createReturnStatement: function createReturnStatement(argument8574) {
        return {
            type: Syntax8222.ReturnStatement,
            argument: argument8574
        };
    },
    createSequenceExpression: function createSequenceExpression(expressions8575) {
        return {
            type: Syntax8222.SequenceExpression,
            expressions: expressions8575
        };
    },
    createSwitchCase: function createSwitchCase(test8576, consequent8577) {
        return {
            type: Syntax8222.SwitchCase,
            test: test8576,
            consequent: consequent8577
        };
    },
    createSwitchStatement: function createSwitchStatement(discriminant8578, cases8579) {
        return {
            type: Syntax8222.SwitchStatement,
            discriminant: discriminant8578,
            cases: cases8579
        };
    },
    createThisExpression: function createThisExpression() {
        return { type: Syntax8222.ThisExpression };
    },
    createThrowStatement: function createThrowStatement(argument8580) {
        return {
            type: Syntax8222.ThrowStatement,
            argument: argument8580
        };
    },
    createTryStatement: function createTryStatement(block8581, guardedHandlers8582, handlers8583, finalizer8584) {
        return {
            type: Syntax8222.TryStatement,
            block: block8581,
            guardedHandlers: guardedHandlers8582,
            handlers: handlers8583,
            finalizer: finalizer8584
        };
    },
    createUnaryExpression: function createUnaryExpression(operator8585, argument8586) {
        if (operator8585 === "++" || operator8585 === "--") {
            return {
                type: Syntax8222.UpdateExpression,
                operator: operator8585,
                argument: argument8586,
                prefix: true
            };
        }
        return {
            type: Syntax8222.UnaryExpression,
            operator: operator8585,
            argument: argument8586,
            prefix: true
        };
    },
    createVariableDeclaration: function createVariableDeclaration(declarations8587, kind8588) {
        return {
            type: Syntax8222.VariableDeclaration,
            declarations: declarations8587,
            kind: kind8588
        };
    },
    createVariableDeclarator: function createVariableDeclarator(id8589, init8590) {
        return {
            type: Syntax8222.VariableDeclarator,
            id: id8589,
            init: init8590
        };
    },
    createWhileStatement: function createWhileStatement(test8591, body8592) {
        return {
            type: Syntax8222.WhileStatement,
            test: test8591,
            body: body8592
        };
    },
    createWithStatement: function createWithStatement(object8593, body8594) {
        return {
            type: Syntax8222.WithStatement,
            object: object8593,
            body: body8594
        };
    },
    createTemplateElement: function createTemplateElement(value8595, tail8596) {
        return {
            type: Syntax8222.TemplateElement,
            value: value8595,
            tail: tail8596
        };
    },
    createTemplateLiteral: function createTemplateLiteral(quasis8597, expressions8598) {
        return {
            type: Syntax8222.TemplateLiteral,
            quasis: quasis8597,
            expressions: expressions8598
        };
    },
    createSpreadElement: function createSpreadElement(argument8599) {
        return {
            type: Syntax8222.SpreadElement,
            argument: argument8599
        };
    },
    createTaggedTemplateExpression: function createTaggedTemplateExpression(tag8600, quasi8601) {
        return {
            type: Syntax8222.TaggedTemplateExpression,
            tag: tag8600,
            quasi: quasi8601
        };
    },
    createArrowFunctionExpression: function createArrowFunctionExpression(params8602, defaults8603, body8604, rest8605, expression8606) {
        return {
            type: Syntax8222.ArrowFunctionExpression,
            id: null,
            params: params8602,
            defaults: defaults8603,
            body: body8604,
            rest: rest8605,
            generator: false,
            expression: expression8606
        };
    },
    createMethodDefinition: function createMethodDefinition(propertyType8607, kind8608, key8609, value8610) {
        return {
            type: Syntax8222.MethodDefinition,
            key: key8609,
            value: value8610,
            kind: kind8608,
            "static": propertyType8607 === ClassPropertyType8227["static"]
        };
    },
    createClassBody: function createClassBody(body8611) {
        return {
            type: Syntax8222.ClassBody,
            body: body8611
        };
    },
    createClassExpression: function createClassExpression(id8612, superClass8613, body8614) {
        return {
            type: Syntax8222.ClassExpression,
            id: id8612,
            superClass: superClass8613,
            body: body8614
        };
    },
    createClassDeclaration: function createClassDeclaration(id8615, superClass8616, body8617) {
        return {
            type: Syntax8222.ClassDeclaration,
            id: id8615,
            superClass: superClass8616,
            body: body8617
        };
    },
    createModuleSpecifier: function createModuleSpecifier(token8618) {
        return {
            type: Syntax8222.ModuleSpecifier,
            value: token8618.value,
            raw: token8618.value
        };
    },
    createExportSpecifier: function createExportSpecifier(id8619, name8620) {
        return {
            type: Syntax8222.ExportSpecifier,
            id: id8619,
            name: name8620
        };
    },
    createExportBatchSpecifier: function createExportBatchSpecifier() {
        return { type: Syntax8222.ExportBatchSpecifier };
    },
    createImportDefaultSpecifier: function createImportDefaultSpecifier(id8621) {
        return {
            type: Syntax8222.ImportDefaultSpecifier,
            id: id8621
        };
    },
    createImportNamespaceSpecifier: function createImportNamespaceSpecifier(id8622) {
        return {
            type: Syntax8222.ImportNamespaceSpecifier,
            id: id8622
        };
    },
    createExportDeclaration: function createExportDeclaration(isDefault8623, declaration8624, specifiers8625, source8626) {
        return {
            type: Syntax8222.ExportDeclaration,
            "default": !!isDefault8623,
            declaration: declaration8624,
            specifiers: specifiers8625,
            source: source8626
        };
    },
    createImportSpecifier: function createImportSpecifier(id8627, name8628) {
        return {
            type: Syntax8222.ImportSpecifier,
            id: id8627,
            name: name8628
        };
    },
    createImportDeclaration: function createImportDeclaration(specifiers8629, source8630) {
        return {
            type: Syntax8222.ImportDeclaration,
            specifiers: specifiers8629,
            source: source8630
        };
    },
    createYieldExpression: function createYieldExpression(argument8631, delegate8632) {
        return {
            type: Syntax8222.YieldExpression,
            argument: argument8631,
            delegate: delegate8632
        };
    },
    createComprehensionExpression: function createComprehensionExpression(filter8633, blocks8634, body8635) {
        return {
            type: Syntax8222.ComprehensionExpression,
            filter: filter8633,
            blocks: blocks8634,
            body: body8635
        };
    }
};
function peekLineTerminator8282() {
    return lookahead8241.lineNumber !== lineNumber8231;
}
function throwError8283(token8636, messageFormat8637) {
    var error8638,
        args8639 = Array.prototype.slice.call(arguments, 2),
        msg8640 = messageFormat8637.replace(/%(\d)/g, function (whole8644, index8645) {
        assert8246(index8645 < args8639.length, "Message reference must be in range");
        return args8639[index8645];
    });
    var startIndex8641 = streamIndex8240 > 3 ? streamIndex8240 - 3 : 0;
    var toks8642 = "",
        tailingMsg8643 = "";
    if (tokenStream8239) {
        toks8642 = tokenStream8239.slice(startIndex8641, streamIndex8240 + 3).map(function (stx8646) {
            return stx8646.token.value;
        }).join(" ");
        tailingMsg8643 = "\n[... " + toks8642 + " ...]";
    }
    if (typeof token8636.lineNumber === "number") {
        error8638 = new Error("Line " + token8636.lineNumber + ": " + msg8640 + tailingMsg8643);
        error8638.index = token8636.range[0];
        error8638.lineNumber = token8636.lineNumber;
        error8638.column = token8636.range[0] - lineStart8232 + 1;
    } else {
        error8638 = new Error("Line " + lineNumber8231 + ": " + msg8640 + tailingMsg8643);
        error8638.index = index8230;
        error8638.lineNumber = lineNumber8231;
        error8638.column = index8230 - lineStart8232 + 1;
    }
    error8638.description = msg8640;
    throw error8638;
}
function throwErrorTolerant8284() {
    try {
        throwError8283.apply(null, arguments);
    } catch (e8647) {
        if (extra8245.errors) {
            extra8245.errors.push(e8647);
        } else {
            throw e8647;
        }
    }
}
function throwUnexpected8285(token8648) {
    if (token8648.type === Token8219.EOF) {
        throwError8283(token8648, Messages8224.UnexpectedEOS);
    }
    if (token8648.type === Token8219.NumericLiteral) {
        throwError8283(token8648, Messages8224.UnexpectedNumber);
    }
    if (token8648.type === Token8219.StringLiteral) {
        throwError8283(token8648, Messages8224.UnexpectedString);
    }
    if (token8648.type === Token8219.Identifier) {
        throwError8283(token8648, Messages8224.UnexpectedIdentifier);
    }
    if (token8648.type === Token8219.Keyword) {
        if (isFutureReservedWord8255(token8648.value)) {} else if (strict8229 && isStrictModeReservedWord8256(token8648.value)) {
            throwErrorTolerant8284(token8648, Messages8224.StrictReservedWord);
            return;
        }
        throwError8283(token8648, Messages8224.UnexpectedToken, token8648.value);
    }
    if (token8648.type === Token8219.Template) {
        throwError8283(token8648, Messages8224.UnexpectedTemplate, token8648.value.raw);
    }
    // BooleanLiteral, NullLiteral, or Punctuator.
    throwError8283(token8648, Messages8224.UnexpectedToken, token8648.value);
}
function expect8286(value8649) {
    var token8650 = lex8276();
    if (token8650.type !== Token8219.Punctuator || token8650.value !== value8649) {
        throwUnexpected8285(token8650);
    }
}
function expectKeyword8287(keyword8651) {
    var token8652 = lex8276();
    if (token8652.type !== Token8219.Keyword || token8652.value !== keyword8651) {
        throwUnexpected8285(token8652);
    }
}
function match8288(value8653) {
    return lookahead8241.type === Token8219.Punctuator && lookahead8241.value === value8653;
}
function matchKeyword8289(keyword8654) {
    return lookahead8241.type === Token8219.Keyword && lookahead8241.value === keyword8654;
}
function matchContextualKeyword8290(keyword8655) {
    return lookahead8241.type === Token8219.Identifier && lookahead8241.value === keyword8655;
}
function matchAssign8291() {
    var op8656;
    if (lookahead8241.type !== Token8219.Punctuator) {
        return false;
    }
    op8656 = lookahead8241.value;
    return op8656 === "=" || op8656 === "*=" || op8656 === "/=" || op8656 === "%=" || op8656 === "+=" || op8656 === "-=" || op8656 === "<<=" || op8656 === ">>=" || op8656 === ">>>=" || op8656 === "&=" || op8656 === "^=" || op8656 === "|=";
}
function consumeSemicolon8292() {
    var line8657, ch8658;
    ch8658 = lookahead8241.value ? String(lookahead8241.value).charCodeAt(0) : -1;
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    ch8658 === 59) {
        lex8276();
        return;
    }
    if (lookahead8241.lineNumber !== lineNumber8231) {
        return;
    }
    if (match8288(";")) {
        lex8276();
        return;
    }
    if (lookahead8241.type !== Token8219.EOF && !match8288("}")) {
        throwUnexpected8285(lookahead8241);
    }
}
function isLeftHandSide8293(expr8659) {
    return expr8659.type === Syntax8222.Identifier || expr8659.type === Syntax8222.MemberExpression;
}
function isAssignableLeftHandSide8294(expr8660) {
    return isLeftHandSide8293(expr8660) || expr8660.type === Syntax8222.ObjectPattern || expr8660.type === Syntax8222.ArrayPattern;
}
function parseArrayInitialiser8295() {
    var elements8661 = [],
        blocks8662 = [],
        filter8663 = null,
        tmp8664,
        possiblecomprehension8665 = true,
        body8666,
        marker8667 = markerCreate8279();
    expect8286("[");
    while (!match8288("]")) {
        if (lookahead8241.value === "for" && lookahead8241.type === Token8219.Keyword) {
            if (!possiblecomprehension8665) {
                throwError8283({}, Messages8224.ComprehensionError);
            }
            matchKeyword8289("for");
            tmp8664 = parseForStatement8346({ ignoreBody: true });
            tmp8664.of = tmp8664.type === Syntax8222.ForOfStatement;
            tmp8664.type = Syntax8222.ComprehensionBlock;
            if (tmp8664.left.kind) {
                // can't be let or const
                throwError8283({}, Messages8224.ComprehensionError);
            }
            blocks8662.push(tmp8664);
        } else if (lookahead8241.value === "if" && lookahead8241.type === Token8219.Keyword) {
            if (!possiblecomprehension8665) {
                throwError8283({}, Messages8224.ComprehensionError);
            }
            expectKeyword8287("if");
            expect8286("(");
            filter8663 = parseExpression8323();
            expect8286(")");
        } else if (lookahead8241.value === "," && lookahead8241.type === Token8219.Punctuator) {
            possiblecomprehension8665 = false;
            // no longer allowed.
            lex8276();
            elements8661.push(null);
        } else {
            tmp8664 = parseSpreadOrAssignmentExpression8306();
            elements8661.push(tmp8664);
            if (tmp8664 && tmp8664.type === Syntax8222.SpreadElement) {
                if (!match8288("]")) {
                    throwError8283({}, Messages8224.ElementAfterSpreadElement);
                }
            } else if (!(match8288("]") || matchKeyword8289("for") || matchKeyword8289("if"))) {
                expect8286(",");
                // this lexes.
                possiblecomprehension8665 = false;
            }
        }
    }
    expect8286("]");
    if (filter8663 && !blocks8662.length) {
        throwError8283({}, Messages8224.ComprehensionRequiresBlock);
    }
    if (blocks8662.length) {
        if (elements8661.length !== 1) {
            throwError8283({}, Messages8224.ComprehensionError);
        }
        return markerApply8281(marker8667, delegate8238.createComprehensionExpression(filter8663, blocks8662, elements8661[0]));
    }
    return markerApply8281(marker8667, delegate8238.createArrayExpression(elements8661));
}
function parsePropertyFunction8296(options8668) {
    var previousStrict8669,
        previousYieldAllowed8670,
        params8671,
        defaults8672,
        body8673,
        marker8674 = markerCreate8279();
    previousStrict8669 = strict8229;
    previousYieldAllowed8670 = state8243.yieldAllowed;
    state8243.yieldAllowed = options8668.generator;
    params8671 = options8668.params || [];
    defaults8672 = options8668.defaults || [];
    body8673 = parseConciseBody8358();
    if (options8668.name && strict8229 && isRestrictedWord8257(params8671[0].name)) {
        throwErrorTolerant8284(options8668.name, Messages8224.StrictParamName);
    }
    strict8229 = previousStrict8669;
    state8243.yieldAllowed = previousYieldAllowed8670;
    return markerApply8281(marker8674, delegate8238.createFunctionExpression(null, params8671, defaults8672, body8673, options8668.rest || null, options8668.generator, body8673.type !== Syntax8222.BlockStatement));
}
function parsePropertyMethodFunction8297(options8675) {
    var previousStrict8676, tmp8677, method8678;
    previousStrict8676 = strict8229;
    strict8229 = true;
    tmp8677 = parseParams8362();
    if (tmp8677.stricted) {
        throwErrorTolerant8284(tmp8677.stricted, tmp8677.message);
    }
    method8678 = parsePropertyFunction8296({
        params: tmp8677.params,
        defaults: tmp8677.defaults,
        rest: tmp8677.rest,
        generator: options8675.generator
    });
    strict8229 = previousStrict8676;
    return method8678;
}
function parseObjectPropertyKey8298() {
    var marker8679 = markerCreate8279(),
        token8680 = lex8276(),
        propertyKey8681,
        result8682;
    if ( // Note: This function is called only from parseObjectProperty(), where
    // EOF and Punctuator tokens are already filtered out.
    token8680.type === Token8219.StringLiteral || token8680.type === Token8219.NumericLiteral) {
        if (strict8229 && token8680.octal) {
            throwErrorTolerant8284(token8680, Messages8224.StrictOctalLiteral);
        }
        return markerApply8281(marker8679, delegate8238.createLiteral(token8680));
    }
    if (token8680.type === Token8219.Punctuator && token8680.value === "[") {
        // For computed properties we should skip the [ and ], and
        // capture in marker only the assignment expression itself.
        marker8679 = markerCreate8279();
        propertyKey8681 = parseAssignmentExpression8322();
        result8682 = markerApply8281(marker8679, propertyKey8681);
        expect8286("]");
        return result8682;
    }
    return markerApply8281(marker8679, delegate8238.createIdentifier(token8680.value));
}
function parseObjectProperty8299() {
    var token8683,
        key8684,
        id8685,
        value8686,
        param8687,
        expr8688,
        computed8689,
        marker8690 = markerCreate8279();
    token8683 = lookahead8241;
    computed8689 = token8683.value === "[" && token8683.type === Token8219.Punctuator;
    if (token8683.type === Token8219.Identifier || computed8689) {
        id8685 = parseObjectPropertyKey8298();
        if ( // Property Assignment: Getter and Setter.
        token8683.value === "get" && !(match8288(":") || match8288("("))) {
            computed8689 = lookahead8241.value === "[";
            key8684 = parseObjectPropertyKey8298();
            expect8286("(");
            expect8286(")");
            return markerApply8281(marker8690, delegate8238.createProperty("get", key8684, parsePropertyFunction8296({ generator: false }), false, false, computed8689));
        }
        if (token8683.value === "set" && !(match8288(":") || match8288("("))) {
            computed8689 = lookahead8241.value === "[";
            key8684 = parseObjectPropertyKey8298();
            expect8286("(");
            token8683 = lookahead8241;
            param8687 = [parseVariableIdentifier8326()];
            expect8286(")");
            return markerApply8281(marker8690, delegate8238.createProperty("set", key8684, parsePropertyFunction8296({
                params: param8687,
                generator: false,
                name: token8683
            }), false, false, computed8689));
        }
        if (match8288(":")) {
            lex8276();
            return markerApply8281(marker8690, delegate8238.createProperty("init", id8685, parseAssignmentExpression8322(), false, false, computed8689));
        }
        if (match8288("(")) {
            return markerApply8281(marker8690, delegate8238.createProperty("init", id8685, parsePropertyMethodFunction8297({ generator: false }), true, false, computed8689));
        }
        if (computed8689) {
            // Computed properties can only be used with full notation.
            throwUnexpected8285(lookahead8241);
        }
        return markerApply8281(marker8690, delegate8238.createProperty("init", id8685, id8685, false, true, false));
    }
    if (token8683.type === Token8219.EOF || token8683.type === Token8219.Punctuator) {
        if (!match8288("*")) {
            throwUnexpected8285(token8683);
        }
        lex8276();
        computed8689 = lookahead8241.type === Token8219.Punctuator && lookahead8241.value === "[";
        id8685 = parseObjectPropertyKey8298();
        if (!match8288("(")) {
            throwUnexpected8285(lex8276());
        }
        return markerApply8281(marker8690, delegate8238.createProperty("init", id8685, parsePropertyMethodFunction8297({ generator: true }), true, false, computed8689));
    }
    key8684 = parseObjectPropertyKey8298();
    if (match8288(":")) {
        lex8276();
        return markerApply8281(marker8690, delegate8238.createProperty("init", key8684, parseAssignmentExpression8322(), false, false, false));
    }
    if (match8288("(")) {
        return markerApply8281(marker8690, delegate8238.createProperty("init", key8684, parsePropertyMethodFunction8297({ generator: false }), true, false, false));
    }
    throwUnexpected8285(lex8276());
}
function parseObjectInitialiser8300() {
    var properties8691 = [],
        property8692,
        name8693,
        key8694,
        kind8695,
        map8696 = {},
        toString8697 = String,
        marker8698 = markerCreate8279();
    expect8286("{");
    while (!match8288("}")) {
        property8692 = parseObjectProperty8299();
        if (property8692.key.type === Syntax8222.Identifier) {
            name8693 = property8692.key.name;
        } else {
            name8693 = toString8697(property8692.key.value);
        }
        kind8695 = property8692.kind === "init" ? PropertyKind8223.Data : property8692.kind === "get" ? PropertyKind8223.Get : PropertyKind8223.Set;
        key8694 = "$" + name8693;
        if (Object.prototype.hasOwnProperty.call(map8696, key8694)) {
            if (map8696[key8694] === PropertyKind8223.Data) {
                if (strict8229 && kind8695 === PropertyKind8223.Data) {
                    throwErrorTolerant8284({}, Messages8224.StrictDuplicateProperty);
                } else if (kind8695 !== PropertyKind8223.Data) {
                    throwErrorTolerant8284({}, Messages8224.AccessorDataProperty);
                }
            } else {
                if (kind8695 === PropertyKind8223.Data) {
                    throwErrorTolerant8284({}, Messages8224.AccessorDataProperty);
                } else if (map8696[key8694] & kind8695) {
                    throwErrorTolerant8284({}, Messages8224.AccessorGetSet);
                }
            }
            map8696[key8694] |= kind8695;
        } else {
            map8696[key8694] = kind8695;
        }
        properties8691.push(property8692);
        if (!match8288("}")) {
            expect8286(",");
        }
    }
    expect8286("}");
    return markerApply8281(marker8698, delegate8238.createObjectExpression(properties8691));
}
function parseTemplateElement8301(option8699) {
    var marker8700 = markerCreate8279(),
        token8701 = lex8276();
    if (strict8229 && token8701.octal) {
        throwError8283(token8701, Messages8224.StrictOctalLiteral);
    }
    return markerApply8281(marker8700, delegate8238.createTemplateElement({
        raw: token8701.value.raw,
        cooked: token8701.value.cooked
    }, token8701.tail));
}
function parseTemplateLiteral8302() {
    var quasi8702,
        quasis8703,
        expressions8704,
        marker8705 = markerCreate8279();
    quasi8702 = parseTemplateElement8301({ head: true });
    quasis8703 = [quasi8702];
    expressions8704 = [];
    while (!quasi8702.tail) {
        expressions8704.push(parseExpression8323());
        quasi8702 = parseTemplateElement8301({ head: false });
        quasis8703.push(quasi8702);
    }
    return markerApply8281(marker8705, delegate8238.createTemplateLiteral(quasis8703, expressions8704));
}
function parseGroupExpression8303() {
    var expr8706;
    expect8286("(");
    ++state8243.parenthesizedCount;
    expr8706 = parseExpression8323();
    expect8286(")");
    return expr8706;
}
function parsePrimaryExpression8304() {
    var type8707, token8708, resolvedIdent8709, marker8710, expr8711;
    token8708 = lookahead8241;
    type8707 = lookahead8241.type;
    if (type8707 === Token8219.Identifier) {
        marker8710 = markerCreate8279();
        resolvedIdent8709 = expander8218.resolve(tokenStream8239[lookaheadIndex8242], phase8244);
        lex8276();
        return markerApply8281(marker8710, delegate8238.createIdentifier(resolvedIdent8709));
    }
    if (type8707 === Token8219.StringLiteral || type8707 === Token8219.NumericLiteral) {
        if (strict8229 && lookahead8241.octal) {
            throwErrorTolerant8284(lookahead8241, Messages8224.StrictOctalLiteral);
        }
        marker8710 = markerCreate8279();
        return markerApply8281(marker8710, delegate8238.createLiteral(lex8276()));
    }
    if (type8707 === Token8219.Keyword) {
        if (matchKeyword8289("this")) {
            marker8710 = markerCreate8279();
            lex8276();
            return markerApply8281(marker8710, delegate8238.createThisExpression());
        }
        if (matchKeyword8289("function")) {
            return parseFunctionExpression8364();
        }
        if (matchKeyword8289("class")) {
            return parseClassExpression8369();
        }
        if (matchKeyword8289("super")) {
            marker8710 = markerCreate8279();
            lex8276();
            return markerApply8281(marker8710, delegate8238.createIdentifier("super"));
        }
    }
    if (type8707 === Token8219.BooleanLiteral) {
        marker8710 = markerCreate8279();
        token8708 = lex8276();
        if (typeof token8708.value !== "boolean") {
            assert8246(token8708.value === "true" || token8708.value === "false", "exporting either true or false as a string not: " + token8708.value);
            token8708.value = token8708.value === "true";
        }
        return markerApply8281(marker8710, delegate8238.createLiteral(token8708));
    }
    if (type8707 === Token8219.NullLiteral) {
        marker8710 = markerCreate8279();
        token8708 = lex8276();
        token8708.value = null;
        return markerApply8281(marker8710, delegate8238.createLiteral(token8708));
    }
    if (match8288("[")) {
        return parseArrayInitialiser8295();
    }
    if (match8288("{")) {
        return parseObjectInitialiser8300();
    }
    if (match8288("(")) {
        return parseGroupExpression8303();
    }
    if (lookahead8241.type === Token8219.RegularExpression) {
        marker8710 = markerCreate8279();
        return markerApply8281(marker8710, delegate8238.createLiteral(lex8276()));
    }
    if (type8707 === Token8219.Template) {
        return parseTemplateLiteral8302();
    }
    throwUnexpected8285(lex8276());
}
function parseArguments8305() {
    var args8712 = [],
        arg8713;
    expect8286("(");
    if (!match8288(")")) {
        while (streamIndex8240 < length8237) {
            arg8713 = parseSpreadOrAssignmentExpression8306();
            args8712.push(arg8713);
            if (match8288(")")) {
                break;
            } else if (arg8713.type === Syntax8222.SpreadElement) {
                throwError8283({}, Messages8224.ElementAfterSpreadElement);
            }
            expect8286(",");
        }
    }
    expect8286(")");
    return args8712;
}
function parseSpreadOrAssignmentExpression8306() {
    if (match8288("...")) {
        var marker8714 = markerCreate8279();
        lex8276();
        return markerApply8281(marker8714, delegate8238.createSpreadElement(parseAssignmentExpression8322()));
    }
    return parseAssignmentExpression8322();
}
function parseNonComputedProperty8307(toResolve8715) {
    var marker8716 = markerCreate8279(),
        resolvedIdent8717,
        token8718;
    if (toResolve8715) {
        resolvedIdent8717 = expander8218.resolve(tokenStream8239[lookaheadIndex8242], phase8244);
    }
    token8718 = lex8276();
    resolvedIdent8717 = toResolve8715 ? resolvedIdent8717 : token8718.value;
    if (!isIdentifierName8273(token8718)) {
        throwUnexpected8285(token8718);
    }
    return markerApply8281(marker8716, delegate8238.createIdentifier(resolvedIdent8717));
}
function parseNonComputedMember8308() {
    expect8286(".");
    return parseNonComputedProperty8307();
}
function parseComputedMember8309() {
    var expr8719;
    expect8286("[");
    expr8719 = parseExpression8323();
    expect8286("]");
    return expr8719;
}
function parseNewExpression8310() {
    var callee8720,
        args8721,
        marker8722 = markerCreate8279();
    expectKeyword8287("new");
    callee8720 = parseLeftHandSideExpression8312();
    args8721 = match8288("(") ? parseArguments8305() : [];
    return markerApply8281(marker8722, delegate8238.createNewExpression(callee8720, args8721));
}
function parseLeftHandSideExpressionAllowCall8311() {
    var expr8723,
        args8724,
        marker8725 = markerCreate8279();
    expr8723 = matchKeyword8289("new") ? parseNewExpression8310() : parsePrimaryExpression8304();
    while (match8288(".") || match8288("[") || match8288("(") || lookahead8241.type === Token8219.Template) {
        if (match8288("(")) {
            args8724 = parseArguments8305();
            expr8723 = markerApply8281(marker8725, delegate8238.createCallExpression(expr8723, args8724));
        } else if (match8288("[")) {
            expr8723 = markerApply8281(marker8725, delegate8238.createMemberExpression("[", expr8723, parseComputedMember8309()));
        } else if (match8288(".")) {
            expr8723 = markerApply8281(marker8725, delegate8238.createMemberExpression(".", expr8723, parseNonComputedMember8308()));
        } else {
            expr8723 = markerApply8281(marker8725, delegate8238.createTaggedTemplateExpression(expr8723, parseTemplateLiteral8302()));
        }
    }
    return expr8723;
}
function parseLeftHandSideExpression8312() {
    var expr8726,
        marker8727 = markerCreate8279();
    expr8726 = matchKeyword8289("new") ? parseNewExpression8310() : parsePrimaryExpression8304();
    while (match8288(".") || match8288("[") || lookahead8241.type === Token8219.Template) {
        if (match8288("[")) {
            expr8726 = markerApply8281(marker8727, delegate8238.createMemberExpression("[", expr8726, parseComputedMember8309()));
        } else if (match8288(".")) {
            expr8726 = markerApply8281(marker8727, delegate8238.createMemberExpression(".", expr8726, parseNonComputedMember8308()));
        } else {
            expr8726 = markerApply8281(marker8727, delegate8238.createTaggedTemplateExpression(expr8726, parseTemplateLiteral8302()));
        }
    }
    return expr8726;
}
function parsePostfixExpression8313() {
    var marker8728 = markerCreate8279(),
        expr8729 = parseLeftHandSideExpressionAllowCall8311(),
        token8730;
    if (lookahead8241.type !== Token8219.Punctuator) {
        return expr8729;
    }
    if ((match8288("++") || match8288("--")) && !peekLineTerminator8282()) {
        if ( // 11.3.1, 11.3.2
        strict8229 && expr8729.type === Syntax8222.Identifier && isRestrictedWord8257(expr8729.name)) {
            throwErrorTolerant8284({}, Messages8224.StrictLHSPostfix);
        }
        if (!isLeftHandSide8293(expr8729)) {
            throwError8283({}, Messages8224.InvalidLHSInAssignment);
        }
        token8730 = lex8276();
        expr8729 = markerApply8281(marker8728, delegate8238.createPostfixExpression(token8730.value, expr8729));
    }
    return expr8729;
}
function parseUnaryExpression8314() {
    var marker8731, token8732, expr8733;
    if (lookahead8241.type !== Token8219.Punctuator && lookahead8241.type !== Token8219.Keyword) {
        return parsePostfixExpression8313();
    }
    if (match8288("++") || match8288("--")) {
        marker8731 = markerCreate8279();
        token8732 = lex8276();
        expr8733 = parseUnaryExpression8314();
        if ( // 11.4.4, 11.4.5
        strict8229 && expr8733.type === Syntax8222.Identifier && isRestrictedWord8257(expr8733.name)) {
            throwErrorTolerant8284({}, Messages8224.StrictLHSPrefix);
        }
        if (!isLeftHandSide8293(expr8733)) {
            throwError8283({}, Messages8224.InvalidLHSInAssignment);
        }
        return markerApply8281(marker8731, delegate8238.createUnaryExpression(token8732.value, expr8733));
    }
    if (match8288("+") || match8288("-") || match8288("~") || match8288("!")) {
        marker8731 = markerCreate8279();
        token8732 = lex8276();
        expr8733 = parseUnaryExpression8314();
        return markerApply8281(marker8731, delegate8238.createUnaryExpression(token8732.value, expr8733));
    }
    if (matchKeyword8289("delete") || matchKeyword8289("void") || matchKeyword8289("typeof")) {
        marker8731 = markerCreate8279();
        token8732 = lex8276();
        expr8733 = parseUnaryExpression8314();
        expr8733 = markerApply8281(marker8731, delegate8238.createUnaryExpression(token8732.value, expr8733));
        if (strict8229 && expr8733.operator === "delete" && expr8733.argument.type === Syntax8222.Identifier) {
            throwErrorTolerant8284({}, Messages8224.StrictDelete);
        }
        return expr8733;
    }
    return parsePostfixExpression8313();
}
function binaryPrecedence8315(token8734, allowIn8735) {
    var prec8736 = 0;
    if (token8734.type !== Token8219.Punctuator && token8734.type !== Token8219.Keyword) {
        return 0;
    }
    switch (token8734.value) {
        case "||":
            prec8736 = 1;
            break;
        case "&&":
            prec8736 = 2;
            break;
        case "|":
            prec8736 = 3;
            break;
        case "^":
            prec8736 = 4;
            break;
        case "&":
            prec8736 = 5;
            break;
        case "==":
        case "!=":
        case "===":
        case "!==":
            prec8736 = 6;
            break;
        case "<":
        case ">":
        case "<=":
        case ">=":
        case "instanceof":
            prec8736 = 7;
            break;
        case "in":
            prec8736 = allowIn8735 ? 7 : 0;
            break;
        case "<<":
        case ">>":
        case ">>>":
            prec8736 = 8;
            break;
        case "+":
        case "-":
            prec8736 = 9;
            break;
        case "*":
        case "/":
        case "%":
            prec8736 = 11;
            break;
        default:
            break;
    }
    return prec8736;
}
function parseBinaryExpression8316() {
    var expr8737, token8738, prec8739, previousAllowIn8740, stack8741, right8742, operator8743, left8744, i8745, marker8746, markers8747;
    previousAllowIn8740 = state8243.allowIn;
    state8243.allowIn = true;
    marker8746 = markerCreate8279();
    left8744 = parseUnaryExpression8314();
    token8738 = lookahead8241;
    prec8739 = binaryPrecedence8315(token8738, previousAllowIn8740);
    if (prec8739 === 0) {
        return left8744;
    }
    token8738.prec = prec8739;
    lex8276();
    markers8747 = [marker8746, markerCreate8279()];
    right8742 = parseUnaryExpression8314();
    stack8741 = [left8744, token8738, right8742];
    while ((prec8739 = binaryPrecedence8315(lookahead8241, previousAllowIn8740)) > 0) {
        while ( // Reduce: make a binary expression from the three topmost entries.
        stack8741.length > 2 && prec8739 <= stack8741[stack8741.length - 2].prec) {
            right8742 = stack8741.pop();
            operator8743 = stack8741.pop().value;
            left8744 = stack8741.pop();
            expr8737 = delegate8238.createBinaryExpression(operator8743, left8744, right8742);
            markers8747.pop();
            marker8746 = markers8747.pop();
            markerApply8281(marker8746, expr8737);
            stack8741.push(expr8737);
            markers8747.push(marker8746);
        }
        // Shift.
        token8738 = lex8276();
        token8738.prec = prec8739;
        stack8741.push(token8738);
        markers8747.push(markerCreate8279());
        expr8737 = parseUnaryExpression8314();
        stack8741.push(expr8737);
    }
    state8243.allowIn = previousAllowIn8740;
    // Final reduce to clean-up the stack.
    i8745 = stack8741.length - 1;
    expr8737 = stack8741[i8745];
    markers8747.pop();
    while (i8745 > 1) {
        expr8737 = delegate8238.createBinaryExpression(stack8741[i8745 - 1].value, stack8741[i8745 - 2], expr8737);
        i8745 -= 2;
        marker8746 = markers8747.pop();
        markerApply8281(marker8746, expr8737);
    }
    return expr8737;
}
function parseConditionalExpression8317() {
    var expr8748,
        previousAllowIn8749,
        consequent8750,
        alternate8751,
        marker8752 = markerCreate8279();
    expr8748 = parseBinaryExpression8316();
    if (match8288("?")) {
        lex8276();
        previousAllowIn8749 = state8243.allowIn;
        state8243.allowIn = true;
        consequent8750 = parseAssignmentExpression8322();
        state8243.allowIn = previousAllowIn8749;
        expect8286(":");
        alternate8751 = parseAssignmentExpression8322();
        expr8748 = markerApply8281(marker8752, delegate8238.createConditionalExpression(expr8748, consequent8750, alternate8751));
    }
    return expr8748;
}
function reinterpretAsAssignmentBindingPattern8318(expr8753) {
    var i8754, len8755, property8756, element8757;
    if (expr8753.type === Syntax8222.ObjectExpression) {
        expr8753.type = Syntax8222.ObjectPattern;
        for (i8754 = 0, len8755 = expr8753.properties.length; i8754 < len8755; i8754 += 1) {
            property8756 = expr8753.properties[i8754];
            if (property8756.kind !== "init") {
                throwError8283({}, Messages8224.InvalidLHSInAssignment);
            }
            reinterpretAsAssignmentBindingPattern8318(property8756.value);
        }
    } else if (expr8753.type === Syntax8222.ArrayExpression) {
        expr8753.type = Syntax8222.ArrayPattern;
        for (i8754 = 0, len8755 = expr8753.elements.length; i8754 < len8755; i8754 += 1) {
            element8757 = expr8753.elements[i8754];
            if (element8757) {
                reinterpretAsAssignmentBindingPattern8318(element8757);
            }
        }
    } else if (expr8753.type === Syntax8222.Identifier) {
        if (isRestrictedWord8257(expr8753.name)) {
            throwError8283({}, Messages8224.InvalidLHSInAssignment);
        }
    } else if (expr8753.type === Syntax8222.SpreadElement) {
        reinterpretAsAssignmentBindingPattern8318(expr8753.argument);
        if (expr8753.argument.type === Syntax8222.ObjectPattern) {
            throwError8283({}, Messages8224.ObjectPatternAsSpread);
        }
    } else {
        if (expr8753.type !== Syntax8222.MemberExpression && expr8753.type !== Syntax8222.CallExpression && expr8753.type !== Syntax8222.NewExpression) {
            throwError8283({}, Messages8224.InvalidLHSInAssignment);
        }
    }
}
function reinterpretAsDestructuredParameter8319(options8758, expr8759) {
    var i8760, len8761, property8762, element8763;
    if (expr8759.type === Syntax8222.ObjectExpression) {
        expr8759.type = Syntax8222.ObjectPattern;
        for (i8760 = 0, len8761 = expr8759.properties.length; i8760 < len8761; i8760 += 1) {
            property8762 = expr8759.properties[i8760];
            if (property8762.kind !== "init") {
                throwError8283({}, Messages8224.InvalidLHSInFormalsList);
            }
            reinterpretAsDestructuredParameter8319(options8758, property8762.value);
        }
    } else if (expr8759.type === Syntax8222.ArrayExpression) {
        expr8759.type = Syntax8222.ArrayPattern;
        for (i8760 = 0, len8761 = expr8759.elements.length; i8760 < len8761; i8760 += 1) {
            element8763 = expr8759.elements[i8760];
            if (element8763) {
                reinterpretAsDestructuredParameter8319(options8758, element8763);
            }
        }
    } else if (expr8759.type === Syntax8222.Identifier) {
        validateParam8360(options8758, expr8759, expr8759.name);
    } else {
        if (expr8759.type !== Syntax8222.MemberExpression) {
            throwError8283({}, Messages8224.InvalidLHSInFormalsList);
        }
    }
}
function reinterpretAsCoverFormalsList8320(expressions8764) {
    var i8765, len8766, param8767, params8768, defaults8769, defaultCount8770, options8771, rest8772;
    params8768 = [];
    defaults8769 = [];
    defaultCount8770 = 0;
    rest8772 = null;
    options8771 = { paramSet: {} };
    for (i8765 = 0, len8766 = expressions8764.length; i8765 < len8766; i8765 += 1) {
        param8767 = expressions8764[i8765];
        if (param8767.type === Syntax8222.Identifier) {
            params8768.push(param8767);
            defaults8769.push(null);
            validateParam8360(options8771, param8767, param8767.name);
        } else if (param8767.type === Syntax8222.ObjectExpression || param8767.type === Syntax8222.ArrayExpression) {
            reinterpretAsDestructuredParameter8319(options8771, param8767);
            params8768.push(param8767);
            defaults8769.push(null);
        } else if (param8767.type === Syntax8222.SpreadElement) {
            assert8246(i8765 === len8766 - 1, "It is guaranteed that SpreadElement is last element by parseExpression");
            reinterpretAsDestructuredParameter8319(options8771, param8767.argument);
            rest8772 = param8767.argument;
        } else if (param8767.type === Syntax8222.AssignmentExpression) {
            params8768.push(param8767.left);
            defaults8769.push(param8767.right);
            ++defaultCount8770;
            validateParam8360(options8771, param8767.left, param8767.left.name);
        } else {
            return null;
        }
    }
    if (options8771.message === Messages8224.StrictParamDupe) {
        throwError8283(strict8229 ? options8771.stricted : options8771.firstRestricted, options8771.message);
    }
    if (defaultCount8770 === 0) {
        defaults8769 = [];
    }
    return {
        params: params8768,
        defaults: defaults8769,
        rest: rest8772,
        stricted: options8771.stricted,
        firstRestricted: options8771.firstRestricted,
        message: options8771.message
    };
}
function parseArrowFunctionExpression8321(options8773, marker8774) {
    var previousStrict8775, previousYieldAllowed8776, body8777;
    expect8286("=>");
    previousStrict8775 = strict8229;
    previousYieldAllowed8776 = state8243.yieldAllowed;
    state8243.yieldAllowed = false;
    body8777 = parseConciseBody8358();
    if (strict8229 && options8773.firstRestricted) {
        throwError8283(options8773.firstRestricted, options8773.message);
    }
    if (strict8229 && options8773.stricted) {
        throwErrorTolerant8284(options8773.stricted, options8773.message);
    }
    strict8229 = previousStrict8775;
    state8243.yieldAllowed = previousYieldAllowed8776;
    return markerApply8281(marker8774, delegate8238.createArrowFunctionExpression(options8773.params, options8773.defaults, body8777, options8773.rest, body8777.type !== Syntax8222.BlockStatement));
}
function parseAssignmentExpression8322() {
    var marker8778, expr8779, token8780, params8781, oldParenthesizedCount8782;
    if ( // Note that 'yield' is treated as a keyword in strict mode, but a
    // contextual keyword (identifier) in non-strict mode, so we need
    // to use matchKeyword and matchContextualKeyword appropriately.
    state8243.yieldAllowed && matchContextualKeyword8290("yield") || strict8229 && matchKeyword8289("yield")) {
        return parseYieldExpression8365();
    }
    oldParenthesizedCount8782 = state8243.parenthesizedCount;
    marker8778 = markerCreate8279();
    if (match8288("(")) {
        token8780 = lookahead28278();
        if (token8780.type === Token8219.Punctuator && token8780.value === ")" || token8780.value === "...") {
            params8781 = parseParams8362();
            if (!match8288("=>")) {
                throwUnexpected8285(lex8276());
            }
            return parseArrowFunctionExpression8321(params8781, marker8778);
        }
    }
    token8780 = lookahead8241;
    expr8779 = parseConditionalExpression8317();
    if (match8288("=>") && (state8243.parenthesizedCount === oldParenthesizedCount8782 || state8243.parenthesizedCount === oldParenthesizedCount8782 + 1)) {
        if (expr8779.type === Syntax8222.Identifier) {
            params8781 = reinterpretAsCoverFormalsList8320([expr8779]);
        } else if (expr8779.type === Syntax8222.SequenceExpression) {
            params8781 = reinterpretAsCoverFormalsList8320(expr8779.expressions);
        }
        if (params8781) {
            return parseArrowFunctionExpression8321(params8781, marker8778);
        }
    }
    if (matchAssign8291()) {
        if ( // 11.13.1
        strict8229 && expr8779.type === Syntax8222.Identifier && isRestrictedWord8257(expr8779.name)) {
            throwErrorTolerant8284(token8780, Messages8224.StrictLHSAssignment);
        }
        if ( // ES.next draf 11.13 Runtime Semantics step 1
        match8288("=") && (expr8779.type === Syntax8222.ObjectExpression || expr8779.type === Syntax8222.ArrayExpression)) {
            reinterpretAsAssignmentBindingPattern8318(expr8779);
        } else if (!isLeftHandSide8293(expr8779)) {
            throwError8283({}, Messages8224.InvalidLHSInAssignment);
        }
        expr8779 = markerApply8281(marker8778, delegate8238.createAssignmentExpression(lex8276().value, expr8779, parseAssignmentExpression8322()));
    }
    return expr8779;
}
function parseExpression8323() {
    var marker8783, expr8784, expressions8785, sequence8786, coverFormalsList8787, spreadFound8788, oldParenthesizedCount8789;
    oldParenthesizedCount8789 = state8243.parenthesizedCount;
    marker8783 = markerCreate8279();
    expr8784 = parseAssignmentExpression8322();
    expressions8785 = [expr8784];
    if (match8288(",")) {
        while (streamIndex8240 < length8237) {
            if (!match8288(",")) {
                break;
            }
            lex8276();
            expr8784 = parseSpreadOrAssignmentExpression8306();
            expressions8785.push(expr8784);
            if (expr8784.type === Syntax8222.SpreadElement) {
                spreadFound8788 = true;
                if (!match8288(")")) {
                    throwError8283({}, Messages8224.ElementAfterSpreadElement);
                }
                break;
            }
        }
        sequence8786 = markerApply8281(marker8783, delegate8238.createSequenceExpression(expressions8785));
    }
    if (match8288("=>")) {
        if ( // Do not allow nested parentheses on the LHS of the =>.
        state8243.parenthesizedCount === oldParenthesizedCount8789 || state8243.parenthesizedCount === oldParenthesizedCount8789 + 1) {
            expr8784 = expr8784.type === Syntax8222.SequenceExpression ? expr8784.expressions : expressions8785;
            coverFormalsList8787 = reinterpretAsCoverFormalsList8320(expr8784);
            if (coverFormalsList8787) {
                return parseArrowFunctionExpression8321(coverFormalsList8787, marker8783);
            }
        }
        throwUnexpected8285(lex8276());
    }
    if (spreadFound8788 && lookahead28278().value !== "=>") {
        throwError8283({}, Messages8224.IllegalSpread);
    }
    return sequence8786 || expr8784;
}
function parseStatementList8324() {
    var list8790 = [],
        statement8791;
    while (streamIndex8240 < length8237) {
        if (match8288("}")) {
            break;
        }
        statement8791 = parseSourceElement8371();
        if (typeof statement8791 === "undefined") {
            break;
        }
        list8790.push(statement8791);
    }
    return list8790;
}
function parseBlock8325() {
    var block8792,
        marker8793 = markerCreate8279();
    expect8286("{");
    block8792 = parseStatementList8324();
    expect8286("}");
    return markerApply8281(marker8793, delegate8238.createBlockStatement(block8792));
}
function parseVariableIdentifier8326() {
    var token8794 = lookahead8241,
        resolvedIdent8795,
        marker8796 = markerCreate8279();
    if (token8794.type !== Token8219.Identifier) {
        throwUnexpected8285(token8794);
    }
    resolvedIdent8795 = expander8218.resolve(tokenStream8239[lookaheadIndex8242], phase8244);
    lex8276();
    return markerApply8281(marker8796, delegate8238.createIdentifier(resolvedIdent8795));
}
function parseVariableDeclaration8327(kind8797) {
    var id8798,
        marker8799 = markerCreate8279(),
        init8800 = null;
    if (match8288("{")) {
        id8798 = parseObjectInitialiser8300();
        reinterpretAsAssignmentBindingPattern8318(id8798);
    } else if (match8288("[")) {
        id8798 = parseArrayInitialiser8295();
        reinterpretAsAssignmentBindingPattern8318(id8798);
    } else {
        id8798 = state8243.allowKeyword ? parseNonComputedProperty8307() : parseVariableIdentifier8326();
        if ( // 12.2.1
        strict8229 && isRestrictedWord8257(id8798.name)) {
            throwErrorTolerant8284({}, Messages8224.StrictVarName);
        }
    }
    if (kind8797 === "const") {
        if (!match8288("=")) {
            throwError8283({}, Messages8224.NoUnintializedConst);
        }
        expect8286("=");
        init8800 = parseAssignmentExpression8322();
    } else if (match8288("=")) {
        lex8276();
        init8800 = parseAssignmentExpression8322();
    }
    return markerApply8281(marker8799, delegate8238.createVariableDeclarator(id8798, init8800));
}
function parseVariableDeclarationList8328(kind8801) {
    var list8802 = [];
    do {
        list8802.push(parseVariableDeclaration8327(kind8801));
        if (!match8288(",")) {
            break;
        }
        lex8276();
    } while (streamIndex8240 < length8237);
    return list8802;
}
function parseVariableStatement8329() {
    var declarations8803,
        marker8804 = markerCreate8279();
    expectKeyword8287("var");
    declarations8803 = parseVariableDeclarationList8328();
    consumeSemicolon8292();
    return markerApply8281(marker8804, delegate8238.createVariableDeclaration(declarations8803, "var"));
}
function parseConstLetDeclaration8330(kind8805) {
    var declarations8806,
        marker8807 = markerCreate8279();
    expectKeyword8287(kind8805);
    declarations8806 = parseVariableDeclarationList8328(kind8805);
    consumeSemicolon8292();
    return markerApply8281(marker8807, delegate8238.createVariableDeclaration(declarations8806, kind8805));
}
function parseModuleSpecifier8331() {
    var marker8808 = markerCreate8279(),
        specifier8809;
    if (lookahead8241.type !== Token8219.StringLiteral) {
        throwError8283({}, Messages8224.InvalidModuleSpecifier);
    }
    specifier8809 = delegate8238.createModuleSpecifier(lookahead8241);
    lex8276();
    return markerApply8281(marker8808, specifier8809);
}
function parseExportBatchSpecifier8332() {
    var marker8810 = markerCreate8279();
    expect8286("*");
    return markerApply8281(marker8810, delegate8238.createExportBatchSpecifier());
}
function parseExportSpecifier8333() {
    var id8811,
        name8812 = null,
        marker8813 = markerCreate8279(),
        from8814;
    if (matchKeyword8289("default")) {
        lex8276();
        id8811 = markerApply8281(marker8813, delegate8238.createIdentifier("default"));
    } else {
        id8811 = parseVariableIdentifier8326();
    }
    if (matchContextualKeyword8290("as")) {
        lex8276();
        name8812 = parseNonComputedProperty8307();
    }
    return markerApply8281(marker8813, delegate8238.createExportSpecifier(id8811, name8812));
}
function parseExportDeclaration8334() {
    var backtrackToken8815,
        id8816,
        previousAllowKeyword8817,
        declaration8818 = null,
        isExportFromIdentifier8819,
        src8820 = null,
        specifiers8821 = [],
        marker8822 = markerCreate8279();
    function rewind8823(token8824) {
        index8230 = token8824.range[0];
        lineNumber8231 = token8824.lineNumber;
        lineStart8232 = token8824.lineStart;
        lookahead8241 = token8824;
    }
    expectKeyword8287("export");
    if (matchKeyword8289("default")) {
        // covers:
        // export default ...
        lex8276();
        if (matchKeyword8289("function") || matchKeyword8289("class")) {
            backtrackToken8815 = lookahead8241;
            lex8276();
            if (isIdentifierName8273(lookahead8241)) {
                // covers:
                // export default function foo () {}
                // export default class foo {}
                id8816 = parseNonComputedProperty8307();
                rewind8823(backtrackToken8815);
                return markerApply8281(marker8822, delegate8238.createExportDeclaration(true, parseSourceElement8371(), [id8816], null));
            }
            // covers:
            // export default function () {}
            // export default class {}
            rewind8823(backtrackToken8815);
            switch (lookahead8241.value) {
                case "class":
                    return markerApply8281(marker8822, delegate8238.createExportDeclaration(true, parseClassExpression8369(), [], null));
                case "function":
                    return markerApply8281(marker8822, delegate8238.createExportDeclaration(true, parseFunctionExpression8364(), [], null));
            }
        }
        if (matchContextualKeyword8290("from")) {
            throwError8283({}, Messages8224.UnexpectedToken, lookahead8241.value);
        }
        if ( // covers:
        // export default {};
        // export default [];
        match8288("{")) {
            declaration8818 = parseObjectInitialiser8300();
        } else if (match8288("[")) {
            declaration8818 = parseArrayInitialiser8295();
        } else {
            declaration8818 = parseAssignmentExpression8322();
        }
        consumeSemicolon8292();
        return markerApply8281(marker8822, delegate8238.createExportDeclaration(true, declaration8818, [], null));
    }
    if ( // non-default export
    lookahead8241.type === Token8219.Keyword) {
        switch ( // covers:
        // export var f = 1;
        lookahead8241.value) {
            case "let":
            case "const":
            case "var":
            case "class":
            case "function":
                return markerApply8281(marker8822, delegate8238.createExportDeclaration(false, parseSourceElement8371(), specifiers8821, null));
        }
    }
    if (match8288("*")) {
        // covers:
        // export * from "foo";
        specifiers8821.push(parseExportBatchSpecifier8332());
        if (!matchContextualKeyword8290("from")) {
            throwError8283({}, lookahead8241.value ? Messages8224.UnexpectedToken : Messages8224.MissingFromClause, lookahead8241.value);
        }
        lex8276();
        src8820 = parseModuleSpecifier8331();
        consumeSemicolon8292();
        return markerApply8281(marker8822, delegate8238.createExportDeclaration(false, null, specifiers8821, src8820));
    }
    expect8286("{");
    do {
        isExportFromIdentifier8819 = isExportFromIdentifier8819 || matchKeyword8289("default");
        specifiers8821.push(parseExportSpecifier8333());
    } while (match8288(",") && lex8276());
    expect8286("}");
    if (matchContextualKeyword8290("from")) {
        // covering:
        // export {default} from "foo";
        // export {foo} from "foo";
        lex8276();
        src8820 = parseModuleSpecifier8331();
        consumeSemicolon8292();
    } else if (isExportFromIdentifier8819) {
        // covering:
        // export {default}; // missing fromClause
        throwError8283({}, lookahead8241.value ? Messages8224.UnexpectedToken : Messages8224.MissingFromClause, lookahead8241.value);
    } else {
        consumeSemicolon8292();
    }
    return markerApply8281(marker8822, delegate8238.createExportDeclaration(false, declaration8818, specifiers8821, src8820));
}
function parseImportSpecifier8335() {
    var
    // import {<foo as bar>} ...;
    id8825,
        name8826 = null,
        marker8827 = markerCreate8279();
    id8825 = parseNonComputedProperty8307(true);
    if (matchContextualKeyword8290("as")) {
        lex8276();
        name8826 = parseVariableIdentifier8326();
    }
    return markerApply8281(marker8827, delegate8238.createImportSpecifier(id8825, name8826));
}
function parseNamedImports8336() {
    var specifiers8828 = [];
    // {foo, bar as bas}
    expect8286("{");
    do {
        specifiers8828.push(parseImportSpecifier8335());
    } while (match8288(",") && lex8276());
    expect8286("}");
    return specifiers8828;
}
function parseImportDefaultSpecifier8337() {
    var
    // import <foo> ...;
    id8829,
        marker8830 = markerCreate8279();
    id8829 = parseNonComputedProperty8307();
    return markerApply8281(marker8830, delegate8238.createImportDefaultSpecifier(id8829));
}
function parseImportNamespaceSpecifier8338() {
    var
    // import <* as foo> ...;
    id8831,
        marker8832 = markerCreate8279();
    expect8286("*");
    if (!matchContextualKeyword8290("as")) {
        throwError8283({}, Messages8224.NoAsAfterImportNamespace);
    }
    lex8276();
    id8831 = parseNonComputedProperty8307();
    return markerApply8281(marker8832, delegate8238.createImportNamespaceSpecifier(id8831));
}
function parseImportDeclaration8339() {
    var specifiers8833,
        src8834,
        marker8835 = markerCreate8279();
    expectKeyword8287("import");
    specifiers8833 = [];
    if (lookahead8241.type === Token8219.StringLiteral) {
        // covers:
        // import "foo";
        src8834 = parseModuleSpecifier8331();
        consumeSemicolon8292();
        return markerApply8281(marker8835, delegate8238.createImportDeclaration(specifiers8833, src8834));
    }
    if (!matchKeyword8289("default") && isIdentifierName8273(lookahead8241)) {
        // covers:
        // import foo
        // import foo, ...
        specifiers8833.push(parseImportDefaultSpecifier8337());
        if (match8288(",")) {
            lex8276();
        }
    }
    if (match8288("*")) {
        // covers:
        // import foo, * as foo
        // import * as foo
        specifiers8833.push(parseImportNamespaceSpecifier8338());
    } else if (match8288("{")) {
        // covers:
        // import foo, {bar}
        // import {bar}
        specifiers8833 = specifiers8833.concat(parseNamedImports8336());
    }
    if (!matchContextualKeyword8290("from")) {
        throwError8283({}, lookahead8241.value ? Messages8224.UnexpectedToken : Messages8224.MissingFromClause, lookahead8241.value);
    }
    lex8276();
    src8834 = parseModuleSpecifier8331();
    consumeSemicolon8292();
    return markerApply8281(marker8835, delegate8238.createImportDeclaration(specifiers8833, src8834));
}
function parseEmptyStatement8340() {
    var marker8836 = markerCreate8279();
    expect8286(";");
    return markerApply8281(marker8836, delegate8238.createEmptyStatement());
}
function parseExpressionStatement8341() {
    var marker8837 = markerCreate8279(),
        expr8838 = parseExpression8323();
    consumeSemicolon8292();
    return markerApply8281(marker8837, delegate8238.createExpressionStatement(expr8838));
}
function parseIfStatement8342() {
    var test8839,
        consequent8840,
        alternate8841,
        marker8842 = markerCreate8279();
    expectKeyword8287("if");
    expect8286("(");
    test8839 = parseExpression8323();
    expect8286(")");
    consequent8840 = parseStatement8357();
    if (matchKeyword8289("else")) {
        lex8276();
        alternate8841 = parseStatement8357();
    } else {
        alternate8841 = null;
    }
    return markerApply8281(marker8842, delegate8238.createIfStatement(test8839, consequent8840, alternate8841));
}
function parseDoWhileStatement8343() {
    var body8843,
        test8844,
        oldInIteration8845,
        marker8846 = markerCreate8279();
    expectKeyword8287("do");
    oldInIteration8845 = state8243.inIteration;
    state8243.inIteration = true;
    body8843 = parseStatement8357();
    state8243.inIteration = oldInIteration8845;
    expectKeyword8287("while");
    expect8286("(");
    test8844 = parseExpression8323();
    expect8286(")");
    if (match8288(";")) {
        lex8276();
    }
    return markerApply8281(marker8846, delegate8238.createDoWhileStatement(body8843, test8844));
}
function parseWhileStatement8344() {
    var test8847,
        body8848,
        oldInIteration8849,
        marker8850 = markerCreate8279();
    expectKeyword8287("while");
    expect8286("(");
    test8847 = parseExpression8323();
    expect8286(")");
    oldInIteration8849 = state8243.inIteration;
    state8243.inIteration = true;
    body8848 = parseStatement8357();
    state8243.inIteration = oldInIteration8849;
    return markerApply8281(marker8850, delegate8238.createWhileStatement(test8847, body8848));
}
function parseForVariableDeclaration8345() {
    var marker8851 = markerCreate8279(),
        token8852 = lex8276(),
        declarations8853 = parseVariableDeclarationList8328();
    return markerApply8281(marker8851, delegate8238.createVariableDeclaration(declarations8853, token8852.value));
}
function parseForStatement8346(opts8854) {
    var init8855,
        test8856,
        update8857,
        left8858,
        right8859,
        body8860,
        operator8861,
        oldInIteration8862,
        marker8863 = markerCreate8279();
    init8855 = test8856 = update8857 = null;
    expectKeyword8287("for");
    if ( // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
    matchContextualKeyword8290("each")) {
        throwError8283({}, Messages8224.EachNotAllowed);
    }
    expect8286("(");
    if (match8288(";")) {
        lex8276();
    } else {
        if (matchKeyword8289("var") || matchKeyword8289("let") || matchKeyword8289("const")) {
            state8243.allowIn = false;
            init8855 = parseForVariableDeclaration8345();
            state8243.allowIn = true;
            if (init8855.declarations.length === 1) {
                if (matchKeyword8289("in") || matchContextualKeyword8290("of")) {
                    operator8861 = lookahead8241;
                    if (!((operator8861.value === "in" || init8855.kind !== "var") && init8855.declarations[0].init)) {
                        lex8276();
                        left8858 = init8855;
                        right8859 = parseExpression8323();
                        init8855 = null;
                    }
                }
            }
        } else {
            state8243.allowIn = false;
            init8855 = parseExpression8323();
            state8243.allowIn = true;
            if (matchContextualKeyword8290("of")) {
                operator8861 = lex8276();
                left8858 = init8855;
                right8859 = parseExpression8323();
                init8855 = null;
            } else if (matchKeyword8289("in")) {
                if ( // LeftHandSideExpression
                !isAssignableLeftHandSide8294(init8855)) {
                    throwError8283({}, Messages8224.InvalidLHSInForIn);
                }
                operator8861 = lex8276();
                left8858 = init8855;
                right8859 = parseExpression8323();
                init8855 = null;
            }
        }
        if (typeof left8858 === "undefined") {
            expect8286(";");
        }
    }
    if (typeof left8858 === "undefined") {
        if (!match8288(";")) {
            test8856 = parseExpression8323();
        }
        expect8286(";");
        if (!match8288(")")) {
            update8857 = parseExpression8323();
        }
    }
    expect8286(")");
    oldInIteration8862 = state8243.inIteration;
    state8243.inIteration = true;
    if (!(opts8854 !== undefined && opts8854.ignoreBody)) {
        body8860 = parseStatement8357();
    }
    state8243.inIteration = oldInIteration8862;
    if (typeof left8858 === "undefined") {
        return markerApply8281(marker8863, delegate8238.createForStatement(init8855, test8856, update8857, body8860));
    }
    if (operator8861.value === "in") {
        return markerApply8281(marker8863, delegate8238.createForInStatement(left8858, right8859, body8860));
    }
    return markerApply8281(marker8863, delegate8238.createForOfStatement(left8858, right8859, body8860));
}
function parseContinueStatement8347() {
    var label8864 = null,
        key8865,
        marker8866 = markerCreate8279();
    expectKeyword8287("continue");
    if ( // Optimize the most common form: 'continue;'.
    lookahead8241.value.charCodeAt(0) === 59) {
        lex8276();
        if (!state8243.inIteration) {
            throwError8283({}, Messages8224.IllegalContinue);
        }
        return markerApply8281(marker8866, delegate8238.createContinueStatement(null));
    }
    if (peekLineTerminator8282()) {
        if (!state8243.inIteration) {
            throwError8283({}, Messages8224.IllegalContinue);
        }
        return markerApply8281(marker8866, delegate8238.createContinueStatement(null));
    }
    if (lookahead8241.type === Token8219.Identifier) {
        label8864 = parseVariableIdentifier8326();
        key8865 = "$" + label8864.name;
        if (!Object.prototype.hasOwnProperty.call(state8243.labelSet, key8865)) {
            throwError8283({}, Messages8224.UnknownLabel, label8864.name);
        }
    }
    consumeSemicolon8292();
    if (label8864 === null && !state8243.inIteration) {
        throwError8283({}, Messages8224.IllegalContinue);
    }
    return markerApply8281(marker8866, delegate8238.createContinueStatement(label8864));
}
function parseBreakStatement8348() {
    var label8867 = null,
        key8868,
        marker8869 = markerCreate8279();
    expectKeyword8287("break");
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    lookahead8241.value.charCodeAt(0) === 59) {
        lex8276();
        if (!(state8243.inIteration || state8243.inSwitch)) {
            throwError8283({}, Messages8224.IllegalBreak);
        }
        return markerApply8281(marker8869, delegate8238.createBreakStatement(null));
    }
    if (peekLineTerminator8282()) {
        if (!(state8243.inIteration || state8243.inSwitch)) {
            throwError8283({}, Messages8224.IllegalBreak);
        }
        return markerApply8281(marker8869, delegate8238.createBreakStatement(null));
    }
    if (lookahead8241.type === Token8219.Identifier) {
        label8867 = parseVariableIdentifier8326();
        key8868 = "$" + label8867.name;
        if (!Object.prototype.hasOwnProperty.call(state8243.labelSet, key8868)) {
            throwError8283({}, Messages8224.UnknownLabel, label8867.name);
        }
    }
    consumeSemicolon8292();
    if (label8867 === null && !(state8243.inIteration || state8243.inSwitch)) {
        throwError8283({}, Messages8224.IllegalBreak);
    }
    return markerApply8281(marker8869, delegate8238.createBreakStatement(label8867));
}
function parseReturnStatement8349() {
    var argument8870 = null,
        marker8871 = markerCreate8279();
    expectKeyword8287("return");
    if (!state8243.inFunctionBody) {
        throwErrorTolerant8284({}, Messages8224.IllegalReturn);
    }
    if ( // 'return' followed by a space and an identifier is very common.
    isIdentifierStart8253(String(lookahead8241.value).charCodeAt(0))) {
        argument8870 = parseExpression8323();
        consumeSemicolon8292();
        return markerApply8281(marker8871, delegate8238.createReturnStatement(argument8870));
    }
    if (peekLineTerminator8282()) {
        return markerApply8281(marker8871, delegate8238.createReturnStatement(null));
    }
    if (!match8288(";")) {
        if (!match8288("}") && lookahead8241.type !== Token8219.EOF) {
            argument8870 = parseExpression8323();
        }
    }
    consumeSemicolon8292();
    return markerApply8281(marker8871, delegate8238.createReturnStatement(argument8870));
}
function parseWithStatement8350() {
    var object8872,
        body8873,
        marker8874 = markerCreate8279();
    if (strict8229) {
        throwErrorTolerant8284({}, Messages8224.StrictModeWith);
    }
    expectKeyword8287("with");
    expect8286("(");
    object8872 = parseExpression8323();
    expect8286(")");
    body8873 = parseStatement8357();
    return markerApply8281(marker8874, delegate8238.createWithStatement(object8872, body8873));
}
function parseSwitchCase8351() {
    var test8875,
        consequent8876 = [],
        sourceElement8877,
        marker8878 = markerCreate8279();
    if (matchKeyword8289("default")) {
        lex8276();
        test8875 = null;
    } else {
        expectKeyword8287("case");
        test8875 = parseExpression8323();
    }
    expect8286(":");
    while (streamIndex8240 < length8237) {
        if (match8288("}") || matchKeyword8289("default") || matchKeyword8289("case")) {
            break;
        }
        sourceElement8877 = parseSourceElement8371();
        if (typeof sourceElement8877 === "undefined") {
            break;
        }
        consequent8876.push(sourceElement8877);
    }
    return markerApply8281(marker8878, delegate8238.createSwitchCase(test8875, consequent8876));
}
function parseSwitchStatement8352() {
    var discriminant8879,
        cases8880,
        clause8881,
        oldInSwitch8882,
        defaultFound8883,
        marker8884 = markerCreate8279();
    expectKeyword8287("switch");
    expect8286("(");
    discriminant8879 = parseExpression8323();
    expect8286(")");
    expect8286("{");
    cases8880 = [];
    if (match8288("}")) {
        lex8276();
        return markerApply8281(marker8884, delegate8238.createSwitchStatement(discriminant8879, cases8880));
    }
    oldInSwitch8882 = state8243.inSwitch;
    state8243.inSwitch = true;
    defaultFound8883 = false;
    while (streamIndex8240 < length8237) {
        if (match8288("}")) {
            break;
        }
        clause8881 = parseSwitchCase8351();
        if (clause8881.test === null) {
            if (defaultFound8883) {
                throwError8283({}, Messages8224.MultipleDefaultsInSwitch);
            }
            defaultFound8883 = true;
        }
        cases8880.push(clause8881);
    }
    state8243.inSwitch = oldInSwitch8882;
    expect8286("}");
    return markerApply8281(marker8884, delegate8238.createSwitchStatement(discriminant8879, cases8880));
}
function parseThrowStatement8353() {
    var argument8885,
        marker8886 = markerCreate8279();
    expectKeyword8287("throw");
    if (peekLineTerminator8282()) {
        throwError8283({}, Messages8224.NewlineAfterThrow);
    }
    argument8885 = parseExpression8323();
    consumeSemicolon8292();
    return markerApply8281(marker8886, delegate8238.createThrowStatement(argument8885));
}
function parseCatchClause8354() {
    var param8887,
        body8888,
        marker8889 = markerCreate8279();
    expectKeyword8287("catch");
    expect8286("(");
    if (match8288(")")) {
        throwUnexpected8285(lookahead8241);
    }
    param8887 = parseExpression8323();
    if ( // 12.14.1
    strict8229 && param8887.type === Syntax8222.Identifier && isRestrictedWord8257(param8887.name)) {
        throwErrorTolerant8284({}, Messages8224.StrictCatchVariable);
    }
    expect8286(")");
    body8888 = parseBlock8325();
    return markerApply8281(marker8889, delegate8238.createCatchClause(param8887, body8888));
}
function parseTryStatement8355() {
    var block8890,
        handlers8891 = [],
        finalizer8892 = null,
        marker8893 = markerCreate8279();
    expectKeyword8287("try");
    block8890 = parseBlock8325();
    if (matchKeyword8289("catch")) {
        handlers8891.push(parseCatchClause8354());
    }
    if (matchKeyword8289("finally")) {
        lex8276();
        finalizer8892 = parseBlock8325();
    }
    if (handlers8891.length === 0 && !finalizer8892) {
        throwError8283({}, Messages8224.NoCatchOrFinally);
    }
    return markerApply8281(marker8893, delegate8238.createTryStatement(block8890, [], handlers8891, finalizer8892));
}
function parseDebuggerStatement8356() {
    var marker8894 = markerCreate8279();
    expectKeyword8287("debugger");
    consumeSemicolon8292();
    return markerApply8281(marker8894, delegate8238.createDebuggerStatement());
}
function parseStatement8357() {
    var type8895 = lookahead8241.type,
        marker8896,
        expr8897,
        labeledBody8898,
        key8899;
    if (type8895 === Token8219.EOF) {
        throwUnexpected8285(lookahead8241);
    }
    if (type8895 === Token8219.Punctuator) {
        switch (lookahead8241.value) {
            case ";":
                return parseEmptyStatement8340();
            case "{":
                return parseBlock8325();
            case "(":
                return parseExpressionStatement8341();
            default:
                break;
        }
    }
    if (type8895 === Token8219.Keyword) {
        switch (lookahead8241.value) {
            case "break":
                return parseBreakStatement8348();
            case "continue":
                return parseContinueStatement8347();
            case "debugger":
                return parseDebuggerStatement8356();
            case "do":
                return parseDoWhileStatement8343();
            case "for":
                return parseForStatement8346();
            case "function":
                return parseFunctionDeclaration8363();
            case "class":
                return parseClassDeclaration8370();
            case "if":
                return parseIfStatement8342();
            case "return":
                return parseReturnStatement8349();
            case "switch":
                return parseSwitchStatement8352();
            case "throw":
                return parseThrowStatement8353();
            case "try":
                return parseTryStatement8355();
            case "var":
                return parseVariableStatement8329();
            case "while":
                return parseWhileStatement8344();
            case "with":
                return parseWithStatement8350();
            default:
                break;
        }
    }
    marker8896 = markerCreate8279();
    expr8897 = parseExpression8323();
    if ( // 12.12 Labelled Statements
    expr8897.type === Syntax8222.Identifier && match8288(":")) {
        lex8276();
        key8899 = "$" + expr8897.name;
        if (Object.prototype.hasOwnProperty.call(state8243.labelSet, key8899)) {
            throwError8283({}, Messages8224.Redeclaration, "Label", expr8897.name);
        }
        state8243.labelSet[key8899] = true;
        labeledBody8898 = parseStatement8357();
        delete state8243.labelSet[key8899];
        return markerApply8281(marker8896, delegate8238.createLabeledStatement(expr8897, labeledBody8898));
    }
    consumeSemicolon8292();
    return markerApply8281(marker8896, delegate8238.createExpressionStatement(expr8897));
}
function parseConciseBody8358() {
    if (match8288("{")) {
        return parseFunctionSourceElements8359();
    }
    return parseAssignmentExpression8322();
}
function parseFunctionSourceElements8359() {
    var sourceElement8900,
        sourceElements8901 = [],
        token8902,
        directive8903,
        firstRestricted8904,
        oldLabelSet8905,
        oldInIteration8906,
        oldInSwitch8907,
        oldInFunctionBody8908,
        oldParenthesizedCount8909,
        marker8910 = markerCreate8279();
    expect8286("{");
    while (streamIndex8240 < length8237) {
        if (lookahead8241.type !== Token8219.StringLiteral) {
            break;
        }
        token8902 = lookahead8241;
        sourceElement8900 = parseSourceElement8371();
        sourceElements8901.push(sourceElement8900);
        if (sourceElement8900.expression.type !== Syntax8222.Literal) {
            // this is not directive
            break;
        }
        directive8903 = token8902.value;
        if (directive8903 === "use strict") {
            strict8229 = true;
            if (firstRestricted8904) {
                throwErrorTolerant8284(firstRestricted8904, Messages8224.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted8904 && token8902.octal) {
                firstRestricted8904 = token8902;
            }
        }
    }
    oldLabelSet8905 = state8243.labelSet;
    oldInIteration8906 = state8243.inIteration;
    oldInSwitch8907 = state8243.inSwitch;
    oldInFunctionBody8908 = state8243.inFunctionBody;
    oldParenthesizedCount8909 = state8243.parenthesizedCount;
    state8243.labelSet = {};
    state8243.inIteration = false;
    state8243.inSwitch = false;
    state8243.inFunctionBody = true;
    state8243.parenthesizedCount = 0;
    while (streamIndex8240 < length8237) {
        if (match8288("}")) {
            break;
        }
        sourceElement8900 = parseSourceElement8371();
        if (typeof sourceElement8900 === "undefined") {
            break;
        }
        sourceElements8901.push(sourceElement8900);
    }
    expect8286("}");
    state8243.labelSet = oldLabelSet8905;
    state8243.inIteration = oldInIteration8906;
    state8243.inSwitch = oldInSwitch8907;
    state8243.inFunctionBody = oldInFunctionBody8908;
    state8243.parenthesizedCount = oldParenthesizedCount8909;
    return markerApply8281(marker8910, delegate8238.createBlockStatement(sourceElements8901));
}
function validateParam8360(options8911, param8912, name8913) {
    var key8914 = "$" + name8913;
    if (strict8229) {
        if (isRestrictedWord8257(name8913)) {
            options8911.stricted = param8912;
            options8911.message = Messages8224.StrictParamName;
        }
        if (Object.prototype.hasOwnProperty.call(options8911.paramSet, key8914)) {
            options8911.stricted = param8912;
            options8911.message = Messages8224.StrictParamDupe;
        }
    } else if (!options8911.firstRestricted) {
        if (isRestrictedWord8257(name8913)) {
            options8911.firstRestricted = param8912;
            options8911.message = Messages8224.StrictParamName;
        } else if (isStrictModeReservedWord8256(name8913)) {
            options8911.firstRestricted = param8912;
            options8911.message = Messages8224.StrictReservedWord;
        } else if (Object.prototype.hasOwnProperty.call(options8911.paramSet, key8914)) {
            options8911.firstRestricted = param8912;
            options8911.message = Messages8224.StrictParamDupe;
        }
    }
    options8911.paramSet[key8914] = true;
}
function parseParam8361(options8915) {
    var token8916, rest8917, param8918, def8919;
    token8916 = lookahead8241;
    if (token8916.value === "...") {
        token8916 = lex8276();
        rest8917 = true;
    }
    if (match8288("[")) {
        param8918 = parseArrayInitialiser8295();
        reinterpretAsDestructuredParameter8319(options8915, param8918);
    } else if (match8288("{")) {
        if (rest8917) {
            throwError8283({}, Messages8224.ObjectPatternAsRestParameter);
        }
        param8918 = parseObjectInitialiser8300();
        reinterpretAsDestructuredParameter8319(options8915, param8918);
    } else {
        param8918 = parseVariableIdentifier8326();
        validateParam8360(options8915, token8916, token8916.value);
    }
    if (match8288("=")) {
        if (rest8917) {
            throwErrorTolerant8284(lookahead8241, Messages8224.DefaultRestParameter);
        }
        lex8276();
        def8919 = parseAssignmentExpression8322();
        ++options8915.defaultCount;
    }
    if (rest8917) {
        if (!match8288(")")) {
            throwError8283({}, Messages8224.ParameterAfterRestParameter);
        }
        options8915.rest = param8918;
        return false;
    }
    options8915.params.push(param8918);
    options8915.defaults.push(def8919);
    return !match8288(")");
}
function parseParams8362(firstRestricted8920) {
    var options8921;
    options8921 = {
        params: [],
        defaultCount: 0,
        defaults: [],
        rest: null,
        firstRestricted: firstRestricted8920
    };
    expect8286("(");
    if (!match8288(")")) {
        options8921.paramSet = {};
        while (streamIndex8240 < length8237) {
            if (!parseParam8361(options8921)) {
                break;
            }
            expect8286(",");
        }
    }
    expect8286(")");
    if (options8921.defaultCount === 0) {
        options8921.defaults = [];
    }
    return options8921;
}
function parseFunctionDeclaration8363() {
    var id8922,
        body8923,
        token8924,
        tmp8925,
        firstRestricted8926,
        message8927,
        previousStrict8928,
        previousYieldAllowed8929,
        generator8930,
        marker8931 = markerCreate8279();
    expectKeyword8287("function");
    generator8930 = false;
    if (match8288("*")) {
        lex8276();
        generator8930 = true;
    }
    token8924 = lookahead8241;
    id8922 = parseVariableIdentifier8326();
    if (strict8229) {
        if (isRestrictedWord8257(token8924.value)) {
            throwErrorTolerant8284(token8924, Messages8224.StrictFunctionName);
        }
    } else {
        if (isRestrictedWord8257(token8924.value)) {
            firstRestricted8926 = token8924;
            message8927 = Messages8224.StrictFunctionName;
        } else if (isStrictModeReservedWord8256(token8924.value)) {
            firstRestricted8926 = token8924;
            message8927 = Messages8224.StrictReservedWord;
        }
    }
    tmp8925 = parseParams8362(firstRestricted8926);
    firstRestricted8926 = tmp8925.firstRestricted;
    if (tmp8925.message) {
        message8927 = tmp8925.message;
    }
    previousStrict8928 = strict8229;
    previousYieldAllowed8929 = state8243.yieldAllowed;
    state8243.yieldAllowed = generator8930;
    body8923 = parseFunctionSourceElements8359();
    if (strict8229 && firstRestricted8926) {
        throwError8283(firstRestricted8926, message8927);
    }
    if (strict8229 && tmp8925.stricted) {
        throwErrorTolerant8284(tmp8925.stricted, message8927);
    }
    strict8229 = previousStrict8928;
    state8243.yieldAllowed = previousYieldAllowed8929;
    return markerApply8281(marker8931, delegate8238.createFunctionDeclaration(id8922, tmp8925.params, tmp8925.defaults, body8923, tmp8925.rest, generator8930, false));
}
function parseFunctionExpression8364() {
    var token8932,
        id8933 = null,
        firstRestricted8934,
        message8935,
        tmp8936,
        body8937,
        previousStrict8938,
        previousYieldAllowed8939,
        generator8940,
        marker8941 = markerCreate8279();
    expectKeyword8287("function");
    generator8940 = false;
    if (match8288("*")) {
        lex8276();
        generator8940 = true;
    }
    if (!match8288("(")) {
        token8932 = lookahead8241;
        id8933 = parseVariableIdentifier8326();
        if (strict8229) {
            if (isRestrictedWord8257(token8932.value)) {
                throwErrorTolerant8284(token8932, Messages8224.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord8257(token8932.value)) {
                firstRestricted8934 = token8932;
                message8935 = Messages8224.StrictFunctionName;
            } else if (isStrictModeReservedWord8256(token8932.value)) {
                firstRestricted8934 = token8932;
                message8935 = Messages8224.StrictReservedWord;
            }
        }
    }
    tmp8936 = parseParams8362(firstRestricted8934);
    firstRestricted8934 = tmp8936.firstRestricted;
    if (tmp8936.message) {
        message8935 = tmp8936.message;
    }
    previousStrict8938 = strict8229;
    previousYieldAllowed8939 = state8243.yieldAllowed;
    state8243.yieldAllowed = generator8940;
    body8937 = parseFunctionSourceElements8359();
    if (strict8229 && firstRestricted8934) {
        throwError8283(firstRestricted8934, message8935);
    }
    if (strict8229 && tmp8936.stricted) {
        throwErrorTolerant8284(tmp8936.stricted, message8935);
    }
    strict8229 = previousStrict8938;
    state8243.yieldAllowed = previousYieldAllowed8939;
    return markerApply8281(marker8941, delegate8238.createFunctionExpression(id8933, tmp8936.params, tmp8936.defaults, body8937, tmp8936.rest, generator8940, false));
}
function parseYieldExpression8365() {
    var yieldToken8942,
        delegateFlag8943,
        expr8944,
        marker8945 = markerCreate8279();
    yieldToken8942 = lex8276();
    assert8246(yieldToken8942.value === "yield", "Called parseYieldExpression with non-yield lookahead.");
    if (!state8243.yieldAllowed) {
        throwErrorTolerant8284({}, Messages8224.IllegalYield);
    }
    delegateFlag8943 = false;
    if (match8288("*")) {
        lex8276();
        delegateFlag8943 = true;
    }
    expr8944 = parseAssignmentExpression8322();
    return markerApply8281(marker8945, delegate8238.createYieldExpression(expr8944, delegateFlag8943));
}
function parseMethodDefinition8366(existingPropNames8946) {
    var token8947,
        key8948,
        param8949,
        propType8950,
        isValidDuplicateProp8951 = false,
        marker8952 = markerCreate8279();
    if (lookahead8241.value === "static") {
        propType8950 = ClassPropertyType8227["static"];
        lex8276();
    } else {
        propType8950 = ClassPropertyType8227.prototype;
    }
    if (match8288("*")) {
        lex8276();
        return markerApply8281(marker8952, delegate8238.createMethodDefinition(propType8950, "", parseObjectPropertyKey8298(), parsePropertyMethodFunction8297({ generator: true })));
    }
    token8947 = lookahead8241;
    key8948 = parseObjectPropertyKey8298();
    if (token8947.value === "get" && !match8288("(")) {
        key8948 = parseObjectPropertyKey8298();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a setter
        existingPropNames8946[propType8950].hasOwnProperty(key8948.name)) {
            isValidDuplicateProp8951 = // There isn't already a getter for this prop
            existingPropNames8946[propType8950][key8948.name].get === undefined && // There isn't already a data prop by this name
            existingPropNames8946[propType8950][key8948.name].data === undefined && // The only existing prop by this name is a setter
            existingPropNames8946[propType8950][key8948.name].set !== undefined;
            if (!isValidDuplicateProp8951) {
                throwError8283(key8948, Messages8224.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames8946[propType8950][key8948.name] = {};
        }
        existingPropNames8946[propType8950][key8948.name].get = true;
        expect8286("(");
        expect8286(")");
        return markerApply8281(marker8952, delegate8238.createMethodDefinition(propType8950, "get", key8948, parsePropertyFunction8296({ generator: false })));
    }
    if (token8947.value === "set" && !match8288("(")) {
        key8948 = parseObjectPropertyKey8298();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a getter
        existingPropNames8946[propType8950].hasOwnProperty(key8948.name)) {
            isValidDuplicateProp8951 = // There isn't already a setter for this prop
            existingPropNames8946[propType8950][key8948.name].set === undefined && // There isn't already a data prop by this name
            existingPropNames8946[propType8950][key8948.name].data === undefined && // The only existing prop by this name is a getter
            existingPropNames8946[propType8950][key8948.name].get !== undefined;
            if (!isValidDuplicateProp8951) {
                throwError8283(key8948, Messages8224.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames8946[propType8950][key8948.name] = {};
        }
        existingPropNames8946[propType8950][key8948.name].set = true;
        expect8286("(");
        token8947 = lookahead8241;
        param8949 = [parseVariableIdentifier8326()];
        expect8286(")");
        return markerApply8281(marker8952, delegate8238.createMethodDefinition(propType8950, "set", key8948, parsePropertyFunction8296({
            params: param8949,
            generator: false,
            name: token8947
        })));
    }
    if ( // It is a syntax error if any other properties have the same name as a
    // non-getter, non-setter method
    existingPropNames8946[propType8950].hasOwnProperty(key8948.name)) {
        throwError8283(key8948, Messages8224.IllegalDuplicateClassProperty);
    } else {
        existingPropNames8946[propType8950][key8948.name] = {};
    }
    existingPropNames8946[propType8950][key8948.name].data = true;
    return markerApply8281(marker8952, delegate8238.createMethodDefinition(propType8950, "", key8948, parsePropertyMethodFunction8297({ generator: false })));
}
function parseClassElement8367(existingProps8953) {
    if (match8288(";")) {
        lex8276();
        return;
    }
    return parseMethodDefinition8366(existingProps8953);
}
function parseClassBody8368() {
    var classElement8954,
        classElements8955 = [],
        existingProps8956 = {},
        marker8957 = markerCreate8279();
    existingProps8956[ClassPropertyType8227["static"]] = {};
    existingProps8956[ClassPropertyType8227.prototype] = {};
    expect8286("{");
    while (streamIndex8240 < length8237) {
        if (match8288("}")) {
            break;
        }
        classElement8954 = parseClassElement8367(existingProps8956);
        if (typeof classElement8954 !== "undefined") {
            classElements8955.push(classElement8954);
        }
    }
    expect8286("}");
    return markerApply8281(marker8957, delegate8238.createClassBody(classElements8955));
}
function parseClassExpression8369() {
    var id8958,
        previousYieldAllowed8959,
        superClass8960 = null,
        marker8961 = markerCreate8279();
    expectKeyword8287("class");
    if (!matchKeyword8289("extends") && !match8288("{")) {
        id8958 = parseVariableIdentifier8326();
    }
    if (matchKeyword8289("extends")) {
        expectKeyword8287("extends");
        previousYieldAllowed8959 = state8243.yieldAllowed;
        state8243.yieldAllowed = false;
        superClass8960 = parseAssignmentExpression8322();
        state8243.yieldAllowed = previousYieldAllowed8959;
    }
    return markerApply8281(marker8961, delegate8238.createClassExpression(id8958, superClass8960, parseClassBody8368()));
}
function parseClassDeclaration8370() {
    var id8962,
        previousYieldAllowed8963,
        superClass8964 = null,
        marker8965 = markerCreate8279();
    expectKeyword8287("class");
    id8962 = parseVariableIdentifier8326();
    if (matchKeyword8289("extends")) {
        expectKeyword8287("extends");
        previousYieldAllowed8963 = state8243.yieldAllowed;
        state8243.yieldAllowed = false;
        superClass8964 = parseAssignmentExpression8322();
        state8243.yieldAllowed = previousYieldAllowed8963;
    }
    return markerApply8281(marker8965, delegate8238.createClassDeclaration(id8962, superClass8964, parseClassBody8368()));
}
function parseSourceElement8371() {
    if (lookahead8241.type === Token8219.Keyword) {
        switch (lookahead8241.value) {
            case "const":
            case "let":
                return parseConstLetDeclaration8330(lookahead8241.value);
            case "function":
                return parseFunctionDeclaration8363();
            default:
                return parseStatement8357();
        }
    }
    if (lookahead8241.type !== Token8219.EOF) {
        return parseStatement8357();
    }
}
function parseProgramElement8372() {
    if (lookahead8241.type === Token8219.Keyword) {
        switch (lookahead8241.value) {
            case "export":
                return parseExportDeclaration8334();
            case "import":
                return parseImportDeclaration8339();
        }
    }
    return parseSourceElement8371();
}
function parseProgramElements8373() {
    var sourceElement8966,
        sourceElements8967 = [],
        token8968,
        directive8969,
        firstRestricted8970;
    while (streamIndex8240 < length8237) {
        token8968 = lookahead8241;
        if (token8968.type !== Token8219.StringLiteral) {
            break;
        }
        sourceElement8966 = parseProgramElement8372();
        sourceElements8967.push(sourceElement8966);
        if (sourceElement8966.expression.type !== Syntax8222.Literal) {
            // this is not directive
            break;
        }
        directive8969 = token8968.value;
        if (directive8969 === "use strict") {
            strict8229 = true;
            if (firstRestricted8970) {
                throwErrorTolerant8284(firstRestricted8970, Messages8224.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted8970 && token8968.octal) {
                firstRestricted8970 = token8968;
            }
        }
    }
    while (streamIndex8240 < length8237) {
        sourceElement8966 = parseProgramElement8372();
        if (typeof sourceElement8966 === "undefined") {
            break;
        }
        sourceElements8967.push(sourceElement8966);
    }
    return sourceElements8967;
}
function parseProgram8374() {
    var body8971,
        marker8972 = markerCreate8279();
    strict8229 = false;
    peek8277();
    body8971 = parseProgramElements8373();
    return markerApply8281(marker8972, delegate8238.createProgram(body8971));
}
function addComment8375(type8973, value8974, start8975, end8976, loc8977) {
    var comment8978;
    assert8246(typeof start8975 === "number", "Comment must have valid position");
    if ( // Because the way the actual token is scanned, often the comments
    // (if any) are skipped twice during the lexical analysis.
    // Thus, we need to skip adding a comment if the comment array already
    // handled it.
    state8243.lastCommentStart >= start8975) {
        return;
    }
    state8243.lastCommentStart = start8975;
    comment8978 = {
        type: type8973,
        value: value8974
    };
    if (extra8245.range) {
        comment8978.range = [start8975, end8976];
    }
    if (extra8245.loc) {
        comment8978.loc = loc8977;
    }
    extra8245.comments.push(comment8978);
    if (extra8245.attachComment) {
        extra8245.leadingComments.push(comment8978);
        extra8245.trailingComments.push(comment8978);
    }
}
function scanComment8376() {
    var comment8979, ch8980, loc8981, start8982, blockComment8983, lineComment8984;
    comment8979 = "";
    blockComment8983 = false;
    lineComment8984 = false;
    while (index8230 < length8237) {
        ch8980 = source8228[index8230];
        if (lineComment8984) {
            ch8980 = source8228[index8230++];
            if (isLineTerminator8252(ch8980.charCodeAt(0))) {
                loc8981.end = {
                    line: lineNumber8231,
                    column: index8230 - lineStart8232 - 1
                };
                lineComment8984 = false;
                addComment8375("Line", comment8979, start8982, index8230 - 1, loc8981);
                if (ch8980 === "\r" && source8228[index8230] === "\n") {
                    ++index8230;
                }
                ++lineNumber8231;
                lineStart8232 = index8230;
                comment8979 = "";
            } else if (index8230 >= length8237) {
                lineComment8984 = false;
                comment8979 += ch8980;
                loc8981.end = {
                    line: lineNumber8231,
                    column: length8237 - lineStart8232
                };
                addComment8375("Line", comment8979, start8982, length8237, loc8981);
            } else {
                comment8979 += ch8980;
            }
        } else if (blockComment8983) {
            if (isLineTerminator8252(ch8980.charCodeAt(0))) {
                if (ch8980 === "\r" && source8228[index8230 + 1] === "\n") {
                    ++index8230;
                    comment8979 += "\r\n";
                } else {
                    comment8979 += ch8980;
                }
                ++lineNumber8231;
                ++index8230;
                lineStart8232 = index8230;
                if (index8230 >= length8237) {
                    throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch8980 = source8228[index8230++];
                if (index8230 >= length8237) {
                    throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
                }
                comment8979 += ch8980;
                if (ch8980 === "*") {
                    ch8980 = source8228[index8230];
                    if (ch8980 === "/") {
                        comment8979 = comment8979.substr(0, comment8979.length - 1);
                        blockComment8983 = false;
                        ++index8230;
                        loc8981.end = {
                            line: lineNumber8231,
                            column: index8230 - lineStart8232
                        };
                        addComment8375("Block", comment8979, start8982, index8230, loc8981);
                        comment8979 = "";
                    }
                }
            }
        } else if (ch8980 === "/") {
            ch8980 = source8228[index8230 + 1];
            if (ch8980 === "/") {
                loc8981 = {
                    start: {
                        line: lineNumber8231,
                        column: index8230 - lineStart8232
                    }
                };
                start8982 = index8230;
                index8230 += 2;
                lineComment8984 = true;
                if (index8230 >= length8237) {
                    loc8981.end = {
                        line: lineNumber8231,
                        column: index8230 - lineStart8232
                    };
                    lineComment8984 = false;
                    addComment8375("Line", comment8979, start8982, index8230, loc8981);
                }
            } else if (ch8980 === "*") {
                start8982 = index8230;
                index8230 += 2;
                blockComment8983 = true;
                loc8981 = {
                    start: {
                        line: lineNumber8231,
                        column: index8230 - lineStart8232 - 2
                    }
                };
                if (index8230 >= length8237) {
                    throwError8283({}, Messages8224.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8251(ch8980.charCodeAt(0))) {
            ++index8230;
        } else if (isLineTerminator8252(ch8980.charCodeAt(0))) {
            ++index8230;
            if (ch8980 === "\r" && source8228[index8230] === "\n") {
                ++index8230;
            }
            ++lineNumber8231;
            lineStart8232 = index8230;
        } else {
            break;
        }
    }
}
function collectToken8377() {
    var start8985, loc8986, token8987, range8988, value8989, entry8990;
    skipComment8259();
    start8985 = index8230;
    loc8986 = {
        start: {
            line: lineNumber8231,
            column: index8230 - lineStart8232
        }
    };
    token8987 = extra8245.advance();
    loc8986.end = {
        line: lineNumber8231,
        column: index8230 - lineStart8232
    };
    if (token8987.type !== Token8219.EOF) {
        range8988 = [token8987.range[0], token8987.range[1]];
        value8989 = source8228.slice(token8987.range[0], token8987.range[1]);
        entry8990 = {
            type: TokenName8220[token8987.type],
            value: value8989,
            range: range8988,
            loc: loc8986
        };
        if (token8987.regex) {
            entry8990.regex = {
                pattern: token8987.regex.pattern,
                flags: token8987.regex.flags
            };
        }
        extra8245.tokens.push(entry8990);
    }
    return token8987;
}
function collectRegex8378() {
    var pos8991, loc8992, regex8993, token8994;
    skipComment8259();
    pos8991 = index8230;
    loc8992 = {
        start: {
            line: lineNumber8231,
            column: index8230 - lineStart8232
        }
    };
    regex8993 = extra8245.scanRegExp();
    loc8992.end = {
        line: lineNumber8231,
        column: index8230 - lineStart8232
    };
    if (!extra8245.tokenize) {
        if ( // Pop the previous token, which is likely '/' or '/='
        extra8245.tokens.length > 0) {
            token8994 = extra8245.tokens[extra8245.tokens.length - 1];
            if (token8994.range[0] === pos8991 && token8994.type === "Punctuator") {
                if (token8994.value === "/" || token8994.value === "/=") {
                    extra8245.tokens.pop();
                }
            }
        }
        extra8245.tokens.push({
            type: "RegularExpression",
            value: regex8993.literal,
            regex: regex8993.regex,
            range: [pos8991, index8230],
            loc: loc8992
        });
    }
    return regex8993;
}
function filterTokenLocation8379() {
    var i8995,
        entry8996,
        token8997,
        tokens8998 = [];
    for (i8995 = 0; i8995 < extra8245.tokens.length; ++i8995) {
        entry8996 = extra8245.tokens[i8995];
        token8997 = {
            type: entry8996.type,
            value: entry8996.value
        };
        if (entry8996.regex) {
            token8997.regex = {
                pattern: entry8996.regex.pattern,
                flags: entry8996.regex.flags
            };
        }
        if (extra8245.range) {
            token8997.range = entry8996.range;
        }
        if (extra8245.loc) {
            token8997.loc = entry8996.loc;
        }
        tokens8998.push(token8997);
    }
    extra8245.tokens = tokens8998;
}
function patch8380() {
    if (extra8245.comments) {
        extra8245.skipComment = skipComment8259;
        skipComment8259 = scanComment8376;
    }
    if (typeof extra8245.tokens !== "undefined") {
        extra8245.advance = advance8275;
        extra8245.scanRegExp = scanRegExp8272;
        advance8275 = collectToken8377;
        scanRegExp8272 = collectRegex8378;
    }
}
function unpatch8381() {
    if (typeof extra8245.skipComment === "function") {
        skipComment8259 = extra8245.skipComment;
    }
    if (typeof extra8245.scanRegExp === "function") {
        advance8275 = extra8245.advance;
        scanRegExp8272 = extra8245.scanRegExp;
    }
}
function extend8382(object8999, properties9000) {
    var entry9001,
        result9002 = {};
    for (entry9001 in object8999) {
        if (object8999.hasOwnProperty(entry9001)) {
            result9002[entry9001] = object8999[entry9001];
        }
    }
    for (entry9001 in properties9000) {
        if (properties9000.hasOwnProperty(entry9001)) {
            result9002[entry9001] = properties9000[entry9001];
        }
    }
    return result9002;
}
function tokenize8383(code9003, options9004) {
    var toString9005, token9006, tokens9007;
    toString9005 = String;
    if (typeof code9003 !== "string" && !(code9003 instanceof String)) {
        code9003 = toString9005(code9003);
    }
    delegate8238 = SyntaxTreeDelegate8226;
    source8228 = code9003;
    index8230 = 0;
    lineNumber8231 = source8228.length > 0 ? 1 : 0;
    lineStart8232 = 0;
    length8237 = source8228.length;
    lookahead8241 = null;
    state8243 = {
        allowKeyword: true,
        allowIn: true,
        labelSet: {},
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        lastCommentStart: -1
    };
    extra8245 = {};
    // Options matching.
    options9004 = options9004 || {};
    // Of course we collect tokens here.
    options9004.tokens = true;
    extra8245.tokens = [];
    extra8245.tokenize = true;
    // The following two fields are necessary to compute the Regex tokens.
    extra8245.openParenToken = -1;
    extra8245.openCurlyToken = -1;
    extra8245.range = typeof options9004.range === "boolean" && options9004.range;
    extra8245.loc = typeof options9004.loc === "boolean" && options9004.loc;
    if (typeof options9004.comment === "boolean" && options9004.comment) {
        extra8245.comments = [];
    }
    if (typeof options9004.tolerant === "boolean" && options9004.tolerant) {
        extra8245.errors = [];
    }
    if (length8237 > 0) {
        if (typeof source8228[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9003 instanceof String) {
                source8228 = code9003.valueOf();
            }
        }
    }
    patch8380();
    try {
        peek8277();
        if (lookahead8241.type === Token8219.EOF) {
            return extra8245.tokens;
        }
        token9006 = lex8276();
        while (lookahead8241.type !== Token8219.EOF) {
            try {
                token9006 = lex8276();
            } catch (lexError9008) {
                token9006 = lookahead8241;
                if (extra8245.errors) {
                    extra8245.errors.push(lexError9008);
                    // We have to break on the first error
                    // to avoid infinite loops.
                    break;
                } else {
                    throw lexError9008;
                }
            }
        }
        filterTokenLocation8379();
        tokens9007 = extra8245.tokens;
        if (typeof extra8245.comments !== "undefined") {
            tokens9007.comments = extra8245.comments;
        }
        if (typeof extra8245.errors !== "undefined") {
            tokens9007.errors = extra8245.errors;
        }
    } catch (e9009) {
        throw e9009;
    } finally {
        unpatch8381();
        extra8245 = {};
    }
    return tokens9007;
}
function blockAllowed8384(toks9010, start9011, inExprDelim9012, parentIsBlock9013) {
    var assignOps9014 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
    var binaryOps9015 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
    var unaryOps9016 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
    function back9017(n9018) {
        var idx9019 = toks9010.length - n9018 > 0 ? toks9010.length - n9018 : 0;
        return toks9010[idx9019];
    }
    if (inExprDelim9012 && toks9010.length - (start9011 + 2) <= 0) {
        // ... ({...} ...)
        return false;
    } else if (back9017(start9011 + 2).value === ":" && parentIsBlock9013) {
        // ...{a:{b:{...}}}
        return true;
    } else if (isIn8247(back9017(start9011 + 2).value, unaryOps9016.concat(binaryOps9015).concat(assignOps9014))) {
        // ... + {...}
        return false;
    } else if (back9017(start9011 + 2).value === "return") {
        var // ASI makes `{}` a block in:
        //
        //    return
        //    { ... }
        //
        // otherwise an object literal, so it's an
        // expression and thus / is divide
        currLineNumber9020 = typeof back9017(start9011 + 1).startLineNumber !== "undefined" ? back9017(start9011 + 1).startLineNumber : back9017(start9011 + 1).lineNumber;
        if (back9017(start9011 + 2).lineNumber !== currLineNumber9020) {
            return true;
        } else {
            return false;
        }
    } else if (isIn8247(back9017(start9011 + 2).value, ["void", "typeof", "in", "case", "delete"])) {
        // ... in {}
        return false;
    } else {
        return true;
    }
}
var // Readtables
readtables8385 = {
    currentReadtable: {},
    // A readtable is invoked within `readToken`, but it can
    // return multiple tokens. We need to "queue" the stream of
    // tokens so that subsequent calls to `readToken` gets the
    // rest of the stream.
    queued: [],
    // A readtable can only override punctuators
    punctuators: ";,.:!?~=%&*+-/<>^|#@",
    has: function has(ch9021) {
        return readtables8385.currentReadtable[ch9021] && readtables8385.punctuators.indexOf(ch9021) !== -1;
    },
    getQueued: function getQueued() {
        return readtables8385.queued.length ? readtables8385.queued.shift() : null;
    },
    peekQueued: function peekQueued(lookahead9022) {
        lookahead9022 = lookahead9022 ? lookahead9022 : 1;
        return readtables8385.queued.length ? readtables8385.queued[lookahead9022 - 1] : null;
    },
    invoke: function invoke(ch9023, toks9024) {
        var prevState9025 = snapshotParserState8386();
        var newStream9026 = readtables8385.currentReadtable[ch9023](ch9023, readtables8385.readerAPI, toks9024, source8228, index8230);
        if (!newStream9026) {
            // Reset the state
            restoreParserState8387(prevState9025);
            return null;
        } else if (!Array.isArray(newStream9026)) {
            newStream9026 = [newStream9026];
        }
        this.queued = this.queued.concat(newStream9026);
        return this.getQueued();
    }
};
function snapshotParserState8386() {
    return {
        index: index8230,
        lineNumber: lineNumber8231,
        lineStart: lineStart8232
    };
}
function restoreParserState8387(prevState9027) {
    index8230 = prevState9027.index;
    lineNumber8231 = prevState9027.lineNumber;
    lineStart8232 = prevState9027.lineStart;
}
function suppressReadError8388(func9028) {
    var prevState9029 = snapshotParserState8386();
    try {
        return func9028();
    } catch (e9030) {
        if (!(e9030 instanceof SyntaxError) && !(e9030 instanceof TypeError)) {
            restoreParserState8387(prevState9029);
            return null;
        }
        throw e9030;
    }
}
function makeIdentifier8389(value9031, opts9032) {
    opts9032 = opts9032 || {};
    var type9033 = Token8219.Identifier;
    if (isKeyword8258(value9031)) {
        type9033 = Token8219.Keyword;
    } else if (value9031 === "null") {
        type9033 = Token8219.NullLiteral;
    } else if (value9031 === "true" || value9031 === "false") {
        type9033 = Token8219.BooleanLiteral;
    }
    return {
        type: type9033,
        value: value9031,
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [opts9032.start || index8230, index8230]
    };
}
function makePunctuator8390(value9034, opts9035) {
    opts9035 = opts9035 || {};
    return {
        type: Token8219.Punctuator,
        value: value9034,
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [opts9035.start || index8230, index8230]
    };
}
function makeStringLiteral8391(value9036, opts9037) {
    opts9037 = opts9037 || {};
    return {
        type: Token8219.StringLiteral,
        value: value9036,
        octal: !!opts9037.octal,
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [opts9037.start || index8230, index8230]
    };
}
function makeNumericLiteral8392(value9038, opts9039) {
    opts9039 = opts9039 || {};
    return {
        type: Token8219.NumericLiteral,
        value: value9038,
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [opts9039.start || index8230, index8230]
    };
}
function makeRegExp8393(value9040, opts9041) {
    opts9041 = opts9041 || {};
    return {
        type: Token8219.RegularExpression,
        value: value9040,
        literal: value9040.toString(),
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [opts9041.start || index8230, index8230]
    };
}
function makeDelimiter8394(value9042, inner9043) {
    var current9044 = {
        lineNumber: lineNumber8231,
        lineStart: lineStart8232,
        range: [index8230, index8230]
    };
    var firstTok9045 = inner9043.length ? inner9043[0] : current9044;
    var lastTok9046 = inner9043.length ? inner9043[inner9043.length - 1] : current9044;
    return {
        type: Token8219.Delimiter,
        value: value9042,
        inner: inner9043,
        startLineNumber: firstTok9045.lineNumber,
        startLineStart: firstTok9045.lineStart,
        startRange: firstTok9045.range,
        endLineNumber: lastTok9046.lineNumber,
        endLineStart: lastTok9046.lineStart,
        endRange: lastTok9046.range
    };
}
var // Since an actual parser object doesn't exist and we want to
// introduce our own API anyway, we create a special reader object
// for reader extensions
readerAPI8395 = Object.defineProperties({
    Token: Token8219,
    isIdentifierStart: isIdentifierStart8253,
    isIdentifierPart: isIdentifierPart8254,
    isLineTerminator: isLineTerminator8252,
    readIdentifier: scanIdentifier8264,
    readPunctuator: scanPunctuator8265,
    readStringLiteral: scanStringLiteral8269,
    readNumericLiteral: scanNumericLiteral8268,
    readRegExp: scanRegExp8272,
    readToken: function readToken() {
        return readToken8396([], false, false);
    },
    readDelimiter: function readDelimiter() {
        return readDelim8397([], false, false);
    },
    skipComment: scanComment8376,
    makeIdentifier: makeIdentifier8389,
    makePunctuator: makePunctuator8390,
    makeStringLiteral: makeStringLiteral8391,
    makeNumericLiteral: makeNumericLiteral8392,
    makeRegExp: makeRegExp8393,
    makeDelimiter: makeDelimiter8394,
    suppressReadError: suppressReadError8388,
    peekQueued: readtables8385.peekQueued,
    getQueued: readtables8385.getQueued
}, {
    source: {
        get: function () {
            return source8228;
        },
        enumerable: true,
        configurable: true
    },
    index: {
        get: function () {
            return index8230;
        },
        set: function (x) {
            index8230 = x;
        },
        enumerable: true,
        configurable: true
    },
    length: {
        get: function () {
            return length8237;
        },
        set: function (x) {
            length8237 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineNumber: {
        get: function () {
            return lineNumber8231;
        },
        set: function (x) {
            lineNumber8231 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineStart: {
        get: function () {
            return lineStart8232;
        },
        set: function (x) {
            lineStart8232 = x;
        },
        enumerable: true,
        configurable: true
    },
    extra: {
        get: function () {
            return extra8245;
        },
        enumerable: true,
        configurable: true
    }
});
readtables8385.readerAPI = readerAPI8395;
function readToken8396(toks9047, inExprDelim9048, parentIsBlock9049) {
    var delimiters9050 = ["(", "{", "["];
    var parenIdents9051 = ["if", "while", "for", "with"];
    var last9052 = toks9047.length - 1;
    var comments9053,
        commentsLen9054 = extra8245.comments.length;
    function back9055(n9061) {
        var idx9062 = toks9047.length - n9061 > 0 ? toks9047.length - n9061 : 0;
        return toks9047[idx9062];
    }
    function attachComments9056(token9063) {
        if (comments9053) {
            token9063.leadingComments = comments9053;
        }
        return token9063;
    }
    function _advance9057() {
        return attachComments9056(advance8275());
    }
    function _scanRegExp9058() {
        return attachComments9056(scanRegExp8272());
    }
    skipComment8259();
    var ch9059 = source8228[index8230];
    if (extra8245.comments.length > commentsLen9054) {
        comments9053 = extra8245.comments.slice(commentsLen9054);
    }
    if (isIn8247(source8228[index8230], delimiters9050)) {
        return attachComments9056(readDelim8397(toks9047, inExprDelim9048, parentIsBlock9049));
    }
    // Check if we should get the token from the readtable
    var readtableToken9060;
    if ((readtableToken9060 = readtables8385.getQueued()) || readtables8385.has(ch9059) && (readtableToken9060 = readtables8385.invoke(ch9059, toks9047))) {
        return readtableToken9060;
    }
    if (ch9059 === "/") {
        var prev9064 = back9055(1);
        if (prev9064) {
            if (prev9064.value === "()") {
                if (isIn8247(back9055(2).value, parenIdents9051)) {
                    // ... if (...) / ...
                    return _scanRegExp9058();
                }
                // ... (...) / ...
                return _advance9057();
            }
            if (prev9064.value === "{}") {
                if (blockAllowed8384(toks9047, 0, inExprDelim9048, parentIsBlock9049)) {
                    if (back9055(2).value === "()") {
                        if ( // named function
                        back9055(4).value === "function") {
                            if (!blockAllowed8384(toks9047, 3, inExprDelim9048, parentIsBlock9049)) {
                                // new function foo (...) {...} / ...
                                return _advance9057();
                            }
                            if (toks9047.length - 5 <= 0 && inExprDelim9048) {
                                // (function foo (...) {...} /...)
                                // [function foo (...) {...} /...]
                                return _advance9057();
                            }
                        }
                        if ( // unnamed function
                        back9055(3).value === "function") {
                            if (!blockAllowed8384(toks9047, 2, inExprDelim9048, parentIsBlock9049)) {
                                // new function (...) {...} / ...
                                return _advance9057();
                            }
                            if (toks9047.length - 4 <= 0 && inExprDelim9048) {
                                // (function (...) {...} /...)
                                // [function (...) {...} /...]
                                return _advance9057();
                            }
                        }
                    }
                    // ...; {...} /...
                    return _scanRegExp9058();
                } else {
                    // ... + {...} / ...
                    return _advance9057();
                }
            }
            if (prev9064.type === Token8219.Punctuator) {
                // ... + /...
                return _scanRegExp9058();
            }
            if (isKeyword8258(prev9064.value) && prev9064.value !== "this" && prev9064.value !== "let" && prev9064.value !== "export") {
                // typeof /...
                return _scanRegExp9058();
            }
            return _advance9057();
        }
        return _scanRegExp9058();
    }
    return _advance9057();
}
function readDelim8397(toks9065, inExprDelim9066, parentIsBlock9067) {
    var startDelim9068 = advance8275(),
        matchDelim9069 = {
        "(": ")",
        "{": "}",
        "[": "]"
    },
        inner9070 = [];
    var delimiters9071 = ["(", "{", "["];
    assert8246(delimiters9071.indexOf(startDelim9068.value) !== -1, "Need to begin at the delimiter");
    var token9072 = startDelim9068;
    var startLineNumber9073 = token9072.lineNumber;
    var startLineStart9074 = token9072.lineStart;
    var startRange9075 = token9072.range;
    var delimToken9076 = {};
    delimToken9076.type = Token8219.Delimiter;
    delimToken9076.value = startDelim9068.value + matchDelim9069[startDelim9068.value];
    delimToken9076.startLineNumber = startLineNumber9073;
    delimToken9076.startLineStart = startLineStart9074;
    delimToken9076.startRange = startRange9075;
    var delimIsBlock9077 = false;
    if (startDelim9068.value === "{") {
        delimIsBlock9077 = blockAllowed8384(toks9065.concat(delimToken9076), 0, inExprDelim9066, parentIsBlock9067);
    }
    while (index8230 <= length8237) {
        token9072 = readToken8396(inner9070, startDelim9068.value === "(" || startDelim9068.value === "[", delimIsBlock9077);
        if (token9072.type === Token8219.Punctuator && token9072.value === matchDelim9069[startDelim9068.value]) {
            if (token9072.leadingComments) {
                delimToken9076.trailingComments = token9072.leadingComments;
            }
            break;
        } else if (token9072.type === Token8219.EOF) {
            throwError8283({}, Messages8224.UnexpectedEOS);
        } else {
            inner9070.push(token9072);
        }
    }
    if ( // at the end of the stream but the very last char wasn't the closing delimiter
    index8230 >= length8237 && matchDelim9069[startDelim9068.value] !== source8228[length8237 - 1]) {
        throwError8283({}, Messages8224.UnexpectedEOS);
    }
    var endLineNumber9078 = token9072.lineNumber;
    var endLineStart9079 = token9072.lineStart;
    var endRange9080 = token9072.range;
    delimToken9076.inner = inner9070;
    delimToken9076.endLineNumber = endLineNumber9078;
    delimToken9076.endLineStart = endLineStart9079;
    delimToken9076.endRange = endRange9080;
    return delimToken9076;
}
function setReadtable8398(readtable9081, syn9082) {
    readtables8385.currentReadtable = readtable9081;
    if (syn9082) {
        readtables8385.readerAPI.throwSyntaxError = function (name9083, message9084, tok9085) {
            var sx9086 = syn9082.syntaxFromToken(tok9085);
            var err9087 = new syn9082.MacroSyntaxError(name9083, message9084, sx9086);
            throw new SyntaxError(syn9082.printSyntaxError(source8228, err9087));
        };
    }
}
function currentReadtable8399() {
    return readtables8385.currentReadtable;
}
function read8400(code9088) {
    var token9089,
        tokenTree9090 = [];
    extra8245 = {};
    extra8245.comments = [];
    extra8245.range = true;
    extra8245.loc = true;
    patch8380();
    source8228 = code9088;
    index8230 = 0;
    lineNumber8231 = source8228.length > 0 ? 1 : 0;
    lineStart8232 = 0;
    length8237 = source8228.length;
    state8243 = {
        allowIn: true,
        labelSet: {},
        lastParenthesized: null,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false
    };
    while (index8230 < length8237 || readtables8385.peekQueued()) {
        tokenTree9090.push(readToken8396(tokenTree9090, false, false));
    }
    var last9091 = tokenTree9090[tokenTree9090.length - 1];
    if (last9091 && last9091.type !== Token8219.EOF) {
        tokenTree9090.push({
            type: Token8219.EOF,
            value: "",
            lineNumber: last9091.lineNumber,
            lineStart: last9091.lineStart,
            range: [index8230, index8230]
        });
    }
    return expander8218.tokensToSyntax(tokenTree9090);
}
function parse8401(code9092, options9093) {
    var program9094, toString9095;
    extra8245 = {};
    if ( // given an array of tokens instead of a string
    Array.isArray(code9092)) {
        tokenStream8239 = code9092;
        length8237 = tokenStream8239.length;
        lineNumber8231 = tokenStream8239.length > 0 ? 1 : 0;
        source8228 = undefined;
    } else {
        toString9095 = String;
        if (typeof code9092 !== "string" && !(code9092 instanceof String)) {
            code9092 = toString9095(code9092);
        }
        source8228 = code9092;
        length8237 = source8228.length;
        lineNumber8231 = source8228.length > 0 ? 1 : 0;
    }
    delegate8238 = SyntaxTreeDelegate8226;
    streamIndex8240 = -1;
    index8230 = 0;
    lineStart8232 = 0;
    sm_lineStart8234 = 0;
    sm_lineNumber8233 = lineNumber8231;
    sm_index8236 = 0;
    sm_range8235 = [0, 0];
    lookahead8241 = null;
    phase8244 = options9093 && typeof options9093.phase !== "undefined" ? options9093.phase : 0;
    state8243 = {
        allowKeyword: false,
        allowIn: true,
        labelSet: {},
        parenthesizedCount: 0,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        yieldAllowed: false
    };
    extra8245.attachComment = true;
    extra8245.range = true;
    extra8245.comments = [];
    extra8245.bottomRightStack = [];
    extra8245.trailingComments = [];
    extra8245.leadingComments = [];
    if (typeof options9093 !== "undefined") {
        extra8245.range = typeof options9093.range === "boolean" && options9093.range;
        extra8245.loc = typeof options9093.loc === "boolean" && options9093.loc;
        extra8245.attachComment = typeof options9093.attachComment === "boolean" && options9093.attachComment;
        if (extra8245.loc && options9093.source !== null && options9093.source !== undefined) {
            delegate8238 = extend8382(delegate8238, {
                postProcess: function (node9096) {
                    node9096.loc.source = toString9095(options9093.source);
                    return node9096;
                }
            });
        }
        if (typeof options9093.tokens === "boolean" && options9093.tokens) {
            extra8245.tokens = [];
        }
        if (typeof options9093.comment === "boolean" && options9093.comment) {
            extra8245.comments = [];
        }
        if (typeof options9093.tolerant === "boolean" && options9093.tolerant) {
            extra8245.errors = [];
        }
    }
    if (length8237 > 0) {
        if (source8228 && typeof source8228[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9092 instanceof String) {
                source8228 = code9092.valueOf();
            }
        }
    }
    extra8245.loc = true;
    extra8245.errors = [];
    patch8380();
    try {
        program9094 = parseProgram8374();
        if (typeof extra8245.comments !== "undefined") {
            program9094.comments = extra8245.comments;
        }
        if (typeof extra8245.tokens !== "undefined") {
            filterTokenLocation8379();
            program9094.tokens = extra8245.tokens;
        }
        if (typeof extra8245.errors !== "undefined") {
            program9094.errors = extra8245.errors;
        }
    } catch (e9097) {
        throw e9097;
    } finally {
        unpatch8381();
        extra8245 = {};
    }
    return program9094;
}
exports.tokenize = tokenize8383;
exports.read = read8400;
exports.Token = Token8219;
exports.setReadtable = setReadtable8398;
exports.currentReadtable = currentReadtable8399;
exports.parse = parse8401;
// Deep copy.
exports.Syntax = (function () {
    var name9098,
        types9099 = {};
    if (typeof Object.create === "function") {
        types9099 = Object.create(null);
    }
    for (name9098 in Syntax8222) {
        if (Syntax8222.hasOwnProperty(name9098)) {
            types9099[name9098] = Syntax8222[name9098];
        }
    }
    if (typeof Object.freeze === "function") {
        Object.freeze(types9099);
    }
    return types9099;
})();
/*
  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

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
/*global esprima:true, require: true, define:true, exports:true, window: true,
throwError: true, generateStatement: true, peek: true,
parseAssignmentExpression: true, parseBlock: true,
parseClassExpression: true, parseClassDeclaration: true, parseExpression: true,
parseForStatement: true,
parseFunctionDeclaration: true, parseFunctionExpression: true,
parseFunctionSourceElements: true, parseVariableIdentifier: true,
parseImportSpecifier: true,
parseLeftHandSideExpression: true, parseParams: true, validateParam: true,
parseSpreadOrAssignmentExpression: true,
parseStatement: true, parseSourceElement: true, parseModuleBlock: true, parseConciseBody: true,
parseYieldExpression: true
*/
//# sourceMappingURL=parser.js.map