"use strict";

var expander8028 = require("./expander");
var Token8029, TokenName8030, FnExprTokens8031, Syntax8032, PropertyKind8033, Messages8034, Regex8035, SyntaxTreeDelegate8036, ClassPropertyType8037, source8038, strict8039, index8040, lineNumber8041, lineStart8042, sm_lineNumber8043, sm_lineStart8044, sm_range8045, sm_index8046, length8047, delegate8048, tokenStream8049, streamIndex8050, lookahead8051, lookaheadIndex8052, state8053, phase8054, extra8055;
Token8029 = {
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
TokenName8030 = {};
TokenName8030[Token8029.BooleanLiteral] = "Boolean";
TokenName8030[Token8029.EOF] = "<end>";
TokenName8030[Token8029.Identifier] = "Identifier";
TokenName8030[Token8029.Keyword] = "Keyword";
TokenName8030[Token8029.NullLiteral] = "Null";
TokenName8030[Token8029.NumericLiteral] = "Numeric";
TokenName8030[Token8029.Punctuator] = "Punctuator";
TokenName8030[Token8029.StringLiteral] = "String";
TokenName8030[Token8029.RegularExpression] = "RegularExpression";
TokenName8030[Token8029.Delimiter] = "Delimiter";
// A function following one of those tokens is an expression.
FnExprTokens8031 = ["(", "{", "[", "in", "typeof", "instanceof", "new", "return", "case", "delete", "throw", "void",
// assignment operators
"=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ",",
// binary/unary operators
"+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!=="];
Syntax8032 = {
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
PropertyKind8033 = {
    Data: 1,
    Get: 2,
    Set: 4
};
ClassPropertyType8037 = {
    "static": "static",
    prototype: "prototype"
};
// Error messages should be identical to V8.
Messages8034 = {
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
Regex8035 = {
    NonAsciiIdentifierStart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"),
    NonAsciiIdentifierPart: new RegExp("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")
};
function assert8056(condition8213, message8214) {
    if (!condition8213) {
        throw new Error("ASSERT: " + message8214);
    }
}
function isIn8057(el8215, list8216) {
    return list8216.indexOf(el8215) !== -1;
}
function isDecimalDigit8058(ch8217) {
    return ch8217 >= 48 && ch8217 <= 57;
}
function isHexDigit8059(ch8218) {
    return "0123456789abcdefABCDEF".indexOf(ch8218) >= 0;
}
function isOctalDigit8060(ch8219) {
    return "01234567".indexOf(ch8219) >= 0;
}
function isWhiteSpace8061(ch8220) {
    return ch8220 === 32 || // space
    ch8220 === 9 || // tab
    ch8220 === 11 || ch8220 === 12 || ch8220 === 160 || ch8220 >= 5760 && " ᠎             　﻿".indexOf(String.fromCharCode(ch8220)) > 0;
}
function isLineTerminator8062(ch8221) {
    return ch8221 === 10 || ch8221 === 13 || ch8221 === 8232 || ch8221 === 8233;
}
function isIdentifierStart8063(ch8222) {
    return ch8222 === 36 || ch8222 === 95 || // $ (dollar) and _ (underscore)
    ch8222 >= 65 && ch8222 <= 90 || // A..Z
    ch8222 >= 97 && ch8222 <= 122 || // a..z
    ch8222 === 92 || // \ (backslash)
    ch8222 >= 128 && Regex8035.NonAsciiIdentifierStart.test(String.fromCharCode(ch8222));
}
function isIdentifierPart8064(ch8223) {
    return ch8223 === 36 || ch8223 === 95 || // $ (dollar) and _ (underscore)
    ch8223 >= 65 && ch8223 <= 90 || // A..Z
    ch8223 >= 97 && ch8223 <= 122 || // a..z
    ch8223 >= 48 && ch8223 <= 57 || // 0..9
    ch8223 === 92 || // \ (backslash)
    ch8223 >= 128 && Regex8035.NonAsciiIdentifierPart.test(String.fromCharCode(ch8223));
}
function isFutureReservedWord8065(id8224) {
    switch (id8224) {
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
function isStrictModeReservedWord8066(id8225) {
    switch (id8225) {
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
function isRestrictedWord8067(id8226) {
    return id8226 === "eval" || id8226 === "arguments";
}
function isKeyword8068(id8227) {
    if (strict8039 && isStrictModeReservedWord8066(id8227)) {
        return true;
    }
    switch ( // 'const' is specialized as Keyword in V8.
    // 'yield' is only treated as a keyword in strict mode.
    // 'let' is for compatiblity with SpiderMonkey and ES.next.
    // Some others are from future reserved words.
    id8227.length) {
        case 2:
            return id8227 === "if" || id8227 === "in" || id8227 === "do";
        case 3:
            return id8227 === "var" || id8227 === "for" || id8227 === "new" || id8227 === "try" || id8227 === "let";
        case 4:
            return id8227 === "this" || id8227 === "else" || id8227 === "case" || id8227 === "void" || id8227 === "with" || id8227 === "enum";
        case 5:
            return id8227 === "while" || id8227 === "break" || id8227 === "catch" || id8227 === "throw" || id8227 === "const" || id8227 === "class" || id8227 === "super";
        case 6:
            return id8227 === "return" || id8227 === "typeof" || id8227 === "delete" || id8227 === "switch" || id8227 === "export" || id8227 === "import";
        case 7:
            return id8227 === "default" || id8227 === "finally" || id8227 === "extends";
        case 8:
            return id8227 === "function" || id8227 === "continue" || id8227 === "debugger";
        case 10:
            return id8227 === "instanceof";
        default:
            return false;
    }
}
function skipComment8069() {
    var ch8228, blockComment8229, lineComment8230;
    blockComment8229 = false;
    lineComment8230 = false;
    while (index8040 < length8047) {
        ch8228 = source8038.charCodeAt(index8040);
        if (lineComment8230) {
            ++index8040;
            if (isLineTerminator8062(ch8228)) {
                lineComment8230 = false;
                if (ch8228 === 13 && source8038.charCodeAt(index8040) === 10) {
                    ++index8040;
                }
                ++lineNumber8041;
                lineStart8042 = index8040;
            }
        } else if (blockComment8229) {
            if (isLineTerminator8062(ch8228)) {
                if (ch8228 === 13 && source8038.charCodeAt(index8040 + 1) === 10) {
                    ++index8040;
                }
                ++lineNumber8041;
                ++index8040;
                lineStart8042 = index8040;
                if (index8040 >= length8047) {
                    throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch8228 = source8038.charCodeAt(index8040++);
                if (index8040 >= length8047) {
                    throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
                }
                if ( // Block comment ends with '*/' (char #42, char #47).
                ch8228 === 42) {
                    ch8228 = source8038.charCodeAt(index8040);
                    if (ch8228 === 47) {
                        ++index8040;
                        blockComment8229 = false;
                    }
                }
            }
        } else if (ch8228 === 47) {
            ch8228 = source8038.charCodeAt(index8040 + 1);
            if ( // Line comment starts with '//' (char #47, char #47).
            ch8228 === 47) {
                index8040 += 2;
                lineComment8230 = true;
            } else if (ch8228 === 42) {
                // Block comment starts with '/*' (char #47, char #42).
                index8040 += 2;
                blockComment8229 = true;
                if (index8040 >= length8047) {
                    throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8061(ch8228)) {
            ++index8040;
        } else if (isLineTerminator8062(ch8228)) {
            ++index8040;
            if (ch8228 === 13 && source8038.charCodeAt(index8040) === 10) {
                ++index8040;
            }
            ++lineNumber8041;
            lineStart8042 = index8040;
        } else {
            break;
        }
    }
}
function scanHexEscape8070(prefix8231) {
    var i8232,
        len8233,
        ch8234,
        code8235 = 0;
    len8233 = prefix8231 === "u" ? 4 : 2;
    for (i8232 = 0; i8232 < len8233; ++i8232) {
        if (index8040 < length8047 && isHexDigit8059(source8038[index8040])) {
            ch8234 = source8038[index8040++];
            code8235 = code8235 * 16 + "0123456789abcdef".indexOf(ch8234.toLowerCase());
        } else {
            return "";
        }
    }
    return String.fromCharCode(code8235);
}
function scanUnicodeCodePointEscape8071() {
    var ch8236, code8237, cu18238, cu28239;
    ch8236 = source8038[index8040];
    code8237 = 0;
    if ( // At least, one hex digit is required.
    ch8236 === "}") {
        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
    }
    while (index8040 < length8047) {
        ch8236 = source8038[index8040++];
        if (!isHexDigit8059(ch8236)) {
            break;
        }
        code8237 = code8237 * 16 + "0123456789abcdef".indexOf(ch8236.toLowerCase());
    }
    if (code8237 > 1114111 || ch8236 !== "}") {
        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
    }
    if ( // UTF-16 Encoding
    code8237 <= 65535) {
        return String.fromCharCode(code8237);
    }
    cu18238 = (code8237 - 65536 >> 10) + 55296;
    cu28239 = (code8237 - 65536 & 1023) + 56320;
    return String.fromCharCode(cu18238, cu28239);
}
function getEscapedIdentifier8072() {
    var ch8240, id8241;
    ch8240 = source8038.charCodeAt(index8040++);
    id8241 = String.fromCharCode(ch8240);
    if ( // '\u' (char #92, char #117) denotes an escaped character.
    ch8240 === 92) {
        if (source8038.charCodeAt(index8040) !== 117) {
            throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
        }
        ++index8040;
        ch8240 = scanHexEscape8070("u");
        if (!ch8240 || ch8240 === "\\" || !isIdentifierStart8063(ch8240.charCodeAt(0))) {
            throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
        }
        id8241 = ch8240;
    }
    while (index8040 < length8047) {
        ch8240 = source8038.charCodeAt(index8040);
        if (!isIdentifierPart8064(ch8240)) {
            break;
        }
        ++index8040;
        id8241 += String.fromCharCode(ch8240);
        if ( // '\u' (char #92, char #117) denotes an escaped character.
        ch8240 === 92) {
            id8241 = id8241.substr(0, id8241.length - 1);
            if (source8038.charCodeAt(index8040) !== 117) {
                throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
            }
            ++index8040;
            ch8240 = scanHexEscape8070("u");
            if (!ch8240 || ch8240 === "\\" || !isIdentifierPart8064(ch8240.charCodeAt(0))) {
                throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
            }
            id8241 += ch8240;
        }
    }
    return id8241;
}
function getIdentifier8073() {
    var start8242, ch8243;
    start8242 = index8040++;
    while (index8040 < length8047) {
        ch8243 = source8038.charCodeAt(index8040);
        if (ch8243 === 92) {
            // Blackslash (char #92) marks Unicode escape sequence.
            index8040 = start8242;
            return getEscapedIdentifier8072();
        }
        if (isIdentifierPart8064(ch8243)) {
            ++index8040;
        } else {
            break;
        }
    }
    return source8038.slice(start8242, index8040);
}
function scanIdentifier8074() {
    var start8244, id8245, type8246;
    start8244 = index8040;
    // Backslash (char #92) starts an escaped character.
    id8245 = source8038.charCodeAt(index8040) === 92 ? getEscapedIdentifier8072() : getIdentifier8073();
    if ( // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    id8245.length === 1) {
        type8246 = Token8029.Identifier;
    } else if (isKeyword8068(id8245)) {
        type8246 = Token8029.Keyword;
    } else if (id8245 === "null") {
        type8246 = Token8029.NullLiteral;
    } else if (id8245 === "true" || id8245 === "false") {
        type8246 = Token8029.BooleanLiteral;
    } else {
        type8246 = Token8029.Identifier;
    }
    return {
        type: type8246,
        value: id8245,
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [start8244, index8040]
    };
}
function scanPunctuator8075() {
    var start8247 = index8040,
        code8248 = source8038.charCodeAt(index8040),
        code28249,
        ch18250 = source8038[index8040],
        ch28251,
        ch38252,
        ch48253;
    switch (code8248) {
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
            ++index8040;
            if (extra8055.tokenize) {
                if (code8248 === 40) {
                    extra8055.openParenToken = extra8055.tokens.length;
                } else if (code8248 === 123) {
                    extra8055.openCurlyToken = extra8055.tokens.length;
                }
            }
            return {
                type: Token8029.Punctuator,
                value: String.fromCharCode(code8248),
                lineNumber: lineNumber8041,
                lineStart: lineStart8042,
                range: [start8247, index8040]
            };
        default:
            code28249 = source8038.charCodeAt(index8040 + 1);
            if ( // '=' (char #61) marks an assignment or comparison operator.
            code28249 === 61) {
                switch (code8248) {
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
                        index8040 += 2;
                        return {
                            type: Token8029.Punctuator,
                            value: String.fromCharCode(code8248) + String.fromCharCode(code28249),
                            lineNumber: lineNumber8041,
                            lineStart: lineStart8042,
                            range: [start8247, index8040]
                        };
                    case 33:
                    case // !
                    61:
                        // =
                        index8040 += 2;
                        if ( // !== and ===
                        source8038.charCodeAt(index8040) === 61) {
                            ++index8040;
                        }
                        return {
                            type: Token8029.Punctuator,
                            value: source8038.slice(start8247, index8040),
                            lineNumber: lineNumber8041,
                            lineStart: lineStart8042,
                            range: [start8247, index8040]
                        };
                    default:
                        break;
                }
            }
            break;
    }
    // Peek more characters.
    ch28251 = source8038[index8040 + 1];
    ch38252 = source8038[index8040 + 2];
    ch48253 = source8038[index8040 + 3];
    if ( // 4-character punctuator: >>>=
    ch18250 === ">" && ch28251 === ">" && ch38252 === ">") {
        if (ch48253 === "=") {
            index8040 += 4;
            return {
                type: Token8029.Punctuator,
                value: ">>>=",
                lineNumber: lineNumber8041,
                lineStart: lineStart8042,
                range: [start8247, index8040]
            };
        }
    }
    if ( // 3-character punctuators: === !== >>> <<= >>=
    ch18250 === ">" && ch28251 === ">" && ch38252 === ">") {
        index8040 += 3;
        return {
            type: Token8029.Punctuator,
            value: ">>>",
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [start8247, index8040]
        };
    }
    if (ch18250 === "<" && ch28251 === "<" && ch38252 === "=") {
        index8040 += 3;
        return {
            type: Token8029.Punctuator,
            value: "<<=",
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [start8247, index8040]
        };
    }
    if (ch18250 === ">" && ch28251 === ">" && ch38252 === "=") {
        index8040 += 3;
        return {
            type: Token8029.Punctuator,
            value: ">>=",
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [start8247, index8040]
        };
    }
    if (ch18250 === "." && ch28251 === "." && ch38252 === ".") {
        index8040 += 3;
        return {
            type: Token8029.Punctuator,
            value: "...",
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [start8247, index8040]
        };
    }
    if ( // Other 2-character punctuators: ++ -- << >> && ||
    ch18250 === ch28251 && "+-<>&|".indexOf(ch18250) >= 0) {
        index8040 += 2;
        return {
            type: Token8029.Punctuator,
            value: ch18250 + ch28251,
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [start8247, index8040]
        };
    }
    if (ch18250 === "=" && ch28251 === ">") {
        index8040 += 2;
        return {
            type: Token8029.Punctuator,
            value: "=>",
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [start8247, index8040]
        };
    }
    if ("<>=!+-*%&|^/".indexOf(ch18250) >= 0) {
        ++index8040;
        return {
            type: Token8029.Punctuator,
            value: ch18250,
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [start8247, index8040]
        };
    }
    if (ch18250 === ".") {
        ++index8040;
        return {
            type: Token8029.Punctuator,
            value: ch18250,
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [start8247, index8040]
        };
    }
    throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
}
function scanHexLiteral8076(start8254) {
    var number8255 = "";
    while (index8040 < length8047) {
        if (!isHexDigit8059(source8038[index8040])) {
            break;
        }
        number8255 += source8038[index8040++];
    }
    if (number8255.length === 0) {
        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8063(source8038.charCodeAt(index8040))) {
        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8029.NumericLiteral,
        value: parseInt("0x" + number8255, 16),
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [start8254, index8040]
    };
}
function scanOctalLiteral8077(prefix8256, start8257) {
    var number8258, octal8259;
    if (isOctalDigit8060(prefix8256)) {
        octal8259 = true;
        number8258 = "0" + source8038[index8040++];
    } else {
        octal8259 = false;
        ++index8040;
        number8258 = "";
    }
    while (index8040 < length8047) {
        if (!isOctalDigit8060(source8038[index8040])) {
            break;
        }
        number8258 += source8038[index8040++];
    }
    if (!octal8259 && number8258.length === 0) {
        // only 0o or 0O
        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
    }
    if (isIdentifierStart8063(source8038.charCodeAt(index8040)) || isDecimalDigit8058(source8038.charCodeAt(index8040))) {
        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8029.NumericLiteral,
        value: parseInt(number8258, 8),
        octal: octal8259,
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [start8257, index8040]
    };
}
function scanNumericLiteral8078() {
    var number8260, start8261, ch8262, octal8263;
    ch8262 = source8038[index8040];
    assert8056(isDecimalDigit8058(ch8262.charCodeAt(0)) || ch8262 === ".", "Numeric literal must start with a decimal digit or a decimal point");
    start8261 = index8040;
    number8260 = "";
    if (ch8262 !== ".") {
        number8260 = source8038[index8040++];
        ch8262 = source8038[index8040];
        if ( // Hex number starts with '0x'.
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        // Binary number in ES6 starts with '0b'.
        number8260 === "0") {
            if (ch8262 === "x" || ch8262 === "X") {
                ++index8040;
                return scanHexLiteral8076(start8261);
            }
            if (ch8262 === "b" || ch8262 === "B") {
                ++index8040;
                number8260 = "";
                while (index8040 < length8047) {
                    ch8262 = source8038[index8040];
                    if (ch8262 !== "0" && ch8262 !== "1") {
                        break;
                    }
                    number8260 += source8038[index8040++];
                }
                if (number8260.length === 0) {
                    // only 0b or 0B
                    throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
                }
                if (index8040 < length8047) {
                    ch8262 = source8038.charCodeAt(index8040);
                    if (isIdentifierStart8063(ch8262) || isDecimalDigit8058(ch8262)) {
                        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
                    }
                }
                return {
                    type: Token8029.NumericLiteral,
                    value: parseInt(number8260, 2),
                    lineNumber: lineNumber8041,
                    lineStart: lineStart8042,
                    range: [start8261, index8040]
                };
            }
            if (ch8262 === "o" || ch8262 === "O" || isOctalDigit8060(ch8262)) {
                return scanOctalLiteral8077(ch8262, start8261);
            }
            if ( // decimal number starts with '0' such as '09' is illegal.
            ch8262 && isDecimalDigit8058(ch8262.charCodeAt(0))) {
                throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
            }
        }
        while (isDecimalDigit8058(source8038.charCodeAt(index8040))) {
            number8260 += source8038[index8040++];
        }
        ch8262 = source8038[index8040];
    }
    if (ch8262 === ".") {
        number8260 += source8038[index8040++];
        while (isDecimalDigit8058(source8038.charCodeAt(index8040))) {
            number8260 += source8038[index8040++];
        }
        ch8262 = source8038[index8040];
    }
    if (ch8262 === "e" || ch8262 === "E") {
        number8260 += source8038[index8040++];
        ch8262 = source8038[index8040];
        if (ch8262 === "+" || ch8262 === "-") {
            number8260 += source8038[index8040++];
        }
        if (isDecimalDigit8058(source8038.charCodeAt(index8040))) {
            while (isDecimalDigit8058(source8038.charCodeAt(index8040))) {
                number8260 += source8038[index8040++];
            }
        } else {
            throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
        }
    }
    if (isIdentifierStart8063(source8038.charCodeAt(index8040))) {
        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8029.NumericLiteral,
        value: parseFloat(number8260),
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [start8261, index8040]
    };
}
function scanStringLiteral8079() {
    var str8264 = "",
        quote8265,
        start8266,
        ch8267,
        code8268,
        unescaped8269,
        restore8270,
        octal8271 = false;
    quote8265 = source8038[index8040];
    assert8056(quote8265 === "'" || quote8265 === "\"", "String literal must starts with a quote");
    start8266 = index8040;
    ++index8040;
    while (index8040 < length8047) {
        ch8267 = source8038[index8040++];
        if (ch8267 === quote8265) {
            quote8265 = "";
            break;
        } else if (ch8267 === "\\") {
            ch8267 = source8038[index8040++];
            if (!ch8267 || !isLineTerminator8062(ch8267.charCodeAt(0))) {
                switch (ch8267) {
                    case "n":
                        str8264 += "\n";
                        break;
                    case "r":
                        str8264 += "\r";
                        break;
                    case "t":
                        str8264 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8038[index8040] === "{") {
                            ++index8040;
                            str8264 += scanUnicodeCodePointEscape8071();
                        } else {
                            restore8270 = index8040;
                            unescaped8269 = scanHexEscape8070(ch8267);
                            if (unescaped8269) {
                                str8264 += unescaped8269;
                            } else {
                                index8040 = restore8270;
                                str8264 += ch8267;
                            }
                        }
                        break;
                    case "b":
                        str8264 += "\b";
                        break;
                    case "f":
                        str8264 += "\f";
                        break;
                    case "v":
                        str8264 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8060(ch8267)) {
                            code8268 = "01234567".indexOf(ch8267);
                            if ( // \0 is not octal escape sequence
                            code8268 !== 0) {
                                octal8271 = true;
                            }
                            if (index8040 < length8047 && isOctalDigit8060(source8038[index8040])) {
                                octal8271 = true;
                                code8268 = code8268 * 8 + "01234567".indexOf(source8038[index8040++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8267) >= 0 && index8040 < length8047 && isOctalDigit8060(source8038[index8040])) {
                                    code8268 = code8268 * 8 + "01234567".indexOf(source8038[index8040++]);
                                }
                            }
                            str8264 += String.fromCharCode(code8268);
                        } else {
                            str8264 += ch8267;
                        }
                        break;
                }
            } else {
                ++lineNumber8041;
                if (ch8267 === "\r" && source8038[index8040] === "\n") {
                    ++index8040;
                }
                lineStart8042 = index8040;
            }
        } else if (isLineTerminator8062(ch8267.charCodeAt(0))) {
            break;
        } else {
            str8264 += ch8267;
        }
    }
    if (quote8265 !== "") {
        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8029.StringLiteral,
        value: str8264,
        octal: octal8271,
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [start8266, index8040]
    };
}
function scanTemplate8080() {
    var cooked8272 = "",
        ch8273,
        start8274,
        terminated8275,
        tail8276,
        restore8277,
        unescaped8278,
        code8279,
        octal8280;
    terminated8275 = false;
    tail8276 = false;
    start8274 = index8040;
    ++index8040;
    while (index8040 < length8047) {
        ch8273 = source8038[index8040++];
        if (ch8273 === "`") {
            tail8276 = true;
            terminated8275 = true;
            break;
        } else if (ch8273 === "$") {
            if (source8038[index8040] === "{") {
                ++index8040;
                terminated8275 = true;
                break;
            }
            cooked8272 += ch8273;
        } else if (ch8273 === "\\") {
            ch8273 = source8038[index8040++];
            if (!isLineTerminator8062(ch8273.charCodeAt(0))) {
                switch (ch8273) {
                    case "n":
                        cooked8272 += "\n";
                        break;
                    case "r":
                        cooked8272 += "\r";
                        break;
                    case "t":
                        cooked8272 += "\t";
                        break;
                    case "u":
                    case "x":
                        if (source8038[index8040] === "{") {
                            ++index8040;
                            cooked8272 += scanUnicodeCodePointEscape8071();
                        } else {
                            restore8277 = index8040;
                            unescaped8278 = scanHexEscape8070(ch8273);
                            if (unescaped8278) {
                                cooked8272 += unescaped8278;
                            } else {
                                index8040 = restore8277;
                                cooked8272 += ch8273;
                            }
                        }
                        break;
                    case "b":
                        cooked8272 += "\b";
                        break;
                    case "f":
                        cooked8272 += "\f";
                        break;
                    case "v":
                        cooked8272 += "\u000b";
                        break;
                    default:
                        if (isOctalDigit8060(ch8273)) {
                            code8279 = "01234567".indexOf(ch8273);
                            if ( // \0 is not octal escape sequence
                            code8279 !== 0) {
                                octal8280 = true;
                            }
                            if (index8040 < length8047 && isOctalDigit8060(source8038[index8040])) {
                                octal8280 = true;
                                code8279 = code8279 * 8 + "01234567".indexOf(source8038[index8040++]);
                                if ( // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                "0123".indexOf(ch8273) >= 0 && index8040 < length8047 && isOctalDigit8060(source8038[index8040])) {
                                    code8279 = code8279 * 8 + "01234567".indexOf(source8038[index8040++]);
                                }
                            }
                            cooked8272 += String.fromCharCode(code8279);
                        } else {
                            cooked8272 += ch8273;
                        }
                        break;
                }
            } else {
                ++lineNumber8041;
                if (ch8273 === "\r" && source8038[index8040] === "\n") {
                    ++index8040;
                }
                lineStart8042 = index8040;
            }
        } else if (isLineTerminator8062(ch8273.charCodeAt(0))) {
            ++lineNumber8041;
            if (ch8273 === "\r" && source8038[index8040] === "\n") {
                ++index8040;
            }
            lineStart8042 = index8040;
            cooked8272 += "\n";
        } else {
            cooked8272 += ch8273;
        }
    }
    if (!terminated8275) {
        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
    }
    return {
        type: Token8029.Template,
        value: {
            cooked: cooked8272,
            raw: source8038.slice(start8274 + 1, index8040 - (tail8276 ? 1 : 2))
        },
        tail: tail8276,
        octal: octal8280,
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [start8274, index8040]
    };
}
function scanTemplateElement8081(option8281) {
    var startsWith8282, template8283;
    lookahead8051 = null;
    skipComment8069();
    startsWith8282 = option8281.head ? "`" : "}";
    if (source8038[index8040] !== startsWith8282) {
        throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
    }
    template8283 = scanTemplate8080();
    peek8087();
    return template8283;
}
function scanRegExp8082() {
    var str8284,
        ch8285,
        start8286,
        pattern8287,
        flags8288,
        value8289,
        classMarker8290 = false,
        restore8291,
        terminated8292 = false;
    lookahead8051 = null;
    skipComment8069();
    start8286 = index8040;
    ch8285 = source8038[index8040];
    assert8056(ch8285 === "/", "Regular expression literal must start with a slash");
    str8284 = source8038[index8040++];
    while (index8040 < length8047) {
        ch8285 = source8038[index8040++];
        str8284 += ch8285;
        if (classMarker8290) {
            if (ch8285 === "]") {
                classMarker8290 = false;
            }
        } else {
            if (ch8285 === "\\") {
                ch8285 = source8038[index8040++];
                if ( // ECMA-262 7.8.5
                isLineTerminator8062(ch8285.charCodeAt(0))) {
                    throwError8093({}, Messages8034.UnterminatedRegExp);
                }
                str8284 += ch8285;
            } else if (ch8285 === "/") {
                terminated8292 = true;
                break;
            } else if (ch8285 === "[") {
                classMarker8290 = true;
            } else if (isLineTerminator8062(ch8285.charCodeAt(0))) {
                throwError8093({}, Messages8034.UnterminatedRegExp);
            }
        }
    }
    if (!terminated8292) {
        throwError8093({}, Messages8034.UnterminatedRegExp);
    }
    // Exclude leading and trailing slash.
    pattern8287 = str8284.substr(1, str8284.length - 2);
    flags8288 = "";
    while (index8040 < length8047) {
        ch8285 = source8038[index8040];
        if (!isIdentifierPart8064(ch8285.charCodeAt(0))) {
            break;
        }
        ++index8040;
        if (ch8285 === "\\" && index8040 < length8047) {
            ch8285 = source8038[index8040];
            if (ch8285 === "u") {
                ++index8040;
                restore8291 = index8040;
                ch8285 = scanHexEscape8070("u");
                if (ch8285) {
                    flags8288 += ch8285;
                    for (str8284 += "\\u"; restore8291 < index8040; ++restore8291) {
                        str8284 += source8038[restore8291];
                    }
                } else {
                    index8040 = restore8291;
                    flags8288 += "u";
                    str8284 += "\\u";
                }
            } else {
                str8284 += "\\";
            }
        } else {
            flags8288 += ch8285;
            str8284 += ch8285;
        }
    }
    try {
        value8289 = new RegExp(pattern8287, flags8288);
    } catch (e8293) {
        throwError8093({}, Messages8034.InvalidRegExp);
    }
    if ( // peek();
    extra8055.tokenize) {
        return {
            type: Token8029.RegularExpression,
            value: value8289,
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [start8286, index8040]
        };
    }
    return {
        type: Token8029.RegularExpression,
        literal: str8284,
        value: value8289,
        range: [start8286, index8040]
    };
}
function isIdentifierName8083(token8294) {
    return token8294.type === Token8029.Identifier || token8294.type === Token8029.Keyword || token8294.type === Token8029.BooleanLiteral || token8294.type === Token8029.NullLiteral;
}
function advanceSlash8084() {
    var prevToken8295, checkToken8296;
    // Using the following algorithm:
    // https://github.com/mozilla/sweet.js/wiki/design
    prevToken8295 = extra8055.tokens[extra8055.tokens.length - 1];
    if (!prevToken8295) {
        // Nothing before that: it cannot be a division.
        return scanRegExp8082();
    }
    if (prevToken8295.type === "Punctuator") {
        if (prevToken8295.value === ")") {
            checkToken8296 = extra8055.tokens[extra8055.openParenToken - 1];
            if (checkToken8296 && checkToken8296.type === "Keyword" && (checkToken8296.value === "if" || checkToken8296.value === "while" || checkToken8296.value === "for" || checkToken8296.value === "with")) {
                return scanRegExp8082();
            }
            return scanPunctuator8075();
        }
        if (prevToken8295.value === "}") {
            if ( // Dividing a function by anything makes little sense,
            // but we have to check for that.
            extra8055.tokens[extra8055.openCurlyToken - 3] && extra8055.tokens[extra8055.openCurlyToken - 3].type === "Keyword") {
                // Anonymous function.
                checkToken8296 = extra8055.tokens[extra8055.openCurlyToken - 4];
                if (!checkToken8296) {
                    return scanPunctuator8075();
                }
            } else if (extra8055.tokens[extra8055.openCurlyToken - 4] && extra8055.tokens[extra8055.openCurlyToken - 4].type === "Keyword") {
                // Named function.
                checkToken8296 = extra8055.tokens[extra8055.openCurlyToken - 5];
                if (!checkToken8296) {
                    return scanRegExp8082();
                }
            } else {
                return scanPunctuator8075();
            }
            if ( // checkToken determines whether the function is
            // a declaration or an expression.
            FnExprTokens8031.indexOf(checkToken8296.value) >= 0) {
                // It is an expression.
                return scanPunctuator8075();
            }
            // It is a declaration.
            return scanRegExp8082();
        }
        return scanRegExp8082();
    }
    if (prevToken8295.type === "Keyword") {
        return scanRegExp8082();
    }
    return scanPunctuator8075();
}
function advance8085() {
    var ch8297;
    skipComment8069();
    if (index8040 >= length8047) {
        return {
            type: Token8029.EOF,
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [index8040, index8040]
        };
    }
    ch8297 = source8038.charCodeAt(index8040);
    if ( // Very common: ( and ) and ;
    ch8297 === 40 || ch8297 === 41 || ch8297 === 58) {
        return scanPunctuator8075();
    }
    if ( // String literal starts with single quote (#39) or double quote (#34).
    ch8297 === 39 || ch8297 === 34) {
        return scanStringLiteral8079();
    }
    if (ch8297 === 96) {
        return scanTemplate8080();
    }
    if (isIdentifierStart8063(ch8297)) {
        return scanIdentifier8074();
    }
    if ( // # and @ are allowed for sweet.js
    ch8297 === 35 || ch8297 === 64) {
        ++index8040;
        return {
            type: Token8029.Punctuator,
            value: String.fromCharCode(ch8297),
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [index8040 - 1, index8040]
        };
    }
    if ( // Dot (.) char #46 can also start a floating-point number, hence the need
    // to check the next character.
    ch8297 === 46) {
        if (isDecimalDigit8058(source8038.charCodeAt(index8040 + 1))) {
            return scanNumericLiteral8078();
        }
        return scanPunctuator8075();
    }
    if (isDecimalDigit8058(ch8297)) {
        return scanNumericLiteral8078();
    }
    if ( // Slash (/) char #47 can also start a regex.
    extra8055.tokenize && ch8297 === 47) {
        return advanceSlash8084();
    }
    return scanPunctuator8075();
}
function lex8086() {
    var token8298;
    token8298 = lookahead8051;
    streamIndex8050 = lookaheadIndex8052;
    lineNumber8041 = token8298.lineNumber;
    lineStart8042 = token8298.lineStart;
    sm_lineNumber8043 = lookahead8051.sm_lineNumber;
    sm_lineStart8044 = lookahead8051.sm_lineStart;
    sm_range8045 = lookahead8051.sm_range;
    sm_index8046 = lookahead8051.sm_range[0];
    lookahead8051 = tokenStream8049[++streamIndex8050].token;
    lookaheadIndex8052 = streamIndex8050;
    index8040 = lookahead8051.range[0];
    if (token8298.leadingComments) {
        extra8055.comments = extra8055.comments.concat(token8298.leadingComments);
        extra8055.trailingComments = extra8055.trailingComments.concat(token8298.leadingComments);
        extra8055.leadingComments = extra8055.leadingComments.concat(token8298.leadingComments);
    }
    return token8298;
}
function peek8087() {
    lookaheadIndex8052 = streamIndex8050 + 1;
    if (lookaheadIndex8052 >= length8047) {
        lookahead8051 = {
            type: Token8029.EOF,
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [index8040, index8040]
        };
        return;
    }
    lookahead8051 = tokenStream8049[lookaheadIndex8052].token;
    index8040 = lookahead8051.range[0];
}
function lookahead28088() {
    var adv8299, pos8300, line8301, start8302, result8303;
    if (streamIndex8050 + 1 >= length8047 || streamIndex8050 + 2 >= length8047) {
        return {
            type: Token8029.EOF,
            lineNumber: lineNumber8041,
            lineStart: lineStart8042,
            range: [index8040, index8040]
        };
    }
    if ( // Scan for the next immediate token.
    lookahead8051 === null) {
        lookaheadIndex8052 = streamIndex8050 + 1;
        lookahead8051 = tokenStream8049[lookaheadIndex8052].token;
        index8040 = lookahead8051.range[0];
    }
    result8303 = tokenStream8049[lookaheadIndex8052 + 1].token;
    return result8303;
}
function markerCreate8089() {
    var sm_index8304 = lookahead8051 ? lookahead8051.sm_range[0] : 0;
    var sm_lineStart8305 = lookahead8051 ? lookahead8051.sm_lineStart : 0;
    var sm_lineNumber8306 = lookahead8051 ? lookahead8051.sm_lineNumber : 1;
    if (!extra8055.loc && !extra8055.range) {
        return undefined;
    }
    return {
        offset: sm_index8304,
        line: sm_lineNumber8306,
        col: sm_index8304 - sm_lineStart8305
    };
}
function processComment8090(node8307) {
    var lastChild8308,
        trailingComments8309,
        bottomRight8310 = extra8055.bottomRightStack,
        last8311 = bottomRight8310[bottomRight8310.length - 1];
    if (node8307.type === Syntax8032.Program) {
        if (node8307.body.length > 0) {
            return;
        }
    }
    if (extra8055.trailingComments.length > 0) {
        if (extra8055.trailingComments[0].range[0] >= node8307.range[1]) {
            trailingComments8309 = extra8055.trailingComments;
            extra8055.trailingComments = [];
        } else {
            extra8055.trailingComments.length = 0;
        }
    } else {
        if (last8311 && last8311.trailingComments && last8311.trailingComments[0].range[0] >= node8307.range[1]) {
            trailingComments8309 = last8311.trailingComments;
            delete last8311.trailingComments;
        }
    }
    if ( // Eating the stack.
    last8311) {
        while (last8311 && last8311.range[0] >= node8307.range[0]) {
            lastChild8308 = last8311;
            last8311 = bottomRight8310.pop();
        }
    }
    if (lastChild8308) {
        if (lastChild8308.leadingComments && lastChild8308.leadingComments[lastChild8308.leadingComments.length - 1].range[1] <= node8307.range[0]) {
            node8307.leadingComments = lastChild8308.leadingComments;
            delete lastChild8308.leadingComments;
        }
    } else if (extra8055.leadingComments.length > 0 && extra8055.leadingComments[extra8055.leadingComments.length - 1].range[1] <= node8307.range[0]) {
        node8307.leadingComments = extra8055.leadingComments;
        extra8055.leadingComments = [];
    }
    if (trailingComments8309) {
        node8307.trailingComments = trailingComments8309;
    }
    bottomRight8310.push(node8307);
}
function markerApply8091(marker8312, node8313) {
    if (extra8055.range) {
        node8313.range = [marker8312.offset, sm_index8046];
    }
    if (extra8055.loc) {
        node8313.loc = {
            start: {
                line: marker8312.line,
                column: marker8312.col
            },
            end: {
                line: sm_lineNumber8043,
                column: sm_index8046 - sm_lineStart8044
            }
        };
        node8313 = delegate8048.postProcess(node8313);
    }
    if (extra8055.attachComment) {
        processComment8090(node8313);
    }
    return node8313;
}
SyntaxTreeDelegate8036 = {
    name: "SyntaxTree",
    postProcess: function postProcess(node8314) {
        return node8314;
    },
    createArrayExpression: function createArrayExpression(elements8315) {
        return {
            type: Syntax8032.ArrayExpression,
            elements: elements8315
        };
    },
    createAssignmentExpression: function createAssignmentExpression(operator8316, left8317, right8318) {
        return {
            type: Syntax8032.AssignmentExpression,
            operator: operator8316,
            left: left8317,
            right: right8318
        };
    },
    createBinaryExpression: function createBinaryExpression(operator8319, left8320, right8321) {
        var type8322 = operator8319 === "||" || operator8319 === "&&" ? Syntax8032.LogicalExpression : Syntax8032.BinaryExpression;
        return {
            type: type8322,
            operator: operator8319,
            left: left8320,
            right: right8321
        };
    },
    createBlockStatement: function createBlockStatement(body8323) {
        return {
            type: Syntax8032.BlockStatement,
            body: body8323
        };
    },
    createBreakStatement: function createBreakStatement(label8324) {
        return {
            type: Syntax8032.BreakStatement,
            label: label8324
        };
    },
    createCallExpression: function createCallExpression(callee8325, args8326) {
        return {
            type: Syntax8032.CallExpression,
            callee: callee8325,
            arguments: args8326
        };
    },
    createCatchClause: function createCatchClause(param8327, body8328) {
        return {
            type: Syntax8032.CatchClause,
            param: param8327,
            body: body8328
        };
    },
    createConditionalExpression: function createConditionalExpression(test8329, consequent8330, alternate8331) {
        return {
            type: Syntax8032.ConditionalExpression,
            test: test8329,
            consequent: consequent8330,
            alternate: alternate8331
        };
    },
    createContinueStatement: function createContinueStatement(label8332) {
        return {
            type: Syntax8032.ContinueStatement,
            label: label8332
        };
    },
    createDebuggerStatement: function createDebuggerStatement() {
        return { type: Syntax8032.DebuggerStatement };
    },
    createDoWhileStatement: function createDoWhileStatement(body8333, test8334) {
        return {
            type: Syntax8032.DoWhileStatement,
            body: body8333,
            test: test8334
        };
    },
    createEmptyStatement: function createEmptyStatement() {
        return { type: Syntax8032.EmptyStatement };
    },
    createExpressionStatement: function createExpressionStatement(expression8335) {
        return {
            type: Syntax8032.ExpressionStatement,
            expression: expression8335
        };
    },
    createForStatement: function createForStatement(init8336, test8337, update8338, body8339) {
        return {
            type: Syntax8032.ForStatement,
            init: init8336,
            test: test8337,
            update: update8338,
            body: body8339
        };
    },
    createForInStatement: function createForInStatement(left8340, right8341, body8342) {
        return {
            type: Syntax8032.ForInStatement,
            left: left8340,
            right: right8341,
            body: body8342,
            each: false
        };
    },
    createForOfStatement: function createForOfStatement(left8343, right8344, body8345) {
        return {
            type: Syntax8032.ForOfStatement,
            left: left8343,
            right: right8344,
            body: body8345
        };
    },
    createFunctionDeclaration: function createFunctionDeclaration(id8346, params8347, defaults8348, body8349, rest8350, generator8351, expression8352) {
        return {
            type: Syntax8032.FunctionDeclaration,
            id: id8346,
            params: params8347,
            defaults: defaults8348,
            body: body8349,
            rest: rest8350,
            generator: generator8351,
            expression: expression8352
        };
    },
    createFunctionExpression: function createFunctionExpression(id8353, params8354, defaults8355, body8356, rest8357, generator8358, expression8359) {
        return {
            type: Syntax8032.FunctionExpression,
            id: id8353,
            params: params8354,
            defaults: defaults8355,
            body: body8356,
            rest: rest8357,
            generator: generator8358,
            expression: expression8359
        };
    },
    createIdentifier: function createIdentifier(name8360) {
        return {
            type: Syntax8032.Identifier,
            name: name8360
        };
    },
    createIfStatement: function createIfStatement(test8361, consequent8362, alternate8363) {
        return {
            type: Syntax8032.IfStatement,
            test: test8361,
            consequent: consequent8362,
            alternate: alternate8363
        };
    },
    createLabeledStatement: function createLabeledStatement(label8364, body8365) {
        return {
            type: Syntax8032.LabeledStatement,
            label: label8364,
            body: body8365
        };
    },
    createLiteral: function createLiteral(token8366) {
        return {
            type: Syntax8032.Literal,
            value: token8366.value,
            raw: String(token8366.value)
        };
    },
    createMemberExpression: function createMemberExpression(accessor8367, object8368, property8369) {
        return {
            type: Syntax8032.MemberExpression,
            computed: accessor8367 === "[",
            object: object8368,
            property: property8369
        };
    },
    createNewExpression: function createNewExpression(callee8370, args8371) {
        return {
            type: Syntax8032.NewExpression,
            callee: callee8370,
            arguments: args8371
        };
    },
    createObjectExpression: function createObjectExpression(properties8372) {
        return {
            type: Syntax8032.ObjectExpression,
            properties: properties8372
        };
    },
    createPostfixExpression: function createPostfixExpression(operator8373, argument8374) {
        return {
            type: Syntax8032.UpdateExpression,
            operator: operator8373,
            argument: argument8374,
            prefix: false
        };
    },
    createProgram: function createProgram(body8375) {
        return {
            type: Syntax8032.Program,
            body: body8375
        };
    },
    createProperty: function createProperty(kind8376, key8377, value8378, method8379, shorthand8380, computed8381) {
        return {
            type: Syntax8032.Property,
            key: key8377,
            value: value8378,
            kind: kind8376,
            method: method8379,
            shorthand: shorthand8380,
            computed: computed8381
        };
    },
    createReturnStatement: function createReturnStatement(argument8382) {
        return {
            type: Syntax8032.ReturnStatement,
            argument: argument8382
        };
    },
    createSequenceExpression: function createSequenceExpression(expressions8383) {
        return {
            type: Syntax8032.SequenceExpression,
            expressions: expressions8383
        };
    },
    createSwitchCase: function createSwitchCase(test8384, consequent8385) {
        return {
            type: Syntax8032.SwitchCase,
            test: test8384,
            consequent: consequent8385
        };
    },
    createSwitchStatement: function createSwitchStatement(discriminant8386, cases8387) {
        return {
            type: Syntax8032.SwitchStatement,
            discriminant: discriminant8386,
            cases: cases8387
        };
    },
    createThisExpression: function createThisExpression() {
        return { type: Syntax8032.ThisExpression };
    },
    createThrowStatement: function createThrowStatement(argument8388) {
        return {
            type: Syntax8032.ThrowStatement,
            argument: argument8388
        };
    },
    createTryStatement: function createTryStatement(block8389, guardedHandlers8390, handlers8391, finalizer8392) {
        return {
            type: Syntax8032.TryStatement,
            block: block8389,
            guardedHandlers: guardedHandlers8390,
            handlers: handlers8391,
            finalizer: finalizer8392
        };
    },
    createUnaryExpression: function createUnaryExpression(operator8393, argument8394) {
        if (operator8393 === "++" || operator8393 === "--") {
            return {
                type: Syntax8032.UpdateExpression,
                operator: operator8393,
                argument: argument8394,
                prefix: true
            };
        }
        return {
            type: Syntax8032.UnaryExpression,
            operator: operator8393,
            argument: argument8394,
            prefix: true
        };
    },
    createVariableDeclaration: function createVariableDeclaration(declarations8395, kind8396) {
        return {
            type: Syntax8032.VariableDeclaration,
            declarations: declarations8395,
            kind: kind8396
        };
    },
    createVariableDeclarator: function createVariableDeclarator(id8397, init8398) {
        return {
            type: Syntax8032.VariableDeclarator,
            id: id8397,
            init: init8398
        };
    },
    createWhileStatement: function createWhileStatement(test8399, body8400) {
        return {
            type: Syntax8032.WhileStatement,
            test: test8399,
            body: body8400
        };
    },
    createWithStatement: function createWithStatement(object8401, body8402) {
        return {
            type: Syntax8032.WithStatement,
            object: object8401,
            body: body8402
        };
    },
    createTemplateElement: function createTemplateElement(value8403, tail8404) {
        return {
            type: Syntax8032.TemplateElement,
            value: value8403,
            tail: tail8404
        };
    },
    createTemplateLiteral: function createTemplateLiteral(quasis8405, expressions8406) {
        return {
            type: Syntax8032.TemplateLiteral,
            quasis: quasis8405,
            expressions: expressions8406
        };
    },
    createSpreadElement: function createSpreadElement(argument8407) {
        return {
            type: Syntax8032.SpreadElement,
            argument: argument8407
        };
    },
    createTaggedTemplateExpression: function createTaggedTemplateExpression(tag8408, quasi8409) {
        return {
            type: Syntax8032.TaggedTemplateExpression,
            tag: tag8408,
            quasi: quasi8409
        };
    },
    createArrowFunctionExpression: function createArrowFunctionExpression(params8410, defaults8411, body8412, rest8413, expression8414) {
        return {
            type: Syntax8032.ArrowFunctionExpression,
            id: null,
            params: params8410,
            defaults: defaults8411,
            body: body8412,
            rest: rest8413,
            generator: false,
            expression: expression8414
        };
    },
    createMethodDefinition: function createMethodDefinition(propertyType8415, kind8416, key8417, value8418) {
        return {
            type: Syntax8032.MethodDefinition,
            key: key8417,
            value: value8418,
            kind: kind8416,
            "static": propertyType8415 === ClassPropertyType8037["static"]
        };
    },
    createClassBody: function createClassBody(body8419) {
        return {
            type: Syntax8032.ClassBody,
            body: body8419
        };
    },
    createClassExpression: function createClassExpression(id8420, superClass8421, body8422) {
        return {
            type: Syntax8032.ClassExpression,
            id: id8420,
            superClass: superClass8421,
            body: body8422
        };
    },
    createClassDeclaration: function createClassDeclaration(id8423, superClass8424, body8425) {
        return {
            type: Syntax8032.ClassDeclaration,
            id: id8423,
            superClass: superClass8424,
            body: body8425
        };
    },
    createExportSpecifier: function createExportSpecifier(id8426, name8427) {
        return {
            type: Syntax8032.ExportSpecifier,
            id: id8426,
            name: name8427
        };
    },
    createExportBatchSpecifier: function createExportBatchSpecifier() {
        return { type: Syntax8032.ExportBatchSpecifier };
    },
    createExportDeclaration: function createExportDeclaration(declaration8428, specifiers8429, source8430) {
        return {
            type: Syntax8032.ExportDeclaration,
            declaration: declaration8428,
            specifiers: specifiers8429,
            source: source8430
        };
    },
    createImportSpecifier: function createImportSpecifier(id8431, name8432) {
        return {
            type: Syntax8032.ImportSpecifier,
            id: id8431,
            name: name8432
        };
    },
    createImportDeclaration: function createImportDeclaration(specifiers8433, kind8434, source8435) {
        return {
            type: Syntax8032.ImportDeclaration,
            specifiers: specifiers8433,
            kind: kind8434,
            source: source8435
        };
    },
    createYieldExpression: function createYieldExpression(argument8436, delegate8437) {
        return {
            type: Syntax8032.YieldExpression,
            argument: argument8436,
            delegate: delegate8437
        };
    },
    createModuleDeclaration: function createModuleDeclaration(id8438, source8439, body8440) {
        return {
            type: Syntax8032.ModuleDeclaration,
            id: id8438,
            source: source8439,
            body: body8440
        };
    },
    createComprehensionExpression: function createComprehensionExpression(filter8441, blocks8442, body8443) {
        return {
            type: Syntax8032.ComprehensionExpression,
            filter: filter8441,
            blocks: blocks8442,
            body: body8443
        };
    }
};
function peekLineTerminator8092() {
    return lookahead8051.lineNumber !== lineNumber8041;
}
function throwError8093(token8444, messageFormat8445) {
    var error8446,
        args8447 = Array.prototype.slice.call(arguments, 2),
        msg8448 = messageFormat8445.replace(/%(\d)/g, function (whole8452, index8453) {
        assert8056(index8453 < args8447.length, "Message reference must be in range");
        return args8447[index8453];
    });
    var startIndex8449 = streamIndex8050 > 3 ? streamIndex8050 - 3 : 0;
    var toks8450 = "",
        tailingMsg8451 = "";
    if (tokenStream8049) {
        toks8450 = tokenStream8049.slice(startIndex8449, streamIndex8050 + 3).map(function (stx8454) {
            return stx8454.token.value;
        }).join(" ");
        tailingMsg8451 = "\n[... " + toks8450 + " ...]";
    }
    if (typeof token8444.lineNumber === "number") {
        error8446 = new Error("Line " + token8444.lineNumber + ": " + msg8448 + tailingMsg8451);
        error8446.index = token8444.range[0];
        error8446.lineNumber = token8444.lineNumber;
        error8446.column = token8444.range[0] - lineStart8042 + 1;
    } else {
        error8446 = new Error("Line " + lineNumber8041 + ": " + msg8448 + tailingMsg8451);
        error8446.index = index8040;
        error8446.lineNumber = lineNumber8041;
        error8446.column = index8040 - lineStart8042 + 1;
    }
    error8446.description = msg8448;
    throw error8446;
}
function throwErrorTolerant8094() {
    try {
        throwError8093.apply(null, arguments);
    } catch (e8455) {
        if (extra8055.errors) {
            extra8055.errors.push(e8455);
        } else {
            throw e8455;
        }
    }
}
function throwUnexpected8095(token8456) {
    if (token8456.type === Token8029.EOF) {
        throwError8093(token8456, Messages8034.UnexpectedEOS);
    }
    if (token8456.type === Token8029.NumericLiteral) {
        throwError8093(token8456, Messages8034.UnexpectedNumber);
    }
    if (token8456.type === Token8029.StringLiteral) {
        throwError8093(token8456, Messages8034.UnexpectedString);
    }
    if (token8456.type === Token8029.Identifier) {
        throwError8093(token8456, Messages8034.UnexpectedIdentifier);
    }
    if (token8456.type === Token8029.Keyword) {
        if (isFutureReservedWord8065(token8456.value)) {} else if (strict8039 && isStrictModeReservedWord8066(token8456.value)) {
            throwErrorTolerant8094(token8456, Messages8034.StrictReservedWord);
            return;
        }
        throwError8093(token8456, Messages8034.UnexpectedToken, token8456.value);
    }
    if (token8456.type === Token8029.Template) {
        throwError8093(token8456, Messages8034.UnexpectedTemplate, token8456.value.raw);
    }
    // BooleanLiteral, NullLiteral, or Punctuator.
    throwError8093(token8456, Messages8034.UnexpectedToken, token8456.value);
}
function expect8096(value8457) {
    var token8458 = lex8086();
    if (token8458.type !== Token8029.Punctuator || token8458.value !== value8457) {
        throwUnexpected8095(token8458);
    }
}
function expectKeyword8097(keyword8459) {
    var token8460 = lex8086();
    if (token8460.type !== Token8029.Keyword || token8460.value !== keyword8459) {
        throwUnexpected8095(token8460);
    }
}
function match8098(value8461) {
    return lookahead8051.type === Token8029.Punctuator && lookahead8051.value === value8461;
}
function matchKeyword8099(keyword8462) {
    return lookahead8051.type === Token8029.Keyword && lookahead8051.value === keyword8462;
}
function matchContextualKeyword8100(keyword8463) {
    return lookahead8051.type === Token8029.Identifier && lookahead8051.value === keyword8463;
}
function matchAssign8101() {
    var op8464;
    if (lookahead8051.type !== Token8029.Punctuator) {
        return false;
    }
    op8464 = lookahead8051.value;
    return op8464 === "=" || op8464 === "*=" || op8464 === "/=" || op8464 === "%=" || op8464 === "+=" || op8464 === "-=" || op8464 === "<<=" || op8464 === ">>=" || op8464 === ">>>=" || op8464 === "&=" || op8464 === "^=" || op8464 === "|=";
}
function consumeSemicolon8102() {
    var line8465, ch8466;
    ch8466 = lookahead8051.value ? String(lookahead8051.value).charCodeAt(0) : -1;
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    ch8466 === 59) {
        lex8086();
        return;
    }
    if (lookahead8051.lineNumber !== lineNumber8041) {
        return;
    }
    if (match8098(";")) {
        lex8086();
        return;
    }
    if (lookahead8051.type !== Token8029.EOF && !match8098("}")) {
        throwUnexpected8095(lookahead8051);
    }
}
function isLeftHandSide8103(expr8467) {
    return expr8467.type === Syntax8032.Identifier || expr8467.type === Syntax8032.MemberExpression;
}
function isAssignableLeftHandSide8104(expr8468) {
    return isLeftHandSide8103(expr8468) || expr8468.type === Syntax8032.ObjectPattern || expr8468.type === Syntax8032.ArrayPattern;
}
function parseArrayInitialiser8105() {
    var elements8469 = [],
        blocks8470 = [],
        filter8471 = null,
        tmp8472,
        possiblecomprehension8473 = true,
        body8474,
        marker8475 = markerCreate8089();
    expect8096("[");
    while (!match8098("]")) {
        if (lookahead8051.value === "for" && lookahead8051.type === Token8029.Keyword) {
            if (!possiblecomprehension8473) {
                throwError8093({}, Messages8034.ComprehensionError);
            }
            matchKeyword8099("for");
            tmp8472 = parseForStatement8153({ ignoreBody: true });
            tmp8472.of = tmp8472.type === Syntax8032.ForOfStatement;
            tmp8472.type = Syntax8032.ComprehensionBlock;
            if (tmp8472.left.kind) {
                // can't be let or const
                throwError8093({}, Messages8034.ComprehensionError);
            }
            blocks8470.push(tmp8472);
        } else if (lookahead8051.value === "if" && lookahead8051.type === Token8029.Keyword) {
            if (!possiblecomprehension8473) {
                throwError8093({}, Messages8034.ComprehensionError);
            }
            expectKeyword8097("if");
            expect8096("(");
            filter8471 = parseExpression8133();
            expect8096(")");
        } else if (lookahead8051.value === "," && lookahead8051.type === Token8029.Punctuator) {
            possiblecomprehension8473 = false;
            // no longer allowed.
            lex8086();
            elements8469.push(null);
        } else {
            tmp8472 = parseSpreadOrAssignmentExpression8116();
            elements8469.push(tmp8472);
            if (tmp8472 && tmp8472.type === Syntax8032.SpreadElement) {
                if (!match8098("]")) {
                    throwError8093({}, Messages8034.ElementAfterSpreadElement);
                }
            } else if (!(match8098("]") || matchKeyword8099("for") || matchKeyword8099("if"))) {
                expect8096(",");
                // this lexes.
                possiblecomprehension8473 = false;
            }
        }
    }
    expect8096("]");
    if (filter8471 && !blocks8470.length) {
        throwError8093({}, Messages8034.ComprehensionRequiresBlock);
    }
    if (blocks8470.length) {
        if (elements8469.length !== 1) {
            throwError8093({}, Messages8034.ComprehensionError);
        }
        return markerApply8091(marker8475, delegate8048.createComprehensionExpression(filter8471, blocks8470, elements8469[0]));
    }
    return markerApply8091(marker8475, delegate8048.createArrayExpression(elements8469));
}
function parsePropertyFunction8106(options8476) {
    var previousStrict8477,
        previousYieldAllowed8478,
        params8479,
        defaults8480,
        body8481,
        marker8482 = markerCreate8089();
    previousStrict8477 = strict8039;
    previousYieldAllowed8478 = state8053.yieldAllowed;
    state8053.yieldAllowed = options8476.generator;
    params8479 = options8476.params || [];
    defaults8480 = options8476.defaults || [];
    body8481 = parseConciseBody8165();
    if (options8476.name && strict8039 && isRestrictedWord8067(params8479[0].name)) {
        throwErrorTolerant8094(options8476.name, Messages8034.StrictParamName);
    }
    strict8039 = previousStrict8477;
    state8053.yieldAllowed = previousYieldAllowed8478;
    return markerApply8091(marker8482, delegate8048.createFunctionExpression(null, params8479, defaults8480, body8481, options8476.rest || null, options8476.generator, body8481.type !== Syntax8032.BlockStatement));
}
function parsePropertyMethodFunction8107(options8483) {
    var previousStrict8484, tmp8485, method8486;
    previousStrict8484 = strict8039;
    strict8039 = true;
    tmp8485 = parseParams8169();
    if (tmp8485.stricted) {
        throwErrorTolerant8094(tmp8485.stricted, tmp8485.message);
    }
    method8486 = parsePropertyFunction8106({
        params: tmp8485.params,
        defaults: tmp8485.defaults,
        rest: tmp8485.rest,
        generator: options8483.generator
    });
    strict8039 = previousStrict8484;
    return method8486;
}
function parseObjectPropertyKey8108() {
    var marker8487 = markerCreate8089(),
        token8488 = lex8086(),
        propertyKey8489,
        result8490;
    if ( // Note: This function is called only from parseObjectProperty(), where
    // EOF and Punctuator tokens are already filtered out.
    token8488.type === Token8029.StringLiteral || token8488.type === Token8029.NumericLiteral) {
        if (strict8039 && token8488.octal) {
            throwErrorTolerant8094(token8488, Messages8034.StrictOctalLiteral);
        }
        return markerApply8091(marker8487, delegate8048.createLiteral(token8488));
    }
    if (token8488.type === Token8029.Punctuator && token8488.value === "[") {
        // For computed properties we should skip the [ and ], and
        // capture in marker only the assignment expression itself.
        marker8487 = markerCreate8089();
        propertyKey8489 = parseAssignmentExpression8132();
        result8490 = markerApply8091(marker8487, propertyKey8489);
        expect8096("]");
        return result8490;
    }
    return markerApply8091(marker8487, delegate8048.createIdentifier(token8488.value));
}
function parseObjectProperty8109() {
    var token8491,
        key8492,
        id8493,
        value8494,
        param8495,
        expr8496,
        computed8497,
        marker8498 = markerCreate8089();
    token8491 = lookahead8051;
    computed8497 = token8491.value === "[" && token8491.type === Token8029.Punctuator;
    if (token8491.type === Token8029.Identifier || computed8497) {
        id8493 = parseObjectPropertyKey8108();
        if ( // Property Assignment: Getter and Setter.
        token8491.value === "get" && !(match8098(":") || match8098("("))) {
            computed8497 = lookahead8051.value === "[";
            key8492 = parseObjectPropertyKey8108();
            expect8096("(");
            expect8096(")");
            return markerApply8091(marker8498, delegate8048.createProperty("get", key8492, parsePropertyFunction8106({ generator: false }), false, false, computed8497));
        }
        if (token8491.value === "set" && !(match8098(":") || match8098("("))) {
            computed8497 = lookahead8051.value === "[";
            key8492 = parseObjectPropertyKey8108();
            expect8096("(");
            token8491 = lookahead8051;
            param8495 = [parseVariableIdentifier8136()];
            expect8096(")");
            return markerApply8091(marker8498, delegate8048.createProperty("set", key8492, parsePropertyFunction8106({
                params: param8495,
                generator: false,
                name: token8491
            }), false, false, computed8497));
        }
        if (match8098(":")) {
            lex8086();
            return markerApply8091(marker8498, delegate8048.createProperty("init", id8493, parseAssignmentExpression8132(), false, false, computed8497));
        }
        if (match8098("(")) {
            return markerApply8091(marker8498, delegate8048.createProperty("init", id8493, parsePropertyMethodFunction8107({ generator: false }), true, false, computed8497));
        }
        if (computed8497) {
            // Computed properties can only be used with full notation.
            throwUnexpected8095(lookahead8051);
        }
        return markerApply8091(marker8498, delegate8048.createProperty("init", id8493, id8493, false, true, false));
    }
    if (token8491.type === Token8029.EOF || token8491.type === Token8029.Punctuator) {
        if (!match8098("*")) {
            throwUnexpected8095(token8491);
        }
        lex8086();
        computed8497 = lookahead8051.type === Token8029.Punctuator && lookahead8051.value === "[";
        id8493 = parseObjectPropertyKey8108();
        if (!match8098("(")) {
            throwUnexpected8095(lex8086());
        }
        return markerApply8091(marker8498, delegate8048.createProperty("init", id8493, parsePropertyMethodFunction8107({ generator: true }), true, false, computed8497));
    }
    key8492 = parseObjectPropertyKey8108();
    if (match8098(":")) {
        lex8086();
        return markerApply8091(marker8498, delegate8048.createProperty("init", key8492, parseAssignmentExpression8132(), false, false, false));
    }
    if (match8098("(")) {
        return markerApply8091(marker8498, delegate8048.createProperty("init", key8492, parsePropertyMethodFunction8107({ generator: false }), true, false, false));
    }
    throwUnexpected8095(lex8086());
}
function parseObjectInitialiser8110() {
    var properties8499 = [],
        property8500,
        name8501,
        key8502,
        kind8503,
        map8504 = {},
        toString8505 = String,
        marker8506 = markerCreate8089();
    expect8096("{");
    while (!match8098("}")) {
        property8500 = parseObjectProperty8109();
        if (property8500.key.type === Syntax8032.Identifier) {
            name8501 = property8500.key.name;
        } else {
            name8501 = toString8505(property8500.key.value);
        }
        kind8503 = property8500.kind === "init" ? PropertyKind8033.Data : property8500.kind === "get" ? PropertyKind8033.Get : PropertyKind8033.Set;
        key8502 = "$" + name8501;
        if (Object.prototype.hasOwnProperty.call(map8504, key8502)) {
            if (map8504[key8502] === PropertyKind8033.Data) {
                if (strict8039 && kind8503 === PropertyKind8033.Data) {
                    throwErrorTolerant8094({}, Messages8034.StrictDuplicateProperty);
                } else if (kind8503 !== PropertyKind8033.Data) {
                    throwErrorTolerant8094({}, Messages8034.AccessorDataProperty);
                }
            } else {
                if (kind8503 === PropertyKind8033.Data) {
                    throwErrorTolerant8094({}, Messages8034.AccessorDataProperty);
                } else if (map8504[key8502] & kind8503) {
                    throwErrorTolerant8094({}, Messages8034.AccessorGetSet);
                }
            }
            map8504[key8502] |= kind8503;
        } else {
            map8504[key8502] = kind8503;
        }
        properties8499.push(property8500);
        if (!match8098("}")) {
            expect8096(",");
        }
    }
    expect8096("}");
    return markerApply8091(marker8506, delegate8048.createObjectExpression(properties8499));
}
function parseTemplateElement8111(option8507) {
    var marker8508 = markerCreate8089(),
        token8509 = lex8086();
    if (strict8039 && token8509.octal) {
        throwError8093(token8509, Messages8034.StrictOctalLiteral);
    }
    return markerApply8091(marker8508, delegate8048.createTemplateElement({
        raw: token8509.value.raw,
        cooked: token8509.value.cooked
    }, token8509.tail));
}
function parseTemplateLiteral8112() {
    var quasi8510,
        quasis8511,
        expressions8512,
        marker8513 = markerCreate8089();
    quasi8510 = parseTemplateElement8111({ head: true });
    quasis8511 = [quasi8510];
    expressions8512 = [];
    while (!quasi8510.tail) {
        expressions8512.push(parseExpression8133());
        quasi8510 = parseTemplateElement8111({ head: false });
        quasis8511.push(quasi8510);
    }
    return markerApply8091(marker8513, delegate8048.createTemplateLiteral(quasis8511, expressions8512));
}
function parseGroupExpression8113() {
    var expr8514;
    expect8096("(");
    ++state8053.parenthesizedCount;
    expr8514 = parseExpression8133();
    expect8096(")");
    return expr8514;
}
function parsePrimaryExpression8114() {
    var type8515, token8516, resolvedIdent8517, marker8518, expr8519;
    token8516 = lookahead8051;
    type8515 = lookahead8051.type;
    if (type8515 === Token8029.Identifier) {
        marker8518 = markerCreate8089();
        resolvedIdent8517 = expander8028.resolve(tokenStream8049[lookaheadIndex8052], phase8054);
        lex8086();
        return markerApply8091(marker8518, delegate8048.createIdentifier(resolvedIdent8517));
    }
    if (type8515 === Token8029.StringLiteral || type8515 === Token8029.NumericLiteral) {
        if (strict8039 && lookahead8051.octal) {
            throwErrorTolerant8094(lookahead8051, Messages8034.StrictOctalLiteral);
        }
        marker8518 = markerCreate8089();
        return markerApply8091(marker8518, delegate8048.createLiteral(lex8086()));
    }
    if (type8515 === Token8029.Keyword) {
        if (matchKeyword8099("this")) {
            marker8518 = markerCreate8089();
            lex8086();
            return markerApply8091(marker8518, delegate8048.createThisExpression());
        }
        if (matchKeyword8099("function")) {
            return parseFunctionExpression8171();
        }
        if (matchKeyword8099("class")) {
            return parseClassExpression8176();
        }
        if (matchKeyword8099("super")) {
            marker8518 = markerCreate8089();
            lex8086();
            return markerApply8091(marker8518, delegate8048.createIdentifier("super"));
        }
    }
    if (type8515 === Token8029.BooleanLiteral) {
        marker8518 = markerCreate8089();
        token8516 = lex8086();
        if (typeof token8516.value !== "boolean") {
            assert8056(token8516.value === "true" || token8516.value === "false", "exporting either true or false as a string not: " + token8516.value);
            token8516.value = token8516.value === "true";
        }
        return markerApply8091(marker8518, delegate8048.createLiteral(token8516));
    }
    if (type8515 === Token8029.NullLiteral) {
        marker8518 = markerCreate8089();
        token8516 = lex8086();
        token8516.value = null;
        return markerApply8091(marker8518, delegate8048.createLiteral(token8516));
    }
    if (match8098("[")) {
        return parseArrayInitialiser8105();
    }
    if (match8098("{")) {
        return parseObjectInitialiser8110();
    }
    if (match8098("(")) {
        return parseGroupExpression8113();
    }
    if (lookahead8051.type === Token8029.RegularExpression) {
        marker8518 = markerCreate8089();
        return markerApply8091(marker8518, delegate8048.createLiteral(lex8086()));
    }
    if (type8515 === Token8029.Template) {
        return parseTemplateLiteral8112();
    }
    throwUnexpected8095(lex8086());
}
function parseArguments8115() {
    var args8520 = [],
        arg8521;
    expect8096("(");
    if (!match8098(")")) {
        while (streamIndex8050 < length8047) {
            arg8521 = parseSpreadOrAssignmentExpression8116();
            args8520.push(arg8521);
            if (match8098(")")) {
                break;
            } else if (arg8521.type === Syntax8032.SpreadElement) {
                throwError8093({}, Messages8034.ElementAfterSpreadElement);
            }
            expect8096(",");
        }
    }
    expect8096(")");
    return args8520;
}
function parseSpreadOrAssignmentExpression8116() {
    if (match8098("...")) {
        var marker8522 = markerCreate8089();
        lex8086();
        return markerApply8091(marker8522, delegate8048.createSpreadElement(parseAssignmentExpression8132()));
    }
    return parseAssignmentExpression8132();
}
function parseNonComputedProperty8117(toResolve8523) {
    var marker8524 = markerCreate8089(),
        resolvedIdent8525,
        token8526;
    if (toResolve8523) {
        resolvedIdent8525 = expander8028.resolve(tokenStream8049[lookaheadIndex8052], phase8054);
    }
    token8526 = lex8086();
    resolvedIdent8525 = toResolve8523 ? resolvedIdent8525 : token8526.value;
    if (!isIdentifierName8083(token8526)) {
        throwUnexpected8095(token8526);
    }
    return markerApply8091(marker8524, delegate8048.createIdentifier(resolvedIdent8525));
}
function parseNonComputedMember8118() {
    expect8096(".");
    return parseNonComputedProperty8117();
}
function parseComputedMember8119() {
    var expr8527;
    expect8096("[");
    expr8527 = parseExpression8133();
    expect8096("]");
    return expr8527;
}
function parseNewExpression8120() {
    var callee8528,
        args8529,
        marker8530 = markerCreate8089();
    expectKeyword8097("new");
    callee8528 = parseLeftHandSideExpression8122();
    args8529 = match8098("(") ? parseArguments8115() : [];
    return markerApply8091(marker8530, delegate8048.createNewExpression(callee8528, args8529));
}
function parseLeftHandSideExpressionAllowCall8121() {
    var expr8531,
        args8532,
        marker8533 = markerCreate8089();
    expr8531 = matchKeyword8099("new") ? parseNewExpression8120() : parsePrimaryExpression8114();
    while (match8098(".") || match8098("[") || match8098("(") || lookahead8051.type === Token8029.Template) {
        if (match8098("(")) {
            args8532 = parseArguments8115();
            expr8531 = markerApply8091(marker8533, delegate8048.createCallExpression(expr8531, args8532));
        } else if (match8098("[")) {
            expr8531 = markerApply8091(marker8533, delegate8048.createMemberExpression("[", expr8531, parseComputedMember8119()));
        } else if (match8098(".")) {
            expr8531 = markerApply8091(marker8533, delegate8048.createMemberExpression(".", expr8531, parseNonComputedMember8118()));
        } else {
            expr8531 = markerApply8091(marker8533, delegate8048.createTaggedTemplateExpression(expr8531, parseTemplateLiteral8112()));
        }
    }
    return expr8531;
}
function parseLeftHandSideExpression8122() {
    var expr8534,
        marker8535 = markerCreate8089();
    expr8534 = matchKeyword8099("new") ? parseNewExpression8120() : parsePrimaryExpression8114();
    while (match8098(".") || match8098("[") || lookahead8051.type === Token8029.Template) {
        if (match8098("[")) {
            expr8534 = markerApply8091(marker8535, delegate8048.createMemberExpression("[", expr8534, parseComputedMember8119()));
        } else if (match8098(".")) {
            expr8534 = markerApply8091(marker8535, delegate8048.createMemberExpression(".", expr8534, parseNonComputedMember8118()));
        } else {
            expr8534 = markerApply8091(marker8535, delegate8048.createTaggedTemplateExpression(expr8534, parseTemplateLiteral8112()));
        }
    }
    return expr8534;
}
function parsePostfixExpression8123() {
    var marker8536 = markerCreate8089(),
        expr8537 = parseLeftHandSideExpressionAllowCall8121(),
        token8538;
    if (lookahead8051.type !== Token8029.Punctuator) {
        return expr8537;
    }
    if ((match8098("++") || match8098("--")) && !peekLineTerminator8092()) {
        if ( // 11.3.1, 11.3.2
        strict8039 && expr8537.type === Syntax8032.Identifier && isRestrictedWord8067(expr8537.name)) {
            throwErrorTolerant8094({}, Messages8034.StrictLHSPostfix);
        }
        if (!isLeftHandSide8103(expr8537)) {
            throwError8093({}, Messages8034.InvalidLHSInAssignment);
        }
        token8538 = lex8086();
        expr8537 = markerApply8091(marker8536, delegate8048.createPostfixExpression(token8538.value, expr8537));
    }
    return expr8537;
}
function parseUnaryExpression8124() {
    var marker8539, token8540, expr8541;
    if (lookahead8051.type !== Token8029.Punctuator && lookahead8051.type !== Token8029.Keyword) {
        return parsePostfixExpression8123();
    }
    if (match8098("++") || match8098("--")) {
        marker8539 = markerCreate8089();
        token8540 = lex8086();
        expr8541 = parseUnaryExpression8124();
        if ( // 11.4.4, 11.4.5
        strict8039 && expr8541.type === Syntax8032.Identifier && isRestrictedWord8067(expr8541.name)) {
            throwErrorTolerant8094({}, Messages8034.StrictLHSPrefix);
        }
        if (!isLeftHandSide8103(expr8541)) {
            throwError8093({}, Messages8034.InvalidLHSInAssignment);
        }
        return markerApply8091(marker8539, delegate8048.createUnaryExpression(token8540.value, expr8541));
    }
    if (match8098("+") || match8098("-") || match8098("~") || match8098("!")) {
        marker8539 = markerCreate8089();
        token8540 = lex8086();
        expr8541 = parseUnaryExpression8124();
        return markerApply8091(marker8539, delegate8048.createUnaryExpression(token8540.value, expr8541));
    }
    if (matchKeyword8099("delete") || matchKeyword8099("void") || matchKeyword8099("typeof")) {
        marker8539 = markerCreate8089();
        token8540 = lex8086();
        expr8541 = parseUnaryExpression8124();
        expr8541 = markerApply8091(marker8539, delegate8048.createUnaryExpression(token8540.value, expr8541));
        if (strict8039 && expr8541.operator === "delete" && expr8541.argument.type === Syntax8032.Identifier) {
            throwErrorTolerant8094({}, Messages8034.StrictDelete);
        }
        return expr8541;
    }
    return parsePostfixExpression8123();
}
function binaryPrecedence8125(token8542, allowIn8543) {
    var prec8544 = 0;
    if (token8542.type !== Token8029.Punctuator && token8542.type !== Token8029.Keyword) {
        return 0;
    }
    switch (token8542.value) {
        case "||":
            prec8544 = 1;
            break;
        case "&&":
            prec8544 = 2;
            break;
        case "|":
            prec8544 = 3;
            break;
        case "^":
            prec8544 = 4;
            break;
        case "&":
            prec8544 = 5;
            break;
        case "==":
        case "!=":
        case "===":
        case "!==":
            prec8544 = 6;
            break;
        case "<":
        case ">":
        case "<=":
        case ">=":
        case "instanceof":
            prec8544 = 7;
            break;
        case "in":
            prec8544 = allowIn8543 ? 7 : 0;
            break;
        case "<<":
        case ">>":
        case ">>>":
            prec8544 = 8;
            break;
        case "+":
        case "-":
            prec8544 = 9;
            break;
        case "*":
        case "/":
        case "%":
            prec8544 = 11;
            break;
        default:
            break;
    }
    return prec8544;
}
function parseBinaryExpression8126() {
    var expr8545, token8546, prec8547, previousAllowIn8548, stack8549, right8550, operator8551, left8552, i8553, marker8554, markers8555;
    previousAllowIn8548 = state8053.allowIn;
    state8053.allowIn = true;
    marker8554 = markerCreate8089();
    left8552 = parseUnaryExpression8124();
    token8546 = lookahead8051;
    prec8547 = binaryPrecedence8125(token8546, previousAllowIn8548);
    if (prec8547 === 0) {
        return left8552;
    }
    token8546.prec = prec8547;
    lex8086();
    markers8555 = [marker8554, markerCreate8089()];
    right8550 = parseUnaryExpression8124();
    stack8549 = [left8552, token8546, right8550];
    while ((prec8547 = binaryPrecedence8125(lookahead8051, previousAllowIn8548)) > 0) {
        while ( // Reduce: make a binary expression from the three topmost entries.
        stack8549.length > 2 && prec8547 <= stack8549[stack8549.length - 2].prec) {
            right8550 = stack8549.pop();
            operator8551 = stack8549.pop().value;
            left8552 = stack8549.pop();
            expr8545 = delegate8048.createBinaryExpression(operator8551, left8552, right8550);
            markers8555.pop();
            marker8554 = markers8555.pop();
            markerApply8091(marker8554, expr8545);
            stack8549.push(expr8545);
            markers8555.push(marker8554);
        }
        // Shift.
        token8546 = lex8086();
        token8546.prec = prec8547;
        stack8549.push(token8546);
        markers8555.push(markerCreate8089());
        expr8545 = parseUnaryExpression8124();
        stack8549.push(expr8545);
    }
    state8053.allowIn = previousAllowIn8548;
    // Final reduce to clean-up the stack.
    i8553 = stack8549.length - 1;
    expr8545 = stack8549[i8553];
    markers8555.pop();
    while (i8553 > 1) {
        expr8545 = delegate8048.createBinaryExpression(stack8549[i8553 - 1].value, stack8549[i8553 - 2], expr8545);
        i8553 -= 2;
        marker8554 = markers8555.pop();
        markerApply8091(marker8554, expr8545);
    }
    return expr8545;
}
function parseConditionalExpression8127() {
    var expr8556,
        previousAllowIn8557,
        consequent8558,
        alternate8559,
        marker8560 = markerCreate8089();
    expr8556 = parseBinaryExpression8126();
    if (match8098("?")) {
        lex8086();
        previousAllowIn8557 = state8053.allowIn;
        state8053.allowIn = true;
        consequent8558 = parseAssignmentExpression8132();
        state8053.allowIn = previousAllowIn8557;
        expect8096(":");
        alternate8559 = parseAssignmentExpression8132();
        expr8556 = markerApply8091(marker8560, delegate8048.createConditionalExpression(expr8556, consequent8558, alternate8559));
    }
    return expr8556;
}
function reinterpretAsAssignmentBindingPattern8128(expr8561) {
    var i8562, len8563, property8564, element8565;
    if (expr8561.type === Syntax8032.ObjectExpression) {
        expr8561.type = Syntax8032.ObjectPattern;
        for (i8562 = 0, len8563 = expr8561.properties.length; i8562 < len8563; i8562 += 1) {
            property8564 = expr8561.properties[i8562];
            if (property8564.kind !== "init") {
                throwError8093({}, Messages8034.InvalidLHSInAssignment);
            }
            reinterpretAsAssignmentBindingPattern8128(property8564.value);
        }
    } else if (expr8561.type === Syntax8032.ArrayExpression) {
        expr8561.type = Syntax8032.ArrayPattern;
        for (i8562 = 0, len8563 = expr8561.elements.length; i8562 < len8563; i8562 += 1) {
            element8565 = expr8561.elements[i8562];
            if (element8565) {
                reinterpretAsAssignmentBindingPattern8128(element8565);
            }
        }
    } else if (expr8561.type === Syntax8032.Identifier) {
        if (isRestrictedWord8067(expr8561.name)) {
            throwError8093({}, Messages8034.InvalidLHSInAssignment);
        }
    } else if (expr8561.type === Syntax8032.SpreadElement) {
        reinterpretAsAssignmentBindingPattern8128(expr8561.argument);
        if (expr8561.argument.type === Syntax8032.ObjectPattern) {
            throwError8093({}, Messages8034.ObjectPatternAsSpread);
        }
    } else {
        if (expr8561.type !== Syntax8032.MemberExpression && expr8561.type !== Syntax8032.CallExpression && expr8561.type !== Syntax8032.NewExpression) {
            throwError8093({}, Messages8034.InvalidLHSInAssignment);
        }
    }
}
function reinterpretAsDestructuredParameter8129(options8566, expr8567) {
    var i8568, len8569, property8570, element8571;
    if (expr8567.type === Syntax8032.ObjectExpression) {
        expr8567.type = Syntax8032.ObjectPattern;
        for (i8568 = 0, len8569 = expr8567.properties.length; i8568 < len8569; i8568 += 1) {
            property8570 = expr8567.properties[i8568];
            if (property8570.kind !== "init") {
                throwError8093({}, Messages8034.InvalidLHSInFormalsList);
            }
            reinterpretAsDestructuredParameter8129(options8566, property8570.value);
        }
    } else if (expr8567.type === Syntax8032.ArrayExpression) {
        expr8567.type = Syntax8032.ArrayPattern;
        for (i8568 = 0, len8569 = expr8567.elements.length; i8568 < len8569; i8568 += 1) {
            element8571 = expr8567.elements[i8568];
            if (element8571) {
                reinterpretAsDestructuredParameter8129(options8566, element8571);
            }
        }
    } else if (expr8567.type === Syntax8032.Identifier) {
        validateParam8167(options8566, expr8567, expr8567.name);
    } else {
        if (expr8567.type !== Syntax8032.MemberExpression) {
            throwError8093({}, Messages8034.InvalidLHSInFormalsList);
        }
    }
}
function reinterpretAsCoverFormalsList8130(expressions8572) {
    var i8573, len8574, param8575, params8576, defaults8577, defaultCount8578, options8579, rest8580;
    params8576 = [];
    defaults8577 = [];
    defaultCount8578 = 0;
    rest8580 = null;
    options8579 = { paramSet: {} };
    for (i8573 = 0, len8574 = expressions8572.length; i8573 < len8574; i8573 += 1) {
        param8575 = expressions8572[i8573];
        if (param8575.type === Syntax8032.Identifier) {
            params8576.push(param8575);
            defaults8577.push(null);
            validateParam8167(options8579, param8575, param8575.name);
        } else if (param8575.type === Syntax8032.ObjectExpression || param8575.type === Syntax8032.ArrayExpression) {
            reinterpretAsDestructuredParameter8129(options8579, param8575);
            params8576.push(param8575);
            defaults8577.push(null);
        } else if (param8575.type === Syntax8032.SpreadElement) {
            assert8056(i8573 === len8574 - 1, "It is guaranteed that SpreadElement is last element by parseExpression");
            reinterpretAsDestructuredParameter8129(options8579, param8575.argument);
            rest8580 = param8575.argument;
        } else if (param8575.type === Syntax8032.AssignmentExpression) {
            params8576.push(param8575.left);
            defaults8577.push(param8575.right);
            ++defaultCount8578;
            validateParam8167(options8579, param8575.left, param8575.left.name);
        } else {
            return null;
        }
    }
    if (options8579.message === Messages8034.StrictParamDupe) {
        throwError8093(strict8039 ? options8579.stricted : options8579.firstRestricted, options8579.message);
    }
    if (defaultCount8578 === 0) {
        defaults8577 = [];
    }
    return {
        params: params8576,
        defaults: defaults8577,
        rest: rest8580,
        stricted: options8579.stricted,
        firstRestricted: options8579.firstRestricted,
        message: options8579.message
    };
}
function parseArrowFunctionExpression8131(options8581, marker8582) {
    var previousStrict8583, previousYieldAllowed8584, body8585;
    expect8096("=>");
    previousStrict8583 = strict8039;
    previousYieldAllowed8584 = state8053.yieldAllowed;
    state8053.yieldAllowed = false;
    body8585 = parseConciseBody8165();
    if (strict8039 && options8581.firstRestricted) {
        throwError8093(options8581.firstRestricted, options8581.message);
    }
    if (strict8039 && options8581.stricted) {
        throwErrorTolerant8094(options8581.stricted, options8581.message);
    }
    strict8039 = previousStrict8583;
    state8053.yieldAllowed = previousYieldAllowed8584;
    return markerApply8091(marker8582, delegate8048.createArrowFunctionExpression(options8581.params, options8581.defaults, body8585, options8581.rest, body8585.type !== Syntax8032.BlockStatement));
}
function parseAssignmentExpression8132() {
    var marker8586, expr8587, token8588, params8589, oldParenthesizedCount8590;
    if ( // Note that 'yield' is treated as a keyword in strict mode, but a
    // contextual keyword (identifier) in non-strict mode, so we need
    // to use matchKeyword and matchContextualKeyword appropriately.
    state8053.yieldAllowed && matchContextualKeyword8100("yield") || strict8039 && matchKeyword8099("yield")) {
        return parseYieldExpression8172();
    }
    oldParenthesizedCount8590 = state8053.parenthesizedCount;
    marker8586 = markerCreate8089();
    if (match8098("(")) {
        token8588 = lookahead28088();
        if (token8588.type === Token8029.Punctuator && token8588.value === ")" || token8588.value === "...") {
            params8589 = parseParams8169();
            if (!match8098("=>")) {
                throwUnexpected8095(lex8086());
            }
            return parseArrowFunctionExpression8131(params8589, marker8586);
        }
    }
    token8588 = lookahead8051;
    expr8587 = parseConditionalExpression8127();
    if (match8098("=>") && (state8053.parenthesizedCount === oldParenthesizedCount8590 || state8053.parenthesizedCount === oldParenthesizedCount8590 + 1)) {
        if (expr8587.type === Syntax8032.Identifier) {
            params8589 = reinterpretAsCoverFormalsList8130([expr8587]);
        } else if (expr8587.type === Syntax8032.SequenceExpression) {
            params8589 = reinterpretAsCoverFormalsList8130(expr8587.expressions);
        }
        if (params8589) {
            return parseArrowFunctionExpression8131(params8589, marker8586);
        }
    }
    if (matchAssign8101()) {
        if ( // 11.13.1
        strict8039 && expr8587.type === Syntax8032.Identifier && isRestrictedWord8067(expr8587.name)) {
            throwErrorTolerant8094(token8588, Messages8034.StrictLHSAssignment);
        }
        if ( // ES.next draf 11.13 Runtime Semantics step 1
        match8098("=") && (expr8587.type === Syntax8032.ObjectExpression || expr8587.type === Syntax8032.ArrayExpression)) {
            reinterpretAsAssignmentBindingPattern8128(expr8587);
        } else if (!isLeftHandSide8103(expr8587)) {
            throwError8093({}, Messages8034.InvalidLHSInAssignment);
        }
        expr8587 = markerApply8091(marker8586, delegate8048.createAssignmentExpression(lex8086().value, expr8587, parseAssignmentExpression8132()));
    }
    return expr8587;
}
function parseExpression8133() {
    var marker8591, expr8592, expressions8593, sequence8594, coverFormalsList8595, spreadFound8596, oldParenthesizedCount8597;
    oldParenthesizedCount8597 = state8053.parenthesizedCount;
    marker8591 = markerCreate8089();
    expr8592 = parseAssignmentExpression8132();
    expressions8593 = [expr8592];
    if (match8098(",")) {
        while (streamIndex8050 < length8047) {
            if (!match8098(",")) {
                break;
            }
            lex8086();
            expr8592 = parseSpreadOrAssignmentExpression8116();
            expressions8593.push(expr8592);
            if (expr8592.type === Syntax8032.SpreadElement) {
                spreadFound8596 = true;
                if (!match8098(")")) {
                    throwError8093({}, Messages8034.ElementAfterSpreadElement);
                }
                break;
            }
        }
        sequence8594 = markerApply8091(marker8591, delegate8048.createSequenceExpression(expressions8593));
    }
    if (match8098("=>")) {
        if ( // Do not allow nested parentheses on the LHS of the =>.
        state8053.parenthesizedCount === oldParenthesizedCount8597 || state8053.parenthesizedCount === oldParenthesizedCount8597 + 1) {
            expr8592 = expr8592.type === Syntax8032.SequenceExpression ? expr8592.expressions : expressions8593;
            coverFormalsList8595 = reinterpretAsCoverFormalsList8130(expr8592);
            if (coverFormalsList8595) {
                return parseArrowFunctionExpression8131(coverFormalsList8595, marker8591);
            }
        }
        throwUnexpected8095(lex8086());
    }
    if (spreadFound8596 && lookahead28088().value !== "=>") {
        throwError8093({}, Messages8034.IllegalSpread);
    }
    return sequence8594 || expr8592;
}
function parseStatementList8134() {
    var list8598 = [],
        statement8599;
    while (streamIndex8050 < length8047) {
        if (match8098("}")) {
            break;
        }
        statement8599 = parseSourceElement8179();
        if (typeof statement8599 === "undefined") {
            break;
        }
        list8598.push(statement8599);
    }
    return list8598;
}
function parseBlock8135() {
    var block8600,
        marker8601 = markerCreate8089();
    expect8096("{");
    block8600 = parseStatementList8134();
    expect8096("}");
    return markerApply8091(marker8601, delegate8048.createBlockStatement(block8600));
}
function parseVariableIdentifier8136() {
    var token8602 = lookahead8051,
        resolvedIdent8603,
        marker8604 = markerCreate8089();
    if (token8602.type !== Token8029.Identifier) {
        throwUnexpected8095(token8602);
    }
    resolvedIdent8603 = expander8028.resolve(tokenStream8049[lookaheadIndex8052], phase8054);
    lex8086();
    return markerApply8091(marker8604, delegate8048.createIdentifier(resolvedIdent8603));
}
function parseVariableDeclaration8137(kind8605) {
    var id8606,
        marker8607 = markerCreate8089(),
        init8608 = null;
    if (match8098("{")) {
        id8606 = parseObjectInitialiser8110();
        reinterpretAsAssignmentBindingPattern8128(id8606);
    } else if (match8098("[")) {
        id8606 = parseArrayInitialiser8105();
        reinterpretAsAssignmentBindingPattern8128(id8606);
    } else {
        id8606 = state8053.allowKeyword ? parseNonComputedProperty8117() : parseVariableIdentifier8136();
        if ( // 12.2.1
        strict8039 && isRestrictedWord8067(id8606.name)) {
            throwErrorTolerant8094({}, Messages8034.StrictVarName);
        }
    }
    if (kind8605 === "const") {
        if (!match8098("=")) {
            throwError8093({}, Messages8034.NoUnintializedConst);
        }
        expect8096("=");
        init8608 = parseAssignmentExpression8132();
    } else if (match8098("=")) {
        lex8086();
        init8608 = parseAssignmentExpression8132();
    }
    return markerApply8091(marker8607, delegate8048.createVariableDeclarator(id8606, init8608));
}
function parseVariableDeclarationList8138(kind8609) {
    var list8610 = [];
    do {
        list8610.push(parseVariableDeclaration8137(kind8609));
        if (!match8098(",")) {
            break;
        }
        lex8086();
    } while (streamIndex8050 < length8047);
    return list8610;
}
function parseVariableStatement8139() {
    var declarations8611,
        marker8612 = markerCreate8089();
    expectKeyword8097("var");
    declarations8611 = parseVariableDeclarationList8138();
    consumeSemicolon8102();
    return markerApply8091(marker8612, delegate8048.createVariableDeclaration(declarations8611, "var"));
}
function parseConstLetDeclaration8140(kind8613) {
    var declarations8614,
        marker8615 = markerCreate8089();
    expectKeyword8097(kind8613);
    declarations8614 = parseVariableDeclarationList8138(kind8613);
    consumeSemicolon8102();
    return markerApply8091(marker8615, delegate8048.createVariableDeclaration(declarations8614, kind8613));
}
function parseModuleDeclaration8141() {
    var id8616,
        src8617,
        body8618,
        marker8619 = markerCreate8089();
    lex8086();
    if ( // 'module'
    peekLineTerminator8092()) {
        throwError8093({}, Messages8034.NewlineAfterModule);
    }
    switch (lookahead8051.type) {
        case Token8029.StringLiteral:
            id8616 = parsePrimaryExpression8114();
            body8618 = parseModuleBlock8184();
            src8617 = null;
            break;
        case Token8029.Identifier:
            id8616 = parseVariableIdentifier8136();
            body8618 = null;
            if (!matchContextualKeyword8100("from")) {
                throwUnexpected8095(lex8086());
            }
            lex8086();
            src8617 = parsePrimaryExpression8114();
            if (src8617.type !== Syntax8032.Literal) {
                throwError8093({}, Messages8034.InvalidModuleSpecifier);
            }
            break;
    }
    consumeSemicolon8102();
    return markerApply8091(marker8619, delegate8048.createModuleDeclaration(id8616, src8617, body8618));
}
function parseExportBatchSpecifier8142() {
    var marker8620 = markerCreate8089();
    expect8096("*");
    return markerApply8091(marker8620, delegate8048.createExportBatchSpecifier());
}
function parseExportSpecifier8143() {
    var id8621,
        name8622 = null,
        marker8623 = markerCreate8089();
    id8621 = parseVariableIdentifier8136();
    if (matchContextualKeyword8100("as")) {
        lex8086();
        name8622 = parseNonComputedProperty8117();
    }
    return markerApply8091(marker8623, delegate8048.createExportSpecifier(id8621, name8622));
}
function parseExportDeclaration8144() {
    var previousAllowKeyword8624,
        decl8625,
        def8626,
        src8627,
        specifiers8628,
        marker8629 = markerCreate8089();
    expectKeyword8097("export");
    if (lookahead8051.type === Token8029.Keyword) {
        switch (lookahead8051.value) {
            case "let":
            case "const":
            case "var":
            case "class":
            case "function":
                return markerApply8091(marker8629, delegate8048.createExportDeclaration(parseSourceElement8179(), null, null));
        }
    }
    if (isIdentifierName8083(lookahead8051)) {
        previousAllowKeyword8624 = state8053.allowKeyword;
        state8053.allowKeyword = true;
        decl8625 = parseVariableDeclarationList8138("let");
        state8053.allowKeyword = previousAllowKeyword8624;
        return markerApply8091(marker8629, delegate8048.createExportDeclaration(decl8625, null, null));
    }
    specifiers8628 = [];
    src8627 = null;
    if (match8098("*")) {
        specifiers8628.push(parseExportBatchSpecifier8142());
    } else {
        expect8096("{");
        do {
            specifiers8628.push(parseExportSpecifier8143());
        } while (match8098(",") && lex8086());
        expect8096("}");
    }
    if (matchContextualKeyword8100("from")) {
        lex8086();
        src8627 = parsePrimaryExpression8114();
        if (src8627.type !== Syntax8032.Literal) {
            throwError8093({}, Messages8034.InvalidModuleSpecifier);
        }
    }
    consumeSemicolon8102();
    return markerApply8091(marker8629, delegate8048.createExportDeclaration(null, specifiers8628, src8627));
}
function parseImportDeclaration8145() {
    var specifiers8630,
        kind8631,
        src8632,
        marker8633 = markerCreate8089();
    expectKeyword8097("import");
    specifiers8630 = [];
    if (isIdentifierName8083(lookahead8051)) {
        kind8631 = "default";
        specifiers8630.push(parseImportSpecifier8146());
        if (!matchContextualKeyword8100("from")) {
            throwError8093({}, Messages8034.NoFromAfterImport);
        }
        lex8086();
    } else if (match8098("{")) {
        kind8631 = "named";
        lex8086();
        do {
            specifiers8630.push(parseImportSpecifier8146());
        } while (match8098(",") && lex8086());
        expect8096("}");
        if (!matchContextualKeyword8100("from")) {
            throwError8093({}, Messages8034.NoFromAfterImport);
        }
        lex8086();
    }
    src8632 = parsePrimaryExpression8114();
    if (src8632.type !== Syntax8032.Literal) {
        throwError8093({}, Messages8034.InvalidModuleSpecifier);
    }
    consumeSemicolon8102();
    return markerApply8091(marker8633, delegate8048.createImportDeclaration(specifiers8630, kind8631, src8632));
}
function parseImportSpecifier8146() {
    var id8634,
        name8635 = null,
        marker8636 = markerCreate8089();
    id8634 = parseNonComputedProperty8117(true);
    if (matchContextualKeyword8100("as")) {
        lex8086();
        name8635 = parseVariableIdentifier8136();
    }
    return markerApply8091(marker8636, delegate8048.createImportSpecifier(id8634, name8635));
}
function parseEmptyStatement8147() {
    var marker8637 = markerCreate8089();
    expect8096(";");
    return markerApply8091(marker8637, delegate8048.createEmptyStatement());
}
function parseExpressionStatement8148() {
    var marker8638 = markerCreate8089(),
        expr8639 = parseExpression8133();
    consumeSemicolon8102();
    return markerApply8091(marker8638, delegate8048.createExpressionStatement(expr8639));
}
function parseIfStatement8149() {
    var test8640,
        consequent8641,
        alternate8642,
        marker8643 = markerCreate8089();
    expectKeyword8097("if");
    expect8096("(");
    test8640 = parseExpression8133();
    expect8096(")");
    consequent8641 = parseStatement8164();
    if (matchKeyword8099("else")) {
        lex8086();
        alternate8642 = parseStatement8164();
    } else {
        alternate8642 = null;
    }
    return markerApply8091(marker8643, delegate8048.createIfStatement(test8640, consequent8641, alternate8642));
}
function parseDoWhileStatement8150() {
    var body8644,
        test8645,
        oldInIteration8646,
        marker8647 = markerCreate8089();
    expectKeyword8097("do");
    oldInIteration8646 = state8053.inIteration;
    state8053.inIteration = true;
    body8644 = parseStatement8164();
    state8053.inIteration = oldInIteration8646;
    expectKeyword8097("while");
    expect8096("(");
    test8645 = parseExpression8133();
    expect8096(")");
    if (match8098(";")) {
        lex8086();
    }
    return markerApply8091(marker8647, delegate8048.createDoWhileStatement(body8644, test8645));
}
function parseWhileStatement8151() {
    var test8648,
        body8649,
        oldInIteration8650,
        marker8651 = markerCreate8089();
    expectKeyword8097("while");
    expect8096("(");
    test8648 = parseExpression8133();
    expect8096(")");
    oldInIteration8650 = state8053.inIteration;
    state8053.inIteration = true;
    body8649 = parseStatement8164();
    state8053.inIteration = oldInIteration8650;
    return markerApply8091(marker8651, delegate8048.createWhileStatement(test8648, body8649));
}
function parseForVariableDeclaration8152() {
    var marker8652 = markerCreate8089(),
        token8653 = lex8086(),
        declarations8654 = parseVariableDeclarationList8138();
    return markerApply8091(marker8652, delegate8048.createVariableDeclaration(declarations8654, token8653.value));
}
function parseForStatement8153(opts8655) {
    var init8656,
        test8657,
        update8658,
        left8659,
        right8660,
        body8661,
        operator8662,
        oldInIteration8663,
        marker8664 = markerCreate8089();
    init8656 = test8657 = update8658 = null;
    expectKeyword8097("for");
    if ( // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
    matchContextualKeyword8100("each")) {
        throwError8093({}, Messages8034.EachNotAllowed);
    }
    expect8096("(");
    if (match8098(";")) {
        lex8086();
    } else {
        if (matchKeyword8099("var") || matchKeyword8099("let") || matchKeyword8099("const")) {
            state8053.allowIn = false;
            init8656 = parseForVariableDeclaration8152();
            state8053.allowIn = true;
            if (init8656.declarations.length === 1) {
                if (matchKeyword8099("in") || matchContextualKeyword8100("of")) {
                    operator8662 = lookahead8051;
                    if (!((operator8662.value === "in" || init8656.kind !== "var") && init8656.declarations[0].init)) {
                        lex8086();
                        left8659 = init8656;
                        right8660 = parseExpression8133();
                        init8656 = null;
                    }
                }
            }
        } else {
            state8053.allowIn = false;
            init8656 = parseExpression8133();
            state8053.allowIn = true;
            if (matchContextualKeyword8100("of")) {
                operator8662 = lex8086();
                left8659 = init8656;
                right8660 = parseExpression8133();
                init8656 = null;
            } else if (matchKeyword8099("in")) {
                if ( // LeftHandSideExpression
                !isAssignableLeftHandSide8104(init8656)) {
                    throwError8093({}, Messages8034.InvalidLHSInForIn);
                }
                operator8662 = lex8086();
                left8659 = init8656;
                right8660 = parseExpression8133();
                init8656 = null;
            }
        }
        if (typeof left8659 === "undefined") {
            expect8096(";");
        }
    }
    if (typeof left8659 === "undefined") {
        if (!match8098(";")) {
            test8657 = parseExpression8133();
        }
        expect8096(";");
        if (!match8098(")")) {
            update8658 = parseExpression8133();
        }
    }
    expect8096(")");
    oldInIteration8663 = state8053.inIteration;
    state8053.inIteration = true;
    if (!(opts8655 !== undefined && opts8655.ignoreBody)) {
        body8661 = parseStatement8164();
    }
    state8053.inIteration = oldInIteration8663;
    if (typeof left8659 === "undefined") {
        return markerApply8091(marker8664, delegate8048.createForStatement(init8656, test8657, update8658, body8661));
    }
    if (operator8662.value === "in") {
        return markerApply8091(marker8664, delegate8048.createForInStatement(left8659, right8660, body8661));
    }
    return markerApply8091(marker8664, delegate8048.createForOfStatement(left8659, right8660, body8661));
}
function parseContinueStatement8154() {
    var label8665 = null,
        key8666,
        marker8667 = markerCreate8089();
    expectKeyword8097("continue");
    if ( // Optimize the most common form: 'continue;'.
    lookahead8051.value.charCodeAt(0) === 59) {
        lex8086();
        if (!state8053.inIteration) {
            throwError8093({}, Messages8034.IllegalContinue);
        }
        return markerApply8091(marker8667, delegate8048.createContinueStatement(null));
    }
    if (peekLineTerminator8092()) {
        if (!state8053.inIteration) {
            throwError8093({}, Messages8034.IllegalContinue);
        }
        return markerApply8091(marker8667, delegate8048.createContinueStatement(null));
    }
    if (lookahead8051.type === Token8029.Identifier) {
        label8665 = parseVariableIdentifier8136();
        key8666 = "$" + label8665.name;
        if (!Object.prototype.hasOwnProperty.call(state8053.labelSet, key8666)) {
            throwError8093({}, Messages8034.UnknownLabel, label8665.name);
        }
    }
    consumeSemicolon8102();
    if (label8665 === null && !state8053.inIteration) {
        throwError8093({}, Messages8034.IllegalContinue);
    }
    return markerApply8091(marker8667, delegate8048.createContinueStatement(label8665));
}
function parseBreakStatement8155() {
    var label8668 = null,
        key8669,
        marker8670 = markerCreate8089();
    expectKeyword8097("break");
    if ( // Catch the very common case first: immediately a semicolon (char #59).
    lookahead8051.value.charCodeAt(0) === 59) {
        lex8086();
        if (!(state8053.inIteration || state8053.inSwitch)) {
            throwError8093({}, Messages8034.IllegalBreak);
        }
        return markerApply8091(marker8670, delegate8048.createBreakStatement(null));
    }
    if (peekLineTerminator8092()) {
        if (!(state8053.inIteration || state8053.inSwitch)) {
            throwError8093({}, Messages8034.IllegalBreak);
        }
        return markerApply8091(marker8670, delegate8048.createBreakStatement(null));
    }
    if (lookahead8051.type === Token8029.Identifier) {
        label8668 = parseVariableIdentifier8136();
        key8669 = "$" + label8668.name;
        if (!Object.prototype.hasOwnProperty.call(state8053.labelSet, key8669)) {
            throwError8093({}, Messages8034.UnknownLabel, label8668.name);
        }
    }
    consumeSemicolon8102();
    if (label8668 === null && !(state8053.inIteration || state8053.inSwitch)) {
        throwError8093({}, Messages8034.IllegalBreak);
    }
    return markerApply8091(marker8670, delegate8048.createBreakStatement(label8668));
}
function parseReturnStatement8156() {
    var argument8671 = null,
        marker8672 = markerCreate8089();
    expectKeyword8097("return");
    if (!state8053.inFunctionBody) {
        throwErrorTolerant8094({}, Messages8034.IllegalReturn);
    }
    if ( // 'return' followed by a space and an identifier is very common.
    isIdentifierStart8063(String(lookahead8051.value).charCodeAt(0))) {
        argument8671 = parseExpression8133();
        consumeSemicolon8102();
        return markerApply8091(marker8672, delegate8048.createReturnStatement(argument8671));
    }
    if (peekLineTerminator8092()) {
        return markerApply8091(marker8672, delegate8048.createReturnStatement(null));
    }
    if (!match8098(";")) {
        if (!match8098("}") && lookahead8051.type !== Token8029.EOF) {
            argument8671 = parseExpression8133();
        }
    }
    consumeSemicolon8102();
    return markerApply8091(marker8672, delegate8048.createReturnStatement(argument8671));
}
function parseWithStatement8157() {
    var object8673,
        body8674,
        marker8675 = markerCreate8089();
    if (strict8039) {
        throwErrorTolerant8094({}, Messages8034.StrictModeWith);
    }
    expectKeyword8097("with");
    expect8096("(");
    object8673 = parseExpression8133();
    expect8096(")");
    body8674 = parseStatement8164();
    return markerApply8091(marker8675, delegate8048.createWithStatement(object8673, body8674));
}
function parseSwitchCase8158() {
    var test8676,
        consequent8677 = [],
        sourceElement8678,
        marker8679 = markerCreate8089();
    if (matchKeyword8099("default")) {
        lex8086();
        test8676 = null;
    } else {
        expectKeyword8097("case");
        test8676 = parseExpression8133();
    }
    expect8096(":");
    while (streamIndex8050 < length8047) {
        if (match8098("}") || matchKeyword8099("default") || matchKeyword8099("case")) {
            break;
        }
        sourceElement8678 = parseSourceElement8179();
        if (typeof sourceElement8678 === "undefined") {
            break;
        }
        consequent8677.push(sourceElement8678);
    }
    return markerApply8091(marker8679, delegate8048.createSwitchCase(test8676, consequent8677));
}
function parseSwitchStatement8159() {
    var discriminant8680,
        cases8681,
        clause8682,
        oldInSwitch8683,
        defaultFound8684,
        marker8685 = markerCreate8089();
    expectKeyword8097("switch");
    expect8096("(");
    discriminant8680 = parseExpression8133();
    expect8096(")");
    expect8096("{");
    cases8681 = [];
    if (match8098("}")) {
        lex8086();
        return markerApply8091(marker8685, delegate8048.createSwitchStatement(discriminant8680, cases8681));
    }
    oldInSwitch8683 = state8053.inSwitch;
    state8053.inSwitch = true;
    defaultFound8684 = false;
    while (streamIndex8050 < length8047) {
        if (match8098("}")) {
            break;
        }
        clause8682 = parseSwitchCase8158();
        if (clause8682.test === null) {
            if (defaultFound8684) {
                throwError8093({}, Messages8034.MultipleDefaultsInSwitch);
            }
            defaultFound8684 = true;
        }
        cases8681.push(clause8682);
    }
    state8053.inSwitch = oldInSwitch8683;
    expect8096("}");
    return markerApply8091(marker8685, delegate8048.createSwitchStatement(discriminant8680, cases8681));
}
function parseThrowStatement8160() {
    var argument8686,
        marker8687 = markerCreate8089();
    expectKeyword8097("throw");
    if (peekLineTerminator8092()) {
        throwError8093({}, Messages8034.NewlineAfterThrow);
    }
    argument8686 = parseExpression8133();
    consumeSemicolon8102();
    return markerApply8091(marker8687, delegate8048.createThrowStatement(argument8686));
}
function parseCatchClause8161() {
    var param8688,
        body8689,
        marker8690 = markerCreate8089();
    expectKeyword8097("catch");
    expect8096("(");
    if (match8098(")")) {
        throwUnexpected8095(lookahead8051);
    }
    param8688 = parseExpression8133();
    if ( // 12.14.1
    strict8039 && param8688.type === Syntax8032.Identifier && isRestrictedWord8067(param8688.name)) {
        throwErrorTolerant8094({}, Messages8034.StrictCatchVariable);
    }
    expect8096(")");
    body8689 = parseBlock8135();
    return markerApply8091(marker8690, delegate8048.createCatchClause(param8688, body8689));
}
function parseTryStatement8162() {
    var block8691,
        handlers8692 = [],
        finalizer8693 = null,
        marker8694 = markerCreate8089();
    expectKeyword8097("try");
    block8691 = parseBlock8135();
    if (matchKeyword8099("catch")) {
        handlers8692.push(parseCatchClause8161());
    }
    if (matchKeyword8099("finally")) {
        lex8086();
        finalizer8693 = parseBlock8135();
    }
    if (handlers8692.length === 0 && !finalizer8693) {
        throwError8093({}, Messages8034.NoCatchOrFinally);
    }
    return markerApply8091(marker8694, delegate8048.createTryStatement(block8691, [], handlers8692, finalizer8693));
}
function parseDebuggerStatement8163() {
    var marker8695 = markerCreate8089();
    expectKeyword8097("debugger");
    consumeSemicolon8102();
    return markerApply8091(marker8695, delegate8048.createDebuggerStatement());
}
function parseStatement8164() {
    var type8696 = lookahead8051.type,
        marker8697,
        expr8698,
        labeledBody8699,
        key8700;
    if (type8696 === Token8029.EOF) {
        throwUnexpected8095(lookahead8051);
    }
    if (type8696 === Token8029.Punctuator) {
        switch (lookahead8051.value) {
            case ";":
                return parseEmptyStatement8147();
            case "{":
                return parseBlock8135();
            case "(":
                return parseExpressionStatement8148();
            default:
                break;
        }
    }
    if (type8696 === Token8029.Keyword) {
        switch (lookahead8051.value) {
            case "break":
                return parseBreakStatement8155();
            case "continue":
                return parseContinueStatement8154();
            case "debugger":
                return parseDebuggerStatement8163();
            case "do":
                return parseDoWhileStatement8150();
            case "for":
                return parseForStatement8153();
            case "function":
                return parseFunctionDeclaration8170();
            case "class":
                return parseClassDeclaration8177();
            case "if":
                return parseIfStatement8149();
            case "return":
                return parseReturnStatement8156();
            case "switch":
                return parseSwitchStatement8159();
            case "throw":
                return parseThrowStatement8160();
            case "try":
                return parseTryStatement8162();
            case "var":
                return parseVariableStatement8139();
            case "while":
                return parseWhileStatement8151();
            case "with":
                return parseWithStatement8157();
            default:
                break;
        }
    }
    marker8697 = markerCreate8089();
    expr8698 = parseExpression8133();
    if ( // 12.12 Labelled Statements
    expr8698.type === Syntax8032.Identifier && match8098(":")) {
        lex8086();
        key8700 = "$" + expr8698.name;
        if (Object.prototype.hasOwnProperty.call(state8053.labelSet, key8700)) {
            throwError8093({}, Messages8034.Redeclaration, "Label", expr8698.name);
        }
        state8053.labelSet[key8700] = true;
        labeledBody8699 = parseStatement8164();
        delete state8053.labelSet[key8700];
        return markerApply8091(marker8697, delegate8048.createLabeledStatement(expr8698, labeledBody8699));
    }
    consumeSemicolon8102();
    return markerApply8091(marker8697, delegate8048.createExpressionStatement(expr8698));
}
function parseConciseBody8165() {
    if (match8098("{")) {
        return parseFunctionSourceElements8166();
    }
    return parseAssignmentExpression8132();
}
function parseFunctionSourceElements8166() {
    var sourceElement8701,
        sourceElements8702 = [],
        token8703,
        directive8704,
        firstRestricted8705,
        oldLabelSet8706,
        oldInIteration8707,
        oldInSwitch8708,
        oldInFunctionBody8709,
        oldParenthesizedCount8710,
        marker8711 = markerCreate8089();
    expect8096("{");
    while (streamIndex8050 < length8047) {
        if (lookahead8051.type !== Token8029.StringLiteral) {
            break;
        }
        token8703 = lookahead8051;
        sourceElement8701 = parseSourceElement8179();
        sourceElements8702.push(sourceElement8701);
        if (sourceElement8701.expression.type !== Syntax8032.Literal) {
            // this is not directive
            break;
        }
        directive8704 = token8703.value;
        if (directive8704 === "use strict") {
            strict8039 = true;
            if (firstRestricted8705) {
                throwErrorTolerant8094(firstRestricted8705, Messages8034.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted8705 && token8703.octal) {
                firstRestricted8705 = token8703;
            }
        }
    }
    oldLabelSet8706 = state8053.labelSet;
    oldInIteration8707 = state8053.inIteration;
    oldInSwitch8708 = state8053.inSwitch;
    oldInFunctionBody8709 = state8053.inFunctionBody;
    oldParenthesizedCount8710 = state8053.parenthesizedCount;
    state8053.labelSet = {};
    state8053.inIteration = false;
    state8053.inSwitch = false;
    state8053.inFunctionBody = true;
    state8053.parenthesizedCount = 0;
    while (streamIndex8050 < length8047) {
        if (match8098("}")) {
            break;
        }
        sourceElement8701 = parseSourceElement8179();
        if (typeof sourceElement8701 === "undefined") {
            break;
        }
        sourceElements8702.push(sourceElement8701);
    }
    expect8096("}");
    state8053.labelSet = oldLabelSet8706;
    state8053.inIteration = oldInIteration8707;
    state8053.inSwitch = oldInSwitch8708;
    state8053.inFunctionBody = oldInFunctionBody8709;
    state8053.parenthesizedCount = oldParenthesizedCount8710;
    return markerApply8091(marker8711, delegate8048.createBlockStatement(sourceElements8702));
}
function validateParam8167(options8712, param8713, name8714) {
    var key8715 = "$" + name8714;
    if (strict8039) {
        if (isRestrictedWord8067(name8714)) {
            options8712.stricted = param8713;
            options8712.message = Messages8034.StrictParamName;
        }
        if (Object.prototype.hasOwnProperty.call(options8712.paramSet, key8715)) {
            options8712.stricted = param8713;
            options8712.message = Messages8034.StrictParamDupe;
        }
    } else if (!options8712.firstRestricted) {
        if (isRestrictedWord8067(name8714)) {
            options8712.firstRestricted = param8713;
            options8712.message = Messages8034.StrictParamName;
        } else if (isStrictModeReservedWord8066(name8714)) {
            options8712.firstRestricted = param8713;
            options8712.message = Messages8034.StrictReservedWord;
        } else if (Object.prototype.hasOwnProperty.call(options8712.paramSet, key8715)) {
            options8712.firstRestricted = param8713;
            options8712.message = Messages8034.StrictParamDupe;
        }
    }
    options8712.paramSet[key8715] = true;
}
function parseParam8168(options8716) {
    var token8717, rest8718, param8719, def8720;
    token8717 = lookahead8051;
    if (token8717.value === "...") {
        token8717 = lex8086();
        rest8718 = true;
    }
    if (match8098("[")) {
        param8719 = parseArrayInitialiser8105();
        reinterpretAsDestructuredParameter8129(options8716, param8719);
    } else if (match8098("{")) {
        if (rest8718) {
            throwError8093({}, Messages8034.ObjectPatternAsRestParameter);
        }
        param8719 = parseObjectInitialiser8110();
        reinterpretAsDestructuredParameter8129(options8716, param8719);
    } else {
        param8719 = parseVariableIdentifier8136();
        validateParam8167(options8716, token8717, token8717.value);
    }
    if (match8098("=")) {
        if (rest8718) {
            throwErrorTolerant8094(lookahead8051, Messages8034.DefaultRestParameter);
        }
        lex8086();
        def8720 = parseAssignmentExpression8132();
        ++options8716.defaultCount;
    }
    if (rest8718) {
        if (!match8098(")")) {
            throwError8093({}, Messages8034.ParameterAfterRestParameter);
        }
        options8716.rest = param8719;
        return false;
    }
    options8716.params.push(param8719);
    options8716.defaults.push(def8720);
    return !match8098(")");
}
function parseParams8169(firstRestricted8721) {
    var options8722;
    options8722 = {
        params: [],
        defaultCount: 0,
        defaults: [],
        rest: null,
        firstRestricted: firstRestricted8721
    };
    expect8096("(");
    if (!match8098(")")) {
        options8722.paramSet = {};
        while (streamIndex8050 < length8047) {
            if (!parseParam8168(options8722)) {
                break;
            }
            expect8096(",");
        }
    }
    expect8096(")");
    if (options8722.defaultCount === 0) {
        options8722.defaults = [];
    }
    return options8722;
}
function parseFunctionDeclaration8170() {
    var id8723,
        body8724,
        token8725,
        tmp8726,
        firstRestricted8727,
        message8728,
        previousStrict8729,
        previousYieldAllowed8730,
        generator8731,
        marker8732 = markerCreate8089();
    expectKeyword8097("function");
    generator8731 = false;
    if (match8098("*")) {
        lex8086();
        generator8731 = true;
    }
    token8725 = lookahead8051;
    id8723 = parseVariableIdentifier8136();
    if (strict8039) {
        if (isRestrictedWord8067(token8725.value)) {
            throwErrorTolerant8094(token8725, Messages8034.StrictFunctionName);
        }
    } else {
        if (isRestrictedWord8067(token8725.value)) {
            firstRestricted8727 = token8725;
            message8728 = Messages8034.StrictFunctionName;
        } else if (isStrictModeReservedWord8066(token8725.value)) {
            firstRestricted8727 = token8725;
            message8728 = Messages8034.StrictReservedWord;
        }
    }
    tmp8726 = parseParams8169(firstRestricted8727);
    firstRestricted8727 = tmp8726.firstRestricted;
    if (tmp8726.message) {
        message8728 = tmp8726.message;
    }
    previousStrict8729 = strict8039;
    previousYieldAllowed8730 = state8053.yieldAllowed;
    state8053.yieldAllowed = generator8731;
    body8724 = parseFunctionSourceElements8166();
    if (strict8039 && firstRestricted8727) {
        throwError8093(firstRestricted8727, message8728);
    }
    if (strict8039 && tmp8726.stricted) {
        throwErrorTolerant8094(tmp8726.stricted, message8728);
    }
    strict8039 = previousStrict8729;
    state8053.yieldAllowed = previousYieldAllowed8730;
    return markerApply8091(marker8732, delegate8048.createFunctionDeclaration(id8723, tmp8726.params, tmp8726.defaults, body8724, tmp8726.rest, generator8731, false));
}
function parseFunctionExpression8171() {
    var token8733,
        id8734 = null,
        firstRestricted8735,
        message8736,
        tmp8737,
        body8738,
        previousStrict8739,
        previousYieldAllowed8740,
        generator8741,
        marker8742 = markerCreate8089();
    expectKeyword8097("function");
    generator8741 = false;
    if (match8098("*")) {
        lex8086();
        generator8741 = true;
    }
    if (!match8098("(")) {
        token8733 = lookahead8051;
        id8734 = parseVariableIdentifier8136();
        if (strict8039) {
            if (isRestrictedWord8067(token8733.value)) {
                throwErrorTolerant8094(token8733, Messages8034.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord8067(token8733.value)) {
                firstRestricted8735 = token8733;
                message8736 = Messages8034.StrictFunctionName;
            } else if (isStrictModeReservedWord8066(token8733.value)) {
                firstRestricted8735 = token8733;
                message8736 = Messages8034.StrictReservedWord;
            }
        }
    }
    tmp8737 = parseParams8169(firstRestricted8735);
    firstRestricted8735 = tmp8737.firstRestricted;
    if (tmp8737.message) {
        message8736 = tmp8737.message;
    }
    previousStrict8739 = strict8039;
    previousYieldAllowed8740 = state8053.yieldAllowed;
    state8053.yieldAllowed = generator8741;
    body8738 = parseFunctionSourceElements8166();
    if (strict8039 && firstRestricted8735) {
        throwError8093(firstRestricted8735, message8736);
    }
    if (strict8039 && tmp8737.stricted) {
        throwErrorTolerant8094(tmp8737.stricted, message8736);
    }
    strict8039 = previousStrict8739;
    state8053.yieldAllowed = previousYieldAllowed8740;
    return markerApply8091(marker8742, delegate8048.createFunctionExpression(id8734, tmp8737.params, tmp8737.defaults, body8738, tmp8737.rest, generator8741, false));
}
function parseYieldExpression8172() {
    var yieldToken8743,
        delegateFlag8744,
        expr8745,
        marker8746 = markerCreate8089();
    yieldToken8743 = lex8086();
    assert8056(yieldToken8743.value === "yield", "Called parseYieldExpression with non-yield lookahead.");
    if (!state8053.yieldAllowed) {
        throwErrorTolerant8094({}, Messages8034.IllegalYield);
    }
    delegateFlag8744 = false;
    if (match8098("*")) {
        lex8086();
        delegateFlag8744 = true;
    }
    expr8745 = parseAssignmentExpression8132();
    return markerApply8091(marker8746, delegate8048.createYieldExpression(expr8745, delegateFlag8744));
}
function parseMethodDefinition8173(existingPropNames8747) {
    var token8748,
        key8749,
        param8750,
        propType8751,
        isValidDuplicateProp8752 = false,
        marker8753 = markerCreate8089();
    if (lookahead8051.value === "static") {
        propType8751 = ClassPropertyType8037["static"];
        lex8086();
    } else {
        propType8751 = ClassPropertyType8037.prototype;
    }
    if (match8098("*")) {
        lex8086();
        return markerApply8091(marker8753, delegate8048.createMethodDefinition(propType8751, "", parseObjectPropertyKey8108(), parsePropertyMethodFunction8107({ generator: true })));
    }
    token8748 = lookahead8051;
    key8749 = parseObjectPropertyKey8108();
    if (token8748.value === "get" && !match8098("(")) {
        key8749 = parseObjectPropertyKey8108();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a setter
        existingPropNames8747[propType8751].hasOwnProperty(key8749.name)) {
            isValidDuplicateProp8752 = // There isn't already a getter for this prop
            existingPropNames8747[propType8751][key8749.name].get === undefined && // There isn't already a data prop by this name
            existingPropNames8747[propType8751][key8749.name].data === undefined && // The only existing prop by this name is a setter
            existingPropNames8747[propType8751][key8749.name].set !== undefined;
            if (!isValidDuplicateProp8752) {
                throwError8093(key8749, Messages8034.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames8747[propType8751][key8749.name] = {};
        }
        existingPropNames8747[propType8751][key8749.name].get = true;
        expect8096("(");
        expect8096(")");
        return markerApply8091(marker8753, delegate8048.createMethodDefinition(propType8751, "get", key8749, parsePropertyFunction8106({ generator: false })));
    }
    if (token8748.value === "set" && !match8098("(")) {
        key8749 = parseObjectPropertyKey8108();
        if ( // It is a syntax error if any other properties have a name
        // duplicating this one unless they are a getter
        existingPropNames8747[propType8751].hasOwnProperty(key8749.name)) {
            isValidDuplicateProp8752 = // There isn't already a setter for this prop
            existingPropNames8747[propType8751][key8749.name].set === undefined && // There isn't already a data prop by this name
            existingPropNames8747[propType8751][key8749.name].data === undefined && // The only existing prop by this name is a getter
            existingPropNames8747[propType8751][key8749.name].get !== undefined;
            if (!isValidDuplicateProp8752) {
                throwError8093(key8749, Messages8034.IllegalDuplicateClassProperty);
            }
        } else {
            existingPropNames8747[propType8751][key8749.name] = {};
        }
        existingPropNames8747[propType8751][key8749.name].set = true;
        expect8096("(");
        token8748 = lookahead8051;
        param8750 = [parseVariableIdentifier8136()];
        expect8096(")");
        return markerApply8091(marker8753, delegate8048.createMethodDefinition(propType8751, "set", key8749, parsePropertyFunction8106({
            params: param8750,
            generator: false,
            name: token8748
        })));
    }
    if ( // It is a syntax error if any other properties have the same name as a
    // non-getter, non-setter method
    existingPropNames8747[propType8751].hasOwnProperty(key8749.name)) {
        throwError8093(key8749, Messages8034.IllegalDuplicateClassProperty);
    } else {
        existingPropNames8747[propType8751][key8749.name] = {};
    }
    existingPropNames8747[propType8751][key8749.name].data = true;
    return markerApply8091(marker8753, delegate8048.createMethodDefinition(propType8751, "", key8749, parsePropertyMethodFunction8107({ generator: false })));
}
function parseClassElement8174(existingProps8754) {
    if (match8098(";")) {
        lex8086();
        return;
    }
    return parseMethodDefinition8173(existingProps8754);
}
function parseClassBody8175() {
    var classElement8755,
        classElements8756 = [],
        existingProps8757 = {},
        marker8758 = markerCreate8089();
    existingProps8757[ClassPropertyType8037["static"]] = {};
    existingProps8757[ClassPropertyType8037.prototype] = {};
    expect8096("{");
    while (streamIndex8050 < length8047) {
        if (match8098("}")) {
            break;
        }
        classElement8755 = parseClassElement8174(existingProps8757);
        if (typeof classElement8755 !== "undefined") {
            classElements8756.push(classElement8755);
        }
    }
    expect8096("}");
    return markerApply8091(marker8758, delegate8048.createClassBody(classElements8756));
}
function parseClassExpression8176() {
    var id8759,
        previousYieldAllowed8760,
        superClass8761 = null,
        marker8762 = markerCreate8089();
    expectKeyword8097("class");
    if (!matchKeyword8099("extends") && !match8098("{")) {
        id8759 = parseVariableIdentifier8136();
    }
    if (matchKeyword8099("extends")) {
        expectKeyword8097("extends");
        previousYieldAllowed8760 = state8053.yieldAllowed;
        state8053.yieldAllowed = false;
        superClass8761 = parseAssignmentExpression8132();
        state8053.yieldAllowed = previousYieldAllowed8760;
    }
    return markerApply8091(marker8762, delegate8048.createClassExpression(id8759, superClass8761, parseClassBody8175()));
}
function parseClassDeclaration8177() {
    var id8763,
        previousYieldAllowed8764,
        superClass8765 = null,
        marker8766 = markerCreate8089();
    expectKeyword8097("class");
    id8763 = parseVariableIdentifier8136();
    if (matchKeyword8099("extends")) {
        expectKeyword8097("extends");
        previousYieldAllowed8764 = state8053.yieldAllowed;
        state8053.yieldAllowed = false;
        superClass8765 = parseAssignmentExpression8132();
        state8053.yieldAllowed = previousYieldAllowed8764;
    }
    return markerApply8091(marker8766, delegate8048.createClassDeclaration(id8763, superClass8765, parseClassBody8175()));
}
function matchModuleDeclaration8178() {
    var id8767;
    if (matchContextualKeyword8100("module")) {
        id8767 = lookahead28088();
        return id8767.type === Token8029.StringLiteral || id8767.type === Token8029.Identifier;
    }
    return false;
}
function parseSourceElement8179() {
    if (lookahead8051.type === Token8029.Keyword) {
        switch (lookahead8051.value) {
            case "const":
            case "let":
                return parseConstLetDeclaration8140(lookahead8051.value);
            case "function":
                return parseFunctionDeclaration8170();
            case "export":
                return parseExportDeclaration8144();
            case "import":
                return parseImportDeclaration8145();
            default:
                return parseStatement8164();
        }
    }
    if (matchModuleDeclaration8178()) {
        throwError8093({}, Messages8034.NestedModule);
    }
    if (lookahead8051.type !== Token8029.EOF) {
        return parseStatement8164();
    }
}
function parseProgramElement8180() {
    if (lookahead8051.type === Token8029.Keyword) {
        switch (lookahead8051.value) {
            case "export":
                return parseExportDeclaration8144();
            case "import":
                return parseImportDeclaration8145();
        }
    }
    if (matchModuleDeclaration8178()) {
        return parseModuleDeclaration8141();
    }
    return parseSourceElement8179();
}
function parseProgramElements8181() {
    var sourceElement8768,
        sourceElements8769 = [],
        token8770,
        directive8771,
        firstRestricted8772;
    while (streamIndex8050 < length8047) {
        token8770 = lookahead8051;
        if (token8770.type !== Token8029.StringLiteral) {
            break;
        }
        sourceElement8768 = parseProgramElement8180();
        sourceElements8769.push(sourceElement8768);
        if (sourceElement8768.expression.type !== Syntax8032.Literal) {
            // this is not directive
            break;
        }
        directive8771 = token8770.value;
        if (directive8771 === "use strict") {
            strict8039 = true;
            if (firstRestricted8772) {
                throwErrorTolerant8094(firstRestricted8772, Messages8034.StrictOctalLiteral);
            }
        } else {
            if (!firstRestricted8772 && token8770.octal) {
                firstRestricted8772 = token8770;
            }
        }
    }
    while (streamIndex8050 < length8047) {
        sourceElement8768 = parseProgramElement8180();
        if (typeof sourceElement8768 === "undefined") {
            break;
        }
        sourceElements8769.push(sourceElement8768);
    }
    return sourceElements8769;
}
function parseModuleElement8182() {
    return parseSourceElement8179();
}
function parseModuleElements8183() {
    var list8773 = [],
        statement8774;
    while (streamIndex8050 < length8047) {
        if (match8098("}")) {
            break;
        }
        statement8774 = parseModuleElement8182();
        if (typeof statement8774 === "undefined") {
            break;
        }
        list8773.push(statement8774);
    }
    return list8773;
}
function parseModuleBlock8184() {
    var block8775,
        marker8776 = markerCreate8089();
    expect8096("{");
    block8775 = parseModuleElements8183();
    expect8096("}");
    return markerApply8091(marker8776, delegate8048.createBlockStatement(block8775));
}
function parseProgram8185() {
    var body8777,
        marker8778 = markerCreate8089();
    strict8039 = false;
    peek8087();
    body8777 = parseProgramElements8181();
    return markerApply8091(marker8778, delegate8048.createProgram(body8777));
}
function addComment8186(type8779, value8780, start8781, end8782, loc8783) {
    var comment8784;
    assert8056(typeof start8781 === "number", "Comment must have valid position");
    if ( // Because the way the actual token is scanned, often the comments
    // (if any) are skipped twice during the lexical analysis.
    // Thus, we need to skip adding a comment if the comment array already
    // handled it.
    state8053.lastCommentStart >= start8781) {
        return;
    }
    state8053.lastCommentStart = start8781;
    comment8784 = {
        type: type8779,
        value: value8780
    };
    if (extra8055.range) {
        comment8784.range = [start8781, end8782];
    }
    if (extra8055.loc) {
        comment8784.loc = loc8783;
    }
    extra8055.comments.push(comment8784);
    if (extra8055.attachComment) {
        extra8055.leadingComments.push(comment8784);
        extra8055.trailingComments.push(comment8784);
    }
}
function scanComment8187() {
    var comment8785, ch8786, loc8787, start8788, blockComment8789, lineComment8790;
    comment8785 = "";
    blockComment8789 = false;
    lineComment8790 = false;
    while (index8040 < length8047) {
        ch8786 = source8038[index8040];
        if (lineComment8790) {
            ch8786 = source8038[index8040++];
            if (isLineTerminator8062(ch8786.charCodeAt(0))) {
                loc8787.end = {
                    line: lineNumber8041,
                    column: index8040 - lineStart8042 - 1
                };
                lineComment8790 = false;
                addComment8186("Line", comment8785, start8788, index8040 - 1, loc8787);
                if (ch8786 === "\r" && source8038[index8040] === "\n") {
                    ++index8040;
                }
                ++lineNumber8041;
                lineStart8042 = index8040;
                comment8785 = "";
            } else if (index8040 >= length8047) {
                lineComment8790 = false;
                comment8785 += ch8786;
                loc8787.end = {
                    line: lineNumber8041,
                    column: length8047 - lineStart8042
                };
                addComment8186("Line", comment8785, start8788, length8047, loc8787);
            } else {
                comment8785 += ch8786;
            }
        } else if (blockComment8789) {
            if (isLineTerminator8062(ch8786.charCodeAt(0))) {
                if (ch8786 === "\r" && source8038[index8040 + 1] === "\n") {
                    ++index8040;
                    comment8785 += "\r\n";
                } else {
                    comment8785 += ch8786;
                }
                ++lineNumber8041;
                ++index8040;
                lineStart8042 = index8040;
                if (index8040 >= length8047) {
                    throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
                }
            } else {
                ch8786 = source8038[index8040++];
                if (index8040 >= length8047) {
                    throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
                }
                comment8785 += ch8786;
                if (ch8786 === "*") {
                    ch8786 = source8038[index8040];
                    if (ch8786 === "/") {
                        comment8785 = comment8785.substr(0, comment8785.length - 1);
                        blockComment8789 = false;
                        ++index8040;
                        loc8787.end = {
                            line: lineNumber8041,
                            column: index8040 - lineStart8042
                        };
                        addComment8186("Block", comment8785, start8788, index8040, loc8787);
                        comment8785 = "";
                    }
                }
            }
        } else if (ch8786 === "/") {
            ch8786 = source8038[index8040 + 1];
            if (ch8786 === "/") {
                loc8787 = {
                    start: {
                        line: lineNumber8041,
                        column: index8040 - lineStart8042
                    }
                };
                start8788 = index8040;
                index8040 += 2;
                lineComment8790 = true;
                if (index8040 >= length8047) {
                    loc8787.end = {
                        line: lineNumber8041,
                        column: index8040 - lineStart8042
                    };
                    lineComment8790 = false;
                    addComment8186("Line", comment8785, start8788, index8040, loc8787);
                }
            } else if (ch8786 === "*") {
                start8788 = index8040;
                index8040 += 2;
                blockComment8789 = true;
                loc8787 = {
                    start: {
                        line: lineNumber8041,
                        column: index8040 - lineStart8042 - 2
                    }
                };
                if (index8040 >= length8047) {
                    throwError8093({}, Messages8034.UnexpectedToken, "ILLEGAL");
                }
            } else {
                break;
            }
        } else if (isWhiteSpace8061(ch8786.charCodeAt(0))) {
            ++index8040;
        } else if (isLineTerminator8062(ch8786.charCodeAt(0))) {
            ++index8040;
            if (ch8786 === "\r" && source8038[index8040] === "\n") {
                ++index8040;
            }
            ++lineNumber8041;
            lineStart8042 = index8040;
        } else {
            break;
        }
    }
}
function collectToken8188() {
    var start8791, loc8792, token8793, range8794, value8795;
    skipComment8069();
    start8791 = index8040;
    loc8792 = {
        start: {
            line: lineNumber8041,
            column: index8040 - lineStart8042
        }
    };
    token8793 = extra8055.advance();
    loc8792.end = {
        line: lineNumber8041,
        column: index8040 - lineStart8042
    };
    if (token8793.type !== Token8029.EOF) {
        range8794 = [token8793.range[0], token8793.range[1]];
        value8795 = source8038.slice(token8793.range[0], token8793.range[1]);
        extra8055.tokens.push({
            type: TokenName8030[token8793.type],
            value: value8795,
            range: range8794,
            loc: loc8792
        });
    }
    return token8793;
}
function collectRegex8189() {
    var pos8796, loc8797, regex8798, token8799;
    skipComment8069();
    pos8796 = index8040;
    loc8797 = {
        start: {
            line: lineNumber8041,
            column: index8040 - lineStart8042
        }
    };
    regex8798 = extra8055.scanRegExp();
    loc8797.end = {
        line: lineNumber8041,
        column: index8040 - lineStart8042
    };
    if (!extra8055.tokenize) {
        if ( // Pop the previous token, which is likely '/' or '/='
        extra8055.tokens.length > 0) {
            token8799 = extra8055.tokens[extra8055.tokens.length - 1];
            if (token8799.range[0] === pos8796 && token8799.type === "Punctuator") {
                if (token8799.value === "/" || token8799.value === "/=") {
                    extra8055.tokens.pop();
                }
            }
        }
        extra8055.tokens.push({
            type: "RegularExpression",
            value: regex8798.literal,
            range: [pos8796, index8040],
            loc: loc8797
        });
    }
    return regex8798;
}
function filterTokenLocation8190() {
    var i8800,
        entry8801,
        token8802,
        tokens8803 = [];
    for (i8800 = 0; i8800 < extra8055.tokens.length; ++i8800) {
        entry8801 = extra8055.tokens[i8800];
        token8802 = {
            type: entry8801.type,
            value: entry8801.value
        };
        if (extra8055.range) {
            token8802.range = entry8801.range;
        }
        if (extra8055.loc) {
            token8802.loc = entry8801.loc;
        }
        tokens8803.push(token8802);
    }
    extra8055.tokens = tokens8803;
}
function patch8191() {
    if (extra8055.comments) {
        extra8055.skipComment = skipComment8069;
        skipComment8069 = scanComment8187;
    }
    if (typeof extra8055.tokens !== "undefined") {
        extra8055.advance = advance8085;
        extra8055.scanRegExp = scanRegExp8082;
        advance8085 = collectToken8188;
        scanRegExp8082 = collectRegex8189;
    }
}
function unpatch8192() {
    if (typeof extra8055.skipComment === "function") {
        skipComment8069 = extra8055.skipComment;
    }
    if (typeof extra8055.scanRegExp === "function") {
        advance8085 = extra8055.advance;
        scanRegExp8082 = extra8055.scanRegExp;
    }
}
function extend8193(object8804, properties8805) {
    var entry8806,
        result8807 = {};
    for (entry8806 in object8804) {
        if (object8804.hasOwnProperty(entry8806)) {
            result8807[entry8806] = object8804[entry8806];
        }
    }
    for (entry8806 in properties8805) {
        if (properties8805.hasOwnProperty(entry8806)) {
            result8807[entry8806] = properties8805[entry8806];
        }
    }
    return result8807;
}
function tokenize8194(code8808, options8809) {
    var toString8810, token8811, tokens8812;
    toString8810 = String;
    if (typeof code8808 !== "string" && !(code8808 instanceof String)) {
        code8808 = toString8810(code8808);
    }
    delegate8048 = SyntaxTreeDelegate8036;
    source8038 = code8808;
    index8040 = 0;
    lineNumber8041 = source8038.length > 0 ? 1 : 0;
    lineStart8042 = 0;
    length8047 = source8038.length;
    lookahead8051 = null;
    state8053 = {
        allowKeyword: true,
        allowIn: true,
        labelSet: {},
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        lastCommentStart: -1
    };
    extra8055 = {};
    // Options matching.
    options8809 = options8809 || {};
    // Of course we collect tokens here.
    options8809.tokens = true;
    extra8055.tokens = [];
    extra8055.tokenize = true;
    // The following two fields are necessary to compute the Regex tokens.
    extra8055.openParenToken = -1;
    extra8055.openCurlyToken = -1;
    extra8055.range = typeof options8809.range === "boolean" && options8809.range;
    extra8055.loc = typeof options8809.loc === "boolean" && options8809.loc;
    if (typeof options8809.comment === "boolean" && options8809.comment) {
        extra8055.comments = [];
    }
    if (typeof options8809.tolerant === "boolean" && options8809.tolerant) {
        extra8055.errors = [];
    }
    if (length8047 > 0) {
        if (typeof source8038[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code8808 instanceof String) {
                source8038 = code8808.valueOf();
            }
        }
    }
    patch8191();
    try {
        peek8087();
        if (lookahead8051.type === Token8029.EOF) {
            return extra8055.tokens;
        }
        token8811 = lex8086();
        while (lookahead8051.type !== Token8029.EOF) {
            try {
                token8811 = lex8086();
            } catch (lexError8813) {
                token8811 = lookahead8051;
                if (extra8055.errors) {
                    extra8055.errors.push(lexError8813);
                    // We have to break on the first error
                    // to avoid infinite loops.
                    break;
                } else {
                    throw lexError8813;
                }
            }
        }
        filterTokenLocation8190();
        tokens8812 = extra8055.tokens;
        if (typeof extra8055.comments !== "undefined") {
            tokens8812.comments = extra8055.comments;
        }
        if (typeof extra8055.errors !== "undefined") {
            tokens8812.errors = extra8055.errors;
        }
    } catch (e8814) {
        throw e8814;
    } finally {
        unpatch8192();
        extra8055 = {};
    }
    return tokens8812;
}
function blockAllowed8195(toks8815, start8816, inExprDelim8817, parentIsBlock8818) {
    var assignOps8819 = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", ","];
    var binaryOps8820 = ["+", "-", "*", "/", "%", "<<", ">>", ">>>", "&", "|", "^", "&&", "||", "?", ":", "===", "==", ">=", "<=", "<", ">", "!=", "!==", "instanceof"];
    var unaryOps8821 = ["++", "--", "~", "!", "delete", "void", "typeof", "yield", "throw", "new"];
    function back8822(n8823) {
        var idx8824 = toks8815.length - n8823 > 0 ? toks8815.length - n8823 : 0;
        return toks8815[idx8824];
    }
    if (inExprDelim8817 && toks8815.length - (start8816 + 2) <= 0) {
        // ... ({...} ...)
        return false;
    } else if (back8822(start8816 + 2).value === ":" && parentIsBlock8818) {
        // ...{a:{b:{...}}}
        return true;
    } else if (isIn8057(back8822(start8816 + 2).value, unaryOps8821.concat(binaryOps8820).concat(assignOps8819))) {
        // ... + {...}
        return false;
    } else if (back8822(start8816 + 2).value === "return") {
        var // ASI makes `{}` a block in:
        //
        //    return
        //    { ... }
        //
        // otherwise an object literal, so it's an
        // expression and thus / is divide
        currLineNumber8825 = typeof back8822(start8816 + 1).startLineNumber !== "undefined" ? back8822(start8816 + 1).startLineNumber : back8822(start8816 + 1).lineNumber;
        if (back8822(start8816 + 2).lineNumber !== currLineNumber8825) {
            return true;
        } else {
            return false;
        }
    } else if (isIn8057(back8822(start8816 + 2).value, ["void", "typeof", "in", "case", "delete"])) {
        // ... in {}
        return false;
    } else {
        return true;
    }
}
var // Readtables
readtables8196 = {
    currentReadtable: {},
    // A readtable is invoked within `readToken`, but it can
    // return multiple tokens. We need to "queue" the stream of
    // tokens so that subsequent calls to `readToken` gets the
    // rest of the stream.
    queued: [],
    // A readtable can only override punctuators
    punctuators: ";,.:!?~=%&*+-/<>^|#@",
    has: function has(ch8826) {
        return readtables8196.currentReadtable[ch8826] && readtables8196.punctuators.indexOf(ch8826) !== -1;
    },
    getQueued: function getQueued() {
        return readtables8196.queued.length ? readtables8196.queued.shift() : null;
    },
    peekQueued: function peekQueued(lookahead8827) {
        lookahead8827 = lookahead8827 ? lookahead8827 : 1;
        return readtables8196.queued.length ? readtables8196.queued[lookahead8827 - 1] : null;
    },
    invoke: function invoke(ch8828, toks8829) {
        var prevState8830 = snapshotParserState8197();
        var newStream8831 = readtables8196.currentReadtable[ch8828](ch8828, readtables8196.readerAPI, toks8829, source8038, index8040);
        if (!newStream8831) {
            // Reset the state
            restoreParserState8198(prevState8830);
            return null;
        } else if (!Array.isArray(newStream8831)) {
            newStream8831 = [newStream8831];
        }
        this.queued = this.queued.concat(newStream8831);
        return this.getQueued();
    }
};
function snapshotParserState8197() {
    return {
        index: index8040,
        lineNumber: lineNumber8041,
        lineStart: lineStart8042
    };
}
function restoreParserState8198(prevState8832) {
    index8040 = prevState8832.index;
    lineNumber8041 = prevState8832.lineNumber;
    lineStart8042 = prevState8832.lineStart;
}
function suppressReadError8199(func8833) {
    var prevState8834 = snapshotParserState8197();
    try {
        return func8833();
    } catch (e8835) {
        if (!(e8835 instanceof SyntaxError) && !(e8835 instanceof TypeError)) {
            restoreParserState8198(prevState8834);
            return null;
        }
        throw e8835;
    }
}
function makeIdentifier8200(value8836, opts8837) {
    opts8837 = opts8837 || {};
    var type8838 = Token8029.Identifier;
    if (isKeyword8068(value8836)) {
        type8838 = Token8029.Keyword;
    } else if (value8836 === "null") {
        type8838 = Token8029.NullLiteral;
    } else if (value8836 === "true" || value8836 === "false") {
        type8838 = Token8029.BooleanLiteral;
    }
    return {
        type: type8838,
        value: value8836,
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [opts8837.start || index8040, index8040]
    };
}
function makePunctuator8201(value8839, opts8840) {
    opts8840 = opts8840 || {};
    return {
        type: Token8029.Punctuator,
        value: value8839,
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [opts8840.start || index8040, index8040]
    };
}
function makeStringLiteral8202(value8841, opts8842) {
    opts8842 = opts8842 || {};
    return {
        type: Token8029.StringLiteral,
        value: value8841,
        octal: !!opts8842.octal,
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [opts8842.start || index8040, index8040]
    };
}
function makeNumericLiteral8203(value8843, opts8844) {
    opts8844 = opts8844 || {};
    return {
        type: Token8029.NumericLiteral,
        value: value8843,
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [opts8844.start || index8040, index8040]
    };
}
function makeRegExp8204(value8845, opts8846) {
    opts8846 = opts8846 || {};
    return {
        type: Token8029.RegularExpression,
        value: value8845,
        literal: value8845.toString(),
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [opts8846.start || index8040, index8040]
    };
}
function makeDelimiter8205(value8847, inner8848) {
    var current8849 = {
        lineNumber: lineNumber8041,
        lineStart: lineStart8042,
        range: [index8040, index8040]
    };
    var firstTok8850 = inner8848.length ? inner8848[0] : current8849;
    var lastTok8851 = inner8848.length ? inner8848[inner8848.length - 1] : current8849;
    return {
        type: Token8029.Delimiter,
        value: value8847,
        inner: inner8848,
        startLineNumber: firstTok8850.lineNumber,
        startLineStart: firstTok8850.lineStart,
        startRange: firstTok8850.range,
        endLineNumber: lastTok8851.lineNumber,
        endLineStart: lastTok8851.lineStart,
        endRange: lastTok8851.range
    };
}
var // Since an actual parser object doesn't exist and we want to
// introduce our own API anyway, we create a special reader object
// for reader extensions
readerAPI8206 = Object.defineProperties({
    Token: Token8029,
    isIdentifierStart: isIdentifierStart8063,
    isIdentifierPart: isIdentifierPart8064,
    isLineTerminator: isLineTerminator8062,
    readIdentifier: scanIdentifier8074,
    readPunctuator: scanPunctuator8075,
    readStringLiteral: scanStringLiteral8079,
    readNumericLiteral: scanNumericLiteral8078,
    readRegExp: scanRegExp8082,
    readToken: function readToken() {
        return readToken8207([], false, false);
    },
    readDelimiter: function readDelimiter() {
        return readDelim8208([], false, false);
    },
    skipComment: scanComment8187,
    makeIdentifier: makeIdentifier8200,
    makePunctuator: makePunctuator8201,
    makeStringLiteral: makeStringLiteral8202,
    makeNumericLiteral: makeNumericLiteral8203,
    makeRegExp: makeRegExp8204,
    makeDelimiter: makeDelimiter8205,
    suppressReadError: suppressReadError8199,
    peekQueued: readtables8196.peekQueued,
    getQueued: readtables8196.getQueued
}, {
    source: {
        get: function () {
            return source8038;
        },
        enumerable: true,
        configurable: true
    },
    index: {
        get: function () {
            return index8040;
        },
        set: function (x) {
            index8040 = x;
        },
        enumerable: true,
        configurable: true
    },
    length: {
        get: function () {
            return length8047;
        },
        set: function (x) {
            length8047 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineNumber: {
        get: function () {
            return lineNumber8041;
        },
        set: function (x) {
            lineNumber8041 = x;
        },
        enumerable: true,
        configurable: true
    },
    lineStart: {
        get: function () {
            return lineStart8042;
        },
        set: function (x) {
            lineStart8042 = x;
        },
        enumerable: true,
        configurable: true
    },
    extra: {
        get: function () {
            return extra8055;
        },
        enumerable: true,
        configurable: true
    }
});
readtables8196.readerAPI = readerAPI8206;
function readToken8207(toks8852, inExprDelim8853, parentIsBlock8854) {
    var delimiters8855 = ["(", "{", "["];
    var parenIdents8856 = ["if", "while", "for", "with"];
    var last8857 = toks8852.length - 1;
    var comments8858,
        commentsLen8859 = extra8055.comments.length;
    function back8860(n8866) {
        var idx8867 = toks8852.length - n8866 > 0 ? toks8852.length - n8866 : 0;
        return toks8852[idx8867];
    }
    function attachComments8861(token8868) {
        if (comments8858) {
            token8868.leadingComments = comments8858;
        }
        return token8868;
    }
    function _advance8862() {
        return attachComments8861(advance8085());
    }
    function _scanRegExp8863() {
        return attachComments8861(scanRegExp8082());
    }
    skipComment8069();
    var ch8864 = source8038[index8040];
    if (extra8055.comments.length > commentsLen8859) {
        comments8858 = extra8055.comments.slice(commentsLen8859);
    }
    if (isIn8057(source8038[index8040], delimiters8855)) {
        return attachComments8861(readDelim8208(toks8852, inExprDelim8853, parentIsBlock8854));
    }
    // Check if we should get the token from the readtable
    var readtableToken8865;
    if ((readtableToken8865 = readtables8196.getQueued()) || readtables8196.has(ch8864) && (readtableToken8865 = readtables8196.invoke(ch8864, toks8852))) {
        return readtableToken8865;
    }
    if (ch8864 === "/") {
        var prev8869 = back8860(1);
        if (prev8869) {
            if (prev8869.value === "()") {
                if (isIn8057(back8860(2).value, parenIdents8856)) {
                    // ... if (...) / ...
                    return _scanRegExp8863();
                }
                // ... (...) / ...
                return _advance8862();
            }
            if (prev8869.value === "{}") {
                if (blockAllowed8195(toks8852, 0, inExprDelim8853, parentIsBlock8854)) {
                    if (back8860(2).value === "()") {
                        if ( // named function
                        back8860(4).value === "function") {
                            if (!blockAllowed8195(toks8852, 3, inExprDelim8853, parentIsBlock8854)) {
                                // new function foo (...) {...} / ...
                                return _advance8862();
                            }
                            if (toks8852.length - 5 <= 0 && inExprDelim8853) {
                                // (function foo (...) {...} /...)
                                // [function foo (...) {...} /...]
                                return _advance8862();
                            }
                        }
                        if ( // unnamed function
                        back8860(3).value === "function") {
                            if (!blockAllowed8195(toks8852, 2, inExprDelim8853, parentIsBlock8854)) {
                                // new function (...) {...} / ...
                                return _advance8862();
                            }
                            if (toks8852.length - 4 <= 0 && inExprDelim8853) {
                                // (function (...) {...} /...)
                                // [function (...) {...} /...]
                                return _advance8862();
                            }
                        }
                    }
                    // ...; {...} /...
                    return _scanRegExp8863();
                } else {
                    // ... + {...} / ...
                    return _advance8862();
                }
            }
            if (prev8869.type === Token8029.Punctuator) {
                // ... + /...
                return _scanRegExp8863();
            }
            if (isKeyword8068(prev8869.value) && prev8869.value !== "this" && prev8869.value !== "let" && prev8869.value !== "export") {
                // typeof /...
                return _scanRegExp8863();
            }
            return _advance8862();
        }
        return _scanRegExp8863();
    }
    return _advance8862();
}
function readDelim8208(toks8870, inExprDelim8871, parentIsBlock8872) {
    var startDelim8873 = advance8085(),
        matchDelim8874 = {
        "(": ")",
        "{": "}",
        "[": "]"
    },
        inner8875 = [];
    var delimiters8876 = ["(", "{", "["];
    assert8056(delimiters8876.indexOf(startDelim8873.value) !== -1, "Need to begin at the delimiter");
    var token8877 = startDelim8873;
    var startLineNumber8878 = token8877.lineNumber;
    var startLineStart8879 = token8877.lineStart;
    var startRange8880 = token8877.range;
    var delimToken8881 = {};
    delimToken8881.type = Token8029.Delimiter;
    delimToken8881.value = startDelim8873.value + matchDelim8874[startDelim8873.value];
    delimToken8881.startLineNumber = startLineNumber8878;
    delimToken8881.startLineStart = startLineStart8879;
    delimToken8881.startRange = startRange8880;
    var delimIsBlock8882 = false;
    if (startDelim8873.value === "{") {
        delimIsBlock8882 = blockAllowed8195(toks8870.concat(delimToken8881), 0, inExprDelim8871, parentIsBlock8872);
    }
    while (index8040 <= length8047) {
        token8877 = readToken8207(inner8875, startDelim8873.value === "(" || startDelim8873.value === "[", delimIsBlock8882);
        if (token8877.type === Token8029.Punctuator && token8877.value === matchDelim8874[startDelim8873.value]) {
            if (token8877.leadingComments) {
                delimToken8881.trailingComments = token8877.leadingComments;
            }
            break;
        } else if (token8877.type === Token8029.EOF) {
            throwError8093({}, Messages8034.UnexpectedEOS);
        } else {
            inner8875.push(token8877);
        }
    }
    if ( // at the end of the stream but the very last char wasn't the closing delimiter
    index8040 >= length8047 && matchDelim8874[startDelim8873.value] !== source8038[length8047 - 1]) {
        throwError8093({}, Messages8034.UnexpectedEOS);
    }
    var endLineNumber8883 = token8877.lineNumber;
    var endLineStart8884 = token8877.lineStart;
    var endRange8885 = token8877.range;
    delimToken8881.inner = inner8875;
    delimToken8881.endLineNumber = endLineNumber8883;
    delimToken8881.endLineStart = endLineStart8884;
    delimToken8881.endRange = endRange8885;
    return delimToken8881;
}
function setReadtable8209(readtable8886, syn8887) {
    readtables8196.currentReadtable = readtable8886;
    if (syn8887) {
        readtables8196.readerAPI.throwSyntaxError = function (name8888, message8889, tok8890) {
            var sx8891 = syn8887.syntaxFromToken(tok8890);
            var err8892 = new syn8887.MacroSyntaxError(name8888, message8889, sx8891);
            throw new SyntaxError(syn8887.printSyntaxError(source8038, err8892));
        };
    }
}
function currentReadtable8210() {
    return readtables8196.currentReadtable;
}
function read8211(code8893) {
    var token8894,
        tokenTree8895 = [];
    extra8055 = {};
    extra8055.comments = [];
    extra8055.range = true;
    extra8055.loc = true;
    patch8191();
    source8038 = code8893;
    index8040 = 0;
    lineNumber8041 = source8038.length > 0 ? 1 : 0;
    lineStart8042 = 0;
    length8047 = source8038.length;
    state8053 = {
        allowIn: true,
        labelSet: {},
        lastParenthesized: null,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false
    };
    while (index8040 < length8047 || readtables8196.peekQueued()) {
        tokenTree8895.push(readToken8207(tokenTree8895, false, false));
    }
    var last8896 = tokenTree8895[tokenTree8895.length - 1];
    if (last8896 && last8896.type !== Token8029.EOF) {
        tokenTree8895.push({
            type: Token8029.EOF,
            value: "",
            lineNumber: last8896.lineNumber,
            lineStart: last8896.lineStart,
            range: [index8040, index8040]
        });
    }
    return expander8028.tokensToSyntax(tokenTree8895);
}
function parse8212(code8897, options8898) {
    var program8899, toString8900;
    extra8055 = {};
    if ( // given an array of tokens instead of a string
    Array.isArray(code8897)) {
        tokenStream8049 = code8897;
        length8047 = tokenStream8049.length;
        lineNumber8041 = tokenStream8049.length > 0 ? 1 : 0;
        source8038 = undefined;
    } else {
        toString8900 = String;
        if (typeof code8897 !== "string" && !(code8897 instanceof String)) {
            code8897 = toString8900(code8897);
        }
        source8038 = code8897;
        length8047 = source8038.length;
        lineNumber8041 = source8038.length > 0 ? 1 : 0;
    }
    delegate8048 = SyntaxTreeDelegate8036;
    streamIndex8050 = -1;
    index8040 = 0;
    lineStart8042 = 0;
    sm_lineStart8044 = 0;
    sm_lineNumber8043 = lineNumber8041;
    sm_index8046 = 0;
    sm_range8045 = [0, 0];
    lookahead8051 = null;
    phase8054 = options8898 && typeof options8898.phase !== "undefined" ? options8898.phase : 0;
    state8053 = {
        allowKeyword: false,
        allowIn: true,
        labelSet: {},
        parenthesizedCount: 0,
        inFunctionBody: false,
        inIteration: false,
        inSwitch: false,
        yieldAllowed: false
    };
    extra8055.attachComment = true;
    extra8055.range = true;
    extra8055.comments = [];
    extra8055.bottomRightStack = [];
    extra8055.trailingComments = [];
    extra8055.leadingComments = [];
    if (typeof options8898 !== "undefined") {
        extra8055.range = typeof options8898.range === "boolean" && options8898.range;
        extra8055.loc = typeof options8898.loc === "boolean" && options8898.loc;
        extra8055.attachComment = typeof options8898.attachComment === "boolean" && options8898.attachComment;
        if (extra8055.loc && options8898.source !== null && options8898.source !== undefined) {
            delegate8048 = extend8193(delegate8048, {
                postProcess: function (node8901) {
                    node8901.loc.source = toString8900(options8898.source);
                    return node8901;
                }
            });
        }
        if (typeof options8898.tokens === "boolean" && options8898.tokens) {
            extra8055.tokens = [];
        }
        if (typeof options8898.comment === "boolean" && options8898.comment) {
            extra8055.comments = [];
        }
        if (typeof options8898.tolerant === "boolean" && options8898.tolerant) {
            extra8055.errors = [];
        }
    }
    if (length8047 > 0) {
        if (source8038 && typeof source8038[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code8897 instanceof String) {
                source8038 = code8897.valueOf();
            }
        }
    }
    extra8055.loc = true;
    extra8055.errors = [];
    patch8191();
    try {
        program8899 = parseProgram8185();
        if (typeof extra8055.comments !== "undefined") {
            program8899.comments = extra8055.comments;
        }
        if (typeof extra8055.tokens !== "undefined") {
            filterTokenLocation8190();
            program8899.tokens = extra8055.tokens;
        }
        if (typeof extra8055.errors !== "undefined") {
            program8899.errors = extra8055.errors;
        }
    } catch (e8902) {
        throw e8902;
    } finally {
        unpatch8192();
        extra8055 = {};
    }
    return program8899;
}
exports.tokenize = tokenize8194;
exports.read = read8211;
exports.Token = Token8029;
exports.setReadtable = setReadtable8209;
exports.currentReadtable = currentReadtable8210;
exports.parse = parse8212;
// Deep copy.
exports.Syntax = (function () {
    var name8903,
        types8904 = {};
    if (typeof Object.create === "function") {
        types8904 = Object.create(null);
    }
    for (name8903 in Syntax8032) {
        if (Syntax8032.hasOwnProperty(name8903)) {
            types8904[name8903] = Syntax8032[name8903];
        }
    }
    if (typeof Object.freeze === "function") {
        Object.freeze(types8904);
    }
    return types8904;
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