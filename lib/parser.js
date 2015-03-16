"use strict";

var expander8468 = require("./expander");
var Token8469, TokenName8470, FnExprTokens8471, Syntax8472, PropertyKind8473, Messages8474, Regex8475, SyntaxTreeDelegate8476, ClassPropertyType8477, source8478, strict8479, index8480, lineNumber8481, lineStart8482, sm_lineNumber8483, sm_lineStart8484, sm_range8485, sm_index8486, length8487, delegate8488, tokenStream8489, streamIndex8490, lookahead8491, lookaheadIndex8492, state8493, phase8494, extra8495;
Token8469 = {
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
TokenName8470 = {};
TokenName8470[Token8469.BooleanLiteral] = "Boolean";
TokenName8470[Token8469.EOF] = "<end>";
TokenName8470[Token8469.Identifier] = "Identifier";
TokenName8470[Token8469.Keyword] = "Keyword";
TokenName8470[Token8469.NullLiteral] = "Null";
TokenName8470[Token8469.NumericLiteral] = "Numeric";
TokenName8470[Token8469.Punctuator] = "Punctuator";
TokenName8470[Token8469.StringLiteral] = "String";
TokenName8470[Token8469.RegularExpression] = "RegularExpression";
TokenName8470[Token8469.Delimiter] = "Delimiter";
// A function following one of those tokens is an expression.
FnExprTokens8471 = ["(", "{", "[", "in", "typeof", "instanceof", "new", "return", "case", "delete", "throw", "void",
// assignment operators
"=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ",",
// binary/unary operators
"+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!=="];
Syntax8472 = {
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
    ImportSpecifier: "ImportSpecifier",
    LabeledStatement: "LabeledStatement",
    Literal: "Literal",
    LogicalExpression: "LogicalExpression",
    MemberExpression: "MemberExpression",
    MethodDefinition: "MethodDefinition",
    ModuleDeclaration: "ModuleDeclaration",
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
PropertyKind8473 = {
    Data: 1,
    Get: 2,
    Set: 4
};
ClassPropertyType8477 = {
    "static": "static",
    prototype: "prototype"
};
// Error messages should be identical to V8.
Messages8474 = {
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
    NewlineAfterModule: "Illegal newline after module",
    NoFromAfterImport: "Missing from after import",
    InvalidModuleSpecifier: "Invalid module specifier",
    NestedModule: "Module declaration can not be nested",
    NoUnintializedConst: "Const must be initialized",
    ComprehensionRequiresBlock: "Comprehension must have at least one block",
    ComprehensionError: "Comprehension Error",
    EachNotAllowed: "Each is not supported",
    UnmatchedDelimiter: "Unmatched Delimiter"
};
// See also tools/generate-unicode-regex.py.
Regex8475 = {
    NonAsciiIdentifierStart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),
    NonAsciiIdentifierPart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")
};
function assert8496(condition8653, message8654) {
    if (!condition8653) {
        throw new Error("ASSERT: " + message8654);
    }
}
function isIn8497(el8655, list8656) {
    return list8656.indexOf(el8655) !== -1;
}
function isDecimalDigit8498(ch8657) {
    return ch8657 >= 48 && ch8657 <= 57;
}
function isHexDigit8499(ch8658) {
    return "0123456789abcdefABCDEF".indexOf(ch8658) >= 0;
}
function isOctalDigit8500(ch8659) {
    return "01234567".indexOf(ch8659) >= 0;
}
function isWhiteSpace8501(ch8660) {
    return ch8660 === 32 || // space
    ch8660 === 9 || // tab
    ch8660 === 11 || ch8660 === 12 || ch8660 === 160 || ch8660 >= 5760 && " ᠎             　﻿".indexOf(String.fromCharCode(ch8660)) > 0;
}
function isLineTerminator8502(ch8661) {
    return ch8661 === 10 || ch8661 === 13 || ch8661 === 8232 || ch8661 === 8233;
}
function isIdentifierStart8503(ch8662) {
    return ch8662 === 36 || ch8662 === 95 || // $ (dollar) and _ (underscore)
    ch8662 >= 65 && ch8662 <= 90 || // A..Z
    ch8662 >= 97 && ch8662 <= 122 || // a..z
    ch8662 === 92 || // \ (backslash)
    ch8662 >= 128 && Regex8475.NonAsciiIdentifierStart.test(String.fromCharCode(ch8662));
}
function isIdentifierPart8504(ch8663) {
    return ch8663 === 36 || ch8663 === 95 || // $ (dollar) and _ (underscore)
    ch8663 >= 65 && ch8663 <= 90 || // A..Z
    ch8663 >= 97 && ch8663 <= 122 || // a..z
    ch8663 >= 48 && ch8663 <= 57 || // 0..9
    ch8663 === 92 || // \ (backslash)
    ch8663 >= 128 && Regex8475.NonAsciiIdentifierPart.test(String.fromCharCode(ch8663));
}
function isFutureReservedWord8505(id8664) {
    switch (id8664) {
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
function isStrictModeReservedWord8506(id8665) {
    switch (id8665) {
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
function isRestrictedWord8507(id8666) {
    return id8666 === "eval" || id8666 === "arguments";
}
function isKeyword8508(id8667) {
    if (strict8479 && isStrictModeReservedWord8506(id8667)) {
        return true;
    }
    switch ( // 'const' is specialized as Keyword in V8.
    // 'yield' is only treated as a keyword in strict mode.
    // 'let' is for compatiblity with SpiderMonkey and ES.next.
    // Some others are from future reserved words.
    id8667.length) {
        case 2:
            return id8667 === "if" || id8667 === "in" || id8667 === "do";
        case 3:
            return id8667 === "var" || id8667 === "for" || id8667 === "new" || id8667 === "try" || id8667 === "let";
        case 4:
            return id8667 === "this" || id8667 === "else" || id8667 === "case" || id8667 === "void" || id8667 === "with" || id8667 === "enum";
        case 5:
            return id8667 === "while" || id8667 === "break" || id8667 === "catch" || id8667 === "throw" || id8667 === "const" || id8667 === "class" || id8667 === "super";
        case 6:
            return id8667 === "return" || id8667 === "typeof" || id8667 === "delete" || id8667 === "switch" || id8667 === "export" || id8667 === "import";
        case 7:
            return id8667 === "default" || id8667 === "finally" || id8667 === "extends";
        case 8:
            return id8667 === "function" || id8667 === "continue" || id8667 === "debugger";
        case 10:
            return id8667 === "instanceof";
        default:
            return false;
    }
}
function skipComment8509() {
    var ch8668, blockComment8669, lineComment8670;
    blockComment8669 = false;
    lineComment8670 = false;
    while (index8480 < length8487) {
        ch8668 = source8478.charCodeAt(index8480);
        if (lineComment8670) {
            ++index8480;
            if (isLineTerminator8502(ch8668)) {
                lineComment8670 = false;
                if (ch8668 === 13 && source8478.charCodeAt(index8480) === 10) {
                    ++index8480;
                }
                ++lineNumber8481;
                lineStart8482 = index8480;
            }
        } else if (blockComment8669) {
            if (isLineTerminator8502(ch8668)) {
                if (ch8668 === 13 && source8478.charCodeAt(index8480 + 1) === 10) {
                    ++index8480;
                }
                ++lineNumber8481;
                ++index8480;
                lineStart8482 = index8480;
                if (index8480 >= length8487) {
                    throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch8668 = source8478.charCodeAt(index8480++);
                if (index8480 >= length8487) {
                    throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
                }
                if ( // Block comment ends with '*/' (char #42, char #47).
                ch8668 === 42) {
                    ch8668 = source8478.charCodeAt(index8480);
                    if (ch8668 === 47) {
                        ++index8480;
                        blockComment8669 = false;
                    }
                }
            }
        } else if (ch8668 === 47) {
            ch8668 = source8478.charCodeAt(index8480 + 1);
            if ( // Line comment starts with '//' (char #47, char #47).
            ch8668 === 47) {
                index8480 += 2;
                lineComment8670 = true;
            } else if (ch8668 === 42) {
                // Block comment starts with '/*' (char #47, char #42).
                index8480 += 2;
                blockComment8669 = true;
                if (index8480 >= length8487) {
                    throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8501(ch8668)) {
            ++index8480;
        } else if (isLineTerminator8502(ch8668)) {
            ++index8480;
            if (ch8668 === 13 && source8478.charCodeAt(index8480) === 10) {
                ++index8480;
            }
            ++lineNumber8481;
            lineStart8482 = index8480;
        } else {
            break;
        }
    }
}
function scanHexEscape8510(prefix8671) {
    var i8672,
        len8673,
        ch8674,
        code8675 = 0;
    len8673 = prefix8671 === "u" ? 4 : 2;
    for (i8672 = 0; i8672 < len8673; ++i8672) {
        if (index8480 < length8487 && isHexDigit8499(source8478[index8480])) {
            ch8674 = source8478[index8480++];
            code8675 = code8675 * 16 + "0123456789abcdef".indexOf(ch8674.toLowerCase());
        } else {
            return "";
        }
    }
    return String.fromCharCode(code8675);
}
function scanUnicodeCodePointEscape8511() {
    var ch8676, code8677, cu18678, cu28679;
    ch8676 = source8478[index8480];
    code8677 = 0;
    if ( // At least, one hex digit is required.
    ch8676 === "}") {
        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
    }
    while (index8480 < length8487) {
        ch8676 = source8478[index8480++];
        if (!isHexDigit8499(ch8676)) {
            break;
        }
        code8677 = code8677 * 16 + "0123456789abcdef".indexOf(ch8676.toLowerCase());
    }
    if (code8677 > 1114111 || ch8676 !== "}") {
        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
    }
    if ( // UTF-16 Encoding
    code8677 <= 65535) {
        return String.fromCharCode(code8677);
    }
    cu18678 = (code8677 - 65536 >> 10) + 55296;
    cu28679 = (code8677 - 65536 & 1023) + 56320;
    return String.fromCharCode(cu18678, cu28679);
}
function getEscapedIdentifier8512() {
    var ch8680, id8681;
    ch8680 = source8478.charCodeAt(index8480++);
    id8681 = String.fromCharCode(ch8680);
    if ( // '\u' (char #92, char #117) denotes an escaped character.
    ch8680 === 92) {
        if (source8478.charCodeAt(index8480) !== 117) {
            throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
        }
        ++index8480;
        ch8680 = scanHexEscape8510("u");
        if (!ch8680 || ch8680 === "\\" || !isIdentifierStart8503(ch8680.charCodeAt(0))) {
            throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
        }
        id8681 = ch8680;
    }
    while (index8480 < length8487) {
        ch8680 = source8478.charCodeAt(index8480);
        if (!isIdentifierPart8504(ch8680)) {
            break;
        }
        ++index8480;
        id8681 += String.fromCharCode(ch8680);
        if ( // '\u' (char #92, char #117) denotes an escaped character.
        ch8680 === 92) {
            id8681 = id8681.substr(0, id8681.length - 1);
            if (source8478.charCodeAt(index8480) !== 117) {
                throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
            }
            ++index8480;
            ch8680 = scanHexEscape8510("u");
            if (!ch8680 || ch8680 === "\\" || !isIdentifierPart8504(ch8680.charCodeAt(0))) {
                throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
            }
            id8681 += ch8680;
        }
    }
    return id8681;
}
function getIdentifier8513() {
    var start8682, ch8683;
    start8682 = index8480++;
    while (index8480 < length8487) {
        ch8683 = source8478.charCodeAt(index8480);
        if (ch8683 === 92) {
            // Blackslash (char #92) marks Unicode escape sequence.
            index8480 = start8682;
            return getEscapedIdentifier8512();
        }
        if (isIdentifierPart8504(ch8683)) {
            ++index8480;
        } else {
            break;
        }
    }
    return source8478.slice(start8682, index8480);
}
function scanIdentifier8514() {
    var start8684, id8685, type8686;
    start8684 = index8480;
    // Backslash (char #92) starts an escaped character.
    id8685 = source8478.charCodeAt(index8480) === 92 ? getEscapedIdentifier8512() : getIdentifier8513();
    if ( // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    id8685.length === 1) {
        type8686 = Token8469.Identifier;
    } else if (isKeyword8508(id8685)) {
        type8686 = Token8469.Keyword;
    } else if (id8685 === "null") {
        type8686 = Token8469.NullLiteral;
    } else if (id8685 === "true" || id8685 === "false") {
        type8686 = Token8469.BooleanLiteral;
    } else {
        type8686 = Token8469.Identifier;
    }
    return {
        type: type8686,
        value: id8685,
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [start8684, index8480]
    };
}
function scanPunctuator8515() {
    var start8687 = index8480,
        code8688 = source8478.charCodeAt(index8480),
        code28689,
        ch18690 = source8478[index8480],
        ch28691,
        ch38692,
        ch48693;
    switch (code8688) {
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
            ++index8480;
            if (extra8495.tokenize) {
                if (code8688 === 40) {
                    extra8495.openParenToken = extra8495.tokens.length;
                } else if (code8688 === 123) {
                    extra8495.openCurlyToken = extra8495.tokens.length;
                }
            }
            return {
                type: Token8469.Punctuator,
                value: String.fromCharCode(code8688),
                lineNumber: lineNumber8481,
                lineStart: lineStart8482,
                range: [start8687, index8480]
            };
        default:
            code28689 = source8478.charCodeAt(index8480 + 1);
            if ( // '=' (char #61) marks an assignment or comparison operator.
            code28689 === 61) {
                switch (code8688) {
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
                        index8480 += 2;
                        return {
                            type: Token8469.Punctuator,
                            value: String.fromCharCode(code8688) + String.fromCharCode(code28689),
                            lineNumber: lineNumber8481,
                            lineStart: lineStart8482,
                            range: [start8687, index8480]
                        };
                    case 33:
                    case // !
                    61:
                        // =
                        index8480 += 2;
                        if ( // !== and ===
                        source8478.charCodeAt(index8480) === 61) {
                            ++index8480;
                        }
                        return {
                            type: Token8469.Punctuator,
                            value: source8478.slice(start8687, index8480),
                            lineNumber: lineNumber8481,
                            lineStart: lineStart8482,
                            range: [start8687, index8480]
                        };
                    default:
                        break;
                }
            }
            break;
    }
    // Peek more characters.
    ch28691 = source8478[index8480 + 1];
    ch38692 = source8478[index8480 + 2];
    ch48693 = source8478[index8480 + 3];
    if ( // 4-character punctuator: >>>=
    ch18690 === ">" && ch28691 === ">" && ch38692 === ">") {
        if (ch48693 === "=") {
            index8480 += 4;
            return {
                type: Token8469.Punctuator,
                value: ">>>=",
                lineNumber: lineNumber8481,
                lineStart: lineStart8482,
                range: [start8687, index8480]
            };
        }
    }
    if ( // 3-character punctuators: === !== >>> <<= >>=
    ch18690 === ">" && ch28691 === ">" && ch38692 === ">") {
        index8480 += 3;
        return {
            type: Token8469.Punctuator,
            value: ">>>",
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [start8687, index8480]
        };
    }
    if (ch18690 === "<" && ch28691 === "<" && ch38692 === "=") {
        index8480 += 3;
        return {
            type: Token8469.Punctuator,
            value: "<<=",
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [start8687, index8480]
        };
    }
    if (ch18690 === ">" && ch28691 === ">" && ch38692 === "=") {
        index8480 += 3;
        return {
            type: Token8469.Punctuator,
            value: ">>=",
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [start8687, index8480]
        };
    }
    if (ch18690 === "." && ch28691 === "." && ch38692 === ".") {
        index8480 += 3;
        return {
            type: Token8469.Punctuator,
            value: "...",
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [start8687, index8480]
        };
    }
    if ( // Other 2-character punctuators: ++ -- << >> && ||
    ch18690 === ch28691 && "+-<>&|".indexOf(ch18690) >= 0) {
        index8480 += 2;
        return {
            type: Token8469.Punctuator,
            value: ch18690 + ch28691,
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [start8687, index8480]
        };
    }
    if (ch18690 === "=" && ch28691 === ">") {
        index8480 += 2;
        return {
            type: Token8469.Punctuator,
            value: "=>",
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [start8687, index8480]
        };
    }
    if ("<>=!+-*%&|^/".indexOf(ch18690) >= 0) {
        ++index8480;
        return {
            type: Token8469.Punctuator,
            value: ch18690,
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [start8687, index8480]
        };
    }
    if (ch18690 === ".") {
        ++index8480;
        return {
            type: Token8469.Punctuator,
            value: ch18690,
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [start8687, index8480]
        };
    }
    throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
}
function scanHexLiteral8516(start8694) {
    var number8695 = "";
    while (index8480 < length8487) {
        if (!isHexDigit8499(source8478[index8480])) {
            break;
        }
        number8695 += source8478[index8480++];
    }
    if (number8695.length === 0) {
        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8503(source8478.charCodeAt(index8480))) {
        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8469.NumericLiteral,
        value: parseInt("0x" + number8695, 16),
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [start8694, index8480]
    };
}
function scanOctalLiteral8517(prefix8696, start8697) {
    var number8698, octal8699;
    if (isOctalDigit8500(prefix8696)) {
        octal8699 = true;
        number8698 = "0" + source8478[index8480++];
    } else {
        octal8699 = false;
        ++index8480;
        number8698 = "";
    }
    while (index8480 < length8487) {
        if (!isOctalDigit8500(source8478[index8480])) {
            break;
        }
        number8698 += source8478[index8480++];
    }
    if (!octal8699 && number8698.length === 0) {
        // only 0o or 0O
        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8503(source8478.charCodeAt(index8480)) || isDecimalDigit8498(source8478.charCodeAt(index8480))) {
        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8469.NumericLiteral,
        value: parseInt(number8698, 8),
        octal: octal8699,
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [start8697, index8480]
    };
}
function scanNumericLiteral8518() {
    var number8700, start8701, ch8702, octal8703;
    ch8702 = source8478[index8480];
    assert8496(isDecimalDigit8498(ch8702.charCodeAt(0)) || ch8702 === ".", "Numeric literal must start with a decimal digit or a decimal point");
    start8701 = index8480;
    number8700 = "";
    if (ch8702 !== ".") {
        number8700 = source8478[index8480++];
        ch8702 = source8478[index8480];
        if ( // Hex number starts with '0x'.
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        // Binary number in ES6 starts with '0b'.
        number8700 === "0") {
            if (ch8702 === "x" || ch8702 === "X") {
                ++index8480;
                return scanHexLiteral8516(start8701);
            }
            if (ch8702 === "b" || ch8702 === "B") {
                ++index8480;
                number8700 = "";
                while (index8480 < length8487) {
                    ch8702 = source8478[index8480];
                    if (ch8702 !== "0" && ch8702 !== "1") {
                        break;
                    }
                    number8700 += source8478[index8480++];
                }
                if (number8700.length === 0) {
                    // only 0b or 0B
                    throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
                }
                if (index8480 < length8487) {
                    ch8702 = source8478.charCodeAt(index8480);
                    if (isIdentifierStart8503(ch8702) || isDecimalDigit8498(ch8702)) {
                        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
                    }
                }
                return {
                    type: Token8469.NumericLiteral,
                    value: parseInt(number8700, 2),
                    lineNumber: lineNumber8481,
                    lineStart: lineStart8482,
                    range: [start8701, index8480]
                };
            }
            if (ch8702 === "o" || ch8702 === "O" || isOctalDigit8500(ch8702)) {
                return scanOctalLiteral8517(ch8702, start8701);
            }
            if ( // decimal number starts with '0' such as '09' is illegal.
            ch8702 && isDecimalDigit8498(ch8702.charCodeAt(0))) {
                throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
            }
        }
        while (isDecimalDigit8498(source8478.charCodeAt(index8480))) {
            number8700 += source8478[index8480++];
        }
        ch8702 = source8478[index8480];
    }
    if (ch8702 === ".") {
        number8700 += source8478[index8480++];
        while (isDecimalDigit8498(source8478.charCodeAt(index8480))) {
            number8700 += source8478[index8480++];
        }
        ch8702 = source8478[index8480];
    }
    if (ch8702 === "e" || ch8702 === "E") {
        number8700 += source8478[index8480++];
        ch8702 = source8478[index8480];
        if (ch8702 === "+" || ch8702 === "-") {
            number8700 += source8478[index8480++];
        }
        if (isDecimalDigit8498(source8478.charCodeAt(index8480))) {
            while (isDecimalDigit8498(source8478.charCodeAt(index8480))) {
                number8700 += source8478[index8480++];
            }
        } else {
            throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
        }
    }
    if (isIdentifierStart8503(source8478.charCodeAt(index8480))) {
        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8469.NumericLiteral,
        value: parseFloat(number8700),
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [start8701, index8480]
    };
}
function scanStringLiteral8519() {
    var str8704 = "",
        quote8705,
        start8706,
        ch8707,
        code8708,
        unescaped8709,
        restore8710,
        octal8711 = false;
    quote8705 = source8478[index8480];
    assert8496(quote8705 === "'" || quote8705 === "\"", "String literal must starts with a quote");
    start8706 = index8480;
    ++index8480;
    while (index8480 < length8487) {
        ch8707 = source8478[index8480++];
        if (ch8707 === quote8705) {
            quote8705 = "";
            break;
        } else if (ch8707 === "\\") {
            ch8707 = source8478[index8480++];
            if (!ch8707 || !isLineTerminator8502(ch8707.charCodeAt(0))) {
                switch (ch8707) {
                    case "n":
                        str8704 += "\n";
                        break;
                    case "r":
                        str8704 += "\r";
                        break;
                    case "t":
                        str8704 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8478[index8480] === "{") {
                            ++index8480;
                            str8704 += scanUnicodeCodePointEscape8511();
                        } else {
                            restore8710 = index8480;
                            unescaped8709 = scanHexEscape8510(ch8707);
                            if (unescaped8709) {
                                str8704 += unescaped8709;
                            } else {
                                index8480 = restore8710;
                                str8704 += ch8707;
                            }
                        }
                        break;
                    case "b":
                        str8704 += "\b";
                        break;
                    case "f":
                        str8704 += "\f";
                        break;
                    case "v":
                        str8704 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8500(ch8707)) {
                            code8708 = "01234567".indexOf(ch8707);
                            if ( // \0 is not octal escape sequence
                            code8708 !== 0) {
                                octal8711 = true;
                            }
                            if (index8480 < length8487 && isOctalDigit8500(source8478[index8480])) {
                                octal8711 = true;
                                code8708 = code8708 * 8 + "01234567".indexOf(source8478[index8480++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8707) >= 0 && index8480 < length8487 && isOctalDigit8500(source8478[index8480])) {
                                    code8708 = code8708 * 8 + "01234567".indexOf(source8478[index8480++]);
                                }
                            }
                            str8704 += String.fromCharCode(code8708);
                        } else {
                            str8704 += ch8707;
                        }
                        break;
                }
            } else {
                ++lineNumber8481;
                if (ch8707 === "\r" && source8478[index8480] === "\n") {
                    ++index8480;
                }
                lineStart8482 = index8480;
            }
        } else if (isLineTerminator8502(ch8707.charCodeAt(0))) {
            break;
        } else {
            str8704 += ch8707;
        }
    }
    if (quote8705 !== "") {
        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8469.StringLiteral,
        value: str8704,
        octal: octal8711,
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [start8706, index8480]
    };
}
function scanTemplate8520() {
    var cooked8712 = "",
        ch8713,
        start8714,
        terminated8715,
        tail8716,
        restore8717,
        unescaped8718,
        code8719,
        octal8720;
    terminated8715 = false;
    tail8716 = false;
    start8714 = index8480;
    ++index8480;
    while (index8480 < length8487) {
        ch8713 = source8478[index8480++];
        if (ch8713 === "`") {
            tail8716 = true;
            terminated8715 = true;
            break;
        } else if (ch8713 === "$") {
            if (source8478[index8480] === "{") {
                ++index8480;
                terminated8715 = true;
                break;
            }
            cooked8712 += ch8713;
        } else if (ch8713 === "\\") {
            ch8713 = source8478[index8480++];
            if (!isLineTerminator8502(ch8713.charCodeAt(0))) {
                switch (ch8713) {
                    case "n":
                        cooked8712 += "\n";
                        break;
                    case "r":
                        cooked8712 += "\r";
                        break;
                    case "t":
                        cooked8712 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8478[index8480] === "{") {
                            ++index8480;
                            cooked8712 += scanUnicodeCodePointEscape8511();
                        } else {
                            restore8717 = index8480;
                            unescaped8718 = scanHexEscape8510(ch8713);
                            if (unescaped8718) {
                                cooked8712 += unescaped8718;
                            } else {
                                index8480 = restore8717;
                                cooked8712 += ch8713;
                            }
                        }
                        break;
                    case "b":
                        cooked8712 += "\b";
                        break;
                    case "f":
                        cooked8712 += "\f";
                        break;
                    case "v":
                        cooked8712 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8500(ch8713)) {
                            code8719 = "01234567".indexOf(ch8713);
                            if ( // \0 is not octal escape sequence
                            code8719 !== 0) {
                                octal8720 = true;
                            }
                            if (index8480 < length8487 && isOctalDigit8500(source8478[index8480])) {
                                octal8720 = true;
                                code8719 = code8719 * 8 + "01234567".indexOf(source8478[index8480++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8713) >= 0 && index8480 < length8487 && isOctalDigit8500(source8478[index8480])) {
                                    code8719 = code8719 * 8 + "01234567".indexOf(source8478[index8480++]);
                                }
                            }
                            cooked8712 += String.fromCharCode(code8719);
                        } else {
                            cooked8712 += ch8713;
                        }
                        break;
                }
            } else {
                ++lineNumber8481;
                if (ch8713 === "\r" && source8478[index8480] === "\n") {
                    ++index8480;
                }
                lineStart8482 = index8480;
            }
        } else if (isLineTerminator8502(ch8713.charCodeAt(0))) {
            ++lineNumber8481;
            if (ch8713 === "\r" && source8478[index8480] === "\n") {
                ++index8480;
            }
            lineStart8482 = index8480;
            cooked8712 += "\n";
        } else {
            cooked8712 += ch8713;
        }
    }
    if (!terminated8715) {
        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8469.Template,
        value: {
            cooked: cooked8712,
            raw: source8478.slice(start8714 + 1, index8480 - (tail8716 ? 1 : 2))
        },
        tail: tail8716,
        octal: octal8720,
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [start8714, index8480]
    };
}
function scanTemplateElement8521(option8721) {
    var startsWith8722, template8723;
    lookahead8491 = null;
    skipComment8509();
    startsWith8722 = option8721.head ? "`" : "}";
    if (source8478[index8480] !== startsWith8722) {
        throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
    }
    template8723 = scanTemplate8520();
    peek8527();
    return template8723;
}
function scanRegExp8522() {
    var str8724,
        ch8725,
        start8726,
        pattern8727,
        flags8728,
        value8729,
        classMarker8730 = false,
        restore8731,
        terminated8732 = false;
    lookahead8491 = null;
    skipComment8509();
    start8726 = index8480;
    ch8725 = source8478[index8480];
    assert8496(ch8725 === "/", "Regular expression literal must start with a slash");
    str8724 = source8478[index8480++];
    while (index8480 < length8487) {
        ch8725 = source8478[index8480++];
        str8724 += ch8725;
        if (classMarker8730) {
            if (ch8725 === "]") {
                classMarker8730 = false;
            }
        } else {
            if (ch8725 === "\\") {
                ch8725 = source8478[index8480++];
                if ( // ECMA-262 7.8.5
                isLineTerminator8502(ch8725.charCodeAt(0))) {
                    throwError8533({}, Messages8474.UnterminatedRegExp);
                }
                str8724 += ch8725;
            } else if (ch8725 === "/") {
                terminated8732 = true;
                break;
            } else if (ch8725 === "[") {
                classMarker8730 = true;
            } else if (isLineTerminator8502(ch8725.charCodeAt(0))) {
                throwError8533({}, Messages8474.UnterminatedRegExp);
            }
        }
    }
    if (!terminated8732) {
        throwError8533({}, Messages8474.UnterminatedRegExp);
    }
    // Exclude leading and trailing slash.
    pattern8727 = str8724.substr(1, str8724.length - 2);
    flags8728 = "";
    while (index8480 < length8487) {
        ch8725 = source8478[index8480];
        if (!isIdentifierPart8504(ch8725.charCodeAt(0))) {
            break;
        }
        ++index8480;
        if (ch8725 === "\\" && index8480 < length8487) {
            ch8725 = source8478[index8480];
            if (ch8725 === "u") {
                ++index8480;
                restore8731 = index8480;
                ch8725 = scanHexEscape8510("u");
                if (ch8725) {
                    flags8728 += ch8725;
                    for (str8724 += "\\u"; restore8731 < index8480; ++restore8731) {
                        str8724 += source8478[restore8731];
                    }
                } else {
                    index8480 = restore8731;
                    flags8728 += "u";
                    str8724 += "\\u";
                }
            } else {
                str8724 += "\\";
            }
        } else {
            flags8728 += ch8725;
            str8724 += ch8725;
        }
    }
    try {
        value8729 = new RegExp(pattern8727, flags8728);
    } catch (e8733) {
        throwError8533({}, Messages8474.InvalidRegExp);
    }
    if ( // peek();
    extra8495.tokenize) {
        return {
            type: Token8469.RegularExpression,
            value: value8729,
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [start8726, index8480]
        };
    }
    return {
        type: Token8469.RegularExpression,
        literal: str8724,
        value: value8729,
        range: [start8726, index8480]
    };
}
function isIdentifierName8523(token8734) {
    return token8734.type === Token8469.Identifier || token8734.type === Token8469.Keyword || token8734.type === Token8469.BooleanLiteral || token8734.type === Token8469.NullLiteral;
}
function advanceSlash8524() {
    var prevToken8735, checkToken8736;
    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design
    prevToken8735 = extra8495.tokens[extra8495.tokens.length - 1];
    if (!prevToken8735) {
        // Nothing before that: it cannot be a division.
        return scanRegExp8522();
    }
    if (prevToken8735.type === "Punctuator") {
        if (prevToken8735.value === ")") {
            checkToken8736 = extra8495.tokens[extra8495.openParenToken - 1];
            if (checkToken8736 && checkToken8736.type === "Keyword" && (checkToken8736.value === "if" || checkToken8736.value === "while" || checkToken8736.value === "for" || checkToken8736.value === "with")) {
                return scanRegExp8522();
            }
            return scanPunctuator8515();
        }
        if (prevToken8735.value === "}") {
            if ( // Dividing a function by anything makes little sense,
            // but we have to check for that.
            extra8495.tokens[extra8495.openCurlyToken - 3] && extra8495.tokens[extra8495.openCurlyToken - 3].type === "Keyword") {
                // Anonymous function.
                checkToken8736 = extra8495.tokens[extra8495.openCurlyToken - 4];
                if (!checkToken8736) {
                    return scanPunctuator8515();
                }
            } else if (extra8495.tokens[extra8495.openCurlyToken - 4] && extra8495.tokens[extra8495.openCurlyToken - 4].type === "Keyword") {
                // Named function.
                checkToken8736 = extra8495.tokens[extra8495.openCurlyToken - 5];
                if (!checkToken8736) {
                    return scanRegExp8522();
                }
            } else {
                return scanPunctuator8515();
            }
            if ( // checkToken determines whether the function is
            // a declaration or an expression.
            FnExprTokens8471.indexOf(checkToken8736.value) >= 0) {
                // It is an expression.
                return scanPunctuator8515();
            }
            // It is a declaration.
            return scanRegExp8522();
        }
        return scanRegExp8522();
    }
    if (prevToken8735.type === "Keyword") {
        return scanRegExp8522();
    }
    return scanPunctuator8515();
}
function advance8525() {
    var ch8737;
    skipComment8509();
    if (index8480 >= length8487) {
        return {
            type: Token8469.EOF,
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [index8480, index8480]
        };
    }
    ch8737 = source8478.charCodeAt(index8480);
    if ( // Very common: ( and ) and ;
    ch8737 === 40 || ch8737 === 41 || ch8737 === 58) {
        return scanPunctuator8515();
    }
    if ( // String literal starts with single quote (#39) or double quote (#34).
    ch8737 === 39 || ch8737 === 34) {
        return scanStringLiteral8519();
    }
    if (ch8737 === 96) {
        return scanTemplate8520();
    }
    if (isIdentifierStart8503(ch8737)) {
        return scanIdentifier8514();
    }
    if ( // # and @ are allowed for sweet.js
    ch8737 === 35 || ch8737 === 64) {
        ++index8480;
        return {
            type: Token8469.Punctuator,
            value: String.fromCharCode(ch8737),
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [index8480 - 1, index8480]
        };
    }
    if ( // Dot (.) char #46 can also start a floating-point number, hence the need
    // to check the next character.
    ch8737 === 46) {
        if (isDecimalDigit8498(source8478.charCodeAt(index8480 + 1))) {
            return scanNumericLiteral8518();
        }
        return scanPunctuator8515();
    }
    if (isDecimalDigit8498(ch8737)) {
        return scanNumericLiteral8518();
    }
    if ( // Slash (/) char #47 can also start a regex.
    extra8495.tokenize && ch8737 === 47) {
        return advanceSlash8524();
    }
    return scanPunctuator8515();
}
function lex8526() {
    var token8738;
    token8738 = lookahead8491;
    streamIndex8490 = lookaheadIndex8492;
    lineNumber8481 = token8738.lineNumber;
    lineStart8482 = token8738.lineStart;
    sm_lineNumber8483 = lookahead8491.sm_lineNumber;
    sm_lineStart8484 = lookahead8491.sm_lineStart;
    sm_range8485 = lookahead8491.sm_range;
    sm_index8486 = lookahead8491.sm_range[0];
    lookahead8491 = tokenStream8489[++streamIndex8490].token;
    lookaheadIndex8492 = streamIndex8490;
    index8480 = lookahead8491.range[0];
    if (token8738.leadingComments) {
        extra8495.comments = extra8495.comments.concat(token8738.leadingComments);
        extra8495.trailingComments = extra8495.trailingComments.concat(token8738.leadingComments);
        extra8495.leadingComments = extra8495.leadingComments.concat(token8738.leadingComments);
    }
    return token8738;
}
function peek8527() {
    lookaheadIndex8492 = streamIndex8490 + 1;
    if (lookaheadIndex8492 >= length8487) {
        lookahead8491 = {
            type: Token8469.EOF,
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [index8480, index8480]
        };
        return;
    }
    lookahead8491 = tokenStream8489[lookaheadIndex8492].token;
    index8480 = lookahead8491.range[0];
}
function lookahead28528() {
    var adv8739, pos8740, line8741, start8742, result8743;
    if (streamIndex8490 + 1 >= length8487 || streamIndex8490 + 2 >= length8487) {
        return {
            type: Token8469.EOF,
            lineNumber: lineNumber8481,
            lineStart: lineStart8482,
            range: [index8480, index8480]
        };
    }
    if ( // Scan for the next immediate token.
    lookahead8491 === null) {
        lookaheadIndex8492 = streamIndex8490 + 1;
        lookahead8491 = tokenStream8489[lookaheadIndex8492].token;
        index8480 = lookahead8491.range[0];
    }
    result8743 = tokenStream8489[lookaheadIndex8492 + 1].token;
    return result8743;
}
function markerCreate8529() {
    var sm_index8744 = lookahead8491 ? lookahead8491.sm_range[0] : 0;
    var sm_lineStart8745 = lookahead8491 ? lookahead8491.sm_lineStart : 0;
    var sm_lineNumber8746 = lookahead8491 ? lookahead8491.sm_lineNumber : 1;
    if (!extra8495.loc && !extra8495.range) {
        return undefined;
    }
    return {
        offset: sm_index8744,
        line: sm_lineNumber8746,
        col: sm_index8744 - sm_lineStart8745
    };
}
function processComment8530(node8747) {
    var lastChild8748,
        trailingComments8749,
        bottomRight8750 = extra8495.bottomRightStack,
        last8751 = bottomRight8750[bottomRight8750.length - 1];
    if (node8747.type === Syntax8472.Program) {
        if (node8747.body.length > 0) {
            return;
        }
    }
    if (extra8495.trailingComments.length > 0) {
        if (extra8495.trailingComments[0].range[0] >= node8747.range[1]) {
            trailingComments8749 = extra8495.trailingComments;
            extra8495.trailingComments = [];
        } else {
            extra8495.trailingComments.length = 0;
        }
    } else {
        if (last8751 && last8751.trailingComments && last8751.trailingComments[0].range[0] >= node8747.range[1]) {
            trailingComments8749 = last8751.trailingComments;
            delete last8751.trailingComments;
        }
    }
    if ( // Eating the stack.
    last8751) {
        while (last8751 && last8751.range[0] >= node8747.range[0]) {
            lastChild8748 = last8751;
            last8751 = bottomRight8750.pop();
        }
    }
    if (lastChild8748) {
        if (lastChild8748.leadingComments && lastChild8748.leadingComments[lastChild8748.leadingComments.length - 1].range[1] <= node8747.range[0]) {
            node8747.leadingComments = lastChild8748.leadingComments;
            delete lastChild8748.leadingComments;
        }
    } else if (extra8495.leadingComments.length > 0 && extra8495.leadingComments[extra8495.leadingComments.length - 1].range[1] <= node8747.range[0]) {
        node8747.leadingComments = extra8495.leadingComments;
        extra8495.leadingComments = [];
    }
    if (trailingComments8749) {
        node8747.trailingComments = trailingComments8749;
    }
    bottomRight8750.push(node8747);
}
function markerApply8531(marker8752, node8753) {
    if (extra8495.range) {
        node8753.range = [marker8752.offset, sm_index8486];
    }
    if (extra8495.loc) {
        node8753.loc = {
            start: {
                line: marker8752.line,
                column: marker8752.col
            },
            end: {
                line: sm_lineNumber8483,
                column: sm_index8486 - sm_lineStart8484
            }
        };
        node8753 = delegate8488.postProcess(node8753);
    }
    if (extra8495.attachComment) {
        processComment8530(node8753);
    }
    return node8753;
}
SyntaxTreeDelegate8476 = {
    name: "SyntaxTree",
    postProcess: function postProcess(node8754) {
        return node8754;
    },
    createArrayExpression: function createArrayExpression(elements8755) {
        return {
            type: Syntax8472.ArrayExpression,
            elements: elements8755
        };
    },
    createAssignmentExpression: function createAssignmentExpression(operator8756, left8757, right8758) {
        return {
            type: Syntax8472.AssignmentExpression,
            operator: operator8756,
            left: left8757,
            right: right8758
        };
    },
    createBinaryExpression: function createBinaryExpression(operator8759, left8760, right8761) {
        var type8762 = operator8759 === "||" || operator8759 === "&&" ? Syntax8472.LogicalExpression : Syntax8472.BinaryExpression;
        return {
            type: type8762,
            operator: operator8759,
            left: left8760,
            right: right8761
        };
    },
    createBlockStatement: function createBlockStatement(body8763) {
        return {
            type: Syntax8472.BlockStatement,
            body: body8763
        };
    },
    createBreakStatement: function createBreakStatement(label8764) {
        return {
            type: Syntax8472.BreakStatement,
            label: label8764
        };
    },
    createCallExpression: function createCallExpression(callee8765, args8766) {
        return {
            type: Syntax8472.CallExpression,
            callee: callee8765,
            arguments: args8766
        };
    },
    createCatchClause: function createCatchClause(param8767, body8768) {
        return {
            type: Syntax8472.CatchClause,
            param: param8767,
            body: body8768
        };
    },
    createConditionalExpression: function createConditionalExpression(test8769, consequent8770, alternate8771) {
        return {
            type: Syntax8472.ConditionalExpression,
            test: test8769,
            consequent: consequent8770,
            alternate: alternate8771
        };
    },
    createContinueStatement: function createContinueStatement(label8772) {
        return {
            type: Syntax8472.ContinueStatement,
            label: label8772
        };
    },
    createDebuggerStatement: function createDebuggerStatement() {
        return { type: Syntax8472.DebuggerStatement };
    },
    createDoWhileStatement: function createDoWhileStatement(body8773, test8774) {
        return {
            type: Syntax8472.DoWhileStatement,
            body: body8773,
            test: test8774
        };
    },
    createEmptyStatement: function createEmptyStatement() {
        return { type: Syntax8472.EmptyStatement };
    },
    createExpressionStatement: function createExpressionStatement(expression8775) {
        return {
            type: Syntax8472.ExpressionStatement,
            expression: expression8775
        };
    },
    createForStatement: function createForStatement(init8776, test8777, update8778, body8779) {
        return {
            type: Syntax8472.ForStatement,
            init: init8776,
            test: test8777,
            update: update8778,
            body: body8779
        };
    },
    createForInStatement: function createForInStatement(left8780, right8781, body8782) {
        return {
            type: Syntax8472.ForInStatement,
            left: left8780,
            right: right8781,
            body: body8782,
            each: false
        };
    },
    createForOfStatement: function createForOfStatement(left8783, right8784, body8785) {
        return {
            type: Syntax8472.ForOfStatement,
            left: left8783,
            right: right8784,
            body: body8785
        };
    },
    createFunctionDeclaration: function createFunctionDeclaration(id8786, params8787, defaults8788, body8789, rest8790, generator8791, expression8792) {
        return {
            type: Syntax8472.FunctionDeclaration,
            id: id8786,
            params: params8787,
            defaults: defaults8788,
            body: body8789,
            rest: rest8790,
            generator: generator8791,
            expression: expression8792
        };
    },
    createFunctionExpression: function createFunctionExpression(id8793, params8794, defaults8795, body8796, rest8797, generator8798, expression8799) {
        return {
            type: Syntax8472.FunctionExpression,
            id: id8793,
            params: params8794,
            defaults: defaults8795,
            body: body8796,
            rest: rest8797,
            generator: generator8798,
            expression: expression8799
        };
    },
    createIdentifier: function createIdentifier(name8800) {
        return {
            type: Syntax8472.Identifier,
            name: name8800
        };
    },
    createIfStatement: function createIfStatement(test8801, consequent8802, alternate8803) {
        return {
            type: Syntax8472.IfStatement,
            test: test8801,
            consequent: consequent8802,
            alternate: alternate8803
        };
    },
    createLabeledStatement: function createLabeledStatement(label8804, body8805) {
        return {
            type: Syntax8472.LabeledStatement,
            label: label8804,
            body: body8805
        };
    },
    createLiteral: function createLiteral(token8806) {
        return {
            type: Syntax8472.Literal,
            value: token8806.value,
            raw: String(token8806.value)
        };
    },
    createMemberExpression: function createMemberExpression(accessor8807, object8808, property8809) {
        return {
            type: Syntax8472.MemberExpression,
            computed: accessor8807 === "[",
            object: object8808,
            property: property8809
        };
    },
    createNewExpression: function createNewExpression(callee8810, args8811) {
        return {
            type: Syntax8472.NewExpression,
            callee: callee8810,
            arguments: args8811
        };
    },
    createObjectExpression: function createObjectExpression(properties8812) {
        return {
            type: Syntax8472.ObjectExpression,
            properties: properties8812
        };
    },
    createPostfixExpression: function createPostfixExpression(operator8813, argument8814) {
        return {
            type: Syntax8472.UpdateExpression,
            operator: operator8813,
            argument: argument8814,
            prefix: false
        };
    },
    createProgram: function createProgram(body8815) {
        return {
            type: Syntax8472.Program,
            body: body8815
        };
    },
    createProperty: function createProperty(kind8816, key8817, value8818, method8819, shorthand8820, computed8821) {
        return {
            type: Syntax8472.Property,
            key: key8817,
            value: value8818,
            kind: kind8816,
            method: method8819,
            shorthand: shorthand8820,
            computed: computed8821
        };
    },
    createReturnStatement: function createReturnStatement(argument8822) {
        return {
            type: Syntax8472.ReturnStatement,
            argument: argument8822
        };
    },
    createSequenceExpression: function createSequenceExpression(expressions8823) {
        return {
            type: Syntax8472.SequenceExpression,
            expressions: expressions8823
        };
    },
    createSwitchCase: function createSwitchCase(test8824, consequent8825) {
        return {
            type: Syntax8472.SwitchCase,
            test: test8824,
            consequent: consequent8825
        };
    },
    createSwitchStatement: function createSwitchStatement(discriminant8826, cases8827) {
        return {
            type: Syntax8472.SwitchStatement,
            discriminant: discriminant8826,
            cases: cases8827
        };
    },
    createThisExpression: function createThisExpression() {
        return { type: Syntax8472.ThisExpression };
    },
    createThrowStatement: function createThrowStatement(argument8828) {
        return {
            type: Syntax8472.ThrowStatement,
            argument: argument8828
        };
    },
    createTryStatement: function createTryStatement(block8829, guardedHandlers8830, handlers8831, finalizer8832) {
        return {
            type: Syntax8472.TryStatement,
            block: block8829,
            guardedHandlers: guardedHandlers8830,
            handlers: handlers8831,
            finalizer: finalizer8832
        };
    },
    createUnaryExpression: function createUnaryExpression(operator8833, argument8834) {
        if (operator8833 === "++" || operator8833 === "--") {
            return {
                type: Syntax8472.UpdateExpression,
                operator: operator8833,
                argument: argument8834,
                prefix: true
            };
        }
        return {
            type: Syntax8472.UnaryExpression,
            operator: operator8833,
            argument: argument8834,
            prefix: true
        };
    },
    createVariableDeclaration: function createVariableDeclaration(declarations8835, kind8836) {
        return {
            type: Syntax8472.VariableDeclaration,
            declarations: declarations8835,
            kind: kind8836
        };
    },
    createVariableDeclarator: function createVariableDeclarator(id8837, init8838) {
        return {
            type: Syntax8472.VariableDeclarator,
            id: id8837,
            init: init8838
        };
    },
    createWhileStatement: function createWhileStatement(test8839, body8840) {
        return {
            type: Syntax8472.WhileStatement,
            test: test8839,
            body: body8840
        };
    },
    createWithStatement: function createWithStatement(object8841, body8842) {
        return {
            type: Syntax8472.WithStatement,
            object: object8841,
            body: body8842
        };
    },
    createTemplateElement: function createTemplateElement(value8843, tail8844) {
        return {
            type: Syntax8472.TemplateElement,
            value: value8843,
            tail: tail8844
        };
    },
    createTemplateLiteral: function createTemplateLiteral(quasis8845, expressions8846) {
        return {
            type: Syntax8472.TemplateLiteral,
            quasis: quasis8845,
            expressions: expressions8846
        };
    },
    createSpreadElement: function createSpreadElement(argument8847) {
        return {
            type: Syntax8472.SpreadElement,
            argument: argument8847
        };
    },
    createTaggedTemplateExpression: function createTaggedTemplateExpression(tag8848, quasi8849) {
        return {
            type: Syntax8472.TaggedTemplateExpression,
            tag: tag8848,
            quasi: quasi8849
        };
    },
    createArrowFunctionExpression: function createArrowFunctionExpression(params8850, defaults8851, body8852, rest8853, expression8854) {
        return {
            type: Syntax8472.ArrowFunctionExpression,
            id: null,
            params: params8850,
            defaults: defaults8851,
            body: body8852,
            rest: rest8853,
            generator: false,
            expression: expression8854
        };
    },
    createMethodDefinition: function createMethodDefinition(propertyType8855, kind8856, key8857, value8858) {
        return {
            type: Syntax8472.MethodDefinition,
            key: key8857,
            value: value8858,
            kind: kind8856,
            "static": propertyType8855 === ClassPropertyType8477["static"]
        };
    },
    createClassBody: function createClassBody(body8859) {
        return {
            type: Syntax8472.ClassBody,
            body: body8859
        };
    },
    createClassExpression: function createClassExpression(id8860, superClass8861, body8862) {
        return {
            type: Syntax8472.ClassExpression,
            id: id8860,
            superClass: superClass8861,
            body: body8862
        };
    },
    createClassDeclaration: function createClassDeclaration(id8863, superClass8864, body8865) {
        return {
            type: Syntax8472.ClassDeclaration,
            id: id8863,
            superClass: superClass8864,
            body: body8865
        };
    },
    createExportSpecifier: function createExportSpecifier(id8866, name8867) {
        return {
            type: Syntax8472.ExportSpecifier,
            id: id8866,
            name: name8867
        };
    },
    createExportBatchSpecifier: function createExportBatchSpecifier() {
        return { type: Syntax8472.ExportBatchSpecifier };
    },
    createExportDeclaration: function createExportDeclaration(declaration8868, specifiers8869, source8870) {
        return {
            type: Syntax8472.ExportDeclaration,
            declaration: declaration8868,
            specifiers: specifiers8869,
            source: source8870
        };
    },
    createImportSpecifier: function createImportSpecifier(id8871, name8872) {
        return {
            type: Syntax8472.ImportSpecifier,
            id: id8871,
            name: name8872
        };
    },
    createImportDeclaration: function createImportDeclaration(specifiers8873, kind8874, source8875) {
        return {
            type: Syntax8472.ImportDeclaration,
            specifiers: specifiers8873,
            kind: kind8874,
            source: source8875
        };
    },
    createYieldExpression: function createYieldExpression(argument8876, delegate8877) {
        return {
            type: Syntax8472.YieldExpression,
            argument: argument8876,
            delegate: delegate8877
        };
    },
    createModuleDeclaration: function createModuleDeclaration(id8878, source8879, body8880) {
        return {
            type: Syntax8472.ModuleDeclaration,
            id: id8878,
            source: source8879,
            body: body8880
        };
    },
    createComprehensionExpression: function createComprehensionExpression(filter8881, blocks8882, body8883) {
        return {
            type: Syntax8472.ComprehensionExpression,
            filter: filter8881,
            blocks: blocks8882,
            body: body8883
        };
    }
};
function peekLineTerminator8532() {
    return lookahead8491.lineNumber !== lineNumber8481;
}
function throwError8533(token8884, messageFormat8885) {
    var error8886,
        args8887 = Array.prototype.slice.call(arguments, 2),
        msg8888 = messageFormat8885.replace(/%(\d)/g, function (whole8892, index8893) {
        assert8496(index8893 < args8887.length, "Message reference must be in range");
        return args8887[index8893];
    });
    var startIndex8889 = streamIndex8490 > 3 ? streamIndex8490 - 3 : 0;
    var toks8890 = "",
        tailingMsg8891 = "";
    if (tokenStream8489) {
        toks8890 = tokenStream8489.slice(startIndex8889, streamIndex8490 + 3).map(function (stx8894) {
            return stx8894.token.value;
        }).join(" ");
        tailingMsg8891 = "\n[... " + toks8890 + " ...]";
    }
    if (typeof token8884.lineNumber === "number") {
        error8886 = new Error("Line " + token8884.lineNumber + ": " + msg8888 + tailingMsg8891);
        error8886.index = token8884.range[0];
        error8886.lineNumber = token8884.lineNumber;
        error8886.column = token8884.range[0] - lineStart8482 + 1;
    } else {
        error8886 = new Error("Line " + lineNumber8481 + ": " + msg8888 + tailingMsg8891);
        error8886.index = index8480;
        error8886.lineNumber = lineNumber8481;
        error8886.column = index8480 - lineStart8482 + 1;
    }
    error8886.description = msg8888;
    throw error8886;
}
function throwErrorTolerant8534() {
    try {
        throwError8533.apply(null, arguments);
    } catch (e8895) {
        if (extra8495.errors) {
            extra8495.errors.push(e8895);
        } else {
            throw e8895;
        }
    }
}
function throwUnexpected8535(token8896) {
    if (token8896.type === Token8469.EOF) {
        throwError8533(token8896, Messages8474.UnexpectedEOS);
    }
    if (token8896.type === Token8469.NumericLiteral) {
        throwError8533(token8896, Messages8474.UnexpectedNumber);
    }
    if (token8896.type === Token8469.StringLiteral) {
        throwError8533(token8896, Messages8474.UnexpectedString);
    }
    if (token8896.type === Token8469.Identifier) {
        throwError8533(token8896, Messages8474.UnexpectedIdentifier);
    }
    if (token8896.type === Token8469.Keyword) {
        if (isFutureReservedWord8505(token8896.value)) {} else if (strict8479 && isStrictModeReservedWord8506(token8896.value)) {
            throwErrorTolerant8534(token8896, Messages8474.StrictReservedWord);
            return;
        }
        throwError8533(token8896, Messages8474.UnexpectedToken, token8896.value);
    }
    if (token8896.type === Token8469.Template) {
        throwError8533(token8896, Messages8474.UnexpectedTemplate, token8896.value.raw);
    }
    // BooleanLiteral, NullLiteral, or Punctuator.
    throwError8533(token8896, Messages8474.UnexpectedToken, token8896.value);
}
function expect8536(value8897) {
    var token8898 = lex8526();
    if (token8898.type !== Token8469.Punctuator || token8898.value !== value8897) {
        throwUnexpected8535(token8898);
    }
}
function expectKeyword8537(keyword8899) {
    var token8900 = lex8526();
    if (token8900.type !== Token8469.Keyword || token8900.value !== keyword8899) {
        throwUnexpected8535(token8900);
    }
}
function match8538(value8901) {
    return lookahead8491.type === Token8469.Punctuator && lookahead8491.value === value8901;
}
function matchKeyword8539(keyword8902) {
    return lookahead8491.type === Token8469.Keyword && lookahead8491.value === keyword8902;
}
function matchContextualKeyword8540(keyword8903) {
    return lookahead8491.type === Token8469.Identifier && lookahead8491.value === keyword8903;
}
function matchAssign8541() {
    var op8904;
    if (lookahead8491.type !== Token8469.Punctuator) {
        return false;
    }
    op8904 = lookahead8491.value;
    return op8904 === "=" || op8904 === "*=" || op8904 === "/=" || op8904 === "%=" || op8904 === "+=" || op8904 === "-=" || op8904 === "<<=" || op8904 === ">>=" || op8904 === ">>>=" || op8904 === "&=" || op8904 === "^=" || op8904 === "|=";
}
function consumeSemicolon8542() {
    var line8905, ch8906;
    ch8906 = lookahead8491.value ? String(lookahead8491.value).charCodeAt(0) : -1;
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    ch8906 === 59) {
        lex8526();
        return;
    }
    if (lookahead8491.lineNumber !== lineNumber8481) {
        return;
    }
    if (match8538(";")) {
        lex8526();
        return;
    }
    if (lookahead8491.type !== Token8469.EOF && !match8538("}")) {
        throwUnexpected8535(lookahead8491);
    }
}
function isLeftHandSide8543(expr8907) {
    return expr8907.type === Syntax8472.Identifier || expr8907.type === Syntax8472.MemberExpression;
}
function isAssignableLeftHandSide8544(expr8908) {
    return isLeftHandSide8543(expr8908) || expr8908.type === Syntax8472.ObjectPattern || expr8908.type === Syntax8472.ArrayPattern;
}
function parseArrayInitialiser8545() {
    var elements8909 = [],
        blocks8910 = [],
        filter8911 = null,
        tmp8912,
        possiblecomprehension8913 = true,
        body8914,
        marker8915 = markerCreate8529();
    expect8536("[");
    while (!match8538("]")) {
        if (lookahead8491.value === "for" && lookahead8491.type === Token8469.Keyword) {
            if (!possiblecomprehension8913) {
                throwError8533({}, Messages8474.ComprehensionError);
            }
            matchKeyword8539("for");
            tmp8912 = parseForStatement8593({ ignoreBody: true });
            tmp8912.of = tmp8912.type === Syntax8472.ForOfStatement;
            tmp8912.type = Syntax8472.ComprehensionBlock;
            if (tmp8912.left.kind) {
                // can't be let or const
                throwError8533({}, Messages8474.ComprehensionError);
            }
            blocks8910.push(tmp8912);
        } else if (lookahead8491.value === "if" && lookahead8491.type === Token8469.Keyword) {
            if (!possiblecomprehension8913) {
                throwError8533({}, Messages8474.ComprehensionError);
            }
            expectKeyword8537("if");
            expect8536("(");
            filter8911 = parseExpression8573();
            expect8536(")");
        } else if (lookahead8491.value === "," && lookahead8491.type === Token8469.Punctuator) {
            possiblecomprehension8913 = false;
            // no longer allowed.
            lex8526();
            elements8909.push(null);
        } else {
            tmp8912 = parseSpreadOrAssignmentExpression8556();
            elements8909.push(tmp8912);
            if (tmp8912 && tmp8912.type === Syntax8472.SpreadElement) {
                if (!match8538("]")) {
                    throwError8533({}, Messages8474.ElementAfterSpreadElement);
                }
            } else if (!(match8538("]") || matchKeyword8539("for") || matchKeyword8539("if"))) {
                expect8536(",");
                // this lexes.
                possiblecomprehension8913 = false;
            }
        }
    }
    expect8536("]");
    if (filter8911 && !blocks8910.length) {
        throwError8533({}, Messages8474.ComprehensionRequiresBlock);
    }
    if (blocks8910.length) {
        if (elements8909.length !== 1) {
            throwError8533({}, Messages8474.ComprehensionError);
        }
        return markerApply8531(marker8915, delegate8488.createComprehensionExpression(filter8911, blocks8910, elements8909[0]));
    }
    return markerApply8531(marker8915, delegate8488.createArrayExpression(elements8909));
}
function parsePropertyFunction8546(options8916) {
    var previousStrict8917,
        previousYieldAllowed8918,
        params8919,
        defaults8920,
        body8921,
        marker8922 = markerCreate8529();
    previousStrict8917 = strict8479;
    previousYieldAllowed8918 = state8493.yieldAllowed;
    state8493.yieldAllowed = options8916.generator;
    params8919 = options8916.params || [];
    defaults8920 = options8916.defaults || [];
    body8921 = parseConciseBody8605();
    if (options8916.name && strict8479 && isRestrictedWord8507(params8919[0].name)) {
        throwErrorTolerant8534(options8916.name, Messages8474.StrictParamName);
    }
    strict8479 = previousStrict8917;
    state8493.yieldAllowed = previousYieldAllowed8918;
    return markerApply8531(marker8922, delegate8488.createFunctionExpression(null, params8919, defaults8920, body8921, options8916.rest || null, options8916.generator, body8921.type !== Syntax8472.BlockStatement));
}
function parsePropertyMethodFunction8547(options8923) {
    var previousStrict8924, tmp8925, method8926;
    previousStrict8924 = strict8479;
    strict8479 = true;
    tmp8925 = parseParams8609();
    if (tmp8925.stricted) {
        throwErrorTolerant8534(tmp8925.stricted, tmp8925.message);
    }
    method8926 = parsePropertyFunction8546({
        params: tmp8925.params,
        defaults: tmp8925.defaults,
        rest: tmp8925.rest,
        generator: options8923.generator
    });
    strict8479 = previousStrict8924;
    return method8926;
}
function parseObjectPropertyKey8548() {
    var marker8927 = markerCreate8529(),
        token8928 = lex8526(),
        propertyKey8929,
        result8930;
    if ( // Note: This function is called only from parseObjectProperty(), where
    // EOF and Punctuator tokens are already filtered out.
    token8928.type === Token8469.StringLiteral || token8928.type === Token8469.NumericLiteral) {
        if (strict8479 && token8928.octal) {
            throwErrorTolerant8534(token8928, Messages8474.StrictOctalLiteral);
        }
        return markerApply8531(marker8927, delegate8488.createLiteral(token8928));
    }
    if (token8928.type === Token8469.Punctuator && token8928.value === "[") {
        // For computed properties we should skip the [ and ], and
        // capture in marker only the assignment expression itself.
        marker8927 = markerCreate8529();
        propertyKey8929 = parseAssignmentExpression8572();
        result8930 = markerApply8531(marker8927, propertyKey8929);
        expect8536("]");
        return result8930;
    }
    return markerApply8531(marker8927, delegate8488.createIdentifier(token8928.value));
}
function parseObjectProperty8549() {
    var token8931,
        key8932,
        id8933,
        value8934,
        param8935,
        expr8936,
        computed8937,
        marker8938 = markerCreate8529();
    token8931 = lookahead8491;
    computed8937 = token8931.value === "[" && token8931.type === Token8469.Punctuator;
    if (token8931.type === Token8469.Identifier || computed8937) {
        id8933 = parseObjectPropertyKey8548();
        if ( // Property Assignment: Getter and Setter.
        token8931.value === "get" && !(match8538(":") || match8538("("))) {
            computed8937 = lookahead8491.value === "[";
            key8932 = parseObjectPropertyKey8548();
            expect8536("(");
            expect8536(")");
            return markerApply8531(marker8938, delegate8488.createProperty("get", key8932, parsePropertyFunction8546({ generator: false }), false, false, computed8937));
        }
        if (token8931.value === "set" && !(match8538(":") || match8538("("))) {
            computed8937 = lookahead8491.value === "[";
            key8932 = parseObjectPropertyKey8548();
            expect8536("(");
            token8931 = lookahead8491;
            param8935 = [parseVariableIdentifier8576()];
            expect8536(")");
            return markerApply8531(marker8938, delegate8488.createProperty("set", key8932, parsePropertyFunction8546({
                params: param8935,
                generator: false,
                name: token8931
            }), false, false, computed8937));
        }
        if (match8538(":")) {
            lex8526();
            return markerApply8531(marker8938, delegate8488.createProperty("init", id8933, parseAssignmentExpression8572(), false, false, computed8937));
        }
        if (match8538("(")) {
            return markerApply8531(marker8938, delegate8488.createProperty("init", id8933, parsePropertyMethodFunction8547({ generator: false }), true, false, computed8937));
        }
        if (computed8937) {
            // Computed properties can only be used with full notation.
            throwUnexpected8535(lookahead8491);
        }
        return markerApply8531(marker8938, delegate8488.createProperty("init", id8933, id8933, false, true, false));
    }
    if (token8931.type === Token8469.EOF || token8931.type === Token8469.Punctuator) {
        if (!match8538("*")) {
            throwUnexpected8535(token8931);
        }
        lex8526();
        computed8937 = lookahead8491.type === Token8469.Punctuator && lookahead8491.value === "[";
        id8933 = parseObjectPropertyKey8548();
        if (!match8538("(")) {
            throwUnexpected8535(lex8526());
        }
        return markerApply8531(marker8938, delegate8488.createProperty("init", id8933, parsePropertyMethodFunction8547({ generator: true }), true, false, computed8937));
    }
    key8932 = parseObjectPropertyKey8548();
    if (match8538(":")) {
        lex8526();
        return markerApply8531(marker8938, delegate8488.createProperty("init", key8932, parseAssignmentExpression8572(), false, false, false));
    }
    if (match8538("(")) {
        return markerApply8531(marker8938, delegate8488.createProperty("init", key8932, parsePropertyMethodFunction8547({ generator: false }), true, false, false));
    }
    throwUnexpected8535(lex8526());
}
function parseObjectInitialiser8550() {
    var properties8939 = [],
        property8940,
        name8941,
        key8942,
        kind8943,
        map8944 = {},
        toString8945 = String,
        marker8946 = markerCreate8529();
    expect8536("{");
    while (!match8538("}")) {
        property8940 = parseObjectProperty8549();
        if (property8940.key.type === Syntax8472.Identifier) {
            name8941 = property8940.key.name;
        } else {
            name8941 = toString8945(property8940.key.value);
        }
        kind8943 = property8940.kind === "init" ? PropertyKind8473.Data : property8940.kind === "get" ? PropertyKind8473.Get : PropertyKind8473.Set;
        key8942 = "$" + name8941;
        if (Object.prototype.hasOwnProperty.call(map8944, key8942)) {
            if (map8944[key8942] === PropertyKind8473.Data) {
                if (strict8479 && kind8943 === PropertyKind8473.Data) {
                    throwErrorTolerant8534({}, Messages8474.StrictDuplicateProperty);
                } else if (kind8943 !== PropertyKind8473.Data) {
                    throwErrorTolerant8534({}, Messages8474.AccessorDataProperty);
                }
            } else {
                if (kind8943 === PropertyKind8473.Data) {
                    throwErrorTolerant8534({}, Messages8474.AccessorDataProperty);
                } else if (map8944[key8942] & kind8943) {
                    throwErrorTolerant8534({}, Messages8474.AccessorGetSet);
                }
            }
            map8944[key8942] |= kind8943;
        } else {
            map8944[key8942] = kind8943;
        }
        properties8939.push(property8940);
        if (!match8538("}")) {
            expect8536(",");
        }
    }
    expect8536("}");
    return markerApply8531(marker8946, delegate8488.createObjectExpression(properties8939));
}
function parseTemplateElement8551(option8947) {
    var marker8948 = markerCreate8529(),
        token8949 = lex8526();
    if (strict8479 && token8949.octal) {
        throwError8533(token8949, Messages8474.StrictOctalLiteral);
    }
    return markerApply8531(marker8948, delegate8488.createTemplateElement({
        raw: token8949.value.raw,
        cooked: token8949.value.cooked
    }, token8949.tail));
}
function parseTemplateLiteral8552() {
    var quasi8950,
        quasis8951,
        expressions8952,
        marker8953 = markerCreate8529();
    quasi8950 = parseTemplateElement8551({ head: true });
    quasis8951 = [quasi8950];
    expressions8952 = [];
    while (!quasi8950.tail) {
        expressions8952.push(parseExpression8573());
        quasi8950 = parseTemplateElement8551({ head: false });
        quasis8951.push(quasi8950);
    }
    return markerApply8531(marker8953, delegate8488.createTemplateLiteral(quasis8951, expressions8952));
}
function parseGroupExpression8553() {
    var expr8954;
    expect8536("(");
    ++state8493.parenthesizedCount;
    expr8954 = parseExpression8573();
    expect8536(")");
    return expr8954;
}
function parsePrimaryExpression8554() {
    var type8955, token8956, resolvedIdent8957, marker8958, expr8959;
    token8956 = lookahead8491;
    type8955 = lookahead8491.type;
    if (type8955 === Token8469.Identifier) {
        marker8958 = markerCreate8529();
        resolvedIdent8957 = expander8468.resolve(tokenStream8489[lookaheadIndex8492], phase8494);
        lex8526();
        return markerApply8531(marker8958, delegate8488.createIdentifier(resolvedIdent8957));
    }
    if (type8955 === Token8469.StringLiteral || type8955 === Token8469.NumericLiteral) {
        if (strict8479 && lookahead8491.octal) {
            throwErrorTolerant8534(lookahead8491, Messages8474.StrictOctalLiteral);
        }
        marker8958 = markerCreate8529();
        return markerApply8531(marker8958, delegate8488.createLiteral(lex8526()));
    }
    if (type8955 === Token8469.Keyword) {
        if (matchKeyword8539("this")) {
            marker8958 = markerCreate8529();
            lex8526();
            return markerApply8531(marker8958, delegate8488.createThisExpression());
        }
        if (matchKeyword8539("function")) {
            return parseFunctionExpression8611();
        }
        if (matchKeyword8539("class")) {
            return parseClassExpression8616();
        }
        if (matchKeyword8539("super")) {
            marker8958 = markerCreate8529();
            lex8526();
            return markerApply8531(marker8958, delegate8488.createIdentifier("super"));
        }
    }
    if (type8955 === Token8469.BooleanLiteral) {
        marker8958 = markerCreate8529();
        token8956 = lex8526();
        if (typeof token8956.value !== "boolean") {
            assert8496(token8956.value === "true" || token8956.value === "false", "exporting either true or false as a string not: " + token8956.value);
            token8956.value = token8956.value === "true";
        }
        return markerApply8531(marker8958, delegate8488.createLiteral(token8956));
    }
    if (type8955 === Token8469.NullLiteral) {
        marker8958 = markerCreate8529();
        token8956 = lex8526();
        token8956.value = null;
        return markerApply8531(marker8958, delegate8488.createLiteral(token8956));
    }
    if (match8538("[")) {
        return parseArrayInitialiser8545();
    }
    if (match8538("{")) {
        return parseObjectInitialiser8550();
    }
    if (match8538("(")) {
        return parseGroupExpression8553();
    }
    if (lookahead8491.type === Token8469.RegularExpression) {
        marker8958 = markerCreate8529();
        return markerApply8531(marker8958, delegate8488.createLiteral(lex8526()));
    }
    if (type8955 === Token8469.Template) {
        return parseTemplateLiteral8552();
    }
    throwUnexpected8535(lex8526());
}
function parseArguments8555() {
    var args8960 = [],
        arg8961;
    expect8536("(");
    if (!match8538(")")) {
        while (streamIndex8490 < length8487) {
            arg8961 = parseSpreadOrAssignmentExpression8556();
            args8960.push(arg8961);
            if (match8538(")")) {
                break;
            } else if (arg8961.type === Syntax8472.SpreadElement) {
                throwError8533({}, Messages8474.ElementAfterSpreadElement);
            }
            expect8536(",");
        }
    }
    expect8536(")");
    return args8960;
}
function parseSpreadOrAssignmentExpression8556() {
    if (match8538("...")) {
        var marker8962 = markerCreate8529();
        lex8526();
        return markerApply8531(marker8962, delegate8488.createSpreadElement(parseAssignmentExpression8572()));
    }
    return parseAssignmentExpression8572();
}
function parseNonComputedProperty8557(toResolve8963) {
    var marker8964 = markerCreate8529(),
        resolvedIdent8965,
        token8966;
    if (toResolve8963) {
        resolvedIdent8965 = expander8468.resolve(tokenStream8489[lookaheadIndex8492], phase8494);
    }
    token8966 = lex8526();
    resolvedIdent8965 = toResolve8963 ? resolvedIdent8965 : token8966.value;
    if (!isIdentifierName8523(token8966)) {
        throwUnexpected8535(token8966);
    }
    return markerApply8531(marker8964, delegate8488.createIdentifier(resolvedIdent8965));
}
function parseNonComputedMember8558() {
    expect8536(".");
    return parseNonComputedProperty8557();
}
function parseComputedMember8559() {
    var expr8967;
    expect8536("[");
    expr8967 = parseExpression8573();
    expect8536("]");
    return expr8967;
}
function parseNewExpression8560() {
    var callee8968,
        args8969,
        marker8970 = markerCreate8529();
    expectKeyword8537("new");
    callee8968 = parseLeftHandSideExpression8562();
    args8969 = match8538("(") ? parseArguments8555() : [];
    return markerApply8531(marker8970, delegate8488.createNewExpression(callee8968, args8969));
}
function parseLeftHandSideExpressionAllowCall8561() {
    var expr8971,
        args8972,
        marker8973 = markerCreate8529();
    expr8971 = matchKeyword8539("new") ? parseNewExpression8560() : parsePrimaryExpression8554();
    while (match8538(".") || match8538("[") || match8538("(") || lookahead8491.type === Token8469.Template) {
        if (match8538("(")) {
            args8972 = parseArguments8555();
            expr8971 = markerApply8531(marker8973, delegate8488.createCallExpression(expr8971, args8972));
        } else if (match8538("[")) {
            expr8971 = markerApply8531(marker8973, delegate8488.createMemberExpression("[", expr8971, parseComputedMember8559()));
        } else if (match8538(".")) {
            expr8971 = markerApply8531(marker8973, delegate8488.createMemberExpression(".", expr8971, parseNonComputedMember8558()));
        } else {
            expr8971 = markerApply8531(marker8973, delegate8488.createTaggedTemplateExpression(expr8971, parseTemplateLiteral8552()));
        }
    }
    return expr8971;
}
function parseLeftHandSideExpression8562() {
    var expr8974,
        marker8975 = markerCreate8529();
    expr8974 = matchKeyword8539("new") ? parseNewExpression8560() : parsePrimaryExpression8554();
    while (match8538(".") || match8538("[") || lookahead8491.type === Token8469.Template) {
        if (match8538("[")) {
            expr8974 = markerApply8531(marker8975, delegate8488.createMemberExpression("[", expr8974, parseComputedMember8559()));
        } else if (match8538(".")) {
            expr8974 = markerApply8531(marker8975, delegate8488.createMemberExpression(".", expr8974, parseNonComputedMember8558()));
        } else {
            expr8974 = markerApply8531(marker8975, delegate8488.createTaggedTemplateExpression(expr8974, parseTemplateLiteral8552()));
        }
    }
    return expr8974;
}
function parsePostfixExpression8563() {
    var marker8976 = markerCreate8529(),
        expr8977 = parseLeftHandSideExpressionAllowCall8561(),
        token8978;
    if (lookahead8491.type !== Token8469.Punctuator) {
        return expr8977;
    }
    if ((match8538("++") || match8538("--")) && !peekLineTerminator8532()) {
        if ( // 11.3.1, 11.3.2
        strict8479 && expr8977.type === Syntax8472.Identifier && isRestrictedWord8507(expr8977.name)) {
            throwErrorTolerant8534({}, Messages8474.StrictLHSPostfix);
        }
        if (!isLeftHandSide8543(expr8977)) {
            throwError8533({}, Messages8474.InvalidLHSInAssignment);
        }
        token8978 = lex8526();
        expr8977 = markerApply8531(marker8976, delegate8488.createPostfixExpression(token8978.value, expr8977));
    }
    return expr8977;
}
function parseUnaryExpression8564() {
    var marker8979, token8980, expr8981;
    if (lookahead8491.type !== Token8469.Punctuator && lookahead8491.type !== Token8469.Keyword) {
        return parsePostfixExpression8563();
    }
    if (match8538("++") || match8538("--")) {
        marker8979 = markerCreate8529();
        token8980 = lex8526();
        expr8981 = parseUnaryExpression8564();
        if ( // 11.4.4, 11.4.5
        strict8479 && expr8981.type === Syntax8472.Identifier && isRestrictedWord8507(expr8981.name)) {
            throwErrorTolerant8534({}, Messages8474.StrictLHSPrefix);
        }
        if (!isLeftHandSide8543(expr8981)) {
            throwError8533({}, Messages8474.InvalidLHSInAssignment);
        }
        return markerApply8531(marker8979, delegate8488.createUnaryExpression(token8980.value, expr8981));
    }
    if (match8538("+") || match8538("-") || match8538("~") || match8538("!")) {
        marker8979 = markerCreate8529();
        token8980 = lex8526();
        expr8981 = parseUnaryExpression8564();
        return markerApply8531(marker8979, delegate8488.createUnaryExpression(token8980.value, expr8981));
    }
    if (matchKeyword8539("delete") || matchKeyword8539("void") || matchKeyword8539("typeof")) {
        marker8979 = markerCreate8529();
        token8980 = lex8526();
        expr8981 = parseUnaryExpression8564();
        expr8981 = markerApply8531(marker8979, delegate8488.createUnaryExpression(token8980.value, expr8981));
        if (strict8479 && expr8981.operator === "delete" && expr8981.argument.type === Syntax8472.Identifier) {
            throwErrorTolerant8534({}, Messages8474.StrictDelete);
        }
        return expr8981;
    }
    return parsePostfixExpression8563();
}
function binaryPrecedence8565(token8982, allowIn8983) {
    var prec8984 = 0;
    if (token8982.type !== Token8469.Punctuator && token8982.type !== Token8469.Keyword) {
        return 0;
    }
    switch (token8982.value) {
        case "||":
            prec8984 = 1;
            break;
        case "&&":
            prec8984 = 2;
            break;
        case "|":
            prec8984 = 3;
            break;
        case "^":
            prec8984 = 4;
            break;
        case "&":
            prec8984 = 5;
            break;
        case "==":
        case "!=":
        case "===":
        case "!==":
            prec8984 = 6;
            break;
        case "<":
        case ">":
        case "<=":
        case ">=":
        case "instanceof":
            prec8984 = 7;
            break;
        case "in":
            prec8984 = allowIn8983 ? 7 : 0;
            break;
        case "<<":
        case ">>":
        case ">>>":
            prec8984 = 8;
            break;
        case "+":
        case "-":
            prec8984 = 9;
            break;
        case "*":
        case "/":
        case "%":
            prec8984 = 11;
            break;
        default:
            break;
    }
    return prec8984;
}
function parseBinaryExpression8566() {
    var expr8985, token8986, prec8987, previousAllowIn8988, stack8989, right8990, operator8991, left8992, i8993, marker8994, markers8995;
    previousAllowIn8988 = state8493.allowIn;
    state8493.allowIn = true;
    marker8994 = markerCreate8529();
    left8992 = parseUnaryExpression8564();
    token8986 = lookahead8491;
    prec8987 = binaryPrecedence8565(token8986, previousAllowIn8988);
    if (prec8987 === 0) {
        return left8992;
    }
    token8986.prec = prec8987;
    lex8526();
    markers8995 = [marker8994, markerCreate8529()];
    right8990 = parseUnaryExpression8564();
    stack8989 = [left8992, token8986, right8990];
    while ((prec8987 = binaryPrecedence8565(lookahead8491, previousAllowIn8988)) > 0) {
        while ( // Reduce: make a binary expression from the three topmost entries.
        stack8989.length > 2 && prec8987 <= stack8989[stack8989.length - 2].prec) {
            right8990 = stack8989.pop();
            operator8991 = stack8989.pop().value;
            left8992 = stack8989.pop();
            expr8985 = delegate8488.createBinaryExpression(operator8991, left8992, right8990);
            markers8995.pop();
            marker8994 = markers8995.pop();
            markerApply8531(marker8994, expr8985);
            stack8989.push(expr8985);
            markers8995.push(marker8994);
        }
        // Shift.
        token8986 = lex8526();
        token8986.prec = prec8987;
        stack8989.push(token8986);
        markers8995.push(markerCreate8529());
        expr8985 = parseUnaryExpression8564();
        stack8989.push(expr8985);
    }
    state8493.allowIn = previousAllowIn8988;
    // Final reduce to clean-up the stack.
    i8993 = stack8989.length - 1;
    expr8985 = stack8989[i8993];
    markers8995.pop();
    while (i8993 > 1) {
        expr8985 = delegate8488.createBinaryExpression(stack8989[i8993 - 1].value, stack8989[i8993 - 2], expr8985);
        i8993 -= 2;
        marker8994 = markers8995.pop();
        markerApply8531(marker8994, expr8985);
    }
    return expr8985;
}
function parseConditionalExpression8567() {
    var expr8996,
        previousAllowIn8997,
        consequent8998,
        alternate8999,
        marker9000 = markerCreate8529();
    expr8996 = parseBinaryExpression8566();
    if (match8538("?")) {
        lex8526();
        previousAllowIn8997 = state8493.allowIn;
        state8493.allowIn = true;
        consequent8998 = parseAssignmentExpression8572();
        state8493.allowIn = previousAllowIn8997;
        expect8536(":");
        alternate8999 = parseAssignmentExpression8572();
        expr8996 = markerApply8531(marker9000, delegate8488.createConditionalExpression(expr8996, consequent8998, alternate8999));
    }
    return expr8996;
}
function reinterpretAsAssignmentBindingPattern8568(expr9001) {
    var i9002, len9003, property9004, element9005;
    if (expr9001.type === Syntax8472.ObjectExpression) {
        expr9001.type = Syntax8472.ObjectPattern;
        for (i9002 = 0, len9003 = expr9001.properties.length; i9002 < len9003; i9002 += 1) {
            property9004 = expr9001.properties[i9002];
            if (property9004.kind !== "init") {
                throwError8533({}, Messages8474.InvalidLHSInAssignment);
            }
            reinterpretAsAssignmentBindingPattern8568(property9004.value);
        }
    } else if (expr9001.type === Syntax8472.ArrayExpression) {
        expr9001.type = Syntax8472.ArrayPattern;
        for (i9002 = 0, len9003 = expr9001.elements.length; i9002 < len9003; i9002 += 1) {
            element9005 = expr9001.elements[i9002];
            if (element9005) {
                reinterpretAsAssignmentBindingPattern8568(element9005);
            }
        }
    } else if (expr9001.type === Syntax8472.Identifier) {
        if (isRestrictedWord8507(expr9001.name)) {
            throwError8533({}, Messages8474.InvalidLHSInAssignment);
        }
    } else if (expr9001.type === Syntax8472.SpreadElement) {
        reinterpretAsAssignmentBindingPattern8568(expr9001.argument);
        if (expr9001.argument.type === Syntax8472.ObjectPattern) {
            throwError8533({}, Messages8474.ObjectPatternAsSpread);
        }
    } else {
        if (expr9001.type !== Syntax8472.MemberExpression && expr9001.type !== Syntax8472.CallExpression && expr9001.type !== Syntax8472.NewExpression) {
            throwError8533({}, Messages8474.InvalidLHSInAssignment);
        }
    }
}
function reinterpretAsDestructuredParameter8569(options9006, expr9007) {
    var i9008, len9009, property9010, element9011;
    if (expr9007.type === Syntax8472.ObjectExpression) {
        expr9007.type = Syntax8472.ObjectPattern;
        for (i9008 = 0, len9009 = expr9007.properties.length; i9008 < len9009; i9008 += 1) {
            property9010 = expr9007.properties[i9008];
            if (property9010.kind !== "init") {
                throwError8533({}, Messages8474.InvalidLHSInFormalsList);
            }
            reinterpretAsDestructuredParameter8569(options9006, property9010.value);
        }
    } else if (expr9007.type === Syntax8472.ArrayExpression) {
        expr9007.type = Syntax8472.ArrayPattern;
        for (i9008 = 0, len9009 = expr9007.elements.length; i9008 < len9009; i9008 += 1) {
            element9011 = expr9007.elements[i9008];
            if (element9011) {
                reinterpretAsDestructuredParameter8569(options9006, element9011);
            }
        }
    } else if (expr9007.type === Syntax8472.Identifier) {
        validateParam8607(options9006, expr9007, expr9007.name);
    } else {
        if (expr9007.type !== Syntax8472.MemberExpression) {
            throwError8533({}, Messages8474.InvalidLHSInFormalsList);
        }
    }
}
function reinterpretAsCoverFormalsList8570(expressions9012) {
    var i9013, len9014, param9015, params9016, defaults9017, defaultCount9018, options9019, rest9020;
    params9016 = [];
    defaults9017 = [];
    defaultCount9018 = 0;
    rest9020 = null;
    options9019 = { paramSet: {} };
    for (i9013 = 0, len9014 = expressions9012.length; i9013 < len9014; i9013 += 1) {
        param9015 = expressions9012[i9013];
        if (param9015.type === Syntax8472.Identifier) {
            params9016.push(param9015);
            defaults9017.push(null);
            validateParam8607(options9019, param9015, param9015.name);
        } else if (param9015.type === Syntax8472.ObjectExpression || param9015.type === Syntax8472.ArrayExpression) {
            reinterpretAsDestructuredParameter8569(options9019, param9015);
            params9016.push(param9015);
            defaults9017.push(null);
        } else if (param9015.type === Syntax8472.SpreadElement) {
            assert8496(i9013 === len9014 - 1, "It is guaranteed that SpreadElement is last element by parseExpression");
            reinterpretAsDestructuredParameter8569(options9019, param9015.argument);
            rest9020 = param9015.argument;
        } else if (param9015.type === Syntax8472.AssignmentExpression) {
            params9016.push(param9015.left);
            defaults9017.push(param9015.right);
            ++defaultCount9018;
            validateParam8607(options9019, param9015.left, param9015.left.name);
        } else {
            return null;
        }
    }
    if (options9019.message === Messages8474.StrictParamDupe) {
        throwError8533(strict8479 ? options9019.stricted : options9019.firstRestricted, options9019.message);
    }
    if (defaultCount9018 === 0) {
        defaults9017 = [];
    }
    return {
        params: params9016,
        defaults: defaults9017,
        rest: rest9020,
        stricted: options9019.stricted,
        firstRestricted: options9019.firstRestricted,
        message: options9019.message
    };
}
function parseArrowFunctionExpression8571(options9021, marker9022) {
    var previousStrict9023, previousYieldAllowed9024, body9025;
    expect8536("=>");
    previousStrict9023 = strict8479;
    previousYieldAllowed9024 = state8493.yieldAllowed;
    state8493.yieldAllowed = false;
    body9025 = parseConciseBody8605();
    if (strict8479 && options9021.firstRestricted) {
        throwError8533(options9021.firstRestricted, options9021.message);
    }
    if (strict8479 && options9021.stricted) {
        throwErrorTolerant8534(options9021.stricted, options9021.message);
    }
    strict8479 = previousStrict9023;
    state8493.yieldAllowed = previousYieldAllowed9024;
    return markerApply8531(marker9022, delegate8488.createArrowFunctionExpression(options9021.params, options9021.defaults, body9025, options9021.rest, body9025.type !== Syntax8472.BlockStatement));
}
function parseAssignmentExpression8572() {
    var marker9026, expr9027, token9028, params9029, oldParenthesizedCount9030;
    if ( // Note that 'yield' is treated as a keyword in strict mode, but a
    // contextual keyword (identifier) in non-strict mode, so we need
    // to use matchKeyword and matchContextualKeyword appropriately.
    state8493.yieldAllowed && matchContextualKeyword8540("yield") || strict8479 && matchKeyword8539("yield")) {
        return parseYieldExpression8612();
    }
    oldParenthesizedCount9030 = state8493.parenthesizedCount;
    marker9026 = markerCreate8529();
    if (match8538("(")) {
        token9028 = lookahead28528();
        if (token9028.type === Token8469.Punctuator && token9028.value === ")" || token9028.value === "...") {
            params9029 = parseParams8609();
            if (!match8538("=>")) {
                throwUnexpected8535(lex8526());
            }
            return parseArrowFunctionExpression8571(params9029, marker9026);
        }
    }
    token9028 = lookahead8491;
    expr9027 = parseConditionalExpression8567();
    if (match8538("=>") && (state8493.parenthesizedCount === oldParenthesizedCount9030 || state8493.parenthesizedCount === oldParenthesizedCount9030 + 1)) {
        if (expr9027.type === Syntax8472.Identifier) {
            params9029 = reinterpretAsCoverFormalsList8570([expr9027]);
        } else if (expr9027.type === Syntax8472.SequenceExpression) {
            params9029 = reinterpretAsCoverFormalsList8570(expr9027.expressions);
        }
        if (params9029) {
            return parseArrowFunctionExpression8571(params9029, marker9026);
        }
    }
    if (matchAssign8541()) {
        if ( // 11.13.1
        strict8479 && expr9027.type === Syntax8472.Identifier && isRestrictedWord8507(expr9027.name)) {
            throwErrorTolerant8534(token9028, Messages8474.StrictLHSAssignment);
        }
        if ( // ES.next draf 11.13 Runtime Semantics step 1
        match8538("=") && (expr9027.type === Syntax8472.ObjectExpression || expr9027.type === Syntax8472.ArrayExpression)) {
            reinterpretAsAssignmentBindingPattern8568(expr9027);
        } else if (!isLeftHandSide8543(expr9027)) {
            throwError8533({}, Messages8474.InvalidLHSInAssignment);
        }
        expr9027 = markerApply8531(marker9026, delegate8488.createAssignmentExpression(lex8526().value, expr9027, parseAssignmentExpression8572()));
    }
    return expr9027;
}
function parseExpression8573() {
    var marker9031, expr9032, expressions9033, sequence9034, coverFormalsList9035, spreadFound9036, oldParenthesizedCount9037;
    oldParenthesizedCount9037 = state8493.parenthesizedCount;
    marker9031 = markerCreate8529();
    expr9032 = parseAssignmentExpression8572();
    expressions9033 = [expr9032];
    if (match8538(",")) {
        while (streamIndex8490 < length8487) {
            if (!match8538(",")) {
                break;
            }
            lex8526();
            expr9032 = parseSpreadOrAssignmentExpression8556();
            expressions9033.push(expr9032);
            if (expr9032.type === Syntax8472.SpreadElement) {
                spreadFound9036 = true;
                if (!match8538(")")) {
                    throwError8533({}, Messages8474.ElementAfterSpreadElement);
                }
                break;
            }
        }
        sequence9034 = markerApply8531(marker9031, delegate8488.createSequenceExpression(expressions9033));
    }
    if (match8538("=>")) {
        if ( // Do not allow nested parentheses on the LHS of the =>.
        state8493.parenthesizedCount === oldParenthesizedCount9037 || state8493.parenthesizedCount === oldParenthesizedCount9037 + 1) {
            expr9032 = expr9032.type === Syntax8472.SequenceExpression ? expr9032.expressions : expressions9033;
            coverFormalsList9035 = reinterpretAsCoverFormalsList8570(expr9032);
            if (coverFormalsList9035) {
                return parseArrowFunctionExpression8571(coverFormalsList9035, marker9031);
            }
        }
        throwUnexpected8535(lex8526());
    }
    if (spreadFound9036 && lookahead28528().value !== "=>") {
        throwError8533({}, Messages8474.IllegalSpread);
    }
    return sequence9034 || expr9032;
}
function parseStatementList8574() {
    var list9038 = [],
        statement9039;
    while (streamIndex8490 < length8487) {
        if (match8538("}")) {
            break;
        }
        statement9039 = parseSourceElement8619();
        if (typeof statement9039 === "undefined") {
            break;
        }
        list9038.push(statement9039);
    }
    return list9038;
}
function parseBlock8575() {
    var block9040,
        marker9041 = markerCreate8529();
    expect8536("{");
    block9040 = parseStatementList8574();
    expect8536("}");
    return markerApply8531(marker9041, delegate8488.createBlockStatement(block9040));
}
function parseVariableIdentifier8576() {
    var token9042 = lookahead8491,
        resolvedIdent9043,
        marker9044 = markerCreate8529();
    if (token9042.type !== Token8469.Identifier) {
        throwUnexpected8535(token9042);
    }
    resolvedIdent9043 = expander8468.resolve(tokenStream8489[lookaheadIndex8492], phase8494);
    lex8526();
    return markerApply8531(marker9044, delegate8488.createIdentifier(resolvedIdent9043));
}
function parseVariableDeclaration8577(kind9045) {
    var id9046,
        marker9047 = markerCreate8529(),
        init9048 = null;
    if (match8538("{")) {
        id9046 = parseObjectInitialiser8550();
        reinterpretAsAssignmentBindingPattern8568(id9046);
    } else if (match8538("[")) {
        id9046 = parseArrayInitialiser8545();
        reinterpretAsAssignmentBindingPattern8568(id9046);
    } else {
        id9046 = state8493.allowKeyword ? parseNonComputedProperty8557() : parseVariableIdentifier8576();
        if ( // 12.2.1
        strict8479 && isRestrictedWord8507(id9046.name)) {
            throwErrorTolerant8534({}, Messages8474.StrictVarName);
        }
    }
    if (kind9045 === "const") {
        if (!match8538("=")) {
            throwError8533({}, Messages8474.NoUnintializedConst);
        }
        expect8536("=");
        init9048 = parseAssignmentExpression8572();
    } else if (match8538("=")) {
        lex8526();
        init9048 = parseAssignmentExpression8572();
    }
    return markerApply8531(marker9047, delegate8488.createVariableDeclarator(id9046, init9048));
}
function parseVariableDeclarationList8578(kind9049) {
    var list9050 = [];
    do {
        list9050.push(parseVariableDeclaration8577(kind9049));
        if (!match8538(",")) {
            break;
        }
        lex8526();
    } while (streamIndex8490 < length8487);
    return list9050;
}
function parseVariableStatement8579() {
    var declarations9051,
        marker9052 = markerCreate8529();
    expectKeyword8537("var");
    declarations9051 = parseVariableDeclarationList8578();
    consumeSemicolon8542();
    return markerApply8531(marker9052, delegate8488.createVariableDeclaration(declarations9051, "var"));
}
function parseConstLetDeclaration8580(kind9053) {
    var declarations9054,
        marker9055 = markerCreate8529();
    expectKeyword8537(kind9053);
    declarations9054 = parseVariableDeclarationList8578(kind9053);
    consumeSemicolon8542();
    return markerApply8531(marker9055, delegate8488.createVariableDeclaration(declarations9054, kind9053));
}
function parseModuleDeclaration8581() {
    var id9056,
        src9057,
        body9058,
        marker9059 = markerCreate8529();
    lex8526();
    if ( // 'module'
    peekLineTerminator8532()) {
        throwError8533({}, Messages8474.NewlineAfterModule);
    }
    switch (lookahead8491.type) {
        case Token8469.StringLiteral:
            id9056 = parsePrimaryExpression8554();
            body9058 = parseModuleBlock8624();
            src9057 = null;
            break;
        case Token8469.Identifier:
            id9056 = parseVariableIdentifier8576();
            body9058 = null;
            if (!matchContextualKeyword8540("from")) {
                throwUnexpected8535(lex8526());
            }
            lex8526();
            src9057 = parsePrimaryExpression8554();
            if (src9057.type !== Syntax8472.Literal) {
                throwError8533({}, Messages8474.InvalidModuleSpecifier);
            }
            break;
    }
    consumeSemicolon8542();
    return markerApply8531(marker9059, delegate8488.createModuleDeclaration(id9056, src9057, body9058));
}
function parseExportBatchSpecifier8582() {
    var marker9060 = markerCreate8529();
    expect8536("*");
    return markerApply8531(marker9060, delegate8488.createExportBatchSpecifier());
}
function parseExportSpecifier8583() {
    var id9061,
        name9062 = null,
        marker9063 = markerCreate8529();
    id9061 = parseVariableIdentifier8576();
    if (matchContextualKeyword8540("as")) {
        lex8526();
        name9062 = parseNonComputedProperty8557();
    }
    return markerApply8531(marker9063, delegate8488.createExportSpecifier(id9061, name9062));
}
function parseExportDeclaration8584() {
    var previousAllowKeyword9064,
        decl9065,
        def9066,
        src9067,
        specifiers9068,
        marker9069 = markerCreate8529();
    expectKeyword8537("export");
    if (lookahead8491.type === Token8469.Keyword) {
        switch (lookahead8491.value) {
            case "let":
            case "const":
            case "var":
            case "class":
            case "function":
                return markerApply8531(marker9069, delegate8488.createExportDeclaration(parseSourceElement8619(), null, null));
        }
    }
    if (isIdentifierName8523(lookahead8491)) {
        previousAllowKeyword9064 = state8493.allowKeyword;
        state8493.allowKeyword = true;
        decl9065 = parseVariableDeclarationList8578("let");
        state8493.allowKeyword = previousAllowKeyword9064;
        return markerApply8531(marker9069, delegate8488.createExportDeclaration(decl9065, null, null));
    }
    specifiers9068 = [];
    src9067 = null;
    if (match8538("*")) {
        specifiers9068.push(parseExportBatchSpecifier8582());
    } else {
        expect8536("{");
        do {
            specifiers9068.push(parseExportSpecifier8583());
        } while (match8538(",") && lex8526());
        expect8536("}");
    }
    if (matchContextualKeyword8540("from")) {
        lex8526();
        src9067 = parsePrimaryExpression8554();
        if (src9067.type !== Syntax8472.Literal) {
            throwError8533({}, Messages8474.InvalidModuleSpecifier);
        }
    }
    consumeSemicolon8542();
    return markerApply8531(marker9069, delegate8488.createExportDeclaration(null, specifiers9068, src9067));
}
function parseImportDeclaration8585() {
    var specifiers9070,
        kind9071,
        src9072,
        marker9073 = markerCreate8529();
    expectKeyword8537("import");
    specifiers9070 = [];
    if (isIdentifierName8523(lookahead8491)) {
        kind9071 = "default";
        specifiers9070.push(parseImportSpecifier8586());
        if (!matchContextualKeyword8540("from")) {
            throwError8533({}, Messages8474.NoFromAfterImport);
        }
        lex8526();
    } else if (match8538("{")) {
        kind9071 = "named";
        lex8526();
        do {
            specifiers9070.push(parseImportSpecifier8586());
        } while (match8538(",") && lex8526());
        expect8536("}");
        if (!matchContextualKeyword8540("from")) {
            throwError8533({}, Messages8474.NoFromAfterImport);
        }
        lex8526();
    }
    src9072 = parsePrimaryExpression8554();
    if (src9072.type !== Syntax8472.Literal) {
        throwError8533({}, Messages8474.InvalidModuleSpecifier);
    }
    consumeSemicolon8542();
    return markerApply8531(marker9073, delegate8488.createImportDeclaration(specifiers9070, kind9071, src9072));
}
function parseImportSpecifier8586() {
    var id9074,
        name9075 = null,
        marker9076 = markerCreate8529();
    id9074 = parseNonComputedProperty8557(true);
    if (matchContextualKeyword8540("as")) {
        lex8526();
        name9075 = parseVariableIdentifier8576();
    }
    return markerApply8531(marker9076, delegate8488.createImportSpecifier(id9074, name9075));
}
function parseEmptyStatement8587() {
    var marker9077 = markerCreate8529();
    expect8536(";");
    return markerApply8531(marker9077, delegate8488.createEmptyStatement());
}
function parseExpressionStatement8588() {
    var marker9078 = markerCreate8529(),
        expr9079 = parseExpression8573();
    consumeSemicolon8542();
    return markerApply8531(marker9078, delegate8488.createExpressionStatement(expr9079));
}
function parseIfStatement8589() {
    var test9080,
        consequent9081,
        alternate9082,
        marker9083 = markerCreate8529();
    expectKeyword8537("if");
    expect8536("(");
    test9080 = parseExpression8573();
    expect8536(")");
    consequent9081 = parseStatement8604();
    if (matchKeyword8539("else")) {
        lex8526();
        alternate9082 = parseStatement8604();
    } else {
        alternate9082 = null;
    }
    return markerApply8531(marker9083, delegate8488.createIfStatement(test9080, consequent9081, alternate9082));
}
function parseDoWhileStatement8590() {
    var body9084,
        test9085,
        oldInIteration9086,
        marker9087 = markerCreate8529();
    expectKeyword8537("do");
    oldInIteration9086 = state8493.inIteration;
    state8493.inIteration = true;
    body9084 = parseStatement8604();
    state8493.inIteration = oldInIteration9086;
    expectKeyword8537("while");
    expect8536("(");
    test9085 = parseExpression8573();
    expect8536(")");
    if (match8538(";")) {
        lex8526();
    }
    return markerApply8531(marker9087, delegate8488.createDoWhileStatement(body9084, test9085));
}
function parseWhileStatement8591() {
    var test9088,
        body9089,
        oldInIteration9090,
        marker9091 = markerCreate8529();
    expectKeyword8537("while");
    expect8536("(");
    test9088 = parseExpression8573();
    expect8536(")");
    oldInIteration9090 = state8493.inIteration;
    state8493.inIteration = true;
    body9089 = parseStatement8604();
    state8493.inIteration = oldInIteration9090;
    return markerApply8531(marker9091, delegate8488.createWhileStatement(test9088, body9089));
}
function parseForVariableDeclaration8592() {
    var marker9092 = markerCreate8529(),
        token9093 = lex8526(),
        declarations9094 = parseVariableDeclarationList8578();
    return markerApply8531(marker9092, delegate8488.createVariableDeclaration(declarations9094, token9093.value));
}
function parseForStatement8593(opts9095) {
    var init9096,
        test9097,
        update9098,
        left9099,
        right9100,
        body9101,
        operator9102,
        oldInIteration9103,
        marker9104 = markerCreate8529();
    init9096 = test9097 = update9098 = null;
    expectKeyword8537("for");
    if ( // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
    matchContextualKeyword8540("each")) {
        throwError8533({}, Messages8474.EachNotAllowed);
    }
    expect8536("(");
    if (match8538(";")) {
        lex8526();
    } else {
        if (matchKeyword8539("var") || matchKeyword8539("let") || matchKeyword8539("const")) {
            state8493.allowIn = false;
            init9096 = parseForVariableDeclaration8592();
            state8493.allowIn = true;
            if (init9096.declarations.length === 1) {
                if (matchKeyword8539("in") || matchContextualKeyword8540("of")) {
                    operator9102 = lookahead8491;
                    if (!((operator9102.value === "in" || init9096.kind !== "var") && init9096.declarations[0].init)) {
                        lex8526();
                        left9099 = init9096;
                        right9100 = parseExpression8573();
                        init9096 = null;
                    }
                }
            }
        } else {
            state8493.allowIn = false;
            init9096 = parseExpression8573();
            state8493.allowIn = true;
            if (matchContextualKeyword8540("of")) {
                operator9102 = lex8526();
                left9099 = init9096;
                right9100 = parseExpression8573();
                init9096 = null;
            } else if (matchKeyword8539("in")) {
                if ( // LeftHandSideExpression
                !isAssignableLeftHandSide8544(init9096)) {
                    throwError8533({}, Messages8474.InvalidLHSInForIn);
                }
                operator9102 = lex8526();
                left9099 = init9096;
                right9100 = parseExpression8573();
                init9096 = null;
            }
        }
        if (typeof left9099 === "undefined") {
            expect8536(";");
        }
    }
    if (typeof left9099 === "undefined") {
        if (!match8538(";")) {
            test9097 = parseExpression8573();
        }
        expect8536(";");
        if (!match8538(")")) {
            update9098 = parseExpression8573();
        }
    }
    expect8536(")");
    oldInIteration9103 = state8493.inIteration;
    state8493.inIteration = true;
    if (!(opts9095 !== undefined && opts9095.ignoreBody)) {
        body9101 = parseStatement8604();
    }
    state8493.inIteration = oldInIteration9103;
    if (typeof left9099 === "undefined") {
        return markerApply8531(marker9104, delegate8488.createForStatement(init9096, test9097, update9098, body9101));
    }
    if (operator9102.value === "in") {
        return markerApply8531(marker9104, delegate8488.createForInStatement(left9099, right9100, body9101));
    }
    return markerApply8531(marker9104, delegate8488.createForOfStatement(left9099, right9100, body9101));
}
function parseContinueStatement8594() {
    var label9105 = null,
        key9106,
        marker9107 = markerCreate8529();
    expectKeyword8537("continue");
    if ( // Optimize the most common form: 'continue;'.
    lookahead8491.value.charCodeAt(0) === 59) {
        lex8526();
        if (!state8493.inIteration) {
            throwError8533({}, Messages8474.IllegalContinue);
        }
        return markerApply8531(marker9107, delegate8488.createContinueStatement(null));
    }
    if (peekLineTerminator8532()) {
        if (!state8493.inIteration) {
            throwError8533({}, Messages8474.IllegalContinue);
        }
        return markerApply8531(marker9107, delegate8488.createContinueStatement(null));
    }
    if (lookahead8491.type === Token8469.Identifier) {
        label9105 = parseVariableIdentifier8576();
        key9106 = "$" + label9105.name;
        if (!Object.prototype.hasOwnProperty.call(state8493.labelSet, key9106)) {
            throwError8533({}, Messages8474.UnknownLabel, label9105.name);
        }
    }
    consumeSemicolon8542();
    if (label9105 === null && !state8493.inIteration) {
        throwError8533({}, Messages8474.IllegalContinue);
    }
    return markerApply8531(marker9107, delegate8488.createContinueStatement(label9105));
}
function parseBreakStatement8595() {
    var label9108 = null,
        key9109,
        marker9110 = markerCreate8529();
    expectKeyword8537("break");
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    lookahead8491.value.charCodeAt(0) === 59) {
        lex8526();
        if (!(state8493.inIteration || state8493.inSwitch)) {
            throwError8533({}, Messages8474.IllegalBreak);
        }
        return markerApply8531(marker9110, delegate8488.createBreakStatement(null));
    }
    if (peekLineTerminator8532()) {
        if (!(state8493.inIteration || state8493.inSwitch)) {
            throwError8533({}, Messages8474.IllegalBreak);
        }
        return markerApply8531(marker9110, delegate8488.createBreakStatement(null));
    }
    if (lookahead8491.type === Token8469.Identifier) {
        label9108 = parseVariableIdentifier8576();
        key9109 = "$" + label9108.name;
        if (!Object.prototype.hasOwnProperty.call(state8493.labelSet, key9109)) {
            throwError8533({}, Messages8474.UnknownLabel, label9108.name);
        }
    }
    consumeSemicolon8542();
    if (label9108 === null && !(state8493.inIteration || state8493.inSwitch)) {
        throwError8533({}, Messages8474.IllegalBreak);
    }
    return markerApply8531(marker9110, delegate8488.createBreakStatement(label9108));
}
function parseReturnStatement8596() {
    var argument9111 = null,
        marker9112 = markerCreate8529();
    expectKeyword8537("return");
    if (!state8493.inFunctionBody) {
        throwErrorTolerant8534({}, Messages8474.IllegalReturn);
    }
    if ( // 'return' followed by a space and an identifier is very common.
    isIdentifierStart8503(String(lookahead8491.value).charCodeAt(0))) {
        argument9111 = parseExpression8573();
        consumeSemicolon8542();
        return markerApply8531(marker9112, delegate8488.createReturnStatement(argument9111));
    }
    if (peekLineTerminator8532()) {
        return markerApply8531(marker9112, delegate8488.createReturnStatement(null));
    }
    if (!match8538(";")) {
        if (!match8538("}") && lookahead8491.type !== Token8469.EOF) {
            argument9111 = parseExpression8573();
        }
    }
    consumeSemicolon8542();
    return markerApply8531(marker9112, delegate8488.createReturnStatement(argument9111));
}
function parseWithStatement8597() {
    var object9113,
        body9114,
        marker9115 = markerCreate8529();
    if (strict8479) {
        throwErrorTolerant8534({}, Messages8474.StrictModeWith);
    }
    expectKeyword8537("with");
    expect8536("(");
    object9113 = parseExpression8573();
    expect8536(")");
    body9114 = parseStatement8604();
    return markerApply8531(marker9115, delegate8488.createWithStatement(object9113, body9114));
}
function parseSwitchCase8598() {
    var test9116,
        consequent9117 = [],
        sourceElement9118,
        marker9119 = markerCreate8529();
    if (matchKeyword8539("default")) {
        lex8526();
        test9116 = null;
    } else {
        expectKeyword8537("case");
        test9116 = parseExpression8573();
    }
    expect8536(":");
    while (streamIndex8490 < length8487) {
        if (match8538("}") || matchKeyword8539("default") || matchKeyword8539("case")) {
            break;
        }
        sourceElement9118 = parseSourceElement8619();
        if (typeof sourceElement9118 === "undefined") {
            break;
        }
        consequent9117.push(sourceElement9118);
    }
    return markerApply8531(marker9119, delegate8488.createSwitchCase(test9116, consequent9117));
}
function parseSwitchStatement8599() {
    var discriminant9120,
        cases9121,
        clause9122,
        oldInSwitch9123,
        defaultFound9124,
        marker9125 = markerCreate8529();
    expectKeyword8537("switch");
    expect8536("(");
    discriminant9120 = parseExpression8573();
    expect8536(")");
    expect8536("{");
    cases9121 = [];
    if (match8538("}")) {
        lex8526();
        return markerApply8531(marker9125, delegate8488.createSwitchStatement(discriminant9120, cases9121));
    }
    oldInSwitch9123 = state8493.inSwitch;
    state8493.inSwitch = true;
    defaultFound9124 = false;
    while (streamIndex8490 < length8487) {
        if (match8538("}")) {
            break;
        }
        clause9122 = parseSwitchCase8598();
        if (clause9122.test === null) {
            if (defaultFound9124) {
                throwError8533({}, Messages8474.MultipleDefaultsInSwitch);
            }
            defaultFound9124 = true;
        }
        cases9121.push(clause9122);
    }
    state8493.inSwitch = oldInSwitch9123;
    expect8536("}");
    return markerApply8531(marker9125, delegate8488.createSwitchStatement(discriminant9120, cases9121));
}
function parseThrowStatement8600() {
    var argument9126,
        marker9127 = markerCreate8529();
    expectKeyword8537("throw");
    if (peekLineTerminator8532()) {
        throwError8533({}, Messages8474.NewlineAfterThrow);
    }
    argument9126 = parseExpression8573();
    consumeSemicolon8542();
    return markerApply8531(marker9127, delegate8488.createThrowStatement(argument9126));
}
function parseCatchClause8601() {
    var param9128,
        body9129,
        marker9130 = markerCreate8529();
    expectKeyword8537("catch");
    expect8536("(");
    if (match8538(")")) {
        throwUnexpected8535(lookahead8491);
    }
    param9128 = parseExpression8573();
    if ( // 12.14.1
    strict8479 && param9128.type === Syntax8472.Identifier && isRestrictedWord8507(param9128.name)) {
        throwErrorTolerant8534({}, Messages8474.StrictCatchVariable);
    }
    expect8536(")");
    body9129 = parseBlock8575();
    return markerApply8531(marker9130, delegate8488.createCatchClause(param9128, body9129));
}
function parseTryStatement8602() {
    var block9131,
        handlers9132 = [],
        finalizer9133 = null,
        marker9134 = markerCreate8529();
    expectKeyword8537("try");
    block9131 = parseBlock8575();
    if (matchKeyword8539("catch")) {
        handlers9132.push(parseCatchClause8601());
    }
    if (matchKeyword8539("finally")) {
        lex8526();
        finalizer9133 = parseBlock8575();
    }
    if (handlers9132.length === 0 && !finalizer9133) {
        throwError8533({}, Messages8474.NoCatchOrFinally);
    }
    return markerApply8531(marker9134, delegate8488.createTryStatement(block9131, [], handlers9132, finalizer9133));
}
function parseDebuggerStatement8603() {
    var marker9135 = markerCreate8529();
    expectKeyword8537("debugger");
    consumeSemicolon8542();
    return markerApply8531(marker9135, delegate8488.createDebuggerStatement());
}
function parseStatement8604() {
    var type9136 = lookahead8491.type,
        marker9137,
        expr9138,
        labeledBody9139,
        key9140;
    if (type9136 === Token8469.EOF) {
        throwUnexpected8535(lookahead8491);
    }
    if (type9136 === Token8469.Punctuator) {
        switch (lookahead8491.value) {
            case ";":
                return parseEmptyStatement8587();
            case "{":
                return parseBlock8575();
            case "(":
                return parseExpressionStatement8588();
            default:
                break;
        }
    }
    if (type9136 === Token8469.Keyword) {
        switch (lookahead8491.value) {
            case "break":
                return parseBreakStatement8595();
            case "continue":
                return parseContinueStatement8594();
            case "debugger":
                return parseDebuggerStatement8603();
            case "do":
                return parseDoWhileStatement8590();
            case "for":
                return parseForStatement8593();
            case "function":
                return parseFunctionDeclaration8610();
            case "class":
                return parseClassDeclaration8617();
            case "if":
                return parseIfStatement8589();
            case "return":
                return parseReturnStatement8596();
            case "switch":
                return parseSwitchStatement8599();
            case "throw":
                return parseThrowStatement8600();
            case "try":
                return parseTryStatement8602();
            case "var":
                return parseVariableStatement8579();
            case "while":
                return parseWhileStatement8591();
            case "with":
                return parseWithStatement8597();
            default:
                break;
        }
    }
    marker9137 = markerCreate8529();
    expr9138 = parseExpression8573();
    if ( // 12.12 Labelled Statements
    expr9138.type === Syntax8472.Identifier && match8538(":")) {
        lex8526();
        key9140 = "$" + expr9138.name;
        if (Object.prototype.hasOwnProperty.call(state8493.labelSet, key9140)) {
            throwError8533({}, Messages8474.Redeclaration, "Label", expr9138.name);
        }
        state8493.labelSet[key9140] = true;
        labeledBody9139 = parseStatement8604();
        delete state8493.labelSet[key9140];
        return markerApply8531(marker9137, delegate8488.createLabeledStatement(expr9138, labeledBody9139));
    }
    consumeSemicolon8542();
    return markerApply8531(marker9137, delegate8488.createExpressionStatement(expr9138));
}
function parseConciseBody8605() {
    if (match8538("{")) {
        return parseFunctionSourceElements8606();
    }
    return parseAssignmentExpression8572();
}
function parseFunctionSourceElements8606() {
    var sourceElement9141,
        sourceElements9142 = [],
        token9143,
        directive9144,
        firstRestricted9145,
        oldLabelSet9146,
        oldInIteration9147,
        oldInSwitch9148,
        oldInFunctionBody9149,
        oldParenthesizedCount9150,
        marker9151 = markerCreate8529();
    expect8536("{");
    while (streamIndex8490 < length8487) {
        if (lookahead8491.type !== Token8469.StringLiteral) {
            break;
        }
        token9143 = lookahead8491;
        sourceElement9141 = parseSourceElement8619();
        sourceElements9142.push(sourceElement9141);
        if (sourceElement9141.expression.type !== Syntax8472.Literal) {
            // this is not directive
            break;
        }
        directive9144 = token9143.value;
        if (directive9144 === "use strict") {
            strict8479 = true;
            if (firstRestricted9145) {
                throwErrorTolerant8534(firstRestricted9145, Messages8474.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9145 && token9143.octal) {
                firstRestricted9145 = token9143;
            }
        }
    }
    oldLabelSet9146 = state8493.labelSet;
    oldInIteration9147 = state8493.inIteration;
    oldInSwitch9148 = state8493.inSwitch;
    oldInFunctionBody9149 = state8493.inFunctionBody;
    oldParenthesizedCount9150 = state8493.parenthesizedCount;
    state8493.labelSet = {};
    state8493.inIteration = false;
    state8493.inSwitch = false;
    state8493.inFunctionBody = true;
    state8493.parenthesizedCount = 0;
    while (streamIndex8490 < length8487) {
        if (match8538("}")) {
            break;
        }
        sourceElement9141 = parseSourceElement8619();
        if (typeof sourceElement9141 === "undefined") {
            break;
        }
        sourceElements9142.push(sourceElement9141);
    }
    expect8536("}");
    state8493.labelSet = oldLabelSet9146;
    state8493.inIteration = oldInIteration9147;
    state8493.inSwitch = oldInSwitch9148;
    state8493.inFunctionBody = oldInFunctionBody9149;
    state8493.parenthesizedCount = oldParenthesizedCount9150;
    return markerApply8531(marker9151, delegate8488.createBlockStatement(sourceElements9142));
}
function validateParam8607(options9152, param9153, name9154) {
    var key9155 = "$" + name9154;
    if (strict8479) {
        if (isRestrictedWord8507(name9154)) {
            options9152.stricted = param9153;
            options9152.message = Messages8474.StrictParamName;
        }
        if (Object.prototype.hasOwnProperty.call(options9152.paramSet, key9155)) {
            options9152.stricted = param9153;
            options9152.message = Messages8474.StrictParamDupe;
        }
    } else if (!options9152.firstRestricted) {
        if (isRestrictedWord8507(name9154)) {
            options9152.firstRestricted = param9153;
            options9152.message = Messages8474.StrictParamName;
        } else if (isStrictModeReservedWord8506(name9154)) {
            options9152.firstRestricted = param9153;
            options9152.message = Messages8474.StrictReservedWord;
        } else if (Object.prototype.hasOwnProperty.call(options9152.paramSet, key9155)) {
            options9152.firstRestricted = param9153;
            options9152.message = Messages8474.StrictParamDupe;
        }
    }
    options9152.paramSet[key9155] = true;
}
function parseParam8608(options9156) {
    var token9157, rest9158, param9159, def9160;
    token9157 = lookahead8491;
    if (token9157.value === "...") {
        token9157 = lex8526();
        rest9158 = true;
    }
    if (match8538("[")) {
        param9159 = parseArrayInitialiser8545();
        reinterpretAsDestructuredParameter8569(options9156, param9159);
    } else if (match8538("{")) {
        if (rest9158) {
            throwError8533({}, Messages8474.ObjectPatternAsRestParameter);
        }
        param9159 = parseObjectInitialiser8550();
        reinterpretAsDestructuredParameter8569(options9156, param9159);
    } else {
        param9159 = parseVariableIdentifier8576();
        validateParam8607(options9156, token9157, token9157.value);
    }
    if (match8538("=")) {
        if (rest9158) {
            throwErrorTolerant8534(lookahead8491, Messages8474.DefaultRestParameter);
        }
        lex8526();
        def9160 = parseAssignmentExpression8572();
        ++options9156.defaultCount;
    }
    if (rest9158) {
        if (!match8538(")")) {
            throwError8533({}, Messages8474.ParameterAfterRestParameter);
        }
        options9156.rest = param9159;
        return false;
    }
    options9156.params.push(param9159);
    options9156.defaults.push(def9160);
    return !match8538(")");
}
function parseParams8609(firstRestricted9161) {
    var options9162;
    options9162 = {
        params: [],
        defaultCount: 0,
        defaults: [],
        rest: null,
        firstRestricted: firstRestricted9161
    };
    expect8536("(");
    if (!match8538(")")) {
        options9162.paramSet = {};
        while (streamIndex8490 < length8487) {
            if (!parseParam8608(options9162)) {
                break;
            }
            expect8536(",");
        }
    }
    expect8536(")");
    if (options9162.defaultCount === 0) {
        options9162.defaults = [];
    }
    return options9162;
}
function parseFunctionDeclaration8610() {
    var id9163,
        body9164,
        token9165,
        tmp9166,
        firstRestricted9167,
        message9168,
        previousStrict9169,
        previousYieldAllowed9170,
        generator9171,
        marker9172 = markerCreate8529();
    expectKeyword8537("function");
    generator9171 = false;
    if (match8538("*")) {
        lex8526();
        generator9171 = true;
    }
    token9165 = lookahead8491;
    id9163 = parseVariableIdentifier8576();
    if (strict8479) {
        if (isRestrictedWord8507(token9165.value)) {
            throwErrorTolerant8534(token9165, Messages8474.StrictFunctionName);
        }
    } else {
        if (isRestrictedWord8507(token9165.value)) {
            firstRestricted9167 = token9165;
            message9168 = Messages8474.StrictFunctionName;
        } else if (isStrictModeReservedWord8506(token9165.value)) {
            firstRestricted9167 = token9165;
            message9168 = Messages8474.StrictReservedWord;
        }
    }
    tmp9166 = parseParams8609(firstRestricted9167);
    firstRestricted9167 = tmp9166.firstRestricted;
    if (tmp9166.message) {
        message9168 = tmp9166.message;
    }
    previousStrict9169 = strict8479;
    previousYieldAllowed9170 = state8493.yieldAllowed;
    state8493.yieldAllowed = generator9171;
    body9164 = parseFunctionSourceElements8606();
    if (strict8479 && firstRestricted9167) {
        throwError8533(firstRestricted9167, message9168);
    }
    if (strict8479 && tmp9166.stricted) {
        throwErrorTolerant8534(tmp9166.stricted, message9168);
    }
    strict8479 = previousStrict9169;
    state8493.yieldAllowed = previousYieldAllowed9170;
    return markerApply8531(marker9172, delegate8488.createFunctionDeclaration(id9163, tmp9166.params, tmp9166.defaults, body9164, tmp9166.rest, generator9171, false));
}
function parseFunctionExpression8611() {
    var token9173,
        id9174 = null,
        firstRestricted9175,
        message9176,
        tmp9177,
        body9178,
        previousStrict9179,
        previousYieldAllowed9180,
        generator9181,
        marker9182 = markerCreate8529();
    expectKeyword8537("function");
    generator9181 = false;
    if (match8538("*")) {
        lex8526();
        generator9181 = true;
    }
    if (!match8538("(")) {
        token9173 = lookahead8491;
        id9174 = parseVariableIdentifier8576();
        if (strict8479) {
            if (isRestrictedWord8507(token9173.value)) {
                throwErrorTolerant8534(token9173, Messages8474.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord8507(token9173.value)) {
                firstRestricted9175 = token9173;
                message9176 = Messages8474.StrictFunctionName;
            } else if (isStrictModeReservedWord8506(token9173.value)) {
                firstRestricted9175 = token9173;
                message9176 = Messages8474.StrictReservedWord;
            }
        }
    }
    tmp9177 = parseParams8609(firstRestricted9175);
    firstRestricted9175 = tmp9177.firstRestricted;
    if (tmp9177.message) {
        message9176 = tmp9177.message;
    }
    previousStrict9179 = strict8479;
    previousYieldAllowed9180 = state8493.yieldAllowed;
    state8493.yieldAllowed = generator9181;
    body9178 = parseFunctionSourceElements8606();
    if (strict8479 && firstRestricted9175) {
        throwError8533(firstRestricted9175, message9176);
    }
    if (strict8479 && tmp9177.stricted) {
        throwErrorTolerant8534(tmp9177.stricted, message9176);
    }
    strict8479 = previousStrict9179;
    state8493.yieldAllowed = previousYieldAllowed9180;
    return markerApply8531(marker9182, delegate8488.createFunctionExpression(id9174, tmp9177.params, tmp9177.defaults, body9178, tmp9177.rest, generator9181, false));
}
function parseYieldExpression8612() {
    var yieldToken9183,
        delegateFlag9184,
        expr9185,
        marker9186 = markerCreate8529();
    yieldToken9183 = lex8526();
    assert8496(yieldToken9183.value === "yield", "Called parseYieldExpression with non-yield lookahead.");
    if (!state8493.yieldAllowed) {
        throwErrorTolerant8534({}, Messages8474.IllegalYield);
    }
    delegateFlag9184 = false;
    if (match8538("*")) {
        lex8526();
        delegateFlag9184 = true;
    }
    expr9185 = parseAssignmentExpression8572();
    return markerApply8531(marker9186, delegate8488.createYieldExpression(expr9185, delegateFlag9184));
}
function parseMethodDefinition8613(existingPropNames9187) {
    var token9188,
        key9189,
        param9190,
        propType9191,
        isValidDuplicateProp9192 = false,
        marker9193 = markerCreate8529();
    if (lookahead8491.value === "static") {
        propType9191 = ClassPropertyType8477["static"];
        lex8526();
    } else {
        propType9191 = ClassPropertyType8477.prototype;
    }
    if (match8538("*")) {
        lex8526();
        return markerApply8531(marker9193, delegate8488.createMethodDefinition(propType9191, "", parseObjectPropertyKey8548(), parsePropertyMethodFunction8547({ generator: true })));
    }
    token9188 = lookahead8491;
    key9189 = parseObjectPropertyKey8548();
    if (token9188.value === "get" && !match8538("(")) {
        key9189 = parseObjectPropertyKey8548();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a setter
        existingPropNames9187[propType9191].hasOwnProperty(key9189.name)) {
            isValidDuplicateProp9192 = // There isn't already a getter for this prop
            existingPropNames9187[propType9191][key9189.name].get === undefined && // There isn't already a data prop by this name
            existingPropNames9187[propType9191][key9189.name].data === undefined && // The only existing prop by this name is a setter
            existingPropNames9187[propType9191][key9189.name].set !== undefined;
            if (!isValidDuplicateProp9192) {
                throwError8533(key9189, Messages8474.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9187[propType9191][key9189.name] = {};
        }
        existingPropNames9187[propType9191][key9189.name].get = true;
        expect8536("(");
        expect8536(")");
        return markerApply8531(marker9193, delegate8488.createMethodDefinition(propType9191, "get", key9189, parsePropertyFunction8546({ generator: false })));
    }
    if (token9188.value === "set" && !match8538("(")) {
        key9189 = parseObjectPropertyKey8548();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a getter
        existingPropNames9187[propType9191].hasOwnProperty(key9189.name)) {
            isValidDuplicateProp9192 = // There isn't already a setter for this prop
            existingPropNames9187[propType9191][key9189.name].set === undefined && // There isn't already a data prop by this name
            existingPropNames9187[propType9191][key9189.name].data === undefined && // The only existing prop by this name is a getter
            existingPropNames9187[propType9191][key9189.name].get !== undefined;
            if (!isValidDuplicateProp9192) {
                throwError8533(key9189, Messages8474.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9187[propType9191][key9189.name] = {};
        }
        existingPropNames9187[propType9191][key9189.name].set = true;
        expect8536("(");
        token9188 = lookahead8491;
        param9190 = [parseVariableIdentifier8576()];
        expect8536(")");
        return markerApply8531(marker9193, delegate8488.createMethodDefinition(propType9191, "set", key9189, parsePropertyFunction8546({
            params: param9190,
            generator: false,
            name: token9188
        })));
    }
    if ( // It is a syntax error if any other properties have the same name as a
    // non-getter, non-setter method
    existingPropNames9187[propType9191].hasOwnProperty(key9189.name)) {
        throwError8533(key9189, Messages8474.IllegalDuplicateClassProperty);
    } else {
        existingPropNames9187[propType9191][key9189.name] = {};
    }
    existingPropNames9187[propType9191][key9189.name].data = true;
    return markerApply8531(marker9193, delegate8488.createMethodDefinition(propType9191, "", key9189, parsePropertyMethodFunction8547({ generator: false })));
}
function parseClassElement8614(existingProps9194) {
    if (match8538(";")) {
        lex8526();
        return;
    }
    return parseMethodDefinition8613(existingProps9194);
}
function parseClassBody8615() {
    var classElement9195,
        classElements9196 = [],
        existingProps9197 = {},
        marker9198 = markerCreate8529();
    existingProps9197[ClassPropertyType8477["static"]] = {};
    existingProps9197[ClassPropertyType8477.prototype] = {};
    expect8536("{");
    while (streamIndex8490 < length8487) {
        if (match8538("}")) {
            break;
        }
        classElement9195 = parseClassElement8614(existingProps9197);
        if (typeof classElement9195 !== "undefined") {
            classElements9196.push(classElement9195);
        }
    }
    expect8536("}");
    return markerApply8531(marker9198, delegate8488.createClassBody(classElements9196));
}
function parseClassExpression8616() {
    var id9199,
        previousYieldAllowed9200,
        superClass9201 = null,
        marker9202 = markerCreate8529();
    expectKeyword8537("class");
    if (!matchKeyword8539("extends") && !match8538("{")) {
        id9199 = parseVariableIdentifier8576();
    }
    if (matchKeyword8539("extends")) {
        expectKeyword8537("extends");
        previousYieldAllowed9200 = state8493.yieldAllowed;
        state8493.yieldAllowed = false;
        superClass9201 = parseAssignmentExpression8572();
        state8493.yieldAllowed = previousYieldAllowed9200;
    }
    return markerApply8531(marker9202, delegate8488.createClassExpression(id9199, superClass9201, parseClassBody8615()));
}
function parseClassDeclaration8617() {
    var id9203,
        previousYieldAllowed9204,
        superClass9205 = null,
        marker9206 = markerCreate8529();
    expectKeyword8537("class");
    id9203 = parseVariableIdentifier8576();
    if (matchKeyword8539("extends")) {
        expectKeyword8537("extends");
        previousYieldAllowed9204 = state8493.yieldAllowed;
        state8493.yieldAllowed = false;
        superClass9205 = parseAssignmentExpression8572();
        state8493.yieldAllowed = previousYieldAllowed9204;
    }
    return markerApply8531(marker9206, delegate8488.createClassDeclaration(id9203, superClass9205, parseClassBody8615()));
}
function matchModuleDeclaration8618() {
    var id9207;
    if (matchContextualKeyword8540("module")) {
        id9207 = lookahead28528();
        return id9207.type === Token8469.StringLiteral || id9207.type === Token8469.Identifier;
    }
    return false;
}
function parseSourceElement8619() {
    if (lookahead8491.type === Token8469.Keyword) {
        switch (lookahead8491.value) {
            case "const":
            case "let":
                return parseConstLetDeclaration8580(lookahead8491.value);
            case "function":
                return parseFunctionDeclaration8610();
            case "export":
                return parseExportDeclaration8584();
            case "import":
                return parseImportDeclaration8585();
            default:
                return parseStatement8604();
        }
    }
    if (matchModuleDeclaration8618()) {
        throwError8533({}, Messages8474.NestedModule);
    }
    if (lookahead8491.type !== Token8469.EOF) {
        return parseStatement8604();
    }
}
function parseProgramElement8620() {
    if (lookahead8491.type === Token8469.Keyword) {
        switch (lookahead8491.value) {
            case "export":
                return parseExportDeclaration8584();
            case "import":
                return parseImportDeclaration8585();
        }
    }
    if (matchModuleDeclaration8618()) {
        return parseModuleDeclaration8581();
    }
    return parseSourceElement8619();
}
function parseProgramElements8621() {
    var sourceElement9208,
        sourceElements9209 = [],
        token9210,
        directive9211,
        firstRestricted9212;
    while (streamIndex8490 < length8487) {
        token9210 = lookahead8491;
        if (token9210.type !== Token8469.StringLiteral) {
            break;
        }
        sourceElement9208 = parseProgramElement8620();
        sourceElements9209.push(sourceElement9208);
        if (sourceElement9208.expression.type !== Syntax8472.Literal) {
            // this is not directive
            break;
        }
        directive9211 = token9210.value;
        if (directive9211 === "use strict") {
            strict8479 = true;
            if (firstRestricted9212) {
                throwErrorTolerant8534(firstRestricted9212, Messages8474.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9212 && token9210.octal) {
                firstRestricted9212 = token9210;
            }
        }
    }
    while (streamIndex8490 < length8487) {
        sourceElement9208 = parseProgramElement8620();
        if (typeof sourceElement9208 === "undefined") {
            break;
        }
        sourceElements9209.push(sourceElement9208);
    }
    return sourceElements9209;
}
function parseModuleElement8622() {
    return parseSourceElement8619();
}
function parseModuleElements8623() {
    var list9213 = [],
        statement9214;
    while (streamIndex8490 < length8487) {
        if (match8538("}")) {
            break;
        }
        statement9214 = parseModuleElement8622();
        if (typeof statement9214 === "undefined") {
            break;
        }
        list9213.push(statement9214);
    }
    return list9213;
}
function parseModuleBlock8624() {
    var block9215,
        marker9216 = markerCreate8529();
    expect8536("{");
    block9215 = parseModuleElements8623();
    expect8536("}");
    return markerApply8531(marker9216, delegate8488.createBlockStatement(block9215));
}
function parseProgram8625() {
    var body9217,
        marker9218 = markerCreate8529();
    strict8479 = false;
    peek8527();
    body9217 = parseProgramElements8621();
    return markerApply8531(marker9218, delegate8488.createProgram(body9217));
}
function addComment8626(type9219, value9220, start9221, end9222, loc9223) {
    var comment9224;
    assert8496(typeof start9221 === "number", "Comment must have valid position");
    if ( // Because the way the actual token is scanned, often the comments
    // (if any) are skipped twice during the lexical analysis.
    // Thus, we need to skip adding a comment if the comment array already
    // handled it.
    state8493.lastCommentStart >= start9221) {
        return;
    }
    state8493.lastCommentStart = start9221;
    comment9224 = {
        type: type9219,
        value: value9220
    };
    if (extra8495.range) {
        comment9224.range = [start9221, end9222];
    }
    if (extra8495.loc) {
        comment9224.loc = loc9223;
    }
    extra8495.comments.push(comment9224);
    if (extra8495.attachComment) {
        extra8495.leadingComments.push(comment9224);
        extra8495.trailingComments.push(comment9224);
    }
}
function scanComment8627() {
    var comment9225, ch9226, loc9227, start9228, blockComment9229, lineComment9230;
    comment9225 = "";
    blockComment9229 = false;
    lineComment9230 = false;
    while (index8480 < length8487) {
        ch9226 = source8478[index8480];
        if (lineComment9230) {
            ch9226 = source8478[index8480++];
            if (isLineTerminator8502(ch9226.charCodeAt(0))) {
                loc9227.end = {
                    line: lineNumber8481,
                    column: index8480 - lineStart8482 - 1
                };
                lineComment9230 = false;
                addComment8626("Line", comment9225, start9228, index8480 - 1, loc9227);
                if (ch9226 === "\r" && source8478[index8480] === "\n") {
                    ++index8480;
                }
                ++lineNumber8481;
                lineStart8482 = index8480;
                comment9225 = "";
            } else if (index8480 >= length8487) {
                lineComment9230 = false;
                comment9225 += ch9226;
                loc9227.end = {
                    line: lineNumber8481,
                    column: length8487 - lineStart8482
                };
                addComment8626("Line", comment9225, start9228, length8487, loc9227);
            } else {
                comment9225 += ch9226;
            }
        } else if (blockComment9229) {
            if (isLineTerminator8502(ch9226.charCodeAt(0))) {
                if (ch9226 === "\r" && source8478[index8480 + 1] === "\n") {
                    ++index8480;
                    comment9225 += "\r\n";
                } else {
                    comment9225 += ch9226;
                }
                ++lineNumber8481;
                ++index8480;
                lineStart8482 = index8480;
                if (index8480 >= length8487) {
                    throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch9226 = source8478[index8480++];
                if (index8480 >= length8487) {
                    throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
                }
                comment9225 += ch9226;
                if (ch9226 === "*") {
                    ch9226 = source8478[index8480];
                    if (ch9226 === "/") {
                        comment9225 = comment9225.substr(0, comment9225.length - 1);
                        blockComment9229 = false;
                        ++index8480;
                        loc9227.end = {
                            line: lineNumber8481,
                            column: index8480 - lineStart8482
                        };
                        addComment8626("Block", comment9225, start9228, index8480, loc9227);
                        comment9225 = "";
                    }
                }
            }
        } else if (ch9226 === "/") {
            ch9226 = source8478[index8480 + 1];
            if (ch9226 === "/") {
                loc9227 = {
                    start: {
                        line: lineNumber8481,
                        column: index8480 - lineStart8482
                    }
                };
                start9228 = index8480;
                index8480 += 2;
                lineComment9230 = true;
                if (index8480 >= length8487) {
                    loc9227.end = {
                        line: lineNumber8481,
                        column: index8480 - lineStart8482
                    };
                    lineComment9230 = false;
                    addComment8626("Line", comment9225, start9228, index8480, loc9227);
                }
            } else if (ch9226 === "*") {
                start9228 = index8480;
                index8480 += 2;
                blockComment9229 = true;
                loc9227 = {
                    start: {
                        line: lineNumber8481,
                        column: index8480 - lineStart8482 - 2
                    }
                };
                if (index8480 >= length8487) {
                    throwError8533({}, Messages8474.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8501(ch9226.charCodeAt(0))) {
            ++index8480;
        } else if (isLineTerminator8502(ch9226.charCodeAt(0))) {
            ++index8480;
            if (ch9226 === "\r" && source8478[index8480] === "\n") {
                ++index8480;
            }
            ++lineNumber8481;
            lineStart8482 = index8480;
        } else {
            break;
        }
    }
}
function collectToken8628() {
    var start9231, loc9232, token9233, range9234, value9235;
    skipComment8509();
    start9231 = index8480;
    loc9232 = {
        start: {
            line: lineNumber8481,
            column: index8480 - lineStart8482
        }
    };
    token9233 = extra8495.advance();
    loc9232.end = {
        line: lineNumber8481,
        column: index8480 - lineStart8482
    };
    if (token9233.type !== Token8469.EOF) {
        range9234 = [token9233.range[0], token9233.range[1]];
        value9235 = source8478.slice(token9233.range[0], token9233.range[1]);
        extra8495.tokens.push({
            type: TokenName8470[token9233.type],
            value: value9235,
            range: range9234,
            loc: loc9232
        });
    }
    return token9233;
}
function collectRegex8629() {
    var pos9236, loc9237, regex9238, token9239;
    skipComment8509();
    pos9236 = index8480;
    loc9237 = {
        start: {
            line: lineNumber8481,
            column: index8480 - lineStart8482
        }
    };
    regex9238 = extra8495.scanRegExp();
    loc9237.end = {
        line: lineNumber8481,
        column: index8480 - lineStart8482
    };
    if (!extra8495.tokenize) {
        if ( // Pop the previous token, which is likely '/' or '/='
        extra8495.tokens.length > 0) {
            token9239 = extra8495.tokens[extra8495.tokens.length - 1];
            if (token9239.range[0] === pos9236 && token9239.type === "Punctuator") {
                if (token9239.value === "/" || token9239.value === "/=") {
                    extra8495.tokens.pop();
                }
            }
        }
        extra8495.tokens.push({
            type: "RegularExpression",
            value: regex9238.literal,
            range: [pos9236, index8480],
            loc: loc9237
        });
    }
    return regex9238;
}
function filterTokenLocation8630() {
    var i9240,
        entry9241,
        token9242,
        tokens9243 = [];
    for (i9240 = 0; i9240 < extra8495.tokens.length; ++i9240) {
        entry9241 = extra8495.tokens[i9240];
        token9242 = {
            type: entry9241.type,
            value: entry9241.value
        };
        if (extra8495.range) {
            token9242.range = entry9241.range;
        }
        if (extra8495.loc) {
            token9242.loc = entry9241.loc;
        }
        tokens9243.push(token9242);
    }
    extra8495.tokens = tokens9243;
}
function patch8631() {
    if (extra8495.comments) {
        extra8495.skipComment = skipComment8509;
        skipComment8509 = scanComment8627;
    }
    if (typeof extra8495.tokens !== "undefined") {
        extra8495.advance = advance8525;
        extra8495.scanRegExp = scanRegExp8522;
        advance8525 = collectToken8628;
        scanRegExp8522 = collectRegex8629;
    }
}
function unpatch8632() {
    if (typeof extra8495.skipComment === "function") {
        skipComment8509 = extra8495.skipComment;
    }
    if (typeof extra8495.scanRegExp === "function") {
        advance8525 = extra8495.advance;
        scanRegExp8522 = extra8495.scanRegExp;
    }
}
function extend8633(object9244, properties9245) {
    var entry9246,
        result9247 = {};
    for (entry9246 in object9244) {
        if (object9244.hasOwnProperty(entry9246)) {
            result9247[entry9246] = object9244[entry9246];
        }
    }
    for (entry9246 in properties9245) {
        if (properties9245.hasOwnProperty(entry9246)) {
            result9247[entry9246] = properties9245[entry9246];
        }
    }
    return result9247;
}
function tokenize8634(code9248, options9249) {
    var toString9250, token9251, tokens9252;
    toString9250 = String;
    if (typeof code9248 !== "string" && !(code9248 instanceof String)) {
        code9248 = toString9250(code9248);
    }
    delegate8488 = SyntaxTreeDelegate8476;
    source8478 = code9248;
    index8480 = 0;
    lineNumber8481 = source8478.length > 0 ? 1 : 0;
    lineStart8482 = 0;
    length8487 = source8478.length;
    lookahead8491 = null;
    state8493 = {
        allowKeyword: true,
        allowIn: true,
        labelSet: {},
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        lastCommentStart: -1
    };
    extra8495 = {};
    // Options matching.
    options9249 = options9249 || {};
    // Of course we collect tokens here.
    options9249.tokens = true;
    extra8495.tokens = [];
    extra8495.tokenize = true;
    // The following two fields are necessary to compute the Regex tokens.
    extra8495.openParenToken = -1;
    extra8495.openCurlyToken = -1;
    extra8495.range = typeof options9249.range === "boolean" && options9249.range;
    extra8495.loc = typeof options9249.loc === "boolean" && options9249.loc;
    if (typeof options9249.comment === "boolean" && options9249.comment) {
        extra8495.comments = [];
    }
    if (typeof options9249.tolerant === "boolean" && options9249.tolerant) {
        extra8495.errors = [];
    }
    if (length8487 > 0) {
        if (typeof source8478[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9248 instanceof String) {
                source8478 = code9248.valueOf();
            }
        }
    }
    patch8631();
    try {
        peek8527();
        if (lookahead8491.type === Token8469.EOF) {
            return extra8495.tokens;
        }
        token9251 = lex8526();
        while (lookahead8491.type !== Token8469.EOF) {
            try {
                token9251 = lex8526();
            } catch (lexError9253) {
                token9251 = lookahead8491;
                if (extra8495.errors) {
                    extra8495.errors.push(lexError9253);
                    // We have to break on the first error
                    // to avoid infinite loops.
                    break;
                } else {
                    throw lexError9253;
                }
            }
        }
        filterTokenLocation8630();
        tokens9252 = extra8495.tokens;
        if (typeof extra8495.comments !== "undefined") {
            tokens9252.comments = extra8495.comments;
        }
        if (typeof extra8495.errors !== "undefined") {
            tokens9252.errors = extra8495.errors;
        }
    } catch (e9254) {
        throw e9254;
    } finally {
        unpatch8632();
        extra8495 = {};
    }
    return tokens9252;
}
function blockAllowed8635(toks9255, start9256, inExprDelim9257, parentIsBlock9258) {
    var assignOps9259 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
    var binaryOps9260 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
    var unaryOps9261 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
    function back9262(n9263) {
        var idx9264 = toks9255.length - n9263 > 0 ? toks9255.length - n9263 : 0;
        return toks9255[idx9264];
    }
    if (inExprDelim9257 && toks9255.length - (start9256 + 2) <= 0) {
        // ... ({...} ...)
        return false;
    } else if (back9262(start9256 + 2).value === ":" && parentIsBlock9258) {
        // ...{a:{b:{...}}}
        return true;
    } else if (isIn8497(back9262(start9256 + 2).value, unaryOps9261.concat(binaryOps9260).concat(assignOps9259))) {
        // ... + {...}
        return false;
    } else if (back9262(start9256 + 2).value === "return") {
        var // ASI makes `{}` a block in:
        //
        //    return
        //    { ... }
        //
        // otherwise an object literal, so it's an
        // expression and thus / is divide
        currLineNumber9265 = typeof back9262(start9256 + 1).startLineNumber !== "undefined" ? back9262(start9256 + 1).startLineNumber : back9262(start9256 + 1).lineNumber;
        if (back9262(start9256 + 2).lineNumber !== currLineNumber9265) {
            return true;
        } else {
            return false;
        }
    } else if (isIn8497(back9262(start9256 + 2).value, ["void", "typeof", "in", "case", "delete"])) {
        // ... in {}
        return false;
    } else {
        return true;
    }
}
var // Readtables
readtables8636 = {
    currentReadtable: {},
    // A readtable is invoked within `readToken`, but it can
    // return multiple tokens. We need to "queue" the stream of
    // tokens so that subsequent calls to `readToken` gets the
    // rest of the stream.
    queued: [],
    // A readtable can only override punctuators
    punctuators: ";,.:!?~=%&*+-/<>^|#@",
    has: function has(ch9266) {
        return readtables8636.currentReadtable[ch9266] && readtables8636.punctuators.indexOf(ch9266) !== -1;
    },
    getQueued: function getQueued() {
        return readtables8636.queued.length ? readtables8636.queued.shift() : null;
    },
    peekQueued: function peekQueued(lookahead9267) {
        lookahead9267 = lookahead9267 ? lookahead9267 : 1;
        return readtables8636.queued.length ? readtables8636.queued[lookahead9267 - 1] : null;
    },
    invoke: function invoke(ch9268, toks9269) {
        var prevState9270 = snapshotParserState8637();
        var newStream9271 = readtables8636.currentReadtable[ch9268](ch9268, readtables8636.readerAPI, toks9269, source8478, index8480);
        if (!newStream9271) {
            // Reset the state
            restoreParserState8638(prevState9270);
            return null;
        } else if (!Array.isArray(newStream9271)) {
            newStream9271 = [newStream9271];
        }
        this.queued = this.queued.concat(newStream9271);
        return this.getQueued();
    }
};
function snapshotParserState8637() {
    return {
        index: index8480,
        lineNumber: lineNumber8481,
        lineStart: lineStart8482
    };
}
function restoreParserState8638(prevState9272) {
    index8480 = prevState9272.index;
    lineNumber8481 = prevState9272.lineNumber;
    lineStart8482 = prevState9272.lineStart;
}
function suppressReadError8639(func9273) {
    var prevState9274 = snapshotParserState8637();
    try {
        return func9273();
    } catch (e9275) {
        if (!(e9275 instanceof SyntaxError) && !(e9275 instanceof TypeError)) {
            restoreParserState8638(prevState9274);
            return null;
        }
        throw e9275;
    }
}
function makeIdentifier8640(value9276, opts9277) {
    opts9277 = opts9277 || {};
    var type9278 = Token8469.Identifier;
    if (isKeyword8508(value9276)) {
        type9278 = Token8469.Keyword;
    } else if (value9276 === "null") {
        type9278 = Token8469.NullLiteral;
    } else if (value9276 === "true" || value9276 === "false") {
        type9278 = Token8469.BooleanLiteral;
    }
    return {
        type: type9278,
        value: value9276,
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [opts9277.start || index8480, index8480]
    };
}
function makePunctuator8641(value9279, opts9280) {
    opts9280 = opts9280 || {};
    return {
        type: Token8469.Punctuator,
        value: value9279,
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [opts9280.start || index8480, index8480]
    };
}
function makeStringLiteral8642(value9281, opts9282) {
    opts9282 = opts9282 || {};
    return {
        type: Token8469.StringLiteral,
        value: value9281,
        octal: !!opts9282.octal,
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [opts9282.start || index8480, index8480]
    };
}
function makeNumericLiteral8643(value9283, opts9284) {
    opts9284 = opts9284 || {};
    return {
        type: Token8469.NumericLiteral,
        value: value9283,
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [opts9284.start || index8480, index8480]
    };
}
function makeRegExp8644(value9285, opts9286) {
    opts9286 = opts9286 || {};
    return {
        type: Token8469.RegularExpression,
        value: value9285,
        literal: value9285.toString(),
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [opts9286.start || index8480, index8480]
    };
}
function makeDelimiter8645(value9287, inner9288) {
    var current9289 = {
        lineNumber: lineNumber8481,
        lineStart: lineStart8482,
        range: [index8480, index8480]
    };
    var firstTok9290 = inner9288.length ? inner9288[0] : current9289;
    var lastTok9291 = inner9288.length ? inner9288[inner9288.length - 1] : current9289;
    return {
        type: Token8469.Delimiter,
        value: value9287,
        inner: inner9288,
        startLineNumber: firstTok9290.lineNumber,
        startLineStart: firstTok9290.lineStart,
        startRange: firstTok9290.range,
        endLineNumber: lastTok9291.lineNumber,
        endLineStart: lastTok9291.lineStart,
        endRange: lastTok9291.range
    };
}
var // Since an actual parser object doesn't exist and we want to
// introduce our own API anyway, we create a special reader object
// for reader extensions
readerAPI8646 = Object.defineProperties({
    Token: Token8469,
    isIdentifierStart: isIdentifierStart8503,
    isIdentifierPart: isIdentifierPart8504,
    isLineTerminator: isLineTerminator8502,
    readIdentifier: scanIdentifier8514,
    readPunctuator: scanPunctuator8515,
    readStringLiteral: scanStringLiteral8519,
    readNumericLiteral: scanNumericLiteral8518,
    readRegExp: scanRegExp8522,
    readToken: function readToken() {
        return readToken8647([], false, false);
    },
    readDelimiter: function readDelimiter() {
        return readDelim8648([], false, false);
    },
    skipComment: scanComment8627,
    makeIdentifier: makeIdentifier8640,
    makePunctuator: makePunctuator8641,
    makeStringLiteral: makeStringLiteral8642,
    makeNumericLiteral: makeNumericLiteral8643,
    makeRegExp: makeRegExp8644,
    makeDelimiter: makeDelimiter8645,
    suppressReadError: suppressReadError8639,
    peekQueued: readtables8636.peekQueued,
    getQueued: readtables8636.getQueued
}, {
    source: {
        get: function () {
            return source8478;
        },
        enumerable: true,
        configurable: true
    },
    index: {
        get: function () {
            return index8480;
        },
        set: function (x) {
            index8480 = x;
        },
        enumerable: true,
        configurable: true
    },
    length: {
        get: function () {
            return length8487;
        },
        set: function (x) {
            length8487 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineNumber: {
        get: function () {
            return lineNumber8481;
        },
        set: function (x) {
            lineNumber8481 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineStart: {
        get: function () {
            return lineStart8482;
        },
        set: function (x) {
            lineStart8482 = x;
        },
        enumerable: true,
        configurable: true
    },
    extra: {
        get: function () {
            return extra8495;
        },
        enumerable: true,
        configurable: true
    }
});
readtables8636.readerAPI = readerAPI8646;
function readToken8647(toks9292, inExprDelim9293, parentIsBlock9294) {
    var delimiters9295 = ["(", "{", "["];
    var parenIdents9296 = ["if", "while", "for", "with"];
    var last9297 = toks9292.length - 1;
    var comments9298,
        commentsLen9299 = extra8495.comments.length;
    function back9300(n9306) {
        var idx9307 = toks9292.length - n9306 > 0 ? toks9292.length - n9306 : 0;
        return toks9292[idx9307];
    }
    function attachComments9301(token9308) {
        if (comments9298) {
            token9308.leadingComments = comments9298;
        }
        return token9308;
    }
    function _advance9302() {
        return attachComments9301(advance8525());
    }
    function _scanRegExp9303() {
        return attachComments9301(scanRegExp8522());
    }
    skipComment8509();
    var ch9304 = source8478[index8480];
    if (extra8495.comments.length > commentsLen9299) {
        comments9298 = extra8495.comments.slice(commentsLen9299);
    }
    if (isIn8497(source8478[index8480], delimiters9295)) {
        return attachComments9301(readDelim8648(toks9292, inExprDelim9293, parentIsBlock9294));
    }
    // Check if we should get the token from the readtable
    var readtableToken9305;
    if ((readtableToken9305 = readtables8636.getQueued()) || readtables8636.has(ch9304) && (readtableToken9305 = readtables8636.invoke(ch9304, toks9292))) {
        return readtableToken9305;
    }
    if (ch9304 === "/") {
        var prev9309 = back9300(1);
        if (prev9309) {
            if (prev9309.value === "()") {
                if (isIn8497(back9300(2).value, parenIdents9296)) {
                    // ... if (...) / ...
                    return _scanRegExp9303();
                }
                // ... (...) / ...
                return _advance9302();
            }
            if (prev9309.value === "{}") {
                if (blockAllowed8635(toks9292, 0, inExprDelim9293, parentIsBlock9294)) {
                    if (back9300(2).value === "()") {
                        if ( // named function
                        back9300(4).value === "function") {
                            if (!blockAllowed8635(toks9292, 3, inExprDelim9293, parentIsBlock9294)) {
                                // new function foo (...) {...} / ...
                                return _advance9302();
                            }
                            if (toks9292.length - 5 <= 0 && inExprDelim9293) {
                                // (function foo (...) {...} /...)
                                // [function foo (...) {...} /...]
                                return _advance9302();
                            }
                        }
                        if ( // unnamed function
                        back9300(3).value === "function") {
                            if (!blockAllowed8635(toks9292, 2, inExprDelim9293, parentIsBlock9294)) {
                                // new function (...) {...} / ...
                                return _advance9302();
                            }
                            if (toks9292.length - 4 <= 0 && inExprDelim9293) {
                                // (function (...) {...} /...)
                                // [function (...) {...} /...]
                                return _advance9302();
                            }
                        }
                    }
                    // ...; {...} /...
                    return _scanRegExp9303();
                } else {
                    // ... + {...} / ...
                    return _advance9302();
                }
            }
            if (prev9309.type === Token8469.Punctuator) {
                // ... + /...
                return _scanRegExp9303();
            }
            if (isKeyword8508(prev9309.value) && prev9309.value !== "this" && prev9309.value !== "let" && prev9309.value !== "export") {
                // typeof /...
                return _scanRegExp9303();
            }
            return _advance9302();
        }
        return _scanRegExp9303();
    }
    return _advance9302();
}
function readDelim8648(toks9310, inExprDelim9311, parentIsBlock9312) {
    var startDelim9313 = advance8525(),
        matchDelim9314 = {
        "(": ")",
        "{": "}",
        "[": "]"
    },
        inner9315 = [];
    var delimiters9316 = ["(", "{", "["];
    assert8496(delimiters9316.indexOf(startDelim9313.value) !== -1, "Need to begin at the delimiter");
    var token9317 = startDelim9313;
    var startLineNumber9318 = token9317.lineNumber;
    var startLineStart9319 = token9317.lineStart;
    var startRange9320 = token9317.range;
    var delimToken9321 = {};
    delimToken9321.type = Token8469.Delimiter;
    delimToken9321.value = startDelim9313.value + matchDelim9314[startDelim9313.value];
    delimToken9321.startLineNumber = startLineNumber9318;
    delimToken9321.startLineStart = startLineStart9319;
    delimToken9321.startRange = startRange9320;
    var delimIsBlock9322 = false;
    if (startDelim9313.value === "{") {
        delimIsBlock9322 = blockAllowed8635(toks9310.concat(delimToken9321), 0, inExprDelim9311, parentIsBlock9312);
    }
    while (index8480 <= length8487) {
        token9317 = readToken8647(inner9315, startDelim9313.value === "(" || startDelim9313.value === "[", delimIsBlock9322);
        if (token9317.type === Token8469.Punctuator && token9317.value === matchDelim9314[startDelim9313.value]) {
            if (token9317.leadingComments) {
                delimToken9321.trailingComments = token9317.leadingComments;
            }
            break;
        } else if (token9317.type === Token8469.EOF) {
            throwError8533({}, Messages8474.UnexpectedEOS);
        } else {
            inner9315.push(token9317);
        }
    }
    if ( // at the end of the stream but the very last char wasn't the closing delimiter
    index8480 >= length8487 && matchDelim9314[startDelim9313.value] !== source8478[length8487 - 1]) {
        throwError8533({}, Messages8474.UnexpectedEOS);
    }
    var endLineNumber9323 = token9317.lineNumber;
    var endLineStart9324 = token9317.lineStart;
    var endRange9325 = token9317.range;
    delimToken9321.inner = inner9315;
    delimToken9321.endLineNumber = endLineNumber9323;
    delimToken9321.endLineStart = endLineStart9324;
    delimToken9321.endRange = endRange9325;
    return delimToken9321;
}
function setReadtable8649(readtable9326, syn9327) {
    readtables8636.currentReadtable = readtable9326;
    if (syn9327) {
        readtables8636.readerAPI.throwSyntaxError = function (name9328, message9329, tok9330) {
            var sx9331 = syn9327.syntaxFromToken(tok9330);
            var err9332 = new syn9327.MacroSyntaxError(name9328, message9329, sx9331);
            throw new SyntaxError(syn9327.printSyntaxError(source8478, err9332));
        };
    }
}
function currentReadtable8650() {
    return readtables8636.currentReadtable;
}
function read8651(code9333) {
    var token9334,
        tokenTree9335 = [];
    extra8495 = {};
    extra8495.comments = [];
    extra8495.range = true;
    extra8495.loc = true;
    patch8631();
    source8478 = code9333;
    index8480 = 0;
    lineNumber8481 = source8478.length > 0 ? 1 : 0;
    lineStart8482 = 0;
    length8487 = source8478.length;
    state8493 = {
        allowIn: true,
        labelSet: {},
        lastParenthesized: null,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false
    };
    while (index8480 < length8487 || readtables8636.peekQueued()) {
        tokenTree9335.push(readToken8647(tokenTree9335, false, false));
    }
    var last9336 = tokenTree9335[tokenTree9335.length - 1];
    if (last9336 && last9336.type !== Token8469.EOF) {
        tokenTree9335.push({
            type: Token8469.EOF,
            value: "",
            lineNumber: last9336.lineNumber,
            lineStart: last9336.lineStart,
            range: [index8480, index8480]
        });
    }
    return expander8468.tokensToSyntax(tokenTree9335);
}
function parse8652(code9337, options9338) {
    var program9339, toString9340;
    extra8495 = {};
    if ( // given an array of tokens instead of a string
    Array.isArray(code9337)) {
        tokenStream8489 = code9337;
        length8487 = tokenStream8489.length;
        lineNumber8481 = tokenStream8489.length > 0 ? 1 : 0;
        source8478 = undefined;
    } else {
        toString9340 = String;
        if (typeof code9337 !== "string" && !(code9337 instanceof String)) {
            code9337 = toString9340(code9337);
        }
        source8478 = code9337;
        length8487 = source8478.length;
        lineNumber8481 = source8478.length > 0 ? 1 : 0;
    }
    delegate8488 = SyntaxTreeDelegate8476;
    streamIndex8490 = -1;
    index8480 = 0;
    lineStart8482 = 0;
    sm_lineStart8484 = 0;
    sm_lineNumber8483 = lineNumber8481;
    sm_index8486 = 0;
    sm_range8485 = [0, 0];
    lookahead8491 = null;
    phase8494 = options9338 && typeof options9338.phase !== "undefined" ? options9338.phase : 0;
    state8493 = {
        allowKeyword: false,
        allowIn: true,
        labelSet: {},
        parenthesizedCount: 0,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        yieldAllowed: false
    };
    extra8495.attachComment = true;
    extra8495.range = true;
    extra8495.comments = [];
    extra8495.bottomRightStack = [];
    extra8495.trailingComments = [];
    extra8495.leadingComments = [];
    if (typeof options9338 !== "undefined") {
        extra8495.range = typeof options9338.range === "boolean" && options9338.range;
        extra8495.loc = typeof options9338.loc === "boolean" && options9338.loc;
        extra8495.attachComment = typeof options9338.attachComment === "boolean" && options9338.attachComment;
        if (extra8495.loc && options9338.source !== null && options9338.source !== undefined) {
            delegate8488 = extend8633(delegate8488, {
                postProcess: function (node9341) {
                    node9341.loc.source = toString9340(options9338.source);
                    return node9341;
                }
            });
        }
        if (typeof options9338.tokens === "boolean" && options9338.tokens) {
            extra8495.tokens = [];
        }
        if (typeof options9338.comment === "boolean" && options9338.comment) {
            extra8495.comments = [];
        }
        if (typeof options9338.tolerant === "boolean" && options9338.tolerant) {
            extra8495.errors = [];
        }
    }
    if (length8487 > 0) {
        if (source8478 && typeof source8478[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9337 instanceof String) {
                source8478 = code9337.valueOf();
            }
        }
    }
    extra8495.loc = true;
    extra8495.errors = [];
    patch8631();
    try {
        program9339 = parseProgram8625();
        if (typeof extra8495.comments !== "undefined") {
            program9339.comments = extra8495.comments;
        }
        if (typeof extra8495.tokens !== "undefined") {
            filterTokenLocation8630();
            program9339.tokens = extra8495.tokens;
        }
        if (typeof extra8495.errors !== "undefined") {
            program9339.errors = extra8495.errors;
        }
    } catch (e9342) {
        throw e9342;
    } finally {
        unpatch8632();
        extra8495 = {};
    }
    return program9339;
}
exports.tokenize = tokenize8634;
exports.read = read8651;
exports.Token = Token8469;
exports.setReadtable = setReadtable8649;
exports.currentReadtable = currentReadtable8650;
exports.parse = parse8652;
// Deep copy.
exports.Syntax = (function () {
    var name9343,
        types9344 = {};
    if (typeof Object.create === "function") {
        types9344 = Object.create(null);
    }
    for (name9343 in Syntax8472) {
        if (Syntax8472.hasOwnProperty(name9343)) {
            types9344[name9343] = Syntax8472[name9343];
        }
    }
    if (typeof Object.freeze === "function") {
        Object.freeze(types9344);
    }
    return types9344;
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