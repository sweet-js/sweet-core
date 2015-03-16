"use strict";

var expander8438 = require("./expander");
var Token8439, TokenName8440, FnExprTokens8441, Syntax8442, PropertyKind8443, Messages8444, Regex8445, SyntaxTreeDelegate8446, ClassPropertyType8447, source8448, strict8449, index8450, lineNumber8451, lineStart8452, sm_lineNumber8453, sm_lineStart8454, sm_range8455, sm_index8456, length8457, delegate8458, tokenStream8459, streamIndex8460, lookahead8461, lookaheadIndex8462, state8463, phase8464, extra8465;
Token8439 = {
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
TokenName8440 = {};
TokenName8440[Token8439.BooleanLiteral] = "Boolean";
TokenName8440[Token8439.EOF] = "<end>";
TokenName8440[Token8439.Identifier] = "Identifier";
TokenName8440[Token8439.Keyword] = "Keyword";
TokenName8440[Token8439.NullLiteral] = "Null";
TokenName8440[Token8439.NumericLiteral] = "Numeric";
TokenName8440[Token8439.Punctuator] = "Punctuator";
TokenName8440[Token8439.StringLiteral] = "String";
TokenName8440[Token8439.RegularExpression] = "RegularExpression";
TokenName8440[Token8439.Delimiter] = "Delimiter";
// A function following one of those tokens is an expression.
FnExprTokens8441 = ["(", "{", "[", "in", "typeof", "instanceof", "new", "return", "case", "delete", "throw", "void",
// assignment operators
"=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ",",
// binary/unary operators
"+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!=="];
Syntax8442 = {
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
PropertyKind8443 = {
    Data: 1,
    Get: 2,
    Set: 4
};
ClassPropertyType8447 = {
    "static": "static",
    prototype: "prototype"
};
// Error messages should be identical to V8.
Messages8444 = {
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
Regex8445 = {
    NonAsciiIdentifierStart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),
    NonAsciiIdentifierPart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")
};
function assert8466(condition8623, message8624) {
    if (!condition8623) {
        throw new Error("ASSERT: " + message8624);
    }
}
function isIn8467(el8625, list8626) {
    return list8626.indexOf(el8625) !== -1;
}
function isDecimalDigit8468(ch8627) {
    return ch8627 >= 48 && ch8627 <= 57;
}
function isHexDigit8469(ch8628) {
    return "0123456789abcdefABCDEF".indexOf(ch8628) >= 0;
}
function isOctalDigit8470(ch8629) {
    return "01234567".indexOf(ch8629) >= 0;
}
function isWhiteSpace8471(ch8630) {
    return ch8630 === 32 || // space
    ch8630 === 9 || // tab
    ch8630 === 11 || ch8630 === 12 || ch8630 === 160 || ch8630 >= 5760 && " ᠎             　﻿".indexOf(String.fromCharCode(ch8630)) > 0;
}
function isLineTerminator8472(ch8631) {
    return ch8631 === 10 || ch8631 === 13 || ch8631 === 8232 || ch8631 === 8233;
}
function isIdentifierStart8473(ch8632) {
    return ch8632 === 36 || ch8632 === 95 || // $ (dollar) and _ (underscore)
    ch8632 >= 65 && ch8632 <= 90 || // A..Z
    ch8632 >= 97 && ch8632 <= 122 || // a..z
    ch8632 === 92 || // \ (backslash)
    ch8632 >= 128 && Regex8445.NonAsciiIdentifierStart.test(String.fromCharCode(ch8632));
}
function isIdentifierPart8474(ch8633) {
    return ch8633 === 36 || ch8633 === 95 || // $ (dollar) and _ (underscore)
    ch8633 >= 65 && ch8633 <= 90 || // A..Z
    ch8633 >= 97 && ch8633 <= 122 || // a..z
    ch8633 >= 48 && ch8633 <= 57 || // 0..9
    ch8633 === 92 || // \ (backslash)
    ch8633 >= 128 && Regex8445.NonAsciiIdentifierPart.test(String.fromCharCode(ch8633));
}
function isFutureReservedWord8475(id8634) {
    switch (id8634) {
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
function isStrictModeReservedWord8476(id8635) {
    switch (id8635) {
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
function isRestrictedWord8477(id8636) {
    return id8636 === "eval" || id8636 === "arguments";
}
function isKeyword8478(id8637) {
    if (strict8449 && isStrictModeReservedWord8476(id8637)) {
        return true;
    }
    switch ( // 'const' is specialized as Keyword in V8.
    // 'yield' is only treated as a keyword in strict mode.
    // 'let' is for compatiblity with SpiderMonkey and ES.next.
    // Some others are from future reserved words.
    id8637.length) {
        case 2:
            return id8637 === "if" || id8637 === "in" || id8637 === "do";
        case 3:
            return id8637 === "var" || id8637 === "for" || id8637 === "new" || id8637 === "try" || id8637 === "let";
        case 4:
            return id8637 === "this" || id8637 === "else" || id8637 === "case" || id8637 === "void" || id8637 === "with" || id8637 === "enum";
        case 5:
            return id8637 === "while" || id8637 === "break" || id8637 === "catch" || id8637 === "throw" || id8637 === "const" || id8637 === "class" || id8637 === "super";
        case 6:
            return id8637 === "return" || id8637 === "typeof" || id8637 === "delete" || id8637 === "switch" || id8637 === "export" || id8637 === "import";
        case 7:
            return id8637 === "default" || id8637 === "finally" || id8637 === "extends";
        case 8:
            return id8637 === "function" || id8637 === "continue" || id8637 === "debugger";
        case 10:
            return id8637 === "instanceof";
        default:
            return false;
    }
}
function skipComment8479() {
    var ch8638, blockComment8639, lineComment8640;
    blockComment8639 = false;
    lineComment8640 = false;
    while (index8450 < length8457) {
        ch8638 = source8448.charCodeAt(index8450);
        if (lineComment8640) {
            ++index8450;
            if (isLineTerminator8472(ch8638)) {
                lineComment8640 = false;
                if (ch8638 === 13 && source8448.charCodeAt(index8450) === 10) {
                    ++index8450;
                }
                ++lineNumber8451;
                lineStart8452 = index8450;
            }
        } else if (blockComment8639) {
            if (isLineTerminator8472(ch8638)) {
                if (ch8638 === 13 && source8448.charCodeAt(index8450 + 1) === 10) {
                    ++index8450;
                }
                ++lineNumber8451;
                ++index8450;
                lineStart8452 = index8450;
                if (index8450 >= length8457) {
                    throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch8638 = source8448.charCodeAt(index8450++);
                if (index8450 >= length8457) {
                    throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
                }
                if ( // Block comment ends with '*/' (char #42, char #47).
                ch8638 === 42) {
                    ch8638 = source8448.charCodeAt(index8450);
                    if (ch8638 === 47) {
                        ++index8450;
                        blockComment8639 = false;
                    }
                }
            }
        } else if (ch8638 === 47) {
            ch8638 = source8448.charCodeAt(index8450 + 1);
            if ( // Line comment starts with '//' (char #47, char #47).
            ch8638 === 47) {
                index8450 += 2;
                lineComment8640 = true;
            } else if (ch8638 === 42) {
                // Block comment starts with '/*' (char #47, char #42).
                index8450 += 2;
                blockComment8639 = true;
                if (index8450 >= length8457) {
                    throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8471(ch8638)) {
            ++index8450;
        } else if (isLineTerminator8472(ch8638)) {
            ++index8450;
            if (ch8638 === 13 && source8448.charCodeAt(index8450) === 10) {
                ++index8450;
            }
            ++lineNumber8451;
            lineStart8452 = index8450;
        } else {
            break;
        }
    }
}
function scanHexEscape8480(prefix8641) {
    var i8642,
        len8643,
        ch8644,
        code8645 = 0;
    len8643 = prefix8641 === "u" ? 4 : 2;
    for (i8642 = 0; i8642 < len8643; ++i8642) {
        if (index8450 < length8457 && isHexDigit8469(source8448[index8450])) {
            ch8644 = source8448[index8450++];
            code8645 = code8645 * 16 + "0123456789abcdef".indexOf(ch8644.toLowerCase());
        } else {
            return "";
        }
    }
    return String.fromCharCode(code8645);
}
function scanUnicodeCodePointEscape8481() {
    var ch8646, code8647, cu18648, cu28649;
    ch8646 = source8448[index8450];
    code8647 = 0;
    if ( // At least, one hex digit is required.
    ch8646 === "}") {
        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
    }
    while (index8450 < length8457) {
        ch8646 = source8448[index8450++];
        if (!isHexDigit8469(ch8646)) {
            break;
        }
        code8647 = code8647 * 16 + "0123456789abcdef".indexOf(ch8646.toLowerCase());
    }
    if (code8647 > 1114111 || ch8646 !== "}") {
        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
    }
    if ( // UTF-16 Encoding
    code8647 <= 65535) {
        return String.fromCharCode(code8647);
    }
    cu18648 = (code8647 - 65536 >> 10) + 55296;
    cu28649 = (code8647 - 65536 & 1023) + 56320;
    return String.fromCharCode(cu18648, cu28649);
}
function getEscapedIdentifier8482() {
    var ch8650, id8651;
    ch8650 = source8448.charCodeAt(index8450++);
    id8651 = String.fromCharCode(ch8650);
    if ( // '\u' (char #92, char #117) denotes an escaped character.
    ch8650 === 92) {
        if (source8448.charCodeAt(index8450) !== 117) {
            throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
        }
        ++index8450;
        ch8650 = scanHexEscape8480("u");
        if (!ch8650 || ch8650 === "\\" || !isIdentifierStart8473(ch8650.charCodeAt(0))) {
            throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
        }
        id8651 = ch8650;
    }
    while (index8450 < length8457) {
        ch8650 = source8448.charCodeAt(index8450);
        if (!isIdentifierPart8474(ch8650)) {
            break;
        }
        ++index8450;
        id8651 += String.fromCharCode(ch8650);
        if ( // '\u' (char #92, char #117) denotes an escaped character.
        ch8650 === 92) {
            id8651 = id8651.substr(0, id8651.length - 1);
            if (source8448.charCodeAt(index8450) !== 117) {
                throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
            }
            ++index8450;
            ch8650 = scanHexEscape8480("u");
            if (!ch8650 || ch8650 === "\\" || !isIdentifierPart8474(ch8650.charCodeAt(0))) {
                throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
            }
            id8651 += ch8650;
        }
    }
    return id8651;
}
function getIdentifier8483() {
    var start8652, ch8653;
    start8652 = index8450++;
    while (index8450 < length8457) {
        ch8653 = source8448.charCodeAt(index8450);
        if (ch8653 === 92) {
            // Blackslash (char #92) marks Unicode escape sequence.
            index8450 = start8652;
            return getEscapedIdentifier8482();
        }
        if (isIdentifierPart8474(ch8653)) {
            ++index8450;
        } else {
            break;
        }
    }
    return source8448.slice(start8652, index8450);
}
function scanIdentifier8484() {
    var start8654, id8655, type8656;
    start8654 = index8450;
    // Backslash (char #92) starts an escaped character.
    id8655 = source8448.charCodeAt(index8450) === 92 ? getEscapedIdentifier8482() : getIdentifier8483();
    if ( // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    id8655.length === 1) {
        type8656 = Token8439.Identifier;
    } else if (isKeyword8478(id8655)) {
        type8656 = Token8439.Keyword;
    } else if (id8655 === "null") {
        type8656 = Token8439.NullLiteral;
    } else if (id8655 === "true" || id8655 === "false") {
        type8656 = Token8439.BooleanLiteral;
    } else {
        type8656 = Token8439.Identifier;
    }
    return {
        type: type8656,
        value: id8655,
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [start8654, index8450]
    };
}
function scanPunctuator8485() {
    var start8657 = index8450,
        code8658 = source8448.charCodeAt(index8450),
        code28659,
        ch18660 = source8448[index8450],
        ch28661,
        ch38662,
        ch48663;
    switch (code8658) {
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
            ++index8450;
            if (extra8465.tokenize) {
                if (code8658 === 40) {
                    extra8465.openParenToken = extra8465.tokens.length;
                } else if (code8658 === 123) {
                    extra8465.openCurlyToken = extra8465.tokens.length;
                }
            }
            return {
                type: Token8439.Punctuator,
                value: String.fromCharCode(code8658),
                lineNumber: lineNumber8451,
                lineStart: lineStart8452,
                range: [start8657, index8450]
            };
        default:
            code28659 = source8448.charCodeAt(index8450 + 1);
            if ( // '=' (char #61) marks an assignment or comparison operator.
            code28659 === 61) {
                switch (code8658) {
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
                        index8450 += 2;
                        return {
                            type: Token8439.Punctuator,
                            value: String.fromCharCode(code8658) + String.fromCharCode(code28659),
                            lineNumber: lineNumber8451,
                            lineStart: lineStart8452,
                            range: [start8657, index8450]
                        };
                    case 33:
                    case // !
                    61:
                        // =
                        index8450 += 2;
                        if ( // !== and ===
                        source8448.charCodeAt(index8450) === 61) {
                            ++index8450;
                        }
                        return {
                            type: Token8439.Punctuator,
                            value: source8448.slice(start8657, index8450),
                            lineNumber: lineNumber8451,
                            lineStart: lineStart8452,
                            range: [start8657, index8450]
                        };
                    default:
                        break;
                }
            }
            break;
    }
    // Peek more characters.
    ch28661 = source8448[index8450 + 1];
    ch38662 = source8448[index8450 + 2];
    ch48663 = source8448[index8450 + 3];
    if ( // 4-character punctuator: >>>=
    ch18660 === ">" && ch28661 === ">" && ch38662 === ">") {
        if (ch48663 === "=") {
            index8450 += 4;
            return {
                type: Token8439.Punctuator,
                value: ">>>=",
                lineNumber: lineNumber8451,
                lineStart: lineStart8452,
                range: [start8657, index8450]
            };
        }
    }
    if ( // 3-character punctuators: === !== >>> <<= >>=
    ch18660 === ">" && ch28661 === ">" && ch38662 === ">") {
        index8450 += 3;
        return {
            type: Token8439.Punctuator,
            value: ">>>",
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [start8657, index8450]
        };
    }
    if (ch18660 === "<" && ch28661 === "<" && ch38662 === "=") {
        index8450 += 3;
        return {
            type: Token8439.Punctuator,
            value: "<<=",
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [start8657, index8450]
        };
    }
    if (ch18660 === ">" && ch28661 === ">" && ch38662 === "=") {
        index8450 += 3;
        return {
            type: Token8439.Punctuator,
            value: ">>=",
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [start8657, index8450]
        };
    }
    if (ch18660 === "." && ch28661 === "." && ch38662 === ".") {
        index8450 += 3;
        return {
            type: Token8439.Punctuator,
            value: "...",
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [start8657, index8450]
        };
    }
    if ( // Other 2-character punctuators: ++ -- << >> && ||
    ch18660 === ch28661 && "+-<>&|".indexOf(ch18660) >= 0) {
        index8450 += 2;
        return {
            type: Token8439.Punctuator,
            value: ch18660 + ch28661,
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [start8657, index8450]
        };
    }
    if (ch18660 === "=" && ch28661 === ">") {
        index8450 += 2;
        return {
            type: Token8439.Punctuator,
            value: "=>",
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [start8657, index8450]
        };
    }
    if ("<>=!+-*%&|^/".indexOf(ch18660) >= 0) {
        ++index8450;
        return {
            type: Token8439.Punctuator,
            value: ch18660,
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [start8657, index8450]
        };
    }
    if (ch18660 === ".") {
        ++index8450;
        return {
            type: Token8439.Punctuator,
            value: ch18660,
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [start8657, index8450]
        };
    }
    throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
}
function scanHexLiteral8486(start8664) {
    var number8665 = "";
    while (index8450 < length8457) {
        if (!isHexDigit8469(source8448[index8450])) {
            break;
        }
        number8665 += source8448[index8450++];
    }
    if (number8665.length === 0) {
        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8473(source8448.charCodeAt(index8450))) {
        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8439.NumericLiteral,
        value: parseInt("0x" + number8665, 16),
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [start8664, index8450]
    };
}
function scanOctalLiteral8487(prefix8666, start8667) {
    var number8668, octal8669;
    if (isOctalDigit8470(prefix8666)) {
        octal8669 = true;
        number8668 = "0" + source8448[index8450++];
    } else {
        octal8669 = false;
        ++index8450;
        number8668 = "";
    }
    while (index8450 < length8457) {
        if (!isOctalDigit8470(source8448[index8450])) {
            break;
        }
        number8668 += source8448[index8450++];
    }
    if (!octal8669 && number8668.length === 0) {
        // only 0o or 0O
        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8473(source8448.charCodeAt(index8450)) || isDecimalDigit8468(source8448.charCodeAt(index8450))) {
        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8439.NumericLiteral,
        value: parseInt(number8668, 8),
        octal: octal8669,
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [start8667, index8450]
    };
}
function scanNumericLiteral8488() {
    var number8670, start8671, ch8672, octal8673;
    ch8672 = source8448[index8450];
    assert8466(isDecimalDigit8468(ch8672.charCodeAt(0)) || ch8672 === ".", "Numeric literal must start with a decimal digit or a decimal point");
    start8671 = index8450;
    number8670 = "";
    if (ch8672 !== ".") {
        number8670 = source8448[index8450++];
        ch8672 = source8448[index8450];
        if ( // Hex number starts with '0x'.
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        // Binary number in ES6 starts with '0b'.
        number8670 === "0") {
            if (ch8672 === "x" || ch8672 === "X") {
                ++index8450;
                return scanHexLiteral8486(start8671);
            }
            if (ch8672 === "b" || ch8672 === "B") {
                ++index8450;
                number8670 = "";
                while (index8450 < length8457) {
                    ch8672 = source8448[index8450];
                    if (ch8672 !== "0" && ch8672 !== "1") {
                        break;
                    }
                    number8670 += source8448[index8450++];
                }
                if (number8670.length === 0) {
                    // only 0b or 0B
                    throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
                }
                if (index8450 < length8457) {
                    ch8672 = source8448.charCodeAt(index8450);
                    if (isIdentifierStart8473(ch8672) || isDecimalDigit8468(ch8672)) {
                        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
                    }
                }
                return {
                    type: Token8439.NumericLiteral,
                    value: parseInt(number8670, 2),
                    lineNumber: lineNumber8451,
                    lineStart: lineStart8452,
                    range: [start8671, index8450]
                };
            }
            if (ch8672 === "o" || ch8672 === "O" || isOctalDigit8470(ch8672)) {
                return scanOctalLiteral8487(ch8672, start8671);
            }
            if ( // decimal number starts with '0' such as '09' is illegal.
            ch8672 && isDecimalDigit8468(ch8672.charCodeAt(0))) {
                throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
            }
        }
        while (isDecimalDigit8468(source8448.charCodeAt(index8450))) {
            number8670 += source8448[index8450++];
        }
        ch8672 = source8448[index8450];
    }
    if (ch8672 === ".") {
        number8670 += source8448[index8450++];
        while (isDecimalDigit8468(source8448.charCodeAt(index8450))) {
            number8670 += source8448[index8450++];
        }
        ch8672 = source8448[index8450];
    }
    if (ch8672 === "e" || ch8672 === "E") {
        number8670 += source8448[index8450++];
        ch8672 = source8448[index8450];
        if (ch8672 === "+" || ch8672 === "-") {
            number8670 += source8448[index8450++];
        }
        if (isDecimalDigit8468(source8448.charCodeAt(index8450))) {
            while (isDecimalDigit8468(source8448.charCodeAt(index8450))) {
                number8670 += source8448[index8450++];
            }
        } else {
            throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
        }
    }
    if (isIdentifierStart8473(source8448.charCodeAt(index8450))) {
        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8439.NumericLiteral,
        value: parseFloat(number8670),
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [start8671, index8450]
    };
}
function scanStringLiteral8489() {
    var str8674 = "",
        quote8675,
        start8676,
        ch8677,
        code8678,
        unescaped8679,
        restore8680,
        octal8681 = false;
    quote8675 = source8448[index8450];
    assert8466(quote8675 === "'" || quote8675 === "\"", "String literal must starts with a quote");
    start8676 = index8450;
    ++index8450;
    while (index8450 < length8457) {
        ch8677 = source8448[index8450++];
        if (ch8677 === quote8675) {
            quote8675 = "";
            break;
        } else if (ch8677 === "\\") {
            ch8677 = source8448[index8450++];
            if (!ch8677 || !isLineTerminator8472(ch8677.charCodeAt(0))) {
                switch (ch8677) {
                    case "n":
                        str8674 += "\n";
                        break;
                    case "r":
                        str8674 += "\r";
                        break;
                    case "t":
                        str8674 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8448[index8450] === "{") {
                            ++index8450;
                            str8674 += scanUnicodeCodePointEscape8481();
                        } else {
                            restore8680 = index8450;
                            unescaped8679 = scanHexEscape8480(ch8677);
                            if (unescaped8679) {
                                str8674 += unescaped8679;
                            } else {
                                index8450 = restore8680;
                                str8674 += ch8677;
                            }
                        }
                        break;
                    case "b":
                        str8674 += "\b";
                        break;
                    case "f":
                        str8674 += "\f";
                        break;
                    case "v":
                        str8674 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8470(ch8677)) {
                            code8678 = "01234567".indexOf(ch8677);
                            if ( // \0 is not octal escape sequence
                            code8678 !== 0) {
                                octal8681 = true;
                            }
                            if (index8450 < length8457 && isOctalDigit8470(source8448[index8450])) {
                                octal8681 = true;
                                code8678 = code8678 * 8 + "01234567".indexOf(source8448[index8450++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8677) >= 0 && index8450 < length8457 && isOctalDigit8470(source8448[index8450])) {
                                    code8678 = code8678 * 8 + "01234567".indexOf(source8448[index8450++]);
                                }
                            }
                            str8674 += String.fromCharCode(code8678);
                        } else {
                            str8674 += ch8677;
                        }
                        break;
                }
            } else {
                ++lineNumber8451;
                if (ch8677 === "\r" && source8448[index8450] === "\n") {
                    ++index8450;
                }
                lineStart8452 = index8450;
            }
        } else if (isLineTerminator8472(ch8677.charCodeAt(0))) {
            break;
        } else {
            str8674 += ch8677;
        }
    }
    if (quote8675 !== "") {
        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8439.StringLiteral,
        value: str8674,
        octal: octal8681,
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [start8676, index8450]
    };
}
function scanTemplate8490() {
    var cooked8682 = "",
        ch8683,
        start8684,
        terminated8685,
        tail8686,
        restore8687,
        unescaped8688,
        code8689,
        octal8690;
    terminated8685 = false;
    tail8686 = false;
    start8684 = index8450;
    ++index8450;
    while (index8450 < length8457) {
        ch8683 = source8448[index8450++];
        if (ch8683 === "`") {
            tail8686 = true;
            terminated8685 = true;
            break;
        } else if (ch8683 === "$") {
            if (source8448[index8450] === "{") {
                ++index8450;
                terminated8685 = true;
                break;
            }
            cooked8682 += ch8683;
        } else if (ch8683 === "\\") {
            ch8683 = source8448[index8450++];
            if (!isLineTerminator8472(ch8683.charCodeAt(0))) {
                switch (ch8683) {
                    case "n":
                        cooked8682 += "\n";
                        break;
                    case "r":
                        cooked8682 += "\r";
                        break;
                    case "t":
                        cooked8682 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8448[index8450] === "{") {
                            ++index8450;
                            cooked8682 += scanUnicodeCodePointEscape8481();
                        } else {
                            restore8687 = index8450;
                            unescaped8688 = scanHexEscape8480(ch8683);
                            if (unescaped8688) {
                                cooked8682 += unescaped8688;
                            } else {
                                index8450 = restore8687;
                                cooked8682 += ch8683;
                            }
                        }
                        break;
                    case "b":
                        cooked8682 += "\b";
                        break;
                    case "f":
                        cooked8682 += "\f";
                        break;
                    case "v":
                        cooked8682 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8470(ch8683)) {
                            code8689 = "01234567".indexOf(ch8683);
                            if ( // \0 is not octal escape sequence
                            code8689 !== 0) {
                                octal8690 = true;
                            }
                            if (index8450 < length8457 && isOctalDigit8470(source8448[index8450])) {
                                octal8690 = true;
                                code8689 = code8689 * 8 + "01234567".indexOf(source8448[index8450++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8683) >= 0 && index8450 < length8457 && isOctalDigit8470(source8448[index8450])) {
                                    code8689 = code8689 * 8 + "01234567".indexOf(source8448[index8450++]);
                                }
                            }
                            cooked8682 += String.fromCharCode(code8689);
                        } else {
                            cooked8682 += ch8683;
                        }
                        break;
                }
            } else {
                ++lineNumber8451;
                if (ch8683 === "\r" && source8448[index8450] === "\n") {
                    ++index8450;
                }
                lineStart8452 = index8450;
            }
        } else if (isLineTerminator8472(ch8683.charCodeAt(0))) {
            ++lineNumber8451;
            if (ch8683 === "\r" && source8448[index8450] === "\n") {
                ++index8450;
            }
            lineStart8452 = index8450;
            cooked8682 += "\n";
        } else {
            cooked8682 += ch8683;
        }
    }
    if (!terminated8685) {
        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8439.Template,
        value: {
            cooked: cooked8682,
            raw: source8448.slice(start8684 + 1, index8450 - (tail8686 ? 1 : 2))
        },
        tail: tail8686,
        octal: octal8690,
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [start8684, index8450]
    };
}
function scanTemplateElement8491(option8691) {
    var startsWith8692, template8693;
    lookahead8461 = null;
    skipComment8479();
    startsWith8692 = option8691.head ? "`" : "}";
    if (source8448[index8450] !== startsWith8692) {
        throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
    }
    template8693 = scanTemplate8490();
    peek8497();
    return template8693;
}
function scanRegExp8492() {
    var str8694,
        ch8695,
        start8696,
        pattern8697,
        flags8698,
        value8699,
        classMarker8700 = false,
        restore8701,
        terminated8702 = false;
    lookahead8461 = null;
    skipComment8479();
    start8696 = index8450;
    ch8695 = source8448[index8450];
    assert8466(ch8695 === "/", "Regular expression literal must start with a slash");
    str8694 = source8448[index8450++];
    while (index8450 < length8457) {
        ch8695 = source8448[index8450++];
        str8694 += ch8695;
        if (classMarker8700) {
            if (ch8695 === "]") {
                classMarker8700 = false;
            }
        } else {
            if (ch8695 === "\\") {
                ch8695 = source8448[index8450++];
                if ( // ECMA-262 7.8.5
                isLineTerminator8472(ch8695.charCodeAt(0))) {
                    throwError8503({}, Messages8444.UnterminatedRegExp);
                }
                str8694 += ch8695;
            } else if (ch8695 === "/") {
                terminated8702 = true;
                break;
            } else if (ch8695 === "[") {
                classMarker8700 = true;
            } else if (isLineTerminator8472(ch8695.charCodeAt(0))) {
                throwError8503({}, Messages8444.UnterminatedRegExp);
            }
        }
    }
    if (!terminated8702) {
        throwError8503({}, Messages8444.UnterminatedRegExp);
    }
    // Exclude leading and trailing slash.
    pattern8697 = str8694.substr(1, str8694.length - 2);
    flags8698 = "";
    while (index8450 < length8457) {
        ch8695 = source8448[index8450];
        if (!isIdentifierPart8474(ch8695.charCodeAt(0))) {
            break;
        }
        ++index8450;
        if (ch8695 === "\\" && index8450 < length8457) {
            ch8695 = source8448[index8450];
            if (ch8695 === "u") {
                ++index8450;
                restore8701 = index8450;
                ch8695 = scanHexEscape8480("u");
                if (ch8695) {
                    flags8698 += ch8695;
                    for (str8694 += "\\u"; restore8701 < index8450; ++restore8701) {
                        str8694 += source8448[restore8701];
                    }
                } else {
                    index8450 = restore8701;
                    flags8698 += "u";
                    str8694 += "\\u";
                }
            } else {
                str8694 += "\\";
            }
        } else {
            flags8698 += ch8695;
            str8694 += ch8695;
        }
    }
    try {
        value8699 = new RegExp(pattern8697, flags8698);
    } catch (e8703) {
        throwError8503({}, Messages8444.InvalidRegExp);
    }
    if ( // peek();
    extra8465.tokenize) {
        return {
            type: Token8439.RegularExpression,
            value: value8699,
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [start8696, index8450]
        };
    }
    return {
        type: Token8439.RegularExpression,
        literal: str8694,
        value: value8699,
        range: [start8696, index8450]
    };
}
function isIdentifierName8493(token8704) {
    return token8704.type === Token8439.Identifier || token8704.type === Token8439.Keyword || token8704.type === Token8439.BooleanLiteral || token8704.type === Token8439.NullLiteral;
}
function advanceSlash8494() {
    var prevToken8705, checkToken8706;
    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design
    prevToken8705 = extra8465.tokens[extra8465.tokens.length - 1];
    if (!prevToken8705) {
        // Nothing before that: it cannot be a division.
        return scanRegExp8492();
    }
    if (prevToken8705.type === "Punctuator") {
        if (prevToken8705.value === ")") {
            checkToken8706 = extra8465.tokens[extra8465.openParenToken - 1];
            if (checkToken8706 && checkToken8706.type === "Keyword" && (checkToken8706.value === "if" || checkToken8706.value === "while" || checkToken8706.value === "for" || checkToken8706.value === "with")) {
                return scanRegExp8492();
            }
            return scanPunctuator8485();
        }
        if (prevToken8705.value === "}") {
            if ( // Dividing a function by anything makes little sense,
            // but we have to check for that.
            extra8465.tokens[extra8465.openCurlyToken - 3] && extra8465.tokens[extra8465.openCurlyToken - 3].type === "Keyword") {
                // Anonymous function.
                checkToken8706 = extra8465.tokens[extra8465.openCurlyToken - 4];
                if (!checkToken8706) {
                    return scanPunctuator8485();
                }
            } else if (extra8465.tokens[extra8465.openCurlyToken - 4] && extra8465.tokens[extra8465.openCurlyToken - 4].type === "Keyword") {
                // Named function.
                checkToken8706 = extra8465.tokens[extra8465.openCurlyToken - 5];
                if (!checkToken8706) {
                    return scanRegExp8492();
                }
            } else {
                return scanPunctuator8485();
            }
            if ( // checkToken determines whether the function is
            // a declaration or an expression.
            FnExprTokens8441.indexOf(checkToken8706.value) >= 0) {
                // It is an expression.
                return scanPunctuator8485();
            }
            // It is a declaration.
            return scanRegExp8492();
        }
        return scanRegExp8492();
    }
    if (prevToken8705.type === "Keyword") {
        return scanRegExp8492();
    }
    return scanPunctuator8485();
}
function advance8495() {
    var ch8707;
    skipComment8479();
    if (index8450 >= length8457) {
        return {
            type: Token8439.EOF,
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [index8450, index8450]
        };
    }
    ch8707 = source8448.charCodeAt(index8450);
    if ( // Very common: ( and ) and ;
    ch8707 === 40 || ch8707 === 41 || ch8707 === 58) {
        return scanPunctuator8485();
    }
    if ( // String literal starts with single quote (#39) or double quote (#34).
    ch8707 === 39 || ch8707 === 34) {
        return scanStringLiteral8489();
    }
    if (ch8707 === 96) {
        return scanTemplate8490();
    }
    if (isIdentifierStart8473(ch8707)) {
        return scanIdentifier8484();
    }
    if ( // # and @ are allowed for sweet.js
    ch8707 === 35 || ch8707 === 64) {
        ++index8450;
        return {
            type: Token8439.Punctuator,
            value: String.fromCharCode(ch8707),
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [index8450 - 1, index8450]
        };
    }
    if ( // Dot (.) char #46 can also start a floating-point number, hence the need
    // to check the next character.
    ch8707 === 46) {
        if (isDecimalDigit8468(source8448.charCodeAt(index8450 + 1))) {
            return scanNumericLiteral8488();
        }
        return scanPunctuator8485();
    }
    if (isDecimalDigit8468(ch8707)) {
        return scanNumericLiteral8488();
    }
    if ( // Slash (/) char #47 can also start a regex.
    extra8465.tokenize && ch8707 === 47) {
        return advanceSlash8494();
    }
    return scanPunctuator8485();
}
function lex8496() {
    var token8708;
    token8708 = lookahead8461;
    streamIndex8460 = lookaheadIndex8462;
    lineNumber8451 = token8708.lineNumber;
    lineStart8452 = token8708.lineStart;
    sm_lineNumber8453 = lookahead8461.sm_lineNumber;
    sm_lineStart8454 = lookahead8461.sm_lineStart;
    sm_range8455 = lookahead8461.sm_range;
    sm_index8456 = lookahead8461.sm_range[0];
    lookahead8461 = tokenStream8459[++streamIndex8460].token;
    lookaheadIndex8462 = streamIndex8460;
    index8450 = lookahead8461.range[0];
    if (token8708.leadingComments) {
        extra8465.comments = extra8465.comments.concat(token8708.leadingComments);
        extra8465.trailingComments = extra8465.trailingComments.concat(token8708.leadingComments);
        extra8465.leadingComments = extra8465.leadingComments.concat(token8708.leadingComments);
    }
    return token8708;
}
function peek8497() {
    lookaheadIndex8462 = streamIndex8460 + 1;
    if (lookaheadIndex8462 >= length8457) {
        lookahead8461 = {
            type: Token8439.EOF,
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [index8450, index8450]
        };
        return;
    }
    lookahead8461 = tokenStream8459[lookaheadIndex8462].token;
    index8450 = lookahead8461.range[0];
}
function lookahead28498() {
    var adv8709, pos8710, line8711, start8712, result8713;
    if (streamIndex8460 + 1 >= length8457 || streamIndex8460 + 2 >= length8457) {
        return {
            type: Token8439.EOF,
            lineNumber: lineNumber8451,
            lineStart: lineStart8452,
            range: [index8450, index8450]
        };
    }
    if ( // Scan for the next immediate token.
    lookahead8461 === null) {
        lookaheadIndex8462 = streamIndex8460 + 1;
        lookahead8461 = tokenStream8459[lookaheadIndex8462].token;
        index8450 = lookahead8461.range[0];
    }
    result8713 = tokenStream8459[lookaheadIndex8462 + 1].token;
    return result8713;
}
function markerCreate8499() {
    var sm_index8714 = lookahead8461 ? lookahead8461.sm_range[0] : 0;
    var sm_lineStart8715 = lookahead8461 ? lookahead8461.sm_lineStart : 0;
    var sm_lineNumber8716 = lookahead8461 ? lookahead8461.sm_lineNumber : 1;
    if (!extra8465.loc && !extra8465.range) {
        return undefined;
    }
    return {
        offset: sm_index8714,
        line: sm_lineNumber8716,
        col: sm_index8714 - sm_lineStart8715
    };
}
function processComment8500(node8717) {
    var lastChild8718,
        trailingComments8719,
        bottomRight8720 = extra8465.bottomRightStack,
        last8721 = bottomRight8720[bottomRight8720.length - 1];
    if (node8717.type === Syntax8442.Program) {
        if (node8717.body.length > 0) {
            return;
        }
    }
    if (extra8465.trailingComments.length > 0) {
        if (extra8465.trailingComments[0].range[0] >= node8717.range[1]) {
            trailingComments8719 = extra8465.trailingComments;
            extra8465.trailingComments = [];
        } else {
            extra8465.trailingComments.length = 0;
        }
    } else {
        if (last8721 && last8721.trailingComments && last8721.trailingComments[0].range[0] >= node8717.range[1]) {
            trailingComments8719 = last8721.trailingComments;
            delete last8721.trailingComments;
        }
    }
    if ( // Eating the stack.
    last8721) {
        while (last8721 && last8721.range[0] >= node8717.range[0]) {
            lastChild8718 = last8721;
            last8721 = bottomRight8720.pop();
        }
    }
    if (lastChild8718) {
        if (lastChild8718.leadingComments && lastChild8718.leadingComments[lastChild8718.leadingComments.length - 1].range[1] <= node8717.range[0]) {
            node8717.leadingComments = lastChild8718.leadingComments;
            delete lastChild8718.leadingComments;
        }
    } else if (extra8465.leadingComments.length > 0 && extra8465.leadingComments[extra8465.leadingComments.length - 1].range[1] <= node8717.range[0]) {
        node8717.leadingComments = extra8465.leadingComments;
        extra8465.leadingComments = [];
    }
    if (trailingComments8719) {
        node8717.trailingComments = trailingComments8719;
    }
    bottomRight8720.push(node8717);
}
function markerApply8501(marker8722, node8723) {
    if (extra8465.range) {
        node8723.range = [marker8722.offset, sm_index8456];
    }
    if (extra8465.loc) {
        node8723.loc = {
            start: {
                line: marker8722.line,
                column: marker8722.col
            },
            end: {
                line: sm_lineNumber8453,
                column: sm_index8456 - sm_lineStart8454
            }
        };
        node8723 = delegate8458.postProcess(node8723);
    }
    if (extra8465.attachComment) {
        processComment8500(node8723);
    }
    return node8723;
}
SyntaxTreeDelegate8446 = {
    name: "SyntaxTree",
    postProcess: function postProcess(node8724) {
        return node8724;
    },
    createArrayExpression: function createArrayExpression(elements8725) {
        return {
            type: Syntax8442.ArrayExpression,
            elements: elements8725
        };
    },
    createAssignmentExpression: function createAssignmentExpression(operator8726, left8727, right8728) {
        return {
            type: Syntax8442.AssignmentExpression,
            operator: operator8726,
            left: left8727,
            right: right8728
        };
    },
    createBinaryExpression: function createBinaryExpression(operator8729, left8730, right8731) {
        var type8732 = operator8729 === "||" || operator8729 === "&&" ? Syntax8442.LogicalExpression : Syntax8442.BinaryExpression;
        return {
            type: type8732,
            operator: operator8729,
            left: left8730,
            right: right8731
        };
    },
    createBlockStatement: function createBlockStatement(body8733) {
        return {
            type: Syntax8442.BlockStatement,
            body: body8733
        };
    },
    createBreakStatement: function createBreakStatement(label8734) {
        return {
            type: Syntax8442.BreakStatement,
            label: label8734
        };
    },
    createCallExpression: function createCallExpression(callee8735, args8736) {
        return {
            type: Syntax8442.CallExpression,
            callee: callee8735,
            arguments: args8736
        };
    },
    createCatchClause: function createCatchClause(param8737, body8738) {
        return {
            type: Syntax8442.CatchClause,
            param: param8737,
            body: body8738
        };
    },
    createConditionalExpression: function createConditionalExpression(test8739, consequent8740, alternate8741) {
        return {
            type: Syntax8442.ConditionalExpression,
            test: test8739,
            consequent: consequent8740,
            alternate: alternate8741
        };
    },
    createContinueStatement: function createContinueStatement(label8742) {
        return {
            type: Syntax8442.ContinueStatement,
            label: label8742
        };
    },
    createDebuggerStatement: function createDebuggerStatement() {
        return { type: Syntax8442.DebuggerStatement };
    },
    createDoWhileStatement: function createDoWhileStatement(body8743, test8744) {
        return {
            type: Syntax8442.DoWhileStatement,
            body: body8743,
            test: test8744
        };
    },
    createEmptyStatement: function createEmptyStatement() {
        return { type: Syntax8442.EmptyStatement };
    },
    createExpressionStatement: function createExpressionStatement(expression8745) {
        return {
            type: Syntax8442.ExpressionStatement,
            expression: expression8745
        };
    },
    createForStatement: function createForStatement(init8746, test8747, update8748, body8749) {
        return {
            type: Syntax8442.ForStatement,
            init: init8746,
            test: test8747,
            update: update8748,
            body: body8749
        };
    },
    createForInStatement: function createForInStatement(left8750, right8751, body8752) {
        return {
            type: Syntax8442.ForInStatement,
            left: left8750,
            right: right8751,
            body: body8752,
            each: false
        };
    },
    createForOfStatement: function createForOfStatement(left8753, right8754, body8755) {
        return {
            type: Syntax8442.ForOfStatement,
            left: left8753,
            right: right8754,
            body: body8755
        };
    },
    createFunctionDeclaration: function createFunctionDeclaration(id8756, params8757, defaults8758, body8759, rest8760, generator8761, expression8762) {
        return {
            type: Syntax8442.FunctionDeclaration,
            id: id8756,
            params: params8757,
            defaults: defaults8758,
            body: body8759,
            rest: rest8760,
            generator: generator8761,
            expression: expression8762
        };
    },
    createFunctionExpression: function createFunctionExpression(id8763, params8764, defaults8765, body8766, rest8767, generator8768, expression8769) {
        return {
            type: Syntax8442.FunctionExpression,
            id: id8763,
            params: params8764,
            defaults: defaults8765,
            body: body8766,
            rest: rest8767,
            generator: generator8768,
            expression: expression8769
        };
    },
    createIdentifier: function createIdentifier(name8770) {
        return {
            type: Syntax8442.Identifier,
            name: name8770
        };
    },
    createIfStatement: function createIfStatement(test8771, consequent8772, alternate8773) {
        return {
            type: Syntax8442.IfStatement,
            test: test8771,
            consequent: consequent8772,
            alternate: alternate8773
        };
    },
    createLabeledStatement: function createLabeledStatement(label8774, body8775) {
        return {
            type: Syntax8442.LabeledStatement,
            label: label8774,
            body: body8775
        };
    },
    createLiteral: function createLiteral(token8776) {
        return {
            type: Syntax8442.Literal,
            value: token8776.value,
            raw: String(token8776.value)
        };
    },
    createMemberExpression: function createMemberExpression(accessor8777, object8778, property8779) {
        return {
            type: Syntax8442.MemberExpression,
            computed: accessor8777 === "[",
            object: object8778,
            property: property8779
        };
    },
    createNewExpression: function createNewExpression(callee8780, args8781) {
        return {
            type: Syntax8442.NewExpression,
            callee: callee8780,
            arguments: args8781
        };
    },
    createObjectExpression: function createObjectExpression(properties8782) {
        return {
            type: Syntax8442.ObjectExpression,
            properties: properties8782
        };
    },
    createPostfixExpression: function createPostfixExpression(operator8783, argument8784) {
        return {
            type: Syntax8442.UpdateExpression,
            operator: operator8783,
            argument: argument8784,
            prefix: false
        };
    },
    createProgram: function createProgram(body8785) {
        return {
            type: Syntax8442.Program,
            body: body8785
        };
    },
    createProperty: function createProperty(kind8786, key8787, value8788, method8789, shorthand8790, computed8791) {
        return {
            type: Syntax8442.Property,
            key: key8787,
            value: value8788,
            kind: kind8786,
            method: method8789,
            shorthand: shorthand8790,
            computed: computed8791
        };
    },
    createReturnStatement: function createReturnStatement(argument8792) {
        return {
            type: Syntax8442.ReturnStatement,
            argument: argument8792
        };
    },
    createSequenceExpression: function createSequenceExpression(expressions8793) {
        return {
            type: Syntax8442.SequenceExpression,
            expressions: expressions8793
        };
    },
    createSwitchCase: function createSwitchCase(test8794, consequent8795) {
        return {
            type: Syntax8442.SwitchCase,
            test: test8794,
            consequent: consequent8795
        };
    },
    createSwitchStatement: function createSwitchStatement(discriminant8796, cases8797) {
        return {
            type: Syntax8442.SwitchStatement,
            discriminant: discriminant8796,
            cases: cases8797
        };
    },
    createThisExpression: function createThisExpression() {
        return { type: Syntax8442.ThisExpression };
    },
    createThrowStatement: function createThrowStatement(argument8798) {
        return {
            type: Syntax8442.ThrowStatement,
            argument: argument8798
        };
    },
    createTryStatement: function createTryStatement(block8799, guardedHandlers8800, handlers8801, finalizer8802) {
        return {
            type: Syntax8442.TryStatement,
            block: block8799,
            guardedHandlers: guardedHandlers8800,
            handlers: handlers8801,
            finalizer: finalizer8802
        };
    },
    createUnaryExpression: function createUnaryExpression(operator8803, argument8804) {
        if (operator8803 === "++" || operator8803 === "--") {
            return {
                type: Syntax8442.UpdateExpression,
                operator: operator8803,
                argument: argument8804,
                prefix: true
            };
        }
        return {
            type: Syntax8442.UnaryExpression,
            operator: operator8803,
            argument: argument8804,
            prefix: true
        };
    },
    createVariableDeclaration: function createVariableDeclaration(declarations8805, kind8806) {
        return {
            type: Syntax8442.VariableDeclaration,
            declarations: declarations8805,
            kind: kind8806
        };
    },
    createVariableDeclarator: function createVariableDeclarator(id8807, init8808) {
        return {
            type: Syntax8442.VariableDeclarator,
            id: id8807,
            init: init8808
        };
    },
    createWhileStatement: function createWhileStatement(test8809, body8810) {
        return {
            type: Syntax8442.WhileStatement,
            test: test8809,
            body: body8810
        };
    },
    createWithStatement: function createWithStatement(object8811, body8812) {
        return {
            type: Syntax8442.WithStatement,
            object: object8811,
            body: body8812
        };
    },
    createTemplateElement: function createTemplateElement(value8813, tail8814) {
        return {
            type: Syntax8442.TemplateElement,
            value: value8813,
            tail: tail8814
        };
    },
    createTemplateLiteral: function createTemplateLiteral(quasis8815, expressions8816) {
        return {
            type: Syntax8442.TemplateLiteral,
            quasis: quasis8815,
            expressions: expressions8816
        };
    },
    createSpreadElement: function createSpreadElement(argument8817) {
        return {
            type: Syntax8442.SpreadElement,
            argument: argument8817
        };
    },
    createTaggedTemplateExpression: function createTaggedTemplateExpression(tag8818, quasi8819) {
        return {
            type: Syntax8442.TaggedTemplateExpression,
            tag: tag8818,
            quasi: quasi8819
        };
    },
    createArrowFunctionExpression: function createArrowFunctionExpression(params8820, defaults8821, body8822, rest8823, expression8824) {
        return {
            type: Syntax8442.ArrowFunctionExpression,
            id: null,
            params: params8820,
            defaults: defaults8821,
            body: body8822,
            rest: rest8823,
            generator: false,
            expression: expression8824
        };
    },
    createMethodDefinition: function createMethodDefinition(propertyType8825, kind8826, key8827, value8828) {
        return {
            type: Syntax8442.MethodDefinition,
            key: key8827,
            value: value8828,
            kind: kind8826,
            "static": propertyType8825 === ClassPropertyType8447["static"]
        };
    },
    createClassBody: function createClassBody(body8829) {
        return {
            type: Syntax8442.ClassBody,
            body: body8829
        };
    },
    createClassExpression: function createClassExpression(id8830, superClass8831, body8832) {
        return {
            type: Syntax8442.ClassExpression,
            id: id8830,
            superClass: superClass8831,
            body: body8832
        };
    },
    createClassDeclaration: function createClassDeclaration(id8833, superClass8834, body8835) {
        return {
            type: Syntax8442.ClassDeclaration,
            id: id8833,
            superClass: superClass8834,
            body: body8835
        };
    },
    createExportSpecifier: function createExportSpecifier(id8836, name8837) {
        return {
            type: Syntax8442.ExportSpecifier,
            id: id8836,
            name: name8837
        };
    },
    createExportBatchSpecifier: function createExportBatchSpecifier() {
        return { type: Syntax8442.ExportBatchSpecifier };
    },
    createExportDeclaration: function createExportDeclaration(declaration8838, specifiers8839, source8840) {
        return {
            type: Syntax8442.ExportDeclaration,
            declaration: declaration8838,
            specifiers: specifiers8839,
            source: source8840
        };
    },
    createImportSpecifier: function createImportSpecifier(id8841, name8842) {
        return {
            type: Syntax8442.ImportSpecifier,
            id: id8841,
            name: name8842
        };
    },
    createImportDeclaration: function createImportDeclaration(specifiers8843, kind8844, source8845) {
        return {
            type: Syntax8442.ImportDeclaration,
            specifiers: specifiers8843,
            kind: kind8844,
            source: source8845
        };
    },
    createYieldExpression: function createYieldExpression(argument8846, delegate8847) {
        return {
            type: Syntax8442.YieldExpression,
            argument: argument8846,
            delegate: delegate8847
        };
    },
    createModuleDeclaration: function createModuleDeclaration(id8848, source8849, body8850) {
        return {
            type: Syntax8442.ModuleDeclaration,
            id: id8848,
            source: source8849,
            body: body8850
        };
    },
    createComprehensionExpression: function createComprehensionExpression(filter8851, blocks8852, body8853) {
        return {
            type: Syntax8442.ComprehensionExpression,
            filter: filter8851,
            blocks: blocks8852,
            body: body8853
        };
    }
};
function peekLineTerminator8502() {
    return lookahead8461.lineNumber !== lineNumber8451;
}
function throwError8503(token8854, messageFormat8855) {
    var error8856,
        args8857 = Array.prototype.slice.call(arguments, 2),
        msg8858 = messageFormat8855.replace(/%(\d)/g, function (whole8862, index8863) {
        assert8466(index8863 < args8857.length, "Message reference must be in range");
        return args8857[index8863];
    });
    var startIndex8859 = streamIndex8460 > 3 ? streamIndex8460 - 3 : 0;
    var toks8860 = "",
        tailingMsg8861 = "";
    if (tokenStream8459) {
        toks8860 = tokenStream8459.slice(startIndex8859, streamIndex8460 + 3).map(function (stx8864) {
            return stx8864.token.value;
        }).join(" ");
        tailingMsg8861 = "\n[... " + toks8860 + " ...]";
    }
    if (typeof token8854.lineNumber === "number") {
        error8856 = new Error("Line " + token8854.lineNumber + ": " + msg8858 + tailingMsg8861);
        error8856.index = token8854.range[0];
        error8856.lineNumber = token8854.lineNumber;
        error8856.column = token8854.range[0] - lineStart8452 + 1;
    } else {
        error8856 = new Error("Line " + lineNumber8451 + ": " + msg8858 + tailingMsg8861);
        error8856.index = index8450;
        error8856.lineNumber = lineNumber8451;
        error8856.column = index8450 - lineStart8452 + 1;
    }
    error8856.description = msg8858;
    throw error8856;
}
function throwErrorTolerant8504() {
    try {
        throwError8503.apply(null, arguments);
    } catch (e8865) {
        if (extra8465.errors) {
            extra8465.errors.push(e8865);
        } else {
            throw e8865;
        }
    }
}
function throwUnexpected8505(token8866) {
    if (token8866.type === Token8439.EOF) {
        throwError8503(token8866, Messages8444.UnexpectedEOS);
    }
    if (token8866.type === Token8439.NumericLiteral) {
        throwError8503(token8866, Messages8444.UnexpectedNumber);
    }
    if (token8866.type === Token8439.StringLiteral) {
        throwError8503(token8866, Messages8444.UnexpectedString);
    }
    if (token8866.type === Token8439.Identifier) {
        throwError8503(token8866, Messages8444.UnexpectedIdentifier);
    }
    if (token8866.type === Token8439.Keyword) {
        if (isFutureReservedWord8475(token8866.value)) {} else if (strict8449 && isStrictModeReservedWord8476(token8866.value)) {
            throwErrorTolerant8504(token8866, Messages8444.StrictReservedWord);
            return;
        }
        throwError8503(token8866, Messages8444.UnexpectedToken, token8866.value);
    }
    if (token8866.type === Token8439.Template) {
        throwError8503(token8866, Messages8444.UnexpectedTemplate, token8866.value.raw);
    }
    // BooleanLiteral, NullLiteral, or Punctuator.
    throwError8503(token8866, Messages8444.UnexpectedToken, token8866.value);
}
function expect8506(value8867) {
    var token8868 = lex8496();
    if (token8868.type !== Token8439.Punctuator || token8868.value !== value8867) {
        throwUnexpected8505(token8868);
    }
}
function expectKeyword8507(keyword8869) {
    var token8870 = lex8496();
    if (token8870.type !== Token8439.Keyword || token8870.value !== keyword8869) {
        throwUnexpected8505(token8870);
    }
}
function match8508(value8871) {
    return lookahead8461.type === Token8439.Punctuator && lookahead8461.value === value8871;
}
function matchKeyword8509(keyword8872) {
    return lookahead8461.type === Token8439.Keyword && lookahead8461.value === keyword8872;
}
function matchContextualKeyword8510(keyword8873) {
    return lookahead8461.type === Token8439.Identifier && lookahead8461.value === keyword8873;
}
function matchAssign8511() {
    var op8874;
    if (lookahead8461.type !== Token8439.Punctuator) {
        return false;
    }
    op8874 = lookahead8461.value;
    return op8874 === "=" || op8874 === "*=" || op8874 === "/=" || op8874 === "%=" || op8874 === "+=" || op8874 === "-=" || op8874 === "<<=" || op8874 === ">>=" || op8874 === ">>>=" || op8874 === "&=" || op8874 === "^=" || op8874 === "|=";
}
function consumeSemicolon8512() {
    var line8875, ch8876;
    ch8876 = lookahead8461.value ? String(lookahead8461.value).charCodeAt(0) : -1;
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    ch8876 === 59) {
        lex8496();
        return;
    }
    if (lookahead8461.lineNumber !== lineNumber8451) {
        return;
    }
    if (match8508(";")) {
        lex8496();
        return;
    }
    if (lookahead8461.type !== Token8439.EOF && !match8508("}")) {
        throwUnexpected8505(lookahead8461);
    }
}
function isLeftHandSide8513(expr8877) {
    return expr8877.type === Syntax8442.Identifier || expr8877.type === Syntax8442.MemberExpression;
}
function isAssignableLeftHandSide8514(expr8878) {
    return isLeftHandSide8513(expr8878) || expr8878.type === Syntax8442.ObjectPattern || expr8878.type === Syntax8442.ArrayPattern;
}
function parseArrayInitialiser8515() {
    var elements8879 = [],
        blocks8880 = [],
        filter8881 = null,
        tmp8882,
        possiblecomprehension8883 = true,
        body8884,
        marker8885 = markerCreate8499();
    expect8506("[");
    while (!match8508("]")) {
        if (lookahead8461.value === "for" && lookahead8461.type === Token8439.Keyword) {
            if (!possiblecomprehension8883) {
                throwError8503({}, Messages8444.ComprehensionError);
            }
            matchKeyword8509("for");
            tmp8882 = parseForStatement8563({ ignoreBody: true });
            tmp8882.of = tmp8882.type === Syntax8442.ForOfStatement;
            tmp8882.type = Syntax8442.ComprehensionBlock;
            if (tmp8882.left.kind) {
                // can't be let or const
                throwError8503({}, Messages8444.ComprehensionError);
            }
            blocks8880.push(tmp8882);
        } else if (lookahead8461.value === "if" && lookahead8461.type === Token8439.Keyword) {
            if (!possiblecomprehension8883) {
                throwError8503({}, Messages8444.ComprehensionError);
            }
            expectKeyword8507("if");
            expect8506("(");
            filter8881 = parseExpression8543();
            expect8506(")");
        } else if (lookahead8461.value === "," && lookahead8461.type === Token8439.Punctuator) {
            possiblecomprehension8883 = false;
            // no longer allowed.
            lex8496();
            elements8879.push(null);
        } else {
            tmp8882 = parseSpreadOrAssignmentExpression8526();
            elements8879.push(tmp8882);
            if (tmp8882 && tmp8882.type === Syntax8442.SpreadElement) {
                if (!match8508("]")) {
                    throwError8503({}, Messages8444.ElementAfterSpreadElement);
                }
            } else if (!(match8508("]") || matchKeyword8509("for") || matchKeyword8509("if"))) {
                expect8506(",");
                // this lexes.
                possiblecomprehension8883 = false;
            }
        }
    }
    expect8506("]");
    if (filter8881 && !blocks8880.length) {
        throwError8503({}, Messages8444.ComprehensionRequiresBlock);
    }
    if (blocks8880.length) {
        if (elements8879.length !== 1) {
            throwError8503({}, Messages8444.ComprehensionError);
        }
        return markerApply8501(marker8885, delegate8458.createComprehensionExpression(filter8881, blocks8880, elements8879[0]));
    }
    return markerApply8501(marker8885, delegate8458.createArrayExpression(elements8879));
}
function parsePropertyFunction8516(options8886) {
    var previousStrict8887,
        previousYieldAllowed8888,
        params8889,
        defaults8890,
        body8891,
        marker8892 = markerCreate8499();
    previousStrict8887 = strict8449;
    previousYieldAllowed8888 = state8463.yieldAllowed;
    state8463.yieldAllowed = options8886.generator;
    params8889 = options8886.params || [];
    defaults8890 = options8886.defaults || [];
    body8891 = parseConciseBody8575();
    if (options8886.name && strict8449 && isRestrictedWord8477(params8889[0].name)) {
        throwErrorTolerant8504(options8886.name, Messages8444.StrictParamName);
    }
    strict8449 = previousStrict8887;
    state8463.yieldAllowed = previousYieldAllowed8888;
    return markerApply8501(marker8892, delegate8458.createFunctionExpression(null, params8889, defaults8890, body8891, options8886.rest || null, options8886.generator, body8891.type !== Syntax8442.BlockStatement));
}
function parsePropertyMethodFunction8517(options8893) {
    var previousStrict8894, tmp8895, method8896;
    previousStrict8894 = strict8449;
    strict8449 = true;
    tmp8895 = parseParams8579();
    if (tmp8895.stricted) {
        throwErrorTolerant8504(tmp8895.stricted, tmp8895.message);
    }
    method8896 = parsePropertyFunction8516({
        params: tmp8895.params,
        defaults: tmp8895.defaults,
        rest: tmp8895.rest,
        generator: options8893.generator
    });
    strict8449 = previousStrict8894;
    return method8896;
}
function parseObjectPropertyKey8518() {
    var marker8897 = markerCreate8499(),
        token8898 = lex8496(),
        propertyKey8899,
        result8900;
    if ( // Note: This function is called only from parseObjectProperty(), where
    // EOF and Punctuator tokens are already filtered out.
    token8898.type === Token8439.StringLiteral || token8898.type === Token8439.NumericLiteral) {
        if (strict8449 && token8898.octal) {
            throwErrorTolerant8504(token8898, Messages8444.StrictOctalLiteral);
        }
        return markerApply8501(marker8897, delegate8458.createLiteral(token8898));
    }
    if (token8898.type === Token8439.Punctuator && token8898.value === "[") {
        // For computed properties we should skip the [ and ], and
        // capture in marker only the assignment expression itself.
        marker8897 = markerCreate8499();
        propertyKey8899 = parseAssignmentExpression8542();
        result8900 = markerApply8501(marker8897, propertyKey8899);
        expect8506("]");
        return result8900;
    }
    return markerApply8501(marker8897, delegate8458.createIdentifier(token8898.value));
}
function parseObjectProperty8519() {
    var token8901,
        key8902,
        id8903,
        value8904,
        param8905,
        expr8906,
        computed8907,
        marker8908 = markerCreate8499();
    token8901 = lookahead8461;
    computed8907 = token8901.value === "[" && token8901.type === Token8439.Punctuator;
    if (token8901.type === Token8439.Identifier || computed8907) {
        id8903 = parseObjectPropertyKey8518();
        if ( // Property Assignment: Getter and Setter.
        token8901.value === "get" && !(match8508(":") || match8508("("))) {
            computed8907 = lookahead8461.value === "[";
            key8902 = parseObjectPropertyKey8518();
            expect8506("(");
            expect8506(")");
            return markerApply8501(marker8908, delegate8458.createProperty("get", key8902, parsePropertyFunction8516({ generator: false }), false, false, computed8907));
        }
        if (token8901.value === "set" && !(match8508(":") || match8508("("))) {
            computed8907 = lookahead8461.value === "[";
            key8902 = parseObjectPropertyKey8518();
            expect8506("(");
            token8901 = lookahead8461;
            param8905 = [parseVariableIdentifier8546()];
            expect8506(")");
            return markerApply8501(marker8908, delegate8458.createProperty("set", key8902, parsePropertyFunction8516({
                params: param8905,
                generator: false,
                name: token8901
            }), false, false, computed8907));
        }
        if (match8508(":")) {
            lex8496();
            return markerApply8501(marker8908, delegate8458.createProperty("init", id8903, parseAssignmentExpression8542(), false, false, computed8907));
        }
        if (match8508("(")) {
            return markerApply8501(marker8908, delegate8458.createProperty("init", id8903, parsePropertyMethodFunction8517({ generator: false }), true, false, computed8907));
        }
        if (computed8907) {
            // Computed properties can only be used with full notation.
            throwUnexpected8505(lookahead8461);
        }
        return markerApply8501(marker8908, delegate8458.createProperty("init", id8903, id8903, false, true, false));
    }
    if (token8901.type === Token8439.EOF || token8901.type === Token8439.Punctuator) {
        if (!match8508("*")) {
            throwUnexpected8505(token8901);
        }
        lex8496();
        computed8907 = lookahead8461.type === Token8439.Punctuator && lookahead8461.value === "[";
        id8903 = parseObjectPropertyKey8518();
        if (!match8508("(")) {
            throwUnexpected8505(lex8496());
        }
        return markerApply8501(marker8908, delegate8458.createProperty("init", id8903, parsePropertyMethodFunction8517({ generator: true }), true, false, computed8907));
    }
    key8902 = parseObjectPropertyKey8518();
    if (match8508(":")) {
        lex8496();
        return markerApply8501(marker8908, delegate8458.createProperty("init", key8902, parseAssignmentExpression8542(), false, false, false));
    }
    if (match8508("(")) {
        return markerApply8501(marker8908, delegate8458.createProperty("init", key8902, parsePropertyMethodFunction8517({ generator: false }), true, false, false));
    }
    throwUnexpected8505(lex8496());
}
function parseObjectInitialiser8520() {
    var properties8909 = [],
        property8910,
        name8911,
        key8912,
        kind8913,
        map8914 = {},
        toString8915 = String,
        marker8916 = markerCreate8499();
    expect8506("{");
    while (!match8508("}")) {
        property8910 = parseObjectProperty8519();
        if (property8910.key.type === Syntax8442.Identifier) {
            name8911 = property8910.key.name;
        } else {
            name8911 = toString8915(property8910.key.value);
        }
        kind8913 = property8910.kind === "init" ? PropertyKind8443.Data : property8910.kind === "get" ? PropertyKind8443.Get : PropertyKind8443.Set;
        key8912 = "$" + name8911;
        if (Object.prototype.hasOwnProperty.call(map8914, key8912)) {
            if (map8914[key8912] === PropertyKind8443.Data) {
                if (strict8449 && kind8913 === PropertyKind8443.Data) {
                    throwErrorTolerant8504({}, Messages8444.StrictDuplicateProperty);
                } else if (kind8913 !== PropertyKind8443.Data) {
                    throwErrorTolerant8504({}, Messages8444.AccessorDataProperty);
                }
            } else {
                if (kind8913 === PropertyKind8443.Data) {
                    throwErrorTolerant8504({}, Messages8444.AccessorDataProperty);
                } else if (map8914[key8912] & kind8913) {
                    throwErrorTolerant8504({}, Messages8444.AccessorGetSet);
                }
            }
            map8914[key8912] |= kind8913;
        } else {
            map8914[key8912] = kind8913;
        }
        properties8909.push(property8910);
        if (!match8508("}")) {
            expect8506(",");
        }
    }
    expect8506("}");
    return markerApply8501(marker8916, delegate8458.createObjectExpression(properties8909));
}
function parseTemplateElement8521(option8917) {
    var marker8918 = markerCreate8499(),
        token8919 = lex8496();
    if (strict8449 && token8919.octal) {
        throwError8503(token8919, Messages8444.StrictOctalLiteral);
    }
    return markerApply8501(marker8918, delegate8458.createTemplateElement({
        raw: token8919.value.raw,
        cooked: token8919.value.cooked
    }, token8919.tail));
}
function parseTemplateLiteral8522() {
    var quasi8920,
        quasis8921,
        expressions8922,
        marker8923 = markerCreate8499();
    quasi8920 = parseTemplateElement8521({ head: true });
    quasis8921 = [quasi8920];
    expressions8922 = [];
    while (!quasi8920.tail) {
        expressions8922.push(parseExpression8543());
        quasi8920 = parseTemplateElement8521({ head: false });
        quasis8921.push(quasi8920);
    }
    return markerApply8501(marker8923, delegate8458.createTemplateLiteral(quasis8921, expressions8922));
}
function parseGroupExpression8523() {
    var expr8924;
    expect8506("(");
    ++state8463.parenthesizedCount;
    expr8924 = parseExpression8543();
    expect8506(")");
    return expr8924;
}
function parsePrimaryExpression8524() {
    var type8925, token8926, resolvedIdent8927, marker8928, expr8929;
    token8926 = lookahead8461;
    type8925 = lookahead8461.type;
    if (type8925 === Token8439.Identifier) {
        marker8928 = markerCreate8499();
        resolvedIdent8927 = expander8438.resolve(tokenStream8459[lookaheadIndex8462], phase8464);
        lex8496();
        return markerApply8501(marker8928, delegate8458.createIdentifier(resolvedIdent8927));
    }
    if (type8925 === Token8439.StringLiteral || type8925 === Token8439.NumericLiteral) {
        if (strict8449 && lookahead8461.octal) {
            throwErrorTolerant8504(lookahead8461, Messages8444.StrictOctalLiteral);
        }
        marker8928 = markerCreate8499();
        return markerApply8501(marker8928, delegate8458.createLiteral(lex8496()));
    }
    if (type8925 === Token8439.Keyword) {
        if (matchKeyword8509("this")) {
            marker8928 = markerCreate8499();
            lex8496();
            return markerApply8501(marker8928, delegate8458.createThisExpression());
        }
        if (matchKeyword8509("function")) {
            return parseFunctionExpression8581();
        }
        if (matchKeyword8509("class")) {
            return parseClassExpression8586();
        }
        if (matchKeyword8509("super")) {
            marker8928 = markerCreate8499();
            lex8496();
            return markerApply8501(marker8928, delegate8458.createIdentifier("super"));
        }
    }
    if (type8925 === Token8439.BooleanLiteral) {
        marker8928 = markerCreate8499();
        token8926 = lex8496();
        if (typeof token8926.value !== "boolean") {
            assert8466(token8926.value === "true" || token8926.value === "false", "exporting either true or false as a string not: " + token8926.value);
            token8926.value = token8926.value === "true";
        }
        return markerApply8501(marker8928, delegate8458.createLiteral(token8926));
    }
    if (type8925 === Token8439.NullLiteral) {
        marker8928 = markerCreate8499();
        token8926 = lex8496();
        token8926.value = null;
        return markerApply8501(marker8928, delegate8458.createLiteral(token8926));
    }
    if (match8508("[")) {
        return parseArrayInitialiser8515();
    }
    if (match8508("{")) {
        return parseObjectInitialiser8520();
    }
    if (match8508("(")) {
        return parseGroupExpression8523();
    }
    if (lookahead8461.type === Token8439.RegularExpression) {
        marker8928 = markerCreate8499();
        return markerApply8501(marker8928, delegate8458.createLiteral(lex8496()));
    }
    if (type8925 === Token8439.Template) {
        return parseTemplateLiteral8522();
    }
    throwUnexpected8505(lex8496());
}
function parseArguments8525() {
    var args8930 = [],
        arg8931;
    expect8506("(");
    if (!match8508(")")) {
        while (streamIndex8460 < length8457) {
            arg8931 = parseSpreadOrAssignmentExpression8526();
            args8930.push(arg8931);
            if (match8508(")")) {
                break;
            } else if (arg8931.type === Syntax8442.SpreadElement) {
                throwError8503({}, Messages8444.ElementAfterSpreadElement);
            }
            expect8506(",");
        }
    }
    expect8506(")");
    return args8930;
}
function parseSpreadOrAssignmentExpression8526() {
    if (match8508("...")) {
        var marker8932 = markerCreate8499();
        lex8496();
        return markerApply8501(marker8932, delegate8458.createSpreadElement(parseAssignmentExpression8542()));
    }
    return parseAssignmentExpression8542();
}
function parseNonComputedProperty8527(toResolve8933) {
    var marker8934 = markerCreate8499(),
        resolvedIdent8935,
        token8936;
    if (toResolve8933) {
        resolvedIdent8935 = expander8438.resolve(tokenStream8459[lookaheadIndex8462], phase8464);
    }
    token8936 = lex8496();
    resolvedIdent8935 = toResolve8933 ? resolvedIdent8935 : token8936.value;
    if (!isIdentifierName8493(token8936)) {
        throwUnexpected8505(token8936);
    }
    return markerApply8501(marker8934, delegate8458.createIdentifier(resolvedIdent8935));
}
function parseNonComputedMember8528() {
    expect8506(".");
    return parseNonComputedProperty8527();
}
function parseComputedMember8529() {
    var expr8937;
    expect8506("[");
    expr8937 = parseExpression8543();
    expect8506("]");
    return expr8937;
}
function parseNewExpression8530() {
    var callee8938,
        args8939,
        marker8940 = markerCreate8499();
    expectKeyword8507("new");
    callee8938 = parseLeftHandSideExpression8532();
    args8939 = match8508("(") ? parseArguments8525() : [];
    return markerApply8501(marker8940, delegate8458.createNewExpression(callee8938, args8939));
}
function parseLeftHandSideExpressionAllowCall8531() {
    var expr8941,
        args8942,
        marker8943 = markerCreate8499();
    expr8941 = matchKeyword8509("new") ? parseNewExpression8530() : parsePrimaryExpression8524();
    while (match8508(".") || match8508("[") || match8508("(") || lookahead8461.type === Token8439.Template) {
        if (match8508("(")) {
            args8942 = parseArguments8525();
            expr8941 = markerApply8501(marker8943, delegate8458.createCallExpression(expr8941, args8942));
        } else if (match8508("[")) {
            expr8941 = markerApply8501(marker8943, delegate8458.createMemberExpression("[", expr8941, parseComputedMember8529()));
        } else if (match8508(".")) {
            expr8941 = markerApply8501(marker8943, delegate8458.createMemberExpression(".", expr8941, parseNonComputedMember8528()));
        } else {
            expr8941 = markerApply8501(marker8943, delegate8458.createTaggedTemplateExpression(expr8941, parseTemplateLiteral8522()));
        }
    }
    return expr8941;
}
function parseLeftHandSideExpression8532() {
    var expr8944,
        marker8945 = markerCreate8499();
    expr8944 = matchKeyword8509("new") ? parseNewExpression8530() : parsePrimaryExpression8524();
    while (match8508(".") || match8508("[") || lookahead8461.type === Token8439.Template) {
        if (match8508("[")) {
            expr8944 = markerApply8501(marker8945, delegate8458.createMemberExpression("[", expr8944, parseComputedMember8529()));
        } else if (match8508(".")) {
            expr8944 = markerApply8501(marker8945, delegate8458.createMemberExpression(".", expr8944, parseNonComputedMember8528()));
        } else {
            expr8944 = markerApply8501(marker8945, delegate8458.createTaggedTemplateExpression(expr8944, parseTemplateLiteral8522()));
        }
    }
    return expr8944;
}
function parsePostfixExpression8533() {
    var marker8946 = markerCreate8499(),
        expr8947 = parseLeftHandSideExpressionAllowCall8531(),
        token8948;
    if (lookahead8461.type !== Token8439.Punctuator) {
        return expr8947;
    }
    if ((match8508("++") || match8508("--")) && !peekLineTerminator8502()) {
        if ( // 11.3.1, 11.3.2
        strict8449 && expr8947.type === Syntax8442.Identifier && isRestrictedWord8477(expr8947.name)) {
            throwErrorTolerant8504({}, Messages8444.StrictLHSPostfix);
        }
        if (!isLeftHandSide8513(expr8947)) {
            throwError8503({}, Messages8444.InvalidLHSInAssignment);
        }
        token8948 = lex8496();
        expr8947 = markerApply8501(marker8946, delegate8458.createPostfixExpression(token8948.value, expr8947));
    }
    return expr8947;
}
function parseUnaryExpression8534() {
    var marker8949, token8950, expr8951;
    if (lookahead8461.type !== Token8439.Punctuator && lookahead8461.type !== Token8439.Keyword) {
        return parsePostfixExpression8533();
    }
    if (match8508("++") || match8508("--")) {
        marker8949 = markerCreate8499();
        token8950 = lex8496();
        expr8951 = parseUnaryExpression8534();
        if ( // 11.4.4, 11.4.5
        strict8449 && expr8951.type === Syntax8442.Identifier && isRestrictedWord8477(expr8951.name)) {
            throwErrorTolerant8504({}, Messages8444.StrictLHSPrefix);
        }
        if (!isLeftHandSide8513(expr8951)) {
            throwError8503({}, Messages8444.InvalidLHSInAssignment);
        }
        return markerApply8501(marker8949, delegate8458.createUnaryExpression(token8950.value, expr8951));
    }
    if (match8508("+") || match8508("-") || match8508("~") || match8508("!")) {
        marker8949 = markerCreate8499();
        token8950 = lex8496();
        expr8951 = parseUnaryExpression8534();
        return markerApply8501(marker8949, delegate8458.createUnaryExpression(token8950.value, expr8951));
    }
    if (matchKeyword8509("delete") || matchKeyword8509("void") || matchKeyword8509("typeof")) {
        marker8949 = markerCreate8499();
        token8950 = lex8496();
        expr8951 = parseUnaryExpression8534();
        expr8951 = markerApply8501(marker8949, delegate8458.createUnaryExpression(token8950.value, expr8951));
        if (strict8449 && expr8951.operator === "delete" && expr8951.argument.type === Syntax8442.Identifier) {
            throwErrorTolerant8504({}, Messages8444.StrictDelete);
        }
        return expr8951;
    }
    return parsePostfixExpression8533();
}
function binaryPrecedence8535(token8952, allowIn8953) {
    var prec8954 = 0;
    if (token8952.type !== Token8439.Punctuator && token8952.type !== Token8439.Keyword) {
        return 0;
    }
    switch (token8952.value) {
        case "||":
            prec8954 = 1;
            break;
        case "&&":
            prec8954 = 2;
            break;
        case "|":
            prec8954 = 3;
            break;
        case "^":
            prec8954 = 4;
            break;
        case "&":
            prec8954 = 5;
            break;
        case "==":
        case "!=":
        case "===":
        case "!==":
            prec8954 = 6;
            break;
        case "<":
        case ">":
        case "<=":
        case ">=":
        case "instanceof":
            prec8954 = 7;
            break;
        case "in":
            prec8954 = allowIn8953 ? 7 : 0;
            break;
        case "<<":
        case ">>":
        case ">>>":
            prec8954 = 8;
            break;
        case "+":
        case "-":
            prec8954 = 9;
            break;
        case "*":
        case "/":
        case "%":
            prec8954 = 11;
            break;
        default:
            break;
    }
    return prec8954;
}
function parseBinaryExpression8536() {
    var expr8955, token8956, prec8957, previousAllowIn8958, stack8959, right8960, operator8961, left8962, i8963, marker8964, markers8965;
    previousAllowIn8958 = state8463.allowIn;
    state8463.allowIn = true;
    marker8964 = markerCreate8499();
    left8962 = parseUnaryExpression8534();
    token8956 = lookahead8461;
    prec8957 = binaryPrecedence8535(token8956, previousAllowIn8958);
    if (prec8957 === 0) {
        return left8962;
    }
    token8956.prec = prec8957;
    lex8496();
    markers8965 = [marker8964, markerCreate8499()];
    right8960 = parseUnaryExpression8534();
    stack8959 = [left8962, token8956, right8960];
    while ((prec8957 = binaryPrecedence8535(lookahead8461, previousAllowIn8958)) > 0) {
        while ( // Reduce: make a binary expression from the three topmost entries.
        stack8959.length > 2 && prec8957 <= stack8959[stack8959.length - 2].prec) {
            right8960 = stack8959.pop();
            operator8961 = stack8959.pop().value;
            left8962 = stack8959.pop();
            expr8955 = delegate8458.createBinaryExpression(operator8961, left8962, right8960);
            markers8965.pop();
            marker8964 = markers8965.pop();
            markerApply8501(marker8964, expr8955);
            stack8959.push(expr8955);
            markers8965.push(marker8964);
        }
        // Shift.
        token8956 = lex8496();
        token8956.prec = prec8957;
        stack8959.push(token8956);
        markers8965.push(markerCreate8499());
        expr8955 = parseUnaryExpression8534();
        stack8959.push(expr8955);
    }
    state8463.allowIn = previousAllowIn8958;
    // Final reduce to clean-up the stack.
    i8963 = stack8959.length - 1;
    expr8955 = stack8959[i8963];
    markers8965.pop();
    while (i8963 > 1) {
        expr8955 = delegate8458.createBinaryExpression(stack8959[i8963 - 1].value, stack8959[i8963 - 2], expr8955);
        i8963 -= 2;
        marker8964 = markers8965.pop();
        markerApply8501(marker8964, expr8955);
    }
    return expr8955;
}
function parseConditionalExpression8537() {
    var expr8966,
        previousAllowIn8967,
        consequent8968,
        alternate8969,
        marker8970 = markerCreate8499();
    expr8966 = parseBinaryExpression8536();
    if (match8508("?")) {
        lex8496();
        previousAllowIn8967 = state8463.allowIn;
        state8463.allowIn = true;
        consequent8968 = parseAssignmentExpression8542();
        state8463.allowIn = previousAllowIn8967;
        expect8506(":");
        alternate8969 = parseAssignmentExpression8542();
        expr8966 = markerApply8501(marker8970, delegate8458.createConditionalExpression(expr8966, consequent8968, alternate8969));
    }
    return expr8966;
}
function reinterpretAsAssignmentBindingPattern8538(expr8971) {
    var i8972, len8973, property8974, element8975;
    if (expr8971.type === Syntax8442.ObjectExpression) {
        expr8971.type = Syntax8442.ObjectPattern;
        for (i8972 = 0, len8973 = expr8971.properties.length; i8972 < len8973; i8972 += 1) {
            property8974 = expr8971.properties[i8972];
            if (property8974.kind !== "init") {
                throwError8503({}, Messages8444.InvalidLHSInAssignment);
            }
            reinterpretAsAssignmentBindingPattern8538(property8974.value);
        }
    } else if (expr8971.type === Syntax8442.ArrayExpression) {
        expr8971.type = Syntax8442.ArrayPattern;
        for (i8972 = 0, len8973 = expr8971.elements.length; i8972 < len8973; i8972 += 1) {
            element8975 = expr8971.elements[i8972];
            if (element8975) {
                reinterpretAsAssignmentBindingPattern8538(element8975);
            }
        }
    } else if (expr8971.type === Syntax8442.Identifier) {
        if (isRestrictedWord8477(expr8971.name)) {
            throwError8503({}, Messages8444.InvalidLHSInAssignment);
        }
    } else if (expr8971.type === Syntax8442.SpreadElement) {
        reinterpretAsAssignmentBindingPattern8538(expr8971.argument);
        if (expr8971.argument.type === Syntax8442.ObjectPattern) {
            throwError8503({}, Messages8444.ObjectPatternAsSpread);
        }
    } else {
        if (expr8971.type !== Syntax8442.MemberExpression && expr8971.type !== Syntax8442.CallExpression && expr8971.type !== Syntax8442.NewExpression) {
            throwError8503({}, Messages8444.InvalidLHSInAssignment);
        }
    }
}
function reinterpretAsDestructuredParameter8539(options8976, expr8977) {
    var i8978, len8979, property8980, element8981;
    if (expr8977.type === Syntax8442.ObjectExpression) {
        expr8977.type = Syntax8442.ObjectPattern;
        for (i8978 = 0, len8979 = expr8977.properties.length; i8978 < len8979; i8978 += 1) {
            property8980 = expr8977.properties[i8978];
            if (property8980.kind !== "init") {
                throwError8503({}, Messages8444.InvalidLHSInFormalsList);
            }
            reinterpretAsDestructuredParameter8539(options8976, property8980.value);
        }
    } else if (expr8977.type === Syntax8442.ArrayExpression) {
        expr8977.type = Syntax8442.ArrayPattern;
        for (i8978 = 0, len8979 = expr8977.elements.length; i8978 < len8979; i8978 += 1) {
            element8981 = expr8977.elements[i8978];
            if (element8981) {
                reinterpretAsDestructuredParameter8539(options8976, element8981);
            }
        }
    } else if (expr8977.type === Syntax8442.Identifier) {
        validateParam8577(options8976, expr8977, expr8977.name);
    } else {
        if (expr8977.type !== Syntax8442.MemberExpression) {
            throwError8503({}, Messages8444.InvalidLHSInFormalsList);
        }
    }
}
function reinterpretAsCoverFormalsList8540(expressions8982) {
    var i8983, len8984, param8985, params8986, defaults8987, defaultCount8988, options8989, rest8990;
    params8986 = [];
    defaults8987 = [];
    defaultCount8988 = 0;
    rest8990 = null;
    options8989 = { paramSet: {} };
    for (i8983 = 0, len8984 = expressions8982.length; i8983 < len8984; i8983 += 1) {
        param8985 = expressions8982[i8983];
        if (param8985.type === Syntax8442.Identifier) {
            params8986.push(param8985);
            defaults8987.push(null);
            validateParam8577(options8989, param8985, param8985.name);
        } else if (param8985.type === Syntax8442.ObjectExpression || param8985.type === Syntax8442.ArrayExpression) {
            reinterpretAsDestructuredParameter8539(options8989, param8985);
            params8986.push(param8985);
            defaults8987.push(null);
        } else if (param8985.type === Syntax8442.SpreadElement) {
            assert8466(i8983 === len8984 - 1, "It is guaranteed that SpreadElement is last element by parseExpression");
            reinterpretAsDestructuredParameter8539(options8989, param8985.argument);
            rest8990 = param8985.argument;
        } else if (param8985.type === Syntax8442.AssignmentExpression) {
            params8986.push(param8985.left);
            defaults8987.push(param8985.right);
            ++defaultCount8988;
            validateParam8577(options8989, param8985.left, param8985.left.name);
        } else {
            return null;
        }
    }
    if (options8989.message === Messages8444.StrictParamDupe) {
        throwError8503(strict8449 ? options8989.stricted : options8989.firstRestricted, options8989.message);
    }
    if (defaultCount8988 === 0) {
        defaults8987 = [];
    }
    return {
        params: params8986,
        defaults: defaults8987,
        rest: rest8990,
        stricted: options8989.stricted,
        firstRestricted: options8989.firstRestricted,
        message: options8989.message
    };
}
function parseArrowFunctionExpression8541(options8991, marker8992) {
    var previousStrict8993, previousYieldAllowed8994, body8995;
    expect8506("=>");
    previousStrict8993 = strict8449;
    previousYieldAllowed8994 = state8463.yieldAllowed;
    state8463.yieldAllowed = false;
    body8995 = parseConciseBody8575();
    if (strict8449 && options8991.firstRestricted) {
        throwError8503(options8991.firstRestricted, options8991.message);
    }
    if (strict8449 && options8991.stricted) {
        throwErrorTolerant8504(options8991.stricted, options8991.message);
    }
    strict8449 = previousStrict8993;
    state8463.yieldAllowed = previousYieldAllowed8994;
    return markerApply8501(marker8992, delegate8458.createArrowFunctionExpression(options8991.params, options8991.defaults, body8995, options8991.rest, body8995.type !== Syntax8442.BlockStatement));
}
function parseAssignmentExpression8542() {
    var marker8996, expr8997, token8998, params8999, oldParenthesizedCount9000;
    if ( // Note that 'yield' is treated as a keyword in strict mode, but a
    // contextual keyword (identifier) in non-strict mode, so we need
    // to use matchKeyword and matchContextualKeyword appropriately.
    state8463.yieldAllowed && matchContextualKeyword8510("yield") || strict8449 && matchKeyword8509("yield")) {
        return parseYieldExpression8582();
    }
    oldParenthesizedCount9000 = state8463.parenthesizedCount;
    marker8996 = markerCreate8499();
    if (match8508("(")) {
        token8998 = lookahead28498();
        if (token8998.type === Token8439.Punctuator && token8998.value === ")" || token8998.value === "...") {
            params8999 = parseParams8579();
            if (!match8508("=>")) {
                throwUnexpected8505(lex8496());
            }
            return parseArrowFunctionExpression8541(params8999, marker8996);
        }
    }
    token8998 = lookahead8461;
    expr8997 = parseConditionalExpression8537();
    if (match8508("=>") && (state8463.parenthesizedCount === oldParenthesizedCount9000 || state8463.parenthesizedCount === oldParenthesizedCount9000 + 1)) {
        if (expr8997.type === Syntax8442.Identifier) {
            params8999 = reinterpretAsCoverFormalsList8540([expr8997]);
        } else if (expr8997.type === Syntax8442.SequenceExpression) {
            params8999 = reinterpretAsCoverFormalsList8540(expr8997.expressions);
        }
        if (params8999) {
            return parseArrowFunctionExpression8541(params8999, marker8996);
        }
    }
    if (matchAssign8511()) {
        if ( // 11.13.1
        strict8449 && expr8997.type === Syntax8442.Identifier && isRestrictedWord8477(expr8997.name)) {
            throwErrorTolerant8504(token8998, Messages8444.StrictLHSAssignment);
        }
        if ( // ES.next draf 11.13 Runtime Semantics step 1
        match8508("=") && (expr8997.type === Syntax8442.ObjectExpression || expr8997.type === Syntax8442.ArrayExpression)) {
            reinterpretAsAssignmentBindingPattern8538(expr8997);
        } else if (!isLeftHandSide8513(expr8997)) {
            throwError8503({}, Messages8444.InvalidLHSInAssignment);
        }
        expr8997 = markerApply8501(marker8996, delegate8458.createAssignmentExpression(lex8496().value, expr8997, parseAssignmentExpression8542()));
    }
    return expr8997;
}
function parseExpression8543() {
    var marker9001, expr9002, expressions9003, sequence9004, coverFormalsList9005, spreadFound9006, oldParenthesizedCount9007;
    oldParenthesizedCount9007 = state8463.parenthesizedCount;
    marker9001 = markerCreate8499();
    expr9002 = parseAssignmentExpression8542();
    expressions9003 = [expr9002];
    if (match8508(",")) {
        while (streamIndex8460 < length8457) {
            if (!match8508(",")) {
                break;
            }
            lex8496();
            expr9002 = parseSpreadOrAssignmentExpression8526();
            expressions9003.push(expr9002);
            if (expr9002.type === Syntax8442.SpreadElement) {
                spreadFound9006 = true;
                if (!match8508(")")) {
                    throwError8503({}, Messages8444.ElementAfterSpreadElement);
                }
                break;
            }
        }
        sequence9004 = markerApply8501(marker9001, delegate8458.createSequenceExpression(expressions9003));
    }
    if (match8508("=>")) {
        if ( // Do not allow nested parentheses on the LHS of the =>.
        state8463.parenthesizedCount === oldParenthesizedCount9007 || state8463.parenthesizedCount === oldParenthesizedCount9007 + 1) {
            expr9002 = expr9002.type === Syntax8442.SequenceExpression ? expr9002.expressions : expressions9003;
            coverFormalsList9005 = reinterpretAsCoverFormalsList8540(expr9002);
            if (coverFormalsList9005) {
                return parseArrowFunctionExpression8541(coverFormalsList9005, marker9001);
            }
        }
        throwUnexpected8505(lex8496());
    }
    if (spreadFound9006 && lookahead28498().value !== "=>") {
        throwError8503({}, Messages8444.IllegalSpread);
    }
    return sequence9004 || expr9002;
}
function parseStatementList8544() {
    var list9008 = [],
        statement9009;
    while (streamIndex8460 < length8457) {
        if (match8508("}")) {
            break;
        }
        statement9009 = parseSourceElement8589();
        if (typeof statement9009 === "undefined") {
            break;
        }
        list9008.push(statement9009);
    }
    return list9008;
}
function parseBlock8545() {
    var block9010,
        marker9011 = markerCreate8499();
    expect8506("{");
    block9010 = parseStatementList8544();
    expect8506("}");
    return markerApply8501(marker9011, delegate8458.createBlockStatement(block9010));
}
function parseVariableIdentifier8546() {
    var token9012 = lookahead8461,
        resolvedIdent9013,
        marker9014 = markerCreate8499();
    if (token9012.type !== Token8439.Identifier) {
        throwUnexpected8505(token9012);
    }
    resolvedIdent9013 = expander8438.resolve(tokenStream8459[lookaheadIndex8462], phase8464);
    lex8496();
    return markerApply8501(marker9014, delegate8458.createIdentifier(resolvedIdent9013));
}
function parseVariableDeclaration8547(kind9015) {
    var id9016,
        marker9017 = markerCreate8499(),
        init9018 = null;
    if (match8508("{")) {
        id9016 = parseObjectInitialiser8520();
        reinterpretAsAssignmentBindingPattern8538(id9016);
    } else if (match8508("[")) {
        id9016 = parseArrayInitialiser8515();
        reinterpretAsAssignmentBindingPattern8538(id9016);
    } else {
        id9016 = state8463.allowKeyword ? parseNonComputedProperty8527() : parseVariableIdentifier8546();
        if ( // 12.2.1
        strict8449 && isRestrictedWord8477(id9016.name)) {
            throwErrorTolerant8504({}, Messages8444.StrictVarName);
        }
    }
    if (kind9015 === "const") {
        if (!match8508("=")) {
            throwError8503({}, Messages8444.NoUnintializedConst);
        }
        expect8506("=");
        init9018 = parseAssignmentExpression8542();
    } else if (match8508("=")) {
        lex8496();
        init9018 = parseAssignmentExpression8542();
    }
    return markerApply8501(marker9017, delegate8458.createVariableDeclarator(id9016, init9018));
}
function parseVariableDeclarationList8548(kind9019) {
    var list9020 = [];
    do {
        list9020.push(parseVariableDeclaration8547(kind9019));
        if (!match8508(",")) {
            break;
        }
        lex8496();
    } while (streamIndex8460 < length8457);
    return list9020;
}
function parseVariableStatement8549() {
    var declarations9021,
        marker9022 = markerCreate8499();
    expectKeyword8507("var");
    declarations9021 = parseVariableDeclarationList8548();
    consumeSemicolon8512();
    return markerApply8501(marker9022, delegate8458.createVariableDeclaration(declarations9021, "var"));
}
function parseConstLetDeclaration8550(kind9023) {
    var declarations9024,
        marker9025 = markerCreate8499();
    expectKeyword8507(kind9023);
    declarations9024 = parseVariableDeclarationList8548(kind9023);
    consumeSemicolon8512();
    return markerApply8501(marker9025, delegate8458.createVariableDeclaration(declarations9024, kind9023));
}
function parseModuleDeclaration8551() {
    var id9026,
        src9027,
        body9028,
        marker9029 = markerCreate8499();
    lex8496();
    if ( // 'module'
    peekLineTerminator8502()) {
        throwError8503({}, Messages8444.NewlineAfterModule);
    }
    switch (lookahead8461.type) {
        case Token8439.StringLiteral:
            id9026 = parsePrimaryExpression8524();
            body9028 = parseModuleBlock8594();
            src9027 = null;
            break;
        case Token8439.Identifier:
            id9026 = parseVariableIdentifier8546();
            body9028 = null;
            if (!matchContextualKeyword8510("from")) {
                throwUnexpected8505(lex8496());
            }
            lex8496();
            src9027 = parsePrimaryExpression8524();
            if (src9027.type !== Syntax8442.Literal) {
                throwError8503({}, Messages8444.InvalidModuleSpecifier);
            }
            break;
    }
    consumeSemicolon8512();
    return markerApply8501(marker9029, delegate8458.createModuleDeclaration(id9026, src9027, body9028));
}
function parseExportBatchSpecifier8552() {
    var marker9030 = markerCreate8499();
    expect8506("*");
    return markerApply8501(marker9030, delegate8458.createExportBatchSpecifier());
}
function parseExportSpecifier8553() {
    var id9031,
        name9032 = null,
        marker9033 = markerCreate8499();
    id9031 = parseVariableIdentifier8546();
    if (matchContextualKeyword8510("as")) {
        lex8496();
        name9032 = parseNonComputedProperty8527();
    }
    return markerApply8501(marker9033, delegate8458.createExportSpecifier(id9031, name9032));
}
function parseExportDeclaration8554() {
    var previousAllowKeyword9034,
        decl9035,
        def9036,
        src9037,
        specifiers9038,
        marker9039 = markerCreate8499();
    expectKeyword8507("export");
    if (lookahead8461.type === Token8439.Keyword) {
        switch (lookahead8461.value) {
            case "let":
            case "const":
            case "var":
            case "class":
            case "function":
                return markerApply8501(marker9039, delegate8458.createExportDeclaration(parseSourceElement8589(), null, null));
        }
    }
    if (isIdentifierName8493(lookahead8461)) {
        previousAllowKeyword9034 = state8463.allowKeyword;
        state8463.allowKeyword = true;
        decl9035 = parseVariableDeclarationList8548("let");
        state8463.allowKeyword = previousAllowKeyword9034;
        return markerApply8501(marker9039, delegate8458.createExportDeclaration(decl9035, null, null));
    }
    specifiers9038 = [];
    src9037 = null;
    if (match8508("*")) {
        specifiers9038.push(parseExportBatchSpecifier8552());
    } else {
        expect8506("{");
        do {
            specifiers9038.push(parseExportSpecifier8553());
        } while (match8508(",") && lex8496());
        expect8506("}");
    }
    if (matchContextualKeyword8510("from")) {
        lex8496();
        src9037 = parsePrimaryExpression8524();
        if (src9037.type !== Syntax8442.Literal) {
            throwError8503({}, Messages8444.InvalidModuleSpecifier);
        }
    }
    consumeSemicolon8512();
    return markerApply8501(marker9039, delegate8458.createExportDeclaration(null, specifiers9038, src9037));
}
function parseImportDeclaration8555() {
    var specifiers9040,
        kind9041,
        src9042,
        marker9043 = markerCreate8499();
    expectKeyword8507("import");
    specifiers9040 = [];
    if (isIdentifierName8493(lookahead8461)) {
        kind9041 = "default";
        specifiers9040.push(parseImportSpecifier8556());
        if (!matchContextualKeyword8510("from")) {
            throwError8503({}, Messages8444.NoFromAfterImport);
        }
        lex8496();
    } else if (match8508("{")) {
        kind9041 = "named";
        lex8496();
        do {
            specifiers9040.push(parseImportSpecifier8556());
        } while (match8508(",") && lex8496());
        expect8506("}");
        if (!matchContextualKeyword8510("from")) {
            throwError8503({}, Messages8444.NoFromAfterImport);
        }
        lex8496();
    }
    src9042 = parsePrimaryExpression8524();
    if (src9042.type !== Syntax8442.Literal) {
        throwError8503({}, Messages8444.InvalidModuleSpecifier);
    }
    consumeSemicolon8512();
    return markerApply8501(marker9043, delegate8458.createImportDeclaration(specifiers9040, kind9041, src9042));
}
function parseImportSpecifier8556() {
    var id9044,
        name9045 = null,
        marker9046 = markerCreate8499();
    id9044 = parseNonComputedProperty8527(true);
    if (matchContextualKeyword8510("as")) {
        lex8496();
        name9045 = parseVariableIdentifier8546();
    }
    return markerApply8501(marker9046, delegate8458.createImportSpecifier(id9044, name9045));
}
function parseEmptyStatement8557() {
    var marker9047 = markerCreate8499();
    expect8506(";");
    return markerApply8501(marker9047, delegate8458.createEmptyStatement());
}
function parseExpressionStatement8558() {
    var marker9048 = markerCreate8499(),
        expr9049 = parseExpression8543();
    consumeSemicolon8512();
    return markerApply8501(marker9048, delegate8458.createExpressionStatement(expr9049));
}
function parseIfStatement8559() {
    var test9050,
        consequent9051,
        alternate9052,
        marker9053 = markerCreate8499();
    expectKeyword8507("if");
    expect8506("(");
    test9050 = parseExpression8543();
    expect8506(")");
    consequent9051 = parseStatement8574();
    if (matchKeyword8509("else")) {
        lex8496();
        alternate9052 = parseStatement8574();
    } else {
        alternate9052 = null;
    }
    return markerApply8501(marker9053, delegate8458.createIfStatement(test9050, consequent9051, alternate9052));
}
function parseDoWhileStatement8560() {
    var body9054,
        test9055,
        oldInIteration9056,
        marker9057 = markerCreate8499();
    expectKeyword8507("do");
    oldInIteration9056 = state8463.inIteration;
    state8463.inIteration = true;
    body9054 = parseStatement8574();
    state8463.inIteration = oldInIteration9056;
    expectKeyword8507("while");
    expect8506("(");
    test9055 = parseExpression8543();
    expect8506(")");
    if (match8508(";")) {
        lex8496();
    }
    return markerApply8501(marker9057, delegate8458.createDoWhileStatement(body9054, test9055));
}
function parseWhileStatement8561() {
    var test9058,
        body9059,
        oldInIteration9060,
        marker9061 = markerCreate8499();
    expectKeyword8507("while");
    expect8506("(");
    test9058 = parseExpression8543();
    expect8506(")");
    oldInIteration9060 = state8463.inIteration;
    state8463.inIteration = true;
    body9059 = parseStatement8574();
    state8463.inIteration = oldInIteration9060;
    return markerApply8501(marker9061, delegate8458.createWhileStatement(test9058, body9059));
}
function parseForVariableDeclaration8562() {
    var marker9062 = markerCreate8499(),
        token9063 = lex8496(),
        declarations9064 = parseVariableDeclarationList8548();
    return markerApply8501(marker9062, delegate8458.createVariableDeclaration(declarations9064, token9063.value));
}
function parseForStatement8563(opts9065) {
    var init9066,
        test9067,
        update9068,
        left9069,
        right9070,
        body9071,
        operator9072,
        oldInIteration9073,
        marker9074 = markerCreate8499();
    init9066 = test9067 = update9068 = null;
    expectKeyword8507("for");
    if ( // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
    matchContextualKeyword8510("each")) {
        throwError8503({}, Messages8444.EachNotAllowed);
    }
    expect8506("(");
    if (match8508(";")) {
        lex8496();
    } else {
        if (matchKeyword8509("var") || matchKeyword8509("let") || matchKeyword8509("const")) {
            state8463.allowIn = false;
            init9066 = parseForVariableDeclaration8562();
            state8463.allowIn = true;
            if (init9066.declarations.length === 1) {
                if (matchKeyword8509("in") || matchContextualKeyword8510("of")) {
                    operator9072 = lookahead8461;
                    if (!((operator9072.value === "in" || init9066.kind !== "var") && init9066.declarations[0].init)) {
                        lex8496();
                        left9069 = init9066;
                        right9070 = parseExpression8543();
                        init9066 = null;
                    }
                }
            }
        } else {
            state8463.allowIn = false;
            init9066 = parseExpression8543();
            state8463.allowIn = true;
            if (matchContextualKeyword8510("of")) {
                operator9072 = lex8496();
                left9069 = init9066;
                right9070 = parseExpression8543();
                init9066 = null;
            } else if (matchKeyword8509("in")) {
                if ( // LeftHandSideExpression
                !isAssignableLeftHandSide8514(init9066)) {
                    throwError8503({}, Messages8444.InvalidLHSInForIn);
                }
                operator9072 = lex8496();
                left9069 = init9066;
                right9070 = parseExpression8543();
                init9066 = null;
            }
        }
        if (typeof left9069 === "undefined") {
            expect8506(";");
        }
    }
    if (typeof left9069 === "undefined") {
        if (!match8508(";")) {
            test9067 = parseExpression8543();
        }
        expect8506(";");
        if (!match8508(")")) {
            update9068 = parseExpression8543();
        }
    }
    expect8506(")");
    oldInIteration9073 = state8463.inIteration;
    state8463.inIteration = true;
    if (!(opts9065 !== undefined && opts9065.ignoreBody)) {
        body9071 = parseStatement8574();
    }
    state8463.inIteration = oldInIteration9073;
    if (typeof left9069 === "undefined") {
        return markerApply8501(marker9074, delegate8458.createForStatement(init9066, test9067, update9068, body9071));
    }
    if (operator9072.value === "in") {
        return markerApply8501(marker9074, delegate8458.createForInStatement(left9069, right9070, body9071));
    }
    return markerApply8501(marker9074, delegate8458.createForOfStatement(left9069, right9070, body9071));
}
function parseContinueStatement8564() {
    var label9075 = null,
        key9076,
        marker9077 = markerCreate8499();
    expectKeyword8507("continue");
    if ( // Optimize the most common form: 'continue;'.
    lookahead8461.value.charCodeAt(0) === 59) {
        lex8496();
        if (!state8463.inIteration) {
            throwError8503({}, Messages8444.IllegalContinue);
        }
        return markerApply8501(marker9077, delegate8458.createContinueStatement(null));
    }
    if (peekLineTerminator8502()) {
        if (!state8463.inIteration) {
            throwError8503({}, Messages8444.IllegalContinue);
        }
        return markerApply8501(marker9077, delegate8458.createContinueStatement(null));
    }
    if (lookahead8461.type === Token8439.Identifier) {
        label9075 = parseVariableIdentifier8546();
        key9076 = "$" + label9075.name;
        if (!Object.prototype.hasOwnProperty.call(state8463.labelSet, key9076)) {
            throwError8503({}, Messages8444.UnknownLabel, label9075.name);
        }
    }
    consumeSemicolon8512();
    if (label9075 === null && !state8463.inIteration) {
        throwError8503({}, Messages8444.IllegalContinue);
    }
    return markerApply8501(marker9077, delegate8458.createContinueStatement(label9075));
}
function parseBreakStatement8565() {
    var label9078 = null,
        key9079,
        marker9080 = markerCreate8499();
    expectKeyword8507("break");
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    lookahead8461.value.charCodeAt(0) === 59) {
        lex8496();
        if (!(state8463.inIteration || state8463.inSwitch)) {
            throwError8503({}, Messages8444.IllegalBreak);
        }
        return markerApply8501(marker9080, delegate8458.createBreakStatement(null));
    }
    if (peekLineTerminator8502()) {
        if (!(state8463.inIteration || state8463.inSwitch)) {
            throwError8503({}, Messages8444.IllegalBreak);
        }
        return markerApply8501(marker9080, delegate8458.createBreakStatement(null));
    }
    if (lookahead8461.type === Token8439.Identifier) {
        label9078 = parseVariableIdentifier8546();
        key9079 = "$" + label9078.name;
        if (!Object.prototype.hasOwnProperty.call(state8463.labelSet, key9079)) {
            throwError8503({}, Messages8444.UnknownLabel, label9078.name);
        }
    }
    consumeSemicolon8512();
    if (label9078 === null && !(state8463.inIteration || state8463.inSwitch)) {
        throwError8503({}, Messages8444.IllegalBreak);
    }
    return markerApply8501(marker9080, delegate8458.createBreakStatement(label9078));
}
function parseReturnStatement8566() {
    var argument9081 = null,
        marker9082 = markerCreate8499();
    expectKeyword8507("return");
    if (!state8463.inFunctionBody) {
        throwErrorTolerant8504({}, Messages8444.IllegalReturn);
    }
    if ( // 'return' followed by a space and an identifier is very common.
    isIdentifierStart8473(String(lookahead8461.value).charCodeAt(0))) {
        argument9081 = parseExpression8543();
        consumeSemicolon8512();
        return markerApply8501(marker9082, delegate8458.createReturnStatement(argument9081));
    }
    if (peekLineTerminator8502()) {
        return markerApply8501(marker9082, delegate8458.createReturnStatement(null));
    }
    if (!match8508(";")) {
        if (!match8508("}") && lookahead8461.type !== Token8439.EOF) {
            argument9081 = parseExpression8543();
        }
    }
    consumeSemicolon8512();
    return markerApply8501(marker9082, delegate8458.createReturnStatement(argument9081));
}
function parseWithStatement8567() {
    var object9083,
        body9084,
        marker9085 = markerCreate8499();
    if (strict8449) {
        throwErrorTolerant8504({}, Messages8444.StrictModeWith);
    }
    expectKeyword8507("with");
    expect8506("(");
    object9083 = parseExpression8543();
    expect8506(")");
    body9084 = parseStatement8574();
    return markerApply8501(marker9085, delegate8458.createWithStatement(object9083, body9084));
}
function parseSwitchCase8568() {
    var test9086,
        consequent9087 = [],
        sourceElement9088,
        marker9089 = markerCreate8499();
    if (matchKeyword8509("default")) {
        lex8496();
        test9086 = null;
    } else {
        expectKeyword8507("case");
        test9086 = parseExpression8543();
    }
    expect8506(":");
    while (streamIndex8460 < length8457) {
        if (match8508("}") || matchKeyword8509("default") || matchKeyword8509("case")) {
            break;
        }
        sourceElement9088 = parseSourceElement8589();
        if (typeof sourceElement9088 === "undefined") {
            break;
        }
        consequent9087.push(sourceElement9088);
    }
    return markerApply8501(marker9089, delegate8458.createSwitchCase(test9086, consequent9087));
}
function parseSwitchStatement8569() {
    var discriminant9090,
        cases9091,
        clause9092,
        oldInSwitch9093,
        defaultFound9094,
        marker9095 = markerCreate8499();
    expectKeyword8507("switch");
    expect8506("(");
    discriminant9090 = parseExpression8543();
    expect8506(")");
    expect8506("{");
    cases9091 = [];
    if (match8508("}")) {
        lex8496();
        return markerApply8501(marker9095, delegate8458.createSwitchStatement(discriminant9090, cases9091));
    }
    oldInSwitch9093 = state8463.inSwitch;
    state8463.inSwitch = true;
    defaultFound9094 = false;
    while (streamIndex8460 < length8457) {
        if (match8508("}")) {
            break;
        }
        clause9092 = parseSwitchCase8568();
        if (clause9092.test === null) {
            if (defaultFound9094) {
                throwError8503({}, Messages8444.MultipleDefaultsInSwitch);
            }
            defaultFound9094 = true;
        }
        cases9091.push(clause9092);
    }
    state8463.inSwitch = oldInSwitch9093;
    expect8506("}");
    return markerApply8501(marker9095, delegate8458.createSwitchStatement(discriminant9090, cases9091));
}
function parseThrowStatement8570() {
    var argument9096,
        marker9097 = markerCreate8499();
    expectKeyword8507("throw");
    if (peekLineTerminator8502()) {
        throwError8503({}, Messages8444.NewlineAfterThrow);
    }
    argument9096 = parseExpression8543();
    consumeSemicolon8512();
    return markerApply8501(marker9097, delegate8458.createThrowStatement(argument9096));
}
function parseCatchClause8571() {
    var param9098,
        body9099,
        marker9100 = markerCreate8499();
    expectKeyword8507("catch");
    expect8506("(");
    if (match8508(")")) {
        throwUnexpected8505(lookahead8461);
    }
    param9098 = parseExpression8543();
    if ( // 12.14.1
    strict8449 && param9098.type === Syntax8442.Identifier && isRestrictedWord8477(param9098.name)) {
        throwErrorTolerant8504({}, Messages8444.StrictCatchVariable);
    }
    expect8506(")");
    body9099 = parseBlock8545();
    return markerApply8501(marker9100, delegate8458.createCatchClause(param9098, body9099));
}
function parseTryStatement8572() {
    var block9101,
        handlers9102 = [],
        finalizer9103 = null,
        marker9104 = markerCreate8499();
    expectKeyword8507("try");
    block9101 = parseBlock8545();
    if (matchKeyword8509("catch")) {
        handlers9102.push(parseCatchClause8571());
    }
    if (matchKeyword8509("finally")) {
        lex8496();
        finalizer9103 = parseBlock8545();
    }
    if (handlers9102.length === 0 && !finalizer9103) {
        throwError8503({}, Messages8444.NoCatchOrFinally);
    }
    return markerApply8501(marker9104, delegate8458.createTryStatement(block9101, [], handlers9102, finalizer9103));
}
function parseDebuggerStatement8573() {
    var marker9105 = markerCreate8499();
    expectKeyword8507("debugger");
    consumeSemicolon8512();
    return markerApply8501(marker9105, delegate8458.createDebuggerStatement());
}
function parseStatement8574() {
    var type9106 = lookahead8461.type,
        marker9107,
        expr9108,
        labeledBody9109,
        key9110;
    if (type9106 === Token8439.EOF) {
        throwUnexpected8505(lookahead8461);
    }
    if (type9106 === Token8439.Punctuator) {
        switch (lookahead8461.value) {
            case ";":
                return parseEmptyStatement8557();
            case "{":
                return parseBlock8545();
            case "(":
                return parseExpressionStatement8558();
            default:
                break;
        }
    }
    if (type9106 === Token8439.Keyword) {
        switch (lookahead8461.value) {
            case "break":
                return parseBreakStatement8565();
            case "continue":
                return parseContinueStatement8564();
            case "debugger":
                return parseDebuggerStatement8573();
            case "do":
                return parseDoWhileStatement8560();
            case "for":
                return parseForStatement8563();
            case "function":
                return parseFunctionDeclaration8580();
            case "class":
                return parseClassDeclaration8587();
            case "if":
                return parseIfStatement8559();
            case "return":
                return parseReturnStatement8566();
            case "switch":
                return parseSwitchStatement8569();
            case "throw":
                return parseThrowStatement8570();
            case "try":
                return parseTryStatement8572();
            case "var":
                return parseVariableStatement8549();
            case "while":
                return parseWhileStatement8561();
            case "with":
                return parseWithStatement8567();
            default:
                break;
        }
    }
    marker9107 = markerCreate8499();
    expr9108 = parseExpression8543();
    if ( // 12.12 Labelled Statements
    expr9108.type === Syntax8442.Identifier && match8508(":")) {
        lex8496();
        key9110 = "$" + expr9108.name;
        if (Object.prototype.hasOwnProperty.call(state8463.labelSet, key9110)) {
            throwError8503({}, Messages8444.Redeclaration, "Label", expr9108.name);
        }
        state8463.labelSet[key9110] = true;
        labeledBody9109 = parseStatement8574();
        delete state8463.labelSet[key9110];
        return markerApply8501(marker9107, delegate8458.createLabeledStatement(expr9108, labeledBody9109));
    }
    consumeSemicolon8512();
    return markerApply8501(marker9107, delegate8458.createExpressionStatement(expr9108));
}
function parseConciseBody8575() {
    if (match8508("{")) {
        return parseFunctionSourceElements8576();
    }
    return parseAssignmentExpression8542();
}
function parseFunctionSourceElements8576() {
    var sourceElement9111,
        sourceElements9112 = [],
        token9113,
        directive9114,
        firstRestricted9115,
        oldLabelSet9116,
        oldInIteration9117,
        oldInSwitch9118,
        oldInFunctionBody9119,
        oldParenthesizedCount9120,
        marker9121 = markerCreate8499();
    expect8506("{");
    while (streamIndex8460 < length8457) {
        if (lookahead8461.type !== Token8439.StringLiteral) {
            break;
        }
        token9113 = lookahead8461;
        sourceElement9111 = parseSourceElement8589();
        sourceElements9112.push(sourceElement9111);
        if (sourceElement9111.expression.type !== Syntax8442.Literal) {
            // this is not directive
            break;
        }
        directive9114 = token9113.value;
        if (directive9114 === "use strict") {
            strict8449 = true;
            if (firstRestricted9115) {
                throwErrorTolerant8504(firstRestricted9115, Messages8444.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9115 && token9113.octal) {
                firstRestricted9115 = token9113;
            }
        }
    }
    oldLabelSet9116 = state8463.labelSet;
    oldInIteration9117 = state8463.inIteration;
    oldInSwitch9118 = state8463.inSwitch;
    oldInFunctionBody9119 = state8463.inFunctionBody;
    oldParenthesizedCount9120 = state8463.parenthesizedCount;
    state8463.labelSet = {};
    state8463.inIteration = false;
    state8463.inSwitch = false;
    state8463.inFunctionBody = true;
    state8463.parenthesizedCount = 0;
    while (streamIndex8460 < length8457) {
        if (match8508("}")) {
            break;
        }
        sourceElement9111 = parseSourceElement8589();
        if (typeof sourceElement9111 === "undefined") {
            break;
        }
        sourceElements9112.push(sourceElement9111);
    }
    expect8506("}");
    state8463.labelSet = oldLabelSet9116;
    state8463.inIteration = oldInIteration9117;
    state8463.inSwitch = oldInSwitch9118;
    state8463.inFunctionBody = oldInFunctionBody9119;
    state8463.parenthesizedCount = oldParenthesizedCount9120;
    return markerApply8501(marker9121, delegate8458.createBlockStatement(sourceElements9112));
}
function validateParam8577(options9122, param9123, name9124) {
    var key9125 = "$" + name9124;
    if (strict8449) {
        if (isRestrictedWord8477(name9124)) {
            options9122.stricted = param9123;
            options9122.message = Messages8444.StrictParamName;
        }
        if (Object.prototype.hasOwnProperty.call(options9122.paramSet, key9125)) {
            options9122.stricted = param9123;
            options9122.message = Messages8444.StrictParamDupe;
        }
    } else if (!options9122.firstRestricted) {
        if (isRestrictedWord8477(name9124)) {
            options9122.firstRestricted = param9123;
            options9122.message = Messages8444.StrictParamName;
        } else if (isStrictModeReservedWord8476(name9124)) {
            options9122.firstRestricted = param9123;
            options9122.message = Messages8444.StrictReservedWord;
        } else if (Object.prototype.hasOwnProperty.call(options9122.paramSet, key9125)) {
            options9122.firstRestricted = param9123;
            options9122.message = Messages8444.StrictParamDupe;
        }
    }
    options9122.paramSet[key9125] = true;
}
function parseParam8578(options9126) {
    var token9127, rest9128, param9129, def9130;
    token9127 = lookahead8461;
    if (token9127.value === "...") {
        token9127 = lex8496();
        rest9128 = true;
    }
    if (match8508("[")) {
        param9129 = parseArrayInitialiser8515();
        reinterpretAsDestructuredParameter8539(options9126, param9129);
    } else if (match8508("{")) {
        if (rest9128) {
            throwError8503({}, Messages8444.ObjectPatternAsRestParameter);
        }
        param9129 = parseObjectInitialiser8520();
        reinterpretAsDestructuredParameter8539(options9126, param9129);
    } else {
        param9129 = parseVariableIdentifier8546();
        validateParam8577(options9126, token9127, token9127.value);
    }
    if (match8508("=")) {
        if (rest9128) {
            throwErrorTolerant8504(lookahead8461, Messages8444.DefaultRestParameter);
        }
        lex8496();
        def9130 = parseAssignmentExpression8542();
        ++options9126.defaultCount;
    }
    if (rest9128) {
        if (!match8508(")")) {
            throwError8503({}, Messages8444.ParameterAfterRestParameter);
        }
        options9126.rest = param9129;
        return false;
    }
    options9126.params.push(param9129);
    options9126.defaults.push(def9130);
    return !match8508(")");
}
function parseParams8579(firstRestricted9131) {
    var options9132;
    options9132 = {
        params: [],
        defaultCount: 0,
        defaults: [],
        rest: null,
        firstRestricted: firstRestricted9131
    };
    expect8506("(");
    if (!match8508(")")) {
        options9132.paramSet = {};
        while (streamIndex8460 < length8457) {
            if (!parseParam8578(options9132)) {
                break;
            }
            expect8506(",");
        }
    }
    expect8506(")");
    if (options9132.defaultCount === 0) {
        options9132.defaults = [];
    }
    return options9132;
}
function parseFunctionDeclaration8580() {
    var id9133,
        body9134,
        token9135,
        tmp9136,
        firstRestricted9137,
        message9138,
        previousStrict9139,
        previousYieldAllowed9140,
        generator9141,
        marker9142 = markerCreate8499();
    expectKeyword8507("function");
    generator9141 = false;
    if (match8508("*")) {
        lex8496();
        generator9141 = true;
    }
    token9135 = lookahead8461;
    id9133 = parseVariableIdentifier8546();
    if (strict8449) {
        if (isRestrictedWord8477(token9135.value)) {
            throwErrorTolerant8504(token9135, Messages8444.StrictFunctionName);
        }
    } else {
        if (isRestrictedWord8477(token9135.value)) {
            firstRestricted9137 = token9135;
            message9138 = Messages8444.StrictFunctionName;
        } else if (isStrictModeReservedWord8476(token9135.value)) {
            firstRestricted9137 = token9135;
            message9138 = Messages8444.StrictReservedWord;
        }
    }
    tmp9136 = parseParams8579(firstRestricted9137);
    firstRestricted9137 = tmp9136.firstRestricted;
    if (tmp9136.message) {
        message9138 = tmp9136.message;
    }
    previousStrict9139 = strict8449;
    previousYieldAllowed9140 = state8463.yieldAllowed;
    state8463.yieldAllowed = generator9141;
    body9134 = parseFunctionSourceElements8576();
    if (strict8449 && firstRestricted9137) {
        throwError8503(firstRestricted9137, message9138);
    }
    if (strict8449 && tmp9136.stricted) {
        throwErrorTolerant8504(tmp9136.stricted, message9138);
    }
    strict8449 = previousStrict9139;
    state8463.yieldAllowed = previousYieldAllowed9140;
    return markerApply8501(marker9142, delegate8458.createFunctionDeclaration(id9133, tmp9136.params, tmp9136.defaults, body9134, tmp9136.rest, generator9141, false));
}
function parseFunctionExpression8581() {
    var token9143,
        id9144 = null,
        firstRestricted9145,
        message9146,
        tmp9147,
        body9148,
        previousStrict9149,
        previousYieldAllowed9150,
        generator9151,
        marker9152 = markerCreate8499();
    expectKeyword8507("function");
    generator9151 = false;
    if (match8508("*")) {
        lex8496();
        generator9151 = true;
    }
    if (!match8508("(")) {
        token9143 = lookahead8461;
        id9144 = parseVariableIdentifier8546();
        if (strict8449) {
            if (isRestrictedWord8477(token9143.value)) {
                throwErrorTolerant8504(token9143, Messages8444.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord8477(token9143.value)) {
                firstRestricted9145 = token9143;
                message9146 = Messages8444.StrictFunctionName;
            } else if (isStrictModeReservedWord8476(token9143.value)) {
                firstRestricted9145 = token9143;
                message9146 = Messages8444.StrictReservedWord;
            }
        }
    }
    tmp9147 = parseParams8579(firstRestricted9145);
    firstRestricted9145 = tmp9147.firstRestricted;
    if (tmp9147.message) {
        message9146 = tmp9147.message;
    }
    previousStrict9149 = strict8449;
    previousYieldAllowed9150 = state8463.yieldAllowed;
    state8463.yieldAllowed = generator9151;
    body9148 = parseFunctionSourceElements8576();
    if (strict8449 && firstRestricted9145) {
        throwError8503(firstRestricted9145, message9146);
    }
    if (strict8449 && tmp9147.stricted) {
        throwErrorTolerant8504(tmp9147.stricted, message9146);
    }
    strict8449 = previousStrict9149;
    state8463.yieldAllowed = previousYieldAllowed9150;
    return markerApply8501(marker9152, delegate8458.createFunctionExpression(id9144, tmp9147.params, tmp9147.defaults, body9148, tmp9147.rest, generator9151, false));
}
function parseYieldExpression8582() {
    var yieldToken9153,
        delegateFlag9154,
        expr9155,
        marker9156 = markerCreate8499();
    yieldToken9153 = lex8496();
    assert8466(yieldToken9153.value === "yield", "Called parseYieldExpression with non-yield lookahead.");
    if (!state8463.yieldAllowed) {
        throwErrorTolerant8504({}, Messages8444.IllegalYield);
    }
    delegateFlag9154 = false;
    if (match8508("*")) {
        lex8496();
        delegateFlag9154 = true;
    }
    expr9155 = parseAssignmentExpression8542();
    return markerApply8501(marker9156, delegate8458.createYieldExpression(expr9155, delegateFlag9154));
}
function parseMethodDefinition8583(existingPropNames9157) {
    var token9158,
        key9159,
        param9160,
        propType9161,
        isValidDuplicateProp9162 = false,
        marker9163 = markerCreate8499();
    if (lookahead8461.value === "static") {
        propType9161 = ClassPropertyType8447["static"];
        lex8496();
    } else {
        propType9161 = ClassPropertyType8447.prototype;
    }
    if (match8508("*")) {
        lex8496();
        return markerApply8501(marker9163, delegate8458.createMethodDefinition(propType9161, "", parseObjectPropertyKey8518(), parsePropertyMethodFunction8517({ generator: true })));
    }
    token9158 = lookahead8461;
    key9159 = parseObjectPropertyKey8518();
    if (token9158.value === "get" && !match8508("(")) {
        key9159 = parseObjectPropertyKey8518();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a setter
        existingPropNames9157[propType9161].hasOwnProperty(key9159.name)) {
            isValidDuplicateProp9162 = // There isn't already a getter for this prop
            existingPropNames9157[propType9161][key9159.name].get === undefined && // There isn't already a data prop by this name
            existingPropNames9157[propType9161][key9159.name].data === undefined && // The only existing prop by this name is a setter
            existingPropNames9157[propType9161][key9159.name].set !== undefined;
            if (!isValidDuplicateProp9162) {
                throwError8503(key9159, Messages8444.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9157[propType9161][key9159.name] = {};
        }
        existingPropNames9157[propType9161][key9159.name].get = true;
        expect8506("(");
        expect8506(")");
        return markerApply8501(marker9163, delegate8458.createMethodDefinition(propType9161, "get", key9159, parsePropertyFunction8516({ generator: false })));
    }
    if (token9158.value === "set" && !match8508("(")) {
        key9159 = parseObjectPropertyKey8518();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a getter
        existingPropNames9157[propType9161].hasOwnProperty(key9159.name)) {
            isValidDuplicateProp9162 = // There isn't already a setter for this prop
            existingPropNames9157[propType9161][key9159.name].set === undefined && // There isn't already a data prop by this name
            existingPropNames9157[propType9161][key9159.name].data === undefined && // The only existing prop by this name is a getter
            existingPropNames9157[propType9161][key9159.name].get !== undefined;
            if (!isValidDuplicateProp9162) {
                throwError8503(key9159, Messages8444.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9157[propType9161][key9159.name] = {};
        }
        existingPropNames9157[propType9161][key9159.name].set = true;
        expect8506("(");
        token9158 = lookahead8461;
        param9160 = [parseVariableIdentifier8546()];
        expect8506(")");
        return markerApply8501(marker9163, delegate8458.createMethodDefinition(propType9161, "set", key9159, parsePropertyFunction8516({
            params: param9160,
            generator: false,
            name: token9158
        })));
    }
    if ( // It is a syntax error if any other properties have the same name as a
    // non-getter, non-setter method
    existingPropNames9157[propType9161].hasOwnProperty(key9159.name)) {
        throwError8503(key9159, Messages8444.IllegalDuplicateClassProperty);
    } else {
        existingPropNames9157[propType9161][key9159.name] = {};
    }
    existingPropNames9157[propType9161][key9159.name].data = true;
    return markerApply8501(marker9163, delegate8458.createMethodDefinition(propType9161, "", key9159, parsePropertyMethodFunction8517({ generator: false })));
}
function parseClassElement8584(existingProps9164) {
    if (match8508(";")) {
        lex8496();
        return;
    }
    return parseMethodDefinition8583(existingProps9164);
}
function parseClassBody8585() {
    var classElement9165,
        classElements9166 = [],
        existingProps9167 = {},
        marker9168 = markerCreate8499();
    existingProps9167[ClassPropertyType8447["static"]] = {};
    existingProps9167[ClassPropertyType8447.prototype] = {};
    expect8506("{");
    while (streamIndex8460 < length8457) {
        if (match8508("}")) {
            break;
        }
        classElement9165 = parseClassElement8584(existingProps9167);
        if (typeof classElement9165 !== "undefined") {
            classElements9166.push(classElement9165);
        }
    }
    expect8506("}");
    return markerApply8501(marker9168, delegate8458.createClassBody(classElements9166));
}
function parseClassExpression8586() {
    var id9169,
        previousYieldAllowed9170,
        superClass9171 = null,
        marker9172 = markerCreate8499();
    expectKeyword8507("class");
    if (!matchKeyword8509("extends") && !match8508("{")) {
        id9169 = parseVariableIdentifier8546();
    }
    if (matchKeyword8509("extends")) {
        expectKeyword8507("extends");
        previousYieldAllowed9170 = state8463.yieldAllowed;
        state8463.yieldAllowed = false;
        superClass9171 = parseAssignmentExpression8542();
        state8463.yieldAllowed = previousYieldAllowed9170;
    }
    return markerApply8501(marker9172, delegate8458.createClassExpression(id9169, superClass9171, parseClassBody8585()));
}
function parseClassDeclaration8587() {
    var id9173,
        previousYieldAllowed9174,
        superClass9175 = null,
        marker9176 = markerCreate8499();
    expectKeyword8507("class");
    id9173 = parseVariableIdentifier8546();
    if (matchKeyword8509("extends")) {
        expectKeyword8507("extends");
        previousYieldAllowed9174 = state8463.yieldAllowed;
        state8463.yieldAllowed = false;
        superClass9175 = parseAssignmentExpression8542();
        state8463.yieldAllowed = previousYieldAllowed9174;
    }
    return markerApply8501(marker9176, delegate8458.createClassDeclaration(id9173, superClass9175, parseClassBody8585()));
}
function matchModuleDeclaration8588() {
    var id9177;
    if (matchContextualKeyword8510("module")) {
        id9177 = lookahead28498();
        return id9177.type === Token8439.StringLiteral || id9177.type === Token8439.Identifier;
    }
    return false;
}
function parseSourceElement8589() {
    if (lookahead8461.type === Token8439.Keyword) {
        switch (lookahead8461.value) {
            case "const":
            case "let":
                return parseConstLetDeclaration8550(lookahead8461.value);
            case "function":
                return parseFunctionDeclaration8580();
            case "export":
                return parseExportDeclaration8554();
            case "import":
                return parseImportDeclaration8555();
            default:
                return parseStatement8574();
        }
    }
    if (matchModuleDeclaration8588()) {
        throwError8503({}, Messages8444.NestedModule);
    }
    if (lookahead8461.type !== Token8439.EOF) {
        return parseStatement8574();
    }
}
function parseProgramElement8590() {
    if (lookahead8461.type === Token8439.Keyword) {
        switch (lookahead8461.value) {
            case "export":
                return parseExportDeclaration8554();
            case "import":
                return parseImportDeclaration8555();
        }
    }
    if (matchModuleDeclaration8588()) {
        return parseModuleDeclaration8551();
    }
    return parseSourceElement8589();
}
function parseProgramElements8591() {
    var sourceElement9178,
        sourceElements9179 = [],
        token9180,
        directive9181,
        firstRestricted9182;
    while (streamIndex8460 < length8457) {
        token9180 = lookahead8461;
        if (token9180.type !== Token8439.StringLiteral) {
            break;
        }
        sourceElement9178 = parseProgramElement8590();
        sourceElements9179.push(sourceElement9178);
        if (sourceElement9178.expression.type !== Syntax8442.Literal) {
            // this is not directive
            break;
        }
        directive9181 = token9180.value;
        if (directive9181 === "use strict") {
            strict8449 = true;
            if (firstRestricted9182) {
                throwErrorTolerant8504(firstRestricted9182, Messages8444.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9182 && token9180.octal) {
                firstRestricted9182 = token9180;
            }
        }
    }
    while (streamIndex8460 < length8457) {
        sourceElement9178 = parseProgramElement8590();
        if (typeof sourceElement9178 === "undefined") {
            break;
        }
        sourceElements9179.push(sourceElement9178);
    }
    return sourceElements9179;
}
function parseModuleElement8592() {
    return parseSourceElement8589();
}
function parseModuleElements8593() {
    var list9183 = [],
        statement9184;
    while (streamIndex8460 < length8457) {
        if (match8508("}")) {
            break;
        }
        statement9184 = parseModuleElement8592();
        if (typeof statement9184 === "undefined") {
            break;
        }
        list9183.push(statement9184);
    }
    return list9183;
}
function parseModuleBlock8594() {
    var block9185,
        marker9186 = markerCreate8499();
    expect8506("{");
    block9185 = parseModuleElements8593();
    expect8506("}");
    return markerApply8501(marker9186, delegate8458.createBlockStatement(block9185));
}
function parseProgram8595() {
    var body9187,
        marker9188 = markerCreate8499();
    strict8449 = false;
    peek8497();
    body9187 = parseProgramElements8591();
    return markerApply8501(marker9188, delegate8458.createProgram(body9187));
}
function addComment8596(type9189, value9190, start9191, end9192, loc9193) {
    var comment9194;
    assert8466(typeof start9191 === "number", "Comment must have valid position");
    if ( // Because the way the actual token is scanned, often the comments
    // (if any) are skipped twice during the lexical analysis.
    // Thus, we need to skip adding a comment if the comment array already
    // handled it.
    state8463.lastCommentStart >= start9191) {
        return;
    }
    state8463.lastCommentStart = start9191;
    comment9194 = {
        type: type9189,
        value: value9190
    };
    if (extra8465.range) {
        comment9194.range = [start9191, end9192];
    }
    if (extra8465.loc) {
        comment9194.loc = loc9193;
    }
    extra8465.comments.push(comment9194);
    if (extra8465.attachComment) {
        extra8465.leadingComments.push(comment9194);
        extra8465.trailingComments.push(comment9194);
    }
}
function scanComment8597() {
    var comment9195, ch9196, loc9197, start9198, blockComment9199, lineComment9200;
    comment9195 = "";
    blockComment9199 = false;
    lineComment9200 = false;
    while (index8450 < length8457) {
        ch9196 = source8448[index8450];
        if (lineComment9200) {
            ch9196 = source8448[index8450++];
            if (isLineTerminator8472(ch9196.charCodeAt(0))) {
                loc9197.end = {
                    line: lineNumber8451,
                    column: index8450 - lineStart8452 - 1
                };
                lineComment9200 = false;
                addComment8596("Line", comment9195, start9198, index8450 - 1, loc9197);
                if (ch9196 === "\r" && source8448[index8450] === "\n") {
                    ++index8450;
                }
                ++lineNumber8451;
                lineStart8452 = index8450;
                comment9195 = "";
            } else if (index8450 >= length8457) {
                lineComment9200 = false;
                comment9195 += ch9196;
                loc9197.end = {
                    line: lineNumber8451,
                    column: length8457 - lineStart8452
                };
                addComment8596("Line", comment9195, start9198, length8457, loc9197);
            } else {
                comment9195 += ch9196;
            }
        } else if (blockComment9199) {
            if (isLineTerminator8472(ch9196.charCodeAt(0))) {
                if (ch9196 === "\r" && source8448[index8450 + 1] === "\n") {
                    ++index8450;
                    comment9195 += "\r\n";
                } else {
                    comment9195 += ch9196;
                }
                ++lineNumber8451;
                ++index8450;
                lineStart8452 = index8450;
                if (index8450 >= length8457) {
                    throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch9196 = source8448[index8450++];
                if (index8450 >= length8457) {
                    throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
                }
                comment9195 += ch9196;
                if (ch9196 === "*") {
                    ch9196 = source8448[index8450];
                    if (ch9196 === "/") {
                        comment9195 = comment9195.substr(0, comment9195.length - 1);
                        blockComment9199 = false;
                        ++index8450;
                        loc9197.end = {
                            line: lineNumber8451,
                            column: index8450 - lineStart8452
                        };
                        addComment8596("Block", comment9195, start9198, index8450, loc9197);
                        comment9195 = "";
                    }
                }
            }
        } else if (ch9196 === "/") {
            ch9196 = source8448[index8450 + 1];
            if (ch9196 === "/") {
                loc9197 = {
                    start: {
                        line: lineNumber8451,
                        column: index8450 - lineStart8452
                    }
                };
                start9198 = index8450;
                index8450 += 2;
                lineComment9200 = true;
                if (index8450 >= length8457) {
                    loc9197.end = {
                        line: lineNumber8451,
                        column: index8450 - lineStart8452
                    };
                    lineComment9200 = false;
                    addComment8596("Line", comment9195, start9198, index8450, loc9197);
                }
            } else if (ch9196 === "*") {
                start9198 = index8450;
                index8450 += 2;
                blockComment9199 = true;
                loc9197 = {
                    start: {
                        line: lineNumber8451,
                        column: index8450 - lineStart8452 - 2
                    }
                };
                if (index8450 >= length8457) {
                    throwError8503({}, Messages8444.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8471(ch9196.charCodeAt(0))) {
            ++index8450;
        } else if (isLineTerminator8472(ch9196.charCodeAt(0))) {
            ++index8450;
            if (ch9196 === "\r" && source8448[index8450] === "\n") {
                ++index8450;
            }
            ++lineNumber8451;
            lineStart8452 = index8450;
        } else {
            break;
        }
    }
}
function collectToken8598() {
    var start9201, loc9202, token9203, range9204, value9205;
    skipComment8479();
    start9201 = index8450;
    loc9202 = {
        start: {
            line: lineNumber8451,
            column: index8450 - lineStart8452
        }
    };
    token9203 = extra8465.advance();
    loc9202.end = {
        line: lineNumber8451,
        column: index8450 - lineStart8452
    };
    if (token9203.type !== Token8439.EOF) {
        range9204 = [token9203.range[0], token9203.range[1]];
        value9205 = source8448.slice(token9203.range[0], token9203.range[1]);
        extra8465.tokens.push({
            type: TokenName8440[token9203.type],
            value: value9205,
            range: range9204,
            loc: loc9202
        });
    }
    return token9203;
}
function collectRegex8599() {
    var pos9206, loc9207, regex9208, token9209;
    skipComment8479();
    pos9206 = index8450;
    loc9207 = {
        start: {
            line: lineNumber8451,
            column: index8450 - lineStart8452
        }
    };
    regex9208 = extra8465.scanRegExp();
    loc9207.end = {
        line: lineNumber8451,
        column: index8450 - lineStart8452
    };
    if (!extra8465.tokenize) {
        if ( // Pop the previous token, which is likely '/' or '/='
        extra8465.tokens.length > 0) {
            token9209 = extra8465.tokens[extra8465.tokens.length - 1];
            if (token9209.range[0] === pos9206 && token9209.type === "Punctuator") {
                if (token9209.value === "/" || token9209.value === "/=") {
                    extra8465.tokens.pop();
                }
            }
        }
        extra8465.tokens.push({
            type: "RegularExpression",
            value: regex9208.literal,
            range: [pos9206, index8450],
            loc: loc9207
        });
    }
    return regex9208;
}
function filterTokenLocation8600() {
    var i9210,
        entry9211,
        token9212,
        tokens9213 = [];
    for (i9210 = 0; i9210 < extra8465.tokens.length; ++i9210) {
        entry9211 = extra8465.tokens[i9210];
        token9212 = {
            type: entry9211.type,
            value: entry9211.value
        };
        if (extra8465.range) {
            token9212.range = entry9211.range;
        }
        if (extra8465.loc) {
            token9212.loc = entry9211.loc;
        }
        tokens9213.push(token9212);
    }
    extra8465.tokens = tokens9213;
}
function patch8601() {
    if (extra8465.comments) {
        extra8465.skipComment = skipComment8479;
        skipComment8479 = scanComment8597;
    }
    if (typeof extra8465.tokens !== "undefined") {
        extra8465.advance = advance8495;
        extra8465.scanRegExp = scanRegExp8492;
        advance8495 = collectToken8598;
        scanRegExp8492 = collectRegex8599;
    }
}
function unpatch8602() {
    if (typeof extra8465.skipComment === "function") {
        skipComment8479 = extra8465.skipComment;
    }
    if (typeof extra8465.scanRegExp === "function") {
        advance8495 = extra8465.advance;
        scanRegExp8492 = extra8465.scanRegExp;
    }
}
function extend8603(object9214, properties9215) {
    var entry9216,
        result9217 = {};
    for (entry9216 in object9214) {
        if (object9214.hasOwnProperty(entry9216)) {
            result9217[entry9216] = object9214[entry9216];
        }
    }
    for (entry9216 in properties9215) {
        if (properties9215.hasOwnProperty(entry9216)) {
            result9217[entry9216] = properties9215[entry9216];
        }
    }
    return result9217;
}
function tokenize8604(code9218, options9219) {
    var toString9220, token9221, tokens9222;
    toString9220 = String;
    if (typeof code9218 !== "string" && !(code9218 instanceof String)) {
        code9218 = toString9220(code9218);
    }
    delegate8458 = SyntaxTreeDelegate8446;
    source8448 = code9218;
    index8450 = 0;
    lineNumber8451 = source8448.length > 0 ? 1 : 0;
    lineStart8452 = 0;
    length8457 = source8448.length;
    lookahead8461 = null;
    state8463 = {
        allowKeyword: true,
        allowIn: true,
        labelSet: {},
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        lastCommentStart: -1
    };
    extra8465 = {};
    // Options matching.
    options9219 = options9219 || {};
    // Of course we collect tokens here.
    options9219.tokens = true;
    extra8465.tokens = [];
    extra8465.tokenize = true;
    // The following two fields are necessary to compute the Regex tokens.
    extra8465.openParenToken = -1;
    extra8465.openCurlyToken = -1;
    extra8465.range = typeof options9219.range === "boolean" && options9219.range;
    extra8465.loc = typeof options9219.loc === "boolean" && options9219.loc;
    if (typeof options9219.comment === "boolean" && options9219.comment) {
        extra8465.comments = [];
    }
    if (typeof options9219.tolerant === "boolean" && options9219.tolerant) {
        extra8465.errors = [];
    }
    if (length8457 > 0) {
        if (typeof source8448[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9218 instanceof String) {
                source8448 = code9218.valueOf();
            }
        }
    }
    patch8601();
    try {
        peek8497();
        if (lookahead8461.type === Token8439.EOF) {
            return extra8465.tokens;
        }
        token9221 = lex8496();
        while (lookahead8461.type !== Token8439.EOF) {
            try {
                token9221 = lex8496();
            } catch (lexError9223) {
                token9221 = lookahead8461;
                if (extra8465.errors) {
                    extra8465.errors.push(lexError9223);
                    // We have to break on the first error
                    // to avoid infinite loops.
                    break;
                } else {
                    throw lexError9223;
                }
            }
        }
        filterTokenLocation8600();
        tokens9222 = extra8465.tokens;
        if (typeof extra8465.comments !== "undefined") {
            tokens9222.comments = extra8465.comments;
        }
        if (typeof extra8465.errors !== "undefined") {
            tokens9222.errors = extra8465.errors;
        }
    } catch (e9224) {
        throw e9224;
    } finally {
        unpatch8602();
        extra8465 = {};
    }
    return tokens9222;
}
function blockAllowed8605(toks9225, start9226, inExprDelim9227, parentIsBlock9228) {
    var assignOps9229 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
    var binaryOps9230 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
    var unaryOps9231 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
    function back9232(n9233) {
        var idx9234 = toks9225.length - n9233 > 0 ? toks9225.length - n9233 : 0;
        return toks9225[idx9234];
    }
    if (inExprDelim9227 && toks9225.length - (start9226 + 2) <= 0) {
        // ... ({...} ...)
        return false;
    } else if (back9232(start9226 + 2).value === ":" && parentIsBlock9228) {
        // ...{a:{b:{...}}}
        return true;
    } else if (isIn8467(back9232(start9226 + 2).value, unaryOps9231.concat(binaryOps9230).concat(assignOps9229))) {
        // ... + {...}
        return false;
    } else if (back9232(start9226 + 2).value === "return") {
        var // ASI makes `{}` a block in:
        //
        //    return
        //    { ... }
        //
        // otherwise an object literal, so it's an
        // expression and thus / is divide
        currLineNumber9235 = typeof back9232(start9226 + 1).startLineNumber !== "undefined" ? back9232(start9226 + 1).startLineNumber : back9232(start9226 + 1).lineNumber;
        if (back9232(start9226 + 2).lineNumber !== currLineNumber9235) {
            return true;
        } else {
            return false;
        }
    } else if (isIn8467(back9232(start9226 + 2).value, ["void", "typeof", "in", "case", "delete"])) {
        // ... in {}
        return false;
    } else {
        return true;
    }
}
var // Readtables
readtables8606 = {
    currentReadtable: {},
    // A readtable is invoked within `readToken`, but it can
    // return multiple tokens. We need to "queue" the stream of
    // tokens so that subsequent calls to `readToken` gets the
    // rest of the stream.
    queued: [],
    // A readtable can only override punctuators
    punctuators: ";,.:!?~=%&*+-/<>^|#@",
    has: function has(ch9236) {
        return readtables8606.currentReadtable[ch9236] && readtables8606.punctuators.indexOf(ch9236) !== -1;
    },
    getQueued: function getQueued() {
        return readtables8606.queued.length ? readtables8606.queued.shift() : null;
    },
    peekQueued: function peekQueued(lookahead9237) {
        lookahead9237 = lookahead9237 ? lookahead9237 : 1;
        return readtables8606.queued.length ? readtables8606.queued[lookahead9237 - 1] : null;
    },
    invoke: function invoke(ch9238, toks9239) {
        var prevState9240 = snapshotParserState8607();
        var newStream9241 = readtables8606.currentReadtable[ch9238](ch9238, readtables8606.readerAPI, toks9239, source8448, index8450);
        if (!newStream9241) {
            // Reset the state
            restoreParserState8608(prevState9240);
            return null;
        } else if (!Array.isArray(newStream9241)) {
            newStream9241 = [newStream9241];
        }
        this.queued = this.queued.concat(newStream9241);
        return this.getQueued();
    }
};
function snapshotParserState8607() {
    return {
        index: index8450,
        lineNumber: lineNumber8451,
        lineStart: lineStart8452
    };
}
function restoreParserState8608(prevState9242) {
    index8450 = prevState9242.index;
    lineNumber8451 = prevState9242.lineNumber;
    lineStart8452 = prevState9242.lineStart;
}
function suppressReadError8609(func9243) {
    var prevState9244 = snapshotParserState8607();
    try {
        return func9243();
    } catch (e9245) {
        if (!(e9245 instanceof SyntaxError) && !(e9245 instanceof TypeError)) {
            restoreParserState8608(prevState9244);
            return null;
        }
        throw e9245;
    }
}
function makeIdentifier8610(value9246, opts9247) {
    opts9247 = opts9247 || {};
    var type9248 = Token8439.Identifier;
    if (isKeyword8478(value9246)) {
        type9248 = Token8439.Keyword;
    } else if (value9246 === "null") {
        type9248 = Token8439.NullLiteral;
    } else if (value9246 === "true" || value9246 === "false") {
        type9248 = Token8439.BooleanLiteral;
    }
    return {
        type: type9248,
        value: value9246,
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [opts9247.start || index8450, index8450]
    };
}
function makePunctuator8611(value9249, opts9250) {
    opts9250 = opts9250 || {};
    return {
        type: Token8439.Punctuator,
        value: value9249,
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [opts9250.start || index8450, index8450]
    };
}
function makeStringLiteral8612(value9251, opts9252) {
    opts9252 = opts9252 || {};
    return {
        type: Token8439.StringLiteral,
        value: value9251,
        octal: !!opts9252.octal,
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [opts9252.start || index8450, index8450]
    };
}
function makeNumericLiteral8613(value9253, opts9254) {
    opts9254 = opts9254 || {};
    return {
        type: Token8439.NumericLiteral,
        value: value9253,
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [opts9254.start || index8450, index8450]
    };
}
function makeRegExp8614(value9255, opts9256) {
    opts9256 = opts9256 || {};
    return {
        type: Token8439.RegularExpression,
        value: value9255,
        literal: value9255.toString(),
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [opts9256.start || index8450, index8450]
    };
}
function makeDelimiter8615(value9257, inner9258) {
    var current9259 = {
        lineNumber: lineNumber8451,
        lineStart: lineStart8452,
        range: [index8450, index8450]
    };
    var firstTok9260 = inner9258.length ? inner9258[0] : current9259;
    var lastTok9261 = inner9258.length ? inner9258[inner9258.length - 1] : current9259;
    return {
        type: Token8439.Delimiter,
        value: value9257,
        inner: inner9258,
        startLineNumber: firstTok9260.lineNumber,
        startLineStart: firstTok9260.lineStart,
        startRange: firstTok9260.range,
        endLineNumber: lastTok9261.lineNumber,
        endLineStart: lastTok9261.lineStart,
        endRange: lastTok9261.range
    };
}
var // Since an actual parser object doesn't exist and we want to
// introduce our own API anyway, we create a special reader object
// for reader extensions
readerAPI8616 = Object.defineProperties({
    Token: Token8439,
    isIdentifierStart: isIdentifierStart8473,
    isIdentifierPart: isIdentifierPart8474,
    isLineTerminator: isLineTerminator8472,
    readIdentifier: scanIdentifier8484,
    readPunctuator: scanPunctuator8485,
    readStringLiteral: scanStringLiteral8489,
    readNumericLiteral: scanNumericLiteral8488,
    readRegExp: scanRegExp8492,
    readToken: function readToken() {
        return readToken8617([], false, false);
    },
    readDelimiter: function readDelimiter() {
        return readDelim8618([], false, false);
    },
    skipComment: scanComment8597,
    makeIdentifier: makeIdentifier8610,
    makePunctuator: makePunctuator8611,
    makeStringLiteral: makeStringLiteral8612,
    makeNumericLiteral: makeNumericLiteral8613,
    makeRegExp: makeRegExp8614,
    makeDelimiter: makeDelimiter8615,
    suppressReadError: suppressReadError8609,
    peekQueued: readtables8606.peekQueued,
    getQueued: readtables8606.getQueued
}, {
    source: {
        get: function () {
            return source8448;
        },
        enumerable: true,
        configurable: true
    },
    index: {
        get: function () {
            return index8450;
        },
        set: function (x) {
            index8450 = x;
        },
        enumerable: true,
        configurable: true
    },
    length: {
        get: function () {
            return length8457;
        },
        set: function (x) {
            length8457 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineNumber: {
        get: function () {
            return lineNumber8451;
        },
        set: function (x) {
            lineNumber8451 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineStart: {
        get: function () {
            return lineStart8452;
        },
        set: function (x) {
            lineStart8452 = x;
        },
        enumerable: true,
        configurable: true
    },
    extra: {
        get: function () {
            return extra8465;
        },
        enumerable: true,
        configurable: true
    }
});
readtables8606.readerAPI = readerAPI8616;
function readToken8617(toks9262, inExprDelim9263, parentIsBlock9264) {
    var delimiters9265 = ["(", "{", "["];
    var parenIdents9266 = ["if", "while", "for", "with"];
    var last9267 = toks9262.length - 1;
    var comments9268,
        commentsLen9269 = extra8465.comments.length;
    function back9270(n9276) {
        var idx9277 = toks9262.length - n9276 > 0 ? toks9262.length - n9276 : 0;
        return toks9262[idx9277];
    }
    function attachComments9271(token9278) {
        if (comments9268) {
            token9278.leadingComments = comments9268;
        }
        return token9278;
    }
    function _advance9272() {
        return attachComments9271(advance8495());
    }
    function _scanRegExp9273() {
        return attachComments9271(scanRegExp8492());
    }
    skipComment8479();
    var ch9274 = source8448[index8450];
    if (extra8465.comments.length > commentsLen9269) {
        comments9268 = extra8465.comments.slice(commentsLen9269);
    }
    if (isIn8467(source8448[index8450], delimiters9265)) {
        return attachComments9271(readDelim8618(toks9262, inExprDelim9263, parentIsBlock9264));
    }
    // Check if we should get the token from the readtable
    var readtableToken9275;
    if ((readtableToken9275 = readtables8606.getQueued()) || readtables8606.has(ch9274) && (readtableToken9275 = readtables8606.invoke(ch9274, toks9262))) {
        return readtableToken9275;
    }
    if (ch9274 === "/") {
        var prev9279 = back9270(1);
        if (prev9279) {
            if (prev9279.value === "()") {
                if (isIn8467(back9270(2).value, parenIdents9266)) {
                    // ... if (...) / ...
                    return _scanRegExp9273();
                }
                // ... (...) / ...
                return _advance9272();
            }
            if (prev9279.value === "{}") {
                if (blockAllowed8605(toks9262, 0, inExprDelim9263, parentIsBlock9264)) {
                    if (back9270(2).value === "()") {
                        if ( // named function
                        back9270(4).value === "function") {
                            if (!blockAllowed8605(toks9262, 3, inExprDelim9263, parentIsBlock9264)) {
                                // new function foo (...) {...} / ...
                                return _advance9272();
                            }
                            if (toks9262.length - 5 <= 0 && inExprDelim9263) {
                                // (function foo (...) {...} /...)
                                // [function foo (...) {...} /...]
                                return _advance9272();
                            }
                        }
                        if ( // unnamed function
                        back9270(3).value === "function") {
                            if (!blockAllowed8605(toks9262, 2, inExprDelim9263, parentIsBlock9264)) {
                                // new function (...) {...} / ...
                                return _advance9272();
                            }
                            if (toks9262.length - 4 <= 0 && inExprDelim9263) {
                                // (function (...) {...} /...)
                                // [function (...) {...} /...]
                                return _advance9272();
                            }
                        }
                    }
                    // ...; {...} /...
                    return _scanRegExp9273();
                } else {
                    // ... + {...} / ...
                    return _advance9272();
                }
            }
            if (prev9279.type === Token8439.Punctuator) {
                // ... + /...
                return _scanRegExp9273();
            }
            if (isKeyword8478(prev9279.value) && prev9279.value !== "this" && prev9279.value !== "let" && prev9279.value !== "export") {
                // typeof /...
                return _scanRegExp9273();
            }
            return _advance9272();
        }
        return _scanRegExp9273();
    }
    return _advance9272();
}
function readDelim8618(toks9280, inExprDelim9281, parentIsBlock9282) {
    var startDelim9283 = advance8495(),
        matchDelim9284 = {
        "(": ")",
        "{": "}",
        "[": "]"
    },
        inner9285 = [];
    var delimiters9286 = ["(", "{", "["];
    assert8466(delimiters9286.indexOf(startDelim9283.value) !== -1, "Need to begin at the delimiter");
    var token9287 = startDelim9283;
    var startLineNumber9288 = token9287.lineNumber;
    var startLineStart9289 = token9287.lineStart;
    var startRange9290 = token9287.range;
    var delimToken9291 = {};
    delimToken9291.type = Token8439.Delimiter;
    delimToken9291.value = startDelim9283.value + matchDelim9284[startDelim9283.value];
    delimToken9291.startLineNumber = startLineNumber9288;
    delimToken9291.startLineStart = startLineStart9289;
    delimToken9291.startRange = startRange9290;
    var delimIsBlock9292 = false;
    if (startDelim9283.value === "{") {
        delimIsBlock9292 = blockAllowed8605(toks9280.concat(delimToken9291), 0, inExprDelim9281, parentIsBlock9282);
    }
    while (index8450 <= length8457) {
        token9287 = readToken8617(inner9285, startDelim9283.value === "(" || startDelim9283.value === "[", delimIsBlock9292);
        if (token9287.type === Token8439.Punctuator && token9287.value === matchDelim9284[startDelim9283.value]) {
            if (token9287.leadingComments) {
                delimToken9291.trailingComments = token9287.leadingComments;
            }
            break;
        } else if (token9287.type === Token8439.EOF) {
            throwError8503({}, Messages8444.UnexpectedEOS);
        } else {
            inner9285.push(token9287);
        }
    }
    if ( // at the end of the stream but the very last char wasn't the closing delimiter
    index8450 >= length8457 && matchDelim9284[startDelim9283.value] !== source8448[length8457 - 1]) {
        throwError8503({}, Messages8444.UnexpectedEOS);
    }
    var endLineNumber9293 = token9287.lineNumber;
    var endLineStart9294 = token9287.lineStart;
    var endRange9295 = token9287.range;
    delimToken9291.inner = inner9285;
    delimToken9291.endLineNumber = endLineNumber9293;
    delimToken9291.endLineStart = endLineStart9294;
    delimToken9291.endRange = endRange9295;
    return delimToken9291;
}
function setReadtable8619(readtable9296, syn9297) {
    readtables8606.currentReadtable = readtable9296;
    if (syn9297) {
        readtables8606.readerAPI.throwSyntaxError = function (name9298, message9299, tok9300) {
            var sx9301 = syn9297.syntaxFromToken(tok9300);
            var err9302 = new syn9297.MacroSyntaxError(name9298, message9299, sx9301);
            throw new SyntaxError(syn9297.printSyntaxError(source8448, err9302));
        };
    }
}
function currentReadtable8620() {
    return readtables8606.currentReadtable;
}
function read8621(code9303) {
    var token9304,
        tokenTree9305 = [];
    extra8465 = {};
    extra8465.comments = [];
    extra8465.range = true;
    extra8465.loc = true;
    patch8601();
    source8448 = code9303;
    index8450 = 0;
    lineNumber8451 = source8448.length > 0 ? 1 : 0;
    lineStart8452 = 0;
    length8457 = source8448.length;
    state8463 = {
        allowIn: true,
        labelSet: {},
        lastParenthesized: null,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false
    };
    while (index8450 < length8457 || readtables8606.peekQueued()) {
        tokenTree9305.push(readToken8617(tokenTree9305, false, false));
    }
    var last9306 = tokenTree9305[tokenTree9305.length - 1];
    if (last9306 && last9306.type !== Token8439.EOF) {
        tokenTree9305.push({
            type: Token8439.EOF,
            value: "",
            lineNumber: last9306.lineNumber,
            lineStart: last9306.lineStart,
            range: [index8450, index8450]
        });
    }
    return expander8438.tokensToSyntax(tokenTree9305);
}
function parse8622(code9307, options9308) {
    var program9309, toString9310;
    extra8465 = {};
    if ( // given an array of tokens instead of a string
    Array.isArray(code9307)) {
        tokenStream8459 = code9307;
        length8457 = tokenStream8459.length;
        lineNumber8451 = tokenStream8459.length > 0 ? 1 : 0;
        source8448 = undefined;
    } else {
        toString9310 = String;
        if (typeof code9307 !== "string" && !(code9307 instanceof String)) {
            code9307 = toString9310(code9307);
        }
        source8448 = code9307;
        length8457 = source8448.length;
        lineNumber8451 = source8448.length > 0 ? 1 : 0;
    }
    delegate8458 = SyntaxTreeDelegate8446;
    streamIndex8460 = -1;
    index8450 = 0;
    lineStart8452 = 0;
    sm_lineStart8454 = 0;
    sm_lineNumber8453 = lineNumber8451;
    sm_index8456 = 0;
    sm_range8455 = [0, 0];
    lookahead8461 = null;
    phase8464 = options9308 && typeof options9308.phase !== "undefined" ? options9308.phase : 0;
    state8463 = {
        allowKeyword: false,
        allowIn: true,
        labelSet: {},
        parenthesizedCount: 0,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        yieldAllowed: false
    };
    extra8465.attachComment = true;
    extra8465.range = true;
    extra8465.comments = [];
    extra8465.bottomRightStack = [];
    extra8465.trailingComments = [];
    extra8465.leadingComments = [];
    if (typeof options9308 !== "undefined") {
        extra8465.range = typeof options9308.range === "boolean" && options9308.range;
        extra8465.loc = typeof options9308.loc === "boolean" && options9308.loc;
        extra8465.attachComment = typeof options9308.attachComment === "boolean" && options9308.attachComment;
        if (extra8465.loc && options9308.source !== null && options9308.source !== undefined) {
            delegate8458 = extend8603(delegate8458, {
                postProcess: function (node9311) {
                    node9311.loc.source = toString9310(options9308.source);
                    return node9311;
                }
            });
        }
        if (typeof options9308.tokens === "boolean" && options9308.tokens) {
            extra8465.tokens = [];
        }
        if (typeof options9308.comment === "boolean" && options9308.comment) {
            extra8465.comments = [];
        }
        if (typeof options9308.tolerant === "boolean" && options9308.tolerant) {
            extra8465.errors = [];
        }
    }
    if (length8457 > 0) {
        if (source8448 && typeof source8448[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9307 instanceof String) {
                source8448 = code9307.valueOf();
            }
        }
    }
    extra8465.loc = true;
    extra8465.errors = [];
    patch8601();
    try {
        program9309 = parseProgram8595();
        if (typeof extra8465.comments !== "undefined") {
            program9309.comments = extra8465.comments;
        }
        if (typeof extra8465.tokens !== "undefined") {
            filterTokenLocation8600();
            program9309.tokens = extra8465.tokens;
        }
        if (typeof extra8465.errors !== "undefined") {
            program9309.errors = extra8465.errors;
        }
    } catch (e9312) {
        throw e9312;
    } finally {
        unpatch8602();
        extra8465 = {};
    }
    return program9309;
}
exports.tokenize = tokenize8604;
exports.read = read8621;
exports.Token = Token8439;
exports.setReadtable = setReadtable8619;
exports.currentReadtable = currentReadtable8620;
exports.parse = parse8622;
// Deep copy.
exports.Syntax = (function () {
    var name9313,
        types9314 = {};
    if (typeof Object.create === "function") {
        types9314 = Object.create(null);
    }
    for (name9313 in Syntax8442) {
        if (Syntax8442.hasOwnProperty(name9313)) {
            types9314[name9313] = Syntax8442[name9313];
        }
    }
    if (typeof Object.freeze === "function") {
        Object.freeze(types9314);
    }
    return types9314;
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