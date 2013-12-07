(function (root$698, factory$699) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$699);
    } else if (typeof exports !== 'undefined') {
        factory$699(exports, require('./expander'));
    } else {
        factory$699(root$698.esprima = {});
    }
}(this, function (exports$700, expander$701) {
    'use strict';
    var Token$702, TokenName$703, FnExprTokens$704, Syntax$705, PropertyKind$706, Messages$707, Regex$708, SyntaxTreeDelegate$709, ClassPropertyType$710, source$711, strict$712, index$713, lineNumber$714, lineStart$715, length$716, delegate$717, tokenStream$718, streamIndex$719, lookahead$720, lookaheadIndex$721, state$722, extra$723;
    Token$702 = {
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
    TokenName$703 = {};
    TokenName$703[Token$702.BooleanLiteral] = 'Boolean';
    TokenName$703[Token$702.EOF] = '<end>';
    TokenName$703[Token$702.Identifier] = 'Identifier';
    TokenName$703[Token$702.Keyword] = 'Keyword';
    TokenName$703[Token$702.NullLiteral] = 'Null';
    TokenName$703[Token$702.NumericLiteral] = 'Numeric';
    TokenName$703[Token$702.Punctuator] = 'Punctuator';
    TokenName$703[Token$702.StringLiteral] = 'String';
    TokenName$703[Token$702.RegularExpression] = 'RegularExpression';
    TokenName$703[Token$702.Delimiter] = 'Delimiter';
    FnExprTokens$704 = [
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
    Syntax$705 = {
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
        ClassHeritage: 'ClassHeritage',
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
    PropertyKind$706 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$710 = {
        'static': 'static',
        prototype: 'prototype'
    };
    Messages$707 = {
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
        NoYieldInGenerator: 'Missing yield in generator',
        NoUnintializedConst: 'Const must be initialized',
        ComprehensionRequiresBlock: 'Comprehension must have at least one block',
        ComprehensionError: 'Comprehension Error',
        EachNotAllowed: 'Each is not supported',
        UnmatchedDelimiter: 'Unmatched Delimiter'
    };
    Regex$708 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    function assert$724(condition$873, message$874) {
        if (!condition$873) {
            throw new Error('ASSERT: ' + message$874);
        }
    }
    function isIn$725(el$875, list$876) {
        return list$876.indexOf(el$875) !== -1;
    }
    function isDecimalDigit$726(ch$877) {
        return ch$877 >= 48 && ch$877 <= 57;
    }
    function isHexDigit$727(ch$878) {
        return '0123456789abcdefABCDEF'.indexOf(ch$878) >= 0;
    }
    function isOctalDigit$728(ch$879) {
        return '01234567'.indexOf(ch$879) >= 0;
    }
    function isWhiteSpace$729(ch$880) {
        return ch$880 === 32 || ch$880 === 9 || ch$880 === 11 || ch$880 === 12 || ch$880 === 160 || ch$880 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$880)) > 0;
    }
    function isLineTerminator$730(ch$881) {
        return ch$881 === 10 || ch$881 === 13 || ch$881 === 8232 || ch$881 === 8233;
    }
    function isIdentifierStart$731(ch$882) {
        return ch$882 === 36 || ch$882 === 95 || ch$882 >= 65 && ch$882 <= 90 || ch$882 >= 97 && ch$882 <= 122 || ch$882 === 92 || ch$882 >= 128 && Regex$708.NonAsciiIdentifierStart.test(String.fromCharCode(ch$882));
    }
    function isIdentifierPart$732(ch$883) {
        return ch$883 === 36 || ch$883 === 95 || ch$883 >= 65 && ch$883 <= 90 || ch$883 >= 97 && ch$883 <= 122 || ch$883 >= 48 && ch$883 <= 57 || ch$883 === 92 || ch$883 >= 128 && Regex$708.NonAsciiIdentifierPart.test(String.fromCharCode(ch$883));
    }
    function isFutureReservedWord$733(id$884) {
        switch (id$884) {
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
    function isStrictModeReservedWord$734(id$885) {
        switch (id$885) {
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
    function isRestrictedWord$735(id$886) {
        return id$886 === 'eval' || id$886 === 'arguments';
    }
    function isKeyword$736(id$887) {
        if (strict$712 && isStrictModeReservedWord$734(id$887)) {
            return true;
        }
        switch (id$887.length) {
        case 2:
            return id$887 === 'if' || id$887 === 'in' || id$887 === 'do';
        case 3:
            return id$887 === 'var' || id$887 === 'for' || id$887 === 'new' || id$887 === 'try' || id$887 === 'let';
        case 4:
            return id$887 === 'this' || id$887 === 'else' || id$887 === 'case' || id$887 === 'void' || id$887 === 'with' || id$887 === 'enum';
        case 5:
            return id$887 === 'while' || id$887 === 'break' || id$887 === 'catch' || id$887 === 'throw' || id$887 === 'const' || id$887 === 'yield' || id$887 === 'class' || id$887 === 'super';
        case 6:
            return id$887 === 'return' || id$887 === 'typeof' || id$887 === 'delete' || id$887 === 'switch' || id$887 === 'export' || id$887 === 'import';
        case 7:
            return id$887 === 'default' || id$887 === 'finally' || id$887 === 'extends';
        case 8:
            return id$887 === 'function' || id$887 === 'continue' || id$887 === 'debugger';
        case 10:
            return id$887 === 'instanceof';
        default:
            return false;
        }
    }
    function skipComment$737() {
        var ch$888, blockComment$889, lineComment$890;
        blockComment$889 = false;
        lineComment$890 = false;
        while (index$713 < length$716) {
            ch$888 = source$711.charCodeAt(index$713);
            if (lineComment$890) {
                ++index$713;
                if (isLineTerminator$730(ch$888)) {
                    lineComment$890 = false;
                    if (ch$888 === 13 && source$711.charCodeAt(index$713) === 10) {
                        ++index$713;
                    }
                    ++lineNumber$714;
                    lineStart$715 = index$713;
                }
            } else if (blockComment$889) {
                if (isLineTerminator$730(ch$888)) {
                    if (ch$888 === 13 && source$711.charCodeAt(index$713 + 1) === 10) {
                        ++index$713;
                    }
                    ++lineNumber$714;
                    ++index$713;
                    lineStart$715 = index$713;
                    if (index$713 >= length$716) {
                        throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$888 = source$711.charCodeAt(index$713++);
                    if (index$713 >= length$716) {
                        throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$888 === 42) {
                        ch$888 = source$711.charCodeAt(index$713);
                        if (ch$888 === 47) {
                            ++index$713;
                            blockComment$889 = false;
                        }
                    }
                }
            } else if (ch$888 === 47) {
                ch$888 = source$711.charCodeAt(index$713 + 1);
                if (ch$888 === 47) {
                    index$713 += 2;
                    lineComment$890 = true;
                } else if (ch$888 === 42) {
                    index$713 += 2;
                    blockComment$889 = true;
                    if (index$713 >= length$716) {
                        throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$729(ch$888)) {
                ++index$713;
            } else if (isLineTerminator$730(ch$888)) {
                ++index$713;
                if (ch$888 === 13 && source$711.charCodeAt(index$713) === 10) {
                    ++index$713;
                }
                ++lineNumber$714;
                lineStart$715 = index$713;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$738(prefix$891) {
        var i$892, len$893, ch$894, code$895 = 0;
        len$893 = prefix$891 === 'u' ? 4 : 2;
        for (i$892 = 0; i$892 < len$893; ++i$892) {
            if (index$713 < length$716 && isHexDigit$727(source$711[index$713])) {
                ch$894 = source$711[index$713++];
                code$895 = code$895 * 16 + '0123456789abcdef'.indexOf(ch$894.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$895);
    }
    function scanUnicodeCodePointEscape$739() {
        var ch$896, code$897, cu1$898, cu2$899;
        ch$896 = source$711[index$713];
        code$897 = 0;
        if (ch$896 === '}') {
            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        while (index$713 < length$716) {
            ch$896 = source$711[index$713++];
            if (!isHexDigit$727(ch$896)) {
                break;
            }
            code$897 = code$897 * 16 + '0123456789abcdef'.indexOf(ch$896.toLowerCase());
        }
        if (code$897 > 1114111 || ch$896 !== '}') {
            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        if (code$897 <= 65535) {
            return String.fromCharCode(code$897);
        }
        cu1$898 = (code$897 - 65536 >> 10) + 55296;
        cu2$899 = (code$897 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$898, cu2$899);
    }
    function getEscapedIdentifier$740() {
        var ch$900, id$901;
        ch$900 = source$711.charCodeAt(index$713++);
        id$901 = String.fromCharCode(ch$900);
        if (ch$900 === 92) {
            if (source$711.charCodeAt(index$713) !== 117) {
                throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
            }
            ++index$713;
            ch$900 = scanHexEscape$738('u');
            if (!ch$900 || ch$900 === '\\' || !isIdentifierStart$731(ch$900.charCodeAt(0))) {
                throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
            }
            id$901 = ch$900;
        }
        while (index$713 < length$716) {
            ch$900 = source$711.charCodeAt(index$713);
            if (!isIdentifierPart$732(ch$900)) {
                break;
            }
            ++index$713;
            id$901 += String.fromCharCode(ch$900);
            if (ch$900 === 92) {
                id$901 = id$901.substr(0, id$901.length - 1);
                if (source$711.charCodeAt(index$713) !== 117) {
                    throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                }
                ++index$713;
                ch$900 = scanHexEscape$738('u');
                if (!ch$900 || ch$900 === '\\' || !isIdentifierPart$732(ch$900.charCodeAt(0))) {
                    throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                }
                id$901 += ch$900;
            }
        }
        return id$901;
    }
    function getIdentifier$741() {
        var start$902, ch$903;
        start$902 = index$713++;
        while (index$713 < length$716) {
            ch$903 = source$711.charCodeAt(index$713);
            if (ch$903 === 92) {
                index$713 = start$902;
                return getEscapedIdentifier$740();
            }
            if (isIdentifierPart$732(ch$903)) {
                ++index$713;
            } else {
                break;
            }
        }
        return source$711.slice(start$902, index$713);
    }
    function scanIdentifier$742() {
        var start$904, id$905, type$906;
        start$904 = index$713;
        id$905 = source$711.charCodeAt(index$713) === 92 ? getEscapedIdentifier$740() : getIdentifier$741();
        if (id$905.length === 1) {
            type$906 = Token$702.Identifier;
        } else if (isKeyword$736(id$905)) {
            type$906 = Token$702.Keyword;
        } else if (id$905 === 'null') {
            type$906 = Token$702.NullLiteral;
        } else if (id$905 === 'true' || id$905 === 'false') {
            type$906 = Token$702.BooleanLiteral;
        } else {
            type$906 = Token$702.Identifier;
        }
        return {
            type: type$906,
            value: id$905,
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$904,
                index$713
            ]
        };
    }
    function scanPunctuator$743() {
        var start$907 = index$713, code$908 = source$711.charCodeAt(index$713), code2$909, ch1$910 = source$711[index$713], ch2$911, ch3$912, ch4$913;
        switch (code$908) {
        case 40:
        case 41:
        case 59:
        case 44:
        case 123:
        case 125:
        case 91:
        case 93:
        case 58:
        case 63:
        case 126:
            ++index$713;
            if (extra$723.tokenize) {
                if (code$908 === 40) {
                    extra$723.openParenToken = extra$723.tokens.length;
                } else if (code$908 === 123) {
                    extra$723.openCurlyToken = extra$723.tokens.length;
                }
            }
            return {
                type: Token$702.Punctuator,
                value: String.fromCharCode(code$908),
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$907,
                    index$713
                ]
            };
        default:
            code2$909 = source$711.charCodeAt(index$713 + 1);
            if (code2$909 === 61) {
                switch (code$908) {
                case 37:
                case 38:
                case 42:
                case 43:
                case 45:
                case 47:
                case 60:
                case 62:
                case 94:
                case 124:
                    index$713 += 2;
                    return {
                        type: Token$702.Punctuator,
                        value: String.fromCharCode(code$908) + String.fromCharCode(code2$909),
                        lineNumber: lineNumber$714,
                        lineStart: lineStart$715,
                        range: [
                            start$907,
                            index$713
                        ]
                    };
                case 33:
                case 61:
                    index$713 += 2;
                    if (source$711.charCodeAt(index$713) === 61) {
                        ++index$713;
                    }
                    return {
                        type: Token$702.Punctuator,
                        value: source$711.slice(start$907, index$713),
                        lineNumber: lineNumber$714,
                        lineStart: lineStart$715,
                        range: [
                            start$907,
                            index$713
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        ch2$911 = source$711[index$713 + 1];
        ch3$912 = source$711[index$713 + 2];
        ch4$913 = source$711[index$713 + 3];
        if (ch1$910 === '>' && ch2$911 === '>' && ch3$912 === '>') {
            if (ch4$913 === '=') {
                index$713 += 4;
                return {
                    type: Token$702.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$714,
                    lineStart: lineStart$715,
                    range: [
                        start$907,
                        index$713
                    ]
                };
            }
        }
        if (ch1$910 === '>' && ch2$911 === '>' && ch3$912 === '>') {
            index$713 += 3;
            return {
                type: Token$702.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$907,
                    index$713
                ]
            };
        }
        if (ch1$910 === '<' && ch2$911 === '<' && ch3$912 === '=') {
            index$713 += 3;
            return {
                type: Token$702.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$907,
                    index$713
                ]
            };
        }
        if (ch1$910 === '>' && ch2$911 === '>' && ch3$912 === '=') {
            index$713 += 3;
            return {
                type: Token$702.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$907,
                    index$713
                ]
            };
        }
        if (ch1$910 === '.' && ch2$911 === '.' && ch3$912 === '.') {
            index$713 += 3;
            return {
                type: Token$702.Punctuator,
                value: '...',
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$907,
                    index$713
                ]
            };
        }
        if (ch1$910 === ch2$911 && '+-<>&|'.indexOf(ch1$910) >= 0) {
            index$713 += 2;
            return {
                type: Token$702.Punctuator,
                value: ch1$910 + ch2$911,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$907,
                    index$713
                ]
            };
        }
        if (ch1$910 === '=' && ch2$911 === '>') {
            index$713 += 2;
            return {
                type: Token$702.Punctuator,
                value: '=>',
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$907,
                    index$713
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$910) >= 0) {
            ++index$713;
            return {
                type: Token$702.Punctuator,
                value: ch1$910,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$907,
                    index$713
                ]
            };
        }
        if (ch1$910 === '.') {
            ++index$713;
            return {
                type: Token$702.Punctuator,
                value: ch1$910,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$907,
                    index$713
                ]
            };
        }
        throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
    }
    function scanHexLiteral$744(start$914) {
        var number$915 = '';
        while (index$713 < length$716) {
            if (!isHexDigit$727(source$711[index$713])) {
                break;
            }
            number$915 += source$711[index$713++];
        }
        if (number$915.length === 0) {
            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$731(source$711.charCodeAt(index$713))) {
            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$702.NumericLiteral,
            value: parseInt('0x' + number$915, 16),
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$914,
                index$713
            ]
        };
    }
    function scanOctalLiteral$745(prefix$916, start$917) {
        var number$918, octal$919;
        if (isOctalDigit$728(prefix$916)) {
            octal$919 = true;
            number$918 = '0' + source$711[index$713++];
        } else {
            octal$919 = false;
            ++index$713;
            number$918 = '';
        }
        while (index$713 < length$716) {
            if (!isOctalDigit$728(source$711[index$713])) {
                break;
            }
            number$918 += source$711[index$713++];
        }
        if (!octal$919 && number$918.length === 0) {
            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$731(source$711.charCodeAt(index$713)) || isDecimalDigit$726(source$711.charCodeAt(index$713))) {
            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$702.NumericLiteral,
            value: parseInt(number$918, 8),
            octal: octal$919,
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$917,
                index$713
            ]
        };
    }
    function scanNumericLiteral$746() {
        var number$920, start$921, ch$922, octal$923;
        ch$922 = source$711[index$713];
        assert$724(isDecimalDigit$726(ch$922.charCodeAt(0)) || ch$922 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$921 = index$713;
        number$920 = '';
        if (ch$922 !== '.') {
            number$920 = source$711[index$713++];
            ch$922 = source$711[index$713];
            if (number$920 === '0') {
                if (ch$922 === 'x' || ch$922 === 'X') {
                    ++index$713;
                    return scanHexLiteral$744(start$921);
                }
                if (ch$922 === 'b' || ch$922 === 'B') {
                    ++index$713;
                    number$920 = '';
                    while (index$713 < length$716) {
                        ch$922 = source$711[index$713];
                        if (ch$922 !== '0' && ch$922 !== '1') {
                            break;
                        }
                        number$920 += source$711[index$713++];
                    }
                    if (number$920.length === 0) {
                        throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$713 < length$716) {
                        ch$922 = source$711.charCodeAt(index$713);
                        if (isIdentifierStart$731(ch$922) || isDecimalDigit$726(ch$922)) {
                            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$702.NumericLiteral,
                        value: parseInt(number$920, 2),
                        lineNumber: lineNumber$714,
                        lineStart: lineStart$715,
                        range: [
                            start$921,
                            index$713
                        ]
                    };
                }
                if (ch$922 === 'o' || ch$922 === 'O' || isOctalDigit$728(ch$922)) {
                    return scanOctalLiteral$745(ch$922, start$921);
                }
                if (ch$922 && isDecimalDigit$726(ch$922.charCodeAt(0))) {
                    throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$726(source$711.charCodeAt(index$713))) {
                number$920 += source$711[index$713++];
            }
            ch$922 = source$711[index$713];
        }
        if (ch$922 === '.') {
            number$920 += source$711[index$713++];
            while (isDecimalDigit$726(source$711.charCodeAt(index$713))) {
                number$920 += source$711[index$713++];
            }
            ch$922 = source$711[index$713];
        }
        if (ch$922 === 'e' || ch$922 === 'E') {
            number$920 += source$711[index$713++];
            ch$922 = source$711[index$713];
            if (ch$922 === '+' || ch$922 === '-') {
                number$920 += source$711[index$713++];
            }
            if (isDecimalDigit$726(source$711.charCodeAt(index$713))) {
                while (isDecimalDigit$726(source$711.charCodeAt(index$713))) {
                    number$920 += source$711[index$713++];
                }
            } else {
                throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$731(source$711.charCodeAt(index$713))) {
            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$702.NumericLiteral,
            value: parseFloat(number$920),
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$921,
                index$713
            ]
        };
    }
    function scanStringLiteral$747() {
        var str$924 = '', quote$925, start$926, ch$927, code$928, unescaped$929, restore$930, octal$931 = false;
        quote$925 = source$711[index$713];
        assert$724(quote$925 === '\'' || quote$925 === '"', 'String literal must starts with a quote');
        start$926 = index$713;
        ++index$713;
        while (index$713 < length$716) {
            ch$927 = source$711[index$713++];
            if (ch$927 === quote$925) {
                quote$925 = '';
                break;
            } else if (ch$927 === '\\') {
                ch$927 = source$711[index$713++];
                if (!ch$927 || !isLineTerminator$730(ch$927.charCodeAt(0))) {
                    switch (ch$927) {
                    case 'n':
                        str$924 += '\n';
                        break;
                    case 'r':
                        str$924 += '\r';
                        break;
                    case 't':
                        str$924 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$711[index$713] === '{') {
                            ++index$713;
                            str$924 += scanUnicodeCodePointEscape$739();
                        } else {
                            restore$930 = index$713;
                            unescaped$929 = scanHexEscape$738(ch$927);
                            if (unescaped$929) {
                                str$924 += unescaped$929;
                            } else {
                                index$713 = restore$930;
                                str$924 += ch$927;
                            }
                        }
                        break;
                    case 'b':
                        str$924 += '\b';
                        break;
                    case 'f':
                        str$924 += '\f';
                        break;
                    case 'v':
                        str$924 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$728(ch$927)) {
                            code$928 = '01234567'.indexOf(ch$927);
                            if (code$928 !== 0) {
                                octal$931 = true;
                            }
                            if (index$713 < length$716 && isOctalDigit$728(source$711[index$713])) {
                                octal$931 = true;
                                code$928 = code$928 * 8 + '01234567'.indexOf(source$711[index$713++]);
                                if ('0123'.indexOf(ch$927) >= 0 && index$713 < length$716 && isOctalDigit$728(source$711[index$713])) {
                                    code$928 = code$928 * 8 + '01234567'.indexOf(source$711[index$713++]);
                                }
                            }
                            str$924 += String.fromCharCode(code$928);
                        } else {
                            str$924 += ch$927;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$714;
                    if (ch$927 === '\r' && source$711[index$713] === '\n') {
                        ++index$713;
                    }
                }
            } else if (isLineTerminator$730(ch$927.charCodeAt(0))) {
                break;
            } else {
                str$924 += ch$927;
            }
        }
        if (quote$925 !== '') {
            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$702.StringLiteral,
            value: str$924,
            octal: octal$931,
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$926,
                index$713
            ]
        };
    }
    function scanTemplate$748() {
        var cooked$932 = '', ch$933, start$934, terminated$935, tail$936, restore$937, unescaped$938, code$939, octal$940;
        terminated$935 = false;
        tail$936 = false;
        start$934 = index$713;
        ++index$713;
        while (index$713 < length$716) {
            ch$933 = source$711[index$713++];
            if (ch$933 === '`') {
                tail$936 = true;
                terminated$935 = true;
                break;
            } else if (ch$933 === '$') {
                if (source$711[index$713] === '{') {
                    ++index$713;
                    terminated$935 = true;
                    break;
                }
                cooked$932 += ch$933;
            } else if (ch$933 === '\\') {
                ch$933 = source$711[index$713++];
                if (!isLineTerminator$730(ch$933.charCodeAt(0))) {
                    switch (ch$933) {
                    case 'n':
                        cooked$932 += '\n';
                        break;
                    case 'r':
                        cooked$932 += '\r';
                        break;
                    case 't':
                        cooked$932 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$711[index$713] === '{') {
                            ++index$713;
                            cooked$932 += scanUnicodeCodePointEscape$739();
                        } else {
                            restore$937 = index$713;
                            unescaped$938 = scanHexEscape$738(ch$933);
                            if (unescaped$938) {
                                cooked$932 += unescaped$938;
                            } else {
                                index$713 = restore$937;
                                cooked$932 += ch$933;
                            }
                        }
                        break;
                    case 'b':
                        cooked$932 += '\b';
                        break;
                    case 'f':
                        cooked$932 += '\f';
                        break;
                    case 'v':
                        cooked$932 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$728(ch$933)) {
                            code$939 = '01234567'.indexOf(ch$933);
                            if (code$939 !== 0) {
                                octal$940 = true;
                            }
                            if (index$713 < length$716 && isOctalDigit$728(source$711[index$713])) {
                                octal$940 = true;
                                code$939 = code$939 * 8 + '01234567'.indexOf(source$711[index$713++]);
                                if ('0123'.indexOf(ch$933) >= 0 && index$713 < length$716 && isOctalDigit$728(source$711[index$713])) {
                                    code$939 = code$939 * 8 + '01234567'.indexOf(source$711[index$713++]);
                                }
                            }
                            cooked$932 += String.fromCharCode(code$939);
                        } else {
                            cooked$932 += ch$933;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$714;
                    if (ch$933 === '\r' && source$711[index$713] === '\n') {
                        ++index$713;
                    }
                }
            } else if (isLineTerminator$730(ch$933.charCodeAt(0))) {
                ++lineNumber$714;
                if (ch$933 === '\r' && source$711[index$713] === '\n') {
                    ++index$713;
                }
                cooked$932 += '\n';
            } else {
                cooked$932 += ch$933;
            }
        }
        if (!terminated$935) {
            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$702.Template,
            value: {
                cooked: cooked$932,
                raw: source$711.slice(start$934 + 1, index$713 - (tail$936 ? 1 : 2))
            },
            tail: tail$936,
            octal: octal$940,
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$934,
                index$713
            ]
        };
    }
    function scanTemplateElement$749(option$941) {
        var startsWith$942, template$943;
        lookahead$720 = null;
        skipComment$737();
        startsWith$942 = option$941.head ? '`' : '}';
        if (source$711[index$713] !== startsWith$942) {
            throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        template$943 = scanTemplate$748();
        peek$755();
        return template$943;
    }
    function scanRegExp$750() {
        var str$944, ch$945, start$946, pattern$947, flags$948, value$949, classMarker$950 = false, restore$951, terminated$952 = false;
        lookahead$720 = null;
        skipComment$737();
        start$946 = index$713;
        ch$945 = source$711[index$713];
        assert$724(ch$945 === '/', 'Regular expression literal must start with a slash');
        str$944 = source$711[index$713++];
        while (index$713 < length$716) {
            ch$945 = source$711[index$713++];
            str$944 += ch$945;
            if (classMarker$950) {
                if (ch$945 === ']') {
                    classMarker$950 = false;
                }
            } else {
                if (ch$945 === '\\') {
                    ch$945 = source$711[index$713++];
                    if (isLineTerminator$730(ch$945.charCodeAt(0))) {
                        throwError$758({}, Messages$707.UnterminatedRegExp);
                    }
                    str$944 += ch$945;
                } else if (ch$945 === '/') {
                    terminated$952 = true;
                    break;
                } else if (ch$945 === '[') {
                    classMarker$950 = true;
                } else if (isLineTerminator$730(ch$945.charCodeAt(0))) {
                    throwError$758({}, Messages$707.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$952) {
            throwError$758({}, Messages$707.UnterminatedRegExp);
        }
        pattern$947 = str$944.substr(1, str$944.length - 2);
        flags$948 = '';
        while (index$713 < length$716) {
            ch$945 = source$711[index$713];
            if (!isIdentifierPart$732(ch$945.charCodeAt(0))) {
                break;
            }
            ++index$713;
            if (ch$945 === '\\' && index$713 < length$716) {
                ch$945 = source$711[index$713];
                if (ch$945 === 'u') {
                    ++index$713;
                    restore$951 = index$713;
                    ch$945 = scanHexEscape$738('u');
                    if (ch$945) {
                        flags$948 += ch$945;
                        for (str$944 += '\\u'; restore$951 < index$713; ++restore$951) {
                            str$944 += source$711[restore$951];
                        }
                    } else {
                        index$713 = restore$951;
                        flags$948 += 'u';
                        str$944 += '\\u';
                    }
                } else {
                    str$944 += '\\';
                }
            } else {
                flags$948 += ch$945;
                str$944 += ch$945;
            }
        }
        try {
            value$949 = new RegExp(pattern$947, flags$948);
        } catch (e$953) {
            throwError$758({}, Messages$707.InvalidRegExp);
        }
        if (extra$723.tokenize) {
            return {
                type: Token$702.RegularExpression,
                value: value$949,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$946,
                    index$713
                ]
            };
        }
        return {
            type: Token$702.RegularExpression,
            literal: str$944,
            value: value$949,
            range: [
                start$946,
                index$713
            ]
        };
    }
    function isIdentifierName$751(token$954) {
        return token$954.type === Token$702.Identifier || token$954.type === Token$702.Keyword || token$954.type === Token$702.BooleanLiteral || token$954.type === Token$702.NullLiteral;
    }
    function advanceSlash$752() {
        var prevToken$955, checkToken$956;
        prevToken$955 = extra$723.tokens[extra$723.tokens.length - 1];
        if (!prevToken$955) {
            return scanRegExp$750();
        }
        if (prevToken$955.type === 'Punctuator') {
            if (prevToken$955.value === ')') {
                checkToken$956 = extra$723.tokens[extra$723.openParenToken - 1];
                if (checkToken$956 && checkToken$956.type === 'Keyword' && (checkToken$956.value === 'if' || checkToken$956.value === 'while' || checkToken$956.value === 'for' || checkToken$956.value === 'with')) {
                    return scanRegExp$750();
                }
                return scanPunctuator$743();
            }
            if (prevToken$955.value === '}') {
                if (extra$723.tokens[extra$723.openCurlyToken - 3] && extra$723.tokens[extra$723.openCurlyToken - 3].type === 'Keyword') {
                    checkToken$956 = extra$723.tokens[extra$723.openCurlyToken - 4];
                    if (!checkToken$956) {
                        return scanPunctuator$743();
                    }
                } else if (extra$723.tokens[extra$723.openCurlyToken - 4] && extra$723.tokens[extra$723.openCurlyToken - 4].type === 'Keyword') {
                    checkToken$956 = extra$723.tokens[extra$723.openCurlyToken - 5];
                    if (!checkToken$956) {
                        return scanRegExp$750();
                    }
                } else {
                    return scanPunctuator$743();
                }
                if (FnExprTokens$704.indexOf(checkToken$956.value) >= 0) {
                    return scanPunctuator$743();
                }
                return scanRegExp$750();
            }
            return scanRegExp$750();
        }
        if (prevToken$955.type === 'Keyword') {
            return scanRegExp$750();
        }
        return scanPunctuator$743();
    }
    function advance$753() {
        var ch$957;
        skipComment$737();
        if (index$713 >= length$716) {
            return {
                type: Token$702.EOF,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    index$713,
                    index$713
                ]
            };
        }
        ch$957 = source$711.charCodeAt(index$713);
        if (ch$957 === 40 || ch$957 === 41 || ch$957 === 58) {
            return scanPunctuator$743();
        }
        if (ch$957 === 39 || ch$957 === 34) {
            return scanStringLiteral$747();
        }
        if (ch$957 === 96) {
            return scanTemplate$748();
        }
        if (isIdentifierStart$731(ch$957)) {
            return scanIdentifier$742();
        }
        if (ch$957 === 35 || ch$957 === 64) {
            ++index$713;
            return {
                type: Token$702.Punctuator,
                value: String.fromCharCode(ch$957),
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    index$713 - 1,
                    index$713
                ]
            };
        }
        if (ch$957 === 46) {
            if (isDecimalDigit$726(source$711.charCodeAt(index$713 + 1))) {
                return scanNumericLiteral$746();
            }
            return scanPunctuator$743();
        }
        if (isDecimalDigit$726(ch$957)) {
            return scanNumericLiteral$746();
        }
        if (extra$723.tokenize && ch$957 === 47) {
            return advanceSlash$752();
        }
        return scanPunctuator$743();
    }
    function lex$754() {
        var token$958;
        token$958 = lookahead$720;
        streamIndex$719 = lookaheadIndex$721;
        lineNumber$714 = token$958.lineNumber;
        lineStart$715 = token$958.lineStart;
        lookahead$720 = tokenStream$718[++streamIndex$719].token;
        lookaheadIndex$721 = streamIndex$719;
        index$713 = lookahead$720.range[0];
        return token$958;
    }
    function peek$755() {
        lookaheadIndex$721 = streamIndex$719 + 1;
        if (lookaheadIndex$721 >= length$716) {
            lookahead$720 = {
                type: Token$702.EOF,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    index$713,
                    index$713
                ]
            };
            return;
        }
        lookahead$720 = tokenStream$718[lookaheadIndex$721].token;
        index$713 = lookahead$720.range[0];
    }
    function lookahead2$756() {
        var adv$959, pos$960, line$961, start$962, result$963;
        if (streamIndex$719 + 1 >= length$716 || streamIndex$719 + 2 >= length$716) {
            return {
                type: Token$702.EOF,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    index$713,
                    index$713
                ]
            };
        }
        if (lookahead$720 === null) {
            lookaheadIndex$721 = streamIndex$719 + 1;
            lookahead$720 = tokenStream$718[lookaheadIndex$721].token;
            index$713 = lookahead$720.range[0];
        }
        result$963 = tokenStream$718[lookaheadIndex$721 + 1].token;
        return result$963;
    }
    SyntaxTreeDelegate$709 = {
        name: 'SyntaxTree',
        postProcess: function (node$964) {
            return node$964;
        },
        createArrayExpression: function (elements$965) {
            return {
                type: Syntax$705.ArrayExpression,
                elements: elements$965
            };
        },
        createAssignmentExpression: function (operator$966, left$967, right$968) {
            return {
                type: Syntax$705.AssignmentExpression,
                operator: operator$966,
                left: left$967,
                right: right$968
            };
        },
        createBinaryExpression: function (operator$969, left$970, right$971) {
            var type$972 = operator$969 === '||' || operator$969 === '&&' ? Syntax$705.LogicalExpression : Syntax$705.BinaryExpression;
            return {
                type: type$972,
                operator: operator$969,
                left: left$970,
                right: right$971
            };
        },
        createBlockStatement: function (body$973) {
            return {
                type: Syntax$705.BlockStatement,
                body: body$973
            };
        },
        createBreakStatement: function (label$974) {
            return {
                type: Syntax$705.BreakStatement,
                label: label$974
            };
        },
        createCallExpression: function (callee$975, args$976) {
            return {
                type: Syntax$705.CallExpression,
                callee: callee$975,
                'arguments': args$976
            };
        },
        createCatchClause: function (param$977, body$978) {
            return {
                type: Syntax$705.CatchClause,
                param: param$977,
                body: body$978
            };
        },
        createConditionalExpression: function (test$979, consequent$980, alternate$981) {
            return {
                type: Syntax$705.ConditionalExpression,
                test: test$979,
                consequent: consequent$980,
                alternate: alternate$981
            };
        },
        createContinueStatement: function (label$982) {
            return {
                type: Syntax$705.ContinueStatement,
                label: label$982
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$705.DebuggerStatement };
        },
        createDoWhileStatement: function (body$983, test$984) {
            return {
                type: Syntax$705.DoWhileStatement,
                body: body$983,
                test: test$984
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$705.EmptyStatement };
        },
        createExpressionStatement: function (expression$985) {
            return {
                type: Syntax$705.ExpressionStatement,
                expression: expression$985
            };
        },
        createForStatement: function (init$986, test$987, update$988, body$989) {
            return {
                type: Syntax$705.ForStatement,
                init: init$986,
                test: test$987,
                update: update$988,
                body: body$989
            };
        },
        createForInStatement: function (left$990, right$991, body$992) {
            return {
                type: Syntax$705.ForInStatement,
                left: left$990,
                right: right$991,
                body: body$992,
                each: false
            };
        },
        createForOfStatement: function (left$993, right$994, body$995) {
            return {
                type: Syntax$705.ForOfStatement,
                left: left$993,
                right: right$994,
                body: body$995
            };
        },
        createFunctionDeclaration: function (id$996, params$997, defaults$998, body$999, rest$1000, generator$1001, expression$1002) {
            return {
                type: Syntax$705.FunctionDeclaration,
                id: id$996,
                params: params$997,
                defaults: defaults$998,
                body: body$999,
                rest: rest$1000,
                generator: generator$1001,
                expression: expression$1002
            };
        },
        createFunctionExpression: function (id$1003, params$1004, defaults$1005, body$1006, rest$1007, generator$1008, expression$1009) {
            return {
                type: Syntax$705.FunctionExpression,
                id: id$1003,
                params: params$1004,
                defaults: defaults$1005,
                body: body$1006,
                rest: rest$1007,
                generator: generator$1008,
                expression: expression$1009
            };
        },
        createIdentifier: function (name$1010) {
            return {
                type: Syntax$705.Identifier,
                name: name$1010
            };
        },
        createIfStatement: function (test$1011, consequent$1012, alternate$1013) {
            return {
                type: Syntax$705.IfStatement,
                test: test$1011,
                consequent: consequent$1012,
                alternate: alternate$1013
            };
        },
        createLabeledStatement: function (label$1014, body$1015) {
            return {
                type: Syntax$705.LabeledStatement,
                label: label$1014,
                body: body$1015
            };
        },
        createLiteral: function (token$1016) {
            return {
                type: Syntax$705.Literal,
                value: token$1016.value,
                raw: String(token$1016.value)
            };
        },
        createMemberExpression: function (accessor$1017, object$1018, property$1019) {
            return {
                type: Syntax$705.MemberExpression,
                computed: accessor$1017 === '[',
                object: object$1018,
                property: property$1019
            };
        },
        createNewExpression: function (callee$1020, args$1021) {
            return {
                type: Syntax$705.NewExpression,
                callee: callee$1020,
                'arguments': args$1021
            };
        },
        createObjectExpression: function (properties$1022) {
            return {
                type: Syntax$705.ObjectExpression,
                properties: properties$1022
            };
        },
        createPostfixExpression: function (operator$1023, argument$1024) {
            return {
                type: Syntax$705.UpdateExpression,
                operator: operator$1023,
                argument: argument$1024,
                prefix: false
            };
        },
        createProgram: function (body$1025) {
            return {
                type: Syntax$705.Program,
                body: body$1025
            };
        },
        createProperty: function (kind$1026, key$1027, value$1028, method$1029, shorthand$1030) {
            return {
                type: Syntax$705.Property,
                key: key$1027,
                value: value$1028,
                kind: kind$1026,
                method: method$1029,
                shorthand: shorthand$1030
            };
        },
        createReturnStatement: function (argument$1031) {
            return {
                type: Syntax$705.ReturnStatement,
                argument: argument$1031
            };
        },
        createSequenceExpression: function (expressions$1032) {
            return {
                type: Syntax$705.SequenceExpression,
                expressions: expressions$1032
            };
        },
        createSwitchCase: function (test$1033, consequent$1034) {
            return {
                type: Syntax$705.SwitchCase,
                test: test$1033,
                consequent: consequent$1034
            };
        },
        createSwitchStatement: function (discriminant$1035, cases$1036) {
            return {
                type: Syntax$705.SwitchStatement,
                discriminant: discriminant$1035,
                cases: cases$1036
            };
        },
        createThisExpression: function () {
            return { type: Syntax$705.ThisExpression };
        },
        createThrowStatement: function (argument$1037) {
            return {
                type: Syntax$705.ThrowStatement,
                argument: argument$1037
            };
        },
        createTryStatement: function (block$1038, guardedHandlers$1039, handlers$1040, finalizer$1041) {
            return {
                type: Syntax$705.TryStatement,
                block: block$1038,
                guardedHandlers: guardedHandlers$1039,
                handlers: handlers$1040,
                finalizer: finalizer$1041
            };
        },
        createUnaryExpression: function (operator$1042, argument$1043) {
            if (operator$1042 === '++' || operator$1042 === '--') {
                return {
                    type: Syntax$705.UpdateExpression,
                    operator: operator$1042,
                    argument: argument$1043,
                    prefix: true
                };
            }
            return {
                type: Syntax$705.UnaryExpression,
                operator: operator$1042,
                argument: argument$1043
            };
        },
        createVariableDeclaration: function (declarations$1044, kind$1045) {
            return {
                type: Syntax$705.VariableDeclaration,
                declarations: declarations$1044,
                kind: kind$1045
            };
        },
        createVariableDeclarator: function (id$1046, init$1047) {
            return {
                type: Syntax$705.VariableDeclarator,
                id: id$1046,
                init: init$1047
            };
        },
        createWhileStatement: function (test$1048, body$1049) {
            return {
                type: Syntax$705.WhileStatement,
                test: test$1048,
                body: body$1049
            };
        },
        createWithStatement: function (object$1050, body$1051) {
            return {
                type: Syntax$705.WithStatement,
                object: object$1050,
                body: body$1051
            };
        },
        createTemplateElement: function (value$1052, tail$1053) {
            return {
                type: Syntax$705.TemplateElement,
                value: value$1052,
                tail: tail$1053
            };
        },
        createTemplateLiteral: function (quasis$1054, expressions$1055) {
            return {
                type: Syntax$705.TemplateLiteral,
                quasis: quasis$1054,
                expressions: expressions$1055
            };
        },
        createSpreadElement: function (argument$1056) {
            return {
                type: Syntax$705.SpreadElement,
                argument: argument$1056
            };
        },
        createTaggedTemplateExpression: function (tag$1057, quasi$1058) {
            return {
                type: Syntax$705.TaggedTemplateExpression,
                tag: tag$1057,
                quasi: quasi$1058
            };
        },
        createArrowFunctionExpression: function (params$1059, defaults$1060, body$1061, rest$1062, expression$1063) {
            return {
                type: Syntax$705.ArrowFunctionExpression,
                id: null,
                params: params$1059,
                defaults: defaults$1060,
                body: body$1061,
                rest: rest$1062,
                generator: false,
                expression: expression$1063
            };
        },
        createMethodDefinition: function (propertyType$1064, kind$1065, key$1066, value$1067) {
            return {
                type: Syntax$705.MethodDefinition,
                key: key$1066,
                value: value$1067,
                kind: kind$1065,
                'static': propertyType$1064 === ClassPropertyType$710.static
            };
        },
        createClassBody: function (body$1068) {
            return {
                type: Syntax$705.ClassBody,
                body: body$1068
            };
        },
        createClassExpression: function (id$1069, superClass$1070, body$1071) {
            return {
                type: Syntax$705.ClassExpression,
                id: id$1069,
                superClass: superClass$1070,
                body: body$1071
            };
        },
        createClassDeclaration: function (id$1072, superClass$1073, body$1074) {
            return {
                type: Syntax$705.ClassDeclaration,
                id: id$1072,
                superClass: superClass$1073,
                body: body$1074
            };
        },
        createExportSpecifier: function (id$1075, name$1076) {
            return {
                type: Syntax$705.ExportSpecifier,
                id: id$1075,
                name: name$1076
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$705.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1077, specifiers$1078, source$1079) {
            return {
                type: Syntax$705.ExportDeclaration,
                declaration: declaration$1077,
                specifiers: specifiers$1078,
                source: source$1079
            };
        },
        createImportSpecifier: function (id$1080, name$1081) {
            return {
                type: Syntax$705.ImportSpecifier,
                id: id$1080,
                name: name$1081
            };
        },
        createImportDeclaration: function (specifiers$1082, kind$1083, source$1084) {
            return {
                type: Syntax$705.ImportDeclaration,
                specifiers: specifiers$1082,
                kind: kind$1083,
                source: source$1084
            };
        },
        createYieldExpression: function (argument$1085, delegate$1086) {
            return {
                type: Syntax$705.YieldExpression,
                argument: argument$1085,
                delegate: delegate$1086
            };
        },
        createModuleDeclaration: function (id$1087, source$1088, body$1089) {
            return {
                type: Syntax$705.ModuleDeclaration,
                id: id$1087,
                source: source$1088,
                body: body$1089
            };
        }
    };
    function peekLineTerminator$757() {
        return lookahead$720.lineNumber !== lineNumber$714;
    }
    function throwError$758(token$1090, messageFormat$1091) {
        var error$1092, args$1093 = Array.prototype.slice.call(arguments, 2), msg$1094 = messageFormat$1091.replace(/%(\d)/g, function (whole$1095, index$1096) {
                assert$724(index$1096 < args$1093.length, 'Message reference must be in range');
                return args$1093[index$1096];
            });
        if (typeof token$1090.lineNumber === 'number') {
            error$1092 = new Error('Line ' + token$1090.lineNumber + ': ' + msg$1094);
            error$1092.index = token$1090.range[0];
            error$1092.lineNumber = token$1090.lineNumber;
            error$1092.column = token$1090.range[0] - lineStart$715 + 1;
        } else {
            error$1092 = new Error('Line ' + lineNumber$714 + ': ' + msg$1094);
            error$1092.index = index$713;
            error$1092.lineNumber = lineNumber$714;
            error$1092.column = index$713 - lineStart$715 + 1;
        }
        error$1092.description = msg$1094;
        throw error$1092;
    }
    function throwErrorTolerant$759() {
        try {
            throwError$758.apply(null, arguments);
        } catch (e$1097) {
            if (extra$723.errors) {
                extra$723.errors.push(e$1097);
            } else {
                throw e$1097;
            }
        }
    }
    function throwUnexpected$760(token$1098) {
        if (token$1098.type === Token$702.EOF) {
            throwError$758(token$1098, Messages$707.UnexpectedEOS);
        }
        if (token$1098.type === Token$702.NumericLiteral) {
            throwError$758(token$1098, Messages$707.UnexpectedNumber);
        }
        if (token$1098.type === Token$702.StringLiteral) {
            throwError$758(token$1098, Messages$707.UnexpectedString);
        }
        if (token$1098.type === Token$702.Identifier) {
            throwError$758(token$1098, Messages$707.UnexpectedIdentifier);
        }
        if (token$1098.type === Token$702.Keyword) {
            if (isFutureReservedWord$733(token$1098.value)) {
            } else if (strict$712 && isStrictModeReservedWord$734(token$1098.value)) {
                throwErrorTolerant$759(token$1098, Messages$707.StrictReservedWord);
                return;
            }
            throwError$758(token$1098, Messages$707.UnexpectedToken, token$1098.value);
        }
        if (token$1098.type === Token$702.Template) {
            throwError$758(token$1098, Messages$707.UnexpectedTemplate, token$1098.value.raw);
        }
        throwError$758(token$1098, Messages$707.UnexpectedToken, token$1098.value);
    }
    function expect$761(value$1099) {
        var token$1100 = lex$754();
        if (token$1100.type !== Token$702.Punctuator || token$1100.value !== value$1099) {
            throwUnexpected$760(token$1100);
        }
    }
    function expectKeyword$762(keyword$1101) {
        var token$1102 = lex$754();
        if (token$1102.type !== Token$702.Keyword || token$1102.value !== keyword$1101) {
            throwUnexpected$760(token$1102);
        }
    }
    function match$763(value$1103) {
        return lookahead$720.type === Token$702.Punctuator && lookahead$720.value === value$1103;
    }
    function matchKeyword$764(keyword$1104) {
        return lookahead$720.type === Token$702.Keyword && lookahead$720.value === keyword$1104;
    }
    function matchContextualKeyword$765(keyword$1105) {
        return lookahead$720.type === Token$702.Identifier && lookahead$720.value === keyword$1105;
    }
    function matchAssign$766() {
        var op$1106;
        if (lookahead$720.type !== Token$702.Punctuator) {
            return false;
        }
        op$1106 = lookahead$720.value;
        return op$1106 === '=' || op$1106 === '*=' || op$1106 === '/=' || op$1106 === '%=' || op$1106 === '+=' || op$1106 === '-=' || op$1106 === '<<=' || op$1106 === '>>=' || op$1106 === '>>>=' || op$1106 === '&=' || op$1106 === '^=' || op$1106 === '|=';
    }
    function consumeSemicolon$767() {
        var line$1107, ch$1108;
        ch$1108 = lookahead$720.value ? lookahead$720.value.charCodeAt(0) : -1;
        if (ch$1108 === 59) {
            lex$754();
            return;
        }
        if (lookahead$720.lineNumber !== lineNumber$714) {
            return;
        }
        if (match$763(';')) {
            lex$754();
            return;
        }
        if (lookahead$720.type !== Token$702.EOF && !match$763('}')) {
            throwUnexpected$760(lookahead$720);
        }
    }
    function isLeftHandSide$768(expr$1109) {
        return expr$1109.type === Syntax$705.Identifier || expr$1109.type === Syntax$705.MemberExpression;
    }
    function isAssignableLeftHandSide$769(expr$1110) {
        return isLeftHandSide$768(expr$1110) || expr$1110.type === Syntax$705.ObjectPattern || expr$1110.type === Syntax$705.ArrayPattern;
    }
    function parseArrayInitialiser$770() {
        var elements$1111 = [], blocks$1112 = [], filter$1113 = null, tmp$1114, possiblecomprehension$1115 = true, body$1116;
        expect$761('[');
        while (!match$763(']')) {
            if (lookahead$720.value === 'for' && lookahead$720.type === Token$702.Keyword) {
                if (!possiblecomprehension$1115) {
                    throwError$758({}, Messages$707.ComprehensionError);
                }
                matchKeyword$764('for');
                tmp$1114 = parseForStatement$818({ ignoreBody: true });
                tmp$1114.of = tmp$1114.type === Syntax$705.ForOfStatement;
                tmp$1114.type = Syntax$705.ComprehensionBlock;
                if (tmp$1114.left.kind) {
                    throwError$758({}, Messages$707.ComprehensionError);
                }
                blocks$1112.push(tmp$1114);
            } else if (lookahead$720.value === 'if' && lookahead$720.type === Token$702.Keyword) {
                if (!possiblecomprehension$1115) {
                    throwError$758({}, Messages$707.ComprehensionError);
                }
                expectKeyword$762('if');
                expect$761('(');
                filter$1113 = parseExpression$798();
                expect$761(')');
            } else if (lookahead$720.value === ',' && lookahead$720.type === Token$702.Punctuator) {
                possiblecomprehension$1115 = false;
                lex$754();
                elements$1111.push(null);
            } else {
                tmp$1114 = parseSpreadOrAssignmentExpression$781();
                elements$1111.push(tmp$1114);
                if (tmp$1114 && tmp$1114.type === Syntax$705.SpreadElement) {
                    if (!match$763(']')) {
                        throwError$758({}, Messages$707.ElementAfterSpreadElement);
                    }
                } else if (!(match$763(']') || matchKeyword$764('for') || matchKeyword$764('if'))) {
                    expect$761(',');
                    possiblecomprehension$1115 = false;
                }
            }
        }
        expect$761(']');
        if (filter$1113 && !blocks$1112.length) {
            throwError$758({}, Messages$707.ComprehensionRequiresBlock);
        }
        if (blocks$1112.length) {
            if (elements$1111.length !== 1) {
                throwError$758({}, Messages$707.ComprehensionError);
            }
            return {
                type: Syntax$705.ComprehensionExpression,
                filter: filter$1113,
                blocks: blocks$1112,
                body: elements$1111[0]
            };
        }
        return delegate$717.createArrayExpression(elements$1111);
    }
    function parsePropertyFunction$771(options$1117) {
        var previousStrict$1118, previousYieldAllowed$1119, params$1120, defaults$1121, body$1122;
        previousStrict$1118 = strict$712;
        previousYieldAllowed$1119 = state$722.yieldAllowed;
        state$722.yieldAllowed = options$1117.generator;
        params$1120 = options$1117.params || [];
        defaults$1121 = options$1117.defaults || [];
        body$1122 = parseConciseBody$830();
        if (options$1117.name && strict$712 && isRestrictedWord$735(params$1120[0].name)) {
            throwErrorTolerant$759(options$1117.name, Messages$707.StrictParamName);
        }
        if (state$722.yieldAllowed && !state$722.yieldFound) {
            throwErrorTolerant$759({}, Messages$707.NoYieldInGenerator);
        }
        strict$712 = previousStrict$1118;
        state$722.yieldAllowed = previousYieldAllowed$1119;
        return delegate$717.createFunctionExpression(null, params$1120, defaults$1121, body$1122, options$1117.rest || null, options$1117.generator, body$1122.type !== Syntax$705.BlockStatement);
    }
    function parsePropertyMethodFunction$772(options$1123) {
        var previousStrict$1124, tmp$1125, method$1126;
        previousStrict$1124 = strict$712;
        strict$712 = true;
        tmp$1125 = parseParams$834();
        if (tmp$1125.stricted) {
            throwErrorTolerant$759(tmp$1125.stricted, tmp$1125.message);
        }
        method$1126 = parsePropertyFunction$771({
            params: tmp$1125.params,
            defaults: tmp$1125.defaults,
            rest: tmp$1125.rest,
            generator: options$1123.generator
        });
        strict$712 = previousStrict$1124;
        return method$1126;
    }
    function parseObjectPropertyKey$773() {
        var token$1127 = lex$754();
        if (token$1127.type === Token$702.StringLiteral || token$1127.type === Token$702.NumericLiteral) {
            if (strict$712 && token$1127.octal) {
                throwErrorTolerant$759(token$1127, Messages$707.StrictOctalLiteral);
            }
            return delegate$717.createLiteral(token$1127);
        }
        return delegate$717.createIdentifier(token$1127.value);
    }
    function parseObjectProperty$774() {
        var token$1128, key$1129, id$1130, value$1131, param$1132;
        token$1128 = lookahead$720;
        if (token$1128.type === Token$702.Identifier) {
            id$1130 = parseObjectPropertyKey$773();
            if (token$1128.value === 'get' && !(match$763(':') || match$763('('))) {
                key$1129 = parseObjectPropertyKey$773();
                expect$761('(');
                expect$761(')');
                return delegate$717.createProperty('get', key$1129, parsePropertyFunction$771({ generator: false }), false, false);
            }
            if (token$1128.value === 'set' && !(match$763(':') || match$763('('))) {
                key$1129 = parseObjectPropertyKey$773();
                expect$761('(');
                token$1128 = lookahead$720;
                param$1132 = [parseVariableIdentifier$801()];
                expect$761(')');
                return delegate$717.createProperty('set', key$1129, parsePropertyFunction$771({
                    params: param$1132,
                    generator: false,
                    name: token$1128
                }), false, false);
            }
            if (match$763(':')) {
                lex$754();
                return delegate$717.createProperty('init', id$1130, parseAssignmentExpression$797(), false, false);
            }
            if (match$763('(')) {
                return delegate$717.createProperty('init', id$1130, parsePropertyMethodFunction$772({ generator: false }), true, false);
            }
            return delegate$717.createProperty('init', id$1130, id$1130, false, true);
        }
        if (token$1128.type === Token$702.EOF || token$1128.type === Token$702.Punctuator) {
            if (!match$763('*')) {
                throwUnexpected$760(token$1128);
            }
            lex$754();
            id$1130 = parseObjectPropertyKey$773();
            if (!match$763('(')) {
                throwUnexpected$760(lex$754());
            }
            return delegate$717.createProperty('init', id$1130, parsePropertyMethodFunction$772({ generator: true }), true, false);
        }
        key$1129 = parseObjectPropertyKey$773();
        if (match$763(':')) {
            lex$754();
            return delegate$717.createProperty('init', key$1129, parseAssignmentExpression$797(), false, false);
        }
        if (match$763('(')) {
            return delegate$717.createProperty('init', key$1129, parsePropertyMethodFunction$772({ generator: false }), true, false);
        }
        throwUnexpected$760(lex$754());
    }
    function parseObjectInitialiser$775() {
        var properties$1133 = [], property$1134, name$1135, key$1136, kind$1137, map$1138 = {}, toString$1139 = String;
        expect$761('{');
        while (!match$763('}')) {
            property$1134 = parseObjectProperty$774();
            if (property$1134.key.type === Syntax$705.Identifier) {
                name$1135 = property$1134.key.name;
            } else {
                name$1135 = toString$1139(property$1134.key.value);
            }
            kind$1137 = property$1134.kind === 'init' ? PropertyKind$706.Data : property$1134.kind === 'get' ? PropertyKind$706.Get : PropertyKind$706.Set;
            key$1136 = '$' + name$1135;
            if (Object.prototype.hasOwnProperty.call(map$1138, key$1136)) {
                if (map$1138[key$1136] === PropertyKind$706.Data) {
                    if (strict$712 && kind$1137 === PropertyKind$706.Data) {
                        throwErrorTolerant$759({}, Messages$707.StrictDuplicateProperty);
                    } else if (kind$1137 !== PropertyKind$706.Data) {
                        throwErrorTolerant$759({}, Messages$707.AccessorDataProperty);
                    }
                } else {
                    if (kind$1137 === PropertyKind$706.Data) {
                        throwErrorTolerant$759({}, Messages$707.AccessorDataProperty);
                    } else if (map$1138[key$1136] & kind$1137) {
                        throwErrorTolerant$759({}, Messages$707.AccessorGetSet);
                    }
                }
                map$1138[key$1136] |= kind$1137;
            } else {
                map$1138[key$1136] = kind$1137;
            }
            properties$1133.push(property$1134);
            if (!match$763('}')) {
                expect$761(',');
            }
        }
        expect$761('}');
        return delegate$717.createObjectExpression(properties$1133);
    }
    function parseTemplateElement$776(option$1140) {
        var token$1141 = scanTemplateElement$749(option$1140);
        if (strict$712 && token$1141.octal) {
            throwError$758(token$1141, Messages$707.StrictOctalLiteral);
        }
        return delegate$717.createTemplateElement({
            raw: token$1141.value.raw,
            cooked: token$1141.value.cooked
        }, token$1141.tail);
    }
    function parseTemplateLiteral$777() {
        var quasi$1142, quasis$1143, expressions$1144;
        quasi$1142 = parseTemplateElement$776({ head: true });
        quasis$1143 = [quasi$1142];
        expressions$1144 = [];
        while (!quasi$1142.tail) {
            expressions$1144.push(parseExpression$798());
            quasi$1142 = parseTemplateElement$776({ head: false });
            quasis$1143.push(quasi$1142);
        }
        return delegate$717.createTemplateLiteral(quasis$1143, expressions$1144);
    }
    function parseGroupExpression$778() {
        var expr$1145;
        expect$761('(');
        ++state$722.parenthesizedCount;
        expr$1145 = parseExpression$798();
        expect$761(')');
        return expr$1145;
    }
    function parsePrimaryExpression$779() {
        var type$1146, token$1147, resolvedIdent$1148;
        token$1147 = lookahead$720;
        type$1146 = lookahead$720.type;
        if (type$1146 === Token$702.Identifier) {
            resolvedIdent$1148 = expander$701.resolve(tokenStream$718[lookaheadIndex$721]);
            lex$754();
            return delegate$717.createIdentifier(resolvedIdent$1148);
        }
        if (type$1146 === Token$702.StringLiteral || type$1146 === Token$702.NumericLiteral) {
            if (strict$712 && lookahead$720.octal) {
                throwErrorTolerant$759(lookahead$720, Messages$707.StrictOctalLiteral);
            }
            return delegate$717.createLiteral(lex$754());
        }
        if (type$1146 === Token$702.Keyword) {
            if (matchKeyword$764('this')) {
                lex$754();
                return delegate$717.createThisExpression();
            }
            if (matchKeyword$764('function')) {
                return parseFunctionExpression$836();
            }
            if (matchKeyword$764('class')) {
                return parseClassExpression$841();
            }
            if (matchKeyword$764('super')) {
                lex$754();
                return delegate$717.createIdentifier('super');
            }
        }
        if (type$1146 === Token$702.BooleanLiteral) {
            token$1147 = lex$754();
            token$1147.value = token$1147.value === 'true';
            return delegate$717.createLiteral(token$1147);
        }
        if (type$1146 === Token$702.NullLiteral) {
            token$1147 = lex$754();
            token$1147.value = null;
            return delegate$717.createLiteral(token$1147);
        }
        if (match$763('[')) {
            return parseArrayInitialiser$770();
        }
        if (match$763('{')) {
            return parseObjectInitialiser$775();
        }
        if (match$763('(')) {
            return parseGroupExpression$778();
        }
        if (lookahead$720.type === Token$702.RegularExpression) {
            return delegate$717.createLiteral(lex$754());
        }
        if (type$1146 === Token$702.Template) {
            return parseTemplateLiteral$777();
        }
        return throwUnexpected$760(lex$754());
    }
    function parseArguments$780() {
        var args$1149 = [], arg$1150;
        expect$761('(');
        if (!match$763(')')) {
            while (streamIndex$719 < length$716) {
                arg$1150 = parseSpreadOrAssignmentExpression$781();
                args$1149.push(arg$1150);
                if (match$763(')')) {
                    break;
                } else if (arg$1150.type === Syntax$705.SpreadElement) {
                    throwError$758({}, Messages$707.ElementAfterSpreadElement);
                }
                expect$761(',');
            }
        }
        expect$761(')');
        return args$1149;
    }
    function parseSpreadOrAssignmentExpression$781() {
        if (match$763('...')) {
            lex$754();
            return delegate$717.createSpreadElement(parseAssignmentExpression$797());
        }
        return parseAssignmentExpression$797();
    }
    function parseNonComputedProperty$782() {
        var token$1151 = lex$754();
        if (!isIdentifierName$751(token$1151)) {
            throwUnexpected$760(token$1151);
        }
        return delegate$717.createIdentifier(token$1151.value);
    }
    function parseNonComputedMember$783() {
        expect$761('.');
        return parseNonComputedProperty$782();
    }
    function parseComputedMember$784() {
        var expr$1152;
        expect$761('[');
        expr$1152 = parseExpression$798();
        expect$761(']');
        return expr$1152;
    }
    function parseNewExpression$785() {
        var callee$1153, args$1154;
        expectKeyword$762('new');
        callee$1153 = parseLeftHandSideExpression$787();
        args$1154 = match$763('(') ? parseArguments$780() : [];
        return delegate$717.createNewExpression(callee$1153, args$1154);
    }
    function parseLeftHandSideExpressionAllowCall$786() {
        var expr$1155, args$1156, property$1157;
        expr$1155 = matchKeyword$764('new') ? parseNewExpression$785() : parsePrimaryExpression$779();
        while (match$763('.') || match$763('[') || match$763('(') || lookahead$720.type === Token$702.Template) {
            if (match$763('(')) {
                args$1156 = parseArguments$780();
                expr$1155 = delegate$717.createCallExpression(expr$1155, args$1156);
            } else if (match$763('[')) {
                expr$1155 = delegate$717.createMemberExpression('[', expr$1155, parseComputedMember$784());
            } else if (match$763('.')) {
                expr$1155 = delegate$717.createMemberExpression('.', expr$1155, parseNonComputedMember$783());
            } else {
                expr$1155 = delegate$717.createTaggedTemplateExpression(expr$1155, parseTemplateLiteral$777());
            }
        }
        return expr$1155;
    }
    function parseLeftHandSideExpression$787() {
        var expr$1158, property$1159;
        expr$1158 = matchKeyword$764('new') ? parseNewExpression$785() : parsePrimaryExpression$779();
        while (match$763('.') || match$763('[') || lookahead$720.type === Token$702.Template) {
            if (match$763('[')) {
                expr$1158 = delegate$717.createMemberExpression('[', expr$1158, parseComputedMember$784());
            } else if (match$763('.')) {
                expr$1158 = delegate$717.createMemberExpression('.', expr$1158, parseNonComputedMember$783());
            } else {
                expr$1158 = delegate$717.createTaggedTemplateExpression(expr$1158, parseTemplateLiteral$777());
            }
        }
        return expr$1158;
    }
    function parsePostfixExpression$788() {
        var expr$1160 = parseLeftHandSideExpressionAllowCall$786(), token$1161 = lookahead$720;
        if (lookahead$720.type !== Token$702.Punctuator) {
            return expr$1160;
        }
        if ((match$763('++') || match$763('--')) && !peekLineTerminator$757()) {
            if (strict$712 && expr$1160.type === Syntax$705.Identifier && isRestrictedWord$735(expr$1160.name)) {
                throwErrorTolerant$759({}, Messages$707.StrictLHSPostfix);
            }
            if (!isLeftHandSide$768(expr$1160)) {
                throwError$758({}, Messages$707.InvalidLHSInAssignment);
            }
            token$1161 = lex$754();
            expr$1160 = delegate$717.createPostfixExpression(token$1161.value, expr$1160);
        }
        return expr$1160;
    }
    function parseUnaryExpression$789() {
        var token$1162, expr$1163;
        if (lookahead$720.type !== Token$702.Punctuator && lookahead$720.type !== Token$702.Keyword) {
            return parsePostfixExpression$788();
        }
        if (match$763('++') || match$763('--')) {
            token$1162 = lex$754();
            expr$1163 = parseUnaryExpression$789();
            if (strict$712 && expr$1163.type === Syntax$705.Identifier && isRestrictedWord$735(expr$1163.name)) {
                throwErrorTolerant$759({}, Messages$707.StrictLHSPrefix);
            }
            if (!isLeftHandSide$768(expr$1163)) {
                throwError$758({}, Messages$707.InvalidLHSInAssignment);
            }
            return delegate$717.createUnaryExpression(token$1162.value, expr$1163);
        }
        if (match$763('+') || match$763('-') || match$763('~') || match$763('!')) {
            token$1162 = lex$754();
            expr$1163 = parseUnaryExpression$789();
            return delegate$717.createUnaryExpression(token$1162.value, expr$1163);
        }
        if (matchKeyword$764('delete') || matchKeyword$764('void') || matchKeyword$764('typeof')) {
            token$1162 = lex$754();
            expr$1163 = parseUnaryExpression$789();
            expr$1163 = delegate$717.createUnaryExpression(token$1162.value, expr$1163);
            if (strict$712 && expr$1163.operator === 'delete' && expr$1163.argument.type === Syntax$705.Identifier) {
                throwErrorTolerant$759({}, Messages$707.StrictDelete);
            }
            return expr$1163;
        }
        return parsePostfixExpression$788();
    }
    function binaryPrecedence$790(token$1164, allowIn$1165) {
        var prec$1166 = 0;
        if (token$1164.type !== Token$702.Punctuator && token$1164.type !== Token$702.Keyword) {
            return 0;
        }
        switch (token$1164.value) {
        case '||':
            prec$1166 = 1;
            break;
        case '&&':
            prec$1166 = 2;
            break;
        case '|':
            prec$1166 = 3;
            break;
        case '^':
            prec$1166 = 4;
            break;
        case '&':
            prec$1166 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1166 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1166 = 7;
            break;
        case 'in':
            prec$1166 = allowIn$1165 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1166 = 8;
            break;
        case '+':
        case '-':
            prec$1166 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1166 = 11;
            break;
        default:
            break;
        }
        return prec$1166;
    }
    function parseBinaryExpression$791() {
        var expr$1167, token$1168, prec$1169, previousAllowIn$1170, stack$1171, right$1172, operator$1173, left$1174, i$1175;
        previousAllowIn$1170 = state$722.allowIn;
        state$722.allowIn = true;
        expr$1167 = parseUnaryExpression$789();
        token$1168 = lookahead$720;
        prec$1169 = binaryPrecedence$790(token$1168, previousAllowIn$1170);
        if (prec$1169 === 0) {
            return expr$1167;
        }
        token$1168.prec = prec$1169;
        lex$754();
        stack$1171 = [
            expr$1167,
            token$1168,
            parseUnaryExpression$789()
        ];
        while ((prec$1169 = binaryPrecedence$790(lookahead$720, previousAllowIn$1170)) > 0) {
            while (stack$1171.length > 2 && prec$1169 <= stack$1171[stack$1171.length - 2].prec) {
                right$1172 = stack$1171.pop();
                operator$1173 = stack$1171.pop().value;
                left$1174 = stack$1171.pop();
                stack$1171.push(delegate$717.createBinaryExpression(operator$1173, left$1174, right$1172));
            }
            token$1168 = lex$754();
            token$1168.prec = prec$1169;
            stack$1171.push(token$1168);
            stack$1171.push(parseUnaryExpression$789());
        }
        state$722.allowIn = previousAllowIn$1170;
        i$1175 = stack$1171.length - 1;
        expr$1167 = stack$1171[i$1175];
        while (i$1175 > 1) {
            expr$1167 = delegate$717.createBinaryExpression(stack$1171[i$1175 - 1].value, stack$1171[i$1175 - 2], expr$1167);
            i$1175 -= 2;
        }
        return expr$1167;
    }
    function parseConditionalExpression$792() {
        var expr$1176, previousAllowIn$1177, consequent$1178, alternate$1179;
        expr$1176 = parseBinaryExpression$791();
        if (match$763('?')) {
            lex$754();
            previousAllowIn$1177 = state$722.allowIn;
            state$722.allowIn = true;
            consequent$1178 = parseAssignmentExpression$797();
            state$722.allowIn = previousAllowIn$1177;
            expect$761(':');
            alternate$1179 = parseAssignmentExpression$797();
            expr$1176 = delegate$717.createConditionalExpression(expr$1176, consequent$1178, alternate$1179);
        }
        return expr$1176;
    }
    function reinterpretAsAssignmentBindingPattern$793(expr$1180) {
        var i$1181, len$1182, property$1183, element$1184;
        if (expr$1180.type === Syntax$705.ObjectExpression) {
            expr$1180.type = Syntax$705.ObjectPattern;
            for (i$1181 = 0, len$1182 = expr$1180.properties.length; i$1181 < len$1182; i$1181 += 1) {
                property$1183 = expr$1180.properties[i$1181];
                if (property$1183.kind !== 'init') {
                    throwError$758({}, Messages$707.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$793(property$1183.value);
            }
        } else if (expr$1180.type === Syntax$705.ArrayExpression) {
            expr$1180.type = Syntax$705.ArrayPattern;
            for (i$1181 = 0, len$1182 = expr$1180.elements.length; i$1181 < len$1182; i$1181 += 1) {
                element$1184 = expr$1180.elements[i$1181];
                if (element$1184) {
                    reinterpretAsAssignmentBindingPattern$793(element$1184);
                }
            }
        } else if (expr$1180.type === Syntax$705.Identifier) {
            if (isRestrictedWord$735(expr$1180.name)) {
                throwError$758({}, Messages$707.InvalidLHSInAssignment);
            }
        } else if (expr$1180.type === Syntax$705.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$793(expr$1180.argument);
            if (expr$1180.argument.type === Syntax$705.ObjectPattern) {
                throwError$758({}, Messages$707.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1180.type !== Syntax$705.MemberExpression && expr$1180.type !== Syntax$705.CallExpression && expr$1180.type !== Syntax$705.NewExpression) {
                throwError$758({}, Messages$707.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$794(options$1185, expr$1186) {
        var i$1187, len$1188, property$1189, element$1190;
        if (expr$1186.type === Syntax$705.ObjectExpression) {
            expr$1186.type = Syntax$705.ObjectPattern;
            for (i$1187 = 0, len$1188 = expr$1186.properties.length; i$1187 < len$1188; i$1187 += 1) {
                property$1189 = expr$1186.properties[i$1187];
                if (property$1189.kind !== 'init') {
                    throwError$758({}, Messages$707.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$794(options$1185, property$1189.value);
            }
        } else if (expr$1186.type === Syntax$705.ArrayExpression) {
            expr$1186.type = Syntax$705.ArrayPattern;
            for (i$1187 = 0, len$1188 = expr$1186.elements.length; i$1187 < len$1188; i$1187 += 1) {
                element$1190 = expr$1186.elements[i$1187];
                if (element$1190) {
                    reinterpretAsDestructuredParameter$794(options$1185, element$1190);
                }
            }
        } else if (expr$1186.type === Syntax$705.Identifier) {
            validateParam$832(options$1185, expr$1186, expr$1186.name);
        } else {
            if (expr$1186.type !== Syntax$705.MemberExpression) {
                throwError$758({}, Messages$707.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$795(expressions$1191) {
        var i$1192, len$1193, param$1194, params$1195, defaults$1196, defaultCount$1197, options$1198, rest$1199;
        params$1195 = [];
        defaults$1196 = [];
        defaultCount$1197 = 0;
        rest$1199 = null;
        options$1198 = { paramSet: {} };
        for (i$1192 = 0, len$1193 = expressions$1191.length; i$1192 < len$1193; i$1192 += 1) {
            param$1194 = expressions$1191[i$1192];
            if (param$1194.type === Syntax$705.Identifier) {
                params$1195.push(param$1194);
                defaults$1196.push(null);
                validateParam$832(options$1198, param$1194, param$1194.name);
            } else if (param$1194.type === Syntax$705.ObjectExpression || param$1194.type === Syntax$705.ArrayExpression) {
                reinterpretAsDestructuredParameter$794(options$1198, param$1194);
                params$1195.push(param$1194);
                defaults$1196.push(null);
            } else if (param$1194.type === Syntax$705.SpreadElement) {
                assert$724(i$1192 === len$1193 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$794(options$1198, param$1194.argument);
                rest$1199 = param$1194.argument;
            } else if (param$1194.type === Syntax$705.AssignmentExpression) {
                params$1195.push(param$1194.left);
                defaults$1196.push(param$1194.right);
                ++defaultCount$1197;
                validateParam$832(options$1198, param$1194.left, param$1194.left.name);
            } else {
                return null;
            }
        }
        if (options$1198.message === Messages$707.StrictParamDupe) {
            throwError$758(strict$712 ? options$1198.stricted : options$1198.firstRestricted, options$1198.message);
        }
        if (defaultCount$1197 === 0) {
            defaults$1196 = [];
        }
        return {
            params: params$1195,
            defaults: defaults$1196,
            rest: rest$1199,
            stricted: options$1198.stricted,
            firstRestricted: options$1198.firstRestricted,
            message: options$1198.message
        };
    }
    function parseArrowFunctionExpression$796(options$1200) {
        var previousStrict$1201, previousYieldAllowed$1202, body$1203;
        expect$761('=>');
        previousStrict$1201 = strict$712;
        previousYieldAllowed$1202 = state$722.yieldAllowed;
        state$722.yieldAllowed = false;
        body$1203 = parseConciseBody$830();
        if (strict$712 && options$1200.firstRestricted) {
            throwError$758(options$1200.firstRestricted, options$1200.message);
        }
        if (strict$712 && options$1200.stricted) {
            throwErrorTolerant$759(options$1200.stricted, options$1200.message);
        }
        strict$712 = previousStrict$1201;
        state$722.yieldAllowed = previousYieldAllowed$1202;
        return delegate$717.createArrowFunctionExpression(options$1200.params, options$1200.defaults, body$1203, options$1200.rest, body$1203.type !== Syntax$705.BlockStatement);
    }
    function parseAssignmentExpression$797() {
        var expr$1204, token$1205, params$1206, oldParenthesizedCount$1207;
        if (matchKeyword$764('yield')) {
            return parseYieldExpression$837();
        }
        oldParenthesizedCount$1207 = state$722.parenthesizedCount;
        if (match$763('(')) {
            token$1205 = lookahead2$756();
            if (token$1205.type === Token$702.Punctuator && token$1205.value === ')' || token$1205.value === '...') {
                params$1206 = parseParams$834();
                if (!match$763('=>')) {
                    throwUnexpected$760(lex$754());
                }
                return parseArrowFunctionExpression$796(params$1206);
            }
        }
        token$1205 = lookahead$720;
        expr$1204 = parseConditionalExpression$792();
        if (match$763('=>') && (state$722.parenthesizedCount === oldParenthesizedCount$1207 || state$722.parenthesizedCount === oldParenthesizedCount$1207 + 1)) {
            if (expr$1204.type === Syntax$705.Identifier) {
                params$1206 = reinterpretAsCoverFormalsList$795([expr$1204]);
            } else if (expr$1204.type === Syntax$705.SequenceExpression) {
                params$1206 = reinterpretAsCoverFormalsList$795(expr$1204.expressions);
            }
            if (params$1206) {
                return parseArrowFunctionExpression$796(params$1206);
            }
        }
        if (matchAssign$766()) {
            if (strict$712 && expr$1204.type === Syntax$705.Identifier && isRestrictedWord$735(expr$1204.name)) {
                throwErrorTolerant$759(token$1205, Messages$707.StrictLHSAssignment);
            }
            if (match$763('=') && (expr$1204.type === Syntax$705.ObjectExpression || expr$1204.type === Syntax$705.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$793(expr$1204);
            } else if (!isLeftHandSide$768(expr$1204)) {
                throwError$758({}, Messages$707.InvalidLHSInAssignment);
            }
            expr$1204 = delegate$717.createAssignmentExpression(lex$754().value, expr$1204, parseAssignmentExpression$797());
        }
        return expr$1204;
    }
    function parseExpression$798() {
        var expr$1208, expressions$1209, sequence$1210, coverFormalsList$1211, spreadFound$1212, oldParenthesizedCount$1213;
        oldParenthesizedCount$1213 = state$722.parenthesizedCount;
        expr$1208 = parseAssignmentExpression$797();
        expressions$1209 = [expr$1208];
        if (match$763(',')) {
            while (streamIndex$719 < length$716) {
                if (!match$763(',')) {
                    break;
                }
                lex$754();
                expr$1208 = parseSpreadOrAssignmentExpression$781();
                expressions$1209.push(expr$1208);
                if (expr$1208.type === Syntax$705.SpreadElement) {
                    spreadFound$1212 = true;
                    if (!match$763(')')) {
                        throwError$758({}, Messages$707.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1210 = delegate$717.createSequenceExpression(expressions$1209);
        }
        if (match$763('=>')) {
            if (state$722.parenthesizedCount === oldParenthesizedCount$1213 || state$722.parenthesizedCount === oldParenthesizedCount$1213 + 1) {
                expr$1208 = expr$1208.type === Syntax$705.SequenceExpression ? expr$1208.expressions : expressions$1209;
                coverFormalsList$1211 = reinterpretAsCoverFormalsList$795(expr$1208);
                if (coverFormalsList$1211) {
                    return parseArrowFunctionExpression$796(coverFormalsList$1211);
                }
            }
            throwUnexpected$760(lex$754());
        }
        if (spreadFound$1212 && lookahead2$756().value !== '=>') {
            throwError$758({}, Messages$707.IllegalSpread);
        }
        return sequence$1210 || expr$1208;
    }
    function parseStatementList$799() {
        var list$1214 = [], statement$1215;
        while (streamIndex$719 < length$716) {
            if (match$763('}')) {
                break;
            }
            statement$1215 = parseSourceElement$844();
            if (typeof statement$1215 === 'undefined') {
                break;
            }
            list$1214.push(statement$1215);
        }
        return list$1214;
    }
    function parseBlock$800() {
        var block$1216;
        expect$761('{');
        block$1216 = parseStatementList$799();
        expect$761('}');
        return delegate$717.createBlockStatement(block$1216);
    }
    function parseVariableIdentifier$801() {
        var token$1217 = lookahead$720, resolvedIdent$1218;
        if (token$1217.type !== Token$702.Identifier) {
            throwUnexpected$760(token$1217);
        }
        resolvedIdent$1218 = expander$701.resolve(tokenStream$718[lookaheadIndex$721]);
        lex$754();
        return delegate$717.createIdentifier(resolvedIdent$1218);
    }
    function parseVariableDeclaration$802(kind$1219) {
        var id$1220, init$1221 = null;
        if (match$763('{')) {
            id$1220 = parseObjectInitialiser$775();
            reinterpretAsAssignmentBindingPattern$793(id$1220);
        } else if (match$763('[')) {
            id$1220 = parseArrayInitialiser$770();
            reinterpretAsAssignmentBindingPattern$793(id$1220);
        } else {
            id$1220 = state$722.allowKeyword ? parseNonComputedProperty$782() : parseVariableIdentifier$801();
            if (strict$712 && isRestrictedWord$735(id$1220.name)) {
                throwErrorTolerant$759({}, Messages$707.StrictVarName);
            }
        }
        if (kind$1219 === 'const') {
            if (!match$763('=')) {
                throwError$758({}, Messages$707.NoUnintializedConst);
            }
            expect$761('=');
            init$1221 = parseAssignmentExpression$797();
        } else if (match$763('=')) {
            lex$754();
            init$1221 = parseAssignmentExpression$797();
        }
        return delegate$717.createVariableDeclarator(id$1220, init$1221);
    }
    function parseVariableDeclarationList$803(kind$1222) {
        var list$1223 = [];
        do {
            list$1223.push(parseVariableDeclaration$802(kind$1222));
            if (!match$763(',')) {
                break;
            }
            lex$754();
        } while (streamIndex$719 < length$716);
        return list$1223;
    }
    function parseVariableStatement$804() {
        var declarations$1224;
        expectKeyword$762('var');
        declarations$1224 = parseVariableDeclarationList$803();
        consumeSemicolon$767();
        return delegate$717.createVariableDeclaration(declarations$1224, 'var');
    }
    function parseConstLetDeclaration$805(kind$1225) {
        var declarations$1226;
        expectKeyword$762(kind$1225);
        declarations$1226 = parseVariableDeclarationList$803(kind$1225);
        consumeSemicolon$767();
        return delegate$717.createVariableDeclaration(declarations$1226, kind$1225);
    }
    function parseModuleDeclaration$806() {
        var id$1227, src$1228, body$1229;
        lex$754();
        if (peekLineTerminator$757()) {
            throwError$758({}, Messages$707.NewlineAfterModule);
        }
        switch (lookahead$720.type) {
        case Token$702.StringLiteral:
            id$1227 = parsePrimaryExpression$779();
            body$1229 = parseModuleBlock$849();
            src$1228 = null;
            break;
        case Token$702.Identifier:
            id$1227 = parseVariableIdentifier$801();
            body$1229 = null;
            if (!matchContextualKeyword$765('from')) {
                throwUnexpected$760(lex$754());
            }
            lex$754();
            src$1228 = parsePrimaryExpression$779();
            if (src$1228.type !== Syntax$705.Literal) {
                throwError$758({}, Messages$707.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$767();
        return delegate$717.createModuleDeclaration(id$1227, src$1228, body$1229);
    }
    function parseExportBatchSpecifier$807() {
        expect$761('*');
        return delegate$717.createExportBatchSpecifier();
    }
    function parseExportSpecifier$808() {
        var id$1230, name$1231 = null;
        id$1230 = parseVariableIdentifier$801();
        if (matchContextualKeyword$765('as')) {
            lex$754();
            name$1231 = parseNonComputedProperty$782();
        }
        return delegate$717.createExportSpecifier(id$1230, name$1231);
    }
    function parseExportDeclaration$809() {
        var previousAllowKeyword$1232, decl$1233, def$1234, src$1235, specifiers$1236;
        expectKeyword$762('export');
        if (lookahead$720.type === Token$702.Keyword) {
            switch (lookahead$720.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$717.createExportDeclaration(parseSourceElement$844(), null, null);
            }
        }
        if (isIdentifierName$751(lookahead$720)) {
            previousAllowKeyword$1232 = state$722.allowKeyword;
            state$722.allowKeyword = true;
            decl$1233 = parseVariableDeclarationList$803('let');
            state$722.allowKeyword = previousAllowKeyword$1232;
            return delegate$717.createExportDeclaration(decl$1233, null, null);
        }
        specifiers$1236 = [];
        src$1235 = null;
        if (match$763('*')) {
            specifiers$1236.push(parseExportBatchSpecifier$807());
        } else {
            expect$761('{');
            do {
                specifiers$1236.push(parseExportSpecifier$808());
            } while (match$763(',') && lex$754());
            expect$761('}');
        }
        if (matchContextualKeyword$765('from')) {
            lex$754();
            src$1235 = parsePrimaryExpression$779();
            if (src$1235.type !== Syntax$705.Literal) {
                throwError$758({}, Messages$707.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$767();
        return delegate$717.createExportDeclaration(null, specifiers$1236, src$1235);
    }
    function parseImportDeclaration$810() {
        var specifiers$1237, kind$1238, src$1239;
        expectKeyword$762('import');
        specifiers$1237 = [];
        if (isIdentifierName$751(lookahead$720)) {
            kind$1238 = 'default';
            specifiers$1237.push(parseImportSpecifier$811());
            if (!matchContextualKeyword$765('from')) {
                throwError$758({}, Messages$707.NoFromAfterImport);
            }
            lex$754();
        } else if (match$763('{')) {
            kind$1238 = 'named';
            lex$754();
            do {
                specifiers$1237.push(parseImportSpecifier$811());
            } while (match$763(',') && lex$754());
            expect$761('}');
            if (!matchContextualKeyword$765('from')) {
                throwError$758({}, Messages$707.NoFromAfterImport);
            }
            lex$754();
        }
        src$1239 = parsePrimaryExpression$779();
        if (src$1239.type !== Syntax$705.Literal) {
            throwError$758({}, Messages$707.InvalidModuleSpecifier);
        }
        consumeSemicolon$767();
        return delegate$717.createImportDeclaration(specifiers$1237, kind$1238, src$1239);
    }
    function parseImportSpecifier$811() {
        var id$1240, name$1241 = null;
        id$1240 = parseNonComputedProperty$782();
        if (matchContextualKeyword$765('as')) {
            lex$754();
            name$1241 = parseVariableIdentifier$801();
        }
        return delegate$717.createImportSpecifier(id$1240, name$1241);
    }
    function parseEmptyStatement$812() {
        expect$761(';');
        return delegate$717.createEmptyStatement();
    }
    function parseExpressionStatement$813() {
        var expr$1242 = parseExpression$798();
        consumeSemicolon$767();
        return delegate$717.createExpressionStatement(expr$1242);
    }
    function parseIfStatement$814() {
        var test$1243, consequent$1244, alternate$1245;
        expectKeyword$762('if');
        expect$761('(');
        test$1243 = parseExpression$798();
        expect$761(')');
        consequent$1244 = parseStatement$829();
        if (matchKeyword$764('else')) {
            lex$754();
            alternate$1245 = parseStatement$829();
        } else {
            alternate$1245 = null;
        }
        return delegate$717.createIfStatement(test$1243, consequent$1244, alternate$1245);
    }
    function parseDoWhileStatement$815() {
        var body$1246, test$1247, oldInIteration$1248;
        expectKeyword$762('do');
        oldInIteration$1248 = state$722.inIteration;
        state$722.inIteration = true;
        body$1246 = parseStatement$829();
        state$722.inIteration = oldInIteration$1248;
        expectKeyword$762('while');
        expect$761('(');
        test$1247 = parseExpression$798();
        expect$761(')');
        if (match$763(';')) {
            lex$754();
        }
        return delegate$717.createDoWhileStatement(body$1246, test$1247);
    }
    function parseWhileStatement$816() {
        var test$1249, body$1250, oldInIteration$1251;
        expectKeyword$762('while');
        expect$761('(');
        test$1249 = parseExpression$798();
        expect$761(')');
        oldInIteration$1251 = state$722.inIteration;
        state$722.inIteration = true;
        body$1250 = parseStatement$829();
        state$722.inIteration = oldInIteration$1251;
        return delegate$717.createWhileStatement(test$1249, body$1250);
    }
    function parseForVariableDeclaration$817() {
        var token$1252 = lex$754(), declarations$1253 = parseVariableDeclarationList$803();
        return delegate$717.createVariableDeclaration(declarations$1253, token$1252.value);
    }
    function parseForStatement$818(opts$1254) {
        var init$1255, test$1256, update$1257, left$1258, right$1259, body$1260, operator$1261, oldInIteration$1262;
        init$1255 = test$1256 = update$1257 = null;
        expectKeyword$762('for');
        if (matchContextualKeyword$765('each')) {
            throwError$758({}, Messages$707.EachNotAllowed);
        }
        expect$761('(');
        if (match$763(';')) {
            lex$754();
        } else {
            if (matchKeyword$764('var') || matchKeyword$764('let') || matchKeyword$764('const')) {
                state$722.allowIn = false;
                init$1255 = parseForVariableDeclaration$817();
                state$722.allowIn = true;
                if (init$1255.declarations.length === 1) {
                    if (matchKeyword$764('in') || matchContextualKeyword$765('of')) {
                        operator$1261 = lookahead$720;
                        if (!((operator$1261.value === 'in' || init$1255.kind !== 'var') && init$1255.declarations[0].init)) {
                            lex$754();
                            left$1258 = init$1255;
                            right$1259 = parseExpression$798();
                            init$1255 = null;
                        }
                    }
                }
            } else {
                state$722.allowIn = false;
                init$1255 = parseExpression$798();
                state$722.allowIn = true;
                if (matchContextualKeyword$765('of')) {
                    operator$1261 = lex$754();
                    left$1258 = init$1255;
                    right$1259 = parseExpression$798();
                    init$1255 = null;
                } else if (matchKeyword$764('in')) {
                    if (!isAssignableLeftHandSide$769(init$1255)) {
                        throwError$758({}, Messages$707.InvalidLHSInForIn);
                    }
                    operator$1261 = lex$754();
                    left$1258 = init$1255;
                    right$1259 = parseExpression$798();
                    init$1255 = null;
                }
            }
            if (typeof left$1258 === 'undefined') {
                expect$761(';');
            }
        }
        if (typeof left$1258 === 'undefined') {
            if (!match$763(';')) {
                test$1256 = parseExpression$798();
            }
            expect$761(';');
            if (!match$763(')')) {
                update$1257 = parseExpression$798();
            }
        }
        expect$761(')');
        oldInIteration$1262 = state$722.inIteration;
        state$722.inIteration = true;
        if (!(opts$1254 !== undefined && opts$1254.ignoreBody)) {
            body$1260 = parseStatement$829();
        }
        state$722.inIteration = oldInIteration$1262;
        if (typeof left$1258 === 'undefined') {
            return delegate$717.createForStatement(init$1255, test$1256, update$1257, body$1260);
        }
        if (operator$1261.value === 'in') {
            return delegate$717.createForInStatement(left$1258, right$1259, body$1260);
        }
        return delegate$717.createForOfStatement(left$1258, right$1259, body$1260);
    }
    function parseContinueStatement$819() {
        var label$1263 = null, key$1264;
        expectKeyword$762('continue');
        if (lookahead$720.value.charCodeAt(0) === 59) {
            lex$754();
            if (!state$722.inIteration) {
                throwError$758({}, Messages$707.IllegalContinue);
            }
            return delegate$717.createContinueStatement(null);
        }
        if (peekLineTerminator$757()) {
            if (!state$722.inIteration) {
                throwError$758({}, Messages$707.IllegalContinue);
            }
            return delegate$717.createContinueStatement(null);
        }
        if (lookahead$720.type === Token$702.Identifier) {
            label$1263 = parseVariableIdentifier$801();
            key$1264 = '$' + label$1263.name;
            if (!Object.prototype.hasOwnProperty.call(state$722.labelSet, key$1264)) {
                throwError$758({}, Messages$707.UnknownLabel, label$1263.name);
            }
        }
        consumeSemicolon$767();
        if (label$1263 === null && !state$722.inIteration) {
            throwError$758({}, Messages$707.IllegalContinue);
        }
        return delegate$717.createContinueStatement(label$1263);
    }
    function parseBreakStatement$820() {
        var label$1265 = null, key$1266;
        expectKeyword$762('break');
        if (lookahead$720.value.charCodeAt(0) === 59) {
            lex$754();
            if (!(state$722.inIteration || state$722.inSwitch)) {
                throwError$758({}, Messages$707.IllegalBreak);
            }
            return delegate$717.createBreakStatement(null);
        }
        if (peekLineTerminator$757()) {
            if (!(state$722.inIteration || state$722.inSwitch)) {
                throwError$758({}, Messages$707.IllegalBreak);
            }
            return delegate$717.createBreakStatement(null);
        }
        if (lookahead$720.type === Token$702.Identifier) {
            label$1265 = parseVariableIdentifier$801();
            key$1266 = '$' + label$1265.name;
            if (!Object.prototype.hasOwnProperty.call(state$722.labelSet, key$1266)) {
                throwError$758({}, Messages$707.UnknownLabel, label$1265.name);
            }
        }
        consumeSemicolon$767();
        if (label$1265 === null && !(state$722.inIteration || state$722.inSwitch)) {
            throwError$758({}, Messages$707.IllegalBreak);
        }
        return delegate$717.createBreakStatement(label$1265);
    }
    function parseReturnStatement$821() {
        var argument$1267 = null;
        expectKeyword$762('return');
        if (!state$722.inFunctionBody) {
            throwErrorTolerant$759({}, Messages$707.IllegalReturn);
        }
        if (isIdentifierStart$731(String(lookahead$720.value).charCodeAt(0))) {
            argument$1267 = parseExpression$798();
            consumeSemicolon$767();
            return delegate$717.createReturnStatement(argument$1267);
        }
        if (peekLineTerminator$757()) {
            return delegate$717.createReturnStatement(null);
        }
        if (!match$763(';')) {
            if (!match$763('}') && lookahead$720.type !== Token$702.EOF) {
                argument$1267 = parseExpression$798();
            }
        }
        consumeSemicolon$767();
        return delegate$717.createReturnStatement(argument$1267);
    }
    function parseWithStatement$822() {
        var object$1268, body$1269;
        if (strict$712) {
            throwErrorTolerant$759({}, Messages$707.StrictModeWith);
        }
        expectKeyword$762('with');
        expect$761('(');
        object$1268 = parseExpression$798();
        expect$761(')');
        body$1269 = parseStatement$829();
        return delegate$717.createWithStatement(object$1268, body$1269);
    }
    function parseSwitchCase$823() {
        var test$1270, consequent$1271 = [], sourceElement$1272;
        if (matchKeyword$764('default')) {
            lex$754();
            test$1270 = null;
        } else {
            expectKeyword$762('case');
            test$1270 = parseExpression$798();
        }
        expect$761(':');
        while (streamIndex$719 < length$716) {
            if (match$763('}') || matchKeyword$764('default') || matchKeyword$764('case')) {
                break;
            }
            sourceElement$1272 = parseSourceElement$844();
            if (typeof sourceElement$1272 === 'undefined') {
                break;
            }
            consequent$1271.push(sourceElement$1272);
        }
        return delegate$717.createSwitchCase(test$1270, consequent$1271);
    }
    function parseSwitchStatement$824() {
        var discriminant$1273, cases$1274, clause$1275, oldInSwitch$1276, defaultFound$1277;
        expectKeyword$762('switch');
        expect$761('(');
        discriminant$1273 = parseExpression$798();
        expect$761(')');
        expect$761('{');
        cases$1274 = [];
        if (match$763('}')) {
            lex$754();
            return delegate$717.createSwitchStatement(discriminant$1273, cases$1274);
        }
        oldInSwitch$1276 = state$722.inSwitch;
        state$722.inSwitch = true;
        defaultFound$1277 = false;
        while (streamIndex$719 < length$716) {
            if (match$763('}')) {
                break;
            }
            clause$1275 = parseSwitchCase$823();
            if (clause$1275.test === null) {
                if (defaultFound$1277) {
                    throwError$758({}, Messages$707.MultipleDefaultsInSwitch);
                }
                defaultFound$1277 = true;
            }
            cases$1274.push(clause$1275);
        }
        state$722.inSwitch = oldInSwitch$1276;
        expect$761('}');
        return delegate$717.createSwitchStatement(discriminant$1273, cases$1274);
    }
    function parseThrowStatement$825() {
        var argument$1278;
        expectKeyword$762('throw');
        if (peekLineTerminator$757()) {
            throwError$758({}, Messages$707.NewlineAfterThrow);
        }
        argument$1278 = parseExpression$798();
        consumeSemicolon$767();
        return delegate$717.createThrowStatement(argument$1278);
    }
    function parseCatchClause$826() {
        var param$1279, body$1280;
        expectKeyword$762('catch');
        expect$761('(');
        if (match$763(')')) {
            throwUnexpected$760(lookahead$720);
        }
        param$1279 = parseExpression$798();
        if (strict$712 && param$1279.type === Syntax$705.Identifier && isRestrictedWord$735(param$1279.name)) {
            throwErrorTolerant$759({}, Messages$707.StrictCatchVariable);
        }
        expect$761(')');
        body$1280 = parseBlock$800();
        return delegate$717.createCatchClause(param$1279, body$1280);
    }
    function parseTryStatement$827() {
        var block$1281, handlers$1282 = [], finalizer$1283 = null;
        expectKeyword$762('try');
        block$1281 = parseBlock$800();
        if (matchKeyword$764('catch')) {
            handlers$1282.push(parseCatchClause$826());
        }
        if (matchKeyword$764('finally')) {
            lex$754();
            finalizer$1283 = parseBlock$800();
        }
        if (handlers$1282.length === 0 && !finalizer$1283) {
            throwError$758({}, Messages$707.NoCatchOrFinally);
        }
        return delegate$717.createTryStatement(block$1281, [], handlers$1282, finalizer$1283);
    }
    function parseDebuggerStatement$828() {
        expectKeyword$762('debugger');
        consumeSemicolon$767();
        return delegate$717.createDebuggerStatement();
    }
    function parseStatement$829() {
        var type$1284 = lookahead$720.type, expr$1285, labeledBody$1286, key$1287;
        if (type$1284 === Token$702.EOF) {
            throwUnexpected$760(lookahead$720);
        }
        if (type$1284 === Token$702.Punctuator) {
            switch (lookahead$720.value) {
            case ';':
                return parseEmptyStatement$812();
            case '{':
                return parseBlock$800();
            case '(':
                return parseExpressionStatement$813();
            default:
                break;
            }
        }
        if (type$1284 === Token$702.Keyword) {
            switch (lookahead$720.value) {
            case 'break':
                return parseBreakStatement$820();
            case 'continue':
                return parseContinueStatement$819();
            case 'debugger':
                return parseDebuggerStatement$828();
            case 'do':
                return parseDoWhileStatement$815();
            case 'for':
                return parseForStatement$818();
            case 'function':
                return parseFunctionDeclaration$835();
            case 'class':
                return parseClassDeclaration$842();
            case 'if':
                return parseIfStatement$814();
            case 'return':
                return parseReturnStatement$821();
            case 'switch':
                return parseSwitchStatement$824();
            case 'throw':
                return parseThrowStatement$825();
            case 'try':
                return parseTryStatement$827();
            case 'var':
                return parseVariableStatement$804();
            case 'while':
                return parseWhileStatement$816();
            case 'with':
                return parseWithStatement$822();
            default:
                break;
            }
        }
        expr$1285 = parseExpression$798();
        if (expr$1285.type === Syntax$705.Identifier && match$763(':')) {
            lex$754();
            key$1287 = '$' + expr$1285.name;
            if (Object.prototype.hasOwnProperty.call(state$722.labelSet, key$1287)) {
                throwError$758({}, Messages$707.Redeclaration, 'Label', expr$1285.name);
            }
            state$722.labelSet[key$1287] = true;
            labeledBody$1286 = parseStatement$829();
            delete state$722.labelSet[key$1287];
            return delegate$717.createLabeledStatement(expr$1285, labeledBody$1286);
        }
        consumeSemicolon$767();
        return delegate$717.createExpressionStatement(expr$1285);
    }
    function parseConciseBody$830() {
        if (match$763('{')) {
            return parseFunctionSourceElements$831();
        }
        return parseAssignmentExpression$797();
    }
    function parseFunctionSourceElements$831() {
        var sourceElement$1288, sourceElements$1289 = [], token$1290, directive$1291, firstRestricted$1292, oldLabelSet$1293, oldInIteration$1294, oldInSwitch$1295, oldInFunctionBody$1296, oldParenthesizedCount$1297;
        expect$761('{');
        while (streamIndex$719 < length$716) {
            if (lookahead$720.type !== Token$702.StringLiteral) {
                break;
            }
            token$1290 = lookahead$720;
            sourceElement$1288 = parseSourceElement$844();
            sourceElements$1289.push(sourceElement$1288);
            if (sourceElement$1288.expression.type !== Syntax$705.Literal) {
                break;
            }
            directive$1291 = token$1290.value;
            if (directive$1291 === 'use strict') {
                strict$712 = true;
                if (firstRestricted$1292) {
                    throwErrorTolerant$759(firstRestricted$1292, Messages$707.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1292 && token$1290.octal) {
                    firstRestricted$1292 = token$1290;
                }
            }
        }
        oldLabelSet$1293 = state$722.labelSet;
        oldInIteration$1294 = state$722.inIteration;
        oldInSwitch$1295 = state$722.inSwitch;
        oldInFunctionBody$1296 = state$722.inFunctionBody;
        oldParenthesizedCount$1297 = state$722.parenthesizedCount;
        state$722.labelSet = {};
        state$722.inIteration = false;
        state$722.inSwitch = false;
        state$722.inFunctionBody = true;
        state$722.parenthesizedCount = 0;
        while (streamIndex$719 < length$716) {
            if (match$763('}')) {
                break;
            }
            sourceElement$1288 = parseSourceElement$844();
            if (typeof sourceElement$1288 === 'undefined') {
                break;
            }
            sourceElements$1289.push(sourceElement$1288);
        }
        expect$761('}');
        state$722.labelSet = oldLabelSet$1293;
        state$722.inIteration = oldInIteration$1294;
        state$722.inSwitch = oldInSwitch$1295;
        state$722.inFunctionBody = oldInFunctionBody$1296;
        state$722.parenthesizedCount = oldParenthesizedCount$1297;
        return delegate$717.createBlockStatement(sourceElements$1289);
    }
    function validateParam$832(options$1298, param$1299, name$1300) {
        var key$1301 = '$' + name$1300;
        if (strict$712) {
            if (isRestrictedWord$735(name$1300)) {
                options$1298.stricted = param$1299;
                options$1298.message = Messages$707.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1298.paramSet, key$1301)) {
                options$1298.stricted = param$1299;
                options$1298.message = Messages$707.StrictParamDupe;
            }
        } else if (!options$1298.firstRestricted) {
            if (isRestrictedWord$735(name$1300)) {
                options$1298.firstRestricted = param$1299;
                options$1298.message = Messages$707.StrictParamName;
            } else if (isStrictModeReservedWord$734(name$1300)) {
                options$1298.firstRestricted = param$1299;
                options$1298.message = Messages$707.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1298.paramSet, key$1301)) {
                options$1298.firstRestricted = param$1299;
                options$1298.message = Messages$707.StrictParamDupe;
            }
        }
        options$1298.paramSet[key$1301] = true;
    }
    function parseParam$833(options$1302) {
        var token$1303, rest$1304, param$1305, def$1306;
        token$1303 = lookahead$720;
        if (token$1303.value === '...') {
            token$1303 = lex$754();
            rest$1304 = true;
        }
        if (match$763('[')) {
            param$1305 = parseArrayInitialiser$770();
            reinterpretAsDestructuredParameter$794(options$1302, param$1305);
        } else if (match$763('{')) {
            if (rest$1304) {
                throwError$758({}, Messages$707.ObjectPatternAsRestParameter);
            }
            param$1305 = parseObjectInitialiser$775();
            reinterpretAsDestructuredParameter$794(options$1302, param$1305);
        } else {
            param$1305 = parseVariableIdentifier$801();
            validateParam$832(options$1302, token$1303, token$1303.value);
            if (match$763('=')) {
                if (rest$1304) {
                    throwErrorTolerant$759(lookahead$720, Messages$707.DefaultRestParameter);
                }
                lex$754();
                def$1306 = parseAssignmentExpression$797();
                ++options$1302.defaultCount;
            }
        }
        if (rest$1304) {
            if (!match$763(')')) {
                throwError$758({}, Messages$707.ParameterAfterRestParameter);
            }
            options$1302.rest = param$1305;
            return false;
        }
        options$1302.params.push(param$1305);
        options$1302.defaults.push(def$1306);
        return !match$763(')');
    }
    function parseParams$834(firstRestricted$1307) {
        var options$1308;
        options$1308 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1307
        };
        expect$761('(');
        if (!match$763(')')) {
            options$1308.paramSet = {};
            while (streamIndex$719 < length$716) {
                if (!parseParam$833(options$1308)) {
                    break;
                }
                expect$761(',');
            }
        }
        expect$761(')');
        if (options$1308.defaultCount === 0) {
            options$1308.defaults = [];
        }
        return options$1308;
    }
    function parseFunctionDeclaration$835() {
        var id$1309, body$1310, token$1311, tmp$1312, firstRestricted$1313, message$1314, previousStrict$1315, previousYieldAllowed$1316, generator$1317, expression$1318;
        expectKeyword$762('function');
        generator$1317 = false;
        if (match$763('*')) {
            lex$754();
            generator$1317 = true;
        }
        token$1311 = lookahead$720;
        id$1309 = parseVariableIdentifier$801();
        if (strict$712) {
            if (isRestrictedWord$735(token$1311.value)) {
                throwErrorTolerant$759(token$1311, Messages$707.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$735(token$1311.value)) {
                firstRestricted$1313 = token$1311;
                message$1314 = Messages$707.StrictFunctionName;
            } else if (isStrictModeReservedWord$734(token$1311.value)) {
                firstRestricted$1313 = token$1311;
                message$1314 = Messages$707.StrictReservedWord;
            }
        }
        tmp$1312 = parseParams$834(firstRestricted$1313);
        firstRestricted$1313 = tmp$1312.firstRestricted;
        if (tmp$1312.message) {
            message$1314 = tmp$1312.message;
        }
        previousStrict$1315 = strict$712;
        previousYieldAllowed$1316 = state$722.yieldAllowed;
        state$722.yieldAllowed = generator$1317;
        expression$1318 = !match$763('{');
        body$1310 = parseConciseBody$830();
        if (strict$712 && firstRestricted$1313) {
            throwError$758(firstRestricted$1313, message$1314);
        }
        if (strict$712 && tmp$1312.stricted) {
            throwErrorTolerant$759(tmp$1312.stricted, message$1314);
        }
        if (state$722.yieldAllowed && !state$722.yieldFound) {
            throwErrorTolerant$759({}, Messages$707.NoYieldInGenerator);
        }
        strict$712 = previousStrict$1315;
        state$722.yieldAllowed = previousYieldAllowed$1316;
        return delegate$717.createFunctionDeclaration(id$1309, tmp$1312.params, tmp$1312.defaults, body$1310, tmp$1312.rest, generator$1317, expression$1318);
    }
    function parseFunctionExpression$836() {
        var token$1319, id$1320 = null, firstRestricted$1321, message$1322, tmp$1323, body$1324, previousStrict$1325, previousYieldAllowed$1326, generator$1327, expression$1328;
        expectKeyword$762('function');
        generator$1327 = false;
        if (match$763('*')) {
            lex$754();
            generator$1327 = true;
        }
        if (!match$763('(')) {
            token$1319 = lookahead$720;
            id$1320 = parseVariableIdentifier$801();
            if (strict$712) {
                if (isRestrictedWord$735(token$1319.value)) {
                    throwErrorTolerant$759(token$1319, Messages$707.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$735(token$1319.value)) {
                    firstRestricted$1321 = token$1319;
                    message$1322 = Messages$707.StrictFunctionName;
                } else if (isStrictModeReservedWord$734(token$1319.value)) {
                    firstRestricted$1321 = token$1319;
                    message$1322 = Messages$707.StrictReservedWord;
                }
            }
        }
        tmp$1323 = parseParams$834(firstRestricted$1321);
        firstRestricted$1321 = tmp$1323.firstRestricted;
        if (tmp$1323.message) {
            message$1322 = tmp$1323.message;
        }
        previousStrict$1325 = strict$712;
        previousYieldAllowed$1326 = state$722.yieldAllowed;
        state$722.yieldAllowed = generator$1327;
        expression$1328 = !match$763('{');
        body$1324 = parseConciseBody$830();
        if (strict$712 && firstRestricted$1321) {
            throwError$758(firstRestricted$1321, message$1322);
        }
        if (strict$712 && tmp$1323.stricted) {
            throwErrorTolerant$759(tmp$1323.stricted, message$1322);
        }
        if (state$722.yieldAllowed && !state$722.yieldFound) {
            throwErrorTolerant$759({}, Messages$707.NoYieldInGenerator);
        }
        strict$712 = previousStrict$1325;
        state$722.yieldAllowed = previousYieldAllowed$1326;
        return delegate$717.createFunctionExpression(id$1320, tmp$1323.params, tmp$1323.defaults, body$1324, tmp$1323.rest, generator$1327, expression$1328);
    }
    function parseYieldExpression$837() {
        var delegateFlag$1329, expr$1330, previousYieldAllowed$1331;
        expectKeyword$762('yield');
        if (!state$722.yieldAllowed) {
            throwErrorTolerant$759({}, Messages$707.IllegalYield);
        }
        delegateFlag$1329 = false;
        if (match$763('*')) {
            lex$754();
            delegateFlag$1329 = true;
        }
        previousYieldAllowed$1331 = state$722.yieldAllowed;
        state$722.yieldAllowed = false;
        expr$1330 = parseAssignmentExpression$797();
        state$722.yieldAllowed = previousYieldAllowed$1331;
        state$722.yieldFound = true;
        return delegate$717.createYieldExpression(expr$1330, delegateFlag$1329);
    }
    function parseMethodDefinition$838(existingPropNames$1332) {
        var token$1333, key$1334, param$1335, propType$1336, isValidDuplicateProp$1337 = false;
        if (lookahead$720.value === 'static') {
            propType$1336 = ClassPropertyType$710.static;
            lex$754();
        } else {
            propType$1336 = ClassPropertyType$710.prototype;
        }
        if (match$763('*')) {
            lex$754();
            return delegate$717.createMethodDefinition(propType$1336, '', parseObjectPropertyKey$773(), parsePropertyMethodFunction$772({ generator: true }));
        }
        token$1333 = lookahead$720;
        key$1334 = parseObjectPropertyKey$773();
        if (token$1333.value === 'get' && !match$763('(')) {
            key$1334 = parseObjectPropertyKey$773();
            if (existingPropNames$1332[propType$1336].hasOwnProperty(key$1334.name)) {
                isValidDuplicateProp$1337 = existingPropNames$1332[propType$1336][key$1334.name].get === undefined && existingPropNames$1332[propType$1336][key$1334.name].data === undefined && existingPropNames$1332[propType$1336][key$1334.name].set !== undefined;
                if (!isValidDuplicateProp$1337) {
                    throwError$758(key$1334, Messages$707.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1332[propType$1336][key$1334.name] = {};
            }
            existingPropNames$1332[propType$1336][key$1334.name].get = true;
            expect$761('(');
            expect$761(')');
            return delegate$717.createMethodDefinition(propType$1336, 'get', key$1334, parsePropertyFunction$771({ generator: false }));
        }
        if (token$1333.value === 'set' && !match$763('(')) {
            key$1334 = parseObjectPropertyKey$773();
            if (existingPropNames$1332[propType$1336].hasOwnProperty(key$1334.name)) {
                isValidDuplicateProp$1337 = existingPropNames$1332[propType$1336][key$1334.name].set === undefined && existingPropNames$1332[propType$1336][key$1334.name].data === undefined && existingPropNames$1332[propType$1336][key$1334.name].get !== undefined;
                if (!isValidDuplicateProp$1337) {
                    throwError$758(key$1334, Messages$707.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1332[propType$1336][key$1334.name] = {};
            }
            existingPropNames$1332[propType$1336][key$1334.name].set = true;
            expect$761('(');
            token$1333 = lookahead$720;
            param$1335 = [parseVariableIdentifier$801()];
            expect$761(')');
            return delegate$717.createMethodDefinition(propType$1336, 'set', key$1334, parsePropertyFunction$771({
                params: param$1335,
                generator: false,
                name: token$1333
            }));
        }
        if (existingPropNames$1332[propType$1336].hasOwnProperty(key$1334.name)) {
            throwError$758(key$1334, Messages$707.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1332[propType$1336][key$1334.name] = {};
        }
        existingPropNames$1332[propType$1336][key$1334.name].data = true;
        return delegate$717.createMethodDefinition(propType$1336, '', key$1334, parsePropertyMethodFunction$772({ generator: false }));
    }
    function parseClassElement$839(existingProps$1338) {
        if (match$763(';')) {
            lex$754();
            return;
        }
        return parseMethodDefinition$838(existingProps$1338);
    }
    function parseClassBody$840() {
        var classElement$1339, classElements$1340 = [], existingProps$1341 = {};
        existingProps$1341[ClassPropertyType$710.static] = {};
        existingProps$1341[ClassPropertyType$710.prototype] = {};
        expect$761('{');
        while (streamIndex$719 < length$716) {
            if (match$763('}')) {
                break;
            }
            classElement$1339 = parseClassElement$839(existingProps$1341);
            if (typeof classElement$1339 !== 'undefined') {
                classElements$1340.push(classElement$1339);
            }
        }
        expect$761('}');
        return delegate$717.createClassBody(classElements$1340);
    }
    function parseClassExpression$841() {
        var id$1342, previousYieldAllowed$1343, superClass$1344 = null;
        expectKeyword$762('class');
        if (!matchKeyword$764('extends') && !match$763('{')) {
            id$1342 = parseVariableIdentifier$801();
        }
        if (matchKeyword$764('extends')) {
            expectKeyword$762('extends');
            previousYieldAllowed$1343 = state$722.yieldAllowed;
            state$722.yieldAllowed = false;
            superClass$1344 = parseAssignmentExpression$797();
            state$722.yieldAllowed = previousYieldAllowed$1343;
        }
        return delegate$717.createClassExpression(id$1342, superClass$1344, parseClassBody$840());
    }
    function parseClassDeclaration$842() {
        var id$1345, previousYieldAllowed$1346, superClass$1347 = null;
        expectKeyword$762('class');
        id$1345 = parseVariableIdentifier$801();
        if (matchKeyword$764('extends')) {
            expectKeyword$762('extends');
            previousYieldAllowed$1346 = state$722.yieldAllowed;
            state$722.yieldAllowed = false;
            superClass$1347 = parseAssignmentExpression$797();
            state$722.yieldAllowed = previousYieldAllowed$1346;
        }
        return delegate$717.createClassDeclaration(id$1345, superClass$1347, parseClassBody$840());
    }
    function matchModuleDeclaration$843() {
        var id$1348;
        if (matchContextualKeyword$765('module')) {
            id$1348 = lookahead2$756();
            return id$1348.type === Token$702.StringLiteral || id$1348.type === Token$702.Identifier;
        }
        return false;
    }
    function parseSourceElement$844() {
        if (lookahead$720.type === Token$702.Keyword) {
            switch (lookahead$720.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$805(lookahead$720.value);
            case 'function':
                return parseFunctionDeclaration$835();
            case 'export':
                return parseExportDeclaration$809();
            case 'import':
                return parseImportDeclaration$810();
            default:
                return parseStatement$829();
            }
        }
        if (matchModuleDeclaration$843()) {
            throwError$758({}, Messages$707.NestedModule);
        }
        if (lookahead$720.type !== Token$702.EOF) {
            return parseStatement$829();
        }
    }
    function parseProgramElement$845() {
        if (lookahead$720.type === Token$702.Keyword) {
            switch (lookahead$720.value) {
            case 'export':
                return parseExportDeclaration$809();
            case 'import':
                return parseImportDeclaration$810();
            }
        }
        if (matchModuleDeclaration$843()) {
            return parseModuleDeclaration$806();
        }
        return parseSourceElement$844();
    }
    function parseProgramElements$846() {
        var sourceElement$1349, sourceElements$1350 = [], token$1351, directive$1352, firstRestricted$1353;
        while (streamIndex$719 < length$716) {
            token$1351 = lookahead$720;
            if (token$1351.type !== Token$702.StringLiteral) {
                break;
            }
            sourceElement$1349 = parseProgramElement$845();
            sourceElements$1350.push(sourceElement$1349);
            if (sourceElement$1349.expression.type !== Syntax$705.Literal) {
                break;
            }
            assert$724(false, 'directive isn\'t right');
            directive$1352 = source$711.slice(token$1351.range[0] + 1, token$1351.range[1] - 1);
            if (directive$1352 === 'use strict') {
                strict$712 = true;
                if (firstRestricted$1353) {
                    throwErrorTolerant$759(firstRestricted$1353, Messages$707.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1353 && token$1351.octal) {
                    firstRestricted$1353 = token$1351;
                }
            }
        }
        while (streamIndex$719 < length$716) {
            sourceElement$1349 = parseProgramElement$845();
            if (typeof sourceElement$1349 === 'undefined') {
                break;
            }
            sourceElements$1350.push(sourceElement$1349);
        }
        return sourceElements$1350;
    }
    function parseModuleElement$847() {
        return parseSourceElement$844();
    }
    function parseModuleElements$848() {
        var list$1354 = [], statement$1355;
        while (streamIndex$719 < length$716) {
            if (match$763('}')) {
                break;
            }
            statement$1355 = parseModuleElement$847();
            if (typeof statement$1355 === 'undefined') {
                break;
            }
            list$1354.push(statement$1355);
        }
        return list$1354;
    }
    function parseModuleBlock$849() {
        var block$1356;
        expect$761('{');
        block$1356 = parseModuleElements$848();
        expect$761('}');
        return delegate$717.createBlockStatement(block$1356);
    }
    function parseProgram$850() {
        var body$1357;
        strict$712 = false;
        peek$755();
        body$1357 = parseProgramElements$846();
        return delegate$717.createProgram(body$1357);
    }
    function addComment$851(type$1358, value$1359, start$1360, end$1361, loc$1362) {
        assert$724(typeof start$1360 === 'number', 'Comment must have valid position');
        if (extra$723.comments.length > 0) {
            if (extra$723.comments[extra$723.comments.length - 1].range[1] > start$1360) {
                return;
            }
        }
        extra$723.comments.push({
            type: type$1358,
            value: value$1359,
            range: [
                start$1360,
                end$1361
            ],
            loc: loc$1362
        });
    }
    function scanComment$852() {
        var comment$1363, ch$1364, loc$1365, start$1366, blockComment$1367, lineComment$1368;
        comment$1363 = '';
        blockComment$1367 = false;
        lineComment$1368 = false;
        while (index$713 < length$716) {
            ch$1364 = source$711[index$713];
            if (lineComment$1368) {
                ch$1364 = source$711[index$713++];
                if (isLineTerminator$730(ch$1364.charCodeAt(0))) {
                    loc$1365.end = {
                        line: lineNumber$714,
                        column: index$713 - lineStart$715 - 1
                    };
                    lineComment$1368 = false;
                    addComment$851('Line', comment$1363, start$1366, index$713 - 1, loc$1365);
                    if (ch$1364 === '\r' && source$711[index$713] === '\n') {
                        ++index$713;
                    }
                    ++lineNumber$714;
                    lineStart$715 = index$713;
                    comment$1363 = '';
                } else if (index$713 >= length$716) {
                    lineComment$1368 = false;
                    comment$1363 += ch$1364;
                    loc$1365.end = {
                        line: lineNumber$714,
                        column: length$716 - lineStart$715
                    };
                    addComment$851('Line', comment$1363, start$1366, length$716, loc$1365);
                } else {
                    comment$1363 += ch$1364;
                }
            } else if (blockComment$1367) {
                if (isLineTerminator$730(ch$1364.charCodeAt(0))) {
                    if (ch$1364 === '\r' && source$711[index$713 + 1] === '\n') {
                        ++index$713;
                        comment$1363 += '\r\n';
                    } else {
                        comment$1363 += ch$1364;
                    }
                    ++lineNumber$714;
                    ++index$713;
                    lineStart$715 = index$713;
                    if (index$713 >= length$716) {
                        throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1364 = source$711[index$713++];
                    if (index$713 >= length$716) {
                        throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1363 += ch$1364;
                    if (ch$1364 === '*') {
                        ch$1364 = source$711[index$713];
                        if (ch$1364 === '/') {
                            comment$1363 = comment$1363.substr(0, comment$1363.length - 1);
                            blockComment$1367 = false;
                            ++index$713;
                            loc$1365.end = {
                                line: lineNumber$714,
                                column: index$713 - lineStart$715
                            };
                            addComment$851('Block', comment$1363, start$1366, index$713, loc$1365);
                            comment$1363 = '';
                        }
                    }
                }
            } else if (ch$1364 === '/') {
                ch$1364 = source$711[index$713 + 1];
                if (ch$1364 === '/') {
                    loc$1365 = {
                        start: {
                            line: lineNumber$714,
                            column: index$713 - lineStart$715
                        }
                    };
                    start$1366 = index$713;
                    index$713 += 2;
                    lineComment$1368 = true;
                    if (index$713 >= length$716) {
                        loc$1365.end = {
                            line: lineNumber$714,
                            column: index$713 - lineStart$715
                        };
                        lineComment$1368 = false;
                        addComment$851('Line', comment$1363, start$1366, index$713, loc$1365);
                    }
                } else if (ch$1364 === '*') {
                    start$1366 = index$713;
                    index$713 += 2;
                    blockComment$1367 = true;
                    loc$1365 = {
                        start: {
                            line: lineNumber$714,
                            column: index$713 - lineStart$715 - 2
                        }
                    };
                    if (index$713 >= length$716) {
                        throwError$758({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$729(ch$1364.charCodeAt(0))) {
                ++index$713;
            } else if (isLineTerminator$730(ch$1364.charCodeAt(0))) {
                ++index$713;
                if (ch$1364 === '\r' && source$711[index$713] === '\n') {
                    ++index$713;
                }
                ++lineNumber$714;
                lineStart$715 = index$713;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$853() {
        var i$1369, entry$1370, comment$1371, comments$1372 = [];
        for (i$1369 = 0; i$1369 < extra$723.comments.length; ++i$1369) {
            entry$1370 = extra$723.comments[i$1369];
            comment$1371 = {
                type: entry$1370.type,
                value: entry$1370.value
            };
            if (extra$723.range) {
                comment$1371.range = entry$1370.range;
            }
            if (extra$723.loc) {
                comment$1371.loc = entry$1370.loc;
            }
            comments$1372.push(comment$1371);
        }
        extra$723.comments = comments$1372;
    }
    function collectToken$854() {
        var start$1373, loc$1374, token$1375, range$1376, value$1377;
        skipComment$737();
        start$1373 = index$713;
        loc$1374 = {
            start: {
                line: lineNumber$714,
                column: index$713 - lineStart$715
            }
        };
        token$1375 = extra$723.advance();
        loc$1374.end = {
            line: lineNumber$714,
            column: index$713 - lineStart$715
        };
        if (token$1375.type !== Token$702.EOF) {
            range$1376 = [
                token$1375.range[0],
                token$1375.range[1]
            ];
            value$1377 = source$711.slice(token$1375.range[0], token$1375.range[1]);
            extra$723.tokens.push({
                type: TokenName$703[token$1375.type],
                value: value$1377,
                range: range$1376,
                loc: loc$1374
            });
        }
        return token$1375;
    }
    function collectRegex$855() {
        var pos$1378, loc$1379, regex$1380, token$1381;
        skipComment$737();
        pos$1378 = index$713;
        loc$1379 = {
            start: {
                line: lineNumber$714,
                column: index$713 - lineStart$715
            }
        };
        regex$1380 = extra$723.scanRegExp();
        loc$1379.end = {
            line: lineNumber$714,
            column: index$713 - lineStart$715
        };
        if (!extra$723.tokenize) {
            if (extra$723.tokens.length > 0) {
                token$1381 = extra$723.tokens[extra$723.tokens.length - 1];
                if (token$1381.range[0] === pos$1378 && token$1381.type === 'Punctuator') {
                    if (token$1381.value === '/' || token$1381.value === '/=') {
                        extra$723.tokens.pop();
                    }
                }
            }
            extra$723.tokens.push({
                type: 'RegularExpression',
                value: regex$1380.literal,
                range: [
                    pos$1378,
                    index$713
                ],
                loc: loc$1379
            });
        }
        return regex$1380;
    }
    function filterTokenLocation$856() {
        var i$1382, entry$1383, token$1384, tokens$1385 = [];
        for (i$1382 = 0; i$1382 < extra$723.tokens.length; ++i$1382) {
            entry$1383 = extra$723.tokens[i$1382];
            token$1384 = {
                type: entry$1383.type,
                value: entry$1383.value
            };
            if (extra$723.range) {
                token$1384.range = entry$1383.range;
            }
            if (extra$723.loc) {
                token$1384.loc = entry$1383.loc;
            }
            tokens$1385.push(token$1384);
        }
        extra$723.tokens = tokens$1385;
    }
    function LocationMarker$857() {
        this.range = [
            index$713,
            index$713
        ];
        this.loc = {
            start: {
                line: lineNumber$714,
                column: index$713 - lineStart$715
            },
            end: {
                line: lineNumber$714,
                column: index$713 - lineStart$715
            }
        };
    }
    LocationMarker$857.prototype = {
        constructor: LocationMarker$857,
        end: function () {
            this.range[1] = index$713;
            this.loc.end.line = lineNumber$714;
            this.loc.end.column = index$713 - lineStart$715;
        },
        applyGroup: function (node$1386) {
            if (extra$723.range) {
                node$1386.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$723.loc) {
                node$1386.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1386 = delegate$717.postProcess(node$1386);
            }
        },
        apply: function (node$1387) {
            var nodeType$1388 = typeof node$1387;
            assert$724(nodeType$1388 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1388);
            if (extra$723.range) {
                node$1387.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$723.loc) {
                node$1387.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1387 = delegate$717.postProcess(node$1387);
            }
        }
    };
    function createLocationMarker$858() {
        return new LocationMarker$857();
    }
    function trackGroupExpression$859() {
        var marker$1389, expr$1390;
        marker$1389 = createLocationMarker$858();
        expect$761('(');
        ++state$722.parenthesizedCount;
        expr$1390 = parseExpression$798();
        expect$761(')');
        marker$1389.end();
        marker$1389.applyGroup(expr$1390);
        return expr$1390;
    }
    function trackLeftHandSideExpression$860() {
        var marker$1391, expr$1392;
        marker$1391 = createLocationMarker$858();
        expr$1392 = matchKeyword$764('new') ? parseNewExpression$785() : parsePrimaryExpression$779();
        while (match$763('.') || match$763('[') || lookahead$720.type === Token$702.Template) {
            if (match$763('[')) {
                expr$1392 = delegate$717.createMemberExpression('[', expr$1392, parseComputedMember$784());
                marker$1391.end();
                marker$1391.apply(expr$1392);
            } else if (match$763('.')) {
                expr$1392 = delegate$717.createMemberExpression('.', expr$1392, parseNonComputedMember$783());
                marker$1391.end();
                marker$1391.apply(expr$1392);
            } else {
                expr$1392 = delegate$717.createTaggedTemplateExpression(expr$1392, parseTemplateLiteral$777());
                marker$1391.end();
                marker$1391.apply(expr$1392);
            }
        }
        return expr$1392;
    }
    function trackLeftHandSideExpressionAllowCall$861() {
        var marker$1393, expr$1394, args$1395;
        marker$1393 = createLocationMarker$858();
        expr$1394 = matchKeyword$764('new') ? parseNewExpression$785() : parsePrimaryExpression$779();
        while (match$763('.') || match$763('[') || match$763('(') || lookahead$720.type === Token$702.Template) {
            if (match$763('(')) {
                args$1395 = parseArguments$780();
                expr$1394 = delegate$717.createCallExpression(expr$1394, args$1395);
                marker$1393.end();
                marker$1393.apply(expr$1394);
            } else if (match$763('[')) {
                expr$1394 = delegate$717.createMemberExpression('[', expr$1394, parseComputedMember$784());
                marker$1393.end();
                marker$1393.apply(expr$1394);
            } else if (match$763('.')) {
                expr$1394 = delegate$717.createMemberExpression('.', expr$1394, parseNonComputedMember$783());
                marker$1393.end();
                marker$1393.apply(expr$1394);
            } else {
                expr$1394 = delegate$717.createTaggedTemplateExpression(expr$1394, parseTemplateLiteral$777());
                marker$1393.end();
                marker$1393.apply(expr$1394);
            }
        }
        return expr$1394;
    }
    function filterGroup$862(node$1396) {
        var n$1397, i$1398, entry$1399;
        n$1397 = Object.prototype.toString.apply(node$1396) === '[object Array]' ? [] : {};
        for (i$1398 in node$1396) {
            if (node$1396.hasOwnProperty(i$1398) && i$1398 !== 'groupRange' && i$1398 !== 'groupLoc') {
                entry$1399 = node$1396[i$1398];
                if (entry$1399 === null || typeof entry$1399 !== 'object' || entry$1399 instanceof RegExp) {
                    n$1397[i$1398] = entry$1399;
                } else {
                    n$1397[i$1398] = filterGroup$862(entry$1399);
                }
            }
        }
        return n$1397;
    }
    function wrapTrackingFunction$863(range$1400, loc$1401) {
        return function (parseFunction$1402) {
            function isBinary$1403(node$1405) {
                return node$1405.type === Syntax$705.LogicalExpression || node$1405.type === Syntax$705.BinaryExpression;
            }
            function visit$1404(node$1406) {
                var start$1407, end$1408;
                if (isBinary$1403(node$1406.left)) {
                    visit$1404(node$1406.left);
                }
                if (isBinary$1403(node$1406.right)) {
                    visit$1404(node$1406.right);
                }
                if (range$1400) {
                    if (node$1406.left.groupRange || node$1406.right.groupRange) {
                        start$1407 = node$1406.left.groupRange ? node$1406.left.groupRange[0] : node$1406.left.range[0];
                        end$1408 = node$1406.right.groupRange ? node$1406.right.groupRange[1] : node$1406.right.range[1];
                        node$1406.range = [
                            start$1407,
                            end$1408
                        ];
                    } else if (typeof node$1406.range === 'undefined') {
                        start$1407 = node$1406.left.range[0];
                        end$1408 = node$1406.right.range[1];
                        node$1406.range = [
                            start$1407,
                            end$1408
                        ];
                    }
                }
                if (loc$1401) {
                    if (node$1406.left.groupLoc || node$1406.right.groupLoc) {
                        start$1407 = node$1406.left.groupLoc ? node$1406.left.groupLoc.start : node$1406.left.loc.start;
                        end$1408 = node$1406.right.groupLoc ? node$1406.right.groupLoc.end : node$1406.right.loc.end;
                        node$1406.loc = {
                            start: start$1407,
                            end: end$1408
                        };
                        node$1406 = delegate$717.postProcess(node$1406);
                    } else if (typeof node$1406.loc === 'undefined') {
                        node$1406.loc = {
                            start: node$1406.left.loc.start,
                            end: node$1406.right.loc.end
                        };
                        node$1406 = delegate$717.postProcess(node$1406);
                    }
                }
            }
            return function () {
                var marker$1409, node$1410, curr$1411 = lookahead$720;
                marker$1409 = createLocationMarker$858();
                node$1410 = parseFunction$1402.apply(null, arguments);
                marker$1409.end();
                if (node$1410.type !== Syntax$705.Program) {
                    if (curr$1411.leadingComments) {
                        node$1410.leadingComments = curr$1411.leadingComments;
                    }
                    if (curr$1411.trailingComments) {
                        node$1410.trailingComments = curr$1411.trailingComments;
                    }
                }
                if (range$1400 && typeof node$1410.range === 'undefined') {
                    marker$1409.apply(node$1410);
                }
                if (loc$1401 && typeof node$1410.loc === 'undefined') {
                    marker$1409.apply(node$1410);
                }
                if (isBinary$1403(node$1410)) {
                    visit$1404(node$1410);
                }
                return node$1410;
            };
        };
    }
    function patch$864() {
        var wrapTracking$1412;
        if (extra$723.comments) {
            extra$723.skipComment = skipComment$737;
            skipComment$737 = scanComment$852;
        }
        if (extra$723.range || extra$723.loc) {
            extra$723.parseGroupExpression = parseGroupExpression$778;
            extra$723.parseLeftHandSideExpression = parseLeftHandSideExpression$787;
            extra$723.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$786;
            parseGroupExpression$778 = trackGroupExpression$859;
            parseLeftHandSideExpression$787 = trackLeftHandSideExpression$860;
            parseLeftHandSideExpressionAllowCall$786 = trackLeftHandSideExpressionAllowCall$861;
            wrapTracking$1412 = wrapTrackingFunction$863(extra$723.range, extra$723.loc);
            extra$723.parseArrayInitialiser = parseArrayInitialiser$770;
            extra$723.parseAssignmentExpression = parseAssignmentExpression$797;
            extra$723.parseBinaryExpression = parseBinaryExpression$791;
            extra$723.parseBlock = parseBlock$800;
            extra$723.parseFunctionSourceElements = parseFunctionSourceElements$831;
            extra$723.parseCatchClause = parseCatchClause$826;
            extra$723.parseComputedMember = parseComputedMember$784;
            extra$723.parseConditionalExpression = parseConditionalExpression$792;
            extra$723.parseConstLetDeclaration = parseConstLetDeclaration$805;
            extra$723.parseExportBatchSpecifier = parseExportBatchSpecifier$807;
            extra$723.parseExportDeclaration = parseExportDeclaration$809;
            extra$723.parseExportSpecifier = parseExportSpecifier$808;
            extra$723.parseExpression = parseExpression$798;
            extra$723.parseForVariableDeclaration = parseForVariableDeclaration$817;
            extra$723.parseFunctionDeclaration = parseFunctionDeclaration$835;
            extra$723.parseFunctionExpression = parseFunctionExpression$836;
            extra$723.parseParams = parseParams$834;
            extra$723.parseImportDeclaration = parseImportDeclaration$810;
            extra$723.parseImportSpecifier = parseImportSpecifier$811;
            extra$723.parseModuleDeclaration = parseModuleDeclaration$806;
            extra$723.parseModuleBlock = parseModuleBlock$849;
            extra$723.parseNewExpression = parseNewExpression$785;
            extra$723.parseNonComputedProperty = parseNonComputedProperty$782;
            extra$723.parseObjectInitialiser = parseObjectInitialiser$775;
            extra$723.parseObjectProperty = parseObjectProperty$774;
            extra$723.parseObjectPropertyKey = parseObjectPropertyKey$773;
            extra$723.parsePostfixExpression = parsePostfixExpression$788;
            extra$723.parsePrimaryExpression = parsePrimaryExpression$779;
            extra$723.parseProgram = parseProgram$850;
            extra$723.parsePropertyFunction = parsePropertyFunction$771;
            extra$723.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$781;
            extra$723.parseTemplateElement = parseTemplateElement$776;
            extra$723.parseTemplateLiteral = parseTemplateLiteral$777;
            extra$723.parseStatement = parseStatement$829;
            extra$723.parseSwitchCase = parseSwitchCase$823;
            extra$723.parseUnaryExpression = parseUnaryExpression$789;
            extra$723.parseVariableDeclaration = parseVariableDeclaration$802;
            extra$723.parseVariableIdentifier = parseVariableIdentifier$801;
            extra$723.parseMethodDefinition = parseMethodDefinition$838;
            extra$723.parseClassDeclaration = parseClassDeclaration$842;
            extra$723.parseClassExpression = parseClassExpression$841;
            extra$723.parseClassBody = parseClassBody$840;
            parseArrayInitialiser$770 = wrapTracking$1412(extra$723.parseArrayInitialiser);
            parseAssignmentExpression$797 = wrapTracking$1412(extra$723.parseAssignmentExpression);
            parseBinaryExpression$791 = wrapTracking$1412(extra$723.parseBinaryExpression);
            parseBlock$800 = wrapTracking$1412(extra$723.parseBlock);
            parseFunctionSourceElements$831 = wrapTracking$1412(extra$723.parseFunctionSourceElements);
            parseCatchClause$826 = wrapTracking$1412(extra$723.parseCatchClause);
            parseComputedMember$784 = wrapTracking$1412(extra$723.parseComputedMember);
            parseConditionalExpression$792 = wrapTracking$1412(extra$723.parseConditionalExpression);
            parseConstLetDeclaration$805 = wrapTracking$1412(extra$723.parseConstLetDeclaration);
            parseExportBatchSpecifier$807 = wrapTracking$1412(parseExportBatchSpecifier$807);
            parseExportDeclaration$809 = wrapTracking$1412(parseExportDeclaration$809);
            parseExportSpecifier$808 = wrapTracking$1412(parseExportSpecifier$808);
            parseExpression$798 = wrapTracking$1412(extra$723.parseExpression);
            parseForVariableDeclaration$817 = wrapTracking$1412(extra$723.parseForVariableDeclaration);
            parseFunctionDeclaration$835 = wrapTracking$1412(extra$723.parseFunctionDeclaration);
            parseFunctionExpression$836 = wrapTracking$1412(extra$723.parseFunctionExpression);
            parseParams$834 = wrapTracking$1412(extra$723.parseParams);
            parseImportDeclaration$810 = wrapTracking$1412(extra$723.parseImportDeclaration);
            parseImportSpecifier$811 = wrapTracking$1412(extra$723.parseImportSpecifier);
            parseModuleDeclaration$806 = wrapTracking$1412(extra$723.parseModuleDeclaration);
            parseModuleBlock$849 = wrapTracking$1412(extra$723.parseModuleBlock);
            parseLeftHandSideExpression$787 = wrapTracking$1412(parseLeftHandSideExpression$787);
            parseNewExpression$785 = wrapTracking$1412(extra$723.parseNewExpression);
            parseNonComputedProperty$782 = wrapTracking$1412(extra$723.parseNonComputedProperty);
            parseObjectInitialiser$775 = wrapTracking$1412(extra$723.parseObjectInitialiser);
            parseObjectProperty$774 = wrapTracking$1412(extra$723.parseObjectProperty);
            parseObjectPropertyKey$773 = wrapTracking$1412(extra$723.parseObjectPropertyKey);
            parsePostfixExpression$788 = wrapTracking$1412(extra$723.parsePostfixExpression);
            parsePrimaryExpression$779 = wrapTracking$1412(extra$723.parsePrimaryExpression);
            parseProgram$850 = wrapTracking$1412(extra$723.parseProgram);
            parsePropertyFunction$771 = wrapTracking$1412(extra$723.parsePropertyFunction);
            parseTemplateElement$776 = wrapTracking$1412(extra$723.parseTemplateElement);
            parseTemplateLiteral$777 = wrapTracking$1412(extra$723.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$781 = wrapTracking$1412(extra$723.parseSpreadOrAssignmentExpression);
            parseStatement$829 = wrapTracking$1412(extra$723.parseStatement);
            parseSwitchCase$823 = wrapTracking$1412(extra$723.parseSwitchCase);
            parseUnaryExpression$789 = wrapTracking$1412(extra$723.parseUnaryExpression);
            parseVariableDeclaration$802 = wrapTracking$1412(extra$723.parseVariableDeclaration);
            parseVariableIdentifier$801 = wrapTracking$1412(extra$723.parseVariableIdentifier);
            parseMethodDefinition$838 = wrapTracking$1412(extra$723.parseMethodDefinition);
            parseClassDeclaration$842 = wrapTracking$1412(extra$723.parseClassDeclaration);
            parseClassExpression$841 = wrapTracking$1412(extra$723.parseClassExpression);
            parseClassBody$840 = wrapTracking$1412(extra$723.parseClassBody);
        }
        if (typeof extra$723.tokens !== 'undefined') {
            extra$723.advance = advance$753;
            extra$723.scanRegExp = scanRegExp$750;
            advance$753 = collectToken$854;
            scanRegExp$750 = collectRegex$855;
        }
    }
    function unpatch$865() {
        if (typeof extra$723.skipComment === 'function') {
            skipComment$737 = extra$723.skipComment;
        }
        if (extra$723.range || extra$723.loc) {
            parseArrayInitialiser$770 = extra$723.parseArrayInitialiser;
            parseAssignmentExpression$797 = extra$723.parseAssignmentExpression;
            parseBinaryExpression$791 = extra$723.parseBinaryExpression;
            parseBlock$800 = extra$723.parseBlock;
            parseFunctionSourceElements$831 = extra$723.parseFunctionSourceElements;
            parseCatchClause$826 = extra$723.parseCatchClause;
            parseComputedMember$784 = extra$723.parseComputedMember;
            parseConditionalExpression$792 = extra$723.parseConditionalExpression;
            parseConstLetDeclaration$805 = extra$723.parseConstLetDeclaration;
            parseExportBatchSpecifier$807 = extra$723.parseExportBatchSpecifier;
            parseExportDeclaration$809 = extra$723.parseExportDeclaration;
            parseExportSpecifier$808 = extra$723.parseExportSpecifier;
            parseExpression$798 = extra$723.parseExpression;
            parseForVariableDeclaration$817 = extra$723.parseForVariableDeclaration;
            parseFunctionDeclaration$835 = extra$723.parseFunctionDeclaration;
            parseFunctionExpression$836 = extra$723.parseFunctionExpression;
            parseImportDeclaration$810 = extra$723.parseImportDeclaration;
            parseImportSpecifier$811 = extra$723.parseImportSpecifier;
            parseGroupExpression$778 = extra$723.parseGroupExpression;
            parseLeftHandSideExpression$787 = extra$723.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$786 = extra$723.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$806 = extra$723.parseModuleDeclaration;
            parseModuleBlock$849 = extra$723.parseModuleBlock;
            parseNewExpression$785 = extra$723.parseNewExpression;
            parseNonComputedProperty$782 = extra$723.parseNonComputedProperty;
            parseObjectInitialiser$775 = extra$723.parseObjectInitialiser;
            parseObjectProperty$774 = extra$723.parseObjectProperty;
            parseObjectPropertyKey$773 = extra$723.parseObjectPropertyKey;
            parsePostfixExpression$788 = extra$723.parsePostfixExpression;
            parsePrimaryExpression$779 = extra$723.parsePrimaryExpression;
            parseProgram$850 = extra$723.parseProgram;
            parsePropertyFunction$771 = extra$723.parsePropertyFunction;
            parseTemplateElement$776 = extra$723.parseTemplateElement;
            parseTemplateLiteral$777 = extra$723.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$781 = extra$723.parseSpreadOrAssignmentExpression;
            parseStatement$829 = extra$723.parseStatement;
            parseSwitchCase$823 = extra$723.parseSwitchCase;
            parseUnaryExpression$789 = extra$723.parseUnaryExpression;
            parseVariableDeclaration$802 = extra$723.parseVariableDeclaration;
            parseVariableIdentifier$801 = extra$723.parseVariableIdentifier;
            parseMethodDefinition$838 = extra$723.parseMethodDefinition;
            parseClassDeclaration$842 = extra$723.parseClassDeclaration;
            parseClassExpression$841 = extra$723.parseClassExpression;
            parseClassBody$840 = extra$723.parseClassBody;
        }
        if (typeof extra$723.scanRegExp === 'function') {
            advance$753 = extra$723.advance;
            scanRegExp$750 = extra$723.scanRegExp;
        }
    }
    function extend$866(object$1413, properties$1414) {
        var entry$1415, result$1416 = {};
        for (entry$1415 in object$1413) {
            if (object$1413.hasOwnProperty(entry$1415)) {
                result$1416[entry$1415] = object$1413[entry$1415];
            }
        }
        for (entry$1415 in properties$1414) {
            if (properties$1414.hasOwnProperty(entry$1415)) {
                result$1416[entry$1415] = properties$1414[entry$1415];
            }
        }
        return result$1416;
    }
    function tokenize$867(code$1417, options$1418) {
        var toString$1419, token$1420, tokens$1421;
        toString$1419 = String;
        if (typeof code$1417 !== 'string' && !(code$1417 instanceof String)) {
            code$1417 = toString$1419(code$1417);
        }
        delegate$717 = SyntaxTreeDelegate$709;
        source$711 = code$1417;
        index$713 = 0;
        lineNumber$714 = source$711.length > 0 ? 1 : 0;
        lineStart$715 = 0;
        length$716 = source$711.length;
        lookahead$720 = null;
        state$722 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$723 = {};
        options$1418 = options$1418 || {};
        options$1418.tokens = true;
        extra$723.tokens = [];
        extra$723.tokenize = true;
        extra$723.openParenToken = -1;
        extra$723.openCurlyToken = -1;
        extra$723.range = typeof options$1418.range === 'boolean' && options$1418.range;
        extra$723.loc = typeof options$1418.loc === 'boolean' && options$1418.loc;
        if (typeof options$1418.comment === 'boolean' && options$1418.comment) {
            extra$723.comments = [];
        }
        if (typeof options$1418.tolerant === 'boolean' && options$1418.tolerant) {
            extra$723.errors = [];
        }
        if (length$716 > 0) {
            if (typeof source$711[0] === 'undefined') {
                if (code$1417 instanceof String) {
                    source$711 = code$1417.valueOf();
                }
            }
        }
        patch$864();
        try {
            peek$755();
            if (lookahead$720.type === Token$702.EOF) {
                return extra$723.tokens;
            }
            token$1420 = lex$754();
            while (lookahead$720.type !== Token$702.EOF) {
                try {
                    token$1420 = lex$754();
                } catch (lexError$1422) {
                    token$1420 = lookahead$720;
                    if (extra$723.errors) {
                        extra$723.errors.push(lexError$1422);
                        break;
                    } else {
                        throw lexError$1422;
                    }
                }
            }
            filterTokenLocation$856();
            tokens$1421 = extra$723.tokens;
            if (typeof extra$723.comments !== 'undefined') {
                filterCommentLocation$853();
                tokens$1421.comments = extra$723.comments;
            }
            if (typeof extra$723.errors !== 'undefined') {
                tokens$1421.errors = extra$723.errors;
            }
        } catch (e$1423) {
            throw e$1423;
        } finally {
            unpatch$865();
            extra$723 = {};
        }
        return tokens$1421;
    }
    function blockAllowed$868(toks$1424, start$1425, inExprDelim$1426, parentIsBlock$1427) {
        var assignOps$1428 = [
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
        var binaryOps$1429 = [
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
        var unaryOps$1430 = [
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
        function back$1431(n$1432) {
            var idx$1433 = toks$1424.length - n$1432 > 0 ? toks$1424.length - n$1432 : 0;
            return toks$1424[idx$1433];
        }
        if (inExprDelim$1426 && toks$1424.length - (start$1425 + 2) <= 0) {
            return false;
        } else if (back$1431(start$1425 + 2).value === ':' && parentIsBlock$1427) {
            return true;
        } else if (isIn$725(back$1431(start$1425 + 2).value, unaryOps$1430.concat(binaryOps$1429).concat(assignOps$1428))) {
            return false;
        } else if (back$1431(start$1425 + 2).value === 'return') {
            var currLineNumber$1434 = typeof back$1431(start$1425 + 1).startLineNumber !== 'undefined' ? back$1431(start$1425 + 1).startLineNumber : back$1431(start$1425 + 1).lineNumber;
            if (back$1431(start$1425 + 2).lineNumber !== currLineNumber$1434) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$725(back$1431(start$1425 + 2).value, [
                'void',
                'typeof',
                'in',
                'case',
                'delete'
            ])) {
            return false;
        } else {
            return true;
        }
    }
    function readToken$869(toks$1435, inExprDelim$1436, parentIsBlock$1437) {
        var delimiters$1438 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1439 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1440 = toks$1435.length - 1;
        var comments$1441, commentsLen$1442 = extra$723.comments.length;
        function back$1443(n$1447) {
            var idx$1448 = toks$1435.length - n$1447 > 0 ? toks$1435.length - n$1447 : 0;
            return toks$1435[idx$1448];
        }
        function attachComments$1444(token$1449) {
            if (comments$1441) {
                token$1449.leadingComments = comments$1441;
            }
            return token$1449;
        }
        function _advance$1445() {
            return attachComments$1444(advance$753());
        }
        function _scanRegExp$1446() {
            return attachComments$1444(scanRegExp$750());
        }
        skipComment$737();
        if (extra$723.comments.length > commentsLen$1442) {
            comments$1441 = extra$723.comments.slice(commentsLen$1442);
        }
        if (isIn$725(source$711[index$713], delimiters$1438)) {
            return attachComments$1444(readDelim$870(toks$1435, inExprDelim$1436, parentIsBlock$1437));
        }
        if (source$711[index$713] === '/') {
            var prev$1450 = back$1443(1);
            if (prev$1450) {
                if (prev$1450.value === '()') {
                    if (isIn$725(back$1443(2).value, parenIdents$1439)) {
                        return _scanRegExp$1446();
                    }
                    return _advance$1445();
                }
                if (prev$1450.value === '{}') {
                    if (blockAllowed$868(toks$1435, 0, inExprDelim$1436, parentIsBlock$1437)) {
                        if (back$1443(2).value === '()') {
                            if (back$1443(4).value === 'function') {
                                if (!blockAllowed$868(toks$1435, 3, inExprDelim$1436, parentIsBlock$1437)) {
                                    return _advance$1445();
                                }
                                if (toks$1435.length - 5 <= 0 && inExprDelim$1436) {
                                    return _advance$1445();
                                }
                            }
                            if (back$1443(3).value === 'function') {
                                if (!blockAllowed$868(toks$1435, 2, inExprDelim$1436, parentIsBlock$1437)) {
                                    return _advance$1445();
                                }
                                if (toks$1435.length - 4 <= 0 && inExprDelim$1436) {
                                    return _advance$1445();
                                }
                            }
                        }
                        return _scanRegExp$1446();
                    } else {
                        return _advance$1445();
                    }
                }
                if (prev$1450.type === Token$702.Punctuator) {
                    return _scanRegExp$1446();
                }
                if (isKeyword$736(prev$1450.value)) {
                    return _scanRegExp$1446();
                }
                return _advance$1445();
            }
            return _scanRegExp$1446();
        }
        return _advance$1445();
    }
    function readDelim$870(toks$1451, inExprDelim$1452, parentIsBlock$1453) {
        var startDelim$1454 = advance$753(), matchDelim$1455 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1456 = [];
        var delimiters$1457 = [
                '(',
                '{',
                '['
            ];
        assert$724(delimiters$1457.indexOf(startDelim$1454.value) !== -1, 'Need to begin at the delimiter');
        var token$1458 = startDelim$1454;
        var startLineNumber$1459 = token$1458.lineNumber;
        var startLineStart$1460 = token$1458.lineStart;
        var startRange$1461 = token$1458.range;
        var delimToken$1462 = {};
        delimToken$1462.type = Token$702.Delimiter;
        delimToken$1462.value = startDelim$1454.value + matchDelim$1455[startDelim$1454.value];
        delimToken$1462.startLineNumber = startLineNumber$1459;
        delimToken$1462.startLineStart = startLineStart$1460;
        delimToken$1462.startRange = startRange$1461;
        var delimIsBlock$1463 = false;
        if (startDelim$1454.value === '{') {
            delimIsBlock$1463 = blockAllowed$868(toks$1451.concat(delimToken$1462), 0, inExprDelim$1452, parentIsBlock$1453);
        }
        while (index$713 <= length$716) {
            token$1458 = readToken$869(inner$1456, startDelim$1454.value === '(' || startDelim$1454.value === '[', delimIsBlock$1463);
            if (token$1458.type === Token$702.Punctuator && token$1458.value === matchDelim$1455[startDelim$1454.value]) {
                if (token$1458.leadingComments) {
                    delimToken$1462.trailingComments = token$1458.leadingComments;
                }
                break;
            } else if (token$1458.type === Token$702.EOF) {
                throwError$758({}, Messages$707.UnexpectedEOS);
            } else {
                inner$1456.push(token$1458);
            }
        }
        if (index$713 >= length$716 && matchDelim$1455[startDelim$1454.value] !== source$711[length$716 - 1]) {
            throwError$758({}, Messages$707.UnexpectedEOS);
        }
        var endLineNumber$1464 = token$1458.lineNumber;
        var endLineStart$1465 = token$1458.lineStart;
        var endRange$1466 = token$1458.range;
        delimToken$1462.inner = inner$1456;
        delimToken$1462.endLineNumber = endLineNumber$1464;
        delimToken$1462.endLineStart = endLineStart$1465;
        delimToken$1462.endRange = endRange$1466;
        return delimToken$1462;
    }
    ;
    function read$871(code$1467) {
        var token$1468, tokenTree$1469 = [];
        extra$723 = {};
        extra$723.comments = [];
        patch$864();
        source$711 = code$1467;
        index$713 = 0;
        lineNumber$714 = source$711.length > 0 ? 1 : 0;
        lineStart$715 = 0;
        length$716 = source$711.length;
        state$722 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$713 < length$716) {
            tokenTree$1469.push(readToken$869(tokenTree$1469, false, false));
        }
        var last$1470 = tokenTree$1469[tokenTree$1469.length - 1];
        if (last$1470 && last$1470.type !== Token$702.EOF) {
            tokenTree$1469.push({
                type: Token$702.EOF,
                value: '',
                lineNumber: last$1470.lineNumber,
                lineStart: last$1470.lineStart,
                range: [
                    index$713,
                    index$713
                ]
            });
        }
        return expander$701.tokensToSyntax(tokenTree$1469);
    }
    function parse$872(code$1471, options$1472) {
        var program$1473, toString$1474;
        extra$723 = {};
        if (Array.isArray(code$1471)) {
            tokenStream$718 = code$1471;
            length$716 = tokenStream$718.length;
            lineNumber$714 = tokenStream$718.length > 0 ? 1 : 0;
            source$711 = undefined;
        } else {
            toString$1474 = String;
            if (typeof code$1471 !== 'string' && !(code$1471 instanceof String)) {
                code$1471 = toString$1474(code$1471);
            }
            source$711 = code$1471;
            length$716 = source$711.length;
            lineNumber$714 = source$711.length > 0 ? 1 : 0;
        }
        delegate$717 = SyntaxTreeDelegate$709;
        streamIndex$719 = -1;
        index$713 = 0;
        lineStart$715 = 0;
        lookahead$720 = null;
        state$722 = {
            allowKeyword: false,
            allowIn: true,
            labelSet: {},
            parenthesizedCount: 0,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            yieldAllowed: false,
            yieldFound: false
        };
        if (typeof options$1472 !== 'undefined') {
            extra$723.range = typeof options$1472.range === 'boolean' && options$1472.range;
            extra$723.loc = typeof options$1472.loc === 'boolean' && options$1472.loc;
            if (extra$723.loc && options$1472.source !== null && options$1472.source !== undefined) {
                delegate$717 = extend$866(delegate$717, {
                    'postProcess': function (node$1475) {
                        node$1475.loc.source = toString$1474(options$1472.source);
                        return node$1475;
                    }
                });
            }
            if (typeof options$1472.tokens === 'boolean' && options$1472.tokens) {
                extra$723.tokens = [];
            }
            if (typeof options$1472.comment === 'boolean' && options$1472.comment) {
                extra$723.comments = [];
            }
            if (typeof options$1472.tolerant === 'boolean' && options$1472.tolerant) {
                extra$723.errors = [];
            }
        }
        if (length$716 > 0) {
            if (source$711 && typeof source$711[0] === 'undefined') {
                if (code$1471 instanceof String) {
                    source$711 = code$1471.valueOf();
                }
            }
        }
        extra$723 = {
            range: true,
            loc: true
        };
        patch$864();
        try {
            program$1473 = parseProgram$850();
            if (typeof extra$723.comments !== 'undefined') {
                filterCommentLocation$853();
                program$1473.comments = extra$723.comments;
            }
            if (typeof extra$723.tokens !== 'undefined') {
                filterTokenLocation$856();
                program$1473.tokens = extra$723.tokens;
            }
            if (typeof extra$723.errors !== 'undefined') {
                program$1473.errors = extra$723.errors;
            }
            if (extra$723.range || extra$723.loc) {
                program$1473.body = filterGroup$862(program$1473.body);
            }
        } catch (e$1476) {
            throw e$1476;
        } finally {
            unpatch$865();
            extra$723 = {};
        }
        return program$1473;
    }
    exports$700.tokenize = tokenize$867;
    exports$700.read = read$871;
    exports$700.Token = Token$702;
    exports$700.assert = assert$724;
    exports$700.parse = parse$872;
    exports$700.Syntax = function () {
        var name$1477, types$1478 = {};
        if (typeof Object.create === 'function') {
            types$1478 = Object.create(null);
        }
        for (name$1477 in Syntax$705) {
            if (Syntax$705.hasOwnProperty(name$1477)) {
                types$1478[name$1477] = Syntax$705[name$1477];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1478);
        }
        return types$1478;
    }();
}));