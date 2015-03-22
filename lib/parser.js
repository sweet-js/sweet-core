"use strict";

var expander8402 = require("./expander");
var Token8403, TokenName8404, FnExprTokens8405, Syntax8406, PropertyKind8407, Messages8408, Regex8409, SyntaxTreeDelegate8410, ClassPropertyType8411, source8412, strict8413, index8414, lineNumber8415, lineStart8416, sm_lineNumber8417, sm_lineStart8418, sm_range8419, sm_index8420, length8421, delegate8422, tokenStream8423, streamIndex8424, lookahead8425, lookaheadIndex8426, state8427, phase8428, extra8429;
Token8403 = {
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
TokenName8404 = {};
TokenName8404[Token8403.BooleanLiteral] = "Boolean";
TokenName8404[Token8403.EOF] = "<end>";
TokenName8404[Token8403.Identifier] = "Identifier";
TokenName8404[Token8403.Keyword] = "Keyword";
TokenName8404[Token8403.NullLiteral] = "Null";
TokenName8404[Token8403.NumericLiteral] = "Numeric";
TokenName8404[Token8403.Punctuator] = "Punctuator";
TokenName8404[Token8403.StringLiteral] = "String";
TokenName8404[Token8403.RegularExpression] = "RegularExpression";
TokenName8404[Token8403.Delimiter] = "Delimiter";
// A function following one of those tokens is an expression.
FnExprTokens8405 = ["(", "{", "[", "in", "typeof", "instanceof", "new", "return", "case", "delete", "throw", "void",
// assignment operators
"=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ",",
// binary/unary operators
"+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!=="];
Syntax8406 = {
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
PropertyKind8407 = {
    Data: 1,
    Get: 2,
    Set: 4
};
ClassPropertyType8411 = {
    "static": "static",
    prototype: "prototype"
};
// Error messages should be identical to V8.
Messages8408 = {
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
Regex8409 = {
    NonAsciiIdentifierStart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),
    NonAsciiIdentifierPart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")
};
function assert8430(condition8586, message8587) {
    if (!condition8586) {
        throw new Error("ASSERT: " + message8587);
    }
}
function isIn8431(el8588, list8589) {
    return list8589.indexOf(el8588) !== -1;
}
function isDecimalDigit8432(ch8590) {
    return ch8590 >= 48 && ch8590 <= 57;
}
function isHexDigit8433(ch8591) {
    return "0123456789abcdefABCDEF".indexOf(ch8591) >= 0;
}
function isOctalDigit8434(ch8592) {
    return "01234567".indexOf(ch8592) >= 0;
}
function isWhiteSpace8435(ch8593) {
    return ch8593 === 32 || // space
    ch8593 === 9 || // tab
    ch8593 === 11 || ch8593 === 12 || ch8593 === 160 || ch8593 >= 5760 && " ᠎             　﻿".indexOf(String.fromCharCode(ch8593)) > 0;
}
function isLineTerminator8436(ch8594) {
    return ch8594 === 10 || ch8594 === 13 || ch8594 === 8232 || ch8594 === 8233;
}
function isIdentifierStart8437(ch8595) {
    return ch8595 === 36 || ch8595 === 95 || // $ (dollar) and _ (underscore)
    ch8595 >= 65 && ch8595 <= 90 || // A..Z
    ch8595 >= 97 && ch8595 <= 122 || // a..z
    ch8595 === 92 || // \ (backslash)
    ch8595 >= 128 && Regex8409.NonAsciiIdentifierStart.test(String.fromCharCode(ch8595));
}
function isIdentifierPart8438(ch8596) {
    return ch8596 === 36 || ch8596 === 95 || // $ (dollar) and _ (underscore)
    ch8596 >= 65 && ch8596 <= 90 || // A..Z
    ch8596 >= 97 && ch8596 <= 122 || // a..z
    ch8596 >= 48 && ch8596 <= 57 || // 0..9
    ch8596 === 92 || // \ (backslash)
    ch8596 >= 128 && Regex8409.NonAsciiIdentifierPart.test(String.fromCharCode(ch8596));
}
function isFutureReservedWord8439(id8597) {
    switch (id8597) {
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
function isStrictModeReservedWord8440(id8598) {
    switch (id8598) {
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
function isRestrictedWord8441(id8599) {
    return id8599 === "eval" || id8599 === "arguments";
}
function isKeyword8442(id8600) {
    if (strict8413 && isStrictModeReservedWord8440(id8600)) {
        return true;
    }
    switch ( // 'const' is specialized as Keyword in V8.
    // 'yield' is only treated as a keyword in strict mode.
    // 'let' is for compatiblity with SpiderMonkey and ES.next.
    // Some others are from future reserved words.
    id8600.length) {
        case 2:
            return id8600 === "if" || id8600 === "in" || id8600 === "do";
        case 3:
            return id8600 === "var" || id8600 === "for" || id8600 === "new" || id8600 === "try" || id8600 === "let";
        case 4:
            return id8600 === "this" || id8600 === "else" || id8600 === "case" || id8600 === "void" || id8600 === "with" || id8600 === "enum";
        case 5:
            return id8600 === "while" || id8600 === "break" || id8600 === "catch" || id8600 === "throw" || id8600 === "const" || id8600 === "class" || id8600 === "super";
        case 6:
            return id8600 === "return" || id8600 === "typeof" || id8600 === "delete" || id8600 === "switch" || id8600 === "export" || id8600 === "import";
        case 7:
            return id8600 === "default" || id8600 === "finally" || id8600 === "extends";
        case 8:
            return id8600 === "function" || id8600 === "continue" || id8600 === "debugger";
        case 10:
            return id8600 === "instanceof";
        default:
            return false;
    }
}
function skipComment8443() {
    var ch8601, blockComment8602, lineComment8603;
    blockComment8602 = false;
    lineComment8603 = false;
    while (index8414 < length8421) {
        ch8601 = source8412.charCodeAt(index8414);
        if (lineComment8603) {
            ++index8414;
            if (isLineTerminator8436(ch8601)) {
                lineComment8603 = false;
                if (ch8601 === 13 && source8412.charCodeAt(index8414) === 10) {
                    ++index8414;
                }
                ++lineNumber8415;
                lineStart8416 = index8414;
            }
        } else if (blockComment8602) {
            if (isLineTerminator8436(ch8601)) {
                if (ch8601 === 13 && source8412.charCodeAt(index8414 + 1) === 10) {
                    ++index8414;
                }
                ++lineNumber8415;
                ++index8414;
                lineStart8416 = index8414;
                if (index8414 >= length8421) {
                    throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch8601 = source8412.charCodeAt(index8414++);
                if (index8414 >= length8421) {
                    throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
                }
                if ( // Block comment ends with '*/' (char #42, char #47).
                ch8601 === 42) {
                    ch8601 = source8412.charCodeAt(index8414);
                    if (ch8601 === 47) {
                        ++index8414;
                        blockComment8602 = false;
                    }
                }
            }
        } else if (ch8601 === 47) {
            ch8601 = source8412.charCodeAt(index8414 + 1);
            if ( // Line comment starts with '//' (char #47, char #47).
            ch8601 === 47) {
                index8414 += 2;
                lineComment8603 = true;
            } else if (ch8601 === 42) {
                // Block comment starts with '/*' (char #47, char #42).
                index8414 += 2;
                blockComment8602 = true;
                if (index8414 >= length8421) {
                    throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8435(ch8601)) {
            ++index8414;
        } else if (isLineTerminator8436(ch8601)) {
            ++index8414;
            if (ch8601 === 13 && source8412.charCodeAt(index8414) === 10) {
                ++index8414;
            }
            ++lineNumber8415;
            lineStart8416 = index8414;
        } else {
            break;
        }
    }
}
function scanHexEscape8444(prefix8604) {
    var i8605,
        len8606,
        ch8607,
        code8608 = 0;
    len8606 = prefix8604 === "u" ? 4 : 2;
    for (i8605 = 0; i8605 < len8606; ++i8605) {
        if (index8414 < length8421 && isHexDigit8433(source8412[index8414])) {
            ch8607 = source8412[index8414++];
            code8608 = code8608 * 16 + "0123456789abcdef".indexOf(ch8607.toLowerCase());
        } else {
            return "";
        }
    }
    return String.fromCharCode(code8608);
}
function scanUnicodeCodePointEscape8445() {
    var ch8609, code8610, cu18611, cu28612;
    ch8609 = source8412[index8414];
    code8610 = 0;
    if ( // At least, one hex digit is required.
    ch8609 === "}") {
        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
    }
    while (index8414 < length8421) {
        ch8609 = source8412[index8414++];
        if (!isHexDigit8433(ch8609)) {
            break;
        }
        code8610 = code8610 * 16 + "0123456789abcdef".indexOf(ch8609.toLowerCase());
    }
    if (code8610 > 1114111 || ch8609 !== "}") {
        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
    }
    if ( // UTF-16 Encoding
    code8610 <= 65535) {
        return String.fromCharCode(code8610);
    }
    cu18611 = (code8610 - 65536 >> 10) + 55296;
    cu28612 = (code8610 - 65536 & 1023) + 56320;
    return String.fromCharCode(cu18611, cu28612);
}
function getEscapedIdentifier8446() {
    var ch8613, id8614;
    ch8613 = source8412.charCodeAt(index8414++);
    id8614 = String.fromCharCode(ch8613);
    if ( // '\u' (char #92, char #117) denotes an escaped character.
    ch8613 === 92) {
        if (source8412.charCodeAt(index8414) !== 117) {
            throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
        }
        ++index8414;
        ch8613 = scanHexEscape8444("u");
        if (!ch8613 || ch8613 === "\\" || !isIdentifierStart8437(ch8613.charCodeAt(0))) {
            throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
        }
        id8614 = ch8613;
    }
    while (index8414 < length8421) {
        ch8613 = source8412.charCodeAt(index8414);
        if (!isIdentifierPart8438(ch8613)) {
            break;
        }
        ++index8414;
        id8614 += String.fromCharCode(ch8613);
        if ( // '\u' (char #92, char #117) denotes an escaped character.
        ch8613 === 92) {
            id8614 = id8614.substr(0, id8614.length - 1);
            if (source8412.charCodeAt(index8414) !== 117) {
                throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
            }
            ++index8414;
            ch8613 = scanHexEscape8444("u");
            if (!ch8613 || ch8613 === "\\" || !isIdentifierPart8438(ch8613.charCodeAt(0))) {
                throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
            }
            id8614 += ch8613;
        }
    }
    return id8614;
}
function getIdentifier8447() {
    var start8615, ch8616;
    start8615 = index8414++;
    while (index8414 < length8421) {
        ch8616 = source8412.charCodeAt(index8414);
        if (ch8616 === 92) {
            // Blackslash (char #92) marks Unicode escape sequence.
            index8414 = start8615;
            return getEscapedIdentifier8446();
        }
        if (isIdentifierPart8438(ch8616)) {
            ++index8414;
        } else {
            break;
        }
    }
    return source8412.slice(start8615, index8414);
}
function scanIdentifier8448() {
    var start8617, id8618, type8619;
    start8617 = index8414;
    // Backslash (char #92) starts an escaped character.
    id8618 = source8412.charCodeAt(index8414) === 92 ? getEscapedIdentifier8446() : getIdentifier8447();
    if ( // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    id8618.length === 1) {
        type8619 = Token8403.Identifier;
    } else if (isKeyword8442(id8618)) {
        type8619 = Token8403.Keyword;
    } else if (id8618 === "null") {
        type8619 = Token8403.NullLiteral;
    } else if (id8618 === "true" || id8618 === "false") {
        type8619 = Token8403.BooleanLiteral;
    } else {
        type8619 = Token8403.Identifier;
    }
    return {
        type: type8619,
        value: id8618,
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [start8617, index8414]
    };
}
function scanPunctuator8449() {
    var start8620 = index8414,
        code8621 = source8412.charCodeAt(index8414),
        code28622,
        ch18623 = source8412[index8414],
        ch28624,
        ch38625,
        ch48626;
    switch (code8621) {
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
            ++index8414;
            if (extra8429.tokenize) {
                if (code8621 === 40) {
                    extra8429.openParenToken = extra8429.tokens.length;
                } else if (code8621 === 123) {
                    extra8429.openCurlyToken = extra8429.tokens.length;
                }
            }
            return {
                type: Token8403.Punctuator,
                value: String.fromCharCode(code8621),
                lineNumber: lineNumber8415,
                lineStart: lineStart8416,
                range: [start8620, index8414]
            };
        default:
            code28622 = source8412.charCodeAt(index8414 + 1);
            if ( // '=' (char #61) marks an assignment or comparison operator.
            code28622 === 61) {
                switch (code8621) {
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
                        index8414 += 2;
                        return {
                            type: Token8403.Punctuator,
                            value: String.fromCharCode(code8621) + String.fromCharCode(code28622),
                            lineNumber: lineNumber8415,
                            lineStart: lineStart8416,
                            range: [start8620, index8414]
                        };
                    case 33:
                    case // !
                    61:
                        // =
                        index8414 += 2;
                        if ( // !== and ===
                        source8412.charCodeAt(index8414) === 61) {
                            ++index8414;
                        }
                        return {
                            type: Token8403.Punctuator,
                            value: source8412.slice(start8620, index8414),
                            lineNumber: lineNumber8415,
                            lineStart: lineStart8416,
                            range: [start8620, index8414]
                        };
                    default:
                        break;
                }
            }
            break;
    }
    // Peek more characters.
    ch28624 = source8412[index8414 + 1];
    ch38625 = source8412[index8414 + 2];
    ch48626 = source8412[index8414 + 3];
    if ( // 4-character punctuator: >>>=
    ch18623 === ">" && ch28624 === ">" && ch38625 === ">") {
        if (ch48626 === "=") {
            index8414 += 4;
            return {
                type: Token8403.Punctuator,
                value: ">>>=",
                lineNumber: lineNumber8415,
                lineStart: lineStart8416,
                range: [start8620, index8414]
            };
        }
    }
    if ( // 3-character punctuators: === !== >>> <<= >>=
    ch18623 === ">" && ch28624 === ">" && ch38625 === ">") {
        index8414 += 3;
        return {
            type: Token8403.Punctuator,
            value: ">>>",
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [start8620, index8414]
        };
    }
    if (ch18623 === "<" && ch28624 === "<" && ch38625 === "=") {
        index8414 += 3;
        return {
            type: Token8403.Punctuator,
            value: "<<=",
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [start8620, index8414]
        };
    }
    if (ch18623 === ">" && ch28624 === ">" && ch38625 === "=") {
        index8414 += 3;
        return {
            type: Token8403.Punctuator,
            value: ">>=",
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [start8620, index8414]
        };
    }
    if (ch18623 === "." && ch28624 === "." && ch38625 === ".") {
        index8414 += 3;
        return {
            type: Token8403.Punctuator,
            value: "...",
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [start8620, index8414]
        };
    }
    if ( // Other 2-character punctuators: ++ -- << >> && ||
    ch18623 === ch28624 && "+-<>&|".indexOf(ch18623) >= 0) {
        index8414 += 2;
        return {
            type: Token8403.Punctuator,
            value: ch18623 + ch28624,
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [start8620, index8414]
        };
    }
    if (ch18623 === "=" && ch28624 === ">") {
        index8414 += 2;
        return {
            type: Token8403.Punctuator,
            value: "=>",
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [start8620, index8414]
        };
    }
    if ("<>=!+-*%&|^/".indexOf(ch18623) >= 0) {
        ++index8414;
        return {
            type: Token8403.Punctuator,
            value: ch18623,
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [start8620, index8414]
        };
    }
    if (ch18623 === ".") {
        ++index8414;
        return {
            type: Token8403.Punctuator,
            value: ch18623,
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [start8620, index8414]
        };
    }
    throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
}
function scanHexLiteral8450(start8627) {
    var number8628 = "";
    while (index8414 < length8421) {
        if (!isHexDigit8433(source8412[index8414])) {
            break;
        }
        number8628 += source8412[index8414++];
    }
    if (number8628.length === 0) {
        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8437(source8412.charCodeAt(index8414))) {
        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8403.NumericLiteral,
        value: parseInt("0x" + number8628, 16),
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [start8627, index8414]
    };
}
function scanOctalLiteral8451(prefix8629, start8630) {
    var number8631, octal8632;
    if (isOctalDigit8434(prefix8629)) {
        octal8632 = true;
        number8631 = "0" + source8412[index8414++];
    } else {
        octal8632 = false;
        ++index8414;
        number8631 = "";
    }
    while (index8414 < length8421) {
        if (!isOctalDigit8434(source8412[index8414])) {
            break;
        }
        number8631 += source8412[index8414++];
    }
    if (!octal8632 && number8631.length === 0) {
        // only 0o or 0O
        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8437(source8412.charCodeAt(index8414)) || isDecimalDigit8432(source8412.charCodeAt(index8414))) {
        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8403.NumericLiteral,
        value: parseInt(number8631, 8),
        octal: octal8632,
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [start8630, index8414]
    };
}
function scanNumericLiteral8452() {
    var number8633, start8634, ch8635, octal8636;
    ch8635 = source8412[index8414];
    assert8430(isDecimalDigit8432(ch8635.charCodeAt(0)) || ch8635 === ".", "Numeric literal must start with a decimal digit or a decimal point");
    start8634 = index8414;
    number8633 = "";
    if (ch8635 !== ".") {
        number8633 = source8412[index8414++];
        ch8635 = source8412[index8414];
        if ( // Hex number starts with '0x'.
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        // Binary number in ES6 starts with '0b'.
        number8633 === "0") {
            if (ch8635 === "x" || ch8635 === "X") {
                ++index8414;
                return scanHexLiteral8450(start8634);
            }
            if (ch8635 === "b" || ch8635 === "B") {
                ++index8414;
                number8633 = "";
                while (index8414 < length8421) {
                    ch8635 = source8412[index8414];
                    if (ch8635 !== "0" && ch8635 !== "1") {
                        break;
                    }
                    number8633 += source8412[index8414++];
                }
                if (number8633.length === 0) {
                    // only 0b or 0B
                    throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
                }
                if (index8414 < length8421) {
                    ch8635 = source8412.charCodeAt(index8414);
                    if (isIdentifierStart8437(ch8635) || isDecimalDigit8432(ch8635)) {
                        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
                    }
                }
                return {
                    type: Token8403.NumericLiteral,
                    value: parseInt(number8633, 2),
                    lineNumber: lineNumber8415,
                    lineStart: lineStart8416,
                    range: [start8634, index8414]
                };
            }
            if (ch8635 === "o" || ch8635 === "O" || isOctalDigit8434(ch8635)) {
                return scanOctalLiteral8451(ch8635, start8634);
            }
            if ( // decimal number starts with '0' such as '09' is illegal.
            ch8635 && isDecimalDigit8432(ch8635.charCodeAt(0))) {
                throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
            }
        }
        while (isDecimalDigit8432(source8412.charCodeAt(index8414))) {
            number8633 += source8412[index8414++];
        }
        ch8635 = source8412[index8414];
    }
    if (ch8635 === ".") {
        number8633 += source8412[index8414++];
        while (isDecimalDigit8432(source8412.charCodeAt(index8414))) {
            number8633 += source8412[index8414++];
        }
        ch8635 = source8412[index8414];
    }
    if (ch8635 === "e" || ch8635 === "E") {
        number8633 += source8412[index8414++];
        ch8635 = source8412[index8414];
        if (ch8635 === "+" || ch8635 === "-") {
            number8633 += source8412[index8414++];
        }
        if (isDecimalDigit8432(source8412.charCodeAt(index8414))) {
            while (isDecimalDigit8432(source8412.charCodeAt(index8414))) {
                number8633 += source8412[index8414++];
            }
        } else {
            throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
        }
    }
    if (isIdentifierStart8437(source8412.charCodeAt(index8414))) {
        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8403.NumericLiteral,
        value: parseFloat(number8633),
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [start8634, index8414]
    };
}
function scanStringLiteral8453() {
    var str8637 = "",
        quote8638,
        start8639,
        ch8640,
        code8641,
        unescaped8642,
        restore8643,
        octal8644 = false;
    quote8638 = source8412[index8414];
    assert8430(quote8638 === "'" || quote8638 === "\"", "String literal must starts with a quote");
    start8639 = index8414;
    ++index8414;
    while (index8414 < length8421) {
        ch8640 = source8412[index8414++];
        if (ch8640 === quote8638) {
            quote8638 = "";
            break;
        } else if (ch8640 === "\\") {
            ch8640 = source8412[index8414++];
            if (!ch8640 || !isLineTerminator8436(ch8640.charCodeAt(0))) {
                switch (ch8640) {
                    case "n":
                        str8637 += "\n";
                        break;
                    case "r":
                        str8637 += "\r";
                        break;
                    case "t":
                        str8637 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8412[index8414] === "{") {
                            ++index8414;
                            str8637 += scanUnicodeCodePointEscape8445();
                        } else {
                            restore8643 = index8414;
                            unescaped8642 = scanHexEscape8444(ch8640);
                            if (unescaped8642) {
                                str8637 += unescaped8642;
                            } else {
                                index8414 = restore8643;
                                str8637 += ch8640;
                            }
                        }
                        break;
                    case "b":
                        str8637 += "\b";
                        break;
                    case "f":
                        str8637 += "\f";
                        break;
                    case "v":
                        str8637 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8434(ch8640)) {
                            code8641 = "01234567".indexOf(ch8640);
                            if ( // \0 is not octal escape sequence
                            code8641 !== 0) {
                                octal8644 = true;
                            }
                            if (index8414 < length8421 && isOctalDigit8434(source8412[index8414])) {
                                octal8644 = true;
                                code8641 = code8641 * 8 + "01234567".indexOf(source8412[index8414++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8640) >= 0 && index8414 < length8421 && isOctalDigit8434(source8412[index8414])) {
                                    code8641 = code8641 * 8 + "01234567".indexOf(source8412[index8414++]);
                                }
                            }
                            str8637 += String.fromCharCode(code8641);
                        } else {
                            str8637 += ch8640;
                        }
                        break;
                }
            } else {
                ++lineNumber8415;
                if (ch8640 === "\r" && source8412[index8414] === "\n") {
                    ++index8414;
                }
                lineStart8416 = index8414;
            }
        } else if (isLineTerminator8436(ch8640.charCodeAt(0))) {
            break;
        } else {
            str8637 += ch8640;
        }
    }
    if (quote8638 !== "") {
        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8403.StringLiteral,
        value: str8637,
        octal: octal8644,
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [start8639, index8414]
    };
}
function scanTemplate8454() {
    var cooked8645 = "",
        ch8646,
        start8647,
        terminated8648,
        tail8649,
        restore8650,
        unescaped8651,
        code8652,
        octal8653;
    terminated8648 = false;
    tail8649 = false;
    start8647 = index8414;
    ++index8414;
    while (index8414 < length8421) {
        ch8646 = source8412[index8414++];
        if (ch8646 === "`") {
            tail8649 = true;
            terminated8648 = true;
            break;
        } else if (ch8646 === "$") {
            if (source8412[index8414] === "{") {
                ++index8414;
                terminated8648 = true;
                break;
            }
            cooked8645 += ch8646;
        } else if (ch8646 === "\\") {
            ch8646 = source8412[index8414++];
            if (!isLineTerminator8436(ch8646.charCodeAt(0))) {
                switch (ch8646) {
                    case "n":
                        cooked8645 += "\n";
                        break;
                    case "r":
                        cooked8645 += "\r";
                        break;
                    case "t":
                        cooked8645 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8412[index8414] === "{") {
                            ++index8414;
                            cooked8645 += scanUnicodeCodePointEscape8445();
                        } else {
                            restore8650 = index8414;
                            unescaped8651 = scanHexEscape8444(ch8646);
                            if (unescaped8651) {
                                cooked8645 += unescaped8651;
                            } else {
                                index8414 = restore8650;
                                cooked8645 += ch8646;
                            }
                        }
                        break;
                    case "b":
                        cooked8645 += "\b";
                        break;
                    case "f":
                        cooked8645 += "\f";
                        break;
                    case "v":
                        cooked8645 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8434(ch8646)) {
                            code8652 = "01234567".indexOf(ch8646);
                            if ( // \0 is not octal escape sequence
                            code8652 !== 0) {
                                octal8653 = true;
                            }
                            if (index8414 < length8421 && isOctalDigit8434(source8412[index8414])) {
                                octal8653 = true;
                                code8652 = code8652 * 8 + "01234567".indexOf(source8412[index8414++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8646) >= 0 && index8414 < length8421 && isOctalDigit8434(source8412[index8414])) {
                                    code8652 = code8652 * 8 + "01234567".indexOf(source8412[index8414++]);
                                }
                            }
                            cooked8645 += String.fromCharCode(code8652);
                        } else {
                            cooked8645 += ch8646;
                        }
                        break;
                }
            } else {
                ++lineNumber8415;
                if (ch8646 === "\r" && source8412[index8414] === "\n") {
                    ++index8414;
                }
                lineStart8416 = index8414;
            }
        } else if (isLineTerminator8436(ch8646.charCodeAt(0))) {
            ++lineNumber8415;
            if (ch8646 === "\r" && source8412[index8414] === "\n") {
                ++index8414;
            }
            lineStart8416 = index8414;
            cooked8645 += "\n";
        } else {
            cooked8645 += ch8646;
        }
    }
    if (!terminated8648) {
        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8403.Template,
        value: {
            cooked: cooked8645,
            raw: source8412.slice(start8647 + 1, index8414 - (tail8649 ? 1 : 2))
        },
        tail: tail8649,
        octal: octal8653,
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [start8647, index8414]
    };
}
function scanTemplateElement8455(option8654) {
    var startsWith8655, template8656;
    lookahead8425 = null;
    skipComment8443();
    startsWith8655 = option8654.head ? "`" : "}";
    if (source8412[index8414] !== startsWith8655) {
        throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
    }
    template8656 = scanTemplate8454();
    return template8656;
}
function scanRegExp8456() {
    var str8657,
        ch8658,
        start8659,
        pattern8660,
        flags8661,
        value8662,
        classMarker8663 = false,
        restore8664,
        terminated8665 = false,
        tmp8666;
    lookahead8425 = null;
    skipComment8443();
    start8659 = index8414;
    ch8658 = source8412[index8414];
    assert8430(ch8658 === "/", "Regular expression literal must start with a slash");
    str8657 = source8412[index8414++];
    while (index8414 < length8421) {
        ch8658 = source8412[index8414++];
        str8657 += ch8658;
        if (classMarker8663) {
            if (ch8658 === "]") {
                classMarker8663 = false;
            }
        } else {
            if (ch8658 === "\\") {
                ch8658 = source8412[index8414++];
                if ( // ECMA-262 7.8.5
                isLineTerminator8436(ch8658.charCodeAt(0))) {
                    throwError8467({}, Messages8408.UnterminatedRegExp);
                }
                str8657 += ch8658;
            } else if (ch8658 === "/") {
                terminated8665 = true;
                break;
            } else if (ch8658 === "[") {
                classMarker8663 = true;
            } else if (isLineTerminator8436(ch8658.charCodeAt(0))) {
                throwError8467({}, Messages8408.UnterminatedRegExp);
            }
        }
    }
    if (!terminated8665) {
        throwError8467({}, Messages8408.UnterminatedRegExp);
    }
    // Exclude leading and trailing slash.
    pattern8660 = str8657.substr(1, str8657.length - 2);
    flags8661 = "";
    while (index8414 < length8421) {
        ch8658 = source8412[index8414];
        if (!isIdentifierPart8438(ch8658.charCodeAt(0))) {
            break;
        }
        ++index8414;
        if (ch8658 === "\\" && index8414 < length8421) {
            ch8658 = source8412[index8414];
            if (ch8658 === "u") {
                ++index8414;
                restore8664 = index8414;
                ch8658 = scanHexEscape8444("u");
                if (ch8658) {
                    flags8661 += ch8658;
                    for (str8657 += "\\u"; restore8664 < index8414; ++restore8664) {
                        str8657 += source8412[restore8664];
                    }
                } else {
                    index8414 = restore8664;
                    flags8661 += "u";
                    str8657 += "\\u";
                }
            } else {
                str8657 += "\\";
            }
        } else {
            flags8661 += ch8658;
            str8657 += ch8658;
        }
    }
    tmp8666 = pattern8660;
    if (flags8661.indexOf("u") >= 0) {
        // Replace each astral symbol and every Unicode code point
        // escape sequence that represents such a symbol with a single
        // ASCII symbol to avoid throwing on regular expressions that
        // are only valid in combination with the `/u` flag.
        tmp8666 = tmp8666.replace(/\\u\{([0-9a-fA-F]{5,6})\}/g, "x").replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
    }
    try {
        // First, detect invalid regular expressions.
        value8662 = new RegExp(tmp8666);
    } catch (e8667) {
        throwError8467({}, Messages8408.InvalidRegExp);
    }
    try {
        // Return a regular expression object for this pattern-flag pair, or
        // `null` in case the current environment doesn't support the flags it
        // uses.
        value8662 = new RegExp(pattern8660, flags8661);
    } catch (exception8668) {
        value8662 = null;
    }
    if (extra8429.tokenize) {
        return {
            type: Token8403.RegularExpression,
            value: value8662,
            regex: {
                pattern: pattern8660,
                flags: flags8661
            },
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [start8659, index8414]
        };
    }
    return {
        type: Token8403.RegularExpression,
        literal: str8657,
        regex: {
            pattern: pattern8660,
            flags: flags8661
        },
        value: value8662,
        range: [start8659, index8414]
    };
}
function isIdentifierName8457(token8669) {
    return token8669.type === Token8403.Identifier || token8669.type === Token8403.Keyword || token8669.type === Token8403.BooleanLiteral || token8669.type === Token8403.NullLiteral;
}
function advanceSlash8458() {
    var prevToken8670, checkToken8671;
    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design
    prevToken8670 = extra8429.tokens[extra8429.tokens.length - 1];
    if (!prevToken8670) {
        // Nothing before that: it cannot be a division.
        return scanRegExp8456();
    }
    if (prevToken8670.type === "Punctuator") {
        if (prevToken8670.value === ")") {
            checkToken8671 = extra8429.tokens[extra8429.openParenToken - 1];
            if (checkToken8671 && checkToken8671.type === "Keyword" && (checkToken8671.value === "if" || checkToken8671.value === "while" || checkToken8671.value === "for" || checkToken8671.value === "with")) {
                return scanRegExp8456();
            }
            return scanPunctuator8449();
        }
        if (prevToken8670.value === "}") {
            if ( // Dividing a function by anything makes little sense,
            // but we have to check for that.
            extra8429.tokens[extra8429.openCurlyToken - 3] && extra8429.tokens[extra8429.openCurlyToken - 3].type === "Keyword") {
                // Anonymous function.
                checkToken8671 = extra8429.tokens[extra8429.openCurlyToken - 4];
                if (!checkToken8671) {
                    return scanPunctuator8449();
                }
            } else if (extra8429.tokens[extra8429.openCurlyToken - 4] && extra8429.tokens[extra8429.openCurlyToken - 4].type === "Keyword") {
                // Named function.
                checkToken8671 = extra8429.tokens[extra8429.openCurlyToken - 5];
                if (!checkToken8671) {
                    return scanRegExp8456();
                }
            } else {
                return scanPunctuator8449();
            }
            if ( // checkToken determines whether the function is
            // a declaration or an expression.
            FnExprTokens8405.indexOf(checkToken8671.value) >= 0) {
                // It is an expression.
                return scanPunctuator8449();
            }
            // It is a declaration.
            return scanRegExp8456();
        }
        return scanRegExp8456();
    }
    if (prevToken8670.type === "Keyword") {
        return scanRegExp8456();
    }
    return scanPunctuator8449();
}
function advance8459() {
    var ch8672;
    skipComment8443();
    if (index8414 >= length8421) {
        return {
            type: Token8403.EOF,
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [index8414, index8414]
        };
    }
    ch8672 = source8412.charCodeAt(index8414);
    if ( // Very common: ( and ) and ;
    ch8672 === 40 || ch8672 === 41 || ch8672 === 58) {
        return scanPunctuator8449();
    }
    if ( // String literal starts with single quote (#39) or double quote (#34).
    ch8672 === 39 || ch8672 === 34) {
        return scanStringLiteral8453();
    }
    if (ch8672 === 96) {
        return scanTemplate8454();
    }
    if (isIdentifierStart8437(ch8672)) {
        return scanIdentifier8448();
    }
    if ( // # and @ are allowed for sweet.js
    ch8672 === 35 || ch8672 === 64) {
        ++index8414;
        return {
            type: Token8403.Punctuator,
            value: String.fromCharCode(ch8672),
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [index8414 - 1, index8414]
        };
    }
    if ( // Dot (.) char #46 can also start a floating-point number, hence the need
    // to check the next character.
    ch8672 === 46) {
        if (isDecimalDigit8432(source8412.charCodeAt(index8414 + 1))) {
            return scanNumericLiteral8452();
        }
        return scanPunctuator8449();
    }
    if (isDecimalDigit8432(ch8672)) {
        return scanNumericLiteral8452();
    }
    if ( // Slash (/) char #47 can also start a regex.
    extra8429.tokenize && ch8672 === 47) {
        return advanceSlash8458();
    }
    return scanPunctuator8449();
}
function lex8460() {
    var token8673;
    token8673 = lookahead8425;
    streamIndex8424 = lookaheadIndex8426;
    lineNumber8415 = token8673.lineNumber;
    lineStart8416 = token8673.lineStart;
    sm_lineNumber8417 = lookahead8425.sm_lineNumber;
    sm_lineStart8418 = lookahead8425.sm_lineStart;
    sm_range8419 = lookahead8425.sm_range;
    sm_index8420 = lookahead8425.sm_range[0];
    lookahead8425 = tokenStream8423[++streamIndex8424].token;
    lookaheadIndex8426 = streamIndex8424;
    index8414 = lookahead8425.range[0];
    if (token8673.leadingComments) {
        extra8429.comments = extra8429.comments.concat(token8673.leadingComments);
        extra8429.trailingComments = extra8429.trailingComments.concat(token8673.leadingComments);
        extra8429.leadingComments = extra8429.leadingComments.concat(token8673.leadingComments);
    }
    return token8673;
}
function peek8461() {
    lookaheadIndex8426 = streamIndex8424 + 1;
    if (lookaheadIndex8426 >= length8421) {
        lookahead8425 = {
            type: Token8403.EOF,
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [index8414, index8414]
        };
        return;
    }
    lookahead8425 = tokenStream8423[lookaheadIndex8426].token;
    index8414 = lookahead8425.range[0];
}
function lookahead28462() {
    var adv8674, pos8675, line8676, start8677, result8678;
    if (streamIndex8424 + 1 >= length8421 || streamIndex8424 + 2 >= length8421) {
        return {
            type: Token8403.EOF,
            lineNumber: lineNumber8415,
            lineStart: lineStart8416,
            range: [index8414, index8414]
        };
    }
    if ( // Scan for the next immediate token.
    lookahead8425 === null) {
        lookaheadIndex8426 = streamIndex8424 + 1;
        lookahead8425 = tokenStream8423[lookaheadIndex8426].token;
        index8414 = lookahead8425.range[0];
    }
    result8678 = tokenStream8423[lookaheadIndex8426 + 1].token;
    return result8678;
}
function markerCreate8463() {
    var sm_index8679 = lookahead8425 ? lookahead8425.sm_range[0] : 0;
    var sm_lineStart8680 = lookahead8425 ? lookahead8425.sm_lineStart : 0;
    var sm_lineNumber8681 = lookahead8425 ? lookahead8425.sm_lineNumber : 1;
    if (!extra8429.loc && !extra8429.range) {
        return undefined;
    }
    return {
        offset: sm_index8679,
        line: sm_lineNumber8681,
        col: sm_index8679 - sm_lineStart8680
    };
}
function processComment8464(node8682) {
    var lastChild8683,
        trailingComments8684,
        bottomRight8685 = extra8429.bottomRightStack,
        last8686 = bottomRight8685[bottomRight8685.length - 1];
    if (node8682.type === Syntax8406.Program) {
        if (node8682.body.length > 0) {
            return;
        }
    }
    if (extra8429.trailingComments.length > 0) {
        if (extra8429.trailingComments[0].range[0] >= node8682.range[1]) {
            trailingComments8684 = extra8429.trailingComments;
            extra8429.trailingComments = [];
        } else {
            extra8429.trailingComments.length = 0;
        }
    } else {
        if (last8686 && last8686.trailingComments && last8686.trailingComments[0].range[0] >= node8682.range[1]) {
            trailingComments8684 = last8686.trailingComments;
            delete last8686.trailingComments;
        }
    }
    if ( // Eating the stack.
    last8686) {
        while (last8686 && last8686.range[0] >= node8682.range[0]) {
            lastChild8683 = last8686;
            last8686 = bottomRight8685.pop();
        }
    }
    if (lastChild8683) {
        if (lastChild8683.leadingComments && lastChild8683.leadingComments[lastChild8683.leadingComments.length - 1].range[1] <= node8682.range[0]) {
            node8682.leadingComments = lastChild8683.leadingComments;
            delete lastChild8683.leadingComments;
        }
    } else if (extra8429.leadingComments.length > 0 && extra8429.leadingComments[extra8429.leadingComments.length - 1].range[1] <= node8682.range[0]) {
        node8682.leadingComments = extra8429.leadingComments;
        extra8429.leadingComments = [];
    }
    if (trailingComments8684) {
        node8682.trailingComments = trailingComments8684;
    }
    bottomRight8685.push(node8682);
}
function markerApply8465(marker8687, node8688) {
    if (extra8429.range) {
        node8688.range = [marker8687.offset, sm_index8420];
    }
    if (extra8429.loc) {
        node8688.loc = {
            start: {
                line: marker8687.line,
                column: marker8687.col
            },
            end: {
                line: sm_lineNumber8417,
                column: sm_index8420 - sm_lineStart8418
            }
        };
        node8688 = delegate8422.postProcess(node8688);
    }
    if (extra8429.attachComment) {
        processComment8464(node8688);
    }
    return node8688;
}
SyntaxTreeDelegate8410 = {
    name: "SyntaxTree",
    postProcess: function postProcess(node8689) {
        return node8689;
    },
    createArrayExpression: function createArrayExpression(elements8690) {
        return {
            type: Syntax8406.ArrayExpression,
            elements: elements8690
        };
    },
    createAssignmentExpression: function createAssignmentExpression(operator8691, left8692, right8693) {
        return {
            type: Syntax8406.AssignmentExpression,
            operator: operator8691,
            left: left8692,
            right: right8693
        };
    },
    createBinaryExpression: function createBinaryExpression(operator8694, left8695, right8696) {
        var type8697 = operator8694 === "||" || operator8694 === "&&" ? Syntax8406.LogicalExpression : Syntax8406.BinaryExpression;
        return {
            type: type8697,
            operator: operator8694,
            left: left8695,
            right: right8696
        };
    },
    createBlockStatement: function createBlockStatement(body8698) {
        return {
            type: Syntax8406.BlockStatement,
            body: body8698
        };
    },
    createBreakStatement: function createBreakStatement(label8699) {
        return {
            type: Syntax8406.BreakStatement,
            label: label8699
        };
    },
    createCallExpression: function createCallExpression(callee8700, args8701) {
        return {
            type: Syntax8406.CallExpression,
            callee: callee8700,
            arguments: args8701
        };
    },
    createCatchClause: function createCatchClause(param8702, body8703) {
        return {
            type: Syntax8406.CatchClause,
            param: param8702,
            body: body8703
        };
    },
    createConditionalExpression: function createConditionalExpression(test8704, consequent8705, alternate8706) {
        return {
            type: Syntax8406.ConditionalExpression,
            test: test8704,
            consequent: consequent8705,
            alternate: alternate8706
        };
    },
    createContinueStatement: function createContinueStatement(label8707) {
        return {
            type: Syntax8406.ContinueStatement,
            label: label8707
        };
    },
    createDebuggerStatement: function createDebuggerStatement() {
        return { type: Syntax8406.DebuggerStatement };
    },
    createDoWhileStatement: function createDoWhileStatement(body8708, test8709) {
        return {
            type: Syntax8406.DoWhileStatement,
            body: body8708,
            test: test8709
        };
    },
    createEmptyStatement: function createEmptyStatement() {
        return { type: Syntax8406.EmptyStatement };
    },
    createExpressionStatement: function createExpressionStatement(expression8710) {
        return {
            type: Syntax8406.ExpressionStatement,
            expression: expression8710
        };
    },
    createForStatement: function createForStatement(init8711, test8712, update8713, body8714) {
        return {
            type: Syntax8406.ForStatement,
            init: init8711,
            test: test8712,
            update: update8713,
            body: body8714
        };
    },
    createForInStatement: function createForInStatement(left8715, right8716, body8717) {
        return {
            type: Syntax8406.ForInStatement,
            left: left8715,
            right: right8716,
            body: body8717,
            each: false
        };
    },
    createForOfStatement: function createForOfStatement(left8718, right8719, body8720) {
        return {
            type: Syntax8406.ForOfStatement,
            left: left8718,
            right: right8719,
            body: body8720
        };
    },
    createFunctionDeclaration: function createFunctionDeclaration(id8721, params8722, defaults8723, body8724, rest8725, generator8726, expression8727) {
        return {
            type: Syntax8406.FunctionDeclaration,
            id: id8721,
            params: params8722,
            defaults: defaults8723,
            body: body8724,
            rest: rest8725,
            generator: generator8726,
            expression: expression8727
        };
    },
    createFunctionExpression: function createFunctionExpression(id8728, params8729, defaults8730, body8731, rest8732, generator8733, expression8734) {
        return {
            type: Syntax8406.FunctionExpression,
            id: id8728,
            params: params8729,
            defaults: defaults8730,
            body: body8731,
            rest: rest8732,
            generator: generator8733,
            expression: expression8734
        };
    },
    createIdentifier: function createIdentifier(name8735) {
        return {
            type: Syntax8406.Identifier,
            name: name8735
        };
    },
    createIfStatement: function createIfStatement(test8736, consequent8737, alternate8738) {
        return {
            type: Syntax8406.IfStatement,
            test: test8736,
            consequent: consequent8737,
            alternate: alternate8738
        };
    },
    createLabeledStatement: function createLabeledStatement(label8739, body8740) {
        return {
            type: Syntax8406.LabeledStatement,
            label: label8739,
            body: body8740
        };
    },
    createLiteral: function createLiteral(token8741) {
        var object8742 = {
            type: Syntax8406.Literal,
            value: token8741.value,
            raw: String(token8741.value)
        };
        if (token8741.regex) {
            object8742.regex = token8741.regex;
        }
        return object8742;
    },
    createMemberExpression: function createMemberExpression(accessor8743, object8744, property8745) {
        return {
            type: Syntax8406.MemberExpression,
            computed: accessor8743 === "[",
            object: object8744,
            property: property8745
        };
    },
    createNewExpression: function createNewExpression(callee8746, args8747) {
        return {
            type: Syntax8406.NewExpression,
            callee: callee8746,
            arguments: args8747
        };
    },
    createObjectExpression: function createObjectExpression(properties8748) {
        return {
            type: Syntax8406.ObjectExpression,
            properties: properties8748
        };
    },
    createPostfixExpression: function createPostfixExpression(operator8749, argument8750) {
        return {
            type: Syntax8406.UpdateExpression,
            operator: operator8749,
            argument: argument8750,
            prefix: false
        };
    },
    createProgram: function createProgram(body8751) {
        return {
            type: Syntax8406.Program,
            body: body8751
        };
    },
    createProperty: function createProperty(kind8752, key8753, value8754, method8755, shorthand8756, computed8757) {
        return {
            type: Syntax8406.Property,
            key: key8753,
            value: value8754,
            kind: kind8752,
            method: method8755,
            shorthand: shorthand8756,
            computed: computed8757
        };
    },
    createReturnStatement: function createReturnStatement(argument8758) {
        return {
            type: Syntax8406.ReturnStatement,
            argument: argument8758
        };
    },
    createSequenceExpression: function createSequenceExpression(expressions8759) {
        return {
            type: Syntax8406.SequenceExpression,
            expressions: expressions8759
        };
    },
    createSwitchCase: function createSwitchCase(test8760, consequent8761) {
        return {
            type: Syntax8406.SwitchCase,
            test: test8760,
            consequent: consequent8761
        };
    },
    createSwitchStatement: function createSwitchStatement(discriminant8762, cases8763) {
        return {
            type: Syntax8406.SwitchStatement,
            discriminant: discriminant8762,
            cases: cases8763
        };
    },
    createThisExpression: function createThisExpression() {
        return { type: Syntax8406.ThisExpression };
    },
    createThrowStatement: function createThrowStatement(argument8764) {
        return {
            type: Syntax8406.ThrowStatement,
            argument: argument8764
        };
    },
    createTryStatement: function createTryStatement(block8765, guardedHandlers8766, handlers8767, finalizer8768) {
        return {
            type: Syntax8406.TryStatement,
            block: block8765,
            guardedHandlers: guardedHandlers8766,
            handlers: handlers8767,
            finalizer: finalizer8768
        };
    },
    createUnaryExpression: function createUnaryExpression(operator8769, argument8770) {
        if (operator8769 === "++" || operator8769 === "--") {
            return {
                type: Syntax8406.UpdateExpression,
                operator: operator8769,
                argument: argument8770,
                prefix: true
            };
        }
        return {
            type: Syntax8406.UnaryExpression,
            operator: operator8769,
            argument: argument8770,
            prefix: true
        };
    },
    createVariableDeclaration: function createVariableDeclaration(declarations8771, kind8772) {
        return {
            type: Syntax8406.VariableDeclaration,
            declarations: declarations8771,
            kind: kind8772
        };
    },
    createVariableDeclarator: function createVariableDeclarator(id8773, init8774) {
        return {
            type: Syntax8406.VariableDeclarator,
            id: id8773,
            init: init8774
        };
    },
    createWhileStatement: function createWhileStatement(test8775, body8776) {
        return {
            type: Syntax8406.WhileStatement,
            test: test8775,
            body: body8776
        };
    },
    createWithStatement: function createWithStatement(object8777, body8778) {
        return {
            type: Syntax8406.WithStatement,
            object: object8777,
            body: body8778
        };
    },
    createTemplateElement: function createTemplateElement(value8779, tail8780) {
        return {
            type: Syntax8406.TemplateElement,
            value: value8779,
            tail: tail8780
        };
    },
    createTemplateLiteral: function createTemplateLiteral(quasis8781, expressions8782) {
        return {
            type: Syntax8406.TemplateLiteral,
            quasis: quasis8781,
            expressions: expressions8782
        };
    },
    createSpreadElement: function createSpreadElement(argument8783) {
        return {
            type: Syntax8406.SpreadElement,
            argument: argument8783
        };
    },
    createTaggedTemplateExpression: function createTaggedTemplateExpression(tag8784, quasi8785) {
        return {
            type: Syntax8406.TaggedTemplateExpression,
            tag: tag8784,
            quasi: quasi8785
        };
    },
    createArrowFunctionExpression: function createArrowFunctionExpression(params8786, defaults8787, body8788, rest8789, expression8790) {
        return {
            type: Syntax8406.ArrowFunctionExpression,
            id: null,
            params: params8786,
            defaults: defaults8787,
            body: body8788,
            rest: rest8789,
            generator: false,
            expression: expression8790
        };
    },
    createMethodDefinition: function createMethodDefinition(propertyType8791, kind8792, key8793, value8794) {
        return {
            type: Syntax8406.MethodDefinition,
            key: key8793,
            value: value8794,
            kind: kind8792,
            "static": propertyType8791 === ClassPropertyType8411["static"]
        };
    },
    createClassBody: function createClassBody(body8795) {
        return {
            type: Syntax8406.ClassBody,
            body: body8795
        };
    },
    createClassExpression: function createClassExpression(id8796, superClass8797, body8798) {
        return {
            type: Syntax8406.ClassExpression,
            id: id8796,
            superClass: superClass8797,
            body: body8798
        };
    },
    createClassDeclaration: function createClassDeclaration(id8799, superClass8800, body8801) {
        return {
            type: Syntax8406.ClassDeclaration,
            id: id8799,
            superClass: superClass8800,
            body: body8801
        };
    },
    createModuleSpecifier: function createModuleSpecifier(token8802) {
        return {
            type: Syntax8406.ModuleSpecifier,
            value: token8802.value,
            raw: source8412.slice(token8802.range[0], token8802.range[1])
        };
    },
    createExportSpecifier: function createExportSpecifier(id8803, name8804) {
        return {
            type: Syntax8406.ExportSpecifier,
            id: id8803,
            name: name8804
        };
    },
    createExportBatchSpecifier: function createExportBatchSpecifier() {
        return { type: Syntax8406.ExportBatchSpecifier };
    },
    createImportDefaultSpecifier: function createImportDefaultSpecifier(id8805) {
        return {
            type: Syntax8406.ImportDefaultSpecifier,
            id: id8805
        };
    },
    createImportNamespaceSpecifier: function createImportNamespaceSpecifier(id8806) {
        return {
            type: Syntax8406.ImportNamespaceSpecifier,
            id: id8806
        };
    },
    createExportDeclaration: function createExportDeclaration(isDefault8807, declaration8808, specifiers8809, source8810) {
        return {
            type: Syntax8406.ExportDeclaration,
            "default": !!isDefault8807,
            declaration: declaration8808,
            specifiers: specifiers8809,
            source: source8810
        };
    },
    createImportSpecifier: function createImportSpecifier(id8811, name8812) {
        return {
            type: Syntax8406.ImportSpecifier,
            id: id8811,
            name: name8812
        };
    },
    createImportDeclaration: function createImportDeclaration(specifiers8813, source8814) {
        return {
            type: Syntax8406.ImportDeclaration,
            specifiers: specifiers8813,
            source: source8814
        };
    },
    createYieldExpression: function createYieldExpression(argument8815, delegate8816) {
        return {
            type: Syntax8406.YieldExpression,
            argument: argument8815,
            delegate: delegate8816
        };
    },
    createComprehensionExpression: function createComprehensionExpression(filter8817, blocks8818, body8819) {
        return {
            type: Syntax8406.ComprehensionExpression,
            filter: filter8817,
            blocks: blocks8818,
            body: body8819
        };
    }
};
function peekLineTerminator8466() {
    return lookahead8425.lineNumber !== lineNumber8415;
}
function throwError8467(token8820, messageFormat8821) {
    var error8822,
        args8823 = Array.prototype.slice.call(arguments, 2),
        msg8824 = messageFormat8821.replace(/%(\d)/g, function (whole8828, index8829) {
        assert8430(index8829 < args8823.length, "Message reference must be in range");
        return args8823[index8829];
    });
    var startIndex8825 = streamIndex8424 > 3 ? streamIndex8424 - 3 : 0;
    var toks8826 = "",
        tailingMsg8827 = "";
    if (tokenStream8423) {
        toks8826 = tokenStream8423.slice(startIndex8825, streamIndex8424 + 3).map(function (stx8830) {
            return stx8830.token.value;
        }).join(" ");
        tailingMsg8827 = "\n[... " + toks8826 + " ...]";
    }
    if (typeof token8820.lineNumber === "number") {
        error8822 = new Error("Line " + token8820.lineNumber + ": " + msg8824 + tailingMsg8827);
        error8822.index = token8820.range[0];
        error8822.lineNumber = token8820.lineNumber;
        error8822.column = token8820.range[0] - lineStart8416 + 1;
    } else {
        error8822 = new Error("Line " + lineNumber8415 + ": " + msg8824 + tailingMsg8827);
        error8822.index = index8414;
        error8822.lineNumber = lineNumber8415;
        error8822.column = index8414 - lineStart8416 + 1;
    }
    error8822.description = msg8824;
    throw error8822;
}
function throwErrorTolerant8468() {
    try {
        throwError8467.apply(null, arguments);
    } catch (e8831) {
        if (extra8429.errors) {
            extra8429.errors.push(e8831);
        } else {
            throw e8831;
        }
    }
}
function throwUnexpected8469(token8832) {
    if (token8832.type === Token8403.EOF) {
        throwError8467(token8832, Messages8408.UnexpectedEOS);
    }
    if (token8832.type === Token8403.NumericLiteral) {
        throwError8467(token8832, Messages8408.UnexpectedNumber);
    }
    if (token8832.type === Token8403.StringLiteral) {
        throwError8467(token8832, Messages8408.UnexpectedString);
    }
    if (token8832.type === Token8403.Identifier) {
        throwError8467(token8832, Messages8408.UnexpectedIdentifier);
    }
    if (token8832.type === Token8403.Keyword) {
        if (isFutureReservedWord8439(token8832.value)) {} else if (strict8413 && isStrictModeReservedWord8440(token8832.value)) {
            throwErrorTolerant8468(token8832, Messages8408.StrictReservedWord);
            return;
        }
        throwError8467(token8832, Messages8408.UnexpectedToken, token8832.value);
    }
    if (token8832.type === Token8403.Template) {
        throwError8467(token8832, Messages8408.UnexpectedTemplate, token8832.value.raw);
    }
    // BooleanLiteral, NullLiteral, or Punctuator.
    throwError8467(token8832, Messages8408.UnexpectedToken, token8832.value);
}
function expect8470(value8833) {
    var token8834 = lex8460();
    if (token8834.type !== Token8403.Punctuator || token8834.value !== value8833) {
        throwUnexpected8469(token8834);
    }
}
function expectKeyword8471(keyword8835) {
    var token8836 = lex8460();
    if (token8836.type !== Token8403.Keyword || token8836.value !== keyword8835) {
        throwUnexpected8469(token8836);
    }
}
function match8472(value8837) {
    return lookahead8425.type === Token8403.Punctuator && lookahead8425.value === value8837;
}
function matchKeyword8473(keyword8838) {
    return lookahead8425.type === Token8403.Keyword && lookahead8425.value === keyword8838;
}
function matchContextualKeyword8474(keyword8839) {
    return lookahead8425.type === Token8403.Identifier && lookahead8425.value === keyword8839;
}
function matchAssign8475() {
    var op8840;
    if (lookahead8425.type !== Token8403.Punctuator) {
        return false;
    }
    op8840 = lookahead8425.value;
    return op8840 === "=" || op8840 === "*=" || op8840 === "/=" || op8840 === "%=" || op8840 === "+=" || op8840 === "-=" || op8840 === "<<=" || op8840 === ">>=" || op8840 === ">>>=" || op8840 === "&=" || op8840 === "^=" || op8840 === "|=";
}
function consumeSemicolon8476() {
    var line8841, ch8842;
    ch8842 = lookahead8425.value ? String(lookahead8425.value).charCodeAt(0) : -1;
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    ch8842 === 59) {
        lex8460();
        return;
    }
    if (lookahead8425.lineNumber !== lineNumber8415) {
        return;
    }
    if (match8472(";")) {
        lex8460();
        return;
    }
    if (lookahead8425.type !== Token8403.EOF && !match8472("}")) {
        throwUnexpected8469(lookahead8425);
    }
}
function isLeftHandSide8477(expr8843) {
    return expr8843.type === Syntax8406.Identifier || expr8843.type === Syntax8406.MemberExpression;
}
function isAssignableLeftHandSide8478(expr8844) {
    return isLeftHandSide8477(expr8844) || expr8844.type === Syntax8406.ObjectPattern || expr8844.type === Syntax8406.ArrayPattern;
}
function parseArrayInitialiser8479() {
    var elements8845 = [],
        blocks8846 = [],
        filter8847 = null,
        tmp8848,
        possiblecomprehension8849 = true,
        body8850,
        marker8851 = markerCreate8463();
    expect8470("[");
    while (!match8472("]")) {
        if (lookahead8425.value === "for" && lookahead8425.type === Token8403.Keyword) {
            if (!possiblecomprehension8849) {
                throwError8467({}, Messages8408.ComprehensionError);
            }
            matchKeyword8473("for");
            tmp8848 = parseForStatement8530({ ignoreBody: true });
            tmp8848.of = tmp8848.type === Syntax8406.ForOfStatement;
            tmp8848.type = Syntax8406.ComprehensionBlock;
            if (tmp8848.left.kind) {
                // can't be let or const
                throwError8467({}, Messages8408.ComprehensionError);
            }
            blocks8846.push(tmp8848);
        } else if (lookahead8425.value === "if" && lookahead8425.type === Token8403.Keyword) {
            if (!possiblecomprehension8849) {
                throwError8467({}, Messages8408.ComprehensionError);
            }
            expectKeyword8471("if");
            expect8470("(");
            filter8847 = parseExpression8507();
            expect8470(")");
        } else if (lookahead8425.value === "," && lookahead8425.type === Token8403.Punctuator) {
            possiblecomprehension8849 = false;
            // no longer allowed.
            lex8460();
            elements8845.push(null);
        } else {
            tmp8848 = parseSpreadOrAssignmentExpression8490();
            elements8845.push(tmp8848);
            if (tmp8848 && tmp8848.type === Syntax8406.SpreadElement) {
                if (!match8472("]")) {
                    throwError8467({}, Messages8408.ElementAfterSpreadElement);
                }
            } else if (!(match8472("]") || matchKeyword8473("for") || matchKeyword8473("if"))) {
                expect8470(",");
                // this lexes.
                possiblecomprehension8849 = false;
            }
        }
    }
    expect8470("]");
    if (filter8847 && !blocks8846.length) {
        throwError8467({}, Messages8408.ComprehensionRequiresBlock);
    }
    if (blocks8846.length) {
        if (elements8845.length !== 1) {
            throwError8467({}, Messages8408.ComprehensionError);
        }
        return markerApply8465(marker8851, delegate8422.createComprehensionExpression(filter8847, blocks8846, elements8845[0]));
    }
    return markerApply8465(marker8851, delegate8422.createArrayExpression(elements8845));
}
function parsePropertyFunction8480(options8852) {
    var previousStrict8853,
        previousYieldAllowed8854,
        params8855,
        defaults8856,
        body8857,
        marker8858 = markerCreate8463();
    previousStrict8853 = strict8413;
    previousYieldAllowed8854 = state8427.yieldAllowed;
    state8427.yieldAllowed = options8852.generator;
    params8855 = options8852.params || [];
    defaults8856 = options8852.defaults || [];
    body8857 = parseConciseBody8542();
    if (options8852.name && strict8413 && isRestrictedWord8441(params8855[0].name)) {
        throwErrorTolerant8468(options8852.name, Messages8408.StrictParamName);
    }
    strict8413 = previousStrict8853;
    state8427.yieldAllowed = previousYieldAllowed8854;
    return markerApply8465(marker8858, delegate8422.createFunctionExpression(null, params8855, defaults8856, body8857, options8852.rest || null, options8852.generator, body8857.type !== Syntax8406.BlockStatement));
}
function parsePropertyMethodFunction8481(options8859) {
    var previousStrict8860, tmp8861, method8862;
    previousStrict8860 = strict8413;
    strict8413 = true;
    tmp8861 = parseParams8546();
    if (tmp8861.stricted) {
        throwErrorTolerant8468(tmp8861.stricted, tmp8861.message);
    }
    method8862 = parsePropertyFunction8480({
        params: tmp8861.params,
        defaults: tmp8861.defaults,
        rest: tmp8861.rest,
        generator: options8859.generator
    });
    strict8413 = previousStrict8860;
    return method8862;
}
function parseObjectPropertyKey8482() {
    var marker8863 = markerCreate8463(),
        token8864 = lex8460(),
        propertyKey8865,
        result8866;
    if ( // Note: This function is called only from parseObjectProperty(), where
    // EOF and Punctuator tokens are already filtered out.
    token8864.type === Token8403.StringLiteral || token8864.type === Token8403.NumericLiteral) {
        if (strict8413 && token8864.octal) {
            throwErrorTolerant8468(token8864, Messages8408.StrictOctalLiteral);
        }
        return markerApply8465(marker8863, delegate8422.createLiteral(token8864));
    }
    if (token8864.type === Token8403.Punctuator && token8864.value === "[") {
        // For computed properties we should skip the [ and ], and
        // capture in marker only the assignment expression itself.
        marker8863 = markerCreate8463();
        propertyKey8865 = parseAssignmentExpression8506();
        result8866 = markerApply8465(marker8863, propertyKey8865);
        expect8470("]");
        return result8866;
    }
    return markerApply8465(marker8863, delegate8422.createIdentifier(token8864.value));
}
function parseObjectProperty8483() {
    var token8867,
        key8868,
        id8869,
        value8870,
        param8871,
        expr8872,
        computed8873,
        marker8874 = markerCreate8463();
    token8867 = lookahead8425;
    computed8873 = token8867.value === "[" && token8867.type === Token8403.Punctuator;
    if (token8867.type === Token8403.Identifier || computed8873) {
        id8869 = parseObjectPropertyKey8482();
        if ( // Property Assignment: Getter and Setter.
        token8867.value === "get" && !(match8472(":") || match8472("("))) {
            computed8873 = lookahead8425.value === "[";
            key8868 = parseObjectPropertyKey8482();
            expect8470("(");
            expect8470(")");
            return markerApply8465(marker8874, delegate8422.createProperty("get", key8868, parsePropertyFunction8480({ generator: false }), false, false, computed8873));
        }
        if (token8867.value === "set" && !(match8472(":") || match8472("("))) {
            computed8873 = lookahead8425.value === "[";
            key8868 = parseObjectPropertyKey8482();
            expect8470("(");
            token8867 = lookahead8425;
            param8871 = [parseVariableIdentifier8510()];
            expect8470(")");
            return markerApply8465(marker8874, delegate8422.createProperty("set", key8868, parsePropertyFunction8480({
                params: param8871,
                generator: false,
                name: token8867
            }), false, false, computed8873));
        }
        if (match8472(":")) {
            lex8460();
            return markerApply8465(marker8874, delegate8422.createProperty("init", id8869, parseAssignmentExpression8506(), false, false, computed8873));
        }
        if (match8472("(")) {
            return markerApply8465(marker8874, delegate8422.createProperty("init", id8869, parsePropertyMethodFunction8481({ generator: false }), true, false, computed8873));
        }
        if (computed8873) {
            // Computed properties can only be used with full notation.
            throwUnexpected8469(lookahead8425);
        }
        return markerApply8465(marker8874, delegate8422.createProperty("init", id8869, id8869, false, true, false));
    }
    if (token8867.type === Token8403.EOF || token8867.type === Token8403.Punctuator) {
        if (!match8472("*")) {
            throwUnexpected8469(token8867);
        }
        lex8460();
        computed8873 = lookahead8425.type === Token8403.Punctuator && lookahead8425.value === "[";
        id8869 = parseObjectPropertyKey8482();
        if (!match8472("(")) {
            throwUnexpected8469(lex8460());
        }
        return markerApply8465(marker8874, delegate8422.createProperty("init", id8869, parsePropertyMethodFunction8481({ generator: true }), true, false, computed8873));
    }
    key8868 = parseObjectPropertyKey8482();
    if (match8472(":")) {
        lex8460();
        return markerApply8465(marker8874, delegate8422.createProperty("init", key8868, parseAssignmentExpression8506(), false, false, false));
    }
    if (match8472("(")) {
        return markerApply8465(marker8874, delegate8422.createProperty("init", key8868, parsePropertyMethodFunction8481({ generator: false }), true, false, false));
    }
    throwUnexpected8469(lex8460());
}
function parseObjectInitialiser8484() {
    var properties8875 = [],
        property8876,
        name8877,
        key8878,
        kind8879,
        map8880 = {},
        toString8881 = String,
        marker8882 = markerCreate8463();
    expect8470("{");
    while (!match8472("}")) {
        property8876 = parseObjectProperty8483();
        if (property8876.key.type === Syntax8406.Identifier) {
            name8877 = property8876.key.name;
        } else {
            name8877 = toString8881(property8876.key.value);
        }
        kind8879 = property8876.kind === "init" ? PropertyKind8407.Data : property8876.kind === "get" ? PropertyKind8407.Get : PropertyKind8407.Set;
        key8878 = "$" + name8877;
        if (Object.prototype.hasOwnProperty.call(map8880, key8878)) {
            if (map8880[key8878] === PropertyKind8407.Data) {
                if (strict8413 && kind8879 === PropertyKind8407.Data) {
                    throwErrorTolerant8468({}, Messages8408.StrictDuplicateProperty);
                } else if (kind8879 !== PropertyKind8407.Data) {
                    throwErrorTolerant8468({}, Messages8408.AccessorDataProperty);
                }
            } else {
                if (kind8879 === PropertyKind8407.Data) {
                    throwErrorTolerant8468({}, Messages8408.AccessorDataProperty);
                } else if (map8880[key8878] & kind8879) {
                    throwErrorTolerant8468({}, Messages8408.AccessorGetSet);
                }
            }
            map8880[key8878] |= kind8879;
        } else {
            map8880[key8878] = kind8879;
        }
        properties8875.push(property8876);
        if (!match8472("}")) {
            expect8470(",");
        }
    }
    expect8470("}");
    return markerApply8465(marker8882, delegate8422.createObjectExpression(properties8875));
}
function parseTemplateElement8485(option8883) {
    var marker8884 = markerCreate8463(),
        token8885 = lex8460();
    if (strict8413 && token8885.octal) {
        throwError8467(token8885, Messages8408.StrictOctalLiteral);
    }
    return markerApply8465(marker8884, delegate8422.createTemplateElement({
        raw: token8885.value.raw,
        cooked: token8885.value.cooked
    }, token8885.tail));
}
function parseTemplateLiteral8486() {
    var quasi8886,
        quasis8887,
        expressions8888,
        marker8889 = markerCreate8463();
    quasi8886 = parseTemplateElement8485({ head: true });
    quasis8887 = [quasi8886];
    expressions8888 = [];
    while (!quasi8886.tail) {
        expressions8888.push(parseExpression8507());
        quasi8886 = parseTemplateElement8485({ head: false });
        quasis8887.push(quasi8886);
    }
    return markerApply8465(marker8889, delegate8422.createTemplateLiteral(quasis8887, expressions8888));
}
function parseGroupExpression8487() {
    var expr8890;
    expect8470("(");
    ++state8427.parenthesizedCount;
    expr8890 = parseExpression8507();
    expect8470(")");
    return expr8890;
}
function parsePrimaryExpression8488() {
    var type8891, token8892, resolvedIdent8893, marker8894, expr8895;
    token8892 = lookahead8425;
    type8891 = lookahead8425.type;
    if (type8891 === Token8403.Identifier) {
        marker8894 = markerCreate8463();
        resolvedIdent8893 = expander8402.resolve(tokenStream8423[lookaheadIndex8426], phase8428);
        lex8460();
        return markerApply8465(marker8894, delegate8422.createIdentifier(resolvedIdent8893));
    }
    if (type8891 === Token8403.StringLiteral || type8891 === Token8403.NumericLiteral) {
        if (strict8413 && lookahead8425.octal) {
            throwErrorTolerant8468(lookahead8425, Messages8408.StrictOctalLiteral);
        }
        marker8894 = markerCreate8463();
        return markerApply8465(marker8894, delegate8422.createLiteral(lex8460()));
    }
    if (type8891 === Token8403.Keyword) {
        if (matchKeyword8473("this")) {
            marker8894 = markerCreate8463();
            lex8460();
            return markerApply8465(marker8894, delegate8422.createThisExpression());
        }
        if (matchKeyword8473("function")) {
            return parseFunctionExpression8548();
        }
        if (matchKeyword8473("class")) {
            return parseClassExpression8553();
        }
        if (matchKeyword8473("super")) {
            marker8894 = markerCreate8463();
            lex8460();
            return markerApply8465(marker8894, delegate8422.createIdentifier("super"));
        }
    }
    if (type8891 === Token8403.BooleanLiteral) {
        marker8894 = markerCreate8463();
        token8892 = lex8460();
        if (typeof token8892.value !== "boolean") {
            assert8430(token8892.value === "true" || token8892.value === "false", "exporting either true or false as a string not: " + token8892.value);
            token8892.value = token8892.value === "true";
        }
        return markerApply8465(marker8894, delegate8422.createLiteral(token8892));
    }
    if (type8891 === Token8403.NullLiteral) {
        marker8894 = markerCreate8463();
        token8892 = lex8460();
        token8892.value = null;
        return markerApply8465(marker8894, delegate8422.createLiteral(token8892));
    }
    if (match8472("[")) {
        return parseArrayInitialiser8479();
    }
    if (match8472("{")) {
        return parseObjectInitialiser8484();
    }
    if (match8472("(")) {
        return parseGroupExpression8487();
    }
    if (lookahead8425.type === Token8403.RegularExpression) {
        marker8894 = markerCreate8463();
        return markerApply8465(marker8894, delegate8422.createLiteral(lex8460()));
    }
    if (type8891 === Token8403.Template) {
        return parseTemplateLiteral8486();
    }
    throwUnexpected8469(lex8460());
}
function parseArguments8489() {
    var args8896 = [],
        arg8897;
    expect8470("(");
    if (!match8472(")")) {
        while (streamIndex8424 < length8421) {
            arg8897 = parseSpreadOrAssignmentExpression8490();
            args8896.push(arg8897);
            if (match8472(")")) {
                break;
            } else if (arg8897.type === Syntax8406.SpreadElement) {
                throwError8467({}, Messages8408.ElementAfterSpreadElement);
            }
            expect8470(",");
        }
    }
    expect8470(")");
    return args8896;
}
function parseSpreadOrAssignmentExpression8490() {
    if (match8472("...")) {
        var marker8898 = markerCreate8463();
        lex8460();
        return markerApply8465(marker8898, delegate8422.createSpreadElement(parseAssignmentExpression8506()));
    }
    return parseAssignmentExpression8506();
}
function parseNonComputedProperty8491(toResolve8899) {
    var marker8900 = markerCreate8463(),
        resolvedIdent8901,
        token8902;
    if (toResolve8899) {
        resolvedIdent8901 = expander8402.resolve(tokenStream8423[lookaheadIndex8426], phase8428);
    }
    token8902 = lex8460();
    resolvedIdent8901 = toResolve8899 ? resolvedIdent8901 : token8902.value;
    if (!isIdentifierName8457(token8902)) {
        throwUnexpected8469(token8902);
    }
    return markerApply8465(marker8900, delegate8422.createIdentifier(resolvedIdent8901));
}
function parseNonComputedMember8492() {
    expect8470(".");
    return parseNonComputedProperty8491();
}
function parseComputedMember8493() {
    var expr8903;
    expect8470("[");
    expr8903 = parseExpression8507();
    expect8470("]");
    return expr8903;
}
function parseNewExpression8494() {
    var callee8904,
        args8905,
        marker8906 = markerCreate8463();
    expectKeyword8471("new");
    callee8904 = parseLeftHandSideExpression8496();
    args8905 = match8472("(") ? parseArguments8489() : [];
    return markerApply8465(marker8906, delegate8422.createNewExpression(callee8904, args8905));
}
function parseLeftHandSideExpressionAllowCall8495() {
    var expr8907,
        args8908,
        marker8909 = markerCreate8463();
    expr8907 = matchKeyword8473("new") ? parseNewExpression8494() : parsePrimaryExpression8488();
    while (match8472(".") || match8472("[") || match8472("(") || lookahead8425.type === Token8403.Template) {
        if (match8472("(")) {
            args8908 = parseArguments8489();
            expr8907 = markerApply8465(marker8909, delegate8422.createCallExpression(expr8907, args8908));
        } else if (match8472("[")) {
            expr8907 = markerApply8465(marker8909, delegate8422.createMemberExpression("[", expr8907, parseComputedMember8493()));
        } else if (match8472(".")) {
            expr8907 = markerApply8465(marker8909, delegate8422.createMemberExpression(".", expr8907, parseNonComputedMember8492()));
        } else {
            expr8907 = markerApply8465(marker8909, delegate8422.createTaggedTemplateExpression(expr8907, parseTemplateLiteral8486()));
        }
    }
    return expr8907;
}
function parseLeftHandSideExpression8496() {
    var expr8910,
        marker8911 = markerCreate8463();
    expr8910 = matchKeyword8473("new") ? parseNewExpression8494() : parsePrimaryExpression8488();
    while (match8472(".") || match8472("[") || lookahead8425.type === Token8403.Template) {
        if (match8472("[")) {
            expr8910 = markerApply8465(marker8911, delegate8422.createMemberExpression("[", expr8910, parseComputedMember8493()));
        } else if (match8472(".")) {
            expr8910 = markerApply8465(marker8911, delegate8422.createMemberExpression(".", expr8910, parseNonComputedMember8492()));
        } else {
            expr8910 = markerApply8465(marker8911, delegate8422.createTaggedTemplateExpression(expr8910, parseTemplateLiteral8486()));
        }
    }
    return expr8910;
}
function parsePostfixExpression8497() {
    var marker8912 = markerCreate8463(),
        expr8913 = parseLeftHandSideExpressionAllowCall8495(),
        token8914;
    if (lookahead8425.type !== Token8403.Punctuator) {
        return expr8913;
    }
    if ((match8472("++") || match8472("--")) && !peekLineTerminator8466()) {
        if ( // 11.3.1, 11.3.2
        strict8413 && expr8913.type === Syntax8406.Identifier && isRestrictedWord8441(expr8913.name)) {
            throwErrorTolerant8468({}, Messages8408.StrictLHSPostfix);
        }
        if (!isLeftHandSide8477(expr8913)) {
            throwError8467({}, Messages8408.InvalidLHSInAssignment);
        }
        token8914 = lex8460();
        expr8913 = markerApply8465(marker8912, delegate8422.createPostfixExpression(token8914.value, expr8913));
    }
    return expr8913;
}
function parseUnaryExpression8498() {
    var marker8915, token8916, expr8917;
    if (lookahead8425.type !== Token8403.Punctuator && lookahead8425.type !== Token8403.Keyword) {
        return parsePostfixExpression8497();
    }
    if (match8472("++") || match8472("--")) {
        marker8915 = markerCreate8463();
        token8916 = lex8460();
        expr8917 = parseUnaryExpression8498();
        if ( // 11.4.4, 11.4.5
        strict8413 && expr8917.type === Syntax8406.Identifier && isRestrictedWord8441(expr8917.name)) {
            throwErrorTolerant8468({}, Messages8408.StrictLHSPrefix);
        }
        if (!isLeftHandSide8477(expr8917)) {
            throwError8467({}, Messages8408.InvalidLHSInAssignment);
        }
        return markerApply8465(marker8915, delegate8422.createUnaryExpression(token8916.value, expr8917));
    }
    if (match8472("+") || match8472("-") || match8472("~") || match8472("!")) {
        marker8915 = markerCreate8463();
        token8916 = lex8460();
        expr8917 = parseUnaryExpression8498();
        return markerApply8465(marker8915, delegate8422.createUnaryExpression(token8916.value, expr8917));
    }
    if (matchKeyword8473("delete") || matchKeyword8473("void") || matchKeyword8473("typeof")) {
        marker8915 = markerCreate8463();
        token8916 = lex8460();
        expr8917 = parseUnaryExpression8498();
        expr8917 = markerApply8465(marker8915, delegate8422.createUnaryExpression(token8916.value, expr8917));
        if (strict8413 && expr8917.operator === "delete" && expr8917.argument.type === Syntax8406.Identifier) {
            throwErrorTolerant8468({}, Messages8408.StrictDelete);
        }
        return expr8917;
    }
    return parsePostfixExpression8497();
}
function binaryPrecedence8499(token8918, allowIn8919) {
    var prec8920 = 0;
    if (token8918.type !== Token8403.Punctuator && token8918.type !== Token8403.Keyword) {
        return 0;
    }
    switch (token8918.value) {
        case "||":
            prec8920 = 1;
            break;
        case "&&":
            prec8920 = 2;
            break;
        case "|":
            prec8920 = 3;
            break;
        case "^":
            prec8920 = 4;
            break;
        case "&":
            prec8920 = 5;
            break;
        case "==":
        case "!=":
        case "===":
        case "!==":
            prec8920 = 6;
            break;
        case "<":
        case ">":
        case "<=":
        case ">=":
        case "instanceof":
            prec8920 = 7;
            break;
        case "in":
            prec8920 = allowIn8919 ? 7 : 0;
            break;
        case "<<":
        case ">>":
        case ">>>":
            prec8920 = 8;
            break;
        case "+":
        case "-":
            prec8920 = 9;
            break;
        case "*":
        case "/":
        case "%":
            prec8920 = 11;
            break;
        default:
            break;
    }
    return prec8920;
}
function parseBinaryExpression8500() {
    var expr8921, token8922, prec8923, previousAllowIn8924, stack8925, right8926, operator8927, left8928, i8929, marker8930, markers8931;
    previousAllowIn8924 = state8427.allowIn;
    state8427.allowIn = true;
    marker8930 = markerCreate8463();
    left8928 = parseUnaryExpression8498();
    token8922 = lookahead8425;
    prec8923 = binaryPrecedence8499(token8922, previousAllowIn8924);
    if (prec8923 === 0) {
        return left8928;
    }
    token8922.prec = prec8923;
    lex8460();
    markers8931 = [marker8930, markerCreate8463()];
    right8926 = parseUnaryExpression8498();
    stack8925 = [left8928, token8922, right8926];
    while ((prec8923 = binaryPrecedence8499(lookahead8425, previousAllowIn8924)) > 0) {
        while ( // Reduce: make a binary expression from the three topmost entries.
        stack8925.length > 2 && prec8923 <= stack8925[stack8925.length - 2].prec) {
            right8926 = stack8925.pop();
            operator8927 = stack8925.pop().value;
            left8928 = stack8925.pop();
            expr8921 = delegate8422.createBinaryExpression(operator8927, left8928, right8926);
            markers8931.pop();
            marker8930 = markers8931.pop();
            markerApply8465(marker8930, expr8921);
            stack8925.push(expr8921);
            markers8931.push(marker8930);
        }
        // Shift.
        token8922 = lex8460();
        token8922.prec = prec8923;
        stack8925.push(token8922);
        markers8931.push(markerCreate8463());
        expr8921 = parseUnaryExpression8498();
        stack8925.push(expr8921);
    }
    state8427.allowIn = previousAllowIn8924;
    // Final reduce to clean-up the stack.
    i8929 = stack8925.length - 1;
    expr8921 = stack8925[i8929];
    markers8931.pop();
    while (i8929 > 1) {
        expr8921 = delegate8422.createBinaryExpression(stack8925[i8929 - 1].value, stack8925[i8929 - 2], expr8921);
        i8929 -= 2;
        marker8930 = markers8931.pop();
        markerApply8465(marker8930, expr8921);
    }
    return expr8921;
}
function parseConditionalExpression8501() {
    var expr8932,
        previousAllowIn8933,
        consequent8934,
        alternate8935,
        marker8936 = markerCreate8463();
    expr8932 = parseBinaryExpression8500();
    if (match8472("?")) {
        lex8460();
        previousAllowIn8933 = state8427.allowIn;
        state8427.allowIn = true;
        consequent8934 = parseAssignmentExpression8506();
        state8427.allowIn = previousAllowIn8933;
        expect8470(":");
        alternate8935 = parseAssignmentExpression8506();
        expr8932 = markerApply8465(marker8936, delegate8422.createConditionalExpression(expr8932, consequent8934, alternate8935));
    }
    return expr8932;
}
function reinterpretAsAssignmentBindingPattern8502(expr8937) {
    var i8938, len8939, property8940, element8941;
    if (expr8937.type === Syntax8406.ObjectExpression) {
        expr8937.type = Syntax8406.ObjectPattern;
        for (i8938 = 0, len8939 = expr8937.properties.length; i8938 < len8939; i8938 += 1) {
            property8940 = expr8937.properties[i8938];
            if (property8940.kind !== "init") {
                throwError8467({}, Messages8408.InvalidLHSInAssignment);
            }
            reinterpretAsAssignmentBindingPattern8502(property8940.value);
        }
    } else if (expr8937.type === Syntax8406.ArrayExpression) {
        expr8937.type = Syntax8406.ArrayPattern;
        for (i8938 = 0, len8939 = expr8937.elements.length; i8938 < len8939; i8938 += 1) {
            element8941 = expr8937.elements[i8938];
            if (element8941) {
                reinterpretAsAssignmentBindingPattern8502(element8941);
            }
        }
    } else if (expr8937.type === Syntax8406.Identifier) {
        if (isRestrictedWord8441(expr8937.name)) {
            throwError8467({}, Messages8408.InvalidLHSInAssignment);
        }
    } else if (expr8937.type === Syntax8406.SpreadElement) {
        reinterpretAsAssignmentBindingPattern8502(expr8937.argument);
        if (expr8937.argument.type === Syntax8406.ObjectPattern) {
            throwError8467({}, Messages8408.ObjectPatternAsSpread);
        }
    } else {
        if (expr8937.type !== Syntax8406.MemberExpression && expr8937.type !== Syntax8406.CallExpression && expr8937.type !== Syntax8406.NewExpression) {
            throwError8467({}, Messages8408.InvalidLHSInAssignment);
        }
    }
}
function reinterpretAsDestructuredParameter8503(options8942, expr8943) {
    var i8944, len8945, property8946, element8947;
    if (expr8943.type === Syntax8406.ObjectExpression) {
        expr8943.type = Syntax8406.ObjectPattern;
        for (i8944 = 0, len8945 = expr8943.properties.length; i8944 < len8945; i8944 += 1) {
            property8946 = expr8943.properties[i8944];
            if (property8946.kind !== "init") {
                throwError8467({}, Messages8408.InvalidLHSInFormalsList);
            }
            reinterpretAsDestructuredParameter8503(options8942, property8946.value);
        }
    } else if (expr8943.type === Syntax8406.ArrayExpression) {
        expr8943.type = Syntax8406.ArrayPattern;
        for (i8944 = 0, len8945 = expr8943.elements.length; i8944 < len8945; i8944 += 1) {
            element8947 = expr8943.elements[i8944];
            if (element8947) {
                reinterpretAsDestructuredParameter8503(options8942, element8947);
            }
        }
    } else if (expr8943.type === Syntax8406.Identifier) {
        validateParam8544(options8942, expr8943, expr8943.name);
    } else {
        if (expr8943.type !== Syntax8406.MemberExpression) {
            throwError8467({}, Messages8408.InvalidLHSInFormalsList);
        }
    }
}
function reinterpretAsCoverFormalsList8504(expressions8948) {
    var i8949, len8950, param8951, params8952, defaults8953, defaultCount8954, options8955, rest8956;
    params8952 = [];
    defaults8953 = [];
    defaultCount8954 = 0;
    rest8956 = null;
    options8955 = { paramSet: {} };
    for (i8949 = 0, len8950 = expressions8948.length; i8949 < len8950; i8949 += 1) {
        param8951 = expressions8948[i8949];
        if (param8951.type === Syntax8406.Identifier) {
            params8952.push(param8951);
            defaults8953.push(null);
            validateParam8544(options8955, param8951, param8951.name);
        } else if (param8951.type === Syntax8406.ObjectExpression || param8951.type === Syntax8406.ArrayExpression) {
            reinterpretAsDestructuredParameter8503(options8955, param8951);
            params8952.push(param8951);
            defaults8953.push(null);
        } else if (param8951.type === Syntax8406.SpreadElement) {
            assert8430(i8949 === len8950 - 1, "It is guaranteed that SpreadElement is last element by parseExpression");
            reinterpretAsDestructuredParameter8503(options8955, param8951.argument);
            rest8956 = param8951.argument;
        } else if (param8951.type === Syntax8406.AssignmentExpression) {
            params8952.push(param8951.left);
            defaults8953.push(param8951.right);
            ++defaultCount8954;
            validateParam8544(options8955, param8951.left, param8951.left.name);
        } else {
            return null;
        }
    }
    if (options8955.message === Messages8408.StrictParamDupe) {
        throwError8467(strict8413 ? options8955.stricted : options8955.firstRestricted, options8955.message);
    }
    if (defaultCount8954 === 0) {
        defaults8953 = [];
    }
    return {
        params: params8952,
        defaults: defaults8953,
        rest: rest8956,
        stricted: options8955.stricted,
        firstRestricted: options8955.firstRestricted,
        message: options8955.message
    };
}
function parseArrowFunctionExpression8505(options8957, marker8958) {
    var previousStrict8959, previousYieldAllowed8960, body8961;
    expect8470("=>");
    previousStrict8959 = strict8413;
    previousYieldAllowed8960 = state8427.yieldAllowed;
    state8427.yieldAllowed = false;
    body8961 = parseConciseBody8542();
    if (strict8413 && options8957.firstRestricted) {
        throwError8467(options8957.firstRestricted, options8957.message);
    }
    if (strict8413 && options8957.stricted) {
        throwErrorTolerant8468(options8957.stricted, options8957.message);
    }
    strict8413 = previousStrict8959;
    state8427.yieldAllowed = previousYieldAllowed8960;
    return markerApply8465(marker8958, delegate8422.createArrowFunctionExpression(options8957.params, options8957.defaults, body8961, options8957.rest, body8961.type !== Syntax8406.BlockStatement));
}
function parseAssignmentExpression8506() {
    var marker8962, expr8963, token8964, params8965, oldParenthesizedCount8966;
    if ( // Note that 'yield' is treated as a keyword in strict mode, but a
    // contextual keyword (identifier) in non-strict mode, so we need
    // to use matchKeyword and matchContextualKeyword appropriately.
    state8427.yieldAllowed && matchContextualKeyword8474("yield") || strict8413 && matchKeyword8473("yield")) {
        return parseYieldExpression8549();
    }
    oldParenthesizedCount8966 = state8427.parenthesizedCount;
    marker8962 = markerCreate8463();
    if (match8472("(")) {
        token8964 = lookahead28462();
        if (token8964.type === Token8403.Punctuator && token8964.value === ")" || token8964.value === "...") {
            params8965 = parseParams8546();
            if (!match8472("=>")) {
                throwUnexpected8469(lex8460());
            }
            return parseArrowFunctionExpression8505(params8965, marker8962);
        }
    }
    token8964 = lookahead8425;
    expr8963 = parseConditionalExpression8501();
    if (match8472("=>") && (state8427.parenthesizedCount === oldParenthesizedCount8966 || state8427.parenthesizedCount === oldParenthesizedCount8966 + 1)) {
        if (expr8963.type === Syntax8406.Identifier) {
            params8965 = reinterpretAsCoverFormalsList8504([expr8963]);
        } else if (expr8963.type === Syntax8406.SequenceExpression) {
            params8965 = reinterpretAsCoverFormalsList8504(expr8963.expressions);
        }
        if (params8965) {
            return parseArrowFunctionExpression8505(params8965, marker8962);
        }
    }
    if (matchAssign8475()) {
        if ( // 11.13.1
        strict8413 && expr8963.type === Syntax8406.Identifier && isRestrictedWord8441(expr8963.name)) {
            throwErrorTolerant8468(token8964, Messages8408.StrictLHSAssignment);
        }
        if ( // ES.next draf 11.13 Runtime Semantics step 1
        match8472("=") && (expr8963.type === Syntax8406.ObjectExpression || expr8963.type === Syntax8406.ArrayExpression)) {
            reinterpretAsAssignmentBindingPattern8502(expr8963);
        } else if (!isLeftHandSide8477(expr8963)) {
            throwError8467({}, Messages8408.InvalidLHSInAssignment);
        }
        expr8963 = markerApply8465(marker8962, delegate8422.createAssignmentExpression(lex8460().value, expr8963, parseAssignmentExpression8506()));
    }
    return expr8963;
}
function parseExpression8507() {
    var marker8967, expr8968, expressions8969, sequence8970, coverFormalsList8971, spreadFound8972, oldParenthesizedCount8973;
    oldParenthesizedCount8973 = state8427.parenthesizedCount;
    marker8967 = markerCreate8463();
    expr8968 = parseAssignmentExpression8506();
    expressions8969 = [expr8968];
    if (match8472(",")) {
        while (streamIndex8424 < length8421) {
            if (!match8472(",")) {
                break;
            }
            lex8460();
            expr8968 = parseSpreadOrAssignmentExpression8490();
            expressions8969.push(expr8968);
            if (expr8968.type === Syntax8406.SpreadElement) {
                spreadFound8972 = true;
                if (!match8472(")")) {
                    throwError8467({}, Messages8408.ElementAfterSpreadElement);
                }
                break;
            }
        }
        sequence8970 = markerApply8465(marker8967, delegate8422.createSequenceExpression(expressions8969));
    }
    if (match8472("=>")) {
        if ( // Do not allow nested parentheses on the LHS of the =>.
        state8427.parenthesizedCount === oldParenthesizedCount8973 || state8427.parenthesizedCount === oldParenthesizedCount8973 + 1) {
            expr8968 = expr8968.type === Syntax8406.SequenceExpression ? expr8968.expressions : expressions8969;
            coverFormalsList8971 = reinterpretAsCoverFormalsList8504(expr8968);
            if (coverFormalsList8971) {
                return parseArrowFunctionExpression8505(coverFormalsList8971, marker8967);
            }
        }
        throwUnexpected8469(lex8460());
    }
    if (spreadFound8972 && lookahead28462().value !== "=>") {
        throwError8467({}, Messages8408.IllegalSpread);
    }
    return sequence8970 || expr8968;
}
function parseStatementList8508() {
    var list8974 = [],
        statement8975;
    while (streamIndex8424 < length8421) {
        if (match8472("}")) {
            break;
        }
        statement8975 = parseSourceElement8555();
        if (typeof statement8975 === "undefined") {
            break;
        }
        list8974.push(statement8975);
    }
    return list8974;
}
function parseBlock8509() {
    var block8976,
        marker8977 = markerCreate8463();
    expect8470("{");
    block8976 = parseStatementList8508();
    expect8470("}");
    return markerApply8465(marker8977, delegate8422.createBlockStatement(block8976));
}
function parseVariableIdentifier8510() {
    var token8978 = lookahead8425,
        resolvedIdent8979,
        marker8980 = markerCreate8463();
    if (token8978.type !== Token8403.Identifier) {
        throwUnexpected8469(token8978);
    }
    resolvedIdent8979 = expander8402.resolve(tokenStream8423[lookaheadIndex8426], phase8428);
    lex8460();
    return markerApply8465(marker8980, delegate8422.createIdentifier(resolvedIdent8979));
}
function parseVariableDeclaration8511(kind8981) {
    var id8982,
        marker8983 = markerCreate8463(),
        init8984 = null;
    if (match8472("{")) {
        id8982 = parseObjectInitialiser8484();
        reinterpretAsAssignmentBindingPattern8502(id8982);
    } else if (match8472("[")) {
        id8982 = parseArrayInitialiser8479();
        reinterpretAsAssignmentBindingPattern8502(id8982);
    } else {
        id8982 = state8427.allowKeyword ? parseNonComputedProperty8491() : parseVariableIdentifier8510();
        if ( // 12.2.1
        strict8413 && isRestrictedWord8441(id8982.name)) {
            throwErrorTolerant8468({}, Messages8408.StrictVarName);
        }
    }
    if (kind8981 === "const") {
        if (!match8472("=")) {
            throwError8467({}, Messages8408.NoUnintializedConst);
        }
        expect8470("=");
        init8984 = parseAssignmentExpression8506();
    } else if (match8472("=")) {
        lex8460();
        init8984 = parseAssignmentExpression8506();
    }
    return markerApply8465(marker8983, delegate8422.createVariableDeclarator(id8982, init8984));
}
function parseVariableDeclarationList8512(kind8985) {
    var list8986 = [];
    do {
        list8986.push(parseVariableDeclaration8511(kind8985));
        if (!match8472(",")) {
            break;
        }
        lex8460();
    } while (streamIndex8424 < length8421);
    return list8986;
}
function parseVariableStatement8513() {
    var declarations8987,
        marker8988 = markerCreate8463();
    expectKeyword8471("var");
    declarations8987 = parseVariableDeclarationList8512();
    consumeSemicolon8476();
    return markerApply8465(marker8988, delegate8422.createVariableDeclaration(declarations8987, "var"));
}
function parseConstLetDeclaration8514(kind8989) {
    var declarations8990,
        marker8991 = markerCreate8463();
    expectKeyword8471(kind8989);
    declarations8990 = parseVariableDeclarationList8512(kind8989);
    consumeSemicolon8476();
    return markerApply8465(marker8991, delegate8422.createVariableDeclaration(declarations8990, kind8989));
}
function parseModuleSpecifier8515() {
    var marker8992 = markerCreate8463(),
        specifier8993;
    if (lookahead8425.type !== Token8403.StringLiteral) {
        throwError8467({}, Messages8408.InvalidModuleSpecifier);
    }
    specifier8993 = delegate8422.createModuleSpecifier(lookahead8425);
    lex8460();
    return markerApply8465(marker8992, specifier8993);
}
function parseExportBatchSpecifier8516() {
    var marker8994 = markerCreate8463();
    expect8470("*");
    return markerApply8465(marker8994, delegate8422.createExportBatchSpecifier());
}
function parseExportSpecifier8517() {
    var id8995,
        name8996 = null,
        marker8997 = markerCreate8463(),
        from8998;
    if (matchKeyword8473("default")) {
        lex8460();
        id8995 = markerApply8465(marker8997, delegate8422.createIdentifier("default"));
    } else {
        id8995 = parseVariableIdentifier8510();
    }
    if (matchContextualKeyword8474("as")) {
        lex8460();
        name8996 = parseNonComputedProperty8491();
    }
    return markerApply8465(marker8997, delegate8422.createExportSpecifier(id8995, name8996));
}
function parseExportDeclaration8518() {
    var backtrackToken8999,
        id9000,
        previousAllowKeyword9001,
        declaration9002 = null,
        isExportFromIdentifier9003,
        src9004 = null,
        specifiers9005 = [],
        marker9006 = markerCreate8463();
    function rewind9007(token9008) {
        index8414 = token9008.range[0];
        lineNumber8415 = token9008.lineNumber;
        lineStart8416 = token9008.lineStart;
        lookahead8425 = token9008;
    }
    expectKeyword8471("export");
    if (matchKeyword8473("default")) {
        // covers:
        // export default ...
        lex8460();
        if (matchKeyword8473("function") || matchKeyword8473("class")) {
            backtrackToken8999 = lookahead8425;
            lex8460();
            if (isIdentifierName8457(lookahead8425)) {
                // covers:
                // export default function foo () {}
                // export default class foo {}
                id9000 = parseNonComputedProperty8491();
                rewind9007(backtrackToken8999);
                return markerApply8465(marker9006, delegate8422.createExportDeclaration(true, parseSourceElement8555(), [id9000], null));
            }
            // covers:
            // export default function () {}
            // export default class {}
            rewind9007(backtrackToken8999);
            switch (lookahead8425.value) {
                case "class":
                    return markerApply8465(marker9006, delegate8422.createExportDeclaration(true, parseClassExpression8553(), [], null));
                case "function":
                    return markerApply8465(marker9006, delegate8422.createExportDeclaration(true, parseFunctionExpression8548(), [], null));
            }
        }
        if (matchContextualKeyword8474("from")) {
            throwError8467({}, Messages8408.UnexpectedToken, lookahead8425.value);
        }
        if ( // covers:
        // export default {};
        // export default [];
        match8472("{")) {
            declaration9002 = parseObjectInitialiser8484();
        } else if (match8472("[")) {
            declaration9002 = parseArrayInitialiser8479();
        } else {
            declaration9002 = parseAssignmentExpression8506();
        }
        consumeSemicolon8476();
        return markerApply8465(marker9006, delegate8422.createExportDeclaration(true, declaration9002, [], null));
    }
    if ( // non-default export
    lookahead8425.type === Token8403.Keyword) {
        switch ( // covers:
        // export var f = 1;
        lookahead8425.value) {
            case "let":
            case "const":
            case "var":
            case "class":
            case "function":
                return markerApply8465(marker9006, delegate8422.createExportDeclaration(false, parseSourceElement8555(), specifiers9005, null));
        }
    }
    if (match8472("*")) {
        // covers:
        // export * from "foo";
        specifiers9005.push(parseExportBatchSpecifier8516());
        if (!matchContextualKeyword8474("from")) {
            throwError8467({}, lookahead8425.value ? Messages8408.UnexpectedToken : Messages8408.MissingFromClause, lookahead8425.value);
        }
        lex8460();
        src9004 = parseModuleSpecifier8515();
        consumeSemicolon8476();
        return markerApply8465(marker9006, delegate8422.createExportDeclaration(false, null, specifiers9005, src9004));
    }
    expect8470("{");
    do {
        isExportFromIdentifier9003 = isExportFromIdentifier9003 || matchKeyword8473("default");
        specifiers9005.push(parseExportSpecifier8517());
    } while (match8472(",") && lex8460());
    expect8470("}");
    if (matchContextualKeyword8474("from")) {
        // covering:
        // export {default} from "foo";
        // export {foo} from "foo";
        lex8460();
        src9004 = parseModuleSpecifier8515();
        consumeSemicolon8476();
    } else if (isExportFromIdentifier9003) {
        // covering:
        // export {default}; // missing fromClause
        throwError8467({}, lookahead8425.value ? Messages8408.UnexpectedToken : Messages8408.MissingFromClause, lookahead8425.value);
    } else {
        consumeSemicolon8476();
    }
    return markerApply8465(marker9006, delegate8422.createExportDeclaration(false, declaration9002, specifiers9005, src9004));
}
function parseImportSpecifier8519() {
    var
    // import {<foo as bar>} ...;
    id9009,
        name9010 = null,
        marker9011 = markerCreate8463();
    id9009 = parseNonComputedProperty8491();
    if (matchContextualKeyword8474("as")) {
        lex8460();
        name9010 = parseVariableIdentifier8510();
    }
    return markerApply8465(marker9011, delegate8422.createImportSpecifier(id9009, name9010));
}
function parseNamedImports8520() {
    var specifiers9012 = [];
    // {foo, bar as bas}
    expect8470("{");
    do {
        specifiers9012.push(parseImportSpecifier8519());
    } while (match8472(",") && lex8460());
    expect8470("}");
    return specifiers9012;
}
function parseImportDefaultSpecifier8521() {
    var
    // import <foo> ...;
    id9013,
        marker9014 = markerCreate8463();
    id9013 = parseNonComputedProperty8491();
    return markerApply8465(marker9014, delegate8422.createImportDefaultSpecifier(id9013));
}
function parseImportNamespaceSpecifier8522() {
    var
    // import <* as foo> ...;
    id9015,
        marker9016 = markerCreate8463();
    expect8470("*");
    if (!matchContextualKeyword8474("as")) {
        throwError8467({}, Messages8408.NoAsAfterImportNamespace);
    }
    lex8460();
    id9015 = parseNonComputedProperty8491();
    return markerApply8465(marker9016, delegate8422.createImportNamespaceSpecifier(id9015));
}
function parseImportDeclaration8523() {
    var specifiers9017,
        src9018,
        marker9019 = markerCreate8463();
    expectKeyword8471("import");
    specifiers9017 = [];
    if (lookahead8425.type === Token8403.StringLiteral) {
        // covers:
        // import "foo";
        src9018 = parseModuleSpecifier8515();
        consumeSemicolon8476();
        return markerApply8465(marker9019, delegate8422.createImportDeclaration(specifiers9017, src9018));
    }
    if (!matchKeyword8473("default") && isIdentifierName8457(lookahead8425)) {
        // covers:
        // import foo
        // import foo, ...
        specifiers9017.push(parseImportDefaultSpecifier8521());
        if (match8472(",")) {
            lex8460();
        }
    }
    if (match8472("*")) {
        // covers:
        // import foo, * as foo
        // import * as foo
        specifiers9017.push(parseImportNamespaceSpecifier8522());
    } else if (match8472("{")) {
        // covers:
        // import foo, {bar}
        // import {bar}
        specifiers9017 = specifiers9017.concat(parseNamedImports8520());
    }
    if (!matchContextualKeyword8474("from")) {
        throwError8467({}, lookahead8425.value ? Messages8408.UnexpectedToken : Messages8408.MissingFromClause, lookahead8425.value);
    }
    lex8460();
    src9018 = parseModuleSpecifier8515();
    consumeSemicolon8476();
    return markerApply8465(marker9019, delegate8422.createImportDeclaration(specifiers9017, src9018));
}
function parseEmptyStatement8524() {
    var marker9020 = markerCreate8463();
    expect8470(";");
    return markerApply8465(marker9020, delegate8422.createEmptyStatement());
}
function parseExpressionStatement8525() {
    var marker9021 = markerCreate8463(),
        expr9022 = parseExpression8507();
    consumeSemicolon8476();
    return markerApply8465(marker9021, delegate8422.createExpressionStatement(expr9022));
}
function parseIfStatement8526() {
    var test9023,
        consequent9024,
        alternate9025,
        marker9026 = markerCreate8463();
    expectKeyword8471("if");
    expect8470("(");
    test9023 = parseExpression8507();
    expect8470(")");
    consequent9024 = parseStatement8541();
    if (matchKeyword8473("else")) {
        lex8460();
        alternate9025 = parseStatement8541();
    } else {
        alternate9025 = null;
    }
    return markerApply8465(marker9026, delegate8422.createIfStatement(test9023, consequent9024, alternate9025));
}
function parseDoWhileStatement8527() {
    var body9027,
        test9028,
        oldInIteration9029,
        marker9030 = markerCreate8463();
    expectKeyword8471("do");
    oldInIteration9029 = state8427.inIteration;
    state8427.inIteration = true;
    body9027 = parseStatement8541();
    state8427.inIteration = oldInIteration9029;
    expectKeyword8471("while");
    expect8470("(");
    test9028 = parseExpression8507();
    expect8470(")");
    if (match8472(";")) {
        lex8460();
    }
    return markerApply8465(marker9030, delegate8422.createDoWhileStatement(body9027, test9028));
}
function parseWhileStatement8528() {
    var test9031,
        body9032,
        oldInIteration9033,
        marker9034 = markerCreate8463();
    expectKeyword8471("while");
    expect8470("(");
    test9031 = parseExpression8507();
    expect8470(")");
    oldInIteration9033 = state8427.inIteration;
    state8427.inIteration = true;
    body9032 = parseStatement8541();
    state8427.inIteration = oldInIteration9033;
    return markerApply8465(marker9034, delegate8422.createWhileStatement(test9031, body9032));
}
function parseForVariableDeclaration8529() {
    var marker9035 = markerCreate8463(),
        token9036 = lex8460(),
        declarations9037 = parseVariableDeclarationList8512();
    return markerApply8465(marker9035, delegate8422.createVariableDeclaration(declarations9037, token9036.value));
}
function parseForStatement8530(opts9038) {
    var init9039,
        test9040,
        update9041,
        left9042,
        right9043,
        body9044,
        operator9045,
        oldInIteration9046,
        marker9047 = markerCreate8463();
    init9039 = test9040 = update9041 = null;
    expectKeyword8471("for");
    if ( // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
    matchContextualKeyword8474("each")) {
        throwError8467({}, Messages8408.EachNotAllowed);
    }
    expect8470("(");
    if (match8472(";")) {
        lex8460();
    } else {
        if (matchKeyword8473("var") || matchKeyword8473("let") || matchKeyword8473("const")) {
            state8427.allowIn = false;
            init9039 = parseForVariableDeclaration8529();
            state8427.allowIn = true;
            if (init9039.declarations.length === 1) {
                if (matchKeyword8473("in") || matchContextualKeyword8474("of")) {
                    operator9045 = lookahead8425;
                    if (!((operator9045.value === "in" || init9039.kind !== "var") && init9039.declarations[0].init)) {
                        lex8460();
                        left9042 = init9039;
                        right9043 = parseExpression8507();
                        init9039 = null;
                    }
                }
            }
        } else {
            state8427.allowIn = false;
            init9039 = parseExpression8507();
            state8427.allowIn = true;
            if (matchContextualKeyword8474("of")) {
                operator9045 = lex8460();
                left9042 = init9039;
                right9043 = parseExpression8507();
                init9039 = null;
            } else if (matchKeyword8473("in")) {
                if ( // LeftHandSideExpression
                !isAssignableLeftHandSide8478(init9039)) {
                    throwError8467({}, Messages8408.InvalidLHSInForIn);
                }
                operator9045 = lex8460();
                left9042 = init9039;
                right9043 = parseExpression8507();
                init9039 = null;
            }
        }
        if (typeof left9042 === "undefined") {
            expect8470(";");
        }
    }
    if (typeof left9042 === "undefined") {
        if (!match8472(";")) {
            test9040 = parseExpression8507();
        }
        expect8470(";");
        if (!match8472(")")) {
            update9041 = parseExpression8507();
        }
    }
    expect8470(")");
    oldInIteration9046 = state8427.inIteration;
    state8427.inIteration = true;
    if (!(opts9038 !== undefined && opts9038.ignoreBody)) {
        body9044 = parseStatement8541();
    }
    state8427.inIteration = oldInIteration9046;
    if (typeof left9042 === "undefined") {
        return markerApply8465(marker9047, delegate8422.createForStatement(init9039, test9040, update9041, body9044));
    }
    if (operator9045.value === "in") {
        return markerApply8465(marker9047, delegate8422.createForInStatement(left9042, right9043, body9044));
    }
    return markerApply8465(marker9047, delegate8422.createForOfStatement(left9042, right9043, body9044));
}
function parseContinueStatement8531() {
    var label9048 = null,
        key9049,
        marker9050 = markerCreate8463();
    expectKeyword8471("continue");
    if ( // Optimize the most common form: 'continue;'.
    lookahead8425.value.charCodeAt(0) === 59) {
        lex8460();
        if (!state8427.inIteration) {
            throwError8467({}, Messages8408.IllegalContinue);
        }
        return markerApply8465(marker9050, delegate8422.createContinueStatement(null));
    }
    if (peekLineTerminator8466()) {
        if (!state8427.inIteration) {
            throwError8467({}, Messages8408.IllegalContinue);
        }
        return markerApply8465(marker9050, delegate8422.createContinueStatement(null));
    }
    if (lookahead8425.type === Token8403.Identifier) {
        label9048 = parseVariableIdentifier8510();
        key9049 = "$" + label9048.name;
        if (!Object.prototype.hasOwnProperty.call(state8427.labelSet, key9049)) {
            throwError8467({}, Messages8408.UnknownLabel, label9048.name);
        }
    }
    consumeSemicolon8476();
    if (label9048 === null && !state8427.inIteration) {
        throwError8467({}, Messages8408.IllegalContinue);
    }
    return markerApply8465(marker9050, delegate8422.createContinueStatement(label9048));
}
function parseBreakStatement8532() {
    var label9051 = null,
        key9052,
        marker9053 = markerCreate8463();
    expectKeyword8471("break");
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    lookahead8425.value.charCodeAt(0) === 59) {
        lex8460();
        if (!(state8427.inIteration || state8427.inSwitch)) {
            throwError8467({}, Messages8408.IllegalBreak);
        }
        return markerApply8465(marker9053, delegate8422.createBreakStatement(null));
    }
    if (peekLineTerminator8466()) {
        if (!(state8427.inIteration || state8427.inSwitch)) {
            throwError8467({}, Messages8408.IllegalBreak);
        }
        return markerApply8465(marker9053, delegate8422.createBreakStatement(null));
    }
    if (lookahead8425.type === Token8403.Identifier) {
        label9051 = parseVariableIdentifier8510();
        key9052 = "$" + label9051.name;
        if (!Object.prototype.hasOwnProperty.call(state8427.labelSet, key9052)) {
            throwError8467({}, Messages8408.UnknownLabel, label9051.name);
        }
    }
    consumeSemicolon8476();
    if (label9051 === null && !(state8427.inIteration || state8427.inSwitch)) {
        throwError8467({}, Messages8408.IllegalBreak);
    }
    return markerApply8465(marker9053, delegate8422.createBreakStatement(label9051));
}
function parseReturnStatement8533() {
    var argument9054 = null,
        marker9055 = markerCreate8463();
    expectKeyword8471("return");
    if (!state8427.inFunctionBody) {
        throwErrorTolerant8468({}, Messages8408.IllegalReturn);
    }
    if ( // 'return' followed by a space and an identifier is very common.
    isIdentifierStart8437(String(lookahead8425.value).charCodeAt(0))) {
        argument9054 = parseExpression8507();
        consumeSemicolon8476();
        return markerApply8465(marker9055, delegate8422.createReturnStatement(argument9054));
    }
    if (peekLineTerminator8466()) {
        return markerApply8465(marker9055, delegate8422.createReturnStatement(null));
    }
    if (!match8472(";")) {
        if (!match8472("}") && lookahead8425.type !== Token8403.EOF) {
            argument9054 = parseExpression8507();
        }
    }
    consumeSemicolon8476();
    return markerApply8465(marker9055, delegate8422.createReturnStatement(argument9054));
}
function parseWithStatement8534() {
    var object9056,
        body9057,
        marker9058 = markerCreate8463();
    if (strict8413) {
        throwErrorTolerant8468({}, Messages8408.StrictModeWith);
    }
    expectKeyword8471("with");
    expect8470("(");
    object9056 = parseExpression8507();
    expect8470(")");
    body9057 = parseStatement8541();
    return markerApply8465(marker9058, delegate8422.createWithStatement(object9056, body9057));
}
function parseSwitchCase8535() {
    var test9059,
        consequent9060 = [],
        sourceElement9061,
        marker9062 = markerCreate8463();
    if (matchKeyword8473("default")) {
        lex8460();
        test9059 = null;
    } else {
        expectKeyword8471("case");
        test9059 = parseExpression8507();
    }
    expect8470(":");
    while (streamIndex8424 < length8421) {
        if (match8472("}") || matchKeyword8473("default") || matchKeyword8473("case")) {
            break;
        }
        sourceElement9061 = parseSourceElement8555();
        if (typeof sourceElement9061 === "undefined") {
            break;
        }
        consequent9060.push(sourceElement9061);
    }
    return markerApply8465(marker9062, delegate8422.createSwitchCase(test9059, consequent9060));
}
function parseSwitchStatement8536() {
    var discriminant9063,
        cases9064,
        clause9065,
        oldInSwitch9066,
        defaultFound9067,
        marker9068 = markerCreate8463();
    expectKeyword8471("switch");
    expect8470("(");
    discriminant9063 = parseExpression8507();
    expect8470(")");
    expect8470("{");
    cases9064 = [];
    if (match8472("}")) {
        lex8460();
        return markerApply8465(marker9068, delegate8422.createSwitchStatement(discriminant9063, cases9064));
    }
    oldInSwitch9066 = state8427.inSwitch;
    state8427.inSwitch = true;
    defaultFound9067 = false;
    while (streamIndex8424 < length8421) {
        if (match8472("}")) {
            break;
        }
        clause9065 = parseSwitchCase8535();
        if (clause9065.test === null) {
            if (defaultFound9067) {
                throwError8467({}, Messages8408.MultipleDefaultsInSwitch);
            }
            defaultFound9067 = true;
        }
        cases9064.push(clause9065);
    }
    state8427.inSwitch = oldInSwitch9066;
    expect8470("}");
    return markerApply8465(marker9068, delegate8422.createSwitchStatement(discriminant9063, cases9064));
}
function parseThrowStatement8537() {
    var argument9069,
        marker9070 = markerCreate8463();
    expectKeyword8471("throw");
    if (peekLineTerminator8466()) {
        throwError8467({}, Messages8408.NewlineAfterThrow);
    }
    argument9069 = parseExpression8507();
    consumeSemicolon8476();
    return markerApply8465(marker9070, delegate8422.createThrowStatement(argument9069));
}
function parseCatchClause8538() {
    var param9071,
        body9072,
        marker9073 = markerCreate8463();
    expectKeyword8471("catch");
    expect8470("(");
    if (match8472(")")) {
        throwUnexpected8469(lookahead8425);
    }
    param9071 = parseExpression8507();
    if ( // 12.14.1
    strict8413 && param9071.type === Syntax8406.Identifier && isRestrictedWord8441(param9071.name)) {
        throwErrorTolerant8468({}, Messages8408.StrictCatchVariable);
    }
    expect8470(")");
    body9072 = parseBlock8509();
    return markerApply8465(marker9073, delegate8422.createCatchClause(param9071, body9072));
}
function parseTryStatement8539() {
    var block9074,
        handlers9075 = [],
        finalizer9076 = null,
        marker9077 = markerCreate8463();
    expectKeyword8471("try");
    block9074 = parseBlock8509();
    if (matchKeyword8473("catch")) {
        handlers9075.push(parseCatchClause8538());
    }
    if (matchKeyword8473("finally")) {
        lex8460();
        finalizer9076 = parseBlock8509();
    }
    if (handlers9075.length === 0 && !finalizer9076) {
        throwError8467({}, Messages8408.NoCatchOrFinally);
    }
    return markerApply8465(marker9077, delegate8422.createTryStatement(block9074, [], handlers9075, finalizer9076));
}
function parseDebuggerStatement8540() {
    var marker9078 = markerCreate8463();
    expectKeyword8471("debugger");
    consumeSemicolon8476();
    return markerApply8465(marker9078, delegate8422.createDebuggerStatement());
}
function parseStatement8541() {
    var type9079 = lookahead8425.type,
        marker9080,
        expr9081,
        labeledBody9082,
        key9083;
    if (type9079 === Token8403.EOF) {
        throwUnexpected8469(lookahead8425);
    }
    if (type9079 === Token8403.Punctuator) {
        switch (lookahead8425.value) {
            case ";":
                return parseEmptyStatement8524();
            case "{":
                return parseBlock8509();
            case "(":
                return parseExpressionStatement8525();
            default:
                break;
        }
    }
    if (type9079 === Token8403.Keyword) {
        switch (lookahead8425.value) {
            case "break":
                return parseBreakStatement8532();
            case "continue":
                return parseContinueStatement8531();
            case "debugger":
                return parseDebuggerStatement8540();
            case "do":
                return parseDoWhileStatement8527();
            case "for":
                return parseForStatement8530();
            case "function":
                return parseFunctionDeclaration8547();
            case "class":
                return parseClassDeclaration8554();
            case "if":
                return parseIfStatement8526();
            case "return":
                return parseReturnStatement8533();
            case "switch":
                return parseSwitchStatement8536();
            case "throw":
                return parseThrowStatement8537();
            case "try":
                return parseTryStatement8539();
            case "var":
                return parseVariableStatement8513();
            case "while":
                return parseWhileStatement8528();
            case "with":
                return parseWithStatement8534();
            default:
                break;
        }
    }
    marker9080 = markerCreate8463();
    expr9081 = parseExpression8507();
    if ( // 12.12 Labelled Statements
    expr9081.type === Syntax8406.Identifier && match8472(":")) {
        lex8460();
        key9083 = "$" + expr9081.name;
        if (Object.prototype.hasOwnProperty.call(state8427.labelSet, key9083)) {
            throwError8467({}, Messages8408.Redeclaration, "Label", expr9081.name);
        }
        state8427.labelSet[key9083] = true;
        labeledBody9082 = parseStatement8541();
        delete state8427.labelSet[key9083];
        return markerApply8465(marker9080, delegate8422.createLabeledStatement(expr9081, labeledBody9082));
    }
    consumeSemicolon8476();
    return markerApply8465(marker9080, delegate8422.createExpressionStatement(expr9081));
}
function parseConciseBody8542() {
    if (match8472("{")) {
        return parseFunctionSourceElements8543();
    }
    return parseAssignmentExpression8506();
}
function parseFunctionSourceElements8543() {
    var sourceElement9084,
        sourceElements9085 = [],
        token9086,
        directive9087,
        firstRestricted9088,
        oldLabelSet9089,
        oldInIteration9090,
        oldInSwitch9091,
        oldInFunctionBody9092,
        oldParenthesizedCount9093,
        marker9094 = markerCreate8463();
    expect8470("{");
    while (streamIndex8424 < length8421) {
        if (lookahead8425.type !== Token8403.StringLiteral) {
            break;
        }
        token9086 = lookahead8425;
        sourceElement9084 = parseSourceElement8555();
        sourceElements9085.push(sourceElement9084);
        if (sourceElement9084.expression.type !== Syntax8406.Literal) {
            // this is not directive
            break;
        }
        directive9087 = token9086.value;
        if (directive9087 === "use strict") {
            strict8413 = true;
            if (firstRestricted9088) {
                throwErrorTolerant8468(firstRestricted9088, Messages8408.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9088 && token9086.octal) {
                firstRestricted9088 = token9086;
            }
        }
    }
    oldLabelSet9089 = state8427.labelSet;
    oldInIteration9090 = state8427.inIteration;
    oldInSwitch9091 = state8427.inSwitch;
    oldInFunctionBody9092 = state8427.inFunctionBody;
    oldParenthesizedCount9093 = state8427.parenthesizedCount;
    state8427.labelSet = {};
    state8427.inIteration = false;
    state8427.inSwitch = false;
    state8427.inFunctionBody = true;
    state8427.parenthesizedCount = 0;
    while (streamIndex8424 < length8421) {
        if (match8472("}")) {
            break;
        }
        sourceElement9084 = parseSourceElement8555();
        if (typeof sourceElement9084 === "undefined") {
            break;
        }
        sourceElements9085.push(sourceElement9084);
    }
    expect8470("}");
    state8427.labelSet = oldLabelSet9089;
    state8427.inIteration = oldInIteration9090;
    state8427.inSwitch = oldInSwitch9091;
    state8427.inFunctionBody = oldInFunctionBody9092;
    state8427.parenthesizedCount = oldParenthesizedCount9093;
    return markerApply8465(marker9094, delegate8422.createBlockStatement(sourceElements9085));
}
function validateParam8544(options9095, param9096, name9097) {
    var key9098 = "$" + name9097;
    if (strict8413) {
        if (isRestrictedWord8441(name9097)) {
            options9095.stricted = param9096;
            options9095.message = Messages8408.StrictParamName;
        }
        if (Object.prototype.hasOwnProperty.call(options9095.paramSet, key9098)) {
            options9095.stricted = param9096;
            options9095.message = Messages8408.StrictParamDupe;
        }
    } else if (!options9095.firstRestricted) {
        if (isRestrictedWord8441(name9097)) {
            options9095.firstRestricted = param9096;
            options9095.message = Messages8408.StrictParamName;
        } else if (isStrictModeReservedWord8440(name9097)) {
            options9095.firstRestricted = param9096;
            options9095.message = Messages8408.StrictReservedWord;
        } else if (Object.prototype.hasOwnProperty.call(options9095.paramSet, key9098)) {
            options9095.firstRestricted = param9096;
            options9095.message = Messages8408.StrictParamDupe;
        }
    }
    options9095.paramSet[key9098] = true;
}
function parseParam8545(options9099) {
    var token9100, rest9101, param9102, def9103;
    token9100 = lookahead8425;
    if (token9100.value === "...") {
        token9100 = lex8460();
        rest9101 = true;
    }
    if (match8472("[")) {
        param9102 = parseArrayInitialiser8479();
        reinterpretAsDestructuredParameter8503(options9099, param9102);
    } else if (match8472("{")) {
        if (rest9101) {
            throwError8467({}, Messages8408.ObjectPatternAsRestParameter);
        }
        param9102 = parseObjectInitialiser8484();
        reinterpretAsDestructuredParameter8503(options9099, param9102);
    } else {
        param9102 = parseVariableIdentifier8510();
        validateParam8544(options9099, token9100, token9100.value);
    }
    if (match8472("=")) {
        if (rest9101) {
            throwErrorTolerant8468(lookahead8425, Messages8408.DefaultRestParameter);
        }
        lex8460();
        def9103 = parseAssignmentExpression8506();
        ++options9099.defaultCount;
    }
    if (rest9101) {
        if (!match8472(")")) {
            throwError8467({}, Messages8408.ParameterAfterRestParameter);
        }
        options9099.rest = param9102;
        return false;
    }
    options9099.params.push(param9102);
    options9099.defaults.push(def9103);
    return !match8472(")");
}
function parseParams8546(firstRestricted9104) {
    var options9105;
    options9105 = {
        params: [],
        defaultCount: 0,
        defaults: [],
        rest: null,
        firstRestricted: firstRestricted9104
    };
    expect8470("(");
    if (!match8472(")")) {
        options9105.paramSet = {};
        while (streamIndex8424 < length8421) {
            if (!parseParam8545(options9105)) {
                break;
            }
            expect8470(",");
        }
    }
    expect8470(")");
    if (options9105.defaultCount === 0) {
        options9105.defaults = [];
    }
    return options9105;
}
function parseFunctionDeclaration8547() {
    var id9106,
        body9107,
        token9108,
        tmp9109,
        firstRestricted9110,
        message9111,
        previousStrict9112,
        previousYieldAllowed9113,
        generator9114,
        marker9115 = markerCreate8463();
    expectKeyword8471("function");
    generator9114 = false;
    if (match8472("*")) {
        lex8460();
        generator9114 = true;
    }
    token9108 = lookahead8425;
    id9106 = parseVariableIdentifier8510();
    if (strict8413) {
        if (isRestrictedWord8441(token9108.value)) {
            throwErrorTolerant8468(token9108, Messages8408.StrictFunctionName);
        }
    } else {
        if (isRestrictedWord8441(token9108.value)) {
            firstRestricted9110 = token9108;
            message9111 = Messages8408.StrictFunctionName;
        } else if (isStrictModeReservedWord8440(token9108.value)) {
            firstRestricted9110 = token9108;
            message9111 = Messages8408.StrictReservedWord;
        }
    }
    tmp9109 = parseParams8546(firstRestricted9110);
    firstRestricted9110 = tmp9109.firstRestricted;
    if (tmp9109.message) {
        message9111 = tmp9109.message;
    }
    previousStrict9112 = strict8413;
    previousYieldAllowed9113 = state8427.yieldAllowed;
    state8427.yieldAllowed = generator9114;
    body9107 = parseFunctionSourceElements8543();
    if (strict8413 && firstRestricted9110) {
        throwError8467(firstRestricted9110, message9111);
    }
    if (strict8413 && tmp9109.stricted) {
        throwErrorTolerant8468(tmp9109.stricted, message9111);
    }
    strict8413 = previousStrict9112;
    state8427.yieldAllowed = previousYieldAllowed9113;
    return markerApply8465(marker9115, delegate8422.createFunctionDeclaration(id9106, tmp9109.params, tmp9109.defaults, body9107, tmp9109.rest, generator9114, false));
}
function parseFunctionExpression8548() {
    var token9116,
        id9117 = null,
        firstRestricted9118,
        message9119,
        tmp9120,
        body9121,
        previousStrict9122,
        previousYieldAllowed9123,
        generator9124,
        marker9125 = markerCreate8463();
    expectKeyword8471("function");
    generator9124 = false;
    if (match8472("*")) {
        lex8460();
        generator9124 = true;
    }
    if (!match8472("(")) {
        token9116 = lookahead8425;
        id9117 = parseVariableIdentifier8510();
        if (strict8413) {
            if (isRestrictedWord8441(token9116.value)) {
                throwErrorTolerant8468(token9116, Messages8408.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord8441(token9116.value)) {
                firstRestricted9118 = token9116;
                message9119 = Messages8408.StrictFunctionName;
            } else if (isStrictModeReservedWord8440(token9116.value)) {
                firstRestricted9118 = token9116;
                message9119 = Messages8408.StrictReservedWord;
            }
        }
    }
    tmp9120 = parseParams8546(firstRestricted9118);
    firstRestricted9118 = tmp9120.firstRestricted;
    if (tmp9120.message) {
        message9119 = tmp9120.message;
    }
    previousStrict9122 = strict8413;
    previousYieldAllowed9123 = state8427.yieldAllowed;
    state8427.yieldAllowed = generator9124;
    body9121 = parseFunctionSourceElements8543();
    if (strict8413 && firstRestricted9118) {
        throwError8467(firstRestricted9118, message9119);
    }
    if (strict8413 && tmp9120.stricted) {
        throwErrorTolerant8468(tmp9120.stricted, message9119);
    }
    strict8413 = previousStrict9122;
    state8427.yieldAllowed = previousYieldAllowed9123;
    return markerApply8465(marker9125, delegate8422.createFunctionExpression(id9117, tmp9120.params, tmp9120.defaults, body9121, tmp9120.rest, generator9124, false));
}
function parseYieldExpression8549() {
    var yieldToken9126,
        delegateFlag9127,
        expr9128,
        marker9129 = markerCreate8463();
    yieldToken9126 = lex8460();
    assert8430(yieldToken9126.value === "yield", "Called parseYieldExpression with non-yield lookahead.");
    if (!state8427.yieldAllowed) {
        throwErrorTolerant8468({}, Messages8408.IllegalYield);
    }
    delegateFlag9127 = false;
    if (match8472("*")) {
        lex8460();
        delegateFlag9127 = true;
    }
    expr9128 = parseAssignmentExpression8506();
    return markerApply8465(marker9129, delegate8422.createYieldExpression(expr9128, delegateFlag9127));
}
function parseMethodDefinition8550(existingPropNames9130) {
    var token9131,
        key9132,
        param9133,
        propType9134,
        isValidDuplicateProp9135 = false,
        marker9136 = markerCreate8463();
    if (lookahead8425.value === "static") {
        propType9134 = ClassPropertyType8411["static"];
        lex8460();
    } else {
        propType9134 = ClassPropertyType8411.prototype;
    }
    if (match8472("*")) {
        lex8460();
        return markerApply8465(marker9136, delegate8422.createMethodDefinition(propType9134, "", parseObjectPropertyKey8482(), parsePropertyMethodFunction8481({ generator: true })));
    }
    token9131 = lookahead8425;
    key9132 = parseObjectPropertyKey8482();
    if (token9131.value === "get" && !match8472("(")) {
        key9132 = parseObjectPropertyKey8482();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a setter
        existingPropNames9130[propType9134].hasOwnProperty(key9132.name)) {
            isValidDuplicateProp9135 = // There isn't already a getter for this prop
            existingPropNames9130[propType9134][key9132.name].get === undefined && // There isn't already a data prop by this name
            existingPropNames9130[propType9134][key9132.name].data === undefined && // The only existing prop by this name is a setter
            existingPropNames9130[propType9134][key9132.name].set !== undefined;
            if (!isValidDuplicateProp9135) {
                throwError8467(key9132, Messages8408.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9130[propType9134][key9132.name] = {};
        }
        existingPropNames9130[propType9134][key9132.name].get = true;
        expect8470("(");
        expect8470(")");
        return markerApply8465(marker9136, delegate8422.createMethodDefinition(propType9134, "get", key9132, parsePropertyFunction8480({ generator: false })));
    }
    if (token9131.value === "set" && !match8472("(")) {
        key9132 = parseObjectPropertyKey8482();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a getter
        existingPropNames9130[propType9134].hasOwnProperty(key9132.name)) {
            isValidDuplicateProp9135 = // There isn't already a setter for this prop
            existingPropNames9130[propType9134][key9132.name].set === undefined && // There isn't already a data prop by this name
            existingPropNames9130[propType9134][key9132.name].data === undefined && // The only existing prop by this name is a getter
            existingPropNames9130[propType9134][key9132.name].get !== undefined;
            if (!isValidDuplicateProp9135) {
                throwError8467(key9132, Messages8408.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9130[propType9134][key9132.name] = {};
        }
        existingPropNames9130[propType9134][key9132.name].set = true;
        expect8470("(");
        token9131 = lookahead8425;
        param9133 = [parseVariableIdentifier8510()];
        expect8470(")");
        return markerApply8465(marker9136, delegate8422.createMethodDefinition(propType9134, "set", key9132, parsePropertyFunction8480({
            params: param9133,
            generator: false,
            name: token9131
        })));
    }
    if ( // It is a syntax error if any other properties have the same name as a
    // non-getter, non-setter method
    existingPropNames9130[propType9134].hasOwnProperty(key9132.name)) {
        throwError8467(key9132, Messages8408.IllegalDuplicateClassProperty);
    } else {
        existingPropNames9130[propType9134][key9132.name] = {};
    }
    existingPropNames9130[propType9134][key9132.name].data = true;
    return markerApply8465(marker9136, delegate8422.createMethodDefinition(propType9134, "", key9132, parsePropertyMethodFunction8481({ generator: false })));
}
function parseClassElement8551(existingProps9137) {
    if (match8472(";")) {
        lex8460();
        return;
    }
    return parseMethodDefinition8550(existingProps9137);
}
function parseClassBody8552() {
    var classElement9138,
        classElements9139 = [],
        existingProps9140 = {},
        marker9141 = markerCreate8463();
    existingProps9140[ClassPropertyType8411["static"]] = {};
    existingProps9140[ClassPropertyType8411.prototype] = {};
    expect8470("{");
    while (streamIndex8424 < length8421) {
        if (match8472("}")) {
            break;
        }
        classElement9138 = parseClassElement8551(existingProps9140);
        if (typeof classElement9138 !== "undefined") {
            classElements9139.push(classElement9138);
        }
    }
    expect8470("}");
    return markerApply8465(marker9141, delegate8422.createClassBody(classElements9139));
}
function parseClassExpression8553() {
    var id9142,
        previousYieldAllowed9143,
        superClass9144 = null,
        marker9145 = markerCreate8463();
    expectKeyword8471("class");
    if (!matchKeyword8473("extends") && !match8472("{")) {
        id9142 = parseVariableIdentifier8510();
    }
    if (matchKeyword8473("extends")) {
        expectKeyword8471("extends");
        previousYieldAllowed9143 = state8427.yieldAllowed;
        state8427.yieldAllowed = false;
        superClass9144 = parseAssignmentExpression8506();
        state8427.yieldAllowed = previousYieldAllowed9143;
    }
    return markerApply8465(marker9145, delegate8422.createClassExpression(id9142, superClass9144, parseClassBody8552()));
}
function parseClassDeclaration8554() {
    var id9146,
        previousYieldAllowed9147,
        superClass9148 = null,
        marker9149 = markerCreate8463();
    expectKeyword8471("class");
    id9146 = parseVariableIdentifier8510();
    if (matchKeyword8473("extends")) {
        expectKeyword8471("extends");
        previousYieldAllowed9147 = state8427.yieldAllowed;
        state8427.yieldAllowed = false;
        superClass9148 = parseAssignmentExpression8506();
        state8427.yieldAllowed = previousYieldAllowed9147;
    }
    return markerApply8465(marker9149, delegate8422.createClassDeclaration(id9146, superClass9148, parseClassBody8552()));
}
function parseSourceElement8555() {
    if (lookahead8425.type === Token8403.Keyword) {
        switch (lookahead8425.value) {
            case "const":
            case "let":
                return parseConstLetDeclaration8514(lookahead8425.value);
            case "function":
                return parseFunctionDeclaration8547();
            default:
                return parseStatement8541();
        }
    }
    if (lookahead8425.type !== Token8403.EOF) {
        return parseStatement8541();
    }
}
function parseProgramElement8556() {
    if (lookahead8425.type === Token8403.Keyword) {
        switch (lookahead8425.value) {
            case "export":
                return parseExportDeclaration8518();
            case "import":
                return parseImportDeclaration8523();
        }
    }
    return parseSourceElement8555();
}
function parseProgramElements8557() {
    var sourceElement9150,
        sourceElements9151 = [],
        token9152,
        directive9153,
        firstRestricted9154;
    while (streamIndex8424 < length8421) {
        token9152 = lookahead8425;
        if (token9152.type !== Token8403.StringLiteral) {
            break;
        }
        sourceElement9150 = parseProgramElement8556();
        sourceElements9151.push(sourceElement9150);
        if (sourceElement9150.expression.type !== Syntax8406.Literal) {
            // this is not directive
            break;
        }
        directive9153 = token9152.value;
        if (directive9153 === "use strict") {
            strict8413 = true;
            if (firstRestricted9154) {
                throwErrorTolerant8468(firstRestricted9154, Messages8408.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9154 && token9152.octal) {
                firstRestricted9154 = token9152;
            }
        }
    }
    while (streamIndex8424 < length8421) {
        sourceElement9150 = parseProgramElement8556();
        if (typeof sourceElement9150 === "undefined") {
            break;
        }
        sourceElements9151.push(sourceElement9150);
    }
    return sourceElements9151;
}
function parseProgram8558() {
    var body9155,
        marker9156 = markerCreate8463();
    strict8413 = false;
    peek8461();
    body9155 = parseProgramElements8557();
    return markerApply8465(marker9156, delegate8422.createProgram(body9155));
}
function addComment8559(type9157, value9158, start9159, end9160, loc9161) {
    var comment9162;
    assert8430(typeof start9159 === "number", "Comment must have valid position");
    if ( // Because the way the actual token is scanned, often the comments
    // (if any) are skipped twice during the lexical analysis.
    // Thus, we need to skip adding a comment if the comment array already
    // handled it.
    state8427.lastCommentStart >= start9159) {
        return;
    }
    state8427.lastCommentStart = start9159;
    comment9162 = {
        type: type9157,
        value: value9158
    };
    if (extra8429.range) {
        comment9162.range = [start9159, end9160];
    }
    if (extra8429.loc) {
        comment9162.loc = loc9161;
    }
    extra8429.comments.push(comment9162);
    if (extra8429.attachComment) {
        extra8429.leadingComments.push(comment9162);
        extra8429.trailingComments.push(comment9162);
    }
}
function scanComment8560() {
    var comment9163, ch9164, loc9165, start9166, blockComment9167, lineComment9168;
    comment9163 = "";
    blockComment9167 = false;
    lineComment9168 = false;
    while (index8414 < length8421) {
        ch9164 = source8412[index8414];
        if (lineComment9168) {
            ch9164 = source8412[index8414++];
            if (isLineTerminator8436(ch9164.charCodeAt(0))) {
                loc9165.end = {
                    line: lineNumber8415,
                    column: index8414 - lineStart8416 - 1
                };
                lineComment9168 = false;
                addComment8559("Line", comment9163, start9166, index8414 - 1, loc9165);
                if (ch9164 === "\r" && source8412[index8414] === "\n") {
                    ++index8414;
                }
                ++lineNumber8415;
                lineStart8416 = index8414;
                comment9163 = "";
            } else if (index8414 >= length8421) {
                lineComment9168 = false;
                comment9163 += ch9164;
                loc9165.end = {
                    line: lineNumber8415,
                    column: length8421 - lineStart8416
                };
                addComment8559("Line", comment9163, start9166, length8421, loc9165);
            } else {
                comment9163 += ch9164;
            }
        } else if (blockComment9167) {
            if (isLineTerminator8436(ch9164.charCodeAt(0))) {
                if (ch9164 === "\r" && source8412[index8414 + 1] === "\n") {
                    ++index8414;
                    comment9163 += "\r\n";
                } else {
                    comment9163 += ch9164;
                }
                ++lineNumber8415;
                ++index8414;
                lineStart8416 = index8414;
                if (index8414 >= length8421) {
                    throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch9164 = source8412[index8414++];
                if (index8414 >= length8421) {
                    throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
                }
                comment9163 += ch9164;
                if (ch9164 === "*") {
                    ch9164 = source8412[index8414];
                    if (ch9164 === "/") {
                        comment9163 = comment9163.substr(0, comment9163.length - 1);
                        blockComment9167 = false;
                        ++index8414;
                        loc9165.end = {
                            line: lineNumber8415,
                            column: index8414 - lineStart8416
                        };
                        addComment8559("Block", comment9163, start9166, index8414, loc9165);
                        comment9163 = "";
                    }
                }
            }
        } else if (ch9164 === "/") {
            ch9164 = source8412[index8414 + 1];
            if (ch9164 === "/") {
                loc9165 = {
                    start: {
                        line: lineNumber8415,
                        column: index8414 - lineStart8416
                    }
                };
                start9166 = index8414;
                index8414 += 2;
                lineComment9168 = true;
                if (index8414 >= length8421) {
                    loc9165.end = {
                        line: lineNumber8415,
                        column: index8414 - lineStart8416
                    };
                    lineComment9168 = false;
                    addComment8559("Line", comment9163, start9166, index8414, loc9165);
                }
            } else if (ch9164 === "*") {
                start9166 = index8414;
                index8414 += 2;
                blockComment9167 = true;
                loc9165 = {
                    start: {
                        line: lineNumber8415,
                        column: index8414 - lineStart8416 - 2
                    }
                };
                if (index8414 >= length8421) {
                    throwError8467({}, Messages8408.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8435(ch9164.charCodeAt(0))) {
            ++index8414;
        } else if (isLineTerminator8436(ch9164.charCodeAt(0))) {
            ++index8414;
            if (ch9164 === "\r" && source8412[index8414] === "\n") {
                ++index8414;
            }
            ++lineNumber8415;
            lineStart8416 = index8414;
        } else {
            break;
        }
    }
}
function collectToken8561() {
    var start9169, loc9170, token9171, range9172, value9173, entry9174;
    skipComment8443();
    start9169 = index8414;
    loc9170 = {
        start: {
            line: lineNumber8415,
            column: index8414 - lineStart8416
        }
    };
    token9171 = extra8429.advance();
    loc9170.end = {
        line: lineNumber8415,
        column: index8414 - lineStart8416
    };
    if (token9171.type !== Token8403.EOF) {
        range9172 = [token9171.range[0], token9171.range[1]];
        value9173 = source8412.slice(token9171.range[0], token9171.range[1]);
        entry9174 = {
            type: TokenName8404[token9171.type],
            value: value9173,
            range: range9172,
            loc: loc9170
        };
        if (token9171.regex) {
            entry9174.regex = {
                pattern: token9171.regex.pattern,
                flags: token9171.regex.flags
            };
        }
        extra8429.tokens.push(entry9174);
    }
    return token9171;
}
function collectRegex8562() {
    var pos9175, loc9176, regex9177, token9178;
    skipComment8443();
    pos9175 = index8414;
    loc9176 = {
        start: {
            line: lineNumber8415,
            column: index8414 - lineStart8416
        }
    };
    regex9177 = extra8429.scanRegExp();
    loc9176.end = {
        line: lineNumber8415,
        column: index8414 - lineStart8416
    };
    if (!extra8429.tokenize) {
        if ( // Pop the previous token, which is likely '/' or '/='
        extra8429.tokens.length > 0) {
            token9178 = extra8429.tokens[extra8429.tokens.length - 1];
            if (token9178.range[0] === pos9175 && token9178.type === "Punctuator") {
                if (token9178.value === "/" || token9178.value === "/=") {
                    extra8429.tokens.pop();
                }
            }
        }
        extra8429.tokens.push({
            type: "RegularExpression",
            value: regex9177.literal,
            regex: regex9177.regex,
            range: [pos9175, index8414],
            loc: loc9176
        });
    }
    return regex9177;
}
function filterTokenLocation8563() {
    var i9179,
        entry9180,
        token9181,
        tokens9182 = [];
    for (i9179 = 0; i9179 < extra8429.tokens.length; ++i9179) {
        entry9180 = extra8429.tokens[i9179];
        token9181 = {
            type: entry9180.type,
            value: entry9180.value
        };
        if (entry9180.regex) {
            token9181.regex = {
                pattern: entry9180.regex.pattern,
                flags: entry9180.regex.flags
            };
        }
        if (extra8429.range) {
            token9181.range = entry9180.range;
        }
        if (extra8429.loc) {
            token9181.loc = entry9180.loc;
        }
        tokens9182.push(token9181);
    }
    extra8429.tokens = tokens9182;
}
function patch8564() {
    if (extra8429.comments) {
        extra8429.skipComment = skipComment8443;
        skipComment8443 = scanComment8560;
    }
    if (typeof extra8429.tokens !== "undefined") {
        extra8429.advance = advance8459;
        extra8429.scanRegExp = scanRegExp8456;
        advance8459 = collectToken8561;
        scanRegExp8456 = collectRegex8562;
    }
}
function unpatch8565() {
    if (typeof extra8429.skipComment === "function") {
        skipComment8443 = extra8429.skipComment;
    }
    if (typeof extra8429.scanRegExp === "function") {
        advance8459 = extra8429.advance;
        scanRegExp8456 = extra8429.scanRegExp;
    }
}
function extend8566(object9183, properties9184) {
    var entry9185,
        result9186 = {};
    for (entry9185 in object9183) {
        if (object9183.hasOwnProperty(entry9185)) {
            result9186[entry9185] = object9183[entry9185];
        }
    }
    for (entry9185 in properties9184) {
        if (properties9184.hasOwnProperty(entry9185)) {
            result9186[entry9185] = properties9184[entry9185];
        }
    }
    return result9186;
}
function tokenize8567(code9187, options9188) {
    var toString9189, token9190, tokens9191;
    toString9189 = String;
    if (typeof code9187 !== "string" && !(code9187 instanceof String)) {
        code9187 = toString9189(code9187);
    }
    delegate8422 = SyntaxTreeDelegate8410;
    source8412 = code9187;
    index8414 = 0;
    lineNumber8415 = source8412.length > 0 ? 1 : 0;
    lineStart8416 = 0;
    length8421 = source8412.length;
    lookahead8425 = null;
    state8427 = {
        allowKeyword: true,
        allowIn: true,
        labelSet: {},
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        lastCommentStart: -1
    };
    extra8429 = {};
    // Options matching.
    options9188 = options9188 || {};
    // Of course we collect tokens here.
    options9188.tokens = true;
    extra8429.tokens = [];
    extra8429.tokenize = true;
    // The following two fields are necessary to compute the Regex tokens.
    extra8429.openParenToken = -1;
    extra8429.openCurlyToken = -1;
    extra8429.range = typeof options9188.range === "boolean" && options9188.range;
    extra8429.loc = typeof options9188.loc === "boolean" && options9188.loc;
    if (typeof options9188.comment === "boolean" && options9188.comment) {
        extra8429.comments = [];
    }
    if (typeof options9188.tolerant === "boolean" && options9188.tolerant) {
        extra8429.errors = [];
    }
    if (length8421 > 0) {
        if (typeof source8412[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9187 instanceof String) {
                source8412 = code9187.valueOf();
            }
        }
    }
    patch8564();
    try {
        peek8461();
        if (lookahead8425.type === Token8403.EOF) {
            return extra8429.tokens;
        }
        token9190 = lex8460();
        while (lookahead8425.type !== Token8403.EOF) {
            try {
                token9190 = lex8460();
            } catch (lexError9192) {
                token9190 = lookahead8425;
                if (extra8429.errors) {
                    extra8429.errors.push(lexError9192);
                    // We have to break on the first error
                    // to avoid infinite loops.
                    break;
                } else {
                    throw lexError9192;
                }
            }
        }
        filterTokenLocation8563();
        tokens9191 = extra8429.tokens;
        if (typeof extra8429.comments !== "undefined") {
            tokens9191.comments = extra8429.comments;
        }
        if (typeof extra8429.errors !== "undefined") {
            tokens9191.errors = extra8429.errors;
        }
    } catch (e9193) {
        throw e9193;
    } finally {
        unpatch8565();
        extra8429 = {};
    }
    return tokens9191;
}
function blockAllowed8568(toks9194, start9195, inExprDelim9196, parentIsBlock9197) {
    var assignOps9198 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
    var binaryOps9199 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
    var unaryOps9200 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
    function back9201(n9202) {
        var idx9203 = toks9194.length - n9202 > 0 ? toks9194.length - n9202 : 0;
        return toks9194[idx9203];
    }
    if (inExprDelim9196 && toks9194.length - (start9195 + 2) <= 0) {
        // ... ({...} ...)
        return false;
    } else if (back9201(start9195 + 2).value === ":" && parentIsBlock9197) {
        // ...{a:{b:{...}}}
        return true;
    } else if (isIn8431(back9201(start9195 + 2).value, unaryOps9200.concat(binaryOps9199).concat(assignOps9198))) {
        // ... + {...}
        return false;
    } else if (back9201(start9195 + 2).value === "return") {
        var // ASI makes `{}` a block in:
        //
        //    return
        //    { ... }
        //
        // otherwise an object literal, so it's an
        // expression and thus / is divide
        currLineNumber9204 = typeof back9201(start9195 + 1).startLineNumber !== "undefined" ? back9201(start9195 + 1).startLineNumber : back9201(start9195 + 1).lineNumber;
        if (back9201(start9195 + 2).lineNumber !== currLineNumber9204) {
            return true;
        } else {
            return false;
        }
    } else if (isIn8431(back9201(start9195 + 2).value, ["void", "typeof", "in", "case", "delete"])) {
        // ... in {}
        return false;
    } else {
        return true;
    }
}
var // Readtables
readtables8569 = {
    currentReadtable: {},
    // A readtable is invoked within `readToken`, but it can
    // return multiple tokens. We need to "queue" the stream of
    // tokens so that subsequent calls to `readToken` gets the
    // rest of the stream.
    queued: [],
    // A readtable can only override punctuators
    punctuators: ";,.:!?~=%&*+-/<>^|#@",
    has: function has(ch9205) {
        return readtables8569.currentReadtable[ch9205] && readtables8569.punctuators.indexOf(ch9205) !== -1;
    },
    getQueued: function getQueued() {
        return readtables8569.queued.length ? readtables8569.queued.shift() : null;
    },
    peekQueued: function peekQueued(lookahead9206) {
        lookahead9206 = lookahead9206 ? lookahead9206 : 1;
        return readtables8569.queued.length ? readtables8569.queued[lookahead9206 - 1] : null;
    },
    invoke: function invoke(ch9207, toks9208) {
        var prevState9209 = snapshotParserState8570();
        var newStream9210 = readtables8569.currentReadtable[ch9207](ch9207, readtables8569.readerAPI, toks9208, source8412, index8414);
        if (!newStream9210) {
            // Reset the state
            restoreParserState8571(prevState9209);
            return null;
        } else if (!Array.isArray(newStream9210)) {
            newStream9210 = [newStream9210];
        }
        this.queued = this.queued.concat(newStream9210);
        return this.getQueued();
    }
};
function snapshotParserState8570() {
    return {
        index: index8414,
        lineNumber: lineNumber8415,
        lineStart: lineStart8416
    };
}
function restoreParserState8571(prevState9211) {
    index8414 = prevState9211.index;
    lineNumber8415 = prevState9211.lineNumber;
    lineStart8416 = prevState9211.lineStart;
}
function suppressReadError8572(func9212) {
    var prevState9213 = snapshotParserState8570();
    try {
        return func9212();
    } catch (e9214) {
        if (!(e9214 instanceof SyntaxError) && !(e9214 instanceof TypeError)) {
            restoreParserState8571(prevState9213);
            return null;
        }
        throw e9214;
    }
}
function makeIdentifier8573(value9215, opts9216) {
    opts9216 = opts9216 || {};
    var type9217 = Token8403.Identifier;
    if (isKeyword8442(value9215)) {
        type9217 = Token8403.Keyword;
    } else if (value9215 === "null") {
        type9217 = Token8403.NullLiteral;
    } else if (value9215 === "true" || value9215 === "false") {
        type9217 = Token8403.BooleanLiteral;
    }
    return {
        type: type9217,
        value: value9215,
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [opts9216.start || index8414, index8414]
    };
}
function makePunctuator8574(value9218, opts9219) {
    opts9219 = opts9219 || {};
    return {
        type: Token8403.Punctuator,
        value: value9218,
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [opts9219.start || index8414, index8414]
    };
}
function makeStringLiteral8575(value9220, opts9221) {
    opts9221 = opts9221 || {};
    return {
        type: Token8403.StringLiteral,
        value: value9220,
        octal: !!opts9221.octal,
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [opts9221.start || index8414, index8414]
    };
}
function makeNumericLiteral8576(value9222, opts9223) {
    opts9223 = opts9223 || {};
    return {
        type: Token8403.NumericLiteral,
        value: value9222,
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [opts9223.start || index8414, index8414]
    };
}
function makeRegExp8577(value9224, opts9225) {
    opts9225 = opts9225 || {};
    return {
        type: Token8403.RegularExpression,
        value: value9224,
        literal: value9224.toString(),
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [opts9225.start || index8414, index8414]
    };
}
function makeDelimiter8578(value9226, inner9227) {
    var current9228 = {
        lineNumber: lineNumber8415,
        lineStart: lineStart8416,
        range: [index8414, index8414]
    };
    var firstTok9229 = inner9227.length ? inner9227[0] : current9228;
    var lastTok9230 = inner9227.length ? inner9227[inner9227.length - 1] : current9228;
    return {
        type: Token8403.Delimiter,
        value: value9226,
        inner: inner9227,
        startLineNumber: firstTok9229.lineNumber,
        startLineStart: firstTok9229.lineStart,
        startRange: firstTok9229.range,
        endLineNumber: lastTok9230.lineNumber,
        endLineStart: lastTok9230.lineStart,
        endRange: lastTok9230.range
    };
}
var // Since an actual parser object doesn't exist and we want to
// introduce our own API anyway, we create a special reader object
// for reader extensions
readerAPI8579 = Object.defineProperties({
    Token: Token8403,
    isIdentifierStart: isIdentifierStart8437,
    isIdentifierPart: isIdentifierPart8438,
    isLineTerminator: isLineTerminator8436,
    readIdentifier: scanIdentifier8448,
    readPunctuator: scanPunctuator8449,
    readStringLiteral: scanStringLiteral8453,
    readNumericLiteral: scanNumericLiteral8452,
    readRegExp: scanRegExp8456,
    readToken: function readToken() {
        return readToken8580([], false, false);
    },
    readDelimiter: function readDelimiter() {
        return readDelim8581([], false, false);
    },
    skipComment: scanComment8560,
    makeIdentifier: makeIdentifier8573,
    makePunctuator: makePunctuator8574,
    makeStringLiteral: makeStringLiteral8575,
    makeNumericLiteral: makeNumericLiteral8576,
    makeRegExp: makeRegExp8577,
    makeDelimiter: makeDelimiter8578,
    suppressReadError: suppressReadError8572,
    peekQueued: readtables8569.peekQueued,
    getQueued: readtables8569.getQueued
}, {
    source: {
        get: function () {
            return source8412;
        },
        enumerable: true,
        configurable: true
    },
    index: {
        get: function () {
            return index8414;
        },
        set: function (x) {
            index8414 = x;
        },
        enumerable: true,
        configurable: true
    },
    length: {
        get: function () {
            return length8421;
        },
        set: function (x) {
            length8421 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineNumber: {
        get: function () {
            return lineNumber8415;
        },
        set: function (x) {
            lineNumber8415 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineStart: {
        get: function () {
            return lineStart8416;
        },
        set: function (x) {
            lineStart8416 = x;
        },
        enumerable: true,
        configurable: true
    },
    extra: {
        get: function () {
            return extra8429;
        },
        enumerable: true,
        configurable: true
    }
});
readtables8569.readerAPI = readerAPI8579;
function readToken8580(toks9231, inExprDelim9232, parentIsBlock9233) {
    var delimiters9234 = ["(", "{", "["];
    var parenIdents9235 = ["if", "while", "for", "with"];
    var last9236 = toks9231.length - 1;
    var comments9237,
        commentsLen9238 = extra8429.comments.length;
    function back9239(n9245) {
        var idx9246 = toks9231.length - n9245 > 0 ? toks9231.length - n9245 : 0;
        return toks9231[idx9246];
    }
    function attachComments9240(token9247) {
        if (comments9237) {
            token9247.leadingComments = comments9237;
        }
        return token9247;
    }
    function _advance9241() {
        return attachComments9240(advance8459());
    }
    function _scanRegExp9242() {
        return attachComments9240(scanRegExp8456());
    }
    skipComment8443();
    var ch9243 = source8412[index8414];
    if (extra8429.comments.length > commentsLen9238) {
        comments9237 = extra8429.comments.slice(commentsLen9238);
    }
    if (isIn8431(source8412[index8414], delimiters9234)) {
        return attachComments9240(readDelim8581(toks9231, inExprDelim9232, parentIsBlock9233));
    }
    // Check if we should get the token from the readtable
    var readtableToken9244;
    if ((readtableToken9244 = readtables8569.getQueued()) || readtables8569.has(ch9243) && (readtableToken9244 = readtables8569.invoke(ch9243, toks9231))) {
        return readtableToken9244;
    }
    if (ch9243 === "/") {
        var prev9248 = back9239(1);
        if (prev9248) {
            if (prev9248.value === "()") {
                if (isIn8431(back9239(2).value, parenIdents9235)) {
                    // ... if (...) / ...
                    return _scanRegExp9242();
                }
                // ... (...) / ...
                return _advance9241();
            }
            if (prev9248.value === "{}") {
                if (blockAllowed8568(toks9231, 0, inExprDelim9232, parentIsBlock9233)) {
                    if (back9239(2).value === "()") {
                        if ( // named function
                        back9239(4).value === "function") {
                            if (!blockAllowed8568(toks9231, 3, inExprDelim9232, parentIsBlock9233)) {
                                // new function foo (...) {...} / ...
                                return _advance9241();
                            }
                            if (toks9231.length - 5 <= 0 && inExprDelim9232) {
                                // (function foo (...) {...} /...)
                                // [function foo (...) {...} /...]
                                return _advance9241();
                            }
                        }
                        if ( // unnamed function
                        back9239(3).value === "function") {
                            if (!blockAllowed8568(toks9231, 2, inExprDelim9232, parentIsBlock9233)) {
                                // new function (...) {...} / ...
                                return _advance9241();
                            }
                            if (toks9231.length - 4 <= 0 && inExprDelim9232) {
                                // (function (...) {...} /...)
                                // [function (...) {...} /...]
                                return _advance9241();
                            }
                        }
                    }
                    // ...; {...} /...
                    return _scanRegExp9242();
                } else {
                    // ... + {...} / ...
                    return _advance9241();
                }
            }
            if (prev9248.type === Token8403.Punctuator) {
                // ... + /...
                return _scanRegExp9242();
            }
            if (isKeyword8442(prev9248.value) && prev9248.value !== "this" && prev9248.value !== "let" && prev9248.value !== "export") {
                // typeof /...
                return _scanRegExp9242();
            }
            return _advance9241();
        }
        return _scanRegExp9242();
    }
    return _advance9241();
}
function readDelim8581(toks9249, inExprDelim9250, parentIsBlock9251) {
    var startDelim9252 = advance8459(),
        matchDelim9253 = {
        "(": ")",
        "{": "}",
        "[": "]"
    },
        inner9254 = [];
    var delimiters9255 = ["(", "{", "["];
    assert8430(delimiters9255.indexOf(startDelim9252.value) !== -1, "Need to begin at the delimiter");
    var token9256 = startDelim9252;
    var startLineNumber9257 = token9256.lineNumber;
    var startLineStart9258 = token9256.lineStart;
    var startRange9259 = token9256.range;
    var delimToken9260 = {};
    delimToken9260.type = Token8403.Delimiter;
    delimToken9260.value = startDelim9252.value + matchDelim9253[startDelim9252.value];
    delimToken9260.startLineNumber = startLineNumber9257;
    delimToken9260.startLineStart = startLineStart9258;
    delimToken9260.startRange = startRange9259;
    var delimIsBlock9261 = false;
    if (startDelim9252.value === "{") {
        delimIsBlock9261 = blockAllowed8568(toks9249.concat(delimToken9260), 0, inExprDelim9250, parentIsBlock9251);
    }
    while (index8414 <= length8421) {
        token9256 = readToken8580(inner9254, startDelim9252.value === "(" || startDelim9252.value === "[", delimIsBlock9261);
        if (token9256.type === Token8403.Punctuator && token9256.value === matchDelim9253[startDelim9252.value]) {
            if (token9256.leadingComments) {
                delimToken9260.trailingComments = token9256.leadingComments;
            }
            break;
        } else if (token9256.type === Token8403.EOF) {
            throwError8467({}, Messages8408.UnexpectedEOS);
        } else {
            inner9254.push(token9256);
        }
    }
    if ( // at the end of the stream but the very last char wasn't the closing delimiter
    index8414 >= length8421 && matchDelim9253[startDelim9252.value] !== source8412[length8421 - 1]) {
        throwError8467({}, Messages8408.UnexpectedEOS);
    }
    var endLineNumber9262 = token9256.lineNumber;
    var endLineStart9263 = token9256.lineStart;
    var endRange9264 = token9256.range;
    delimToken9260.inner = inner9254;
    delimToken9260.endLineNumber = endLineNumber9262;
    delimToken9260.endLineStart = endLineStart9263;
    delimToken9260.endRange = endRange9264;
    return delimToken9260;
}
function setReadtable8582(readtable9265, syn9266) {
    readtables8569.currentReadtable = readtable9265;
    if (syn9266) {
        readtables8569.readerAPI.throwSyntaxError = function (name9267, message9268, tok9269) {
            var sx9270 = syn9266.syntaxFromToken(tok9269);
            var err9271 = new syn9266.MacroSyntaxError(name9267, message9268, sx9270);
            throw new SyntaxError(syn9266.printSyntaxError(source8412, err9271));
        };
    }
}
function currentReadtable8583() {
    return readtables8569.currentReadtable;
}
function read8584(code9272) {
    var token9273,
        tokenTree9274 = [];
    extra8429 = {};
    extra8429.comments = [];
    extra8429.range = true;
    extra8429.loc = true;
    patch8564();
    source8412 = code9272;
    index8414 = 0;
    lineNumber8415 = source8412.length > 0 ? 1 : 0;
    lineStart8416 = 0;
    length8421 = source8412.length;
    state8427 = {
        allowIn: true,
        labelSet: {},
        lastParenthesized: null,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false
    };
    while (index8414 < length8421 || readtables8569.peekQueued()) {
        tokenTree9274.push(readToken8580(tokenTree9274, false, false));
    }
    var last9275 = tokenTree9274[tokenTree9274.length - 1];
    if (last9275 && last9275.type !== Token8403.EOF) {
        tokenTree9274.push({
            type: Token8403.EOF,
            value: "",
            lineNumber: last9275.lineNumber,
            lineStart: last9275.lineStart,
            range: [index8414, index8414]
        });
    }
    return expander8402.tokensToSyntax(tokenTree9274);
}
function parse8585(code9276, options9277) {
    var program9278, toString9279;
    extra8429 = {};
    if ( // given an array of tokens instead of a string
    Array.isArray(code9276)) {
        tokenStream8423 = code9276;
        length8421 = tokenStream8423.length;
        lineNumber8415 = tokenStream8423.length > 0 ? 1 : 0;
        source8412 = undefined;
    } else {
        toString9279 = String;
        if (typeof code9276 !== "string" && !(code9276 instanceof String)) {
            code9276 = toString9279(code9276);
        }
        source8412 = code9276;
        length8421 = source8412.length;
        lineNumber8415 = source8412.length > 0 ? 1 : 0;
    }
    delegate8422 = SyntaxTreeDelegate8410;
    streamIndex8424 = -1;
    index8414 = 0;
    lineStart8416 = 0;
    sm_lineStart8418 = 0;
    sm_lineNumber8417 = lineNumber8415;
    sm_index8420 = 0;
    sm_range8419 = [0, 0];
    lookahead8425 = null;
    phase8428 = options9277 && typeof options9277.phase !== "undefined" ? options9277.phase : 0;
    state8427 = {
        allowKeyword: false,
        allowIn: true,
        labelSet: {},
        parenthesizedCount: 0,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        yieldAllowed: false
    };
    extra8429.attachComment = true;
    extra8429.range = true;
    extra8429.comments = [];
    extra8429.bottomRightStack = [];
    extra8429.trailingComments = [];
    extra8429.leadingComments = [];
    if (typeof options9277 !== "undefined") {
        extra8429.range = typeof options9277.range === "boolean" && options9277.range;
        extra8429.loc = typeof options9277.loc === "boolean" && options9277.loc;
        extra8429.attachComment = typeof options9277.attachComment === "boolean" && options9277.attachComment;
        if (extra8429.loc && options9277.source !== null && options9277.source !== undefined) {
            delegate8422 = extend8566(delegate8422, {
                postProcess: function (node9280) {
                    node9280.loc.source = toString9279(options9277.source);
                    return node9280;
                }
            });
        }
        if (typeof options9277.tokens === "boolean" && options9277.tokens) {
            extra8429.tokens = [];
        }
        if (typeof options9277.comment === "boolean" && options9277.comment) {
            extra8429.comments = [];
        }
        if (typeof options9277.tolerant === "boolean" && options9277.tolerant) {
            extra8429.errors = [];
        }
    }
    if (length8421 > 0) {
        if (source8412 && typeof source8412[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9276 instanceof String) {
                source8412 = code9276.valueOf();
            }
        }
    }
    extra8429.loc = true;
    extra8429.errors = [];
    patch8564();
    try {
        program9278 = parseProgram8558();
        if (typeof extra8429.comments !== "undefined") {
            program9278.comments = extra8429.comments;
        }
        if (typeof extra8429.tokens !== "undefined") {
            filterTokenLocation8563();
            program9278.tokens = extra8429.tokens;
        }
        if (typeof extra8429.errors !== "undefined") {
            program9278.errors = extra8429.errors;
        }
    } catch (e9281) {
        throw e9281;
    } finally {
        unpatch8565();
        extra8429 = {};
    }
    return program9278;
}
exports.tokenize = tokenize8567;
exports.read = read8584;
exports.Token = Token8403;
exports.setReadtable = setReadtable8582;
exports.currentReadtable = currentReadtable8583;
exports.parse = parse8585;
// Deep copy.
exports.Syntax = (function () {
    var name9282,
        types9283 = {};
    if (typeof Object.create === "function") {
        types9283 = Object.create(null);
    }
    for (name9282 in Syntax8406) {
        if (Syntax8406.hasOwnProperty(name9282)) {
            types9283[name9282] = Syntax8406[name9282];
        }
    }
    if (typeof Object.freeze === "function") {
        Object.freeze(types9283);
    }
    return types9283;
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