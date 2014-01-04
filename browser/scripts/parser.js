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
/*global esprima:true, define:true, exports:true, window: true,
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
(function (root$1074, factory$1075) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$1075);
    } else if (typeof exports !== 'undefined') {
        factory$1075(exports, require('./expander'));
    } else {
        factory$1075(root$1074.esprima = {});
    }
}(this, function (exports$1076, expander$1077) {
    'use strict';
    var Token$1078, TokenName$1079, FnExprTokens$1080, Syntax$1081, PropertyKind$1082, Messages$1083, Regex$1084, SyntaxTreeDelegate$1085, ClassPropertyType$1086, source$1087, strict$1088, index$1089, lineNumber$1090, lineStart$1091, sm_lineNumber$1092, sm_lineStart$1093, sm_range$1094, sm_index$1095, length$1096, delegate$1097, tokenStream$1098, streamIndex$1099, lookahead$1100, lookaheadIndex$1101, state$1102, extra$1103;
    Token$1078 = {
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
    TokenName$1079 = {};
    TokenName$1079[Token$1078.BooleanLiteral] = 'Boolean';
    TokenName$1079[Token$1078.EOF] = '<end>';
    TokenName$1079[Token$1078.Identifier] = 'Identifier';
    TokenName$1079[Token$1078.Keyword] = 'Keyword';
    TokenName$1079[Token$1078.NullLiteral] = 'Null';
    TokenName$1079[Token$1078.NumericLiteral] = 'Numeric';
    TokenName$1079[Token$1078.Punctuator] = 'Punctuator';
    TokenName$1079[Token$1078.StringLiteral] = 'String';
    TokenName$1079[Token$1078.RegularExpression] = 'RegularExpression';
    TokenName$1079[Token$1078.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$1080 = [
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
    Syntax$1081 = {
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
    PropertyKind$1082 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$1086 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$1083 = {
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
    // See also tools/generate-unicode-regex.py.
    Regex$1084 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$1104(condition$1253, message$1254) {
        if (!condition$1253) {
            throw new Error('ASSERT: ' + message$1254);
        }
    }
    function isIn$1105(el$1255, list$1256) {
        return list$1256.indexOf(el$1255) !== -1;
    }
    function isDecimalDigit$1106(ch$1257) {
        return ch$1257 >= 48 && ch$1257 <= 57;
    }    // 0..9
    function isHexDigit$1107(ch$1258) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1258) >= 0;
    }
    function isOctalDigit$1108(ch$1259) {
        return '01234567'.indexOf(ch$1259) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$1109(ch$1260) {
        return ch$1260 === 32 || ch$1260 === 9 || ch$1260 === 11 || ch$1260 === 12 || ch$1260 === 160 || ch$1260 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1260)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$1110(ch$1261) {
        return ch$1261 === 10 || ch$1261 === 13 || ch$1261 === 8232 || ch$1261 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$1111(ch$1262) {
        return ch$1262 === 36 || ch$1262 === 95 || ch$1262 >= 65 && ch$1262 <= 90 || ch$1262 >= 97 && ch$1262 <= 122 || ch$1262 === 92 || ch$1262 >= 128 && Regex$1084.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1262));
    }
    function isIdentifierPart$1112(ch$1263) {
        return ch$1263 === 36 || ch$1263 === 95 || ch$1263 >= 65 && ch$1263 <= 90 || ch$1263 >= 97 && ch$1263 <= 122 || ch$1263 >= 48 && ch$1263 <= 57 || ch$1263 === 92 || ch$1263 >= 128 && Regex$1084.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1263));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$1113(id$1264) {
        switch (id$1264) {
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
    function isStrictModeReservedWord$1114(id$1265) {
        switch (id$1265) {
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
    function isRestrictedWord$1115(id$1266) {
        return id$1266 === 'eval' || id$1266 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$1116(id$1267) {
        if (strict$1088 && isStrictModeReservedWord$1114(id$1267)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1267.length) {
        case 2:
            return id$1267 === 'if' || id$1267 === 'in' || id$1267 === 'do';
        case 3:
            return id$1267 === 'var' || id$1267 === 'for' || id$1267 === 'new' || id$1267 === 'try' || id$1267 === 'let';
        case 4:
            return id$1267 === 'this' || id$1267 === 'else' || id$1267 === 'case' || id$1267 === 'void' || id$1267 === 'with' || id$1267 === 'enum';
        case 5:
            return id$1267 === 'while' || id$1267 === 'break' || id$1267 === 'catch' || id$1267 === 'throw' || id$1267 === 'const' || id$1267 === 'yield' || id$1267 === 'class' || id$1267 === 'super';
        case 6:
            return id$1267 === 'return' || id$1267 === 'typeof' || id$1267 === 'delete' || id$1267 === 'switch' || id$1267 === 'export' || id$1267 === 'import';
        case 7:
            return id$1267 === 'default' || id$1267 === 'finally' || id$1267 === 'extends';
        case 8:
            return id$1267 === 'function' || id$1267 === 'continue' || id$1267 === 'debugger';
        case 10:
            return id$1267 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$1117() {
        var ch$1268, blockComment$1269, lineComment$1270;
        blockComment$1269 = false;
        lineComment$1270 = false;
        while (index$1089 < length$1096) {
            ch$1268 = source$1087.charCodeAt(index$1089);
            if (lineComment$1270) {
                ++index$1089;
                if (isLineTerminator$1110(ch$1268)) {
                    lineComment$1270 = false;
                    if (ch$1268 === 13 && source$1087.charCodeAt(index$1089) === 10) {
                        ++index$1089;
                    }
                    ++lineNumber$1090;
                    lineStart$1091 = index$1089;
                }
            } else if (blockComment$1269) {
                if (isLineTerminator$1110(ch$1268)) {
                    if (ch$1268 === 13 && source$1087.charCodeAt(index$1089 + 1) === 10) {
                        ++index$1089;
                    }
                    ++lineNumber$1090;
                    ++index$1089;
                    lineStart$1091 = index$1089;
                    if (index$1089 >= length$1096) {
                        throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1268 = source$1087.charCodeAt(index$1089++);
                    if (index$1089 >= length$1096) {
                        throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1268 === 42) {
                        ch$1268 = source$1087.charCodeAt(index$1089);
                        if (ch$1268 === 47) {
                            ++index$1089;
                            blockComment$1269 = false;
                        }
                    }
                }
            } else if (ch$1268 === 47) {
                ch$1268 = source$1087.charCodeAt(index$1089 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1268 === 47) {
                    index$1089 += 2;
                    lineComment$1270 = true;
                } else if (ch$1268 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$1089 += 2;
                    blockComment$1269 = true;
                    if (index$1089 >= length$1096) {
                        throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1109(ch$1268)) {
                ++index$1089;
            } else if (isLineTerminator$1110(ch$1268)) {
                ++index$1089;
                if (ch$1268 === 13 && source$1087.charCodeAt(index$1089) === 10) {
                    ++index$1089;
                }
                ++lineNumber$1090;
                lineStart$1091 = index$1089;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$1118(prefix$1271) {
        var i$1272, len$1273, ch$1274, code$1275 = 0;
        len$1273 = prefix$1271 === 'u' ? 4 : 2;
        for (i$1272 = 0; i$1272 < len$1273; ++i$1272) {
            if (index$1089 < length$1096 && isHexDigit$1107(source$1087[index$1089])) {
                ch$1274 = source$1087[index$1089++];
                code$1275 = code$1275 * 16 + '0123456789abcdef'.indexOf(ch$1274.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1275);
    }
    function scanUnicodeCodePointEscape$1119() {
        var ch$1276, code$1277, cu1$1278, cu2$1279;
        ch$1276 = source$1087[index$1089];
        code$1277 = 0;
        // At least, one hex digit is required.
        if (ch$1276 === '}') {
            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
        }
        while (index$1089 < length$1096) {
            ch$1276 = source$1087[index$1089++];
            if (!isHexDigit$1107(ch$1276)) {
                break;
            }
            code$1277 = code$1277 * 16 + '0123456789abcdef'.indexOf(ch$1276.toLowerCase());
        }
        if (code$1277 > 1114111 || ch$1276 !== '}') {
            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1277 <= 65535) {
            return String.fromCharCode(code$1277);
        }
        cu1$1278 = (code$1277 - 65536 >> 10) + 55296;
        cu2$1279 = (code$1277 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1278, cu2$1279);
    }
    function getEscapedIdentifier$1120() {
        var ch$1280, id$1281;
        ch$1280 = source$1087.charCodeAt(index$1089++);
        id$1281 = String.fromCharCode(ch$1280);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1280 === 92) {
            if (source$1087.charCodeAt(index$1089) !== 117) {
                throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
            }
            ++index$1089;
            ch$1280 = scanHexEscape$1118('u');
            if (!ch$1280 || ch$1280 === '\\' || !isIdentifierStart$1111(ch$1280.charCodeAt(0))) {
                throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
            }
            id$1281 = ch$1280;
        }
        while (index$1089 < length$1096) {
            ch$1280 = source$1087.charCodeAt(index$1089);
            if (!isIdentifierPart$1112(ch$1280)) {
                break;
            }
            ++index$1089;
            id$1281 += String.fromCharCode(ch$1280);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1280 === 92) {
                id$1281 = id$1281.substr(0, id$1281.length - 1);
                if (source$1087.charCodeAt(index$1089) !== 117) {
                    throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                }
                ++index$1089;
                ch$1280 = scanHexEscape$1118('u');
                if (!ch$1280 || ch$1280 === '\\' || !isIdentifierPart$1112(ch$1280.charCodeAt(0))) {
                    throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                }
                id$1281 += ch$1280;
            }
        }
        return id$1281;
    }
    function getIdentifier$1121() {
        var start$1282, ch$1283;
        start$1282 = index$1089++;
        while (index$1089 < length$1096) {
            ch$1283 = source$1087.charCodeAt(index$1089);
            if (ch$1283 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$1089 = start$1282;
                return getEscapedIdentifier$1120();
            }
            if (isIdentifierPart$1112(ch$1283)) {
                ++index$1089;
            } else {
                break;
            }
        }
        return source$1087.slice(start$1282, index$1089);
    }
    function scanIdentifier$1122() {
        var start$1284, id$1285, type$1286;
        start$1284 = index$1089;
        // Backslash (char #92) starts an escaped character.
        id$1285 = source$1087.charCodeAt(index$1089) === 92 ? getEscapedIdentifier$1120() : getIdentifier$1121();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1285.length === 1) {
            type$1286 = Token$1078.Identifier;
        } else if (isKeyword$1116(id$1285)) {
            type$1286 = Token$1078.Keyword;
        } else if (id$1285 === 'null') {
            type$1286 = Token$1078.NullLiteral;
        } else if (id$1285 === 'true' || id$1285 === 'false') {
            type$1286 = Token$1078.BooleanLiteral;
        } else {
            type$1286 = Token$1078.Identifier;
        }
        return {
            type: type$1286,
            value: id$1285,
            lineNumber: lineNumber$1090,
            lineStart: lineStart$1091,
            range: [
                start$1284,
                index$1089
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$1123() {
        var start$1287 = index$1089, code$1288 = source$1087.charCodeAt(index$1089), code2$1289, ch1$1290 = source$1087[index$1089], ch2$1291, ch3$1292, ch4$1293;
        switch (code$1288) {
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
        // ?
        case 126:
            // ~
            ++index$1089;
            if (extra$1103.tokenize) {
                if (code$1288 === 40) {
                    extra$1103.openParenToken = extra$1103.tokens.length;
                } else if (code$1288 === 123) {
                    extra$1103.openCurlyToken = extra$1103.tokens.length;
                }
            }
            return {
                type: Token$1078.Punctuator,
                value: String.fromCharCode(code$1288),
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    start$1287,
                    index$1089
                ]
            };
        default:
            code2$1289 = source$1087.charCodeAt(index$1089 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1289 === 61) {
                switch (code$1288) {
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
                // ^
                case 124:
                    // |
                    index$1089 += 2;
                    return {
                        type: Token$1078.Punctuator,
                        value: String.fromCharCode(code$1288) + String.fromCharCode(code2$1289),
                        lineNumber: lineNumber$1090,
                        lineStart: lineStart$1091,
                        range: [
                            start$1287,
                            index$1089
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$1089 += 2;
                    // !== and ===
                    if (source$1087.charCodeAt(index$1089) === 61) {
                        ++index$1089;
                    }
                    return {
                        type: Token$1078.Punctuator,
                        value: source$1087.slice(start$1287, index$1089),
                        lineNumber: lineNumber$1090,
                        lineStart: lineStart$1091,
                        range: [
                            start$1287,
                            index$1089
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1291 = source$1087[index$1089 + 1];
        ch3$1292 = source$1087[index$1089 + 2];
        ch4$1293 = source$1087[index$1089 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1290 === '>' && ch2$1291 === '>' && ch3$1292 === '>') {
            if (ch4$1293 === '=') {
                index$1089 += 4;
                return {
                    type: Token$1078.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$1090,
                    lineStart: lineStart$1091,
                    range: [
                        start$1287,
                        index$1089
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1290 === '>' && ch2$1291 === '>' && ch3$1292 === '>') {
            index$1089 += 3;
            return {
                type: Token$1078.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    start$1287,
                    index$1089
                ]
            };
        }
        if (ch1$1290 === '<' && ch2$1291 === '<' && ch3$1292 === '=') {
            index$1089 += 3;
            return {
                type: Token$1078.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    start$1287,
                    index$1089
                ]
            };
        }
        if (ch1$1290 === '>' && ch2$1291 === '>' && ch3$1292 === '=') {
            index$1089 += 3;
            return {
                type: Token$1078.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    start$1287,
                    index$1089
                ]
            };
        }
        if (ch1$1290 === '.' && ch2$1291 === '.' && ch3$1292 === '.') {
            index$1089 += 3;
            return {
                type: Token$1078.Punctuator,
                value: '...',
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    start$1287,
                    index$1089
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1290 === ch2$1291 && '+-<>&|'.indexOf(ch1$1290) >= 0) {
            index$1089 += 2;
            return {
                type: Token$1078.Punctuator,
                value: ch1$1290 + ch2$1291,
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    start$1287,
                    index$1089
                ]
            };
        }
        if (ch1$1290 === '=' && ch2$1291 === '>') {
            index$1089 += 2;
            return {
                type: Token$1078.Punctuator,
                value: '=>',
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    start$1287,
                    index$1089
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1290) >= 0) {
            ++index$1089;
            return {
                type: Token$1078.Punctuator,
                value: ch1$1290,
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    start$1287,
                    index$1089
                ]
            };
        }
        if (ch1$1290 === '.') {
            ++index$1089;
            return {
                type: Token$1078.Punctuator,
                value: ch1$1290,
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    start$1287,
                    index$1089
                ]
            };
        }
        throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$1124(start$1294) {
        var number$1295 = '';
        while (index$1089 < length$1096) {
            if (!isHexDigit$1107(source$1087[index$1089])) {
                break;
            }
            number$1295 += source$1087[index$1089++];
        }
        if (number$1295.length === 0) {
            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1111(source$1087.charCodeAt(index$1089))) {
            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1078.NumericLiteral,
            value: parseInt('0x' + number$1295, 16),
            lineNumber: lineNumber$1090,
            lineStart: lineStart$1091,
            range: [
                start$1294,
                index$1089
            ]
        };
    }
    function scanOctalLiteral$1125(prefix$1296, start$1297) {
        var number$1298, octal$1299;
        if (isOctalDigit$1108(prefix$1296)) {
            octal$1299 = true;
            number$1298 = '0' + source$1087[index$1089++];
        } else {
            octal$1299 = false;
            ++index$1089;
            number$1298 = '';
        }
        while (index$1089 < length$1096) {
            if (!isOctalDigit$1108(source$1087[index$1089])) {
                break;
            }
            number$1298 += source$1087[index$1089++];
        }
        if (!octal$1299 && number$1298.length === 0) {
            // only 0o or 0O
            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1111(source$1087.charCodeAt(index$1089)) || isDecimalDigit$1106(source$1087.charCodeAt(index$1089))) {
            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1078.NumericLiteral,
            value: parseInt(number$1298, 8),
            octal: octal$1299,
            lineNumber: lineNumber$1090,
            lineStart: lineStart$1091,
            range: [
                start$1297,
                index$1089
            ]
        };
    }
    function scanNumericLiteral$1126() {
        var number$1300, start$1301, ch$1302, octal$1303;
        ch$1302 = source$1087[index$1089];
        assert$1104(isDecimalDigit$1106(ch$1302.charCodeAt(0)) || ch$1302 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1301 = index$1089;
        number$1300 = '';
        if (ch$1302 !== '.') {
            number$1300 = source$1087[index$1089++];
            ch$1302 = source$1087[index$1089];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1300 === '0') {
                if (ch$1302 === 'x' || ch$1302 === 'X') {
                    ++index$1089;
                    return scanHexLiteral$1124(start$1301);
                }
                if (ch$1302 === 'b' || ch$1302 === 'B') {
                    ++index$1089;
                    number$1300 = '';
                    while (index$1089 < length$1096) {
                        ch$1302 = source$1087[index$1089];
                        if (ch$1302 !== '0' && ch$1302 !== '1') {
                            break;
                        }
                        number$1300 += source$1087[index$1089++];
                    }
                    if (number$1300.length === 0) {
                        // only 0b or 0B
                        throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$1089 < length$1096) {
                        ch$1302 = source$1087.charCodeAt(index$1089);
                        if (isIdentifierStart$1111(ch$1302) || isDecimalDigit$1106(ch$1302)) {
                            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$1078.NumericLiteral,
                        value: parseInt(number$1300, 2),
                        lineNumber: lineNumber$1090,
                        lineStart: lineStart$1091,
                        range: [
                            start$1301,
                            index$1089
                        ]
                    };
                }
                if (ch$1302 === 'o' || ch$1302 === 'O' || isOctalDigit$1108(ch$1302)) {
                    return scanOctalLiteral$1125(ch$1302, start$1301);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1302 && isDecimalDigit$1106(ch$1302.charCodeAt(0))) {
                    throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$1106(source$1087.charCodeAt(index$1089))) {
                number$1300 += source$1087[index$1089++];
            }
            ch$1302 = source$1087[index$1089];
        }
        if (ch$1302 === '.') {
            number$1300 += source$1087[index$1089++];
            while (isDecimalDigit$1106(source$1087.charCodeAt(index$1089))) {
                number$1300 += source$1087[index$1089++];
            }
            ch$1302 = source$1087[index$1089];
        }
        if (ch$1302 === 'e' || ch$1302 === 'E') {
            number$1300 += source$1087[index$1089++];
            ch$1302 = source$1087[index$1089];
            if (ch$1302 === '+' || ch$1302 === '-') {
                number$1300 += source$1087[index$1089++];
            }
            if (isDecimalDigit$1106(source$1087.charCodeAt(index$1089))) {
                while (isDecimalDigit$1106(source$1087.charCodeAt(index$1089))) {
                    number$1300 += source$1087[index$1089++];
                }
            } else {
                throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$1111(source$1087.charCodeAt(index$1089))) {
            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1078.NumericLiteral,
            value: parseFloat(number$1300),
            lineNumber: lineNumber$1090,
            lineStart: lineStart$1091,
            range: [
                start$1301,
                index$1089
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$1127() {
        var str$1304 = '', quote$1305, start$1306, ch$1307, code$1308, unescaped$1309, restore$1310, octal$1311 = false;
        quote$1305 = source$1087[index$1089];
        assert$1104(quote$1305 === '\'' || quote$1305 === '"', 'String literal must starts with a quote');
        start$1306 = index$1089;
        ++index$1089;
        while (index$1089 < length$1096) {
            ch$1307 = source$1087[index$1089++];
            if (ch$1307 === quote$1305) {
                quote$1305 = '';
                break;
            } else if (ch$1307 === '\\') {
                ch$1307 = source$1087[index$1089++];
                if (!ch$1307 || !isLineTerminator$1110(ch$1307.charCodeAt(0))) {
                    switch (ch$1307) {
                    case 'n':
                        str$1304 += '\n';
                        break;
                    case 'r':
                        str$1304 += '\r';
                        break;
                    case 't':
                        str$1304 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1087[index$1089] === '{') {
                            ++index$1089;
                            str$1304 += scanUnicodeCodePointEscape$1119();
                        } else {
                            restore$1310 = index$1089;
                            unescaped$1309 = scanHexEscape$1118(ch$1307);
                            if (unescaped$1309) {
                                str$1304 += unescaped$1309;
                            } else {
                                index$1089 = restore$1310;
                                str$1304 += ch$1307;
                            }
                        }
                        break;
                    case 'b':
                        str$1304 += '\b';
                        break;
                    case 'f':
                        str$1304 += '\f';
                        break;
                    case 'v':
                        str$1304 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1108(ch$1307)) {
                            code$1308 = '01234567'.indexOf(ch$1307);
                            // \0 is not octal escape sequence
                            if (code$1308 !== 0) {
                                octal$1311 = true;
                            }
                            if (index$1089 < length$1096 && isOctalDigit$1108(source$1087[index$1089])) {
                                octal$1311 = true;
                                code$1308 = code$1308 * 8 + '01234567'.indexOf(source$1087[index$1089++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1307) >= 0 && index$1089 < length$1096 && isOctalDigit$1108(source$1087[index$1089])) {
                                    code$1308 = code$1308 * 8 + '01234567'.indexOf(source$1087[index$1089++]);
                                }
                            }
                            str$1304 += String.fromCharCode(code$1308);
                        } else {
                            str$1304 += ch$1307;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1090;
                    if (ch$1307 === '\r' && source$1087[index$1089] === '\n') {
                        ++index$1089;
                    }
                }
            } else if (isLineTerminator$1110(ch$1307.charCodeAt(0))) {
                break;
            } else {
                str$1304 += ch$1307;
            }
        }
        if (quote$1305 !== '') {
            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1078.StringLiteral,
            value: str$1304,
            octal: octal$1311,
            lineNumber: lineNumber$1090,
            lineStart: lineStart$1091,
            range: [
                start$1306,
                index$1089
            ]
        };
    }
    function scanTemplate$1128() {
        var cooked$1312 = '', ch$1313, start$1314, terminated$1315, tail$1316, restore$1317, unescaped$1318, code$1319, octal$1320;
        terminated$1315 = false;
        tail$1316 = false;
        start$1314 = index$1089;
        ++index$1089;
        while (index$1089 < length$1096) {
            ch$1313 = source$1087[index$1089++];
            if (ch$1313 === '`') {
                tail$1316 = true;
                terminated$1315 = true;
                break;
            } else if (ch$1313 === '$') {
                if (source$1087[index$1089] === '{') {
                    ++index$1089;
                    terminated$1315 = true;
                    break;
                }
                cooked$1312 += ch$1313;
            } else if (ch$1313 === '\\') {
                ch$1313 = source$1087[index$1089++];
                if (!isLineTerminator$1110(ch$1313.charCodeAt(0))) {
                    switch (ch$1313) {
                    case 'n':
                        cooked$1312 += '\n';
                        break;
                    case 'r':
                        cooked$1312 += '\r';
                        break;
                    case 't':
                        cooked$1312 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1087[index$1089] === '{') {
                            ++index$1089;
                            cooked$1312 += scanUnicodeCodePointEscape$1119();
                        } else {
                            restore$1317 = index$1089;
                            unescaped$1318 = scanHexEscape$1118(ch$1313);
                            if (unescaped$1318) {
                                cooked$1312 += unescaped$1318;
                            } else {
                                index$1089 = restore$1317;
                                cooked$1312 += ch$1313;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1312 += '\b';
                        break;
                    case 'f':
                        cooked$1312 += '\f';
                        break;
                    case 'v':
                        cooked$1312 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1108(ch$1313)) {
                            code$1319 = '01234567'.indexOf(ch$1313);
                            // \0 is not octal escape sequence
                            if (code$1319 !== 0) {
                                octal$1320 = true;
                            }
                            if (index$1089 < length$1096 && isOctalDigit$1108(source$1087[index$1089])) {
                                octal$1320 = true;
                                code$1319 = code$1319 * 8 + '01234567'.indexOf(source$1087[index$1089++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1313) >= 0 && index$1089 < length$1096 && isOctalDigit$1108(source$1087[index$1089])) {
                                    code$1319 = code$1319 * 8 + '01234567'.indexOf(source$1087[index$1089++]);
                                }
                            }
                            cooked$1312 += String.fromCharCode(code$1319);
                        } else {
                            cooked$1312 += ch$1313;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1090;
                    if (ch$1313 === '\r' && source$1087[index$1089] === '\n') {
                        ++index$1089;
                    }
                }
            } else if (isLineTerminator$1110(ch$1313.charCodeAt(0))) {
                ++lineNumber$1090;
                if (ch$1313 === '\r' && source$1087[index$1089] === '\n') {
                    ++index$1089;
                }
                cooked$1312 += '\n';
            } else {
                cooked$1312 += ch$1313;
            }
        }
        if (!terminated$1315) {
            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1078.Template,
            value: {
                cooked: cooked$1312,
                raw: source$1087.slice(start$1314 + 1, index$1089 - (tail$1316 ? 1 : 2))
            },
            tail: tail$1316,
            octal: octal$1320,
            lineNumber: lineNumber$1090,
            lineStart: lineStart$1091,
            range: [
                start$1314,
                index$1089
            ]
        };
    }
    function scanTemplateElement$1129(option$1321) {
        var startsWith$1322, template$1323;
        lookahead$1100 = null;
        skipComment$1117();
        startsWith$1322 = option$1321.head ? '`' : '}';
        if (source$1087[index$1089] !== startsWith$1322) {
            throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
        }
        template$1323 = scanTemplate$1128();
        peek$1135();
        return template$1323;
    }
    function scanRegExp$1130() {
        var str$1324, ch$1325, start$1326, pattern$1327, flags$1328, value$1329, classMarker$1330 = false, restore$1331, terminated$1332 = false;
        lookahead$1100 = null;
        skipComment$1117();
        start$1326 = index$1089;
        ch$1325 = source$1087[index$1089];
        assert$1104(ch$1325 === '/', 'Regular expression literal must start with a slash');
        str$1324 = source$1087[index$1089++];
        while (index$1089 < length$1096) {
            ch$1325 = source$1087[index$1089++];
            str$1324 += ch$1325;
            if (classMarker$1330) {
                if (ch$1325 === ']') {
                    classMarker$1330 = false;
                }
            } else {
                if (ch$1325 === '\\') {
                    ch$1325 = source$1087[index$1089++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$1110(ch$1325.charCodeAt(0))) {
                        throwError$1138({}, Messages$1083.UnterminatedRegExp);
                    }
                    str$1324 += ch$1325;
                } else if (ch$1325 === '/') {
                    terminated$1332 = true;
                    break;
                } else if (ch$1325 === '[') {
                    classMarker$1330 = true;
                } else if (isLineTerminator$1110(ch$1325.charCodeAt(0))) {
                    throwError$1138({}, Messages$1083.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1332) {
            throwError$1138({}, Messages$1083.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1327 = str$1324.substr(1, str$1324.length - 2);
        flags$1328 = '';
        while (index$1089 < length$1096) {
            ch$1325 = source$1087[index$1089];
            if (!isIdentifierPart$1112(ch$1325.charCodeAt(0))) {
                break;
            }
            ++index$1089;
            if (ch$1325 === '\\' && index$1089 < length$1096) {
                ch$1325 = source$1087[index$1089];
                if (ch$1325 === 'u') {
                    ++index$1089;
                    restore$1331 = index$1089;
                    ch$1325 = scanHexEscape$1118('u');
                    if (ch$1325) {
                        flags$1328 += ch$1325;
                        for (str$1324 += '\\u'; restore$1331 < index$1089; ++restore$1331) {
                            str$1324 += source$1087[restore$1331];
                        }
                    } else {
                        index$1089 = restore$1331;
                        flags$1328 += 'u';
                        str$1324 += '\\u';
                    }
                } else {
                    str$1324 += '\\';
                }
            } else {
                flags$1328 += ch$1325;
                str$1324 += ch$1325;
            }
        }
        try {
            value$1329 = new RegExp(pattern$1327, flags$1328);
        } catch (e$1333) {
            throwError$1138({}, Messages$1083.InvalidRegExp);
        }
        // peek();
        if (extra$1103.tokenize) {
            return {
                type: Token$1078.RegularExpression,
                value: value$1329,
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    start$1326,
                    index$1089
                ]
            };
        }
        return {
            type: Token$1078.RegularExpression,
            literal: str$1324,
            value: value$1329,
            range: [
                start$1326,
                index$1089
            ]
        };
    }
    function isIdentifierName$1131(token$1334) {
        return token$1334.type === Token$1078.Identifier || token$1334.type === Token$1078.Keyword || token$1334.type === Token$1078.BooleanLiteral || token$1334.type === Token$1078.NullLiteral;
    }
    function advanceSlash$1132() {
        var prevToken$1335, checkToken$1336;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1335 = extra$1103.tokens[extra$1103.tokens.length - 1];
        if (!prevToken$1335) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$1130();
        }
        if (prevToken$1335.type === 'Punctuator') {
            if (prevToken$1335.value === ')') {
                checkToken$1336 = extra$1103.tokens[extra$1103.openParenToken - 1];
                if (checkToken$1336 && checkToken$1336.type === 'Keyword' && (checkToken$1336.value === 'if' || checkToken$1336.value === 'while' || checkToken$1336.value === 'for' || checkToken$1336.value === 'with')) {
                    return scanRegExp$1130();
                }
                return scanPunctuator$1123();
            }
            if (prevToken$1335.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$1103.tokens[extra$1103.openCurlyToken - 3] && extra$1103.tokens[extra$1103.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1336 = extra$1103.tokens[extra$1103.openCurlyToken - 4];
                    if (!checkToken$1336) {
                        return scanPunctuator$1123();
                    }
                } else if (extra$1103.tokens[extra$1103.openCurlyToken - 4] && extra$1103.tokens[extra$1103.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1336 = extra$1103.tokens[extra$1103.openCurlyToken - 5];
                    if (!checkToken$1336) {
                        return scanRegExp$1130();
                    }
                } else {
                    return scanPunctuator$1123();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$1080.indexOf(checkToken$1336.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$1123();
                }
                // It is a declaration.
                return scanRegExp$1130();
            }
            return scanRegExp$1130();
        }
        if (prevToken$1335.type === 'Keyword') {
            return scanRegExp$1130();
        }
        return scanPunctuator$1123();
    }
    function advance$1133() {
        var ch$1337;
        skipComment$1117();
        if (index$1089 >= length$1096) {
            return {
                type: Token$1078.EOF,
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    index$1089,
                    index$1089
                ]
            };
        }
        ch$1337 = source$1087.charCodeAt(index$1089);
        // Very common: ( and ) and ;
        if (ch$1337 === 40 || ch$1337 === 41 || ch$1337 === 58) {
            return scanPunctuator$1123();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1337 === 39 || ch$1337 === 34) {
            return scanStringLiteral$1127();
        }
        if (ch$1337 === 96) {
            return scanTemplate$1128();
        }
        if (isIdentifierStart$1111(ch$1337)) {
            return scanIdentifier$1122();
        }
        // # and @ are allowed for sweet.js
        if (ch$1337 === 35 || ch$1337 === 64) {
            ++index$1089;
            return {
                type: Token$1078.Punctuator,
                value: String.fromCharCode(ch$1337),
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    index$1089 - 1,
                    index$1089
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1337 === 46) {
            if (isDecimalDigit$1106(source$1087.charCodeAt(index$1089 + 1))) {
                return scanNumericLiteral$1126();
            }
            return scanPunctuator$1123();
        }
        if (isDecimalDigit$1106(ch$1337)) {
            return scanNumericLiteral$1126();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$1103.tokenize && ch$1337 === 47) {
            return advanceSlash$1132();
        }
        return scanPunctuator$1123();
    }
    function lex$1134() {
        var token$1338;
        token$1338 = lookahead$1100;
        streamIndex$1099 = lookaheadIndex$1101;
        lineNumber$1090 = token$1338.lineNumber;
        lineStart$1091 = token$1338.lineStart;
        sm_lineNumber$1092 = lookahead$1100.sm_lineNumber;
        sm_lineStart$1093 = lookahead$1100.sm_lineStart;
        sm_range$1094 = lookahead$1100.sm_range;
        sm_index$1095 = lookahead$1100.sm_range[0];
        lookahead$1100 = tokenStream$1098[++streamIndex$1099].token;
        lookaheadIndex$1101 = streamIndex$1099;
        index$1089 = lookahead$1100.range[0];
        return token$1338;
    }
    function peek$1135() {
        lookaheadIndex$1101 = streamIndex$1099 + 1;
        if (lookaheadIndex$1101 >= length$1096) {
            lookahead$1100 = {
                type: Token$1078.EOF,
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    index$1089,
                    index$1089
                ]
            };
            return;
        }
        lookahead$1100 = tokenStream$1098[lookaheadIndex$1101].token;
        index$1089 = lookahead$1100.range[0];
    }
    function lookahead2$1136() {
        var adv$1339, pos$1340, line$1341, start$1342, result$1343;
        if (streamIndex$1099 + 1 >= length$1096 || streamIndex$1099 + 2 >= length$1096) {
            return {
                type: Token$1078.EOF,
                lineNumber: lineNumber$1090,
                lineStart: lineStart$1091,
                range: [
                    index$1089,
                    index$1089
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$1100 === null) {
            lookaheadIndex$1101 = streamIndex$1099 + 1;
            lookahead$1100 = tokenStream$1098[lookaheadIndex$1101].token;
            index$1089 = lookahead$1100.range[0];
        }
        result$1343 = tokenStream$1098[lookaheadIndex$1101 + 1].token;
        return result$1343;
    }
    SyntaxTreeDelegate$1085 = {
        name: 'SyntaxTree',
        postProcess: function (node$1344) {
            return node$1344;
        },
        createArrayExpression: function (elements$1345) {
            return {
                type: Syntax$1081.ArrayExpression,
                elements: elements$1345
            };
        },
        createAssignmentExpression: function (operator$1346, left$1347, right$1348) {
            return {
                type: Syntax$1081.AssignmentExpression,
                operator: operator$1346,
                left: left$1347,
                right: right$1348
            };
        },
        createBinaryExpression: function (operator$1349, left$1350, right$1351) {
            var type$1352 = operator$1349 === '||' || operator$1349 === '&&' ? Syntax$1081.LogicalExpression : Syntax$1081.BinaryExpression;
            return {
                type: type$1352,
                operator: operator$1349,
                left: left$1350,
                right: right$1351
            };
        },
        createBlockStatement: function (body$1353) {
            return {
                type: Syntax$1081.BlockStatement,
                body: body$1353
            };
        },
        createBreakStatement: function (label$1354) {
            return {
                type: Syntax$1081.BreakStatement,
                label: label$1354
            };
        },
        createCallExpression: function (callee$1355, args$1356) {
            return {
                type: Syntax$1081.CallExpression,
                callee: callee$1355,
                'arguments': args$1356
            };
        },
        createCatchClause: function (param$1357, body$1358) {
            return {
                type: Syntax$1081.CatchClause,
                param: param$1357,
                body: body$1358
            };
        },
        createConditionalExpression: function (test$1359, consequent$1360, alternate$1361) {
            return {
                type: Syntax$1081.ConditionalExpression,
                test: test$1359,
                consequent: consequent$1360,
                alternate: alternate$1361
            };
        },
        createContinueStatement: function (label$1362) {
            return {
                type: Syntax$1081.ContinueStatement,
                label: label$1362
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$1081.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1363, test$1364) {
            return {
                type: Syntax$1081.DoWhileStatement,
                body: body$1363,
                test: test$1364
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$1081.EmptyStatement };
        },
        createExpressionStatement: function (expression$1365) {
            return {
                type: Syntax$1081.ExpressionStatement,
                expression: expression$1365
            };
        },
        createForStatement: function (init$1366, test$1367, update$1368, body$1369) {
            return {
                type: Syntax$1081.ForStatement,
                init: init$1366,
                test: test$1367,
                update: update$1368,
                body: body$1369
            };
        },
        createForInStatement: function (left$1370, right$1371, body$1372) {
            return {
                type: Syntax$1081.ForInStatement,
                left: left$1370,
                right: right$1371,
                body: body$1372,
                each: false
            };
        },
        createForOfStatement: function (left$1373, right$1374, body$1375) {
            return {
                type: Syntax$1081.ForOfStatement,
                left: left$1373,
                right: right$1374,
                body: body$1375
            };
        },
        createFunctionDeclaration: function (id$1376, params$1377, defaults$1378, body$1379, rest$1380, generator$1381, expression$1382) {
            return {
                type: Syntax$1081.FunctionDeclaration,
                id: id$1376,
                params: params$1377,
                defaults: defaults$1378,
                body: body$1379,
                rest: rest$1380,
                generator: generator$1381,
                expression: expression$1382
            };
        },
        createFunctionExpression: function (id$1383, params$1384, defaults$1385, body$1386, rest$1387, generator$1388, expression$1389) {
            return {
                type: Syntax$1081.FunctionExpression,
                id: id$1383,
                params: params$1384,
                defaults: defaults$1385,
                body: body$1386,
                rest: rest$1387,
                generator: generator$1388,
                expression: expression$1389
            };
        },
        createIdentifier: function (name$1390) {
            return {
                type: Syntax$1081.Identifier,
                name: name$1390
            };
        },
        createIfStatement: function (test$1391, consequent$1392, alternate$1393) {
            return {
                type: Syntax$1081.IfStatement,
                test: test$1391,
                consequent: consequent$1392,
                alternate: alternate$1393
            };
        },
        createLabeledStatement: function (label$1394, body$1395) {
            return {
                type: Syntax$1081.LabeledStatement,
                label: label$1394,
                body: body$1395
            };
        },
        createLiteral: function (token$1396) {
            return {
                type: Syntax$1081.Literal,
                value: token$1396.value,
                raw: String(token$1396.value)
            };
        },
        createMemberExpression: function (accessor$1397, object$1398, property$1399) {
            return {
                type: Syntax$1081.MemberExpression,
                computed: accessor$1397 === '[',
                object: object$1398,
                property: property$1399
            };
        },
        createNewExpression: function (callee$1400, args$1401) {
            return {
                type: Syntax$1081.NewExpression,
                callee: callee$1400,
                'arguments': args$1401
            };
        },
        createObjectExpression: function (properties$1402) {
            return {
                type: Syntax$1081.ObjectExpression,
                properties: properties$1402
            };
        },
        createPostfixExpression: function (operator$1403, argument$1404) {
            return {
                type: Syntax$1081.UpdateExpression,
                operator: operator$1403,
                argument: argument$1404,
                prefix: false
            };
        },
        createProgram: function (body$1405) {
            return {
                type: Syntax$1081.Program,
                body: body$1405
            };
        },
        createProperty: function (kind$1406, key$1407, value$1408, method$1409, shorthand$1410) {
            return {
                type: Syntax$1081.Property,
                key: key$1407,
                value: value$1408,
                kind: kind$1406,
                method: method$1409,
                shorthand: shorthand$1410
            };
        },
        createReturnStatement: function (argument$1411) {
            return {
                type: Syntax$1081.ReturnStatement,
                argument: argument$1411
            };
        },
        createSequenceExpression: function (expressions$1412) {
            return {
                type: Syntax$1081.SequenceExpression,
                expressions: expressions$1412
            };
        },
        createSwitchCase: function (test$1413, consequent$1414) {
            return {
                type: Syntax$1081.SwitchCase,
                test: test$1413,
                consequent: consequent$1414
            };
        },
        createSwitchStatement: function (discriminant$1415, cases$1416) {
            return {
                type: Syntax$1081.SwitchStatement,
                discriminant: discriminant$1415,
                cases: cases$1416
            };
        },
        createThisExpression: function () {
            return { type: Syntax$1081.ThisExpression };
        },
        createThrowStatement: function (argument$1417) {
            return {
                type: Syntax$1081.ThrowStatement,
                argument: argument$1417
            };
        },
        createTryStatement: function (block$1418, guardedHandlers$1419, handlers$1420, finalizer$1421) {
            return {
                type: Syntax$1081.TryStatement,
                block: block$1418,
                guardedHandlers: guardedHandlers$1419,
                handlers: handlers$1420,
                finalizer: finalizer$1421
            };
        },
        createUnaryExpression: function (operator$1422, argument$1423) {
            if (operator$1422 === '++' || operator$1422 === '--') {
                return {
                    type: Syntax$1081.UpdateExpression,
                    operator: operator$1422,
                    argument: argument$1423,
                    prefix: true
                };
            }
            return {
                type: Syntax$1081.UnaryExpression,
                operator: operator$1422,
                argument: argument$1423
            };
        },
        createVariableDeclaration: function (declarations$1424, kind$1425) {
            return {
                type: Syntax$1081.VariableDeclaration,
                declarations: declarations$1424,
                kind: kind$1425
            };
        },
        createVariableDeclarator: function (id$1426, init$1427) {
            return {
                type: Syntax$1081.VariableDeclarator,
                id: id$1426,
                init: init$1427
            };
        },
        createWhileStatement: function (test$1428, body$1429) {
            return {
                type: Syntax$1081.WhileStatement,
                test: test$1428,
                body: body$1429
            };
        },
        createWithStatement: function (object$1430, body$1431) {
            return {
                type: Syntax$1081.WithStatement,
                object: object$1430,
                body: body$1431
            };
        },
        createTemplateElement: function (value$1432, tail$1433) {
            return {
                type: Syntax$1081.TemplateElement,
                value: value$1432,
                tail: tail$1433
            };
        },
        createTemplateLiteral: function (quasis$1434, expressions$1435) {
            return {
                type: Syntax$1081.TemplateLiteral,
                quasis: quasis$1434,
                expressions: expressions$1435
            };
        },
        createSpreadElement: function (argument$1436) {
            return {
                type: Syntax$1081.SpreadElement,
                argument: argument$1436
            };
        },
        createTaggedTemplateExpression: function (tag$1437, quasi$1438) {
            return {
                type: Syntax$1081.TaggedTemplateExpression,
                tag: tag$1437,
                quasi: quasi$1438
            };
        },
        createArrowFunctionExpression: function (params$1439, defaults$1440, body$1441, rest$1442, expression$1443) {
            return {
                type: Syntax$1081.ArrowFunctionExpression,
                id: null,
                params: params$1439,
                defaults: defaults$1440,
                body: body$1441,
                rest: rest$1442,
                generator: false,
                expression: expression$1443
            };
        },
        createMethodDefinition: function (propertyType$1444, kind$1445, key$1446, value$1447) {
            return {
                type: Syntax$1081.MethodDefinition,
                key: key$1446,
                value: value$1447,
                kind: kind$1445,
                'static': propertyType$1444 === ClassPropertyType$1086.static
            };
        },
        createClassBody: function (body$1448) {
            return {
                type: Syntax$1081.ClassBody,
                body: body$1448
            };
        },
        createClassExpression: function (id$1449, superClass$1450, body$1451) {
            return {
                type: Syntax$1081.ClassExpression,
                id: id$1449,
                superClass: superClass$1450,
                body: body$1451
            };
        },
        createClassDeclaration: function (id$1452, superClass$1453, body$1454) {
            return {
                type: Syntax$1081.ClassDeclaration,
                id: id$1452,
                superClass: superClass$1453,
                body: body$1454
            };
        },
        createExportSpecifier: function (id$1455, name$1456) {
            return {
                type: Syntax$1081.ExportSpecifier,
                id: id$1455,
                name: name$1456
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$1081.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1457, specifiers$1458, source$1459) {
            return {
                type: Syntax$1081.ExportDeclaration,
                declaration: declaration$1457,
                specifiers: specifiers$1458,
                source: source$1459
            };
        },
        createImportSpecifier: function (id$1460, name$1461) {
            return {
                type: Syntax$1081.ImportSpecifier,
                id: id$1460,
                name: name$1461
            };
        },
        createImportDeclaration: function (specifiers$1462, kind$1463, source$1464) {
            return {
                type: Syntax$1081.ImportDeclaration,
                specifiers: specifiers$1462,
                kind: kind$1463,
                source: source$1464
            };
        },
        createYieldExpression: function (argument$1465, delegate$1466) {
            return {
                type: Syntax$1081.YieldExpression,
                argument: argument$1465,
                delegate: delegate$1466
            };
        },
        createModuleDeclaration: function (id$1467, source$1468, body$1469) {
            return {
                type: Syntax$1081.ModuleDeclaration,
                id: id$1467,
                source: source$1468,
                body: body$1469
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1137() {
        return lookahead$1100.lineNumber !== lineNumber$1090;
    }
    // Throw an exception
    function throwError$1138(token$1470, messageFormat$1471) {
        var error$1472, args$1473 = Array.prototype.slice.call(arguments, 2), msg$1474 = messageFormat$1471.replace(/%(\d)/g, function (whole$1478, index$1479) {
                assert$1104(index$1479 < args$1473.length, 'Message reference must be in range');
                return args$1473[index$1479];
            });
        var startIndex$1475 = streamIndex$1099 > 3 ? streamIndex$1099 - 3 : 0;
        var toks$1476 = tokenStream$1098.slice(startIndex$1475, streamIndex$1099 + 3).map(function (stx$1480) {
                return stx$1480.token.value;
            }).join(' ');
        var tailingMsg$1477 = '\n[... ' + toks$1476 + ' ...]';
        if (typeof token$1470.lineNumber === 'number') {
            error$1472 = new Error('Line ' + token$1470.lineNumber + ': ' + msg$1474 + tailingMsg$1477);
            error$1472.index = token$1470.range[0];
            error$1472.lineNumber = token$1470.lineNumber;
            error$1472.column = token$1470.range[0] - lineStart$1091 + 1;
        } else {
            error$1472 = new Error('Line ' + lineNumber$1090 + ': ' + msg$1474 + tailingMsg$1477);
            error$1472.index = index$1089;
            error$1472.lineNumber = lineNumber$1090;
            error$1472.column = index$1089 - lineStart$1091 + 1;
        }
        error$1472.description = msg$1474;
        throw error$1472;
    }
    function throwErrorTolerant$1139() {
        try {
            throwError$1138.apply(null, arguments);
        } catch (e$1481) {
            if (extra$1103.errors) {
                extra$1103.errors.push(e$1481);
            } else {
                throw e$1481;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1140(token$1482) {
        if (token$1482.type === Token$1078.EOF) {
            throwError$1138(token$1482, Messages$1083.UnexpectedEOS);
        }
        if (token$1482.type === Token$1078.NumericLiteral) {
            throwError$1138(token$1482, Messages$1083.UnexpectedNumber);
        }
        if (token$1482.type === Token$1078.StringLiteral) {
            throwError$1138(token$1482, Messages$1083.UnexpectedString);
        }
        if (token$1482.type === Token$1078.Identifier) {
            throwError$1138(token$1482, Messages$1083.UnexpectedIdentifier);
        }
        if (token$1482.type === Token$1078.Keyword) {
            if (isFutureReservedWord$1113(token$1482.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$1088 && isStrictModeReservedWord$1114(token$1482.value)) {
                throwErrorTolerant$1139(token$1482, Messages$1083.StrictReservedWord);
                return;
            }
            throwError$1138(token$1482, Messages$1083.UnexpectedToken, token$1482.value);
        }
        if (token$1482.type === Token$1078.Template) {
            throwError$1138(token$1482, Messages$1083.UnexpectedTemplate, token$1482.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1138(token$1482, Messages$1083.UnexpectedToken, token$1482.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1141(value$1483) {
        var token$1484 = lex$1134();
        if (token$1484.type !== Token$1078.Punctuator || token$1484.value !== value$1483) {
            throwUnexpected$1140(token$1484);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1142(keyword$1485) {
        var token$1486 = lex$1134();
        if (token$1486.type !== Token$1078.Keyword || token$1486.value !== keyword$1485) {
            throwUnexpected$1140(token$1486);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1143(value$1487) {
        return lookahead$1100.type === Token$1078.Punctuator && lookahead$1100.value === value$1487;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1144(keyword$1488) {
        return lookahead$1100.type === Token$1078.Keyword && lookahead$1100.value === keyword$1488;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1145(keyword$1489) {
        return lookahead$1100.type === Token$1078.Identifier && lookahead$1100.value === keyword$1489;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1146() {
        var op$1490;
        if (lookahead$1100.type !== Token$1078.Punctuator) {
            return false;
        }
        op$1490 = lookahead$1100.value;
        return op$1490 === '=' || op$1490 === '*=' || op$1490 === '/=' || op$1490 === '%=' || op$1490 === '+=' || op$1490 === '-=' || op$1490 === '<<=' || op$1490 === '>>=' || op$1490 === '>>>=' || op$1490 === '&=' || op$1490 === '^=' || op$1490 === '|=';
    }
    function consumeSemicolon$1147() {
        var line$1491, ch$1492;
        ch$1492 = lookahead$1100.value ? String(lookahead$1100.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1492 === 59) {
            lex$1134();
            return;
        }
        if (lookahead$1100.lineNumber !== lineNumber$1090) {
            return;
        }
        if (match$1143(';')) {
            lex$1134();
            return;
        }
        if (lookahead$1100.type !== Token$1078.EOF && !match$1143('}')) {
            throwUnexpected$1140(lookahead$1100);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1148(expr$1493) {
        return expr$1493.type === Syntax$1081.Identifier || expr$1493.type === Syntax$1081.MemberExpression;
    }
    function isAssignableLeftHandSide$1149(expr$1494) {
        return isLeftHandSide$1148(expr$1494) || expr$1494.type === Syntax$1081.ObjectPattern || expr$1494.type === Syntax$1081.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1150() {
        var elements$1495 = [], blocks$1496 = [], filter$1497 = null, tmp$1498, possiblecomprehension$1499 = true, body$1500;
        expect$1141('[');
        while (!match$1143(']')) {
            if (lookahead$1100.value === 'for' && lookahead$1100.type === Token$1078.Keyword) {
                if (!possiblecomprehension$1499) {
                    throwError$1138({}, Messages$1083.ComprehensionError);
                }
                matchKeyword$1144('for');
                tmp$1498 = parseForStatement$1198({ ignoreBody: true });
                tmp$1498.of = tmp$1498.type === Syntax$1081.ForOfStatement;
                tmp$1498.type = Syntax$1081.ComprehensionBlock;
                if (tmp$1498.left.kind) {
                    // can't be let or const
                    throwError$1138({}, Messages$1083.ComprehensionError);
                }
                blocks$1496.push(tmp$1498);
            } else if (lookahead$1100.value === 'if' && lookahead$1100.type === Token$1078.Keyword) {
                if (!possiblecomprehension$1499) {
                    throwError$1138({}, Messages$1083.ComprehensionError);
                }
                expectKeyword$1142('if');
                expect$1141('(');
                filter$1497 = parseExpression$1178();
                expect$1141(')');
            } else if (lookahead$1100.value === ',' && lookahead$1100.type === Token$1078.Punctuator) {
                possiblecomprehension$1499 = false;
                // no longer allowed.
                lex$1134();
                elements$1495.push(null);
            } else {
                tmp$1498 = parseSpreadOrAssignmentExpression$1161();
                elements$1495.push(tmp$1498);
                if (tmp$1498 && tmp$1498.type === Syntax$1081.SpreadElement) {
                    if (!match$1143(']')) {
                        throwError$1138({}, Messages$1083.ElementAfterSpreadElement);
                    }
                } else if (!(match$1143(']') || matchKeyword$1144('for') || matchKeyword$1144('if'))) {
                    expect$1141(',');
                    // this lexes.
                    possiblecomprehension$1499 = false;
                }
            }
        }
        expect$1141(']');
        if (filter$1497 && !blocks$1496.length) {
            throwError$1138({}, Messages$1083.ComprehensionRequiresBlock);
        }
        if (blocks$1496.length) {
            if (elements$1495.length !== 1) {
                throwError$1138({}, Messages$1083.ComprehensionError);
            }
            return {
                type: Syntax$1081.ComprehensionExpression,
                filter: filter$1497,
                blocks: blocks$1496,
                body: elements$1495[0]
            };
        }
        return delegate$1097.createArrayExpression(elements$1495);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1151(options$1501) {
        var previousStrict$1502, previousYieldAllowed$1503, params$1504, defaults$1505, body$1506;
        previousStrict$1502 = strict$1088;
        previousYieldAllowed$1503 = state$1102.yieldAllowed;
        state$1102.yieldAllowed = options$1501.generator;
        params$1504 = options$1501.params || [];
        defaults$1505 = options$1501.defaults || [];
        body$1506 = parseConciseBody$1210();
        if (options$1501.name && strict$1088 && isRestrictedWord$1115(params$1504[0].name)) {
            throwErrorTolerant$1139(options$1501.name, Messages$1083.StrictParamName);
        }
        if (state$1102.yieldAllowed && !state$1102.yieldFound) {
            throwErrorTolerant$1139({}, Messages$1083.NoYieldInGenerator);
        }
        strict$1088 = previousStrict$1502;
        state$1102.yieldAllowed = previousYieldAllowed$1503;
        return delegate$1097.createFunctionExpression(null, params$1504, defaults$1505, body$1506, options$1501.rest || null, options$1501.generator, body$1506.type !== Syntax$1081.BlockStatement);
    }
    function parsePropertyMethodFunction$1152(options$1507) {
        var previousStrict$1508, tmp$1509, method$1510;
        previousStrict$1508 = strict$1088;
        strict$1088 = true;
        tmp$1509 = parseParams$1214();
        if (tmp$1509.stricted) {
            throwErrorTolerant$1139(tmp$1509.stricted, tmp$1509.message);
        }
        method$1510 = parsePropertyFunction$1151({
            params: tmp$1509.params,
            defaults: tmp$1509.defaults,
            rest: tmp$1509.rest,
            generator: options$1507.generator
        });
        strict$1088 = previousStrict$1508;
        return method$1510;
    }
    function parseObjectPropertyKey$1153() {
        var token$1511 = lex$1134();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1511.type === Token$1078.StringLiteral || token$1511.type === Token$1078.NumericLiteral) {
            if (strict$1088 && token$1511.octal) {
                throwErrorTolerant$1139(token$1511, Messages$1083.StrictOctalLiteral);
            }
            return delegate$1097.createLiteral(token$1511);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$1097.createIdentifier(token$1511.value);
    }
    function parseObjectProperty$1154() {
        var token$1512, key$1513, id$1514, value$1515, param$1516;
        token$1512 = lookahead$1100;
        if (token$1512.type === Token$1078.Identifier) {
            id$1514 = parseObjectPropertyKey$1153();
            // Property Assignment: Getter and Setter.
            if (token$1512.value === 'get' && !(match$1143(':') || match$1143('('))) {
                key$1513 = parseObjectPropertyKey$1153();
                expect$1141('(');
                expect$1141(')');
                return delegate$1097.createProperty('get', key$1513, parsePropertyFunction$1151({ generator: false }), false, false);
            }
            if (token$1512.value === 'set' && !(match$1143(':') || match$1143('('))) {
                key$1513 = parseObjectPropertyKey$1153();
                expect$1141('(');
                token$1512 = lookahead$1100;
                param$1516 = [parseVariableIdentifier$1181()];
                expect$1141(')');
                return delegate$1097.createProperty('set', key$1513, parsePropertyFunction$1151({
                    params: param$1516,
                    generator: false,
                    name: token$1512
                }), false, false);
            }
            if (match$1143(':')) {
                lex$1134();
                return delegate$1097.createProperty('init', id$1514, parseAssignmentExpression$1177(), false, false);
            }
            if (match$1143('(')) {
                return delegate$1097.createProperty('init', id$1514, parsePropertyMethodFunction$1152({ generator: false }), true, false);
            }
            return delegate$1097.createProperty('init', id$1514, id$1514, false, true);
        }
        if (token$1512.type === Token$1078.EOF || token$1512.type === Token$1078.Punctuator) {
            if (!match$1143('*')) {
                throwUnexpected$1140(token$1512);
            }
            lex$1134();
            id$1514 = parseObjectPropertyKey$1153();
            if (!match$1143('(')) {
                throwUnexpected$1140(lex$1134());
            }
            return delegate$1097.createProperty('init', id$1514, parsePropertyMethodFunction$1152({ generator: true }), true, false);
        }
        key$1513 = parseObjectPropertyKey$1153();
        if (match$1143(':')) {
            lex$1134();
            return delegate$1097.createProperty('init', key$1513, parseAssignmentExpression$1177(), false, false);
        }
        if (match$1143('(')) {
            return delegate$1097.createProperty('init', key$1513, parsePropertyMethodFunction$1152({ generator: false }), true, false);
        }
        throwUnexpected$1140(lex$1134());
    }
    function parseObjectInitialiser$1155() {
        var properties$1517 = [], property$1518, name$1519, key$1520, kind$1521, map$1522 = {}, toString$1523 = String;
        expect$1141('{');
        while (!match$1143('}')) {
            property$1518 = parseObjectProperty$1154();
            if (property$1518.key.type === Syntax$1081.Identifier) {
                name$1519 = property$1518.key.name;
            } else {
                name$1519 = toString$1523(property$1518.key.value);
            }
            kind$1521 = property$1518.kind === 'init' ? PropertyKind$1082.Data : property$1518.kind === 'get' ? PropertyKind$1082.Get : PropertyKind$1082.Set;
            key$1520 = '$' + name$1519;
            if (Object.prototype.hasOwnProperty.call(map$1522, key$1520)) {
                if (map$1522[key$1520] === PropertyKind$1082.Data) {
                    if (strict$1088 && kind$1521 === PropertyKind$1082.Data) {
                        throwErrorTolerant$1139({}, Messages$1083.StrictDuplicateProperty);
                    } else if (kind$1521 !== PropertyKind$1082.Data) {
                        throwErrorTolerant$1139({}, Messages$1083.AccessorDataProperty);
                    }
                } else {
                    if (kind$1521 === PropertyKind$1082.Data) {
                        throwErrorTolerant$1139({}, Messages$1083.AccessorDataProperty);
                    } else if (map$1522[key$1520] & kind$1521) {
                        throwErrorTolerant$1139({}, Messages$1083.AccessorGetSet);
                    }
                }
                map$1522[key$1520] |= kind$1521;
            } else {
                map$1522[key$1520] = kind$1521;
            }
            properties$1517.push(property$1518);
            if (!match$1143('}')) {
                expect$1141(',');
            }
        }
        expect$1141('}');
        return delegate$1097.createObjectExpression(properties$1517);
    }
    function parseTemplateElement$1156(option$1524) {
        var token$1525 = scanTemplateElement$1129(option$1524);
        if (strict$1088 && token$1525.octal) {
            throwError$1138(token$1525, Messages$1083.StrictOctalLiteral);
        }
        return delegate$1097.createTemplateElement({
            raw: token$1525.value.raw,
            cooked: token$1525.value.cooked
        }, token$1525.tail);
    }
    function parseTemplateLiteral$1157() {
        var quasi$1526, quasis$1527, expressions$1528;
        quasi$1526 = parseTemplateElement$1156({ head: true });
        quasis$1527 = [quasi$1526];
        expressions$1528 = [];
        while (!quasi$1526.tail) {
            expressions$1528.push(parseExpression$1178());
            quasi$1526 = parseTemplateElement$1156({ head: false });
            quasis$1527.push(quasi$1526);
        }
        return delegate$1097.createTemplateLiteral(quasis$1527, expressions$1528);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1158() {
        var expr$1529;
        expect$1141('(');
        ++state$1102.parenthesizedCount;
        expr$1529 = parseExpression$1178();
        expect$1141(')');
        return expr$1529;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1159() {
        var type$1530, token$1531, resolvedIdent$1532;
        token$1531 = lookahead$1100;
        type$1530 = lookahead$1100.type;
        if (type$1530 === Token$1078.Identifier) {
            resolvedIdent$1532 = expander$1077.resolve(tokenStream$1098[lookaheadIndex$1101]);
            lex$1134();
            return delegate$1097.createIdentifier(resolvedIdent$1532);
        }
        if (type$1530 === Token$1078.StringLiteral || type$1530 === Token$1078.NumericLiteral) {
            if (strict$1088 && lookahead$1100.octal) {
                throwErrorTolerant$1139(lookahead$1100, Messages$1083.StrictOctalLiteral);
            }
            return delegate$1097.createLiteral(lex$1134());
        }
        if (type$1530 === Token$1078.Keyword) {
            if (matchKeyword$1144('this')) {
                lex$1134();
                return delegate$1097.createThisExpression();
            }
            if (matchKeyword$1144('function')) {
                return parseFunctionExpression$1216();
            }
            if (matchKeyword$1144('class')) {
                return parseClassExpression$1221();
            }
            if (matchKeyword$1144('super')) {
                lex$1134();
                return delegate$1097.createIdentifier('super');
            }
        }
        if (type$1530 === Token$1078.BooleanLiteral) {
            token$1531 = lex$1134();
            token$1531.value = token$1531.value === 'true';
            return delegate$1097.createLiteral(token$1531);
        }
        if (type$1530 === Token$1078.NullLiteral) {
            token$1531 = lex$1134();
            token$1531.value = null;
            return delegate$1097.createLiteral(token$1531);
        }
        if (match$1143('[')) {
            return parseArrayInitialiser$1150();
        }
        if (match$1143('{')) {
            return parseObjectInitialiser$1155();
        }
        if (match$1143('(')) {
            return parseGroupExpression$1158();
        }
        if (lookahead$1100.type === Token$1078.RegularExpression) {
            return delegate$1097.createLiteral(lex$1134());
        }
        if (type$1530 === Token$1078.Template) {
            return parseTemplateLiteral$1157();
        }
        return throwUnexpected$1140(lex$1134());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1160() {
        var args$1533 = [], arg$1534;
        expect$1141('(');
        if (!match$1143(')')) {
            while (streamIndex$1099 < length$1096) {
                arg$1534 = parseSpreadOrAssignmentExpression$1161();
                args$1533.push(arg$1534);
                if (match$1143(')')) {
                    break;
                } else if (arg$1534.type === Syntax$1081.SpreadElement) {
                    throwError$1138({}, Messages$1083.ElementAfterSpreadElement);
                }
                expect$1141(',');
            }
        }
        expect$1141(')');
        return args$1533;
    }
    function parseSpreadOrAssignmentExpression$1161() {
        if (match$1143('...')) {
            lex$1134();
            return delegate$1097.createSpreadElement(parseAssignmentExpression$1177());
        }
        return parseAssignmentExpression$1177();
    }
    function parseNonComputedProperty$1162() {
        var token$1535 = lex$1134();
        if (!isIdentifierName$1131(token$1535)) {
            throwUnexpected$1140(token$1535);
        }
        return delegate$1097.createIdentifier(token$1535.value);
    }
    function parseNonComputedMember$1163() {
        expect$1141('.');
        return parseNonComputedProperty$1162();
    }
    function parseComputedMember$1164() {
        var expr$1536;
        expect$1141('[');
        expr$1536 = parseExpression$1178();
        expect$1141(']');
        return expr$1536;
    }
    function parseNewExpression$1165() {
        var callee$1537, args$1538;
        expectKeyword$1142('new');
        callee$1537 = parseLeftHandSideExpression$1167();
        args$1538 = match$1143('(') ? parseArguments$1160() : [];
        return delegate$1097.createNewExpression(callee$1537, args$1538);
    }
    function parseLeftHandSideExpressionAllowCall$1166() {
        var expr$1539, args$1540, property$1541;
        expr$1539 = matchKeyword$1144('new') ? parseNewExpression$1165() : parsePrimaryExpression$1159();
        while (match$1143('.') || match$1143('[') || match$1143('(') || lookahead$1100.type === Token$1078.Template) {
            if (match$1143('(')) {
                args$1540 = parseArguments$1160();
                expr$1539 = delegate$1097.createCallExpression(expr$1539, args$1540);
            } else if (match$1143('[')) {
                expr$1539 = delegate$1097.createMemberExpression('[', expr$1539, parseComputedMember$1164());
            } else if (match$1143('.')) {
                expr$1539 = delegate$1097.createMemberExpression('.', expr$1539, parseNonComputedMember$1163());
            } else {
                expr$1539 = delegate$1097.createTaggedTemplateExpression(expr$1539, parseTemplateLiteral$1157());
            }
        }
        return expr$1539;
    }
    function parseLeftHandSideExpression$1167() {
        var expr$1542, property$1543;
        expr$1542 = matchKeyword$1144('new') ? parseNewExpression$1165() : parsePrimaryExpression$1159();
        while (match$1143('.') || match$1143('[') || lookahead$1100.type === Token$1078.Template) {
            if (match$1143('[')) {
                expr$1542 = delegate$1097.createMemberExpression('[', expr$1542, parseComputedMember$1164());
            } else if (match$1143('.')) {
                expr$1542 = delegate$1097.createMemberExpression('.', expr$1542, parseNonComputedMember$1163());
            } else {
                expr$1542 = delegate$1097.createTaggedTemplateExpression(expr$1542, parseTemplateLiteral$1157());
            }
        }
        return expr$1542;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1168() {
        var expr$1544 = parseLeftHandSideExpressionAllowCall$1166(), token$1545 = lookahead$1100;
        if (lookahead$1100.type !== Token$1078.Punctuator) {
            return expr$1544;
        }
        if ((match$1143('++') || match$1143('--')) && !peekLineTerminator$1137()) {
            // 11.3.1, 11.3.2
            if (strict$1088 && expr$1544.type === Syntax$1081.Identifier && isRestrictedWord$1115(expr$1544.name)) {
                throwErrorTolerant$1139({}, Messages$1083.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1148(expr$1544)) {
                throwError$1138({}, Messages$1083.InvalidLHSInAssignment);
            }
            token$1545 = lex$1134();
            expr$1544 = delegate$1097.createPostfixExpression(token$1545.value, expr$1544);
        }
        return expr$1544;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1169() {
        var token$1546, expr$1547;
        if (lookahead$1100.type !== Token$1078.Punctuator && lookahead$1100.type !== Token$1078.Keyword) {
            return parsePostfixExpression$1168();
        }
        if (match$1143('++') || match$1143('--')) {
            token$1546 = lex$1134();
            expr$1547 = parseUnaryExpression$1169();
            // 11.4.4, 11.4.5
            if (strict$1088 && expr$1547.type === Syntax$1081.Identifier && isRestrictedWord$1115(expr$1547.name)) {
                throwErrorTolerant$1139({}, Messages$1083.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1148(expr$1547)) {
                throwError$1138({}, Messages$1083.InvalidLHSInAssignment);
            }
            return delegate$1097.createUnaryExpression(token$1546.value, expr$1547);
        }
        if (match$1143('+') || match$1143('-') || match$1143('~') || match$1143('!')) {
            token$1546 = lex$1134();
            expr$1547 = parseUnaryExpression$1169();
            return delegate$1097.createUnaryExpression(token$1546.value, expr$1547);
        }
        if (matchKeyword$1144('delete') || matchKeyword$1144('void') || matchKeyword$1144('typeof')) {
            token$1546 = lex$1134();
            expr$1547 = parseUnaryExpression$1169();
            expr$1547 = delegate$1097.createUnaryExpression(token$1546.value, expr$1547);
            if (strict$1088 && expr$1547.operator === 'delete' && expr$1547.argument.type === Syntax$1081.Identifier) {
                throwErrorTolerant$1139({}, Messages$1083.StrictDelete);
            }
            return expr$1547;
        }
        return parsePostfixExpression$1168();
    }
    function binaryPrecedence$1170(token$1548, allowIn$1549) {
        var prec$1550 = 0;
        if (token$1548.type !== Token$1078.Punctuator && token$1548.type !== Token$1078.Keyword) {
            return 0;
        }
        switch (token$1548.value) {
        case '||':
            prec$1550 = 1;
            break;
        case '&&':
            prec$1550 = 2;
            break;
        case '|':
            prec$1550 = 3;
            break;
        case '^':
            prec$1550 = 4;
            break;
        case '&':
            prec$1550 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1550 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1550 = 7;
            break;
        case 'in':
            prec$1550 = allowIn$1549 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1550 = 8;
            break;
        case '+':
        case '-':
            prec$1550 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1550 = 11;
            break;
        default:
            break;
        }
        return prec$1550;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1171() {
        var expr$1551, token$1552, prec$1553, previousAllowIn$1554, stack$1555, right$1556, operator$1557, left$1558, i$1559;
        previousAllowIn$1554 = state$1102.allowIn;
        state$1102.allowIn = true;
        expr$1551 = parseUnaryExpression$1169();
        token$1552 = lookahead$1100;
        prec$1553 = binaryPrecedence$1170(token$1552, previousAllowIn$1554);
        if (prec$1553 === 0) {
            return expr$1551;
        }
        token$1552.prec = prec$1553;
        lex$1134();
        stack$1555 = [
            expr$1551,
            token$1552,
            parseUnaryExpression$1169()
        ];
        while ((prec$1553 = binaryPrecedence$1170(lookahead$1100, previousAllowIn$1554)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1555.length > 2 && prec$1553 <= stack$1555[stack$1555.length - 2].prec) {
                right$1556 = stack$1555.pop();
                operator$1557 = stack$1555.pop().value;
                left$1558 = stack$1555.pop();
                stack$1555.push(delegate$1097.createBinaryExpression(operator$1557, left$1558, right$1556));
            }
            // Shift.
            token$1552 = lex$1134();
            token$1552.prec = prec$1553;
            stack$1555.push(token$1552);
            stack$1555.push(parseUnaryExpression$1169());
        }
        state$1102.allowIn = previousAllowIn$1554;
        // Final reduce to clean-up the stack.
        i$1559 = stack$1555.length - 1;
        expr$1551 = stack$1555[i$1559];
        while (i$1559 > 1) {
            expr$1551 = delegate$1097.createBinaryExpression(stack$1555[i$1559 - 1].value, stack$1555[i$1559 - 2], expr$1551);
            i$1559 -= 2;
        }
        return expr$1551;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1172() {
        var expr$1560, previousAllowIn$1561, consequent$1562, alternate$1563;
        expr$1560 = parseBinaryExpression$1171();
        if (match$1143('?')) {
            lex$1134();
            previousAllowIn$1561 = state$1102.allowIn;
            state$1102.allowIn = true;
            consequent$1562 = parseAssignmentExpression$1177();
            state$1102.allowIn = previousAllowIn$1561;
            expect$1141(':');
            alternate$1563 = parseAssignmentExpression$1177();
            expr$1560 = delegate$1097.createConditionalExpression(expr$1560, consequent$1562, alternate$1563);
        }
        return expr$1560;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1173(expr$1564) {
        var i$1565, len$1566, property$1567, element$1568;
        if (expr$1564.type === Syntax$1081.ObjectExpression) {
            expr$1564.type = Syntax$1081.ObjectPattern;
            for (i$1565 = 0, len$1566 = expr$1564.properties.length; i$1565 < len$1566; i$1565 += 1) {
                property$1567 = expr$1564.properties[i$1565];
                if (property$1567.kind !== 'init') {
                    throwError$1138({}, Messages$1083.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1173(property$1567.value);
            }
        } else if (expr$1564.type === Syntax$1081.ArrayExpression) {
            expr$1564.type = Syntax$1081.ArrayPattern;
            for (i$1565 = 0, len$1566 = expr$1564.elements.length; i$1565 < len$1566; i$1565 += 1) {
                element$1568 = expr$1564.elements[i$1565];
                if (element$1568) {
                    reinterpretAsAssignmentBindingPattern$1173(element$1568);
                }
            }
        } else if (expr$1564.type === Syntax$1081.Identifier) {
            if (isRestrictedWord$1115(expr$1564.name)) {
                throwError$1138({}, Messages$1083.InvalidLHSInAssignment);
            }
        } else if (expr$1564.type === Syntax$1081.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1173(expr$1564.argument);
            if (expr$1564.argument.type === Syntax$1081.ObjectPattern) {
                throwError$1138({}, Messages$1083.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1564.type !== Syntax$1081.MemberExpression && expr$1564.type !== Syntax$1081.CallExpression && expr$1564.type !== Syntax$1081.NewExpression) {
                throwError$1138({}, Messages$1083.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1174(options$1569, expr$1570) {
        var i$1571, len$1572, property$1573, element$1574;
        if (expr$1570.type === Syntax$1081.ObjectExpression) {
            expr$1570.type = Syntax$1081.ObjectPattern;
            for (i$1571 = 0, len$1572 = expr$1570.properties.length; i$1571 < len$1572; i$1571 += 1) {
                property$1573 = expr$1570.properties[i$1571];
                if (property$1573.kind !== 'init') {
                    throwError$1138({}, Messages$1083.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1174(options$1569, property$1573.value);
            }
        } else if (expr$1570.type === Syntax$1081.ArrayExpression) {
            expr$1570.type = Syntax$1081.ArrayPattern;
            for (i$1571 = 0, len$1572 = expr$1570.elements.length; i$1571 < len$1572; i$1571 += 1) {
                element$1574 = expr$1570.elements[i$1571];
                if (element$1574) {
                    reinterpretAsDestructuredParameter$1174(options$1569, element$1574);
                }
            }
        } else if (expr$1570.type === Syntax$1081.Identifier) {
            validateParam$1212(options$1569, expr$1570, expr$1570.name);
        } else {
            if (expr$1570.type !== Syntax$1081.MemberExpression) {
                throwError$1138({}, Messages$1083.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1175(expressions$1575) {
        var i$1576, len$1577, param$1578, params$1579, defaults$1580, defaultCount$1581, options$1582, rest$1583;
        params$1579 = [];
        defaults$1580 = [];
        defaultCount$1581 = 0;
        rest$1583 = null;
        options$1582 = { paramSet: {} };
        for (i$1576 = 0, len$1577 = expressions$1575.length; i$1576 < len$1577; i$1576 += 1) {
            param$1578 = expressions$1575[i$1576];
            if (param$1578.type === Syntax$1081.Identifier) {
                params$1579.push(param$1578);
                defaults$1580.push(null);
                validateParam$1212(options$1582, param$1578, param$1578.name);
            } else if (param$1578.type === Syntax$1081.ObjectExpression || param$1578.type === Syntax$1081.ArrayExpression) {
                reinterpretAsDestructuredParameter$1174(options$1582, param$1578);
                params$1579.push(param$1578);
                defaults$1580.push(null);
            } else if (param$1578.type === Syntax$1081.SpreadElement) {
                assert$1104(i$1576 === len$1577 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1174(options$1582, param$1578.argument);
                rest$1583 = param$1578.argument;
            } else if (param$1578.type === Syntax$1081.AssignmentExpression) {
                params$1579.push(param$1578.left);
                defaults$1580.push(param$1578.right);
                ++defaultCount$1581;
                validateParam$1212(options$1582, param$1578.left, param$1578.left.name);
            } else {
                return null;
            }
        }
        if (options$1582.message === Messages$1083.StrictParamDupe) {
            throwError$1138(strict$1088 ? options$1582.stricted : options$1582.firstRestricted, options$1582.message);
        }
        if (defaultCount$1581 === 0) {
            defaults$1580 = [];
        }
        return {
            params: params$1579,
            defaults: defaults$1580,
            rest: rest$1583,
            stricted: options$1582.stricted,
            firstRestricted: options$1582.firstRestricted,
            message: options$1582.message
        };
    }
    function parseArrowFunctionExpression$1176(options$1584) {
        var previousStrict$1585, previousYieldAllowed$1586, body$1587;
        expect$1141('=>');
        previousStrict$1585 = strict$1088;
        previousYieldAllowed$1586 = state$1102.yieldAllowed;
        state$1102.yieldAllowed = false;
        body$1587 = parseConciseBody$1210();
        if (strict$1088 && options$1584.firstRestricted) {
            throwError$1138(options$1584.firstRestricted, options$1584.message);
        }
        if (strict$1088 && options$1584.stricted) {
            throwErrorTolerant$1139(options$1584.stricted, options$1584.message);
        }
        strict$1088 = previousStrict$1585;
        state$1102.yieldAllowed = previousYieldAllowed$1586;
        return delegate$1097.createArrowFunctionExpression(options$1584.params, options$1584.defaults, body$1587, options$1584.rest, body$1587.type !== Syntax$1081.BlockStatement);
    }
    function parseAssignmentExpression$1177() {
        var expr$1588, token$1589, params$1590, oldParenthesizedCount$1591;
        if (matchKeyword$1144('yield')) {
            return parseYieldExpression$1217();
        }
        oldParenthesizedCount$1591 = state$1102.parenthesizedCount;
        if (match$1143('(')) {
            token$1589 = lookahead2$1136();
            if (token$1589.type === Token$1078.Punctuator && token$1589.value === ')' || token$1589.value === '...') {
                params$1590 = parseParams$1214();
                if (!match$1143('=>')) {
                    throwUnexpected$1140(lex$1134());
                }
                return parseArrowFunctionExpression$1176(params$1590);
            }
        }
        token$1589 = lookahead$1100;
        expr$1588 = parseConditionalExpression$1172();
        if (match$1143('=>') && (state$1102.parenthesizedCount === oldParenthesizedCount$1591 || state$1102.parenthesizedCount === oldParenthesizedCount$1591 + 1)) {
            if (expr$1588.type === Syntax$1081.Identifier) {
                params$1590 = reinterpretAsCoverFormalsList$1175([expr$1588]);
            } else if (expr$1588.type === Syntax$1081.SequenceExpression) {
                params$1590 = reinterpretAsCoverFormalsList$1175(expr$1588.expressions);
            }
            if (params$1590) {
                return parseArrowFunctionExpression$1176(params$1590);
            }
        }
        if (matchAssign$1146()) {
            // 11.13.1
            if (strict$1088 && expr$1588.type === Syntax$1081.Identifier && isRestrictedWord$1115(expr$1588.name)) {
                throwErrorTolerant$1139(token$1589, Messages$1083.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1143('=') && (expr$1588.type === Syntax$1081.ObjectExpression || expr$1588.type === Syntax$1081.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1173(expr$1588);
            } else if (!isLeftHandSide$1148(expr$1588)) {
                throwError$1138({}, Messages$1083.InvalidLHSInAssignment);
            }
            expr$1588 = delegate$1097.createAssignmentExpression(lex$1134().value, expr$1588, parseAssignmentExpression$1177());
        }
        return expr$1588;
    }
    // 11.14 Comma Operator
    function parseExpression$1178() {
        var expr$1592, expressions$1593, sequence$1594, coverFormalsList$1595, spreadFound$1596, oldParenthesizedCount$1597;
        oldParenthesizedCount$1597 = state$1102.parenthesizedCount;
        expr$1592 = parseAssignmentExpression$1177();
        expressions$1593 = [expr$1592];
        if (match$1143(',')) {
            while (streamIndex$1099 < length$1096) {
                if (!match$1143(',')) {
                    break;
                }
                lex$1134();
                expr$1592 = parseSpreadOrAssignmentExpression$1161();
                expressions$1593.push(expr$1592);
                if (expr$1592.type === Syntax$1081.SpreadElement) {
                    spreadFound$1596 = true;
                    if (!match$1143(')')) {
                        throwError$1138({}, Messages$1083.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1594 = delegate$1097.createSequenceExpression(expressions$1593);
        }
        if (match$1143('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$1102.parenthesizedCount === oldParenthesizedCount$1597 || state$1102.parenthesizedCount === oldParenthesizedCount$1597 + 1) {
                expr$1592 = expr$1592.type === Syntax$1081.SequenceExpression ? expr$1592.expressions : expressions$1593;
                coverFormalsList$1595 = reinterpretAsCoverFormalsList$1175(expr$1592);
                if (coverFormalsList$1595) {
                    return parseArrowFunctionExpression$1176(coverFormalsList$1595);
                }
            }
            throwUnexpected$1140(lex$1134());
        }
        if (spreadFound$1596 && lookahead2$1136().value !== '=>') {
            throwError$1138({}, Messages$1083.IllegalSpread);
        }
        return sequence$1594 || expr$1592;
    }
    // 12.1 Block
    function parseStatementList$1179() {
        var list$1598 = [], statement$1599;
        while (streamIndex$1099 < length$1096) {
            if (match$1143('}')) {
                break;
            }
            statement$1599 = parseSourceElement$1224();
            if (typeof statement$1599 === 'undefined') {
                break;
            }
            list$1598.push(statement$1599);
        }
        return list$1598;
    }
    function parseBlock$1180() {
        var block$1600;
        expect$1141('{');
        block$1600 = parseStatementList$1179();
        expect$1141('}');
        return delegate$1097.createBlockStatement(block$1600);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1181() {
        var token$1601 = lookahead$1100, resolvedIdent$1602;
        if (token$1601.type !== Token$1078.Identifier) {
            throwUnexpected$1140(token$1601);
        }
        resolvedIdent$1602 = expander$1077.resolve(tokenStream$1098[lookaheadIndex$1101]);
        lex$1134();
        return delegate$1097.createIdentifier(resolvedIdent$1602);
    }
    function parseVariableDeclaration$1182(kind$1603) {
        var id$1604, init$1605 = null;
        if (match$1143('{')) {
            id$1604 = parseObjectInitialiser$1155();
            reinterpretAsAssignmentBindingPattern$1173(id$1604);
        } else if (match$1143('[')) {
            id$1604 = parseArrayInitialiser$1150();
            reinterpretAsAssignmentBindingPattern$1173(id$1604);
        } else {
            id$1604 = state$1102.allowKeyword ? parseNonComputedProperty$1162() : parseVariableIdentifier$1181();
            // 12.2.1
            if (strict$1088 && isRestrictedWord$1115(id$1604.name)) {
                throwErrorTolerant$1139({}, Messages$1083.StrictVarName);
            }
        }
        if (kind$1603 === 'const') {
            if (!match$1143('=')) {
                throwError$1138({}, Messages$1083.NoUnintializedConst);
            }
            expect$1141('=');
            init$1605 = parseAssignmentExpression$1177();
        } else if (match$1143('=')) {
            lex$1134();
            init$1605 = parseAssignmentExpression$1177();
        }
        return delegate$1097.createVariableDeclarator(id$1604, init$1605);
    }
    function parseVariableDeclarationList$1183(kind$1606) {
        var list$1607 = [];
        do {
            list$1607.push(parseVariableDeclaration$1182(kind$1606));
            if (!match$1143(',')) {
                break;
            }
            lex$1134();
        } while (streamIndex$1099 < length$1096);
        return list$1607;
    }
    function parseVariableStatement$1184() {
        var declarations$1608;
        expectKeyword$1142('var');
        declarations$1608 = parseVariableDeclarationList$1183();
        consumeSemicolon$1147();
        return delegate$1097.createVariableDeclaration(declarations$1608, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1185(kind$1609) {
        var declarations$1610;
        expectKeyword$1142(kind$1609);
        declarations$1610 = parseVariableDeclarationList$1183(kind$1609);
        consumeSemicolon$1147();
        return delegate$1097.createVariableDeclaration(declarations$1610, kind$1609);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1186() {
        var id$1611, src$1612, body$1613;
        lex$1134();
        // 'module'
        if (peekLineTerminator$1137()) {
            throwError$1138({}, Messages$1083.NewlineAfterModule);
        }
        switch (lookahead$1100.type) {
        case Token$1078.StringLiteral:
            id$1611 = parsePrimaryExpression$1159();
            body$1613 = parseModuleBlock$1229();
            src$1612 = null;
            break;
        case Token$1078.Identifier:
            id$1611 = parseVariableIdentifier$1181();
            body$1613 = null;
            if (!matchContextualKeyword$1145('from')) {
                throwUnexpected$1140(lex$1134());
            }
            lex$1134();
            src$1612 = parsePrimaryExpression$1159();
            if (src$1612.type !== Syntax$1081.Literal) {
                throwError$1138({}, Messages$1083.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1147();
        return delegate$1097.createModuleDeclaration(id$1611, src$1612, body$1613);
    }
    function parseExportBatchSpecifier$1187() {
        expect$1141('*');
        return delegate$1097.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1188() {
        var id$1614, name$1615 = null;
        id$1614 = parseVariableIdentifier$1181();
        if (matchContextualKeyword$1145('as')) {
            lex$1134();
            name$1615 = parseNonComputedProperty$1162();
        }
        return delegate$1097.createExportSpecifier(id$1614, name$1615);
    }
    function parseExportDeclaration$1189() {
        var previousAllowKeyword$1616, decl$1617, def$1618, src$1619, specifiers$1620;
        expectKeyword$1142('export');
        if (lookahead$1100.type === Token$1078.Keyword) {
            switch (lookahead$1100.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$1097.createExportDeclaration(parseSourceElement$1224(), null, null);
            }
        }
        if (isIdentifierName$1131(lookahead$1100)) {
            previousAllowKeyword$1616 = state$1102.allowKeyword;
            state$1102.allowKeyword = true;
            decl$1617 = parseVariableDeclarationList$1183('let');
            state$1102.allowKeyword = previousAllowKeyword$1616;
            return delegate$1097.createExportDeclaration(decl$1617, null, null);
        }
        specifiers$1620 = [];
        src$1619 = null;
        if (match$1143('*')) {
            specifiers$1620.push(parseExportBatchSpecifier$1187());
        } else {
            expect$1141('{');
            do {
                specifiers$1620.push(parseExportSpecifier$1188());
            } while (match$1143(',') && lex$1134());
            expect$1141('}');
        }
        if (matchContextualKeyword$1145('from')) {
            lex$1134();
            src$1619 = parsePrimaryExpression$1159();
            if (src$1619.type !== Syntax$1081.Literal) {
                throwError$1138({}, Messages$1083.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1147();
        return delegate$1097.createExportDeclaration(null, specifiers$1620, src$1619);
    }
    function parseImportDeclaration$1190() {
        var specifiers$1621, kind$1622, src$1623;
        expectKeyword$1142('import');
        specifiers$1621 = [];
        if (isIdentifierName$1131(lookahead$1100)) {
            kind$1622 = 'default';
            specifiers$1621.push(parseImportSpecifier$1191());
            if (!matchContextualKeyword$1145('from')) {
                throwError$1138({}, Messages$1083.NoFromAfterImport);
            }
            lex$1134();
        } else if (match$1143('{')) {
            kind$1622 = 'named';
            lex$1134();
            do {
                specifiers$1621.push(parseImportSpecifier$1191());
            } while (match$1143(',') && lex$1134());
            expect$1141('}');
            if (!matchContextualKeyword$1145('from')) {
                throwError$1138({}, Messages$1083.NoFromAfterImport);
            }
            lex$1134();
        }
        src$1623 = parsePrimaryExpression$1159();
        if (src$1623.type !== Syntax$1081.Literal) {
            throwError$1138({}, Messages$1083.InvalidModuleSpecifier);
        }
        consumeSemicolon$1147();
        return delegate$1097.createImportDeclaration(specifiers$1621, kind$1622, src$1623);
    }
    function parseImportSpecifier$1191() {
        var id$1624, name$1625 = null;
        id$1624 = parseNonComputedProperty$1162();
        if (matchContextualKeyword$1145('as')) {
            lex$1134();
            name$1625 = parseVariableIdentifier$1181();
        }
        return delegate$1097.createImportSpecifier(id$1624, name$1625);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1192() {
        expect$1141(';');
        return delegate$1097.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1193() {
        var expr$1626 = parseExpression$1178();
        consumeSemicolon$1147();
        return delegate$1097.createExpressionStatement(expr$1626);
    }
    // 12.5 If statement
    function parseIfStatement$1194() {
        var test$1627, consequent$1628, alternate$1629;
        expectKeyword$1142('if');
        expect$1141('(');
        test$1627 = parseExpression$1178();
        expect$1141(')');
        consequent$1628 = parseStatement$1209();
        if (matchKeyword$1144('else')) {
            lex$1134();
            alternate$1629 = parseStatement$1209();
        } else {
            alternate$1629 = null;
        }
        return delegate$1097.createIfStatement(test$1627, consequent$1628, alternate$1629);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1195() {
        var body$1630, test$1631, oldInIteration$1632;
        expectKeyword$1142('do');
        oldInIteration$1632 = state$1102.inIteration;
        state$1102.inIteration = true;
        body$1630 = parseStatement$1209();
        state$1102.inIteration = oldInIteration$1632;
        expectKeyword$1142('while');
        expect$1141('(');
        test$1631 = parseExpression$1178();
        expect$1141(')');
        if (match$1143(';')) {
            lex$1134();
        }
        return delegate$1097.createDoWhileStatement(body$1630, test$1631);
    }
    function parseWhileStatement$1196() {
        var test$1633, body$1634, oldInIteration$1635;
        expectKeyword$1142('while');
        expect$1141('(');
        test$1633 = parseExpression$1178();
        expect$1141(')');
        oldInIteration$1635 = state$1102.inIteration;
        state$1102.inIteration = true;
        body$1634 = parseStatement$1209();
        state$1102.inIteration = oldInIteration$1635;
        return delegate$1097.createWhileStatement(test$1633, body$1634);
    }
    function parseForVariableDeclaration$1197() {
        var token$1636 = lex$1134(), declarations$1637 = parseVariableDeclarationList$1183();
        return delegate$1097.createVariableDeclaration(declarations$1637, token$1636.value);
    }
    function parseForStatement$1198(opts$1638) {
        var init$1639, test$1640, update$1641, left$1642, right$1643, body$1644, operator$1645, oldInIteration$1646;
        init$1639 = test$1640 = update$1641 = null;
        expectKeyword$1142('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1145('each')) {
            throwError$1138({}, Messages$1083.EachNotAllowed);
        }
        expect$1141('(');
        if (match$1143(';')) {
            lex$1134();
        } else {
            if (matchKeyword$1144('var') || matchKeyword$1144('let') || matchKeyword$1144('const')) {
                state$1102.allowIn = false;
                init$1639 = parseForVariableDeclaration$1197();
                state$1102.allowIn = true;
                if (init$1639.declarations.length === 1) {
                    if (matchKeyword$1144('in') || matchContextualKeyword$1145('of')) {
                        operator$1645 = lookahead$1100;
                        if (!((operator$1645.value === 'in' || init$1639.kind !== 'var') && init$1639.declarations[0].init)) {
                            lex$1134();
                            left$1642 = init$1639;
                            right$1643 = parseExpression$1178();
                            init$1639 = null;
                        }
                    }
                }
            } else {
                state$1102.allowIn = false;
                init$1639 = parseExpression$1178();
                state$1102.allowIn = true;
                if (matchContextualKeyword$1145('of')) {
                    operator$1645 = lex$1134();
                    left$1642 = init$1639;
                    right$1643 = parseExpression$1178();
                    init$1639 = null;
                } else if (matchKeyword$1144('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1149(init$1639)) {
                        throwError$1138({}, Messages$1083.InvalidLHSInForIn);
                    }
                    operator$1645 = lex$1134();
                    left$1642 = init$1639;
                    right$1643 = parseExpression$1178();
                    init$1639 = null;
                }
            }
            if (typeof left$1642 === 'undefined') {
                expect$1141(';');
            }
        }
        if (typeof left$1642 === 'undefined') {
            if (!match$1143(';')) {
                test$1640 = parseExpression$1178();
            }
            expect$1141(';');
            if (!match$1143(')')) {
                update$1641 = parseExpression$1178();
            }
        }
        expect$1141(')');
        oldInIteration$1646 = state$1102.inIteration;
        state$1102.inIteration = true;
        if (!(opts$1638 !== undefined && opts$1638.ignoreBody)) {
            body$1644 = parseStatement$1209();
        }
        state$1102.inIteration = oldInIteration$1646;
        if (typeof left$1642 === 'undefined') {
            return delegate$1097.createForStatement(init$1639, test$1640, update$1641, body$1644);
        }
        if (operator$1645.value === 'in') {
            return delegate$1097.createForInStatement(left$1642, right$1643, body$1644);
        }
        return delegate$1097.createForOfStatement(left$1642, right$1643, body$1644);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1199() {
        var label$1647 = null, key$1648;
        expectKeyword$1142('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$1100.value.charCodeAt(0) === 59) {
            lex$1134();
            if (!state$1102.inIteration) {
                throwError$1138({}, Messages$1083.IllegalContinue);
            }
            return delegate$1097.createContinueStatement(null);
        }
        if (peekLineTerminator$1137()) {
            if (!state$1102.inIteration) {
                throwError$1138({}, Messages$1083.IllegalContinue);
            }
            return delegate$1097.createContinueStatement(null);
        }
        if (lookahead$1100.type === Token$1078.Identifier) {
            label$1647 = parseVariableIdentifier$1181();
            key$1648 = '$' + label$1647.name;
            if (!Object.prototype.hasOwnProperty.call(state$1102.labelSet, key$1648)) {
                throwError$1138({}, Messages$1083.UnknownLabel, label$1647.name);
            }
        }
        consumeSemicolon$1147();
        if (label$1647 === null && !state$1102.inIteration) {
            throwError$1138({}, Messages$1083.IllegalContinue);
        }
        return delegate$1097.createContinueStatement(label$1647);
    }
    // 12.8 The break statement
    function parseBreakStatement$1200() {
        var label$1649 = null, key$1650;
        expectKeyword$1142('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$1100.value.charCodeAt(0) === 59) {
            lex$1134();
            if (!(state$1102.inIteration || state$1102.inSwitch)) {
                throwError$1138({}, Messages$1083.IllegalBreak);
            }
            return delegate$1097.createBreakStatement(null);
        }
        if (peekLineTerminator$1137()) {
            if (!(state$1102.inIteration || state$1102.inSwitch)) {
                throwError$1138({}, Messages$1083.IllegalBreak);
            }
            return delegate$1097.createBreakStatement(null);
        }
        if (lookahead$1100.type === Token$1078.Identifier) {
            label$1649 = parseVariableIdentifier$1181();
            key$1650 = '$' + label$1649.name;
            if (!Object.prototype.hasOwnProperty.call(state$1102.labelSet, key$1650)) {
                throwError$1138({}, Messages$1083.UnknownLabel, label$1649.name);
            }
        }
        consumeSemicolon$1147();
        if (label$1649 === null && !(state$1102.inIteration || state$1102.inSwitch)) {
            throwError$1138({}, Messages$1083.IllegalBreak);
        }
        return delegate$1097.createBreakStatement(label$1649);
    }
    // 12.9 The return statement
    function parseReturnStatement$1201() {
        var argument$1651 = null;
        expectKeyword$1142('return');
        if (!state$1102.inFunctionBody) {
            throwErrorTolerant$1139({}, Messages$1083.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$1111(String(lookahead$1100.value).charCodeAt(0))) {
            argument$1651 = parseExpression$1178();
            consumeSemicolon$1147();
            return delegate$1097.createReturnStatement(argument$1651);
        }
        if (peekLineTerminator$1137()) {
            return delegate$1097.createReturnStatement(null);
        }
        if (!match$1143(';')) {
            if (!match$1143('}') && lookahead$1100.type !== Token$1078.EOF) {
                argument$1651 = parseExpression$1178();
            }
        }
        consumeSemicolon$1147();
        return delegate$1097.createReturnStatement(argument$1651);
    }
    // 12.10 The with statement
    function parseWithStatement$1202() {
        var object$1652, body$1653;
        if (strict$1088) {
            throwErrorTolerant$1139({}, Messages$1083.StrictModeWith);
        }
        expectKeyword$1142('with');
        expect$1141('(');
        object$1652 = parseExpression$1178();
        expect$1141(')');
        body$1653 = parseStatement$1209();
        return delegate$1097.createWithStatement(object$1652, body$1653);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1203() {
        var test$1654, consequent$1655 = [], sourceElement$1656;
        if (matchKeyword$1144('default')) {
            lex$1134();
            test$1654 = null;
        } else {
            expectKeyword$1142('case');
            test$1654 = parseExpression$1178();
        }
        expect$1141(':');
        while (streamIndex$1099 < length$1096) {
            if (match$1143('}') || matchKeyword$1144('default') || matchKeyword$1144('case')) {
                break;
            }
            sourceElement$1656 = parseSourceElement$1224();
            if (typeof sourceElement$1656 === 'undefined') {
                break;
            }
            consequent$1655.push(sourceElement$1656);
        }
        return delegate$1097.createSwitchCase(test$1654, consequent$1655);
    }
    function parseSwitchStatement$1204() {
        var discriminant$1657, cases$1658, clause$1659, oldInSwitch$1660, defaultFound$1661;
        expectKeyword$1142('switch');
        expect$1141('(');
        discriminant$1657 = parseExpression$1178();
        expect$1141(')');
        expect$1141('{');
        cases$1658 = [];
        if (match$1143('}')) {
            lex$1134();
            return delegate$1097.createSwitchStatement(discriminant$1657, cases$1658);
        }
        oldInSwitch$1660 = state$1102.inSwitch;
        state$1102.inSwitch = true;
        defaultFound$1661 = false;
        while (streamIndex$1099 < length$1096) {
            if (match$1143('}')) {
                break;
            }
            clause$1659 = parseSwitchCase$1203();
            if (clause$1659.test === null) {
                if (defaultFound$1661) {
                    throwError$1138({}, Messages$1083.MultipleDefaultsInSwitch);
                }
                defaultFound$1661 = true;
            }
            cases$1658.push(clause$1659);
        }
        state$1102.inSwitch = oldInSwitch$1660;
        expect$1141('}');
        return delegate$1097.createSwitchStatement(discriminant$1657, cases$1658);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1205() {
        var argument$1662;
        expectKeyword$1142('throw');
        if (peekLineTerminator$1137()) {
            throwError$1138({}, Messages$1083.NewlineAfterThrow);
        }
        argument$1662 = parseExpression$1178();
        consumeSemicolon$1147();
        return delegate$1097.createThrowStatement(argument$1662);
    }
    // 12.14 The try statement
    function parseCatchClause$1206() {
        var param$1663, body$1664;
        expectKeyword$1142('catch');
        expect$1141('(');
        if (match$1143(')')) {
            throwUnexpected$1140(lookahead$1100);
        }
        param$1663 = parseExpression$1178();
        // 12.14.1
        if (strict$1088 && param$1663.type === Syntax$1081.Identifier && isRestrictedWord$1115(param$1663.name)) {
            throwErrorTolerant$1139({}, Messages$1083.StrictCatchVariable);
        }
        expect$1141(')');
        body$1664 = parseBlock$1180();
        return delegate$1097.createCatchClause(param$1663, body$1664);
    }
    function parseTryStatement$1207() {
        var block$1665, handlers$1666 = [], finalizer$1667 = null;
        expectKeyword$1142('try');
        block$1665 = parseBlock$1180();
        if (matchKeyword$1144('catch')) {
            handlers$1666.push(parseCatchClause$1206());
        }
        if (matchKeyword$1144('finally')) {
            lex$1134();
            finalizer$1667 = parseBlock$1180();
        }
        if (handlers$1666.length === 0 && !finalizer$1667) {
            throwError$1138({}, Messages$1083.NoCatchOrFinally);
        }
        return delegate$1097.createTryStatement(block$1665, [], handlers$1666, finalizer$1667);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1208() {
        expectKeyword$1142('debugger');
        consumeSemicolon$1147();
        return delegate$1097.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1209() {
        var type$1668 = lookahead$1100.type, expr$1669, labeledBody$1670, key$1671;
        if (type$1668 === Token$1078.EOF) {
            throwUnexpected$1140(lookahead$1100);
        }
        if (type$1668 === Token$1078.Punctuator) {
            switch (lookahead$1100.value) {
            case ';':
                return parseEmptyStatement$1192();
            case '{':
                return parseBlock$1180();
            case '(':
                return parseExpressionStatement$1193();
            default:
                break;
            }
        }
        if (type$1668 === Token$1078.Keyword) {
            switch (lookahead$1100.value) {
            case 'break':
                return parseBreakStatement$1200();
            case 'continue':
                return parseContinueStatement$1199();
            case 'debugger':
                return parseDebuggerStatement$1208();
            case 'do':
                return parseDoWhileStatement$1195();
            case 'for':
                return parseForStatement$1198();
            case 'function':
                return parseFunctionDeclaration$1215();
            case 'class':
                return parseClassDeclaration$1222();
            case 'if':
                return parseIfStatement$1194();
            case 'return':
                return parseReturnStatement$1201();
            case 'switch':
                return parseSwitchStatement$1204();
            case 'throw':
                return parseThrowStatement$1205();
            case 'try':
                return parseTryStatement$1207();
            case 'var':
                return parseVariableStatement$1184();
            case 'while':
                return parseWhileStatement$1196();
            case 'with':
                return parseWithStatement$1202();
            default:
                break;
            }
        }
        expr$1669 = parseExpression$1178();
        // 12.12 Labelled Statements
        if (expr$1669.type === Syntax$1081.Identifier && match$1143(':')) {
            lex$1134();
            key$1671 = '$' + expr$1669.name;
            if (Object.prototype.hasOwnProperty.call(state$1102.labelSet, key$1671)) {
                throwError$1138({}, Messages$1083.Redeclaration, 'Label', expr$1669.name);
            }
            state$1102.labelSet[key$1671] = true;
            labeledBody$1670 = parseStatement$1209();
            delete state$1102.labelSet[key$1671];
            return delegate$1097.createLabeledStatement(expr$1669, labeledBody$1670);
        }
        consumeSemicolon$1147();
        return delegate$1097.createExpressionStatement(expr$1669);
    }
    // 13 Function Definition
    function parseConciseBody$1210() {
        if (match$1143('{')) {
            return parseFunctionSourceElements$1211();
        }
        return parseAssignmentExpression$1177();
    }
    function parseFunctionSourceElements$1211() {
        var sourceElement$1672, sourceElements$1673 = [], token$1674, directive$1675, firstRestricted$1676, oldLabelSet$1677, oldInIteration$1678, oldInSwitch$1679, oldInFunctionBody$1680, oldParenthesizedCount$1681;
        expect$1141('{');
        while (streamIndex$1099 < length$1096) {
            if (lookahead$1100.type !== Token$1078.StringLiteral) {
                break;
            }
            token$1674 = lookahead$1100;
            sourceElement$1672 = parseSourceElement$1224();
            sourceElements$1673.push(sourceElement$1672);
            if (sourceElement$1672.expression.type !== Syntax$1081.Literal) {
                // this is not directive
                break;
            }
            directive$1675 = token$1674.value;
            if (directive$1675 === 'use strict') {
                strict$1088 = true;
                if (firstRestricted$1676) {
                    throwErrorTolerant$1139(firstRestricted$1676, Messages$1083.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1676 && token$1674.octal) {
                    firstRestricted$1676 = token$1674;
                }
            }
        }
        oldLabelSet$1677 = state$1102.labelSet;
        oldInIteration$1678 = state$1102.inIteration;
        oldInSwitch$1679 = state$1102.inSwitch;
        oldInFunctionBody$1680 = state$1102.inFunctionBody;
        oldParenthesizedCount$1681 = state$1102.parenthesizedCount;
        state$1102.labelSet = {};
        state$1102.inIteration = false;
        state$1102.inSwitch = false;
        state$1102.inFunctionBody = true;
        state$1102.parenthesizedCount = 0;
        while (streamIndex$1099 < length$1096) {
            if (match$1143('}')) {
                break;
            }
            sourceElement$1672 = parseSourceElement$1224();
            if (typeof sourceElement$1672 === 'undefined') {
                break;
            }
            sourceElements$1673.push(sourceElement$1672);
        }
        expect$1141('}');
        state$1102.labelSet = oldLabelSet$1677;
        state$1102.inIteration = oldInIteration$1678;
        state$1102.inSwitch = oldInSwitch$1679;
        state$1102.inFunctionBody = oldInFunctionBody$1680;
        state$1102.parenthesizedCount = oldParenthesizedCount$1681;
        return delegate$1097.createBlockStatement(sourceElements$1673);
    }
    function validateParam$1212(options$1682, param$1683, name$1684) {
        var key$1685 = '$' + name$1684;
        if (strict$1088) {
            if (isRestrictedWord$1115(name$1684)) {
                options$1682.stricted = param$1683;
                options$1682.message = Messages$1083.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1682.paramSet, key$1685)) {
                options$1682.stricted = param$1683;
                options$1682.message = Messages$1083.StrictParamDupe;
            }
        } else if (!options$1682.firstRestricted) {
            if (isRestrictedWord$1115(name$1684)) {
                options$1682.firstRestricted = param$1683;
                options$1682.message = Messages$1083.StrictParamName;
            } else if (isStrictModeReservedWord$1114(name$1684)) {
                options$1682.firstRestricted = param$1683;
                options$1682.message = Messages$1083.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1682.paramSet, key$1685)) {
                options$1682.firstRestricted = param$1683;
                options$1682.message = Messages$1083.StrictParamDupe;
            }
        }
        options$1682.paramSet[key$1685] = true;
    }
    function parseParam$1213(options$1686) {
        var token$1687, rest$1688, param$1689, def$1690;
        token$1687 = lookahead$1100;
        if (token$1687.value === '...') {
            token$1687 = lex$1134();
            rest$1688 = true;
        }
        if (match$1143('[')) {
            param$1689 = parseArrayInitialiser$1150();
            reinterpretAsDestructuredParameter$1174(options$1686, param$1689);
        } else if (match$1143('{')) {
            if (rest$1688) {
                throwError$1138({}, Messages$1083.ObjectPatternAsRestParameter);
            }
            param$1689 = parseObjectInitialiser$1155();
            reinterpretAsDestructuredParameter$1174(options$1686, param$1689);
        } else {
            param$1689 = parseVariableIdentifier$1181();
            validateParam$1212(options$1686, token$1687, token$1687.value);
            if (match$1143('=')) {
                if (rest$1688) {
                    throwErrorTolerant$1139(lookahead$1100, Messages$1083.DefaultRestParameter);
                }
                lex$1134();
                def$1690 = parseAssignmentExpression$1177();
                ++options$1686.defaultCount;
            }
        }
        if (rest$1688) {
            if (!match$1143(')')) {
                throwError$1138({}, Messages$1083.ParameterAfterRestParameter);
            }
            options$1686.rest = param$1689;
            return false;
        }
        options$1686.params.push(param$1689);
        options$1686.defaults.push(def$1690);
        return !match$1143(')');
    }
    function parseParams$1214(firstRestricted$1691) {
        var options$1692;
        options$1692 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1691
        };
        expect$1141('(');
        if (!match$1143(')')) {
            options$1692.paramSet = {};
            while (streamIndex$1099 < length$1096) {
                if (!parseParam$1213(options$1692)) {
                    break;
                }
                expect$1141(',');
            }
        }
        expect$1141(')');
        if (options$1692.defaultCount === 0) {
            options$1692.defaults = [];
        }
        return options$1692;
    }
    function parseFunctionDeclaration$1215() {
        var id$1693, body$1694, token$1695, tmp$1696, firstRestricted$1697, message$1698, previousStrict$1699, previousYieldAllowed$1700, generator$1701, expression$1702;
        expectKeyword$1142('function');
        generator$1701 = false;
        if (match$1143('*')) {
            lex$1134();
            generator$1701 = true;
        }
        token$1695 = lookahead$1100;
        id$1693 = parseVariableIdentifier$1181();
        if (strict$1088) {
            if (isRestrictedWord$1115(token$1695.value)) {
                throwErrorTolerant$1139(token$1695, Messages$1083.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$1115(token$1695.value)) {
                firstRestricted$1697 = token$1695;
                message$1698 = Messages$1083.StrictFunctionName;
            } else if (isStrictModeReservedWord$1114(token$1695.value)) {
                firstRestricted$1697 = token$1695;
                message$1698 = Messages$1083.StrictReservedWord;
            }
        }
        tmp$1696 = parseParams$1214(firstRestricted$1697);
        firstRestricted$1697 = tmp$1696.firstRestricted;
        if (tmp$1696.message) {
            message$1698 = tmp$1696.message;
        }
        previousStrict$1699 = strict$1088;
        previousYieldAllowed$1700 = state$1102.yieldAllowed;
        state$1102.yieldAllowed = generator$1701;
        // here we redo some work in order to set 'expression'
        expression$1702 = !match$1143('{');
        body$1694 = parseConciseBody$1210();
        if (strict$1088 && firstRestricted$1697) {
            throwError$1138(firstRestricted$1697, message$1698);
        }
        if (strict$1088 && tmp$1696.stricted) {
            throwErrorTolerant$1139(tmp$1696.stricted, message$1698);
        }
        if (state$1102.yieldAllowed && !state$1102.yieldFound) {
            throwErrorTolerant$1139({}, Messages$1083.NoYieldInGenerator);
        }
        strict$1088 = previousStrict$1699;
        state$1102.yieldAllowed = previousYieldAllowed$1700;
        return delegate$1097.createFunctionDeclaration(id$1693, tmp$1696.params, tmp$1696.defaults, body$1694, tmp$1696.rest, generator$1701, expression$1702);
    }
    function parseFunctionExpression$1216() {
        var token$1703, id$1704 = null, firstRestricted$1705, message$1706, tmp$1707, body$1708, previousStrict$1709, previousYieldAllowed$1710, generator$1711, expression$1712;
        expectKeyword$1142('function');
        generator$1711 = false;
        if (match$1143('*')) {
            lex$1134();
            generator$1711 = true;
        }
        if (!match$1143('(')) {
            token$1703 = lookahead$1100;
            id$1704 = parseVariableIdentifier$1181();
            if (strict$1088) {
                if (isRestrictedWord$1115(token$1703.value)) {
                    throwErrorTolerant$1139(token$1703, Messages$1083.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$1115(token$1703.value)) {
                    firstRestricted$1705 = token$1703;
                    message$1706 = Messages$1083.StrictFunctionName;
                } else if (isStrictModeReservedWord$1114(token$1703.value)) {
                    firstRestricted$1705 = token$1703;
                    message$1706 = Messages$1083.StrictReservedWord;
                }
            }
        }
        tmp$1707 = parseParams$1214(firstRestricted$1705);
        firstRestricted$1705 = tmp$1707.firstRestricted;
        if (tmp$1707.message) {
            message$1706 = tmp$1707.message;
        }
        previousStrict$1709 = strict$1088;
        previousYieldAllowed$1710 = state$1102.yieldAllowed;
        state$1102.yieldAllowed = generator$1711;
        // here we redo some work in order to set 'expression'
        expression$1712 = !match$1143('{');
        body$1708 = parseConciseBody$1210();
        if (strict$1088 && firstRestricted$1705) {
            throwError$1138(firstRestricted$1705, message$1706);
        }
        if (strict$1088 && tmp$1707.stricted) {
            throwErrorTolerant$1139(tmp$1707.stricted, message$1706);
        }
        if (state$1102.yieldAllowed && !state$1102.yieldFound) {
            throwErrorTolerant$1139({}, Messages$1083.NoYieldInGenerator);
        }
        strict$1088 = previousStrict$1709;
        state$1102.yieldAllowed = previousYieldAllowed$1710;
        return delegate$1097.createFunctionExpression(id$1704, tmp$1707.params, tmp$1707.defaults, body$1708, tmp$1707.rest, generator$1711, expression$1712);
    }
    function parseYieldExpression$1217() {
        var delegateFlag$1713, expr$1714, previousYieldAllowed$1715;
        expectKeyword$1142('yield');
        if (!state$1102.yieldAllowed) {
            throwErrorTolerant$1139({}, Messages$1083.IllegalYield);
        }
        delegateFlag$1713 = false;
        if (match$1143('*')) {
            lex$1134();
            delegateFlag$1713 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1715 = state$1102.yieldAllowed;
        state$1102.yieldAllowed = false;
        expr$1714 = parseAssignmentExpression$1177();
        state$1102.yieldAllowed = previousYieldAllowed$1715;
        state$1102.yieldFound = true;
        return delegate$1097.createYieldExpression(expr$1714, delegateFlag$1713);
    }
    // 14 Classes
    function parseMethodDefinition$1218(existingPropNames$1716) {
        var token$1717, key$1718, param$1719, propType$1720, isValidDuplicateProp$1721 = false;
        if (lookahead$1100.value === 'static') {
            propType$1720 = ClassPropertyType$1086.static;
            lex$1134();
        } else {
            propType$1720 = ClassPropertyType$1086.prototype;
        }
        if (match$1143('*')) {
            lex$1134();
            return delegate$1097.createMethodDefinition(propType$1720, '', parseObjectPropertyKey$1153(), parsePropertyMethodFunction$1152({ generator: true }));
        }
        token$1717 = lookahead$1100;
        key$1718 = parseObjectPropertyKey$1153();
        if (token$1717.value === 'get' && !match$1143('(')) {
            key$1718 = parseObjectPropertyKey$1153();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1716[propType$1720].hasOwnProperty(key$1718.name)) {
                isValidDuplicateProp$1721 = existingPropNames$1716[propType$1720][key$1718.name].get === undefined && existingPropNames$1716[propType$1720][key$1718.name].data === undefined && existingPropNames$1716[propType$1720][key$1718.name].set !== undefined;
                if (!isValidDuplicateProp$1721) {
                    throwError$1138(key$1718, Messages$1083.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1716[propType$1720][key$1718.name] = {};
            }
            existingPropNames$1716[propType$1720][key$1718.name].get = true;
            expect$1141('(');
            expect$1141(')');
            return delegate$1097.createMethodDefinition(propType$1720, 'get', key$1718, parsePropertyFunction$1151({ generator: false }));
        }
        if (token$1717.value === 'set' && !match$1143('(')) {
            key$1718 = parseObjectPropertyKey$1153();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1716[propType$1720].hasOwnProperty(key$1718.name)) {
                isValidDuplicateProp$1721 = existingPropNames$1716[propType$1720][key$1718.name].set === undefined && existingPropNames$1716[propType$1720][key$1718.name].data === undefined && existingPropNames$1716[propType$1720][key$1718.name].get !== undefined;
                if (!isValidDuplicateProp$1721) {
                    throwError$1138(key$1718, Messages$1083.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1716[propType$1720][key$1718.name] = {};
            }
            existingPropNames$1716[propType$1720][key$1718.name].set = true;
            expect$1141('(');
            token$1717 = lookahead$1100;
            param$1719 = [parseVariableIdentifier$1181()];
            expect$1141(')');
            return delegate$1097.createMethodDefinition(propType$1720, 'set', key$1718, parsePropertyFunction$1151({
                params: param$1719,
                generator: false,
                name: token$1717
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1716[propType$1720].hasOwnProperty(key$1718.name)) {
            throwError$1138(key$1718, Messages$1083.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1716[propType$1720][key$1718.name] = {};
        }
        existingPropNames$1716[propType$1720][key$1718.name].data = true;
        return delegate$1097.createMethodDefinition(propType$1720, '', key$1718, parsePropertyMethodFunction$1152({ generator: false }));
    }
    function parseClassElement$1219(existingProps$1722) {
        if (match$1143(';')) {
            lex$1134();
            return;
        }
        return parseMethodDefinition$1218(existingProps$1722);
    }
    function parseClassBody$1220() {
        var classElement$1723, classElements$1724 = [], existingProps$1725 = {};
        existingProps$1725[ClassPropertyType$1086.static] = {};
        existingProps$1725[ClassPropertyType$1086.prototype] = {};
        expect$1141('{');
        while (streamIndex$1099 < length$1096) {
            if (match$1143('}')) {
                break;
            }
            classElement$1723 = parseClassElement$1219(existingProps$1725);
            if (typeof classElement$1723 !== 'undefined') {
                classElements$1724.push(classElement$1723);
            }
        }
        expect$1141('}');
        return delegate$1097.createClassBody(classElements$1724);
    }
    function parseClassExpression$1221() {
        var id$1726, previousYieldAllowed$1727, superClass$1728 = null;
        expectKeyword$1142('class');
        if (!matchKeyword$1144('extends') && !match$1143('{')) {
            id$1726 = parseVariableIdentifier$1181();
        }
        if (matchKeyword$1144('extends')) {
            expectKeyword$1142('extends');
            previousYieldAllowed$1727 = state$1102.yieldAllowed;
            state$1102.yieldAllowed = false;
            superClass$1728 = parseAssignmentExpression$1177();
            state$1102.yieldAllowed = previousYieldAllowed$1727;
        }
        return delegate$1097.createClassExpression(id$1726, superClass$1728, parseClassBody$1220());
    }
    function parseClassDeclaration$1222() {
        var id$1729, previousYieldAllowed$1730, superClass$1731 = null;
        expectKeyword$1142('class');
        id$1729 = parseVariableIdentifier$1181();
        if (matchKeyword$1144('extends')) {
            expectKeyword$1142('extends');
            previousYieldAllowed$1730 = state$1102.yieldAllowed;
            state$1102.yieldAllowed = false;
            superClass$1731 = parseAssignmentExpression$1177();
            state$1102.yieldAllowed = previousYieldAllowed$1730;
        }
        return delegate$1097.createClassDeclaration(id$1729, superClass$1731, parseClassBody$1220());
    }
    // 15 Program
    function matchModuleDeclaration$1223() {
        var id$1732;
        if (matchContextualKeyword$1145('module')) {
            id$1732 = lookahead2$1136();
            return id$1732.type === Token$1078.StringLiteral || id$1732.type === Token$1078.Identifier;
        }
        return false;
    }
    function parseSourceElement$1224() {
        if (lookahead$1100.type === Token$1078.Keyword) {
            switch (lookahead$1100.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1185(lookahead$1100.value);
            case 'function':
                return parseFunctionDeclaration$1215();
            case 'export':
                return parseExportDeclaration$1189();
            case 'import':
                return parseImportDeclaration$1190();
            default:
                return parseStatement$1209();
            }
        }
        if (matchModuleDeclaration$1223()) {
            throwError$1138({}, Messages$1083.NestedModule);
        }
        if (lookahead$1100.type !== Token$1078.EOF) {
            return parseStatement$1209();
        }
    }
    function parseProgramElement$1225() {
        if (lookahead$1100.type === Token$1078.Keyword) {
            switch (lookahead$1100.value) {
            case 'export':
                return parseExportDeclaration$1189();
            case 'import':
                return parseImportDeclaration$1190();
            }
        }
        if (matchModuleDeclaration$1223()) {
            return parseModuleDeclaration$1186();
        }
        return parseSourceElement$1224();
    }
    function parseProgramElements$1226() {
        var sourceElement$1733, sourceElements$1734 = [], token$1735, directive$1736, firstRestricted$1737;
        while (streamIndex$1099 < length$1096) {
            token$1735 = lookahead$1100;
            if (token$1735.type !== Token$1078.StringLiteral) {
                break;
            }
            sourceElement$1733 = parseProgramElement$1225();
            sourceElements$1734.push(sourceElement$1733);
            if (sourceElement$1733.expression.type !== Syntax$1081.Literal) {
                // this is not directive
                break;
            }
            directive$1736 = token$1735.value;
            if (directive$1736 === 'use strict') {
                strict$1088 = true;
                if (firstRestricted$1737) {
                    throwErrorTolerant$1139(firstRestricted$1737, Messages$1083.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1737 && token$1735.octal) {
                    firstRestricted$1737 = token$1735;
                }
            }
        }
        while (streamIndex$1099 < length$1096) {
            sourceElement$1733 = parseProgramElement$1225();
            if (typeof sourceElement$1733 === 'undefined') {
                break;
            }
            sourceElements$1734.push(sourceElement$1733);
        }
        return sourceElements$1734;
    }
    function parseModuleElement$1227() {
        return parseSourceElement$1224();
    }
    function parseModuleElements$1228() {
        var list$1738 = [], statement$1739;
        while (streamIndex$1099 < length$1096) {
            if (match$1143('}')) {
                break;
            }
            statement$1739 = parseModuleElement$1227();
            if (typeof statement$1739 === 'undefined') {
                break;
            }
            list$1738.push(statement$1739);
        }
        return list$1738;
    }
    function parseModuleBlock$1229() {
        var block$1740;
        expect$1141('{');
        block$1740 = parseModuleElements$1228();
        expect$1141('}');
        return delegate$1097.createBlockStatement(block$1740);
    }
    function parseProgram$1230() {
        var body$1741;
        strict$1088 = false;
        peek$1135();
        body$1741 = parseProgramElements$1226();
        return delegate$1097.createProgram(body$1741);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1231(type$1742, value$1743, start$1744, end$1745, loc$1746) {
        assert$1104(typeof start$1744 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$1103.comments.length > 0) {
            if (extra$1103.comments[extra$1103.comments.length - 1].range[1] > start$1744) {
                return;
            }
        }
        extra$1103.comments.push({
            type: type$1742,
            value: value$1743,
            range: [
                start$1744,
                end$1745
            ],
            loc: loc$1746
        });
    }
    function scanComment$1232() {
        var comment$1747, ch$1748, loc$1749, start$1750, blockComment$1751, lineComment$1752;
        comment$1747 = '';
        blockComment$1751 = false;
        lineComment$1752 = false;
        while (index$1089 < length$1096) {
            ch$1748 = source$1087[index$1089];
            if (lineComment$1752) {
                ch$1748 = source$1087[index$1089++];
                if (isLineTerminator$1110(ch$1748.charCodeAt(0))) {
                    loc$1749.end = {
                        line: lineNumber$1090,
                        column: index$1089 - lineStart$1091 - 1
                    };
                    lineComment$1752 = false;
                    addComment$1231('Line', comment$1747, start$1750, index$1089 - 1, loc$1749);
                    if (ch$1748 === '\r' && source$1087[index$1089] === '\n') {
                        ++index$1089;
                    }
                    ++lineNumber$1090;
                    lineStart$1091 = index$1089;
                    comment$1747 = '';
                } else if (index$1089 >= length$1096) {
                    lineComment$1752 = false;
                    comment$1747 += ch$1748;
                    loc$1749.end = {
                        line: lineNumber$1090,
                        column: length$1096 - lineStart$1091
                    };
                    addComment$1231('Line', comment$1747, start$1750, length$1096, loc$1749);
                } else {
                    comment$1747 += ch$1748;
                }
            } else if (blockComment$1751) {
                if (isLineTerminator$1110(ch$1748.charCodeAt(0))) {
                    if (ch$1748 === '\r' && source$1087[index$1089 + 1] === '\n') {
                        ++index$1089;
                        comment$1747 += '\r\n';
                    } else {
                        comment$1747 += ch$1748;
                    }
                    ++lineNumber$1090;
                    ++index$1089;
                    lineStart$1091 = index$1089;
                    if (index$1089 >= length$1096) {
                        throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1748 = source$1087[index$1089++];
                    if (index$1089 >= length$1096) {
                        throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1747 += ch$1748;
                    if (ch$1748 === '*') {
                        ch$1748 = source$1087[index$1089];
                        if (ch$1748 === '/') {
                            comment$1747 = comment$1747.substr(0, comment$1747.length - 1);
                            blockComment$1751 = false;
                            ++index$1089;
                            loc$1749.end = {
                                line: lineNumber$1090,
                                column: index$1089 - lineStart$1091
                            };
                            addComment$1231('Block', comment$1747, start$1750, index$1089, loc$1749);
                            comment$1747 = '';
                        }
                    }
                }
            } else if (ch$1748 === '/') {
                ch$1748 = source$1087[index$1089 + 1];
                if (ch$1748 === '/') {
                    loc$1749 = {
                        start: {
                            line: lineNumber$1090,
                            column: index$1089 - lineStart$1091
                        }
                    };
                    start$1750 = index$1089;
                    index$1089 += 2;
                    lineComment$1752 = true;
                    if (index$1089 >= length$1096) {
                        loc$1749.end = {
                            line: lineNumber$1090,
                            column: index$1089 - lineStart$1091
                        };
                        lineComment$1752 = false;
                        addComment$1231('Line', comment$1747, start$1750, index$1089, loc$1749);
                    }
                } else if (ch$1748 === '*') {
                    start$1750 = index$1089;
                    index$1089 += 2;
                    blockComment$1751 = true;
                    loc$1749 = {
                        start: {
                            line: lineNumber$1090,
                            column: index$1089 - lineStart$1091 - 2
                        }
                    };
                    if (index$1089 >= length$1096) {
                        throwError$1138({}, Messages$1083.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1109(ch$1748.charCodeAt(0))) {
                ++index$1089;
            } else if (isLineTerminator$1110(ch$1748.charCodeAt(0))) {
                ++index$1089;
                if (ch$1748 === '\r' && source$1087[index$1089] === '\n') {
                    ++index$1089;
                }
                ++lineNumber$1090;
                lineStart$1091 = index$1089;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1233() {
        var i$1753, entry$1754, comment$1755, comments$1756 = [];
        for (i$1753 = 0; i$1753 < extra$1103.comments.length; ++i$1753) {
            entry$1754 = extra$1103.comments[i$1753];
            comment$1755 = {
                type: entry$1754.type,
                value: entry$1754.value
            };
            if (extra$1103.range) {
                comment$1755.range = entry$1754.range;
            }
            if (extra$1103.loc) {
                comment$1755.loc = entry$1754.loc;
            }
            comments$1756.push(comment$1755);
        }
        extra$1103.comments = comments$1756;
    }
    function collectToken$1234() {
        var start$1757, loc$1758, token$1759, range$1760, value$1761;
        skipComment$1117();
        start$1757 = index$1089;
        loc$1758 = {
            start: {
                line: lineNumber$1090,
                column: index$1089 - lineStart$1091
            }
        };
        token$1759 = extra$1103.advance();
        loc$1758.end = {
            line: lineNumber$1090,
            column: index$1089 - lineStart$1091
        };
        if (token$1759.type !== Token$1078.EOF) {
            range$1760 = [
                token$1759.range[0],
                token$1759.range[1]
            ];
            value$1761 = source$1087.slice(token$1759.range[0], token$1759.range[1]);
            extra$1103.tokens.push({
                type: TokenName$1079[token$1759.type],
                value: value$1761,
                range: range$1760,
                loc: loc$1758
            });
        }
        return token$1759;
    }
    function collectRegex$1235() {
        var pos$1762, loc$1763, regex$1764, token$1765;
        skipComment$1117();
        pos$1762 = index$1089;
        loc$1763 = {
            start: {
                line: lineNumber$1090,
                column: index$1089 - lineStart$1091
            }
        };
        regex$1764 = extra$1103.scanRegExp();
        loc$1763.end = {
            line: lineNumber$1090,
            column: index$1089 - lineStart$1091
        };
        if (!extra$1103.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$1103.tokens.length > 0) {
                token$1765 = extra$1103.tokens[extra$1103.tokens.length - 1];
                if (token$1765.range[0] === pos$1762 && token$1765.type === 'Punctuator') {
                    if (token$1765.value === '/' || token$1765.value === '/=') {
                        extra$1103.tokens.pop();
                    }
                }
            }
            extra$1103.tokens.push({
                type: 'RegularExpression',
                value: regex$1764.literal,
                range: [
                    pos$1762,
                    index$1089
                ],
                loc: loc$1763
            });
        }
        return regex$1764;
    }
    function filterTokenLocation$1236() {
        var i$1766, entry$1767, token$1768, tokens$1769 = [];
        for (i$1766 = 0; i$1766 < extra$1103.tokens.length; ++i$1766) {
            entry$1767 = extra$1103.tokens[i$1766];
            token$1768 = {
                type: entry$1767.type,
                value: entry$1767.value
            };
            if (extra$1103.range) {
                token$1768.range = entry$1767.range;
            }
            if (extra$1103.loc) {
                token$1768.loc = entry$1767.loc;
            }
            tokens$1769.push(token$1768);
        }
        extra$1103.tokens = tokens$1769;
    }
    function LocationMarker$1237() {
        var sm_index$1770 = lookahead$1100 ? lookahead$1100.sm_range[0] : 0;
        var sm_lineStart$1771 = lookahead$1100 ? lookahead$1100.sm_lineStart : 0;
        var sm_lineNumber$1772 = lookahead$1100 ? lookahead$1100.sm_lineNumber : 1;
        this.range = [
            sm_index$1770,
            sm_index$1770
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1772,
                column: sm_index$1770 - sm_lineStart$1771
            },
            end: {
                line: sm_lineNumber$1772,
                column: sm_index$1770 - sm_lineStart$1771
            }
        };
    }
    LocationMarker$1237.prototype = {
        constructor: LocationMarker$1237,
        end: function () {
            this.range[1] = sm_index$1095;
            this.loc.end.line = sm_lineNumber$1092;
            this.loc.end.column = sm_index$1095 - sm_lineStart$1093;
        },
        applyGroup: function (node$1773) {
            if (extra$1103.range) {
                node$1773.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1103.loc) {
                node$1773.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1773 = delegate$1097.postProcess(node$1773);
            }
        },
        apply: function (node$1774) {
            var nodeType$1775 = typeof node$1774;
            assert$1104(nodeType$1775 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1775);
            if (extra$1103.range) {
                node$1774.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1103.loc) {
                node$1774.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1774 = delegate$1097.postProcess(node$1774);
            }
        }
    };
    function createLocationMarker$1238() {
        return new LocationMarker$1237();
    }
    function trackGroupExpression$1239() {
        var marker$1776, expr$1777;
        marker$1776 = createLocationMarker$1238();
        expect$1141('(');
        ++state$1102.parenthesizedCount;
        expr$1777 = parseExpression$1178();
        expect$1141(')');
        marker$1776.end();
        marker$1776.applyGroup(expr$1777);
        return expr$1777;
    }
    function trackLeftHandSideExpression$1240() {
        var marker$1778, expr$1779;
        // skipComment();
        marker$1778 = createLocationMarker$1238();
        expr$1779 = matchKeyword$1144('new') ? parseNewExpression$1165() : parsePrimaryExpression$1159();
        while (match$1143('.') || match$1143('[') || lookahead$1100.type === Token$1078.Template) {
            if (match$1143('[')) {
                expr$1779 = delegate$1097.createMemberExpression('[', expr$1779, parseComputedMember$1164());
                marker$1778.end();
                marker$1778.apply(expr$1779);
            } else if (match$1143('.')) {
                expr$1779 = delegate$1097.createMemberExpression('.', expr$1779, parseNonComputedMember$1163());
                marker$1778.end();
                marker$1778.apply(expr$1779);
            } else {
                expr$1779 = delegate$1097.createTaggedTemplateExpression(expr$1779, parseTemplateLiteral$1157());
                marker$1778.end();
                marker$1778.apply(expr$1779);
            }
        }
        return expr$1779;
    }
    function trackLeftHandSideExpressionAllowCall$1241() {
        var marker$1780, expr$1781, args$1782;
        // skipComment();
        marker$1780 = createLocationMarker$1238();
        expr$1781 = matchKeyword$1144('new') ? parseNewExpression$1165() : parsePrimaryExpression$1159();
        while (match$1143('.') || match$1143('[') || match$1143('(') || lookahead$1100.type === Token$1078.Template) {
            if (match$1143('(')) {
                args$1782 = parseArguments$1160();
                expr$1781 = delegate$1097.createCallExpression(expr$1781, args$1782);
                marker$1780.end();
                marker$1780.apply(expr$1781);
            } else if (match$1143('[')) {
                expr$1781 = delegate$1097.createMemberExpression('[', expr$1781, parseComputedMember$1164());
                marker$1780.end();
                marker$1780.apply(expr$1781);
            } else if (match$1143('.')) {
                expr$1781 = delegate$1097.createMemberExpression('.', expr$1781, parseNonComputedMember$1163());
                marker$1780.end();
                marker$1780.apply(expr$1781);
            } else {
                expr$1781 = delegate$1097.createTaggedTemplateExpression(expr$1781, parseTemplateLiteral$1157());
                marker$1780.end();
                marker$1780.apply(expr$1781);
            }
        }
        return expr$1781;
    }
    function filterGroup$1242(node$1783) {
        var n$1784, i$1785, entry$1786;
        n$1784 = Object.prototype.toString.apply(node$1783) === '[object Array]' ? [] : {};
        for (i$1785 in node$1783) {
            if (node$1783.hasOwnProperty(i$1785) && i$1785 !== 'groupRange' && i$1785 !== 'groupLoc') {
                entry$1786 = node$1783[i$1785];
                if (entry$1786 === null || typeof entry$1786 !== 'object' || entry$1786 instanceof RegExp) {
                    n$1784[i$1785] = entry$1786;
                } else {
                    n$1784[i$1785] = filterGroup$1242(entry$1786);
                }
            }
        }
        return n$1784;
    }
    function wrapTrackingFunction$1243(range$1787, loc$1788) {
        return function (parseFunction$1789) {
            function isBinary$1790(node$1792) {
                return node$1792.type === Syntax$1081.LogicalExpression || node$1792.type === Syntax$1081.BinaryExpression;
            }
            function visit$1791(node$1793) {
                var start$1794, end$1795;
                if (isBinary$1790(node$1793.left)) {
                    visit$1791(node$1793.left);
                }
                if (isBinary$1790(node$1793.right)) {
                    visit$1791(node$1793.right);
                }
                if (range$1787) {
                    if (node$1793.left.groupRange || node$1793.right.groupRange) {
                        start$1794 = node$1793.left.groupRange ? node$1793.left.groupRange[0] : node$1793.left.range[0];
                        end$1795 = node$1793.right.groupRange ? node$1793.right.groupRange[1] : node$1793.right.range[1];
                        node$1793.range = [
                            start$1794,
                            end$1795
                        ];
                    } else if (typeof node$1793.range === 'undefined') {
                        start$1794 = node$1793.left.range[0];
                        end$1795 = node$1793.right.range[1];
                        node$1793.range = [
                            start$1794,
                            end$1795
                        ];
                    }
                }
                if (loc$1788) {
                    if (node$1793.left.groupLoc || node$1793.right.groupLoc) {
                        start$1794 = node$1793.left.groupLoc ? node$1793.left.groupLoc.start : node$1793.left.loc.start;
                        end$1795 = node$1793.right.groupLoc ? node$1793.right.groupLoc.end : node$1793.right.loc.end;
                        node$1793.loc = {
                            start: start$1794,
                            end: end$1795
                        };
                        node$1793 = delegate$1097.postProcess(node$1793);
                    } else if (typeof node$1793.loc === 'undefined') {
                        node$1793.loc = {
                            start: node$1793.left.loc.start,
                            end: node$1793.right.loc.end
                        };
                        node$1793 = delegate$1097.postProcess(node$1793);
                    }
                }
            }
            return function () {
                var marker$1796, node$1797, curr$1798 = lookahead$1100;
                marker$1796 = createLocationMarker$1238();
                node$1797 = parseFunction$1789.apply(null, arguments);
                marker$1796.end();
                if (node$1797.type !== Syntax$1081.Program) {
                    if (curr$1798.leadingComments) {
                        node$1797.leadingComments = curr$1798.leadingComments;
                    }
                    if (curr$1798.trailingComments) {
                        node$1797.trailingComments = curr$1798.trailingComments;
                    }
                }
                if (range$1787 && typeof node$1797.range === 'undefined') {
                    marker$1796.apply(node$1797);
                }
                if (loc$1788 && typeof node$1797.loc === 'undefined') {
                    marker$1796.apply(node$1797);
                }
                if (isBinary$1790(node$1797)) {
                    visit$1791(node$1797);
                }
                return node$1797;
            };
        };
    }
    function patch$1244() {
        var wrapTracking$1799;
        if (extra$1103.comments) {
            extra$1103.skipComment = skipComment$1117;
            skipComment$1117 = scanComment$1232;
        }
        if (extra$1103.range || extra$1103.loc) {
            extra$1103.parseGroupExpression = parseGroupExpression$1158;
            extra$1103.parseLeftHandSideExpression = parseLeftHandSideExpression$1167;
            extra$1103.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1166;
            parseGroupExpression$1158 = trackGroupExpression$1239;
            parseLeftHandSideExpression$1167 = trackLeftHandSideExpression$1240;
            parseLeftHandSideExpressionAllowCall$1166 = trackLeftHandSideExpressionAllowCall$1241;
            wrapTracking$1799 = wrapTrackingFunction$1243(extra$1103.range, extra$1103.loc);
            extra$1103.parseArrayInitialiser = parseArrayInitialiser$1150;
            extra$1103.parseAssignmentExpression = parseAssignmentExpression$1177;
            extra$1103.parseBinaryExpression = parseBinaryExpression$1171;
            extra$1103.parseBlock = parseBlock$1180;
            extra$1103.parseFunctionSourceElements = parseFunctionSourceElements$1211;
            extra$1103.parseCatchClause = parseCatchClause$1206;
            extra$1103.parseComputedMember = parseComputedMember$1164;
            extra$1103.parseConditionalExpression = parseConditionalExpression$1172;
            extra$1103.parseConstLetDeclaration = parseConstLetDeclaration$1185;
            extra$1103.parseExportBatchSpecifier = parseExportBatchSpecifier$1187;
            extra$1103.parseExportDeclaration = parseExportDeclaration$1189;
            extra$1103.parseExportSpecifier = parseExportSpecifier$1188;
            extra$1103.parseExpression = parseExpression$1178;
            extra$1103.parseForVariableDeclaration = parseForVariableDeclaration$1197;
            extra$1103.parseFunctionDeclaration = parseFunctionDeclaration$1215;
            extra$1103.parseFunctionExpression = parseFunctionExpression$1216;
            extra$1103.parseParams = parseParams$1214;
            extra$1103.parseImportDeclaration = parseImportDeclaration$1190;
            extra$1103.parseImportSpecifier = parseImportSpecifier$1191;
            extra$1103.parseModuleDeclaration = parseModuleDeclaration$1186;
            extra$1103.parseModuleBlock = parseModuleBlock$1229;
            extra$1103.parseNewExpression = parseNewExpression$1165;
            extra$1103.parseNonComputedProperty = parseNonComputedProperty$1162;
            extra$1103.parseObjectInitialiser = parseObjectInitialiser$1155;
            extra$1103.parseObjectProperty = parseObjectProperty$1154;
            extra$1103.parseObjectPropertyKey = parseObjectPropertyKey$1153;
            extra$1103.parsePostfixExpression = parsePostfixExpression$1168;
            extra$1103.parsePrimaryExpression = parsePrimaryExpression$1159;
            extra$1103.parseProgram = parseProgram$1230;
            extra$1103.parsePropertyFunction = parsePropertyFunction$1151;
            extra$1103.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1161;
            extra$1103.parseTemplateElement = parseTemplateElement$1156;
            extra$1103.parseTemplateLiteral = parseTemplateLiteral$1157;
            extra$1103.parseStatement = parseStatement$1209;
            extra$1103.parseSwitchCase = parseSwitchCase$1203;
            extra$1103.parseUnaryExpression = parseUnaryExpression$1169;
            extra$1103.parseVariableDeclaration = parseVariableDeclaration$1182;
            extra$1103.parseVariableIdentifier = parseVariableIdentifier$1181;
            extra$1103.parseMethodDefinition = parseMethodDefinition$1218;
            extra$1103.parseClassDeclaration = parseClassDeclaration$1222;
            extra$1103.parseClassExpression = parseClassExpression$1221;
            extra$1103.parseClassBody = parseClassBody$1220;
            parseArrayInitialiser$1150 = wrapTracking$1799(extra$1103.parseArrayInitialiser);
            parseAssignmentExpression$1177 = wrapTracking$1799(extra$1103.parseAssignmentExpression);
            parseBinaryExpression$1171 = wrapTracking$1799(extra$1103.parseBinaryExpression);
            parseBlock$1180 = wrapTracking$1799(extra$1103.parseBlock);
            parseFunctionSourceElements$1211 = wrapTracking$1799(extra$1103.parseFunctionSourceElements);
            parseCatchClause$1206 = wrapTracking$1799(extra$1103.parseCatchClause);
            parseComputedMember$1164 = wrapTracking$1799(extra$1103.parseComputedMember);
            parseConditionalExpression$1172 = wrapTracking$1799(extra$1103.parseConditionalExpression);
            parseConstLetDeclaration$1185 = wrapTracking$1799(extra$1103.parseConstLetDeclaration);
            parseExportBatchSpecifier$1187 = wrapTracking$1799(parseExportBatchSpecifier$1187);
            parseExportDeclaration$1189 = wrapTracking$1799(parseExportDeclaration$1189);
            parseExportSpecifier$1188 = wrapTracking$1799(parseExportSpecifier$1188);
            parseExpression$1178 = wrapTracking$1799(extra$1103.parseExpression);
            parseForVariableDeclaration$1197 = wrapTracking$1799(extra$1103.parseForVariableDeclaration);
            parseFunctionDeclaration$1215 = wrapTracking$1799(extra$1103.parseFunctionDeclaration);
            parseFunctionExpression$1216 = wrapTracking$1799(extra$1103.parseFunctionExpression);
            parseParams$1214 = wrapTracking$1799(extra$1103.parseParams);
            parseImportDeclaration$1190 = wrapTracking$1799(extra$1103.parseImportDeclaration);
            parseImportSpecifier$1191 = wrapTracking$1799(extra$1103.parseImportSpecifier);
            parseModuleDeclaration$1186 = wrapTracking$1799(extra$1103.parseModuleDeclaration);
            parseModuleBlock$1229 = wrapTracking$1799(extra$1103.parseModuleBlock);
            parseLeftHandSideExpression$1167 = wrapTracking$1799(parseLeftHandSideExpression$1167);
            parseNewExpression$1165 = wrapTracking$1799(extra$1103.parseNewExpression);
            parseNonComputedProperty$1162 = wrapTracking$1799(extra$1103.parseNonComputedProperty);
            parseObjectInitialiser$1155 = wrapTracking$1799(extra$1103.parseObjectInitialiser);
            parseObjectProperty$1154 = wrapTracking$1799(extra$1103.parseObjectProperty);
            parseObjectPropertyKey$1153 = wrapTracking$1799(extra$1103.parseObjectPropertyKey);
            parsePostfixExpression$1168 = wrapTracking$1799(extra$1103.parsePostfixExpression);
            parsePrimaryExpression$1159 = wrapTracking$1799(extra$1103.parsePrimaryExpression);
            parseProgram$1230 = wrapTracking$1799(extra$1103.parseProgram);
            parsePropertyFunction$1151 = wrapTracking$1799(extra$1103.parsePropertyFunction);
            parseTemplateElement$1156 = wrapTracking$1799(extra$1103.parseTemplateElement);
            parseTemplateLiteral$1157 = wrapTracking$1799(extra$1103.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1161 = wrapTracking$1799(extra$1103.parseSpreadOrAssignmentExpression);
            parseStatement$1209 = wrapTracking$1799(extra$1103.parseStatement);
            parseSwitchCase$1203 = wrapTracking$1799(extra$1103.parseSwitchCase);
            parseUnaryExpression$1169 = wrapTracking$1799(extra$1103.parseUnaryExpression);
            parseVariableDeclaration$1182 = wrapTracking$1799(extra$1103.parseVariableDeclaration);
            parseVariableIdentifier$1181 = wrapTracking$1799(extra$1103.parseVariableIdentifier);
            parseMethodDefinition$1218 = wrapTracking$1799(extra$1103.parseMethodDefinition);
            parseClassDeclaration$1222 = wrapTracking$1799(extra$1103.parseClassDeclaration);
            parseClassExpression$1221 = wrapTracking$1799(extra$1103.parseClassExpression);
            parseClassBody$1220 = wrapTracking$1799(extra$1103.parseClassBody);
        }
        if (typeof extra$1103.tokens !== 'undefined') {
            extra$1103.advance = advance$1133;
            extra$1103.scanRegExp = scanRegExp$1130;
            advance$1133 = collectToken$1234;
            scanRegExp$1130 = collectRegex$1235;
        }
    }
    function unpatch$1245() {
        if (typeof extra$1103.skipComment === 'function') {
            skipComment$1117 = extra$1103.skipComment;
        }
        if (extra$1103.range || extra$1103.loc) {
            parseArrayInitialiser$1150 = extra$1103.parseArrayInitialiser;
            parseAssignmentExpression$1177 = extra$1103.parseAssignmentExpression;
            parseBinaryExpression$1171 = extra$1103.parseBinaryExpression;
            parseBlock$1180 = extra$1103.parseBlock;
            parseFunctionSourceElements$1211 = extra$1103.parseFunctionSourceElements;
            parseCatchClause$1206 = extra$1103.parseCatchClause;
            parseComputedMember$1164 = extra$1103.parseComputedMember;
            parseConditionalExpression$1172 = extra$1103.parseConditionalExpression;
            parseConstLetDeclaration$1185 = extra$1103.parseConstLetDeclaration;
            parseExportBatchSpecifier$1187 = extra$1103.parseExportBatchSpecifier;
            parseExportDeclaration$1189 = extra$1103.parseExportDeclaration;
            parseExportSpecifier$1188 = extra$1103.parseExportSpecifier;
            parseExpression$1178 = extra$1103.parseExpression;
            parseForVariableDeclaration$1197 = extra$1103.parseForVariableDeclaration;
            parseFunctionDeclaration$1215 = extra$1103.parseFunctionDeclaration;
            parseFunctionExpression$1216 = extra$1103.parseFunctionExpression;
            parseImportDeclaration$1190 = extra$1103.parseImportDeclaration;
            parseImportSpecifier$1191 = extra$1103.parseImportSpecifier;
            parseGroupExpression$1158 = extra$1103.parseGroupExpression;
            parseLeftHandSideExpression$1167 = extra$1103.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1166 = extra$1103.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1186 = extra$1103.parseModuleDeclaration;
            parseModuleBlock$1229 = extra$1103.parseModuleBlock;
            parseNewExpression$1165 = extra$1103.parseNewExpression;
            parseNonComputedProperty$1162 = extra$1103.parseNonComputedProperty;
            parseObjectInitialiser$1155 = extra$1103.parseObjectInitialiser;
            parseObjectProperty$1154 = extra$1103.parseObjectProperty;
            parseObjectPropertyKey$1153 = extra$1103.parseObjectPropertyKey;
            parsePostfixExpression$1168 = extra$1103.parsePostfixExpression;
            parsePrimaryExpression$1159 = extra$1103.parsePrimaryExpression;
            parseProgram$1230 = extra$1103.parseProgram;
            parsePropertyFunction$1151 = extra$1103.parsePropertyFunction;
            parseTemplateElement$1156 = extra$1103.parseTemplateElement;
            parseTemplateLiteral$1157 = extra$1103.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1161 = extra$1103.parseSpreadOrAssignmentExpression;
            parseStatement$1209 = extra$1103.parseStatement;
            parseSwitchCase$1203 = extra$1103.parseSwitchCase;
            parseUnaryExpression$1169 = extra$1103.parseUnaryExpression;
            parseVariableDeclaration$1182 = extra$1103.parseVariableDeclaration;
            parseVariableIdentifier$1181 = extra$1103.parseVariableIdentifier;
            parseMethodDefinition$1218 = extra$1103.parseMethodDefinition;
            parseClassDeclaration$1222 = extra$1103.parseClassDeclaration;
            parseClassExpression$1221 = extra$1103.parseClassExpression;
            parseClassBody$1220 = extra$1103.parseClassBody;
        }
        if (typeof extra$1103.scanRegExp === 'function') {
            advance$1133 = extra$1103.advance;
            scanRegExp$1130 = extra$1103.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1246(object$1800, properties$1801) {
        var entry$1802, result$1803 = {};
        for (entry$1802 in object$1800) {
            if (object$1800.hasOwnProperty(entry$1802)) {
                result$1803[entry$1802] = object$1800[entry$1802];
            }
        }
        for (entry$1802 in properties$1801) {
            if (properties$1801.hasOwnProperty(entry$1802)) {
                result$1803[entry$1802] = properties$1801[entry$1802];
            }
        }
        return result$1803;
    }
    function tokenize$1247(code$1804, options$1805) {
        var toString$1806, token$1807, tokens$1808;
        toString$1806 = String;
        if (typeof code$1804 !== 'string' && !(code$1804 instanceof String)) {
            code$1804 = toString$1806(code$1804);
        }
        delegate$1097 = SyntaxTreeDelegate$1085;
        source$1087 = code$1804;
        index$1089 = 0;
        lineNumber$1090 = source$1087.length > 0 ? 1 : 0;
        lineStart$1091 = 0;
        length$1096 = source$1087.length;
        lookahead$1100 = null;
        state$1102 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$1103 = {};
        // Options matching.
        options$1805 = options$1805 || {};
        // Of course we collect tokens here.
        options$1805.tokens = true;
        extra$1103.tokens = [];
        extra$1103.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$1103.openParenToken = -1;
        extra$1103.openCurlyToken = -1;
        extra$1103.range = typeof options$1805.range === 'boolean' && options$1805.range;
        extra$1103.loc = typeof options$1805.loc === 'boolean' && options$1805.loc;
        if (typeof options$1805.comment === 'boolean' && options$1805.comment) {
            extra$1103.comments = [];
        }
        if (typeof options$1805.tolerant === 'boolean' && options$1805.tolerant) {
            extra$1103.errors = [];
        }
        if (length$1096 > 0) {
            if (typeof source$1087[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1804 instanceof String) {
                    source$1087 = code$1804.valueOf();
                }
            }
        }
        patch$1244();
        try {
            peek$1135();
            if (lookahead$1100.type === Token$1078.EOF) {
                return extra$1103.tokens;
            }
            token$1807 = lex$1134();
            while (lookahead$1100.type !== Token$1078.EOF) {
                try {
                    token$1807 = lex$1134();
                } catch (lexError$1809) {
                    token$1807 = lookahead$1100;
                    if (extra$1103.errors) {
                        extra$1103.errors.push(lexError$1809);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1809;
                    }
                }
            }
            filterTokenLocation$1236();
            tokens$1808 = extra$1103.tokens;
            if (typeof extra$1103.comments !== 'undefined') {
                filterCommentLocation$1233();
                tokens$1808.comments = extra$1103.comments;
            }
            if (typeof extra$1103.errors !== 'undefined') {
                tokens$1808.errors = extra$1103.errors;
            }
        } catch (e$1810) {
            throw e$1810;
        } finally {
            unpatch$1245();
            extra$1103 = {};
        }
        return tokens$1808;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1248(toks$1811, start$1812, inExprDelim$1813, parentIsBlock$1814) {
        var assignOps$1815 = [
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
        var binaryOps$1816 = [
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
        var unaryOps$1817 = [
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
        function back$1818(n$1819) {
            var idx$1820 = toks$1811.length - n$1819 > 0 ? toks$1811.length - n$1819 : 0;
            return toks$1811[idx$1820];
        }
        if (inExprDelim$1813 && toks$1811.length - (start$1812 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1818(start$1812 + 2).value === ':' && parentIsBlock$1814) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$1105(back$1818(start$1812 + 2).value, unaryOps$1817.concat(binaryOps$1816).concat(assignOps$1815))) {
            // ... + {...}
            return false;
        } else if (back$1818(start$1812 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1821 = typeof back$1818(start$1812 + 1).startLineNumber !== 'undefined' ? back$1818(start$1812 + 1).startLineNumber : back$1818(start$1812 + 1).lineNumber;
            if (back$1818(start$1812 + 2).lineNumber !== currLineNumber$1821) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$1105(back$1818(start$1812 + 2).value, [
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
    // Read the next token. Takes the previously read tokens, a
    // boolean indicating if the parent delimiter is () or [], and a
    // boolean indicating if the parent delimiter is {} a block
    function readToken$1249(toks$1822, inExprDelim$1823, parentIsBlock$1824) {
        var delimiters$1825 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1826 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1827 = toks$1822.length - 1;
        var comments$1828, commentsLen$1829 = extra$1103.comments.length;
        function back$1830(n$1834) {
            var idx$1835 = toks$1822.length - n$1834 > 0 ? toks$1822.length - n$1834 : 0;
            return toks$1822[idx$1835];
        }
        function attachComments$1831(token$1836) {
            if (comments$1828) {
                token$1836.leadingComments = comments$1828;
            }
            return token$1836;
        }
        function _advance$1832() {
            return attachComments$1831(advance$1133());
        }
        function _scanRegExp$1833() {
            return attachComments$1831(scanRegExp$1130());
        }
        skipComment$1117();
        if (extra$1103.comments.length > commentsLen$1829) {
            comments$1828 = extra$1103.comments.slice(commentsLen$1829);
        }
        if (isIn$1105(source$1087[index$1089], delimiters$1825)) {
            return attachComments$1831(readDelim$1250(toks$1822, inExprDelim$1823, parentIsBlock$1824));
        }
        if (source$1087[index$1089] === '/') {
            var prev$1837 = back$1830(1);
            if (prev$1837) {
                if (prev$1837.value === '()') {
                    if (isIn$1105(back$1830(2).value, parenIdents$1826)) {
                        // ... if (...) / ...
                        return _scanRegExp$1833();
                    }
                    // ... (...) / ...
                    return _advance$1832();
                }
                if (prev$1837.value === '{}') {
                    if (blockAllowed$1248(toks$1822, 0, inExprDelim$1823, parentIsBlock$1824)) {
                        if (back$1830(2).value === '()') {
                            // named function
                            if (back$1830(4).value === 'function') {
                                if (!blockAllowed$1248(toks$1822, 3, inExprDelim$1823, parentIsBlock$1824)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1832();
                                }
                                if (toks$1822.length - 5 <= 0 && inExprDelim$1823) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1832();
                                }
                            }
                            // unnamed function
                            if (back$1830(3).value === 'function') {
                                if (!blockAllowed$1248(toks$1822, 2, inExprDelim$1823, parentIsBlock$1824)) {
                                    // new function (...) {...} / ...
                                    return _advance$1832();
                                }
                                if (toks$1822.length - 4 <= 0 && inExprDelim$1823) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1832();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1833();
                    } else {
                        // ... + {...} / ...
                        return _advance$1832();
                    }
                }
                if (prev$1837.type === Token$1078.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1833();
                }
                if (isKeyword$1116(prev$1837.value)) {
                    // typeof /...
                    return _scanRegExp$1833();
                }
                return _advance$1832();
            }
            return _scanRegExp$1833();
        }
        return _advance$1832();
    }
    function readDelim$1250(toks$1838, inExprDelim$1839, parentIsBlock$1840) {
        var startDelim$1841 = advance$1133(), matchDelim$1842 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1843 = [];
        var delimiters$1844 = [
                '(',
                '{',
                '['
            ];
        assert$1104(delimiters$1844.indexOf(startDelim$1841.value) !== -1, 'Need to begin at the delimiter');
        var token$1845 = startDelim$1841;
        var startLineNumber$1846 = token$1845.lineNumber;
        var startLineStart$1847 = token$1845.lineStart;
        var startRange$1848 = token$1845.range;
        var delimToken$1849 = {};
        delimToken$1849.type = Token$1078.Delimiter;
        delimToken$1849.value = startDelim$1841.value + matchDelim$1842[startDelim$1841.value];
        delimToken$1849.startLineNumber = startLineNumber$1846;
        delimToken$1849.startLineStart = startLineStart$1847;
        delimToken$1849.startRange = startRange$1848;
        var delimIsBlock$1850 = false;
        if (startDelim$1841.value === '{') {
            delimIsBlock$1850 = blockAllowed$1248(toks$1838.concat(delimToken$1849), 0, inExprDelim$1839, parentIsBlock$1840);
        }
        while (index$1089 <= length$1096) {
            token$1845 = readToken$1249(inner$1843, startDelim$1841.value === '(' || startDelim$1841.value === '[', delimIsBlock$1850);
            if (token$1845.type === Token$1078.Punctuator && token$1845.value === matchDelim$1842[startDelim$1841.value]) {
                if (token$1845.leadingComments) {
                    delimToken$1849.trailingComments = token$1845.leadingComments;
                }
                break;
            } else if (token$1845.type === Token$1078.EOF) {
                throwError$1138({}, Messages$1083.UnexpectedEOS);
            } else {
                inner$1843.push(token$1845);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$1089 >= length$1096 && matchDelim$1842[startDelim$1841.value] !== source$1087[length$1096 - 1]) {
            throwError$1138({}, Messages$1083.UnexpectedEOS);
        }
        var endLineNumber$1851 = token$1845.lineNumber;
        var endLineStart$1852 = token$1845.lineStart;
        var endRange$1853 = token$1845.range;
        delimToken$1849.inner = inner$1843;
        delimToken$1849.endLineNumber = endLineNumber$1851;
        delimToken$1849.endLineStart = endLineStart$1852;
        delimToken$1849.endRange = endRange$1853;
        return delimToken$1849;
    }
    // (Str) -> [...CSyntax]
    function read$1251(code$1854) {
        var token$1855, tokenTree$1856 = [];
        extra$1103 = {};
        extra$1103.comments = [];
        patch$1244();
        source$1087 = code$1854;
        index$1089 = 0;
        lineNumber$1090 = source$1087.length > 0 ? 1 : 0;
        lineStart$1091 = 0;
        length$1096 = source$1087.length;
        state$1102 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$1089 < length$1096) {
            tokenTree$1856.push(readToken$1249(tokenTree$1856, false, false));
        }
        var last$1857 = tokenTree$1856[tokenTree$1856.length - 1];
        if (last$1857 && last$1857.type !== Token$1078.EOF) {
            tokenTree$1856.push({
                type: Token$1078.EOF,
                value: '',
                lineNumber: last$1857.lineNumber,
                lineStart: last$1857.lineStart,
                range: [
                    index$1089,
                    index$1089
                ]
            });
        }
        return expander$1077.tokensToSyntax(tokenTree$1856);
    }
    function parse$1252(code$1858, options$1859) {
        var program$1860, toString$1861;
        extra$1103 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1858)) {
            tokenStream$1098 = code$1858;
            length$1096 = tokenStream$1098.length;
            lineNumber$1090 = tokenStream$1098.length > 0 ? 1 : 0;
            source$1087 = undefined;
        } else {
            toString$1861 = String;
            if (typeof code$1858 !== 'string' && !(code$1858 instanceof String)) {
                code$1858 = toString$1861(code$1858);
            }
            source$1087 = code$1858;
            length$1096 = source$1087.length;
            lineNumber$1090 = source$1087.length > 0 ? 1 : 0;
        }
        delegate$1097 = SyntaxTreeDelegate$1085;
        streamIndex$1099 = -1;
        index$1089 = 0;
        lineStart$1091 = 0;
        sm_lineStart$1093 = 0;
        sm_lineNumber$1092 = lineNumber$1090;
        sm_index$1095 = 0;
        sm_range$1094 = [
            0,
            0
        ];
        lookahead$1100 = null;
        state$1102 = {
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
        if (typeof options$1859 !== 'undefined') {
            extra$1103.range = typeof options$1859.range === 'boolean' && options$1859.range;
            extra$1103.loc = typeof options$1859.loc === 'boolean' && options$1859.loc;
            if (extra$1103.loc && options$1859.source !== null && options$1859.source !== undefined) {
                delegate$1097 = extend$1246(delegate$1097, {
                    'postProcess': function (node$1862) {
                        node$1862.loc.source = toString$1861(options$1859.source);
                        return node$1862;
                    }
                });
            }
            if (typeof options$1859.tokens === 'boolean' && options$1859.tokens) {
                extra$1103.tokens = [];
            }
            if (typeof options$1859.comment === 'boolean' && options$1859.comment) {
                extra$1103.comments = [];
            }
            if (typeof options$1859.tolerant === 'boolean' && options$1859.tolerant) {
                extra$1103.errors = [];
            }
        }
        if (length$1096 > 0) {
            if (source$1087 && typeof source$1087[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1858 instanceof String) {
                    source$1087 = code$1858.valueOf();
                }
            }
        }
        extra$1103 = { loc: true };
        patch$1244();
        try {
            program$1860 = parseProgram$1230();
            if (typeof extra$1103.comments !== 'undefined') {
                filterCommentLocation$1233();
                program$1860.comments = extra$1103.comments;
            }
            if (typeof extra$1103.tokens !== 'undefined') {
                filterTokenLocation$1236();
                program$1860.tokens = extra$1103.tokens;
            }
            if (typeof extra$1103.errors !== 'undefined') {
                program$1860.errors = extra$1103.errors;
            }
            if (extra$1103.range || extra$1103.loc) {
                program$1860.body = filterGroup$1242(program$1860.body);
            }
        } catch (e$1863) {
            throw e$1863;
        } finally {
            unpatch$1245();
            extra$1103 = {};
        }
        return program$1860;
    }
    exports$1076.tokenize = tokenize$1247;
    exports$1076.read = read$1251;
    exports$1076.Token = Token$1078;
    exports$1076.parse = parse$1252;
    // Deep copy.
    exports$1076.Syntax = function () {
        var name$1864, types$1865 = {};
        if (typeof Object.create === 'function') {
            types$1865 = Object.create(null);
        }
        for (name$1864 in Syntax$1081) {
            if (Syntax$1081.hasOwnProperty(name$1864)) {
                types$1865[name$1864] = Syntax$1081[name$1864];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1865);
        }
        return types$1865;
    }();
}));
//# sourceMappingURL=parser.js.map