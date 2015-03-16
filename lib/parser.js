"use strict";

var expander8450 = require("./expander");
var Token8451, TokenName8452, FnExprTokens8453, Syntax8454, PropertyKind8455, Messages8456, Regex8457, SyntaxTreeDelegate8458, ClassPropertyType8459, source8460, strict8461, index8462, lineNumber8463, lineStart8464, sm_lineNumber8465, sm_lineStart8466, sm_range8467, sm_index8468, length8469, delegate8470, tokenStream8471, streamIndex8472, lookahead8473, lookaheadIndex8474, state8475, phase8476, extra8477;
Token8451 = {
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
TokenName8452 = {};
TokenName8452[Token8451.BooleanLiteral] = "Boolean";
TokenName8452[Token8451.EOF] = "<end>";
TokenName8452[Token8451.Identifier] = "Identifier";
TokenName8452[Token8451.Keyword] = "Keyword";
TokenName8452[Token8451.NullLiteral] = "Null";
TokenName8452[Token8451.NumericLiteral] = "Numeric";
TokenName8452[Token8451.Punctuator] = "Punctuator";
TokenName8452[Token8451.StringLiteral] = "String";
TokenName8452[Token8451.RegularExpression] = "RegularExpression";
TokenName8452[Token8451.Delimiter] = "Delimiter";
// A function following one of those tokens is an expression.
FnExprTokens8453 = ["(", "{", "[", "in", "typeof", "instanceof", "new", "return", "case", "delete", "throw", "void",
// assignment operators
"=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ",",
// binary/unary operators
"+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!=="];
Syntax8454 = {
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
PropertyKind8455 = {
    Data: 1,
    Get: 2,
    Set: 4
};
ClassPropertyType8459 = {
    "static": "static",
    prototype: "prototype"
};
// Error messages should be identical to V8.
Messages8456 = {
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
Regex8457 = {
    NonAsciiIdentifierStart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),
    NonAsciiIdentifierPart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")
};
function assert8478(condition8635, message8636) {
    if (!condition8635) {
        throw new Error("ASSERT: " + message8636);
    }
}
function isIn8479(el8637, list8638) {
    return list8638.indexOf(el8637) !== -1;
}
function isDecimalDigit8480(ch8639) {
    return ch8639 >= 48 && ch8639 <= 57;
}
function isHexDigit8481(ch8640) {
    return "0123456789abcdefABCDEF".indexOf(ch8640) >= 0;
}
function isOctalDigit8482(ch8641) {
    return "01234567".indexOf(ch8641) >= 0;
}
function isWhiteSpace8483(ch8642) {
    return ch8642 === 32 || // space
    ch8642 === 9 || // tab
    ch8642 === 11 || ch8642 === 12 || ch8642 === 160 || ch8642 >= 5760 && " ᠎             　﻿".indexOf(String.fromCharCode(ch8642)) > 0;
}
function isLineTerminator8484(ch8643) {
    return ch8643 === 10 || ch8643 === 13 || ch8643 === 8232 || ch8643 === 8233;
}
function isIdentifierStart8485(ch8644) {
    return ch8644 === 36 || ch8644 === 95 || // $ (dollar) and _ (underscore)
    ch8644 >= 65 && ch8644 <= 90 || // A..Z
    ch8644 >= 97 && ch8644 <= 122 || // a..z
    ch8644 === 92 || // \ (backslash)
    ch8644 >= 128 && Regex8457.NonAsciiIdentifierStart.test(String.fromCharCode(ch8644));
}
function isIdentifierPart8486(ch8645) {
    return ch8645 === 36 || ch8645 === 95 || // $ (dollar) and _ (underscore)
    ch8645 >= 65 && ch8645 <= 90 || // A..Z
    ch8645 >= 97 && ch8645 <= 122 || // a..z
    ch8645 >= 48 && ch8645 <= 57 || // 0..9
    ch8645 === 92 || // \ (backslash)
    ch8645 >= 128 && Regex8457.NonAsciiIdentifierPart.test(String.fromCharCode(ch8645));
}
function isFutureReservedWord8487(id8646) {
    switch (id8646) {
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
function isStrictModeReservedWord8488(id8647) {
    switch (id8647) {
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
function isRestrictedWord8489(id8648) {
    return id8648 === "eval" || id8648 === "arguments";
}
function isKeyword8490(id8649) {
    if (strict8461 && isStrictModeReservedWord8488(id8649)) {
        return true;
    }
    switch ( // 'const' is specialized as Keyword in V8.
    // 'yield' is only treated as a keyword in strict mode.
    // 'let' is for compatiblity with SpiderMonkey and ES.next.
    // Some others are from future reserved words.
    id8649.length) {
        case 2:
            return id8649 === "if" || id8649 === "in" || id8649 === "do";
        case 3:
            return id8649 === "var" || id8649 === "for" || id8649 === "new" || id8649 === "try" || id8649 === "let";
        case 4:
            return id8649 === "this" || id8649 === "else" || id8649 === "case" || id8649 === "void" || id8649 === "with" || id8649 === "enum";
        case 5:
            return id8649 === "while" || id8649 === "break" || id8649 === "catch" || id8649 === "throw" || id8649 === "const" || id8649 === "class" || id8649 === "super";
        case 6:
            return id8649 === "return" || id8649 === "typeof" || id8649 === "delete" || id8649 === "switch" || id8649 === "export" || id8649 === "import";
        case 7:
            return id8649 === "default" || id8649 === "finally" || id8649 === "extends";
        case 8:
            return id8649 === "function" || id8649 === "continue" || id8649 === "debugger";
        case 10:
            return id8649 === "instanceof";
        default:
            return false;
    }
}
function skipComment8491() {
    var ch8650, blockComment8651, lineComment8652;
    blockComment8651 = false;
    lineComment8652 = false;
    while (index8462 < length8469) {
        ch8650 = source8460.charCodeAt(index8462);
        if (lineComment8652) {
            ++index8462;
            if (isLineTerminator8484(ch8650)) {
                lineComment8652 = false;
                if (ch8650 === 13 && source8460.charCodeAt(index8462) === 10) {
                    ++index8462;
                }
                ++lineNumber8463;
                lineStart8464 = index8462;
            }
        } else if (blockComment8651) {
            if (isLineTerminator8484(ch8650)) {
                if (ch8650 === 13 && source8460.charCodeAt(index8462 + 1) === 10) {
                    ++index8462;
                }
                ++lineNumber8463;
                ++index8462;
                lineStart8464 = index8462;
                if (index8462 >= length8469) {
                    throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch8650 = source8460.charCodeAt(index8462++);
                if (index8462 >= length8469) {
                    throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
                }
                if ( // Block comment ends with '*/' (char #42, char #47).
                ch8650 === 42) {
                    ch8650 = source8460.charCodeAt(index8462);
                    if (ch8650 === 47) {
                        ++index8462;
                        blockComment8651 = false;
                    }
                }
            }
        } else if (ch8650 === 47) {
            ch8650 = source8460.charCodeAt(index8462 + 1);
            if ( // Line comment starts with '//' (char #47, char #47).
            ch8650 === 47) {
                index8462 += 2;
                lineComment8652 = true;
            } else if (ch8650 === 42) {
                // Block comment starts with '/*' (char #47, char #42).
                index8462 += 2;
                blockComment8651 = true;
                if (index8462 >= length8469) {
                    throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8483(ch8650)) {
            ++index8462;
        } else if (isLineTerminator8484(ch8650)) {
            ++index8462;
            if (ch8650 === 13 && source8460.charCodeAt(index8462) === 10) {
                ++index8462;
            }
            ++lineNumber8463;
            lineStart8464 = index8462;
        } else {
            break;
        }
    }
}
function scanHexEscape8492(prefix8653) {
    var i8654,
        len8655,
        ch8656,
        code8657 = 0;
    len8655 = prefix8653 === "u" ? 4 : 2;
    for (i8654 = 0; i8654 < len8655; ++i8654) {
        if (index8462 < length8469 && isHexDigit8481(source8460[index8462])) {
            ch8656 = source8460[index8462++];
            code8657 = code8657 * 16 + "0123456789abcdef".indexOf(ch8656.toLowerCase());
        } else {
            return "";
        }
    }
    return String.fromCharCode(code8657);
}
function scanUnicodeCodePointEscape8493() {
    var ch8658, code8659, cu18660, cu28661;
    ch8658 = source8460[index8462];
    code8659 = 0;
    if ( // At least, one hex digit is required.
    ch8658 === "}") {
        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
    }
    while (index8462 < length8469) {
        ch8658 = source8460[index8462++];
        if (!isHexDigit8481(ch8658)) {
            break;
        }
        code8659 = code8659 * 16 + "0123456789abcdef".indexOf(ch8658.toLowerCase());
    }
    if (code8659 > 1114111 || ch8658 !== "}") {
        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
    }
    if ( // UTF-16 Encoding
    code8659 <= 65535) {
        return String.fromCharCode(code8659);
    }
    cu18660 = (code8659 - 65536 >> 10) + 55296;
    cu28661 = (code8659 - 65536 & 1023) + 56320;
    return String.fromCharCode(cu18660, cu28661);
}
function getEscapedIdentifier8494() {
    var ch8662, id8663;
    ch8662 = source8460.charCodeAt(index8462++);
    id8663 = String.fromCharCode(ch8662);
    if ( // '\u' (char #92, char #117) denotes an escaped character.
    ch8662 === 92) {
        if (source8460.charCodeAt(index8462) !== 117) {
            throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
        }
        ++index8462;
        ch8662 = scanHexEscape8492("u");
        if (!ch8662 || ch8662 === "\\" || !isIdentifierStart8485(ch8662.charCodeAt(0))) {
            throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
        }
        id8663 = ch8662;
    }
    while (index8462 < length8469) {
        ch8662 = source8460.charCodeAt(index8462);
        if (!isIdentifierPart8486(ch8662)) {
            break;
        }
        ++index8462;
        id8663 += String.fromCharCode(ch8662);
        if ( // '\u' (char #92, char #117) denotes an escaped character.
        ch8662 === 92) {
            id8663 = id8663.substr(0, id8663.length - 1);
            if (source8460.charCodeAt(index8462) !== 117) {
                throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
            }
            ++index8462;
            ch8662 = scanHexEscape8492("u");
            if (!ch8662 || ch8662 === "\\" || !isIdentifierPart8486(ch8662.charCodeAt(0))) {
                throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
            }
            id8663 += ch8662;
        }
    }
    return id8663;
}
function getIdentifier8495() {
    var start8664, ch8665;
    start8664 = index8462++;
    while (index8462 < length8469) {
        ch8665 = source8460.charCodeAt(index8462);
        if (ch8665 === 92) {
            // Blackslash (char #92) marks Unicode escape sequence.
            index8462 = start8664;
            return getEscapedIdentifier8494();
        }
        if (isIdentifierPart8486(ch8665)) {
            ++index8462;
        } else {
            break;
        }
    }
    return source8460.slice(start8664, index8462);
}
function scanIdentifier8496() {
    var start8666, id8667, type8668;
    start8666 = index8462;
    // Backslash (char #92) starts an escaped character.
    id8667 = source8460.charCodeAt(index8462) === 92 ? getEscapedIdentifier8494() : getIdentifier8495();
    if ( // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    id8667.length === 1) {
        type8668 = Token8451.Identifier;
    } else if (isKeyword8490(id8667)) {
        type8668 = Token8451.Keyword;
    } else if (id8667 === "null") {
        type8668 = Token8451.NullLiteral;
    } else if (id8667 === "true" || id8667 === "false") {
        type8668 = Token8451.BooleanLiteral;
    } else {
        type8668 = Token8451.Identifier;
    }
    return {
        type: type8668,
        value: id8667,
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [start8666, index8462]
    };
}
function scanPunctuator8497() {
    var start8669 = index8462,
        code8670 = source8460.charCodeAt(index8462),
        code28671,
        ch18672 = source8460[index8462],
        ch28673,
        ch38674,
        ch48675;
    switch (code8670) {
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
            ++index8462;
            if (extra8477.tokenize) {
                if (code8670 === 40) {
                    extra8477.openParenToken = extra8477.tokens.length;
                } else if (code8670 === 123) {
                    extra8477.openCurlyToken = extra8477.tokens.length;
                }
            }
            return {
                type: Token8451.Punctuator,
                value: String.fromCharCode(code8670),
                lineNumber: lineNumber8463,
                lineStart: lineStart8464,
                range: [start8669, index8462]
            };
        default:
            code28671 = source8460.charCodeAt(index8462 + 1);
            if ( // '=' (char #61) marks an assignment or comparison operator.
            code28671 === 61) {
                switch (code8670) {
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
                        index8462 += 2;
                        return {
                            type: Token8451.Punctuator,
                            value: String.fromCharCode(code8670) + String.fromCharCode(code28671),
                            lineNumber: lineNumber8463,
                            lineStart: lineStart8464,
                            range: [start8669, index8462]
                        };
                    case 33:
                    case // !
                    61:
                        // =
                        index8462 += 2;
                        if ( // !== and ===
                        source8460.charCodeAt(index8462) === 61) {
                            ++index8462;
                        }
                        return {
                            type: Token8451.Punctuator,
                            value: source8460.slice(start8669, index8462),
                            lineNumber: lineNumber8463,
                            lineStart: lineStart8464,
                            range: [start8669, index8462]
                        };
                    default:
                        break;
                }
            }
            break;
    }
    // Peek more characters.
    ch28673 = source8460[index8462 + 1];
    ch38674 = source8460[index8462 + 2];
    ch48675 = source8460[index8462 + 3];
    if ( // 4-character punctuator: >>>=
    ch18672 === ">" && ch28673 === ">" && ch38674 === ">") {
        if (ch48675 === "=") {
            index8462 += 4;
            return {
                type: Token8451.Punctuator,
                value: ">>>=",
                lineNumber: lineNumber8463,
                lineStart: lineStart8464,
                range: [start8669, index8462]
            };
        }
    }
    if ( // 3-character punctuators: === !== >>> <<= >>=
    ch18672 === ">" && ch28673 === ">" && ch38674 === ">") {
        index8462 += 3;
        return {
            type: Token8451.Punctuator,
            value: ">>>",
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [start8669, index8462]
        };
    }
    if (ch18672 === "<" && ch28673 === "<" && ch38674 === "=") {
        index8462 += 3;
        return {
            type: Token8451.Punctuator,
            value: "<<=",
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [start8669, index8462]
        };
    }
    if (ch18672 === ">" && ch28673 === ">" && ch38674 === "=") {
        index8462 += 3;
        return {
            type: Token8451.Punctuator,
            value: ">>=",
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [start8669, index8462]
        };
    }
    if (ch18672 === "." && ch28673 === "." && ch38674 === ".") {
        index8462 += 3;
        return {
            type: Token8451.Punctuator,
            value: "...",
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [start8669, index8462]
        };
    }
    if ( // Other 2-character punctuators: ++ -- << >> && ||
    ch18672 === ch28673 && "+-<>&|".indexOf(ch18672) >= 0) {
        index8462 += 2;
        return {
            type: Token8451.Punctuator,
            value: ch18672 + ch28673,
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [start8669, index8462]
        };
    }
    if (ch18672 === "=" && ch28673 === ">") {
        index8462 += 2;
        return {
            type: Token8451.Punctuator,
            value: "=>",
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [start8669, index8462]
        };
    }
    if ("<>=!+-*%&|^/".indexOf(ch18672) >= 0) {
        ++index8462;
        return {
            type: Token8451.Punctuator,
            value: ch18672,
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [start8669, index8462]
        };
    }
    if (ch18672 === ".") {
        ++index8462;
        return {
            type: Token8451.Punctuator,
            value: ch18672,
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [start8669, index8462]
        };
    }
    throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
}
function scanHexLiteral8498(start8676) {
    var number8677 = "";
    while (index8462 < length8469) {
        if (!isHexDigit8481(source8460[index8462])) {
            break;
        }
        number8677 += source8460[index8462++];
    }
    if (number8677.length === 0) {
        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8485(source8460.charCodeAt(index8462))) {
        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8451.NumericLiteral,
        value: parseInt("0x" + number8677, 16),
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [start8676, index8462]
    };
}
function scanOctalLiteral8499(prefix8678, start8679) {
    var number8680, octal8681;
    if (isOctalDigit8482(prefix8678)) {
        octal8681 = true;
        number8680 = "0" + source8460[index8462++];
    } else {
        octal8681 = false;
        ++index8462;
        number8680 = "";
    }
    while (index8462 < length8469) {
        if (!isOctalDigit8482(source8460[index8462])) {
            break;
        }
        number8680 += source8460[index8462++];
    }
    if (!octal8681 && number8680.length === 0) {
        // only 0o or 0O
        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8485(source8460.charCodeAt(index8462)) || isDecimalDigit8480(source8460.charCodeAt(index8462))) {
        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8451.NumericLiteral,
        value: parseInt(number8680, 8),
        octal: octal8681,
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [start8679, index8462]
    };
}
function scanNumericLiteral8500() {
    var number8682, start8683, ch8684, octal8685;
    ch8684 = source8460[index8462];
    assert8478(isDecimalDigit8480(ch8684.charCodeAt(0)) || ch8684 === ".", "Numeric literal must start with a decimal digit or a decimal point");
    start8683 = index8462;
    number8682 = "";
    if (ch8684 !== ".") {
        number8682 = source8460[index8462++];
        ch8684 = source8460[index8462];
        if ( // Hex number starts with '0x'.
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        // Binary number in ES6 starts with '0b'.
        number8682 === "0") {
            if (ch8684 === "x" || ch8684 === "X") {
                ++index8462;
                return scanHexLiteral8498(start8683);
            }
            if (ch8684 === "b" || ch8684 === "B") {
                ++index8462;
                number8682 = "";
                while (index8462 < length8469) {
                    ch8684 = source8460[index8462];
                    if (ch8684 !== "0" && ch8684 !== "1") {
                        break;
                    }
                    number8682 += source8460[index8462++];
                }
                if (number8682.length === 0) {
                    // only 0b or 0B
                    throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
                }
                if (index8462 < length8469) {
                    ch8684 = source8460.charCodeAt(index8462);
                    if (isIdentifierStart8485(ch8684) || isDecimalDigit8480(ch8684)) {
                        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
                    }
                }
                return {
                    type: Token8451.NumericLiteral,
                    value: parseInt(number8682, 2),
                    lineNumber: lineNumber8463,
                    lineStart: lineStart8464,
                    range: [start8683, index8462]
                };
            }
            if (ch8684 === "o" || ch8684 === "O" || isOctalDigit8482(ch8684)) {
                return scanOctalLiteral8499(ch8684, start8683);
            }
            if ( // decimal number starts with '0' such as '09' is illegal.
            ch8684 && isDecimalDigit8480(ch8684.charCodeAt(0))) {
                throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
            }
        }
        while (isDecimalDigit8480(source8460.charCodeAt(index8462))) {
            number8682 += source8460[index8462++];
        }
        ch8684 = source8460[index8462];
    }
    if (ch8684 === ".") {
        number8682 += source8460[index8462++];
        while (isDecimalDigit8480(source8460.charCodeAt(index8462))) {
            number8682 += source8460[index8462++];
        }
        ch8684 = source8460[index8462];
    }
    if (ch8684 === "e" || ch8684 === "E") {
        number8682 += source8460[index8462++];
        ch8684 = source8460[index8462];
        if (ch8684 === "+" || ch8684 === "-") {
            number8682 += source8460[index8462++];
        }
        if (isDecimalDigit8480(source8460.charCodeAt(index8462))) {
            while (isDecimalDigit8480(source8460.charCodeAt(index8462))) {
                number8682 += source8460[index8462++];
            }
        } else {
            throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
        }
    }
    if (isIdentifierStart8485(source8460.charCodeAt(index8462))) {
        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8451.NumericLiteral,
        value: parseFloat(number8682),
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [start8683, index8462]
    };
}
function scanStringLiteral8501() {
    var str8686 = "",
        quote8687,
        start8688,
        ch8689,
        code8690,
        unescaped8691,
        restore8692,
        octal8693 = false;
    quote8687 = source8460[index8462];
    assert8478(quote8687 === "'" || quote8687 === "\"", "String literal must starts with a quote");
    start8688 = index8462;
    ++index8462;
    while (index8462 < length8469) {
        ch8689 = source8460[index8462++];
        if (ch8689 === quote8687) {
            quote8687 = "";
            break;
        } else if (ch8689 === "\\") {
            ch8689 = source8460[index8462++];
            if (!ch8689 || !isLineTerminator8484(ch8689.charCodeAt(0))) {
                switch (ch8689) {
                    case "n":
                        str8686 += "\n";
                        break;
                    case "r":
                        str8686 += "\r";
                        break;
                    case "t":
                        str8686 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8460[index8462] === "{") {
                            ++index8462;
                            str8686 += scanUnicodeCodePointEscape8493();
                        } else {
                            restore8692 = index8462;
                            unescaped8691 = scanHexEscape8492(ch8689);
                            if (unescaped8691) {
                                str8686 += unescaped8691;
                            } else {
                                index8462 = restore8692;
                                str8686 += ch8689;
                            }
                        }
                        break;
                    case "b":
                        str8686 += "\b";
                        break;
                    case "f":
                        str8686 += "\f";
                        break;
                    case "v":
                        str8686 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8482(ch8689)) {
                            code8690 = "01234567".indexOf(ch8689);
                            if ( // \0 is not octal escape sequence
                            code8690 !== 0) {
                                octal8693 = true;
                            }
                            if (index8462 < length8469 && isOctalDigit8482(source8460[index8462])) {
                                octal8693 = true;
                                code8690 = code8690 * 8 + "01234567".indexOf(source8460[index8462++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8689) >= 0 && index8462 < length8469 && isOctalDigit8482(source8460[index8462])) {
                                    code8690 = code8690 * 8 + "01234567".indexOf(source8460[index8462++]);
                                }
                            }
                            str8686 += String.fromCharCode(code8690);
                        } else {
                            str8686 += ch8689;
                        }
                        break;
                }
            } else {
                ++lineNumber8463;
                if (ch8689 === "\r" && source8460[index8462] === "\n") {
                    ++index8462;
                }
                lineStart8464 = index8462;
            }
        } else if (isLineTerminator8484(ch8689.charCodeAt(0))) {
            break;
        } else {
            str8686 += ch8689;
        }
    }
    if (quote8687 !== "") {
        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8451.StringLiteral,
        value: str8686,
        octal: octal8693,
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [start8688, index8462]
    };
}
function scanTemplate8502() {
    var cooked8694 = "",
        ch8695,
        start8696,
        terminated8697,
        tail8698,
        restore8699,
        unescaped8700,
        code8701,
        octal8702;
    terminated8697 = false;
    tail8698 = false;
    start8696 = index8462;
    ++index8462;
    while (index8462 < length8469) {
        ch8695 = source8460[index8462++];
        if (ch8695 === "`") {
            tail8698 = true;
            terminated8697 = true;
            break;
        } else if (ch8695 === "$") {
            if (source8460[index8462] === "{") {
                ++index8462;
                terminated8697 = true;
                break;
            }
            cooked8694 += ch8695;
        } else if (ch8695 === "\\") {
            ch8695 = source8460[index8462++];
            if (!isLineTerminator8484(ch8695.charCodeAt(0))) {
                switch (ch8695) {
                    case "n":
                        cooked8694 += "\n";
                        break;
                    case "r":
                        cooked8694 += "\r";
                        break;
                    case "t":
                        cooked8694 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8460[index8462] === "{") {
                            ++index8462;
                            cooked8694 += scanUnicodeCodePointEscape8493();
                        } else {
                            restore8699 = index8462;
                            unescaped8700 = scanHexEscape8492(ch8695);
                            if (unescaped8700) {
                                cooked8694 += unescaped8700;
                            } else {
                                index8462 = restore8699;
                                cooked8694 += ch8695;
                            }
                        }
                        break;
                    case "b":
                        cooked8694 += "\b";
                        break;
                    case "f":
                        cooked8694 += "\f";
                        break;
                    case "v":
                        cooked8694 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8482(ch8695)) {
                            code8701 = "01234567".indexOf(ch8695);
                            if ( // \0 is not octal escape sequence
                            code8701 !== 0) {
                                octal8702 = true;
                            }
                            if (index8462 < length8469 && isOctalDigit8482(source8460[index8462])) {
                                octal8702 = true;
                                code8701 = code8701 * 8 + "01234567".indexOf(source8460[index8462++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8695) >= 0 && index8462 < length8469 && isOctalDigit8482(source8460[index8462])) {
                                    code8701 = code8701 * 8 + "01234567".indexOf(source8460[index8462++]);
                                }
                            }
                            cooked8694 += String.fromCharCode(code8701);
                        } else {
                            cooked8694 += ch8695;
                        }
                        break;
                }
            } else {
                ++lineNumber8463;
                if (ch8695 === "\r" && source8460[index8462] === "\n") {
                    ++index8462;
                }
                lineStart8464 = index8462;
            }
        } else if (isLineTerminator8484(ch8695.charCodeAt(0))) {
            ++lineNumber8463;
            if (ch8695 === "\r" && source8460[index8462] === "\n") {
                ++index8462;
            }
            lineStart8464 = index8462;
            cooked8694 += "\n";
        } else {
            cooked8694 += ch8695;
        }
    }
    if (!terminated8697) {
        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8451.Template,
        value: {
            cooked: cooked8694,
            raw: source8460.slice(start8696 + 1, index8462 - (tail8698 ? 1 : 2))
        },
        tail: tail8698,
        octal: octal8702,
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [start8696, index8462]
    };
}
function scanTemplateElement8503(option8703) {
    var startsWith8704, template8705;
    lookahead8473 = null;
    skipComment8491();
    startsWith8704 = option8703.head ? "`" : "}";
    if (source8460[index8462] !== startsWith8704) {
        throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
    }
    template8705 = scanTemplate8502();
    peek8509();
    return template8705;
}
function scanRegExp8504() {
    var str8706,
        ch8707,
        start8708,
        pattern8709,
        flags8710,
        value8711,
        classMarker8712 = false,
        restore8713,
        terminated8714 = false;
    lookahead8473 = null;
    skipComment8491();
    start8708 = index8462;
    ch8707 = source8460[index8462];
    assert8478(ch8707 === "/", "Regular expression literal must start with a slash");
    str8706 = source8460[index8462++];
    while (index8462 < length8469) {
        ch8707 = source8460[index8462++];
        str8706 += ch8707;
        if (classMarker8712) {
            if (ch8707 === "]") {
                classMarker8712 = false;
            }
        } else {
            if (ch8707 === "\\") {
                ch8707 = source8460[index8462++];
                if ( // ECMA-262 7.8.5
                isLineTerminator8484(ch8707.charCodeAt(0))) {
                    throwError8515({}, Messages8456.UnterminatedRegExp);
                }
                str8706 += ch8707;
            } else if (ch8707 === "/") {
                terminated8714 = true;
                break;
            } else if (ch8707 === "[") {
                classMarker8712 = true;
            } else if (isLineTerminator8484(ch8707.charCodeAt(0))) {
                throwError8515({}, Messages8456.UnterminatedRegExp);
            }
        }
    }
    if (!terminated8714) {
        throwError8515({}, Messages8456.UnterminatedRegExp);
    }
    // Exclude leading and trailing slash.
    pattern8709 = str8706.substr(1, str8706.length - 2);
    flags8710 = "";
    while (index8462 < length8469) {
        ch8707 = source8460[index8462];
        if (!isIdentifierPart8486(ch8707.charCodeAt(0))) {
            break;
        }
        ++index8462;
        if (ch8707 === "\\" && index8462 < length8469) {
            ch8707 = source8460[index8462];
            if (ch8707 === "u") {
                ++index8462;
                restore8713 = index8462;
                ch8707 = scanHexEscape8492("u");
                if (ch8707) {
                    flags8710 += ch8707;
                    for (str8706 += "\\u"; restore8713 < index8462; ++restore8713) {
                        str8706 += source8460[restore8713];
                    }
                } else {
                    index8462 = restore8713;
                    flags8710 += "u";
                    str8706 += "\\u";
                }
            } else {
                str8706 += "\\";
            }
        } else {
            flags8710 += ch8707;
            str8706 += ch8707;
        }
    }
    try {
        value8711 = new RegExp(pattern8709, flags8710);
    } catch (e8715) {
        throwError8515({}, Messages8456.InvalidRegExp);
    }
    if ( // peek();
    extra8477.tokenize) {
        return {
            type: Token8451.RegularExpression,
            value: value8711,
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [start8708, index8462]
        };
    }
    return {
        type: Token8451.RegularExpression,
        literal: str8706,
        value: value8711,
        range: [start8708, index8462]
    };
}
function isIdentifierName8505(token8716) {
    return token8716.type === Token8451.Identifier || token8716.type === Token8451.Keyword || token8716.type === Token8451.BooleanLiteral || token8716.type === Token8451.NullLiteral;
}
function advanceSlash8506() {
    var prevToken8717, checkToken8718;
    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design
    prevToken8717 = extra8477.tokens[extra8477.tokens.length - 1];
    if (!prevToken8717) {
        // Nothing before that: it cannot be a division.
        return scanRegExp8504();
    }
    if (prevToken8717.type === "Punctuator") {
        if (prevToken8717.value === ")") {
            checkToken8718 = extra8477.tokens[extra8477.openParenToken - 1];
            if (checkToken8718 && checkToken8718.type === "Keyword" && (checkToken8718.value === "if" || checkToken8718.value === "while" || checkToken8718.value === "for" || checkToken8718.value === "with")) {
                return scanRegExp8504();
            }
            return scanPunctuator8497();
        }
        if (prevToken8717.value === "}") {
            if ( // Dividing a function by anything makes little sense,
            // but we have to check for that.
            extra8477.tokens[extra8477.openCurlyToken - 3] && extra8477.tokens[extra8477.openCurlyToken - 3].type === "Keyword") {
                // Anonymous function.
                checkToken8718 = extra8477.tokens[extra8477.openCurlyToken - 4];
                if (!checkToken8718) {
                    return scanPunctuator8497();
                }
            } else if (extra8477.tokens[extra8477.openCurlyToken - 4] && extra8477.tokens[extra8477.openCurlyToken - 4].type === "Keyword") {
                // Named function.
                checkToken8718 = extra8477.tokens[extra8477.openCurlyToken - 5];
                if (!checkToken8718) {
                    return scanRegExp8504();
                }
            } else {
                return scanPunctuator8497();
            }
            if ( // checkToken determines whether the function is
            // a declaration or an expression.
            FnExprTokens8453.indexOf(checkToken8718.value) >= 0) {
                // It is an expression.
                return scanPunctuator8497();
            }
            // It is a declaration.
            return scanRegExp8504();
        }
        return scanRegExp8504();
    }
    if (prevToken8717.type === "Keyword") {
        return scanRegExp8504();
    }
    return scanPunctuator8497();
}
function advance8507() {
    var ch8719;
    skipComment8491();
    if (index8462 >= length8469) {
        return {
            type: Token8451.EOF,
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [index8462, index8462]
        };
    }
    ch8719 = source8460.charCodeAt(index8462);
    if ( // Very common: ( and ) and ;
    ch8719 === 40 || ch8719 === 41 || ch8719 === 58) {
        return scanPunctuator8497();
    }
    if ( // String literal starts with single quote (#39) or double quote (#34).
    ch8719 === 39 || ch8719 === 34) {
        return scanStringLiteral8501();
    }
    if (ch8719 === 96) {
        return scanTemplate8502();
    }
    if (isIdentifierStart8485(ch8719)) {
        return scanIdentifier8496();
    }
    if ( // # and @ are allowed for sweet.js
    ch8719 === 35 || ch8719 === 64) {
        ++index8462;
        return {
            type: Token8451.Punctuator,
            value: String.fromCharCode(ch8719),
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [index8462 - 1, index8462]
        };
    }
    if ( // Dot (.) char #46 can also start a floating-point number, hence the need
    // to check the next character.
    ch8719 === 46) {
        if (isDecimalDigit8480(source8460.charCodeAt(index8462 + 1))) {
            return scanNumericLiteral8500();
        }
        return scanPunctuator8497();
    }
    if (isDecimalDigit8480(ch8719)) {
        return scanNumericLiteral8500();
    }
    if ( // Slash (/) char #47 can also start a regex.
    extra8477.tokenize && ch8719 === 47) {
        return advanceSlash8506();
    }
    return scanPunctuator8497();
}
function lex8508() {
    var token8720;
    token8720 = lookahead8473;
    streamIndex8472 = lookaheadIndex8474;
    lineNumber8463 = token8720.lineNumber;
    lineStart8464 = token8720.lineStart;
    sm_lineNumber8465 = lookahead8473.sm_lineNumber;
    sm_lineStart8466 = lookahead8473.sm_lineStart;
    sm_range8467 = lookahead8473.sm_range;
    sm_index8468 = lookahead8473.sm_range[0];
    lookahead8473 = tokenStream8471[++streamIndex8472].token;
    lookaheadIndex8474 = streamIndex8472;
    index8462 = lookahead8473.range[0];
    if (token8720.leadingComments) {
        extra8477.comments = extra8477.comments.concat(token8720.leadingComments);
        extra8477.trailingComments = extra8477.trailingComments.concat(token8720.leadingComments);
        extra8477.leadingComments = extra8477.leadingComments.concat(token8720.leadingComments);
    }
    return token8720;
}
function peek8509() {
    lookaheadIndex8474 = streamIndex8472 + 1;
    if (lookaheadIndex8474 >= length8469) {
        lookahead8473 = {
            type: Token8451.EOF,
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [index8462, index8462]
        };
        return;
    }
    lookahead8473 = tokenStream8471[lookaheadIndex8474].token;
    index8462 = lookahead8473.range[0];
}
function lookahead28510() {
    var adv8721, pos8722, line8723, start8724, result8725;
    if (streamIndex8472 + 1 >= length8469 || streamIndex8472 + 2 >= length8469) {
        return {
            type: Token8451.EOF,
            lineNumber: lineNumber8463,
            lineStart: lineStart8464,
            range: [index8462, index8462]
        };
    }
    if ( // Scan for the next immediate token.
    lookahead8473 === null) {
        lookaheadIndex8474 = streamIndex8472 + 1;
        lookahead8473 = tokenStream8471[lookaheadIndex8474].token;
        index8462 = lookahead8473.range[0];
    }
    result8725 = tokenStream8471[lookaheadIndex8474 + 1].token;
    return result8725;
}
function markerCreate8511() {
    var sm_index8726 = lookahead8473 ? lookahead8473.sm_range[0] : 0;
    var sm_lineStart8727 = lookahead8473 ? lookahead8473.sm_lineStart : 0;
    var sm_lineNumber8728 = lookahead8473 ? lookahead8473.sm_lineNumber : 1;
    if (!extra8477.loc && !extra8477.range) {
        return undefined;
    }
    return {
        offset: sm_index8726,
        line: sm_lineNumber8728,
        col: sm_index8726 - sm_lineStart8727
    };
}
function processComment8512(node8729) {
    var lastChild8730,
        trailingComments8731,
        bottomRight8732 = extra8477.bottomRightStack,
        last8733 = bottomRight8732[bottomRight8732.length - 1];
    if (node8729.type === Syntax8454.Program) {
        if (node8729.body.length > 0) {
            return;
        }
    }
    if (extra8477.trailingComments.length > 0) {
        if (extra8477.trailingComments[0].range[0] >= node8729.range[1]) {
            trailingComments8731 = extra8477.trailingComments;
            extra8477.trailingComments = [];
        } else {
            extra8477.trailingComments.length = 0;
        }
    } else {
        if (last8733 && last8733.trailingComments && last8733.trailingComments[0].range[0] >= node8729.range[1]) {
            trailingComments8731 = last8733.trailingComments;
            delete last8733.trailingComments;
        }
    }
    if ( // Eating the stack.
    last8733) {
        while (last8733 && last8733.range[0] >= node8729.range[0]) {
            lastChild8730 = last8733;
            last8733 = bottomRight8732.pop();
        }
    }
    if (lastChild8730) {
        if (lastChild8730.leadingComments && lastChild8730.leadingComments[lastChild8730.leadingComments.length - 1].range[1] <= node8729.range[0]) {
            node8729.leadingComments = lastChild8730.leadingComments;
            delete lastChild8730.leadingComments;
        }
    } else if (extra8477.leadingComments.length > 0 && extra8477.leadingComments[extra8477.leadingComments.length - 1].range[1] <= node8729.range[0]) {
        node8729.leadingComments = extra8477.leadingComments;
        extra8477.leadingComments = [];
    }
    if (trailingComments8731) {
        node8729.trailingComments = trailingComments8731;
    }
    bottomRight8732.push(node8729);
}
function markerApply8513(marker8734, node8735) {
    if (extra8477.range) {
        node8735.range = [marker8734.offset, sm_index8468];
    }
    if (extra8477.loc) {
        node8735.loc = {
            start: {
                line: marker8734.line,
                column: marker8734.col
            },
            end: {
                line: sm_lineNumber8465,
                column: sm_index8468 - sm_lineStart8466
            }
        };
        node8735 = delegate8470.postProcess(node8735);
    }
    if (extra8477.attachComment) {
        processComment8512(node8735);
    }
    return node8735;
}
SyntaxTreeDelegate8458 = {
    name: "SyntaxTree",
    postProcess: function postProcess(node8736) {
        return node8736;
    },
    createArrayExpression: function createArrayExpression(elements8737) {
        return {
            type: Syntax8454.ArrayExpression,
            elements: elements8737
        };
    },
    createAssignmentExpression: function createAssignmentExpression(operator8738, left8739, right8740) {
        return {
            type: Syntax8454.AssignmentExpression,
            operator: operator8738,
            left: left8739,
            right: right8740
        };
    },
    createBinaryExpression: function createBinaryExpression(operator8741, left8742, right8743) {
        var type8744 = operator8741 === "||" || operator8741 === "&&" ? Syntax8454.LogicalExpression : Syntax8454.BinaryExpression;
        return {
            type: type8744,
            operator: operator8741,
            left: left8742,
            right: right8743
        };
    },
    createBlockStatement: function createBlockStatement(body8745) {
        return {
            type: Syntax8454.BlockStatement,
            body: body8745
        };
    },
    createBreakStatement: function createBreakStatement(label8746) {
        return {
            type: Syntax8454.BreakStatement,
            label: label8746
        };
    },
    createCallExpression: function createCallExpression(callee8747, args8748) {
        return {
            type: Syntax8454.CallExpression,
            callee: callee8747,
            arguments: args8748
        };
    },
    createCatchClause: function createCatchClause(param8749, body8750) {
        return {
            type: Syntax8454.CatchClause,
            param: param8749,
            body: body8750
        };
    },
    createConditionalExpression: function createConditionalExpression(test8751, consequent8752, alternate8753) {
        return {
            type: Syntax8454.ConditionalExpression,
            test: test8751,
            consequent: consequent8752,
            alternate: alternate8753
        };
    },
    createContinueStatement: function createContinueStatement(label8754) {
        return {
            type: Syntax8454.ContinueStatement,
            label: label8754
        };
    },
    createDebuggerStatement: function createDebuggerStatement() {
        return { type: Syntax8454.DebuggerStatement };
    },
    createDoWhileStatement: function createDoWhileStatement(body8755, test8756) {
        return {
            type: Syntax8454.DoWhileStatement,
            body: body8755,
            test: test8756
        };
    },
    createEmptyStatement: function createEmptyStatement() {
        return { type: Syntax8454.EmptyStatement };
    },
    createExpressionStatement: function createExpressionStatement(expression8757) {
        return {
            type: Syntax8454.ExpressionStatement,
            expression: expression8757
        };
    },
    createForStatement: function createForStatement(init8758, test8759, update8760, body8761) {
        return {
            type: Syntax8454.ForStatement,
            init: init8758,
            test: test8759,
            update: update8760,
            body: body8761
        };
    },
    createForInStatement: function createForInStatement(left8762, right8763, body8764) {
        return {
            type: Syntax8454.ForInStatement,
            left: left8762,
            right: right8763,
            body: body8764,
            each: false
        };
    },
    createForOfStatement: function createForOfStatement(left8765, right8766, body8767) {
        return {
            type: Syntax8454.ForOfStatement,
            left: left8765,
            right: right8766,
            body: body8767
        };
    },
    createFunctionDeclaration: function createFunctionDeclaration(id8768, params8769, defaults8770, body8771, rest8772, generator8773, expression8774) {
        return {
            type: Syntax8454.FunctionDeclaration,
            id: id8768,
            params: params8769,
            defaults: defaults8770,
            body: body8771,
            rest: rest8772,
            generator: generator8773,
            expression: expression8774
        };
    },
    createFunctionExpression: function createFunctionExpression(id8775, params8776, defaults8777, body8778, rest8779, generator8780, expression8781) {
        return {
            type: Syntax8454.FunctionExpression,
            id: id8775,
            params: params8776,
            defaults: defaults8777,
            body: body8778,
            rest: rest8779,
            generator: generator8780,
            expression: expression8781
        };
    },
    createIdentifier: function createIdentifier(name8782) {
        return {
            type: Syntax8454.Identifier,
            name: name8782
        };
    },
    createIfStatement: function createIfStatement(test8783, consequent8784, alternate8785) {
        return {
            type: Syntax8454.IfStatement,
            test: test8783,
            consequent: consequent8784,
            alternate: alternate8785
        };
    },
    createLabeledStatement: function createLabeledStatement(label8786, body8787) {
        return {
            type: Syntax8454.LabeledStatement,
            label: label8786,
            body: body8787
        };
    },
    createLiteral: function createLiteral(token8788) {
        return {
            type: Syntax8454.Literal,
            value: token8788.value,
            raw: String(token8788.value)
        };
    },
    createMemberExpression: function createMemberExpression(accessor8789, object8790, property8791) {
        return {
            type: Syntax8454.MemberExpression,
            computed: accessor8789 === "[",
            object: object8790,
            property: property8791
        };
    },
    createNewExpression: function createNewExpression(callee8792, args8793) {
        return {
            type: Syntax8454.NewExpression,
            callee: callee8792,
            arguments: args8793
        };
    },
    createObjectExpression: function createObjectExpression(properties8794) {
        return {
            type: Syntax8454.ObjectExpression,
            properties: properties8794
        };
    },
    createPostfixExpression: function createPostfixExpression(operator8795, argument8796) {
        return {
            type: Syntax8454.UpdateExpression,
            operator: operator8795,
            argument: argument8796,
            prefix: false
        };
    },
    createProgram: function createProgram(body8797) {
        return {
            type: Syntax8454.Program,
            body: body8797
        };
    },
    createProperty: function createProperty(kind8798, key8799, value8800, method8801, shorthand8802, computed8803) {
        return {
            type: Syntax8454.Property,
            key: key8799,
            value: value8800,
            kind: kind8798,
            method: method8801,
            shorthand: shorthand8802,
            computed: computed8803
        };
    },
    createReturnStatement: function createReturnStatement(argument8804) {
        return {
            type: Syntax8454.ReturnStatement,
            argument: argument8804
        };
    },
    createSequenceExpression: function createSequenceExpression(expressions8805) {
        return {
            type: Syntax8454.SequenceExpression,
            expressions: expressions8805
        };
    },
    createSwitchCase: function createSwitchCase(test8806, consequent8807) {
        return {
            type: Syntax8454.SwitchCase,
            test: test8806,
            consequent: consequent8807
        };
    },
    createSwitchStatement: function createSwitchStatement(discriminant8808, cases8809) {
        return {
            type: Syntax8454.SwitchStatement,
            discriminant: discriminant8808,
            cases: cases8809
        };
    },
    createThisExpression: function createThisExpression() {
        return { type: Syntax8454.ThisExpression };
    },
    createThrowStatement: function createThrowStatement(argument8810) {
        return {
            type: Syntax8454.ThrowStatement,
            argument: argument8810
        };
    },
    createTryStatement: function createTryStatement(block8811, guardedHandlers8812, handlers8813, finalizer8814) {
        return {
            type: Syntax8454.TryStatement,
            block: block8811,
            guardedHandlers: guardedHandlers8812,
            handlers: handlers8813,
            finalizer: finalizer8814
        };
    },
    createUnaryExpression: function createUnaryExpression(operator8815, argument8816) {
        if (operator8815 === "++" || operator8815 === "--") {
            return {
                type: Syntax8454.UpdateExpression,
                operator: operator8815,
                argument: argument8816,
                prefix: true
            };
        }
        return {
            type: Syntax8454.UnaryExpression,
            operator: operator8815,
            argument: argument8816,
            prefix: true
        };
    },
    createVariableDeclaration: function createVariableDeclaration(declarations8817, kind8818) {
        return {
            type: Syntax8454.VariableDeclaration,
            declarations: declarations8817,
            kind: kind8818
        };
    },
    createVariableDeclarator: function createVariableDeclarator(id8819, init8820) {
        return {
            type: Syntax8454.VariableDeclarator,
            id: id8819,
            init: init8820
        };
    },
    createWhileStatement: function createWhileStatement(test8821, body8822) {
        return {
            type: Syntax8454.WhileStatement,
            test: test8821,
            body: body8822
        };
    },
    createWithStatement: function createWithStatement(object8823, body8824) {
        return {
            type: Syntax8454.WithStatement,
            object: object8823,
            body: body8824
        };
    },
    createTemplateElement: function createTemplateElement(value8825, tail8826) {
        return {
            type: Syntax8454.TemplateElement,
            value: value8825,
            tail: tail8826
        };
    },
    createTemplateLiteral: function createTemplateLiteral(quasis8827, expressions8828) {
        return {
            type: Syntax8454.TemplateLiteral,
            quasis: quasis8827,
            expressions: expressions8828
        };
    },
    createSpreadElement: function createSpreadElement(argument8829) {
        return {
            type: Syntax8454.SpreadElement,
            argument: argument8829
        };
    },
    createTaggedTemplateExpression: function createTaggedTemplateExpression(tag8830, quasi8831) {
        return {
            type: Syntax8454.TaggedTemplateExpression,
            tag: tag8830,
            quasi: quasi8831
        };
    },
    createArrowFunctionExpression: function createArrowFunctionExpression(params8832, defaults8833, body8834, rest8835, expression8836) {
        return {
            type: Syntax8454.ArrowFunctionExpression,
            id: null,
            params: params8832,
            defaults: defaults8833,
            body: body8834,
            rest: rest8835,
            generator: false,
            expression: expression8836
        };
    },
    createMethodDefinition: function createMethodDefinition(propertyType8837, kind8838, key8839, value8840) {
        return {
            type: Syntax8454.MethodDefinition,
            key: key8839,
            value: value8840,
            kind: kind8838,
            "static": propertyType8837 === ClassPropertyType8459["static"]
        };
    },
    createClassBody: function createClassBody(body8841) {
        return {
            type: Syntax8454.ClassBody,
            body: body8841
        };
    },
    createClassExpression: function createClassExpression(id8842, superClass8843, body8844) {
        return {
            type: Syntax8454.ClassExpression,
            id: id8842,
            superClass: superClass8843,
            body: body8844
        };
    },
    createClassDeclaration: function createClassDeclaration(id8845, superClass8846, body8847) {
        return {
            type: Syntax8454.ClassDeclaration,
            id: id8845,
            superClass: superClass8846,
            body: body8847
        };
    },
    createExportSpecifier: function createExportSpecifier(id8848, name8849) {
        return {
            type: Syntax8454.ExportSpecifier,
            id: id8848,
            name: name8849
        };
    },
    createExportBatchSpecifier: function createExportBatchSpecifier() {
        return { type: Syntax8454.ExportBatchSpecifier };
    },
    createExportDeclaration: function createExportDeclaration(declaration8850, specifiers8851, source8852) {
        return {
            type: Syntax8454.ExportDeclaration,
            declaration: declaration8850,
            specifiers: specifiers8851,
            source: source8852
        };
    },
    createImportSpecifier: function createImportSpecifier(id8853, name8854) {
        return {
            type: Syntax8454.ImportSpecifier,
            id: id8853,
            name: name8854
        };
    },
    createImportDeclaration: function createImportDeclaration(specifiers8855, kind8856, source8857) {
        return {
            type: Syntax8454.ImportDeclaration,
            specifiers: specifiers8855,
            kind: kind8856,
            source: source8857
        };
    },
    createYieldExpression: function createYieldExpression(argument8858, delegate8859) {
        return {
            type: Syntax8454.YieldExpression,
            argument: argument8858,
            delegate: delegate8859
        };
    },
    createModuleDeclaration: function createModuleDeclaration(id8860, source8861, body8862) {
        return {
            type: Syntax8454.ModuleDeclaration,
            id: id8860,
            source: source8861,
            body: body8862
        };
    },
    createComprehensionExpression: function createComprehensionExpression(filter8863, blocks8864, body8865) {
        return {
            type: Syntax8454.ComprehensionExpression,
            filter: filter8863,
            blocks: blocks8864,
            body: body8865
        };
    }
};
function peekLineTerminator8514() {
    return lookahead8473.lineNumber !== lineNumber8463;
}
function throwError8515(token8866, messageFormat8867) {
    var error8868,
        args8869 = Array.prototype.slice.call(arguments, 2),
        msg8870 = messageFormat8867.replace(/%(\d)/g, function (whole8874, index8875) {
        assert8478(index8875 < args8869.length, "Message reference must be in range");
        return args8869[index8875];
    });
    var startIndex8871 = streamIndex8472 > 3 ? streamIndex8472 - 3 : 0;
    var toks8872 = "",
        tailingMsg8873 = "";
    if (tokenStream8471) {
        toks8872 = tokenStream8471.slice(startIndex8871, streamIndex8472 + 3).map(function (stx8876) {
            return stx8876.token.value;
        }).join(" ");
        tailingMsg8873 = "\n[... " + toks8872 + " ...]";
    }
    if (typeof token8866.lineNumber === "number") {
        error8868 = new Error("Line " + token8866.lineNumber + ": " + msg8870 + tailingMsg8873);
        error8868.index = token8866.range[0];
        error8868.lineNumber = token8866.lineNumber;
        error8868.column = token8866.range[0] - lineStart8464 + 1;
    } else {
        error8868 = new Error("Line " + lineNumber8463 + ": " + msg8870 + tailingMsg8873);
        error8868.index = index8462;
        error8868.lineNumber = lineNumber8463;
        error8868.column = index8462 - lineStart8464 + 1;
    }
    error8868.description = msg8870;
    throw error8868;
}
function throwErrorTolerant8516() {
    try {
        throwError8515.apply(null, arguments);
    } catch (e8877) {
        if (extra8477.errors) {
            extra8477.errors.push(e8877);
        } else {
            throw e8877;
        }
    }
}
function throwUnexpected8517(token8878) {
    if (token8878.type === Token8451.EOF) {
        throwError8515(token8878, Messages8456.UnexpectedEOS);
    }
    if (token8878.type === Token8451.NumericLiteral) {
        throwError8515(token8878, Messages8456.UnexpectedNumber);
    }
    if (token8878.type === Token8451.StringLiteral) {
        throwError8515(token8878, Messages8456.UnexpectedString);
    }
    if (token8878.type === Token8451.Identifier) {
        throwError8515(token8878, Messages8456.UnexpectedIdentifier);
    }
    if (token8878.type === Token8451.Keyword) {
        if (isFutureReservedWord8487(token8878.value)) {} else if (strict8461 && isStrictModeReservedWord8488(token8878.value)) {
            throwErrorTolerant8516(token8878, Messages8456.StrictReservedWord);
            return;
        }
        throwError8515(token8878, Messages8456.UnexpectedToken, token8878.value);
    }
    if (token8878.type === Token8451.Template) {
        throwError8515(token8878, Messages8456.UnexpectedTemplate, token8878.value.raw);
    }
    // BooleanLiteral, NullLiteral, or Punctuator.
    throwError8515(token8878, Messages8456.UnexpectedToken, token8878.value);
}
function expect8518(value8879) {
    var token8880 = lex8508();
    if (token8880.type !== Token8451.Punctuator || token8880.value !== value8879) {
        throwUnexpected8517(token8880);
    }
}
function expectKeyword8519(keyword8881) {
    var token8882 = lex8508();
    if (token8882.type !== Token8451.Keyword || token8882.value !== keyword8881) {
        throwUnexpected8517(token8882);
    }
}
function match8520(value8883) {
    return lookahead8473.type === Token8451.Punctuator && lookahead8473.value === value8883;
}
function matchKeyword8521(keyword8884) {
    return lookahead8473.type === Token8451.Keyword && lookahead8473.value === keyword8884;
}
function matchContextualKeyword8522(keyword8885) {
    return lookahead8473.type === Token8451.Identifier && lookahead8473.value === keyword8885;
}
function matchAssign8523() {
    var op8886;
    if (lookahead8473.type !== Token8451.Punctuator) {
        return false;
    }
    op8886 = lookahead8473.value;
    return op8886 === "=" || op8886 === "*=" || op8886 === "/=" || op8886 === "%=" || op8886 === "+=" || op8886 === "-=" || op8886 === "<<=" || op8886 === ">>=" || op8886 === ">>>=" || op8886 === "&=" || op8886 === "^=" || op8886 === "|=";
}
function consumeSemicolon8524() {
    var line8887, ch8888;
    ch8888 = lookahead8473.value ? String(lookahead8473.value).charCodeAt(0) : -1;
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    ch8888 === 59) {
        lex8508();
        return;
    }
    if (lookahead8473.lineNumber !== lineNumber8463) {
        return;
    }
    if (match8520(";")) {
        lex8508();
        return;
    }
    if (lookahead8473.type !== Token8451.EOF && !match8520("}")) {
        throwUnexpected8517(lookahead8473);
    }
}
function isLeftHandSide8525(expr8889) {
    return expr8889.type === Syntax8454.Identifier || expr8889.type === Syntax8454.MemberExpression;
}
function isAssignableLeftHandSide8526(expr8890) {
    return isLeftHandSide8525(expr8890) || expr8890.type === Syntax8454.ObjectPattern || expr8890.type === Syntax8454.ArrayPattern;
}
function parseArrayInitialiser8527() {
    var elements8891 = [],
        blocks8892 = [],
        filter8893 = null,
        tmp8894,
        possiblecomprehension8895 = true,
        body8896,
        marker8897 = markerCreate8511();
    expect8518("[");
    while (!match8520("]")) {
        if (lookahead8473.value === "for" && lookahead8473.type === Token8451.Keyword) {
            if (!possiblecomprehension8895) {
                throwError8515({}, Messages8456.ComprehensionError);
            }
            matchKeyword8521("for");
            tmp8894 = parseForStatement8575({ ignoreBody: true });
            tmp8894.of = tmp8894.type === Syntax8454.ForOfStatement;
            tmp8894.type = Syntax8454.ComprehensionBlock;
            if (tmp8894.left.kind) {
                // can't be let or const
                throwError8515({}, Messages8456.ComprehensionError);
            }
            blocks8892.push(tmp8894);
        } else if (lookahead8473.value === "if" && lookahead8473.type === Token8451.Keyword) {
            if (!possiblecomprehension8895) {
                throwError8515({}, Messages8456.ComprehensionError);
            }
            expectKeyword8519("if");
            expect8518("(");
            filter8893 = parseExpression8555();
            expect8518(")");
        } else if (lookahead8473.value === "," && lookahead8473.type === Token8451.Punctuator) {
            possiblecomprehension8895 = false;
            // no longer allowed.
            lex8508();
            elements8891.push(null);
        } else {
            tmp8894 = parseSpreadOrAssignmentExpression8538();
            elements8891.push(tmp8894);
            if (tmp8894 && tmp8894.type === Syntax8454.SpreadElement) {
                if (!match8520("]")) {
                    throwError8515({}, Messages8456.ElementAfterSpreadElement);
                }
            } else if (!(match8520("]") || matchKeyword8521("for") || matchKeyword8521("if"))) {
                expect8518(",");
                // this lexes.
                possiblecomprehension8895 = false;
            }
        }
    }
    expect8518("]");
    if (filter8893 && !blocks8892.length) {
        throwError8515({}, Messages8456.ComprehensionRequiresBlock);
    }
    if (blocks8892.length) {
        if (elements8891.length !== 1) {
            throwError8515({}, Messages8456.ComprehensionError);
        }
        return markerApply8513(marker8897, delegate8470.createComprehensionExpression(filter8893, blocks8892, elements8891[0]));
    }
    return markerApply8513(marker8897, delegate8470.createArrayExpression(elements8891));
}
function parsePropertyFunction8528(options8898) {
    var previousStrict8899,
        previousYieldAllowed8900,
        params8901,
        defaults8902,
        body8903,
        marker8904 = markerCreate8511();
    previousStrict8899 = strict8461;
    previousYieldAllowed8900 = state8475.yieldAllowed;
    state8475.yieldAllowed = options8898.generator;
    params8901 = options8898.params || [];
    defaults8902 = options8898.defaults || [];
    body8903 = parseConciseBody8587();
    if (options8898.name && strict8461 && isRestrictedWord8489(params8901[0].name)) {
        throwErrorTolerant8516(options8898.name, Messages8456.StrictParamName);
    }
    strict8461 = previousStrict8899;
    state8475.yieldAllowed = previousYieldAllowed8900;
    return markerApply8513(marker8904, delegate8470.createFunctionExpression(null, params8901, defaults8902, body8903, options8898.rest || null, options8898.generator, body8903.type !== Syntax8454.BlockStatement));
}
function parsePropertyMethodFunction8529(options8905) {
    var previousStrict8906, tmp8907, method8908;
    previousStrict8906 = strict8461;
    strict8461 = true;
    tmp8907 = parseParams8591();
    if (tmp8907.stricted) {
        throwErrorTolerant8516(tmp8907.stricted, tmp8907.message);
    }
    method8908 = parsePropertyFunction8528({
        params: tmp8907.params,
        defaults: tmp8907.defaults,
        rest: tmp8907.rest,
        generator: options8905.generator
    });
    strict8461 = previousStrict8906;
    return method8908;
}
function parseObjectPropertyKey8530() {
    var marker8909 = markerCreate8511(),
        token8910 = lex8508(),
        propertyKey8911,
        result8912;
    if ( // Note: This function is called only from parseObjectProperty(), where
    // EOF and Punctuator tokens are already filtered out.
    token8910.type === Token8451.StringLiteral || token8910.type === Token8451.NumericLiteral) {
        if (strict8461 && token8910.octal) {
            throwErrorTolerant8516(token8910, Messages8456.StrictOctalLiteral);
        }
        return markerApply8513(marker8909, delegate8470.createLiteral(token8910));
    }
    if (token8910.type === Token8451.Punctuator && token8910.value === "[") {
        // For computed properties we should skip the [ and ], and
        // capture in marker only the assignment expression itself.
        marker8909 = markerCreate8511();
        propertyKey8911 = parseAssignmentExpression8554();
        result8912 = markerApply8513(marker8909, propertyKey8911);
        expect8518("]");
        return result8912;
    }
    return markerApply8513(marker8909, delegate8470.createIdentifier(token8910.value));
}
function parseObjectProperty8531() {
    var token8913,
        key8914,
        id8915,
        value8916,
        param8917,
        expr8918,
        computed8919,
        marker8920 = markerCreate8511();
    token8913 = lookahead8473;
    computed8919 = token8913.value === "[" && token8913.type === Token8451.Punctuator;
    if (token8913.type === Token8451.Identifier || computed8919) {
        id8915 = parseObjectPropertyKey8530();
        if ( // Property Assignment: Getter and Setter.
        token8913.value === "get" && !(match8520(":") || match8520("("))) {
            computed8919 = lookahead8473.value === "[";
            key8914 = parseObjectPropertyKey8530();
            expect8518("(");
            expect8518(")");
            return markerApply8513(marker8920, delegate8470.createProperty("get", key8914, parsePropertyFunction8528({ generator: false }), false, false, computed8919));
        }
        if (token8913.value === "set" && !(match8520(":") || match8520("("))) {
            computed8919 = lookahead8473.value === "[";
            key8914 = parseObjectPropertyKey8530();
            expect8518("(");
            token8913 = lookahead8473;
            param8917 = [parseVariableIdentifier8558()];
            expect8518(")");
            return markerApply8513(marker8920, delegate8470.createProperty("set", key8914, parsePropertyFunction8528({
                params: param8917,
                generator: false,
                name: token8913
            }), false, false, computed8919));
        }
        if (match8520(":")) {
            lex8508();
            return markerApply8513(marker8920, delegate8470.createProperty("init", id8915, parseAssignmentExpression8554(), false, false, computed8919));
        }
        if (match8520("(")) {
            return markerApply8513(marker8920, delegate8470.createProperty("init", id8915, parsePropertyMethodFunction8529({ generator: false }), true, false, computed8919));
        }
        if (computed8919) {
            // Computed properties can only be used with full notation.
            throwUnexpected8517(lookahead8473);
        }
        return markerApply8513(marker8920, delegate8470.createProperty("init", id8915, id8915, false, true, false));
    }
    if (token8913.type === Token8451.EOF || token8913.type === Token8451.Punctuator) {
        if (!match8520("*")) {
            throwUnexpected8517(token8913);
        }
        lex8508();
        computed8919 = lookahead8473.type === Token8451.Punctuator && lookahead8473.value === "[";
        id8915 = parseObjectPropertyKey8530();
        if (!match8520("(")) {
            throwUnexpected8517(lex8508());
        }
        return markerApply8513(marker8920, delegate8470.createProperty("init", id8915, parsePropertyMethodFunction8529({ generator: true }), true, false, computed8919));
    }
    key8914 = parseObjectPropertyKey8530();
    if (match8520(":")) {
        lex8508();
        return markerApply8513(marker8920, delegate8470.createProperty("init", key8914, parseAssignmentExpression8554(), false, false, false));
    }
    if (match8520("(")) {
        return markerApply8513(marker8920, delegate8470.createProperty("init", key8914, parsePropertyMethodFunction8529({ generator: false }), true, false, false));
    }
    throwUnexpected8517(lex8508());
}
function parseObjectInitialiser8532() {
    var properties8921 = [],
        property8922,
        name8923,
        key8924,
        kind8925,
        map8926 = {},
        toString8927 = String,
        marker8928 = markerCreate8511();
    expect8518("{");
    while (!match8520("}")) {
        property8922 = parseObjectProperty8531();
        if (property8922.key.type === Syntax8454.Identifier) {
            name8923 = property8922.key.name;
        } else {
            name8923 = toString8927(property8922.key.value);
        }
        kind8925 = property8922.kind === "init" ? PropertyKind8455.Data : property8922.kind === "get" ? PropertyKind8455.Get : PropertyKind8455.Set;
        key8924 = "$" + name8923;
        if (Object.prototype.hasOwnProperty.call(map8926, key8924)) {
            if (map8926[key8924] === PropertyKind8455.Data) {
                if (strict8461 && kind8925 === PropertyKind8455.Data) {
                    throwErrorTolerant8516({}, Messages8456.StrictDuplicateProperty);
                } else if (kind8925 !== PropertyKind8455.Data) {
                    throwErrorTolerant8516({}, Messages8456.AccessorDataProperty);
                }
            } else {
                if (kind8925 === PropertyKind8455.Data) {
                    throwErrorTolerant8516({}, Messages8456.AccessorDataProperty);
                } else if (map8926[key8924] & kind8925) {
                    throwErrorTolerant8516({}, Messages8456.AccessorGetSet);
                }
            }
            map8926[key8924] |= kind8925;
        } else {
            map8926[key8924] = kind8925;
        }
        properties8921.push(property8922);
        if (!match8520("}")) {
            expect8518(",");
        }
    }
    expect8518("}");
    return markerApply8513(marker8928, delegate8470.createObjectExpression(properties8921));
}
function parseTemplateElement8533(option8929) {
    var marker8930 = markerCreate8511(),
        token8931 = lex8508();
    if (strict8461 && token8931.octal) {
        throwError8515(token8931, Messages8456.StrictOctalLiteral);
    }
    return markerApply8513(marker8930, delegate8470.createTemplateElement({
        raw: token8931.value.raw,
        cooked: token8931.value.cooked
    }, token8931.tail));
}
function parseTemplateLiteral8534() {
    var quasi8932,
        quasis8933,
        expressions8934,
        marker8935 = markerCreate8511();
    quasi8932 = parseTemplateElement8533({ head: true });
    quasis8933 = [quasi8932];
    expressions8934 = [];
    while (!quasi8932.tail) {
        expressions8934.push(parseExpression8555());
        quasi8932 = parseTemplateElement8533({ head: false });
        quasis8933.push(quasi8932);
    }
    return markerApply8513(marker8935, delegate8470.createTemplateLiteral(quasis8933, expressions8934));
}
function parseGroupExpression8535() {
    var expr8936;
    expect8518("(");
    ++state8475.parenthesizedCount;
    expr8936 = parseExpression8555();
    expect8518(")");
    return expr8936;
}
function parsePrimaryExpression8536() {
    var type8937, token8938, resolvedIdent8939, marker8940, expr8941;
    token8938 = lookahead8473;
    type8937 = lookahead8473.type;
    if (type8937 === Token8451.Identifier) {
        marker8940 = markerCreate8511();
        resolvedIdent8939 = expander8450.resolve(tokenStream8471[lookaheadIndex8474], phase8476);
        lex8508();
        return markerApply8513(marker8940, delegate8470.createIdentifier(resolvedIdent8939));
    }
    if (type8937 === Token8451.StringLiteral || type8937 === Token8451.NumericLiteral) {
        if (strict8461 && lookahead8473.octal) {
            throwErrorTolerant8516(lookahead8473, Messages8456.StrictOctalLiteral);
        }
        marker8940 = markerCreate8511();
        return markerApply8513(marker8940, delegate8470.createLiteral(lex8508()));
    }
    if (type8937 === Token8451.Keyword) {
        if (matchKeyword8521("this")) {
            marker8940 = markerCreate8511();
            lex8508();
            return markerApply8513(marker8940, delegate8470.createThisExpression());
        }
        if (matchKeyword8521("function")) {
            return parseFunctionExpression8593();
        }
        if (matchKeyword8521("class")) {
            return parseClassExpression8598();
        }
        if (matchKeyword8521("super")) {
            marker8940 = markerCreate8511();
            lex8508();
            return markerApply8513(marker8940, delegate8470.createIdentifier("super"));
        }
    }
    if (type8937 === Token8451.BooleanLiteral) {
        marker8940 = markerCreate8511();
        token8938 = lex8508();
        if (typeof token8938.value !== "boolean") {
            assert8478(token8938.value === "true" || token8938.value === "false", "exporting either true or false as a string not: " + token8938.value);
            token8938.value = token8938.value === "true";
        }
        return markerApply8513(marker8940, delegate8470.createLiteral(token8938));
    }
    if (type8937 === Token8451.NullLiteral) {
        marker8940 = markerCreate8511();
        token8938 = lex8508();
        token8938.value = null;
        return markerApply8513(marker8940, delegate8470.createLiteral(token8938));
    }
    if (match8520("[")) {
        return parseArrayInitialiser8527();
    }
    if (match8520("{")) {
        return parseObjectInitialiser8532();
    }
    if (match8520("(")) {
        return parseGroupExpression8535();
    }
    if (lookahead8473.type === Token8451.RegularExpression) {
        marker8940 = markerCreate8511();
        return markerApply8513(marker8940, delegate8470.createLiteral(lex8508()));
    }
    if (type8937 === Token8451.Template) {
        return parseTemplateLiteral8534();
    }
    throwUnexpected8517(lex8508());
}
function parseArguments8537() {
    var args8942 = [],
        arg8943;
    expect8518("(");
    if (!match8520(")")) {
        while (streamIndex8472 < length8469) {
            arg8943 = parseSpreadOrAssignmentExpression8538();
            args8942.push(arg8943);
            if (match8520(")")) {
                break;
            } else if (arg8943.type === Syntax8454.SpreadElement) {
                throwError8515({}, Messages8456.ElementAfterSpreadElement);
            }
            expect8518(",");
        }
    }
    expect8518(")");
    return args8942;
}
function parseSpreadOrAssignmentExpression8538() {
    if (match8520("...")) {
        var marker8944 = markerCreate8511();
        lex8508();
        return markerApply8513(marker8944, delegate8470.createSpreadElement(parseAssignmentExpression8554()));
    }
    return parseAssignmentExpression8554();
}
function parseNonComputedProperty8539(toResolve8945) {
    var marker8946 = markerCreate8511(),
        resolvedIdent8947,
        token8948;
    if (toResolve8945) {
        resolvedIdent8947 = expander8450.resolve(tokenStream8471[lookaheadIndex8474], phase8476);
    }
    token8948 = lex8508();
    resolvedIdent8947 = toResolve8945 ? resolvedIdent8947 : token8948.value;
    if (!isIdentifierName8505(token8948)) {
        throwUnexpected8517(token8948);
    }
    return markerApply8513(marker8946, delegate8470.createIdentifier(resolvedIdent8947));
}
function parseNonComputedMember8540() {
    expect8518(".");
    return parseNonComputedProperty8539();
}
function parseComputedMember8541() {
    var expr8949;
    expect8518("[");
    expr8949 = parseExpression8555();
    expect8518("]");
    return expr8949;
}
function parseNewExpression8542() {
    var callee8950,
        args8951,
        marker8952 = markerCreate8511();
    expectKeyword8519("new");
    callee8950 = parseLeftHandSideExpression8544();
    args8951 = match8520("(") ? parseArguments8537() : [];
    return markerApply8513(marker8952, delegate8470.createNewExpression(callee8950, args8951));
}
function parseLeftHandSideExpressionAllowCall8543() {
    var expr8953,
        args8954,
        marker8955 = markerCreate8511();
    expr8953 = matchKeyword8521("new") ? parseNewExpression8542() : parsePrimaryExpression8536();
    while (match8520(".") || match8520("[") || match8520("(") || lookahead8473.type === Token8451.Template) {
        if (match8520("(")) {
            args8954 = parseArguments8537();
            expr8953 = markerApply8513(marker8955, delegate8470.createCallExpression(expr8953, args8954));
        } else if (match8520("[")) {
            expr8953 = markerApply8513(marker8955, delegate8470.createMemberExpression("[", expr8953, parseComputedMember8541()));
        } else if (match8520(".")) {
            expr8953 = markerApply8513(marker8955, delegate8470.createMemberExpression(".", expr8953, parseNonComputedMember8540()));
        } else {
            expr8953 = markerApply8513(marker8955, delegate8470.createTaggedTemplateExpression(expr8953, parseTemplateLiteral8534()));
        }
    }
    return expr8953;
}
function parseLeftHandSideExpression8544() {
    var expr8956,
        marker8957 = markerCreate8511();
    expr8956 = matchKeyword8521("new") ? parseNewExpression8542() : parsePrimaryExpression8536();
    while (match8520(".") || match8520("[") || lookahead8473.type === Token8451.Template) {
        if (match8520("[")) {
            expr8956 = markerApply8513(marker8957, delegate8470.createMemberExpression("[", expr8956, parseComputedMember8541()));
        } else if (match8520(".")) {
            expr8956 = markerApply8513(marker8957, delegate8470.createMemberExpression(".", expr8956, parseNonComputedMember8540()));
        } else {
            expr8956 = markerApply8513(marker8957, delegate8470.createTaggedTemplateExpression(expr8956, parseTemplateLiteral8534()));
        }
    }
    return expr8956;
}
function parsePostfixExpression8545() {
    var marker8958 = markerCreate8511(),
        expr8959 = parseLeftHandSideExpressionAllowCall8543(),
        token8960;
    if (lookahead8473.type !== Token8451.Punctuator) {
        return expr8959;
    }
    if ((match8520("++") || match8520("--")) && !peekLineTerminator8514()) {
        if ( // 11.3.1, 11.3.2
        strict8461 && expr8959.type === Syntax8454.Identifier && isRestrictedWord8489(expr8959.name)) {
            throwErrorTolerant8516({}, Messages8456.StrictLHSPostfix);
        }
        if (!isLeftHandSide8525(expr8959)) {
            throwError8515({}, Messages8456.InvalidLHSInAssignment);
        }
        token8960 = lex8508();
        expr8959 = markerApply8513(marker8958, delegate8470.createPostfixExpression(token8960.value, expr8959));
    }
    return expr8959;
}
function parseUnaryExpression8546() {
    var marker8961, token8962, expr8963;
    if (lookahead8473.type !== Token8451.Punctuator && lookahead8473.type !== Token8451.Keyword) {
        return parsePostfixExpression8545();
    }
    if (match8520("++") || match8520("--")) {
        marker8961 = markerCreate8511();
        token8962 = lex8508();
        expr8963 = parseUnaryExpression8546();
        if ( // 11.4.4, 11.4.5
        strict8461 && expr8963.type === Syntax8454.Identifier && isRestrictedWord8489(expr8963.name)) {
            throwErrorTolerant8516({}, Messages8456.StrictLHSPrefix);
        }
        if (!isLeftHandSide8525(expr8963)) {
            throwError8515({}, Messages8456.InvalidLHSInAssignment);
        }
        return markerApply8513(marker8961, delegate8470.createUnaryExpression(token8962.value, expr8963));
    }
    if (match8520("+") || match8520("-") || match8520("~") || match8520("!")) {
        marker8961 = markerCreate8511();
        token8962 = lex8508();
        expr8963 = parseUnaryExpression8546();
        return markerApply8513(marker8961, delegate8470.createUnaryExpression(token8962.value, expr8963));
    }
    if (matchKeyword8521("delete") || matchKeyword8521("void") || matchKeyword8521("typeof")) {
        marker8961 = markerCreate8511();
        token8962 = lex8508();
        expr8963 = parseUnaryExpression8546();
        expr8963 = markerApply8513(marker8961, delegate8470.createUnaryExpression(token8962.value, expr8963));
        if (strict8461 && expr8963.operator === "delete" && expr8963.argument.type === Syntax8454.Identifier) {
            throwErrorTolerant8516({}, Messages8456.StrictDelete);
        }
        return expr8963;
    }
    return parsePostfixExpression8545();
}
function binaryPrecedence8547(token8964, allowIn8965) {
    var prec8966 = 0;
    if (token8964.type !== Token8451.Punctuator && token8964.type !== Token8451.Keyword) {
        return 0;
    }
    switch (token8964.value) {
        case "||":
            prec8966 = 1;
            break;
        case "&&":
            prec8966 = 2;
            break;
        case "|":
            prec8966 = 3;
            break;
        case "^":
            prec8966 = 4;
            break;
        case "&":
            prec8966 = 5;
            break;
        case "==":
        case "!=":
        case "===":
        case "!==":
            prec8966 = 6;
            break;
        case "<":
        case ">":
        case "<=":
        case ">=":
        case "instanceof":
            prec8966 = 7;
            break;
        case "in":
            prec8966 = allowIn8965 ? 7 : 0;
            break;
        case "<<":
        case ">>":
        case ">>>":
            prec8966 = 8;
            break;
        case "+":
        case "-":
            prec8966 = 9;
            break;
        case "*":
        case "/":
        case "%":
            prec8966 = 11;
            break;
        default:
            break;
    }
    return prec8966;
}
function parseBinaryExpression8548() {
    var expr8967, token8968, prec8969, previousAllowIn8970, stack8971, right8972, operator8973, left8974, i8975, marker8976, markers8977;
    previousAllowIn8970 = state8475.allowIn;
    state8475.allowIn = true;
    marker8976 = markerCreate8511();
    left8974 = parseUnaryExpression8546();
    token8968 = lookahead8473;
    prec8969 = binaryPrecedence8547(token8968, previousAllowIn8970);
    if (prec8969 === 0) {
        return left8974;
    }
    token8968.prec = prec8969;
    lex8508();
    markers8977 = [marker8976, markerCreate8511()];
    right8972 = parseUnaryExpression8546();
    stack8971 = [left8974, token8968, right8972];
    while ((prec8969 = binaryPrecedence8547(lookahead8473, previousAllowIn8970)) > 0) {
        while ( // Reduce: make a binary expression from the three topmost entries.
        stack8971.length > 2 && prec8969 <= stack8971[stack8971.length - 2].prec) {
            right8972 = stack8971.pop();
            operator8973 = stack8971.pop().value;
            left8974 = stack8971.pop();
            expr8967 = delegate8470.createBinaryExpression(operator8973, left8974, right8972);
            markers8977.pop();
            marker8976 = markers8977.pop();
            markerApply8513(marker8976, expr8967);
            stack8971.push(expr8967);
            markers8977.push(marker8976);
        }
        // Shift.
        token8968 = lex8508();
        token8968.prec = prec8969;
        stack8971.push(token8968);
        markers8977.push(markerCreate8511());
        expr8967 = parseUnaryExpression8546();
        stack8971.push(expr8967);
    }
    state8475.allowIn = previousAllowIn8970;
    // Final reduce to clean-up the stack.
    i8975 = stack8971.length - 1;
    expr8967 = stack8971[i8975];
    markers8977.pop();
    while (i8975 > 1) {
        expr8967 = delegate8470.createBinaryExpression(stack8971[i8975 - 1].value, stack8971[i8975 - 2], expr8967);
        i8975 -= 2;
        marker8976 = markers8977.pop();
        markerApply8513(marker8976, expr8967);
    }
    return expr8967;
}
function parseConditionalExpression8549() {
    var expr8978,
        previousAllowIn8979,
        consequent8980,
        alternate8981,
        marker8982 = markerCreate8511();
    expr8978 = parseBinaryExpression8548();
    if (match8520("?")) {
        lex8508();
        previousAllowIn8979 = state8475.allowIn;
        state8475.allowIn = true;
        consequent8980 = parseAssignmentExpression8554();
        state8475.allowIn = previousAllowIn8979;
        expect8518(":");
        alternate8981 = parseAssignmentExpression8554();
        expr8978 = markerApply8513(marker8982, delegate8470.createConditionalExpression(expr8978, consequent8980, alternate8981));
    }
    return expr8978;
}
function reinterpretAsAssignmentBindingPattern8550(expr8983) {
    var i8984, len8985, property8986, element8987;
    if (expr8983.type === Syntax8454.ObjectExpression) {
        expr8983.type = Syntax8454.ObjectPattern;
        for (i8984 = 0, len8985 = expr8983.properties.length; i8984 < len8985; i8984 += 1) {
            property8986 = expr8983.properties[i8984];
            if (property8986.kind !== "init") {
                throwError8515({}, Messages8456.InvalidLHSInAssignment);
            }
            reinterpretAsAssignmentBindingPattern8550(property8986.value);
        }
    } else if (expr8983.type === Syntax8454.ArrayExpression) {
        expr8983.type = Syntax8454.ArrayPattern;
        for (i8984 = 0, len8985 = expr8983.elements.length; i8984 < len8985; i8984 += 1) {
            element8987 = expr8983.elements[i8984];
            if (element8987) {
                reinterpretAsAssignmentBindingPattern8550(element8987);
            }
        }
    } else if (expr8983.type === Syntax8454.Identifier) {
        if (isRestrictedWord8489(expr8983.name)) {
            throwError8515({}, Messages8456.InvalidLHSInAssignment);
        }
    } else if (expr8983.type === Syntax8454.SpreadElement) {
        reinterpretAsAssignmentBindingPattern8550(expr8983.argument);
        if (expr8983.argument.type === Syntax8454.ObjectPattern) {
            throwError8515({}, Messages8456.ObjectPatternAsSpread);
        }
    } else {
        if (expr8983.type !== Syntax8454.MemberExpression && expr8983.type !== Syntax8454.CallExpression && expr8983.type !== Syntax8454.NewExpression) {
            throwError8515({}, Messages8456.InvalidLHSInAssignment);
        }
    }
}
function reinterpretAsDestructuredParameter8551(options8988, expr8989) {
    var i8990, len8991, property8992, element8993;
    if (expr8989.type === Syntax8454.ObjectExpression) {
        expr8989.type = Syntax8454.ObjectPattern;
        for (i8990 = 0, len8991 = expr8989.properties.length; i8990 < len8991; i8990 += 1) {
            property8992 = expr8989.properties[i8990];
            if (property8992.kind !== "init") {
                throwError8515({}, Messages8456.InvalidLHSInFormalsList);
            }
            reinterpretAsDestructuredParameter8551(options8988, property8992.value);
        }
    } else if (expr8989.type === Syntax8454.ArrayExpression) {
        expr8989.type = Syntax8454.ArrayPattern;
        for (i8990 = 0, len8991 = expr8989.elements.length; i8990 < len8991; i8990 += 1) {
            element8993 = expr8989.elements[i8990];
            if (element8993) {
                reinterpretAsDestructuredParameter8551(options8988, element8993);
            }
        }
    } else if (expr8989.type === Syntax8454.Identifier) {
        validateParam8589(options8988, expr8989, expr8989.name);
    } else {
        if (expr8989.type !== Syntax8454.MemberExpression) {
            throwError8515({}, Messages8456.InvalidLHSInFormalsList);
        }
    }
}
function reinterpretAsCoverFormalsList8552(expressions8994) {
    var i8995, len8996, param8997, params8998, defaults8999, defaultCount9000, options9001, rest9002;
    params8998 = [];
    defaults8999 = [];
    defaultCount9000 = 0;
    rest9002 = null;
    options9001 = { paramSet: {} };
    for (i8995 = 0, len8996 = expressions8994.length; i8995 < len8996; i8995 += 1) {
        param8997 = expressions8994[i8995];
        if (param8997.type === Syntax8454.Identifier) {
            params8998.push(param8997);
            defaults8999.push(null);
            validateParam8589(options9001, param8997, param8997.name);
        } else if (param8997.type === Syntax8454.ObjectExpression || param8997.type === Syntax8454.ArrayExpression) {
            reinterpretAsDestructuredParameter8551(options9001, param8997);
            params8998.push(param8997);
            defaults8999.push(null);
        } else if (param8997.type === Syntax8454.SpreadElement) {
            assert8478(i8995 === len8996 - 1, "It is guaranteed that SpreadElement is last element by parseExpression");
            reinterpretAsDestructuredParameter8551(options9001, param8997.argument);
            rest9002 = param8997.argument;
        } else if (param8997.type === Syntax8454.AssignmentExpression) {
            params8998.push(param8997.left);
            defaults8999.push(param8997.right);
            ++defaultCount9000;
            validateParam8589(options9001, param8997.left, param8997.left.name);
        } else {
            return null;
        }
    }
    if (options9001.message === Messages8456.StrictParamDupe) {
        throwError8515(strict8461 ? options9001.stricted : options9001.firstRestricted, options9001.message);
    }
    if (defaultCount9000 === 0) {
        defaults8999 = [];
    }
    return {
        params: params8998,
        defaults: defaults8999,
        rest: rest9002,
        stricted: options9001.stricted,
        firstRestricted: options9001.firstRestricted,
        message: options9001.message
    };
}
function parseArrowFunctionExpression8553(options9003, marker9004) {
    var previousStrict9005, previousYieldAllowed9006, body9007;
    expect8518("=>");
    previousStrict9005 = strict8461;
    previousYieldAllowed9006 = state8475.yieldAllowed;
    state8475.yieldAllowed = false;
    body9007 = parseConciseBody8587();
    if (strict8461 && options9003.firstRestricted) {
        throwError8515(options9003.firstRestricted, options9003.message);
    }
    if (strict8461 && options9003.stricted) {
        throwErrorTolerant8516(options9003.stricted, options9003.message);
    }
    strict8461 = previousStrict9005;
    state8475.yieldAllowed = previousYieldAllowed9006;
    return markerApply8513(marker9004, delegate8470.createArrowFunctionExpression(options9003.params, options9003.defaults, body9007, options9003.rest, body9007.type !== Syntax8454.BlockStatement));
}
function parseAssignmentExpression8554() {
    var marker9008, expr9009, token9010, params9011, oldParenthesizedCount9012;
    if ( // Note that 'yield' is treated as a keyword in strict mode, but a
    // contextual keyword (identifier) in non-strict mode, so we need
    // to use matchKeyword and matchContextualKeyword appropriately.
    state8475.yieldAllowed && matchContextualKeyword8522("yield") || strict8461 && matchKeyword8521("yield")) {
        return parseYieldExpression8594();
    }
    oldParenthesizedCount9012 = state8475.parenthesizedCount;
    marker9008 = markerCreate8511();
    if (match8520("(")) {
        token9010 = lookahead28510();
        if (token9010.type === Token8451.Punctuator && token9010.value === ")" || token9010.value === "...") {
            params9011 = parseParams8591();
            if (!match8520("=>")) {
                throwUnexpected8517(lex8508());
            }
            return parseArrowFunctionExpression8553(params9011, marker9008);
        }
    }
    token9010 = lookahead8473;
    expr9009 = parseConditionalExpression8549();
    if (match8520("=>") && (state8475.parenthesizedCount === oldParenthesizedCount9012 || state8475.parenthesizedCount === oldParenthesizedCount9012 + 1)) {
        if (expr9009.type === Syntax8454.Identifier) {
            params9011 = reinterpretAsCoverFormalsList8552([expr9009]);
        } else if (expr9009.type === Syntax8454.SequenceExpression) {
            params9011 = reinterpretAsCoverFormalsList8552(expr9009.expressions);
        }
        if (params9011) {
            return parseArrowFunctionExpression8553(params9011, marker9008);
        }
    }
    if (matchAssign8523()) {
        if ( // 11.13.1
        strict8461 && expr9009.type === Syntax8454.Identifier && isRestrictedWord8489(expr9009.name)) {
            throwErrorTolerant8516(token9010, Messages8456.StrictLHSAssignment);
        }
        if ( // ES.next draf 11.13 Runtime Semantics step 1
        match8520("=") && (expr9009.type === Syntax8454.ObjectExpression || expr9009.type === Syntax8454.ArrayExpression)) {
            reinterpretAsAssignmentBindingPattern8550(expr9009);
        } else if (!isLeftHandSide8525(expr9009)) {
            throwError8515({}, Messages8456.InvalidLHSInAssignment);
        }
        expr9009 = markerApply8513(marker9008, delegate8470.createAssignmentExpression(lex8508().value, expr9009, parseAssignmentExpression8554()));
    }
    return expr9009;
}
function parseExpression8555() {
    var marker9013, expr9014, expressions9015, sequence9016, coverFormalsList9017, spreadFound9018, oldParenthesizedCount9019;
    oldParenthesizedCount9019 = state8475.parenthesizedCount;
    marker9013 = markerCreate8511();
    expr9014 = parseAssignmentExpression8554();
    expressions9015 = [expr9014];
    if (match8520(",")) {
        while (streamIndex8472 < length8469) {
            if (!match8520(",")) {
                break;
            }
            lex8508();
            expr9014 = parseSpreadOrAssignmentExpression8538();
            expressions9015.push(expr9014);
            if (expr9014.type === Syntax8454.SpreadElement) {
                spreadFound9018 = true;
                if (!match8520(")")) {
                    throwError8515({}, Messages8456.ElementAfterSpreadElement);
                }
                break;
            }
        }
        sequence9016 = markerApply8513(marker9013, delegate8470.createSequenceExpression(expressions9015));
    }
    if (match8520("=>")) {
        if ( // Do not allow nested parentheses on the LHS of the =>.
        state8475.parenthesizedCount === oldParenthesizedCount9019 || state8475.parenthesizedCount === oldParenthesizedCount9019 + 1) {
            expr9014 = expr9014.type === Syntax8454.SequenceExpression ? expr9014.expressions : expressions9015;
            coverFormalsList9017 = reinterpretAsCoverFormalsList8552(expr9014);
            if (coverFormalsList9017) {
                return parseArrowFunctionExpression8553(coverFormalsList9017, marker9013);
            }
        }
        throwUnexpected8517(lex8508());
    }
    if (spreadFound9018 && lookahead28510().value !== "=>") {
        throwError8515({}, Messages8456.IllegalSpread);
    }
    return sequence9016 || expr9014;
}
function parseStatementList8556() {
    var list9020 = [],
        statement9021;
    while (streamIndex8472 < length8469) {
        if (match8520("}")) {
            break;
        }
        statement9021 = parseSourceElement8601();
        if (typeof statement9021 === "undefined") {
            break;
        }
        list9020.push(statement9021);
    }
    return list9020;
}
function parseBlock8557() {
    var block9022,
        marker9023 = markerCreate8511();
    expect8518("{");
    block9022 = parseStatementList8556();
    expect8518("}");
    return markerApply8513(marker9023, delegate8470.createBlockStatement(block9022));
}
function parseVariableIdentifier8558() {
    var token9024 = lookahead8473,
        resolvedIdent9025,
        marker9026 = markerCreate8511();
    if (token9024.type !== Token8451.Identifier) {
        throwUnexpected8517(token9024);
    }
    resolvedIdent9025 = expander8450.resolve(tokenStream8471[lookaheadIndex8474], phase8476);
    lex8508();
    return markerApply8513(marker9026, delegate8470.createIdentifier(resolvedIdent9025));
}
function parseVariableDeclaration8559(kind9027) {
    var id9028,
        marker9029 = markerCreate8511(),
        init9030 = null;
    if (match8520("{")) {
        id9028 = parseObjectInitialiser8532();
        reinterpretAsAssignmentBindingPattern8550(id9028);
    } else if (match8520("[")) {
        id9028 = parseArrayInitialiser8527();
        reinterpretAsAssignmentBindingPattern8550(id9028);
    } else {
        id9028 = state8475.allowKeyword ? parseNonComputedProperty8539() : parseVariableIdentifier8558();
        if ( // 12.2.1
        strict8461 && isRestrictedWord8489(id9028.name)) {
            throwErrorTolerant8516({}, Messages8456.StrictVarName);
        }
    }
    if (kind9027 === "const") {
        if (!match8520("=")) {
            throwError8515({}, Messages8456.NoUnintializedConst);
        }
        expect8518("=");
        init9030 = parseAssignmentExpression8554();
    } else if (match8520("=")) {
        lex8508();
        init9030 = parseAssignmentExpression8554();
    }
    return markerApply8513(marker9029, delegate8470.createVariableDeclarator(id9028, init9030));
}
function parseVariableDeclarationList8560(kind9031) {
    var list9032 = [];
    do {
        list9032.push(parseVariableDeclaration8559(kind9031));
        if (!match8520(",")) {
            break;
        }
        lex8508();
    } while (streamIndex8472 < length8469);
    return list9032;
}
function parseVariableStatement8561() {
    var declarations9033,
        marker9034 = markerCreate8511();
    expectKeyword8519("var");
    declarations9033 = parseVariableDeclarationList8560();
    consumeSemicolon8524();
    return markerApply8513(marker9034, delegate8470.createVariableDeclaration(declarations9033, "var"));
}
function parseConstLetDeclaration8562(kind9035) {
    var declarations9036,
        marker9037 = markerCreate8511();
    expectKeyword8519(kind9035);
    declarations9036 = parseVariableDeclarationList8560(kind9035);
    consumeSemicolon8524();
    return markerApply8513(marker9037, delegate8470.createVariableDeclaration(declarations9036, kind9035));
}
function parseModuleDeclaration8563() {
    var id9038,
        src9039,
        body9040,
        marker9041 = markerCreate8511();
    lex8508();
    if ( // 'module'
    peekLineTerminator8514()) {
        throwError8515({}, Messages8456.NewlineAfterModule);
    }
    switch (lookahead8473.type) {
        case Token8451.StringLiteral:
            id9038 = parsePrimaryExpression8536();
            body9040 = parseModuleBlock8606();
            src9039 = null;
            break;
        case Token8451.Identifier:
            id9038 = parseVariableIdentifier8558();
            body9040 = null;
            if (!matchContextualKeyword8522("from")) {
                throwUnexpected8517(lex8508());
            }
            lex8508();
            src9039 = parsePrimaryExpression8536();
            if (src9039.type !== Syntax8454.Literal) {
                throwError8515({}, Messages8456.InvalidModuleSpecifier);
            }
            break;
    }
    consumeSemicolon8524();
    return markerApply8513(marker9041, delegate8470.createModuleDeclaration(id9038, src9039, body9040));
}
function parseExportBatchSpecifier8564() {
    var marker9042 = markerCreate8511();
    expect8518("*");
    return markerApply8513(marker9042, delegate8470.createExportBatchSpecifier());
}
function parseExportSpecifier8565() {
    var id9043,
        name9044 = null,
        marker9045 = markerCreate8511();
    id9043 = parseVariableIdentifier8558();
    if (matchContextualKeyword8522("as")) {
        lex8508();
        name9044 = parseNonComputedProperty8539();
    }
    return markerApply8513(marker9045, delegate8470.createExportSpecifier(id9043, name9044));
}
function parseExportDeclaration8566() {
    var previousAllowKeyword9046,
        decl9047,
        def9048,
        src9049,
        specifiers9050,
        marker9051 = markerCreate8511();
    expectKeyword8519("export");
    if (lookahead8473.type === Token8451.Keyword) {
        switch (lookahead8473.value) {
            case "let":
            case "const":
            case "var":
            case "class":
            case "function":
                return markerApply8513(marker9051, delegate8470.createExportDeclaration(parseSourceElement8601(), null, null));
        }
    }
    if (isIdentifierName8505(lookahead8473)) {
        previousAllowKeyword9046 = state8475.allowKeyword;
        state8475.allowKeyword = true;
        decl9047 = parseVariableDeclarationList8560("let");
        state8475.allowKeyword = previousAllowKeyword9046;
        return markerApply8513(marker9051, delegate8470.createExportDeclaration(decl9047, null, null));
    }
    specifiers9050 = [];
    src9049 = null;
    if (match8520("*")) {
        specifiers9050.push(parseExportBatchSpecifier8564());
    } else {
        expect8518("{");
        do {
            specifiers9050.push(parseExportSpecifier8565());
        } while (match8520(",") && lex8508());
        expect8518("}");
    }
    if (matchContextualKeyword8522("from")) {
        lex8508();
        src9049 = parsePrimaryExpression8536();
        if (src9049.type !== Syntax8454.Literal) {
            throwError8515({}, Messages8456.InvalidModuleSpecifier);
        }
    }
    consumeSemicolon8524();
    return markerApply8513(marker9051, delegate8470.createExportDeclaration(null, specifiers9050, src9049));
}
function parseImportDeclaration8567() {
    var specifiers9052,
        kind9053,
        src9054,
        marker9055 = markerCreate8511();
    expectKeyword8519("import");
    specifiers9052 = [];
    if (isIdentifierName8505(lookahead8473)) {
        kind9053 = "default";
        specifiers9052.push(parseImportSpecifier8568());
        if (!matchContextualKeyword8522("from")) {
            throwError8515({}, Messages8456.NoFromAfterImport);
        }
        lex8508();
    } else if (match8520("{")) {
        kind9053 = "named";
        lex8508();
        do {
            specifiers9052.push(parseImportSpecifier8568());
        } while (match8520(",") && lex8508());
        expect8518("}");
        if (!matchContextualKeyword8522("from")) {
            throwError8515({}, Messages8456.NoFromAfterImport);
        }
        lex8508();
    }
    src9054 = parsePrimaryExpression8536();
    if (src9054.type !== Syntax8454.Literal) {
        throwError8515({}, Messages8456.InvalidModuleSpecifier);
    }
    consumeSemicolon8524();
    return markerApply8513(marker9055, delegate8470.createImportDeclaration(specifiers9052, kind9053, src9054));
}
function parseImportSpecifier8568() {
    var id9056,
        name9057 = null,
        marker9058 = markerCreate8511();
    id9056 = parseNonComputedProperty8539(true);
    if (matchContextualKeyword8522("as")) {
        lex8508();
        name9057 = parseVariableIdentifier8558();
    }
    return markerApply8513(marker9058, delegate8470.createImportSpecifier(id9056, name9057));
}
function parseEmptyStatement8569() {
    var marker9059 = markerCreate8511();
    expect8518(";");
    return markerApply8513(marker9059, delegate8470.createEmptyStatement());
}
function parseExpressionStatement8570() {
    var marker9060 = markerCreate8511(),
        expr9061 = parseExpression8555();
    consumeSemicolon8524();
    return markerApply8513(marker9060, delegate8470.createExpressionStatement(expr9061));
}
function parseIfStatement8571() {
    var test9062,
        consequent9063,
        alternate9064,
        marker9065 = markerCreate8511();
    expectKeyword8519("if");
    expect8518("(");
    test9062 = parseExpression8555();
    expect8518(")");
    consequent9063 = parseStatement8586();
    if (matchKeyword8521("else")) {
        lex8508();
        alternate9064 = parseStatement8586();
    } else {
        alternate9064 = null;
    }
    return markerApply8513(marker9065, delegate8470.createIfStatement(test9062, consequent9063, alternate9064));
}
function parseDoWhileStatement8572() {
    var body9066,
        test9067,
        oldInIteration9068,
        marker9069 = markerCreate8511();
    expectKeyword8519("do");
    oldInIteration9068 = state8475.inIteration;
    state8475.inIteration = true;
    body9066 = parseStatement8586();
    state8475.inIteration = oldInIteration9068;
    expectKeyword8519("while");
    expect8518("(");
    test9067 = parseExpression8555();
    expect8518(")");
    if (match8520(";")) {
        lex8508();
    }
    return markerApply8513(marker9069, delegate8470.createDoWhileStatement(body9066, test9067));
}
function parseWhileStatement8573() {
    var test9070,
        body9071,
        oldInIteration9072,
        marker9073 = markerCreate8511();
    expectKeyword8519("while");
    expect8518("(");
    test9070 = parseExpression8555();
    expect8518(")");
    oldInIteration9072 = state8475.inIteration;
    state8475.inIteration = true;
    body9071 = parseStatement8586();
    state8475.inIteration = oldInIteration9072;
    return markerApply8513(marker9073, delegate8470.createWhileStatement(test9070, body9071));
}
function parseForVariableDeclaration8574() {
    var marker9074 = markerCreate8511(),
        token9075 = lex8508(),
        declarations9076 = parseVariableDeclarationList8560();
    return markerApply8513(marker9074, delegate8470.createVariableDeclaration(declarations9076, token9075.value));
}
function parseForStatement8575(opts9077) {
    var init9078,
        test9079,
        update9080,
        left9081,
        right9082,
        body9083,
        operator9084,
        oldInIteration9085,
        marker9086 = markerCreate8511();
    init9078 = test9079 = update9080 = null;
    expectKeyword8519("for");
    if ( // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
    matchContextualKeyword8522("each")) {
        throwError8515({}, Messages8456.EachNotAllowed);
    }
    expect8518("(");
    if (match8520(";")) {
        lex8508();
    } else {
        if (matchKeyword8521("var") || matchKeyword8521("let") || matchKeyword8521("const")) {
            state8475.allowIn = false;
            init9078 = parseForVariableDeclaration8574();
            state8475.allowIn = true;
            if (init9078.declarations.length === 1) {
                if (matchKeyword8521("in") || matchContextualKeyword8522("of")) {
                    operator9084 = lookahead8473;
                    if (!((operator9084.value === "in" || init9078.kind !== "var") && init9078.declarations[0].init)) {
                        lex8508();
                        left9081 = init9078;
                        right9082 = parseExpression8555();
                        init9078 = null;
                    }
                }
            }
        } else {
            state8475.allowIn = false;
            init9078 = parseExpression8555();
            state8475.allowIn = true;
            if (matchContextualKeyword8522("of")) {
                operator9084 = lex8508();
                left9081 = init9078;
                right9082 = parseExpression8555();
                init9078 = null;
            } else if (matchKeyword8521("in")) {
                if ( // LeftHandSideExpression
                !isAssignableLeftHandSide8526(init9078)) {
                    throwError8515({}, Messages8456.InvalidLHSInForIn);
                }
                operator9084 = lex8508();
                left9081 = init9078;
                right9082 = parseExpression8555();
                init9078 = null;
            }
        }
        if (typeof left9081 === "undefined") {
            expect8518(";");
        }
    }
    if (typeof left9081 === "undefined") {
        if (!match8520(";")) {
            test9079 = parseExpression8555();
        }
        expect8518(";");
        if (!match8520(")")) {
            update9080 = parseExpression8555();
        }
    }
    expect8518(")");
    oldInIteration9085 = state8475.inIteration;
    state8475.inIteration = true;
    if (!(opts9077 !== undefined && opts9077.ignoreBody)) {
        body9083 = parseStatement8586();
    }
    state8475.inIteration = oldInIteration9085;
    if (typeof left9081 === "undefined") {
        return markerApply8513(marker9086, delegate8470.createForStatement(init9078, test9079, update9080, body9083));
    }
    if (operator9084.value === "in") {
        return markerApply8513(marker9086, delegate8470.createForInStatement(left9081, right9082, body9083));
    }
    return markerApply8513(marker9086, delegate8470.createForOfStatement(left9081, right9082, body9083));
}
function parseContinueStatement8576() {
    var label9087 = null,
        key9088,
        marker9089 = markerCreate8511();
    expectKeyword8519("continue");
    if ( // Optimize the most common form: 'continue;'.
    lookahead8473.value.charCodeAt(0) === 59) {
        lex8508();
        if (!state8475.inIteration) {
            throwError8515({}, Messages8456.IllegalContinue);
        }
        return markerApply8513(marker9089, delegate8470.createContinueStatement(null));
    }
    if (peekLineTerminator8514()) {
        if (!state8475.inIteration) {
            throwError8515({}, Messages8456.IllegalContinue);
        }
        return markerApply8513(marker9089, delegate8470.createContinueStatement(null));
    }
    if (lookahead8473.type === Token8451.Identifier) {
        label9087 = parseVariableIdentifier8558();
        key9088 = "$" + label9087.name;
        if (!Object.prototype.hasOwnProperty.call(state8475.labelSet, key9088)) {
            throwError8515({}, Messages8456.UnknownLabel, label9087.name);
        }
    }
    consumeSemicolon8524();
    if (label9087 === null && !state8475.inIteration) {
        throwError8515({}, Messages8456.IllegalContinue);
    }
    return markerApply8513(marker9089, delegate8470.createContinueStatement(label9087));
}
function parseBreakStatement8577() {
    var label9090 = null,
        key9091,
        marker9092 = markerCreate8511();
    expectKeyword8519("break");
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    lookahead8473.value.charCodeAt(0) === 59) {
        lex8508();
        if (!(state8475.inIteration || state8475.inSwitch)) {
            throwError8515({}, Messages8456.IllegalBreak);
        }
        return markerApply8513(marker9092, delegate8470.createBreakStatement(null));
    }
    if (peekLineTerminator8514()) {
        if (!(state8475.inIteration || state8475.inSwitch)) {
            throwError8515({}, Messages8456.IllegalBreak);
        }
        return markerApply8513(marker9092, delegate8470.createBreakStatement(null));
    }
    if (lookahead8473.type === Token8451.Identifier) {
        label9090 = parseVariableIdentifier8558();
        key9091 = "$" + label9090.name;
        if (!Object.prototype.hasOwnProperty.call(state8475.labelSet, key9091)) {
            throwError8515({}, Messages8456.UnknownLabel, label9090.name);
        }
    }
    consumeSemicolon8524();
    if (label9090 === null && !(state8475.inIteration || state8475.inSwitch)) {
        throwError8515({}, Messages8456.IllegalBreak);
    }
    return markerApply8513(marker9092, delegate8470.createBreakStatement(label9090));
}
function parseReturnStatement8578() {
    var argument9093 = null,
        marker9094 = markerCreate8511();
    expectKeyword8519("return");
    if (!state8475.inFunctionBody) {
        throwErrorTolerant8516({}, Messages8456.IllegalReturn);
    }
    if ( // 'return' followed by a space and an identifier is very common.
    isIdentifierStart8485(String(lookahead8473.value).charCodeAt(0))) {
        argument9093 = parseExpression8555();
        consumeSemicolon8524();
        return markerApply8513(marker9094, delegate8470.createReturnStatement(argument9093));
    }
    if (peekLineTerminator8514()) {
        return markerApply8513(marker9094, delegate8470.createReturnStatement(null));
    }
    if (!match8520(";")) {
        if (!match8520("}") && lookahead8473.type !== Token8451.EOF) {
            argument9093 = parseExpression8555();
        }
    }
    consumeSemicolon8524();
    return markerApply8513(marker9094, delegate8470.createReturnStatement(argument9093));
}
function parseWithStatement8579() {
    var object9095,
        body9096,
        marker9097 = markerCreate8511();
    if (strict8461) {
        throwErrorTolerant8516({}, Messages8456.StrictModeWith);
    }
    expectKeyword8519("with");
    expect8518("(");
    object9095 = parseExpression8555();
    expect8518(")");
    body9096 = parseStatement8586();
    return markerApply8513(marker9097, delegate8470.createWithStatement(object9095, body9096));
}
function parseSwitchCase8580() {
    var test9098,
        consequent9099 = [],
        sourceElement9100,
        marker9101 = markerCreate8511();
    if (matchKeyword8521("default")) {
        lex8508();
        test9098 = null;
    } else {
        expectKeyword8519("case");
        test9098 = parseExpression8555();
    }
    expect8518(":");
    while (streamIndex8472 < length8469) {
        if (match8520("}") || matchKeyword8521("default") || matchKeyword8521("case")) {
            break;
        }
        sourceElement9100 = parseSourceElement8601();
        if (typeof sourceElement9100 === "undefined") {
            break;
        }
        consequent9099.push(sourceElement9100);
    }
    return markerApply8513(marker9101, delegate8470.createSwitchCase(test9098, consequent9099));
}
function parseSwitchStatement8581() {
    var discriminant9102,
        cases9103,
        clause9104,
        oldInSwitch9105,
        defaultFound9106,
        marker9107 = markerCreate8511();
    expectKeyword8519("switch");
    expect8518("(");
    discriminant9102 = parseExpression8555();
    expect8518(")");
    expect8518("{");
    cases9103 = [];
    if (match8520("}")) {
        lex8508();
        return markerApply8513(marker9107, delegate8470.createSwitchStatement(discriminant9102, cases9103));
    }
    oldInSwitch9105 = state8475.inSwitch;
    state8475.inSwitch = true;
    defaultFound9106 = false;
    while (streamIndex8472 < length8469) {
        if (match8520("}")) {
            break;
        }
        clause9104 = parseSwitchCase8580();
        if (clause9104.test === null) {
            if (defaultFound9106) {
                throwError8515({}, Messages8456.MultipleDefaultsInSwitch);
            }
            defaultFound9106 = true;
        }
        cases9103.push(clause9104);
    }
    state8475.inSwitch = oldInSwitch9105;
    expect8518("}");
    return markerApply8513(marker9107, delegate8470.createSwitchStatement(discriminant9102, cases9103));
}
function parseThrowStatement8582() {
    var argument9108,
        marker9109 = markerCreate8511();
    expectKeyword8519("throw");
    if (peekLineTerminator8514()) {
        throwError8515({}, Messages8456.NewlineAfterThrow);
    }
    argument9108 = parseExpression8555();
    consumeSemicolon8524();
    return markerApply8513(marker9109, delegate8470.createThrowStatement(argument9108));
}
function parseCatchClause8583() {
    var param9110,
        body9111,
        marker9112 = markerCreate8511();
    expectKeyword8519("catch");
    expect8518("(");
    if (match8520(")")) {
        throwUnexpected8517(lookahead8473);
    }
    param9110 = parseExpression8555();
    if ( // 12.14.1
    strict8461 && param9110.type === Syntax8454.Identifier && isRestrictedWord8489(param9110.name)) {
        throwErrorTolerant8516({}, Messages8456.StrictCatchVariable);
    }
    expect8518(")");
    body9111 = parseBlock8557();
    return markerApply8513(marker9112, delegate8470.createCatchClause(param9110, body9111));
}
function parseTryStatement8584() {
    var block9113,
        handlers9114 = [],
        finalizer9115 = null,
        marker9116 = markerCreate8511();
    expectKeyword8519("try");
    block9113 = parseBlock8557();
    if (matchKeyword8521("catch")) {
        handlers9114.push(parseCatchClause8583());
    }
    if (matchKeyword8521("finally")) {
        lex8508();
        finalizer9115 = parseBlock8557();
    }
    if (handlers9114.length === 0 && !finalizer9115) {
        throwError8515({}, Messages8456.NoCatchOrFinally);
    }
    return markerApply8513(marker9116, delegate8470.createTryStatement(block9113, [], handlers9114, finalizer9115));
}
function parseDebuggerStatement8585() {
    var marker9117 = markerCreate8511();
    expectKeyword8519("debugger");
    consumeSemicolon8524();
    return markerApply8513(marker9117, delegate8470.createDebuggerStatement());
}
function parseStatement8586() {
    var type9118 = lookahead8473.type,
        marker9119,
        expr9120,
        labeledBody9121,
        key9122;
    if (type9118 === Token8451.EOF) {
        throwUnexpected8517(lookahead8473);
    }
    if (type9118 === Token8451.Punctuator) {
        switch (lookahead8473.value) {
            case ";":
                return parseEmptyStatement8569();
            case "{":
                return parseBlock8557();
            case "(":
                return parseExpressionStatement8570();
            default:
                break;
        }
    }
    if (type9118 === Token8451.Keyword) {
        switch (lookahead8473.value) {
            case "break":
                return parseBreakStatement8577();
            case "continue":
                return parseContinueStatement8576();
            case "debugger":
                return parseDebuggerStatement8585();
            case "do":
                return parseDoWhileStatement8572();
            case "for":
                return parseForStatement8575();
            case "function":
                return parseFunctionDeclaration8592();
            case "class":
                return parseClassDeclaration8599();
            case "if":
                return parseIfStatement8571();
            case "return":
                return parseReturnStatement8578();
            case "switch":
                return parseSwitchStatement8581();
            case "throw":
                return parseThrowStatement8582();
            case "try":
                return parseTryStatement8584();
            case "var":
                return parseVariableStatement8561();
            case "while":
                return parseWhileStatement8573();
            case "with":
                return parseWithStatement8579();
            default:
                break;
        }
    }
    marker9119 = markerCreate8511();
    expr9120 = parseExpression8555();
    if ( // 12.12 Labelled Statements
    expr9120.type === Syntax8454.Identifier && match8520(":")) {
        lex8508();
        key9122 = "$" + expr9120.name;
        if (Object.prototype.hasOwnProperty.call(state8475.labelSet, key9122)) {
            throwError8515({}, Messages8456.Redeclaration, "Label", expr9120.name);
        }
        state8475.labelSet[key9122] = true;
        labeledBody9121 = parseStatement8586();
        delete state8475.labelSet[key9122];
        return markerApply8513(marker9119, delegate8470.createLabeledStatement(expr9120, labeledBody9121));
    }
    consumeSemicolon8524();
    return markerApply8513(marker9119, delegate8470.createExpressionStatement(expr9120));
}
function parseConciseBody8587() {
    if (match8520("{")) {
        return parseFunctionSourceElements8588();
    }
    return parseAssignmentExpression8554();
}
function parseFunctionSourceElements8588() {
    var sourceElement9123,
        sourceElements9124 = [],
        token9125,
        directive9126,
        firstRestricted9127,
        oldLabelSet9128,
        oldInIteration9129,
        oldInSwitch9130,
        oldInFunctionBody9131,
        oldParenthesizedCount9132,
        marker9133 = markerCreate8511();
    expect8518("{");
    while (streamIndex8472 < length8469) {
        if (lookahead8473.type !== Token8451.StringLiteral) {
            break;
        }
        token9125 = lookahead8473;
        sourceElement9123 = parseSourceElement8601();
        sourceElements9124.push(sourceElement9123);
        if (sourceElement9123.expression.type !== Syntax8454.Literal) {
            // this is not directive
            break;
        }
        directive9126 = token9125.value;
        if (directive9126 === "use strict") {
            strict8461 = true;
            if (firstRestricted9127) {
                throwErrorTolerant8516(firstRestricted9127, Messages8456.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9127 && token9125.octal) {
                firstRestricted9127 = token9125;
            }
        }
    }
    oldLabelSet9128 = state8475.labelSet;
    oldInIteration9129 = state8475.inIteration;
    oldInSwitch9130 = state8475.inSwitch;
    oldInFunctionBody9131 = state8475.inFunctionBody;
    oldParenthesizedCount9132 = state8475.parenthesizedCount;
    state8475.labelSet = {};
    state8475.inIteration = false;
    state8475.inSwitch = false;
    state8475.inFunctionBody = true;
    state8475.parenthesizedCount = 0;
    while (streamIndex8472 < length8469) {
        if (match8520("}")) {
            break;
        }
        sourceElement9123 = parseSourceElement8601();
        if (typeof sourceElement9123 === "undefined") {
            break;
        }
        sourceElements9124.push(sourceElement9123);
    }
    expect8518("}");
    state8475.labelSet = oldLabelSet9128;
    state8475.inIteration = oldInIteration9129;
    state8475.inSwitch = oldInSwitch9130;
    state8475.inFunctionBody = oldInFunctionBody9131;
    state8475.parenthesizedCount = oldParenthesizedCount9132;
    return markerApply8513(marker9133, delegate8470.createBlockStatement(sourceElements9124));
}
function validateParam8589(options9134, param9135, name9136) {
    var key9137 = "$" + name9136;
    if (strict8461) {
        if (isRestrictedWord8489(name9136)) {
            options9134.stricted = param9135;
            options9134.message = Messages8456.StrictParamName;
        }
        if (Object.prototype.hasOwnProperty.call(options9134.paramSet, key9137)) {
            options9134.stricted = param9135;
            options9134.message = Messages8456.StrictParamDupe;
        }
    } else if (!options9134.firstRestricted) {
        if (isRestrictedWord8489(name9136)) {
            options9134.firstRestricted = param9135;
            options9134.message = Messages8456.StrictParamName;
        } else if (isStrictModeReservedWord8488(name9136)) {
            options9134.firstRestricted = param9135;
            options9134.message = Messages8456.StrictReservedWord;
        } else if (Object.prototype.hasOwnProperty.call(options9134.paramSet, key9137)) {
            options9134.firstRestricted = param9135;
            options9134.message = Messages8456.StrictParamDupe;
        }
    }
    options9134.paramSet[key9137] = true;
}
function parseParam8590(options9138) {
    var token9139, rest9140, param9141, def9142;
    token9139 = lookahead8473;
    if (token9139.value === "...") {
        token9139 = lex8508();
        rest9140 = true;
    }
    if (match8520("[")) {
        param9141 = parseArrayInitialiser8527();
        reinterpretAsDestructuredParameter8551(options9138, param9141);
    } else if (match8520("{")) {
        if (rest9140) {
            throwError8515({}, Messages8456.ObjectPatternAsRestParameter);
        }
        param9141 = parseObjectInitialiser8532();
        reinterpretAsDestructuredParameter8551(options9138, param9141);
    } else {
        param9141 = parseVariableIdentifier8558();
        validateParam8589(options9138, token9139, token9139.value);
    }
    if (match8520("=")) {
        if (rest9140) {
            throwErrorTolerant8516(lookahead8473, Messages8456.DefaultRestParameter);
        }
        lex8508();
        def9142 = parseAssignmentExpression8554();
        ++options9138.defaultCount;
    }
    if (rest9140) {
        if (!match8520(")")) {
            throwError8515({}, Messages8456.ParameterAfterRestParameter);
        }
        options9138.rest = param9141;
        return false;
    }
    options9138.params.push(param9141);
    options9138.defaults.push(def9142);
    return !match8520(")");
}
function parseParams8591(firstRestricted9143) {
    var options9144;
    options9144 = {
        params: [],
        defaultCount: 0,
        defaults: [],
        rest: null,
        firstRestricted: firstRestricted9143
    };
    expect8518("(");
    if (!match8520(")")) {
        options9144.paramSet = {};
        while (streamIndex8472 < length8469) {
            if (!parseParam8590(options9144)) {
                break;
            }
            expect8518(",");
        }
    }
    expect8518(")");
    if (options9144.defaultCount === 0) {
        options9144.defaults = [];
    }
    return options9144;
}
function parseFunctionDeclaration8592() {
    var id9145,
        body9146,
        token9147,
        tmp9148,
        firstRestricted9149,
        message9150,
        previousStrict9151,
        previousYieldAllowed9152,
        generator9153,
        marker9154 = markerCreate8511();
    expectKeyword8519("function");
    generator9153 = false;
    if (match8520("*")) {
        lex8508();
        generator9153 = true;
    }
    token9147 = lookahead8473;
    id9145 = parseVariableIdentifier8558();
    if (strict8461) {
        if (isRestrictedWord8489(token9147.value)) {
            throwErrorTolerant8516(token9147, Messages8456.StrictFunctionName);
        }
    } else {
        if (isRestrictedWord8489(token9147.value)) {
            firstRestricted9149 = token9147;
            message9150 = Messages8456.StrictFunctionName;
        } else if (isStrictModeReservedWord8488(token9147.value)) {
            firstRestricted9149 = token9147;
            message9150 = Messages8456.StrictReservedWord;
        }
    }
    tmp9148 = parseParams8591(firstRestricted9149);
    firstRestricted9149 = tmp9148.firstRestricted;
    if (tmp9148.message) {
        message9150 = tmp9148.message;
    }
    previousStrict9151 = strict8461;
    previousYieldAllowed9152 = state8475.yieldAllowed;
    state8475.yieldAllowed = generator9153;
    body9146 = parseFunctionSourceElements8588();
    if (strict8461 && firstRestricted9149) {
        throwError8515(firstRestricted9149, message9150);
    }
    if (strict8461 && tmp9148.stricted) {
        throwErrorTolerant8516(tmp9148.stricted, message9150);
    }
    strict8461 = previousStrict9151;
    state8475.yieldAllowed = previousYieldAllowed9152;
    return markerApply8513(marker9154, delegate8470.createFunctionDeclaration(id9145, tmp9148.params, tmp9148.defaults, body9146, tmp9148.rest, generator9153, false));
}
function parseFunctionExpression8593() {
    var token9155,
        id9156 = null,
        firstRestricted9157,
        message9158,
        tmp9159,
        body9160,
        previousStrict9161,
        previousYieldAllowed9162,
        generator9163,
        marker9164 = markerCreate8511();
    expectKeyword8519("function");
    generator9163 = false;
    if (match8520("*")) {
        lex8508();
        generator9163 = true;
    }
    if (!match8520("(")) {
        token9155 = lookahead8473;
        id9156 = parseVariableIdentifier8558();
        if (strict8461) {
            if (isRestrictedWord8489(token9155.value)) {
                throwErrorTolerant8516(token9155, Messages8456.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord8489(token9155.value)) {
                firstRestricted9157 = token9155;
                message9158 = Messages8456.StrictFunctionName;
            } else if (isStrictModeReservedWord8488(token9155.value)) {
                firstRestricted9157 = token9155;
                message9158 = Messages8456.StrictReservedWord;
            }
        }
    }
    tmp9159 = parseParams8591(firstRestricted9157);
    firstRestricted9157 = tmp9159.firstRestricted;
    if (tmp9159.message) {
        message9158 = tmp9159.message;
    }
    previousStrict9161 = strict8461;
    previousYieldAllowed9162 = state8475.yieldAllowed;
    state8475.yieldAllowed = generator9163;
    body9160 = parseFunctionSourceElements8588();
    if (strict8461 && firstRestricted9157) {
        throwError8515(firstRestricted9157, message9158);
    }
    if (strict8461 && tmp9159.stricted) {
        throwErrorTolerant8516(tmp9159.stricted, message9158);
    }
    strict8461 = previousStrict9161;
    state8475.yieldAllowed = previousYieldAllowed9162;
    return markerApply8513(marker9164, delegate8470.createFunctionExpression(id9156, tmp9159.params, tmp9159.defaults, body9160, tmp9159.rest, generator9163, false));
}
function parseYieldExpression8594() {
    var yieldToken9165,
        delegateFlag9166,
        expr9167,
        marker9168 = markerCreate8511();
    yieldToken9165 = lex8508();
    assert8478(yieldToken9165.value === "yield", "Called parseYieldExpression with non-yield lookahead.");
    if (!state8475.yieldAllowed) {
        throwErrorTolerant8516({}, Messages8456.IllegalYield);
    }
    delegateFlag9166 = false;
    if (match8520("*")) {
        lex8508();
        delegateFlag9166 = true;
    }
    expr9167 = parseAssignmentExpression8554();
    return markerApply8513(marker9168, delegate8470.createYieldExpression(expr9167, delegateFlag9166));
}
function parseMethodDefinition8595(existingPropNames9169) {
    var token9170,
        key9171,
        param9172,
        propType9173,
        isValidDuplicateProp9174 = false,
        marker9175 = markerCreate8511();
    if (lookahead8473.value === "static") {
        propType9173 = ClassPropertyType8459["static"];
        lex8508();
    } else {
        propType9173 = ClassPropertyType8459.prototype;
    }
    if (match8520("*")) {
        lex8508();
        return markerApply8513(marker9175, delegate8470.createMethodDefinition(propType9173, "", parseObjectPropertyKey8530(), parsePropertyMethodFunction8529({ generator: true })));
    }
    token9170 = lookahead8473;
    key9171 = parseObjectPropertyKey8530();
    if (token9170.value === "get" && !match8520("(")) {
        key9171 = parseObjectPropertyKey8530();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a setter
        existingPropNames9169[propType9173].hasOwnProperty(key9171.name)) {
            isValidDuplicateProp9174 = // There isn't already a getter for this prop
            existingPropNames9169[propType9173][key9171.name].get === undefined && // There isn't already a data prop by this name
            existingPropNames9169[propType9173][key9171.name].data === undefined && // The only existing prop by this name is a setter
            existingPropNames9169[propType9173][key9171.name].set !== undefined;
            if (!isValidDuplicateProp9174) {
                throwError8515(key9171, Messages8456.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9169[propType9173][key9171.name] = {};
        }
        existingPropNames9169[propType9173][key9171.name].get = true;
        expect8518("(");
        expect8518(")");
        return markerApply8513(marker9175, delegate8470.createMethodDefinition(propType9173, "get", key9171, parsePropertyFunction8528({ generator: false })));
    }
    if (token9170.value === "set" && !match8520("(")) {
        key9171 = parseObjectPropertyKey8530();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a getter
        existingPropNames9169[propType9173].hasOwnProperty(key9171.name)) {
            isValidDuplicateProp9174 = // There isn't already a setter for this prop
            existingPropNames9169[propType9173][key9171.name].set === undefined && // There isn't already a data prop by this name
            existingPropNames9169[propType9173][key9171.name].data === undefined && // The only existing prop by this name is a getter
            existingPropNames9169[propType9173][key9171.name].get !== undefined;
            if (!isValidDuplicateProp9174) {
                throwError8515(key9171, Messages8456.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9169[propType9173][key9171.name] = {};
        }
        existingPropNames9169[propType9173][key9171.name].set = true;
        expect8518("(");
        token9170 = lookahead8473;
        param9172 = [parseVariableIdentifier8558()];
        expect8518(")");
        return markerApply8513(marker9175, delegate8470.createMethodDefinition(propType9173, "set", key9171, parsePropertyFunction8528({
            params: param9172,
            generator: false,
            name: token9170
        })));
    }
    if ( // It is a syntax error if any other properties have the same name as a
    // non-getter, non-setter method
    existingPropNames9169[propType9173].hasOwnProperty(key9171.name)) {
        throwError8515(key9171, Messages8456.IllegalDuplicateClassProperty);
    } else {
        existingPropNames9169[propType9173][key9171.name] = {};
    }
    existingPropNames9169[propType9173][key9171.name].data = true;
    return markerApply8513(marker9175, delegate8470.createMethodDefinition(propType9173, "", key9171, parsePropertyMethodFunction8529({ generator: false })));
}
function parseClassElement8596(existingProps9176) {
    if (match8520(";")) {
        lex8508();
        return;
    }
    return parseMethodDefinition8595(existingProps9176);
}
function parseClassBody8597() {
    var classElement9177,
        classElements9178 = [],
        existingProps9179 = {},
        marker9180 = markerCreate8511();
    existingProps9179[ClassPropertyType8459["static"]] = {};
    existingProps9179[ClassPropertyType8459.prototype] = {};
    expect8518("{");
    while (streamIndex8472 < length8469) {
        if (match8520("}")) {
            break;
        }
        classElement9177 = parseClassElement8596(existingProps9179);
        if (typeof classElement9177 !== "undefined") {
            classElements9178.push(classElement9177);
        }
    }
    expect8518("}");
    return markerApply8513(marker9180, delegate8470.createClassBody(classElements9178));
}
function parseClassExpression8598() {
    var id9181,
        previousYieldAllowed9182,
        superClass9183 = null,
        marker9184 = markerCreate8511();
    expectKeyword8519("class");
    if (!matchKeyword8521("extends") && !match8520("{")) {
        id9181 = parseVariableIdentifier8558();
    }
    if (matchKeyword8521("extends")) {
        expectKeyword8519("extends");
        previousYieldAllowed9182 = state8475.yieldAllowed;
        state8475.yieldAllowed = false;
        superClass9183 = parseAssignmentExpression8554();
        state8475.yieldAllowed = previousYieldAllowed9182;
    }
    return markerApply8513(marker9184, delegate8470.createClassExpression(id9181, superClass9183, parseClassBody8597()));
}
function parseClassDeclaration8599() {
    var id9185,
        previousYieldAllowed9186,
        superClass9187 = null,
        marker9188 = markerCreate8511();
    expectKeyword8519("class");
    id9185 = parseVariableIdentifier8558();
    if (matchKeyword8521("extends")) {
        expectKeyword8519("extends");
        previousYieldAllowed9186 = state8475.yieldAllowed;
        state8475.yieldAllowed = false;
        superClass9187 = parseAssignmentExpression8554();
        state8475.yieldAllowed = previousYieldAllowed9186;
    }
    return markerApply8513(marker9188, delegate8470.createClassDeclaration(id9185, superClass9187, parseClassBody8597()));
}
function matchModuleDeclaration8600() {
    var id9189;
    if (matchContextualKeyword8522("module")) {
        id9189 = lookahead28510();
        return id9189.type === Token8451.StringLiteral || id9189.type === Token8451.Identifier;
    }
    return false;
}
function parseSourceElement8601() {
    if (lookahead8473.type === Token8451.Keyword) {
        switch (lookahead8473.value) {
            case "const":
            case "let":
                return parseConstLetDeclaration8562(lookahead8473.value);
            case "function":
                return parseFunctionDeclaration8592();
            case "export":
                return parseExportDeclaration8566();
            case "import":
                return parseImportDeclaration8567();
            default:
                return parseStatement8586();
        }
    }
    if (matchModuleDeclaration8600()) {
        throwError8515({}, Messages8456.NestedModule);
    }
    if (lookahead8473.type !== Token8451.EOF) {
        return parseStatement8586();
    }
}
function parseProgramElement8602() {
    if (lookahead8473.type === Token8451.Keyword) {
        switch (lookahead8473.value) {
            case "export":
                return parseExportDeclaration8566();
            case "import":
                return parseImportDeclaration8567();
        }
    }
    if (matchModuleDeclaration8600()) {
        return parseModuleDeclaration8563();
    }
    return parseSourceElement8601();
}
function parseProgramElements8603() {
    var sourceElement9190,
        sourceElements9191 = [],
        token9192,
        directive9193,
        firstRestricted9194;
    while (streamIndex8472 < length8469) {
        token9192 = lookahead8473;
        if (token9192.type !== Token8451.StringLiteral) {
            break;
        }
        sourceElement9190 = parseProgramElement8602();
        sourceElements9191.push(sourceElement9190);
        if (sourceElement9190.expression.type !== Syntax8454.Literal) {
            // this is not directive
            break;
        }
        directive9193 = token9192.value;
        if (directive9193 === "use strict") {
            strict8461 = true;
            if (firstRestricted9194) {
                throwErrorTolerant8516(firstRestricted9194, Messages8456.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9194 && token9192.octal) {
                firstRestricted9194 = token9192;
            }
        }
    }
    while (streamIndex8472 < length8469) {
        sourceElement9190 = parseProgramElement8602();
        if (typeof sourceElement9190 === "undefined") {
            break;
        }
        sourceElements9191.push(sourceElement9190);
    }
    return sourceElements9191;
}
function parseModuleElement8604() {
    return parseSourceElement8601();
}
function parseModuleElements8605() {
    var list9195 = [],
        statement9196;
    while (streamIndex8472 < length8469) {
        if (match8520("}")) {
            break;
        }
        statement9196 = parseModuleElement8604();
        if (typeof statement9196 === "undefined") {
            break;
        }
        list9195.push(statement9196);
    }
    return list9195;
}
function parseModuleBlock8606() {
    var block9197,
        marker9198 = markerCreate8511();
    expect8518("{");
    block9197 = parseModuleElements8605();
    expect8518("}");
    return markerApply8513(marker9198, delegate8470.createBlockStatement(block9197));
}
function parseProgram8607() {
    var body9199,
        marker9200 = markerCreate8511();
    strict8461 = false;
    peek8509();
    body9199 = parseProgramElements8603();
    return markerApply8513(marker9200, delegate8470.createProgram(body9199));
}
function addComment8608(type9201, value9202, start9203, end9204, loc9205) {
    var comment9206;
    assert8478(typeof start9203 === "number", "Comment must have valid position");
    if ( // Because the way the actual token is scanned, often the comments
    // (if any) are skipped twice during the lexical analysis.
    // Thus, we need to skip adding a comment if the comment array already
    // handled it.
    state8475.lastCommentStart >= start9203) {
        return;
    }
    state8475.lastCommentStart = start9203;
    comment9206 = {
        type: type9201,
        value: value9202
    };
    if (extra8477.range) {
        comment9206.range = [start9203, end9204];
    }
    if (extra8477.loc) {
        comment9206.loc = loc9205;
    }
    extra8477.comments.push(comment9206);
    if (extra8477.attachComment) {
        extra8477.leadingComments.push(comment9206);
        extra8477.trailingComments.push(comment9206);
    }
}
function scanComment8609() {
    var comment9207, ch9208, loc9209, start9210, blockComment9211, lineComment9212;
    comment9207 = "";
    blockComment9211 = false;
    lineComment9212 = false;
    while (index8462 < length8469) {
        ch9208 = source8460[index8462];
        if (lineComment9212) {
            ch9208 = source8460[index8462++];
            if (isLineTerminator8484(ch9208.charCodeAt(0))) {
                loc9209.end = {
                    line: lineNumber8463,
                    column: index8462 - lineStart8464 - 1
                };
                lineComment9212 = false;
                addComment8608("Line", comment9207, start9210, index8462 - 1, loc9209);
                if (ch9208 === "\r" && source8460[index8462] === "\n") {
                    ++index8462;
                }
                ++lineNumber8463;
                lineStart8464 = index8462;
                comment9207 = "";
            } else if (index8462 >= length8469) {
                lineComment9212 = false;
                comment9207 += ch9208;
                loc9209.end = {
                    line: lineNumber8463,
                    column: length8469 - lineStart8464
                };
                addComment8608("Line", comment9207, start9210, length8469, loc9209);
            } else {
                comment9207 += ch9208;
            }
        } else if (blockComment9211) {
            if (isLineTerminator8484(ch9208.charCodeAt(0))) {
                if (ch9208 === "\r" && source8460[index8462 + 1] === "\n") {
                    ++index8462;
                    comment9207 += "\r\n";
                } else {
                    comment9207 += ch9208;
                }
                ++lineNumber8463;
                ++index8462;
                lineStart8464 = index8462;
                if (index8462 >= length8469) {
                    throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch9208 = source8460[index8462++];
                if (index8462 >= length8469) {
                    throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
                }
                comment9207 += ch9208;
                if (ch9208 === "*") {
                    ch9208 = source8460[index8462];
                    if (ch9208 === "/") {
                        comment9207 = comment9207.substr(0, comment9207.length - 1);
                        blockComment9211 = false;
                        ++index8462;
                        loc9209.end = {
                            line: lineNumber8463,
                            column: index8462 - lineStart8464
                        };
                        addComment8608("Block", comment9207, start9210, index8462, loc9209);
                        comment9207 = "";
                    }
                }
            }
        } else if (ch9208 === "/") {
            ch9208 = source8460[index8462 + 1];
            if (ch9208 === "/") {
                loc9209 = {
                    start: {
                        line: lineNumber8463,
                        column: index8462 - lineStart8464
                    }
                };
                start9210 = index8462;
                index8462 += 2;
                lineComment9212 = true;
                if (index8462 >= length8469) {
                    loc9209.end = {
                        line: lineNumber8463,
                        column: index8462 - lineStart8464
                    };
                    lineComment9212 = false;
                    addComment8608("Line", comment9207, start9210, index8462, loc9209);
                }
            } else if (ch9208 === "*") {
                start9210 = index8462;
                index8462 += 2;
                blockComment9211 = true;
                loc9209 = {
                    start: {
                        line: lineNumber8463,
                        column: index8462 - lineStart8464 - 2
                    }
                };
                if (index8462 >= length8469) {
                    throwError8515({}, Messages8456.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8483(ch9208.charCodeAt(0))) {
            ++index8462;
        } else if (isLineTerminator8484(ch9208.charCodeAt(0))) {
            ++index8462;
            if (ch9208 === "\r" && source8460[index8462] === "\n") {
                ++index8462;
            }
            ++lineNumber8463;
            lineStart8464 = index8462;
        } else {
            break;
        }
    }
}
function collectToken8610() {
    var start9213, loc9214, token9215, range9216, value9217;
    skipComment8491();
    start9213 = index8462;
    loc9214 = {
        start: {
            line: lineNumber8463,
            column: index8462 - lineStart8464
        }
    };
    token9215 = extra8477.advance();
    loc9214.end = {
        line: lineNumber8463,
        column: index8462 - lineStart8464
    };
    if (token9215.type !== Token8451.EOF) {
        range9216 = [token9215.range[0], token9215.range[1]];
        value9217 = source8460.slice(token9215.range[0], token9215.range[1]);
        extra8477.tokens.push({
            type: TokenName8452[token9215.type],
            value: value9217,
            range: range9216,
            loc: loc9214
        });
    }
    return token9215;
}
function collectRegex8611() {
    var pos9218, loc9219, regex9220, token9221;
    skipComment8491();
    pos9218 = index8462;
    loc9219 = {
        start: {
            line: lineNumber8463,
            column: index8462 - lineStart8464
        }
    };
    regex9220 = extra8477.scanRegExp();
    loc9219.end = {
        line: lineNumber8463,
        column: index8462 - lineStart8464
    };
    if (!extra8477.tokenize) {
        if ( // Pop the previous token, which is likely '/' or '/='
        extra8477.tokens.length > 0) {
            token9221 = extra8477.tokens[extra8477.tokens.length - 1];
            if (token9221.range[0] === pos9218 && token9221.type === "Punctuator") {
                if (token9221.value === "/" || token9221.value === "/=") {
                    extra8477.tokens.pop();
                }
            }
        }
        extra8477.tokens.push({
            type: "RegularExpression",
            value: regex9220.literal,
            range: [pos9218, index8462],
            loc: loc9219
        });
    }
    return regex9220;
}
function filterTokenLocation8612() {
    var i9222,
        entry9223,
        token9224,
        tokens9225 = [];
    for (i9222 = 0; i9222 < extra8477.tokens.length; ++i9222) {
        entry9223 = extra8477.tokens[i9222];
        token9224 = {
            type: entry9223.type,
            value: entry9223.value
        };
        if (extra8477.range) {
            token9224.range = entry9223.range;
        }
        if (extra8477.loc) {
            token9224.loc = entry9223.loc;
        }
        tokens9225.push(token9224);
    }
    extra8477.tokens = tokens9225;
}
function patch8613() {
    if (extra8477.comments) {
        extra8477.skipComment = skipComment8491;
        skipComment8491 = scanComment8609;
    }
    if (typeof extra8477.tokens !== "undefined") {
        extra8477.advance = advance8507;
        extra8477.scanRegExp = scanRegExp8504;
        advance8507 = collectToken8610;
        scanRegExp8504 = collectRegex8611;
    }
}
function unpatch8614() {
    if (typeof extra8477.skipComment === "function") {
        skipComment8491 = extra8477.skipComment;
    }
    if (typeof extra8477.scanRegExp === "function") {
        advance8507 = extra8477.advance;
        scanRegExp8504 = extra8477.scanRegExp;
    }
}
function extend8615(object9226, properties9227) {
    var entry9228,
        result9229 = {};
    for (entry9228 in object9226) {
        if (object9226.hasOwnProperty(entry9228)) {
            result9229[entry9228] = object9226[entry9228];
        }
    }
    for (entry9228 in properties9227) {
        if (properties9227.hasOwnProperty(entry9228)) {
            result9229[entry9228] = properties9227[entry9228];
        }
    }
    return result9229;
}
function tokenize8616(code9230, options9231) {
    var toString9232, token9233, tokens9234;
    toString9232 = String;
    if (typeof code9230 !== "string" && !(code9230 instanceof String)) {
        code9230 = toString9232(code9230);
    }
    delegate8470 = SyntaxTreeDelegate8458;
    source8460 = code9230;
    index8462 = 0;
    lineNumber8463 = source8460.length > 0 ? 1 : 0;
    lineStart8464 = 0;
    length8469 = source8460.length;
    lookahead8473 = null;
    state8475 = {
        allowKeyword: true,
        allowIn: true,
        labelSet: {},
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        lastCommentStart: -1
    };
    extra8477 = {};
    // Options matching.
    options9231 = options9231 || {};
    // Of course we collect tokens here.
    options9231.tokens = true;
    extra8477.tokens = [];
    extra8477.tokenize = true;
    // The following two fields are necessary to compute the Regex tokens.
    extra8477.openParenToken = -1;
    extra8477.openCurlyToken = -1;
    extra8477.range = typeof options9231.range === "boolean" && options9231.range;
    extra8477.loc = typeof options9231.loc === "boolean" && options9231.loc;
    if (typeof options9231.comment === "boolean" && options9231.comment) {
        extra8477.comments = [];
    }
    if (typeof options9231.tolerant === "boolean" && options9231.tolerant) {
        extra8477.errors = [];
    }
    if (length8469 > 0) {
        if (typeof source8460[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9230 instanceof String) {
                source8460 = code9230.valueOf();
            }
        }
    }
    patch8613();
    try {
        peek8509();
        if (lookahead8473.type === Token8451.EOF) {
            return extra8477.tokens;
        }
        token9233 = lex8508();
        while (lookahead8473.type !== Token8451.EOF) {
            try {
                token9233 = lex8508();
            } catch (lexError9235) {
                token9233 = lookahead8473;
                if (extra8477.errors) {
                    extra8477.errors.push(lexError9235);
                    // We have to break on the first error
                    // to avoid infinite loops.
                    break;
                } else {
                    throw lexError9235;
                }
            }
        }
        filterTokenLocation8612();
        tokens9234 = extra8477.tokens;
        if (typeof extra8477.comments !== "undefined") {
            tokens9234.comments = extra8477.comments;
        }
        if (typeof extra8477.errors !== "undefined") {
            tokens9234.errors = extra8477.errors;
        }
    } catch (e9236) {
        throw e9236;
    } finally {
        unpatch8614();
        extra8477 = {};
    }
    return tokens9234;
}
function blockAllowed8617(toks9237, start9238, inExprDelim9239, parentIsBlock9240) {
    var assignOps9241 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
    var binaryOps9242 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
    var unaryOps9243 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
    function back9244(n9245) {
        var idx9246 = toks9237.length - n9245 > 0 ? toks9237.length - n9245 : 0;
        return toks9237[idx9246];
    }
    if (inExprDelim9239 && toks9237.length - (start9238 + 2) <= 0) {
        // ... ({...} ...)
        return false;
    } else if (back9244(start9238 + 2).value === ":" && parentIsBlock9240) {
        // ...{a:{b:{...}}}
        return true;
    } else if (isIn8479(back9244(start9238 + 2).value, unaryOps9243.concat(binaryOps9242).concat(assignOps9241))) {
        // ... + {...}
        return false;
    } else if (back9244(start9238 + 2).value === "return") {
        var // ASI makes `{}` a block in:
        //
        //    return
        //    { ... }
        //
        // otherwise an object literal, so it's an
        // expression and thus / is divide
        currLineNumber9247 = typeof back9244(start9238 + 1).startLineNumber !== "undefined" ? back9244(start9238 + 1).startLineNumber : back9244(start9238 + 1).lineNumber;
        if (back9244(start9238 + 2).lineNumber !== currLineNumber9247) {
            return true;
        } else {
            return false;
        }
    } else if (isIn8479(back9244(start9238 + 2).value, ["void", "typeof", "in", "case", "delete"])) {
        // ... in {}
        return false;
    } else {
        return true;
    }
}
var // Readtables
readtables8618 = {
    currentReadtable: {},
    // A readtable is invoked within `readToken`, but it can
    // return multiple tokens. We need to "queue" the stream of
    // tokens so that subsequent calls to `readToken` gets the
    // rest of the stream.
    queued: [],
    // A readtable can only override punctuators
    punctuators: ";,.:!?~=%&*+-/<>^|#@",
    has: function has(ch9248) {
        return readtables8618.currentReadtable[ch9248] && readtables8618.punctuators.indexOf(ch9248) !== -1;
    },
    getQueued: function getQueued() {
        return readtables8618.queued.length ? readtables8618.queued.shift() : null;
    },
    peekQueued: function peekQueued(lookahead9249) {
        lookahead9249 = lookahead9249 ? lookahead9249 : 1;
        return readtables8618.queued.length ? readtables8618.queued[lookahead9249 - 1] : null;
    },
    invoke: function invoke(ch9250, toks9251) {
        var prevState9252 = snapshotParserState8619();
        var newStream9253 = readtables8618.currentReadtable[ch9250](ch9250, readtables8618.readerAPI, toks9251, source8460, index8462);
        if (!newStream9253) {
            // Reset the state
            restoreParserState8620(prevState9252);
            return null;
        } else if (!Array.isArray(newStream9253)) {
            newStream9253 = [newStream9253];
        }
        this.queued = this.queued.concat(newStream9253);
        return this.getQueued();
    }
};
function snapshotParserState8619() {
    return {
        index: index8462,
        lineNumber: lineNumber8463,
        lineStart: lineStart8464
    };
}
function restoreParserState8620(prevState9254) {
    index8462 = prevState9254.index;
    lineNumber8463 = prevState9254.lineNumber;
    lineStart8464 = prevState9254.lineStart;
}
function suppressReadError8621(func9255) {
    var prevState9256 = snapshotParserState8619();
    try {
        return func9255();
    } catch (e9257) {
        if (!(e9257 instanceof SyntaxError) && !(e9257 instanceof TypeError)) {
            restoreParserState8620(prevState9256);
            return null;
        }
        throw e9257;
    }
}
function makeIdentifier8622(value9258, opts9259) {
    opts9259 = opts9259 || {};
    var type9260 = Token8451.Identifier;
    if (isKeyword8490(value9258)) {
        type9260 = Token8451.Keyword;
    } else if (value9258 === "null") {
        type9260 = Token8451.NullLiteral;
    } else if (value9258 === "true" || value9258 === "false") {
        type9260 = Token8451.BooleanLiteral;
    }
    return {
        type: type9260,
        value: value9258,
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [opts9259.start || index8462, index8462]
    };
}
function makePunctuator8623(value9261, opts9262) {
    opts9262 = opts9262 || {};
    return {
        type: Token8451.Punctuator,
        value: value9261,
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [opts9262.start || index8462, index8462]
    };
}
function makeStringLiteral8624(value9263, opts9264) {
    opts9264 = opts9264 || {};
    return {
        type: Token8451.StringLiteral,
        value: value9263,
        octal: !!opts9264.octal,
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [opts9264.start || index8462, index8462]
    };
}
function makeNumericLiteral8625(value9265, opts9266) {
    opts9266 = opts9266 || {};
    return {
        type: Token8451.NumericLiteral,
        value: value9265,
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [opts9266.start || index8462, index8462]
    };
}
function makeRegExp8626(value9267, opts9268) {
    opts9268 = opts9268 || {};
    return {
        type: Token8451.RegularExpression,
        value: value9267,
        literal: value9267.toString(),
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [opts9268.start || index8462, index8462]
    };
}
function makeDelimiter8627(value9269, inner9270) {
    var current9271 = {
        lineNumber: lineNumber8463,
        lineStart: lineStart8464,
        range: [index8462, index8462]
    };
    var firstTok9272 = inner9270.length ? inner9270[0] : current9271;
    var lastTok9273 = inner9270.length ? inner9270[inner9270.length - 1] : current9271;
    return {
        type: Token8451.Delimiter,
        value: value9269,
        inner: inner9270,
        startLineNumber: firstTok9272.lineNumber,
        startLineStart: firstTok9272.lineStart,
        startRange: firstTok9272.range,
        endLineNumber: lastTok9273.lineNumber,
        endLineStart: lastTok9273.lineStart,
        endRange: lastTok9273.range
    };
}
var // Since an actual parser object doesn't exist and we want to
// introduce our own API anyway, we create a special reader object
// for reader extensions
readerAPI8628 = Object.defineProperties({
    Token: Token8451,
    isIdentifierStart: isIdentifierStart8485,
    isIdentifierPart: isIdentifierPart8486,
    isLineTerminator: isLineTerminator8484,
    readIdentifier: scanIdentifier8496,
    readPunctuator: scanPunctuator8497,
    readStringLiteral: scanStringLiteral8501,
    readNumericLiteral: scanNumericLiteral8500,
    readRegExp: scanRegExp8504,
    readToken: function readToken() {
        return readToken8629([], false, false);
    },
    readDelimiter: function readDelimiter() {
        return readDelim8630([], false, false);
    },
    skipComment: scanComment8609,
    makeIdentifier: makeIdentifier8622,
    makePunctuator: makePunctuator8623,
    makeStringLiteral: makeStringLiteral8624,
    makeNumericLiteral: makeNumericLiteral8625,
    makeRegExp: makeRegExp8626,
    makeDelimiter: makeDelimiter8627,
    suppressReadError: suppressReadError8621,
    peekQueued: readtables8618.peekQueued,
    getQueued: readtables8618.getQueued
}, {
    source: {
        get: function () {
            return source8460;
        },
        enumerable: true,
        configurable: true
    },
    index: {
        get: function () {
            return index8462;
        },
        set: function (x) {
            index8462 = x;
        },
        enumerable: true,
        configurable: true
    },
    length: {
        get: function () {
            return length8469;
        },
        set: function (x) {
            length8469 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineNumber: {
        get: function () {
            return lineNumber8463;
        },
        set: function (x) {
            lineNumber8463 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineStart: {
        get: function () {
            return lineStart8464;
        },
        set: function (x) {
            lineStart8464 = x;
        },
        enumerable: true,
        configurable: true
    },
    extra: {
        get: function () {
            return extra8477;
        },
        enumerable: true,
        configurable: true
    }
});
readtables8618.readerAPI = readerAPI8628;
function readToken8629(toks9274, inExprDelim9275, parentIsBlock9276) {
    var delimiters9277 = ["(", "{", "["];
    var parenIdents9278 = ["if", "while", "for", "with"];
    var last9279 = toks9274.length - 1;
    var comments9280,
        commentsLen9281 = extra8477.comments.length;
    function back9282(n9288) {
        var idx9289 = toks9274.length - n9288 > 0 ? toks9274.length - n9288 : 0;
        return toks9274[idx9289];
    }
    function attachComments9283(token9290) {
        if (comments9280) {
            token9290.leadingComments = comments9280;
        }
        return token9290;
    }
    function _advance9284() {
        return attachComments9283(advance8507());
    }
    function _scanRegExp9285() {
        return attachComments9283(scanRegExp8504());
    }
    skipComment8491();
    var ch9286 = source8460[index8462];
    if (extra8477.comments.length > commentsLen9281) {
        comments9280 = extra8477.comments.slice(commentsLen9281);
    }
    if (isIn8479(source8460[index8462], delimiters9277)) {
        return attachComments9283(readDelim8630(toks9274, inExprDelim9275, parentIsBlock9276));
    }
    // Check if we should get the token from the readtable
    var readtableToken9287;
    if ((readtableToken9287 = readtables8618.getQueued()) || readtables8618.has(ch9286) && (readtableToken9287 = readtables8618.invoke(ch9286, toks9274))) {
        return readtableToken9287;
    }
    if (ch9286 === "/") {
        var prev9291 = back9282(1);
        if (prev9291) {
            if (prev9291.value === "()") {
                if (isIn8479(back9282(2).value, parenIdents9278)) {
                    // ... if (...) / ...
                    return _scanRegExp9285();
                }
                // ... (...) / ...
                return _advance9284();
            }
            if (prev9291.value === "{}") {
                if (blockAllowed8617(toks9274, 0, inExprDelim9275, parentIsBlock9276)) {
                    if (back9282(2).value === "()") {
                        if ( // named function
                        back9282(4).value === "function") {
                            if (!blockAllowed8617(toks9274, 3, inExprDelim9275, parentIsBlock9276)) {
                                // new function foo (...) {...} / ...
                                return _advance9284();
                            }
                            if (toks9274.length - 5 <= 0 && inExprDelim9275) {
                                // (function foo (...) {...} /...)
                                // [function foo (...) {...} /...]
                                return _advance9284();
                            }
                        }
                        if ( // unnamed function
                        back9282(3).value === "function") {
                            if (!blockAllowed8617(toks9274, 2, inExprDelim9275, parentIsBlock9276)) {
                                // new function (...) {...} / ...
                                return _advance9284();
                            }
                            if (toks9274.length - 4 <= 0 && inExprDelim9275) {
                                // (function (...) {...} /...)
                                // [function (...) {...} /...]
                                return _advance9284();
                            }
                        }
                    }
                    // ...; {...} /...
                    return _scanRegExp9285();
                } else {
                    // ... + {...} / ...
                    return _advance9284();
                }
            }
            if (prev9291.type === Token8451.Punctuator) {
                // ... + /...
                return _scanRegExp9285();
            }
            if (isKeyword8490(prev9291.value) && prev9291.value !== "this" && prev9291.value !== "let" && prev9291.value !== "export") {
                // typeof /...
                return _scanRegExp9285();
            }
            return _advance9284();
        }
        return _scanRegExp9285();
    }
    return _advance9284();
}
function readDelim8630(toks9292, inExprDelim9293, parentIsBlock9294) {
    var startDelim9295 = advance8507(),
        matchDelim9296 = {
        "(": ")",
        "{": "}",
        "[": "]"
    },
        inner9297 = [];
    var delimiters9298 = ["(", "{", "["];
    assert8478(delimiters9298.indexOf(startDelim9295.value) !== -1, "Need to begin at the delimiter");
    var token9299 = startDelim9295;
    var startLineNumber9300 = token9299.lineNumber;
    var startLineStart9301 = token9299.lineStart;
    var startRange9302 = token9299.range;
    var delimToken9303 = {};
    delimToken9303.type = Token8451.Delimiter;
    delimToken9303.value = startDelim9295.value + matchDelim9296[startDelim9295.value];
    delimToken9303.startLineNumber = startLineNumber9300;
    delimToken9303.startLineStart = startLineStart9301;
    delimToken9303.startRange = startRange9302;
    var delimIsBlock9304 = false;
    if (startDelim9295.value === "{") {
        delimIsBlock9304 = blockAllowed8617(toks9292.concat(delimToken9303), 0, inExprDelim9293, parentIsBlock9294);
    }
    while (index8462 <= length8469) {
        token9299 = readToken8629(inner9297, startDelim9295.value === "(" || startDelim9295.value === "[", delimIsBlock9304);
        if (token9299.type === Token8451.Punctuator && token9299.value === matchDelim9296[startDelim9295.value]) {
            if (token9299.leadingComments) {
                delimToken9303.trailingComments = token9299.leadingComments;
            }
            break;
        } else if (token9299.type === Token8451.EOF) {
            throwError8515({}, Messages8456.UnexpectedEOS);
        } else {
            inner9297.push(token9299);
        }
    }
    if ( // at the end of the stream but the very last char wasn't the closing delimiter
    index8462 >= length8469 && matchDelim9296[startDelim9295.value] !== source8460[length8469 - 1]) {
        throwError8515({}, Messages8456.UnexpectedEOS);
    }
    var endLineNumber9305 = token9299.lineNumber;
    var endLineStart9306 = token9299.lineStart;
    var endRange9307 = token9299.range;
    delimToken9303.inner = inner9297;
    delimToken9303.endLineNumber = endLineNumber9305;
    delimToken9303.endLineStart = endLineStart9306;
    delimToken9303.endRange = endRange9307;
    return delimToken9303;
}
function setReadtable8631(readtable9308, syn9309) {
    readtables8618.currentReadtable = readtable9308;
    if (syn9309) {
        readtables8618.readerAPI.throwSyntaxError = function (name9310, message9311, tok9312) {
            var sx9313 = syn9309.syntaxFromToken(tok9312);
            var err9314 = new syn9309.MacroSyntaxError(name9310, message9311, sx9313);
            throw new SyntaxError(syn9309.printSyntaxError(source8460, err9314));
        };
    }
}
function currentReadtable8632() {
    return readtables8618.currentReadtable;
}
function read8633(code9315) {
    var token9316,
        tokenTree9317 = [];
    extra8477 = {};
    extra8477.comments = [];
    extra8477.range = true;
    extra8477.loc = true;
    patch8613();
    source8460 = code9315;
    index8462 = 0;
    lineNumber8463 = source8460.length > 0 ? 1 : 0;
    lineStart8464 = 0;
    length8469 = source8460.length;
    state8475 = {
        allowIn: true,
        labelSet: {},
        lastParenthesized: null,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false
    };
    while (index8462 < length8469 || readtables8618.peekQueued()) {
        tokenTree9317.push(readToken8629(tokenTree9317, false, false));
    }
    var last9318 = tokenTree9317[tokenTree9317.length - 1];
    if (last9318 && last9318.type !== Token8451.EOF) {
        tokenTree9317.push({
            type: Token8451.EOF,
            value: "",
            lineNumber: last9318.lineNumber,
            lineStart: last9318.lineStart,
            range: [index8462, index8462]
        });
    }
    return expander8450.tokensToSyntax(tokenTree9317);
}
function parse8634(code9319, options9320) {
    var program9321, toString9322;
    extra8477 = {};
    if ( // given an array of tokens instead of a string
    Array.isArray(code9319)) {
        tokenStream8471 = code9319;
        length8469 = tokenStream8471.length;
        lineNumber8463 = tokenStream8471.length > 0 ? 1 : 0;
        source8460 = undefined;
    } else {
        toString9322 = String;
        if (typeof code9319 !== "string" && !(code9319 instanceof String)) {
            code9319 = toString9322(code9319);
        }
        source8460 = code9319;
        length8469 = source8460.length;
        lineNumber8463 = source8460.length > 0 ? 1 : 0;
    }
    delegate8470 = SyntaxTreeDelegate8458;
    streamIndex8472 = -1;
    index8462 = 0;
    lineStart8464 = 0;
    sm_lineStart8466 = 0;
    sm_lineNumber8465 = lineNumber8463;
    sm_index8468 = 0;
    sm_range8467 = [0, 0];
    lookahead8473 = null;
    phase8476 = options9320 && typeof options9320.phase !== "undefined" ? options9320.phase : 0;
    state8475 = {
        allowKeyword: false,
        allowIn: true,
        labelSet: {},
        parenthesizedCount: 0,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        yieldAllowed: false
    };
    extra8477.attachComment = true;
    extra8477.range = true;
    extra8477.comments = [];
    extra8477.bottomRightStack = [];
    extra8477.trailingComments = [];
    extra8477.leadingComments = [];
    if (typeof options9320 !== "undefined") {
        extra8477.range = typeof options9320.range === "boolean" && options9320.range;
        extra8477.loc = typeof options9320.loc === "boolean" && options9320.loc;
        extra8477.attachComment = typeof options9320.attachComment === "boolean" && options9320.attachComment;
        if (extra8477.loc && options9320.source !== null && options9320.source !== undefined) {
            delegate8470 = extend8615(delegate8470, {
                postProcess: function (node9323) {
                    node9323.loc.source = toString9322(options9320.source);
                    return node9323;
                }
            });
        }
        if (typeof options9320.tokens === "boolean" && options9320.tokens) {
            extra8477.tokens = [];
        }
        if (typeof options9320.comment === "boolean" && options9320.comment) {
            extra8477.comments = [];
        }
        if (typeof options9320.tolerant === "boolean" && options9320.tolerant) {
            extra8477.errors = [];
        }
    }
    if (length8469 > 0) {
        if (source8460 && typeof source8460[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9319 instanceof String) {
                source8460 = code9319.valueOf();
            }
        }
    }
    extra8477.loc = true;
    extra8477.errors = [];
    patch8613();
    try {
        program9321 = parseProgram8607();
        if (typeof extra8477.comments !== "undefined") {
            program9321.comments = extra8477.comments;
        }
        if (typeof extra8477.tokens !== "undefined") {
            filterTokenLocation8612();
            program9321.tokens = extra8477.tokens;
        }
        if (typeof extra8477.errors !== "undefined") {
            program9321.errors = extra8477.errors;
        }
    } catch (e9324) {
        throw e9324;
    } finally {
        unpatch8614();
        extra8477 = {};
    }
    return program9321;
}
exports.tokenize = tokenize8616;
exports.read = read8633;
exports.Token = Token8451;
exports.setReadtable = setReadtable8631;
exports.currentReadtable = currentReadtable8632;
exports.parse = parse8634;
// Deep copy.
exports.Syntax = (function () {
    var name9325,
        types9326 = {};
    if (typeof Object.create === "function") {
        types9326 = Object.create(null);
    }
    for (name9325 in Syntax8454) {
        if (Syntax8454.hasOwnProperty(name9325)) {
            types9326[name9325] = Syntax8454[name9325];
        }
    }
    if (typeof Object.freeze === "function") {
        Object.freeze(types9326);
    }
    return types9326;
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