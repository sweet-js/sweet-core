"use strict";

var expander8398 = require("./expander");
var Token8399, TokenName8400, FnExprTokens8401, Syntax8402, PropertyKind8403, Messages8404, Regex8405, SyntaxTreeDelegate8406, ClassPropertyType8407, source8408, strict8409, index8410, lineNumber8411, lineStart8412, sm_lineNumber8413, sm_lineStart8414, sm_range8415, sm_index8416, length8417, delegate8418, tokenStream8419, streamIndex8420, lookahead8421, lookaheadIndex8422, state8423, phase8424, extra8425;
Token8399 = {
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
TokenName8400 = {};
TokenName8400[Token8399.BooleanLiteral] = "Boolean";
TokenName8400[Token8399.EOF] = "<end>";
TokenName8400[Token8399.Identifier] = "Identifier";
TokenName8400[Token8399.Keyword] = "Keyword";
TokenName8400[Token8399.NullLiteral] = "Null";
TokenName8400[Token8399.NumericLiteral] = "Numeric";
TokenName8400[Token8399.Punctuator] = "Punctuator";
TokenName8400[Token8399.StringLiteral] = "String";
TokenName8400[Token8399.RegularExpression] = "RegularExpression";
TokenName8400[Token8399.Delimiter] = "Delimiter";
// A function following one of those tokens is an expression.
FnExprTokens8401 = ["(", "{", "[", "in", "typeof", "instanceof", "new", "return", "case", "delete", "throw", "void",
// assignment operators
"=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ",",
// binary/unary operators
"+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!=="];
Syntax8402 = {
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
PropertyKind8403 = {
    Data: 1,
    Get: 2,
    Set: 4
};
ClassPropertyType8407 = {
    "static": "static",
    prototype: "prototype"
};
// Error messages should be identical to V8.
Messages8404 = {
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
Regex8405 = {
    NonAsciiIdentifierStart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),
    NonAsciiIdentifierPart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")
};
function assert8426(condition8582, message8583) {
    if (!condition8582) {
        throw new Error("ASSERT: " + message8583);
    }
}
function isIn8427(el8584, list8585) {
    return list8585.indexOf(el8584) !== -1;
}
function isDecimalDigit8428(ch8586) {
    return ch8586 >= 48 && ch8586 <= 57;
}
function isHexDigit8429(ch8587) {
    return "0123456789abcdefABCDEF".indexOf(ch8587) >= 0;
}
function isOctalDigit8430(ch8588) {
    return "01234567".indexOf(ch8588) >= 0;
}
function isWhiteSpace8431(ch8589) {
    return ch8589 === 32 || // space
    ch8589 === 9 || // tab
    ch8589 === 11 || ch8589 === 12 || ch8589 === 160 || ch8589 >= 5760 && " ᠎             　﻿".indexOf(String.fromCharCode(ch8589)) > 0;
}
function isLineTerminator8432(ch8590) {
    return ch8590 === 10 || ch8590 === 13 || ch8590 === 8232 || ch8590 === 8233;
}
function isIdentifierStart8433(ch8591) {
    return ch8591 === 36 || ch8591 === 95 || // $ (dollar) and _ (underscore)
    ch8591 >= 65 && ch8591 <= 90 || // A..Z
    ch8591 >= 97 && ch8591 <= 122 || // a..z
    ch8591 === 92 || // \ (backslash)
    ch8591 >= 128 && Regex8405.NonAsciiIdentifierStart.test(String.fromCharCode(ch8591));
}
function isIdentifierPart8434(ch8592) {
    return ch8592 === 36 || ch8592 === 95 || // $ (dollar) and _ (underscore)
    ch8592 >= 65 && ch8592 <= 90 || // A..Z
    ch8592 >= 97 && ch8592 <= 122 || // a..z
    ch8592 >= 48 && ch8592 <= 57 || // 0..9
    ch8592 === 92 || // \ (backslash)
    ch8592 >= 128 && Regex8405.NonAsciiIdentifierPart.test(String.fromCharCode(ch8592));
}
function isFutureReservedWord8435(id8593) {
    switch (id8593) {
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
function isStrictModeReservedWord8436(id8594) {
    switch (id8594) {
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
function isRestrictedWord8437(id8595) {
    return id8595 === "eval" || id8595 === "arguments";
}
function isKeyword8438(id8596) {
    if (strict8409 && isStrictModeReservedWord8436(id8596)) {
        return true;
    }
    switch ( // 'const' is specialized as Keyword in V8.
    // 'yield' is only treated as a keyword in strict mode.
    // 'let' is for compatiblity with SpiderMonkey and ES.next.
    // Some others are from future reserved words.
    id8596.length) {
        case 2:
            return id8596 === "if" || id8596 === "in" || id8596 === "do";
        case 3:
            return id8596 === "var" || id8596 === "for" || id8596 === "new" || id8596 === "try" || id8596 === "let";
        case 4:
            return id8596 === "this" || id8596 === "else" || id8596 === "case" || id8596 === "void" || id8596 === "with" || id8596 === "enum";
        case 5:
            return id8596 === "while" || id8596 === "break" || id8596 === "catch" || id8596 === "throw" || id8596 === "const" || id8596 === "class" || id8596 === "super";
        case 6:
            return id8596 === "return" || id8596 === "typeof" || id8596 === "delete" || id8596 === "switch" || id8596 === "export" || id8596 === "import";
        case 7:
            return id8596 === "default" || id8596 === "finally" || id8596 === "extends";
        case 8:
            return id8596 === "function" || id8596 === "continue" || id8596 === "debugger";
        case 10:
            return id8596 === "instanceof";
        default:
            return false;
    }
}
function skipComment8439() {
    var ch8597, blockComment8598, lineComment8599;
    blockComment8598 = false;
    lineComment8599 = false;
    while (index8410 < length8417) {
        ch8597 = source8408.charCodeAt(index8410);
        if (lineComment8599) {
            ++index8410;
            if (isLineTerminator8432(ch8597)) {
                lineComment8599 = false;
                if (ch8597 === 13 && source8408.charCodeAt(index8410) === 10) {
                    ++index8410;
                }
                ++lineNumber8411;
                lineStart8412 = index8410;
            }
        } else if (blockComment8598) {
            if (isLineTerminator8432(ch8597)) {
                if (ch8597 === 13 && source8408.charCodeAt(index8410 + 1) === 10) {
                    ++index8410;
                }
                ++lineNumber8411;
                ++index8410;
                lineStart8412 = index8410;
                if (index8410 >= length8417) {
                    throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch8597 = source8408.charCodeAt(index8410++);
                if (index8410 >= length8417) {
                    throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
                }
                if ( // Block comment ends with '*/' (char #42, char #47).
                ch8597 === 42) {
                    ch8597 = source8408.charCodeAt(index8410);
                    if (ch8597 === 47) {
                        ++index8410;
                        blockComment8598 = false;
                    }
                }
            }
        } else if (ch8597 === 47) {
            ch8597 = source8408.charCodeAt(index8410 + 1);
            if ( // Line comment starts with '//' (char #47, char #47).
            ch8597 === 47) {
                index8410 += 2;
                lineComment8599 = true;
            } else if (ch8597 === 42) {
                // Block comment starts with '/*' (char #47, char #42).
                index8410 += 2;
                blockComment8598 = true;
                if (index8410 >= length8417) {
                    throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8431(ch8597)) {
            ++index8410;
        } else if (isLineTerminator8432(ch8597)) {
            ++index8410;
            if (ch8597 === 13 && source8408.charCodeAt(index8410) === 10) {
                ++index8410;
            }
            ++lineNumber8411;
            lineStart8412 = index8410;
        } else {
            break;
        }
    }
}
function scanHexEscape8440(prefix8600) {
    var i8601,
        len8602,
        ch8603,
        code8604 = 0;
    len8602 = prefix8600 === "u" ? 4 : 2;
    for (i8601 = 0; i8601 < len8602; ++i8601) {
        if (index8410 < length8417 && isHexDigit8429(source8408[index8410])) {
            ch8603 = source8408[index8410++];
            code8604 = code8604 * 16 + "0123456789abcdef".indexOf(ch8603.toLowerCase());
        } else {
            return "";
        }
    }
    return String.fromCharCode(code8604);
}
function scanUnicodeCodePointEscape8441() {
    var ch8605, code8606, cu18607, cu28608;
    ch8605 = source8408[index8410];
    code8606 = 0;
    if ( // At least, one hex digit is required.
    ch8605 === "}") {
        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
    }
    while (index8410 < length8417) {
        ch8605 = source8408[index8410++];
        if (!isHexDigit8429(ch8605)) {
            break;
        }
        code8606 = code8606 * 16 + "0123456789abcdef".indexOf(ch8605.toLowerCase());
    }
    if (code8606 > 1114111 || ch8605 !== "}") {
        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
    }
    if ( // UTF-16 Encoding
    code8606 <= 65535) {
        return String.fromCharCode(code8606);
    }
    cu18607 = (code8606 - 65536 >> 10) + 55296;
    cu28608 = (code8606 - 65536 & 1023) + 56320;
    return String.fromCharCode(cu18607, cu28608);
}
function getEscapedIdentifier8442() {
    var ch8609, id8610;
    ch8609 = source8408.charCodeAt(index8410++);
    id8610 = String.fromCharCode(ch8609);
    if ( // '\u' (char #92, char #117) denotes an escaped character.
    ch8609 === 92) {
        if (source8408.charCodeAt(index8410) !== 117) {
            throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
        }
        ++index8410;
        ch8609 = scanHexEscape8440("u");
        if (!ch8609 || ch8609 === "\\" || !isIdentifierStart8433(ch8609.charCodeAt(0))) {
            throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
        }
        id8610 = ch8609;
    }
    while (index8410 < length8417) {
        ch8609 = source8408.charCodeAt(index8410);
        if (!isIdentifierPart8434(ch8609)) {
            break;
        }
        ++index8410;
        id8610 += String.fromCharCode(ch8609);
        if ( // '\u' (char #92, char #117) denotes an escaped character.
        ch8609 === 92) {
            id8610 = id8610.substr(0, id8610.length - 1);
            if (source8408.charCodeAt(index8410) !== 117) {
                throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
            }
            ++index8410;
            ch8609 = scanHexEscape8440("u");
            if (!ch8609 || ch8609 === "\\" || !isIdentifierPart8434(ch8609.charCodeAt(0))) {
                throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
            }
            id8610 += ch8609;
        }
    }
    return id8610;
}
function getIdentifier8443() {
    var start8611, ch8612;
    start8611 = index8410++;
    while (index8410 < length8417) {
        ch8612 = source8408.charCodeAt(index8410);
        if (ch8612 === 92) {
            // Blackslash (char #92) marks Unicode escape sequence.
            index8410 = start8611;
            return getEscapedIdentifier8442();
        }
        if (isIdentifierPart8434(ch8612)) {
            ++index8410;
        } else {
            break;
        }
    }
    return source8408.slice(start8611, index8410);
}
function scanIdentifier8444() {
    var start8613, id8614, type8615;
    start8613 = index8410;
    // Backslash (char #92) starts an escaped character.
    id8614 = source8408.charCodeAt(index8410) === 92 ? getEscapedIdentifier8442() : getIdentifier8443();
    if ( // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    id8614.length === 1) {
        type8615 = Token8399.Identifier;
    } else if (isKeyword8438(id8614)) {
        type8615 = Token8399.Keyword;
    } else if (id8614 === "null") {
        type8615 = Token8399.NullLiteral;
    } else if (id8614 === "true" || id8614 === "false") {
        type8615 = Token8399.BooleanLiteral;
    } else {
        type8615 = Token8399.Identifier;
    }
    return {
        type: type8615,
        value: id8614,
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [start8613, index8410]
    };
}
function scanPunctuator8445() {
    var start8616 = index8410,
        code8617 = source8408.charCodeAt(index8410),
        code28618,
        ch18619 = source8408[index8410],
        ch28620,
        ch38621,
        ch48622;
    switch (code8617) {
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
            ++index8410;
            if (extra8425.tokenize) {
                if (code8617 === 40) {
                    extra8425.openParenToken = extra8425.tokens.length;
                } else if (code8617 === 123) {
                    extra8425.openCurlyToken = extra8425.tokens.length;
                }
            }
            return {
                type: Token8399.Punctuator,
                value: String.fromCharCode(code8617),
                lineNumber: lineNumber8411,
                lineStart: lineStart8412,
                range: [start8616, index8410]
            };
        default:
            code28618 = source8408.charCodeAt(index8410 + 1);
            if ( // '=' (char #61) marks an assignment or comparison operator.
            code28618 === 61) {
                switch (code8617) {
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
                        index8410 += 2;
                        return {
                            type: Token8399.Punctuator,
                            value: String.fromCharCode(code8617) + String.fromCharCode(code28618),
                            lineNumber: lineNumber8411,
                            lineStart: lineStart8412,
                            range: [start8616, index8410]
                        };
                    case 33:
                    case // !
                    61:
                        // =
                        index8410 += 2;
                        if ( // !== and ===
                        source8408.charCodeAt(index8410) === 61) {
                            ++index8410;
                        }
                        return {
                            type: Token8399.Punctuator,
                            value: source8408.slice(start8616, index8410),
                            lineNumber: lineNumber8411,
                            lineStart: lineStart8412,
                            range: [start8616, index8410]
                        };
                    default:
                        break;
                }
            }
            break;
    }
    // Peek more characters.
    ch28620 = source8408[index8410 + 1];
    ch38621 = source8408[index8410 + 2];
    ch48622 = source8408[index8410 + 3];
    if ( // 4-character punctuator: >>>=
    ch18619 === ">" && ch28620 === ">" && ch38621 === ">") {
        if (ch48622 === "=") {
            index8410 += 4;
            return {
                type: Token8399.Punctuator,
                value: ">>>=",
                lineNumber: lineNumber8411,
                lineStart: lineStart8412,
                range: [start8616, index8410]
            };
        }
    }
    if ( // 3-character punctuators: === !== >>> <<= >>=
    ch18619 === ">" && ch28620 === ">" && ch38621 === ">") {
        index8410 += 3;
        return {
            type: Token8399.Punctuator,
            value: ">>>",
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [start8616, index8410]
        };
    }
    if (ch18619 === "<" && ch28620 === "<" && ch38621 === "=") {
        index8410 += 3;
        return {
            type: Token8399.Punctuator,
            value: "<<=",
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [start8616, index8410]
        };
    }
    if (ch18619 === ">" && ch28620 === ">" && ch38621 === "=") {
        index8410 += 3;
        return {
            type: Token8399.Punctuator,
            value: ">>=",
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [start8616, index8410]
        };
    }
    if (ch18619 === "." && ch28620 === "." && ch38621 === ".") {
        index8410 += 3;
        return {
            type: Token8399.Punctuator,
            value: "...",
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [start8616, index8410]
        };
    }
    if ( // Other 2-character punctuators: ++ -- << >> && ||
    ch18619 === ch28620 && "+-<>&|".indexOf(ch18619) >= 0) {
        index8410 += 2;
        return {
            type: Token8399.Punctuator,
            value: ch18619 + ch28620,
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [start8616, index8410]
        };
    }
    if (ch18619 === "=" && ch28620 === ">") {
        index8410 += 2;
        return {
            type: Token8399.Punctuator,
            value: "=>",
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [start8616, index8410]
        };
    }
    if ("<>=!+-*%&|^/".indexOf(ch18619) >= 0) {
        ++index8410;
        return {
            type: Token8399.Punctuator,
            value: ch18619,
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [start8616, index8410]
        };
    }
    if (ch18619 === ".") {
        ++index8410;
        return {
            type: Token8399.Punctuator,
            value: ch18619,
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [start8616, index8410]
        };
    }
    throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
}
function scanHexLiteral8446(start8623) {
    var number8624 = "";
    while (index8410 < length8417) {
        if (!isHexDigit8429(source8408[index8410])) {
            break;
        }
        number8624 += source8408[index8410++];
    }
    if (number8624.length === 0) {
        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8433(source8408.charCodeAt(index8410))) {
        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8399.NumericLiteral,
        value: parseInt("0x" + number8624, 16),
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [start8623, index8410]
    };
}
function scanOctalLiteral8447(prefix8625, start8626) {
    var number8627, octal8628;
    if (isOctalDigit8430(prefix8625)) {
        octal8628 = true;
        number8627 = "0" + source8408[index8410++];
    } else {
        octal8628 = false;
        ++index8410;
        number8627 = "";
    }
    while (index8410 < length8417) {
        if (!isOctalDigit8430(source8408[index8410])) {
            break;
        }
        number8627 += source8408[index8410++];
    }
    if (!octal8628 && number8627.length === 0) {
        // only 0o or 0O
        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8433(source8408.charCodeAt(index8410)) || isDecimalDigit8428(source8408.charCodeAt(index8410))) {
        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8399.NumericLiteral,
        value: parseInt(number8627, 8),
        octal: octal8628,
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [start8626, index8410]
    };
}
function scanNumericLiteral8448() {
    var number8629, start8630, ch8631, octal8632;
    ch8631 = source8408[index8410];
    assert8426(isDecimalDigit8428(ch8631.charCodeAt(0)) || ch8631 === ".", "Numeric literal must start with a decimal digit or a decimal point");
    start8630 = index8410;
    number8629 = "";
    if (ch8631 !== ".") {
        number8629 = source8408[index8410++];
        ch8631 = source8408[index8410];
        if ( // Hex number starts with '0x'.
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        // Binary number in ES6 starts with '0b'.
        number8629 === "0") {
            if (ch8631 === "x" || ch8631 === "X") {
                ++index8410;
                return scanHexLiteral8446(start8630);
            }
            if (ch8631 === "b" || ch8631 === "B") {
                ++index8410;
                number8629 = "";
                while (index8410 < length8417) {
                    ch8631 = source8408[index8410];
                    if (ch8631 !== "0" && ch8631 !== "1") {
                        break;
                    }
                    number8629 += source8408[index8410++];
                }
                if (number8629.length === 0) {
                    // only 0b or 0B
                    throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
                }
                if (index8410 < length8417) {
                    ch8631 = source8408.charCodeAt(index8410);
                    if (isIdentifierStart8433(ch8631) || isDecimalDigit8428(ch8631)) {
                        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
                    }
                }
                return {
                    type: Token8399.NumericLiteral,
                    value: parseInt(number8629, 2),
                    lineNumber: lineNumber8411,
                    lineStart: lineStart8412,
                    range: [start8630, index8410]
                };
            }
            if (ch8631 === "o" || ch8631 === "O" || isOctalDigit8430(ch8631)) {
                return scanOctalLiteral8447(ch8631, start8630);
            }
            if ( // decimal number starts with '0' such as '09' is illegal.
            ch8631 && isDecimalDigit8428(ch8631.charCodeAt(0))) {
                throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
            }
        }
        while (isDecimalDigit8428(source8408.charCodeAt(index8410))) {
            number8629 += source8408[index8410++];
        }
        ch8631 = source8408[index8410];
    }
    if (ch8631 === ".") {
        number8629 += source8408[index8410++];
        while (isDecimalDigit8428(source8408.charCodeAt(index8410))) {
            number8629 += source8408[index8410++];
        }
        ch8631 = source8408[index8410];
    }
    if (ch8631 === "e" || ch8631 === "E") {
        number8629 += source8408[index8410++];
        ch8631 = source8408[index8410];
        if (ch8631 === "+" || ch8631 === "-") {
            number8629 += source8408[index8410++];
        }
        if (isDecimalDigit8428(source8408.charCodeAt(index8410))) {
            while (isDecimalDigit8428(source8408.charCodeAt(index8410))) {
                number8629 += source8408[index8410++];
            }
        } else {
            throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
        }
    }
    if (isIdentifierStart8433(source8408.charCodeAt(index8410))) {
        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8399.NumericLiteral,
        value: parseFloat(number8629),
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [start8630, index8410]
    };
}
function scanStringLiteral8449() {
    var str8633 = "",
        quote8634,
        start8635,
        ch8636,
        code8637,
        unescaped8638,
        restore8639,
        octal8640 = false;
    quote8634 = source8408[index8410];
    assert8426(quote8634 === "'" || quote8634 === "\"", "String literal must starts with a quote");
    start8635 = index8410;
    ++index8410;
    while (index8410 < length8417) {
        ch8636 = source8408[index8410++];
        if (ch8636 === quote8634) {
            quote8634 = "";
            break;
        } else if (ch8636 === "\\") {
            ch8636 = source8408[index8410++];
            if (!ch8636 || !isLineTerminator8432(ch8636.charCodeAt(0))) {
                switch (ch8636) {
                    case "n":
                        str8633 += "\n";
                        break;
                    case "r":
                        str8633 += "\r";
                        break;
                    case "t":
                        str8633 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8408[index8410] === "{") {
                            ++index8410;
                            str8633 += scanUnicodeCodePointEscape8441();
                        } else {
                            restore8639 = index8410;
                            unescaped8638 = scanHexEscape8440(ch8636);
                            if (unescaped8638) {
                                str8633 += unescaped8638;
                            } else {
                                index8410 = restore8639;
                                str8633 += ch8636;
                            }
                        }
                        break;
                    case "b":
                        str8633 += "\b";
                        break;
                    case "f":
                        str8633 += "\f";
                        break;
                    case "v":
                        str8633 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8430(ch8636)) {
                            code8637 = "01234567".indexOf(ch8636);
                            if ( // \0 is not octal escape sequence
                            code8637 !== 0) {
                                octal8640 = true;
                            }
                            if (index8410 < length8417 && isOctalDigit8430(source8408[index8410])) {
                                octal8640 = true;
                                code8637 = code8637 * 8 + "01234567".indexOf(source8408[index8410++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8636) >= 0 && index8410 < length8417 && isOctalDigit8430(source8408[index8410])) {
                                    code8637 = code8637 * 8 + "01234567".indexOf(source8408[index8410++]);
                                }
                            }
                            str8633 += String.fromCharCode(code8637);
                        } else {
                            str8633 += ch8636;
                        }
                        break;
                }
            } else {
                ++lineNumber8411;
                if (ch8636 === "\r" && source8408[index8410] === "\n") {
                    ++index8410;
                }
                lineStart8412 = index8410;
            }
        } else if (isLineTerminator8432(ch8636.charCodeAt(0))) {
            break;
        } else {
            str8633 += ch8636;
        }
    }
    if (quote8634 !== "") {
        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8399.StringLiteral,
        value: str8633,
        octal: octal8640,
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [start8635, index8410]
    };
}
function scanTemplate8450() {
    var cooked8641 = "",
        ch8642,
        start8643,
        terminated8644,
        tail8645,
        restore8646,
        unescaped8647,
        code8648,
        octal8649;
    terminated8644 = false;
    tail8645 = false;
    start8643 = index8410;
    ++index8410;
    while (index8410 < length8417) {
        ch8642 = source8408[index8410++];
        if (ch8642 === "`") {
            tail8645 = true;
            terminated8644 = true;
            break;
        } else if (ch8642 === "$") {
            if (source8408[index8410] === "{") {
                ++index8410;
                terminated8644 = true;
                break;
            }
            cooked8641 += ch8642;
        } else if (ch8642 === "\\") {
            ch8642 = source8408[index8410++];
            if (!isLineTerminator8432(ch8642.charCodeAt(0))) {
                switch (ch8642) {
                    case "n":
                        cooked8641 += "\n";
                        break;
                    case "r":
                        cooked8641 += "\r";
                        break;
                    case "t":
                        cooked8641 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8408[index8410] === "{") {
                            ++index8410;
                            cooked8641 += scanUnicodeCodePointEscape8441();
                        } else {
                            restore8646 = index8410;
                            unescaped8647 = scanHexEscape8440(ch8642);
                            if (unescaped8647) {
                                cooked8641 += unescaped8647;
                            } else {
                                index8410 = restore8646;
                                cooked8641 += ch8642;
                            }
                        }
                        break;
                    case "b":
                        cooked8641 += "\b";
                        break;
                    case "f":
                        cooked8641 += "\f";
                        break;
                    case "v":
                        cooked8641 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8430(ch8642)) {
                            code8648 = "01234567".indexOf(ch8642);
                            if ( // \0 is not octal escape sequence
                            code8648 !== 0) {
                                octal8649 = true;
                            }
                            if (index8410 < length8417 && isOctalDigit8430(source8408[index8410])) {
                                octal8649 = true;
                                code8648 = code8648 * 8 + "01234567".indexOf(source8408[index8410++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8642) >= 0 && index8410 < length8417 && isOctalDigit8430(source8408[index8410])) {
                                    code8648 = code8648 * 8 + "01234567".indexOf(source8408[index8410++]);
                                }
                            }
                            cooked8641 += String.fromCharCode(code8648);
                        } else {
                            cooked8641 += ch8642;
                        }
                        break;
                }
            } else {
                ++lineNumber8411;
                if (ch8642 === "\r" && source8408[index8410] === "\n") {
                    ++index8410;
                }
                lineStart8412 = index8410;
            }
        } else if (isLineTerminator8432(ch8642.charCodeAt(0))) {
            ++lineNumber8411;
            if (ch8642 === "\r" && source8408[index8410] === "\n") {
                ++index8410;
            }
            lineStart8412 = index8410;
            cooked8641 += "\n";
        } else {
            cooked8641 += ch8642;
        }
    }
    if (!terminated8644) {
        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8399.Template,
        value: {
            cooked: cooked8641,
            raw: source8408.slice(start8643 + 1, index8410 - (tail8645 ? 1 : 2))
        },
        tail: tail8645,
        octal: octal8649,
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [start8643, index8410]
    };
}
function scanTemplateElement8451(option8650) {
    var startsWith8651, template8652;
    lookahead8421 = null;
    skipComment8439();
    startsWith8651 = option8650.head ? "`" : "}";
    if (source8408[index8410] !== startsWith8651) {
        throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
    }
    template8652 = scanTemplate8450();
    return template8652;
}
function scanRegExp8452() {
    var str8653,
        ch8654,
        start8655,
        pattern8656,
        flags8657,
        value8658,
        classMarker8659 = false,
        restore8660,
        terminated8661 = false,
        tmp8662;
    lookahead8421 = null;
    skipComment8439();
    start8655 = index8410;
    ch8654 = source8408[index8410];
    assert8426(ch8654 === "/", "Regular expression literal must start with a slash");
    str8653 = source8408[index8410++];
    while (index8410 < length8417) {
        ch8654 = source8408[index8410++];
        str8653 += ch8654;
        if (classMarker8659) {
            if (ch8654 === "]") {
                classMarker8659 = false;
            }
        } else {
            if (ch8654 === "\\") {
                ch8654 = source8408[index8410++];
                if ( // ECMA-262 7.8.5
                isLineTerminator8432(ch8654.charCodeAt(0))) {
                    throwError8463({}, Messages8404.UnterminatedRegExp);
                }
                str8653 += ch8654;
            } else if (ch8654 === "/") {
                terminated8661 = true;
                break;
            } else if (ch8654 === "[") {
                classMarker8659 = true;
            } else if (isLineTerminator8432(ch8654.charCodeAt(0))) {
                throwError8463({}, Messages8404.UnterminatedRegExp);
            }
        }
    }
    if (!terminated8661) {
        throwError8463({}, Messages8404.UnterminatedRegExp);
    }
    // Exclude leading and trailing slash.
    pattern8656 = str8653.substr(1, str8653.length - 2);
    flags8657 = "";
    while (index8410 < length8417) {
        ch8654 = source8408[index8410];
        if (!isIdentifierPart8434(ch8654.charCodeAt(0))) {
            break;
        }
        ++index8410;
        if (ch8654 === "\\" && index8410 < length8417) {
            ch8654 = source8408[index8410];
            if (ch8654 === "u") {
                ++index8410;
                restore8660 = index8410;
                ch8654 = scanHexEscape8440("u");
                if (ch8654) {
                    flags8657 += ch8654;
                    for (str8653 += "\\u"; restore8660 < index8410; ++restore8660) {
                        str8653 += source8408[restore8660];
                    }
                } else {
                    index8410 = restore8660;
                    flags8657 += "u";
                    str8653 += "\\u";
                }
            } else {
                str8653 += "\\";
            }
        } else {
            flags8657 += ch8654;
            str8653 += ch8654;
        }
    }
    tmp8662 = pattern8656;
    if (flags8657.indexOf("u") >= 0) {
        // Replace each astral symbol and every Unicode code point
        // escape sequence that represents such a symbol with a single
        // ASCII symbol to avoid throwing on regular expressions that
        // are only valid in combination with the `/u` flag.
        tmp8662 = tmp8662.replace(/\\u\{([0-9a-fA-F]{5,6})\}/g, "x").replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
    }
    try {
        // First, detect invalid regular expressions.
        value8658 = new RegExp(tmp8662);
    } catch (e8663) {
        throwError8463({}, Messages8404.InvalidRegExp);
    }
    try {
        // Return a regular expression object for this pattern-flag pair, or
        // `null` in case the current environment doesn't support the flags it
        // uses.
        value8658 = new RegExp(pattern8656, flags8657);
    } catch (exception8664) {
        value8658 = null;
    }
    if (extra8425.tokenize) {
        return {
            type: Token8399.RegularExpression,
            value: value8658,
            regex: {
                pattern: pattern8656,
                flags: flags8657
            },
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [start8655, index8410]
        };
    }
    return {
        type: Token8399.RegularExpression,
        literal: str8653,
        regex: {
            pattern: pattern8656,
            flags: flags8657
        },
        value: value8658,
        range: [start8655, index8410]
    };
}
function isIdentifierName8453(token8665) {
    return token8665.type === Token8399.Identifier || token8665.type === Token8399.Keyword || token8665.type === Token8399.BooleanLiteral || token8665.type === Token8399.NullLiteral;
}
function advanceSlash8454() {
    var prevToken8666, checkToken8667;
    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design
    prevToken8666 = extra8425.tokens[extra8425.tokens.length - 1];
    if (!prevToken8666) {
        // Nothing before that: it cannot be a division.
        return scanRegExp8452();
    }
    if (prevToken8666.type === "Punctuator") {
        if (prevToken8666.value === ")") {
            checkToken8667 = extra8425.tokens[extra8425.openParenToken - 1];
            if (checkToken8667 && checkToken8667.type === "Keyword" && (checkToken8667.value === "if" || checkToken8667.value === "while" || checkToken8667.value === "for" || checkToken8667.value === "with")) {
                return scanRegExp8452();
            }
            return scanPunctuator8445();
        }
        if (prevToken8666.value === "}") {
            if ( // Dividing a function by anything makes little sense,
            // but we have to check for that.
            extra8425.tokens[extra8425.openCurlyToken - 3] && extra8425.tokens[extra8425.openCurlyToken - 3].type === "Keyword") {
                // Anonymous function.
                checkToken8667 = extra8425.tokens[extra8425.openCurlyToken - 4];
                if (!checkToken8667) {
                    return scanPunctuator8445();
                }
            } else if (extra8425.tokens[extra8425.openCurlyToken - 4] && extra8425.tokens[extra8425.openCurlyToken - 4].type === "Keyword") {
                // Named function.
                checkToken8667 = extra8425.tokens[extra8425.openCurlyToken - 5];
                if (!checkToken8667) {
                    return scanRegExp8452();
                }
            } else {
                return scanPunctuator8445();
            }
            if ( // checkToken determines whether the function is
            // a declaration or an expression.
            FnExprTokens8401.indexOf(checkToken8667.value) >= 0) {
                // It is an expression.
                return scanPunctuator8445();
            }
            // It is a declaration.
            return scanRegExp8452();
        }
        return scanRegExp8452();
    }
    if (prevToken8666.type === "Keyword") {
        return scanRegExp8452();
    }
    return scanPunctuator8445();
}
function advance8455() {
    var ch8668;
    skipComment8439();
    if (index8410 >= length8417) {
        return {
            type: Token8399.EOF,
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [index8410, index8410]
        };
    }
    ch8668 = source8408.charCodeAt(index8410);
    if ( // Very common: ( and ) and ;
    ch8668 === 40 || ch8668 === 41 || ch8668 === 58) {
        return scanPunctuator8445();
    }
    if ( // String literal starts with single quote (#39) or double quote (#34).
    ch8668 === 39 || ch8668 === 34) {
        return scanStringLiteral8449();
    }
    if (ch8668 === 96) {
        return scanTemplate8450();
    }
    if (isIdentifierStart8433(ch8668)) {
        return scanIdentifier8444();
    }
    if ( // # and @ are allowed for sweet.js
    ch8668 === 35 || ch8668 === 64) {
        ++index8410;
        return {
            type: Token8399.Punctuator,
            value: String.fromCharCode(ch8668),
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [index8410 - 1, index8410]
        };
    }
    if ( // Dot (.) char #46 can also start a floating-point number, hence the need
    // to check the next character.
    ch8668 === 46) {
        if (isDecimalDigit8428(source8408.charCodeAt(index8410 + 1))) {
            return scanNumericLiteral8448();
        }
        return scanPunctuator8445();
    }
    if (isDecimalDigit8428(ch8668)) {
        return scanNumericLiteral8448();
    }
    if ( // Slash (/) char #47 can also start a regex.
    extra8425.tokenize && ch8668 === 47) {
        return advanceSlash8454();
    }
    return scanPunctuator8445();
}
function lex8456() {
    var token8669;
    token8669 = lookahead8421;
    streamIndex8420 = lookaheadIndex8422;
    lineNumber8411 = token8669.lineNumber;
    lineStart8412 = token8669.lineStart;
    sm_lineNumber8413 = lookahead8421.sm_lineNumber;
    sm_lineStart8414 = lookahead8421.sm_lineStart;
    sm_range8415 = lookahead8421.sm_range;
    sm_index8416 = lookahead8421.sm_range[0];
    lookahead8421 = tokenStream8419[++streamIndex8420].token;
    lookaheadIndex8422 = streamIndex8420;
    index8410 = lookahead8421.range[0];
    if (token8669.leadingComments) {
        extra8425.comments = extra8425.comments.concat(token8669.leadingComments);
        extra8425.trailingComments = extra8425.trailingComments.concat(token8669.leadingComments);
        extra8425.leadingComments = extra8425.leadingComments.concat(token8669.leadingComments);
    }
    return token8669;
}
function peek8457() {
    lookaheadIndex8422 = streamIndex8420 + 1;
    if (lookaheadIndex8422 >= length8417) {
        lookahead8421 = {
            type: Token8399.EOF,
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [index8410, index8410]
        };
        return;
    }
    lookahead8421 = tokenStream8419[lookaheadIndex8422].token;
    index8410 = lookahead8421.range[0];
}
function lookahead28458() {
    var adv8670, pos8671, line8672, start8673, result8674;
    if (streamIndex8420 + 1 >= length8417 || streamIndex8420 + 2 >= length8417) {
        return {
            type: Token8399.EOF,
            lineNumber: lineNumber8411,
            lineStart: lineStart8412,
            range: [index8410, index8410]
        };
    }
    if ( // Scan for the next immediate token.
    lookahead8421 === null) {
        lookaheadIndex8422 = streamIndex8420 + 1;
        lookahead8421 = tokenStream8419[lookaheadIndex8422].token;
        index8410 = lookahead8421.range[0];
    }
    result8674 = tokenStream8419[lookaheadIndex8422 + 1].token;
    return result8674;
}
function markerCreate8459() {
    var sm_index8675 = lookahead8421 ? lookahead8421.sm_range[0] : 0;
    var sm_lineStart8676 = lookahead8421 ? lookahead8421.sm_lineStart : 0;
    var sm_lineNumber8677 = lookahead8421 ? lookahead8421.sm_lineNumber : 1;
    if (!extra8425.loc && !extra8425.range) {
        return undefined;
    }
    return {
        offset: sm_index8675,
        line: sm_lineNumber8677,
        col: sm_index8675 - sm_lineStart8676
    };
}
function processComment8460(node8678) {
    var lastChild8679,
        trailingComments8680,
        bottomRight8681 = extra8425.bottomRightStack,
        last8682 = bottomRight8681[bottomRight8681.length - 1];
    if (node8678.type === Syntax8402.Program) {
        if (node8678.body.length > 0) {
            return;
        }
    }
    if (extra8425.trailingComments.length > 0) {
        if (extra8425.trailingComments[0].range[0] >= node8678.range[1]) {
            trailingComments8680 = extra8425.trailingComments;
            extra8425.trailingComments = [];
        } else {
            extra8425.trailingComments.length = 0;
        }
    } else {
        if (last8682 && last8682.trailingComments && last8682.trailingComments[0].range[0] >= node8678.range[1]) {
            trailingComments8680 = last8682.trailingComments;
            delete last8682.trailingComments;
        }
    }
    if ( // Eating the stack.
    last8682) {
        while (last8682 && last8682.range[0] >= node8678.range[0]) {
            lastChild8679 = last8682;
            last8682 = bottomRight8681.pop();
        }
    }
    if (lastChild8679) {
        if (lastChild8679.leadingComments && lastChild8679.leadingComments[lastChild8679.leadingComments.length - 1].range[1] <= node8678.range[0]) {
            node8678.leadingComments = lastChild8679.leadingComments;
            delete lastChild8679.leadingComments;
        }
    } else if (extra8425.leadingComments.length > 0 && extra8425.leadingComments[extra8425.leadingComments.length - 1].range[1] <= node8678.range[0]) {
        node8678.leadingComments = extra8425.leadingComments;
        extra8425.leadingComments = [];
    }
    if (trailingComments8680) {
        node8678.trailingComments = trailingComments8680;
    }
    bottomRight8681.push(node8678);
}
function markerApply8461(marker8683, node8684) {
    if (extra8425.range) {
        node8684.range = [marker8683.offset, sm_index8416];
    }
    if (extra8425.loc) {
        node8684.loc = {
            start: {
                line: marker8683.line,
                column: marker8683.col
            },
            end: {
                line: sm_lineNumber8413,
                column: sm_index8416 - sm_lineStart8414
            }
        };
        node8684 = delegate8418.postProcess(node8684);
    }
    if (extra8425.attachComment) {
        processComment8460(node8684);
    }
    return node8684;
}
SyntaxTreeDelegate8406 = {
    name: "SyntaxTree",
    postProcess: function postProcess(node8685) {
        return node8685;
    },
    createArrayExpression: function createArrayExpression(elements8686) {
        return {
            type: Syntax8402.ArrayExpression,
            elements: elements8686
        };
    },
    createAssignmentExpression: function createAssignmentExpression(operator8687, left8688, right8689) {
        return {
            type: Syntax8402.AssignmentExpression,
            operator: operator8687,
            left: left8688,
            right: right8689
        };
    },
    createBinaryExpression: function createBinaryExpression(operator8690, left8691, right8692) {
        var type8693 = operator8690 === "||" || operator8690 === "&&" ? Syntax8402.LogicalExpression : Syntax8402.BinaryExpression;
        return {
            type: type8693,
            operator: operator8690,
            left: left8691,
            right: right8692
        };
    },
    createBlockStatement: function createBlockStatement(body8694) {
        return {
            type: Syntax8402.BlockStatement,
            body: body8694
        };
    },
    createBreakStatement: function createBreakStatement(label8695) {
        return {
            type: Syntax8402.BreakStatement,
            label: label8695
        };
    },
    createCallExpression: function createCallExpression(callee8696, args8697) {
        return {
            type: Syntax8402.CallExpression,
            callee: callee8696,
            arguments: args8697
        };
    },
    createCatchClause: function createCatchClause(param8698, body8699) {
        return {
            type: Syntax8402.CatchClause,
            param: param8698,
            body: body8699
        };
    },
    createConditionalExpression: function createConditionalExpression(test8700, consequent8701, alternate8702) {
        return {
            type: Syntax8402.ConditionalExpression,
            test: test8700,
            consequent: consequent8701,
            alternate: alternate8702
        };
    },
    createContinueStatement: function createContinueStatement(label8703) {
        return {
            type: Syntax8402.ContinueStatement,
            label: label8703
        };
    },
    createDebuggerStatement: function createDebuggerStatement() {
        return { type: Syntax8402.DebuggerStatement };
    },
    createDoWhileStatement: function createDoWhileStatement(body8704, test8705) {
        return {
            type: Syntax8402.DoWhileStatement,
            body: body8704,
            test: test8705
        };
    },
    createEmptyStatement: function createEmptyStatement() {
        return { type: Syntax8402.EmptyStatement };
    },
    createExpressionStatement: function createExpressionStatement(expression8706) {
        return {
            type: Syntax8402.ExpressionStatement,
            expression: expression8706
        };
    },
    createForStatement: function createForStatement(init8707, test8708, update8709, body8710) {
        return {
            type: Syntax8402.ForStatement,
            init: init8707,
            test: test8708,
            update: update8709,
            body: body8710
        };
    },
    createForInStatement: function createForInStatement(left8711, right8712, body8713) {
        return {
            type: Syntax8402.ForInStatement,
            left: left8711,
            right: right8712,
            body: body8713,
            each: false
        };
    },
    createForOfStatement: function createForOfStatement(left8714, right8715, body8716) {
        return {
            type: Syntax8402.ForOfStatement,
            left: left8714,
            right: right8715,
            body: body8716
        };
    },
    createFunctionDeclaration: function createFunctionDeclaration(id8717, params8718, defaults8719, body8720, rest8721, generator8722, expression8723) {
        return {
            type: Syntax8402.FunctionDeclaration,
            id: id8717,
            params: params8718,
            defaults: defaults8719,
            body: body8720,
            rest: rest8721,
            generator: generator8722,
            expression: expression8723
        };
    },
    createFunctionExpression: function createFunctionExpression(id8724, params8725, defaults8726, body8727, rest8728, generator8729, expression8730) {
        return {
            type: Syntax8402.FunctionExpression,
            id: id8724,
            params: params8725,
            defaults: defaults8726,
            body: body8727,
            rest: rest8728,
            generator: generator8729,
            expression: expression8730
        };
    },
    createIdentifier: function createIdentifier(name8731) {
        return {
            type: Syntax8402.Identifier,
            name: name8731
        };
    },
    createIfStatement: function createIfStatement(test8732, consequent8733, alternate8734) {
        return {
            type: Syntax8402.IfStatement,
            test: test8732,
            consequent: consequent8733,
            alternate: alternate8734
        };
    },
    createLabeledStatement: function createLabeledStatement(label8735, body8736) {
        return {
            type: Syntax8402.LabeledStatement,
            label: label8735,
            body: body8736
        };
    },
    createLiteral: function createLiteral(token8737) {
        var object8738 = {
            type: Syntax8402.Literal,
            value: token8737.value,
            raw: String(token8737.value)
        };
        if (token8737.regex) {
            object8738.regex = token8737.regex;
        }
        return object8738;
    },
    createMemberExpression: function createMemberExpression(accessor8739, object8740, property8741) {
        return {
            type: Syntax8402.MemberExpression,
            computed: accessor8739 === "[",
            object: object8740,
            property: property8741
        };
    },
    createNewExpression: function createNewExpression(callee8742, args8743) {
        return {
            type: Syntax8402.NewExpression,
            callee: callee8742,
            arguments: args8743
        };
    },
    createObjectExpression: function createObjectExpression(properties8744) {
        return {
            type: Syntax8402.ObjectExpression,
            properties: properties8744
        };
    },
    createPostfixExpression: function createPostfixExpression(operator8745, argument8746) {
        return {
            type: Syntax8402.UpdateExpression,
            operator: operator8745,
            argument: argument8746,
            prefix: false
        };
    },
    createProgram: function createProgram(body8747) {
        return {
            type: Syntax8402.Program,
            body: body8747
        };
    },
    createProperty: function createProperty(kind8748, key8749, value8750, method8751, shorthand8752, computed8753) {
        return {
            type: Syntax8402.Property,
            key: key8749,
            value: value8750,
            kind: kind8748,
            method: method8751,
            shorthand: shorthand8752,
            computed: computed8753
        };
    },
    createReturnStatement: function createReturnStatement(argument8754) {
        return {
            type: Syntax8402.ReturnStatement,
            argument: argument8754
        };
    },
    createSequenceExpression: function createSequenceExpression(expressions8755) {
        return {
            type: Syntax8402.SequenceExpression,
            expressions: expressions8755
        };
    },
    createSwitchCase: function createSwitchCase(test8756, consequent8757) {
        return {
            type: Syntax8402.SwitchCase,
            test: test8756,
            consequent: consequent8757
        };
    },
    createSwitchStatement: function createSwitchStatement(discriminant8758, cases8759) {
        return {
            type: Syntax8402.SwitchStatement,
            discriminant: discriminant8758,
            cases: cases8759
        };
    },
    createThisExpression: function createThisExpression() {
        return { type: Syntax8402.ThisExpression };
    },
    createThrowStatement: function createThrowStatement(argument8760) {
        return {
            type: Syntax8402.ThrowStatement,
            argument: argument8760
        };
    },
    createTryStatement: function createTryStatement(block8761, guardedHandlers8762, handlers8763, finalizer8764) {
        return {
            type: Syntax8402.TryStatement,
            block: block8761,
            guardedHandlers: guardedHandlers8762,
            handlers: handlers8763,
            finalizer: finalizer8764
        };
    },
    createUnaryExpression: function createUnaryExpression(operator8765, argument8766) {
        if (operator8765 === "++" || operator8765 === "--") {
            return {
                type: Syntax8402.UpdateExpression,
                operator: operator8765,
                argument: argument8766,
                prefix: true
            };
        }
        return {
            type: Syntax8402.UnaryExpression,
            operator: operator8765,
            argument: argument8766,
            prefix: true
        };
    },
    createVariableDeclaration: function createVariableDeclaration(declarations8767, kind8768) {
        return {
            type: Syntax8402.VariableDeclaration,
            declarations: declarations8767,
            kind: kind8768
        };
    },
    createVariableDeclarator: function createVariableDeclarator(id8769, init8770) {
        return {
            type: Syntax8402.VariableDeclarator,
            id: id8769,
            init: init8770
        };
    },
    createWhileStatement: function createWhileStatement(test8771, body8772) {
        return {
            type: Syntax8402.WhileStatement,
            test: test8771,
            body: body8772
        };
    },
    createWithStatement: function createWithStatement(object8773, body8774) {
        return {
            type: Syntax8402.WithStatement,
            object: object8773,
            body: body8774
        };
    },
    createTemplateElement: function createTemplateElement(value8775, tail8776) {
        return {
            type: Syntax8402.TemplateElement,
            value: value8775,
            tail: tail8776
        };
    },
    createTemplateLiteral: function createTemplateLiteral(quasis8777, expressions8778) {
        return {
            type: Syntax8402.TemplateLiteral,
            quasis: quasis8777,
            expressions: expressions8778
        };
    },
    createSpreadElement: function createSpreadElement(argument8779) {
        return {
            type: Syntax8402.SpreadElement,
            argument: argument8779
        };
    },
    createTaggedTemplateExpression: function createTaggedTemplateExpression(tag8780, quasi8781) {
        return {
            type: Syntax8402.TaggedTemplateExpression,
            tag: tag8780,
            quasi: quasi8781
        };
    },
    createArrowFunctionExpression: function createArrowFunctionExpression(params8782, defaults8783, body8784, rest8785, expression8786) {
        return {
            type: Syntax8402.ArrowFunctionExpression,
            id: null,
            params: params8782,
            defaults: defaults8783,
            body: body8784,
            rest: rest8785,
            generator: false,
            expression: expression8786
        };
    },
    createMethodDefinition: function createMethodDefinition(propertyType8787, kind8788, key8789, value8790) {
        return {
            type: Syntax8402.MethodDefinition,
            key: key8789,
            value: value8790,
            kind: kind8788,
            "static": propertyType8787 === ClassPropertyType8407["static"]
        };
    },
    createClassBody: function createClassBody(body8791) {
        return {
            type: Syntax8402.ClassBody,
            body: body8791
        };
    },
    createClassExpression: function createClassExpression(id8792, superClass8793, body8794) {
        return {
            type: Syntax8402.ClassExpression,
            id: id8792,
            superClass: superClass8793,
            body: body8794
        };
    },
    createClassDeclaration: function createClassDeclaration(id8795, superClass8796, body8797) {
        return {
            type: Syntax8402.ClassDeclaration,
            id: id8795,
            superClass: superClass8796,
            body: body8797
        };
    },
    createModuleSpecifier: function createModuleSpecifier(token8798) {
        return {
            type: Syntax8402.ModuleSpecifier,
            value: token8798.value,
            raw: token8798.value
        };
    },
    createExportSpecifier: function createExportSpecifier(id8799, name8800) {
        return {
            type: Syntax8402.ExportSpecifier,
            id: id8799,
            name: name8800
        };
    },
    createExportBatchSpecifier: function createExportBatchSpecifier() {
        return { type: Syntax8402.ExportBatchSpecifier };
    },
    createImportDefaultSpecifier: function createImportDefaultSpecifier(id8801) {
        return {
            type: Syntax8402.ImportDefaultSpecifier,
            id: id8801
        };
    },
    createImportNamespaceSpecifier: function createImportNamespaceSpecifier(id8802) {
        return {
            type: Syntax8402.ImportNamespaceSpecifier,
            id: id8802
        };
    },
    createExportDeclaration: function createExportDeclaration(isDefault8803, declaration8804, specifiers8805, source8806) {
        return {
            type: Syntax8402.ExportDeclaration,
            "default": !!isDefault8803,
            declaration: declaration8804,
            specifiers: specifiers8805,
            source: source8806
        };
    },
    createImportSpecifier: function createImportSpecifier(id8807, name8808) {
        return {
            type: Syntax8402.ImportSpecifier,
            id: id8807,
            name: name8808
        };
    },
    createImportDeclaration: function createImportDeclaration(specifiers8809, source8810) {
        return {
            type: Syntax8402.ImportDeclaration,
            specifiers: specifiers8809,
            source: source8810
        };
    },
    createYieldExpression: function createYieldExpression(argument8811, delegate8812) {
        return {
            type: Syntax8402.YieldExpression,
            argument: argument8811,
            delegate: delegate8812
        };
    },
    createComprehensionExpression: function createComprehensionExpression(filter8813, blocks8814, body8815) {
        return {
            type: Syntax8402.ComprehensionExpression,
            filter: filter8813,
            blocks: blocks8814,
            body: body8815
        };
    }
};
function peekLineTerminator8462() {
    return lookahead8421.lineNumber !== lineNumber8411;
}
function throwError8463(token8816, messageFormat8817) {
    var error8818,
        args8819 = Array.prototype.slice.call(arguments, 2),
        msg8820 = messageFormat8817.replace(/%(\d)/g, function (whole8824, index8825) {
        assert8426(index8825 < args8819.length, "Message reference must be in range");
        return args8819[index8825];
    });
    var startIndex8821 = streamIndex8420 > 3 ? streamIndex8420 - 3 : 0;
    var toks8822 = "",
        tailingMsg8823 = "";
    if (tokenStream8419) {
        toks8822 = tokenStream8419.slice(startIndex8821, streamIndex8420 + 3).map(function (stx8826) {
            return stx8826.token.value;
        }).join(" ");
        tailingMsg8823 = "\n[... " + toks8822 + " ...]";
    }
    if (typeof token8816.lineNumber === "number") {
        error8818 = new Error("Line " + token8816.lineNumber + ": " + msg8820 + tailingMsg8823);
        error8818.index = token8816.range[0];
        error8818.lineNumber = token8816.lineNumber;
        error8818.column = token8816.range[0] - lineStart8412 + 1;
    } else {
        error8818 = new Error("Line " + lineNumber8411 + ": " + msg8820 + tailingMsg8823);
        error8818.index = index8410;
        error8818.lineNumber = lineNumber8411;
        error8818.column = index8410 - lineStart8412 + 1;
    }
    error8818.description = msg8820;
    throw error8818;
}
function throwErrorTolerant8464() {
    try {
        throwError8463.apply(null, arguments);
    } catch (e8827) {
        if (extra8425.errors) {
            extra8425.errors.push(e8827);
        } else {
            throw e8827;
        }
    }
}
function throwUnexpected8465(token8828) {
    if (token8828.type === Token8399.EOF) {
        throwError8463(token8828, Messages8404.UnexpectedEOS);
    }
    if (token8828.type === Token8399.NumericLiteral) {
        throwError8463(token8828, Messages8404.UnexpectedNumber);
    }
    if (token8828.type === Token8399.StringLiteral) {
        throwError8463(token8828, Messages8404.UnexpectedString);
    }
    if (token8828.type === Token8399.Identifier) {
        throwError8463(token8828, Messages8404.UnexpectedIdentifier);
    }
    if (token8828.type === Token8399.Keyword) {
        if (isFutureReservedWord8435(token8828.value)) {} else if (strict8409 && isStrictModeReservedWord8436(token8828.value)) {
            throwErrorTolerant8464(token8828, Messages8404.StrictReservedWord);
            return;
        }
        throwError8463(token8828, Messages8404.UnexpectedToken, token8828.value);
    }
    if (token8828.type === Token8399.Template) {
        throwError8463(token8828, Messages8404.UnexpectedTemplate, token8828.value.raw);
    }
    // BooleanLiteral, NullLiteral, or Punctuator.
    throwError8463(token8828, Messages8404.UnexpectedToken, token8828.value);
}
function expect8466(value8829) {
    var token8830 = lex8456();
    if (token8830.type !== Token8399.Punctuator || token8830.value !== value8829) {
        throwUnexpected8465(token8830);
    }
}
function expectKeyword8467(keyword8831) {
    var token8832 = lex8456();
    if (token8832.type !== Token8399.Keyword || token8832.value !== keyword8831) {
        throwUnexpected8465(token8832);
    }
}
function match8468(value8833) {
    return lookahead8421.type === Token8399.Punctuator && lookahead8421.value === value8833;
}
function matchKeyword8469(keyword8834) {
    return lookahead8421.type === Token8399.Keyword && lookahead8421.value === keyword8834;
}
function matchContextualKeyword8470(keyword8835) {
    return lookahead8421.type === Token8399.Identifier && lookahead8421.value === keyword8835;
}
function matchAssign8471() {
    var op8836;
    if (lookahead8421.type !== Token8399.Punctuator) {
        return false;
    }
    op8836 = lookahead8421.value;
    return op8836 === "=" || op8836 === "*=" || op8836 === "/=" || op8836 === "%=" || op8836 === "+=" || op8836 === "-=" || op8836 === "<<=" || op8836 === ">>=" || op8836 === ">>>=" || op8836 === "&=" || op8836 === "^=" || op8836 === "|=";
}
function consumeSemicolon8472() {
    var line8837, ch8838;
    ch8838 = lookahead8421.value ? String(lookahead8421.value).charCodeAt(0) : -1;
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    ch8838 === 59) {
        lex8456();
        return;
    }
    if (lookahead8421.lineNumber !== lineNumber8411) {
        return;
    }
    if (match8468(";")) {
        lex8456();
        return;
    }
    if (lookahead8421.type !== Token8399.EOF && !match8468("}")) {
        throwUnexpected8465(lookahead8421);
    }
}
function isLeftHandSide8473(expr8839) {
    return expr8839.type === Syntax8402.Identifier || expr8839.type === Syntax8402.MemberExpression;
}
function isAssignableLeftHandSide8474(expr8840) {
    return isLeftHandSide8473(expr8840) || expr8840.type === Syntax8402.ObjectPattern || expr8840.type === Syntax8402.ArrayPattern;
}
function parseArrayInitialiser8475() {
    var elements8841 = [],
        blocks8842 = [],
        filter8843 = null,
        tmp8844,
        possiblecomprehension8845 = true,
        body8846,
        marker8847 = markerCreate8459();
    expect8466("[");
    while (!match8468("]")) {
        if (lookahead8421.value === "for" && lookahead8421.type === Token8399.Keyword) {
            if (!possiblecomprehension8845) {
                throwError8463({}, Messages8404.ComprehensionError);
            }
            matchKeyword8469("for");
            tmp8844 = parseForStatement8526({ ignoreBody: true });
            tmp8844.of = tmp8844.type === Syntax8402.ForOfStatement;
            tmp8844.type = Syntax8402.ComprehensionBlock;
            if (tmp8844.left.kind) {
                // can't be let or const
                throwError8463({}, Messages8404.ComprehensionError);
            }
            blocks8842.push(tmp8844);
        } else if (lookahead8421.value === "if" && lookahead8421.type === Token8399.Keyword) {
            if (!possiblecomprehension8845) {
                throwError8463({}, Messages8404.ComprehensionError);
            }
            expectKeyword8467("if");
            expect8466("(");
            filter8843 = parseExpression8503();
            expect8466(")");
        } else if (lookahead8421.value === "," && lookahead8421.type === Token8399.Punctuator) {
            possiblecomprehension8845 = false;
            // no longer allowed.
            lex8456();
            elements8841.push(null);
        } else {
            tmp8844 = parseSpreadOrAssignmentExpression8486();
            elements8841.push(tmp8844);
            if (tmp8844 && tmp8844.type === Syntax8402.SpreadElement) {
                if (!match8468("]")) {
                    throwError8463({}, Messages8404.ElementAfterSpreadElement);
                }
            } else if (!(match8468("]") || matchKeyword8469("for") || matchKeyword8469("if"))) {
                expect8466(",");
                // this lexes.
                possiblecomprehension8845 = false;
            }
        }
    }
    expect8466("]");
    if (filter8843 && !blocks8842.length) {
        throwError8463({}, Messages8404.ComprehensionRequiresBlock);
    }
    if (blocks8842.length) {
        if (elements8841.length !== 1) {
            throwError8463({}, Messages8404.ComprehensionError);
        }
        return markerApply8461(marker8847, delegate8418.createComprehensionExpression(filter8843, blocks8842, elements8841[0]));
    }
    return markerApply8461(marker8847, delegate8418.createArrayExpression(elements8841));
}
function parsePropertyFunction8476(options8848) {
    var previousStrict8849,
        previousYieldAllowed8850,
        params8851,
        defaults8852,
        body8853,
        marker8854 = markerCreate8459();
    previousStrict8849 = strict8409;
    previousYieldAllowed8850 = state8423.yieldAllowed;
    state8423.yieldAllowed = options8848.generator;
    params8851 = options8848.params || [];
    defaults8852 = options8848.defaults || [];
    body8853 = parseConciseBody8538();
    if (options8848.name && strict8409 && isRestrictedWord8437(params8851[0].name)) {
        throwErrorTolerant8464(options8848.name, Messages8404.StrictParamName);
    }
    strict8409 = previousStrict8849;
    state8423.yieldAllowed = previousYieldAllowed8850;
    return markerApply8461(marker8854, delegate8418.createFunctionExpression(null, params8851, defaults8852, body8853, options8848.rest || null, options8848.generator, body8853.type !== Syntax8402.BlockStatement));
}
function parsePropertyMethodFunction8477(options8855) {
    var previousStrict8856, tmp8857, method8858;
    previousStrict8856 = strict8409;
    strict8409 = true;
    tmp8857 = parseParams8542();
    if (tmp8857.stricted) {
        throwErrorTolerant8464(tmp8857.stricted, tmp8857.message);
    }
    method8858 = parsePropertyFunction8476({
        params: tmp8857.params,
        defaults: tmp8857.defaults,
        rest: tmp8857.rest,
        generator: options8855.generator
    });
    strict8409 = previousStrict8856;
    return method8858;
}
function parseObjectPropertyKey8478() {
    var marker8859 = markerCreate8459(),
        token8860 = lex8456(),
        propertyKey8861,
        result8862;
    if ( // Note: This function is called only from parseObjectProperty(), where
    // EOF and Punctuator tokens are already filtered out.
    token8860.type === Token8399.StringLiteral || token8860.type === Token8399.NumericLiteral) {
        if (strict8409 && token8860.octal) {
            throwErrorTolerant8464(token8860, Messages8404.StrictOctalLiteral);
        }
        return markerApply8461(marker8859, delegate8418.createLiteral(token8860));
    }
    if (token8860.type === Token8399.Punctuator && token8860.value === "[") {
        // For computed properties we should skip the [ and ], and
        // capture in marker only the assignment expression itself.
        marker8859 = markerCreate8459();
        propertyKey8861 = parseAssignmentExpression8502();
        result8862 = markerApply8461(marker8859, propertyKey8861);
        expect8466("]");
        return result8862;
    }
    return markerApply8461(marker8859, delegate8418.createIdentifier(token8860.value));
}
function parseObjectProperty8479() {
    var token8863,
        key8864,
        id8865,
        value8866,
        param8867,
        expr8868,
        computed8869,
        marker8870 = markerCreate8459();
    token8863 = lookahead8421;
    computed8869 = token8863.value === "[" && token8863.type === Token8399.Punctuator;
    if (token8863.type === Token8399.Identifier || computed8869) {
        id8865 = parseObjectPropertyKey8478();
        if ( // Property Assignment: Getter and Setter.
        token8863.value === "get" && !(match8468(":") || match8468("("))) {
            computed8869 = lookahead8421.value === "[";
            key8864 = parseObjectPropertyKey8478();
            expect8466("(");
            expect8466(")");
            return markerApply8461(marker8870, delegate8418.createProperty("get", key8864, parsePropertyFunction8476({ generator: false }), false, false, computed8869));
        }
        if (token8863.value === "set" && !(match8468(":") || match8468("("))) {
            computed8869 = lookahead8421.value === "[";
            key8864 = parseObjectPropertyKey8478();
            expect8466("(");
            token8863 = lookahead8421;
            param8867 = [parseVariableIdentifier8506()];
            expect8466(")");
            return markerApply8461(marker8870, delegate8418.createProperty("set", key8864, parsePropertyFunction8476({
                params: param8867,
                generator: false,
                name: token8863
            }), false, false, computed8869));
        }
        if (match8468(":")) {
            lex8456();
            return markerApply8461(marker8870, delegate8418.createProperty("init", id8865, parseAssignmentExpression8502(), false, false, computed8869));
        }
        if (match8468("(")) {
            return markerApply8461(marker8870, delegate8418.createProperty("init", id8865, parsePropertyMethodFunction8477({ generator: false }), true, false, computed8869));
        }
        if (computed8869) {
            // Computed properties can only be used with full notation.
            throwUnexpected8465(lookahead8421);
        }
        return markerApply8461(marker8870, delegate8418.createProperty("init", id8865, id8865, false, true, false));
    }
    if (token8863.type === Token8399.EOF || token8863.type === Token8399.Punctuator) {
        if (!match8468("*")) {
            throwUnexpected8465(token8863);
        }
        lex8456();
        computed8869 = lookahead8421.type === Token8399.Punctuator && lookahead8421.value === "[";
        id8865 = parseObjectPropertyKey8478();
        if (!match8468("(")) {
            throwUnexpected8465(lex8456());
        }
        return markerApply8461(marker8870, delegate8418.createProperty("init", id8865, parsePropertyMethodFunction8477({ generator: true }), true, false, computed8869));
    }
    key8864 = parseObjectPropertyKey8478();
    if (match8468(":")) {
        lex8456();
        return markerApply8461(marker8870, delegate8418.createProperty("init", key8864, parseAssignmentExpression8502(), false, false, false));
    }
    if (match8468("(")) {
        return markerApply8461(marker8870, delegate8418.createProperty("init", key8864, parsePropertyMethodFunction8477({ generator: false }), true, false, false));
    }
    throwUnexpected8465(lex8456());
}
function parseObjectInitialiser8480() {
    var properties8871 = [],
        property8872,
        name8873,
        key8874,
        kind8875,
        map8876 = {},
        toString8877 = String,
        marker8878 = markerCreate8459();
    expect8466("{");
    while (!match8468("}")) {
        property8872 = parseObjectProperty8479();
        if (property8872.key.type === Syntax8402.Identifier) {
            name8873 = property8872.key.name;
        } else {
            name8873 = toString8877(property8872.key.value);
        }
        kind8875 = property8872.kind === "init" ? PropertyKind8403.Data : property8872.kind === "get" ? PropertyKind8403.Get : PropertyKind8403.Set;
        key8874 = "$" + name8873;
        if (Object.prototype.hasOwnProperty.call(map8876, key8874)) {
            if (map8876[key8874] === PropertyKind8403.Data) {
                if (strict8409 && kind8875 === PropertyKind8403.Data) {
                    throwErrorTolerant8464({}, Messages8404.StrictDuplicateProperty);
                } else if (kind8875 !== PropertyKind8403.Data) {
                    throwErrorTolerant8464({}, Messages8404.AccessorDataProperty);
                }
            } else {
                if (kind8875 === PropertyKind8403.Data) {
                    throwErrorTolerant8464({}, Messages8404.AccessorDataProperty);
                } else if (map8876[key8874] & kind8875) {
                    throwErrorTolerant8464({}, Messages8404.AccessorGetSet);
                }
            }
            map8876[key8874] |= kind8875;
        } else {
            map8876[key8874] = kind8875;
        }
        properties8871.push(property8872);
        if (!match8468("}")) {
            expect8466(",");
        }
    }
    expect8466("}");
    return markerApply8461(marker8878, delegate8418.createObjectExpression(properties8871));
}
function parseTemplateElement8481(option8879) {
    var marker8880 = markerCreate8459(),
        token8881 = lex8456();
    if (strict8409 && token8881.octal) {
        throwError8463(token8881, Messages8404.StrictOctalLiteral);
    }
    return markerApply8461(marker8880, delegate8418.createTemplateElement({
        raw: token8881.value.raw,
        cooked: token8881.value.cooked
    }, token8881.tail));
}
function parseTemplateLiteral8482() {
    var quasi8882,
        quasis8883,
        expressions8884,
        marker8885 = markerCreate8459();
    quasi8882 = parseTemplateElement8481({ head: true });
    quasis8883 = [quasi8882];
    expressions8884 = [];
    while (!quasi8882.tail) {
        expressions8884.push(parseExpression8503());
        quasi8882 = parseTemplateElement8481({ head: false });
        quasis8883.push(quasi8882);
    }
    return markerApply8461(marker8885, delegate8418.createTemplateLiteral(quasis8883, expressions8884));
}
function parseGroupExpression8483() {
    var expr8886;
    expect8466("(");
    ++state8423.parenthesizedCount;
    expr8886 = parseExpression8503();
    expect8466(")");
    return expr8886;
}
function parsePrimaryExpression8484() {
    var type8887, token8888, resolvedIdent8889, marker8890, expr8891;
    token8888 = lookahead8421;
    type8887 = lookahead8421.type;
    if (type8887 === Token8399.Identifier) {
        marker8890 = markerCreate8459();
        resolvedIdent8889 = expander8398.resolve(tokenStream8419[lookaheadIndex8422], phase8424);
        lex8456();
        return markerApply8461(marker8890, delegate8418.createIdentifier(resolvedIdent8889));
    }
    if (type8887 === Token8399.StringLiteral || type8887 === Token8399.NumericLiteral) {
        if (strict8409 && lookahead8421.octal) {
            throwErrorTolerant8464(lookahead8421, Messages8404.StrictOctalLiteral);
        }
        marker8890 = markerCreate8459();
        return markerApply8461(marker8890, delegate8418.createLiteral(lex8456()));
    }
    if (type8887 === Token8399.Keyword) {
        if (matchKeyword8469("this")) {
            marker8890 = markerCreate8459();
            lex8456();
            return markerApply8461(marker8890, delegate8418.createThisExpression());
        }
        if (matchKeyword8469("function")) {
            return parseFunctionExpression8544();
        }
        if (matchKeyword8469("class")) {
            return parseClassExpression8549();
        }
        if (matchKeyword8469("super")) {
            marker8890 = markerCreate8459();
            lex8456();
            return markerApply8461(marker8890, delegate8418.createIdentifier("super"));
        }
    }
    if (type8887 === Token8399.BooleanLiteral) {
        marker8890 = markerCreate8459();
        token8888 = lex8456();
        if (typeof token8888.value !== "boolean") {
            assert8426(token8888.value === "true" || token8888.value === "false", "exporting either true or false as a string not: " + token8888.value);
            token8888.value = token8888.value === "true";
        }
        return markerApply8461(marker8890, delegate8418.createLiteral(token8888));
    }
    if (type8887 === Token8399.NullLiteral) {
        marker8890 = markerCreate8459();
        token8888 = lex8456();
        token8888.value = null;
        return markerApply8461(marker8890, delegate8418.createLiteral(token8888));
    }
    if (match8468("[")) {
        return parseArrayInitialiser8475();
    }
    if (match8468("{")) {
        return parseObjectInitialiser8480();
    }
    if (match8468("(")) {
        return parseGroupExpression8483();
    }
    if (lookahead8421.type === Token8399.RegularExpression) {
        marker8890 = markerCreate8459();
        return markerApply8461(marker8890, delegate8418.createLiteral(lex8456()));
    }
    if (type8887 === Token8399.Template) {
        return parseTemplateLiteral8482();
    }
    throwUnexpected8465(lex8456());
}
function parseArguments8485() {
    var args8892 = [],
        arg8893;
    expect8466("(");
    if (!match8468(")")) {
        while (streamIndex8420 < length8417) {
            arg8893 = parseSpreadOrAssignmentExpression8486();
            args8892.push(arg8893);
            if (match8468(")")) {
                break;
            } else if (arg8893.type === Syntax8402.SpreadElement) {
                throwError8463({}, Messages8404.ElementAfterSpreadElement);
            }
            expect8466(",");
        }
    }
    expect8466(")");
    return args8892;
}
function parseSpreadOrAssignmentExpression8486() {
    if (match8468("...")) {
        var marker8894 = markerCreate8459();
        lex8456();
        return markerApply8461(marker8894, delegate8418.createSpreadElement(parseAssignmentExpression8502()));
    }
    return parseAssignmentExpression8502();
}
function parseNonComputedProperty8487(toResolve8895) {
    var marker8896 = markerCreate8459(),
        resolvedIdent8897,
        token8898;
    if (toResolve8895) {
        resolvedIdent8897 = expander8398.resolve(tokenStream8419[lookaheadIndex8422], phase8424);
    }
    token8898 = lex8456();
    resolvedIdent8897 = toResolve8895 ? resolvedIdent8897 : token8898.value;
    if (!isIdentifierName8453(token8898)) {
        throwUnexpected8465(token8898);
    }
    return markerApply8461(marker8896, delegate8418.createIdentifier(resolvedIdent8897));
}
function parseNonComputedMember8488() {
    expect8466(".");
    return parseNonComputedProperty8487();
}
function parseComputedMember8489() {
    var expr8899;
    expect8466("[");
    expr8899 = parseExpression8503();
    expect8466("]");
    return expr8899;
}
function parseNewExpression8490() {
    var callee8900,
        args8901,
        marker8902 = markerCreate8459();
    expectKeyword8467("new");
    callee8900 = parseLeftHandSideExpression8492();
    args8901 = match8468("(") ? parseArguments8485() : [];
    return markerApply8461(marker8902, delegate8418.createNewExpression(callee8900, args8901));
}
function parseLeftHandSideExpressionAllowCall8491() {
    var expr8903,
        args8904,
        marker8905 = markerCreate8459();
    expr8903 = matchKeyword8469("new") ? parseNewExpression8490() : parsePrimaryExpression8484();
    while (match8468(".") || match8468("[") || match8468("(") || lookahead8421.type === Token8399.Template) {
        if (match8468("(")) {
            args8904 = parseArguments8485();
            expr8903 = markerApply8461(marker8905, delegate8418.createCallExpression(expr8903, args8904));
        } else if (match8468("[")) {
            expr8903 = markerApply8461(marker8905, delegate8418.createMemberExpression("[", expr8903, parseComputedMember8489()));
        } else if (match8468(".")) {
            expr8903 = markerApply8461(marker8905, delegate8418.createMemberExpression(".", expr8903, parseNonComputedMember8488()));
        } else {
            expr8903 = markerApply8461(marker8905, delegate8418.createTaggedTemplateExpression(expr8903, parseTemplateLiteral8482()));
        }
    }
    return expr8903;
}
function parseLeftHandSideExpression8492() {
    var expr8906,
        marker8907 = markerCreate8459();
    expr8906 = matchKeyword8469("new") ? parseNewExpression8490() : parsePrimaryExpression8484();
    while (match8468(".") || match8468("[") || lookahead8421.type === Token8399.Template) {
        if (match8468("[")) {
            expr8906 = markerApply8461(marker8907, delegate8418.createMemberExpression("[", expr8906, parseComputedMember8489()));
        } else if (match8468(".")) {
            expr8906 = markerApply8461(marker8907, delegate8418.createMemberExpression(".", expr8906, parseNonComputedMember8488()));
        } else {
            expr8906 = markerApply8461(marker8907, delegate8418.createTaggedTemplateExpression(expr8906, parseTemplateLiteral8482()));
        }
    }
    return expr8906;
}
function parsePostfixExpression8493() {
    var marker8908 = markerCreate8459(),
        expr8909 = parseLeftHandSideExpressionAllowCall8491(),
        token8910;
    if (lookahead8421.type !== Token8399.Punctuator) {
        return expr8909;
    }
    if ((match8468("++") || match8468("--")) && !peekLineTerminator8462()) {
        if ( // 11.3.1, 11.3.2
        strict8409 && expr8909.type === Syntax8402.Identifier && isRestrictedWord8437(expr8909.name)) {
            throwErrorTolerant8464({}, Messages8404.StrictLHSPostfix);
        }
        if (!isLeftHandSide8473(expr8909)) {
            throwError8463({}, Messages8404.InvalidLHSInAssignment);
        }
        token8910 = lex8456();
        expr8909 = markerApply8461(marker8908, delegate8418.createPostfixExpression(token8910.value, expr8909));
    }
    return expr8909;
}
function parseUnaryExpression8494() {
    var marker8911, token8912, expr8913;
    if (lookahead8421.type !== Token8399.Punctuator && lookahead8421.type !== Token8399.Keyword) {
        return parsePostfixExpression8493();
    }
    if (match8468("++") || match8468("--")) {
        marker8911 = markerCreate8459();
        token8912 = lex8456();
        expr8913 = parseUnaryExpression8494();
        if ( // 11.4.4, 11.4.5
        strict8409 && expr8913.type === Syntax8402.Identifier && isRestrictedWord8437(expr8913.name)) {
            throwErrorTolerant8464({}, Messages8404.StrictLHSPrefix);
        }
        if (!isLeftHandSide8473(expr8913)) {
            throwError8463({}, Messages8404.InvalidLHSInAssignment);
        }
        return markerApply8461(marker8911, delegate8418.createUnaryExpression(token8912.value, expr8913));
    }
    if (match8468("+") || match8468("-") || match8468("~") || match8468("!")) {
        marker8911 = markerCreate8459();
        token8912 = lex8456();
        expr8913 = parseUnaryExpression8494();
        return markerApply8461(marker8911, delegate8418.createUnaryExpression(token8912.value, expr8913));
    }
    if (matchKeyword8469("delete") || matchKeyword8469("void") || matchKeyword8469("typeof")) {
        marker8911 = markerCreate8459();
        token8912 = lex8456();
        expr8913 = parseUnaryExpression8494();
        expr8913 = markerApply8461(marker8911, delegate8418.createUnaryExpression(token8912.value, expr8913));
        if (strict8409 && expr8913.operator === "delete" && expr8913.argument.type === Syntax8402.Identifier) {
            throwErrorTolerant8464({}, Messages8404.StrictDelete);
        }
        return expr8913;
    }
    return parsePostfixExpression8493();
}
function binaryPrecedence8495(token8914, allowIn8915) {
    var prec8916 = 0;
    if (token8914.type !== Token8399.Punctuator && token8914.type !== Token8399.Keyword) {
        return 0;
    }
    switch (token8914.value) {
        case "||":
            prec8916 = 1;
            break;
        case "&&":
            prec8916 = 2;
            break;
        case "|":
            prec8916 = 3;
            break;
        case "^":
            prec8916 = 4;
            break;
        case "&":
            prec8916 = 5;
            break;
        case "==":
        case "!=":
        case "===":
        case "!==":
            prec8916 = 6;
            break;
        case "<":
        case ">":
        case "<=":
        case ">=":
        case "instanceof":
            prec8916 = 7;
            break;
        case "in":
            prec8916 = allowIn8915 ? 7 : 0;
            break;
        case "<<":
        case ">>":
        case ">>>":
            prec8916 = 8;
            break;
        case "+":
        case "-":
            prec8916 = 9;
            break;
        case "*":
        case "/":
        case "%":
            prec8916 = 11;
            break;
        default:
            break;
    }
    return prec8916;
}
function parseBinaryExpression8496() {
    var expr8917, token8918, prec8919, previousAllowIn8920, stack8921, right8922, operator8923, left8924, i8925, marker8926, markers8927;
    previousAllowIn8920 = state8423.allowIn;
    state8423.allowIn = true;
    marker8926 = markerCreate8459();
    left8924 = parseUnaryExpression8494();
    token8918 = lookahead8421;
    prec8919 = binaryPrecedence8495(token8918, previousAllowIn8920);
    if (prec8919 === 0) {
        return left8924;
    }
    token8918.prec = prec8919;
    lex8456();
    markers8927 = [marker8926, markerCreate8459()];
    right8922 = parseUnaryExpression8494();
    stack8921 = [left8924, token8918, right8922];
    while ((prec8919 = binaryPrecedence8495(lookahead8421, previousAllowIn8920)) > 0) {
        while ( // Reduce: make a binary expression from the three topmost entries.
        stack8921.length > 2 && prec8919 <= stack8921[stack8921.length - 2].prec) {
            right8922 = stack8921.pop();
            operator8923 = stack8921.pop().value;
            left8924 = stack8921.pop();
            expr8917 = delegate8418.createBinaryExpression(operator8923, left8924, right8922);
            markers8927.pop();
            marker8926 = markers8927.pop();
            markerApply8461(marker8926, expr8917);
            stack8921.push(expr8917);
            markers8927.push(marker8926);
        }
        // Shift.
        token8918 = lex8456();
        token8918.prec = prec8919;
        stack8921.push(token8918);
        markers8927.push(markerCreate8459());
        expr8917 = parseUnaryExpression8494();
        stack8921.push(expr8917);
    }
    state8423.allowIn = previousAllowIn8920;
    // Final reduce to clean-up the stack.
    i8925 = stack8921.length - 1;
    expr8917 = stack8921[i8925];
    markers8927.pop();
    while (i8925 > 1) {
        expr8917 = delegate8418.createBinaryExpression(stack8921[i8925 - 1].value, stack8921[i8925 - 2], expr8917);
        i8925 -= 2;
        marker8926 = markers8927.pop();
        markerApply8461(marker8926, expr8917);
    }
    return expr8917;
}
function parseConditionalExpression8497() {
    var expr8928,
        previousAllowIn8929,
        consequent8930,
        alternate8931,
        marker8932 = markerCreate8459();
    expr8928 = parseBinaryExpression8496();
    if (match8468("?")) {
        lex8456();
        previousAllowIn8929 = state8423.allowIn;
        state8423.allowIn = true;
        consequent8930 = parseAssignmentExpression8502();
        state8423.allowIn = previousAllowIn8929;
        expect8466(":");
        alternate8931 = parseAssignmentExpression8502();
        expr8928 = markerApply8461(marker8932, delegate8418.createConditionalExpression(expr8928, consequent8930, alternate8931));
    }
    return expr8928;
}
function reinterpretAsAssignmentBindingPattern8498(expr8933) {
    var i8934, len8935, property8936, element8937;
    if (expr8933.type === Syntax8402.ObjectExpression) {
        expr8933.type = Syntax8402.ObjectPattern;
        for (i8934 = 0, len8935 = expr8933.properties.length; i8934 < len8935; i8934 += 1) {
            property8936 = expr8933.properties[i8934];
            if (property8936.kind !== "init") {
                throwError8463({}, Messages8404.InvalidLHSInAssignment);
            }
            reinterpretAsAssignmentBindingPattern8498(property8936.value);
        }
    } else if (expr8933.type === Syntax8402.ArrayExpression) {
        expr8933.type = Syntax8402.ArrayPattern;
        for (i8934 = 0, len8935 = expr8933.elements.length; i8934 < len8935; i8934 += 1) {
            element8937 = expr8933.elements[i8934];
            if (element8937) {
                reinterpretAsAssignmentBindingPattern8498(element8937);
            }
        }
    } else if (expr8933.type === Syntax8402.Identifier) {
        if (isRestrictedWord8437(expr8933.name)) {
            throwError8463({}, Messages8404.InvalidLHSInAssignment);
        }
    } else if (expr8933.type === Syntax8402.SpreadElement) {
        reinterpretAsAssignmentBindingPattern8498(expr8933.argument);
        if (expr8933.argument.type === Syntax8402.ObjectPattern) {
            throwError8463({}, Messages8404.ObjectPatternAsSpread);
        }
    } else {
        if (expr8933.type !== Syntax8402.MemberExpression && expr8933.type !== Syntax8402.CallExpression && expr8933.type !== Syntax8402.NewExpression) {
            throwError8463({}, Messages8404.InvalidLHSInAssignment);
        }
    }
}
function reinterpretAsDestructuredParameter8499(options8938, expr8939) {
    var i8940, len8941, property8942, element8943;
    if (expr8939.type === Syntax8402.ObjectExpression) {
        expr8939.type = Syntax8402.ObjectPattern;
        for (i8940 = 0, len8941 = expr8939.properties.length; i8940 < len8941; i8940 += 1) {
            property8942 = expr8939.properties[i8940];
            if (property8942.kind !== "init") {
                throwError8463({}, Messages8404.InvalidLHSInFormalsList);
            }
            reinterpretAsDestructuredParameter8499(options8938, property8942.value);
        }
    } else if (expr8939.type === Syntax8402.ArrayExpression) {
        expr8939.type = Syntax8402.ArrayPattern;
        for (i8940 = 0, len8941 = expr8939.elements.length; i8940 < len8941; i8940 += 1) {
            element8943 = expr8939.elements[i8940];
            if (element8943) {
                reinterpretAsDestructuredParameter8499(options8938, element8943);
            }
        }
    } else if (expr8939.type === Syntax8402.Identifier) {
        validateParam8540(options8938, expr8939, expr8939.name);
    } else {
        if (expr8939.type !== Syntax8402.MemberExpression) {
            throwError8463({}, Messages8404.InvalidLHSInFormalsList);
        }
    }
}
function reinterpretAsCoverFormalsList8500(expressions8944) {
    var i8945, len8946, param8947, params8948, defaults8949, defaultCount8950, options8951, rest8952;
    params8948 = [];
    defaults8949 = [];
    defaultCount8950 = 0;
    rest8952 = null;
    options8951 = { paramSet: {} };
    for (i8945 = 0, len8946 = expressions8944.length; i8945 < len8946; i8945 += 1) {
        param8947 = expressions8944[i8945];
        if (param8947.type === Syntax8402.Identifier) {
            params8948.push(param8947);
            defaults8949.push(null);
            validateParam8540(options8951, param8947, param8947.name);
        } else if (param8947.type === Syntax8402.ObjectExpression || param8947.type === Syntax8402.ArrayExpression) {
            reinterpretAsDestructuredParameter8499(options8951, param8947);
            params8948.push(param8947);
            defaults8949.push(null);
        } else if (param8947.type === Syntax8402.SpreadElement) {
            assert8426(i8945 === len8946 - 1, "It is guaranteed that SpreadElement is last element by parseExpression");
            reinterpretAsDestructuredParameter8499(options8951, param8947.argument);
            rest8952 = param8947.argument;
        } else if (param8947.type === Syntax8402.AssignmentExpression) {
            params8948.push(param8947.left);
            defaults8949.push(param8947.right);
            ++defaultCount8950;
            validateParam8540(options8951, param8947.left, param8947.left.name);
        } else {
            return null;
        }
    }
    if (options8951.message === Messages8404.StrictParamDupe) {
        throwError8463(strict8409 ? options8951.stricted : options8951.firstRestricted, options8951.message);
    }
    if (defaultCount8950 === 0) {
        defaults8949 = [];
    }
    return {
        params: params8948,
        defaults: defaults8949,
        rest: rest8952,
        stricted: options8951.stricted,
        firstRestricted: options8951.firstRestricted,
        message: options8951.message
    };
}
function parseArrowFunctionExpression8501(options8953, marker8954) {
    var previousStrict8955, previousYieldAllowed8956, body8957;
    expect8466("=>");
    previousStrict8955 = strict8409;
    previousYieldAllowed8956 = state8423.yieldAllowed;
    state8423.yieldAllowed = false;
    body8957 = parseConciseBody8538();
    if (strict8409 && options8953.firstRestricted) {
        throwError8463(options8953.firstRestricted, options8953.message);
    }
    if (strict8409 && options8953.stricted) {
        throwErrorTolerant8464(options8953.stricted, options8953.message);
    }
    strict8409 = previousStrict8955;
    state8423.yieldAllowed = previousYieldAllowed8956;
    return markerApply8461(marker8954, delegate8418.createArrowFunctionExpression(options8953.params, options8953.defaults, body8957, options8953.rest, body8957.type !== Syntax8402.BlockStatement));
}
function parseAssignmentExpression8502() {
    var marker8958, expr8959, token8960, params8961, oldParenthesizedCount8962;
    if ( // Note that 'yield' is treated as a keyword in strict mode, but a
    // contextual keyword (identifier) in non-strict mode, so we need
    // to use matchKeyword and matchContextualKeyword appropriately.
    state8423.yieldAllowed && matchContextualKeyword8470("yield") || strict8409 && matchKeyword8469("yield")) {
        return parseYieldExpression8545();
    }
    oldParenthesizedCount8962 = state8423.parenthesizedCount;
    marker8958 = markerCreate8459();
    if (match8468("(")) {
        token8960 = lookahead28458();
        if (token8960.type === Token8399.Punctuator && token8960.value === ")" || token8960.value === "...") {
            params8961 = parseParams8542();
            if (!match8468("=>")) {
                throwUnexpected8465(lex8456());
            }
            return parseArrowFunctionExpression8501(params8961, marker8958);
        }
    }
    token8960 = lookahead8421;
    expr8959 = parseConditionalExpression8497();
    if (match8468("=>") && (state8423.parenthesizedCount === oldParenthesizedCount8962 || state8423.parenthesizedCount === oldParenthesizedCount8962 + 1)) {
        if (expr8959.type === Syntax8402.Identifier) {
            params8961 = reinterpretAsCoverFormalsList8500([expr8959]);
        } else if (expr8959.type === Syntax8402.SequenceExpression) {
            params8961 = reinterpretAsCoverFormalsList8500(expr8959.expressions);
        }
        if (params8961) {
            return parseArrowFunctionExpression8501(params8961, marker8958);
        }
    }
    if (matchAssign8471()) {
        if ( // 11.13.1
        strict8409 && expr8959.type === Syntax8402.Identifier && isRestrictedWord8437(expr8959.name)) {
            throwErrorTolerant8464(token8960, Messages8404.StrictLHSAssignment);
        }
        if ( // ES.next draf 11.13 Runtime Semantics step 1
        match8468("=") && (expr8959.type === Syntax8402.ObjectExpression || expr8959.type === Syntax8402.ArrayExpression)) {
            reinterpretAsAssignmentBindingPattern8498(expr8959);
        } else if (!isLeftHandSide8473(expr8959)) {
            throwError8463({}, Messages8404.InvalidLHSInAssignment);
        }
        expr8959 = markerApply8461(marker8958, delegate8418.createAssignmentExpression(lex8456().value, expr8959, parseAssignmentExpression8502()));
    }
    return expr8959;
}
function parseExpression8503() {
    var marker8963, expr8964, expressions8965, sequence8966, coverFormalsList8967, spreadFound8968, oldParenthesizedCount8969;
    oldParenthesizedCount8969 = state8423.parenthesizedCount;
    marker8963 = markerCreate8459();
    expr8964 = parseAssignmentExpression8502();
    expressions8965 = [expr8964];
    if (match8468(",")) {
        while (streamIndex8420 < length8417) {
            if (!match8468(",")) {
                break;
            }
            lex8456();
            expr8964 = parseSpreadOrAssignmentExpression8486();
            expressions8965.push(expr8964);
            if (expr8964.type === Syntax8402.SpreadElement) {
                spreadFound8968 = true;
                if (!match8468(")")) {
                    throwError8463({}, Messages8404.ElementAfterSpreadElement);
                }
                break;
            }
        }
        sequence8966 = markerApply8461(marker8963, delegate8418.createSequenceExpression(expressions8965));
    }
    if (match8468("=>")) {
        if ( // Do not allow nested parentheses on the LHS of the =>.
        state8423.parenthesizedCount === oldParenthesizedCount8969 || state8423.parenthesizedCount === oldParenthesizedCount8969 + 1) {
            expr8964 = expr8964.type === Syntax8402.SequenceExpression ? expr8964.expressions : expressions8965;
            coverFormalsList8967 = reinterpretAsCoverFormalsList8500(expr8964);
            if (coverFormalsList8967) {
                return parseArrowFunctionExpression8501(coverFormalsList8967, marker8963);
            }
        }
        throwUnexpected8465(lex8456());
    }
    if (spreadFound8968 && lookahead28458().value !== "=>") {
        throwError8463({}, Messages8404.IllegalSpread);
    }
    return sequence8966 || expr8964;
}
function parseStatementList8504() {
    var list8970 = [],
        statement8971;
    while (streamIndex8420 < length8417) {
        if (match8468("}")) {
            break;
        }
        statement8971 = parseSourceElement8551();
        if (typeof statement8971 === "undefined") {
            break;
        }
        list8970.push(statement8971);
    }
    return list8970;
}
function parseBlock8505() {
    var block8972,
        marker8973 = markerCreate8459();
    expect8466("{");
    block8972 = parseStatementList8504();
    expect8466("}");
    return markerApply8461(marker8973, delegate8418.createBlockStatement(block8972));
}
function parseVariableIdentifier8506() {
    var token8974 = lookahead8421,
        resolvedIdent8975,
        marker8976 = markerCreate8459();
    if (token8974.type !== Token8399.Identifier) {
        throwUnexpected8465(token8974);
    }
    resolvedIdent8975 = expander8398.resolve(tokenStream8419[lookaheadIndex8422], phase8424);
    lex8456();
    return markerApply8461(marker8976, delegate8418.createIdentifier(resolvedIdent8975));
}
function parseVariableDeclaration8507(kind8977) {
    var id8978,
        marker8979 = markerCreate8459(),
        init8980 = null;
    if (match8468("{")) {
        id8978 = parseObjectInitialiser8480();
        reinterpretAsAssignmentBindingPattern8498(id8978);
    } else if (match8468("[")) {
        id8978 = parseArrayInitialiser8475();
        reinterpretAsAssignmentBindingPattern8498(id8978);
    } else {
        id8978 = state8423.allowKeyword ? parseNonComputedProperty8487() : parseVariableIdentifier8506();
        if ( // 12.2.1
        strict8409 && isRestrictedWord8437(id8978.name)) {
            throwErrorTolerant8464({}, Messages8404.StrictVarName);
        }
    }
    if (kind8977 === "const") {
        if (!match8468("=")) {
            throwError8463({}, Messages8404.NoUnintializedConst);
        }
        expect8466("=");
        init8980 = parseAssignmentExpression8502();
    } else if (match8468("=")) {
        lex8456();
        init8980 = parseAssignmentExpression8502();
    }
    return markerApply8461(marker8979, delegate8418.createVariableDeclarator(id8978, init8980));
}
function parseVariableDeclarationList8508(kind8981) {
    var list8982 = [];
    do {
        list8982.push(parseVariableDeclaration8507(kind8981));
        if (!match8468(",")) {
            break;
        }
        lex8456();
    } while (streamIndex8420 < length8417);
    return list8982;
}
function parseVariableStatement8509() {
    var declarations8983,
        marker8984 = markerCreate8459();
    expectKeyword8467("var");
    declarations8983 = parseVariableDeclarationList8508();
    consumeSemicolon8472();
    return markerApply8461(marker8984, delegate8418.createVariableDeclaration(declarations8983, "var"));
}
function parseConstLetDeclaration8510(kind8985) {
    var declarations8986,
        marker8987 = markerCreate8459();
    expectKeyword8467(kind8985);
    declarations8986 = parseVariableDeclarationList8508(kind8985);
    consumeSemicolon8472();
    return markerApply8461(marker8987, delegate8418.createVariableDeclaration(declarations8986, kind8985));
}
function parseModuleSpecifier8511() {
    var marker8988 = markerCreate8459(),
        specifier8989;
    if (lookahead8421.type !== Token8399.StringLiteral) {
        throwError8463({}, Messages8404.InvalidModuleSpecifier);
    }
    specifier8989 = delegate8418.createModuleSpecifier(lookahead8421);
    lex8456();
    return markerApply8461(marker8988, specifier8989);
}
function parseExportBatchSpecifier8512() {
    var marker8990 = markerCreate8459();
    expect8466("*");
    return markerApply8461(marker8990, delegate8418.createExportBatchSpecifier());
}
function parseExportSpecifier8513() {
    var id8991,
        name8992 = null,
        marker8993 = markerCreate8459(),
        from8994;
    if (matchKeyword8469("default")) {
        lex8456();
        id8991 = markerApply8461(marker8993, delegate8418.createIdentifier("default"));
    } else {
        id8991 = parseVariableIdentifier8506();
    }
    if (matchContextualKeyword8470("as")) {
        lex8456();
        name8992 = parseNonComputedProperty8487();
    }
    return markerApply8461(marker8993, delegate8418.createExportSpecifier(id8991, name8992));
}
function parseExportDeclaration8514() {
    var backtrackToken8995,
        id8996,
        previousAllowKeyword8997,
        declaration8998 = null,
        isExportFromIdentifier8999,
        src9000 = null,
        specifiers9001 = [],
        marker9002 = markerCreate8459();
    function rewind9003(token9004) {
        index8410 = token9004.range[0];
        lineNumber8411 = token9004.lineNumber;
        lineStart8412 = token9004.lineStart;
        lookahead8421 = token9004;
    }
    expectKeyword8467("export");
    if (matchKeyword8469("default")) {
        // covers:
        // export default ...
        lex8456();
        if (matchKeyword8469("function") || matchKeyword8469("class")) {
            backtrackToken8995 = lookahead8421;
            lex8456();
            if (isIdentifierName8453(lookahead8421)) {
                // covers:
                // export default function foo () {}
                // export default class foo {}
                id8996 = parseNonComputedProperty8487();
                rewind9003(backtrackToken8995);
                return markerApply8461(marker9002, delegate8418.createExportDeclaration(true, parseSourceElement8551(), [id8996], null));
            }
            // covers:
            // export default function () {}
            // export default class {}
            rewind9003(backtrackToken8995);
            switch (lookahead8421.value) {
                case "class":
                    return markerApply8461(marker9002, delegate8418.createExportDeclaration(true, parseClassExpression8549(), [], null));
                case "function":
                    return markerApply8461(marker9002, delegate8418.createExportDeclaration(true, parseFunctionExpression8544(), [], null));
            }
        }
        if (matchContextualKeyword8470("from")) {
            throwError8463({}, Messages8404.UnexpectedToken, lookahead8421.value);
        }
        if ( // covers:
        // export default {};
        // export default [];
        match8468("{")) {
            declaration8998 = parseObjectInitialiser8480();
        } else if (match8468("[")) {
            declaration8998 = parseArrayInitialiser8475();
        } else {
            declaration8998 = parseAssignmentExpression8502();
        }
        consumeSemicolon8472();
        return markerApply8461(marker9002, delegate8418.createExportDeclaration(true, declaration8998, [], null));
    }
    if ( // non-default export
    lookahead8421.type === Token8399.Keyword) {
        switch ( // covers:
        // export var f = 1;
        lookahead8421.value) {
            case "let":
            case "const":
            case "var":
            case "class":
            case "function":
                return markerApply8461(marker9002, delegate8418.createExportDeclaration(false, parseSourceElement8551(), specifiers9001, null));
        }
    }
    if (match8468("*")) {
        // covers:
        // export * from "foo";
        specifiers9001.push(parseExportBatchSpecifier8512());
        if (!matchContextualKeyword8470("from")) {
            throwError8463({}, lookahead8421.value ? Messages8404.UnexpectedToken : Messages8404.MissingFromClause, lookahead8421.value);
        }
        lex8456();
        src9000 = parseModuleSpecifier8511();
        consumeSemicolon8472();
        return markerApply8461(marker9002, delegate8418.createExportDeclaration(false, null, specifiers9001, src9000));
    }
    expect8466("{");
    do {
        isExportFromIdentifier8999 = isExportFromIdentifier8999 || matchKeyword8469("default");
        specifiers9001.push(parseExportSpecifier8513());
    } while (match8468(",") && lex8456());
    expect8466("}");
    if (matchContextualKeyword8470("from")) {
        // covering:
        // export {default} from "foo";
        // export {foo} from "foo";
        lex8456();
        src9000 = parseModuleSpecifier8511();
        consumeSemicolon8472();
    } else if (isExportFromIdentifier8999) {
        // covering:
        // export {default}; // missing fromClause
        throwError8463({}, lookahead8421.value ? Messages8404.UnexpectedToken : Messages8404.MissingFromClause, lookahead8421.value);
    } else {
        consumeSemicolon8472();
    }
    return markerApply8461(marker9002, delegate8418.createExportDeclaration(false, declaration8998, specifiers9001, src9000));
}
function parseImportSpecifier8515() {
    var
    // import {<foo as bar>} ...;
    id9005,
        name9006 = null,
        marker9007 = markerCreate8459();
    id9005 = parseNonComputedProperty8487(true);
    if (matchContextualKeyword8470("as")) {
        lex8456();
        name9006 = parseVariableIdentifier8506();
    }
    return markerApply8461(marker9007, delegate8418.createImportSpecifier(id9005, name9006));
}
function parseNamedImports8516() {
    var specifiers9008 = [];
    // {foo, bar as bas}
    expect8466("{");
    do {
        specifiers9008.push(parseImportSpecifier8515());
    } while (match8468(",") && lex8456());
    expect8466("}");
    return specifiers9008;
}
function parseImportDefaultSpecifier8517() {
    var
    // import <foo> ...;
    id9009,
        marker9010 = markerCreate8459();
    id9009 = parseNonComputedProperty8487();
    return markerApply8461(marker9010, delegate8418.createImportDefaultSpecifier(id9009));
}
function parseImportNamespaceSpecifier8518() {
    var
    // import <* as foo> ...;
    id9011,
        marker9012 = markerCreate8459();
    expect8466("*");
    if (!matchContextualKeyword8470("as")) {
        throwError8463({}, Messages8404.NoAsAfterImportNamespace);
    }
    lex8456();
    id9011 = parseNonComputedProperty8487();
    return markerApply8461(marker9012, delegate8418.createImportNamespaceSpecifier(id9011));
}
function parseImportDeclaration8519() {
    var specifiers9013,
        src9014,
        marker9015 = markerCreate8459();
    expectKeyword8467("import");
    specifiers9013 = [];
    if (lookahead8421.type === Token8399.StringLiteral) {
        // covers:
        // import "foo";
        src9014 = parseModuleSpecifier8511();
        consumeSemicolon8472();
        return markerApply8461(marker9015, delegate8418.createImportDeclaration(specifiers9013, src9014));
    }
    if (!matchKeyword8469("default") && isIdentifierName8453(lookahead8421)) {
        // covers:
        // import foo
        // import foo, ...
        specifiers9013.push(parseImportDefaultSpecifier8517());
        if (match8468(",")) {
            lex8456();
        }
    }
    if (match8468("*")) {
        // covers:
        // import foo, * as foo
        // import * as foo
        specifiers9013.push(parseImportNamespaceSpecifier8518());
    } else if (match8468("{")) {
        // covers:
        // import foo, {bar}
        // import {bar}
        specifiers9013 = specifiers9013.concat(parseNamedImports8516());
    }
    if (!matchContextualKeyword8470("from")) {
        throwError8463({}, lookahead8421.value ? Messages8404.UnexpectedToken : Messages8404.MissingFromClause, lookahead8421.value);
    }
    lex8456();
    src9014 = parseModuleSpecifier8511();
    consumeSemicolon8472();
    return markerApply8461(marker9015, delegate8418.createImportDeclaration(specifiers9013, src9014));
}
function parseEmptyStatement8520() {
    var marker9016 = markerCreate8459();
    expect8466(";");
    return markerApply8461(marker9016, delegate8418.createEmptyStatement());
}
function parseExpressionStatement8521() {
    var marker9017 = markerCreate8459(),
        expr9018 = parseExpression8503();
    consumeSemicolon8472();
    return markerApply8461(marker9017, delegate8418.createExpressionStatement(expr9018));
}
function parseIfStatement8522() {
    var test9019,
        consequent9020,
        alternate9021,
        marker9022 = markerCreate8459();
    expectKeyword8467("if");
    expect8466("(");
    test9019 = parseExpression8503();
    expect8466(")");
    consequent9020 = parseStatement8537();
    if (matchKeyword8469("else")) {
        lex8456();
        alternate9021 = parseStatement8537();
    } else {
        alternate9021 = null;
    }
    return markerApply8461(marker9022, delegate8418.createIfStatement(test9019, consequent9020, alternate9021));
}
function parseDoWhileStatement8523() {
    var body9023,
        test9024,
        oldInIteration9025,
        marker9026 = markerCreate8459();
    expectKeyword8467("do");
    oldInIteration9025 = state8423.inIteration;
    state8423.inIteration = true;
    body9023 = parseStatement8537();
    state8423.inIteration = oldInIteration9025;
    expectKeyword8467("while");
    expect8466("(");
    test9024 = parseExpression8503();
    expect8466(")");
    if (match8468(";")) {
        lex8456();
    }
    return markerApply8461(marker9026, delegate8418.createDoWhileStatement(body9023, test9024));
}
function parseWhileStatement8524() {
    var test9027,
        body9028,
        oldInIteration9029,
        marker9030 = markerCreate8459();
    expectKeyword8467("while");
    expect8466("(");
    test9027 = parseExpression8503();
    expect8466(")");
    oldInIteration9029 = state8423.inIteration;
    state8423.inIteration = true;
    body9028 = parseStatement8537();
    state8423.inIteration = oldInIteration9029;
    return markerApply8461(marker9030, delegate8418.createWhileStatement(test9027, body9028));
}
function parseForVariableDeclaration8525() {
    var marker9031 = markerCreate8459(),
        token9032 = lex8456(),
        declarations9033 = parseVariableDeclarationList8508();
    return markerApply8461(marker9031, delegate8418.createVariableDeclaration(declarations9033, token9032.value));
}
function parseForStatement8526(opts9034) {
    var init9035,
        test9036,
        update9037,
        left9038,
        right9039,
        body9040,
        operator9041,
        oldInIteration9042,
        marker9043 = markerCreate8459();
    init9035 = test9036 = update9037 = null;
    expectKeyword8467("for");
    if ( // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
    matchContextualKeyword8470("each")) {
        throwError8463({}, Messages8404.EachNotAllowed);
    }
    expect8466("(");
    if (match8468(";")) {
        lex8456();
    } else {
        if (matchKeyword8469("var") || matchKeyword8469("let") || matchKeyword8469("const")) {
            state8423.allowIn = false;
            init9035 = parseForVariableDeclaration8525();
            state8423.allowIn = true;
            if (init9035.declarations.length === 1) {
                if (matchKeyword8469("in") || matchContextualKeyword8470("of")) {
                    operator9041 = lookahead8421;
                    if (!((operator9041.value === "in" || init9035.kind !== "var") && init9035.declarations[0].init)) {
                        lex8456();
                        left9038 = init9035;
                        right9039 = parseExpression8503();
                        init9035 = null;
                    }
                }
            }
        } else {
            state8423.allowIn = false;
            init9035 = parseExpression8503();
            state8423.allowIn = true;
            if (matchContextualKeyword8470("of")) {
                operator9041 = lex8456();
                left9038 = init9035;
                right9039 = parseExpression8503();
                init9035 = null;
            } else if (matchKeyword8469("in")) {
                if ( // LeftHandSideExpression
                !isAssignableLeftHandSide8474(init9035)) {
                    throwError8463({}, Messages8404.InvalidLHSInForIn);
                }
                operator9041 = lex8456();
                left9038 = init9035;
                right9039 = parseExpression8503();
                init9035 = null;
            }
        }
        if (typeof left9038 === "undefined") {
            expect8466(";");
        }
    }
    if (typeof left9038 === "undefined") {
        if (!match8468(";")) {
            test9036 = parseExpression8503();
        }
        expect8466(";");
        if (!match8468(")")) {
            update9037 = parseExpression8503();
        }
    }
    expect8466(")");
    oldInIteration9042 = state8423.inIteration;
    state8423.inIteration = true;
    if (!(opts9034 !== undefined && opts9034.ignoreBody)) {
        body9040 = parseStatement8537();
    }
    state8423.inIteration = oldInIteration9042;
    if (typeof left9038 === "undefined") {
        return markerApply8461(marker9043, delegate8418.createForStatement(init9035, test9036, update9037, body9040));
    }
    if (operator9041.value === "in") {
        return markerApply8461(marker9043, delegate8418.createForInStatement(left9038, right9039, body9040));
    }
    return markerApply8461(marker9043, delegate8418.createForOfStatement(left9038, right9039, body9040));
}
function parseContinueStatement8527() {
    var label9044 = null,
        key9045,
        marker9046 = markerCreate8459();
    expectKeyword8467("continue");
    if ( // Optimize the most common form: 'continue;'.
    lookahead8421.value.charCodeAt(0) === 59) {
        lex8456();
        if (!state8423.inIteration) {
            throwError8463({}, Messages8404.IllegalContinue);
        }
        return markerApply8461(marker9046, delegate8418.createContinueStatement(null));
    }
    if (peekLineTerminator8462()) {
        if (!state8423.inIteration) {
            throwError8463({}, Messages8404.IllegalContinue);
        }
        return markerApply8461(marker9046, delegate8418.createContinueStatement(null));
    }
    if (lookahead8421.type === Token8399.Identifier) {
        label9044 = parseVariableIdentifier8506();
        key9045 = "$" + label9044.name;
        if (!Object.prototype.hasOwnProperty.call(state8423.labelSet, key9045)) {
            throwError8463({}, Messages8404.UnknownLabel, label9044.name);
        }
    }
    consumeSemicolon8472();
    if (label9044 === null && !state8423.inIteration) {
        throwError8463({}, Messages8404.IllegalContinue);
    }
    return markerApply8461(marker9046, delegate8418.createContinueStatement(label9044));
}
function parseBreakStatement8528() {
    var label9047 = null,
        key9048,
        marker9049 = markerCreate8459();
    expectKeyword8467("break");
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    lookahead8421.value.charCodeAt(0) === 59) {
        lex8456();
        if (!(state8423.inIteration || state8423.inSwitch)) {
            throwError8463({}, Messages8404.IllegalBreak);
        }
        return markerApply8461(marker9049, delegate8418.createBreakStatement(null));
    }
    if (peekLineTerminator8462()) {
        if (!(state8423.inIteration || state8423.inSwitch)) {
            throwError8463({}, Messages8404.IllegalBreak);
        }
        return markerApply8461(marker9049, delegate8418.createBreakStatement(null));
    }
    if (lookahead8421.type === Token8399.Identifier) {
        label9047 = parseVariableIdentifier8506();
        key9048 = "$" + label9047.name;
        if (!Object.prototype.hasOwnProperty.call(state8423.labelSet, key9048)) {
            throwError8463({}, Messages8404.UnknownLabel, label9047.name);
        }
    }
    consumeSemicolon8472();
    if (label9047 === null && !(state8423.inIteration || state8423.inSwitch)) {
        throwError8463({}, Messages8404.IllegalBreak);
    }
    return markerApply8461(marker9049, delegate8418.createBreakStatement(label9047));
}
function parseReturnStatement8529() {
    var argument9050 = null,
        marker9051 = markerCreate8459();
    expectKeyword8467("return");
    if (!state8423.inFunctionBody) {
        throwErrorTolerant8464({}, Messages8404.IllegalReturn);
    }
    if ( // 'return' followed by a space and an identifier is very common.
    isIdentifierStart8433(String(lookahead8421.value).charCodeAt(0))) {
        argument9050 = parseExpression8503();
        consumeSemicolon8472();
        return markerApply8461(marker9051, delegate8418.createReturnStatement(argument9050));
    }
    if (peekLineTerminator8462()) {
        return markerApply8461(marker9051, delegate8418.createReturnStatement(null));
    }
    if (!match8468(";")) {
        if (!match8468("}") && lookahead8421.type !== Token8399.EOF) {
            argument9050 = parseExpression8503();
        }
    }
    consumeSemicolon8472();
    return markerApply8461(marker9051, delegate8418.createReturnStatement(argument9050));
}
function parseWithStatement8530() {
    var object9052,
        body9053,
        marker9054 = markerCreate8459();
    if (strict8409) {
        throwErrorTolerant8464({}, Messages8404.StrictModeWith);
    }
    expectKeyword8467("with");
    expect8466("(");
    object9052 = parseExpression8503();
    expect8466(")");
    body9053 = parseStatement8537();
    return markerApply8461(marker9054, delegate8418.createWithStatement(object9052, body9053));
}
function parseSwitchCase8531() {
    var test9055,
        consequent9056 = [],
        sourceElement9057,
        marker9058 = markerCreate8459();
    if (matchKeyword8469("default")) {
        lex8456();
        test9055 = null;
    } else {
        expectKeyword8467("case");
        test9055 = parseExpression8503();
    }
    expect8466(":");
    while (streamIndex8420 < length8417) {
        if (match8468("}") || matchKeyword8469("default") || matchKeyword8469("case")) {
            break;
        }
        sourceElement9057 = parseSourceElement8551();
        if (typeof sourceElement9057 === "undefined") {
            break;
        }
        consequent9056.push(sourceElement9057);
    }
    return markerApply8461(marker9058, delegate8418.createSwitchCase(test9055, consequent9056));
}
function parseSwitchStatement8532() {
    var discriminant9059,
        cases9060,
        clause9061,
        oldInSwitch9062,
        defaultFound9063,
        marker9064 = markerCreate8459();
    expectKeyword8467("switch");
    expect8466("(");
    discriminant9059 = parseExpression8503();
    expect8466(")");
    expect8466("{");
    cases9060 = [];
    if (match8468("}")) {
        lex8456();
        return markerApply8461(marker9064, delegate8418.createSwitchStatement(discriminant9059, cases9060));
    }
    oldInSwitch9062 = state8423.inSwitch;
    state8423.inSwitch = true;
    defaultFound9063 = false;
    while (streamIndex8420 < length8417) {
        if (match8468("}")) {
            break;
        }
        clause9061 = parseSwitchCase8531();
        if (clause9061.test === null) {
            if (defaultFound9063) {
                throwError8463({}, Messages8404.MultipleDefaultsInSwitch);
            }
            defaultFound9063 = true;
        }
        cases9060.push(clause9061);
    }
    state8423.inSwitch = oldInSwitch9062;
    expect8466("}");
    return markerApply8461(marker9064, delegate8418.createSwitchStatement(discriminant9059, cases9060));
}
function parseThrowStatement8533() {
    var argument9065,
        marker9066 = markerCreate8459();
    expectKeyword8467("throw");
    if (peekLineTerminator8462()) {
        throwError8463({}, Messages8404.NewlineAfterThrow);
    }
    argument9065 = parseExpression8503();
    consumeSemicolon8472();
    return markerApply8461(marker9066, delegate8418.createThrowStatement(argument9065));
}
function parseCatchClause8534() {
    var param9067,
        body9068,
        marker9069 = markerCreate8459();
    expectKeyword8467("catch");
    expect8466("(");
    if (match8468(")")) {
        throwUnexpected8465(lookahead8421);
    }
    param9067 = parseExpression8503();
    if ( // 12.14.1
    strict8409 && param9067.type === Syntax8402.Identifier && isRestrictedWord8437(param9067.name)) {
        throwErrorTolerant8464({}, Messages8404.StrictCatchVariable);
    }
    expect8466(")");
    body9068 = parseBlock8505();
    return markerApply8461(marker9069, delegate8418.createCatchClause(param9067, body9068));
}
function parseTryStatement8535() {
    var block9070,
        handlers9071 = [],
        finalizer9072 = null,
        marker9073 = markerCreate8459();
    expectKeyword8467("try");
    block9070 = parseBlock8505();
    if (matchKeyword8469("catch")) {
        handlers9071.push(parseCatchClause8534());
    }
    if (matchKeyword8469("finally")) {
        lex8456();
        finalizer9072 = parseBlock8505();
    }
    if (handlers9071.length === 0 && !finalizer9072) {
        throwError8463({}, Messages8404.NoCatchOrFinally);
    }
    return markerApply8461(marker9073, delegate8418.createTryStatement(block9070, [], handlers9071, finalizer9072));
}
function parseDebuggerStatement8536() {
    var marker9074 = markerCreate8459();
    expectKeyword8467("debugger");
    consumeSemicolon8472();
    return markerApply8461(marker9074, delegate8418.createDebuggerStatement());
}
function parseStatement8537() {
    var type9075 = lookahead8421.type,
        marker9076,
        expr9077,
        labeledBody9078,
        key9079;
    if (type9075 === Token8399.EOF) {
        throwUnexpected8465(lookahead8421);
    }
    if (type9075 === Token8399.Punctuator) {
        switch (lookahead8421.value) {
            case ";":
                return parseEmptyStatement8520();
            case "{":
                return parseBlock8505();
            case "(":
                return parseExpressionStatement8521();
            default:
                break;
        }
    }
    if (type9075 === Token8399.Keyword) {
        switch (lookahead8421.value) {
            case "break":
                return parseBreakStatement8528();
            case "continue":
                return parseContinueStatement8527();
            case "debugger":
                return parseDebuggerStatement8536();
            case "do":
                return parseDoWhileStatement8523();
            case "for":
                return parseForStatement8526();
            case "function":
                return parseFunctionDeclaration8543();
            case "class":
                return parseClassDeclaration8550();
            case "if":
                return parseIfStatement8522();
            case "return":
                return parseReturnStatement8529();
            case "switch":
                return parseSwitchStatement8532();
            case "throw":
                return parseThrowStatement8533();
            case "try":
                return parseTryStatement8535();
            case "var":
                return parseVariableStatement8509();
            case "while":
                return parseWhileStatement8524();
            case "with":
                return parseWithStatement8530();
            default:
                break;
        }
    }
    marker9076 = markerCreate8459();
    expr9077 = parseExpression8503();
    if ( // 12.12 Labelled Statements
    expr9077.type === Syntax8402.Identifier && match8468(":")) {
        lex8456();
        key9079 = "$" + expr9077.name;
        if (Object.prototype.hasOwnProperty.call(state8423.labelSet, key9079)) {
            throwError8463({}, Messages8404.Redeclaration, "Label", expr9077.name);
        }
        state8423.labelSet[key9079] = true;
        labeledBody9078 = parseStatement8537();
        delete state8423.labelSet[key9079];
        return markerApply8461(marker9076, delegate8418.createLabeledStatement(expr9077, labeledBody9078));
    }
    consumeSemicolon8472();
    return markerApply8461(marker9076, delegate8418.createExpressionStatement(expr9077));
}
function parseConciseBody8538() {
    if (match8468("{")) {
        return parseFunctionSourceElements8539();
    }
    return parseAssignmentExpression8502();
}
function parseFunctionSourceElements8539() {
    var sourceElement9080,
        sourceElements9081 = [],
        token9082,
        directive9083,
        firstRestricted9084,
        oldLabelSet9085,
        oldInIteration9086,
        oldInSwitch9087,
        oldInFunctionBody9088,
        oldParenthesizedCount9089,
        marker9090 = markerCreate8459();
    expect8466("{");
    while (streamIndex8420 < length8417) {
        if (lookahead8421.type !== Token8399.StringLiteral) {
            break;
        }
        token9082 = lookahead8421;
        sourceElement9080 = parseSourceElement8551();
        sourceElements9081.push(sourceElement9080);
        if (sourceElement9080.expression.type !== Syntax8402.Literal) {
            // this is not directive
            break;
        }
        directive9083 = token9082.value;
        if (directive9083 === "use strict") {
            strict8409 = true;
            if (firstRestricted9084) {
                throwErrorTolerant8464(firstRestricted9084, Messages8404.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9084 && token9082.octal) {
                firstRestricted9084 = token9082;
            }
        }
    }
    oldLabelSet9085 = state8423.labelSet;
    oldInIteration9086 = state8423.inIteration;
    oldInSwitch9087 = state8423.inSwitch;
    oldInFunctionBody9088 = state8423.inFunctionBody;
    oldParenthesizedCount9089 = state8423.parenthesizedCount;
    state8423.labelSet = {};
    state8423.inIteration = false;
    state8423.inSwitch = false;
    state8423.inFunctionBody = true;
    state8423.parenthesizedCount = 0;
    while (streamIndex8420 < length8417) {
        if (match8468("}")) {
            break;
        }
        sourceElement9080 = parseSourceElement8551();
        if (typeof sourceElement9080 === "undefined") {
            break;
        }
        sourceElements9081.push(sourceElement9080);
    }
    expect8466("}");
    state8423.labelSet = oldLabelSet9085;
    state8423.inIteration = oldInIteration9086;
    state8423.inSwitch = oldInSwitch9087;
    state8423.inFunctionBody = oldInFunctionBody9088;
    state8423.parenthesizedCount = oldParenthesizedCount9089;
    return markerApply8461(marker9090, delegate8418.createBlockStatement(sourceElements9081));
}
function validateParam8540(options9091, param9092, name9093) {
    var key9094 = "$" + name9093;
    if (strict8409) {
        if (isRestrictedWord8437(name9093)) {
            options9091.stricted = param9092;
            options9091.message = Messages8404.StrictParamName;
        }
        if (Object.prototype.hasOwnProperty.call(options9091.paramSet, key9094)) {
            options9091.stricted = param9092;
            options9091.message = Messages8404.StrictParamDupe;
        }
    } else if (!options9091.firstRestricted) {
        if (isRestrictedWord8437(name9093)) {
            options9091.firstRestricted = param9092;
            options9091.message = Messages8404.StrictParamName;
        } else if (isStrictModeReservedWord8436(name9093)) {
            options9091.firstRestricted = param9092;
            options9091.message = Messages8404.StrictReservedWord;
        } else if (Object.prototype.hasOwnProperty.call(options9091.paramSet, key9094)) {
            options9091.firstRestricted = param9092;
            options9091.message = Messages8404.StrictParamDupe;
        }
    }
    options9091.paramSet[key9094] = true;
}
function parseParam8541(options9095) {
    var token9096, rest9097, param9098, def9099;
    token9096 = lookahead8421;
    if (token9096.value === "...") {
        token9096 = lex8456();
        rest9097 = true;
    }
    if (match8468("[")) {
        param9098 = parseArrayInitialiser8475();
        reinterpretAsDestructuredParameter8499(options9095, param9098);
    } else if (match8468("{")) {
        if (rest9097) {
            throwError8463({}, Messages8404.ObjectPatternAsRestParameter);
        }
        param9098 = parseObjectInitialiser8480();
        reinterpretAsDestructuredParameter8499(options9095, param9098);
    } else {
        param9098 = parseVariableIdentifier8506();
        validateParam8540(options9095, token9096, token9096.value);
    }
    if (match8468("=")) {
        if (rest9097) {
            throwErrorTolerant8464(lookahead8421, Messages8404.DefaultRestParameter);
        }
        lex8456();
        def9099 = parseAssignmentExpression8502();
        ++options9095.defaultCount;
    }
    if (rest9097) {
        if (!match8468(")")) {
            throwError8463({}, Messages8404.ParameterAfterRestParameter);
        }
        options9095.rest = param9098;
        return false;
    }
    options9095.params.push(param9098);
    options9095.defaults.push(def9099);
    return !match8468(")");
}
function parseParams8542(firstRestricted9100) {
    var options9101;
    options9101 = {
        params: [],
        defaultCount: 0,
        defaults: [],
        rest: null,
        firstRestricted: firstRestricted9100
    };
    expect8466("(");
    if (!match8468(")")) {
        options9101.paramSet = {};
        while (streamIndex8420 < length8417) {
            if (!parseParam8541(options9101)) {
                break;
            }
            expect8466(",");
        }
    }
    expect8466(")");
    if (options9101.defaultCount === 0) {
        options9101.defaults = [];
    }
    return options9101;
}
function parseFunctionDeclaration8543() {
    var id9102,
        body9103,
        token9104,
        tmp9105,
        firstRestricted9106,
        message9107,
        previousStrict9108,
        previousYieldAllowed9109,
        generator9110,
        marker9111 = markerCreate8459();
    expectKeyword8467("function");
    generator9110 = false;
    if (match8468("*")) {
        lex8456();
        generator9110 = true;
    }
    token9104 = lookahead8421;
    id9102 = parseVariableIdentifier8506();
    if (strict8409) {
        if (isRestrictedWord8437(token9104.value)) {
            throwErrorTolerant8464(token9104, Messages8404.StrictFunctionName);
        }
    } else {
        if (isRestrictedWord8437(token9104.value)) {
            firstRestricted9106 = token9104;
            message9107 = Messages8404.StrictFunctionName;
        } else if (isStrictModeReservedWord8436(token9104.value)) {
            firstRestricted9106 = token9104;
            message9107 = Messages8404.StrictReservedWord;
        }
    }
    tmp9105 = parseParams8542(firstRestricted9106);
    firstRestricted9106 = tmp9105.firstRestricted;
    if (tmp9105.message) {
        message9107 = tmp9105.message;
    }
    previousStrict9108 = strict8409;
    previousYieldAllowed9109 = state8423.yieldAllowed;
    state8423.yieldAllowed = generator9110;
    body9103 = parseFunctionSourceElements8539();
    if (strict8409 && firstRestricted9106) {
        throwError8463(firstRestricted9106, message9107);
    }
    if (strict8409 && tmp9105.stricted) {
        throwErrorTolerant8464(tmp9105.stricted, message9107);
    }
    strict8409 = previousStrict9108;
    state8423.yieldAllowed = previousYieldAllowed9109;
    return markerApply8461(marker9111, delegate8418.createFunctionDeclaration(id9102, tmp9105.params, tmp9105.defaults, body9103, tmp9105.rest, generator9110, false));
}
function parseFunctionExpression8544() {
    var token9112,
        id9113 = null,
        firstRestricted9114,
        message9115,
        tmp9116,
        body9117,
        previousStrict9118,
        previousYieldAllowed9119,
        generator9120,
        marker9121 = markerCreate8459();
    expectKeyword8467("function");
    generator9120 = false;
    if (match8468("*")) {
        lex8456();
        generator9120 = true;
    }
    if (!match8468("(")) {
        token9112 = lookahead8421;
        id9113 = parseVariableIdentifier8506();
        if (strict8409) {
            if (isRestrictedWord8437(token9112.value)) {
                throwErrorTolerant8464(token9112, Messages8404.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord8437(token9112.value)) {
                firstRestricted9114 = token9112;
                message9115 = Messages8404.StrictFunctionName;
            } else if (isStrictModeReservedWord8436(token9112.value)) {
                firstRestricted9114 = token9112;
                message9115 = Messages8404.StrictReservedWord;
            }
        }
    }
    tmp9116 = parseParams8542(firstRestricted9114);
    firstRestricted9114 = tmp9116.firstRestricted;
    if (tmp9116.message) {
        message9115 = tmp9116.message;
    }
    previousStrict9118 = strict8409;
    previousYieldAllowed9119 = state8423.yieldAllowed;
    state8423.yieldAllowed = generator9120;
    body9117 = parseFunctionSourceElements8539();
    if (strict8409 && firstRestricted9114) {
        throwError8463(firstRestricted9114, message9115);
    }
    if (strict8409 && tmp9116.stricted) {
        throwErrorTolerant8464(tmp9116.stricted, message9115);
    }
    strict8409 = previousStrict9118;
    state8423.yieldAllowed = previousYieldAllowed9119;
    return markerApply8461(marker9121, delegate8418.createFunctionExpression(id9113, tmp9116.params, tmp9116.defaults, body9117, tmp9116.rest, generator9120, false));
}
function parseYieldExpression8545() {
    var yieldToken9122,
        delegateFlag9123,
        expr9124,
        marker9125 = markerCreate8459();
    yieldToken9122 = lex8456();
    assert8426(yieldToken9122.value === "yield", "Called parseYieldExpression with non-yield lookahead.");
    if (!state8423.yieldAllowed) {
        throwErrorTolerant8464({}, Messages8404.IllegalYield);
    }
    delegateFlag9123 = false;
    if (match8468("*")) {
        lex8456();
        delegateFlag9123 = true;
    }
    expr9124 = parseAssignmentExpression8502();
    return markerApply8461(marker9125, delegate8418.createYieldExpression(expr9124, delegateFlag9123));
}
function parseMethodDefinition8546(existingPropNames9126) {
    var token9127,
        key9128,
        param9129,
        propType9130,
        isValidDuplicateProp9131 = false,
        marker9132 = markerCreate8459();
    if (lookahead8421.value === "static") {
        propType9130 = ClassPropertyType8407["static"];
        lex8456();
    } else {
        propType9130 = ClassPropertyType8407.prototype;
    }
    if (match8468("*")) {
        lex8456();
        return markerApply8461(marker9132, delegate8418.createMethodDefinition(propType9130, "", parseObjectPropertyKey8478(), parsePropertyMethodFunction8477({ generator: true })));
    }
    token9127 = lookahead8421;
    key9128 = parseObjectPropertyKey8478();
    if (token9127.value === "get" && !match8468("(")) {
        key9128 = parseObjectPropertyKey8478();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a setter
        existingPropNames9126[propType9130].hasOwnProperty(key9128.name)) {
            isValidDuplicateProp9131 = // There isn't already a getter for this prop
            existingPropNames9126[propType9130][key9128.name].get === undefined && // There isn't already a data prop by this name
            existingPropNames9126[propType9130][key9128.name].data === undefined && // The only existing prop by this name is a setter
            existingPropNames9126[propType9130][key9128.name].set !== undefined;
            if (!isValidDuplicateProp9131) {
                throwError8463(key9128, Messages8404.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9126[propType9130][key9128.name] = {};
        }
        existingPropNames9126[propType9130][key9128.name].get = true;
        expect8466("(");
        expect8466(")");
        return markerApply8461(marker9132, delegate8418.createMethodDefinition(propType9130, "get", key9128, parsePropertyFunction8476({ generator: false })));
    }
    if (token9127.value === "set" && !match8468("(")) {
        key9128 = parseObjectPropertyKey8478();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a getter
        existingPropNames9126[propType9130].hasOwnProperty(key9128.name)) {
            isValidDuplicateProp9131 = // There isn't already a setter for this prop
            existingPropNames9126[propType9130][key9128.name].set === undefined && // There isn't already a data prop by this name
            existingPropNames9126[propType9130][key9128.name].data === undefined && // The only existing prop by this name is a getter
            existingPropNames9126[propType9130][key9128.name].get !== undefined;
            if (!isValidDuplicateProp9131) {
                throwError8463(key9128, Messages8404.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9126[propType9130][key9128.name] = {};
        }
        existingPropNames9126[propType9130][key9128.name].set = true;
        expect8466("(");
        token9127 = lookahead8421;
        param9129 = [parseVariableIdentifier8506()];
        expect8466(")");
        return markerApply8461(marker9132, delegate8418.createMethodDefinition(propType9130, "set", key9128, parsePropertyFunction8476({
            params: param9129,
            generator: false,
            name: token9127
        })));
    }
    if ( // It is a syntax error if any other properties have the same name as a
    // non-getter, non-setter method
    existingPropNames9126[propType9130].hasOwnProperty(key9128.name)) {
        throwError8463(key9128, Messages8404.IllegalDuplicateClassProperty);
    } else {
        existingPropNames9126[propType9130][key9128.name] = {};
    }
    existingPropNames9126[propType9130][key9128.name].data = true;
    return markerApply8461(marker9132, delegate8418.createMethodDefinition(propType9130, "", key9128, parsePropertyMethodFunction8477({ generator: false })));
}
function parseClassElement8547(existingProps9133) {
    if (match8468(";")) {
        lex8456();
        return;
    }
    return parseMethodDefinition8546(existingProps9133);
}
function parseClassBody8548() {
    var classElement9134,
        classElements9135 = [],
        existingProps9136 = {},
        marker9137 = markerCreate8459();
    existingProps9136[ClassPropertyType8407["static"]] = {};
    existingProps9136[ClassPropertyType8407.prototype] = {};
    expect8466("{");
    while (streamIndex8420 < length8417) {
        if (match8468("}")) {
            break;
        }
        classElement9134 = parseClassElement8547(existingProps9136);
        if (typeof classElement9134 !== "undefined") {
            classElements9135.push(classElement9134);
        }
    }
    expect8466("}");
    return markerApply8461(marker9137, delegate8418.createClassBody(classElements9135));
}
function parseClassExpression8549() {
    var id9138,
        previousYieldAllowed9139,
        superClass9140 = null,
        marker9141 = markerCreate8459();
    expectKeyword8467("class");
    if (!matchKeyword8469("extends") && !match8468("{")) {
        id9138 = parseVariableIdentifier8506();
    }
    if (matchKeyword8469("extends")) {
        expectKeyword8467("extends");
        previousYieldAllowed9139 = state8423.yieldAllowed;
        state8423.yieldAllowed = false;
        superClass9140 = parseAssignmentExpression8502();
        state8423.yieldAllowed = previousYieldAllowed9139;
    }
    return markerApply8461(marker9141, delegate8418.createClassExpression(id9138, superClass9140, parseClassBody8548()));
}
function parseClassDeclaration8550() {
    var id9142,
        previousYieldAllowed9143,
        superClass9144 = null,
        marker9145 = markerCreate8459();
    expectKeyword8467("class");
    id9142 = parseVariableIdentifier8506();
    if (matchKeyword8469("extends")) {
        expectKeyword8467("extends");
        previousYieldAllowed9143 = state8423.yieldAllowed;
        state8423.yieldAllowed = false;
        superClass9144 = parseAssignmentExpression8502();
        state8423.yieldAllowed = previousYieldAllowed9143;
    }
    return markerApply8461(marker9145, delegate8418.createClassDeclaration(id9142, superClass9144, parseClassBody8548()));
}
function parseSourceElement8551() {
    if (lookahead8421.type === Token8399.Keyword) {
        switch (lookahead8421.value) {
            case "const":
            case "let":
                return parseConstLetDeclaration8510(lookahead8421.value);
            case "function":
                return parseFunctionDeclaration8543();
            default:
                return parseStatement8537();
        }
    }
    if (lookahead8421.type !== Token8399.EOF) {
        return parseStatement8537();
    }
}
function parseProgramElement8552() {
    if (lookahead8421.type === Token8399.Keyword) {
        switch (lookahead8421.value) {
            case "export":
                return parseExportDeclaration8514();
            case "import":
                return parseImportDeclaration8519();
        }
    }
    return parseSourceElement8551();
}
function parseProgramElements8553() {
    var sourceElement9146,
        sourceElements9147 = [],
        token9148,
        directive9149,
        firstRestricted9150;
    while (streamIndex8420 < length8417) {
        token9148 = lookahead8421;
        if (token9148.type !== Token8399.StringLiteral) {
            break;
        }
        sourceElement9146 = parseProgramElement8552();
        sourceElements9147.push(sourceElement9146);
        if (sourceElement9146.expression.type !== Syntax8402.Literal) {
            // this is not directive
            break;
        }
        directive9149 = token9148.value;
        if (directive9149 === "use strict") {
            strict8409 = true;
            if (firstRestricted9150) {
                throwErrorTolerant8464(firstRestricted9150, Messages8404.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9150 && token9148.octal) {
                firstRestricted9150 = token9148;
            }
        }
    }
    while (streamIndex8420 < length8417) {
        sourceElement9146 = parseProgramElement8552();
        if (typeof sourceElement9146 === "undefined") {
            break;
        }
        sourceElements9147.push(sourceElement9146);
    }
    return sourceElements9147;
}
function parseProgram8554() {
    var body9151,
        marker9152 = markerCreate8459();
    strict8409 = false;
    peek8457();
    body9151 = parseProgramElements8553();
    return markerApply8461(marker9152, delegate8418.createProgram(body9151));
}
function addComment8555(type9153, value9154, start9155, end9156, loc9157) {
    var comment9158;
    assert8426(typeof start9155 === "number", "Comment must have valid position");
    if ( // Because the way the actual token is scanned, often the comments
    // (if any) are skipped twice during the lexical analysis.
    // Thus, we need to skip adding a comment if the comment array already
    // handled it.
    state8423.lastCommentStart >= start9155) {
        return;
    }
    state8423.lastCommentStart = start9155;
    comment9158 = {
        type: type9153,
        value: value9154
    };
    if (extra8425.range) {
        comment9158.range = [start9155, end9156];
    }
    if (extra8425.loc) {
        comment9158.loc = loc9157;
    }
    extra8425.comments.push(comment9158);
    if (extra8425.attachComment) {
        extra8425.leadingComments.push(comment9158);
        extra8425.trailingComments.push(comment9158);
    }
}
function scanComment8556() {
    var comment9159, ch9160, loc9161, start9162, blockComment9163, lineComment9164;
    comment9159 = "";
    blockComment9163 = false;
    lineComment9164 = false;
    while (index8410 < length8417) {
        ch9160 = source8408[index8410];
        if (lineComment9164) {
            ch9160 = source8408[index8410++];
            if (isLineTerminator8432(ch9160.charCodeAt(0))) {
                loc9161.end = {
                    line: lineNumber8411,
                    column: index8410 - lineStart8412 - 1
                };
                lineComment9164 = false;
                addComment8555("Line", comment9159, start9162, index8410 - 1, loc9161);
                if (ch9160 === "\r" && source8408[index8410] === "\n") {
                    ++index8410;
                }
                ++lineNumber8411;
                lineStart8412 = index8410;
                comment9159 = "";
            } else if (index8410 >= length8417) {
                lineComment9164 = false;
                comment9159 += ch9160;
                loc9161.end = {
                    line: lineNumber8411,
                    column: length8417 - lineStart8412
                };
                addComment8555("Line", comment9159, start9162, length8417, loc9161);
            } else {
                comment9159 += ch9160;
            }
        } else if (blockComment9163) {
            if (isLineTerminator8432(ch9160.charCodeAt(0))) {
                if (ch9160 === "\r" && source8408[index8410 + 1] === "\n") {
                    ++index8410;
                    comment9159 += "\r\n";
                } else {
                    comment9159 += ch9160;
                }
                ++lineNumber8411;
                ++index8410;
                lineStart8412 = index8410;
                if (index8410 >= length8417) {
                    throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch9160 = source8408[index8410++];
                if (index8410 >= length8417) {
                    throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
                }
                comment9159 += ch9160;
                if (ch9160 === "*") {
                    ch9160 = source8408[index8410];
                    if (ch9160 === "/") {
                        comment9159 = comment9159.substr(0, comment9159.length - 1);
                        blockComment9163 = false;
                        ++index8410;
                        loc9161.end = {
                            line: lineNumber8411,
                            column: index8410 - lineStart8412
                        };
                        addComment8555("Block", comment9159, start9162, index8410, loc9161);
                        comment9159 = "";
                    }
                }
            }
        } else if (ch9160 === "/") {
            ch9160 = source8408[index8410 + 1];
            if (ch9160 === "/") {
                loc9161 = {
                    start: {
                        line: lineNumber8411,
                        column: index8410 - lineStart8412
                    }
                };
                start9162 = index8410;
                index8410 += 2;
                lineComment9164 = true;
                if (index8410 >= length8417) {
                    loc9161.end = {
                        line: lineNumber8411,
                        column: index8410 - lineStart8412
                    };
                    lineComment9164 = false;
                    addComment8555("Line", comment9159, start9162, index8410, loc9161);
                }
            } else if (ch9160 === "*") {
                start9162 = index8410;
                index8410 += 2;
                blockComment9163 = true;
                loc9161 = {
                    start: {
                        line: lineNumber8411,
                        column: index8410 - lineStart8412 - 2
                    }
                };
                if (index8410 >= length8417) {
                    throwError8463({}, Messages8404.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8431(ch9160.charCodeAt(0))) {
            ++index8410;
        } else if (isLineTerminator8432(ch9160.charCodeAt(0))) {
            ++index8410;
            if (ch9160 === "\r" && source8408[index8410] === "\n") {
                ++index8410;
            }
            ++lineNumber8411;
            lineStart8412 = index8410;
        } else {
            break;
        }
    }
}
function collectToken8557() {
    var start9165, loc9166, token9167, range9168, value9169, entry9170;
    skipComment8439();
    start9165 = index8410;
    loc9166 = {
        start: {
            line: lineNumber8411,
            column: index8410 - lineStart8412
        }
    };
    token9167 = extra8425.advance();
    loc9166.end = {
        line: lineNumber8411,
        column: index8410 - lineStart8412
    };
    if (token9167.type !== Token8399.EOF) {
        range9168 = [token9167.range[0], token9167.range[1]];
        value9169 = source8408.slice(token9167.range[0], token9167.range[1]);
        entry9170 = {
            type: TokenName8400[token9167.type],
            value: value9169,
            range: range9168,
            loc: loc9166
        };
        if (token9167.regex) {
            entry9170.regex = {
                pattern: token9167.regex.pattern,
                flags: token9167.regex.flags
            };
        }
        extra8425.tokens.push(entry9170);
    }
    return token9167;
}
function collectRegex8558() {
    var pos9171, loc9172, regex9173, token9174;
    skipComment8439();
    pos9171 = index8410;
    loc9172 = {
        start: {
            line: lineNumber8411,
            column: index8410 - lineStart8412
        }
    };
    regex9173 = extra8425.scanRegExp();
    loc9172.end = {
        line: lineNumber8411,
        column: index8410 - lineStart8412
    };
    if (!extra8425.tokenize) {
        if ( // Pop the previous token, which is likely '/' or '/='
        extra8425.tokens.length > 0) {
            token9174 = extra8425.tokens[extra8425.tokens.length - 1];
            if (token9174.range[0] === pos9171 && token9174.type === "Punctuator") {
                if (token9174.value === "/" || token9174.value === "/=") {
                    extra8425.tokens.pop();
                }
            }
        }
        extra8425.tokens.push({
            type: "RegularExpression",
            value: regex9173.literal,
            regex: regex9173.regex,
            range: [pos9171, index8410],
            loc: loc9172
        });
    }
    return regex9173;
}
function filterTokenLocation8559() {
    var i9175,
        entry9176,
        token9177,
        tokens9178 = [];
    for (i9175 = 0; i9175 < extra8425.tokens.length; ++i9175) {
        entry9176 = extra8425.tokens[i9175];
        token9177 = {
            type: entry9176.type,
            value: entry9176.value
        };
        if (entry9176.regex) {
            token9177.regex = {
                pattern: entry9176.regex.pattern,
                flags: entry9176.regex.flags
            };
        }
        if (extra8425.range) {
            token9177.range = entry9176.range;
        }
        if (extra8425.loc) {
            token9177.loc = entry9176.loc;
        }
        tokens9178.push(token9177);
    }
    extra8425.tokens = tokens9178;
}
function patch8560() {
    if (extra8425.comments) {
        extra8425.skipComment = skipComment8439;
        skipComment8439 = scanComment8556;
    }
    if (typeof extra8425.tokens !== "undefined") {
        extra8425.advance = advance8455;
        extra8425.scanRegExp = scanRegExp8452;
        advance8455 = collectToken8557;
        scanRegExp8452 = collectRegex8558;
    }
}
function unpatch8561() {
    if (typeof extra8425.skipComment === "function") {
        skipComment8439 = extra8425.skipComment;
    }
    if (typeof extra8425.scanRegExp === "function") {
        advance8455 = extra8425.advance;
        scanRegExp8452 = extra8425.scanRegExp;
    }
}
function extend8562(object9179, properties9180) {
    var entry9181,
        result9182 = {};
    for (entry9181 in object9179) {
        if (object9179.hasOwnProperty(entry9181)) {
            result9182[entry9181] = object9179[entry9181];
        }
    }
    for (entry9181 in properties9180) {
        if (properties9180.hasOwnProperty(entry9181)) {
            result9182[entry9181] = properties9180[entry9181];
        }
    }
    return result9182;
}
function tokenize8563(code9183, options9184) {
    var toString9185, token9186, tokens9187;
    toString9185 = String;
    if (typeof code9183 !== "string" && !(code9183 instanceof String)) {
        code9183 = toString9185(code9183);
    }
    delegate8418 = SyntaxTreeDelegate8406;
    source8408 = code9183;
    index8410 = 0;
    lineNumber8411 = source8408.length > 0 ? 1 : 0;
    lineStart8412 = 0;
    length8417 = source8408.length;
    lookahead8421 = null;
    state8423 = {
        allowKeyword: true,
        allowIn: true,
        labelSet: {},
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        lastCommentStart: -1
    };
    extra8425 = {};
    // Options matching.
    options9184 = options9184 || {};
    // Of course we collect tokens here.
    options9184.tokens = true;
    extra8425.tokens = [];
    extra8425.tokenize = true;
    // The following two fields are necessary to compute the Regex tokens.
    extra8425.openParenToken = -1;
    extra8425.openCurlyToken = -1;
    extra8425.range = typeof options9184.range === "boolean" && options9184.range;
    extra8425.loc = typeof options9184.loc === "boolean" && options9184.loc;
    if (typeof options9184.comment === "boolean" && options9184.comment) {
        extra8425.comments = [];
    }
    if (typeof options9184.tolerant === "boolean" && options9184.tolerant) {
        extra8425.errors = [];
    }
    if (length8417 > 0) {
        if (typeof source8408[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9183 instanceof String) {
                source8408 = code9183.valueOf();
            }
        }
    }
    patch8560();
    try {
        peek8457();
        if (lookahead8421.type === Token8399.EOF) {
            return extra8425.tokens;
        }
        token9186 = lex8456();
        while (lookahead8421.type !== Token8399.EOF) {
            try {
                token9186 = lex8456();
            } catch (lexError9188) {
                token9186 = lookahead8421;
                if (extra8425.errors) {
                    extra8425.errors.push(lexError9188);
                    // We have to break on the first error
                    // to avoid infinite loops.
                    break;
                } else {
                    throw lexError9188;
                }
            }
        }
        filterTokenLocation8559();
        tokens9187 = extra8425.tokens;
        if (typeof extra8425.comments !== "undefined") {
            tokens9187.comments = extra8425.comments;
        }
        if (typeof extra8425.errors !== "undefined") {
            tokens9187.errors = extra8425.errors;
        }
    } catch (e9189) {
        throw e9189;
    } finally {
        unpatch8561();
        extra8425 = {};
    }
    return tokens9187;
}
function blockAllowed8564(toks9190, start9191, inExprDelim9192, parentIsBlock9193) {
    var assignOps9194 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
    var binaryOps9195 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
    var unaryOps9196 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
    function back9197(n9198) {
        var idx9199 = toks9190.length - n9198 > 0 ? toks9190.length - n9198 : 0;
        return toks9190[idx9199];
    }
    if (inExprDelim9192 && toks9190.length - (start9191 + 2) <= 0) {
        // ... ({...} ...)
        return false;
    } else if (back9197(start9191 + 2).value === ":" && parentIsBlock9193) {
        // ...{a:{b:{...}}}
        return true;
    } else if (isIn8427(back9197(start9191 + 2).value, unaryOps9196.concat(binaryOps9195).concat(assignOps9194))) {
        // ... + {...}
        return false;
    } else if (back9197(start9191 + 2).value === "return") {
        var // ASI makes `{}` a block in:
        //
        //    return
        //    { ... }
        //
        // otherwise an object literal, so it's an
        // expression and thus / is divide
        currLineNumber9200 = typeof back9197(start9191 + 1).startLineNumber !== "undefined" ? back9197(start9191 + 1).startLineNumber : back9197(start9191 + 1).lineNumber;
        if (back9197(start9191 + 2).lineNumber !== currLineNumber9200) {
            return true;
        } else {
            return false;
        }
    } else if (isIn8427(back9197(start9191 + 2).value, ["void", "typeof", "in", "case", "delete"])) {
        // ... in {}
        return false;
    } else {
        return true;
    }
}
var // Readtables
readtables8565 = {
    currentReadtable: {},
    // A readtable is invoked within `readToken`, but it can
    // return multiple tokens. We need to "queue" the stream of
    // tokens so that subsequent calls to `readToken` gets the
    // rest of the stream.
    queued: [],
    // A readtable can only override punctuators
    punctuators: ";,.:!?~=%&*+-/<>^|#@",
    has: function has(ch9201) {
        return readtables8565.currentReadtable[ch9201] && readtables8565.punctuators.indexOf(ch9201) !== -1;
    },
    getQueued: function getQueued() {
        return readtables8565.queued.length ? readtables8565.queued.shift() : null;
    },
    peekQueued: function peekQueued(lookahead9202) {
        lookahead9202 = lookahead9202 ? lookahead9202 : 1;
        return readtables8565.queued.length ? readtables8565.queued[lookahead9202 - 1] : null;
    },
    invoke: function invoke(ch9203, toks9204) {
        var prevState9205 = snapshotParserState8566();
        var newStream9206 = readtables8565.currentReadtable[ch9203](ch9203, readtables8565.readerAPI, toks9204, source8408, index8410);
        if (!newStream9206) {
            // Reset the state
            restoreParserState8567(prevState9205);
            return null;
        } else if (!Array.isArray(newStream9206)) {
            newStream9206 = [newStream9206];
        }
        this.queued = this.queued.concat(newStream9206);
        return this.getQueued();
    }
};
function snapshotParserState8566() {
    return {
        index: index8410,
        lineNumber: lineNumber8411,
        lineStart: lineStart8412
    };
}
function restoreParserState8567(prevState9207) {
    index8410 = prevState9207.index;
    lineNumber8411 = prevState9207.lineNumber;
    lineStart8412 = prevState9207.lineStart;
}
function suppressReadError8568(func9208) {
    var prevState9209 = snapshotParserState8566();
    try {
        return func9208();
    } catch (e9210) {
        if (!(e9210 instanceof SyntaxError) && !(e9210 instanceof TypeError)) {
            restoreParserState8567(prevState9209);
            return null;
        }
        throw e9210;
    }
}
function makeIdentifier8569(value9211, opts9212) {
    opts9212 = opts9212 || {};
    var type9213 = Token8399.Identifier;
    if (isKeyword8438(value9211)) {
        type9213 = Token8399.Keyword;
    } else if (value9211 === "null") {
        type9213 = Token8399.NullLiteral;
    } else if (value9211 === "true" || value9211 === "false") {
        type9213 = Token8399.BooleanLiteral;
    }
    return {
        type: type9213,
        value: value9211,
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [opts9212.start || index8410, index8410]
    };
}
function makePunctuator8570(value9214, opts9215) {
    opts9215 = opts9215 || {};
    return {
        type: Token8399.Punctuator,
        value: value9214,
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [opts9215.start || index8410, index8410]
    };
}
function makeStringLiteral8571(value9216, opts9217) {
    opts9217 = opts9217 || {};
    return {
        type: Token8399.StringLiteral,
        value: value9216,
        octal: !!opts9217.octal,
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [opts9217.start || index8410, index8410]
    };
}
function makeNumericLiteral8572(value9218, opts9219) {
    opts9219 = opts9219 || {};
    return {
        type: Token8399.NumericLiteral,
        value: value9218,
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [opts9219.start || index8410, index8410]
    };
}
function makeRegExp8573(value9220, opts9221) {
    opts9221 = opts9221 || {};
    return {
        type: Token8399.RegularExpression,
        value: value9220,
        literal: value9220.toString(),
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [opts9221.start || index8410, index8410]
    };
}
function makeDelimiter8574(value9222, inner9223) {
    var current9224 = {
        lineNumber: lineNumber8411,
        lineStart: lineStart8412,
        range: [index8410, index8410]
    };
    var firstTok9225 = inner9223.length ? inner9223[0] : current9224;
    var lastTok9226 = inner9223.length ? inner9223[inner9223.length - 1] : current9224;
    return {
        type: Token8399.Delimiter,
        value: value9222,
        inner: inner9223,
        startLineNumber: firstTok9225.lineNumber,
        startLineStart: firstTok9225.lineStart,
        startRange: firstTok9225.range,
        endLineNumber: lastTok9226.lineNumber,
        endLineStart: lastTok9226.lineStart,
        endRange: lastTok9226.range
    };
}
var // Since an actual parser object doesn't exist and we want to
// introduce our own API anyway, we create a special reader object
// for reader extensions
readerAPI8575 = Object.defineProperties({
    Token: Token8399,
    isIdentifierStart: isIdentifierStart8433,
    isIdentifierPart: isIdentifierPart8434,
    isLineTerminator: isLineTerminator8432,
    readIdentifier: scanIdentifier8444,
    readPunctuator: scanPunctuator8445,
    readStringLiteral: scanStringLiteral8449,
    readNumericLiteral: scanNumericLiteral8448,
    readRegExp: scanRegExp8452,
    readToken: function readToken() {
        return readToken8576([], false, false);
    },
    readDelimiter: function readDelimiter() {
        return readDelim8577([], false, false);
    },
    skipComment: scanComment8556,
    makeIdentifier: makeIdentifier8569,
    makePunctuator: makePunctuator8570,
    makeStringLiteral: makeStringLiteral8571,
    makeNumericLiteral: makeNumericLiteral8572,
    makeRegExp: makeRegExp8573,
    makeDelimiter: makeDelimiter8574,
    suppressReadError: suppressReadError8568,
    peekQueued: readtables8565.peekQueued,
    getQueued: readtables8565.getQueued
}, {
    source: {
        get: function () {
            return source8408;
        },
        enumerable: true,
        configurable: true
    },
    index: {
        get: function () {
            return index8410;
        },
        set: function (x) {
            index8410 = x;
        },
        enumerable: true,
        configurable: true
    },
    length: {
        get: function () {
            return length8417;
        },
        set: function (x) {
            length8417 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineNumber: {
        get: function () {
            return lineNumber8411;
        },
        set: function (x) {
            lineNumber8411 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineStart: {
        get: function () {
            return lineStart8412;
        },
        set: function (x) {
            lineStart8412 = x;
        },
        enumerable: true,
        configurable: true
    },
    extra: {
        get: function () {
            return extra8425;
        },
        enumerable: true,
        configurable: true
    }
});
readtables8565.readerAPI = readerAPI8575;
function readToken8576(toks9227, inExprDelim9228, parentIsBlock9229) {
    var delimiters9230 = ["(", "{", "["];
    var parenIdents9231 = ["if", "while", "for", "with"];
    var last9232 = toks9227.length - 1;
    var comments9233,
        commentsLen9234 = extra8425.comments.length;
    function back9235(n9241) {
        var idx9242 = toks9227.length - n9241 > 0 ? toks9227.length - n9241 : 0;
        return toks9227[idx9242];
    }
    function attachComments9236(token9243) {
        if (comments9233) {
            token9243.leadingComments = comments9233;
        }
        return token9243;
    }
    function _advance9237() {
        return attachComments9236(advance8455());
    }
    function _scanRegExp9238() {
        return attachComments9236(scanRegExp8452());
    }
    skipComment8439();
    var ch9239 = source8408[index8410];
    if (extra8425.comments.length > commentsLen9234) {
        comments9233 = extra8425.comments.slice(commentsLen9234);
    }
    if (isIn8427(source8408[index8410], delimiters9230)) {
        return attachComments9236(readDelim8577(toks9227, inExprDelim9228, parentIsBlock9229));
    }
    // Check if we should get the token from the readtable
    var readtableToken9240;
    if ((readtableToken9240 = readtables8565.getQueued()) || readtables8565.has(ch9239) && (readtableToken9240 = readtables8565.invoke(ch9239, toks9227))) {
        return readtableToken9240;
    }
    if (ch9239 === "/") {
        var prev9244 = back9235(1);
        if (prev9244) {
            if (prev9244.value === "()") {
                if (isIn8427(back9235(2).value, parenIdents9231)) {
                    // ... if (...) / ...
                    return _scanRegExp9238();
                }
                // ... (...) / ...
                return _advance9237();
            }
            if (prev9244.value === "{}") {
                if (blockAllowed8564(toks9227, 0, inExprDelim9228, parentIsBlock9229)) {
                    if (back9235(2).value === "()") {
                        if ( // named function
                        back9235(4).value === "function") {
                            if (!blockAllowed8564(toks9227, 3, inExprDelim9228, parentIsBlock9229)) {
                                // new function foo (...) {...} / ...
                                return _advance9237();
                            }
                            if (toks9227.length - 5 <= 0 && inExprDelim9228) {
                                // (function foo (...) {...} /...)
                                // [function foo (...) {...} /...]
                                return _advance9237();
                            }
                        }
                        if ( // unnamed function
                        back9235(3).value === "function") {
                            if (!blockAllowed8564(toks9227, 2, inExprDelim9228, parentIsBlock9229)) {
                                // new function (...) {...} / ...
                                return _advance9237();
                            }
                            if (toks9227.length - 4 <= 0 && inExprDelim9228) {
                                // (function (...) {...} /...)
                                // [function (...) {...} /...]
                                return _advance9237();
                            }
                        }
                    }
                    // ...; {...} /...
                    return _scanRegExp9238();
                } else {
                    // ... + {...} / ...
                    return _advance9237();
                }
            }
            if (prev9244.type === Token8399.Punctuator) {
                // ... + /...
                return _scanRegExp9238();
            }
            if (isKeyword8438(prev9244.value) && prev9244.value !== "this" && prev9244.value !== "let" && prev9244.value !== "export") {
                // typeof /...
                return _scanRegExp9238();
            }
            return _advance9237();
        }
        return _scanRegExp9238();
    }
    return _advance9237();
}
function readDelim8577(toks9245, inExprDelim9246, parentIsBlock9247) {
    var startDelim9248 = advance8455(),
        matchDelim9249 = {
        "(": ")",
        "{": "}",
        "[": "]"
    },
        inner9250 = [];
    var delimiters9251 = ["(", "{", "["];
    assert8426(delimiters9251.indexOf(startDelim9248.value) !== -1, "Need to begin at the delimiter");
    var token9252 = startDelim9248;
    var startLineNumber9253 = token9252.lineNumber;
    var startLineStart9254 = token9252.lineStart;
    var startRange9255 = token9252.range;
    var delimToken9256 = {};
    delimToken9256.type = Token8399.Delimiter;
    delimToken9256.value = startDelim9248.value + matchDelim9249[startDelim9248.value];
    delimToken9256.startLineNumber = startLineNumber9253;
    delimToken9256.startLineStart = startLineStart9254;
    delimToken9256.startRange = startRange9255;
    var delimIsBlock9257 = false;
    if (startDelim9248.value === "{") {
        delimIsBlock9257 = blockAllowed8564(toks9245.concat(delimToken9256), 0, inExprDelim9246, parentIsBlock9247);
    }
    while (index8410 <= length8417) {
        token9252 = readToken8576(inner9250, startDelim9248.value === "(" || startDelim9248.value === "[", delimIsBlock9257);
        if (token9252.type === Token8399.Punctuator && token9252.value === matchDelim9249[startDelim9248.value]) {
            if (token9252.leadingComments) {
                delimToken9256.trailingComments = token9252.leadingComments;
            }
            break;
        } else if (token9252.type === Token8399.EOF) {
            throwError8463({}, Messages8404.UnexpectedEOS);
        } else {
            inner9250.push(token9252);
        }
    }
    if ( // at the end of the stream but the very last char wasn't the closing delimiter
    index8410 >= length8417 && matchDelim9249[startDelim9248.value] !== source8408[length8417 - 1]) {
        throwError8463({}, Messages8404.UnexpectedEOS);
    }
    var endLineNumber9258 = token9252.lineNumber;
    var endLineStart9259 = token9252.lineStart;
    var endRange9260 = token9252.range;
    delimToken9256.inner = inner9250;
    delimToken9256.endLineNumber = endLineNumber9258;
    delimToken9256.endLineStart = endLineStart9259;
    delimToken9256.endRange = endRange9260;
    return delimToken9256;
}
function setReadtable8578(readtable9261, syn9262) {
    readtables8565.currentReadtable = readtable9261;
    if (syn9262) {
        readtables8565.readerAPI.throwSyntaxError = function (name9263, message9264, tok9265) {
            var sx9266 = syn9262.syntaxFromToken(tok9265);
            var err9267 = new syn9262.MacroSyntaxError(name9263, message9264, sx9266);
            throw new SyntaxError(syn9262.printSyntaxError(source8408, err9267));
        };
    }
}
function currentReadtable8579() {
    return readtables8565.currentReadtable;
}
function read8580(code9268) {
    var token9269,
        tokenTree9270 = [];
    extra8425 = {};
    extra8425.comments = [];
    extra8425.range = true;
    extra8425.loc = true;
    patch8560();
    source8408 = code9268;
    index8410 = 0;
    lineNumber8411 = source8408.length > 0 ? 1 : 0;
    lineStart8412 = 0;
    length8417 = source8408.length;
    state8423 = {
        allowIn: true,
        labelSet: {},
        lastParenthesized: null,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false
    };
    while (index8410 < length8417 || readtables8565.peekQueued()) {
        tokenTree9270.push(readToken8576(tokenTree9270, false, false));
    }
    var last9271 = tokenTree9270[tokenTree9270.length - 1];
    if (last9271 && last9271.type !== Token8399.EOF) {
        tokenTree9270.push({
            type: Token8399.EOF,
            value: "",
            lineNumber: last9271.lineNumber,
            lineStart: last9271.lineStart,
            range: [index8410, index8410]
        });
    }
    return expander8398.tokensToSyntax(tokenTree9270);
}
function parse8581(code9272, options9273) {
    var program9274, toString9275;
    extra8425 = {};
    if ( // given an array of tokens instead of a string
    Array.isArray(code9272)) {
        tokenStream8419 = code9272;
        length8417 = tokenStream8419.length;
        lineNumber8411 = tokenStream8419.length > 0 ? 1 : 0;
        source8408 = undefined;
    } else {
        toString9275 = String;
        if (typeof code9272 !== "string" && !(code9272 instanceof String)) {
            code9272 = toString9275(code9272);
        }
        source8408 = code9272;
        length8417 = source8408.length;
        lineNumber8411 = source8408.length > 0 ? 1 : 0;
    }
    delegate8418 = SyntaxTreeDelegate8406;
    streamIndex8420 = -1;
    index8410 = 0;
    lineStart8412 = 0;
    sm_lineStart8414 = 0;
    sm_lineNumber8413 = lineNumber8411;
    sm_index8416 = 0;
    sm_range8415 = [0, 0];
    lookahead8421 = null;
    phase8424 = options9273 && typeof options9273.phase !== "undefined" ? options9273.phase : 0;
    state8423 = {
        allowKeyword: false,
        allowIn: true,
        labelSet: {},
        parenthesizedCount: 0,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        yieldAllowed: false
    };
    extra8425.attachComment = true;
    extra8425.range = true;
    extra8425.comments = [];
    extra8425.bottomRightStack = [];
    extra8425.trailingComments = [];
    extra8425.leadingComments = [];
    if (typeof options9273 !== "undefined") {
        extra8425.range = typeof options9273.range === "boolean" && options9273.range;
        extra8425.loc = typeof options9273.loc === "boolean" && options9273.loc;
        extra8425.attachComment = typeof options9273.attachComment === "boolean" && options9273.attachComment;
        if (extra8425.loc && options9273.source !== null && options9273.source !== undefined) {
            delegate8418 = extend8562(delegate8418, {
                postProcess: function (node9276) {
                    node9276.loc.source = toString9275(options9273.source);
                    return node9276;
                }
            });
        }
        if (typeof options9273.tokens === "boolean" && options9273.tokens) {
            extra8425.tokens = [];
        }
        if (typeof options9273.comment === "boolean" && options9273.comment) {
            extra8425.comments = [];
        }
        if (typeof options9273.tolerant === "boolean" && options9273.tolerant) {
            extra8425.errors = [];
        }
    }
    if (length8417 > 0) {
        if (source8408 && typeof source8408[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9272 instanceof String) {
                source8408 = code9272.valueOf();
            }
        }
    }
    extra8425.loc = true;
    extra8425.errors = [];
    patch8560();
    try {
        program9274 = parseProgram8554();
        if (typeof extra8425.comments !== "undefined") {
            program9274.comments = extra8425.comments;
        }
        if (typeof extra8425.tokens !== "undefined") {
            filterTokenLocation8559();
            program9274.tokens = extra8425.tokens;
        }
        if (typeof extra8425.errors !== "undefined") {
            program9274.errors = extra8425.errors;
        }
    } catch (e9277) {
        throw e9277;
    } finally {
        unpatch8561();
        extra8425 = {};
    }
    return program9274;
}
exports.tokenize = tokenize8563;
exports.read = read8580;
exports.Token = Token8399;
exports.setReadtable = setReadtable8578;
exports.currentReadtable = currentReadtable8579;
exports.parse = parse8581;
// Deep copy.
exports.Syntax = (function () {
    var name9278,
        types9279 = {};
    if (typeof Object.create === "function") {
        types9279 = Object.create(null);
    }
    for (name9278 in Syntax8402) {
        if (Syntax8402.hasOwnProperty(name9278)) {
            types9279[name9278] = Syntax8402[name9278];
        }
    }
    if (typeof Object.freeze === "function") {
        Object.freeze(types9279);
    }
    return types9279;
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