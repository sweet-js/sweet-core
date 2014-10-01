(function (root$2316, factory$2317) {
    'use strict';
    if (// Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
        // Rhino, and plain browser loading.
        typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$2317);
    } else if (typeof exports !== 'undefined') {
        factory$2317(exports, require('./expander'));
    } else {
        factory$2317(root$2316.esprima = {});
    }
}(this, function (exports$2318, expander$2319) {
    'use strict';
    var Token$2320, TokenName$2321, FnExprTokens$2322, Syntax$2323, PropertyKind$2324, Messages$2325, Regex$2326, SyntaxTreeDelegate$2327, ClassPropertyType$2328, source$2329, strict$2330, index$2331, lineNumber$2332, lineStart$2333, sm_lineNumber$2334, sm_lineStart$2335, sm_range$2336, sm_index$2337, length$2338, delegate$2339, tokenStream$2340, streamIndex$2341, lookahead$2342, lookaheadIndex$2343, state$2344, phase$2345, extra$2346;
    Token$2320 = {
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
    TokenName$2321 = {};
    TokenName$2321[Token$2320.BooleanLiteral] = 'Boolean';
    TokenName$2321[Token$2320.EOF] = '<end>';
    TokenName$2321[Token$2320.Identifier] = 'Identifier';
    TokenName$2321[Token$2320.Keyword] = 'Keyword';
    TokenName$2321[Token$2320.NullLiteral] = 'Null';
    TokenName$2321[Token$2320.NumericLiteral] = 'Numeric';
    TokenName$2321[Token$2320.Punctuator] = 'Punctuator';
    TokenName$2321[Token$2320.StringLiteral] = 'String';
    TokenName$2321[Token$2320.RegularExpression] = 'RegularExpression';
    TokenName$2321[Token$2320.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$2322 = [
        '(',
        '{',
        '[',
        'in',
        'typeof',
        'instanceof',
        'new',
        'return',
        'case',
        'delete',
        'throw',
        'void',
        // assignment operators
        '=',
        '+=',
        '-=',
        '*=',
        '/=',
        '%=',
        '<<=',
        '>>=',
        '>>>=',
        '&=',
        '|=',
        '^=',
        ',',
        // binary/unary operators
        '+',
        '-',
        '*',
        '/',
        '%',
        '++',
        '--',
        '<<',
        '>>',
        '>>>',
        '&',
        '|',
        '^',
        '!',
        '~',
        '&&',
        '||',
        '?',
        ':',
        '===',
        '==',
        '>=',
        '<=',
        '<',
        '>',
        '!=',
        '!=='
    ];
    Syntax$2323 = {
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        AssignmentExpression: 'AssignmentExpression',
        BinaryExpression: 'BinaryExpression',
        BlockStatement: 'BlockStatement',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExportDeclaration: 'ExportDeclaration',
        ExportBatchSpecifier: 'ExportBatchSpecifier',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        ForStatement: 'ForStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        ImportSpecifier: 'ImportSpecifier',
        LabeledStatement: 'LabeledStatement',
        Literal: 'Literal',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        ModuleDeclaration: 'ModuleDeclaration',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        SwitchCase: 'SwitchCase',
        SwitchStatement: 'SwitchStatement',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };
    PropertyKind$2324 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$2328 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$2325 = {
        UnexpectedToken: 'Unexpected token %0',
        UnexpectedNumber: 'Unexpected number',
        UnexpectedString: 'Unexpected string',
        UnexpectedIdentifier: 'Unexpected identifier',
        UnexpectedReserved: 'Unexpected reserved word',
        UnexpectedTemplate: 'Unexpected quasi %0',
        UnexpectedEOS: 'Unexpected end of input',
        NewlineAfterThrow: 'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp: 'Invalid regular expression: missing /',
        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
        InvalidLHSInFormalsList: 'Invalid left-hand side in formals list',
        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
        NoCatchOrFinally: 'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalDuplicateClassProperty: 'Illegal duplicate property in class definition',
        IllegalReturn: 'Illegal return statement',
        IllegalYield: 'Illegal yield expression',
        IllegalSpread: 'Illegal spread element',
        StrictModeWith: 'Strict mode code may not include a with statement',
        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        ParameterAfterRestParameter: 'Rest parameter must be final parameter of an argument list',
        DefaultRestParameter: 'Rest parameter can not have a default value',
        ElementAfterSpreadElement: 'Spread must be the final element of an element list',
        ObjectPatternAsRestParameter: 'Invalid rest parameter',
        ObjectPatternAsSpread: 'Invalid spread argument',
        StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
        StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
        StrictDelete: 'Delete of an unqualified identifier in strict mode.',
        StrictDuplicateProperty: 'Duplicate data property in object literal not allowed in strict mode',
        AccessorDataProperty: 'Object literal may not have data and accessor property with the same name',
        AccessorGetSet: 'Object literal may not have multiple get/set accessors with the same name',
        StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictReservedWord: 'Use of future reserved word in strict mode',
        NewlineAfterModule: 'Illegal newline after module',
        NoFromAfterImport: 'Missing from after import',
        InvalidModuleSpecifier: 'Invalid module specifier',
        NestedModule: 'Module declaration can not be nested',
        NoUnintializedConst: 'Const must be initialized',
        ComprehensionRequiresBlock: 'Comprehension must have at least one block',
        ComprehensionError: 'Comprehension Error',
        EachNotAllowed: 'Each is not supported',
        UnmatchedDelimiter: 'Unmatched Delimiter'
    };
    // See also tools/generate-unicode-regex.py.
    Regex$2326 = {
        NonAsciiIdentifierStart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]'),
        NonAsciiIdentifierPart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]')
    };
    function assert$2347(condition$2504, message$2505) {
        if (!condition$2504) {
            throw new Error('ASSERT: ' + message$2505);
        }
    }
    function isIn$2348(el$2506, list$2507) {
        return list$2507.indexOf(el$2506) !== -1;
    }
    function isDecimalDigit$2349(ch$2508) {
        return ch$2508 >= 48 && ch$2508 <= 57;
    }
    function isHexDigit$2350(ch$2509) {
        return '0123456789abcdefABCDEF'.indexOf(ch$2509) >= 0;
    }
    function isOctalDigit$2351(ch$2510) {
        return '01234567'.indexOf(ch$2510) >= 0;
    }
    function isWhiteSpace$2352(ch$2511) {
        return ch$2511 === 32 || // space
        ch$2511 === 9 || // tab
        ch$2511 === 11 || ch$2511 === 12 || ch$2511 === 160 || ch$2511 >= 5760 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch$2511)) > 0;
    }
    function isLineTerminator$2353(ch$2512) {
        return ch$2512 === 10 || ch$2512 === 13 || ch$2512 === 8232 || ch$2512 === 8233;
    }
    function isIdentifierStart$2354(ch$2513) {
        return ch$2513 === 36 || ch$2513 === 95 || // $ (dollar) and _ (underscore)
        ch$2513 >= 65 && ch$2513 <= 90 || // A..Z
        ch$2513 >= 97 && ch$2513 <= 122 || // a..z
        ch$2513 === 92 || // \ (backslash)
        ch$2513 >= 128 && Regex$2326.NonAsciiIdentifierStart.test(String.fromCharCode(ch$2513));
    }
    function isIdentifierPart$2355(ch$2514) {
        return ch$2514 === 36 || ch$2514 === 95 || // $ (dollar) and _ (underscore)
        ch$2514 >= 65 && ch$2514 <= 90 || // A..Z
        ch$2514 >= 97 && ch$2514 <= 122 || // a..z
        ch$2514 >= 48 && ch$2514 <= 57 || // 0..9
        ch$2514 === 92 || // \ (backslash)
        ch$2514 >= 128 && Regex$2326.NonAsciiIdentifierPart.test(String.fromCharCode(ch$2514));
    }
    function isFutureReservedWord$2356(id$2515) {
        switch (id$2515) {
        case 'class':
        case 'enum':
        case 'export':
        case 'extends':
        case 'import':
        case 'super':
            return true;
        default:
            return false;
        }
    }
    function isStrictModeReservedWord$2357(id$2516) {
        switch (id$2516) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'yield':
        case 'let':
            return true;
        default:
            return false;
        }
    }
    function isRestrictedWord$2358(id$2517) {
        return id$2517 === 'eval' || id$2517 === 'arguments';
    }
    function isKeyword$2359(id$2518) {
        if (strict$2330 && isStrictModeReservedWord$2357(id$2518)) {
            return true;
        }
        switch (// 'const' is specialized as Keyword in V8.
            // 'yield' is only treated as a keyword in strict mode.
            // 'let' is for compatiblity with SpiderMonkey and ES.next.
            // Some others are from future reserved words.
            id$2518.length) {
        case 2:
            return id$2518 === 'if' || id$2518 === 'in' || id$2518 === 'do';
        case 3:
            return id$2518 === 'var' || id$2518 === 'for' || id$2518 === 'new' || id$2518 === 'try' || id$2518 === 'let';
        case 4:
            return id$2518 === 'this' || id$2518 === 'else' || id$2518 === 'case' || id$2518 === 'void' || id$2518 === 'with' || id$2518 === 'enum';
        case 5:
            return id$2518 === 'while' || id$2518 === 'break' || id$2518 === 'catch' || id$2518 === 'throw' || id$2518 === 'const' || id$2518 === 'class' || id$2518 === 'super';
        case 6:
            return id$2518 === 'return' || id$2518 === 'typeof' || id$2518 === 'delete' || id$2518 === 'switch' || id$2518 === 'export' || id$2518 === 'import';
        case 7:
            return id$2518 === 'default' || id$2518 === 'finally' || id$2518 === 'extends';
        case 8:
            return id$2518 === 'function' || id$2518 === 'continue' || id$2518 === 'debugger';
        case 10:
            return id$2518 === 'instanceof';
        default:
            return false;
        }
    }
    function skipComment$2360() {
        var ch$2519, blockComment$2520, lineComment$2521;
        blockComment$2520 = false;
        lineComment$2521 = false;
        while (index$2331 < length$2338) {
            ch$2519 = source$2329.charCodeAt(index$2331);
            if (lineComment$2521) {
                ++index$2331;
                if (isLineTerminator$2353(ch$2519)) {
                    lineComment$2521 = false;
                    if (ch$2519 === 13 && source$2329.charCodeAt(index$2331) === 10) {
                        ++index$2331;
                    }
                    ++lineNumber$2332;
                    lineStart$2333 = index$2331;
                }
            } else if (blockComment$2520) {
                if (isLineTerminator$2353(ch$2519)) {
                    if (ch$2519 === 13 && source$2329.charCodeAt(index$2331 + 1) === 10) {
                        ++index$2331;
                    }
                    ++lineNumber$2332;
                    ++index$2331;
                    lineStart$2333 = index$2331;
                    if (index$2331 >= length$2338) {
                        throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$2519 = source$2329.charCodeAt(index$2331++);
                    if (index$2331 >= length$2338) {
                        throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                    }
                    if (// Block comment ends with '*/' (char #42, char #47).
                        ch$2519 === 42) {
                        ch$2519 = source$2329.charCodeAt(index$2331);
                        if (ch$2519 === 47) {
                            ++index$2331;
                            blockComment$2520 = false;
                        }
                    }
                }
            } else if (ch$2519 === 47) {
                ch$2519 = source$2329.charCodeAt(index$2331 + 1);
                if (// Line comment starts with '//' (char #47, char #47).
                    ch$2519 === 47) {
                    index$2331 += 2;
                    lineComment$2521 = true;
                } else if (ch$2519 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$2331 += 2;
                    blockComment$2520 = true;
                    if (index$2331 >= length$2338) {
                        throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$2352(ch$2519)) {
                ++index$2331;
            } else if (isLineTerminator$2353(ch$2519)) {
                ++index$2331;
                if (ch$2519 === 13 && source$2329.charCodeAt(index$2331) === 10) {
                    ++index$2331;
                }
                ++lineNumber$2332;
                lineStart$2333 = index$2331;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$2361(prefix$2522) {
        var i$2523, len$2524, ch$2525, code$2526 = 0;
        len$2524 = prefix$2522 === 'u' ? 4 : 2;
        for (i$2523 = 0; i$2523 < len$2524; ++i$2523) {
            if (index$2331 < length$2338 && isHexDigit$2350(source$2329[index$2331])) {
                ch$2525 = source$2329[index$2331++];
                code$2526 = code$2526 * 16 + '0123456789abcdef'.indexOf(ch$2525.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$2526);
    }
    function scanUnicodeCodePointEscape$2362() {
        var ch$2527, code$2528, cu1$2529, cu2$2530;
        ch$2527 = source$2329[index$2331];
        code$2528 = 0;
        if (// At least, one hex digit is required.
            ch$2527 === '}') {
            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
        }
        while (index$2331 < length$2338) {
            ch$2527 = source$2329[index$2331++];
            if (!isHexDigit$2350(ch$2527)) {
                break;
            }
            code$2528 = code$2528 * 16 + '0123456789abcdef'.indexOf(ch$2527.toLowerCase());
        }
        if (code$2528 > 1114111 || ch$2527 !== '}') {
            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
        }
        if (// UTF-16 Encoding
            code$2528 <= 65535) {
            return String.fromCharCode(code$2528);
        }
        cu1$2529 = (code$2528 - 65536 >> 10) + 55296;
        cu2$2530 = (code$2528 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$2529, cu2$2530);
    }
    function getEscapedIdentifier$2363() {
        var ch$2531, id$2532;
        ch$2531 = source$2329.charCodeAt(index$2331++);
        id$2532 = String.fromCharCode(ch$2531);
        if (// '\u' (char #92, char #117) denotes an escaped character.
            ch$2531 === 92) {
            if (source$2329.charCodeAt(index$2331) !== 117) {
                throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
            }
            ++index$2331;
            ch$2531 = scanHexEscape$2361('u');
            if (!ch$2531 || ch$2531 === '\\' || !isIdentifierStart$2354(ch$2531.charCodeAt(0))) {
                throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
            }
            id$2532 = ch$2531;
        }
        while (index$2331 < length$2338) {
            ch$2531 = source$2329.charCodeAt(index$2331);
            if (!isIdentifierPart$2355(ch$2531)) {
                break;
            }
            ++index$2331;
            id$2532 += String.fromCharCode(ch$2531);
            if (// '\u' (char #92, char #117) denotes an escaped character.
                ch$2531 === 92) {
                id$2532 = id$2532.substr(0, id$2532.length - 1);
                if (source$2329.charCodeAt(index$2331) !== 117) {
                    throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                }
                ++index$2331;
                ch$2531 = scanHexEscape$2361('u');
                if (!ch$2531 || ch$2531 === '\\' || !isIdentifierPart$2355(ch$2531.charCodeAt(0))) {
                    throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                }
                id$2532 += ch$2531;
            }
        }
        return id$2532;
    }
    function getIdentifier$2364() {
        var start$2533, ch$2534;
        start$2533 = index$2331++;
        while (index$2331 < length$2338) {
            ch$2534 = source$2329.charCodeAt(index$2331);
            if (ch$2534 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$2331 = start$2533;
                return getEscapedIdentifier$2363();
            }
            if (isIdentifierPart$2355(ch$2534)) {
                ++index$2331;
            } else {
                break;
            }
        }
        return source$2329.slice(start$2533, index$2331);
    }
    function scanIdentifier$2365() {
        var start$2535, id$2536, type$2537;
        start$2535 = index$2331;
        // Backslash (char #92) starts an escaped character.
        id$2536 = source$2329.charCodeAt(index$2331) === 92 ? getEscapedIdentifier$2363() : getIdentifier$2364();
        if (// There is no keyword or literal with only one character.
            // Thus, it must be an identifier.
            id$2536.length === 1) {
            type$2537 = Token$2320.Identifier;
        } else if (isKeyword$2359(id$2536)) {
            type$2537 = Token$2320.Keyword;
        } else if (id$2536 === 'null') {
            type$2537 = Token$2320.NullLiteral;
        } else if (id$2536 === 'true' || id$2536 === 'false') {
            type$2537 = Token$2320.BooleanLiteral;
        } else {
            type$2537 = Token$2320.Identifier;
        }
        return {
            type: type$2537,
            value: id$2536,
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                start$2535,
                index$2331
            ]
        };
    }
    function scanPunctuator$2366() {
        var start$2538 = index$2331, code$2539 = source$2329.charCodeAt(index$2331), code2$2540, ch1$2541 = source$2329[index$2331], ch2$2542, ch3$2543, ch4$2544;
        switch (code$2539) {
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
            ++index$2331;
            if (extra$2346.tokenize) {
                if (code$2539 === 40) {
                    extra$2346.openParenToken = extra$2346.tokens.length;
                } else if (code$2539 === 123) {
                    extra$2346.openCurlyToken = extra$2346.tokens.length;
                }
            }
            return {
                type: Token$2320.Punctuator,
                value: String.fromCharCode(code$2539),
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    start$2538,
                    index$2331
                ]
            };
        default:
            code2$2540 = source$2329.charCodeAt(index$2331 + 1);
            if (// '=' (char #61) marks an assignment or comparison operator.
                code2$2540 === 61) {
                switch (code$2539) {
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
                    index$2331 += 2;
                    return {
                        type: Token$2320.Punctuator,
                        value: String.fromCharCode(code$2539) + String.fromCharCode(code2$2540),
                        lineNumber: lineNumber$2332,
                        lineStart: lineStart$2333,
                        range: [
                            start$2538,
                            index$2331
                        ]
                    };
                case 33:
                case // !
                    61:
                    // =
                    index$2331 += 2;
                    if (// !== and ===
                        source$2329.charCodeAt(index$2331) === 61) {
                        ++index$2331;
                    }
                    return {
                        type: Token$2320.Punctuator,
                        value: source$2329.slice(start$2538, index$2331),
                        lineNumber: lineNumber$2332,
                        lineStart: lineStart$2333,
                        range: [
                            start$2538,
                            index$2331
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$2542 = source$2329[index$2331 + 1];
        ch3$2543 = source$2329[index$2331 + 2];
        ch4$2544 = source$2329[index$2331 + 3];
        if (// 4-character punctuator: >>>=
            ch1$2541 === '>' && ch2$2542 === '>' && ch3$2543 === '>') {
            if (ch4$2544 === '=') {
                index$2331 += 4;
                return {
                    type: Token$2320.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$2332,
                    lineStart: lineStart$2333,
                    range: [
                        start$2538,
                        index$2331
                    ]
                };
            }
        }
        if (// 3-character punctuators: === !== >>> <<= >>=
            ch1$2541 === '>' && ch2$2542 === '>' && ch3$2543 === '>') {
            index$2331 += 3;
            return {
                type: Token$2320.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    start$2538,
                    index$2331
                ]
            };
        }
        if (ch1$2541 === '<' && ch2$2542 === '<' && ch3$2543 === '=') {
            index$2331 += 3;
            return {
                type: Token$2320.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    start$2538,
                    index$2331
                ]
            };
        }
        if (ch1$2541 === '>' && ch2$2542 === '>' && ch3$2543 === '=') {
            index$2331 += 3;
            return {
                type: Token$2320.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    start$2538,
                    index$2331
                ]
            };
        }
        if (ch1$2541 === '.' && ch2$2542 === '.' && ch3$2543 === '.') {
            index$2331 += 3;
            return {
                type: Token$2320.Punctuator,
                value: '...',
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    start$2538,
                    index$2331
                ]
            };
        }
        if (// Other 2-character punctuators: ++ -- << >> && ||
            ch1$2541 === ch2$2542 && '+-<>&|'.indexOf(ch1$2541) >= 0) {
            index$2331 += 2;
            return {
                type: Token$2320.Punctuator,
                value: ch1$2541 + ch2$2542,
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    start$2538,
                    index$2331
                ]
            };
        }
        if (ch1$2541 === '=' && ch2$2542 === '>') {
            index$2331 += 2;
            return {
                type: Token$2320.Punctuator,
                value: '=>',
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    start$2538,
                    index$2331
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$2541) >= 0) {
            ++index$2331;
            return {
                type: Token$2320.Punctuator,
                value: ch1$2541,
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    start$2538,
                    index$2331
                ]
            };
        }
        if (ch1$2541 === '.') {
            ++index$2331;
            return {
                type: Token$2320.Punctuator,
                value: ch1$2541,
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    start$2538,
                    index$2331
                ]
            };
        }
        throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
    }
    function scanHexLiteral$2367(start$2545) {
        var number$2546 = '';
        while (index$2331 < length$2338) {
            if (!isHexDigit$2350(source$2329[index$2331])) {
                break;
            }
            number$2546 += source$2329[index$2331++];
        }
        if (number$2546.length === 0) {
            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$2354(source$2329.charCodeAt(index$2331))) {
            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$2320.NumericLiteral,
            value: parseInt('0x' + number$2546, 16),
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                start$2545,
                index$2331
            ]
        };
    }
    function scanOctalLiteral$2368(prefix$2547, start$2548) {
        var number$2549, octal$2550;
        if (isOctalDigit$2351(prefix$2547)) {
            octal$2550 = true;
            number$2549 = '0' + source$2329[index$2331++];
        } else {
            octal$2550 = false;
            ++index$2331;
            number$2549 = '';
        }
        while (index$2331 < length$2338) {
            if (!isOctalDigit$2351(source$2329[index$2331])) {
                break;
            }
            number$2549 += source$2329[index$2331++];
        }
        if (!octal$2550 && number$2549.length === 0) {
            // only 0o or 0O
            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$2354(source$2329.charCodeAt(index$2331)) || isDecimalDigit$2349(source$2329.charCodeAt(index$2331))) {
            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$2320.NumericLiteral,
            value: parseInt(number$2549, 8),
            octal: octal$2550,
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                start$2548,
                index$2331
            ]
        };
    }
    function scanNumericLiteral$2369() {
        var number$2551, start$2552, ch$2553, octal$2554;
        ch$2553 = source$2329[index$2331];
        assert$2347(isDecimalDigit$2349(ch$2553.charCodeAt(0)) || ch$2553 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$2552 = index$2331;
        number$2551 = '';
        if (ch$2553 !== '.') {
            number$2551 = source$2329[index$2331++];
            ch$2553 = source$2329[index$2331];
            if (// Hex number starts with '0x'.
                // Octal number starts with '0'.
                // Octal number in ES6 starts with '0o'.
                // Binary number in ES6 starts with '0b'.
                number$2551 === '0') {
                if (ch$2553 === 'x' || ch$2553 === 'X') {
                    ++index$2331;
                    return scanHexLiteral$2367(start$2552);
                }
                if (ch$2553 === 'b' || ch$2553 === 'B') {
                    ++index$2331;
                    number$2551 = '';
                    while (index$2331 < length$2338) {
                        ch$2553 = source$2329[index$2331];
                        if (ch$2553 !== '0' && ch$2553 !== '1') {
                            break;
                        }
                        number$2551 += source$2329[index$2331++];
                    }
                    if (number$2551.length === 0) {
                        // only 0b or 0B
                        throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$2331 < length$2338) {
                        ch$2553 = source$2329.charCodeAt(index$2331);
                        if (isIdentifierStart$2354(ch$2553) || isDecimalDigit$2349(ch$2553)) {
                            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$2320.NumericLiteral,
                        value: parseInt(number$2551, 2),
                        lineNumber: lineNumber$2332,
                        lineStart: lineStart$2333,
                        range: [
                            start$2552,
                            index$2331
                        ]
                    };
                }
                if (ch$2553 === 'o' || ch$2553 === 'O' || isOctalDigit$2351(ch$2553)) {
                    return scanOctalLiteral$2368(ch$2553, start$2552);
                }
                if (// decimal number starts with '0' such as '09' is illegal.
                    ch$2553 && isDecimalDigit$2349(ch$2553.charCodeAt(0))) {
                    throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$2349(source$2329.charCodeAt(index$2331))) {
                number$2551 += source$2329[index$2331++];
            }
            ch$2553 = source$2329[index$2331];
        }
        if (ch$2553 === '.') {
            number$2551 += source$2329[index$2331++];
            while (isDecimalDigit$2349(source$2329.charCodeAt(index$2331))) {
                number$2551 += source$2329[index$2331++];
            }
            ch$2553 = source$2329[index$2331];
        }
        if (ch$2553 === 'e' || ch$2553 === 'E') {
            number$2551 += source$2329[index$2331++];
            ch$2553 = source$2329[index$2331];
            if (ch$2553 === '+' || ch$2553 === '-') {
                number$2551 += source$2329[index$2331++];
            }
            if (isDecimalDigit$2349(source$2329.charCodeAt(index$2331))) {
                while (isDecimalDigit$2349(source$2329.charCodeAt(index$2331))) {
                    number$2551 += source$2329[index$2331++];
                }
            } else {
                throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$2354(source$2329.charCodeAt(index$2331))) {
            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$2320.NumericLiteral,
            value: parseFloat(number$2551),
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                start$2552,
                index$2331
            ]
        };
    }
    function scanStringLiteral$2370() {
        var str$2555 = '', quote$2556, start$2557, ch$2558, code$2559, unescaped$2560, restore$2561, octal$2562 = false;
        quote$2556 = source$2329[index$2331];
        assert$2347(quote$2556 === '\'' || quote$2556 === '"', 'String literal must starts with a quote');
        start$2557 = index$2331;
        ++index$2331;
        while (index$2331 < length$2338) {
            ch$2558 = source$2329[index$2331++];
            if (ch$2558 === quote$2556) {
                quote$2556 = '';
                break;
            } else if (ch$2558 === '\\') {
                ch$2558 = source$2329[index$2331++];
                if (!ch$2558 || !isLineTerminator$2353(ch$2558.charCodeAt(0))) {
                    switch (ch$2558) {
                    case 'n':
                        str$2555 += '\n';
                        break;
                    case 'r':
                        str$2555 += '\r';
                        break;
                    case 't':
                        str$2555 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$2329[index$2331] === '{') {
                            ++index$2331;
                            str$2555 += scanUnicodeCodePointEscape$2362();
                        } else {
                            restore$2561 = index$2331;
                            unescaped$2560 = scanHexEscape$2361(ch$2558);
                            if (unescaped$2560) {
                                str$2555 += unescaped$2560;
                            } else {
                                index$2331 = restore$2561;
                                str$2555 += ch$2558;
                            }
                        }
                        break;
                    case 'b':
                        str$2555 += '\b';
                        break;
                    case 'f':
                        str$2555 += '\f';
                        break;
                    case 'v':
                        str$2555 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$2351(ch$2558)) {
                            code$2559 = '01234567'.indexOf(ch$2558);
                            if (// \0 is not octal escape sequence
                                code$2559 !== 0) {
                                octal$2562 = true;
                            }
                            if (index$2331 < length$2338 && isOctalDigit$2351(source$2329[index$2331])) {
                                octal$2562 = true;
                                code$2559 = code$2559 * 8 + '01234567'.indexOf(source$2329[index$2331++]);
                                if (// 3 digits are only allowed when string starts
                                    // with 0, 1, 2, 3
                                    '0123'.indexOf(ch$2558) >= 0 && index$2331 < length$2338 && isOctalDigit$2351(source$2329[index$2331])) {
                                    code$2559 = code$2559 * 8 + '01234567'.indexOf(source$2329[index$2331++]);
                                }
                            }
                            str$2555 += String.fromCharCode(code$2559);
                        } else {
                            str$2555 += ch$2558;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$2332;
                    if (ch$2558 === '\r' && source$2329[index$2331] === '\n') {
                        ++index$2331;
                    }
                    lineStart$2333 = index$2331;
                }
            } else if (isLineTerminator$2353(ch$2558.charCodeAt(0))) {
                break;
            } else {
                str$2555 += ch$2558;
            }
        }
        if (quote$2556 !== '') {
            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$2320.StringLiteral,
            value: str$2555,
            octal: octal$2562,
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                start$2557,
                index$2331
            ]
        };
    }
    function scanTemplate$2371() {
        var cooked$2563 = '', ch$2564, start$2565, terminated$2566, tail$2567, restore$2568, unescaped$2569, code$2570, octal$2571;
        terminated$2566 = false;
        tail$2567 = false;
        start$2565 = index$2331;
        ++index$2331;
        while (index$2331 < length$2338) {
            ch$2564 = source$2329[index$2331++];
            if (ch$2564 === '`') {
                tail$2567 = true;
                terminated$2566 = true;
                break;
            } else if (ch$2564 === '$') {
                if (source$2329[index$2331] === '{') {
                    ++index$2331;
                    terminated$2566 = true;
                    break;
                }
                cooked$2563 += ch$2564;
            } else if (ch$2564 === '\\') {
                ch$2564 = source$2329[index$2331++];
                if (!isLineTerminator$2353(ch$2564.charCodeAt(0))) {
                    switch (ch$2564) {
                    case 'n':
                        cooked$2563 += '\n';
                        break;
                    case 'r':
                        cooked$2563 += '\r';
                        break;
                    case 't':
                        cooked$2563 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$2329[index$2331] === '{') {
                            ++index$2331;
                            cooked$2563 += scanUnicodeCodePointEscape$2362();
                        } else {
                            restore$2568 = index$2331;
                            unescaped$2569 = scanHexEscape$2361(ch$2564);
                            if (unescaped$2569) {
                                cooked$2563 += unescaped$2569;
                            } else {
                                index$2331 = restore$2568;
                                cooked$2563 += ch$2564;
                            }
                        }
                        break;
                    case 'b':
                        cooked$2563 += '\b';
                        break;
                    case 'f':
                        cooked$2563 += '\f';
                        break;
                    case 'v':
                        cooked$2563 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$2351(ch$2564)) {
                            code$2570 = '01234567'.indexOf(ch$2564);
                            if (// \0 is not octal escape sequence
                                code$2570 !== 0) {
                                octal$2571 = true;
                            }
                            if (index$2331 < length$2338 && isOctalDigit$2351(source$2329[index$2331])) {
                                octal$2571 = true;
                                code$2570 = code$2570 * 8 + '01234567'.indexOf(source$2329[index$2331++]);
                                if (// 3 digits are only allowed when string starts
                                    // with 0, 1, 2, 3
                                    '0123'.indexOf(ch$2564) >= 0 && index$2331 < length$2338 && isOctalDigit$2351(source$2329[index$2331])) {
                                    code$2570 = code$2570 * 8 + '01234567'.indexOf(source$2329[index$2331++]);
                                }
                            }
                            cooked$2563 += String.fromCharCode(code$2570);
                        } else {
                            cooked$2563 += ch$2564;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$2332;
                    if (ch$2564 === '\r' && source$2329[index$2331] === '\n') {
                        ++index$2331;
                    }
                    lineStart$2333 = index$2331;
                }
            } else if (isLineTerminator$2353(ch$2564.charCodeAt(0))) {
                ++lineNumber$2332;
                if (ch$2564 === '\r' && source$2329[index$2331] === '\n') {
                    ++index$2331;
                }
                lineStart$2333 = index$2331;
                cooked$2563 += '\n';
            } else {
                cooked$2563 += ch$2564;
            }
        }
        if (!terminated$2566) {
            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$2320.Template,
            value: {
                cooked: cooked$2563,
                raw: source$2329.slice(start$2565 + 1, index$2331 - (tail$2567 ? 1 : 2))
            },
            tail: tail$2567,
            octal: octal$2571,
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                start$2565,
                index$2331
            ]
        };
    }
    function scanTemplateElement$2372(option$2572) {
        var startsWith$2573, template$2574;
        lookahead$2342 = null;
        skipComment$2360();
        startsWith$2573 = option$2572.head ? '`' : '}';
        if (source$2329[index$2331] !== startsWith$2573) {
            throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
        }
        template$2574 = scanTemplate$2371();
        peek$2378();
        return template$2574;
    }
    function scanRegExp$2373() {
        var str$2575, ch$2576, start$2577, pattern$2578, flags$2579, value$2580, classMarker$2581 = false, restore$2582, terminated$2583 = false;
        lookahead$2342 = null;
        skipComment$2360();
        start$2577 = index$2331;
        ch$2576 = source$2329[index$2331];
        assert$2347(ch$2576 === '/', 'Regular expression literal must start with a slash');
        str$2575 = source$2329[index$2331++];
        while (index$2331 < length$2338) {
            ch$2576 = source$2329[index$2331++];
            str$2575 += ch$2576;
            if (classMarker$2581) {
                if (ch$2576 === ']') {
                    classMarker$2581 = false;
                }
            } else {
                if (ch$2576 === '\\') {
                    ch$2576 = source$2329[index$2331++];
                    if (// ECMA-262 7.8.5
                        isLineTerminator$2353(ch$2576.charCodeAt(0))) {
                        throwError$2384({}, Messages$2325.UnterminatedRegExp);
                    }
                    str$2575 += ch$2576;
                } else if (ch$2576 === '/') {
                    terminated$2583 = true;
                    break;
                } else if (ch$2576 === '[') {
                    classMarker$2581 = true;
                } else if (isLineTerminator$2353(ch$2576.charCodeAt(0))) {
                    throwError$2384({}, Messages$2325.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$2583) {
            throwError$2384({}, Messages$2325.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$2578 = str$2575.substr(1, str$2575.length - 2);
        flags$2579 = '';
        while (index$2331 < length$2338) {
            ch$2576 = source$2329[index$2331];
            if (!isIdentifierPart$2355(ch$2576.charCodeAt(0))) {
                break;
            }
            ++index$2331;
            if (ch$2576 === '\\' && index$2331 < length$2338) {
                ch$2576 = source$2329[index$2331];
                if (ch$2576 === 'u') {
                    ++index$2331;
                    restore$2582 = index$2331;
                    ch$2576 = scanHexEscape$2361('u');
                    if (ch$2576) {
                        flags$2579 += ch$2576;
                        for (str$2575 += '\\u'; restore$2582 < index$2331; ++restore$2582) {
                            str$2575 += source$2329[restore$2582];
                        }
                    } else {
                        index$2331 = restore$2582;
                        flags$2579 += 'u';
                        str$2575 += '\\u';
                    }
                } else {
                    str$2575 += '\\';
                }
            } else {
                flags$2579 += ch$2576;
                str$2575 += ch$2576;
            }
        }
        try {
            value$2580 = new RegExp(pattern$2578, flags$2579);
        } catch (e$2584) {
            throwError$2384({}, Messages$2325.InvalidRegExp);
        }
        if (// peek();
            extra$2346.tokenize) {
            return {
                type: Token$2320.RegularExpression,
                value: value$2580,
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    start$2577,
                    index$2331
                ]
            };
        }
        return {
            type: Token$2320.RegularExpression,
            literal: str$2575,
            value: value$2580,
            range: [
                start$2577,
                index$2331
            ]
        };
    }
    function isIdentifierName$2374(token$2585) {
        return token$2585.type === Token$2320.Identifier || token$2585.type === Token$2320.Keyword || token$2585.type === Token$2320.BooleanLiteral || token$2585.type === Token$2320.NullLiteral;
    }
    function advanceSlash$2375() {
        var prevToken$2586, checkToken$2587;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$2586 = extra$2346.tokens[extra$2346.tokens.length - 1];
        if (!prevToken$2586) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$2373();
        }
        if (prevToken$2586.type === 'Punctuator') {
            if (prevToken$2586.value === ')') {
                checkToken$2587 = extra$2346.tokens[extra$2346.openParenToken - 1];
                if (checkToken$2587 && checkToken$2587.type === 'Keyword' && (checkToken$2587.value === 'if' || checkToken$2587.value === 'while' || checkToken$2587.value === 'for' || checkToken$2587.value === 'with')) {
                    return scanRegExp$2373();
                }
                return scanPunctuator$2366();
            }
            if (prevToken$2586.value === '}') {
                if (// Dividing a function by anything makes little sense,
                    // but we have to check for that.
                    extra$2346.tokens[extra$2346.openCurlyToken - 3] && extra$2346.tokens[extra$2346.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$2587 = extra$2346.tokens[extra$2346.openCurlyToken - 4];
                    if (!checkToken$2587) {
                        return scanPunctuator$2366();
                    }
                } else if (extra$2346.tokens[extra$2346.openCurlyToken - 4] && extra$2346.tokens[extra$2346.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$2587 = extra$2346.tokens[extra$2346.openCurlyToken - 5];
                    if (!checkToken$2587) {
                        return scanRegExp$2373();
                    }
                } else {
                    return scanPunctuator$2366();
                }
                if (// checkToken determines whether the function is
                    // a declaration or an expression.
                    FnExprTokens$2322.indexOf(checkToken$2587.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$2366();
                }
                // It is a declaration.
                return scanRegExp$2373();
            }
            return scanRegExp$2373();
        }
        if (prevToken$2586.type === 'Keyword') {
            return scanRegExp$2373();
        }
        return scanPunctuator$2366();
    }
    function advance$2376() {
        var ch$2588;
        skipComment$2360();
        if (index$2331 >= length$2338) {
            return {
                type: Token$2320.EOF,
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    index$2331,
                    index$2331
                ]
            };
        }
        ch$2588 = source$2329.charCodeAt(index$2331);
        if (// Very common: ( and ) and ;
            ch$2588 === 40 || ch$2588 === 41 || ch$2588 === 58) {
            return scanPunctuator$2366();
        }
        if (// String literal starts with single quote (#39) or double quote (#34).
            ch$2588 === 39 || ch$2588 === 34) {
            return scanStringLiteral$2370();
        }
        if (ch$2588 === 96) {
            return scanTemplate$2371();
        }
        if (isIdentifierStart$2354(ch$2588)) {
            return scanIdentifier$2365();
        }
        if (// # and @ are allowed for sweet.js
            ch$2588 === 35 || ch$2588 === 64) {
            ++index$2331;
            return {
                type: Token$2320.Punctuator,
                value: String.fromCharCode(ch$2588),
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    index$2331 - 1,
                    index$2331
                ]
            };
        }
        if (// Dot (.) char #46 can also start a floating-point number, hence the need
            // to check the next character.
            ch$2588 === 46) {
            if (isDecimalDigit$2349(source$2329.charCodeAt(index$2331 + 1))) {
                return scanNumericLiteral$2369();
            }
            return scanPunctuator$2366();
        }
        if (isDecimalDigit$2349(ch$2588)) {
            return scanNumericLiteral$2369();
        }
        if (// Slash (/) char #47 can also start a regex.
            extra$2346.tokenize && ch$2588 === 47) {
            return advanceSlash$2375();
        }
        return scanPunctuator$2366();
    }
    function lex$2377() {
        var token$2589;
        token$2589 = lookahead$2342;
        streamIndex$2341 = lookaheadIndex$2343;
        lineNumber$2332 = token$2589.lineNumber;
        lineStart$2333 = token$2589.lineStart;
        sm_lineNumber$2334 = lookahead$2342.sm_lineNumber;
        sm_lineStart$2335 = lookahead$2342.sm_lineStart;
        sm_range$2336 = lookahead$2342.sm_range;
        sm_index$2337 = lookahead$2342.sm_range[0];
        lookahead$2342 = tokenStream$2340[++streamIndex$2341].token;
        lookaheadIndex$2343 = streamIndex$2341;
        index$2331 = lookahead$2342.range[0];
        if (token$2589.leadingComments) {
            extra$2346.comments = extra$2346.comments.concat(token$2589.leadingComments);
            extra$2346.trailingComments = extra$2346.trailingComments.concat(token$2589.leadingComments);
            extra$2346.leadingComments = extra$2346.leadingComments.concat(token$2589.leadingComments);
        }
        return token$2589;
    }
    function peek$2378() {
        lookaheadIndex$2343 = streamIndex$2341 + 1;
        if (lookaheadIndex$2343 >= length$2338) {
            lookahead$2342 = {
                type: Token$2320.EOF,
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    index$2331,
                    index$2331
                ]
            };
            return;
        }
        lookahead$2342 = tokenStream$2340[lookaheadIndex$2343].token;
        index$2331 = lookahead$2342.range[0];
    }
    function lookahead2$2379() {
        var adv$2590, pos$2591, line$2592, start$2593, result$2594;
        if (streamIndex$2341 + 1 >= length$2338 || streamIndex$2341 + 2 >= length$2338) {
            return {
                type: Token$2320.EOF,
                lineNumber: lineNumber$2332,
                lineStart: lineStart$2333,
                range: [
                    index$2331,
                    index$2331
                ]
            };
        }
        if (// Scan for the next immediate token.
            lookahead$2342 === null) {
            lookaheadIndex$2343 = streamIndex$2341 + 1;
            lookahead$2342 = tokenStream$2340[lookaheadIndex$2343].token;
            index$2331 = lookahead$2342.range[0];
        }
        result$2594 = tokenStream$2340[lookaheadIndex$2343 + 1].token;
        return result$2594;
    }
    function markerCreate$2380() {
        var sm_index$2595 = lookahead$2342 ? lookahead$2342.sm_range[0] : 0;
        var sm_lineStart$2596 = lookahead$2342 ? lookahead$2342.sm_lineStart : 0;
        var sm_lineNumber$2597 = lookahead$2342 ? lookahead$2342.sm_lineNumber : 1;
        if (!extra$2346.loc && !extra$2346.range) {
            return undefined;
        }
        return {
            offset: sm_index$2595,
            line: sm_lineNumber$2597,
            col: sm_index$2595 - sm_lineStart$2596
        };
    }
    function processComment$2381(node$2598) {
        var lastChild$2599, trailingComments$2600, bottomRight$2601 = extra$2346.bottomRightStack, last$2602 = bottomRight$2601[bottomRight$2601.length - 1];
        if (node$2598.type === Syntax$2323.Program) {
            if (node$2598.body.length > 0) {
                return;
            }
        }
        if (extra$2346.trailingComments.length > 0) {
            if (extra$2346.trailingComments[0].range[0] >= node$2598.range[1]) {
                trailingComments$2600 = extra$2346.trailingComments;
                extra$2346.trailingComments = [];
            } else {
                extra$2346.trailingComments.length = 0;
            }
        } else {
            if (last$2602 && last$2602.trailingComments && last$2602.trailingComments[0].range[0] >= node$2598.range[1]) {
                trailingComments$2600 = last$2602.trailingComments;
                delete last$2602.trailingComments;
            }
        }
        if (// Eating the stack.
            last$2602) {
            while (last$2602 && last$2602.range[0] >= node$2598.range[0]) {
                lastChild$2599 = last$2602;
                last$2602 = bottomRight$2601.pop();
            }
        }
        if (lastChild$2599) {
            if (lastChild$2599.leadingComments && lastChild$2599.leadingComments[lastChild$2599.leadingComments.length - 1].range[1] <= node$2598.range[0]) {
                node$2598.leadingComments = lastChild$2599.leadingComments;
                delete lastChild$2599.leadingComments;
            }
        } else if (extra$2346.leadingComments.length > 0 && extra$2346.leadingComments[extra$2346.leadingComments.length - 1].range[1] <= node$2598.range[0]) {
            node$2598.leadingComments = extra$2346.leadingComments;
            extra$2346.leadingComments = [];
        }
        if (trailingComments$2600) {
            node$2598.trailingComments = trailingComments$2600;
        }
        bottomRight$2601.push(node$2598);
    }
    function markerApply$2382(marker$2603, node$2604) {
        if (extra$2346.range) {
            node$2604.range = [
                marker$2603.offset,
                sm_index$2337
            ];
        }
        if (extra$2346.loc) {
            node$2604.loc = {
                start: {
                    line: marker$2603.line,
                    column: marker$2603.col
                },
                end: {
                    line: sm_lineNumber$2334,
                    column: sm_index$2337 - sm_lineStart$2335
                }
            };
            node$2604 = delegate$2339.postProcess(node$2604);
        }
        if (extra$2346.attachComment) {
            processComment$2381(node$2604);
        }
        return node$2604;
    }
    SyntaxTreeDelegate$2327 = {
        name: 'SyntaxTree',
        postProcess: function (node$2605) {
            return node$2605;
        },
        createArrayExpression: function (elements$2606) {
            return {
                type: Syntax$2323.ArrayExpression,
                elements: elements$2606
            };
        },
        createAssignmentExpression: function (operator$2607, left$2608, right$2609) {
            return {
                type: Syntax$2323.AssignmentExpression,
                operator: operator$2607,
                left: left$2608,
                right: right$2609
            };
        },
        createBinaryExpression: function (operator$2610, left$2611, right$2612) {
            var type$2613 = operator$2610 === '||' || operator$2610 === '&&' ? Syntax$2323.LogicalExpression : Syntax$2323.BinaryExpression;
            return {
                type: type$2613,
                operator: operator$2610,
                left: left$2611,
                right: right$2612
            };
        },
        createBlockStatement: function (body$2614) {
            return {
                type: Syntax$2323.BlockStatement,
                body: body$2614
            };
        },
        createBreakStatement: function (label$2615) {
            return {
                type: Syntax$2323.BreakStatement,
                label: label$2615
            };
        },
        createCallExpression: function (callee$2616, args$2617) {
            return {
                type: Syntax$2323.CallExpression,
                callee: callee$2616,
                'arguments': args$2617
            };
        },
        createCatchClause: function (param$2618, body$2619) {
            return {
                type: Syntax$2323.CatchClause,
                param: param$2618,
                body: body$2619
            };
        },
        createConditionalExpression: function (test$2620, consequent$2621, alternate$2622) {
            return {
                type: Syntax$2323.ConditionalExpression,
                test: test$2620,
                consequent: consequent$2621,
                alternate: alternate$2622
            };
        },
        createContinueStatement: function (label$2623) {
            return {
                type: Syntax$2323.ContinueStatement,
                label: label$2623
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$2323.DebuggerStatement };
        },
        createDoWhileStatement: function (body$2624, test$2625) {
            return {
                type: Syntax$2323.DoWhileStatement,
                body: body$2624,
                test: test$2625
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$2323.EmptyStatement };
        },
        createExpressionStatement: function (expression$2626) {
            return {
                type: Syntax$2323.ExpressionStatement,
                expression: expression$2626
            };
        },
        createForStatement: function (init$2627, test$2628, update$2629, body$2630) {
            return {
                type: Syntax$2323.ForStatement,
                init: init$2627,
                test: test$2628,
                update: update$2629,
                body: body$2630
            };
        },
        createForInStatement: function (left$2631, right$2632, body$2633) {
            return {
                type: Syntax$2323.ForInStatement,
                left: left$2631,
                right: right$2632,
                body: body$2633,
                each: false
            };
        },
        createForOfStatement: function (left$2634, right$2635, body$2636) {
            return {
                type: Syntax$2323.ForOfStatement,
                left: left$2634,
                right: right$2635,
                body: body$2636
            };
        },
        createFunctionDeclaration: function (id$2637, params$2638, defaults$2639, body$2640, rest$2641, generator$2642, expression$2643) {
            return {
                type: Syntax$2323.FunctionDeclaration,
                id: id$2637,
                params: params$2638,
                defaults: defaults$2639,
                body: body$2640,
                rest: rest$2641,
                generator: generator$2642,
                expression: expression$2643
            };
        },
        createFunctionExpression: function (id$2644, params$2645, defaults$2646, body$2647, rest$2648, generator$2649, expression$2650) {
            return {
                type: Syntax$2323.FunctionExpression,
                id: id$2644,
                params: params$2645,
                defaults: defaults$2646,
                body: body$2647,
                rest: rest$2648,
                generator: generator$2649,
                expression: expression$2650
            };
        },
        createIdentifier: function (name$2651) {
            return {
                type: Syntax$2323.Identifier,
                name: name$2651
            };
        },
        createIfStatement: function (test$2652, consequent$2653, alternate$2654) {
            return {
                type: Syntax$2323.IfStatement,
                test: test$2652,
                consequent: consequent$2653,
                alternate: alternate$2654
            };
        },
        createLabeledStatement: function (label$2655, body$2656) {
            return {
                type: Syntax$2323.LabeledStatement,
                label: label$2655,
                body: body$2656
            };
        },
        createLiteral: function (token$2657) {
            return {
                type: Syntax$2323.Literal,
                value: token$2657.value,
                raw: String(token$2657.value)
            };
        },
        createMemberExpression: function (accessor$2658, object$2659, property$2660) {
            return {
                type: Syntax$2323.MemberExpression,
                computed: accessor$2658 === '[',
                object: object$2659,
                property: property$2660
            };
        },
        createNewExpression: function (callee$2661, args$2662) {
            return {
                type: Syntax$2323.NewExpression,
                callee: callee$2661,
                'arguments': args$2662
            };
        },
        createObjectExpression: function (properties$2663) {
            return {
                type: Syntax$2323.ObjectExpression,
                properties: properties$2663
            };
        },
        createPostfixExpression: function (operator$2664, argument$2665) {
            return {
                type: Syntax$2323.UpdateExpression,
                operator: operator$2664,
                argument: argument$2665,
                prefix: false
            };
        },
        createProgram: function (body$2666) {
            return {
                type: Syntax$2323.Program,
                body: body$2666
            };
        },
        createProperty: function (kind$2667, key$2668, value$2669, method$2670, shorthand$2671, computed$2672) {
            return {
                type: Syntax$2323.Property,
                key: key$2668,
                value: value$2669,
                kind: kind$2667,
                method: method$2670,
                shorthand: shorthand$2671,
                computed: computed$2672
            };
        },
        createReturnStatement: function (argument$2673) {
            return {
                type: Syntax$2323.ReturnStatement,
                argument: argument$2673
            };
        },
        createSequenceExpression: function (expressions$2674) {
            return {
                type: Syntax$2323.SequenceExpression,
                expressions: expressions$2674
            };
        },
        createSwitchCase: function (test$2675, consequent$2676) {
            return {
                type: Syntax$2323.SwitchCase,
                test: test$2675,
                consequent: consequent$2676
            };
        },
        createSwitchStatement: function (discriminant$2677, cases$2678) {
            return {
                type: Syntax$2323.SwitchStatement,
                discriminant: discriminant$2677,
                cases: cases$2678
            };
        },
        createThisExpression: function () {
            return { type: Syntax$2323.ThisExpression };
        },
        createThrowStatement: function (argument$2679) {
            return {
                type: Syntax$2323.ThrowStatement,
                argument: argument$2679
            };
        },
        createTryStatement: function (block$2680, guardedHandlers$2681, handlers$2682, finalizer$2683) {
            return {
                type: Syntax$2323.TryStatement,
                block: block$2680,
                guardedHandlers: guardedHandlers$2681,
                handlers: handlers$2682,
                finalizer: finalizer$2683
            };
        },
        createUnaryExpression: function (operator$2684, argument$2685) {
            if (operator$2684 === '++' || operator$2684 === '--') {
                return {
                    type: Syntax$2323.UpdateExpression,
                    operator: operator$2684,
                    argument: argument$2685,
                    prefix: true
                };
            }
            return {
                type: Syntax$2323.UnaryExpression,
                operator: operator$2684,
                argument: argument$2685,
                prefix: true
            };
        },
        createVariableDeclaration: function (declarations$2686, kind$2687) {
            return {
                type: Syntax$2323.VariableDeclaration,
                declarations: declarations$2686,
                kind: kind$2687
            };
        },
        createVariableDeclarator: function (id$2688, init$2689) {
            return {
                type: Syntax$2323.VariableDeclarator,
                id: id$2688,
                init: init$2689
            };
        },
        createWhileStatement: function (test$2690, body$2691) {
            return {
                type: Syntax$2323.WhileStatement,
                test: test$2690,
                body: body$2691
            };
        },
        createWithStatement: function (object$2692, body$2693) {
            return {
                type: Syntax$2323.WithStatement,
                object: object$2692,
                body: body$2693
            };
        },
        createTemplateElement: function (value$2694, tail$2695) {
            return {
                type: Syntax$2323.TemplateElement,
                value: value$2694,
                tail: tail$2695
            };
        },
        createTemplateLiteral: function (quasis$2696, expressions$2697) {
            return {
                type: Syntax$2323.TemplateLiteral,
                quasis: quasis$2696,
                expressions: expressions$2697
            };
        },
        createSpreadElement: function (argument$2698) {
            return {
                type: Syntax$2323.SpreadElement,
                argument: argument$2698
            };
        },
        createTaggedTemplateExpression: function (tag$2699, quasi$2700) {
            return {
                type: Syntax$2323.TaggedTemplateExpression,
                tag: tag$2699,
                quasi: quasi$2700
            };
        },
        createArrowFunctionExpression: function (params$2701, defaults$2702, body$2703, rest$2704, expression$2705) {
            return {
                type: Syntax$2323.ArrowFunctionExpression,
                id: null,
                params: params$2701,
                defaults: defaults$2702,
                body: body$2703,
                rest: rest$2704,
                generator: false,
                expression: expression$2705
            };
        },
        createMethodDefinition: function (propertyType$2706, kind$2707, key$2708, value$2709) {
            return {
                type: Syntax$2323.MethodDefinition,
                key: key$2708,
                value: value$2709,
                kind: kind$2707,
                'static': propertyType$2706 === ClassPropertyType$2328.static
            };
        },
        createClassBody: function (body$2710) {
            return {
                type: Syntax$2323.ClassBody,
                body: body$2710
            };
        },
        createClassExpression: function (id$2711, superClass$2712, body$2713) {
            return {
                type: Syntax$2323.ClassExpression,
                id: id$2711,
                superClass: superClass$2712,
                body: body$2713
            };
        },
        createClassDeclaration: function (id$2714, superClass$2715, body$2716) {
            return {
                type: Syntax$2323.ClassDeclaration,
                id: id$2714,
                superClass: superClass$2715,
                body: body$2716
            };
        },
        createExportSpecifier: function (id$2717, name$2718) {
            return {
                type: Syntax$2323.ExportSpecifier,
                id: id$2717,
                name: name$2718
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$2323.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$2719, specifiers$2720, source$2721) {
            return {
                type: Syntax$2323.ExportDeclaration,
                declaration: declaration$2719,
                specifiers: specifiers$2720,
                source: source$2721
            };
        },
        createImportSpecifier: function (id$2722, name$2723) {
            return {
                type: Syntax$2323.ImportSpecifier,
                id: id$2722,
                name: name$2723
            };
        },
        createImportDeclaration: function (specifiers$2724, kind$2725, source$2726) {
            return {
                type: Syntax$2323.ImportDeclaration,
                specifiers: specifiers$2724,
                kind: kind$2725,
                source: source$2726
            };
        },
        createYieldExpression: function (argument$2727, delegate$2728) {
            return {
                type: Syntax$2323.YieldExpression,
                argument: argument$2727,
                delegate: delegate$2728
            };
        },
        createModuleDeclaration: function (id$2729, source$2730, body$2731) {
            return {
                type: Syntax$2323.ModuleDeclaration,
                id: id$2729,
                source: source$2730,
                body: body$2731
            };
        },
        createComprehensionExpression: function (filter$2732, blocks$2733, body$2734) {
            return {
                type: Syntax$2323.ComprehensionExpression,
                filter: filter$2732,
                blocks: blocks$2733,
                body: body$2734
            };
        }
    };
    function peekLineTerminator$2383() {
        return lookahead$2342.lineNumber !== lineNumber$2332;
    }
    function throwError$2384(token$2735, messageFormat$2736) {
        var error$2737, args$2738 = Array.prototype.slice.call(arguments, 2), msg$2739 = messageFormat$2736.replace(/%(\d)/g, function (whole$2743, index$2744) {
                assert$2347(index$2744 < args$2738.length, 'Message reference must be in range');
                return args$2738[index$2744];
            });
        var startIndex$2740 = streamIndex$2341 > 3 ? streamIndex$2341 - 3 : 0;
        var toks$2741 = '', tailingMsg$2742 = '';
        if (tokenStream$2340) {
            toks$2741 = tokenStream$2340.slice(startIndex$2740, streamIndex$2341 + 3).map(function (stx$2745) {
                return stx$2745.token.value;
            }).join(' ');
            tailingMsg$2742 = '\n[... ' + toks$2741 + ' ...]';
        }
        if (typeof token$2735.lineNumber === 'number') {
            error$2737 = new Error('Line ' + token$2735.lineNumber + ': ' + msg$2739 + tailingMsg$2742);
            error$2737.index = token$2735.range[0];
            error$2737.lineNumber = token$2735.lineNumber;
            error$2737.column = token$2735.range[0] - lineStart$2333 + 1;
        } else {
            error$2737 = new Error('Line ' + lineNumber$2332 + ': ' + msg$2739 + tailingMsg$2742);
            error$2737.index = index$2331;
            error$2737.lineNumber = lineNumber$2332;
            error$2737.column = index$2331 - lineStart$2333 + 1;
        }
        error$2737.description = msg$2739;
        throw error$2737;
    }
    function throwErrorTolerant$2385() {
        try {
            throwError$2384.apply(null, arguments);
        } catch (e$2746) {
            if (extra$2346.errors) {
                extra$2346.errors.push(e$2746);
            } else {
                throw e$2746;
            }
        }
    }
    function throwUnexpected$2386(token$2747) {
        if (token$2747.type === Token$2320.EOF) {
            throwError$2384(token$2747, Messages$2325.UnexpectedEOS);
        }
        if (token$2747.type === Token$2320.NumericLiteral) {
            throwError$2384(token$2747, Messages$2325.UnexpectedNumber);
        }
        if (token$2747.type === Token$2320.StringLiteral) {
            throwError$2384(token$2747, Messages$2325.UnexpectedString);
        }
        if (token$2747.type === Token$2320.Identifier) {
            throwError$2384(token$2747, Messages$2325.UnexpectedIdentifier);
        }
        if (token$2747.type === Token$2320.Keyword) {
            if (isFutureReservedWord$2356(token$2747.value)) {
            } else if (strict$2330 && isStrictModeReservedWord$2357(token$2747.value)) {
                throwErrorTolerant$2385(token$2747, Messages$2325.StrictReservedWord);
                return;
            }
            throwError$2384(token$2747, Messages$2325.UnexpectedToken, token$2747.value);
        }
        if (token$2747.type === Token$2320.Template) {
            throwError$2384(token$2747, Messages$2325.UnexpectedTemplate, token$2747.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$2384(token$2747, Messages$2325.UnexpectedToken, token$2747.value);
    }
    function expect$2387(value$2748) {
        var token$2749 = lex$2377();
        if (token$2749.type !== Token$2320.Punctuator || token$2749.value !== value$2748) {
            throwUnexpected$2386(token$2749);
        }
    }
    function expectKeyword$2388(keyword$2750) {
        var token$2751 = lex$2377();
        if (token$2751.type !== Token$2320.Keyword || token$2751.value !== keyword$2750) {
            throwUnexpected$2386(token$2751);
        }
    }
    function match$2389(value$2752) {
        return lookahead$2342.type === Token$2320.Punctuator && lookahead$2342.value === value$2752;
    }
    function matchKeyword$2390(keyword$2753) {
        return lookahead$2342.type === Token$2320.Keyword && lookahead$2342.value === keyword$2753;
    }
    function matchContextualKeyword$2391(keyword$2754) {
        return lookahead$2342.type === Token$2320.Identifier && lookahead$2342.value === keyword$2754;
    }
    function matchAssign$2392() {
        var op$2755;
        if (lookahead$2342.type !== Token$2320.Punctuator) {
            return false;
        }
        op$2755 = lookahead$2342.value;
        return op$2755 === '=' || op$2755 === '*=' || op$2755 === '/=' || op$2755 === '%=' || op$2755 === '+=' || op$2755 === '-=' || op$2755 === '<<=' || op$2755 === '>>=' || op$2755 === '>>>=' || op$2755 === '&=' || op$2755 === '^=' || op$2755 === '|=';
    }
    function consumeSemicolon$2393() {
        var line$2756, ch$2757;
        ch$2757 = lookahead$2342.value ? String(lookahead$2342.value).charCodeAt(0) : -1;
        if (// Catch the very common case first: immediately a semicolon (char #59).
            ch$2757 === 59) {
            lex$2377();
            return;
        }
        if (lookahead$2342.lineNumber !== lineNumber$2332) {
            return;
        }
        if (match$2389(';')) {
            lex$2377();
            return;
        }
        if (lookahead$2342.type !== Token$2320.EOF && !match$2389('}')) {
            throwUnexpected$2386(lookahead$2342);
        }
    }
    function isLeftHandSide$2394(expr$2758) {
        return expr$2758.type === Syntax$2323.Identifier || expr$2758.type === Syntax$2323.MemberExpression;
    }
    function isAssignableLeftHandSide$2395(expr$2759) {
        return isLeftHandSide$2394(expr$2759) || expr$2759.type === Syntax$2323.ObjectPattern || expr$2759.type === Syntax$2323.ArrayPattern;
    }
    function parseArrayInitialiser$2396() {
        var elements$2760 = [], blocks$2761 = [], filter$2762 = null, tmp$2763, possiblecomprehension$2764 = true, body$2765, marker$2766 = markerCreate$2380();
        expect$2387('[');
        while (!match$2389(']')) {
            if (lookahead$2342.value === 'for' && lookahead$2342.type === Token$2320.Keyword) {
                if (!possiblecomprehension$2764) {
                    throwError$2384({}, Messages$2325.ComprehensionError);
                }
                matchKeyword$2390('for');
                tmp$2763 = parseForStatement$2444({ ignoreBody: true });
                tmp$2763.of = tmp$2763.type === Syntax$2323.ForOfStatement;
                tmp$2763.type = Syntax$2323.ComprehensionBlock;
                if (tmp$2763.left.kind) {
                    // can't be let or const
                    throwError$2384({}, Messages$2325.ComprehensionError);
                }
                blocks$2761.push(tmp$2763);
            } else if (lookahead$2342.value === 'if' && lookahead$2342.type === Token$2320.Keyword) {
                if (!possiblecomprehension$2764) {
                    throwError$2384({}, Messages$2325.ComprehensionError);
                }
                expectKeyword$2388('if');
                expect$2387('(');
                filter$2762 = parseExpression$2424();
                expect$2387(')');
            } else if (lookahead$2342.value === ',' && lookahead$2342.type === Token$2320.Punctuator) {
                possiblecomprehension$2764 = false;
                // no longer allowed.
                lex$2377();
                elements$2760.push(null);
            } else {
                tmp$2763 = parseSpreadOrAssignmentExpression$2407();
                elements$2760.push(tmp$2763);
                if (tmp$2763 && tmp$2763.type === Syntax$2323.SpreadElement) {
                    if (!match$2389(']')) {
                        throwError$2384({}, Messages$2325.ElementAfterSpreadElement);
                    }
                } else if (!(match$2389(']') || matchKeyword$2390('for') || matchKeyword$2390('if'))) {
                    expect$2387(',');
                    // this lexes.
                    possiblecomprehension$2764 = false;
                }
            }
        }
        expect$2387(']');
        if (filter$2762 && !blocks$2761.length) {
            throwError$2384({}, Messages$2325.ComprehensionRequiresBlock);
        }
        if (blocks$2761.length) {
            if (elements$2760.length !== 1) {
                throwError$2384({}, Messages$2325.ComprehensionError);
            }
            return markerApply$2382(marker$2766, delegate$2339.createComprehensionExpression(filter$2762, blocks$2761, elements$2760[0]));
        }
        return markerApply$2382(marker$2766, delegate$2339.createArrayExpression(elements$2760));
    }
    function parsePropertyFunction$2397(options$2767) {
        var previousStrict$2768, previousYieldAllowed$2769, params$2770, defaults$2771, body$2772, marker$2773 = markerCreate$2380();
        previousStrict$2768 = strict$2330;
        previousYieldAllowed$2769 = state$2344.yieldAllowed;
        state$2344.yieldAllowed = options$2767.generator;
        params$2770 = options$2767.params || [];
        defaults$2771 = options$2767.defaults || [];
        body$2772 = parseConciseBody$2456();
        if (options$2767.name && strict$2330 && isRestrictedWord$2358(params$2770[0].name)) {
            throwErrorTolerant$2385(options$2767.name, Messages$2325.StrictParamName);
        }
        strict$2330 = previousStrict$2768;
        state$2344.yieldAllowed = previousYieldAllowed$2769;
        return markerApply$2382(marker$2773, delegate$2339.createFunctionExpression(null, params$2770, defaults$2771, body$2772, options$2767.rest || null, options$2767.generator, body$2772.type !== Syntax$2323.BlockStatement));
    }
    function parsePropertyMethodFunction$2398(options$2774) {
        var previousStrict$2775, tmp$2776, method$2777;
        previousStrict$2775 = strict$2330;
        strict$2330 = true;
        tmp$2776 = parseParams$2460();
        if (tmp$2776.stricted) {
            throwErrorTolerant$2385(tmp$2776.stricted, tmp$2776.message);
        }
        method$2777 = parsePropertyFunction$2397({
            params: tmp$2776.params,
            defaults: tmp$2776.defaults,
            rest: tmp$2776.rest,
            generator: options$2774.generator
        });
        strict$2330 = previousStrict$2775;
        return method$2777;
    }
    function parseObjectPropertyKey$2399() {
        var marker$2778 = markerCreate$2380(), token$2779 = lex$2377(), propertyKey$2780, result$2781;
        if (// Note: This function is called only from parseObjectProperty(), where
            // EOF and Punctuator tokens are already filtered out.
            token$2779.type === Token$2320.StringLiteral || token$2779.type === Token$2320.NumericLiteral) {
            if (strict$2330 && token$2779.octal) {
                throwErrorTolerant$2385(token$2779, Messages$2325.StrictOctalLiteral);
            }
            return markerApply$2382(marker$2778, delegate$2339.createLiteral(token$2779));
        }
        if (token$2779.type === Token$2320.Punctuator && token$2779.value === '[') {
            // For computed properties we should skip the [ and ], and
            // capture in marker only the assignment expression itself.
            marker$2778 = markerCreate$2380();
            propertyKey$2780 = parseAssignmentExpression$2423();
            result$2781 = markerApply$2382(marker$2778, propertyKey$2780);
            expect$2387(']');
            return result$2781;
        }
        return markerApply$2382(marker$2778, delegate$2339.createIdentifier(token$2779.value));
    }
    function parseObjectProperty$2400() {
        var token$2782, key$2783, id$2784, value$2785, param$2786, expr$2787, computed$2788, marker$2789 = markerCreate$2380();
        token$2782 = lookahead$2342;
        computed$2788 = token$2782.value === '[' && token$2782.type === Token$2320.Punctuator;
        if (token$2782.type === Token$2320.Identifier || computed$2788) {
            id$2784 = parseObjectPropertyKey$2399();
            if (// Property Assignment: Getter and Setter.
                token$2782.value === 'get' && !(match$2389(':') || match$2389('('))) {
                computed$2788 = lookahead$2342.value === '[';
                key$2783 = parseObjectPropertyKey$2399();
                expect$2387('(');
                expect$2387(')');
                return markerApply$2382(marker$2789, delegate$2339.createProperty('get', key$2783, parsePropertyFunction$2397({ generator: false }), false, false, computed$2788));
            }
            if (token$2782.value === 'set' && !(match$2389(':') || match$2389('('))) {
                computed$2788 = lookahead$2342.value === '[';
                key$2783 = parseObjectPropertyKey$2399();
                expect$2387('(');
                token$2782 = lookahead$2342;
                param$2786 = [parseVariableIdentifier$2427()];
                expect$2387(')');
                return markerApply$2382(marker$2789, delegate$2339.createProperty('set', key$2783, parsePropertyFunction$2397({
                    params: param$2786,
                    generator: false,
                    name: token$2782
                }), false, false, computed$2788));
            }
            if (match$2389(':')) {
                lex$2377();
                return markerApply$2382(marker$2789, delegate$2339.createProperty('init', id$2784, parseAssignmentExpression$2423(), false, false, computed$2788));
            }
            if (match$2389('(')) {
                return markerApply$2382(marker$2789, delegate$2339.createProperty('init', id$2784, parsePropertyMethodFunction$2398({ generator: false }), true, false, computed$2788));
            }
            if (computed$2788) {
                // Computed properties can only be used with full notation.
                throwUnexpected$2386(lookahead$2342);
            }
            return markerApply$2382(marker$2789, delegate$2339.createProperty('init', id$2784, id$2784, false, true, false));
        }
        if (token$2782.type === Token$2320.EOF || token$2782.type === Token$2320.Punctuator) {
            if (!match$2389('*')) {
                throwUnexpected$2386(token$2782);
            }
            lex$2377();
            computed$2788 = lookahead$2342.type === Token$2320.Punctuator && lookahead$2342.value === '[';
            id$2784 = parseObjectPropertyKey$2399();
            if (!match$2389('(')) {
                throwUnexpected$2386(lex$2377());
            }
            return markerApply$2382(marker$2789, delegate$2339.createProperty('init', id$2784, parsePropertyMethodFunction$2398({ generator: true }), true, false, computed$2788));
        }
        key$2783 = parseObjectPropertyKey$2399();
        if (match$2389(':')) {
            lex$2377();
            return markerApply$2382(marker$2789, delegate$2339.createProperty('init', key$2783, parseAssignmentExpression$2423(), false, false, false));
        }
        if (match$2389('(')) {
            return markerApply$2382(marker$2789, delegate$2339.createProperty('init', key$2783, parsePropertyMethodFunction$2398({ generator: false }), true, false, false));
        }
        throwUnexpected$2386(lex$2377());
    }
    function parseObjectInitialiser$2401() {
        var properties$2790 = [], property$2791, name$2792, key$2793, kind$2794, map$2795 = {}, toString$2796 = String, marker$2797 = markerCreate$2380();
        expect$2387('{');
        while (!match$2389('}')) {
            property$2791 = parseObjectProperty$2400();
            if (property$2791.key.type === Syntax$2323.Identifier) {
                name$2792 = property$2791.key.name;
            } else {
                name$2792 = toString$2796(property$2791.key.value);
            }
            kind$2794 = property$2791.kind === 'init' ? PropertyKind$2324.Data : property$2791.kind === 'get' ? PropertyKind$2324.Get : PropertyKind$2324.Set;
            key$2793 = '$' + name$2792;
            if (Object.prototype.hasOwnProperty.call(map$2795, key$2793)) {
                if (map$2795[key$2793] === PropertyKind$2324.Data) {
                    if (strict$2330 && kind$2794 === PropertyKind$2324.Data) {
                        throwErrorTolerant$2385({}, Messages$2325.StrictDuplicateProperty);
                    } else if (kind$2794 !== PropertyKind$2324.Data) {
                        throwErrorTolerant$2385({}, Messages$2325.AccessorDataProperty);
                    }
                } else {
                    if (kind$2794 === PropertyKind$2324.Data) {
                        throwErrorTolerant$2385({}, Messages$2325.AccessorDataProperty);
                    } else if (map$2795[key$2793] & kind$2794) {
                        throwErrorTolerant$2385({}, Messages$2325.AccessorGetSet);
                    }
                }
                map$2795[key$2793] |= kind$2794;
            } else {
                map$2795[key$2793] = kind$2794;
            }
            properties$2790.push(property$2791);
            if (!match$2389('}')) {
                expect$2387(',');
            }
        }
        expect$2387('}');
        return markerApply$2382(marker$2797, delegate$2339.createObjectExpression(properties$2790));
    }
    function parseTemplateElement$2402(option$2798) {
        var marker$2799 = markerCreate$2380(), token$2800 = lex$2377();
        if (strict$2330 && token$2800.octal) {
            throwError$2384(token$2800, Messages$2325.StrictOctalLiteral);
        }
        return markerApply$2382(marker$2799, delegate$2339.createTemplateElement({
            raw: token$2800.value.raw,
            cooked: token$2800.value.cooked
        }, token$2800.tail));
    }
    function parseTemplateLiteral$2403() {
        var quasi$2801, quasis$2802, expressions$2803, marker$2804 = markerCreate$2380();
        quasi$2801 = parseTemplateElement$2402({ head: true });
        quasis$2802 = [quasi$2801];
        expressions$2803 = [];
        while (!quasi$2801.tail) {
            expressions$2803.push(parseExpression$2424());
            quasi$2801 = parseTemplateElement$2402({ head: false });
            quasis$2802.push(quasi$2801);
        }
        return markerApply$2382(marker$2804, delegate$2339.createTemplateLiteral(quasis$2802, expressions$2803));
    }
    function parseGroupExpression$2404() {
        var expr$2805;
        expect$2387('(');
        ++state$2344.parenthesizedCount;
        expr$2805 = parseExpression$2424();
        expect$2387(')');
        return expr$2805;
    }
    function parsePrimaryExpression$2405() {
        var type$2806, token$2807, resolvedIdent$2808, marker$2809, expr$2810;
        token$2807 = lookahead$2342;
        type$2806 = lookahead$2342.type;
        if (type$2806 === Token$2320.Identifier) {
            marker$2809 = markerCreate$2380();
            resolvedIdent$2808 = expander$2319.resolve(tokenStream$2340[lookaheadIndex$2343], phase$2345);
            lex$2377();
            return markerApply$2382(marker$2809, delegate$2339.createIdentifier(resolvedIdent$2808));
        }
        if (type$2806 === Token$2320.StringLiteral || type$2806 === Token$2320.NumericLiteral) {
            if (strict$2330 && lookahead$2342.octal) {
                throwErrorTolerant$2385(lookahead$2342, Messages$2325.StrictOctalLiteral);
            }
            marker$2809 = markerCreate$2380();
            return markerApply$2382(marker$2809, delegate$2339.createLiteral(lex$2377()));
        }
        if (type$2806 === Token$2320.Keyword) {
            if (matchKeyword$2390('this')) {
                marker$2809 = markerCreate$2380();
                lex$2377();
                return markerApply$2382(marker$2809, delegate$2339.createThisExpression());
            }
            if (matchKeyword$2390('function')) {
                return parseFunctionExpression$2462();
            }
            if (matchKeyword$2390('class')) {
                return parseClassExpression$2467();
            }
            if (matchKeyword$2390('super')) {
                marker$2809 = markerCreate$2380();
                lex$2377();
                return markerApply$2382(marker$2809, delegate$2339.createIdentifier('super'));
            }
        }
        if (type$2806 === Token$2320.BooleanLiteral) {
            marker$2809 = markerCreate$2380();
            token$2807 = lex$2377();
            if (typeof token$2807.value !== 'boolean') {
                assert$2347(token$2807.value === 'true' || token$2807.value === 'false', 'exporting either true or false as a string not: ' + token$2807.value);
                token$2807.value = token$2807.value === 'true';
            }
            return markerApply$2382(marker$2809, delegate$2339.createLiteral(token$2807));
        }
        if (type$2806 === Token$2320.NullLiteral) {
            marker$2809 = markerCreate$2380();
            token$2807 = lex$2377();
            token$2807.value = null;
            return markerApply$2382(marker$2809, delegate$2339.createLiteral(token$2807));
        }
        if (match$2389('[')) {
            return parseArrayInitialiser$2396();
        }
        if (match$2389('{')) {
            return parseObjectInitialiser$2401();
        }
        if (match$2389('(')) {
            return parseGroupExpression$2404();
        }
        if (lookahead$2342.type === Token$2320.RegularExpression) {
            marker$2809 = markerCreate$2380();
            return markerApply$2382(marker$2809, delegate$2339.createLiteral(lex$2377()));
        }
        if (type$2806 === Token$2320.Template) {
            return parseTemplateLiteral$2403();
        }
        throwUnexpected$2386(lex$2377());
    }
    function parseArguments$2406() {
        var args$2811 = [], arg$2812;
        expect$2387('(');
        if (!match$2389(')')) {
            while (streamIndex$2341 < length$2338) {
                arg$2812 = parseSpreadOrAssignmentExpression$2407();
                args$2811.push(arg$2812);
                if (match$2389(')')) {
                    break;
                } else if (arg$2812.type === Syntax$2323.SpreadElement) {
                    throwError$2384({}, Messages$2325.ElementAfterSpreadElement);
                }
                expect$2387(',');
            }
        }
        expect$2387(')');
        return args$2811;
    }
    function parseSpreadOrAssignmentExpression$2407() {
        if (match$2389('...')) {
            var marker$2813 = markerCreate$2380();
            lex$2377();
            return markerApply$2382(marker$2813, delegate$2339.createSpreadElement(parseAssignmentExpression$2423()));
        }
        return parseAssignmentExpression$2423();
    }
    function parseNonComputedProperty$2408(toResolve$2814) {
        var marker$2815 = markerCreate$2380(), resolvedIdent$2816, token$2817;
        if (toResolve$2814) {
            resolvedIdent$2816 = expander$2319.resolve(tokenStream$2340[lookaheadIndex$2343], phase$2345);
        }
        token$2817 = lex$2377();
        resolvedIdent$2816 = toResolve$2814 ? resolvedIdent$2816 : token$2817.value;
        if (!isIdentifierName$2374(token$2817)) {
            throwUnexpected$2386(token$2817);
        }
        return markerApply$2382(marker$2815, delegate$2339.createIdentifier(resolvedIdent$2816));
    }
    function parseNonComputedMember$2409() {
        expect$2387('.');
        return parseNonComputedProperty$2408();
    }
    function parseComputedMember$2410() {
        var expr$2818;
        expect$2387('[');
        expr$2818 = parseExpression$2424();
        expect$2387(']');
        return expr$2818;
    }
    function parseNewExpression$2411() {
        var callee$2819, args$2820, marker$2821 = markerCreate$2380();
        expectKeyword$2388('new');
        callee$2819 = parseLeftHandSideExpression$2413();
        args$2820 = match$2389('(') ? parseArguments$2406() : [];
        return markerApply$2382(marker$2821, delegate$2339.createNewExpression(callee$2819, args$2820));
    }
    function parseLeftHandSideExpressionAllowCall$2412() {
        var expr$2822, args$2823, marker$2824 = markerCreate$2380();
        expr$2822 = matchKeyword$2390('new') ? parseNewExpression$2411() : parsePrimaryExpression$2405();
        while (match$2389('.') || match$2389('[') || match$2389('(') || lookahead$2342.type === Token$2320.Template) {
            if (match$2389('(')) {
                args$2823 = parseArguments$2406();
                expr$2822 = markerApply$2382(marker$2824, delegate$2339.createCallExpression(expr$2822, args$2823));
            } else if (match$2389('[')) {
                expr$2822 = markerApply$2382(marker$2824, delegate$2339.createMemberExpression('[', expr$2822, parseComputedMember$2410()));
            } else if (match$2389('.')) {
                expr$2822 = markerApply$2382(marker$2824, delegate$2339.createMemberExpression('.', expr$2822, parseNonComputedMember$2409()));
            } else {
                expr$2822 = markerApply$2382(marker$2824, delegate$2339.createTaggedTemplateExpression(expr$2822, parseTemplateLiteral$2403()));
            }
        }
        return expr$2822;
    }
    function parseLeftHandSideExpression$2413() {
        var expr$2825, marker$2826 = markerCreate$2380();
        expr$2825 = matchKeyword$2390('new') ? parseNewExpression$2411() : parsePrimaryExpression$2405();
        while (match$2389('.') || match$2389('[') || lookahead$2342.type === Token$2320.Template) {
            if (match$2389('[')) {
                expr$2825 = markerApply$2382(marker$2826, delegate$2339.createMemberExpression('[', expr$2825, parseComputedMember$2410()));
            } else if (match$2389('.')) {
                expr$2825 = markerApply$2382(marker$2826, delegate$2339.createMemberExpression('.', expr$2825, parseNonComputedMember$2409()));
            } else {
                expr$2825 = markerApply$2382(marker$2826, delegate$2339.createTaggedTemplateExpression(expr$2825, parseTemplateLiteral$2403()));
            }
        }
        return expr$2825;
    }
    function parsePostfixExpression$2414() {
        var marker$2827 = markerCreate$2380(), expr$2828 = parseLeftHandSideExpressionAllowCall$2412(), token$2829;
        if (lookahead$2342.type !== Token$2320.Punctuator) {
            return expr$2828;
        }
        if ((match$2389('++') || match$2389('--')) && !peekLineTerminator$2383()) {
            if (// 11.3.1, 11.3.2
                strict$2330 && expr$2828.type === Syntax$2323.Identifier && isRestrictedWord$2358(expr$2828.name)) {
                throwErrorTolerant$2385({}, Messages$2325.StrictLHSPostfix);
            }
            if (!isLeftHandSide$2394(expr$2828)) {
                throwError$2384({}, Messages$2325.InvalidLHSInAssignment);
            }
            token$2829 = lex$2377();
            expr$2828 = markerApply$2382(marker$2827, delegate$2339.createPostfixExpression(token$2829.value, expr$2828));
        }
        return expr$2828;
    }
    function parseUnaryExpression$2415() {
        var marker$2830, token$2831, expr$2832;
        if (lookahead$2342.type !== Token$2320.Punctuator && lookahead$2342.type !== Token$2320.Keyword) {
            return parsePostfixExpression$2414();
        }
        if (match$2389('++') || match$2389('--')) {
            marker$2830 = markerCreate$2380();
            token$2831 = lex$2377();
            expr$2832 = parseUnaryExpression$2415();
            if (// 11.4.4, 11.4.5
                strict$2330 && expr$2832.type === Syntax$2323.Identifier && isRestrictedWord$2358(expr$2832.name)) {
                throwErrorTolerant$2385({}, Messages$2325.StrictLHSPrefix);
            }
            if (!isLeftHandSide$2394(expr$2832)) {
                throwError$2384({}, Messages$2325.InvalidLHSInAssignment);
            }
            return markerApply$2382(marker$2830, delegate$2339.createUnaryExpression(token$2831.value, expr$2832));
        }
        if (match$2389('+') || match$2389('-') || match$2389('~') || match$2389('!')) {
            marker$2830 = markerCreate$2380();
            token$2831 = lex$2377();
            expr$2832 = parseUnaryExpression$2415();
            return markerApply$2382(marker$2830, delegate$2339.createUnaryExpression(token$2831.value, expr$2832));
        }
        if (matchKeyword$2390('delete') || matchKeyword$2390('void') || matchKeyword$2390('typeof')) {
            marker$2830 = markerCreate$2380();
            token$2831 = lex$2377();
            expr$2832 = parseUnaryExpression$2415();
            expr$2832 = markerApply$2382(marker$2830, delegate$2339.createUnaryExpression(token$2831.value, expr$2832));
            if (strict$2330 && expr$2832.operator === 'delete' && expr$2832.argument.type === Syntax$2323.Identifier) {
                throwErrorTolerant$2385({}, Messages$2325.StrictDelete);
            }
            return expr$2832;
        }
        return parsePostfixExpression$2414();
    }
    function binaryPrecedence$2416(token$2833, allowIn$2834) {
        var prec$2835 = 0;
        if (token$2833.type !== Token$2320.Punctuator && token$2833.type !== Token$2320.Keyword) {
            return 0;
        }
        switch (token$2833.value) {
        case '||':
            prec$2835 = 1;
            break;
        case '&&':
            prec$2835 = 2;
            break;
        case '|':
            prec$2835 = 3;
            break;
        case '^':
            prec$2835 = 4;
            break;
        case '&':
            prec$2835 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$2835 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$2835 = 7;
            break;
        case 'in':
            prec$2835 = allowIn$2834 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$2835 = 8;
            break;
        case '+':
        case '-':
            prec$2835 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$2835 = 11;
            break;
        default:
            break;
        }
        return prec$2835;
    }
    function parseBinaryExpression$2417() {
        var expr$2836, token$2837, prec$2838, previousAllowIn$2839, stack$2840, right$2841, operator$2842, left$2843, i$2844, marker$2845, markers$2846;
        previousAllowIn$2839 = state$2344.allowIn;
        state$2344.allowIn = true;
        marker$2845 = markerCreate$2380();
        left$2843 = parseUnaryExpression$2415();
        token$2837 = lookahead$2342;
        prec$2838 = binaryPrecedence$2416(token$2837, previousAllowIn$2839);
        if (prec$2838 === 0) {
            return left$2843;
        }
        token$2837.prec = prec$2838;
        lex$2377();
        markers$2846 = [
            marker$2845,
            markerCreate$2380()
        ];
        right$2841 = parseUnaryExpression$2415();
        stack$2840 = [
            left$2843,
            token$2837,
            right$2841
        ];
        while ((prec$2838 = binaryPrecedence$2416(lookahead$2342, previousAllowIn$2839)) > 0) {
            while (// Reduce: make a binary expression from the three topmost entries.
                stack$2840.length > 2 && prec$2838 <= stack$2840[stack$2840.length - 2].prec) {
                right$2841 = stack$2840.pop();
                operator$2842 = stack$2840.pop().value;
                left$2843 = stack$2840.pop();
                expr$2836 = delegate$2339.createBinaryExpression(operator$2842, left$2843, right$2841);
                markers$2846.pop();
                marker$2845 = markers$2846.pop();
                markerApply$2382(marker$2845, expr$2836);
                stack$2840.push(expr$2836);
                markers$2846.push(marker$2845);
            }
            // Shift.
            token$2837 = lex$2377();
            token$2837.prec = prec$2838;
            stack$2840.push(token$2837);
            markers$2846.push(markerCreate$2380());
            expr$2836 = parseUnaryExpression$2415();
            stack$2840.push(expr$2836);
        }
        state$2344.allowIn = previousAllowIn$2839;
        // Final reduce to clean-up the stack.
        i$2844 = stack$2840.length - 1;
        expr$2836 = stack$2840[i$2844];
        markers$2846.pop();
        while (i$2844 > 1) {
            expr$2836 = delegate$2339.createBinaryExpression(stack$2840[i$2844 - 1].value, stack$2840[i$2844 - 2], expr$2836);
            i$2844 -= 2;
            marker$2845 = markers$2846.pop();
            markerApply$2382(marker$2845, expr$2836);
        }
        return expr$2836;
    }
    function parseConditionalExpression$2418() {
        var expr$2847, previousAllowIn$2848, consequent$2849, alternate$2850, marker$2851 = markerCreate$2380();
        expr$2847 = parseBinaryExpression$2417();
        if (match$2389('?')) {
            lex$2377();
            previousAllowIn$2848 = state$2344.allowIn;
            state$2344.allowIn = true;
            consequent$2849 = parseAssignmentExpression$2423();
            state$2344.allowIn = previousAllowIn$2848;
            expect$2387(':');
            alternate$2850 = parseAssignmentExpression$2423();
            expr$2847 = markerApply$2382(marker$2851, delegate$2339.createConditionalExpression(expr$2847, consequent$2849, alternate$2850));
        }
        return expr$2847;
    }
    function reinterpretAsAssignmentBindingPattern$2419(expr$2852) {
        var i$2853, len$2854, property$2855, element$2856;
        if (expr$2852.type === Syntax$2323.ObjectExpression) {
            expr$2852.type = Syntax$2323.ObjectPattern;
            for (i$2853 = 0, len$2854 = expr$2852.properties.length; i$2853 < len$2854; i$2853 += 1) {
                property$2855 = expr$2852.properties[i$2853];
                if (property$2855.kind !== 'init') {
                    throwError$2384({}, Messages$2325.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$2419(property$2855.value);
            }
        } else if (expr$2852.type === Syntax$2323.ArrayExpression) {
            expr$2852.type = Syntax$2323.ArrayPattern;
            for (i$2853 = 0, len$2854 = expr$2852.elements.length; i$2853 < len$2854; i$2853 += 1) {
                element$2856 = expr$2852.elements[i$2853];
                if (element$2856) {
                    reinterpretAsAssignmentBindingPattern$2419(element$2856);
                }
            }
        } else if (expr$2852.type === Syntax$2323.Identifier) {
            if (isRestrictedWord$2358(expr$2852.name)) {
                throwError$2384({}, Messages$2325.InvalidLHSInAssignment);
            }
        } else if (expr$2852.type === Syntax$2323.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$2419(expr$2852.argument);
            if (expr$2852.argument.type === Syntax$2323.ObjectPattern) {
                throwError$2384({}, Messages$2325.ObjectPatternAsSpread);
            }
        } else {
            if (expr$2852.type !== Syntax$2323.MemberExpression && expr$2852.type !== Syntax$2323.CallExpression && expr$2852.type !== Syntax$2323.NewExpression) {
                throwError$2384({}, Messages$2325.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$2420(options$2857, expr$2858) {
        var i$2859, len$2860, property$2861, element$2862;
        if (expr$2858.type === Syntax$2323.ObjectExpression) {
            expr$2858.type = Syntax$2323.ObjectPattern;
            for (i$2859 = 0, len$2860 = expr$2858.properties.length; i$2859 < len$2860; i$2859 += 1) {
                property$2861 = expr$2858.properties[i$2859];
                if (property$2861.kind !== 'init') {
                    throwError$2384({}, Messages$2325.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$2420(options$2857, property$2861.value);
            }
        } else if (expr$2858.type === Syntax$2323.ArrayExpression) {
            expr$2858.type = Syntax$2323.ArrayPattern;
            for (i$2859 = 0, len$2860 = expr$2858.elements.length; i$2859 < len$2860; i$2859 += 1) {
                element$2862 = expr$2858.elements[i$2859];
                if (element$2862) {
                    reinterpretAsDestructuredParameter$2420(options$2857, element$2862);
                }
            }
        } else if (expr$2858.type === Syntax$2323.Identifier) {
            validateParam$2458(options$2857, expr$2858, expr$2858.name);
        } else {
            if (expr$2858.type !== Syntax$2323.MemberExpression) {
                throwError$2384({}, Messages$2325.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$2421(expressions$2863) {
        var i$2864, len$2865, param$2866, params$2867, defaults$2868, defaultCount$2869, options$2870, rest$2871;
        params$2867 = [];
        defaults$2868 = [];
        defaultCount$2869 = 0;
        rest$2871 = null;
        options$2870 = { paramSet: {} };
        for (i$2864 = 0, len$2865 = expressions$2863.length; i$2864 < len$2865; i$2864 += 1) {
            param$2866 = expressions$2863[i$2864];
            if (param$2866.type === Syntax$2323.Identifier) {
                params$2867.push(param$2866);
                defaults$2868.push(null);
                validateParam$2458(options$2870, param$2866, param$2866.name);
            } else if (param$2866.type === Syntax$2323.ObjectExpression || param$2866.type === Syntax$2323.ArrayExpression) {
                reinterpretAsDestructuredParameter$2420(options$2870, param$2866);
                params$2867.push(param$2866);
                defaults$2868.push(null);
            } else if (param$2866.type === Syntax$2323.SpreadElement) {
                assert$2347(i$2864 === len$2865 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$2420(options$2870, param$2866.argument);
                rest$2871 = param$2866.argument;
            } else if (param$2866.type === Syntax$2323.AssignmentExpression) {
                params$2867.push(param$2866.left);
                defaults$2868.push(param$2866.right);
                ++defaultCount$2869;
                validateParam$2458(options$2870, param$2866.left, param$2866.left.name);
            } else {
                return null;
            }
        }
        if (options$2870.message === Messages$2325.StrictParamDupe) {
            throwError$2384(strict$2330 ? options$2870.stricted : options$2870.firstRestricted, options$2870.message);
        }
        if (defaultCount$2869 === 0) {
            defaults$2868 = [];
        }
        return {
            params: params$2867,
            defaults: defaults$2868,
            rest: rest$2871,
            stricted: options$2870.stricted,
            firstRestricted: options$2870.firstRestricted,
            message: options$2870.message
        };
    }
    function parseArrowFunctionExpression$2422(options$2872, marker$2873) {
        var previousStrict$2874, previousYieldAllowed$2875, body$2876;
        expect$2387('=>');
        previousStrict$2874 = strict$2330;
        previousYieldAllowed$2875 = state$2344.yieldAllowed;
        state$2344.yieldAllowed = false;
        body$2876 = parseConciseBody$2456();
        if (strict$2330 && options$2872.firstRestricted) {
            throwError$2384(options$2872.firstRestricted, options$2872.message);
        }
        if (strict$2330 && options$2872.stricted) {
            throwErrorTolerant$2385(options$2872.stricted, options$2872.message);
        }
        strict$2330 = previousStrict$2874;
        state$2344.yieldAllowed = previousYieldAllowed$2875;
        return markerApply$2382(marker$2873, delegate$2339.createArrowFunctionExpression(options$2872.params, options$2872.defaults, body$2876, options$2872.rest, body$2876.type !== Syntax$2323.BlockStatement));
    }
    function parseAssignmentExpression$2423() {
        var marker$2877, expr$2878, token$2879, params$2880, oldParenthesizedCount$2881;
        if (// Note that 'yield' is treated as a keyword in strict mode, but a
            // contextual keyword (identifier) in non-strict mode, so we need
            // to use matchKeyword and matchContextualKeyword appropriately.
            state$2344.yieldAllowed && matchContextualKeyword$2391('yield') || strict$2330 && matchKeyword$2390('yield')) {
            return parseYieldExpression$2463();
        }
        oldParenthesizedCount$2881 = state$2344.parenthesizedCount;
        marker$2877 = markerCreate$2380();
        if (match$2389('(')) {
            token$2879 = lookahead2$2379();
            if (token$2879.type === Token$2320.Punctuator && token$2879.value === ')' || token$2879.value === '...') {
                params$2880 = parseParams$2460();
                if (!match$2389('=>')) {
                    throwUnexpected$2386(lex$2377());
                }
                return parseArrowFunctionExpression$2422(params$2880, marker$2877);
            }
        }
        token$2879 = lookahead$2342;
        expr$2878 = parseConditionalExpression$2418();
        if (match$2389('=>') && (state$2344.parenthesizedCount === oldParenthesizedCount$2881 || state$2344.parenthesizedCount === oldParenthesizedCount$2881 + 1)) {
            if (expr$2878.type === Syntax$2323.Identifier) {
                params$2880 = reinterpretAsCoverFormalsList$2421([expr$2878]);
            } else if (expr$2878.type === Syntax$2323.SequenceExpression) {
                params$2880 = reinterpretAsCoverFormalsList$2421(expr$2878.expressions);
            }
            if (params$2880) {
                return parseArrowFunctionExpression$2422(params$2880, marker$2877);
            }
        }
        if (matchAssign$2392()) {
            if (// 11.13.1
                strict$2330 && expr$2878.type === Syntax$2323.Identifier && isRestrictedWord$2358(expr$2878.name)) {
                throwErrorTolerant$2385(token$2879, Messages$2325.StrictLHSAssignment);
            }
            if (// ES.next draf 11.13 Runtime Semantics step 1
                match$2389('=') && (expr$2878.type === Syntax$2323.ObjectExpression || expr$2878.type === Syntax$2323.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$2419(expr$2878);
            } else if (!isLeftHandSide$2394(expr$2878)) {
                throwError$2384({}, Messages$2325.InvalidLHSInAssignment);
            }
            expr$2878 = markerApply$2382(marker$2877, delegate$2339.createAssignmentExpression(lex$2377().value, expr$2878, parseAssignmentExpression$2423()));
        }
        return expr$2878;
    }
    function parseExpression$2424() {
        var marker$2882, expr$2883, expressions$2884, sequence$2885, coverFormalsList$2886, spreadFound$2887, oldParenthesizedCount$2888;
        oldParenthesizedCount$2888 = state$2344.parenthesizedCount;
        marker$2882 = markerCreate$2380();
        expr$2883 = parseAssignmentExpression$2423();
        expressions$2884 = [expr$2883];
        if (match$2389(',')) {
            while (streamIndex$2341 < length$2338) {
                if (!match$2389(',')) {
                    break;
                }
                lex$2377();
                expr$2883 = parseSpreadOrAssignmentExpression$2407();
                expressions$2884.push(expr$2883);
                if (expr$2883.type === Syntax$2323.SpreadElement) {
                    spreadFound$2887 = true;
                    if (!match$2389(')')) {
                        throwError$2384({}, Messages$2325.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$2885 = markerApply$2382(marker$2882, delegate$2339.createSequenceExpression(expressions$2884));
        }
        if (match$2389('=>')) {
            if (// Do not allow nested parentheses on the LHS of the =>.
                state$2344.parenthesizedCount === oldParenthesizedCount$2888 || state$2344.parenthesizedCount === oldParenthesizedCount$2888 + 1) {
                expr$2883 = expr$2883.type === Syntax$2323.SequenceExpression ? expr$2883.expressions : expressions$2884;
                coverFormalsList$2886 = reinterpretAsCoverFormalsList$2421(expr$2883);
                if (coverFormalsList$2886) {
                    return parseArrowFunctionExpression$2422(coverFormalsList$2886, marker$2882);
                }
            }
            throwUnexpected$2386(lex$2377());
        }
        if (spreadFound$2887 && lookahead2$2379().value !== '=>') {
            throwError$2384({}, Messages$2325.IllegalSpread);
        }
        return sequence$2885 || expr$2883;
    }
    function parseStatementList$2425() {
        var list$2889 = [], statement$2890;
        while (streamIndex$2341 < length$2338) {
            if (match$2389('}')) {
                break;
            }
            statement$2890 = parseSourceElement$2470();
            if (typeof statement$2890 === 'undefined') {
                break;
            }
            list$2889.push(statement$2890);
        }
        return list$2889;
    }
    function parseBlock$2426() {
        var block$2891, marker$2892 = markerCreate$2380();
        expect$2387('{');
        block$2891 = parseStatementList$2425();
        expect$2387('}');
        return markerApply$2382(marker$2892, delegate$2339.createBlockStatement(block$2891));
    }
    function parseVariableIdentifier$2427() {
        var token$2893 = lookahead$2342, resolvedIdent$2894, marker$2895 = markerCreate$2380();
        if (token$2893.type !== Token$2320.Identifier) {
            throwUnexpected$2386(token$2893);
        }
        resolvedIdent$2894 = expander$2319.resolve(tokenStream$2340[lookaheadIndex$2343], phase$2345);
        lex$2377();
        return markerApply$2382(marker$2895, delegate$2339.createIdentifier(resolvedIdent$2894));
    }
    function parseVariableDeclaration$2428(kind$2896) {
        var id$2897, marker$2898 = markerCreate$2380(), init$2899 = null;
        if (match$2389('{')) {
            id$2897 = parseObjectInitialiser$2401();
            reinterpretAsAssignmentBindingPattern$2419(id$2897);
        } else if (match$2389('[')) {
            id$2897 = parseArrayInitialiser$2396();
            reinterpretAsAssignmentBindingPattern$2419(id$2897);
        } else {
            id$2897 = state$2344.allowKeyword ? parseNonComputedProperty$2408() : parseVariableIdentifier$2427();
            if (// 12.2.1
                strict$2330 && isRestrictedWord$2358(id$2897.name)) {
                throwErrorTolerant$2385({}, Messages$2325.StrictVarName);
            }
        }
        if (kind$2896 === 'const') {
            if (!match$2389('=')) {
                throwError$2384({}, Messages$2325.NoUnintializedConst);
            }
            expect$2387('=');
            init$2899 = parseAssignmentExpression$2423();
        } else if (match$2389('=')) {
            lex$2377();
            init$2899 = parseAssignmentExpression$2423();
        }
        return markerApply$2382(marker$2898, delegate$2339.createVariableDeclarator(id$2897, init$2899));
    }
    function parseVariableDeclarationList$2429(kind$2900) {
        var list$2901 = [];
        do {
            list$2901.push(parseVariableDeclaration$2428(kind$2900));
            if (!match$2389(',')) {
                break;
            }
            lex$2377();
        } while (streamIndex$2341 < length$2338);
        return list$2901;
    }
    function parseVariableStatement$2430() {
        var declarations$2902, marker$2903 = markerCreate$2380();
        expectKeyword$2388('var');
        declarations$2902 = parseVariableDeclarationList$2429();
        consumeSemicolon$2393();
        return markerApply$2382(marker$2903, delegate$2339.createVariableDeclaration(declarations$2902, 'var'));
    }
    function parseConstLetDeclaration$2431(kind$2904) {
        var declarations$2905, marker$2906 = markerCreate$2380();
        expectKeyword$2388(kind$2904);
        declarations$2905 = parseVariableDeclarationList$2429(kind$2904);
        consumeSemicolon$2393();
        return markerApply$2382(marker$2906, delegate$2339.createVariableDeclaration(declarations$2905, kind$2904));
    }
    function parseModuleDeclaration$2432() {
        var id$2907, src$2908, body$2909, marker$2910 = markerCreate$2380();
        lex$2377();
        if (// 'module'
            peekLineTerminator$2383()) {
            throwError$2384({}, Messages$2325.NewlineAfterModule);
        }
        switch (lookahead$2342.type) {
        case Token$2320.StringLiteral:
            id$2907 = parsePrimaryExpression$2405();
            body$2909 = parseModuleBlock$2475();
            src$2908 = null;
            break;
        case Token$2320.Identifier:
            id$2907 = parseVariableIdentifier$2427();
            body$2909 = null;
            if (!matchContextualKeyword$2391('from')) {
                throwUnexpected$2386(lex$2377());
            }
            lex$2377();
            src$2908 = parsePrimaryExpression$2405();
            if (src$2908.type !== Syntax$2323.Literal) {
                throwError$2384({}, Messages$2325.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$2393();
        return markerApply$2382(marker$2910, delegate$2339.createModuleDeclaration(id$2907, src$2908, body$2909));
    }
    function parseExportBatchSpecifier$2433() {
        var marker$2911 = markerCreate$2380();
        expect$2387('*');
        return markerApply$2382(marker$2911, delegate$2339.createExportBatchSpecifier());
    }
    function parseExportSpecifier$2434() {
        var id$2912, name$2913 = null, marker$2914 = markerCreate$2380();
        id$2912 = parseVariableIdentifier$2427();
        if (matchContextualKeyword$2391('as')) {
            lex$2377();
            name$2913 = parseNonComputedProperty$2408();
        }
        return markerApply$2382(marker$2914, delegate$2339.createExportSpecifier(id$2912, name$2913));
    }
    function parseExportDeclaration$2435() {
        var previousAllowKeyword$2915, decl$2916, def$2917, src$2918, specifiers$2919, marker$2920 = markerCreate$2380();
        expectKeyword$2388('export');
        if (lookahead$2342.type === Token$2320.Keyword) {
            switch (lookahead$2342.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return markerApply$2382(marker$2920, delegate$2339.createExportDeclaration(parseSourceElement$2470(), null, null));
            }
        }
        if (isIdentifierName$2374(lookahead$2342)) {
            previousAllowKeyword$2915 = state$2344.allowKeyword;
            state$2344.allowKeyword = true;
            decl$2916 = parseVariableDeclarationList$2429('let');
            state$2344.allowKeyword = previousAllowKeyword$2915;
            return markerApply$2382(marker$2920, delegate$2339.createExportDeclaration(decl$2916, null, null));
        }
        specifiers$2919 = [];
        src$2918 = null;
        if (match$2389('*')) {
            specifiers$2919.push(parseExportBatchSpecifier$2433());
        } else {
            expect$2387('{');
            do {
                specifiers$2919.push(parseExportSpecifier$2434());
            } while (match$2389(',') && lex$2377());
            expect$2387('}');
        }
        if (matchContextualKeyword$2391('from')) {
            lex$2377();
            src$2918 = parsePrimaryExpression$2405();
            if (src$2918.type !== Syntax$2323.Literal) {
                throwError$2384({}, Messages$2325.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$2393();
        return markerApply$2382(marker$2920, delegate$2339.createExportDeclaration(null, specifiers$2919, src$2918));
    }
    function parseImportDeclaration$2436() {
        var specifiers$2921, kind$2922, src$2923, marker$2924 = markerCreate$2380();
        expectKeyword$2388('import');
        specifiers$2921 = [];
        if (isIdentifierName$2374(lookahead$2342)) {
            kind$2922 = 'default';
            specifiers$2921.push(parseImportSpecifier$2437());
            if (!matchContextualKeyword$2391('from')) {
                throwError$2384({}, Messages$2325.NoFromAfterImport);
            }
            lex$2377();
        } else if (match$2389('{')) {
            kind$2922 = 'named';
            lex$2377();
            do {
                specifiers$2921.push(parseImportSpecifier$2437());
            } while (match$2389(',') && lex$2377());
            expect$2387('}');
            if (!matchContextualKeyword$2391('from')) {
                throwError$2384({}, Messages$2325.NoFromAfterImport);
            }
            lex$2377();
        }
        src$2923 = parsePrimaryExpression$2405();
        if (src$2923.type !== Syntax$2323.Literal) {
            throwError$2384({}, Messages$2325.InvalidModuleSpecifier);
        }
        consumeSemicolon$2393();
        return markerApply$2382(marker$2924, delegate$2339.createImportDeclaration(specifiers$2921, kind$2922, src$2923));
    }
    function parseImportSpecifier$2437() {
        var id$2925, name$2926 = null, marker$2927 = markerCreate$2380();
        id$2925 = parseNonComputedProperty$2408(true);
        if (matchContextualKeyword$2391('as')) {
            lex$2377();
            name$2926 = parseVariableIdentifier$2427();
        }
        return markerApply$2382(marker$2927, delegate$2339.createImportSpecifier(id$2925, name$2926));
    }
    function parseEmptyStatement$2438() {
        var marker$2928 = markerCreate$2380();
        expect$2387(';');
        return markerApply$2382(marker$2928, delegate$2339.createEmptyStatement());
    }
    function parseExpressionStatement$2439() {
        var marker$2929 = markerCreate$2380(), expr$2930 = parseExpression$2424();
        consumeSemicolon$2393();
        return markerApply$2382(marker$2929, delegate$2339.createExpressionStatement(expr$2930));
    }
    function parseIfStatement$2440() {
        var test$2931, consequent$2932, alternate$2933, marker$2934 = markerCreate$2380();
        expectKeyword$2388('if');
        expect$2387('(');
        test$2931 = parseExpression$2424();
        expect$2387(')');
        consequent$2932 = parseStatement$2455();
        if (matchKeyword$2390('else')) {
            lex$2377();
            alternate$2933 = parseStatement$2455();
        } else {
            alternate$2933 = null;
        }
        return markerApply$2382(marker$2934, delegate$2339.createIfStatement(test$2931, consequent$2932, alternate$2933));
    }
    function parseDoWhileStatement$2441() {
        var body$2935, test$2936, oldInIteration$2937, marker$2938 = markerCreate$2380();
        expectKeyword$2388('do');
        oldInIteration$2937 = state$2344.inIteration;
        state$2344.inIteration = true;
        body$2935 = parseStatement$2455();
        state$2344.inIteration = oldInIteration$2937;
        expectKeyword$2388('while');
        expect$2387('(');
        test$2936 = parseExpression$2424();
        expect$2387(')');
        if (match$2389(';')) {
            lex$2377();
        }
        return markerApply$2382(marker$2938, delegate$2339.createDoWhileStatement(body$2935, test$2936));
    }
    function parseWhileStatement$2442() {
        var test$2939, body$2940, oldInIteration$2941, marker$2942 = markerCreate$2380();
        expectKeyword$2388('while');
        expect$2387('(');
        test$2939 = parseExpression$2424();
        expect$2387(')');
        oldInIteration$2941 = state$2344.inIteration;
        state$2344.inIteration = true;
        body$2940 = parseStatement$2455();
        state$2344.inIteration = oldInIteration$2941;
        return markerApply$2382(marker$2942, delegate$2339.createWhileStatement(test$2939, body$2940));
    }
    function parseForVariableDeclaration$2443() {
        var marker$2943 = markerCreate$2380(), token$2944 = lex$2377(), declarations$2945 = parseVariableDeclarationList$2429();
        return markerApply$2382(marker$2943, delegate$2339.createVariableDeclaration(declarations$2945, token$2944.value));
    }
    function parseForStatement$2444(opts$2946) {
        var init$2947, test$2948, update$2949, left$2950, right$2951, body$2952, operator$2953, oldInIteration$2954, marker$2955 = markerCreate$2380();
        init$2947 = test$2948 = update$2949 = null;
        expectKeyword$2388('for');
        if (// http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
            matchContextualKeyword$2391('each')) {
            throwError$2384({}, Messages$2325.EachNotAllowed);
        }
        expect$2387('(');
        if (match$2389(';')) {
            lex$2377();
        } else {
            if (matchKeyword$2390('var') || matchKeyword$2390('let') || matchKeyword$2390('const')) {
                state$2344.allowIn = false;
                init$2947 = parseForVariableDeclaration$2443();
                state$2344.allowIn = true;
                if (init$2947.declarations.length === 1) {
                    if (matchKeyword$2390('in') || matchContextualKeyword$2391('of')) {
                        operator$2953 = lookahead$2342;
                        if (!((operator$2953.value === 'in' || init$2947.kind !== 'var') && init$2947.declarations[0].init)) {
                            lex$2377();
                            left$2950 = init$2947;
                            right$2951 = parseExpression$2424();
                            init$2947 = null;
                        }
                    }
                }
            } else {
                state$2344.allowIn = false;
                init$2947 = parseExpression$2424();
                state$2344.allowIn = true;
                if (matchContextualKeyword$2391('of')) {
                    operator$2953 = lex$2377();
                    left$2950 = init$2947;
                    right$2951 = parseExpression$2424();
                    init$2947 = null;
                } else if (matchKeyword$2390('in')) {
                    if (// LeftHandSideExpression
                        !isAssignableLeftHandSide$2395(init$2947)) {
                        throwError$2384({}, Messages$2325.InvalidLHSInForIn);
                    }
                    operator$2953 = lex$2377();
                    left$2950 = init$2947;
                    right$2951 = parseExpression$2424();
                    init$2947 = null;
                }
            }
            if (typeof left$2950 === 'undefined') {
                expect$2387(';');
            }
        }
        if (typeof left$2950 === 'undefined') {
            if (!match$2389(';')) {
                test$2948 = parseExpression$2424();
            }
            expect$2387(';');
            if (!match$2389(')')) {
                update$2949 = parseExpression$2424();
            }
        }
        expect$2387(')');
        oldInIteration$2954 = state$2344.inIteration;
        state$2344.inIteration = true;
        if (!(opts$2946 !== undefined && opts$2946.ignoreBody)) {
            body$2952 = parseStatement$2455();
        }
        state$2344.inIteration = oldInIteration$2954;
        if (typeof left$2950 === 'undefined') {
            return markerApply$2382(marker$2955, delegate$2339.createForStatement(init$2947, test$2948, update$2949, body$2952));
        }
        if (operator$2953.value === 'in') {
            return markerApply$2382(marker$2955, delegate$2339.createForInStatement(left$2950, right$2951, body$2952));
        }
        return markerApply$2382(marker$2955, delegate$2339.createForOfStatement(left$2950, right$2951, body$2952));
    }
    function parseContinueStatement$2445() {
        var label$2956 = null, key$2957, marker$2958 = markerCreate$2380();
        expectKeyword$2388('continue');
        if (// Optimize the most common form: 'continue;'.
            lookahead$2342.value.charCodeAt(0) === 59) {
            lex$2377();
            if (!state$2344.inIteration) {
                throwError$2384({}, Messages$2325.IllegalContinue);
            }
            return markerApply$2382(marker$2958, delegate$2339.createContinueStatement(null));
        }
        if (peekLineTerminator$2383()) {
            if (!state$2344.inIteration) {
                throwError$2384({}, Messages$2325.IllegalContinue);
            }
            return markerApply$2382(marker$2958, delegate$2339.createContinueStatement(null));
        }
        if (lookahead$2342.type === Token$2320.Identifier) {
            label$2956 = parseVariableIdentifier$2427();
            key$2957 = '$' + label$2956.name;
            if (!Object.prototype.hasOwnProperty.call(state$2344.labelSet, key$2957)) {
                throwError$2384({}, Messages$2325.UnknownLabel, label$2956.name);
            }
        }
        consumeSemicolon$2393();
        if (label$2956 === null && !state$2344.inIteration) {
            throwError$2384({}, Messages$2325.IllegalContinue);
        }
        return markerApply$2382(marker$2958, delegate$2339.createContinueStatement(label$2956));
    }
    function parseBreakStatement$2446() {
        var label$2959 = null, key$2960, marker$2961 = markerCreate$2380();
        expectKeyword$2388('break');
        if (// Catch the very common case first: immediately a semicolon (char #59).
            lookahead$2342.value.charCodeAt(0) === 59) {
            lex$2377();
            if (!(state$2344.inIteration || state$2344.inSwitch)) {
                throwError$2384({}, Messages$2325.IllegalBreak);
            }
            return markerApply$2382(marker$2961, delegate$2339.createBreakStatement(null));
        }
        if (peekLineTerminator$2383()) {
            if (!(state$2344.inIteration || state$2344.inSwitch)) {
                throwError$2384({}, Messages$2325.IllegalBreak);
            }
            return markerApply$2382(marker$2961, delegate$2339.createBreakStatement(null));
        }
        if (lookahead$2342.type === Token$2320.Identifier) {
            label$2959 = parseVariableIdentifier$2427();
            key$2960 = '$' + label$2959.name;
            if (!Object.prototype.hasOwnProperty.call(state$2344.labelSet, key$2960)) {
                throwError$2384({}, Messages$2325.UnknownLabel, label$2959.name);
            }
        }
        consumeSemicolon$2393();
        if (label$2959 === null && !(state$2344.inIteration || state$2344.inSwitch)) {
            throwError$2384({}, Messages$2325.IllegalBreak);
        }
        return markerApply$2382(marker$2961, delegate$2339.createBreakStatement(label$2959));
    }
    function parseReturnStatement$2447() {
        var argument$2962 = null, marker$2963 = markerCreate$2380();
        expectKeyword$2388('return');
        if (!state$2344.inFunctionBody) {
            throwErrorTolerant$2385({}, Messages$2325.IllegalReturn);
        }
        if (// 'return' followed by a space and an identifier is very common.
            isIdentifierStart$2354(String(lookahead$2342.value).charCodeAt(0))) {
            argument$2962 = parseExpression$2424();
            consumeSemicolon$2393();
            return markerApply$2382(marker$2963, delegate$2339.createReturnStatement(argument$2962));
        }
        if (peekLineTerminator$2383()) {
            return markerApply$2382(marker$2963, delegate$2339.createReturnStatement(null));
        }
        if (!match$2389(';')) {
            if (!match$2389('}') && lookahead$2342.type !== Token$2320.EOF) {
                argument$2962 = parseExpression$2424();
            }
        }
        consumeSemicolon$2393();
        return markerApply$2382(marker$2963, delegate$2339.createReturnStatement(argument$2962));
    }
    function parseWithStatement$2448() {
        var object$2964, body$2965, marker$2966 = markerCreate$2380();
        if (strict$2330) {
            throwErrorTolerant$2385({}, Messages$2325.StrictModeWith);
        }
        expectKeyword$2388('with');
        expect$2387('(');
        object$2964 = parseExpression$2424();
        expect$2387(')');
        body$2965 = parseStatement$2455();
        return markerApply$2382(marker$2966, delegate$2339.createWithStatement(object$2964, body$2965));
    }
    function parseSwitchCase$2449() {
        var test$2967, consequent$2968 = [], sourceElement$2969, marker$2970 = markerCreate$2380();
        if (matchKeyword$2390('default')) {
            lex$2377();
            test$2967 = null;
        } else {
            expectKeyword$2388('case');
            test$2967 = parseExpression$2424();
        }
        expect$2387(':');
        while (streamIndex$2341 < length$2338) {
            if (match$2389('}') || matchKeyword$2390('default') || matchKeyword$2390('case')) {
                break;
            }
            sourceElement$2969 = parseSourceElement$2470();
            if (typeof sourceElement$2969 === 'undefined') {
                break;
            }
            consequent$2968.push(sourceElement$2969);
        }
        return markerApply$2382(marker$2970, delegate$2339.createSwitchCase(test$2967, consequent$2968));
    }
    function parseSwitchStatement$2450() {
        var discriminant$2971, cases$2972, clause$2973, oldInSwitch$2974, defaultFound$2975, marker$2976 = markerCreate$2380();
        expectKeyword$2388('switch');
        expect$2387('(');
        discriminant$2971 = parseExpression$2424();
        expect$2387(')');
        expect$2387('{');
        cases$2972 = [];
        if (match$2389('}')) {
            lex$2377();
            return markerApply$2382(marker$2976, delegate$2339.createSwitchStatement(discriminant$2971, cases$2972));
        }
        oldInSwitch$2974 = state$2344.inSwitch;
        state$2344.inSwitch = true;
        defaultFound$2975 = false;
        while (streamIndex$2341 < length$2338) {
            if (match$2389('}')) {
                break;
            }
            clause$2973 = parseSwitchCase$2449();
            if (clause$2973.test === null) {
                if (defaultFound$2975) {
                    throwError$2384({}, Messages$2325.MultipleDefaultsInSwitch);
                }
                defaultFound$2975 = true;
            }
            cases$2972.push(clause$2973);
        }
        state$2344.inSwitch = oldInSwitch$2974;
        expect$2387('}');
        return markerApply$2382(marker$2976, delegate$2339.createSwitchStatement(discriminant$2971, cases$2972));
    }
    function parseThrowStatement$2451() {
        var argument$2977, marker$2978 = markerCreate$2380();
        expectKeyword$2388('throw');
        if (peekLineTerminator$2383()) {
            throwError$2384({}, Messages$2325.NewlineAfterThrow);
        }
        argument$2977 = parseExpression$2424();
        consumeSemicolon$2393();
        return markerApply$2382(marker$2978, delegate$2339.createThrowStatement(argument$2977));
    }
    function parseCatchClause$2452() {
        var param$2979, body$2980, marker$2981 = markerCreate$2380();
        expectKeyword$2388('catch');
        expect$2387('(');
        if (match$2389(')')) {
            throwUnexpected$2386(lookahead$2342);
        }
        param$2979 = parseExpression$2424();
        if (// 12.14.1
            strict$2330 && param$2979.type === Syntax$2323.Identifier && isRestrictedWord$2358(param$2979.name)) {
            throwErrorTolerant$2385({}, Messages$2325.StrictCatchVariable);
        }
        expect$2387(')');
        body$2980 = parseBlock$2426();
        return markerApply$2382(marker$2981, delegate$2339.createCatchClause(param$2979, body$2980));
    }
    function parseTryStatement$2453() {
        var block$2982, handlers$2983 = [], finalizer$2984 = null, marker$2985 = markerCreate$2380();
        expectKeyword$2388('try');
        block$2982 = parseBlock$2426();
        if (matchKeyword$2390('catch')) {
            handlers$2983.push(parseCatchClause$2452());
        }
        if (matchKeyword$2390('finally')) {
            lex$2377();
            finalizer$2984 = parseBlock$2426();
        }
        if (handlers$2983.length === 0 && !finalizer$2984) {
            throwError$2384({}, Messages$2325.NoCatchOrFinally);
        }
        return markerApply$2382(marker$2985, delegate$2339.createTryStatement(block$2982, [], handlers$2983, finalizer$2984));
    }
    function parseDebuggerStatement$2454() {
        var marker$2986 = markerCreate$2380();
        expectKeyword$2388('debugger');
        consumeSemicolon$2393();
        return markerApply$2382(marker$2986, delegate$2339.createDebuggerStatement());
    }
    function parseStatement$2455() {
        var type$2987 = lookahead$2342.type, marker$2988, expr$2989, labeledBody$2990, key$2991;
        if (type$2987 === Token$2320.EOF) {
            throwUnexpected$2386(lookahead$2342);
        }
        if (type$2987 === Token$2320.Punctuator) {
            switch (lookahead$2342.value) {
            case ';':
                return parseEmptyStatement$2438();
            case '{':
                return parseBlock$2426();
            case '(':
                return parseExpressionStatement$2439();
            default:
                break;
            }
        }
        if (type$2987 === Token$2320.Keyword) {
            switch (lookahead$2342.value) {
            case 'break':
                return parseBreakStatement$2446();
            case 'continue':
                return parseContinueStatement$2445();
            case 'debugger':
                return parseDebuggerStatement$2454();
            case 'do':
                return parseDoWhileStatement$2441();
            case 'for':
                return parseForStatement$2444();
            case 'function':
                return parseFunctionDeclaration$2461();
            case 'class':
                return parseClassDeclaration$2468();
            case 'if':
                return parseIfStatement$2440();
            case 'return':
                return parseReturnStatement$2447();
            case 'switch':
                return parseSwitchStatement$2450();
            case 'throw':
                return parseThrowStatement$2451();
            case 'try':
                return parseTryStatement$2453();
            case 'var':
                return parseVariableStatement$2430();
            case 'while':
                return parseWhileStatement$2442();
            case 'with':
                return parseWithStatement$2448();
            default:
                break;
            }
        }
        marker$2988 = markerCreate$2380();
        expr$2989 = parseExpression$2424();
        if (// 12.12 Labelled Statements
            expr$2989.type === Syntax$2323.Identifier && match$2389(':')) {
            lex$2377();
            key$2991 = '$' + expr$2989.name;
            if (Object.prototype.hasOwnProperty.call(state$2344.labelSet, key$2991)) {
                throwError$2384({}, Messages$2325.Redeclaration, 'Label', expr$2989.name);
            }
            state$2344.labelSet[key$2991] = true;
            labeledBody$2990 = parseStatement$2455();
            delete state$2344.labelSet[key$2991];
            return markerApply$2382(marker$2988, delegate$2339.createLabeledStatement(expr$2989, labeledBody$2990));
        }
        consumeSemicolon$2393();
        return markerApply$2382(marker$2988, delegate$2339.createExpressionStatement(expr$2989));
    }
    function parseConciseBody$2456() {
        if (match$2389('{')) {
            return parseFunctionSourceElements$2457();
        }
        return parseAssignmentExpression$2423();
    }
    function parseFunctionSourceElements$2457() {
        var sourceElement$2992, sourceElements$2993 = [], token$2994, directive$2995, firstRestricted$2996, oldLabelSet$2997, oldInIteration$2998, oldInSwitch$2999, oldInFunctionBody$3000, oldParenthesizedCount$3001, marker$3002 = markerCreate$2380();
        expect$2387('{');
        while (streamIndex$2341 < length$2338) {
            if (lookahead$2342.type !== Token$2320.StringLiteral) {
                break;
            }
            token$2994 = lookahead$2342;
            sourceElement$2992 = parseSourceElement$2470();
            sourceElements$2993.push(sourceElement$2992);
            if (sourceElement$2992.expression.type !== Syntax$2323.Literal) {
                // this is not directive
                break;
            }
            directive$2995 = token$2994.value;
            if (directive$2995 === 'use strict') {
                strict$2330 = true;
                if (firstRestricted$2996) {
                    throwErrorTolerant$2385(firstRestricted$2996, Messages$2325.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$2996 && token$2994.octal) {
                    firstRestricted$2996 = token$2994;
                }
            }
        }
        oldLabelSet$2997 = state$2344.labelSet;
        oldInIteration$2998 = state$2344.inIteration;
        oldInSwitch$2999 = state$2344.inSwitch;
        oldInFunctionBody$3000 = state$2344.inFunctionBody;
        oldParenthesizedCount$3001 = state$2344.parenthesizedCount;
        state$2344.labelSet = {};
        state$2344.inIteration = false;
        state$2344.inSwitch = false;
        state$2344.inFunctionBody = true;
        state$2344.parenthesizedCount = 0;
        while (streamIndex$2341 < length$2338) {
            if (match$2389('}')) {
                break;
            }
            sourceElement$2992 = parseSourceElement$2470();
            if (typeof sourceElement$2992 === 'undefined') {
                break;
            }
            sourceElements$2993.push(sourceElement$2992);
        }
        expect$2387('}');
        state$2344.labelSet = oldLabelSet$2997;
        state$2344.inIteration = oldInIteration$2998;
        state$2344.inSwitch = oldInSwitch$2999;
        state$2344.inFunctionBody = oldInFunctionBody$3000;
        state$2344.parenthesizedCount = oldParenthesizedCount$3001;
        return markerApply$2382(marker$3002, delegate$2339.createBlockStatement(sourceElements$2993));
    }
    function validateParam$2458(options$3003, param$3004, name$3005) {
        var key$3006 = '$' + name$3005;
        if (strict$2330) {
            if (isRestrictedWord$2358(name$3005)) {
                options$3003.stricted = param$3004;
                options$3003.message = Messages$2325.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$3003.paramSet, key$3006)) {
                options$3003.stricted = param$3004;
                options$3003.message = Messages$2325.StrictParamDupe;
            }
        } else if (!options$3003.firstRestricted) {
            if (isRestrictedWord$2358(name$3005)) {
                options$3003.firstRestricted = param$3004;
                options$3003.message = Messages$2325.StrictParamName;
            } else if (isStrictModeReservedWord$2357(name$3005)) {
                options$3003.firstRestricted = param$3004;
                options$3003.message = Messages$2325.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$3003.paramSet, key$3006)) {
                options$3003.firstRestricted = param$3004;
                options$3003.message = Messages$2325.StrictParamDupe;
            }
        }
        options$3003.paramSet[key$3006] = true;
    }
    function parseParam$2459(options$3007) {
        var token$3008, rest$3009, param$3010, def$3011;
        token$3008 = lookahead$2342;
        if (token$3008.value === '...') {
            token$3008 = lex$2377();
            rest$3009 = true;
        }
        if (match$2389('[')) {
            param$3010 = parseArrayInitialiser$2396();
            reinterpretAsDestructuredParameter$2420(options$3007, param$3010);
        } else if (match$2389('{')) {
            if (rest$3009) {
                throwError$2384({}, Messages$2325.ObjectPatternAsRestParameter);
            }
            param$3010 = parseObjectInitialiser$2401();
            reinterpretAsDestructuredParameter$2420(options$3007, param$3010);
        } else {
            param$3010 = parseVariableIdentifier$2427();
            validateParam$2458(options$3007, token$3008, token$3008.value);
        }
        if (match$2389('=')) {
            if (rest$3009) {
                throwErrorTolerant$2385(lookahead$2342, Messages$2325.DefaultRestParameter);
            }
            lex$2377();
            def$3011 = parseAssignmentExpression$2423();
            ++options$3007.defaultCount;
        }
        if (rest$3009) {
            if (!match$2389(')')) {
                throwError$2384({}, Messages$2325.ParameterAfterRestParameter);
            }
            options$3007.rest = param$3010;
            return false;
        }
        options$3007.params.push(param$3010);
        options$3007.defaults.push(def$3011);
        return !match$2389(')');
    }
    function parseParams$2460(firstRestricted$3012) {
        var options$3013;
        options$3013 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$3012
        };
        expect$2387('(');
        if (!match$2389(')')) {
            options$3013.paramSet = {};
            while (streamIndex$2341 < length$2338) {
                if (!parseParam$2459(options$3013)) {
                    break;
                }
                expect$2387(',');
            }
        }
        expect$2387(')');
        if (options$3013.defaultCount === 0) {
            options$3013.defaults = [];
        }
        return options$3013;
    }
    function parseFunctionDeclaration$2461() {
        var id$3014, body$3015, token$3016, tmp$3017, firstRestricted$3018, message$3019, previousStrict$3020, previousYieldAllowed$3021, generator$3022, marker$3023 = markerCreate$2380();
        expectKeyword$2388('function');
        generator$3022 = false;
        if (match$2389('*')) {
            lex$2377();
            generator$3022 = true;
        }
        token$3016 = lookahead$2342;
        id$3014 = parseVariableIdentifier$2427();
        if (strict$2330) {
            if (isRestrictedWord$2358(token$3016.value)) {
                throwErrorTolerant$2385(token$3016, Messages$2325.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$2358(token$3016.value)) {
                firstRestricted$3018 = token$3016;
                message$3019 = Messages$2325.StrictFunctionName;
            } else if (isStrictModeReservedWord$2357(token$3016.value)) {
                firstRestricted$3018 = token$3016;
                message$3019 = Messages$2325.StrictReservedWord;
            }
        }
        tmp$3017 = parseParams$2460(firstRestricted$3018);
        firstRestricted$3018 = tmp$3017.firstRestricted;
        if (tmp$3017.message) {
            message$3019 = tmp$3017.message;
        }
        previousStrict$3020 = strict$2330;
        previousYieldAllowed$3021 = state$2344.yieldAllowed;
        state$2344.yieldAllowed = generator$3022;
        body$3015 = parseFunctionSourceElements$2457();
        if (strict$2330 && firstRestricted$3018) {
            throwError$2384(firstRestricted$3018, message$3019);
        }
        if (strict$2330 && tmp$3017.stricted) {
            throwErrorTolerant$2385(tmp$3017.stricted, message$3019);
        }
        strict$2330 = previousStrict$3020;
        state$2344.yieldAllowed = previousYieldAllowed$3021;
        return markerApply$2382(marker$3023, delegate$2339.createFunctionDeclaration(id$3014, tmp$3017.params, tmp$3017.defaults, body$3015, tmp$3017.rest, generator$3022, false));
    }
    function parseFunctionExpression$2462() {
        var token$3024, id$3025 = null, firstRestricted$3026, message$3027, tmp$3028, body$3029, previousStrict$3030, previousYieldAllowed$3031, generator$3032, marker$3033 = markerCreate$2380();
        expectKeyword$2388('function');
        generator$3032 = false;
        if (match$2389('*')) {
            lex$2377();
            generator$3032 = true;
        }
        if (!match$2389('(')) {
            token$3024 = lookahead$2342;
            id$3025 = parseVariableIdentifier$2427();
            if (strict$2330) {
                if (isRestrictedWord$2358(token$3024.value)) {
                    throwErrorTolerant$2385(token$3024, Messages$2325.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$2358(token$3024.value)) {
                    firstRestricted$3026 = token$3024;
                    message$3027 = Messages$2325.StrictFunctionName;
                } else if (isStrictModeReservedWord$2357(token$3024.value)) {
                    firstRestricted$3026 = token$3024;
                    message$3027 = Messages$2325.StrictReservedWord;
                }
            }
        }
        tmp$3028 = parseParams$2460(firstRestricted$3026);
        firstRestricted$3026 = tmp$3028.firstRestricted;
        if (tmp$3028.message) {
            message$3027 = tmp$3028.message;
        }
        previousStrict$3030 = strict$2330;
        previousYieldAllowed$3031 = state$2344.yieldAllowed;
        state$2344.yieldAllowed = generator$3032;
        body$3029 = parseFunctionSourceElements$2457();
        if (strict$2330 && firstRestricted$3026) {
            throwError$2384(firstRestricted$3026, message$3027);
        }
        if (strict$2330 && tmp$3028.stricted) {
            throwErrorTolerant$2385(tmp$3028.stricted, message$3027);
        }
        strict$2330 = previousStrict$3030;
        state$2344.yieldAllowed = previousYieldAllowed$3031;
        return markerApply$2382(marker$3033, delegate$2339.createFunctionExpression(id$3025, tmp$3028.params, tmp$3028.defaults, body$3029, tmp$3028.rest, generator$3032, false));
    }
    function parseYieldExpression$2463() {
        var yieldToken$3034, delegateFlag$3035, expr$3036, marker$3037 = markerCreate$2380();
        yieldToken$3034 = lex$2377();
        assert$2347(yieldToken$3034.value === 'yield', 'Called parseYieldExpression with non-yield lookahead.');
        if (!state$2344.yieldAllowed) {
            throwErrorTolerant$2385({}, Messages$2325.IllegalYield);
        }
        delegateFlag$3035 = false;
        if (match$2389('*')) {
            lex$2377();
            delegateFlag$3035 = true;
        }
        expr$3036 = parseAssignmentExpression$2423();
        return markerApply$2382(marker$3037, delegate$2339.createYieldExpression(expr$3036, delegateFlag$3035));
    }
    function parseMethodDefinition$2464(existingPropNames$3038) {
        var token$3039, key$3040, param$3041, propType$3042, isValidDuplicateProp$3043 = false, marker$3044 = markerCreate$2380();
        if (lookahead$2342.value === 'static') {
            propType$3042 = ClassPropertyType$2328.static;
            lex$2377();
        } else {
            propType$3042 = ClassPropertyType$2328.prototype;
        }
        if (match$2389('*')) {
            lex$2377();
            return markerApply$2382(marker$3044, delegate$2339.createMethodDefinition(propType$3042, '', parseObjectPropertyKey$2399(), parsePropertyMethodFunction$2398({ generator: true })));
        }
        token$3039 = lookahead$2342;
        key$3040 = parseObjectPropertyKey$2399();
        if (token$3039.value === 'get' && !match$2389('(')) {
            key$3040 = parseObjectPropertyKey$2399();
            if (// It is a syntax error if any other properties have a name
                // duplicating this one unless they are a setter
                existingPropNames$3038[propType$3042].hasOwnProperty(key$3040.name)) {
                isValidDuplicateProp$3043 = // There isn't already a getter for this prop
                existingPropNames$3038[propType$3042][key$3040.name].get === undefined && // There isn't already a data prop by this name
                existingPropNames$3038[propType$3042][key$3040.name].data === undefined && // The only existing prop by this name is a setter
                existingPropNames$3038[propType$3042][key$3040.name].set !== undefined;
                if (!isValidDuplicateProp$3043) {
                    throwError$2384(key$3040, Messages$2325.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$3038[propType$3042][key$3040.name] = {};
            }
            existingPropNames$3038[propType$3042][key$3040.name].get = true;
            expect$2387('(');
            expect$2387(')');
            return markerApply$2382(marker$3044, delegate$2339.createMethodDefinition(propType$3042, 'get', key$3040, parsePropertyFunction$2397({ generator: false })));
        }
        if (token$3039.value === 'set' && !match$2389('(')) {
            key$3040 = parseObjectPropertyKey$2399();
            if (// It is a syntax error if any other properties have a name
                // duplicating this one unless they are a getter
                existingPropNames$3038[propType$3042].hasOwnProperty(key$3040.name)) {
                isValidDuplicateProp$3043 = // There isn't already a setter for this prop
                existingPropNames$3038[propType$3042][key$3040.name].set === undefined && // There isn't already a data prop by this name
                existingPropNames$3038[propType$3042][key$3040.name].data === undefined && // The only existing prop by this name is a getter
                existingPropNames$3038[propType$3042][key$3040.name].get !== undefined;
                if (!isValidDuplicateProp$3043) {
                    throwError$2384(key$3040, Messages$2325.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$3038[propType$3042][key$3040.name] = {};
            }
            existingPropNames$3038[propType$3042][key$3040.name].set = true;
            expect$2387('(');
            token$3039 = lookahead$2342;
            param$3041 = [parseVariableIdentifier$2427()];
            expect$2387(')');
            return markerApply$2382(marker$3044, delegate$2339.createMethodDefinition(propType$3042, 'set', key$3040, parsePropertyFunction$2397({
                params: param$3041,
                generator: false,
                name: token$3039
            })));
        }
        if (// It is a syntax error if any other properties have the same name as a
            // non-getter, non-setter method
            existingPropNames$3038[propType$3042].hasOwnProperty(key$3040.name)) {
            throwError$2384(key$3040, Messages$2325.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$3038[propType$3042][key$3040.name] = {};
        }
        existingPropNames$3038[propType$3042][key$3040.name].data = true;
        return markerApply$2382(marker$3044, delegate$2339.createMethodDefinition(propType$3042, '', key$3040, parsePropertyMethodFunction$2398({ generator: false })));
    }
    function parseClassElement$2465(existingProps$3045) {
        if (match$2389(';')) {
            lex$2377();
            return;
        }
        return parseMethodDefinition$2464(existingProps$3045);
    }
    function parseClassBody$2466() {
        var classElement$3046, classElements$3047 = [], existingProps$3048 = {}, marker$3049 = markerCreate$2380();
        existingProps$3048[ClassPropertyType$2328.static] = {};
        existingProps$3048[ClassPropertyType$2328.prototype] = {};
        expect$2387('{');
        while (streamIndex$2341 < length$2338) {
            if (match$2389('}')) {
                break;
            }
            classElement$3046 = parseClassElement$2465(existingProps$3048);
            if (typeof classElement$3046 !== 'undefined') {
                classElements$3047.push(classElement$3046);
            }
        }
        expect$2387('}');
        return markerApply$2382(marker$3049, delegate$2339.createClassBody(classElements$3047));
    }
    function parseClassExpression$2467() {
        var id$3050, previousYieldAllowed$3051, superClass$3052 = null, marker$3053 = markerCreate$2380();
        expectKeyword$2388('class');
        if (!matchKeyword$2390('extends') && !match$2389('{')) {
            id$3050 = parseVariableIdentifier$2427();
        }
        if (matchKeyword$2390('extends')) {
            expectKeyword$2388('extends');
            previousYieldAllowed$3051 = state$2344.yieldAllowed;
            state$2344.yieldAllowed = false;
            superClass$3052 = parseAssignmentExpression$2423();
            state$2344.yieldAllowed = previousYieldAllowed$3051;
        }
        return markerApply$2382(marker$3053, delegate$2339.createClassExpression(id$3050, superClass$3052, parseClassBody$2466()));
    }
    function parseClassDeclaration$2468() {
        var id$3054, previousYieldAllowed$3055, superClass$3056 = null, marker$3057 = markerCreate$2380();
        expectKeyword$2388('class');
        id$3054 = parseVariableIdentifier$2427();
        if (matchKeyword$2390('extends')) {
            expectKeyword$2388('extends');
            previousYieldAllowed$3055 = state$2344.yieldAllowed;
            state$2344.yieldAllowed = false;
            superClass$3056 = parseAssignmentExpression$2423();
            state$2344.yieldAllowed = previousYieldAllowed$3055;
        }
        return markerApply$2382(marker$3057, delegate$2339.createClassDeclaration(id$3054, superClass$3056, parseClassBody$2466()));
    }
    function matchModuleDeclaration$2469() {
        var id$3058;
        if (matchContextualKeyword$2391('module')) {
            id$3058 = lookahead2$2379();
            return id$3058.type === Token$2320.StringLiteral || id$3058.type === Token$2320.Identifier;
        }
        return false;
    }
    function parseSourceElement$2470() {
        if (lookahead$2342.type === Token$2320.Keyword) {
            switch (lookahead$2342.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$2431(lookahead$2342.value);
            case 'function':
                return parseFunctionDeclaration$2461();
            case 'export':
                return parseExportDeclaration$2435();
            case 'import':
                return parseImportDeclaration$2436();
            default:
                return parseStatement$2455();
            }
        }
        if (matchModuleDeclaration$2469()) {
            throwError$2384({}, Messages$2325.NestedModule);
        }
        if (lookahead$2342.type !== Token$2320.EOF) {
            return parseStatement$2455();
        }
    }
    function parseProgramElement$2471() {
        if (lookahead$2342.type === Token$2320.Keyword) {
            switch (lookahead$2342.value) {
            case 'export':
                return parseExportDeclaration$2435();
            case 'import':
                return parseImportDeclaration$2436();
            }
        }
        if (matchModuleDeclaration$2469()) {
            return parseModuleDeclaration$2432();
        }
        return parseSourceElement$2470();
    }
    function parseProgramElements$2472() {
        var sourceElement$3059, sourceElements$3060 = [], token$3061, directive$3062, firstRestricted$3063;
        while (streamIndex$2341 < length$2338) {
            token$3061 = lookahead$2342;
            if (token$3061.type !== Token$2320.StringLiteral) {
                break;
            }
            sourceElement$3059 = parseProgramElement$2471();
            sourceElements$3060.push(sourceElement$3059);
            if (sourceElement$3059.expression.type !== Syntax$2323.Literal) {
                // this is not directive
                break;
            }
            directive$3062 = token$3061.value;
            if (directive$3062 === 'use strict') {
                strict$2330 = true;
                if (firstRestricted$3063) {
                    throwErrorTolerant$2385(firstRestricted$3063, Messages$2325.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$3063 && token$3061.octal) {
                    firstRestricted$3063 = token$3061;
                }
            }
        }
        while (streamIndex$2341 < length$2338) {
            sourceElement$3059 = parseProgramElement$2471();
            if (typeof sourceElement$3059 === 'undefined') {
                break;
            }
            sourceElements$3060.push(sourceElement$3059);
        }
        return sourceElements$3060;
    }
    function parseModuleElement$2473() {
        return parseSourceElement$2470();
    }
    function parseModuleElements$2474() {
        var list$3064 = [], statement$3065;
        while (streamIndex$2341 < length$2338) {
            if (match$2389('}')) {
                break;
            }
            statement$3065 = parseModuleElement$2473();
            if (typeof statement$3065 === 'undefined') {
                break;
            }
            list$3064.push(statement$3065);
        }
        return list$3064;
    }
    function parseModuleBlock$2475() {
        var block$3066, marker$3067 = markerCreate$2380();
        expect$2387('{');
        block$3066 = parseModuleElements$2474();
        expect$2387('}');
        return markerApply$2382(marker$3067, delegate$2339.createBlockStatement(block$3066));
    }
    function parseProgram$2476() {
        var body$3068, marker$3069 = markerCreate$2380();
        strict$2330 = false;
        peek$2378();
        body$3068 = parseProgramElements$2472();
        return markerApply$2382(marker$3069, delegate$2339.createProgram(body$3068));
    }
    function addComment$2477(type$3070, value$3071, start$3072, end$3073, loc$3074) {
        var comment$3075;
        assert$2347(typeof start$3072 === 'number', 'Comment must have valid position');
        if (// Because the way the actual token is scanned, often the comments
            // (if any) are skipped twice during the lexical analysis.
            // Thus, we need to skip adding a comment if the comment array already
            // handled it.
            state$2344.lastCommentStart >= start$3072) {
            return;
        }
        state$2344.lastCommentStart = start$3072;
        comment$3075 = {
            type: type$3070,
            value: value$3071
        };
        if (extra$2346.range) {
            comment$3075.range = [
                start$3072,
                end$3073
            ];
        }
        if (extra$2346.loc) {
            comment$3075.loc = loc$3074;
        }
        extra$2346.comments.push(comment$3075);
        if (extra$2346.attachComment) {
            extra$2346.leadingComments.push(comment$3075);
            extra$2346.trailingComments.push(comment$3075);
        }
    }
    function scanComment$2478() {
        var comment$3076, ch$3077, loc$3078, start$3079, blockComment$3080, lineComment$3081;
        comment$3076 = '';
        blockComment$3080 = false;
        lineComment$3081 = false;
        while (index$2331 < length$2338) {
            ch$3077 = source$2329[index$2331];
            if (lineComment$3081) {
                ch$3077 = source$2329[index$2331++];
                if (isLineTerminator$2353(ch$3077.charCodeAt(0))) {
                    loc$3078.end = {
                        line: lineNumber$2332,
                        column: index$2331 - lineStart$2333 - 1
                    };
                    lineComment$3081 = false;
                    addComment$2477('Line', comment$3076, start$3079, index$2331 - 1, loc$3078);
                    if (ch$3077 === '\r' && source$2329[index$2331] === '\n') {
                        ++index$2331;
                    }
                    ++lineNumber$2332;
                    lineStart$2333 = index$2331;
                    comment$3076 = '';
                } else if (index$2331 >= length$2338) {
                    lineComment$3081 = false;
                    comment$3076 += ch$3077;
                    loc$3078.end = {
                        line: lineNumber$2332,
                        column: length$2338 - lineStart$2333
                    };
                    addComment$2477('Line', comment$3076, start$3079, length$2338, loc$3078);
                } else {
                    comment$3076 += ch$3077;
                }
            } else if (blockComment$3080) {
                if (isLineTerminator$2353(ch$3077.charCodeAt(0))) {
                    if (ch$3077 === '\r' && source$2329[index$2331 + 1] === '\n') {
                        ++index$2331;
                        comment$3076 += '\r\n';
                    } else {
                        comment$3076 += ch$3077;
                    }
                    ++lineNumber$2332;
                    ++index$2331;
                    lineStart$2333 = index$2331;
                    if (index$2331 >= length$2338) {
                        throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$3077 = source$2329[index$2331++];
                    if (index$2331 >= length$2338) {
                        throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$3076 += ch$3077;
                    if (ch$3077 === '*') {
                        ch$3077 = source$2329[index$2331];
                        if (ch$3077 === '/') {
                            comment$3076 = comment$3076.substr(0, comment$3076.length - 1);
                            blockComment$3080 = false;
                            ++index$2331;
                            loc$3078.end = {
                                line: lineNumber$2332,
                                column: index$2331 - lineStart$2333
                            };
                            addComment$2477('Block', comment$3076, start$3079, index$2331, loc$3078);
                            comment$3076 = '';
                        }
                    }
                }
            } else if (ch$3077 === '/') {
                ch$3077 = source$2329[index$2331 + 1];
                if (ch$3077 === '/') {
                    loc$3078 = {
                        start: {
                            line: lineNumber$2332,
                            column: index$2331 - lineStart$2333
                        }
                    };
                    start$3079 = index$2331;
                    index$2331 += 2;
                    lineComment$3081 = true;
                    if (index$2331 >= length$2338) {
                        loc$3078.end = {
                            line: lineNumber$2332,
                            column: index$2331 - lineStart$2333
                        };
                        lineComment$3081 = false;
                        addComment$2477('Line', comment$3076, start$3079, index$2331, loc$3078);
                    }
                } else if (ch$3077 === '*') {
                    start$3079 = index$2331;
                    index$2331 += 2;
                    blockComment$3080 = true;
                    loc$3078 = {
                        start: {
                            line: lineNumber$2332,
                            column: index$2331 - lineStart$2333 - 2
                        }
                    };
                    if (index$2331 >= length$2338) {
                        throwError$2384({}, Messages$2325.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$2352(ch$3077.charCodeAt(0))) {
                ++index$2331;
            } else if (isLineTerminator$2353(ch$3077.charCodeAt(0))) {
                ++index$2331;
                if (ch$3077 === '\r' && source$2329[index$2331] === '\n') {
                    ++index$2331;
                }
                ++lineNumber$2332;
                lineStart$2333 = index$2331;
            } else {
                break;
            }
        }
    }
    function collectToken$2479() {
        var start$3082, loc$3083, token$3084, range$3085, value$3086;
        skipComment$2360();
        start$3082 = index$2331;
        loc$3083 = {
            start: {
                line: lineNumber$2332,
                column: index$2331 - lineStart$2333
            }
        };
        token$3084 = extra$2346.advance();
        loc$3083.end = {
            line: lineNumber$2332,
            column: index$2331 - lineStart$2333
        };
        if (token$3084.type !== Token$2320.EOF) {
            range$3085 = [
                token$3084.range[0],
                token$3084.range[1]
            ];
            value$3086 = source$2329.slice(token$3084.range[0], token$3084.range[1]);
            extra$2346.tokens.push({
                type: TokenName$2321[token$3084.type],
                value: value$3086,
                range: range$3085,
                loc: loc$3083
            });
        }
        return token$3084;
    }
    function collectRegex$2480() {
        var pos$3087, loc$3088, regex$3089, token$3090;
        skipComment$2360();
        pos$3087 = index$2331;
        loc$3088 = {
            start: {
                line: lineNumber$2332,
                column: index$2331 - lineStart$2333
            }
        };
        regex$3089 = extra$2346.scanRegExp();
        loc$3088.end = {
            line: lineNumber$2332,
            column: index$2331 - lineStart$2333
        };
        if (!extra$2346.tokenize) {
            if (// Pop the previous token, which is likely '/' or '/='
                extra$2346.tokens.length > 0) {
                token$3090 = extra$2346.tokens[extra$2346.tokens.length - 1];
                if (token$3090.range[0] === pos$3087 && token$3090.type === 'Punctuator') {
                    if (token$3090.value === '/' || token$3090.value === '/=') {
                        extra$2346.tokens.pop();
                    }
                }
            }
            extra$2346.tokens.push({
                type: 'RegularExpression',
                value: regex$3089.literal,
                range: [
                    pos$3087,
                    index$2331
                ],
                loc: loc$3088
            });
        }
        return regex$3089;
    }
    function filterTokenLocation$2481() {
        var i$3091, entry$3092, token$3093, tokens$3094 = [];
        for (i$3091 = 0; i$3091 < extra$2346.tokens.length; ++i$3091) {
            entry$3092 = extra$2346.tokens[i$3091];
            token$3093 = {
                type: entry$3092.type,
                value: entry$3092.value
            };
            if (extra$2346.range) {
                token$3093.range = entry$3092.range;
            }
            if (extra$2346.loc) {
                token$3093.loc = entry$3092.loc;
            }
            tokens$3094.push(token$3093);
        }
        extra$2346.tokens = tokens$3094;
    }
    function patch$2482() {
        if (extra$2346.comments) {
            extra$2346.skipComment = skipComment$2360;
            skipComment$2360 = scanComment$2478;
        }
        if (typeof extra$2346.tokens !== 'undefined') {
            extra$2346.advance = advance$2376;
            extra$2346.scanRegExp = scanRegExp$2373;
            advance$2376 = collectToken$2479;
            scanRegExp$2373 = collectRegex$2480;
        }
    }
    function unpatch$2483() {
        if (typeof extra$2346.skipComment === 'function') {
            skipComment$2360 = extra$2346.skipComment;
        }
        if (typeof extra$2346.scanRegExp === 'function') {
            advance$2376 = extra$2346.advance;
            scanRegExp$2373 = extra$2346.scanRegExp;
        }
    }
    function extend$2484(object$3095, properties$3096) {
        var entry$3097, result$3098 = {};
        for (entry$3097 in object$3095) {
            if (object$3095.hasOwnProperty(entry$3097)) {
                result$3098[entry$3097] = object$3095[entry$3097];
            }
        }
        for (entry$3097 in properties$3096) {
            if (properties$3096.hasOwnProperty(entry$3097)) {
                result$3098[entry$3097] = properties$3096[entry$3097];
            }
        }
        return result$3098;
    }
    function tokenize$2485(code$3099, options$3100) {
        var toString$3101, token$3102, tokens$3103;
        toString$3101 = String;
        if (typeof code$3099 !== 'string' && !(code$3099 instanceof String)) {
            code$3099 = toString$3101(code$3099);
        }
        delegate$2339 = SyntaxTreeDelegate$2327;
        source$2329 = code$3099;
        index$2331 = 0;
        lineNumber$2332 = source$2329.length > 0 ? 1 : 0;
        lineStart$2333 = 0;
        length$2338 = source$2329.length;
        lookahead$2342 = null;
        state$2344 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1
        };
        extra$2346 = {};
        // Options matching.
        options$3100 = options$3100 || {};
        // Of course we collect tokens here.
        options$3100.tokens = true;
        extra$2346.tokens = [];
        extra$2346.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$2346.openParenToken = -1;
        extra$2346.openCurlyToken = -1;
        extra$2346.range = typeof options$3100.range === 'boolean' && options$3100.range;
        extra$2346.loc = typeof options$3100.loc === 'boolean' && options$3100.loc;
        if (typeof options$3100.comment === 'boolean' && options$3100.comment) {
            extra$2346.comments = [];
        }
        if (typeof options$3100.tolerant === 'boolean' && options$3100.tolerant) {
            extra$2346.errors = [];
        }
        if (length$2338 > 0) {
            if (typeof source$2329[0] === 'undefined') {
                if (// Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    code$3099 instanceof String) {
                    source$2329 = code$3099.valueOf();
                }
            }
        }
        patch$2482();
        try {
            peek$2378();
            if (lookahead$2342.type === Token$2320.EOF) {
                return extra$2346.tokens;
            }
            token$3102 = lex$2377();
            while (lookahead$2342.type !== Token$2320.EOF) {
                try {
                    token$3102 = lex$2377();
                } catch (lexError$3104) {
                    token$3102 = lookahead$2342;
                    if (extra$2346.errors) {
                        extra$2346.errors.push(lexError$3104);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$3104;
                    }
                }
            }
            filterTokenLocation$2481();
            tokens$3103 = extra$2346.tokens;
            if (typeof extra$2346.comments !== 'undefined') {
                tokens$3103.comments = extra$2346.comments;
            }
            if (typeof extra$2346.errors !== 'undefined') {
                tokens$3103.errors = extra$2346.errors;
            }
        } catch (e$3105) {
            throw e$3105;
        } finally {
            unpatch$2483();
            extra$2346 = {};
        }
        return tokens$3103;
    }
    function blockAllowed$2486(toks$3106, start$3107, inExprDelim$3108, parentIsBlock$3109) {
        var assignOps$3110 = [
            '=',
            '+=',
            '-=',
            '*=',
            '/=',
            '%=',
            '<<=',
            '>>=',
            '>>>=',
            '&=',
            '|=',
            '^=',
            ','
        ];
        var binaryOps$3111 = [
            '+',
            '-',
            '*',
            '/',
            '%',
            '<<',
            '>>',
            '>>>',
            '&',
            '|',
            '^',
            '&&',
            '||',
            '?',
            ':',
            '===',
            '==',
            '>=',
            '<=',
            '<',
            '>',
            '!=',
            '!==',
            'instanceof'
        ];
        var unaryOps$3112 = [
            '++',
            '--',
            '~',
            '!',
            'delete',
            'void',
            'typeof',
            'yield',
            'throw',
            'new'
        ];
        function back$3113(n$3114) {
            var idx$3115 = toks$3106.length - n$3114 > 0 ? toks$3106.length - n$3114 : 0;
            return toks$3106[idx$3115];
        }
        if (inExprDelim$3108 && toks$3106.length - (start$3107 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$3113(start$3107 + 2).value === ':' && parentIsBlock$3109) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$2348(back$3113(start$3107 + 2).value, unaryOps$3112.concat(binaryOps$3111).concat(assignOps$3110))) {
            // ... + {...}
            return false;
        } else if (back$3113(start$3107 + 2).value === 'return') {
            var // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            currLineNumber$3116 = typeof back$3113(start$3107 + 1).startLineNumber !== 'undefined' ? back$3113(start$3107 + 1).startLineNumber : back$3113(start$3107 + 1).lineNumber;
            if (back$3113(start$3107 + 2).lineNumber !== currLineNumber$3116) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$2348(back$3113(start$3107 + 2).value, [
                'void',
                'typeof',
                'in',
                'case',
                'delete'
            ])) {
            // ... in {}
            return false;
        } else {
            return true;
        }
    }
    var // Readtables
    readtables$2487 = {
        currentReadtable: {},
        // A readtable is invoked within `readToken`, but it can
        // return multiple tokens. We need to "queue" the stream of
        // tokens so that subsequent calls to `readToken` gets the
        // rest of the stream.
        queued: [],
        // A readtable can only override punctuators
        punctuators: ';,.:!?~=%&*+-/<>^|#@',
        has: function (ch$3117) {
            return readtables$2487.currentReadtable[ch$3117] && readtables$2487.punctuators.indexOf(ch$3117) !== -1;
        },
        getQueued: function () {
            return readtables$2487.queued.length ? readtables$2487.queued.shift() : null;
        },
        peekQueued: function (lookahead$3118) {
            lookahead$3118 = lookahead$3118 ? lookahead$3118 : 1;
            return readtables$2487.queued.length ? readtables$2487.queued[lookahead$3118 - 1] : null;
        },
        invoke: function (ch$3119, toks$3120) {
            var prevState$3121 = snapshotParserState$2488();
            var newStream$3122 = readtables$2487.currentReadtable[ch$3119](ch$3119, readtables$2487.readerAPI, toks$3120, source$2329, index$2331);
            if (!newStream$3122) {
                // Reset the state
                restoreParserState$2489(prevState$3121);
                return null;
            } else if (!Array.isArray(newStream$3122)) {
                newStream$3122 = [newStream$3122];
            }
            this.queued = this.queued.concat(newStream$3122);
            return this.getQueued();
        }
    };
    function snapshotParserState$2488() {
        return {
            index: index$2331,
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333
        };
    }
    function restoreParserState$2489(prevState$3123) {
        index$2331 = prevState$3123.index;
        lineNumber$2332 = prevState$3123.lineNumber;
        lineStart$2333 = prevState$3123.lineStart;
    }
    function suppressReadError$2490(func$3124) {
        var prevState$3125 = snapshotParserState$2488();
        try {
            return func$3124();
        } catch (e$3126) {
            if (!(e$3126 instanceof SyntaxError) && !(e$3126 instanceof TypeError)) {
                restoreParserState$2489(prevState$3125);
                return null;
            }
            throw e$3126;
        }
    }
    function makeIdentifier$2491(value$3127, opts$3128) {
        opts$3128 = opts$3128 || {};
        var type$3129 = Token$2320.Identifier;
        if (isKeyword$2359(value$3127)) {
            type$3129 = Token$2320.Keyword;
        } else if (value$3127 === 'null') {
            type$3129 = Token$2320.NullLiteral;
        } else if (value$3127 === 'true' || value$3127 === 'false') {
            type$3129 = Token$2320.BooleanLiteral;
        }
        return {
            type: type$3129,
            value: value$3127,
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                opts$3128.start || index$2331,
                index$2331
            ]
        };
    }
    function makePunctuator$2492(value$3130, opts$3131) {
        opts$3131 = opts$3131 || {};
        return {
            type: Token$2320.Punctuator,
            value: value$3130,
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                opts$3131.start || index$2331,
                index$2331
            ]
        };
    }
    function makeStringLiteral$2493(value$3132, opts$3133) {
        opts$3133 = opts$3133 || {};
        return {
            type: Token$2320.StringLiteral,
            value: value$3132,
            octal: !!opts$3133.octal,
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                opts$3133.start || index$2331,
                index$2331
            ]
        };
    }
    function makeNumericLiteral$2494(value$3134, opts$3135) {
        opts$3135 = opts$3135 || {};
        return {
            type: Token$2320.NumericLiteral,
            value: value$3134,
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                opts$3135.start || index$2331,
                index$2331
            ]
        };
    }
    function makeRegExp$2495(value$3136, opts$3137) {
        opts$3137 = opts$3137 || {};
        return {
            type: Token$2320.RegularExpression,
            value: value$3136,
            literal: value$3136.toString(),
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                opts$3137.start || index$2331,
                index$2331
            ]
        };
    }
    function makeDelimiter$2496(value$3138, inner$3139) {
        var current$3140 = {
            lineNumber: lineNumber$2332,
            lineStart: lineStart$2333,
            range: [
                index$2331,
                index$2331
            ]
        };
        var firstTok$3141 = inner$3139.length ? inner$3139[0] : current$3140;
        var lastTok$3142 = inner$3139.length ? inner$3139[inner$3139.length - 1] : current$3140;
        return {
            type: Token$2320.Delimiter,
            value: value$3138,
            inner: inner$3139,
            startLineNumber: firstTok$3141.lineNumber,
            startLineStart: firstTok$3141.lineStart,
            startRange: firstTok$3141.range,
            endLineNumber: lastTok$3142.lineNumber,
            endLineStart: lastTok$3142.lineStart,
            endRange: lastTok$3142.range
        };
    }
    var // Since an actual parser object doesn't exist and we want to
    // introduce our own API anyway, we create a special reader object
    // for reader extensions
    readerAPI$2497 = {
        Token: Token$2320,
        get source() {
            return source$2329;
        },
        get index() {
            return index$2331;
        },
        set index(x) {
            index$2331 = x;
        },
        get length() {
            return length$2338;
        },
        set length(x) {
            length$2338 = x;
        },
        get lineNumber() {
            return lineNumber$2332;
        },
        set lineNumber(x) {
            lineNumber$2332 = x;
        },
        get lineStart() {
            return lineStart$2333;
        },
        set lineStart(x) {
            lineStart$2333 = x;
        },
        get extra() {
            return extra$2346;
        },
        isIdentifierStart: isIdentifierStart$2354,
        isIdentifierPart: isIdentifierPart$2355,
        isLineTerminator: isLineTerminator$2353,
        readIdentifier: scanIdentifier$2365,
        readPunctuator: scanPunctuator$2366,
        readStringLiteral: scanStringLiteral$2370,
        readNumericLiteral: scanNumericLiteral$2369,
        readRegExp: scanRegExp$2373,
        readToken: function () {
            return readToken$2498([], false, false);
        },
        readDelimiter: function () {
            return readDelim$2499([], false, false);
        },
        skipComment: scanComment$2478,
        makeIdentifier: makeIdentifier$2491,
        makePunctuator: makePunctuator$2492,
        makeStringLiteral: makeStringLiteral$2493,
        makeNumericLiteral: makeNumericLiteral$2494,
        makeRegExp: makeRegExp$2495,
        makeDelimiter: makeDelimiter$2496,
        suppressReadError: suppressReadError$2490,
        peekQueued: readtables$2487.peekQueued,
        getQueued: readtables$2487.getQueued
    };
    readtables$2487.readerAPI = readerAPI$2497;
    function readToken$2498(toks$3143, inExprDelim$3144, parentIsBlock$3145) {
        var delimiters$3146 = [
            '(',
            '{',
            '['
        ];
        var parenIdents$3147 = [
            'if',
            'while',
            'for',
            'with'
        ];
        var last$3148 = toks$3143.length - 1;
        var comments$3149, commentsLen$3150 = extra$2346.comments.length;
        function back$3151(n$3157) {
            var idx$3158 = toks$3143.length - n$3157 > 0 ? toks$3143.length - n$3157 : 0;
            return toks$3143[idx$3158];
        }
        function attachComments$3152(token$3159) {
            if (comments$3149) {
                token$3159.leadingComments = comments$3149;
            }
            return token$3159;
        }
        function _advance$3153() {
            return attachComments$3152(advance$2376());
        }
        function _scanRegExp$3154() {
            return attachComments$3152(scanRegExp$2373());
        }
        skipComment$2360();
        var ch$3155 = source$2329[index$2331];
        if (extra$2346.comments.length > commentsLen$3150) {
            comments$3149 = extra$2346.comments.slice(commentsLen$3150);
        }
        if (isIn$2348(source$2329[index$2331], delimiters$3146)) {
            return attachComments$3152(readDelim$2499(toks$3143, inExprDelim$3144, parentIsBlock$3145));
        }
        // Check if we should get the token from the readtable
        var readtableToken$3156;
        if ((readtableToken$3156 = readtables$2487.getQueued()) || readtables$2487.has(ch$3155) && (readtableToken$3156 = readtables$2487.invoke(ch$3155, toks$3143))) {
            return readtableToken$3156;
        }
        if (ch$3155 === '/') {
            var prev$3160 = back$3151(1);
            if (prev$3160) {
                if (prev$3160.value === '()') {
                    if (isIn$2348(back$3151(2).value, parenIdents$3147)) {
                        // ... if (...) / ...
                        return _scanRegExp$3154();
                    }
                    // ... (...) / ...
                    return _advance$3153();
                }
                if (prev$3160.value === '{}') {
                    if (blockAllowed$2486(toks$3143, 0, inExprDelim$3144, parentIsBlock$3145)) {
                        if (back$3151(2).value === '()') {
                            if (// named function
                                back$3151(4).value === 'function') {
                                if (!blockAllowed$2486(toks$3143, 3, inExprDelim$3144, parentIsBlock$3145)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$3153();
                                }
                                if (toks$3143.length - 5 <= 0 && inExprDelim$3144) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$3153();
                                }
                            }
                            if (// unnamed function
                                back$3151(3).value === 'function') {
                                if (!blockAllowed$2486(toks$3143, 2, inExprDelim$3144, parentIsBlock$3145)) {
                                    // new function (...) {...} / ...
                                    return _advance$3153();
                                }
                                if (toks$3143.length - 4 <= 0 && inExprDelim$3144) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$3153();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$3154();
                    } else {
                        // ... + {...} / ...
                        return _advance$3153();
                    }
                }
                if (prev$3160.type === Token$2320.Punctuator) {
                    // ... + /...
                    return _scanRegExp$3154();
                }
                if (isKeyword$2359(prev$3160.value) && prev$3160.value !== 'this' && prev$3160.value !== 'let' && prev$3160.value !== 'export') {
                    // typeof /...
                    return _scanRegExp$3154();
                }
                return _advance$3153();
            }
            return _scanRegExp$3154();
        }
        return _advance$3153();
    }
    function readDelim$2499(toks$3161, inExprDelim$3162, parentIsBlock$3163) {
        var startDelim$3164 = advance$2376(), matchDelim$3165 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$3166 = [];
        var delimiters$3167 = [
            '(',
            '{',
            '['
        ];
        assert$2347(delimiters$3167.indexOf(startDelim$3164.value) !== -1, 'Need to begin at the delimiter');
        var token$3168 = startDelim$3164;
        var startLineNumber$3169 = token$3168.lineNumber;
        var startLineStart$3170 = token$3168.lineStart;
        var startRange$3171 = token$3168.range;
        var delimToken$3172 = {};
        delimToken$3172.type = Token$2320.Delimiter;
        delimToken$3172.value = startDelim$3164.value + matchDelim$3165[startDelim$3164.value];
        delimToken$3172.startLineNumber = startLineNumber$3169;
        delimToken$3172.startLineStart = startLineStart$3170;
        delimToken$3172.startRange = startRange$3171;
        var delimIsBlock$3173 = false;
        if (startDelim$3164.value === '{') {
            delimIsBlock$3173 = blockAllowed$2486(toks$3161.concat(delimToken$3172), 0, inExprDelim$3162, parentIsBlock$3163);
        }
        while (index$2331 <= length$2338) {
            token$3168 = readToken$2498(inner$3166, startDelim$3164.value === '(' || startDelim$3164.value === '[', delimIsBlock$3173);
            if (token$3168.type === Token$2320.Punctuator && token$3168.value === matchDelim$3165[startDelim$3164.value]) {
                if (token$3168.leadingComments) {
                    delimToken$3172.trailingComments = token$3168.leadingComments;
                }
                break;
            } else if (token$3168.type === Token$2320.EOF) {
                throwError$2384({}, Messages$2325.UnexpectedEOS);
            } else {
                inner$3166.push(token$3168);
            }
        }
        if (// at the end of the stream but the very last char wasn't the closing delimiter
            index$2331 >= length$2338 && matchDelim$3165[startDelim$3164.value] !== source$2329[length$2338 - 1]) {
            throwError$2384({}, Messages$2325.UnexpectedEOS);
        }
        var endLineNumber$3174 = token$3168.lineNumber;
        var endLineStart$3175 = token$3168.lineStart;
        var endRange$3176 = token$3168.range;
        delimToken$3172.inner = inner$3166;
        delimToken$3172.endLineNumber = endLineNumber$3174;
        delimToken$3172.endLineStart = endLineStart$3175;
        delimToken$3172.endRange = endRange$3176;
        return delimToken$3172;
    }
    function setReadtable$2500(readtable$3177, syn$3178) {
        readtables$2487.currentReadtable = readtable$3177;
        if (syn$3178) {
            readtables$2487.readerAPI.throwSyntaxError = function (name$3179, message$3180, tok$3181) {
                var sx$3182 = syn$3178.syntaxFromToken(tok$3181);
                var err$3183 = new syn$3178.MacroSyntaxError(name$3179, message$3180, sx$3182);
                throw new SyntaxError(syn$3178.printSyntaxError(source$2329, err$3183));
            };
        }
    }
    function currentReadtable$2501() {
        return readtables$2487.currentReadtable;
    }
    function read$2502(code$3184) {
        var token$3185, tokenTree$3186 = [];
        extra$2346 = {};
        extra$2346.comments = [];
        extra$2346.range = true;
        extra$2346.loc = true;
        patch$2482();
        source$2329 = code$3184;
        index$2331 = 0;
        lineNumber$2332 = source$2329.length > 0 ? 1 : 0;
        lineStart$2333 = 0;
        length$2338 = source$2329.length;
        state$2344 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$2331 < length$2338 || readtables$2487.peekQueued()) {
            tokenTree$3186.push(readToken$2498(tokenTree$3186, false, false));
        }
        var last$3187 = tokenTree$3186[tokenTree$3186.length - 1];
        if (last$3187 && last$3187.type !== Token$2320.EOF) {
            tokenTree$3186.push({
                type: Token$2320.EOF,
                value: '',
                lineNumber: last$3187.lineNumber,
                lineStart: last$3187.lineStart,
                range: [
                    index$2331,
                    index$2331
                ]
            });
        }
        return expander$2319.tokensToSyntax(tokenTree$3186);
    }
    function parse$2503(code$3188, options$3189) {
        var program$3190, toString$3191;
        extra$2346 = {};
        if (// given an array of tokens instead of a string
            Array.isArray(code$3188)) {
            tokenStream$2340 = code$3188;
            length$2338 = tokenStream$2340.length;
            lineNumber$2332 = tokenStream$2340.length > 0 ? 1 : 0;
            source$2329 = undefined;
        } else {
            toString$3191 = String;
            if (typeof code$3188 !== 'string' && !(code$3188 instanceof String)) {
                code$3188 = toString$3191(code$3188);
            }
            source$2329 = code$3188;
            length$2338 = source$2329.length;
            lineNumber$2332 = source$2329.length > 0 ? 1 : 0;
        }
        delegate$2339 = SyntaxTreeDelegate$2327;
        streamIndex$2341 = -1;
        index$2331 = 0;
        lineStart$2333 = 0;
        sm_lineStart$2335 = 0;
        sm_lineNumber$2334 = lineNumber$2332;
        sm_index$2337 = 0;
        sm_range$2336 = [
            0,
            0
        ];
        lookahead$2342 = null;
        phase$2345 = options$3189 && typeof options$3189.phase !== 'undefined' ? options$3189.phase : 0;
        state$2344 = {
            allowKeyword: false,
            allowIn: true,
            labelSet: {},
            parenthesizedCount: 0,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            yieldAllowed: false
        };
        extra$2346.attachComment = true;
        extra$2346.range = true;
        extra$2346.comments = [];
        extra$2346.bottomRightStack = [];
        extra$2346.trailingComments = [];
        extra$2346.leadingComments = [];
        if (typeof options$3189 !== 'undefined') {
            extra$2346.range = typeof options$3189.range === 'boolean' && options$3189.range;
            extra$2346.loc = typeof options$3189.loc === 'boolean' && options$3189.loc;
            extra$2346.attachComment = typeof options$3189.attachComment === 'boolean' && options$3189.attachComment;
            if (extra$2346.loc && options$3189.source !== null && options$3189.source !== undefined) {
                delegate$2339 = extend$2484(delegate$2339, {
                    'postProcess': function (node$3192) {
                        node$3192.loc.source = toString$3191(options$3189.source);
                        return node$3192;
                    }
                });
            }
            if (typeof options$3189.tokens === 'boolean' && options$3189.tokens) {
                extra$2346.tokens = [];
            }
            if (typeof options$3189.comment === 'boolean' && options$3189.comment) {
                extra$2346.comments = [];
            }
            if (typeof options$3189.tolerant === 'boolean' && options$3189.tolerant) {
                extra$2346.errors = [];
            }
        }
        if (length$2338 > 0) {
            if (source$2329 && typeof source$2329[0] === 'undefined') {
                if (// Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    code$3188 instanceof String) {
                    source$2329 = code$3188.valueOf();
                }
            }
        }
        extra$2346.loc = true;
        extra$2346.errors = [];
        patch$2482();
        try {
            program$3190 = parseProgram$2476();
            if (typeof extra$2346.comments !== 'undefined') {
                program$3190.comments = extra$2346.comments;
            }
            if (typeof extra$2346.tokens !== 'undefined') {
                filterTokenLocation$2481();
                program$3190.tokens = extra$2346.tokens;
            }
            if (typeof extra$2346.errors !== 'undefined') {
                program$3190.errors = extra$2346.errors;
            }
        } catch (e$3193) {
            throw e$3193;
        } finally {
            unpatch$2483();
            extra$2346 = {};
        }
        return program$3190;
    }
    exports$2318.tokenize = tokenize$2485;
    exports$2318.read = read$2502;
    exports$2318.Token = Token$2320;
    exports$2318.setReadtable = setReadtable$2500;
    exports$2318.currentReadtable = currentReadtable$2501;
    exports$2318.parse = parse$2503;
    // Deep copy.
    exports$2318.Syntax = function () {
        var name$3194, types$3195 = {};
        if (typeof Object.create === 'function') {
            types$3195 = Object.create(null);
        }
        for (name$3194 in Syntax$2323) {
            if (Syntax$2323.hasOwnProperty(name$3194)) {
                types$3195[name$3194] = Syntax$2323[name$3194];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$3195);
        }
        return types$3195;
    }();
}));