"use strict";

var expander8434 = require("./expander");
var Token8435, TokenName8436, FnExprTokens8437, Syntax8438, PropertyKind8439, Messages8440, Regex8441, SyntaxTreeDelegate8442, ClassPropertyType8443, source8444, strict8445, index8446, lineNumber8447, lineStart8448, sm_lineNumber8449, sm_lineStart8450, sm_range8451, sm_index8452, length8453, delegate8454, tokenStream8455, streamIndex8456, lookahead8457, lookaheadIndex8458, state8459, phase8460, extra8461;
Token8435 = {
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
TokenName8436 = {};
TokenName8436[Token8435.BooleanLiteral] = "Boolean";
TokenName8436[Token8435.EOF] = "<end>";
TokenName8436[Token8435.Identifier] = "Identifier";
TokenName8436[Token8435.Keyword] = "Keyword";
TokenName8436[Token8435.NullLiteral] = "Null";
TokenName8436[Token8435.NumericLiteral] = "Numeric";
TokenName8436[Token8435.Punctuator] = "Punctuator";
TokenName8436[Token8435.StringLiteral] = "String";
TokenName8436[Token8435.RegularExpression] = "RegularExpression";
TokenName8436[Token8435.Delimiter] = "Delimiter";
// A function following one of those tokens is an expression.
FnExprTokens8437 = ["(", "{", "[", "in", "typeof", "instanceof", "new", "return", "case", "delete", "throw", "void",
// assignment operators
"=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ",",
// binary/unary operators
"+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!=="];
Syntax8438 = {
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
PropertyKind8439 = {
    Data: 1,
    Get: 2,
    Set: 4
};
ClassPropertyType8443 = {
    "static": "static",
    prototype: "prototype"
};
// Error messages should be identical to V8.
Messages8440 = {
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
Regex8441 = {
    NonAsciiIdentifierStart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),
    NonAsciiIdentifierPart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")
};
function assert8462(condition8619, message8620) {
    if (!condition8619) {
        throw new Error("ASSERT: " + message8620);
    }
}
function isIn8463(el8621, list8622) {
    return list8622.indexOf(el8621) !== -1;
}
function isDecimalDigit8464(ch8623) {
    return ch8623 >= 48 && ch8623 <= 57;
}
function isHexDigit8465(ch8624) {
    return "0123456789abcdefABCDEF".indexOf(ch8624) >= 0;
}
function isOctalDigit8466(ch8625) {
    return "01234567".indexOf(ch8625) >= 0;
}
function isWhiteSpace8467(ch8626) {
    return ch8626 === 32 || // space
    ch8626 === 9 || // tab
    ch8626 === 11 || ch8626 === 12 || ch8626 === 160 || ch8626 >= 5760 && " ᠎             　﻿".indexOf(String.fromCharCode(ch8626)) > 0;
}
function isLineTerminator8468(ch8627) {
    return ch8627 === 10 || ch8627 === 13 || ch8627 === 8232 || ch8627 === 8233;
}
function isIdentifierStart8469(ch8628) {
    return ch8628 === 36 || ch8628 === 95 || // $ (dollar) and _ (underscore)
    ch8628 >= 65 && ch8628 <= 90 || // A..Z
    ch8628 >= 97 && ch8628 <= 122 || // a..z
    ch8628 === 92 || // \ (backslash)
    ch8628 >= 128 && Regex8441.NonAsciiIdentifierStart.test(String.fromCharCode(ch8628));
}
function isIdentifierPart8470(ch8629) {
    return ch8629 === 36 || ch8629 === 95 || // $ (dollar) and _ (underscore)
    ch8629 >= 65 && ch8629 <= 90 || // A..Z
    ch8629 >= 97 && ch8629 <= 122 || // a..z
    ch8629 >= 48 && ch8629 <= 57 || // 0..9
    ch8629 === 92 || // \ (backslash)
    ch8629 >= 128 && Regex8441.NonAsciiIdentifierPart.test(String.fromCharCode(ch8629));
}
function isFutureReservedWord8471(id8630) {
    switch (id8630) {
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
function isStrictModeReservedWord8472(id8631) {
    switch (id8631) {
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
function isRestrictedWord8473(id8632) {
    return id8632 === "eval" || id8632 === "arguments";
}
function isKeyword8474(id8633) {
    if (strict8445 && isStrictModeReservedWord8472(id8633)) {
        return true;
    }
    switch ( // 'const' is specialized as Keyword in V8.
    // 'yield' is only treated as a keyword in strict mode.
    // 'let' is for compatiblity with SpiderMonkey and ES.next.
    // Some others are from future reserved words.
    id8633.length) {
        case 2:
            return id8633 === "if" || id8633 === "in" || id8633 === "do";
        case 3:
            return id8633 === "var" || id8633 === "for" || id8633 === "new" || id8633 === "try" || id8633 === "let";
        case 4:
            return id8633 === "this" || id8633 === "else" || id8633 === "case" || id8633 === "void" || id8633 === "with" || id8633 === "enum";
        case 5:
            return id8633 === "while" || id8633 === "break" || id8633 === "catch" || id8633 === "throw" || id8633 === "const" || id8633 === "class" || id8633 === "super";
        case 6:
            return id8633 === "return" || id8633 === "typeof" || id8633 === "delete" || id8633 === "switch" || id8633 === "export" || id8633 === "import";
        case 7:
            return id8633 === "default" || id8633 === "finally" || id8633 === "extends";
        case 8:
            return id8633 === "function" || id8633 === "continue" || id8633 === "debugger";
        case 10:
            return id8633 === "instanceof";
        default:
            return false;
    }
}
function skipComment8475() {
    var ch8634, blockComment8635, lineComment8636;
    blockComment8635 = false;
    lineComment8636 = false;
    while (index8446 < length8453) {
        ch8634 = source8444.charCodeAt(index8446);
        if (lineComment8636) {
            ++index8446;
            if (isLineTerminator8468(ch8634)) {
                lineComment8636 = false;
                if (ch8634 === 13 && source8444.charCodeAt(index8446) === 10) {
                    ++index8446;
                }
                ++lineNumber8447;
                lineStart8448 = index8446;
            }
        } else if (blockComment8635) {
            if (isLineTerminator8468(ch8634)) {
                if (ch8634 === 13 && source8444.charCodeAt(index8446 + 1) === 10) {
                    ++index8446;
                }
                ++lineNumber8447;
                ++index8446;
                lineStart8448 = index8446;
                if (index8446 >= length8453) {
                    throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch8634 = source8444.charCodeAt(index8446++);
                if (index8446 >= length8453) {
                    throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
                }
                if ( // Block comment ends with '*/' (char #42, char #47).
                ch8634 === 42) {
                    ch8634 = source8444.charCodeAt(index8446);
                    if (ch8634 === 47) {
                        ++index8446;
                        blockComment8635 = false;
                    }
                }
            }
        } else if (ch8634 === 47) {
            ch8634 = source8444.charCodeAt(index8446 + 1);
            if ( // Line comment starts with '//' (char #47, char #47).
            ch8634 === 47) {
                index8446 += 2;
                lineComment8636 = true;
            } else if (ch8634 === 42) {
                // Block comment starts with '/*' (char #47, char #42).
                index8446 += 2;
                blockComment8635 = true;
                if (index8446 >= length8453) {
                    throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8467(ch8634)) {
            ++index8446;
        } else if (isLineTerminator8468(ch8634)) {
            ++index8446;
            if (ch8634 === 13 && source8444.charCodeAt(index8446) === 10) {
                ++index8446;
            }
            ++lineNumber8447;
            lineStart8448 = index8446;
        } else {
            break;
        }
    }
}
function scanHexEscape8476(prefix8637) {
    var i8638,
        len8639,
        ch8640,
        code8641 = 0;
    len8639 = prefix8637 === "u" ? 4 : 2;
    for (i8638 = 0; i8638 < len8639; ++i8638) {
        if (index8446 < length8453 && isHexDigit8465(source8444[index8446])) {
            ch8640 = source8444[index8446++];
            code8641 = code8641 * 16 + "0123456789abcdef".indexOf(ch8640.toLowerCase());
        } else {
            return "";
        }
    }
    return String.fromCharCode(code8641);
}
function scanUnicodeCodePointEscape8477() {
    var ch8642, code8643, cu18644, cu28645;
    ch8642 = source8444[index8446];
    code8643 = 0;
    if ( // At least, one hex digit is required.
    ch8642 === "}") {
        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
    }
    while (index8446 < length8453) {
        ch8642 = source8444[index8446++];
        if (!isHexDigit8465(ch8642)) {
            break;
        }
        code8643 = code8643 * 16 + "0123456789abcdef".indexOf(ch8642.toLowerCase());
    }
    if (code8643 > 1114111 || ch8642 !== "}") {
        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
    }
    if ( // UTF-16 Encoding
    code8643 <= 65535) {
        return String.fromCharCode(code8643);
    }
    cu18644 = (code8643 - 65536 >> 10) + 55296;
    cu28645 = (code8643 - 65536 & 1023) + 56320;
    return String.fromCharCode(cu18644, cu28645);
}
function getEscapedIdentifier8478() {
    var ch8646, id8647;
    ch8646 = source8444.charCodeAt(index8446++);
    id8647 = String.fromCharCode(ch8646);
    if ( // '\u' (char #92, char #117) denotes an escaped character.
    ch8646 === 92) {
        if (source8444.charCodeAt(index8446) !== 117) {
            throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
        }
        ++index8446;
        ch8646 = scanHexEscape8476("u");
        if (!ch8646 || ch8646 === "\\" || !isIdentifierStart8469(ch8646.charCodeAt(0))) {
            throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
        }
        id8647 = ch8646;
    }
    while (index8446 < length8453) {
        ch8646 = source8444.charCodeAt(index8446);
        if (!isIdentifierPart8470(ch8646)) {
            break;
        }
        ++index8446;
        id8647 += String.fromCharCode(ch8646);
        if ( // '\u' (char #92, char #117) denotes an escaped character.
        ch8646 === 92) {
            id8647 = id8647.substr(0, id8647.length - 1);
            if (source8444.charCodeAt(index8446) !== 117) {
                throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
            }
            ++index8446;
            ch8646 = scanHexEscape8476("u");
            if (!ch8646 || ch8646 === "\\" || !isIdentifierPart8470(ch8646.charCodeAt(0))) {
                throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
            }
            id8647 += ch8646;
        }
    }
    return id8647;
}
function getIdentifier8479() {
    var start8648, ch8649;
    start8648 = index8446++;
    while (index8446 < length8453) {
        ch8649 = source8444.charCodeAt(index8446);
        if (ch8649 === 92) {
            // Blackslash (char #92) marks Unicode escape sequence.
            index8446 = start8648;
            return getEscapedIdentifier8478();
        }
        if (isIdentifierPart8470(ch8649)) {
            ++index8446;
        } else {
            break;
        }
    }
    return source8444.slice(start8648, index8446);
}
function scanIdentifier8480() {
    var start8650, id8651, type8652;
    start8650 = index8446;
    // Backslash (char #92) starts an escaped character.
    id8651 = source8444.charCodeAt(index8446) === 92 ? getEscapedIdentifier8478() : getIdentifier8479();
    if ( // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    id8651.length === 1) {
        type8652 = Token8435.Identifier;
    } else if (isKeyword8474(id8651)) {
        type8652 = Token8435.Keyword;
    } else if (id8651 === "null") {
        type8652 = Token8435.NullLiteral;
    } else if (id8651 === "true" || id8651 === "false") {
        type8652 = Token8435.BooleanLiteral;
    } else {
        type8652 = Token8435.Identifier;
    }
    return {
        type: type8652,
        value: id8651,
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [start8650, index8446]
    };
}
function scanPunctuator8481() {
    var start8653 = index8446,
        code8654 = source8444.charCodeAt(index8446),
        code28655,
        ch18656 = source8444[index8446],
        ch28657,
        ch38658,
        ch48659;
    switch (code8654) {
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
            ++index8446;
            if (extra8461.tokenize) {
                if (code8654 === 40) {
                    extra8461.openParenToken = extra8461.tokens.length;
                } else if (code8654 === 123) {
                    extra8461.openCurlyToken = extra8461.tokens.length;
                }
            }
            return {
                type: Token8435.Punctuator,
                value: String.fromCharCode(code8654),
                lineNumber: lineNumber8447,
                lineStart: lineStart8448,
                range: [start8653, index8446]
            };
        default:
            code28655 = source8444.charCodeAt(index8446 + 1);
            if ( // '=' (char #61) marks an assignment or comparison operator.
            code28655 === 61) {
                switch (code8654) {
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
                        index8446 += 2;
                        return {
                            type: Token8435.Punctuator,
                            value: String.fromCharCode(code8654) + String.fromCharCode(code28655),
                            lineNumber: lineNumber8447,
                            lineStart: lineStart8448,
                            range: [start8653, index8446]
                        };
                    case 33:
                    case // !
                    61:
                        // =
                        index8446 += 2;
                        if ( // !== and ===
                        source8444.charCodeAt(index8446) === 61) {
                            ++index8446;
                        }
                        return {
                            type: Token8435.Punctuator,
                            value: source8444.slice(start8653, index8446),
                            lineNumber: lineNumber8447,
                            lineStart: lineStart8448,
                            range: [start8653, index8446]
                        };
                    default:
                        break;
                }
            }
            break;
    }
    // Peek more characters.
    ch28657 = source8444[index8446 + 1];
    ch38658 = source8444[index8446 + 2];
    ch48659 = source8444[index8446 + 3];
    if ( // 4-character punctuator: >>>=
    ch18656 === ">" && ch28657 === ">" && ch38658 === ">") {
        if (ch48659 === "=") {
            index8446 += 4;
            return {
                type: Token8435.Punctuator,
                value: ">>>=",
                lineNumber: lineNumber8447,
                lineStart: lineStart8448,
                range: [start8653, index8446]
            };
        }
    }
    if ( // 3-character punctuators: === !== >>> <<= >>=
    ch18656 === ">" && ch28657 === ">" && ch38658 === ">") {
        index8446 += 3;
        return {
            type: Token8435.Punctuator,
            value: ">>>",
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [start8653, index8446]
        };
    }
    if (ch18656 === "<" && ch28657 === "<" && ch38658 === "=") {
        index8446 += 3;
        return {
            type: Token8435.Punctuator,
            value: "<<=",
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [start8653, index8446]
        };
    }
    if (ch18656 === ">" && ch28657 === ">" && ch38658 === "=") {
        index8446 += 3;
        return {
            type: Token8435.Punctuator,
            value: ">>=",
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [start8653, index8446]
        };
    }
    if (ch18656 === "." && ch28657 === "." && ch38658 === ".") {
        index8446 += 3;
        return {
            type: Token8435.Punctuator,
            value: "...",
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [start8653, index8446]
        };
    }
    if ( // Other 2-character punctuators: ++ -- << >> && ||
    ch18656 === ch28657 && "+-<>&|".indexOf(ch18656) >= 0) {
        index8446 += 2;
        return {
            type: Token8435.Punctuator,
            value: ch18656 + ch28657,
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [start8653, index8446]
        };
    }
    if (ch18656 === "=" && ch28657 === ">") {
        index8446 += 2;
        return {
            type: Token8435.Punctuator,
            value: "=>",
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [start8653, index8446]
        };
    }
    if ("<>=!+-*%&|^/".indexOf(ch18656) >= 0) {
        ++index8446;
        return {
            type: Token8435.Punctuator,
            value: ch18656,
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [start8653, index8446]
        };
    }
    if (ch18656 === ".") {
        ++index8446;
        return {
            type: Token8435.Punctuator,
            value: ch18656,
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [start8653, index8446]
        };
    }
    throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
}
function scanHexLiteral8482(start8660) {
    var number8661 = "";
    while (index8446 < length8453) {
        if (!isHexDigit8465(source8444[index8446])) {
            break;
        }
        number8661 += source8444[index8446++];
    }
    if (number8661.length === 0) {
        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8469(source8444.charCodeAt(index8446))) {
        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8435.NumericLiteral,
        value: parseInt("0x" + number8661, 16),
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [start8660, index8446]
    };
}
function scanOctalLiteral8483(prefix8662, start8663) {
    var number8664, octal8665;
    if (isOctalDigit8466(prefix8662)) {
        octal8665 = true;
        number8664 = "0" + source8444[index8446++];
    } else {
        octal8665 = false;
        ++index8446;
        number8664 = "";
    }
    while (index8446 < length8453) {
        if (!isOctalDigit8466(source8444[index8446])) {
            break;
        }
        number8664 += source8444[index8446++];
    }
    if (!octal8665 && number8664.length === 0) {
        // only 0o or 0O
        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8469(source8444.charCodeAt(index8446)) || isDecimalDigit8464(source8444.charCodeAt(index8446))) {
        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8435.NumericLiteral,
        value: parseInt(number8664, 8),
        octal: octal8665,
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [start8663, index8446]
    };
}
function scanNumericLiteral8484() {
    var number8666, start8667, ch8668, octal8669;
    ch8668 = source8444[index8446];
    assert8462(isDecimalDigit8464(ch8668.charCodeAt(0)) || ch8668 === ".", "Numeric literal must start with a decimal digit or a decimal point");
    start8667 = index8446;
    number8666 = "";
    if (ch8668 !== ".") {
        number8666 = source8444[index8446++];
        ch8668 = source8444[index8446];
        if ( // Hex number starts with '0x'.
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        // Binary number in ES6 starts with '0b'.
        number8666 === "0") {
            if (ch8668 === "x" || ch8668 === "X") {
                ++index8446;
                return scanHexLiteral8482(start8667);
            }
            if (ch8668 === "b" || ch8668 === "B") {
                ++index8446;
                number8666 = "";
                while (index8446 < length8453) {
                    ch8668 = source8444[index8446];
                    if (ch8668 !== "0" && ch8668 !== "1") {
                        break;
                    }
                    number8666 += source8444[index8446++];
                }
                if (number8666.length === 0) {
                    // only 0b or 0B
                    throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
                }
                if (index8446 < length8453) {
                    ch8668 = source8444.charCodeAt(index8446);
                    if (isIdentifierStart8469(ch8668) || isDecimalDigit8464(ch8668)) {
                        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
                    }
                }
                return {
                    type: Token8435.NumericLiteral,
                    value: parseInt(number8666, 2),
                    lineNumber: lineNumber8447,
                    lineStart: lineStart8448,
                    range: [start8667, index8446]
                };
            }
            if (ch8668 === "o" || ch8668 === "O" || isOctalDigit8466(ch8668)) {
                return scanOctalLiteral8483(ch8668, start8667);
            }
            if ( // decimal number starts with '0' such as '09' is illegal.
            ch8668 && isDecimalDigit8464(ch8668.charCodeAt(0))) {
                throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
            }
        }
        while (isDecimalDigit8464(source8444.charCodeAt(index8446))) {
            number8666 += source8444[index8446++];
        }
        ch8668 = source8444[index8446];
    }
    if (ch8668 === ".") {
        number8666 += source8444[index8446++];
        while (isDecimalDigit8464(source8444.charCodeAt(index8446))) {
            number8666 += source8444[index8446++];
        }
        ch8668 = source8444[index8446];
    }
    if (ch8668 === "e" || ch8668 === "E") {
        number8666 += source8444[index8446++];
        ch8668 = source8444[index8446];
        if (ch8668 === "+" || ch8668 === "-") {
            number8666 += source8444[index8446++];
        }
        if (isDecimalDigit8464(source8444.charCodeAt(index8446))) {
            while (isDecimalDigit8464(source8444.charCodeAt(index8446))) {
                number8666 += source8444[index8446++];
            }
        } else {
            throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
        }
    }
    if (isIdentifierStart8469(source8444.charCodeAt(index8446))) {
        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8435.NumericLiteral,
        value: parseFloat(number8666),
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [start8667, index8446]
    };
}
function scanStringLiteral8485() {
    var str8670 = "",
        quote8671,
        start8672,
        ch8673,
        code8674,
        unescaped8675,
        restore8676,
        octal8677 = false;
    quote8671 = source8444[index8446];
    assert8462(quote8671 === "'" || quote8671 === "\"", "String literal must starts with a quote");
    start8672 = index8446;
    ++index8446;
    while (index8446 < length8453) {
        ch8673 = source8444[index8446++];
        if (ch8673 === quote8671) {
            quote8671 = "";
            break;
        } else if (ch8673 === "\\") {
            ch8673 = source8444[index8446++];
            if (!ch8673 || !isLineTerminator8468(ch8673.charCodeAt(0))) {
                switch (ch8673) {
                    case "n":
                        str8670 += "\n";
                        break;
                    case "r":
                        str8670 += "\r";
                        break;
                    case "t":
                        str8670 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8444[index8446] === "{") {
                            ++index8446;
                            str8670 += scanUnicodeCodePointEscape8477();
                        } else {
                            restore8676 = index8446;
                            unescaped8675 = scanHexEscape8476(ch8673);
                            if (unescaped8675) {
                                str8670 += unescaped8675;
                            } else {
                                index8446 = restore8676;
                                str8670 += ch8673;
                            }
                        }
                        break;
                    case "b":
                        str8670 += "\b";
                        break;
                    case "f":
                        str8670 += "\f";
                        break;
                    case "v":
                        str8670 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8466(ch8673)) {
                            code8674 = "01234567".indexOf(ch8673);
                            if ( // \0 is not octal escape sequence
                            code8674 !== 0) {
                                octal8677 = true;
                            }
                            if (index8446 < length8453 && isOctalDigit8466(source8444[index8446])) {
                                octal8677 = true;
                                code8674 = code8674 * 8 + "01234567".indexOf(source8444[index8446++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8673) >= 0 && index8446 < length8453 && isOctalDigit8466(source8444[index8446])) {
                                    code8674 = code8674 * 8 + "01234567".indexOf(source8444[index8446++]);
                                }
                            }
                            str8670 += String.fromCharCode(code8674);
                        } else {
                            str8670 += ch8673;
                        }
                        break;
                }
            } else {
                ++lineNumber8447;
                if (ch8673 === "\r" && source8444[index8446] === "\n") {
                    ++index8446;
                }
                lineStart8448 = index8446;
            }
        } else if (isLineTerminator8468(ch8673.charCodeAt(0))) {
            break;
        } else {
            str8670 += ch8673;
        }
    }
    if (quote8671 !== "") {
        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8435.StringLiteral,
        value: str8670,
        octal: octal8677,
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [start8672, index8446]
    };
}
function scanTemplate8486() {
    var cooked8678 = "",
        ch8679,
        start8680,
        terminated8681,
        tail8682,
        restore8683,
        unescaped8684,
        code8685,
        octal8686;
    terminated8681 = false;
    tail8682 = false;
    start8680 = index8446;
    ++index8446;
    while (index8446 < length8453) {
        ch8679 = source8444[index8446++];
        if (ch8679 === "`") {
            tail8682 = true;
            terminated8681 = true;
            break;
        } else if (ch8679 === "$") {
            if (source8444[index8446] === "{") {
                ++index8446;
                terminated8681 = true;
                break;
            }
            cooked8678 += ch8679;
        } else if (ch8679 === "\\") {
            ch8679 = source8444[index8446++];
            if (!isLineTerminator8468(ch8679.charCodeAt(0))) {
                switch (ch8679) {
                    case "n":
                        cooked8678 += "\n";
                        break;
                    case "r":
                        cooked8678 += "\r";
                        break;
                    case "t":
                        cooked8678 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8444[index8446] === "{") {
                            ++index8446;
                            cooked8678 += scanUnicodeCodePointEscape8477();
                        } else {
                            restore8683 = index8446;
                            unescaped8684 = scanHexEscape8476(ch8679);
                            if (unescaped8684) {
                                cooked8678 += unescaped8684;
                            } else {
                                index8446 = restore8683;
                                cooked8678 += ch8679;
                            }
                        }
                        break;
                    case "b":
                        cooked8678 += "\b";
                        break;
                    case "f":
                        cooked8678 += "\f";
                        break;
                    case "v":
                        cooked8678 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8466(ch8679)) {
                            code8685 = "01234567".indexOf(ch8679);
                            if ( // \0 is not octal escape sequence
                            code8685 !== 0) {
                                octal8686 = true;
                            }
                            if (index8446 < length8453 && isOctalDigit8466(source8444[index8446])) {
                                octal8686 = true;
                                code8685 = code8685 * 8 + "01234567".indexOf(source8444[index8446++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8679) >= 0 && index8446 < length8453 && isOctalDigit8466(source8444[index8446])) {
                                    code8685 = code8685 * 8 + "01234567".indexOf(source8444[index8446++]);
                                }
                            }
                            cooked8678 += String.fromCharCode(code8685);
                        } else {
                            cooked8678 += ch8679;
                        }
                        break;
                }
            } else {
                ++lineNumber8447;
                if (ch8679 === "\r" && source8444[index8446] === "\n") {
                    ++index8446;
                }
                lineStart8448 = index8446;
            }
        } else if (isLineTerminator8468(ch8679.charCodeAt(0))) {
            ++lineNumber8447;
            if (ch8679 === "\r" && source8444[index8446] === "\n") {
                ++index8446;
            }
            lineStart8448 = index8446;
            cooked8678 += "\n";
        } else {
            cooked8678 += ch8679;
        }
    }
    if (!terminated8681) {
        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8435.Template,
        value: {
            cooked: cooked8678,
            raw: source8444.slice(start8680 + 1, index8446 - (tail8682 ? 1 : 2))
        },
        tail: tail8682,
        octal: octal8686,
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [start8680, index8446]
    };
}
function scanTemplateElement8487(option8687) {
    var startsWith8688, template8689;
    lookahead8457 = null;
    skipComment8475();
    startsWith8688 = option8687.head ? "`" : "}";
    if (source8444[index8446] !== startsWith8688) {
        throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
    }
    template8689 = scanTemplate8486();
    peek8493();
    return template8689;
}
function scanRegExp8488() {
    var str8690,
        ch8691,
        start8692,
        pattern8693,
        flags8694,
        value8695,
        classMarker8696 = false,
        restore8697,
        terminated8698 = false;
    lookahead8457 = null;
    skipComment8475();
    start8692 = index8446;
    ch8691 = source8444[index8446];
    assert8462(ch8691 === "/", "Regular expression literal must start with a slash");
    str8690 = source8444[index8446++];
    while (index8446 < length8453) {
        ch8691 = source8444[index8446++];
        str8690 += ch8691;
        if (classMarker8696) {
            if (ch8691 === "]") {
                classMarker8696 = false;
            }
        } else {
            if (ch8691 === "\\") {
                ch8691 = source8444[index8446++];
                if ( // ECMA-262 7.8.5
                isLineTerminator8468(ch8691.charCodeAt(0))) {
                    throwError8499({}, Messages8440.UnterminatedRegExp);
                }
                str8690 += ch8691;
            } else if (ch8691 === "/") {
                terminated8698 = true;
                break;
            } else if (ch8691 === "[") {
                classMarker8696 = true;
            } else if (isLineTerminator8468(ch8691.charCodeAt(0))) {
                throwError8499({}, Messages8440.UnterminatedRegExp);
            }
        }
    }
    if (!terminated8698) {
        throwError8499({}, Messages8440.UnterminatedRegExp);
    }
    // Exclude leading and trailing slash.
    pattern8693 = str8690.substr(1, str8690.length - 2);
    flags8694 = "";
    while (index8446 < length8453) {
        ch8691 = source8444[index8446];
        if (!isIdentifierPart8470(ch8691.charCodeAt(0))) {
            break;
        }
        ++index8446;
        if (ch8691 === "\\" && index8446 < length8453) {
            ch8691 = source8444[index8446];
            if (ch8691 === "u") {
                ++index8446;
                restore8697 = index8446;
                ch8691 = scanHexEscape8476("u");
                if (ch8691) {
                    flags8694 += ch8691;
                    for (str8690 += "\\u"; restore8697 < index8446; ++restore8697) {
                        str8690 += source8444[restore8697];
                    }
                } else {
                    index8446 = restore8697;
                    flags8694 += "u";
                    str8690 += "\\u";
                }
            } else {
                str8690 += "\\";
            }
        } else {
            flags8694 += ch8691;
            str8690 += ch8691;
        }
    }
    try {
        value8695 = new RegExp(pattern8693, flags8694);
    } catch (e8699) {
        throwError8499({}, Messages8440.InvalidRegExp);
    }
    if ( // peek();
    extra8461.tokenize) {
        return {
            type: Token8435.RegularExpression,
            value: value8695,
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [start8692, index8446]
        };
    }
    return {
        type: Token8435.RegularExpression,
        literal: str8690,
        value: value8695,
        range: [start8692, index8446]
    };
}
function isIdentifierName8489(token8700) {
    return token8700.type === Token8435.Identifier || token8700.type === Token8435.Keyword || token8700.type === Token8435.BooleanLiteral || token8700.type === Token8435.NullLiteral;
}
function advanceSlash8490() {
    var prevToken8701, checkToken8702;
    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design
    prevToken8701 = extra8461.tokens[extra8461.tokens.length - 1];
    if (!prevToken8701) {
        // Nothing before that: it cannot be a division.
        return scanRegExp8488();
    }
    if (prevToken8701.type === "Punctuator") {
        if (prevToken8701.value === ")") {
            checkToken8702 = extra8461.tokens[extra8461.openParenToken - 1];
            if (checkToken8702 && checkToken8702.type === "Keyword" && (checkToken8702.value === "if" || checkToken8702.value === "while" || checkToken8702.value === "for" || checkToken8702.value === "with")) {
                return scanRegExp8488();
            }
            return scanPunctuator8481();
        }
        if (prevToken8701.value === "}") {
            if ( // Dividing a function by anything makes little sense,
            // but we have to check for that.
            extra8461.tokens[extra8461.openCurlyToken - 3] && extra8461.tokens[extra8461.openCurlyToken - 3].type === "Keyword") {
                // Anonymous function.
                checkToken8702 = extra8461.tokens[extra8461.openCurlyToken - 4];
                if (!checkToken8702) {
                    return scanPunctuator8481();
                }
            } else if (extra8461.tokens[extra8461.openCurlyToken - 4] && extra8461.tokens[extra8461.openCurlyToken - 4].type === "Keyword") {
                // Named function.
                checkToken8702 = extra8461.tokens[extra8461.openCurlyToken - 5];
                if (!checkToken8702) {
                    return scanRegExp8488();
                }
            } else {
                return scanPunctuator8481();
            }
            if ( // checkToken determines whether the function is
            // a declaration or an expression.
            FnExprTokens8437.indexOf(checkToken8702.value) >= 0) {
                // It is an expression.
                return scanPunctuator8481();
            }
            // It is a declaration.
            return scanRegExp8488();
        }
        return scanRegExp8488();
    }
    if (prevToken8701.type === "Keyword") {
        return scanRegExp8488();
    }
    return scanPunctuator8481();
}
function advance8491() {
    var ch8703;
    skipComment8475();
    if (index8446 >= length8453) {
        return {
            type: Token8435.EOF,
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [index8446, index8446]
        };
    }
    ch8703 = source8444.charCodeAt(index8446);
    if ( // Very common: ( and ) and ;
    ch8703 === 40 || ch8703 === 41 || ch8703 === 58) {
        return scanPunctuator8481();
    }
    if ( // String literal starts with single quote (#39) or double quote (#34).
    ch8703 === 39 || ch8703 === 34) {
        return scanStringLiteral8485();
    }
    if (ch8703 === 96) {
        return scanTemplate8486();
    }
    if (isIdentifierStart8469(ch8703)) {
        return scanIdentifier8480();
    }
    if ( // # and @ are allowed for sweet.js
    ch8703 === 35 || ch8703 === 64) {
        ++index8446;
        return {
            type: Token8435.Punctuator,
            value: String.fromCharCode(ch8703),
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [index8446 - 1, index8446]
        };
    }
    if ( // Dot (.) char #46 can also start a floating-point number, hence the need
    // to check the next character.
    ch8703 === 46) {
        if (isDecimalDigit8464(source8444.charCodeAt(index8446 + 1))) {
            return scanNumericLiteral8484();
        }
        return scanPunctuator8481();
    }
    if (isDecimalDigit8464(ch8703)) {
        return scanNumericLiteral8484();
    }
    if ( // Slash (/) char #47 can also start a regex.
    extra8461.tokenize && ch8703 === 47) {
        return advanceSlash8490();
    }
    return scanPunctuator8481();
}
function lex8492() {
    var token8704;
    token8704 = lookahead8457;
    streamIndex8456 = lookaheadIndex8458;
    lineNumber8447 = token8704.lineNumber;
    lineStart8448 = token8704.lineStart;
    sm_lineNumber8449 = lookahead8457.sm_lineNumber;
    sm_lineStart8450 = lookahead8457.sm_lineStart;
    sm_range8451 = lookahead8457.sm_range;
    sm_index8452 = lookahead8457.sm_range[0];
    lookahead8457 = tokenStream8455[++streamIndex8456].token;
    lookaheadIndex8458 = streamIndex8456;
    index8446 = lookahead8457.range[0];
    if (token8704.leadingComments) {
        extra8461.comments = extra8461.comments.concat(token8704.leadingComments);
        extra8461.trailingComments = extra8461.trailingComments.concat(token8704.leadingComments);
        extra8461.leadingComments = extra8461.leadingComments.concat(token8704.leadingComments);
    }
    return token8704;
}
function peek8493() {
    lookaheadIndex8458 = streamIndex8456 + 1;
    if (lookaheadIndex8458 >= length8453) {
        lookahead8457 = {
            type: Token8435.EOF,
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [index8446, index8446]
        };
        return;
    }
    lookahead8457 = tokenStream8455[lookaheadIndex8458].token;
    index8446 = lookahead8457.range[0];
}
function lookahead28494() {
    var adv8705, pos8706, line8707, start8708, result8709;
    if (streamIndex8456 + 1 >= length8453 || streamIndex8456 + 2 >= length8453) {
        return {
            type: Token8435.EOF,
            lineNumber: lineNumber8447,
            lineStart: lineStart8448,
            range: [index8446, index8446]
        };
    }
    if ( // Scan for the next immediate token.
    lookahead8457 === null) {
        lookaheadIndex8458 = streamIndex8456 + 1;
        lookahead8457 = tokenStream8455[lookaheadIndex8458].token;
        index8446 = lookahead8457.range[0];
    }
    result8709 = tokenStream8455[lookaheadIndex8458 + 1].token;
    return result8709;
}
function markerCreate8495() {
    var sm_index8710 = lookahead8457 ? lookahead8457.sm_range[0] : 0;
    var sm_lineStart8711 = lookahead8457 ? lookahead8457.sm_lineStart : 0;
    var sm_lineNumber8712 = lookahead8457 ? lookahead8457.sm_lineNumber : 1;
    if (!extra8461.loc && !extra8461.range) {
        return undefined;
    }
    return {
        offset: sm_index8710,
        line: sm_lineNumber8712,
        col: sm_index8710 - sm_lineStart8711
    };
}
function processComment8496(node8713) {
    var lastChild8714,
        trailingComments8715,
        bottomRight8716 = extra8461.bottomRightStack,
        last8717 = bottomRight8716[bottomRight8716.length - 1];
    if (node8713.type === Syntax8438.Program) {
        if (node8713.body.length > 0) {
            return;
        }
    }
    if (extra8461.trailingComments.length > 0) {
        if (extra8461.trailingComments[0].range[0] >= node8713.range[1]) {
            trailingComments8715 = extra8461.trailingComments;
            extra8461.trailingComments = [];
        } else {
            extra8461.trailingComments.length = 0;
        }
    } else {
        if (last8717 && last8717.trailingComments && last8717.trailingComments[0].range[0] >= node8713.range[1]) {
            trailingComments8715 = last8717.trailingComments;
            delete last8717.trailingComments;
        }
    }
    if ( // Eating the stack.
    last8717) {
        while (last8717 && last8717.range[0] >= node8713.range[0]) {
            lastChild8714 = last8717;
            last8717 = bottomRight8716.pop();
        }
    }
    if (lastChild8714) {
        if (lastChild8714.leadingComments && lastChild8714.leadingComments[lastChild8714.leadingComments.length - 1].range[1] <= node8713.range[0]) {
            node8713.leadingComments = lastChild8714.leadingComments;
            delete lastChild8714.leadingComments;
        }
    } else if (extra8461.leadingComments.length > 0 && extra8461.leadingComments[extra8461.leadingComments.length - 1].range[1] <= node8713.range[0]) {
        node8713.leadingComments = extra8461.leadingComments;
        extra8461.leadingComments = [];
    }
    if (trailingComments8715) {
        node8713.trailingComments = trailingComments8715;
    }
    bottomRight8716.push(node8713);
}
function markerApply8497(marker8718, node8719) {
    if (extra8461.range) {
        node8719.range = [marker8718.offset, sm_index8452];
    }
    if (extra8461.loc) {
        node8719.loc = {
            start: {
                line: marker8718.line,
                column: marker8718.col
            },
            end: {
                line: sm_lineNumber8449,
                column: sm_index8452 - sm_lineStart8450
            }
        };
        node8719 = delegate8454.postProcess(node8719);
    }
    if (extra8461.attachComment) {
        processComment8496(node8719);
    }
    return node8719;
}
SyntaxTreeDelegate8442 = {
    name: "SyntaxTree",
    postProcess: function postProcess(node8720) {
        return node8720;
    },
    createArrayExpression: function createArrayExpression(elements8721) {
        return {
            type: Syntax8438.ArrayExpression,
            elements: elements8721
        };
    },
    createAssignmentExpression: function createAssignmentExpression(operator8722, left8723, right8724) {
        return {
            type: Syntax8438.AssignmentExpression,
            operator: operator8722,
            left: left8723,
            right: right8724
        };
    },
    createBinaryExpression: function createBinaryExpression(operator8725, left8726, right8727) {
        var type8728 = operator8725 === "||" || operator8725 === "&&" ? Syntax8438.LogicalExpression : Syntax8438.BinaryExpression;
        return {
            type: type8728,
            operator: operator8725,
            left: left8726,
            right: right8727
        };
    },
    createBlockStatement: function createBlockStatement(body8729) {
        return {
            type: Syntax8438.BlockStatement,
            body: body8729
        };
    },
    createBreakStatement: function createBreakStatement(label8730) {
        return {
            type: Syntax8438.BreakStatement,
            label: label8730
        };
    },
    createCallExpression: function createCallExpression(callee8731, args8732) {
        return {
            type: Syntax8438.CallExpression,
            callee: callee8731,
            arguments: args8732
        };
    },
    createCatchClause: function createCatchClause(param8733, body8734) {
        return {
            type: Syntax8438.CatchClause,
            param: param8733,
            body: body8734
        };
    },
    createConditionalExpression: function createConditionalExpression(test8735, consequent8736, alternate8737) {
        return {
            type: Syntax8438.ConditionalExpression,
            test: test8735,
            consequent: consequent8736,
            alternate: alternate8737
        };
    },
    createContinueStatement: function createContinueStatement(label8738) {
        return {
            type: Syntax8438.ContinueStatement,
            label: label8738
        };
    },
    createDebuggerStatement: function createDebuggerStatement() {
        return { type: Syntax8438.DebuggerStatement };
    },
    createDoWhileStatement: function createDoWhileStatement(body8739, test8740) {
        return {
            type: Syntax8438.DoWhileStatement,
            body: body8739,
            test: test8740
        };
    },
    createEmptyStatement: function createEmptyStatement() {
        return { type: Syntax8438.EmptyStatement };
    },
    createExpressionStatement: function createExpressionStatement(expression8741) {
        return {
            type: Syntax8438.ExpressionStatement,
            expression: expression8741
        };
    },
    createForStatement: function createForStatement(init8742, test8743, update8744, body8745) {
        return {
            type: Syntax8438.ForStatement,
            init: init8742,
            test: test8743,
            update: update8744,
            body: body8745
        };
    },
    createForInStatement: function createForInStatement(left8746, right8747, body8748) {
        return {
            type: Syntax8438.ForInStatement,
            left: left8746,
            right: right8747,
            body: body8748,
            each: false
        };
    },
    createForOfStatement: function createForOfStatement(left8749, right8750, body8751) {
        return {
            type: Syntax8438.ForOfStatement,
            left: left8749,
            right: right8750,
            body: body8751
        };
    },
    createFunctionDeclaration: function createFunctionDeclaration(id8752, params8753, defaults8754, body8755, rest8756, generator8757, expression8758) {
        return {
            type: Syntax8438.FunctionDeclaration,
            id: id8752,
            params: params8753,
            defaults: defaults8754,
            body: body8755,
            rest: rest8756,
            generator: generator8757,
            expression: expression8758
        };
    },
    createFunctionExpression: function createFunctionExpression(id8759, params8760, defaults8761, body8762, rest8763, generator8764, expression8765) {
        return {
            type: Syntax8438.FunctionExpression,
            id: id8759,
            params: params8760,
            defaults: defaults8761,
            body: body8762,
            rest: rest8763,
            generator: generator8764,
            expression: expression8765
        };
    },
    createIdentifier: function createIdentifier(name8766) {
        return {
            type: Syntax8438.Identifier,
            name: name8766
        };
    },
    createIfStatement: function createIfStatement(test8767, consequent8768, alternate8769) {
        return {
            type: Syntax8438.IfStatement,
            test: test8767,
            consequent: consequent8768,
            alternate: alternate8769
        };
    },
    createLabeledStatement: function createLabeledStatement(label8770, body8771) {
        return {
            type: Syntax8438.LabeledStatement,
            label: label8770,
            body: body8771
        };
    },
    createLiteral: function createLiteral(token8772) {
        return {
            type: Syntax8438.Literal,
            value: token8772.value,
            raw: String(token8772.value)
        };
    },
    createMemberExpression: function createMemberExpression(accessor8773, object8774, property8775) {
        return {
            type: Syntax8438.MemberExpression,
            computed: accessor8773 === "[",
            object: object8774,
            property: property8775
        };
    },
    createNewExpression: function createNewExpression(callee8776, args8777) {
        return {
            type: Syntax8438.NewExpression,
            callee: callee8776,
            arguments: args8777
        };
    },
    createObjectExpression: function createObjectExpression(properties8778) {
        return {
            type: Syntax8438.ObjectExpression,
            properties: properties8778
        };
    },
    createPostfixExpression: function createPostfixExpression(operator8779, argument8780) {
        return {
            type: Syntax8438.UpdateExpression,
            operator: operator8779,
            argument: argument8780,
            prefix: false
        };
    },
    createProgram: function createProgram(body8781) {
        return {
            type: Syntax8438.Program,
            body: body8781
        };
    },
    createProperty: function createProperty(kind8782, key8783, value8784, method8785, shorthand8786, computed8787) {
        return {
            type: Syntax8438.Property,
            key: key8783,
            value: value8784,
            kind: kind8782,
            method: method8785,
            shorthand: shorthand8786,
            computed: computed8787
        };
    },
    createReturnStatement: function createReturnStatement(argument8788) {
        return {
            type: Syntax8438.ReturnStatement,
            argument: argument8788
        };
    },
    createSequenceExpression: function createSequenceExpression(expressions8789) {
        return {
            type: Syntax8438.SequenceExpression,
            expressions: expressions8789
        };
    },
    createSwitchCase: function createSwitchCase(test8790, consequent8791) {
        return {
            type: Syntax8438.SwitchCase,
            test: test8790,
            consequent: consequent8791
        };
    },
    createSwitchStatement: function createSwitchStatement(discriminant8792, cases8793) {
        return {
            type: Syntax8438.SwitchStatement,
            discriminant: discriminant8792,
            cases: cases8793
        };
    },
    createThisExpression: function createThisExpression() {
        return { type: Syntax8438.ThisExpression };
    },
    createThrowStatement: function createThrowStatement(argument8794) {
        return {
            type: Syntax8438.ThrowStatement,
            argument: argument8794
        };
    },
    createTryStatement: function createTryStatement(block8795, guardedHandlers8796, handlers8797, finalizer8798) {
        return {
            type: Syntax8438.TryStatement,
            block: block8795,
            guardedHandlers: guardedHandlers8796,
            handlers: handlers8797,
            finalizer: finalizer8798
        };
    },
    createUnaryExpression: function createUnaryExpression(operator8799, argument8800) {
        if (operator8799 === "++" || operator8799 === "--") {
            return {
                type: Syntax8438.UpdateExpression,
                operator: operator8799,
                argument: argument8800,
                prefix: true
            };
        }
        return {
            type: Syntax8438.UnaryExpression,
            operator: operator8799,
            argument: argument8800,
            prefix: true
        };
    },
    createVariableDeclaration: function createVariableDeclaration(declarations8801, kind8802) {
        return {
            type: Syntax8438.VariableDeclaration,
            declarations: declarations8801,
            kind: kind8802
        };
    },
    createVariableDeclarator: function createVariableDeclarator(id8803, init8804) {
        return {
            type: Syntax8438.VariableDeclarator,
            id: id8803,
            init: init8804
        };
    },
    createWhileStatement: function createWhileStatement(test8805, body8806) {
        return {
            type: Syntax8438.WhileStatement,
            test: test8805,
            body: body8806
        };
    },
    createWithStatement: function createWithStatement(object8807, body8808) {
        return {
            type: Syntax8438.WithStatement,
            object: object8807,
            body: body8808
        };
    },
    createTemplateElement: function createTemplateElement(value8809, tail8810) {
        return {
            type: Syntax8438.TemplateElement,
            value: value8809,
            tail: tail8810
        };
    },
    createTemplateLiteral: function createTemplateLiteral(quasis8811, expressions8812) {
        return {
            type: Syntax8438.TemplateLiteral,
            quasis: quasis8811,
            expressions: expressions8812
        };
    },
    createSpreadElement: function createSpreadElement(argument8813) {
        return {
            type: Syntax8438.SpreadElement,
            argument: argument8813
        };
    },
    createTaggedTemplateExpression: function createTaggedTemplateExpression(tag8814, quasi8815) {
        return {
            type: Syntax8438.TaggedTemplateExpression,
            tag: tag8814,
            quasi: quasi8815
        };
    },
    createArrowFunctionExpression: function createArrowFunctionExpression(params8816, defaults8817, body8818, rest8819, expression8820) {
        return {
            type: Syntax8438.ArrowFunctionExpression,
            id: null,
            params: params8816,
            defaults: defaults8817,
            body: body8818,
            rest: rest8819,
            generator: false,
            expression: expression8820
        };
    },
    createMethodDefinition: function createMethodDefinition(propertyType8821, kind8822, key8823, value8824) {
        return {
            type: Syntax8438.MethodDefinition,
            key: key8823,
            value: value8824,
            kind: kind8822,
            "static": propertyType8821 === ClassPropertyType8443["static"]
        };
    },
    createClassBody: function createClassBody(body8825) {
        return {
            type: Syntax8438.ClassBody,
            body: body8825
        };
    },
    createClassExpression: function createClassExpression(id8826, superClass8827, body8828) {
        return {
            type: Syntax8438.ClassExpression,
            id: id8826,
            superClass: superClass8827,
            body: body8828
        };
    },
    createClassDeclaration: function createClassDeclaration(id8829, superClass8830, body8831) {
        return {
            type: Syntax8438.ClassDeclaration,
            id: id8829,
            superClass: superClass8830,
            body: body8831
        };
    },
    createExportSpecifier: function createExportSpecifier(id8832, name8833) {
        return {
            type: Syntax8438.ExportSpecifier,
            id: id8832,
            name: name8833
        };
    },
    createExportBatchSpecifier: function createExportBatchSpecifier() {
        return { type: Syntax8438.ExportBatchSpecifier };
    },
    createExportDeclaration: function createExportDeclaration(declaration8834, specifiers8835, source8836) {
        return {
            type: Syntax8438.ExportDeclaration,
            declaration: declaration8834,
            specifiers: specifiers8835,
            source: source8836
        };
    },
    createImportSpecifier: function createImportSpecifier(id8837, name8838) {
        return {
            type: Syntax8438.ImportSpecifier,
            id: id8837,
            name: name8838
        };
    },
    createImportDeclaration: function createImportDeclaration(specifiers8839, kind8840, source8841) {
        return {
            type: Syntax8438.ImportDeclaration,
            specifiers: specifiers8839,
            kind: kind8840,
            source: source8841
        };
    },
    createYieldExpression: function createYieldExpression(argument8842, delegate8843) {
        return {
            type: Syntax8438.YieldExpression,
            argument: argument8842,
            delegate: delegate8843
        };
    },
    createModuleDeclaration: function createModuleDeclaration(id8844, source8845, body8846) {
        return {
            type: Syntax8438.ModuleDeclaration,
            id: id8844,
            source: source8845,
            body: body8846
        };
    },
    createComprehensionExpression: function createComprehensionExpression(filter8847, blocks8848, body8849) {
        return {
            type: Syntax8438.ComprehensionExpression,
            filter: filter8847,
            blocks: blocks8848,
            body: body8849
        };
    }
};
function peekLineTerminator8498() {
    return lookahead8457.lineNumber !== lineNumber8447;
}
function throwError8499(token8850, messageFormat8851) {
    var error8852,
        args8853 = Array.prototype.slice.call(arguments, 2),
        msg8854 = messageFormat8851.replace(/%(\d)/g, function (whole8858, index8859) {
        assert8462(index8859 < args8853.length, "Message reference must be in range");
        return args8853[index8859];
    });
    var startIndex8855 = streamIndex8456 > 3 ? streamIndex8456 - 3 : 0;
    var toks8856 = "",
        tailingMsg8857 = "";
    if (tokenStream8455) {
        toks8856 = tokenStream8455.slice(startIndex8855, streamIndex8456 + 3).map(function (stx8860) {
            return stx8860.token.value;
        }).join(" ");
        tailingMsg8857 = "\n[... " + toks8856 + " ...]";
    }
    if (typeof token8850.lineNumber === "number") {
        error8852 = new Error("Line " + token8850.lineNumber + ": " + msg8854 + tailingMsg8857);
        error8852.index = token8850.range[0];
        error8852.lineNumber = token8850.lineNumber;
        error8852.column = token8850.range[0] - lineStart8448 + 1;
    } else {
        error8852 = new Error("Line " + lineNumber8447 + ": " + msg8854 + tailingMsg8857);
        error8852.index = index8446;
        error8852.lineNumber = lineNumber8447;
        error8852.column = index8446 - lineStart8448 + 1;
    }
    error8852.description = msg8854;
    throw error8852;
}
function throwErrorTolerant8500() {
    try {
        throwError8499.apply(null, arguments);
    } catch (e8861) {
        if (extra8461.errors) {
            extra8461.errors.push(e8861);
        } else {
            throw e8861;
        }
    }
}
function throwUnexpected8501(token8862) {
    if (token8862.type === Token8435.EOF) {
        throwError8499(token8862, Messages8440.UnexpectedEOS);
    }
    if (token8862.type === Token8435.NumericLiteral) {
        throwError8499(token8862, Messages8440.UnexpectedNumber);
    }
    if (token8862.type === Token8435.StringLiteral) {
        throwError8499(token8862, Messages8440.UnexpectedString);
    }
    if (token8862.type === Token8435.Identifier) {
        throwError8499(token8862, Messages8440.UnexpectedIdentifier);
    }
    if (token8862.type === Token8435.Keyword) {
        if (isFutureReservedWord8471(token8862.value)) {} else if (strict8445 && isStrictModeReservedWord8472(token8862.value)) {
            throwErrorTolerant8500(token8862, Messages8440.StrictReservedWord);
            return;
        }
        throwError8499(token8862, Messages8440.UnexpectedToken, token8862.value);
    }
    if (token8862.type === Token8435.Template) {
        throwError8499(token8862, Messages8440.UnexpectedTemplate, token8862.value.raw);
    }
    // BooleanLiteral, NullLiteral, or Punctuator.
    throwError8499(token8862, Messages8440.UnexpectedToken, token8862.value);
}
function expect8502(value8863) {
    var token8864 = lex8492();
    if (token8864.type !== Token8435.Punctuator || token8864.value !== value8863) {
        throwUnexpected8501(token8864);
    }
}
function expectKeyword8503(keyword8865) {
    var token8866 = lex8492();
    if (token8866.type !== Token8435.Keyword || token8866.value !== keyword8865) {
        throwUnexpected8501(token8866);
    }
}
function match8504(value8867) {
    return lookahead8457.type === Token8435.Punctuator && lookahead8457.value === value8867;
}
function matchKeyword8505(keyword8868) {
    return lookahead8457.type === Token8435.Keyword && lookahead8457.value === keyword8868;
}
function matchContextualKeyword8506(keyword8869) {
    return lookahead8457.type === Token8435.Identifier && lookahead8457.value === keyword8869;
}
function matchAssign8507() {
    var op8870;
    if (lookahead8457.type !== Token8435.Punctuator) {
        return false;
    }
    op8870 = lookahead8457.value;
    return op8870 === "=" || op8870 === "*=" || op8870 === "/=" || op8870 === "%=" || op8870 === "+=" || op8870 === "-=" || op8870 === "<<=" || op8870 === ">>=" || op8870 === ">>>=" || op8870 === "&=" || op8870 === "^=" || op8870 === "|=";
}
function consumeSemicolon8508() {
    var line8871, ch8872;
    ch8872 = lookahead8457.value ? String(lookahead8457.value).charCodeAt(0) : -1;
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    ch8872 === 59) {
        lex8492();
        return;
    }
    if (lookahead8457.lineNumber !== lineNumber8447) {
        return;
    }
    if (match8504(";")) {
        lex8492();
        return;
    }
    if (lookahead8457.type !== Token8435.EOF && !match8504("}")) {
        throwUnexpected8501(lookahead8457);
    }
}
function isLeftHandSide8509(expr8873) {
    return expr8873.type === Syntax8438.Identifier || expr8873.type === Syntax8438.MemberExpression;
}
function isAssignableLeftHandSide8510(expr8874) {
    return isLeftHandSide8509(expr8874) || expr8874.type === Syntax8438.ObjectPattern || expr8874.type === Syntax8438.ArrayPattern;
}
function parseArrayInitialiser8511() {
    var elements8875 = [],
        blocks8876 = [],
        filter8877 = null,
        tmp8878,
        possiblecomprehension8879 = true,
        body8880,
        marker8881 = markerCreate8495();
    expect8502("[");
    while (!match8504("]")) {
        if (lookahead8457.value === "for" && lookahead8457.type === Token8435.Keyword) {
            if (!possiblecomprehension8879) {
                throwError8499({}, Messages8440.ComprehensionError);
            }
            matchKeyword8505("for");
            tmp8878 = parseForStatement8559({ ignoreBody: true });
            tmp8878.of = tmp8878.type === Syntax8438.ForOfStatement;
            tmp8878.type = Syntax8438.ComprehensionBlock;
            if (tmp8878.left.kind) {
                // can't be let or const
                throwError8499({}, Messages8440.ComprehensionError);
            }
            blocks8876.push(tmp8878);
        } else if (lookahead8457.value === "if" && lookahead8457.type === Token8435.Keyword) {
            if (!possiblecomprehension8879) {
                throwError8499({}, Messages8440.ComprehensionError);
            }
            expectKeyword8503("if");
            expect8502("(");
            filter8877 = parseExpression8539();
            expect8502(")");
        } else if (lookahead8457.value === "," && lookahead8457.type === Token8435.Punctuator) {
            possiblecomprehension8879 = false;
            // no longer allowed.
            lex8492();
            elements8875.push(null);
        } else {
            tmp8878 = parseSpreadOrAssignmentExpression8522();
            elements8875.push(tmp8878);
            if (tmp8878 && tmp8878.type === Syntax8438.SpreadElement) {
                if (!match8504("]")) {
                    throwError8499({}, Messages8440.ElementAfterSpreadElement);
                }
            } else if (!(match8504("]") || matchKeyword8505("for") || matchKeyword8505("if"))) {
                expect8502(",");
                // this lexes.
                possiblecomprehension8879 = false;
            }
        }
    }
    expect8502("]");
    if (filter8877 && !blocks8876.length) {
        throwError8499({}, Messages8440.ComprehensionRequiresBlock);
    }
    if (blocks8876.length) {
        if (elements8875.length !== 1) {
            throwError8499({}, Messages8440.ComprehensionError);
        }
        return markerApply8497(marker8881, delegate8454.createComprehensionExpression(filter8877, blocks8876, elements8875[0]));
    }
    return markerApply8497(marker8881, delegate8454.createArrayExpression(elements8875));
}
function parsePropertyFunction8512(options8882) {
    var previousStrict8883,
        previousYieldAllowed8884,
        params8885,
        defaults8886,
        body8887,
        marker8888 = markerCreate8495();
    previousStrict8883 = strict8445;
    previousYieldAllowed8884 = state8459.yieldAllowed;
    state8459.yieldAllowed = options8882.generator;
    params8885 = options8882.params || [];
    defaults8886 = options8882.defaults || [];
    body8887 = parseConciseBody8571();
    if (options8882.name && strict8445 && isRestrictedWord8473(params8885[0].name)) {
        throwErrorTolerant8500(options8882.name, Messages8440.StrictParamName);
    }
    strict8445 = previousStrict8883;
    state8459.yieldAllowed = previousYieldAllowed8884;
    return markerApply8497(marker8888, delegate8454.createFunctionExpression(null, params8885, defaults8886, body8887, options8882.rest || null, options8882.generator, body8887.type !== Syntax8438.BlockStatement));
}
function parsePropertyMethodFunction8513(options8889) {
    var previousStrict8890, tmp8891, method8892;
    previousStrict8890 = strict8445;
    strict8445 = true;
    tmp8891 = parseParams8575();
    if (tmp8891.stricted) {
        throwErrorTolerant8500(tmp8891.stricted, tmp8891.message);
    }
    method8892 = parsePropertyFunction8512({
        params: tmp8891.params,
        defaults: tmp8891.defaults,
        rest: tmp8891.rest,
        generator: options8889.generator
    });
    strict8445 = previousStrict8890;
    return method8892;
}
function parseObjectPropertyKey8514() {
    var marker8893 = markerCreate8495(),
        token8894 = lex8492(),
        propertyKey8895,
        result8896;
    if ( // Note: This function is called only from parseObjectProperty(), where
    // EOF and Punctuator tokens are already filtered out.
    token8894.type === Token8435.StringLiteral || token8894.type === Token8435.NumericLiteral) {
        if (strict8445 && token8894.octal) {
            throwErrorTolerant8500(token8894, Messages8440.StrictOctalLiteral);
        }
        return markerApply8497(marker8893, delegate8454.createLiteral(token8894));
    }
    if (token8894.type === Token8435.Punctuator && token8894.value === "[") {
        // For computed properties we should skip the [ and ], and
        // capture in marker only the assignment expression itself.
        marker8893 = markerCreate8495();
        propertyKey8895 = parseAssignmentExpression8538();
        result8896 = markerApply8497(marker8893, propertyKey8895);
        expect8502("]");
        return result8896;
    }
    return markerApply8497(marker8893, delegate8454.createIdentifier(token8894.value));
}
function parseObjectProperty8515() {
    var token8897,
        key8898,
        id8899,
        value8900,
        param8901,
        expr8902,
        computed8903,
        marker8904 = markerCreate8495();
    token8897 = lookahead8457;
    computed8903 = token8897.value === "[" && token8897.type === Token8435.Punctuator;
    if (token8897.type === Token8435.Identifier || computed8903) {
        id8899 = parseObjectPropertyKey8514();
        if ( // Property Assignment: Getter and Setter.
        token8897.value === "get" && !(match8504(":") || match8504("("))) {
            computed8903 = lookahead8457.value === "[";
            key8898 = parseObjectPropertyKey8514();
            expect8502("(");
            expect8502(")");
            return markerApply8497(marker8904, delegate8454.createProperty("get", key8898, parsePropertyFunction8512({ generator: false }), false, false, computed8903));
        }
        if (token8897.value === "set" && !(match8504(":") || match8504("("))) {
            computed8903 = lookahead8457.value === "[";
            key8898 = parseObjectPropertyKey8514();
            expect8502("(");
            token8897 = lookahead8457;
            param8901 = [parseVariableIdentifier8542()];
            expect8502(")");
            return markerApply8497(marker8904, delegate8454.createProperty("set", key8898, parsePropertyFunction8512({
                params: param8901,
                generator: false,
                name: token8897
            }), false, false, computed8903));
        }
        if (match8504(":")) {
            lex8492();
            return markerApply8497(marker8904, delegate8454.createProperty("init", id8899, parseAssignmentExpression8538(), false, false, computed8903));
        }
        if (match8504("(")) {
            return markerApply8497(marker8904, delegate8454.createProperty("init", id8899, parsePropertyMethodFunction8513({ generator: false }), true, false, computed8903));
        }
        if (computed8903) {
            // Computed properties can only be used with full notation.
            throwUnexpected8501(lookahead8457);
        }
        return markerApply8497(marker8904, delegate8454.createProperty("init", id8899, id8899, false, true, false));
    }
    if (token8897.type === Token8435.EOF || token8897.type === Token8435.Punctuator) {
        if (!match8504("*")) {
            throwUnexpected8501(token8897);
        }
        lex8492();
        computed8903 = lookahead8457.type === Token8435.Punctuator && lookahead8457.value === "[";
        id8899 = parseObjectPropertyKey8514();
        if (!match8504("(")) {
            throwUnexpected8501(lex8492());
        }
        return markerApply8497(marker8904, delegate8454.createProperty("init", id8899, parsePropertyMethodFunction8513({ generator: true }), true, false, computed8903));
    }
    key8898 = parseObjectPropertyKey8514();
    if (match8504(":")) {
        lex8492();
        return markerApply8497(marker8904, delegate8454.createProperty("init", key8898, parseAssignmentExpression8538(), false, false, false));
    }
    if (match8504("(")) {
        return markerApply8497(marker8904, delegate8454.createProperty("init", key8898, parsePropertyMethodFunction8513({ generator: false }), true, false, false));
    }
    throwUnexpected8501(lex8492());
}
function parseObjectInitialiser8516() {
    var properties8905 = [],
        property8906,
        name8907,
        key8908,
        kind8909,
        map8910 = {},
        toString8911 = String,
        marker8912 = markerCreate8495();
    expect8502("{");
    while (!match8504("}")) {
        property8906 = parseObjectProperty8515();
        if (property8906.key.type === Syntax8438.Identifier) {
            name8907 = property8906.key.name;
        } else {
            name8907 = toString8911(property8906.key.value);
        }
        kind8909 = property8906.kind === "init" ? PropertyKind8439.Data : property8906.kind === "get" ? PropertyKind8439.Get : PropertyKind8439.Set;
        key8908 = "$" + name8907;
        if (Object.prototype.hasOwnProperty.call(map8910, key8908)) {
            if (map8910[key8908] === PropertyKind8439.Data) {
                if (strict8445 && kind8909 === PropertyKind8439.Data) {
                    throwErrorTolerant8500({}, Messages8440.StrictDuplicateProperty);
                } else if (kind8909 !== PropertyKind8439.Data) {
                    throwErrorTolerant8500({}, Messages8440.AccessorDataProperty);
                }
            } else {
                if (kind8909 === PropertyKind8439.Data) {
                    throwErrorTolerant8500({}, Messages8440.AccessorDataProperty);
                } else if (map8910[key8908] & kind8909) {
                    throwErrorTolerant8500({}, Messages8440.AccessorGetSet);
                }
            }
            map8910[key8908] |= kind8909;
        } else {
            map8910[key8908] = kind8909;
        }
        properties8905.push(property8906);
        if (!match8504("}")) {
            expect8502(",");
        }
    }
    expect8502("}");
    return markerApply8497(marker8912, delegate8454.createObjectExpression(properties8905));
}
function parseTemplateElement8517(option8913) {
    var marker8914 = markerCreate8495(),
        token8915 = lex8492();
    if (strict8445 && token8915.octal) {
        throwError8499(token8915, Messages8440.StrictOctalLiteral);
    }
    return markerApply8497(marker8914, delegate8454.createTemplateElement({
        raw: token8915.value.raw,
        cooked: token8915.value.cooked
    }, token8915.tail));
}
function parseTemplateLiteral8518() {
    var quasi8916,
        quasis8917,
        expressions8918,
        marker8919 = markerCreate8495();
    quasi8916 = parseTemplateElement8517({ head: true });
    quasis8917 = [quasi8916];
    expressions8918 = [];
    while (!quasi8916.tail) {
        expressions8918.push(parseExpression8539());
        quasi8916 = parseTemplateElement8517({ head: false });
        quasis8917.push(quasi8916);
    }
    return markerApply8497(marker8919, delegate8454.createTemplateLiteral(quasis8917, expressions8918));
}
function parseGroupExpression8519() {
    var expr8920;
    expect8502("(");
    ++state8459.parenthesizedCount;
    expr8920 = parseExpression8539();
    expect8502(")");
    return expr8920;
}
function parsePrimaryExpression8520() {
    var type8921, token8922, resolvedIdent8923, marker8924, expr8925;
    token8922 = lookahead8457;
    type8921 = lookahead8457.type;
    if (type8921 === Token8435.Identifier) {
        marker8924 = markerCreate8495();
        resolvedIdent8923 = expander8434.resolve(tokenStream8455[lookaheadIndex8458], phase8460);
        lex8492();
        return markerApply8497(marker8924, delegate8454.createIdentifier(resolvedIdent8923));
    }
    if (type8921 === Token8435.StringLiteral || type8921 === Token8435.NumericLiteral) {
        if (strict8445 && lookahead8457.octal) {
            throwErrorTolerant8500(lookahead8457, Messages8440.StrictOctalLiteral);
        }
        marker8924 = markerCreate8495();
        return markerApply8497(marker8924, delegate8454.createLiteral(lex8492()));
    }
    if (type8921 === Token8435.Keyword) {
        if (matchKeyword8505("this")) {
            marker8924 = markerCreate8495();
            lex8492();
            return markerApply8497(marker8924, delegate8454.createThisExpression());
        }
        if (matchKeyword8505("function")) {
            return parseFunctionExpression8577();
        }
        if (matchKeyword8505("class")) {
            return parseClassExpression8582();
        }
        if (matchKeyword8505("super")) {
            marker8924 = markerCreate8495();
            lex8492();
            return markerApply8497(marker8924, delegate8454.createIdentifier("super"));
        }
    }
    if (type8921 === Token8435.BooleanLiteral) {
        marker8924 = markerCreate8495();
        token8922 = lex8492();
        if (typeof token8922.value !== "boolean") {
            assert8462(token8922.value === "true" || token8922.value === "false", "exporting either true or false as a string not: " + token8922.value);
            token8922.value = token8922.value === "true";
        }
        return markerApply8497(marker8924, delegate8454.createLiteral(token8922));
    }
    if (type8921 === Token8435.NullLiteral) {
        marker8924 = markerCreate8495();
        token8922 = lex8492();
        token8922.value = null;
        return markerApply8497(marker8924, delegate8454.createLiteral(token8922));
    }
    if (match8504("[")) {
        return parseArrayInitialiser8511();
    }
    if (match8504("{")) {
        return parseObjectInitialiser8516();
    }
    if (match8504("(")) {
        return parseGroupExpression8519();
    }
    if (lookahead8457.type === Token8435.RegularExpression) {
        marker8924 = markerCreate8495();
        return markerApply8497(marker8924, delegate8454.createLiteral(lex8492()));
    }
    if (type8921 === Token8435.Template) {
        return parseTemplateLiteral8518();
    }
    throwUnexpected8501(lex8492());
}
function parseArguments8521() {
    var args8926 = [],
        arg8927;
    expect8502("(");
    if (!match8504(")")) {
        while (streamIndex8456 < length8453) {
            arg8927 = parseSpreadOrAssignmentExpression8522();
            args8926.push(arg8927);
            if (match8504(")")) {
                break;
            } else if (arg8927.type === Syntax8438.SpreadElement) {
                throwError8499({}, Messages8440.ElementAfterSpreadElement);
            }
            expect8502(",");
        }
    }
    expect8502(")");
    return args8926;
}
function parseSpreadOrAssignmentExpression8522() {
    if (match8504("...")) {
        var marker8928 = markerCreate8495();
        lex8492();
        return markerApply8497(marker8928, delegate8454.createSpreadElement(parseAssignmentExpression8538()));
    }
    return parseAssignmentExpression8538();
}
function parseNonComputedProperty8523(toResolve8929) {
    var marker8930 = markerCreate8495(),
        resolvedIdent8931,
        token8932;
    if (toResolve8929) {
        resolvedIdent8931 = expander8434.resolve(tokenStream8455[lookaheadIndex8458], phase8460);
    }
    token8932 = lex8492();
    resolvedIdent8931 = toResolve8929 ? resolvedIdent8931 : token8932.value;
    if (!isIdentifierName8489(token8932)) {
        throwUnexpected8501(token8932);
    }
    return markerApply8497(marker8930, delegate8454.createIdentifier(resolvedIdent8931));
}
function parseNonComputedMember8524() {
    expect8502(".");
    return parseNonComputedProperty8523();
}
function parseComputedMember8525() {
    var expr8933;
    expect8502("[");
    expr8933 = parseExpression8539();
    expect8502("]");
    return expr8933;
}
function parseNewExpression8526() {
    var callee8934,
        args8935,
        marker8936 = markerCreate8495();
    expectKeyword8503("new");
    callee8934 = parseLeftHandSideExpression8528();
    args8935 = match8504("(") ? parseArguments8521() : [];
    return markerApply8497(marker8936, delegate8454.createNewExpression(callee8934, args8935));
}
function parseLeftHandSideExpressionAllowCall8527() {
    var expr8937,
        args8938,
        marker8939 = markerCreate8495();
    expr8937 = matchKeyword8505("new") ? parseNewExpression8526() : parsePrimaryExpression8520();
    while (match8504(".") || match8504("[") || match8504("(") || lookahead8457.type === Token8435.Template) {
        if (match8504("(")) {
            args8938 = parseArguments8521();
            expr8937 = markerApply8497(marker8939, delegate8454.createCallExpression(expr8937, args8938));
        } else if (match8504("[")) {
            expr8937 = markerApply8497(marker8939, delegate8454.createMemberExpression("[", expr8937, parseComputedMember8525()));
        } else if (match8504(".")) {
            expr8937 = markerApply8497(marker8939, delegate8454.createMemberExpression(".", expr8937, parseNonComputedMember8524()));
        } else {
            expr8937 = markerApply8497(marker8939, delegate8454.createTaggedTemplateExpression(expr8937, parseTemplateLiteral8518()));
        }
    }
    return expr8937;
}
function parseLeftHandSideExpression8528() {
    var expr8940,
        marker8941 = markerCreate8495();
    expr8940 = matchKeyword8505("new") ? parseNewExpression8526() : parsePrimaryExpression8520();
    while (match8504(".") || match8504("[") || lookahead8457.type === Token8435.Template) {
        if (match8504("[")) {
            expr8940 = markerApply8497(marker8941, delegate8454.createMemberExpression("[", expr8940, parseComputedMember8525()));
        } else if (match8504(".")) {
            expr8940 = markerApply8497(marker8941, delegate8454.createMemberExpression(".", expr8940, parseNonComputedMember8524()));
        } else {
            expr8940 = markerApply8497(marker8941, delegate8454.createTaggedTemplateExpression(expr8940, parseTemplateLiteral8518()));
        }
    }
    return expr8940;
}
function parsePostfixExpression8529() {
    var marker8942 = markerCreate8495(),
        expr8943 = parseLeftHandSideExpressionAllowCall8527(),
        token8944;
    if (lookahead8457.type !== Token8435.Punctuator) {
        return expr8943;
    }
    if ((match8504("++") || match8504("--")) && !peekLineTerminator8498()) {
        if ( // 11.3.1, 11.3.2
        strict8445 && expr8943.type === Syntax8438.Identifier && isRestrictedWord8473(expr8943.name)) {
            throwErrorTolerant8500({}, Messages8440.StrictLHSPostfix);
        }
        if (!isLeftHandSide8509(expr8943)) {
            throwError8499({}, Messages8440.InvalidLHSInAssignment);
        }
        token8944 = lex8492();
        expr8943 = markerApply8497(marker8942, delegate8454.createPostfixExpression(token8944.value, expr8943));
    }
    return expr8943;
}
function parseUnaryExpression8530() {
    var marker8945, token8946, expr8947;
    if (lookahead8457.type !== Token8435.Punctuator && lookahead8457.type !== Token8435.Keyword) {
        return parsePostfixExpression8529();
    }
    if (match8504("++") || match8504("--")) {
        marker8945 = markerCreate8495();
        token8946 = lex8492();
        expr8947 = parseUnaryExpression8530();
        if ( // 11.4.4, 11.4.5
        strict8445 && expr8947.type === Syntax8438.Identifier && isRestrictedWord8473(expr8947.name)) {
            throwErrorTolerant8500({}, Messages8440.StrictLHSPrefix);
        }
        if (!isLeftHandSide8509(expr8947)) {
            throwError8499({}, Messages8440.InvalidLHSInAssignment);
        }
        return markerApply8497(marker8945, delegate8454.createUnaryExpression(token8946.value, expr8947));
    }
    if (match8504("+") || match8504("-") || match8504("~") || match8504("!")) {
        marker8945 = markerCreate8495();
        token8946 = lex8492();
        expr8947 = parseUnaryExpression8530();
        return markerApply8497(marker8945, delegate8454.createUnaryExpression(token8946.value, expr8947));
    }
    if (matchKeyword8505("delete") || matchKeyword8505("void") || matchKeyword8505("typeof")) {
        marker8945 = markerCreate8495();
        token8946 = lex8492();
        expr8947 = parseUnaryExpression8530();
        expr8947 = markerApply8497(marker8945, delegate8454.createUnaryExpression(token8946.value, expr8947));
        if (strict8445 && expr8947.operator === "delete" && expr8947.argument.type === Syntax8438.Identifier) {
            throwErrorTolerant8500({}, Messages8440.StrictDelete);
        }
        return expr8947;
    }
    return parsePostfixExpression8529();
}
function binaryPrecedence8531(token8948, allowIn8949) {
    var prec8950 = 0;
    if (token8948.type !== Token8435.Punctuator && token8948.type !== Token8435.Keyword) {
        return 0;
    }
    switch (token8948.value) {
        case "||":
            prec8950 = 1;
            break;
        case "&&":
            prec8950 = 2;
            break;
        case "|":
            prec8950 = 3;
            break;
        case "^":
            prec8950 = 4;
            break;
        case "&":
            prec8950 = 5;
            break;
        case "==":
        case "!=":
        case "===":
        case "!==":
            prec8950 = 6;
            break;
        case "<":
        case ">":
        case "<=":
        case ">=":
        case "instanceof":
            prec8950 = 7;
            break;
        case "in":
            prec8950 = allowIn8949 ? 7 : 0;
            break;
        case "<<":
        case ">>":
        case ">>>":
            prec8950 = 8;
            break;
        case "+":
        case "-":
            prec8950 = 9;
            break;
        case "*":
        case "/":
        case "%":
            prec8950 = 11;
            break;
        default:
            break;
    }
    return prec8950;
}
function parseBinaryExpression8532() {
    var expr8951, token8952, prec8953, previousAllowIn8954, stack8955, right8956, operator8957, left8958, i8959, marker8960, markers8961;
    previousAllowIn8954 = state8459.allowIn;
    state8459.allowIn = true;
    marker8960 = markerCreate8495();
    left8958 = parseUnaryExpression8530();
    token8952 = lookahead8457;
    prec8953 = binaryPrecedence8531(token8952, previousAllowIn8954);
    if (prec8953 === 0) {
        return left8958;
    }
    token8952.prec = prec8953;
    lex8492();
    markers8961 = [marker8960, markerCreate8495()];
    right8956 = parseUnaryExpression8530();
    stack8955 = [left8958, token8952, right8956];
    while ((prec8953 = binaryPrecedence8531(lookahead8457, previousAllowIn8954)) > 0) {
        while ( // Reduce: make a binary expression from the three topmost entries.
        stack8955.length > 2 && prec8953 <= stack8955[stack8955.length - 2].prec) {
            right8956 = stack8955.pop();
            operator8957 = stack8955.pop().value;
            left8958 = stack8955.pop();
            expr8951 = delegate8454.createBinaryExpression(operator8957, left8958, right8956);
            markers8961.pop();
            marker8960 = markers8961.pop();
            markerApply8497(marker8960, expr8951);
            stack8955.push(expr8951);
            markers8961.push(marker8960);
        }
        // Shift.
        token8952 = lex8492();
        token8952.prec = prec8953;
        stack8955.push(token8952);
        markers8961.push(markerCreate8495());
        expr8951 = parseUnaryExpression8530();
        stack8955.push(expr8951);
    }
    state8459.allowIn = previousAllowIn8954;
    // Final reduce to clean-up the stack.
    i8959 = stack8955.length - 1;
    expr8951 = stack8955[i8959];
    markers8961.pop();
    while (i8959 > 1) {
        expr8951 = delegate8454.createBinaryExpression(stack8955[i8959 - 1].value, stack8955[i8959 - 2], expr8951);
        i8959 -= 2;
        marker8960 = markers8961.pop();
        markerApply8497(marker8960, expr8951);
    }
    return expr8951;
}
function parseConditionalExpression8533() {
    var expr8962,
        previousAllowIn8963,
        consequent8964,
        alternate8965,
        marker8966 = markerCreate8495();
    expr8962 = parseBinaryExpression8532();
    if (match8504("?")) {
        lex8492();
        previousAllowIn8963 = state8459.allowIn;
        state8459.allowIn = true;
        consequent8964 = parseAssignmentExpression8538();
        state8459.allowIn = previousAllowIn8963;
        expect8502(":");
        alternate8965 = parseAssignmentExpression8538();
        expr8962 = markerApply8497(marker8966, delegate8454.createConditionalExpression(expr8962, consequent8964, alternate8965));
    }
    return expr8962;
}
function reinterpretAsAssignmentBindingPattern8534(expr8967) {
    var i8968, len8969, property8970, element8971;
    if (expr8967.type === Syntax8438.ObjectExpression) {
        expr8967.type = Syntax8438.ObjectPattern;
        for (i8968 = 0, len8969 = expr8967.properties.length; i8968 < len8969; i8968 += 1) {
            property8970 = expr8967.properties[i8968];
            if (property8970.kind !== "init") {
                throwError8499({}, Messages8440.InvalidLHSInAssignment);
            }
            reinterpretAsAssignmentBindingPattern8534(property8970.value);
        }
    } else if (expr8967.type === Syntax8438.ArrayExpression) {
        expr8967.type = Syntax8438.ArrayPattern;
        for (i8968 = 0, len8969 = expr8967.elements.length; i8968 < len8969; i8968 += 1) {
            element8971 = expr8967.elements[i8968];
            if (element8971) {
                reinterpretAsAssignmentBindingPattern8534(element8971);
            }
        }
    } else if (expr8967.type === Syntax8438.Identifier) {
        if (isRestrictedWord8473(expr8967.name)) {
            throwError8499({}, Messages8440.InvalidLHSInAssignment);
        }
    } else if (expr8967.type === Syntax8438.SpreadElement) {
        reinterpretAsAssignmentBindingPattern8534(expr8967.argument);
        if (expr8967.argument.type === Syntax8438.ObjectPattern) {
            throwError8499({}, Messages8440.ObjectPatternAsSpread);
        }
    } else {
        if (expr8967.type !== Syntax8438.MemberExpression && expr8967.type !== Syntax8438.CallExpression && expr8967.type !== Syntax8438.NewExpression) {
            throwError8499({}, Messages8440.InvalidLHSInAssignment);
        }
    }
}
function reinterpretAsDestructuredParameter8535(options8972, expr8973) {
    var i8974, len8975, property8976, element8977;
    if (expr8973.type === Syntax8438.ObjectExpression) {
        expr8973.type = Syntax8438.ObjectPattern;
        for (i8974 = 0, len8975 = expr8973.properties.length; i8974 < len8975; i8974 += 1) {
            property8976 = expr8973.properties[i8974];
            if (property8976.kind !== "init") {
                throwError8499({}, Messages8440.InvalidLHSInFormalsList);
            }
            reinterpretAsDestructuredParameter8535(options8972, property8976.value);
        }
    } else if (expr8973.type === Syntax8438.ArrayExpression) {
        expr8973.type = Syntax8438.ArrayPattern;
        for (i8974 = 0, len8975 = expr8973.elements.length; i8974 < len8975; i8974 += 1) {
            element8977 = expr8973.elements[i8974];
            if (element8977) {
                reinterpretAsDestructuredParameter8535(options8972, element8977);
            }
        }
    } else if (expr8973.type === Syntax8438.Identifier) {
        validateParam8573(options8972, expr8973, expr8973.name);
    } else {
        if (expr8973.type !== Syntax8438.MemberExpression) {
            throwError8499({}, Messages8440.InvalidLHSInFormalsList);
        }
    }
}
function reinterpretAsCoverFormalsList8536(expressions8978) {
    var i8979, len8980, param8981, params8982, defaults8983, defaultCount8984, options8985, rest8986;
    params8982 = [];
    defaults8983 = [];
    defaultCount8984 = 0;
    rest8986 = null;
    options8985 = { paramSet: {} };
    for (i8979 = 0, len8980 = expressions8978.length; i8979 < len8980; i8979 += 1) {
        param8981 = expressions8978[i8979];
        if (param8981.type === Syntax8438.Identifier) {
            params8982.push(param8981);
            defaults8983.push(null);
            validateParam8573(options8985, param8981, param8981.name);
        } else if (param8981.type === Syntax8438.ObjectExpression || param8981.type === Syntax8438.ArrayExpression) {
            reinterpretAsDestructuredParameter8535(options8985, param8981);
            params8982.push(param8981);
            defaults8983.push(null);
        } else if (param8981.type === Syntax8438.SpreadElement) {
            assert8462(i8979 === len8980 - 1, "It is guaranteed that SpreadElement is last element by parseExpression");
            reinterpretAsDestructuredParameter8535(options8985, param8981.argument);
            rest8986 = param8981.argument;
        } else if (param8981.type === Syntax8438.AssignmentExpression) {
            params8982.push(param8981.left);
            defaults8983.push(param8981.right);
            ++defaultCount8984;
            validateParam8573(options8985, param8981.left, param8981.left.name);
        } else {
            return null;
        }
    }
    if (options8985.message === Messages8440.StrictParamDupe) {
        throwError8499(strict8445 ? options8985.stricted : options8985.firstRestricted, options8985.message);
    }
    if (defaultCount8984 === 0) {
        defaults8983 = [];
    }
    return {
        params: params8982,
        defaults: defaults8983,
        rest: rest8986,
        stricted: options8985.stricted,
        firstRestricted: options8985.firstRestricted,
        message: options8985.message
    };
}
function parseArrowFunctionExpression8537(options8987, marker8988) {
    var previousStrict8989, previousYieldAllowed8990, body8991;
    expect8502("=>");
    previousStrict8989 = strict8445;
    previousYieldAllowed8990 = state8459.yieldAllowed;
    state8459.yieldAllowed = false;
    body8991 = parseConciseBody8571();
    if (strict8445 && options8987.firstRestricted) {
        throwError8499(options8987.firstRestricted, options8987.message);
    }
    if (strict8445 && options8987.stricted) {
        throwErrorTolerant8500(options8987.stricted, options8987.message);
    }
    strict8445 = previousStrict8989;
    state8459.yieldAllowed = previousYieldAllowed8990;
    return markerApply8497(marker8988, delegate8454.createArrowFunctionExpression(options8987.params, options8987.defaults, body8991, options8987.rest, body8991.type !== Syntax8438.BlockStatement));
}
function parseAssignmentExpression8538() {
    var marker8992, expr8993, token8994, params8995, oldParenthesizedCount8996;
    if ( // Note that 'yield' is treated as a keyword in strict mode, but a
    // contextual keyword (identifier) in non-strict mode, so we need
    // to use matchKeyword and matchContextualKeyword appropriately.
    state8459.yieldAllowed && matchContextualKeyword8506("yield") || strict8445 && matchKeyword8505("yield")) {
        return parseYieldExpression8578();
    }
    oldParenthesizedCount8996 = state8459.parenthesizedCount;
    marker8992 = markerCreate8495();
    if (match8504("(")) {
        token8994 = lookahead28494();
        if (token8994.type === Token8435.Punctuator && token8994.value === ")" || token8994.value === "...") {
            params8995 = parseParams8575();
            if (!match8504("=>")) {
                throwUnexpected8501(lex8492());
            }
            return parseArrowFunctionExpression8537(params8995, marker8992);
        }
    }
    token8994 = lookahead8457;
    expr8993 = parseConditionalExpression8533();
    if (match8504("=>") && (state8459.parenthesizedCount === oldParenthesizedCount8996 || state8459.parenthesizedCount === oldParenthesizedCount8996 + 1)) {
        if (expr8993.type === Syntax8438.Identifier) {
            params8995 = reinterpretAsCoverFormalsList8536([expr8993]);
        } else if (expr8993.type === Syntax8438.SequenceExpression) {
            params8995 = reinterpretAsCoverFormalsList8536(expr8993.expressions);
        }
        if (params8995) {
            return parseArrowFunctionExpression8537(params8995, marker8992);
        }
    }
    if (matchAssign8507()) {
        if ( // 11.13.1
        strict8445 && expr8993.type === Syntax8438.Identifier && isRestrictedWord8473(expr8993.name)) {
            throwErrorTolerant8500(token8994, Messages8440.StrictLHSAssignment);
        }
        if ( // ES.next draf 11.13 Runtime Semantics step 1
        match8504("=") && (expr8993.type === Syntax8438.ObjectExpression || expr8993.type === Syntax8438.ArrayExpression)) {
            reinterpretAsAssignmentBindingPattern8534(expr8993);
        } else if (!isLeftHandSide8509(expr8993)) {
            throwError8499({}, Messages8440.InvalidLHSInAssignment);
        }
        expr8993 = markerApply8497(marker8992, delegate8454.createAssignmentExpression(lex8492().value, expr8993, parseAssignmentExpression8538()));
    }
    return expr8993;
}
function parseExpression8539() {
    var marker8997, expr8998, expressions8999, sequence9000, coverFormalsList9001, spreadFound9002, oldParenthesizedCount9003;
    oldParenthesizedCount9003 = state8459.parenthesizedCount;
    marker8997 = markerCreate8495();
    expr8998 = parseAssignmentExpression8538();
    expressions8999 = [expr8998];
    if (match8504(",")) {
        while (streamIndex8456 < length8453) {
            if (!match8504(",")) {
                break;
            }
            lex8492();
            expr8998 = parseSpreadOrAssignmentExpression8522();
            expressions8999.push(expr8998);
            if (expr8998.type === Syntax8438.SpreadElement) {
                spreadFound9002 = true;
                if (!match8504(")")) {
                    throwError8499({}, Messages8440.ElementAfterSpreadElement);
                }
                break;
            }
        }
        sequence9000 = markerApply8497(marker8997, delegate8454.createSequenceExpression(expressions8999));
    }
    if (match8504("=>")) {
        if ( // Do not allow nested parentheses on the LHS of the =>.
        state8459.parenthesizedCount === oldParenthesizedCount9003 || state8459.parenthesizedCount === oldParenthesizedCount9003 + 1) {
            expr8998 = expr8998.type === Syntax8438.SequenceExpression ? expr8998.expressions : expressions8999;
            coverFormalsList9001 = reinterpretAsCoverFormalsList8536(expr8998);
            if (coverFormalsList9001) {
                return parseArrowFunctionExpression8537(coverFormalsList9001, marker8997);
            }
        }
        throwUnexpected8501(lex8492());
    }
    if (spreadFound9002 && lookahead28494().value !== "=>") {
        throwError8499({}, Messages8440.IllegalSpread);
    }
    return sequence9000 || expr8998;
}
function parseStatementList8540() {
    var list9004 = [],
        statement9005;
    while (streamIndex8456 < length8453) {
        if (match8504("}")) {
            break;
        }
        statement9005 = parseSourceElement8585();
        if (typeof statement9005 === "undefined") {
            break;
        }
        list9004.push(statement9005);
    }
    return list9004;
}
function parseBlock8541() {
    var block9006,
        marker9007 = markerCreate8495();
    expect8502("{");
    block9006 = parseStatementList8540();
    expect8502("}");
    return markerApply8497(marker9007, delegate8454.createBlockStatement(block9006));
}
function parseVariableIdentifier8542() {
    var token9008 = lookahead8457,
        resolvedIdent9009,
        marker9010 = markerCreate8495();
    if (token9008.type !== Token8435.Identifier) {
        throwUnexpected8501(token9008);
    }
    resolvedIdent9009 = expander8434.resolve(tokenStream8455[lookaheadIndex8458], phase8460);
    lex8492();
    return markerApply8497(marker9010, delegate8454.createIdentifier(resolvedIdent9009));
}
function parseVariableDeclaration8543(kind9011) {
    var id9012,
        marker9013 = markerCreate8495(),
        init9014 = null;
    if (match8504("{")) {
        id9012 = parseObjectInitialiser8516();
        reinterpretAsAssignmentBindingPattern8534(id9012);
    } else if (match8504("[")) {
        id9012 = parseArrayInitialiser8511();
        reinterpretAsAssignmentBindingPattern8534(id9012);
    } else {
        id9012 = state8459.allowKeyword ? parseNonComputedProperty8523() : parseVariableIdentifier8542();
        if ( // 12.2.1
        strict8445 && isRestrictedWord8473(id9012.name)) {
            throwErrorTolerant8500({}, Messages8440.StrictVarName);
        }
    }
    if (kind9011 === "const") {
        if (!match8504("=")) {
            throwError8499({}, Messages8440.NoUnintializedConst);
        }
        expect8502("=");
        init9014 = parseAssignmentExpression8538();
    } else if (match8504("=")) {
        lex8492();
        init9014 = parseAssignmentExpression8538();
    }
    return markerApply8497(marker9013, delegate8454.createVariableDeclarator(id9012, init9014));
}
function parseVariableDeclarationList8544(kind9015) {
    var list9016 = [];
    do {
        list9016.push(parseVariableDeclaration8543(kind9015));
        if (!match8504(",")) {
            break;
        }
        lex8492();
    } while (streamIndex8456 < length8453);
    return list9016;
}
function parseVariableStatement8545() {
    var declarations9017,
        marker9018 = markerCreate8495();
    expectKeyword8503("var");
    declarations9017 = parseVariableDeclarationList8544();
    consumeSemicolon8508();
    return markerApply8497(marker9018, delegate8454.createVariableDeclaration(declarations9017, "var"));
}
function parseConstLetDeclaration8546(kind9019) {
    var declarations9020,
        marker9021 = markerCreate8495();
    expectKeyword8503(kind9019);
    declarations9020 = parseVariableDeclarationList8544(kind9019);
    consumeSemicolon8508();
    return markerApply8497(marker9021, delegate8454.createVariableDeclaration(declarations9020, kind9019));
}
function parseModuleDeclaration8547() {
    var id9022,
        src9023,
        body9024,
        marker9025 = markerCreate8495();
    lex8492();
    if ( // 'module'
    peekLineTerminator8498()) {
        throwError8499({}, Messages8440.NewlineAfterModule);
    }
    switch (lookahead8457.type) {
        case Token8435.StringLiteral:
            id9022 = parsePrimaryExpression8520();
            body9024 = parseModuleBlock8590();
            src9023 = null;
            break;
        case Token8435.Identifier:
            id9022 = parseVariableIdentifier8542();
            body9024 = null;
            if (!matchContextualKeyword8506("from")) {
                throwUnexpected8501(lex8492());
            }
            lex8492();
            src9023 = parsePrimaryExpression8520();
            if (src9023.type !== Syntax8438.Literal) {
                throwError8499({}, Messages8440.InvalidModuleSpecifier);
            }
            break;
    }
    consumeSemicolon8508();
    return markerApply8497(marker9025, delegate8454.createModuleDeclaration(id9022, src9023, body9024));
}
function parseExportBatchSpecifier8548() {
    var marker9026 = markerCreate8495();
    expect8502("*");
    return markerApply8497(marker9026, delegate8454.createExportBatchSpecifier());
}
function parseExportSpecifier8549() {
    var id9027,
        name9028 = null,
        marker9029 = markerCreate8495();
    id9027 = parseVariableIdentifier8542();
    if (matchContextualKeyword8506("as")) {
        lex8492();
        name9028 = parseNonComputedProperty8523();
    }
    return markerApply8497(marker9029, delegate8454.createExportSpecifier(id9027, name9028));
}
function parseExportDeclaration8550() {
    var previousAllowKeyword9030,
        decl9031,
        def9032,
        src9033,
        specifiers9034,
        marker9035 = markerCreate8495();
    expectKeyword8503("export");
    if (lookahead8457.type === Token8435.Keyword) {
        switch (lookahead8457.value) {
            case "let":
            case "const":
            case "var":
            case "class":
            case "function":
                return markerApply8497(marker9035, delegate8454.createExportDeclaration(parseSourceElement8585(), null, null));
        }
    }
    if (isIdentifierName8489(lookahead8457)) {
        previousAllowKeyword9030 = state8459.allowKeyword;
        state8459.allowKeyword = true;
        decl9031 = parseVariableDeclarationList8544("let");
        state8459.allowKeyword = previousAllowKeyword9030;
        return markerApply8497(marker9035, delegate8454.createExportDeclaration(decl9031, null, null));
    }
    specifiers9034 = [];
    src9033 = null;
    if (match8504("*")) {
        specifiers9034.push(parseExportBatchSpecifier8548());
    } else {
        expect8502("{");
        do {
            specifiers9034.push(parseExportSpecifier8549());
        } while (match8504(",") && lex8492());
        expect8502("}");
    }
    if (matchContextualKeyword8506("from")) {
        lex8492();
        src9033 = parsePrimaryExpression8520();
        if (src9033.type !== Syntax8438.Literal) {
            throwError8499({}, Messages8440.InvalidModuleSpecifier);
        }
    }
    consumeSemicolon8508();
    return markerApply8497(marker9035, delegate8454.createExportDeclaration(null, specifiers9034, src9033));
}
function parseImportDeclaration8551() {
    var specifiers9036,
        kind9037,
        src9038,
        marker9039 = markerCreate8495();
    expectKeyword8503("import");
    specifiers9036 = [];
    if (isIdentifierName8489(lookahead8457)) {
        kind9037 = "default";
        specifiers9036.push(parseImportSpecifier8552());
        if (!matchContextualKeyword8506("from")) {
            throwError8499({}, Messages8440.NoFromAfterImport);
        }
        lex8492();
    } else if (match8504("{")) {
        kind9037 = "named";
        lex8492();
        do {
            specifiers9036.push(parseImportSpecifier8552());
        } while (match8504(",") && lex8492());
        expect8502("}");
        if (!matchContextualKeyword8506("from")) {
            throwError8499({}, Messages8440.NoFromAfterImport);
        }
        lex8492();
    }
    src9038 = parsePrimaryExpression8520();
    if (src9038.type !== Syntax8438.Literal) {
        throwError8499({}, Messages8440.InvalidModuleSpecifier);
    }
    consumeSemicolon8508();
    return markerApply8497(marker9039, delegate8454.createImportDeclaration(specifiers9036, kind9037, src9038));
}
function parseImportSpecifier8552() {
    var id9040,
        name9041 = null,
        marker9042 = markerCreate8495();
    id9040 = parseNonComputedProperty8523(true);
    if (matchContextualKeyword8506("as")) {
        lex8492();
        name9041 = parseVariableIdentifier8542();
    }
    return markerApply8497(marker9042, delegate8454.createImportSpecifier(id9040, name9041));
}
function parseEmptyStatement8553() {
    var marker9043 = markerCreate8495();
    expect8502(";");
    return markerApply8497(marker9043, delegate8454.createEmptyStatement());
}
function parseExpressionStatement8554() {
    var marker9044 = markerCreate8495(),
        expr9045 = parseExpression8539();
    consumeSemicolon8508();
    return markerApply8497(marker9044, delegate8454.createExpressionStatement(expr9045));
}
function parseIfStatement8555() {
    var test9046,
        consequent9047,
        alternate9048,
        marker9049 = markerCreate8495();
    expectKeyword8503("if");
    expect8502("(");
    test9046 = parseExpression8539();
    expect8502(")");
    consequent9047 = parseStatement8570();
    if (matchKeyword8505("else")) {
        lex8492();
        alternate9048 = parseStatement8570();
    } else {
        alternate9048 = null;
    }
    return markerApply8497(marker9049, delegate8454.createIfStatement(test9046, consequent9047, alternate9048));
}
function parseDoWhileStatement8556() {
    var body9050,
        test9051,
        oldInIteration9052,
        marker9053 = markerCreate8495();
    expectKeyword8503("do");
    oldInIteration9052 = state8459.inIteration;
    state8459.inIteration = true;
    body9050 = parseStatement8570();
    state8459.inIteration = oldInIteration9052;
    expectKeyword8503("while");
    expect8502("(");
    test9051 = parseExpression8539();
    expect8502(")");
    if (match8504(";")) {
        lex8492();
    }
    return markerApply8497(marker9053, delegate8454.createDoWhileStatement(body9050, test9051));
}
function parseWhileStatement8557() {
    var test9054,
        body9055,
        oldInIteration9056,
        marker9057 = markerCreate8495();
    expectKeyword8503("while");
    expect8502("(");
    test9054 = parseExpression8539();
    expect8502(")");
    oldInIteration9056 = state8459.inIteration;
    state8459.inIteration = true;
    body9055 = parseStatement8570();
    state8459.inIteration = oldInIteration9056;
    return markerApply8497(marker9057, delegate8454.createWhileStatement(test9054, body9055));
}
function parseForVariableDeclaration8558() {
    var marker9058 = markerCreate8495(),
        token9059 = lex8492(),
        declarations9060 = parseVariableDeclarationList8544();
    return markerApply8497(marker9058, delegate8454.createVariableDeclaration(declarations9060, token9059.value));
}
function parseForStatement8559(opts9061) {
    var init9062,
        test9063,
        update9064,
        left9065,
        right9066,
        body9067,
        operator9068,
        oldInIteration9069,
        marker9070 = markerCreate8495();
    init9062 = test9063 = update9064 = null;
    expectKeyword8503("for");
    if ( // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
    matchContextualKeyword8506("each")) {
        throwError8499({}, Messages8440.EachNotAllowed);
    }
    expect8502("(");
    if (match8504(";")) {
        lex8492();
    } else {
        if (matchKeyword8505("var") || matchKeyword8505("let") || matchKeyword8505("const")) {
            state8459.allowIn = false;
            init9062 = parseForVariableDeclaration8558();
            state8459.allowIn = true;
            if (init9062.declarations.length === 1) {
                if (matchKeyword8505("in") || matchContextualKeyword8506("of")) {
                    operator9068 = lookahead8457;
                    if (!((operator9068.value === "in" || init9062.kind !== "var") && init9062.declarations[0].init)) {
                        lex8492();
                        left9065 = init9062;
                        right9066 = parseExpression8539();
                        init9062 = null;
                    }
                }
            }
        } else {
            state8459.allowIn = false;
            init9062 = parseExpression8539();
            state8459.allowIn = true;
            if (matchContextualKeyword8506("of")) {
                operator9068 = lex8492();
                left9065 = init9062;
                right9066 = parseExpression8539();
                init9062 = null;
            } else if (matchKeyword8505("in")) {
                if ( // LeftHandSideExpression
                !isAssignableLeftHandSide8510(init9062)) {
                    throwError8499({}, Messages8440.InvalidLHSInForIn);
                }
                operator9068 = lex8492();
                left9065 = init9062;
                right9066 = parseExpression8539();
                init9062 = null;
            }
        }
        if (typeof left9065 === "undefined") {
            expect8502(";");
        }
    }
    if (typeof left9065 === "undefined") {
        if (!match8504(";")) {
            test9063 = parseExpression8539();
        }
        expect8502(";");
        if (!match8504(")")) {
            update9064 = parseExpression8539();
        }
    }
    expect8502(")");
    oldInIteration9069 = state8459.inIteration;
    state8459.inIteration = true;
    if (!(opts9061 !== undefined && opts9061.ignoreBody)) {
        body9067 = parseStatement8570();
    }
    state8459.inIteration = oldInIteration9069;
    if (typeof left9065 === "undefined") {
        return markerApply8497(marker9070, delegate8454.createForStatement(init9062, test9063, update9064, body9067));
    }
    if (operator9068.value === "in") {
        return markerApply8497(marker9070, delegate8454.createForInStatement(left9065, right9066, body9067));
    }
    return markerApply8497(marker9070, delegate8454.createForOfStatement(left9065, right9066, body9067));
}
function parseContinueStatement8560() {
    var label9071 = null,
        key9072,
        marker9073 = markerCreate8495();
    expectKeyword8503("continue");
    if ( // Optimize the most common form: 'continue;'.
    lookahead8457.value.charCodeAt(0) === 59) {
        lex8492();
        if (!state8459.inIteration) {
            throwError8499({}, Messages8440.IllegalContinue);
        }
        return markerApply8497(marker9073, delegate8454.createContinueStatement(null));
    }
    if (peekLineTerminator8498()) {
        if (!state8459.inIteration) {
            throwError8499({}, Messages8440.IllegalContinue);
        }
        return markerApply8497(marker9073, delegate8454.createContinueStatement(null));
    }
    if (lookahead8457.type === Token8435.Identifier) {
        label9071 = parseVariableIdentifier8542();
        key9072 = "$" + label9071.name;
        if (!Object.prototype.hasOwnProperty.call(state8459.labelSet, key9072)) {
            throwError8499({}, Messages8440.UnknownLabel, label9071.name);
        }
    }
    consumeSemicolon8508();
    if (label9071 === null && !state8459.inIteration) {
        throwError8499({}, Messages8440.IllegalContinue);
    }
    return markerApply8497(marker9073, delegate8454.createContinueStatement(label9071));
}
function parseBreakStatement8561() {
    var label9074 = null,
        key9075,
        marker9076 = markerCreate8495();
    expectKeyword8503("break");
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    lookahead8457.value.charCodeAt(0) === 59) {
        lex8492();
        if (!(state8459.inIteration || state8459.inSwitch)) {
            throwError8499({}, Messages8440.IllegalBreak);
        }
        return markerApply8497(marker9076, delegate8454.createBreakStatement(null));
    }
    if (peekLineTerminator8498()) {
        if (!(state8459.inIteration || state8459.inSwitch)) {
            throwError8499({}, Messages8440.IllegalBreak);
        }
        return markerApply8497(marker9076, delegate8454.createBreakStatement(null));
    }
    if (lookahead8457.type === Token8435.Identifier) {
        label9074 = parseVariableIdentifier8542();
        key9075 = "$" + label9074.name;
        if (!Object.prototype.hasOwnProperty.call(state8459.labelSet, key9075)) {
            throwError8499({}, Messages8440.UnknownLabel, label9074.name);
        }
    }
    consumeSemicolon8508();
    if (label9074 === null && !(state8459.inIteration || state8459.inSwitch)) {
        throwError8499({}, Messages8440.IllegalBreak);
    }
    return markerApply8497(marker9076, delegate8454.createBreakStatement(label9074));
}
function parseReturnStatement8562() {
    var argument9077 = null,
        marker9078 = markerCreate8495();
    expectKeyword8503("return");
    if (!state8459.inFunctionBody) {
        throwErrorTolerant8500({}, Messages8440.IllegalReturn);
    }
    if ( // 'return' followed by a space and an identifier is very common.
    isIdentifierStart8469(String(lookahead8457.value).charCodeAt(0))) {
        argument9077 = parseExpression8539();
        consumeSemicolon8508();
        return markerApply8497(marker9078, delegate8454.createReturnStatement(argument9077));
    }
    if (peekLineTerminator8498()) {
        return markerApply8497(marker9078, delegate8454.createReturnStatement(null));
    }
    if (!match8504(";")) {
        if (!match8504("}") && lookahead8457.type !== Token8435.EOF) {
            argument9077 = parseExpression8539();
        }
    }
    consumeSemicolon8508();
    return markerApply8497(marker9078, delegate8454.createReturnStatement(argument9077));
}
function parseWithStatement8563() {
    var object9079,
        body9080,
        marker9081 = markerCreate8495();
    if (strict8445) {
        throwErrorTolerant8500({}, Messages8440.StrictModeWith);
    }
    expectKeyword8503("with");
    expect8502("(");
    object9079 = parseExpression8539();
    expect8502(")");
    body9080 = parseStatement8570();
    return markerApply8497(marker9081, delegate8454.createWithStatement(object9079, body9080));
}
function parseSwitchCase8564() {
    var test9082,
        consequent9083 = [],
        sourceElement9084,
        marker9085 = markerCreate8495();
    if (matchKeyword8505("default")) {
        lex8492();
        test9082 = null;
    } else {
        expectKeyword8503("case");
        test9082 = parseExpression8539();
    }
    expect8502(":");
    while (streamIndex8456 < length8453) {
        if (match8504("}") || matchKeyword8505("default") || matchKeyword8505("case")) {
            break;
        }
        sourceElement9084 = parseSourceElement8585();
        if (typeof sourceElement9084 === "undefined") {
            break;
        }
        consequent9083.push(sourceElement9084);
    }
    return markerApply8497(marker9085, delegate8454.createSwitchCase(test9082, consequent9083));
}
function parseSwitchStatement8565() {
    var discriminant9086,
        cases9087,
        clause9088,
        oldInSwitch9089,
        defaultFound9090,
        marker9091 = markerCreate8495();
    expectKeyword8503("switch");
    expect8502("(");
    discriminant9086 = parseExpression8539();
    expect8502(")");
    expect8502("{");
    cases9087 = [];
    if (match8504("}")) {
        lex8492();
        return markerApply8497(marker9091, delegate8454.createSwitchStatement(discriminant9086, cases9087));
    }
    oldInSwitch9089 = state8459.inSwitch;
    state8459.inSwitch = true;
    defaultFound9090 = false;
    while (streamIndex8456 < length8453) {
        if (match8504("}")) {
            break;
        }
        clause9088 = parseSwitchCase8564();
        if (clause9088.test === null) {
            if (defaultFound9090) {
                throwError8499({}, Messages8440.MultipleDefaultsInSwitch);
            }
            defaultFound9090 = true;
        }
        cases9087.push(clause9088);
    }
    state8459.inSwitch = oldInSwitch9089;
    expect8502("}");
    return markerApply8497(marker9091, delegate8454.createSwitchStatement(discriminant9086, cases9087));
}
function parseThrowStatement8566() {
    var argument9092,
        marker9093 = markerCreate8495();
    expectKeyword8503("throw");
    if (peekLineTerminator8498()) {
        throwError8499({}, Messages8440.NewlineAfterThrow);
    }
    argument9092 = parseExpression8539();
    consumeSemicolon8508();
    return markerApply8497(marker9093, delegate8454.createThrowStatement(argument9092));
}
function parseCatchClause8567() {
    var param9094,
        body9095,
        marker9096 = markerCreate8495();
    expectKeyword8503("catch");
    expect8502("(");
    if (match8504(")")) {
        throwUnexpected8501(lookahead8457);
    }
    param9094 = parseExpression8539();
    if ( // 12.14.1
    strict8445 && param9094.type === Syntax8438.Identifier && isRestrictedWord8473(param9094.name)) {
        throwErrorTolerant8500({}, Messages8440.StrictCatchVariable);
    }
    expect8502(")");
    body9095 = parseBlock8541();
    return markerApply8497(marker9096, delegate8454.createCatchClause(param9094, body9095));
}
function parseTryStatement8568() {
    var block9097,
        handlers9098 = [],
        finalizer9099 = null,
        marker9100 = markerCreate8495();
    expectKeyword8503("try");
    block9097 = parseBlock8541();
    if (matchKeyword8505("catch")) {
        handlers9098.push(parseCatchClause8567());
    }
    if (matchKeyword8505("finally")) {
        lex8492();
        finalizer9099 = parseBlock8541();
    }
    if (handlers9098.length === 0 && !finalizer9099) {
        throwError8499({}, Messages8440.NoCatchOrFinally);
    }
    return markerApply8497(marker9100, delegate8454.createTryStatement(block9097, [], handlers9098, finalizer9099));
}
function parseDebuggerStatement8569() {
    var marker9101 = markerCreate8495();
    expectKeyword8503("debugger");
    consumeSemicolon8508();
    return markerApply8497(marker9101, delegate8454.createDebuggerStatement());
}
function parseStatement8570() {
    var type9102 = lookahead8457.type,
        marker9103,
        expr9104,
        labeledBody9105,
        key9106;
    if (type9102 === Token8435.EOF) {
        throwUnexpected8501(lookahead8457);
    }
    if (type9102 === Token8435.Punctuator) {
        switch (lookahead8457.value) {
            case ";":
                return parseEmptyStatement8553();
            case "{":
                return parseBlock8541();
            case "(":
                return parseExpressionStatement8554();
            default:
                break;
        }
    }
    if (type9102 === Token8435.Keyword) {
        switch (lookahead8457.value) {
            case "break":
                return parseBreakStatement8561();
            case "continue":
                return parseContinueStatement8560();
            case "debugger":
                return parseDebuggerStatement8569();
            case "do":
                return parseDoWhileStatement8556();
            case "for":
                return parseForStatement8559();
            case "function":
                return parseFunctionDeclaration8576();
            case "class":
                return parseClassDeclaration8583();
            case "if":
                return parseIfStatement8555();
            case "return":
                return parseReturnStatement8562();
            case "switch":
                return parseSwitchStatement8565();
            case "throw":
                return parseThrowStatement8566();
            case "try":
                return parseTryStatement8568();
            case "var":
                return parseVariableStatement8545();
            case "while":
                return parseWhileStatement8557();
            case "with":
                return parseWithStatement8563();
            default:
                break;
        }
    }
    marker9103 = markerCreate8495();
    expr9104 = parseExpression8539();
    if ( // 12.12 Labelled Statements
    expr9104.type === Syntax8438.Identifier && match8504(":")) {
        lex8492();
        key9106 = "$" + expr9104.name;
        if (Object.prototype.hasOwnProperty.call(state8459.labelSet, key9106)) {
            throwError8499({}, Messages8440.Redeclaration, "Label", expr9104.name);
        }
        state8459.labelSet[key9106] = true;
        labeledBody9105 = parseStatement8570();
        delete state8459.labelSet[key9106];
        return markerApply8497(marker9103, delegate8454.createLabeledStatement(expr9104, labeledBody9105));
    }
    consumeSemicolon8508();
    return markerApply8497(marker9103, delegate8454.createExpressionStatement(expr9104));
}
function parseConciseBody8571() {
    if (match8504("{")) {
        return parseFunctionSourceElements8572();
    }
    return parseAssignmentExpression8538();
}
function parseFunctionSourceElements8572() {
    var sourceElement9107,
        sourceElements9108 = [],
        token9109,
        directive9110,
        firstRestricted9111,
        oldLabelSet9112,
        oldInIteration9113,
        oldInSwitch9114,
        oldInFunctionBody9115,
        oldParenthesizedCount9116,
        marker9117 = markerCreate8495();
    expect8502("{");
    while (streamIndex8456 < length8453) {
        if (lookahead8457.type !== Token8435.StringLiteral) {
            break;
        }
        token9109 = lookahead8457;
        sourceElement9107 = parseSourceElement8585();
        sourceElements9108.push(sourceElement9107);
        if (sourceElement9107.expression.type !== Syntax8438.Literal) {
            // this is not directive
            break;
        }
        directive9110 = token9109.value;
        if (directive9110 === "use strict") {
            strict8445 = true;
            if (firstRestricted9111) {
                throwErrorTolerant8500(firstRestricted9111, Messages8440.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9111 && token9109.octal) {
                firstRestricted9111 = token9109;
            }
        }
    }
    oldLabelSet9112 = state8459.labelSet;
    oldInIteration9113 = state8459.inIteration;
    oldInSwitch9114 = state8459.inSwitch;
    oldInFunctionBody9115 = state8459.inFunctionBody;
    oldParenthesizedCount9116 = state8459.parenthesizedCount;
    state8459.labelSet = {};
    state8459.inIteration = false;
    state8459.inSwitch = false;
    state8459.inFunctionBody = true;
    state8459.parenthesizedCount = 0;
    while (streamIndex8456 < length8453) {
        if (match8504("}")) {
            break;
        }
        sourceElement9107 = parseSourceElement8585();
        if (typeof sourceElement9107 === "undefined") {
            break;
        }
        sourceElements9108.push(sourceElement9107);
    }
    expect8502("}");
    state8459.labelSet = oldLabelSet9112;
    state8459.inIteration = oldInIteration9113;
    state8459.inSwitch = oldInSwitch9114;
    state8459.inFunctionBody = oldInFunctionBody9115;
    state8459.parenthesizedCount = oldParenthesizedCount9116;
    return markerApply8497(marker9117, delegate8454.createBlockStatement(sourceElements9108));
}
function validateParam8573(options9118, param9119, name9120) {
    var key9121 = "$" + name9120;
    if (strict8445) {
        if (isRestrictedWord8473(name9120)) {
            options9118.stricted = param9119;
            options9118.message = Messages8440.StrictParamName;
        }
        if (Object.prototype.hasOwnProperty.call(options9118.paramSet, key9121)) {
            options9118.stricted = param9119;
            options9118.message = Messages8440.StrictParamDupe;
        }
    } else if (!options9118.firstRestricted) {
        if (isRestrictedWord8473(name9120)) {
            options9118.firstRestricted = param9119;
            options9118.message = Messages8440.StrictParamName;
        } else if (isStrictModeReservedWord8472(name9120)) {
            options9118.firstRestricted = param9119;
            options9118.message = Messages8440.StrictReservedWord;
        } else if (Object.prototype.hasOwnProperty.call(options9118.paramSet, key9121)) {
            options9118.firstRestricted = param9119;
            options9118.message = Messages8440.StrictParamDupe;
        }
    }
    options9118.paramSet[key9121] = true;
}
function parseParam8574(options9122) {
    var token9123, rest9124, param9125, def9126;
    token9123 = lookahead8457;
    if (token9123.value === "...") {
        token9123 = lex8492();
        rest9124 = true;
    }
    if (match8504("[")) {
        param9125 = parseArrayInitialiser8511();
        reinterpretAsDestructuredParameter8535(options9122, param9125);
    } else if (match8504("{")) {
        if (rest9124) {
            throwError8499({}, Messages8440.ObjectPatternAsRestParameter);
        }
        param9125 = parseObjectInitialiser8516();
        reinterpretAsDestructuredParameter8535(options9122, param9125);
    } else {
        param9125 = parseVariableIdentifier8542();
        validateParam8573(options9122, token9123, token9123.value);
    }
    if (match8504("=")) {
        if (rest9124) {
            throwErrorTolerant8500(lookahead8457, Messages8440.DefaultRestParameter);
        }
        lex8492();
        def9126 = parseAssignmentExpression8538();
        ++options9122.defaultCount;
    }
    if (rest9124) {
        if (!match8504(")")) {
            throwError8499({}, Messages8440.ParameterAfterRestParameter);
        }
        options9122.rest = param9125;
        return false;
    }
    options9122.params.push(param9125);
    options9122.defaults.push(def9126);
    return !match8504(")");
}
function parseParams8575(firstRestricted9127) {
    var options9128;
    options9128 = {
        params: [],
        defaultCount: 0,
        defaults: [],
        rest: null,
        firstRestricted: firstRestricted9127
    };
    expect8502("(");
    if (!match8504(")")) {
        options9128.paramSet = {};
        while (streamIndex8456 < length8453) {
            if (!parseParam8574(options9128)) {
                break;
            }
            expect8502(",");
        }
    }
    expect8502(")");
    if (options9128.defaultCount === 0) {
        options9128.defaults = [];
    }
    return options9128;
}
function parseFunctionDeclaration8576() {
    var id9129,
        body9130,
        token9131,
        tmp9132,
        firstRestricted9133,
        message9134,
        previousStrict9135,
        previousYieldAllowed9136,
        generator9137,
        marker9138 = markerCreate8495();
    expectKeyword8503("function");
    generator9137 = false;
    if (match8504("*")) {
        lex8492();
        generator9137 = true;
    }
    token9131 = lookahead8457;
    id9129 = parseVariableIdentifier8542();
    if (strict8445) {
        if (isRestrictedWord8473(token9131.value)) {
            throwErrorTolerant8500(token9131, Messages8440.StrictFunctionName);
        }
    } else {
        if (isRestrictedWord8473(token9131.value)) {
            firstRestricted9133 = token9131;
            message9134 = Messages8440.StrictFunctionName;
        } else if (isStrictModeReservedWord8472(token9131.value)) {
            firstRestricted9133 = token9131;
            message9134 = Messages8440.StrictReservedWord;
        }
    }
    tmp9132 = parseParams8575(firstRestricted9133);
    firstRestricted9133 = tmp9132.firstRestricted;
    if (tmp9132.message) {
        message9134 = tmp9132.message;
    }
    previousStrict9135 = strict8445;
    previousYieldAllowed9136 = state8459.yieldAllowed;
    state8459.yieldAllowed = generator9137;
    body9130 = parseFunctionSourceElements8572();
    if (strict8445 && firstRestricted9133) {
        throwError8499(firstRestricted9133, message9134);
    }
    if (strict8445 && tmp9132.stricted) {
        throwErrorTolerant8500(tmp9132.stricted, message9134);
    }
    strict8445 = previousStrict9135;
    state8459.yieldAllowed = previousYieldAllowed9136;
    return markerApply8497(marker9138, delegate8454.createFunctionDeclaration(id9129, tmp9132.params, tmp9132.defaults, body9130, tmp9132.rest, generator9137, false));
}
function parseFunctionExpression8577() {
    var token9139,
        id9140 = null,
        firstRestricted9141,
        message9142,
        tmp9143,
        body9144,
        previousStrict9145,
        previousYieldAllowed9146,
        generator9147,
        marker9148 = markerCreate8495();
    expectKeyword8503("function");
    generator9147 = false;
    if (match8504("*")) {
        lex8492();
        generator9147 = true;
    }
    if (!match8504("(")) {
        token9139 = lookahead8457;
        id9140 = parseVariableIdentifier8542();
        if (strict8445) {
            if (isRestrictedWord8473(token9139.value)) {
                throwErrorTolerant8500(token9139, Messages8440.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord8473(token9139.value)) {
                firstRestricted9141 = token9139;
                message9142 = Messages8440.StrictFunctionName;
            } else if (isStrictModeReservedWord8472(token9139.value)) {
                firstRestricted9141 = token9139;
                message9142 = Messages8440.StrictReservedWord;
            }
        }
    }
    tmp9143 = parseParams8575(firstRestricted9141);
    firstRestricted9141 = tmp9143.firstRestricted;
    if (tmp9143.message) {
        message9142 = tmp9143.message;
    }
    previousStrict9145 = strict8445;
    previousYieldAllowed9146 = state8459.yieldAllowed;
    state8459.yieldAllowed = generator9147;
    body9144 = parseFunctionSourceElements8572();
    if (strict8445 && firstRestricted9141) {
        throwError8499(firstRestricted9141, message9142);
    }
    if (strict8445 && tmp9143.stricted) {
        throwErrorTolerant8500(tmp9143.stricted, message9142);
    }
    strict8445 = previousStrict9145;
    state8459.yieldAllowed = previousYieldAllowed9146;
    return markerApply8497(marker9148, delegate8454.createFunctionExpression(id9140, tmp9143.params, tmp9143.defaults, body9144, tmp9143.rest, generator9147, false));
}
function parseYieldExpression8578() {
    var yieldToken9149,
        delegateFlag9150,
        expr9151,
        marker9152 = markerCreate8495();
    yieldToken9149 = lex8492();
    assert8462(yieldToken9149.value === "yield", "Called parseYieldExpression with non-yield lookahead.");
    if (!state8459.yieldAllowed) {
        throwErrorTolerant8500({}, Messages8440.IllegalYield);
    }
    delegateFlag9150 = false;
    if (match8504("*")) {
        lex8492();
        delegateFlag9150 = true;
    }
    expr9151 = parseAssignmentExpression8538();
    return markerApply8497(marker9152, delegate8454.createYieldExpression(expr9151, delegateFlag9150));
}
function parseMethodDefinition8579(existingPropNames9153) {
    var token9154,
        key9155,
        param9156,
        propType9157,
        isValidDuplicateProp9158 = false,
        marker9159 = markerCreate8495();
    if (lookahead8457.value === "static") {
        propType9157 = ClassPropertyType8443["static"];
        lex8492();
    } else {
        propType9157 = ClassPropertyType8443.prototype;
    }
    if (match8504("*")) {
        lex8492();
        return markerApply8497(marker9159, delegate8454.createMethodDefinition(propType9157, "", parseObjectPropertyKey8514(), parsePropertyMethodFunction8513({ generator: true })));
    }
    token9154 = lookahead8457;
    key9155 = parseObjectPropertyKey8514();
    if (token9154.value === "get" && !match8504("(")) {
        key9155 = parseObjectPropertyKey8514();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a setter
        existingPropNames9153[propType9157].hasOwnProperty(key9155.name)) {
            isValidDuplicateProp9158 = // There isn't already a getter for this prop
            existingPropNames9153[propType9157][key9155.name].get === undefined && // There isn't already a data prop by this name
            existingPropNames9153[propType9157][key9155.name].data === undefined && // The only existing prop by this name is a setter
            existingPropNames9153[propType9157][key9155.name].set !== undefined;
            if (!isValidDuplicateProp9158) {
                throwError8499(key9155, Messages8440.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9153[propType9157][key9155.name] = {};
        }
        existingPropNames9153[propType9157][key9155.name].get = true;
        expect8502("(");
        expect8502(")");
        return markerApply8497(marker9159, delegate8454.createMethodDefinition(propType9157, "get", key9155, parsePropertyFunction8512({ generator: false })));
    }
    if (token9154.value === "set" && !match8504("(")) {
        key9155 = parseObjectPropertyKey8514();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a getter
        existingPropNames9153[propType9157].hasOwnProperty(key9155.name)) {
            isValidDuplicateProp9158 = // There isn't already a setter for this prop
            existingPropNames9153[propType9157][key9155.name].set === undefined && // There isn't already a data prop by this name
            existingPropNames9153[propType9157][key9155.name].data === undefined && // The only existing prop by this name is a getter
            existingPropNames9153[propType9157][key9155.name].get !== undefined;
            if (!isValidDuplicateProp9158) {
                throwError8499(key9155, Messages8440.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames9153[propType9157][key9155.name] = {};
        }
        existingPropNames9153[propType9157][key9155.name].set = true;
        expect8502("(");
        token9154 = lookahead8457;
        param9156 = [parseVariableIdentifier8542()];
        expect8502(")");
        return markerApply8497(marker9159, delegate8454.createMethodDefinition(propType9157, "set", key9155, parsePropertyFunction8512({
            params: param9156,
            generator: false,
            name: token9154
        })));
    }
    if ( // It is a syntax error if any other properties have the same name as a
    // non-getter, non-setter method
    existingPropNames9153[propType9157].hasOwnProperty(key9155.name)) {
        throwError8499(key9155, Messages8440.IllegalDuplicateClassProperty);
    } else {
        existingPropNames9153[propType9157][key9155.name] = {};
    }
    existingPropNames9153[propType9157][key9155.name].data = true;
    return markerApply8497(marker9159, delegate8454.createMethodDefinition(propType9157, "", key9155, parsePropertyMethodFunction8513({ generator: false })));
}
function parseClassElement8580(existingProps9160) {
    if (match8504(";")) {
        lex8492();
        return;
    }
    return parseMethodDefinition8579(existingProps9160);
}
function parseClassBody8581() {
    var classElement9161,
        classElements9162 = [],
        existingProps9163 = {},
        marker9164 = markerCreate8495();
    existingProps9163[ClassPropertyType8443["static"]] = {};
    existingProps9163[ClassPropertyType8443.prototype] = {};
    expect8502("{");
    while (streamIndex8456 < length8453) {
        if (match8504("}")) {
            break;
        }
        classElement9161 = parseClassElement8580(existingProps9163);
        if (typeof classElement9161 !== "undefined") {
            classElements9162.push(classElement9161);
        }
    }
    expect8502("}");
    return markerApply8497(marker9164, delegate8454.createClassBody(classElements9162));
}
function parseClassExpression8582() {
    var id9165,
        previousYieldAllowed9166,
        superClass9167 = null,
        marker9168 = markerCreate8495();
    expectKeyword8503("class");
    if (!matchKeyword8505("extends") && !match8504("{")) {
        id9165 = parseVariableIdentifier8542();
    }
    if (matchKeyword8505("extends")) {
        expectKeyword8503("extends");
        previousYieldAllowed9166 = state8459.yieldAllowed;
        state8459.yieldAllowed = false;
        superClass9167 = parseAssignmentExpression8538();
        state8459.yieldAllowed = previousYieldAllowed9166;
    }
    return markerApply8497(marker9168, delegate8454.createClassExpression(id9165, superClass9167, parseClassBody8581()));
}
function parseClassDeclaration8583() {
    var id9169,
        previousYieldAllowed9170,
        superClass9171 = null,
        marker9172 = markerCreate8495();
    expectKeyword8503("class");
    id9169 = parseVariableIdentifier8542();
    if (matchKeyword8505("extends")) {
        expectKeyword8503("extends");
        previousYieldAllowed9170 = state8459.yieldAllowed;
        state8459.yieldAllowed = false;
        superClass9171 = parseAssignmentExpression8538();
        state8459.yieldAllowed = previousYieldAllowed9170;
    }
    return markerApply8497(marker9172, delegate8454.createClassDeclaration(id9169, superClass9171, parseClassBody8581()));
}
function matchModuleDeclaration8584() {
    var id9173;
    if (matchContextualKeyword8506("module")) {
        id9173 = lookahead28494();
        return id9173.type === Token8435.StringLiteral || id9173.type === Token8435.Identifier;
    }
    return false;
}
function parseSourceElement8585() {
    if (lookahead8457.type === Token8435.Keyword) {
        switch (lookahead8457.value) {
            case "const":
            case "let":
                return parseConstLetDeclaration8546(lookahead8457.value);
            case "function":
                return parseFunctionDeclaration8576();
            case "export":
                return parseExportDeclaration8550();
            case "import":
                return parseImportDeclaration8551();
            default:
                return parseStatement8570();
        }
    }
    if (matchModuleDeclaration8584()) {
        throwError8499({}, Messages8440.NestedModule);
    }
    if (lookahead8457.type !== Token8435.EOF) {
        return parseStatement8570();
    }
}
function parseProgramElement8586() {
    if (lookahead8457.type === Token8435.Keyword) {
        switch (lookahead8457.value) {
            case "export":
                return parseExportDeclaration8550();
            case "import":
                return parseImportDeclaration8551();
        }
    }
    if (matchModuleDeclaration8584()) {
        return parseModuleDeclaration8547();
    }
    return parseSourceElement8585();
}
function parseProgramElements8587() {
    var sourceElement9174,
        sourceElements9175 = [],
        token9176,
        directive9177,
        firstRestricted9178;
    while (streamIndex8456 < length8453) {
        token9176 = lookahead8457;
        if (token9176.type !== Token8435.StringLiteral) {
            break;
        }
        sourceElement9174 = parseProgramElement8586();
        sourceElements9175.push(sourceElement9174);
        if (sourceElement9174.expression.type !== Syntax8438.Literal) {
            // this is not directive
            break;
        }
        directive9177 = token9176.value;
        if (directive9177 === "use strict") {
            strict8445 = true;
            if (firstRestricted9178) {
                throwErrorTolerant8500(firstRestricted9178, Messages8440.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted9178 && token9176.octal) {
                firstRestricted9178 = token9176;
            }
        }
    }
    while (streamIndex8456 < length8453) {
        sourceElement9174 = parseProgramElement8586();
        if (typeof sourceElement9174 === "undefined") {
            break;
        }
        sourceElements9175.push(sourceElement9174);
    }
    return sourceElements9175;
}
function parseModuleElement8588() {
    return parseSourceElement8585();
}
function parseModuleElements8589() {
    var list9179 = [],
        statement9180;
    while (streamIndex8456 < length8453) {
        if (match8504("}")) {
            break;
        }
        statement9180 = parseModuleElement8588();
        if (typeof statement9180 === "undefined") {
            break;
        }
        list9179.push(statement9180);
    }
    return list9179;
}
function parseModuleBlock8590() {
    var block9181,
        marker9182 = markerCreate8495();
    expect8502("{");
    block9181 = parseModuleElements8589();
    expect8502("}");
    return markerApply8497(marker9182, delegate8454.createBlockStatement(block9181));
}
function parseProgram8591() {
    var body9183,
        marker9184 = markerCreate8495();
    strict8445 = false;
    peek8493();
    body9183 = parseProgramElements8587();
    return markerApply8497(marker9184, delegate8454.createProgram(body9183));
}
function addComment8592(type9185, value9186, start9187, end9188, loc9189) {
    var comment9190;
    assert8462(typeof start9187 === "number", "Comment must have valid position");
    if ( // Because the way the actual token is scanned, often the comments
    // (if any) are skipped twice during the lexical analysis.
    // Thus, we need to skip adding a comment if the comment array already
    // handled it.
    state8459.lastCommentStart >= start9187) {
        return;
    }
    state8459.lastCommentStart = start9187;
    comment9190 = {
        type: type9185,
        value: value9186
    };
    if (extra8461.range) {
        comment9190.range = [start9187, end9188];
    }
    if (extra8461.loc) {
        comment9190.loc = loc9189;
    }
    extra8461.comments.push(comment9190);
    if (extra8461.attachComment) {
        extra8461.leadingComments.push(comment9190);
        extra8461.trailingComments.push(comment9190);
    }
}
function scanComment8593() {
    var comment9191, ch9192, loc9193, start9194, blockComment9195, lineComment9196;
    comment9191 = "";
    blockComment9195 = false;
    lineComment9196 = false;
    while (index8446 < length8453) {
        ch9192 = source8444[index8446];
        if (lineComment9196) {
            ch9192 = source8444[index8446++];
            if (isLineTerminator8468(ch9192.charCodeAt(0))) {
                loc9193.end = {
                    line: lineNumber8447,
                    column: index8446 - lineStart8448 - 1
                };
                lineComment9196 = false;
                addComment8592("Line", comment9191, start9194, index8446 - 1, loc9193);
                if (ch9192 === "\r" && source8444[index8446] === "\n") {
                    ++index8446;
                }
                ++lineNumber8447;
                lineStart8448 = index8446;
                comment9191 = "";
            } else if (index8446 >= length8453) {
                lineComment9196 = false;
                comment9191 += ch9192;
                loc9193.end = {
                    line: lineNumber8447,
                    column: length8453 - lineStart8448
                };
                addComment8592("Line", comment9191, start9194, length8453, loc9193);
            } else {
                comment9191 += ch9192;
            }
        } else if (blockComment9195) {
            if (isLineTerminator8468(ch9192.charCodeAt(0))) {
                if (ch9192 === "\r" && source8444[index8446 + 1] === "\n") {
                    ++index8446;
                    comment9191 += "\r\n";
                } else {
                    comment9191 += ch9192;
                }
                ++lineNumber8447;
                ++index8446;
                lineStart8448 = index8446;
                if (index8446 >= length8453) {
                    throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch9192 = source8444[index8446++];
                if (index8446 >= length8453) {
                    throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
                }
                comment9191 += ch9192;
                if (ch9192 === "*") {
                    ch9192 = source8444[index8446];
                    if (ch9192 === "/") {
                        comment9191 = comment9191.substr(0, comment9191.length - 1);
                        blockComment9195 = false;
                        ++index8446;
                        loc9193.end = {
                            line: lineNumber8447,
                            column: index8446 - lineStart8448
                        };
                        addComment8592("Block", comment9191, start9194, index8446, loc9193);
                        comment9191 = "";
                    }
                }
            }
        } else if (ch9192 === "/") {
            ch9192 = source8444[index8446 + 1];
            if (ch9192 === "/") {
                loc9193 = {
                    start: {
                        line: lineNumber8447,
                        column: index8446 - lineStart8448
                    }
                };
                start9194 = index8446;
                index8446 += 2;
                lineComment9196 = true;
                if (index8446 >= length8453) {
                    loc9193.end = {
                        line: lineNumber8447,
                        column: index8446 - lineStart8448
                    };
                    lineComment9196 = false;
                    addComment8592("Line", comment9191, start9194, index8446, loc9193);
                }
            } else if (ch9192 === "*") {
                start9194 = index8446;
                index8446 += 2;
                blockComment9195 = true;
                loc9193 = {
                    start: {
                        line: lineNumber8447,
                        column: index8446 - lineStart8448 - 2
                    }
                };
                if (index8446 >= length8453) {
                    throwError8499({}, Messages8440.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8467(ch9192.charCodeAt(0))) {
            ++index8446;
        } else if (isLineTerminator8468(ch9192.charCodeAt(0))) {
            ++index8446;
            if (ch9192 === "\r" && source8444[index8446] === "\n") {
                ++index8446;
            }
            ++lineNumber8447;
            lineStart8448 = index8446;
        } else {
            break;
        }
    }
}
function collectToken8594() {
    var start9197, loc9198, token9199, range9200, value9201;
    skipComment8475();
    start9197 = index8446;
    loc9198 = {
        start: {
            line: lineNumber8447,
            column: index8446 - lineStart8448
        }
    };
    token9199 = extra8461.advance();
    loc9198.end = {
        line: lineNumber8447,
        column: index8446 - lineStart8448
    };
    if (token9199.type !== Token8435.EOF) {
        range9200 = [token9199.range[0], token9199.range[1]];
        value9201 = source8444.slice(token9199.range[0], token9199.range[1]);
        extra8461.tokens.push({
            type: TokenName8436[token9199.type],
            value: value9201,
            range: range9200,
            loc: loc9198
        });
    }
    return token9199;
}
function collectRegex8595() {
    var pos9202, loc9203, regex9204, token9205;
    skipComment8475();
    pos9202 = index8446;
    loc9203 = {
        start: {
            line: lineNumber8447,
            column: index8446 - lineStart8448
        }
    };
    regex9204 = extra8461.scanRegExp();
    loc9203.end = {
        line: lineNumber8447,
        column: index8446 - lineStart8448
    };
    if (!extra8461.tokenize) {
        if ( // Pop the previous token, which is likely '/' or '/='
        extra8461.tokens.length > 0) {
            token9205 = extra8461.tokens[extra8461.tokens.length - 1];
            if (token9205.range[0] === pos9202 && token9205.type === "Punctuator") {
                if (token9205.value === "/" || token9205.value === "/=") {
                    extra8461.tokens.pop();
                }
            }
        }
        extra8461.tokens.push({
            type: "RegularExpression",
            value: regex9204.literal,
            range: [pos9202, index8446],
            loc: loc9203
        });
    }
    return regex9204;
}
function filterTokenLocation8596() {
    var i9206,
        entry9207,
        token9208,
        tokens9209 = [];
    for (i9206 = 0; i9206 < extra8461.tokens.length; ++i9206) {
        entry9207 = extra8461.tokens[i9206];
        token9208 = {
            type: entry9207.type,
            value: entry9207.value
        };
        if (extra8461.range) {
            token9208.range = entry9207.range;
        }
        if (extra8461.loc) {
            token9208.loc = entry9207.loc;
        }
        tokens9209.push(token9208);
    }
    extra8461.tokens = tokens9209;
}
function patch8597() {
    if (extra8461.comments) {
        extra8461.skipComment = skipComment8475;
        skipComment8475 = scanComment8593;
    }
    if (typeof extra8461.tokens !== "undefined") {
        extra8461.advance = advance8491;
        extra8461.scanRegExp = scanRegExp8488;
        advance8491 = collectToken8594;
        scanRegExp8488 = collectRegex8595;
    }
}
function unpatch8598() {
    if (typeof extra8461.skipComment === "function") {
        skipComment8475 = extra8461.skipComment;
    }
    if (typeof extra8461.scanRegExp === "function") {
        advance8491 = extra8461.advance;
        scanRegExp8488 = extra8461.scanRegExp;
    }
}
function extend8599(object9210, properties9211) {
    var entry9212,
        result9213 = {};
    for (entry9212 in object9210) {
        if (object9210.hasOwnProperty(entry9212)) {
            result9213[entry9212] = object9210[entry9212];
        }
    }
    for (entry9212 in properties9211) {
        if (properties9211.hasOwnProperty(entry9212)) {
            result9213[entry9212] = properties9211[entry9212];
        }
    }
    return result9213;
}
function tokenize8600(code9214, options9215) {
    var toString9216, token9217, tokens9218;
    toString9216 = String;
    if (typeof code9214 !== "string" && !(code9214 instanceof String)) {
        code9214 = toString9216(code9214);
    }
    delegate8454 = SyntaxTreeDelegate8442;
    source8444 = code9214;
    index8446 = 0;
    lineNumber8447 = source8444.length > 0 ? 1 : 0;
    lineStart8448 = 0;
    length8453 = source8444.length;
    lookahead8457 = null;
    state8459 = {
        allowKeyword: true,
        allowIn: true,
        labelSet: {},
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        lastCommentStart: -1
    };
    extra8461 = {};
    // Options matching.
    options9215 = options9215 || {};
    // Of course we collect tokens here.
    options9215.tokens = true;
    extra8461.tokens = [];
    extra8461.tokenize = true;
    // The following two fields are necessary to compute the Regex tokens.
    extra8461.openParenToken = -1;
    extra8461.openCurlyToken = -1;
    extra8461.range = typeof options9215.range === "boolean" && options9215.range;
    extra8461.loc = typeof options9215.loc === "boolean" && options9215.loc;
    if (typeof options9215.comment === "boolean" && options9215.comment) {
        extra8461.comments = [];
    }
    if (typeof options9215.tolerant === "boolean" && options9215.tolerant) {
        extra8461.errors = [];
    }
    if (length8453 > 0) {
        if (typeof source8444[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9214 instanceof String) {
                source8444 = code9214.valueOf();
            }
        }
    }
    patch8597();
    try {
        peek8493();
        if (lookahead8457.type === Token8435.EOF) {
            return extra8461.tokens;
        }
        token9217 = lex8492();
        while (lookahead8457.type !== Token8435.EOF) {
            try {
                token9217 = lex8492();
            } catch (lexError9219) {
                token9217 = lookahead8457;
                if (extra8461.errors) {
                    extra8461.errors.push(lexError9219);
                    // We have to break on the first error
                    // to avoid infinite loops.
                    break;
                } else {
                    throw lexError9219;
                }
            }
        }
        filterTokenLocation8596();
        tokens9218 = extra8461.tokens;
        if (typeof extra8461.comments !== "undefined") {
            tokens9218.comments = extra8461.comments;
        }
        if (typeof extra8461.errors !== "undefined") {
            tokens9218.errors = extra8461.errors;
        }
    } catch (e9220) {
        throw e9220;
    } finally {
        unpatch8598();
        extra8461 = {};
    }
    return tokens9218;
}
function blockAllowed8601(toks9221, start9222, inExprDelim9223, parentIsBlock9224) {
    var assignOps9225 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
    var binaryOps9226 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
    var unaryOps9227 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
    function back9228(n9229) {
        var idx9230 = toks9221.length - n9229 > 0 ? toks9221.length - n9229 : 0;
        return toks9221[idx9230];
    }
    if (inExprDelim9223 && toks9221.length - (start9222 + 2) <= 0) {
        // ... ({...} ...)
        return false;
    } else if (back9228(start9222 + 2).value === ":" && parentIsBlock9224) {
        // ...{a:{b:{...}}}
        return true;
    } else if (isIn8463(back9228(start9222 + 2).value, unaryOps9227.concat(binaryOps9226).concat(assignOps9225))) {
        // ... + {...}
        return false;
    } else if (back9228(start9222 + 2).value === "return") {
        var // ASI makes `{}` a block in:
        //
        //    return
        //    { ... }
        //
        // otherwise an object literal, so it's an
        // expression and thus / is divide
        currLineNumber9231 = typeof back9228(start9222 + 1).startLineNumber !== "undefined" ? back9228(start9222 + 1).startLineNumber : back9228(start9222 + 1).lineNumber;
        if (back9228(start9222 + 2).lineNumber !== currLineNumber9231) {
            return true;
        } else {
            return false;
        }
    } else if (isIn8463(back9228(start9222 + 2).value, ["void", "typeof", "in", "case", "delete"])) {
        // ... in {}
        return false;
    } else {
        return true;
    }
}
var // Readtables
readtables8602 = {
    currentReadtable: {},
    // A readtable is invoked within `readToken`, but it can
    // return multiple tokens. We need to "queue" the stream of
    // tokens so that subsequent calls to `readToken` gets the
    // rest of the stream.
    queued: [],
    // A readtable can only override punctuators
    punctuators: ";,.:!?~=%&*+-/<>^|#@",
    has: function has(ch9232) {
        return readtables8602.currentReadtable[ch9232] && readtables8602.punctuators.indexOf(ch9232) !== -1;
    },
    getQueued: function getQueued() {
        return readtables8602.queued.length ? readtables8602.queued.shift() : null;
    },
    peekQueued: function peekQueued(lookahead9233) {
        lookahead9233 = lookahead9233 ? lookahead9233 : 1;
        return readtables8602.queued.length ? readtables8602.queued[lookahead9233 - 1] : null;
    },
    invoke: function invoke(ch9234, toks9235) {
        var prevState9236 = snapshotParserState8603();
        var newStream9237 = readtables8602.currentReadtable[ch9234](ch9234, readtables8602.readerAPI, toks9235, source8444, index8446);
        if (!newStream9237) {
            // Reset the state
            restoreParserState8604(prevState9236);
            return null;
        } else if (!Array.isArray(newStream9237)) {
            newStream9237 = [newStream9237];
        }
        this.queued = this.queued.concat(newStream9237);
        return this.getQueued();
    }
};
function snapshotParserState8603() {
    return {
        index: index8446,
        lineNumber: lineNumber8447,
        lineStart: lineStart8448
    };
}
function restoreParserState8604(prevState9238) {
    index8446 = prevState9238.index;
    lineNumber8447 = prevState9238.lineNumber;
    lineStart8448 = prevState9238.lineStart;
}
function suppressReadError8605(func9239) {
    var prevState9240 = snapshotParserState8603();
    try {
        return func9239();
    } catch (e9241) {
        if (!(e9241 instanceof SyntaxError) && !(e9241 instanceof TypeError)) {
            restoreParserState8604(prevState9240);
            return null;
        }
        throw e9241;
    }
}
function makeIdentifier8606(value9242, opts9243) {
    opts9243 = opts9243 || {};
    var type9244 = Token8435.Identifier;
    if (isKeyword8474(value9242)) {
        type9244 = Token8435.Keyword;
    } else if (value9242 === "null") {
        type9244 = Token8435.NullLiteral;
    } else if (value9242 === "true" || value9242 === "false") {
        type9244 = Token8435.BooleanLiteral;
    }
    return {
        type: type9244,
        value: value9242,
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [opts9243.start || index8446, index8446]
    };
}
function makePunctuator8607(value9245, opts9246) {
    opts9246 = opts9246 || {};
    return {
        type: Token8435.Punctuator,
        value: value9245,
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [opts9246.start || index8446, index8446]
    };
}
function makeStringLiteral8608(value9247, opts9248) {
    opts9248 = opts9248 || {};
    return {
        type: Token8435.StringLiteral,
        value: value9247,
        octal: !!opts9248.octal,
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [opts9248.start || index8446, index8446]
    };
}
function makeNumericLiteral8609(value9249, opts9250) {
    opts9250 = opts9250 || {};
    return {
        type: Token8435.NumericLiteral,
        value: value9249,
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [opts9250.start || index8446, index8446]
    };
}
function makeRegExp8610(value9251, opts9252) {
    opts9252 = opts9252 || {};
    return {
        type: Token8435.RegularExpression,
        value: value9251,
        literal: value9251.toString(),
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [opts9252.start || index8446, index8446]
    };
}
function makeDelimiter8611(value9253, inner9254) {
    var current9255 = {
        lineNumber: lineNumber8447,
        lineStart: lineStart8448,
        range: [index8446, index8446]
    };
    var firstTok9256 = inner9254.length ? inner9254[0] : current9255;
    var lastTok9257 = inner9254.length ? inner9254[inner9254.length - 1] : current9255;
    return {
        type: Token8435.Delimiter,
        value: value9253,
        inner: inner9254,
        startLineNumber: firstTok9256.lineNumber,
        startLineStart: firstTok9256.lineStart,
        startRange: firstTok9256.range,
        endLineNumber: lastTok9257.lineNumber,
        endLineStart: lastTok9257.lineStart,
        endRange: lastTok9257.range
    };
}
var // Since an actual parser object doesn't exist and we want to
// introduce our own API anyway, we create a special reader object
// for reader extensions
readerAPI8612 = Object.defineProperties({
    Token: Token8435,
    isIdentifierStart: isIdentifierStart8469,
    isIdentifierPart: isIdentifierPart8470,
    isLineTerminator: isLineTerminator8468,
    readIdentifier: scanIdentifier8480,
    readPunctuator: scanPunctuator8481,
    readStringLiteral: scanStringLiteral8485,
    readNumericLiteral: scanNumericLiteral8484,
    readRegExp: scanRegExp8488,
    readToken: function readToken() {
        return readToken8613([], false, false);
    },
    readDelimiter: function readDelimiter() {
        return readDelim8614([], false, false);
    },
    skipComment: scanComment8593,
    makeIdentifier: makeIdentifier8606,
    makePunctuator: makePunctuator8607,
    makeStringLiteral: makeStringLiteral8608,
    makeNumericLiteral: makeNumericLiteral8609,
    makeRegExp: makeRegExp8610,
    makeDelimiter: makeDelimiter8611,
    suppressReadError: suppressReadError8605,
    peekQueued: readtables8602.peekQueued,
    getQueued: readtables8602.getQueued
}, {
    source: {
        get: function () {
            return source8444;
        },
        enumerable: true,
        configurable: true
    },
    index: {
        get: function () {
            return index8446;
        },
        set: function (x) {
            index8446 = x;
        },
        enumerable: true,
        configurable: true
    },
    length: {
        get: function () {
            return length8453;
        },
        set: function (x) {
            length8453 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineNumber: {
        get: function () {
            return lineNumber8447;
        },
        set: function (x) {
            lineNumber8447 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineStart: {
        get: function () {
            return lineStart8448;
        },
        set: function (x) {
            lineStart8448 = x;
        },
        enumerable: true,
        configurable: true
    },
    extra: {
        get: function () {
            return extra8461;
        },
        enumerable: true,
        configurable: true
    }
});
readtables8602.readerAPI = readerAPI8612;
function readToken8613(toks9258, inExprDelim9259, parentIsBlock9260) {
    var delimiters9261 = ["(", "{", "["];
    var parenIdents9262 = ["if", "while", "for", "with"];
    var last9263 = toks9258.length - 1;
    var comments9264,
        commentsLen9265 = extra8461.comments.length;
    function back9266(n9272) {
        var idx9273 = toks9258.length - n9272 > 0 ? toks9258.length - n9272 : 0;
        return toks9258[idx9273];
    }
    function attachComments9267(token9274) {
        if (comments9264) {
            token9274.leadingComments = comments9264;
        }
        return token9274;
    }
    function _advance9268() {
        return attachComments9267(advance8491());
    }
    function _scanRegExp9269() {
        return attachComments9267(scanRegExp8488());
    }
    skipComment8475();
    var ch9270 = source8444[index8446];
    if (extra8461.comments.length > commentsLen9265) {
        comments9264 = extra8461.comments.slice(commentsLen9265);
    }
    if (isIn8463(source8444[index8446], delimiters9261)) {
        return attachComments9267(readDelim8614(toks9258, inExprDelim9259, parentIsBlock9260));
    }
    // Check if we should get the token from the readtable
    var readtableToken9271;
    if ((readtableToken9271 = readtables8602.getQueued()) || readtables8602.has(ch9270) && (readtableToken9271 = readtables8602.invoke(ch9270, toks9258))) {
        return readtableToken9271;
    }
    if (ch9270 === "/") {
        var prev9275 = back9266(1);
        if (prev9275) {
            if (prev9275.value === "()") {
                if (isIn8463(back9266(2).value, parenIdents9262)) {
                    // ... if (...) / ...
                    return _scanRegExp9269();
                }
                // ... (...) / ...
                return _advance9268();
            }
            if (prev9275.value === "{}") {
                if (blockAllowed8601(toks9258, 0, inExprDelim9259, parentIsBlock9260)) {
                    if (back9266(2).value === "()") {
                        if ( // named function
                        back9266(4).value === "function") {
                            if (!blockAllowed8601(toks9258, 3, inExprDelim9259, parentIsBlock9260)) {
                                // new function foo (...) {...} / ...
                                return _advance9268();
                            }
                            if (toks9258.length - 5 <= 0 && inExprDelim9259) {
                                // (function foo (...) {...} /...)
                                // [function foo (...) {...} /...]
                                return _advance9268();
                            }
                        }
                        if ( // unnamed function
                        back9266(3).value === "function") {
                            if (!blockAllowed8601(toks9258, 2, inExprDelim9259, parentIsBlock9260)) {
                                // new function (...) {...} / ...
                                return _advance9268();
                            }
                            if (toks9258.length - 4 <= 0 && inExprDelim9259) {
                                // (function (...) {...} /...)
                                // [function (...) {...} /...]
                                return _advance9268();
                            }
                        }
                    }
                    // ...; {...} /...
                    return _scanRegExp9269();
                } else {
                    // ... + {...} / ...
                    return _advance9268();
                }
            }
            if (prev9275.type === Token8435.Punctuator) {
                // ... + /...
                return _scanRegExp9269();
            }
            if (isKeyword8474(prev9275.value) && prev9275.value !== "this" && prev9275.value !== "let" && prev9275.value !== "export") {
                // typeof /...
                return _scanRegExp9269();
            }
            return _advance9268();
        }
        return _scanRegExp9269();
    }
    return _advance9268();
}
function readDelim8614(toks9276, inExprDelim9277, parentIsBlock9278) {
    var startDelim9279 = advance8491(),
        matchDelim9280 = {
        "(": ")",
        "{": "}",
        "[": "]"
    },
        inner9281 = [];
    var delimiters9282 = ["(", "{", "["];
    assert8462(delimiters9282.indexOf(startDelim9279.value) !== -1, "Need to begin at the delimiter");
    var token9283 = startDelim9279;
    var startLineNumber9284 = token9283.lineNumber;
    var startLineStart9285 = token9283.lineStart;
    var startRange9286 = token9283.range;
    var delimToken9287 = {};
    delimToken9287.type = Token8435.Delimiter;
    delimToken9287.value = startDelim9279.value + matchDelim9280[startDelim9279.value];
    delimToken9287.startLineNumber = startLineNumber9284;
    delimToken9287.startLineStart = startLineStart9285;
    delimToken9287.startRange = startRange9286;
    var delimIsBlock9288 = false;
    if (startDelim9279.value === "{") {
        delimIsBlock9288 = blockAllowed8601(toks9276.concat(delimToken9287), 0, inExprDelim9277, parentIsBlock9278);
    }
    while (index8446 <= length8453) {
        token9283 = readToken8613(inner9281, startDelim9279.value === "(" || startDelim9279.value === "[", delimIsBlock9288);
        if (token9283.type === Token8435.Punctuator && token9283.value === matchDelim9280[startDelim9279.value]) {
            if (token9283.leadingComments) {
                delimToken9287.trailingComments = token9283.leadingComments;
            }
            break;
        } else if (token9283.type === Token8435.EOF) {
            throwError8499({}, Messages8440.UnexpectedEOS);
        } else {
            inner9281.push(token9283);
        }
    }
    if ( // at the end of the stream but the very last char wasn't the closing delimiter
    index8446 >= length8453 && matchDelim9280[startDelim9279.value] !== source8444[length8453 - 1]) {
        throwError8499({}, Messages8440.UnexpectedEOS);
    }
    var endLineNumber9289 = token9283.lineNumber;
    var endLineStart9290 = token9283.lineStart;
    var endRange9291 = token9283.range;
    delimToken9287.inner = inner9281;
    delimToken9287.endLineNumber = endLineNumber9289;
    delimToken9287.endLineStart = endLineStart9290;
    delimToken9287.endRange = endRange9291;
    return delimToken9287;
}
function setReadtable8615(readtable9292, syn9293) {
    readtables8602.currentReadtable = readtable9292;
    if (syn9293) {
        readtables8602.readerAPI.throwSyntaxError = function (name9294, message9295, tok9296) {
            var sx9297 = syn9293.syntaxFromToken(tok9296);
            var err9298 = new syn9293.MacroSyntaxError(name9294, message9295, sx9297);
            throw new SyntaxError(syn9293.printSyntaxError(source8444, err9298));
        };
    }
}
function currentReadtable8616() {
    return readtables8602.currentReadtable;
}
function read8617(code9299) {
    var token9300,
        tokenTree9301 = [];
    extra8461 = {};
    extra8461.comments = [];
    extra8461.range = true;
    extra8461.loc = true;
    patch8597();
    source8444 = code9299;
    index8446 = 0;
    lineNumber8447 = source8444.length > 0 ? 1 : 0;
    lineStart8448 = 0;
    length8453 = source8444.length;
    state8459 = {
        allowIn: true,
        labelSet: {},
        lastParenthesized: null,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false
    };
    while (index8446 < length8453 || readtables8602.peekQueued()) {
        tokenTree9301.push(readToken8613(tokenTree9301, false, false));
    }
    var last9302 = tokenTree9301[tokenTree9301.length - 1];
    if (last9302 && last9302.type !== Token8435.EOF) {
        tokenTree9301.push({
            type: Token8435.EOF,
            value: "",
            lineNumber: last9302.lineNumber,
            lineStart: last9302.lineStart,
            range: [index8446, index8446]
        });
    }
    return expander8434.tokensToSyntax(tokenTree9301);
}
function parse8618(code9303, options9304) {
    var program9305, toString9306;
    extra8461 = {};
    if ( // given an array of tokens instead of a string
    Array.isArray(code9303)) {
        tokenStream8455 = code9303;
        length8453 = tokenStream8455.length;
        lineNumber8447 = tokenStream8455.length > 0 ? 1 : 0;
        source8444 = undefined;
    } else {
        toString9306 = String;
        if (typeof code9303 !== "string" && !(code9303 instanceof String)) {
            code9303 = toString9306(code9303);
        }
        source8444 = code9303;
        length8453 = source8444.length;
        lineNumber8447 = source8444.length > 0 ? 1 : 0;
    }
    delegate8454 = SyntaxTreeDelegate8442;
    streamIndex8456 = -1;
    index8446 = 0;
    lineStart8448 = 0;
    sm_lineStart8450 = 0;
    sm_lineNumber8449 = lineNumber8447;
    sm_index8452 = 0;
    sm_range8451 = [0, 0];
    lookahead8457 = null;
    phase8460 = options9304 && typeof options9304.phase !== "undefined" ? options9304.phase : 0;
    state8459 = {
        allowKeyword: false,
        allowIn: true,
        labelSet: {},
        parenthesizedCount: 0,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        yieldAllowed: false
    };
    extra8461.attachComment = true;
    extra8461.range = true;
    extra8461.comments = [];
    extra8461.bottomRightStack = [];
    extra8461.trailingComments = [];
    extra8461.leadingComments = [];
    if (typeof options9304 !== "undefined") {
        extra8461.range = typeof options9304.range === "boolean" && options9304.range;
        extra8461.loc = typeof options9304.loc === "boolean" && options9304.loc;
        extra8461.attachComment = typeof options9304.attachComment === "boolean" && options9304.attachComment;
        if (extra8461.loc && options9304.source !== null && options9304.source !== undefined) {
            delegate8454 = extend8599(delegate8454, {
                postProcess: function (node9307) {
                    node9307.loc.source = toString9306(options9304.source);
                    return node9307;
                }
            });
        }
        if (typeof options9304.tokens === "boolean" && options9304.tokens) {
            extra8461.tokens = [];
        }
        if (typeof options9304.comment === "boolean" && options9304.comment) {
            extra8461.comments = [];
        }
        if (typeof options9304.tolerant === "boolean" && options9304.tolerant) {
            extra8461.errors = [];
        }
    }
    if (length8453 > 0) {
        if (source8444 && typeof source8444[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code9303 instanceof String) {
                source8444 = code9303.valueOf();
            }
        }
    }
    extra8461.loc = true;
    extra8461.errors = [];
    patch8597();
    try {
        program9305 = parseProgram8591();
        if (typeof extra8461.comments !== "undefined") {
            program9305.comments = extra8461.comments;
        }
        if (typeof extra8461.tokens !== "undefined") {
            filterTokenLocation8596();
            program9305.tokens = extra8461.tokens;
        }
        if (typeof extra8461.errors !== "undefined") {
            program9305.errors = extra8461.errors;
        }
    } catch (e9308) {
        throw e9308;
    } finally {
        unpatch8598();
        extra8461 = {};
    }
    return program9305;
}
exports.tokenize = tokenize8600;
exports.read = read8617;
exports.Token = Token8435;
exports.setReadtable = setReadtable8615;
exports.currentReadtable = currentReadtable8616;
exports.parse = parse8618;
// Deep copy.
exports.Syntax = (function () {
    var name9309,
        types9310 = {};
    if (typeof Object.create === "function") {
        types9310 = Object.create(null);
    }
    for (name9309 in Syntax8438) {
        if (Syntax8438.hasOwnProperty(name9309)) {
            types9310[name9309] = Syntax8438[name9309];
        }
    }
    if (typeof Object.freeze === "function") {
        Object.freeze(types9310);
    }
    return types9310;
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